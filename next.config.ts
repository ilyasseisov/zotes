import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  rules: {
    "@typescript-eslint/no-explicit-any": "off", // Turns off the rule
    // Or to warn instead of error:
    // "@typescript-eslint/no-explicit-any": "warn",
  },
};

export default nextConfig;
