import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    allowedHosts: ["filesync.home"],
    hmr: {
      overlay: false,
      protocol: "ws",
      clientPort: 3030
    }
  },
  plugins: [reactRouter()]
});
