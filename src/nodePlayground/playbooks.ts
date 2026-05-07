import type { NodeTraceFinding } from "./trace";
import type { NodeScenario } from "./types";

export type ProductionPlaybook = {
  risk: string;
  metric: string;
  log: string;
  profilerStep: string;
  testToWrite: string;
  fixPattern: string;
};

const playbooks: Record<NodeTraceFinding["area"], ProductionPlaybook> = {
  queue: {
    risk: "Unexpected callback order",
    metric: "Count flaky tests, retry-only passes, and delayed timer callbacks around the affected path.",
    log: "Log before scheduling and inside nextTick, Promise, timer, and setImmediate callbacks with a request/job id.",
    profilerStep: "Use async stack traces or Node inspector breakpoints around the scheduling line.",
    testToWrite: "Write an output-order test that asserts sync, microtask, timer, and check behavior explicitly.",
    fixPattern: "Avoid mixing scheduling primitives unless each one has a clear reason."
  },
  threadPool: {
    risk: "Worker pool saturation",
    metric: "Track p95 latency for fs, DNS, crypto, and zlib work plus queue depth/concurrency.",
    log: "Log when worker-pool tasks start and finish, including job type and duration.",
    profilerStep: "Use clinic/0x/Node CPU profiles and compare latency during crypto/zlib/fs bursts.",
    testToWrite: "Load test with more jobs than UV_THREADPOOL_SIZE and assert unrelated work stays within budget.",
    fixPattern: "Limit concurrency, move CPU-heavy JS to Worker Threads, and reserve capacity for latency-sensitive work."
  },
  streams: {
    risk: "Backpressure or stream cleanup failure",
    metric: "Watch heap usage, writableLength, highWaterMark pressure, open handles, and stalled uploads/downloads.",
    log: "Log write() return values, drain, error, close, and pipeline rejection events.",
    profilerStep: "Take heap snapshots during large transfers and inspect retained buffers.",
    testToWrite: "Simulate a slow writable and verify the readable pauses or pipeline rejects cleanly.",
    fixPattern: "Use pipeline/pipe or await drain; always handle error and close paths."
  },
  blocking: {
    risk: "Event loop blocked",
    metric: "Track event loop delay, p95 request latency, CPU usage, and long task duration.",
    log: "Log duration for JSON parse, sync fs, loops, compression, and report generation.",
    profilerStep: "Run Node CPU profiling and inspect the hottest synchronous function.",
    testToWrite: "Send concurrent requests while the heavy path runs and assert unrelated requests still respond.",
    fixPattern: "Stream, chunk, cache, precompute, or move CPU-heavy work to Worker Threads."
  },
  memory: {
    risk: "Retained memory leak",
    metric: "Track heap used after GC, listener count, active timers, cache size, and open handles.",
    log: "Log lifecycle add/remove events for listeners, timers, cache entries, and stream handles.",
    profilerStep: "Compare heap snapshots before and after repeated requests/jobs.",
    testToWrite: "Run repeated iterations and assert retained heap or listener count returns near baseline.",
    fixPattern: "Bound caches, remove listeners, clear timers, destroy streams, and release request-scoped references."
  },
  http: {
    risk: "Request lifecycle latency",
    metric: "Separate handler time, dependency time, response time, timeout count, and error rate.",
    log: "Log request id, dependency start/end, status code, timeout, and cancellation result.",
    profilerStep: "Use distributed tracing or async hooks to follow one request across awaits.",
    testToWrite: "Mock slow dependencies and assert timeout/error middleware/cleanup behavior.",
    fixPattern: "Use timeouts, cancellation, centralized error handling, and parallel independent I/O."
  }
};

export function getPlaybooksForScenario(scenario: NodeScenario, areas: NodeTraceFinding["area"][]) {
  const selected = new Set<NodeTraceFinding["area"]>(areas);
  if (scenario.category === "Streams & Buffers") selected.add("streams");
  if (scenario.category === "Memory & Performance") selected.add("blocking");
  if (scenario.category === "Files & Networking") selected.add("http");
  if (scenario.panels.includes("threadPool")) selected.add("threadPool");
  if (scenario.panels.includes("memory")) selected.add("memory");
  if (scenario.panels.includes("microtasks") || scenario.panels.includes("timers")) selected.add("queue");

  return [...selected].map((area) => playbooks[area]);
}
