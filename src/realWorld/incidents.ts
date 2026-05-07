export type Incident = {
  id: string;
  symptom: string;
  audience: "Frontend" | "Backend" | "Node" | "Testing" | "Full-stack";
  severity: "Low" | "Medium" | "High";
  likelyCause: string;
  whyItMatters: string;
  diagnose: string[];
  fix: string[];
  verify: string[];
  primaryCase: {
    label: string;
    href: string;
  };
  related: Array<{
    label: string;
    href: string;
  }>;
  keywords: string[];
};

export const incidents: Incident[] = [
  {
    id: "flaky-async-test",
    symptom: "My async test is flaky",
    audience: "Testing",
    severity: "High",
    likelyCause: "Timers, promises, and assertions are not being flushed in the same order as the real runtime.",
    whyItMatters: "Flaky tests waste team time and hide real regressions because nobody trusts the suite.",
    diagnose: ["Check whether the test advances timers but forgets promise continuations.", "Look for setTimeout(..., 0), Promise.then, await, and fake timers in the same test.", "Write the expected output order before changing the test."],
    fix: ["Flush microtasks before asserting timer effects.", "Prefer awaiting user-visible outcomes instead of implementation timers.", "Keep retry/debounce timing behind one helper."],
    verify: ["Run the test repeatedly.", "Run the same test with real timers if possible.", "Remove arbitrary waits after the order is explicit."],
    primaryCase: { label: "Testing async timers", href: "/node-playground?scenario=testing-async-timers&mode=problem" },
    related: [
      { label: "Promise before timeout", href: "/demo/promise-before-timeout" },
      { label: "Microtask flood", href: "/demo/microtask-flood" }
    ],
    keywords: ["test", "flaky", "timer", "promise", "jest", "vitest", "microtask"]
  },
  {
    id: "api-slow-sequential-await",
    symptom: "My API is slower than the individual requests",
    audience: "Backend",
    severity: "High",
    likelyCause: "Independent I/O is being awaited sequentially, so latency becomes the sum of each request.",
    whyItMatters: "Users feel slow pages, serverless functions run longer, and downstream services get blamed incorrectly.",
    diagnose: ["List which calls depend on previous results.", "Measure each call duration and total handler duration.", "Look for multiple awaits that could start together."],
    fix: ["Start independent promises before awaiting.", "Use Promise.all for all-or-nothing work.", "Use allSettled when partial results are acceptable."],
    verify: ["Compare total latency before and after.", "Add timeout and error behavior intentionally.", "Check logs show fan-out starts before waiting."],
    primaryCase: { label: "Sequential vs parallel await", href: "/demo/sequential-await" },
    related: [
      { label: "HTTP request with database call", href: "/node-playground?scenario=http-db-lifecycle&mode=problem" },
      { label: "Promise.all vs allSettled", href: "/node-playground?scenario=promise-allsettled-errors&mode=problem" }
    ],
    keywords: ["api", "slow", "await", "parallel", "promise.all", "latency", "database"]
  },
  {
    id: "memory-keeps-growing",
    symptom: "Memory keeps growing over time",
    audience: "Full-stack",
    severity: "High",
    likelyCause: "Long-lived timers, listeners, caches, closures, or streams keep references reachable.",
    whyItMatters: "Production processes slow down, restart unexpectedly, or crash under normal traffic.",
    diagnose: ["Check active intervals and event listeners.", "Look for global arrays, maps, and unbounded caches.", "Compare heap before and after cleanup should have happened."],
    fix: ["Clear intervals and remove listeners.", "Bound caches with size or TTL.", "Use stream pipeline and close resources on error."],
    verify: ["Repeat the workflow several times and watch heap flatten.", "Confirm listener count does not increase.", "Confirm GC can collect released objects."],
    primaryCase: { label: "Memory leak: cache, listener, timer", href: "/node-playground?scenario=memory-leak-cache-listener-timer&mode=problem" },
    related: [
      { label: "Uncleared interval leak", href: "/demo/interval-leak" },
      { label: "Full read vs stream memory", href: "/node-playground?scenario=full-read-vs-stream-memory&mode=problem" }
    ],
    keywords: ["memory", "leak", "heap", "listener", "interval", "cache", "stream", "gc"]
  },
  {
    id: "ui-freezes",
    symptom: "The UI freezes or input feels ignored",
    audience: "Frontend",
    severity: "High",
    likelyCause: "Long synchronous JavaScript blocks the main thread, delaying timers, paint, and input.",
    whyItMatters: "Users experience broken interactions even if the data eventually loads.",
    diagnose: ["Profile for long tasks over 50ms.", "Look for JSON parsing, sorting, exports, and loops in render or input handlers.", "Check whether timers fire late after CPU work."],
    fix: ["Chunk heavy work.", "Move CPU-heavy work to a worker.", "Virtualize large lists and avoid expensive render loops."],
    verify: ["Compare main-thread long tasks before and after.", "Click during the operation and confirm input responds.", "Check timers and animations are no longer delayed."],
    primaryCase: { label: "Blocking loop delays timer", href: "/demo/blocking-loop" },
    related: [
      { label: "Large JSON parse blocks requests", href: "/node-playground?scenario=blocking-json-parse&mode=problem" },
      { label: "Worker thread for CPU work", href: "/node-playground?scenario=worker-thread-cpu&mode=problem" }
    ],
    keywords: ["freeze", "blocked", "long task", "json", "loop", "input", "performance"]
  },
  {
    id: "node-worker-pool-slow",
    symptom: "Node gets slow during crypto, fs, zlib, or DNS work",
    audience: "Node",
    severity: "High",
    likelyCause: "The libuv worker pool is saturated, so unrelated async callbacks wait behind queued work.",
    whyItMatters: "The app looks async but still has production latency spikes under bursts.",
    diagnose: ["Check bursts of crypto, compression, DNS lookup, or file operations.", "Look for Promise.all over large batches.", "Compare queued worker tasks with response delay."],
    fix: ["Limit concurrency.", "Move CPU-heavy JavaScript to worker threads.", "Separate heavy jobs from latency-sensitive request paths."],
    verify: ["Measure p95 latency under load.", "Confirm worker queue length stays bounded.", "Confirm unrelated file/DNS work completes sooner."],
    primaryCase: { label: "Thread pool saturation", href: "/node-playground?scenario=threadpool-saturation&mode=problem" },
    related: [
      { label: "DNS lookup and worker pressure", href: "/node-playground?scenario=dns-threadpool-delay&mode=problem" },
      { label: "zlib compression uses workers", href: "/node-playground?scenario=zlib-compression-pool&mode=problem" }
    ],
    keywords: ["node", "thread", "worker", "pool", "crypto", "zlib", "dns", "fs", "slow"]
  },
  {
    id: "stream-upload-hangs",
    symptom: "Upload, download, or stream processing hangs",
    audience: "Node",
    severity: "High",
    likelyCause: "The stream chain ignores backpressure, misses errors, or leaves resources open.",
    whyItMatters: "Large files can consume memory, leave sockets open, or fail without a clean response.",
    diagnose: ["Check whether write() returning false is ignored.", "Look for manual pipe chains without centralized error handling.", "Check whether streams close after failures."],
    fix: ["Use pipeline for error propagation and cleanup.", "Respect backpressure or use pipe.", "Process large files in chunks instead of full reads."],
    verify: ["Run with a slow writable destination.", "Force a stream error and confirm cleanup.", "Watch memory stay flat on large files."],
    primaryCase: { label: "Stream pipe with backpressure", href: "/node-playground?scenario=stream-backpressure-pipe&mode=problem" },
    related: [
      { label: "Stream error handling", href: "/node-playground?scenario=stream-error-handling&mode=problem" },
      { label: "Full read vs stream memory", href: "/node-playground?scenario=full-read-vs-stream-memory&mode=problem" }
    ],
    keywords: ["stream", "upload", "download", "backpressure", "pipe", "pipeline", "hang", "memory"]
  },
  {
    id: "success-before-save",
    symptom: "Success UI appears before save/auth actually finishes",
    audience: "Frontend",
    severity: "High",
    likelyCause: "An async function is called without await, so later code continues immediately.",
    whyItMatters: "Users can see false success, navigate away before a save completes, or miss real errors.",
    diagnose: ["Search for async calls in submit handlers.", "Check whether console output shows a Promise object.", "Look for success state set before the awaited result."],
    fix: ["Await the save/auth call.", "Handle errors before showing success.", "Disable duplicate submits while pending."],
    verify: ["Force the request to fail and confirm success does not show.", "Throttle network and confirm loading state stays visible.", "Confirm navigation waits for the result."],
    primaryCase: { label: "Missing await", href: "/demo/missing-await" },
    related: [
      { label: "await behavior", href: "/demo/await-behavior" },
      { label: "Centralized async errors", href: "/node-playground?scenario=centralized-error-handling&mode=problem" }
    ],
    keywords: ["save", "auth", "success", "await", "form", "submit", "promise"]
  },
  {
    id: "dashboard-partial-failure",
    symptom: "One failed request breaks the whole dashboard",
    audience: "Full-stack",
    severity: "Medium",
    likelyCause: "Promise.all fails fast even when partial data would be useful.",
    whyItMatters: "Users lose working data because one optional widget or service failed.",
    diagnose: ["List which requests are required vs optional.", "Check whether Promise.all wraps independent widgets.", "Decide what partial success should show."],
    fix: ["Use Promise.allSettled for optional widgets.", "Catch per widget when rendering partial UI.", "Show error state only for the failed section."],
    verify: ["Force one endpoint to fail.", "Confirm successful widgets still render.", "Confirm failed widgets show useful recovery."],
    primaryCase: { label: "Promise.all vs allSettled", href: "/node-playground?scenario=promise-allsettled-errors&mode=problem" },
    related: [
      { label: "Promise.all fail", href: "/demo/promise-all-fail" },
      { label: "Promise.any fallback", href: "/node-playground?scenario=promise-any-fallback&mode=problem" }
    ],
    keywords: ["dashboard", "promise.all", "allsettled", "partial", "failure", "widget"]
  }
];

export function findIncidents(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return incidents;
  return incidents.filter((incident) => {
    const text = [
      incident.symptom,
      incident.audience,
      incident.likelyCause,
      incident.whyItMatters,
      ...incident.keywords
    ].join(" ").toLowerCase();
    return text.includes(q);
  });
}
