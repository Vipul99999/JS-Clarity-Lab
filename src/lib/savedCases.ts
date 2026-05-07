"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isInternalHref, MAX_SAVED_CASES, safeJsonParse, writeBoundedLocalStorage } from "@/security/privacy";

export type SavedCase = {
  id: string;
  type: "demo" | "editable" | "node" | "analyzer";
  title: string;
  href: string;
  category: string;
  savedAt: number;
};

const STORAGE_KEY = "js-clarity-lab:saved-cases:v1";

function keyFor(item: Pick<SavedCase, "type" | "id">) {
  return `${item.type}:${item.id}`;
}

function readSaved(): Record<string, SavedCase> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = safeJsonParse<Record<string, SavedCase>>(raw, {});
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeSaved(items: Record<string, SavedCase>) {
  if (typeof window === "undefined") return;
  writeBoundedLocalStorage(STORAGE_KEY, items);
  window.dispatchEvent(new CustomEvent("js-clarity-saved-cases"));
}

export function useSavedCases() {
  const [items, setItems] = useState<Record<string, SavedCase>>({});

  useEffect(() => {
    setItems(readSaved());
    const sync = () => setItems(readSaved());
    window.addEventListener("storage", sync);
    window.addEventListener("js-clarity-saved-cases", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("js-clarity-saved-cases", sync);
    };
  }, []);

  const save = useCallback((item: Omit<SavedCase, "savedAt">) => {
    const next = readSaved();
    if (!isInternalHref(item.href)) return;
    next[keyFor(item)] = { ...item, savedAt: Date.now() };
    const limited = Object.fromEntries(Object.entries(next).sort((a, b) => b[1].savedAt - a[1].savedAt).slice(0, MAX_SAVED_CASES));
    writeSaved(limited);
    setItems(limited);
  }, []);

  const remove = useCallback((item: Pick<SavedCase, "type" | "id">) => {
    const next = readSaved();
    delete next[keyFor(item)];
    writeSaved(next);
    setItems(next);
  }, []);

  const toggle = useCallback((item: Omit<SavedCase, "savedAt">) => {
    const next = readSaved();
    const key = keyFor(item);
    if (next[key]) delete next[key];
    else {
      if (!isInternalHref(item.href)) return;
      next[key] = { ...item, savedAt: Date.now() };
    }
    const limited = Object.fromEntries(Object.entries(next).sort((a, b) => b[1].savedAt - a[1].savedAt).slice(0, MAX_SAVED_CASES));
    writeSaved(limited);
    setItems(limited);
  }, []);

  const isSaved = useCallback((item: Pick<SavedCase, "type" | "id">) => Boolean(items[keyFor(item)]), [items]);

  const saved = useMemo(() => Object.values(items).sort((a, b) => b.savedAt - a.savedAt), [items]);

  return { saved, save, remove, toggle, isSaved };
}
