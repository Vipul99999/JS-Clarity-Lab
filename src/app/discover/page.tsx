import type { Metadata } from "next";
import { DiscoveryHub } from "@/components/DiscoveryHub";

export const metadata: Metadata = {
  title: "Discover JavaScript and Node.js Runtime Cases",
  description:
    "Search by symptom, topic, difficulty, or real-world bug across guided JavaScript demos, editable variations, analyzer routes, and Node.js runtime scenarios.",
  alternates: {
    canonical: "/discover"
  },
  openGraph: {
    title: "Discover JavaScript and Node.js Runtime Cases | JS Clarity Lab",
    description:
      "Find the right visual case for async output confusion, slow APIs, memory growth, Node runtime queues, streams, testing, and debugging.",
    url: "/discover",
    type: "website"
  }
};

export default function DiscoverPage() {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#101217] text-white">
        <div className="lab-grid absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">Find Cases</p>
          <h1 className="mt-2 max-w-4xl text-4xl font-semibold tracking-normal md:text-6xl">
            Find the exact JavaScript confusion you are trying to solve.
          </h1>
          <p className="mt-3 max-w-3xl leading-7 text-white/72">
            Search by symptom, topic, difficulty, or real-world problem across guided demos, editable variations, and Node runtime cases.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <DiscoveryHub />
      </section>
    </main>
  );
}
