import type { EditableControl } from "@/editable/types";

export function encodeDemoState(params: Record<string, unknown>, defaults: Record<string, unknown>, controls: EditableControl[]) {
  const search = new URLSearchParams();
  for (const control of controls) {
    const value = params[control.key];
    if (value === undefined || value === defaults[control.key]) continue;
    search.set(control.key, String(value));
  }
  return search.toString();
}
