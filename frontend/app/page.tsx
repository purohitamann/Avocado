"use client";

import { useState, useEffect } from "react";
import { ChatInterface } from "./component/ChatInterface";
import { DashboardPanel } from "./component/DashboardPanel";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
}

interface WeatherData {
  city: string;
  region: string;
  country: string;
  temperature_c: number;
  temperature_f: number;
  feels_like_c: number;
  condition: string;
  icon: string;
  humidity: number;
  wind_kph: number;
}

interface ChatResponse {
  session_id: string;
  reply: string;
  city: string | null;
  kids: number | null;
  housing: string | null;
  cars: number | null;
  score: number | null;
  monthly_estimate: number | null;
  range_low: number | null;
  range_high: number | null;
  housing_cost: number | null;
  food_cost: number | null;
  restaurants_cost: number | null;
  transport_cost: number | null;
  internet_utils_cost: number | null;
  lifestyle_cost: number | null;
  weather?: WeatherData | null;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showSplitView, setShowSplitView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [costData, setCostData] = useState<ChatResponse | null>(null);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  
  // Check if mobile on mount and in split view
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768; // md breakpoint
      if (showSplitView && isMobile) {
        setIsChatMinimized(true);
      } else {
        setIsChatMinimized(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [showSplitView]);

  const handleQuery = async (query: string) => {
    // Generate new session ID for every request with more entropy
    const timestamp = Date.now();
    const random1 = Math.random().toString(36).substr(2, 9);
    const random2 = Math.random().toString(36).substr(2, 9);
    const sessionId = `session_${timestamp}_${random1}_${random2}`;
    
    console.log('🆔 New Session ID:', sessionId);
    
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

    setIsLoading(true);

    const requestBody = {
      session_id: sessionId,
      message: query,
    };

    console.log('🚀 API Request:', {
      url: '/api',
      method: 'POST',
      sessionId: sessionId,
      body: requestBody,
    });

    const startTime = Date.now();

    try {
      // Add minimum loading time for better UX
      const minLoadingTime = 1500; // 1.5 seconds minimum
      
      // Call Next.js API route
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const duration = Date.now() - startTime;

      console.log('📡 API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        duration: `${duration}ms`,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data: ChatResponse = await response.json();
      
      console.log('✅ API Success:', {
        sessionId: data.session_id,
        city: data.city,
        monthly_estimate: data.monthly_estimate,
        score: data.score,
        kids: data.kids,
        housing: data.housing,
        cars: data.cars,
        breakdown: {
          housing_cost: data.housing_cost,
          food_cost: data.food_cost,
          restaurants_cost: data.restaurants_cost,
          transport_cost: data.transport_cost,
          internet_utils_cost: data.internet_utils_cost,
          lifestyle_cost: data.lifestyle_cost,
        },
        reply: data.reply?.substring(0, 100) + '...',
      });
      
      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Update city and cost data
      if (data.city) {
        if (data.city !== selectedCity) {
          console.log('🔄 New city detected:', {
            oldCity: selectedCity,
            newCity: data.city
          });
        }
        setSelectedCity(data.city);
      }
      setCostData(data);
      
      // Ensure minimum loading time for smooth UX
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
    } catch (error) {
      console.error('💥 API Error:', error);
      
      // Show error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Sorry, I'm having trouble connecting to the server. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
              costData={costData}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Interface */}
      <motion.div 
        layout
        initial={false}
        animate={{
          width: showSplitView ? 'min(400px, 100vw)' : '100%',
          maxWidth: showSplitView ? 'min(400px, calc(100vw - 16px))' : 'min(800px, calc(100vw - 32px))',
          right: showSplitView ? 'max(8px, min(24px, 2vw))' : 'auto',
          left: showSplitView ? 'auto' : '50%',
          x: showSplitView ? '0%' : '-50%',
          bottom: isChatMinimized && showSplitView ? 'max(8px, min(24px, 2vh))' : 'auto',
          top: isChatMinimized && showSplitView ? 'auto' : (showSplitView ? 'max(8px, min(24px, 2vh))' : '50%'),
          y: showSplitView ? '0%' : '-50%',
          height: showSplitView ? (isChatMinimized ? '60px' : 'calc(100vh - max(16px, min(48px, 4vh)))') : 'auto',
          maxHeight: showSplitView ? 'calc(100vh - max(16px, min(48px, 4vh)))' : '85vh',
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
        className={`h-full rounded-3xl overflow-hidden ${
          showSplitView 
            ? 'shadow-2xl backdrop-blur-md border border-white/20 bg-transparent'
            : ''
        }`}
      >
        <ChatInterface 
            onQuery={handleQuery} 
            messages={messages} 
            isFullscreen={!showSplitView}
            isLoading={isLoading}
            isMobileMinimized={isChatMinimized}
            onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
