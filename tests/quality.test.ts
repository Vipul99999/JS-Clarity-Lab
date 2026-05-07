import { describe, expect, it } from "vitest";
import { canProductHelp, getCoverageSummary, getQualitySnapshot, runtimeCoverage } from "@/product/coverage";

describe("quality and coverage dashboard", () => {
  it("summarizes runtime coverage clearly", () => {
    const summary = getCoverageSummary();

    expect(runtimeCoverage.length).toBeGreaterThanOrEqual(10);
    expect(summary.percent).toBeGreaterThan(50);
    expect(summary.counts["fully visualized"]).toBeGreaterThan(0);
    expect(summary.counts.unsupported).toBeGreaterThan(0);
  });

  it("checks whether the product can help with real symptoms", () => {
    const slowApi = canProductHelp("my API is slow");
    const stream = canProductHelp("stream hangs");

    expect(slowApi.href).toContain("node-playground");
    expect(slowApi.bestTool).toBe("Node Runtime Lab");
    expect(stream.href).toContain("stream-error-handling");
  });

  it("keeps a product quality snapshot", () => {
    const snapshot = getQualitySnapshot();

    expect(snapshot.totals.total).toBeGreaterThan(80);
    expect(snapshot.qualityScore).toBeGreaterThan(0);
    expect(Array.isArray(snapshot.issues)).toBe(true);
  });
});
