import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/site.css", import.meta.url), "utf8");
const token = (name) => css.match(new RegExp("--" + name + ":\\s*(#[0-9a-f]{3,6})\\b", "i"))?.[1];

function luminance(color) {
  let hex = color.slice(1);
  if (hex.length === 3) hex = [...hex].map((char) => char.repeat(2)).join("");
  const rgb = hex.match(/../g).map((pair) => parseInt(pair, 16) / 255);
  const [r, g, b] = rgb.map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return .2126 * r + .7152 * g + .0722 * b;
}

const examples = [
  ["body on canvas", token("text"), token("canvas"), 4.5],
  ["body on white", token("text"), token("white"), 4.5],
  ["muted on canvas", token("muted"), token("canvas"), 4.5],
  ["muted on white", token("muted"), token("white"), 4.5],
  ["links on white", token("accent"), token("white"), 4.5],
  ["button label", token("white"), token("accent"), 4.5],
  ["code", token("code-text"), token("code"), 4.5],
  ["failure feedback", token("warn"), token("warn-bg"), 4.5],
  ["sidebar active", token("accent-dark"), token("accent-soft"), 4.5],
  ["focus outline", "#188d78", token("white"), 3],
];
for (const [label, foreground, background, minimum] of examples) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  const ratio = (values[0] + .05) / (values[1] + .05);
  assert.ok(ratio >= minimum, `${label} ${ratio.toFixed(2)} is below ${minimum}`);
  console.log(`${label} ${ratio.toFixed(2)}:1`);
}
