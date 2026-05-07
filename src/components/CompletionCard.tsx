"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type CompletionCardProps = {
  completed: boolean;
  title: string;
  learned: string;
  realWorld: string;
  challenge: string;
  nextHref: string;
  nextTitle: string;
};

export function CompletionCard({ completed, title, learned, realWorld, challenge, nextHref, nextTitle }: CompletionCardProps) {
  return (
    <Card className={completed ? "border-emerald-200 bg-emerald-50" : "border-cyan-100 bg-white"}>
      <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
            {completed ? <CheckCircle2 className="h-4 w-4" /> : <Target className="h-4 w-4 text-cyan-700" />}
            {completed ? "Case complete" : "Finish this case to lock the concept"}
          </div>
          <h3 className="mt-2 text-lg font-semibold">{completed ? `You now understand: ${title}` : `Completion goal: ${title}`}</h3>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <div className="rounded-lg bg-white/80 p-3 text-sm"><span className="font-semibold">Concept:</span> {learned}</div>
            <div className="rounded-lg bg-white/80 p-3 text-sm"><span className="font-semibold">Real bug:</span> {realWorld}</div>
            <div className="rounded-lg bg-white/80 p-3 text-sm"><span className="font-semibold">Mini challenge:</span> {challenge}</div>
          </div>
        </div>
        <Button asChild>
          <Link href={nextHref}>
            Next: {nextTitle}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
