import { demos, editableDemos } from "@/demos";
import { nodeScenarios } from "@/nodePlayground/scenarios";
import { findSymptomMatches } from "@/product/symptoms";

export type CoverageStatus = "fully visualized" | "partially visualized" | "detected only" | "unsupported";

export type RuntimeCoverageItem = {
  area: string;
  status: CoverageStatus;
  supported: string;
  limits: string;
  bestEntry: string;
  href: string;
};

export const runtimeCoverage: RuntimeCoverageItem[] = [
  {
    area: "Timers",
    status: "fully visualized",
    supported: "setTimeout, setInterval drift, delayed timers, timer vs promise ordering.",
    limits: "Real browser/Node timer precision and OS scheduling are simplified.",
    bestEntry: "Timer runs late",
    href: "/demo/settimeout-0"
  },
  {
    area: "Promises",
    status: "fully visualized",
    supported: "then, catch, missing return, all, allSettled, race, any, microtask order.",
    limits: "Promise internals are modeled by queue behavior, not real execution.",
    bestEntry: "Promise before timer",
    href: "/demo/promise-before-timeout"
  },
  {
    area: "Async/Await",
    status: "fully visualized",
    supported: "await pause/resume, missing await, try/catch, sequential vs parallel, async collection mistakes.",
    limits: "The analyzer detects known patterns but does not infer every dependency relationship.",
    bestEntry: "Missing await",
    href: "/demo/missing-await"
  },
  {
    area: "Node queues",
    status: "fully visualized",
    supported: "process.nextTick, Promise microtasks, timers, setImmediate/check phase, I/O callbacks.",
    limits: "Exact timer vs immediate order can vary; the lab teaches the useful mental model.",
    bestEntry: "Node queue priority",
    href: "/node-playground?scenario=node-queue-priority&mode=problem"
  },
  {
    area: "File system",
    status: "partially visualized",
    supported: "fs.readFile, readFileSync blocking, async fs through worker/I/O lanes.",
    limits: "Disk, cache, OS, and real file sizes are not executed.",
    bestEntry: "fs.readFile and thread pool",
    href: "/node-playground?scenario=fs-readfile-threadpool&mode=problem"
  },
  {
    area: "Streams",
    status: "partially visualized",
    supported: "chunks, pipe, backpressure, drain, stream error cleanup, full read vs stream memory.",
    limits: "Real stream implementations and every event edge case are simplified.",
    bestEntry: "Stream backpressure",
    href: "/node-playground?scenario=stream-backpressure-pipe&mode=problem"
  },
  {
    area: "Crypto / zlib / DNS worker pool",
    status: "partially visualized",
    supported: "thread-pool bursts, queued work, compression pressure, DNS delay under load.",
    limits: "UV_THREADPOOL_SIZE, OS DNS behavior, and exact timings are not measured.",
    bestEntry: "Thread pool saturation",
    href: "/node-playground?scenario=threadpool-saturation&mode=problem"
  },
  {
    area: "HTTP request lifecycle",
    status: "partially visualized",
    supported: "route enters stack, awaits database/network work, resumes, returns response.",
    limits: "No real server, socket, middleware, or database is executed.",
    bestEntry: "HTTP request lifecycle",
    href: "/node-playground?scenario=http-db-lifecycle&mode=problem"
  },
  {
    area: "Memory",
    status: "partially visualized",
    supported: "retained references, timers, listeners, caches, buffers, GC attempts, stream memory.",
    limits: "Heap sizes are explanatory approximations, not real V8 heap measurements.",
    bestEntry: "Memory leak case",
    href: "/node-playground?scenario=memory-leak-cache-listener-timer&mode=problem"
  },
  {
    area: "Testing",
    status: "fully visualized",
    supported: "fake timer plus promise continuation confusion and async assertion timing.",
    limits: "Jest/Vitest APIs are represented conceptually.",
    bestEntry: "Testing async timers",
    href: "/node-playground?scenario=testing-async-timers&mode=problem"
  },
  {
    area: "DOM / React runtime",
    status: "detected only",
    supported: "Some React-like real-world cases are curated as guided demos.",
    limits: "No DOM, browser rendering, or React runtime is executed.",
    bestEntry: "Real-world JS bugs",
    href: "/discover?problem=Confusing%20output"
  },
  {
    area: "Arbitrary JavaScript",
    status: "unsupported",
    supported: "Known pattern detection only.",
    limits: "No arbitrary code execution, full parser semantics, debugger, or sandbox runtime.",
    bestEntry: "Analyze small snippet",
    href: "/analyze"
  }
];

function statusScore(status: CoverageStatus) {
  if (status === "fully visualized") return 3;
  if (status === "partially visualized") return 2;
  if (status === "detected only") return 1;
  return 0;
}

export function getCoverageSummary() {
  const counts = runtimeCoverage.reduce<Record<CoverageStatus, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {
    "fully visualized": 0,
    "partially visualized": 0,
    "detected only": 0,
    unsupported: 0
  });
  const score = runtimeCoverage.reduce((sum, item) => sum + statusScore(item.status), 0);
  const max = runtimeCoverage.length * 3;

  return {
    counts,
    score,
    percent: Math.round((score / max) * 100)
  };
}

export function canProductHelp(input: string) {
  const symptoms = findSymptomMatches(input);
  const q = input.toLowerCase();
  const coverage = runtimeCoverage.find((item) => q.includes(item.area.toLowerCase())) ?? runtimeCoverage.find((item) => item.supported.toLowerCase().includes(q.split(" ")[0] ?? ""));
  const best = symptoms[0];
  const status = coverage?.status ?? (best ? "partially visualized" : "detected only");

  return {
    status,
    answer: best ? "Yes, there is a useful path." : "Partial. Try Analyze Code with a small snippet.",
    bestTool: best?.href.startsWith("/node-playground") ? "Node Runtime Lab" : best?.href.startsWith("/demo") ? "Guided Case" : "Analyze Code",
    href: best?.href ?? coverage?.href ?? "/analyze",
    label: best?.label ?? coverage?.bestEntry ?? "Analyze Code",
    reason: best?.reason ?? coverage?.supported ?? "The analyzer can detect known patterns and state limitations.",
    limitation: coverage?.limits ?? "Result quality depends on whether the snippet contains supported patterns."
  };
}

export function getQualitySnapshot() {
  const guidedIssues = demos.flatMap((demo) => {
    const issues: string[] = [];
    if (demo.concept.length < 20) issues.push("weak concept");
    if (demo.events.length < 4) issues.push("short timeline");
    if (demo.explanation.realWorld.length < 30) issues.push("weak real-world copy");
    if (demo.explanation.steps.length < 2) issues.push("thin explanation steps");
    return issues.map((issue) => ({ id: demo.id, title: demo.title, type: "Guided", issue }));
  });

  const editableIssues = editableDemos.flatMap((demo) => {
    const explanation = demo.generateExplanation(demo.defaultParams);
    const events = demo.generateEvents(demo.defaultParams);
    const issues: string[] = [];
    if (demo.controls.length === 0) issues.push("no controls");
    if (events.length < 4) issues.push("short generated timeline");
    if (explanation.realWorld.length < 30) issues.push("weak real-world copy");
    return issues.map((issue) => ({ id: demo.id, title: demo.title, type: "Editable", issue }));
  });

  const nodeIssues = nodeScenarios.flatMap((scenario) => {
    const issues: string[] = [];
    if (!scenario.whatGoesWrong && scenario.fixedCode) issues.push("missing explicit bug symptom");
    if (scenario.fixedCode && !scenario.fixedEvents?.length) issues.push("fixed code without fixed events");
    if (scenario.events.length < 4) issues.push("short Node timeline");
    if (!scenario.limitations?.length) issues.push("missing explicit limitation note");
    return issues.map((issue) => ({ id: scenario.id, title: scenario.title, type: "Node", issue }));
  });

  const issues = [...guidedIssues, ...editableIssues, ...nodeIssues];

  return {
    totals: {
      guided: demos.length,
      editable: editableDemos.length,
      node: nodeScenarios.length,
      total: demos.length + editableDemos.length + nodeScenarios.length
    },
    issueCount: issues.length,
    issues,
    qualityScore: Math.max(0, Math.round(100 - (issues.length / Math.max(1, demos.length + editableDemos.length + nodeScenarios.length)) * 10))
  };
}
