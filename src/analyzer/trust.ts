import type { AnalysisResult, AnalyzerWarning, ExtractedPattern } from "./patternTypes";

export function getTrustNotes(patterns: ExtractedPattern[], warnings: AnalyzerWarning[]) {
  const notes: string[] = [];
  if (patterns.length === 0) notes.push("No supported patterns were found, so the simulator has low usefulness for this snippet.");
  if (warnings.length > 0) notes.push("Unsupported constructs were detected. Treat the visualization as a partial model.");
  if (patterns.some((pattern) => pattern.type === "promise_all")) notes.push("Promise.all is simulated as a simplified all-success/all-fail concept, not real promise execution.");
  if (patterns.some((pattern) => pattern.type === "setInterval")) notes.push("setInterval is shown as one registered repeating timer, not infinite repeated ticks.");
  if (patterns.some((pattern) => pattern.type === "async_map")) notes.push("Async map callbacks are detected, but item-by-item concurrency is simplified.");
  if (notes.length === 0) notes.push("All detected constructs are within the supported simplified model.");
  return notes;
}

export function getConfidence(patterns: ExtractedPattern[], warnings: AnalyzerWarning[]): AnalysisResult["confidence"] {
  if (patterns.length === 0 || warnings.length >= 3) return "Low";
  if (warnings.length > 0 || patterns.some((pattern) => ["promise_all", "async_map", "setInterval"].includes(pattern.type))) return "Medium";
  return "High";
}
