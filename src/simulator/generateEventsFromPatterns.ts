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
  const promiseAllSettleds = patterns.filter((pattern) => pattern.type === "promise_allSettled");
  const promiseRaces = patterns.filter((pattern) => pattern.type === "promise_race");
  const promiseAnys = patterns.filter((pattern) => pattern.type === "promise_any");
  const fetchThens = patterns.filter((pattern) => pattern.type === "fetch_then");
  const fetchCatches = patterns.filter((pattern) => pattern.type === "fetch_catch");
  const fsPromises = patterns.filter((pattern) => pattern.type === "fs_promises");
  const awaitPromiseAlls = patterns.filter((pattern) => pattern.type === "await_promise_all");
  const nextTicks = patterns.filter((pattern) => pattern.type === "process_nextTick");
  const immediates = patterns.filter((pattern) => pattern.type === "setImmediate");
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
    if (pattern.type === "setImmediate") {
      events.push({ type: "line", line: pattern.line, explain: "setImmediate schedules a Node check-phase callback. The analyzer shows it after timers in this simplified model unless I/O context is known." });
      events.push({ type: "webapi_add", name: `setImmediate line ${pattern.line}`, detail: "check phase" });
      events.push({ type: "timer_add", name: pattern.callbackLabel ? `immediate: ${pattern.callbackLabel}` : `immediate line ${pattern.line}` });
    }
    if (pattern.type === "queueMicrotask") {
      events.push({ type: "line", line: pattern.line, explain: "queueMicrotask registers a microtask directly." });
      events.push({ type: "microtask_add", name: pattern.callbackLabel ? `queueMicrotask: ${pattern.callbackLabel}` : `queueMicrotask line ${pattern.line}` });
    }
    if (pattern.type === "promise_then") {
      events.push({ type: "line", line: pattern.line, explain: "Promise.resolve().then registers a microtask." });
      events.push({ type: "microtask_add", name: pattern.callbackLabel ? `then: ${pattern.callbackLabel}` : `then line ${pattern.line}` });
    }
    if (pattern.type === "process_nextTick") {
      events.push({ type: "line", line: pattern.line, explain: "process.nextTick schedules a Node-specific callback that runs before Promise microtasks." });
      events.push({ type: "microtask_add", name: pattern.callbackLabel ? `nextTick: ${pattern.callbackLabel}` : `nextTick line ${pattern.line}` });
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
    if (pattern.type === "promise_allSettled") {
      events.push({ type: "line", line: pattern.line, explain: `Promise.allSettled waits for ${pattern.itemCount || "all"} input promise(s) and keeps both fulfilled and rejected outcomes.` });
      events.push({ type: "webapi_add", name: `Promise.allSettled line ${pattern.line}`, detail: `${pattern.itemCount || "unknown"} inputs` });
      events.push({ type: "microtask_add", name: `Promise.allSettled result line ${pattern.line}` });
    }
    if (pattern.type === "promise_race") {
      events.push({ type: "line", line: pattern.line, explain: `Promise.race settles with the first settled input among ${pattern.itemCount || "multiple"} promise(s). It does not cancel slower work by itself.` });
      events.push({ type: "webapi_add", name: `Promise.race line ${pattern.line}`, detail: `${pattern.itemCount || "unknown"} inputs` });
      events.push({ type: "microtask_add", name: `Promise.race first settlement line ${pattern.line}` });
    }
    if (pattern.type === "promise_any") {
      events.push({ type: "line", line: pattern.line, explain: `Promise.any waits for the first fulfilled input among ${pattern.itemCount || "multiple"} promise(s), ignoring early rejections.` });
      events.push({ type: "webapi_add", name: `Promise.any line ${pattern.line}`, detail: `${pattern.itemCount || "unknown"} inputs` });
      events.push({ type: "microtask_add", name: `Promise.any first fulfillment line ${pattern.line}` });
    }
    if (pattern.type === "fetch_then") {
      events.push({ type: "line", line: pattern.line, explain: "fetch starts network work; .then continues later as a Promise microtask." });
      events.push({ type: "webapi_add", name: `fetch line ${pattern.line}`, detail: "network request" });
      events.push({ type: "microtask_add", name: pattern.callbackLabel ? `fetch.then: ${pattern.callbackLabel}` : `fetch.then line ${pattern.line}` });
    }
    if (pattern.type === "fetch_catch") {
      events.push({ type: "line", line: pattern.line, explain: "fetch error handling continues later through a Promise rejection microtask." });
      events.push({ type: "microtask_add", name: pattern.callbackLabel ? `fetch.catch: ${pattern.callbackLabel}` : `fetch.catch line ${pattern.line}` });
    }
    if (pattern.type === "event_listener") {
      events.push({ type: "line", line: pattern.line, explain: `${pattern.eventName} listener is registered. Its callback runs only when that event happens later.` });
      events.push({ type: "webapi_add", name: `${pattern.eventName} listener`, detail: "event listener" });
    }
    if (pattern.type === "express_middleware") {
      events.push({ type: "line", line: pattern.line, explain: `${pattern.method} ${pattern.path} middleware runs in registration order${pattern.callsNext ? " and calls next()" : " and may stop the chain if it does not call next()"}.` });
      events.push({ type: "stack_push", name: `${pattern.method} ${pattern.path} middleware` });
      events.push({ type: "stack_pop", name: `${pattern.method} ${pattern.path} middleware` });
    }
    if (pattern.type === "react_effect") {
      events.push({ type: "line", line: pattern.line, explain: `React useEffect runs after render${pattern.hasCleanup ? " and registers cleanup" : "; no cleanup was detected"}.` });
      events.push({ type: "webapi_add", name: `useEffect line ${pattern.line}`, detail: pattern.hasCleanup ? "effect with cleanup" : "effect without cleanup" });
      if (!pattern.hasCleanup) events.push({ type: "memory_retain", id: `effect-${pattern.line}`, reason: "No cleanup detected for effect work." });
    }
    if (pattern.type === "react_effect_cleanup") {
      events.push({ type: "memory_release", id: `effect-${pattern.line}` });
    }
    if (pattern.type === "fake_timer_test") {
      events.push({ type: "line", line: pattern.line, explain: `${pattern.framework}.${pattern.method} changes how timer callbacks are flushed in tests. Promises may still need a microtask flush.` });
      events.push({ type: "timer_add", name: `${pattern.framework}.${pattern.method}` });
    }
    if (pattern.type === "fs_promises") {
      events.push({ type: "line", line: pattern.line, explain: `fs.promises.${pattern.method} starts async filesystem work and resumes through a Promise continuation.` });
      events.push({ type: "webapi_add", name: `fs.promises.${pattern.method}`, detail: "filesystem promise" });
      events.push({ type: "microtask_add", name: `fs promise result line ${pattern.line}` });
    }
    if (pattern.type === "await_promise_all") {
      events.push({ type: "line", line: pattern.line, explain: `await Promise.all starts ${pattern.itemCount || "multiple"} promise(s) and resumes when all fulfill in this simplified model.` });
      events.push({ type: "webapi_add", name: `await Promise.all line ${pattern.line}`, detail: `${pattern.itemCount || "unknown"} inputs` });
      events.push({ type: "microtask_add", name: `await Promise.all continuation line ${pattern.line}` });
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

  for (const pattern of [...nextTicks, ...promiseThens, ...promiseCatches, ...queuedMicrotasks]) {
    const prefix = pattern.type === "promise_then" ? "then" : pattern.type === "promise_catch" ? "catch" : pattern.type === "process_nextTick" ? "nextTick" : "queueMicrotask";
    const name = pattern.callbackLabel ? `${prefix}: ${pattern.callbackLabel}` : `${prefix} line ${pattern.line}`;
    events.push({ type: "microtask_run", name, explain: pattern.type === "process_nextTick" ? "Node drains process.nextTick before Promise microtasks." : "Microtasks run before timer callbacks." });
    if (pattern.callbackLabel) events.push({ type: "console", value: pattern.callbackLabel });
    events.push({ type: "stack_pop", name });
  }

  for (const pattern of promiseAlls) {
    const name = `Promise.all result line ${pattern.line}`;
    events.push({ type: "microtask_run", name, explain: "Simplified Promise.all result handling runs as a microtask after inputs settle." });
    events.push({ type: "webapi_remove", name: `Promise.all line ${pattern.line}` });
    events.push({ type: "stack_pop", name });
  }

  for (const pattern of promiseAllSettleds) {
    const name = `Promise.allSettled result line ${pattern.line}`;
    events.push({ type: "microtask_run", name, explain: "allSettled keeps every fulfilled/rejected outcome instead of failing fast." });
    events.push({ type: "webapi_remove", name: `Promise.allSettled line ${pattern.line}` });
    events.push({ type: "console", value: "allSettled outcomes ready" });
    events.push({ type: "stack_pop", name });
  }

  for (const pattern of promiseRaces) {
    const name = `Promise.race first settlement line ${pattern.line}`;
    events.push({ type: "microtask_run", name, explain: "race settles with the first fulfilled or rejected input. Slower work may still continue." });
    events.push({ type: "webapi_remove", name: `Promise.race line ${pattern.line}` });
    events.push({ type: "console", value: "race settled first" });
    events.push({ type: "stack_pop", name });
  }

  for (const pattern of promiseAnys) {
    const name = `Promise.any first fulfillment line ${pattern.line}`;
    events.push({ type: "microtask_run", name, explain: "any fulfills with the first success and rejects only if every input rejects." });
    events.push({ type: "webapi_remove", name: `Promise.any line ${pattern.line}` });
    events.push({ type: "console", value: "any fulfilled first" });
    events.push({ type: "stack_pop", name });
  }

  for (const pattern of fetchThens) {
    const name = pattern.callbackLabel ? `fetch.then: ${pattern.callbackLabel}` : `fetch.then line ${pattern.line}`;
    events.push({ type: "microtask_run", name, explain: "When the simplified fetch resolves, the .then callback runs as a microtask." });
    events.push({ type: "webapi_remove", name: `fetch line ${pattern.line}` });
    if (pattern.callbackLabel) events.push({ type: "console", value: pattern.callbackLabel });
    events.push({ type: "stack_pop", name });
  }

  for (const pattern of fetchCatches) {
    const name = pattern.callbackLabel ? `fetch.catch: ${pattern.callbackLabel}` : `fetch.catch line ${pattern.line}`;
    events.push({ type: "microtask_run", name, explain: "Fetch rejection handlers run as Promise microtasks after the failed external work settles." });
    if (pattern.callbackLabel) events.push({ type: "console", value: pattern.callbackLabel });
    events.push({ type: "stack_pop", name });
  }

  for (const pattern of fsPromises) {
    const name = `fs promise result line ${pattern.line}`;
    events.push({ type: "microtask_run", name, explain: "The filesystem promise continuation resumes after the async fs work completes." });
    events.push({ type: "webapi_remove", name: `fs.promises.${pattern.method}` });
    events.push({ type: "stack_pop", name });
  }

  for (const pattern of awaitPromiseAlls) {
    const name = `await Promise.all continuation line ${pattern.line}`;
    events.push({ type: "microtask_run", name, explain: "The async function resumes after every Promise.all input fulfills." });
    events.push({ type: "webapi_remove", name: `await Promise.all line ${pattern.line}` });
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

  for (const pattern of immediates) {
    const name = pattern.callbackLabel ? `immediate: ${pattern.callbackLabel}` : `immediate line ${pattern.line}`;
    events.push({ type: "webapi_remove", name: `setImmediate line ${pattern.line}` });
    events.push({ type: "timer_run", name, explain: "setImmediate is modeled as a Node check-phase callback after this turn." });
    if (pattern.callbackLabel) events.push({ type: "console", value: pattern.callbackLabel });
    events.push({ type: "stack_pop", name });
  }

  if (patterns.length === 0) {
    events.push({ type: "line", line: 1, explain: "No supported async patterns were detected." });
  }

  if (asyncFns.length > 0 && calls.length === 0) {
    events.push({ type: "line", line: asyncFns[0].line, explain: "Async declarations alone do not execute until called." });
  }

  if (syncLogs.length === 0 && promiseThens.length === 0 && promiseCatches.length === 0 && queuedMicrotasks.length === 0 && timers.length === 0 && intervals.length === 0 && awaits.length === 0 && promiseAlls.length === 0 && promiseAllSettleds.length === 0 && promiseRaces.length === 0 && promiseAnys.length === 0 && fetchThens.length === 0 && fetchCatches.length === 0 && fsPromises.length === 0 && awaitPromiseAlls.length === 0 && nextTicks.length === 0 && immediates.length === 0) {
    events.push({ type: "console", value: "No simulated console output" });
  }

  return events;
}

export function predictionFromPatterns(patterns: ExtractedPattern[]): Prediction {
  const sync = patterns.flatMap((pattern) => (pattern.type === "console" && pattern.phase === "sync" ? [pattern.value] : []));
  const micro = patterns.flatMap((pattern) =>
    (pattern.type === "process_nextTick" || pattern.type === "promise_then" || pattern.type === "promise_catch" || pattern.type === "queueMicrotask" || pattern.type === "fetch_then" || pattern.type === "fetch_catch") && pattern.callbackLabel ? [pattern.callbackLabel] : []
  );
  const timers = patterns
    .flatMap((pattern) => ((pattern.type === "setTimeout" || pattern.type === "setInterval") && pattern.callbackLabel ? [pattern] : []))
    .sort((a, b) => a.delay - b.delay || a.line - b.line)
    .map((pattern) => pattern.callbackLabel)
    .filter((value): value is string => Boolean(value));
  const combinators = patterns.flatMap((pattern) =>
    pattern.type === "promise_allSettled" ? ["allSettled outcomes ready"] : pattern.type === "promise_race" ? ["race settled first"] : pattern.type === "promise_any" ? ["any fulfilled first"] : []
  );
  const immediates = patterns.flatMap((pattern) => (pattern.type === "setImmediate" && pattern.callbackLabel ? [pattern.callbackLabel] : []));
  const correct: string[] = [...sync, ...micro, ...combinators, ...timers, ...immediates];
  if (correct.length === 0) return { type: "mcq", question: "Did the analyzer find supported console output?", options: ["Yes", "No"], correct: "No" };
  const options = correct.length > 1 ? [correct[correct.length - 1], ...correct.slice(0, -1)] : correct;
  return { type: "order", question: "What output order does the simplified simulator predict?", options, correct };
}

export function explanationFromPatterns(patterns: ExtractedPattern[]): Explanation {
  const hasPromise = patterns.some((pattern) => ["promise_then", "promise_catch", "queueMicrotask", "promise_all", "promise_allSettled", "promise_race", "promise_any", "fetch_then", "fetch_catch", "fs_promises", "await_promise_all", "process_nextTick"].includes(pattern.type) || pattern.type === "await");
  const hasTimer = patterns.some((pattern) => pattern.type === "setTimeout" || pattern.type === "setInterval");
  const hasSync = patterns.some((pattern) => pattern.type === "console" && pattern.phase === "sync");

  return {
    summary: "This is a simplified simulation of supported async patterns. It does not execute your code.",
    steps: [
      hasSync ? "Synchronous console.log calls run first on the current call stack." : "No supported synchronous console.log output was detected.",
      hasPromise ? "Promise callbacks, queueMicrotask, process.nextTick, Promise combinator results, and await continuations use simplified queue models." : "No supported microtasks were detected.",
      hasTimer ? "setTimeout and setInterval callbacks enter timer scheduling and run after microtasks." : "No supported timers were detected.",
      "Unsupported syntax may affect real runtime behavior and is listed in the limitations panel."
    ],
    mistake: "The common wrong assumption is that source order equals runtime order. Queues change the order.",
    realWorld: "Use this for quick reasoning about small snippets from React handlers, tests, Node scripts, and debugging logs."
  };
}
