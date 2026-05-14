import Link from "next/link";
import { ArrowRight, Bug, Gauge, Play, Sparkles } from "lucide-react";

const lanes = [
  { label: "Stack", color: "from-slate-600 to-slate-950", items: ["global"] },
  { label: "Microtasks", color: "from-violet-500 to-fuchsia-500", items: ["Promise.then"] },
  { label: "Timers", color: "from-amber-400 to-orange-500", items: ["setTimeout"] },
  { label: "Console", color: "from-lime-300 to-emerald-500", items: ["A", "D", "C", "B"] }
];

const previews = [
  {
    title: "Confusing output",
    href: "/demo/promise-before-timeout",
    icon: Sparkles,
    outcome: "See why Promise output beats a 0ms timer."
  },
  {
    title: "Slow API",
    href: "/node-playground?scenario=express-slow-route&mode=problem",
    icon: Gauge,
    outcome: "Compare blocked time and the fixed route."
  },
  {
    title: "Bug notes",
    href: "/notes",
    icon: Bug,
    outcome: "Save the risk, proof, and fix pattern."
  }
];

export function PremiumProductPreview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6" aria-labelledby="proof-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Animated product proof</p>
          <h2 id="proof-title" className="mt-1 text-3xl font-semibold tracking-normal">
            See the product before you commit to a path.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            These previews mirror the actual workflow: code, runtime movement, console proof, and a practical fix note.
          </p>
        </div>
        <Link href="/demo/promise-before-timeout" className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5">
          Watch first case
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-xl border border-black/10 bg-[#101217] shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Play className="h-4 w-4 text-cyan-200" />
              Promise vs Timer preview
            </div>
            <span className="rounded-full bg-cyan-200 px-3 py-1 text-xs font-semibold text-[#101217]">A {"->"} D {"->"} C {"->"} B</span>
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-lg border border-white/10 bg-black/30 p-4">
              <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-white/50">
                <span>Code</span>
                <span className="rounded bg-cyan-200/15 px-2 py-1 text-cyan-100">line 3 active</span>
              </div>
              <pre className="overflow-hidden text-sm leading-7 text-cyan-100">
                <span className="text-white/55">1 </span>{"console.log(\"A\")"}{"\n"}
                <span className="text-white/55">2 </span>{"\n"}
                <span className="rounded bg-cyan-300/20 px-1 text-white"><span className="text-white/55">3 </span>{"setTimeout(() => console.log(\"B\"), 0)"}</span>{"\n"}
                <span className="text-white/55">4 </span>{"Promise.resolve().then(() => console.log(\"C\"))"}{"\n"}
                <span className="text-white/55">5 </span>{"console.log(\"D\")"}
              </pre>
            </div>
            <div className="grid gap-3">
              {lanes.map((lane, index) => (
                <div key={lane.label} className="rounded-lg border border-white/10 bg-white/[0.06] p-3">
                  <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-white/55">
                    <span>{lane.label}</span>
                    <span>{lane.items.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lane.items.map((item, itemIndex) => (
                      <span
                        key={item}
                        className={`inline-flex min-h-8 items-center rounded-md bg-gradient-to-r px-3 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)] ${lane.color}`}
                        style={{ animation: `previewPulse 2.4s ease-in-out ${index * 0.18 + itemIndex * 0.12}s infinite` }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {previews.map((preview) => {
            const Icon = preview.icon;
            return (
              <Link href={preview.href} key={preview.title}>
                <div className="group rounded-xl border border-black/10 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-1 hover:border-primary">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-800">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold">{preview.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{preview.outcome}</p>
                      <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-cyan-800">
                        Open preview
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
