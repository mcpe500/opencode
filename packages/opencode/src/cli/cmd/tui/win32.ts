// Bun FFI shim for Node.js compatibility
// Windows console handling - no-op on non-Windows platforms

const isWindows = process.platform === "win32"

let kernel: any | undefined

function loadKernel() {
  if (!isWindows) return false
  try {
    // On Node.js, would need ffi-napi package
    // For now, return false to skip Windows-specific handling
    return false
  } catch {
    return false
  }
}

/**
 * Clear ENABLE_PROCESSED_INPUT on the console stdin handle.
 * No-op on non-Windows platforms.
 */
export function win32DisableProcessedInput() {
  if (!isWindows) return
  if (!process.stdin.isTTY) return
  if (!loadKernel()) return
  // Would need ffi-napi for actual implementation on Node.js
}

/**
 * Discard any queued console input (mouse events, key presses, etc.).
 * No-op on non-Windows platforms.
 */
export function win32FlushInputBuffer() {
  if (!isWindows) return
  if (!process.stdin.isTTY) return
  if (!loadKernel()) return
  // Would need ffi-napi for actual implementation on Node.js
}

let unhook: (() => void) | undefined

/**
 * Keep ENABLE_PROCESSED_INPUT disabled.
 * No-op on non-Windows platforms.
 */
export function win32InstallCtrlCGuard() {
  if (!isWindows) return
  if (!process.stdin.isTTY) return
  if (!loadKernel()) return
  if (unhook) return unhook

  // Stub implementation for compatibility
  unhook = () => {
    unhook = undefined
  }
  return unhook
}
