```ts
import * as THREE from "three";
import { createBuilder, paint } from "agentic-3js-builder";

export const meta = {
  name: "Hot-air balloon",
  description:
    "A gored, striped balloon envelope with load tapes and a crown, a skirt, rigging ropes, a wicker basket with leather rim, corner poles, burner and propane tanks.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "hotAirBalloon" });

  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });
  b.joint("basket", { parent: root, at: [0, 0.5, 0], dir: [0, 1, 0] });
  b.joint("envelope", { parent: root, at: [0, 7, 0], dir: [0, 1, 0] });

  // ---- Envelope ----
  const palette = ["#d62f2f", "#f4efe2", "#2a5bb8", "#f4efe2"];
  const envPaint = paint((p, _n, s) => {
    const a = s[1];
    const seam = a % 30;
    if (seam < 1.4 || seam > 28.6) return "#e8b923";
    if (Math.abs(p.y - 13.4) < 0.4 || Math.abs(p.y - 9.2) < 0.15) return "#e8b923";
    if (p.y > 18.4) return "#f4efe2";
    if (p.y < 8.4) return "#8f1f1f";
    return palette[Math.floor(a / 30) % 4];
  });
  b.lathe(
    [
      [0, 0], [0.9, 0], [1.8, 0.8], [3.4, 2.0], [4.6, 3.5], [5.4, 5.2], [5.5, 6.2],
      [5.2, 8.0], [4.4, 9.8], [3.0, 11.3], [1.5, 12.2], [0, 12.6],
    ],
    { color: envPaint, at: [0, 7, 0], segments: 24, bone: "envelope", name: "envelope" },
  );
  // Skirt (fireproof fabric)
  b.lathe(
    [[0.78, -0.5], [1.0, -0.5], [1.0, 0.4], [0.78, 0.4]],
    { color: "#e8c13a", at: [0, 7, 0], segments: 16, bone: "envelope", name: "skirt" },
  );
  // Crown cap
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 12), "#e8b923", { at: [0, 19.62, 0], bone: "envelope", name: "crown" });

  // ---- Basket ----
  const wicker = paint((p) => {
    const k = Math.floor(p.y / 0.06);
    const st = Math.floor((p.x + p.z) / 0.07);
    return (k + st) & 1 ? "#b07a3c" : "#94622c";
  });
  const box = (w: number, h: number, d: number, fill: any, at: number[], name: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), fill, { at, bone: "basket", name });
  box(1.3, 0.1, 1.3, wicker, [0, 0.05, 0], "floor");
  for (const sz of [-1, 1]) box(1.3, 0.9, 0.06, wicker, [0, 0.55, sz * 0.65], "wallZ");
  for (const sx of [-1, 1]) box(0.06, 0.9, 1.3, wicker, [sx * 0.65, 0.55, 0], "wallX");
  // Leather rim
  for (const sz of [-1, 1]) box(1.42, 0.1, 0.14, "#4a2a18", [0, 1.0, sz * 0.65], "rimZ");
  for (const sx of [-1, 1]) box(0.14, 0.1, 1.42, "#4a2a18", [sx * 0.65, 1.0, 0], "rimX");

  // Poles and burner frame
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 1.6, 6), "#a9adb2", {
        at: [sx * 0.62, 1.8, sz * 0.62], bone: "basket", name: "pole",
      });
      b.rod([sx * 0.62, 2.6, sz * 0.62], [sx * 0.7, 6.6, sz * 0.7], 0.012, { color: "#33302d", bone: "basket" });
    }
  box(1.26, 0.04, 0.04, "#a9adb2", [0, 2.55, 0], "frameX");
  box(0.04, 0.04, 1.26, "#a9adb2", [0, 2.58, 0], "frameZ");
  // Burner
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8), "#8d9096", { at: [0, 2.78, 0], bone: "basket", name: "burner" });
  b.part(new THREE.CylinderGeometry(0.17, 0.07, 0.2, 8), "#c9ccd0", { at: [0, 3.05, 0], bone: "basket", name: "nozzle" });
  b.part(new THREE.TorusGeometry(0.1, 0.02, 5, 10), "#d65a1f", {
    at: [0, 2.9, 0], rotation: [90, 0, 0], bone: "basket", name: "coil",
  });
  // Propane tanks
  for (const sz of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.9, 10), "#dcdcd3", {
      at: [0, 0.27, sz * 0.32], rotation: [0, 0, 90], bone: "basket", name: "tank",
    });
    b.part(new THREE.SphereGeometry(0.17, 8, 4), "#dcdcd3", { at: [0.45, 0.27, sz * 0.32], bone: "basket", name: "tankCap" });
    b.part(new THREE.SphereGeometry(0.17, 8, 4), "#dcdcd3", { at: [-0.45, 0.27, sz * 0.32], bone: "basket", name: "tankCap" });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 6), "#b8860b", {
      at: [0.0, 0.47, sz * 0.32], bone: "basket", name: "valve",
    });
  }
  // Sandbags hanging on the outside
  for (const sx of [-1, 1])
    b.part(new THREE.CylinderGeometry(0.09, 0.12, 0.22, 7), "#7a6a4a", {
      at: [sx * 0.72, 0.75, 0.3], bone: "basket", name: "sandbag",
    });

  return b.root;
}
```