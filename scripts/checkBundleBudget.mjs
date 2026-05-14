import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const manifestPath = join(root, ".next", "app-build-manifest.json");
const staticDir = join(root, ".next");

const budgets = {
  "/node-playground/page": 140_000,
  "/analyze/page": 155_000,
  "/demo/[id]/page": 155_000
};

if (!existsSync(manifestPath)) {
  console.log("Bundle budget skipped: run pnpm build first.");
  process.exit(0);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const failures = [];

for (const [route, maxBytes] of Object.entries(budgets)) {
  const files = manifest.pages?.[route] ?? [];
  const routeBytes = files
    .filter((file) => file.endsWith(".js") && file.includes("/app/"))
    .reduce((sum, file) => {
      const path = join(staticDir, file);
      return sum + (existsSync(path) ? statSync(path).size : 0);
    }, 0);

  if (routeBytes > maxBytes) {
    failures.push(`${route}: ${routeBytes} bytes > ${maxBytes} bytes`);
  }
}

if (failures.length) {
  console.error(`Bundle budget failed:\n${failures.join("\n")}`);
  process.exit(1);
}

console.log("Bundle budget passed.");
