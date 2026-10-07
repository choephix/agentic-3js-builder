```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  countershade,
  mottle,
  paint,
  noise,
  smoothstep,
  rng,
  svg,
  line,
} from "agentic-3js-builder";

export const meta = {
  name: "Old Lion",
  description:
    "A proud old lion lying with his head held high: a huge shaggy mane fading from golden blond to dark chocolate, tawny body, cream belly and muzzle, amber eyes, scarred brow, padded paws and a dark-tufted tail.",
};

const rgb = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16) / 255,
  parseInt(h.slice(3, 5), 16) / 255,
  parseInt(h.slice(5, 7), 16) / 255,
];
const lerpC = (a: number[], b: number[], t: number): [number, number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const TAWNY = "#c88f4a";
const TAWNY_D = "#a8723a";
const CREAM = "#ecd9b0";
const FACE = "#d9a548";
const BLACK = "#16100d";
const AMBER = "#e9a417";
const SCAR = "#ecc0a8";
const DARK = "#2b1810";
const PAW = "#d6a45a";
const DOT = "#4a2c1a";

const M_GOLD = rgb("#e8b84e");
const M_MID = rgb("#a8702c");
const M_CHOC = rgb("#35200f");

export default function build() {
  const b = createBuilder({ name: "oldLion" });

  // ---------- paints ----------
  const coat = countershade(mottle(TAWNY, TAWNY_D, { size: 0.25, contrast: 0.5, seed: 4 }), CREAM, { level: -0.15 });
  const manePaint = paint((p) => {
    const d = Math.hypot(p.x, (p.y - 1.08) * 0.9, (p.z - 1.15) * 0.8);
    const t = smoothstep(0.15, 0.7, d + (noise(p, 0.1, 3) - 0.5) * 0.14);
    return t < 0.5 ? lerpC(M_GOLD, M_MID, t * 2) : lerpC(M_MID, M_CHOC, (t - 0.5) * 2);
  });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.34, -0.8] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.34, -0.8],
      [0, 0.34, -0.35],
      [0, 0.38, 0.1],
      [0, 0.42, 0.5],
    ]),
    { parent: hips, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.42, 0.5],
      [0, 0.7, 0.68],
      [0, 0.95, 0.82],
      [0, 1.08, 0.92],
    ]),
    { parent: spine, role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: neck.at(1), dir: [0, 0.02, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.1, down: 0.06 }),
    aim: head.local({ forward: 0.35, down: 0.07 }),
    role: "jaw",
  });

  // ---------- body ----------
  b.sweep(spine, (t) => [0.2 + 0.07 * t, 0.23 + 0.08 * t], { color: coat, shift: () => [0, -0.06] });
  b.sweep(neck, (t) => 0.2 - 0.03 * t, { color: TAWNY_D });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const fl = b.chain(
      `foreleg${L}`,
      catmull([
        [s * 0.21, 0.5, 0.5],
        [s * 0.23, 0.15, 0.38],
        [s * 0.22, 0.11, 0.85],
        [s * 0.22, 0.08, 1.0],
      ]),
      {
        parent: spine,
        names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `paw${L}`],
        role: "leg",
        contact: [s * 0.22, 0, 1.0],
      },
    );
    b.sweep(fl, [0.13, 0.11, 0.078, 0.066], { color: coat });
    const pawBone = fl.tip!;
    b.part(new THREE.SphereGeometry(1, 10, 8), PAW, {
      bone: pawBone,
      at: [s * 0.22, 0.065, 0.98],
      scale: [0.095, 0.065, 0.13],
    });
    for (const dx of [-0.07, -0.025, 0.025, 0.07]) {
      b.part(new THREE.SphereGeometry(0.03, 7, 5), PAW, {
        bone: pawBone,
        at: [s * 0.22 + dx, 0.04, 1.1 - Math.abs(dx) * 0.4],
        scale: [1, 0.8, 1.1],
      });
      b.part(new THREE.BoxGeometry(0.004, 0.01, 0.03), DOT, {
        bone: pawBone,
        at: [s * 0.22 + dx * 1.0 + 0.0, 0.065, 1.12 - Math.abs(dx) * 0.4],
      });
    }

    const hl = b.chain(
      `hindleg${L}`,
      polyline([
        [s * 0.27, 0.38, -0.6],
        [s * 0.31, 0.17, -0.3],
        [s * 0.29, 0.12, -0.92],
        [s * 0.19, 0.07, -0.5],
      ]),
      {
        parent: hips,
        names: [`hip${L}`, `knee${L}`, `hock${L}`, `toe${L}`],
        role: "leg",
        contact: [s * 0.19, 0, -0.5],
      },
    );
    b.sweep(hl, [0.14, 0.11, 0.08, 0.07], { color: coat, skin: "rigid" });
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
      bone: hl.joints[0],
      at: [s * 0.28, 0.3, -0.58],
      scale: [0.15, 0.24, 0.3],
    });
    b.part(new THREE.SphereGeometry(1, 10, 8), PAW, {
      bone: hl.tip!,
      at: [s * 0.18, 0.055, -0.45],
      scale: [0.075, 0.055, 0.11],
    });
    for (const dx of [-0.045, -0.015, 0.015, 0.045]) {
      b.part(new THREE.SphereGeometry(0.025, 6, 5), PAW, {
        bone: hl.tip!,
        at: [s * 0.18 + dx, 0.03, -0.35],
        scale: [1, 0.8, 1.1],
      });
    }
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.34, -0.95],
      [0.08, 0.26, -1.25],
      [0.3, 0.17, -1.5],
      [0.6, 0.1, -1.52],
      [0.82, 0.085, -1.28],
    ]),
    { parent: hips, role: "tail" },
  );
  b.sweep(tail, [0.06, 0.045, 0.04, 0.037, 0.035], { color: coat });
  const tEnd = tail.at(1);
  const tanV = tEnd.tangent.clone().normalize();
  const tStart = tEnd.at.clone().addScaledVector(tanV, -0.04);
  const tTip = tEnd.at.clone().addScaledVector(tanV, 0.3);
  const tuft = b.sweep(polyline([tStart, tTip]), [0.04, 0.085, 0.075, 0.02], {
    color: DARK,
    bone: tail.joints[tail.joints.length - 1],
  });

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), FACE, {
    bone: head,
    at: head.local({ forward: 0.1 }),
    scale: [0.15, 0.13, 0.17],
  });
  const sk = b.surface(skull);
  type S = ReturnType<typeof b.surface>;
  const hitAt = (surf: S, c: THREE.Vector3, az: number, el: number) => {
    const h = surf.around(c).at(az, el);
    if (!h) throw new Error("no surface hit");
    return h;
  };

  // bridge, muzzle, nose, jaw
  b.part(new THREE.SphereGeometry(1, 10, 8), FACE, {
    bone: head,
    at: head.local({ forward: 0.2, up: 0.045 }),
    scale: [0.055, 0.05, 0.12],
  });
  const mz = b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, {
    bone: head,
    at: head.local({ forward: 0.25, down: 0.04 }),
    scale: [0.085, 0.05, 0.11],
  });
  const mzs = b.surface(mz);
  b.stick(new THREE.SphereGeometry(0.045, 8, 6), BLACK, hitAt(mzs, mz.at, 0, 12), { embed: 0.3, scale: [1.3, 0.8, 0.8] });
  b.part(new THREE.SphereGeometry(1, 8, 6), DARK, {
    bone: head,
    at: head.local({ forward: 0.24, down: 0.09 }),
    scale: [0.075, 0.009, 0.1],
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, {
    bone: jaw,
    at: head.local({ forward: 0.23, down: 0.115 }),
    scale: [0.065, 0.03, 0.1],
  });
  for (const s of [1, -1]) {
    for (const [az, el] of [
      [30, -2],
      [45, -2],
      [36, -16],
      [50, -14],
    ]) {
      b.stick(new THREE.SphereGeometry(0.009, 5, 4), DOT, hitAt(mzs, mz.at, s * az, el), { embed: 0.3 });
    }
  }

  // eyes, brows, ears
  for (const s of [1, -1]) {
    const eh = hitAt(sk, skull.at, s * 38, 12);
    b.stick(new THREE.SphereGeometry(0.03, 8, 6), AMBER, eh, { embed: 0.4 });
    b.stick(new THREE.SphereGeometry(0.015, 6, 5), BLACK, eh.moved([0, 0.02, 0]), { embed: 0.3 });
    b.stick(new THREE.SphereGeometry(0.04, 8, 6), TAWNY, hitAt(sk, skull.at, s * 30, 36), {
      embed: 0.3,
      scale: [1.5, 0.6, 1],
    });
    b.stick(new THREE.SphereGeometry(0.052, 8, 6), TAWNY_D, hitAt(sk, skull.at, s * 52, 62), {
      embed: 0.2,
      scale: [1, 0.55, 1],
    });
    b.stick(new THREE.SphereGeometry(0.03, 7, 5), DARK, hitAt(sk, skull.at, s * 52, 62).moved([0, 0.012, 0]), {
      embed: 0.2,
      scale: [1, 0.4, 1],
    });
  }
  // scar across the left brow
  const scarPts = [
    hitAt(sk, skull.at, 20, 56),
    hitAt(sk, skull.at, 31, 36),
    hitAt(sk, skull.at, 42, 15),
  ].map((h) => h.moved([0, 0.013, 0]).at);
  b.sweep(catmull(scarPts), 0.007, { color: SCAR, bone: head });

  // ---------- mane ----------
  const neckTop = neck.joints[neck.joints.length - 1];
  const maneSpecs: [number[], number[]][] = [
    [[0, 1.0, 0.62], [0.42, 0.44, 0.3]],
    [[0, 0.52, 0.8], [0.3, 0.28, 0.26]],
    [[0, 0.72, 0.35], [0.36, 0.3, 0.3]],
    [[0.28, 0.9, 0.72], [0.2, 0.3, 0.25]],
    [[-0.28, 0.9, 0.72], [0.2, 0.3, 0.25]],
  ];
  const maneParts = maneSpecs.map(([c, r]) =>
    b.part(new THREE.SphereGeometry(1, 10, 8), manePaint, {
      bone: neckTop,
      at: c as [number, number, number],
      scale: r as [number, number, number],
    }),
  );
  const lock = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 0 C22 20 30 40 25 64 L7 64 C2 40 10 20 16 0Z" fill="#ffffff"/><path d="M16 8 C18 25 19 45 16 64" stroke="#b8b8b8" stroke-width="2.5" fill="none"/><path d="M11 30 C12 42 11 52 10 64" stroke="#d0d0d0" stroke-width="2" fill="none"/></svg>`,
    { size: 128 },
  );
  const maneHits = b.surface(maneParts).scatter(340, {
    rng: rng(11),
    minDist: 0.05,
    filter: (h) => !(h.at.z > 0.82 && Math.hypot(h.at.x, h.at.y - 1.05) < 0.25),
  });
  b.cards(maneHits, lock, {
    size: [0.1, 0.23],
    lean: 60,
    bend: 25,
    vary: 0.3,
    spin: 25,
    rng: rng(5),
    flow: [0, -0.5, -1],
    color: manePaint,
    bone: neckTop,
  });
  // ruff framing the face
  const ruff = b.ring(
    line(head.local({ forward: -0.05 }), head.local({ forward: 0.5 })),
    { count: 20, radius: 0.22 },
  );
  b.cards(ruff.items, lock, {
    size: [0.1, 0.2],
    lean: 62,
    bend: 20,
    vary: 0.2,
    rng: rng(8),
    color: manePaint,
    bone: neckTop,
  });

  // tail tuft hair
  const tuftHits = b.surface(tuft).scatter(40, { rng: rng(21), minDist: 0.025 });
  b.cards(tuftHits, lock, {
    size: [0.04, 0.1],
    lean: 45,
    bend: 15,
    vary: 0.3,
    rng: rng(22),
    flow: [tanV.x, tanV.y, tanV.z],
    color: DARK,
  });

  return b.root;
}
```