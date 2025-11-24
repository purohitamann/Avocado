"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Send, MapPin, DollarSign, Sparkles, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  onQuery: (query: string) => void;
  messages: Message[];
  isFullscreen?: boolean;
  isLoading?: boolean;
  isMobileMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const ChatInterface = ({ 
  onQuery, 
  messages, 
  isFullscreen = false, 
  isLoading = false,
  isMobileMinimized = false,
  onToggleMinimize 
}: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onQuery(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full  relative">
      {/* Mobile Minimize/Maximize Button - Only visible on small screens in split view */}
      {!isFullscreen && onToggleMinimize && (
        <motion.button
          onClick={onToggleMinimize}
          className="md:hidden absolute top-2 right-2 z-30 bg-avocado-600 hover:bg-avocado-700 text-black rounded-full p-2 shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMobileMinimized ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </motion.button>
      )}
      
      {/* Show minimized bar on mobile when minimized */}
      {isMobileMinimized && !isFullscreen ? (
        <div 
           onClick={onToggleMinimize}
         className="md:hidden flex items-center justify-between px-4 py-4 mx-2 bg-linear-to-r from-avocado-500 to-mint-500 rounded-3xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥑</span>
            <span className="text-sm font-medium text-black">Tap to expand chat</span>
          </div>
        </div>
      ) : (
        <>
      {/* Floating Header Badge for Split View */}
      {!isFullscreen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full glass backdrop-blur-xl shadow-lg">
            <span className="text-lg sm:text-xl">🥑</span>
            <span className="text-xs font-medium text-charcoal-700">Avocado AI</span>
          </div>
        </motion.div>
      )}

      {/* Chat Header - Only show when messages exist in fullscreen, or always in split view (which is handled by !isFullscreen condition above) */}
      {isFullscreen && messages.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-6 sm:pb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🥑</span>
            <div>
              <h2 className="text-lg font-semibold text-charcoal-800 tracking-tight">Avocado</h2>
            </div>
          </div>
      </motion.div>
      )}

      {/* Messages - with bottom padding for floating input */}
      <div className={`flex-1 overflow-y-auto scrollbar-none ${ 
        isFullscreen ? 'px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-48 sm:pb-56' : 'p-4 sm:p-6 pt-16 sm:pt-20 pb-36 sm:pb-40'
      }`}>
        {messages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`flex flex-col items-center h-full text-center px-3 sm:px-4 ${
              isFullscreen ? 'justify-end pb-6 sm:pb-8' : 'justify-center space-y-6 sm:space-y-8'
            }`}>
            
            <div className="space-y-6 sm:space-y-10 max-w-3xl">
              {/* Minimal Floating Welcome - Gemini style */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex flex-col items-center gap-4 sm:gap-6"
              >
                <motion.div 
                  className="text-5xl sm:text-6xl md:text-7xl"
                  animate={{ 
                    y: [-8, 8, -8],
                    rotate: [-5, 5, -5]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  🥑
                </motion.div>

                <div className="space-y-3 sm:space-y-4 text-center mb-20 sm:mb-12 px-2">
                  <h3 className="text-3xl sm:text-4xl md:text-5xl text-charcoal-800 font-light tracking-tight">
                    Welcome to Avocado
                  </h3>
                  <p className="text-base sm:text-lg md:text-xl text-charcoal-500 font-light max-w-xl px-2">
                    "Find out if you can afford to move in a new city with just a prompt!"
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
          <div className="space-y-6 sm:space-y-8">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex gap-3 ${
                message.type === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {message.type === "assistant" && (
                <div className="w-8 h-8 rounded-xl glass-strong flex items-center justify-center shrink-0 frosted-overlay shadow-sm">
                  <span className="text-sm">🥑</span>
                </div>
              )}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className={`rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 max-w-[85%] sm:max-w-[80%] ${
                  message.type === "user"
                    ? "glass-strong text-charcoal-800 shadow-lg"
                    : "glass-card text-charcoal-700 shadow-md"
                }`}
              >
                <p className="text-sm leading-relaxed font-light">{message.content}</p>
              </motion.div>
            </motion.div>
          ))}
          </div>
          </AnimatePresence>
        )}
        {/* Invisible div for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Input Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`absolute bottom-0 left-0 right-0 z-20 flex justify-center ${
          isFullscreen ? 'p-4 sm:p-6 md:p-8 pb-8 sm:pb-12' : 'p-3 sm:p-4 md:p-6'
        }`}
      >
        <div className={cn(
          "w-full transition-all duration-500 ease-out",
          isFullscreen && messages.length === 0 ? "max-w-2xl" : "max-w-full"
        )}>
          <div className={cn(
            "rounded-3xl transition-all duration-300 p-2",
            isFullscreen && messages.length === 0 
              ? "border border-white/30"
              : "border border-white/20"
          )}>
            <form onSubmit={handleSubmit}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about cost of living... "
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                className={cn(
                  "w-full border  bg-transparent focus:bg-transparent  focus-visible:outline-none transition-all disabled:opacity-50 placeholder:text-charcoal-400 rounded-3xl resize-none align-top",
                  isFullscreen && messages.length === 0 
                    ? "h-24 sm:h-28 md:h-32 pl-4 sm:pl-5 md:pl-6 pr-4 sm:pr-5 md:pr-6 pt-3 sm:pt-3.5 md:pt-4 text-base sm:text-lg"
                    : "h-20 sm:h-22 md:h-24 pl-4 sm:pl-5 pr-3 sm:pr-4 pt-2.5 sm:pt-3 text-sm"
                )}
              />
            </form>
            
            {/* Quick Prompt Pills below input */}
            {isFullscreen && messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-2 justify-center mt-3 sm:mt-4 px-2 sm:px-4 pb-2"
              >
                <button
                  type="button"
                  onClick={() => {
                    setInput("I want to move to Toronto");
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      if (form) {
                        form.requestSubmit();
                      }
                    }, 100);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 hover:bg-white/40 hover:border-avocado-400/50 transition-all cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-avocado-600" />
                  <span className="text-xs text-charcoal-700 font-light">I want to move to Toronto</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInput("I'm a student moving to New York");
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      if (form) {
                        form.requestSubmit();
                      }
                    }, 100);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 hover:bg-white/40 hover:border-avocado-400/50 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-avocado-600" />
                  <span className="text-xs text-charcoal-700 font-light">I'm a student moving to New York</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInput("I want to move to London with 2 kids");
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      if (form) {
                        form.requestSubmit();
                      }
                    }, 100);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 hover:bg-white/40 hover:border-avocado-400/50 transition-all cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5 text-avocado-600" />
                  <span className="text-xs text-charcoal-700 font-light">How much would living in London with 2 kids cost?</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
      </>
      )}
    </div>
  );
};
