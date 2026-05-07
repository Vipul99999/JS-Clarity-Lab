# JS Clarity Lab

JS Clarity Lab is a visual reasoning tool for confusing JavaScript and Node.js runtime behavior.

It helps developers answer questions like:

- Why did this output print first?
- Why did `await` not wait?
- Why is my timer late?
- Why is my API slow?
- Why is memory growing?
- How does Node.js move work through queues, I/O, streams, and the thread pool?

The product is not a generic tutorial site, a full code editor, or a dangerous arbitrary JavaScript executor. It is a clarity product: curated scenarios, safe parameter changes, paste-code pattern analysis, visual execution, prediction, explanations, real-world bug recipes, and trust labels.

## Product Promise

Change the situation, predict the result, see the runtime timeline, and understand why it happened.

The strongest product loop is:

```txt
Concept -> Predict -> Run -> Inspect -> Fix / Real-world use
```

Every main surface is designed around that loop so beginners do not feel lost and experienced developers can still inspect deeper runtime details.

## Who It Is For

- Students learning asynchronous JavaScript.
- Teachers explaining the event loop visually.
- Frontend developers debugging confusing browser async output.
- Backend developers learning Node.js runtime behavior.
- Professionals diagnosing slow APIs, flaky tests, memory leaks, stream pressure, worker-pool pressure, and queue ordering.
- Interview candidates practicing runtime explanations.

## What Real Problems It Solves

JS Clarity Lab focuses on high-confusion, high-value behavior:

- Promises and timers printing in unexpected order.
- `process.nextTick`, microtasks, timers, I/O, and `setImmediate` priority in Node.js.
- Missing `await`, missing promise `return`, async `forEach`, and promise failure handling.
- Flaky tests caused by queued work.
- Slow APIs caused by sequential awaits, blocking CPU work, large JSON parsing, or thread pool saturation.
- Memory growth caused by intervals, event listeners, caches, closures, streams, and pending promises.
- Stream backpressure and large file handling.
- Safe security teaching around injection, validation, rate limiting, and dependency risk.

## Product Areas

### 1. Clarity Cases

Guided demos for confusing JavaScript behavior. Each case includes:

- Short concept.
- Prediction question.
- Visual event timeline.
- Explanation.
- Common wrong assumption.
- Real-world usage.
- Recommended next case.

### 2. Try Variations

Controlled editable demos where the user changes safe parameters instead of arbitrary code:

- Timer delay.
- Promise count.
- Output labels.
- Await mode.
- API delays.
- Cleanup on/off.
- Microtask count.
- Cache size.

Changing a control regenerates:

- Code.
- Timeline.
- Prediction.
- Explanation.
- Difference summary.
- Shareable URL state.

### 3. Analyze Code

A paste-code analyzer that parses JavaScript with Babel and detects supported async patterns.

It can show:

- Likely output.
- Risk found.
- Why it happens.
- Fix suggestion.
- Matching demo or Node scenario.
- Confidence and limitation details.

Important: pasted code is parsed and pattern-matched. It is not executed.

### 4. Node Runtime Lab

An advanced visual playground for Node.js runtime internals:

- Call stack.
- `process.nextTick` queue.
- Microtask queue.
- Timer queue.
- I/O poll queue.
- Check queue.
- Close queue.
- Thread pool.
- Streams and backpressure.
- Console output.
- Memory and performance panels.
- Debug inspector.
- Problem vs fixed comparison.

The current Node scenario library covers 30 cases across fundamentals, async, event loop, files, streams, buffers, memory, performance, HTTP, errors, testing, security, deployment, and interviews.

## Key Features

- 50 guided demos.
- 12 editable controlled cases.
- 30 Node.js runtime scenarios.
- Visual event loop simulation.
- Prediction-first learning.
- Paste-code pattern analyzer.
- Analyzer-to-Node scenario bridge.
- Real-world bug recipes.
- Production debugging playbooks.
- Symptom search.
- Exportable debug notes.
- Progress and learning path memory in local storage.
- Quality dashboard and runtime coverage matrix.
- Trust badges: fully simulated, partially simulated, pattern detected only, unsupported.
- Security hardening with headers, no backend, no arbitrary code execution, and clear limitations.
- SEO metadata, sitemap, robots rules, and structured data.
- Focused SEO topic landing pages.
- Launch package with tagline, screenshots plan, demo video plan, release checklist, and Vercel deployment notes.

## Safety Model

JS Clarity Lab is safe by design:

- It does not execute arbitrary pasted JavaScript.
- It does not provide login, backend data storage, or marketplace behavior.
- Editable demos are parameter-driven and validated with Zod.
- Analyzer results are partial simulations with visible confidence labels.
- Unsupported constructs are surfaced instead of hidden.
- Security headers are configured through Next.js.

Known limitations are intentional and visible:

- No full JavaScript runtime emulation.
- No complete browser or Node debugger.
- No arbitrary external API execution.
- No full closure or heap analysis from pasted code.
- Complex loops, recursion, DOM behavior, and framework-specific runtime effects are not fully simulated.

## Tech Stack

- Next.js App Router.
- React.
- TypeScript.
- Tailwind CSS.
- shadcn-style UI primitives.
- Zustand.
- Framer Motion.
- Monaco Editor.
- Recharts.
- Babel parser, traverse, and types.
- Prettier.
- Zod.
- Vitest.
- Playwright.

## Project Structure

```txt
src/
  app/                 Next.js routes, SEO metadata, robots, sitemap
  analyzer/            AST parsing, pattern extraction, confidence, action output
  components/          UI, playground, visualizer, dashboards, docs-like panels
  demos/               Guided demos and editable demo catalog
  editable/            Editable schemas, generators, validation
  engine/              Visual event engine and trace summarization
  nodePlayground/      Node scenario data, authoring helpers, runtime diagnosis
  patterns/            Analyzer pattern helpers
  product/             Product architecture, routes, learning paths
  security/            Headers, privacy, clipboard, posture metadata
  simulator/           Pattern-to-event simulation
  store/               Zustand stores and local progress
  utils/               URL state, sharing, helper utilities
docs/
  PRODUCT.md
  ARCHITECTURE.md
  SAFETY_SECURITY.md
  SEO.md
  OPERATIONS.md
  CONTRIBUTING.md
tests/
  browser/             Playwright smoke tests
  *.test.ts            Unit, contract, quality, security, SEO tests
```

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run development server:

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

## Quality Commands

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm qa:browser
```

The test suite protects:

- Visual engine behavior.
- Editable validation.
- URL state encoding and decoding.
- Analyzer pattern extraction.
- Demo and Node scenario quality contracts.
- Product hardening rules.
- Security headers.
- SEO sitemap and robots output.
- Browser smoke rendering.

## SEO

The product includes:

- Global metadata in `src/app/layout.tsx`.
- Per-route metadata for major product pages.
- Dynamic metadata for `/demo/[id]`.
- JSON-LD structured data for the software application.
- `src/app/sitemap.ts` for all major routes and demo pages.
- `src/app/robots.ts` with the quality dashboard excluded from search.

Set the canonical production URL with:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

See `docs/SEO.md` for the full SEO model.

## Documentation

- `docs/PRODUCT.md` explains positioning, user jobs, surfaces, and roadmap.
- `docs/ARCHITECTURE.md` explains code architecture and data flow.
- `docs/SAFETY_SECURITY.md` explains the trust and security model.
- `docs/SEO.md` explains metadata, sitemap, robots, and content strategy.
- `docs/OPERATIONS.md` explains local development, QA, deployment, and release checks.
- `docs/CONTRIBUTING.md` explains how to add or improve cases safely.
- `docs/LAUNCH_PACKAGE.md` contains the tagline, launch copy, screenshots plan, demo GIF/video plan, release checklist, and Vercel notes.

## Product Positioning

JS Clarity Lab is not trying to replace Chrome DevTools, VS Code, Node inspector, or a full runtime debugger.

It is built for the moment before deep debugging, when the developer needs a clear mental model:

> I saw something confusing. Show me the order, the reason, the risk, and the fix.
