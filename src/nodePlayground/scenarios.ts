import type { NodeScenario } from "./types";

export const nodeScenarios: NodeScenario[] = [
  {
    id: "node-queue-priority",
    title: "Node queue priority",
    category: "Async & Event Loop",
    level: "intermediate",
    concept: "Node drains process.nextTick before Promise microtasks, then moves through timer, I/O, check, and close phases.",
    realWorld: "Debug flaky tests, CLI startup order, stream internals, and server callbacks that appear to run out of order.",
    panels: ["callStack", "microtasks", "timers", "io", "check", "close", "debugger"],
    problemCode: `console.log("sync");

setTimeout(() => console.log("timer"), 0);
setImmediate(() => console.log("immediate"));
process.nextTick(() => console.log("nextTick"));
Promise.resolve().then(() => console.log("promise"));

console.log("end");`,
    events: [
      { type: "stack_push", name: "global" },
      { type: "line", line: 1 }, { type: "console", value: "sync" },
      { type: "line", line: 3 }, { type: "timer_add", name: "setTimeout", delay: 0 }, { type: "timer_active", name: "setTimeout" },
      { type: "line", line: 4 }, { type: "check_add", name: "setImmediate" },
      { type: "line", line: 5 }, { type: "nexttick_add", name: "process.nextTick" },
      { type: "line", line: 6 }, { type: "microtask_add", name: "Promise.then" }, { type: "promise_pending", name: "Promise.then" },
      { type: "line", line: 8 }, { type: "console", value: "end" }, { type: "stack_pop", name: "global" },
      { type: "nexttick_run", name: "process.nextTick" }, { type: "line", line: 5, detail: "nextTick callback runs before Promise microtasks" }, { type: "console", value: "nextTick" }, { type: "stack_pop", name: "process.nextTick" },
      { type: "microtask_run", name: "Promise.then" }, { type: "promise_settled", name: "Promise.then", result: "fulfilled" }, { type: "line", line: 6, detail: "Promise microtask runs after nextTick" }, { type: "console", value: "promise" }, { type: "stack_pop", name: "Promise.then" },
      { type: "timer_run", name: "setTimeout" }, { type: "timer_clear", name: "setTimeout" }, { type: "line", line: 3, detail: "timer callback runs in the timers phase" }, { type: "console", value: "timer" }, { type: "stack_pop", name: "setTimeout" },
      { type: "check_run", name: "setImmediate" }, { type: "line", line: 4, detail: "setImmediate callback runs in the check phase" }, { type: "console", value: "immediate" }, { type: "stack_pop", name: "setImmediate" }
    ],
    prediction: { type: "order", question: "Predict the output order.", options: ["sync", "timer", "immediate", "nextTick", "promise", "end"], correct: ["sync", "end", "nextTick", "promise", "timer", "immediate"] },
    explanation: {
      summary: "Node has more queues than the browser, and nextTick has special priority.",
      steps: ["Sync code runs first.", "Timers/check/microtasks are scheduled.", "nextTick drains before Promise microtasks.", "Timer and check callbacks run after the current turn."],
      mistake: "Using browser event-loop mental models for Node production bugs.",
      realWorld: "This matters in Node libraries, stream callbacks, tests, and API handlers."
    },
    variation: "Move setImmediate inside an fs.readFile callback and compare why it often wins before a newly created timer.",
    limitations: ["The exact timer vs immediate order can vary outside an I/O callback; this simulator shows the common learning model."]
  },
  {
    id: "fs-readfile-threadpool",
    title: "fs.readFile and the thread pool",
    category: "Files & Networking",
    level: "intermediate",
    concept: "Async file work leaves the JS call stack, uses libuv, then returns a callback through the I/O queue.",
    realWorld: "Understand why servers can accept more requests while file reads are pending.",
    panels: ["callStack", "io", "threadPool", "microtasks", "debugger"],
    problemCode: `const fs = require("node:fs");

fs.readFile("report.csv", "utf8", (err, text) => {
  console.log(text.length);
});

console.log("request continues");`,
    events: [
      { type: "stack_push", name: "request handler" },
      { type: "line", line: 3 }, { type: "threadpool_add", name: "read report.csv", work: "fs", duration: 80 }, { type: "threadpool_start", name: "read report.csv" },
      { type: "line", line: 7 }, { type: "console", value: "request continues" }, { type: "stack_pop", name: "request handler" },
      { type: "wait", duration: 80, reason: "libuv reads file" }, { type: "threadpool_done", name: "read report.csv" }, { type: "io_add", name: "readFile callback", detail: "file data ready" },
      { type: "io_run", name: "readFile callback" }, { type: "variable_set", name: "text.length", value: "18420" }, { type: "line", line: 4 }, { type: "console", value: "18420" }, { type: "stack_pop", name: "readFile callback" }
    ],
    prediction: { type: "order", question: "Which log appears first?", options: ["18420", "request continues"], correct: ["request continues", "18420"] },
    explanation: {
      summary: "The file read is asynchronous, but the callback still returns to the single JS thread.",
      steps: ["readFile schedules file work.", "The handler continues.", "The thread-pool job completes.", "The I/O callback runs on the main thread."],
      mistake: "Thinking async I/O means the callback runs on a worker thread.",
      realWorld: "This is central to API servers, upload processing, file imports, and CLI tools."
    },
    variation: "Switch to readFileSync and watch the call stack block until the file is read."
  },
  {
    id: "threadpool-saturation",
    title: "Thread pool saturation",
    category: "Memory & Performance",
    level: "advanced",
    concept: "fs, crypto, zlib, and some DNS work share a limited libuv worker pool.",
    realWorld: "Find why password hashing or compression makes unrelated file operations slow.",
    panels: ["threadPool", "io", "performance", "debugger"],
    problemCode: `for (let i = 1; i <= 6; i++) {
  crypto.pbkdf2(password, salt, 100000, 64, "sha512", () => {
    console.log("hash", i);
  });
}`,
    fixedCode: `// Keep concurrency below the worker-pool limit.
await runWithLimit(users, 2, hashPassword);`,
    events: [
      { type: "stack_push", name: "hash batch" },
      { type: "line", line: 1 },
      { type: "threadpool_add", name: "hash 1", work: "crypto", duration: 160 }, { type: "threadpool_start", name: "hash 1" },
      { type: "threadpool_add", name: "hash 2", work: "crypto", duration: 160 }, { type: "threadpool_start", name: "hash 2" },
      { type: "threadpool_add", name: "hash 3", work: "crypto", duration: 160 }, { type: "threadpool_start", name: "hash 3" },
      { type: "threadpool_add", name: "hash 4", work: "crypto", duration: 160 }, { type: "threadpool_start", name: "hash 4" },
      { type: "threadpool_add", name: "hash 5", work: "crypto", duration: 160 }, { type: "threadpool_add", name: "hash 6", work: "crypto", duration: 160 },
      { type: "stack_pop", name: "hash batch" }, { type: "wait", duration: 160, reason: "first four workers are occupied" },
      { type: "threadpool_done", name: "hash 1" }, { type: "io_add", name: "hash 1 callback" }, { type: "threadpool_start", name: "hash 5" },
      { type: "threadpool_done", name: "hash 2" }, { type: "io_add", name: "hash 2 callback" }, { type: "threadpool_start", name: "hash 6" },
      { type: "performance_block", duration: 35, reason: "callbacks and queued work add response latency" }
    ],
    fixedEvents: [
      { type: "stack_push", name: "limited batch" },
      { type: "threadpool_add", name: "hash 1", work: "crypto", duration: 160 }, { type: "threadpool_start", name: "hash 1" },
      { type: "threadpool_add", name: "hash 2", work: "crypto", duration: 160 }, { type: "threadpool_start", name: "hash 2" },
      { type: "wait", duration: 160, reason: "only two workers are occupied" },
      { type: "threadpool_done", name: "hash 1" }, { type: "threadpool_done", name: "hash 2" },
      { type: "console", value: "worker pool remains responsive" }, { type: "stack_pop", name: "limited batch" }
    ],
    prediction: { type: "mcq", question: "What happens when too many crypto tasks start at once?", options: ["The worker pool queues extra tasks", "Each task gets a new JS thread", "Timers run inside crypto workers"], correct: "The worker pool queues extra tasks" },
    explanation: {
      summary: "Async CPU helpers are limited by worker-pool capacity.",
      steps: ["Four tasks start.", "Extra tasks queue.", "Other pool users wait longer.", "Concurrency limits keep latency predictable."],
      mistake: "Assuming every async API scales infinitely.",
      realWorld: "This affects auth, compression, reports, DNS, uploads, and image/PDF processing."
    },
    variation: "Try the fixed version and compare queued worker tasks.",
    whatGoesWrong: "A burst of CPU-heavy async jobs saturates libuv, delaying unrelated callbacks.",
    whyFixWorks: "A concurrency limit leaves worker capacity for other requests."
  },
  {
    id: "http-db-lifecycle",
    title: "HTTP request with database call",
    category: "Files & Networking",
    level: "intermediate",
    concept: "A request handler starts sync, awaits network/database work, then resumes when the promise settles.",
    realWorld: "See why response latency is often wait time, not JavaScript execution time.",
    panels: ["callStack", "microtasks", "io", "performance", "debugger"],
    problemCode: `app.get("/users/:id", async (req, res) => {
  const user = await db.users.findById(req.params.id);
  res.json(user);
});`,
    events: [
      { type: "stack_push", name: "GET /users/:id" }, { type: "line", line: 1 }, { type: "variable_set", name: "req.params.id", value: "42" },
      { type: "line", line: 2 }, { type: "promise_pending", name: "db.users.findById" }, { type: "io_add", name: "database query", detail: "socket wait" }, { type: "stack_pop", name: "GET /users/:id" },
      { type: "wait", duration: 95, reason: "database responds" }, { type: "io_run", name: "database query" }, { type: "promise_settled", name: "db.users.findById", result: "fulfilled" }, { type: "microtask_add", name: "resume route" },
      { type: "microtask_run", name: "resume route" }, { type: "line", line: 3 }, { type: "console", value: "200 user 42" }, { type: "stack_pop", name: "resume route" }
    ],
    prediction: { type: "mcq", question: "Where does the handler pause?", options: ["At await", "At res.json", "At route registration"], correct: "At await" },
    explanation: {
      summary: "await pauses the async function and lets Node handle other work.",
      steps: ["The request handler starts.", "The DB promise becomes pending.", "The stack clears.", "The handler resumes in a microtask after the DB result."],
      mistake: "Confusing waiting on I/O with blocking the event loop.",
      realWorld: "This is the core lifecycle for Express/Fastify route handlers."
    },
    variation: "Add a second independent DB call and compare sequential await vs Promise.all."
  },
  {
    id: "stream-backpressure-pipe",
    title: "Stream pipe with backpressure",
    category: "Streams & Buffers",
    level: "advanced",
    concept: "Streams move chunks and pause reads when the writable side cannot keep up.",
    realWorld: "Process large files without loading the whole file into memory.",
    panels: ["streams", "memory", "io", "debugger"],
    problemCode: `readable.on("data", (chunk) => {
  writable.write(chunk); // ignores false
});`,
    fixedCode: `readable.pipe(writable);

writable.on("drain", () => {
  // reading resumes when the buffer has room
});`,
    events: [
      { type: "io_add", name: "read stream", detail: "large file" }, { type: "memory_allocate", id: "buffer", label: "write buffer", size: 16 },
      { type: "stream_chunk", stream: "readable", chunk: "chunk 1", bytes: 64 }, { type: "stream_chunk", stream: "writable", chunk: "chunk 1", bytes: 64 },
      { type: "stream_chunk", stream: "readable", chunk: "chunk 2", bytes: 64 }, { type: "memory_retain", id: "buffer", reason: "writable is slower than readable" },
      { type: "stream_backpressure", stream: "writable", reason: "write() returned false" },
      { type: "stream_chunk", stream: "readable", chunk: "chunk 3", bytes: 64 }, { type: "memory_retain", id: "buffer", reason: "ignored backpressure" }
    ],
    fixedEvents: [
      { type: "io_add", name: "readable.pipe(writable)", detail: "backpressure aware" }, { type: "memory_allocate", id: "buffer", label: "write buffer", size: 16 },
      { type: "stream_chunk", stream: "pipe", chunk: "chunk 1", bytes: 64 }, { type: "stream_backpressure", stream: "writable", reason: "pause readable" },
      { type: "wait", duration: 40, reason: "writable drains" }, { type: "stream_drain", stream: "writable" }, { type: "memory_release", id: "buffer" },
      { type: "stream_chunk", stream: "pipe", chunk: "chunk 2", bytes: 64 }
    ],
    prediction: { type: "mcq", question: "What does write() returning false mean?", options: ["Pause or wait for drain", "The write failed permanently", "The stream is closed"], correct: "Pause or wait for drain" },
    explanation: {
      summary: "Backpressure is how streams avoid unbounded memory growth.",
      steps: ["Readable emits chunks.", "Writable falls behind.", "write returns false.", "pipe pauses and resumes on drain."],
      mistake: "Manually wiring data events and ignoring write's return value.",
      realWorld: "This matters for uploads, downloads, proxies, CSV exports, log pipelines, and ETL jobs."
    },
    variation: "Compare problem and fixed mode to see memory retention drop.",
    whatGoesWrong: "Chunks keep piling into memory because the writable side is slower.",
    whyFixWorks: "pipe coordinates pause/resume with drain."
  },
  {
    id: "buffer-encoding",
    title: "Buffers and encoding",
    category: "Streams & Buffers",
    level: "beginner",
    concept: "Buffers store bytes; encoding controls how bytes become text.",
    realWorld: "Avoid corrupted uploads, broken signatures, and wrong file/network payloads.",
    panels: ["memory", "debugger"],
    problemCode: `const buf = Buffer.from("JS", "utf8");

console.log(buf);
console.log(buf.toString("hex"));
console.log(buf.toString("utf8"));`,
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "memory_allocate", id: "buf", label: "Buffer bytes", size: 2 }, { type: "variable_set", name: "buf bytes", value: "4a 53" },
      { type: "line", line: 3 }, { type: "console", value: "<Buffer 4a 53>" },
      { type: "line", line: 4 }, { type: "console", value: "4a53" },
      { type: "line", line: 5 }, { type: "console", value: "JS" }, { type: "stack_pop", name: "global" }
    ],
    prediction: { type: "order", question: "What representations appear?", options: ["<Buffer 4a 53>", "4a53", "JS"], correct: ["<Buffer 4a 53>", "4a53", "JS"] },
    explanation: {
      summary: "A Buffer is byte storage; string output depends on encoding.",
      steps: ["JS becomes bytes.", "The raw buffer prints byte values.", "hex prints bytes as hex.", "utf8 decodes bytes back to text."],
      mistake: "Treating binary network/file data as normal strings too early.",
      realWorld: "Buffers power files, streams, TCP, HTTP bodies, images, encryption, and uploads."
    },
    variation: "Change utf8 to base64 or hex and compare output."
  },
  {
    id: "memory-leak-cache-listener-timer",
    title: "Memory leak: cache, listener, timer",
    category: "Memory & Performance",
    level: "advanced",
    concept: "Long-lived references stop garbage collection even when a request is finished.",
    realWorld: "Diagnose Node processes whose memory grows every hour.",
    panels: ["memory", "timers", "debugger"],
    problemCode: `const cache = [];

setInterval(() => {
  cache.push(Buffer.alloc(1024 * 1024));
  emitter.on("data", () => cache.length);
}, 1000);`,
    fixedCode: `const cache = new LRUCache({ max: 100 });
const interval = setInterval(poll, 1000);

emitter.once("data", handleData);
clearInterval(interval);`,
    events: [
      { type: "stack_push", name: "startup" }, { type: "memory_allocate", id: "cache", label: "global cache", size: 0 },
      { type: "timer_add", name: "poll interval", delay: 1000 }, { type: "timer_active", name: "poll interval" }, { type: "stack_pop", name: "startup" },
      { type: "timer_run", name: "poll interval" }, { type: "memory_allocate", id: "chunk1", label: "1MB buffer", size: 1 }, { type: "memory_retain", id: "chunk1", reason: "global cache" }, { type: "listener_add", name: "data listener 1" }, { type: "stack_pop", name: "poll interval" },
      { type: "timer_run", name: "poll interval" }, { type: "memory_allocate", id: "chunk2", label: "1MB buffer", size: 1 }, { type: "memory_retain", id: "chunk2", reason: "global cache" }, { type: "listener_add", name: "data listener 2" }, { type: "gc_attempt", result: "not_collected", reason: "cache and listeners still reference buffers" }
    ],
    fixedEvents: [
      { type: "memory_allocate", id: "lru", label: "bounded cache", size: 100 }, { type: "timer_active", name: "poll interval" },
      { type: "listener_add", name: "one-time data listener" }, { type: "listener_remove", name: "one-time data listener" },
      { type: "timer_clear", name: "poll interval" }, { type: "memory_release", id: "lru" }, { type: "gc_attempt", result: "collected", reason: "long-lived references removed" }
    ],
    prediction: { type: "mcq", question: "Why can GC not reclaim the buffers?", options: ["They are still referenced", "Buffers are never collected", "Intervals use worker threads"], correct: "They are still referenced" },
    explanation: {
      summary: "Garbage collection frees unreachable objects, not objects you keep referencing.",
      steps: ["The interval stays active.", "The cache retains buffers.", "Listeners accumulate.", "GC cannot collect retained objects."],
      mistake: "Assuming GC fixes all memory growth automatically.",
      realWorld: "This appears in polling services, socket servers, caches, queues, and event-driven apps."
    },
    variation: "Switch to fixed mode to see timers/listeners released.",
    whatGoesWrong: "Every tick adds retained memory and another listener.",
    whyFixWorks: "Bounded caches, cleanup, and one-time listeners remove long-lived references."
  },
  {
    id: "blocking-json-parse",
    title: "Large JSON parse blocks requests",
    category: "Memory & Performance",
    level: "advanced",
    concept: "CPU-heavy synchronous work blocks the event loop even if your server uses async I/O.",
    realWorld: "Explain slow API responses under large payloads or reporting endpoints.",
    panels: ["callStack", "performance", "debugger"],
    problemCode: `app.post("/import", (req, res) => {
  const data = JSON.parse(hugeBody);
  res.json({ rows: data.length });
});`,
    fixedCode: `// Stream/validate incrementally or move parsing to a worker.
const worker = new Worker("./parse-json.js");`,
    events: [
      { type: "stack_push", name: "POST /import" }, { type: "line", line: 2 }, { type: "performance_block", duration: 650, reason: "JSON.parse runs synchronously on the event loop" },
      { type: "variable_set", name: "data.length", value: "250000" }, { type: "line", line: 3 }, { type: "console", value: "response delayed 650ms" }, { type: "stack_pop", name: "POST /import" }
    ],
    fixedEvents: [
      { type: "stack_push", name: "POST /import" }, { type: "threadpool_add", name: "worker parse", work: "zlib", duration: 650 }, { type: "threadpool_start", name: "worker parse" }, { type: "console", value: "event loop remains responsive" }, { type: "stack_pop", name: "POST /import" }
    ],
    prediction: { type: "mcq", question: "What is blocked by JSON.parse here?", options: ["The event loop", "Only a worker thread", "The database socket"], correct: "The event loop" },
    explanation: {
      summary: "Synchronous CPU work blocks every request on the same Node process.",
      steps: ["The request enters JS.", "JSON.parse monopolizes the stack.", "Other callbacks wait.", "The response is delayed."],
      mistake: "Believing async route handlers make CPU work non-blocking.",
      realWorld: "Large payloads, CSV/JSON imports, report generation, and schema validation can all do this."
    },
    variation: "Use worker mode to compare event-loop blocked time.",
    whatGoesWrong: "One request can delay every other callback in the process.",
    whyFixWorks: "Streaming or worker threads move heavy work off the critical request path."
  },
  {
    id: "promise-allsettled-errors",
    title: "Promise.all vs allSettled",
    category: "Async & Event Loop",
    level: "intermediate",
    concept: "Promise.all fails fast; allSettled keeps every result.",
    realWorld: "Build dashboards and batch jobs that show partial success instead of hiding useful data.",
    panels: ["microtasks", "debugger"],
    problemCode: `const results = await Promise.all([
  fetchUser(),
  fetchBilling(),
  fetchFlags()
]);`,
    fixedCode: `const results = await Promise.allSettled([
  fetchUser(),
  fetchBilling(),
  fetchFlags()
]);`,
    events: [
      { type: "promise_pending", name: "fetchUser" }, { type: "promise_pending", name: "fetchBilling" }, { type: "promise_pending", name: "fetchFlags" },
      { type: "microtask_add", name: "fetchUser fulfilled" }, { type: "microtask_add", name: "fetchBilling rejected" },
      { type: "microtask_run", name: "fetchUser fulfilled" }, { type: "promise_settled", name: "fetchUser", result: "fulfilled" }, { type: "stack_pop", name: "fetchUser fulfilled" },
      { type: "microtask_run", name: "fetchBilling rejected" }, { type: "promise_settled", name: "fetchBilling", result: "rejected" }, { type: "console", value: "Promise.all rejected" }, { type: "stack_pop", name: "fetchBilling rejected" }
    ],
    fixedEvents: [
      { type: "promise_pending", name: "allSettled batch" }, { type: "microtask_add", name: "collect all outcomes" },
      { type: "microtask_run", name: "collect all outcomes" }, { type: "promise_settled", name: "allSettled batch", result: "fulfilled with statuses" }, { type: "console", value: "2 fulfilled, 1 rejected" }, { type: "stack_pop", name: "collect all outcomes" }
    ],
    prediction: { type: "mcq", question: "Which API keeps fulfilled and rejected outcomes?", options: ["Promise.allSettled", "Promise.all", "Promise.race"], correct: "Promise.allSettled" },
    explanation: {
      summary: "Choose the combinator based on failure behavior.",
      steps: ["Several promises start.", "One rejects.", "Promise.all rejects the whole batch.", "allSettled keeps every outcome."],
      mistake: "Using Promise.all for dashboards, imports, or optional data where partial results matter.",
      realWorld: "This affects profile pages, search aggregation, reports, and batch processing."
    },
    variation: "Switch to fixed mode and compare the final console output.",
    whatGoesWrong: "One optional failure hides successful results.",
    whyFixWorks: "allSettled gives you each promise status."
  },
  {
    id: "centralized-error-handling",
    title: "Centralized async errors",
    category: "Errors & Debugging",
    level: "production",
    concept: "Rejected route promises need a centralized path to logging and response handling.",
    realWorld: "Avoid hanging requests and missing production errors.",
    panels: ["microtasks", "debugger"],
    problemCode: `app.get("/report", async (req, res) => {
  const report = await buildReport();
  res.json(report);
});`,
    fixedCode: `app.get("/report", asyncHandler(async (req, res) => {
  const report = await buildReport();
  res.json(report);
}));

app.use(errorMiddleware);`,
    events: [
      { type: "stack_push", name: "GET /report" }, { type: "promise_pending", name: "buildReport" }, { type: "stack_pop", name: "GET /report" },
      { type: "microtask_add", name: "buildReport rejection" }, { type: "microtask_run", name: "buildReport rejection" }, { type: "promise_settled", name: "buildReport", result: "rejected" }, { type: "console", value: "unhandled route error" }, { type: "stack_pop", name: "buildReport rejection" }
    ],
    fixedEvents: [
      { type: "promise_pending", name: "buildReport" }, { type: "microtask_add", name: "asyncHandler catch" }, { type: "microtask_run", name: "asyncHandler catch" }, { type: "console", value: "500 logged and returned" }, { type: "stack_pop", name: "asyncHandler catch" }
    ],
    prediction: { type: "mcq", question: "Where should async route errors go?", options: ["Central error middleware", "console.log only", "process.exit immediately"], correct: "Central error middleware" },
    explanation: {
      summary: "Production servers need one reliable error path.",
      steps: ["The async operation rejects.", "Without a wrapper, the error may bypass response handling.", "A wrapper catches rejection.", "Middleware logs and returns a controlled response."],
      mistake: "Relying on scattered try/catch or unhandled rejection logs.",
      realWorld: "This is a must for Express/Fastify APIs, jobs, and service monitoring."
    },
    variation: "Compare problem and fixed mode to see the rejection get routed.",
    whatGoesWrong: "The rejected promise is not turned into a clean HTTP response.",
    whyFixWorks: "The wrapper converts rejected promises into middleware errors."
  },
  {
    id: "module-cache",
    title: "CommonJS module cache",
    category: "Node.js Fundamentals",
    level: "beginner",
    concept: "CommonJS modules execute once, then require returns the cached exports.",
    realWorld: "Understand shared singletons, config modules, and surprising test state.",
    panels: ["callStack", "memory", "debugger"],
    problemCode: `const a = require("./counter");
const b = require("./counter");

a.inc();
console.log(b.value);`,
    events: [
      { type: "stack_push", name: "main.js" }, { type: "line", line: 1 }, { type: "memory_allocate", id: "counter-module", label: "cached module exports", size: 1 },
      { type: "line", line: 2 }, { type: "memory_retain", id: "counter-module", reason: "b points to same exports object" },
      { type: "line", line: 4 }, { type: "variable_set", name: "counter.value", value: "1" },
      { type: "line", line: 5 }, { type: "console", value: "1" }, { type: "stack_pop", name: "main.js" }
    ],
    prediction: { type: "mcq", question: "What does b.value print?", options: ["1", "0", "undefined"], correct: "1" },
    explanation: {
      summary: "require returns the same cached module object after first load.",
      steps: ["The first require evaluates the module.", "The second require reuses cache.", "a mutates shared exports.", "b sees the same value."],
      mistake: "Expecting require to create a fresh module instance each time.",
      realWorld: "This explains singleton state, config caching, connection pools, and test pollution."
    },
    variation: "Reset module cache in a test and compare behavior."
  },
  {
    id: "security-validation-rate-limit",
    title: "Validation and rate limiting",
    category: "Security",
    level: "production",
    concept: "Reject unsafe input early and limit abusive request bursts before expensive work starts.",
    realWorld: "Protect API servers from injection, crashes, and simple denial-of-service pressure.",
    panels: ["callStack", "performance", "debugger"],
    problemCode: `app.post("/login", async (req, res) => {
  const user = await db.query(req.body.email);
  res.json(user);
});`,
    fixedCode: `app.post("/login", rateLimit, validate(loginSchema), async (req, res) => {
  const user = await db.findUserByEmail(req.body.email);
  res.json(user);
});`,
    events: [
      { type: "stack_push", name: "POST /login" }, { type: "line", line: 2 }, { type: "performance_block", duration: 120, reason: "bad request still reaches database work" }, { type: "console", value: "unsafe query path" }, { type: "stack_pop", name: "POST /login" }
    ],
    fixedEvents: [
      { type: "stack_push", name: "POST /login" }, { type: "line", line: 1 }, { type: "console", value: "rate limit ok" }, { type: "console", value: "input validated" }, { type: "line", line: 2 }, { type: "console", value: "safe parameterized lookup" }, { type: "stack_pop", name: "POST /login" }
    ],
    prediction: { type: "mcq", question: "What should run before database work?", options: ["Rate limit and validation", "JSON response", "Unhandled rejection"], correct: "Rate limit and validation" },
    explanation: {
      summary: "Security is part of runtime flow, not a separate checklist.",
      steps: ["The unsafe version trusts input.", "Expensive work starts too early.", "The fixed route limits and validates first.", "Only safe requests reach data access."],
      mistake: "Adding security after business logic instead of before it.",
      realWorld: "Use this for login, search, forms, public APIs, and webhook endpoints."
    },
    variation: "Compare problem and fixed mode to see the request stop earlier.",
    whatGoesWrong: "Unsafe and abusive requests reach expensive database work before the app proves they are valid.",
    whyFixWorks: "Rate limiting and validation stop bad requests at the edge of the route."
  },
  {
    id: "testing-async-timers",
    title: "Testing async timers",
    category: "Testing",
    level: "intermediate",
    concept: "Timer helpers and Promise microtasks are different things in tests.",
    realWorld: "Fix flaky Jest/Vitest tests for retries, debounce, and async UI.",
    panels: ["microtasks", "timers", "debugger"],
    problemCode: `retryLater();
vi.advanceTimersByTime(1000);

expect(save).toHaveBeenCalled();`,
    fixedCode: `retryLater();
vi.advanceTimersByTime(1000);
await Promise.resolve();

expect(save).toHaveBeenCalled();`,
    events: [
      { type: "timer_add", name: "retry timer", delay: 1000 }, { type: "timer_run", name: "retry timer" }, { type: "microtask_add", name: "save promise" }, { type: "console", value: "assertion ran too early" }
    ],
    fixedEvents: [
      { type: "timer_add", name: "retry timer", delay: 1000 }, { type: "timer_run", name: "retry timer" }, { type: "microtask_add", name: "save promise" }, { type: "microtask_run", name: "save promise" }, { type: "console", value: "assertion sees save" }, { type: "stack_pop", name: "save promise" }
    ],
    prediction: { type: "mcq", question: "What often needs flushing after advancing timers?", options: ["Microtasks", "Close queue", "Module cache"], correct: "Microtasks" },
    explanation: {
      summary: "Advancing timers does not guarantee promise continuations have completed.",
      steps: ["The retry timer fires.", "It schedules promise work.", "The assertion can run before the microtask.", "Awaiting a tick flushes the continuation."],
      mistake: "Assuming fake timers finish every async branch.",
      realWorld: "This affects retries, debounced saves, polling hooks, and async route tests."
    },
    variation: "Use fixed mode to see the assertion move after the promise.",
    whatGoesWrong: "The assertion runs after the timer but before the promise continuation has completed.",
    whyFixWorks: "Awaiting a tick gives the microtask queue time to settle before assertions."
  },
  {
    id: "deployment-graceful-shutdown",
    title: "Graceful shutdown",
    category: "Deployment",
    level: "production",
    concept: "Production Node apps should stop accepting new work, finish active requests, then close resources.",
    realWorld: "Avoid dropped requests during deploys, restarts, and container shutdown.",
    panels: ["io", "close", "debugger"],
    problemCode: `process.on("SIGTERM", () => {
  process.exit(0);
});`,
    fixedCode: `process.on("SIGTERM", async () => {
  server.close();
  await db.close();
  process.exit(0);
});`,
    events: [
      { type: "close_add", name: "SIGTERM" }, { type: "close_run", name: "SIGTERM" }, { type: "console", value: "process exited immediately" }, { type: "stack_pop", name: "SIGTERM" }
    ],
    fixedEvents: [
      { type: "close_add", name: "SIGTERM" }, { type: "close_run", name: "SIGTERM" }, { type: "io_add", name: "server.close", detail: "stop new requests" }, { type: "io_add", name: "db.close", detail: "release connections" }, { type: "wait", duration: 60, reason: "resources close" }, { type: "console", value: "shutdown complete" }, { type: "stack_pop", name: "SIGTERM" }
    ],
    prediction: { type: "mcq", question: "What should happen before process exit?", options: ["Close server and resources", "Start more timers", "Ignore SIGTERM"], correct: "Close server and resources" },
    explanation: {
      summary: "Graceful shutdown turns deployment signals into controlled cleanup.",
      steps: ["SIGTERM arrives.", "The unsafe app exits immediately.", "The fixed app stops new work.", "Resources close before exit."],
      mistake: "Treating shutdown as instant process termination.",
      realWorld: "This matters for Docker, PM2, Kubernetes, systemd, and cloud deploys."
    },
    variation: "Compare fixed mode to see close queue and resource cleanup.",
    whatGoesWrong: "Immediate process exit can drop active requests and leave resources without graceful cleanup.",
    whyFixWorks: "The shutdown path stops new work, closes resources, and exits only after cleanup finishes."
  },
  {
    id: "interview-event-loop-story",
    title: "Interview: explain the event loop",
    category: "Interview Questions",
    level: "beginner",
    concept: "A strong event-loop answer connects stack, queues, async APIs, and real production consequences.",
    realWorld: "Prepare concise answers that also transfer to debugging real Node systems.",
    panels: ["callStack", "microtasks", "timers", "io", "check", "debugger"],
    problemCode: `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");`,
    events: [
      { type: "stack_push", name: "global" }, { type: "console", value: "A" }, { type: "timer_add", name: "B timer", delay: 0 }, { type: "microtask_add", name: "C promise" }, { type: "console", value: "D" }, { type: "stack_pop", name: "global" },
      { type: "microtask_run", name: "C promise" }, { type: "console", value: "C" }, { type: "stack_pop", name: "C promise" }, { type: "timer_run", name: "B timer" }, { type: "console", value: "B" }, { type: "stack_pop", name: "B timer" }
    ],
    prediction: { type: "order", question: "What is the classic output?", options: ["A", "B", "C", "D"], correct: ["A", "D", "C", "B"] },
    explanation: {
      summary: "The stack runs first, microtasks drain next, then timer callbacks run.",
      steps: ["A logs immediately.", "The timer is queued.", "The promise is queued as a microtask.", "D logs, then C, then B."],
      mistake: "Memorizing output without explaining queues.",
      realWorld: "This mental model is the base for debugging tests, route handlers, and async race conditions."
    },
    variation: "Add process.nextTick in Node and see why Node-specific answers need one more queue."
  },
  {
    id: "callback-error-first",
    title: "Error-first callback flow",
    category: "Errors & Debugging",
    level: "beginner",
    concept: "Classic Node callbacks pass errors first so success code should only run after the error branch is checked.",
    realWorld: "Avoid sending duplicate responses or using missing data after fs, database, Redis, or legacy SDK callbacks fail.",
    panels: ["callStack", "io", "debugger"],
    problemCode: `fs.readFile("config.json", "utf8", (err, text) => {
  const config = JSON.parse(text);
  console.log(config.port);
});`,
    fixedCode: `fs.readFile("config.json", "utf8", (err, text) => {
  if (err) return console.error("config missing");
  const config = JSON.parse(text);
  console.log(config.port);
});`,
    events: [
      { type: "stack_push", name: "startup" }, { type: "line", line: 1 }, { type: "io_add", name: "read config", detail: "file missing" }, { type: "stack_pop", name: "startup" },
      { type: "io_run", name: "read config" }, { type: "line", line: 2 }, { type: "console", value: "JSON.parse(undefined) throws" }, { type: "stack_pop", name: "read config" }
    ],
    fixedEvents: [
      { type: "io_add", name: "read config", detail: "file missing" }, { type: "io_run", name: "read config" }, { type: "line", line: 2 }, { type: "console", value: "config missing" }, { type: "stack_pop", name: "read config" }
    ],
    prediction: { type: "mcq", question: "What should run first inside an error-first callback?", options: ["Check err", "Parse text", "Send success response"], correct: "Check err" },
    explanation: {
      summary: "Error-first callbacks require an early error branch.",
      steps: ["The file read is scheduled.", "The callback receives an error.", "Problem code uses text anyway.", "Fixed code returns from the error branch."],
      mistake: "Treating callback data as valid before checking err.",
      realWorld: "This still appears in fs APIs, older SDKs, queues, mailers, Redis clients, and migration scripts."
    },
    variation: "Switch to fixed mode to see the success path stop before parsing.",
    whatGoesWrong: "The app continues as if data exists and crashes or sends the wrong response.",
    whyFixWorks: "The early return keeps success logic behind the error check."
  },
  {
    id: "setinterval-drift",
    title: "setInterval drift under load",
    category: "Async & Event Loop",
    level: "intermediate",
    concept: "Intervals schedule ticks, but callbacks cannot run while the event loop is blocked.",
    realWorld: "Understand delayed polling, heartbeats, metrics flushes, and background jobs during CPU spikes.",
    panels: ["callStack", "timers", "performance", "debugger"],
    problemCode: `setInterval(() => console.log("tick"), 1000);

while (Date.now() < start + 2500) {
  // CPU work
}`,
    fixedCode: `setTimeout(async function tick() {
  await doSmallChunk();
  setTimeout(tick, 1000);
}, 1000);`,
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "timer_add", name: "interval tick", delay: 1000 }, { type: "timer_active", name: "interval tick" },
      { type: "line", line: 3 }, { type: "performance_block", duration: 2500, reason: "CPU loop blocks timer callbacks" }, { type: "stack_pop", name: "global" },
      { type: "timer_run", name: "interval tick" }, { type: "console", value: "tick delayed" }, { type: "stack_pop", name: "interval tick" }
    ],
    fixedEvents: [
      { type: "timer_add", name: "controlled tick", delay: 1000 }, { type: "wait", duration: 1000, reason: "wait before next tick" }, { type: "timer_run", name: "controlled tick" }, { type: "console", value: "tick after chunk" }, { type: "stack_pop", name: "controlled tick" }
    ],
    prediction: { type: "mcq", question: "What happens to interval ticks during CPU blocking?", options: ["They wait behind the block", "They run on another JS thread", "They cancel automatically"], correct: "They wait behind the block" },
    explanation: {
      summary: "Timers are callbacks, and callbacks need an empty call stack.",
      steps: ["The interval is registered.", "CPU work occupies the stack.", "Timer callbacks become ready but cannot run.", "The tick appears late."],
      mistake: "Expecting setInterval to be exact under load.",
      realWorld: "This affects polling, telemetry, websocket pings, cron-like jobs, and rate-limit cleanup."
    },
    variation: "Use smaller chunks or a worker thread for heavy work.",
    whatGoesWrong: "The interval looks unreliable because the event loop is busy.",
    whyFixWorks: "Scheduling after each chunk avoids piling work on top of a blocked loop."
  },
  {
    id: "nexttick-starvation",
    title: "nextTick starvation",
    category: "Async & Event Loop",
    level: "advanced",
    concept: "A recursive process.nextTick loop can starve Promise callbacks, timers, and I/O.",
    realWorld: "Debug libraries that make servers feel frozen even though no synchronous loop is obvious.",
    panels: ["microtasks", "timers", "io", "performance", "debugger"],
    problemCode: `function spin() {
  process.nextTick(spin);
}
spin();
setTimeout(() => console.log("timer"), 0);`,
    fixedCode: `function spin() {
  setImmediate(spin);
}
spin();`,
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 4 }, { type: "nexttick_add", name: "spin" }, { type: "line", line: 5 }, { type: "timer_add", name: "timer", delay: 0 }, { type: "stack_pop", name: "global" },
      { type: "nexttick_run", name: "spin" }, { type: "nexttick_add", name: "spin" }, { type: "stack_pop", name: "spin" },
      { type: "nexttick_run", name: "spin" }, { type: "nexttick_add", name: "spin" }, { type: "performance_block", duration: 80, reason: "nextTick keeps refilling before timers" }
    ],
    fixedEvents: [
      { type: "check_add", name: "spin immediate" }, { type: "timer_add", name: "timer", delay: 0 }, { type: "timer_run", name: "timer" }, { type: "console", value: "timer gets a turn" }, { type: "stack_pop", name: "timer" }
    ],
    prediction: { type: "mcq", question: "Why can the timer be delayed forever?", options: ["nextTick keeps refilling first", "Timers run only in browsers", "setTimeout needs fs"], correct: "nextTick keeps refilling first" },
    explanation: {
      summary: "nextTick is powerful because it runs before other queues, but that can starve them.",
      steps: ["spin schedules nextTick.", "nextTick runs before timers.", "spin schedules another nextTick.", "The timer keeps waiting."],
      mistake: "Using nextTick for repeated background work.",
      realWorld: "This can appear in libraries, streams, parsers, and retry loops."
    },
    variation: "Use setImmediate for repeated work so other phases get a turn.",
    whatGoesWrong: "Timers and I/O callbacks cannot make progress.",
    whyFixWorks: "setImmediate yields to the event-loop phases instead of refilling nextTick forever."
  },
  {
    id: "setimmediate-inside-io",
    title: "setImmediate inside I/O",
    category: "Async & Event Loop",
    level: "intermediate",
    concept: "Inside an I/O callback, setImmediate is usually reached before a newly scheduled timer.",
    realWorld: "Explain ordering in fs callbacks, network handlers, and libraries that mix timers with setImmediate.",
    panels: ["io", "timers", "check", "debugger"],
    problemCode: `fs.readFile("a.txt", () => {
  setTimeout(() => console.log("timer"), 0);
  setImmediate(() => console.log("immediate"));
});`,
    events: [
      { type: "io_add", name: "readFile callback", detail: "file ready" }, { type: "io_run", name: "readFile callback" }, { type: "line", line: 2 }, { type: "timer_add", name: "timer", delay: 0 },
      { type: "line", line: 3 }, { type: "check_add", name: "immediate" }, { type: "stack_pop", name: "readFile callback" },
      { type: "check_run", name: "immediate" }, { type: "console", value: "immediate" }, { type: "stack_pop", name: "immediate" },
      { type: "timer_run", name: "timer" }, { type: "console", value: "timer" }, { type: "stack_pop", name: "timer" }
    ],
    prediction: { type: "order", question: "Inside I/O, which commonly logs first?", options: ["timer", "immediate"], correct: ["immediate", "timer"] },
    explanation: {
      summary: "After poll/I/O, Node proceeds to the check phase where setImmediate callbacks run.",
      steps: ["I/O callback runs.", "Timer and immediate are scheduled.", "The current poll turn finishes.", "Check runs before the newly eligible timer."],
      mistake: "Assuming setTimeout 0 always beats setImmediate.",
      realWorld: "This matters when working with fs, sockets, streams, and test timing."
    },
    variation: "Move both calls outside I/O and the order becomes less reliable.",
    limitations: ["Outside an I/O callback, timer vs immediate order can vary by environment and timing."]
  },
  {
    id: "promise-race-timeout",
    title: "Promise.race request timeout",
    category: "Async & Event Loop",
    level: "intermediate",
    concept: "Promise.race settles with the first promise, but slower work may still continue unless you cancel it.",
    realWorld: "Build request timeouts without leaking pending fetches, database calls, or background tasks.",
    panels: ["microtasks", "timers", "io", "debugger"],
    problemCode: `await Promise.race([
  fetchUser(),
  timeout(1000)
]);`,
    fixedCode: `const controller = new AbortController();
await Promise.race([
  fetchUser({ signal: controller.signal }),
  timeout(1000).finally(() => controller.abort())
]);`,
    events: [
      { type: "promise_pending", name: "fetchUser" }, { type: "timer_add", name: "timeout", delay: 1000 }, { type: "wait", duration: 1000, reason: "timeout wins" },
      { type: "timer_run", name: "timeout" }, { type: "promise_settled", name: "race", result: "rejected: timeout" }, { type: "console", value: "timeout error" }, { type: "stack_pop", name: "timeout" }
    ],
    fixedEvents: [
      { type: "promise_pending", name: "fetchUser with signal" }, { type: "timer_add", name: "timeout", delay: 1000 }, { type: "timer_run", name: "timeout" }, { type: "io_add", name: "abort fetch", detail: "cancel slow work" }, { type: "console", value: "timeout and aborted" }, { type: "stack_pop", name: "timeout" }
    ],
    prediction: { type: "mcq", question: "What does Promise.race not do by itself?", options: ["Cancel slower work", "Settle quickly", "Return first result"], correct: "Cancel slower work" },
    explanation: {
      summary: "race chooses the first settlement; cancellation is a separate concern.",
      steps: ["The request and timeout start.", "The timeout settles first.", "race rejects.", "The original request may still be pending."],
      mistake: "Assuming race automatically stops the loser.",
      realWorld: "This affects HTTP clients, database timeouts, queues, and service-to-service calls."
    },
    variation: "Use AbortController or library cancellation to stop slow work.",
    whatGoesWrong: "The caller sees a timeout while the slow operation still consumes resources.",
    whyFixWorks: "The abort signal tells the underlying operation to stop."
  },
  {
    id: "promise-any-fallback",
    title: "Promise.any fallback",
    category: "Async & Event Loop",
    level: "intermediate",
    concept: "Promise.any ignores rejections until one promise fulfills, then only fails if all reject.",
    realWorld: "Use redundant mirrors, cache fallbacks, and multi-region reads without failing on the first bad source.",
    panels: ["microtasks", "io", "debugger"],
    problemCode: `const data = await Promise.any([
  readPrimary(),
  readReplica(),
  readCache()
]);`,
    events: [
      { type: "promise_pending", name: "primary" }, { type: "promise_pending", name: "replica" }, { type: "promise_pending", name: "cache" },
      { type: "microtask_add", name: "primary rejected" }, { type: "microtask_run", name: "primary rejected" }, { type: "promise_settled", name: "primary", result: "rejected" }, { type: "stack_pop", name: "primary rejected" },
      { type: "microtask_add", name: "cache fulfilled" }, { type: "microtask_run", name: "cache fulfilled" }, { type: "promise_settled", name: "Promise.any", result: "fulfilled from cache" }, { type: "console", value: "cache result" }, { type: "stack_pop", name: "cache fulfilled" }
    ],
    prediction: { type: "mcq", question: "When does Promise.any reject?", options: ["Only when all reject", "When the first rejects", "When the slowest fulfills"], correct: "Only when all reject" },
    explanation: {
      summary: "Promise.any is built for first successful fallback behavior.",
      steps: ["Multiple sources start.", "One source rejects.", "any keeps waiting.", "The first fulfillment wins."],
      mistake: "Confusing any with race.",
      realWorld: "This helps multi-region reads, cache fallback, CDN mirrors, and optional providers."
    },
    variation: "Compare with Promise.race when the first result is a rejection."
  },
  {
    id: "fs-sync-blocks-server",
    title: "readFileSync blocks server",
    category: "Files & Networking",
    level: "beginner",
    concept: "Synchronous filesystem calls block the event loop and delay every other request in the process.",
    realWorld: "Avoid slow endpoints caused by reading templates, reports, or config files during requests.",
    panels: ["callStack", "performance", "io", "debugger"],
    problemCode: `app.get("/report", (req, res) => {
  const csv = fs.readFileSync("report.csv", "utf8");
  res.send(csv);
});`,
    fixedCode: `app.get("/report", async (req, res) => {
  const csv = await fs.promises.readFile("report.csv", "utf8");
  res.send(csv);
});`,
    events: [
      { type: "stack_push", name: "GET /report" }, { type: "line", line: 2 }, { type: "performance_block", duration: 220, reason: "readFileSync blocks event loop" }, { type: "line", line: 3 }, { type: "console", value: "response after blocking read" }, { type: "stack_pop", name: "GET /report" }
    ],
    fixedEvents: [
      { type: "stack_push", name: "GET /report" }, { type: "line", line: 2 }, { type: "threadpool_add", name: "read report.csv", work: "fs", duration: 220 }, { type: "threadpool_start", name: "read report.csv" }, { type: "stack_pop", name: "GET /report" },
      { type: "threadpool_done", name: "read report.csv" }, { type: "io_add", name: "read callback" }, { type: "io_run", name: "read callback" }, { type: "console", value: "response after async read" }, { type: "stack_pop", name: "read callback" }
    ],
    prediction: { type: "mcq", question: "What does readFileSync block in a request?", options: ["The event loop", "Only the file worker", "Only this user's socket"], correct: "The event loop" },
    explanation: {
      summary: "Sync filesystem calls are simple but costly inside request paths.",
      steps: ["The request enters JS.", "readFileSync keeps the stack busy.", "Other callbacks wait.", "The response sends after the blocking read."],
      mistake: "Using sync APIs in hot server paths because they feel easier.",
      realWorld: "Use async fs, caching, or streaming for templates, files, exports, and uploads."
    },
    variation: "Use fixed mode to watch file work leave the JS stack.",
    whatGoesWrong: "One request delays unrelated requests.",
    whyFixWorks: "Async fs work leaves the JS stack and returns through I/O."
  },
  {
    id: "dns-threadpool-delay",
    title: "DNS lookup and worker pressure",
    category: "Files & Networking",
    level: "advanced",
    concept: "Some DNS work can share worker-pool capacity with fs, crypto, and zlib tasks.",
    realWorld: "Explain slow outbound requests when password hashing, compression, or file work is saturating the process.",
    panels: ["threadPool", "io", "performance", "debugger"],
    problemCode: `crypto.pbkdf2(...);
crypto.pbkdf2(...);
crypto.pbkdf2(...);
crypto.pbkdf2(...);
dns.lookup("api.internal", callback);`,
    fixedCode: `// Limit crypto concurrency or move CPU work to workers.
await limit(cryptoJobs, 2);`,
    events: [
      { type: "threadpool_add", name: "hash 1", work: "crypto", duration: 160 }, { type: "threadpool_start", name: "hash 1" },
      { type: "threadpool_add", name: "hash 2", work: "crypto", duration: 160 }, { type: "threadpool_start", name: "hash 2" },
      { type: "threadpool_add", name: "hash 3", work: "crypto", duration: 160 }, { type: "threadpool_start", name: "hash 3" },
      { type: "threadpool_add", name: "hash 4", work: "crypto", duration: 160 }, { type: "threadpool_start", name: "hash 4" },
      { type: "threadpool_add", name: "dns lookup", work: "dns", duration: 40 }, { type: "performance_block", duration: 90, reason: "DNS waits behind worker-pool work" }
    ],
    fixedEvents: [
      { type: "threadpool_add", name: "hash 1", work: "crypto", duration: 160 }, { type: "threadpool_start", name: "hash 1" }, { type: "threadpool_add", name: "dns lookup", work: "dns", duration: 40 }, { type: "threadpool_start", name: "dns lookup" }, { type: "threadpool_done", name: "dns lookup" }, { type: "console", value: "lookup completes sooner" }
    ],
    prediction: { type: "mcq", question: "Why can DNS appear slow here?", options: ["Worker pool is busy", "DNS always runs on the call stack", "Promises block DNS"], correct: "Worker pool is busy" },
    explanation: {
      summary: "Worker-pool pressure can delay unrelated async operations.",
      steps: ["Crypto jobs fill workers.", "DNS lookup queues.", "Outbound request waits.", "Concurrency limits leave capacity."],
      mistake: "Treating all async work as isolated.",
      realWorld: "This affects services that hash, compress, read files, and call other services at the same time."
    },
    variation: "Limit CPU-ish async work or use dedicated worker threads.",
    whatGoesWrong: "A burst of worker-pool tasks can delay an outbound request before it even connects.",
    whyFixWorks: "Limiting CPU-ish async work keeps worker capacity available for DNS and filesystem tasks.",
    limitations: ["DNS behavior depends on API choice and operating system; this shows the worker-pool pressure model."]
  },
  {
    id: "zlib-compression-pool",
    title: "zlib compression uses workers",
    category: "Memory & Performance",
    level: "advanced",
    concept: "Compression is async, but it can still saturate libuv workers and delay other pool users.",
    realWorld: "Understand slow downloads, report exports, and API latency during compression bursts.",
    panels: ["threadPool", "io", "performance", "debugger"],
    problemCode: `await Promise.all(files.map((file) => gzip(file)));`,
    fixedCode: `await runWithLimit(files, 2, gzip);`,
    events: [
      { type: "threadpool_add", name: "gzip 1", work: "zlib", duration: 120 }, { type: "threadpool_start", name: "gzip 1" },
      { type: "threadpool_add", name: "gzip 2", work: "zlib", duration: 120 }, { type: "threadpool_start", name: "gzip 2" },
      { type: "threadpool_add", name: "gzip 3", work: "zlib", duration: 120 }, { type: "threadpool_start", name: "gzip 3" },
      { type: "threadpool_add", name: "gzip 4", work: "zlib", duration: 120 }, { type: "threadpool_start", name: "gzip 4" },
      { type: "threadpool_add", name: "file read", work: "fs", duration: 40 }, { type: "performance_block", duration: 70, reason: "file read queues behind compression" }
    ],
    fixedEvents: [
      { type: "threadpool_add", name: "gzip 1", work: "zlib", duration: 120 }, { type: "threadpool_start", name: "gzip 1" }, { type: "threadpool_add", name: "gzip 2", work: "zlib", duration: 120 }, { type: "threadpool_start", name: "gzip 2" }, { type: "console", value: "workers remain available" }
    ],
    prediction: { type: "mcq", question: "What protects latency during compression bursts?", options: ["Concurrency limits", "More console logs", "Recursive nextTick"], correct: "Concurrency limits" },
    explanation: {
      summary: "Async compression still uses limited backend capacity.",
      steps: ["Many gzip jobs start.", "Workers fill.", "Other pool jobs wait.", "A limit keeps the process responsive."],
      mistake: "Assuming Promise.all is always the fastest production choice.",
      realWorld: "This matters for downloads, backup jobs, archives, image/PDF pipelines, and proxies."
    },
    variation: "Compare fixed mode with fewer concurrent compression jobs.",
    whatGoesWrong: "Compression steals all workers from unrelated tasks.",
    whyFixWorks: "A limiter reserves capacity for other work."
  },
  {
    id: "full-read-vs-stream-memory",
    title: "Full read vs stream memory",
    category: "Streams & Buffers",
    level: "intermediate",
    concept: "Reading a whole file allocates the full payload; streaming processes chunks and keeps memory flatter.",
    realWorld: "Build CSV imports, file downloads, log processors, and upload handlers that do not exhaust memory.",
    panels: ["streams", "memory", "io", "debugger"],
    problemCode: `const text = await fs.promises.readFile("big.csv", "utf8");
await upload(text);`,
    fixedCode: `fs.createReadStream("big.csv").pipe(uploadStream);`,
    events: [
      { type: "io_add", name: "read big.csv", detail: "full file" }, { type: "memory_allocate", id: "file", label: "250MB string", size: 250 }, { type: "memory_retain", id: "file", reason: "upload waits for full body" }, { type: "console", value: "memory spike" }
    ],
    fixedEvents: [
      { type: "io_add", name: "stream big.csv", detail: "chunks" }, { type: "stream_chunk", stream: "readable", chunk: "chunk 1", bytes: 65536 }, { type: "memory_allocate", id: "chunk", label: "64KB chunk", size: 1 }, { type: "stream_chunk", stream: "writable", chunk: "chunk 1", bytes: 65536 }, { type: "memory_release", id: "chunk" }, { type: "console", value: "flat memory" }
    ],
    prediction: { type: "mcq", question: "Why is streaming safer for big files?", options: ["It processes chunks", "It makes files smaller", "It runs JavaScript on disk"], correct: "It processes chunks" },
    explanation: {
      summary: "Streams trade one huge allocation for many small chunks.",
      steps: ["Full read allocates the payload.", "Upload retains it.", "Stream mode moves chunks.", "Chunks can be released after writing."],
      mistake: "Using readFile for unbounded user files.",
      realWorld: "This is critical for CSV imports, exports, proxies, logs, media, and backups."
    },
    variation: "Use fixed mode to see chunk memory released.",
    whatGoesWrong: "One large file can create a large heap spike.",
    whyFixWorks: "Streaming keeps only a small working chunk in memory."
  },
  {
    id: "stream-error-handling",
    title: "Stream error handling",
    category: "Streams & Buffers",
    level: "advanced",
    concept: "Streams can fail after work starts, so pipeline-style error handling is safer than manual pipe chains.",
    realWorld: "Prevent hanging uploads, broken proxies, and files left half-written after stream failures.",
    panels: ["streams", "io", "close", "debugger"],
    problemCode: `readable.pipe(transform).pipe(writable);`,
    fixedCode: `await pipeline(readable, transform, writable);`,
    events: [
      { type: "stream_chunk", stream: "readable", chunk: "chunk 1", bytes: 64 }, { type: "stream_chunk", stream: "transform", chunk: "chunk 1", bytes: 64 }, { type: "io_add", name: "transform error", detail: "not handled centrally" }, { type: "console", value: "stream may hang" }
    ],
    fixedEvents: [
      { type: "stream_chunk", stream: "pipeline", chunk: "chunk 1", bytes: 64 }, { type: "io_add", name: "transform error", detail: "pipeline catches" }, { type: "close_add", name: "destroy streams" }, { type: "close_run", name: "destroy streams" }, { type: "console", value: "failed cleanly" }, { type: "stack_pop", name: "destroy streams" }
    ],
    prediction: { type: "mcq", question: "What does pipeline improve?", options: ["Error and cleanup flow", "CPU speed", "Module caching"], correct: "Error and cleanup flow" },
    explanation: {
      summary: "pipeline turns a stream chain into one awaitable operation with cleanup.",
      steps: ["Chunks begin moving.", "A transform fails.", "Manual chains can miss cleanup.", "pipeline rejects and closes streams."],
      mistake: "Assuming pipe automatically handles every error path.",
      realWorld: "Use pipeline for uploads, downloads, compression, ETL, proxies, and file transforms."
    },
    variation: "Use fixed mode to see close cleanup after failure.",
    whatGoesWrong: "A failed stream can leave resources open or promises unresolved.",
    whyFixWorks: "pipeline wires error propagation and cleanup into one flow."
  },
  {
    id: "buffer-base64-json",
    title: "Buffer base64 payload",
    category: "Streams & Buffers",
    level: "beginner",
    concept: "Base64 is text that represents bytes; converting back to a Buffer is required before binary processing.",
    realWorld: "Handle file uploads, JWT pieces, webhooks, images, and API payloads without corrupting bytes.",
    panels: ["memory", "debugger"],
    problemCode: `const body = "SGVsbG8=";
console.log(body.length);
console.log(Buffer.from(body, "base64").toString("utf8"));`,
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "variable_set", name: "body", value: "base64 text" },
      { type: "line", line: 2 }, { type: "console", value: "8 chars" },
      { type: "line", line: 3 }, { type: "memory_allocate", id: "buf", label: "decoded bytes", size: 5 }, { type: "console", value: "Hello" }, { type: "stack_pop", name: "global" }
    ],
    prediction: { type: "mcq", question: "What does Buffer.from(body, 'base64') create?", options: ["Decoded bytes", "A timer", "A Promise queue"], correct: "Decoded bytes" },
    explanation: {
      summary: "Base64 is an encoding boundary between text and bytes.",
      steps: ["The payload starts as text.", "Its length is not byte size.", "Buffer decodes base64.", "UTF-8 turns bytes back into text."],
      mistake: "Treating encoded binary payloads as normal strings forever.",
      realWorld: "This affects uploads, images, signatures, JWTs, webhooks, and network payloads."
    },
    variation: "Try hex, utf8, and base64 in the guided Buffer cases."
  },
  {
    id: "worker-thread-cpu",
    title: "Worker thread for CPU work",
    category: "Memory & Performance",
    level: "advanced",
    concept: "Worker threads move CPU-heavy JavaScript off the main event loop.",
    realWorld: "Keep APIs responsive while parsing, transforming, hashing, or calculating expensive results.",
    panels: ["callStack", "threadPool", "performance", "debugger"],
    problemCode: `app.get("/score", (req, res) => {
  const score = calculateHugeScore(req.user);
  res.json({ score });
});`,
    fixedCode: `app.get("/score", async (req, res) => {
  const score = await runInWorker(req.user);
  res.json({ score });
});`,
    events: [
      { type: "stack_push", name: "GET /score" }, { type: "line", line: 2 }, { type: "performance_block", duration: 480, reason: "CPU calculation on main thread" }, { type: "console", value: "response delayed" }, { type: "stack_pop", name: "GET /score" }
    ],
    fixedEvents: [
      { type: "stack_push", name: "GET /score" }, { type: "line", line: 2 }, { type: "threadpool_add", name: "worker score", work: "crypto", duration: 480 }, { type: "threadpool_start", name: "worker score" }, { type: "stack_pop", name: "GET /score" }, { type: "console", value: "event loop stays open" }
    ],
    prediction: { type: "mcq", question: "What should CPU-heavy JavaScript avoid blocking?", options: ["The main event loop", "The package lock", "The module cache"], correct: "The main event loop" },
    explanation: {
      summary: "Workers are for CPU-heavy JavaScript, not normal I/O waiting.",
      steps: ["Problem code calculates on the stack.", "The event loop is blocked.", "Fixed code sends work to a worker.", "The request can resume when work completes."],
      mistake: "Using async/await around CPU work and expecting it to become non-blocking.",
      realWorld: "Use workers for image/PDF processing, ML-ish calculations, parsing, encryption, and report generation."
    },
    variation: "Compare blocked duration with worker mode.",
    whatGoesWrong: "One CPU-heavy request slows every callback in the process.",
    whyFixWorks: "The expensive JavaScript runs away from the main event loop."
  },
  {
    id: "cluster-request-distribution",
    title: "Cluster request distribution",
    category: "Deployment",
    level: "advanced",
    concept: "Multiple Node processes can share traffic so one blocked process does not stop every request.",
    realWorld: "Understand PM2 cluster mode, Node cluster, container replicas, and horizontal scaling.",
    panels: ["io", "performance", "debugger"],
    problemCode: `// one process
server.listen(3000);`,
    fixedCode: `// multiple processes
cluster.fork();
cluster.fork();
cluster.fork();
cluster.fork();`,
    events: [
      { type: "io_add", name: "request A", detail: "single process" }, { type: "io_run", name: "request A" }, { type: "performance_block", duration: 300, reason: "one process handles all work" }, { type: "console", value: "request B waits" }, { type: "stack_pop", name: "request A" }
    ],
    fixedEvents: [
      { type: "io_add", name: "request A", detail: "worker 1" }, { type: "io_add", name: "request B", detail: "worker 2" }, { type: "console", value: "requests spread across processes" }
    ],
    prediction: { type: "mcq", question: "What does clustering add?", options: ["More Node processes", "More microtask queues in one process", "Automatic SQL indexes"], correct: "More Node processes" },
    explanation: {
      summary: "Clustering scales by running multiple processes, each with its own event loop.",
      steps: ["Single process receives all work.", "Blocking affects that process.", "Cluster adds more processes.", "Traffic can be distributed."],
      mistake: "Expecting one Node process to use every CPU core for JS execution.",
      realWorld: "This matters for PM2, Kubernetes replicas, container scaling, and CPU-heavy services."
    },
    variation: "Use worker threads for CPU tasks inside a process; use clustering for process-level scaling.",
    whatGoesWrong: "One busy process can make every request assigned to that process wait.",
    whyFixWorks: "Multiple processes give traffic more event loops and isolate stalls to fewer requests.",
    limitations: ["Real load balancing depends on platform, OS, process manager, and deployment topology."]
  },
  {
    id: "unhandled-rejection-policy",
    title: "Unhandled rejection policy",
    category: "Errors & Debugging",
    level: "production",
    concept: "Unhandled promise rejections must be logged and handled deliberately instead of silently ignored.",
    realWorld: "Prevent invisible failed jobs, stuck requests, and production incidents with missing alerts.",
    panels: ["microtasks", "debugger", "close"],
    problemCode: `async function job() {
  await sendEmail();
}
job();`,
    fixedCode: `job().catch((err) => {
  logger.error(err);
  process.exitCode = 1;
});`,
    events: [
      { type: "promise_pending", name: "job" }, { type: "microtask_add", name: "sendEmail rejection" }, { type: "microtask_run", name: "sendEmail rejection" }, { type: "promise_settled", name: "job", result: "rejected" }, { type: "console", value: "unhandled rejection" }, { type: "stack_pop", name: "sendEmail rejection" }
    ],
    fixedEvents: [
      { type: "promise_pending", name: "job" }, { type: "microtask_add", name: "job catch" }, { type: "microtask_run", name: "job catch" }, { type: "console", value: "error logged" }, { type: "close_add", name: "controlled shutdown policy" }, { type: "stack_pop", name: "job catch" }
    ],
    prediction: { type: "mcq", question: "What should production code do with rejected top-level jobs?", options: ["Catch and log them", "Ignore them", "Schedule nextTick forever"], correct: "Catch and log them" },
    explanation: {
      summary: "A promise that rejects outside a catch path becomes an operational risk.",
      steps: ["The job starts.", "sendEmail rejects.", "No caller catches it.", "Fixed code logs and applies policy."],
      mistake: "Starting async jobs without returning or catching the promise.",
      realWorld: "This affects cron jobs, queue workers, startup scripts, migrations, and background tasks."
    },
    variation: "Use centralized job wrappers for logging, retries, and shutdown decisions.",
    whatGoesWrong: "Failures can disappear or crash in uncontrolled ways.",
    whyFixWorks: "The rejection is routed into logging and a deliberate process policy."
  }
];

export const nodeScenarioCategories = [
  "Node.js Fundamentals",
  "Async & Event Loop",
  "Streams & Buffers",
  "Files & Networking",
  "Errors & Debugging",
  "Memory & Performance",
  "Security",
  "Testing",
  "Deployment",
  "Interview Questions"
] as const;
