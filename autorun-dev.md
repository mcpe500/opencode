**success criteria-nya harus “full OpenCode jalan di Termux”**,
**bukan**:

* bikin clone / versi mini OpenCode
* bikin wrapper yang pura-pura jalan
* bikin “alternative tool”
* bikin OpenCode-lite
* bikin partial binary yang cuma `--help`
* atau fallback proot lalu dianggap selesai

Jadi prompt-nya harus memaksa agent untuk:

1. **trial and error cari penyebab gagal build/run**
2. **fix satu-satu**
3. **selalu test full OpenCode**
4. **baru kalau mentok, cari alternative path**
5. **tapi alternative itu bukan success final**
6. **success final tetap: full OpenCode jalan di native Termux**

Ini versi yang jauh lebih tepat:

# opencode-termux-bringup

This is an experiment to make the real, full OpenCode run on native Termux.

This is not a research task.
This is not a model-tuning task.
This is not a rewrite-the-product task.
This is not a make-a-simplified-clone task.

This is a debugging, bring-up, and trial-and-error engineering task.

## Core mission

The mission is singular:

**Make the actual upstream OpenCode run in native Termux.**

That means the real OpenCode codebase, real CLI, real runtime behavior, and real features as much as possible.

The task is to repeatedly investigate why OpenCode fails to build or run in Termux, apply one fix at a time, test again, and continue until the real OpenCode works in native Termux.

## What counts as success

The only real success is:

**The full OpenCode runs in native Termux.**

“Full OpenCode” means:
- the real upstream codebase
- the real CLI entrypoint
- the real runtime
- the real command surface
- the real TUI/interactive mode if upstream normally has it
- no fake replacement implementation
- no “lite” clone
- no alternate toy script pretending to be OpenCode

Success ladder, in order:

1. `opencode --version` runs in native Termux
2. `opencode --help` runs in native Termux
3. `opencode run "hello"` runs in native Termux
4. `opencode` interactive mode runs in native Termux
5. normal project usage works in native Termux

The final target is step 5.

## What does NOT count as success

These do **not** count as success:

- making a simplified custom OpenCode-like script
- making a reduced “Termux edition” that removes core functionality
- replacing the real binary with a wrapper that only fakes success
- making only the installer succeed while the program still does not run
- making only `--help` work and then stopping
- switching to another tool and calling it success
- using Ubuntu proot and calling that native Termux support
- using Alpine proot and calling that native Termux support
- replacing OpenCode internals with a different product
- making a local hack that bypasses the real problem without understanding it

A partial milestone is allowed as progress, but it is **not final success**.

## Allowed fallback behavior

Fallbacks are allowed only as diagnostic or temporary alternatives.

Examples of fallback paths:
- npm path instead of standalone binary
- wrapper for launch diagnostics
- glibc compatibility layer if truly needed
- alpine/ubuntu proot for comparison testing
- alternate packaging route

But these are only for:
- isolating the failure
- comparing behavior
- identifying blockers
- finding a temporary workaround

A fallback is **not** the end goal.

If a fallback works, record it, but continue driving toward native Termux support for the real OpenCode.

## Setup

To set up a new run, do the following:

1. **Agree on a run tag** based on today's date, for example `mar24-termux`.
2. **Create the branch**: `git checkout -b termux/<tag>` from current main/master.
3. **Read the repo for full context**, especially:
   - `README.md`
   - CLI entrypoint
   - build scripts
   - package manifests
   - installer script
   - postinstall logic
   - release logic
   - target definitions
   - platform detection
   - launcher/wrapper logic
   - any code that chooses binaries by OS/arch
4. **Establish the baseline failure** in native Termux first.
5. **Create `results.tsv`** with only the header row.
6. **Confirm setup looks good** and begin.

## Baseline first

The first run must always reproduce the existing failure.

Do not begin by guessing.
Do not begin by rewriting the product.
Do not begin by inventing a custom Termux-only mini implementation.

First, reproduce exactly why the real OpenCode fails in native Termux.

Capture:
- install command used
- build command used
- exact failing command
- exact stderr/stdout
- binary path
- file metadata
- whether failure is during install, build, launch, or runtime
- whether failure happens before the CLI starts or after it starts

Useful commands:

```bash
which opencode || true
file "$(which opencode)" || true
readelf -l "$(which opencode)" | grep interpreter || true
ldd "$(which opencode)" || true
opencode --version
opencode --help
opencode run "hello"
opencode
````

If building from source is needed, also inspect:

* produced build artifacts
* package resolution
* selected platform target
* expected vs actual runtime dependencies

## What you CAN do

You may modify anything necessary to make the real OpenCode run on native Termux, including:

* build scripts
* installer logic
* target selection
* package resolution
* postinstall logic
* release definitions
* platform detection
* runtime launcher/wrappers
* binary packaging
* compatibility layers
* Android/Termux-specific target handling
* CI/build metadata if needed

You may also add small, targeted compatibility code if required.

## What you CANNOT do

You must NOT:

* replace OpenCode with a simpler custom implementation
* strip away major functionality just to say it runs
* create a fake launcher that does not run the actual product
* stop after a tiny partial milestone and call it done
* define proot as native Termux success
* define a workaround as full success unless the real upstream code actually runs
* stop at “it builds” if it still does not run
* stop at “it launches” if normal usage still breaks badly

## Success discipline

Every change must be judged by this question:

**Does this help the real, full OpenCode run in native Termux?**

If the answer is no, discard it.

A change that merely creates a fake partial substitute is not progress.

A change that makes only a tiny subset work is only a milestone, not success.

## Trial-and-error loop

LOOP FOREVER:

1. Check current git branch and commit
2. Review the current failure and previous attempts
3. Choose exactly one hypothesis for why OpenCode fails in Termux
4. Make the smallest reasonable change to test that hypothesis
5. Commit the change
6. Build/install/test the real OpenCode in native Termux
7. Capture the exact result
8. If it fails, inspect logs, binaries, packaging, and runtime details
9. Record the result in `results.tsv`
10. If the change creates real forward progress toward full native Termux support, keep it
11. If the change is useless, misleading, or only creates a fake partial solution, revert it
12. Continue with the next hypothesis

## Failure categories

Every failed attempt should be classified into one or more categories:

* wrong installer artifact
* wrong package selected
* wrong platform detection
* wrong target triple
* wrong binary format
* wrong ELF interpreter
* non-PIE executable
* incompatible runtime linkage
* missing shared libraries
* Bionic vs glibc mismatch
* launcher/wrapper issue
* path/env issue
* npm/postinstall resolution issue
* standalone binary issue
* TUI/runtime issue after launch
* Termux terminal capability issue
* Android-specific platform assumption
* upstream architecture blocker requiring official Android target

If none apply, define a new category clearly.

## How to use alternatives correctly

Alternatives are allowed only to learn or compare.

For example:

* compare official installer vs npm path
* compare native Termux vs proot Ubuntu
* compare native Termux vs proot Alpine
* compare standalone binary vs source build
* compare glibc-based approach vs Android-native approach

Use alternatives to answer questions like:

* what specifically breaks only in native Termux?
* what assumption is valid in Linux but invalid in Android?
* what packaging step is selecting the wrong artifact?
* does the code itself work and only packaging fail?
* does CLI work but TUI fail?
* does source build work while release binary fails?

Alternatives should help isolate the blocker.
They should not replace the main mission.

## Logging results

When an experiment is done, log it to `results.tsv` as tab-separated values.

Header:

```tsv
commit	attempt	environment	command	result	status	description
```

Columns:

1. `commit` — short git hash
2. `attempt` — short label like `baseline`, `fix-target`, `fix-loader`, `npm-path`, `source-build`, `tui-test`
3. `environment` — `termux`, `termux+glibc`, `alpine-proot`, `ubuntu-proot`, etc.
4. `command` — best real command tested, such as:

   * `opencode --version`
   * `opencode --help`
   * `opencode run "hello"`
   * `opencode`
5. `result` — `success` or `fail`
6. `status` — `keep`, `discard`, or `crash`
7. `description` — short explanation of what was tried and what happened

Example:

```tsv
commit	attempt	environment	command	result	status	description
a1b2c3d	baseline	termux	opencode --version	fail	keep	official install fetches incompatible binary for native Termux
b2c3d4e	fix-platform-detect	termux	opencode --version	fail	discard	Termux detected but still resolves Linux glibc artifact
c3d4e5f	source-build	termux	opencode --help	fail	keep	source build gets farther but runtime still fails on launch
d4e5f6g	fix-android-target	termux	opencode --help	success	keep	real OpenCode binary now launches in native Termux
e5f6g7h	tui-bringup	termux	opencode	fail	keep	CLI works but interactive mode still has terminal/runtime issues
f6g7h8i	tui-fix	termux	opencode	success	keep	full OpenCode interactive mode works in native Termux
```

Do not commit `results.tsv`.

## Output format after each attempt

After every attempt, produce a concise summary like this:

```text
---
attempt:          baseline
environment:      termux
command_tested:   opencode --version
result:           fail
failure_category: wrong binary target
status:           keep
description:      reproduced native Termux failure using the real upstream install path
```

For success:

```text
---
attempt:          tui-fix
environment:      termux
command_tested:   opencode
result:           success
failure_category: none
status:           keep
description:      full upstream OpenCode now runs interactively in native Termux
```

## What counts as real progress

These count as real progress:

* failure becomes more precise and better understood
* wrong artifact selection is fixed
* platform detection is corrected
* source build gets further than release build
* binary metadata becomes Android/Termux-compatible
* `opencode --version` works using the real OpenCode
* `opencode --help` works using the real OpenCode
* `opencode run "hello"` works using the real OpenCode
* interactive `opencode` works using the real OpenCode
* normal project usage works in native Termux

These do not count as real progress:

* making a fake substitute tool
* inventing a stripped-down OpenCode clone
* proving only proot works
* repeating the same failure without learning anything
* stopping after a cosmetic win
* declaring victory before the real OpenCode actually runs

## Crash handling

If an attempt crashes:

1. capture the exact error
2. inspect logs and artifacts
3. determine whether the issue is:

   * a small bug worth immediately fixing
   * a dead-end idea that should be discarded
4. if it is small and local, fix and rerun
5. if the idea is fundamentally wrong, log it as `crash` and move on

## Simplicity criterion

All else being equal, simpler is better.

A clean upstreamable fix is better than a pile of hacks.
A real compatibility fix is better than a fake workaround.
A small change that makes the real OpenCode run is excellent.
A large rewrite that changes the product into something else is unacceptable.

## Never stop

Once the loop begins, do NOT pause to ask the human whether to continue.
Do NOT ask “should I keep going?”
Do NOT stop after finding only a workaround.
Do NOT stop after making only a partial clone run.

Continue until one of these is true:

1. the real full OpenCode runs in native Termux
2. the exact blocker is conclusively proven and documented
3. the best verified fallback is found and clearly marked as fallback, not success
4. the human manually interrupts you

The mission is singular:

**Keep trial-and-error debugging until the real full OpenCode runs in native Termux, not a simplified replacement.**

```

Kalau mau, saya bisa lanjut bikin **versi yang lebih pendek, lebih galak, dan lebih “agent-proof”**, supaya OpenCode tidak nyeleneh bikin versi palsu lagi.
