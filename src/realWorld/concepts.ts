export type ConceptBreakdown = {
  id: string;
  title: string;
  short: string;
  mentalModel: string;
  commonMistake: string;
  realWorldSignals: string[];
  debugQuestions: string[];
  primaryCases: Array<{
    label: string;
    href: string;
  }>;
};

export const conceptBreakdowns: ConceptBreakdown[] = [
  {
    id: "queue-order",
    title: "Why output order changes",
    short: "Synchronous code runs first, microtasks drain before timers, and Node adds extra queues like nextTick and check.",
    mentalModel: "Do not read async code only from top to bottom. First ask where each callback is placed: current stack, microtask queue, timer queue, Node nextTick, I/O, or check.",
    commonMistake: "Assuming setTimeout(..., 0) means run immediately, or assuming promises and timers share the same queue.",
    realWorldSignals: ["Console output differs from source order.", "Tests need mysterious waits.", "Cleanup runs later than expected.", "setImmediate and setTimeout order feels inconsistent."],
    debugQuestions: ["What runs on the current stack?", "Which callbacks enter microtasks?", "Which callbacks enter timers or Node-specific queues?", "Is this browser behavior or Node behavior?"],
    primaryCases: [
      { label: "Promise before timeout", href: "/demo/promise-before-timeout" },
      { label: "Node queue priority", href: "/node-playground?scenario=node-queue-priority&mode=problem" },
      { label: "setImmediate inside I/O", href: "/node-playground?scenario=setimmediate-inside-io&mode=problem" }
    ]
  },
  {
    id: "await-control-flow",
    title: "Why await did not wait",
    short: "await pauses only the current async function. Missing await, async forEach, and unreturned promises let code continue too early.",
    mentalModel: "Every async operation must be either awaited, returned, or intentionally allowed to run in the background with error handling.",
    commonMistake: "Calling an async function like a normal function and assuming later code waits for it.",
    realWorldSignals: ["Success UI appears before save finishes.", "Bulk work logs complete too early.", "A test finishes before setup completes.", "The next .then receives undefined."],
    debugQuestions: ["Is the promise awaited or returned?", "Is async work inside forEach?", "Does every .then return the value needed later?", "Where are errors caught?"],
    primaryCases: [
      { label: "Missing await", href: "/demo/missing-await" },
      { label: "Async forEach problem", href: "/demo/async-foreach-issue" },
      { label: "Promise chain return", href: "/demo/missing-return" }
    ]
  },
  {
    id: "parallel-io",
    title: "Why APIs become slower than expected",
    short: "Independent I/O should usually start together. Sequential await turns total latency into the sum of every call.",
    mentalModel: "Separate dependency from timing. If two requests do not depend on each other, start both before awaiting results.",
    commonMistake: "Writing clean-looking sequential await code that quietly serializes independent database/API calls.",
    realWorldSignals: ["Endpoint latency is close to call A + call B + call C.", "Dashboard loads after the slowest plus every previous request.", "Serverless function duration is higher than any single dependency."],
    debugQuestions: ["Which requests truly depend on previous results?", "Can independent promises start before the first await?", "Should failure be all-or-nothing or partial?", "Do timeouts cancel the slow work?"],
    primaryCases: [
      { label: "Sequential await", href: "/demo/sequential-await" },
      { label: "HTTP request with database call", href: "/node-playground?scenario=http-db-lifecycle&mode=problem" },
      { label: "Promise.race timeout", href: "/node-playground?scenario=promise-race-timeout&mode=problem" }
    ]
  },
  {
    id: "event-loop-blocking",
    title: "Why the app freezes",
    short: "Synchronous CPU work blocks the main thread or Node event loop, delaying input, paint, timers, and callbacks.",
    mentalModel: "Async I/O can wait elsewhere, but CPU-heavy JavaScript runs on the current thread unless you chunk it or move it to a worker.",
    commonMistake: "Wrapping CPU-heavy work in async/await and expecting it to stop blocking.",
    realWorldSignals: ["Clicks feel ignored.", "Timers fire late.", "Animations freeze.", "One request delays unrelated Node callbacks."],
    debugQuestions: ["Is there a long task over 50ms?", "Is JSON parsing, sorting, or transforming huge data?", "Can work be chunked?", "Should a worker thread handle it?"],
    primaryCases: [
      { label: "Blocking loop", href: "/demo/blocking-loop" },
      { label: "Large JSON parse blocks requests", href: "/node-playground?scenario=blocking-json-parse&mode=problem" },
      { label: "Worker thread for CPU work", href: "/node-playground?scenario=worker-thread-cpu&mode=problem" }
    ]
  },
  {
    id: "retained-memory",
    title: "Why memory keeps growing",
    short: "Garbage collection frees unreachable objects. Timers, listeners, caches, closures, and streams can keep objects reachable.",
    mentalModel: "Memory leaks are usually reference leaks. Ask who still points to the object after the feature should be finished.",
    commonMistake: "Assuming garbage collection frees objects that are still stored in a cache, listener, closure, or active timer.",
    realWorldSignals: ["Heap grows after repeated navigation.", "Listener count increases.", "Polling continues after a component disappears.", "Large files spike memory."],
    debugQuestions: ["What reference keeps this object alive?", "Is there matching cleanup?", "Is the cache bounded?", "Does stream failure close resources?"],
    primaryCases: [
      { label: "Uncleared interval leak", href: "/demo/interval-leak" },
      { label: "Memory leak: cache, listener, timer", href: "/node-playground?scenario=memory-leak-cache-listener-timer&mode=problem" },
      { label: "Full read vs stream memory", href: "/node-playground?scenario=full-read-vs-stream-memory&mode=problem" }
    ]
  },
  {
    id: "node-capacity",
    title: "Why Node gets slow under async load",
    short: "Node has one main JS thread plus limited backend capacity. fs, crypto, zlib, and DNS-like work can queue behind each other.",
    mentalModel: "Async does not mean infinite. Some async APIs share worker capacity, and CPU-heavy JS needs workers or separate processes.",
    commonMistake: "Starting a huge Promise.all batch and expecting every async task to run with unlimited capacity.",
    realWorldSignals: ["Crypto slows file work.", "DNS or outbound requests look delayed.", "Compression bursts hurt unrelated endpoints.", "p95 latency spikes under batch jobs."],
    debugQuestions: ["Which APIs use worker-pool capacity?", "Is Promise.all starting too much at once?", "Can concurrency be limited?", "Should heavy work move out of request paths?"],
    primaryCases: [
      { label: "Thread pool saturation", href: "/node-playground?scenario=threadpool-saturation&mode=problem" },
      { label: "DNS lookup and worker pressure", href: "/node-playground?scenario=dns-threadpool-delay&mode=problem" },
      { label: "zlib compression uses workers", href: "/node-playground?scenario=zlib-compression-pool&mode=problem" }
    ]
  },
  {
    id: "streams-backpressure",
    title: "Why streams hang or use too much memory",
    short: "Streams are chunked data flow. Backpressure and error cleanup keep the fast side from overwhelming the slow side.",
    mentalModel: "A readable side can produce faster than a writable side can consume. Good stream code pauses, resumes, and cleans up on failure.",
    commonMistake: "Manually wiring data events, ignoring write() returning false, or using pipe chains without centralized error handling.",
    realWorldSignals: ["Uploads hang.", "Large downloads use too much memory.", "A failed transform leaves a socket open.", "write buffers keep growing."],
    debugQuestions: ["Is backpressure respected?", "Does every stream have error handling?", "Would pipeline simplify cleanup?", "Is the whole file being read into memory?"],
    primaryCases: [
      { label: "Stream backpressure", href: "/node-playground?scenario=stream-backpressure-pipe&mode=problem" },
      { label: "Stream error handling", href: "/node-playground?scenario=stream-error-handling&mode=problem" },
      { label: "Full read vs stream memory", href: "/node-playground?scenario=full-read-vs-stream-memory&mode=problem" }
    ]
  },
  {
    id: "failure-semantics",
    title: "Why one failure breaks everything",
    short: "Promise combinators encode failure behavior. all fails fast, allSettled keeps outcomes, any waits for first success, and race settles first.",
    mentalModel: "Pick the combinator based on product behavior, not habit. Decide whether partial success is useful before choosing Promise.all.",
    commonMistake: "Using Promise.all for dashboards, imports, or optional data where one failure should not hide every success.",
    realWorldSignals: ["One widget blanks a whole dashboard.", "Batch uploads look fully failed.", "A fast failed mirror beats a slower success.", "Timeouts do not cancel slow work."],
    debugQuestions: ["Should one failure stop everything?", "Do you need every result status?", "Should first failure count as winner?", "Does timeout cancel the slow operation?"],
    primaryCases: [
      { label: "Promise.all vs allSettled", href: "/node-playground?scenario=promise-allsettled-errors&mode=problem" },
      { label: "Promise.any fallback", href: "/node-playground?scenario=promise-any-fallback&mode=problem" },
      { label: "Promise.race timeout", href: "/node-playground?scenario=promise-race-timeout&mode=problem" }
    ]
  }
];

export const incidentConceptMap: Record<string, string[]> = {
  "flaky-async-test": ["queue-order", "await-control-flow"],
  "api-slow-sequential-await": ["parallel-io", "failure-semantics"],
  "memory-keeps-growing": ["retained-memory", "streams-backpressure"],
  "ui-freezes": ["event-loop-blocking"],
  "node-worker-pool-slow": ["node-capacity", "event-loop-blocking"],
  "stream-upload-hangs": ["streams-backpressure", "retained-memory"],
  "success-before-save": ["await-control-flow"],
  "dashboard-partial-failure": ["failure-semantics", "parallel-io"]
};

export function getConceptsForIncident(incidentId: string) {
  const ids = incidentConceptMap[incidentId] ?? [];
  return ids
    .map((id) => conceptBreakdowns.find((concept) => concept.id === id))
    .filter((concept): concept is ConceptBreakdown => Boolean(concept));
}
