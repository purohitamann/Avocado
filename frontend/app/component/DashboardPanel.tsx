"use client";

import { MapPin, Home, ShoppingCart, UtensilsCrossed, Train, Wifi, Sparkles } from "lucide-react";
import { CostBreakdownCard } from "./CostBreakdownCard";
import { ShapChart } from "./ShapChart";
import { GoogleMapView } from "./GoogleMapView";
import { motion } from "framer-motion";

interface DashboardPanelProps {
  city: string;
  isVisible: boolean;
}

export const DashboardPanel = ({ city, isVisible }: DashboardPanelProps) => {
  // Mock data - in real app, this would come from API
  const costData = {
    total: 4250,
    range: { min: 3800, max: 4700 },
    breakdown: [
      { category: "Housing", amount: 1800, percentage: 42, icon: Home },
      { category: "Food", amount: 600, percentage: 14, icon: ShoppingCart },
      { category: "Restaurants", amount: 450, percentage: 11, icon: UtensilsCrossed },
      { category: "Transport", amount: 150, percentage: 4, icon: Train },
      { category: "Internet & Utilities", amount: 200, percentage: 5, icon: Wifi },
      { category: "Lifestyle", amount: 1050, percentage: 24, icon: Sparkles },
    ],
    shapFeatures: [
      { feature: "Housing market", impact: 0.45, direction: "high" as const },
      { feature: "Restaurant prices", impact: 0.28, direction: "high" as const },
      { feature: "Transportation", impact: -0.15, direction: "low" as const },
      { feature: "Internet/utilities", impact: -0.08, direction: "low" as const },
      { feature: "Entertainment", impact: 0.22, direction: "high" as const },
    ],
  };

  if (!isVisible) {
    return (
      <div className="h-full flex items-center justify-center glass">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 p-8">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 mx-auto rounded-3xl glass-strong flex items-center justify-center frosted-overlay-avocado">
            <MapPin className="w-10 h-10 text-avocado-600" />
          </motion.div>
          <p className="text-charcoal-500 font-light">Ask about a city to see the map</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-full flex flex-col">
      {/* Fullscreen Map */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex-1 relative overflow-hidden">
        <GoogleMapView city={city} />
      </motion.div>
      
      {/* Collapsible Data Panel */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="h-[45%] overflow-y-auto glass border-t border-avocado-200/30 pr-105">
        <div className="p-6 space-y-5">
        {/* Total Cost Card */}
        <div className="relative rounded-2xl glass-card p-5 frosted-overlay-avocado">
          <div className="absolute inset-0 bg-linear-to-br from-avocado-200/25 via-mint-100/20 to-avocado-300/15 rounded-3xl pointer-events-none" />
          <div className="relative space-y-1">
            <p className="text-2xs font-medium text-charcoal-500 tracking-wide uppercase">
              Estimated Monthly Cost
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-charcoal-800 tracking-tighter">
                ${costData.total.toLocaleString()}
              </span>
              <span className="text-xs text-charcoal-400 font-light">
                ${costData.range.min.toLocaleString()} - $
                {costData.range.max.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-charcoal-500 font-light">
              For a single person living comfortably
            </p>
          </div>
        </div>

        {/* Cost Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="space-y-3">
          <h3 className="text-base font-semibold text-charcoal-800 tracking-tight">Cost Breakdown</h3>
          <div className="grid grid-cols-3 gap-3">
            {costData.breakdown.map((item, index) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
              >
                <CostBreakdownCard {...item} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* SHAP Explanation */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-charcoal-800 tracking-tight">Why is it this expensive?</h3>
            <p className="text-xs text-charcoal-500 font-light">
              AI-powered feature attribution analysis
            </p>
          </div>
          <div className="rounded-2xl glass-card p-4 shadow-glass frosted-overlay">
            <ShapChart features={costData.shapFeatures} />
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-2xl glass-card p-4 shadow-glass frosted-overlay">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-charcoal-800 tracking-tight">Summary</h4>
            <p className="text-xs text-charcoal-600 leading-relaxed font-light">
              {city}'s cost of living is driven primarily by housing costs, which are significantly
              above average. Restaurant prices and entertainment also contribute to higher expenses.
              However, efficient public transportation and reasonable utility costs help offset some
              expenses.
            </p>
          </div>
        </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
