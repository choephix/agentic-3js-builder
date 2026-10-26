```ts
import * as THREE from "three";
import { createBuilder, rng, limb, svg, paint, scales, grain, mottle, noise } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Baba Yaga's Hut",
  description:
    "A Slavic folk-art log hut standing on two giant scaly chicken legs: painted carved trim, kokoshnik door arch, horse-head ridge, glowing round window, porch and ladder.",
};

// ---------- palette ----------
const RED = "#c8362b";
const CREAM = "#f3e6c8";
const GOLD = "#e8b830";
const BLUE = "#24509c";
const TEAL = "#2f7a6a";
const DARK = "#2a1a10";
const CLAW = "#3a2a1a";

// ---------- paints ----------
const LOG = mottle("#8f5f30", "#6a4322", { size: 0.18, seed: 3 });
const PLANK = grain("#c99b5a", "#a47838", { size: 0.03, axis: "y", seed: 2 });
const PLANK_D = grain("#7a5230", "#5a3a20", { size: 0.04, axis: "x", seed: 4 });
const MOSS = "#5f8f3a";
const SHING_BASE = scales(["#2f7a6a", "#3a8f78", "#2a6a66"], "#12342f", { size: 0.17, seed: 6 });
const SHINGLE = paint((p, n) => (n.y > 0.4 && noise(p, 0.35, 5) > 0.66 ? MOSS : SHING_BASE));
const RED_LACE = paint((p) => {
  const k = Math.floor((p.x + p.z) / 0.06) + Math.floor(p.y / 0.06);
  return k & 1 ? RED : CREAM;
});
const LEG = scales(["#f2b92c", "#e4a21e", "#f6c848"], "#7a4e12", { size: 0.07, seed: 8 });
const BRICK = scales("#a8472f", "#4a2018", { size: 0.07, seed: 9 });

// ---------- textures ----------
const DOOR = svg(
  `<svg viewBox="0 0 80 130" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="130" fill="#24509c"/>
  <rect x="3" y="3" width="74" height="124" fill="none" stroke="#e8b830" stroke-width="3"/>
  <path d="M20 4V126M40 4V126M60 4V126" stroke="#17356e" stroke-width="1.5"/>
  <g transform="translate(40 48)">
    ${[0, 45, 90, 135].map((a) => `<ellipse rx="5" ry="17" fill="#c8362b" stroke="#f3e6c8" stroke-width="1.5" transform="rotate(${a})"/>`).join("")}
    <circle r="8" fill="#e8b830" stroke="#7a4e12" stroke-width="1.5"/><circle r="3" fill="#c8362b"/>
  </g>
  <path d="M40 66 Q30 90 18 96 M40 66 Q50 90 62 96" stroke="#3a9a5a" stroke-width="3" fill="none"/>
  <path d="M14 104 q6 -14 12 0 q-6 6 -12 0z M54 104 q6 -14 12 0 q-6 6 -12 0z" fill="#c8362b" stroke="#f3e6c8" stroke-width="1"/>
  ${Array.from({ length: 9 }, (_, i) => `<circle cx="${10 + i * 7.5}" cy="14" r="2" fill="#f3e6c8"/>`).join("")}
  ${Array.from({ length: 9 }, (_, i) => `<circle cx="${10 + i * 7.5}" cy="118" r="2" fill="#f3e6c8"/>`).join("")}
  <circle cx="66" cy="70" r="3" fill="#e8b830"/>
</svg>`,
  { size: 256 },
);

const WIN = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="g" cx="0.5" cy="0.55" r="0.6"><stop offset="0" stop-color="#fff2a0"/><stop offset="0.6" stop-color="#ffc040"/><stop offset="1" stop-color="#e8801a"/></radialGradient></defs>
  <circle cx="50" cy="50" r="48" fill="url(#g)"/>
  <path d="M50 2V98M2 50H98" stroke="#3a2210" stroke-width="5"/>
  <path d="M2 50 Q20 30 30 12 L40 8 Q30 34 2 56z" fill="#c8362b" opacity="0.9"/>
  <path d="M98 50 Q80 30 70 12 L60 8 Q70 34 98 56z" fill="#c8362b" opacity="0.9"/>
  <path d="M38 98 L42 78 L50 70 L58 78 L62 98z" fill="#3a2210"/>
  <circle cx="50" cy="50" r="48" fill="none" stroke="#3a2210" stroke-width="3"/>
</svg>`,
  { size: 192 },
);

const SUN = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  ${Array.from({ length: 12 }, (_, i) => `<path d="M42 22 L50 2 L58 22z" fill="${i % 2 ? "#c8362b" : "#e8b830"}" stroke="#3a2210" stroke-width="1.5" transform="rotate(${i * 30} 50 50)"/>`).join("")}
  <circle cx="50" cy="50" r="27" fill="#e8b830" stroke="#3a2210" stroke-width="3"/>
  <circle cx="50" cy="50" r="21" fill="#f6d060"/>
  <circle cx="42" cy="46" r="3" fill="#3a2210"/><circle cx="58" cy="46" r="3" fill="#3a2210"/>
  <path d="M40 58 Q50 67 60 58" stroke="#c8362b" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="36" cy="55" r="4" fill="#ff8a70" opacity="0.7"/><circle cx="64" cy="55" r="4" fill="#ff8a70" opacity="0.7"/>
</svg>`,
  { size: 192 },
);

const FLOWER = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 96 Q48 70 50 52" stroke="#2f7a3a" stroke-width="5" fill="none"/>
  <path d="M50 84 Q26 80 18 60 Q42 62 50 80z M50 80 Q74 76 82 56 Q58 58 50 76z" fill="#3a9a4a" stroke="#1e5a28" stroke-width="2"/>
  <path d="M50 54 Q22 46 28 14 Q40 28 50 22 Q60 28 72 14 Q78 46 50 54z" fill="#c8362b" stroke="#3a2210" stroke-width="2.5"/>
  <path d="M50 52 Q40 36 50 22 Q60 36 50 52z" fill="#e8b830" stroke="#3a2210" stroke-width="2"/>
  <circle cx="34" cy="30" r="2.5" fill="#f3e6c8"/><circle cx="66" cy="30" r="2.5" fill="#f3e6c8"/><circle cx="50" cy="40" r="2.5" fill="#c8362b"/>
</svg>`,
  { size: 128 },
);

const RUSHNIK = svg(
  `<svg viewBox="0 0 40 130" xmlns="http://www.w3.org/2000/svg">
  <rect width="40" height="118" fill="#f6efe0" stroke="#d8ccb0" stroke-width="1"/>
  <rect y="6" width="40" height="3" fill="#c8362b"/>
  ${Array.from({ length: 4 }, (_, i) => `<path d="M20 ${60 + i * 12} l8 6 l-8 6 l-8 -6z" fill="${i % 2 ? "#24509c" : "#c8362b"}"/>`).join("")}
  <rect y="100" width="40" height="3" fill="#c8362b"/><rect y="106" width="40" height="6" fill="#c8362b"/>
  <circle cx="20" cy="34" r="9" fill="#c8362b"/><circle cx="20" cy="34" r="4" fill="#e8b830"/>
  ${Array.from({ length: 10 }, (_, i) => `<path d="M${2 + i * 4} 118 V129" stroke="#f0e6cc" stroke-width="2.4"/>`).join("")}
</svg>`,
  { size: 192 },
);

const FEATHER = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f6ecd2"/><stop offset="1" stop-color="#d9833a"/></linearGradient></defs>
  <path d="M16 63 Q1 44 4 24 Q8 8 16 1 Q24 8 28 24 Q31 44 16 63z" fill="url(#f)" stroke="#8a4a1a" stroke-width="2"/>
  <path d="M16 62 V8" stroke="#8a4a1a" stroke-width="1.5"/>
  <path d="M16 40 L7 30 M16 40 L25 30 M16 28 L9 19 M16 28 L23 19" stroke="#b86a2a" stroke-width="1.2"/>
</svg>`,
  { size: 128 },
);

// ---------- builder ----------
export default function build() {
  const b = createBuilder({ name: "baba_yaga_hut" });
  const body = b.joint("body", { at: [0, 2.0, 0], role: "spine" });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, len: number, seg = 8) => new THREE.CylinderGeometry(r, r, len, seg);
  const ball = (r: number, s = 8, t = 6) => new THREE.SphereGeometry(r, s, t);
  const put = (geo: any, color: any, at: number[], opts: any = {}) => b.part(geo, color, { bone: body, at, ...opts });
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], opts: any = {}) =>
    put(new THREE.PlaneGeometry(w, h), "#ffffff", at, { dir, axis: "z", texture: tex, ...opts });

  // ===== floor and beams =====
  put(box(2.9, 0.14, 3.3), PLANK_D, [0, 1.93, 0]);
  for (const s of [1, -1]) put(cyl(0.1, 3.5), LOG, [s * 1.0, 1.82, 0], { dir: [0, 0, 1] });
  for (const z of [-1.2, 0, 1.2]) put(cyl(0.09, 2.7), LOG, [0, 1.8, z], { dir: [1, 0, 0] });

  // ===== log walls =====
  const R = 0.13;
  for (let i = 0; i < 7; i++) {
    const y = 2.13 + 0.255 * i;
    if (i <= 4) {
      for (const s of [1, -1]) put(cyl(R, 1.05), LOG, [s * 0.925, y, 1.3], { dir: [1, 0, 0] });
    } else put(cyl(R, 2.9), LOG, [0, y, 1.3], { dir: [1, 0, 0] });
    put(cyl(R, 2.9), LOG, [0, y, -1.3], { dir: [1, 0, 0] });
    for (const s of [1, -1]) put(cyl(R, 3.1), LOG, [s * 1.1, y + 0.127, 0], { dir: [0, 0, 1] });
  }
  // belt courses of carved lace
  put(box(2.9, 0.1, 0.06), RED_LACE, [0, 3.72, 1.47]);
  put(box(2.9, 0.1, 0.06), RED_LACE, [0, 3.72, -1.47]);
  for (const s of [1, -1]) put(box(0.06, 0.1, 3.2), RED_LACE, [s * 1.28, 3.72, 0]);

  // ===== gables =====
  const gable = [
    [-1.45, 0],
    [1.45, 0],
    [0, 1.22],
  ] as any;
  for (const z of [1, -1]) {
    b.extrude(gable, { at: [0, 3.78, z * 1.36], x: [1, 0, 0], thickness: 0.1, color: PLANK, bone: body });
    plane(0.4, 0.4, SUN, [0, 4.72, z * 1.42], [0, 0, z]);
    for (const s of [1, -1]) plane(0.34, 0.34, FLOWER, [s * 0.86, 4.08, z * 1.42], [0, 0, z]);
  }
  // round glowing window
  glow(put(new THREE.CircleGeometry(0.27, 16), "#ffffff", [0, 4.2, 1.425], { dir: [0, 0, 1], axis: "z", texture: WIN }), 1.4);
  put(new THREE.TorusGeometry(0.29, 0.05, 6, 16), RED_LACE, [0, 4.2, 1.43], { dir: [0, 0, 1], axis: "z" });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    put(ball(0.022, 6, 4), CREAM, [Math.sin(a) * 0.37, 4.2 + Math.cos(a) * 0.37, 1.44]);
  }

  // ===== door =====
  const doorJ = b.joint("door", { parent: body, at: [0.4, 2.7, 1.3], dir: [0, 1, 0], role: "hinge" });
  b.part(box(0.78, 1.3, 0.06), BLUE, { bone: doorJ, at: [0, 2.7, 1.3] });
  glow(b.part(new THREE.PlaneGeometry(0.76, 1.28), "#ffffff", { bone: doorJ, at: [0, 2.7, 1.335], dir: [0, 0, 1], axis: "z", texture: DOOR }), 0.25);
  b.part(ball(0.035, 8, 6), GOLD, { bone: doorJ, at: [-0.3, 2.62, 1.37] });
  for (const y of [3.05, 2.35]) b.rod([0.4, y, 1.345], [-0.05, y, 1.345], 0.025, GOLD, { bone: doorJ });
  for (const s of [1, -1]) put(box(0.1, 1.4, 0.16), RED_LACE, [s * 0.47, 2.72, 1.45]);
  put(box(1.24, 0.1, 0.16), RED_LACE, [0, 3.38, 1.45]);
  b.extrude(
    [[-0.6, 0], [0.6, 0], [0.6, 0.12], [0.5, 0.25], [0.3, 0.3], [0.18, 0.36], [0, 0.46, "sharp"], [-0.18, 0.36], [-0.3, 0.3], [-0.5, 0.25], [-0.6, 0.12]] as any,
    { at: [0, 3.43, 1.5], x: [1, 0, 0], thickness: 0.07, smoothing: 1, color: RED, bone: body },
  );
  plane(0.3, 0.3, FLOWER, [0, 3.62, 1.545], [0, 0, 1]);
  for (const x of [-0.5, -0.3, 0.3, 0.5]) put(ball(0.025, 6, 4), CREAM, [x, 3.5, 1.545]);
  // rushnik towel beside door
  put(cyl(0.015, 0.42), GOLD, [0.82, 3.2, 1.46], { dir: [1, 0, 0] });
  plane(0.28, 0.9, RUSHNIK, [0.82, 2.74, 1.46], [0, 0, 1]);

  // ===== side windows with shutters =====
  for (const s of [1, -1]) {
    const x = s * 1.32;
    glow(plane(0.5, 0.6, WIN, [x, 3.0, 0.1], [s, 0, 0]), 1.2);
    put(box(0.1, 0.08, 0.7), RED_LACE, [s * 1.3, 3.34, 0.1]);
    put(box(0.1, 0.08, 0.7), RED_LACE, [s * 1.3, 2.66, 0.1]);
    for (const dz of [-0.31, 0.31]) put(box(0.1, 0.7, 0.08), RED_LACE, [s * 1.3, 3.0, 0.1 + dz]);
    for (const dz of [-0.55, 0.75]) {
      put(box(0.06, 0.68, 0.24), BLUE, [s * 1.3, 3.0, dz - 0.0 + 0.0]);
      plane(0.18, 0.18, FLOWER, [s * 1.335, 3.0, dz], [s, 0, 0]);
    }
  }

  // ===== roof =====
  for (const s of [1, -1]) {
    put(box(2.15, 0.1, 3.8), SHINGLE, [s * 0.866, 4.374, 0], { rotation: [0, 0, -s * 39.1] });
    for (const z of [1.9, -1.9])
      b.extrude(
        (() => {
          const L = 2.0, n = 10, d = 0.22, w = L / n;
          const pts: any[] = [[0, 0], [L, 0]];
          for (let k = n; k >= 1; k--) {
            pts.push([k * w, -d * 0.35, "sharp"]);
            pts.push([(k - 0.5) * w, -d]);
          }
          pts.push([0, -d * 0.35, "sharp"]);
          return pts;
        })(),
        { at: [0, 5.0, z], x: [s * 0.776, -0.631, 0], y: [s * 0.631, 0.776, 0], thickness: 0.05, smoothing: 1, color: RED_LACE, bone: body },
      );
  }
  put(cyl(0.13, 4.0, 8), LOG, [0, 5.08, 0], { dir: [0, 0, 1] });
  const horse = [[-0.5, -0.14], [-0.5, 0.14], [-0.3, 0.3], [-0.2, 0.52, "sharp"], [-0.08, 0.34], [0.12, 0.3], [0.34, 0.1], [0.5, -0.02], [0.5, -0.14], [0.3, -0.2], [0.1, -0.12], [-0.1, -0.24], [-0.3, -0.2]] as any;
  for (const z of [1, -1]) {
    b.extrude(horse, { at: [0, 5.2, z * 2.0], x: [0, 0, z], thickness: 0.12, color: RED, bone: body });
    for (const x of [0.07, -0.07]) put(ball(0.025, 6, 4), DARK, [x, 5.32, z * 2.0 + z * 0.2]);
    put(ball(0.03, 6, 4), GOLD, [0, 5.18, z * 2.0 + z * 0.5]);
  }
  // chimney + smoke
  put(box(0.34, 1.0, 0.34), BRICK, [0.62, 4.9, -0.9]);
  put(box(0.46, 0.08, 0.46), PLANK_D, [0.62, 5.44, -0.9]);
  [[0.62, 5.7, -0.9, 0.14], [0.7, 6.0, -0.95, 0.18], [0.82, 6.35, -1.0, 0.22], [1.0, 6.75, -1.05, 0.27]].forEach(([x, y, z, r]) =>
    put(new THREE.IcosahedronGeometry(r, 0), "#d9d6e0", [x, y, z]),
  );

  // ===== porch, rail, ladder, lantern =====
  put(box(1.7, 0.1, 0.85), PLANK, [0, 1.96, 1.85]);
  for (const s of [1, -1]) {
    put(cyl(0.05, 0.7), RED, [s * 0.8, 2.36, 2.2]);
    put(ball(0.075), GOLD, [s * 0.8, 2.76, 2.2]);
    b.rod([s * 0.8, 2.6, 2.2], [s * 0.8, 2.6, 1.45], 0.03, RED, { bone: body });
  }
  b.rod([-0.8, 2.6, 2.2], [0.8, 2.6, 2.2], 0.03, RED, { bone: body });
  for (let i = 0; i < 6; i++) put(cyl(0.025, 0.4, 6), CREAM, [-0.64 + i * 0.256, 2.4, 2.2]);
  glow(put(box(0.14, 0.2, 0.14), "#ffc040", [0.8, 2.98, 2.2]), 1.6);
  put(new THREE.ConeGeometry(0.11, 0.1, 4), RED, [0.8, 3.13, 2.2]);
  for (const s of [1, -1]) b.rod([s * 0.35, 1.98, 2.2], [s * 0.35, 0.06, 2.95], 0.035, PLANK_D, { bone: body });
  for (let i = 1; i <= 9; i++) {
    const t = i / 10;
    put(cyl(0.025, 0.7, 6), PLANK_D, [0, 1.98 - 1.92 * t, 2.2 + 0.75 * t], { dir: [1, 0, 0] });
  }

  // ===== chicken legs =====
  const legRng = rng(11);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.7, 1.95, 0.05], [s * 0.7, 0.1, 0.5], [0.75, 0.75, 0.65], [[0, 0, 1], [0, 0, -1]]);
    const chain = b.chain(`leg${side}`, pts, {
      parent: body,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`],
      role: "leg",
    });
    const tip = chain.tip!;
    const sw = b.sweep(chain, (t: number) => 0.2 - 0.14 * Math.min(t * 1.6, 1), { color: LEG, sides: 8 });
    // thigh feathers
    const hits = b.surface(sw).scatter(55, { rng: legRng, minDist: 0.07, filter: (h: any) => h.at.y > 1.3 });
    b.cards(hits, FEATHER, { size: [0.14, 0.26], lean: 70, bend: 30, vary: 0.3, rng: rng(4 + (s > 0 ? 1 : 0)) });
    // hock spur and knuckle
    b.spike(chain.joints[2], [0, 0, -1], 0.2, 0.04, { color: CLAW, bone: chain.joints[2] });
    b.part(ball(0.085, 8, 6), LEG, { bone: tip, at: [pts[3].x, 0.1, pts[3].z] });
    const foot = new THREE.Vector3(pts[3].x, 0.1, pts[3].z);
    const toes: [number, number][] = [[-38, 0.55], [0, 0.6], [38, 0.55], [180, 0.32]];
    for (const [deg, len] of toes) {
      const a = (deg * Math.PI) / 180;
      const d = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
      const end = foot.clone().addScaledVector(d, len);
      end.y = 0.06;
      b.rod(foot, end, [0.06, 0.045], LEG, { bone: tip, caps: "flat" });
      b.part(ball(0.06, 6, 4), LEG, { bone: tip, at: foot.clone().lerp(end, 0.5).setY(0.07) });
      b.spike(end, [d.x, -0.35, d.z], 0.18, 0.045, { color: CLAW, bone: tip });
    }
  }

  return b.root;
}
```