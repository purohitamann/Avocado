import { TrendingUp, TrendingDown } from "lucide-react";

interface ShapFeature {
  feature: string;
  impact: number;
  direction: "high" | "low";
}

interface ShapChartProps {
  features: ShapFeature[];
}

export const ShapChart = ({ features }: ShapChartProps) => {
  const maxImpact = Math.max(...features.map((f) => Math.abs(f.impact)));

  return (
    <div className="space-y-5">
      {features.map((feature, index) => {
        const width = (Math.abs(feature.impact) / maxImpact) * 100;
        const isPositive = feature.impact > 0;

        return (
          <div key={index} className="space-y-2 animate-fade-in group" style={{ animationDelay: `${index * 0.08}s` }}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-glass group-hover:scale-110 ${
                  isPositive ? "bg-destructive/10" : "bg-avocado-500/10"
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 text-destructive" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-avocado-600" />
                  )}
                </div>
                <span className="font-medium text-charcoal-700 tracking-tight">{feature.feature}</span>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isPositive 
                  ? "bg-destructive/10 text-destructive" 
                  : "bg-avocado-500/10 text-avocado-700"
              }`}>
                {isPositive ? "+" : ""}
                {(feature.impact * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-2.5 bg-charcoal-100/40 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  isPositive
                    ? "bg-linear-to-r from-destructive/80 to-destructive"
                    : "bg-linear-to-r from-avocado-400 to-mint-600"
                }`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
      <div className="mt-6 pt-6 border-t border-white/20">
        <div className="flex items-center justify-between text-xs text-charcoal-500 font-light">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-avocado-500/10 flex items-center justify-center">
              <TrendingDown className="w-3 h-3 text-avocado-600" />
            </div>
            <span>Decreases cost</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-destructive/10 flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-destructive" />
            </div>
            <span>Increases cost</span>
          </div>
        </div>
      </div>
    </div>
  );
};
