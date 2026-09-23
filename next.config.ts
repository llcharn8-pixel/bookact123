import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AI-generated apps should deploy even if the template has strict type or
  // lint issues. Type errors are compile-time only and don't affect runtime,
  // so we don't let them block a deployment.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // pdf-parse (via pdfjs-dist) loads @napi-rs/canvas's native .node binary at
  // runtime. Webpack bundling that native addon breaks its module resolution
  // entirely ("Cannot find module '@napi-rs/canvas'" even though it's
  // installed) — outputFileTracingIncludes alone doesn't fix this, because
  // the problem isn't a missing file, it's webpack mangling the require.
  // serverExternalPackages tells Next.js to skip bundling these and
  // require() them directly from node_modules at runtime instead.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "@napi-rs/canvas"],
  // Being external means Next.js's file tracer must independently detect
  // and copy these into the deployed function output — it can't, because
  // pdfjs-dist's require of @napi-rs/canvas is inside a try/catch, invisible
  // to static tracing. Force-include the whole @napi-rs scope so whichever
  // platform-specific native binary Vercel's own npm install resolved
  // (e.g. @napi-rs/canvas-linux-x64-gnu) actually ships with the function.
  outputFileTracingIncludes: {
    "/api/extract-pdf": [
      "./node_modules/@napi-rs/**/*",
      "./node_modules/pdfjs-dist/**/*",
    ],
  },
};

export default nextConfig;
