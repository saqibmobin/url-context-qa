
import { useState, useEffect, useRef } from "react";
import { AlertCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/types";

interface MessageItemProps {
  message: Message;
  isLast: boolean;
}

const MessageItem = ({ message, isLast }: MessageItemProps) => {
  const [visible, setVisible] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  const isUser = message.role === 'user';
  const hasError = message.content.includes("Error:");

  return (
    <div 
      ref={messageRef}
      className={cn(
        "flex gap-3 transition-opacity duration-500 ease-in-out",
        visible ? "opacity-100" : "opacity-0",
        isLast && "animate-slide-up"
      )}
    >
      <div 
        className={cn(
          "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "glass-panel-sm"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : hasError ? (
          <AlertCircle className="h-4 w-4 text-destructive" />
        ) : (
          <svg
            viewBox="0 0 24 24"
            height="16"
            width="16" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary"
          >
            <path
              d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <path
              d="M14.5 9a2.5 2.5 0 00-5 0v6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <path
              d="M9.5 15h5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        )}
      </div>
      
      <div 
        className={cn(
          "py-3 px-4 rounded-lg mb-2 text-sm leading-relaxed text-balance max-w-full overflow-hidden",
          isUser ? "bg-muted" : "glass-panel-sm bg-white/40 dark:bg-black/40",
          hasError ? "text-destructive border border-destructive/20" : ""
        )}
      >
        {message.content}
      </div>
    </div>
  );
};

export default MessageItem;
