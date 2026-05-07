import type { NodeEvent, NodeScenario } from "./types";

export type NodeTraceSeverity = "good" | "watch" | "risk";

export type NodeTraceFinding = {
  area: "queue" | "threadPool" | "streams" | "blocking" | "memory" | "http";
  severity: NodeTraceSeverity;
  title: string;
  detail: string;
  fixHint: string;
};

export type NodeTraceSummary = {
  confidence: "fully simulated" | "partially simulated" | "pattern detected only" | "unsupported";
  elapsedTime: number;
  blockedDuration: number;
  consoleOutput: string[];
  queuePriority: {
    nextTickRuns: number;
    microtaskRuns: number;
    timerRuns: number;
    checkRuns: number;
    ioRuns: number;
    notes: string[];
  };
  threadPool: {
    totalTasks: number;
    maxRunning: number;
    maxQueued: number;
    workTypes: string[];
    pressure: "none" | "low" | "high";
  };
  streams: {
    chunks: number;
    bytes: number;
    backpressureEvents: number;
    drains: number;
    status: "not involved" | "healthy" | "backpressure risk";
  };
  memory: {
    allocated: number;
    retained: number;
    released: number;
    gcBlocked: number;
    status: "flat" | "retained" | "released";
  };
  httpLifecycle: {
    detected: boolean;
    requestNames: string[];
    responseSignals: string[];
    status: "not involved" | "waiting on I/O" | "blocked" | "clean";
  };
  findings: NodeTraceFinding[];
};

function label(event: NodeEvent) {
  if ("name" in event) return event.name;
  if (event.type === "console") return event.value;
  if (event.type === "wait") return event.reason;
  if (event.type === "performance_block") return event.reason;
  if (event.type === "stream_chunk") return `${event.stream} ${event.chunk}`;
  return event.type.replaceAll("_", " ");
}

function isRequestLike(value: string) {
  const text = value.toLowerCase();
  return text.includes("get ") || text.includes("post ") || text.includes("request") || text.includes("route") || text.includes("http") || text.includes("response");
}

export function summarizeNodeTrace(events: NodeEvent[], scenario?: NodeScenario): NodeTraceSummary {
  let elapsedTime = 0;
  let blockedDuration = 0;
  let runningWorkers = 0;
  let maxRunning = 0;
  let maxQueued = 0;
  let queuedWorkers = 0;
  let retained = 0;
  let released = 0;
  let allocated = 0;
  let gcBlocked = 0;

  const consoleOutput: string[] = [];
  const workTypes = new Set<string>();
  const requestNames = new Set<string>();
  const responseSignals = new Set<string>();

  const queuePriority = {
    nextTickRuns: 0,
    microtaskRuns: 0,
    timerRuns: 0,
    checkRuns: 0,
    ioRuns: 0,
    notes: [] as string[]
  };

  const streams = {
    chunks: 0,
    bytes: 0,
    backpressureEvents: 0,
    drains: 0,
    status: "not involved" as NodeTraceSummary["streams"]["status"]
  };

  for (const event of events) {
    const eventName = label(event);
    if (isRequestLike(eventName)) requestNames.add(eventName);

    switch (event.type) {
      case "nexttick_run":
        queuePriority.nextTickRuns += 1;
        break;
      case "microtask_run":
        queuePriority.microtaskRuns += 1;
        break;
      case "timer_run":
        queuePriority.timerRuns += 1;
        break;
      case "check_run":
        queuePriority.checkRuns += 1;
        break;
      case "io_run":
        queuePriority.ioRuns += 1;
        break;
      case "threadpool_add":
        queuedWorkers += 1;
        workTypes.add(event.work);
        maxQueued = Math.max(maxQueued, queuedWorkers);
        break;
      case "threadpool_start":
        queuedWorkers = Math.max(0, queuedWorkers - 1);
        runningWorkers += 1;
        maxRunning = Math.max(maxRunning, runningWorkers);
        break;
      case "threadpool_done":
        runningWorkers = Math.max(0, runningWorkers - 1);
        break;
      case "stream_chunk":
        streams.chunks += 1;
        streams.bytes += event.bytes;
        break;
      case "stream_backpressure":
        streams.backpressureEvents += 1;
        break;
      case "stream_drain":
        streams.drains += 1;
        break;
      case "memory_allocate":
        allocated += event.size;
        break;
      case "memory_retain":
        retained += 1;
        break;
      case "memory_release":
        released += 1;
        break;
      case "gc_attempt":
        if (event.result === "not_collected") gcBlocked += 1;
        break;
      case "performance_block":
        blockedDuration += event.duration;
        elapsedTime += event.duration;
        break;
      case "wait":
        elapsedTime += event.duration;
        break;
      case "console":
        consoleOutput.push(event.value);
        if (event.value.toLowerCase().includes("200") || event.value.toLowerCase().includes("response")) responseSignals.add(event.value);
        break;
    }
  }

  if (queuePriority.nextTickRuns && queuePriority.microtaskRuns) queuePriority.notes.push("nextTick callbacks run before Promise microtasks in Node.");
  if (queuePriority.microtaskRuns && queuePriority.timerRuns) queuePriority.notes.push("Microtasks drain before timers get a turn.");
  if (queuePriority.checkRuns && queuePriority.timerRuns) queuePriority.notes.push("setImmediate belongs to the check phase; timer ordering depends on where it is scheduled.");

  streams.status = streams.chunks === 0 ? "not involved" : streams.backpressureEvents > streams.drains ? "backpressure risk" : "healthy";
  const memoryStatus: NodeTraceSummary["memory"]["status"] = retained > released || gcBlocked > 0 ? "retained" : released > 0 ? "released" : "flat";
  const pressure: NodeTraceSummary["threadPool"]["pressure"] = maxQueued >= 2 || maxRunning >= 4 ? "high" : maxRunning > 0 ? "low" : "none";
  const httpDetected = Boolean(scenario?.category === "Files & Networking" || scenario?.problemCode.match(/\b(GET|POST|app\.|req|res|fetch|db\.)\b/i) || requestNames.size || responseSignals.size);
  const httpStatus: NodeTraceSummary["httpLifecycle"]["status"] = !httpDetected ? "not involved" : blockedDuration > 50 ? "blocked" : queuePriority.ioRuns > 0 || elapsedTime > 0 ? "waiting on I/O" : "clean";

  const findings: NodeTraceFinding[] = [];

  if (queuePriority.notes.length) {
    findings.push({
      area: "queue",
      severity: "watch",
      title: "Queue priority affects output order",
      detail: queuePriority.notes[0],
      fixHint: "When output order matters, separate sync work, nextTick, Promise microtasks, timers, and check callbacks in your mental model."
    });
  }

  if (pressure === "high") {
    findings.push({
      area: "threadPool",
      severity: "risk",
      title: "Worker pool pressure detected",
      detail: `This trace reached ${maxRunning} running worker task(s) and ${maxQueued} queued task(s).`,
      fixHint: "Limit crypto/zlib/fs bursts, move CPU work to Worker Threads, or leave capacity for latency-sensitive work."
    });
  } else if (pressure === "low") {
    findings.push({
      area: "threadPool",
      severity: "good",
      title: "Worker pool is involved",
      detail: "The JavaScript stack is free while libuv worker work is pending.",
      fixHint: "Track queue depth in production when fs, DNS, crypto, and zlib share capacity."
    });
  }

  if (streams.status === "backpressure risk") {
    findings.push({
      area: "streams",
      severity: "risk",
      title: "Backpressure is not fully relieved",
      detail: `${streams.backpressureEvents} backpressure signal(s), ${streams.drains} drain signal(s).`,
      fixHint: "Use pipe/pipeline or await drain before continuing to write."
    });
  }

  if (blockedDuration > 50) {
    findings.push({
      area: "blocking",
      severity: "risk",
      title: "Event loop blocking detected",
      detail: `The trace blocks the event loop for about ${blockedDuration}ms.`,
      fixHint: "Chunk work, stream data, cache earlier, or move CPU-heavy JavaScript to Worker Threads."
    });
  }

  if (memoryStatus === "retained") {
    findings.push({
      area: "memory",
      severity: "risk",
      title: "Memory is retained after work finishes",
      detail: `Allocated score ${allocated}, retained references ${retained}, releases ${released}.`,
      fixHint: "Bound caches, remove listeners, clear intervals, destroy streams, and verify with a heap snapshot."
    });
  }

  if (httpStatus === "waiting on I/O") {
    findings.push({
      area: "http",
      severity: "watch",
      title: "HTTP lifecycle is waiting on external work",
      detail: "The request handler yields while database, file, network, or close work completes.",
      fixHint: "Measure dependency latency separately from JavaScript execution time."
    });
  }

  return {
    confidence: scenario?.limitations?.length ? "partially simulated" : "fully simulated",
    elapsedTime,
    blockedDuration,
    consoleOutput,
    queuePriority,
    threadPool: {
      totalTasks: events.filter((event) => event.type === "threadpool_add").length,
      maxRunning,
      maxQueued,
      workTypes: [...workTypes],
      pressure
    },
    streams,
    memory: {
      allocated,
      retained,
      released,
      gcBlocked,
      status: memoryStatus
    },
    httpLifecycle: {
      detected: httpDetected,
      requestNames: [...requestNames],
      responseSignals: [...responseSignals],
      status: httpStatus
    },
    findings
  };
}
