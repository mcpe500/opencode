
Read specs/findings/001-termux-native-support.md first.

You must not stop at the Bun/glibc conclusion.
Reclassify the current status from:
- "fundamental incompatibility"
to:
- "official Bun binary route blocked on native Termux"

The mission remains unchanged:

Make the existing upstream OpenCode run on native Termux.

Do not make a clone.
Do not make a simplified replacement.
Do not make a fake wrapper and call it success.
Do not switch to another tool.
Do not call proot success.
Do not hallucinate.

The goal is the real upstream OpenCode, on native Termux.

Now continue with the next untried major route.

Attempt 002: node-route audit

Goal:
- determine whether the existing upstream repo already has a real Node-compatible runtime path for CLI commands
- do not create a fake implementation
- do not create a wrapper and call it success
- do not stop at a partial milestone
- if CLI works but TUI does not, record it only as a milestone and continue

You must inspect and test at minimum:
- packages/opencode/script/build-node.ts
- packages/opencode/src/node.ts
- packages/opencode/src/storage/db.node.ts
- packages/opencode/src/storage/db.ts
- packages/opencode/script/postinstall.mjs
- packages/opencode/script/publish.ts

Your task in this attempt is to prove one of these:
1. the real upstream CLI can run through a Node-compatible path in native Termux, or
2. that path is not sufficient, with exact evidence

You must verify with real commands and real output.
Never claim something works unless you actually ran it.

Required checks if possible:
- opencode --version
- opencode --help
- opencode run "hello"
- opencode

If node-route fails, do not stop.

Automatically continue to:

Attempt 003: packaging/install target audit

Goal:
- determine exactly where Android/Termux is rejected or mapped to the wrong artifact
- identify the smallest upstream patch needed
- state whether the blocker is installer-only, packaging-only, runtime-only, or broader

At all times:
- do not conclude "blocked" unless the route was actually tested
- do not conclude "impossible" unless all major realistic routes were checked
- do not stop after a fallback
- do not make a clone
- do not replace OpenCode with another implementation

You must append every attempt to results.tsv.

Use this schema:
commit	attempt	environment	command	result	status	description

Allowed status values:
- keep
- discard
- crash
- fallback

After every attempt, output this exact summary format:

---
attempt:          <label>
environment:      <termux / termux+glibc / alpine-proot / ubuntu-proot>
command_tested:   <real command>
result:           <success / fail>
route:            <installer / build / binary / runtime / tui / fallback>
evidence:         <short factual evidence>
status:           <keep / discard / crash / fallback>
description:      <what changed and what happened>
next_action:      <next hypothesis>

Remember:
A fallback is not success.
A wrapper is not success.
A partial milestone is not success.
Only the real upstream OpenCode running on native Termux is success.

