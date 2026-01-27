import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi! I'm your NeuroLearn AI assistant. How can I help you today?", sender: 'ai', timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newUserMsg: Message = { id: Date.now(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, newUserMsg]);
    setInput("");

    // Simulator for Gemini Response (TODO: Integration)
    setTimeout(() => {
       const aiMsg: Message = { 
         id: Date.now() + 1, 
         text: "That's an interesting question! I'll look that up for you...", 
         sender: 'ai', 
         timestamp: new Date() 
       };
       setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.24))] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b bg-slate-50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800">NeuroBot</h2>
          <p className="text-xs text-slate-500">Powered by Gemini</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.sender === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
            }`}>
              <p>{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t flex gap-2">
        <Input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything about your course..."
          className="rounded-xl border-slate-200 focus-visible:ring-indigo-500"
        />
        <Button 
          onClick={handleSend}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
