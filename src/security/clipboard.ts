const MAX_CLIPBOARD_TEXT = 24_000;

export async function copyTextSafely(text: string, maxLength = MAX_CLIPBOARD_TEXT) {
  if (typeof navigator === "undefined" || !navigator.clipboard) return false;
  const safeText = text.length > maxLength ? `${text.slice(0, maxLength)}\n\n[truncated by JS Clarity Lab]` : text;
  await navigator.clipboard.writeText(safeText);
  return true;
}
