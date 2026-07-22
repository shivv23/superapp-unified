import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#E8ECF4",
          100: "#C5CEE4",
          200: "#8F9DC9",
          300: "#5A6BAE",
          400: "#2E4093",
          500: "#0B1D3A",
          600: "#091831",
          700: "#071228",
          800: "#050D1F",
          900: "#030816",
          950: "#01040D",
        },
        blue: {
          50: "#EBF1FD",
          100: "#D0DEF9",
          200: "#A1BDF3",
          300: "#729CED",
          400: "#437BE7",
          500: "#1A56DB",
          600: "#1545AF",
          700: "#103483",
          800: "#0B2357",
          900: "#06122B",
        },
        gold: {
          50: "#FDF4E5",
          100: "#FBE8C7",
          200: "#F7D18F",
          300: "#F3BA57",
          400: "#F5A623",
          500: "#D48E1B",
          600: "#B37614",
          700: "#925E0D",
          800: "#714606",
          900: "#502E00",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient":
          "linear-gradient(135deg, #0B1D3A 0%, #1A56DB 50%, #0B1D3A 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        "gold-gradient":
          "linear-gradient(135deg, #F5A623 0%, #D48E1B 100%)",
        "blue-gradient":
          "linear-gradient(135deg, #1A56DB 0%, #437BE7 100%)",
        "dark-gradient":
          "linear-gradient(180deg, #0B1D3A 0%, #050D1F 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "slide-in-left": "slideInLeft 0.5s ease-out forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(26,86,219,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(26,86,219,0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.36)",
        "glass-sm": "0 4px 16px 0 rgba(0, 0, 0, 0.24)",
        glow: "0 0 20px rgba(26, 86, 219, 0.3)",
        "glow-gold": "0 0 20px rgba(245, 166, 35, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
