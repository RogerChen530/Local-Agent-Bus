from argparse import ArgumentParser
from pathlib import Path
import subprocess
import sys


def partial_text(data: bytes | None) -> str:
    """Decode a prefix captured before a timeout."""
    return (data or b"").decode("utf-8", errors="replace").strip()


def main() -> int:
    parser = ArgumentParser()
    parser.add_argument("--question", default="你好，你是誰？")
    parser.add_argument("--mode", choices=("normal", "exception", "no-read", "silent", "hang"), default="normal")
    parser.add_argument("--ending", choices=("line", "eof", "empty"), default="line")
    parser.add_argument("--timeout", type=float, default=5)
    parser.add_argument("--buffered", action="store_true")
    args = parser.parse_args()
    if not 0.1 <= args.timeout <= 30:
        parser.error("--timeout 必須介於 0.1 至 30 秒")

    question = args.question
    if "\n" in question or "\r" in question:
        parser.error("問題須為單行文字")
    payload = {"line": question + "\n", "eof": question, "empty": ""}[args.ending]
    command = [
        sys.executable, "-E", "-X", "utf8",
        str(Path(__file__).with_name("b.py")), args.mode,
    ]
    if args.buffered:
        command.append("--buffered")

    print(f"Python A：{question}", flush=True)
    try:
        reply = subprocess.run(
            command,
            input=payload,
            capture_output=True,
            encoding="utf-8",
            timeout=args.timeout,
            check=True,
        )
    except subprocess.TimeoutExpired as error:
        print("Python A：等候 B 逾時，已終止並等待 B 結束。", file=sys.stderr)
        print(f"逾時前 stdout：{partial_text(error.stdout) or '空'}", file=sys.stderr)
        print(f"逾時前 stderr：{partial_text(error.stderr) or '空'}", file=sys.stderr)
        return 124
    except subprocess.CalledProcessError as error:
        detail = error.stderr.strip() or "沒有診斷訊息"
        print(f"Python A：B 執行失敗（代碼 {error.returncode}）：{detail}", file=sys.stderr)
        return 1

    response = reply.stdout.rstrip("\r\n")
    if not response:
        print("Python A：B 正常退出，但沒有回覆。", file=sys.stderr)
        return 4

    print(f"Python B：{response}")
    print("Python A：收到。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
