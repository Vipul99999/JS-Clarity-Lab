import type { Demo } from "@/engine/types";

export const performanceDemos: Demo[] = [
  {
    id: "blocking-loop-performance",
    number: 27,
    title: "blocking loop",
    category: "performance",
    concept: "CPU-heavy loops monopolize the main thread.",
    code: `console.log("start");
for (let i = 0; i < 1_000_000_000; i++) {}
console.log("end");`,
    prediction: { type: "mcq", question: "What happens to clicks during the loop?", options: ["They wait", "They interrupt the loop", "They run faster"], correct: "They wait" },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "console", value: "start" },
      { type: "line", line: 2, explain: "Main thread is occupied by CPU work." }, { type: "timer_add", name: "user click waits" },
      { type: "line", line: 3 }, { type: "console", value: "end" }, { type: "stack_pop", name: "global" },
      { type: "timer_run", name: "user click waits" }, { type: "stack_pop", name: "user click waits" }
    ],
    explanation: {
      summary: "The browser cannot handle other JavaScript tasks while the stack is busy.",
      steps: ["The loop starts.", "Input work waits in a task queue.", "The loop finishes.", "Queued work can finally run."],
      mistake: "Doing large CPU work directly in a click or render path.",
      realWorld: "Chunk work, use Web Workers, or move heavy calculations off the main thread."
    }
  },
  {
    id: "microtask-flood",
    number: 28,
    title: "microtask flood",
    category: "performance",
    concept: "Too many microtasks can starve timers and rendering.",
    code: `let count = 0;
function loop() {
  if (count++ < 3) Promise.resolve().then(loop);
}
loop();
setTimeout(() => console.log("timer"), 0);`,
    prediction: { type: "mcq", question: "What runs before the timer?", options: ["All queued microtasks", "Nothing", "Only the first line"], correct: "All queued microtasks" },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 5 }, { type: "stack_push", name: "loop" }, { type: "line", line: 3 }, { type: "microtask_add", name: "loop microtask 1" }, { type: "stack_pop", name: "loop" },
      { type: "line", line: 6 }, { type: "timer_add", name: "timer" }, { type: "stack_pop", name: "global" },
      { type: "microtask_run", name: "loop microtask 1" }, { type: "microtask_add", name: "loop microtask 2" }, { type: "stack_pop", name: "loop microtask 1" },
      { type: "microtask_run", name: "loop microtask 2" }, { type: "microtask_add", name: "loop microtask 3" }, { type: "stack_pop", name: "loop microtask 2" },
      { type: "microtask_run", name: "loop microtask 3" }, { type: "stack_pop", name: "loop microtask 3" },
      { type: "timer_run", name: "timer" }, { type: "line", line: 6 }, { type: "console", value: "timer" }, { type: "stack_pop", name: "timer" }
    ],
    explanation: {
      summary: "The event loop drains microtasks completely before timers.",
      steps: ["The first microtask is queued.", "The timer is queued.", "Each microtask queues another.", "The timer waits until the microtask queue is empty."],
      mistake: "Creating unbounded promise recursion.",
      realWorld: "Long microtask chains can delay rendering, timers, and input responsiveness."
    }
  },
  {
    id: "sequential-vs-parallel-api",
    number: 29,
    title: "sequential vs parallel API",
    category: "performance",
    concept: "Independent API calls are faster when started together.",
    code: `const a = await fetchA();
const b = await fetchB();

const [x, y] = await Promise.all([fetchX(), fetchY()]);`,
    prediction: { type: "mcq", question: "Which pattern has lower total wait for independent calls?", options: ["Promise.all", "Sequential await", "They are identical"], correct: "Promise.all" },
    events: [
      { type: "stack_push", name: "sequential example" }, { type: "line", line: 1 }, { type: "timer_add", name: "fetchA 200ms" }, { type: "stack_pop", name: "sequential example" },
      { type: "timer_run", name: "fetchA 200ms" }, { type: "microtask_add", name: "after A" }, { type: "stack_pop", name: "fetchA 200ms" },
      { type: "microtask_run", name: "after A" }, { type: "line", line: 2 }, { type: "timer_add", name: "fetchB 200ms" }, { type: "stack_pop", name: "after A" },
      { type: "timer_run", name: "fetchB 200ms" }, { type: "stack_pop", name: "fetchB 200ms" },
      { type: "stack_push", name: "parallel example" }, { type: "line", line: 4 }, { type: "timer_add", name: "fetchX 200ms" }, { type: "timer_add", name: "fetchY 200ms" }, { type: "stack_pop", name: "parallel example" },
      { type: "timer_run", name: "fetchX 200ms" }, { type: "stack_pop", name: "fetchX 200ms" }, { type: "timer_run", name: "fetchY 200ms" }, { type: "console", value: "parallel done sooner" }, { type: "stack_pop", name: "fetchY 200ms" }
    ],
    explanation: {
      summary: "Sequential awaits add wait times; parallel starts overlap them.",
      steps: ["Sequential starts B only after A finishes.", "Parallel starts X and Y immediately.", "The combined await resumes after both finish."],
      mistake: "Awaiting each independent request before creating the next one.",
      realWorld: "Dashboards, profile pages, and search screens often benefit from parallel loading."
    }
  },
  {
    id: "debounce-concept",
    number: 30,
    title: "debounce concept",
    category: "performance",
    concept: "Debounce resets a timer so only the final burst action runs.",
    code: `function onType(value) {
  clearTimeout(timer);
  timer = setTimeout(() => search(value), 300);
}
onType("j");
onType("js");`,
    prediction: { type: "mcq", question: "Which search should run?", options: ["Only js", "j then js", "Neither"], correct: "Only js" },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 5 }, { type: "stack_push", name: "onType j" }, { type: "line", line: 2 }, { type: "line", line: 3 }, { type: "timer_add", name: "search j" }, { type: "stack_pop", name: "onType j" },
      { type: "line", line: 6 }, { type: "stack_push", name: "onType js" }, { type: "line", line: 2, explain: "The old timer is canceled before it runs." }, { type: "timer_run", name: "search j" }, { type: "stack_pop", name: "search j" },
      { type: "line", line: 3 }, { type: "timer_add", name: "search js" }, { type: "stack_pop", name: "onType js" }, { type: "stack_pop", name: "global" },
      { type: "timer_run", name: "search js" }, { type: "line", line: 3 }, { type: "console", value: "search('js')" }, { type: "stack_pop", name: "search js" }
    ],
    explanation: {
      summary: "Debounce delays work and cancels the previous pending run.",
      steps: ["Typing j schedules a search.", "Typing js clears the previous timer.", "A new timer is scheduled.", "Only the latest timer runs."],
      mistake: "Firing network search on every keystroke.",
      realWorld: "Autocomplete, resize handlers, and validation often use debounce."
    }
  }
];
