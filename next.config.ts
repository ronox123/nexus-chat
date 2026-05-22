import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root: a parent-level lockfile exists at C:\Users\User,
  // which would otherwise be inferred as the root.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
