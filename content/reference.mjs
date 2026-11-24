export const terms = [
  ["program", "程式", "Program", "儲存在檔案或其他媒介中的指令。可以用同一份指令啟動多個程序。", "m01-l01"],
  ["process", "程序", "Process", "作業系統管理的一次執行，具有自己的執行狀態、位址空間與資源。", "m01-l01"],
  ["pid", "程序識別碼", "PID / PPID", "PID 標示目前程序；子程序的 PPID 可用來核對父程序身分。", "m01-l01"],
  ["ipc", "跨程序通訊", "IPC · Inter-process communication", "獨立程序透過 Pipe、Socket 等明確機制交換資料或訊號。", "m01-l01"],
  ["pipe", "管線", "Pipe", "作業系統提供的位元組通道。課程用分開的管線連接子程序的 stdin、stdout 與 stderr。", "m01-l02"],
  ["stdin", "標準輸入", "stdin", "程序預設的輸入串流。以 B 為觀點，A 送的問題由這裡進入。", "m01-l02"],
  ["stdout", "標準輸出", "stdout", "程序預設的輸出串流。本課約定用來回傳回覆正文。", "m01-l02"],
  ["stderr", "標準錯誤", "stderr", "獨立於 stdout 的診斷串流。程序成功時也可以使用 stderr。", "m01-l02"],
  ["utf-8", "UTF-8 字元編碼", "UTF-8", "以一或多個 bytes 表示 Unicode 字元的編碼。讀寫兩端需要採用相同約定。", "m01-l02"],
  ["ack", "確認訊息", "ACK · Acknowledgment", "接收端將特定收到事件回報給送出端的訊息，具體意義由協議定義。", "m01-l02"],
  ["exit-code", "退出代碼", "Exit code / returncode", "程序結束時提供的狀態。通常 0 表示正常退出，應用仍需核對是否收到所需資料。", "m01-l02"],
  ["eof", "輸入結束", "EOF · End of file", "讀完通道內的資料且之後無可讀資料的狀態。對 Pipe 而言，要等寫入端全部關閉。", "m01-l03"],
  ["buffer", "緩衝區", "Buffer / flush", "暫存輸入或輸出的區域。flush 要求串流送出自己的待寫資料。", "m01-l03"],
  ["timeout", "逾時", "Timeout / deadline", "等待超出約定時間。處理方式可能是回報失敗、停止工作或清理資源，依介面約定。", "m01-l03"],
  ["socket", "通訊端", "Socket / TCP loopback", "程序讀寫通訊通道的介面。TCP loopback 可連接同一台電腦上的獨立程序。", "m02-l01"],
  ["serialization", "序列化", "Serialization", "將記憶體中的資料結構轉為可保存或傳輸的表示。", "m02-l02"],
  ["framing", "訊息邊界規則", "Framing / JSON Lines", "從位元組流切出完整訊息的約定，例如每行一筆 JSON。", "m02-l03"],
  ["recv", "接收位元組", "recv / byte stream", "TCP 接收呼叫一次給出當下讀到的一段 bytes。完整訊息由應用層依 framing 組合。", "m02-l03"],
  ["rpc", "遠端程序呼叫", "RPC · Remote procedure call / JSON-RPC", "一端以方法名稱與參數請另一端工作，依呼叫規則取得對應的回覆。也可在單機跨程序用。", "m03-l01"],
  ["notification", "通知", "JSON-RPC notification", "沒有 id 的 JSON-RPC 請求。接收端不為通知送回 RPC 回覆。", "m03-l01"],
  ["broker", "訊息中介服務", "Message Broker", "接收連線與訊息，根據註冊、路由與容量政策分配工作。", "m04-l01"],
  ["middleware", "Agent 中介層", "Agent middleware", "負責接入、路由、排程、工作階段映射與政策的協作層，例如課程的 Local Agent Bus。", "m04-l01"],
  ["coroutine", "協程", "Coroutine / event loop", "可以暫停等待並將控制權交回排程器，之後由排程器繼續執行。", "m05-l01"],
  ["backpressure", "背壓", "Backpressure / bounded queue", "下游接近容量上限時，限制上游投入工作的速度或數量。", "m05-l02"],
  ["adapter", "轉接器", "Adapter / fixture", "把供應端的介面映射到共同契約。fixture 是供重現比較使用的固定輸入與紀錄。", "m06-l01"],
  ["model-runtime", "模型執行環境", "Model runtime / Inference server", "管理模型載入及推論。Ollama 在課程中提供這一層的服務。", "m06-l01"],
  ["agent-harness", "Agent 執行層", "Agent harness", "管理模型、工具、工作環境和執行迴圈，並處理任務的互動與結果。", "m07-l01"],
  ["session", "工作階段", "Session / 對話脈絡", "具明確所有者、生命週期和識別碼的一組上下文。課程分開 Bus Session、供應端 Session 和單次 Task。", "m08-l01"],
  ["artifact", "產出物", "Artifact", "任務留下且可以引用和驗證的檔案、patch 或結構化資料。", "m08-l02"],
  ["idempotency", "冪等性", "Idempotency", "重做一樣的操作時，效果符合只做一次的語意。", "m08-l03"],
  ["mcp", "模型上下文協定", "MCP · Model Context Protocol", "課程用 MCP 連結應用或 Agent host 與有明確能力的工具、資源和資料服務。", "m09-l01"],
  ["acp", "Agent 用戶端協定", "ACP · Agent Client Protocol", "本課的 ACP 指編輯器或用戶端與 Coding Agent 互動的協定。主線規劃以 v1 為基準。", "m10-l01"],
  ["acp-communication", "同縮寫的另一項協定", "ACP · Agent Communication Protocol", "同樣使用 ACP 縮寫的另一項協定，由其官方頁面說明與 A2A 的整合關係。", "m10-l01"],
  ["a2a", "Agent 對 Agent 協定", "A2A · Agent2Agent Protocol", "本課用它討論獨立 Agent 之間的能力發現、任務生命週期與產出物。", "m10-l02"],
  ["gateway", "協定閘道", "Gateway", "轉換兩邊的介面與資料，並標註映射時不能保留的語意。", "m10-l03"],
  ["orchestration", "工作流程調度", "Orchestration / Workflow", "依據狀態、任務依賴、預算與政策決定下一個工作。", "m11-l01"],
];

export const diagnoses = [
  ["process-values", "兩支程式各有 value，值卻不符合預期", "PID 變數 共用 記憶體 import", "比較 A 前後的 PID 與 value，再驗證 B 的 PPID。若用 import，實驗仍在同一程序。", "m01-l01", true],
  ["extra-output", "答案混入除錯文字", "stderr stdout log 資料 除錯", "在 A 暫印 repr(reply.stdout) 與 repr(reply.stderr)，確認 B 的診斷用 print 的 file 參數送往 stderr。", "m01-l02", true],
  ["encoding", "中文字變成亂碼或解碼失敗", "UTF-8 unicode 中文 亂碼 encoding", "將 Pipe 的編碼與解碼、終端機顯示分開檢查。教材用 encoding='utf-8' 配合子程序 -X utf8，再以中文測往返。", "m01-l02", true],
  ["waiting", "A 卡住或逾時", "timeout 卡住 hang 停止 flush EOF 緩衝", "先看 B 是否讀到換行或 EOF，再比對逾時前的 stdout、stderr 與 B 是否已結束。", "m01-l03", true],
  ["no-text", "B 已退出，A 卻沒收到答案", "退出 0 silent returncode 空回覆", "子程序的代碼 0 說明正常退出。請在 A 另檢查 stdout 是否符合課內的有回覆條件。", "m01-l03", true],
  ["partial-recv", "recv 只拿到一半或一次收進兩則", "recv TCP framing 合併 半個 半則", "規劃以固定切段測試檢查收訊邊界，包含切在 UTF-8 字元中間。", "m02-l03", false],
  ["auth", "服務接入時顯示未登入或無權存取", "認證 API key 401 403 auth 帳號", "規劃先區分 CLI 的身分、供應端 Session 所有權與工具權限。", "m07-l01", false],
  ["version", "協定版本或能力協商不符", "revision 版本 SDK MCP ACP A2A capability", "規劃比對實際協商版本、教材基準與 SDK 支援能力。", "m09-l02", false],
];

export const paths = [
  ["core", "無模型主線", "以標準函式庫從 Pipe、TCP 及 RPC 建立 Broker。後段用可預測的 Mock 和離線 fixture 完成核心評量。", "M01–M12", "M01 三課與 L01 可學"],
  ["ollama", "本地模型選修", "在 Adapter 契約通過後，接入 Ollama 推論端點，檢查模型、資料目的地與串流事件。", "自 M06 分支", "規劃中"],
  ["agents", "Coding Agent 選修", "在專用練習資料夾使用官方 CLI、SDK 或協定。接續工作僅使用介面支援且有權存取的 Session。", "自 M07 分支", "規劃中"],
];

export const phases = [
  ["W0", "內容契約", "課程資料清單、穩定網址、先備關係、來源矩陣、教材狀態。"],
  ["W1", "第一個學習切片", "M01 三堂課與 L01，搭配程序與 Pipe 模擬、提示、測驗與本機進度。"],
  ["W2", "通訊基礎", "M02–M05、L02–L05、檢核 A／B，以及 TCP framing、Broker 與非同步模擬。"],
  ["W3", "真實接入與資料", "M06–M08、離線 fixture、Adapter／Session。另為至少一種真實接入留下實測紀錄。"],
  ["W4", "協定與協作", "M09–M12、檢核 D／E、閘道與期末專案，完成 Mock 全流程、故障與重啟實驗。"],
  ["W5", "完整課程驗收", "驗收完整 36 課、12 個 Lab、六組模擬，以及搜尋、跨平台與發布品質。"],
];

export const layers = [
  ["應用／學習介面", "提交工作、看結果，取得人工決定", "課程 CLI、觀察介面"],
  ["Agent 中介層", "統一接入、路由、排程、預算與事件", "Local Agent Bus"],
  ["Agent 執行層", "管理工具、上下文、工作目錄及迴圈", "Codex、Claude Code、受限的自寫 Agent"],
  ["模型執行環境", "載入模型並提供推論", "Ollama 推論端點"],
];
