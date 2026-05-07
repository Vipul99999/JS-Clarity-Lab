export type PatternKind =
  | "console"
  | "setTimeout"
  | "setInterval"
  | "queueMicrotask"
  | "promise_then"
  | "promise_catch"
  | "promise_all"
  | "promise_allSettled"
  | "promise_race"
  | "promise_any"
  | "process_nextTick"
  | "setImmediate"
  | "fs_readFileSync"
  | "crypto_worker"
  | "stream_pipe"
  | "http_route"
  | "async_function"
  | "await"
  | "async_map"
  | "async_forEach"
  | "missing_return_then"
  | "floating_async_call"
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
      type: "promise_allSettled";
      itemCount: number;
      line: number;
      loc?: SourceLocation;
    }
  | {
      type: "promise_race";
      itemCount: number;
      line: number;
      loc?: SourceLocation;
    }
  | {
      type: "promise_any";
      itemCount: number;
      line: number;
      loc?: SourceLocation;
    }
  | {
      type: "process_nextTick";
      callbackLabel?: string;
      line: number;
      loc?: SourceLocation;
    }
  | {
      type: "setImmediate";
      callbackLabel?: string;
      line: number;
      loc?: SourceLocation;
    }
  | {
      type: "fs_readFileSync";
      line: number;
      loc?: SourceLocation;
    }
  | {
      type: "crypto_worker";
      method: string;
      line: number;
      loc?: SourceLocation;
    }
  | {
      type: "stream_pipe";
      line: number;
      loc?: SourceLocation;
    }
  | {
      type: "http_route";
      method: string;
      path: string;
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
      type: "async_forEach";
      line: number;
      loc?: SourceLocation;
    }
  | {
      type: "missing_return_then";
      line: number;
      loc?: SourceLocation;
    }
  | {
      type: "floating_async_call";
      name: string;
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
