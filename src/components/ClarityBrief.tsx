"use client";

import { BadgeCheck, MapPinned, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Demo } from "@/engine/types";

function correctAnswer(demo: Demo) {
  const correct = demo.prediction.correct;
  return Array.isArray(correct) ? correct.join(" -> ") : correct;
}

export function ClarityBrief({ demo, revealed }: { demo: Demo; revealed: boolean }) {
  return (
    <Card className="border-teal-200 bg-white">
      <CardContent className="grid gap-3 p-4 md:grid-cols-3">
        <div className="rounded-md bg-teal-50 px-3 py-2">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-teal-900">
            <Target className="h-4 w-4" />
            Confusing case
          </div>
          <p className="text-sm leading-6">{demo.concept}</p>
        </div>
        <div className="rounded-md bg-secondary px-3 py-2">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <BadgeCheck className="h-4 w-4" />
            Fast answer
          </div>
          <p className="text-sm leading-6">{revealed ? correctAnswer(demo) : "Lock your prediction to reveal the answer."}</p>
        </div>
        <div className="rounded-md bg-accent px-3 py-2">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <MapPinned className="h-4 w-4" />
            Real life
          </div>
          <p className="text-sm leading-6">{demo.explanation.realWorld}</p>
        </div>
      </CardContent>
    </Card>
  );
}
