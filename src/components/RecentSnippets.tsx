"use client";

import { History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type RecentSnippet = {
  id: string;
  title: string;
  code: string;
  confidence: string;
};

export function RecentSnippets({
  snippets,
  onPick,
  onClear
}: {
  snippets: RecentSnippet[];
  onPick: (code: string) => void;
  onClear: () => void;
}) {
  if (snippets.length === 0) return null;
  return (
    <section className="rounded-lg border bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-teal-700" />
          <h2 className="text-base font-semibold">Recent analyses</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {snippets.map((snippet) => (
          <button
            key={snippet.id}
            onClick={() => onPick(snippet.code)}
            className="rounded-md border bg-background p-3 text-left transition-colors hover:border-primary hover:bg-teal-50"
          >
            <div className="line-clamp-1 font-semibold">{snippet.title}</div>
            <div className="mt-1 text-xs font-medium text-teal-700">{snippet.confidence}</div>
            <pre className="mt-2 line-clamp-3 whitespace-pre-wrap font-mono text-xs text-muted-foreground">{snippet.code}</pre>
          </button>
        ))}
      </div>
    </section>
  );
}
