import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { AudioUploader } from "@/components/AudioUploader";

interface MessageInputProps {
  onSendMessage: (content: string, messageType?: string, audioUrl?: string) => void;
  isLoading?: boolean;
}

const quickActions = [
  "Show patient list",
  "Care requirements summary", 
  "Upcoming appointments"
];

export function MessageInput({ onSendMessage, isLoading = false }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleAudioUploaded = (audioUrl: string) => {
    onSendMessage("🎤 Voice message", "audio", audioUrl);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleQuickAction = (action: string) => {
    setMessage(action);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="border-t border-gray-100 p-4 bg-white">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3 items-end">
          <AudioUploader 
            onAudioUploaded={handleAudioUploaded} 
            disabled={isLoading}
          />
          <div className="flex-1">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about patient care, requirements, or any healthcare management question..."
                className="resize-none rounded-2xl border border-gray-200 p-4 pr-12 focus:ring-2 focus:ring-care-blue focus:border-transparent transition-all duration-200 max-h-32 min-h-[50px]"
                rows={1}
              />
              
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim() || isLoading}
                className="absolute right-2 bottom-2 w-8 h-8 bg-care-blue hover:bg-blue-600 text-white rounded-full p-0 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </form>
      
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mt-3">
        {quickActions.map((action) => (
          <Button
            key={action}
            variant="secondary"
            size="sm"
            onClick={() => handleQuickAction(action)}
            className="px-3 py-1.5 bg-care-gray text-care-gray-dark rounded-full text-xs hover:bg-gray-200 transition-colors duration-200"
          >
            {action}
          </Button>
        ))}
      </div>
    </div>
  );
}
