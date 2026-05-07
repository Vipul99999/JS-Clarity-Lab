import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, ShieldCheck, Sparkles, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Why JS Clarity Lab Exists",
  description:
    "Why JS Clarity Lab focuses on confusing JavaScript and Node.js runtime behavior through prediction, visual execution, real-world fixes, and honest limitations.",
  alternates: {
    canonical: "/why"
  },
  openGraph: {
    title: "Why JS Clarity Lab Exists",
    description:
      "A product manifesto for visual JavaScript async learning, Node runtime clarity, safe analysis, and real-world debugging value.",
    url: "/why",
    type: "article"
  }
};

const reasons = [
  {
    title: "Developers do not need more vague async theory",
    body: "They need to see why their actual output happened and what to change next.",
    icon: Target
  },
  {
    title: "Prediction creates real understanding",
    body: "When users predict first, the visual result exposes the exact mental model gap.",
    icon: Sparkles
  },
  {
    title: "Runtime behavior should be visible",
    body: "Queues, timers, promises, streams, thread pool work, and memory retention become easier when users can inspect the moving parts.",
    icon: Eye
  },
  {
    title: "Trust matters more than magic",
    body: "The analyzer is honest: fully simulated, partially simulated, detected only, or unsupported. It never executes pasted code.",
    icon: ShieldCheck
  }
];

export default function WhyPage() {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#101217] text-white">
        <div className="lab-grid absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">Why this exists</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-normal md:text-6xl">
            JavaScript runtime confusion should not stay invisible.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/74 md:text-lg">
            JS Clarity Lab exists for the moment when a developer sees weird output, a late timer, an early success message, a slow API, or growing memory and needs a clear visual answer fast.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/start" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan-200 px-4 py-2 text-sm font-semibold text-[#101217] transition-all hover:-translate-y-0.5 hover:bg-cyan-100">
              Start learning path
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/analyze" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/14 bg-white/[0.07] px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/[0.12]">
              Analyze code
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 md:px-6 lg:grid-cols-4">
        {reasons.map((reason) => {
          const Icon = reason.icon;
          return (
            <Card key={reason.title} className="h-full">
              <CardContent className="p-5">
                <Icon className="h-5 w-5 text-cyan-700" />
                <h2 className="mt-4 font-semibold">{reason.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{reason.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-12 md:px-6">
        <Card className="border-cyan-100 bg-cyan-50">
          <CardContent className="p-5">
            <h2 className="text-2xl font-semibold text-cyan-950">The product promise</h2>
            <p className="mt-3 text-lg font-medium leading-8 text-cyan-950">
              Change the situation, predict the result, see the timeline, and understand why it happened.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
