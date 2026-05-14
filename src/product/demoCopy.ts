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

const categoryVerification: Record<Demo["category"], string> = {
  "event-loop": "Add temporary logs around the sync line, promise callback, and timer, then confirm the order without adding arbitrary delays.",
  promises: "Write a focused unit test that asserts the resolved value or rejected path, then verify every branch returns or awaits its work.",
  "async-await": "Measure before and after with logs or test spies: the dependent line should run only after the awaited operation finishes.",
  memory: "Repeat the workflow several times, take a heap snapshot, and confirm retained listeners, timers, or cached objects stop growing after cleanup.",
  performance: "Record blocked time or request duration before and after the fix; the event loop should stay responsive while work completes.",
  "node-runtime": "Add timestamps around callbacks and inspect Node diagnostics, logs, or profiler output to confirm the runtime phase that is delaying work.",
  "real-world": "Reproduce the symptom with a small test, apply the safer pattern, then verify the flaky, slow, or leaking behavior disappears."
};

const categoryFixedCode: Record<Demo["category"], string> = {
  "event-loop": `Promise.resolve().then(handleMicrotask);\nsetTimeout(handleTimer, 0);\n// Assert/expect the microtask before the timer.`,
  promises: `return doWork()\n  .then((value) => nextStep(value))\n  .catch(handleError);`,
  "async-await": `const [user, posts] = await Promise.all([\n  fetchUser(),\n  fetchPosts()\n]);`,
  memory: `const id = setInterval(tick, 1000);\nreturn () => clearInterval(id);`,
  performance: `const work = items.map(loadItem);\nconst results = await Promise.all(work);`,
  "node-runtime": `setImmediate(runAfterIO);\n// Avoid long nextTick loops that starve other phases.`,
  "real-world": `try {\n  await operation();\n} finally {\n  cleanup();\n}`
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
    wrongAssumption: demo.explanation.mistake,
    fixedCode: categoryFixedCode[demo.category],
    visualProof: outputOrder.length
      ? `The console lane proves the visible order: ${outputOrder.join(" -> ")}. The active line and queues show why source order changed.`
      : "The visual proof is the active runtime event: watch what is retained, blocked, queued, or released at each step.",
    howToVerify: categoryVerification[demo.category],
    firstSignal: firstOutput?.type === "console" ? `First visible output: ${firstOutput.value}` : "First signal: watch the highlighted line and active runtime event.",
    related
  };
}
