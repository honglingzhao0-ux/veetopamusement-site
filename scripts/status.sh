#!/usr/bin/env bash
# 发布状态与产物检查：所有输出写到 _status.txt，避免 PowerShell 吞 stdout
cd /c/Users/den/WorkBuddy/2026-10-20-10-27-11/veetop-site || exit 1
OUT=/c/Users/den/WorkBuddy/2026-10-20-10-27-11/_status.txt
{
  echo "=== git log ==="
  git log --oneline -6
  echo
  echo "=== git status ==="
  git status --short | head -40
  echo
  echo "=== branch ==="
  git rev-parse --abbrev-ref HEAD
  echo "=== remote head ==="
  git log --oneline -1 origin/main 2>/dev/null || echo "no origin/main"
  echo
  echo "=== articles count ==="
  ls data/articles/*.md | wc -l
  echo "=== out/blog dirs ==="
  ls out/blog 2>/dev/null | head -30
} > "$OUT" 2>&1
echo done
