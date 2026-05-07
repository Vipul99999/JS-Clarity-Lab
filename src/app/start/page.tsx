import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Code2, Gauge, MemoryStick, Server, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { universalFlow } from "@/product/architecture";

export const metadata: Metadata = {
  title: "Start Learning JavaScript Async Behavior",
  description:
    "A beginner-friendly path through confusing JavaScript output, await mistakes, async forEach, slow APIs, memory growth, and Node.js runtime behavior.",
  alternates: {
    canonical: "/start"
  },
  openGraph: {
    title: "Start Learning JavaScript Async Behavior | JS Clarity Lab",
    description:
      "Follow a clear path: concept, predict, run, inspect, and fix real JavaScript and Node.js runtime problems.",
    url: "/start",
    type: "website"
  }
};

const path = [
  {
    title: "Why did this print first?",
    body: "Start with the most common async confusion: promises before timers.",
    href: "/demo/promise-before-timeout",
    icon: Sparkles,
    level: "Beginner"
  },
  {
    title: "Why did await not wait?",
    body: "See how missing await lets later code continue before async work finishes.",
    href: "/demo/missing-await",
    icon: Code2,
    level: "Beginner"
  },
  {
    title: "Why does async forEach finish too early?",
    body: "Understand a real bug that appears in saves, imports, and batch jobs.",
    href: "/demo/async-foreach-issue",
    icon: CheckCircle2,
    level: "Intermediate"
  },
  {
    title: "Why is my API slow?",
    body: "Compare sequential waits with parallel work.",
    href: "/demo/sequential-await",
    icon: Gauge,
    level: "Intermediate"
  },
  {
    title: "Why is memory growing?",
    body: "Learn the interval/listener/cache pattern behind many production leaks.",
    href: "/demo/interval-leak",
    icon: MemoryStick,
    level: "Advanced"
  },
  {
    title: "How does Node run this?",
    body: "Enter the advanced Node Runtime Lab after the browser async model feels clear.",
    href: "/node-playground?scenario=node-queue-priority&mode=problem",
    icon: Server,
    level: "Advanced"
  }
];

export default function StartPage() {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#111318] text-white">
        <div className="lab-grid absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">Start Here</p>
          <h1 className="mt-2 max-w-4xl text-4xl font-semibold tracking-normal md:text-6xl">
            A calm path from confused to clear.
          </h1>
          <p className="mt-3 max-w-3xl leading-7 text-white/72">
            Follow this order if you are new, stuck, or unsure what to open first. Each step uses the same flow: concept, predict, run, inspect, fix.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <Card className="mb-5 border-cyan-100 bg-cyan-50">
          <CardContent className="p-4">
            <div className="text-sm font-semibold text-cyan-950">The flow stays the same everywhere</div>
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {universalFlow.map((step, index) => (
                <div key={step} className="inline-flex shrink-0 items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-cyan-950">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-200 text-xs">{index + 1}</span>
                  {step}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-3">
          {path.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} key={item.title}>
                <Card className="transition-all hover:-translate-y-1 hover:border-primary hover:bg-white">
                  <CardContent className="grid gap-4 p-4 md:grid-cols-[48px_1fr_auto] md:items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-50 text-cyan-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Step {index + 1} - {item.level}
                      </div>
                      <h2 className="mt-1 text-xl font-semibold">{item.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
                    </div>
                    <ArrowRight className="hidden h-5 w-5 text-muted-foreground md:block" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
