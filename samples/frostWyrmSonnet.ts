import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { Builder } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { aim, lerp, offset, rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { limb } from "../src/ik";
import { cells, mix, noise, paint, smoothstep } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";
import type { Chain, Joint } from "../src/skeleton";

export const meta = {
  name: "Frost Wyrm",
  description:
    "Undead skeletal-ice dragon of Northrend: chunky pale bones wrapped in frozen sinew, iron-bound with glowing runes, a heart of cold fire in its ribcage and wings torn to shreds.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const BONE = "#c4d2dc";
const BONE_HI = "#eaf4f8";
const BONE_MID = "#93a9bb";
const BONE_DK = "#5c7590";
const TOOTH = "#e4eef2";
const ICE = "#6fd2ff";
const ICE_L = "#d9f6ff";
const ICE_D = "#3b8fd0";
const NAVY = "#101c36";
const SINEW = "#3a72c0";
const SINEW_L = "#6aa6e6";
const MEM_DARK = "#3a62a8";
const MEM_MID = "#6aa0de";
const MEM_LIGHT = "#b0d8f6";
const CYAN = "#7ff6ff";
const IRON = "#363f56";
const IRON_L = "#7a8aa5";
const CLAW = "#2a78c8";

// ---------------------------------------------------------------------------------------------------------------
// Paints (hand-painted look: top-light highlight, cool shade underneath, frost and cracks)
const BONE_P = paint((p, n) => {
  const up = smoothstep(-0.7, 0.85, n.y);
  let col = mix(BONE_DK, BONE, 0.15 + 0.85 * up);
  const blot = noise(p, 0.45, 5);
  col = mix(col, BONE_MID, 0.45 * smoothstep(0.55, 0.85, blot));
  const frost = noise(p, 0.2, 9);
  col = mix(col, BONE_HI, 0.55 * smoothstep(0.6, 0.9, frost) * (0.3 + 0.7 * up));
  const c = cells(p, 0.55, 7);
  const e = c.d2 - c.d1;
  if (e < 0.05) col = mix(col, BONE_DK, 0.85 * (1 - e / 0.05));
  const ice = noise(p, 0.3, 21);
  if (ice > 0.72 && n.y < 0.2) col = mix(col, ICE, 0.45);
  return col;
});

const SINEW_P = paint((p, n) => {
  const dn = smoothstep(-0.8, 0.6, n.y);
  let col = mix("#1f4585", SINEW, 0.3 + 0.7 * dn);
  col = mix(col, SINEW_L, 0.6 * smoothstep(0.55, 0.85, noise(p, 0.4, 3)));
  const c = cells(p, 0.3, 4);
  const e = c.d2 - c.d1;
  if (e < 0.08) col = mix(col, "#1a3a74", 0.6 * (1 - e / 0.08));
  col = mix(col, ICE_L, 0.7 * smoothstep(0.66, 0.85, noise(p, 0.16, 12)) * smoothstep(0.2, 0.9, n.y));
  return col;
});

const IRON_P = paint((p, n) => {
  let col = mix(IRON, IRON_L, 0.25 + 0.55 * smoothstep(-0.2, 0.9, n.y));
  col = mix(col, NAVY, 0.5 * smoothstep(0.55, 0.85, noise(p, 0.15, 2)));
  col = mix(col, ICE_L, 0.55 * smoothstep(0.7, 0.9, noise(p, 0.1, 31)));
  return col;
});

const ICE_P = paint((p, n) => {
  let col = mix(ICE_D, ICE, 0.3 + 0.7 * smoothstep(-0.5, 0.9, n.y));
  col = mix(col, ICE_L, 0.8 * smoothstep(0.5, 0.85, noise(p, 0.22, 17)));
  return col;
});

const memPaint = (root: THREE.Vector3) =>
  paint((p) => {
    const d = Math.min(1, p.distanceTo(root) / 8.5);
    let col = mix(MEM_DARK, MEM_MID, smoothstep(0.0, 0.85, d));
    col = mix(col, "#2a4a8c", 0.45 * smoothstep(0.5, 0.8, noise(p, 0.7, 14)) * (1 - d));
    col = mix(col, MEM_LIGHT, 0.5 * smoothstep(0.6, 0.85, noise(p, 0.35, 6)));
    const c = cells(p, 0.75, 2);
    const e = c.d2 - c.d1;
    if (e < 0.05) col = mix(col, ICE_L, 0.6 * (1 - e / 0.05) * (0.4 + 0.6 * d));
    col = mix(col, ICE_L, 0.8 * smoothstep(0.82, 1.0, d) * smoothstep(0.4, 0.7, noise(p, 0.18, 8)));
    return col;
  });

// ---------------------------------------------------------------------------------------------------------------
// Textures
const ICICLE = svg(
  `<svg viewBox="0 0 32 96"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#b6ecff"/><stop offset="0.5" stop-color="#ffffff"/><stop offset="1" stop-color="#63bdea"/></linearGradient></defs>
  <polygon points="5,96 16,2 27,96" fill="url(#g)"/>
  <polygon points="16,2 27,96 17,96" fill="#5fb6e6" opacity="0.65"/>
  <polygon points="0,96 7,56 11,96" fill="url(#g)"/>
  <polygon points="21,96 26,64 32,96" fill="url(#g)"/></svg>`,
  { size: 128 },
);

const RAG_A = svg(
  `<svg viewBox="0 0 48 96"><polygon points="6,96 42,96 44,72 38,54 43,32 31,10 27,0 22,20 12,36 17,54 4,72" fill="#3d62a2"/>
  <polygon points="6,96 20,96 22,60 14,40 12,36 17,54 4,72" fill="#5584c8"/>
  <polyline points="24,96 25,70 21,50 24,30 27,8" stroke="#a8d4f0" stroke-width="1.8" fill="none" stroke-dasharray="4 3"/>
  <polygon points="38,54 43,32 31,10 33,30" fill="#e6f8ff" opacity="0.85"/>
  <polygon points="6,96 42,96 42,90 6,90" fill="#24407a"/>
  <circle cx="24" cy="80" r="4" fill="#9fe8ff"/></svg>`,
  { size: 128 },
);

const RAG_B = svg(
  `<svg viewBox="0 0 48 96"><polygon points="4,96 44,96 40,70 46,48 34,36 36,14 24,2 20,24 8,40 14,62" fill="#4b72b4"/>
  <polygon points="4,96 18,96 16,64 8,40 14,62" fill="#6f9ad8"/>
  <polygon points="34,36 36,14 24,2 28,26" fill="#e6f8ff" opacity="0.8"/>
  <polygon points="4,96 44,96 44,90 4,90" fill="#24407a"/>
  <polyline points="26,92 27,66 22,46" stroke="#a8d4f0" stroke-width="1.8" fill="none" stroke-dasharray="4 3"/></svg>`,
  { size: 128 },
);

const RUNES = svg(
  `<svg viewBox="0 0 64 64" fill="none" stroke="#7ff6ff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="32" cy="32" r="26"/><circle cx="32" cy="32" r="19" stroke-width="1.8"/>
  <path d="M32 14 L32 50 M32 24 L42 34 M32 32 L22 42"/><path d="M20 18 L26 24 M44 18 L38 24 M20 46 L26 40 M44 46 L38 40"/></svg>`,
  { size: 192 },
);

const RUNE_BAR = svg(
  `<svg viewBox="0 0 96 24" fill="none" stroke="#7ff6ff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 4 L6 20 M6 12 L14 6 M22 4 L22 20 L30 12 M38 20 L38 4 L46 12 L38 12"/>
  <path d="M54 4 L62 20 L54 20 M68 4 L68 20 M68 10 L76 10 M84 4 L92 12 L84 20"/></svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------
// Helpers
type Vec = THREE.Vector3;

const prof = (pts: ReadonlyArray<readonly [number, number]>) => (t: number) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const k = (t - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]);
      return pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k;
    }
  }
  return pts[pts.length - 1][1];
};

type BagItem = { bone: Joint; color: string; geos: THREE.BufferGeometry[] };
class Bag {
  private readonly items = new Map<string, BagItem>();
  add(bone: Joint, color: string, geo: THREE.BufferGeometry) {
    const key = `${bone.name}|${color}`;
    let item = this.items.get(key);
    if (!item) {
      item = { bone, color, geos: [] };
      this.items.set(key, item);
    }
    const g = geo.index ? geo.toNonIndexed() : geo;
    g.deleteAttribute("uv");
    item.geos.push(g);
  }
  cone(bone: Joint, color: string, base: Vec | readonly number[], dir: readonly number[], len: number, r: number, sides = 6) {
    const g = new THREE.ConeGeometry(r, len, sides, 1);
    g.translate(0, len / 2, 0);
    g.applyQuaternion(aim(dir));
    const p = base instanceof THREE.Vector3 ? base : new THREE.Vector3(base[0], base[1], base[2]);
    g.translate(p.x, p.y, p.z);
    this.add(bone, color, g);
  }
  ball(bone: Joint, color: string, at: Vec | readonly number[], r: number, sx = 1, sy = 1, sz = 1) {
    const g = new THREE.IcosahedronGeometry(r, 0);
    g.scale(sx, sy, sz);
    const p = at instanceof THREE.Vector3 ? at : new THREE.Vector3(at[0], at[1], at[2]);
    g.translate(p.x, p.y, p.z);
    this.add(bone, color, g);
  }
  flush(b: Builder) {
    for (const { bone, color, geos } of this.items.values())
      b.part(mergeGeometries(geos, false), color, { bone, at: [0, 0, 0], flat: true });
  }
}

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "frostWyrm", paintSize: 2048 });
  const R = rng(1337);
  const bag = new Bag();
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ------------------------------------------------------------------ skeleton: spine, neck, head, jaw, tail
  const hips = b.joint("hips", { at: [0, 3.0, -1.4], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 3.0, -1.4],
      [0, 3.15, 0.2],
      [0, 3.4, 1.5],
      [0, 3.75, 2.9],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 3.75, 2.9],
      [0, 4.4, 3.35],
      [0, 5.0, 3.95],
      [0, 5.2, 4.65],
    ]),
    { parent: spine.tip!, names: ["neck1", "neck2", "neck3", "neckTip"], role: "neck" },
  );
  const K = 1.35; // head scale: a big heroic skull
  const head = b.joint("head", { parent: neck.tip!, at: neck.at(1).at, dir: [0, -0.2, 1], role: "head" });
  const H = (f: number, u: number, l: number) => head.local({ forward: f * K, up: u * K, left: l * K });
  const jaw = b.joint("jaw", { parent: head, at: H(0.2, -0.3, 0), aim: H(1.6, -0.5, 0), role: "jaw" });
  b.pose(jaw, { axis: [1, 0, 0], deg: 17 });
  const J = (f: number, u: number, l: number) => jaw.local([-l * K, f * K, u * K]);

  const tailPath = catmull([
    [0, 3.0, -1.4],
    [0, 2.95, -3.0],
    [0, 2.4, -5.0],
    [0, 1.5, -7.0],
    [0, 0.8, -9.0],
    [0.6, 0.5, -10.6],
    [1.3, 0.4, -11.8],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6", "tailTip"],
    role: "tail",
  });

  // ------------------------------------------------------------------ torso
  const rx = prof([[0, 0.5], [0.5, 0.56], [0.8, 0.7], [1, 0.62]]);
  const ry = prof([[0, 0.66], [0.5, 0.74], [0.8, 0.9], [1, 0.72]]);
  const torso = b.sweep(spine, (t) => [rx(t), ry(t)], {
    color: SINEW_P,
    shift: () => [0, -0.5],
    sides: 10,
  });
  b.sweep(tail, prof([[0, 0.68], [0.15, 0.55], [0.45, 0.36], [0.75, 0.2], [1, 0.1]]), {
    color: SINEW_P,
    sides: 8,
  });

  // ribcage: open arches outside the sinew, a few snapped off
  const ribJoint = (t: number) => spine.jointAt(t);
  const ribCount = 7;
  for (let i = 0; i < ribCount; i++) {
    const t = 0.17 + (0.56 * i) / (ribCount - 1);
    const c = spine.at(t).at;
    const cy = c.y - 0.5;
    const a = (rx(t) * 1.5 + 0.1) * (i === 0 ? 0.9 : 1);
    const bb = ry(t) * 1.2;
    for (const s of [1, -1]) {
      const broken = (i === 1 && s === 1) || (i === 4 && s === -1) || (i === 6 && s === 1);
      const end = broken ? 105 : 152;
      const pts: Vec[] = [];
      const steps = 6;
      for (let k = 0; k <= steps; k++) {
        const phi = ((10 + ((end - 10) * k) / steps) * Math.PI) / 180;
        pts.push(V(s * a * Math.sin(phi) * (k === 0 ? 0.35 : 1), cy + bb * Math.cos(phi), c.z - 0.35 * Math.sin(phi * 0.5)));
      }
      b.sweep(catmull(pts), [0.17 - 0.012 * i, broken ? 0.07 : 0.045], {
        color: BONE_P,
        bone: ribJoint(t),
        sides: 6,
        caps: { start: "round", end: broken ? "flat" : "point" },
      });
      // rib head knob
      bag.ball(ribJoint(t), BONE, [s * 0.1, c.y + 0.1, c.z], 0.15, 1, 0.8, 1);
      // frozen drip on the lower rim
      if (!broken && i % 2 === 0) bag.cone(ribJoint(t), ICE, pts[steps], [0, -1, 0.2], 0.3, 0.05, 5);
    }
  }
  // sternum keel under the chest
  {
    const c0 = spine.at(0.2).at;
    const c1 = spine.at(0.75).at;
    b.sweep(
      catmull([V(0, c0.y - 1.55, c0.z + 0.1), V(0, c1.y - 1.62, (c0.z + c1.z) / 2), V(0, c1.y - 1.4, c1.z + 0.15)]),
      [0.11, 0.07],
      { color: BONE_P, bone: spine.joints[2], sides: 6 },
    );
  }

  // vertebrae + dorsal ice crest along back
  b.along(spine, 9, (at) => {
    b.part(new THREE.BoxGeometry(0.34, 0.3, 0.26), BONE_P, { frame: at.moved([0, 0, 0.36]), flat: true });
    return null;
  });
  for (let i = 0; i < 12; i++) {
    const t = 0.04 + (0.92 * i) / 11;
    const p = spine.at(t);
    const j = spine.jointAt(t);
    const s = 0.5 + 0.5 * Math.sin((i / 11) * Math.PI);
    bag.cone(j, i % 2 ? ICE : BONE_HI, p.at.clone().add(V(0, 0.48, 0)), [0, 1, -0.45], 0.4 + 0.5 * s, 0.07 + 0.05 * s);
  }

  // frost core: a glowing heart of cold fire caged in iron and ice on the breastbone
  {
    const hc = V(0, 2.95, 3.52);
    const hj = spine.joints[2];
    glow(b.part(new THREE.IcosahedronGeometry(0.3, 0), CYAN, { bone: hj, at: hc, flat: true }), 2);
    b.part(new THREE.TorusGeometry(0.42, 0.07, 5, 10), IRON_P, { bone: hj, at: hc, dir: [0, 0, 1], axis: "z", flat: true });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + 0.2;
      const d = [Math.cos(a), Math.sin(a), 0.45];
      bag.cone(hj, k % 2 ? ICE_L : BONE_HI, hc.clone().add(V(d[0] * 0.42, d[1] * 0.42, 0.05)), d, 0.5, 0.08, 5);
    }
  }

  // belly plates: bone and frost-iron scutes down the underside
  for (let i = 0; i < 9; i++) {
    const t = 0.06 + 0.88 * (i / 8);
    const c = spine.at(t).at;
    const g = new THREE.BoxGeometry(rx(t) * 1.7, 0.07, 0.3);
    g.translate(0, c.y - 0.5 - ry(t) * 0.97, c.z);
    bag.add(spine.jointAt(t), i % 2 ? IRON : BONE_MID, g);
  }

  // frost-iron harness straps round the torso, with rivets
  const skin = b.surface(torso);
  for (const jn of [spine.joints[2], spine.joints[0]]) {
    const loop = skin.loop(jn, { lift: 0.03 });
    b.sweep(loop, [0.075, 0.07], { color: IRON_P, sides: 6 });
    b.along(loop, 14, (at) => {
      bag.ball(at.bone ?? jn, IRON_L, at.at, 0.045, 1, 1, 1);
      return null;
    });
  }

  // ------------------------------------------------------------------ neck
  const neckTube = b.sweep(neck, prof([[0, 0.42], [1, 0.3]]), { color: SINEW_P, sides: 8 });
  b.along(neck, 7, (at) => {
    b.part(new THREE.CylinderGeometry(0.42, 0.42, 0.17, 8), BONE_P, { frame: at, flat: true });
    return null;
  });
  for (let i = 0; i < 9; i++) {
    const t = 0.05 + (0.9 * i) / 8;
    const p = neck.at(t);
    const j = neck.jointAt(t);
    const up = V(0, 1, -0.35).normalize();
    bag.cone(j, i % 2 ? ICE : BONE_HI, p.at.clone().add(V(0, 0.4, 0)), [up.x, up.y, up.z], 0.45 - 0.02 * i, 0.06);
  }
  for (const t of [0.35, 0.7]) {
    const jn = neck.jointAt(t);
    const loop = b.surface(neckTube).loop(jn, { lift: 0.03 });
    b.sweep(loop, 0.06, { color: IRON_P, sides: 6 });
    b.along(loop, 10, (at) => {
      bag.ball(at.bone ?? jn, IRON_L, at.at, 0.05);
      return null;
    });
  }

  // ------------------------------------------------------------------ head
  b.loft(
    [
      { at: H(-0.2, 0.0, 0), w: 0.95 * K, h: 0.85 * K },
      { at: H(0.3, 0.05, 0), w: 1.0 * K, h: 0.82 * K },
      { at: H(0.85, -0.02, 0), w: 0.7 * K, h: 0.6 * K },
      { at: H(1.35, -0.1, 0), w: 0.52 * K, h: 0.44 * K },
      { at: H(1.78, -0.18, 0), w: 0.48 * K, h: 0.38 * K },
    ],
    { bone: head, color: BONE_P, section: { ngon: 8 } },
  );
  // palate / mouth interior
  b.part(new THREE.BoxGeometry(0.46 * K, 1.1 * K, 0.12 * K), NAVY, { bone: head, at: H(1.0, -0.33, 0), aim: H(1.6, -0.36, 0), flat: true });
  b.part(new THREE.BoxGeometry(0.5 * K, 0.5 * K, 0.35 * K), NAVY, { bone: head, at: H(0.35, -0.25, 0), flat: true });
  glow(b.part(new THREE.IcosahedronGeometry(0.2 * K, 0), CYAN, { bone: head, at: H(0.3, -0.3, 0), flat: true }), 1.2);

  for (const s of [1, -1]) {
    // eye socket, glowing eye, bone ring, heavy brow
    const eyeAt = H(0.62, 0.2, s * 0.4);
    b.part(new THREE.SphereGeometry(0.2 * K, 7, 5), NAVY, { bone: head, at: eyeAt, scale: [1, 1, 0.85] });
    glow(b.part(new THREE.IcosahedronGeometry(0.12 * K, 1), CYAN, { bone: head, at: H(0.66, 0.2, s * 0.43), flat: true }), 2);
    b.part(new THREE.TorusGeometry(0.2 * K, 0.045 * K, 5, 9), BONE_HI, {
      bone: head,
      at: H(0.64, 0.2, s * 0.44),
      dir: [s * 0.7, 0.1, 0.6],
      axis: "z",
      flat: true,
    });
    b.capsule(H(0.15, 0.4, s * 0.5), H(0.98, 0.27, s * 0.24), [0.14 * K, 0.1 * K], { bone: head, color: BONE_P, sides: 6 });
    // cheek ridge
    b.capsule(H(0.1, -0.1, s * 0.5), H(1.15, -0.12, s * 0.3), [0.11 * K, 0.07 * K], { bone: head, color: BONE_P, sides: 6 });
    // nostril
    b.part(new THREE.SphereGeometry(0.08 * K, 6, 4), NAVY, { bone: head, at: H(1.68, 0.02, s * 0.14), scale: [1, 1.4, 0.8] });
    // great swept horns
    b.sweep(bezier(H(0.1, 0.32, s * 0.42), H(-0.5, 0.75, s * 0.95), H(-1.1, 0.7, s * 1.5), H(-1.45, 1.3, s * 1.85)), [0.2 * K, 0.012], {
      bone: head,
      color: BONE_P,
      sides: 6,
      caps: { start: "flat", end: "point" },
    });
    b.sweep(bezier(H(0.25, 0.4, s * 0.36), H(0.0, 0.9, s * 0.7), H(-0.3, 1.0, s * 1.0), H(-0.55, 1.5, s * 1.15)), [0.12 * K, 0.01], {
      bone: head,
      color: ICE_P,
      sides: 6,
      caps: { start: "flat", end: "point" },
    });
    // brow horns above the eyes
    b.sweep(bezier(H(0.55, 0.42, s * 0.42), H(0.55, 0.7, s * 0.5), H(0.35, 0.9, s * 0.58), H(0.1, 1.1, s * 0.62)), [0.09 * K, 0.01], {
      bone: head,
      color: BONE_HI,
      sides: 6,
      caps: { start: "flat", end: "point" },
    });
    // cheek / jaw-hinge spikes
    bag.cone(head, BONE_HI, H(0.15, -0.15, s * 0.5), [s * 0.5, -0.1, -0.7], 0.55 * K, 0.1 * K);
    bag.cone(head, BONE_HI, H(0.4, -0.2, s * 0.45), [s * 0.6, -0.3, -0.3], 0.38 * K, 0.08 * K);
    bag.cone(head, BONE_HI, H(0.7, -0.22, s * 0.5), [s * 0.7, -0.4, 0.2], 0.3 * K, 0.07 * K);
    // muzzle fins
    bag.cone(head, ICE, H(1.1, 0.3, s * 0.18), [s * 0.15, 0.8, -0.5], 0.3 * K, 0.06 * K);
    bag.cone(head, ICE, H(1.35, 0.22, s * 0.14), [s * 0.1, 0.8, -0.4], 0.24 * K, 0.05 * K);
    // upper teeth
    for (let k = 0; k < 7; k++) {
      const f = 0.75 + k * 0.15;
      const w = 0.34 - 0.08 * ((f - 0.75) / 1.0);
      const u = -0.3 - 0.06 * (f - 0.7);
      bag.cone(head, TOOTH, H(f, u, s * w * 0.9), [0, -1, 0.1], (0.17 + 0.05 * (k % 2)) * K, 0.045 * K);
    }
    bag.cone(head, TOOTH, H(1.62, -0.33, s * 0.17), [0, -1, 0.2], 0.46 * K, 0.08 * K);
    bag.cone(head, TOOTH, H(0.6, -0.32, s * 0.3), [0, -1, 0.1], 0.2 * K, 0.05 * K);
    // lower teeth, set on the jaw
    for (let k = 0; k < 7; k++) {
      const f = 0.5 + k * 0.15;
      const w = 0.4 - 0.11 * (f / 1.5);
      bag.cone(jaw, TOOTH, J(f, 0.1, s * w * 0.85), [0, 0.8, 0.5], 0.16 * K, 0.04 * K);
    }
    bag.cone(jaw, TOOTH, J(1.5, 0.08, s * 0.13), [0, 0.5, 1], 0.4 * K, 0.07 * K);
    // chin-side spikes
    bag.cone(jaw, BONE_HI, J(0.2, -0.1, s * 0.46), [s * 0.5, -0.2, -0.8], 0.5 * K, 0.09 * K);
    bag.cone(jaw, BONE_HI, J(0.55, -0.12, s * 0.36), [s * 0.4, 0.0, -0.9], 0.34 * K, 0.07 * K);
    // frill blades fanned behind the skull
    for (let k = 0; k < 4; k++) {
      b.sweep(
        bezier(H(-0.15, 0.1 - 0.1 * k, s * 0.42), H(-0.5, 0.25 - 0.18 * k, s * (0.7 + 0.2 * k)), H(-0.85, 0.2 - 0.25 * k, s * (1.0 + 0.3 * k)), H(-1.1, 0.05 - 0.45 * k, s * (1.1 + 0.4 * k))),
        [0.07 * K, 0.008],
        { bone: head, color: k % 2 ? ICE_P : BONE_P, sides: 5, caps: { start: "flat", end: "point" } },
      );
    }
  }
  // crest of ice spikes on the skull
  for (let k = 0; k < 5; k++) {
    const f = 0.0 + k * 0.22;
    bag.cone(head, k % 2 ? ICE_L : ICE, H(f, 0.4 - 0.03 * k, 0), [0, 1, -0.5 - 0.1 * k], (0.55 - 0.06 * k) * K, (0.09 - 0.008 * k) * K);
  }
  // lower jaw
  b.loft(
    [
      { at: J(0.0, 0.0, 0), w: 0.88 * K, h: 0.34 * K },
      { at: J(0.55, -0.04, 0), w: 0.62 * K, h: 0.27 * K },
      { at: J(1.1, -0.08, 0), w: 0.42 * K, h: 0.22 * K },
      { at: J(1.52, -0.1, 0), w: 0.36 * K, h: 0.2 * K },
    ],
    { bone: jaw, color: BONE_P, section: { ngon: 8 } },
  );
  b.sweep(bezier(J(1.45, -0.12, 0), J(1.62, -0.25, 0), J(1.7, -0.45, 0), J(1.62, -0.7, 0)), [0.08 * K, 0.01], {
    bone: jaw,
    color: ICE_P,
    sides: 6,
    caps: { start: "flat", end: "point" },
  });
  // rune plate on the forehead
  glow(
    b.part(new THREE.PlaneGeometry(0.3 * K, 0.3 * K), "#ffffff", {
      bone: head,
      at: H(0.3, 0.44, 0),
      dir: head.local({ up: 1 }).clone().sub(head.at).normalize().toArray(),
      axis: "z",
      texture: RUNES,
    }),
    1.5,
  );

  // ------------------------------------------------------------------ tail details
  b.along(tail, 12, (at) => {
    const r = 0.58 * (1 - at.t) + 0.12;
    b.part(new THREE.BoxGeometry(r * 1.15, 0.22, r * 0.9), BONE_P, { frame: at, at: at.at.clone().add(V(0, r * 0.75, 0)), flat: true });
    return null;
  });
  for (let i = 0; i < 12; i++) {
    const t = 0.05 + 0.85 * (i / 11);
    const p = tail.at(t);
    const j = tail.jointAt(t);
    const r = 0.62 * (1 - t) + 0.1;
    bag.cone(j, i % 2 ? ICE : BONE_HI, p.at.clone().add(V(0, r * 0.85, 0)), [0, 1, -0.7], 0.3 + 0.5 * (1 - t), 0.05 + 0.06 * (1 - t));
  }
  // tail blade
  {
    const end = tailPath.at(1);
    const T = tailPath.tangentAt(1);
    T.y = 0;
    T.normalize();
    b.extrude(
      [
        [-0.3, -0.4],
        [0.3, -0.42],
        [1.0, -0.3, "sharp"],
        [2.2, 0.05, "sharp"],
        [1.4, 0.5, "sharp"],
        [1.1, 1.55, "sharp"],
        [0.4, 0.95],
        [-0.2, 0.5],
      ],
      { at: end, x: T.toArray(), y: [0, 1, 0], thickness: 0.09, bevel: 0.03, color: ICE_P, bone: tail.tip! },
    );
    b.spike(end, offset(end, T, 2.2), null, 0.11, { color: BONE_P, bone: tail.tip!, caps: "point" });
    for (let k = 0; k < 4; k++) bag.cone(tail.tip!, k % 2 ? ICE_L : BONE_HI, offset(offset(end, T, 0.3 + 0.35 * k), [0, 1, 0], 0.05), [0, 1, -0.2], 0.4 + 0.1 * k, 0.08);
    const side = new THREE.Vector3(0, 1, 0).cross(T).normalize();
    for (const s of [1, -1])
      b.spike(offset(end, side, s * 0.12), offset(offset(end, T, 0.4), side, s * 0.55), null, 0.1, { color: BONE_P, bone: tail.tip!, caps: "point" });
  }

  // ------------------------------------------------------------------ legs
  type Leg = { joints: Joint[]; chain: Chain };
  const makeToes = (tip: Joint, foot: Vec, tag: string, count: number, len: number, rad: number, fwd: number) => {
    const spread = count === 3 ? [-30, 0, 30] : [-40, -14, 14, 40];
    spread.forEach((deg, i) => {
      const a = (deg * Math.PI) / 180;
      const dir = V(Math.sin(a), 0, Math.cos(a) * fwd).normalize();
      const start = foot.clone().add(V(dir.x * 0.1, 0, dir.z * 0.1));
      const end = start.clone().addScaledVector(dir, len * (i === 1 || (count === 4 && i === 2) ? 1.12 : 0.95));
      start.y = foot.y;
      end.y = rad;
      const toe = b.chain(`toe${tag}${i + 1}`, polyline([start, end]), {
        parent: tip,
        names: [`toe${tag}${i + 1}`, `toe${tag}${i + 1}Tip`],
        role: "digit",
      });
      b.sweep(toe, [rad * 1.15, rad * 0.85], { color: BONE_P, sides: 6 });
      b.spike(end, [dir.x * 0.75, -0.45, dir.z * 0.75], 0.46, rad * 0.7, { color: CLAW, bone: toe.tip!, caps: "point" });
      // knuckle
      bag.ball(toe.joints[0], BONE_HI, start.clone().add(V(0, 0.05, 0)), rad * 1.25);
    });
  };

  const legBuild = (
    side: string,
    root: Vec,
    target: Vec,
    lengths: number[],
    bends: number[][],
    names: string[],
    radii: Array<[number, number]>,
    parent: Joint,
  ): Leg => {
    const pts = limb(root, target, lengths, bends);
    const chain = b.chain(`leg${side}`, polyline(pts), { parent, names, role: "leg" });
    // sinew upper, bone lower
    const r = prof(radii.map(([t, v]) => [t, v] as const));
    b.sweep(chain, r, { color: SINEW_P, sides: 8, to: 0.52 });
    b.sweep(chain, r, { color: BONE_P, sides: 7, from: 0.5 });
    return { joints: chain.joints as Joint[], chain };
  };

  const cuff = (from: Joint, to: Joint, f: number, r: number, bone: Joint) => {
    const dir = to.at.clone().sub(from.at).normalize();
    const at = lerp(from.at, to.at, f).addScaledVector(dir, -0.125);
    b.lathe([[r * 0.8, 0], [r, 0], [r * 1.07, 0.05], [r * 1.07, 0.2], [r, 0.25], [r * 0.8, 0.25]], {
      at,
      axis: dir.toArray(),
      segments: 9,
      color: IRON_P,
      bone,
    });
    const u = V(1, 0, 0).applyQuaternion(aim(dir));
    const w = dir.clone().cross(u);
    for (const row of [0.03, 0.22])
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * Math.PI * 2 + 0.3;
        const p = at.clone().addScaledVector(dir, row).addScaledVector(u, Math.cos(a) * r * 1.1).addScaledVector(w, Math.sin(a) * r * 1.1);
        bag.ball(bone, IRON_L, p, 0.035);
      }
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // ---- front leg
    const fr = legBuild(
      `F${side}`,
      V(s * 0.95, 2.9, 2.3),
      V(s * 1.55, 0.26, 2.95),
      [1.3, 1.3, 0.85],
      [[0, 0, -1], [0, 0, 1]],
      [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      [[0, 0.62], [0.3, 0.46], [0.5, 0.36], [0.8, 0.29], [1, 0.27]],
      spine.joints[2],
    );
    const elbow = fr.joints[1];
    const wrist = fr.joints[2];
    const hand = fr.joints[3];
    bag.ball(elbow, BONE, elbow.at, 0.34);
    bag.cone(elbow, BONE_HI, elbow.at, [s * 0.3, 0.1, -1], 0.8, 0.14);
    bag.cone(elbow, ICE, elbow.at.clone().add(V(s * 0.15, 0.2, 0)), [s * 0.6, 0.6, -0.5], 0.5, 0.1);
    bag.ball(wrist, BONE, wrist.at, 0.26);
    bag.cone(wrist, ICE, wrist.at, [s * 0.5, 0.5, -0.6], 0.4, 0.08);
    cuff(elbow, wrist, 0.55, 0.4, elbow);
    cuff(wrist, hand, 0.5, 0.32, wrist);
    // palm
    b.part(new THREE.SphereGeometry(0.3, 7, 5), BONE_P, { bone: hand, at: hand.at.clone().add(V(0, -0.1, 0.18)), scale: [1.1, 0.7, 1.2] });
    makeToes(hand, V(hand.at.x, hand.at.y, hand.at.z), `F${side}`, 3, 0.7, 0.17, 1);
    // dew claw
    b.spike(hand.at.clone().add(V(-s * 0.28, 0.0, 0.0)), [-s * 0.5, -0.2, -0.6], 0.35, 0.07, { color: CLAW, bone: hand, caps: "point" });

    // pauldron: stacked frost-iron plates, studded, with ice spikes
    const sh = fr.joints[0];
    const pc = V(s * 1.05, 3.3, 2.3);
    for (let k = 0; k < 3; k++) {
      const sc = 1 - 0.24 * k;
      b.lathe(
        [[0, 0], [0.62 * sc, 0], [0.66 * sc, 0.06], [0.58 * sc, 0.2], [0.34 * sc, 0.34], [0, 0.4]],
        {
          at: pc.clone().add(V(s * 0.14 * k, 0.1 * k - 0.1, -0.08 * k)),
          axis: [s * 0.5, 0.85, 0],
          segments: 9,
          color: IRON_P,
          bone: sh,
        },
      );
    }
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2;
      bag.ball(sh, IRON_L, pc.clone().add(V(s * 0.12 + Math.cos(a) * 0.6 * 0.9, 0.0 + Math.sin(a) * 0.15 - 0.02, Math.sin(a) * 0.55)), 0.04);
    }
    bag.cone(sh, ICE, pc.clone().add(V(s * 0.45, 0.45, 0)), [s * 0.4, 1, -0.2], 0.85, 0.16);
    bag.cone(sh, ICE_L, pc.clone().add(V(s * 0.25, 0.45, 0.3)), [s * 0.2, 1, 0.2], 0.6, 0.11);
    bag.cone(sh, ICE_L, pc.clone().add(V(s * 0.3, 0.4, -0.3)), [s * 0.3, 0.9, -0.7], 0.6, 0.11);
    bag.cone(sh, BONE_HI, pc.clone().add(V(s * 0.6, 0.1, 0.0)), [s * 1, 0.1, 0.0], 0.55, 0.12);
    glow(
      b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
        bone: sh,
        at: pc.clone().add(V(s * 0.42, 0.22, 0.38)),
        dir: [s * 0.35, 0.35, 0.9],
        axis: "z",
        texture: RUNES,
      }),
      1.4,
    );

    // ---- hind leg
    const hl = legBuild(
      `H${side}`,
      V(s * 1.05, 2.8, -1.4),
      V(s * 1.6, 0.3, -1.1),
      [1.45, 1.45, 1.1],
      [[0, 0, 1], [0, 0, -1]],
      [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      [[0, 0.85], [0.25, 0.7], [0.5, 0.44], [0.75, 0.32], [1, 0.28]],
      hips,
    );
    const knee = hl.joints[1];
    const hock = hl.joints[2];
    const foot = hl.joints[3];
    bag.ball(knee, BONE, knee.at, 0.4);
    bag.cone(knee, BONE_HI, knee.at.clone().add(V(0, 0.1, 0.3)), [s * 0.2, 0.3, 1], 0.6, 0.13);
    bag.cone(knee, ICE, knee.at.clone().add(V(s * 0.3, 0.2, 0.1)), [s * 0.8, 0.5, 0.2], 0.5, 0.1);
    bag.ball(hock, BONE, hock.at, 0.3);
    bag.cone(hock, BONE_HI, hock.at, [0, 0.35, -1], 0.7, 0.13);
    bag.cone(hock, ICE, hock.at.clone().add(V(0, 0.15, -0.1)), [s * 0.3, 0.6, -0.8], 0.46, 0.09);
    b.part(new THREE.SphereGeometry(0.34, 7, 5), BONE_P, { bone: foot, at: foot.at.clone().add(V(0, -0.08, 0.15)), scale: [1.1, 0.7, 1.3] });
    makeToes(foot, V(foot.at.x, foot.at.y, foot.at.z), `H${side}`, 3, 0.9, 0.2, 1);
    b.spike(foot.at.clone().add(V(0, -0.05, -0.2)), [0, -0.3, -1], 0.5, 0.1, { color: CLAW, bone: foot, caps: "point" });
    // haunch plate with rune
    glow(
      b.part(new THREE.PlaneGeometry(0.38, 0.38), "#ffffff", {
        bone: hl.joints[0],
        at: V(s * 1.45, 2.55, -1.2),
        dir: [s, 0.1, 0],
        axis: "z",
        texture: RUNES,
      }),
      1.4,
    );
    // iron cuffs round the shin, with rivets
    cuff(knee, hock, 0.5, 0.5, knee);
    cuff(hock, foot, 0.45, 0.4, hock);
    // pelvic blade
    b.extrude(
      [[-0.9, 0.0], [-0.5, 0.65], [0.3, 0.6], [0.75, 0.1], [0.55, -0.45], [-0.3, -0.5]],
      { at: V(s * 0.55, 3.0, -1.4), x: [0, 0, 1], y: [0, 1, 0], thickness: 0.16, bevel: 0.03, smoothing: 1, color: BONE_P, bone: hips },
    );
  }

  // ------------------------------------------------------------------ wings
  const rags: Frame[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const S = V(s * 0.75, 4.15, 1.2);
    const E = V(s * 2.9, 5.3, 0.3);
    const W = V(s * 5.0, 5.9, 1.3);
    const arm = b.chain("wingArm" + side, polyline([S, E, W]), {
      parent: spine.joints[2],
      names: [`wingShoulder${side}`, `wingElbow${side}`, `wingWrist${side}`],
      role: "wing",
    });
    b.sweep(arm, prof([[0, 0.3], [0.5, 0.22], [1, 0.15]]), { color: BONE_P, sides: 7 });
    const wristJ = arm.tip!;
    bag.ball(arm.joints[1], BONE, E, 0.3);
    bag.ball(wristJ, BONE, W, 0.26);
    bag.cone(arm.joints[1], BONE_HI, E, [s * 0.2, 0.3, -1], 0.7, 0.13);
    bag.cone(arm.joints[1], ICE, E.clone().add(V(0, 0.2, 0)), [s * 0.3, 1, -0.2], 0.7, 0.12);
    // wrist hook
    b.sweep(bezier(W, W.clone().add(V(s * 0.3, 0.5, 0.5)), W.clone().add(V(s * 0.7, 0.7, 1.1)), W.clone().add(V(s * 1.2, 0.5, 1.5))), [0.16, 0.01], {
      bone: wristJ,
      color: CLAW,
      sides: 6,
      caps: { start: "flat", end: "point" },
    });
    // iron wrist band with rune bar
    b.lathe([[0.2, 0], [0.3, 0], [0.32, 0.04], [0.32, 0.26], [0.3, 0.3], [0.2, 0.3]], {
      at: lerp(E, W, 0.65),
      axis: W.clone().sub(E).toArray(),
      segments: 8,
      color: IRON_P,
      bone: arm.joints[1],
    });
    // shoulder ice on arm top
    for (let k = 0; k < 4; k++) {
      const p = lerp(S, E, 0.15 + 0.22 * k);
      bag.cone(arm.joints[0], k % 2 ? ICE_L : ICE, p.clone().add(V(0, 0.22, 0)), [s * 0.1, 1, -0.3], 0.5 - 0.04 * k, 0.09);
    }

    // fingers
    const fingerTips = [V(s * 10.5, 6.6, -0.4), V(s * 9.2, 4.6, -3.8), V(s * 6.8, 3.0, -5.8), V(s * 4.0, 2.6, -6.0)];
    const fingerMids = [V(s * 7.8, 6.5, 0.9), V(s * 7.2, 5.5, -1.2), V(s * 6.2, 4.4, -2.4), V(s * 4.8, 4.2, -2.4)];
    const fingers: Chain[] = fingerTips.map((tip, i) => {
      const ch = b.chain(
        `finger${side}${i + 1}`,
        catmull([W, fingerMids[i], tip]),
        { parent: wristJ, names: [`finger${side}${i + 1}a`, `finger${side}${i + 1}b`, `finger${side}${i + 1}Tip`], role: "digit" },
      );
      b.sweep(ch, prof([[0, 0.17], [0.5, 0.1], [1, 0.03]]), { color: BONE_P, sides: 6 });
      bag.ball(ch.joints[1], BONE, fingerMids[i], 0.14);
      b.spike(tip, offset(tip, ch.at(1).tangent, 1), 0.5, 0.05, { color: CLAW, bone: ch.tip!, caps: "point" });
      for (let k = 0; k < 5; k++) {
        const at = ch.at(0.18 + 0.17 * k);
        bag.cone(ch.jointAt(0.18 + 0.17 * k), k % 2 ? ICE : ICE_L, at.at.clone().add(V(0, 0.1, 0)), [0, 1, -0.3], 0.3 - 0.03 * k, 0.06);
      }
      return ch;
    });

    // membrane panels with tears
    const mp = memPaint(W);
    type At = (t: number) => Vec;
    const lane = (pa: At, pb: At, s0: number, tear: ((t: number) => number) | null, sign: number, e: number) => {
      const pts: Vec[] = [];
      const n = 18;
      for (let i = 0; i <= n; i++) {
        const t = (i / n) * e;
        const g = tear ? tear(t) : 0;
        const q = Math.min(0.96, Math.max(0.04, s0 + (sign * g) / 2));
        pts.push(lerp(pa(t), pb(t), q));
      }
      return polyline(pts);
    };
    const bump = (tc: number, hw: number, h: number) => (t: number) => h * Math.max(0, 1 - ((t - tc) / hw) ** 2) ** 0.8;
    const notch = (t0: number, h: number) => (t: number) => h * smoothstep(t0, 1.0, t);
    const sumT = (...fns: Array<(t: number) => number>) => (t: number) => fns.reduce((a, f) => a + f(t), 0);

    type PanelSpec = { b1: number; b2: number; g1: (t: number) => number; g2: (t: number) => number; ends: number[]; scallop: number };
    const panelSpecs: PanelSpec[] = [
      {
        b1: 0.34, b2: 0.68,
        g1: sumT(bump(0.55, 0.14, 0.2), notch(0.78, 0.22)),
        g2: bump(0.4, 0.12, 0.16),
        ends: [0.92, 0.8, 0.96, 0.84],
        scallop: 0.1,
      },
      {
        b1: 0.32, b2: 0.66,
        g1: sumT(bump(0.35, 0.12, 0.2), notch(0.72, 0.3)),
        g2: sumT(bump(0.62, 0.14, 0.22), notch(0.9, 0.16)),
        ends: [0.78, 0.94, 0.82, 0.9],
        scallop: 0.14,
      },
      {
        b1: 0.36, b2: 0.7,
        g1: sumT(notch(0.6, 0.34)),
        g2: sumT(bump(0.45, 0.13, 0.2), notch(0.85, 0.2)),
        ends: [0.86, 0.72, 0.92, 0.8],
        scallop: 0.12,
      },
    ];
    for (let pi = 0; pi < 3; pi++) {
      const A = fingers[pi];
      const B = fingers[pi + 1];
      const sp = panelSpecs[pi];
      const opts = { color: mp, thickness: 0.035, rows: 2, scallop: sp.scallop };
      const pa: At = (t) => A.at(t).at;
      const pb: At = (t) => B.at(t).at;
      const l1r = lane(pa, pb, sp.b1, sp.g1, -1, sp.ends[0]);
      const l1l = lane(pa, pb, sp.b1, sp.g1, +1, sp.ends[1]);
      const l2r = lane(pa, pb, sp.b2, sp.g2, -1, sp.ends[2]);
      const l2l = lane(pa, pb, sp.b2, sp.g2, +1, sp.ends[3]);
      b.membrane(A, l1r, { ...opts, bone: A });
      b.membrane(l1l, l2r, { ...opts, bone: A });
      b.membrane(l2l, B, { ...opts, bone: B });
      // hanging rags from trailing edges
      for (let k = 0; k < 4; k++) {
        const q = 0.12 + 0.25 * k + 0.05 * R();
        const t = 0.84 + 0.14 * R();
        const base = lerp(A.at(t).at, B.at(t).at, q);
        rags.push(frame(base, [0, 1, 0]));
      }
    }
    // body panel: wing root to flank, torn like the rest
    {
      const flank = polyline([V(s * 0.95, 3.95, 1.0), V(s * 1.0, 3.4, -1.0), V(s * 0.7, 3.0, -3.0), V(s * 0.3, 2.7, -4.8)]);
      const F4 = fingers[3];
      const mpb = { color: mp, thickness: 0.035, rows: 3, scallop: 0.08 };
      const pa: At = (t) => F4.at(t).at;
      const pb: At = (t) => flank.at(t);
      const tear = sumT(bump(0.55, 0.16, 0.2), notch(0.85, 0.22));
      const lr = lane(pa, pb, 0.5, tear, -1, 0.9);
      const ll = lane(pa, pb, 0.5, tear, +1, 0.84);
      b.membrane(F4, lr, { ...mpb, bone: F4 });
      b.membrane(ll, flank, { ...mpb, bone: spine });
    }
    // thumb claw hanging icicles under arm
    b.cards(
      [0.3, 0.5, 0.7].map((t) => frame(lerp(S, W, t).clone().add(V(0, -0.1, 0)), [0, 1, 0])),
      ICICLE,
      { size: [0.22, 0.7], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: R },
    );
    // tattered banners tied to the wing arm and wrist hook
    b.cards(
      [frame(lerp(E, W, 0.7).clone().add(V(0, -0.25, 0)), [0, 1, 0]), frame(W.clone().add(V(s * 0.35, -0.3, 0.1)), [0, 1, 0])],
      [RAG_A, RAG_B],
      { size: [0.55, 1.5], lean: 180, flow: [0, 0, 1], vary: 0.2, rng: R },
    );
  }
  b.cards(rags, [RAG_A, RAG_B], { size: [0.4, 0.95], lean: 180, flow: [0, 0, 1], vary: 0.35, rng: R });

  // ------------------------------------------------------------------ hanging icicles from jaw, ribs and rib cage
  {
    const fr = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5].map((f) => frame(jaw.local([-0.15, f, -0.1]), [0, 1, 0]));
    b.cards(fr, ICICLE, { size: [0.14, 0.4], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: R });
    const belly = [0.2, 0.35, 0.5, 0.65, 0.8, 0.9].map((t) => {
      const c = spine.at(t).at;
      return frame(V(0, c.y - 1.28, c.z), [0, 1, 0]);
    });
    b.cards(belly, ICICLE, { size: [0.2, 0.6], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: R });
  }

  // frozen crystal clusters crusted onto the back
  const cluster = (bone: Joint, base: Vec, scale: number) => {
    const spec: ReadonlyArray<readonly [number, number, number, number]> = [
      [0, 0, 0, 1],
      [0.2, 0.12, 0.0, 0.66],
      [-0.18, 0.1, 0.16, 0.72],
      [0.04, -0.2, 0.12, 0.5],
      [0.1, 0.2, -0.18, 0.55],
    ];
    spec.forEach(([dx, dz, dy, k], i) => {
      bag.cone(bone, i % 2 ? ICE_L : ICE, base.clone().add(V(dx * scale, dy * scale, dz * scale)), [dx * 1.6, 1, dz * 1.6 - 0.2], 1.0 * k * scale, 0.2 * k * scale, 6);
    });
  };
  for (const s of [1, -1]) {
    cluster(hips, V(s * 0.75, 3.35, -1.7), 1.0);
    cluster(spine.joints[1], V(s * 0.6, 3.4, 0.0), 0.8);
    cluster(spine.joints[2], V(s * 0.55, 3.6, 1.3), 0.7);
  }
  cluster(tail.joints[0], V(0, 3.2, -3.4), 1.0);
  cluster(tail.joints[1], V(0, 2.6, -4.9), 0.75);

  // rime: small ice shards growing off the frozen sinew
  for (const [target, count, gap] of [
    [torso, 90, 0.27],
    [neckTube, 40, 0.24],
  ] as const) {
    const hits = b.surface(target).scatter(count, { rng: R, minDist: gap, filter: (h) => h.n.y > -0.1 });
    b.cards(hits, ICICLE, { size: [0.1, 0.3], lean: 28, flow: [0, 0, -1], vary: 0.4, rng: R, bend: 12 });
  }
  // glowing rune bars on the flanks
  {
    const c = spine.at(0.45).at;
    for (const s of [1, -1])
      glow(
        b.part(new THREE.PlaneGeometry(0.9, 0.22), "#ffffff", {
          bone: spine.joints[1],
          at: V(s * (rx(0.45) + 0.1), c.y - 0.55, c.z),
          dir: [s, 0, 0],
          axis: "z",
          texture: RUNE_BAR,
        }),
        1.4,
      );
  }
  bag.flush(b);
  return b.root;
}
