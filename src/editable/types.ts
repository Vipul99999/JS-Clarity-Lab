import type { z } from "zod";
import type { DemoCategory, Explanation, Prediction, VisualEvent } from "@/engine/types";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type EditableControl =
  | {
      type: "select";
      key: string;
      label: string;
      description?: string;
      options: {
        label: string;
        value: string;
      }[];
    }
  | {
      type: "number";
      key: string;
      label: string;
      description?: string;
      min: number;
      max: number;
      step: number;
    }
  | {
      type: "boolean";
      key: string;
      label: string;
      description?: string;
    }
  | {
      type: "text";
      key: string;
      label: string;
      description?: string;
      maxLength: number;
    };

export type DiffSummary = {
  changes: string[];
  effect: string;
};

export type EditableDemo = {
  id: string;
  title: string;
  category: DemoCategory;
  difficulty: Difficulty;
  concept: {
    short: string;
    detail: string;
  };
  defaultParams: Record<string, unknown>;
  schema: z.ZodType<Record<string, unknown>>;
  controls: EditableControl[];
  generateCode: (params: Record<string, unknown>) => string;
  generateEvents: (params: Record<string, unknown>) => VisualEvent[];
  generatePrediction: (params: Record<string, unknown>) => Prediction;
  generateExplanation: (params: Record<string, unknown>) => Explanation;
  generateDiffSummary?: (defaultParams: Record<string, unknown>, currentParams: Record<string, unknown>) => DiffSummary;
};

export type ValidationResult = {
  params: Record<string, unknown>;
  errors: Record<string, string>;
};
