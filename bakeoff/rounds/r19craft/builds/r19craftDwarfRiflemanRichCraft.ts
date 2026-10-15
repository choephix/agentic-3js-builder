import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { rng } from "../../../../src/math";
import { gradient, grain, mix, noise, paint, resolve, smoothstep } from "../../../../src/paint";
import type { ColorInput, Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { bezier, catmull, polyline } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "A stout, heroic dwarf rifleman with a horned steel helm, a thick ginger braided beard and a flared brass-banded blunderbuss, with oversized pauldrons, bandolier, pack and boots.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// Flat colours (small details only; big surfaces are hand-painted paints)
const BRASS = "#e3a82c";
const BRASS_D = "#a06f14";
const IRON_D = "#3a4352";
const LEATHER_D = "#47281a";
const WHITE = "#f6efdc";
const EYE_W = "#efe6cc";
const IRIS = "#4fa3e8";
const PUPIL = "#101018";
const MOUTH = "#4a1414";
const BLACK = "#14100e";
const RED = "#b8392b";
const PIPE_WOOD = "#4a2a14";
const RAM = "#caa86a";
const CUP = "#b9c2cf";

// Hand-painted look: light from above/front-left, warm highlights, cool violet shadows, mottled wear.
function hp(
  base: ColorInput,
  o: { size?: number; seed?: number; amt?: number; light?: string; dark?: string } = {},
): Paint {
  const { size = 0.06, seed = 1, amt = 0.35, light = "#fff0c0", dark = "#1c1440" } = o;
  return paint((p, n) => {
    const c = resolve(base, p, n);
    const l = n.y * 0.75 + n.z * 0.25 + n.x * 0.1;
    const t = smoothstep(-0.55, 0.75, l);
    const lo = mix(c, dark, 0.34);
    const hi = mix(c, light, 0.3);
    const shaded = t < 0.5 ? mix(lo, c, t * 2) : mix(c, hi, (t - 0.5) * 2);
    const m = (noise(p, size, seed) - 0.5) * 2 * amt;
    return m > 0 ? mix(shaded, hi, m * 0.6) : mix(shaded, lo, -m * 0.6);
  });
}

export default function build() {
  const b = createBuilder({ name: "dwarfRifleman" });
  const rand = rng(11);

  // ---------------------------------------------------------------- small helpers
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const cyl = (r0: number, r1: number, h: number, n = 8) => new THREE.CylinderGeometry(r0, r1, h, n);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const tor = (r: number, t: number, n = 12) => new THREE.TorusGeometry(r, t, 6, n);
  const P =
    (bone: Joint) =>
    (g: THREE.BufferGeometry, c: Fill, at: THREE.Vector3 | number[], o: PartOptions = {}) =>
      b.part(g, c, { bone, at, ...o });
  const basis = (a: THREE.Vector3): [THREE.Vector3, THREE.Vector3] => {
    const ref = Math.abs(a.y) > 0.9 ? V(0, 0, 1) : V(0, 1, 0);
    const u = new THREE.Vector3().crossVectors(a, ref).normalize();
    const v = new THREE.Vector3().crossVectors(a, u).normalize();
    return [u, v];
  };
  const circle = (c: THREE.Vector3, u: THREE.Vector3, v: THREE.Vector3, r: number, n: number, a0 = 0, a1 = Math.PI * 2) =>
    Array.from({ length: n }, (_, i) => {
      const a = a0 + ((a1 - a0) * i) / n;
      return c.clone().addScaledVector(u, Math.cos(a) * r).addScaledVector(v, Math.sin(a) * r);
    });
  const slabBox = (
    w: number,
    h: number,
    d: number,
    at: THREE.Vector3 | number[],
    color: Fill,
    bone: Joint,
    bevel = 0.012,
  ) =>
    b.extrude(
      [
        [-w / 2, -h / 2],
        [w / 2, -h / 2],
        [w / 2, h / 2],
        [-w / 2, h / 2],
      ],
      { at, x: [1, 0, 0], y: [0, 1, 0], thickness: d, bevel, color, bone },
    );

  // ---------------------------------------------------------------- textures
  const LOCK = svg(
    `<svg viewBox="0 0 24 64"><path d="M2 64 C4 40 9 20 14 0 C17 22 22 44 22 64 Z" fill="#c4560f"/><path d="M8 64 C9 44 12 24 14 6" stroke="#f0953a" stroke-width="2.4" fill="none"/><path d="M14 64 C15 46 16 30 15 14" stroke="#8f3508" stroke-width="2" fill="none"/><path d="M19 64 C19 50 18 40 17 28" stroke="#f6b25a" stroke-width="1.6" fill="none"/></svg>`,
    { size: 128 },
  );
  const SCROLL = svg(
    `<svg viewBox="0 0 64 24"><path d="M2 12 C10 2 20 2 24 10 C26 16 20 18 18 13 C17 10 21 8 23 10 M24 10 C34 14 40 4 46 6 C52 8 50 15 46 13 M46 6 L62 12" fill="none" stroke="#f0b93a" stroke-width="2.2" stroke-linecap="round"/><circle cx="32" cy="12" r="2.6" fill="#f0b93a"/></svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------- paints
  const FACE_BASE = hp("#d79566", { size: 0.05, seed: 3, amt: 0.3, dark: "#5a1c28", light: "#ffe2b0" });
  const RUDDY = hp("#d3664e", { size: 0.05, seed: 4, amt: 0.3, dark: "#5a1c28", light: "#ffd2a0" });
  const SKIN = paint((p, n) => {
    const dx = Math.abs(p.x) - 0.1;
    const dy = p.y - 1.09;
    const dz = (p.z - 0.17) * 0.7;
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const nd = Math.hypot(p.x, p.y - 1.095, (p.z - 0.24) * 0.8);
    const r = Math.max(smoothstep(0.075, 0.03, d) * 0.8, smoothstep(0.06, 0.02, nd));
    return mix(resolve(FACE_BASE, p, n), resolve(RUDDY, p, n), r);
  });
  const STEEL = hp("#9aa6b8", { size: 0.025, seed: 5, amt: 0.55, dark: "#14203a", light: "#ffffff" });
  const BRASS_P = hp("#e0a62e", { size: 0.02, seed: 6, amt: 0.4, dark: "#4a2a08", light: "#fff2b0" });
  const LEATHER_P = hp("#8a5130", { size: 0.04, seed: 8, amt: 0.45, dark: "#2a1208" });
  const LEATHER_DP = hp("#4a2a16", { size: 0.04, seed: 9, amt: 0.4, dark: "#150805" });
  const PANTS_P = hp("#5b3d26", { size: 0.05, seed: 2, amt: 0.4, dark: "#20100a" });
  const BLUE_P = hp("#2f55a6", { size: 0.05, seed: 12, amt: 0.4, light: "#bcd4ff", dark: "#0b1440" });
  const HORN_P = hp(grain("#efe2bd", "#c9b27a", { size: 0.01, axis: "y" }), { size: 0.04, amt: 0.25, dark: "#4a3a20" });
  const HAIR_P = hp(
    gradient(grain("#d65f16", "#a8400c", { size: 0.01, axis: "y" }), "#f4a34a", [0, 0.98, 0], [0, 0.62, 0]),
    { size: 0.04, seed: 21, amt: 0.3, dark: "#3a0e08", light: "#ffd890" },
  );
  const BRAID_B = hp("#e07a22", { size: 0.03, seed: 22, amt: 0.3, dark: "#5a1a08", light: "#ffe0a0" });
  const BEDROLL = hp("#b6432a", { size: 0.04, seed: 30, amt: 0.4, dark: "#3a0e0a" });
  const BOOT_BASE = hp("#3d2414", { size: 0.04, seed: 31, amt: 0.45, dark: "#0e0604", light: "#ffd8a0" });
  const BOOT_P = paint((p, n) => (p.y < 0.03 ? "#17100b" : resolve(BOOT_BASE, p, n)));
  const WOOD_P = hp(grain("#a8672f", "#6f3f1c", { size: 0.012, axis: "z" }), {
    size: 0.08,
    seed: 40,
    amt: 0.3,
    dark: "#2a1006",
  });
  const JERK_BASE = hp("#8a5130", { size: 0.04, seed: 8, amt: 0.45, dark: "#2a1208" });
  const JERKIN = paint((p, n) => {
    if (n.z > 0.15 && Math.abs(p.x) < 0.006 && p.y < 0.86) return "#e4b445";
    if (p.y < 0.615) return "#3a2412";
    return JERK_BASE;
  });
  const TABARD_BASE = hp("#2f55a6", { size: 0.05, seed: 13, amt: 0.35, light: "#bcd4ff", dark: "#0b1440" });
  const TABARD = paint((p, n, s) => {
    const ax = Math.abs(s[0]);
    if (ax > 0.085 || s[1] > -0.014 || s[1] < -0.25 + 0.8 * ax + 0.016) return "#e4b445";
    if (ax < 0.008) return "#e4b445";
    return TABARD_BASE.at(p, n);
  });

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.56, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.56, 0],
      [0, 0.7, 0.03],
      [0, 0.88, 0.02],
      [0, 1.0, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neckChain",
    polyline([
      [0, 1.0, 0],
      [0, 1.07, 0.04],
    ]),
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 1.07, 0.04], dir: [0, 1, 0.12], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.095, 0.075], aim: [0, 1.04, 0.2], role: "jaw" });

  // ---------------------------------------------------------------- torso
  const torso = b.loft(
    [
      { at: [0, 0.57, -0.01], w: 0.34, h: 0.24 },
      { at: [0, 0.7, 0.03], w: 0.42, h: 0.31 },
      { at: [0, 0.88, 0.02], w: 0.5, h: 0.3 },
      { at: [0, 1.0, 0], w: 0.46, h: 0.24 },
    ],
    { bone: spine, color: JERKIN, caps: "flat", name: "torso" },
  );
  const skin = b.surface(torso);
  const pelvis = b.part(sph(1, 10, 8), PANTS_P, { bone: hips, at: [0, 0.53, 0], scale: [0.19, 0.12, 0.14] });
  void pelvis;

  // neck and gorget
  b.rod([0, 0.98, 0], [0, 1.09, 0.045], 0.075, { color: SKIN, bone: neck.joints[0] });
  P(chest)(tor(0.105, 0.026, 14), STEEL, [0, 1.01, 0.015], { dir: [0, 1, 0], axis: "z" });
  for (const p of circle(V(0, 1.03, 0.015), V(1, 0, 0), V(0, 0, 1), 0.112, 9, -Math.PI * 0.45, Math.PI * 0.45 + 0.4))
    P(chest)(sph(0.01, 6, 4), BRASS, p);

  // belt
  const beltPath = skin.loop([0, 0.635, 0], { lift: 0.01 });
  b.sweep(beltPath, () => [0.014, 0.04], { color: LEATHER_DP, section: "box", bone: spine.joints[0] });
  for (let i = 0; i < 22; i++) {
    const q = beltPath.at(i / 22);
    const h = skin.nearest(q);
    P(spine.joints[0])(sph(0.0085, 6, 4), BRASS, q.clone().addScaledVector(h.n, 0.022));
  }
  const buckleHit = skin.ray([0, 0.635, 1], [0, 0, -1]);
  if (buckleHit) {
    b.stick(box(0.085, 0.016, 0.065), BRASS, buckleHit, { flow: [0, 1, 0], embed: -0.5 });
    b.stick(box(0.05, 0.012, 0.035), BRASS_D, buckleHit.moved([0, 0.016, 0]), { flow: [0, 1, 0], embed: 0 });
  }

  // jerkin buttons and chest studs
  for (const y of [0.66, 0.7, 0.74, 0.78, 0.82]) {
    const h = skin.ray([0.022, y, 1], [0, 0, -1]);
    if (h) b.stick(cyl(0.012, 0.012, 0.012, 8), BRASS, h, { embed: 0.3 });
  }

  // bandolier (right shoulder to left hip) with pouches
  const bandPath = skin.drape(
    catmull(
      [
        [-0.2, 0.99, 0.05],
        [0, 0.86, 0.19],
        [0.22, 0.66, 0.13],
        [0.25, 0.62, -0.02],
        [0, 0.8, -0.18],
        [-0.22, 0.98, -0.06],
      ],
      { closed: true },
    ),
    { lift: 0.014 },
  );
  b.sweep(bandPath, 0.02, { color: LEATHER_DP, sides: 6 });
  for (let i = 0; i < 44; i++) {
    const t = i / 44;
    const q = bandPath.at(t);
    if (q.z < 0.09 || i % 2) continue;
    const h = skin.nearest(q);
    b.stick(box(0.036, 0.034, 0.058), LEATHER_P, h, { flow: bandPath.tangentAt(t), embed: 0.25 });
    b.stick(cyl(0.012, 0.012, 0.02, 6), BRASS, h.moved([0, 0.03, 0]), { embed: 0.1 });
  }

  // shoulder straps down to the pack
  for (const s of [1, -1]) {
    const strap = skin.drape(
      catmull([
        [s * 0.14, 0.88, -0.13],
        [s * 0.14, 1.0, -0.05],
        [s * 0.14, 1.0, 0.07],
        [s * 0.13, 0.86, 0.17],
        [s * 0.12, 0.68, 0.15],
      ]),
      { lift: 0.012 },
    );
    b.sweep(strap, 0.018, { color: LEATHER_P, sides: 6 });
  }

  // tabard
  const tabOutline: OutlinePoint[] = [
    [-0.1, 0],
    [0.1, 0],
    [0.1, -0.17],
    [0, -0.25, "sharp"],
    [-0.1, -0.17],
  ];
  const tabard = b.extrude(tabOutline, {
    at: [0, 0.625, 0.17],
    x: [1, 0, 0],
    y: [0, 1, 0.1],
    thickness: 0.012,
    color: TABARD,
    bone: hips,
  });
  for (const x of [-0.07, 0.07]) b.part(sph(0.01, 6, 4), BRASS, { bone: hips, at: tabard.local([x, -0.03, 0.01]) });
  b.part(sph(0.016, 6, 4), BRASS, { bone: hips, at: tabard.local([0, -0.12, 0.01]) });

  // belt pouch + powder horn (left hip)
  const pouch = slabBox(0.1, 0.11, 0.06, [0.235, 0.545, 0.05], LEATHER_P, hips, 0.012);
  void pouch;
  slabBox(0.108, 0.04, 0.066, [0.235, 0.585, 0.05], LEATHER_DP, hips, 0.01);
  P(hips)(sph(0.012, 6, 4), BRASS, [0.27, 0.58, 0.085]);
  const hornPath = catmull([
    [0.2, 0.6, 0.15],
    [0.265, 0.5, 0.19],
    [0.285, 0.4, 0.15],
    [0.24, 0.33, 0.09],
  ]);
  b.sweep(hornPath, [0.04, 0.012], {
    bands: [
      [0.14, BRASS_P],
      [1, HORN_P],
    ],
    bone: hips,
    sides: 8,
    caps: { start: "flat", end: "point" },
  });
  b.sweep(
    catmull([
      [0.2, 0.62, 0.14],
      [0.1, 0.8, 0.2],
      [0.04, 0.84, 0.19],
    ]),
    0.009,
    { color: LEATHER_DP, bone: hips },
  );

  // ---------------------------------------------------------------- legs
  const ankles: Joint[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipP = V(s * 0.13, 0.52, 0);
    const kneeP = V(s * 0.14, 0.3, 0.045);
    const ankP = V(s * 0.14, 0.1, 0);
    const leg = b.chain(`leg${side}`, catmull([hipP, kneeP, ankP]), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.14, 0, 0.05],
    });
    const knee = leg.joints[1];
    const ankle = leg.joints[2];
    ankles.push(ankle);
    b.sweep(leg, [0.098, 0.092, 0.078, 0.07, 0.066], { color: PANTS_P });
    // boot shaft + cuff + strap
    const top = ankP.clone().lerp(kneeP, 0.85);
    const midS = ankP.clone().lerp(kneeP, 0.5);
    b.rod(ankP.clone().add(V(0, 0.02, 0)), top, [0.078, 0.088], { color: BOOT_P, bone: knee });
    P(knee)(tor(0.09, 0.018, 12), LEATHER_P, top, { dir: [0, 1, 0], axis: "z" });
    P(knee)(tor(0.084, 0.008, 12), LEATHER_DP, midS, { dir: [0, 1, 0], axis: "z" });
    P(knee)(box(0.04, 0.04, 0.012), BRASS, [s * 0.14, 0.2, midS.z + 0.088]);
    // foot
    b.loft(
      [
        { at: [s * 0.14, 0.065, 0], w: 0.15, h: 0.13 },
        { at: [s * 0.14, 0.065, 0.1], w: 0.17, h: 0.13 },
        { at: [s * 0.14, 0.05, 0.17], w: 0.15, h: 0.1 },
      ],
      { bone: ankle, color: BOOT_P },
    );
    P(ankle)(sph(0.045, 8, 6), STEEL, [s * 0.14, 0.06, 0.2], { scale: [1, 0.75, 0.9] });
    // knee pad
    P(knee)(sph(0.06, 8, 6), STEEL, [s * 0.14, 0.31, 0.11], { scale: [1, 1, 0.7] });
    P(knee)(tor(0.058, 0.01, 12), BRASS, [s * 0.14, 0.31, 0.12], { dir: [0, 0, 1], axis: "z" });
    P(knee)(sph(0.012, 6, 4), BRASS, [s * 0.14, 0.31, 0.15]);
    for (const q of circle(V(s * 0.14, 0.31, 0.125), V(1, 0, 0), V(0, 1, 0), 0.058, 6))
      P(knee)(sph(0.007, 6, 4), BRASS, q);
  }
  void ankles;

  // ---------------------------------------------------------------- arms
  type ArmDef = { s: number; S: THREE.Vector3; E: THREE.Vector3; W: THREE.Vector3 };
  const armDefs: ArmDef[] = [
    { s: 1, S: V(0.31, 0.93, 0), E: V(0.4, 0.7, -0.03), W: V(0.4, 0.5, 0.1) },
    { s: -1, S: V(-0.31, 0.93, 0), E: V(-0.385, 0.7, -0.03), W: V(-0.34, 0.64, 0.19) },
  ];
  const finger = (name: string, pts: THREE.Vector3[], parent: Joint, r0: number) => {
    const names = pts.slice(1).map((_, i) => `${name}${"abcd"[i]}`);
    const ch = b.chain(name, catmull(pts), { parent, names, role: "digit" });
    b.sweep(ch, [r0, r0 * 0.75], { color: SKIN, sides: 6 });
    return ch;
  };
  let wristR!: Joint;
  let HR = V(0, 0, 0);
  for (const a of armDefs) {
    const { s, S, E, W } = a;
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(`arm${side}`, catmull([S, E, W]), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.joints[2];
    b.sweep(arm, [0.068, 0.064, 0.058, 0.052, 0.05], {
      bands: [
        [0.58, BLUE_P],
        [1, SKIN],
      ],
    });
    const fd = W.clone().sub(E).normalize();
    // sleeve roll, bracer
    P(elbow)(tor(0.06, 0.014, 12), LEATHER_DP, E.clone().lerp(W, 0.12), { dir: fd, axis: "z" });
    const bracerAt = E.clone().lerp(W, 0.76);
    P(elbow)(cyl(0.064, 0.056, 0.1, 8), STEEL, bracerAt, { dir: fd });
    P(elbow)(tor(0.062, 0.008, 12), BRASS, bracerAt.clone().addScaledVector(fd, -0.05), { dir: fd, axis: "z" });
    P(elbow)(tor(0.056, 0.008, 12), BRASS, bracerAt.clone().addScaledVector(fd, 0.05), { dir: fd, axis: "z" });
    for (const q of circle(bracerAt.clone().addScaledVector(fd, 0.0), ...basis(fd), 0.064, 6))
      P(elbow)(sph(0.007, 6, 4), BRASS_D, q);
    // elbow cop
    P(elbow)(sph(0.052, 8, 6), STEEL, E.clone().add(V(s * 0.03, 0, -0.03)), { scale: [0.8, 1, 1] });
    // pauldrons
    const A = V(s * 0.88, 0.47, 0).normalize();
    const sc = S.clone().add(V(0, 0.02, 0));
    const dome: OutlinePoint[] = [
      [0, 0],
      [0.15, 0],
      [0.155, 0.02],
      [0.14, 0.06],
      [0.105, 0.105],
      [0.05, 0.13],
      [0, 0.138],
    ];
    const base = sc.clone().addScaledVector(A, -0.02);
    b.lathe(dome, { at: base, axis: A, segments: 12, color: STEEL, bone: shoulder });
    P(shoulder)(tor(0.152, 0.014, 14), BRASS_P, base.clone().addScaledVector(A, 0.012), { dir: A, axis: "z" });
    const [u1, v1] = basis(A);
    for (const q of circle(base.clone().addScaledVector(A, 0.05), u1, v1, 0.138, 10))
      P(shoulder)(sph(0.009, 6, 4), BRASS, q);
    P(shoulder)(new THREE.ConeGeometry(0.03, 0.085, 6), BRASS_P, base.clone().addScaledVector(A, 0.178), { dir: A });
    P(shoulder)(tor(0.036, 0.01, 8), BRASS, base.clone().addScaledVector(A, 0.136), { dir: A, axis: "z" });
    const A2 = V(s * 0.95, -0.28, 0).normalize();
    const base2 = S.clone().addScaledVector(A2, 0.01);
    const dome2: OutlinePoint[] = dome.map(([x, y]) => [x * 0.82, y * 0.82]);
    b.lathe(dome2, { at: base2, axis: A2, segments: 12, color: STEEL, bone: shoulder });
    P(shoulder)(tor(0.125, 0.012, 14), BRASS_P, base2.clone().addScaledVector(A2, 0.01), { dir: A2, axis: "z" });

    // hand
    const handC = W.clone().addScaledVector(fd, 0.05);
    if (s > 0) {
      P(wrist)(sph(0.05, 8, 6), SKIN, handC, { scale: [0.85, 1.1, 1] });
      for (let k = 0; k < 4; k++) {
        const z = handC.z + (k - 1.5) * 0.022;
        const x0 = handC.x + 0.005;
        finger(
          `fingerL${k}`,
          [V(x0, 0.43, z), V(x0 - 0.002, 0.385, z + 0.004), V(x0 - 0.03, 0.36, z + 0.006)],
          wrist,
          0.017,
        );
      }
      finger("thumbL", [V(0.375, 0.47, 0.16), V(0.36, 0.44, 0.185), V(0.348, 0.41, 0.19)], wrist, 0.02);
    } else {
      wristR = wrist;
      HR = handC;
    }
  }

  // ---------------------------------------------------------------- blunderbuss (right hand)
  const GD = V(0.08, 0.2, 1).normalize();
  const GU = V(0, 1, 0).addScaledVector(GD, -GD.y).normalize();
  const GX = new THREE.Vector3().crossVectors(GU, GD);
  const g = (x: number, y: number, z: number) =>
    HR.clone().addScaledVector(GX, x).addScaledVector(GU, y).addScaledVector(GD, z);
  const gOpt = { dir: GD, up: GU, axis: "z" as const };
  const G = P(wristR);

  // hand wrapped on the stock
  G(sph(0.05, 8, 6), SKIN, g(-0.045, 0.02, 0), { scale: [0.85, 1.1, 1.2] });
  for (let k = 0; k < 4; k++) {
    const z = (k - 1.5) * 0.024;
    finger(
      `fingerR${k}`,
      [g(-0.04, 0.04, z), g(-0.06, -0.005, z), g(-0.025, -0.045, z), g(0.01, -0.05, z)],
      wristR,
      0.017,
    );
  }
  finger("thumbR", [g(-0.03, 0.05, -0.06), g(0.02, 0.055, -0.03), g(0.04, 0.05, 0.02)], wristR, 0.02);

  // stock
  b.loft(
    [
      { at: g(0, -0.045, -0.38), w: 0.055, h: 0.15 },
      { at: g(0, -0.02, -0.27), w: 0.05, h: 0.11 },
      { at: g(0, 0.01, -0.13), w: 0.05, h: 0.085 },
      { at: g(0, 0.02, 0), w: 0.05, h: 0.08 },
      { at: g(0, 0.035, 0.14), w: 0.046, h: 0.06 },
      { at: g(0, 0.045, 0.32), w: 0.044, h: 0.05 },
    ],
    { bone: wristR, color: WOOD_P, section: "box", caps: "flat", up: GU, name: "stock" },
  );
  G(box(0.056, 0.15, 0.012), BRASS_P, g(0, -0.045, -0.386), gOpt);
  for (const s of [1, -1]) {
    G(new THREE.PlaneGeometry(0.2, 0.075), "#ffffff", g(s * 0.0275, -0.02, -0.22), {
      dir: [s, 0, 0],
      axis: "z",
      up: GU,
      texture: SCROLL,
    });
  }
  // barrel, bell, bands
  b.sweep([g(0, 0.075, -0.03), g(0, 0.075, 0.52)], 0.03, { color: STEEL, bone: wristR, sides: 8, caps: "flat" });
  b.sweep([g(0, 0.077, 0.5), g(0, 0.08, 0.79)], [0.034, 0.04, 0.06, 0.088], {
    color: STEEL,
    bone: wristR,
    sides: 12,
    caps: "flat",
  });
  G(new THREE.CircleGeometry(0.076, 12), BLACK, g(0, 0.08, 0.7915), { dir: GD, axis: "z" });
  G(tor(0.088, 0.011, 14), BRASS_P, g(0, 0.08, 0.786), { dir: GD, axis: "z" });
  for (const z of [0.08, 0.26, 0.44]) G(tor(0.032, 0.008, 10), BRASS_P, g(0, 0.075, z), { dir: GD, axis: "z" });
  G(tor(0.052, 0.009, 12), BRASS_P, g(0, 0.079, 0.65), { dir: GD, axis: "z" });
  for (const q of circle(g(0, 0.079, 0.68), GX, GU, 0.062, 10)) G(sph(0.008, 6, 4), BRASS, q);
  G(box(0.01, 0.02, 0.02), IRON_D, g(0, 0.108, 0.48), gOpt);
  // lock, hammer, pan, trigger, guard, ramrod
  G(box(0.012, 0.05, 0.12), BRASS_P, g(-0.03, 0.035, 0.1), gOpt);
  G(box(0.012, 0.025, 0.05), BRASS_D, g(-0.037, 0.045, 0.1), gOpt);
  b.sweep([g(-0.04, 0.05, 0.07), g(-0.04, 0.085, 0.05), g(-0.04, 0.11, 0.065)], 0.009, {
    color: IRON_D,
    bone: wristR,
    sides: 6,
  });
  G(box(0.022, 0.012, 0.03), BRASS, g(-0.036, 0.062, 0.155), gOpt);
  b.rod(g(0, 0, 0.085), g(0, -0.04, 0.075), 0.006, { color: IRON_D, bone: wristR, sides: 6 });
  b.sweep(catmull([g(0, -0.005, 0.045), g(0, -0.065, 0.07), g(0, -0.065, 0.14), g(0, -0.005, 0.17)]), 0.008, {
    color: BRASS,
    bone: wristR,
    sides: 6,
  });
  b.rod(g(0, 0.03, 0.14), g(0, 0.03, 0.56), 0.007, { color: RAM, bone: wristR, sides: 6 });
  G(sph(0.011, 6, 4), BRASS, g(0, 0.03, 0.565));
  for (const z of [0.22, 0.4]) G(tor(0.012, 0.004, 8), BRASS, g(0, 0.03, z), { dir: GD, axis: "z" });
  // sling ring and loop
  G(tor(0.018, 0.004, 8), BRASS, g(0, -0.09, -0.3), { dir: GX, axis: "z" });

  // ---------------------------------------------------------------- head
  const H = P(head);
  const HC = V(0, 1.13, 0.05);
  H(sph(1, 14, 10), SKIN, HC, { scale: [0.155, 0.145, 0.15] });
  P(jaw)(sph(1, 10, 8), SKIN, [0, 1.045, 0.12], { scale: [0.1, 0.055, 0.095] });
  H(sph(1, 8, 6), MOUTH, [0, 1.068, 0.205], { scale: [0.04, 0.012, 0.02] });
  // nose and cheeks
  H(sph(0.048, 8, 6), SKIN, [0, 1.095, 0.205], { scale: [1, 0.9, 1.1] });
  b.capsule([0, 1.14, 0.185], [0, 1.105, 0.215], 0.03, { color: SKIN, bone: head, sides: 6 });
  for (const s of [1, -1]) {
    H(sph(0.055, 8, 6), SKIN, [s * 0.1, 1.09, 0.13], { scale: [1, 0.9, 0.8] });
    // ears and earrings
    H(sph(1, 8, 6), SKIN, [s * 0.152, 1.12, 0.03], { scale: [0.018, 0.045, 0.032] });
    H(tor(0.016, 0.004, 8), BRASS, [s * 0.158, 1.085, 0.03], { dir: [1, 0, 0], axis: "z" });
    // eyes
    H(sph(0.022, 8, 6), EYE_W, [s * 0.062, 1.13, 0.178]);
    H(sph(0.0145, 8, 6), IRIS, [s * 0.062, 1.13, 0.195]);
    H(sph(0.008, 6, 4), PUPIL, [s * 0.062, 1.13, 0.2]);
    H(sph(0.0035, 6, 4), WHITE, [s * 0.057, 1.136, 0.205]);
    // heavy brow ridge + brow hair
    H(sph(1, 8, 6), SKIN, [s * 0.06, 1.155, 0.178], { scale: [0.052, 0.02, 0.035] });
    b.capsule([s * 0.02, 1.162, 0.2], [s * 0.115, 1.18, 0.15], [0.02, 0.016], {
      color: HAIR_P,
      bone: head,
      sides: 6,
    });
    // sideburns
    b.sweep(
      catmull([
        [s * 0.145, 1.19, 0.07],
        [s * 0.15, 1.12, 0.1],
        [s * 0.125, 1.06, 0.15],
      ]),
      [0.035, 0.032, 0.04],
      { color: HAIR_P, bone: head, sides: 6 },
    );
    // moustache
    b.sweep(
      catmull([
        [s * 0.01, 1.072, 0.215],
        [s * 0.07, 1.052, 0.215],
        [s * 0.13, 1.03, 0.185],
        [s * 0.17, 1.07, 0.125],
      ]),
      [0.03, 0.034, 0.026, 0.01],
      { color: HAIR_P, bone: head, sides: 6, caps: { start: "round", end: "point" } },
    );
  }

  // pipe with ember
  b.sweep(
    catmull([
      [0.03, 1.066, 0.215],
      [0.06, 1.05, 0.265],
      [0.085, 1.06, 0.3],
    ]),
    0.01,
    { color: PIPE_WOOD, bone: head, sides: 6 },
  );
  const bowlOutline: OutlinePoint[] = [
    [0, 0],
    [0.022, 0],
    [0.034, 0.022],
    [0.036, 0.052],
    [0.026, 0.062],
    [0.022, 0.045],
    [0, 0.045],
  ];
  b.lathe(bowlOutline, { at: [0.09, 1.062, 0.305], axis: [0, 1, 0], segments: 8, color: PIPE_WOOD, bone: head });
  H(tor(0.033, 0.006, 8), BRASS, [0.09, 1.09, 0.305], { dir: [0, 1, 0], axis: "z" });
  glow(
    b.part(new THREE.CircleGeometry(0.02, 8), "#ff6a18", {
      bone: head,
      at: [0.09, 1.1085, 0.305],
      dir: [0, 1, 0],
      axis: "z",
    }),
    1.4,
  );

  // ---------------------------------------------------------------- horned helm
  const RIM = 1.19;
  const helmC = V(0, RIM, 0.05);
  const helmOutline: OutlinePoint[] = [
    [0, 0],
    [0.168, 0],
    [0.172, 0.015],
    [0.165, 0.045],
    [0.15, 0.09],
    [0.115, 0.13],
    [0.06, 0.153],
    [0, 0.16],
  ];
  b.lathe(helmOutline, { at: helmC, axis: [0, 1, 0], segments: 14, color: STEEL, bone: head });
  H(tor(0.172, 0.013, 16), BRASS_P, helmC.clone().add(V(0, 0.008, 0)), { dir: [0, 1, 0], axis: "z" });
  H(tor(0.158, 0.009, 16), IRON_D, helmC.clone().add(V(0, 0.07, 0)), { dir: [0, 1, 0], axis: "z" });
  for (const q of circle(helmC.clone().add(V(0, 0.008, 0)), V(1, 0, 0), V(0, 0, 1), 0.176, 14))
    H(sph(0.0105, 6, 4), BRASS, q);
  // ridge crest
  const ridge = Array.from({ length: 9 }, (_, i) => {
    const th = (-80 + 20 * i) * (Math.PI / 180);
    return V(0, RIM + 0.162 * Math.cos(th) * 1.0 + 0.012, 0.05 + 0.172 * Math.sin(th));
  });
  b.sweep(catmull(ridge), 0.012, { color: BRASS_P, bone: head, sides: 6 });
  for (const t of [0.2, 0.5, 0.8]) {
    const q = catmull(ridge).at(t);
    H(sph(0.015, 6, 4), BRASS, q);
  }
  // horns
  for (const s of [1, -1]) {
    const hp0 = V(s * 0.158, RIM + 0.06, 0.05);
    b.sweep(
      bezier(hp0, V(s * 0.26, RIM + 0.06, 0.05), V(s * 0.3, RIM + 0.15, 0.05), V(s * 0.28, RIM + 0.27, 0.07)),
      [0.034, 0.006],
      {
        bands: [
          [0.2, BRASS_P],
          [1, HORN_P],
        ],
        bone: head,
        sides: 8,
        caps: { start: "flat", end: "point" },
      },
    );
    H(tor(0.036, 0.008, 8), BRASS, hp0.clone().add(V(s * 0.07, 0.0, 0)), { dir: [s, 0, 0], axis: "z" });
  }

  // ---------------------------------------------------------------- beard (jaw bone)
  const beard = b.loft(
    [
      { at: [0, 1.07, 0.15], w: 0.27, h: 0.12 },
      { at: [0, 1.0, 0.19], w: 0.31, h: 0.15 },
      { at: [0, 0.92, 0.215], w: 0.3, h: 0.15 },
      { at: [0, 0.86, 0.225], w: 0.24, h: 0.12 },
    ],
    { bone: jaw, color: HAIR_P, caps: { start: "flat", end: "flat" }, name: "beard" },
  );
  const tufts = b.surface(beard).scatter(110, { rng: rand, minDist: 0.032, filter: (h) => h.n.z > -0.2 });
  b.cards(tufts, LOCK, { size: [0.045, 0.1], lean: 60, flow: [0, -1, 0.1], bend: 20, vary: 0.3, rng: rand });
  // beard clasp
  P(jaw)(box(0.26, 0.032, 0.07), BRASS_P, [0, 0.862, 0.232]);
  for (const x of [-0.09, -0.045, 0, 0.045, 0.09]) P(jaw)(sph(0.011, 6, 4), BRASS_D, [x, 0.862, 0.27]);
  // three braids
  [-0.075, 0, 0.075].forEach((x0, k) => {
    const pts = [
      V(x0, 0.875, 0.235),
      V(x0 * 1.08, 0.8, 0.25),
      V(x0 * 1.18, 0.72, 0.255),
      V(x0 * 1.25, 0.64, 0.25),
    ];
    const path = catmull(pts);
    const bc = b.chain(`braid${k}`, path, {
      parent: jaw,
      names: [`braid${k}a`, `braid${k}b`, `braid${k}c`],
      role: "tail",
    });
    const n = 9;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const q = path.at(t);
      const tan = path.tangentAt(t);
      const sg = i % 2 ? 1 : -1;
      q.x += sg * 0.011;
      const dir = tan.clone().add(V(-sg * 0.45, 0, 0)).normalize();
      P(bc.joints[Math.min(2, Math.floor(t * 3))])(sph(0.026, 8, 6), i % 2 ? HAIR_P : BRAID_B, q, {
        dir,
        scale: [0.9, 1.3, 0.9],
      });
    }
    const end = path.at(1);
    const endT = path.tangentAt(1);
    P(bc.joints[2])(tor(0.03, 0.01, 10), BRASS, end.clone().addScaledVector(endT, -0.01), { dir: endT, axis: "z" });
    P(bc.joints[2])(tor(0.03, 0.008, 10), RED, path.at(0.12), { dir: path.tangentAt(0.12), axis: "z" });
    b.spike(end.clone().addScaledVector(endT, -0.005), endT, 0.075, 0.03, { color: HAIR_P, bone: bc.joints[2], sides: 6 });
  });

  // ---------------------------------------------------------------- backpack
  const pack = slabBox(0.34, 0.34, 0.16, [0, 0.8, -0.22], LEATHER_P, chest, 0.02);
  void pack;
  slabBox(0.35, 0.12, 0.17, [0, 0.9, -0.22], LEATHER_DP, chest, 0.016);
  for (const x of [-0.09, 0.09]) {
    slabBox(0.04, 0.3, 0.17, [x, 0.8, -0.22], LEATHER_DP, chest, 0.008);
    P(chest)(box(0.05, 0.04, 0.012), BRASS, [x, 0.84, -0.311]);
  }
  P(chest)(cyl(0.075, 0.075, 0.42, 10), BEDROLL, [0, 1.0, -0.22], { dir: [1, 0, 0] });
  for (const x of [-0.12, 0.12]) P(chest)(tor(0.078, 0.01, 12), LEATHER_DP, [x, 1.0, -0.22], { dir: [1, 0, 0], axis: "z" });
  for (const s of [1, -1]) {
    P(chest)(cyl(0.045, 0.045, 0.012, 10), WHITE, [s * 0.212, 1.0, -0.22], { dir: [1, 0, 0] });
    P(chest)(tor(0.03, 0.006, 10), RED, [s * 0.219, 1.0, -0.22], { dir: [1, 0, 0], axis: "z" });
  }
  // tin cup on the pack side
  P(chest)(cyl(0.032, 0.026, 0.06, 8), CUP, [0.2, 0.72, -0.25]);
  P(chest)(tor(0.02, 0.005, 8), CUP, [0.228, 0.72, -0.25], { dir: [1, 0, 0], axis: "z" });

  void LEATHER_D;

  return b.root;
}
