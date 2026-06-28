#!/bin/sh
set -eu

RUNTIME_ROOT="${CODEX_NODE_RUNTIME_ROOT:-/Users/jackson/.cache/codex-runtimes/codex-primary-runtime/dependencies}"
export PATH="$RUNTIME_ROOT/node/bin:$RUNTIME_ROOT/bin:$PATH"

exec pnpm "$@"
