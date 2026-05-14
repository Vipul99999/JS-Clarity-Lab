import { describe, expect, it } from "vitest";
import { analyzeCode } from "@/analyzer/analyzeCode";
import { buildSimulation } from "@/analyzer/buildSimulation";
import { buildDebugReport, getRecommendedDemo } from "@/analyzer/debugReport";
import { getAnalyzerInsights } from "@/analyzer/insights";
import { buildAnalyzerActionPlan } from "@/analyzer/actionPlan";
import { buildAnalyzerFixNotes } from "@/analyzer/exportNotes";

describe("paste-code analyzer", () => {
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

  it("detects fetch, event listeners, fs.promises, and await Promise.all", async () => {
    const result = await analyzeCode(`
      fetch("/api/users").then(() => console.log("loaded"));
      window.addEventListener("resize", () => console.log("resize"));
      fs.promises.readFile("users.json");
      async function loadAll() {
        await Promise.all([fetch("/a"), fetch("/b")]);
      }
      console.log("sync");
    `);

    const types = result.patterns.map((pattern) => pattern.type);
    expect(types).toEqual(expect.arrayContaining(["fetch_then", "event_listener", "fs_promises", "await_promise_all"]));

    const simulation = buildSimulation(result);
    const output = simulation.events.filter((event) => event.type === "console").map((event) => ("value" in event ? event.value : ""));
    expect(output).toEqual(expect.arrayContaining(["sync", "loaded"]));
    expect(output.indexOf("sync")).toBeLessThan(output.indexOf("loaded"));

    const plan = buildAnalyzerActionPlan(result);
    expect(plan?.matchingDemo?.href).toContain("/node-playground");
    expect(result.warnings.some((warning) => warning.title.includes("External API timing"))).toBe(true);
    expect(result.warnings.some((warning) => warning.title.includes("Event listener behavior"))).toBe(true);
  });

  it("detects real-world framework and test snippets", async () => {
    const result = await analyzeCode(`
      app.use("/api", (req, res, next) => {
        console.log("middleware");
        next();
      });

      fetch("/api/users")
        .then(() => console.log("loaded"))
        .catch(() => console.log("failed"));

      useEffect(() => {
        const id = setInterval(() => console.log("tick"), 1000);
        return () => clearInterval(id);
      }, []);

      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);
    `);

    const types = result.patterns.map((pattern) => pattern.type);
    expect(types).toEqual(expect.arrayContaining([
      "express_middleware",
      "fetch_then",
      "fetch_catch",
      "react_effect",
      "react_effect_cleanup",
      "fake_timer_test"
    ]));

    const plan = buildAnalyzerActionPlan(result);
    expect(plan?.riskFound).toMatch(/Fetch|middleware|React|timer|Simulation/);
    expect(result.trustNotes.some((note) => note.includes("React effects"))).toBe(true);
    expect(result.trustNotes.some((note) => note.includes("Fake timer"))).toBe(true);
  });

  it("detects modern Node and Promise combinator patterns with insights", async () => {
    const result = await analyzeCode(`
      process.nextTick(() => console.log("tick"));
      Promise.resolve().then(() => console.log("promise"));
      Promise.race([fast(), slow()]);
      Promise.any([primary(), backup()]);
      Promise.allSettled([a(), b()]);
      setImmediate(() => console.log("immediate"));
    `);

    expect(result.patterns.map((pattern) => pattern.type)).toEqual(
      expect.arrayContaining(["process_nextTick", "promise_race", "promise_any", "promise_allSettled", "setImmediate"])
    );
    const simulation = buildSimulation(result);
    const output = simulation.events.filter((event) => event.type === "console").map((event) => ("value" in event ? event.value : ""));
    expect(output).toEqual(expect.arrayContaining(["tick", "promise", "race settled first", "any fulfilled first", "allSettled outcomes ready", "immediate"]));
    expect(getAnalyzerInsights(result).some((insight) => insight.title.includes("Node-specific"))).toBe(true);
    const plan = buildAnalyzerActionPlan(result);
    expect(plan?.trustLevel).toBe("fully simulated");
    expect(plan?.riskFound).toContain("Node-specific");
    expect(plan?.matchingDemo?.href).toContain("node-queue-priority");
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

  it("bridges Node-specific pasted code to the Node Runtime Lab", async () => {
    const result = await analyzeCode(`
      const fs = require("node:fs");
      const text = fs.readFileSync("report.csv", "utf8");
      console.log(text.length);
    `);

    const plan = buildAnalyzerActionPlan(result);
    expect(plan?.nodeBridge?.scenarioId).toBe("fs-sync-blocks-server");
    expect(plan?.matchingDemo?.href).toContain("/node-playground");
  });

  it("detects deeper real-world async and Node risk patterns", async () => {
    const result = await analyzeCode(`
      const app = express();
      app.get("/report", async (req, res) => {
        fs.readFileSync("report.csv", "utf8");
        crypto.pbkdf2("p", "s", 100, 32, "sha256", () => {});
        readable.pipe(writable);
        items.forEach(async (item) => save(item));
        Promise.resolve().then(() => { save(); });
      });
      async function background() { await sendEmail(); }
      background();
    `);

    const types = result.patterns.map((pattern) => pattern.type);
    expect(types).toEqual(expect.arrayContaining([
      "http_route",
      "fs_readFileSync",
      "crypto_worker",
      "stream_pipe",
      "async_forEach",
      "missing_return_then",
      "floating_async_call"
    ]));
    const notes = buildAnalyzerFixNotes(result);
    expect(notes).toContain("Risk found");
    expect(notes).toContain("Fix pattern");
  });

  it("warns for unsupported complexity", async () => {
    const result = await analyzeCode(`
      for (const item of items) {
        await fetch(item);
      }
    `);

    expect(result.warnings.some((warning) => warning.title.includes("loop") || warning.title.includes("Loop"))).toBe(true);
    expect(result.warnings.some((warning) => warning.title.includes("External API timing"))).toBe(true);
  });
});
