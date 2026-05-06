import type { Demo } from "@/engine/types";

export const realWorldDemos: Demo[] = [
  {
    id: "react-batched-state-log",
    number: 41,
    title: "React batched state log",
    category: "real-world",
    concept: "State updates are scheduled, so logging state right after setState can show the old value.",
    code: `function handleClick() {
  setCount(count + 1);
  console.log(count);
}`,
    prediction: {
      type: "mcq",
      question: "If count is 0, what does the log usually show inside this handler?",
      options: ["0", "1", "It logs both"],
      correct: "0"
    },
    events: [
      { type: "stack_push", name: "click handler" },
      { type: "line", line: 2, explain: "React schedules the state update for a render." },
      { type: "microtask_add", name: "React state flush" },
      { type: "line", line: 3 },
      { type: "console", value: "0" },
      { type: "stack_pop", name: "click handler" },
      { type: "microtask_run", name: "React state flush" },
      { type: "console", value: "render count: 1" },
      { type: "stack_pop", name: "React state flush" }
    ],
    explanation: {
      summary: "The handler closes over the state value from the current render.",
      steps: ["The click handler starts with count equal to 0.", "setCount schedules the next render.", "The immediate log still sees the current render's count.", "React applies the update during its flush."],
      mistake: "Expecting state variables to mutate immediately like plain objects.",
      realWorld: "This shows up in React forms, counters, analytics events, and logic that reads state immediately after updating it."
    }
  },
  {
    id: "react-effect-cleanup-race",
    number: 42,
    title: "Effect cleanup race",
    category: "real-world",
    concept: "React runs cleanup for the previous effect before the next effect starts.",
    code: `useEffect(() => {
  const controller = new AbortController();
  fetchUser(id, { signal: controller.signal });

  return () => controller.abort();
}, [id]);`,
    prediction: {
      type: "mcq",
      question: "What happens to the old request when id changes?",
      options: ["It keeps running forever", "Cleanup aborts it", "React waits for both"],
      correct: "Cleanup aborts it"
    },
    events: [
      { type: "stack_push", name: "effect for id=1" },
      { type: "line", line: 2 },
      { type: "memory_allocate", id: "controller", label: "AbortController id=1", size: 1 },
      { type: "line", line: 3 },
      { type: "webapi_add", name: "fetch user 1", detail: "Request is in flight." },
      { type: "stack_pop", name: "effect for id=1" },
      { type: "timeline_wait", duration: 40, reason: "User changes id before fetch finishes." },
      { type: "stack_push", name: "cleanup id=1" },
      { type: "line", line: 5, explain: "Cleanup runs before the next effect." },
      { type: "webapi_remove", name: "fetch user 1" },
      { type: "memory_release", id: "controller" },
      { type: "stack_pop", name: "cleanup id=1" },
      { type: "stack_push", name: "effect for id=2" },
      { type: "webapi_add", name: "fetch user 2" },
      { type: "stack_pop", name: "effect for id=2" }
    ],
    explanation: {
      summary: "Cleanup prevents stale async work from writing old data into new UI.",
      steps: ["The first effect starts a request.", "The dependency changes.", "React calls the cleanup.", "The new effect starts after cleanup."],
      mistake: "Forgetting cleanup and letting old requests win a race.",
      realWorld: "This prevents wrong profile data, flickering search results, and stale route content in React apps."
    }
  },
  {
    id: "stale-closure-timeout",
    number: 43,
    title: "Stale closure timeout",
    category: "real-world",
    concept: "A delayed callback remembers the values from when it was created.",
    code: `let status = "saving";

setTimeout(() => {
  console.log(status);
}, 1000);

status = "saved";`,
    prediction: {
      type: "mcq",
      question: "In plain JavaScript, what does the timeout read from this variable binding?",
      options: ["saving", "saved", "undefined"],
      correct: "saved"
    },
    events: [
      { type: "stack_push", name: "global" },
      { type: "line", line: 1 },
      { type: "memory_allocate", id: "status", label: "status variable", size: 1 },
      { type: "line", line: 3 },
      { type: "timer_add", name: "status timeout", delay: 1000 },
      { type: "line", line: 7, explain: "The same variable binding is updated before the timeout runs." },
      { type: "memory_retain", id: "status", reason: "The timeout closure can read it later." },
      { type: "stack_pop", name: "global" },
      { type: "timeline_wait", duration: 1000, reason: "Timer delay completes." },
      { type: "timer_run", name: "status timeout" },
      { type: "line", line: 4 },
      { type: "console", value: "saved" },
      { type: "stack_pop", name: "status timeout" }
    ],
    explanation: {
      summary: "Closures capture variable bindings, not a frozen screenshot of every value.",
      steps: ["status starts as saving.", "The timeout callback is scheduled.", "status changes to saved.", "The callback later reads the updated binding."],
      mistake: "Confusing closure behavior in plain JavaScript with React render snapshots.",
      realWorld: "This affects delayed notifications, retry callbacks, telemetry, and timeout-based cleanup logic."
    }
  },
  {
    id: "jest-fake-timers-promises",
    number: 44,
    title: "Fake timers vs promises",
    category: "real-world",
    concept: "Advancing fake timers does not automatically flush every Promise microtask.",
    code: `setTimeout(() => console.log("timer"), 0);
Promise.resolve().then(() => console.log("promise"));

jest.advanceTimersByTime(0);`,
    prediction: {
      type: "mcq",
      question: "What extra step do tests often need?",
      options: ["Flush microtasks", "Create more timers", "Block the loop"],
      correct: "Flush microtasks"
    },
    events: [
      { type: "stack_push", name: "test body" },
      { type: "line", line: 1 },
      { type: "timer_add", name: "fake timer", delay: 0 },
      { type: "line", line: 2 },
      { type: "microtask_add", name: "Promise.then" },
      { type: "line", line: 4, explain: "Fake timer APIs control timers, not every Promise job." },
      { type: "timer_run", name: "fake timer" },
      { type: "console", value: "timer" },
      { type: "stack_pop", name: "fake timer" },
      { type: "microtask_run", name: "Promise.then" },
      { type: "console", value: "promise" },
      { type: "stack_pop", name: "Promise.then" }
    ],
    explanation: {
      summary: "Timers and microtasks are different queues, and test helpers may advance only one of them.",
      steps: ["The timer is scheduled.", "The promise callback is scheduled.", "The fake timer is advanced.", "A microtask flush may still be needed for promise assertions."],
      mistake: "Writing flaky tests that assume all async work finished after advancing timers.",
      realWorld: "This is common in Jest/Vitest tests for debounced inputs, retries, loading spinners, and async React components."
    }
  },
  {
    id: "requestanimationframe-vs-timeout",
    number: 45,
    title: "requestAnimationFrame vs timeout",
    category: "real-world",
    concept: "requestAnimationFrame is aligned with the browser paint cycle; timers are general tasks.",
    code: `requestAnimationFrame(() => console.log("paint work"));
setTimeout(() => console.log("timer work"), 0);
console.log("sync");`,
    prediction: {
      type: "order",
      question: "In this simplified frame model, what runs first?",
      options: ["paint work", "timer work", "sync"],
      correct: ["sync", "paint work", "timer work"]
    },
    events: [
      { type: "stack_push", name: "global" },
      { type: "line", line: 1 },
      { type: "webapi_add", name: "animation frame", detail: "Runs before the next paint." },
      { type: "line", line: 2 },
      { type: "timer_add", name: "timer work", delay: 0 },
      { type: "line", line: 3 },
      { type: "console", value: "sync" },
      { type: "stack_pop", name: "global" },
      { type: "timeline_wait", duration: 16, reason: "Browser reaches the next frame." },
      { type: "webapi_remove", name: "animation frame" },
      { type: "timer_run", name: "animation frame" },
      { type: "console", value: "paint work" },
      { type: "stack_pop", name: "animation frame" },
      { type: "timer_run", name: "timer work" },
      { type: "console", value: "timer work" },
      { type: "stack_pop", name: "timer work" }
    ],
    explanation: {
      summary: "Animation work should be coordinated with frames instead of random timer turns.",
      steps: ["Both callbacks are scheduled.", "Sync code finishes.", "The frame callback runs at the next paint opportunity.", "The timer runs as a normal task."],
      mistake: "Using setTimeout for visual animation timing.",
      realWorld: "This improves smoothness in drag interactions, charts, canvas work, scroll effects, and layout measurement."
    }
  },
  {
    id: "debounce-vs-throttle",
    number: 46,
    title: "Debounce vs throttle",
    category: "real-world",
    concept: "Debounce waits for quiet; throttle limits how often work can run.",
    code: `onInput("j");
onInput("js");
onInput("js ");

// debounce: run after typing stops
// throttle: run at most once per window`,
    prediction: {
      type: "mcq",
      question: "Which strategy is best for search-as-you-type API calls?",
      options: ["Debounce", "Throttle", "Run every keypress"],
      correct: "Debounce"
    },
    events: [
      { type: "stack_push", name: "input j" },
      { type: "line", line: 1 },
      { type: "timer_add", name: "debounce search j", delay: 300 },
      { type: "stack_pop", name: "input j" },
      { type: "stack_push", name: "input js" },
      { type: "line", line: 2, explain: "The earlier debounce timer is replaced." },
      { type: "timer_add", name: "debounce search js", delay: 300 },
      { type: "stack_pop", name: "input js" },
      { type: "stack_push", name: "input js space" },
      { type: "line", line: 3 },
      { type: "timer_add", name: "debounce search js space", delay: 300 },
      { type: "stack_pop", name: "input js space" },
      { type: "timeline_wait", duration: 300, reason: "Typing stops." },
      { type: "timer_run", name: "debounce search js space" },
      { type: "console", value: "search: js " },
      { type: "stack_pop", name: "debounce search js space" }
    ],
    explanation: {
      summary: "Debounce collapses a burst of events into the final action after a quiet period.",
      steps: ["Each input schedules work.", "New input replaces the previous pending debounce.", "Only the final value runs after the delay.", "Throttle would run periodically during the burst."],
      mistake: "Calling an API for every keypress or using throttle where the final value matters most.",
      realWorld: "Use debounce for search boxes and validation; use throttle for scroll, resize, and pointer tracking."
    }
  },
  {
    id: "fetch-abort-race-ui",
    number: 47,
    title: "Fetch abort race",
    category: "real-world",
    concept: "Cancel stale requests so older responses cannot overwrite newer UI state.",
    code: `let controller = new AbortController();
fetch("/api?q=old", { signal: controller.signal });

controller.abort();
controller = new AbortController();
fetch("/api?q=new", { signal: controller.signal });`,
    prediction: {
      type: "mcq",
      question: "Which request should update the UI?",
      options: ["old", "new", "both"],
      correct: "new"
    },
    events: [
      { type: "stack_push", name: "search old" },
      { type: "line", line: 1 },
      { type: "memory_allocate", id: "old-controller", label: "old controller", size: 1 },
      { type: "line", line: 2 },
      { type: "webapi_add", name: "fetch old", detail: "Old query is in flight." },
      { type: "line", line: 4, explain: "The old request is cancelled before it can write stale data." },
      { type: "webapi_remove", name: "fetch old" },
      { type: "memory_release", id: "old-controller" },
      { type: "line", line: 5 },
      { type: "memory_allocate", id: "new-controller", label: "new controller", size: 1 },
      { type: "line", line: 6 },
      { type: "webapi_add", name: "fetch new" },
      { type: "stack_pop", name: "search old" },
      { type: "timeline_wait", duration: 80, reason: "New response arrives." },
      { type: "webapi_remove", name: "fetch new" },
      { type: "microtask_run", name: "render new results" },
      { type: "console", value: "render: new" },
      { type: "stack_pop", name: "render new results" }
    ],
    explanation: {
      summary: "Cancellation turns a race between old and new requests into one valid winner.",
      steps: ["The old request starts.", "The user changes the query.", "The old request is aborted.", "Only the new response updates the UI."],
      mistake: "Letting slower old requests overwrite newer state.",
      realWorld: "This is essential in search, filters, route loaders, dashboards, and autocomplete components."
    }
  },
  {
    id: "websocket-message-task",
    number: 48,
    title: "WebSocket message task",
    category: "real-world",
    concept: "WebSocket messages arrive as event tasks; they do not interrupt synchronous rendering.",
    code: `socket.onmessage = () => console.log("message");

console.log("render start");
expensiveRender();
console.log("render end");`,
    prediction: {
      type: "mcq",
      question: "If a message arrives during expensiveRender, when can it log?",
      options: ["message before render end", "render end before message", "message interrupts the function"],
      correct: "render end before message"
    },
    events: [
      { type: "stack_push", name: "render" },
      { type: "line", line: 1 },
      { type: "webapi_add", name: "WebSocket listener" },
      { type: "line", line: 3 },
      { type: "console", value: "render start" },
      { type: "line", line: 4 },
      { type: "performance_block", duration: 120, reason: "expensiveRender keeps the stack busy." },
      { type: "timer_add", name: "message event" },
      { type: "line", line: 5 },
      { type: "console", value: "render end" },
      { type: "stack_pop", name: "render" },
      { type: "timer_run", name: "message event" },
      { type: "console", value: "message" },
      { type: "stack_pop", name: "message event" }
    ],
    explanation: {
      summary: "Incoming events wait until the current JavaScript stack is clear.",
      steps: ["The message listener is registered.", "Rendering starts.", "A message arrives while rendering blocks.", "The message callback runs only after rendering ends."],
      mistake: "Expecting network events to interrupt CPU-heavy work.",
      realWorld: "This affects live dashboards, chats, trading screens, collaborative apps, and real-time notifications."
    }
  },
  {
    id: "idle-callback-background-work",
    number: 49,
    title: "Idle callback background work",
    category: "real-world",
    concept: "requestIdleCallback runs low-priority work only when the browser has spare time.",
    code: `requestIdleCallback(() => {
  console.log("send analytics");
});

console.log("paint important UI");`,
    prediction: {
      type: "order",
      question: "What should happen first?",
      options: ["send analytics", "paint important UI"],
      correct: ["paint important UI", "send analytics"]
    },
    events: [
      { type: "stack_push", name: "page work" },
      { type: "line", line: 1 },
      { type: "webapi_add", name: "idle callback", detail: "Low priority background work." },
      { type: "line", line: 5 },
      { type: "console", value: "paint important UI" },
      { type: "stack_pop", name: "page work" },
      { type: "timeline_wait", duration: 200, reason: "Browser finishes important frame work first." },
      { type: "webapi_remove", name: "idle callback" },
      { type: "timer_run", name: "idle callback" },
      { type: "console", value: "send analytics" },
      { type: "stack_pop", name: "idle callback" }
    ],
    explanation: {
      summary: "Idle callbacks are for optional work that should not compete with the user experience.",
      steps: ["Analytics is scheduled as idle work.", "Important UI work runs first.", "The browser waits for idle time.", "The background task runs later."],
      mistake: "Doing analytics, cache warming, or cleanup on the critical interaction path.",
      realWorld: "This helps with analytics flushing, precomputing, non-urgent persistence, and performance-friendly cleanup."
    }
  },
  {
    id: "mutation-observer-microtask",
    number: 50,
    title: "MutationObserver timing",
    category: "real-world",
    concept: "MutationObserver callbacks run before timers after DOM changes are observed.",
    code: `observer.observe(root, { childList: true });

root.appendChild(node);
setTimeout(() => console.log("timer"), 0);
console.log("sync");`,
    prediction: {
      type: "order",
      question: "What logs first to last in this simplified model?",
      options: ["observer", "timer", "sync"],
      correct: ["sync", "observer", "timer"]
    },
    events: [
      { type: "stack_push", name: "global" },
      { type: "line", line: 1 },
      { type: "webapi_add", name: "MutationObserver" },
      { type: "line", line: 3, explain: "The DOM mutation schedules observer delivery." },
      { type: "microtask_add", name: "observer callback" },
      { type: "line", line: 4 },
      { type: "timer_add", name: "timer", delay: 0 },
      { type: "line", line: 5 },
      { type: "console", value: "sync" },
      { type: "stack_pop", name: "global" },
      { type: "microtask_run", name: "observer callback" },
      { type: "console", value: "observer" },
      { type: "stack_pop", name: "observer callback" },
      { type: "timer_run", name: "timer" },
      { type: "console", value: "timer" },
      { type: "stack_pop", name: "timer" }
    ],
    explanation: {
      summary: "Observer delivery is closer to microtask timing than timer timing.",
      steps: ["The observer starts watching.", "A DOM change happens.", "The observer callback is queued for delivery.", "It runs before the timer task."],
      mistake: "Assuming DOM observers behave like setTimeout callbacks.",
      realWorld: "This matters in component libraries, rich text editors, analytics trackers, test utilities, and DOM measurement code."
    }
  }
];
