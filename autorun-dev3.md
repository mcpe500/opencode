# opencode-termux-hardmode

Your only job is to make the **existing upstream OpenCode** run on **native Termux**.

Do not make a clone.
Do not make a simplified replacement.
Do not make a fake wrapper and call it success.
Do not switch to another tool.
Do not call proot success.
Do not hallucinate.

## Mission

Final success means:

- the real upstream OpenCode repository
- the real `opencode` command
- running in **native Termux**
- with real behavior, not mocked behavior

Success ladder:

1. `opencode --version`
2. `opencode --help`
3. `opencode run "hello"`
4. `opencode`
5. normal project usage

Only step 5 is full success.

## Non-success

These are NOT success:

- fake `opencode`
- OpenCode-lite
- custom reimplementation
- shell wrapper that only prints expected output
- only installer works
- only `--version` works
- only `--help` works
- only proot works
- only remote server works
- only partial feature subset works and you stop there

These may be milestones or fallbacks, but not final success.

## Truthfulness

Be evidence-driven.

Never claim something works unless you ran it.
Never claim something is impossible unless major routes were checked.
Never turn “this route failed” into “the whole mission is impossible.”

Every conclusion must be backed by:
- command output
- build output
- stack trace
- file/binary metadata
- package metadata
- source inspection

If uncertain, say uncertain.

## First step

Do not guess.
Do not rewrite the product.
Do not invent new architecture.

First reproduce the real failure in native Termux.

Capture:

- install/build command
- exact error
- selected package/artifact
- binary path
- whether failure is:
  - installer
  - build
  - launcher
  - binary
  - runtime
  - TUI

Useful commands:

```bash
which opencode || true
file "$(which opencode)" || true
readelf -l "$(which opencode)" 2>/dev/null | grep interpreter || true
ldd "$(which opencode)" 2>/dev/null || true
opencode --version
opencode --help
opencode run "hello"
opencode
````

## Allowed changes

You may modify what is necessary to make the real OpenCode work, including:

* installer
* package manifests
* postinstall logic
* build scripts
* platform detection
* target selection
* packaging
* launcher/runtime selection
* Android/Termux compatibility logic
* Bun/Node split handling

But all changes must still serve the real upstream OpenCode.

## Forbidden changes

You must NOT:

* replace OpenCode with your own implementation
* remove major functionality just to fake compatibility
* hardcode fake outputs
* stop after making a partial dummy command work
* call fallback success
* declare “blocked” too early
* claim “fundamental incompatibility” unless major routes were actually checked

## Required route coverage before saying "blocked"

Before concluding native Termux is blocked, you must evaluate at least these:

1. official installer / npm path
2. selected binary/package path
3. source-build path
4. runtime split path (Bun vs Node if present in repo)
5. CLI vs TUI split
6. fallback comparison path for diagnosis only

If these have not been checked, you are not allowed to conclude “blocked.”

## Blocker rule

If one route fails:

* say exactly which route failed
* show the evidence
* say what that failure does NOT prove
* list the next route to try
* continue

Example of valid conclusion:

* “official Bun Linux binary path is blocked on native Termux because the binary is non-PIE”

Example of invalid conclusion:

* “therefore OpenCode can never run on Termux”

## Fallback rule

Fallbacks are allowed only as:

* diagnosis
* temporary workaround
* comparison

Examples:

* proot Ubuntu
* proot Alpine
* glibc compatibility
* remote Linux

If a fallback works, label it clearly as `fallback`, not success.

## Loop

Repeat forever:

1. inspect current failure
2. choose one concrete hypothesis
3. make the smallest real change
4. test the real upstream OpenCode
5. record result
6. keep if it is real progress
7. revert if useless or fake
8. continue

One hypothesis at a time.

## Logging

Append each attempt to `results.tsv` as tab-separated values:

```tsv
commit	attempt	environment	command	result	status	description
```

Allowed `status` values:

* `keep`
* `discard`
* `crash`
* `fallback`

## Required summary after every attempt

```text
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
```

## What counts as real progress

Real progress:

* more precise failure classification
* correct platform/package selection
* source build gets further
* real upstream CLI works
* real upstream run command works
* real upstream interactive mode works
* fallback verified and clearly labeled as fallback

Not real progress:

* fake replacement
* fake wrapper
* cosmetic success
* partial stub
* fallback mislabeled as success

## Final rule

Always remember:

**The goal is to make the existing upstream OpenCode run on native Termux.**

Not a clone.
Not a mock.
Not a fallback.
Not a hallucinated success.

The real OpenCode.
On native Termux.
