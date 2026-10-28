```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { pixelTexture, pixelArt, tileBox, cellPaint, bayer, pick } from "agentic-3js-builder/kits/pixel";

export const meta = {
  name: "Pixel Monster Truck",
  description: "Pixel-art monster truck with huge chunky tyres, flame-painted red body, light bar and exhaust stacks.",
};

export default function build() {
  const b = createBuilder({ name: "monster_truck" });
  const TEXEL = 0.06;

  // ---- textures ----
  const FL = ["#ffd23a", "#ff9a1f", "#ff5a1a"];
  const REDS = ["#7c1020", "#a81830", "#d42a3c", "#ee4a4a"];
  const BODYTILE = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      const v = 0.35 + 0.6 * (1 - y / 31);
      return pick(REDS, v, bayer(x, y));
    });
    // flames along bottom
    g.fill((x, y) => {
      const h = 6 + ((x * 7) % 5) + (x % 4 === 0 ? 3 : 0);
      const d = 31 - y;
      if (d > h) return "";
      return d > h - 2 ? FL[0] : d > h - 4 ? FL[1] : FL[2];
    });
    g.fill((x, y) => (y === 0 ? "#ffb0a0" : ""), [0, 0, 32, 1]);
  });
  const WINDOW = pixelArt(
    ["kkkkkkkkkk", "kbbbbbbwbk", "kbbbbbwbbk", "kbbbbwbbbk", "kbbbbbbbbk", "kbbbbbbbbk", "kbbbbbbbbk", "kkkkkkkkkk"],
    { k: "#14161e", b: "#3a6ea8", w: "#bfe4ff" },
  );
  const GRILLE = pixelArt(
    [
      "kkkkkkkkkkkkkkkkkkkk",
      "kyyyyk..........kyyk".replace(/\./g, "s").slice(0, 0) + "kyyykssssssssssssskyyyk".slice(0, 20),
      "kyWykkkkkkkkkkkkkkWykk".slice(0, 20),
      "kyyykssssssssssssskyyyk".slice(0, 20),
      "kkkkkkkkkkkkkkkkkkkk",
      "kskskskskskskskskskk",
      "kkkkkkkkkkkkkkkkkkkk",
      "kskskskskskskskskskk",
      "kkkkkkkkkkkkkkkkkkkk",
    ],
    { k: "#1a1a22", y: "#ffe86a", W: "#ffffff", s: "#9aa0b0" },
  );
  const CHROME = ["#4a4e5c", "#8a90a4", "#d8dcec"];
  const TIRE = cellPaint(0.03, (c) => (c.random(2) < 0.08 ? "#3a3a44" : c.pick(["#0c0c10", "#16161c", "#22222a"], 0.4 + 0.3 * c.random(5))), { dither: true });
  const METAL = cellPaint(0.03, (c) => c.pick(CHROME, 0.3 + 0.5 * c.random(1)), { dither: true });
  const DARK = "#1c1c24";
  const MUD = cellPaint(0.04, (c) => c.pick(["#3b2a1a", "#5a4026", "#7a5a34"], 0.2 + 0.5 * (1 - c.n.y) * c.random(4)));

  const box = (size: [number, number, number], at: [number, number, number], color: any, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, ...extra });
  const bodyBox = (size: [number, number, number], at: [number, number, number], rnd = 1) =>
    b.part(tileBox(size, BODYTILE, TEXEL, { rand: rngLite(rnd), step: [1, 1] }), "#ffffff", { at, texture: BODYTILE });
  function rngLite(seed: number) {
    let s = seed * 9301 + 49297;
    return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  }

  // ---- wheels ----
  const WR = 0.9, CY = 0.9, TW = 0.75, AX = 1.1;
  const zs = [1.35, -1.35];
  for (const s of [1, -1])
    for (const z of zs) {
      b.part(new THREE.CylinderGeometry(0.84, 0.84, TW, 16), TIRE, { at: [s * AX, CY, z], dir: [1, 0, 0] });
      const N = 16;
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const r = 0.86;
        box([TW, 0.1, 0.22], [s * AX, CY + r * Math.cos(a), z + r * Math.sin(a)], TIRE, {
          rotation: [(a * 180) / Math.PI, 0, 0],
        });
      }
      const ox = s * (AX + TW / 2 + 0.02);
      b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 12), METAL, { at: [ox, CY, z], dir: [1, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 8), "#e6b030", { at: [ox + s * 0.03, CY, z], dir: [1, 0, 0] });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        box([0.1, 0.07, 0.07], [ox + s * 0.05, CY + 0.34 * Math.cos(a), z + 0.34 * Math.sin(a)], "#e8ecf8");
      }
    }

  // ---- axles, driveline, suspension ----
  for (const z of zs) {
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 2.3, 8), DARK, { at: [0, CY, z], dir: [1, 0, 0] });
    box([0.5, 0.4, 0.5], [0, CY, z], "#30303c");
    for (const s of [1, -1]) {
      b.rod([s * 0.6, CY + 0.05, z], [s * 0.6, 1.75, z], 0.07, "#e6b030");
      for (let k = 0; k < 6; k++)
        b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 8), "#c8d0e0", { at: [s * 0.6, 1.0 + k * 0.1, z], dir: [0, 1, 0] });
      // trailing links
      b.rod([s * 0.4, CY, z], [s * 0.4, 1.45, z * 0.55], 0.05, DARK);
    }
  }
  // chassis rails
  for (const s of [1, -1]) {
    box([0.22, 0.28, 4.4], [s * 0.5, 1.5, 0], "#2a2a34");
    box([0.1, 0.1, 4.0], [s * 0.5, 1.7, 0], "#e6b030");
  }
  box([1.2, 0.2, 0.3], [0, 1.5, 0.3], "#2a2a34");
  box([1.2, 0.2, 0.3], [0, 1.5, -0.8], "#2a2a34");
  // engine block peeking
  box([0.7, 0.3, 0.6], [0, 1.78, 1.1], METAL);

  // ---- body ----
  const BY = 1.85;
  // hood
  bodyBox([1.7, 0.5, 1.5], [0, BY + 0.25, 1.35], 1);
  box([0.5, 0.12, 0.7], [0, BY + 0.56, 1.3], "#2a2a34"); // hood scoop base
  box([0.4, 0.1, 0.5], [0, BY + 0.62, 1.3], "#14141a");
  // cab
  bodyBox([1.7, 1.15, 1.4], [0, BY + 0.575, 0.05], 2);
  // roof cap
  box([1.76, 0.08, 1.46], [0, BY + 1.19, 0.05], "#8a0f20");
  // bed
  box([1.7, 0.12, 1.5], [0, BY + 0.06, -1.3], DARK);
  for (const s of [1, -1]) bodyBox([0.16, 0.6, 1.5], [s * 0.77, BY + 0.3, -1.3], 3 + s);
  bodyBox([1.7, 0.6, 0.14], [0, BY + 0.3, -2.05], 5);
  bodyBox([1.7, 0.6, 0.14], [0, BY + 0.3, -0.6], 6);
  // bed roll bar
  for (const s of [1, -1]) b.rod([s * 0.7, BY + 0.5, -0.7], [s * 0.7, BY + 1.2, -0.7], 0.05, METAL);
  b.rod([0.7, BY + 1.2, -0.7], [-0.7, BY + 1.2, -0.7], 0.05, METAL);

  // windows
  for (const [at, dir, size] of [
    [[0, BY + 0.85, 0.77], [0, 0, 1], [1.4, 0.6]],
    [[0, BY + 0.85, -0.65], [0, 0, -1], [1.2, 0.5]],
    [[0.86, BY + 0.85, 0.15], [1, 0, 0], [1.0, 0.6]],
    [[-0.86, BY + 0.85, 0.15], [-1, 0, 0], [1.0, 0.6]],
  ] as any[])
    b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", { at, dir, axis: "z", texture: WINDOW });

  // grille + front
  b.part(new THREE.PlaneGeometry(1.6, 0.46), "#ffffff", { at: [0, BY + 0.25, 2.11], dir: [0, 0, 1], axis: "z", texture: GRILLE });
  const bump = box([1.9, 0.3, 0.3], [0, 1.55, 2.2], METAL);
  box([0.18, 0.18, 0.1], [0.5, 1.58, 2.38], "#ffe86a");
  box([0.18, 0.18, 0.1], [-0.5, 1.58, 2.38], "#ffe86a");
  box([1.9, 0.3, 0.3], [0, 1.55, -2.25], METAL);
  box([0.4, 0.2, 0.05], [0, 1.58, -2.42], "#f4f4f4");
  for (const s of [1, -1]) glow(box([0.2, 0.14, 0.05], [s * 0.7, BY + 0.35, -2.13], "#ff3030"), 1.2);
  glow(box([0.2, 0.2, 0.08], [0.55, BY + 0.28, 2.12], "#fff2a0"), 1.5);
  glow(box([0.2, 0.2, 0.08], [-0.55, BY + 0.28, 2.12], "#fff2a0"), 1.5);

  // light bar
  box([1.5, 0.14, 0.2], [0, BY + 1.3, 0.55], DARK);
  for (let i = 0; i < 5; i++) glow(box([0.2, 0.12, 0.08], [-0.6 + i * 0.3, BY + 1.3, 0.67], "#fff6b0"), 1.6);

  // exhaust stacks
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.07, 0.08, 1.2, 8), METAL, { at: [s * 0.45, BY + 1.3, -0.72] });
    b.part(new THREE.CylinderGeometry(0.1, 0.07, 0.1, 8), DARK, { at: [s * 0.45, BY + 1.95, -0.72] });
  }

  // mirrors
  for (const s of [1, -1]) {
    box([0.08, 0.28, 0.2], [s * 0.95, BY + 0.9, 0.6], DARK);
    box([0.1, 0.2, 0.04], [s * 0.95, BY + 0.9, 0.7], "#bfe4ff");
  }
  // mud splatter low on body
  box([1.72, 0.12, 1.4], [0, BY + 0.06, 0.05], MUD);
  box([1.72, 0.1, 1.5], [0, BY + 0.05, 1.35], MUD);

  return b.root;
}
```