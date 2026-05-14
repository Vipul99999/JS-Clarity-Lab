import type { AnalysisResult, AnalyzerWarning, ExtractedPattern } from "./patternTypes";

export function getTrustNotes(patterns: ExtractedPattern[], warnings: AnalyzerWarning[]) {
  const notes: string[] = [];
  if (patterns.length === 0) notes.push("No supported patterns were found, so the simulator has low usefulness for this snippet.");
  if (warnings.length > 0) notes.push("Unsupported constructs were detected. Treat the visualization as a partial model.");
  if (patterns.some((pattern) => pattern.type === "promise_all")) notes.push("Promise.all is simulated as a simplified all-success/all-fail concept, not real promise execution.");
  if (patterns.some((pattern) => pattern.type === "setInterval")) notes.push("setInterval is shown as one registered repeating timer, not infinite repeated ticks.");
  if (patterns.some((pattern) => pattern.type === "fetch_then" || pattern.type === "fetch_catch")) notes.push("Fetch chains are modeled by Promise continuation order; real network timing and response data are not executed.");
  if (patterns.some((pattern) => pattern.type === "react_effect")) notes.push("React effects are detected as lifecycle patterns; no React renderer, dependency comparison, or DOM is executed.");
  if (patterns.some((pattern) => pattern.type === "fake_timer_test")) notes.push("Fake timer APIs are detected, but the analyzer does not run Jest or Vitest.");
  if (patterns.some((pattern) => pattern.type === "async_map" || pattern.type === "async_forEach")) notes.push("Async collection callbacks are detected, but item-by-item concurrency is simplified.");
  if (patterns.some((pattern) => ["fs_readFileSync", "crypto_worker", "stream_pipe", "http_route", "express_middleware", "missing_return_then", "floating_async_call"].includes(pattern.type))) notes.push("Some production risks are detected as patterns only; use the linked Node Lab or guided case for the visual model.");
  if (notes.length === 0) notes.push("All detected constructs are within the supported simplified model.");
  return notes;
}

export function getConfidence(patterns: ExtractedPattern[], warnings: AnalyzerWarning[]): AnalysisResult["confidence"] {
  if (patterns.length === 0 || warnings.length >= 3) return "Low";
  if (warnings.length > 0 || patterns.some((pattern) => ["promise_all", "async_map", "async_forEach", "setInterval", "fetch_then", "fetch_catch", "react_effect", "fake_timer_test", "fs_readFileSync", "crypto_worker", "stream_pipe", "http_route", "express_middleware", "missing_return_then", "floating_async_call"].includes(pattern.type))) return "Medium";
  return "High";
}
