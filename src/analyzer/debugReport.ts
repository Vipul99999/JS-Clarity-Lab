import type { AnalysisResult, ExtractedPattern } from "./patternTypes";

const demoByPattern: Partial<Record<ExtractedPattern["type"], { id: string; label: string }>> = {
  setTimeout: { id: "promise-before-timeout", label: "Promise vs Timer" },
  setInterval: { id: "interval-leak", label: "Uncleared Interval Leak" },
  queueMicrotask: { id: "microtask-flood", label: "Microtask Flood" },
  promise_then: { id: "promise-before-timeout", label: "Promise vs Timer" },
  promise_catch: { id: "promise-all-fail", label: "Promise.all and rejection flow" },
  promise_all: { id: "promise-all-fail", label: "Promise.all" },
  promise_allSettled: { id: "promise-allsettled-errors", label: "Promise.all vs allSettled" },
  promise_race: { id: "promise-race-any", label: "Promise.race vs Promise.any" },
  promise_any: { id: "promise-race-any", label: "Promise.race vs Promise.any" },
  fetch_then: { id: "http-db-lifecycle", label: "Fetch then continuation" },
  fetch_catch: { id: "try-catch-await", label: "Fetch error handling" },
  event_listener: { id: "event-listener-leak", label: "Event listener cleanup" },
  fs_promises: { id: "fs-readfile-threadpool", label: "fs.promises async file work" },
  await_promise_all: { id: "parallel-promise-all", label: "await Promise.all" },
  express_middleware: { id: "http-db-lifecycle", label: "Express middleware order" },
  react_effect: { id: "react-effect-cleanup-missing", label: "React effect cleanup" },
  react_effect_cleanup: { id: "react-effect-cleanup-missing", label: "React effect cleanup" },
  fake_timer_test: { id: "testing-async-timers", label: "Fake timers and promises" },
  process_nextTick: { id: "process-nexttick-priority", label: "process.nextTick priority" },
  setImmediate: { id: "node-setimmediate-io", label: "setImmediate ordering" },
  fs_readFileSync: { id: "fs-sync-blocks-server", label: "readFileSync blocks server" },
  crypto_worker: { id: "threadpool-saturation", label: "Thread pool saturation" },
  stream_pipe: { id: "stream-backpressure-pipe", label: "Stream backpressure" },
  http_route: { id: "http-db-lifecycle", label: "HTTP request lifecycle" },
  await: { id: "missing-await", label: "Missing Await" },
  async_map: { id: "async-foreach-issue", label: "Async forEach Problem" },
  async_forEach: { id: "async-foreach-issue", label: "Async forEach Problem" },
  missing_return_then: { id: "missing-return", label: "Missing return in then" },
  floating_async_call: { id: "missing-await", label: "Missing Await" },
  try_catch_await: { id: "try-catch-await", label: "Try/catch await" }
};

export function getRecommendedDemo(result: AnalysisResult | null) {
  if (!result?.ok) return undefined;
  for (const pattern of result.patterns) {
    const demo = demoByPattern[pattern.type];
    if (demo) return demo;
  }
  return undefined;
}

export function getPredictedOutput(result: AnalysisResult | null) {
  if (!result?.ok) return [];
  const sync = result.patterns.flatMap((pattern) => (pattern.type === "console" && pattern.phase === "sync" ? [pattern.value] : []));
  const micro = result.patterns.flatMap((pattern) =>
    (pattern.type === "process_nextTick" || pattern.type === "promise_then" || pattern.type === "promise_catch" || pattern.type === "queueMicrotask" || pattern.type === "fetch_then" || pattern.type === "fetch_catch") && pattern.callbackLabel ? [pattern.callbackLabel] : []
  );
  const combinators = result.patterns.flatMap((pattern) =>
    pattern.type === "promise_allSettled" ? ["allSettled outcomes ready"] : pattern.type === "promise_race" ? ["race settled first"] : pattern.type === "promise_any" ? ["any fulfilled first"] : []
  );
  const timers = result.patterns
    .flatMap((pattern) => ((pattern.type === "setTimeout" || pattern.type === "setInterval") && pattern.callbackLabel ? [pattern] : []))
    .sort((a, b) => a.delay - b.delay || a.line - b.line)
    .map((pattern) => pattern.callbackLabel)
    .filter((value): value is string => Boolean(value));
  const immediates = result.patterns.flatMap((pattern) => (pattern.type === "setImmediate" && pattern.callbackLabel ? [pattern.callbackLabel] : []));
  return [...sync, ...micro, ...combinators, ...timers, ...immediates];
}

export function buildDebugReport(result: AnalysisResult | null) {
  if (!result) return "";
  if (!result.ok) return `JS Clarity Lab analysis failed\n\nReason:\n${result.error}`;

  const counts = result.patterns.reduce<Record<string, number>>((acc, pattern) => {
    acc[pattern.type] = (acc[pattern.type] ?? 0) + 1;
    return acc;
  }, {});
  const output = getPredictedOutput(result);
  const recommended = getRecommendedDemo(result);

  return [
    "JS Clarity Lab debug report",
    "",
    `Confidence: ${result.confidence}`,
    "",
    "Detected patterns:",
    ...Object.entries(counts).map(([type, count]) => `- ${type}: ${count}`),
    "",
    `Predicted simplified output: ${output.length > 0 ? output.join(" -> ") : "none"}`,
    "",
    "Trust notes:",
    ...result.trustNotes.map((note) => `- ${note}`),
    "",
    "Limitations/warnings:",
    ...(result.warnings.length > 0 ? result.warnings.map((warning) => `- ${warning.title}${warning.line ? ` (line ${warning.line})` : ""}: ${warning.detail}`) : ["- No unsupported constructs detected."]),
    "",
    recommended ? `Recommended demo: ${recommended.label} (/demo/${recommended.id})` : "Recommended demo: none"
  ].join("\n");
}
