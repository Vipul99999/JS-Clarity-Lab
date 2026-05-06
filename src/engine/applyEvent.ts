import type { VisualEvent, VisualState } from "./types";

function withoutFirst(items: string[], item: string) {
  const index = items.indexOf(item);
  if (index === -1) return items;
  return [...items.slice(0, index), ...items.slice(index + 1)];
}

export function applyEvent(state: VisualState, event: VisualEvent): VisualState {
  const next: VisualState = {
    ...state,
    callStack: [...state.callStack],
    microtaskQueue: [...state.microtaskQueue],
    timerQueue: [...state.timerQueue],
    webApis: [...state.webApis],
    consoleOutput: [...state.consoleOutput],
    memory: { ...state.memory },
    blockedDuration: state.blockedDuration,
    elapsedTime: state.elapsedTime,
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
      next.timerQueue = next.timerQueue.filter((item) => !item.startsWith(event.name));
      next.callStack.unshift(event.name);
      return next;
    case "webapi_add":
      next.webApis.push(event.detail ? `${event.name}: ${event.detail}` : event.name);
      return next;
    case "webapi_remove":
      next.webApis = next.webApis.filter((item) => !item.startsWith(event.name));
      return next;
    case "console":
      next.consoleOutput.push(event.value);
      return next;
    case "memory_allocate":
      next.memory[event.id] = { ...(next.memory[event.id] ?? {}), size: event.size };
      if ("label" in event) next.memory[event.id].label = event.label;
      return next;
    case "memory_retain":
      next.memory[event.id] = {
        ...(next.memory[event.id] ?? {}),
        retainedBy: [...(next.memory[event.id]?.retainedBy ?? []), event.reason]
      };
      return next;
    case "memory_release":
      next.memory[event.id] = { ...(next.memory[event.id] ?? {}), released: true };
      return next;
    case "gc_attempt":
      next.memory.gc = { gc: event.reason ? `${event.result}: ${event.reason}` : String(event.result) };
      return next;
    case "performance_block":
      next.blockedDuration += event.duration;
      next.elapsedTime += event.duration;
      return next;
    case "timeline_wait":
      next.elapsedTime += event.duration;
      return next;
    default:
      return next;
  }
}
