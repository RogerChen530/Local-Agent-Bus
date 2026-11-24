export const schemaVersion = 1;
export const progressKey = "local-agent-bus:progress";
export const maxImportBytes = 1_000_000;
export const noteLimit = 24000;

export const emptyProgress = (courseVersion) => ({
  schema_version: schemaVersion, course_version: courseVersion,
  last_location: null, lessons: {}, labs: {}, checkpoints: {},
});

const isMap = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const timestamp = (value) => Number.isSafeInteger(value) && value >= 0;
const lessonId = (id) => typeof id === "string" && /^m\d{2}-l\d{2}$/.test(id);
const labId = (id) => /^l\d{2}$/.test(id);
const checkpointId = (id) => /^[a-z0-9-]{1,40}$/.test(id) && id !== "constructor";
const shortId = (id) => typeof id === "string" && /^[a-z][a-z0-9-]{0,90}$/.test(id) && id !== "constructor";
const flags = (entry, fields) => fields.every((key) => entry[key] === undefined || typeof entry[key] === "boolean");
const validNote = (entry) => entry.notes === undefined || (typeof entry.notes === "string" && entry.notes.length <= noteLimit);

function validQuiz(quiz, id) {
  if (quiz === undefined) return true;
  if (!isMap(quiz) || !timestamp(quiz.at) || !isMap(quiz.items) || !Array.isArray(quiz.active)) return false;
  const items = Object.entries(quiz.items);
  if (items.length > 100 || !quiz.active.length || new Set(quiz.active).size !== quiz.active.length) return false;
  return quiz.active.every((key) => shortId(key) && Object.hasOwn(quiz.items, key)) &&
    items.every(([key, item]) => shortId(key) && key.startsWith(id + "-q-") && isMap(item) &&
      shortId(item.answer) && typeof item.correct === "boolean");
}

export function validateProgress(data) {
  if (!isMap(data) || data.schema_version !== schemaVersion) {
    throw new Error("進度資料格式版本無法讀取。");
  }
  if (typeof data.course_version !== "string" || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(data.course_version) ||
      !isMap(data.lessons) || !isMap(data.labs) || !isMap(data.checkpoints)) {
    throw new Error("缺少課程版本、課次、實作或階段檢核紀錄。");
  }
  const loc = data.last_location;
  if (loc !== null && (!isMap(loc) || !lessonId(loc.id) || !timestamp(loc.at) || !(loc.section === null || shortId(loc.section)))) {
    throw new Error("最後閱讀位置格式不符。");
  }
  for (const [id, item] of Object.entries(data.lessons)) {
    if (!lessonId(id) || !isMap(item) || !flags(item, ["read", "lab"]) || !validNote(item) || !validQuiz(item.quiz, id)) {
      throw new Error("課次、筆記或題目答案格式不符。");
    }
  }
  for (const [entries, isId] of [[data.labs, labId], [data.checkpoints, checkpointId]]) {
    for (const [id, item] of Object.entries(entries)) {
      if (!isId(id) || !isMap(item) || !flags(item, ["done"]) || !validNote(item)) throw new Error("實作或檢核紀錄格式不符。");
    }
  }
  return data;
}

function combineNote(a, b) {
  if (!a) return b;
  if (!b || a === b || a.includes("\n＊＊＊＊＊＊＊＊\n" + b) || a.startsWith(b + "\n＊＊＊＊＊＊＊＊\n")) return a;
  if (b.includes("\n＊＊＊＊＊＊＊＊\n" + a) || b.startsWith(a + "\n＊＊＊＊＊＊＊＊\n")) return b;
  const result = a + "\n＊＊＊＊＊＊＊＊\n" + b;
  if (result.length > noteLimit) throw new Error("合併後筆記太長。請縮短或另存筆記後重試。");
  return result;
}

export function mergeQuiz(current, incoming) {
  if (!current || !incoming) return current ?? incoming;
  const [earlier, later] = incoming.at >= current.at ? [current, incoming] : [incoming, current];
  return { ...later, items: { ...earlier.items, ...later.items } };
}

function mergeRecords(first, second, flagsToMerge) {
  const keys = [...new Set([...Object.keys(first), ...Object.keys(second)])];
  return Object.fromEntries(keys.map((id) => {
    const a = first[id] ?? {};
    const b = second[id] ?? {};
    const entry = { ...a, ...b };
    for (const flag of flagsToMerge) {
      if (a[flag] !== undefined || b[flag] !== undefined) entry[flag] = Boolean(a[flag] || b[flag]);
    }
    if (a.notes !== undefined || b.notes !== undefined) entry.notes = combineNote(a.notes, b.notes);
    if (a.quiz !== undefined || b.quiz !== undefined) entry.quiz = mergeQuiz(a.quiz, b.quiz);
    return [id, entry];
  }));
}

export function importProgress(current, incoming, courseVersion) {
  validateProgress(incoming);
  const a = current.last_location;
  const b = incoming.last_location;
  return validateProgress({
    schema_version: schemaVersion, course_version: courseVersion,
    last_location: !a || (b && b.at > a.at) ? b : a,
    lessons: mergeRecords(current.lessons, incoming.lessons, ["read", "lab"]),
    labs: mergeRecords(current.labs, incoming.labs, ["done"]),
    checkpoints: mergeRecords(current.checkpoints, incoming.checkpoints, ["done"]),
  });
}

export function quizScore(record) {
  return record ? `${record.active.filter((id) => record.items[id]?.correct).length} / ${record.active.length}` : "待作答";
}
