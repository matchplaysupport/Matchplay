const expo = require("eslint-config-expo/flat");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
  ...expo,
  {
    // Only app/src/__tests__ are in the mobile tsconfig. Everything else (the
    // Next.js `web/` app, native projects, build output, tooling) has its own
    // config or no types — linting it here just produces "not in project" noise.
    ignores: [
      "node_modules/**",
      ".expo/**",
      "coverage/**",
      "dist/**",
      "supabase/functions/**",
      "web/**",
      "ios/**",
      "android/**",
      ".derivedData/**",
      "Library/**",
      "maestro/**",
      "scripts/**",
      ".local/**",
      ".pnpm-store/**"
    ]
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json"
      }
    },
    plugins: {
      "@typescript-eslint": tseslint
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
];
