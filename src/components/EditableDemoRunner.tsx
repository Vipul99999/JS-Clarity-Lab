"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CallStack } from "./CallStack";
import { ClarityBrief } from "./ClarityBrief";
import { CodePanel } from "./CodePanel";
import { CompletionCard } from "./CompletionCard";
import { CompareMode } from "./CompareMode";
import { ConsolePanel } from "./ConsolePanel";
import { DiffSummary } from "./DiffSummary";
import { EditableControls } from "./EditableControls";
import { ExplanationPanel } from "./ExplanationPanel";
import { PredictionCard } from "./PredictionCard";
import { ProductionPlaybook } from "./ProductionPlaybook";
import { QueuePanel } from "./QueuePanel";
import { ShareState } from "./ShareState";
import { TimelineControls } from "./TimelineControls";
import { TraceSummaryPanel } from "./TraceSummaryPanel";
import { VariantSelector } from "./VariantSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { validateWithDefaults } from "@/editable/schemas";
import type { EditableDemo } from "@/editable/types";
import { getStateAtStep } from "@/engine/getStateAtStep";
import type { Demo } from "@/engine/types";
import { useEditableDemoStore } from "@/store/useEditableDemoStore";
import { useLearningProgress } from "@/lib/learningProgress";
import { editableDemos } from "@/demos";
import { decodeDemoState } from "@/utils/decodeDemoState";
import { encodeDemoState } from "@/utils/encodeDemoState";

export function EditableDemoRunner({ demo }: { demo: EditableDemo }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { params, currentStep, isPlaying, speed, setParams, resetParams, setCurrentStep, play, pause, resetTimeline, setSpeed } = useEditableDemoStore();
  const { upsert, markComplete } = useLearningProgress();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const decoded = decodeDemoState(searchParams, demo.controls);
    const result = validateWithDefaults(demo.schema, decoded, demo.defaultParams);
    resetParams(result.params);
    setErrors(result.errors);
    setSubmitted(false);
  }, [demo, resetParams, searchParams]);

  useEffect(() => {
    upsert({
      id: demo.id,
      type: "editable",
      title: demo.title,
      href: `/demo/${demo.id}`,
      category: demo.category,
      completed: false
    });
  }, [demo.category, demo.id, demo.title, upsert]);

  const safeParams = useMemo(() => {
    const result = validateWithDefaults(demo.schema, params, demo.defaultParams);
    return result.params;
  }, [demo.defaultParams, demo.schema, params]);

  const generated = useMemo(() => {
    const code = demo.generateCode(safeParams);
    const events = demo.generateEvents(safeParams);
    const prediction = demo.generatePrediction(safeParams);
    const explanation = demo.generateExplanation(safeParams);
    const diff = demo.generateDiffSummary?.(demo.defaultParams, safeParams) ?? { changes: [], effect: "This variation updates the generated timeline." };
    const defaultEvents = demo.generateEvents(demo.defaultParams);
    const defaultExplanation = demo.generateExplanation(demo.defaultParams);
    return { code, events, prediction, explanation, diff, defaultEvents, defaultExplanation };
  }, [demo, safeParams]);

  const max = generated.events.length;
  const state = useMemo(() => getStateAtStep(generated.events, Math.min(currentStep, max)), [currentStep, generated.events, max]);
  const chartData = useMemo(() => {
    return Array.from({ length: Math.min(currentStep, max) + 1 }).map((_, index) => {
      const snapshot = getStateAtStep(generated.events, index);
      const heap = Object.entries(snapshot.memory)
        .filter(([id]) => id !== "gc")
        .reduce((sum, [, value]) => sum + Number(value.size ?? 0), 0);
      return {
        step: index,
        heap,
        wait: snapshot.elapsedTime,
        blocked: snapshot.blockedDuration
      };
    });
  }, [currentStep, generated.events, max]);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= max) {
      pause();
      return;
    }
    const timeout = window.setTimeout(() => setCurrentStep(Math.min(currentStep + 1, max)), speed);
    return () => window.clearTimeout(timeout);
  }, [currentStep, isPlaying, max, pause, setCurrentStep, speed]);

  useEffect(() => {
    if (submitted || currentStep >= max) {
      markComplete({
        id: demo.id,
        type: "editable",
        title: demo.title,
        href: `/demo/${demo.id}`,
        category: demo.category
      });
    }
  }, [currentStep, demo.category, demo.id, demo.title, markComplete, max, submitted]);

  function updateParams(next: Record<string, unknown>) {
    const result = validateWithDefaults(demo.schema, next, demo.defaultParams);
    setErrors(result.errors);
    setParams(result.params);
    setSubmitted(false);
    const query = encodeDemoState(result.params, demo.defaultParams, demo.controls);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function resetAll() {
    resetParams(demo.defaultParams);
    setErrors({});
    setSubmitted(false);
    router.replace(pathname, { scroll: false });
  }

  const memoryData = Object.entries(state.memory)
    .filter(([id]) => id !== "gc")
    .map(([id, value]) => ({ id: value.label ?? id, memory: Number(value.size ?? 1) }));

  const clarityDemo: Demo = {
    id: demo.id,
    number: 0,
    title: demo.title,
    category: demo.category,
    concept: demo.concept.short,
    code: generated.code,
    prediction: generated.prediction,
    events: generated.events,
    explanation: generated.explanation
  };
  const nextEditable = editableDemos[editableDemos.findIndex((item) => item.id === demo.id) + 1] ?? editableDemos[0];

  return (
    <div className="space-y-4">
      <ClarityBrief demo={clarityDemo} revealed={submitted || currentStep >= max} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)]">
        <CodePanel code={generated.code} currentLine={state.currentLine} editableBadge />
        <div className="grid content-start gap-4">
          <CallStack items={state.callStack} />
          <QueuePanel title="Microtasks" items={state.microtaskQueue} emptyLabel="No microtasks queued" />
          <QueuePanel title="Timer Queue" items={state.timerQueue} emptyLabel="No timers queued" />
          <QueuePanel title="Runtime / Web APIs" items={state.webApis} emptyLabel="No browser/runtime work" />
        </div>
      </div>
      <ConsolePanel output={state.consoleOutput} />
      {memoryData.length > 0 || state.blockedDuration > 0 || state.elapsedTime > 0 || state.memory.gc ? (
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-sm">Memory / Performance Panel</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_280px]">
            <div className="space-y-2 text-sm">
              {state.elapsedTime > 0 ? <div className="rounded-md bg-teal-50 px-3 py-2 text-teal-900">Elapsed wait: {state.elapsedTime}ms</div> : null}
              {state.blockedDuration > 0 ? <div className="rounded-md bg-red-50 px-3 py-2 text-red-900">Blocked timeline segment: {state.blockedDuration}ms</div> : null}
              {Object.entries(state.memory)
                .filter(([id]) => id !== "gc")
                .map(([id, value]) => (
                  <div key={id} className="rounded-md border bg-white px-3 py-2">
                    <div className="font-semibold">{value.label ?? id}</div>
                    <div className="text-muted-foreground">Heap approximation: {value.size}</div>
                    {value.retainedBy?.map((reason) => <div key={reason}>Retained by: {reason}</div>)}
                    {value.released ? <div className="text-teal-700">Released</div> : null}
                  </div>
                ))}
              {state.memory.gc?.gc ? <div className="rounded-md bg-secondary px-3 py-2">{state.memory.gc.gc}</div> : null}
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" tick={{ fontSize: 11 }} />
                  <YAxis width={32} />
                  <Tooltip />
                  <Line type="monotone" dataKey="heap" stroke="#0f766e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="wait" stroke="#7c3aed" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="blocked" stroke="#dc2626" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : null}
      <TraceSummaryPanel events={generated.events} />
      <VariantSelector demoId={demo.id} params={safeParams} onApply={updateParams} />
      <EditableControls controls={demo.controls} params={safeParams} defaultParams={demo.defaultParams} errors={errors} onChange={updateParams} onReset={resetAll} />
      <ShareState pathname={pathname} params={safeParams} defaultParams={demo.defaultParams} controls={demo.controls} />
      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <PredictionCard key={`${demo.id}-${JSON.stringify(safeParams)}`} prediction={generated.prediction} submitted={submitted} onSubmit={() => setSubmitted(true)} />
        <TimelineControls
          step={Math.min(currentStep, max)}
          max={max}
          isPlaying={isPlaying}
          speed={speed}
          onPlay={play}
          onPause={pause}
          onNext={() => setCurrentStep(Math.min(currentStep + 1, max))}
          onPrevious={() => setCurrentStep(Math.max(currentStep - 1, 0))}
          onReset={resetTimeline}
          onSpeedChange={setSpeed}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ExplanationPanel explanation={generated.explanation} activeExplain={state.activeEvent?.type === "line" ? state.activeEvent.explain : undefined} />
        <DiffSummary summary={generated.diff} />
      </div>
      <ProductionPlaybook demoId={demo.id} />
      <CompareMode defaultEvents={generated.defaultEvents} currentEvents={generated.events} defaultExplanation={generated.defaultExplanation} currentExplanation={generated.explanation} />
      <CompletionCard
        completed={submitted || currentStep >= max}
        title={demo.title}
        learned={generated.explanation.summary}
        realWorld={generated.explanation.realWorld}
        challenge="Change one control, predict again, then compare what changed."
        nextHref={`/demo/${nextEditable.id}`}
        nextTitle={nextEditable.title}
      />
    </div>
  );
}
