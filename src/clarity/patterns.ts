export type ClarityMatch = {
  id: string;
  title: string;
  answer: string;
  why: string;
  hiddenBug: string;
  realWorld: string;
  demoId: string;
  confidence: "High" | "Medium";
};

type Pattern = {
  id: string;
  title: string;
  demoId: string;
  confidence: "High" | "Medium";
  detect: (code: string) => boolean;
  answer: string;
  why: string;
  hiddenBug: string;
  realWorld: string;
};

function has(code: string, pattern: RegExp) {
  return pattern.test(code);
}

const patterns: Pattern[] = [
  {
    id: "promise-before-timeout",
    title: "Promise callback beats setTimeout",
    demoId: "promise-before-timeout",
    confidence: "High",
    detect: (code) => has(code, /setTimeout\s*\(/) && has(code, /Promise\.(resolve|reject)|\.then\s*\(/),
    answer: "Synchronous logs run first, promise `.then` runs next, and the timer runs after microtasks clear.",
    why: "Promise handlers enter the microtask queue. Timers enter the task queue. After the current stack finishes, JavaScript drains microtasks before timers.",
    hiddenBug: "A timer used as a fallback may run later than promise-based state updates you expected to wait.",
    realWorld: "Fetch handlers, UI state updates, toast cleanup, and timer-based fallbacks."
  },
  {
    id: "missing-await",
    title: "Async function result is still a Promise",
    demoId: "missing-await",
    confidence: "High",
    detect: (code) => has(code, /async\s+function|async\s*\(/) && has(code, /console\.log\s*\(\s*[a-zA-Z_$][\w$]*\s*\)/) && !has(code, /await\s+[a-zA-Z_$][\w$]*\s*\(/),
    answer: "The caller receives a Promise object unless the async function call is awaited.",
    why: "`async` always wraps the return value in a promise. Calling it starts the function but does not unwrap the result.",
    hiddenBug: "Assertions, redirects, loading flags, or saves can run before the async work is actually finished.",
    realWorld: "React handlers, Next.js server actions, tests, form submits, and data loaders."
  },
  {
    id: "async-foreach",
    title: "forEach does not wait for async callbacks",
    demoId: "async-foreach-issue",
    confidence: "High",
    detect: (code) => has(code, /\.forEach\s*\(\s*async/),
    answer: "`forEach` starts the callbacks and immediately continues. Code after it can run before awaited work inside the callbacks.",
    why: "`forEach` ignores the promises returned by async callbacks.",
    hiddenBug: "You may mark work as complete before every item has saved, uploaded, or validated.",
    realWorld: "Bulk updates, email sending, migration scripts, checkout item processing, and tests."
  },
  {
    id: "missing-return-then",
    title: "Missing return in a promise chain",
    demoId: "missing-return",
    confidence: "Medium",
    detect: (code) => has(code, /\.then\s*\([^=]*=>\s*\{/) && !has(code, /return\s+/),
    answer: "The next `.then` probably receives `undefined`.",
    why: "A block-bodied arrow function does not implicitly return its final expression.",
    hiddenBug: "A transformed value silently disappears and the next step works with `undefined`.",
    realWorld: "API response mapping, auth setup, test fixtures, and chained validation."
  },
  {
    id: "promise-all-fail",
    title: "Promise.all short-circuits on rejection",
    demoId: "promise-all-fail",
    confidence: "High",
    detect: (code) => has(code, /Promise\.all\s*\(/) && has(code, /reject|throw|catch/),
    answer: "`Promise.all` rejects when the first input rejects; its success handler will not receive partial results.",
    why: "The combined promise follows the first rejection, even if other promises later fulfill.",
    hiddenBug: "One failed request can hide successful results unless you use `Promise.allSettled` or local catches.",
    realWorld: "Dashboards, parallel fetches, upload batches, and fan-out service calls."
  },
  {
    id: "sequential-await",
    title: "Independent awaits are running sequentially",
    demoId: "sequential-await",
    confidence: "Medium",
    detect: (code) => has(code, /await\s+\w+\([^)]*\)[\s\S]*await\s+\w+\([^)]*\)/) && !has(code, /Promise\.all/),
    answer: "The second async operation likely starts only after the first one finishes.",
    why: "`await` pauses the async function before the next line starts.",
    hiddenBug: "A page or endpoint can feel slow because independent network waits are added together.",
    realWorld: "Profile pages, dashboards, search filters, and server-rendered data loading."
  },
  {
    id: "interval-leak",
    title: "Interval can retain memory",
    demoId: "interval-leak",
    confidence: "High",
    detect: (code) => has(code, /setInterval\s*\(/) && !has(code, /clearInterval\s*\(/),
    answer: "The interval keeps running and can retain anything its callback captures.",
    why: "An active interval is reachable from the browser timer system, so its closure remains reachable too.",
    hiddenBug: "Unmounted screens may keep polling, logging, or holding large state forever.",
    realWorld: "React effects, analytics pings, polling, timers in modals, and live dashboards."
  },
  {
    id: "event-listener-leak",
    title: "Event listener may retain state",
    demoId: "event-listener-leak",
    confidence: "Medium",
    detect: (code) => has(code, /addEventListener\s*\(/) && !has(code, /removeEventListener\s*\(/),
    answer: "The listener can keep captured variables alive until it is removed.",
    why: "A long-lived DOM target references the listener, and the listener references its outer variables.",
    hiddenBug: "Old component state can survive after the component is gone.",
    realWorld: "Window resize handlers, document clicks, keyboard shortcuts, and shared DOM nodes."
  },
  {
    id: "blocking-loop",
    title: "Synchronous loop blocks everything",
    demoId: "blocking-loop-performance",
    confidence: "Medium",
    detect: (code) => has(code, /for\s*\([^)]*;\s*[^;]*(100000|1_000_000|length)[^;]*;/) || has(code, /while\s*\(\s*true\s*\)/),
    answer: "The main thread stays busy until the loop finishes. Timers, clicks, rendering, and promise continuations wait.",
    why: "JavaScript cannot take another task while the current call stack is occupied.",
    hiddenBug: "The UI may freeze even though async callbacks are queued.",
    realWorld: "Large sorting, JSON processing, export generation, and expensive render-time calculations."
  },
  {
    id: "microtask-flood",
    title: "Microtask flood can starve timers",
    demoId: "microtask-flood",
    confidence: "Medium",
    detect: (code) => has(code, /Promise\.resolve\(\)\.then\s*\(\s*\w+\s*\)/) && has(code, /function\s+(\w+)[\s\S]*\1/),
    answer: "Repeated promise microtasks can delay timers and rendering until the microtask queue stops refilling.",
    why: "The event loop drains all microtasks before moving to the next timer task.",
    hiddenBug: "A recursive promise loop can make the page feel stuck without a visible infinite loop.",
    realWorld: "Schedulers, reactive libraries, retry loops, and custom batching code."
  },
  {
    id: "debounce",
    title: "Debounce cancels earlier work",
    demoId: "debounce-concept",
    confidence: "High",
    detect: (code) => has(code, /clearTimeout\s*\(/) && has(code, /setTimeout\s*\(/),
    answer: "Only the latest scheduled callback should run after the quiet period.",
    why: "Each new call clears the previous timer before creating a replacement.",
    hiddenBug: "Without debounce, every keystroke or resize can trigger expensive work.",
    realWorld: "Autocomplete, search boxes, resize handlers, validation, and autosave."
  }
];

export const scannerExamples = [
  {
    label: "Promise vs timeout",
    code: `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");`
  },
  {
    label: "Async forEach",
    code: `items.forEach(async (item) => {
  await save(item);
});
console.log("done");`
  },
  {
    label: "Leaky interval",
    code: `function mount() {
  const data = new Array(100000).fill("x");
  setInterval(() => console.log(data.length), 1000);
}`
  }
];

export function analyzeSnippet(code: string): ClarityMatch[] {
  const normalized = code.trim();
  if (!normalized) return [];
  return patterns
    .filter((pattern) => pattern.detect(normalized))
    .map(({ detect: _detect, ...match }) => match)
    .slice(0, 4);
}
