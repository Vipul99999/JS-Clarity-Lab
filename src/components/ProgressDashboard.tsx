"use client";

import Link from "next/link";
import { ArrowRight, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { demos, editableDemos } from "@/demos";
import { nodeScenarios } from "@/nodePlayground/scenarios";
import { useLearningProgress } from "@/lib/learningProgress";
import { getRecommendedNext, getWeakAreas } from "@/lib/learningRecommendations";
import { getConceptMastery } from "@/lib/conceptMastery";

const totalItems = demos.length + editableDemos.length + nodeScenarios.length;

export function ProgressDashboard() {
  const { records, completed, resetProgress } = useLearningProgress();
  const last = records[0];
  const percent = Math.round((completed.length / totalItems) * 100);
  const weakAreas = getWeakAreas(records);
  const recommended = getRecommendedNext(records);
  const mastery = getConceptMastery(records);

  return (
    <Card className="border-cyan-100 bg-white/95">
      <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-800">
            <Trophy className="h-4 w-4" />
            Your clarity progress
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-cyan-600" style={{ width: `${percent}%` }} />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {completed.length} completed out of {totalItems} total cases. Progress stays on this device, no login needed.
          </div>
          {last ? (
            <div className="mt-3 rounded-lg bg-cyan-50 px-3 py-2 text-sm text-cyan-950">
              Continue: <span className="font-semibold">{last.title}</span>
            </div>
          ) : (
            <div className="mt-3 rounded-lg bg-cyan-50 px-3 py-2 text-sm text-cyan-950">
              Start with one case and the app will remember where you left off.
            </div>
          )}
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-950">
              Recommended next: <Link className="font-semibold underline decoration-emerald-300 underline-offset-2" href={recommended.href}>{recommended.title}</Link>
              <div className="text-xs opacity-75">{recommended.reason}</div>
            </div>
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">
              Weak areas: <span className="font-semibold">{weakAreas.length ? weakAreas.map((area) => area.category).join(", ") : "none yet"}</span>
              <div className="text-xs opacity-75">Based on cases you opened but have not completed.</div>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-black/10 bg-white p-3">
            <div className="text-sm font-semibold text-slate-950">Concept mastery map</div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {mastery.map((item) => (
                <div key={item.concept} className="rounded-md bg-slate-50 px-2 py-2">
                  <div className="text-xs font-semibold text-slate-700">{item.concept}</div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-cyan-600" style={{ width: `${Math.min(100, item.completed * 20)}%` }} />
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{item.level} - {item.completed}/{item.touched || 0}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href={last?.href ?? "/start"}>
              {last ? "Continue" : "Start here"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {records.length ? (
            <Button size="sm" variant="outline" onClick={resetProgress}>
              <RotateCcw className="h-4 w-4" />
              Reset progress
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
