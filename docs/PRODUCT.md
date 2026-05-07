# Product Guide

## Product Name

JS Clarity Lab

## One-Line Description

A visual reasoning tool for confusing JavaScript async behavior and Node.js runtime problems.

## Core Promise

JS Clarity Lab helps users move from confusion to clarity in seconds:

```txt
Open or paste code -> predict -> run visualization -> inspect output -> understand why -> apply the fix
```

## Product Philosophy

Most JavaScript learning products try to cover the whole language. JS Clarity Lab does not.

This product focuses on confusing runtime behavior:

- Unexpected output order.
- Async code running too early.
- Timers running late.
- Promise values disappearing.
- Async loops finishing too early.
- API requests becoming slow.
- Memory slowly growing.
- Node queues behaving differently than expected.
- Stream and worker-pool pressure.

The product wins by being narrow, visual, practical, and honest.

## Primary User Jobs

### 1. I Want To Understand A Confusing Output

Best surface: Clarity Cases.

User opens a curated case, predicts output, runs the animation, and reads a short explanation.

### 2. I Want To Try A Variation

Best surface: Try Variations.

User changes controlled parameters such as delay, count, cleanup, mode, or labels. The code and timeline update immediately.

### 3. I Want To Debug Pasted Code

Best surface: Analyze Code.

User pastes code. The analyzer detects supported patterns, explains confidence, shows likely output, risk, fix suggestion, and matching cases.

### 4. I Want To Learn Node.js Runtime Behavior

Best surface: Node Runtime Lab.

User explores curated Node scenarios with queues, thread pool, streams, memory, HTTP lifecycle, performance, and production debugging playbooks.

## Universal Learning Flow

Every major page should follow this flow:

1. Concept.
2. Predict.
3. Run.
4. Inspect.
5. Fix or real-world use.

This reduces cognitive load because users do not need to learn a different interaction model for every product area.

## Why Users Come Back

- They get a fast answer to real confusion.
- They can practice prediction.
- They can compare problem code and fixed code.
- They can save progress locally.
- They can search by symptom instead of remembering technical terms.
- They can copy debugging notes for real apps.
- They can trust what is simulated and what is not.

## Product Areas

### Clarity Cases

Purpose: teach one confusing behavior at a time.

Required case ingredients:

- Concept.
- Prediction.
- Visual events.
- Explanation.
- Common wrong assumption.
- Real-world bug.
- Fixed version when relevant.
- Recommended next case.
- Trust label.

### Try Variations

Purpose: help users see how behavior changes when the situation changes.

Rules:

- Do not execute arbitrary code.
- Validate parameters.
- Regenerate code and events from known generators.
- Reset timeline after every parameter change.
- Keep URL state readable and shareable.

### Analyze Code

Purpose: practical debugging assistant without unsafe execution.

Required output:

- Detected patterns.
- Likely output.
- Risk found.
- Why this happens.
- Fix suggestion.
- Matching demo or Node scenario.
- Confidence explainer.
- Limitations.

### Node Runtime Lab

Purpose: advanced runtime understanding for Node.js developers.

Must show only relevant panels for the selected scenario. Beginners should not see thread pool, streams, memory, and debug details unless the case needs them or the user chooses Pro mode.

## Success Criteria

The product is successful when users say:

- "Now I understand why this happens."
- "I can explain this in an interview."
- "I know what to check in my real app."
- "I can see why the fixed code is safer."

## Roadmap

Current direction:

- Better authoring tools for high-quality scenarios.
- More analyzer patterns.
- Stronger runtime comparison.
- More production debugging playbooks.
- Better accessibility.
- Better saved learning history.

Future, not current MVP:

- Optional backend accounts.
- Team classrooms.
- Shared public snippets.
- AI explanation assistance.
- Deeper runtime trace imports.

