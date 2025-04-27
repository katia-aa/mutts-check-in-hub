
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Adding our custom color palette
        mutts: {
          primary: "#8C81BD",
          secondary: "#E79F52",
          accent: "#F48FA8",
          black: "#000000",
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "confetti-slow": {
          "0%": { transform: "translate3d(0,0,0) rotateX(0) rotateY(0)" },
          "100%": { transform: "translate3d(25px,105vh,0) rotateX(360deg) rotateY(180deg)" },
        },
        "confetti-medium": {
          "0%": { transform: "translate3d(0,0,0) rotateX(0) rotateY(0)" },
          "100%": { transform: "translate3d(100px,105vh,0) rotateX(100deg) rotateY(360deg)" },
        },
        "confetti-fast": {
          "0%": { transform: "translate3d(0,0,0) rotateX(0) rotateY(0)" },
          "100%": { transform: "translate3d(-50px,105vh,0) rotateX(10deg) rotateY(250deg)" },
        },
        "scale-up": {
          "0%": { transform: "scale(0)" },
          "70%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        }
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "confetti-slow": "confetti-slow 3s ease-in-out infinite",
        "confetti-medium": "confetti-medium 2s ease-in-out infinite",
        "confetti-fast": "confetti-fast 1s ease-in-out infinite",
        "scale-up": "scale-up 0.3s ease-out"
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
