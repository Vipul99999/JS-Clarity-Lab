"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { CallStack } from "./CallStack";
import { ClarityBrief } from "./ClarityBrief";
import { CodePanel } from "./CodePanel";
import { CompletionCard } from "./CompletionCard";
import { ConsolePanel } from "./ConsolePanel";
import { ExplanationPanel } from "./ExplanationPanel";
import { PredictionCard } from "./PredictionCard";
import { QueuePanel } from "./QueuePanel";
import { TimelineControls } from "./TimelineControls";
import { TraceSummaryPanel } from "./TraceSummaryPanel";
import { WhatAmISeeing } from "./WhatAmISeeing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demos } from "@/demos";
import type { Demo } from "@/engine/types";
import { getStateAtStep } from "@/engine/getStateAtStep";
import { useVisualizerStore } from "@/store/useVisualizerStore";
import { useLearningProgress } from "@/lib/learningProgress";

export function Visualizer({ demo }: { demo: Demo }) {
  const [viewMode, setViewMode] = useState<"simple" | "visual" | "pro">("simple");
  const { step, isPlaying, speed, submitted, next, previous, reset, play, pause, setSpeed, setSubmitted } = useVisualizerStore();
  const { upsert, markComplete } = useLearningProgress();
  const max = demo.events.length;
  const nextDemo = demos[demos.findIndex((item) => item.id === demo.id) + 1] ?? demos[0];
  const state = useMemo(() => getStateAtStep(demo.events, Math.min(step, max)), [demo.events, max, step]);

  useEffect(() => {
    reset();
  }, [demo.id, reset]);

  useEffect(() => {
    upsert({
      id: demo.id,
      type: "demo",
      title: demo.title,
      href: `/demo/${demo.id}`,
      category: demo.category,
      completed: false
    });
  }, [demo.category, demo.id, demo.title, upsert]);

  useEffect(() => {
    if (submitted || step >= max) {
      markComplete({
        id: demo.id,
        type: "demo",
        title: demo.title,
        href: `/demo/${demo.id}`,
        category: demo.category
      });
    }
  }, [demo.category, demo.id, demo.title, markComplete, max, step, submitted]);

  useEffect(() => {
    if (!isPlaying) return;
    if (step >= max) {
      pause();
      return;
    }
    const timeout = window.setTimeout(() => next(max), speed);
    return () => window.clearTimeout(timeout);
  }, [isPlaying, max, next, pause, speed, step]);

  const memoryData = Object.entries(state.memory)
    .filter(([id]) => id !== "gc")
    .map(([id, value]) => ({
      id,
      holds: Math.max(1, value.retainedBy?.length ?? 0)
    }));

  return (
    <div className="space-y-4">
      <ClarityBrief demo={demo} revealed={submitted || step >= max} />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white/95 p-3 shadow-sm">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: "simple", label: "Simple Mode" },
            { id: "visual", label: "Visual Mode" },
            { id: "pro", label: "Pro Mode" }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as "simple" | "visual" | "pro")}
              className={`h-9 shrink-0 rounded-md border px-3 text-sm font-semibold ${viewMode === mode.id ? "border-cyan-300 bg-cyan-100 text-cyan-950" : "bg-white text-muted-foreground"}`}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <WhatAmISeeing />
      </div>
      <div className="rounded-lg border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-950">
        <span className="font-semibold">
          {viewMode === "simple" ? "Simple Mode:" : viewMode === "visual" ? "Visual Mode:" : "Pro Mode:"}
        </span>{" "}
        {viewMode === "simple"
          ? "Focus on code, output, and the shortest explanation."
          : viewMode === "visual"
            ? "Show the waiting work and timeline queues."
            : "Show memory, blocked time, and deeper runtime details when this case has them."}
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]">
        <CodePanel code={demo.code} currentLine={state.currentLine} />
        <div className="grid content-start gap-4">
          {viewMode === "simple" ? (
            <>
              <Card>
                <CardHeader className="border-b pb-3">
                  <CardTitle className="text-sm">What to watch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4 text-sm leading-6">
                  <p className="font-medium">{demo.explanation.summary}</p>
                  {state.activeEvent?.type === "line" && state.activeEvent.explain ? (
                    <div className="rounded-md bg-cyan-50 px-3 py-2 text-cyan-950">{state.activeEvent.explain}</div>
                  ) : null}
                </CardContent>
              </Card>
              <ConsolePanel output={state.consoleOutput} />
            </>
          ) : (
            <>
              <CallStack items={state.callStack} />
              <QueuePanel title="What is waiting next?" items={state.microtaskQueue} emptyLabel="No promise jobs waiting" helpText="If something appears here, it will usually run before timer callbacks." />
              <QueuePanel title="What timers are waiting?" items={state.timerQueue} emptyLabel="No timers waiting" helpText="Timers run only after the current stack and microtasks finish." />
              <QueuePanel title="What runtime work is pending?" items={state.webApis} emptyLabel="No runtime work" helpText="Runtime work means browser or Node-style work outside the current stack." />
            </>
          )}
        </div>
      </div>
      {viewMode !== "simple" ? <ConsolePanel output={state.consoleOutput} /> : null}
      {viewMode === "pro" && (memoryData.length > 0 || state.memory.gc || state.blockedDuration > 0 || state.elapsedTime > 0) ? (
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-sm">Memory / Performance View</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_260px]">
            <div className="space-y-2">
              {state.blockedDuration > 0 ? <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-900">Blocked main thread: {state.blockedDuration}ms</div> : null}
              {state.elapsedTime > 0 ? <div className="rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-900">Timeline wait: {state.elapsedTime}ms</div> : null}
              {Object.entries(state.memory)
                .filter(([id]) => id !== "gc")
                .map(([id, value]) => (
                  <div key={id} className="rounded-md border bg-white px-3 py-2 text-sm">
                    <div className="font-semibold">{value.label ?? id}</div>
                    <div className="text-muted-foreground">{value.size}</div>
                    {value.retainedBy?.map((reason) => <div key={reason}>Retained by: {reason}</div>)}
                    {value.released ? <div className="text-teal-700">Released</div> : null}
                  </div>
                ))}
              {state.memory.gc?.gc ? <div className="rounded-md bg-secondary px-3 py-2 text-sm">{state.memory.gc.gc}</div> : null}
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memoryData}>
                  <XAxis dataKey="id" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} width={28} />
                  <Tooltip />
                  <Bar dataKey="holds" fill="#0f766e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : null}
      {viewMode === "pro" ? <TraceSummaryPanel events={demo.events} /> : null}
      <TimelineControls
        step={Math.min(step, max)}
        max={max}
        isPlaying={isPlaying}
        speed={speed}
        onPlay={play}
        onPause={pause}
        onNext={() => next(max)}
        onPrevious={previous}
        onReset={reset}
        onSpeedChange={setSpeed}
      />
      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <PredictionCard key={demo.id} prediction={demo.prediction} submitted={submitted} onSubmit={() => setSubmitted(true)} />
        <ExplanationPanel
          explanation={demo.explanation}
          activeExplain={state.activeEvent?.type === "line" ? state.activeEvent.explain : undefined}
        />
      </div>
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <div className="text-sm font-semibold">Recommended next case</div>
            <p className="mt-1 text-sm text-muted-foreground">{nextDemo.title}: {nextDemo.concept}</p>
          </div>
          <a href={`/demo/${nextDemo.id}`} className="inline-flex h-9 items-center justify-center rounded-md bg-cyan-700 px-3 text-sm font-semibold text-white hover:bg-cyan-800">
            Open next
          </a>
        </CardContent>
      </Card>
      <CompletionCard
        completed={submitted || step >= max}
        title={demo.title}
        learned={demo.explanation.summary}
        realWorld={demo.explanation.realWorld}
        challenge="Change one scheduling assumption in your head, then rerun or step the case to check it."
        nextHref={`/demo/${nextDemo.id}`}
        nextTitle={nextDemo.title}
      />
    </div>
  );
}
