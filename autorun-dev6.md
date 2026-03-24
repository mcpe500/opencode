Use autorun-dev5.md as the base mission. 
Then obey this continuation controller exactly.

Do not restart from baseline.
Do not ask me for the next step.
Do not stop after a single failed audit.
Do not stop after a fallback.
Do not stop after a milestone.
Continue automatically through Attempts 006 to 026 unless:
1. the real upstream OpenCode fully works on native Termux, or
2. Attempt 026 is completed and a final upstream blocker packet is produced.

glibc-runner wrapper is fallback-only, not success.
proot is fallback-only, not success.
A fake wrapper is not success.
A clone is not success.
Only the real upstream OpenCode on native Termux is success.

You must append every attempt to results.tsv.

Schema:
commit	attempt	environment	command	result	status	description

Allowed status values:
- keep
- discard
- crash
- fallback
- milestone

After every attempt, output this exact format:

---
attempt:          <label>
environment:      <termux / termux+glibc / alpine-proot / ubuntu-proot>
command_tested:   <real command>
result:           <success / fail>
route:            <installer / build / binary / runtime / tui / fallback / milestone>
evidence:         <short factual evidence>
status:           <keep / discard / crash / fallback / milestone>
description:      <what changed and what happened>
next_action:      <next hypothesis>

Global rules:
- never hallucinate
- never claim success without running the real command
- never claim impossibility unless the relevant routes were actually tested
- never confuse packaging failure with runtime failure
- never confuse TUI failure with full CLI impossibility
- never replace OpenCode with a custom implementation
- if the same hypothesis fails twice with the same evidence, move on
- if a route crashes repeatedly without new evidence, mark crash and continue
- if a route produces a real milestone, keep it and continue

Attempt 006: workspace dependency resolution audit
Goal:
- determine how to run the real upstream source path in Termux with correct monorepo/workspace resolution
Inspect and test at minimum:
- root package.json
- turbo.json
- tsconfig.json
- packages/opencode/package.json
- packages/opencode/package.npm.json
- packages/opencode/tsconfig.json
- workspace aliases for @opencode-ai/*
Required outcome:
- prove whether node-route failure is mainly workspace resolution or not
If Attempt 006 fails, continue automatically.

Attempt 007: real monorepo source-build audit
Goal:
- run the real upstream source path from the correct monorepo context
- do not use a fake replacement
Required outcome:
- classify whether source-run failure is dependency-resolution, bun-runtime, db-runtime, or entrypoint-specific
If Attempt 007 fails, continue automatically.

Attempt 008: Bun-specific import isolation audit
Goal:
- identify which bun-specific imports are hard blockers for CLI startup
Classify findings into:
- CLI hard blocker
- TUI-only blocker
- storage/db blocker
- packaging-only blocker
- optional/non-blocking Bun dependency
If Attempt 008 fails, continue automatically.

Attempt 009: CLI-vs-TUI split bring-up
Goal:
- prove whether the real upstream CLI can run in native Termux before full TUI works
Required checks if possible:
- opencode --version
- opencode --help
- opencode run "hello"
- opencode
If CLI works but TUI fails:
- record milestone
- continue
If Attempt 009 fails, continue automatically.

Attempt 010: Android packaging/install target patch audit
Goal:
- determine exactly where Android/Termux is rejected or mapped incorrectly
Inspect and test at minimum:
- install
- packages/opencode/script/postinstall.mjs
- packages/opencode/script/publish.ts
- packages/opencode/package.npm.json
- platform/arch selection logic
Classify result as:
- installer-only blocker
- packaging-only blocker
- runtime-only blocker
- mixed blocker
If Attempt 010 fails, continue automatically.

Attempt 011: real CLI entrypoint dispatch audit
Goal:
- determine why current execution reaches Bun help instead of real OpenCode CLI
Inspect and test at minimum:
- packages/opencode/src/index.ts
- packages/opencode/src/node-entry.ts
- packages/opencode/src/node.ts
- packages/opencode/script/build-node.ts
- run-bun.sh
Required outcome:
- prove whether real CLI dispatch can work in native Termux
If Attempt 011 fails, continue automatically.

Attempt 012: argv/subcommand dispatch audit
Goal:
- determine whether argv forwarding, subcommand parsing, or entrypoint bootstrap is misrouting execution
Required outcome:
- classify exact dispatch failure if help/version lands in Bun instead of OpenCode
If Attempt 012 fails, continue automatically.

Attempt 013: storage/db backend audit
Goal:
- determine whether db/storage is blocking startup or only later commands
Inspect:
- db.ts
- db.node.ts
- db.bun.ts
- storage initialization path
Required outcome:
- classify db/storage as startup blocker, command blocker, or non-blocking
If Attempt 013 fails, continue automatically.

Attempt 014: bun:ffi usage scope audit
Goal:
- determine whether bun:ffi usage is essential for Termux CLI startup or only for platform-specific behavior
Required outcome:
- isolate whether ffi is required for CLI startup, only TUI, only win32, or optional
If Attempt 014 fails, continue automatically.

Attempt 015: process spawning and runtime env audit
Goal:
- determine whether process spawning, BUN_BE_BUN, env propagation, or shell assumptions break Termux execution
Required outcome:
- classify whether runtime env differences are primary blockers
If Attempt 015 fails, continue automatically.

Attempt 016: TTY/terminfo/TUI capability audit
Goal:
- determine whether native Termux terminal capabilities block the interactive mode specifically
Required outcome:
- separate TUI terminal blocker from general CLI blocker
If Attempt 016 fails, continue automatically.

Attempt 017: filesystem permission/path audit
Goal:
- determine whether /data/data paths, cwd handling, or private storage access break the real runtime
Required outcome:
- classify path/permission issue as startup blocker, run-command blocker, or glibc-only blocker
If Attempt 017 fails, continue automatically.

Attempt 018: temp/cache/home directory audit
Goal:
- determine whether temp dirs, cache dirs, HOME, XDG paths, or writable directory assumptions break execution
Required outcome:
- identify any directory assumptions that need Termux-specific handling
If Attempt 018 fails, continue automatically.

Attempt 019: symlink/hardlink/package-manager behavior audit
Goal:
- determine whether bun/npm linking strategy, symlinks, or hardlink assumptions break setup in Termux
Required outcome:
- classify package-manager/linking behavior as build blocker or install blocker
If Attempt 019 fails, continue automatically.

Attempt 020: release artifact composition audit
Goal:
- determine whether shipped artifacts are true OpenCode launchers or generic Bun-produced binaries with wrong dispatch
Required outcome:
- classify release artifact issue as packaging defect, build defect, or runtime defect
If Attempt 020 fails, continue automatically.

Attempt 021: minimal native CLI boot patch audit
Goal:
- find the smallest real upstream patch that allows the real CLI to boot natively in Termux
Important:
- this must still boot the real upstream OpenCode, not a fake substitute
Required outcome:
- prove whether a minimal boot patch exists
If Attempt 021 fails, continue automatically.

Attempt 022: full real command-path validation
Goal:
- validate the real command path end-to-end for:
  - --version
  - --help
  - run
Required outcome:
- classify exactly which commands now work, which still fail, and why
If Attempt 022 fails, continue automatically.

Attempt 023: interactive/TUI validation
Goal:
- validate whether full interactive opencode works once CLI path is stabilized
Required outcome:
- classify TUI as working, partially working, or blocked with exact evidence
If Attempt 023 fails, continue automatically.

Attempt 024: clean-install validation
Goal:
- verify whether the current best path still works from a clean install on native Termux
Important:
- do not rely on hidden leftover files or manual one-off state
Required outcome:
- classify whether the current solution is reproducible
If Attempt 024 fails, continue automatically.

Attempt 025: upstream patch-set preparation
Goal:
- if full success is not yet reached, prepare the smallest real upstream patch set needed
Required output:
- exact files needing change
- exact type of change
- whether change is installer-only, packaging-only, runtime-only, TUI-only, or mixed
This is not final success unless native Termux really works.
If Attempt 025 fails, continue automatically.

Attempt 026: final blocker packet and verified fallback
You may only do this after Attempts 006–025 were actually tested or explicitly classified with evidence.

If native Termux still does not fully work, produce all of the following:
1. exact blocker list
2. exact evidence for each blocker
3. what each blocker does NOT prove
4. smallest upstream patch plan
5. best verified fallback
6. exact files/subsystems needing modification
7. whether CLI is salvageable before TUI
8. whether installer/packaging/runtime/TUI blockers are separate or coupled

Mark the result only as:
- native blocked for now
or
- upstream blocker

Do not call Attempt 026 success unless the real upstream OpenCode fully works in native Termux.

Final reminder:
The goal is to make the existing upstream OpenCode run on native Termux.
Not a clone.
Not a mock.
Not a fallback.
Not a hallucinated success.

