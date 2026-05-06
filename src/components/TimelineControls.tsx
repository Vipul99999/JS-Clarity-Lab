"use client";

import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type TimelineControlsProps = {
  step: number;
  max: number;
  isPlaying: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
};

export function TimelineControls({
  step,
  max,
  isPlaying,
  speed,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onReset,
  onSpeedChange
}: TimelineControlsProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-black/10 bg-white/95 p-3 shadow-[0_14px_35px_rgba(15,23,42,0.08)] md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="outline" onClick={onReset} aria-label="Reset timeline">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" onClick={onPrevious} disabled={step === 0} aria-label="Previous step">
          <SkipBack className="h-4 w-4" />
        </Button>
        {isPlaying ? (
          <Button size="icon" onClick={onPause} aria-label="Pause">
            <Pause className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="icon" onClick={onPlay} disabled={step >= max} aria-label="Play">
            <Play className="h-4 w-4" />
          </Button>
        )}
        <Button size="icon" variant="outline" onClick={onNext} disabled={step >= max} aria-label="Next step">
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-3 md:max-w-md">
        <span className="whitespace-nowrap text-sm font-medium">
          Step {step}/{max}
        </span>
        <Slider
          min={150}
          max={1300}
          step={50}
          value={speed}
          onChange={(event) => onSpeedChange(Number(event.currentTarget.value))}
          aria-label="Playback speed"
        />
      </div>
    </div>
  );
}
