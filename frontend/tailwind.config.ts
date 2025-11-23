import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        mint: {
          50: "hsl(var(--mint-50))",
          100: "hsl(var(--mint-100))",
          200: "hsl(var(--mint-200))",
          300: "hsl(var(--mint-300))",
          400: "hsl(var(--mint-400))",
          500: "hsl(var(--mint-500))",
          600: "hsl(var(--mint-600))",
          700: "hsl(var(--mint-700))",
        },
        avocado: {
          50: "hsl(var(--avocado-50))",
          100: "hsl(var(--avocado-100))",
          200: "hsl(var(--avocado-200))",
          300: "hsl(var(--avocado-300))",
          400: "hsl(var(--avocado-400))",
          500: "hsl(var(--avocado-500))",
          600: "hsl(var(--avocado-600))",
          700: "hsl(var(--avocado-700))",
        },
        charcoal: {
          50: "hsl(var(--charcoal-50))",
          100: "hsl(var(--charcoal-100))",
          200: "hsl(var(--charcoal-200))",
          300: "hsl(var(--charcoal-300))",
          400: "hsl(var(--charcoal-400))",
          500: "hsl(var(--charcoal-500))",
          600: "hsl(var(--charcoal-600))",
          700: "hsl(var(--charcoal-700))",
          800: "hsl(var(--charcoal-800))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        'glass-lg': '0 12px 40px 0 rgba(31, 38, 135, 0.12)',
        'glass-xl': '0 20px 60px 0 rgba(31, 38, 135, 0.15)',
        'inner-glass': 'inset 0 1px 2px 0 rgba(255, 255, 255, 0.8)',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      letterSpacing: {
        'tighter': '-0.02em',
        'tight': '-0.01em',
      },
    },
  },
  plugins: [],
};
export default config;
