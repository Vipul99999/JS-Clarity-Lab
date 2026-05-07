"use client";

import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";
import { getCoverageSummary, runtimeCoverage, type CoverageStatus } from "@/product/coverage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tone: Record<CoverageStatus, string> = {
  "fully visualized": "bg-emerald-50 text-emerald-950 border-emerald-200",
  "partially visualized": "bg-cyan-50 text-cyan-950 border-cyan-200",
  "detected only": "bg-amber-50 text-amber-950 border-amber-200",
  unsupported: "bg-rose-50 text-rose-950 border-rose-200"
};

export function RuntimeCoverageMatrix() {
  const summary = getCoverageSummary();

  return (
    <Card className="border-cyan-100">
      <CardHeader className="border-b pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-cyan-700" />
            Runtime coverage matrix
          </CardTitle>
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-950">
            Coverage score {summary.percent}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4 grid gap-2 sm:grid-cols-4">
          {Object.entries(summary.counts).map(([status, count]) => (
            <div key={status} className={`rounded-lg border px-3 py-2 text-sm ${tone[status as CoverageStatus]}`}>
              <div className="text-xs font-semibold uppercase tracking-wide">{status}</div>
              <div className="mt-1 text-lg font-semibold">{count}</div>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm" aria-label="Runtime support coverage matrix">
            <caption className="sr-only">Runtime coverage by area, support status, limits, and best entry point.</caption>
            <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Area</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Supported</th>
                <th className="px-3 py-2">Limits</th>
                <th className="px-3 py-2">Best entry</th>
              </tr>
            </thead>
            <tbody>
              {runtimeCoverage.map((item) => (
                <tr key={item.area} className="border-b last:border-b-0">
                  <td className="px-3 py-3 font-semibold">{item.area}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${tone[item.status]}`}>{item.status}</span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{item.supported}</td>
                  <td className="px-3 py-3 text-muted-foreground">{item.limits}</td>
                  <td className="px-3 py-3">
                    <Link href={item.href} className="inline-flex items-center gap-2 font-semibold text-cyan-800">
                      {item.bestEntry}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
