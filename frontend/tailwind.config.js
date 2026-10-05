export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#0b1020",
        panel: "#101827",
        accent: "#f59e0b",
        glow: "#8b5cf6"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(15, 23, 42, 0.45)"
      }
    }
  },
  plugins: []
};
