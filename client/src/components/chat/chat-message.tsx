import { Message } from "@shared/schema";
import { CheckCircle, User } from "lucide-react";
import { AuthService } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { user } = useAuth();
  
  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((dateObj.getTime() - Date.now()) / (1000 * 60)),
      'minute'
    );
  };

  if (message.isFromUser) {
    return (
      <div className="flex justify-end space-x-3 animate-fade-in">
        <div className="flex-1">
          <div className="flex justify-end">
            <div className="chat-bubble-user rounded-2xl rounded-tr-md p-4 max-w-xs md:max-w-md">
              {message.messageType === "audio" && message.audioUrl ? (
                <div className="space-y-2">
                  <audio controls className="w-full">
                    <source src={message.audioUrl} type="audio/webm" />
                    <source src={message.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  <p className="text-white text-xs opacity-80">{message.content}</p>
                </div>
              ) : (
                <p className="text-white text-sm">{message.content}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-care-gray-dark mt-1 mr-2 text-right">
            {formatTime(message.createdAt)}
          </p>
        </div>
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-care-blue-light flex items-center justify-center">
            {user ? (
              <span className="text-white text-xs font-medium">
                {AuthService.getUserInitials(user)}
              </span>
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex space-x-3 animate-fade-in">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-care-blue flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="flex-1">
        <div className="chat-bubble-ai rounded-2xl rounded-tl-md p-4 max-w-xs md:max-w-md">
          {message.messageType === "audio" && message.audioUrl ? (
            <div className="space-y-2">
              <audio controls className="w-full">
                <source src={message.audioUrl} type="audio/webm" />
                <source src={message.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <p className="text-gray-800 text-xs opacity-80">{message.content}</p>
            </div>
          ) : (
            <p className="text-gray-800 text-sm">{message.content}</p>
          )}
        </div>
        <p className="text-xs text-care-gray-dark mt-1 ml-2">
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
