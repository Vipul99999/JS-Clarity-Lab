export type PatternKind =
  | "console"
  | "setTimeout"
  | "setInterval"
  | "queueMicrotask"
  | "promise_then"
  | "promise_catch"
  | "promise_all"
  | "async_function"
  | "await"
  | "async_map"
  | "try_catch_await"
  | "function_call";

export type SourceLocation = {
  line: number;
  column: number;
};

export type ExtractedPattern =
  | {
      type: "console";
      value: string;
      line: number;
      loc?: SourceLocation;
      phase: "sync" | "microtask" | "timer" | "async";
    }
  | {
      type: "setTimeout";
      delay: number;
      callbackLabel?: string;
      line: number;
      loc?: SourceLocation;
    }
  | {
      type: "setInterval";
      delay: number;
      callbackLabel?: string;
      line: number;
      loc?: SourceLocation;
    }
  | {
      type: "queueMicrotask";
      callbackLabel?: string;
      line: number;
      loc?: SourceLocation;
    }
  | {
      type: "promise_then";
      callbackLabel?: string;
      line: number;
      loc?: SourceLocation;
    }
  | {
      type: "promise_catch";
      callbackLabel?: string;
      line: number;
      loc?: SourceLocation;
    }
  | {
      type: "promise_all";
      itemCount: number;
      line: number;
      loc?: SourceLocation;
    }
  | {
      type: "async_function";
      name: string;
      line: number;
      loc?: SourceLocation;
    }
  | {
      type: "await";
      label: string;
      guarded: boolean;
      line: number;
      loc?: SourceLocation;
    }
  | {
      type: "async_map";
      line: number;
      loc?: SourceLocation;
    }
  | {
      type: "try_catch_await";
      line: number;
      loc?: SourceLocation;
    }
  | {
      type: "function_call";
      name: string;
      line: number;
      loc?: SourceLocation;
    };

export type AnalyzerWarning = {
  title: string;
  detail: string;
  line?: number;
};

export type AnalysisResult = {
  ok: boolean;
  formattedCode: string;
  patterns: ExtractedPattern[];
  warnings: AnalyzerWarning[];
  confidence: "High" | "Medium" | "Low";
  trustNotes: string[];
  error?: string;
};
