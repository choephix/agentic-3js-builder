import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import type { Joint } from "../src/skeleton";
import type { Fill } from "../src/context";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { limb } from "../src/ik";
import { paint, scales, spots } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Harpy Eagle",
  description:
    "A harpy eagle in League of Legends style: crest raised, wings spread wide, saturated teal-slate plumage with black bars, gold talons and collar, cyan magic in the eyes, the breast sigil and the wingtip feathers.",
  style: "League of Legends",
  commit: "b816db2",
};

type V = [number, number, number];

// Piecewise-linear profile keyed by source t.
const prof = (t: number, keys: [number, number][]): number => {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return v0 + (v1 - v0) * ((t - t0) / (t1 - t0));
    }
  }
  return keys[keys.length - 1][1];
};

// A flight feather lying flat: outline x runs along the feather from its root, y across it.
// x0 starts the outline part way along (used for the glowing tip sliver).
function featherOutline(L: number, W: number, x0 = 0): OutlinePoint[] {
  const hw = (u: number) =>
    (W / 2) * (u < 0.35 ? 0.62 + (0.38 * u) / 0.35 : Math.pow(Math.max(0, (1 - u) / 0.65), 0.75));
  const N = 3;
  const pts: OutlinePoint[] = [];
  for (let i = 0; i <= N; i++) {
    const x = x0 + ((L - x0) * i) / (N + 1);
    pts.push([x, -hw(x / L)]);
  }
  pts.push([L, 0, "sharp"]);
  for (let i = N; i >= 0; i--) {
    const x = x0 + ((L - x0) * i) / (N + 1);
    pts.push([x, hw(x / L)]);
  }
  return pts;
}

// A raised crest blade, drawn in the blade's own plane: x forward, y up its length, tip leaning back.
function crestOutline(L: number, w: number): OutlinePoint[] {
  return [
    [-w, 0],
    [w, 0],
    [w * 0.92, L * 0.45],
    [w * 0.6, L * 0.8],
    [-0.03, L, "sharp"],
    [-w * 0.5 - 0.008, L * 0.8],
    [-w * 0.92, L * 0.45],
  ];
}

// Feather card: a soft greyscale plume with a shaft, so each part's colour tints it.
const FEATHER = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
    <path d="M16 1 C27 12 29 40 16 63 C3 40 5 12 16 1 Z" fill="#ffffff"/>
    <path d="M16 4 Q15 34 16 60" stroke="#8a8a8a" stroke-width="1.6" fill="none"/>
    <path d="M9 40 Q16 44 23 40" stroke="#b0b0b0" stroke-width="1.8" fill="none"/>
  </svg>`,
  { size: 192 },
);

// Arcane sigil for the breast: cyan rings, a hexagram and rune strokes, glowing via kits/glow.
const SIGIL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="28" fill="none" stroke="#48f4ff" stroke-width="2.5"/>
    <circle cx="32" cy="32" r="21" fill="none" stroke="#48f4ff" stroke-width="1.6"/>
    <path d="M32 6 L56 46 L8 46 Z M32 58 L8 18 L56 18 Z" fill="none" stroke="#48f4ff" stroke-width="2"/>
    <path d="M32 14 L32 50 M24 24 L32 32 L40 24 M24 40 L32 32 L40 40" fill="none" stroke="#48f4ff" stroke-width="2.2"/>
  </svg>`,
  { size: 256 },
);

// ---- palette: teal-slate plumage, cream underside, black bars and bib, gold trim, cyan magic
const SLATE = "#2f6480";
const SLATE_D = "#1d4358";
const SLATE_L = "#4f8aa0";
const CREAM = "#f1e7cf";
const BAR = "#252c34";
const INK = "#15181d";
const HEAD = "#cfd7db";
const CREST = "#6f97a8";
const GOLD = "#e9b64c";
const GOLD_D = "#a9762a";
const CERE = "#9fb3bd";
const BEAK = "#2a2f36";
const BEAK_L = "#3e444c";
const TOE = "#e7c25a";
const CYAN = "#48f4ff";

const torsoPaint = paint((p, n) => {
  if (n.y > 0.35) return SLATE; // back
  if (n.y < -0.3) return CREAM; // belly
  if (n.z > 0.45 && p.y > 0.6) return INK; // black bib
  if (n.z > 0.1 || n.y < -0.1) return Math.floor(p.y / 0.03) % 2 === 0 ? CREAM : BAR; // breast bars
  return SLATE_L; // flanks
});

const headPaint = paint((p, n) => {
  if (n.z > 0.3 && p.y > 0.87 && p.y < 0.945 && Math.abs(p.x) < 0.08) return INK; // black facial mask
  if (n.y > 0.5) return SLATE_L;
  return HEAD;
});

const crestPaint = paint((_p, _n, s) => (s[1] > 0.11 ? INK : CREST)); // black crest tips
const wingSkin = paint((_p, _n, s) => (Math.floor(s[1] * 5) % 2 === 0 ? SLATE_D : "#24566e"));
const primaryPaint = paint((_p, _n, s) => (Math.floor(s[0] / 0.045) % 2 === 0 ? SLATE_D : SLATE_L));
const secondaryPaint = paint((_p, _n, s) => (Math.floor(s[0] / 0.05) % 2 === 0 ? SLATE : CREST));
const tailPaint = paint((_p, _n, s) => (s[0] > 0.05 && Math.floor(s[0] / 0.035) % 2 === 0 ? INK : CREST));
const trouser = spots(CREAM, INK, { size: 0.04, amount: 0.3 });
const tarsus = scales(GOLD, GOLD_D, { size: 0.012 });
const legPaint = paint((_p, _n, s) => (s[0] < 0.5 ? trouser : tarsus));

export default function build() {
  const b = createBuilder({ name: "harpyEagle" });

  // Flight or tail feather lying flat along direction d, its chord horizontal, so the thickness is up.
  // `lift` stacks shingles apart so neighbours and the wing skin never z-fight.
  const feather = (
    bone: Joint,
    base: THREE.Vector3,
    d: THREE.Vector3,
    L: number,
    W: number,
    color: Fill,
    x0 = 0,
    lift = 0,
  ) =>
    b.extrude(featherOutline(L, W, x0), {
      at: [base.x, base.y + lift, base.z],
      x: d,
      y: new THREE.Vector3(0, 1, 0).cross(d).normalize(),
      thickness: 0.008,
      color,
      bone,
    });

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 0.47, -0.03], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.42, -0.16],
      [0, 0.47, -0.03],
      [0, 0.55, 0.09],
      [0, 0.63, 0.21],
      [0, 0.71, 0.29],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.7, 0.28],
      [0, 0.78, 0.33],
      [0, 0.85, 0.35],
    ]),
    { parent: spine.joints[3], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.9, 0.36], dir: [0, 0.25, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.885, 0.4], dir: [0, -0.15, 1], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.42, -0.16],
      [0, 0.36, -0.32],
      [0, 0.29, -0.5],
      [0, 0.25, -0.63],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );

  // ---- body: a deep, round-breasted barrel
  const RX: [number, number][] = [
    [0, 0.07],
    [0.25, 0.13],
    [0.6, 0.15],
    [0.85, 0.12],
    [1, 0.07],
  ];
  const RY: [number, number][] = [
    [0, 0.08],
    [0.25, 0.14],
    [0.6, 0.16],
    [0.85, 0.13],
    [1, 0.07],
  ];
  const torso = b.sweep(spine, (t): [number, number] => [prof(t, RX), prof(t, RY)], { color: torsoPaint });
  b.sweep(neck, (t) => 0.075 - 0.015 * t, { color: HEAD });
  b.sweep(tail, (t) => 0.03 - 0.014 * t, { color: SLATE_D });

  // Gold torque where the neck leaves the chest.
  b.part(new THREE.TorusGeometry(0.085, 0.008, 6, 16), GOLD, {
    bone: neck.joints[0],
    at: [0, 0.75, 0.3],
    axis: "z",
    dir: [0, 0.92, 0.38],
  });

  // Glowing arcane sigil on the breast, kept clear of the feather cards.
  const breast = b.surface(torso).nearest([0, 0.6, 0.2]);
  glow(b.decal(torso, SIGIL, { at: breast, size: [0.13, 0.13], lift: 0.002 }), 1.2);

  // Breast and back feather cards that shingle over the torso.
  const chestHits = b.surface(torso).scatter(40, {
    rng: rng(21),
    minDist: 0.034,
    filter: (h) =>
      h.n.z > 0.35 && h.at.y > 0.5 && h.at.y < 0.7 && !(Math.abs(h.at.x) < 0.08 && h.at.y > 0.52 && h.at.y < 0.68),
  });
  b.cards(chestHits, FEATHER, {
    size: [0.05, 0.08],
    lean: 60,
    flow: [0, -1, 0.15],
    color: CREAM,
    vary: 0.15,
    rng: rng(22),
  });
  const backHits = b.surface(torso).scatter(40, {
    rng: rng(31),
    minDist: 0.04,
    filter: (h) => h.n.y > 0.45,
  });
  b.cards(backHits, FEATHER, { size: [0.06, 0.09], lean: 25, color: SLATE_L, vary: 0.15, rng: rng(32) });

  // ---- head
  b.part(new THREE.SphereGeometry(0.088, 16, 12), headPaint, {
    bone: head,
    at: [0, 0.9, 0.36],
    scale: [0.95, 1, 1.08],
  });
  for (const s of [1, -1]) {
    const iris = b.part(new THREE.SphereGeometry(0.02, 10, 8), CYAN, { bone: head, at: [s * 0.05, 0.908, 0.44] });
    glow(iris, 1.4);
    b.part(new THREE.SphereGeometry(0.009, 8, 6), INK, { bone: head, at: [s * 0.05, 0.908, 0.457] });
    b.part(new THREE.TorusGeometry(0.026, 0.0055, 6, 14), GOLD, { bone: head, at: [s * 0.05, 0.908, 0.438] });
    // dark brow ridge above the eye
    b.sweep(
      catmull([
        [s * 0.03, 0.94, 0.4],
        [s * 0.05, 0.948, 0.43],
        [s * 0.075, 0.94, 0.425],
      ]),
      0.009,
      { bone: head, color: INK },
    );
  }
  b.part(new THREE.SphereGeometry(0.036, 10, 8), CERE, { bone: head, at: [0, 0.91, 0.42], scale: [1.15, 0.85, 0.8] });
  b.sweep(
    catmull([
      [0, 0.915, 0.395],
      [0, 0.922, 0.455],
      [0, 0.91, 0.515],
      [0, 0.875, 0.545],
      [0, 0.836, 0.52],
    ]),
    (t): [number, number] => [0.032 * (1 - 0.7 * t) + 0.005, 0.036 * (1 - 0.78 * t) + 0.004],
    { bone: head, color: BEAK, sides: 8 },
  );
  b.sweep(
    catmull([
      [0, 0.888, 0.395],
      [0, 0.88, 0.465],
      [0, 0.858, 0.495],
      [0, 0.844, 0.475],
    ]),
    (t): [number, number] => [0.02 * (1 - 0.6 * t) + 0.004, 0.014 * (1 - 0.6 * t) + 0.004],
    { bone: jaw, color: BEAK_L, sides: 8 },
  );

  // Raised double crest: seven blades stand up from the crown and lean back.
  for (let i = -3; i <= 3; i++) {
    const a = i * 0.14;
    const L = 0.17 - 0.03 * Math.abs(i);
    const base: V = [i * 0.016, 0.952 - 0.01 * Math.abs(i), 0.3];
    b.extrude(crestOutline(L, 0.024), {
      at: base,
      x: [0, 0, 1],
      y: [Math.sin(a), Math.cos(a), 0],
      thickness: 0.01,
      bevel: 0.003,
      smoothing: 1,
      color: crestPaint,
      bone: head,
    });
  }
  b.part(new THREE.SphereGeometry(0.02, 8, 6), GOLD, { bone: head, at: [0, 0.93, 0.3] });

  // ---- wings, spread wide with the tips lifted
  const SH: V = [0.09, 0.67, 0.14];
  const EL: V = [0.27, 0.74, 0.08];
  const WR: V = [0.51, 0.82, -0.03];
  const FT: V = [0.77, 0.92, -0.17];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pm = (p: V): V => [s * p[0], p[1], p[2]];
    const wing = b.chain(`wing${side}`, catmull([pm(SH), pm(EL), pm(WR), pm(FT)]), {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `handTip${side}`],
      role: "wing",
    });
    b.sweep(wing, (t) => 0.04 - 0.024 * t, { color: SLATE_D });

    // Gold cuff round the wrist, lying across the arm.
    const wristDir = new THREE.Vector3(...pm(WR)).sub(new THREE.Vector3(...pm(EL)));
    b.part(new THREE.TorusGeometry(0.034, 0.007, 6, 14), GOLD, {
      bone: wing.joints[2],
      at: pm(WR),
      axis: "z",
      dir: wristDir,
    });

    // The trailing edge of the wing runs from the body through the secondary and primary tips.
    const trailing: V[] = [pm([0.1, 0.62, 0.0])];

    // Secondaries along the forearm.
    for (let j = 0; j < 7; j++) {
      const t = 0.15 + j * 0.12;
      const base = new THREE.Vector3(...pm(EL)).lerp(new THREE.Vector3(...pm(WR)), t);
      const d = new THREE.Vector3(s * 0.75, 0.05, -0.62).normalize();
      feather(wing.joints[1], base, d, 0.2, 0.075, secondaryPaint, 0, 0.008 + 0.001 * j);
      const tip = base.clone().addScaledVector(d, 0.2);
      trailing.push([tip.x, tip.y, tip.z]);
    }
    // Primaries shingle along the hand, sweeping back and out.
    for (let i = 0; i < 10; i++) {
      const t = 0.04 + i * 0.1;
      const base = new THREE.Vector3(...pm(WR)).lerp(new THREE.Vector3(...pm(FT)), t);
      const d = new THREE.Vector3(s, 0.05, -0.12 - 0.4 * (1 - t)).normalize();
      const L = 0.36 - 0.1 * t;
      const lift = 0.008 + 0.002 * i;
      feather(wing.joints[2], base, d, L, 0.08, primaryPaint, 0, lift);
      if (i >= 5) {
        // glowing wingtip sliver of the outer primaries
        feather(wing.joints[2], base, d, L, 0.08, CYAN, 0.8 * L, lift + 0.0025);
      }
      const tip = base.clone().addScaledVector(d, L);
      trailing.push([tip.x, tip.y + lift, tip.z]);
    }
    // Wing skin between the leading edge (the arm) and the trailing edge.
    b.membrane(wing, catmull(trailing), { color: wingSkin, thickness: 0.01 });

    // Coverts on the arm, in two layered rows, lying flat along the wing.
    const coverts = [];
    for (let k = 0; k < 8; k++) {
      const pt = wing.at(0.08 + k * 0.12).at;
      coverts.push(frame([pt.x, pt.y + 0.014, pt.z], [0, 1, 0]));
    }
    b.cards(coverts, FEATHER, {
      size: [0.075, 0.1],
      lean: 90,
      flow: [s, 0, -0.5],
      color: CREST,
      mirror: true,
      vary: 0.12,
      rng: rng(40 + s),
    });
    const greater = [];
    for (let k = 0; k < 6; k++) {
      const pt = wing.at(0.14 + k * 0.13).at;
      greater.push(frame([pt.x, pt.y + 0.03, pt.z - 0.02], [0, 1, 0]));
    }
    b.cards(greater, FEATHER, {
      size: [0.085, 0.11],
      lean: 90,
      flow: [s, 0, -0.7],
      color: SLATE_L,
      mirror: true,
      vary: 0.1,
      rng: rng(50 + s),
    });
  }

  // ---- tail: a fan of barred plumes
  for (let k = 0; k < 7; k++) {
    const a = (k - 3) * 0.11;
    const d = new THREE.Vector3(Math.sin(a) * 0.8, -0.42, -1).normalize();
    feather(
      tail.joints[3],
      new THREE.Vector3(0, 0.25, -0.61),
      d,
      0.23 - 0.012 * Math.abs(k - 3),
      0.1,
      tailPaint,
      0,
      0.001 * k,
    );
  }

  // ---- legs: feathered trousers, gold tarsi, black talons
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sx = s * 0.085;
    const hipP: V = [s * 0.07, 0.46, -0.03];
    const ankleP: V = [sx, 0.14, -0.06];
    const leg = b.chain(`leg${side}`, limb(hipP, ankleP, [0.19, 0.17], [[0, 0, 1]]), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(leg, (t) => 0.058 - 0.04 * t, { color: legPaint });
    const ankle = leg.joints[2];
    // the gold foot base under the ankle
    b.rod(ankleP, [sx, 0.024, -0.02], 0.019, { bone: ankle, color: TOE });

    // three front toes, splayed, each ending in a black talon on the floor
    for (const k of [-1, 0, 1]) {
      const pts: V[] = [
        [sx + k * 0.01, 0.024, -0.02],
        [sx + k * 0.03, 0.014, 0.05],
        [sx + k * 0.055, 0.008, 0.12],
      ];
      const digit = k + 2;
      const toe = b.chain(`toe${side}${digit}`, catmull(pts), {
        parent: ankle,
        names: [`toe${side}${digit}a`, `toe${side}${digit}b`],
        role: "digit",
      });
      b.sweep(toe, (t) => 0.014 - 0.006 * t, { color: TOE });
      const tip = pts[2];
      b.spike([tip[0], tip[1] + 0.004, tip[2] - 0.005], [0, -0.37, 0.92], 0.03, 0.008, {
        bone: toe.joints[1],
        color: INK,
      });
    }
    // hallux, pointing back
    const hal: V[] = [
      [sx, 0.024, -0.02],
      [sx + s * 0.005, 0.012, -0.07],
      [sx + s * 0.01, 0.008, -0.11],
    ];
    const hallux = b.chain(`hallux${side}`, catmull(hal), {
      parent: ankle,
      names: [`hallux${side}a`, `hallux${side}b`],
      role: "digit",
    });
    b.sweep(hallux, (t) => 0.013 - 0.005 * t, { color: TOE });
    b.spike([hal[2][0], hal[2][1] + 0.004, hal[2][2] + 0.005], [0, -0.37, -0.92], 0.028, 0.008, {
      bone: hallux.joints[1],
      color: INK,
    });
  }
  return b.root;
}
