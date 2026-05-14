import type { Metadata } from "next";
import { FeedbackPrompt } from "@/components/FeedbackPrompt";
import { LazyNodePlayground } from "@/components/LazyNodePlayground";

export const metadata: Metadata = {
  title: "Node.js Runtime Visual Playground",
  description:
    "Explore Node.js event loop priority, process.nextTick, promises, timers, setImmediate, I/O, thread pool pressure, streams, memory leaks, performance, and production fixes.",
  alternates: {
    canonical: "/node-playground"
  },
  openGraph: {
    title: "Node.js Runtime Visual Playground | JS Clarity Lab",
    description:
      "A scenario-driven Node.js visual lab for queue priority, thread pool behavior, streams, backpressure, memory, HTTP lifecycle, debugging, and fixed-code comparisons.",
    url: "/node-playground",
    type: "website"
  }
};

export default function NodePlaygroundPage() {
  return (
    <>
      <LazyNodePlayground />
      <section className="px-3 pb-6">
        <FeedbackPrompt pageId="node-playground" context="Node Runtime Lab" />
      </section>
    </>
  );
}
