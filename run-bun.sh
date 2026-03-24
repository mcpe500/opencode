#!/data/data/com.termux/files/usr/bin/bash
# Wrapper script to run bun with glibc-runner
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
exec glibc-runner "$BUN_INSTALL/bin/bun" "$@"
