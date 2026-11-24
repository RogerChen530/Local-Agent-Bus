import os


value = 40
value += 2
print(f"B pid={os.getpid()} ppid={os.getppid()} value={value}")
