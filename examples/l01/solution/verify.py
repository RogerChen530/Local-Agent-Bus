"""Run from the L01 starter/solution directory with python -X utf8 verify.py."""
from pathlib import Path
import os
import re
import subprocess
import sys
import unittest


def run(*arguments: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, "-E", "-X", "utf8", str(Path(__file__).with_name("a.py")), *arguments],
        capture_output=True,
        encoding="utf-8",
        timeout=10,
    )


class LabTests(unittest.TestCase):
    def test_hello(self):
        result = run()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("我是 Python B。", result.stdout)
        self.assertTrue(result.stdout.endswith("Python A：收到。\n"))
        self.assertEqual(result.stderr, "")

    def test_name(self):
        result = run("--name", " 林 小雨 ")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("你好，林 小雨！", result.stdout)

    def test_empty_and_unknown_input(self):
        for arguments in (("--name", "   "), ("--question", "錯字"), ("--ending", "empty")):
            with self.subTest(arguments=arguments):
                result = run(*arguments)
                self.assertEqual(result.returncode, 1)
                self.assertIn("代碼 2", result.stderr)
                self.assertNotIn("收到", result.stdout)

    def test_eof_returns_data_already_written(self):
        result = run("--ending", "eof")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("我是 Python B。", result.stdout)

    def test_nonzero_and_empty_reply(self):
        for mode, parent_code, message in (
            ("exception", 1, "RuntimeError"), ("no-read", 1, "代碼 3"), ("silent", 4, "沒有回覆")
        ):
            with self.subTest(mode=mode):
                result = run("--mode", mode)
                self.assertEqual(result.returncode, parent_code)
                self.assertIn(message, result.stderr)
                self.assertNotIn("收到", result.stdout)

    def test_timeout_and_flush(self):
        for buffered in (False, True):
            with self.subTest(buffered=buffered):
                flags = ["--buffered"] if buffered else []
                result = run("--mode", "hang", "--timeout", "1.5", *flags)
                self.assertEqual(result.returncode, 124, result.stderr)
                self.assertNotIn("收到", result.stdout)
                self.assertIn(
                    "逾時前 stdout：空" if buffered else "逾時前 stdout：我是 Python B。",
                    result.stderr,
                )
                pid = re.search(r"B pid=(\d+) 已完成", result.stderr)
                self.assertIsNotNone(pid, result.stderr)
                if os.name == "posix":
                    with self.assertRaises(ProcessLookupError):
                        os.kill(int(pid[1]), 0)  # Query existence without sending a signal.


if __name__ == "__main__":
    unittest.main(verbosity=2)
