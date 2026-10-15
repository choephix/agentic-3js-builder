// Dragonbone soul scythe, League of Legends style: exaggerated crescent blade, saturated cyan soul-fire against
// bone ivory and plum, glowing runes, tattered cloth and a bone-claw pommel, standing on a runed plinth.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { gradient, mottle } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A giant dragonbone scythe with a fenestrated crescent blade edged in cyan soul-fire, vertebra shaft, leather wraps with runes, tattered shrouds, a hanging soul charm and a claw pommel on a runed plinth.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const BONE = "#e9dfc4";
const BONE_D = "#b8a888";
const DARK_BONE = "#6b5c4c";
const LEATHER = "#2b1d2c";
const PLUM = "#47305a";
const BRONZE = "#a38a52";
const CYAN = "#35f0e0";
const PURPLE = "#9a5cff";
const STONE = "#352e45";

export default function build() {
  const b = createBuilder({ name: "soulScythe", detail: 0.8 });
  const rand = rng(11);
  const root = b.joint("root", { at: [0, 0.06, 0] });
  const R = { bone: root };

  const boneCoat = cel(mottle(BONE, "#d2c4a0", { size: 0.07, contrast: 0.8 }));
  const boneDarkCoat = cel(mottle(BONE_D, "#8f7f66", { size: 0.06 }));
  const plumCoat = cel(PLUM);
  const leatherCoat = cel(LEATHER);
  const stoneCoat = cel(mottle(STONE, "#2a2438", { size: 0.08 }));
  const bladePaint = cel(
    gradient(
      mottle(BONE, "#d9ccab", { size: 0.09 }),
      mottle("#a6dedb", "#7fc0ca", { size: 0.1 }),
      [0.5, 2.1, 0],
      [1.3, 1.35, 0],
    ),
  );

  // ---------- textures ----------
  const rune = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 3 L16 29 M16 10 L24 16 M16 18 L8 12 M10 24 L22 24" stroke="#5ffcee" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`,
    { size: 128 },
  );
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return `M${100 + c * 60} ${100 + s * 60} L${100 + c * 72} ${100 + s * 72}`;
  }).join(" ");
  const circleTex = svg(
    `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="94" fill="none" stroke="#35f0e0" stroke-width="3"/><circle cx="100" cy="100" r="80" fill="none" stroke="#35f0e0" stroke-width="2.5"/><path d="${ticks}" stroke="#35f0e0" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M100 36 L150 124 L50 124 Z M100 164 L50 76 L150 76 Z" stroke="#35f0e0" stroke-width="2.5" fill="none"/></svg>`,
    { size: 512 },
  );
  const wispCyan = svg(
    `<svg viewBox="0 0 40 80"><path d="M20 78 C6 60 8 40 18 24 C22 16 20 8 24 2 C30 16 38 30 34 50 C32 64 28 72 20 78Z" fill="#35f0e0"/><path d="M20 74 C14 60 16 46 21 34 C26 46 28 60 20 74Z" fill="#d8fffb"/></svg>`,
    { size: 128 },
  );
  const wispPurple = svg(
    `<svg viewBox="0 0 40 80"><path d="M20 78 C6 60 8 40 18 24 C22 16 20 8 24 2 C30 16 38 30 34 50 C32 64 28 72 20 78Z" fill="#8a4cff"/><path d="M20 74 C14 60 16 46 21 34 C26 46 28 60 20 74Z" fill="#d9c2ff"/></svg>`,
    { size: 128 },
  );

  // ---------- plinth ----------
  b.lathe(
    [
      [0, 0],
      [0.38, 0],
      [0.38, 0.04],
      [0.32, 0.06],
      [0.3, 0.12],
      [0, 0.12],
    ],
    { at: [0, 0, 0], segments: 10, color: stoneCoat, name: "plinth", ...R },
  );
  glow(
    b.part(new THREE.TorusGeometry(0.368, 0.008, 4, 30), CYAN, {
      at: [0, 0.035, 0],
      dir: [0, 1, 0],
      axis: "z",
      name: "plinthGlow",
      ...R,
    }),
    1.2,
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.56, 0.56), "#ffffff", {
      at: [0, 0.1215, 0],
      dir: [0, 1, 0],
      up: [0, 0, -1],
      axis: "z",
      texture: circleTex,
      name: "plinthRunes",
      ...R,
    }),
    1.2,
  );
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 + 0.3;
    const c = Math.cos(a);
    const s = Math.sin(a);
    b.spike([0.3 * c, 0.115, 0.3 * s], [c * 0.5, 1, s * 0.5], 0.12, 0.028, BONE_D, { ...R });
  }

  // ---------- shaft ----------
  const SH = catmull([
    [0, 0.28, 0],
    [0.05, 0.6, 0],
    [0.19, 0.95, 0],
    [0.27, 1.2, 0],
    [0.22, 1.5, 0],
    [0.13, 1.76, 0],
    [0.1, 1.9, 0],
  ]);
  const shaft = b.sweep(SH, [0.048, 0.044, 0.04, 0.042, 0.046, 0.05], { color: boneCoat, name: "shaft", ...R });

  for (let i = 0; i < 12; i++) {
    const t = 0.08 + i * 0.075;
    const p = SH.at(t);
    const T = SH.tangentAt(t);
    b.part(new THREE.CylinderGeometry(0.064, 0.064, 0.02, 8), boneDarkCoat, { at: p, dir: T, ...R });
    const nx = -T.y;
    const ny = T.x;
    const base = new THREE.Vector3(p.x + nx * 0.04, p.y + ny * 0.04, 0);
    b.spike(base, [nx * 0.8 + T.x * 0.4, ny * 0.8 + T.y * 0.4, 0], 0.075, 0.02, BONE, { ...R });
  }

  const wrap = (t0: number, count: number) => {
    for (let k = 0; k < count; k++) {
      const t = t0 + k * 0.013;
      b.part(new THREE.TorusGeometry(0.055, 0.011, 5, 12), leatherCoat, {
        at: SH.at(t),
        dir: SH.tangentAt(t),
        axis: "z",
        ...R,
      });
    }
  };
  wrap(0.3, 4);
  wrap(0.76, 4);
  wrap(0.05, 2);
  wrap(0.93, 2);

  for (const t of [0.34, 0.8]) {
    const p = SH.at(t);
    const T = SH.tangentAt(t);
    b.part(new THREE.BoxGeometry(0.052, 0.058, 0.012), BRONZE, {
      at: [p.x, p.y, 0.052],
      dir: T,
      up: [0, 0, 1],
      ...R,
    });
    glow(
      b.part(new THREE.PlaneGeometry(0.035, 0.04), "#ffffff", {
        at: [p.x, p.y, 0.0585],
        dir: [0, 0, 1],
        up: T,
        axis: "z",
        texture: rune,
        ...R,
      }),
    );
  }
  for (const t of [0.14, 0.47, 0.56, 0.64, 0.9]) {
    const p = SH.at(t);
    const T = SH.tangentAt(t);
    glow(
      b.decal(shaft, rune, {
        at: p,
        dir: [0, 0, 1],
        up: T,
        size: [0.04, 0.06],
        ...R,
      }),
    );
  }

  // ---------- blade ----------
  const spine = catmull([
    [-0.14, 1.9, 0],
    [0.08, 2.07, 0],
    [0.5, 2.15, 0],
    [0.92, 2.06, 0],
    [1.2, 1.82, 0],
    [1.34, 1.52, 0],
    [1.37, 1.18, 0],
  ]);
  const wd = (t: number) => 0.26 * Math.pow(1 - t, 0.75);
  const pn = (t: number, k: number, z = 0) => {
    const p = spine.at(t);
    const T = spine.tangentAt(t);
    const w = wd(t) * k;
    return new THREE.Vector3(p.x + T.y * w, p.y - T.x * w, z);
  };

  const N = 28;
  const outline: OutlinePoint[] = [];
  for (let i = 0; i <= N; i++) {
    const p = pn(i / N, 0);
    outline.push(i === 0 || i === N ? [p.x, p.y, "sharp"] : [p.x, p.y]);
  }
  for (let i = N - 1; i >= 0; i--) {
    const p = pn(i / N, 1);
    outline.push(i === 0 ? [p.x, p.y, "sharp"] : [p.x, p.y]);
  }
  b.extrude(outline, {
    at: [0, 0, 0],
    x: [1, 0, 0],
    thickness: 0.028,
    bevel: 0.005,
    color: bladePaint,
    name: "blade",
    ...R,
  });

  // glowing soul-fire edge band
  const band: OutlinePoint[] = [];
  const M = 24;
  for (let i = 0; i <= M; i++) {
    const p = pn(0.04 + (0.93 * i) / M, 0.8);
    band.push([p.x, p.y]);
  }
  for (let i = M; i >= 0; i--) {
    const p = pn(0.04 + (0.93 * i) / M, 1.0);
    band.push([p.x, p.y]);
  }
  glow(
    b.extrude(band, {
      at: [0, 0, 0],
      x: [1, 0, 0],
      thickness: 0.036,
      color: CYAN,
      name: "bladeEdge",
      ...R,
    }),
    1.4,
  );

  // bone spine along the back
  b.sweep(spine, (t) => [0.034 * (1 - t) + 0.01, 0.045 * (1 - t) + 0.008], {
    color: boneCoat,
    name: "bladeSpine",
    ...R,
  });

  // outer barbs
  for (let i = 0; i < 9; i++) {
    const t = 0.12 + i * 0.075;
    const p = spine.at(t);
    const T = spine.tangentAt(t);
    const dir: [number, number, number] = [T.y * -0.6 - T.x * 0.9, T.x * 0.6 - T.y * 0.9, 0];
    b.spike(p, dir, 0.13 * (1 - t) + 0.05, 0.022 * (1 - t) + 0.01, boneCoat, { ...R });
  }
  // inner teeth over the soul-fire
  for (let i = 1; i <= 14; i++) {
    const t = 0.05 + i * 0.062;
    const base = pn(t, 0.95);
    const T = spine.tangentAt(t);
    const len = 0.1 * (1 - t) + 0.035;
    const nx = T.y;
    const ny = -T.x;
    const tip = new THREE.Vector3(base.x + nx * len + T.x * 0.05, base.y + ny * len + T.y * 0.05, 0);
    b.spike(base, tip, null, 0.02 * (1 - t) + 0.01, BONE, { ...R });
  }

  // fenestrations: dark windows rimmed with cyan, both faces
  for (const t of [0.12, 0.23, 0.34, 0.45, 0.56, 0.67]) {
    const p = pn(t, 0.4);
    const T = spine.tangentAt(t);
    const sx = wd(t) * 0.22;
    const sz = 0.07 * (1 - t) + 0.03;
    for (const s of [1, -1]) {
      glow(
        b.part(new THREE.CylinderGeometry(1, 1, 0.004, 10), CYAN, {
          at: [p.x, p.y, s * 0.0152],
          dir: [0, 0, s],
          up: [T.x, T.y, 0],
          scale: [sx * 1.45, 1, sz * 1.4],
          ...R,
        }),
        1.3,
      );
      b.part(new THREE.CylinderGeometry(1, 1, 0.004, 10), INK, {
        at: [p.x, p.y, s * 0.0168],
        dir: [0, 0, s],
        up: [T.x, T.y, 0],
        scale: [sx, 1, sz],
        ...R,
      });
    }
  }
  // face ridge lines
  for (const s of [1, -1]) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 8; i++) pts.push(pn(0.03 + i * 0.12, 0.65, s * 0.017));
    b.sweep(catmull(pts), [0.012, 0.003], { color: boneDarkCoat, caps: "point", ...R });
  }

  // ---------- head knot, horns ----------
  const knot = new THREE.Vector3(0.1, 1.88, 0);
  b.part(new THREE.IcosahedronGeometry(0.105, 0), boneCoat, { at: knot, flat: true, ...R });
  glow(
    b.part(new THREE.OctahedronGeometry(0.04, 0), CYAN, {
      at: [0.1, 1.88, 0.09],
      scale: [0.7, 1.1, 0.6],
      ...R,
    }),
    1.5,
  );
  for (const a of [95, 150, 205, 255]) {
    const r = (a * Math.PI) / 180;
    const d: [number, number, number] = [Math.cos(r), Math.sin(r), 0];
    b.spike([knot.x + d[0] * 0.08, knot.y + d[1] * 0.08, 0], d, 0.17, 0.03, BONE, { ...R });
  }
  for (const sz of [1, -1])
    b.spike([knot.x, knot.y + 0.03, sz * 0.07], [0, 0.3, sz], 0.13, 0.026, BONE_D, { ...R });

  b.sweep(
    catmull([
      [0.05, 2.0, 0],
      [-0.12, 2.12, 0],
      [-0.34, 2.1, 0],
      [-0.48, 1.99, 0],
    ]),
    [0.045, 0],
    { color: plumCoat, caps: { start: "round", end: "point" }, name: "darkHorn", ...R },
  );
  b.sweep(
    catmull([
      [0.0, 1.82, 0],
      [-0.2, 1.78, 0],
      [-0.32, 1.64, 0],
    ]),
    [0.04, 0],
    { color: boneDarkCoat, caps: { start: "round", end: "point" }, name: "lowHorn", ...R },
  );

  // ---------- pommel ----------
  b.part(new THREE.IcosahedronGeometry(0.075, 1), boneCoat, { at: [0, 0.3, 0], scale: [1, 1.2, 1], ...R });
  glow(
    b.part(new THREE.TorusGeometry(0.1, 0.011, 5, 16), CYAN, {
      at: [0, 0.33, 0],
      rotation: [75, 0, 15],
      ...R,
    }),
    1.3,
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.04, 0), CYAN, { at: [0, 0.31, 0.07], scale: [0.7, 1, 0.5], ...R }),
    1.5,
  );
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.03, 0.3, 0],
        [s * 0.13, 0.25, 0],
        [s * 0.22, 0.34, 0],
        [s * 0.2, 0.5, 0],
      ]),
      [0.04, 0],
      { color: boneCoat, caps: { start: "round", end: "point" }, ...R },
    );
    b.sweep(
      catmull([
        [s * 0.03, 0.29, 0],
        [s * 0.15, 0.22, 0],
        [s * 0.2, 0.15, 0],
      ]),
      [0.03, 0],
      { color: boneDarkCoat, caps: { start: "round", end: "point" }, ...R },
    );
    b.sweep(
      catmull([
        [0, 0.3, s * 0.04],
        [0, 0.27, s * 0.13],
        [0, 0.36, s * 0.2],
      ]),
      [0.03, 0],
      { color: plumCoat, caps: { start: "round", end: "point" }, ...R },
    );
  }
  b.spike([0, 0.3, 0], [0, -1, 0], 0.2, 0.04, DARK_BONE, { ...R });

  // ---------- tattered shrouds ----------
  const tatter = (at: [number, number, number], yaw: number, sc: number) => {
    const o: OutlinePoint[] = (
      [
        [-0.04, 0],
        [0.04, 0],
        [0.05, -0.15],
        [0.035, -0.3],
        [0.045, -0.42],
        [0.02, -0.34],
        [0.0, -0.45],
        [-0.02, -0.33],
        [-0.045, -0.4],
        [-0.04, -0.28],
        [-0.05, -0.15],
      ] as Array<[number, number]>
    ).map(([x, y]) => [x * sc, y * sc]);
    b.extrude(o, { at, x: [Math.cos(yaw), 0, Math.sin(yaw)], thickness: 0.007, color: plumCoat, ...R });
  };
  const s33 = SH.at(0.33);
  const s8 = SH.at(0.8);
  tatter([s33.x, s33.y, 0.055], 0.2, 1.2);
  tatter([s8.x, s8.y, 0.055], -0.25, 1.0);
  tatter([0.1, 1.83, -0.07], 0.3, 1.3);
  tatter([0.18, 1.82, 0.07], -0.3, 1.0);

  // ---------- hanging soul charm ----------
  const cx = -0.05;
  const charm = b.chain(
    "charm",
    polyline([
      [cx, 1.82, 0.07],
      [cx, 1.72, 0.07],
      [cx, 1.62, 0.07],
      [cx, 1.52, 0.07],
    ]),
    { parent: root, names: ["charmA", "charmB", "charmC"], role: "hinge" },
  );
  b.rod([cx, 1.82, 0.07], [cx, 1.74, 0.07], 0.004, BRONZE, { bone: charm.joints[0] });
  b.part(new THREE.TorusGeometry(0.026, 0.005, 5, 10), BRONZE, { at: [cx, 1.71, 0.07], bone: charm.joints[1] });
  b.rod([cx, 1.69, 0.07], [cx, 1.58, 0.07], 0.004, BRONZE, { bone: charm.joints[1] });
  b.part(new THREE.ConeGeometry(0.03, 0.04, 6), BRONZE, { at: [cx, 1.57, 0.07], bone: charm.joints[2] });
  glow(
    b.part(new THREE.OctahedronGeometry(0.035, 0), CYAN, {
      at: [cx, 1.51, 0.07],
      scale: [0.7, 1.3, 0.7],
      bone: charm.joints[2],
    }),
    1.5,
  );

  // ---------- soul-fire wisps and motes ----------
  const edgeFrames = Array.from({ length: 16 }, (_, i) => {
    const t = 0.1 + i * 0.055;
    const T = spine.tangentAt(t);
    return frame(pn(t, 0.98), [T.y, -T.x, 0]);
  });
  glow(
    b.cards(edgeFrames, [wispCyan, wispCyan, wispPurple], {
      size: [0.07, 0.17],
      lean: 35,
      bend: 35,
      flow: [-1, 0.6, 0],
      vary: 0.35,
      spin: 10,
      rng: rand,
      ...R,
    }),
    1.2,
  );
  const backFrames = Array.from({ length: 8 }, (_, i) => {
    const t = 0.15 + i * 0.09;
    const T = spine.tangentAt(t);
    const p = spine.at(t);
    return frame(p, [-T.y, T.x, 0]);
  });
  glow(
    b.cards(backFrames, [wispPurple, wispCyan], {
      size: [0.06, 0.15],
      lean: 40,
      bend: 30,
      flow: [-1, 0.3, 0],
      vary: 0.3,
      rng: rand,
      ...R,
    }),
    1.1,
  );
  const motes: Array<[number, number, number]> = [
    [0.6, 1.8, 0.1],
    [0.95, 1.55, 0.12],
    [1.2, 1.3, -0.1],
    [0.35, 1.65, 0.15],
    [1.1, 2.2, 0.05],
    [-0.3, 2.0, 0.1],
    [0.2, 0.9, 0.2],
    [0.05, 0.55, -0.2],
  ];
  motes.forEach((p, i) => {
    glow(b.part(new THREE.OctahedronGeometry(0.018 + 0.004 * (i % 3), 0), i % 2 ? PURPLE : CYAN, { at: p, ...R }), 1.3);
  });

  return b.root;
}
