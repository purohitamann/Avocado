import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium tracking-tight ring-offset-background transition-glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "glass-strong bg-gradient-to-br from-avocado-400 to-mint-500 text-white hover:from-avocado-500 hover:to-mint-600 shadow-glass hover:shadow-glass-lg",
        destructive:
          "glass-strong bg-gradient-to-br from-destructive to-destructive/90 text-destructive-foreground hover:from-destructive/90 hover:to-destructive shadow-glass",
        outline:
          "border border-white/20 glass-card hover:bg-white/30 hover:text-accent-foreground",
        secondary:
          "glass-card text-charcoal-700 hover:bg-white/40 shadow-glass hover:shadow-glass-lg",
        ghost: "hover:bg-white/30 hover:text-accent-foreground",
        link: "text-mint-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-xl px-4",
        lg: "h-12 rounded-2xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
