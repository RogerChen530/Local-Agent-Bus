# M01-L03 · 參考解答 · v0.1.0

將檔案解壓到同一個目錄。教材以 Python 3.13 為基準，僅使用標準函式庫。

- macOS／Linux：`python3 -X utf8 a.py`
- Windows PowerShell：`py -3.13 -X utf8 a.py`（若未安裝 `py`，改用實際的 Python 3.13 執行檔）

`--mode silent` 的 A 為 4，`--mode hang --timeout 1.5` 的 A 為 124。`--buffered` 用來檢查逾時前 stdout 是否有資料。
