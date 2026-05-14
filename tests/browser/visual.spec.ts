import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";

const outputDir = join(process.cwd(), "test-results", "visual-qa");

async function capture(page: Page, name: string) {
  mkdirSync(outputDir, { recursive: true });
  const image = await page.screenshot({ fullPage: true });
  writeFileSync(join(outputDir, `${name}.png`), image);
  expect(image.length).toBeGreaterThan(20_000);
}

test("visual QA screenshots for core desktop pages", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });

  await page.goto("/");
  await capture(page, "home-desktop");

  await page.goto("/demo/promise-before-timeout");
  await expect(page.getByText("Short answer")).toBeVisible();
  await capture(page, "demo-desktop");

  await page.goto("/analyze");
  await expect(page.getByText("Paste code. Get a visual debug report you can trust.")).toBeVisible();
  await capture(page, "analyze-desktop");

  await page.goto("/node-playground?scenario=node-queue-priority&mode=problem");
  await expect(page.getByTestId("node-code-view")).toContainText('console.log("sync")');
  await capture(page, "node-playground-desktop");
});

test("visual QA screenshots for Node Playground mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/node-playground?scenario=node-queue-priority&mode=problem");
  await expect(page.getByTestId("node-code-view")).toContainText('console.log("sync")');
  await capture(page, "node-playground-mobile");
});
