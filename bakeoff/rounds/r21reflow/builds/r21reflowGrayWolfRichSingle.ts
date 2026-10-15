import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { mix, noise, paint, smoothstep, countershade } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { cel, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gray Wolf",
  description:
    "A gray wolf standing alert: heroic chunky proportions, cel-shaded painted coat with cream chest and legs, bushy hanging tail, tufted fur cards, amber eyes, fangs and black claws.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

const GREY = "#8b8e94";
const DARK = "#3d4047";
const MID = "#62666e";
const CREAM = "#d9cfbb";
const CLAW = "#25222a";
const NOSE = "#1c191e";
const AMBER = "#f0a52a";
const IVORY = "#f3ead2";

const BACK = paint((p, n) => {
  const k = noise(p, 0.1, 2);
  const top = smoothstep(-0.1, 0.8, n.y);
  const a = Math.min(1, Math.max(0, top * 0.65 + (k - 0.5) * 0.9 + 0.05));
  return mix(GREY, DARK, a);
});

const COAT = cel(
  paint((p, n) => {
    const belly = n.y < -0.12 - 0.3 * zigzag(p.z / 0.05);
    const chest = p.z > 0.3 && n.z > 0.3 + 0.25 * zigzag(p.x / 0.04);
    return belly || chest ? CREAM : BACK;
  }),
);

const TAIL = cel(
  paint((p, n) => {
    if (p.y < 0.26 + 0.04 * zigzag(p.x / 0.03 + p.z / 0.03)) return DARK;
    if (n.y < -0.25) return CREAM;
    return BACK;
  }),
);

const LEGS = cel(
  paint((p, n) => {
    if (p.y < 0.3 + 0.07 * zigzag(p.y / 0.05 + p.x / 0.05)) return CREAM;
    if (p.z > 0.2 && n.z > 0.5 && p.y < 0.58) return MID;
    return mix(GREY, MID, noise(p, 0.08, 4));
  }),
);

const FACE = cel(
  paint((p, n) => {
    if (Math.abs(p.x) > 0.045 && n.y < 0.2 && p.z > 0.66 && zigzag(p.z / 0.03) > 0.25) return CREAM;
    const k = noise(p, 0.05, 7);
    return mix(GREY, DARK, n.y > 0.4 ? 0.5 + 0.4 * k : 0.25 * k);
  }),
);
const MUZ = cel(countershade("#a3a4a2", CREAM, { level: -0.15 }));
const CREAMC = cel(CREAM);
const EAROUT = cel("#4a4d55");

const TUFT = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 1 C25 18 31 42 29 63 L3 63 C1 42 7 18 16 1Z" fill="#ffffff"/><path d="M16 8 C17 28 17 46 16 63" stroke="#d2d2d2" stroke-width="3" fill="none"/></svg>`,
  { size: 128 },
);

const EAR: OutlinePoint[] = [
  [-0.045, 0],
  [0.045, 0],
  [0.03, 0.09],
  [0, 0.18, "sharp"],
  [-0.03, 0.09],
];
const EAR_IN: OutlinePoint[] = [
  [-0.028, 0.012],
  [0.028, 0.012],
  [0.018, 0.085],
  [0, 0.15, "sharp"],
  [-0.018, 0.085],
];

export default function build() {
  const b = createBuilder({ name: "grayWolf" });
  const sph = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.72, -0.34] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.72, -0.34],
      [0, 0.73, -0.08],
      [0, 0.75, 0.18],
      [0, 0.77, 0.4],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chestBone = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.77, 0.4],
      [0, 0.86, 0.56],
      [0, 0.92, 0.7],
    ]),
    { parent: chestBone, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.92, 0.7], dir: [0, -0.12, 1], role: "head" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.74, -0.42],
      [0, 0.66, -0.64],
      [0, 0.5, -0.86],
      [0, 0.32, -0.98],
      [0, 0.16, -1.02],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---------- body ----------
  const body = b.loft(
    [
      { at: [0, 0.72, -0.4], w: 0.18, h: 0.22 },
      { at: [0, 0.73, -0.18], w: 0.23, h: 0.27 },
      { at: [0, 0.72, 0.04], w: 0.24, h: 0.28 },
      { at: [0, 0.73, 0.24], w: 0.27, h: 0.34 },
      { at: [0, 0.76, 0.42], w: 0.28, h: 0.34 },
    ],
    { bone: spine, color: COAT },
  );
  const neckTube = b.sweep(neck, [0.115, 0.1, 0.085], { color: COAT });
  const tailTube = b.sweep(tail, [0.05, 0.08, 0.1, 0.085, 0.045], {
    color: TAIL,
    caps: { start: "round", end: "point" },
  });

  for (const s of [1, -1]) {
    b.part(sph(), COAT, { bone: chestBone, at: [s * 0.14, 0.64, 0.36], scale: [0.085, 0.13, 0.11] });
    b.part(sph(), COAT, { bone: hips, at: [s * 0.14, 0.62, -0.3], scale: [0.1, 0.15, 0.17] });
  }

  // ---------- legs ----------
  const addPaw = (joint: Parameters<typeof b.part>[2] extends infer O ? (O extends { bone?: infer J } ? J : never) : never, x: number, z: number) => {
    b.part(sph(10, 7), CREAMC, { bone: joint, at: [x, 0.04, z + 0.03], scale: [0.052, 0.04, 0.075] });
    for (const o of [-0.026, 0, 0.026]) {
      const dz = o === 0 ? 0.006 : 0;
      b.part(sph(6, 5), CREAMC, { bone: joint, at: [x + o, 0.028, z + 0.075 + dz], scale: [0.02, 0.018, 0.026] });
      b.spike([x + o, 0.022, z + 0.098 + dz], [0, -0.35, 1], 0.04, 0.008, { color: CLAW, bone: joint, sides: 6 });
    }
  };
  const legTubes: ReturnType<typeof b.sweep>[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fp = limb(
      [s * 0.12, 0.6, 0.36],
      [s * 0.115, 0.045, 0.42],
      [0.24, 0.22, 0.12],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const fl = b.chain(`legF${side}`, fp, {
      parent: chestBone,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`],
      role: "leg",
    });
    legTubes.push(b.sweep(fl, [0.06, 0.048, 0.038, 0.034], { color: LEGS }));
    addPaw(fl.tip!, s * 0.115, 0.42);

    const hp = limb(
      [s * 0.13, 0.62, -0.3],
      [s * 0.12, 0.05, -0.42],
      [0.25, 0.25, 0.22],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hl = b.chain(`legH${side}`, hp, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
      role: "leg",
    });
    legTubes.push(b.sweep(hl, [0.09, 0.055, 0.04, 0.034], { color: LEGS }));
    addPaw(hl.tip!, s * 0.12, -0.42);
  }

  // ---------- head ----------
  const hp = (l: number, f: number, u: number) => head.local({ left: l, forward: f, up: u });
  const skull = b.part(sph(12, 8), FACE, { bone: head, at: hp(0, 0.05, 0), scale: [0.088, 0.085, 0.1] });
  b.sweep([hp(0, 0.1, -0.005), hp(0, 0.275, -0.02)], (t) => [0.05 - 0.018 * t, 0.043 - 0.013 * t] as [number, number], {
    color: MUZ,
    bone: head,
    sides: 8,
  });
  b.part(sph(8, 6), NOSE, { bone: head, at: hp(0, 0.3, -0.012), scale: [0.024, 0.019, 0.02] });

  const jaw = b.joint("jaw", { parent: head, at: hp(0, 0.06, -0.045), aim: hp(0, 0.26, -0.06), role: "jaw" });
  b.sweep([hp(0, 0.07, -0.075), hp(0, 0.265, -0.075)], [0.034, 0.02], { color: CREAMC, bone: jaw, sides: 8 });

  const cheeks: ReturnType<typeof b.part>[] = [];
  for (const s of [1, -1]) {
    cheeks.push(b.part(sph(8, 6), CREAMC, { bone: head, at: hp(s * 0.065, 0.02, -0.035), scale: [0.045, 0.055, 0.065] }));
    // eyes
    b.part(sph(6, 5), DARK, { bone: head, at: hp(s * 0.057, 0.105, 0.03), scale: [0.012, 0.018, 0.03] });
    glow(b.part(sph(6, 5), AMBER, { bone: head, at: hp(s * 0.062, 0.11, 0.03), scale: [0.01, 0.015, 0.017] }), 0.4);
    b.part(sph(5, 4), NOSE, { bone: head, at: hp(s * 0.07, 0.115, 0.03), scale: [0.004, 0.008, 0.008] });
    b.part(sph(5, 4), CREAMC, { bone: head, at: hp(s * 0.05, 0.115, 0.062), scale: [0.01, 0.008, 0.016] });
    // mouth line
    b.sweep([hp(s * 0.048, 0.12, -0.02), hp(s * 0.04, 0.2, -0.032), hp(s * 0.031, 0.275, -0.036)], 0.004, {
      color: NOSE,
      bone: head,
      sides: 5,
    });
    // fangs
    b.spike(hp(s * 0.026, 0.235, -0.035), [0, -1, 0], 0.022, 0.0065, { color: IVORY, bone: head, sides: 6 });
    b.spike(hp(s * 0.02, 0.25, -0.055), [0, 1, 0], 0.018, 0.0055, { color: IVORY, bone: jaw, sides: 6 });
    // whiskers
    for (let k = 0; k < 3; k++)
      b.spike(hp(s * 0.03, 0.2, -0.02 - 0.01 * k), hp(s * (0.11 + 0.01 * k), 0.17 - 0.02 * k, -0.035 - 0.03 * k), null, 0.0025, {
        color: "#e6e0d0",
        bone: head,
        sides: 4,
      });
    // ears
    const X: [number, number, number] = [s, 0, 0];
    const Y: [number, number, number] = [s * 0.25, 1, -0.25];
    const at = hp(s * 0.055, -0.005, 0.045);
    const ear = b.extrude(EAR, { at, x: X, y: Y, thickness: 0.03, bevel: 0.006, color: EAROUT, bone: head });
    const f = ear.axis.z >= 0 ? 1 : -1;
    b.extrude(EAR_IN, { at: ear.local([0, 0, f * 0.012]), x: X, y: Y, thickness: 0.02, bevel: 0.004, color: CREAMC, bone: head });
  }

  // ---------- fur cards ----------
  const hitsOf = (target: Parameters<typeof b.surface>[0], n: number, seed: number, md: number, filter: (h: { n: THREE.Vector3; at: THREE.Vector3 }) => boolean) =>
    b.surface(target).scatter(n, { rng: rng(seed), minDist: md, filter });

  b.cards(hitsOf(body, 170, 5, 0.055, (h) => h.n.y > -0.45), TUFT, {
    size: [0.075, 0.13],
    lean: 62,
    bend: 25,
    flow: [0, -0.25, -1],
    vary: 0.3,
    spin: 15,
    rng: rng(6),
    color: COAT,
  });
  b.cards(hitsOf(body, 50, 11, 0.05, (h) => h.n.z > 0.35 && h.n.y < 0.5 && h.at.z > 0.3), TUFT, {
    size: [0.06, 0.11],
    lean: 65,
    bend: 20,
    flow: [0, -1, 0.1],
    vary: 0.25,
    rng: rng(12),
    color: CREAM,
  });
  b.cards(hitsOf(neckTube, 80, 7, 0.04, () => true), TUFT, {
    size: [0.07, 0.12],
    lean: 50,
    bend: 25,
    flow: [0, -0.4, -1],
    vary: 0.3,
    spin: 15,
    rng: rng(8),
    color: COAT,
  });
  b.cards(hitsOf(tailTube, 90, 13, 0.045, () => true), TUFT, {
    size: [0.07, 0.13],
    lean: 60,
    bend: 25,
    flow: [0, -1, -0.3],
    vary: 0.3,
    spin: 15,
    rng: rng(14),
    color: TAIL,
  });
  legTubes.forEach((leg, i) =>
    b.cards(hitsOf(leg, 16, 20 + i, 0.04, (h) => h.at.y > 0.15), TUFT, {
      size: [0.04, 0.07],
      lean: 55,
      flow: [0, -1, -0.3],
      vary: 0.25,
      rng: rng(30 + i),
      color: LEGS,
    }),
  );
  b.cards(hitsOf(cheeks, 40, 40, 0.03, () => true), TUFT, {
    size: [0.035, 0.06],
    lean: 65,
    flow: [0, -0.4, -1],
    vary: 0.25,
    rng: rng(41),
    bone: head,
    color: CREAM,
  });
  b.cards(hitsOf(skull, 24, 42, 0.03, (h) => h.n.y > 0.2), TUFT, {
    size: [0.04, 0.06],
    lean: 60,
    flow: [0, -0.4, -1],
    vary: 0.25,
    rng: rng(43),
    bone: head,
    color: "#6a6d74",
  });

  return b.root;
}
