import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { Chain, Joint } from "../src/skeleton";
import type { Surface } from "../src/surface";
import type { Path } from "../src/path";
import { frame } from "../src/frame";
import { aim, rng } from "../src/math";
import type { FrameInput } from "../src/math";
import { catmull, polyline } from "../src/path";
import { limb } from "../src/ik";
import { svg } from "../src/texture";
import { cells, grain, mix, mottle, noise, paint, smoothstep } from "../src/paint";
import type { Rgb } from "../src/paint";
import type { Fill } from "../src/context";
import { glow } from "../kits/glow";

export const meta = {
  name: "Stitched Abomination",
  description:
    "A hulking patchwork flesh golem: a gut-split belly with ribs showing, a huge sewn-on left arm dragging a spiked ball and chain, a giant meat hook for a right hand, bandolier chains, iron pauldron and one glowing eye.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const FLESH = "#6e9d48";
const FLESH_D = "#4a7034";
const GREY = "#8aa58a";
const GREY_D = "#617060";
const BLUE = "#6f9aa0";
const BLUE_D = "#55696b";
const TAN = "#b79e5c";
const TAN_D = "#7b6e48";
const VEIN: [number, number, number] = [0.36, 0.22, 0.45];
const SHADOW: [number, number, number] = [0.17, 0.12, 0.22];
const LIGHT: [number, number, number] = [0.86, 0.88, 0.58];
const BLOOD = "#7d1f1d";
const BRUISE = "#4a2c4e";
const SCAR_C = "#7a3b46";
const GORE = "#923128";
const GUT = "#c8767e";
const GUT_D = "#8f4455";
const STITCH = "#1f1613";
const BONE = "#dcd2ab";
const BONE_D = "#a79a70";
const IRON = "#59616c";
const IRON_D = "#2c3139";
const IRON_L = "#9aa5b3";
const RUST = "#8d4a24";
const RUST_L = "#bd6c30";
const LEATHER = "#6a4429";
const LEATHER_D = "#3b2517";
const BRASS = "#c39a3c";
const GLOW = "#8dff3b";
const GLOW_L = "#e4ffa0";
const TOOTH = "#d9cd9c";
const NAIL = "#3c3328";
const MOUTH = "#2a090e";
const HAIR = "#2b2320";

// ---------------------------------------------------------------- paints
const TONES = [
  mottle(FLESH, FLESH_D, { size: 0.24, seed: 2 }),
  mottle(GREY, GREY_D, { size: 0.22, seed: 5 }),
  mottle(FLESH, FLESH_D, { size: 0.2, seed: 8 }),
  mottle(BLUE, BLUE_D, { size: 0.26, seed: 9 }),
  mottle(TAN, TAN_D, { size: 0.22, seed: 13 }),
];
const SCAR: Rgb = [0.44, 0.25, 0.3];
const THREAD: Rgb = [0.1, 0.07, 0.06];
// veins, gore, painted shadow and highlight, grime: the hand-painted finish every flesh surface shares
const finish = (c0: Rgb, p: THREE.Vector3, n: THREE.Vector3): Rgb => {
  let c = c0;
  const v = cells(p, 0.27, 4);
  const vein = smoothstep(0.04, 0.0, v.d2 - v.d1) * smoothstep(0.42, 0.58, noise(p, 0.5, 8));
  c = mix(c, VEIN, vein * 0.4);
  const gore = smoothstep(0.66, 0.74, noise(p, 0.38, 21)) * smoothstep(0.8, 1.2, p.y) * smoothstep(2.6, 2.2, p.y);
  c = mix(c, [0.4, 0.12, 0.1], gore * 0.3);
  c = mix(c, SHADOW, smoothstep(0.1, -1, n.y) * 0.5);
  c = mix(c, LIGHT, smoothstep(0.35, 1, n.y) * 0.28);
  return mix(c, SHADOW, smoothstep(0.4, 0.0, p.y) * 0.32);
};
// patchwork of mismatched hides, each patch edge a scar crossed with thread
const SKIN = paint((p, n) => {
  const q = p.clone().add(v3(noise(p, 0.5, 1) - 0.5, noise(p, 0.5, 2) - 0.5, noise(p, 0.5, 3) - 0.5).multiplyScalar(0.3));
  const c = cells(q, 0.8, 12);
  let col = TONES[Math.floor(c.id * 1e6) % TONES.length].at(p, n);
  const e = c.d2 - c.d1;
  col = mix(col, SCAR, smoothstep(0.05, 0.022, e) * 0.9);
  const tick = Math.sin(((p.x * 0.9 + p.y * 1.1 + p.z) * Math.PI * 2) / 0.045);
  col = mix(col, THREAD, smoothstep(0.3, 0.5, tick) * smoothstep(0.046, 0.036, e));
  col = mix(col, THREAD, smoothstep(0.008, 0.002, e));
  return finish(col, p, n);
});
const FACEP = paint((p, n) => finish(mottle("#8aa468", "#6d8a52", { size: 0.16, seed: 31 }).at(p, n), p, n));
const ironBase = mottle(IRON, IRON_D, { size: 0.14, seed: 3, contrast: 0.8 });
const IRONP = paint((p, n) => {
  const r = noise(p, 0.17, 7);
  let c = r > 0.68 ? mottle(RUST, RUST_L, { size: 0.06, seed: 4 }).at(p, n) : ironBase.at(p, n);
  c = mix(c, IRON_L, smoothstep(0.5, 1, n.y) * 0.3);
  return mix(c, SHADOW, smoothstep(0.0, -1, n.y) * 0.4);
});
const LEATHERP = paint((p, n) => {
  const g = grain(LEATHER, LEATHER_D, { size: 0.03, axis: "y", seed: 3 }).at(p, n);
  return mix(g, SHADOW, smoothstep(0.0, -1, n.y) * 0.35);
});
const BONEP = mottle(BONE, BONE_D, { size: 0.07, seed: 6 });

// ---------------------------------------------------------------- helpers
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const Y = v3(0, 1, 0);
const must = <T>(x: T | null | undefined): T => {
  if (x == null) throw new Error("expected a surface hit");
  return x;
};
const perp = (a: THREE.Vector3) => {
  const ref = Math.abs(a.y) < 0.9 ? Y : v3(1, 0, 0);
  const u = new THREE.Vector3().crossVectors(a, ref).normalize();
  const w = new THREE.Vector3().crossVectors(a, u).normalize();
  return [u, w] as const;
};

export default function build() {
  const b = createBuilder({ name: "stitchedAbomination", paintSize: 2048 });
  const rand = rng(1313);
  const J: Record<string, Joint> = {};

  // ---- merged little parts: one part per bone and colour
  type Batch = { bone: Joint; color: Fill; geos: THREE.BufferGeometry[]; flat: boolean };
  const batches = new Map<string, Batch>();
  const put = (
    geo: THREE.BufferGeometry,
    color: Fill,
    bone: Joint | null,
    pos: THREE.Vector3 | readonly number[],
    quat?: THREE.Quaternion,
    scale?: readonly number[],
    flat = true,
  ) => {
    const bn = bone ?? J.chest;
    const key = `${bn.name}|${String(color)}|${flat}`;
    let bt = batches.get(key);
    if (!bt) {
      bt = { bone: bn, color, geos: [], flat };
      batches.set(key, bt);
    }
    const p = pos instanceof THREE.Vector3 ? pos : v3(pos[0], pos[1], pos[2]);
    const s = scale ?? [1, 1, 1];
    const m = new THREE.Matrix4().compose(p, quat ?? new THREE.Quaternion(), v3(s[0], s[1], s[2]));
    bt.geos.push(geo.clone().applyMatrix4(m));
  };
  const flush = () => {
    for (const bt of batches.values()) {
      const merged = mergeGeometries(bt.geos);
      if (merged) b.part(merged, bt.color, { bone: bt.bone, at: [0, 0, 0], flat: bt.flat });
    }
  };

  // shared unit geometries
  const rivetG = new THREE.SphereGeometry(1, 5, 4);
  const cubeG = new THREE.BoxGeometry(1, 1, 1);
  const coneG = new THREE.ConeGeometry(1, 1, 5);
  const linkG = new THREE.TorusGeometry(0.03, 0.0095, 4, 8);

  // chain of interlocking links along any path; each link goes to the bone it rides
  const linkRow = (path: Path, spacing: number, color: Fill, fallback: Joint, size = 1) => {
    const count = Math.max(2, Math.round(path.length / spacing));
    let k = 0;
    b.along(path, count, (at) => {
      const i = k++;
      const q = at.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(Y, (i % 2) * (Math.PI / 2)));
      put(linkG, color, at.bone ?? fallback, at.at, q, [size, size * 1.5, size], false);
    });
  };

  // cross-stitches and a thread line along a path lying on a surface
  const stitchPath = (path: Path, surf: Surface, spacing: number, len: number, fallback: Joint, thread = 0.01) => {
    b.sweep(path, thread, { color: STITCH, sides: 5 });
    const count = Math.max(3, Math.round(path.length / spacing));
    b.along(path, count, (at) => {
      const n = surf.nearest(at.at).n;
      const t = at.axis.clone();
      const side = new THREE.Vector3().crossVectors(t, n).normalize();
      for (const sgn of [1, -1]) {
        const dir = side.clone().applyAxisAngle(n, sgn * 0.62);
        const q = aim(dir, n, "y");
        put(cubeG, STITCH, at.bone ?? fallback, at.at.clone().addScaledVector(n, 0.006), q, [0.011, len, 0.011], false);
      }
    });
  };
  const seamRing = (surf: Surface, on: FrameInput, fallback: Joint, spacing = 0.075, len = 0.13) => {
    const loop = surf.loop(on, { lift: 0.004 });
    stitchPath(loop, surf, spacing, len, fallback);
  };

  const prof = (keys: number[][]) => (t: number): [number, number] => {
    let i = 0;
    while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
    const [t0, a0, b0] = keys[i];
    const [t1, a1, b1] = keys[i + 1];
    const u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
    const e = u * u * (3 - 2 * u);
    return [a0 + (a1 - a0) * e, b0 + (b1 - b0) * e];
  };

  // ================================================================ SKELETON
  const hips = b.joint("hips", { at: [0, 1.28, -0.08], role: "spine" });
  J.hips = hips;
  const spineLine = catmull([
    [0, 1.28, -0.08],
    [0, 1.72, 0.08],
    [0, 2.2, 0.2],
    [0, 2.52, 0.2],
  ]);
  const spine = b.chain("spine", spineLine, { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" });
  const chest = spine.joints[2];
  J.chest = chest;
  J.spine1 = spine.joints[0];
  J.spine2 = spine.joints[1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.52, 0.2],
      [0, 2.66, 0.32],
      [0, 2.76, 0.43],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: neck.at(1), dir: [0, -0.12, 1], role: "head" });
  J.head = head;
  const K = 1.3;
  const H = (left: number, forward: number, up: number) => head.local({ left: left * K, forward: forward * K, up: up * K });
  const jaw = b.joint("jaw", { parent: head, at: H(0, 0.1, 0.02), aim: H(0, 0.42, -0.02), role: "jaw" });
  J.jaw = jaw;

  // ---- legs
  const legs: Record<string, { chain: Chain; ankle: Joint }> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPt = [s * 0.38, 1.22, -0.06];
    const pts = limb(hipPt, [s * 0.45, 0.2, 0.06], [0.58, 0.56], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, catmull(pts), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.45, 0, 0.2],
    });
    legs[side] = { chain: leg, ankle: leg.joints[2] };
  }

  // ---- arms
  const armPts = {
    L: [
      [0.94, 2.4, 0.08],
      [1.3, 1.6, 0.2],
      [1.42, 0.86, 0.46],
    ],
    R: [
      [-0.94, 2.4, 0.08],
      [-1.22, 1.7, 0.26],
      [-1.32, 1.02, 0.52],
    ],
  };
  const armL = b.chain("armL", catmull(armPts.L), {
    parent: chest,
    names: ["shoulderL", "elbowL", "wristL"],
    role: "arm",
  });
  const armR = b.chain("armR", catmull(armPts.R), {
    parent: chest,
    names: ["shoulderR", "elbowR", "wristR"],
    role: "arm",
  });
  const wristL = armL.joints[2];
  const wristR = armR.joints[2];
  J.wristL = wristL;
  J.wristR = wristR;
  J.shoulderL = armL.joints[0];
  J.shoulderR = armR.joints[0];
  J.elbowL = armL.joints[1];
  J.elbowR = armR.joints[1];

  // ================================================================ BODY
  // pelvis
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, {
    bone: hips,
    at: [0, 1.22, -0.04],
    scale: [0.56, 0.44, 0.48],
    name: "pelvis",
  });
  // torso: wide gut, huge chest, hunched
  const torso = b.sweep(
    spine,
    prof([
      [0, 0.42, 0.36],
      [0.2, 0.58, 0.52],
      [0.45, 0.7, 0.6],
      [0.7, 0.8, 0.52],
      [0.9, 0.74, 0.44],
      [1, 0.56, 0.36],
    ]),
    {
      color: SKIN,
      shift: prof([
        [0, 0, 0],
        [0.2, 0, -0.14],
        [0.45, 0, -0.22],
        [0.7, 0, -0.08],
        [1, 0, 0.02],
      ]),
      sides: 12,
      name: "torso",
    },
  );
  // hunch hump over the left shoulder blade and a sewn-on rump of different flesh
  const hump = b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, {
    bone: chest,
    at: [0.3, 2.64, -0.16],
    scale: [0.5, 0.4, 0.42],
    name: "hump",
  });
  const trapR = b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, {
    bone: chest,
    at: [-0.28, 2.66, -0.1],
    scale: [0.4, 0.3, 0.34],
    name: "trapR",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, {
    bone: J.spine1,
    at: [0.42, 1.42, -0.24],
    scale: [0.28, 0.3, 0.26],
    name: "lovehandle",
  });
  // neck
  const neckTube = b.sweep(neck, [0.24, 0.2], { color: SKIN, sides: 10, name: "neck" });

  // ---- head (everything scaled by K so the head reads big on the huge body)
  const k = K;
  const S = (x: number, y: number, z: number) => [x * k, y * k, z * k];
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), FACEP, {
    bone: head,
    at: H(0, 0.16, 0.14),
    scale: S(0.3, 0.29, 0.28),
    name: "skull",
  });
  // angry brow shelf: two heavy capsules meeting low over the nose
  for (const s of [1, -1]) {
    b.capsule(H(s * 0.27, 0.33, 0.28), H(s * 0.03, 0.41, 0.225), 0.046 * k, { bone: head, color: FACEP, sides: 6, name: "brow" });
    // cheekbone slab and jowl
    b.capsule(H(s * 0.24, 0.26, 0.0), H(s * 0.15, 0.44, -0.02), 0.06 * k, { bone: head, color: FACEP, sides: 6, name: "cheek" });
    b.part(new THREE.SphereGeometry(1, 6, 5), FACEP, { bone: head, at: H(s * 0.27, 0.16, -0.06), scale: S(0.07, 0.1, 0.1), name: "jowl" });
  }
  // upper jaw / broad flat nose
  b.sweep(catmull([H(0, 0.34, 0.09), H(0, 0.54, -0.01)]), [0.17 * k, 0.075 * k], {
    bone: head,
    color: FACEP,
    sides: 8,
    caps: "flat",
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(1, 6, 5), FACEP, { bone: head, at: H(0, 0.56, 0.04), scale: S(0.085, 0.05, 0.05), name: "nose" });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(1, 5, 4), STITCH, { bone: head, at: H(s * 0.04, 0.6, 0.035), scale: S(0.02, 0.012, 0.016) });
  // upper lip and fangs
  b.capsule(H(-0.15, 0.53, -0.08), H(0.15, 0.53, -0.08), 0.028 * k, { bone: head, color: SCAR_C, sides: 5, name: "lip" });
  for (const i of [-3, -2, -1, 0, 1, 2, 3])
    put(coneG, TOOTH, head, H(i * 0.045, 0.53, -0.1), new THREE.Quaternion().setFromAxisAngle(v3(1, 0, 0), Math.PI), [0.02 * k, (Math.abs(i) === 2 ? 0.08 : 0.05) * k, 0.02 * k]);
  b.part(new THREE.BoxGeometry(0.34 * k, 0.06 * k, 0.4 * k), MOUTH, { bone: head, at: H(0, 0.34, -0.1), name: "mouth" });
  // eyes: left one blazing in a bruised socket, right one sewn shut
  b.part(new THREE.SphereGeometry(1, 8, 6), BRUISE, { bone: head, at: H(0.13, 0.385, 0.12), scale: S(0.085, 0.045, 0.065), name: "socketL" });
  glow(
    b.part(new THREE.SphereGeometry(1, 8, 6), GLOW, { bone: head, at: H(0.13, 0.425, 0.12), scale: S(0.052, 0.045, 0.048), name: "eyeL" }),
    1.6,
  );
  b.part(new THREE.SphereGeometry(1, 5, 4), STITCH, { bone: head, at: H(0.13, 0.466, 0.12), scale: S(0.011, 0.008, 0.038), name: "pupilL" });
  put(rivetG, GLOW_L, head, H(0.113, 0.462, 0.14), undefined, S(0.01, 0.01, 0.01));
  b.part(new THREE.SphereGeometry(1, 8, 6), BRUISE, { bone: head,  at: H(-0.13, 0.385, 0.12), scale: S(0.085, 0.045, 0.065), name: "socketR" });
  b.part(new THREE.SphereGeometry(1, 8, 6), FACEP, { bone: head,  at: H(-0.13, 0.415, 0.12), scale: S(0.07, 0.04, 0.05), name: "lidR" });
  for (let i = -3; i <= 3; i++) put(cubeG, STITCH, head, H(-0.13 + i * 0.018, 0.447, 0.12), undefined, S(0.007, 0.012, 0.09));
  put(cubeG, STITCH, head, H(-0.13, 0.45, 0.12), undefined, S(0.14, 0.01, 0.01));
  // lower jaw with underbite and tusks
  b.sweep(catmull([H(0, 0.12, -0.14), H(0, 0.34, -0.17), H(0, 0.52, -0.16)]), (t) => [(0.25 - 0.09 * t) * k, (0.08 + 0.015 * t) * k], {
    bone: jaw,
    color: FACEP,
    sides: 8,
    caps: { start: "round", end: "round" },
    name: "jawbone",
  });
  b.part(new THREE.BoxGeometry(0.32 * k, 0.03 * k, 0.36 * k), GORE, { bone: jaw, at: H(0, 0.3, -0.115), name: "tongue" });
  for (const s of [1, -1]) {
    b.spike(H(s * 0.17, 0.5, -0.16), [s * 0.12, 1, 0.45], 0.22 * k, 0.05 * k, { bone: jaw, color: BONEP, sides: 6, name: "tusk" });
    for (let i = 0; i < 3; i++) put(coneG, TOOTH, jaw, H(s * (0.05 + i * 0.045), 0.5 - i * 0.03, -0.12), undefined, [0.02 * k, 0.05 * k, 0.02 * k]);
  }
  // stitched crown seam
  {
    const crown = b.surface([skull]);
    const seam = crown.loop(H(-0.13, 0.16, 0.14), { dir: [1, 0, 0], lift: 0.004 });
    stitchPath(seam.slice(0.0, 0.5), crown, 0.055, 0.1, head, 0.008);
    const chinSeam = b.sweep(catmull([H(-0.2, 0.5, -0.17), H(-0.06, 0.55, -0.19), H(0.1, 0.55, -0.19)]), 0.007, { bone: jaw, color: STITCH, sides: 4 });
    void chinSeam;
  }
  // ears: one torn, one pierced
  for (const s of [1, -1])
    b.part(new THREE.ConeGeometry(1, 1, 5), FACEP, { bone: head, at: H(s * 0.31, 0.14, 0.16), dir: [s, 0.8, -0.35], scale: S(0.08, 0.2, 0.04), name: s > 0 ? "earL" : "earR" });
  b.part(new THREE.TorusGeometry(0.05 * k, 0.013 * k, 5, 10), IRON_L, { bone: head, at: H(-0.36, 0.1, 0.1), dir: [1, 0, 0.0], axis: "z", name: "earring" });
  // iron half-helmet stapled to the left of the skull, ragged hair
  {
    const ax = v3(0.55, 1, -0.1).normalize();
    const c = H(0.02, 0.16, 0.14).addScaledVector(ax, 0.17 * k);
    b.lathe(
      [
        [0, 0],
        [0.23 * k, 0],
        [0.25 * k, 0.02 * k],
        [0.22 * k, 0.09 * k],
        [0.14 * k, 0.14 * k],
        [0.05 * k, 0.165 * k],
        [0, 0.17 * k],
      ],
      { at: c, axis: ax, bone: head, color: IRONP, segments: 10, name: "skullcap" },
    );
    const [u, w] = perp(ax);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      put(rivetG, IRON_L, head, c.clone().addScaledVector(u, Math.cos(a) * 0.245 * k).addScaledVector(w, Math.sin(a) * 0.245 * k).addScaledVector(ax, 0.02 * k), undefined, [0.017 * k, 0.017 * k, 0.017 * k]);
    }
    b.sweep(polyline([c.clone().addScaledVector(u, 0.23 * k).addScaledVector(ax, 0.02 * k), c.clone().addScaledVector(ax, 0.175 * k), c.clone().addScaledVector(u, -0.23 * k).addScaledVector(ax, 0.02 * k)]), [0.03 * k, 0.012 * k], { bone: head, color: IRON, section: "box", name: "capRidge" });
    for (let i = 0; i < 16; i++) {
      const a = 0.4 + (i / 16) * Math.PI * 1.3 + Math.PI * 0.45;
      const base = H(Math.cos(a) * 0.26, 0.15 + Math.sin(a) * 0.2 - 0.04, 0.2 - Math.abs(Math.sin(a)) * 0.06);
      const dirv = v3(Math.cos(a) * 0.4, -0.6 - rand() * 0.5, -0.5 + Math.sin(a) * 0.5);
      put(coneG, HAIR, head, base, aim(dirv, undefined, "y"), [0.04 * k, (0.2 + rand() * 0.14) * k, 0.014 * k]);
    }
  }
  // neck bolts
  for (const s of [1, -1]) {
    const q = aim([s, 0, 0]);
    put(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8), IRON, neck.joints[1], [s * 0.2, 2.62, 0.3], q, undefined, false);
    put(new THREE.CylinderGeometry(0.025, 0.025, 0.2, 6), IRON_L, neck.joints[1], [s * 0.26, 2.62, 0.3], q, undefined, false);
    put(rivetG, IRON_L, neck.joints[1], [s * 0.35, 2.62, 0.3], undefined, [0.04, 0.04, 0.04], false);
  }

  // ---- legs geometry
  const legSurf: Record<string, Surface> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const { chain: leg, ankle } = legs[side];
    const k = s > 0 ? 1.12 : 1;
    const legSweep = b.sweep(leg, (t) => 0.3 * k * (1 - 0.5 * t) + 0.02, {
      color: SKIN,
      sides: 9,
      name: `leg${side}`,
    });
    legSurf[side] = b.surface(legSweep);
    const kneeAt = leg.at(0.48);
    // knee: bone cap (left) / riveted iron guard (right)
    if (s > 0) {
      b.part(new THREE.SphereGeometry(1, 7, 5), BONEP, { bone: leg.joints[1], at: kneeAt.at.clone().add(v3(0, 0.0, 0.25)), scale: [0.12, 0.13, 0.1], name: "kneecapL" });
    } else {
      b.lathe(
        [
          [0, 0],
          [0.22, 0],
          [0.24, 0.03],
          [0.17, 0.11],
          [0.08, 0.14],
          [0, 0.15],
        ],
        { at: kneeAt.at.clone().add(v3(0, 0.0, 0.2)), axis: [0, 0.2, 1], bone: leg.joints[1], color: IRONP, segments: 8, name: "kneeguardR" },
      );
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        put(rivetG, BRASS, leg.joints[1], kneeAt.at.clone().add(v3(Math.cos(a) * 0.19, Math.sin(a) * 0.19, 0.24)), undefined, [0.02, 0.02, 0.02]);
      }
    }
    // seam rings around thigh and shin
    seamRing(legSurf[side], leg.at(0.25), leg.joints[0], 0.08, 0.14);
    seamRing(legSurf[side], leg.at(0.78), leg.joints[1], 0.07, 0.12);
    // foot
    const fx = s * 0.45;
    b.frustumBox([fx, 0.1, -0.2], [fx, 0.1, 0.36], [0.36, 0.2], [0.46, 0.17], { bone: ankle, color: SKIN, name: `foot${side}` });
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: ankle, at: [fx, 0.1, -0.2], scale: [0.18, 0.1, 0.12], name: `heel${side}` });
    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 0.145;
      const base = v3(fx + dx, 0.085, 0.34);
      const tip = v3(fx + dx * 1.2, 0.085, 0.5);
      const toe = b.joint(`toe${i + 1}${side}`, { parent: ankle, at: base, aim: tip, role: "digit" });
      b.capsule(base, tip, 0.078, { bone: toe, color: SKIN, sides: 6, name: `toe${side}${i}` });
      const dir = tip.clone().sub(base).normalize();
      b.spike(tip.clone().addScaledVector(dir, 0.02), dir, 0.09, 0.05, { bone: toe, color: NAIL, sides: 5 });
    }
    for (const z of [-0.02, 0.2]) {
      const strap = polyline(
        Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return [fx + Math.cos(a) * 0.215, 0.105 + Math.sin(a) * 0.095, z];
        }),
        { closed: true },
      );
      b.sweep(strap, [0.02, 0.016], { bone: ankle, color: LEATHER_D, section: "box", name: "footStrap" });
      put(rivetG, BRASS, ankle, [fx, 0.21, z], undefined, [0.02, 0.015, 0.02], false);
    }
    // ankle ruff of wrapped rags and a leather strap
    b.sweep(
      polyline(
        Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return [fx + Math.cos(a) * 0.22, 0.27, 0.06 + Math.sin(a) * 0.22];
        }),
        { closed: true },
      ),
      [0.035, 0.02],
      { bone: ankle, color: LEATHERP, section: "box" },
    );
  }
  // iron bands on the right shin
  {
    const leg = legs.R.chain;
    for (const t of [0.6, 0.7, 0.88]) {
      const c = leg.at(t);
      const bandSurf = legSurf.R.loop(c, { lift: 0.012 });
      b.sweep(bandSurf, [0.03, 0.014], { color: IRONP, section: "box", bone: leg.joints[1] });
      b.along(bandSurf, 8, (at) => put(rivetG, BRASS, leg.joints[1], at.at, undefined, [0.017, 0.017, 0.017], false));
    }
  }

  // ---- arms geometry
  // left: oversized sewn-on arm
  const armLS = b.sweep(armL, prof([[0, 0.31, 0.31], [0.25, 0.34, 0.34], [0.5, 0.33, 0.33], [0.7, 0.34, 0.34], [0.92, 0.28, 0.28], [1, 0.25, 0.25]]), {
    color: SKIN,
    sides: 10,
    name: "armL",
  });
  const armLSurf = b.surface(armLS);
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { bone: J.shoulderL, at: [0.94, 2.44, 0.06], scale: [0.4, 0.36, 0.38], name: "shoulderBallL" });
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: J.elbowL, at: [1.32, 1.6, 0.14], scale: [0.27, 0.26, 0.25], name: "elbowL" });
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: J.elbowL, at: [1.36, 1.2, 0.38], scale: [0.3, 0.34, 0.28], name: "forearmMuscleL" });
  seamRing(armLSurf, armL.at(0.12), J.shoulderL, 0.09, 0.16);
  seamRing(armLSurf, armL.at(0.9), J.elbowL, 0.08, 0.14);
  // a bone spur growing out of the left shoulder
  {
    const o = v3(1.08, 2.68, 0.0);
    b.spike(o, [0.7, 1, -0.3], 0.62, 0.11, { bone: J.shoulderL, color: BONEP, sides: 6, name: "spurL" });
    b.spike(o.clone().add(v3(-0.08, -0.04, -0.16)), [0.1, 1, -0.7], 0.44, 0.08, { bone: J.shoulderL, color: BONEP, sides: 6, name: "spurL2" });
    b.spike(o.clone().add(v3(0.1, -0.1, 0.12)), [0.8, 0.7, 0.4], 0.38, 0.07, { bone: J.shoulderL, color: BONEP, sides: 6, name: "spurL3" });
    b.sweep(polyline([v3(1.15, 2.84, -0.01), v3(1.11, 2.82, 0.05), v3(1.07, 2.84, -0.01)]), 0.02, { color: GORE, bone: J.shoulderL });
  }
  // hand: big open paw
  {
    const hs = 1.3;
    const wrist = armPts.L[2];
    const elbow = armPts.L[1];
    const d = v3(wrist[0] - elbow[0], wrist[1] - elbow[1], wrist[2] - elbow[2]).normalize();
    const w = v3(wrist[0], wrist[1], wrist[2]);
    const fwd = v3(0, 0, 1).addScaledVector(d, -d.z).normalize();
    const palmEnd = w.clone().addScaledVector(d, 0.4);
    b.frustumBox(w.clone(), palmEnd, [0.42 * hs, 0.24 * hs], [0.52 * hs, 0.17 * hs], { bone: wristL, color: SKIN, name: "palmL" });
    b.part(new THREE.SphereGeometry(1, 7, 5), SKIN, { bone: wristL, at: w.clone().addScaledVector(d, 0.14).addScaledVector(fwd, -0.07), scale: [0.24 * hs, 0.2 * hs, 0.2 * hs], name: "heelOfHandL" });
    const offsets = [-0.2, -0.07, 0.07, 0.2];
    const lens = [0.92, 1.05, 1, 0.8];
    for (let i = 0; i < 4; i++) {
      const sc = lens[i] * hs;
      const base = palmEnd.clone().add(v3(offsets[i] * hs, 0, 0)).addScaledVector(d, -0.03);
      const p1 = base.clone().addScaledVector(d, 0.19 * sc).addScaledVector(fwd, 0.03);
      const p2 = p1.clone().addScaledVector(d, 0.15 * sc).addScaledVector(fwd, 0.1 * sc);
      const f = b.chain(`fingerL${i + 1}`, catmull([base, p1, p2]), { parent: wristL, names: [`fingerL${i + 1}a`, `fingerL${i + 1}b`], role: "digit" });
      b.sweep(f, [0.062 * hs, 0.044 * hs], { color: SKIN, sides: 6, name: `fingerL${i + 1}` });
      put(rivetG, SKIN, f.joints[0], base.clone().addScaledVector(d, 0.01), undefined, [0.075 * hs, 0.07 * hs, 0.075 * hs], false);
      put(rivetG, SKIN, f.joints[1], p1, undefined, [0.06 * hs, 0.06 * hs, 0.06 * hs], false);
      const td = p2.clone().sub(p1).normalize();
      put(coneG, NAIL, f.joints[1], p2.clone().addScaledVector(td, 0.03 * hs), aim(td, undefined, "y"), [0.048 * hs, 0.12 * hs, 0.048 * hs], false);
    }
    // thumb
    const tb = w.clone().addScaledVector(d, 0.24).add(v3(-0.24 * hs, 0, 0));
    const t1 = tb.clone().addScaledVector(d, 0.11 * hs).add(v3(-0.06, 0, 0)).addScaledVector(fwd, 0.06);
    const t2 = t1.clone().addScaledVector(d, 0.1 * hs).addScaledVector(fwd, 0.13 * hs).add(v3(0.02, 0, 0));
    const thumb = b.chain("thumbL", catmull([tb, t1, t2]), { parent: wristL, names: ["thumbL1", "thumbL2"], role: "digit" });
    b.sweep(thumb, [0.08 * hs, 0.055 * hs], { color: SKIN, sides: 6, name: "thumbL" });
    const thd = t2.clone().sub(t1).normalize();
    put(coneG, NAIL, thumb.joints[1], t2.clone().addScaledVector(thd, 0.03), aim(thd, undefined, "y"), [0.06 * hs, 0.13 * hs, 0.06 * hs], false);
    // manacle on the wrist
    b.lathe(
      [
        [0.25, -0.06],
        [0.31, -0.04],
        [0.32, 0.06],
        [0.27, 0.09],
        [0.22, 0.09],
        [0.21, -0.06],
      ],
      { at: w.clone().addScaledVector(d, 0.01), axis: d, bone: wristL, color: IRONP, segments: 10, name: "manacleL" },
    );
    const [mu, mv] = perp(d);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const pos = w.clone().addScaledVector(d, 0.04).addScaledVector(mu, Math.cos(a) * 0.32).addScaledVector(mv, Math.sin(a) * 0.32);
      put(rivetG, BRASS, wristL, pos, undefined, [0.022, 0.022, 0.022], false);
    }
    // eye bolt for the chain, and the chain with its ball
    const eyeP = w.clone().add(v3(0.3, 0.02, 0.04));
    put(new THREE.TorusGeometry(0.055, 0.016, 5, 10), IRON_L, wristL, eyeP, aim([1, 0, 0], undefined, "z"), undefined, false);
    const ballC = v3(1.92, 0.34, 1.12);
    const ringP = ballC.clone().add(v3(0, 0.2, -0.1));
    const bc = b.chain("ballChain", catmull([eyeP.clone().add(v3(0.04, 0, 0)), v3(1.8, 0.62, 0.6), v3(1.86, 0.56, 0.84), ringP]), {
      parent: wristL,
      names: ["ballChain1", "ballChain2", "ballChain3"],
      role: "tentacle",
    });
    linkRow(bc.path, 0.06, IRON, wristL);
    const ballJ = b.joint("ballJoint", { parent: bc.joints[2], at: ballC });
    const icoG = new THREE.IcosahedronGeometry(0.21, 0);
    b.part(icoG, IRONP, { bone: ballJ, at: ballC, flat: true, name: "ball" });
    const seen: THREE.Vector3[] = [];
    const pos = icoG.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      const p = v3(pos.getX(i), pos.getY(i), pos.getZ(i));
      if (!seen.some((q) => q.distanceTo(p) < 0.01)) seen.push(p);
    }
    for (const p of seen) {
      const dir = p.clone().normalize();
      put(coneG, IRON_L, ballJ, ballC.clone().addScaledVector(dir, 0.25), aim(dir, undefined, "y"), [0.065, 0.17, 0.065], true);
    }
    b.part(new THREE.TorusGeometry(0.06, 0.018, 5, 10), IRON_L, { bone: ballJ, at: ringP, dir: [0, 0.6, -1], axis: "z", name: "ballRing" });
  }

  // right arm: scrawnier, riveted, ends in a meat hook
  const armRS = b.sweep(armR, prof([[0, 0.27, 0.27], [0.3, 0.29, 0.29], [0.5, 0.27, 0.27], [0.8, 0.23, 0.23], [1, 0.2, 0.2]]), {
    color: SKIN,
    sides: 9,
    name: "armR",
  });
  const armRSurf = b.surface(armRS);
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { bone: J.shoulderR, at: [-0.94, 2.44, 0.06], scale: [0.38, 0.34, 0.36], name: "shoulderBallR" });
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: J.elbowR, at: [-1.24, 1.68, 0.2], scale: [0.26, 0.25, 0.25], name: "elbowR" });
  seamRing(armRSurf, armR.at(0.16), J.shoulderR, 0.09, 0.15);
  seamRing(armRSurf, armR.at(0.55), J.elbowR, 0.08, 0.14);
  // pauldron
  {
    const c = v3(-0.98, 2.62, 0.04);
    const ax = v3(-0.55, 1, 0.05).normalize();
    b.lathe(
      [
        [0, 0],
        [0.46, 0],
        [0.5, 0.03],
        [0.45, 0.14],
        [0.3, 0.26],
        [0.12, 0.32],
        [0, 0.33],
      ],
      { at: c.clone().addScaledVector(ax, -0.1), axis: ax, bone: J.shoulderR, color: IRONP, segments: 10, name: "pauldron" },
    );
    const [u, w] = perp(ax);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const rad = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(w, Math.sin(a));
      put(rivetG, BRASS, J.shoulderR, c.clone().addScaledVector(rad, 0.47).addScaledVector(ax, -0.06), undefined, [0.022, 0.022, 0.022], false);
    }
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const rad = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(w, Math.sin(a));
      const dir = rad.clone().multiplyScalar(0.7).addScaledVector(ax, 0.9).normalize();
      put(coneG, IRON_L, J.shoulderR, c.clone().addScaledVector(rad, 0.3).addScaledVector(ax, 0.1), aim(dir, undefined, "y"), [0.08, 0.34, 0.08]);
    }
    put(coneG, IRON_L, J.shoulderR, c.clone().addScaledVector(ax, 0.3), aim(ax, undefined, "y"), [0.1, 0.4, 0.1]);
  }
  // wrist cuff + hook
  {
    const wrist = armPts.R[2];
    const elbow = armPts.R[1];
    const w = v3(wrist[0], wrist[1], wrist[2]);
    const d = v3(wrist[0] - elbow[0], wrist[1] - elbow[1], wrist[2] - elbow[2]).normalize();
    b.lathe(
      [
        [0.2, -0.1],
        [0.27, -0.07],
        [0.28, 0.12],
        [0.24, 0.16],
        [0.17, 0.16],
        [0.16, -0.1],
      ],
      { at: w.clone().addScaledVector(d, -0.04), axis: d, bone: wristR, color: IRONP, segments: 10, name: "cuffR" },
    );
    const [u, v] = perp(d);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      put(rivetG, BRASS, wristR, w.clone().addScaledVector(d, 0.05).addScaledVector(u, Math.cos(a) * 0.29).addScaledVector(v, Math.sin(a) * 0.29), undefined, [0.022, 0.022, 0.022], false);
    }
    // the hook: a shank down the arm axis curling forward
    const fwd = v3(0, 0, 1).addScaledVector(d, -d.z).normalize();
    const P = (a: number, c: number) => w.clone().addScaledVector(d, a).addScaledVector(fwd, c);
    const hook = b.sweep(
      catmull([P(0.1, 0), P(0.4, 0), P(0.62, 0.0), P(0.8, 0.07), P(0.89, 0.23), P(0.82, 0.41), P(0.65, 0.5), P(0.52, 0.45)]),
      [0.1, 0.095, 0.09, 0.08, 0.065, 0.04],
      { bone: wristR, color: IRONP, sides: 8, caps: { start: "flat", end: "point" }, name: "hook" },
    );
    void hook;
    b.part(new THREE.TorusGeometry(0.12, 0.028, 5, 10), IRONP, { bone: wristR, at: P(0.19, 0), dir: fwd, axis: "z", name: "hookEye" });
    for (const t of [0.3, 0.52]) put(cubeG, BRASS, wristR, P(t, 0), aim(d), [0.2, 0.035, 0.2], false);
    // barb and a dangling gobbet of flesh
    b.spike(P(0.7, 0.01), fwd.clone().multiplyScalar(-1).addScaledVector(d, -0.5), 0.2, 0.05, { bone: wristR, color: IRONP, sides: 6, name: "hookBarb" });
    b.part(new THREE.SphereGeometry(1, 6, 5), GORE, { bone: wristR, at: P(0.8, 0.3), scale: [0.08, 0.1, 0.07], name: "gobbet" });
    b.part(new THREE.SphereGeometry(1, 6, 5), GUT, { bone: wristR, at: P(0.78, 0.33), scale: [0.05, 0.07, 0.05], name: "gobbet2" });
  }

  // chain swag from the pauldron to the hook cuff, and a bracer on the big arm
  linkRow(catmull([[-1.3, 2.52, 0.28], [-1.52, 2.1, 0.4], [-1.6, 1.7, 0.48], [-1.5, 1.3, 0.56]]), 0.058, IRON, J.elbowR, 1.15);
  {
    const bracer = armLSurf.loop(armL.at(0.74), { lift: 0.014 });
    b.sweep(bracer, [0.06, 0.025], { color: LEATHERP, section: "box", bone: J.elbowL, name: "bracerL" });
    b.along(bracer, 12, (at) => put(rivetG, BRASS, J.elbowL, at.at.clone().addScaledVector(armLSurf.nearest(at.at).n, 0.026), undefined, [0.02, 0.02, 0.02], false));
  }

  // ================================================================ TORSO DETAIL
  const torsoSurf = b.surface(torso);
  // belly wound: dark cavity, ribs, guts and slime
  {
    const gh = must(torsoSurf.ray([0, 1.78, 2], [0, 0, -1]));
    b.stick(new THREE.SphereGeometry(1, 10, 8), BLOOD, gh, { embed: 0.55, scale: [0.23, 0.09, 0.42], name: "wound" });
    const ribY = [-0.3, -0.15, 0.0, 0.15, 0.3];
    for (const z of ribY) {
      const w = 0.2 - Math.abs(z) * 0.1;
      b.sweep(
        catmull([gh.local([-w, 0.05, z - 0.025]), gh.local([-w * 0.55, 0.115, z]), gh.local([w * 0.55, 0.115, z]), gh.local([w, 0.05, z - 0.025])]),
        0.02,
        { bone: J.spine2, color: BONEP, sides: 5, name: "rib" },
      );
    }
    // guts spilling
    b.sweep(
      catmull(Array.from({ length: 9 }, (_, i) => gh.local([Math.sin(i * 1.9) * 0.09, 0.1 + 0.015 * (i % 2), -0.34 + i * 0.1]))),
      0.034,
      { bone: J.spine2, color: GUT, sides: 6, name: "gut" },
    );
    b.sweep(
      catmull(Array.from({ length: 7 }, (_, i) => gh.local([0.06 + Math.sin(i * 2.3) * 0.07, 0.08, -0.16 + i * 0.09]))),
      0.026,
      { bone: J.spine2, color: GUT_D, sides: 5, name: "gut2" },
    );
    // slime dripping
    glow(
      b.sweep(catmull([gh.local([0.0, 0.09, -0.4]), gh.local([0.02, 0.1, -0.55]), gh.local([0.0, 0.11, -0.7])]), [0.03, 0.012], {
        bone: J.spine1,
        color: GLOW,
        sides: 5,
        name: "drip",
      }),
      1.0,
    );
    // staples/stitches across the wound lips
    for (let i = 0; i < 6; i++) {
      const z = -0.38 + i * 0.15;
      for (const s of [1, -1]) {
        const base = gh.local([s * 0.24, 0.04, z]);
        put(cubeG, STITCH, J.spine2, base, aim(gh.dir([s * 0.5, 0.2, 0.4]), undefined, "y"), [0.012, 0.12, 0.012], false);
      }
    }
    // loops of thread across the wound
    for (let i = 0; i < 4; i++) {
      const z = -0.3 + i * 0.22;
      b.sweep(catmull([gh.local([-0.26, 0.05, z]), gh.local([-0.1, 0.12, z + 0.03]), gh.local([0.1, 0.12, z - 0.03]), gh.local([0.26, 0.05, z])]), 0.01, {
        bone: J.spine2,
        color: STITCH,
        sides: 4,
      });
    }
  }
  // glowing necrotic brand on the left flank
  {
    const sigil = svg(
      `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#a6ff4a" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="27"/><path d="M32 9 L53 46 L11 46 Z"/><path d="M32 22 V43 M23 31 H41"/></g><circle cx="32" cy="37" r="4.5" fill="#d6ff7a"/></svg>`,
      { size: 256 },
    );
    const brand = must(torsoSurf.ray([0.44, 1.76, 2], [0, 0, -1]));
    glow(b.decal(torso, sigil, { at: brand.at, dir: [0.2, 0, 1], size: [0.3, 0.3], segments: 8, name: "brand" }), 1.0);
  }
  // belt
  const beltLoop = torsoSurf.loop(frame([0, 1.4, 0], [0, 1, 0]), { lift: 0.02 });
  b.sweep(beltLoop, [0.075, 0.035], { color: LEATHERP, section: "box", bone: hips, name: "belt" });
  b.along(beltLoop, 22, (at) => put(rivetG, BRASS, hips, at.at.clone().addScaledVector(torsoSurf.nearest(at.at).n, 0.03), undefined, [0.017, 0.017, 0.017], false));
  {
    const bh = must(torsoSurf.ray([0, 1.4, 2], [0, 0, -1]));
    b.extrude(
      [
        [-0.17, -0.12],
        [0.17, -0.12],
        [0.2, 0.0],
        [0.17, 0.12],
        [-0.17, 0.12],
        [-0.2, 0.0],
      ],
      { at: bh.moved([0, 0.03, 0]).at, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.04, bevel: 0.01, color: IRONP, bone: hips, name: "buckle" },
    );
    put(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 8), BRASS, hips, bh.moved([0, 0.08, 0]).at, aim([0, 0, 1]), undefined, false);
    // loincloth flaps
    for (const [x, z, w, h] of [
      [0.0, 0.0, 0.34, 0.5],
      [0.3, 0.0, 0.2, 0.36],
      [-0.3, 0.0, 0.2, 0.4],
    ]) {
      const hit = must(torsoSurf.ray([x, 1.4, 2], [0, 0, -1]));
      void z;
      b.extrude(
        [
          [-w / 2, 0],
          [w / 2, 0],
          [w / 2, -h * 0.8],
          [0, -h],
          [-w / 2, -h * 0.85],
        ],
        { at: hit.moved([0, 0.04 + (x === 0 ? 0.03 : 0), 0]).at.clone().add(v3(0, -0.015, 0)), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.025, bevel: 0.006, color: LEATHERP, bone: hips, name: "flap" },
      );
    }
  }
  // bandolier chain across the chest, with flesh hooks
  {
    const strap = torsoSurf.drape(
      catmull([
        [0.82, 2.55, 0.0],
        [0.6, 2.4, 0.5],
        [0.2, 2.0, 0.72],
        [-0.25, 1.65, 0.7],
        [-0.6, 1.5, 0.45],
        [-0.72, 1.55, -0.1],
      ]),
      { lift: 0.03 },
    );
    linkRow(strap, 0.062, IRON, chest, 1.1);
    b.sweep(torsoSurf.drape(
      catmull([
        [-0.7, 2.5, 0.0],
        [-0.55, 2.35, 0.48],
        [-0.1, 2.0, 0.7],
        [0.3, 1.7, 0.72],
        [0.62, 1.5, 0.42],
        [0.74, 1.55, -0.1],
      ]),
      { lift: 0.02 },
    ), [0.06, 0.016], { color: LEATHERP, section: "box", bone: chest, name: "strap" });
  }
  // hooks hanging off the belt on short chains
  for (const [x, z, face] of [
    [0.6, 0.05, 1],
    [-0.6, 0.05, -1],
    [0.3, -0.45, 1],
    [-0.3, -0.45, -1],
  ]) {
    const top = v3(x, 1.4, z);
    const len = 0.3 + (z < 0 ? 0.1 : 0);
    linkRow(polyline([top, top.clone().add(v3(0, -len, 0))]), 0.058, IRON, hips, 1.15);
    const bot = top.clone().add(v3(0, -len, 0));
    const dz = z < 0 ? -1 : 1;
    b.sweep(
      catmull([bot.clone().add(v3(0, 0.02, 0)), bot.clone().add(v3(0, -0.14, 0)), bot.clone().add(v3(0, -0.27, 0.07 * dz)), bot.clone().add(v3(0, -0.3, 0.22 * dz)), bot.clone().add(v3(0, -0.2, 0.3 * dz)), bot.clone().add(v3(0, -0.12, 0.26 * dz))]),
      [0.045, 0.012],
      { bone: hips, color: IRONP, sides: 6, caps: { start: "flat", end: "point" }, name: "beltHook" },
    );
    put(new THREE.TorusGeometry(0.05, 0.014, 5, 8), IRON_L, hips, bot.clone().add(v3(0, 0.02, 0)), aim([face, 0, 0], undefined, "z"), undefined, false);
    // hung gobbet of meat on the hook
    b.part(new THREE.SphereGeometry(1, 6, 5), GORE, { bone: hips, at: bot.clone().add(v3(0, -0.24, 0.18 * dz)), scale: [0.06, 0.09, 0.05] });
  }

  // ---- back: vertebra spikes, cleaver, hooked chains, rear flaps, spare arm
  const backSurf = b.surface([torso, hump, trapR]);
  [
    [1.5, 0.15],
    [1.75, 0.18],
    [2.0, 0.22],
    [2.25, 0.25],
    [2.5, 0.24],
    [2.75, 0.2],
  ].forEach(([y, len], i) => {
    const hit = must(backSurf.ray([0.02, y, -2], [0, 0, 1]));
    const dir = hit.n.clone().add(v3(0, 0.4, 0)).normalize();
    b.spike(hit.moved([0, -0.04, 0]), dir, len, 0.07 + 0.004 * i, { color: BONEP, sides: 6, name: "vertebra" });
    put(new THREE.TorusGeometry(0.06 + 0.004 * i, 0.013, 4, 8), SCAR_C, hit.bone, hit.at.clone().addScaledVector(hit.n, 0.012), aim(hit.n, undefined, "z"), undefined, false);
  });
  {
    const hit = must(backSurf.ray([0.27, 2.42, -2], [0, 0, 1]));
    const cx = v3(0.72, 0.18, -0.67).normalize();
    b.extrude(
      [
        [-0.16, -0.2],
        [0.34, -0.2],
        [0.4, -0.15],
        [0.42, 0.16],
        [0.36, 0.21],
        [-0.16, 0.21],
      ],
      { at: hit.at, x: cx.toArray(), y: [-0.1, 1, 0], thickness: 0.035, bevel: 0.008, color: IRONP, bone: chest, name: "cleaver" },
    );
    put(cubeG, LEATHER_D, chest, hit.at.clone().addScaledVector(cx, 0.6), aim(cx, undefined, "y"), [0.06, 0.34, 0.055], false);
    for (const t of [0.5, 0.66]) put(rivetG, BRASS, chest, hit.at.clone().addScaledVector(cx, t).add(v3(0, 0.03, 0)), undefined, [0.026, 0.026, 0.026], false);
  }
  // pinned flesh hooks with chains dangling off the back
  for (const [x, y] of [
    [-0.34, 2.0],
    [0.42, 1.72],
  ]) {
    const hit = must(backSurf.ray([x, y, -2], [0, 0, 1]));
    const out = hit.moved([0, 0.1, 0]).at;
    b.sweep(
      catmull([hit.moved([0, -0.12, 0]).at, hit.moved([0, 0.02, 0.0]).at, out, out.clone().add(v3(0, 0.1, -0.02))]),
      [0.04, 0.03],
      { bone: hit.bone ?? chest, color: IRONP, sides: 6, name: "backHook" },
    );
    put(new THREE.TorusGeometry(0.075, 0.02, 5, 10), IRON_L, hit.bone, out.clone().add(v3(0, 0.15, -0.02)), aim([1, 0, 0], undefined, "z"), undefined, false);
    linkRow(polyline([out.clone().add(v3(0, 0.08, -0.02)), out.clone().add(v3(0, -0.5, -0.04))]), 0.058, IRON, chest, 1.1);
  }
  for (const x of [-0.26, 0.26]) {
    const hit = must(torsoSurf.ray([x, 1.4, -2], [0, 0, 1]));
    const w = 0.3;
    const h = 0.55;
    b.extrude(
      [
        [-w / 2, 0],
        [w / 2, 0],
        [w / 2, -h * 0.85],
        [w * 0.2, -h * 0.7],
        [0, -h],
        [-w * 0.25, -h * 0.75],
        [-w / 2, -h * 0.9],
      ],
      { at: hit.moved([0, 0.045, 0]).at.clone().add(v3(0, 0.0, 0)), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.025, bevel: 0.006, color: LEATHERP, bone: hips, name: "rearFlap" },
    );
  }
  // criss-cross harness over the shoulder blades
  for (const s of [1, -1]) {
    const path = backSurf.drape(
      catmull([
        [s * 0.7, 2.6, -0.1],
        [s * 0.45, 2.5, -0.4],
        [-s * 0.1, 2.0, -0.55],
        [-s * 0.5, 1.6, -0.45],
        [-s * 0.62, 1.5, -0.1],
      ]),
      { lift: 0.03 },
    );
    b.sweep(path, [0.06, 0.017], { color: LEATHERP, section: "box", bone: chest, name: "harness" });
    b.along(path, 8, (at) => put(rivetG, BRASS, chest, at.at.clone().addScaledVector(backSurf.nearest(at.at).n, 0.02), undefined, [0.018, 0.018, 0.018], false));
  }
  // a spare stunted arm grown out of the right shoulder blade
  {
    const spare = b.chain(
      "spareArm",
      catmull([
        [-0.4, 2.3, -0.24],
        [-0.64, 2.02, -0.5],
        [-0.7, 1.66, -0.5],
      ]),
      { parent: chest, names: ["spareShoulder", "spareElbow", "spareWrist"], role: "arm" },
    );
    const spareS = b.sweep(spare, [0.13, 0.1, 0.08], { color: SKIN, sides: 8, name: "spareArm" });
    b.part(new THREE.SphereGeometry(1, 7, 5), SKIN, { bone: spare.joints[0], at: [-0.42, 2.3, -0.24], scale: [0.17, 0.15, 0.15], name: "spareShoulder" });
    b.part(new THREE.SphereGeometry(1, 7, 5), SKIN, { bone: spare.joints[2], at: [-0.7, 1.58, -0.5], scale: [0.11, 0.1, 0.1], name: "sparePalm" });
    seamRing(b.surface(spareS), spare.at(0.3), spare.joints[0], 0.06, 0.1);
    for (const dx of [-0.07, 0, 0.07]) {
      const fa = v3(-0.7 + dx, 1.56, -0.5);
      const fb = v3(-0.7 + dx * 1.2, 1.4, -0.45);
      b.capsule(fa, fb, 0.032, { bone: spare.joints[2], color: SKIN, sides: 5, name: "spareFinger" });
      put(coneG, NAIL, spare.joints[2], fb.clone().add(v3(0, -0.03, 0.015)), aim([0, -1, 0.3], undefined, "y"), [0.03, 0.07, 0.03], false);
    }
  }

  // ---- stitching on torso, neck seam, hump
  seamRing(neckTube && b.surface(neckTube), neck.at(0.35), neck.joints[0], 0.07, 0.12);
  {
    const hs = b.surface(hump);
    const hp = must(hs.nearest([0.3, 2.95, -0.1]));
    const loop = hs.loop(hp.moved([0, 0, 0]), { dir: [0.4, 0.3, 1], lift: 0.004 });
    stitchPath(loop, hs, 0.075, 0.13, chest);
  }
  // shoulders to torso seams already via ring; waist seam
  seamRing(torsoSurf, frame([0, 1.22, -0.03], [0, 1, 0]), hips, 0.09, 0.15);
  // boils
  {
    const hits = torsoSurf.scatter(26, { rng: rng(5), minDist: 0.18, filter: (h) => h.n.y > -0.4 && h.at.y > 1.4 });
    hits.forEach((h, i) => {
      const boil = b.stick(new THREE.SphereGeometry(i % 3 ? 0.04 : 0.06, 6, 4), i % 5 === 0 ? GLOW : i % 4 ? "#a7b27a" : GORE, h, { embed: 0.5 });
      if (i % 5 === 0) glow(boil, 1.2);
    });
  }

  // ================================================================ finish
  flush();
  void skull;
  void head;
  return b.root;
}
