import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/chat/chat-message";
import { MessageInput } from "@/components/chat/message-input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Message, Conversation } from "@shared/schema";

export default function ChatPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Get or create a conversation for the user
  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations', user?.id],
    enabled: !!user?.id,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages', currentConversationId],
    enabled: !!currentConversationId,
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/conversations", {
        userId: user?.id,
        title: "New Conversation"
      });
      return response.json();
    },
    onSuccess: (conversation: Conversation) => {
      setCurrentConversationId(conversation.id);
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, messageType, audioUrl }: { content: string, messageType?: string, audioUrl?: string }) => {
      const response = await apiRequest("POST", "/api/messages", {
        conversationId: currentConversationId,
        content,
        isFromUser: true,
        messageType: messageType || "text",
        audioUrl
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', currentConversationId] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize conversation on first load
  useEffect(() => {
    if (user && conversations && conversations.length > 0 && !currentConversationId) {
      setCurrentConversationId(conversations[0].id);
    } else if (user && conversations && conversations.length === 0 && !currentConversationId) {
      createConversationMutation.mutate();
    }
  }, [user, conversations, currentConversationId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (content: string, messageType?: string, audioUrl?: string) => {
    if (currentConversationId) {
      sendMessageMutation.mutate({ 
        content, 
        messageType: messageType || "text", 
        audioUrl 
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
  };

  const isOnline = true; // In production, implement actual online status

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-care-blue rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Care Manager Co-pilot</h1>
              <p className="text-xs text-care-gray-dark">AI Assistant for Healthcare</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-care-green animate-pulse-subtle' : 'bg-gray-400'}`}></div>
              <span className="text-xs text-care-gray-dark">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-care-gray transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 text-care-gray-dark" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Chat Container */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto h-screen">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !messagesLoading ? (
            /* Welcome Message */
            <div className="flex justify-center py-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gradient-to-br from-care-blue to-care-blue-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Care Manager Co-pilot</h2>
                <p className="text-care-gray-dark text-sm">
                  I'm your AI assistant for healthcare management. Ask me about patient data, care requirements, or any care management questions.
                </p>
              </div>
            </div>
          ) : (
            /* Messages */
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          
          {/* Typing Indicator */}
          {sendMessageMutation.isPending && (
            <div className="flex space-x-3 animate-fade-in">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-care-blue flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="chat-bubble-ai rounded-2xl rounded-tl-md p-4 max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-care-gray-dark rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-care-gray-dark rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-care-gray-dark rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input */}
        <MessageInput 
          onSendMessage={handleSendMessage} 
          isLoading={sendMessageMutation.isPending}
        />
      </main>
    </div>
  );
}
