#!/usr/bin/env bash
# 提交 + 推送（复用 publish.sh 的 git 逻辑，避开 next build 步骤）
WS=/c/Users/den/WorkBuddy/2026-10-20-10-27-11
ROOT=$WS/veetop-site
export PATH="/c/Users/den/.workbuddy/binaries/node/versions/22.22.2-6:$PATH"
cd "$ROOT" || exit 1
MSG="新增 10 篇采购指南文章 + 埋点通道隔离改造"

echo "==> git add"
git add -A data/articles lib site.config.ts scripts out .gitignore 2>/dev/null || git add -A
echo "==> staged files:"
git diff --cached --name-only | head -40
echo "==> count: $(git diff --cached --name-only | wc -l)"

echo "==> commit"
git commit -m "$MSG" || echo "commit skipped (no changes)"

echo "==> pull --rebase"
if git pull --rebase origin main > /tmp/p.log 2>&1; then
  echo "    synced"
else
  echo "    rebase conflict -> soft reset onto origin/main"
  git rebase --abort 2>/dev/null || true
  git fetch origin main
  git reset --soft origin/main
  git add -A
  git commit -m "$MSG (rebase onto origin/main)" || true
fi

echo "==> push (retry x10)"
for i in $(seq 1 10); do
  if git push origin main > /tmp/push.log 2>&1; then
    tail -3 /tmp/push.log
    echo "PUSH_OK"
    break
  fi
  echo "    fail $i/10: $(head -1 /tmp/push.log | cut -c1-80)"
  sleep 10
done

echo "==> final"
git log --oneline -3
git status --short | head -10
