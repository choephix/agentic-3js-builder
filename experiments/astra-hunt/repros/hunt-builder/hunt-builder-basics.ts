import * as THREE from "three";
import { createBuilder } from "../../../../src/builder.ts";

function outcome(label: string, fn: () => unknown) {
  try {
    const value = fn();
    console.log(label, "OK", value);
  } catch (error) {
    console.log(label, "ERR", error instanceof Error ? error.message : String(error));
  }
}

for (const detail of [undefined, 1, 0.01, 1e-9, 1e9, 0, -1, Number.NaN, Infinity]) {
  outcome(`detail=${String(detail)}`, () => {
    const b = createBuilder({ name: "d", detail });
    return { detail: b.detail, segments: b.segments(12) };
  });
}

const b = createBuilder({ name: "root-check" });
const j = b.joint("root", { at: [0, 1, 0] });
const p1 = b.root;
const p2 = b.root;
console.log("root identity", p1 === p2, p1.children.length, j.object.parent === p1);
const mesh = b.rod([0, 1, 0], [0, 2, 0], 0.1, { color: "#f00" });
const p3 = b.root;
console.log("build after root", p3 === p1, p3.children.length, mesh.meshes.length, p3.userData.rig);

const b1 = createBuilder({ name: "one" });
const b2 = createBuilder({ name: "two" });
const j1 = b1.joint("root", { at: [0, 1, 0] });
const j2 = b2.joint("root", { at: [2, 1, 0] });
b1.rod([0, 1, 0], [0, 2, 0], .1, { color: "red" });
b2.rod([2, 1, 0], [2, 2, 0], .1, { color: "red" });
console.log("isolated", b1.root.name, b2.root.name, b1.root.children.length, b2.root.children.length, j1.object.children.length, j2.object.children.length, b1.material("red") === b2.material("red"));

const ma = b1.material("#FF0000");
const mb = b1.material("#ff0000");
console.log("material cache", ma === mb, ma.roughness, ma.metalness);
