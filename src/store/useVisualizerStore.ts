"use client";

import { create } from "zustand";

type VisualizerStore = {
  step: number;
  isPlaying: boolean;
  speed: number;
  submitted: boolean;
  setStep: (step: number) => void;
  next: (max: number) => void;
  previous: () => void;
  reset: () => void;
  play: () => void;
  pause: () => void;
  setSpeed: (speed: number) => void;
  setSubmitted: (submitted: boolean) => void;
};

export const useVisualizerStore = create<VisualizerStore>((set) => ({
  step: 0,
  isPlaying: false,
  speed: 900,
  submitted: false,
  setStep: (step) => set({ step }),
  next: (max) => set((state) => ({ step: Math.min(state.step + 1, max) })),
  previous: () => set((state) => ({ step: Math.max(state.step - 1, 0), isPlaying: false })),
  reset: () => set({ step: 0, isPlaying: false, submitted: false }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  setSpeed: (speed) => set({ speed }),
  setSubmitted: (submitted) => set({ submitted })
}));
