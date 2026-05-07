# Architecture Guide

## System Overview

JS Clarity Lab is a Next.js App Router application built around generated visual timelines.

The product does not need a backend for its current scope. All demos, simulations, analyzer output, progress, and URL state run in the browser.

## Main Layers

```txt
Routes
  -> Product components
    -> Demo/analyzer/scenario data
      -> Event generation
        -> Visual engine
          -> Animated UI panels
```

## Routes

Important routes:

- `/` home and product decision guide.
- `/start` first learning path.
- `/clinic` real-world symptom routing.
- `/concepts` concept atlas.
- `/discover` searchable case discovery.
- `/analyze` paste-code analyzer.
- `/demo/[id]` guided and editable demos.
- `/node-playground` Node Runtime Lab.
- `/quality` trust, coverage, and security dashboard.

## Visual Event Engine

The core engine receives event arrays and recomputes state from the beginning for any step.

This supports:

- Step forward.
- Step backward.
- Reset.
- Timeline scrubbing.
- Replay.
- Deterministic visual state.

Core state includes:

- Current line.
- Call stack.
- Microtask queue.
- Timer queue.
- Console output.
- Memory.
- Runtime-specific queues.

## Demo Data

Guided demos live under `src/demos`.

Editable demos include:

- Default parameters.
- Zod validation.
- Controls.
- Code generator.
- Event generator.
- Prediction generator.
- Explanation generator.
- Difference summary.

Node scenarios use scenario contracts and authoring helpers so future cases stay consistent.

## Analyzer Flow

The analyzer is intentionally partial:

1. Parse pasted code with Babel.
2. Extract known patterns.
3. Detect unsupported constructs.
4. Build a simplified event simulation.
5. Generate action output:
   - likely output
   - risk found
   - why this happens
   - fix suggestion
   - matching demo
6. Explain confidence.

The analyzer does not execute pasted code.

## Node Runtime Diagnosis

Node scenarios include a dedicated diagnosis layer for:

- Queue priority.
- Thread pool pressure.
- Stream backpressure.
- Event loop blocking.
- Memory growth.
- HTTP lifecycle.

This allows Node cases to feel practical instead of only educational.

## State Management

Zustand stores are used for:

- Visualizer state.
- Editable demo params.
- Learning progress.
- Saved cases.

URL search parameters are used for shareable scenario and editable state.

## Testing Architecture

Tests protect product quality, not only code correctness:

- Unit tests for event engine behavior.
- Analyzer extraction tests.
- Editable validation tests.
- Demo catalog contract tests.
- Node scenario quality tests.
- Product hardening tests.
- Security tests.
- SEO tests.
- Browser smoke tests.

