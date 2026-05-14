# JS Clarity Lab 5-User Usability Test

Run this before adding backend, accounts, classrooms, or public snippets. The purpose is to find where real users hesitate.

## Participants

Use five people across the intended audience:

- 1 beginner learning async JavaScript
- 1 bootcamp/student user
- 1 working frontend developer
- 1 backend/Node developer
- 1 teacher, mentor, or interview-prep user

## Tasks

1. **Why does this output happen?**
   - Start at `/demo/promise-before-timeout`
   - Success: user can explain why the output is `A -> D -> C -> B`.
   - Watch: do they find Predict, Run, Console, and Short answer?

2. **Find why this API is slow.**
   - Start at `/node-playground?scenario=express-slow-route&mode=problem`
   - Success: user identifies blocking/sequential work and opens the fixed path.
   - Watch: do they understand blocked time, output difference, and fix notes?

3. **Save debug notes for this issue.**
   - Start at `/analyze`
   - Success: user analyzes pasted code, sees confidence/limits, saves or copies useful notes.
   - Watch: do they know what was simulated versus only detected?

## Script

Say this:

> Please think aloud. I am testing the product, not you. If anything feels confusing, say exactly where you got stuck.

Do not explain the product unless the user is blocked for more than 60 seconds.

## What To Record

For each task, record:

- completion: pass / partial / fail
- time to first useful action
- hesitation points longer than five seconds
- words the user used to describe the tool
- what they expected to happen next
- whether they trusted the result
- whether they knew what to do after finishing

## Decision Rule

After five users:

- Fix any hesitation that appears in 3+ sessions.
- Rewrite copy if 2+ users misread the same label.
- Move or hide a panel if users stare at it but do not use it.
- Do not add backend until users clearly ask for accounts, teams, classrooms, or cross-device sync.

The in-app route `/usability-test` contains the same test kit for quick manual sessions.
