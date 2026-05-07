import { buildAnalyzerActionPlan } from "./actionPlan";
import type { AnalysisResult } from "./patternTypes";

export function buildAnalyzerFixNotes(result: AnalysisResult | null) {
  const plan = buildAnalyzerActionPlan(result);
  if (!result || !plan) return "";

  if (!result.ok) {
    return [
      "JS Clarity Lab fix notes",
      "",
      "Symptom: Code could not be analyzed.",
      `Likely cause: ${plan.whyThisHappens}`,
      `Fix pattern: ${plan.fixSuggestion}`
    ].join("\n");
  }

  return [
    "JS Clarity Lab fix notes",
    "",
    `Trust level: ${plan.trustLevel}`,
    `Likely output: ${plan.likelyOutput.length ? plan.likelyOutput.join(" -> ") : "none detected"}`,
    `Risk found: ${plan.riskFound}`,
    `Why this happens: ${plan.whyThisHappens}`,
    `Fix pattern: ${plan.fixSuggestion}`,
    plan.nodeBridge ? `Open matching Node Lab: ${plan.nodeBridge.href}` : "",
    plan.matchingDemo ? `Open matching case: ${plan.matchingDemo.href}` : "",
    "",
    "Warnings:",
    ...(result.warnings.length ? result.warnings.map((warning) => `- ${warning.title}: ${warning.detail}`) : ["- No unsupported constructs detected."])
  ].filter(Boolean).join("\n");
}
