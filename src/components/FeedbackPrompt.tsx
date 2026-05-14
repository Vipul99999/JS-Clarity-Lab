"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, HelpCircle, MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";

type FeedbackChoice = "clear" | "confused" | "missing";

type FeedbackRecord = {
  pageId: string;
  choice: FeedbackChoice;
  at: string;
};

const storageKey = "js-clarity-lab:feedback:v1";

function readFeedback(): FeedbackRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as FeedbackRecord[]) : [];
  } catch {
    return [];
  }
}

function labelFor(choice: FeedbackChoice) {
  if (choice === "clear") return "Clear";
  if (choice === "confused") return "Still confused";
  return "Wrong or missing case";
}

export function FeedbackPrompt({ pageId, context }: { pageId: string; context: string }) {
  const [choice, setChoice] = useState<FeedbackChoice | null>(null);
  const mailto = useMemo(() => {
    const subject = `JS Clarity Lab feedback: ${context}`;
    const body = `Page: ${pageId}\n\nWhat felt unclear or missing?\n`;
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [context, pageId]);

  useEffect(() => {
    const existing = readFeedback().find((record) => record.pageId === pageId);
    if (existing) setChoice(existing.choice);
  }, [pageId]);

  function save(nextChoice: FeedbackChoice) {
    const records = readFeedback().filter((record) => record.pageId !== pageId);
    const nextRecord = { pageId, choice: nextChoice, at: new Date().toISOString() };
    window.localStorage.setItem(storageKey, JSON.stringify([nextRecord, ...records].slice(0, 80)));
    setChoice(nextChoice);
  }

  const options: Array<{ choice: FeedbackChoice; label: string; icon: typeof CheckCircle2 }> = [
    { choice: "clear", label: "Clear", icon: CheckCircle2 },
    { choice: "confused", label: "Still confused", icon: HelpCircle },
    { choice: "missing", label: "Wrong/missing case", icon: MessageSquareWarning }
  ];

  return (
    <section className="rounded-xl border border-black/10 bg-white p-4 shadow-sm" aria-label="Feedback">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Was this clear?</h2>
          <p className="mt-1 text-sm text-muted-foreground">This stays local for now. It helps you track where the product still needs sharper cases.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const Icon = option.icon;
            const active = choice === option.choice;
            return (
              <Button key={option.choice} type="button" size="sm" variant={active ? "default" : "outline"} onClick={() => save(option.choice)} aria-pressed={active}>
                <Icon className="h-4 w-4" />
                {option.label}
              </Button>
            );
          })}
          <Button asChild size="sm" variant="outline">
            <a href={mailto}>Send detail</a>
          </Button>
        </div>
      </div>
      {choice ? <p className="mt-3 text-sm font-medium text-cyan-900">Saved locally: {labelFor(choice)}.</p> : null}
    </section>
  );
}
