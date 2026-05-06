import { z } from "zod";
import type { EditableControl } from "./types";

export function schemaForControls(controls: EditableControl[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const control of controls) {
    if (control.type === "number") {
      shape[control.key] = z.coerce.number().min(control.min).max(control.max);
    }
    if (control.type === "boolean") {
      shape[control.key] = z.coerce.boolean();
    }
    if (control.type === "text") {
      shape[control.key] = z.string().max(control.maxLength);
    }
    if (control.type === "select") {
      const values = control.options.map((option) => option.value);
      shape[control.key] = z.string().refine((value) => values.includes(value), "Choose a valid option.");
    }
  }

  return z.object(shape);
}

export function validateWithDefaults(
  schema: z.ZodType<Record<string, unknown>>,
  input: Record<string, unknown>,
  defaults: Record<string, unknown>
) {
  const merged = { ...defaults, ...input };
  const result = schema.safeParse(merged);
  if (result.success) return { params: result.data, errors: {} };

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "params");
    errors[key] = issue.message;
  }

  const safe: Record<string, unknown> = { ...merged };
  for (const key of Object.keys(errors)) {
    safe[key] = defaults[key];
  }

  return { params: schema.parse(safe), errors };
}
