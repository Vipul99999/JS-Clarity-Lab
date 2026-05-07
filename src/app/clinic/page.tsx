import type { Metadata } from "next";
import { RealBugClinic } from "@/components/RealBugClinic";

export const metadata: Metadata = {
  title: "Real JavaScript Bug Clinic",
  description:
    "Start from production symptoms like flaky tests, slow APIs, memory growth, frozen UI, thread pool pressure, stream failures, and async ordering bugs.",
  alternates: {
    canonical: "/clinic"
  },
  openGraph: {
    title: "Real JavaScript Bug Clinic | JS Clarity Lab",
    description:
      "Map real symptoms to visual JavaScript and Node.js cases with bad code, visual proof, fixed code, and verification notes.",
    url: "/clinic",
    type: "website"
  }
};

export default function ClinicPage() {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#101217] text-white">
        <div className="lab-grid absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">Real Bug Clinic</p>
          <h1 className="mt-2 max-w-4xl text-4xl font-semibold tracking-normal md:text-6xl">
            Start from the production symptom, not the JavaScript term.
          </h1>
          <p className="mt-3 max-w-3xl leading-7 text-white/72">
            Choose a real problem like flaky tests, slow APIs, memory growth, frozen UI, worker-pool pressure, or stream failures. Then open the visual case that teaches the fix.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <RealBugClinic />
      </section>
    </main>
  );
}
