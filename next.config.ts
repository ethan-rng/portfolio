import type { NextConfig } from "next";

const config: NextConfig = {
  // Match the WordPress permalinks: /projects/, /cityflow/, ...
  trailingSlash: true,
  // plain static files, served by GitHub Pages (see .github/workflows/pages.yml)
  output: "export",
  // *.dev.tsx routes (the /trace outline editor) only exist under `next dev`, so they're never built or deployed
  pageExtensions: process.env.NODE_ENV === "production" ? ["tsx", "ts"] : ["dev.tsx", "tsx", "ts"],
};

export default config;
