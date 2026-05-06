import type { AnalysisResult, ExtractedPattern } from "./patternTypes";

const demoByPattern: Partial<Record<ExtractedPattern["type"], { id: string; label: string }>> = {
  setTimeout: { id: "promise-before-timeout", label: "Promise vs Timer" },
  setInterval: { id: "interval-leak", label: "Uncleared Interval Leak" },
  queueMicrotask: { id: "microtask-flood", label: "Microtask Flood" },
  promise_then: { id: "promise-before-timeout", label: "Promise vs Timer" },
  promise_catch: { id: "promise-all-fail", label: "Promise.all and rejection flow" },
  promise_all: { id: "promise-all-fail", label: "Promise.all" },
  await: { id: "missing-await", label: "Missing Await" },
  async_map: { id: "async-foreach-issue", label: "Async forEach Problem" },
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
    (pattern.type === "promise_then" || pattern.type === "promise_catch" || pattern.type === "queueMicrotask") && pattern.callbackLabel ? [pattern.callbackLabel] : []
  );
  const timers = result.patterns
    .flatMap((pattern) => ((pattern.type === "setTimeout" || pattern.type === "setInterval") && pattern.callbackLabel ? [pattern] : []))
    .sort((a, b) => a.delay - b.delay || a.line - b.line)
    .map((pattern) => pattern.callbackLabel)
    .filter((value): value is string => Boolean(value));
  return [...sync, ...micro, ...timers];
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
