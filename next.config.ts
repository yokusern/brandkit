import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@anthropic-ai/sdk", "firebase-admin", "stripe"],
};

export default nextConfig;
