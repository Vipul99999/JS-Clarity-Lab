import type { Explanation, Prediction, VisualEvent } from "@/engine/types";
import type { ExtractedPattern } from "@/analyzer/patternTypes";

export function generateEventsFromPatterns(patterns: ExtractedPattern[]): VisualEvent[] {
  const events: VisualEvent[] = [{ type: "stack_push", name: "global" }];
  const syncLogs = patterns.filter((pattern) => pattern.type === "console" && pattern.phase === "sync");
  const promiseThens = patterns.filter((pattern) => pattern.type === "promise_then");
  const promiseCatches = patterns.filter((pattern) => pattern.type === "promise_catch");
  const queuedMicrotasks = patterns.filter((pattern) => pattern.type === "queueMicrotask");
  const timers = patterns.filter((pattern) => pattern.type === "setTimeout");
  const intervals = patterns.filter((pattern) => pattern.type === "setInterval");
  const promiseAlls = patterns.filter((pattern) => pattern.type === "promise_all");
  const awaits = patterns.filter((pattern) => pattern.type === "await");
  const asyncFns = patterns.filter((pattern) => pattern.type === "async_function");
  const calls = patterns.filter((pattern) => pattern.type === "function_call");

  for (const pattern of patterns) {
    if (pattern.type === "async_function") {
      events.push({ type: "line", line: pattern.line, explain: `Async function "${pattern.name}" is declared. Calling it returns a Promise.` });
    }
    if (pattern.type === "function_call") {
      events.push({ type: "line", line: pattern.line, explain: `Flat function call "${pattern.name}" is detected. Nested runtime behavior is simplified.` });
      events.push({ type: "stack_push", name: pattern.name });
      events.push({ type: "stack_pop", name: pattern.name });
    }
    if (pattern.type === "console" && pattern.phase === "sync") {
      events.push({ type: "line", line: pattern.line, explain: "Synchronous console.log runs immediately on the current call stack." });
      events.push({ type: "console", value: pattern.value });
    }
    if (pattern.type === "setTimeout") {
      events.push({ type: "line", line: pattern.line, explain: `setTimeout registers a timer callback with ${pattern.delay}ms delay.` });
      events.push({ type: "webapi_add", name: `timer line ${pattern.line}`, detail: `${pattern.delay}ms` });
      events.push({ type: "timer_add", name: pattern.callbackLabel ? `timer: ${pattern.callbackLabel}` : `timer line ${pattern.line}`, delay: pattern.delay });
    }
    if (pattern.type === "setInterval") {
      events.push({ type: "line", line: pattern.line, explain: `setInterval registers a repeating timer every ${pattern.delay}ms. The simulator shows the first tick only.` });
      events.push({ type: "webapi_add", name: `interval line ${pattern.line}`, detail: `${pattern.delay}ms repeating` });
      events.push({ type: "timer_add", name: pattern.callbackLabel ? `interval: ${pattern.callbackLabel}` : `interval line ${pattern.line}`, delay: pattern.delay });
    }
    if (pattern.type === "queueMicrotask") {
      events.push({ type: "line", line: pattern.line, explain: "queueMicrotask registers a microtask directly." });
      events.push({ type: "microtask_add", name: pattern.callbackLabel ? `queueMicrotask: ${pattern.callbackLabel}` : `queueMicrotask line ${pattern.line}` });
    }
    if (pattern.type === "promise_then") {
      events.push({ type: "line", line: pattern.line, explain: "Promise.resolve().then registers a microtask." });
      events.push({ type: "microtask_add", name: pattern.callbackLabel ? `then: ${pattern.callbackLabel}` : `then line ${pattern.line}` });
    }
    if (pattern.type === "promise_catch") {
      events.push({ type: "line", line: pattern.line, explain: "Promise.reject().catch registers rejection handling as a microtask." });
      events.push({ type: "microtask_add", name: pattern.callbackLabel ? `catch: ${pattern.callbackLabel}` : `catch line ${pattern.line}` });
    }
    if (pattern.type === "promise_all") {
      events.push({ type: "line", line: pattern.line, explain: `Promise.all starts ${pattern.itemCount || "multiple"} input promise(s). This is a simplified model.` });
      events.push({ type: "webapi_add", name: `Promise.all line ${pattern.line}`, detail: `${pattern.itemCount || "unknown"} inputs` });
      events.push({ type: "microtask_add", name: `Promise.all result line ${pattern.line}` });
    }
    if (pattern.type === "async_map") {
      events.push({ type: "line", line: pattern.line, explain: "Array.map with an async callback creates promises for each item. This model does not expand every item." });
      events.push({ type: "microtask_add", name: `async map callbacks line ${pattern.line}` });
    }
    if (pattern.type === "await") {
      events.push({ type: "line", line: pattern.line, explain: "await pauses the async function and schedules a continuation as a microtask." });
      events.push({ type: "microtask_add", name: `await continuation line ${pattern.line}` });
    }
  }

  events.push({ type: "stack_pop", name: "global" });

  for (const pattern of [...promiseThens, ...promiseCatches, ...queuedMicrotasks]) {
    const prefix = pattern.type === "promise_then" ? "then" : pattern.type === "promise_catch" ? "catch" : "queueMicrotask";
    const name = pattern.callbackLabel ? `${prefix}: ${pattern.callbackLabel}` : `${prefix} line ${pattern.line}`;
    events.push({ type: "microtask_run", name, explain: "Microtasks run before timer callbacks." });
    if (pattern.callbackLabel) events.push({ type: "console", value: pattern.callbackLabel });
    events.push({ type: "stack_pop", name });
  }

  for (const pattern of promiseAlls) {
    const name = `Promise.all result line ${pattern.line}`;
    events.push({ type: "microtask_run", name, explain: "Simplified Promise.all result handling runs as a microtask after inputs settle." });
    events.push({ type: "webapi_remove", name: `Promise.all line ${pattern.line}` });
    events.push({ type: "stack_pop", name });
  }

  for (const pattern of awaits) {
    const name = `await continuation line ${pattern.line}`;
    events.push({ type: "microtask_run", name, explain: "The async function resumes from the await point." });
    events.push({ type: "stack_pop", name });
  }

  for (const pattern of timers.sort((a, b) => a.delay - b.delay || a.line - b.line)) {
    const name = pattern.callbackLabel ? `timer: ${pattern.callbackLabel}` : `timer line ${pattern.line}`;
    events.push({ type: "timeline_wait", duration: pattern.delay, reason: `Timer from line ${pattern.line} becomes ready.` });
    events.push({ type: "webapi_remove", name: `timer line ${pattern.line}` });
    events.push({ type: "timer_run", name, explain: "Timer callbacks run after synchronous code and microtasks." });
    if (pattern.callbackLabel) events.push({ type: "console", value: pattern.callbackLabel });
    events.push({ type: "stack_pop", name });
  }

  for (const pattern of intervals.sort((a, b) => a.delay - b.delay || a.line - b.line)) {
    const name = pattern.callbackLabel ? `interval: ${pattern.callbackLabel}` : `interval line ${pattern.line}`;
    events.push({ type: "timeline_wait", duration: pattern.delay, reason: `First interval tick from line ${pattern.line} becomes ready.` });
    events.push({ type: "timer_run", name, explain: "setInterval repeats; this visualization shows the first tick only." });
    if (pattern.callbackLabel) events.push({ type: "console", value: pattern.callbackLabel });
    events.push({ type: "stack_pop", name });
  }

  if (patterns.length === 0) {
    events.push({ type: "line", line: 1, explain: "No supported async patterns were detected." });
  }

  if (asyncFns.length > 0 && calls.length === 0) {
    events.push({ type: "line", line: asyncFns[0].line, explain: "Async declarations alone do not execute until called." });
  }

  if (syncLogs.length === 0 && promiseThens.length === 0 && promiseCatches.length === 0 && queuedMicrotasks.length === 0 && timers.length === 0 && intervals.length === 0 && awaits.length === 0 && promiseAlls.length === 0) {
    events.push({ type: "console", value: "No simulated console output" });
  }

  return events;
}

export function predictionFromPatterns(patterns: ExtractedPattern[]): Prediction {
  const sync = patterns.flatMap((pattern) => (pattern.type === "console" && pattern.phase === "sync" ? [pattern.value] : []));
  const micro = patterns.flatMap((pattern) =>
    (pattern.type === "promise_then" || pattern.type === "promise_catch" || pattern.type === "queueMicrotask") && pattern.callbackLabel ? [pattern.callbackLabel] : []
  );
  const timers = patterns
    .flatMap((pattern) => ((pattern.type === "setTimeout" || pattern.type === "setInterval") && pattern.callbackLabel ? [pattern] : []))
    .sort((a, b) => a.delay - b.delay || a.line - b.line)
    .map((pattern) => pattern.callbackLabel)
    .filter((value): value is string => Boolean(value));
  const correct: string[] = [...sync, ...micro, ...timers];
  if (correct.length === 0) return { type: "mcq", question: "Did the analyzer find supported console output?", options: ["Yes", "No"], correct: "No" };
  const options = correct.length > 1 ? [correct[correct.length - 1], ...correct.slice(0, -1)] : correct;
  return { type: "order", question: "What output order does the simplified simulator predict?", options, correct };
}

export function explanationFromPatterns(patterns: ExtractedPattern[]): Explanation {
  const hasPromise = patterns.some((pattern) => ["promise_then", "promise_catch", "queueMicrotask", "promise_all"].includes(pattern.type) || pattern.type === "await");
  const hasTimer = patterns.some((pattern) => pattern.type === "setTimeout" || pattern.type === "setInterval");
  const hasSync = patterns.some((pattern) => pattern.type === "console" && pattern.phase === "sync");

  return {
    summary: "This is a simplified simulation of supported async patterns. It does not execute your code.",
    steps: [
      hasSync ? "Synchronous console.log calls run first on the current call stack." : "No supported synchronous console.log output was detected.",
      hasPromise ? "Promise.then, Promise.catch, queueMicrotask, Promise.all results, and await continuations use the microtask model." : "No supported microtasks were detected.",
      hasTimer ? "setTimeout and setInterval callbacks enter timer scheduling and run after microtasks." : "No supported timers were detected.",
      "Unsupported syntax may affect real runtime behavior and is listed in the limitations panel."
    ],
    mistake: "The common wrong assumption is that source order equals runtime order. Queues change the order.",
    realWorld: "Use this for quick reasoning about small snippets from React handlers, tests, Node scripts, and debugging logs."
  };
}
