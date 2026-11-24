import sys


question = sys.stdin.readline().rstrip("\r\n")
if question != "你好，你是誰？":
    print("不認得這個問題", file=sys.stderr)
    raise SystemExit(2)

print("B 已讀到問題")  # TODO：改讓診斷走 stderr。
print("我是 Python B。", flush=True)
