"use client";

import { create } from "zustand";

type EditableDemoStore = {
  params: Record<string, unknown>;
  currentStep: number;
  isPlaying: boolean;
  speed: number;
  setParams: (params: Record<string, unknown>) => void;
  resetParams: (defaults: Record<string, unknown>) => void;
  setCurrentStep: (step: number) => void;
  play: () => void;
  pause: () => void;
  resetTimeline: () => void;
  setSpeed: (speed: number) => void;
};

export const useEditableDemoStore = create<EditableDemoStore>((set) => ({
  params: {},
  currentStep: 0,
  isPlaying: false,
  speed: 900,
  setParams: (params) => set({ params, currentStep: 0, isPlaying: false }),
  resetParams: (defaults) => set({ params: defaults, currentStep: 0, isPlaying: false }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  resetTimeline: () => set({ currentStep: 0, isPlaying: false }),
  setSpeed: (speed) => set({ speed })
}));
