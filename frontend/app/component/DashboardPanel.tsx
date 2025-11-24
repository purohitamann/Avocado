"use client";

import { MapPin, Home, ShoppingCart, UtensilsCrossed, Train, Wifi, Sparkles } from "lucide-react";
import { CostBreakdownCard } from "./CostBreakdownCard";
import { ShapChart } from "./ShapChart";
import { GoogleMapView } from "./GoogleMapView";
import { AvoScore } from "./AvoScore";
import { motion } from "framer-motion";

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

interface CostData {
  monthly_estimate: number | null;
  range_low: number | null;
  range_high: number | null;
  kids: number | null;
  housing: string | null;
  cars: number | null;
  housing_cost: number | null;
  food_cost: number | null;
  restaurants_cost: number | null;
  transport_cost: number | null;
  internet_utils_cost: number | null;
  lifestyle_cost: number | null;
  weather?: WeatherData | null;
  score?: number | null;
  reply?: string | null;
}

interface DashboardPanelProps {
  city: string;
  isVisible: boolean;
  costData?: CostData | null;
  isLoading?: boolean;
}

export const DashboardPanel = ({ city, isVisible, costData: apiCostData, isLoading = false }: DashboardPanelProps) => {
  // Calculate breakdown from API data or use defaults
  const total = apiCostData?.monthly_estimate || 4250;
  
  const housingAmount = apiCostData?.housing_cost || 1800;
  const foodAmount = apiCostData?.food_cost || 600;
  const restaurantsAmount = apiCostData?.restaurants_cost || 450;
  const transportAmount = apiCostData?.transport_cost || 150;
  const internetUtilsAmount = apiCostData?.internet_utils_cost || 200;
  const lifestyleAmount = apiCostData?.lifestyle_cost || 1050;
  
  // Calculate percentages based on actual amounts
  const housingPct = total > 0 ? Math.round((housingAmount / total) * 100) : 42;
  const foodPct = total > 0 ? Math.round((foodAmount / total) * 100) : 14;
  const restaurantsPct = total > 0 ? Math.round((restaurantsAmount / total) * 100) : 11;
  const transportPct = total > 0 ? Math.round((transportAmount / total) * 100) : 4;
  const internetUtilsPct = total > 0 ? Math.round((internetUtilsAmount / total) * 100) : 5;
  const lifestylePct = total > 0 ? Math.round((lifestyleAmount / total) * 100) : 24;
  
  const costData = {
    total,
    range: { 
      min: apiCostData?.range_low || 3800, 
      max: apiCostData?.range_high || 4700 
    },
    breakdown: [
      { category: "Housing", amount: housingAmount, percentage: housingPct, icon: Home },
      { category: "Food", amount: foodAmount, percentage: foodPct, icon: ShoppingCart },
      { category: "Restaurants", amount: restaurantsAmount, percentage: restaurantsPct, icon: UtensilsCrossed },
      { category: "Transport", amount: transportAmount, percentage: transportPct, icon: Train },
      { category: "Internet & Utilities", amount: internetUtilsAmount, percentage: internetUtilsPct, icon: Wifi },
      { category: "Lifestyle", amount: lifestyleAmount, percentage: lifestylePct, icon: Sparkles },
    ],
    shapFeatures: [
      { feature: "Housing market", impact: 0.45, direction: "high" as const },
      { feature: "Restaurant prices", impact: 0.28, direction: "high" as const },
      { feature: "Transportation", impact: -0.15, direction: "low" as const },
      { feature: "Internet/utilities", impact: -0.08, direction: "low" as const },
      { feature: "Entertainment", impact: 0.22, direction: "high" as const },
    ],
  };

  // Generate family context text
  const familyContext = apiCostData ? [
    apiCostData.kids ? `${apiCostData.kids} kid${apiCostData.kids > 1 ? 's' : ''}` : null,
    apiCostData.housing ? `planning to ${apiCostData.housing}` : null,
    apiCostData.cars ? `${apiCostData.cars} car${apiCostData.cars > 1 ? 's' : ''}` : null,
  ].filter(Boolean).join(', ') : '';

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

  // Show loading state while fetching data
  if (isLoading) {
    const avocadoFacts = [
      "An avocado tree can produce up to 500 avocados per year",
      "Avocados are technically berries, not vegetables",
      "The word 'avocado' comes from the Aztec word 'ahuacatl'",
      "Mexico produces nearly half of the world's avocados",
      "A single avocado contains more potassium than a banana",
      "Avocado prices can vary 300% between cities worldwide"
    ];
    const randomFact = avocadoFacts[Math.floor(Math.random() * avocadoFacts.length)];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="h-full flex items-center justify-center glass"
      >
        <div className="text-center space-y-4 p-8 max-w-md">
          {/* Loading dots */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [0, -8, 0],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{ 
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
                className="w-2 h-2 rounded-full bg-avocado-500"
              />
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-charcoal-600 font-light italic"
          >
            {randomFact}
          </motion.p>
        </div>
      </motion.div>
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
        key={city}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex-1 relative overflow-hidden">
        <GoogleMapView city={city} />
        {/* City label overlay */}
        <div className="absolute top-6 left-6 glass-strong rounded-2xl px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-avocado-600" />
            <span className="text-sm font-semibold text-charcoal-800">{city}</span>
          </div>
        </div>
      </motion.div>
      
      {/* Collapsible Data Panel */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="h-[45%] overflow-y-auto glass border-t border-avocado-200/30 pr-2 md:pr-104">
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5">
        {/* Total Cost Card */}
        <motion.div 
          key={`${city}-${costData.total}`}
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-2xl glass-card p-5 frosted-overlay-avocado">
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
              {familyContext ? familyContext : 'For a single person living comfortably'}
            </p>
          </div>
        </motion.div>

        {/* AvoScore */}
        {(apiCostData?.score !== null && apiCostData?.score !== undefined) && (
          <AvoScore key={`avoscore-${city}-${apiCostData.score}`} score={apiCostData.score} city={city} />
        )}

        {/* Cost Breakdown */}
        <motion.div 
          key={`breakdown-${city}-${total}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="space-y-3">
          <h3 className="text-base font-semibold text-charcoal-800 tracking-tight">Cost Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {costData.breakdown.map((item, index) => (
              <motion.div
                key={`${item.category}-${item.amount}`}
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

        {/* Weather Info */}
        {apiCostData?.weather && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="rounded-2xl glass-card p-4 shadow-glass frosted-overlay"
          >
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-charcoal-800 tracking-tight">Current Weather</h4>
              <div className="flex items-center gap-4">
                <img 
                  src={`https:${apiCostData.weather.icon}`} 
                  alt={apiCostData.weather.condition}
                  className="w-16 h-16"
                />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-charcoal-800">
                      {Math.round(apiCostData.weather.temperature_c)}°C
                    </span>
                    <span className="text-sm text-charcoal-500">
                      ({Math.round(apiCostData.weather.temperature_f)}°F)
                    </span>
                  </div>
                  <p className="text-sm text-charcoal-600 font-medium mt-1">
                    {apiCostData.weather.condition}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-charcoal-500">
                    <span>Feels like {Math.round(apiCostData.weather.feels_like_c)}°C</span>
                    <span>Humidity {apiCostData.weather.humidity}%</span>
                    <span>Wind {Math.round(apiCostData.weather.wind_kph)} km/h</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Summary */}
        <div className="rounded-2xl glass-card p-4 shadow-glass frosted-overlay">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-charcoal-800 tracking-tight">Summary</h4>
            <p className="text-xs text-charcoal-600 leading-relaxed font-light">
              {apiCostData?.reply || `${city}'s cost of living is driven primarily by housing costs, which are significantly
              above average. Restaurant prices and entertainment also contribute to higher expenses.
              However, efficient public transportation and reasonable utility costs help offset some
              expenses.`}
            </p>
          </div>
        </div>
        <footer className="mt-4 pb-30">
          <div className="rounded-xl bg-avocado-50/40 border border-avocado-200/30 glass-card px-3 sm:px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 text-xs text-charcoal-600 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
          
              <span className="text-charcoal-500">built with love for 🥑  by</span>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-semibold text-charcoal-800">Aman Purohit</span>
                <span className="text-charcoal-500">,</span>
                <span className="font-semibold text-charcoal-800">Vidhi Kalal</span>
                <span className="text-charcoal-500"> &amp; </span>
                <span className="font-semibold text-charcoal-800">Prabal Manchanda</span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <a
          href="#"
          className="text-avocado-600 hover:underline text-xs"
          aria-label="View project"
              >
          Learn more about this project
              </a>
            </div>
          </div>
        </footer>
        </div>
      </motion.div>
    </motion.div>
  );
};
