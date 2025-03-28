import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    proxy: {
      'ws': {
        target: 'ws://filesync.home:3030',
        ws: true,
        rewriteWsOrigin: true
      }
    },
    hmr: {
      host: 'ws://filesync.home:3030',
      protocol: "ws",
      clientPort: 3030,
      overlay: false
    },
    allowedHosts: ["filesync.home"]
  },
  plugins: [reactRouter()]
});
