import { describe, expect, it } from "vitest";
import { categories, demos } from "@/demos";

describe("demo catalog", () => {
  it("ships the expanded real-world concept set", () => {
    expect(demos).toHaveLength(56);
    expect(categories.map((category) => category.id)).toEqual([
      "event-loop",
      "promises",
      "async-await",
      "memory",
      "performance",
      "node-runtime",
      "real-world"
    ]);
  });

  it("keeps every guided demo prediction-focused and production-relevant", () => {
    const ids = new Set<string>();

    for (const demo of demos) {
      expect(ids.has(demo.id)).toBe(false);
      ids.add(demo.id);
      expect(demo.concept.length).toBeGreaterThan(20);
      expect(demo.prediction.question.length).toBeGreaterThan(10);
      expect(demo.events.length).toBeGreaterThan(3);
      expect(demo.explanation.realWorld.length).toBeGreaterThan(30);
    }
  });
});
