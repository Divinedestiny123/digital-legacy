"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";

export type Message = {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
};

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  placeholder?: string;
}

export default function ChatInterface({ messages, onSendMessage, isLoading, placeholder = "Type your message..." }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput("");
    await onSendMessage(userMessage);
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-2xl overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.filter(m => m.role !== "system").map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.role === "user" ? "bg-muted text-foreground" : "bg-foreground text-background"
            }`}>
              {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-light leading-relaxed border border-white/5 ${
              msg.role === "user" 
                ? "bg-foreground/10 text-foreground rounded-tr-none backdrop-blur-sm" 
                : "bg-black/30 text-foreground rounded-tl-none backdrop-blur-md"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-4 flex-row">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-foreground text-background">
              <Bot size={16} />
            </div>
            <div className="glass-panel text-foreground rounded-2xl rounded-tl-none px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/20 border-t border-white/5 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="relative flex items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={placeholder}
            className="w-full max-h-32 min-h-[56px] bg-black/40 border border-white/10 rounded-2xl pl-4 pr-14 py-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent transition-all resize-none overflow-y-auto font-light backdrop-blur-sm placeholder:text-muted-foreground/70"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 p-2 rounded-xl bg-foreground text-background hover:bg-muted-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
