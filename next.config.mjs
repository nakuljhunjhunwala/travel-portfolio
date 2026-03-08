/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.mapbox.com",
      },
      {
        protocol: "https",
        hostname: "places.googleapis.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "firebase/app",
      "firebase/auth",
      "firebase/firestore",
      "firebase/storage",
      "framer-motion",
      "@google/generative-ai",
    ],
  },
};

export default nextConfig;
