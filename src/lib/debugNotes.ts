"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { limitText, safeJsonParse, writeBoundedLocalStorage } from "@/security/privacy";

export type DebugNote = {
  id: string;
  title: string;
  body: string;
  source: "analyzer" | "node";
  href: string;
  savedAt: number;
};

const STORAGE_KEY = "js-clarity-lab:debug-notes:v1";
const MAX_NOTES = 12;

function readNotes(): DebugNote[] {
  if (typeof window === "undefined") return [];
  try {
    return safeJsonParse<DebugNote[]>(window.localStorage.getItem(STORAGE_KEY), []).slice(0, MAX_NOTES);
  } catch {
    return [];
  }
}

function writeNotes(notes: DebugNote[]) {
  if (typeof window === "undefined") return;
  writeBoundedLocalStorage(STORAGE_KEY, notes.slice(0, MAX_NOTES));
  window.dispatchEvent(new CustomEvent("js-clarity-debug-notes"));
}

export function useDebugNotes() {
  const [notes, setNotes] = useState<DebugNote[]>([]);

  useEffect(() => {
    setNotes(readNotes());
    const sync = () => setNotes(readNotes());
    window.addEventListener("storage", sync);
    window.addEventListener("js-clarity-debug-notes", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("js-clarity-debug-notes", sync);
    };
  }, []);

  const saveNote = useCallback((note: Omit<DebugNote, "id" | "savedAt">) => {
    const next: DebugNote[] = [
      {
        ...note,
        id: `${Date.now()}`,
        title: limitText(note.title, 120),
        body: limitText(note.body, 4000),
        savedAt: Date.now()
      },
      ...readNotes()
    ].slice(0, MAX_NOTES);
    writeNotes(next);
    setNotes(next);
  }, []);

  const clearNotes = useCallback(() => {
    writeNotes([]);
    setNotes([]);
  }, []);

  return useMemo(() => ({ notes, saveNote, clearNotes }), [clearNotes, notes, saveNote]);
}
