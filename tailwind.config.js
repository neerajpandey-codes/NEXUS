/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        nexus: {
          background: '#05060F',
          navy: '#0A0F24',
          surface: 'rgba(255, 255, 255, 0.04)',
          purple: '#8B5CF6',
          cyan: '#22D3EE',
          glow: '#6366F1',
          text: '#E6E9F5',
          muted: '#8B93B0',
        },
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: {
        glass: '0 12px 48px rgba(0, 0, 0, 0.24), 0 0 28px rgba(99, 102, 241, 0.08)',
      },
    },
  },
  plugins: [],
}
