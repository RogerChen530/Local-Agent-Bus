"""Exercise the actual download ZIPs from a clean directory with text and spaces in its path."""
from pathlib import Path
import platform
import re
import subprocess
import sys
import tempfile
from zipfile import ZipFile


root = Path(__file__).resolve().parents[1]
downloads = root / "dist" / "downloads"
count = 0


def invoke(folder, *args):
    return subprocess.run(
        [sys.executable, "-E", "-X", "utf8", str(folder / "a.py"), *args],
        cwd=folder.parent, capture_output=True, encoding="utf-8", timeout=10,
    )


with tempfile.TemporaryDirectory(prefix="課程 離線驗證 ") as temporary:
    for lesson in ("m01-l01", "m01-l02", "m01-l03", "l01"):
        for version in ("starter", "solution"):
            folder = Path(temporary) / lesson / version
            folder.mkdir(parents=True)
            with ZipFile(downloads / lesson / f"{version}.zip") as archive:
                for name in archive.namelist():
                    assert name in {"a.py", "b.py", "README.md", "verify.py"}, name
                    assert archive.read(name) == (root / "examples" / lesson / version / name).read_bytes()
                archive.extractall(folder)
            result = invoke(folder)
            assert result.returncode == 0, result.stderr
            if lesson == "m01-l01":
                a, b, end = result.stdout.splitlines()
                pid = re.search(r"pid=(\d+)", a)[1]
                assert f"ppid={pid} " in b and f"pid={pid} " in end
                assert re.search(r"pid=(\d+)", b)[1] != pid
                assert "value=11" in end if version == "solution" else "value=10" in end
                assert "value=42" in b if version == "solution" else "value=40" in b
                (folder / "b.py").rename(folder / "b.saved.py")
                missing = invoke(folder)
                assert missing.returncode != 0 and "CalledProcessError" in missing.stderr
            else:
                assert "我是 Python B。" in result.stdout and "收到" in result.stdout
            if lesson == "m01-l02":
                misplaced = "B 已讀到問題" in result.stdout
                assert misplaced == (version == "starter")
                typo = invoke(folder, "--question", "拼錯的問題")
                assert typo.returncode == 1 and "代碼 2" in typo.stderr and "收到" not in typo.stdout
            if lesson == "m01-l03":
                empty = invoke(folder, "--mode", "silent")
                assert empty.returncode == (4 if version == "solution" else 0)
                if version == "solution":
                    assert "沒有回覆" in empty.stderr and "收到" not in empty.stdout
            if lesson == "l01":
                verify = subprocess.run(
                    [sys.executable, "-E", "-X", "utf8", str(folder / "verify.py")],
                    cwd=folder.parent, capture_output=True, encoding="utf-8", timeout=20,
                )
                assert "Ran 6 tests" in verify.stderr, verify.stderr
                if version == "solution":
                    assert verify.returncode == 0, verify.stderr
                else:
                    assert verify.returncode != 0 and "FAIL: test_name" in verify.stderr, verify.stderr
                    assert verify.stderr.count("FAIL:") == 1, verify.stderr
            count += 1
print(f"W1 PASS — {count} source-matching ZIPs on {platform.system()} {platform.release()} ({platform.machine()}), Python {platform.python_version()}.")
print("All 4 starters and 4 solutions run; 01.1 PID/PPID, missing file; 01.2 UTF-8 and channels; 01.3 silent exit; L01 six checks in the solution, one intentional failing name check in starter.")
