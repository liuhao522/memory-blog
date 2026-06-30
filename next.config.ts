import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/memory-blog",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
