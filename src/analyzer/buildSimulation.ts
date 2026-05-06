import type { Demo } from "@/engine/types";
import type { AnalysisResult } from "./patternTypes";
import { explanationFromPatterns, generateEventsFromPatterns, predictionFromPatterns } from "@/simulator/generateEventsFromPatterns";

export function buildSimulation(result: AnalysisResult): Demo {
  const events = generateEventsFromPatterns(result.patterns);
  return {
    id: "custom-analysis",
    number: 0,
    title: "Pasted Code Simulation",
    category: "event-loop",
    concept: "Simplified visualization of detected async patterns.",
    code: result.formattedCode,
    prediction: predictionFromPatterns(result.patterns),
    events,
    explanation: explanationFromPatterns(result.patterns)
  };
}
