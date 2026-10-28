import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, frame } from "../../../../src/index";

export const meta = {
  "name": "Pixel Koala on Eucalyptus Stand",
  "description": "A blocky pixel-art koala clinging to a vertical eucalyptus branch mounted on a small wooden stand, with leaves and bark detail."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  furGrey: "#8d929b",
  furDark: "#6a6f78",
  furLight: "#b9bdc4",
  belly: "#e3e1da",
  earInner: "#f0d8d8",
  nose: "#1c1a1f",
  eye: "#14121a",
  eyeShine: "#ffffff",
  claw: "#3a3438",
  bark: "#8a6a4a",
  barkDark: "#5e4630",
  barkLight: "#b08d66",
  leaf: "#5f8f58",
  leafDark: "#3f6b44",
  leafLight: "#8fbb78",
  wood: "#a67c4e",
  woodDark: "#7a5733",
  ring: "#c9a36b",
};
const M = {
  baseTop: [0, 0.08, -0.05] as [number, number, number],
  trunkAxis: [0, 0.5, -0.05] as [number, number, number],
  trunkTop: [0, 1, -0.05] as [number, number, number],
  branchRoot: [0.05, 0.75, -0.05] as [number, number, number],
  branchTip: [0.38, 0.98, -0.05] as [number, number, number],
  torsoCentre: [0, 0.5, 0.1] as [number, number, number],
  neck: [0, 0.72, 0.12] as [number, number, number],
  shoulderL: [0.14, 0.64, 0.08] as [number, number, number],
  shoulderR: [-0.14, 0.64, 0.08] as [number, number, number],
  hipL: [0.1, 0.36, 0.08] as [number, number, number],
  hipR: [-0.1, 0.36, 0.08] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // standAndTrunk
  (() => {
function buildStandAndTrunk({ b, P, M }: any) {
  const T = 0.02;
  const r = rng(11);
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });

  // Base plate
  const bz = M.baseTop[2];
  box(0.7, 0.04, 0.5, P.woodDark, 0, 0.02, bz);
  box(0.64, 0.04, 0.44, P.wood, 0, 0.06, bz);
  // ring-colour edge trim on top layer
  box(0.64, 0.012, 0.02, P.ring, 0, 0.082, bz + 0.21);
  box(0.64, 0.012, 0.02, P.ring, 0, 0.082, bz - 0.21);
  box(0.02, 0.012, 0.4, P.ring, 0.31, 0.082, bz);
  box(0.02, 0.012, 0.4, P.ring, -0.31, 0.082, bz);
  // plank seams
  for (const x of [-0.2, 0, 0.2]) box(0.01, 0.006, 0.42, P.woodDark, x, 0.081, bz);
  // corner pegs
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      box(0.04, 0.03, 0.04, P.woodDark, sx * 0.29, 0.095, bz + sz * 0.2);
      box(0.02, 0.01, 0.02, P.ring, sx * 0.29, 0.114, bz + sz * 0.2);
    }

  // Trunk: stacked offset boxes
  const tx = 0, tz = bz;
  const cols = [P.bark, P.barkDark, P.bark, P.barkLight];
  let y = 0.08;
  let i = 0;
  while (y < 1.0) {
    const h = 0.1;
    const ox = (r() - 0.5) * 0.02;
    const oz = (r() - 0.5) * 0.02;
    const w = 0.2 - (y > 0.8 ? 0.02 : 0) + (y < 0.2 ? 0.04 : 0);
    box(w, h, w, cols[i % 4 === 3 ? 0 : i % 3], tx + ox, y + h / 2, tz + oz);
    // ridge strips on front and sides
    box(0.03, h * 0.9, 0.012, P.barkDark, tx - 0.05 + r() * 0.1, y + h / 2, tz + w / 2 + oz);
    box(0.012, h * 0.9, 0.03, P.barkLight, tx + w / 2 + ox, y + h / 2, tz - 0.04 + r() * 0.08);
    box(0.012, h * 0.9, 0.03, P.barkDark, tx - w / 2 + ox, y + h / 2, tz - 0.04 + r() * 0.08);
    y += h;
    i++;
  }
  // flared roots
  for (const sx of [-1, 1]) box(0.06, 0.06, 0.14, P.barkDark, sx * 0.12, 0.11, tz);
  box(0.14, 0.06, 0.06, P.barkDark, 0, 0.11, tz - 0.12);
  // knots
  box(0.05, 0.05, 0.02, P.barkDark, -0.04, 0.3, tz - 0.11);
  box(0.03, 0.03, 0.02, P.claw, -0.04, 0.3, tz - 0.122);
  box(0.04, 0.04, 0.02, P.barkDark, 0.06, 0.88, tz + 0.1);
  // cut top
  box(0.16, 0.02, 0.16, P.ring, tx, 1.0, tz);
  box(0.1, 0.022, 0.1, P.barkLight, tx, 1.0, tz);
  box(0.04, 0.024, 0.04, P.wood, tx, 1.0, tz);

  // Branch: stepped up and +X
  const root = M.branchRoot, tip = M.branchTip;
  const n = 7;
  for (let k = 0; k < n; k++) {
    const t = k / (n - 1);
    const x = root[0] + (tip[0] - root[0]) * t;
    const yy = root[1] + (tip[1] - root[1]) * t;
    const s = 0.09 - 0.04 * t;
    box(s + 0.04, s, s, k % 2 ? P.barkDark : P.bark, x, yy, tz);
    box(0.03, 0.012, s * 0.6, P.barkLight, x, yy + s / 2 + 0.004, tz);
  }
  // cut end at tip
  box(0.02, 0.06, 0.06, P.ring, tip[0] + 0.035, tip[1], tz);
  box(0.022, 0.03, 0.03, P.wood, tip[0] + 0.037, tip[1], tz);
  // small twig stub
  box(0.04, 0.03, 0.03, P.barkDark, 0.2, 0.74, tz + 0.04);
}
    return buildStandAndTrunk;
  })(),
  // koalaBody
  (() => {
function buildKoalaBody({ b, J, P, M }: any) {
  const T = 0.02;
  const r = rng(11);
  const box = (sx: number, sy: number, sz: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { at: [x, y, z] });

  // torso: stepped stack, back at z~0.0, front toward +Z
  const rows = [
    [0.15, 0.40, 0.17],
    [0.2, 0.46, 0.2],
    [0.24, 0.5, 0.22],
    [0.26, 0.54, 0.22],
    [0.26, 0.58, 0.22],
    [0.24, 0.62, 0.2],
    [0.2, 0.66, 0.18],
  ];
  rows.forEach(([w, y, d], i) => {
    box(w * 1.7, 0.06, d, i % 2 ? P.furGrey : P.furGrey, 0, y, 0.09 + (d - 0.2) * 0.2);
  });
  // rump (round, stepped) behind/below
  box(0.34, 0.1, 0.12, P.furDark, 0, 0.27, 0.03);
  box(0.28, 0.1, 0.1, P.furGrey, 0, 0.2, 0.05);
  box(0.4, 0.1, 0.16, P.furGrey, 0, 0.35, 0.05);

  // belly patch on front
  const bz = 0.215;
  [[0.2, 0.62], [0.26, 0.56], [0.28, 0.5], [0.26, 0.44], [0.2, 0.38]].forEach(([w, y]) => {
    box(w, 0.06, 0.02, P.belly, 0, y, bz);
    box(w + 0.04, 0.06, 0.012, P.furLight, 0, y, bz - 0.008);
  });
  // belly dither dots
  for (let i = 0; i < 10; i++) {
    box(T, T, 0.008, P.furLight, (r() - 0.5) * 0.2, 0.4 + r() * 0.22, bz + 0.012);
  }

  // fur tufts on sides and back
  for (let i = 0; i < 26; i++) {
    const s = r() < 0.5 ? -1 : 1;
    const y = 0.25 + r() * 0.42;
    const dark = r() < 0.5;
    box(T * (1 + Math.floor(r() * 2)), T * 2, T, dark ? P.furDark : P.furLight, s * (0.14 + r() * 0.04), y, 0.02 + r() * 0.16);
  }

  // legs
  for (const s of [1, -1]) {
    const hx = s * 0.1;
    // thigh (thick, angled out)
    box(0.14, 0.16, 0.16, P.furGrey, s * 0.15, 0.33, 0.1);
    box(0.1, 0.1, 0.1, P.furDark, s * 0.2, 0.36, 0.08);
    box(0.08, 0.04, 0.08, P.furLight, s * 0.15, 0.42, 0.14);
    // knee forward, lower leg back to trunk
    box(0.11, 0.14, 0.11, P.furGrey, s * 0.16, 0.23, 0.18);
    box(0.09, 0.12, 0.1, P.furGrey, s * 0.14, 0.17, 0.12);
    // foot pad, gripping trunk side
    box(0.11, 0.06, 0.1, P.furDark, s * 0.13, 0.15, 0.06);
    box(0.09, 0.03, 0.04, P.furLight, s * 0.13, 0.15, 0.115);
    // toes + claws wrapping around trunk edge
    for (let k = 0; k < 3; k++) {
      const x = s * (0.085 + k * 0.03);
      box(0.026, 0.05, 0.05, P.furDark, x, 0.17, 0.03);
      box(0.018, 0.03, 0.03, P.claw, x, 0.165, -0.005);
    }
    // thumb-toe
    box(0.03, 0.05, 0.04, P.furGrey, s * 0.2, 0.16, 0.05);
    box(0.02, 0.03, 0.025, P.claw, s * 0.2, 0.15, 0.025);
    void hx;
  }

  // neck/shoulder fluff
  box(0.3, 0.06, 0.16, P.furLight, 0, 0.69, 0.11);
  box(0.2, 0.04, 0.1, P.furDark, 0, 0.71, 0.1);
  // shoulder mounts bulk
  for (const s of [1, -1]) box(0.08, 0.1, 0.12, P.furGrey, s * 0.15, 0.63, 0.09);
  void M; void J;
}
    return buildKoalaBody;
  })(),
  // koalaHeadAndArms
  (() => {
function buildKoalaHeadAndArms({ b, J, P, M }: Ctx) {
  const T = 0.02;
  const box = (
    w: number,
    h: number,
    d: number,
    color: string,
    x: number,
    y: number,
    z: number,
  ) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });

  // Head centre
  const hx = M.neck[0];
  const hy = M.neck[1] + 0.11;
  const hz = M.neck[2] + 0.07;
  const H = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    box(w, h, d, c, hx + x, hy + y, hz + z);

  // stepped skull
  H(0.3, 0.16, 0.24, P.furGrey, 0, 0, 0);
  H(0.26, 0.04, 0.22, P.furGrey, 0, 0.1, 0);
  H(0.22, 0.04, 0.2, P.furLight, 0, 0.14, -0.01);
  H(0.34, 0.1, 0.2, P.furGrey, 0, -0.02, -0.01);
  H(0.26, 0.04, 0.22, P.furDark, 0, -0.1, 0);
  // forehead tufts
  for (const x of [-0.06, 0, 0.06]) H(0.03, 0.03, 0.03, P.furLight, x, 0.16, 0.04);

  // cheeks
  for (const s of [1, -1]) {
    H(0.06, 0.08, 0.1, P.furLight, s * 0.17, -0.04, 0.05);
    H(0.04, 0.04, 0.06, P.furLight, s * 0.2, -0.07, 0.03);
    H(0.04, 0.04, 0.04, P.furDark, s * 0.18, -0.1, 0.02);
  }

  // ears
  for (const s of [1, -1]) {
    const ex = s * 0.2, ey = 0.1;
    H(0.14, 0.14, 0.05, P.furGrey, ex, ey, -0.02);
    H(0.1, 0.18, 0.05, P.furGrey, ex, ey, -0.02);
    H(0.16, 0.1, 0.04, P.furLight, ex, ey, -0.04);
    H(0.1, 0.12, 0.04, P.furLight, ex, ey + 0.01, -0.04);
    H(0.09, 0.09, 0.02, P.earInner, ex, ey, 0.015);
    H(0.05, 0.12, 0.02, P.earInner, ex, ey, 0.015);
    H(0.03, 0.03, 0.03, P.furDark, ex + s * 0.05, ey + 0.08, 0.0);
    H(0.03, 0.03, 0.03, P.furDark, ex + s * 0.07, ey - 0.02, 0.0);
    H(0.03, 0.03, 0.03, P.furDark, ex - s * 0.02, ey + 0.1, 0.0);
  }

  // muzzle
  H(0.14, 0.1, 0.05, P.furLight, 0, -0.04, 0.14);
  H(0.1, 0.04, 0.04, P.furLight, 0, -0.1, 0.13);
  // nose
  H(0.1, 0.07, 0.05, P.nose, 0, 0.0, 0.18);
  H(0.07, 0.03, 0.04, P.nose, 0, 0.045, 0.17);
  H(0.02, 0.02, 0.01, P.furDark, -0.02, 0.01, 0.21);
  box(0.02, 0.02, 0.01, P.furLight, hx - 0.02, hy + 0.02, hz + 0.21);
  // mouth
  H(0.02, 0.04, 0.02, P.nose, 0, -0.1, 0.16);

  // eyes
  for (const s of [1, -1]) {
    H(0.06, 0.02, 0.04, P.furDark, s * 0.09, 0.07, 0.12);
    H(0.04, 0.04, 0.03, P.eye, s * 0.09, 0.03, 0.13);
    H(0.02, 0.02, 0.01, P.eyeShine, s * 0.095, 0.04, 0.15);
    H(0.05, 0.02, 0.02, P.furDark, s * 0.09, -0.0, 0.12);
  }

  // arms: shoulder -> forward-around trunk
  const trunk = M.trunkAxis;
  for (const s of [1, -1]) {
    const sh = s === 1 ? M.shoulderL : M.shoulderR;
    // upper arm outward/forward
    box(0.08, 0.14, 0.08, P.furGrey, sh[0] + s * 0.03, sh[1] - 0.02, sh[2] + 0.02);
    box(0.06, 0.04, 0.06, P.furLight, sh[0] + s * 0.03, sh[1] + 0.06, sh[2] + 0.02);
    // forearm sweeping toward trunk side
    box(0.07, 0.07, 0.16, P.furGrey, sh[0] + s * 0.03, sh[1] - 0.1, sh[2] - 0.04);
    box(0.06, 0.06, 0.1, P.furDark, sh[0] + s * 0.0, sh[1] - 0.12, sh[2] - 0.14);
    // hand on the trunk side
    const hx2 = s * 0.1;
    box(0.08, 0.08, 0.08, P.furDark, hx2, sh[1] - 0.12, trunk[2] - 0.0);
    // claws
    for (let i = -1; i <= 1; i++) {
      box(0.016, 0.03, 0.02, P.claw, hx2 + i * 0.022, sh[1] - 0.17, trunk[2] + 0.03);
    }
    box(0.014, 0.02, 0.014, P.claw, hx2 - s * 0.045, sh[1] - 0.14, trunk[2] + 0.04);
    // fur tufts on arm
    box(0.03, 0.03, 0.03, P.furLight, sh[0] + s * 0.07, sh[1] - 0.06, sh[2] + 0.03);
    box(0.03, 0.03, 0.03, P.furDark, sh[0] + s * 0.06, sh[1] - 0.12, sh[2] - 0.04);
  }
}
    return buildKoalaHeadAndArms;
  })(),
  // foliage
  (() => {
function buildFoliage({ b, J, P, M }: any) {
  const r = rng(11);
  const T = 0.02;
  const cols = [P.leaf, P.leafDark, P.leafLight];
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, rotation: rot });

  // a hanging pixel leaf: stepped boxes forming a narrow elongated leaf with a lighter midrib
  const leaf = (x: number, y: number, z: number, len: number, c: string, tilt: number, yaw: number) => {
    const n = Math.max(3, Math.round(len / T));
    for (let i = 0; i < n; i++) {
      const w = T * (i === 0 || i === n - 1 ? 1 : i < n / 2 ? 2 : 2);
      const px = Math.sin((tilt * Math.PI) / 180) * i * T;
      const py = -Math.cos((tilt * Math.PI) / 180) * i * T;
      const cx = x + px * Math.cos((yaw * Math.PI) / 180);
      const cz = z + px * Math.sin((yaw * Math.PI) / 180);
      box(w, T, T * 0.6, i % 3 === 1 ? P.leafLight : c, [cx, y + py, cz]);
    }
  };

  // stem tufts and leaf clusters along the branch
  const root = M.branchRoot as number[];
  const tip = M.branchTip as number[];
  const cluster = (cx: number, cy: number, cz: number, count: number, spread: number) => {
    box(T, T, T, P.barkDark, [cx, cy, cz]);
    for (let i = 0; i < count; i++) {
      const ox = (r() - 0.5) * spread;
      const oz = (r() - 0.5) * spread * 0.8;
      const oy = (r() - 0.2) * 0.04;
      const sx = cx + ox;
      const sy = cy + oy;
      const sz = cz + oz;
      box(T * 0.6, T * 0.6, T * 0.6, P.barkDark, [sx, sy, sz]);
      leaf(sx, sy, sz, 0.1 + r() * 0.08, cols[Math.floor(r() * 3)], (r() - 0.5) * 50, r() * 360);
    }
  };

  const steps = 6;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = root[0] + (tip[0] - root[0]) * t;
    const y = root[1] + (tip[1] - root[1]) * t + 0.03;
    const z = root[2] + 0.04;
    cluster(x, y, z, i >= steps - 1 ? 5 : 3, 0.1);
  }
  // tip burst
  cluster(tip[0] + 0.05, tip[1] + 0.02, tip[2] + 0.02, 6, 0.12);
  cluster(tip[0] + 0.12, tip[1] - 0.04, tip[2] - 0.05, 4, 0.1);

  // trunk top tufts
  const top = M.trunkTop as number[];
  cluster(top[0], top[1] + 0.03, top[2], 7, 0.16);
  cluster(top[0] - 0.1, top[1] - 0.02, top[2] + 0.05, 4, 0.1);
  cluster(top[0] + 0.02, top[1] + 0.04, top[2] - 0.08, 4, 0.1);

  // drooping leaves beside the koala (not in the face area)
  leaf(-0.2, 0.98, -0.05, 0.16, P.leafDark, 15, 180);
  leaf(-0.24, 0.92, -0.02, 0.14, P.leaf, -10, 200);
  leaf(0.22, 0.92, 0.08, 0.14, P.leafLight, 10, 0);

  // leaves on base plate
  for (const [x, z, rot, c] of [[0.2, 0.05, 0.6, P.leaf], [-0.2, -0.1, -0.5, P.leafDark]] as any[]) {
    box(0.14, T * 0.5, T * 1.5, c, [x, 0.71, z], [0, (rot * 180) / Math.PI, 0]);
    box(0.08, T * 0.6, T * 0.5, P.leafLight, [x, 0.715, z], [0, (rot * 180) / Math.PI, 0]);
  }
}
    return buildFoliage;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "pixelKoala" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
