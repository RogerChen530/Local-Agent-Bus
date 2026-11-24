import { lessons as taught, lab as coreLab } from "../content/m01.mjs";
import { terms, diagnoses, paths, phases, layers } from "../content/reference.mjs";
import {
  escapeHtml as e, link, moduleUrl, lessonUrl, labUrl, checkUrl, status, breadcrumb, note,
  itemList, section, table, codeBlock, commandGroup, hints, questionForm, dataTrace,
  experimentFiles, simulation, evidenceForm,
} from "./components.mjs";

const courseLink = ["/course/", "課程地圖"];
const published = (item) => item.status === "published";
const titleBlock = (label, title, intro = "") => `<header class="page-heading">
  ${label ? `<p class="eyebrow">${label}</p>` : ""}<h1>${e(title)}</h1>${intro ? `<p class="lede">${e(intro)}</p>` : ""}</header>`;
const chapterNote = (phase, extra = "") => note("規劃中", `<p>本頁公開規格與先備關係，完整教材預計於 ${phase} 階段製作。${extra}</p>`, "quiet-note");
const lessonName = (item) => `${item.number} · ${item.title}`;
const supported = (environments) => environments.length
  ? `已測 ${environments.map(({ os, python }) => `${os}／Python ${python}`).join("、")}`
  : "本次發行的本機驗證尚待紀錄";
const labRevision = "v0.1.0";

function moduleLessonList(course, mod) {
  return `<ul class="lesson-list">${mod.lesson_ids.map((id) => {
    const item = course.lessons.find((lesson) => lesson.id === id);
    return `<li><a href="${lessonUrl(id)}" class="lesson-row">
      <span class="lesson-index mono">${item.number}</span><span><strong>${e(item.title)}</strong><span class="line-detail">${e(item.task)}</span></span>
      ${published(item) ? `<span class="row-status" data-read-badge="${id}">${item.estimated_read_minutes + item.estimated_lab_minutes} 分鐘</span>` : '<span class="row-status">規劃中</span>'}
    </a></li>`;
  }).join("")}</ul>`;
}

export function home(course) {
  const mod = course.modules[0];
  const planHours = course.modules.reduce((sum, item) => sum + item.hours, 0);
  return { title: "首頁", active: "home", body: `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow"><span class="accent-rule" aria-hidden="true"></span>Python 開放課程</p>
        <h1>Local Agent Bus<span>From IPC to Multi-Agent Systems</span></h1>
        <p class="lede">從兩支 Python 程式互傳 Hello 開始，逐步建立可追蹤、可取消的本機 Agent 協作系統。</p>
        <div class="row-actions hero-actions">
          <a class="button primary" href="/lessons/m01-l01/" data-resume>從第一個 Hello 開始</a>
          ${link("/course/", "查看課程地圖", "button secondary")}
        </div>
        <p class="resume-position subtle" data-resume-label>使用 Python 標準函式庫，從程序與 Pipe 開始。</p>
      </div>
      <figure class="hero-terminal">
        <div class="terminal-top"><figcaption>一次 Pipe 問答</figcaption><span class="mono terminal-mode">M01 · 示意</span></div>
        <div class="hero-wire" aria-label="A 問 B，B 把答案傳回 A">
          <div class="hero-node"><span class="node-kicker">父程序</span><strong>a.py</strong><span class="mono">PID 4100</span></div>
          <div class="hero-connect"><div class="out-wire"><span>stdin</span></div><div class="in-wire"><span>stdout</span></div></div>
          <div class="hero-node"><span class="node-kicker">子程序</span><strong>b.py</strong><span class="mono">PID 4101</span></div>
        </div>
        <dl class="terminal-log"><div><dt>A → B</dt><dd>你好，你是誰？</dd></div><div><dt>B → A</dt><dd>我是 Python B。</dd></div><div><dt>A 本地</dt><dd>收到。</dd></div></dl>
      </figure>
    </section>
    <div class="home-facts" aria-label="課程規模"><div><strong>${course.modules.length}</strong><span>個規劃模組</span></div><div><strong>${course.lessons.length}</strong><span>堂核心課次</span></div><div><strong>${planHours}</strong><span>小時規劃</span></div><div><strong>${course.lessons.filter(published).length}</strong><span>堂目前可學</span></div></div>
    <section class="home-learning" aria-labelledby="start-heading">
      <div class="home-section-intro"><p class="eyebrow mono">M01</p><h2 id="start-heading">${e(mod.title)}</h2><p>先預測程序的行為，再用瀏覽器模擬與本機輸出交叉檢查。三堂課約 3 小時，含 L01 整合練習。</p><div class="support-links">${link("/prepare/", "檢查 Python 環境")}${link("/verification/", "查看實測紀錄")}</div></div>
      <div class="home-lessons">${moduleLessonList(course, mod)}
        <a href="${labUrl("l01")}" class="home-lab lesson-row"><span class="lesson-index mono">L01</span><span><strong>本機實作：讓 B 回覆你的名字</strong><span class="line-detail">下載起始碼、跑測試並保存故障證據。</span></span><span class="row-status">本機實作</span></a>
      </div>
    </section>
    <section class="home-paths" aria-labelledby="path-title"><h2 id="path-title">學習路徑</h2><div class="path-grid">
      ${paths.map(([id, title, description, span, state]) => `<article class="path-item"><div class="path-kicker">${e(span)} <span>${e(state)}</span></div><h3>${link(`/course/#${id}`, title)}</h3><p>${e(description)}</p></article>`).join("")}
    </div></section>` };
}

export function courseMap(course) {
  return { title: "課程地圖", active: "course", module: "m01", body:
    titleBlock("課程大綱", "課程地圖", "12 個模組、36 課，規劃 67 小時。每個模組的產出會成為下一個模組的起點。") +
    `<div class="path-grid">${paths.map(([id, title, description, span, state]) => `
      <article id="${id}" class="path-item"><div class="path-kicker">${e(span)} <span>${e(state)}</span></div><h2>${e(title)}</h2><p>${e(description)}</p></article>`).join("")}</div>` +
    section("module-sequence", "模組與先備關係", `<div class="course-modules">${course.modules.map((mod) => {
      const dependency = mod.prerequisites.map((id) => id === "prepare" ? link("/prepare/", "環境準備") : id.startsWith("m") ? link(moduleUrl(id), id.toUpperCase()) : link(checkUrl(id), `檢核 ${id.toUpperCase()}`)).join("、");
      return `<article class="map-module ${mod.state === "published" ? "live-module" : ""}">
        <div class="module-heading"><span class="mono">${mod.id.toUpperCase()}</span><h3>${link(moduleUrl(mod.id), mod.title)}</h3>${status(mod.state)}</div>
        <p>${e(mod.goal)}</p><div class="map-meta"><span>先備 ${dependency}</span><span>約 ${mod.hours} 小時</span><span>產出 ${e(mod.artifact)}</span></div>
        ${moduleLessonList(course, mod)}
      </article>`;
    }).join("")}</div>`) +
    section("checkpoints", "階段檢核", `<p>各階段以程序輸出、trace、測試或重現紀錄判定，課程閱讀紀錄另行保存。</p><ul class="compact-list">${course.checkpoints.map((item) => `<li>${link(checkUrl(item.id), `${item.id.toUpperCase()} · ${item.title}`)} <span class="subtle">${item.modules.map((id) => id.toUpperCase()).join("、")} · 規劃中</span></li>`).join("")}</ul>`) +
    section("system-layers", "完課系統的四個層次", `<p>追蹤同一個 task ID。提交端將任務送往 Bus，Bus 將工作交給 Adapter，執行結果和狀態回到同一筆任務紀錄。</p>${table(["層次", "責任", "課程例子"], layers.map((row) => row.map(e)), "Agent 系統的四個層次")}<p>接入規劃先驗證離線 Mock 契約，後續才使用供應端官方文件支援的 CLI、SDK 或協定。實際資料目的地依所選端點與 Agent 設定判定。</p><p>${link("/capstone/", "查看期末專案規格")}　${link("/verification/", "查看分階段驗證紀錄")}</p>`) };
}

export function modulePage(course, mod) {
  const isLive = mod.state === "published";
  const prerequisites = mod.prerequisites.map((id) => id === "prepare" ? link("/prepare/", "P01–P03 或具備同等基礎") : id.startsWith("m") ? link(moduleUrl(id), id.toUpperCase()) : link(checkUrl(id), `檢核 ${id.toUpperCase()}`)).join("、");
  return { title: mod.title, active: "module", module: mod.id, body:
    breadcrumb([courseLink, [null, mod.id.toUpperCase()]]) +
    titleBlock(`${mod.id.toUpperCase()} · 約 ${mod.hours} 小時`, mod.title, mod.goal) +
    (isLive ? note("本模組使用 Python 標準函式庫", "<p>可用瀏覽器做預測與模擬，並在你的終端機跑真正的程序。三堂課互相銜接，最後在 L01 合起來。</p>") : chapterNote(mod.phase)) +
    section("goals", "先備與學習成果", `<dl class="facts-list"><div><dt>先備</dt><dd>${prerequisites}</dd></div><div><dt>${e(mod.outcome)}</dt><dd>${e(mod.goal)}</dd></div><div><dt>核心產出</dt><dd>${e(mod.artifact)}</dd></div></dl>`) +
    section("lessons", "三堂課", moduleLessonList(course, mod)) +
    section("evidence", "實作與檢核", `<p>${e(mod.lab_goal)}</p><div class="row-actions">${link(labUrl(mod.lab_id), `${mod.lab_id.toUpperCase()} · ${isLive ? "本機實作" : "實作規劃"}`, "button primary")}${link(checkUrl(mod.checkpoint), `檢核 ${mod.checkpoint.toUpperCase()}`, "button secondary")}</div>`) };
}

function lessonNav(course, lesson) {
  const i = course.lessons.indexOf(lesson);
  const before = course.lessons[i - 1];
  const after = lesson.id === "m01-l03" ? { title: "L01 · 本機實作", url: labUrl("l01") } :
    course.lessons[i + 1] ? { title: lessonName(course.lessons[i + 1]), url: lessonUrl(course.lessons[i + 1].id) } : { title: "期末專案", url: "/capstone/" };
  return `<nav class="lesson-nav" aria-label="相鄰課程">
    <a href="${before ? lessonUrl(before.id) : "/prepare/"}"><span>${before ? "上一課" : "先備準備"}</span><strong>${before ? e(lessonName(before)) : "開始前的準備"}</strong></a>
    <a href="${after.url}"><span>下一步</span><strong>${e(after.title)}</strong></a>
  </nav>`;
}

export function lessonPage(course, item, examples, verification) {
  const mod = course.modules.find(({ id }) => id === item.module_id);
  const intro = breadcrumb([courseLink, [moduleUrl(mod.id), mod.id.toUpperCase()], [null, item.number]]);
  const nav = lessonNav(course, item);
  const base = { title: item.title, active: "lesson", module: item.module_id, selectedLesson: item.id };
  const prerequisite = item.prerequisites[0] === "prepare"
    ? link("/prepare/", "P01–P03 或自我檢查")
    : link(lessonUrl(item.prerequisites[0]), lessonName(course.lessons.find(({ id }) => id === item.prerequisites[0])));
  if (!published(item)) {
    return { ...base, body: intro + titleBlock(`第 ${item.number} 課`, item.title) +
      chapterNote(mod.phase, "此處提供預定範圍與課內任務。") +
      section("preview", "課程規劃", `<dl class="facts-list"><div><dt>先備</dt><dd>${prerequisite}</dd></div>
      <div><dt>範圍</dt><dd>${e(item.scope)}</dd></div><div><dt>預定任務</dt><dd>${e(item.task)}</dd></div></dl>
      <p>${link(labUrl(item.lab_id), `查看 ${item.lab_id.toUpperCase()} 規劃`)}　${link("/sources/", "查閱來源矩陣")}</p>`) + nav };
  }
  const content = taught[item.id];
  const { experiment, sourceFocus } = content;
  const toc = [["objectives", "學習目標"], ["prediction", "先猜結果"], ["concepts", "原理與資料流"], ["simulation", "動手模擬"], ["experiment", "本機實驗"], ["failures", "觀察與除錯"], ["quiz", "知識檢核"], ["checkoff", "完成標準"], ["references", "閱讀與版本"]];
  const subtitle = `${item.number} 課 · 閱讀約 ${item.estimated_read_minutes} 分鐘 · 實作約 ${item.estimated_lab_minutes} 分鐘`;
  const data = verification.environments ?? [];
  const referenceLinks = item.sources.map((id) => course.sources.find((source) => source.id === id)).map((source) => `${link(source.url, source.title)} <span class="subtle">${e(source.focus)}</span>`);
  const firstHello = item.id === "m01-l01" ? `<details class="disclosure">
    <summary>先跑一次 Hello</summary><div><p>把兩支 Python 檔案解壓到同一資料夾，讓 A 啟動 B 並提出問題。先看一來一回，接下來再驗證兩個程序如何各自保有自己的變數。</p>
    <a href="/downloads/m01-l02/solution.zip" class="button secondary" download>下載 Hello 範例</a>
    ${commandGroup([["macOS／Linux", "python3 -X utf8 a.py"], ["Windows PowerShell", "py -3.13 -X utf8 a.py"]])}
    ${codeBlock("預期輸出", taught["m01-l02"].experiment.output)}</div></details>` : "";
  return { ...base, lesson: item.id, toc, description: content.intro, body:
    intro + titleBlock(subtitle, item.title, content.intro) +
    `<div class="lesson-tools"><button type="button" class="button secondary" data-quick aria-pressed="false">今天只做這一課</button>
    <div class="type-settings mobile-type"><button type="button" data-font="-1" aria-label="縮小正文字級">A−</button><button type="button" data-font="1" aria-label="放大正文字級">A+</button></div></div>` +
    `<article class="lesson-body">
      ${section("objectives", "學習目標", `<p class="subtle">先備 ${prerequisite}</p>${itemList(content.outcomes.map(e))}${firstHello}`)}
      ${section("prediction", "先猜結果", questionForm([content.prediction], "prediction", item.id), "lesson-optional")}
      ${section("concepts", "原理與資料流", content.concepts.map(({ title, body }) => `<h3>${e(title)}</h3>${body}`).join("") + dataTrace(content.trace), "lesson-optional")}
      ${section("simulation", "動手模擬", simulation(content.sim), "lesson-optional")}
      ${section("experiment", "本機實驗", `<div class="mode-label local-mode">本機 Python 實作</div><p>${e(experiment.lead)}</p>
        ${experimentFiles(item.id, examples)}${itemList(experiment.steps, true)}${commandGroup(experiment.commands)}
        ${codeBlock("預期輸出 · 範例", experiment.output)}<p class="subtle">${e(experiment.outputNote)}</p>
        <h3 id="hints">分級提示</h3>${hints(content.hints)}`)}
      ${section("failures", "觀察與除錯", content.failures + `<p>${link("/troubleshooting/", "依症狀查除錯索引")}</p>`, "lesson-optional")}
      ${section("quiz", "知識檢核", "<p>先選完三題，再核對答案。解析會帶你回到對應段落。</p>" + questionForm(content.quiz, "quiz", item.id), "lesson-optional")}
      ${section("checkoff", "完成標準", `<p>${e(content.done)}</p><h3>清理與復原</h3><p>${e(content.cleanup)}</p>${evidenceForm("lesson", item.id)}`)}
      ${section("references", "閱讀與版本", `<p>${e(sourceFocus)}</p>${itemList(referenceLinks)}
        <dl class="facts-list"><div><dt>教材程式版本</dt><dd>${labRevision}</dd></div><div><dt>官方文件核對</dt><dd>${item.source_checked_at}</dd></div>
        <div><dt>本機程式驗證</dt><dd>${e(supported(data))}${verification.tested_at ? ` · ${verification.tested_at}` : ""}。${link("/verification/#local", "查看命令與結果")}</dd></div></dl>`, "lesson-optional")}
    </article>` + nav };
}

export function labPage(course, mod, examples, verification) {
  const label = mod.lab_id.toUpperCase();
  const base = { title: label + " · " + mod.title, active: "lab", module: mod.id };
  const intro = breadcrumb([courseLink, [moduleUrl(mod.id), mod.id.toUpperCase()], [null, label]]);
  if (mod.state !== "published") {
    return { ...base, body: intro + titleBlock(label, "本機實作規劃", mod.lab_goal) + chapterNote(mod.phase) +
      section("requirements", "預定產出", `<p>${e(mod.artifact)}</p><p>${link(moduleUrl(mod.id), "查看模組先備與課程")}　${link(checkUrl(mod.checkpoint), "查看階段檢核規劃")}</p>`) };
  }
  return { ...base, title: "L01 · 讓 B 回覆你的名字", lab: "l01",
    toc: [["goals", "目標與先備"], ["starter", "下載與實作"], ["faults", "失敗與清理"], ["rubric", "證據與自查"]],
    body: intro + titleBlock("L01 · 本機 Python 實作 · 約 30 分鐘", "讓 B 回覆你的名字", coreLab.intro) +
      section("goals", "目標與先備", `<p>先完成 ${link("/modules/m01/", "M01 的三堂課")}。建議將 L01 解壓縮到新資料夾，避免覆寫上一課的檔案。</p>${itemList(coreLab.goals.map(e))}`) +
      section("starter", "下載與實作", experimentFiles("l01", examples) + itemList(coreLab.steps, true) +
        commandGroup(coreLab.commands) + codeBlock("帶空白名字的預期輸出", coreLab.output) +
        "<h3>分級提示</h3>" + hints(coreLab.hints)) +
      section("faults", "失敗與清理", `<p>空白名字應讓 B 以 2 離開。A 會回報 B 的 stderr 並以 1 結束。若 B 在回覆後持續執行，A 以 124 結束，並顯示逾時前的輸出供比對。</p>
        <p>在 stderr 擷取示範中 B 的 PID，於執行完成後用 macOS「活動監視器」、Linux 程序列表或 Windows 工作管理員核對。驗證腳本會在 POSIX 系統自動檢查該 PID 是否仍存在。若曾在終端機單獨跑 B，請用 Ctrl+C 停止。</p>
        <p class="subtle">${e(supported(verification.environments ?? []))}。${link("/verification/#local", "查看驗證範圍")}</p>`) +
      section("rubric", "證據與自查", `<p>逐項核對，合計 3 分。自評請連同可以重現的命令與結果保存。程式檢核與人工說明各提供不同證據。</p>
        ${table(["項目", "1 分的證據"], coreLab.criteria.map((row) => row.map(e)), "L01 自查評分")}
        <p>圖的讀法可回看 ${link("/lessons/m01-l01/#concepts", "01.1 的程序圖")} 和 ${link("/lessons/m01-l02/#concepts", "01.2 的標準串流")}。</p>${evidenceForm("lab", "l01")}
        <div class="row-actions">${link("/checkpoints/a/", "查看檢核 A 規劃", "button secondary")}${link("/progress/", "查看學習進度", "button secondary")}</div>`)
  };
}

export function prepare() {
  const self = ["我能在終端機找到工作目錄並執行 Python 檔案。", "我能附上參數，且知道含空白路徑需加引號。", "我能讀寫 UTF-8 文字檔。", "我能用 try／except 表達失敗。", "我能將 dict 轉成 JSON。"];
  return { title: "開始前的準備", active: "prepare", module: "m01", body:
    titleBlock("課程先備", "開始前的準備", "你只需要能執行 Python。M01 以標準函式庫練習，下一步就是兩支程序互傳文字。") +
    section("self-check", "五項自我檢查", itemList(self.map(e)) + `<p>能做完上列操作，可以直接${link("/lessons/m01-l01/", "開始 01.1")}。遇到不熟的操作，再回來看對應短練習。</p>`) +
    section("p01", "P01 · 找到練習資料夾", `<p>將下載的 ZIP 解壓縮。用 <code>pwd</code>／<code>Get-Location</code> 查看目前位置，再使用 <code>cd</code> 切換位置。含空白的整段路徑要用引號包住。執行 <code>ls</code>／<code>Get-ChildItem</code>，應能找到 a.py 和 b.py。</p>`) +
    section("p02", "P02 · 核對 Python 與虛擬環境", `<p>教材以 Python 3.13 為基準。使用有繁中顯示的終端機。M01 也可直接使用系統安裝的 Python，或手動指定虛擬環境的解譯器。</p>${commandGroup([
      ["macOS／Linux", 'python3 --version\npython3 -m venv .venv\n.venv/bin/python -X utf8 --version'],
      ["Windows PowerShell", 'py -3.13 --version\npy -3.13 -m venv .venv\n.\\.venv\\Scripts\\python.exe -X utf8 --version'],
    ])}<p>從 Python 取得 <code>sys.executable</code>，核對使用的是預期的解譯器。如果 Windows 環境沒有 <code>py</code>，請直接以已安裝的 Python 執行檔路徑取代。</p>`) +
    section("p03", "P03 · JSON、例外與函式", `<p>在 Python 練習 <code>json.dumps({"name": "小雨"}, ensure_ascii=False)</code>。接著把有效字串交給 <code>json.loads()</code>，再刪掉最後的右大括號。用 <code>except json.JSONDecodeError</code> 回報你看到的錯誤。M01 的 Pipe 會先使用純文字，M02 再把這個練習接進通道。</p>`) +
    section("p04", "P04 · 記錄可重現的實驗", `<p>改程式前另存起始檔，保留原本可跑的版本。每次只改一處，記下執行命令、環境與結果。實作 L01 時會用 <code>verify.py</code> 檢查指定路徑，再用你的程序圖說明行為。</p>
      ${link("/lessons/m01-l01/", "開始第一課", "button primary")}`) };
}

export function glossary(course) {
  return { title: "術語", body: titleBlock("術語表", "查找術語", "輸入繁中、英文或縮寫，並回到第一次使用該詞的課程。") +
    `<label class="stack-label" for="filter">搜尋術語</label><input class="filter-input" id="filter" data-filter="terms" type="search" placeholder="例如 IPC、recv、Session、ACP">
    <p class="subtle" data-filter-count role="status">${terms.length} 個術語</p>
    <div class="glossary-grid" data-filter-list="terms">${terms.map(([id, zh, en, text, lesson]) => {
      const item = course.lessons.find(({ id }) => id === lesson);
      return `<article class="glossary-entry" id="${id}" data-filter-item><h2>${e(zh)}</h2><span class="term-english">${e(en)}</span><p>${e(text)}</p><div class="term-link">${link(lessonUrl(lesson), lessonName(item))}${published(item) ? "" : ' <span class="subtle">規劃中</span>'}${id === "acp-communication" ? ' · <a href="/sources/#NAME01">官方說明</a>' : ""}</div></article>`;
    }).join("")}</div>` };
}

export function troubleshooting() {
  return { title: "除錯索引", body: titleBlock("實作支援", "除錯索引", "以症狀找到要觀察的第一項證據。先記下執行命令、退出狀態及 stdout／stderr，再改一個條件重試。") +
    `<label class="stack-label" for="filter">依症狀篩選</label><input class="filter-input" id="filter" data-filter="diagnoses" type="search" placeholder="例如 逾時、亂碼、recv、認證">
    <p class="subtle" data-filter-count role="status">${diagnoses.length} 個症狀</p>
    <div class="diagnosis-list" data-filter-list="diagnoses">${diagnoses.map(([id, title, tags, text, lesson, live]) => `
      <article id="${id}" class="diagnosis" data-filter-item data-keywords="${e(tags)}"><h2>${e(title)}</h2><p>${e(text)}</p>
      ${link(lessonUrl(lesson) + (live ? "#failures" : ""), live ? "查看可重現的實驗" : "查看課程規劃")}${live ? "" : ' <span class="subtle">規劃中</span>'}
      </article>`).join("")}</div>` };
}

export function siteSearch() {
  return { title: "搜尋課程與術語", body: titleBlock("", "搜尋課程與術語", "查找正文、實作、規劃課次、術語與除錯症狀。") +
    `<form class="section-search row-actions" method="get" action="/search/" role="search" aria-label="搜尋結果">
      <label class="sr-only" for="full-search">搜尋字詞</label><input id="full-search" name="q" type="search" maxlength="120" placeholder="跨程序通訊、recv、Session、ACP" required>
      <button class="button primary" type="submit">搜尋</button>
    </form><p role="status" class="subtle" data-search-summary></p><ul class="search-results" data-search-results></ul>
    <noscript>搜尋需要啟用 JavaScript。你仍可瀏覽<a href="/course/">完整課程</a>和<a href="/glossary/">術語表</a>。</noscript>` };
}

export function progress(course) {
  const mod = course.modules[0];
  return { title: "學習進度", body: titleBlock("本機保存", "學習進度", "閱讀標記、實作自評、知識檢核和證據筆記保存在目前的瀏覽器。可用 JSON 備份或移到其他裝置。") +
    `<div class="progress-summary" data-progress-summary><span>已讀完 <strong data-total="read">0</strong> / 3 課</span><span>已完成實驗 <strong data-total="lab">0</strong> / 3 課</span><span>已作答 <strong data-total="quiz">0</strong> / 3 課</span></div>` +
    section("position", "繼續學習", `<p data-resume-label>從第一課開始。進度會在瀏覽已上線課程時更新。</p>${link("/lessons/m01-l01/", "開始第一課", "button primary").replace("<a ", "<a data-resume ")}`) +
    section("m01-progress", "M01 · 學習紀錄", `<div data-progress-table>
      ${table(["課次", "閱讀", "實驗自評", "檢核"], mod.lesson_ids.map((id) => {
        const item = course.lessons.find(({ id: lessonId }) => lessonId === id);
        return [link(lessonUrl(id), lessonName(item)), `<span data-progress="${id}:read">待記錄</span>`, `<span data-progress="${id}:lab">待記錄</span>`, `<span data-progress="${id}:quiz">待作答</span>`];
      }), "M01 個人學習紀錄")}</div>
      <p>${link("/labs/l01/", "L01 · 本機實作")} <span data-lab-status>待記錄</span></p>
      <p>階段檢核 ${course.checkpoints.map((entry) => link(checkUrl(entry.id), entry.id.toUpperCase())).join("／")} · 規劃中</p>
      <details class="disclosure"><summary>查看已存筆記</summary><div data-progress-notes><p>目前沒有筆記。</p></div></details>`) +
    section("backup", "備份與移轉", `<p>匯入前會驗證資料格式。有效紀錄會和這個瀏覽器的紀錄合併，去留由穩定的課程與題目 ID 決定。</p>
      <div class="row-actions">
        <button type="button" class="button primary" data-export>匯出 JSON</button>
        <label class="button secondary import-button"><span>選擇 JSON 匯入</span><input type="file" accept=".json,application/json" data-import aria-label="選擇 JSON 匯入"></label>
        <button type="button" class="button quiet" data-clear>清除這個瀏覽器的進度</button>
      </div><p role="status" class="subtle" data-progress-message></p>`) };
}

export function checkpoint(course, item) {
  return { title: "檢核 " + item.id.toUpperCase() + " · " + item.title, body:
    breadcrumb([courseLink, [null, "檢核 " + item.id.toUpperCase()]]) +
    titleBlock(`階段檢核 ${item.id.toUpperCase()}`, item.title) + chapterNote(item.phase, "這裡可先查看要保留的證據。") +
    section("requirements", "通過條件與證據", `<p>${e(item.criteria)}。</p><dl class="facts-list"><div><dt>範圍</dt><dd>${item.modules.map((id) => link(moduleUrl(id), id.toUpperCase())).join("、")}</dd></div>
      <div><dt>必交證據</dt><dd>${e(item.evidence)}</dd></div></dl>
      ${item.id === "a" ? '<p>第一份可準備的證據是 L01 的程序圖和 Pipe 正常／失敗輸出。完成後請保留，後續要與 RPC trace 一起檢查。</p><a class="button primary" href="/labs/l01/">前往 L01</a>' : ""}`) };
}

export function capstone() {
  return { title: "期末專案", body: titleBlock("L12 · 專案預覽", "本機 Agent Bus 期末專案", "在小型、可離線執行的 Python 專案上練習修改與交叉審查。從提交問題一路追蹤到測試結果。") +
    chapterNote("W4", "專案資料、示範紀錄與故障套件會隨 W4 釋出。") +
    section("workflow", "角色與流程", `<p>Planner 拆出有限步驟，Worker 提交 patch 與說明，Reviewer 提出可驗證的問題，Verifier 執行指定測試。最多兩輪修正，最終變更留在練習副本。</p><p>核心路徑使用至少兩個獨立工作者程序和兩種 Adapter。使用 FakeAdapter 與離線 fixture 可以驗證契約，搭配實測的真實服務路徑屬於選修。</p>`) +
    section("criteria", "預定驗收", table(["重現案例", "要看見的證據"], [
      ["正常流程", "可由 task ID 查到 patch、測試結果與終止狀態"],
      ["通訊與背壓", "分段／合併均正確；滿載時有明確拒絕或有界等待"],
      ["去重、取消、崩潰", "重送可辨識；停止可確認；未知狀態留下復原決策"],
      ["Session 與工具權限", "兩組上下文隔離；拒絕越界讀寫；版本與能力可追溯"],
      ["有限協作", "達時間、輪數或預算上限後停止並留下原因"],
      ["可重現", "另一位學習者可從乾淨環境重現指定結果"],
    ], "期末專案驗收規劃") + `<p>期末專案 30 分，分為通訊與路由、故障處理、Adapter／Session、可觀察與驗證、重現說明，各 6 分。${link("/checkpoints/e/", "查看檢核 E")}。</p>`) };
}

export function sources(course) {
  return { title: "來源與維護", body: titleBlock("官方文件索引", "來源與維護", "文件核對與程式實測分列。規劃中的接入在進入該階段時重新核對介面，並記錄實際版本與測試環境。") +
    `<div class="row-actions">${link("/verification/", "查看本版驗證紀錄", "button secondary")}</div>` +
    section("matrix", "來源矩陣", `<div class="source-list">${course.sources.map((source) => {
      const lessons = course.lessons.filter((item) => item.sources.includes(source.id));
      return `<article class="source-row" id="${source.id}">
        <p class="eyebrow mono">${source.id}</p><h3>${link(source.url, source.title)}</h3>
        <p>${e(source.focus)}。${source.revision ? ` 文件基準 ${e(source.revision)}。` : ""}</p>
        <p class="subtle">${source.source_checked_at ? `本版文件核對 ${source.source_checked_at}` : "依規格列入，待對應教材進入發布階段時核對"}。</p>
        <p>${source.id === "PY01" ? link("/prepare/#p02", "P02 · Python 與虛擬環境") : lessons.map((item) => link(lessonUrl(item.id), item.number)).join("、")}</p>
      </article>`;}).join("")}</div>`) };
}

export function verificationPage(report) {
  const browser = report.browser ?? [];
  const local = report.environments ?? [];
  return { title: "驗證紀錄", body: titleBlock("教材版本 0.1.0", "交付與驗證紀錄", "每階段留下可打開的頁面、教材以及可重現的驗收條件。") +
    section("phases", "分階段交付", table(["階段", "交付範圍", "目前狀態"],
      phases.map(([id, title, body], index) => [`<span class="mono">${id}</span> ${e(title)}`, e(body),
        index === 0 ? link("#contract", "查看 W0 驗證") : index === 1 ? link("#local", "查看 W1 驗證") : "規劃中"]), "課程網站交付階段")) +
    section("contract", "W0 · 內容與導航", `<p>資料契約檢查 12 個模組、36 個穩定課次 ID、12 個 Lab、5 個檢核、67 個規劃小時。檢查先備關係、來源和上線狀態。</p>
      ${codeBlock("維護命令", "node checks/contract.mjs")}<p>${link("/course/", "檢查課程地圖")}　${link("/sources/", "檢查來源矩陣")}</p>`) +
    section("local", "W1 · 本機 Python 實作", `<p>${report.tested_at ? `實測日期 ${e(report.tested_at)}。` : "實測紀錄會隨發布更新。"}教材文件基準為 Python 3.13，測試環境如下。</p>
      ${local.length ? table(["作業系統", "Python", "驗證結果"], local.map(({ os, python, result }) => [e(os), e(python), e(result)]), "實際測試環境") : '<p class="subtle">實測資料尚未寫入。</p>'}
      ${report.local_checks?.length ? itemList(report.local_checks.map(e)) : ""}
      ${codeBlock("解壓 L01 參考解答後執行", "python3 -X utf8 verify.py")}
      <p>${link("/labs/l01/", "回到 L01 的下載與指令")}　${link("/modules/m01/", "回到 M01")}</p>`) +
    section("site", "W1 · 網站驗證", `${report.automated?.length ? itemList(report.automated.map(e)) : ""}
      ${browser.length ? itemList(browser.map(e)) : `<p>${e(report.browser_note ?? "瀏覽器操作的驗證紀錄待補。")}</p>`}
      <p class="subtle">${e(report.limits ?? "本階段驗證範圍為 M01。M02–M12 以課程規劃呈現。")}</p>`) };
}
