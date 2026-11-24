const hello = "你好，你是誰？";
const fixedReply = "我是 Python B。";
const bytestream = new TextEncoder();

export function memoryEvents({ a, b, aDelta, bDelta }) {
  return [
    ["A 載入自己的 value。", { a: "已啟動", stdin: String(a) }],
    [`A 把自己的 value 改成 ${a + aDelta}，啟動 B。`, { a: "等待 B", b: "已啟動", stdin: String(a + aDelta), stdout: String(b) }],
    [`B 在自己的位址空間改值為 ${b + bDelta}。`, { b: "完成改值", stdout: String(b + bDelta) }],
    ["B 寫出文字，再結束。資料經 stdout Pipe 到 A。", { b: "已退出", stderr: `B value=${b + bDelta}` }],
    [`A 再讀自己的 value，得到 ${a + aDelta}。`, { a: "已完成", complete: true }],
  ];
}

export function pipeEvents({ payload, worker, ending, delay, limit, flush }) {
  const sent = payload + (ending === "line" ? "\n" : "");
  const length = bytestream.encode(sent).byteLength;
  const events = [
    ["t=0s · A 啟動 B，接上 stdin、stdout 與 stderr。", { a: "等待 B", b: "已啟動" }],
    [`t=0s · A 向 stdin 提交 ${length} bytes。${ending === "open" ? "寫入端仍開啟。" : "已關閉寫入端。"}`, { stdin: `${JSON.stringify(sent)}（${length} bytes）` }],
  ];
  function fail(message, diagnostic, code, time = 0) {
    events.push([`t=${time}s · B ${message}，寫出 stderr，以 ${code} 退出。`, { b: `已退出（${code}）`, stderr: diagnostic }]);
    events.push([`t=${time}s · A 擷取 B 的診斷，回報失敗。`, { a: "失敗 · B 非零退出", complete: true }]);
  }
  function timeout(buffered = false) {
    events.push([`t=${limit}s · A 等候逾時，終止並回收 B。現有輸出可作診斷。`, {
      a: "逾時 · 未完成", b: "已停止並回收", complete: true,
      ...(buffered ? { buffer: "B 終止，未送出的緩衝已丟棄" } : {}),
    }]);
  }

  if (worker === "exception" || worker === "no-read") {
    fail(worker === "exception" ? "拋出例外" : "在讀取前離開", worker === "exception" ? "RuntimeError（示意）" : "B 未呼叫 readline() 就結束。", worker === "exception" ? 1 : 3);
    return events;
  }
  if (ending === "open") {
    events.push(["t=0s · B 在 readline() 等換行或 EOF。", { b: "等候 stdin" }]);
    timeout();
    return events;
  }
  if (sent === "") {
    fail("先看到 EOF", "B 沒有收到資料。", 2);
    return events;
  }
  events.push([`t=0s · B 因${ending === "line" ? "換行" : "讀完後遇到 EOF"}取出一行，現在可以處理問題。`, { b: "已讀取一行" }]);
  if (payload !== hello) {
    fail("讀到無法辨識的問題", "不認得這個問題", 2);
    return events;
  }
  if (delay > 0) events.push([`B 開始處理，預計在 t=${delay}s 產生回覆。`, { b: "處理中" }]);
  if (delay >= limit) {
    timeout();
    return events;
  }
  if (worker === "silent") {
    events.push([`t=${delay}s · B 以 0 離開，stdout 沒有內容。`, { b: "已退出（0）" }]);
    events.push([`t=${delay}s · A 的回覆檢查失敗。`, { a: "失敗 · 沒有回覆", complete: true }]);
    return events;
  }

  events.push([`t=${delay}s · B 呼叫 print()，${flush ? "直接 flush 到 stdout Pipe。" : "少量輸出留在 Python 緩衝。"}`, {
    b: "已呼叫 print()", buffer: flush ? "已清空" : fixedReply, ...(flush ? { stdout: fixedReply } : {}),
  }]);
  if (worker === "hang") {
    events.push([`t=${delay}s · B 仍在運行，A 收到資料也得繼續等待退出。`, { b: "持續運行", stderr: "B 已完成 print()，但仍在運行。" }]);
    timeout(!flush);
  } else {
    events.push([`t=${delay}s · B 正常退出；正常收尾會沖出尚未送出的緩衝。`, { b: "已退出（0）", buffer: "已清空", stdout: fixedReply }]);
    events.push([`t=${delay}s · A 取得退出狀態和完整回答，在本地印出「收到」。`, { a: "已完成 · 退出 0", complete: true }]);
  }
  return events;
}

export const initialSimulation = () => ({
  a: "等待開始", b: "尚未啟動", stdin: "—", stdout: "—", stderr: "—", buffer: "—", log: [], complete: false,
});

export function nextEvent(state, events) {
  if (state.complete) return state;
  const event = events[state.log.length];
  return event ? { ...state, ...event[1], log: [...state.log, event[0]] } : state;
}

export function stopWorker(state) {
  if (state.complete || !state.log.length || state.b.startsWith("已退出")) return state;
  return {
    ...state, a: "操作中止 · 未完成", b: "已停止並回收", complete: true,
    buffer: "未送出的緩衝已丟棄",
    log: [...state.log, "操作者停止 B，A 保留當前已寫入的輸出與中止狀態。"],
  };
}

export function normalizeText(value) {
  return String(value ?? "").normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

export function searchIndex(index, query) {
  const term = normalizeText(query);
  if (!term) return [];
  const fragments = term.replace(/^(為什麼|為何|如何|什麼是|怎麼|找一下)\s*/, "")
    .split(/[\s，、。？！?!]+/).filter(Boolean);
  const markers = [...new Set([...fragments, ...(term.match(/[a-z][a-z0-9-]{1,}/g) ?? [])])];
  return index.map((entry) => {
    const title = normalizeText(entry.title);
    const keywords = normalizeText(entry.keywords);
    const haystack = normalizeText(entry.text);
    let score = title === term ? 16 : 0;
    if (title.includes(term)) score += 12;
    if (keywords.includes(term)) score += 10;
    if (haystack.includes(term)) score += 4;
    for (const word of markers) {
      if (title.includes(word)) score += 7;
      if (keywords.includes(word)) score += 4;
      if (haystack.includes(word)) score += 1;
    }
    return { entry, score };
  }).filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || Number(b.entry.live) - Number(a.entry.live))
    .map(({ entry }) => entry);
}
