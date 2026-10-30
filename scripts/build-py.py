#!/usr/bin/env python
"""独立驱动 next build：Python 直接 spawn node 子进程，轮询等待，不依赖 bash 存活。"""
import os
import pathlib
import subprocess
import sys
import time

ROOT = pathlib.Path(r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site")
WS = ROOT.parent
NODE = r"C:\Users\den\.workbuddy\binaries\node\versions\22.22.2-6\node.exe"
LOG = WS / "_build_py.log"

env = dict(os.environ)
env["PATH"] = r"C:\Users\den\.workbuddy\binaries\node\versions\22.22.2-6;" + env.get("PATH", "")
env["NEXT_TELEMETRY_DISABLED"] = "1"
env["CODEBUDDY_SAFE_DELETE_ENABLED"] = "0"
env["NEXT_TRACE_UPLOAD_DISABLED"] = "1"

with LOG.open("w", encoding="utf-8", errors="replace") as f:
    f.write(f"start {time.strftime('%H:%M:%S')}\n")
    f.flush()
    p = subprocess.Popen(
        [NODE, "node_modules/next/dist/bin/next", "build"],
        cwd=str(ROOT),
        stdout=f,
        stderr=subprocess.STDOUT,
        env=env,
    )
    f.write(f"pid={p.pid}\n")
    f.flush()
    rc = None
    for _ in range(90):  # 最多 15 分钟
        rc = p.poll()
        if rc is not None:
            break
        time.sleep(10)
    if rc is None:
        f.write("TIMEOUT\n")
        p.kill()
    else:
        f.write(f"build_rc={rc}\n")

print("rc=", rc)
