import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { memoryEvents, pipeEvents, initialSimulation, nextEvent, stopWorker, searchIndex } from "../src/models.mjs";
import { emptyProgress, importProgress, validateProgress, quizScore } from "../src/progress-model.mjs";
import { lessons } from "../content/m01.mjs";

const defaults = { payload: "你好，你是誰？", worker: "normal", ending: "line", delay: 1, limit: 5, flush: true };
function run(events) {
  return events.reduce((state) => nextEvent(state, events), initialSimulation());
}
const memory = run(memoryEvents({ a: 10, b: 40, aDelta: 1, bDelta: 2 }));
assert.equal(memory.stdin, "11");
assert.equal(memory.stdout, "42");
assert.match(memory.stderr, /42/);
assert.ok(memory.complete);
const normal = run(pipeEvents(defaults));
assert.equal(normal.stdout, "我是 Python B。");
assert.match(normal.log.at(-1), /收到/);
assert.match(normal.stdin, /22 bytes/);
const changed = run(pipeEvents({ ...defaults, payload: "錯字" }));
assert.match(changed.stderr, /不認得/);
assert.match(changed.a, /失敗/);
const stoppedBeforeRead = run(pipeEvents({ ...defaults, worker: "no-read" }));
assert.equal(stoppedBeforeRead.b, "已退出（3）");
assert.equal(run(pipeEvents({ ...defaults, ending: "eof" })).stdout, normal.stdout);
assert.match(run(pipeEvents({ ...defaults, ending: "open" })).a, /逾時/);
assert.match(run(pipeEvents({ ...defaults, payload: "", ending: "eof" })).stderr, /沒有收到/);
assert.match(run(pipeEvents({ ...defaults, delay: 5 })).a, /逾時/);
assert.match(run(pipeEvents({ ...defaults, worker: "silent" })).a, /沒有回覆/);
const hung = run(pipeEvents({ ...defaults, worker: "hang" }));
const buffered = run(pipeEvents({ ...defaults, worker: "hang", flush: false }));
assert.match(hung.a, /逾時/);
assert.equal(hung.stdout, normal.stdout);
assert.equal(buffered.stdout, "—");
assert.match(buffered.buffer, /丟棄/);
assert.match(stopWorker(nextEvent(initialSimulation(), pipeEvents(defaults))).a, /中止/);

const current = emptyProgress("0.1.0");
const older = emptyProgress("0.0.1");
const id = "m01-l01";
const previous = "m01-l01-q-old";
const latest = "m01-l01-q-import";
current.last_location = { id, section: "quiz", at: 20 };
current.lessons[id] = { read: true, notes: "本機證據", quiz: { at: 20, active: [latest], items: { [latest]: { answer: "pids", correct: true } } } };
older.last_location = { id, section: null, at: 15 };
older.lessons[id] = { lab: true, notes: "舊檔筆記", quiz: { at: 15, active: [previous], items: { [previous]: { answer: "first", correct: false } } } };
const merged = importProgress(current, older, "0.1.0");
assert.equal(merged.course_version, "0.1.0");
assert.ok(merged.lessons[id].read && merged.lessons[id].lab);
assert.match(merged.lessons[id].notes, /本機證據[\s\S]+舊檔筆記/);
assert.equal(merged.last_location.section, "quiz");
assert.equal(quizScore(merged.lessons[id].quiz), "1 / 1");
assert.ok(Object.hasOwn(merged.lessons[id].quiz.items, previous));
assert.deepEqual(importProgress(merged, older, "0.1.0"), merged);
assert.throws(() => importProgress(current, { ...older, schema_version: 9 }, "0.1.0"));
assert.equal(current.lessons[id].notes, "本機證據");
assert.throws(() => validateProgress({ ...current, lessons: { ["__proto__"]: { read: true } } }));
assert.throws(() => validateProgress({ ...current, lessons: { [id]: { quiz: { at: 10, active: ["missing"], items: {} } } } }));

const index = JSON.parse(readFileSync(new URL("../dist/assets/search-index.json", import.meta.url)));
assert.ok(searchIndex(index, "跨程序通訊").some((item) => item.url === "/glossary/#ipc"));
assert.ok(searchIndex(index, "ＩＰＣ").some((item) => item.url === "/glossary/#ipc"));
assert.ok(searchIndex(index, "為什麼 recv 只有一半").some((item) => item.url === "/troubleshooting/#partial-recv"));
assert.ok(searchIndex(index, "Session").some((item) => item.url === "/glossary/#session"));
const acp = searchIndex(index, "ACP");
assert.ok(acp.some((item) => item.title.includes("Agent Client Protocol")));
assert.ok(acp.some((item) => item.title.includes("Agent Communication Protocol")));
assert.ok(searchIndex(index, "部分輸出").some((item) => item.url === "/lessons/m01-l03/"));
assert.deepEqual(searchIndex(index, "zznoitemzz"), []);

const distinct = new Set();
for (const [id, lesson] of Object.entries(lessons)) {
  assert.equal(lesson.quiz.length, 3);
  assert.equal(lesson.hints.length, 3);
  for (const question of [lesson.prediction, ...lesson.quiz]) {
    assert.ok(question.id.startsWith(id));
    assert.ok(!distinct.has(question.id));
    distinct.add(question.id);
    assert.equal(question.options.filter(([key]) => key === question.correct).length, 1);
    assert.ok(question.why.length > 15);
  }
}

console.log("W1 PASS — adjustable memory/Pipe states, failures and stop; ZIP-era progress merge, historical items and bad input; five search terms and full text; stable question IDs.");
