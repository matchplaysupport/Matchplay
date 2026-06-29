import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Next 16 ships the experimental react-hooks (React Compiler) rule as an
    // error. It flags legitimate init patterns (count-up, theme read, calculator)
    // across the app — surface as a warning instead of failing CI for now.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    // Pre-existing lint debt in the admin dashboard (entity escaping, in-app
    // <a> links). Warn instead of failing CI; to be cleaned up by admin owners.
    // Marketing pages keep these as errors.
    files: ["app/admin/**/*.{ts,tsx}"],
    rules: {
      "react/no-unescaped-entities": "warn",
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
]);

export default eslintConfig;
