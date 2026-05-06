"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Explanation, VisualEvent } from "@/engine/types";

function output(events: VisualEvent[]) {
  return events.filter((event) => event.type === "console").map((event) => ("value" in event ? event.value : ""));
}

export function CompareMode({
  defaultEvents,
  currentEvents,
  defaultExplanation,
  currentExplanation
}: {
  defaultEvents: VisualEvent[];
  currentEvents: VisualEvent[];
  defaultExplanation: Explanation;
  currentExplanation: Explanation;
}) {
  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-base">Compare original vs modified</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 md:grid-cols-2">
        <div className="rounded-md border bg-background p-3">
          <h3 className="mb-2 font-semibold">Default behavior</h3>
          <p className="text-sm text-muted-foreground">Output: {output(defaultEvents).join(" -> ") || "none"}</p>
          <p className="text-sm text-muted-foreground">Timeline steps: {defaultEvents.length}</p>
          <p className="mt-2 text-sm leading-6">{defaultExplanation.summary}</p>
        </div>
        <div className="rounded-md border bg-background p-3">
          <h3 className="mb-2 font-semibold">Modified behavior</h3>
          <p className="text-sm text-muted-foreground">Output: {output(currentEvents).join(" -> ") || "none"}</p>
          <p className="text-sm text-muted-foreground">Timeline steps: {currentEvents.length}</p>
          <p className="mt-2 text-sm leading-6">{currentExplanation.summary}</p>
        </div>
      </CardContent>
    </Card>
  );
}
