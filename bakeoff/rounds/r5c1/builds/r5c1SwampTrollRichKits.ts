import * as THREE from "three";
import {
  bezier,
  catmull,
  countershade,
  createBuilder,
  frame,
  limb,
  mottle,
  offset,
  rng,
  stripes,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "Hunched, long-armed swamp troll in a Warcraft style: teal mottled hide, upswept tusks with gold rings, crimson mohawk of curved blades, glowing eyes, and bone fetishes (tooth necklace, skull buckle, bone-and-feather belt charms, shoulder spikes, bangles).",
};

type V = [number, number, number];

// ---- palette -------------------------------------------------------------------------------------------------
const SKIN = countershade(
  mottle("#2f7d86", "#3f9792", { size: 0.2, seed: 3 }),
  mottle("#86b79b", "#9cc9a8", { size: 0.22, seed: 5 }),
  { level: -0.3 },
);
const BONE = "#e8dcbc";
const BONE_P = mottle("#e8dcbc", "#c9b98f", { size: 0.05, seed: 9 });
const TUSK = "#f1e6c6";
const TUSK_BASE = "#b9a577";
const LEATHER_D = "#3f2a18";
const LEATHER_P = mottle("#6a4528", "#82593a", { size: 0.1, seed: 8 });
const FLAP = stripes("#6a4528", "#8c1e30", { size: 0.07, axis: "x" });
const GOLD = "#dcab3c";
const RED = "#d92b3f";
const HOT = "#ff6a3d";
const TIP = "#ffd45a";
const EYE = "#ffe03a";
const DARK = "#17121a";
const CLAW = "#3a3228";
const MOSS_A = "#5d8a3a";
const MOSS_B = "#7aa543";
const MOSS_C = "#486b2c";

const sph = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---- textures ------------------------------------------------------------------------------------------------
const FEATHER = svg(
  `<svg viewBox="0 0 32 96" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 94 C-2 70 0 30 16 2 C32 30 34 70 16 94Z" fill="#ffffff"/>
    <path d="M16 94 L16 8" stroke="#8a8a8a" stroke-width="2.6" fill="none"/>
    <path d="M16 64 L5 50 M16 52 L27 38 M16 40 L7 28 M16 28 L25 18" stroke="#b4b4b4" stroke-width="2.2" fill="none"/>
  </svg>`,
  { size: 192 },
);

const CHEST_PAINT = svg(
  `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#efe8cc" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M50 10 L50 72"/>
      <path d="M30 22 L50 36 L70 22"/>
      <path d="M22 40 L50 58 L78 40"/>
    </g>
    <g fill="none" stroke="#e23b4a" stroke-width="5" stroke-linecap="round">
      <path d="M8 34 Q14 16 32 12"/>
      <path d="M92 34 Q86 16 68 12"/>
    </g>
    <circle cx="50" cy="8" r="5.5" fill="#e23b4a"/>
    <circle cx="50" cy="76" r="4" fill="#efe8cc"/>
  </svg>`,
  { size: 256 },
);

const FACE_PAINT = svg(
  `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <g stroke-linecap="round" fill="none" stroke-width="7">
      <path d="M8 12 L52 22" stroke="#efe8cc"/>
      <path d="M8 29 L52 39" stroke="#efe8cc"/>
      <path d="M8 46 L52 54" stroke="#e23b4a"/>
    </g>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "swampTroll" });
  const rand = rng(11);

  // =============================================================================================================
  // Skeleton
  // =============================================================================================================
  const hips = b.joint("hips", { at: [0, 1.12, -0.02], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.22, 0.0],
      [0, 1.42, 0.05],
      [0, 1.65, 0.14],
      [0, 1.9, 0.3],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const spineTop = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.9, 0.3],
      [0, 1.99, 0.47],
      [0, 2.02, 0.64],
    ]),
    { parent: spineTop, names: ["neck1", "neck2"], role: "neck" },
  );
  const HP: V = [0, 2.02, 0.64];
  const H = (x: number, y: number, z: number): V => [HP[0] + x, HP[1] + y, HP[2] + z];
  const head = b.joint("head", { parent: neck.joints[1], at: HP, dir: [0, -0.08, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: H(0, -0.02, 0.04), aim: H(0, -0.1, 0.3), role: "jaw" });

  // =============================================================================================================
  // Torso
  // =============================================================================================================
  const torso = b.loft(
    [
      { at: [0, 1.05, -0.03], w: 0.6, h: 0.44 },
      { at: [0, 1.27, 0.03], w: 0.5, h: 0.46 },
      { at: [0, 1.55, 0.1], w: 0.8, h: 0.56 },
      { at: [0, 1.85, 0.2], w: 1.0, h: 0.62 },
      { at: [0, 2.0, 0.32], w: 0.6, h: 0.46 },
    ],
    { bone: spine, color: SKIN },
  );
  const hump = b.part(sph(10, 7), SKIN, { bone: spineTop, at: [0, 1.97, 0.1], scale: [0.34, 0.26, 0.26] });
  const pecs = [1, -1].map((s) =>
    b.part(sph(9, 6), SKIN, { bone: spineTop, at: [s * 0.2, 1.7, 0.4], scale: [0.2, 0.16, 0.14] }),
  );
  const torsoSurf = b.surface(torso);
  const bodySurf = b.surface([torso, ...pecs]);

  const neckSw = b.sweep(neck, [0.19, 0.16, 0.15], { color: SKIN });
  const neckSurf = b.surface(neckSw);

  // =============================================================================================================
  // Head
  // =============================================================================================================
  const skullC = H(0, 0.1, 0);
  const skull = b.part(sph(10, 7), SKIN, { bone: head, at: skullC, scale: [0.17, 0.16, 0.19] });
  const cheeks = [1, -1].map((s) =>
    b.part(sph(8, 6), SKIN, { bone: head, at: H(s * 0.12, 0.0, 0.1), scale: [0.06, 0.07, 0.09] }),
  );
  b.part(sph(9, 6), SKIN, { bone: head, at: H(0, 0.02, 0.2), scale: [0.1, 0.07, 0.12] });
  b.part(new THREE.BoxGeometry(0.16, 0.03, 0.2), DARK, { bone: head, at: H(0, -0.045, 0.16) });

  // nose
  b.sweep(catmull([H(0, 0.15, 0.17), H(0, 0.13, 0.3), H(0, 0.07, 0.38), H(0, 0.0, 0.365)]), [0.04, 0.042, 0.045, 0.03], {
    color: SKIN,
    bone: head,
  });
  for (const s of [1, -1]) {
    b.part(sph(5, 4), DARK, { bone: head, at: H(s * 0.028, -0.018, 0.36), scale: [0.012, 0.01, 0.014] });
    b.part(sph(6, 4), SKIN, { bone: head, at: H(s * 0.05, 0.1, 0.3), scale: [0.016, 0.016, 0.016], flat: true });
  }

  // lower jaw
  b.frustumBox(H(0, -0.07, 0.06), H(0, -0.1, 0.33), [0.22, 0.1], [0.2, 0.11], { bone: jaw, color: SKIN });
  b.part(sph(8, 6), SKIN, { bone: jaw, at: H(0, -0.11, 0.34), scale: [0.1, 0.06, 0.07] });
  for (const s of [1, -1]) {
    for (const z of [0.14, 0.22, 0.29]) {
      b.spike(H(s * 0.075, -0.05, z), [0, 1, 0], 0.04, 0.011, { color: TUSK, bone: jaw, sides: 5 });
    }
  }

  // tusks with gold rings
  for (const s of [1, -1]) {
    const bz = bezier(H(s * 0.085, -0.1, 0.3), H(s * 0.16, -0.02, 0.37), H(s * 0.13, 0.15, 0.31));
    b.sweep(bz, [0.042, 0], {
      color: TUSK,
      bands: [
        [0.15, TUSK_BASE],
        [1, TUSK],
      ],
      bone: jaw,
      caps: { start: "flat", end: "point" },
      sides: 7,
    });
    b.part(new THREE.TorusGeometry(0.027, 0.008, 5, 10), GOLD, {
      bone: jaw,
      at: bz.at(0.42),
      dir: bz.tangentAt(0.42),
      axis: "z",
      flat: true,
    });
  }

  // brows, eyes
  for (const s of [1, -1]) {
    b.capsule(H(s * 0.025, 0.175, 0.2), H(s * 0.16, 0.225, 0.11), 0.03, { color: SKIN, bone: head });
    glow(b.part(sph(8, 6), EYE, { bone: head, at: H(s * 0.085, 0.115, 0.165), scale: [0.03, 0.03, 0.03] }), 1.4);
    b.part(sph(5, 4), DARK, { bone: head, at: H(s * 0.085, 0.115, 0.192), scale: [0.007, 0.02, 0.006] });
  }

  // ears + earrings
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, -0.04],
        [0.1, -0.06],
        [0.26, 0.0],
        [0.4, 0.14, "sharp"],
        [0.18, 0.07],
        [0, 0.06],
      ],
      { at: H(s * 0.15, 0.12, -0.02), x: [s * 0.85, 0.2, -0.5], thickness: 0.02, bevel: 0.004, color: SKIN, bone: head },
    );
    b.part(new THREE.TorusGeometry(0.035, 0.008, 5, 10), GOLD, {
      bone: head,
      at: H(s * 0.24, 0.0, -0.1),
      dir: [s, 0.2, 0],
      axis: "z",
      flat: true,
    });
    b.part(new THREE.TorusGeometry(0.03, 0.007, 5, 10), BONE, {
      bone: head,
      at: H(s * 0.28, -0.07, -0.13),
      dir: [s, 0.2, 0],
      axis: "z",
      flat: true,
    });
  }

  // face paint
  {
    const faceSurf = b.surface([skull, ...cheeks]);
    for (const s of [1, -1]) {
      const hit = faceSurf.around(skullC).at(s * 52, -14);
      if (hit)
        b.decal(faceSurf, FACE_PAINT, { at: hit, dir: [s * 0.8, 0, 0.6], size: [0.12, 0.12], mirror: s < 0 });
    }
  }

  // =============================================================================================================
  // Mohawk
  // =============================================================================================================
  const M: V[] = [
    H(0, 0.23, 0.12),
    H(0, 0.25, 0.0),
    H(0, 0.2, -0.13),
    [0, 2.2, 0.36],
    [0, 2.22, 0.2],
    [0, 2.16, 0.02],
  ];
  b.sweep(catmull([M[0], M[1], M[2]]), 0.035, { color: "#8c1428", bone: head });
  b.sweep(catmull([M[2], M[3], M[4], M[5]]), 0.04, { color: "#8c1428", bone: spineTop });
  let k = 0;
  const blade = (p: THREE.Vector3, bone: typeof head) => {
    const L = 0.12 + 0.2 * Math.sin((Math.PI * (k + 0.8)) / 16);
    const d = v3(0, 1, 0.35 - 0.065 * k).normalize();
    const base = p.clone().addScaledVector(d, -0.02);
    const midp = p.clone().addScaledVector(d, L * 0.5);
    const tip = p.clone().addScaledVector(d, L).add(v3(0, 0, -L * 0.2));
    const col = k % 2 ? RED : HOT;
    b.sweep(
      bezier(base, midp, tip),
      (t: number): [number, number] => [0.012 * (1 - t) + 0.003, 0.04 * (1 - t) + 0.004],
      {
        color: col,
        bands: [
          [0.7, col],
          [1, TIP],
        ],
        bone,
        caps: { start: "flat", end: "point" },
      },
    );
    k++;
  };
  b.along(catmull([M[0], M[1], M[2]]), 7, (at) => blade(at.at, head));
  b.along(catmull([M[2], M[3], M[4], M[5]]), 8, (at) => blade(at.at, spineTop));

  // =============================================================================================================
  // Helpers for bone fetishes
  // =============================================================================================================
  const skullFetish = (c: V, r: number, bone: typeof hips) => {
    const P = (x: number, y: number, z: number): V => [c[0] + x * r, c[1] + y * r, c[2] + z * r];
    b.part(sph(8, 6), BONE_P, { bone, at: P(0, 0, 0), scale: [r, r * 0.95, r * 1.05], flat: true });
    b.part(new THREE.BoxGeometry(1, 1, 1), BONE_P, { bone, at: P(0, -0.8, 0.25), scale: [r * 0.75, r * 0.35, r * 0.7] });
    for (const s of [1, -1])
      b.part(sph(5, 4), DARK, { bone, at: P(s * 0.4, 0.0, 0.88), scale: [r * 0.26, r * 0.28, r * 0.2], flat: true });
    b.part(sph(4, 3), DARK, { bone, at: P(0, -0.32, 0.98), scale: [r * 0.12, r * 0.2, r * 0.1], flat: true });
    b.part(new THREE.BoxGeometry(1, 1, 1), DARK, { bone, at: P(0, -0.72, 0.62), scale: [r * 0.55, r * 0.07, r * 0.1] });
  };

  const fetish = (P: THREE.Vector3, i: number) => {
    const down = (d: number) => P.clone().add(v3(0, -d, 0));
    b.rod(P, down(0.08), 0.007, LEATHER_D, { bone: hips });
    const kind = i % 3;
    if (kind === 0) {
      const bA = down(0.08);
      const bB = down(0.3);
      b.rod(bA, bB, 0.018, BONE_P, { bone: hips });
      for (const e of [bA, bB])
        b.part(new THREE.SphereGeometry(0.03, 6, 4), BONE_P, { bone: hips, at: e, flat: true });
      b.rod(down(0.14), down(0.17), 0.026, LEATHER_D, { bone: hips });
      const cols = i % 2 ? ["#35c4b8", RED] : [RED, TIP];
      [-1, 1].forEach((sd, j) => {
        b.cards([frame(down(0.29).add(v3(sd * 0.02, 0, 0)), [0, 1, 0])], FEATHER, {
          size: [0.07, 0.26],
          lean: 180,
          flow: [0, 0, 1],
          color: cols[j],
          bone: hips,
          sink: 0,
          spin: sd * 10,
        });
      });
    } else if (kind === 1) {
      const c = down(0.14);
      skullFetish([c.x, c.y, c.z], 0.045, hips);
      b.rod(down(0.08), down(0.1), 0.01, GOLD, { bone: hips });
    } else {
      const c = down(0.08);
      b.part(new THREE.SphereGeometry(0.022, 6, 4), GOLD, { bone: hips, at: c, flat: true });
      [-1, 0, 1].forEach((sd) => {
        b.spike(c, [sd * 0.25, -1, 0], 0.13 - Math.abs(sd) * 0.03, 0.02, { color: BONE_P, bone: hips, sides: 6 });
      });
    }
  };

  // =============================================================================================================
  // Belt, loincloth, bandolier, necklace
  // =============================================================================================================
  const belt = torsoSurf.loop([0, 1.28, 0.0], { lift: 0.02 });
  b.sweep(belt, 0.035, { color: LEATHER_D });

  const frontZ = torsoSurf.ray([0, 1.3, 1.5], [0, 0, -1])?.at.z ?? 0.22;
  const backZ = torsoSurf.ray([0, 1.3, -1.5], [0, 0, 1])?.at.z ?? -0.2;
  const flapOutline: [number, number][] = [
    [-0.17, 0],
    [0.17, 0],
    [0.15, -0.45],
    [0.06, -0.57],
    [0, -0.42],
    [-0.06, -0.57],
    [-0.15, -0.45],
  ];
  b.extrude(flapOutline, { at: [0, 1.3, frontZ + 0.035], x: [1, 0, 0], thickness: 0.02, bevel: 0.004, color: FLAP, bone: hips });
  b.extrude(flapOutline, { at: [0, 1.3, backZ - 0.035], x: [-1, 0, 0], thickness: 0.02, bevel: 0.004, color: FLAP, bone: hips });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.02, 6, 4), BONE_P, {
      bone: hips,
      at: [s * 0.06, 1.3 - 0.57, frontZ + 0.045],
      flat: true,
    });

  // belt buckle skull
  {
    const hit = torsoSurf.nearest([0, 1.28, 1.0]);
    const p = offset(hit, hit, 0.045);
    skullFetish([p.x, p.y, p.z], 0.06, hips);
  }

  // belt fetishes
  [-125, -52, 52, 125, 180].forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const hit = torsoSurf.nearest([Math.sin(a) * 0.9, 1.29, 0.03 + Math.cos(a) * 0.8]);
    fetish(offset(hit, hit, 0.05), i);
  });

  // bandolier
  {
    const strap = torsoSurf.loop([0, 1.62, 0.12], { dir: [0.6, 0.8, 0.0], lift: 0.075 });
    b.sweep(strap, 0.028, { color: LEATHER_D });
    b.along(strap, 8, (at) => b.part(new THREE.SphereGeometry(0.022, 6, 4), GOLD, { at, flat: true }));
  }

  // tooth necklace
  {
    const loop = neckSurf.loop(neck.at(0.4), { lift: 0.015 });
    b.sweep(loop, 0.014, { color: LEATHER_D });
    let ti = 0;
    b.along(loop, 11, (at) => {
      ti++;
      b.spike(at, [0, -1, 0.15], 0.07 + (ti % 3) * 0.02, 0.02, { color: BONE_P, bone: neck.joints[0], sides: 6 });
    });
    const q = neck.at(0.4).at;
    const ph = neckSurf.nearest([q.x, q.y - 0.05, q.z + 0.7]);
    b.rod(ph, [ph.at.x, ph.at.y - 0.1, ph.at.z + 0.03], 0.01, LEATHER_D, { bone: neck.joints[1] });
    skullFetish([ph.at.x, ph.at.y - 0.13, ph.at.z + 0.04], 0.05, spineTop);
  }

  // chest war paint
  {
    const hit = bodySurf.nearest([0, 1.62, 0.9]);
    b.decal(bodySurf, CHEST_PAINT, { at: hit, dir: [0, 0.1, 1], size: [0.5, 0.4] });
  }

  // =============================================================================================================
  // Legs
  // =============================================================================================================
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.22, 1.08, -0.02], [s * 0.3, 0.14, -0.04], [0.55, 0.55], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.3, 0, 0.1],
    });
    b.sweep(leg, [0.17, 0.145, 0.11, 0.095, 0.08], { color: SKIN });
    const ankle = leg.joints[leg.joints.length - 1];
    const knee = leg.joints[1];

    const kp = pts[1].clone().add(v3(0, 0.0, 0.08));
    b.part(sph(7, 5), SKIN, { bone: knee, at: kp, scale: [0.1, 0.1, 0.09] });
    b.spike(kp, [s * 0.15, 0.35, 1], 0.14, 0.04, { color: BONE_P, bone: knee, sides: 6 });

    // foot
    b.part(sph(9, 6), SKIN, { bone: ankle, at: [s * 0.3, 0.07, 0.06], scale: [0.14, 0.08, 0.2] });
    [-1, 0, 1].forEach((i, j) => {
      const x = s * 0.3 + i * 0.07;
      const toe = b.chain(
        `ft${side}${j}`,
        [
          [x, 0.04, 0.16],
          [x + i * 0.012, 0.04, 0.3],
        ],
        { parent: ankle, names: [`toe${side}${j + 1}`], role: "digit" },
      );
      b.sweep(toe, 0.05, { color: SKIN });
      b.spike([x + i * 0.012, 0.04, 0.32], [i * 0.1, -0.15, 1], 0.075, 0.022, {
        color: CLAW,
        bone: toe.joints[0],
        sides: 6,
      });
    });
    // heel spur / ankle bone bangle
    b.part(new THREE.TorusGeometry(0.075, 0.016, 5, 10), BONE_P, {
      bone: ankle,
      at: [s * 0.3, 0.17, -0.04],
      dir: [0, 1, 0],
      axis: "z",
      flat: true,
    });
  }

  // =============================================================================================================
  // Arms and hands
  // =============================================================================================================
  const delts: ReturnType<typeof b.part>[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ap = limb([s * 0.5, 1.85, 0.26], [s * 1.2, 0.85, 0.3], [0.65, 0.68], [[0, 0, -1]]);
    const arm = b.chain(`arm${side}`, ap, {
      parent: spineTop,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const armSw = b.sweep(arm, [0.15, 0.13, 0.095, 0.1, 0.08], { color: SKIN });
    const shoulderJ = arm.joints[0];
    const wrist = arm.joints[arm.joints.length - 1];

    // deltoid, spikes
    delts.push(
      b.part(sph(9, 6), SKIN, { bone: shoulderJ, at: [s * 0.54, 1.88, 0.26], scale: [0.19, 0.19, 0.19] }),
    );
    b.spike([s * 0.55, 2.02, 0.26], [s * 0.35, 1, -0.1], 0.17, 0.037, { color: BONE_P, bone: shoulderJ, sides: 6 });
    b.spike([s * 0.62, 1.98, 0.14], [s * 0.9, 0.7, -0.5], 0.12, 0.028, { color: BONE_P, bone: shoulderJ, sides: 6 });
    b.spike([s * 0.62, 1.98, 0.36], [s * 0.9, 0.7, 0.5], 0.1, 0.026, { color: BONE_P, bone: shoulderJ, sides: 6 });

    // elbow spike
    b.spike(ap[1].clone().add(v3(0, 0, -0.07)), [s * 0.3, 0.1, -1], 0.13, 0.036, {
      color: BONE_P,
      bone: arm.joints[1],
      sides: 6,
    });

    // cuffs
    const armSurf = b.surface(armSw);
    b.sweep(armSurf.loop(arm.at(0.78), { lift: 0.012 }), 0.022, { color: BONE_P });
    b.sweep(armSurf.loop(arm.at(0.2), { lift: 0.01 }), 0.02, { color: GOLD });

    // hand
    const d = ap[2].clone().sub(ap[1]).normalize();
    const pc = ap[2].clone().addScaledVector(d, 0.07);
    b.part(sph(8, 6), SKIN, { bone: wrist, at: pc, dir: d, scale: [0.06, 0.09, 0.09] });
    const zoffs = [-0.045, -0.005, 0.035];
    const lens = [0.1, 0.11, 0.1];
    zoffs.forEach((zo, j) => {
      const f0 = pc.clone().addScaledVector(d, 0.075).add(v3(0, 0, zo));
      const f1 = f0.clone().addScaledVector(d, lens[j]).add(v3(0, 0, 0.01 + zo * 0.2));
      const f2 = f1.clone().addScaledVector(d, lens[j] * 0.85).add(v3(0, 0, 0.04));
      const fing = b.chain(`fing${side}${j}`, [f0, f1, f2], {
        parent: wrist,
        names: [`finger${side}${j + 1}a`, `finger${side}${j + 1}b`],
        role: "digit",
      });
      b.sweep(fing, [0.04, 0.028], { color: SKIN });
      b.spike(f2, f2.clone().sub(f1).normalize(), 0.065, 0.017, { color: CLAW, bone: fing.joints[1], sides: 6 });
    });
    {
      const t0 = pc.clone().addScaledVector(d, 0.02).add(v3(0, 0, 0.06));
      const t1 = t0.clone().addScaledVector(d, 0.06).add(v3(0, 0, 0.07));
      const t2 = t1.clone().addScaledVector(d, 0.03).add(v3(0, 0, 0.06));
      const th = b.chain(`thumb${side}`, [t0, t1, t2], {
        parent: wrist,
        names: [`thumb${side}a`, `thumb${side}b`],
        role: "digit",
      });
      b.sweep(th, [0.036, 0.026], { color: SKIN });
      b.spike(t2, t2.clone().sub(t1).normalize(), 0.06, 0.018, { color: CLAW, bone: th.joints[1], sides: 6 });
    }
  }

  // =============================================================================================================
  // Swamp growths: moss clumps and warts
  // =============================================================================================================
  {
    const mossSurf = b.surface([hump, ...delts]);
    const hits = mossSurf.scatter(16, { rng: rng(21), minDist: 0.1, filter: (h) => h.n.y > 0.3 });
    const mossCols = [MOSS_A, MOSS_B, MOSS_C];
    hits.forEach((h, i) => {
      const sc = 0.7 + rand() * 0.8;
      b.stick(new THREE.IcosahedronGeometry(0.05, 0), mossCols[i % 3], h, {
        embed: 0.4,
        scale: [sc, sc * 0.8, sc],
        flat: true,
      });
    });
    const warts = torsoSurf.scatter(18, { rng: rng(5), minDist: 0.14, filter: (h) => h.n.y > -0.2 });
    warts.forEach((h, i) => {
      b.stick(new THREE.SphereGeometry(0.02, 6, 4), i % 2 ? "#b4d08a" : "#2a6a70", h, { embed: 0.5, flat: true });
    });
  }

  return b.root;
}
