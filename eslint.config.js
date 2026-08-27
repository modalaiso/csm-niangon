import { defineConfig } from "eslint/config";
import unicorn from "eslint-plugin-unicorn";

export default defineConfig([
  // …
  {
    files: ["**/*.js"],
    plugins: {
      unicorn,
    },
    extends: ["unicorn/recommended"],
    rules: {
      "unicorn/prefer-module": "warn",
    },
  },
]);
