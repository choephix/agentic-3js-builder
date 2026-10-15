import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { cells, mix, noise, paint, smoothstep } from "../../../../src/paint";
import { bezier, catmull, polyline } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A reaper's scythe whose snath is a dragon's spine and whose head is a dragon skull clamping an obsidian wing-blade rimmed in soul fire, on a rune plinth held by bone talons.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: ivory dragonbone and dark obsidian violet, one strong accent (soul teal), gold trims.
const BONE = "#efe4c8";
const BONE_SH = "#bfae8a";
const BONE_DK = "#7b6650";
const OBS = "#1b1530";
const OBS_L = "#2b2150";
const VIOLET = "#4a2f86";
const VIOLET_L = "#7650c8";
const VIOLET_D = "#2a1c52";
const TEAL = "#27f2cf";
const TEAL_D = "#0b9f95";
const TEAL_W = "#d6fff5";
const MINT = "#8dffb4";
const CYAN = "#6fe6ff";
const GOLD = "#f0b43c";
const GOLD_D = "#a9701c";
const STONE = "#352c4a";
const STONE_L = "#4b4068";
const SOCKET = "#120d1f";

const X0 = -0.35; // x of the snath axis
const P = (x: number, y: number, z = 0): [number, number, number] => [X0 + x, y, z];

// ---------------------------------------------------------------------------------------------------------------
// Local helpers

type Station = { x: number; y: number; rz: number; ry: number };

/** Faceted elliptical loft along +X (local x, shifted by X0), closed at both ends. */
function loftX(st: Station[], sides = 6): THREE.BufferGeometry {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  st.forEach((s, i) => {
    for (let j = 0; j < sides; j++) {
      const a = (j / sides) * Math.PI * 2;
      pos.push(X0 + s.x, s.y + s.ry * Math.cos(a), s.rz * Math.sin(a));
      uv.push(i / (st.length - 1), j / sides);
    }
  });
  for (let i = 0; i < st.length - 1; i++)
    for (let j = 0; j < sides; j++) {
      const a = i * sides + j;
      const bb = i * sides + ((j + 1) % sides);
      const c = (i + 1) * sides + j;
      const d = (i + 1) * sides + ((j + 1) % sides);
      idx.push(a, c, bb, bb, c, d);
    }
  for (const [k, sIdx] of [
    [0, 0],
    [1, st.length - 1],
  ] as const) {
    const ci = pos.length / 3;
    pos.push(X0 + st[sIdx].x, st[sIdx].y, 0);
    uv.push(sIdx === 0 ? 0 : 1, 0.5);
    for (let j = 0; j < sides; j++) {
      const a = sIdx * sides + j;
      const bb = sIdx * sides + ((j + 1) % sides);
      if (k === 0) idx.push(ci, bb, a);
      else idx.push(ci, a, bb);
    }
  }
  // make the winding face outward
  let vol = 0;
  const v = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  for (let t = 0; t < idx.length; t += 3) {
    for (let k = 0; k < 3; k++) v[k].set(pos[idx[t + k] * 3], pos[idx[t + k] * 3 + 1], pos[idx[t + k] * 3 + 2]);
    vol += v[0].dot(v[1].clone().cross(v[2]));
  }
  if (vol < 0)
    for (let t = 0; t < idx.length; t += 3) {
      const tmp = idx[t + 1];
      idx[t + 1] = idx[t + 2];
      idx[t + 2] = tmp;
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function stationAt(st: Station[], x: number) {
  for (let i = 0; i < st.length - 1; i++) {
    if (x >= st[i].x && x <= st[i + 1].x) {
      const t = (x - st[i].x) / (st[i + 1].x - st[i].x);
      const l = (a: number, c: number) => a + (c - a) * t;
      return { y: l(st[i].y, st[i + 1].y), rz: l(st[i].rz, st[i + 1].rz), ry: l(st[i].ry, st[i + 1].ry) };
    }
  }
  const e = st[st.length - 1];
  return { y: e.y, rz: e.rz, ry: e.ry };
}

// ---------------------------------------------------------------------------------------------------------------
// Textures

const glyphA = svg(
  `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#d6fff5" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M32 6 V90"/><path d="M32 30 L12 14"/><path d="M32 30 L52 14"/><path d="M32 60 L14 76"/><path d="M32 60 L50 76"/><circle cx="32" cy="46" r="8"/></g></svg>`,
  { size: 192 },
);
const glyphB = svg(
  `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#d6fff5" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M32 8 L54 48 L32 88 L10 48 Z"/><path d="M10 48 H54"/><path d="M32 24 V72"/><circle cx="32" cy="48" r="5" fill="#d6fff5"/></g></svg>`,
  { size: 192 },
);
const glyphC = svg(
  `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#d6fff5" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 10 L50 34 L14 54 L50 82"/><path d="M50 10 V26"/><circle cx="16" cy="82" r="6" fill="#d6fff5"/><path d="M34 90 V70"/></g></svg>`,
  { size: 192 },
);
const flameTex = svg(
  `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 80 C0 58 12 48 13 34 C14 22 22 14 30 0 C28 16 36 28 36 44 C36 60 40 68 35 80 Z" fill="#27f2cf"/>
  <path d="M13 80 C10 64 17 56 19 44 C20 36 24 30 28 20 C28 32 32 40 31 52 C31 62 33 70 29 80 Z" fill="#d6fff5"/></svg>`,
  { size: 160 },
);
const ringTex = svg(
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#27f2cf" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="100" cy="100" r="94"/><circle cx="100" cy="100" r="70"/><circle cx="100" cy="100" r="30" stroke="#d6fff5"/>
  <path d="M100 8 V30 M100 170 V192 M8 100 H30 M170 100 H192 M35 35 L50 50 M165 35 L150 50 M35 165 L50 150 M165 165 L150 150" stroke="#d6fff5"/>
  <path d="M100 38 L108 56 L100 62 L92 56 Z M100 162 L108 144 L100 138 L92 144 Z M38 100 L56 92 L62 100 L56 108 Z M162 100 L144 92 L138 100 L144 108 Z"/>
  <path d="M100 70 L130 100 L100 130 L70 100 Z"/><path d="M60 60 L72 72 M140 60 L128 72 M60 140 L72 128 M140 140 L128 128"/>
  </g></svg>`,
  { size: 512 },
);

// ---------------------------------------------------------------------------------------------------------------
// Paints

const boneP = paint((p) => {
  const n1 = noise(p, 0.07, 2);
  const c = cells(p, 0.075, 5);
  const crack = 1 - smoothstep(0.0, 0.03, c.d2 - c.d1);
  const gate = smoothstep(0.52, 0.68, noise(p, 0.22, 9));
  const col = mix(BONE, BONE_SH, smoothstep(0.35, 0.72, n1));
  return mix(col, BONE_DK, crack * gate * 0.85);
});

const hornP = paint((_p, _n, s) => {
  const f = (s[0] * 15) % 1;
  if (f < 0.18) return BONE_DK;
  return mix(BONE, BONE_SH, smoothstep(0.55, 1, s[0]));
});

const stoneP = paint((p, _n, s) => {
  const seam = (((s[1] % 45) + 45) % 45) < 1.4;
  const n1 = noise(p, 0.12, 4);
  const c = cells(p, 0.16, 8);
  const crack = 1 - smoothstep(0, 0.035, c.d2 - c.d1);
  let col = mix(STONE, STONE_L, smoothstep(0.35, 0.75, n1));
  col = mix(col, OBS, crack * 0.5);
  return seam ? OBS : col;
});

// blade: distance to the cutting edge drives the colour
const bladeEdgeCtl: [number, number][] = [
  [0.6, 1.86],
  [0.68, 1.92],
  [0.8, 2.0],
  [0.98, 2.07],
  [1.18, 2.08],
  [1.38, 1.98],
  [1.52, 1.78],
  [1.6, 1.52],
];
const bladeBackCtl: [number, number][] = [
  [0.6, 2.02],
  [0.7, 2.14],
  [0.88, 2.27],
  [1.12, 2.31],
  [1.34, 2.2],
  [1.5, 1.99],
  [1.58, 1.74],
  [1.6, 1.52],
];
const edgePath = catmull(bladeEdgeCtl.map(([x, y]) => P(x, y)));
const backPath = catmull(bladeBackCtl.map(([x, y]) => P(x, y)));
const edgePts = Array.from({ length: 70 }, (_, i) => edgePath.at(i / 69));

const bladeP = paint((p) => {
  let d = 9;
  for (const e of edgePts) d = Math.min(d, Math.hypot(p.x - e.x, p.y - e.y));
  const c = cells(p, 0.1, 11);
  const vein = 1 - smoothstep(0.0, 0.028, c.d2 - c.d1);
  const nz = noise(p, 0.16, 3);
  let col = mix(OBS, VIOLET_D, smoothstep(0.25, 0.8, nz));
  col = mix(col, VIOLET, (1 - smoothstep(0.06, 0.2, d)) * 0.7);
  col = mix(col, TEAL_D, (1 - smoothstep(0.015, 0.1, d)) * 0.9);
  col = mix(col, TEAL, 1 - smoothstep(0.012, 0.03, d));
  col = mix(col, TEAL_W, 1 - smoothstep(0.004, 0.013, d));
  const veinOn = vein * smoothstep(0.04, 0.09, d) * smoothstep(0.4, 0.6, noise(p, 0.3, 21));
  return mix(col, TEAL, veinOn * 0.9);
});

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "dragonboneSoulScythe" });
  const rand = rng(77);

  const root = b.joint("root", { at: P(0, 0.08), dir: [0, 1, 0] });
  const skull = b.joint("skull", { parent: root, at: P(0, 1.9), dir: [1, 0.1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: skull, at: P(-0.02, 1.98), aim: P(0.44, 1.835), role: "jaw" });

  const partIn = (geo: THREE.BufferGeometry, color: string | ReturnType<typeof paint>, bone: typeof root) =>
    b.part(geo, color, { bone, at: [0, 0, 0], flat: true });

  // ===========================================================================================================
  // PLINTH
  const plinthOutline: OutlinePoint[] = [
    [0, 0],
    [0.52, 0],
    [0.52, 0.07],
    [0.48, 0.095],
    [0.48, 0.105],
    [0.36, 0.105],
    [0.36, 0.13],
    [0.33, 0.16],
    [0, 0.16],
  ];
  b.lathe(plinthOutline, { at: P(0, 0), segments: 8, spin: 22.5, color: stoneP, bone: root, name: "plinth" });
  b.lathe(
    [
      [0.515, 0.015],
      [0.545, 0.015],
      [0.545, 0.05],
      [0.515, 0.05],
    ],
    { at: P(0, 0), segments: 8, spin: 22.5, color: GOLD, bone: root, name: "plinthTrim" },
  );
  b.lathe(
    [
      [0.4, 0.105],
      [0.46, 0.105],
      [0.46, 0.115],
      [0.4, 0.115],
    ],
    { at: P(0, 0), segments: 8, spin: 22.5, color: GOLD_D, bone: root, name: "plinthLedge" },
  );
  // rune disc on the top face
  glow(
    b.part(new THREE.CircleGeometry(0.31, 24), "#ffffff", {
      bone: root,
      at: P(0, 0.163),
      dir: [0, 1, 0],
      axis: "z",
      texture: ringTex,
      name: "runeDisc",
    }),
    1.2,
  );
  // glowing channel on the ledge, gems and spikes around it
  glow(
    b.part(new THREE.TorusGeometry(0.43, 0.009, 4, 32), TEAL, {
      bone: root,
      at: P(0, 0.12),
      dir: [0, 1, 0],
      axis: "z",
      name: "ledgeGlow",
    }),
    1.2,
  );
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    glow(
      b.part(new THREE.OctahedronGeometry(0.03, 0), k % 2 ? CYAN : TEAL, {
        bone: root,
        at: P(0.455 * sa, 0.14, 0.455 * ca),
        scale: [1, 1.4, 1],
        flat: true,
      }),
      1.3,
    );
    b.spike(P(0.5 * sa, 0.1, 0.5 * ca), [sa * 0.55, 0.85, ca * 0.55], 0.14, 0.032, {
      color: boneP,
      sides: 5,
      bone: root,
    });
    const a2 = a + Math.PI / 8;
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.012, 6), GOLD, {
      bone: root,
      at: P(0.5 * Math.sin(a2), 0.05, 0.5 * Math.cos(a2)),
      dir: [Math.sin(a2), 0, Math.cos(a2)],
      flat: true,
    });
  }

  // ===========================================================================================================
  // SNATH: a dragon's spine on a glowing soul core
  const sn = catmull([P(0, 0.15), P(0.012, 0.55), P(-0.012, 1.0), P(0.014, 1.45), P(0, 1.9)]);
  const sp = (y: number) => sn.at(sn.closestT([X0, y, 0]));
  const spAt = (y: number) => sn.slice(sn.closestT([X0, y, 0]), 1);
  void spAt;
  glow(b.sweep(sn, 0.03, { color: TEAL, sides: 6, bone: root, caps: "flat", name: "soulCore" }), 1.1);

  const vertebra = (ya: number, yb: number) => {
    const a = sp(ya);
    const c = sp(yb);
    const d = a.clone().lerp(c, 0.5);
    const up = c.clone().sub(a).normalize();
    b.rod(a, a.clone().addScaledVector(up, 0.018), 0.058, { color: boneP, sides: 8, bone: root, name: "vertDisc" });
    b.rod(a.clone().addScaledVector(up, 0.018), c.clone().addScaledVector(up, -0.006), [0.041, 0.037], {
      color: boneP,
      sides: 6,
      bone: root,
      name: "vertBody",
    });
    b.spike(d.clone().add(new THREE.Vector3(-0.025, 0, 0)), [-0.55, 0.85, 0], 0.075, 0.016, {
      color: boneP,
      sides: 5,
      bone: root,
      name: "neuralSpine",
    });
    for (const s of [1, -1])
      b.spike(d, [0, 0.25, s], 0.065, 0.011, { color: BONE_SH, sides: 5, bone: root, name: "transverse" });
  };
  const run = (y0: number, y1: number, n: number) => {
    for (let i = 0; i < n; i++) vertebra(y0 + ((y1 - y0) * i) / n, y0 + ((y1 - y0) * (i + 1)) / n);
  };
  run(0.3, 0.88, 7);
  run(1.18, 1.38, 3);
  run(1.64, 1.8, 2);

  // butt spike into the plinth socket
  b.spike(P(0, 0.31), [0, -1, 0], 0.17, 0.052, { color: boneP, sides: 6, bone: root, name: "buttSpike" });
  const ringAt = (y: number, R: number, r: number, color: string) => {
    const c = sp(y);
    b.part(new THREE.TorusGeometry(R, r, 5, 14), color, {
      bone: root,
      at: c,
      dir: [0, 1, 0],
      axis: "z",
      flat: true,
      name: "ring",
    });
  };
  ringAt(0.3, 0.054, 0.012, GOLD);
  ringAt(0.22, 0.046, 0.009, GOLD_D);

  // wrapped grips
  for (const [y0, y1] of [
    [0.88, 1.18],
    [1.38, 1.62],
  ] as const) {
    const seg = sn.slice(sn.closestT([X0, y0, 0]), sn.closestT([X0, y1, 0]));
    const turns = seg.length / 0.024;
    const wrap = paint((_p, _n, s) => {
      const k = s[1] / 360 - s[0] * turns;
      const f = k - Math.floor(k);
      if (f < 0.1) return GOLD_D;
      return f < 0.55 ? VIOLET : VIOLET_D;
    });
    b.sweep(seg, 0.043, { color: wrap, sides: 8, bone: root, caps: "flat", name: "grip" });
    for (const y of [y0, y1]) {
      ringAt(y, 0.05, 0.011, GOLD);
      ringAt(y + (y === y0 ? 0.03 : -0.03), 0.047, 0.006, GOLD_D);
    }
  }

  // ===========================================================================================================
  // TALONS holding the snath on the plinth
  for (let k = 0; k < 4; k++) {
    const a = ((k + 0.5) / 4) * Math.PI * 2;
    const sa = Math.sin(a);
    const ca = Math.cos(a);
    const at = (r: number, y: number) => P(r * sa, y, r * ca);
    const claw = catmull([at(0.4, 0.12), at(0.32, 0.3), at(0.18, 0.52), at(0.092, 0.68), at(0.075, 0.8)]);
    b.sweep(claw, [0.052, 0.01], { color: hornP, section: { ngon: 6 }, bone: root, caps: "point", name: "talon" });
    for (const t of [0.3, 0.55]) {
      const p = claw.at(t);
      b.part(new THREE.SphereGeometry(0.04 - 0.02 * t, 6, 4), BONE_SH, { bone: root, at: p, flat: true });
    }
    b.part(new THREE.TorusGeometry(0.04, 0.008, 4, 8), GOLD, {
      bone: root,
      at: claw.at(0.12),
      dir: claw.tangentAt(0.12),
      axis: "z",
      flat: true,
    });
  }

  // ===========================================================================================================
  // COLLAR + SOUL GEM CAGE
  b.lathe(
    [
      [0, 1.78],
      [0.07, 1.78],
      [0.055, 1.83],
      [0.05, 1.9],
      [0.065, 1.95],
      [0.0, 1.97],
    ],
    { at: P(0, 0), color: boneP, bone: root, segments: 8, name: "neckCup" },
  );
  ringAt(1.79, 0.074, 0.012, GOLD);
  ringAt(1.88, 0.056, 0.008, GOLD_D);
  for (let k = 0; k < 4; k++) {
    const a = ((k + 0.5) / 4) * Math.PI * 2;
    const sa = Math.sin(a);
    const ca = Math.cos(a);
    const at = (r: number, y: number) => P(r * sa, y, r * ca);
    b.sweep(catmull([at(0.07, 1.8), at(0.115, 1.7), at(0.105, 1.6), at(0.055, 1.52)]), [0.02, 0.006], {
      color: boneP,
      section: { ngon: 5 },
      bone: root,
      caps: "point",
      name: "cageProng",
    });
  }
  glow(
    b.part(new THREE.OctahedronGeometry(1, 0), TEAL, {
      bone: root,
      at: P(0, 1.66),
      scale: [0.082, 0.13, 0.082],
      flat: true,
      name: "soulGem",
    }),
    1.5,
  );
  glow(
    b.part(new THREE.OctahedronGeometry(1, 0), TEAL_W, {
      bone: root,
      at: P(0, 1.66),
      scale: [0.04, 0.07, 0.04],
      flat: true,
      name: "soulGemCore",
    }),
    1.6,
  );

  // streamers hanging from the collar
  const streamer: OutlinePoint[] = [
    [0, 0],
    [0.075, 0],
    [0.082, -0.2],
    [0.068, -0.42],
    [0.078, -0.6],
    [0.042, -0.5],
    [0.0, -0.66],
    [-0.01, -0.4],
    [-0.005, -0.2],
  ];
  const clothP = (len: number) =>
    paint((_p, _n, s) => {
      const y = -s[1];
      if (y < 0.018) return GOLD;
      if (y < 0.032) return GOLD_D;
      const edge = Math.min(s[0] + 0.005, 0.082 - s[0]) < 0.011;
      if (edge) return GOLD_D;
      return mix(VIOLET, VIOLET_D, smoothstep(0.05, len, y));
    });
  b.extrude(streamer, {
    at: P(-0.11, 1.9, 0.034),
    x: [1, 0, 0],
    y: [-0.16, 1, 0],
    thickness: 0.007,
    color: clothP(0.6),
    bone: root,
    name: "streamerA",
  });
  b.extrude(
    streamer.map(([x, y, c]) => (c ? [x * 0.9, y * 0.72, c] : [x * 0.9, y * 0.72])) as OutlinePoint[],
    {
      at: P(-0.065, 1.9, -0.034),
      x: [1, 0, 0],
      y: [-0.1, 1, 0],
      thickness: 0.007,
      color: clothP(0.45),
      bone: root,
      name: "streamerB",
    },
  );
  for (const [x, z] of [
    [-0.11, 0.034],
    [-0.065, -0.034],
  ] as const) {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { bone: root, at: P(x + 0.035, 1.895, z), flat: true });
  }

  // ===========================================================================================================
  // HANGING SOUL CHARM (swings)
  const charmPath = polyline([P(0, 1.4, 0.07), P(0, 1.31, 0.075), P(0, 1.22, 0.075)]);
  const charm = b.chain("charm", charmPath, { parent: root, names: ["charmA", "charmB"], role: "hinge" });
  b.rod(P(0, 1.4, 0.07), P(0, 1.3, 0.075), 0.005, { color: GOLD, sides: 5, bone: charm.joints[0], name: "charmChain" });
  b.part(new THREE.TorusGeometry(0.012, 0.004, 4, 8), GOLD, { bone: charm.joints[0], at: P(0, 1.4, 0.07), flat: true });
  b.part(new THREE.ConeGeometry(0.03, 0.035, 6), GOLD, { bone: charm.joints[1], at: P(0, 1.29, 0.075), flat: true });
  glow(
    b.part(new THREE.IcosahedronGeometry(0.03, 0), TEAL, { bone: charm.joints[1], at: P(0, 1.235, 0.075), flat: true }),
    1.4,
  );
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    b.rod(
      P(0.032 * Math.sin(a), 1.265, 0.075 + 0.032 * Math.cos(a)),
      P(0.032 * Math.sin(a), 1.205, 0.075 + 0.032 * Math.cos(a)),
      0.004,
      { color: GOLD_D, sides: 4, bone: charm.joints[1] },
    );
  }
  b.spike(P(0, 1.205, 0.075), [0, -1, 0], 0.05, 0.022, { color: GOLD, sides: 6, bone: charm.joints[1] });

  // ===========================================================================================================
  // SKULL
  const up: Station[] = [
    { x: -0.17, y: 2.045, rz: 0.045, ry: 0.05 },
    { x: -0.11, y: 2.085, rz: 0.09, ry: 0.095 },
    { x: -0.01, y: 2.105, rz: 0.112, ry: 0.105 },
    { x: 0.1, y: 2.095, rz: 0.105, ry: 0.09 },
    { x: 0.2, y: 2.07, rz: 0.075, ry: 0.07 },
    { x: 0.32, y: 2.055, rz: 0.068, ry: 0.055 },
    { x: 0.44, y: 2.045, rz: 0.064, ry: 0.045 },
    { x: 0.52, y: 2.04, rz: 0.05, ry: 0.036 },
  ];
  partIn(loftX(up, 6), boneP, skull);
  const low: Station[] = [
    { x: -0.06, y: 1.975, rz: 0.075, ry: 0.05 },
    { x: 0.05, y: 1.95, rz: 0.068, ry: 0.042 },
    { x: 0.17, y: 1.915, rz: 0.06, ry: 0.034 },
    { x: 0.3, y: 1.88, rz: 0.052, ry: 0.028 },
    { x: 0.41, y: 1.85, rz: 0.042, ry: 0.024 },
    { x: 0.47, y: 1.83, rz: 0.028, ry: 0.018 },
  ];
  partIn(loftX(low, 6), boneP, jaw);
  // dark mouth cavity and gum line
  partIn(
    loftX(
      [
        { x: 0.05, y: 1.995, rz: 0.062, ry: 0.01 },
        { x: 0.3, y: 2.0, rz: 0.05, ry: 0.012 },
        { x: 0.5, y: 2.0, rz: 0.036, ry: 0.01 },
      ],
      4,
    ),
    SOCKET,
    skull,
  );

  // teeth
  const toothRow = (st: Station[], bone: typeof skull, x0: number, x1: number, n: number, dirY: number) => {
    for (let i = 0; i < n; i++) {
      const x = x0 + ((x1 - x0) * i) / (n - 1);
      const s = stationAt(st, x);
      const fang = i >= n - 2 ? 1.5 : 1;
      for (const z of [1, -1]) {
        b.spike(
          [X0 + x, s.y + dirY * s.ry * 0.8, z * s.rz * 0.8],
          [0.25, dirY * 1, 0],
          0.045 * fang * (0.8 + 0.4 * rand()),
          0.011 * fang,
          { color: TEAL_W, sides: 5, bone, name: "tooth" },
        );
      }
    }
  };
  toothRow(up, skull, 0.18, 0.5, 8, -1);
  toothRow(low, jaw, 0.14, 0.45, 7, 1);

  // brow, eye sockets, glowing eyes
  for (const s of [1, -1]) {
    partIn(
      new THREE.SphereGeometry(1, 6, 4).scale(0.05, 0.036, 0.022).translate(X0 + 0.11, 2.1, s * 0.092),
      SOCKET,
      skull,
    );
    glow(
      b.part(new THREE.SphereGeometry(0.021, 6, 4), TEAL_W, {
        bone: skull,
        at: P(0.125, 2.1, s * 0.102),
        scale: [1.5, 1, 0.8],
        flat: true,
        name: "eye",
      }),
      1.6,
    );
    b.sweep(catmull([P(-0.02, 2.15, s * 0.07), P(0.1, 2.158, s * 0.099), P(0.2, 2.12, s * 0.085)]), [0.02, 0.01], {
      color: boneP,
      section: { ngon: 5 },
      bone: skull,
      caps: "point",
      name: "brow",
    });
    // gold brow cap
    b.sweep(catmull([P(0.0, 2.163, s * 0.068), P(0.1, 2.172, s * 0.095), P(0.18, 2.138, s * 0.084)]), 0.006, {
      color: GOLD,
      sides: 4,
      bone: skull,
    });
    // nostril
    partIn(new THREE.SphereGeometry(1, 5, 4).scale(0.016, 0.012, 0.008).translate(X0 + 0.475, 2.06, s * 0.032), SOCKET, skull);
    // cheek spikes
    b.spike(P(0.07, 1.99, s * 0.098), [-0.55, -0.25, s * 0.7], 0.11, 0.024, {
      color: boneP,
      sides: 5,
      bone: skull,
      name: "cheekSpike",
    });
    b.spike(P(0.17, 2.02, s * 0.075), [-0.2, -0.4, s * 0.9], 0.07, 0.016, { color: BONE_SH, sides: 5, bone: skull });
    // main horns, sweeping back and up
    const horn = b.sweep(
      catmull([P(-0.06, 2.15, s * 0.085), P(-0.24, 2.17, s * 0.14), P(-0.44, 2.2, s * 0.18), P(-0.64, 2.36, s * 0.2)]),
      [0.042, 0.005],
      { color: hornP, section: { ngon: 6 }, bone: skull, caps: "point", name: "horn" },
    );
    b.along(horn, 4, (at) =>
      b.spike(at, at, 0.05, 0.012, { color: BONE_SH, sides: 4, bone: skull, name: "hornSpur" }),
    );
    // lower horns
    b.sweep(
      catmull([P(-0.05, 2.0, s * 0.1), P(-0.2, 1.95, s * 0.17), P(-0.36, 1.84, s * 0.21), P(-0.5, 1.8, s * 0.22)]),
      [0.03, 0.004],
      { color: hornP, section: { ngon: 5 }, bone: skull, caps: "point", name: "lowHorn" },
    );
    // frill fin
    const fin: OutlinePoint[] = [
      [0, 0],
      [-0.12, 0.05],
      [-0.2, -0.02],
      [-0.17, -0.07],
      [-0.25, -0.15],
      [-0.1, -0.12],
      [-0.01, -0.07],
    ];
    b.extrude(fin, {
      at: P(-0.02, 2.04, s * 0.112),
      x: [1, 0, 0],
      thickness: 0.01,
      color: VIOLET,
      bone: skull,
      name: "frill",
    });
    b.extrude(
      fin.map(([x, y]) => [x * 0.7 - 0.01, y * 0.6 - 0.005] as OutlinePoint),
      {
        at: P(-0.02, 2.04, s * 0.118),
        x: [1, 0, 0],
        thickness: 0.006,
        color: TEAL_D,
        bone: skull,
        name: "frillInner",
      },
    );
    b.sweep([P(-0.02, 2.04, s * 0.115), P(-0.2, 2.02, s * 0.115), P(-0.28, 1.9, s * 0.115)], 0.009, {
      color: boneP,
      sides: 5,
      bone: skull,
      caps: "point",
    });
  }
  // crest: spikes along the skull's midline, forehead gem, nasal horn
  for (let i = 0; i < 7; i++) {
    const x = -0.14 + 0.065 * i;
    const s = stationAt(up, x);
    b.spike([X0 + x, s.y + s.ry * 0.95, 0], [-0.35, 0.9, 0], 0.075 - i * 0.006, 0.02 - i * 0.0015, {
      color: boneP,
      sides: 5,
      bone: skull,
      name: "crest",
    });
  }
  b.sweep([P(-0.15, 2.14, 0), P(0.0, 2.215, 0), P(0.15, 2.17, 0)], 0.007, {
    color: GOLD,
    sides: 4,
    bone: skull,
    name: "crestGold",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.03, 0), TEAL, {
      bone: skull,
      at: P(0.07, 2.2, 0),
      scale: [1, 1.5, 0.8],
      flat: true,
      name: "foreheadGem",
    }),
    1.5,
  );
  b.spike(P(0.46, 2.07, 0), [0.45, 0.9, 0], 0.09, 0.022, { color: boneP, sides: 5, bone: skull, name: "nasalHorn" });

  // ===========================================================================================================
  // BLADE
  const N = 16;
  const outline: OutlinePoint[] = [];
  for (let i = 0; i <= N; i++) {
    const p = backPath.at(i / N);
    outline.push(i === 0 || i === N ? [p.x, p.y, "sharp"] : [p.x, p.y]);
  }
  for (let i = N - 1; i >= 0; i--) {
    const p = edgePath.at(i / N);
    outline.push(i === 0 ? [p.x, p.y, "sharp"] : [p.x, p.y]);
  }
  b.extrude(outline, {
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    bevel: 0.008,
    color: bladeP,
    bone: skull,
    name: "blade",
  });
  // glowing edge
  glow(
    b.sweep(edgePath.slice(0.03, 1), [0.011, 0.005], {
      color: TEAL_W,
      section: { ngon: 4 },
      bone: skull,
      caps: "point",
      name: "edgeGlow",
    }),
    1.4,
  );
  // spine ridge
  b.sweep(backPath, [0.036, 0.005], { color: boneP, section: { ngon: 6 }, bone: skull, caps: "point", name: "bladeRidge" });
  // back spurs
  const spurs = 9;
  for (let i = 0; i < spurs; i++) {
    const t = 0.1 + (0.78 * i) / (spurs - 1);
    const p = backPath.at(t);
    const tg = backPath.tangentAt(t);
    const n = new THREE.Vector3(-tg.y, tg.x, 0);
    const d = n.multiplyScalar(0.8).addScaledVector(tg, 0.6).normalize();
    b.spike(p, d, 0.1 - 0.06 * t, 0.018 - 0.008 * t, { color: boneP, sides: 5, bone: skull, name: "bladeSpur" });
  }
  // finger-bone ribs radiating from the heel
  for (const r of [0.3, 0.62]) {
    const pts = Array.from({ length: 9 }, (_, i) => {
      const t = (0.88 * i) / 8;
      return edgePath.at(t).lerp(backPath.at(t), r);
    });
    b.sweep(catmull(pts), [0.019, 0.005], { color: boneP, sides: 5, bone: skull, caps: "point", name: "rib" });
    for (const t of [0.35, 0.65]) {
      const p = catmull(pts).at(t);
      b.part(new THREE.SphereGeometry(0.018, 5, 4), BONE_SH, { bone: skull, at: p, flat: true });
    }
  }
  // heel: ferrule, knuckle, tang
  b.part(new THREE.BoxGeometry(0.06, 0.2, 0.062), GOLD, { bone: skull, at: P(0.61, 1.94), flat: true, name: "ferrule" });
  b.part(new THREE.BoxGeometry(0.03, 0.17, 0.068), GOLD_D, { bone: skull, at: P(0.665, 1.945), flat: true });
  b.part(new THREE.SphereGeometry(0.045, 6, 5), boneP, { bone: skull, at: P(0.7, 1.99), flat: true, name: "heelKnuckle" });
  glow(
    b.part(new THREE.BoxGeometry(0.52, 0.04, 0.022), TEAL, { bone: skull, at: P(0.37, 1.93), name: "tang" }),
    1.2,
  );
  // runes on both faces
  const mid = (t: number) => edgePath.at(t).lerp(backPath.at(t), 0.5);
  const midPath = catmull(Array.from({ length: 9 }, (_, i) => mid(i / 8)));
  [glyphA, glyphB, glyphC, glyphA].forEach((tex, i) => {
    const t = 0.3 + i * 0.17;
    const p = midPath.at(t);
    const tg = midPath.tangentAt(t);
    const n = new THREE.Vector3(-tg.y, tg.x, 0);
    for (const s of [1, -1]) {
      glow(
        b.part(new THREE.PlaneGeometry(0.065 - i * 0.004, 0.098 - i * 0.006), "#ffffff", {
          bone: skull,
          at: [p.x, p.y, s * 0.0185],
          dir: [0, 0, s],
          axis: "z",
          up: [n.x, n.y, 0],
          texture: tex,
          name: "rune",
        }),
        1.3,
      );
    }
  });
  // soul fire along the back edge
  const flameFrames = Array.from({ length: 13 }, (_, i) => {
    const t = 0.08 + (0.86 * i) / 12;
    const p = backPath.at(t);
    const tg = backPath.tangentAt(t);
    const n = new THREE.Vector3(-tg.y, tg.x, 0);
    const d = n.multiplyScalar(0.85).addScaledVector(tg, 0.55).normalize();
    return frame(p.clone().addScaledVector(d, 0.012), d);
  });
  glow(
    b.cards(flameFrames, flameTex, {
      size: [0.075, 0.2],
      flow: [0, 0, 1],
      vary: 0.35,
      rng: rng(5),
      bone: skull,
    }),
    1.2,
  );
  // flame licks from the horn tips
  for (const s of [1, -1]) {
    glow(
      b.cards([frame(P(-0.64, 2.36, s * 0.2), [-0.4, 1, 0])], flameTex, {
        size: [0.05, 0.14],
        flow: [0, 0, 1],
        bone: skull,
      }),
      1.2,
    );
  }

  // ===========================================================================================================
  // SOUL WISPS around the blade and plinth
  const wisps: [number, number, number, number, string][] = [
    [1.12, 1.45, 0.05, 0.035, TEAL],
    [0.9, 1.62, 0.1, 0.026, CYAN],
    [1.3, 1.25, -0.04, 0.022, MINT],
    [0.76, 1.78, -0.05, 0.02, TEAL_W],
    [1.45, 1.62, 0.06, 0.018, CYAN],
    [0.22, 0.5, 0.2, 0.026, TEAL],
    [-0.2, 0.7, 0.22, 0.02, MINT],
    [0.15, 1.02, -0.2, 0.022, CYAN],
  ];
  wisps.forEach(([x, y, z, r, col]) => {
    const pos = P(x, y, z);
    glow(b.part(new THREE.IcosahedronGeometry(r, 0), col, { bone: root, at: pos, flat: true, name: "wisp" }), 1.5);
    const tip = P(x - 0.1, y + 0.2, z - 0.03);
    const ctrl = P(x + 0.04, y + 0.09, z + 0.02);
    glow(
      b.sweep(bezier(pos, ctrl, tip), [r * 0.85, 0], {
        color: col,
        sides: 5,
        bone: root,
        caps: { start: "none", end: "point" },
        name: "wispTail",
      }),
      1.2,
    );
  });

  return b.root;
}
