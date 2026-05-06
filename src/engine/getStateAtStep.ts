import { applyEvent } from "./applyEvent";
import { createInitialState } from "./createInitialState";
import type { VisualEvent } from "./types";

export function getStateAtStep(events: VisualEvent[], step: number) {
  return events.slice(0, step).reduce(applyEvent, createInitialState());
}
