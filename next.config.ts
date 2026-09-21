import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // webpack mis-bundles the optional native helpers of `ws`, which made every
  // agent socket write throw "bufferUtil.mask is not a function". Loading
  // these straight from node_modules avoids it.
  serverExternalPackages: [
    "ws",
    "bufferutil",
    "utf-8-validate",
    "@openai/realtime-api-beta",
    "@stream-io/openai-realtime-api",
  ],
};

export default nextConfig;
