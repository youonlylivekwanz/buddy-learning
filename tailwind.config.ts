import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        buddy: {
          // Official Base44 & Buddy Palette
          cream: "#FAF8F5",       // HSL(40, 20%, 98%) - main warm canvas
          creamMuted: "#F3F0E9",  // HSL(40, 15%, 94%) - secondary surfaces
          card: "#FFFFFF",        // crisp white cards
          border: "#E7E5E0",      // HSL(40, 10%, 90%) - hairline grid borders
          borderDark: "#D6D3CD",  // slightly deeper border
          charcoal: "#1C1917",    // HSL(30, 10%, 10%) - obsidian text
          charcoalMuted: "#44403C", // body secondary text
          charcoalLight: "#78716C", // metadata & labels
          pitch: "#141210",       // HSL(30, 10%, 8%) - dark pill/sidebar
          
          // Brand Primary (Exact match to uploaded logo & Base44 hsl(37, 92%, 55%))
          primary: "#F8991D",     // vibrant warm honey amber
          primaryHover: "#E5870E",
          primaryDark: "#C47006",
          primaryLight: "#FEF5E7", // HSL(37, 92%, 95%) - soft highlight tint
          primarySubtle: "#FFF9F0",
          primaryText: "#9C5B07", // HSL(37, 92%, 35%) - high contrast amber text

          // Functional Status (Base44)
          emerald: "#10B981",     // HSL(160, 60%, 45%)
          emeraldLight: "#ECFDF5",
          emeraldText: "#065F46",
          coral: "#EF4444",       // HSL(0, 72%, 51%)
          coralLight: "#FEF2F2",
          coralText: "#991B1B",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(28, 25, 23, 0.04), 0 1px 2px -1px rgba(28, 25, 23, 0.04)",
        card: "0 4px 6px -1px rgba(28, 25, 23, 0.05), 0 2px 4px -2px rgba(28, 25, 23, 0.05)",
        lift: "0 10px 15px -3px rgba(28, 25, 23, 0.07), 0 4px 6px -4px rgba(28, 25, 23, 0.05)",
        amberGlow: "0 0 0 2px rgba(248, 153, 29, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
