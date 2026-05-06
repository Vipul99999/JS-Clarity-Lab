"use client";

import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const presets: Record<string, { label: string; params: Record<string, unknown> }[]> = {
  "promise-before-timeout": [
    { label: "0ms + 3 promises", params: { timerDelay: 0, promiseCount: 3 } },
    { label: "Slow timer", params: { timerDelay: 1000, promiseCount: 2 } }
  ],
  "multiple-timers": [
    { label: "Same delay", params: { delayMode: "same", declarationOrder: "normal" } },
    { label: "Reverse declaration", params: { delayMode: "same", declarationOrder: "reverse" } },
    { label: "Descending delays", params: { delayMode: "descending" } }
  ],
  "timeout-inside-promise": [
    { label: "Timer inside", params: { timerLocation: "inside", promiseCount: 2 } },
    { label: "Timer outside", params: { timerLocation: "outside", promiseCount: 2 } }
  ],
  "blocking-loop-event-loop": [
    { label: "Block after timer", params: { blockPosition: "after", loopDuration: 1500 } },
    { label: "Block before timer", params: { blockPosition: "before", loopDuration: 1500 } }
  ],
  "missing-return": [
    { label: "Missing return", params: { includeReturn: false } },
    { label: "Fixed return", params: { includeReturn: true } }
  ],
  "promise-all-fail": [
    { label: "All succeed", params: { failingCall: "none" } },
    { label: "API 2 fails", params: { failingCall: "2" } }
  ],
  "promise-race-any": [
    { label: "race + fast fail", params: { method: "race", firstFails: true, firstDelay: 100 } },
    { label: "any + fast fail", params: { method: "any", firstFails: true, firstDelay: 100 } }
  ],
  "sequential-await": [
    { label: "Sequential slow", params: { mode: "sequential", apiCount: 4, apiDelay: 800 } },
    { label: "Parallel slow", params: { mode: "parallel", apiCount: 4, apiDelay: 800 } }
  ],
  "missing-await": [
    { label: "Missing await", params: { includeAwait: false } },
    { label: "With await", params: { includeAwait: true } }
  ],
  "async-foreach-issue": [
    { label: "forEach trap", params: { loopMethod: "forEach" } },
    { label: "for...of", params: { loopMethod: "forOf" } },
    { label: "Promise.all", params: { loopMethod: "promiseAll" } }
  ],
  "interval-leak": [
    { label: "Leak", params: { cleanupEnabled: false, memoryPerTick: 15 } },
    { label: "Cleanup", params: { cleanupEnabled: true, memoryPerTick: 15 } }
  ],
  "microtask-flood": [
    { label: "Small flood", params: { microtaskCount: 3 } },
    { label: "Large flood", params: { microtaskCount: 15 } }
  ]
};

export function VariantSelector({
  demoId,
  params,
  onApply
}: {
  demoId: string;
  params: Record<string, unknown>;
  onApply: (params: Record<string, unknown>) => void;
}) {
  const demoPresets = presets[demoId] ?? [];
  if (demoPresets.length === 0) return null;

  return (
    <section className="rounded-lg border bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-teal-700" />
        <h2 className="text-base font-semibold">Try a variation</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {demoPresets.map((preset) => (
          <Button key={preset.label} variant="outline" size="sm" onClick={() => onApply({ ...params, ...preset.params })}>
            {preset.label}
          </Button>
        ))}
      </div>
    </section>
  );
}
