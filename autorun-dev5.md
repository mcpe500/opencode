Continue from the current results.tsv state.

Do not repeat the glibc-runner wrapper path unless it is needed only for comparison.
That route is fallback-only, not success.

Attempt 004: real CLI entrypoint audit

Goal:
- determine why the current execution path reaches Bun help instead of the real OpenCode CLI
- prove whether the existing upstream repo already has a real Node-compatible or source-compatible CLI entrypoint path
- do not create a fake wrapper
- do not create a replacement implementation
- do not call fallback success

You must inspect and test at minimum:
- packages/opencode/src/index.ts
- packages/opencode/src/node-entry.ts
- packages/opencode/src/node.ts
- packages/opencode/script/build-node.ts
- packages/opencode/package.json
- packages/opencode/package.npm.json
- run-bun.sh

Your task is to prove one of these:
1. the real upstream CLI can be dispatched correctly in native Termux, or
2. the current entrypoint path is fundamentally tied to Bun runtime behavior, with exact evidence

Required checks if possible:
- opencode --version
- opencode --help
- opencode run "hello"
- opencode

Important:
- If the result still lands in Bun help, explain exactly why
- If the issue is wrong dispatch/argv/entrypoint, classify it as entrypoint/runtime failure, not general incompatibility
- If packaging is still wrong, record it separately; do not confuse packaging with runtime dispatch

If Attempt 004 fails, automatically continue to:

Attempt 005: packaging/install target audit

Goal:
- identify exactly where Android/Termux is rejected or mapped to the wrong artifact
- identify the smallest upstream patch needed
- state clearly whether the blocker is installer-only, packaging-only, runtime-only, or broader

Remember:
- fallback is not success
- wrapper is not success
- partial milestone is not final success
- only the real upstream OpenCode running on native Termux is success
