import { summarizeNodeTrace } from "./trace";
import type { NodeScenario } from "./types";

export type ScenarioComparison = {
  hasFixedVersion: boolean;
  output: { problem: string[]; fixed: string[]; changed: boolean };
  blocked: { problem: number; fixed: number; saved: number };
  memory: { problemRetained: number; fixedRetained: number; improved: boolean };
  threadPool: { problemPressure: string; fixedPressure: string; improved: boolean };
  saferSummary: string;
};

export function compareScenarioModes(scenario: NodeScenario): ScenarioComparison {
  const problem = summarizeNodeTrace(scenario.events, scenario);
  const fixed = summarizeNodeTrace(scenario.fixedEvents ?? scenario.events, scenario);
  const hasFixedVersion = Boolean(scenario.fixedCode && scenario.fixedEvents);
  const outputChanged = problem.consoleOutput.join("\n") !== fixed.consoleOutput.join("\n");
  const blockedSaved = Math.max(0, problem.blockedDuration - fixed.blockedDuration);
  const memoryImproved = fixed.memory.retained < problem.memory.retained || fixed.memory.gcBlocked < problem.memory.gcBlocked;
  const pressureScore = { none: 0, low: 1, high: 2 } as const;
  const threadPoolImproved = pressureScore[fixed.threadPool.pressure] < pressureScore[problem.threadPool.pressure];

  const inferredSaferSummary = [
    blockedSaved ? `It saves about ${blockedSaved}ms of event-loop blocking.` : "",
    memoryImproved ? "It releases or avoids retained memory." : "",
    threadPoolImproved ? "It lowers worker-pool pressure." : "",
    outputChanged ? "It changes the visible outcome to the intended behavior." : ""
  ].filter(Boolean).join(" ");

  const saferSummary = !hasFixedVersion
    ? "This case is mainly explanatory; use the variation notes to try a safer pattern."
    : (scenario.whyFixWorks ?? inferredSaferSummary) || "The fixed version makes the runtime behavior more predictable.";

  return {
    hasFixedVersion,
    output: { problem: problem.consoleOutput, fixed: fixed.consoleOutput, changed: outputChanged },
    blocked: { problem: problem.blockedDuration, fixed: fixed.blockedDuration, saved: blockedSaved },
    memory: { problemRetained: problem.memory.retained + problem.memory.gcBlocked, fixedRetained: fixed.memory.retained + fixed.memory.gcBlocked, improved: memoryImproved },
    threadPool: { problemPressure: problem.threadPool.pressure, fixedPressure: fixed.threadPool.pressure, improved: threadPoolImproved },
    saferSummary
  };
}
