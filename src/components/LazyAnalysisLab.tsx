"use client";

import dynamic from "next/dynamic";

export const LazyAnalysisLab = dynamic(() => import("@/components/AnalysisLab").then((mod) => mod.AnalysisLab), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
      <div className="rounded-xl border bg-white p-5 text-sm text-muted-foreground shadow-sm">Loading analyzer workspace...</div>
    </div>
  )
});
