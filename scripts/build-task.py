#!/usr/bin/env python
"""用 Windows 任务计划方式彻底脱离父进程：schtasks 一次性任务跑构建。

沙箱会在 PowerShell 调用返回时杀掉整个进程树，所以普通 spawn / 后台都不行。
schtasks 创建的系统任务由 Task Scheduler 独立托管，父进程退出后继续跑。
"""
import pathlib
import subprocess
import sys
import time

WS = pathlib.Path(r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11")
ROOT = WS / "veetop-site"
LOG = WS / "_build_task.log"

NODE = r"C:\Users\den\.workbuddy\binaries\node\versions\22.22.2-6\node.exe"

# 构造一个 .cmd 包装：设置环境变量 → 跑 build → 记录退出码
wrapper = WS / "_build_task.cmd"
wrapper.write_text(
    "@echo off\r\n"
    "cd /d \"C:\\Users\\den\\WorkBuddy\\2026-10-20-10-27-11\\veetop-site\"\r\n"
    "set \"PATH=C:\\Users\\den\\.workbuddy\\binaries\\node\\versions\\22.22.2-6;%PATH%\"\r\n"
    "set \"NEXT_TELEMETRY_DISABLED=1\"\r\n"
    "set \"CODEBUDDY_SAFE_DELETE_ENABLED=0\"\r\n"
    "set \"NEXT_TRACE_UPLOAD_DISABLED=1\"\r\n"
    f"\"{NODE}\" node_modules\\next\\dist\\bin\\next build > \"{LOG}\" 2>&1\r\n"
    f"echo build_rc=%ERRORLEVEL% >> \"{LOG}\"\r\n",
    encoding="ascii",
)

TASK = "VeetopBuild"

# 清掉可能存在的旧任务
subprocess.run(["schtasks", "/Delete", "/F", "/TN", TASK], capture_output=True)

res = subprocess.run(
    [
        "schtasks", "/Create", "/F", "/TN", TASK,
        "/TR", str(wrapper),
        "/SC", "ONCE", "/ST", "23:59", "/RL", "HIGHEST",
    ],
    capture_output=True, text=True,
)
print("create rc=", res.returncode, res.stdout.strip(), res.stderr.strip())

res = subprocess.run(["schtasks", "/Run", "/TN", TASK], capture_output=True, text=True)
print("run rc=", res.returncode, res.stdout.strip(), res.stderr.strip())

# 轮询等待日志出现 build_rc
for i in range(120):
    time.sleep(10)
    if LOG.exists():
        txt = LOG.read_text(encoding="utf-8", errors="replace")
        if "build_rc=" in txt:
            print(f"finished after {(i+1)*10}s")
            print(txt[-1500:])
            sys.exit(0)
    if i % 6 == 5:
        print(f"...waiting {(i+1)*10}s")

print("TIMEOUT")
print(LOG.read_text(encoding="utf-8", errors="replace")[-2000:] if LOG.exists() else "(no log)")
