from argparse import ArgumentParser
import os
import sys
import time


def main() -> int:
    parser = ArgumentParser()
    parser.add_argument("mode", choices=("normal", "exception", "no-read", "silent", "hang"))
    parser.add_argument("--buffered", action="store_true")
    args = parser.parse_args()

    if args.mode == "exception":
        raise RuntimeError("故意製造的例外")
    if args.mode == "no-read":
        print("B 未呼叫 readline() 就結束。", file=sys.stderr)
        return 3

    line = sys.stdin.readline()
    if line == "":
        print("B 先看到 EOF，沒有收到資料。", file=sys.stderr)
        return 2
    question = line.rstrip("\r\n")
    if question == "你好，你是誰？":
        response = "我是 Python B。"
    elif question.startswith("名字 ") and question.removeprefix("名字 ").strip():
        name = question.removeprefix("名字 ").strip()
        response = f"你好，{name}！"
    else:
        print("不認得這個問題或名字為空白", file=sys.stderr)
        return 2

    if args.mode == "silent":
        return 0
    print(response, flush=not args.buffered)
    if args.mode == "hang":
        print(f"B pid={os.getpid()} 已完成 print()，但仍在運行。", file=sys.stderr, flush=True)
        while True:
            time.sleep(1)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
