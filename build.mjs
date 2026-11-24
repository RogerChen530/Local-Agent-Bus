import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { renderShell, lessonUrl, moduleUrl, labUrl, checkUrl } from "./src/components.mjs";
import * as page from "./src/pages.mjs";
import { lessons as taught, lab as coreLab } from "./content/m01.mjs";
import { terms, diagnoses } from "./content/reference.mjs";

const root = fileURLToPath(new URL(".", import.meta.url));
const dist = join(root, "dist");
const course = JSON.parse(readFileSync(join(root, "content/course.json"), "utf8"));
const report = JSON.parse(readFileSync(join(root, "content/verification.json"), "utf8"));
const visible = course.lessons.filter(({ status }) => status === "published");
const variants = ["starter", "solution"];
const index = [];

function write(relative, contents) {
  const file = join(dist, relative);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents, "utf8");
}

function add(path, entry) {
  const relative = path.replace(/^\//, "") + "index.html";
  const rootLink = "../".repeat(path.split("/").filter(Boolean).length) || "./";
  const html = renderShell(course, { ...entry, path });
  write(relative, html.replace(/(\s(?:href|src|action)=")\/(?!\/)/g, `$1${rootLink}`));
}

function examples(id) {
  const files = id === "l01" ? ["a.py", "b.py", "verify.py"] : ["a.py", "b.py"];
  return Object.fromEntries(variants.map((variant) => [
    variant, Object.fromEntries(files.map((file) => [file, readFileSync(join(root, "examples", id, variant, file), "utf8")])),
  ]));
}

function plainText(html) {
  const entities = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };
  return html.replace(/<[^>]+>/g, " ").replace(/&(amp|lt|gt|quot);|&#39;/g, (value) => entities[value]).replace(/\s+/g, " ").trim();
}

function record(url, title, summary, kind, live, keywords = "", text = "") {
  index.push({ url, title, summary, kind, live, keywords, text: plainText(text) });
}

const ordinary = [
  ["/", page.home(course)], ["/course/", page.courseMap(course)], ["/prepare/", page.prepare()],
  ["/glossary/", page.glossary(course)], ["/troubleshooting/", page.troubleshooting()], ["/search/", page.siteSearch()],
  ["/progress/", page.progress(course)], ["/capstone/", page.capstone()], ["/sources/", page.sources(course)],
  ["/verification/", page.verificationPage(report)],
];

for (const [path, entry] of ordinary) add(path, entry);
for (const [path, entry] of ordinary.filter(([url]) => ["/prepare/", "/capstone/", "/verification/"].includes(url))) {
  record(path, entry.title, path === "/capstone/" ? "工作流程、驗收與評分規劃。" : "課程操作與可重現紀錄。", "課程資源", path !== "/capstone/", "", entry.body);
}

for (const mod of course.modules) {
  add(moduleUrl(mod.id), page.modulePage(course, mod));
  record(moduleUrl(mod.id), `${mod.id.toUpperCase()} · ${mod.title}`, mod.goal, "模組", mod.state === "published", mod.artifact, mod.lab_goal);
  const live = mod.state === "published";
  add(labUrl(mod.lab_id), page.labPage(course, mod, live ? examples(mod.lab_id) : null, report));
  record(labUrl(mod.lab_id), live ? "L01 · 讓 B 回覆你的名字" : `${mod.lab_id.toUpperCase()} · ${mod.title}`,
    mod.lab_goal, "實作", live, mod.artifact, live ? [coreLab.intro, ...coreLab.steps, coreLab.output].join(" ") : "");
}
for (const item of course.lessons) {
  const live = item.status === "published";
  const entry = page.lessonPage(course, item, live ? examples(item.id) : null, report);
  add(lessonUrl(item.id), entry);
  const content = taught[item.id];
  const prose = content ? [content.intro, ...content.concepts.map((concept) => concept.body), content.failures, content.done].join(" ") : "";
  record(lessonUrl(item.id), `${item.number} · ${item.title}`, item.scope, "課次", live, item.id + " " + item.scope,
    live ? prose + " " + plainText(entry.body) : item.task);
}

for (const check of course.checkpoints) {
  add(checkUrl(check.id), page.checkpoint(course, check));
  record(checkUrl(check.id), `檢核 ${check.id.toUpperCase()} · ${check.title}`, check.evidence, "階段檢核", false, check.criteria);
}
for (const [id, zh, en, text] of terms) record(`/glossary/#${id}`, `${zh} · ${en}`, text, "術語", true, en + " " + zh, text);
for (const [id, title, tags, text, , live] of diagnoses) record(`/troubleshooting/#${id}`, title, text, "除錯", live, tags, text);

mkdirSync(join(dist, "assets"), { recursive: true });
for (const name of ["site.css", "site.mjs", "models.mjs", "progress-model.mjs"]) copyFileSync(join(root, "src", name), join(dist, "assets", name));
write("assets/catalog.mjs", `export const activeLessons = ${JSON.stringify(visible.map(({ id, title, number }) => ({ id, title, number })))};\n`);
write("assets/search-index.json", JSON.stringify(index));
const python = process.env.LAB_BUILD_PYTHON || "python3";
execFileSync(python, ["checks/archives.py"], { cwd: root, stdio: "inherit" });
console.log(`Generated ${ordinary.length + course.modules.length * 2 + course.lessons.length + course.checkpoints.length} HTML pages and ${index.length} search records.`);
