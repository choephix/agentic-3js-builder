import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import type { PartOptions } from "../src/parts";
import { DEG, rng } from "../src/math";
import { catmull } from "../src/path";
import { cells, mix, noise, paint, smoothstep } from "../src/paint";
import type { Paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Rune-Forged Greatsword on a Standing Stone",
  description:
    "A chunky two-handed greatsword plunged point-down into a carved octagonal stone shrine: blue steel blade with a gold-lined fuller and glowing runes, winged gold crossguard, wrapped grip with a crimson ribbon, orb pommel, four crystal pylons, moss and rubble. Hand-painted Warcraft look.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Dimensions (meters)

const CAP_TOP = 0.58; // top of the shrine
const SINK = 0.11; // how deep the tip is buried
const BL = 1.1; // blade length, guard seat to tip
const YB = CAP_TOP - SINK + BL; // world y of the blade seat (blade points down)
const YG = YB + 0.01; // guard centre
const WS = 1.28; // blade width scale (chunky)
const GS = 1.18; // crossguard scale
const PS = 1.15; // pommel scale
const GRIP_BOT = YG + 0.16;
const GRIP_LEN = 0.34;
const GRIP_TOP = GRIP_BOT + GRIP_LEN;
const H = 0.8; // shrine footprint scale

// ---------------------------------------------------------------------------------------------------------------
// Palette

const GEM = "#2fc8ff";
const KEY = new THREE.Vector3(0.35, 0.8, 0.5).normalize();

/** Hand-painted three-tone ramp driven by the normal against a key light. */
function shaded(dark: string, mid: string, light: string, seed = 1, wear?: string) {
  return paint((p, n) => {
    const d = n.dot(KEY);
    let c = d < 0.2 ? mix(dark, mid, smoothstep(-0.8, 0.2, d)) : mix(mid, light, smoothstep(0.2, 0.95, d));
    if (wear) {
      const w = noise(p, 0.035, seed);
      if (w > 0.74) c = mix(c, wear, 0.45);
    }
    return c;
  });
}

const GOLD = shaded("#7a3f10", "#e2a21c", "#fff1a0", 3, "#fff8d0");
const GOLD_D = shaded("#5a2c0a", "#b9741a", "#f0c24a", 4);
const IRON = shaded("#141f3d", "#2f4a80", "#8db6f0", 5, "#b6d3ff");
const BRONZE = shaded("#3a1e0c", "#8a4f20", "#d89a50", 6);

const STONE_D = "#59607c";
const STONE_M = "#9198ad";
const STONE_L = "#d6d8e2";
const MOSS_D = "#2f5a1f";
const MOSS_L = "#7fbf3f";

/** Chiselled blue-grey stone: painted blocks, cracks, light on top, dark at the foot, moss only where it is damp. */
function stone(seed: number, size = 0.24, mossy = 0.5) {
  return paint((p, n) => {
    const c = cells(p, size, seed);
    const edge = c.d2 - c.d1;
    const nz = noise(p, 0.14, seed + 5);
    const grit = noise(p, 0.03, seed + 9);
    const warm = noise(p, 0.3, seed + 14);
    const d = n.dot(KEY);
    let col = mix(mix(STONE_D, STONE_M, 0.45 + 0.55 * nz), STONE_L, smoothstep(0.35, 1, d) * 0.85);
    col = mix(col, "#8f8478", smoothstep(0.55, 0.85, warm) * 0.3);
    col = mix(col, "#3a4060", smoothstep(0.35, -0.2, d) * 0.3);
    col = mix(col, STONE_D, (0.7 - 0.45 * c.id) * 0.18);
    col = mix(col, "#2c3150", smoothstep(0.3, 0.0, p.y) * 0.3);
    if (grit > 0.72) col = mix(col, "#e9ecf5", 0.12);
    if (edge < 0.05) col = mix(col, "#1b1f33", 0.8);
    else if (edge < 0.1 && d > 0.2) col = mix(col, "#e6e9f4", 0.3);
    const lim = 0.86 - 0.15 * mossy;
    const damp = noise(p, 0.17, seed + 21) + (0.22 - p.y) * 0.8 + n.y * 0.1;
    if (damp > lim && n.y > 0) {
      const m = noise(p, 0.035, seed + 33);
      col = mix(col, mix(MOSS_D, MOSS_L, 0.2 + 0.6 * m), smoothstep(lim, lim + 0.07, damp));
    }
    return col;
  });
}

const CLOTH = paint((p, n, s) => {
  const fold = noise(p, 0.05, 41);
  let c = mix("#6d0f1c", "#e03a3a", 0.25 + 0.6 * fold * (0.55 + 0.45 * Math.abs(n.x + n.z)));
  if (s[0] > 0.86 && s[0] < 0.91) c = mix("#a8661a", "#ffd24a", 0.6 + 0.4 * fold);
  return c;
});

// ---------------------------------------------------------------------------------------------------------------
// Rune drawings

const GLYPHS = [
  "M10 2 L10 18 M10 6 L16 11 M10 11 L4 16",
  "M5 2 L5 18 M5 3 L15 8 L5 13",
  "M4 2 L16 10 L4 18 M16 2 L16 18",
  "M10 2 L4 10 L10 18 L16 10 Z M10 6 L10 14",
  "M4 18 L10 2 L16 18 M6 12 L14 12",
  "M5 2 L5 18 M15 2 L15 18 M5 10 L15 10",
  "M4 2 L16 18 M16 2 L4 18",
  "M5 2 L5 18 L15 18 M5 8 L12 8",
  "M4 4 L10 10 L16 4 M10 10 L10 18",
  "M10 2 L10 18 M4 7 L10 2 L16 7 M4 13 L16 13",
];

/** A glowing stroke: wide cyan with a pale core. */
const dual = (d: string, w: number) =>
  `<path d="${d}" stroke="#13b4f0" stroke-width="${w * 2.3}"/><path d="${d}" stroke="#c8fbff" stroke-width="${w}"/>`;

function glyphGroup(i: number, tf: string, w: number) {
  const strokes = GLYPHS[i % GLYPHS.length]
    .split(" M")
    .map((seg, k) => dual((k ? "M" : "") + seg, w))
    .join("");
  return `<g transform="${tf}">${strokes}</g>`;
}

const RUNE_COLUMN = (() => {
  const cellH = 190 / 7;
  const rows = [0, 3, 5, 1, 7, 4, 9];
  const body = rows.map((g, i) => glyphGroup(g, `translate(3 ${(i * cellH + (cellH - 20) / 2).toFixed(1)})`, 1.3)).join("");
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 190"><g fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`,
    { size: 1600 },
  );
})();

const RUNE_CIRCLE = (() => {
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><g fill="none" stroke-linecap="round" stroke-linejoin="round">`;
  s += `<circle cx="200" cy="200" r="192" stroke="#12304f" stroke-width="16"/>`;
  s += `<circle cx="200" cy="200" r="192" stroke="#13b4f0" stroke-width="5"/><circle cx="200" cy="200" r="192" stroke="#c8fbff" stroke-width="2"/>`;
  s += `<circle cx="200" cy="200" r="126" stroke="#13b4f0" stroke-width="6"/><circle cx="200" cy="200" r="126" stroke="#c8fbff" stroke-width="2.4"/>`;
  s += `<circle cx="200" cy="200" r="70" stroke="#13b4f0" stroke-width="5"/><circle cx="200" cy="200" r="70" stroke="#c8fbff" stroke-width="2"/>`;
  for (let k = 0; k < 16; k++) s += glyphGroup(k, `translate(200 200) rotate(${k * 22.5}) translate(-9 -178) scale(0.9)`, 1.6);
  for (let k = 0; k < 8; k++) {
    const a = (k * 45 * Math.PI) / 180;
    const a2 = ((k * 45 + 135) * Math.PI) / 180;
    const x1 = 200 + Math.sin(a) * 126;
    const y1 = 200 - Math.cos(a) * 126;
    const x2 = 200 + Math.sin(a2) * 126;
    const y2 = 200 - Math.cos(a2) * 126;
    s += dual(`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`, 1.4);
  }
  const rr = rng(77);
  for (let k = 0; k < 7; k++) {
    const a0 = k * 51.4 + 8;
    let d = "";
    let r = 36;
    for (let j = 0; j < 6; j++) {
      const a = ((a0 + (rr() - 0.5) * 22) * Math.PI) / 180;
      d += `${j ? "L" : "M"}${(200 + Math.sin(a) * r).toFixed(1)} ${(200 - Math.cos(a) * r).toFixed(1)} `;
      r += 17 + rr() * 6;
    }
    s += dual(d, 1.2);
  }
  s += `</g></svg>`;
  return svg(s, { size: 2048 });
})();

const PLAQUES = [0, 1, 2, 3, 4, 5, 6, 7].map((g) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="0" y="0" width="24" height="24" fill="#10243f"/><rect x="1.2" y="1.2" width="21.6" height="21.6" fill="none" stroke="#0b1a30" stroke-width="1"/><g fill="none" stroke-linecap="round" stroke-linejoin="round">${glyphGroup(g + 2, "translate(2 2)", 1.1)}</g></svg>`,
    { size: 256 },
  ),
);

const PYLON_RUNES = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 66"><rect width="22" height="66" fill="#10243f"/><g fill="none" stroke-linecap="round" stroke-linejoin="round">${[2, 6, 8]
    .map((g, i) => glyphGroup(g, `translate(1 ${i * 22 + 1})`, 1.1))
    .join("")}</g></svg>`,
  { size: 512 },
);

const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <path d="M6 40 Q4 22 1 6 Q9 18 11 40Z" fill="#3d7a22"/>
  <path d="M12 40 Q12 20 14 2 Q20 18 18 40Z" fill="#5ea32c"/>
  <path d="M18 40 Q22 18 27 4 Q28 22 24 40Z" fill="#78bd38"/>
  <path d="M24 40 Q30 24 36 12 Q33 28 30 40Z" fill="#4c9026"/>
  <path d="M30 40 Q34 30 39 24 Q36 34 35 40Z" fill="#3d7a22"/>
  <path d="M14 40 Q14 28 15 16 Q17 28 17 40Z" fill="#a3d95a"/></svg>`,
  { size: 160 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "runeGreatsword", paintSize: 2048 });
  const root = b.joint("base", { at: [0, 0, 0] });
  const R = rng(2024);

  const put = (g: THREE.BufferGeometry, color: string | Paint, at: [number, number, number], o: PartOptions = {}) =>
    b.part(g, color, { bone: root, at, flat: true, ...o });
  const yawPitch = (yaw: number, pitch: number, roll = 0) =>
    new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch * DEG, yaw * DEG, roll * DEG, "YXZ"));
  /** Point at radius r*H (shrine scale) and bearing deg from +Z. */
  const sp = (r: number, deg: number, y: number): [number, number, number] => [r * H * Math.sin(deg * DEG), y, r * H * Math.cos(deg * DEG)];
  const dirOf = (deg: number): [number, number, number] => [Math.sin(deg * DEG), 0, Math.cos(deg * DEG)];
  /** Lathe whose profile radii are shrine-scaled. */
  const slathe = (outline: OutlinePoint[], at: [number, number, number], color: string | Paint, segments = 8, spin = 22.5) =>
    b.lathe(
      outline.map((q): OutlinePoint => (q[2] ? [q[0] * H, q[1], "sharp"] : [q[0] * H, q[1]])),
      { at, segments, spin, color, bone: root },
    );
  const lathe = (outline: OutlinePoint[], at: [number, number, number], color: string | Paint, segments = 8, spin = 22.5) =>
    b.lathe(outline, { at, segments, spin, color, bone: root });

  // =============================================================== THE STONE SHRINE
  // Octagonal tiers: flats face front/back/left/right.
  slathe([[0, 0], [0.96, 0], [1.0, 0.035], [0.97, 0.095], [0, 0.095]], [0, 0, 0], stone(11, 0.3));
  slathe([[0, 0], [0.76, 0], [0.78, 0.02], [0.76, 0.1], [0.72, 0.112], [0, 0.112]], [0, 0.095, 0], stone(12, 0.22));
  slathe([[0, 0], [0.54, 0], [0.52, 0.3], [0.5, 0.31], [0, 0.31]], [0, 0.205, 0], stone(13, 0.2));
  // gold bands round the drum
  slathe([[0.47, 0], [0.545, 0], [0.545, 0.022], [0.5, 0.03], [0.47, 0.03]], [0, 0.2, 0], GOLD_D);
  slathe([[0.45, 0], [0.525, 0], [0.525, 0.026], [0.47, 0.03], [0.45, 0.03]], [0, 0.478, 0], GOLD_D);
  // capstone
  slathe([[0, 0], [0.62, 0], [0.62, 0.02], [0.59, 0.08], [0, 0.08]], [0, 0.5, 0], stone(14, 0.2, 0.1));
  // gold inlay ring on top, a darker well round it, and the rune circle
  slathe([[0.425, 0], [0.455, 0], [0.455, 0.007], [0.425, 0.007]], [0, CAP_TOP, 0], GOLD);
  slathe([[0.455, 0], [0.575, 0], [0.575, 0.004], [0.455, 0.004]], [0, CAP_TOP, 0], shaded("#222842", "#3b4263", "#6c7595", 8));
  glow(
    b.part(new THREE.CircleGeometry(0.42 * H, 32), "#ffffff", {
      bone: root,
      at: [0, CAP_TOP + 0.0015, 0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: RUNE_CIRCLE,
    }),
    1.4,
  );

  // gold corner caps on the capstone (vertices at 22.5 + 45k) and studs
  const studGeo: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 8; k++) {
    const a = 22.5 + 45 * k;
    put(new THREE.ConeGeometry(0.034, 0.055, 4), GOLD, sp(0.585, a, CAP_TOP + 0.022), { rotation: [0, a + 45, 0] });
    const [x, y, z] = sp(0.62, a, 0.51);
    studGeo.push(new THREE.SphereGeometry(0.013, 6, 4).translate(x, y, z));
    const [x2, y2, z2] = sp(0.5, a, 0.35);
    studGeo.push(new THREE.SphereGeometry(0.011, 6, 4).translate(x2, y2, z2));
  }
  b.part(mergeGeometries(studGeo), GOLD, { bone: root, at: [0, 0, 0], flat: true, name: "studs.shrine" });

  // carved plaques on the 8 drum faces
  const plaqueRad = 0.472 * H;
  for (let k = 0; k < 8; k++) {
    const a = k * 45;
    const y = 0.35;
    const w = k % 2 === 0 ? 0.17 : 0.13;
    const rot: [number, number, number] = [0, a, 0];
    const at = (d: number): [number, number, number] => [(plaqueRad + d) * Math.sin(a * DEG), y, (plaqueRad + d) * Math.cos(a * DEG)];
    put(new THREE.BoxGeometry(w + 0.045, w + 0.045, 0.024), GOLD_D, at(0.004), { rotation: rot });
    put(new THREE.BoxGeometry(w + 0.012, w + 0.012, 0.028), BRONZE, at(0.006), { rotation: rot });
    glow(b.part(new THREE.PlaneGeometry(w, w), "#ffffff", { bone: root, at: at(0.0205), dir: dirOf(a), axis: "z", texture: PLAQUES[k] }), 1.2);
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
      const lx = dx * (w / 2 + 0.012);
      const cx = plaqueRad + 0.018;
      put(new THREE.SphereGeometry(0.01, 6, 4), GOLD, [
        cx * Math.sin(a * DEG) + lx * Math.cos(a * DEG),
        y + dy * (w / 2 + 0.012),
        cx * Math.cos(a * DEG) - lx * Math.sin(a * DEG),
      ]);
    }
  }

  // broken slabs heaved up round the blade
  for (let k = 0; k < 7; k++) {
    const a = k * (360 / 7) + 12;
    const rad = 0.1 + R() * 0.03;
    put(new THREE.BoxGeometry(0.09 + R() * 0.05, 0.04 + R() * 0.03, 0.07 + R() * 0.03), stone(30 + k, 0.1, 0.1), [rad * Math.sin(a * DEG), CAP_TOP + 0.016, rad * Math.cos(a * DEG)], {
      quat: yawPitch(a, 16 + R() * 14, (R() - 0.5) * 16),
    });
  }
  for (let k = 0; k < 5; k++) {
    const a = k * 72 + 40;
    const rad = 0.17 + R() * 0.05;
    put(new THREE.IcosahedronGeometry(0.026 + R() * 0.016, 0), stone(50 + k, 0.08, 0.1), [rad * Math.sin(a * DEG), CAP_TOP + 0.012, rad * Math.cos(a * DEG)], {
      rotation: [R() * 90, R() * 90, 0],
      scale: [1, 0.6, 1],
    });
  }

  // flagstones on the foundation, skipping the pylon spots (diagonals at 45 + 90k)
  for (let k = 0; k < 16; k++) {
    const a = k * 22.5;
    if (Math.abs((((a % 90) + 90) % 90) - 45) < 15) continue;
    const h = 0.022 + R() * 0.018;
    put(new THREE.BoxGeometry(0.24, h, 0.12), stone(60 + k, 0.12, 0.5), sp(0.84, a, 0.095 + h / 2 - 0.004), {
      rotation: [0, a + (R() - 0.5) * 6, 0],
    });
  }

  // =============================================================== PYLONS
  for (let k = 0; k < 4; k++) {
    const a = 45 + 90 * k;
    const [px, , pz] = sp(0.8, a, 0);
    const pylonStone = stone(70 + k, 0.14, 0.6);
    const hexLathe = (outline: OutlinePoint[], y: number, color: string | Paint) =>
      b.lathe(outline, { at: [px, y, pz], segments: 6, spin: 0, color, bone: root });
    hexLathe([[0, 0], [0.105, 0], [0.1, 0.07], [0.082, 0.085], [0, 0.085]], 0.093, pylonStone);
    hexLathe([[0, 0], [0.08, 0], [0.06, 0.4], [0, 0.4]], 0.175, pylonStone);
    hexLathe([[0.045, 0], [0.084, 0], [0.084, 0.022], [0.06, 0.034], [0.045, 0.034]], 0.205, GOLD_D);
    hexLathe([[0.04, 0], [0.078, 0], [0.078, 0.02], [0.06, 0.045], [0.04, 0.045]], 0.54, GOLD);
    for (let j = 0; j < 4; j++) {
      const aa = j * 90 + 45;
      put(new THREE.ConeGeometry(0.016, 0.09, 4), GOLD, [px + 0.04 * Math.sin(aa * DEG), 0.6, pz + 0.04 * Math.cos(aa * DEG)], {
        rotation: [Math.cos(aa * DEG) * 14, 0, -Math.sin(aa * DEG) * 14],
      });
    }
    glow(put(new THREE.OctahedronGeometry(0.052, 0), GEM, [px, 0.71, pz], { scale: [1, 1.7, 1], rotation: [0, 20 * k, 0] }), 1.6);
    const out = dirOf(a);
    const plaqueR = 0.8 * H + 0.062;
    put(new THREE.BoxGeometry(0.09, 0.23, 0.018), GOLD_D, [plaqueR * Math.sin(a * DEG), 0.37, plaqueR * Math.cos(a * DEG)], { dir: out, axis: "z" });
    glow(
      b.part(new THREE.PlaneGeometry(0.066, 0.2), "#ffffff", {
        bone: root,
        at: [(plaqueR + 0.0095) * Math.sin(a * DEG), 0.37, (plaqueR + 0.0095) * Math.cos(a * DEG)],
        dir: out,
        axis: "z",
        texture: PYLON_RUNES,
      }),
      1.2,
    );
    // a tattered crimson pennant hanging from the collar, beside the plaque
    const tan = dirOf(a + 90);
    const side = k % 2 === 0 ? 1 : -1;
    const base = [px + tan[0] * 0.07 * side, pz + tan[2] * 0.07 * side];
    const pennant = catmull(
      [0.575, 0.52, 0.43, 0.34, 0.27].map((y, i): [number, number, number] => [
        base[0] + dirOf(a)[0] * (0.012 + 0.018 * i) + tan[0] * 0.006 * i * side,
        y,
        base[1] + dirOf(a)[2] * (0.012 + 0.018 * i) + tan[2] * 0.006 * i * side,
      ]),
    );
    b.sweep(pennant, (t) => [0.03 - 0.012 * t, 0.003], { section: "box", color: CLOTH, caps: "flat", bone: root, name: `pennant${k}` });
    const tip = pennant.at(1);
    put(new THREE.ConeGeometry(0.012, 0.03, 4), GOLD, [tip.x, tip.y - 0.008, tip.z], { rotation: [0, 0, 180] });
  }

  // =============================================================== GRASS, MOSS, RUBBLE
  const tuftFrames: Frame[] = [];
  for (let k = 0; k < 28; k++) {
    const [x, , z] = sp(1.06 + R() * 0.2, R() * 360, 0);
    tuftFrames.push(frame([x, 0, z], [0, 1, 0]));
  }
  for (let k = 0; k < 8; k++) {
    const [x, , z] = sp(0.93, 22.5 + 45 * k + (R() - 0.5) * 6, 0);
    tuftFrames.push(frame([x, 0.09, z], [0, 1, 0]));
  }
  for (let k = 0; k < 12; k++) {
    const [x, , z] = sp(0.7 + R() * 0.03, k * 30 + 10, 0);
    tuftFrames.push(frame([x, 0.205, z], [0, 1, 0]));
  }
  b.cards(tuftFrames, TUFT, { size: [0.085, 0.085], cross: true, vary: 0.4, spin: 180, rng: rng(5), lean: 8, bend: 20, flow: [0.3, 0, 1] });

  for (let k = 0; k < 10; k++) {
    const s = 0.04 + R() * 0.07;
    const [x, , z] = sp(1.1 + R() * 0.25, k * 36 + 8 + R() * 14, 0);
    put(new THREE.IcosahedronGeometry(s, 0), stone(90 + k, 0.1, 0.6), [x, s * 0.95, z], {
      rotation: [R() * 30, R() * 360, R() * 30],
      scale: [1.2, 0.75, 1],
    });
  }
  // moss cushions on the step and foundation
  for (let k = 0; k < 8; k++) {
    const onStep = k % 2 === 0;
    const s = 0.028 + R() * 0.025;
    const [x, , z] = sp(onStep ? 0.64 + R() * 0.1 : 0.82 + R() * 0.08, R() * 360, 0);
    put(new THREE.IcosahedronGeometry(s, 0), k % 3 ? "#5f9d34" : "#7fbf3f", [x, (onStep ? 0.207 : 0.097) + s * 0.15, z], {
      scale: [1.5, 0.55, 1.2],
      rotation: [0, R() * 360, 0],
    });
  }
  // little glowing crystal shards in cracks of the foundation
  for (let k = 0; k < 5; k++) {
    const a = 20 + k * 70 + R() * 10;
    const [x, , z] = sp(0.9 + R() * 0.08, a, 0);
    const [x2, , z2] = sp(1.04 + R() * 0.05, a + 10, 0);
    glow(put(new THREE.ConeGeometry(0.018, 0.1 + R() * 0.05, 5), GEM, [x, 0.14, z], { rotation: [R() * 25, 0, R() * 25] }), 1.4);
    glow(put(new THREE.ConeGeometry(0.014, 0.07, 5), GEM, [x2, 0.05, z2], { rotation: [R() * 30, 0, -R() * 30] }), 1.4);
  }

  // votive candles left at the foot of the stone: a warm accent against the cool blue
  for (const [ca, n] of [[338, 5], [24, 4]] as const) {
    const [cx0, , cz0] = sp(0.86, ca, 0);
    put(new THREE.CylinderGeometry(0.075, 0.085, 0.014, 7), "#7b4a22", [cx0, 0.118, cz0]);
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * 360 + ca;
      const rr = i === 0 ? 0 : 0.045;
      const h = 0.05 + R() * 0.09;
      const x = cx0 + rr * Math.sin(ang * DEG);
      const z = cz0 + rr * Math.cos(ang * DEG);
      put(new THREE.CylinderGeometry(0.012, 0.015, h, 6), i % 2 ? "#f3e6c0" : "#e9d3a0", [x, 0.125 + h / 2, z]);
      put(new THREE.SphereGeometry(0.0155, 5, 3), "#fff6dc", [x, 0.125 + h, z], { scale: [1, 0.4, 1] });
      glow(put(new THREE.ConeGeometry(0.0085, 0.032, 5), "#ffb030", [x, 0.125 + h + 0.017, z]), 1.6);
    }
  }

  // =============================================================== THE SWORD
  // ---- blade (built tip-up in sword coordinates, flipped so the tip points down)
  const keys: [number, number][] = [
    [0, 0.082],
    [0.14, 0.082],
    [0.17, 0.128],
    [0.23, 0.11],
    [0.34, 0.112],
    [0.37, 0.098],
    [0.4, 0.112],
    [0.5, 0.112],
    [0.53, 0.098],
    [0.56, 0.114],
    [0.6, 0.114],
  ].map((q): [number, number] => [q[0], q[1] * WS]);
  for (let i = 1; i <= 8; i++) {
    const u = i / 8;
    keys.push([0.6 + (BL - 0.6) * u, Math.max(0.114 * WS * Math.pow(1 - u, 0.7), 0.005)]);
  }
  /** Half width of the blade at distance yl from the guard. */
  const hwAt = (yl: number) => {
    for (let i = 0; i < keys.length - 1; i++) {
      if (yl <= keys[i + 1][0]) return keys[i][1] + ((keys[i + 1][1] - keys[i][1]) * (yl - keys[i][0])) / (keys[i + 1][0] - keys[i][0]);
    }
    return 0.005;
  };
  const SECTION: [number, number][] = [
    [1, 0],
    [0.74, 0.5],
    [0.46, 1],
    [0.32, 0.6],
    [-0.32, 0.6],
    [-0.46, 1],
    [-0.74, 0.5],
    [-1, 0],
  ];
  const TMAX = 0.03;
  const point = (st: [number, number], k: number, side: number) => {
    const [fx, fz] = SECTION[k];
    const t = TMAX * Math.min(1, Math.max(0.12, st[1] / 0.09));
    return new THREE.Vector3(fx * st[1], st[0], side * fz * t);
  };
  const bladeShade = (dark: string, light: string, seed: number, pin = false) =>
    paint((p, n) => {
      const d = n.x * 0.75 + Math.abs(n.z) * 0.35 + n.y * 0.2;
      const yl = YB - p.y;
      let c = mix(dark, light, smoothstep(-0.35, 0.55, d));
      c = mix(c, "#27407a", smoothstep(0.4, 0.0, yl) * 0.28);
      c = mix(c, "#ffffff", smoothstep(0.85, 1.05, yl) * 0.18);
      const sc = noise(new THREE.Vector3(p.x * 9, p.y * 0.7, p.z * 9), 0.06, seed);
      if (sc > 0.72) c = mix(c, "#ffffff", 0.2);
      else if (sc < 0.16) c = mix(c, "#1e3260", 0.2);
      if (pin) {
        const f = Math.abs(p.x) / hwAt(yl);
        if (Math.abs(f - 0.6) < 0.028 && yl > 0.17) c = mix(c, "#ffdc70", 0.85);
      }
      return c;
    });
  const bladeBevel = bladeShade("#6a86b8", "#e6f2ff", 21);
  const bladeFlat = bladeShade("#233f78", "#74a0dc", 22, true);
  const bladeWall = shaded("#6d3a12", "#d89a1c", "#fff0a0", 23, "#fff8d0");
  const bladeFuller = paint((p) => {
    const yl = YB - p.y;
    return mix("#16295a", "#2c63b0", smoothstep(0.9, 0.15, yl) * 0.7 + noise(p, 0.05, 24) * 0.3);
  });
  const bandKind = [bladeBevel, bladeFlat, bladeWall, bladeFuller, bladeWall, bladeFlat, bladeBevel];
  for (const side of [1, -1]) {
    for (let j = 0; j < 7; j++) {
      const pos: number[] = [];
      const push = (...v: THREE.Vector3[]) => v.forEach((q) => pos.push(q.x, q.y, q.z));
      for (let i = 0; i < keys.length - 1; i++) {
        const a0 = point(keys[i], j, side);
        const b0 = point(keys[i], j + 1, side);
        const a1 = point(keys[i + 1], j, side);
        const b1 = point(keys[i + 1], j + 1, side);
        if (side === 1) push(a0, a1, b0, a1, b1, b0);
        else push(a0, b0, a1, a1, b0, b1);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.rotateZ(Math.PI);
      g.translate(0, YB, 0);
      b.part(g, bandKind[j], { bone: root, at: [0, 0, 0], flat: true, name: `blade.${side > 0 ? "f" : "b"}${j}` });
    }
  }

  // runes in the fuller, both faces
  const runeY = YB - 0.41;
  const runeZ = TMAX * 0.6 + 0.0015;
  for (const side of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.068, 0.38), "#ffffff", {
        bone: root,
        at: [0, runeY, side * runeZ],
        dir: [0, 0, side],
        axis: "z",
        texture: RUNE_COLUMN,
      }),
      1.5,
    );
  }

  // gold plate over the ricasso with a gem, one per face
  const plate: OutlinePoint[] = [[-0.07, 0], [0.07, 0], [0.078, 0.1], [0, 0.18, "sharp"], [-0.078, 0.1]];
  b.extrude(plate, { at: [0, YB, 0], x: [1, 0, 0], y: [0, -1, 0], thickness: 0.08, bevel: 0.012, color: GOLD, bone: root });
  for (const side of [1, -1]) glow(put(new THREE.OctahedronGeometry(0.02, 0), GEM, [0, YB - 0.08, side * 0.043], { scale: [0.8, 1.4, 0.6] }), 1.6);

  // ---- crossguard
  const wingBase: OutlinePoint[] = [
    [0.05, -0.05],
    [0.13, -0.055],
    [0.2, -0.1, "sharp"],
    [0.215, -0.045],
    [0.27, -0.01],
    [0.33, 0.05],
    [0.375, 0.17, "sharp"],
    [0.31, 0.115],
    [0.24, 0.08],
    [0.17, 0.06],
    [0.05, 0.06],
  ];
  const wing = wingBase.map((q): OutlinePoint => (q[2] ? [q[0] * GS, q[1] * GS, "sharp"] : [q[0] * GS, q[1] * GS]));
  const cx = 0.2 * GS;
  const cy = 0.03 * GS;
  const inset = (k: number): OutlinePoint[] =>
    wing.map((q): OutlinePoint => {
      const x = cx + (q[0] - cx) * k;
      const y = cy + (q[1] - cy) * k;
      return q[2] ? [x, y, "sharp"] : [x, y];
    });
  const wingGold = paint((p, n, s) => {
    let c = GOLD.at(p, n);
    if (Math.abs(n.z) > 0.6) {
      const r = Math.hypot(s[0] - 0.04 * GS, s[1] + 0.02);
      const f = r / 0.03;
      if (r > 0.1 && f - Math.floor(f) < 0.14) c = mix(c, "#5a2c0a", 0.65);
    }
    return c;
  });
  const rivets: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    b.extrude(wing, { at: [0, YG, 0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.07, bevel: 0.016, color: wingGold, bone: root });
    b.extrude(inset(0.55), { at: [0, YG, 0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.078, bevel: 0.006, color: IRON, bone: root });
    for (const side of [1, -1]) {
      glow(
        b.part(new THREE.PlaneGeometry(0.056, 0.056), "#ffffff", {
          bone: root,
          at: [s * 0.215 * GS, YG + 0.025 * GS, side * 0.0405],
          dir: [0, 0, side],
          axis: "z",
          texture: PLAQUES[(s > 0 ? 1 : 5) + (side > 0 ? 0 : 1)],
        }),
        1.2,
      );
    }
    for (const q of [[0.1, -0.04], [0.15, 0.045], [0.28, 0.06], [0.33, 0.115], [0.215, -0.07], [0.3, 0.015]]) {
      for (const side of [1, -1]) rivets.push(new THREE.SphereGeometry(0.0095, 5, 3).translate(s * q[0] * GS, YG + q[1] * GS, side * 0.0365));
    }
    put(new THREE.ConeGeometry(0.027, 0.085, 5), GOLD, [s * 0.378 * GS, YG + 0.205 * GS, 0], { rotation: [0, 0, -s * 6] });
    put(new THREE.ConeGeometry(0.022, 0.06, 5), GOLD, [s * 0.2 * GS, YG - 0.125 * GS, 0], { rotation: [0, 0, 180 + s * 3] });
  }
  b.part(mergeGeometries(rivets), GOLD_D, { bone: root, at: [0, 0, 0], flat: true, name: "rivets.guard" });

  // central heart plate with gems
  const heart = ([[-0.09, -0.1], [0.09, -0.1], [0.115, -0.01], [0.092, 0.1], [0, 0.145, "sharp"], [-0.092, 0.1], [-0.115, -0.01]] as OutlinePoint[]).map(
    (q): OutlinePoint => (q[2] ? [q[0] * GS, q[1] * GS, "sharp"] : [q[0] * GS, q[1] * GS]),
  );
  b.extrude(heart, { at: [0, YG, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.12, bevel: 0.026, color: GOLD, bone: root });
  const heartIn = heart.map((q): OutlinePoint => (q[2] ? [q[0] * 0.62, q[1] * 0.62 + 0.014, "sharp"] : [q[0] * 0.62, q[1] * 0.62 + 0.014]));
  b.extrude(heartIn, { at: [0, YG, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.13, bevel: 0.012, color: IRON, bone: root });
  for (const side of [1, -1]) {
    glow(put(new THREE.OctahedronGeometry(0.04, 0), GEM, [0, YG + 0.014, side * 0.074], { scale: [0.9, 1.5, 0.7] }), 1.8);
    for (const q of [[-0.075, -0.07], [0.075, -0.07], [-0.088, 0.04], [0.088, 0.04]])
      put(new THREE.SphereGeometry(0.011, 5, 3), GOLD_D, [q[0] * GS, YG + q[1] * GS, side * 0.0625]);
  }
  // blade collar under the guard, with teeth
  put(new THREE.BoxGeometry(0.22, 0.032, 0.1), IRON, [0, YG - 0.125, 0]);
  for (const s of [1, -1]) put(new THREE.ConeGeometry(0.022, 0.055, 4), GOLD, [s * 0.1, YG - 0.14, 0], { rotation: [0, 45, 180 + s * 14] });

  // ---- grip: wrapped leather with spiral straps
  const gripPaint = paint((p, n, s) => {
    const u = s[1] / 360 + (s[0] * GRIP_LEN) / 0.06;
    const f = u - Math.floor(u);
    const lit = smoothstep(-0.4, 0.9, n.dot(KEY));
    let c = mix(mix("#2f160a", "#7d3d1a", lit), "#c0773a", smoothstep(0.65, 1, lit) * (0.5 - Math.abs(f - 0.5)));
    c = mix(c, "#1b0b05", 0.25 * noise(p, 0.02, 9));
    if (f < 0.1) c = mix("#150803", "#3a1a0c", lit);
    return c;
  });
  b.rod([0, GRIP_BOT, 0], [0, GRIP_TOP, 0], 0.038, { sides: 8, color: gripPaint, bone: root, caps: "flat", name: "grip" });
  for (const [y, h] of [[GRIP_BOT - 0.012, 0.03], [GRIP_TOP - 0.02, 0.03], [(GRIP_BOT + GRIP_TOP) / 2 - 0.012, 0.024]] as const)
    lathe([[0.035, 0], [0.054, 0], [0.054, h], [0.035, h]], [0, y, 0], GOLD, 8);
  // cloth knot and two ribbon tails
  lathe([[0.035, 0], [0.05, 0.006], [0.05, 0.046], [0.035, 0.05]], [0, GRIP_TOP - 0.1, 0], CLOTH, 8);
  for (const s of [1, -1]) {
    const tie = GRIP_TOP - 0.065;
    const path = catmull([
      [s * 0.036, tie, 0],
      [s * 0.075, tie - 0.05, s * 0.04],
      [s * 0.09, tie - 0.13, s * 0.08],
      [s * 0.125, tie - 0.22, s * 0.075],
      [s * 0.12, tie - 0.31, s * 0.115],
      [s * 0.155, tie - 0.39, s * 0.125],
    ]);
    b.sweep(path, (t) => [0.028 + 0.012 * t, 0.003], { section: "box", color: CLOTH, caps: "flat", bone: root, name: `ribbon${s > 0 ? "L" : "R"}` });
    const end = path.at(1);
    put(new THREE.SphereGeometry(0.015, 6, 5), GOLD, [end.x, end.y - 0.012, end.z]);
  }

  // ---- pommel: collar, iron orb in gold rings, crown and gem
  lathe([[0, 0], [0.058, 0], [0.076, 0.014], [0.076, 0.032], [0.055, 0.05], [0, 0.05]], [0, GRIP_TOP, 0], GOLD, 8);
  const orbY = GRIP_TOP + 0.05 + 0.08;
  put(new THREE.SphereGeometry(0.078 * PS, 8, 6), IRON, [0, orbY, 0], { rotation: [0, 22.5, 0] });
  put(new THREE.TorusGeometry(0.083 * PS, 0.012, 5, 12), GOLD, [0, orbY, 0], { rotation: [90, 0, 0] });
  put(new THREE.TorusGeometry(0.083 * PS, 0.012, 5, 12), GOLD, [0, orbY, 0]);
  put(new THREE.TorusGeometry(0.083 * PS, 0.01, 5, 12), GOLD_D, [0, orbY, 0], { rotation: [0, 90, 0] });
  for (const side of [1, -1]) glow(put(new THREE.OctahedronGeometry(0.032, 0), GEM, [0, orbY, side * 0.092], { scale: [1, 1.5, 0.7] }), 1.8);
  lathe([[0, 0], [0.05, 0], [0.036, 0.034], [0, 0.08]], [0, orbY + 0.082, 0], GOLD, 6, 0);
  glow(put(new THREE.OctahedronGeometry(0.022, 0), GEM, [0, orbY + 0.175, 0], { scale: [1, 1.6, 1] }), 1.8);

  return b.root;
}
