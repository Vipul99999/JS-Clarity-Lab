"use client";

import Link from "next/link";
import { Activity, Bookmark, Brain, ClipboardList, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDebugNotes } from "@/lib/debugNotes";
import { useLearningProgress } from "@/lib/learningProgress";
import { getWeakAreas } from "@/lib/learningRecommendations";
import { useSavedCases } from "@/lib/savedCases";

export function ProductAnalyticsPanel() {
  const { records, completed, resetProgress } = useLearningProgress();
  const { saved } = useSavedCases();
  const { notes, clearNotes } = useDebugNotes();
  const mostOpened = [...records].sort((a, b) => (b.openedCount ?? 0) - (a.openedCount ?? 0)).slice(0, 4);
  const weakAreas = getWeakAreas(records).slice(0, 4);

  return (
    <Card className="border-cyan-100 bg-white/95">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-800">
              <Activity className="h-4 w-4" />
              Privacy-safe local analytics
            </div>
            <p className="mt-1 text-sm text-muted-foreground">These signals stay on this device. No backend, no tracking account, no pasted-code upload.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {records.length ? (
              <Button size="sm" variant="outline" onClick={resetProgress}>
                <RotateCcw className="h-4 w-4" />
                Reset progress
              </Button>
            ) : null}
            {notes.length ? (
              <Button size="sm" variant="outline" onClick={clearNotes}>
                Clear notes
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-lg bg-cyan-50 px-3 py-3 text-cyan-950">
            <Brain className="h-4 w-4" />
            <div className="mt-2 text-2xl font-semibold">{completed.length}</div>
            <div className="text-xs font-medium">completed concepts</div>
          </div>
          <div className="rounded-lg bg-amber-50 px-3 py-3 text-amber-950">
            <Activity className="h-4 w-4" />
            <div className="mt-2 text-2xl font-semibold">{weakAreas.length}</div>
            <div className="text-xs font-medium">weak areas</div>
          </div>
          <div className="rounded-lg bg-emerald-50 px-3 py-3 text-emerald-950">
            <Bookmark className="h-4 w-4" />
            <div className="mt-2 text-2xl font-semibold">{saved.length}</div>
            <div className="text-xs font-medium">saved cases</div>
          </div>
          <div className="rounded-lg bg-slate-100 px-3 py-3 text-slate-950">
            <ClipboardList className="h-4 w-4" />
            <div className="mt-2 text-2xl font-semibold">{notes.length}</div>
            <div className="text-xs font-medium">saved debug notes</div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold">Most opened</h3>
            <div className="mt-2 space-y-2">
              {mostOpened.length ? mostOpened.map((item) => (
                <Link href={item.href} key={`${item.type}-${item.id}`} className="block rounded-md bg-slate-50 px-3 py-2 text-sm hover:bg-cyan-50">
                  <span className="font-semibold">{item.title}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{item.openedCount ?? 1} opens</span>
                </Link>
              )) : <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-muted-foreground">Open a case to start seeing signals.</p>}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Weak concepts</h3>
            <div className="mt-2 space-y-2">
              {weakAreas.length ? weakAreas.map((area) => (
                <div key={area.category} className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-950">
                  <span className="font-semibold">{area.category}</span>
                  <div className="text-xs opacity-75">Opened but not completed yet.</div>
                </div>
              )) : <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-muted-foreground">No weak area yet.</p>}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Saved debug notes</h3>
            <div className="mt-2 space-y-2">
              {notes.length ? notes.slice(0, 3).map((note) => (
                <Link href={note.href} key={note.id} className="block rounded-md bg-slate-50 px-3 py-2 text-sm hover:bg-cyan-50">
                  <span className="font-semibold">{note.title}</span>
                  <div className="truncate text-xs text-muted-foreground">{note.body}</div>
                </Link>
              )) : <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-muted-foreground">Save analyzer or Node fix notes to see them here.</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
