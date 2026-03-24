// Node.js entry point for OpenCode
// Import Bun shim first to provide Bun APIs on Node.js runtime

import "./bun-shim.js"

// Now import the main application
import("./index.js").catch((err) => {
  console.error("Failed to start OpenCode:", err)
  process.exit(1)
})
