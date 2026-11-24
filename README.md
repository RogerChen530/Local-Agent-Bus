# Local Agent Bus — From IPC to Multi-Agent Systems

繁體中文 Python 開放課程，版本 0.1.0。包含 12 個模組與 36 個課次的導航，M01 的三堂課及 L01 有完整教材。後續課次提供規劃、先備與固定連結。

## 開始學習

解壓整個 ZIP。在解壓出的 Local-Agent-Bus 目錄開啟終端機，執行對應命令，再開啟終端機顯示的 http://127.0.0.1:8765/ 網址。

| 環境 | 命令 |
| --- | --- |
| macOS／Linux | python3 serve.py |
| Windows PowerShell | py -3.13 serve.py |

若 8765 已被使用，可加上 --port 0 自動選取可用埠，以實際印出的網址為準。用 Ctrl+C 停止。課程本身無須帳號、網路模型或額外套件。進度存在同一瀏覽器及網址下，換埠或換瀏覽器前可先匯出 JSON。

首頁的「從第一個 Hello 開始」會進入 M01。開始前可核對 Python，然後依序做預測、讀資料流、操作模擬，再下載本機實作。L01 解答 ZIP 內的 verify.py 可重跑整組測試。

## 維護與驗證

- content/course.json 定義固定課次 ID、依賴、產出、來源和完成狀態。
- content/m01.mjs 為正式教材，content/reference.mjs 為術語、除錯索引及路線規劃。
- examples/ 保存每堂課和 L01 的起始碼與解答。資料流圖、網頁預期輸出及 ZIP 都使用同一教材版本。
- src/ 保存共用網頁元件、互動模型與進度格式。dist/ 為可直接提供服務的靜態輸出。
- 網站「驗證紀錄」頁列出 W0 與 W1 應檢查的範圍、執行結果及待驗證項目。

建置只需 Node.js 20 以上與 Python 標準函式庫。從此目錄執行 node build.mjs，接著執行 npm test 與 python3 checks/python_examples.py。這組測試會檢查課程契約、模擬狀態、搜尋、進度匯入、路由與連結、對比值及實際下載包。

## GitHub Pages

在 GitHub 的 **Settings → Pages** 將 Source 選為 **GitHub Actions**。推送至 `main` 後，工作流程會建置、驗證並發布 `dist/`。從 GitHub clone 後要在本機預覽，先執行 `npm run build`，再執行上方的 `serve.py` 指令。
