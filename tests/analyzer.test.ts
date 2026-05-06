import { describe, expect, it } from "vitest";
import { analyzeCode } from "@/analyzer/analyzeCode";
import { buildSimulation } from "@/analyzer/buildSimulation";
import { buildDebugReport, getRecommendedDemo } from "@/analyzer/debugReport";

describe("Phase 4 analyzer", () => {
  it("extracts promise/timer ordering and predicts output", async () => {
    const result = await analyzeCode(`
      console.log("A");
      setTimeout(() => console.log("B"), 0);
      Promise.resolve().then(() => console.log("C"));
      console.log("D");
    `);

    expect(result.ok).toBe(true);
    expect(result.patterns.map((pattern) => pattern.type)).toContain("setTimeout");
    expect(result.patterns.map((pattern) => pattern.type)).toContain("promise_then");

    const simulation = buildSimulation(result);
    const output = simulation.events.filter((event) => event.type === "console").map((event) => ("value" in event ? event.value : ""));
    expect(output).toEqual(["A", "D", "C", "B"]);
    expect(getRecommendedDemo(result)?.id).toBe("promise-before-timeout");
  });

  it("detects newer supported patterns", async () => {
    const result = await analyzeCode(`
      queueMicrotask(() => console.log("micro"));
      setInterval(() => console.log("tick"), 1000);
      Promise.reject("x").catch(() => console.log("caught"));
      Promise.all([a(), b()]);
    `);

    expect(result.patterns.map((pattern) => pattern.type)).toEqual(
      expect.arrayContaining(["queueMicrotask", "setInterval", "promise_catch", "promise_all"])
    );
    expect(result.confidence).toBe("Medium");
  });

  it("builds a shareable debug report", async () => {
    const result = await analyzeCode(`
      queueMicrotask(() => console.log("micro"));
      setTimeout(() => console.log("timer"), 0);
    `);
    const report = buildDebugReport(result);
    expect(report).toContain("JS Clarity Lab debug report");
    expect(report).toContain("Confidence:");
    expect(report).toContain("Predicted simplified output: micro -> timer");
  });

  it("warns for unsupported complexity", async () => {
    const result = await analyzeCode(`
      for (const item of items) {
        await fetch(item);
      }
    `);

    expect(result.warnings.some((warning) => warning.title.includes("loop") || warning.title.includes("Loop"))).toBe(true);
    expect(result.warnings.some((warning) => warning.title.includes("External API"))).toBe(true);
  });
});
