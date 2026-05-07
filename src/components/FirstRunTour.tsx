"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardCheck, Eye, ListChecks, Play, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const storageKey = "js-clarity-lab:first-run-tour:v1";

const steps = [
  { title: "Choose a symptom", body: "Start with the problem in your words: await did not wait, API is slow, memory grows, stream hangs.", icon: Search },
  { title: "Predict first", body: "Lock your guess before running. That makes confusing output turn into real understanding.", icon: ListChecks },
  { title: "Run visualization", body: "Use Run or Step to watch code move through stack, queues, timers, I/O, streams, or memory.", icon: Play },
  { title: "Inspect output", body: "Compare the console, active line, queues, trace diagnosis, and explanation.", icon: Eye },
  { title: "Copy fix notes", body: "When it looks like a real bug, copy concise notes for an issue, PR, lesson, or team chat.", icon: ClipboardCheck }
];

export function FirstRunTour() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;
    try {
      setOpen(window.localStorage.getItem(storageKey) !== "done");
    } catch {
      setOpen(false);
    }
  }, [pathname]);

  function close() {
    try {
      window.localStorage.setItem(storageKey, "done");
    } catch {
      // Ignore storage failures; closing the overlay still matters.
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 p-4" role="dialog" aria-modal="true" aria-labelledby="first-run-title">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-2xl border border-white/10 bg-white p-5 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Start here</p>
            <h2 id="first-run-title" className="mt-1 text-2xl font-semibold">Understand confusing JavaScript in five moves.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">This product does not execute arbitrary code. It gives fast, visual clarity for supported async and Node runtime patterns.</p>
          </div>
          <Button variant="outline" size="sm" onClick={close} aria-label="Close first-run tour">Skip</Button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-xl border border-black/10 bg-slate-50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-100 text-cyan-900">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step {index + 1}</div>
                <h3 className="mt-1 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.body}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild onClick={close}>
            <Link href="/discover">Choose a symptom</Link>
          </Button>
          <Button asChild variant="outline" onClick={close}>
            <Link href="/demo/promise-before-timeout">Start with Promise vs Timer</Link>
          </Button>
          <Button asChild variant="outline" onClick={close}>
            <Link href="/analyze">Analyze code</Link>
          </Button>
          <Button variant="ghost" onClick={close}>
            <CheckCircle2 className="h-4 w-4" />
            I understand
          </Button>
        </div>
      </div>
    </div>
  );
}
