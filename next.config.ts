import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable React strict mode during development to avoid double renders
  // interfering with Supabase auth state reconciliation.
  reactStrictMode: true,
};

export default nextConfig;
