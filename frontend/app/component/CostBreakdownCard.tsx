"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface CostBreakdownCardProps {
  category: string;
  amount: number;
  percentage: number;
  icon: LucideIcon;
}

export const CostBreakdownCard = ({
  category,
  amount,
  percentage,
  icon: Icon,
}: CostBreakdownCardProps) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="rounded-2xl glass-card p-5 shadow-glass group frosted-overlay cursor-pointer">
      <div className="flex items-start gap-3.5">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
          className="w-10 h-10 rounded-xl bg-linear-to-br from-avocado-400/20 to-mint-500/20 flex items-center justify-center group-hover:from-avocado-400/30 group-hover:to-mint-500/30 transition-colors">
          <Icon className="w-5 h-5 text-avocado-600" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-charcoal-700 truncate tracking-tight">{category}</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-lg font-semibold text-charcoal-800 tracking-tight">${amount}</span>
            <span className="text-2xs text-charcoal-400 font-medium">{percentage}%</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-charcoal-100/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="h-full bg-linear-to-r from-avocado-400 to-mint-500 rounded-full group-hover:from-avocado-500 group-hover:to-mint-600"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
