import { defineConfig, defineTextStyles } from "@pandacss/dev";

export const textStyles = defineTextStyles({
  body: {
    description: "The body text style - used in paragraphs",
    value: {
      fontFamily: "Inter",
      fontWeight: "500",
      fontSize: "12px",
      lineHeight: "24px",
      letterSpacing: "0",
      textDecoration: "None",
      textTransform: "None",
    },
  },
});

export default defineConfig({
  preflight: true,
  include: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  exclude: [],
  outdir: "carbonyxation",
  theme: {
    extend: {
      textStyles,
      tokens: {
        colors: {
          primary: {
            50: { value: "#a89f8d" }, // Lightest
            100: { value: "#958c7a" },
            200: { value: "#6e6760" },
            300: { value: "#403a32" }, // Original base color
            400: { value: "#2c2721" }, // Darkest
            500: { value: "#1c1915" }, // Even darker for depth
          },
          secondary: {
            50: { value: "#f5f3f0" }, // Almost white
            100: { value: "#e6e2dc" },
            200: { value: "#d8d3cf" }, // Original base color
            300: { value: "#c4bab3" },
            400: { value: "#f0ece2" },
            500: { value: "#b5a89b" },
          },
          accent: {
            50: { value: "#a1b5a9" },
            100: { value: "#89a093" },
            200: { value: "#496a57" }, // Original base color
            300: { value: "#3d5645" },
            400: { value: "#2c403a" },
            500: { value: "#1c2b26" },
          },
        },
        fonts: {
          body: { value: "IBM Plex Sans, system-ui, sans-serif" },
        },
      },
    },
  },
});
