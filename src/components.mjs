export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);

export const link = (url, label, className = "") =>
  `<a href="${escapeHtml(url)}"${className ? ` class="${escapeHtml(className)}"` : ""}>${escapeHtml(label)}</a>`;
export const lessonUrl = (id) => `/lessons/${id}/`;
export const moduleUrl = (id) => `/modules/${id}/`;
export const labUrl = (id) => `/labs/${id}/`;
export const checkUrl = (id) => `/checkpoints/${id}/`;

export function status(state) {
  return `<span class="state ${state === "published" ? "ready" : "planned"}">${state === "published" ? "已上線" : "規劃中"}</span>`;
}

const navLinks = [
  ["/course/", "課程地圖"],
  ["/glossary/", "術語"],
  ["/progress/", "學習進度"],
];

function side(course, currentModule, currentLesson, active, expanded = true) {
  return `<nav class="chapter-nav" aria-label="課程章節">
    ${link("/prepare/", "開始前的準備", active === "prepare" ? "side-link is-current" : "side-link")}
    ${course.modules.map((mod) => {
      const current = mod.id === currentModule;
      const moduleLink = `<a class="side-module ${current ? "is-current" : ""}" href="${moduleUrl(mod.id)}"${current && !currentLesson && active === "module" ? ' aria-current="page"' : ""}>
        <span class="mono">${mod.id.toUpperCase()}</span><span>${escapeHtml(mod.title)}</span>
      </a>`;
      if (!current || !expanded) return moduleLink;
      const items = course.lessons.filter((item) => item.module_id === mod.id);
      return moduleLink + `<ul class="side-lessons">${items.map((item) => `<li><a href="${lessonUrl(item.id)}"${currentLesson === item.id ? ' aria-current="page" class="is-current"' : ""}>${item.number} · ${escapeHtml(item.title)}</a></li>`).join("")}
        <li>${link(labUrl(mod.lab_id), `${mod.lab_id.toUpperCase()} · 本機實作`, active === "lab" ? "is-current" : "")}</li></ul>`;
    }).join("")}
  </nav>`;
}

export function renderShell(course, page) {
  const { title, description, body, path = "/", active = "", toc = [], lesson, selectedLesson = lesson, module, lab } = page;
  const meta = description || "繁體中文 Python 開放課程。從兩支程式互傳 Hello 到本機多 Agent 協作。";
  const siteLabel = "Local Agent Bus";
  const tabTitle = path === "/" ? "Local Agent Bus — From IPC to Multi-Agent Systems" : `${title} | ${siteLabel}`;
  const structured = module || ["course", "prepare", "lesson", "lab"].includes(active);
  const tocLinks = () => toc.map(([id, title]) => `<li>${link(`#${id}`, title)}</li>`).join("");
  return `<!doctype html>
<html lang="zh-TW" data-course-version="${escapeHtml(course.version)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(meta)}">
  <meta name="theme-color" content="#10272c">
  <title>${escapeHtml(tabTitle)}</title>
  <link rel="stylesheet" href="/assets/site.css">
  <script type="module" src="/assets/site.mjs"></script>
</head>
<body${lesson ? ` data-lesson="${escapeHtml(lesson)}"` : ""}${lab ? ` data-lab="${escapeHtml(lab)}"` : ""}>
  <a class="skip" href="#main">跳至主要內容</a>
  <header class="topbar">
    <div class="top-inner">
      <a class="brand" href="/" aria-label="Local Agent Bus 首頁"><span class="brand-mark" aria-hidden="true">&gt;_</span><span>Local Agent Bus</span></a>
      <nav class="top-links" aria-label="主要功能">${navLinks.map(([href, text]) => `<a href="${href}"${path === href || (href === "/course/" && structured) ? ' aria-current="page"' : ""}>${text}</a>`).join("")}</nav>
      <form action="/search/" method="get" class="header-search" role="search" aria-label="搜尋網站">
        <label class="sr-only" for="header-search">搜尋課程與術語</label>
        <span class="magnifier" aria-hidden="true"></span>
        <input id="header-search" name="q" type="search" placeholder="搜尋課程與術語" maxlength="120" required>
      </form>
    </div>
  </header>
  <div class="workspace ${structured ? "with-rail" : ""} ${toc.length ? "with-toc" : ""}">
    ${structured ? `<aside class="rail"><div class="rail-desktop"><p class="rail-label">課程章節</p>${side(course, module, selectedLesson, active)}</div>
      <details class="rail-mobile"><summary>章節選單</summary>${side(course, module, selectedLesson, active)}</details></aside>` : ""}
    <main id="main" tabindex="-1" class="main ${active === "home" ? "home" : ""} ${structured ? "reading-main" : ""}">
      ${toc.length ? `<details class="toc-mobile"><summary>本頁目錄</summary><nav aria-label="本頁目錄"><ul>${tocLinks()}</ul></nav></details>` : ""}
      ${body}
    </main>
    ${toc.length ? `<aside class="toc"><nav aria-label="本頁目錄"><p class="rail-label">本頁目錄</p><ul>${tocLinks()}</ul></nav>
      <div class="type-settings"><button type="button" data-font="-1" aria-label="縮小正文字級">A−</button><button type="button" data-font="1" aria-label="放大正文字級">A+</button></div>
    </aside>` : ""}
  </div>
  <footer class="footer"><div class="footer-inner">
    <span>Local Agent Bus · OpenCourse</span>
    <nav aria-label="課程資源">${link("/prepare/", "環境準備")}${link("/troubleshooting/", "除錯索引")}${link("/sources/", "來源與維護")}${link("/verification/", "驗證紀錄")}</nav>
  </div></footer>
  <div class="sr-only" id="announcement" role="status"></div>
</body>
</html>`;
}

export function breadcrumb(items) {
  return `<nav class="breadcrumb" aria-label="目前位置"><ol>${items.map(([href, title]) => `<li>${href ? link(href, title) : `<span aria-current="page">${escapeHtml(title)}</span>`}</li>`).join("")}</ol></nav>`;
}

export const note = (title, body, variant = "") =>
  `<aside class="note ${variant}"><strong>${escapeHtml(title)}</strong><div>${body}</div></aside>`;

export const itemList = (items, ordered = false) => {
  const tag = ordered ? "ol" : "ul";
  return `<${tag}>${items.map((item) => `<li>${item}</li>`).join("")}</${tag}>`;
};

export const section = (id, title, body, className = "") =>
  `<section class="lesson-section ${className}" id="${id}" aria-labelledby="${id}-title"><h2 id="${id}-title">${escapeHtml(title)}</h2>${body}</section>`;

export function table(headers, rows, caption = "") {
  return `<div class="table-wrap" tabindex="0" role="region" aria-label="${escapeHtml(caption || headers.join("／"))}">
    <table>${caption ? `<caption class="sr-only">${escapeHtml(caption)}</caption>` : ""}
    <thead><tr>${headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((row) => `<tr>${row.map((entry) => `<td>${entry}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

export function codeBlock(label, code, className = "") {
  return `<div class="code-block ${className}"><div class="code-head"><span>${escapeHtml(label)}</span><button class="copy-button" type="button" data-copy>複製</button></div>
    <pre tabindex="0" aria-label="${escapeHtml(label)}"><code>${escapeHtml(code)}</code></pre></div>`;
}

export const commandGroup = (commands) => `<div class="command-group">${commands.map(([platform, code], index) => `<details class="disclosure command"${index === 0 ? " open" : ""}><summary>${platform}</summary>${codeBlock(platform, code)}</details>`).join("")}</div>`;

export const hints = (items) => `<div class="hint-group">${items.map(([heading, body], index) => `<details class="disclosure"><summary>提示 ${index + 1} · ${heading}</summary><p>${body}</p></details>`).join("")}</div>`;

export function answers(question, index) {
  return `<fieldset class="quiz-item" data-question="${question.id}" data-answer="${question.correct}">
    <legend>${typeof index === "number" ? `${index + 1}. ` : ""}${escapeHtml(question.prompt)}</legend>
    ${question.options.map(([id, text]) => `<label class="quiz-option"><input type="radio" name="${question.id}" value="${id}" required><span>${escapeHtml(text)}</span></label>`).join("")}
    <div class="feedback" data-feedback hidden><strong data-verdict></strong><p>${escapeHtml(question.why)}</p>${question.back ? link(`#${question.back}`, "回讀相關內容") : ""}</div>
  </fieldset>`;
}

export function questionForm(questions, type, lesson) {
  return `<form class="quiz-form" data-quiz="${type}" data-for="${lesson}">
    ${questions.map((question, index) => answers(question, type === "quiz" ? index : null)).join("")}
    <div class="row-actions">
      <button type="submit" class="button ${type === "quiz" ? "primary" : "secondary"}">${type === "quiz" ? "核對這組答案" : "核對預測"}</button>
      <button type="reset" class="button quiet">重新作答</button>
      <output class="quiz-score" aria-live="polite"></output>
    </div>
  </form>`;
}

export const dataTrace = (rows) => `<figure class="concept-trace">
  <figcaption>資料路徑</figcaption><dl>${rows.map(([step, text]) => `<div><dt>${escapeHtml(step)}</dt><dd>${escapeHtml(text)}</dd></div>`).join("")}</dl>
</figure>`;

export function experimentFiles(id, examples) {
  const base = `/downloads/${id}/`;
  const labels = { starter: "起始碼", solution: "參考解答" };
  return `<div class="row-actions download-actions">
    <a class="button primary" href="${base}starter.zip" download>下載起始 ZIP</a>
    <a class="button secondary" href="${base}solution.zip" download>下載解答 ZIP</a>
    <span class="subtle mono">v0.1.0</span>
  </div>
  <div class="file-view">${Object.entries(examples).map(([variant, files]) => `<details class="disclosure">
    <summary>檢視${labels[variant]}</summary>
    <div>${Object.entries(files).map(([name, content]) => `<div class="file-unit">${codeBlock(name, content)}<a href="${base}${variant}/${name}" download>下載 ${name}</a></div>`).join("")}</div>
  </details>`).join("")}</div>`;
}

export function simulation(mode) {
  const memory = mode === "memory";
  const fault = mode === "fault";
  return `<div class="simulation" data-sim="${mode}">
    <div class="sim-header"><span class="mode-label">瀏覽器模擬</span><span class="subtle">${memory ? "PID 為示意值" : "使用虛擬時間與示意 PID"}</span></div>
    <p>${memory
      ? "先猜 B 的寫入會改變哪個值。設定 A 與 B 的起始值和增量，逐步看各程序的記憶體和輸出。"
      : fault
        ? "先預測 A 是否會完成。把 B 設為「回覆後持續運行」，比較是否立即 flush。也可以移除換行，再切換是否關閉 stdin。"
        : "先預測 B 會收到幾個 UTF-8 bytes。試著改掉一句話的其中一字，觀察 stdout、stderr 和退出狀態。"} OS 程序實測請使用下方的本機實驗。</p>
    <div class="sim-layout">
      <div class="sim-controls">
        ${memory ? `<div class="controls-grid pair">
          <label>A 起始值<input data-param="a" type="number" value="10" min="-99" max="99"></label>
          <label>A 增量<input data-param="aDelta" type="number" value="1" min="-99" max="99"></label>
          <label>B 起始值<input data-param="b" type="number" value="40" min="-99" max="99"></label>
          <label>B 增量<input data-param="bDelta" type="number" value="2" min="-99" max="99"></label>
        </div>` : `<div class="controls-grid">
          <label class="control-wide">送給 B 的文字<input data-param="payload" type="text" value="你好，你是誰？" maxlength="50"></label>
          <label>B 的行為<select data-param="worker"><option value="normal">正常回覆</option><option value="exception">讀取前拋出例外</option><option value="no-read">讀取前退出</option><option value="silent">成功退出且無回覆</option><option value="hang">回覆後持續運行</option></select></label>
          <label>stdin 結尾<select data-param="ending"><option value="line">換行後關閉</option><option value="eof">無換行，關閉取得 EOF</option><option value="open">無換行，保持開啟</option></select></label>
          <label>回覆前延遲（秒）<input data-param="delay" type="number" min="0" max="12" value="1" step="1"></label>
          <label>A 的逾時（秒）<input data-param="limit" type="number" min="1" max="12" value="5" step="1"></label>
          <label class="inline-check control-wide"><input data-param="flush" type="checkbox" checked> B 寫出時立即 flush</label>
        </div>`}
        <div class="row-actions sim-actions">
          <button type="button" class="button primary" data-sim-action="step">單步</button>
          <button type="button" class="button secondary" data-sim-action="run">跑到結束</button>
          <button type="button" class="button quiet" data-sim-action="reset">重設</button>
          ${memory ? "" : '<button type="button" class="button quiet" data-sim-action="stop" disabled>停止 B</button>'}
        </div>
      </div>
      <div class="sim-display">
        <div class="process-pair">
          <div class="process-node"><strong>A · 父程序</strong><span class="mono">PID 4100</span><span data-sim-a>等待開始</span></div>
          <div class="process-node"><strong>B · 子程序</strong><span class="mono">PID 4101</span><span data-sim-b>尚未啟動</span></div>
        </div>
        <dl class="sim-channels">
          <div><dt>${memory ? "A 的 value" : "A → B stdin"}</dt><dd data-sim-stdin>—</dd></div>
          <div><dt>${memory ? "B 的 value" : "B → A stdout"}</dt><dd data-sim-stdout>—</dd></div>
          <div><dt>${memory ? "B → A stdout" : "B → A stderr"}</dt><dd data-sim-stderr>—</dd></div>
          ${memory ? "" : '<div><dt>B 的 Python buffer</dt><dd data-sim-buffer>—</dd></div>'}
        </dl>
      </div>
    </div>
    <div class="trace-log"><strong>事件紀錄</strong><p role="status" data-sim-summary>等待開始。設定參數後按「單步」。</p><ol aria-label="模擬事件歷程" data-sim-log></ol></div>
  </div>`;
}

export function evidenceForm(kind, id) {
  const isLab = kind === "lab";
  return `<div class="record-box" data-record="${kind}" data-id="${id}">
    <div class="record-checks">
      ${isLab ? '<label class="inline-check"><input type="checkbox" data-field="done"> 我已重現並檢查 L01 的成果</label>'
      : '<label class="inline-check"><input type="checkbox" data-field="read"> 已讀完本課</label><label class="inline-check"><input type="checkbox" data-field="lab"> 已完成本課本機實驗（自評）</label>'}
    </div>
    <label class="stack-label" for="evidence-note">證據筆記</label>
    <textarea id="evidence-note" data-field="notes" rows="4" maxlength="24000" placeholder="記下操作、輸出、退出碼與你的解釋"></textarea>
    <div class="row-actions">
      <button type="button" class="button secondary" data-save-note>保存筆記</button>
      <output class="subtle" data-record-message aria-live="polite">使用此裝置的瀏覽器保存。</output>
    </div>
  </div>`;
}
