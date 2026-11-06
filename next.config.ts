import type { NextConfig } from "next";

const config: NextConfig = {
  // Match the WordPress permalinks: /projects/, /cityflow/, ...
  trailingSlash: true,
  // plain static files, served by GitHub Pages (see .github/workflows/pages.yml)
  output: "export",
};

export default config;
