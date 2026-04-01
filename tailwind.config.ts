import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#faf8f4",
        cream2: "#f3f0ea",
        ink: "#1c1814",
        gold: "#b8860b",
        mist: "#9e9590",
        green: "#3a7d44",
        red: "#c4463a",
        brown3: "#7a6254",
        border: "rgba(44,24,16,.1)",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
