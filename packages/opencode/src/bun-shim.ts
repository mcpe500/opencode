// Bun API shim for Node.js compatibility
// This provides Bun-specific APIs using Node.js equivalents

import { stdin as nodeStdin } from "node:process"
import { readFileSync, writeFileSync } from "node:fs"
import { execSync } from "node:child_process"

// Bun.stdin.text() equivalent
export const stdin = {
  async text(): Promise<string> {
    return new Promise((resolve, reject) => {
      let data = ""
      nodeStdin.setEncoding("utf8")
      nodeStdin.on("data", (chunk) => {
        data += chunk
      })
      nodeStdin.on("end", () => {
        resolve(data)
      })
      nodeStdin.on("error", reject)
    })
  }
}

// Bun.stringWidth() equivalent - simple character count
// For proper Unicode width, would need 'string-width' package
export function stringWidth(str: string): number {
  // Simple implementation - counts characters
  // Note: This is not accurate for wide Unicode characters
  return str.length
}

// Bun.$ shell execution
export const $ = new Proxy(
  function(strings: TemplateStringsArray, ...values: any[]) {
    const cmd = String.raw({ raw: strings }, ...values)
    const result = execSync(cmd, { encoding: "utf8", stdio: ['pipe', 'pipe', 'pipe'] })
    return {
      text: () => Promise.resolve(result),
      json: () => Promise.resolve(JSON.parse(result))
    }
  },
  {
    get(target, prop) {
      if (prop === "sync") {
        return (strings: TemplateStringsArray, ...values: any[]) => {
          const cmd = String.raw({ raw: strings }, ...values)
          return execSync(cmd, { encoding: "utf8" })
        }
      }
      return target
    }
  }
)

// Bun.file() equivalent
export function file(path: string) {
  return {
    text: () => Promise.resolve(readFileSync(path, "utf8")),
    json: () => Promise.resolve(JSON.parse(readFileSync(path, "utf8"))),
    bytes: () => readFileSync(path),
    write: async (content: string | Buffer) => {
      writeFileSync(path, content)
    }
  }
}

// Bun.build - not shimmed (build-time only)
// Bun.serve - not shimmed (runtime server, use express/hono instead)
// Bun.ffi - not shimmed (use ffi-napi instead)
// Bun.sqlite - not shimmed (use better-sqlite3 or node:sqlite)

// Build artifact marker
export const build = {
  target: "node"
}
