import { expect, test } from "@playwright/test";

test("home and analyzer render key trust surfaces", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("I want to debug pasted code")).toBeVisible();
  await expect(page.getByText("I want to understand a confusing output")).toBeVisible();
  await expect(page.getByText("How does Node run this?")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Product map" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Real problems solved" })).toBeVisible();
  await expect(page.getByText("Your clarity progress")).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Start Here" })).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Find Cases" })).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Real Bug Clinic" })).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Concept Atlas" })).toBeVisible();

  await page.goto("/analyze");
  await expect(page.getByText("Curated real-world examples")).toBeVisible();
  await page.getByRole("button", { name: "Analyze Code" }).click();
  await expect(page.getByText("Analysis summary")).toBeVisible();
  await expect(page.getByRole("heading", { name: "What should I do next?", exact: true })).toBeVisible();
  await expect(page.getByText("Confidence:", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Debug report", exact: true })).toBeVisible();
  await expect(page.getByText("Recent analyses")).toBeVisible();
});

test("real bug clinic maps symptoms to fixes", async ({ page }) => {
  await page.goto("/clinic");
  await expect(page.getByRole("heading", { name: "Start from the production symptom, not the JavaScript term.", exact: true })).toBeVisible();
  await page.getByPlaceholder("Search slow API, memory, stream, flaky test...").fill("memory");
  await expect(page.getByRole("heading", { name: "Memory keeps growing over time", exact: true })).toBeVisible();
  await expect(page.getByText("Likely cause:")).toBeVisible();
  await expect(page.getByRole("link", { name: /Open case/ })).toBeVisible();
  await expect(page.getByText("Concepts behind this bug")).toBeVisible();
});

test("concept atlas explains runtime concepts with cases", async ({ page }) => {
  await page.goto("/concepts");
  await expect(page.getByRole("heading", { name: "Break down the runtime concept behind the bug.", exact: true })).toBeVisible();
  await page.getByPlaceholder("Search concepts: await, memory, streams, worker pool, Promise.all...").fill("worker pool");
  await expect(page.getByRole("heading", { name: "Why Node gets slow under async load", exact: true })).toBeVisible();
  await expect(page.getByText("Mental model:")).toBeVisible();
  await expect(page.getByText("Thread pool saturation")).toBeVisible();
});

test("discover helps users find the right case", async ({ page }) => {
  await page.goto("/discover");
  await expect(page.getByRole("heading", { name: "Find the exact JavaScript confusion you are trying to solve.", exact: true })).toBeVisible();
  await expect(page.getByText("I saw weird output")).toBeVisible();
  await page.getByPlaceholder("Search timers, streams, memory leaks, testing, worker pool...").fill("worker pool");
  await expect(page.getByText("Thread pool saturation")).toBeVisible();
  await expect(page.getByText("DNS lookup and worker pressure")).toBeVisible();
});

test("start here path gives a guided learning sequence", async ({ page }) => {
  await page.goto("/start");
  await expect(page.getByRole("heading", { name: "A calm path from confused to clear.", exact: true })).toBeVisible();
  await expect(page.getByText("Why did this print first?")).toBeVisible();
  await expect(page.getByText("How does Node run this?")).toBeVisible();
});

test("node playground renders dynamic runtime panels", async ({ page }) => {
  await page.goto("/node-playground");
  await expect(page.getByRole("heading", { name: "Code", exact: true })).toBeVisible();
  await expect(page.getByTestId("node-code-view")).toContainText('console.log("sync")');
  await expect(page.getByText("Scenario library")).toBeVisible();
  await expect(page.getByText("Node queue priority").first()).toBeVisible();
  await page.getByRole("button", { name: "Visual" }).click();
  await expect(page.getByText("NextTick Queue")).toBeVisible();
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.getByText("sync").first()).toBeVisible();

  await page.getByRole("button", { name: "Thread pool saturation" }).click();
  await page.getByRole("button", { name: "Pro", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Thread Pool", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Problem" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Fixed" }).first()).toBeVisible();
  await expect(page.getByText("Pro Mode:")).toBeVisible();
});

test("node playground keeps code visible and sidebar usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/node-playground?scenario=node-queue-priority&mode=problem");
  await expect(page.getByRole("heading", { name: "Code", exact: true })).toBeVisible();
  await expect(page.getByTestId("node-code-view")).toContainText('console.log("sync")');
  await expect(page.getByRole("heading", { name: "Visual runtime", exact: true })).toBeVisible();
  await page.getByLabel("Open sidebar").click();
  await expect(page.getByRole("complementary").getByText("Scenario library - 30 cases")).toBeVisible();
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
