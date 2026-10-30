#!/usr/bin/env bash
# 发布：直接调用仓库的 publish.sh，输出落盘供读取
WS=/c/Users/den/WorkBuddy/2026-10-20-10-27-11
ROOT=$WS/veetop-site
export PATH="/c/Users/den/.workbuddy/binaries/node/versions/22.22.2-6:$PATH"
export NEXT_TELEMETRY_DISABLED=1
export CODEBUDDY_SAFE_DELETE_ENABLED=0
export NEXT_TRACE_UPLOAD_DISABLED=1

cd "$ROOT" || exit 1
bash publish.sh "新增 10 篇采购指南文章 + 埋点通道隔离改造（询盘与浏览埋点分离）" > "$WS/_publish.log" 2>&1
echo "publish_rc=$?" >> "$WS/_publish.log"
echo "done"
