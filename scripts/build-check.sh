#!/usr/bin/env bash
# 类型检查 + 构建（用 node 直接调 CLI，避开 .cmd / shell wrapper 的坑）
ROOT=/c/Users/den/WorkBuddy/2026-10-20-10-27-11/veetop-site
WS=/c/Users/den/WorkBuddy/2026-10-20-10-27-11
cd "$ROOT" || exit 1

TSC_JS=$(ls node_modules/typescript/lib/tsc.js 2>/dev/null | head -1)
NEXT_CLI=$(ls node_modules/next/dist/bin/next 2>/dev/null | head -1)
echo "tsc.js  = $TSC_JS"
echo "next    = $NEXT_CLI"

echo "### tsc"
node "$TSC_JS" --noEmit > "$WS/_tsc.log" 2>&1
echo "tsc_rc=$?" >> "$WS/_tsc.log"

echo "### build"
node "$NEXT_CLI" build > "$WS/_build.log" 2>&1
echo "build_rc=$?" >> "$WS/_build.log"

echo "### tail"
tail -25 "$WS/_build.log"
