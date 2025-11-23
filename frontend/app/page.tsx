"use client";

import { useState } from "react";
import { ChatInterface } from "./component/ChatInterface";
import { DashboardPanel } from "./component/DashboardPanel";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showSplitView, setShowSplitView] = useState(false);

  const handleQuery = (query: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: query,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Transition to split view on first query
    if (messages.length === 0) {
      setTimeout(() => setShowSplitView(true), 500);
    }

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `I'm analyzing the cost of living based on your query: "${query}". Let me show you the detailed breakdown.`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Extract city from query (simple detection)
      const cityMatch = query.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/);
      if (cityMatch) {
        setSelectedCity(cityMatch[1]);
      } else {
        setSelectedCity("Toronto"); // Default city
      }
    }, 1000);
  };

  return (
    <div className="h-screen flex relative overflow-hidden bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-100">
      {/* Full Screen Map Background (visible in split view) */}
      <AnimatePresence>
        {showSplitView && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 z-0"
          >
            <DashboardPanel 
              city={selectedCity || "Select a city"} 
              isVisible={!!selectedCity} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Interface */}
      <motion.div 
        layout
        initial={false}
        animate={{
          width: showSplitView ? '400px' : '100%',
          maxWidth: showSplitView ? '400px' : '800px',
          right: showSplitView ? '24px' : 'auto',
          left: showSplitView ? 'auto' : '50%',
          x: showSplitView ? '0%' : '-50%',
          top: showSplitView ? '24px' : '50%',
          y: showSplitView ? '0%' : '-50%',
          height: showSplitView ? 'calc(100vh - 48px)' : 'auto',
          maxHeight: showSplitView ? 'calc(100vh - 48px)' : '85vh',
        }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 30,
          mass: 0.8
        }}
        className="absolute z-20 mx-auto"
      >
      <motion.div 
        layout
        className={`h-full rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md border ${
          showSplitView 
            ? 'border-white/20 bg-transparent' 
            : 'border-white/30 bg-white/60'
        }`}
      >
        <ChatInterface 
            onQuery={handleQuery} 
            messages={messages} 
            isFullscreen={!showSplitView}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
