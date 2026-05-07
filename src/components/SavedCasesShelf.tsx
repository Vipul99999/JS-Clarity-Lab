"use client";

import Link from "next/link";
import { Bookmark, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSavedCases } from "@/lib/savedCases";

export function SavedCasesShelf() {
  const { saved, remove } = useSavedCases();
  if (!saved.length) return null;

  return (
    <Card className="border-cyan-100 bg-cyan-50">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-cyan-950">
          <Bookmark className="h-4 w-4 fill-current" />
          Saved cases
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {saved.slice(0, 12).map((item) => (
            <Link
              href={item.href}
              key={`${item.type}-${item.id}`}
              className="group flex min-w-[220px] items-start justify-between gap-3 rounded-lg border border-cyan-100 bg-white px-3 py-2 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:border-cyan-400"
            >
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-cyan-700">{item.category}</span>
                <span className="mt-1 block font-semibold text-slate-950">{item.title}</span>
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 shrink-0 opacity-70 group-hover:opacity-100"
                onClick={(event) => {
                  event.preventDefault();
                  remove(item);
                }}
                aria-label={`Remove ${item.title}`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
