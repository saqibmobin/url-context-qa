
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import MessageItem from "./MessageItem";
import { Message, ProcessingStatus } from "@/types";
import { cn } from "@/lib/utils";
import { Send, AlertCircle } from "lucide-react";
import { generateAnswer } from "@/utils/urlProcessor";
import { GeminiService } from "@/utils/geminiService";
import { nanoid } from 'nanoid';

interface ChatInterfaceProps {
  context: string;
  processingStatus: ProcessingStatus;
  disabled?: boolean;
}

const ChatInterface = ({ context, processingStatus, disabled = false }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendQuestion = async () => {
    if (!question.trim() || isGenerating) return;

    // Add user question to messages
    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content: question,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setQuestion("");
    setIsGenerating(true);

    try {
      // Create chat history for context
      const chatHistory = messages
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

      // Generate answer
      const { answer, error } = await generateAnswer(
        userMessage.content,
        context,
        chatHistory
      );

      // Add response to messages
      const assistantMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: error ? `Error: ${error}` : answer,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error generating answer:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: "Error: Failed to generate an answer. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
  };

  const noUrlsIngested = processingStatus === ProcessingStatus.Idle || processingStatus === ProcessingStatus.Error;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-1 py-4 space-y-4">
        {messages.length > 0 ? (
          <>
            {messages.map((message, index) => (
              <MessageItem 
                key={message.id} 
                message={message} 
                isLast={index === messages.length - 1}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-sm mx-auto glass-panel-sm p-6 rounded-xl">
              {noUrlsIngested ? (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">No Context Loaded</h3>
                  <p className="text-muted-foreground text-sm">
                    Please ingest at least one URL to build context before asking questions.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <Send className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">Context Loaded</h3>
                  <p className="text-muted-foreground text-sm">
                    Start asking questions about the content from your ingested URLs.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="border-t bg-background/80 backdrop-blur-sm pt-4">
        <div className="relative">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              noUrlsIngested
                ? "Please ingest URLs before asking questions..."
                : "Ask a question about the content from your URLs..."
            }
            className="resize-none pr-20 min-h-[80px] max-h-[200px] transition-all duration-200 focus-visible:ring-1 focus-visible:ring-ring"
            disabled={isGenerating || noUrlsIngested || disabled}
          />
          
          <Button
            className={cn(
              "absolute bottom-3 right-3 px-3 gap-1.5 h-9 transition-all duration-200",
              isGenerating && "animate-pulse-subtle"
            )}
            size="sm"
            onClick={handleSendQuestion}
            disabled={!question.trim() || isGenerating || noUrlsIngested || disabled}
          >
            <Send className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
