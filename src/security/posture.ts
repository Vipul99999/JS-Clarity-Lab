export const securityPosture = {
  localFirst: "Code analysis runs in the browser. No backend upload is used by this product build.",
  noArbitraryExecution: "Pasted JavaScript is parsed for known patterns but never executed.",
  storage: "Recent snippets and progress are stored locally with size limits and can be cleared.",
  sharing: "Share links only encode controlled demo parameters or curated scenario ids.",
  headers: "The app ships browser hardening headers including CSP, frame denial, nosniff, referrer policy, and permissions policy."
};

export const securityChecklist = [
  "No arbitrary JavaScript execution",
  "No backend code upload",
  "CSP header configured",
  "Frame embedding denied",
  "Clipboard writes are user-triggered and bounded",
  "Local saved links must be internal",
  "Recent snippets are capped and truncated"
];
