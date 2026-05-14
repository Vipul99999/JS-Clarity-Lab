import type { Metadata } from "next";
import { DebugNotesWorkspace } from "@/components/DebugNotesWorkspace";

export const metadata: Metadata = {
  title: "My Debug Notes",
  description: "Review locally saved JavaScript and Node.js debugging notes, copy fix patterns, and continue investigations without a backend.",
  alternates: { canonical: "/notes" },
  robots: { index: false, follow: true }
};

export default function NotesPage() {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#101217] text-white">
        <div className="lab-grid absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">My Debug Notes</p>
          <h1 className="mt-2 max-w-4xl text-4xl font-semibold tracking-normal md:text-6xl">Your local runtime notebook.</h1>
          <p className="mt-3 max-w-3xl leading-7 text-white/72">Notes stay on this device. Use them for PRs, lessons, issue writeups, and debugging checklists.</p>
        </div>
      </section>
      <DebugNotesWorkspace />
    </main>
  );
}
