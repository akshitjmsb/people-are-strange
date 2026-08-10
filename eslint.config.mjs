import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  globalIgnores(["**/node_modules/", "**/.next/", "**/drizzle/"]),
  {
    extends: [...nextCoreWebVitals],
    rules: {
      // These React Compiler diagnostics predate the React 19 upgrade. Keep
      // the existing render and map behaviour stable; address them in a
      // focused refactor rather than folding it into a framework migration.
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
