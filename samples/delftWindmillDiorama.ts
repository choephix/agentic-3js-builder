import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, type OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { paint, stripes, spots, patches, grain, mix } from "../src/paint";
import { svg } from "../src/texture";

// Delftware Windmill — a tabletop diorama in Delft blue porcelain:
// glossy white glaze with cobalt hand-painted patterns, nothing but blue on white.

const WHITE = "#f8fafc";
const COBALT = "#1e46b4";
const DEEP = "#142e7c";
const MID = "#4a72d6";
const PALE = "#a9c2ec";
const SKY = "#d9e6fa";

type V3 = [number, number, number];
const v = (x: number, y: number, z: number): V3 => [x, y, z];

export const meta = {
  name: "Delftware Windmill",
  description:
    "A Delft blue porcelain tabletop diorama: smock windmill with turning lattice sails, canal with bridge and boat, farmhouse, tulip beds, trees, milkmaid and two cows.",
};

export default function build() {
  const b = createBuilder({ name: "delftWindmillDiorama" });
  const root = b.joint("diorama", { at: v(0, 0.02, 0) });

  // ---------------------------------------------------------------- paints
  // Round tiled plinth top: Delft tile grid with a dot in every tile.
  const tileTop = paint((p) => {
    const gx = p.x / 0.075;
    const gz = p.z / 0.075;
    const fx = Math.abs((((gx % 1) + 1) % 1) - 0.5);
    const fz = Math.abs((((gz % 1) + 1) % 1) - 0.5);
    if (fx > 0.455 || fz > 0.455) return COBALT;
    const dx = Math.abs(gx - Math.round(gx));
    const dz = Math.abs(gz - Math.round(gz));
    if (dx + dz < 0.09) return COBALT;
    return WHITE;
  });
  // Plinth side: cobalt with a white wave band under the rim.
  const plinthSide = paint((p) => {
    if (p.y > 0.042) {
      const a = Math.atan2(p.z, p.x);
      const w = Math.sin(a * 48);
      return w > 0.25 ? WHITE : COBALT;
    }
    return DEEP;
  });
  // One paint for the whole plinth: tiles on top, waves on the side.
  const plinthPaint = paint((p) => {
    if (p.y > 0.055) {
      const gx = p.x / 0.075;
      const gz = p.z / 0.075;
      const fx = Math.abs((((gx % 1) + 1) % 1) - 0.5);
      const fz = Math.abs((((gz % 1) + 1) % 1) - 0.5);
      if (fx > 0.455 || fz > 0.455) return COBALT;
      const dx = Math.abs(gx - Math.round(gx));
      const dz = Math.abs(gz - Math.round(gz));
      if (dx + dz < 0.09) return COBALT;
      // Cobalt rim ring near the edge.
      const r = Math.hypot(p.x, p.z);
      if (r > 0.545) return COBALT;
      if (r > 0.53) return WHITE;
      return WHITE;
    }
    if (p.y > 0.038) {
      const a = Math.atan2(p.z, p.x);
      return Math.sin(a * 48) > 0.25 ? WHITE : COBALT;
    }
    return DEEP;
  });
  void tileTop;
  void plinthSide;

  // Windmill tower: white glaze with hand-painted brick courses.
  const brickPaint = paint((p) => {
    const f = (((p.y / 0.045) % 1) + 1) % 1;
    if (f < 0.08) return COBALT;
    return WHITE;
  });
  // Mill cap: deep cobalt with white ribs (lathe s = [height, deg]).
  const capPaint = paint((_p, _n, s) => {
    const rib = (((s[1] % 22.5) + 22.5) % 22.5) / 22.5;
    if (rib < 0.14) return WHITE;
    return DEEP;
  });
  // Sail cloth: white with cobalt border and shutter bars (extrude s = [x, y]).
  const clothPaint = paint((_p, _n, s) => {
    if (s[0] < 0.118 || s[0] > 0.328 || s[1] < 0.016 || s[1] > 0.062) return COBALT;
    if ((((s[0] / 0.032) % 1) + 1) % 1 < 0.1) return MID;
    return WHITE;
  });
  // Canal water: mid blue with white wave squiggles and pale banks.
  const waterPaint = paint((p, _n, s) => {
    const wv = Math.sin(p.x * 60 + Math.sin(p.z * 53) * 2) + Math.sin(p.z * 70 + p.x * 20);
    if (wv > 1.25) return WHITE;
    if (Math.abs(s[1]) > 62) return mix(MID, WHITE, 0.55);
    return MID;
  });
  const cowPaint = patches(MID, COBALT, { size: 0.075, seed: 11 });
  const canopyPaint = spots(WHITE, MID, { size: 0.085, amount: 0.3, seed: 21 });
  const barkPaint = grain(COBALT, DEEP, { size: 0.02, axis: "y", seed: 3 });
  const tulipPaint = stripes(WHITE, COBALT, { size: 0.02, axis: "x", width: 0.5, seed: 5 });
  const soilPaint = spots(DEEP, PALE, { size: 0.025, amount: 0.35, seed: 8 });
  const roofPaint = paint((p) => {
    const f = ((((p.y - 0.17) / 0.028) % 1) + 1) % 1;
    if (f < 0.16) return DEEP;
    return MID;
  });
  const housePaint = paint((p) => {
    if (p.y < 0.085) return COBALT;
    const f = (((p.y / 0.04) % 1) + 1) % 1;
    if (f < 0.06) return PALE;
    return WHITE;
  });
  const skirtPaint = paint((p) => {
    if (p.y < 0.075) return COBALT;
    const f = (((p.y / 0.035) % 1) + 1) % 1;
    if (f < 0.2) return COBALT;
    return WHITE;
  });

  // ---------------------------------------------------------------- textures
  const windowTex = svg(
    `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="64" height="80" fill="#1e46b4"/>
      <rect x="10" y="10" width="44" height="60" fill="#f8fafc"/>
      <rect x="28" y="10" width="8" height="60" fill="#1e46b4"/>
      <rect x="10" y="36" width="44" height="8" fill="#1e46b4"/>
      <rect x="10" y="10" width="44" height="60" fill="none" stroke="#142e7c" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );
  const faceTex = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="26" r="4" fill="#142e7c"/>
      <circle cx="42" cy="26" r="4" fill="#142e7c"/>
      <path d="M22 44 Q32 52 42 44" fill="none" stroke="#142e7c" stroke-width="4" stroke-linecap="round"/>
      <circle cx="14" cy="36" r="3" fill="#4a72d6"/>
      <circle cx="50" cy="36" r="3" fill="#4a72d6"/>
    </svg>`,
    { size: 128 },
  );
  const plaqueTex = svg(
    `<svg viewBox="0 0 128 96" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="124" height="92" fill="#f8fafc" stroke="#1e46b4" stroke-width="5"/>
      <polygon points="52,70 58,38 70,38 76,70" fill="none" stroke="#1e46b4" stroke-width="4"/>
      <path d="M58 38 Q64 26 70 38" fill="#1e46b4"/>
      <line x1="64" y1="34" x2="40" y2="14" stroke="#1e46b4" stroke-width="3"/>
      <line x1="64" y1="34" x2="88" y2="14" stroke="#1e46b4" stroke-width="3"/>
      <line x1="64" y1="34" x2="44" y2="54" stroke="#1e46b4" stroke-width="3"/>
      <line x1="64" y1="34" x2="84" y2="54" stroke="#1e46b4" stroke-width="3"/>
      <path d="M8 78 Q20 72 32 78 T56 78 T80 78 T104 78 T120 78" fill="none" stroke="#1e46b4" stroke-width="3"/>
      <path d="M8 86 Q20 80 32 86 T56 86 T80 86 T104 86 T120 86" fill="none" stroke="#1e46b4" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );
  const reedTex = svg(
    `<svg viewBox="0 0 32 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 124 L8 60 L14 8 L18 8 L24 60 Z" fill="#1e46b4"/>
      <path d="M16 120 L14.5 60 L16 14 L17.5 60 Z" fill="#a9c2ec"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------- base
  b.lathe(
    [
      [0.001, 0.002],
      [0.6, 0.002],
      [0.605, 0.012],
      [0.6, 0.03],
      [0.595, 0.055],
      [0.585, 0.06],
      [0.001, 0.06],
    ],
    { at: v(0, 0, 0), bone: root, segments: 48, color: plinthPaint },
  );
  // Painted plaque on the plinth front.
  b.part(new THREE.PlaneGeometry(0.14, 0.05), WHITE, {
    bone: root,
    at: v(0, 0.032, 0.603),
    dir: v(0, 0.25, 1),
    axis: "z",
    texture: plaqueTex,
  });

  // ---------------------------------------------------------------- windmill
  const MX = -0.2;
  const MZ = -0.24;
  // Tapered octagonal smock.
  b.part(new THREE.CylinderGeometry(0.095, 0.13, 0.4, 8, 1), brickPaint, {
    bone: root,
    at: v(MX, 0.26, MZ),
    rotation: [0, 22.5, 0],
    flat: true,
  });
  // Mill door + step + windows. (Tower faces +Z; front face ~0.116 ahead of centre.)
  b.part(new THREE.PlaneGeometry(0.07, 0.11), DEEP, {
    bone: root,
    at: v(MX, 0.115, MZ + 0.118),
    dir: v(0, 0, 1),
    axis: "z",
  });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.04), COBALT, { bone: root, at: v(MX, 0.068, MZ + 0.135) });
  b.part(new THREE.PlaneGeometry(0.055, 0.07), WHITE, {
    bone: root,
    at: v(MX, 0.3, MZ + 0.103),
    dir: v(0, 0, 1),
    axis: "z",
    texture: windowTex,
  });
  b.part(new THREE.PlaneGeometry(0.05, 0.062), WHITE, {
    bone: root,
    at: v(MX + 0.097, 0.24, MZ + 0.06),
    dir: v(0.85, 0, 0.53),
    axis: "z",
    texture: windowTex,
  });
  // Stage gallery: octagonal platform + railing.
  b.part(new THREE.CylinderGeometry(0.155, 0.155, 0.02, 8, 1), WHITE, {
    bone: root,
    at: v(MX, 0.33, MZ),
    rotation: [0, 22.5, 0],
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.155, 0.13, 0.03, 8, 1), COBALT, {
    bone: root,
    at: v(MX, 0.31, MZ),
    rotation: [0, 22.5, 0],
    flat: true,
  });
  const railPosts: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 8; k++) {
    const a = ((k + 0.5) / 8) * Math.PI * 2;
    railPosts.push(
      new THREE.CylinderGeometry(0.006, 0.006, 0.075, 6).translate(
        MX + Math.cos(a) * 0.145,
        0.3775,
        MZ + Math.sin(a) * 0.145,
      ),
    );
  }
  const railPostGeo = mergeGeometries(railPosts);
  if (!railPostGeo) throw new Error("rail merge failed");
  b.part(railPostGeo, COBALT, { bone: root, at: v(0, 0, 0) });
  b.part(new THREE.TorusGeometry(0.145, 0.007, 6, 8), COBALT, {
    bone: root,
    at: v(MX, 0.415, MZ),
    rotation: [90, 0, 0],
    flat: true,
  });
  // Cap.
  b.lathe(
    [
      [0.001, 0],
      [0.105, 0],
      [0.11, 0.015],
      [0.085, 0.07],
      [0.05, 0.12],
      [0.015, 0.145],
      [0.001, 0.15],
    ],
    { at: v(MX, 0.455, MZ), bone: root, segments: 16, color: capPaint },
  );
  b.part(new THREE.SphereGeometry(0.015, 8, 6), COBALT, { bone: root, at: v(MX, 0.612, MZ) });

  // Sails on their own hinge joint so they can turn.
  const H = v(-0.2, 0.565, -0.125);
  const rotor = b.joint("sailRotor", { parent: root, at: H, dir: v(0, 0.12, 1), role: "hinge" });
  b.rod(v(-0.2, 0.56, -0.185), H, 0.014, { color: DEEP, bone: rotor });
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.06, 10), COBALT, {
    bone: rotor,
    at: H,
    rotation: [90, 0, 0],
  });
  b.part(new THREE.ConeGeometry(0.02, 0.04, 10), DEEP, {
    bone: rotor,
    at: v(H[0], H[1], H[2] + 0.045),
    rotation: [90, 0, 0],
  });
  for (let k = 0; k < 4; k++) {
    const ang = ((45 + k * 90) * Math.PI) / 180;
    const dx = Math.cos(ang);
    const dy = Math.sin(ang);
    const px = -Math.sin(ang);
    const py = Math.cos(ang);
    const P = (d: number, w: number): V3 => v(H[0] + dx * d + px * w, H[1] + dy * d + py * w, H[2]);
    b.rod(P(0, 0), P(0.35, 0), 0.011, { color: COBALT, bone: rotor });
    b.rod(P(0.08, 0.008), P(0.345, 0.008), 0.005, { color: COBALT, bone: rotor });
    b.rod(P(0.08, 0.015), P(0.345, 0.085), 0.005, { color: COBALT, bone: rotor });
    for (let d = 0.1; d <= 0.331; d += 0.032) {
      const w1 = 0.015 + (d - 0.08) * 0.26;
      b.rod(P(d, 0.008), P(d, w1), 0.004, { color: COBALT, bone: rotor });
    }
    const cloth: OutlinePoint[] = [
      [0.1, 0.01],
      [0.345, 0.01],
      [0.345, 0.07],
      [0.1, 0.018],
    ];
    b.extrude(cloth, {
      at: H,
      x: v(dx, dy, 0),
      y: v(px, py, 0),
      thickness: 0.004,
      color: clothPaint,
      bone: rotor,
    });
  }

  // ---------------------------------------------------------------- canal
  const canalPath = catmull([
    v(-0.44, 0.068, 0.26),
    v(-0.22, 0.068, 0.31),
    v(0.05, 0.068, 0.28),
    v(0.3, 0.068, 0.19),
    v(0.48, 0.068, 0.06),
  ]);
  b.sweep(canalPath, () => [0.075, 0.008], {
    section: "box",
    color: waterPaint,
    bone: root,
    caps: "flat",
  });

  // Arched bridge over the canal.
  const bridge: OutlinePoint[] = [
    [-0.12, 0.005],
    [-0.12, 0.045],
    [-0.05, 0.075],
    [0, 0.085],
    [0.05, 0.075],
    [0.12, 0.045],
    [0.12, 0.005],
    [0.05, 0.005],
    [0.035, 0.032],
    [-0.035, 0.032],
    [-0.05, 0.005],
  ];
  b.extrude(bridge, {
    at: v(0.05, 0.06, 0.28),
    x: v(0, 0, 1),
    y: v(0, 1, 0),
    thickness: 0.09,
    color: WHITE,
    bone: root,
    bevel: 0.006,
  });
  b.part(new THREE.BoxGeometry(0.1, 0.012, 0.26), COBALT, { bone: root, at: v(0.05, 0.148, 0.28) });
  const bridgePosts: THREE.BufferGeometry[] = [];
  for (const sx of [-0.038, 0.038]) {
    for (const sz of [-0.1, -0.03, 0.03, 0.1]) {
      bridgePosts.push(new THREE.BoxGeometry(0.008, 0.05, 0.008).translate(0.05 + sx, 0.175, 0.28 + sz));
    }
  }
  const bridgePostGeo = mergeGeometries(bridgePosts);
  if (!bridgePostGeo) throw new Error("bridge merge failed");
  b.part(bridgePostGeo, COBALT, { bone: root, at: v(0, 0, 0) });
  for (const sx of [-0.038, 0.038]) {
    b.rod(v(0.05 + sx, 0.2, 0.18), v(0.05 + sx, 0.2, 0.38), 0.005, { color: COBALT, bone: root });
  }
  // Steps both ends.
  b.part(new THREE.BoxGeometry(0.1, 0.03, 0.05), WHITE, { bone: root, at: v(0.05, 0.075, 0.155) });
  b.part(new THREE.BoxGeometry(0.1, 0.03, 0.05), WHITE, { bone: root, at: v(0.05, 0.075, 0.405) });

  // Moored boat + post + rope.
  const hull: OutlinePoint[] = [
    [-0.1, 0.035],
    [-0.02, 0.05],
    [0.07, 0.045],
    [0.1, 0, "sharp"],
    [0.07, -0.045],
    [-0.02, -0.05],
    [-0.1, -0.035],
  ];
  b.extrude(hull, {
    at: v(0.28, 0.075, 0.19),
    x: v(1, 0, 0),
    y: v(0, 0, 1),
    thickness: 0.05,
    smoothing: 1,
    color: WHITE,
    bone: root,
  });
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.07), COBALT, { bone: root, at: v(0.26, 0.1, 0.19) });
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.07), COBALT, { bone: root, at: v(0.32, 0.1, 0.19) });
  b.part(new THREE.CylinderGeometry(0.012, 0.014, 0.09, 8), DEEP, {
    bone: root,
    at: v(0.36, 0.1, 0.1),
  });
  b.sweep(catmull([v(0.375, 0.1, 0.16), v(0.385, 0.085, 0.13), v(0.34, 0.075, 0.115)]), 0.004, {
    color: DEEP,
    bone: root,
  });

  // Reeds along the banks.
  const reedRng = rng(5);
  const reedFrames = [];
  const bankSpots: V3[] = [
    v(-0.4, 0.06, 0.2),
    v(-0.3, 0.06, 0.225),
    v(-0.12, 0.06, 0.2),
    v(0.0, 0.06, 0.195),
    v(0.16, 0.06, 0.19),
    v(0.3, 0.06, 0.11),
    v(0.42, 0.06, 0.0),
    v(-0.36, 0.06, 0.345),
    v(-0.18, 0.06, 0.385),
    v(0.04, 0.06, 0.36),
    v(0.24, 0.06, 0.275),
    v(0.4, 0.06, 0.155),
  ];
  for (const s of bankSpots) {
    const n = 2 + Math.floor(reedRng() * 2);
    for (let k = 0; k < n; k++) {
      reedFrames.push(frame(v(s[0] + (reedRng() - 0.5) * 0.05, 0.06, s[2] + (reedRng() - 0.5) * 0.04), v(0, 1, 0)));
    }
  }
  b.cards(reedFrames, reedTex, {
    size: [0.03, 0.09],
    lean: 10,
    bend: 12,
    vary: 0.35,
    rng: rng(6),
    color: WHITE,
    bone: root,
  });

  // ---------------------------------------------------------------- farmhouse
  const FX = 0.37;
  const FZ = -0.12;
  b.part(new THREE.BoxGeometry(0.2, 0.11, 0.13), housePaint, { bone: root, at: v(FX, 0.115, FZ) });
  const gable: OutlinePoint[] = [
    [-0.065, 0],
    [0.065, 0],
    [0.065, 0.02],
    [0.04, 0.02],
    [0.04, 0.04],
    [0.015, 0.04],
    [0.015, 0.062],
    [-0.015, 0.062],
    [-0.015, 0.04],
    [-0.04, 0.04],
    [-0.04, 0.02],
    [-0.065, 0.02],
  ];
  for (const s of [1, -1]) {
    b.extrude(gable, {
      at: v(FX + s * 0.1, 0.17, FZ),
      x: v(0, 0, 1),
      y: v(0, 1, 0),
      thickness: 0.014,
      color: WHITE,
      bone: root,
    });
  }
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.23, 0.014, 0.095), roofPaint, {
      bone: root,
      at: v(FX, 0.208, FZ + s * 0.036),
      rotation: [s * -28, 0, 0],
    });
  }
  b.part(new THREE.BoxGeometry(0.05, 0.07, 0.012), DEEP, {
    bone: root,
    at: v(FX, 0.095, FZ + 0.066),
  });
  b.part(new THREE.BoxGeometry(0.07, 0.015, 0.03), COBALT, {
    bone: root,
    at: v(FX, 0.067, FZ + 0.075),
  });
  b.part(new THREE.PlaneGeometry(0.05, 0.062), WHITE, {
    bone: root,
    at: v(FX - 0.06, 0.12, FZ + 0.0655),
    dir: v(0, 0, 1),
    axis: "z",
    texture: windowTex,
  });
  b.part(new THREE.PlaneGeometry(0.05, 0.062), WHITE, {
    bone: root,
    at: v(FX + 0.06, 0.12, FZ + 0.0655),
    dir: v(0, 0, 1),
    axis: "z",
    texture: windowTex,
  });
  b.part(new THREE.BoxGeometry(0.025, 0.06, 0.025), COBALT, {
    bone: root,
    at: v(FX + 0.05, 0.24, FZ - 0.02),
  });
  b.part(new THREE.BoxGeometry(0.035, 0.012, 0.035), DEEP, {
    bone: root,
    at: v(FX + 0.05, 0.272, FZ - 0.02),
  });

  // ---------------------------------------------------------------- trees
  const treeSpots: Array<{ x: number; z: number; s: number }> = [
    { x: -0.47, z: -0.06, s: 1.1 },
    { x: 0.52, z: -0.12, s: 0.9 },
    { x: -0.05, z: -0.44, s: 1.0 },
  ];
  for (const t of treeSpots) {
    b.part(new THREE.CylinderGeometry(0.02 * t.s, 0.032 * t.s, 0.22 * t.s, 8), barkPaint, {
      bone: root,
      at: v(t.x, 0.06 + 0.11 * t.s, t.z),
    });
    b.part(new THREE.SphereGeometry(0.07 * t.s, 10, 8), canopyPaint, {
      bone: root,
      at: v(t.x, 0.06 + 0.26 * t.s, t.z),
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.052 * t.s, 9, 7), canopyPaint, {
      bone: root,
      at: v(t.x + 0.055 * t.s, 0.06 + 0.215 * t.s, t.z + 0.02),
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.048 * t.s, 9, 7), canopyPaint, {
      bone: root,
      at: v(t.x - 0.05 * t.s, 0.06 + 0.22 * t.s, t.z - 0.015),
      flat: true,
    });
  }

  // ---------------------------------------------------------------- tulip beds
  const beds = [
    { x: -0.02, z: 0.06, w: 0.24, d: 0.1 },
    { x: -0.36, z: 0.08, w: 0.14, d: 0.1 },
  ];
  for (const bed of beds) {
    b.part(new THREE.BoxGeometry(bed.w, 0.035, bed.d), soilPaint, {
      bone: root,
      at: v(bed.x, 0.0775, bed.z),
    });
    b.part(new THREE.BoxGeometry(bed.w + 0.02, 0.02, 0.015), WHITE, {
      bone: root,
      at: v(bed.x, 0.07, bed.z + bed.d / 2 + 0.0075),
    });
    b.part(new THREE.BoxGeometry(bed.w + 0.02, 0.02, 0.015), WHITE, {
      bone: root,
      at: v(bed.x, 0.07, bed.z - bed.d / 2 - 0.0075),
    });
    b.part(new THREE.BoxGeometry(0.015, 0.02, bed.d + 0.02), WHITE, {
      bone: root,
      at: v(bed.x + bed.w / 2 + 0.0075, 0.07, bed.z),
    });
    b.part(new THREE.BoxGeometry(0.015, 0.02, bed.d + 0.02), WHITE, {
      bone: root,
      at: v(bed.x - bed.w / 2 - 0.0075, 0.07, bed.z),
    });
  }
  // Tulips: merged stems, heads and leaves per diorama.
  const stems: THREE.BufferGeometry[] = [];
  const heads: THREE.BufferGeometry[] = [];
  const leaves: THREE.BufferGeometry[] = [];
  const tulipRng = rng(9);
  const headProfile: OutlinePoint[] = [
    [0.001, 0],
    [0.016, 0],
    [0.02, 0.02],
    [0.015, 0.042],
    [0.007, 0.052],
    [0.001, 0.054],
  ];
  for (const bed of beds) {
    const nx = Math.round(bed.w / 0.045);
    const nz = Math.round(bed.d / 0.045);
    for (let ix = 0; ix < nx; ix++) {
      for (let iz = 0; iz < nz; iz++) {
        const tx = bed.x - bed.w / 2 + ((ix + 0.5) / nx) * bed.w + (tulipRng() - 0.5) * 0.012;
        const tz = bed.z - bed.d / 2 + ((iz + 0.5) / nz) * bed.d + (tulipRng() - 0.5) * 0.012;
        const h = 0.05 + tulipRng() * 0.035;
        stems.push(new THREE.CylinderGeometry(0.0035, 0.0045, h, 6).translate(tx, 0.095 + h / 2, tz));
        heads.push(
          new THREE.LatheGeometry(
            headProfile.map((p) => new THREE.Vector2(p[0] as number, p[1] as number)),
            8,
          ).translate(tx, 0.095 + h, tz),
        );
        const la = tulipRng() * Math.PI * 2;
        const leaf = new THREE.BoxGeometry(0.01, 0.045, 0.002);
        leaf.rotateZ(0.5);
        leaf.rotateY(la);
        leaf.translate(tx + Math.cos(la) * 0.012, 0.115, tz + Math.sin(la) * 0.012);
        leaves.push(leaf);
      }
    }
  }
  const stemGeo = mergeGeometries(stems);
  const headGeo = mergeGeometries(heads);
  const leafGeo = mergeGeometries(leaves);
  if (!stemGeo || !headGeo || !leafGeo) throw new Error("tulip merge failed");
  b.part(stemGeo, MID, { bone: root, at: v(0, 0, 0) });
  b.part(headGeo, tulipPaint, { bone: root, at: v(0, 0, 0) });
  b.part(leafGeo, COBALT, { bone: root, at: v(0, 0, 0) });

  // ---------------------------------------------------------------- cows
  const buildCow = (name: string, cx: number, cz: number, face: 1 | -1, graze: boolean) => {
    const body = b.joint(name, {
      parent: root,
      at: v(cx, 0.15, cz),
      dir: v(face, 0, 0),
      role: "spine",
    });
    b.sweep(
      [v(cx - face * 0.1, 0.155, cz), v(cx, 0.165, cz), v(cx + face * 0.09, 0.15, cz)],
      (t) => 0.055 - 0.015 * Math.abs(t - 0.45),
      { color: cowPaint, bone: body },
    );
    for (const lx of [cx - face * 0.055, cx + face * 0.06]) {
      for (const lz of [cz - 0.032, cz + 0.032]) {
        b.part(new THREE.CylinderGeometry(0.014, 0.012, 0.11, 8), WHITE, {
          bone: body,
          at: v(lx, 0.055, lz),
        });
        b.part(new THREE.CylinderGeometry(0.016, 0.017, 0.02, 8), DEEP, {
          bone: body,
          at: v(lx, 0.01, lz),
        });
      }
    }
    b.part(new THREE.SphereGeometry(0.022, 8, 6), PALE, { bone: body, at: v(cx - face * 0.03, 0.1, cz) });
    // Head on its own joint.
    const hx = cx + face * 0.12;
    const hy = graze ? 0.13 : 0.19;
    const headDir = graze ? v(face * 0.85, -0.5, 0) : v(face * 0.9, 0.25, 0);
    const head = b.joint(`${name}Head`, { parent: body, at: v(hx, hy, cz), dir: headDir, role: "head" });
    const muzzle: V3 = graze ? v(hx + face * 0.055, hy - 0.032, cz) : v(hx + face * 0.06, hy + 0.015, cz);
    b.rod(v(hx, hy, cz), muzzle, [0.034, 0.024], { color: cowPaint, bone: head });
    b.part(new THREE.SphereGeometry(0.024, 8, 6), PALE, { bone: head, at: muzzle });
    for (const s of [1, -1]) {
      b.spike(
        v(hx - face * 0.01, hy + 0.028, cz + s * 0.02),
        v(hx - face * 0.03, hy + 0.055, cz + s * 0.035),
        null,
        0.007,
        {
          color: PALE,
          bone: head,
        },
      );
      b.part(new THREE.SphereGeometry(0.006, 6, 5), DEEP, {
        bone: head,
        at: v(hx + face * 0.02, hy + 0.008, cz + s * 0.03),
      });
    }
    // Tail on its own joint.
    const tail = b.joint(`${name}Tail`, {
      parent: body,
      at: v(cx - face * 0.105, 0.175, cz),
      dir: v(-face * 0.3, -1, 0),
      role: "tail",
    });
    b.sweep([v(cx - face * 0.105, 0.175, cz), v(cx - face * 0.125, 0.09, cz + 0.008)], [0.008, 0.005], {
      color: WHITE,
      bone: tail,
    });
    b.spike(v(cx - face * 0.125, 0.095, cz + 0.008), v(cx - face * 0.128, 0.055, cz + 0.01), null, 0.011, {
      color: DEEP,
      bone: tail,
    });
  };
  buildCow("cowA", -0.04, -0.33, 1, true);
  buildCow("cowB", 0.24, -0.32, -1, false);

  // Pasture fence.
  const fenceGeos: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 6; k++) {
    fenceGeos.push(new THREE.BoxGeometry(0.025, 0.12, 0.025).translate(-0.02 + k * 0.08, 0.12, -0.42));
  }
  fenceGeos.push(new THREE.BoxGeometry(0.44, 0.018, 0.014).translate(0.18, 0.155, -0.42));
  fenceGeos.push(new THREE.BoxGeometry(0.44, 0.018, 0.014).translate(0.18, 0.115, -0.42));
  const fenceGeo = mergeGeometries(fenceGeos);
  if (!fenceGeo) throw new Error("fence merge failed");
  b.part(fenceGeo, COBALT, { bone: root, at: v(0, 0, 0) });

  // ---------------------------------------------------------------- milkmaid
  const maid = b.joint("maid", { parent: root, at: v(0.13, 0.06, -0.14), dir: v(0, 1, 0), role: "spine" });
  b.lathe(
    [
      [0.001, 0.002],
      [0.048, 0.002],
      [0.05, 0.008],
      [0.032, 0.07],
      [0.026, 0.11],
      [0.024, 0.12],
    ],
    { at: v(0.13, 0.06, -0.14), bone: maid, segments: 14, color: skirtPaint },
  );
  b.rod(v(0.13, 0.16, -0.14), v(0.13, 0.23, -0.14), 0.028, { color: COBALT, bone: maid });
  b.part(new THREE.BoxGeometry(0.05, 0.075, 0.012), WHITE, {
    bone: maid,
    at: v(0.13, 0.155, -0.109),
  });
  const maidHead = b.joint("maidHead", {
    parent: maid,
    at: v(0.13, 0.255, -0.14),
    dir: v(0, 0.2, 1),
    role: "head",
  });
  b.part(new THREE.CylinderGeometry(0.011, 0.013, 0.03, 8), WHITE, {
    bone: maidHead,
    at: v(0.13, 0.245, -0.14),
  });
  const maidHeadPart = b.part(new THREE.SphereGeometry(0.032, 12, 10), WHITE, {
    bone: maidHead,
    at: v(0.13, 0.272, -0.136),
  });
  b.decal(maidHeadPart, faceTex, {
    at: v(0.13, 0.272, -0.1),
    dir: v(0, -0.1, 1),
    size: [0.045, 0.045],
  });
  // Cap: squashed dome + side wings.
  b.part(new THREE.SphereGeometry(0.034, 10, 8), WHITE, {
    bone: maidHead,
    at: v(0.13, 0.288, -0.142),
    scale: v(1, 0.55, 1),
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.012, 0.035, 0.02), WHITE, {
      bone: maidHead,
      at: v(0.13 + s * 0.038, 0.278, -0.14),
      rotation: [0, 0, s * -12],
    });
  }
  // Arms on their own joints; the right one carries the pail.
  const armL = b.joint("maidArmL", {
    parent: maid,
    at: v(0.165, 0.215, -0.14),
    dir: v(0.25, -1, 0.1),
    role: "arm",
  });
  b.rod(v(0.165, 0.215, -0.14), v(0.192, 0.11, -0.13), 0.009, { color: WHITE, bone: armL });
  b.part(new THREE.SphereGeometry(0.01, 8, 6), WHITE, { bone: armL, at: v(0.192, 0.105, -0.13) });
  const armR = b.joint("maidArmR", {
    parent: maid,
    at: v(0.095, 0.215, -0.14),
    dir: v(-0.15, -1, 0.2),
    role: "arm",
  });
  b.rod(v(0.095, 0.215, -0.14), v(0.08, 0.11, -0.118), 0.009, { color: WHITE, bone: armR });
  b.part(new THREE.SphereGeometry(0.01, 8, 6), WHITE, { bone: armR, at: v(0.08, 0.105, -0.118) });
  b.lathe(
    [
      [0.001, 0.002],
      [0.026, 0.002],
      [0.03, 0.05],
      [0.028, 0.055],
    ],
    { at: v(0.08, 0.05, -0.118), bone: armR, segments: 12, color: DEEP },
  );
  b.part(new THREE.TorusGeometry(0.028, 0.004, 6, 14), COBALT, {
    bone: armR,
    at: v(0.08, 0.105, -0.118),
    rotation: [90, 0, 0],
  });

  // Quiet unused-sky tone for trim pieces that need a pale glaze.
  void SKY;

  return b.root;
}
