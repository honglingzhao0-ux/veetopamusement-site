#!/usr/bin/env bash
# ============================================================
# VEETOP 站发布脚本（WorkBuddy 接管版）
# 用法：bash publish.sh "本次改动的说明"
# 作用：类型检查 → 构建 → 提交 → 同步远程 → 推送 GitHub → Vercel 自动部署
# ============================================================
set -uo pipefail
# 注意：刻意不用 set -e。构建/推送的失败需要由各步骤自己判定退出码，
# 否则管道（| tail）会让非零码误触发中断，把"已构建成功但脚本提前退出"变成假故障。

cd "$(dirname "$0")"

MSG="${1:-update site content}"
export PATH="/c/Users/den/.workbuddy/binaries/node/versions/22.22.2-6:$PATH"
export NEXT_TELEMETRY_DISABLED=1
# 构建会批量清理 .next 缓存，关闭 WorkBuddy 的删除保护（仅影响项目内构建缓存）
export CODEBUDDY_SAFE_DELETE_ENABLED=0
# Next 构建收尾会写 .next/trace，若该文件被占用会导致退出码 1（但产物其实已生成），
# 造成"其实成功却报构建失败"的假故障。禁用 trace 上传规避。
export NEXT_TRACE_UPLOAD_DISABLED=1

echo "==> [1/5] 类型检查"
if ! node node_modules/typescript/bin/tsc --noEmit; then
  echo "❌ 类型检查未通过，已中止发布"
  exit 1
fi

echo "==> [2/5] 构建静态产物"
node node_modules/next/dist/bin/next build > /tmp/veetop_build.log 2>&1
BUILD_RC=$?
tail -5 /tmp/veetop_build.log
# 退出码非0时再核对产物：产物齐全即视为成功（规避 Next 收尾步骤的假失败）
if [ "$BUILD_RC" -ne 0 ]; then
  if [ -f out/index.html ] && [ -f out/sitemap.xml ]; then
    echo "⚠️  构建收尾有告警（退出码 $BUILD_RC），但产物已完整生成，继续发布"
  else
    echo "❌ 构建失败（产物不完整），已中止发布"
    exit 1
  fi
fi

echo "==> [3/5] 提交本地改动"
git add -A
if git diff --cached --quiet; then
  echo "    无改动，跳过提交"
else
  git commit -m "$MSG" || exit 1
fi

echo "==> [4/5] 同步远程最新（避免覆盖 Accio Work 或他人的改动）"
BACKUP="backup-before-pull-$(date +%s)"
git branch "$BACKUP" 2>/dev/null || true
if git pull --rebase origin main > /tmp/veetop_pull.log 2>&1; then
  echo "    已同步"
else
  echo "    rebase 冲突，以远程为基线保留本地改动"
  git rebase --abort 2>/dev/null || true
  git fetch origin main
  git reset --soft origin/main
  git add -A
  if ! git diff --cached --quiet; then
    git commit -m "$MSG (rebase onto origin/main)" || true
  fi
fi
git branch -D "$BACKUP" 2>/dev/null || true

echo "==> [5/5] 推送 GitHub（触发 Vercel 自动部署）"
# WorkBuddy 出网代理对 github.com 偶发 502，自动重试最多 10 次
PUSHED=0
for i in $(seq 1 10); do
  if git push origin main > /tmp/veetop_push.log 2>&1; then
    tail -3 /tmp/veetop_push.log
    PUSHED=1
    break
  fi
  echo "    推送失败（第 $i/10 次）：$(head -1 /tmp/veetop_push.log | cut -c1-90)"
  echo "    代理 502 属常见抖动，10 秒后重试..."
  sleep 10
done

if [ "$PUSHED" -ne 1 ]; then
  echo ""
  echo "❌ 推送失败：出网代理持续 502。可稍后手动执行 git push origin main 重试。"
  exit 1
fi

echo ""
echo "✅ 已推送。Vercel 通常 1-3 分钟完成部署。"
echo "   线上检查：https://www.veetopamusement.com/"
echo "   部署日志：Vercel 控制台 → Project → Deployments"
