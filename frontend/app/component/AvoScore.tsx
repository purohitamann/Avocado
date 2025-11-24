"use client";

import { motion } from "framer-motion";

interface AvoScoreProps {
  score: number;
  city: string;
}

export const AvoScore = ({ score, city }: AvoScoreProps) => {
  // Convert score (0-1) to 0-10 scale
  const scaledScore = score * 10;
  
  // Determine category and color using avocado theme
  const getCategory = (score: number) => {
    if (score <= 3) return { label: "Low Cost", color: "from-yellow-200 to-yellow-400", bgColor: "bg-mint-500/15", textColor: "text-avocado-700" };
    if (score <= 7) return { label: "Mid Cost", color: "from-green-200 to-green-600", bgColor: "bg-avocado-500/15", textColor: "text-avocado-700" };
    return { label: "Expensive", color: "from-avocado-600 to-avocado-800", bgColor: "bg-avocado-600/15", textColor: "text-avocado-800" };
  };

  const category = getCategory(scaledScore);
  const percentage = (scaledScore / 10) * 100;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-avocado-200/40 bg-white/30 backdrop-blur-sm p-6 shadow-sm"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-charcoal-800 tracking-tight">AvoScore™</h3>
            <p className="text-xs text-charcoal-500 font-light mt-0.5">Cost of living index</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full ${category.bgColor} border border-avocado-300/30`}>
            <span className={`text-xs font-semibold ${category.textColor}`}>{category.label}</span>
          </div>
        </div>

        {/* Score Display */}
        <div className="flex items-baseline gap-2">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
            className="text-5xl font-bold text-charcoal-800 tracking-tighter"
          >
            {scaledScore.toFixed(1)}
          </motion.span>
          <span className="text-2xl text-charcoal-400 font-light">/10</span>
        </div>

        {/* Avocado Meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-charcoal-500 font-light">
            <span>🥑 </span>
            <span>🥑🥑🥑</span>
          </div>
          <div className="h-2.5 bg-avocado-100/40 rounded-full overflow-hidden relative border border-avocado-200/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className={`h-full bg-linear-to-r ${category.color} rounded-full relative`}
            >
              {/* Animated pulse */}
              <motion.div
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-white/20 rounded-full"
              />
            </motion.div>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-avocado-200/30">
          <div className="text-center">
            <div className="text-xs font-semibold text-avocado-700">0-3</div>
            <div className="text-2xs text-charcoal-500 font-light">Low</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-semibold text-avocado-700">4-7</div>
            <div className="text-2xs text-charcoal-500 font-light">Mid</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-semibold text-avocado-800">8-10</div>
            <div className="text-2xs text-charcoal-500 font-light">High</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
