import type { EditableDemo } from "@/editable/types";

export function generateTimeline(demo: EditableDemo, params: Record<string, unknown>) {
  return demo.generateEvents(params);
}
