import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, limb, frame, catmull, offset } from "../../../../src/index";

export const meta = {
  "name": "Red Panda on Mossy Stone",
  "description": "A Genshin-style cel-shaded red panda balancing on a round mossy boulder, with a big striped tail, cream-rimmed ears and a leaf charm."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  fur: "#e0622a",
  furDark: "#8a3118",
  cream: "#fff1d6",
  belly: "#4a2a22",
  ink: "#22112f",
  nose: "#2b1a26",
  eyeIris: "#ffb23a",
  stone: "#8c8f99",
  stoneDark: "#5d6070",
  moss: "#5fae3c",
  mossDark: "#3a7a2c",
  mossLight: "#9bd65a",
  flowerPink: "#ff9ec4",
  flowerYellow: "#ffe066",
  charm: "#4ff0d8",
  cord: "#c9923a",
  pawDark: "#3a2020",
};
const M = {
  stoneTop: [0, 0.36, 0] as [number, number, number],
  hips: [0, 0.5, -0.12] as [number, number, number],
  chest: [0, 0.52, 0.14] as [number, number, number],
  neckBase: [0, 0.62, 0.2] as [number, number, number],
  headCentre: [0, 0.76, 0.3] as [number, number, number],
  tailRoot: [0, 0.52, -0.28] as [number, number, number],
  pawFL: [0.13, 0.36, 0.26] as [number, number, number],
  pawFR: [-0.13, 0.36, 0.26] as [number, number, number],
  pawBL: [0.14, 0.36, -0.22] as [number, number, number],
  pawBR: [-0.14, 0.36, -0.22] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // stone
  (() => {
function buildStone({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const flat = { flat: true } as const;
  const bone = b.joint ? undefined : undefined;
  void J; void M; void bone;

  const sph = (rad: number, w = 8, h = 6) => new THREE.SphereGeometry(rad, w, h);
  const put = (
    geo: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    scale: [number, number, number] = [1, 1, 1],
    rot: [number, number, number] = [0, 0, 0],
  ) => b.part(geo, color, { at, scale, rotation: rot, ...flat });

  // main boulder body: stacked lumpy blobs
  const lumps: [number, number, number, number, number, number, string][] = [
    [0, 0.2, 0, 0.42, 0.2, 0.52, P.stone],
    [0.1, 0.22, 0.2, 0.3, 0.16, 0.3, P.stoneDark],
    [-0.12, 0.2, -0.22, 0.3, 0.17, 0.3, P.stone],
    [0.22, 0.16, -0.1, 0.22, 0.15, 0.28, P.stoneDark],
    [-0.24, 0.15, 0.14, 0.2, 0.14, 0.26, P.stone],
    [0, 0.3, 0.02, 0.34, 0.1, 0.42, P.stone],
  ];
  lumps.forEach(([x, y, z, sx, sy, sz, c], i) =>
    put(sph(1, 9, 6), c, [x, y, z], [sx, sy, sz], [0, i * 25, 0]),
  );
  // base slab to touch floor
  put(new THREE.CylinderGeometry(0.36, 0.42, 0.1, 9), P.stoneDark, [0, 0.04, 0], [1, 1, 1.25], [0, 10, 0]);

  // angular chunks
  for (let i = 0; i < 7; i++) {
    const a = r() * 6.28;
    const d = 0.3 + r() * 0.1;
    put(
      new THREE.BoxGeometry(0.1 + r() * 0.1, 0.08 + r() * 0.06, 0.1 + r() * 0.1),
      i % 2 ? P.stone : P.stoneDark,
      [Math.cos(a) * d, 0.1 + r() * 0.15, Math.sin(a) * d * 1.3],
      [1, 1, 1],
      [r() * 40, r() * 90, r() * 40],
    );
  }

  // cracks
  for (let i = 0; i < 6; i++) {
    const a = r() * 6.28;
    put(
      new THREE.BoxGeometry(0.01, 0.12 + r() * 0.08, 0.012),
      P.ink,
      [Math.cos(a) * 0.38, 0.17 + r() * 0.1, Math.sin(a) * 0.5],
      [1, 1, 1],
      [0, -a * 57.3 + 90, r() * 30 - 15],
    );
  }

  // moss cap
  const cap: [number, number, number, number, number, string][] = [
    [0, 0.34, 0, 0.34, 0.06, P.moss],
    [0.12, 0.35, 0.22, 0.2, 0.05, P.mossLight],
    [-0.14, 0.35, -0.2, 0.22, 0.05, P.mossDark],
    [0.18, 0.33, -0.2, 0.15, 0.05, P.moss],
    [-0.2, 0.34, 0.15, 0.16, 0.05, P.mossLight],
    [0, 0.355, 0.0, 0.22, 0.04, P.moss],
    [0.05, 0.34, -0.38, 0.16, 0.05, P.mossDark],
    [-0.05, 0.33, 0.38, 0.16, 0.05, P.mossDark],
  ];
  cap.forEach(([x, y, z, rad, h, c], i) =>
    put(sph(1, 8, 4), c, [x, y, z], [rad, h, rad * 1.2], [0, i * 40, 0]),
  );

  // side drips and base moss
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * 6.28 + r() * 0.3;
    const x = Math.cos(a) * 0.36, z = Math.sin(a) * 0.5;
    put(sph(1, 6, 4), i % 2 ? P.moss : P.mossDark, [x, 0.27 - r() * 0.08, z], [0.05, 0.08 + r() * 0.05, 0.05]);
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * 6.28 + 0.2;
    put(sph(1, 6, 4), P.mossDark, [Math.cos(a) * 0.4, 0.02, Math.sin(a) * 0.55], [0.08, 0.03, 0.08]);
  }

  // flowers, away from paws
  const spots: [number, number][] = [[0.28, 0.0], [-0.3, 0.05], [0.0, -0.4], [-0.22, -0.32], [0.24, 0.38], [0.05, 0.45]];
  spots.forEach(([x, z], i) => {
    const col = i % 2 ? P.flowerYellow : P.flowerPink;
    const y = 0.35;
    b.part(new THREE.CylinderGeometry(0.003, 0.003, 0.04, 4), P.mossDark, { at: [x, y + 0.02, z] });
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * 6.28;
      b.part(sph(0.013, 5, 3), col, { at: [x + Math.cos(a) * 0.016, y + 0.045, z + Math.sin(a) * 0.016] });
    }
    b.part(sph(0.01, 5, 3), i % 3 === 0 ? P.charm : P.flowerYellow, { at: [x, y + 0.048, z] });
  });

  // grass blades
  for (let i = 0; i < 14; i++) {
    const a = r() * 6.28, d = 0.15 + r() * 0.2;
    const x = Math.cos(a) * d * 0.9, z = Math.sin(a) * d * 1.4;
    if (Math.abs(Math.abs(x) - 0.13) < 0.07 && (Math.abs(z - 0.26) < 0.07 || Math.abs(z + 0.22) < 0.07)) continue;
    const h = 0.05 + r() * 0.05;
    b.part(new THREE.ConeGeometry(0.01, h, 4), i % 2 ? P.mossLight : P.moss, {
      at: [x, 0.35 + h / 2, z],
      rotation: [r() * 30 - 15, 0, r() * 30 - 15],
    });
  }
}
    return buildStone;
  })(),
  // body
  (() => {
function buildBody({ b, J, P, M }: any) {
  const R = rng(5);
  const hips = J.hips, chest = J.chest;
  // torso loft
  b.loft(
    [
      { at: [0, 0.5, -0.27], w: 0.26, h: 0.24 },
      { at: [0, 0.5, -0.12], w: 0.4, h: 0.3 },
      { at: [0, 0.52, 0.06], w: 0.4, h: 0.31 },
      { at: [0, 0.54, 0.22], w: 0.34, h: 0.28 },
    ],
    { bone: [hips, chest], color: P.fur },
  );
  // belly
  b.loft(
    [
      { at: [0, 0.4, -0.2], w: 0.22, h: 0.08 },
      { at: [0, 0.39, 0], w: 0.28, h: 0.09 },
      { at: [0, 0.42, 0.18], w: 0.22, h: 0.08 },
    ],
    { bone: [hips, chest], color: P.belly },
  );
  // cream chest patch
  b.part(new THREE.SphereGeometry(0.1, 8, 6), P.cream, { bone: chest, at: [0, 0.5, 0.3], scale: [1, 0.9, 0.5] });
  // back stripe darker
  b.part(new THREE.BoxGeometry(0.16, 0.03, 0.4), P.furDark, { bone: hips, at: [0, 0.675, -0.05] });
  // shoulders and haunches
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.1, 8, 6), P.fur, { bone: chest, at: [s * 0.15, 0.5, 0.2], scale: [0.9, 1.1, 1.1] });
    b.part(new THREE.SphereGeometry(0.12, 8, 6), P.fur, { bone: hips, at: [s * 0.16, 0.48, -0.2], scale: [0.9, 1.1, 1.2] });
  }
  // legs
  const legs: [string, any, number, number, any][] = [
    ["armL", J.shoulderL, 1, 0.26, M.pawFL],
    ["armR", J.shoulderR, -1, 0.26, M.pawFR],
    ["legL", J.hipL, 1, -0.22, M.pawBL],
    ["legR", J.hipR, -1, -0.22, M.pawBR],
  ];
  for (const [n, root, s, z, paw] of legs) {
    const front = n.startsWith("arm");
    const top: [number, number, number] = [s * 0.14, 0.48, front ? 0.2 : -0.2];
    const foot: [number, number, number] = [s * 0.14, 0.4, z];
    const pts = limb(top, foot, [0.06, 0.05], [[0, 0, front ? -1 : 1]]);
    const ch = b.chain(n, pts, { parent: root, names: [n + "A", n + "B", n + "C"], role: front ? "arm" : "leg" });
    b.sweep(ch, [0.065, 0.05], { color: P.furDark });
    // paw
    b.part(new THREE.SphereGeometry(0.06, 8, 6), P.pawDark, { bone: ch.tip ?? root, at: [s * 0.14, 0.385, z + 0.02], scale: [1, 0.55, 1.4] });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), P.ink, { bone: ch.tip ?? root, at: [s * 0.14, 0.362, z + 0.03], scale: [1.2, 0.3, 1.2] });
    for (const k of [-1, 0, 1]) {
      b.spike([s * 0.14 + k * 0.025, 0.375, z + 0.075], [0, 0, 1], 0.03, 0.007, { color: P.cream, bone: ch.tip ?? root });
    }
  }
  // collar tufts
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    b.spike([Math.sin(a) * 0.13, 0.6 + Math.cos(a) * 0.06, 0.22], [Math.sin(a), 0.3, 0.6], 0.07, 0.025, { color: P.cream, bone: chest });
  }
  // cord and charm
  const cord = [] as number[][];
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * Math.PI;
    cord.push([Math.cos(a) * 0.12, 0.6 - Math.sin(a) * 0.09, 0.27 + R() * 0.0]);
  }
  b.sweep(cord, 0.007, { color: P.cord, bone: chest });
  const leaf = b.part(new THREE.OctahedronGeometry(0.035, 0), P.charm, { bone: chest, at: [0, 0.5, 0.33], scale: [0.7, 1.2, 0.35] });
  leaf.mesh.material = (leaf.mesh.material as THREE.MeshStandardMaterial).clone();
  const m = leaf.mesh.material as THREE.MeshStandardMaterial;
  m.emissive.copy(m.color);
  m.emissiveIntensity = 1.3;
}
    return buildBody;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: any) {
  const C: number[] = [0, 0.76, 0.3];
  const r = rng(11);
  const add = (geo: THREE.BufferGeometry, color: string, at: number[], o: any = {}) =>
    b.part(geo, color, { bone: o.bone ?? J.head, at, ...(o.dir ? { dir: o.dir } : {}), ...(o.scale ? { scale: o.scale } : {}) });
  const ell = (color: string, at: number[], sc: number[], o: any = {}) =>
    add(new THREE.SphereGeometry(1, 10, 8), color, at, { ...o, scale: sc });

  // neck
  b.rod(M.neckBase, [0, 0.72, 0.27], [0.075, 0.09], P.fur, { bone: J.neck });
  ell(P.cream, [0, 0.67, 0.25], [0.07, 0.05, 0.06], { bone: J.neck });

  // skull
  ell(P.fur, C, [0.15, 0.12, 0.13]);
  ell(P.furDark, [0, 0.855, 0.27], [0.06, 0.02, 0.07]);
  // forehead cream stripe-ish tuft
  ell(P.cream, [0, 0.74, 0.4], [0.1, 0.07, 0.05]);

  // muzzle (upper jaw)
  ell(P.cream, [0, 0.725, 0.43], [0.065, 0.05, 0.07]);
  ell(P.nose, [0, 0.745, 0.495], [0.026, 0.02, 0.018]);
  ell("#6b6a78", [0.006, 0.752, 0.508], [0.007, 0.005, 0.004]);
  add(new THREE.BoxGeometry(0.004, 0.02, 0.004), P.nose, [0, 0.715, 0.49]);
  for (const s of [1, -1]) {
    add(new THREE.ConeGeometry(0.007, 0.03, 5), P.cream, [s * 0.02, 0.69, 0.46], { dir: [0, -1, 0.1] });
  }

  // lower jaw
  const jb = J.jaw;
  ell(P.cream, [0, 0.685, 0.42], [0.05, 0.022, 0.065], { bone: jb });
  ell(P.cream, [0, 0.675, 0.46], [0.03, 0.015, 0.03], { bone: jb });
  ell("#ff8fa8", [0, 0.696, 0.43], [0.028, 0.008, 0.04], { bone: jb });
  for (const s of [1, -1]) {
    add(new THREE.ConeGeometry(0.006, 0.026, 5), "#ffffff", [s * 0.03, 0.7, 0.465], { bone: jb, dir: [0, 1, 0] });
  }

  for (const s of [1, -1]) {
    // eyes: ink, iris, highlights
    const ex = s * 0.066, ey = 0.79, ez = 0.395;
    const out = [s * 0.35, 0, 1];
    ell(P.ink, [ex, ey, ez], [0.03, 0.038, 0.014], { dir: out });
    ell(P.eyeIris, [ex, ey - 0.004, ez + 0.009], [0.023, 0.03, 0.01], { dir: out });
    ell(P.ink, [ex, ey - 0.004, ez + 0.017], [0.011, 0.02, 0.006], { dir: out });
    ell("#ffffff", [ex - s * 0.008, ey + 0.012, ez + 0.022], [0.008, 0.01, 0.005]);
    ell("#ffffff", [ex + s * 0.01, ey - 0.014, ez + 0.02], [0.004, 0.004, 0.003]);
    // lash flick
    add(new THREE.BoxGeometry(0.03, 0.006, 0.006), P.ink, [s * 0.09, 0.822, 0.375], { dir: [s, 0.6, 0] });
    // brow dot
    ell(P.cream, [s * 0.062, 0.838, 0.375], [0.012, 0.01, 0.008]);
    // tear marks
    add(new THREE.BoxGeometry(0.014, 0.075, 0.008), P.furDark, [s * 0.06, 0.735, 0.43], { dir: [s * -0.25, 1, 0.3] });
    add(new THREE.BoxGeometry(0.008, 0.05, 0.006), P.fur, [s * 0.075, 0.745, 0.415], { dir: [s * -0.2, 1, 0.25] });

    // ears
    const ax = s * 0.1;
    ell(P.fur, [ax, 0.885, 0.26], [0.052, 0.052, 0.025], { dir: [s * 0.4, 0.5, 0.3] });
    ell(P.cream, [ax + s * 0.004, 0.888, 0.275], [0.044, 0.044, 0.014], { dir: [s * 0.4, 0.5, 0.3] });
    ell(P.ink, [ax + s * 0.004, 0.884, 0.283], [0.03, 0.03, 0.01], { dir: [s * 0.4, 0.5, 0.3] });

    // cheek ruffs: layered blades
    for (let i = 0; i < 5; i++) {
      const y = 0.745 - i * 0.012 + r() * 0.01;
      const len = 0.075 - i * 0.006;
      add(new THREE.ConeGeometry(0.022, len, 5), i % 2 ? P.cream : "#ffe3b8",
        [s * (0.115 + i * 0.004), y, 0.35 - i * 0.012],
        { dir: [s * 1, -0.35 - i * 0.12, -0.15 - i * 0.2] });
    }
    add(new THREE.ConeGeometry(0.018, 0.06, 5), P.furDark, [s * 0.1, 0.8, 0.3], { dir: [s, 0.2, -0.4] });
    ell(P.cream, [s * 0.11, 0.725, 0.36], [0.04, 0.04, 0.05]);
  }
}
    return buildHead;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const CREAM = P.cream, FUR = P.fur, DARK = P.furDark;
  const pts: number[][] = [
    [0, 0.52, -0.28],
    [0, 0.56, -0.5],
    [0, 0.7, -0.68],
    [0, 0.86, -0.74],
    [0, 0.97, -0.66],
  ];
  const path = catmull(pts);
  const tail1 = J.tail1, tail2 = J.tail2, tail3 = J.tail3;
  const radius = (t: number): [number, number] => {
    const r = 0.04 + 0.1 * Math.sin(Math.min(1, t * 1.05) * Math.PI * 0.85) + 0.01;
    return [r, r * 0.95];
  };
  const bands: [number, string][] = [];
  const N = 9;
  for (let i = 0; i < N; i++) {
    const end = (i + 1) / N;
    bands.push([end, i === N - 1 ? P.ink : i % 2 ? DARK : FUR]);
  }
  const body = b.sweep(path, radius, {
    bone: [tail1, tail2, tail3],
    bands,
    sides: 8,
    caps: "round",
  });

  // cream ring edges: thin cream rings between bands
  for (let i = 1; i < N - 1; i++) {
    const t = i / N;
    const p = body.at(t, 0);
    const r = radius(t)[0];
    const ring = b.part(new THREE.TorusGeometry(r * 1.0, 0.006, 4, 10), CREAM, {
      at: path.at(t),
      dir: path.tangentAt(t),
      axis: "z",
      bone: t < 0.35 ? tail1 : t < 0.7 ? tail2 : tail3,
    });
    void p; void ring;
  }

  // fur tufts along sides
  for (const s of [1, -1]) {
    for (let i = 0; i < 12; i++) {
      const t = 0.1 + (i / 12) * 0.82;
      const hit = body.at(t, s * (80 + R() * 20));
      const col = i % 2 ? FUR : DARK;
      b.spike(hit, hit, 0.06 + R() * 0.03, 0.018, { color: col });
    }
  }
  // top tufts
  for (let i = 0; i < 8; i++) {
    const t = 0.15 + (i / 8) * 0.75;
    const hit = body.at(t, (R() - 0.5) * 40);
    b.spike(hit, hit, 0.05, 0.016, { color: i % 3 === 0 ? CREAM : FUR });
  }
  // cream flecks
  for (let i = 0; i < 8; i++) {
    const hit = body.at(0.15 + R() * 0.7, R() * 360);
    b.stick(new THREE.SphereGeometry(0.01, 5, 4), CREAM, hit, { embed: 0.4 });
  }
}
    return buildTail;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "redPandaOnStone" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.5,-0.12], dir: [0,0,1], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["hips"], at: [0,0.52,0.14], dir: [0,0.2,1], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["chest"], at: [0,0.62,0.2], dir: [0,1,0.5], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,0.72,0.27], dir: [0,0,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,0.72,0.34], dir: [0,0,1], role: "jaw" });
  J["tail1"] = b.joint("tail1", { parent: J["hips"], at: [0,0.52,-0.28], dir: [0,0.3,-1], role: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,0.56,-0.5], dir: [0,0.5,-1], role: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,0.7,-0.72], dir: [0,1,-0.5], role: "tail" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["chest"], at: [0.12,0.5,0.2], dir: [0,-1,0.2], role: "arm" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["chest"], at: [-0.12,0.5,0.2], dir: [0,-1,0.2], role: "arm" });
  J["hipL"] = b.joint("hipL", { parent: J["hips"], at: [0.13,0.48,-0.2], dir: [0,-1,0], role: "leg" });
  J["hipR"] = b.joint("hipR", { parent: J["hips"], at: [-0.13,0.48,-0.2], dir: [0,-1,0], role: "leg" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
