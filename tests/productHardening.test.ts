import { describe, expect, it } from "vitest";
import { buildAnalyzerActionPlan } from "@/analyzer/actionPlan";
import { analyzeCode } from "@/analyzer/analyzeCode";
import { demos, editableDemos } from "@/demos";
import { summarizeTrace } from "@/engine/trace";
import { compareScenarioModes } from "@/nodePlayground/compare";
import { buildScenarioContract } from "@/nodePlayground/quality";
import { nodeScenarios } from "@/nodePlayground/scenarios";
import { summarizeNodeTrace } from "@/nodePlayground/trace";
import { runtimeCoverage } from "@/product/coverage";
import { symptomMatches } from "@/product/symptoms";

const appRoutes = new Set(["/", "/start", "/clinic", "/concepts", "/analyze", "/discover", "/node-playground", "/quality"]);

function routeExists(href: string) {
  const path = href.split("?")[0];
  if (appRoutes.has(path)) return true;
  if (path?.startsWith("/demo/")) return demos.some((demo) => `/demo/${demo.id}` === path) || editableDemos.some((demo) => `/demo/${demo.id}` === path);
  if (path === "/node-playground") {
    const id = new URL(`http://x${href}`).searchParams.get("scenario");
    return !id || nodeScenarios.some((scenario) => scenario.id === id);
  }
  return false;
}

describe("product hardening gates", () => {
  it("maps every symptom and coverage entry to a valid route", () => {
    for (const symptom of symptomMatches) expect(routeExists(symptom.href), symptom.href).toBe(true);
    for (const item of runtimeCoverage) expect(routeExists(item.href), item.href).toBe(true);
  });

  it("keeps every case real-world relevant", () => {
    for (const demo of demos) expect(demo.explanation.realWorld.length).toBeGreaterThan(30);
    for (const demo of editableDemos) expect(demo.generateExplanation(demo.defaultParams).realWorld.length).toBeGreaterThan(30);
    for (const scenario of nodeScenarios) expect(scenario.realWorld.length).toBeGreaterThan(30);
  });

  it("ensures every Node fixed scenario has comparison data", () => {
    for (const scenario of nodeScenarios.filter((item) => item.fixedCode)) {
      const comparison = compareScenarioModes(scenario);
      expect(comparison.hasFixedVersion, scenario.id).toBe(true);
      expect(comparison.saferSummary.length, scenario.id).toBeGreaterThan(10);
    }
  });

  it("keeps Node scenario contracts complete", () => {
    for (const scenario of nodeScenarios) {
      const contract = buildScenarioContract(scenario, nodeScenarios);
      expect(contract.valid, `${scenario.id}: ${contract.issues.join(", ")}`).toBe(true);
      expect(contract.bugRecipe.visualProof.length).toBeGreaterThan(0);
    }
  });

  it("explains analyzer confidence with simulated, detected-only, and unsupported signals", async () => {
    const result = await analyzeCode(`
      app.get("/x", async () => {
        fs.readFileSync("x");
        Promise.resolve().then(() => console.log("done"));
      });
    `);
    const plan = buildAnalyzerActionPlan(result);
    expect(plan?.trustLevel).toBe("partially simulated");
    expect(plan?.nodeBridge?.href).toContain("node-playground");
  });
});

describe("scenario regression snapshots", () => {
  it("locks important guided demo output and risk flags", () => {
    const demo = demos.find((item) => item.id === "promise-before-timeout")!;
    const summary = summarizeTrace(demo.events);
    expect(summary.consoleOutput).toEqual(["A", "D", "C", "B"]);
    expect(demo.events.length).toBeGreaterThan(8);
    expect(summary.riskFlags.some((flag) => flag.includes("Timers and microtasks"))).toBe(true);
  });

  it("locks important Node scenario runtime diagnosis", () => {
    const scenario = nodeScenarios.find((item) => item.id === "threadpool-saturation")!;
    const summary = summarizeNodeTrace(scenario.events, scenario);
    const comparison = compareScenarioModes(scenario);
    expect(summary.threadPool.pressure).toBe("high");
    expect(summary.findings.some((finding) => finding.area === "threadPool")).toBe(true);
    expect(comparison.threadPool.improved).toBe(true);
  });
});
