import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Chain, Joint } from "../src/skeleton";
import type { PointInput } from "../src/math";
import { frame } from "../src/frame";
import { lerp, rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { limb } from "../src/ik";
import { cells, mix, mottle, noise, paint, smoothstep } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Bone Drake",
  description:
    "A towering undead drake of cracked ivory bone, rusted iron bindings and tattered wings, its ribcage caging a burning green soul.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const BONE_LT = "#f1e7c6";
const BONE = "#dccfa6";
const BONE_SH = "#9d8b66";
const BONE_DK = "#5d4d37";
const CLAW = "#2e2620";
const TOOTH = "#efe5c4";
const SINEW = "#34273f";
const SINEW_LT = "#56406b";
const VOID = "#120d16";
const GLOW = "#92ff4f";
const GLOW_DK = "#2e9f3c";
const GLOW_CORE = "#eaffc4";
const RUST = "#8a4e2c";
const GOLD = "#c79a3a";
const CLOTH = "#8a2232";
const MEM = "#6a5488";
const MEM_TEAL = "#477c88";

// ---------------------------------------------------------------------------------------------------------------
// Paints: hand-painted bone (light from above, grime in the crevices, cracks), sinew, iron, wing skin

const bonePaint = paint((p, n) => {
  const up = smoothstep(-0.7, 0.9, n.y);
  let c = mix(BONE_SH, BONE, up);
  c = mix(c, BONE_LT, smoothstep(0.5, 1, n.y) * 0.85);
  c = mix(c, "#9a8654", smoothstep(0.58, 0.8, noise(p, 0.22, 9)) * 0.55);
  const w = cells(p, 0.2, 4);
  const crack = (1 - smoothstep(0.012, 0.06, w.d2 - w.d1)) * smoothstep(0.5, 0.68, noise(p, 0.6, 11));
  return mix(c, BONE_DK, crack * 0.85);
});

const darkBonePaint = paint((p, n) => {
  const up = smoothstep(-0.7, 0.9, n.y);
  const c = mix("#3b3024", "#6c5a40", up);
  return mix(c, "#8a7650", smoothstep(0.6, 0.8, noise(p, 0.15, 5)) * 0.4);
});

const sinewPaint = mottle(SINEW, SINEW_LT, { size: 0.18, seed: 3, contrast: 1.2 });

const ironPaint = paint((p, n) => {
  const up = smoothstep(-0.5, 0.9, n.y);
  const c = mix("#2f2b29", "#6c655d", up);
  return mix(c, RUST, smoothstep(0.52, 0.72, noise(p, 0.12, 6)) * 0.8);
});

const wingFn = (p: THREE.Vector3) => {
  // Veins fan out from the wrist (x mirrored so both wings share one pattern).
  const ax = Math.abs(p.x) - 2.3;
  const az = p.z - 0.5;
  const ang = Math.atan2(az, ax);
  const r = Math.hypot(ax, az);
  const vein = Math.abs(Math.sin(ang * 16 + noise(p, 0.5, 5) * 2.2));
  let c = mix(MEM, MEM_TEAL, smoothstep(0.45, 0.72, noise(p, 0.5, 2)) * 0.7);
  c = mix(c, "#74628c", smoothstep(0.55, 0.85, noise(p, 0.25, 4)) * 0.3);
  c = mix(c, "#2a1d3a", smoothstep(0.9, 0.985, vein) * 0.8);
  c = mix(c, "#33264a", smoothstep(0.62, 0.82, noise(p, 0.3, 8)) * 0.6);
  return mix(c, "#2b2024", smoothstep(1.3, 2.4, r) * 0.4);
};
const wingPaint = paint(wingFn);
const leadPaint = mottle("#44364f", "#35525c", { size: 0.35, seed: 2 });

// ---------------------------------------------------------------------------------------------------------------
// Textures

const flame = svg(
  `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
     <path d="M32 2 C40 30 58 52 54 84 C52 108 42 124 32 126 C20 124 8 108 10 84 C12 62 26 50 24 30 C30 38 28 14 32 2Z" fill="#2e9f3c"/>
     <path d="M32 30 C38 52 48 66 45 88 C43 106 38 116 32 118 C25 116 20 106 19 88 C18 70 30 58 32 30Z" fill="#92ff4f"/>
     <path d="M32 66 C36 80 40 90 37 102 C35 110 33 112 32 112 C29 111 26 106 26 98 C26 86 31 78 32 66Z" fill="#eaffc4"/>
   </svg>`,
  { size: 128 },
);

const rune = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
     <g fill="none" stroke="#a8ff62" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
       <path d="M32 5 V59"/><path d="M16 22 L32 34 L48 22"/><path d="M16 42 L32 54 L48 42"/><path d="M22 12 H42"/>
     </g>
   </svg>`,
  { size: 128 },
);

const rag = svg(
  `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
     <path d="M2 2 H62 L60 50 L63 84 L54 126 L47 94 L40 122 L31 80 L22 128 L14 90 L8 112 L3 70 L5 40Z" fill="#ffffff"/>
     <path d="M12 6 V60 M32 6 V40 M52 6 V70" stroke="#bbbbbb" stroke-width="3" fill="none"/>
     <path d="M2 14 H62" stroke="#d6a93f" stroke-width="6"/>
   </svg>`,
  { size: 128 },
);

type Pos = { forward?: number; up?: number; left?: number };

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "boneDrake", paintSize: 2048 });
  const sideName = (s: number) => (s > 0 ? "L" : "R");
  const mirror = (p: number[], s: number) => [p[0] * s, p[1], p[2]];

  // ---- Skeleton: spine, neck, head, jaw, tail -------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.62, -0.7], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.62, -0.7],
      [0, 1.7, -0.15],
      [0, 1.8, 0.4],
      [0, 1.88, 0.95],
    ]),
    { parent: hips, count: 4, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.88, 0.95],
      [0, 2.12, 1.35],
      [0, 2.5, 1.62],
      [0, 2.85, 1.75],
      [0, 3.0, 1.98],
    ]),
    { parent: spine.joints[3], count: 4, role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[3], at: neck.at(1), dir: [0, -0.1, 1], role: "head" });
  const HS = 1.3; // the skull is oversized, Warcraft style
  const H = (o: Pos) => head.local({ forward: (o.forward ?? 0) * HS, up: (o.up ?? 0) * HS, left: (o.left ?? 0) * HS });
  const jaw = b.joint("jaw", {
    parent: head,
    at: H({ forward: 0.06, up: -0.2 }),
    aim: H({ forward: 0.8, up: -0.2 }),
    role: "jaw",
  });
  const J = (o: Pos) => jaw.local({ forward: (o.forward ?? 0) * HS, up: (o.up ?? 0) * HS, left: (o.left ?? 0) * HS });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.62, -0.7],
      [0, 1.55, -1.4],
      [0, 1.4, -2.2],
      [0, 1.28, -3.0],
      [0, 1.3, -3.7],
      [0, 1.5, -4.2],
    ]),
    { parent: hips, count: 8, role: "tail" },
  );

  // ---- Sinew core: the dark flesh the bones hang on --------------------------------------------------------
  b.sweep(spine, (t) => [0.22 + 0.05 * Math.sin(t * Math.PI), 0.2 + 0.05 * Math.sin(t * Math.PI)], {
    color: sinewPaint,
    shift: [0, -0.24],
    group: "core",
  });
  const neckCore = b.sweep(neck, (t) => 0.17 - 0.04 * t, { color: sinewPaint, group: "core", sides: 8 });
  const tailCore = b.sweep(tail, (t) => 0.13 * (1 - t) + 0.025, { color: sinewPaint, group: "core", sides: 8 });

  // ---- Spine: vertebrae with neural spikes ------------------------------------------------------------------
  const vertebrae = (chain: Chain, count: number, r0: number, r1: number, len: number, spike: number, g: string) => {
    let i = 0;
    b.along(chain, count, (at) => {
      const t = (i + 0.5) / count;
      const r = r0 + (r1 - r0) * t;
      b.part(new THREE.CylinderGeometry(r, r * 1.08, len, 7), bonePaint, { frame: at, flat: true, group: g });
      b.spike(at, [0, 1, -0.5], r * 0.8 + spike * (1 - 0.5 * t) * (0.75 + 0.5 * ((i * 7) % 3) / 2), r * 0.5, {
        color: bonePaint,
        sides: 5,
        group: g,
      });
      i++;
    });
  };
  vertebrae(spine, 9, 0.12, 0.13, 0.17, 0.42, "spine");
  vertebrae(neck, 9, 0.13, 0.105, 0.15, 0.36, "neck");
  vertebrae(tail, 15, 0.115, 0.04, 0.16, 0.3, "tail");
  // Chevron bones hanging under the tail.
  {
    let i = 0;
    b.along(
      tail,
      11,
      (at) => {
        if (i++ % 2 === 0) b.spike(at, [0, -1, 0.3], 0.2 * (1 - i / 14), 0.028, { color: bonePaint, sides: 5, group: "tail" });
      },
      { from: 0.05, to: 0.8 },
    );
  }

  // ---- Ribcage + keel ------------------------------------------------------------------------------------
  const ribT = [0.2, 0.31, 0.42, 0.53, 0.64, 0.75, 0.86, 0.96];
  const ribF = [0.55, 0.75, 0.92, 1, 1, 0.95, 0.85, 0.7];
  const keel: number[][] = [];
  const ribPts: number[][][] = [];
  ribT.forEach((t, i) => {
    const sp = spine.at(t).at;
    const f = ribF[i];
    for (const s of [1, -1]) {
      const pts = [
        [s * 0.07, sp.y - 0.03, sp.z],
        [s * 0.46 * f, sp.y - 0.07, sp.z + 0.02],
        [s * 0.72 * f, sp.y - 0.38 * f, sp.z + 0.05],
        [s * 0.65 * f, sp.y - 0.78 * f, sp.z + 0.1],
        [s * 0.34 * f, sp.y - 1.04 * f, sp.z + 0.15],
        [s * 0.05, sp.y - 1.13 * f, sp.z + 0.17],
      ];
      if (s > 0) ribPts.push(pts);
      b.sweep(catmull(pts), [0.065, 0.025], { color: bonePaint, sides: 6, group: "ribs", name: `rib${i}${sideName(s)}` });
      b.part(new THREE.SphereGeometry(0.075, 6, 5), bonePaint, { at: pts[0], flat: true, group: "ribs" });
    }
    keel.push([0, sp.y - 1.13 * f - 0.02, sp.z + 0.17]);
  });
  b.sweep(catmull([[0, 1.5, -0.3], ...keel.slice(0, 7), [0, 0.92, 1.2], [0, 0.86, 1.42]]), [0.075, 0.075, 0.05], {
    color: bonePaint,
    sides: 6,
    group: "ribs",
    name: "keel",
    caps: "point",
  });
  // furcula (wishbone) under the neck base
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.7, 1.62, 0.62],
        [s * 0.45, 1.25, 0.95],
        [s * 0.12, 0.98, 1.12],
      ]),
      [0.07, 0.05],
      { color: bonePaint, sides: 6, group: "ribs" },
    );
  }
  // Sternum plate: an iron brace with a burning rune
  b.extrude(
    [
      [-0.12, 0.16],
      [0.12, 0.16],
      [0.17, 0],
      [0.12, -0.16],
      [-0.12, -0.16],
      [-0.17, 0],
    ],
    { at: [0, 0.98, 1.2], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.05, bevel: 0.015, color: ironPaint, bone: spine.joints[3], group: "iron", name: "sternumPlate" },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
      bone: spine.joints[3],
      at: [0, 0.98, 1.232],
      dir: [0, 0, 1],
      axis: "z",
      texture: rune,
      group: "iron",
    }),
    1.4,
  );
  // Iron straps binding the ribcage, with gold rivets
  for (const ri of [2, 5]) {
    const r = ribPts[ri];
    const out = (p: number[]) => [p[0] * 1.08, p[1], p[2]];
    const ring = [
      [0, r[0][1] + 0.1, r[0][2]],
      out(r[2]),
      out(r[3]),
      [0, r[5][1] - 0.08, r[5][2] + 0.02],
      out(mirror(r[3], -1)),
      out(mirror(r[2], -1)),
    ];
    b.sweep(catmull(ring, { closed: true }), 0.034, { color: ironPaint, sides: 6, group: "iron", name: `strap${ri}` });
    for (const p of [ring[1], ring[2], ring[4], ring[5]])
      b.part(new THREE.SphereGeometry(0.036, 6, 4), GOLD, { at: [p[0] * 1.02, p[1], p[2]], bone: spine.joints[2], flat: true, group: "iron" });
  }
  // The soul caged in the ribs
  glow(
    b.part(new THREE.IcosahedronGeometry(0.27, 1), GLOW, { bone: spine.joints[2], at: [0, 1.0, 0.38], flat: true, group: "soul" }),
    1.6,
  );
  glow(
    b.part(new THREE.IcosahedronGeometry(0.15, 0), GLOW_CORE, { bone: spine.joints[2], at: [0, 1.0, 0.38], flat: true, group: "soul" }),
    2,
  );
  for (const rot of [
    [0, 0, 0],
    [90, 0, 0],
    [0, 90, 40],
  ]) {
    b.part(new THREE.TorusGeometry(0.34, 0.018, 4, 12), ironPaint, {
      bone: spine.joints[2],
      at: [0, 1.0, 0.38],
      rotation: rot,
      group: "soul",
    });
  }
  glow(
    b.cards(
      [-0.1, 0.1, 0].map((x, k) => frame([x, 1.2, 0.3 + k * 0.08], [0, 1, 0])),
      flame,
      { size: [0.2, 0.42], lean: 0, flow: [0, 0, -1], bend: 18, vary: 0.25, rng: rng(21), cross: true, bone: spine.joints[2] },
    ),
    1.2,
  );

  // ---- Pelvis ------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.55, 0.05],
        [-0.45, 0.4],
        [-0.05, 0.58],
        [0.35, 0.46],
        [0.46, 0.1],
        [0.22, -0.2],
        [-0.1, -0.42],
        [-0.32, -0.25],
      ],
      {
        at: [s * 0.44, 1.5, -0.72],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.07,
        bevel: 0.02,
        smoothing: 1,
        color: bonePaint,
        bone: hips,
        group: "pelvis",
      },
    );
    b.rod([s * 0.44, 1.95, -0.9], [s * 0.08, 1.8, -0.7], 0.07, { color: bonePaint, sides: 6, bone: hips, group: "pelvis" });
    b.spike([s * 0.44, 2.02, -0.75], [s * 0.2, 1, -0.2], 0.3, 0.06, { color: bonePaint, sides: 5, bone: hips, group: "pelvis" });
    b.cards([frame([s * 0.5, 2.0, -0.6], [0, 1, 0])], rag, {
      size: [0.18, 0.55],
      lean: 180,
      flow: [0, 0, 1],
      color: CLOTH,
      bone: hips,
    });
  }

  // ---- Legs: bone limbs with knobs, iron cuffs, toes and claws ---------------------------------------------------
  const iron = (target: Parameters<typeof b.surface>[0], at: PointInput, w: number) => {
    const loop = b.surface(target).loop(at, { lift: 0.012 });
    b.sweep(loop, w, { color: ironPaint, sides: 6, group: "iron" });
    return loop;
  };

  const foot = (
    parent: Joint,
    base: number[],
    s: number,
    prefix: string,
    toeR: number,
    toeL: number,
    spread: number,
    clawL: number,
  ) => {
    const sn = sideName(s);
    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * spread * s;
      const len = toeL * (i === 1 ? 1.15 : 1);
      const p0 = [base[0], base[1], base[2]];
      const p1 = [base[0] + dx * 0.5, toeR * 1.05, base[2] + len * 0.5];
      const p2 = [base[0] + dx, toeR * 0.95, base[2] + len];
      const tip = [base[0] + dx * 1.15, 0.015, base[2] + len + clawL];
      const toe = b.chain(`${prefix}${i}${sn}`, catmull([p0, p1, p2]), {
        parent,
        names: [`${prefix}${i}${sn}1`, `${prefix}${i}${sn}2`],
        role: "digit",
      });
      b.sweep(toe, [toeR, toeR * 0.78], { color: bonePaint, sides: 6, group: `${prefix}${sn}` });
      b.part(new THREE.SphereGeometry(toeR * 1.12, 6, 5), bonePaint, {
        at: p1,
        bone: toe.joints[0],
        flat: true,
        group: `${prefix}${sn}`,
      });
      b.sweep(bezier(p2, [p2[0] + dx * 0.1, toeR * 0.9, p2[2] + clawL * 0.6], tip), [toeR * 0.85, 0], {
        color: CLAW,
        sides: 5,
        bone: toe.joints[1],
        caps: "point",
        group: `${prefix}${sn}`,
      });
    }
    // dewclaw
    b.spike([base[0], base[1] + toeR, base[2] - toeR], [0, 0.15, -1], clawL * 1.3, toeR * 0.7, {
      color: CLAW,
      sides: 5,
      bone: parent,
      group: `${prefix}${sn}`,
    });
  };

  for (const s of [1, -1]) {
    const sn = sideName(s);
    // Front leg
    {
      const root = [s * 0.74, 1.55, 0.62];
      const pts = limb(root, [s * 0.76, 0.1, 0.98], [0.72, 0.76, 0.32], [
        [0, 0, -1],
        [0, 0, 1],
      ]).map((v) => v.toArray());
      const leg = b.chain(`legF${sn}`, catmull(pts), {
        parent: spine.joints[2],
        names: [`shoulder${sn}`, `elbow${sn}`, `wrist${sn}`, `hand${sn}`],
        role: "leg",
      });
      const tube = b.sweep(leg, [0.19, 0.145, 0.125, 0.105, 0.105], { color: bonePaint, sides: 8, group: `legF${sn}` });
      pts.slice(0, 3).forEach((j, k) =>
        b.part(new THREE.SphereGeometry(k === 1 ? 0.18 : 0.15, 7, 5), bonePaint, { at: j, flat: true, group: `legF${sn}` }),
      );
      b.spike(pts[1], [0, 0.35, -1], 0.4, 0.085, { color: bonePaint, sides: 6, group: `legF${sn}` });
      b.spike(pts[2], [s * 0.3, 0.3, -1], 0.24, 0.06, { color: bonePaint, sides: 5, group: `legF${sn}` });
      iron(tube, leg.at(0.55), 0.036);
      iron(tube, leg.at(0.82), 0.03);
      iron(tube, leg.at(0.1), 0.038);
      foot(leg.tip ?? leg.joints[3], pts[3], s, "toeF", 0.085, 0.3, 0.19, 0.22);
      // Shoulder pauldron: bone dome with a crown of spikes
      const sp = pts[0];
      b.lathe(
        [
          [0, 0],
          [0.24, 0],
          [0.29, 0.09],
          [0.24, 0.18],
          [0.12, 0.25],
          [0, 0.27],
        ],
        {
          at: [sp[0] + s * 0.03, sp[1] + 0.06, sp[2]],
          bone: leg.joints[0],
          color: bonePaint,
          segments: 8,
          smoothing: 1,
          group: `legF${sn}`,
        },
      );
      b.sweep(
        catmull(
          Array.from({ length: 8 }, (_, k) => {
            const a = (k / 8) * Math.PI * 2;
            return [sp[0] + s * 0.03 + Math.cos(a) * 0.29, sp[1] + 0.12, sp[2] + Math.sin(a) * 0.29];
          }),
          { closed: true },
        ),
        0.03,
        { color: ironPaint, sides: 6, bone: leg.joints[0], group: `legF${sn}` },
      );
      for (let k = 0; k < 8; k++) {
        const a = ((k + 0.5) / 8) * Math.PI * 2;
        b.part(new THREE.SphereGeometry(0.034, 5, 4), GOLD, {
          at: [sp[0] + s * 0.03 + Math.cos(a) * 0.3, sp[1] + 0.12, sp[2] + Math.sin(a) * 0.3],
          bone: leg.joints[0],
          flat: true,
          group: `legF${sn}`,
        });
      }
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        b.spike(
          [sp[0] + s * 0.03 + Math.cos(a) * 0.17, sp[1] + 0.22, sp[2] + Math.sin(a) * 0.17],
          [Math.cos(a) * 0.6 + s * 0.3, 1, Math.sin(a) * 0.6 - 0.2],
          0.34 + 0.1 * (k % 2),
          0.055,
          { color: bonePaint, sides: 5, bone: leg.joints[0], group: `legF${sn}` },
        );
      }
      // scapula blade lying on the ribs
      b.extrude(
        [
          [0, 0],
          [0.32, 0.12],
          [0.52, 0.5],
          [0.1, 0.62],
          [-0.3, 0.4],
          [-0.35, 0.05],
        ],
        {
          at: [s * 0.52, 1.62, 0.5],
          x: [0, 0, 1],
          y: [0, 1, 0],
          thickness: 0.05,
          bevel: 0.015,
          smoothing: 1,
          color: bonePaint,
          bone: spine.joints[2],
          group: `legF${sn}`,
        },
      );
    }
    // Hind leg
    {
      const root = [s * 0.76, 1.45, -0.75];
      const pts = limb(root, [s * 0.78, 0.2, -0.85], [0.82, 0.82, 0.62], [
        [0, 0, 1],
        [0, 0, -1],
      ]).map((v) => v.toArray());
      const leg = b.chain(`legH${sn}`, catmull(pts), {
        parent: hips,
        names: [`hip${sn}`, `knee${sn}`, `hock${sn}`, `ankle${sn}`],
        role: "leg",
      });
      const tube = b.sweep(leg, [0.22, 0.17, 0.13, 0.105, 0.105], { color: bonePaint, sides: 8, group: `legH${sn}` });
      pts.slice(0, 3).forEach((j, k) =>
        b.part(new THREE.SphereGeometry([0.23, 0.19, 0.15][k], 7, 5), bonePaint, { at: j, flat: true, group: `legH${sn}` }),
      );
      b.spike(pts[1], [0, 0.2, 1], 0.34, 0.085, { color: bonePaint, sides: 6, group: `legH${sn}` });
      b.spike(pts[2], [0, 0.3, -1], 0.4, 0.08, { color: bonePaint, sides: 6, group: `legH${sn}` });
      iron(tube, leg.at(0.5), 0.038);
      iron(tube, leg.at(0.8), 0.032);
      b.sweep(
        catmull([
          [pts[0][0], pts[0][1] - 0.05, pts[0][2] - 0.2],
          [pts[1][0], (pts[1][1] + pts[2][1]) / 2 + 0.1, (pts[1][2] + pts[2][2]) / 2 - 0.2],
          [pts[2][0], pts[2][1] + 0.05, pts[2][2] - 0.16],
        ]),
        [0.04, 0.025],
        { color: sinewPaint, sides: 5, bone: leg.joints[1], group: `legH${sn}` },
      );
      foot(leg.tip ?? leg.joints[3], pts[3], s, "toeH", 0.095, 0.36, 0.21, 0.24);
    }
  }

  // ---- Neck collar of rusted iron, runes and hanging rags ------------------------------------------------------
  const neckSurf = b.surface(neckCore);
  const collar = neckSurf.loop(neck.at(0.2), { lift: 0.012 });
  b.sweep(collar, 0.05, { color: ironPaint, sides: 6, group: "iron" });
  b.sweep(neckSurf.loop(neck.at(0.62), { lift: 0.012 }), 0.04, { color: ironPaint, sides: 6, group: "iron" });
  b.along(collar, 12, (at) =>
    b.part(new THREE.SphereGeometry(0.032, 5, 4), GOLD, { frame: at, at: at.local([0, 0.055, 0]), flat: true, group: "iron" }),
  );
  {
    const frames = [120, 138, 222, 240].map((deg) => frame(neckCore.at(0.2, deg, 0.04).at, [0, 1, 0]));
    b.cards(frames, rag, {
      size: [0.16, 0.5],
      lean: 180,
      flow: [0, 0, 1],
      vary: 0.25,
      rng: rng(5),
      color: CLOTH,
      bone: neck.joints[0],
    });
  }
  glow(
    b.decal(neckCore, rune, {
      at: neckCore.at(0.42, 0).at,
      dir: [0, 0.3, 1],
      size: [0.12, 0.12],
      group: "iron",
    }),
    1.3,
  );

  // ---- Skull -----------------------------------------------------------------------------------------------------
  const hp = (
    geo: THREE.BufferGeometry,
    color: Parameters<typeof b.part>[1],
    where: Pos,
    scale: [number, number, number],
    owner: Joint = head,
    group = "head",
  ) =>
    b.part(geo, color, {
      frame: owner,
      at: (owner === head ? H : J)(where),
      bone: owner,
      scale: [scale[0] * HS, scale[1] * HS, scale[2] * HS],
      flat: true,
      group,
    });

  const cranium = hp(new THREE.SphereGeometry(1, 9, 7), bonePaint, { forward: 0.14, up: 0.02 }, [0.31, 0.4, 0.29]);
  const snout = b.loft(
    [
      { at: H({ forward: 0.26, up: 0.0 }), w: 0.5 * HS, h: 0.4 * HS },
      { at: H({ forward: 0.58, up: -0.04 }), w: 0.42 * HS, h: 0.3 * HS },
      { at: H({ forward: 0.98, up: -0.07 }), w: 0.3 * HS, h: 0.22 * HS },
    ],
    { bone: head, color: bonePaint, sides: 8, group: "head", caps: "round" },
  );
  hp(new THREE.SphereGeometry(1, 6, 4), bonePaint, { forward: 1.04, up: -0.05 }, [0.16, 0.1, 0.1]);
  // iron muzzle brace
  const brace = b.surface(snout).loop(H({ forward: 0.72, up: -0.05 }), { dir: [0, 0.05, 1], lift: 0.012 });
  b.sweep(brace, 0.03, { color: ironPaint, sides: 6, bone: head, group: "iron" });
  b.along(brace, 6, (at) => b.part(new THREE.SphereGeometry(0.028, 5, 4), GOLD, { frame: at, at: at.local([0, 0.04, 0]), bone: head, flat: true, group: "iron" }));

  for (const s of [1, -1]) {
    hp(new THREE.SphereGeometry(1, 5, 4), VOID, { forward: 1.0, up: -0.04, left: s * 0.1 }, [0.04, 0.07, 0.05]);
    // brow ridge
    b.sweep(
      catmull([
        H({ forward: 0.16, up: 0.2, left: s * 0.28 }),
        H({ forward: 0.4, up: 0.22, left: s * 0.27 }),
        H({ forward: 0.62, up: 0.14, left: s * 0.19 }),
      ]),
      [0.09, 0.05],
      { color: bonePaint, sides: 6, bone: head, group: "head" },
    );
    // brow horn
    b.sweep(
      bezier(
        H({ forward: 0.42, up: 0.25, left: s * 0.26 }),
        H({ forward: 0.55, up: 0.5, left: s * 0.3 }),
        H({ forward: 0.4, up: 0.78, left: s * 0.4 }),
      ),
      [0.065, 0],
      { color: darkBonePaint, sides: 5, bone: head, caps: "point", group: "head" },
    );
    // eye socket + burning eye
    hp(new THREE.SphereGeometry(1, 7, 5), VOID, { forward: 0.36, up: 0.1, left: s * 0.25 }, [0.12, 0.15, 0.115]);
    glow(hp(new THREE.IcosahedronGeometry(0.09, 1), GLOW, { forward: 0.4, up: 0.1, left: s * 0.32 }, [1, 1, 1]), 2.4);
    hp(new THREE.SphereGeometry(1, 5, 4), VOID, { forward: 0.43, up: 0.1, left: s * 0.402 }, [0.014, 0.036, 0.085]);
    // iron cheek guard with gold rivets
    b.extrude(
      [
        [-0.22, 0.14],
        [0.18, 0.2],
        [0.34, 0.02],
        [0.2, -0.2],
        [-0.16, -0.18],
      ],
      {
        at: H({ forward: -0.02, up: -0.06, left: s * 0.315 }),
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.01,
        color: ironPaint,
        bone: head,
        group: "head",
        name: `cheekGuard${sideName(s)}`,
      },
    );
    for (const [df, du] of [
      [0.06, 0.1],
      [0.16, 0.0],
      [0.02, -0.1],
    ])
      b.part(new THREE.SphereGeometry(0.03, 5, 4), GOLD, {
        bone: head,
        at: H({ forward: df, up: -0.06 + du, left: s * 0.355 }),
        flat: true,
        group: "head",
      });
    glow(
      b.cards([frame(H({ forward: 0.34, up: 0.14, left: s * 0.33 }), [s * 0.4, 0.9, -0.2])], flame, {
        size: [0.12, 0.3],
        lean: 35,
        flow: [0, 0, -1],
        bend: 25,
        bone: head,
      }),
      1.2,
    );
    // cheek horn
    b.sweep(
      bezier(
        H({ forward: 0.02, up: -0.1, left: s * 0.3 }),
        H({ forward: -0.25, up: -0.1, left: s * 0.55 }),
        H({ forward: -0.5, up: -0.02, left: s * 0.62 }),
      ),
      [0.085, 0],
      { color: bonePaint, sides: 6, bone: head, caps: "point", group: "head" },
    );
    // main horns
    const horn = b.sweep(
      bezier(
        H({ forward: -0.08, up: 0.16, left: s * 0.2 }),
        H({ forward: -0.5, up: 0.35, left: s * 0.55 }),
        H({ forward: -1.05, up: 0.3, left: s * 0.55 }),
        H({ forward: -1.3, up: 0.72, left: s * 0.42 }),
      ),
      [0.13, 0.03],
      { color: bonePaint, sides: 7, bone: head, caps: "point", group: "head", name: `horn${sideName(s)}` },
    );
    iron(horn, horn.at(0.16), 0.036);
    b.part(new THREE.TorusGeometry(0.1, 0.024, 5, 8).rotateX(Math.PI / 2), GOLD, { frame: horn.at(0.5), bone: head, flat: true, group: "head" });
    b.along(horn, 4, (at) => b.spike(at, at, 0.1, 0.03, { color: darkBonePaint, sides: 4, group: "head" }), {
      from: 0.3,
      to: 0.8,
    });
    // frill plates behind the horns
    const frillOutline: Array<[number, number] | [number, number, "sharp"]> = [
      [0, 0.0],
      [0.1, 0.3],
      [0.5, 0.52, "sharp"],
      [0.42, 0.12],
      [0.8, 0.02, "sharp"],
      [0.5, -0.14],
      [0.64, -0.42, "sharp"],
      [0.26, -0.3],
      [0.05, -0.2],
    ];
    const frillAt = H({ forward: -0.05, up: 0.02, left: s * 0.26 });
    b.extrude(frillOutline, {
      at: frillAt,
      x: [s * 0.35, 0.02, -1],
      y: [0, 1, 0],
      thickness: 0.02,
      bevel: 0.006,
      color: wingPaint,
      bone: head,
      group: "head",
      name: `frill${sideName(s)}`,
    });
    for (const [dx, dy] of [
      [0.5, 0.52],
      [0.8, 0.02],
      [0.64, -0.42],
    ] as const)
      b.rod(frillAt, [frillAt.x + s * dx * 0.33, frillAt.y + dy, frillAt.z - dx * 0.94], [0.03, 0.012], {
        color: bonePaint,
        sides: 5,
        bone: head,
        group: "head",
      });
  }
  // nasal horn, crest ridge down the skull
  b.sweep(bezier(H({ forward: 0.8, up: 0.05 }), H({ forward: 0.95, up: 0.25 }), H({ forward: 0.86, up: 0.42 })), [0.075, 0], {
    color: bonePaint,
    sides: 6,
    bone: head,
    caps: "point",
    group: "head",
  });
  for (let k = 0; k < 4; k++)
    b.spike(H({ forward: k * 0.1, up: 0.26 - k * 0.012 }), [0, 1, -0.5], 0.22 - k * 0.035, 0.05, {
      color: bonePaint,
      sides: 5,
      bone: head,
      group: "head",
    });
  // glowing rune on the forehead
  glow(
    b.decal(cranium, rune, {
      at: H({ forward: 0.2, up: 0.3 }),
      dir: [0, 1, 0.25],
      up: [0, 0, 1],
      size: [0.2, 0.2],
      bone: head,
      group: "head",
    }),
    1.4,
  );

  // Upper teeth
  const teethUp = new THREE.ConeGeometry(0.04, 0.15, 5);
  const fang = new THREE.ConeGeometry(0.06, 0.36, 6);
  for (const s of [1, -1]) {
    for (let k = 0; k < 6; k++) {
      const big = k === 4;
      b.part(big ? fang : teethUp, TOOTH, {
        bone: head,
        at: H({ forward: 0.3 + k * 0.13, up: -0.18 - (big ? 0.1 : 0.02), left: s * (0.25 - k * 0.024) }),
        dir: [0, -1, 0],
        flat: true,
        group: "teeth",
      });
    }
  }
  // Lower jaw: loft, teeth, chin spike, throat glow
  b.loft(
    [
      { at: J({ forward: 0.1, up: -0.03 }), w: 0.46 * HS, h: 0.16 * HS },
      { at: J({ forward: 0.45, up: -0.03 }), w: 0.34 * HS, h: 0.13 * HS },
      { at: J({ forward: 0.85, up: 0.0 }), w: 0.22 * HS, h: 0.11 * HS },
    ],
    { bone: jaw, color: bonePaint, sides: 8, group: "jaw", caps: "round" },
  );
  for (const s of [1, -1]) {
    for (let k = 0; k < 5; k++) {
      b.part(k === 4 ? new THREE.ConeGeometry(0.055, 0.3, 5) : new THREE.ConeGeometry(0.035, 0.13, 5), TOOTH, {
        bone: jaw,
        at: J({ forward: 0.28 + k * 0.13, up: 0.04 + (k === 4 ? 0.07 : 0.0), left: s * (0.2 - k * 0.022) }),
        dir: [0, 1, 0],
        flat: true,
        group: "teeth",
      });
    }
    b.sweep(
      bezier(J({ forward: 0.02, up: -0.02, left: s * 0.24 }), J({ forward: -0.15, up: -0.08, left: s * 0.32 }), J({ forward: -0.28, up: -0.2, left: s * 0.3 })),
      [0.065, 0],
      { color: bonePaint, sides: 5, bone: jaw, caps: "point", group: "jaw" },
    );
  }
  b.sweep(bezier(J({ forward: 0.85, up: -0.04 }), J({ forward: 0.98, up: -0.12 }), J({ forward: 0.92, up: -0.3 })), [0.075, 0], {
    color: bonePaint,
    sides: 5,
    bone: jaw,
    caps: "point",
    group: "jaw",
  });
  hp(new THREE.SphereGeometry(1, 6, 4), VOID, { forward: 0.45, up: -0.17 }, [0.24, 0.5, 0.05]);
  glow(hp(new THREE.IcosahedronGeometry(0.07, 0), GLOW_DK, { forward: 0.2, up: -0.15 }, [1, 1, 1]), 1.2);
  b.pose(jaw, { axis: [1, 0, 0], deg: 14 });

  // ---- Wings ---------------------------------------------------------------------------------------------------
  const shoulderP = [0.5, 2.05, 0.55];
  const elbowP = [1.35, 2.95, 0.05];
  const wristP = [2.3, 3.3, 0.5];
  const tipsRaw = [
    [3.95, 3.1, 0.75],
    [3.8, 2.85, -0.5],
    [3.2, 2.6, -1.5],
    [2.45, 2.4, -2.3],
  ];
  const flankP = [0.45, 1.95, -1.0];

  for (const s of [1, -1]) {
    const sn = sideName(s);
    const arm = b.chain(`wingArm${sn}`, catmull([mirror(shoulderP, s), mirror(elbowP, s), mirror(wristP, s)]), {
      parent: spine.joints[2],
      names: [`wingRoot${sn}`, `wingElbow${sn}`, `wingWrist${sn}`],
      role: "wing",
    });
    b.sweep(arm, [0.17, 0.13, 0.1], { color: bonePaint, sides: 7, group: `wing${sn}` });
    for (const [pt, r] of [
      [mirror(shoulderP, s), 0.22],
      [mirror(elbowP, s), 0.18],
      [mirror(wristP, s), 0.14],
    ] as Array<[number[], number]>)
      b.part(new THREE.SphereGeometry(r, 7, 5), bonePaint, { at: pt, flat: true, group: `wing${sn}` });
    b.spike(mirror(elbowP, s), [s * 0.1, 0.4, -1], 0.5, 0.09, { color: bonePaint, sides: 6, group: `wing${sn}` });
    b.spike(mirror([1.9, 3.15, 0.3], s), [0, 1, -0.2], 0.26, 0.055, { color: bonePaint, sides: 5, group: `wing${sn}`, bone: arm.joints[1] });
    b.spike(mirror([0.9, 2.5, 0.35], s), [0, 1, -0.3], 0.3, 0.06, { color: bonePaint, sides: 5, group: `wing${sn}`, bone: arm.joints[0] });
    // iron bands on the arm bones
    for (const t of [0.22, 0.7]) {
      const c = arm.at(t);
      b.part(new THREE.TorusGeometry(0.17 - 0.06 * t, 0.028, 5, 10).rotateX(Math.PI / 2), ironPaint, { frame: c, group: `wing${sn}`, flat: true });
    }
    const wingTip = arm.tip ?? arm.joints[2];
    // thumb claw
    const thumb = b.chain(
      `thumb${sn}`,
      catmull([mirror(wristP, s), mirror([2.35, 3.5, 0.8], s), mirror([2.32, 3.62, 1.25], s)]),
      { parent: wingTip, names: [`thumb1${sn}`, `thumb2${sn}`], role: "digit" },
    );
    b.sweep(thumb, [0.08, 0.02], { color: darkBonePaint, sides: 6, caps: "point", group: `wing${sn}` });

    const inner: Chain[] = [];
    const tipJ: Joint[] = [];
    const Ks: number[][] = [];
    const Ts: number[][] = [];
    tipsRaw.forEach((traw, i) => {
      const W = mirror(wristP, s);
      const T = mirror(traw, s);
      const K = [W[0] + (T[0] - W[0]) * 0.6, W[1] + (T[1] - W[1]) * 0.6 + 0.06, W[2] + (T[2] - W[2]) * 0.6 + 0.08];
      const M = [W[0] + (K[0] - W[0]) * 0.5, W[1] + (K[1] - W[1]) * 0.5 + 0.05, W[2] + (K[2] - W[2]) * 0.5 + 0.05];
      const Tm = [K[0] + (T[0] - K[0]) * 0.55, K[1] + (T[1] - K[1]) * 0.55 + 0.03, K[2] + (T[2] - K[2]) * 0.55 + 0.04];
      const fin = b.chain(`finger${i + 1}${sn}`, catmull([W, M, K]), {
        parent: wingTip,
        names: [`f${i + 1}a${sn}`, `f${i + 1}b${sn}`],
        role: "digit",
      });
      b.sweep(fin, [0.09 - i * 0.008, 0.06 - i * 0.005], { color: bonePaint, sides: 6, group: `wing${sn}` });
      const outer = b.chain(`fingerTip${i + 1}${sn}`, catmull([K, Tm, T]), {
        parent: fin.joints[1],
        names: [`f${i + 1}c${sn}`, `f${i + 1}d${sn}`],
        role: "digit",
      });
      b.sweep(outer, [0.058 - i * 0.005, 0.014], { color: bonePaint, sides: 6, caps: "point", group: `wing${sn}` });
      b.part(new THREE.SphereGeometry(0.09 - i * 0.008, 6, 5), bonePaint, { at: K, flat: true, bone: fin.joints[1], group: `wing${sn}` });
      b.part(new THREE.SphereGeometry(0.066, 6, 4), bonePaint, { at: M, flat: true, bone: fin.joints[0], group: `wing${sn}` });
      b.spike(T, [T[0] - Tm[0], T[1] - Tm[1] - 0.05, T[2] - Tm[2]], 0.22, 0.026, {
        color: CLAW,
        sides: 4,
        bone: outer.joints[1],
        group: `wing${sn}`,
      });
      glow(
        b.cards([frame(T, [s * 0.2, 1, -0.2])], flame, { size: [0.1, 0.3], lean: 20, flow: [0, 0, -1], bend: 20, bone: outer.joints[1] }),
        1.2,
      );
      inner.push(fin);
      tipJ.push(outer.joints[0]);
      Ks.push(K);
      Ts.push(T);
    });

    // Membrane panels between fingers: a skinned inner panel and ragged tongues out to the finger tips.
    const tongue = (iA: number, iB: number, depths: Array<[number, number]>, cuts: number[]) => {
      const KA = Ks[iA];
      const KB = iB < 0 ? mirror(flankP, s) : Ks[iB];
      const TA = Ts[iA];
      const TB = iB < 0 ? mirror(flankP, s) : Ts[iB];
      for (let k = 0; k < cuts.length - 1; k++) {
        const c0 = cuts[k];
        const c1 = cuts[k + 1];
        const pt = (c: number, d: number) => lerp(KA, KB, c).lerp(lerp(TA, TB, c), d);
        const owner = (c0 + c1) / 2 < 0.5 || iB < 0 ? tipJ[iA] : tipJ[iB];
        b.membrane([lerp(KA, KB, c0), pt(c0, depths[k][0])], [lerp(KA, KB, c1), pt(c1, depths[k][1])], {
          color: wingPaint,
          thickness: 0.012,
          rows: 2,
          cols: 4,
          scallop: 0.08,
          bone: owner,
          group: `wing${sn}`,
          name: `tongue${iA}${k}${sn}`,
        });
      }
    };
    for (let i = 0; i < 3; i++)
      b.membrane(inner[i], inner[i + 1], { color: wingPaint, thickness: 0.012, rows: 3, cols: 7, group: `wing${sn}`, name: `panel${i + 1}${sn}` });
    b.membrane(inner[3], polyline([mirror(elbowP, s), mirror([0.9, 2.45, -0.45], s), mirror(flankP, s)]), {
      color: wingPaint,
      thickness: 0.012,
      rows: 4,
      bone: arm,
      group: `wing${sn}`,
      name: `panel4${sn}`,
    });
    b.membrane(polyline([mirror(shoulderP, s), mirror(elbowP, s)]), polyline([mirror(shoulderP, s), mirror(flankP, s)]), {
      color: wingPaint,
      thickness: 0.012,
      rows: 3,
      bone: arm,
      group: `wing${sn}`,
      name: `panelRoot${sn}`,
    });
    // leading membrane between the arm and the neck base
    b.membrane(polyline([mirror(shoulderP, s), mirror(elbowP, s), mirror(wristP, s)]), polyline([mirror([0.25, 2.05, 1.0], s), mirror([1.3, 2.85, 0.9], s), mirror(wristP, s)]), {
      color: leadPaint,
      thickness: 0.012,
      rows: 3,
      bone: arm,
      group: `wing${sn}`,
      name: `lead${sn}`,
    });
    tongue(0, 1, [[1, 0.6], [0.75, 0.35], [0.9, 1]], [0, 0.34, 0.68, 1]);
    tongue(1, 2, [[1, 0.55], [0.8, 0.3], [0.95, 1]], [0, 0.33, 0.66, 1]);
    tongue(2, 3, [[1, 0.5], [0.7, 0.4], [0.85, 1]], [0, 0.35, 0.7, 1]);
    tongue(3, -1, [[1, 0.7], [0.6, 0.35], [0.5, 0.9]], [0, 0.3, 0.62, 0.92]);
  }

  // ---- Tail: iron bands, spade blade ---------------------------------------------------------------------------
  iron(tailCore, tail.at(0.3), 0.04);
  iron(tailCore, tail.at(0.62), 0.032);
  {
    const end = tail.at(1);
    const tan = end.axis;
    b.extrude(
      [
        [0, 0],
        [0.1, 0.14],
        [0.35, 0.2],
        [0.7, 0.03, "sharp"],
        [0.35, -0.2],
        [0.1, -0.14],
      ],
      { at: end.at, x: [tan.x, 0, tan.z], y: [0, 1, 0], thickness: 0.05, bevel: 0.016, color: bonePaint, bone: tail.joints[7], group: "tail", name: "tailBlade" },
    );
    for (const s of [1, -1])
      b.spike(end.at, [s * 0.9, 0.3, 0.3], 0.34, 0.05, { color: bonePaint, sides: 5, bone: tail.joints[7], group: "tail" });
  }

  return b.root;
}
