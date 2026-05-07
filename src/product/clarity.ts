export const productGuardrails = {
  canDo: [
    "Explain known confusing async and Node runtime patterns.",
    "Visualize curated scenarios and supported pasted-code patterns.",
    "Show likely output order, risks, fix direction, and matching cases.",
    "Export notes you can paste into an issue, PR, lesson, or debugging doc."
  ],
  cannotDo: [
    "It does not execute arbitrary JavaScript.",
    "It does not replace Chrome DevTools, Node inspector, profiling, or tests.",
    "It does not perfectly model OS, network, database, or every library behavior.",
    "It does not send code to a backend in the current local-first product."
  ],
  bestUse: [
    "Use Guided Cases when the concept is unfamiliar.",
    "Use Analyze Code when you have a small confusing snippet.",
    "Use Node Runtime Lab when the issue involves server behavior, streams, fs, crypto, or event-loop pressure.",
    "Use Fix Notes when you need to explain the bug to someone else."
  ]
};

export const clarityQuestions = [
  {
    question: "Do I need a fast answer?",
    answer: "Paste the smallest snippet into Analyze Code and read Practical answer first."
  },
  {
    question: "Do I need to learn the concept?",
    answer: "Open the matching guided case, predict first, then run the animation."
  },
  {
    question: "Is this a Node production issue?",
    answer: "Open Node Runtime Lab and compare Problem vs Fixed with Pro mode."
  },
  {
    question: "Do I need to share the reasoning?",
    answer: "Copy fix notes from the analyzer or production playbook."
  }
];

export function getClarityScore({
  hasAnswer,
  hasRisk,
  hasFix,
  hasNext
}: {
  hasAnswer: boolean;
  hasRisk: boolean;
  hasFix: boolean;
  hasNext: boolean;
}) {
  return [hasAnswer, hasRisk, hasFix, hasNext].filter(Boolean).length;
}
