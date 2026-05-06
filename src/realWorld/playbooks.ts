export type PlaybookContext = {
  name: string;
  scenario: string;
  symptom: string;
  fix: string;
};

export type ProductionPlaybook = {
  severity: "Low" | "Medium" | "High";
  impact: string;
  contexts: PlaybookContext[];
  checklist: string[];
  saferPattern: string;
};

const defaultChecklist = [
  "Identify what is synchronous, microtask-based, timer-based, or external IO.",
  "Write the expected console order before running the code.",
  "Check whether the code depends on timing instead of explicit awaiting or cleanup."
];

export const playbooks: Record<string, ProductionPlaybook> = {
  "promise-before-timeout": {
    severity: "Medium",
    impact: "Flaky tests, stale UI assumptions, and cleanup running later than expected.",
    contexts: [
      {
        name: "React",
        scenario: "A promise-based state update beats a timer-based cleanup inside an event handler.",
        symptom: "A spinner, toast, or optimistic state changes before your zero-delay timeout runs.",
        fix: "Do not use setTimeout(..., 0) as an ordering guarantee. Await the work or move cleanup into the promise chain."
      },
      {
        name: "Testing",
        scenario: "A test advances timers but forgets pending promises.",
        symptom: "Assertions pass locally and fail in CI, or need mysterious extra waits.",
        fix: "Flush microtasks before asserting timer effects, or assert through user-visible state."
      },
      {
        name: "Node",
        scenario: "Promise callbacks run before timer callbacks in request orchestration.",
        symptom: "Logging, metrics, or cleanup appears out of source order.",
        fix: "Make ordering explicit with await or a single scheduling mechanism."
      }
    ],
    checklist: defaultChecklist,
    saferPattern: `await doAsyncWork();
cleanup();

// Avoid relying on:
setTimeout(cleanup, 0);`
  },
  "multiple-timers": {
    severity: "Medium",
    impact: "Subtle ordering bugs in retries, animation steps, analytics, and test timers.",
    contexts: [
      {
        name: "UI",
        scenario: "Several timers schedule animation or toast steps.",
        symptom: "Steps fire in surprising order after a busy render or CPU task.",
        fix: "Use one scheduler, explicit delays, or a small state machine instead of scattered timers."
      },
      {
        name: "Testing",
        scenario: "Fake timers run callbacks differently than a real browser under load.",
        symptom: "Timer order looks right in unit tests but differs during real interaction.",
        fix: "Test visible outcomes and keep timer orchestration centralized."
      }
    ],
    checklist: ["List timer registration order.", "Compare delay values.", "Check whether the main thread is blocked before timers can run."],
    saferPattern: `const steps = [
  { delay: 0, run: first },
  { delay: 100, run: second }
];

for (const step of steps) setTimeout(step.run, step.delay);`
  },
  "timeout-inside-promise": {
    severity: "Medium",
    impact: "Fallbacks and cleanup can be queued later than the code visually suggests.",
    contexts: [
      {
        name: "Fetch",
        scenario: "A promise handler schedules a fallback timeout after data processing starts.",
        symptom: "Fallback timers run behind older timers or after UI has already changed.",
        fix: "Schedule fallbacks before the async chain, or cancel them explicitly when work succeeds."
      },
      {
        name: "React",
        scenario: "An effect starts promise work that then schedules delayed UI cleanup.",
        symptom: "Unmount cleanup and promise cleanup race each other.",
        fix: "Use an AbortController or cleanup flag instead of nested timers."
      }
    ],
    checklist: ["Find where the timer is registered, not just where it appears in source.", "Check which microtask creates it.", "Check existing timers already in the queue."],
    saferPattern: `const timeout = setTimeout(onSlow, 1000);
try {
  await work();
} finally {
  clearTimeout(timeout);
}`
  },
  "blocking-loop-event-loop": {
    severity: "High",
    impact: "Frozen UI, delayed input, poor INP, and timers that fire much later than requested.",
    contexts: [
      {
        name: "Frontend Performance",
        scenario: "Large JSON parsing, sorting, or export work runs on the main thread.",
        symptom: "Clicks feel ignored, animations freeze, and timers appear late.",
        fix: "Chunk the work, move it to a Web Worker, or compute on the server."
      },
      {
        name: "Next.js",
        scenario: "Client component does expensive work during render or hydration.",
        symptom: "The page loads but stays unresponsive for a moment.",
        fix: "Memoize, virtualize, stream less data, or move work to server components."
      }
    ],
    checklist: ["Profile the main thread.", "Look for long tasks over 50ms.", "Move repeated heavy work out of render and input handlers."],
    saferPattern: `// Chunk long work so input can breathe.
for (const chunk of chunks) {
  process(chunk);
  await new Promise(requestAnimationFrame);
}`
  },
  "missing-return": {
    severity: "Medium",
    impact: "Undefined data flows through API chains and creates failures far from the cause.",
    contexts: [
      {
        name: "API Mapping",
        scenario: "A then callback transforms data but forgets to return it.",
        symptom: "The next handler receives undefined, even though the transformation line ran.",
        fix: "Use expression arrows or explicit return statements."
      },
      {
        name: "Tests",
        scenario: "Async test setup forgets to return a promise from a then chain.",
        symptom: "Tests finish before setup work is complete.",
        fix: "Return the chain or convert to async/await."
      }
    ],
    checklist: ["Inspect block-bodied arrow functions.", "Check each then returns the value needed by the next step.", "Prefer async/await for multi-step flows."],
    saferPattern: `const user = await fetchUser()
  .then((res) => res.json());

// or
.then((value) => {
  return transform(value);
});`
  },
  "promise-all-fail": {
    severity: "High",
    impact: "One failing request can hide useful partial data or break an entire page.",
    contexts: [
      {
        name: "Dashboard",
        scenario: "Several widgets load in parallel through Promise.all.",
        symptom: "One endpoint failure blanks the whole dashboard.",
        fix: "Use Promise.allSettled or catch per widget when partial rendering is acceptable."
      },
      {
        name: "Uploads",
        scenario: "A batch upload uses Promise.all for every file.",
        symptom: "One failed file makes the batch look fully failed.",
        fix: "Track per-file status and aggregate results after all settle."
      }
    ],
    checklist: ["Decide whether partial success is acceptable.", "Check whether errors need per-item handling.", "Use allSettled for result dashboards."],
    saferPattern: `const results = await Promise.allSettled(requests);
const successes = results.filter((r) => r.status === "fulfilled");
const failures = results.filter((r) => r.status === "rejected");`
  },
  "promise-race-any": {
    severity: "Medium",
    impact: "Fast failures can win when the product needs the first successful response.",
    contexts: [
      {
        name: "Fallback APIs",
        scenario: "Two mirrors race to return product or pricing data.",
        symptom: "A fast failure rejects even though a slower mirror would succeed.",
        fix: "Use Promise.any for first successful response, race for first settled response."
      },
      {
        name: "Timeouts",
        scenario: "A request is raced against a timeout promise.",
        symptom: "Timeout behavior is correct, but fallback-mirror behavior is not.",
        fix: "Use race for timeouts and any for redundant providers."
      }
    ],
    checklist: ["Ask whether failure should count as the winner.", "Use race for settled-first logic.", "Use any for first-success logic."],
    saferPattern: `const firstSuccess = await Promise.any([primary(), backup()]);

const withTimeout = await Promise.race([
  request(),
  timeout(3000)
]);`
  },
  "sequential-await": {
    severity: "High",
    impact: "Slow pages and endpoints because independent IO is serialized.",
    contexts: [
      {
        name: "Next.js Data Loading",
        scenario: "A page awaits user, posts, notifications, and settings one by one.",
        symptom: "TTFB or route transition feels much slower than any single API call.",
        fix: "Start independent promises first, then await Promise.all."
      },
      {
        name: "Backend",
        scenario: "An API handler calls independent services sequentially.",
        symptom: "Latency grows as the sum of every service call.",
        fix: "Fan out independent calls in parallel and handle failures intentionally."
      }
    ],
    checklist: ["Mark which requests depend on previous results.", "Start independent requests before awaiting.", "Measure total latency before and after."],
    saferPattern: `const userPromise = getUser();
const postsPromise = getPosts();
const [user, posts] = await Promise.all([userPromise, postsPromise]);`
  },
  "missing-await": {
    severity: "High",
    impact: "Code continues before auth, saves, redirects, or assertions finish.",
    contexts: [
      {
        name: "Forms",
        scenario: "A submit handler calls save() but does not await it.",
        symptom: "Success UI appears before the save finishes or fails.",
        fix: "Await the save and handle errors before moving UI state forward."
      },
      {
        name: "Auth",
        scenario: "Permission check returns a promise but the route continues.",
        symptom: "Protected UI flashes or redirects happen too late.",
        fix: "Await auth checks at the boundary and treat promises as pending state."
      }
    ],
    checklist: ["Look for async function calls assigned without await.", "Check logs that print Promise objects.", "Make loading and error states explicit."],
    saferPattern: `try {
  const result = await saveForm(data);
  showSuccess(result);
} catch (error) {
  showError(error);
}`
  },
  "async-foreach-issue": {
    severity: "High",
    impact: "Bulk work reports done before individual async operations finish.",
    contexts: [
      {
        name: "Bulk Actions",
        scenario: "A UI bulk-saves selected rows with forEach(async ...).",
        symptom: "The success toast appears before all rows are saved.",
        fix: "Use Promise.all(items.map(...)) for parallel or for...of for sequential."
      },
      {
        name: "Scripts",
        scenario: "A migration script processes records with async forEach.",
        symptom: "The process exits early or logs complete before writes finish.",
        fix: "Await the collection of promises or use a controlled concurrency helper."
      }
    ],
    checklist: ["Search for forEach(async.", "Decide sequential vs parallel behavior.", "Return or await the collection of promises."],
    saferPattern: `await Promise.all(items.map(async (item) => save(item)));

// sequential:
for (const item of items) {
  await save(item);
}`
  },
  "interval-leak": {
    severity: "High",
    impact: "Memory growth, duplicate polling, battery drain, and stale state updates.",
    contexts: [
      {
        name: "React",
        scenario: "An effect starts polling but forgets to clear the interval.",
        symptom: "Navigating away and back doubles requests or logs.",
        fix: "Return cleanup from useEffect and avoid capturing large state unnecessarily."
      },
      {
        name: "Dashboards",
        scenario: "Live widgets keep intervals alive after being removed.",
        symptom: "Network traffic continues for hidden or unmounted widgets.",
        fix: "Centralize polling or stop it when the widget is not visible."
      }
    ],
    checklist: ["Find every setInterval.", "Confirm matching clearInterval.", "Check closure captures and unmount behavior."],
    saferPattern: `useEffect(() => {
  const id = setInterval(refresh, 1000);
  return () => clearInterval(id);
}, []);`
  },
  "microtask-flood": {
    severity: "High",
    impact: "Rendering, input, and timers are delayed even though code uses promises.",
    contexts: [
      {
        name: "State Libraries",
        scenario: "A scheduler recursively queues microtasks to flush updates.",
        symptom: "The app feels stuck before timers, paint, or input callbacks run.",
        fix: "Yield to a task or animation frame after a bounded batch."
      },
      {
        name: "Retry Logic",
        scenario: "A promise retry loop queues too many immediate retries.",
        symptom: "CPU spikes and timeout fallback runs late.",
        fix: "Use backoff with timers and a max retry count."
      }
    ],
    checklist: ["Look for recursive Promise.resolve().then.", "Set a max batch size.", "Yield with setTimeout or requestAnimationFrame when UI responsiveness matters."],
    saferPattern: `for (const batch of batches) {
  flush(batch);
  await new Promise((resolve) => setTimeout(resolve, 0));
}`
  }
};

export function getPlaybook(id: string) {
  return playbooks[id];
}
