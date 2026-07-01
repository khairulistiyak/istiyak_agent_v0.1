// vite.config.ts
import { defineConfig } from "file:///Volumes/SSD/0.1/istiyak_agent_v0.1/apps/desktop/node_modules/vite/dist/node/index.js";
import react from "file:///Volumes/SSD/0.1/istiyak_agent_v0.1/apps/desktop/node_modules/@vitejs/plugin-react/dist/index.js";
var host = process.env.TAURI_DEV_HOST;
var vite_config_default = defineConfig(async () => ({
  plugins: [react()],
  resolve: {
    alias: {
      "zod/v4": "zod"
    }
  },
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? {
      protocol: "ws",
      host,
      port: 1421
    } : void 0,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"]
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVm9sdW1lcy9TU0QvMC4xL2lzdGl5YWtfYWdlbnRfdjAuMS9hcHBzL2Rlc2t0b3BcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Wb2x1bWVzL1NTRC8wLjEvaXN0aXlha19hZ2VudF92MC4xL2FwcHMvZGVza3RvcC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVm9sdW1lcy9TU0QvMC4xL2lzdGl5YWtfYWdlbnRfdjAuMS9hcHBzL2Rlc2t0b3Avdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuXG4vLyBAdHMtZXhwZWN0LWVycm9yIHByb2Nlc3MgaXMgYSBub2RlanMgZ2xvYmFsXG5jb25zdCBob3N0ID0gcHJvY2Vzcy5lbnYuVEFVUklfREVWX0hPU1Q7XG5cbi8vIGh0dHBzOi8vdml0ZS5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKGFzeW5jICgpID0+ICh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcInpvZC92NFwiOiBcInpvZFwiLFxuICAgIH0sXG4gIH0sXG5cbiAgLy8gVml0ZSBvcHRpb25zIHRhaWxvcmVkIGZvciBUYXVyaSBkZXZlbG9wbWVudCBhbmQgb25seSBhcHBsaWVkIGluIGB0YXVyaSBkZXZgIG9yIGB0YXVyaSBidWlsZGBcbiAgLy9cbiAgLy8gMS4gcHJldmVudCBWaXRlIGZyb20gb2JzY3VyaW5nIHJ1c3QgZXJyb3JzXG4gIGNsZWFyU2NyZWVuOiBmYWxzZSxcbiAgLy8gMi4gdGF1cmkgZXhwZWN0cyBhIGZpeGVkIHBvcnQsIGZhaWwgaWYgdGhhdCBwb3J0IGlzIG5vdCBhdmFpbGFibGVcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogMTQyMCxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgIGhvc3Q6IGhvc3QgfHwgZmFsc2UsXG4gICAgaG1yOiBob3N0XG4gICAgICA/IHtcbiAgICAgICAgICBwcm90b2NvbDogXCJ3c1wiLFxuICAgICAgICAgIGhvc3QsXG4gICAgICAgICAgcG9ydDogMTQyMSxcbiAgICAgICAgfVxuICAgICAgOiB1bmRlZmluZWQsXG4gICAgd2F0Y2g6IHtcbiAgICAgIC8vIDMuIHRlbGwgVml0ZSB0byBpZ25vcmUgd2F0Y2hpbmcgYHNyYy10YXVyaWBcbiAgICAgIGlnbm9yZWQ6IFtcIioqL3NyYy10YXVyaS8qKlwiXSxcbiAgICB9LFxuICB9LFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrVSxTQUFTLG9CQUFvQjtBQUMvVixPQUFPLFdBQVc7QUFHbEIsSUFBTSxPQUFPLFFBQVEsSUFBSTtBQUd6QixJQUFPLHNCQUFRLGFBQWEsYUFBYTtBQUFBLEVBQ3ZDLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxVQUFVO0FBQUEsSUFDWjtBQUFBLEVBQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUtBLGFBQWE7QUFBQTtBQUFBLEVBRWIsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osTUFBTSxRQUFRO0FBQUEsSUFDZCxLQUFLLE9BQ0Q7QUFBQSxNQUNFLFVBQVU7QUFBQSxNQUNWO0FBQUEsTUFDQSxNQUFNO0FBQUEsSUFDUixJQUNBO0FBQUEsSUFDSixPQUFPO0FBQUE7QUFBQSxNQUVMLFNBQVMsQ0FBQyxpQkFBaUI7QUFBQSxJQUM3QjtBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
