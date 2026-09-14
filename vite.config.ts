import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendPort = env.VITE_BACKEND_PORT || "4000";
  const vitePort = env.VITE_VITE_PORT || "5173";

  return {
    plugins: [react()],
    server: {
      port: Number(vitePort),
      proxy: {
        // Intercepta SOLO las peticiones que empiecen por /api
        "/api": {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
          // IMPORTANTE: Si las rutas de tu backend original (Node/Express/Nest)
          // NO empiezan por /api, esta línea quita el prefijo justo antes de llegar al backend.
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
