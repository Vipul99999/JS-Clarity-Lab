import { describe, expect, it } from "vitest";
import { getClarityScore, productGuardrails } from "@/product/clarity";

describe("product clarity hardening", () => {
  it("states useful product guardrails", () => {
    expect(productGuardrails.canDo.length).toBeGreaterThanOrEqual(4);
    expect(productGuardrails.cannotDo.some((item) => item.includes("does not execute"))).toBe(true);
    expect(productGuardrails.bestUse.some((item) => item.includes("Analyze Code"))).toBe(true);
  });

  it("scores whether an analyzer result is actionable", () => {
    expect(getClarityScore({ hasAnswer: true, hasRisk: true, hasFix: true, hasNext: false })).toBe(3);
  });
});
