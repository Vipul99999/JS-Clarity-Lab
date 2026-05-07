"use client";

import dynamic from "next/dynamic";

export const LazyNodePlayground = dynamic(() => import("@/components/NodePlayground").then((mod) => mod.NodePlayground), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen bg-slate-100 p-4">
      <div className="rounded-xl border bg-white p-5 text-sm text-muted-foreground shadow-sm">Loading Node Runtime Lab...</div>
    </main>
  )
});
