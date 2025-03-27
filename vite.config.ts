import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

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
      protocol: "ws",
      clientPort: 3030,
      overlay: false
    }
  },
  plugins: [remix({
    // ignoredRouteFiles: ["**/*.css"],
    future: {
      v3_fetcherPersist: true,
      v3_relativeSplatPath: true,
      v3_throwAbortReason: true,
      v3_lazyRouteDiscovery: true,
      v3_singleFetch: true,
      v3_routeConfig: true,
      unstable_optimizeDeps: true,
      // unstable_routeConfig: true,
    }
  })],
});
