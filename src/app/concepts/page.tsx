import type { Metadata } from "next";
import { ConceptAtlas } from "@/components/ConceptAtlas";

export const metadata: Metadata = {
  title: "JavaScript Runtime Concept Atlas",
  description:
    "Break down JavaScript and Node.js runtime concepts with mental models, common wrong assumptions, real-world signals, debug questions, and visual practice cases.",
  alternates: {
    canonical: "/concepts"
  },
  openGraph: {
    title: "JavaScript Runtime Concept Atlas | JS Clarity Lab",
    description:
      "Learn async ordering, promises, Node event loop, streams, memory, performance, security, testing, and debugging through visual cases.",
    url: "/concepts",
    type: "website"
  }
};

export default function ConceptsPage() {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#101217] text-white">
        <div className="lab-grid absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">Concept Atlas</p>
          <h1 className="mt-2 max-w-4xl text-4xl font-semibold tracking-normal md:text-6xl">
            Break down the runtime concept behind the bug.
          </h1>
          <p className="mt-3 max-w-3xl leading-7 text-white/72">
            Each concept explains the mental model, common wrong assumption, real-world signals, debug questions, and the exact visual cases to practice.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <ConceptAtlas />
      </section>
    </main>
  );
}
