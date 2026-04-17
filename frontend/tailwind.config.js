/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./types.ts",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core palette — Blue-based modern theme
        primary:   '#0F172A',   // Deep navy (text, headings)
        secondary: '#2563EB',   // Vivid blue (main CTA, active states)
        accent:    '#F97316',   // Orange (highlights, XP, streaks)
        brand:     '#0EA5E9',   // Sky blue (links, tags)
        success:   '#10B981',   // Emerald green (progress, pass)
        surface:   '#1E3A5F',   // Dark blue surface (dark mode cards)

        // Portal identity colors
        'portal-student': '#2563EB',   // Blue
        'portal-teacher': '#0D9488',   // Teal
        'portal-admin':   '#4F46E5',   // Indigo
        'portal-bit':     '#0284C7',   // Sky
      },
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Fredoka"', 'sans-serif'],
      },
      backgroundImage: {
        'blue-gradient':   'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #0EA5E9 100%)',
        'teal-gradient':   'linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #14B8A6 100%)',
        'indigo-gradient': 'linear-gradient(135deg, #3730A3 0%, #4F46E5 50%, #6366F1 100%)',
        'sky-gradient':    'linear-gradient(135deg, #0369A1 0%, #0284C7 50%, #0EA5E9 100%)',
      },
      animation: {
        'reveal':      'reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float':       'float 6s ease-in-out infinite',
        'pulse-slow':  'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up':    'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        reveal: {
          '0%':   { transform: 'translateY(30px)', opacity: '0', filter: 'blur(10px)' },
          '100%': { transform: 'translateY(0)',    opacity: '1', filter: 'blur(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%':      { transform: 'translateY(-20px) rotate(1deg)' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
      },
      boxShadow: {
        'blue-glow':   '0 0 30px rgba(37, 99, 235, 0.3)',
        'teal-glow':   '0 0 30px rgba(13, 148, 136, 0.3)',
        'indigo-glow': '0 0 30px rgba(79, 70, 229, 0.3)',
        'sky-glow':    '0 0 30px rgba(2, 132, 199, 0.3)',
      },
    },
  },
  plugins: [],
}
