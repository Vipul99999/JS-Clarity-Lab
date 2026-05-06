import { z } from "zod";
import type { EditableControl, EditableDemo } from "@/editable/types";
import { changedLine } from "@/editable/explanationGenerators";
import { q } from "@/editable/codeGenerators";
import type { Explanation, Prediction, VisualEvent } from "@/engine/types";

type Params = Record<string, unknown>;

function text(params: Params, key: string) {
  return String(params[key]);
}

function num(params: Params, key: string) {
  return Number(params[key]);
}

function bool(params: Params, key: string) {
  return Boolean(params[key]);
}

function oneOf(values: number[]) {
  return z.coerce.number().refine((value) => values.includes(value), "Choose a listed value.");
}

function diff(defaultParams: Params, currentParams: Params, labels: Record<string, string>, effect: string) {
  const changes = Object.keys(labels)
    .filter((key) => defaultParams[key] !== currentParams[key])
    .map((key) => changedLine(labels[key], defaultParams[key], currentParams[key], typeof defaultParams[key] === "number" && key.toLowerCase().includes("delay") ? "ms" : ""));
  return { changes, effect };
}

function orderPrediction(question: string, correct: string[]): Prediction {
  const options = correct.length <= 1 ? correct : [correct[correct.length - 1], ...correct.slice(0, -1)];
  return { type: "order", question, options, correct };
}

function baseExplanation(summary: string, steps: string[], mistake: string, realWorld: string): Explanation {
  return { summary, steps, mistake, realWorld };
}

const labelControls: EditableControl[] = [
  { type: "text", key: "syncLabelStart", label: "Start label", maxLength: 10 },
  { type: "text", key: "promiseLabel", label: "Promise label prefix", maxLength: 10 },
  { type: "text", key: "timerLabel", label: "Timer label", maxLength: 10 },
  { type: "text", key: "syncLabelEnd", label: "End label", maxLength: 10 }
];

export const editableDemos: EditableDemo[] = [
  {
    id: "promise-before-timeout",
    title: "Promise vs Timer",
    category: "event-loop",
    difficulty: "beginner",
    concept: {
      short: "Microtasks run before timers, even when timer delay is 0.",
      detail: "Change timer delay and promise count to see why promise callbacks still beat timer callbacks."
    },
    defaultParams: { timerDelay: 0, promiseCount: 1, syncLabelStart: "A", promiseLabel: "C", timerLabel: "B", syncLabelEnd: "D" },
    schema: z.object({
      timerDelay: oneOf([0, 10, 1000]),
      promiseCount: z.coerce.number().min(1).max(5),
      syncLabelStart: z.string().max(10),
      promiseLabel: z.string().max(10),
      timerLabel: z.string().max(10),
      syncLabelEnd: z.string().max(10)
    }),
    controls: [
      { type: "select", key: "timerDelay", label: "Timer delay", options: [{ label: "0ms", value: "0" }, { label: "10ms", value: "10" }, { label: "1000ms", value: "1000" }] },
      { type: "number", key: "promiseCount", label: "Promise callbacks", min: 1, max: 5, step: 1 },
      ...labelControls
    ],
    generateCode(params) {
      const promises = Array.from({ length: num(params, "promiseCount") })
        .map((_, index) => `Promise.resolve().then(() => console.log(${q(`${text(params, "promiseLabel")}${index + 1}`)}));`)
        .join("\n");
      return `console.log(${q(text(params, "syncLabelStart"))});

setTimeout(() => {
  console.log(${q(text(params, "timerLabel"))});
}, ${num(params, "timerDelay")});

${promises}

console.log(${q(text(params, "syncLabelEnd"))});`;
    },
    generateEvents(params) {
      const events: VisualEvent[] = [{ type: "stack_push", name: "global" }, { type: "line", line: 1, explain: "Synchronous code runs first." }, { type: "console", value: text(params, "syncLabelStart") }, { type: "line", line: 3, explain: "setTimeout registers a timer callback." }, { type: "webapi_add", name: "timer", detail: `${num(params, "timerDelay")}ms delay` }, { type: "timer_add", name: "setTimeout callback", delay: num(params, "timerDelay") }];
      for (let i = 0; i < num(params, "promiseCount"); i++) events.push({ type: "line", line: 7 + i, explain: "Promise .then callbacks enter the microtask queue." }, { type: "microtask_add", name: `Promise.then ${i + 1}` });
      events.push({ type: "line", line: 8 + num(params, "promiseCount"), explain: "Synchronous code continues before queues are processed." }, { type: "console", value: text(params, "syncLabelEnd") }, { type: "stack_pop", name: "global" });
      for (let i = 0; i < num(params, "promiseCount"); i++) events.push({ type: "microtask_run", name: `Promise.then ${i + 1}`, explain: "Microtasks run before timer callbacks." }, { type: "console", value: `${text(params, "promiseLabel")}${i + 1}` }, { type: "stack_pop", name: `Promise.then ${i + 1}` });
      events.push({ type: "timeline_wait", duration: num(params, "timerDelay"), reason: "Timer delay expires after microtasks." }, { type: "webapi_remove", name: "timer" }, { type: "timer_run", name: "setTimeout callback", explain: "The timer runs after synchronous code and microtasks." }, { type: "console", value: text(params, "timerLabel") }, { type: "stack_pop", name: "setTimeout callback" });
      return events;
    },
    generatePrediction(params) {
      return orderPrediction("What will be printed to the console?", [text(params, "syncLabelStart"), text(params, "syncLabelEnd"), ...Array.from({ length: num(params, "promiseCount") }).map((_, i) => `${text(params, "promiseLabel")}${i + 1}`), text(params, "timerLabel")]);
    },
    generateExplanation(params) {
      return baseExplanation("Synchronous logs run first. Promise callbacks run as microtasks. Timer callbacks run after microtasks.", [`"${text(params, "syncLabelStart")}" logs immediately.`, `setTimeout registers a ${num(params, "timerDelay")}ms timer.`, `${num(params, "promiseCount")} promise callback(s) enter the microtask queue.`, `"${text(params, "syncLabelEnd")}" logs before queued callbacks.`, "Microtasks drain before timers.", `"${text(params, "timerLabel")}" logs last.`], "Many developers expect setTimeout(..., 0) to run immediately, but it only schedules a callback.", "This matters when mixing promises, timers, UI updates, API callbacks, and test assertions.");
    },
    generateDiffSummary: (a, b) => diff(a, b, { timerDelay: "Timer delay", promiseCount: "Promise count", syncLabelStart: "Start label", promiseLabel: "Promise label", timerLabel: "Timer label", syncLabelEnd: "End label" }, "Promise callbacks still run before the timer because microtasks are processed before timer callbacks.")
  },
  {
    id: "multiple-timers",
    title: "Multiple Timers",
    category: "event-loop",
    difficulty: "beginner",
    concept: { short: "Timers are scheduled now, but run later by delay and queue order.", detail: "Change delay patterns and declaration order to see which timer gets to the queue first." },
    defaultParams: { timerCount: 3, delayMode: "same", declarationOrder: "normal" },
    schema: z.object({ timerCount: z.coerce.number().min(2).max(5), delayMode: z.enum(["same", "ascending", "descending"]), declarationOrder: z.enum(["normal", "reverse"]) }),
    controls: [
      { type: "number", key: "timerCount", label: "Number of timers", min: 2, max: 5, step: 1 },
      { type: "select", key: "delayMode", label: "Delay values", options: [{ label: "All 0ms", value: "same" }, { label: "Ascending", value: "ascending" }, { label: "Descending", value: "descending" }] },
      { type: "select", key: "declarationOrder", label: "Declaration order", options: [{ label: "Timer 1 first", value: "normal" }, { label: "Last timer first", value: "reverse" }] }
    ],
    generateCode(params) {
      return timerSpecs(params).map((timer) => `setTimeout(() => console.log("T${timer.id}"), ${timer.delay});`).join("\n") + `\nconsole.log("sync");`;
    },
    generateEvents(params) {
      const specs = timerSpecs(params);
      const events: VisualEvent[] = [{ type: "stack_push", name: "global" }];
      specs.forEach((timer, index) => events.push({ type: "line", line: index + 1, explain: `Timer T${timer.id} is registered with ${timer.delay}ms delay.` }, { type: "timer_add", name: `T${timer.id}`, delay: timer.delay }));
      events.push({ type: "line", line: specs.length + 1 }, { type: "console", value: "sync" }, { type: "stack_pop", name: "global" });
      [...specs].sort((a, b) => a.delay - b.delay || a.order - b.order).forEach((timer) => events.push({ type: "timeline_wait", duration: timer.delay, reason: `T${timer.id} becomes ready.` }, { type: "timer_run", name: `T${timer.id}` }, { type: "console", value: `T${timer.id}` }, { type: "stack_pop", name: `T${timer.id}` }));
      return events;
    },
    generatePrediction: (params) => orderPrediction("Which logs first?", ["sync", ...[...timerSpecs(params)].sort((a, b) => a.delay - b.delay || a.order - b.order).map((timer) => `T${timer.id}`)]),
    generateExplanation: (params) => baseExplanation("Timers never interrupt synchronous code. Ready timers then run by delay and queue order.", ["Every timer is registered during the global script.", "The sync log runs before any timer callback.", "Lower delay timers become ready earlier.", "Timers with equal delay keep declaration order."], "Expecting the timer callback to run on the line where setTimeout appears.", "This appears in retry logic, staged UI transitions, test timers, and analytics scheduling."),
    generateDiffSummary: (a, b) => diff(a, b, { timerCount: "Timer count", delayMode: "Delay mode", declarationOrder: "Declaration order" }, "The sync output stays first, but timer callback order can change when delays or declarations change.")
  },
  {
    id: "timeout-inside-promise",
    title: "Timer Inside Promise",
    category: "event-loop",
    difficulty: "intermediate",
    concept: { short: "Where a timer is scheduled changes its place in line.", detail: "Move timer registration inside or outside promise callbacks and watch queue order change." },
    defaultParams: { timerDelay: 0, timerLocation: "inside", promiseCount: 1 },
    schema: z.object({ timerDelay: oneOf([0, 10, 1000]), timerLocation: z.enum(["inside", "outside"]), promiseCount: z.coerce.number().min(1).max(4) }),
    controls: [
      { type: "select", key: "timerDelay", label: "Timer delay", options: [{ label: "0ms", value: "0" }, { label: "10ms", value: "10" }, { label: "1000ms", value: "1000" }] },
      { type: "select", key: "timerLocation", label: "Timer location", options: [{ label: "Inside promise", value: "inside" }, { label: "Outside promise", value: "outside" }] },
      { type: "number", key: "promiseCount", label: "Promise callbacks", min: 1, max: 4, step: 1 }
    ],
    generateCode(params) {
      const inside = text(params, "timerLocation") === "inside";
      return `${inside ? "" : `setTimeout(() => console.log("timer"), ${num(params, "timerDelay")});\n`}
${Array.from({ length: num(params, "promiseCount") }).map((_, i) => `Promise.resolve().then(() => {
  console.log("promise ${i + 1}");
  ${inside && i === 0 ? `setTimeout(() => console.log("timer"), ${num(params, "timerDelay")});` : ""}
});`).join("\n")}
console.log("sync");`;
    },
    generateEvents(params) {
      const inside = text(params, "timerLocation") === "inside";
      const events: VisualEvent[] = [{ type: "stack_push", name: "global" }];
      if (!inside) events.push({ type: "line", line: 1 }, { type: "timer_add", name: "timer", delay: num(params, "timerDelay") });
      for (let i = 0; i < num(params, "promiseCount"); i++) events.push({ type: "microtask_add", name: `promise ${i + 1}` });
      events.push({ type: "console", value: "sync" }, { type: "stack_pop", name: "global" });
      for (let i = 0; i < num(params, "promiseCount"); i++) {
        events.push({ type: "microtask_run", name: `promise ${i + 1}` }, { type: "console", value: `promise ${i + 1}` });
        if (inside && i === 0) events.push({ type: "timer_add", name: "timer", delay: num(params, "timerDelay") });
        events.push({ type: "stack_pop", name: `promise ${i + 1}` });
      }
      events.push({ type: "timeline_wait", duration: num(params, "timerDelay") }, { type: "timer_run", name: "timer" }, { type: "console", value: "timer" }, { type: "stack_pop", name: "timer" });
      return events;
    },
    generatePrediction: (params) => orderPrediction("What prints?", ["sync", ...Array.from({ length: num(params, "promiseCount") }).map((_, i) => `promise ${i + 1}`), "timer"]),
    generateExplanation: (params) => baseExplanation("The timer callback can only run after the current stack and microtasks are done.", [`The timer is scheduled ${text(params, "timerLocation") === "inside" ? "inside the first promise callback" : "during the global script"}.`, "Promise callbacks still drain before timer callbacks.", "A timer created inside a promise joins the timer queue later."], "Assuming a timer's source position is the only thing that matters.", "This shows up when promise setup schedules fallback timers or cleanup work."),
    generateDiffSummary: (a, b) => diff(a, b, { timerDelay: "Timer delay", timerLocation: "Timer location", promiseCount: "Promise count" }, "Moving timer registration changes when it joins the timer queue, but microtasks still drain first.")
  },
  {
    id: "blocking-loop-event-loop",
    title: "Blocking Loop Delays Timer",
    category: "event-loop",
    difficulty: "beginner",
    concept: { short: "Timers cannot run while the call stack is blocked.", detail: "Move the blocking work and change its duration to see why ready timers still wait." },
    defaultParams: { loopDuration: 500, timerDelay: 0, blockPosition: "after" },
    schema: z.object({ loopDuration: oneOf([100, 500, 1500]), timerDelay: oneOf([0, 100, 1000]), blockPosition: z.enum(["before", "after"]) }),
    controls: [
      { type: "select", key: "loopDuration", label: "Loop duration", options: [{ label: "Small", value: "100" }, { label: "Medium", value: "500" }, { label: "Large", value: "1500" }] },
      { type: "select", key: "timerDelay", label: "Timer delay", options: [{ label: "0ms", value: "0" }, { label: "100ms", value: "100" }, { label: "1000ms", value: "1000" }] },
      { type: "select", key: "blockPosition", label: "Blocking happens", options: [{ label: "Before timer registration", value: "before" }, { label: "After timer registration", value: "after" }] }
    ],
    generateCode: (params) => text(params, "blockPosition") === "before" ? `blockFor(${num(params, "loopDuration")});
setTimeout(() => console.log("timer"), ${num(params, "timerDelay")});
console.log("done");` : `setTimeout(() => console.log("timer"), ${num(params, "timerDelay")});
blockFor(${num(params, "loopDuration")});
console.log("done");`,
    generateEvents(params) {
      const before = text(params, "blockPosition") === "before";
      const events: VisualEvent[] = [{ type: "stack_push", name: "global" }];
      if (before) events.push({ type: "performance_block", duration: num(params, "loopDuration"), reason: "CPU loop blocks the stack." });
      events.push({ type: "timer_add", name: "timer", delay: num(params, "timerDelay") });
      if (!before) events.push({ type: "performance_block", duration: num(params, "loopDuration"), reason: "Timer may be ready, but the stack is blocked." });
      events.push({ type: "console", value: "done" }, { type: "stack_pop", name: "global" }, { type: "timeline_wait", duration: num(params, "timerDelay") }, { type: "timer_run", name: "timer" }, { type: "console", value: "timer" }, { type: "stack_pop", name: "timer" });
      return events;
    },
    generatePrediction: () => orderPrediction("What prints first?", ["done", "timer"]),
    generateExplanation: (params) => baseExplanation("Blocking work keeps the call stack busy, so timers wait even if their delay has elapsed.", [`The loop blocks for about ${num(params, "loopDuration")}ms.`, `The timer delay is ${num(params, "timerDelay")}ms.`, "The timer callback cannot run until global code finishes."], "Thinking a ready timer can interrupt CPU-heavy JavaScript.", "Large JSON parsing, export generation, sorting, and render-time calculations can freeze UI."),
    generateDiffSummary: (a, b) => diff(a, b, { loopDuration: "Loop duration", timerDelay: "Timer delay", blockPosition: "Block position" }, "Longer blocking makes the timer appear later in the visual timeline.")
  },
  {
    id: "missing-return",
    title: "Promise Chain Return",
    category: "promises",
    difficulty: "beginner",
    concept: { short: "Missing return breaks value flow through .then().", detail: "Toggle return and add handlers to see where undefined appears." },
    defaultParams: { includeReturn: false, resolveValue: "A", thenCount: 2 },
    schema: z.object({ includeReturn: z.coerce.boolean(), resolveValue: z.string().max(10), thenCount: z.coerce.number().min(1).max(4) }),
    controls: [
      { type: "boolean", key: "includeReturn", label: "Include return" },
      { type: "text", key: "resolveValue", label: "Resolve value", maxLength: 10 },
      { type: "number", key: "thenCount", label: "Then handlers", min: 1, max: 4, step: 1 }
    ],
    generateCode(params) {
      const ret = bool(params, "includeReturn") ? "return value + \"!\";" : "value + \"!\";";
      return `Promise.resolve(${q(text(params, "resolveValue"))})
  .then((value) => {
    ${ret}
  })
${Array.from({ length: num(params, "thenCount") - 1 }).map(() => `  .then((value) => value)`).join("\n")}
  .then((value) => console.log(value));`;
    },
    generateEvents(params) {
      const output = bool(params, "includeReturn") ? `${text(params, "resolveValue")}!` : "undefined";
      return [{ type: "stack_push", name: "global" }, { type: "microtask_add", name: "then transform" }, { type: "stack_pop", name: "global" }, { type: "microtask_run", name: "then transform" }, { type: "microtask_add", name: "then log" }, { type: "stack_pop", name: "then transform" }, { type: "microtask_run", name: "then log" }, { type: "console", value: output }, { type: "stack_pop", name: "then log" }];
    },
    generatePrediction: (params) => ({ type: "mcq", question: "What reaches the final log?", options: [`${text(params, "resolveValue")}!`, text(params, "resolveValue"), "undefined"], correct: bool(params, "includeReturn") ? `${text(params, "resolveValue")}!` : "undefined" }),
    generateExplanation: (params) => baseExplanation(bool(params, "includeReturn") ? "The returned value flows to the next handler." : "The transform is computed but discarded, so the chain receives undefined.", ["The first handler receives the resolved value.", bool(params, "includeReturn") ? "It returns the changed value." : "It does not return anything.", "The final log receives the value from the previous handler."], "Block-bodied arrow functions need explicit return.", "Promise chains in API mapping and test setup often fail from this exact missing return."),
    generateDiffSummary: (a, b) => diff(a, b, { includeReturn: "Return behavior", resolveValue: "Resolve value", thenCount: "Then handler count" }, "Adding return changes the final logged value; extra pass-through handlers do not fix a missing return.")
  },
  {
    id: "promise-all-fail",
    title: "Promise.all",
    category: "promises",
    difficulty: "intermediate",
    concept: { short: "Promise.all waits for all success, but rejects on first failure.", detail: "Change fake APIs, delays, and failure target to see short-circuiting." },
    defaultParams: { callCount: 3, failingCall: "none", delaySpread: "mixed" },
    schema: z.object({ callCount: z.coerce.number().min(2).max(5), failingCall: z.enum(["none", "1", "2", "3", "4", "5"]), delaySpread: z.enum(["same", "mixed", "reverse"]) }),
    controls: [
      { type: "number", key: "callCount", label: "API calls", min: 2, max: 5, step: 1 },
      { type: "select", key: "failingCall", label: "Failing request", options: ["none", "1", "2", "3", "4", "5"].map((value) => ({ label: value === "none" ? "None" : `API ${value}`, value })) },
      { type: "select", key: "delaySpread", label: "Delay pattern", options: [{ label: "Same", value: "same" }, { label: "Mixed", value: "mixed" }, { label: "Reverse", value: "reverse" }] }
    ],
    generateCode: (params) => `Promise.all([${apiSpecs(params).map((api) => `api(${api.id}, ${api.delay}${api.fail ? ", true" : ""})`).join(", ")}])
  .then(() => console.log("all ok"))
  .catch(() => console.log("failed"));`,
    generateEvents(params) {
      const specs = apiSpecs(params);
      const events: VisualEvent[] = [{ type: "stack_push", name: "global" }];
      specs.forEach((api) => events.push({ type: "webapi_add", name: `api ${api.id}`, detail: `${api.delay}ms${api.fail ? " fails" : " ok"}` }));
      events.push({ type: "stack_pop", name: "global" });
      const firstFail = specs.filter((api) => api.fail).sort((a, b) => a.delay - b.delay)[0];
      [...specs].sort((a, b) => a.delay - b.delay).forEach((api) => events.push({ type: "timeline_wait", duration: api.delay }, { type: "webapi_remove", name: `api ${api.id}` }, ...(firstFail && api.id === firstFail.id ? [{ type: "microtask_add", name: "Promise.all catch" } as VisualEvent] : [])));
      events.push({ type: "microtask_run", name: firstFail ? "Promise.all catch" : "Promise.all then" }, { type: "console", value: firstFail ? "failed" : "all ok" }, { type: "stack_pop", name: firstFail ? "Promise.all catch" : "Promise.all then" });
      return firstFail ? events : [...events.slice(0, -3), { type: "microtask_add", name: "Promise.all then" }, ...events.slice(-3)];
    },
    generatePrediction: (params) => ({ type: "mcq", question: "What does Promise.all log?", options: ["all ok", "failed"], correct: text(params, "failingCall") === "none" ? "all ok" : "failed" }),
    generateExplanation: (params) => baseExplanation(text(params, "failingCall") === "none" ? "All calls succeed, so Promise.all fulfills." : "The first failing call rejects the whole Promise.all.", ["All requests start together.", "Promise.all tracks every input promise.", text(params, "failingCall") === "none" ? "The final success handler runs after all finish." : "The catch handler runs when the first rejection arrives."], "Expecting Promise.all to return partial successes after one failure.", "Parallel fetches for dashboards, uploads, and fan-out service requests."),
    generateDiffSummary: (a, b) => diff(a, b, { callCount: "API call count", failingCall: "Failing request", delaySpread: "Delay pattern" }, "Failure settings decide whether the success or catch path runs; delays decide when that path becomes visible.")
  },
  {
    id: "promise-race-any",
    title: "Promise.race vs Promise.any",
    category: "promises",
    difficulty: "advanced",
    concept: { short: "race settles first; any fulfills first successful promise.", detail: "Switch methods and result patterns to see why first does not always mean first success." },
    defaultParams: { method: "race", firstFails: true, firstDelay: 100, secondDelay: 300 },
    schema: z.object({ method: z.enum(["race", "any"]), firstFails: z.coerce.boolean(), firstDelay: oneOf([100, 300, 800]), secondDelay: oneOf([100, 300, 800]) }),
    controls: [
      { type: "select", key: "method", label: "Method", options: [{ label: "Promise.race", value: "race" }, { label: "Promise.any", value: "any" }] },
      { type: "boolean", key: "firstFails", label: "Fast request fails" },
      { type: "select", key: "firstDelay", label: "Fast request delay", options: [{ label: "100ms", value: "100" }, { label: "300ms", value: "300" }, { label: "800ms", value: "800" }] },
      { type: "select", key: "secondDelay", label: "Other request delay", options: [{ label: "100ms", value: "100" }, { label: "300ms", value: "300" }, { label: "800ms", value: "800" }] }
    ],
    generateCode: (params) => `Promise.${text(params, "method")}([
  request("fast", ${num(params, "firstDelay")}, ${bool(params, "firstFails")}),
  request("backup", ${num(params, "secondDelay")}, false)
]).then(console.log).catch(() => console.log("failed"));`,
    generateEvents(params) {
      const method = text(params, "method");
      const firstWins = num(params, "firstDelay") <= num(params, "secondDelay");
      const output = method === "race" ? (firstWins && bool(params, "firstFails") ? "failed" : firstWins ? "fast" : "backup") : (firstWins && bool(params, "firstFails") ? "backup" : firstWins ? "fast" : "backup");
      return [{ type: "stack_push", name: "global" }, { type: "webapi_add", name: "fast", detail: `${num(params, "firstDelay")}ms${bool(params, "firstFails") ? " fails" : " ok"}` }, { type: "webapi_add", name: "backup", detail: `${num(params, "secondDelay")}ms ok` }, { type: "stack_pop", name: "global" }, { type: "timeline_wait", duration: Math.min(num(params, "firstDelay"), num(params, "secondDelay")) }, { type: "microtask_add", name: `Promise.${method} result` }, { type: "microtask_run", name: `Promise.${method} result` }, { type: "console", value: output }, { type: "stack_pop", name: `Promise.${method} result` }];
    },
    generatePrediction: (params) => ({ type: "mcq", question: "What settles the combined promise?", options: ["fast", "backup", "failed"], correct: text(params, "method") === "race" && bool(params, "firstFails") && num(params, "firstDelay") <= num(params, "secondDelay") ? "failed" : num(params, "firstDelay") <= num(params, "secondDelay") && !bool(params, "firstFails") ? "fast" : "backup" }),
    generateExplanation: (params) => baseExplanation(`Promise.${text(params, "method")} uses ${text(params, "method") === "race" ? "the first settled promise" : "the first fulfilled promise"}.`, ["Both requests start immediately.", "The earlier request settles first.", text(params, "method") === "race" ? "race accepts success or failure as the winner." : "any ignores failures until a success fulfills."], "Using race when you actually want the first successful result.", "Fallback APIs, CDN mirrors, timeout races, and redundant request strategies."),
    generateDiffSummary: (a, b) => diff(a, b, { method: "Promise method", firstFails: "Fast request failure", firstDelay: "Fast request delay", secondDelay: "Backup delay" }, "Switching from race to any changes whether a fast failure ends the operation.")
  },
  {
    id: "sequential-await",
    title: "Sequential vs Parallel Await",
    category: "async-await",
    difficulty: "intermediate",
    concept: { short: "Sequential awaits add wait time; parallel waits for the slowest request.", detail: "Change mode, API count, and delay to see total wait shift." },
    defaultParams: { mode: "sequential", apiCount: 3, apiDelay: 300 },
    schema: z.object({ mode: z.enum(["sequential", "parallel"]), apiCount: z.coerce.number().min(2).max(5), apiDelay: oneOf([100, 300, 800]) }),
    controls: [
      { type: "select", key: "mode", label: "Await mode", options: [{ label: "Sequential", value: "sequential" }, { label: "Parallel Promise.all", value: "parallel" }] },
      { type: "number", key: "apiCount", label: "API calls", min: 2, max: 5, step: 1 },
      { type: "select", key: "apiDelay", label: "API delay", options: [{ label: "100ms", value: "100" }, { label: "300ms", value: "300" }, { label: "800ms", value: "800" }] }
    ],
    generateCode: (params) => text(params, "mode") === "sequential" ? `for (const id of ids.slice(0, ${num(params, "apiCount")})) {
  await fetchThing(id);
}
console.log("done");` : `await Promise.all(
  ids.slice(0, ${num(params, "apiCount")}).map(fetchThing)
);
console.log("done");`,
    generateEvents(params) {
      const events: VisualEvent[] = [{ type: "stack_push", name: "load" }];
      if (text(params, "mode") === "parallel") {
        for (let i = 1; i <= num(params, "apiCount"); i++) events.push({ type: "webapi_add", name: `api ${i}`, detail: `${num(params, "apiDelay")}ms` });
        events.push({ type: "stack_pop", name: "load" }, { type: "timeline_wait", duration: num(params, "apiDelay") }, { type: "microtask_add", name: "resume all" });
      } else {
        for (let i = 1; i <= num(params, "apiCount"); i++) events.push({ type: "webapi_add", name: `api ${i}`, detail: `${num(params, "apiDelay")}ms` }, { type: "timeline_wait", duration: num(params, "apiDelay") }, { type: "webapi_remove", name: `api ${i}` });
        events.push({ type: "microtask_add", name: "resume after last" });
      }
      events.push({ type: "microtask_run", name: text(params, "mode") === "parallel" ? "resume all" : "resume after last" }, { type: "console", value: "done" }, { type: "stack_pop", name: text(params, "mode") === "parallel" ? "resume all" : "resume after last" });
      return events;
    },
    generatePrediction: (params) => ({ type: "mcq", question: "What is the total wait shape?", options: ["Adds every delay", "Waits for slowest call"], correct: text(params, "mode") === "sequential" ? "Adds every delay" : "Waits for slowest call" }),
    generateExplanation: (params) => baseExplanation(text(params, "mode") === "sequential" ? "Each request starts after the previous one finishes." : "All requests start before the await waits for them.", [`${num(params, "apiCount")} requests are involved.`, `Each request takes about ${num(params, "apiDelay")}ms.`, text(params, "mode") === "sequential" ? "Total wait grows with every request." : "Total wait is close to one request delay."], "Awaiting independent calls one by one when they could start together.", "Page data loading, dashboard widgets, service fan-out, and batch validations."),
    generateDiffSummary: (a, b) => diff(a, b, { mode: "Await mode", apiCount: "API count", apiDelay: "API delay" }, "Parallel mode shortens the visual wait because requests overlap.")
  },
  {
    id: "missing-await",
    title: "Missing Await",
    category: "async-await",
    difficulty: "beginner",
    concept: { short: "Without await, later code continues before the async result is ready.", detail: "Toggle await and watch whether the result or Promise is logged first." },
    defaultParams: { includeAwait: false, apiDelay: 300, startLabel: "start", endLabel: "after" },
    schema: z.object({ includeAwait: z.coerce.boolean(), apiDelay: oneOf([100, 300, 1000]), startLabel: z.string().max(10), endLabel: z.string().max(10) }),
    controls: [
      { type: "boolean", key: "includeAwait", label: "Include await" },
      { type: "select", key: "apiDelay", label: "API delay", options: [{ label: "100ms", value: "100" }, { label: "300ms", value: "300" }, { label: "1000ms", value: "1000" }] },
      { type: "text", key: "startLabel", label: "Start label", maxLength: 10 },
      { type: "text", key: "endLabel", label: "After label", maxLength: 10 }
    ],
    generateCode: (params) => `async function run() {
  console.log(${q(text(params, "startLabel"))});
  const result = ${bool(params, "includeAwait") ? "await " : ""}fetchValue(${num(params, "apiDelay")});
  console.log(${q(text(params, "endLabel"))}, result);
}`,
    generateEvents(params) {
      const events: VisualEvent[] = [{ type: "stack_push", name: "run" }, { type: "console", value: text(params, "startLabel") }, { type: "webapi_add", name: "fetchValue", detail: `${num(params, "apiDelay")}ms` }];
      if (bool(params, "includeAwait")) events.push({ type: "stack_pop", name: "run" }, { type: "timeline_wait", duration: num(params, "apiDelay") }, { type: "microtask_run", name: "resume run" }, { type: "console", value: `${text(params, "endLabel")} value` }, { type: "stack_pop", name: "resume run" });
      else events.push({ type: "console", value: `${text(params, "endLabel")} Promise` }, { type: "stack_pop", name: "run" }, { type: "timeline_wait", duration: num(params, "apiDelay") });
      return events;
    },
    generatePrediction: (params) => orderPrediction("What logs?", bool(params, "includeAwait") ? [text(params, "startLabel"), `${text(params, "endLabel")} value`] : [text(params, "startLabel"), `${text(params, "endLabel")} Promise`]),
    generateExplanation: (params) => baseExplanation(bool(params, "includeAwait") ? "Await pauses the function until the result is ready." : "Without await, the Promise object is used immediately.", ["The async operation starts.", bool(params, "includeAwait") ? "The function yields and resumes later." : "The next line runs right away.", "The console shows whether code waited."], "Forgetting await and treating a promise like its resolved value.", "Form submits, auth checks, tests, saves, and redirects."),
    generateDiffSummary: (a, b) => diff(a, b, { includeAwait: "Await usage", apiDelay: "API delay", startLabel: "Start label", endLabel: "After label" }, "Adding await changes whether the log sees a resolved value or a pending promise.")
  },
  {
    id: "async-foreach-issue",
    title: "Async forEach Problem",
    category: "async-await",
    difficulty: "intermediate",
    concept: { short: "forEach does not wait for async callbacks.", detail: "Switch loop style and see when done logs." },
    defaultParams: { loopMethod: "forEach", itemCount: 3, itemDelay: 200 },
    schema: z.object({ loopMethod: z.enum(["forEach", "forOf", "promiseAll"]), itemCount: z.coerce.number().min(2).max(5), itemDelay: oneOf([100, 200, 800]) }),
    controls: [
      { type: "select", key: "loopMethod", label: "Loop method", options: [{ label: "forEach", value: "forEach" }, { label: "for...of", value: "forOf" }, { label: "Promise.all", value: "promiseAll" }] },
      { type: "number", key: "itemCount", label: "Items", min: 2, max: 5, step: 1 },
      { type: "select", key: "itemDelay", label: "Item delay", options: [{ label: "100ms", value: "100" }, { label: "200ms", value: "200" }, { label: "800ms", value: "800" }] }
    ],
    generateCode: (params) => text(params, "loopMethod") === "forEach" ? `items.forEach(async (item) => {
  await save(item);
  console.log(item);
});
console.log("done");` : text(params, "loopMethod") === "forOf" ? `for (const item of items) {
  await save(item);
  console.log(item);
}
console.log("done");` : `await Promise.all(items.map(async (item) => {
  await save(item);
  console.log(item);
}));
console.log("done");`,
    generateEvents(params) {
      const method = text(params, "loopMethod");
      const items = Array.from({ length: num(params, "itemCount") }).map((_, i) => `${i + 1}`);
      const events: VisualEvent[] = [{ type: "stack_push", name: method }];
      if (method === "forEach") events.push(...items.flatMap((item) => [{ type: "microtask_add", name: `save ${item}` } as VisualEvent]), { type: "console", value: "done" }, { type: "stack_pop", name: method }, ...items.flatMap((item) => [{ type: "timeline_wait", duration: num(params, "itemDelay") } as VisualEvent, { type: "microtask_run", name: `save ${item}` } as VisualEvent, { type: "console", value: item } as VisualEvent, { type: "stack_pop", name: `save ${item}` } as VisualEvent]));
      else if (method === "forOf") events.push(...items.flatMap((item) => [{ type: "timeline_wait", duration: num(params, "itemDelay") } as VisualEvent, { type: "console", value: item } as VisualEvent]), { type: "console", value: "done" }, { type: "stack_pop", name: method });
      else events.push(...items.map((item) => ({ type: "webapi_add", name: `save ${item}`, detail: `${num(params, "itemDelay")}ms` } as VisualEvent)), { type: "timeline_wait", duration: num(params, "itemDelay") }, ...items.map((item) => ({ type: "console", value: item } as VisualEvent)), { type: "console", value: "done" }, { type: "stack_pop", name: method });
      return events;
    },
    generatePrediction(params) {
      const items = Array.from({ length: num(params, "itemCount") }).map((_, i) => `${i + 1}`);
      return orderPrediction("What prints first to last?", text(params, "loopMethod") === "forEach" ? ["done", ...items] : [...items, "done"]);
    },
    generateExplanation: (params) => baseExplanation(text(params, "loopMethod") === "forEach" ? "forEach ignores promises returned by async callbacks." : "This loop style waits for the async work before logging done.", ["Each item starts async work.", text(params, "loopMethod") === "forEach" ? "The outer code does not wait." : "The outer code waits for the selected async pattern.", "The position of done reveals whether waiting happened."], "Expecting forEach to await async callbacks.", "Bulk saves, uploads, migrations, queue processing, and tests."),
    generateDiffSummary: (a, b) => diff(a, b, { loopMethod: "Loop method", itemCount: "Item count", itemDelay: "Item delay" }, "Switching away from forEach moves done after item work completes.")
  },
  {
    id: "interval-leak",
    title: "Uncleared Interval Leak",
    category: "memory",
    difficulty: "intermediate",
    concept: { short: "Intervals keep running and retaining captured memory unless cleared.", detail: "Toggle cleanup and adjust interval/memory to see retention change." },
    defaultParams: { cleanupEnabled: false, intervalFrequency: 1000, memoryPerTick: 5 },
    schema: z.object({ cleanupEnabled: z.coerce.boolean(), intervalFrequency: oneOf([250, 1000, 5000]), memoryPerTick: z.coerce.number().min(1).max(20) }),
    controls: [
      { type: "boolean", key: "cleanupEnabled", label: "Cleanup enabled" },
      { type: "select", key: "intervalFrequency", label: "Interval frequency", options: [{ label: "250ms", value: "250" }, { label: "1000ms", value: "1000" }, { label: "5000ms", value: "5000" }] },
      { type: "number", key: "memoryPerTick", label: "Memory per tick", min: 1, max: 20, step: 1 }
    ],
    generateCode: (params) => `const data = allocate(${num(params, "memoryPerTick")});
const id = setInterval(() => {
  console.log(data.length);
}, ${num(params, "intervalFrequency")});
${bool(params, "cleanupEnabled") ? "clearInterval(id);" : "// no cleanup"}`,
    generateEvents(params) {
      const events: VisualEvent[] = [{ type: "stack_push", name: "mount" }, { type: "memory_allocate", id: "data", label: "captured data", size: num(params, "memoryPerTick") }, { type: "memory_retain", id: "data", reason: "interval closure" }, { type: "timer_add", name: "interval", delay: num(params, "intervalFrequency") }];
      if (bool(params, "cleanupEnabled")) events.push({ type: "memory_release", id: "data" }, { type: "gc_attempt", result: "collected", reason: "interval was cleared" });
      else events.push({ type: "timeline_wait", duration: num(params, "intervalFrequency") }, { type: "memory_allocate", id: "tick growth", label: "heap growth approximation", size: num(params, "memoryPerTick") * 2 }, { type: "gc_attempt", result: "not_collected", reason: "interval still references data" });
      events.push({ type: "stack_pop", name: "mount" });
      return events;
    },
    generatePrediction: (params) => ({ type: "mcq", question: "Can the captured data be collected?", options: ["Yes", "No"], correct: bool(params, "cleanupEnabled") ? "Yes" : "No" }),
    generateExplanation: (params) => baseExplanation(bool(params, "cleanupEnabled") ? "Cleanup releases the interval, so captured memory can be collected." : "The active interval keeps its callback and captured data alive.", ["Data is allocated.", "The interval callback captures it.", bool(params, "cleanupEnabled") ? "clearInterval removes the active timer." : "No cleanup means the timer remains active.", "GC follows reachability, not intent."], "Forgetting interval cleanup when a UI screen unmounts.", "Polling, live dashboards, analytics pings, and rotating banners."),
    generateDiffSummary: (a, b) => diff(a, b, { cleanupEnabled: "Cleanup", intervalFrequency: "Interval frequency", memoryPerTick: "Memory per tick" }, "Cleanup changes the GC result from retained to collectible.")
  },
  {
    id: "microtask-flood",
    title: "Microtask Flood",
    category: "performance",
    difficulty: "advanced",
    concept: { short: "Too many microtasks can delay timers and make the app feel stuck.", detail: "Increase microtask count and watch the timer wait behind the microtask drain." },
    defaultParams: { microtaskCount: 3, timerDelay: 0 },
    schema: z.object({ microtaskCount: z.coerce.number().min(1).max(20), timerDelay: oneOf([0, 10, 100]) }),
    controls: [
      { type: "number", key: "microtaskCount", label: "Microtasks", min: 1, max: 20, step: 1 },
      { type: "select", key: "timerDelay", label: "Timer delay", options: [{ label: "0ms", value: "0" }, { label: "10ms", value: "10" }, { label: "100ms", value: "100" }] }
    ],
    generateCode: (params) => `for (let i = 0; i < ${num(params, "microtaskCount")}; i++) {
  Promise.resolve().then(() => console.log("microtask", i));
}
setTimeout(() => console.log("timer"), ${num(params, "timerDelay")});`,
    generateEvents(params) {
      const events: VisualEvent[] = [{ type: "stack_push", name: "global" }];
      for (let i = 1; i <= num(params, "microtaskCount"); i++) events.push({ type: "microtask_add", name: `microtask ${i}` });
      events.push({ type: "timer_add", name: "timer", delay: num(params, "timerDelay") }, { type: "stack_pop", name: "global" });
      for (let i = 1; i <= num(params, "microtaskCount"); i++) events.push({ type: "microtask_run", name: `microtask ${i}` }, { type: "console", value: `microtask ${i}` }, { type: "stack_pop", name: `microtask ${i}` });
      events.push({ type: "timeline_wait", duration: num(params, "timerDelay") }, { type: "timer_run", name: "timer" }, { type: "console", value: "timer" }, { type: "stack_pop", name: "timer" });
      return events;
    },
    generatePrediction: (params) => orderPrediction("What logs first?", [...Array.from({ length: num(params, "microtaskCount") }).map((_, i) => `microtask ${i + 1}`), "timer"]),
    generateExplanation: (params) => baseExplanation("The event loop drains all microtasks before moving to timers.", [`${num(params, "microtaskCount")} microtasks are queued.`, `The timer has ${num(params, "timerDelay")}ms delay.`, "The timer waits until the microtask queue is empty."], "Creating long promise chains that starve timers and rendering.", "Schedulers, batching systems, reactive updates, and retry loops."),
    generateDiffSummary: (a, b) => diff(a, b, { microtaskCount: "Microtask count", timerDelay: "Timer delay" }, "More microtasks lengthen the visual timeline before the timer can run.")
  }
];

function timerSpecs(params: Params) {
  const count = num(params, "timerCount");
  const ids = Array.from({ length: count }).map((_, i) => i + 1);
  const ordered = text(params, "declarationOrder") === "reverse" ? [...ids].reverse() : ids;
  return ordered.map((id, order) => ({
    id,
    order,
    delay: text(params, "delayMode") === "same" ? 0 : text(params, "delayMode") === "ascending" ? (id - 1) * 100 : (count - id) * 100
  }));
}

function apiSpecs(params: Params) {
  const count = num(params, "callCount");
  const failing = text(params, "failingCall");
  return Array.from({ length: count }).map((_, i) => {
    const id = i + 1;
    return {
      id,
      fail: failing === String(id),
      delay: text(params, "delaySpread") === "same" ? 200 : text(params, "delaySpread") === "reverse" ? (count - id + 1) * 150 : id * 150
    };
  });
}
