import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "bcrypt", "@huggingface/transformers"],
};

export default nextConfig;
