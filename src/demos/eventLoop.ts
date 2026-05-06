import type { Demo } from "@/engine/types";

export const eventLoopDemos: Demo[] = [
  {
    id: "sync-execution",
    number: 1,
    title: "Sync execution",
    category: "event-loop",
    concept: "Synchronous lines run immediately, top to bottom.",
    code: `console.log("A");
console.log("B");
console.log("C");`,
    prediction: { type: "order", question: "What prints first to last?", options: ["A", "B", "C"], correct: ["A", "B", "C"] },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1, explain: "The first log runs now." }, { type: "console", value: "A" },
      { type: "line", line: 2 }, { type: "console", value: "B" },
      { type: "line", line: 3 }, { type: "console", value: "C" }, { type: "stack_pop", name: "global" }
    ],
    explanation: {
      summary: "Nothing is queued here. JavaScript keeps the current call stack until it finishes.",
      steps: ["The global script enters the stack.", "Each log executes immediately.", "The stack clears after the final line."],
      mistake: "Looking for async behavior where there is none.",
      realWorld: "Most setup code, imports, and simple calculations behave this way."
    }
  },
  {
    id: "settimeout-0",
    number: 2,
    title: "setTimeout 0",
    category: "event-loop",
    concept: "A zero millisecond timer still waits for the stack to clear.",
    code: `console.log("A");
setTimeout(() => console.log("B"), 0);
console.log("C");`,
    prediction: { type: "order", question: "What is the output order?", options: ["A", "B", "C"], correct: ["A", "C", "B"] },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "console", value: "A" },
      { type: "line", line: 2 }, { type: "timer_add", name: "timeout B" },
      { type: "line", line: 3 }, { type: "console", value: "C" }, { type: "stack_pop", name: "global" },
      { type: "timer_run", name: "timeout B" }, { type: "line", line: 2 }, { type: "console", value: "B" }, { type: "stack_pop", name: "timeout B" }
    ],
    explanation: {
      summary: "`setTimeout(..., 0)` schedules work for a later task.",
      steps: ["A prints during the script.", "The timer callback enters the timer queue.", "C prints before queued tasks can run.", "The timer runs after the stack is empty."],
      mistake: "Assuming 0 means immediate.",
      realWorld: "Useful when you need to defer UI work until after the current event handler."
    }
  },
  {
    id: "promise-before-timeout",
    number: 3,
    title: "Promise before timeout",
    category: "event-loop",
    concept: "Microtasks run before timers after the stack clears.",
    code: `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");`,
    prediction: { type: "order", question: "Predict the console output.", options: ["A", "B", "C", "D"], correct: ["A", "D", "C", "B"] },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "console", value: "A" },
      { type: "line", line: 2 }, { type: "timer_add", name: "timeout B" },
      { type: "line", line: 3 }, { type: "microtask_add", name: "then C" },
      { type: "line", line: 4 }, { type: "console", value: "D" }, { type: "stack_pop", name: "global" },
      { type: "microtask_run", name: "then C" }, { type: "line", line: 3 }, { type: "console", value: "C" }, { type: "stack_pop", name: "then C" },
      { type: "timer_run", name: "timeout B" }, { type: "line", line: 2 }, { type: "console", value: "B" }, { type: "stack_pop", name: "timeout B" }
    ],
    explanation: {
      summary: "Promise callbacks use the microtask queue, which is drained before timer tasks.",
      steps: ["The timer waits in the timer queue.", "The promise reaction waits in the microtask queue.", "The script finishes.", "Microtasks drain first, then timers."],
      mistake: "Treating all async callbacks as the same queue.",
      realWorld: "Promise-based state updates can happen before scheduled timers and animation cleanup."
    }
  },
  {
    id: "multiple-timers",
    number: 4,
    title: "Multiple timers",
    category: "event-loop",
    concept: "Timers with the same delay run in the order they were queued.",
    code: `setTimeout(() => console.log("first"), 0);
setTimeout(() => console.log("second"), 0);
console.log("sync");`,
    prediction: { type: "order", question: "Choose the output order.", options: ["first", "second", "sync"], correct: ["sync", "first", "second"] },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "timer_add", name: "first timer" },
      { type: "line", line: 2 }, { type: "timer_add", name: "second timer" }, { type: "line", line: 3 }, { type: "console", value: "sync" }, { type: "stack_pop", name: "global" },
      { type: "timer_run", name: "first timer" }, { type: "console", value: "first" }, { type: "stack_pop", name: "first timer" },
      { type: "timer_run", name: "second timer" }, { type: "console", value: "second" }, { type: "stack_pop", name: "second timer" }
    ],
    explanation: {
      summary: "Both timers wait until the script finishes, then run FIFO.",
      steps: ["Timer one is queued.", "Timer two is queued behind it.", "The synchronous log runs.", "The timer queue runs in order."],
      mistake: "Expecting timers to interrupt synchronous code.",
      realWorld: "Timer order matters in tests, retries, and UI scheduling."
    }
  },
  {
    id: "nested-timeout",
    number: 5,
    title: "Nested timeout",
    category: "event-loop",
    concept: "A timer created inside a timer waits for another task turn.",
    code: `setTimeout(() => {
  console.log("outer");
  setTimeout(() => console.log("inner"), 0);
}, 0);
console.log("sync");`,
    prediction: { type: "order", question: "What prints first to last?", options: ["outer", "inner", "sync"], correct: ["sync", "outer", "inner"] },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "timer_add", name: "outer timer" }, { type: "line", line: 5 }, { type: "console", value: "sync" }, { type: "stack_pop", name: "global" },
      { type: "timer_run", name: "outer timer" }, { type: "line", line: 2 }, { type: "console", value: "outer" }, { type: "line", line: 3 }, { type: "timer_add", name: "inner timer" }, { type: "stack_pop", name: "outer timer" },
      { type: "timer_run", name: "inner timer" }, { type: "line", line: 3 }, { type: "console", value: "inner" }, { type: "stack_pop", name: "inner timer" }
    ],
    explanation: {
      summary: "The inner timer is not eligible until the outer timer callback has finished.",
      steps: ["The outer timer is queued.", "Sync code prints.", "The outer callback runs.", "The inner timer is queued for a later task."],
      mistake: "Thinking nested async work runs inside the same task automatically.",
      realWorld: "Nested timers are common in retry loops and staged UI updates."
    }
  },
  {
    id: "promise-inside-timeout",
    number: 6,
    title: "Promise inside timeout",
    category: "event-loop",
    concept: "Microtasks created by a timer run before the next timer.",
    code: `setTimeout(() => {
  console.log("timer");
  Promise.resolve().then(() => console.log("promise"));
}, 0);
setTimeout(() => console.log("second timer"), 0);`,
    prediction: { type: "order", question: "Predict the logs.", options: ["timer", "promise", "second timer"], correct: ["timer", "promise", "second timer"] },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "timer_add", name: "timer one" }, { type: "line", line: 5 }, { type: "timer_add", name: "timer two" }, { type: "stack_pop", name: "global" },
      { type: "timer_run", name: "timer one" }, { type: "line", line: 2 }, { type: "console", value: "timer" }, { type: "line", line: 3 }, { type: "microtask_add", name: "promise log" }, { type: "stack_pop", name: "timer one" },
      { type: "microtask_run", name: "promise log" }, { type: "console", value: "promise" }, { type: "stack_pop", name: "promise log" },
      { type: "timer_run", name: "timer two" }, { type: "console", value: "second timer" }, { type: "stack_pop", name: "timer two" }
    ],
    explanation: {
      summary: "After each task, JavaScript drains microtasks before taking the next task.",
      steps: ["Two timers are queued.", "Timer one runs and creates a promise reaction.", "That microtask runs before timer two.", "Timer two runs last."],
      mistake: "Assuming the timer queue continues before checking microtasks.",
      realWorld: "This affects promise work triggered inside DOM events, timers, and network callbacks."
    }
  },
  {
    id: "timeout-inside-promise",
    number: 7,
    title: "Timeout inside promise",
    category: "event-loop",
    concept: "A timer created by a microtask joins the timer queue after existing timers.",
    code: `Promise.resolve().then(() => {
  console.log("promise");
  setTimeout(() => console.log("nested timer"), 0);
});
setTimeout(() => console.log("timer"), 0);`,
    prediction: { type: "order", question: "Predict the logs.", options: ["promise", "nested timer", "timer"], correct: ["promise", "timer", "nested timer"] },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "microtask_add", name: "promise job" }, { type: "line", line: 5 }, { type: "timer_add", name: "timer" }, { type: "stack_pop", name: "global" },
      { type: "microtask_run", name: "promise job" }, { type: "line", line: 2 }, { type: "console", value: "promise" }, { type: "line", line: 3 }, { type: "timer_add", name: "nested timer" }, { type: "stack_pop", name: "promise job" },
      { type: "timer_run", name: "timer" }, { type: "console", value: "timer" }, { type: "stack_pop", name: "timer" },
      { type: "timer_run", name: "nested timer" }, { type: "console", value: "nested timer" }, { type: "stack_pop", name: "nested timer" }
    ],
    explanation: {
      summary: "The promise runs first, but its new timer is queued behind the timer that already exists.",
      steps: ["A microtask and timer are queued.", "The microtask runs before timers.", "It adds another timer.", "Existing timer runs before the newly added one."],
      mistake: "Thinking code created earlier in source always runs earlier.",
      realWorld: "This shows up in promise-based setup that schedules fallback timers."
    }
  },
  {
    id: "blocking-loop-event-loop",
    number: 8,
    title: "Blocking loop",
    category: "event-loop",
    concept: "Long synchronous work delays every queued callback.",
    code: `setTimeout(() => console.log("timer"), 0);
for (let i = 0; i < 1_000_000_000; i++) {}
console.log("done");`,
    prediction: { type: "mcq", question: "When can the timer run?", options: ["Before the loop", "During the loop", "After the loop and sync log"], correct: "After the loop and sync log" },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "timer_add", name: "timer" },
      { type: "line", line: 2, explain: "The stack is busy. Queued callbacks cannot interrupt it." },
      { type: "line", line: 3 }, { type: "console", value: "done" }, { type: "stack_pop", name: "global" },
      { type: "timer_run", name: "timer" }, { type: "line", line: 1 }, { type: "console", value: "timer" }, { type: "stack_pop", name: "timer" }
    ],
    explanation: {
      summary: "The event loop cannot take queued work while synchronous JavaScript is still running.",
      steps: ["The timer is queued.", "The loop keeps the stack occupied.", "The final sync log prints.", "Only then can the timer callback run."],
      mistake: "Expecting timers to preempt CPU-heavy JavaScript.",
      realWorld: "Blocking work freezes clicks, rendering, and input handling."
    }
  }
];
