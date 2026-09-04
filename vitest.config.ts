import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    // happy-dom plutôt que jsdom : jsdom embarque sa propre version d'undici
    // qui entre en conflit avec celle intégrée à Node 20+ ("webidl.util.
    // markAsUncloneable is not a function"), ce qui casse le lancement des
    // workers de test en CI. happy-dom n'a pas cette dépendance et est plus
    // rapide, sans changer le comportement des tests ci-dessus.
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: [
      "tests/unit/**/*.test.{ts,tsx}",
      "tests/integration/**/*.test.{ts,tsx}",
    ],
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/app/**/page.tsx",
        "src/app/**/layout.tsx",
        "src/**/*.d.ts",
        "src/components/ui/**",
      ],
    },
  },
});
