export const MAX_RECENT_SNIPPETS = 6;
export const MAX_RECENT_SNIPPET_CHARS = 4000;
export const MAX_LOCAL_STORAGE_VALUE_CHARS = 80_000;
export const MAX_SAVED_CASES = 80;

export function limitText(value: string, max = MAX_RECENT_SNIPPET_CHARS) {
  return value.length > max ? `${value.slice(0, max)}\n/* truncated locally for privacy/storage safety */` : value;
}

export function safeSnippetTitle(code: string) {
  return code.trim().split("\n")[0]?.replace(/[<>]/g, "").slice(0, 70) || "Untitled snippet";
}

export function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw || raw.length > MAX_LOCAL_STORAGE_VALUE_CHARS) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeBoundedLocalStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return false;
  const serialized = JSON.stringify(value);
  if (serialized.length > MAX_LOCAL_STORAGE_VALUE_CHARS) return false;
  window.localStorage.setItem(key, serialized);
  return true;
}

export function isInternalHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//") && !href.includes("javascript:");
}
