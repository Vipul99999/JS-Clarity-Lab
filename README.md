# JS Clarity Lab

A visual reasoning tool for confusing JavaScript behavior.

JS Clarity Lab helps developers understand tricky async output, hidden runtime bugs, memory leaks, performance stalls, and real-world Node/browser timing issues through prediction, animation, and short explanations.

It is not a full JavaScript tutorial and it is not a code execution sandbox. The product focuses on the cases that make developers stop and ask: "Why did JavaScript do that?"

## What Makes It Valuable

- **Instant clarity:** open a demo or paste code and get a fast explanation of the likely async behavior.
- **Interactive thinking:** predict the output first, then run the visual timeline.
- **Real-world focus:** every demo explains where the issue appears in production code.
- **Safe experimentation:** editable cases use controlled parameters instead of arbitrary code execution.
- **Trust-first analyzer:** pasted code is parsed and pattern-matched, not executed.

## Product Surface

### Guided Demos

50 focused concepts across:

- Event Loop
- Promises
- Async/Await
- Memory
- Performance
- Node.js Runtime
- Real-World Bugs

### Editable Cases

12 controlled playground cases where users can change safe parameters such as timer delay, promise count, await mode, API delay, cleanup behavior, and microtask count.

Changing a control immediately updates:

- Generated code
- Visual timeline
- Prediction question
- Explanation
- Difference summary
- Shareable URL state

### Paste Code Analyzer

The analyzer supports partial visualization for known patterns:

- `console.log`
- `setTimeout`
- `setInterval`
- `queueMicrotask`
- `Promise.resolve().then`
- `Promise.reject().catch`
- simplified `Promise.all`
- `async` / `await`
- flat function calls

It clearly shows limitations instead of pretending to be a full runtime debugger.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- Zustand
- Framer Motion
- Monaco Editor
- Recharts
- Babel parser/traverse/types
- Prettier
- Zod
- Vitest
- Playwright

## Project Structure

```txt
src/
  app/                 Next.js routes
  analyzer/            AST parsing and pattern extraction
  components/          UI and visualizer components
  demos/               Guided and editable demo catalog
  editable/            Editable case schemas and generators
  engine/              Visual event engine
  patterns/            Analyzer pattern helpers
  simulator/           Pattern-to-event simulation
  store/               Zustand stores
  utils/               URL state helpers
tests/
  browser/             Playwright smoke tests
  *.test.ts            Unit tests
```

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open:

```txt
http://127.0.0.1:3000
```

Build for production:

```bash
pnpm build
```

Run production locally:

```bash
pnpm start
```

## Quality Checks

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm qa:browser
```

Current coverage verifies:

- Visual event engine behavior
- Editable parameter validation
- URL state encoding/decoding
- Analyzer pattern extraction
- Demo catalog integrity
- Browser rendering of homepage, analyzer, editable demos, and new real-world demos

## Safety Model

JS Clarity Lab does not execute arbitrary pasted JavaScript.

The analyzer parses code into an AST, extracts known async patterns, and builds a simplified visual simulation. This keeps the product safe, explainable, and honest about what it can and cannot infer.

Unsupported or limited areas include:

- complex loops
- recursion
- DOM execution
- real browser runtime debugging
- external APIs
- arbitrary user code execution
- full closure and memory analysis

## Positioning

JS Clarity Lab is for developers who want to quickly understand confusing behavior in modern JavaScript, React, browser APIs, and Node.js.

It is built around one promise:

> Change the situation, predict the result, see the timeline, understand why it happened.

