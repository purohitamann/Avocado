"use client";

import { useState } from "react";
import { Send } from "lucide-react";
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
}

export const ChatInterface = ({ onQuery, messages, isFullscreen = false }: ChatInterfaceProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onQuery(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      {/* Floating Header Badge for Split View */}
      {!isFullscreen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass backdrop-blur-xl shadow-lg">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-avocado-400 to-mint-500 flex items-center justify-center">
              <span className="text-xs">🥑</span>
            </div>
            <span className="text-xs font-medium text-charcoal-700">Avocado AI</span>
          </div>
        </motion.div>
      )}

      {/* Chat Header - Hide in split view for cleaner look */}
      {isFullscreen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 border-b border-white/20 glass backdrop-blur-md">
          <div className="flex items-center gap-4">
          <div className="w-12 h-12 p-1 rounded-2xl glass-strong flex items-center justify-center frosted-overlay">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  {/* Avocado body */}
  <path d="M100 20
           C55 20 30 70 30 110
           C30 150 60 180 100 180
           C140 180 170 150 170 110
           C170 70 145 20 100 20Z"
        fill="#8BC34A" stroke="#4A7A23" strokeWidth="6"/>

  {/* Inner flesh */}
  <path d="M100 45
           C70 45 55 80 55 110
           C55 145 75 165 100 165
           C125 165 145 145 145 110
           C145 80 130 45 100 45Z"
        fill="#AEEA71" stroke="#6D9F3A" strokeWidth="4"/>

  {/* Seed */}
  <circle cx="100" cy="120" r="28" fill="#8D5A2B" stroke="#5C3A1A" strokeWidth="4"/>

  {/* Mascot eyes */}
  <circle cx="82" cy="92" r="6" fill="#2E2E2E"/>
  <circle cx="118" cy="92" r="6" fill="#2E2E2E"/>

  {/* Cute smile */}
  <path d="M82 105 Q100 118 118 105" stroke="#2E2E2E" strokeWidth="4" strokeLinecap="round" fill="none"/>

</svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-charcoal-800 tracking-tight">Avocado</h2>
            <p className="text-sm text-charcoal-400 font-light">Cost of Living Intelligence</p>
          </div>
        </div>
      </motion.div>
      )}

      {/* Messages - with bottom padding for floating input */}
      <div className={`flex-1 overflow-y-auto space-y-6 ${
        isFullscreen ? 'p-8 pb-32' : 'p-6 pt-20 pb-28'
      }`}>
        {messages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`flex flex-col items-center justify-center h-full text-center space-y-8 px-4 ${
            isFullscreen ? 'max-w-3xl mx-auto' : ''
          }`}>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "backOut" }}
              className={`rounded-3xl p-1 glass-strong flex items-center justify-center frosted-overlay-avocado ${
              isFullscreen ? 'w-32 h-32' : 'w-24 h-24'
            }`}>
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  {/* Avocado body */}
  <path d="M100 20
           C55 20 30 70 30 110
           C30 150 60 180 100 180
           C140 180 170 150 170 110
           C170 70 145 20 100 20Z"
        fill="#8BC34A" stroke="#4A7A23" strokeWidth="6"/>

  {/* Inner flesh */}
  <path d="M100 45
           C70 45 55 80 55 110
           C55 145 75 165 100 165
           C125 165 145 145 145 110
           C145 80 130 45 100 45Z"
        fill="#AEEA71" stroke="#6D9F3A" strokeWidth="4"/>

  {/* Seed */}
  <circle cx="100" cy="120" r="28" fill="#8D5A2B" stroke="#5C3A1A" strokeWidth="4"/>

  {/* Mascot eyes */}
  <circle cx="82" cy="92" r="6" fill="#2E2E2E"/>
  <circle cx="118" cy="92" r="6" fill="#2E2E2E"/>

  {/* Cute smile */}
  <path d="M82 105 Q100 118 118 105" stroke="#2E2E2E" strokeWidth="4" strokeLinecap="round" fill="none"/>

</svg>

              {/* <img src="/assets/avocado-mascot.png" alt="Avocado AI" className={isFullscreen ? 'w-20 h-20' : 'w-14 h-14'} /> */}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className={`space-y-4 ${isFullscreen ? 'max-w-2xl' : 'max-w-md'}`}>
              <h3 className={`font-semibold text-charcoal-800 tracking-tight ${
                isFullscreen ? 'text-4xl' : 'text-2xl'
              }`}>Welcome to Avocado</h3>
              <p className={`text-charcoal-500 font-light leading-relaxed ${
                isFullscreen ? 'text-lg' : 'text-sm'
              }`}>
                Discover cost of living insights for cities worldwide with AI-powered analysis and beautiful visualizations.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className={`flex flex-wrap gap-3 justify-center ${
              isFullscreen ? 'max-w-2xl' : 'max-w-lg'
            }`}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onQuery("What's the cost of living in Toronto?")}
                className="rounded-2xl px-5 transition-glass hover:scale-105"
              >
                <span className="text-xs font-medium">Cost in Toronto</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onQuery("Compare London and Berlin")}
                className="rounded-2xl px-5 transition-glass hover:scale-105"
              >
                <span className="text-xs font-medium">Compare cities</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onQuery("Most affordable cities in Europe")}
                className="rounded-2xl px-5 transition-glass hover:scale-105"
              >
                <span className="text-xs font-medium">Affordable cities</span>
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
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
                className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                  message.type === "user"
                    ? "glass-strong text-charcoal-800 shadow-lg"
                    : "glass-card text-charcoal-700 shadow-md"
                }`}
              >
                <p className="text-sm leading-relaxed font-light">{message.content}</p>
              </motion.div>
            </motion.div>
          ))}
          </AnimatePresence>
        )}
      </div>

      {/* Floating Input Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`absolute bottom-0 left-0 right-0 z-20 ${
          isFullscreen ? 'p-8' : 'p-6'
        }`}
      >
        <div className="glass-strong rounded-3xl shadow-2xl p-4 frosted-overlay">
          <form onSubmit={handleSubmit} className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about cost of living..."
                className="rounded-2xl h-12 pl-5 pr-4 text-sm border-0 bg-white/40 backdrop-blur-sm focus:bg-white/60 transition-all"
              />
            </div>
            <Button
              type="submit"
              size="icon"
              className="rounded-2xl w-12 h-12 shrink-0 bg-linear-to-br from-avocado-500 to-mint-600 hover:from-avocado-600 hover:to-mint-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
