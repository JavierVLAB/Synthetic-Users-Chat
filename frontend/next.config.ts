import type { NextConfig } from "next";

// URL interna del backend dentro de la red Docker.
// Solo usada por el servidor de Next.js (server-side), nunca llega al navegador.
// En local sin Docker apunta a localhost:8000.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  output: "standalone",

  // Todas las llamadas al backend van a /api/* desde el navegador.
  // El servidor de Next.js las reenvía internamente al backend por la red Docker,
  // sin necesidad de exponer el puerto del backend al exterior.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
