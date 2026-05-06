import type { Demo } from "@/engine/types";

export const nodeRuntimeDemos: Demo[] = [
  {
    id: "process-nexttick-priority",
    number: 31,
    title: "process.nextTick vs Promise",
    category: "node-runtime",
    concept: "In Node.js, nextTick callbacks run before Promise microtasks.",
    code: `console.log("start");

process.nextTick(() => console.log("nextTick"));
Promise.resolve().then(() => console.log("promise"));

console.log("end");`,
    prediction: {
      type: "order",
      question: "What is the Node.js output order?",
      options: ["start", "nextTick", "promise", "end"],
      correct: ["start", "end", "nextTick", "promise"]
    },
    events: [
      { type: "stack_push", name: "global" },
      { type: "line", line: 1, explain: "The global script starts synchronously." },
      { type: "console", value: "start" },
      { type: "line", line: 3, explain: "Node places nextTick work in its own high-priority queue." },
      { type: "microtask_add", name: "nextTick callback" },
      { type: "line", line: 4, explain: "Promise reactions enter the regular microtask queue." },
      { type: "microtask_add", name: "Promise.then" },
      { type: "line", line: 6 },
      { type: "console", value: "end" },
      { type: "stack_pop", name: "global" },
      { type: "microtask_run", name: "nextTick callback", explain: "Node drains nextTick before Promise jobs." },
      { type: "console", value: "nextTick" },
      { type: "stack_pop", name: "nextTick callback" },
      { type: "microtask_run", name: "Promise.then" },
      { type: "console", value: "promise" },
      { type: "stack_pop", name: "Promise.then" }
    ],
    explanation: {
      summary: "Node has a special nextTick queue that runs before normal Promise microtasks.",
      steps: ["Sync logs run first.", "nextTick is scheduled.", "Promise.then is scheduled.", "Node drains nextTick, then Promise jobs."],
      mistake: "Assuming browser microtask rules explain every Node ordering issue.",
      realWorld: "This matters in Node libraries, stream internals, CLIs, and tests that mix nextTick with promises."
    }
  },
  {
    id: "setimmediate-after-io",
    number: 32,
    title: "setImmediate after I/O",
    category: "node-runtime",
    concept: "Inside an I/O callback, setImmediate usually runs before a zero-delay timer.",
    code: `readFile("config.json", () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate"));
  console.log("io done");
});`,
    prediction: {
      type: "order",
      question: "Inside the I/O callback, what usually prints first?",
      options: ["timeout", "immediate", "io done"],
      correct: ["io done", "immediate", "timeout"]
    },
    events: [
      { type: "stack_push", name: "global" },
      { type: "line", line: 1 },
      { type: "webapi_add", name: "fs.readFile", detail: "libuv handles file work outside the JS stack." },
      { type: "stack_pop", name: "global" },
      { type: "timeline_wait", duration: 24, reason: "File read completes." },
      { type: "webapi_remove", name: "fs.readFile" },
      { type: "timer_run", name: "readFile callback", explain: "The I/O callback enters JavaScript." },
      { type: "line", line: 2 },
      { type: "timer_add", name: "timeout 0", delay: 0 },
      { type: "line", line: 3 },
      { type: "timer_add", name: "setImmediate callback" },
      { type: "line", line: 4 },
      { type: "console", value: "io done" },
      { type: "stack_pop", name: "readFile callback" },
      { type: "timer_run", name: "setImmediate callback" },
      { type: "console", value: "immediate" },
      { type: "stack_pop", name: "setImmediate callback" },
      { type: "timer_run", name: "timeout 0" },
      { type: "console", value: "timeout" },
      { type: "stack_pop", name: "timeout 0" }
    ],
    explanation: {
      summary: "After I/O, Node's check phase gives setImmediate a predictable advantage over a new timer.",
      steps: ["The file read finishes.", "The I/O callback schedules both callbacks.", "The synchronous log runs.", "The check phase runs setImmediate before the next timers phase."],
      mistake: "Expecting setTimeout(..., 0) to always beat setImmediate.",
      realWorld: "This appears in servers, CLIs, file watchers, and test suites that schedule follow-up work after I/O."
    }
  },
  {
    id: "event-emitter-sync-listeners",
    number: 33,
    title: "EventEmitter listeners are sync",
    category: "node-runtime",
    concept: "EventEmitter.emit calls listeners immediately on the current stack.",
    code: `emitter.on("ready", () => console.log("listener"));

console.log("before");
emitter.emit("ready");
console.log("after");`,
    prediction: {
      type: "order",
      question: "When does the listener run?",
      options: ["before", "listener", "after"],
      correct: ["before", "listener", "after"]
    },
    events: [
      { type: "stack_push", name: "global" },
      { type: "line", line: 1 },
      { type: "memory_allocate", id: "listener", label: "ready listener", size: 1 },
      { type: "line", line: 3 },
      { type: "console", value: "before" },
      { type: "line", line: 4, explain: "emit does not queue the listener. It calls it now." },
      { type: "stack_push", name: "ready listener" },
      { type: "console", value: "listener" },
      { type: "stack_pop", name: "ready listener" },
      { type: "line", line: 5 },
      { type: "console", value: "after" },
      { type: "stack_pop", name: "global" }
    ],
    explanation: {
      summary: "Node EventEmitter is synchronous unless a listener schedules async work itself.",
      steps: ["The listener is registered.", "before logs.", "emit calls the listener immediately.", "after logs only after the listener returns."],
      mistake: "Treating every event-like API as asynchronous.",
      realWorld: "This explains surprising stack traces and error timing in Express apps, streams, queues, and internal event buses."
    }
  },
  {
    id: "stream-backpressure-drain",
    number: 34,
    title: "Stream backpressure",
    category: "node-runtime",
    concept: "When stream.write returns false, wait for drain before writing more.",
    code: `const ok = stream.write(bigChunk);
console.log(ok);

if (!ok) {
  stream.once("drain", () => console.log("safe to write"));
}`,
    prediction: {
      type: "mcq",
      question: "What should production code do when write returns false?",
      options: ["Keep writing immediately", "Wait for drain", "Block the CPU loop"],
      correct: "Wait for drain"
    },
    events: [
      { type: "stack_push", name: "global" },
      { type: "line", line: 1, explain: "The stream buffer is full, so write returns false." },
      { type: "memory_allocate", id: "buffer", label: "stream buffer", size: 64 },
      { type: "memory_retain", id: "buffer", reason: "Data is waiting to flush." },
      { type: "line", line: 2 },
      { type: "console", value: "false" },
      { type: "line", line: 4 },
      { type: "line", line: 5 },
      { type: "webapi_add", name: "drain listener", detail: "Resumes when the buffer has room." },
      { type: "stack_pop", name: "global" },
      { type: "timeline_wait", duration: 80, reason: "Stream flushes buffered data." },
      { type: "memory_release", id: "buffer" },
      { type: "webapi_remove", name: "drain listener" },
      { type: "timer_run", name: "drain listener" },
      { type: "console", value: "safe to write" },
      { type: "stack_pop", name: "drain listener" }
    ],
    explanation: {
      summary: "Backpressure is the stream telling you to pause until the buffer catches up.",
      steps: ["A large chunk fills the buffer.", "write returns false.", "The code waits for drain.", "More writes become safe after buffered data flushes."],
      mistake: "Ignoring the boolean return value from stream.write.",
      realWorld: "This prevents memory spikes in file uploads, log pipelines, CSV exports, proxies, and Node API gateways."
    }
  },
  {
    id: "unhandled-rejection-timing",
    number: 35,
    title: "Unhandled rejection timing",
    category: "node-runtime",
    concept: "A rejected promise reports as unhandled after the current turn if no catch is attached.",
    code: `Promise.reject(new Error("boom"));
console.log("still running");`,
    prediction: {
      type: "order",
      question: "What happens first?",
      options: ["unhandled rejection", "still running"],
      correct: ["still running", "unhandled rejection"]
    },
    events: [
      { type: "stack_push", name: "global" },
      { type: "line", line: 1 },
      { type: "microtask_add", name: "rejection check" },
      { type: "line", line: 2 },
      { type: "console", value: "still running" },
      { type: "stack_pop", name: "global" },
      { type: "microtask_run", name: "rejection check", explain: "Node checks whether a rejection was handled." },
      { type: "console", value: "UnhandledPromiseRejection: boom" },
      { type: "stack_pop", name: "rejection check" }
    ],
    explanation: {
      summary: "Promise rejection reporting is asynchronous, so sync code can continue first.",
      steps: ["A rejected promise is created.", "No catch is attached.", "The sync log still runs.", "Node reports the unhandled rejection after the turn."],
      mistake: "Thinking Promise.reject throws like a normal synchronous throw.",
      realWorld: "This is critical for background jobs, test failures, queue consumers, and process-level error monitoring."
    }
  },
  {
    id: "top-level-await-module",
    number: 36,
    title: "Top-level await blocks importers",
    category: "node-runtime",
    concept: "A module with top-level await pauses evaluation of modules that import it.",
    code: `// config.ts
console.log("load config");
await fetchConfig();
console.log("config ready");

// app.ts waits before it can continue importing config.ts`,
    prediction: {
      type: "mcq",
      question: "What does the importer wait for?",
      options: ["Only parse time", "fetchConfig to finish", "No waiting"],
      correct: "fetchConfig to finish"
    },
    events: [
      { type: "stack_push", name: "module config.ts" },
      { type: "line", line: 2 },
      { type: "console", value: "load config" },
      { type: "line", line: 3, explain: "Top-level await pauses module evaluation." },
      { type: "webapi_add", name: "fetchConfig", detail: "Importer waits for this promise." },
      { type: "stack_pop", name: "module config.ts" },
      { type: "timeline_wait", duration: 120, reason: "Config request resolves." },
      { type: "webapi_remove", name: "fetchConfig" },
      { type: "microtask_run", name: "resume module" },
      { type: "line", line: 4 },
      { type: "console", value: "config ready" },
      { type: "stack_pop", name: "resume module" }
    ],
    explanation: {
      summary: "Top-level await makes module loading asynchronous for everything that depends on it.",
      steps: ["The module starts evaluating.", "It reaches await.", "Importers pause.", "The module resumes after the promise settles."],
      mistake: "Putting slow startup work in a widely imported module without noticing app boot delay.",
      realWorld: "This affects Next.js tooling, Node CLIs, config loaders, migrations, server startup, and test environments."
    }
  },
  {
    id: "libuv-threadpool-callback",
    number: 37,
    title: "libuv thread pool callback",
    category: "node-runtime",
    concept: "Some Node work runs off the main thread, but callbacks return to the JS event loop.",
    code: `crypto.pbkdf2(password, salt, 100000, 64, "sha512", () => {
  console.log("hash ready");
});

console.log("request accepted");`,
    prediction: {
      type: "order",
      question: "Which log appears first?",
      options: ["hash ready", "request accepted"],
      correct: ["request accepted", "hash ready"]
    },
    events: [
      { type: "stack_push", name: "request handler" },
      { type: "line", line: 1 },
      { type: "webapi_add", name: "thread pool job", detail: "CPU-heavy crypto work leaves the JS stack." },
      { type: "line", line: 5 },
      { type: "console", value: "request accepted" },
      { type: "stack_pop", name: "request handler" },
      { type: "timeline_wait", duration: 180, reason: "Thread pool computes the hash." },
      { type: "webapi_remove", name: "thread pool job" },
      { type: "timer_run", name: "pbkdf2 callback" },
      { type: "line", line: 2 },
      { type: "console", value: "hash ready" },
      { type: "stack_pop", name: "pbkdf2 callback" }
    ],
    explanation: {
      summary: "Node can offload work, but your callback still waits for the event loop to pick it up.",
      steps: ["The crypto task is sent to the thread pool.", "The request handler continues.", "The worker thread finishes.", "The callback runs back on the main JS thread."],
      mistake: "Assuming async Node APIs never compete for limited worker threads.",
      realWorld: "This matters for password hashing, image processing, filesystem bursts, DNS, and API latency under load."
    }
  },
  {
    id: "abort-controller-node-fetch",
    number: 38,
    title: "AbortController cleanup",
    category: "node-runtime",
    concept: "Aborting a fetch rejects the pending operation and prevents stale work.",
    code: `const controller = new AbortController();

fetch(url, { signal: controller.signal })
  .catch(() => console.log("cancelled"));

controller.abort();`,
    prediction: {
      type: "mcq",
      question: "What happens after abort?",
      options: ["fetch succeeds", "cancelled logs", "nothing can observe it"],
      correct: "cancelled logs"
    },
    events: [
      { type: "stack_push", name: "request setup" },
      { type: "line", line: 1 },
      { type: "memory_allocate", id: "controller", label: "AbortController", size: 1 },
      { type: "line", line: 3 },
      { type: "webapi_add", name: "fetch request", detail: "The request listens to the abort signal." },
      { type: "line", line: 4 },
      { type: "microtask_add", name: "catch handler" },
      { type: "line", line: 6 },
      { type: "webapi_remove", name: "fetch request" },
      { type: "stack_pop", name: "request setup" },
      { type: "microtask_run", name: "catch handler" },
      { type: "console", value: "cancelled" },
      { type: "memory_release", id: "controller" },
      { type: "stack_pop", name: "catch handler" }
    ],
    explanation: {
      summary: "AbortController gives async work a cancellation path instead of letting stale callbacks finish.",
      steps: ["The fetch subscribes to a signal.", "A catch handler is attached.", "abort cancels the pending request.", "The rejection handler runs."],
      mistake: "Letting old requests update state after the user navigates or changes input.",
      realWorld: "Use this in search boxes, route transitions, server fetch timeouts, and background sync cleanup."
    }
  },
  {
    id: "worker-thread-offload",
    number: 39,
    title: "Worker thread offload",
    category: "node-runtime",
    concept: "Move CPU-heavy work to a worker so the main event loop keeps responding.",
    code: `const worker = new Worker("./resize.js");
worker.postMessage(image);
worker.on("message", () => console.log("done"));

console.log("main is free");`,
    prediction: {
      type: "order",
      question: "What prints while the worker is busy?",
      options: ["done", "main is free"],
      correct: ["main is free", "done"]
    },
    events: [
      { type: "stack_push", name: "main thread" },
      { type: "line", line: 1 },
      { type: "webapi_add", name: "worker thread", detail: "A separate JS worker starts." },
      { type: "line", line: 2 },
      { type: "webapi_add", name: "image job", detail: "Message is sent to the worker." },
      { type: "line", line: 3 },
      { type: "memory_allocate", id: "listener", label: "message listener", size: 1 },
      { type: "line", line: 5 },
      { type: "console", value: "main is free" },
      { type: "stack_pop", name: "main thread" },
      { type: "timeline_wait", duration: 200, reason: "Worker processes the image." },
      { type: "webapi_remove", name: "image job" },
      { type: "timer_run", name: "worker message" },
      { type: "console", value: "done" },
      { type: "stack_pop", name: "worker message" }
    ],
    explanation: {
      summary: "Workers keep CPU-heavy tasks from blocking the main Node event loop.",
      steps: ["The worker is created.", "A job is posted.", "The main thread continues immediately.", "The message callback runs when the worker finishes."],
      mistake: "Trying to fix CPU stalls with promises alone. Promises do not move work off-thread.",
      realWorld: "Use workers for image resizing, PDF generation, analytics crunching, compression, and expensive parsing."
    }
  },
  {
    id: "async-local-storage-context",
    number: 40,
    title: "AsyncLocalStorage request context",
    category: "node-runtime",
    concept: "AsyncLocalStorage can preserve request context across async boundaries.",
    code: `storage.run({ requestId: "r42" }, async () => {
  console.log(storage.getStore().requestId);
  await saveToDatabase();
  console.log(storage.getStore().requestId);
});`,
    prediction: {
      type: "mcq",
      question: "What request id is visible after await?",
      options: ["r42 then undefined", "undefined then r42", "r42 then r42"],
      correct: "r42 then r42"
    },
    events: [
      { type: "stack_push", name: "request context" },
      { type: "line", line: 1 },
      { type: "memory_allocate", id: "context", label: "requestId r42", size: 1 },
      { type: "memory_retain", id: "context", reason: "AsyncLocalStorage links it to async resources." },
      { type: "line", line: 2 },
      { type: "console", value: "r42" },
      { type: "line", line: 3 },
      { type: "webapi_add", name: "saveToDatabase", detail: "Context follows the async operation." },
      { type: "stack_pop", name: "request context" },
      { type: "timeline_wait", duration: 90, reason: "Database save resolves." },
      { type: "webapi_remove", name: "saveToDatabase" },
      { type: "microtask_run", name: "resume async callback" },
      { type: "line", line: 4 },
      { type: "console", value: "r42" },
      { type: "memory_release", id: "context" },
      { type: "stack_pop", name: "resume async callback" }
    ],
    explanation: {
      summary: "AsyncLocalStorage keeps per-request metadata available after awaits when used correctly.",
      steps: ["A context object is created.", "The first log reads it.", "Async work starts.", "The resumed callback still sees the same context."],
      mistake: "Passing request IDs manually everywhere or using globals that mix users together.",
      realWorld: "This powers request logging, tracing, tenant IDs, auth context, and observability in modern Node servers."
    }
  }
];
