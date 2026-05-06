import Link from "next/link";
import { ArrowRight, Gauge, RefreshCcw, ShieldAlert, TimerReset } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const problems = [
  {
    icon: TimerReset,
    title: "Output order is surprising",
    body: "Promises, timers, and async callbacks are not running in source order.",
    href: "/demo/promise-before-timeout"
  },
  {
    icon: RefreshCcw,
    title: "Async work finishes too early",
    body: "A save, loop, test, or route continues before the real work is done.",
    href: "/demo/async-foreach-issue"
  },
  {
    icon: ShieldAlert,
    title: "Memory or polling keeps growing",
    body: "Intervals or listeners keep state alive after UI changes.",
    href: "/demo/interval-leak"
  },
  {
    icon: Gauge,
    title: "UI feels blocked or slow",
    body: "Microtasks, heavy loops, or sequential awaits delay responsiveness.",
    href: "/demo/sequential-await"
  }
];

export function ProblemNavigator() {
  return (
    <section className="border-b border-black/10 bg-[#faf7ec]/80">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-3">
          <h2 className="text-xl font-semibold">Start from the bug you actually see</h2>
          <p className="mt-1 text-sm text-muted-foreground">This keeps the lab practical: symptom first, concept second.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {problems.map((problem) => {
            const Icon = problem.icon;
            return (
              <Link key={problem.title} href={problem.href}>
                <Card className="h-full transition-all hover:-translate-y-1 hover:border-primary hover:bg-white">
                  <CardContent className="flex h-full flex-col gap-3 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <Icon className="h-5 w-5 text-teal-700" />
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{problem.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{problem.body}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
