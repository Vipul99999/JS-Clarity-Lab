import { describe, expect, it } from "vitest";
import { getNodeStateAtStep } from "@/nodePlayground/engine";
import { summarizeNodeTrace } from "@/nodePlayground/trace";
import { validateScenarioLibrary } from "@/nodePlayground/quality";
import { compareScenarioModes } from "@/nodePlayground/compare";
import { createNodeScenario, httpLifecycle, queueOrder, streamBackpressure, threadPoolBurst } from "@/nodePlayground/authoring";
import { nodeScenarioCategories, nodeScenarios } from "@/nodePlayground/scenarios";

describe("node playground", () => {
  it("ships a 30-case Node scenario library", () => {
    expect(nodeScenarios).toHaveLength(30);
    expect(new Set(nodeScenarios.map((scenario) => scenario.id)).size).toBe(30);
  });

  it("covers the complete product category map", () => {
    expect(nodeScenarioCategories).toEqual([
      "Node.js Fundamentals",
      "Async & Event Loop",
      "Streams & Buffers",
      "Files & Networking",
      "Errors & Debugging",
      "Memory & Performance",
      "Security",
      "Testing",
      "Deployment",
      "Interview Questions"
    ]);

    for (const category of nodeScenarioCategories) {
      expect(nodeScenarios.some((scenario) => scenario.category === category)).toBe(true);
    }
  });

  it("ships advanced scenarios with problem and fixed timelines", () => {
    const advanced = nodeScenarios.filter((scenario) => scenario.fixedCode);

    expect(advanced.length).toBeGreaterThanOrEqual(8);
    for (const scenario of advanced) {
      expect(scenario.whatGoesWrong?.length ?? 0).toBeGreaterThan(20);
      expect(scenario.whyFixWorks?.length ?? 0).toBeGreaterThan(20);
      expect(scenario.fixedEvents?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("visualizes Node-specific queues and worker pool state", () => {
    const queueScenario = nodeScenarios.find((scenario) => scenario.id === "node-queue-priority");
    const poolScenario = nodeScenarios.find((scenario) => scenario.id === "threadpool-saturation");

    expect(queueScenario).toBeDefined();
    expect(poolScenario).toBeDefined();

    const queueState = getNodeStateAtStep(queueScenario!.events, 12);
    expect(queueState.nextTickQueue).toContain("process.nextTick");
    expect(queueState.microtaskQueue).toContain("Promise.then");

    const poolState = getNodeStateAtStep(poolScenario!.events, 14);
    expect(poolState.threadPool.some((task) => task.status === "queued")).toBe(true);
    expect(poolState.threadPool.some((task) => task.status === "running")).toBe(true);
  });

  it("validates every scenario against the product quality contract", () => {
    const contracts = validateScenarioLibrary(nodeScenarios);

    expect(contracts.every((contract) => contract.valid)).toBe(true);
    for (const contract of contracts) {
      expect(contract.concept.length).toBeGreaterThan(20);
      expect(contract.visualEvents.length).toBeGreaterThan(0);
      expect(contract.fixedVersion.code.length).toBeGreaterThan(5);
      expect(contract.recommendedNextId).toBeTruthy();
      expect(contract.bugRecipe.symptom.length).toBeGreaterThan(20);
      expect(contract.bugRecipe.visualProof.length).toBeGreaterThan(0);
      expect(contract.bugRecipe.howToVerify.length).toBeGreaterThan(0);
    }
  });

  it("summarizes Node runtime traces with production-focused risks", () => {
    const poolScenario = nodeScenarios.find((scenario) => scenario.id === "threadpool-saturation")!;
    const streamScenario = nodeScenarios.find((scenario) => scenario.id === "stream-backpressure-pipe")!;
    const httpScenario = nodeScenarios.find((scenario) => scenario.id === "http-db-lifecycle")!;

    const poolSummary = summarizeNodeTrace(poolScenario.events, poolScenario);
    expect(poolSummary.threadPool.pressure).toBe("high");
    expect(poolSummary.findings.some((finding) => finding.area === "threadPool")).toBe(true);

    const streamSummary = summarizeNodeTrace(streamScenario.events, streamScenario);
    expect(streamSummary.streams.status).toBe("backpressure risk");
    expect(streamSummary.findings.some((finding) => finding.area === "streams")).toBe(true);

    const httpSummary = summarizeNodeTrace(httpScenario.events, httpScenario);
    expect(httpSummary.httpLifecycle.detected).toBe(true);
    expect(httpSummary.httpLifecycle.status).toBe("waiting on I/O");
  });

  it("provides authoring helpers for consistent future scenarios", () => {
    const scenario = createNodeScenario({
      id: "authoring-smoke",
      title: "Authoring smoke",
      category: "Async & Event Loop",
      level: "beginner",
      concept: "Authoring helpers create repeatable visual timelines for new runtime cases.",
      realWorld: "Product builders can add new scenarios without hand-writing every event.",
      problemCode: "console.log('A')",
      events: queueOrder({ sync: ["A"], nextTick: ["tick"], microtasks: ["promise"], timers: [{ name: "timer" }] }),
      prediction: { type: "order", question: "What runs?", options: ["A", "tick", "promise", "timer"], correct: ["A", "tick", "promise", "timer"] },
      explanation: { summary: "Helpers create events.", steps: ["Sync", "Queues"], mistake: "Manual drift.", realWorld: "Scenario authoring." }
    });

    expect(scenario.panels).toEqual(expect.arrayContaining(["microtasks", "timers"]));
    expect(threadPoolBurst([{ name: "hash", work: "crypto", duration: 10 }]).some((event) => event.type === "threadpool_start")).toBe(true);
    expect(httpLifecycle({ route: "GET /x", dependency: "db", wait: 10, response: "200" }).some((event) => event.type === "io_run")).toBe(true);
    expect(streamBackpressure().some((event) => event.type === "stream_backpressure")).toBe(true);
  });

  it("compares problem and fixed scenario impact", () => {
    const scenario = nodeScenarios.find((item) => item.id === "blocking-json-parse")!;
    const comparison = compareScenarioModes(scenario);

    expect(comparison.hasFixedVersion).toBe(true);
    expect(comparison.blocked.problem).toBeGreaterThan(comparison.blocked.fixed);
    expect(comparison.saferSummary.length).toBeGreaterThan(10);
  });
});
