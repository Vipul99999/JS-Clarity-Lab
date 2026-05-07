"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { editor } from "monaco-editor";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bug,
  CheckCircle2,
  CircleDot,
  Cpu,
  FileCode2,
  Gauge,
  GitBranch,
  Layers,
  Link2,
  ListChecks,
  Menu,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Pause,
  Play,
  RotateCcw,
  Server,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Sparkles,
  TerminalSquare,
  X
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CompletionCard } from "@/components/CompletionCard";
import { Slider } from "@/components/ui/slider";
import { WhatAmISeeing } from "@/components/WhatAmISeeing";
import { getNodeStateAtStep } from "@/nodePlayground/engine";
import { buildScenarioContract } from "@/nodePlayground/quality";
import { nodeScenarioCategories, nodeScenarios } from "@/nodePlayground/scenarios";
import type { NodeEvent, NodeScenario } from "@/nodePlayground/types";
import { useLearningProgress } from "@/lib/learningProgress";
import { SaveCaseButton } from "@/components/SaveCaseButton";
import { NodeTracePanel } from "@/components/NodeTracePanel";
import { ProductionPlaybookPanel } from "@/components/ProductionPlaybookPanel";
import { ScenarioComparisonPanel } from "@/components/ScenarioComparisonPanel";
import { TrustBadge } from "@/components/TrustBadge";
import { copyTextSafely } from "@/security/clipboard";

const categoryIcons = {
  "Node.js Fundamentals": FileCode2,
  "Async & Event Loop": GitBranch,
  "Streams & Buffers": Layers,
  "Files & Networking": Network,
  "Errors & Debugging": Bug,
  "Memory & Performance": Gauge,
  Security: ShieldCheck,
  Testing: CheckCircle2,
  Deployment: Server,
  "Interview Questions": Sparkles
};

type DetailTab = "concept" | "prediction" | "debug" | "fix" | "limits";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function MiniButton({
  children,
  active,
  onClick
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "inline-flex h-9 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition-all",
        active ? "border-cyan-300 bg-cyan-100 text-cyan-950" : "border-black/10 bg-white text-slate-700 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  );
}

function eventLabel(event?: NodeEvent) {
  if (!event) return "Ready";
  if ("name" in event) return event.name;
  if (event.type === "console") return `console: ${event.value}`;
  if (event.type === "line") return `line ${event.line}`;
  if (event.type === "performance_block") return `blocked ${event.duration}ms`;
  if (event.type === "wait") return event.reason;
  if (event.type === "stream_chunk") return `${event.stream} ${event.chunk}`;
  if (event.type === "memory_allocate") return event.label;
  return event.type.replaceAll("_", " ");
}

function eventTone(event?: NodeEvent) {
  const type = event?.type ?? "ready";
  if (type.includes("microtask") || type.includes("nexttick") || type.includes("promise")) return "from-violet-500 to-fuchsia-500";
  if (type.includes("timer")) return "from-amber-400 to-orange-500";
  if (type.includes("threadpool")) return "from-cyan-500 to-blue-600";
  if (type.includes("stream")) return "from-emerald-400 to-teal-600";
  if (type.includes("memory") || type.includes("gc")) return "from-rose-400 to-red-600";
  if (type.includes("io") || type.includes("check") || type.includes("close")) return "from-sky-400 to-cyan-600";
  if (type.includes("console")) return "from-lime-300 to-emerald-500";
  return "from-slate-400 to-slate-700";
}

function eventBadge(event?: NodeEvent) {
  if (!event) return "waiting";
  return event.type.replaceAll("_", " ");
}

function activePhase(event?: NodeEvent) {
  const type = event?.type ?? "ready";
  if (type.includes("stack") || type === "line") return "Call Stack";
  if (type.includes("nexttick")) return "nextTick";
  if (type.includes("microtask") || type.includes("promise")) return "Microtasks";
  if (type.includes("timer")) return "Timers";
  if (type.includes("io") || type === "wait") return "I/O Poll";
  if (type.includes("check")) return "Check";
  if (type.includes("close")) return "Close";
  if (type.includes("threadpool")) return "Thread Pool";
  if (type.includes("stream")) return "Streams";
  if (type.includes("memory") || type.includes("gc")) return "Memory";
  if (type.includes("console")) return "Console";
  return "Runtime";
}

function Sidebar({
  current,
  collapsed,
  mobileOpen,
  onCloseMobile,
  onPick
}: {
  current: NodeScenario;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onPick: (id: string) => void;
}) {
  const content = (
    <div className="flex h-full flex-col bg-[#111318] text-white">
      <div className="flex h-14 items-center justify-between border-b border-white/10 px-3">
        {!collapsed ? (
          <div>
            <div className="text-sm font-semibold">Node Playground</div>
            <div className="text-xs text-white/50">Scenario library - {nodeScenarios.length} cases</div>
          </div>
        ) : (
          <CircleDot className="h-5 w-5 text-cyan-200" />
        )}
        <button onClick={onCloseMobile} className="rounded-md p-2 text-white/70 hover:bg-white/10 lg:hidden" aria-label="Close sidebar">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-auto px-2 py-3">
        {nodeScenarioCategories.map((category) => {
          const Icon = categoryIcons[category];
          const items = nodeScenarios.filter((item) => item.category === category);
          return (
            <div key={category} className="mb-4">
              <div className={cx("mb-1 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-white/45", collapsed && "justify-center px-0")}>
                <Icon className="h-4 w-4 text-cyan-200" />
                {!collapsed ? category : null}
              </div>
              <div className="space-y-1">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onPick(item.id);
                      onCloseMobile();
                    }}
                    className={cx(
                      "w-full rounded-lg px-2 py-2 text-left text-sm transition-all hover:bg-white/10",
                      item.id === current.id ? "bg-cyan-200 text-[#111318]" : "text-white/78",
                      collapsed && "flex justify-center"
                    )}
                    title={item.title}
                  >
                    {collapsed ? (
                      <span className="h-2 w-2 rounded-full bg-current" />
                    ) : (
                      <>
                        <div className="font-semibold leading-5">{item.title}</div>
                        <div className={cx("mt-0.5 text-xs", item.id === current.id ? "text-[#111318]/65" : "text-white/42")}>{item.level}</div>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <aside className={cx("hidden h-screen shrink-0 border-r border-white/10 lg:block", collapsed ? "w-[64px]" : "w-[292px]")}>{content}</aside>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/50" onClick={onCloseMobile} aria-label="Close sidebar backdrop" />
          <aside className="relative h-full w-[86vw] max-w-[330px] shadow-2xl">{content}</aside>
        </div>
      ) : null}
    </>
  );
}

function NodeCodeEditor({ code, currentLine }: { code: string; currentLine: number }) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);

  const handleMount: OnMount = (instance) => {
    editorRef.current = instance;
    decorationsRef.current = instance.createDecorationsCollection();
  };

  useEffect(() => {
    if (!editorRef.current || !decorationsRef.current) return;
    decorationsRef.current.set([
      {
        range: {
          startLineNumber: Math.max(1, currentLine),
          startColumn: 1,
          endLineNumber: Math.max(1, currentLine),
          endColumn: 1
        },
        options: {
          isWholeLine: true,
          className: "node-active-line-highlight",
          linesDecorationsClassName: "node-active-line-glyph"
        }
      }
    ]);
    editorRef.current.revealLineInCenterIfOutsideViewport(Math.max(1, currentLine));
  }, [currentLine]);

  return (
    <Editor
      height="100%"
      defaultLanguage="javascript"
      value={code}
      theme="vs-dark"
      onMount={handleMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineHeight: 22,
        scrollBeyondLastLine: false,
        renderLineHighlight: "none",
        overviewRulerLanes: 0,
        padding: { top: 14, bottom: 14 }
      }}
    />
  );
}

function Lane({
  title,
  items,
  empty,
  tone = "cyan",
  active
}: {
  title: string;
  items: string[];
  empty: string;
  tone?: "cyan" | "rose" | "amber" | "slate";
  active?: boolean;
}) {
  const toneClass = {
    cyan: "border-cyan-200 bg-cyan-50",
    rose: "border-rose-200 bg-rose-50",
    amber: "border-amber-200 bg-amber-50",
    slate: "border-slate-200 bg-slate-50"
  }[tone];
  const itemTone = {
    cyan: "border-cyan-200 bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-cyan-500/20",
    rose: "border-rose-200 bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white shadow-rose-500/20",
    amber: "border-amber-200 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/20",
    slate: "border-slate-200 bg-gradient-to-r from-slate-700 to-slate-950 text-white shadow-slate-500/20"
  }[tone];

  return (
    <motion.section
      animate={active ? { boxShadow: "0 0 0 2px rgba(34,211,238,0.28), 0 18px 45px rgba(8,47,73,0.16)" } : { boxShadow: "0 0 0 0 rgba(0,0,0,0)" }}
      className={cx("min-h-[108px] rounded-lg border p-3", toneClass, active && "ring-2 ring-cyan-300/70")}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">{title}</h3>
        {active ? <span className="rounded-full bg-cyan-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">active</span> : null}
      </div>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {items.map((item, index) => (
            <motion.div
              key={`${item}-${index}`}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className={cx("relative overflow-hidden rounded-md border px-2.5 py-2 text-xs font-semibold shadow-lg", itemTone)}
            >
              <motion.span
                className="absolute inset-y-0 left-0 w-10 bg-white/20"
                initial={{ x: "-120%" }}
                animate={active ? { x: ["-120%", "360%"] } : { x: "-120%" }}
                transition={{ duration: 1.4, repeat: active ? Infinity : 0, repeatDelay: 0.6 }}
              />
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-white/85 shadow-[0_0_12px_rgba(255,255,255,0.85)]" />
              {item}
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 ? <div className="text-xs text-muted-foreground">{empty}</div> : null}
      </div>
    </motion.section>
  );
}

function RuntimeVisualizer({
  scenario,
  state,
  viewMode,
  events,
  step
}: {
  scenario: NodeScenario;
  state: ReturnType<typeof getNodeStateAtStep>;
  viewMode: "simple" | "visual" | "pro";
  events: NodeEvent[];
  step: number;
}) {
  const visible = new Set(scenario.panels);
  const runningWorkers = state.threadPool.filter((task) => task.status === "running").slice(0, 4);
  const queuedWorkers = state.threadPool.filter((task) => task.status === "queued");
  const streamItems = state.streamEvents.map((item) => `${item.stream}: ${item.chunk ?? item.status}${item.bytes ? ` (${item.bytes} bytes)` : ""}`);
  const active = activePhase(state.activeEvent);
  const phases = [
    { label: "Call Stack", count: state.callStack.length, tone: "from-slate-700 to-slate-950", show: visible.has("callStack") || state.callStack.length > 0 },
    { label: "nextTick", count: state.nextTickQueue.length, tone: "from-rose-500 to-fuchsia-500", show: visible.has("microtasks") || state.nextTickQueue.length > 0 },
    { label: "Microtasks", count: state.microtaskQueue.length, tone: "from-violet-500 to-indigo-500", show: visible.has("microtasks") || state.microtaskQueue.length > 0 },
    { label: "Timers", count: state.timerQueue.length, tone: "from-amber-400 to-orange-500", show: visible.has("timers") || state.timerQueue.length > 0 },
    { label: "I/O Poll", count: state.ioQueue.length, tone: "from-sky-400 to-cyan-600", show: visible.has("io") || state.ioQueue.length > 0 },
    { label: "Check", count: state.checkQueue.length, tone: "from-cyan-500 to-blue-600", show: visible.has("check") || state.checkQueue.length > 0 },
    { label: "Close", count: state.closeQueue.length, tone: "from-red-400 to-rose-600", show: visible.has("close") || state.closeQueue.length > 0 },
    { label: "Thread Pool", count: state.threadPool.length, tone: "from-blue-500 to-cyan-500", show: visible.has("threadPool") || state.threadPool.length > 0 },
    { label: "Streams", count: state.streamEvents.length, tone: "from-emerald-400 to-teal-600", show: visible.has("streams") || state.streamEvents.length > 0 },
    { label: "Memory", count: Object.values(state.memory).filter((item) => !item.released).length, tone: "from-rose-400 to-red-600", show: visible.has("memory") },
    { label: "Console", count: state.consoleOutput.length, tone: "from-lime-300 to-emerald-500", show: true }
  ].filter((phase) => phase.show);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="text-base font-semibold">Visual runtime</h2>
          <p className="text-xs text-muted-foreground">Queues appear only when this case needs them.</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <TrustBadge level="curated scenario" />
          <TrustBadge level="does not execute real code" />
          <div className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold">{scenario.level}</div>
        </div>
      </div>
      <div className="shrink-0 overflow-x-auto border-b bg-slate-50 px-4 py-2">
        <div className="flex min-w-max gap-1">
          {events.map((event, index) => (
            <motion.div
              key={`${event.type}-${index}`}
              title={`${index + 1}. ${eventBadge(event)} - ${eventLabel(event)}`}
              className={cx(
                `h-2.5 w-8 rounded-full bg-gradient-to-r ${eventTone(event)}`,
                index < step ? "opacity-100" : "opacity-25"
              )}
              animate={index === step - 1 ? { scaleY: [1, 1.8, 1] } : { scaleY: 1 }}
              transition={{ duration: 0.45 }}
            />
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {viewMode === "pro" ? <NodeTracePanel events={events} scenario={scenario} step={step} /> : null}

        <motion.section
          key={`${state.activeEvent?.type ?? "ready"}-${eventLabel(state.activeEvent)}`}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 360, damping: 28 }}
          className={`mb-4 overflow-hidden rounded-xl bg-gradient-to-r ${eventTone(state.activeEvent)} p-[1px] shadow-[0_18px_55px_rgba(8,47,73,0.22)]`}
        >
          <div className="rounded-[11px] bg-white/92 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current event</div>
                <div className="mt-1 text-lg font-semibold text-slate-950">{eventLabel(state.activeEvent)}</div>
              </div>
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">{eventBadge(state.activeEvent)}</span>
            </div>
          </div>
        </motion.section>

        <section className="mb-4 rounded-xl border border-black/10 bg-slate-950 p-4 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">Node runtime path</h3>
              <p className="text-xs text-white/55">The active phase glows as events move through Node.</p>
            </div>
            <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold">{active}</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
            {phases.map((phase) => {
              const isActive = phase.label === active;
              return (
                <motion.div
                  key={phase.label}
                  animate={isActive ? { y: [0, -3, 0], scale: [1, 1.04, 1] } : { y: 0, scale: 1 }}
                  transition={{ duration: 0.7, repeat: isActive ? Infinity : 0, repeatDelay: 0.6 }}
                  className={cx(
                    "relative overflow-hidden rounded-lg border p-3",
                    isActive ? "border-cyan-200 bg-white text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.45)]" : "border-white/10 bg-white/[0.06]"
                  )}
                >
                  {isActive ? <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${phase.tone}`} /> : null}
                  {isActive ? (
                    <motion.div
                      className={`absolute inset-y-0 left-0 w-10 bg-gradient-to-r ${phase.tone} opacity-20`}
                      animate={{ x: ["-120%", "420%"] }}
                      transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.4 }}
                    />
                  ) : null}
                  <div className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{phase.label}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${phase.tone} shadow-[0_0_14px_currentColor]`} />
                    <span className="text-sm font-semibold">{phase.count}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {viewMode === "simple" ? (
          <div className="grid gap-4">
            <section className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-950">
              <h3 className="font-semibold">What is happening now?</h3>
              <p className="mt-2 text-sm leading-6">
                {state.activeEvent
                  ? state.activeEvent.type.replaceAll("_", " ")
                  : "Press Run or Step to watch this case move through the runtime."}
              </p>
            </section>
            <section className="rounded-xl border bg-white p-4">
              <h3 className="font-semibold">One-line answer</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{scenario.explanation.summary}</p>
            </section>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visible.has("callStack") ? <Lane title="Call Stack" items={state.callStack} empty="clear" tone="slate" active={active === "Call Stack"} /> : null}
            {visible.has("microtasks") ? <Lane title="NextTick Queue" items={state.nextTickQueue} empty="none" tone="rose" active={active === "nextTick"} /> : null}
            {visible.has("microtasks") ? <Lane title="Microtask Queue" items={state.microtaskQueue} empty="none" tone="cyan" active={active === "Microtasks"} /> : null}
            {visible.has("timers") ? <Lane title="Timer Queue" items={state.timerQueue} empty="none" tone="amber" active={active === "Timers"} /> : null}
            {visible.has("io") ? <Lane title="I/O Queue" items={state.ioQueue} empty="none" tone="slate" active={active === "I/O Poll"} /> : null}
            {visible.has("check") ? <Lane title="Check Queue" items={state.checkQueue} empty="none" tone="cyan" active={active === "Check"} /> : null}
            {visible.has("close") ? <Lane title="Close Queue" items={state.closeQueue} empty="none" tone="rose" active={active === "Close"} /> : null}
          </div>
        )}

        {viewMode === "pro" && visible.has("threadPool") ? (
          <section className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50/60 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-semibold"><Cpu className="h-4 w-4 text-cyan-700" /> Thread Pool</h3>
              <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold">4 workers</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => {
                const task = runningWorkers[index];
                return (
                  <div key={index} className="rounded-lg border bg-white p-3 shadow-sm">
                    <div className="text-xs font-semibold text-cyan-800">Worker {index + 1}</div>
                    <div className="mt-2 text-xs">{task ? `${task.name} - ${task.work}` : "idle"}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
              <span className="font-semibold">Queued:</span> {queuedWorkers.map((task) => task.name).join(", ") || "none"}
            </div>
          </section>
        ) : null}

        {viewMode === "pro" && visible.has("streams") ? (
          <section className="mt-4 rounded-xl border border-black/10 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><Layers className="h-4 w-4 text-cyan-700" /> Stream Flow</h3>
            <Lane title="Chunks and Backpressure" items={streamItems} empty="No stream movement yet" tone="amber" />
          </section>
        ) : null}
      </div>

      <div className="shrink-0 border-t bg-[#101217] p-3 font-mono text-sm text-cyan-100">
        <AnimatePresence initial={false}>
          {state.consoleOutput.length ? state.consoleOutput.map((line, index) => (
            <motion.div
              key={`${line}-${index}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-sm px-1 py-0.5 text-lime-200"
            >
              {line}
            </motion.div>
          )) : <span className="text-white/45">Console output appears here</span>}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DetailsPanel({
  scenario,
  state,
  detailTab,
  setDetailTab,
  revealed,
  onReveal
}: {
  scenario: NodeScenario;
  state: ReturnType<typeof getNodeStateAtStep>;
  detailTab: DetailTab;
  setDetailTab: (tab: DetailTab) => void;
  revealed: boolean;
  onReveal: () => void;
}) {
  const correct = Array.isArray(scenario.prediction.correct) ? scenario.prediction.correct.join(" -> ") : scenario.prediction.correct;
  const options = scenario.prediction.type === "text" ? [scenario.prediction.placeholder ?? "Type your answer"] : scenario.prediction.options;
  const memoryData = Object.entries(state.memory).map(([id, item]) => ({ id, size: item.released ? 0 : item.size }));
  const contract = buildScenarioContract(scenario, nodeScenarios);
  const recommendedNext = nodeScenarios.find((item) => item.id === contract.recommendedNextId);
  const tabs: Array<{ id: DetailTab; label: string; icon: React.ReactNode }> = [
    { id: "concept", label: "Concept", icon: <BookOpen className="h-4 w-4" /> },
    { id: "prediction", label: "Predict", icon: <ListChecks className="h-4 w-4" /> },
    { id: "debug", label: "Debug", icon: <TerminalSquare className="h-4 w-4" /> },
    { id: "fix", label: "Fix", icon: <CheckCircle2 className="h-4 w-4" /> },
    { id: "limits", label: "Limits", icon: <AlertTriangle className="h-4 w-4" /> }
  ];

  return (
    <section className="rounded-xl border border-black/10 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex gap-2 overflow-x-auto border-b p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setDetailTab(tab.id)}
            className={cx(
              "inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold",
              detailTab === tab.id ? "bg-cyan-100 text-cyan-950" : "text-muted-foreground hover:bg-slate-50"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 text-sm leading-6">
        {detailTab === "concept" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="font-semibold">What this teaches</h3>
              <p className="mt-2 text-muted-foreground">{scenario.concept}</p>
              <div className="mt-3 rounded-md bg-cyan-50 px-3 py-2 text-cyan-950"><span className="font-semibold">Real world:</span> {scenario.realWorld}</div>
            </div>
            <div>
              <h3 className="font-semibold">What happens</h3>
              <ol className="mt-2 space-y-1">
                {scenario.explanation.steps.map((step, index) => <li key={step}>{index + 1}. {step}</li>)}
              </ol>
            </div>
          </div>
        ) : null}

        {detailTab === "prediction" ? (
          <div className="space-y-3">
            <p className="font-medium">{scenario.prediction.question}</p>
            <div className="flex flex-wrap gap-2">{options.map((option) => <span key={option} className="rounded-md border bg-white px-3 py-1.5 shadow-sm">{option}</span>)}</div>
            <Button size="sm" onClick={onReveal}>Lock prediction</Button>
            {revealed ? <div className="rounded-md bg-cyan-50 px-3 py-2 text-cyan-950">Correct: <span className="font-semibold">{correct}</span></div> : null}
          </div>
        ) : null}

        {detailTab === "debug" ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-md bg-slate-50 p-3"><div className="text-xs text-muted-foreground">Current line</div><div className="font-semibold">{state.currentLine}</div></div>
              <div className="rounded-md bg-slate-50 p-3"><div className="text-xs text-muted-foreground">Elapsed</div><div className="font-semibold">{state.elapsedTime}ms</div></div>
              <div className="rounded-md bg-slate-50 p-3"><div className="text-xs text-muted-foreground">Blocked</div><div className="font-semibold">{state.blockedDuration}ms</div></div>
              <div className="rounded-md bg-slate-50 p-3"><div className="text-xs text-muted-foreground">Active timers</div><div className="font-semibold">{state.activeTimers.length}</div></div>
              <div className="rounded-md bg-slate-50 p-3 sm:col-span-2">Variables: {Object.entries(state.variables).map(([key, value]) => `${key}=${value}`).join(", ") || "none"}</div>
              <div className="rounded-md bg-slate-50 p-3 sm:col-span-2">Promises: {Object.entries(state.pendingPromises).map(([key, value]) => `${key}: ${value}`).join(", ") || "none"}</div>
            </div>
            <div className="h-40">
              {memoryData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={memoryData}>
                    <XAxis dataKey="id" tick={{ fontSize: 10 }} />
                    <YAxis width={28} />
                    <Tooltip />
                    <Bar dataKey="size" fill="#0891b2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="rounded-md bg-slate-50 p-3 text-muted-foreground">No heap data yet</div>}
            </div>
          </div>
        ) : null}

        {detailTab === "fix" ? (
          <div className="space-y-3">
            <ScenarioComparisonPanel scenario={scenario} />
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-md bg-rose-50 px-3 py-2 text-rose-950"><span className="font-semibold">Symptom:</span> {contract.bugRecipe.symptom}</div>
              <div className="rounded-md bg-rose-50 px-3 py-2 text-rose-950"><span className="font-semibold">Why it fails:</span> {contract.bugRecipe.whyItFails}</div>
              <div className="rounded-md bg-cyan-50 px-3 py-2 text-cyan-950 lg:col-span-2">
                <span className="font-semibold">Visual proof:</span>
                <ul className="mt-1 space-y-1">
                  {contract.bugRecipe.visualProof.map((item) => <li key={item}>- {item}</li>)}
                </ul>
              </div>
              <div className="overflow-hidden rounded-md bg-slate-950 p-3 text-xs text-rose-100">
                <div className="mb-2 font-sans text-sm font-semibold text-rose-200">Bad code</div>
                <pre className="max-h-44 overflow-auto whitespace-pre-wrap">{contract.bugRecipe.badCode}</pre>
              </div>
              <div className="overflow-hidden rounded-md bg-slate-950 p-3 text-xs text-emerald-100">
                <div className="mb-2 font-sans text-sm font-semibold text-emerald-200">Fixed code</div>
                <pre className="max-h-44 overflow-auto whitespace-pre-wrap">{contract.bugRecipe.fixedCode}</pre>
              </div>
              <div className="rounded-md bg-emerald-50 px-3 py-2 text-emerald-950"><span className="font-semibold">Fixed version:</span> {contract.fixedVersion.explanation}</div>
              <div className="rounded-md bg-white px-3 py-2"><span className="font-semibold">How to verify:</span> {contract.bugRecipe.howToVerify[0]}</div>
              <div className="rounded-md bg-white px-3 py-2 lg:col-span-2"><span className="font-semibold">Variation:</span> {scenario.variation}</div>
              {recommendedNext ? (
                <Link href={`/node-playground?scenario=${recommendedNext.id}&mode=problem`} className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white lg:col-span-2">
                  Recommended next case: {recommendedNext.title}
                </Link>
              ) : null}
            </div>
            <ProductionPlaybookPanel scenario={scenario} events={scenario.events} />
          </div>
        ) : null}

        {detailTab === "limits" ? (
          <div className="space-y-2 text-amber-950">
            <p className="font-semibold">Clear limitations</p>
            <div className="flex flex-wrap gap-2">
              <TrustBadge level="curated scenario" />
              <TrustBadge level={scenario.limitations?.length ? "partially simulated" : "fully simulated"} />
              <TrustBadge level="does not execute real code" />
            </div>
            <p>This playground does not execute arbitrary Node code. It visualizes curated scenarios and known runtime patterns.</p>
            <div className={cx("rounded-md px-3 py-2", contract.valid ? "bg-emerald-50 text-emerald-950" : "bg-rose-50 text-rose-950")}>
              <span className="font-semibold">Scenario contract:</span> {contract.valid ? "complete" : contract.issues.join(", ")}
            </div>
            {(scenario.limitations ?? ["Network, filesystem, database, inspector, and OS behavior are simplified for teaching."]).map((item) => (
              <div key={item} className="flex gap-2"><ArrowRight className="mt-1 h-3 w-3 shrink-0" />{item}</div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function NodePlayground() {
  const [scenarioId, setScenarioId] = useState(nodeScenarios[0].id);
  const [mode, setMode] = useState<"problem" | "fixed">("problem");
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState(700);
  const [playing, setPlaying] = useState(false);
  const [predictionRevealed, setPredictionRevealed] = useState(false);
  const [viewMode, setViewMode] = useState<"simple" | "visual" | "pro">("visual");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>("concept");
  const { upsert, markComplete } = useLearningProgress();
  const scenario = nodeScenarios.find((item) => item.id === scenarioId) ?? nodeScenarios[0];
  const nextScenario = nodeScenarios[nodeScenarios.findIndex((item) => item.id === scenario.id) + 1] ?? nodeScenarios[0];
  const code = mode === "fixed" && scenario.fixedCode ? scenario.fixedCode : scenario.problemCode;
  const events = mode === "fixed" && scenario.fixedEvents ? scenario.fixedEvents : scenario.events;
  const max = events.length;
  const state = useMemo(() => getNodeStateAtStep(events, Math.min(step, max)), [events, max, step]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("scenario");
    const requestedMode = params.get("mode");
    if (requested && nodeScenarios.some((item) => item.id === requested)) setScenarioId(requested);
    if (requestedMode === "fixed") setMode("fixed");
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ scenario: scenario.id, mode });
    window.history.replaceState(null, "", `/node-playground?${params.toString()}`);
  }, [mode, scenario.id]);

  useEffect(() => {
    setStep(0);
    setPlaying(false);
    setPredictionRevealed(false);
  }, [scenario.id, mode]);

  useEffect(() => {
    upsert({
      id: scenario.id,
      type: "node",
      title: scenario.title,
      href: `/node-playground?scenario=${scenario.id}&mode=${mode}`,
      category: scenario.category,
      completed: false
    });
  }, [mode, scenario.category, scenario.id, scenario.title, upsert]);

  useEffect(() => {
    if (predictionRevealed || step >= max) {
      markComplete({
        id: scenario.id,
        type: "node",
        title: scenario.title,
        href: `/node-playground?scenario=${scenario.id}&mode=${mode}`,
        category: scenario.category
      });
    }
  }, [markComplete, max, mode, predictionRevealed, scenario.category, scenario.id, scenario.title, step]);

  useEffect(() => {
    if (!scenario.fixedCode && mode === "fixed") setMode("problem");
  }, [mode, scenario.fixedCode]);

  useEffect(() => {
    if (!playing) return;
    if (step >= max) {
      setPlaying(false);
      return;
    }
    const timeout = window.setTimeout(() => setStep((value) => Math.min(value + 1, max)), speed);
    return () => window.clearTimeout(timeout);
  }, [max, playing, speed, step]);

  function runVisualization() {
    setStep(0);
    setPlaying(true);
    setPredictionRevealed(true);
  }

  return (
    <main className="flex min-h-screen bg-slate-100">
      <Sidebar
        current={scenario}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onPick={setScenarioId}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
          <div className="flex min-h-14 flex-wrap items-center gap-2 px-3 py-2 md:flex-nowrap">
            <button onClick={() => setMobileSidebarOpen(true)} className="rounded-md p-2 hover:bg-slate-100 lg:hidden" aria-label="Open sidebar"><Menu className="h-5 w-5" /></button>
            <button onClick={() => setSidebarCollapsed((value) => !value)} className="hidden rounded-md p-2 hover:bg-slate-100 lg:inline-flex" aria-label="Toggle sidebar">
              {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>
            <Link href="/" className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4" />
              JS Lab
            </Link>
            <div className="hidden h-6 w-px bg-black/10 md:block" />
            <div className="order-3 min-w-0 basis-full sm:order-none sm:basis-auto sm:flex-1">
              <div className="truncate text-sm font-semibold">{scenario.title}</div>
              <div className="hidden truncate text-xs text-muted-foreground sm:block">{scenario.category} - {scenario.level}</div>
            </div>
            <div className="ml-auto flex max-w-full shrink-0 items-center gap-1 overflow-x-auto sm:gap-2">
              <SaveCaseButton compact id={scenario.id} type="node" title={scenario.title} href={`/node-playground?scenario=${scenario.id}&mode=${mode}`} category={scenario.category} />
              <Button size="sm" onClick={runVisualization}><Play className="h-4 w-4" /><span className="hidden sm:inline">Run</span></Button>
              <Button size="sm" variant="outline" onClick={() => { setStep(0); setPlaying(false); setPredictionRevealed(false); }}><RotateCcw className="h-4 w-4" /><span className="hidden sm:inline">Reset</span></Button>
              <Button size="icon" variant="outline" className="h-8 w-8 sm:h-10 sm:w-10" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))} aria-label="Previous step"><SkipBack className="h-4 w-4" /></Button>
              <Button size="icon" variant="outline" className="h-8 w-8 sm:h-10 sm:w-10" onClick={() => setPlaying((value) => !value)} disabled={step >= max} aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button>
              <Button size="icon" variant="outline" className="h-8 w-8 sm:h-10 sm:w-10" disabled={step >= max} onClick={() => setStep((value) => Math.min(max, value + 1))} aria-label="Next step"><SkipForward className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="flex w-full min-w-0 gap-2 overflow-x-auto border-t border-black/5 px-3 py-2">
            <MiniButton active={detailTab === "concept"} onClick={() => setDetailTab("concept")}><BookOpen className="h-4 w-4" />Concept</MiniButton>
            <MiniButton active={detailTab === "prediction"} onClick={() => setDetailTab("prediction")}><ListChecks className="h-4 w-4" />Predict</MiniButton>
            <MiniButton active={viewMode === "simple"} onClick={() => setViewMode("simple")}>Simple</MiniButton>
            <MiniButton active={viewMode === "visual"} onClick={() => setViewMode("visual")}>Visual</MiniButton>
            <MiniButton active={viewMode === "pro"} onClick={() => setViewMode("pro")}>Pro</MiniButton>
            <MiniButton active={mode === "problem"} onClick={() => setMode("problem")}>Problem</MiniButton>
            <MiniButton active={Boolean(scenario.fixedCode) && mode === "fixed"} onClick={() => scenario.fixedCode ? setMode("fixed") : undefined}><CheckCircle2 className="h-4 w-4" />Fixed</MiniButton>
            <MiniButton active={detailTab === "debug"} onClick={() => setDetailTab("debug")}><TerminalSquare className="h-4 w-4" />Debug</MiniButton>
            <MiniButton active={detailTab === "fix"} onClick={() => setDetailTab("fix")}>Fix notes</MiniButton>
            <MiniButton onClick={() => copyTextSafely(window.location.href, 2048)}><Link2 className="h-4 w-4" />Share</MiniButton>
            <MiniButton active={detailTab === "limits"} onClick={() => setDetailTab("limits")}><AlertTriangle className="h-4 w-4" />Limits</MiniButton>
            <WhatAmISeeing variant="link" />
          </div>
        </header>

        <section className="grid min-h-0 min-w-0 flex-1 gap-3 p-3 lg:grid-cols-[minmax(0,1fr)_minmax(390px,0.95fr)]">
          <section className="flex min-h-[520px] min-w-0 flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] lg:h-[calc(100vh-126px)]">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
              <div>
                <h1 className="text-base font-semibold">Code</h1>
                <p className="text-xs text-muted-foreground">Editable surface; simulation remains scenario-driven.</p>
              </div>
              <div className="flex rounded-md border bg-white p-1">
                <button onClick={() => setMode("problem")} className={cx("rounded px-3 py-1.5 text-sm font-semibold", mode === "problem" ? "bg-rose-100 text-rose-950" : "text-muted-foreground")}>Problem</button>
                <button onClick={() => setMode("fixed")} disabled={!scenario.fixedCode} className={cx("rounded px-3 py-1.5 text-sm font-semibold disabled:opacity-40", mode === "fixed" ? "bg-cyan-100 text-cyan-950" : "text-muted-foreground")}>Fixed</button>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <NodeCodeEditor code={code} currentLine={state.currentLine} />
            </div>
            <div className="shrink-0 border-t bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="whitespace-nowrap text-sm font-medium">Step {step}/{max}</span>
                <input type="range" min={0} max={max} value={step} onChange={(event) => setStep(Number(event.currentTarget.value))} className="h-2 w-full cursor-pointer accent-cyan-700" aria-label="Timeline scrubber" />
              </div>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Speed</span>
                <Slider min={150} max={1300} step={50} value={speed} onChange={(event) => setSpeed(Number(event.currentTarget.value))} aria-label="Playback speed" />
              </div>
            </div>
          </section>

          <section className="min-h-[520px] min-w-0 lg:h-[calc(100vh-126px)]">
            <RuntimeVisualizer scenario={scenario} state={state} viewMode={viewMode} events={events} step={step} />
          </section>
        </section>

        <section className="px-3 pb-6">
          <div className="mb-3 rounded-lg border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-950">
            <span className="font-semibold">
              {viewMode === "simple" ? "Simple Mode:" : viewMode === "visual" ? "Visual Mode:" : "Pro Mode:"}
            </span>{" "}
            {viewMode === "simple"
              ? "Code, output, and one-line explanation stay visible. Best for beginners."
              : viewMode === "visual"
                ? "Adds queues and timeline lanes. Best when the order feels confusing."
                : "Adds thread pool, streams, memory, and debug details. Best for production-style investigation."}
          </div>
          <DetailsPanel
            scenario={scenario}
            state={state}
            detailTab={detailTab}
            setDetailTab={setDetailTab}
            revealed={predictionRevealed || step >= max}
            onReveal={() => setPredictionRevealed(true)}
          />
          <div className="mt-4">
            <CompletionCard
              completed={predictionRevealed || step >= max}
              title={scenario.title}
              learned={scenario.explanation.summary}
              realWorld={scenario.realWorld}
              challenge="Switch between Problem and Fixed, then explain which runtime signal improved."
              nextHref={`/node-playground?scenario=${nextScenario.id}&mode=problem`}
              nextTitle={nextScenario.title}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
