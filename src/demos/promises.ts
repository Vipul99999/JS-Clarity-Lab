import type { Demo } from "@/engine/types";

export const promiseDemos: Demo[] = [
  {
    id: "promise-lifecycle",
    number: 9,
    title: "Promise lifecycle",
    category: "promises",
    concept: "A promise starts pending, then settles once.",
    code: `const p = new Promise((resolve) => {
  console.log("executor");
  resolve("value");
});
p.then((value) => console.log(value));`,
    prediction: { type: "order", question: "What prints?", options: ["executor", "value"], correct: ["executor", "value"] },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "stack_push", name: "executor" }, { type: "line", line: 2 }, { type: "console", value: "executor" },
      { type: "line", line: 3 }, { type: "microtask_add", name: "then value" }, { type: "stack_pop", name: "executor" }, { type: "line", line: 5 }, { type: "stack_pop", name: "global" },
      { type: "microtask_run", name: "then value" }, { type: "console", value: "value" }, { type: "stack_pop", name: "then value" }
    ],
    explanation: {
      summary: "The executor runs synchronously; `.then` runs later as a microtask.",
      steps: ["Creating the promise calls the executor now.", "Resolving settles the promise.", "The handler is queued.", "The handler runs after the stack clears."],
      mistake: "Thinking the whole promise body is async.",
      realWorld: "Promise wrappers often do setup immediately, even before any `.then` callback."
    }
  },
  {
    id: "promise-rejection",
    number: 10,
    title: "Promise rejection",
    category: "promises",
    concept: "Rejected promises skip success handlers and go to rejection handlers.",
    code: `Promise.reject("bad")
  .then(() => console.log("ok"))
  .catch((err) => console.log(err));`,
    prediction: { type: "mcq", question: "Which value is logged?", options: ["ok", "bad", "nothing"], correct: "bad" },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "microtask_add", name: "rejection path" }, { type: "line", line: 2 }, { type: "line", line: 3 }, { type: "stack_pop", name: "global" },
      { type: "microtask_run", name: "rejection path" }, { type: "line", line: 3 }, { type: "console", value: "bad" }, { type: "stack_pop", name: "rejection path" }
    ],
    explanation: {
      summary: "A rejection bypasses `.then` success callbacks until a rejection handler catches it.",
      steps: ["The promise is already rejected.", "The success handler is skipped.", "The catch handler receives the reason."],
      mistake: "Expecting every `.then` in a chain to run.",
      realWorld: "Centralized `.catch` handlers are common for fetch and async workflows."
    }
  },
  {
    id: "then-chaining",
    number: 11,
    title: "then chaining",
    category: "promises",
    concept: "Returning a value passes it to the next `.then`.",
    code: `Promise.resolve(1)
  .then((n) => n + 1)
  .then((n) => console.log(n));`,
    prediction: { type: "text", question: "What number is logged?", correct: "2", placeholder: "Type the output" },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "microtask_add", name: "then add" }, { type: "stack_pop", name: "global" },
      { type: "microtask_run", name: "then add" }, { type: "line", line: 2 }, { type: "microtask_add", name: "then log" }, { type: "stack_pop", name: "then add" },
      { type: "microtask_run", name: "then log" }, { type: "line", line: 3 }, { type: "console", value: "2" }, { type: "stack_pop", name: "then log" }
    ],
    explanation: {
      summary: "Each `.then` returns a new promise resolved with the callback result.",
      steps: ["The first handler receives 1.", "It returns 2.", "The next handler receives 2 and logs it."],
      mistake: "Forgetting that promise chains transform values step by step.",
      realWorld: "Data pipelines often parse, map, and render through promise chains."
    }
  },
  {
    id: "missing-return",
    number: 12,
    title: "Missing return",
    category: "promises",
    concept: "If a `.then` callback does not return, the next value is `undefined`.",
    code: `Promise.resolve("A")
  .then((value) => {
    value + "B";
  })
  .then((value) => console.log(value));`,
    prediction: { type: "mcq", question: "What is logged?", options: ["AB", "A", "undefined"], correct: "undefined" },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "microtask_add", name: "then no return" }, { type: "stack_pop", name: "global" },
      { type: "microtask_run", name: "then no return" }, { type: "line", line: 3 }, { type: "microtask_add", name: "then log" }, { type: "stack_pop", name: "then no return" },
      { type: "microtask_run", name: "then log" }, { type: "line", line: 5 }, { type: "console", value: "undefined" }, { type: "stack_pop", name: "then log" }
    ],
    explanation: {
      summary: "A block-bodied arrow function needs an explicit `return`.",
      steps: ["The first handler receives A.", "It computes AB but discards it.", "The next handler receives undefined."],
      mistake: "Confusing expression arrows with block arrows.",
      realWorld: "Missing returns commonly break request chains and test setup."
    }
  },
  {
    id: "error-in-then",
    number: 13,
    title: "Error in then",
    category: "promises",
    concept: "Throwing inside `.then` turns the next promise into a rejection.",
    code: `Promise.resolve()
  .then(() => {
    throw new Error("boom");
  })
  .catch((err) => console.log(err.message));`,
    prediction: { type: "mcq", question: "Where does the thrown error go?", options: ["It crashes immediately", "It becomes a rejection", "It is ignored"], correct: "It becomes a rejection" },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "microtask_add", name: "then throw" }, { type: "stack_pop", name: "global" },
      { type: "microtask_run", name: "then throw" }, { type: "line", line: 3 }, { type: "microtask_add", name: "catch boom" }, { type: "stack_pop", name: "then throw" },
      { type: "microtask_run", name: "catch boom" }, { type: "line", line: 5 }, { type: "console", value: "boom" }, { type: "stack_pop", name: "catch boom" }
    ],
    explanation: {
      summary: "Promise chains convert thrown errors into rejected promises.",
      steps: ["The `.then` handler runs.", "It throws.", "The chain queues the catch handler.", "The message is logged."],
      mistake: "Expecting a surrounding synchronous try/catch to catch later promise callbacks.",
      realWorld: "This is why `.catch` can handle JSON parsing or mapping failures after fetch."
    }
  },
  {
    id: "promise-all-success",
    number: 14,
    title: "Promise.all success",
    category: "promises",
    concept: "`Promise.all` resolves when every input resolves.",
    code: `Promise.all([
  Promise.resolve("A"),
  Promise.resolve("B")
]).then((values) => console.log(values.join("")));`,
    prediction: { type: "text", question: "What is logged?", correct: "AB", placeholder: "Type the output" },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "microtask_add", name: "resolve A" }, { type: "microtask_add", name: "resolve B" }, { type: "stack_pop", name: "global" },
      { type: "microtask_run", name: "resolve A" }, { type: "stack_pop", name: "resolve A" }, { type: "microtask_run", name: "resolve B" }, { type: "microtask_add", name: "all then" }, { type: "stack_pop", name: "resolve B" },
      { type: "microtask_run", name: "all then" }, { type: "line", line: 4 }, { type: "console", value: "AB" }, { type: "stack_pop", name: "all then" }
    ],
    explanation: {
      summary: "`Promise.all` preserves input order in its result array.",
      steps: ["Both promises resolve.", "`Promise.all` waits for both.", "The combined handler receives A then B."],
      mistake: "Thinking result order follows completion timing.",
      realWorld: "Use it when independent requests must all finish before rendering."
    }
  },
  {
    id: "promise-all-fail",
    number: 15,
    title: "Promise.all fail",
    category: "promises",
    concept: "`Promise.all` rejects as soon as one input rejects.",
    code: `Promise.all([
  Promise.resolve("A"),
  Promise.reject("fail")
])
  .then(() => console.log("ok"))
  .catch((err) => console.log(err));`,
    prediction: { type: "mcq", question: "What is logged?", options: ["ok", "fail", "A"], correct: "fail" },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "microtask_add", name: "resolve A" }, { type: "microtask_add", name: "reject fail" }, { type: "stack_pop", name: "global" },
      { type: "microtask_run", name: "resolve A" }, { type: "stack_pop", name: "resolve A" }, { type: "microtask_run", name: "reject fail" }, { type: "microtask_add", name: "all catch" }, { type: "stack_pop", name: "reject fail" },
      { type: "microtask_run", name: "all catch" }, { type: "line", line: 6 }, { type: "console", value: "fail" }, { type: "stack_pop", name: "all catch" }
    ],
    explanation: {
      summary: "One rejection rejects the whole `Promise.all` result.",
      steps: ["One input resolves.", "Another input rejects.", "The combined promise rejects.", "The catch handler logs fail."],
      mistake: "Expecting partial successes to continue to `.then`.",
      realWorld: "Use `Promise.allSettled` when you need every result, including failures."
    }
  }
];
