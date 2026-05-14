import { describe, expect, it } from "vitest";
import { demos, getDemo } from "@/demos";
import { nodeScenarios } from "@/nodePlayground/scenarios";
import { buildDemoPageCopy } from "@/product/demoCopy";
import { topicLandingPages } from "@/product/topicLandingPages";

describe("content quality pass", () => {
  it("gives every guided demo a fast short answer and real-world bug framing", () => {
    for (const demo of demos) {
      const copy = buildDemoPageCopy(demo);

      expect(copy.shortAnswer.length, demo.id).toBeGreaterThan(35);
      expect(copy.realWorldBug.length, demo.id).toBeGreaterThan(60);
      expect(copy.fixedNote.length, demo.id).toBeGreaterThan(40);
      expect(copy.wrongAssumption.length, demo.id).toBeGreaterThan(20);
      expect(copy.fixedCode.length, demo.id).toBeGreaterThan(20);
      expect(copy.visualProof.length, demo.id).toBeGreaterThan(50);
      expect(copy.howToVerify.length, demo.id).toBeGreaterThan(50);
    }
  });

  it("keeps SEO topic pages connected to real practice surfaces", () => {
    for (const page of topicLandingPages) {
      const hasDemo = Boolean(getDemo(page.primaryDemoId));
      const hasNodeScenario = page.nodeScenarioId ? nodeScenarios.some((scenario) => scenario.id === page.nodeScenarioId) : true;

      expect(page.title.length, page.slug).toBeGreaterThan(8);
      expect(page.description.length, page.slug).toBeGreaterThan(70);
      expect(page.shortAnswer.length, page.slug).toBeGreaterThan(80);
      expect(page.searchIntent.length, page.slug).toBeGreaterThanOrEqual(3);
      expect(hasDemo, page.slug).toBe(true);
      expect(hasNodeScenario, page.slug).toBe(true);
    }
  });
});
