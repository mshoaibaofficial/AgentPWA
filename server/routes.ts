import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertConversationSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      
      const user = await storage.createUser(userData);
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Validation error" });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const isValidPassword = await storage.verifyPassword(loginData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is deactivated" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Validation error" });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Conversation routes
  app.get("/api/conversations/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const conversations = await storage.getConversationsByUserId(userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const conversationData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(conversationData);
      res.json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Validation error" });
      }
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  // Message routes
  app.get("/api/messages/:conversationId", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await storage.getMessagesByConversationId(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      
      // If it's a user message, generate AI response
      if (messageData.isFromUser) {
        let contentForAI = messageData.content;
        
        // If it's an audio message, send the public URL to AgentForce
        if (messageData.messageType === "audio" && messageData.audioUrl) {
          // Create public URL for AgentForce to access
          const baseUrl = process.env.REPLIT_DEV_DOMAIN ? 
            `https://${process.env.REPLIT_DEV_DOMAIN}` : 'http://localhost:5000';
          contentForAI = `Audio message: ${baseUrl}${messageData.audioUrl}`;
        }
        
        // Get AI response from AgentForce
        const aiResponseContent = await generateAIResponse(contentForAI, messageData.messageType, messageData.conversationId);
        
        const aiMessage = await storage.createMessage({
          conversationId: messageData.conversationId,
          content: aiResponseContent,
          isFromUser: false,
          messageType: "text"
        });
        
        res.json({ userMessage: message, aiMessage });
      } else {
        res.json({ message });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Validation error" });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Audio upload routes
  app.post("/api/audio/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.post("/api/audio/process", async (req, res) => {
    try {
      const { audioURL } = req.body;
      if (!audioURL) {
        return res.status(400).json({ error: "audioURL is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const audioPath = objectStorageService.normalizeObjectEntityPath(audioURL);
      
      res.json({ audioPath });
    } catch (error) {
      console.error("Error processing audio:", error);
      res.status(500).json({ error: "Failed to process audio" });
    }
  });

  // Serve audio files
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // AgentForce callback endpoint - receives responses from your AI
  app.post("/api/agentforce/callback", async (req, res) => {
    try {
      const { message_id, response, error } = req.body;
      
      if (!message_id) {
        return res.status(400).json({ error: "message_id is required" });
      }
      
      const pending = pendingResponses.get(message_id);
      if (!pending) {
        return res.status(404).json({ error: "Message not found or already processed" });
      }
      
      // Clean up and resolve
      pendingResponses.delete(message_id);
      
      if (error) {
        pending.resolve("I apologize, but I encountered an error processing your request. Please try again.");
      } else {
        pending.resolve(response || "I received your message but didn't get a response. Please try again.");
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error handling AgentForce callback:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Store pending AI responses
const pendingResponses = new Map<string, { conversationId: string; resolve: (response: string) => void }>();

// Send message to AgentForce and wait for response
async function generateAIResponse(userMessage: string, messageType?: string, conversationId?: string): Promise<string> {
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const agentforceUrl = "https://api-f1db6c.stack.tryrelevance.com/latest/agents/hooks/custom-trigger/e7c394c5-f7a3-4655-ab31-eb43eee010a9/da344acf-0036-444e-8c63-5d3970015b94";
  
  // Get the callback URL (use REPLIT_DEV_DOMAIN if available)
  const callbackUrl = process.env.REPLIT_DEV_DOMAIN ? 
    `https://${process.env.REPLIT_DEV_DOMAIN}/api/agentforce/callback` : 
    "http://localhost:5000/api/agentforce/callback";
  
  try {
    // Prepare webhook payload
    const webhookPayload: any = {
      message_id: messageId,
      conversation_id: conversationId,
      content: userMessage,
      message_type: messageType || "text",
      timestamp: new Date().toISOString(),
      callback_url: callbackUrl
    };
    
    // For audio messages, extract audio URL from the content
    if (messageType === "audio" && userMessage.includes("Audio message:")) {
      const audioUrlMatch = userMessage.match(/Audio message: (.+)/);
      if (audioUrlMatch) {
        webhookPayload.audio_url = audioUrlMatch[1];
      }
    }
    
    console.log("Sending webhook to AgentForce:", { messageId, conversationId, messageType });
    
    // Send webhook to AgentForce
    const webhookResponse = await fetch(agentforceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    });
    
    if (!webhookResponse.ok) {
      console.error("AgentForce webhook failed:", webhookResponse.status, webhookResponse.statusText);
      return "I'm having trouble connecting to the AI system. Please try again in a moment.";
    }
    
    console.log("Webhook sent successfully, waiting for response...");
    
    // Wait for the callback response (with timeout)
    return new Promise((resolve) => {
      // Store the promise resolver
      pendingResponses.set(messageId, { conversationId: conversationId || '', resolve });
      
      // Set a timeout in case AgentForce doesn't respond
      setTimeout(() => {
        if (pendingResponses.has(messageId)) {
          pendingResponses.delete(messageId);
          resolve("I'm taking longer than usual to process your request. Please try asking again.");
        }
      }, 30000); // 30 second timeout
    });
    
  } catch (error) {
    console.error("Error calling AgentForce:", error);
    return "I'm having trouble processing your request right now. Please try again.";
  }
}
