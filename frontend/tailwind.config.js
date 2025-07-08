/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,ts,jsx,tsx}",
      "./pages/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
      extend: {
        colors: {
          midnight: "#2e003e",
          darkPurple: "#1a0024",
          primary: 'var(--color-primary)',
          primaryHover: 'var(--color-primary-hover)',
          accent: 'var(--color-accent)',
          textColor: 'var(--color-text)',
          subtext: 'var(--color-subtext)',
        },
      },
    },
    plugins: [],
  }
  