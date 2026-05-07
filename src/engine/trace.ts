import { getStateAtStep } from "./getStateAtStep";
import type { VisualEvent } from "./types";

export type TraceSummary = {
  steps: number;
  consoleOutput: string[];
  elapsedTime: number;
  blockedDuration: number;
  eventCounts: Record<string, number>;
  riskFlags: string[];
};

export function summarizeTrace(events: VisualEvent[]): TraceSummary {
  const finalState = getStateAtStep(events, events.length);
  const eventCounts = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.type] = (acc[event.type] ?? 0) + 1;
    return acc;
  }, {});
  const riskFlags: string[] = [];

  if (finalState.blockedDuration > 50) {
    riskFlags.push(`Main thread blocked for ${finalState.blockedDuration}ms.`);
  }
  if ((eventCounts.microtask_add ?? 0) >= 10) {
    riskFlags.push("Many microtasks were queued; timers and rendering may be delayed.");
  }
  if ((eventCounts.timer_add ?? 0) > 0 && (eventCounts.microtask_add ?? 0) > 0) {
    riskFlags.push("Timers and microtasks are mixed; output order may differ from source order.");
  }
  if (Object.values(finalState.memory).some((item) => item.retainedBy && item.retainedBy.length > 0 && !item.released)) {
    riskFlags.push("Memory is retained at the end of the trace.");
  }

  return {
    steps: events.length,
    consoleOutput: finalState.consoleOutput,
    elapsedTime: finalState.elapsedTime,
    blockedDuration: finalState.blockedDuration,
    eventCounts,
    riskFlags
  };
}

export function getStepWindow(events: VisualEvent[], step: number, radius = 2) {
  const start = Math.max(0, step - radius);
  const end = Math.min(events.length, step + radius + 1);
  return events.slice(start, end).map((event, index) => ({
    index: start + index,
    event
  }));
}
