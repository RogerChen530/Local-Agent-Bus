import { memoryEvents, pipeEvents, initialSimulation, nextEvent, stopWorker, normalizeText, searchIndex } from "./models.mjs";
import { emptyProgress, progressKey, validateProgress, importProgress, mergeQuiz, quizScore, maxImportBytes } from "./progress-model.mjs";
import { activeLessons } from "./catalog.mjs";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const version = document.documentElement.dataset.courseVersion;
let storage = null;
let state = emptyProgress(version);
let storageError = "";
const announce = (text) => { $("#announcement").textContent = text; };

function loadState() {
  const raw = storage.getItem(progressKey);
  return raw ? validateProgress(JSON.parse(raw)) : emptyProgress(version);
}

try {
  storage = window.localStorage;
  state = loadState();
} catch {
  storageError = "這個瀏覽器的進度資料無法讀取。";
}

function updateProgress(change) {
  try {
    const next = change(storage ? loadState() : state);
    if (!storage) return false;
    storage.setItem(progressKey, JSON.stringify(validateProgress(next)));
    state = next;
    storageError = "";
    renderProgress();
    return true;
  } catch {
    storageError = "瀏覽器未能保存進度。";
    return false;
  }
}

function attempt(node, change, message) {
  node.textContent = updateProgress(change) ? message : storageError || "這個瀏覽器無法保存進度。";
}

function renderProgress() {
  const last = state.last_location;
  const lesson = activeLessons.find(({ id }) => id === last?.id);
  if (lesson) {
    for (const a of $$("[data-resume]")) {
      a.textContent = `繼續 ${lesson.number}`;
      a.href = new URL(`../lessons/${lesson.id}/${last.section ? "#" + last.section : ""}`, import.meta.url);
    }
    for (const label of $$("[data-resume-label]")) label.textContent = `上次閱讀 · ${lesson.number} ${lesson.title}`;
  } else {
    for (const a of $$("[data-resume]")) {
      a.textContent = a.closest(".hero") ? "從第一個 Hello 開始" : "開始第一課";
      a.href = new URL("../lessons/m01-l01/", import.meta.url);
    }
    for (const label of $$("[data-resume-label]")) {
      label.textContent = label.closest(".hero") ? "使用 Python 標準函式庫，從程序與 Pipe 開始。" : "從第一課開始。進度會在瀏覽已上線課程時更新。";
    }
  }

  for (const el of $$("[data-read-badge]")) {
    const time = el.dataset.original ??= el.textContent;
    el.textContent = state.lessons[el.dataset.readBadge]?.read ? "已讀完" : time;
  }
  for (const el of $$("[data-total]")) {
    el.textContent = activeLessons.filter(({ id }) => state.lessons[id]?.[el.dataset.total]).length;
  }
  for (const el of $$("[data-progress]")) {
    const [id, kind] = el.dataset.progress.split(":");
    const value = state.lessons[id]?.[kind];
    el.textContent = kind === "quiz" ? quizScore(value) : value ? "已完成" : "待記錄";
  }
  const lab = $("[data-lab-status]");
  if (lab) lab.textContent = state.labs.l01?.done ? "已完成（自評）" : "待記錄";

  const notes = $("[data-progress-notes]");
  if (notes) {
    const records = activeLessons.map(({ id, number, title }) => [number + " " + title, state.lessons[id]?.notes]);
    records.push(["L01 · 本機實作", state.labs.l01?.notes]);
    notes.replaceChildren();
    for (const [title, note] of records) {
      if (!note?.trim()) continue;
      const heading = document.createElement("h3");
      const body = document.createElement("p");
      heading.textContent = title;
      body.textContent = note;
      body.className = "stored-note";
      notes.append(heading, body);
    }
    if (!notes.childNodes.length) notes.textContent = "目前沒有筆記。";
  }
}

function locSection() {
  const hash = location.hash.slice(1);
  const target = hash ? document.getElementById(hash) : null;
  return target?.closest(".lesson-section")?.id ?? null;
}

function trackLocation() {
  const id = document.body.dataset.lesson;
  if (!id) return;
  const save = (section) => updateProgress((next) => {
    next.last_location = { id, section, at: Date.now() };
    return next;
  });
  const previous = state.last_location;
  save(locSection() ?? (previous?.id === id ? previous.section : null));
  window.addEventListener("hashchange", () => save(locSection()));
  window.addEventListener("pagehide", () => {
    const sections = $$(".lesson-body > section").filter((node) => !node.hidden && node.getBoundingClientRect().top <= 140);
    save(sections.at(-1)?.id ?? locSection());
  });
}

function setupEvidence() {
  for (const box of $$("[data-record]")) {
    const key = box.dataset.record === "lesson" ? "lessons" : "labs";
    const id = box.dataset.id;
    const message = $("[data-record-message]", box);
    const controls = $$("[data-field]", box);
    if (storageError) message.textContent = storageError;
    const value = state[key][id] ?? {};
    for (const control of controls) {
      const field = control.dataset.field;
      if (field === "notes") control.value = value.notes ?? "";
      else control.checked = value[field] === true;
      if (control.type === "checkbox") control.addEventListener("change", () => {
        attempt(message, (next) => {
          next[key][id] = { ...next[key][id], [field]: control.checked };
          return next;
        }, "已儲存自評進度。");
      });
    }
    $("[data-save-note]", box).addEventListener("click", () => {
      const notes = $("[data-field=notes]", box).value;
      attempt(message, (next) => {
        next[key][id] = { ...next[key][id], notes };
        return next;
      }, "已儲存筆記。");
    });
  }
}

function setupBackup() {
  const message = $("[data-progress-message]");
  if (!message) return;
  if (storageError) message.textContent = storageError;
  $("[data-export]").addEventListener("click", () => {
    const file = new Blob([JSON.stringify({ ...state, course_version: version }, null, 2) + "\n"], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "local-agent-bus-progress.json";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    message.textContent = "已建立進度 JSON 下載。";
  });
  $("[data-import]").addEventListener("change", async (event) => {
    const input = event.currentTarget;
    const [file] = input.files;
    if (!file) return;
    try {
      if (file.size > maxImportBytes) throw new Error("檔案超過 1 MB。");
      let incoming;
      try { incoming = JSON.parse(await file.text()); }
      catch { throw new Error("檔案不是有效的 JSON。"); }
      validateProgress(incoming);
      if (storage) importProgress(loadState(), incoming, version);
      attempt(message, (next) => importProgress(next, incoming, version), "已匯入並合併進度，閱讀、實作與筆記可在上方查看。");
    } catch (error) {
      message.textContent = "匯入失敗。既有進度已保留。" + (error instanceof Error ? error.message : "");
    } finally {
      input.value = "";
    }
  });
  $("[data-clear]").addEventListener("click", () => {
    if (!window.confirm("清除目前瀏覽器的課程進度與筆記？如需保留，請先匯出 JSON。")) return;
    try {
      storage.removeItem(progressKey);
      state = emptyProgress(version);
      renderProgress();
      message.textContent = "這個瀏覽器的課程進度已清除。";
    } catch {
      message.textContent = "瀏覽器未能清除進度。";
    }
  });
}

function setupQuizzes() {
  for (const form of $$("[data-quiz]")) {
    const isQuiz = form.dataset.quiz === "quiz";
    const id = form.dataset.for;
    const output = $(".quiz-score", form);
    const fields = $$("[data-question]", form);

    function reveal(field, selected) {
      const correct = selected === field.dataset.answer;
      const feedback = $("[data-feedback]", field);
      feedback.hidden = false;
      feedback.dataset.correct = String(correct);
      $("[data-verdict]", feedback).textContent = correct ? (isQuiz ? "答對" : "預測正確") : "再核對這一步";
      return correct;
    }

    if (isQuiz && state.lessons[id]?.quiz) {
      output.textContent = "上次檢核 " + quizScore(state.lessons[id].quiz);
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const answers = new FormData(form);
      const items = Object.fromEntries(fields.map((field) => {
        const id = field.dataset.question;
        const answer = answers.get(id);
        return [id, { answer, correct: reveal(field, answer) }];
      }));
      const record = { items, active: Object.keys(items), at: Date.now() };
      if (isQuiz) {
        const saved = updateProgress((next) => {
          const prior = next.lessons[id] ?? {};
          next.lessons[id] = { ...prior, quiz: mergeQuiz(prior.quiz, record) };
          return next;
        });
        output.textContent = `本次 ${quizScore(record)}。${saved ? "已記錄。" : "這個瀏覽器未能保存。"}`;
      } else {
        output.textContent = Object.values(items)[0].correct ? "已核對預測。" : "閱讀解析，再比較接下來的實驗。";
      }
    });
    form.addEventListener("reset", () => {
      for (const field of fields) $("[data-feedback]", field).hidden = true;
      output.textContent = isQuiz && state.lessons[id]?.quiz ? "上次檢核 " + quizScore(state.lessons[id].quiz) : "";
    });
  }
}

function setupSimulations() {
  for (const panel of $$("[data-sim]")) {
    const mode = panel.dataset.sim;
    const buttons = Object.fromEntries($$("[data-sim-action]", panel).map((button) => [button.dataset.simAction, button]));
    const controls = Object.fromEntries($$("[data-param]", panel).map((input) => [input.dataset.param, input]));
    const channels = Object.fromEntries(["a", "b", "stdin", "stdout", "stderr", "buffer"].map((key) => [key, $('[data-sim-' + key + ']', panel)]));
    const summary = $("[data-sim-summary]", panel);
    const trace = $("[data-sim-log]", panel);
    let current = initialSimulation();
    let events = null;

    function number(key) {
      const control = controls[key];
      const value = Number.isFinite(control.valueAsNumber) ? Math.round(control.valueAsNumber) : Number(control.defaultValue);
      return Math.min(Number(control.max), Math.max(Number(control.min), value));
    }
    function createEvents() {
      return mode === "memory" ? memoryEvents({ a: number("a"), b: number("b"), aDelta: number("aDelta"), bDelta: number("bDelta") })
        : pipeEvents({
          payload: controls.payload.value, worker: controls.worker.value, ending: controls.ending.value,
          flush: controls.flush.checked, delay: number("delay"), limit: number("limit"),
        });
    }
    function draw() {
      for (const [key, element] of Object.entries(channels)) if (element) element.textContent = current[key];
      summary.textContent = current.log.at(-1) ?? "等待開始。設定參數後按「單步」。";
      trace.replaceChildren(...current.log.map((message) => {
        const item = document.createElement("li");
        item.textContent = message;
        return item;
      }));
      for (const button of [buttons.step, buttons.run]) button.setAttribute("aria-disabled", String(current.complete));
      if (buttons.stop) buttons.stop.disabled = !current.log.length || current.complete || current.b.startsWith("已退出");
    }
    function reset() {
      current = initialSimulation();
      events = null;
      draw();
    }

    buttons.step.addEventListener("click", () => {
      events ??= createEvents();
      current = nextEvent(current, events);
      draw();
    });
    buttons.run.addEventListener("click", () => {
      events ??= createEvents();
      for (let index = current.log.length; index < events.length && !current.complete; index += 1) current = nextEvent(current, events);
      draw();
    });
    buttons.reset.addEventListener("click", reset);
    buttons.stop?.addEventListener("click", () => {
      current = stopWorker(current);
      draw();
    });
    for (const control of Object.values(controls)) control.addEventListener("input", reset);
    draw();
  }
}

function setupCopy() {
  for (const button of $$("[data-copy]")) button.addEventListener("click", async () => {
    const code = $("pre code", button.closest(".code-block"));
    let copied = false;
    try {
      await navigator.clipboard.writeText(code.textContent);
      copied = true;
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(code);
      selection.removeAllRanges();
      selection.addRange(range);
      try { copied = document.execCommand("copy"); } catch { /* Selection stays available for manual copy. */ }
      if (copied) selection.removeAllRanges();
    }
    const label = copied ? "已複製" : "已選取，請複製";
    button.textContent = label;
    announce(copied ? "程式碼已複製。" : "程式碼已選取，可用鍵盤複製。");
    window.clearTimeout(Number(button.dataset.restoreLabel));
    button.dataset.restoreLabel = window.setTimeout(() => { button.textContent = "複製"; }, 2300);
  });
}

function setupReading() {
  let size = 17;
  try {
    const storedSize = Number(storage?.getItem("local-agent-bus:font-size"));
    if (storedSize >= 16 && storedSize <= 24) size = storedSize;
  } catch { /* The default still works if the browser restricts storage. */ }
  function applySize() {
    document.documentElement.style.setProperty("--reading-size", (size / 16) + "rem");
  }
  applySize();
  for (const button of $$("[data-font]")) button.addEventListener("click", () => {
    size = Math.max(16, Math.min(24, size + Number(button.dataset.font)));
    applySize();
    try { storage?.setItem("local-agent-bus:font-size", String(size)); } catch { /* Size still changes on this page. */ }
    announce(`正文字級為 ${size} 像素。`);
  });

  const quick = $("[data-quick]");
  quick?.addEventListener("click", () => {
    const enabled = quick.getAttribute("aria-pressed") !== "true";
    quick.setAttribute("aria-pressed", String(enabled));
    quick.textContent = enabled ? "展開完整教材" : "今天只做這一課";
    for (const section of $$(".lesson-optional")) {
      section.hidden = enabled;
      for (const a of $$("a[href='#" + section.id + "']", document)) {
        if (a.closest(".toc, .toc-mobile")) a.closest("li").hidden = enabled;
      }
    }
    announce(enabled ? "顯示目標、實作及完成標準。" : "已展開完整教材。");
  });
}

function setupFilters() {
  for (const input of $$("[data-filter]")) {
    const items = $$("[data-filter-item]", $('[data-filter-list="' + input.dataset.filter + '"]'));
    const status = $("[data-filter-count]");
    const filter = () => {
      const query = normalizeText(input.value);
      let count = 0;
      for (const item of items) {
        item.hidden = !normalizeText(item.textContent + " " + (item.dataset.keywords ?? "")).includes(query);
        count += Number(!item.hidden);
      }
      status.textContent = `${count} 筆符合${query ? "「" + input.value.trim() + "」" : ""}`;
    };
    input.addEventListener("input", filter);
    filter();
  }
}

async function loadSearch() {
  const results = $("[data-search-results]");
  if (!results) return;
  const input = $("#full-search");
  const summary = $("[data-search-summary]");
  input.value = (new URLSearchParams(location.search).get("q") ?? "").slice(0, 120);
  if (!input.value.trim()) {
    summary.textContent = "可由關鍵字、課次或協定名稱開始查找。";
    return;
  }
  summary.textContent = "查找中";
  try {
    const response = await fetch(new URL("search-index.json", import.meta.url));
    if (!response.ok) throw new Error("Search index unavailable");
    const matches = searchIndex(await response.json(), input.value);
    summary.textContent = matches.length ? `共 ${matches.length} 筆符合「${input.value.trim()}」${matches.length > 30 ? "，顯示最相關的 30 筆" : ""}。` : "查無符合的內容。可試用縮寫、詞的一部分或課次 ID。";
    results.replaceChildren(...matches.slice(0, 30).map((match) => {
      const item = document.createElement("li");
      const anchor = document.createElement("a");
      const category = document.createElement("span");
      const body = document.createElement("p");
      anchor.className = "search-result-title";
      anchor.href = new URL(`..${match.url}`, import.meta.url);
      anchor.textContent = match.title;
      category.className = "search-result-kind";
      category.textContent = match.kind + (match.live ? "" : " · 規劃中");
      body.textContent = match.summary;
      item.append(anchor, category, body);
      return item;
    }));
  } catch {
    summary.textContent = "暫時無法載入搜尋索引，可以先從課程地圖或術語表瀏覽。";
  }
}

renderProgress();
trackLocation();
setupEvidence();
setupBackup();
setupQuizzes();
setupSimulations();
setupCopy();
setupReading();
setupFilters();
loadSearch();
window.addEventListener("storage", (event) => {
  if (event.key !== progressKey) return;
  try { state = loadState(); renderProgress(); } catch { /* Ignore incompatible changes from another tab. */ }
});
