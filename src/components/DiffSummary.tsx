"use client";

import { GitCompare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DiffSummary as DiffSummaryType } from "@/editable/types";

export function DiffSummary({ summary }: { summary: DiffSummaryType }) {
  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <GitCompare className="h-4 w-4 text-teal-700" />
          What changed?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 text-sm leading-6">
        {summary.changes.length > 0 ? (
          <ul className="space-y-1">
            {summary.changes.map((change) => (
              <li key={change}>- {change}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">You are viewing the default version.</p>
        )}
        <div className="rounded-md bg-teal-50 px-3 py-2 text-teal-950">
          <span className="font-semibold">Effect: </span>
          {summary.effect}
        </div>
      </CardContent>
    </Card>
  );
}
