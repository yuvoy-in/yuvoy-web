#!/bin/bash
# Runs before any Bash tool call; only acts on `git push` — blocks the push if
# the production build fails. Keeps broken code off shared branches.
cmd=$(python3 -c "import json,os;print(json.loads(os.environ.get('CLAUDE_TOOL_INPUT','{}')).get('command',''))" 2>/dev/null)

if echo "$cmd" | grep -q "git push"; then
  export PATH="$HOME/.local/share/pnpm:$PATH"
  cd /Users/vishwanth.barma/Documents/builds/yuvoy/yuvoy-web && pnpm build
fi
