import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";
import { grain } from "../../../../src/index";

export const meta = {
  name: "Wizard's Bookshelf",
  description: "A tall high-fantasy anime bookshelf crowded with tomes, scrolls, glowing orbs and candles.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(5);
  const WOOD = grain("#5a3322", "#8a5a38", { size: 0.12, axis: "y", seed: 3 });
  const WOOD_D = "#3a2016";
  const GOLD = "#f0be4a";

  const box = (s: V, at: V, c: any, rot?: V) =>
    b.part(new THREE.BoxGeometry(...s), c, { bone: root, at, rotation: rot, flat: true });
  const cyl = (rt: number, rb: number, h: number, at: V, c: any, seg = 10, rot?: V) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: root, at, rotation: rot, flat: true });

  const W = 1.5, D = 0.4, H = 2.2;
  // frame
  for (const s of [-1, 1]) {
    box([0.1, H, D], [s * (W / 2), H / 2, 0], WOOD);
    box([0.14, 0.12, D + 0.06], [s * (W / 2), 0.06, 0], WOOD_D);
  }
  box([W, H - 0.1, 0.04], [0, H / 2, -D / 2 + 0.02], WOOD_D);
  const shelfY = [0.12, 0.64, 1.16, 1.68];
  for (const y of shelfY) box([W, 0.06, D], [0, y, 0], WOOD);
  // arched crown
  box([W + 0.2, 0.1, D + 0.1], [0, H + 0.05, 0], WOOD_D);
  b.extrude([[-0.75, 0], [0.75, 0], [0.55, 0.22], [0.2, 0.36], [0, 0.46, "sharp"], [-0.2, 0.36], [-0.55, 0.22]], {
    at: [0, H + 0.1, 0], x: [1, 0, 0], thickness: 0.3, bevel: 0.02, color: WOOD, bone: root,
  });
  // moon emblem
  const moon = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="#f0be4a" stroke-width="5"/><path d="M38 14a20 20 0 1 0 0 36a15 15 0 1 1 0-36z" fill="#ffe9a0"/><circle cx="46" cy="20" r="3" fill="#fff"/></svg>`, { size: 128 });
  glow(b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone: root, at: [0, H + 0.26, 0.16], dir: [0, 0, 1], axis: "z", texture: moon }), 1.1);
  for (const s of [-1, 1]) {
    cyl(0.03, 0.03, 0.2, [s * 0.75, H + 0.2, 0], GOLD, 6);
    b.part(new THREE.OctahedronGeometry(0.06, 0), "#7ff0ff", { bone: root, at: [s * 0.75, H + 0.34, 0] });
  }

  const palette = ["#8a2a3a", "#2c4a8a", "#2f7a5a", "#6a3a8a", "#c0783a", "#3a6a7a", "#a02a50"];
  const rune = svg(`<svg viewBox="0 0 20 40"><path d="M10 6v28M10 12l6 6M10 22l6 6" stroke="#f0be4a" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`, { size: 64 });
  const book = (x: number, y: number, w: number, h: number, c: string, tilt = 0) => {
    box([w, h, 0.26], [x, y + h / 2, 0.02], c, [0, 0, tilt]);
    box([w + 0.01, 0.025, 0.27], [x, y + h * 0.82, 0.02], GOLD, [0, 0, tilt]);
    box([w + 0.01, 0.025, 0.27], [x, y + h * 0.18, 0.02], GOLD, [0, 0, tilt]);
    if (w > 0.07) b.part(new THREE.PlaneGeometry(w * 0.6, h * 0.5), "#ffffff", { bone: root, at: [x, y + h / 2, 0.152], dir: [0, 0, 1], axis: "z", texture: rune });
  };
  const bookRow = (y: number, x0: number, x1: number, tiltEnd = false) => {
    let x = x0;
    while (x < x1) {
      const w = 0.05 + R() * 0.05, h = 0.32 + R() * 0.16;
      if (x + w > x1) break;
      book(x + w / 2, y + 0.03, w, h, palette[Math.floor(R() * palette.length)]);
      x += w + 0.004;
    }
    if (tiltEnd) book(x + 0.12, y + 0.03, 0.07, 0.4, "#8a2a3a", -0.3);
  };
  bookRow(shelfY[0], -0.68, 0.0, true);
  // stacked tomes
  [[0.3, "#2c4a8a", 0.4], [0.28, "#6a3a8a", 0.34], [0.32, "#2f7a5a", 0.3]].forEach(([x, c, w], i) => {
    box([w as number, 0.07, 0.28], [(x as number) + 0.2, 0.18 + i * 0.075, 0.02], c as string, [0, i * 12 - 10, 0]);
    box([(w as number) - 0.02, 0.05, 0.27], [(x as number) + 0.2, 0.18 + i * 0.075, 0.025], "#efe2bd", [0, i * 12 - 10, 0]);
  });
  bookRow(shelfY[1], -0.68, -0.05);
  // scrolls in a rack
  for (let i = 0; i < 5; i++) {
    const x = 0.15 + i * 0.1;
    cyl(0.04, 0.04, 0.36, [x, shelfY[1] + 0.2, 0.02], i % 2 ? "#efe2bd" : "#dcc88e", 8, [0, 0, 12 - i * 6]);
    cyl(0.044, 0.044, 0.03, [x - 0.03 * (i - 2) * 0.2, shelfY[1] + 0.03 + 0.18, 0.02], "#a02a50", 8);
  }
  // orbs
  const orb = (x: number, y: number, r: number, c: string) => {
    cyl(0.07, 0.09, 0.04, [x, y + 0.02, 0.02], GOLD, 8);
    glow(b.part(new THREE.SphereGeometry(r, 10, 8), c, { bone: root, at: [x, y + 0.04 + r * 0.9, 0.02] }), 1.3);
    b.part(new THREE.SphereGeometry(r * 0.25, 6, 4), "#ffffff", { bone: root, at: [x - r * 0.35, y + 0.04 + r * 1.35, 0.02 + r * 0.6] });
  };
  bookRow(shelfY[2], -0.68, -0.15);
  orb(0.2, shelfY[2] + 0.03, 0.13, "#6ad8ff");
  orb(0.5, shelfY[2] + 0.03, 0.09, "#d88aff");
  orb(0.6, shelfY[2] + 0.03, 0.0001 + 0.001, "#ffffff");
  // top shelf: candles and skull-less globe
  const candle = (x: number, y: number, h: number) => {
    cyl(0.05, 0.06, 0.02, [x, y + 0.01, 0.02], GOLD, 8);
    cyl(0.026, 0.03, h, [x, y + 0.02 + h / 2, 0.02], "#fbefd2", 8);
    for (const a of [0.5, 3]) b.part(new THREE.CapsuleGeometry(0.006, 0.04, 3, 4), "#fbefd2", { bone: root, at: [x + Math.cos(a) * 0.028, y + h - 0.01, 0.02 + Math.sin(a) * 0.028] });
    glow(b.part(new THREE.SphereGeometry(0.02, 6, 5), "#ffb040", { bone: root, at: [x, y + h + 0.06, 0.02], scale: [0.7, 1.7, 0.7] }), 1.5);
  };
  candle(-0.6, shelfY[3] + 0.03, 0.22);
  candle(-0.45, shelfY[3] + 0.03, 0.14);
  candle(0.6, shelfY[3] + 0.03, 0.26);
  bookRow(shelfY[3], -0.35, 0.05);
  // hourglass
  cyl(0.08, 0.08, 0.02, [0.25, shelfY[3] + 0.04, 0.02], GOLD, 8);
  cyl(0.08, 0.08, 0.02, [0.25, shelfY[3] + 0.36, 0.02], GOLD, 8);
  b.part(new THREE.ConeGeometry(0.07, 0.15, 8), "#bfeaff", { bone: root, at: [0.25, shelfY[3] + 0.125, 0.02], rotation: [180, 0, 0] });
  b.part(new THREE.ConeGeometry(0.07, 0.15, 8), "#bfeaff", { bone: root, at: [0.25, shelfY[3] + 0.275, 0.02] });
  // sparkles
  for (let i = 0; i < 6; i++)
    glow(b.part(new THREE.OctahedronGeometry(0.02, 0), "#fff6b0", { bone: root, at: [(R() - 0.5) * 1.4, 0.5 + R() * 1.9, 0.3 + R() * 0.1] }), 1.6);

  return b.root;
}
