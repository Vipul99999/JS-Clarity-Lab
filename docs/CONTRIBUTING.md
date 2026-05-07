# Contributing Guide

## Product Rule

Do not add random examples. Add cases that solve real confusion.

Every case should answer:

- What confused the user?
- What will they predict?
- What happens visually?
- Why does it happen?
- Where does this appear in real life?
- What is the safer fix or mental model?

## Adding A Guided Demo

Required fields:

- `id`
- `title`
- `category`
- `difficulty`
- `concept`
- `code`
- `prediction`
- `events`
- `explanation`
- `realWorld`
- `recommendedNext`

Keep demos small. One concept per case.

## Adding An Editable Demo

Required pieces:

- Default params.
- Zod schema.
- Controls.
- Code generator.
- Event generator.
- Prediction generator.
- Explanation generator.
- Diff summary.

Rules:

- Validate all params.
- Keep controls safe and bounded.
- Do not execute generated code.
- Reset the timeline after parameter changes.
- Keep share URLs readable.

## Adding A Node Scenario

Use scenario authoring helpers when possible.

Required scenario quality contract:

- Concept.
- Prediction.
- Visual events.
- Explanation.
- Real-world bug.
- Fixed version.
- Recommended next case.
- Debugging playbook.
- Comparison data when problem/fixed mode exists.
- Trust label.

## Writing Explanations

Use short practical language:

- "This runs now because the call stack is still active."
- "The promise callback waits in the microtask queue."
- "The timer cannot run until the stack is clear."
- "This matters in tests, UI updates, API handlers, and background jobs."

Avoid heavy academic language as the first explanation. Add technical terms after the simple mental model.

## Accessibility Requirements

- Icon buttons need labels.
- Keyboard users must be able to navigate.
- Focus states must remain visible.
- Reduced-motion users should not be forced into intense animation.
- Tables and matrices need clear labels.
- Color should not be the only signal.

## Testing Requirements

Run:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm qa:browser
```

Add tests when changing:

- Event engine behavior.
- Analyzer extraction.
- Scenario data.
- Quality contracts.
- Security headers.
- SEO output.
- Core page rendering.

