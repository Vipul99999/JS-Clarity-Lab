import type { NodeEvent, NodeState } from "./types";

export function createNodeInitialState(): NodeState {
  return {
    currentLine: 1,
    callStack: [],
    nextTickQueue: [],
    microtaskQueue: [],
    timerQueue: [],
    ioQueue: [],
    checkQueue: [],
    closeQueue: [],
    threadPool: [],
    streamEvents: [],
    consoleOutput: [],
    memory: {},
    variables: {},
    pendingPromises: {},
    activeTimers: [],
    eventListeners: [],
    asyncChain: [],
    blockedDuration: 0,
    elapsedTime: 0
  };
}

function withoutFirst(items: string[], value: string) {
  const index = items.findIndex((item) => item.startsWith(value));
  if (index === -1) return items;
  return [...items.slice(0, index), ...items.slice(index + 1)];
}

export function applyNodeEvent(state: NodeState, event: NodeEvent): NodeState {
  const next: NodeState = {
    ...state,
    callStack: [...state.callStack],
    nextTickQueue: [...state.nextTickQueue],
    microtaskQueue: [...state.microtaskQueue],
    timerQueue: [...state.timerQueue],
    ioQueue: [...state.ioQueue],
    checkQueue: [...state.checkQueue],
    closeQueue: [...state.closeQueue],
    threadPool: state.threadPool.map((task) => ({ ...task })),
    streamEvents: state.streamEvents.map((item) => ({ ...item })),
    consoleOutput: [...state.consoleOutput],
    memory: Object.fromEntries(Object.entries(state.memory).map(([key, value]) => [key, { ...value, retainedBy: [...value.retainedBy] }])),
    variables: { ...state.variables },
    pendingPromises: { ...state.pendingPromises },
    activeTimers: [...state.activeTimers],
    eventListeners: [...state.eventListeners],
    asyncChain: [...state.asyncChain],
    activeEvent: event
  };

  switch (event.type) {
    case "line":
      next.currentLine = event.line;
      return next;
    case "stack_push":
      next.callStack.unshift(event.name);
      return next;
    case "stack_pop":
      next.callStack = withoutFirst(next.callStack, event.name);
      return next;
    case "nexttick_add":
      next.nextTickQueue.push(event.name);
      return next;
    case "nexttick_run":
      next.nextTickQueue = withoutFirst(next.nextTickQueue, event.name);
      next.callStack.unshift(event.name);
      return next;
    case "microtask_add":
      next.microtaskQueue.push(event.name);
      return next;
    case "microtask_run":
      next.microtaskQueue = withoutFirst(next.microtaskQueue, event.name);
      next.callStack.unshift(event.name);
      return next;
    case "timer_add":
      next.timerQueue.push(event.delay === undefined ? event.name : `${event.name} (${event.delay}ms)`);
      return next;
    case "timer_run":
      next.timerQueue = withoutFirst(next.timerQueue, event.name);
      next.callStack.unshift(event.name);
      return next;
    case "io_add":
      next.ioQueue.push(event.detail ? `${event.name}: ${event.detail}` : event.name);
      return next;
    case "io_run":
      next.ioQueue = withoutFirst(next.ioQueue, event.name);
      next.callStack.unshift(event.name);
      return next;
    case "check_add":
      next.checkQueue.push(event.name);
      return next;
    case "check_run":
      next.checkQueue = withoutFirst(next.checkQueue, event.name);
      next.callStack.unshift(event.name);
      return next;
    case "close_add":
      next.closeQueue.push(event.name);
      return next;
    case "close_run":
      next.closeQueue = withoutFirst(next.closeQueue, event.name);
      next.callStack.unshift(event.name);
      return next;
    case "threadpool_add":
      next.threadPool.push({ name: event.name, work: event.work, duration: event.duration, status: "queued" });
      return next;
    case "threadpool_start":
      next.threadPool = next.threadPool.map((task) => (task.name === event.name ? { ...task, status: "running" } : task));
      return next;
    case "threadpool_done":
      next.threadPool = next.threadPool.map((task) => (task.name === event.name ? { ...task, status: "done" } : task));
      return next;
    case "stream_chunk":
      next.streamEvents.push({ stream: event.stream, chunk: event.chunk, bytes: event.bytes, status: "chunk" });
      return next;
    case "stream_backpressure":
      next.streamEvents.push({ stream: event.stream, status: `backpressure: ${event.reason}` });
      return next;
    case "stream_drain":
      next.streamEvents.push({ stream: event.stream, status: "drain" });
      return next;
    case "memory_allocate":
      next.memory[event.id] = { label: event.label, size: event.size, retainedBy: next.memory[event.id]?.retainedBy ?? [] };
      return next;
    case "memory_retain":
      next.memory[event.id] = next.memory[event.id] ?? { label: event.id, size: 1, retainedBy: [] };
      next.memory[event.id].retainedBy.push(event.reason);
      return next;
    case "memory_release":
      next.memory[event.id] = next.memory[event.id] ?? { label: event.id, size: 0, retainedBy: [] };
      next.memory[event.id].released = true;
      return next;
    case "gc_attempt":
      next.streamEvents.push({ stream: "GC", status: `${event.result}: ${event.reason}` });
      return next;
    case "performance_block":
      next.blockedDuration += event.duration;
      next.elapsedTime += event.duration;
      return next;
    case "variable_set":
      next.variables[event.name] = event.value;
      return next;
    case "promise_pending":
      next.pendingPromises[event.name] = "pending";
      return next;
    case "promise_settled":
      next.pendingPromises[event.name] = event.result;
      return next;
    case "timer_active":
      next.activeTimers.push(event.name);
      return next;
    case "timer_clear":
      next.activeTimers = withoutFirst(next.activeTimers, event.name);
      return next;
    case "listener_add":
      next.eventListeners.push(event.name);
      return next;
    case "listener_remove":
      next.eventListeners = withoutFirst(next.eventListeners, event.name);
      return next;
    case "async_chain":
      next.asyncChain.push(event.value);
      return next;
    case "console":
      next.consoleOutput.push(event.value);
      return next;
    case "wait":
      next.elapsedTime += event.duration;
      return next;
    default:
      return next;
  }
}

export function getNodeStateAtStep(events: NodeEvent[], step: number) {
  return events.slice(0, step).reduce(applyNodeEvent, createNodeInitialState());
}
