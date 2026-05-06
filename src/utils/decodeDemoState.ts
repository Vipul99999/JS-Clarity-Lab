import type { EditableControl } from "@/editable/types";

export function decodeDemoState(searchParams: URLSearchParams, controls: EditableControl[]) {
  const decoded: Record<string, unknown> = {};
  for (const control of controls) {
    const raw = searchParams.get(control.key);
    if (raw === null) continue;
    if (control.type === "number") decoded[control.key] = Number(raw);
    else if (control.type === "boolean") decoded[control.key] = raw === "true";
    else decoded[control.key] = raw;
  }
  return decoded;
}
