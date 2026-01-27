import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isStreaming?: boolean;
}

const MOCK_RESPONSES: Record<string, string> = {
  array: "Arrays are the simplest data structure where elements are stored in contiguous memory locations. They offer O(1) access time if you know the index, but insertion and deletion can be O(n) as elements need to shift. In JavaScript, arrays are dynamic and can hold mixed types!",
  html: "HTML stands for HyperText Markup Language. It's the skeleton of any web page. It uses 'tags' to define elements like headers, paragraphs, and images. Semantic HTML is crucial for accessibility and SEO.",
  react: "React is a powerful library for building UIs. It uses a Virtual DOM to minimize direct manipulation of the browser DOM, making updates incredibly fast. Key concepts include Components, Props, State, and Hooks like useState and useEffect.",
  css: "Cascading Style Sheets (CSS) control the visual presentation of web pages. Modern CSS includes powerful layout systems like Flexbox and Grid, allowing for responsive designs that adapt to any screen size.",
  complexity: "Time complexity quantifies the amount of time an algorithm takes to run as a function of the length of the string representing the input. We usually express it using Big O notation, like O(1) for constant time or O(n) for linear time.",
  default: "I'm your AI tutor powered by Gemini! I can explain complex topics in Web Dev, DSA, or System Design. Try asking me 'What is an Array?' or 'Explain React hooks' and I'll generate a detailed explanation for you."
};

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi! I'm your NeuroLearn AI assistant. How can I help you today?", sender: 'ai', timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamText = async (fullText: string) => {
    setIsTyping(true);
    const msgId = Date.now() + 1;
    
    // Simulate network delay / "thinking" BEFORE creating the message bubble
    // This allows the "Thinking..." indicator to show up
    await new Promise(r => setTimeout(r, 1500)); 

    // Create initial empty AI message
    const aiMsg: Message = { 
      id: msgId, 
      text: "", 
      sender: 'ai', 
      timestamp: new Date(),
      isStreaming: true
    };
    
    setMessages(prev => [...prev, aiMsg]);

    const words = fullText.split(" ");
    
    for (let i = 0; i < words.length; i++) {
        await new Promise(r => setTimeout(r, 40 + Math.random() * 30)); // Random typing speed
        
        setMessages(prev => prev.map(msg => 
            msg.id === msgId 
            ? { ...msg, text: msg.text + (i === 0 ? "" : " ") + words[i] }
            : msg
        ));
    }
    
    setMessages(prev => prev.map(msg => msg.id === msgId ? { ...msg, isStreaming: false } : msg));
    setIsTyping(false);
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    
    const userText = input.trim();
    const newUserMsg: Message = { id: Date.now(), text: userText, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, newUserMsg]);
    setInput("");

    // Determine Response
    const lowerInput = userText.toLowerCase();
    let responseText = MOCK_RESPONSES.default;
    
    for (const key in MOCK_RESPONSES) {
        if (lowerInput.includes(key)) {
            responseText = MOCK_RESPONSES[key];
            break;
        }
    }

    streamText(responseText);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.24))] bg-white dark:bg-slate-950 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 relative overflow-hidden">
          <Bot className="w-6 h-6 relative z-10" />
          {isTyping && (
             <motion.div 
               className="absolute inset-0 bg-indigo-400/20"
               animate={{ scale: [1, 1.5, 1] }} 
               transition={{ repeat: Infinity, duration: 1.5 }}
             />
          )}
        </div>
        <div>
          <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              NeuroBot 
              {isTyping && <span className="text-xs font-normal text-indigo-500 animate-pulse">Thinking...</span>}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Gemini</p>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 dark:bg-slate-900/50"
      >
        <AnimatePresence initial={false}>
            {messages.map((msg) => (
            <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none'
                }`}>
                <p className="leading-relaxed">
                    {msg.text}
                    {msg.sender === 'ai' && msg.isStreaming && (
                        <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-indigo-500 animate-pulse"/>
                    )}
                </p>
                <p className={`text-[10px] mt-2 ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {msg.sender === 'ai' && <Sparkles className="w-3 h-3 inline mr-1 mb-0.5" />}
                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
                </div>
            </motion.div>
            ))}
            
            {/* Explicit Thinking Bubble */}
            {isTyping && messages[messages.length - 1]?.sender === 'user' && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex justify-start"
                >
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                        <div className="flex gap-1">
                            <motion.div 
                                animate={{ y: [0, -5, 0] }} 
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                                className="w-2 h-2 bg-indigo-400 rounded-full"
                            />
                            <motion.div 
                                animate={{ y: [0, -5, 0] }} 
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                className="w-2 h-2 bg-indigo-500 rounded-full"
                            />
                            <motion.div 
                                animate={{ y: [0, -5, 0] }} 
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                                className="w-2 h-2 bg-indigo-600 rounded-full"
                            />
                        </div>
                        <span className="text-xs text-slate-400 font-medium ml-2">NeuroBot is thinking...</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-950 border-t dark:border-slate-800 flex gap-2">
        <Input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything about your course..."
          disabled={isTyping}
          className="rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus-visible:ring-indigo-500"
        />
        <Button 
          onClick={handleSend}
          disabled={isTyping || !input.trim()}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 transition-all disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
