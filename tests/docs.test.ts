import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

const requiredDocs = [
  "README.md",
  "docs/PRODUCT.md",
  "docs/ARCHITECTURE.md",
  "docs/SAFETY_SECURITY.md",
  "docs/SEO.md",
  "docs/OPERATIONS.md",
  "docs/CONTRIBUTING.md",
  "docs/LAUNCH_PACKAGE.md"
];

describe("documentation set", () => {
  it("keeps the complete product documentation files present", () => {
    for (const file of requiredDocs) {
      expect(existsSync(join(root, file)), file).toBe(true);
    }
  });

  it("explains product value, safety, SEO, and local development in the README", () => {
    const readme = readFileSync(join(root, "README.md"), "utf8");

    expect(readme).toContain("Product Promise");
    expect(readme).toContain("What Real Problems It Solves");
    expect(readme).toContain("Safety Model");
    expect(readme).toContain("SEO");
    expect(readme).toContain("pnpm qa:browser");
  });
});
