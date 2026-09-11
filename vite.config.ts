import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendPort = env.VITE_BACKEND_PORT || '4000';
  const vitePort = env.VITE_VITE_PORT || '5173';

  return {
    plugins: [react()],
    server: {
      port: Number(vitePort),
      proxy: {
        "/auth": {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
        },
        "/users": {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
        },
        "/cameras": {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
        },
        "/roles": {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
        },
        "/tasks": {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
        },
      },
    },
  };
});
