import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import pandacss from '@pandacss/dev/postcss'
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ isSsrBuild, command }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
        input: "./server/app.ts",
      }
      : undefined,
  },
  css: {
    postcss: {
      plugins: [pandacss, autoprefixer],
    },
  },
  ssr: {
    noExternal: command === "build" ? true : undefined,
  },
  plugins: [
    reactRouter(),
    tsconfigPaths(),
  ],
}));
