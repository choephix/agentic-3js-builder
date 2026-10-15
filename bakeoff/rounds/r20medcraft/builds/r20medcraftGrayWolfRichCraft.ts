import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Sweep, SweepPoint } from "../../../../src/sweep";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, gradient, grain, mix, mottle, paint, resolve } from "../../../../src/paint";
import type { ColorInput } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Gray Wolf",
  description:
    "A gray wolf standing alert, built Warcraft-style: heavy shoulders and chest, oversized paws and head, hand-painted fur with warm highlights, a spiked mane, and a studded leather collar with a fang pendant.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// Palette
const CREAM_HI = "#e6ddc6";
const TAN = "#a39682";
const PAW_DK = "#3d3832";
const BONE = "#ece4cb";
const BRONZE = "#b8893a";
const LEATHER = "#6e4326";
const LEATHER_DK = "#45281a";
const CLAW = "#2b2622";
const NOSE = "#141319";
const EAR_IN = "#c7a597";
const LIP = "#26232a";

// Paints
const FUR_BACK = grain("#5f626b", "#494c56", { size: 0.02, axis: "z", seed: 2 });
const FUR_MID = mottle(grain("#8d8e92", "#7b7d84", { size: 0.02, axis: "z", seed: 1 }), "#a19a8a", {
  size: 0.15,
  seed: 4,
  contrast: 0.6,
});
const FUR_CREAM = mottle("#e6decb", "#cfc6b0", { size: 0.1, seed: 6 });

const lit = (base: ColorInput) =>
  paint((p, n) => {
    const c = resolve(base, p, n);
    const hi = mix(c, "#ffe9b8", Math.max(n.y, 0) * 0.18);
    return mix(hi, "#161a2c", Math.max(-n.y, 0) * 0.28);
  });

const bodyBase = countershade(countershade(FUR_BACK, FUR_MID, { level: 0.5, soft: 0.25 }), FUR_CREAM, {
  level: -0.3,
  soft: 0.2,
});
const bodyColor = paint((p, n) =>
  n.z > 0.1 + 0.35 * zigzag(p.x / 0.04) && p.z > 0.12 && p.y < 0.92 ? FUR_CREAM : bodyBase,
);
const COAT = lit(bodyColor);
const LEG = lit(gradient(gradient(bodyBase, TAN, [0, 0.62, 0], [0, 0.3, 0]), PAW_DK, [0, 0.16, 0], [0, 0.07, 0]));
const HEAD = lit(
  countershade(mottle("#84858c", "#6a6c74", { size: 0.05, seed: 8 }), "#d8cfba", { level: -0.2, soft: 0.3 }),
);
const MUZZLE = lit(countershade("#6d675a", "#dcd3be", { level: -0.15, soft: 0.3 }));
const PAW = lit(mottle("#5a534a", "#463f38", { size: 0.03, seed: 3 }));
const TAIL_COAT = lit(gradient(bodyBase, "#26262b", [0, 0.6, -0.76], [0, 0.46, -0.88]));
const EAR_OUT = lit(mottle("#6c6e76", "#585a62", { size: 0.04, seed: 9 }));

// Drawings
const TUFT_A = svg(
  `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8a8a8a"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><path d="M3 64 Q8 30 16 0 Q24 30 29 64Z" fill="url(#g)"/><path d="M16 6 Q14 36 16 64" stroke="#777777" stroke-width="2" fill="none"/></svg>`,
  { size: 128 },
);
const TUFT_B = svg(
  `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#858585"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><path d="M2 64 Q5 30 9 4 Q15 34 17 64Z" fill="url(#g)"/><path d="M14 64 Q19 28 25 14 Q27 40 30 64Z" fill="url(#g)"/></svg>`,
  { size: 128 },
);
const EYE = svg(
  `<svg viewBox="0 0 60 40"><defs><clipPath id="c"><path d="M3 12 Q28 0 57 28 Q30 36 3 12Z"/></clipPath></defs>
  <path d="M3 12 Q28 0 57 28 Q30 36 3 12Z" fill="#1a1208"/>
  <g clip-path="url(#c)">
    <circle cx="30" cy="20" r="14" fill="#d9941c"/>
    <circle cx="30" cy="26" r="10" fill="#f5c957"/>
    <circle cx="30" cy="19" r="6.5" fill="#100904"/>
    <rect x="0" y="0" width="60" height="13" fill="#2a1a08" opacity="0.55"/>
  </g>
  <path d="M3 12 Q28 0 57 28" stroke="#0e0a06" stroke-width="3.4" stroke-linecap="round" fill="none"/>
  <path d="M3 12 Q30 36 57 28" stroke="#0e0a06" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <circle cx="25" cy="16" r="2.8" fill="#ffffff"/>
  <circle cx="35" cy="24" r="1.3" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);
const SCAR = svg(
  `<svg viewBox="0 0 64 48"><g stroke-linecap="round" fill="none">
  <path d="M10 6 L30 40" stroke="#c98a7c" stroke-width="5"/><path d="M10 6 L30 40" stroke="#efe5d0" stroke-width="2.6"/>
  <path d="M22 4 L42 38" stroke="#c98a7c" stroke-width="5"/><path d="M22 4 L42 38" stroke="#efe5d0" stroke-width="2.6"/>
  <path d="M34 6 L52 36" stroke="#c98a7c" stroke-width="5"/><path d="M34 6 L52 36" stroke="#efe5d0" stroke-width="2.6"/>
  </g></svg>`,
  { size: 192 },
);

const EAR: OutlinePoint[] = [
  [-0.058, 0],
  [0.058, 0],
  [0.042, 0.09],
  [0, 0.19, "sharp"],
  [-0.03, 0.09],
];
const EAR_INNER: OutlinePoint[] = [
  [-0.032, 0.016],
  [0.032, 0.016],
  [0.022, 0.082],
  [0, 0.15, "sharp"],
  [-0.016, 0.082],
];

export default function build() {
  const b = createBuilder({ name: "grayWolf" });
  const R = rng(11);
  type J = ReturnType<typeof b.joint>;

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.8, -0.38], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.8, -0.38],
      [0, 0.79, -0.2],
      [0, 0.78, 0.05],
      [0, 0.79, 0.3],
    ]),
    { parent: hips, role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.88, 0.25],
      [0, 0.98, 0.42],
      [0, 1.02, 0.58],
    ]),
    { parent: chest, role: "neck" },
  );
  const neck2 = neck.joints[1];
  const head = b.joint("head", { parent: neck2, at: [0, 1.02, 0.58], dir: [0, -0.1, 1], group: "head", role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.97, 0.7], aim: [0, 0.93, 0.95], group: "head", role: "jaw" });
  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.82, -0.46],
      [0, 0.78, -0.62],
      [0, 0.64, -0.78],
      [0, 0.46, -0.88],
    ]),
    { parent: hips, role: "tail" },
  );

  // ---------------------------------------------------------------- body
  const body = b.loft(
    [
      { at: [0, 0.8, -0.5], w: 0.26, h: 0.3 },
      { at: [0, 0.8, -0.3], w: 0.3, h: 0.34 },
      { at: [0, 0.78, -0.05], w: 0.24, h: 0.3 },
      { at: [0, 0.76, 0.15], w: 0.31, h: 0.44 },
      { at: [0, 0.78, 0.34], w: 0.32, h: 0.46 },
    ],
    { bone: [hips, spine], color: COAT, sides: 10, name: "body" },
  );
  const neckTube = b.sweep(neck, [0.15, 0.125, 0.11], { color: COAT, sides: 10, name: "neckTube" });
  const tailTube = b.sweep(tail, [0.065, 0.1, 0.105, 0.06], { color: TAIL_COAT, sides: 8, name: "tailTube" });

  // shoulder, haunch masses
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 7), COAT, {
      bone: chest,
      at: [s * 0.14, 0.8, 0.26],
      scale: [0.1, 0.15, 0.17],
      name: "shoulderMass",
    });
    b.part(new THREE.SphereGeometry(1, 10, 7), COAT, {
      bone: hips,
      at: [s * 0.14, 0.74, -0.4],
      scale: [0.12, 0.17, 0.2],
      name: "haunchMass",
    });
  }
  // withers hump
  b.part(new THREE.SphereGeometry(1, 10, 7), COAT, { bone: chest, at: [0, 0.9, 0.2], scale: [0.14, 0.1, 0.2] });

  // ---------------------------------------------------------------- legs
  const legSweeps: Sweep[] = [];
  const pawDetail = (bone: J, x: number, z: number) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), PAW, { bone, at: [x, 0.06, z + 0.04], scale: [0.075, 0.06, 0.115] });
    for (const k of [-1, 0, 1]) {
      const tx = x + k * 0.034;
      const dz = Math.abs(k) * 0.012;
      b.part(new THREE.SphereGeometry(1, 6, 4), PAW, {
        bone,
        at: [tx, 0.033, z + 0.14 - dz],
        scale: [0.03, 0.03, 0.045],
      });
      b.spike([tx, 0.034, z + 0.19 - dz], [k * 0.1, -0.45, 1], 0.055, 0.013, CLAW, { bone, sides: 5 });
    }
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fx = s * 0.14;
    const fp = limb([fx, 0.78, 0.28], [fx, 0.07, 0.33], [0.29, 0.27, 0.2], [
      [0, 0, -1],
      [0, 0, 1],
    ]);
    const front = b.chain(`legF${side}`, fp, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`],
      role: "leg",
      contact: [fx, 0, 0.35],
    });
    legSweeps.push(b.sweep(front, [0.085, 0.068, 0.05, 0.042], { color: LEG, sides: 8 }));
    pawDetail(front.joints[3], fx, 0.33);
    // dewclaw / carpal pad
    b.part(new THREE.SphereGeometry(1, 6, 4), PAW_DK, { bone: front.joints[2], at: [fx, 0.2, 0.3], scale: [0.025, 0.03, 0.03] });

    const hx = s * 0.15;
    const hp = limb([hx, 0.76, -0.42], [s * 0.14, 0.07, -0.52], [0.32, 0.32, 0.24], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hind = b.chain(`legH${side}`, hp, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
      role: "leg",
      contact: [s * 0.14, 0, -0.47],
    });
    legSweeps.push(b.sweep(hind, [0.1, 0.07, 0.045, 0.04], { color: LEG, sides: 8 }));
    pawDetail(hind.joints[3], s * 0.14, -0.52);
  }

  // ---------------------------------------------------------------- head
  const skullAt: [number, number, number] = [0, 1.04, 0.66];
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), HEAD, {
    bone: head,
    at: skullAt,
    scale: [0.115, 0.105, 0.13],
    name: "skull",
  });
  b.sweep(
    [
      [0, 1.0, 0.74],
      [0, 0.975, 0.97],
    ],
    (t) => [0.062 - 0.022 * t, 0.055 - 0.016 * t],
    { caps: { start: "flat", end: "round" }, bone: head, color: MUZZLE, sides: 8, name: "muzzle" },
  );
  b.sweep(
    [
      [0, 0.945, 0.72],
      [0, 0.925, 0.95],
    ],
    [0.042, 0.027],
    { bone: jaw, color: lit("#d9d0bb"), sides: 8, name: "lowerJaw" },
  );
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: [0, 0.99, 0.99],
    scale: [0.034, 0.026, 0.026],
    name: "nose",
  });
  for (const s of [1, -1]) {
    // lips
    b.sweep(
      [
        [s * 0.054, 0.958, 0.74],
        [s * 0.038, 0.95, 0.9],
        [s * 0.01, 0.962, 0.975],
      ],
      0.006,
      LIP,
      { bone: head, sides: 5 },
    );
    // fangs
    b.spike([s * 0.032, 0.948, 0.925], [0, -1, 0.1], 0.042, 0.01, BONE, { bone: head, sides: 5 });
    b.spike([s * 0.026, 0.947, 0.925], [0, 1, 0.1], 0.036, 0.009, BONE, { bone: jaw, sides: 5 });
    // cheek ruff
    b.part(new THREE.SphereGeometry(1, 8, 6), HEAD, {
      bone: head,
      at: [s * 0.075, 0.98, 0.66],
      scale: [0.07, 0.07, 0.1],
    });
    const cheekCols = ["#b9b3a4", "#8f9096", "#d6cfbd"];
    for (let i = 0; i < 3; i++)
      b.spike(
        [s * 0.1, 0.995 - i * 0.025, 0.69 - i * 0.03],
        [s * 0.6, -0.25 - i * 0.1, -1],
        0.1 - i * 0.012,
        0.026,
        cheekCols[i],
        { bone: head, sides: 5 },
      );
    // ears
    const ear = b.extrude(EAR, {
      at: [s * 0.075, 1.115, 0.6],
      x: [1, -s * 0.2, 0],
      y: [s * 0.2, 1, -0.12],
      thickness: [0.032, 0.012],
      bevel: 0.004,
      smoothing: 1,
      color: EAR_OUT,
      bone: head,
      name: "ear",
    });
    b.extrude(EAR_INNER, {
      at: ear.local([0, 0, 0.017]),
      x: [1, -s * 0.2, 0],
      y: [s * 0.2, 1, -0.12],
      thickness: 0.012,
      smoothing: 1,
      color: EAR_IN,
      bone: head,
      name: "earInner",
    });
    // brows
    b.capsule([s * 0.04, 1.105, 0.74], [s * 0.095, 1.09, 0.68], 0.015, lit("#4e5058"), { bone: head });
  }
  // eyes
  const skullSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSkin.around(skull.at).at(s * 36, 6)!;
    b.decal(skullSkin, EYE, {
      at: hit,
      dir: [s * 0.45, 0.05, 0.9],
      size: [0.065, 0.044],
      mirror: s > 0,
      bone: head,
    });
  }
  // nose bridge ridge
  b.sweep(
    [
      [0, 1.09, 0.76],
      [0, 1.03, 0.9],
      [0, 1.0, 0.97],
    ],
    [0.016, 0.01],
    lit("#4d4a45"),
    { bone: head, sides: 5 },
  );

  // ---------------------------------------------------------------- fur: spikes, mane, cards
  const furSpike = (h: SweepPoint, len: number, r: number, color: string, lean: THREE.Vector3) => {
    const d = h.n.clone().multiplyScalar(0.45).add(lean.clone().normalize()).normalize();
    b.spike(h.moved([0, -0.02, 0]), d, len, r, color, { sides: 5 });
  };
  const row = (
    sw: Sweep,
    ts: number[],
    angs: number[],
    len: number,
    r: number,
    cols: readonly string[],
    lean = new THREE.Vector3(0, -0.3, -1),
  ) => {
    let i = 0;
    for (const t of ts)
      for (const a of angs) furSpike(sw.at(t, a), len * (0.8 + 0.4 * R()), r, cols[i++ % cols.length], lean);
  };
  const MANE = ["#4b4e57", "#6c6f77", "#9a9a9a", "#5b5e66"];
  row(neckTube, [0.1, 0.35, 0.6, 0.85], [-50, -25, 0, 25, 50], 0.14, 0.04, MANE);
  row(body, [0.55, 0.68, 0.8, 0.9], [-40, 0, 40], 0.13, 0.04, MANE);
  row(body, [0.82, 0.9, 0.96], [150, 180, 210], 0.12, 0.035, ["#e2dac5", "#cfc6b0", "#f0e9d6"], new THREE.Vector3(0, -1, 0.15));
  row(neckTube, [0.3, 0.6, 0.85], [150, 180, 210], 0.1, 0.03, ["#e2dac5", "#cfc6b0"], new THREE.Vector3(0, -1, -0.1));
  row(tailTube, [0.15, 0.35, 0.55, 0.75], [-60, 0, 60], 0.1, 0.035, ["#6a6d75", "#8c8d92", "#3a3a40"], new THREE.Vector3(0, -0.4, -1));

  const furSkin = b.surface([body, neckTube]);
  const hits = furSkin.scatter(520, {
    rng: rng(21),
    minDist: 0.045,
    filter: (h) => h.n.y > -0.4 && h.at.z > -0.47,
  });
  b.cards(hits, [TUFT_A, TUFT_B], {
    size: [0.055, 0.11],
    lean: 70,
    bend: 30,
    vary: 0.3,
    rng: rng(4),
    color: COAT,
    flow: [0, -0.25, -1],
  });
  const legHits = b.surface(legSweeps).scatter(180, {
    rng: rng(31),
    minDist: 0.04,
    filter: (h) => h.at.y > 0.18,
  });
  b.cards(legHits, [TUFT_A, TUFT_B], {
    size: [0.04, 0.075],
    lean: 80,
    bend: 20,
    vary: 0.3,
    rng: rng(5),
    color: LEG,
    flow: [0, -1, -0.2],
  });

  // ---------------------------------------------------------------- scar painting on the left flank
  b.decal(body, SCAR, { at: [0.17, 0.78, 0.0], dir: [1, 0, 0], size: [0.22, 0.16], roll: 15 });

  // ---------------------------------------------------------------- leather collar with bronze studs and fang
  const neckSkin = b.surface(neckTube);
  const collarLoop = neckSkin.loop(neck2, { lift: 0.012 });
  b.sweep(collarLoop, 0.018, LEATHER);
  b.sweep(neckSkin.loop(neck2, { lift: 0.034 }), 0.006, LEATHER_DK);
  b.along(neckSkin.loop(neck2, { lift: 0.03 }), 12, (at) => {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), BRONZE, { at });
  });
  const front = neckSkin.ray([0, 0.93, 1.2], [0, 0, -1]);
  if (front) {
    const p = front.at;
    b.part(new THREE.TorusGeometry(0.014, 0.005, 5, 8), BRONZE, {
      bone: neck2,
      at: [0, p.y + 0.02, p.z + 0.012],
      dir: [0, 0, 1],
      axis: "z",
    });
    b.part(new THREE.ConeGeometry(0.02, 0.075, 6), BONE, {
      bone: neck2,
      at: [0, p.y - 0.03, p.z + 0.02],
      dir: [0, 1, -0.2],
    });
  }

  return b.root;
}
