export function label(base: unknown, index?: number) {
  return `${String(base)}${index === undefined ? "" : index}`;
}
