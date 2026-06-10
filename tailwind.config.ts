import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark:    '#5A2F1A',
          mid:     '#7A4A2A',
          light:   '#C08A3A',
          mustard: '#D3A24D',
          beige:   '#faf2c5',
          ocre:    '#f5dbb5',
          muted:   '#7a5a3a',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans:  ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
