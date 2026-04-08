import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',    // blue-600
        secondary: '#4f46e5',  // indigo-600
        success: '#22c55e',    // green-500
        warning: '#eab308',    // yellow-500
        danger: '#ef4444',     // red-500
      },
    },
  },
  plugins: [],
}
export default config
