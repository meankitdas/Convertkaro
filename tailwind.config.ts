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
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Red and Black Theme Colors
        'custom-red': '#FF3131',
        'custom-red-hover': '#FF4444',
        'custom-red-light': 'rgba(255, 49, 49, 0.8)',
        'custom-red-lighter': 'rgba(255, 49, 49, 0.6)',
        'custom-red-lightest': 'rgba(255, 49, 49, 0.4)',
        // Custom Gradient Background Colors
        'gradient-dark': '#020024',
        'gradient-blue': '#090979',
        'gradient-cyan': '#00D4FF',
        'black-primary': '#000000',
        'black-secondary': '#1F1F1F',
        'black-tertiary': '#2D2D2D',
        'gray-dark': '#374151',
      },
      fontFamily: {
        'museo': ['var(--font-museo-moderno)'],
      },
      backgroundImage: {
        'custom-gradient': 'linear-gradient(90deg, #FF3131, #FF914D)',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'gradient': 'gradient-shift 3s ease infinite',
        'pulse-ring': 'pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        glow: {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(168, 85, 247, 0.4)',
          },
          '50%': {
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.6), 0 0 30px rgba(168, 85, 247, 0.4)',
          },
        },
        'gradient-shift': {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
        },
        'pulse-ring': {
          '0%': {
            transform: 'scale(0.33)',
          },
          '40%, 50%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
            transform: 'scale(1.2)',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;