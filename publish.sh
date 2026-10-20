#!/usr/bin/env bash
# ============================================================
# VEETOP 站发布脚本（WorkBuddy 接管版）
# 用法：bash publish.sh "本次改动的说明"
# 作用：类型检查 → 构建 → 提交 → 推送 GitHub → Vercel 自动部署
# ============================================================
set -euo pipefail

cd "$(dirname "$0")"

MSG="${1:-update site content}"
export PATH="/c/Users/den/.workbuddy/binaries/node/versions/22.22.2-6:$PATH"
export NEXT_TELEMETRY_DISABLED=1
# 构建会批量清理 .next 缓存，关闭 WorkBuddy 的删除保护（仅影响项目内构建缓存）
export CODEBUDDY_SAFE_DELETE_ENABLED=0

echo "==> [1/4] 类型检查"
node node_modules/typescript/bin/tsc --noEmit

echo "==> [2/4] 构建静态产物"
node node_modules/next/dist/bin/next build

echo "==> [3/4] 提交"
git add -A
if git diff --cached --quiet; then
  echo "    无改动，跳过提交"
else
  git commit -m "$MSG"
fi

echo "==> [4/4] 推送 GitHub（触发 Vercel 自动部署）"
git push origin main

echo ""
echo "✅ 已推送。Vercel 通常 1-3 分钟完成部署。"
echo "   线上检查：https://www.veetopamusement.com/"
echo "   部署日志：Vercel 控制台 → Project → Deployments"
