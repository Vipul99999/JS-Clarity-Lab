import type { Explanation, Prediction } from "@/engine/types";
import type { NodeEvent, NodePanel, NodePlaygroundCategory, NodePlaygroundLevel, NodeScenario } from "./types";

type ScenarioInput = {
  id: string;
  title: string;
  category: NodePlaygroundCategory;
  level: NodePlaygroundLevel;
  concept: string;
  realWorld: string;
  panels?: NodePanel[];
  problemCode: string;
  fixedCode?: string;
  events: NodeEvent[];
  fixedEvents?: NodeEvent[];
  prediction: Prediction;
  explanation: Explanation;
  variation?: string;
  whatGoesWrong?: string;
  whyFixWorks?: string;
  limitations?: string[];
};

export function createNodeScenario(input: ScenarioInput): NodeScenario {
  const inferredPanels = inferPanels([...input.events, ...(input.fixedEvents ?? [])]);

  return {
    ...input,
    panels: input.panels ?? inferredPanels,
    variation: input.variation ?? "Change one scheduling detail and compare the trace.",
    limitations: [
      "Curated simulation only. The app does not execute arbitrary Node.js code.",
      ...(input.limitations ?? [])
    ]
  };
}

function inferPanels(events: NodeEvent[]): NodePanel[] {
  const panels = new Set<NodePanel>(["callStack", "debugger"]);
  for (const event of events) {
    if (event.type.includes("microtask") || event.type.includes("nexttick") || event.type.includes("promise")) panels.add("microtasks");
    if (event.type.includes("timer")) panels.add("timers");
    if (event.type.includes("io") || event.type === "wait") panels.add("io");
    if (event.type.includes("check")) panels.add("check");
    if (event.type.includes("close")) panels.add("close");
    if (event.type.includes("threadpool")) panels.add("threadPool");
    if (event.type.includes("stream")) panels.add("streams");
    if (event.type.includes("memory") || event.type.includes("gc")) panels.add("memory");
    if (event.type.includes("performance")) panels.add("performance");
  }
  return [...panels];
}

export function queueOrder(labels: {
  sync?: string[];
  nextTick?: string[];
  microtasks?: string[];
  timers?: Array<{ name: string; delay?: number; value?: string }>;
  immediates?: string[];
}): NodeEvent[] {
  const events: NodeEvent[] = [{ type: "stack_push", name: "global" }];
  labels.sync?.forEach((value, index) => {
    events.push({ type: "line", line: index + 1 }, { type: "console", value });
  });
  labels.timers?.forEach((timer) => events.push({ type: "timer_add", name: timer.name, delay: timer.delay ?? 0 }));
  labels.immediates?.forEach((name) => events.push({ type: "check_add", name }));
  labels.nextTick?.forEach((name) => events.push({ type: "nexttick_add", name }));
  labels.microtasks?.forEach((name) => events.push({ type: "microtask_add", name }));
  events.push({ type: "stack_pop", name: "global" });
  labels.nextTick?.forEach((name) => events.push({ type: "nexttick_run", name }, { type: "console", value: name }, { type: "stack_pop", name }));
  labels.microtasks?.forEach((name) => events.push({ type: "microtask_run", name }, { type: "console", value: name }, { type: "stack_pop", name }));
  labels.timers?.forEach((timer) => events.push({ type: "timer_run", name: timer.name }, { type: "console", value: timer.value ?? timer.name }, { type: "stack_pop", name: timer.name }));
  labels.immediates?.forEach((name) => events.push({ type: "check_run", name }, { type: "console", value: name }, { type: "stack_pop", name }));
  return events;
}

export function threadPoolBurst(tasks: Array<{ name: string; work: "fs" | "crypto" | "zlib" | "dns"; duration: number }>, workerLimit = 4): NodeEvent[] {
  const events: NodeEvent[] = [{ type: "stack_push", name: "worker burst" }];
  tasks.forEach((task, index) => {
    events.push({ type: "threadpool_add", ...task });
    if (index < workerLimit) events.push({ type: "threadpool_start", name: task.name });
  });
  events.push({ type: "stack_pop", name: "worker burst" });
  if (tasks.length > workerLimit) {
    events.push({ type: "performance_block", duration: 70, reason: "extra worker tasks wait in the libuv queue" });
  }
  return events;
}

export function httpLifecycle(options: { route: string; dependency: string; wait: number; response: string }): NodeEvent[] {
  return [
    { type: "stack_push", name: options.route },
    { type: "promise_pending", name: options.dependency },
    { type: "io_add", name: options.dependency, detail: "external wait" },
    { type: "stack_pop", name: options.route },
    { type: "wait", duration: options.wait, reason: `${options.dependency} responds` },
    { type: "io_run", name: options.dependency },
    { type: "promise_settled", name: options.dependency, result: "fulfilled" },
    { type: "microtask_add", name: "resume route" },
    { type: "microtask_run", name: "resume route" },
    { type: "console", value: options.response },
    { type: "stack_pop", name: "resume route" }
  ];
}

export function streamBackpressure(stream = "writable"): NodeEvent[] {
  return [
    { type: "memory_allocate", id: "buffer", label: "write buffer", size: 16 },
    { type: "stream_chunk", stream: "readable", chunk: "chunk 1", bytes: 64 },
    { type: "stream_chunk", stream, chunk: "chunk 1", bytes: 64 },
    { type: "stream_chunk", stream: "readable", chunk: "chunk 2", bytes: 64 },
    { type: "memory_retain", id: "buffer", reason: "writable is slower than readable" },
    { type: "stream_backpressure", stream, reason: "write() returned false" }
  ];
}
