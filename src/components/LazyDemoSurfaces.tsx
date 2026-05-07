"use client";

import dynamic from "next/dynamic";
import type { Demo } from "@/engine/types";

const EditableDemoPageClient = dynamic(() => import("@/components/EditableDemoPageClient").then((mod) => mod.EditableDemoPageClient), {
  ssr: false,
  loading: () => <div className="rounded-lg border bg-white p-4 text-sm text-muted-foreground">Loading editable case...</div>
});

const Visualizer = dynamic(() => import("@/components/Visualizer").then((mod) => mod.Visualizer), {
  ssr: false,
  loading: () => <div className="rounded-lg border bg-white p-4 text-sm text-muted-foreground">Loading visual timeline...</div>
});

export function LazyEditableDemoSurface({ id }: { id: string }) {
  return <EditableDemoPageClient id={id} />;
}

export function LazyVisualizerSurface({ demo }: { demo: Demo }) {
  return <Visualizer demo={demo} />;
}
