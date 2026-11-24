export const lessons = {
  "m01-l01": {
    intro: "A 啟動 B。A 和 B 都有一個叫 value 的變數。B 改完並退出後，A 讀到的 value 是多少？這個問題會決定接下來要把什麼接上 Pipe。",
    outcomes: [
      "用 PID 和 PPID 區分程式檔、程序實例與父子關係。",
      "以兩次讀取 A 的變數和一次 B 的輸出驗證記憶體隔離。",
      "在程序圖上標出資料經過的通道與所在的位址空間。",
    ],
    prediction: {
      id: "m01-l01-pid-predict",
      prompt: "A 的 value 是 11。B 在自己的程式中把同名變數改成 42。B 結束後，A 看到什麼？",
      options: [["a-11", "11，A 仍在自己的程序裡讀取 value。"], ["b-42", "42，父子關係讓兩邊共用變數。"], ["unset", "讀取失敗，因為 B 結束時也清除了 A 的 value。"]],
      correct: "a-11",
      why: "變數名稱在各自的 interpreter 裡解析。A 可以讀到 B 印出的字串，但 A 的 value 仍是 11。",
    },
    concepts: [
      { title: "一份檔案可以啟動多個程序", body: '<p><strong>程式（program）</strong>是磁碟上的指令。<strong>程序（process）</strong>是作業系統管理的一次執行，包含執行狀態、位址空間和已開啟的資源。從兩個終端機各執行一次同一個 Python 檔案，也會有兩個程序。<a href="/glossary/#pid">PID</a> 用來在程序存活期間辨識它，程式檔名用來辨識路徑。作業系統可能在程序離開後重用 PID。</p><p>在例子中，A 用 <code>subprocess.run</code> 要求作業系統啟動 B。B 在 A 仍然等待時呼叫 <code>os.getppid()</code>，應得到 A 的 PID。這項觀察證明父子關係。要證明 A 的變數沒有變，還要比較 A 自己在啟動前與等待後的輸出。</p>' },
      { title: "同名變數在兩個位址空間中各自解析", body: '<p>A 與 B 各有一個 Python interpreter，分別把 <code>value</code> 綁定到自己的物件。即使兩個物件的虛擬位址數值碰巧相同，各程序看到的是由作業系統分別映射的位址空間。</p><p>把 B 改用 <code>import b</code> 會改變實驗。模組可能仍有自己的命名空間，但匯入的程式在 A 的 interpreter 執行。比對兩段程式的 PID，可以區分「同一程序內的模組」與「真正啟動另一個程序」。共享記憶體則需要兩邊明確映射同一塊資源，還得約定讀寫時機。本模組用 Pipe 複製訊息，從一條看得見的資料路徑開始。</p>' },
    ],
    trace: [["A 的記憶體", "value = 11，等待 B"], ["B 的記憶體", "value = 42，呼叫 print()"], ["資料流", "B 的 stdout 經 Pipe 到 A 的 child.stdout。A 的 value 保持 11。"]],
    sim: "memory",
    experiment: {
      lead: "下載 01.1 起始碼，解壓縮後在該目錄執行。第一次做時保留原始檔，另存一份練習版本。",
      commands: [
        ["macOS／Linux", "python3 -X utf8 a.py"],
        ["Windows PowerShell", "py -3.13 -X utf8 a.py"],
      ],
      steps: [
        "先跑一次。找出 A 的 PID、B 的 PID 和 B 的 PPID，預測改值後哪些欄位應維持不變。",
        "把 a.py 的 TODO 改成 <code>value += 1</code>，b.py 的 TODO 改成 <code>value += 2</code>。再次執行。",
        "把 B 的增量改為 25，記下 A 和 B 的值。最後將 b.py 暫時改名為 b.saved.py，再跑一次觀察啟動後的非零結束，完成後改回原名。",
      ],
      output: "A pid=4100 啟動 B 前 value=11\nB pid=4101 ppid=4100 value=42\nA pid=4100 B 結束後 value=11",
      outputNote: "PID 是示意數字。判讀條件是 A 前後的 PID 相同、A 與 B 的 PID 不同，且 B 的 PPID 等於 A 的 PID。",
    },
    failures: '<p>暫時移走 <code>b.py</code> 時，A 仍可啟動另一個 Python interpreter，該 interpreter 開不了指定的程式檔，最後以非零狀態退出。<code>check=True</code> 使 A 拋出 <code>CalledProcessError</code>。若要找第一個失敗原因，可看例外持有的 <code>stderr</code>。下一課會把這類診斷轉為人看得懂的報告。</p><p>補做一次「只改 B」的對照。若 A 的 value 跟著變，先檢查自己是否也改到了 a.py，或是否其實在同一個 interpreter 匯入 b.py。</p>',
    hints: [
      ["定位", "先找出 <code>value</code> 第一次被指派的位置，再看每一行是由哪個 PID 寫出的。"],
      ["做法", "把 <code>value += 1</code> 放在 a.py 的第一次 print 前。B 也在自己的第一次 print 前增加 2。請把實測的三個 PID 欄位對在一起。"],
      ["判讀", "預期 A 前後都讀到 11。B 的 42 出現在 A 螢幕上，是因為 A 印出了收集到的字串。若 b.py 缺失，應看不到 A 的最後一行。"],
    ],
    quiz: [
      { id: "m01-l01-q-import", prompt: "A 要證明它與 B 是兩個程序。哪個實驗可提供所需證據？", options: [["files", "把 A 和 B 分成兩個檔案，在 A 執行 import b。"], ["pids", "以 subprocess 啟動 B，記錄兩個不同 PID 和 B 的 PPID。"], ["name", "A 與 B 使用不同變數名。"]], correct: "pids", why: "核心證據是各自執行時的 PID。匯入模組通常仍在原程序裡執行。", back: "concepts" },
      { id: "m01-l01-q-copy", prompt: "把 B 的 value 從 42 改成 65。預期 A 最後兩行會怎樣？", options: [["b-only", "B 那一行顯示 65，A 最後一行仍是 11。"], ["both", "兩個值都變成 65。"], ["neither", "A 捕捉輸出後會固定用先前的 42。"]], correct: "b-only", why: "child.stdout 反映這次 B 寫出的字串。A 再讀自己的 value 時，查的是 A 自己的變數。", back: "experiment" },
      { id: "m01-l01-q-evidence", prompt: "看見兩個不同的 PID 後，還需要哪一項資料來支持「A 的值未被改動」？", options: [["elapsed", "兩個程序的結束時間。"], ["names", "兩個檔名的字數。"], ["value-pair", "同一次實驗中，A 在啟動前與 B 結束後讀到的值。"]], correct: "value-pair", why: "不同 PID 說明程序身分。前後同一個 PID 的值才直接檢驗變數是否改變。", back: "concepts" },
    ],
    done: "在筆記記下 B 的輸出與 A 的兩個 value。畫兩個框，將 stdout 的資料箭頭畫向 A，並把 A 與 B 的 value 寫在各自框內。",
    cleanup: "將暫時改名的 b.py 放回。兩支程式在實驗結束後都會退出，保留練習檔與程序圖即可。",
    sourceFocus: "讀 os.getpid／os.getppid 的定義，再到 subprocess 文件找 capture_output 如何連接子程序的標準輸出。",
  },
  "m01-l02": {
    intro: "上堂課 A 已經能擷取 B 說的話。這次由 A 先提出問題，再從捕捉到的答案與狀態確認 B 做了什麼。",
    outcomes: [
      "沿 request 與 response 的方向追蹤 stdin、stdout、stderr 及退出代碼。",
      "用同一個 Python 解譯器執行 A、B，確認 UTF-8 可以往返。",
      "分開資料與診斷，讓 A 在 B 失敗時回報原因。",
    ],
    prediction: {
      id: "m01-l02-reply-predict",
      prompt: "B 把「B 已讀到問題」寫到 stdout，接著也在 stdout 印答案。A 的 reply.stdout 裡有什麼？",
      options: [["last", "只有最後一行答案。"], ["both", "診斷與答案兩行。"], ["none", "capture_output 會把 stdout 丟掉。"]],
      correct: "both",
      why: "stdout 承載 B 寫入的兩行文字。A 要保留一個乾淨的答案通道，可以讓 B 將診斷寫入 stderr。",
    },
    concepts: [
      { title: "從 B 的視角看三條標準串流", body: '<p>在終端機直接執行 B 時，<a href="/glossary/#stdin">stdin</a> 通常連到終端的輸入來源，<a href="/glossary/#stdout">stdout</a> 和 <a href="/glossary/#stderr">stderr</a> 通常送往同一個畫面。A 啟動 B 時，可以用 Pipe 指定新的去向。請從 <strong>B</strong> 判讀名稱。A 寫入的問題到 B 的 stdin，B 的 stdout 和 stderr 各回 A 的不同欄位。</p><p><code>subprocess.run(input=..., capture_output=True)</code> 管理寫入、關閉輸入和讀回兩條輸出。等子程序結束後，A 取得一個 <code>CompletedProcess</code>。本例只傳一則小問題和一則小回覆，這個介面讓我們先專心驗證方向。</p>' },
      { title: "替小型對話約定文字格式", body: '<p>A 在問題後加上 <code>\\n</code>。B 用 <code>readline()</code> 取得一行後，移除行尾。Pipe 承載 bytes。A 以 <code>encoding="utf-8"</code> 編碼與解碼，B 透過 <code>-X utf8</code> 使用同一個約定。UTF-8 裡 ASCII 字元通常各佔 1 byte，而本例「你」佔 3 bytes，因此算文字長與算傳輸長度會得到不同數字。模擬器會以 UTF-8 byte 數顯示同一則輸入。</p><p><code>sys.executable</code> 指向正在執行 A 的解譯器。B 的檔案路徑是 argv 的獨立元素。即使資料夾名稱有空白，整條路徑仍然只有一個參數。把同一個問題再改成含空白的文字，觀察後再檢查 B 接受問題的條件。</p>' },
      { title: "回覆、診斷與狀態是三種證據", body: '<p>A 先判斷 <code>returncode</code>。B 對陌生問題將文字寫入 stderr，並選擇以代碼 2 退出。A 顯示這個診斷並以自己的代碼 1 結束。要記下來的是「誰退出」與「誰報告」，兩個程序各有自己的退出代碼。</p><p>成功時畫面的「Python B」前綴由 A 加上，「Python A：收到」也由 A 印在本地。B 的 stdin 已被關閉，所以最後這句沒有走到 B。如果將來 B 也必須知道 A 收到，需要在有效的通道定義確認訊息（ACK）。</p>' },
    ],
    trace: [["請求", "A 寫入「你好，你是誰？\\n」到 B 的 stdin"], ["回覆", "B 的 stdout「我是 Python B。」由 A 擷取"], ["診斷", "B 的 stderr 記錄處理情形，A 依退出代碼判斷要顯示什麼"]],
    sim: "pipe",
    experiment: {
      lead: "從 01.2 起始碼跑正常對話，再調整 B 的診斷去向。兩個 Python 檔案放在同一資料夾。",
      commands: [
        ["macOS／Linux", "python3 -X utf8 a.py\npython3 -X utf8 a.py --question \"拼錯的問題\"\nprintf 'A exit=%s\\n' \"$?\""],
        ["Windows PowerShell", "py -3.13 -X utf8 a.py\npy -3.13 -X utf8 a.py --question \"拼錯的問題\"\n$LASTEXITCODE"],
      ],
      steps: [
        "先看起始碼。找到 B 的兩個 print。執行 <code>a.py</code>，看哪兩行被當作 B 的輸出。",
        "為「B 已讀到問題」那一行加上 <code>file=sys.stderr</code>。再次執行，只留下真正的答案。可以在 A 暫時印出 <code>repr(reply.stderr)</code> 檢查分流，再移除暫用 print。",
        "用 <code>--question</code> 傳錯字。確認 A 報告 B 的代碼 2，自己以代碼 1 離開，且畫面沒有「收到」。",
      ],
      output: "Python A：你好，你是誰？\nPython B：我是 Python B。\nPython A：收到。",
      outputNote: "這是移動診斷之後的成功輸出。錯字實驗應出現「B 執行失敗（代碼 2）：不認得這個問題」。",
    },
    failures: '<p>若 B 的多行文字被當成同一個答案，先各自檢查 <code>repr(reply.stdout)</code> 與 <code>repr(reply.stderr)</code>。在 B 那一端修正 <code>print</code> 的 <code>file</code>，比在 A 猜哪一行是答案更可靠。若只有中文失敗，對照 A 的 <code>encoding</code>、B 的 <code>-X utf8</code> 以及執行 A 的終端機是否能顯示字元。畫面顯示與 Pipe 傳輸是兩個位置。</p>',
    hints: [
      ["定位", "比對 A 的 reply.stdout 與 reply.stderr，找出那行診斷落在哪一條。"],
      ["做法", "保留 B 的答覆在 stdout。修改診斷的 <code>print</code>，加上 <code>file=sys.stderr</code>。"],
      ["判讀", "答案只佔 stdout 的一行。失敗實驗應在 stderr 回報 B 的代碼 2，A 以 1 結束並略過成功分支。"],
    ],
    quiz: [
      { id: "m01-l02-q-route", prompt: "A 呼叫 run 並傳入 input。B 應從哪裡取得這則問題？", options: [["stderr", "sys.stderr"], ["argv", "sys.argv"], ["stdin", "sys.stdin"]], correct: "stdin", why: "input 指定寫入子程序 stdin 的資料。argv 放的是啟動參數。", back: "concepts" },
      { id: "m01-l02-q-utf8", prompt: "B 正常收到問題，但 A 解碼 B 印出的中文字時失敗。第一項最有用的核對是什麼？", options: [["pair", "B 的 stdout 編碼與 A 捕捉時的解碼是否一致。"], ["pid", "A 和 B 是否碰巧使用相近的 PID。"], ["filename", "b.py 的檔名是否含有非英文字母。"]], correct: "pair", why: "編碼與解碼是一對操作。請先定位破壞發生在 B 到 A 的回覆方向。", back: "failures" },
      { id: "m01-l02-q-ack", prompt: "A 印出「收到」。若需求改為 B 必須確認 A 看到了答案，還缺少什麼？", options: [["flush", "把 A 的 print 加上 flush=True 即可。"], ["ack", "定義供 B 讀取的 ACK，並保持或另建一條通道讓 A 能送達。"], ["status", "讓 B 以代碼 0 離開即可。"]], correct: "ack", why: "現在「收到」只寫到 A 的終端機。確認訊息需要能到達 B 的通道與格式。", back: "concepts" },
    ],
    done: "保留正常與錯字兩次結果，並用自己的話標記問題、答案與診斷的傳輸方向。從錯字案例區分 A 與 B 的兩個退出代碼。",
    cleanup: "移除用來檢查 repr 的臨時輸出，保留正常與失敗的觀察紀錄。",
    sourceFocus: "在 subprocess.run 找 input、capture_output、encoding 與 returncode，依序和 a.py 的參數對照。",
  },
  "m01-l03": {
    intro: "A 送出了問題。B 曾經呼叫 print，A 仍有可能等到逾時。用 stdout、stderr 和退出狀態找出哪一步沒有完成。",
    outcomes: [
      "比較換行、關閉寫入端與 EOF 對 readline() 的影響。",
      "重現正常退出但無回覆、子程序失敗，以及逾時三種結果。",
      "用逾時前可見的輸出解釋 Python 緩衝，並確認子程序已被回收。",
    ],
    prediction: {
      id: "m01-l03-timeout-predict",
      prompt: "B 執行 print(..., flush=True) 後一直活著。A 用 run(..., timeout=1.5) 等待。它的成功分支會執行嗎？",
      options: [["yes", "會，stdout 有一行就代表 run 已完成。"], ["timeout", "不會，A 等候 B 結束，最後進入逾時分支。"], ["zero", "會，flush 也會給 B 設定代碼 0。"]],
      correct: "timeout",
      why: "flush 讓文字送到 Pipe。run 還要收尾兩條輸出並等子程序結束，因此這次仍會逾時。",
    },
    concepts: [
      { title: "readline() 的終點可能是換行，也可能是 EOF", body: '<p><code>readline()</code> 讀到換行就能交出一行。如果資料已寫入且最後一個寫入端已關閉，B 可先讀到剩下的一段文字，下一次才得到空字串。若一開始就沒有資料且寫入端已關閉，第一次讀直接得到 <code>""</code>。只有一行換行時，讀到的值是 <code>"\\n"</code>，仍有一個字元。</p><p>這堂的 <code>run(input=...)</code> 在送完資料後會關閉 stdin，所以 <code>--ending eof</code> 仍能成功。模擬器另外提供「保持開啟」做對照，代表另一種長存活連線。暫時缺資料時，讀端會等下一批資料或 EOF，適合用來找出「雙方都在等」的因果。測試時每次只改換行或關閉狀態其中一項。</p>' },
      { title: "把三個等待條件拆開", body: '<p>先問「B 讀到了嗎？」。用 <code>stderr</code> 的診斷辨認 B 是先拋例外、未呼叫 <code>readline()</code> 就退出，還是讀完資料繼續執行。接著問「B 的答案離開 Python 的緩衝了嗎？」。連到 Pipe 時，stdout 通常採區塊緩衝。少量文字可能仍在 B 的 buffer，<code>flush=True</code> 會立即嘗試把它交給下一層。最後問「A 等的條件成立了嗎？」。<code>run()</code> 要等程序結束，退出代碼也要等到這時才有意義。</p><p>在 <code>hang</code> 實驗，B 在 print 之後寫一行獨立的 stderr 訊號，接著停在等待迴圈。這讓你確定它有執行到 print，再比較 <code>--buffered</code> 前後的部分 stdout。正常退出則會沖出緩衝，兩個有無 flush 的版本在正常路徑上都可能看起來一樣。</p>' },
      { title: "決定成功條件，並安排清理", body: '<p>本課把「B 以 0 結束且有答案」當作成功條件。B 的非零退出由 <code>CalledProcessError</code> 帶回代碼和診斷。B 以 0 結束但沒有答案，由 A 做應用層檢查。這兩類都會回報具體原因。</p><p><code>run(timeout=...)</code> 逾時會終止直接子程序並等待它結束，再拋出 <code>TimeoutExpired</code>。啟動時間依 OS 而異，實際用時可能超過設定值。本例 B 沒有啟動其他程序。未來改用 <code>Popen.communicate(timeout=...)</code> 時，需要自行安排終止、讀完 Pipe 與回收。部分輸出可能以 bytes 放在例外內，所以 a.py 在診斷分支明確解碼。請把部分輸出當作除錯證據。</p>' },
    ],
    trace: [["寫完 stdin", "送出最後的 bytes 或關閉寫入端，B 才能判定讀取結果。"], ["寫出 stdout", "print() 先寫到串流，flush 將待送資料推進 Pipe。"], ["等待子程序", "A 以退出代碼和回覆判斷完成，逾時則回收 B 並報告部分輸出。"]],
    sim: "fault",
    experiment: {
      lead: "從 01.3 起始碼重現故障。先跑 silent，補上 A 的回覆檢查，再改逾時時間與 B 的輸出緩衝。",
      commands: [
        ["macOS／Linux", "python3 -X utf8 a.py --mode silent\npython3 -X utf8 a.py --ending eof\npython3 -X utf8 a.py --mode exception\npython3 -X utf8 a.py --mode no-read\npython3 -X utf8 a.py --mode hang --timeout 1.5\npython3 -X utf8 a.py --mode hang --timeout 1.5 --buffered"],
        ["Windows PowerShell", "py -3.13 -X utf8 a.py --mode silent\npy -3.13 -X utf8 a.py --ending eof\npy -3.13 -X utf8 a.py --mode exception\npy -3.13 -X utf8 a.py --mode no-read\npy -3.13 -X utf8 a.py --mode hang --timeout 1.5\npy -3.13 -X utf8 a.py --mode hang --timeout 1.5 --buffered"],
      ],
      steps: [
        "在起始碼跑 silent。B 的退出碼是 0，A 卻收到空字串。修正 a.py 裡的 TODO，讓 A 寫 stderr 並以 4 結束。",
        "用 <code>--ending eof</code> 對照 <code>--ending empty</code>。記下前者仍有文字，後者沒有問題可答。用 <code>--mode no-read</code> 查證 B 也能在沒讀 input 的情況下先離開。",
        "比較兩個 hang 實驗。stderr 都應留下 B 的 PID 和「已完成 print()」，再比較逾時前 stdout。若看不到這行診斷，可將逾時調到 3 秒，先確認環境可啟動 B。",
        "補記每次 A 的退出碼。macOS／Linux 用 <code>echo $?</code>，PowerShell 用 <code>$LASTEXITCODE</code>，需在該次執行後立即查看。",
      ],
      output: "Python A：你好，你是誰？\nPython A：等候 B 逾時，已終止並等待 B 結束。\n逾時前 stdout：我是 Python B。\n逾時前 stderr：B pid=4101 已完成 print()，但仍在運行。",
      outputNote: "這是 hang、開啟 flush 時的示意輸出。加上 --buffered 後，預期「逾時前 stdout：空」。兩個 hang 的 A 都以 124 退出。PID 與終端機顯示順序可能因環境而異。",
    },
    failures: '<div class="table-wrap"><table><thead><tr><th scope="col">案例</th><th scope="col">從 A 取得的證據</th><th scope="col">判讀</th></tr></thead><tbody><tr><td>exception</td><td>B 非零，stderr 有 RuntimeError</td><td>執行 B 時發生例外。</td></tr><tr><td>no-read</td><td>B 回傳 3，stderr 指出未讀 stdin</td><td>將資料交給 Pipe 與 B 實際讀取是兩件事。</td></tr><tr><td>silent</td><td>B 回傳 0，stdout 為空</td><td>應用層沒有拿到答案，A 回傳 4。</td></tr><tr><td>hang</td><td>A 逾時且回傳 124，可查看部分輸出</td><td>B 在期限內沒有結束。兩次比較可驗證 flush 的作用。</td></tr></tbody></table></div><p>若單步模擬顯示 B 在等一行，但本機的 <code>--ending eof</code> 成功，請看寫入端何時關閉。模擬中保持開啟的是長存活連線，本機這版 A 送完就關閉。</p>',
    hints: [
      ["定位", "先判斷有沒有進入 TimeoutExpired，再看 B 的退出代碼與 stdout。"],
      ["做法", "<code>run()</code> 成功回來後檢查 <code>reply.stdout.rstrip(\"\\r\\n\")</code>。若回覆為空，寫出原因並回傳 4。"],
      ["判讀", "hang 的兩種版本都逾時，這時只比較部分 stdout。有資料的一次說明 flush 紓解了緩衝等待，B 是否退出仍由逾時分支處理。"],
    ],
    quiz: [
      { id: "m01-l03-q-eof", prompt: "A 寫入「Hello」且沒有換行，隨即關閉唯一的寫入端。B 的第一次 readline() 會取得什麼？", options: [["forever", "永遠等待。"], ["word", "Hello，沒有換行。"], ["empty", "空字串，因為 A 已經關閉。"]], correct: "word", why: "EOF 表示資料已讀完，先前寫入的資料仍可被讀出。再讀一次才會拿到空字串。", back: "concepts" },
      { id: "m01-l03-q-timeout", prompt: "逾時前 stdout 有答案，stderr 有「仍在運行」。哪個結論最符合證據？", options: [["printed", "B 已把資料送進 Pipe，但 A 沒等到程序在期限內結束。"], ["finished", "應將任務算成已成功，因為有文字。"], ["encoding", "答案已證明 stdout 編碼不相容。"]], correct: "printed", why: "資料可見和程序結束是不同條件。若程式趕不及退出，run 仍會回報逾時。", back: "failures" },
      { id: "m01-l03-q-silent", prompt: "B 以 0 離開，A 沒收到正文。哪個改動最能保留正確的成功語意？", options: [["deadline", "延長 timeout。"], ["swallow", "丟掉 stderr 繼續列印成功。"], ["app-check", "在 A 另檢查 stdout 是否符合約定，為空時回報缺少回覆。"]], correct: "app-check", why: "0 說明程序正常離開。A 仍需檢查應用協議所需的答案。", back: "experiment" },
    ],
    done: "保存正常、非零、空回覆與逾時的輸出。對照一組有無 flush 的結果，指出哪個狀態改變，以及哪個等待條件仍未完成。",
    cleanup: "此範例的 run 會清理直接子程序。若曾手動單跑 B，回到該終端用 Ctrl+C 結束。可在系統程序列表用 stderr 記下的 PID 確認實驗中的 B 已消失。",
    sourceFocus: "閱讀 subprocess.run 的 timeout，對照 Popen.communicate 的清理範例。從 sys 文件找 stdout 在互動與非互動模式的緩衝差異。",
  },
};

export const lab = {
  intro: "將 A 與 B 的一次問答擴充成可以接受名字的問候。在同一版程式保留正常、失敗與逾時的可觀察證據。",
  goals: [
    "保留原本 Hello 問題，新增一種「名字」請求，支援繁體中文、空白及 UTF-8。",
    "維持 stdout 回覆、stderr 診斷和退出代碼的責任界線。",
    "讓同學根據你的程序圖、命令與紀錄重現一組正常及失敗結果。",
  ],
  commands: [
    ["macOS／Linux", "python3 -X utf8 a.py\npython3 -X utf8 a.py --name \"林 小雨\"\npython3 -X utf8 a.py --name \"   \"\npython3 -X utf8 a.py --mode hang --timeout 1.5\npython3 -X utf8 verify.py"],
    ["Windows PowerShell", "py -3.13 -X utf8 a.py\npy -3.13 -X utf8 a.py --name \"林 小雨\"\npy -3.13 -X utf8 a.py --name \"   \"\npy -3.13 -X utf8 a.py --mode hang --timeout 1.5\npy -3.13 -X utf8 verify.py"],
  ],
  steps: [
    "將 L01 起始 ZIP 解壓縮到新目錄。執行預設 Hello，確認通道能用。再執行 verify.py，一開始與名字相關的測試會指出未完成的需求。",
    "看 a.py 如何將 <code>--name</code> 轉成一行 <code>名字 林 小雨</code>。終端傳的是 argv，Pipe 傳的是資料，畫圖時要分開。",
    "在 b.py 解析名字前綴。去除姓名外側空白，保留中間空白。空白名字或不認得的問題走 stderr，B 以 2 退出。",
    "測試預設 Hello、含空白的名字、空白名字及 hang。追蹤 A 的退出代碼，確認錯誤路徑沒有「收到」。最後跑整組測試。",
  ],
  output: "Python A：名字 林 小雨\nPython B：你好，林 小雨！\nPython A：收到。",
  criteria: [
    ["正確通訊", "Hello 及帶空白的中文名字都可往返。提交 a.py、b.py 與至少一份正常輸出。"],
    ["故障可追蹤", "空白名字、B 異常退出與逾時可分辨。提交非零的 stderr、A 的退出碼、逾時訊息及清理證據。"],
    ["系統說明", "提交一張含 PID／PPID 和標準串流方向的圖，說明 A 的「收到」停在哪裡。"],
  ],
  hints: [
    ["定位", "找 b.py 中比對 Hello 的分支。觀察名字請求的第一個空白後才是姓名。"],
    ["做法", "用 <code>startswith(\"名字 \")</code> 檢查前綴，取出來的名字用 <code>.strip()</code> 移除外側空白，再判斷是否仍有字元。"],
    ["判讀", "Hello 分支照原樣。有效名字回 <code>你好，{name}！</code>。其餘回 stderr 並以 2 結束。參考解答保留了 01.3 的故障選項，可用 verify.py 對照。"],
  ],
};
