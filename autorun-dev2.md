# opencode-termux-bringup

This is a debugging and bring-up task.

The mission is singular:

**Make the existing upstream OpenCode run on native Termux.**

This means:
- the real upstream OpenCode repository
- the real CLI entrypoint
- the real runtime
- the real commands
- the real behavior
- no fake replacement
- no simplified clone
- no “Termux edition” that is actually a different program

---

## Non-negotiable rule

You must not create your own substitute implementation.

You are not allowed to:
- build a fake `opencode` wrapper and call that success
- make a toy clone that only imitates the CLI
- replace OpenCode with another tool
- strip away major features and call it “working”
- invent unsupported claims without verifying them
- claim success unless the real upstream OpenCode actually runs

Your job is to make **the existing OpenCode** work on Termux, not to make something else.

---

## Main goal

Final success means:

**The actual upstream OpenCode runs in native Termux.**

Success ladder:

1. `opencode --version` runs in native Termux
2. `opencode --help` runs in native Termux
3. `opencode run "hello"` runs in native Termux
4. `opencode` interactive mode runs in native Termux
5. normal project usage works in native Termux

Only step 5 is full success.

Steps 1–4 are milestones, not final success.

---

## What does NOT count as success

These are explicitly not success:

- a fake implementation
- a “lite” rewrite
- a shell script that only prints expected output
- a wrapper around a broken binary that only makes `--version` work
- only getting the installer to complete
- only making a partial command work
- only making proot Ubuntu work
- only making proot Alpine work
- only proving a remote machine works
- stopping at “it builds” if it still does not run
- stopping at “it launches” if actual usage is broken

Fallbacks and partial milestones are useful, but they are not the mission.

---

## Truthfulness rule

You must be evidence-driven.

Never guess that something works.
Never claim compatibility unless tested.
Never claim a blocker is fundamental unless you have direct evidence.

Every conclusion must be based on one or more of:
- command output
- build output
- stack traces
- file metadata
- binary metadata
- source code inspection
- package metadata
- runtime behavior

If uncertain, say uncertain.
If blocked on one route, say that route is blocked.
Do not upgrade “one route failed” into “the whole mission is impossible” unless all major routes have been tested.

---

## Setup

To set up a run:

1. Propose a tag based on today’s date, e.g. `mar24-termux`
2. Create a branch:
   ```bash
   git checkout -b termux/<tag>
````

3. Read the repository, focusing on:

   * `README.md`
   * package manifests
   * installer scripts
   * postinstall scripts
   * CLI entrypoints
   * build scripts
   * platform detection
   * release/publish logic
   * runtime launcher/wrappers
   * any Node/Bun split
   * any Android/Linux platform assumptions
4. Initialize `results.tsv` with only the header row
5. Start with a baseline reproduction in native Termux

Do not start with random edits.
Do not start by rewriting large parts of the code.
First reproduce the failure.

---

## Baseline first

The very first run must establish the current failure of the real upstream OpenCode in native Termux.

Capture:

* install/build command used
* exact output
* exact error
* binary path
* package selected
* platform detected
* whether failure happens at install, build, launch, or runtime

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
```

If building from source:

```bash
git status
git rev-parse --short HEAD
```

---

## Allowed actions

You may modify whatever is necessary to make the real OpenCode run on native Termux, including:

* build scripts
* package manifests
* installer logic
* postinstall logic
* platform detection
* target selection
* runtime launcher/wrappers
* Android-specific handling
* Bun/Node selection logic
* release packaging
* compatibility shims

But all changes must serve the real upstream OpenCode.

---

## Forbidden actions

You must NOT:

* create a fake OpenCode implementation
* replace the product with a different code path that is no longer OpenCode
* remove major functionality just to fake compatibility
* hardcode fake output for version/help
* declare proot success as native Termux success
* stop at a partial milestone and call it complete
* say “blocked” without showing evidence
* say “impossible” unless all major realistic routes have been checked

---

## Required mindset

This is a trial-and-error debugging loop.

Each iteration must test one concrete hypothesis.

Examples:

* wrong platform detection
* wrong npm package chosen
* wrong binary artifact
* wrong ELF interpreter
* non-PIE executable
* Bun-specific runtime assumption
* Node-compatible path exists but is not selected
* installer rejects Android even though source could work
* TUI is broken but CLI is recoverable
* package publishing is missing Android target

Test one thing at a time.

---

## Major route coverage requirement

Before concluding that native Termux is blocked, you must evaluate all major routes that are realistically available in the repo.

At minimum, check:

1. **Official install path**

   * npm install path
   * install script path
   * postinstall/package resolution path

2. **Binary path**

   * what binary is selected
   * whether it is Linux/glibc-only
   * PIE vs non-PIE
   * Android compatibility

3. **Source-build path**

   * whether OpenCode can be built from source in Termux
   * whether build fails because of dependencies, runtime, or packaging

4. **Runtime split path**

   * whether the repo has separate Bun and Node entry/runtime paths
   * whether a real Node-compatible route exists
   * whether only some modules are Bun-specific

5. **CLI vs TUI split**

   * whether CLI can run before TUI
   * whether TUI is the only broken part

6. **Fallback comparison path**

   * compare native Termux vs proot only for diagnosis
   * do not treat fallback as final success

Do not conclude “fundamental incompatibility” until these have been investigated.

---

## Blocker handling

If one approach fails, do not stop.

Instead, classify the failure as one of:

* installer route blocked
* build route blocked
* binary route blocked
* launcher route blocked
* runtime route blocked
* TUI route blocked
* packaging route blocked
* upstream blocker
* fallback-only route

When a route is blocked, you must do all of the following:

1. state exactly which route is blocked
2. show the evidence
3. state what this does NOT prove
4. list the next untried routes
5. continue with the next route

Example:

* valid conclusion:

  * “official Bun Linux binary path is blocked on native Termux because the binary is non-PIE”
* invalid conclusion:

  * “therefore full OpenCode is impossible everywhere on Termux”

---

## Fallback rule

Fallbacks are allowed only for comparison, diagnosis, or temporary usability.

Examples:

* proot Ubuntu
* proot Alpine
* remote Linux via SSH
* glibc compatibility layer

These may be logged as:

* diagnostic success
* fallback available

They are not final success.

If a fallback works, record it clearly as fallback and continue pursuing native Termux support unless conclusively impossible.

---

## Logging results

After every attempt, append a line to `results.tsv` (tab-separated, not comma-separated).

Header:

```tsv
commit	attempt	environment	command	result	status	description
```

Columns:

1. `commit` — short git hash
2. `attempt` — short label, e.g. `baseline`, `fix-platform`, `source-build`, `node-route`, `tui-test`
3. `environment` — `termux`, `termux+glibc`, `alpine-proot`, `ubuntu-proot`, etc.
4. `command` — best real command tested
5. `result` — `success` or `fail`
6. `status` — `keep`, `discard`, `crash`, or `fallback`
7. `description` — short factual summary

Example:

```tsv
commit	attempt	environment	command	result	status	description
a1b2c3d	baseline	termux	opencode --version	fail	keep	official install selects incompatible artifact on Android
b2c3d4e	fix-platform	termux	opencode --version	fail	discard	platform detected correctly but selected package still unusable
c3d4e5f	source-build	termux	opencode --help	fail	keep	source build gets farther than release binary
d4e5f6g	node-route	termux	opencode --help	success	keep	real upstream CLI works via verified node-compatible entry path
e5f6g7h	tui-test	termux	opencode	fail	keep	CLI works but interactive mode still broken
f6g7h8i	proot-check	alpine-proot	opencode	success	fallback	fallback works in alpine proot but is not native success
```

Do not commit `results.tsv`.

---

## Output format after each attempt

After each attempt, produce:

```text
---
attempt:          <label>
environment:      <termux / termux+glibc / alpine-proot / etc>
command_tested:   <real command>
result:           <success / fail>
route:            <installer / build / binary / runtime / tui / fallback>
evidence:         <exact short factual evidence>
status:           <keep / discard / crash / fallback>
description:      <short factual summary>
next_action:      <next hypothesis to test>
```

This summary must be factual.
Do not exaggerate.
Do not declare final success unless the real upstream OpenCode truly runs.

---

## Real progress criteria

These count as real progress:

* more precise failure classification
* correct platform detection
* correct package selection
* source build advancing farther
* real upstream CLI starts working
* real upstream `opencode --help` works
* real upstream `opencode run "hello"` works
* real upstream interactive mode works
* a fallback is verified and clearly marked as fallback

These do not count:

* making a fake clone
* wrapping broken behavior and pretending it works
* only printing version/help text
* proving only proot works
* declaring victory too early

---

## Crash handling

If an attempt crashes:

1. capture the exact error
2. inspect logs and artifacts
3. decide whether it is:

   * a small bug worth fixing immediately
   * a dead end worth discarding
4. if small, fix and rerun
5. if dead end, log it as `crash` and move on

Do not loop blindly on the same crash.

---

## Simplicity rule

Prefer the smallest clean fix that makes the real OpenCode work.

A clean upstreamable compatibility fix is better than a large hack.
A real fix is better than a fake workaround.
A fallback is better than nothing, but it must be labeled as fallback.

---

## Never prematurely stop

Do not stop just because:

* one install route failed
* one runtime failed
* Bun failed once
* TUI failed once
* a wrapper partially worked
* a fallback worked

You may only conclude one of the following:

1. **full success**

   * the real upstream OpenCode works in native Termux

2. **partial milestone**

   * one step of the success ladder works, but mission not complete

3. **native Termux blocked for now**

   * only after major routes have been tested and documented

4. **fallback available**

   * a non-native route works and is verified

5. **upstream blocker**

   * specific upstream changes are required, with exact evidence

If blocked, you must still provide:

* the exact blocker
* the evidence
* the smallest upstream patch plan
* the best verified fallback
* which files/subsystems likely need modification

---

## Final rule

At all times, remember:

**The goal is to make the existing upstream OpenCode work on native Termux.**

Not a clone.
Not a mock.
Not a replacement.
Not a hallucinated success.
Not just a fallback.

The real OpenCode.
On native Termux.
