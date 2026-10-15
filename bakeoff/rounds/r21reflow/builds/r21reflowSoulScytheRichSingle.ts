import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull, bezier, polyline } from "../../../../src/path";
import { grain, mottle, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A towering scythe carved from dragon vertebrae and rib bone, with a hollow-windowed blade, a glowing teal soul-edge, leather wraps, tattered shrouds, a hanging charm and a rune plinth.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const BONE = "#e0d4b4";
const BONE_D = "#8f8266";
const TEAL = "#2ef0d4";
const TEAL_PALE = "#b8fff0";
const TEAL_D = "#0f5f70";
const PURPLE = "#6a3a86";
const LEATHER = "#2d1e2b";
const BRASS = "#b8914a";
const STONE = "#5b5a68";
const STONE_D = "#3b3a48";

const BONE_PAINT = cel(grain(BONE, "#cabd9c", { size: 0.012, axis: "y" }), "#8a7d9a");
const BONE_PLAIN = cel(BONE, "#9a8f9a");
const BONE_DARK = cel(BONE_D, "#5a5068");
const LEATHER_PAINT = cel(LEATHER, INK);
const BRASS_PAINT = cel(BRASS, "#6a4a3a");
const STONE_PAINT = cel(mottle(STONE, STONE_D, { size: 0.12, seed: 4 }), "#2a2a3c");
const BLADE_PAINT = cel(
  paint((_p, _n, s) => (s[0] > 0.95 ? TEAL_PALE : s[0] > 0.8 ? "#bfe3d6" : BONE)),
  "#7d8aa0",
);

const CLOTH = svg(
  `<svg viewBox="0 0 40 120"><path d="M4 0 H36 L34 40 L38 72 L30 120 L24 82 L18 104 L12 60 L6 92 L2 42 Z" fill="#3b2447"/><path d="M10 6 L12 60 M22 6 L24 80 M31 6 L33 50" stroke="#6a3a86" stroke-width="2" fill="none"/></svg>`,
  { size: 128 },
);
const WISP = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 64 C2 50 6 34 14 24 C10 34 18 36 18 24 C20 14 14 8 20 0 C26 14 32 30 28 46 C26 56 22 62 16 64 Z" fill="#2ef0d4"/><path d="M16 62 C10 52 14 42 18 34 C20 44 24 48 16 62 Z" fill="#c8fff4"/></svg>`,
  { size: 128 },
);
const WISP_P = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 64 C4 48 8 34 14 22 C12 34 20 34 20 22 C20 12 16 8 22 0 C28 16 30 32 28 46 C26 56 22 62 16 64 Z" fill="#9a5ad6"/></svg>`,
  { size: 128 },
);
const RUNES = svg(
  `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="94" fill="none" stroke="#2ef0d4" stroke-width="3"/><circle cx="100" cy="100" r="70" fill="none" stroke="#2ef0d4" stroke-width="2.5"/><circle cx="100" cy="100" r="30" fill="none" stroke="#2ef0d4" stroke-width="2.5"/><path d="M100 10 L100 190 M10 100 L190 100 M36 36 L164 164 M164 36 L36 164" stroke="#2ef0d4" stroke-width="2" fill="none"/><path d="M100 40 L112 56 L100 72 L88 56 Z M100 128 L112 144 L100 160 L88 144 Z M40 100 L56 88 L72 100 L56 112 Z M128 100 L144 88 L160 100 L144 112 Z" fill="#2ef0d4"/></svg>`,
  { size: 512 },
);

export default function build() {
  const b = createBuilder({ name: "soulScythe" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const charm = b.joint("charm", { parent: root, at: [-0.07, 1.66, 0.04], dir: [0, -1, 0], role: "hinge" });
  const r = rng(11);

  const P = (geo: THREE.BufferGeometry, color: string | ReturnType<typeof cel>, at: number[], opts: Record<string, unknown> = {}) =>
    b.part(geo, color, { bone: root, at, ...opts });

  // ---- plinth
  P(new THREE.CylinderGeometry(0.4, 0.44, 0.06, 12), STONE_PAINT, [0, 0.03, 0], { flat: true });
  P(new THREE.CylinderGeometry(0.3, 0.32, 0.02, 12), cel(STONE, STONE_D), [0, 0.07, 0], { flat: true });
  glow(
    P(new THREE.PlaneGeometry(0.56, 0.56), "#ffffff", [0, 0.0815, 0], { dir: [0, 1, 0], axis: "z", texture: RUNES }),
    1.2,
  );
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    P(new THREE.BoxGeometry(0.07, 0.05, 0.05), STONE_PAINT, [Math.cos(a) * 0.4, 0.07, Math.sin(a) * 0.4], {
      rotation: [0, -(a * 180) / Math.PI, 0],
      flat: true,
    });
    glow(
      P(new THREE.BoxGeometry(0.012, 0.022, 0.012), TEAL, [Math.cos(a) * 0.43, 0.075, Math.sin(a) * 0.43], {
        rotation: [0, -(a * 180) / Math.PI, 0],
      }),
      1.4,
    );
  }

  // ---- shaft
  const shaftPath = catmull([
    [0, 0.3, 0],
    [-0.07, 0.62, 0],
    [-0.02, 0.95, 0],
    [0.09, 1.25, 0],
    [0.05, 1.55, 0],
    [0.0, 1.76, 0],
  ]);
  b.sweep(shaftPath, [0.034, 0.029, 0.027, 0.03, 0.036], BONE_PAINT, { bone: root, sides: 8, caps: "flat" });
  // vertebra discs and spikes
  for (let i = 0; i < 16; i++) {
    const t = 0.06 + (i / 15) * 0.86;
    const p = shaftPath.at(t);
    const T = shaftPath.tangentAt(t);
    const rr = 0.042 - 0.006 * Math.abs(t - 0.4);
    P(new THREE.CylinderGeometry(rr, rr, 0.016, 8), BONE_DARK, [p.x, p.y, p.z], { dir: [T.x, T.y, T.z] });
    if (i % 2 === 0) {
      b.spike([p.x, p.y, p.z + 0.03], [0.15 * T.x, 0.15 * T.y + 0.1, 1], 0.075, 0.016, BONE_PLAIN, { bone: root, sides: 5 });
      b.spike([p.x, p.y, p.z - 0.03], [0.15 * T.x, 0.15 * T.y + 0.1, -1], 0.06, 0.013, BONE_PLAIN, { bone: root, sides: 5 });
    }
  }
  // rune diamonds
  for (const t of [0.18, 0.26, 0.5, 0.58, 0.78, 0.86]) {
    const p = shaftPath.at(t);
    glow(
      P(new THREE.OctahedronGeometry(0.015), TEAL, [p.x, p.y, p.z + 0.032], { scale: [1, 1.7, 0.35] }),
      1.4,
    );
  }
  // leather wraps
  for (const base of [0.3, 0.64]) {
    for (let k = 0; k < 3; k++) {
      const t = base + k * 0.035;
      const p = shaftPath.at(t);
      const T = shaftPath.tangentAt(t);
      const ringItems = b.ring(frame([p.x, p.y, p.z], [T.x + (k - 1) * 0.25, T.y, T.z]), { count: 10, radius: 0.04 }).items;
      b.sweep(catmull(ringItems, { closed: true }), 0.011, LEATHER_PAINT, { bone: root, sides: 5 });
    }
    const p = shaftPath.at(base + 0.035);
    b.rod([p.x - 0.045, p.y - 0.045, p.z + 0.02], [p.x + 0.045, p.y + 0.045, p.z + 0.02], 0.007, BRASS_PAINT, { bone: root, sides: 5 });
    P(new THREE.BoxGeometry(0.05, 0.05, 0.012), BRASS_PAINT, [p.x, p.y, p.z + 0.048], { rotation: [0, 0, 45], flat: true });
    glow(P(new THREE.OctahedronGeometry(0.012), TEAL, [p.x, p.y, p.z + 0.056], { scale: [1, 1, 0.4] }), 1.4);
  }
  // cloth tassels
  const tassel = [0.34, 0.68, 0.5].map((t) => {
    const p = shaftPath.at(t);
    return frame([p.x + 0.02, p.y, p.z + 0.035], [0, 1, 0]);
  });
  b.cards(tassel, CLOTH, { size: [0.09, 0.3], lean: 180, flow: [0, 0, 1], bone: root, vary: 0.2, rng: r, cross: true });

  // ---- head knot
  P(new THREE.SphereGeometry(0.075, 8, 6), BONE_PAINT, [0.01, 1.74, 0], { flat: true });
  b.ring(frame([0.01, 1.7, 0], [0, 1, 0]), { count: 6, radius: 0.06, tilt: -25 }, (it) =>
    b.spike(it, it, 0.11, 0.022, BONE_PLAIN, { bone: root, sides: 5 }),
  );
  P(new THREE.TorusGeometry(0.062, 0.012, 5, 10), BRASS_PAINT, [0.01, 1.68, 0], { rotation: [90, 0, 0] });

  // ---- blade
  const O = [0, 1.78];
  const w = (pts: number[][]) => pts.map(([x, y]) => [O[0] + x, O[1] + y, 0]);
  b.extrude(
    [
      [-0.3, -0.1, "sharp"],
      [-0.15, 0.05],
      [0.1, 0.13],
      [0.45, 0.16],
      [0.8, 0.07],
      [1.05, -0.15],
      [1.2, -0.5, "sharp"],
      [0.98, -0.33],
      [0.78, -0.17],
      [0.5, -0.07],
      [0.2, -0.04],
      [-0.02, -0.07],
      [-0.14, -0.1],
    ],
    { at: [O[0], O[1], 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.04, bevel: 0.006, smoothing: 1, color: BLADE_PAINT, bone: root },
  );
  // glowing soul edge
  glow(
    b.extrude(
      [
        [-0.02, -0.07],
        [0.2, -0.04],
        [0.5, -0.07],
        [0.78, -0.17],
        [0.98, -0.33],
        [1.17, -0.47, "sharp"],
        [0.97, -0.37],
        [0.77, -0.22],
        [0.5, -0.11],
        [0.2, -0.08],
        [-0.02, -0.11],
      ],
      { at: [O[0], O[1], 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014, color: TEAL, bone: root },
    ),
    1.6,
  );
  const spineP = polyline(w([[-0.15, 0.05], [0.1, 0.13], [0.45, 0.16], [0.8, 0.07], [1.05, -0.15]]));
  const innerP = polyline(w([[-0.02, -0.07], [0.2, -0.04], [0.5, -0.07], [0.78, -0.17], [0.98, -0.33]]));
  // windows
  [0.14, 0.3, 0.46, 0.62, 0.78].forEach((t, i) => {
    const a = spineP.at(t);
    const c = innerP.at(t);
    const m = a.clone().lerp(c, 0.5);
    const rad = 0.034 - i * 0.003;
    for (const z of [0.0215, -0.0215]) {
      P(new THREE.CylinderGeometry(rad, rad, 0.004, 8), cel(BONE_D, INK), [m.x, m.y, z], { dir: [0, 0, z > 0 ? 1 : -1] });
      glow(P(new THREE.CylinderGeometry(rad * 0.62, rad * 0.62, 0.004, 8), TEAL, [m.x, m.y, z * 1.12], { dir: [0, 0, z > 0 ? 1 : -1] }), 1.5);
    }
  });
  // ribs
  [0.22, 0.38, 0.54, 0.7, 0.86].forEach((t) => {
    const a = spineP.at(t);
    const c = innerP.at(t);
    const a2 = a.clone().lerp(c, 0.1);
    const c2 = a.clone().lerp(c, 0.9);
    for (const z of [0.022, -0.022]) {
      b.rod([a2.x, a2.y, z], [c2.x, c2.y, z], [0.011, 0.006], BONE_PLAIN, { bone: root, sides: 5 });
    }
  });
  // spine spikes
  for (let i = 0; i < 8; i++) {
    const t = 0.06 + i * 0.12;
    const p = spineP.at(t);
    const T = spineP.tangentAt(t);
    b.spike([p.x, p.y, 0], [-T.y + T.x * 0.5, T.x + T.y * 0.5, 0], 0.08 - i * 0.004, 0.02, BONE_PLAIN, { bone: root, sides: 5 });
  }
  // inner teeth
  for (let i = 0; i < 11; i++) {
    const t = 0.04 + i * 0.09;
    const p = innerP.at(t);
    const T = innerP.tangentAt(t);
    b.spike([p.x, p.y, 0], [T.y + T.x * 0.45, -T.x + T.y * 0.45, 0], 0.075 - i * 0.003, 0.015, BONE_PLAIN, { bone: root, sides: 5, caps: { start: "flat", end: "point" } });
  }
  // back horn ridge and tip
  b.spike([O[0] - 0.28, O[1] - 0.1, 0], [-0.4, -0.5, 0], 0.14, 0.012, BONE_DARK, { bone: root, sides: 5 });
  // dragon-claw cluster on the blade root
  for (const z of [0.05, -0.05]) {
    b.spike([0.0, 1.8, z], [-0.7, 0.75, z * 5], 0.24, 0.03, BONE_PLAIN, { bone: root, sides: 5 });
  }
  // wisps
  const wispFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 12; i++) {
    const t = 0.05 + i * 0.08;
    const p = spineP.at(t);
    wispFrames.push(frame([p.x, p.y + 0.02, 0], [0, 1, 0]));
  }
  glow(b.cards(wispFrames, [WISP, WISP, WISP_P], { size: [0.07, 0.17], lean: 35, flow: [1, 0, 0], cross: true, vary: 0.3, rng: r, bone: root }), 1.3);
  const edgeFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 9; i++) {
    const p = innerP.at(0.1 + i * 0.1);
    edgeFrames.push(frame([p.x, p.y - 0.05, 0], [0, -1, 0]));
  }
  glow(b.cards(edgeFrames, [WISP, WISP_P], { size: [0.05, 0.1], lean: 30, flow: [1, 0, 0], cross: true, vary: 0.3, rng: r, bone: root }), 1.3);

  // ---- butt end
  b.spike([0, 0.3, 0], [0, -1, 0], 0.22, 0.045, BONE_PLAIN, { bone: root, sides: 6 });
  glow(P(new THREE.SphereGeometry(0.058, 8, 6), TEAL, [0, 0.31, 0], { flat: true }), 1.6);
  P(new THREE.TorusGeometry(0.07, 0.012, 5, 10), BRASS_PAINT, [0, 0.31, 0], { rotation: [80, 0, 0] });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.4;
    const c = Math.cos(a);
    const s = Math.sin(a);
    b.sweep(bezier([0.03 * c, 0.33, 0.03 * s], [0.2 * c, 0.42, 0.2 * s], [0.28 * c, 0.17, 0.28 * s]), [0.036, 0], BONE_PAINT, {
      bone: root,
      sides: 5,
      caps: { start: "flat", end: "point" },
    });
  }

  // ---- hanging charm
  const chainTop = charm.at;
  P(new THREE.TorusGeometry(0.028, 0.006, 5, 8), BRASS_PAINT, [chainTop.x, chainTop.y, chainTop.z], { bone: charm });
  for (let i = 0; i < 4; i++) {
    P(new THREE.TorusGeometry(0.016, 0.004, 5, 8), BRASS_PAINT, [chainTop.x, chainTop.y - 0.04 - i * 0.032, chainTop.z], {
      bone: charm,
      rotation: [0, i % 2 ? 90 : 0, 0],
    });
  }
  glow(
    P(new THREE.OctahedronGeometry(0.035), TEAL, [chainTop.x, chainTop.y - 0.28, chainTop.z], { bone: charm, scale: [0.8, 1.8, 0.8], flat: true }),
    1.5,
  );
  P(new THREE.OctahedronGeometry(0.044), BONE_DARK, [chainTop.x, chainTop.y - 0.28, chainTop.z], { bone: charm, scale: [0.9, 2.1, 0.9], flat: true });

  return b.root;
}
