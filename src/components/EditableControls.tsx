"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { EditableControl } from "@/editable/types";

type EditableControlsProps = {
  controls: EditableControl[];
  params: Record<string, unknown>;
  defaultParams: Record<string, unknown>;
  errors: Record<string, string>;
  onChange: (nextParams: Record<string, unknown>) => void;
  onReset: () => void;
};

export function EditableControls({ controls, params, errors, onChange, onReset }: EditableControlsProps) {
  function update(key: string, value: unknown) {
    onChange({ ...params, [key]: value });
  }

  return (
    <section className="rounded-lg border border-black/10 bg-white/95 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Change the situation</h2>
          <p className="text-sm text-muted-foreground">Try a variation. The code, prediction, timeline, and explanation update immediately.</p>
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Reset to default
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {controls.map((control) => (
          <label key={control.key} className="grid gap-2 rounded-md border border-black/10 bg-[#f7f9f0] p-3 text-sm">
            <span className="font-medium">{control.label}</span>
            {control.description ? <span className="text-xs leading-5 text-muted-foreground">{control.description}</span> : null}
            {control.type === "select" ? (
              <select
                value={String(params[control.key])}
                onChange={(event) => update(control.key, event.currentTarget.value)}
                className="h-10 rounded-md border border-black/10 bg-white px-3 font-medium outline-none focus:ring-2 focus:ring-ring"
              >
                {control.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}
            {control.type === "number" ? (
              <div className="grid gap-2">
                <Slider
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={Number(params[control.key])}
                  onChange={(event) => update(control.key, Number(event.currentTarget.value))}
                />
                <input
                  type="number"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={Number(params[control.key])}
                  onChange={(event) => update(control.key, Number(event.currentTarget.value))}
                  className="h-9 rounded-md border border-black/10 bg-white px-3 font-medium outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            ) : null}
            {control.type === "boolean" ? (
              <button
                type="button"
                onClick={() => update(control.key, !Boolean(params[control.key]))}
                className="flex h-10 items-center justify-between rounded-md border border-black/10 bg-white px-3 font-medium shadow-sm"
              >
                <span>{Boolean(params[control.key]) ? "Enabled" : "Disabled"}</span>
                <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${Boolean(params[control.key]) ? "bg-teal-700" : "bg-slate-300"}`}>
                  <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${Boolean(params[control.key]) ? "translate-x-4" : ""}`} />
                </span>
              </button>
            ) : null}
            {control.type === "text" ? (
              <input
                value={String(params[control.key] ?? "")}
                maxLength={control.maxLength}
                onChange={(event) => update(control.key, event.currentTarget.value)}
                className="h-10 rounded-md border border-black/10 bg-white px-3 font-medium outline-none focus:ring-2 focus:ring-ring"
              />
            ) : null}
            {errors[control.key] ? <span className="text-xs font-medium text-red-700">{errors[control.key]}</span> : null}
          </label>
        ))}
      </div>
    </section>
  );
}
