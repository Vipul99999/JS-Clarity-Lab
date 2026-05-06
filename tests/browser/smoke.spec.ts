import { expect, test } from "@playwright/test";

test("home and analyzer render key trust surfaces", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Paste code analyzer")).toBeVisible();
  await expect(page.getByText("Start from the bug you actually see")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Node.js Runtime" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Real-World Bugs" })).toBeVisible();

  await page.goto("/analyze");
  await expect(page.getByText("Curated real-world examples")).toBeVisible();
  await page.getByRole("button", { name: "Analyze Code" }).click();
  await expect(page.getByText("Analysis summary")).toBeVisible();
  await expect(page.getByText("Confidence:", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Debug report", exact: true })).toBeVisible();
  await expect(page.getByText("Recent analyses")).toBeVisible();
});

test("editable demo exposes production playbook", async ({ page }) => {
  await page.goto("/demo/interval-leak");
  await expect(page.getByText("Production playbook")).toBeVisible();
  await expect(page.getByText("Share this variation")).toBeVisible();
});

test("new real-world demos visualize production concepts", async ({ page }) => {
  await page.goto("/demo/process-nexttick-priority");
  await expect(page.getByRole("heading", { name: "process.nextTick vs Promise", exact: true })).toBeVisible();
  await expect(page.getByText("Where you will face this")).toBeVisible();

  await page.goto("/demo/react-batched-state-log");
  await expect(page.getByRole("heading", { name: "React batched state log", exact: true })).toBeVisible();
  await expect(page.getByText("React forms, counters, analytics events").first()).toBeVisible();
});
