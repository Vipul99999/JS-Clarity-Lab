export function changedLine(name: string, before: unknown, after: unknown, unit = "") {
  return `${name} changed from ${before}${unit} to ${after}${unit}.`;
}
