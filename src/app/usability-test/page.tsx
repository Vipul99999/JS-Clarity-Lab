import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList, Eye, TimerReset } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "5-User Usability Test Kit",
  description: "A practical 5-user test script for validating JS Clarity Lab onboarding, analyzer clarity, Node debugging, and saved debug notes.",
  robots: {
    index: false,
    follow: false
  }
};

const tasks = [
  {
    title: "Why does this output happen?",
    target: "/demo/promise-before-timeout",
    success: "User predicts or understands A, D, C, B without needing extra explanation.",
    watch: "Do they notice Predict, Run, console output, and the short answer?"
  },
  {
    title: "Find why this API is slow.",
    target: "/node-playground?scenario=express-slow-route&mode=problem",
    success: "User identifies blocking/sequential work and opens the fixed version or notes.",
    watch: "Do they know where to inspect blocked time, output difference, and fix notes?"
  },
  {
    title: "Save debug notes for this issue.",
    target: "/analyze",
    success: "User analyzes code, understands the risk, saves/copies notes, and finds the Notes workspace.",
    watch: "Do they understand the confidence badge and limitations without feeling blocked?"
  }
];

const observerChecks = [
  "Can the user choose a symptom without reading the whole page?",
  "Can they explain what the visualizer is showing?",
  "Can they find the next action after a case finishes?",
  "Can they tell what is simulated versus only detected?",
  "Can they leave with a fix note they would use in a real app?"
];

export default function UsabilityTestPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-white/10 bg-[#101217] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">Product validation</p>
          <h1 className="mt-2 max-w-4xl text-4xl font-semibold tracking-normal md:text-5xl">5-user usability test kit</h1>
          <p className="mt-3 max-w-3xl leading-7 text-white/72">
            Run this before adding backend or bigger features. The goal is to find where users hesitate, not to prove the product is perfect.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/demo/promise-before-timeout">
                Start task 1
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/notes">Open notes workspace</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 md:px-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="grid gap-4">
          {tasks.map((task, index) => (
            <Card key={task.title} className="border-black/10">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Task {index + 1}</div>
                    <h2 className="mt-1 text-2xl font-semibold">{task.title}</h2>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={task.target}>
                      Open task
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg bg-cyan-50 p-3 text-sm leading-6 text-cyan-950">
                    <div className="flex items-center gap-2 font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      Success signal
                    </div>
                    <p className="mt-1">{task.success}</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-950">
                    <div className="flex items-center gap-2 font-semibold">
                      <Eye className="h-4 w-4" />
                      Watch hesitation
                    </div>
                    <p className="mt-1">{task.watch}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <aside className="grid gap-4">
          <Card className="border-black/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <TimerReset className="h-5 w-5 text-cyan-700" />
                <h2 className="text-xl font-semibold">How to run it</h2>
              </div>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                <li>1. Give no product tour first. Ask the user to think aloud.</li>
                <li>2. Time each task. Mark every pause longer than five seconds.</li>
                <li>3. Ask: “What did you expect to happen next?” after each pause.</li>
                <li>4. Score clarity: clear, still confused, wrong/missing case.</li>
                <li>5. Fix the top two repeated hesitations before adding features.</li>
              </ol>
            </CardContent>
          </Card>
          <Card className="border-black/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-cyan-700" />
                <h2 className="text-xl font-semibold">Observer checklist</h2>
              </div>
              <div className="mt-4 space-y-2">
                {observerChecks.map((item) => (
                  <div key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-sm leading-6">
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}
