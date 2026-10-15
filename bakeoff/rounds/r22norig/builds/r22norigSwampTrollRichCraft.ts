import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { grain, mix, mottle, paint, smoothstep } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "A hunched, tusked marsh troll with a moss-crusted hump, spiked leather pauldron, bone-tooth bandolier, hide loincloth and a nail-studded club, hand-painted in a chunky Warcraft look.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------- palette ----------
const GREEN = "#6f9a4a";
const GREEN_DK = "#3d6a47";
const BELLY = "#b9c97c";
const WART = "#8c7d3e";
const MOSS = "#4f8a2c";
const MOSS_LT = "#8fc04a";
const LEATHER = "#7a4a2a";
const LEATHER_DK = "#4a2c1a";
const BONE = "#e8dcb0";
const IRON = "#5d6670";
const IRON_DK = "#2f353c";
const BRASS = "#c89a3a";
const CLOTH = "#8c3b2a";
const CLOTH_TRIM = "#d9a441";
const MUD = "#4a3a22";
const MOUTH = "#3a1520";
const HAIR = "#2f5a28";
const WOOD = "#6b4a2b";
const WOOD_DK = "#3e2a18";
const EYE = "#ffe94a";
const RED = "#c8442f";

const skinBase = mottle(GREEN, GREEN_DK, { size: 0.16, contrast: 0.9, seed: 3 });
const SKIN = paint((p, n) => {
  let c = skinBase.at(p, n);
  const up = smoothstep(-0.6, 0.9, n.y);
  c = mix(c, "#1d3a40", 0.38 * (1 - up));
  c = mix(c, "#c9d86e", 0.28 * Math.max(0, n.y));
  if (n.z > 0.35 && p.y > 0.95 && p.y < 1.75 && Math.abs(p.x) < 0.55) c = mix(c, BELLY, 0.7 * smoothstep(0.35, 0.8, n.z));
  if (p.y < 0.28) c = mix(c, MUD, 0.8 * (1 - p.y / 0.28));
  return c;
});
const SKIN_HEAD = paint((p, n) => {
  let c = skinBase.at(p, n);
  const up = smoothstep(-0.6, 0.9, n.y);
  c = mix(c, "#1d3a40", 0.32 * (1 - up));
  c = mix(c, "#d4e07a", 0.25 * Math.max(0, n.y));
  if (n.y < -0.2) c = mix(c, "#9c8a5a", 0.4);
  return c;
});
const LEATHER_P = grain(LEATHER, LEATHER_DK, { size: 0.03, axis: "x", seed: 5 });
const WOOD_P = grain(WOOD, WOOD_DK, { size: 0.025, axis: "y", seed: 8 });
const IRON_P = mottle(IRON, IRON_DK, { size: 0.05, contrast: 0.7, seed: 11 });
const FRONT_PANEL = paint((_p, _n, s) => {
  if (s[1] > -0.07) return LEATHER_DK;
  if (s[1] < -0.12 && s[1] > -0.2 && Math.abs(((s[0] * 18) % 2) - 1) < 0.55 + (s[1] + 0.16) * 0) {
    return Math.floor(s[0] * 18) % 2 === 0 ? CLOTH_TRIM : CLOTH;
  }
  return mix(CLOTH, "#5a1e16", smoothstep(-0.1, -0.5, s[1]) * 0.5);
});

// ---------- drawings ----------
const WARPAINT = svg(
  `<svg viewBox="0 0 64 64"><g stroke="#e9e2b8" stroke-width="6" stroke-linecap="round" fill="none"><path d="M14 8 Q22 32 12 58"/><path d="M32 6 Q40 32 30 60"/><path d="M50 8 Q58 32 48 58"/></g></svg>`,
  { size: 256 },
);
const FACEPAINT = svg(
  `<svg viewBox="0 0 96 24"><g stroke="#b32a1f" stroke-width="5" stroke-linecap="round" fill="none"><path d="M4 6 L38 14"/><path d="M92 6 L58 14"/><path d="M6 18 L34 20"/><path d="M90 18 L62 20"/></g></svg>`,
  { size: 384 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "swampTroll" });
  const rand = rng(21);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // ---------- torso ----------
  const torso = b.loft(
    [
      { at: [0, 0.98, -0.05], w: 0.56, h: 0.4 },
      { at: [0, 1.35, 0.15], w: 0.92, h: 0.78 },
      { at: [0, 1.8, 0.25], w: 1.18, h: 0.82 },
      { at: [0, 2.03, 0.3], w: 0.74, h: 0.5 },
    ],
    { color: SKIN, sides: 10 },
  );
  const hump = b.part(sph(1, 10, 7), SKIN, { at: [0, 1.95, -0.12], scale: [0.45, 0.36, 0.42] });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const hip = V(s * 0.3, 1.05, 0);
    const knee = V(s * 0.37, 0.6, 0.15);
    const ankle = V(s * 0.38, 0.15, 0.1);
    b.capsule(hip, knee, [0.22, 0.17], SKIN);
    b.capsule(knee, ankle, [0.17, 0.12], SKIN);
    b.part(sph(1, 8, 6), SKIN, { at: [s * 0.38, 0.1, 0.22], scale: [0.17, 0.1, 0.26] });
    for (let i = -1; i <= 1; i++) {
      const tx = s * 0.38 + i * 0.1;
      b.capsule([tx, 0.065, 0.38], [tx + i * 0.01, 0.06, 0.5], 0.05, SKIN);
      b.spike([tx + i * 0.01, 0.06, 0.53], [i * 0.15, -0.1, 1], 0.1, 0.035, "#d9cfa0");
    }
    // knee guard + spike
    b.part(sph(1, 8, 5), LEATHER_P, { at: [s * 0.37, 0.62, 0.3], scale: [0.16, 0.14, 0.1] });
    b.spike([s * 0.37, 0.62, 0.36], [0, 0.15, 1], 0.14, 0.04, BONE);
    // ankle strap
    b.rod(V(s * 0.38, 0.28, 0.1), V(s * 0.38, 0.33, 0.1), 0.15, LEATHER_DK);
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.02), BRASS, { at: [s * 0.38, 0.305, 0.25] });
  }

  // ---------- head ----------
  const HC = V(0, 2.27, 0.5);
  const skull = b.part(sph(1, 12, 8), SKIN_HEAD, { at: HC, scale: [0.27, 0.23, 0.27] });
  b.part(sph(1, 8, 6), SKIN_HEAD, { at: [0, 2.2, 0.72], scale: [0.2, 0.13, 0.15] });
  b.capsule(V(0, 2.0, 0.3), V(0, 2.2, 0.45), 0.22, SKIN);
  b.capsule(V(-0.16, 2.07, 0.68), V(0.16, 2.07, 0.68), 0.115, SKIN_HEAD); // underbite jaw
  b.part(sph(0.07, 8, 6), "#86a458", { at: [0, 2.22, 0.84] }); // nose
  for (const s of [1, -1]) {
    b.part(sph(0.016, 5, 4), MOUTH, { at: [s * 0.03, 2.205, 0.895] });
    // eyes
    glow(b.part(sph(0.04, 8, 6), EYE, { at: [s * 0.12, 2.29, 0.75] }), 1.2);
    b.part(sph(0.017, 6, 4), "#14110a", { at: [s * 0.12, 2.29, 0.786] });
    // brow ridge (angry, inner low)
    b.capsule(V(s * 0.03, 2.35, 0.76), V(s * 0.25, 2.41, 0.62), 0.05, SKIN_HEAD);
    // cheek bump
    b.part(sph(0.05, 6, 4), SKIN_HEAD, { at: [s * 0.2, 2.2, 0.68] });
    // tusks
    b.spike([s * 0.14, 2.1, 0.76], [s * 0.12, 1, 0.38], 0.24, 0.045, BONE);
    b.spike([s * 0.14, 2.1, 0.76], [s * 0.12, 1, 0.38], 0.06, 0.047, "#b9a874");
    // ears
    b.spike([s * 0.24, 2.3, 0.48], [s, 0.55, -0.45], 0.3, 0.07, SKIN_HEAD);
    b.spike([s * 0.255, 2.31, 0.49], [s, 0.55, -0.45], 0.2, 0.04, "#a46a5a");
  }
  b.part(new THREE.TorusGeometry(0.035, 0.009, 5, 10), BRASS, { at: [0.3, 2.22, 0.45], rotation: [0, 90, 0] });
  b.rod(V(-0.15, 2.14, 0.79), V(0.15, 2.14, 0.79), 0.012, MOUTH);
  for (let i = -2; i <= 2; i++) b.spike([i * 0.05, 2.13, 0.775], [0, 1, 0.2], 0.05, 0.012, BONE);
  // face paint
  const surfHead = b.surface(skull);
  const fh = surfHead.around(HC).at(0, 4);
  if (fh) b.decal(surfHead, FACEPAINT, { at: fh, size: [0.36, 0.1] });
  // marsh-reed mohawk
  for (let i = 0; i < 7; i++) {
    const z = 0.7 - i * 0.09;
    const dz = (z - 0.5) / 0.27;
    const y = 2.27 + 0.23 * Math.sqrt(Math.max(0, 1 - dz * dz));
    const len = 0.32 - Math.abs(i - 2) * 0.03;
    b.spike([0, y - 0.02, z], [0, 1, -0.5 - i * 0.08], len, 0.035, i % 2 ? HAIR : MOSS);
  }

  // ---------- hump spines, moss, mushrooms ----------
  for (let i = 0; i < 6; i++) {
    b.spike([0, 2.24 - i * 0.17, -0.42 + i * 0.04], [0, 0.7, -1], 0.26 - i * 0.025, 0.055 - i * 0.004, i % 2 ? BONE : "#cdbf8c");
  }
  const mossHits = b.surface(hump).scatter(28, { rng: rand, minDist: 0.1, filter: (h) => h.n.y > 0.45 });
  for (const h of mossHits) b.stick(sph(0.06, 6, 4), MOSS, h, { count: 1 } as never);
  const mushHits = b.surface(hump).scatter(6, { rng: rand, minDist: 0.18, filter: (h) => h.n.y > 0.6 });
  for (const h of mushHits) {
    b.stick(new THREE.CylinderGeometry(0.012, 0.018, 0.07, 5), BONE, h);
    b.stick(new THREE.SphereGeometry(0.04, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), RED, h.moved([0, 0.06, 0]));
  }
  const wartHits = b.surface(torso).scatter(34, { rng: rand, minDist: 0.1 });
  for (const h of wartHits) b.stick(sph(0.028, 5, 4), WART, h);

  // ---------- chest paint, bandolier ----------
  const chest = b.surface(torso);
  const ch = chest.around(V(0, 1.6, 0.25)).at(0, 8);
  if (ch) b.decal(chest, WARPAINT, { at: ch, size: [0.32, 0.32] });
  const strapPath = chest.drape(
    catmull([
      [0.55, 2.0, 0.4],
      [0.3, 1.65, 0.62],
      [-0.1, 1.32, 0.68],
      [-0.42, 1.08, 0.45],
    ]),
    { lift: 0.025 },
  );
  b.sweep(strapPath, 0.035, { color: LEATHER_P, sides: 6 });
  for (let i = 1; i < 8; i++) {
    const p = strapPath.at(i / 8);
    b.spike(p, [0.1, -0.35, 1], 0.1, 0.024, BONE);
  }
  // neck ring with fangs
  const neckPts: number[][] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    neckPts.push([Math.sin(a) * 0.27, 2.08, 0.36 + Math.cos(a) * 0.25]);
  }
  b.sweep(catmull(neckPts, { closed: true }), 0.022, { color: LEATHER_DK, sides: 6 });
  for (let i = -3; i <= 3; i++) {
    const a = (i / 3) * 1.0;
    b.spike([Math.sin(a) * 0.27, 2.07, 0.36 + Math.cos(a) * 0.25], [0, -1, 0.3], i === 0 ? 0.15 : 0.09, i === 0 ? 0.03 : 0.02, BONE);
  }

  // ---------- belt, loincloth, pouch ----------
  const beltPts: number[][] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    beltPts.push([Math.sin(a) * 0.36, 1.1, 0.02 + Math.cos(a) * 0.31]);
  }
  b.sweep(catmull(beltPts, { closed: true }), 0.05, { color: LEATHER_P, sides: 6 });
  b.part(new THREE.BoxGeometry(0.14, 0.12, 0.04), BRASS, { at: [0, 1.1, 0.35] });
  b.part(new THREE.BoxGeometry(0.07, 0.06, 0.045), IRON_DK, { at: [0, 1.1, 0.355] });
  const panel: Array<[number, number]> = [
    [-0.2, 0], [0.2, 0], [0.21, -0.25], [0.18, -0.4], [0.12, -0.5], [0.06, -0.4], [0, -0.52],
    [-0.06, -0.4], [-0.12, -0.5], [-0.18, -0.4], [-0.21, -0.25],
  ];
  b.extrude(panel, { at: [0, 1.1, 0.3], x: [1, 0, 0], y: [0, 1, -0.08], thickness: 0.03, bevel: 0.008, color: FRONT_PANEL });
  b.extrude(panel, { at: [0, 1.1, -0.26], x: [1, 0, 0], y: [0, 1, 0.08], thickness: 0.03, bevel: 0.008, color: FRONT_PANEL });
  for (const s of [1, -1]) b.spike([s * 0.34, 1.05, 0.12], [s * 0.3, -1, 0.2], 0.22, 0.035, LEATHER_DK);
  b.part(new THREE.BoxGeometry(0.17, 0.17, 0.1), LEATHER_P, { at: [-0.4, 0.98, 0.14] });
  b.part(new THREE.BoxGeometry(0.18, 0.06, 0.11), LEATHER_DK, { at: [-0.4, 1.06, 0.14] });
  b.part(sph(0.015, 5, 4), BRASS, { at: [-0.4, 1.02, 0.2] });

  // ---------- left shoulder pauldron ----------
  const dome = b.part(sph(1, 10, 6), LEATHER_P, { at: [0.76, 2.06, 0.16], scale: [0.34, 0.2, 0.32] });
  b.part(sph(0.3, 8, 6), SKIN, { at: [0.72, 1.95, 0.2] });
  for (const h of b.surface(dome).scatter(12, { rng: rand, minDist: 0.11, filter: (q) => q.n.y > 0.2 })) b.stick(sph(0.015, 5, 4), BRASS, h);
  for (let i = -1; i <= 1; i++) b.spike([0.76 + i * 0.16, 2.2 - Math.abs(i) * 0.04, 0.16], [0.35 * i + 0.25, 1, 0], 0.2, 0.05, BONE);
  b.rod(V(0.96, 2.0, 0.0), V(0.96, 2.0, 0.36), 0.03, IRON_DK);
  // right shoulder: moss mantle
  const rsh = b.part(sph(1, 8, 6), SKIN, { at: [-0.72, 1.97, 0.2], scale: [0.32, 0.3, 0.3] });
  for (const h of b.surface(rsh).scatter(10, { rng: rand, minDist: 0.1, filter: (q) => q.n.y > 0.4 })) b.stick(sph(0.05, 6, 4), MOSS_LT, h);

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const sh = V(s * 0.72, 1.95, 0.2);
    const elbow = V(s * 0.9, 1.45, 0.3);
    const wrist = s === 1 ? V(0.8, 0.98, 0.62) : V(-0.82, 0.98, 0.66);
    b.capsule(sh, elbow, [0.24, 0.18], SKIN);
    b.capsule(elbow, wrist, [0.18, 0.2], SKIN);
    const a = new THREE.Vector3().lerpVectors(elbow, wrist, 0.55);
    const c = new THREE.Vector3().lerpVectors(elbow, wrist, 0.85);
    b.rod(a, c, 0.215, LEATHER_P, { sides: 8 });
    for (let k = 0; k < 4; k++) {
      const t = new THREE.Vector3().lerpVectors(a, c, 0.12 + k * 0.25);
      b.part(sph(0.018, 5, 4), BRASS, { at: [t.x + s * 0.002, t.y, t.z + 0.21] });
    }
    b.rod(c, new THREE.Vector3().lerpVectors(elbow, wrist, 0.95), 0.2, IRON_P, { sides: 8 });
    // fist
    const hand = s === 1 ? V(0.8, 0.76, 0.68) : V(-0.86, 0.76, 0.77);
    b.part(sph(0.23, 8, 6), SKIN, { at: hand });
    for (let i = 0; i < 4; i++) {
      const kx = hand.x + (i - 1.5) * 0.08;
      b.part(sph(0.045, 5, 4), SKIN, { at: [kx, hand.y + 0.06, hand.z + 0.19] });
      if (s === 1) b.spike([kx, hand.y + 0.02, hand.z + 0.23], [0, -0.45, 1], 0.1, 0.03, "#d9cfa0");
    }
  }

  // ---------- club ----------
  const cb = V(-0.84, 0.0, 0.72);
  const ct = V(-0.9, 1.75, 0.85);
  const dir = ct.clone().sub(cb).normalize();
  const hs = new THREE.Vector3().lerpVectors(cb, ct, 0.6);
  b.rod(cb, hs, 0.05, WOOD_P, { sides: 8 });
  b.rod(hs, ct, [0.11, 0.2], WOOD_P, { sides: 8 });
  b.part(sph(0.2, 8, 5), WOOD_P, { at: [ct.x, ct.y, ct.z] });
  const u = V(1, 0, 0).cross(dir).normalize();
  const w = dir.clone().cross(u).normalize();
  for (const t of [0.66, 0.82, 0.97]) {
    const cp = new THREE.Vector3().lerpVectors(cb, ct, t);
    const r = 0.11 + (0.2 - 0.11) * ((t - 0.6) / 0.4);
    b.rod(cp.clone().addScaledVector(dir, -0.02), cp.clone().addScaledVector(dir, 0.02), r + 0.012, IRON_P, { sides: 8 });
    const nails = 7;
    for (let j = 0; j < nails; j++) {
      const ang = (j / nails) * Math.PI * 2 + t * 3;
      const out = u.clone().multiplyScalar(Math.cos(ang)).addScaledVector(w, Math.sin(ang));
      b.spike(cp.clone().addScaledVector(out, r * 0.9), out.clone().addScaledVector(dir, 0.15), 0.11, 0.03, IRON_DK);
    }
  }
  b.spike(ct.clone().addScaledVector(dir, 0.1), dir, 0.14, 0.05, IRON_DK);
  b.rod(cb, cb.clone().add(V(0, 0.04, 0)), 0.065, IRON_DK, { sides: 8 });
  b.rod(V(-0.84, 0.35, 0.72 + 0.01), V(-0.85, 0.37, 0.73), 0.07, LEATHER_DK, { sides: 8 });

  return b.root;
}
