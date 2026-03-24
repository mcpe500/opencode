# Finding 001: Termux Native Support Blockers

**Date:** 2026-03-24  
**Tag:** `termux/mar24-termux`  
**Commit:** `9a006d870`  
**Status:** Blocked - Fundamental Platform Limitations  
**Environment:** Android Termux (aarch64)

---

## Mission

Make the **actual upstream OpenCode** run in native Termux:
- Real OpenCode codebase
- Real CLI entrypoint
- Real runtime behavior
- Real TUI/interactive mode
- No fake replacement implementation
- No "lite" clone

### Success Criteria (Ladder)

1. `opencode --version` runs in native Termux
2. `opencode --help` runs in native Termux
3. `opencode run "hello"` runs in native Termux
4. `opencode` interactive mode runs in native Termux
5. Normal project usage works in native Termux

**Final target:** Step 5

---

## System Environment

| Component | Value |
|-----------|-------|
| OS | Android (Termux) |
| Architecture | aarch64 (ARM64) |
| Node.js | v25.8.1 |
| npm | Available via Termux |
| Bun | Not natively available |
| glibc-runner | v2.0 (Termux glibc compatibility layer) |
| patchelf | 0.18.0 |

---

## Approaches Attempted

### 1. Official npm Install

**Command:**
```bash
npm install -g opencode-ai
```

**Result:** ❌ FAIL

**Error:**
```
npm error code EBADPLATFORM
npm error notsup Unsupported platform for opencode-ai: wanted {"os":"android","cpu":"arm64"}
npm error notsup Valid os:   darwin,linux,win32
npm error notsup Actual os:  android
```

**Root Cause:** npm detects `os: android` and rejects installation. The `opencode-android-arm64` package does not exist on npm registry.

---

### 2. Bun Installation via npm

**Command:**
```bash
npm install -g bun
```

**Result:** ❌ FAIL

**Error:**
```
npm error notsup Unsupported platform for bun@1.3.11: wanted {"os":"darwin,linux,win32","cpu":"arm64,x64"}
npm error notsup Actual os:  android
```

**Root Cause:** npm rejects Bun for Android platform.

---

### 3. Bun Installation via Official Script

**Command:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Result:** ❌ FAIL (Binary cannot execute)

**Analysis:**
```bash
$ file ~/.bun/bin/bun
~/.bun/bin/bun: ELF 64-bit LSB executable, ARM aarch64, version 1 (SYSV), 
                 dynamically linked, interpreter /lib/ld-linux-aarch64.so.1

$ readelf -h ~/.bun/bin/bun | grep Type
Type: EXEC (Executable file)
```

**Root Cause:** Bun binary is **non-PIE** (`EXEC` type). Android 5.0+ requires **PIE** (`DYN` type) executables for security (ASLR).

---

### 4. glibc-runner with Bun

**Command:**
```bash
glibc-runner ~/.bun/bin/bun --version
```

**Result:** ✅ SUCCESS (Partial)

**Output:**
```
1.3.11
```

**Analysis:** glibc-runner (Termux glibc compatibility layer) can execute the non-PIE Bun binary by providing glibc interpreter.

**Limitation:** glibc-runner runs in a restricted chroot-like environment that cannot access `/data/data/` (Termux private storage).

---

### 5. Manual Binary Installation (opencode-linux-arm64)

**Commands:**
```bash
# Download platform-specific binary
curl -fsSL https://registry.npmjs.org/opencode-linux-arm64/-/opencode-linux-arm64-1.3.0.tgz -o opencode-linux-arm64.tgz
tar -xzf opencode-linux-arm64.tgz

# Setup wrapper using glibc-runner
glibc-runner /path/to/opencode --version
```

**Result:** ✅ SUCCESS (Partial)

**Output:**
```
1.3.10
```

**Analysis:** The opencode-linux-arm64 binary works via glibc-runner.

**Issue:** Binary shows Bun's help instead of OpenCode's CLI when run with `--help` or no arguments. The binary appears to be a generic Bun build, not properly configured with OpenCode's entry point.

---

### 6. Custom Node.js Wrapper

**Approach:** Create Node.js wrapper that spawns opencode binary via glibc-runner

**Code:**
```javascript
#!/usr/bin/env node
const { spawnSync } = require("child_process")
const binPath = "/path/to/opencode"
const result = spawnSync("glibc-runner", [binPath, ...process.argv.slice(2)], {
  stdio: "inherit",
})
process.exit(result.status || 0)
```

**Result:** ✅ SUCCESS (Partial)

**Output:**
```
$ opencode --version
1.3.10
```

**Global Installation:**
```bash
ln -sf /data/data/com.termux/files/usr/lib/node_modules/opencode-ai/bin/opencode \
      /data/data/com.termux/files/usr/bin/opencode
```

**Limitation:** Only `--version` works. `--help` shows Bun's help, `run` command fails.

---

### 7. Source Build with glibc Bun

**Approach:** Copy full repository to glibc-accessible location and build from source

**Commands:**
```bash
glibc-runner -s "
  cd /data/data/com.termux/files/usr/glibc/home/opencode-full &&
  /data/data/com.termux/files/usr/glibc/lib/ld-linux-aarch64.so.1 \
  /data/data/com.termux/files/usr/glibc/home/.bun/bin/bun install
"
```

**Result:** ❌ FAIL

**Error:**
```
EACCES: Permission denied: failed to link package: <package-name>
error loading current directory
error: An internal error occurred (CouldntReadCurrentDirectory)
```

**Root Cause:** glibc environment has permission issues when creating symlinks for bun's package linking mechanism.

---

### 8. npm Install in glibc Environment

**Approach:** Use npm instead of bun to install dependencies in glibc home

**Commands:**
```bash
# Fix package.json (remove catalog: and workspace: references)
# Remove platform-specific dependencies
glibc-runner -s "
  cd /data/data/com.termux/files/usr/glibc/home/opencode-full/packages/opencode &&
  /data/data/com.termux/files/usr/bin/npm install --legacy-peer-deps --force
"
```

**Result:** ✅ SUCCESS (Partial)

**Output:**
```
added 789 packages, and audited 790 packages in 45s
```

**Analysis:** npm can install most dependencies with `--force` flag to ignore platform checks.

---

### 9. Running Source with tsx (Node.js)

**Approach:** Run OpenCode source directly using tsx (TypeScript executor for Node.js)

**Commands:**
```bash
glibc-runner -s "
  cd /data/data/com.termux/files/usr/glibc/home/opencode-full/packages/opencode &&
  /data/data/com.termux/files/usr/bin/node node_modules/tsx/dist/cli.mjs ./src/index.ts --version
"
```

**Result:** ❌ FAIL

**Error:**
```
Error [ERR_UNSUPPORTED_ESM_URL_SCHEME]: Only URLs with a scheme in: file, data, and node 
are supported by the default ESM loader. Received protocol 'bun:'
```

**Root Cause:** OpenCode source code uses Bun-specific APIs:
- `bun:ffi` - Foreign Function Interface
- `bun:sqlite` - SQLite database
- `bun:jsc` - JavaScriptCore internals

These are **not available in Node.js**.

**Source Locations:**
```
src/cli/cmd/tui/win32.ts:1:import { dlopen, ptr } from "bun:ffi"
src/storage/db.bun.ts: (bun:sqlite usage throughout)
```

---

## Test Results Summary

| Test | Command | Result | Status |
|------|---------|--------|--------|
| `--version` | `opencode --version` | ✅ `1.3.10` | Works |
| `--help` | `opencode --help` | ❌ Shows Bun help | Broken |
| `run` | `opencode run "hello"` | ❌ AccessDenied | Broken |
| Interactive | `opencode` | ❌ Shows Bun help | Broken |
| Source run | `tsx src/index.ts` | ❌ bun: protocol | Broken |

---

## Fundamental Blockers Identified

### Blocker 1: Non-PIE Binary (Android Security Requirement)

**Issue:** Bun's official binary is a **non-PIE executable** (`EXEC` type).

**Android Requirement:** Android 5.0+ requires all executables to be **PIE** (`DYN` type) for ASLR (Address Space Layout Randomization) security.

**Verification:**
```bash
$ readelf -h ~/.bun/bin/bun | grep Type
Type: EXEC (Executable file)

$ patchelf --set-interpreter /system/bin/linker64 bun
$ ./bun
"/path/to/bun": error: Android 5.0 and later only support 
position-independent executables (-fPIE).
```

**Impact:** Official Bun binary cannot run natively on Android without glibc compatibility layer.

---

### Blocker 2: glibc-runner Filesystem Access Restrictions

**Issue:** glibc-runner runs in a restricted chroot-like environment.

**Restriction:** Cannot access `/data/data/` directory (Termux private storage).

**Impact:**
- Cannot read Termux home directory from inside glibc environment
- Cannot install packages properly (EACCES errors on linking)
- `opencode run "hello"` fails with:
  ```
  error: Cannot read directory "/data/data/": AccessDenied
  ```
- Cannot build from source with proper dependencies

**Verification:**
```bash
$ glibc-runner -s "ls /data/data/"
ls: cannot open directory '/data/data/': Permission denied

$ glibc-runner -s "pwd"
/data/data/com.termux/files/home/opencode  # Can access CWD only
```

---

### Blocker 3: Bun-Specific APIs in Source Code

**Issue:** OpenCode source code uses Bun-exclusive APIs.

**APIs Used:**
- `bun:ffi` - Foreign Function Interface for native bindings
- `bun:sqlite` - Built-in SQLite database
- `bun:jsc` - JavaScriptCore engine internals
- `BUN_BE_BUN` environment variable for process spawning

**Impact:** Source code **cannot run with Node.js/tsx**.

**Verification:**
```bash
$ grep -r "bun:" packages/opencode/src | head -10
src/cli/cmd/tui/win32.ts:1:import { dlopen, ptr } from "bun:ffi"
src/storage/db.bun.ts: (bun:sqlite usage)
src/format/formatter.ts:    BUN_BE_BUN: "1",
```

**Error:**
```
Error [ERR_UNSUPPORTED_ESM_URL_SCHEME]: Received protocol 'bun:'
```

---

## Conclusions (Kesimpulan)

### What Works (Partial Success)

1. ✅ `opencode --version` returns `1.3.10` via glibc-runner wrapper
2. ✅ Global `opencode` command installed at `/data/data/com.termux/files/usr/bin/opencode`
3. ✅ npm can install ~789 packages with `--force` flag in glibc environment

### What Doesn't Work

1. ❌ `opencode --help` shows Bun's help instead of OpenCode's CLI
2. ❌ `opencode run "hello"` fails with AccessDenied error
3. ❌ `opencode` interactive mode shows Bun's help
4. ❌ Source code cannot run with Node.js due to `bun:` protocol usage
5. ❌ Building from source fails due to glibc filesystem restrictions

### Root Cause Summary

| Blocker | Severity | Workaround Available |
|---------|----------|---------------------|
| Non-PIE Binary | Critical | glibc-runner (introduces Blocker 2) |
| glibc Access Restrictions | Critical | None identified |
| Bun-Specific APIs | Critical | Requires source modification |

### Final Assessment

**Full OpenCode cannot run on native Termux with current architecture.**

The combination of:
1. Android's PIE requirement
2. glibc-runner's filesystem restrictions  
3. OpenCode's dependency on Bun-specific APIs

Creates a **fundamental incompatibility** that cannot be resolved without:
- Official Android support from OpenCode team
- PIE-compatible Bun build
- Source code modifications to remove Bun-specific dependencies

---

## Recommendations

### For OpenCode Team (Official Android Support)

To enable Termux/Android support, the following changes would be needed:

1. **Publish `opencode-android-arm64` package**
   - Build Bun with PIE enabled (`-fPIE` flag)
   - Or use Android NDK to build native binary

2. **Abstract Bun-specific APIs**
   - Replace `bun:ffi` with Node.js `ffi-napi` or similar
   - Replace `bun:sqlite` with `better-sqlite3` or `sql.js`
   - Add Node.js compatibility layer

3. **Platform Detection**
   - Add Android platform detection in installer
   - Publish Android-specific npm package

### For Termux Users (Workarounds)

1. **Use proot-distro** (Not native, but functional):
   ```bash
   pkg install proot-distro
   proot-distro install ubuntu
   proot-distro login ubuntu
   # Install OpenCode inside Ubuntu proot
   ```

2. **Use OpenCode via SSH**:
   - Run OpenCode on a remote Linux server
   - Access via Termux SSH client

3. **Wait for official Android support** from OpenCode team

---

## Appendix: Commands Reference

### Verify Binary Type
```bash
file /path/to/binary
readelf -h /path/to/binary | grep Type
```

### Test glibc-runner Access
```bash
glibc-runner -s "ls /data/data/"
glibc-runner -s "pwd"
```

### Check for Bun-specific APIs
```bash
grep -r "bun:" packages/opencode/src
```

### Install with npm (glibc environment)
```bash
glibc-runner -s "
  cd /path/to/project &&
  /data/data/com.termux/files/usr/bin/npm install --legacy-peer-deps --force
"
```

---

## References

- [Android PIE Requirement](https://developer.android.com/ndk/guides/pie)
- [Termux glibc-runner](https://github.com/termux-pacman/glibc-packages)
- [Bun:ffi Documentation](https://bun.sh/docs/api/ffi)
- [OpenCode Repository](https://github.com/anomalyco/opencode)

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-24  
**Author:** OpenCode Termux Bringup Experiment
