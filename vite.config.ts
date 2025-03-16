import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import pandacss from '@pandacss/dev/postcss'
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  css: {
    postcss: {
      plugins: [pandacss, autoprefixer],
    },
  },
  server: {
    allowedHosts: ["4d9e-110-169-141-206.ngrok-free.app"]
  },
  plugins: [
    reactRouter(),
    tsconfigPaths(),
  ],
});
