```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      margin: {
        'sidebar': '260px',
      },
      maxWidth: {
        'screen-4xl': '2520px',
      },
    },
  },
  plugins: [],
};
```