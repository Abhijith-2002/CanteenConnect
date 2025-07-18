module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#FF7A00', // Energetic Orange
        'brand-secondary': '#1E293B', // Dark Slate
        'brand-light': '#F1F5F9', // Light Background
        'status-paid': '#3B82F6', // Blue
        'status-preparing': '#F97316', // Orange
        'status-ready': '#22C55E', // Green
        'status-pending': '#64748B', // Gray
      },
    },
  },
  plugins: [],
};
