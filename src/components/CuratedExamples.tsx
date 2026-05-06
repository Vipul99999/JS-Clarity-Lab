"use client";

import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyzerExamples } from "@/analyzer/examples";

export function CuratedExamples({ onPick }: { onPick: (code: string) => void }) {
  return (
    <section className="rounded-lg border bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-teal-700" />
        <h2 className="text-base font-semibold">Curated real-world examples</h2>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {analyzerExamples.map((example) => (
          <button
            key={example.title}
            onClick={() => onPick(example.code)}
            className="rounded-md border bg-background p-3 text-left transition-colors hover:border-primary hover:bg-teal-50"
          >
            <div className="font-semibold">{example.title}</div>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{example.context}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
