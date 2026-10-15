import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { gradient, scales } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Qilin",
  description:
    "Scaled, hooved chimera: jade dragon-scale coat, cream belly, deer antlers tipped with glowing orbs, lion tail and a cloud-wisp mane, with gold filigree cuffs, collar and flank swirls.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const JADE = "#2fb7a4";
const JADE2 = "#4fd0b2";
const JADE3 = "#37a9c4";
const JADE_D = "#17606f";
const CREAM = "#fff1cf";
const CREAM2 = "#ffe2a8";
const CREAM_D = "#d8a46c";
const GOLD = "#f2b832";
const GOLD_D = "#b4741c";
const ANTLER = "#f7dd8c";
const TIP = "#8ffcff";
const PINK = "#f7a8d4";
const LAV = "#a898f2";
const HOOF = "#2c2540";
const FANG = "#fffaf0";

const COAT = cel(scales([JADE, JADE2, JADE3], JADE_D, { size: 0.065, width: 0.16, seed: 3 }));
const BELLY = cel(scales([CREAM, CREAM2], CREAM_D, { size: 0.065, width: 0.15, seed: 4 }));
const LEG = gradient(COAT, BELLY, [0, 0.5, 0], [0, 0.28, 0]);
const FINC = cel(GOLD, GOLD_D);
const EARC = cel(PINK, LAV);

const wisp = (a: string, b: string, edge: string) =>
  svg(
    `<svg viewBox="0 0 64 96"><path d="M30 96 C8 82 4 58 18 42 C28 31 38 28 36 16 C35 9 39 3 47 0 C50 12 60 28 56 50 C53 70 48 86 30 96 Z" fill="${a}" stroke="${edge}" stroke-width="2.6"/><path d="M32 90 C20 76 20 60 28 48 C34 40 42 34 44 22 C50 38 50 62 44 76 C41 84 38 88 32 90 Z" fill="${b}"/><path d="M30 86 C26 70 30 54 40 36" stroke="${edge}" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
const WISP_A = wisp("#ffffff", "#bff3ee", JADE3);
const WISP_B = wisp("#ffe3f2", PINK, "#d86aa8");
const WISP_C = wisp("#fff3c4", GOLD, GOLD_D);
const WISP_D = wisp("#e6e0ff", LAV, "#6a58c8");

const SWIRL = svg(
  `<svg viewBox="0 0 100 100"><g fill="none" stroke="${GOLD}" stroke-width="4" stroke-linecap="round"><path d="M50 52 C50 44 60 44 60 52 C60 64 42 64 42 50 C42 34 66 34 68 52 C70 72 40 78 30 58"/><path d="M26 40 C18 40 16 28 26 26 C30 20 40 22 40 28"/><path d="M72 66 C82 68 86 80 76 84 C70 90 60 86 60 80"/><path d="M74 30 C80 24 90 28 88 36"/></g><g fill="${GOLD}"><circle cx="50" cy="52" r="3.5"/><circle cx="26" cy="31" r="3"/><circle cx="76" cy="77" r="3"/></g></svg>`,
  { size: 256 },
);

const EYE = animeEye({ iris: "#ffb21c", irisLight: "#fff08a", ink: INK, blush: "#ff8fb0" });

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "qilin" });

  // ---- skeleton -------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.02, -0.7], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.02, -0.7],
      [0, 1.08, -0.2],
      [0, 1.14, 0.35],
      [0, 1.16, 0.7],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  const chestJoint = spine.joints[spine.joints.length - 1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.16, 0.62],
      [0, 1.32, 0.82],
      [0, 1.5, 1.0],
      [0, 1.64, 1.12],
    ]),
    { parent: chestJoint, role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: neck.at(1),
    dir: [0, -0.25, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.6, 1.3], aim: [0, 1.5, 1.62], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.04, -0.85],
      [0, 1.12, -1.25],
      [0, 1.05, -1.65],
      [0, 0.84, -1.95],
    ]),
    { parent: hips, count: 4, role: "tail" },
  );

  // ---- body, neck, tail -----------------------------------------------------------------------------------
  const bodyTube = b.sweep(spine, (t) => [0.22 + 0.04 * t, 0.26 + 0.04 * t], {
    color: COAT,
    sectors: [[125, 235, BELLY]],
  });
  const neckTube = b.sweep(neck, [0.17, 0.14, 0.115, 0.1], { color: COAT, sectors: [[130, 230, BELLY]] });
  b.sweep(tail, [0.075, 0.05, 0.035, 0.03], { color: COAT });
  b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
    bone: chestJoint,
    at: [0, 1.12, 0.68],
    scale: [0.27, 0.3, 0.28],
  });

  // flank swirls
  for (const s of [1, -1]) {
    b.decal(bodyTube, SWIRL, { at: [s * 0.24, 1.12, 0.05], dir: [s, 0, 0], size: [0.42, 0.42] });
    b.decal(bodyTube, SWIRL, { at: [s * 0.24, 1.12, -0.5], dir: [s, 0, 0], size: [0.3, 0.3], roll: 90 });
  }

  // dorsal gold spikes
  b.along(bodyTube, 9, (at) => b.spike(at, at, 0.06, 0.018, { color: GOLD }));

  // collar and gem
  const neckSkin = b.surface(neckTube);
  const collar = neckSkin.loop(neck.at(0.3), { lift: 0.012 });
  b.sweep(collar, 0.022, { color: GOLD });
  const gemHit = neckSkin.around(neck.at(0.3).at).at(0, -8);
  if (gemHit) glow(b.stick(new THREE.SphereGeometry(0.035, 8, 6), TIP, gemHit, { embed: 0.3 }), 1.2);

  // ---- legs -----------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front
    const fPts = limb(
      [s * 0.2, 1.0, 0.58],
      [s * 0.2, 0.09, 0.62],
      [0.4, 0.34, 0.2],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const front = b.chain(`legF${side}`, fPts, {
      parent: chestJoint,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hoofF${side}`],
      role: "leg",
    });
    const fTube = b.sweep(front, [0.1, 0.075, 0.055, 0.04, 0.04], { color: LEG });
    // hind
    const hPts = limb(
      [s * 0.2, 0.98, -0.7],
      [s * 0.2, 0.09, -0.78],
      [0.42, 0.4, 0.26],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hind = b.chain(`legH${side}`, hPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `hoofH${side}`],
      role: "leg",
    });
    const hTube = b.sweep(hind, [0.13, 0.09, 0.06, 0.045, 0.04], { color: LEG });

    for (const [leg, tube, tag] of [
      [front, fTube, "F"],
      [hind, hTube, "H"],
    ] as const) {
      const tip = leg.tip!;
      const foot = tip.at;
      b.part(new THREE.CylinderGeometry(0.058, 0.075, 0.1, 8), HOOF, { bone: tip, at: [foot.x, 0.05, foot.z] });
      b.part(new THREE.TorusGeometry(0.066, 0.013, 5, 8), GOLD, {
        bone: tip,
        at: [foot.x, 0.098, foot.z],
        rotation: [90, 0, 0],
      });
      const cuff = b.surface(tube).loop(leg.at(0.86), { lift: 0.008 });
      b.sweep(cuff, 0.014, { color: GOLD });
      const cuff2 = b.surface(tube).loop(leg.at(0.5), { lift: 0.008 });
      b.sweep(cuff2, 0.01, { color: GOLD_D });
      // fetlock wisps
      const items = b.ring(leg.at(0.82), { count: 6, radius: 0.04, tilt: 20 }).items;
      b.cards(items, tag === "F" ? [WISP_A, WISP_C] : [WISP_A, WISP_D], {
        size: [0.07, 0.17],
        lean: 40,
        bend: 25,
        rng: rng(tag === "F" ? 11 : 12),
        vary: 0.25,
      });
    }

    // fins at elbow and hock
    const el = front.joints[1].at;
    b.extrude(
      [
        [0, 0],
        [0.14, 0.02],
        [0.08, 0.08],
        [0.2, 0.14],
        [0.05, 0.14],
        [0, 0.1],
      ],
      { at: [s * 0.29, el.y, el.z - 0.02], x: [0, 0, -1], thickness: 0.02, color: FINC, bone: front.joints[1] },
    );
    const hk = hind.joints[2].at;
    b.extrude(
      [
        [0, 0],
        [0.16, 0.02],
        [0.09, 0.09],
        [0.24, 0.17],
        [0.06, 0.16],
        [0, 0.11],
      ],
      { at: [s * 0.23, hk.y, hk.z - 0.03], x: [0, 0, -1], thickness: 0.02, color: FINC, bone: hind.joints[2] },
    );
  }

  // ---- head -----------------------------------------------------------------------------------------------
  const HEAD_C = V(0, 1.68, 1.22);
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), COAT, {
    bone: head,
    at: HEAD_C,
    scale: [0.12, 0.115, 0.17],
  });
  b.frustumBox([0, 1.64, 1.3], [0, 1.56, 1.66], [0.2, 0.17], [0.15, 0.11], { bone: head, color: COAT });
  b.part(new THREE.SphereGeometry(1, 8, 6), COAT, { bone: head, at: [0, 1.575, 1.665], scale: [0.068, 0.05, 0.05] });
  b.frustumBox([0, 1.5, 1.3], [0, 1.455, 1.6], [0.15, 0.06], [0.1, 0.04], { bone: jaw, color: BELLY });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.012, 5, 4), INK, { bone: head, at: [s * 0.03, 1.58, 1.71] });
    b.spike([s * 0.05, 1.53, 1.56], [0, -1, 0.1], 0.07, 0.014, { bone: head, color: FANG });
    b.spike([s * 0.04, 1.485, 1.52], [0, 1, 0.1], 0.05, 0.011, { bone: jaw, color: FANG });
    // whiskers
    for (const k of [0, 1]) {
      b.sweep(
        catmull([
          [s * 0.08, 1.56 - k * 0.02, 1.58],
          [s * (0.3 + k * 0.05), 1.5 - k * 0.04, 1.5],
          [s * (0.5 + k * 0.05), 1.62 - k * 0.1, 1.22],
          [s * (0.58 + k * 0.05), 1.5 - k * 0.14, 0.88],
        ]),
        [0.012, 0.004],
        { bone: head, color: k ? GOLD : CREAM },
      );
    }
    // brow
    b.sweep(
      catmull([
        [s * 0.04, 1.76, 1.31],
        [s * 0.09, 1.745, 1.26],
        [s * 0.115, 1.72, 1.2],
      ]),
      [0.02, 0.01],
      { bone: head, color: GOLD_D },
    );
    // ears
    b.extrude(
      [
        [0, 0],
        [0.05, 0.07],
        [0.03, 0.16],
        [0, 0.2, "sharp"],
        [-0.03, 0.14],
        [-0.04, 0.06],
      ],
      {
        at: [s * 0.1, 1.73, 1.1],
        x: [s, 0, 0],
        y: [s * 0.6, 1, -0.3],
        thickness: 0.016,
        smoothing: 1,
        color: EARC,
        bone: head,
      },
    );
    // antlers
    const beam = catmull([
      [s * 0.06, 1.77, 1.16],
      [s * 0.09, 1.92, 1.08],
      [s * 0.14, 2.06, 1.0],
      [s * 0.2, 2.2, 1.02],
      [s * 0.24, 2.32, 1.1],
    ]);
    b.sweep(beam, [0.034, 0.012], { bone: head, color: ANTLER, caps: { start: "flat", end: "point" } });
    for (const [at, ring] of [
      [0.12, 0.04],
      [0.4, 0.034],
      [0.7, 0.026],
    ] as const) {
      const p = beam.at(at);
      b.part(new THREE.TorusGeometry(ring, 0.009, 5, 8), GOLD, {
        bone: head,
        at: p,
        dir: beam.tangentAt(at),
        axis: "z",
      });
    }
    glow(b.part(new THREE.SphereGeometry(0.022, 6, 4), TIP, { bone: head, at: beam.at(1) }), 1.3);
    const tines: Array<[number, number[], number, number]> = [
      [0.22, [s * 0.7, 0.4, -0.9], 0.2, 0.022],
      [0.48, [s * 0.9, 0.5, 0.6], 0.24, 0.02],
      [0.7, [s * 0.5, 0.7, -0.8], 0.19, 0.017],
      [0.88, [s * 0.8, 0.6, 0.5], 0.15, 0.014],
    ];
    for (const [t, dv, len, r] of tines) {
      const base = beam.at(t);
      const d = V(dv[0], dv[1], dv[2]).normalize();
      const mid = base.clone().addScaledVector(d, len * 0.55).add(V(0, 0.03, 0));
      const tip = base.clone().addScaledVector(d, len).add(V(0, 0.07, 0));
      b.sweep(catmull([base, mid, tip]), [r, 0.004], {
        bone: head,
        color: ANTLER,
        caps: { start: "flat", end: "point" },
      });
      glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), TIP, { bone: head, at: tip }), 1.2);
    }
  }
  glow(b.part(new THREE.SphereGeometry(0.022, 8, 6), TIP, { bone: head, at: [0, 1.745, 1.365] }), 1.3);

  // eyes
  const skullSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSkin.around(HEAD_C).at(s * 50, 8);
    if (hit) b.decal(skullSkin, EYE, { at: hit, size: [0.065, 0.088], mirror: s > 0 });
  }

  // cheek ruff and goatee
  const cheeks = skullSkin.scatter(18, {
    rng: rng(5),
    minDist: 0.05,
    filter: (h) => Math.abs(h.at.x) > 0.07 && h.at.z < 1.24 && h.n.y < 0.4,
  });
  b.cards(cheeks, [WISP_A, WISP_B], { size: [0.08, 0.18], lean: 65, bend: 25, rng: rng(6), vary: 0.25 });
  b.sweep(
    catmull([
      [0, 1.46, 1.5],
      [0, 1.3, 1.5],
      [0, 1.12, 1.42],
      [0, 0.98, 1.36],
    ]),
    [0.026, 0.006],
    { bone: jaw, color: CREAM },
  );
  b.cards(
    [
      frame([0, 1.46, 1.46], [0, -1, 0.3]),
      frame([0.03, 1.46, 1.42], [0.25, -1, 0.1]),
      frame([-0.03, 1.46, 1.42], [-0.25, -1, 0.1]),
    ],
    [WISP_A, WISP_C],
    { size: [0.07, 0.2], bone: jaw, rng: rng(8) },
  );

  // ---- cloud mane ------------------------------------------------------------------------------------------
  const maneFrames: ReturnType<typeof neckTube.at>[] = [];
  for (const ang of [0, 40, -40, 80, -80]) {
    for (let i = 0; i < 9; i++) maneFrames.push(neckTube.at(0.04 + i * 0.11, ang));
  }
  b.cards(maneFrames, [WISP_A, WISP_A, WISP_B, WISP_C, WISP_D], {
    size: [0.2, 0.3],
    lean: 55,
    bend: 30,
    cross: true,
    vary: 0.3,
    spin: 15,
    rng: rng(21),
  });
  const chestFrames: ReturnType<typeof neckTube.at>[] = [];
  for (const ang of [180, 150, 210]) for (let i = 0; i < 4; i++) chestFrames.push(neckTube.at(0.05 + i * 0.15, ang));
  b.cards(chestFrames, [WISP_A, WISP_C], { size: [0.14, 0.24], lean: 60, bend: 25, vary: 0.25, rng: rng(22) });
  const backFrames: ReturnType<typeof bodyTube.at>[] = [];
  for (let i = 0; i < 10; i++) backFrames.push(bodyTube.at(0.05 + i * 0.095, 0));
  b.cards(backFrames, [WISP_A, WISP_D, WISP_B], {
    size: [0.12, 0.2],
    lean: 70,
    bend: 25,
    cross: true,
    vary: 0.25,
    rng: rng(23),
  });
  const flankFrames: ReturnType<typeof bodyTube.at>[] = [];
  for (const ang of [70, -70]) for (const t of [0.12, 0.4, 0.72, 0.95]) flankFrames.push(bodyTube.at(t, ang));
  b.cards(flankFrames, [WISP_C, WISP_A, WISP_B], {
    size: [0.2, 0.3],
    lean: 80,
    bend: 30,
    vary: 0.25,
    rng: rng(24),
  });

  // tail tuft
  b.cards(b.ring(tail.at(0.78), { count: 8, radius: 0.03, tilt: 30 }).items, [WISP_A, WISP_B, WISP_C, WISP_D], {
    size: [0.16, 0.5],
    lean: 25,
    bend: 35,
    vary: 0.2,
    rng: rng(31),
  });
  b.cards(b.ring(tail.at(1), { count: 7, radius: 0.02, tilt: 55 }).items, [WISP_A, WISP_C, WISP_B], {
    size: [0.2, 0.55],
    lean: 10,
    bend: 30,
    vary: 0.2,
    rng: rng(32),
  });

  return b.root;
}
