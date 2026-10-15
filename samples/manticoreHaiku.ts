import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { mid, rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { mix, paint, smoothstep } from "../src/paint";
import type { Rgb } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Manticore",
  description:
    "A lion-bodied manticore with a crimson mane, gold armour, violet bat wings and a segmented teal scorpion tail ending in a glowing stinger.",
  style: "League of Legends",
  commit: "b816db2",
};

// Painted shading: a saturated shadow, a mid tone and a warm highlight, with a magenta rim from behind.
const KEY = new THREE.Vector3(0.35, 0.8, 0.5).normalize();
const RIM = new THREE.Vector3(0.3, 0.45, -0.84).normalize();

function tone(n: THREE.Vector3, dark: string, midC: string, lit: string, rim: string, rimAmt: number): Rgb {
  const d = n.dot(KEY);
  const low = mix(dark, midC, smoothstep(-0.7, -0.05, d));
  const hi = mix(low, lit, smoothstep(0.15, 0.75, d));
  return mix(hi, rim, smoothstep(0.45, 0.95, n.dot(RIM)) * rimAmt);
}
const shade = (dark: string, midC: string, lit: string, rim: string, rimAmt = 0.3) =>
  paint((_p, n) => tone(n, dark, midC, lit, rim, rimAmt));

const COAT = shade("#6e2550", "#e8843a", "#ffd27a", "#ff7ad8");
const BELLY = shade("#a0506a", "#f5c48a", "#fff1cf", "#ffb0e0", 0.25);
const MANE = shade("#3d0c3a", "#d81e3c", "#ff6a48", "#ff9ad0");
const GOLD = shade("#6e3a14", "#d99a2b", "#fff0a0", "#ffffff", 0.45);
const SADDLE = paint((_p, n) => (n.y > 0.45 ? MANE : COAT));
const VIOLET = shade("#1a0a4a", "#5c2bc9", "#9b6bff", "#ff6fd8");
const TEAL = shade("#063c5c", "#14b3a0", "#8ffff0", "#e0fffa", 0.35);
const INK = "#1d0c2e";
const IVORY = "#fff3d6";
const MAGENTA = "#ff3fa4";

// Hand-drawn card tufts (the root is the drawing's bottom edge) and the glowing almond eye.
const MANE_TUFT = svg(
  `<svg viewBox="0 0 40 96" xmlns="http://www.w3.org/2000/svg">
<path d="M20 95 C3 70 1 40 14 6 C18 20 22 30 26 40 C30 26 34 14 36 2 C39 34 40 66 20 95Z" fill="#d81e3c" stroke="#2a0822" stroke-width="2"/>
<path d="M20 95 C10 72 12 46 20 24 C27 46 30 70 20 95Z" fill="#ff7a3c"/>
<path d="M36 2 C34 14 30 26 26 40 C22 30 18 20 14 6 C18 0 32 -2 36 2Z" fill="#ffd34d"/>
</svg>`,
  { size: 128 },
);
const MANE_TUFT_GOLD = svg(
  `<svg viewBox="0 0 40 96" xmlns="http://www.w3.org/2000/svg">
<path d="M20 95 C3 70 1 40 14 6 C18 20 22 30 26 40 C30 26 34 14 36 2 C39 34 40 66 20 95Z" fill="#ffb444" stroke="#2a0822" stroke-width="2"/>
<path d="M20 95 C10 72 12 46 20 24 C27 46 30 70 20 95Z" fill="#c2472f"/>
<path d="M36 2 C34 14 30 26 26 40 C22 30 18 20 14 6 C18 0 32 -2 36 2Z" fill="#fff0a0"/>
</svg>`,
  { size: 128 },
);
const FUR = svg(
  `<svg viewBox="0 0 24 56" xmlns="http://www.w3.org/2000/svg">
<path d="M12 55 C3 42 2 24 9 4 C11 14 13 20 15 26 C18 16 19 10 20 2 C23 20 23 40 12 55Z" fill="#ffb444" stroke="#3a0a2a" stroke-width="1.6"/>
<path d="M12 55 C7 44 8 30 12 20 C15 32 16 42 12 55Z" fill="#b8452f"/>
</svg>`,
  { size: 96 },
);
const EYE = svg(
  `<svg viewBox="0 0 70 48" xmlns="http://www.w3.org/2000/svg">
<path d="M3 24 Q35 -6 67 24 Q35 54 3 24Z" fill="#14072a"/>
<ellipse cx="35" cy="24" rx="15" ry="11" fill="#6fffe0"/>
<ellipse cx="35" cy="24" rx="9" ry="10" fill="#14c4a8"/>
<ellipse cx="35" cy="24" rx="3" ry="10" fill="#070214"/>
<ellipse cx="29" cy="19" rx="3" ry="2" fill="#ffffff"/>
</svg>`,
  { size: 256 },
);

// Body cross-section (half-width, half-height) by z: a deep barrel chest, a tucked waist, a round rump.
const BODY_KEYS: [number, number, number][] = [
  [-1.0, 0.2, 0.22],
  [-0.75, 0.3, 0.32],
  [-0.35, 0.34, 0.34],
  [0.1, 0.35, 0.35],
  [0.4, 0.33, 0.33],
  [0.62, 0.24, 0.24],
  [0.82, 0.18, 0.18],
  [1.0, 0.13, 0.12],
];
function bodyRadius(z: number): [number, number] {
  const k = BODY_KEYS;
  if (z <= k[0][0]) return [k[0][1], k[0][2]];
  for (let i = 1; i < k.length; i++) {
    if (z <= k[i][0]) {
      const u = (z - k[i - 1][0]) / (k[i][0] - k[i - 1][0]);
      return [k[i - 1][1] + (k[i][1] - k[i - 1][1]) * u, k[i - 1][2] + (k[i][2] - k[i - 1][2]) * u];
    }
  }
  return [k[k.length - 1][1], k[k.length - 1][2]];
}

const BODY_PTS = [
  [0, 1.04, -0.98],
  [0, 1.05, -0.66],
  [0, 1.06, -0.3],
  [0, 1.07, 0.1],
  [0, 1.12, 0.5],
  [0, 1.25, 0.74],
  [0, 1.4, 0.95],
];

export default function build() {
  const b = createBuilder({ name: "manticore" });

  // ---- Skeleton: spine, neck, head and jaw ---------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.04, -0.62], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 1.04, -0.44], [0, 1.05, -0.05], [0, 1.08, 0.3], [0, 1.15, 0.6]]), {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 1.15, 0.6], [0, 1.3, 0.8], [0, 1.4, 0.95]]), {
    parent: spine.joints[2],
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.42, 1.0], dir: [0, -0.06, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.37, 1.12], aim: [0, 1.32, 1.45], role: "jaw" });

  // ---- Body: one tube from rump to skull, skinned over the spine and neck ---------------------------------
  const bodyPath = catmull(BODY_PTS);
  const body = b.sweep(bodyPath, (t: number): [number, number] => bodyRadius(bodyPath.at(t).z), {
    bone: [hips, spine, neck, head],
    color: SADDLE,
    sectors: [[100, 260, BELLY]],
  });

  // Dorsal crest: crimson and gold spikes down the spine.
  const ridge = catmull(BODY_PTS.map(([x, y, z]) => [x, y + bodyRadius(z)[1] - 0.02, z]));
  let crest = 0;
  b.along(
    ridge,
    9,
    (at) => {
      crest++;
      b.spike(at, [0, 1, -0.25], 0.14, 0.034, { color: crest % 2 ? MANE : GOLD });
    },
    { from: 0.08, to: 0.8 },
  );

  // Gold breastplate over the chest, with a glowing gem at its centre.
  const plate = new THREE.SphereGeometry(0.34, 16, 10, 0, Math.PI * 2, 0, 0.8).rotateX(Math.PI / 2).translate(0, 1.12, 0.5);
  b.part(plate, GOLD, { bone: spine.joints[2], at: [0, 0, 0] });
  glow(b.part(new THREE.OctahedronGeometry(0.05), MAGENTA, { bone: neck.joints[0], at: [0, 1.12, 0.88], scale: [1, 1.2, 0.8] }), 1.8);

  // Gold flank rings with glowing gems.
  for (const s of [1, -1]) {
    const setting = new THREE.TorusGeometry(0.055, 0.013, 6, 12).rotateY(Math.PI / 2).translate(s * 0.36, 1.06, -0.05);
    b.part(setting, GOLD, { bone: spine.joints[1], at: [0, 0, 0] });
    glow(
      b.part(new THREE.OctahedronGeometry(0.048), MAGENTA, { bone: spine.joints[1], at: [s * 0.38, 1.06, -0.05], scale: [0.7, 1.2, 0.7] }),
      1.6,
    );
  }

  // ---- Head ----------------------------------------------------------------------------------------------
  const skull = b.part(new THREE.SphereGeometry(1, 20, 14), COAT, {
    bone: head,
    at: [0, 1.52, 1.06],
    scale: [0.26, 0.23, 0.26],
  });
  b.sweep(bezier([0, 1.46, 1.12], [0, 1.44, 1.22], [0, 1.42, 1.32], [0, 1.42, 1.4]), (t: number): [number, number] => [0.15 - 0.04 * t, 0.12 - 0.03 * t], {
    bone: head,
    color: BELLY,
  });
  b.sweep(catmull([[0, 1.37, 1.12], [0, 1.34, 1.3], [0, 1.35, 1.42]]), [0.085, 0.06], { bone: jaw, color: BELLY });
  b.part(new THREE.SphereGeometry(0.05, 10, 8), INK, { bone: head, at: [0, 1.48, 1.47], scale: [1.4, 0.9, 0.9] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 8, 6), "#3a1438", { bone: head, at: [s * 0.07, 1.42, 1.38] });
    b.spike([s * 0.08, 1.38, 1.33], [0, -1, 0.15], 0.095, 0.019, { color: IVORY, bone: head });
    b.spike([s * 0.07, 1.33, 1.36], [0, 1, 0.1], 0.08, 0.017, { color: IVORY, bone: jaw });
    for (let i = 0; i < 3; i++) {
      const z = 1.2 + i * 0.065;
      b.spike([s * 0.095, 1.37, z], [0, -1, 0.1], 0.045, 0.01, { color: IVORY, bone: head });
      b.spike([s * 0.085, 1.34, z + 0.03], [0, 1, 0.1], 0.04, 0.009, { color: IVORY, bone: jaw });
    }
    // Gold brow ridges over each eye.
    b.sweep(bezier([s * 0.2, 1.68, 1.1], [s * 0.13, 1.65, 1.22], [s * 0.04, 1.6, 1.25]), (t: number) => 0.03 - 0.01 * t, {
      bone: head,
      color: GOLD,
    });
  }
  // Glowing almond eyes on the skull, one drawing placed on each side.
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around([0, 1.52, 1.06]).at(s * 30, 4);
    if (hit) glow(b.decal(skin, EYE, { at: hit, size: [0.13, 0.09] }), 1.4);
  }
  // Crimson ears, pointed back.
  const EAR: number[][] = [
    [-0.07, 0],
    [0.08, -0.01],
    [0.09, 0.08],
    [0, 0.16],
    [-0.09, 0.08],
  ];
  for (const s of [1, -1]) {
    b.extrude(EAR, { x: [0, 0, 1], at: [s * 0.16, 1.63, 1.0], thickness: 0.04, bevel: 0.008, smoothing: 1, color: MANE });
  }
  // Mane: two rings of flame tufts, one round the head and one round the neck base, sweeping back.
  const maneHead = b.ring(head, { count: 30, radius: 0.36, tilt: -25 }).items;
  b.cards(maneHead, [MANE_TUFT, MANE_TUFT, MANE_TUFT_GOLD], { size: [0.18, 0.4], lean: 28, bend: 18, vary: 0.25, rng: rng(5) });
  const maneNeck = b.ring(neck.joints[0], { count: 26, radius: 0.4, tilt: -30 }).items;
  b.cards(maneNeck, [MANE_TUFT, MANE_TUFT, MANE_TUFT_GOLD], { size: [0.2, 0.44], lean: 35, bend: 20, vary: 0.25, rng: rng(6) });
  // Short gold fur lying back over the shoulders and flank.
  const fur = b.surface(body).scatter(170, {
    rng: rng(3),
    minDist: 0.06,
    filter: (h) => h.n.y > -0.4 && h.at.z > -0.9 && h.at.z < 0.6,
  });
  b.cards(fur, FUR, { size: [0.05, 0.1], lean: 80, bend: 25, vary: 0.3, rng: rng(4) });

  // ---- Legs: digitigrade lion limbs with gold cuffs and claws --------------------------------------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Forelegs: shoulder under a gold pauldron, elbow back, wrist forward.
    const fr = limb([s * 0.2, 0.98, 0.45], [s * 0.2, 0.05, 0.62], [0.38, 0.36, 0.22], [
      [0, 0, -1],
      [0, 0, 1],
    ]);
    const fore = b.chain(`foreLeg${L}`, fr, {
      parent: spine.joints[2],
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `paw${L}`],
      role: "leg",
    });
    const wristT = fore.ts[2];
    b.sweep(fore, [0.18, 0.08], {
      color: paint((_p, _n, sc) => (Math.abs(sc[0] - wristT) < 0.03 ? GOLD : COAT)),
    });
    const forePaw = fore.tip!;
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(0.04, 8, 6), COAT, {
        bone: forePaw,
        at: [s * 0.2 + k * 0.035, 0.035, 0.66],
        scale: [1, 0.8, 1.2],
      });
      b.spike([s * 0.2 + k * 0.035, 0.04, 0.7], [0, -0.4, 1], 0.05, 0.009, { color: IVORY, bone: forePaw });
    }

    // Gold pauldron dome over the shoulder, with three crimson spikes swept back.
    const dome = new THREE.SphereGeometry(0.27, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2)
      .scale(1, 0.6, 1.1)
      .translate(s * 0.28, 1.12, 0.42);
    b.part(dome, GOLD, { bone: spine.joints[2], at: [0, 0, 0] });
    for (const dz of [0.52, 0.42, 0.32]) {
      b.spike([s * 0.28, 1.26, dz], [s * 0.1, 1, -0.5], 0.14, 0.034, { color: MANE });
    }

    // Hind legs: knee forward, hock back.
    const hd = limb([s * 0.2, 1.0, -0.62], [s * 0.2, 0.05, -0.76], [0.4, 0.36, 0.22], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hind = b.chain(`hindLeg${L}`, hd, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `hock${L}`, `pawH${L}`],
      role: "leg",
    });
    const hockT = hind.ts[2];
    b.sweep(hind, [0.2, 0.08], {
      color: paint((_p, _n, sc) => (Math.abs(sc[0] - hockT) < 0.03 ? GOLD : COAT)),
    });
    const hindPaw = hind.tip!;
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(0.04, 8, 6), COAT, {
        bone: hindPaw,
        at: [s * 0.2 + k * 0.035, 0.035, -0.72],
        scale: [1, 0.8, 1.2],
      });
      b.spike([s * 0.2 + k * 0.035, 0.04, -0.68], [0, -0.4, 1], 0.05, 0.009, { color: IVORY, bone: hindPaw });
    }
  }

  // ---- Scorpion tail: six teal plates with gold cuffs, arching over the back ----------------------------
  const tailPath = catmull([
    [0, 1.05, -0.8],
    [0, 1.3, -1.12],
    [0, 1.7, -1.32],
    [0, 2.1, -1.36],
    [0, 2.42, -1.2],
    [0, 2.6, -0.95],
    [0, 2.52, -0.7],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tailA", "tailB", "tailC", "tailD", "tailE", "tailF"],
    role: "tail",
  });
  const plates = paint((_p, _n, sc) => ((sc[0] * 6) % 1 < 0.14 ? GOLD : TEAL));
  b.sweep(tail, [0.2, 0.05], { color: plates });
  // Dorsal plates along the tail: gold spikes standing out of the tube's outer side.
  let tailPlate = 0;
  b.along(
    tail,
    8,
    (at) => {
      const out = at.dir([0, 0, 1]);
      const base = at.at.clone().addScaledVector(out, 0.2 - 0.15 * at.t - 0.02);
      tailPlate++;
      b.spike(base, out, 0.12, 0.026, { color: tailPlate % 2 ? GOLD : MANE });
    },
    { from: 0.1, to: 0.9 },
  );
  // Stinger: a curled ivory sting with a glowing magenta barb.
  const sting = tail.joints[5];
  b.sweep(bezier([0, 2.52, -0.72], [0, 2.68, -0.64], [0, 2.66, -0.5], [0, 2.42, -0.4]), [0.06, 0.006], {
    bone: sting,
    color: IVORY,
    caps: { start: "round", end: "point" },
  });
  glow(b.part(new THREE.SphereGeometry(0.04, 10, 8), MAGENTA, { bone: sting, at: [0, 2.42, -0.4] }), 1.8);

  // ---- Wings: gold arm and finger bones, violet membranes with glowing veins ------------------------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const arm = b.chain(`wingArm${L}`, catmull([[s * 0.2, 1.36, 0.24], [s * 0.72, 1.74, 0.32], [s * 1.22, 1.8, 0.02]]), {
      parent: spine.joints[2],
      names: [`humerus${L}`, `radius${L}`],
      role: "wing",
    });
    const wrist = arm.joints[1];
    const f2 = b.chain(`finger2${L}`, catmull([[s * 1.22, 1.8, 0.02], [s * 1.6, 1.78, -0.24], [s * 2.02, 1.42, -0.56]]), {
      parent: wrist,
      names: [`f2a${L}`, `f2b${L}`],
      role: "digit",
    });
    const f3 = b.chain(`finger3${L}`, catmull([[s * 1.22, 1.8, 0.02], [s * 1.66, 1.6, -0.38], [s * 2.08, 1.02, -0.8]]), {
      parent: wrist,
      names: [`f3a${L}`, `f3b${L}`],
      role: "digit",
    });
    const f4 = b.chain(`finger4${L}`, catmull([[s * 1.22, 1.8, 0.02], [s * 1.5, 1.42, -0.5], [s * 1.72, 0.7, -1.02]]), {
      parent: wrist,
      names: [`f4a${L}`, `f4b${L}`],
      role: "digit",
    });
    b.sweep(arm, [0.06, 0.024], { color: GOLD });
    for (const f of [f2, f3, f4]) b.sweep(f, [0.024, 0.007], { color: GOLD });
    b.spike([s * 1.22, 1.8, 0.02], [s * 1.3, 1.96, 0.1], null, 0.022, { color: IVORY, bone: wrist });

    const flank: number[][] = [
      [s * 0.24, 1.3, 0.12],
      [s * 0.34, 1.08, -0.3],
      [s * 0.3, 0.92, -0.62],
    ];
    b.membrane(arm, f2, { color: VIOLET, thickness: 0.02, scallop: 0.1 });
    b.membrane(f2, f3, { color: VIOLET, thickness: 0.02, scallop: 0.12 });
    b.membrane(f3, f4, { color: VIOLET, thickness: 0.02, scallop: 0.12 });
    b.membrane(f4, flank, { color: VIOLET, thickness: 0.02, scallop: 0.14 });
    b.membrane(arm, flank, { color: VIOLET, thickness: 0.02 });

    // Glowing veins running along the membrane between neighbouring fingers.
    for (const [A, B] of [
      [f2, f3],
      [f3, f4],
    ] as const) {
      const vein = catmull([0.1, 0.35, 0.6, 0.85].map((t) => mid(A.at(t), B.at(t))));
      glow(b.sweep(vein, 0.008, { color: MAGENTA, bone: A.joints[0] }), 1.2);
    }
  }

  return b.root;
}
