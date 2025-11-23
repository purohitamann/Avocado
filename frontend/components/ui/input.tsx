import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-2xl glass-input px-4 py-2 text-sm tracking-tight font-light ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-charcoal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-glass shadow-inner-glass hover:bg-white/50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
