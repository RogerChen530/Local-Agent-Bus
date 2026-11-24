import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const course = JSON.parse(readFileSync(new URL("../content/course.json", import.meta.url)));
const { modules, lessons, sources, checkpoints } = course;
const unique = (items) => new Set(items.map((item) => item.id)).size === items.length;

assert.equal(course.language, "zh-TW");
assert.equal(modules.length, 12);
assert.equal(lessons.length, 36);
assert.equal(checkpoints.length, 5);
assert.equal(modules.reduce((sum, module) => sum + module.hours, 0), 67);
for (const list of [modules, lessons, sources, checkpoints]) assert.ok(unique(list));

const moduleIds = new Set(modules.map((module) => module.id));
const sourceIds = new Set(sources.map((source) => source.id));
const checkpointIds = new Set(checkpoints.map((checkpoint) => checkpoint.id));
for (const [index, module] of modules.entries()) {
  assert.equal(module.id, 'm' + String(index + 1).padStart(2, '0'));
  assert.ok(module.goal && module.artifact && module.lab_goal);
  assert.equal(module.lab_id, module.id.replace("m", "l"));
  assert.deepEqual(module.lesson_ids, lessons
    .filter((lesson) => lesson.module_id === module.id).map((lesson) => lesson.id));
  assert.equal(module.lesson_ids.length, 3);
  assert.ok(checkpointIds.has(module.checkpoint));
  for (const prerequisite of module.prerequisites) {
    assert.ok(
      prerequisite === "prepare" ||
      modules.slice(0, index).some((earlier) => earlier.id === prerequisite) ||
      checkpointIds.has(prerequisite)
    );
  }
}

for (const [index, lesson] of lessons.entries()) {
  const module = modules.find(({ id }) => id === lesson.module_id);
  assert.ok(module);
  assert.equal(lesson.id, module.id + '-l0' + (index % 3 + 1));
  assert.deepEqual(lesson.prerequisites, [lessons[index - 1]?.id ?? "prepare"]);
  assert.equal(lesson.lab_id, module.lab_id);
  assert.equal(lesson.status, module.state);
  assert.ok(lesson.title && lesson.scope && lesson.task && lesson.outcomes.includes(module.outcome));
  assert.ok(lesson.sources.every((id) => sourceIds.has(id)));
  if (lesson.status === "planned") {
    assert.equal(lesson.code_revision, null);
    assert.equal(lesson.code_tested_at, null);
  }
}

for (const source of sources) assert.equal(new URL(source.url).protocol, "https:");
for (const checkpoint of checkpoints) {
  assert.ok(checkpoint.modules.every((id) => moduleIds.has(id)));
  assert.ok(checkpoint.evidence && checkpoint.criteria);
}
assert.equal(lessons.filter((lesson) => lesson.status === "published").length, 3);
console.log("W0 PASS — 12 modules, 36 stable lesson IDs, 12 labs, 5 checkpoints, 67 hours; prerequisites and sources resolve; only M01 marked published.");

