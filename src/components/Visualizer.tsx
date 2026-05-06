"use client";

import { useEffect, useMemo } from "react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { CallStack } from "./CallStack";
import { ClarityBrief } from "./ClarityBrief";
import { CodePanel } from "./CodePanel";
import { ConsolePanel } from "./ConsolePanel";
import { ExplanationPanel } from "./ExplanationPanel";
import { PredictionCard } from "./PredictionCard";
import { QueuePanel } from "./QueuePanel";
import { TimelineControls } from "./TimelineControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Demo } from "@/engine/types";
import { getStateAtStep } from "@/engine/getStateAtStep";
import { useVisualizerStore } from "@/store/useVisualizerStore";

export function Visualizer({ demo }: { demo: Demo }) {
  const { step, isPlaying, speed, submitted, next, previous, reset, play, pause, setSpeed, setSubmitted } = useVisualizerStore();
  const max = demo.events.length;
  const state = useMemo(() => getStateAtStep(demo.events, Math.min(step, max)), [demo.events, max, step]);

  useEffect(() => {
    reset();
  }, [demo.id, reset]);

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
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]">
        <CodePanel code={demo.code} currentLine={state.currentLine} />
        <div className="grid content-start gap-4">
          <CallStack items={state.callStack} />
          <QueuePanel title="Microtasks" items={state.microtaskQueue} emptyLabel="No microtasks queued" />
          <QueuePanel title="Timer Queue" items={state.timerQueue} emptyLabel="No timers queued" />
          <QueuePanel title="Runtime / Web APIs" items={state.webApis} emptyLabel="No browser/runtime work" />
        </div>
      </div>
      <ConsolePanel output={state.consoleOutput} />
      {memoryData.length > 0 || state.memory.gc || state.blockedDuration > 0 || state.elapsedTime > 0 ? (
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
    </div>
  );
}
