// Nine-tailed kitsune: an apricot-and-white spirit fox with a fan of nine plumed tails, each tipped with a
// floating blue-violet spirit flame, gold trim, a shimenawa collar with paper shide, and hovering hitodama.
// High-fantasy anime: cel-shaded paints with hard hue-shifted shadows, big anime eyes, red kumadori face marks,
// gold ornaments, glowing flames.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A spirit fox with a fan of nine plumed tails tipped with floating blue and violet flames, gold trim, a shimenawa collar and hovering fox-fires, in cel-shaded high-fantasy anime style.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const WHITE = "#fff6ea";
const BELLY = "#f3dccb";
const APRICOT = "#ffc98a";
const RED = "#e4473a";
const SOCK = "#4a2f5c";
const GOLD = "#f2bd45";
const GOLD_D = "#c98a1e";
const CLAW = "#f3ead8";
const ROPE = "#d83a34";
const NOSE = "#3a2250";

const BASE = furEdge(APRICOT, furEdge(WHITE, BELLY, { level: -0.2, teeth: 0.22, period: 0.03 }), {
  level: 0.5,
  teeth: 0.18,
  period: 0.04,
});
const COAT = cel(BASE);
const LEGP = cel(paint((p) => (p.y < 0.2 + 0.035 * zigzag((p.x + p.z) / 0.03) ? SOCK : BASE)));
const TAILP = cel(furEdge(WHITE, BELLY, { level: -0.5, teeth: 0.2, period: 0.03 }));
const TIPP = cel(RED);
const EARP = cel(paint((_p, _n, s) => (s[1] > 0.17 ? SOCK : APRICOT)));
const INNERP = cel("#ff9c8f");
const SOCKP = cel(SOCK);

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const TUFT = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 63 C3 46 5 20 16 1 C27 20 29 46 16 63Z" fill="#ffffff"/>
  <path d="M16 60 C14 44 14 24 16 8" stroke="#d6d6d6" stroke-width="3" fill="none"/></svg>`,
  { size: 128 },
);

const flameTexture = (outer: string, mid: string, core: string) =>
  svg(
    `<svg viewBox="0 0 56 80">
    <path d="M27 79 C8 68 4 47 16 31 C18 40 22 42 24 37 C22 23 30 11 32 1 C42 20 54 45 46 63 C42 73 35 79 27 79Z" fill="${outer}"/>
    <path d="M27 76 C14 68 12 52 21 40 C23 46 26 47 28 43 C28 33 32 25 34 17 C41 32 45 48 40 61 C37 70 32 76 27 76Z" fill="${mid}"/>
    <path d="M27 74 C20 68 20 58 26 50 C28 55 30 55 32 52 C35 58 36 66 32 71 C30 74 29 74 27 74Z" fill="${core}"/>
  </svg>`,
    { size: 192 },
  );
const FLAME_B = flameTexture("#2f6bff", "#4fdcff", "#f0ffff");
const FLAME_V = flameTexture("#8a4dff", "#c98bff", "#fbeaff");

const SHIDE = svg(
  `<svg viewBox="0 0 32 64"><path d="M6 0 H26 V14 L12 24 L26 34 V46 L12 58 L18 64 L6 62Z" fill="#ffffff" stroke="#b9b9c8" stroke-width="2"/></svg>`,
  { size: 128 },
);

const SWIRL = svg(
  `<svg viewBox="0 0 100 100">
  <path d="M20 72 C8 40 40 8 66 24 C88 38 72 68 50 60 C37 55 42 38 55 41" stroke="#f2bd45" stroke-width="13" stroke-linecap="round" fill="none"/>
  <path d="M20 72 C8 40 40 8 66 24 C88 38 72 68 50 60 C37 55 42 38 55 41" stroke="#e4473a" stroke-width="7" stroke-linecap="round" fill="none"/>
  <path d="M70 82 C80 76 90 80 94 90 C84 92 76 90 70 82Z" fill="#e4473a" stroke="#f2bd45" stroke-width="3"/>
  <circle cx="12" cy="86" r="5" fill="#f2bd45"/><circle cx="30" cy="90" r="3.5" fill="#f2bd45"/>
  </svg>`,
  { size: 256 },
);

const BROW = svg(
  `<svg viewBox="0 0 60 90"><path d="M30 4 C46 30 50 52 30 86 C10 52 14 30 30 4Z" fill="#e4473a" stroke="#f2bd45" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="30" cy="52" r="6" fill="#f2bd45"/></svg>`,
  { size: 192 },
);

const CHEEK = svg(
  `<svg viewBox="0 0 80 60"><path d="M4 8 C30 6 52 20 74 52" stroke="#e4473a" stroke-width="8" stroke-linecap="round" fill="none"/>
  <path d="M10 24 C28 24 42 34 56 52" stroke="#e4473a" stroke-width="6" stroke-linecap="round" fill="none"/></svg>`,
  { size: 192 },
);

const EAR_OUT: OutlinePoint[] = [
  [-0.06, 0],
  [0.06, 0],
  [0.045, 0.1],
  [0, 0.24, "sharp"],
  [-0.045, 0.1],
];
const EAR_IN: OutlinePoint[] = [
  [-0.035, 0.025],
  [0.035, 0.025],
  [0.025, 0.1],
  [0, 0.18, "sharp"],
  [-0.025, 0.1],
];

export default function build() {
  const b = createBuilder({ name: "nineTailedKitsune" });
  const R = rng(11);

  // ------------------------------------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.62, -0.3], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.62, -0.3],
      [0, 0.66, 0],
      [0, 0.7, 0.3],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.7, 0.3],
      [0, 0.85, 0.42],
      [0, 0.98, 0.52],
    ]),
    { parent: spine.joints[1], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.98, 0.52], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.96, 0.64], aim: [0, 0.945, 0.84], role: "jaw" });

  // ------------------------------------------------------------------------------------------------ body
  const body = b.loft(
    [
      { at: [0, 0.64, -0.38], w: 0.26, h: 0.28 },
      { at: [0, 0.65, -0.15], w: 0.3, h: 0.3 },
      { at: [0, 0.68, 0.1], w: 0.3, h: 0.3 },
      { at: [0, 0.68, 0.3], w: 0.32, h: 0.36 },
      { at: [0, 0.7, 0.4], w: 0.2, h: 0.26 },
    ],
    { bone: spine, color: COAT, name: "body" },
  );
  const neckTube = b.sweep(neck, [0.115, 0.085], { color: COAT, name: "neckTube" });

  // flank swirls (red and gold brush marks)
  for (const s of [1, -1]) {
    b.decal(body, SWIRL, { at: [s * 0.15, 0.7, 0.2], dir: [s, 0, 0], size: [0.2, 0.2], mirror: s < 0 });
    b.decal(body, SWIRL, { at: [s * 0.15, 0.66, -0.22], dir: [s, 0, 0], size: [0.22, 0.22], mirror: s < 0 });
  }

  // haunches and shoulders
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      bone: hips,
      at: [s * 0.13, 0.57, -0.3],
      scale: [0.095, 0.15, 0.17],
    });
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      bone: spine.joints[1],
      at: [s * 0.12, 0.58, 0.28],
      scale: [0.085, 0.14, 0.12],
    });
  }

  // ------------------------------------------------------------------------------------------------ legs
  const paw = (x: number, z: number, joint: Joint) => {
    b.part(new THREE.SphereGeometry(1, 10, 7), LEGP, { bone: joint, at: [x, 0.03, z + 0.03], scale: [0.045, 0.03, 0.07] });
    for (const k of [-1, 0, 1]) {
      const tz = z + 0.085 - Math.abs(k) * 0.008;
      b.part(new THREE.SphereGeometry(0.019, 7, 5), LEGP, { bone: joint, at: [x + k * 0.026, 0.021, tz] });
      b.spike([x + k * 0.026, 0.017, tz + 0.012], [0, -0.25, 1], 0.03, 0.006, { color: CLAW, bone: joint, sides: 5 });
    }
  };
  const bracelet = (pt: ReturnType<typeof b.chain>["at"] extends (t: number) => infer P ? P : never, r: number) => {
    b.part(new THREE.TorusGeometry(r, 0.008, 5, 12), GOLD, { at: pt, dir: pt, axis: "z" });
  };
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const fpts = limb([s * 0.11, 0.6, 0.3], [s * 0.11, 0.045, 0.36], [0.3, 0.3], [0, 0, -1]);
    const front = b.chain(`legF${S}`, fpts, {
      parent: spine.joints[1],
      names: [`shoulder${S}`, `elbow${S}`, `pawF${S}`],
      role: "leg",
    });
    b.sweep(front, [0.075, 0.055, 0.04, 0.032, 0.03], { color: LEGP, name: `legF${S}` });
    bracelet(front.at(0.8), 0.044);
    paw(s * 0.11, 0.36, front.joints[front.joints.length - 1]);

    const hpts = limb(
      [s * 0.12, 0.6, -0.3],
      [s * 0.12, 0.045, -0.34],
      [0.27, 0.27, 0.14],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hind = b.chain(`legH${S}`, hpts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `pawH${S}`],
      role: "leg",
    });
    b.sweep(hind, [0.095, 0.075, 0.045, 0.032, 0.03], { color: LEGP, name: `legH${S}` });
    bracelet(hind.at(0.86), 0.042);
    paw(s * 0.12, -0.34, hind.joints[hind.joints.length - 1]);
  }

  // ------------------------------------------------------------------------------------------------ head
  const HC = [0, 1.03, 0.6];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), COAT, {
    bone: head,
    at: HC,
    scale: [0.105, 0.09, 0.115],
    name: "skull",
  });
  b.sweep(
    [
      [0, 1.0, 0.66],
      [0, 0.98, 0.86],
    ],
    (t): [number, number] => [0.05 - 0.034 * t, 0.04 - 0.022 * t],
    { color: COAT, bone: head, name: "snout" },
  );
  b.sweep(
    [
      [0, 0.958, 0.64],
      [0, 0.952, 0.82],
    ],
    (t): [number, number] => [0.04 - 0.022 * t, 0.022 - 0.008 * t],
    { color: cel(WHITE), bone: jaw, name: "lowerJaw" },
  );
  b.part(new THREE.SphereGeometry(0.018, 8, 6), NOSE, { bone: head, at: [0, 0.985, 0.865], scale: [1, 0.8, 0.9] });
  for (const s of [1, -1]) {
    b.rod([s * 0.004, 0.962, 0.84], [s * 0.04, 0.958, 0.7], 0.0035, { color: INK, bone: head, sides: 4 });
    b.spike([s * 0.022, 0.958, 0.8], [0, -1, 0.1], 0.022, 0.005, { color: CLAW, bone: head, sides: 5 });
    for (const k of [0, 1, 2]) {
      b.sweep(
        catmull([
          [s * 0.04, 0.99 + k * 0.004, 0.8],
          [s * 0.1, 0.99 + 0.015 * (k - 1), 0.78],
          [s * 0.17, 0.98 + 0.04 * (k - 1) - 0.02, 0.72],
        ]),
        [0.003, 0.0008],
        { color: "#fffaf0", bone: head, sides: 4, caps: { start: "flat", end: "point" } },
      );
    }
  }

  // eyes, face marks, forehead jewel
  const EYE = animeEye({ iris: "#ffb829" });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = skin.around(HC).at(s * 50, 3)!;
    b.decal(skin, EYE, { at: eyeHit, size: [0.044, 0.06], mirror: s > 0 });
    const cheekHit = skin.around(HC).at(s * 64, -22)!;
    b.decal(skin, CHEEK, { at: cheekHit, size: [0.07, 0.052], mirror: s < 0 });
  }
  const browHit = skin.around(HC).at(0, 40)!;
  b.decal(skin, BROW, { at: browHit, size: [0.05, 0.075] });
  const gemHit = skin.around(HC).at(0, 62)!;
  b.stick(new THREE.SphereGeometry(0.02, 8, 6), GOLD, gemHit, { embed: 0.3 });
  glow(b.stick(new THREE.SphereGeometry(0.012, 7, 5), "#ff5a4a", gemHit.moved([0, 0.012, 0]), { embed: 0.3 }), 1.3);

  // ears
  for (const s of [1, -1]) {
    const E = new THREE.Vector3(s * 0.07, 1.085, 0.56);
    const Y = new THREE.Vector3(s * 0.28, 1, -0.25).normalize();
    const X = new THREE.Vector3(1, 0, 0).addScaledVector(Y, -Y.x).normalize();
    const T = X.clone().cross(Y);
    b.extrude(EAR_OUT, {
      at: E,
      x: X.toArray(),
      y: Y.toArray(),
      thickness: 0.026,
      bevel: 0.006,
      smoothing: 1,
      color: EARP,
      bone: head,
      name: `ear${s > 0 ? "L" : "R"}`,
    });
    b.extrude(EAR_IN, {
      at: E.clone().addScaledVector(T, 0.012),
      x: X.toArray(),
      y: Y.toArray(),
      thickness: 0.016,
      smoothing: 1,
      color: INNERP,
      bone: head,
    });
    b.part(new THREE.TorusGeometry(0.014, 0.0045, 5, 10), GOLD, {
      bone: head,
      at: E.clone().addScaledVector(X, s * 0.05).addScaledVector(Y, 0.025),
      dir: T.toArray(),
      axis: "z",
    });
  }

  // cheek ruff, neck ruff, chest and rump fur
  const tuftCards = (
    hits: ReturnType<typeof skin.scatter>,
    size: [number, number],
    flow: number[],
    tint: string,
    bone?: Joint,
  ) =>
    b.cards(hits, TUFT, { size, lean: 70, bend: 25, vary: 0.25, rng: R, color: tint, flow, bone, spin: 15 });
  tuftCards(
    skin.scatter(26, { rng: R, minDist: 0.03, filter: (h) => Math.abs(h.n.x) > 0.55 && h.at.z < 0.64 && h.at.y < 1.06 }),
    [0.05, 0.1],
    [0, -0.35, -1],
    "#fff2e0",
  );
  tuftCards(
    b.surface(neckTube).scatter(50, { rng: R, minDist: 0.035 }),
    [0.055, 0.12],
    [0, -0.4, -1],
    "#fff4e6",
  );
  tuftCards(
    b.surface(body).scatter(48, { rng: R, minDist: 0.04, filter: (h) => h.at.z > 0.2 && h.n.y < 0.7 }),
    [0.055, 0.12],
    [0, -0.6, -1],
    "#fff4e6",
  );
  tuftCards(
    b.surface(body).scatter(30, { rng: R, minDist: 0.05, filter: (h) => h.at.z < -0.2 && h.n.y > 0.1 }),
    [0.05, 0.1],
    [0, -0.3, -1],
    "#ffe6c0",
  );

  // shimenawa collar: red rope, gold beads, paper shide and a bell
  const neckSurf = b.surface(neckTube);
  const loop = neckSurf.loop(neck.joints[1], { lift: 0.012 });
  const collarBone = neck.joints[1];
  b.sweep(loop, 0.012, { color: ROPE, bone: collarBone, name: "collarRope" });
  const samples: THREE.Vector3[] = [];
  b.along(loop, 14, (at) => {
    samples.push(at.at.clone());
    return b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLD, { at, bone: collarBone });
  });
  const centre = new THREE.Vector3();
  for (const p of samples) centre.add(p);
  centre.multiplyScalar(1 / samples.length);
  const hanging = samples.filter((p) => p.clone().sub(centre).dot(new THREE.Vector3(0, -0.3, 1)) > 0.03);
  b.cards(
    hanging.map((p) => frame(p, [0, 1, 0])),
    SHIDE,
    { size: [0.04, 0.1], lean: 180, flow: [0, 0, 1], bone: collarBone, color: "#ffffff" },
  );
  const bellHit = neckSurf.around([0, 0.84, 0.42]).at(0, -25);
  if (bellHit) {
    b.stick(new THREE.SphereGeometry(0.03, 10, 7), GOLD, bellHit.moved([0, 0.02, 0]), { embed: 0.1, bone: collarBone });
    b.stick(new THREE.BoxGeometry(0.036, 0.004, 0.004), GOLD_D, bellHit.moved([0, 0.05, 0]), { embed: 0.1, bone: collarBone });
  }

  // ------------------------------------------------------------------------------------------------ flames
  const flame = (p: number[] | THREE.Vector3, h: number, tex: typeof FLAME_B, bone: Joint) =>
    glow(
      b.cards([frame(p, [0, 1, 0])], tex, { size: [h * 0.7, h], cross: true, bone, sink: 0.05, vary: 0.1, rng: R }),
      1.2,
    );

  // ------------------------------------------------------------------------------------------------ nine tails
  const tailR = (t: number) => 0.015 + 0.055 * Math.sin(Math.PI * Math.pow(t, 0.62)) + 0.02 * (1 - t);
  for (let i = 0; i < 9; i++) {
    const theta = ((i - 4) * 20 * Math.PI) / 180;
    const L = 0.95 - 0.015 * Math.abs(i - 4) * 2;
    const sn = Math.sin(theta);
    const d = new THREE.Vector3(sn * 0.95, Math.cos(theta) * 0.72, -0.5).normalize();
    const B = new THREE.Vector3(sn * 0.05, 0.7 + Math.cos(theta) * 0.03, -0.42);
    const P1 = B.clone().addScaledVector(d, L * 0.33);
    const P2 = B.clone().addScaledVector(d, L * 0.68).add(new THREE.Vector3(sn * 0.05, 0.03, 0));
    const P3 = B.clone().addScaledVector(d, L).add(new THREE.Vector3(sn * 0.12, 0.16 * L, 0.05));
    const tail = b.chain(`tail${i + 1}`, catmull([B, P1, P2, P3]), {
      parent: hips,
      count: 4,
      names: (k: number) => `tail${i + 1}_${k + 1}`,
      role: "tail",
    });
    const tube = b.sweep(tail, tailR, {
      bands: [
        [0.8, TAILP],
        [1, TIPP],
      ],
      name: `tail${i + 1}`,
    });
    const tip = tail.at(1).at.clone();
    b.cards(
      b.surface(tube).scatter(24, { rng: R, minDist: 0.05, filter: (h) => h.at.distanceTo(tip) > 0.15 }),
      TUFT,
      { size: [0.05, 0.1], lean: 65, bend: 20, vary: 0.3, rng: R, color: "#fff2e2", flow: d.toArray(), spin: 12 },
    );
    const ringPt = tail.at(0.2);
    b.part(new THREE.TorusGeometry(tailR(0.2) + 0.006, 0.007, 5, 14), GOLD, { at: ringPt, dir: ringPt, axis: "z" });
    const tipJoint = tail.joints[tail.joints.length - 1];
    const tex = i % 2 === 0 ? FLAME_B : FLAME_V;
    flame([tip.x, tip.y + 0.03, tip.z], 0.3, tex, tipJoint);
    flame([tip.x + 0.05, tip.y, tip.z + 0.02], 0.17, tex === FLAME_B ? FLAME_V : FLAME_B, tipJoint);
    flame([tip.x - 0.05, tip.y - 0.01, tip.z - 0.02], 0.15, tex, tipJoint);
  }

  // hovering fox-fires around the kitsune
  const orbs: Array<[number[], number, typeof FLAME_B]> = [
    [[0.55, 0.9, 0.5], 0.2, FLAME_B],
    [[-0.5, 0.6, 0.7], 0.17, FLAME_V],
    [[0.7, 0.35, -0.05], 0.16, FLAME_V],
    [[-0.75, 0.75, -0.1], 0.2, FLAME_B],
    [[0.35, 1.4, 0.05], 0.17, FLAME_V],
    [[-0.3, 1.3, 0.2], 0.15, FLAME_B],
    [[0.2, 0.3, 0.85], 0.13, FLAME_B],
  ];
  for (const [p, h, tex] of orbs) {
    flame(p, h, tex, hips);
    glow(b.part(new THREE.SphereGeometry(h * 0.1, 6, 4), "#e8fcff", { bone: hips, at: [p[0], p[1] + h * 0.18, p[2]] }), 1.4);
  }

  return b.root;
}
