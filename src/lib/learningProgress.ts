"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type LearningItemType = "demo" | "editable" | "node";

export type LearningRecord = {
  id: string;
  type: LearningItemType;
  title: string;
  href: string;
  category: string;
  completed: boolean;
  openedCount?: number;
  firstSeenAt?: number;
  lastCompletedAt?: number;
  updatedAt: number;
};

type LearningProgressState = {
  records: Record<string, LearningRecord>;
};

const STORAGE_KEY = "js-clarity-lab:learning-progress:v1";

function keyFor(type: LearningItemType, id: string) {
  return `${type}:${id}`;
}

function readProgress(): LearningProgressState {
  if (typeof window === "undefined") return { records: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { records: {} };
    const parsed = JSON.parse(raw) as LearningProgressState;
    return parsed && typeof parsed.records === "object" ? parsed : { records: {} };
  } catch {
    return { records: {} };
  }
}

function writeProgress(state: LearningProgressState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("js-clarity-progress"));
}

export function useLearningProgress() {
  const [state, setState] = useState<LearningProgressState>({ records: {} });

  useEffect(() => {
    setState(readProgress());
    const sync = () => setState(readProgress());
    window.addEventListener("storage", sync);
    window.addEventListener("js-clarity-progress", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("js-clarity-progress", sync);
    };
  }, []);

  const upsert = useCallback((record: Omit<LearningRecord, "updatedAt">) => {
    const nextState = readProgress();
    const key = keyFor(record.type, record.id);
    nextState.records[key] = {
      ...nextState.records[key],
      ...record,
      completed: record.completed || nextState.records[key]?.completed || false,
      openedCount: (nextState.records[key]?.openedCount ?? 0) + 1,
      firstSeenAt: nextState.records[key]?.firstSeenAt ?? Date.now(),
      lastCompletedAt: record.completed ? Date.now() : nextState.records[key]?.lastCompletedAt,
      updatedAt: Date.now()
    };
    writeProgress(nextState);
    setState(nextState);
  }, []);

  const markComplete = useCallback((record: Omit<LearningRecord, "completed" | "updatedAt">) => {
    upsert({ ...record, completed: true });
  }, [upsert]);

  const resetProgress = useCallback(() => {
    const empty = { records: {} };
    writeProgress(empty);
    setState(empty);
  }, []);

  const records = useMemo(() => {
    return Object.values(state.records).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [state.records]);

  const completed = useMemo(() => records.filter((record) => record.completed), [records]);

  return {
    records,
    completed,
    upsert,
    markComplete,
    resetProgress
  };
}
