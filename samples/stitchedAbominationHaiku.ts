import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { type Builder, createBuilder, type OutlinePoint } from "../src/builder";
import type { Fill } from "../src/context";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { cells, mix, noise, paint, rgb, type Rgb, smoothstep } from "../src/paint";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Stitched Abomination",
  description:
    "A hulking flesh golem stitched from mismatched hide patches, with an iron neck collar, belt and wrist chains, meat hooks, brass rivets and glowing eyes. Chunky heroic proportions with hand-painted shading.",
  style: "Blizzard/Warcraft",
  commit: "b816db2",
};

type V3 = [number, number, number];
type Placed = { at: THREE.Vector3; quat: THREE.Quaternion };

// Palette
const THREAD = "#2a1a16";
const HAIR = "#2a2220";
const BRASS = "#d4a24c";
const BONE = "#eadfc4";
const CLAW = "#d8c9a0";
const IRON_HOOK = "#4a5059";
const IRON_LINK = "#5f6670";
const GLOW = "#9dff4a";

// Light used by the hand-painted shading
const LIGHT = new THREE.Vector3(0.45, 0.8, 0.4).normalize();
const HALF = new THREE.Vector3(0.45, 0.8, 1.4).normalize();
const HILITE = "#f6f2b4";
const SHADOW = "#33204a";

const PATCH = ["#7fb06a", "#6fa8a2", "#c98a5e", "#8a5fb0", "#b66d6d", "#5ea8ab", "#a8b060"];

// Flesh: patchwork hide with cell borders picked out in dark stitching, bruised patches, and a
// hand-painted gradient from a purple shadow up to a warm highlight.
const skin = paint((p, n) => {
  const cell = cells(p, 0.26, 7);
  let base: Rgb = rgb(PATCH[Math.floor(cell.id * PATCH.length)]);
  const bruise = smoothstep(0.58, 0.78, noise(p, 0.5, 3));
  base = mix(base, "#5b3a72", bruise * 0.5);
  const lam = Math.max(0, n.dot(LIGHT)) + Math.max(0, -n.z) * 0.45;
  let col = mix(SHADOW, base, 0.2 + 0.8 * Math.min(1, lam));
  col = mix(col, HILITE, Math.pow(Math.max(0, n.dot(HALF)), 12) * 0.35);
  const border = cell.d2 - cell.d1;
  if (border < 0.06 && Math.floor((p.x + p.y + p.z) * 140) % 2 === 0) return THREAD;
  return col;
});

// Painted metal and leather: a lit gradient with a streaky wear pattern.
function lit(base: string, dark = "#140d12") {
  return paint((p, n) => {
    const lam = Math.max(0, n.dot(LIGHT)) + Math.max(0, -n.z) * 0.35;
    let col = mix(dark, base, 0.2 + 0.8 * lam);
    col = mix(col, dark, 0.1 + 0.2 * noise(p, 0.015, 9));
    col = mix(col, HILITE, Math.pow(Math.max(0, n.dot(HALF)), 16) * 0.45);
    return col;
  });
}

const ironLit = lit("#6d7682");
const steelLit = lit("#8a94a2");
const leatherLit = lit("#5a3520");
const beltLit = lit("#3f2517");
const rustLit = lit("#8a5230");
const brassLit = lit("#d9a94f", "#4a2e10");

const tuft = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 64 C2 44 4 20 16 2 C28 20 30 44 16 64 Z" fill="#000"/></svg>', { size: 128 });

const DOME: OutlinePoint[] = [
  [0, 0],
  [0.27, 0],
  [0.3, 0.03],
  [0.28, 0.08],
  [0.22, 0.14],
  [0.14, 0.2],
  [0.06, 0.23],
  [0, 0.24],
];

const LUMP: OutlinePoint[] = [
  [0, 0],
  [0.11, 0],
  [0.12, 0.012],
  [0.1, 0.045],
  [0.06, 0.075],
  [0, 0.085],
];

const PLATE: OutlinePoint[] = [
  [-0.16, 0.2],
  [0.16, 0.2],
  [0.18, -0.05],
  [0.1, -0.22],
  [-0.1, -0.22],
  [-0.18, -0.05],
];

// Smooth ramp through (t, radius) stops.
function ramp(stops: [number, number][]) {
  return (t: number) => {
    if (t <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i++) {
      const [t1, r1] = stops[i];
      if (t <= t1) {
        const [t0, r0] = stops[i - 1];
        return r0 + ((r1 - r0) * (t - t0)) / (t1 - t0);
      }
    }
    return stops[stops.length - 1][1];
  };
}

// A catenary between two points, sagging toward `sag`, as a dense polyline.
function catenary(a: V3, c: V3, sag: V3, n = 90): THREE.Vector3[] {
  const A = new THREE.Vector3(...a);
  const B = new THREE.Vector3(...c);
  const S = new THREE.Vector3(...sag);
  const out: THREE.Vector3[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    out.push(A.clone().lerp(B, u).add(S.clone().multiplyScalar(4 * u * (1 - u))));
  }
  return out;
}

// Points every `step` metres along a polyline, each with its tangent.
function sampleAlong(pts: THREE.Vector3[], step: number) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
  const total = cum[cum.length - 1];
  const out: { p: THREE.Vector3; t: THREE.Vector3 }[] = [];
  let j = 0;
  for (let d = step / 2; d < total; d += step) {
    while (j < cum.length - 2 && cum[j + 1] < d) j++;
    const u = (d - cum[j]) / (cum[j + 1] - cum[j]);
    out.push({ p: pts[j].clone().lerp(pts[j + 1], u), t: pts[j + 1].clone().sub(pts[j]).normalize() });
  }
  return out;
}

const X_AXIS = new THREE.Vector3(1, 0, 0);
const Z_AXIS = new THREE.Vector3(0, 0, 1);

// Iron chain links: each a small torus whose ring holds the chain direction, alternating planes.
function chainLinks(b: Builder, pts: THREE.Vector3[], bone: Joint) {
  sampleAlong(pts, 0.052).forEach(({ p, t }, i) => {
    const seed = i % 2 === 0 ? X_AXIS : Z_AXIS;
    const L = seed.clone().sub(t.clone().multiplyScalar(seed.dot(t))).normalize();
    const N = new THREE.Vector3().crossVectors(L, t).normalize();
    const quat = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(L, t, N));
    b.part(new THREE.TorusGeometry(1, 0.25, 5, 10), IRON_LINK, {
      bone,
      at: [p.x, p.y, p.z],
      quat,
      scale: [0.022, 0.034, 0.024],
    });
  });
}

// A meat hook hanging from `top`: a J of tapering iron ending in a sharp point.
function meatHook(b: Builder, top: V3, bone: Joint) {
  const [x, y, z] = top;
  b.sweep(
    bezier([x, y, z], [x, y - 0.16, z + 0.02], [x, y - 0.24, z + 0.12], [x, y - 0.1, z + 0.17]),
    [0.014, 0.006],
    { bone, color: IRON_HOOK, caps: { start: "round", end: "point" } },
  );
}

function merged(geos: THREE.BufferGeometry[]) {
  const g = mergeGeometries(geos);
  if (!g) throw new Error("stitchedAbomination: geometry merge failed");
  return g;
}

function samplePath(p: { at(t: number): THREE.Vector3 }, n: number) {
  return Array.from({ length: n }, (_, i) => p.at(i / n));
}

// Small round studs at points, merged into one part.
function rivetPart(b: Builder, pts: THREE.Vector3[], r: number, color: Fill, bone: Joint) {
  b.part(
    merged(pts.map((p) => new THREE.SphereGeometry(r, 5, 4).translate(p.x, p.y, p.z))),
    color,
    { bone, at: [0, 0, 0] },
  );
}

// Thread stitches lying on surface hits, merged into one part.
function stitchPart(b: Builder, hits: Placed[], color: Fill, bone: Joint, len = 0.02, w = 0.006) {
  b.part(
    merged(
      hits.map((h) => {
        const g = new THREE.BoxGeometry(len, 0.006, w);
        g.applyQuaternion(h.quat);
        const c = new THREE.Vector3(0, 0.004, 0).applyQuaternion(h.quat).add(h.at);
        return g.translate(c.x, c.y, c.z);
      }),
    ),
    color,
    { bone, at: [0, 0, 0] },
  );
}

export default function build() {
  const b = createBuilder({ name: "stitchedAbomination", detail: 1.25, paintSize: 2048 });

  // ----- Skeleton -----------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.18, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.18, 0],
      [0, 1.46, 0.02],
      [0, 1.82, 0.04],
      [0, 2.12, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.12, 0],
      [0, 2.3, 0.05],
      [0, 2.44, 0.1],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.48, 0.1], dir: [0, 0.2, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.36, 0.08], dir: [0, -0.15, 1], role: "jaw" });

  // ----- Torso, neck and head ------------------------------------------------------------------
  const torso = b.loft(
    [
      { at: [0, 1.1, 0], w: 0.56, h: 0.36 },
      { at: [0, 1.36, 0.02], w: 0.66, h: 0.44 },
      { at: [0, 1.62, 0.06], w: 0.7, h: 0.5 },
      { at: [0, 1.9, 0.04], w: 0.82, h: 0.5 },
      { at: [0, 2.12, 0], w: 0.9, h: 0.44 },
      { at: [0, 2.22, -0.02], w: 0.5, h: 0.36 },
    ],
    { bone: spine, color: skin },
  );
  const torsoSurf = b.surface(torso);

  const neckTube = b.sweep(neck, ramp([[0, 0.14], [0.5, 0.12], [1, 0.14]]), { color: skin });
  const neckSurf = b.surface(neckTube);

  // Oversized skull: a wide heroic head with a heavy jaw.
  const skull = b.loft(
    [
      { at: [0, 2.47, -0.02], w: 0.44, h: 0.4 },
      { at: [0, 2.56, 0.06], w: 0.48, h: 0.42 },
      { at: [0, 2.5, 0.2], w: 0.44, h: 0.36 },
      { at: [0, 2.42, 0.28], w: 0.36, h: 0.3 },
      { at: [0, 2.4, 0.32], w: 0.26, h: 0.22 },
    ],
    { bone: head, color: skin },
  );
  const skullSurf = b.surface(skull);
  const jawBox = b.frustumBox([0, 2.36, 0.08], [0, 2.33, 0.36], [0.3, 0.14], [0.24, 0.12], { bone: jaw, color: skin });
  const jawSurf = b.surface(jawBox);

  // Iron collar: a band cut round the neck, brass studs, and a chain hanging from its back.
  const collar = neckSurf.loop(neck.joints[1], { lift: 0.02 });
  b.sweep(collar, (_t: number): [number, number] => [0.028, 0.024], { section: "box", color: ironLit });
  rivetPart(b, samplePath(collar, 12), 0.012, BRASS, neck.joints[1]);
  const back = samplePath(collar, 48).reduce((m, p) => (p.z < m.z ? p : m));
  const pendant = catenary([back.x, back.y, back.z], [0.1, 1.0, -0.42], [0, 0, -0.14]);
  chainLinks(b, pendant, hips);
  meatHook(b, [0.1, 1.0, -0.42], hips);

  // Stitched seams on the torso: raised thread with cross-stitches on top.
  const seams: V3[][] = [
    [
      [0, 1.98, 0.22],
      [0, 1.7, 0.27],
      [0, 1.42, 0.25],
      [0, 1.2, 0.2],
    ],
    [
      [0.46, 2.0, 0.08],
      [0.3, 1.86, 0.22],
      [0.14, 1.7, 0.26],
    ],
    [
      [-0.48, 1.86, 0.02],
      [-0.36, 1.55, 0.2],
      [-0.28, 1.3, 0.22],
    ],
  ];
  for (const pts of seams) {
    const seam = torsoSurf.drape(catmull(pts), { lift: 0.006 });
    b.sweep(seam, 0.009, { color: THREAD });
    stitchPart(b, samplePath(seam, 26).map((p) => torsoSurf.nearest(p)), THREAD, spine.joints[1]);
  }

  // Rust-patched iron chest plate, sewn on with brass studs.
  b.extrude(PLATE, {
    at: [-0.02, 1.68, 0.32],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.022,
    bevel: 0.006,
    smoothing: 1,
    color: rustLit,
    bone: spine.joints[1],
  });
  rivetPart(
    b,
    [
      new THREE.Vector3(-0.17, 1.85, 0.34),
      new THREE.Vector3(0.14, 1.85, 0.34),
      new THREE.Vector3(0.15, 1.6, 0.34),
      new THREE.Vector3(-0.19, 1.6, 0.34),
      new THREE.Vector3(-0.02, 1.47, 0.34),
    ],
    0.014,
    BRASS,
    spine.joints[1],
  );

  // Leather bandolier across the chest, with studs.
  const bandolier = torsoSurf.drape(
    catmull([
      [-0.45, 2.1, 0.1],
      [-0.36, 1.9, 0.24],
      [-0.22, 1.6, 0.3],
      [-0.12, 1.34, 0.3],
    ]),
    { lift: 0.012 },
  );
  b.sweep(bandolier, (_t: number): [number, number] => [0.028, 0.012], { section: "box", color: leatherLit });
  rivetPart(b, samplePath(bandolier, 9), 0.011, BRASS, spine.joints[1]);

  // Grafted flesh lumps, each sewn down with a ring of thread.
  const grafts: V3[] = [
    [0.3, 1.5, 0.2],
    [-0.34, 1.66, 0.12],
    [0.2, 1.36, 0.24],
    [-0.4, 1.4, 0.05],
  ];
  for (const g of grafts) {
    const hit = torsoSurf.nearest(g);
    b.lathe(LUMP, { at: hit.moved([0, -0.012, 0]), axis: hit, smoothing: 1, color: skin });
    const ringPts = Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return hit.local([0.12 * Math.cos(a), 0, 0.12 * Math.sin(a)]);
    });
    b.sweep(torsoSurf.drape(catmull(ringPts, { closed: true }), { lift: 0.006 }), 0.007, { color: THREAD });
  }

  // Belt with a brass buckle, a chest strap, and dorsal spikes down the spine.
  const belt = torsoSurf.loop(hips, { lift: 0.03 });
  b.sweep(belt, (_t: number): [number, number] => [0.04, 0.03], { section: "box", color: beltLit });
  rivetPart(b, samplePath(belt, 16), 0.014, BRASS, hips);
  const buckle = torsoSurf.nearest([0, 1.19, 0.3]);
  b.stick(new THREE.BoxGeometry(0.1, 0.07, 0.024), BRASS, buckle, { embed: 0.2 });

  const chest = torsoSurf.loop(spine.joints[1], { lift: 0.025 });
  b.sweep(chest, (_t: number): [number, number] => [0.03, 0.025], { section: "box", color: leatherLit });
  rivetPart(b, samplePath(chest, 18), 0.013, BRASS, spine.joints[1]);

  for (const y of [1.45, 1.7, 1.95]) {
    const hit = torsoSurf.nearest([0, y, -0.5]);
    b.stick(new THREE.ConeGeometry(0.035, 0.13, 5), CLAW, hit, { embed: 0.25 });
  }

  // Back plate of rusted iron over the spine, brass studs, and a stitched seam across the back.
  const backPlate: OutlinePoint[] = [
    [-0.12, 0.42],
    [0.12, 0.42],
    [0.14, 0],
    [0.1, -0.42],
    [-0.1, -0.42],
    [-0.14, 0],
  ];
  b.extrude(backPlate, {
    at: [0, 1.6, -0.215],
    x: [-1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.022,
    bevel: 0.006,
    smoothing: 1,
    color: rustLit,
    bone: spine.joints[1],
  });
  rivetPart(
    b,
    [
      new THREE.Vector3(-0.12, 1.9, -0.23),
      new THREE.Vector3(0.12, 1.9, -0.23),
      new THREE.Vector3(-0.13, 1.6, -0.23),
      new THREE.Vector3(0.13, 1.6, -0.23),
      new THREE.Vector3(-0.12, 1.3, -0.23),
      new THREE.Vector3(0.12, 1.3, -0.23),
      new THREE.Vector3(0, 1.2, -0.23),
    ],
    0.013,
    BRASS,
    spine.joints[1],
  );
  const backSeam = torsoSurf.drape(
    catmull([
      [-0.4, 2.0, -0.12],
      [-0.2, 1.8, -0.22],
      [0, 1.6, -0.22],
      [0.2, 1.35, -0.2],
      [0.36, 1.2, -0.08],
    ]),
    { lift: 0.006 },
  );
  b.sweep(backSeam, 0.009, { color: THREAD });
  stitchPart(b, samplePath(backSeam, 26).map((p) => torsoSurf.nearest(p)), THREAD, spine.joints[1]);

  // Loincloth of hide with brass studs.
  const cloth: OutlinePoint[] = [
    [-0.2, 0.12],
    [0.2, 0.12],
    [0.22, -0.12],
    [0.14, -0.3],
    [0, -0.22, "sharp"],
    [-0.14, -0.3],
    [-0.22, -0.12],
  ];
  b.extrude(cloth, {
    at: [0, 1.2, 0.24],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.026,
    bevel: 0.006,
    smoothing: 1,
    color: leatherLit,
    bone: hips,
  });
  rivetPart(
    b,
    [new THREE.Vector3(-0.15, 1.1, 0.26), new THREE.Vector3(0.15, 1.1, 0.26), new THREE.Vector3(0, 0.98, 0.27)],
    0.014,
    BRASS,
    hips,
  );

  // Neck: stitched seam ring just under the head.
  const neckRing = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return new THREE.Vector3(0.14 * Math.sin(a), 2.36, 0.08 + 0.14 * Math.cos(a));
  });
  b.sweep(neckSurf.drape(catmull(neckRing, { closed: true }), { lift: 0.006 }), 0.008, { color: THREAD });

  // ----- Arms and legs (mirrored) -------------------------------------------------------------
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const mx = (x: number) => s * x;

    // Arm: shoulder, elbow, wrist and a hand tip.
    const arm = b.chain(
      `arm${k}`,
      catmull([
        [mx(0.5), 2.02, 0],
        [mx(0.6), 1.5, 0.1],
        [mx(0.66), 1.04, 0.26],
        [mx(0.7), 0.92, 0.36],
      ]),
      { parent: spine.joints[2], names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`, `hand${k}`], role: "arm" },
    );
    const [shoulder, elbow, wrist, hand] = arm.joints;
    const armTube = b.sweep(arm, ramp([[0, 0.17], [0.44, 0.14], [0.7, 0.155], [0.9, 0.105], [1, 0.1]]), { color: skin });
    const armSurf = b.surface(armTube);

    // Shoulder pauldron: a steel dome with a brass trim ring, rivets and spikes.
    const pc: V3 = [mx(0.52), 2.06, 0];
    b.lathe(DOME, { at: pc, axis: [0, 1, 0], smoothing: 1, color: steelLit, bone: shoulder });
    const rimPts = Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return [pc[0] + 0.285 * Math.cos(a), 2.07, pc[2] + 0.285 * Math.sin(a)] as V3;
    });
    b.sweep(catmull(rimPts, { closed: true }), 0.012, { color: brassLit, bone: shoulder });
    rivetPart(
      b,
      rimPts.filter((_, i) => i % 2 === 0).map((p) => new THREE.Vector3(...p)),
      0.014,
      BRASS,
      shoulder,
    );
    for (const deg of [-50, -15, 20]) {
      const a = (deg * Math.PI) / 180;
      const base: V3 = [pc[0] + s * 0.2 * Math.cos(a), 2.23, pc[2] + 0.2 * Math.sin(a)];
      const tip: V3 = [base[0] + s * 0.12 * Math.cos(a), base[1] + 0.09, base[2] + 0.12 * Math.sin(a)];
      b.spike(base, tip, null, 0.028, { color: CLAW, bone: shoulder });
    }

    // Elbow and wrist bands.
    const elbowBand = armSurf.loop(elbow, { lift: 0.02 });
    b.sweep(elbowBand, (_t: number): [number, number] => [0.03, 0.024], { section: "box", color: ironLit });
    rivetPart(b, samplePath(elbowBand, 10), 0.013, BRASS, elbow);
    const wristBand = armSurf.loop(wrist, { lift: 0.02 });
    b.sweep(wristBand, (_t: number): [number, number] => [0.032, 0.026], {
      section: "box",
      color: s > 0 ? leatherLit : ironLit,
    });

    // Oversized fist: a block palm, four knuckle fingers with claws, and a thumb.
    b.frustumBox([mx(0.66), 1.0, 0.27], [mx(0.7), 0.9, 0.46], [0.24, 0.24], [0.3, 0.25], { bone: hand, color: skin });
    const knuckles: THREE.Vector3[] = [];
    for (let i = 0; i < 4; i++) {
      const fx = mx(0.7) + (i - 1.5) * 0.07;
      b.capsule([fx, 0.92, 0.47], [fx, 0.9, 0.6], 0.033, { bone: hand, color: skin });
      b.capsule([fx, 0.9, 0.6], [fx, 0.84, 0.58], 0.03, { bone: hand, color: skin });
      b.spike([fx, 0.82, 0.58], [fx, 0.77, 0.62], null, 0.014, { bone: hand, color: CLAW });
      knuckles.push(new THREE.Vector3(fx, 0.93, 0.5));
    }
    b.capsule([mx(0.62), 0.98, 0.42], [mx(0.56), 0.9, 0.52], 0.036, { bone: hand, color: skin });
    rivetPart(b, knuckles, 0.017, BRASS, hand);

    if (s < 0) {
      // Right wrist: a chain from the manacle, ending in a meat hook near the floor.
      const wristChain = catenary([mx(0.66), 0.99, 0.2], [mx(0.6), 0.46, 0.48], [mx(0.18), 0, 0]);
      chainLinks(b, wristChain, wrist);
      meatHook(b, [mx(0.6), 0.46, 0.48], wrist);
    }

    // Leg: hip, knee, ankle and a foot tip.
    const leg = b.chain(
      `leg${k}`,
      catmull([
        [mx(0.26), 1.16, 0],
        [mx(0.28), 0.7, 0.04],
        [mx(0.26), 0.22, -0.02],
        [mx(0.26), 0.1, 0.06],
      ]),
      { parent: hips, names: [`hip${k}`, `knee${k}`, `ankle${k}`, `foot${k}`], role: "leg" },
    );
    const [hipJ, knee, ankle, foot] = leg.joints;
    const legTube = b.sweep(leg, ramp([[0, 0.2], [0.2, 0.22], [0.47, 0.14], [0.66, 0.155], [0.89, 0.1], [1, 0.1]]), {
      color: skin,
    });
    const legSurf = b.surface(legTube);

    // Knee guard of iron with brass studs, boot-top strap at the ankle.
    const kneeBand = legSurf.loop(knee, { lift: 0.03 });
    b.sweep(kneeBand, (_t: number): [number, number] => [0.035, 0.028], { section: "box", color: ironLit });
    rivetPart(b, samplePath(kneeBand, 9), 0.016, BRASS, knee);
    const ankleBand = legSurf.loop(ankle, { lift: 0.02 });
    b.sweep(ankleBand, (_t: number): [number, number] => [0.032, 0.026], { section: "box", color: leatherLit });

    // Heavy boot with toe claws.
    b.frustumBox([mx(0.26), 0.12, -0.1], [mx(0.26), 0.12, 0.23], [0.2, 0.24], [0.19, 0.22], { bone: foot, color: leatherLit });
    for (const dx of [-0.06, 0, 0.06]) {
      b.spike([mx(0.26) + dx, 0.09, 0.22], [mx(0.26) + dx, 0.05, 0.27], null, 0.018, { bone: foot, color: CLAW });
    }

    // Hip chain: from a belt ring, sagging out and down, ending in a meat hook at the thigh.
    const hipChain = catenary([mx(0.36), 1.12, 0], [mx(0.5), 0.6, 0.14], [mx(0.14), 0, 0.02]);
    chainLinks(b, hipChain, hipJ);
    meatHook(b, [mx(0.5), 0.6, 0.14], hipJ);
  }

  // ----- Head ---------------------------------------------------------------------------------
  // Brow ridge, nose and a stitched forehead scar.
  b.sweep(
    catmull([
      [-0.22, 2.62, 0.24],
      [-0.1, 2.65, 0.3],
      [0, 2.64, 0.32],
      [0.1, 2.65, 0.3],
      [0.22, 2.62, 0.24],
    ]),
    0.04,
    { bone: head, color: skin },
  );
  b.capsule([0, 2.48, 0.36], [0, 2.42, 0.44], 0.045, { bone: head, color: skin });
  const scar = skullSurf.drape(
    catmull([
      [-0.26, 2.66, 0.16],
      [-0.1, 2.72, 0.2],
      [0.06, 2.7, 0.22],
      [0.22, 2.64, 0.18],
    ]),
    { lift: 0.005 },
  );
  b.sweep(scar, 0.008, { color: THREAD });
  stitchPart(b, samplePath(scar, 18).map((p) => skullSurf.nearest(p)), THREAD, head);

  // Stitched lips.
  const lips = skullSurf.drape(
    catmull([
      [-0.14, 2.4, 0.34],
      [-0.07, 2.37, 0.38],
      [0, 2.36, 0.39],
      [0.07, 2.37, 0.38],
      [0.14, 2.4, 0.34],
    ]),
    { lift: 0.004 },
  );
  b.sweep(lips, 0.008, { color: THREAD });
  stitchPart(b, samplePath(lips, 14).map((p) => skullSurf.nearest(p)), THREAD, head, 0.012, 0.005);

  // Upper teeth on the skull, lower teeth on the jaw, two big tusks.
  for (const x of [-0.13, -0.085, -0.04, 0, 0.04, 0.085, 0.13]) {
    const hit = skullSurf.nearest([x, 2.37, 0.4]);
    const big = Math.abs(x) > 0.1;
    b.spike(hit, [0, -1, 0.05], big ? 0.08 : 0.05, big ? 0.02 : 0.014, { color: BONE, bone: head });
  }
  for (const x of [-0.11, -0.055, 0, 0.055, 0.11]) {
    const hit = jawSurf.nearest([x, 2.33, 0.34]);
    b.spike(hit, [0, 1, 0.05], 0.045, 0.013, { color: BONE, bone: jaw });
  }

  for (const s of [1, -1]) {
    const mx = (x: number) => s * x;

    // Frankenstein bolt through each temple, with a hex nut outside.
    b.rod([mx(0.16), 2.52, 0.1], [mx(0.25), 2.52, 0.1], 0.022, { bone: head, color: ironLit });
    b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.04, 6), ironLit, {
      bone: head,
      at: [mx(0.27), 2.52, 0.1],
      rotation: [0, 0, -90 * s],
    });

    // Eye: a glowing socket with a stitched rim.
    const eyeHit = skullSurf.nearest([mx(0.13), 2.53, 0.38]);
    b.stick(new THREE.TorusGeometry(0.07, 0.018, 5, 10), THREAD, eyeHit, { embed: 0.2 });
    glow(b.stick(new THREE.SphereGeometry(0.048, 8, 6), GLOW, eyeHit, { embed: 0.45 }), 1.6);
  }

  // Hair tufts on the scalp.
  const scalp = skullSurf.scatter(46, { rng: rng(5), minDist: 0.05, filter: (h) => h.n.y > 0.5 });
  b.cards(scalp, tuft, { size: [0.045, 0.11], lean: 12, bend: 25, vary: 0.3, rng: rng(9), color: HAIR });

  return b.root;
}
