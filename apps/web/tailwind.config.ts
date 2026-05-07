import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0f1117",
        card: "#1a1d27",
        "card-border": "#2a2d3a",
        nav: "#13151f",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInBar: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 4px #22c55e" },
          "50%": { opacity: "0.5", boxShadow: "0 0 10px #22c55e" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(1.5)" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        underlineSlide: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        "fade-in": "fadeInUp 0.4s ease-out both",
        "slide-in-bar": "slideInBar 0.7s cubic-bezier(0.4,0,0.2,1) both",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "pulse-dot": "pulseDot 1.5s ease-in-out infinite",
        "pop-in": "popIn 0.35s ease-out both",
        "underline-slide": "underlineSlide 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
