#!/usr/bin/env bash
# 诊断构建为何在 publish.sh 第 2 步中断：逐步打印 + 后台化 + 轮询
WS=/c/Users/den/WorkBuddy/2026-10-20-10-27-11
ROOT=$WS/veetop-site
export PATH="/c/Users/den/.workbuddy/binaries/node/versions/22.22.2-6:$PATH"
export NEXT_TELEMETRY_DISABLED=1
export CODEBUDDY_SAFE_DELETE_ENABLED=0
export NEXT_TRACE_UPLOAD_DISABLED=1
cd "$ROOT" || exit 1

LOG=$WS/_build_direct.log
: > "$LOG"

echo "node: $(node -v)" >> "$LOG"
echo "start build at $(date)" >> "$LOG"

# 不重定向，直接看输出流；同时用 nohup 后台化避免被父进程退出带走
nohup node node_modules/next/dist/bin/next build > "$LOG.build" 2>&1 &
BPID=$!
echo "build pid=$BPID" >> "$LOG"

# 轮询等待，最多 12 分钟
for i in $(seq 1 72); do
  if ! kill -0 "$BPID" 2>/dev/null; then
    echo "build exited after $((i*10))s" >> "$LOG"
    wait "$BPID"; echo "build_rc=$?" >> "$LOG"
    break
  fi
  sleep 10
done

echo "--- build log tail ---" >> "$LOG"
tail -30 "$LOG.build" >> "$LOG" 2>&1
echo "--- out/blog ---" >> "$LOG"
ls out/blog 2>/dev/null >> "$LOG"
echo "DONE" >> "$LOG"
