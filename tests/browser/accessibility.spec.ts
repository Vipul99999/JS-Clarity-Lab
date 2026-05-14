import { expect, test } from "@playwright/test";

test("keyboard users can reach core actions from home", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
});

test("Node Playground exposes named controls and reduced mobile drawer flow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/node-playground?scenario=node-queue-priority&mode=problem");

  await expect(page.getByLabel("Open sidebar")).toBeVisible();
  await expect(page.getByLabel("Timeline scrubber")).toBeVisible();
  await expect(page.getByLabel("Playback speed")).toBeVisible();
  await expect(page.getByTestId("node-code-view")).toBeVisible();

  await page.getByLabel("Open sidebar").click();
  await expect(page.getByRole("button", { name: "Close sidebar", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close sidebar", exact: true }).click();
  await expect(page.getByLabel("Open sidebar")).toBeVisible();
});
