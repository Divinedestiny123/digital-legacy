"use client";

import { useState, useEffect } from "react";
import ChatInterface, { Message } from "@/components/ChatInterface";
import { useUser } from "@/components/UserProvider";

const INITIAL_MESSAGES: Message[] = [
  {
    id: "sys-1",
    role: "system",
    content: "You are an AI capturing the essence of the user to build their digital legacy. Ask questions one at a time. Keep it conversational."
  },
  {
    id: "msg-1",
    role: "assistant",
    content: "Hello. I'm here to learn how you think, speak, and see the world. Let's start simple: What is a minor, completely insignificant everyday inconvenience that absolutely infuriates you? Go off on it."
  }
];

export default function AITrainingPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        try {
          const res = await fetch(`/api/chat/history?user_id=${user.id}&phase=TRAINING`);
          if (res.ok) {
            const data = await res.json();
            if (data.messages && data.messages.length > 0) {
              setMessages([INITIAL_MESSAGES[0], ...data.messages]);
            }
          }
        } catch (err) {
          console.error("Failed to fetch history", err);
        }
      }
    };
    fetchHistory();
  }, [user]);

  const handleSendMessage = async (content: string) => {
    if (!user) return;
    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, newUserMsg],
          phase: "TRAINING",
          user_id: user.id
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: data.content
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "Network error connecting to the AI node."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-light tracking-tight text-foreground">AI Training</h1>
        <p className="text-sm font-light text-muted-foreground mt-1">
          Chat naturally. The more you talk, the more accurate your digital continuation becomes.
        </p>
      </div>
      
      <div className="flex-1 min-h-0">
        <ChatInterface 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
          placeholder="Type your response..."
        />
      </div>
    </div>
  );
}
