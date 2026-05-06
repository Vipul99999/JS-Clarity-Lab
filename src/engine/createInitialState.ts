import type { VisualState } from "./types";

export function createInitialState(): VisualState {
  return {
    currentLine: 1,
    callStack: [],
    microtaskQueue: [],
    timerQueue: [],
    webApis: [],
    consoleOutput: [],
    memory: {},
    blockedDuration: 0,
    elapsedTime: 0
  };
}
