import { describe, expect, it } from "vitest";
import { getStateAtStep } from "@/engine/getStateAtStep";
import type { VisualEvent } from "@/engine/types";

describe("visual engine", () => {
  it("recomputes queues and console state from events", () => {
    const events: VisualEvent[] = [
      { type: "stack_push", name: "global" },
      { type: "console", value: "A" },
      { type: "microtask_add", name: "then C" },
      { type: "timer_add", name: "timer B", delay: 0 },
      { type: "stack_pop", name: "global" },
      { type: "microtask_run", name: "then C" },
      { type: "console", value: "C" },
      { type: "stack_pop", name: "then C" }
    ];

    const state = getStateAtStep(events, events.length);
    expect(state.consoleOutput).toEqual(["A", "C"]);
    expect(state.timerQueue).toEqual(["timer B (0ms)"]);
    expect(state.callStack).toEqual([]);
  });

  it("tracks waits and blocked duration", () => {
    const state = getStateAtStep(
      [
        { type: "timeline_wait", duration: 100 },
        { type: "performance_block", duration: 250, reason: "loop" }
      ],
      2
    );
    expect(state.elapsedTime).toBe(350);
    expect(state.blockedDuration).toBe(250);
  });
});
