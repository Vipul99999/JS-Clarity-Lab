import { demos } from "@/demos";
import type { Demo } from "@/engine/types";

const categoryFixes: Record<Demo["category"], string> = {
  "event-loop": "Make ordering explicit instead of relying on when a queued callback might happen to run.",
  promises: "Return or await the promise chain so values and failures move through the flow intentionally.",
  "async-await": "Await real dependencies, start independent work together, and choose the loop pattern that matches the behavior you need.",
  memory: "Remove long-lived references, clear timers/listeners, and verify the object can be collected.",
  performance: "Move heavy work off the hot path, chunk it, stream it, cache it earlier, or run independent work in parallel.",
  "node-runtime": "Separate sync work, microtasks, timers, I/O, check callbacks, and worker-pool work in your mental model.",
  "real-world": "Fix the root scheduling, cleanup, or concurrency pattern instead of adding arbitrary waits."
};

const categorySymptoms: Record<Demo["category"], string> = {
  "event-loop": "Console output or cleanup runs in an order that does not match the source code order.",
  promises: "A later .then receives the wrong value, an error appears in a surprising place, or a batch fails differently than expected.",
  "async-await": "The UI, test, redirect, or log moves forward before the async result is actually ready.",
  memory: "Heap usage grows after repeated navigation, polling, subscriptions, cache writes, or background work.",
  performance: "The page, request, or runtime feels stuck because one piece of work monopolizes the event loop.",
  "node-runtime": "A Node callback, timer, I/O task, stream, or worker-pool job runs later than expected.",
  "real-world": "A production symptom appears first: flaky tests, stale state, slow UI, late cleanup, or growing memory."
};

export function buildDemoPageCopy(demo: Demo) {
  const firstOutput = demo.events.find((event) => event.type === "console");
  const outputOrder = demo.events
    .filter((event) => event.type === "console")
    .map((event) => event.value);
  const related = demos
    .filter((item) => item.id !== demo.id && item.category === demo.category)
    .slice(0, 3);

  return {
    shortAnswer: outputOrder.length
      ? `The key output order is ${outputOrder.join(" -> ")}. ${demo.explanation.summary}`
      : demo.explanation.summary,
    realWorldBug: `${categorySymptoms[demo.category]} ${demo.explanation.realWorld}`,
    fixedNote: categoryFixes[demo.category],
    firstSignal: firstOutput?.type === "console" ? `First visible output: ${firstOutput.value}` : "First signal: watch the highlighted line and active runtime event.",
    related
  };
}
