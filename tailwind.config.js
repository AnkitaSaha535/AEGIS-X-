export default {
  theme: {
    extend: {
      colors: {
        'neon-green': '#00FF66',
        'amber-accent': '#F59E0B',
        'red-accent': '#EF4444',
        midnight: {
          950: '#020617',
          900: '#0A0B0D',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 255, 102, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 255, 102, 0.4)' },
        },
      },
    },
  },
};
