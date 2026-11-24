from pathlib import Path
import os
import subprocess
import sys


value = 10
# TODO：將 A 的 value 加 1。
print(f"A pid={os.getpid()} 啟動 B 前 value={value}", flush=True)

child = subprocess.run(
    [sys.executable, "-X", "utf8", str(Path(__file__).with_name("b.py"))],
    capture_output=True,
    encoding="utf-8",
    timeout=5,
    check=True,
)
print(child.stdout.rstrip("\n"))
print(f"A pid={os.getpid()} B 結束後 value={value}")
