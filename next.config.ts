import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root — other lockfiles exist higher up the tree, and
  // Next would otherwise infer the wrong root for build-trace collection.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
