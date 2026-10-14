import * as THREE from "three";
import { createBuilder, rng, stripes, grain } from "../../../../src/index";

export const meta = {
  name: "Treehouse Diorama",
  description:
    "A round grassy base with a thick old oak, a shingle-roofed cabin with a round window in its branches, a rope ladder, a swing, a pennant, a lantern, mushrooms and a bicycle.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  b.joint("root", { at: [0, 0, 0] });
  const rand = rng(11);

  const G = 0.55; // grass level
  const PY = 3.1; // platform height
  const D = Math.PI / 180;

  type V = [number, number, number];
  const bx = (w: number, h: number, d: number, c: any, at: V, rot?: V) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, rotation: rot });
  const cy = (rt: number, rb: number, h: number, seg: number, c: any, at: V, rot?: V) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at, rotation: rot });
  const sp = (r: number, c: any, at: V, scale?: V | number, seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), c, { at, scale });

  const WOOD = "#b98550";
  const DARK = "#6b4426";
  const ROPE = "#d8c08a";
  const BARK = grain("#6b4a2e", "#4a3120", { size: 0.07, axis: "y" });

  // ---------- base ----------
  cy(3.0, 2.7, 0.45, 14, "#6b4a30", [0, 0.225, 0]);
  cy(3.05, 3.05, 0.1, 14, "#58a94a", [0, 0.5, 0]);
  cy(3.0, 3.1, 0.04, 14, "#4a9640", [0, 0.56, 0], undefined);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    b.part(new THREE.IcosahedronGeometry(0.12, 0), "#8d8a82", {
      at: [Math.cos(a) * 2.95, 0.3 + rand() * 0.1, Math.sin(a) * 2.95],
      scale: [1.3, 0.8, 1],
      rotation: [0, a / D, 0],
      flat: true,
    });
  }

  // ---------- tree ----------
  b.part(new THREE.CylinderGeometry(0.35, 0.62, 5.3, 9), BARK, { at: [0, G + 2.65, 0] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    b.rod([Math.cos(a) * 0.3, G + 0.8, Math.sin(a) * 0.3], [Math.cos(a) * 1.15, G + 0.02, Math.sin(a) * 1.15], [0.2, 0.07], {
      color: "#5e422a",
      sides: 6,
    });
  }
  sp(0.2, "#2e2014", [0, G + 1.7, 0.56], [1, 1.5, 0.35]); // knot hole
  // big branches
  b.rod([0, 4.3, 0], [1.4, 6.3, 0.4], [0.2, 0.1], { color: "#5e422a", sides: 6 });
  b.rod([0, 4.6, 0], [-1.3, 6.5, -0.5], [0.2, 0.1], { color: "#5e422a", sides: 6 });
  b.rod([0, 4.8, 0], [0.2, 6.6, -1.4], [0.2, 0.1], { color: "#5e422a", sides: 6 });
  // swing branch
  b.rod([-0.2, 4.0, 0.2], [-2.3, 4.5, 0.2], [0.25, 0.12], { color: "#5e422a", sides: 7 });

  // crown
  const greens = ["#3f8f3a", "#4fa545", "#2f7a35", "#5cb04a", "#6bbd52"];
  const leaf = (r: number, at: V, i: number) =>
    b.part(new THREE.IcosahedronGeometry(r, 1), greens[i % greens.length], {
      at,
      scale: [1, 0.85, 1],
      rotation: [rand() * 90, rand() * 90, 0],
      flat: true,
    });
  let li = 0;
  leaf(2.0, [0, 7.1, 0], li++);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    leaf(1.25 + rand() * 0.3, [Math.cos(a) * 2.0, 6.9 + rand() * 0.5, Math.sin(a) * 2.0], li++);
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.6;
    const front = Math.sin(a) > 0.6;
    leaf(1.0 + rand() * 0.2, [Math.cos(a) * 2.6, front ? 6.6 : 6.1, Math.sin(a) * 2.6 - (front ? 0.3 : 0)], li++);
  }
  leaf(1.3, [0.3, 8.2, -0.2], li++);
  leaf(1.0, [-1.0, 8.0, 0.6], li++);
  leaf(0.9, [1.1, 7.9, 0.5], li++);
  for (let i = 0; i < 6; i++) {
    const a = rand() * Math.PI * 2;
    b.part(new THREE.IcosahedronGeometry(0.35, 0), "#8ad25f", {
      at: [Math.cos(a) * (1.2 + rand()), 7.4 + rand() * 1.4, Math.sin(a) * (1.2 + rand())],
      flat: true,
    });
  }

  // ---------- platform ----------
  bx(2.3, 0.12, 2.4, WOOD, [0, PY, 1.4]);
  for (let i = 0; i < 6; i++) bx(0.02, 0.125, 2.4, DARK, [-0.95 + i * 0.38, PY, 1.4]);
  for (const s of [-1, 1]) b.rod([0, PY - 0.95, 0.3], [s * 0.95, PY - 0.07, 2.4], 0.07, { color: DARK, sides: 6 });
  b.rod([0, PY - 0.5, 0.3], [0, PY - 0.07, 2.4], 0.06, { color: DARK, sides: 6 });
  // railings
  const postsAt: Array<[number, number]> = [[-1.1, 0.3], [1.1, 0.3], [-1.1, 2.5], [1.1, 2.5], [0.1, 2.5]];
  for (const [x, z] of postsAt) bx(0.07, 0.55, 0.07, DARK, [x, PY + 0.33, z]);
  for (const s of [-1, 1]) {
    bx(0.06, 0.06, 2.3, WOOD, [s * 1.1, PY + 0.58, 1.4]);
    bx(0.04, 0.04, 2.3, WOOD, [s * 1.1, PY + 0.3, 1.4]);
  }
  bx(1.26, 0.06, 0.06, WOOD, [-0.5, PY + 0.58, 2.5]);
  bx(1.26, 0.04, 0.04, WOOD, [-0.5, PY + 0.3, 2.5]);

  // ---------- cabin ----------
  const floor = PY + 0.06;
  const wallH = 1.3;
  const wallTop = floor + wallH;
  b.part(new THREE.BoxGeometry(1.6, wallH, 1.6), stripes(WOOD, "#8e6238", { size: 0.17, axis: "y", width: 0.14, wobble: 0.03 }), {
    at: [0, floor + wallH / 2, 1.5],
  });
  for (const sx of [-1, 1]) for (const sz of [0.7, 2.3]) bx(0.1, wallH + 0.04, 0.1, DARK, [sx * 0.8, floor + wallH / 2, sz]);
  bx(1.7, 0.08, 0.1, DARK, [0, floor + 0.04, 2.31]);
  // door
  bx(0.44, 0.8, 0.05, "#7a4a2a", [-0.2, floor + 0.4, 2.32]);
  cy(0.22, 0.22, 0.05, 8, "#7a4a2a", [-0.2, floor + 0.8, 2.32], [90, 0, 0]);
  bx(0.04, 1.0, 0.06, DARK, [-0.2, floor + 0.5, 2.33]);
  sp(0.03, "#e6c04a", [-0.05, floor + 0.4, 2.37], 1, 6);
  // round window
  cy(0.2, 0.2, 0.03, 10, "#a9dcf0", [0.5, floor + 0.85, 2.31], [90, 0, 0]);
  b.part(new THREE.TorusGeometry(0.2, 0.04, 5, 12), "#5a3a20", { at: [0.5, floor + 0.85, 2.33] });
  bx(0.4, 0.03, 0.03, "#5a3a20", [0.5, floor + 0.85, 2.34]);
  bx(0.03, 0.4, 0.03, "#5a3a20", [0.5, floor + 0.85, 2.34]);
  bx(0.5, 0.12, 0.14, "#7a4a2a", [0.5, floor + 0.5, 2.38]);
  [0.38, 0.5, 0.62].forEach((x, i) => sp(0.045, ["#f08aa8", "#ffd84a", "#f08aa8"][i], [x, floor + 0.6, 2.38], 1, 6));
  // side window
  for (const s of [-1, 1]) {
    bx(0.03, 0.34, 0.34, "#a9dcf0", [s * 0.81, floor + 0.85, 1.5]);
    bx(0.05, 0.4, 0.04, DARK, [s * 0.82, floor + 0.85, 1.32]);
    bx(0.05, 0.4, 0.04, DARK, [s * 0.82, floor + 0.85, 1.68]);
  }
  // gables
  for (const z of [2.3, 0.7])
    b.extrude(
      [[-0.8, 0], [0.8, 0], [0, 0.6]],
      { color: "#a87846", at: [0, wallTop, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05 },
    );
  // roof
  const ang = 35.2;
  const ar = ang * D;
  const peakY = wallTop + 0.6;
  for (const s of [-1, 1]) {
    const d = [s * Math.cos(ar), -Math.sin(ar)];
    const n = [s * Math.sin(ar), Math.cos(ar)];
    const rot: V = [0, 0, -s * ang];
    bx(1.25, 0.07, 2.05, "#8f2622", [d[0] * 0.6 + n[0] * 0.04, peakY + d[1] * 0.6 + n[1] * 0.04, 1.5], rot);
    for (let k = 0; k < 7; k++) {
      const o = 0.12 + k * 0.17;
      bx(0.1, 0.035, 2.07, k % 2 ? "#c0392b" : "#a82e2a", [d[0] * o + n[0] * 0.075, peakY + d[1] * o + n[1] * 0.075, 1.5], rot);
    }
  }
  bx(0.14, 0.1, 2.1, "#6e1c1a", [0, peakY + 0.03, 1.5], [0, 0, 45]);
  // pennant
  cy(0.02, 0.025, 0.7, 5, "#d9d2c0", [0, peakY + 0.38, 2.1]);
  sp(0.04, "#e6c04a", [0, peakY + 0.75, 2.1], 1, 6);
  b.extrude([[0, 0], [0, 0.26], [0.7, 0.13]], { color: "#e8b92e", at: [0.02, peakY + 0.42, 2.1], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02 });
  b.extrude([[0, 0.05], [0, 0.21], [0.3, 0.13]], { color: "#c0392b", at: [0.02, peakY + 0.42, 2.1], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.025 });

  // lantern
  bx(0.05, 0.05, 0.22, DARK, [-0.68, floor + 1.0, 2.4]);
  cy(0.005, 0.005, 0.06, 4, "#333", [-0.68, floor + 0.95, 2.5]);
  cy(0.075, 0.075, 0.15, 6, "#ffd36b", [-0.68, floor + 0.84, 2.5]);
  cy(0.01, 0.1, 0.07, 6, "#2d2d2d", [-0.68, floor + 0.95, 2.5]);
  cy(0.085, 0.085, 0.03, 6, "#2d2d2d", [-0.68, floor + 0.75, 2.5]);

  // ---------- rope ladder ----------
  const topY = PY - 0.05;
  const botY = G + 0.05;
  for (const x of [0.35, 0.75]) b.rod([x, topY, 2.65], [x, botY, 3.05], 0.02, { color: ROPE, sides: 5 });
  const rungs = 8;
  for (let k = 1; k <= rungs; k++) {
    const t = k / (rungs + 0.5);
    cy(0.025, 0.025, 0.44, 6, WOOD, [0.55, topY + (botY - topY) * t, 2.65 + 0.4 * t], [0, 0, 90]);
  }

  // ---------- swing ----------
  const sx = -1.7;
  for (const z of [-0.1, 0.5]) b.rod([sx, 4.3, 0.2], [sx, 1.2, z], 0.02, { color: ROPE, sides: 5 });
  bx(0.3, 0.06, 0.72, WOOD, [sx, 1.15, 0.2]);
  bx(0.32, 0.02, 0.1, DARK, [sx, 1.19, 0.2]);

  // ---------- mushrooms ----------
  const mush = (x: number, z: number, s: number, cap: string) => {
    cy(0.05 * s, 0.065 * s, 0.22 * s, 6, "#f1e8d2", [x, G + 0.11 * s, z]);
    b.part(new THREE.SphereGeometry(0.2 * s, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), cap, { at: [x, G + 0.2 * s, z], flat: true });
    for (let k = 0; k < 5; k++) {
      const p = k * 72 * D;
      const th = k % 2 ? 0.5 : 0.9;
      sp(0.035 * s, "#fff6e6", [x + 0.2 * s * Math.sin(th) * Math.cos(p), G + 0.2 * s + 0.2 * s * Math.cos(th) - 0.005, z + 0.2 * s * Math.sin(th) * Math.sin(p)], 1, 5);
    }
  };
  mush(-1.3, 1.9, 1.1, "#d6342c");
  mush(-1.0, 2.25, 0.65, "#e8742a");
  mush(-0.75, 1.75, 0.85, "#d6342c");
  mush(0.95, -0.9, 0.9, "#d6342c");
  mush(0.7, -1.15, 0.5, "#e8742a");

  // ---------- bicycle ----------
  const bxx = 1.9;
  const wy = G + 0.33;
  const TEAL = "#2aa6a6";
  for (const z of [0.65, 1.75]) {
    b.part(new THREE.TorusGeometry(0.33, 0.03, 5, 14), "#222", { at: [bxx, wy, z], rotation: [0, 90, 0] });
    b.part(new THREE.TorusGeometry(0.29, 0.008, 4, 14), "#c9ced3", { at: [bxx, wy, z], rotation: [0, 90, 0] });
    for (let k = 0; k < 4; k++) bx(0.008, 0.6, 0.008, "#c9ced3", [bxx, wy, z], [k * 45, 0, 0]);
    cy(0.04, 0.04, 0.08, 6, "#888", [bxx, wy, z], [0, 0, 90]);
  }
  const R: V = [bxx, wy, 0.65];
  const F: V = [bxx, wy, 1.75];
  const BB: V = [bxx, G + 0.3, 1.1];
  const ST: V = [bxx, G + 0.88, 0.9];
  const HT: V = [bxx, G + 0.85, 1.55];
  const HB: V = [bxx, G + 0.72, 1.6];
  const fr = (a: V, c: V) => b.rod(a, c, 0.02, { color: TEAL, sides: 5 });
  fr(R, BB); fr(R, ST); fr(BB, ST); fr(BB, HB); fr(ST, HT); fr(HB, F);
  fr(HT, [bxx, G + 1.0, 1.5]);
  b.rod([bxx - 0.22, G + 1.02, 1.48], [bxx + 0.22, G + 1.02, 1.48], 0.016, { color: "#222", sides: 5 });
  fr(ST, [bxx, G + 0.98, 0.88]);
  bx(0.1, 0.04, 0.22, "#222", [bxx, G + 1.0, 0.9]);
  cy(0.07, 0.07, 0.02, 8, "#999", [bxx + 0.03, G + 0.3, 1.1], [0, 0, 90]);
  b.rod([bxx + 0.04, G + 0.3, 1.1], [bxx + 0.04, G + 0.18, 1.2], 0.012, { color: "#555", sides: 4 });
  bx(0.1, 0.02, 0.06, "#222", [bxx + 0.08, G + 0.18, 1.2]);
  b.rod([bxx - 0.02, G + 0.3, 1.1], [bxx - 0.02, G + 0.42, 1.0], 0.012, { color: "#555", sides: 4 });
  bx(0.1, 0.02, 0.06, "#222", [bxx - 0.07, G + 0.42, 1.0]);
  b.part(new THREE.BoxGeometry(0.28, 0.16, 0.22), stripes("#c89a55", "#9a6f35", { size: 0.04, axis: "y", width: 0.4, wobble: 0.1 }), { at: [bxx, G + 1.14, 1.62] });
  b.rod([bxx, G + 1.0, 1.52], [bxx, G + 1.08, 1.6], 0.012, { color: "#555", sides: 4 });
  b.rod([bxx + 0.1, G + 0.28, 0.82], [bxx + 0.35, G + 0.02, 0.62], 0.012, { color: "#555", sides: 4 });

  // ---------- grass tufts & flowers ----------
  const tuft = ["#3f9a3a", "#4fb046", "#6dc454"];
  for (let i = 0; i < 70; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.9 + Math.sqrt(rand()) * 2.0;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    b.part(new THREE.ConeGeometry(0.045, 0.2 + rand() * 0.15, 4), tuft[i % 3], {
      at: [x, G + 0.1, z],
      rotation: [(rand() - 0.5) * 30, 0, (rand() - 0.5) * 30],
    });
  }
  const petals = ["#ffffff", "#ffd84a", "#f08aa8", "#b79cf0"];
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2;
    const r = 1.9 + rand() * 0.95;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    cy(0.008, 0.008, 0.2, 4, "#3f9a3a", [x, G + 0.1, z]);
    sp(0.04, petals[i % 4], [x, G + 0.21, z], 1, 6);
  }
  // stepping stones to the ladder
  for (let i = 0; i < 4; i++)
    b.part(new THREE.CylinderGeometry(0.2, 0.22, 0.05, 6), "#a8a59c", {
      at: [0.5 + (i % 2 ? 0.12 : -0.1), G + 0.03, 3.35 - 0 + i * 0.0 - 0.0 + (i - 3) * 0 + (i === 0 ? -0.0 : 0)  + i * 0.0 + (i * 0.0)],
      flat: true,
    }).mesh.position.y;

  return b.root;
}
