from argparse import ArgumentParser
from pathlib import Path
import subprocess
import sys


def main() -> int:
    parser = ArgumentParser()
    parser.add_argument("--question", default="你好，你是誰？")
    args = parser.parse_args()

    print(f"Python A：{args.question}", flush=True)
    reply = subprocess.run(
        [sys.executable, "-X", "utf8", str(Path(__file__).with_name("b.py"))],
        input=args.question + "\n",
        capture_output=True,
        encoding="utf-8",
        timeout=5,
    )

    if reply.returncode != 0:
        detail = reply.stderr.strip() or "沒有診斷訊息"
        print(f"Python A：B 執行失敗（代碼 {reply.returncode}）：{detail}", file=sys.stderr)
        return 1

    print(f"Python B：{reply.stdout.rstrip()}")
    print("Python A：收到。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
