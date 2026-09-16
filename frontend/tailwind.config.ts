import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FAF6FB',   // Ultra-crisp luxury white
          100: '#F5EBF9',  // Pearlescent amethyst tint
          200: '#EBD5F3',  // Gentle pastel amethyst
          300: '#DCB6EC',  // Soft orchid amethyst
          400: '#B869D1',  // Bright amethyst highlight
          500: '#903EB0',  // Radiant royal amethyst
          600: '#73308A',  // EXACT SIGNATURE PRIMARY COLOR (#73308a)
          700: '#5D2471',  // Deep imperial amethyst
          800: '#471A57',  // Midnight velvet amethyst
          900: '#32113E',  // Obsidian amethyst
          950: '#1E0726',  // Pitch-dark luxury amethyst
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        lg: '16px',
        md: '12px',
        sm: '8px',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
