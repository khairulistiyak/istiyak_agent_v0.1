import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.{git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
      "**/._*", // Exclude macOS AppleDouble files
    ],
    env: {
      JWT_SECRET: "test-secret-key-for-vitest",
      NODE_ENV: "test",
    },
  },
});
