import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { offset, rng, type PointInput } from "../src/math";
import { arc, bezier, catmull, polyline } from "../src/path";
import { limb } from "../src/ik";
import { cells, countershade, mix, noise, paint, scales, smoothstep, type Rgb } from "../src/paint";
import type { Surface } from "../src/surface";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Frost Wyrm",
  description:
    "A skeletal-ice wyrm: a ribbed frost chest around a glowing core, crystal horns and a blade crest, and wide indigo wings torn along the trailing edge.",
  style: "Blizzard/Warcraft",
  commit: "b816db2",
};

// ---- painting -------------------------------------------------------------------------------

const KEY = new THREE.Vector3(0.35, 0.8, 0.5).normalize();

/** Hand-painted light: shadow, base and highlight by the angle to the key light, with a soft mottle over it. */
function lit(
  p: THREE.Vector3,
  n: THREE.Vector3,
  dark: string,
  base: string,
  light: string,
  wobble = 0.12,
  size = 0.6,
  seed = 1,
): Rgb {
  const k = smoothstep(-0.45, 0.9, n.dot(KEY)) + (noise(p, size, seed) - 0.5) * wobble;
  const t = Math.min(1, Math.max(0, k));
  return t < 0.5 ? mix(dark, base, smoothstep(0.15, 0.5, t)) : mix(base, light, smoothstep(0.5, 0.85, t));
}

/** Frozen bone: cool white with hairline ice cracks. */
const BONE = paint((p, n) => {
  const c = cells(p, 0.2, 7);
  const crack = 1 - smoothstep(0, 0.035, c.d2 - c.d1);
  return mix(lit(p, n, "#4d82c2", "#d8f1ff", "#ffffff", 0.14, 0.45, 3), "#6aaee6", crack * 0.6);
});
/** Dark blue-slate frozen hide with overlapping scale plates. */
const HIDE = scales(
  paint((p, n) => lit(p, n, "#142c56", "#2b5f90", "#5aa8dc", 0.3, 0.9, 4)),
  "#081a36",
  { size: 0.26, width: 0.12, seed: 9 },
);
const BELLY = paint((p, n) => lit(p, n, "#5b9bd0", "#bfe6ff", "#f4fbff", 0.1, 0.5, 6));
const TORSO = countershade(HIDE, BELLY, { level: -0.15, soft: 0.45 });
/** Indigo membrane with frost veins where the cells meet. */
const WING = paint((p, n) => {
  const c = cells(p, 0.42, 11);
  const vein = 1 - smoothstep(0, 0.04, c.d2 - c.d1);
  return mix(lit(p, n, "#0c1034", "#27338a", "#4d62d6", 0.25, 0.7, 12), "#9ff0ff", vein * 0.75);
});
/** Worn gold trim. */
const GOLD = paint((p, n) => lit(p, n, "#5a3a12", "#c58c2c", "#ffe08a", 0.25, 0.2, 5));
/** Dark iron rivets. */
const IRON = paint((p, n) => lit(p, n, "#1f2a40", "#3d4d6b", "#8fa3c2", 0.2, 0.25, 6));
/** Crystal along a tube: ice at the root, glacier blue at the tip (s[0] is source t). */
const CRYSTAL = paint((p, n, s) =>
  mix(lit(p, n, "#3d86c8", "#bfeeff", "#ffffff", 0.08, 0.3, 8), "#7ff0ff", smoothstep(0.6, 1, s[0])),
);
/** Crest blade: pale ice with cyan tips (s[1] is the outline's height in metres). */
const BLADE = paint((p, n, s) =>
  mix(lit(p, n, "#2c5fa0", "#cdeeff", "#ffffff", 0.1, 0.4, 13), "#6fe6ff", smoothstep(0.2, 0.6, s[1])),
);
/** Claws: ivory fading to dark slate at the tip. */
const CLAW = paint((_p, _n, s) => mix("#f2fbff", "#22336b", smoothstep(0.5, 1, s[0])));

const EYE = "#7ff5ff";
const SOCKET = "#0a1834";
const MOUTH = "#0b1230";
const TOOTH = "#f4fbff";

/** A hanging icicle card: wide root at the bottom edge (it hangs from the frame), tip at the top. */
const ICICLE = svg(
  `<svg viewBox="0 0 32 96" xmlns="http://www.w3.org/2000/svg">
<path d="M3 96 L29 96 L17 3 L15 3 Z" fill="#e4f8ff" stroke="#3f7fc0" stroke-width="2"/>
<path d="M12 88 L15 14" stroke="#ffffff" stroke-width="3"/>
</svg>`,
  { size: 192 },
);

/** Torso radius along the spine (keys evenly spaced over the spine's t, linear between). */
const TORSO_R = [0.7, 0.98, 1.12, 1.02, 0.86];
function torsoR(t: number) {
  const x = Math.min(Math.max(t, 0), 1) * (TORSO_R.length - 1);
  const i = Math.min(Math.floor(x), TORSO_R.length - 2);
  const f = x - i;
  return TORSO_R[i] * (1 - f) + TORSO_R[i + 1] * f;
}

export default function build() {
  const b = createBuilder({ name: "frostWyrm", paintSize: 2048 });
  const rand = rng(21);

  /** A crest blade standing on a surface hit; its base sinks into the body. */
  const blade = (on: PointInput, k: number) => {
    const W = 0.5 * k;
    const H = 0.85 * k;
    const pts: OutlinePoint[] = [
      [-W / 2, -0.25],
      [W / 2, -0.25],
      [W * 0.3, H * 0.55],
      [0, H, "sharp"],
      [-W / 2, H * 0.3],
    ];
    b.extrude(pts, { x: [0, 0, 1], at: on, thickness: 0.06 + 0.05 * k, bevel: 0.012, color: BLADE });
  };

  /** Frost crystals scattered over a surface: small cones standing along the surface normal. */
  const frost = (skin: Surface, count: number, seed: number, minDist: number, lenMin: number, lenMax: number) => {
    const r = rng(seed);
    for (const hit of skin.scatter(count, { rng: r, minDist, filter: (h) => h.n.y > -0.2 })) {
      b.spike(hit, hit, lenMin + (lenMax - lenMin) * r(), 0.045, { color: CRYSTAL });
    }
  };

  /** A torn hem hanging from a wing's trailing edge between two finger tips. */
  const tatter = (a: THREE.Vector3, c: THREE.Vector3) => {
    const w = c.distanceTo(a);
    const x = c.clone().sub(a).normalize();
    const y = new THREE.Vector3(0, -1, 0).addScaledVector(x, x.y).normalize();
    const depth = Math.max(0.3, 0.7 * w);
    const pts: OutlinePoint[] = [
      [-w / 2, 0],
      [w / 2, 0],
    ];
    for (let i = 1; i < 6; i++) {
      const u = w / 2 - (w * i) / 6;
      pts.push([u, -depth * (i % 2 ? 0.4 : 1) * (0.6 + 0.8 * rand()), "sharp"]);
    }
    b.extrude(pts, {
      at: a.clone().lerp(c, 0.5),
      x: [x.x, x.y, x.z],
      y: [y.x, y.y, y.z],
      thickness: 0.03,
      bevel: 0.008,
      color: WING,
    });
  };

  /** A gold band round a body on a surface, with iron rivets set along it. */
  const band = (skin: Surface, on: PointInput, r: number, lift: number, rivets: number) => {
    const path = skin.loop(on, { lift });
    b.sweep(path, r, { color: GOLD });
    b.along(path, rivets, (at) => {
      b.stick(new THREE.SphereGeometry(0.035, 6, 4), IRON, at, { embed: 0.4 });
    });
  };

  // ---- spine, neck, head, tail: the skeleton --------------------------------------------------
  const hips = b.joint("hips", { at: [0, 3.05, -1.9], aim: [0, 3.1, -0.9], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 3.05, -1.9],
      [0, 3.12, -0.9],
      [0, 3.2, 0.1],
      [0, 3.3, 1.0],
      [0, 3.25, 1.6],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 3.25, 1.6],
      [0, 3.9, 2.1],
      [0, 4.65, 2.55],
      [0, 5.3, 2.85],
    ]),
    { parent: spine.joints[3], names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 5.3, 2.85], aim: [0, 5.1, 4.6], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 4.95, 3.35], aim: [0, 4.7, 4.7], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 3.05, -1.9],
      [0, 2.95, -3.0],
      [0, 2.5, -4.3],
      [0, 1.9, -5.5],
      [0, 1.3, -6.6],
      [0, 0.95, -7.5],
      [0, 0.8, -8.2],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6"], role: "tail" },
  );

  // ---- torso: dark hide over a ribcage of frozen bone ------------------------------------------
  const torso = b.sweep(spine, (t) => torsoR(t), { color: TORSO });
  const torsoSurf = b.surface(torso);
  const ribT = Array.from({ length: 8 }, (_, i) => 0.16 + i * 0.09);
  for (const t of ribT) {
    const cp = spine.at(t);
    const R = torsoR(t) + 0.08;
    const top = offset(cp.at, [0, 1, 0], R);
    for (const s of [1, -1]) b.sweep(arc(cp.at, top, cp.tangent, s * 150), 0.05, { color: BONE });
  }
  // sternum keel under the ribs
  b.sweep(
    catmull(ribT.map((t) => offset(spine.at(t).at, [0, -1, 0], torsoR(t) + 0.1))),
    0.055,
    { color: BONE },
  );
  for (const [t, k] of [
    [0.08, 1.3],
    [0.22, 1.2],
    [0.36, 1.1],
    [0.5, 1.0],
    [0.64, 0.9],
    [0.78, 0.75],
    [0.92, 0.6],
  ] as const) {
    const hit = torsoSurf.ray([0, 10, spine.at(t).at.z], [0, -1, 0]);
    if (hit) blade(hit, k);
  }
  band(torsoSurf, hips, 0.05, 0.02, 16);
  frost(torsoSurf, 34, 5, 0.32, 0.16, 0.3);
  // heroic shoulders: a shoulder mass per side with an ice spike on top
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.62, 14, 10).scale(1, 0.92, 1.05), HIDE, {
      bone: spine.joints[3],
      at: [s * 0.66, 3.35, 1.0],
    });
    const top = torsoSurf.nearest([s * 0.9, 4.0, 0.95]);
    b.spike(top, [s * 0.5, 1, 0.1], 0.5, 0.13, { color: CRYSTAL });
  }
  // glowing frost core on the chest, set into the hide
  const core = torsoSurf.nearest([0, 2.7, 1.5]);
  glow(b.stick(new THREE.OctahedronGeometry(0.3, 0).scale(1, 1.3, 0.8), EYE, core, { embed: 0.35 }));
  // icicles hanging from the belly
  const belly = [0.14, 0.22, 0.3, 0.38, 0.46, 0.54, 0.62, 0.7, 0.78].map((t) =>
    frame(torso.at(t, 180), [0, 1, 0]),
  );
  b.cards(belly, ICICLE, { size: [0.12, 0.6], lean: 180, flow: [0, 0, 1], vary: 0.25, rng: rand });

  // ---- neck: scaled hide, a gold collar and blades ------------------------------------------
  const neckSweep = b.sweep(neck, [0.62, 0.52, 0.42], { color: HIDE });
  const neckSurf = b.surface(neckSweep);
  for (const [t, k] of [
    [0.12, 0.9],
    [0.4, 0.8],
    [0.66, 0.65],
    [0.9, 0.5],
  ] as const) {
    const hit = neckSurf.ray([0, 12, neck.at(t).at.z], [0, -1, 0]);
    if (hit) blade(hit, k);
  }
  band(neckSurf, neck.joints[1], 0.05, 0.02, 16);
  frost(neckSurf, 14, 6, 0.25, 0.12, 0.22);

  // ---- tail: long, heavy at the root, with a crest and a three-blade fan -------------------------
  const tailSweep = b.sweep(tail, (t) => 0.72 * (1 - t) ** 1.1 + 0.1, { color: HIDE });
  const tailSurf = b.surface(tailSweep);
  for (const [t, k] of [
    [0.12, 0.95],
    [0.3, 0.8],
    [0.5, 0.6],
    [0.7, 0.45],
  ] as const) {
    const hit = tailSurf.ray([0, 12, tail.at(t).at.z], [0, -1, 0]);
    if (hit) blade(hit, k);
  }
  band(tailSurf, tail.joints[1], 0.05, 0.02, 12);
  const tEnd = tail.at(1);
  for (const d of [
    [0, 0.25, -1],
    [0.5, 0.2, -1],
    [-0.5, 0.2, -1],
  ]) {
    b.spike(tEnd, d, 0.75, 0.14, { color: CRYSTAL });
  }

  // ---- head: an oversized ice skull with a long jaw, crystal horns and a grin of teeth ----------
  const skull = b.loft(
    [
      { at: [0, 5.42, 2.8], w: 1.1, h: 1.1 },
      { at: [0, 5.55, 3.25], w: 1.3, h: 1.22 },
      { at: [0, 5.4, 3.85], w: 1.05, h: 0.98 },
      { at: [0, 5.12, 4.45], w: 0.68, h: 0.62 },
      { at: [0, 4.98, 4.95], w: 0.42, h: 0.36 },
    ],
    { bone: head, color: BONE },
  );
  const skullSurf = b.surface(skull);
  // a gold circlet round the back of the skull
  band(skullSurf, head, 0.05, 0.02, 12);
  const lowerJaw = b.loft(
    [
      { at: [0, 4.73, 3.35], w: 0.78, h: 0.42 },
      { at: [0, 4.6, 3.95], w: 0.58, h: 0.3 },
      { at: [0, 4.5, 4.45], w: 0.38, h: 0.24 },
      { at: [0, 4.42, 4.82], w: 0.22, h: 0.16 },
    ],
    { bone: jaw, color: BONE },
  );
  // the dark mouth between the jaws
  b.sweep(
    catmull([
      [0, 4.92, 3.3],
      [0, 4.86, 4.1],
      [0, 4.78, 4.75],
    ]),
    [0.14, 0.1, 0.07],
    { bone: head, color: MOUTH },
  );
  const jawSurf = b.surface(lowerJaw);
  // icicle beard from the chin
  const chin = [3.9, 4.2, 4.45].map((z) => frame(jawSurf.nearest([0, 4.1, z]), [0, 1, 0]));
  b.cards(chin, ICICLE, { size: [0.1, 0.42], lean: 180, flow: [0, 0, 1] });
  // crest along the top of the skull
  for (const z of [2.9, 3.3, 3.7, 4.1]) {
    b.spike(skullSurf.nearest([0, 6.7, z]), [0, 1, -0.2], 0.38, 0.085, { color: CRYSTAL });
  }

  for (const s of [1, -1]) {
    // brow ridge, cheek spike, horn, nostril, eye
    b.sweep(
      catmull([
        head.local({ left: s * 0.24, up: 0.5, forward: 0.32 }),
        head.local({ left: s * 0.52, up: 0.56, forward: 0.46 }),
        head.local({ left: s * 0.7, up: 0.36, forward: 0.58 }),
      ]),
      [0.12, 0.09, 0.06],
      { bone: head, color: BONE },
    );
    b.spike([s * 0.62, 5.25, 3.25], [s * 1, -0.1, -0.2], 0.6, 0.12, { bone: head, color: BONE });
    b.sweep(
      bezier([s * 0.5, 5.85, 2.8], [s * 1.0, 6.7, 2.6], [s * 1.35, 7.3, 1.9]),
      [0.2, 0],
      { bone: head, color: CRYSTAL },
    );
    b.stick(new THREE.SphereGeometry(0.05, 6, 4), SOCKET, skullSurf.nearest([s * 0.12, 5.12, 4.9]), { embed: 0.5 });
    const eye = skullSurf.nearest(head.local({ left: s * 0.52, up: 0.22, forward: 0.46 }));
    b.stick(new THREE.SphereGeometry(0.2, 10, 8).scale(1, 0.9, 0.6), SOCKET, eye, { embed: 0.45 });
    glow(b.stick(new THREE.SphereGeometry(0.125, 10, 8), EYE, eye, { embed: 0.12 }));
  }

  // teeth: upper row hangs from the snout, lower row rises from the jaw
  for (const s of [1, -1]) {
    let i = 0;
    const upperLen = [0.2, 0.34, 0.26, 0.16, 0.1];
    b.along(
      catmull([
        [s * 0.24, 5.0, 3.6],
        [s * 0.26, 4.9, 4.2],
        [s * 0.18, 4.86, 4.7],
      ]),
      5,
      (at) => {
        b.spike(at, [0, -1, 0.05], upperLen[i++ % upperLen.length], 0.055, { color: TOOTH, bone: head });
      },
    );
    let j = 0;
    const lowerLen = [0.16, 0.24, 0.18];
    b.along(
      catmull([
        [s * 0.2, 4.72, 3.8],
        [s * 0.17, 4.62, 4.3],
        [s * 0.12, 4.56, 4.7],
      ]),
      3,
      (at) => {
        b.spike(at, [0, 1, 0.05], lowerLen[j++ % lowerLen.length], 0.05, { color: TOOTH, bone: jaw });
      },
    );
  }

  // ---- limbs, paws and claws, wings ------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // foreleg: shoulder, elbow, wrist (the paw)
    const shoulder = [s * 0.62, 3.2, 1.05];
    const paw = [s * 0.78, 0.24, 1.55];
    const foreLimb = limb(shoulder, paw, [1.65, 1.55], [[0, 0, -1]]);
    if (foreLimb[foreLimb.length - 1].distanceTo(new THREE.Vector3(...paw)) > 1e-3) {
      throw new Error("foreleg too short for its paw");
    }
    const fore = b.chain(`foreLeg${side}`, foreLimb, {
      parent: spine.joints[3],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
    });
    const foreSweep = b.sweep(fore, [0.64, 0.42, 0.28], { color: HIDE });
    band(b.surface(foreSweep), fore.joints[1], 0.05, 0.03, 12);
    const pawJoint = fore.joints[2];
    b.sweep(
      catmull([
        [s * 0.78, 0.26, 1.36],
        [s * 0.78, 0.22, 1.8],
      ]),
      [0.25, 0.22],
      { bone: pawJoint, color: HIDE },
    );
    for (const x of [-0.16, -0.06, 0.06, 0.16]) {
      b.spike([s * 0.78 + x, 0.18, 1.92], [0, -0.5, 1], 0.3, 0.06, { bone: pawJoint, color: CLAW });
    }

    // hindleg: hip, knee, hock, foot
    const hipP = [s * 0.62, 3.1, -1.85];
    const footP = [s * 0.8, 0.24, -1.2];
    const hindLimb = limb(hipP, footP, [1.3, 1.25, 0.7], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    if (hindLimb[hindLimb.length - 1].distanceTo(new THREE.Vector3(...footP)) > 1e-3) {
      throw new Error("hindleg too short for its foot");
    }
    const hind = b.chain(`hindLeg${side}`, hindLimb, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
    });
    const hindSweep = b.sweep(hind, [0.92, 0.58, 0.34, 0.22], { color: HIDE });
    band(b.surface(hindSweep), hind.joints[1], 0.06, 0.04, 14);
    const footJoint = hind.joints[3];
    b.sweep(
      catmull([
        [s * 0.8, 0.26, -1.36],
        [s * 0.8, 0.22, -0.9],
      ]),
      [0.25, 0.22],
      { bone: footJoint, color: HIDE },
    );
    for (const x of [-0.16, -0.06, 0.06, 0.16]) {
      b.spike([s * 0.8 + x, 0.18, -0.76], [0, -0.5, 1], 0.3, 0.06, { bone: footJoint, color: CLAW });
    }

    // wing: arm from the shoulder, four fingers from the wrist, indigo membranes between
    const W0 = [s * 0.55, 4.0, 0.75];
    const W1 = [s * 1.9, 4.95, 0.95];
    const W2 = [s * 3.55, 5.6, 0.35];
    const arm = b.chain(`wingArm${side}`, catmull([W0, W1, W2]), {
      parent: spine.joints[3],
      names: [`armUp${side}`, `armLo${side}`, `armWrist${side}`],
      role: "wing",
    });
    const armSweep = b.sweep(arm, [0.34, 0.2, 0.1], { color: BONE });
    b.along(armSweep, 7, (at) => {
      b.stick(new THREE.SphereGeometry(0.045, 6, 4), IRON, at, { embed: 0.45 });
    });
    band(b.surface(armSweep), arm.joints[1], 0.035, 0.02, 8);
    b.spike(arm.joints[1], [s * 0.3, 1, -0.7], 0.6, 0.11, { color: CRYSTAL });

    const fingerPts = [
      [
        [s * 5.0, 6.25, 0.1],
        [s * 6.75, 6.55, -0.35],
      ],
      [
        [s * 5.0, 5.7, -0.35],
        [s * 6.5, 5.35, -1.1],
      ],
      [
        [s * 4.7, 5.0, -1.0],
        [s * 5.85, 4.5, -2.0],
      ],
      [
        [s * 4.0, 4.6, -1.35],
        [s * 4.5, 3.8, -2.55],
      ],
    ];
    const fingers = fingerPts.map(([mid, tip], i) => {
      const f = b.chain(`finger${i + 1}${side}`, catmull([W2, mid, tip]), {
        parent: arm.joints[2],
        names: [`f${i + 1}a${side}`, `f${i + 1}b${side}`, `f${i + 1}c${side}`],
        role: "digit",
      });
      b.sweep(f, [0.085, 0.045, 0.02], { color: BONE });
      const end = f.at(1);
      b.spike(end, end, 0.34, 0.05, { color: CRYSTAL });
      return f;
    });
    const tipPts = fingerPts.map(([, tip]) => new THREE.Vector3(tip[0], tip[1], tip[2]));
    const flank = polyline([
      W2,
      [s * 2.5, 4.5, 0.0],
      [s * 1.3, 4.0, -0.6],
      [s * 0.75, 3.4, -1.3],
      [s * 0.66, 3.1, -1.9],
    ]);
    const membrane = { color: WING, thickness: 0.03, scallop: 0.18 };
    b.membrane(fingers[0], polyline([W2, W1, W0]), membrane);
    b.membrane(fingers[0], fingers[1], membrane);
    b.membrane(fingers[1], fingers[2], membrane);
    b.membrane(fingers[2], fingers[3], membrane);
    b.membrane(fingers[3], flank, membrane);
    for (const [i, j] of [
      [0, 1],
      [1, 2],
      [2, 3],
    ]) {
      tatter(tipPts[i], tipPts[j]);
    }
  }

  return b.root;
}
