"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type WhatAmISeeingProps = {
  title?: string;
  variant?: "button" | "link";
};

export function WhatAmISeeing({ title = "What am I seeing?", variant = "button" }: WhatAmISeeingProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "link" ? (
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-900">
          <HelpCircle className="h-4 w-4" />
          {title}
        </button>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <HelpCircle className="h-4 w-4" />
          {title}
        </Button>
      )}

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-label="How to use this screen">
          <button className="absolute inset-0 cursor-default" onClick={() => setOpen(false)} aria-label="Close help overlay" />
          <div className="relative w-full max-w-2xl rounded-xl border bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
              <div>
                <h2 className="font-semibold">How to use this screen</h2>
                <p className="text-sm text-muted-foreground">One loop: read, predict, run, inspect, then compare the fix.</p>
              </div>
              <button onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-md border border-black/10 px-3 py-2 text-sm font-semibold hover:bg-slate-100" aria-label="Close help">
                <X className="h-4 w-4" />
                Close
              </button>
            </div>
            <div className="grid gap-3 p-4 text-sm leading-6 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="font-semibold">Left side</div>
                <p>Read the code. In playground screens you can edit it, but the visualization is still a safe curated simulation.</p>
              </div>
              <div className="rounded-lg bg-cyan-50 p-3 text-cyan-950">
                <div className="font-semibold">Right side</div>
                <p>Watch what is happening: output, timeline, queues, workers, memory, or debug state depending on the mode.</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 text-amber-950">
                <div className="font-semibold">Run slowly</div>
                <p>Press Run for animation, or use step controls when you want to understand one moment at a time.</p>
              </div>
              <div className="rounded-lg bg-rose-50 p-3 text-rose-950">
                <div className="font-semibold">Open details</div>
                <p>Concept, prediction, debug data, fix notes, and limitations live below the main playground so the core view stays clean.</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
