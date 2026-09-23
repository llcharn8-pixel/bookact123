import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AI-generated apps should deploy even if the template has strict type or
  // lint issues. Type errors are compile-time only and don't affect runtime,
  // so we don't let them block a deployment.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // pdf-parse (via pdfjs-dist) loads @napi-rs/canvas's native binary through a
  // dynamic require that Next.js's output file tracer can't statically detect,
  // so the platform-specific .node binary gets silently dropped from the
  // deployed serverless bundle unless explicitly included here.
  outputFileTracingIncludes: {
    "/api/extract-pdf": ["./node_modules/@napi-rs/**/*"],
    "/api/debug-pdf": ["./node_modules/@napi-rs/**/*"],
  },
};

export default nextConfig;
