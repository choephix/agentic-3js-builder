import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Cardboard Box Robot Kid",
  "description": "A child in a handmade cardboard-box robot costume with foil, bottle-cap buttons, duct tape and marker details."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  cardboard: "#b98a55",
  cardboardLight: "#d3a96f",
  cardboardDark: "#8a6238",
  corrugation: "#9c7143",
  tapeSilver: "#c9ced3",
  tapeRed: "#d63a2f",
  foil: "#dfe4ea",
  foilShade: "#a9b2bd",
  marker: "#1d1d24",
  markerBlue: "#2f5fd0",
  capRed: "#e04a3a",
  capYellow: "#f2c230",
  capGreen: "#3fae5a",
  skin: "#f1c7a0",
  skinShade: "#d9a47c",
  hair: "#5a3a22",
  eyeWhite: "#ffffff",
  shirt: "#3f7fd0",
  pants: "#3a4a6a",
  shoe: "#f4f0e6",
  sole: "#c7312c",
  strawPink: "#ff6fa5",
  pom: "#ffd23f",
};
const M = {
  hips: [0, 0.5, 0] as [number, number, number],
  chest: [0, 0.78, 0] as [number, number, number],
  neck: [0, 1, 0] as [number, number, number],
  headCenter: [0, 1.16, 0] as [number, number, number],
  shoulderL: [0.3, 0.92, 0] as [number, number, number],
  shoulderR: [-0.3, 0.92, 0] as [number, number, number],
  hipL: [0.1, 0.5, 0] as [number, number, number],
  hipR: [-0.1, 0.5, 0] as [number, number, number],
  ankleL: [0.12, 0.07, 0] as [number, number, number],
  ankleR: [-0.12, 0.07, 0] as [number, number, number],
  wristL: [0.58, 0.64, 0.02] as [number, number, number],
  wristR: [-0.58, 0.64, 0.02] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // kidBody
  (() => {
function buildKidBody({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const sph = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);
  const put = (g: THREE.BufferGeometry, color: string, bone: any, at: number[], o: any = {}) =>
    b.part(g, color, { bone, at, ...o });
  const HC = M.headCenter;

  // Torso (shirt) under the box
  put(new THREE.BoxGeometry(0.3, 0.3, 0.22), P.shirt, J.chest, [0, 0.82, 0]);
  put(new THREE.BoxGeometry(0.28, 0.14, 0.2), P.shirt, J.hips, [0, 0.6, 0]);
  put(new THREE.BoxGeometry(0.26, 0.04, 0.21), P.cardboardDark, J.chest, [0, 0.69, 0]); // belt shade
  // Shorts hips
  put(new THREE.BoxGeometry(0.31, 0.12, 0.22), P.pants, J.hips, [0, 0.52, 0]);
  for (const s of [1, -1]) {
    put(new THREE.CylinderGeometry(0.075, 0.07, 0.1, 8), P.pants, J.hips, [s * 0.1, 0.47, 0]);
    // arms stubs & hands
    put(sph(0.05, 8, 6), P.shirt, J.chest, [s * 0.18, 0.92, 0]);
    put(sph(0.045, 8, 6), P.skin, J.chest, [s * 0.2, 0.84, 0.01], { scale: [1, 1, 1] });
  }
  // Neck
  put(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 8), P.skin, J.neck, [0, 1.0, 0]);
  put(new THREE.CylinderGeometry(0.075, 0.08, 0.03, 8), P.shirt, J.neck, [0, 0.96, 0]); // collar

  // Head
  put(sph(0.14, 14, 10), P.skin, J.head, [HC[0], HC[1], 0], { scale: [1, 0.95, 0.95] });
  // hair cap
  put(sph(0.15, 14, 8), P.hair, J.head, [0, HC[1] + 0.035, -0.02], { scale: [1, 0.8, 0.95] });
  put(new THREE.BoxGeometry(0.26, 0.05, 0.03), P.hair, J.head, [0, HC[1] + 0.105, 0.1]); // fringe
  for (let i = 0; i < 5; i++) {
    const x = -0.09 + i * 0.045;
    put(new THREE.ConeGeometry(0.03, 0.07 + R() * 0.03, 5), P.hair, J.head, [x, HC[1] + 0.085, 0.125], {
      rotation: [180, 0, (R() - 0.5) * 20],
    });
  }
  for (let i = 0; i < 3; i++)
    put(new THREE.ConeGeometry(0.035, 0.09, 5), P.hair, J.head, [(i - 1) * 0.07, HC[1] + 0.17, -0.03], {
      rotation: [(R() - 0.5) * 30, 0, (i - 1) * -25],
    });
  for (const s of [1, -1]) {
    // ears
    put(sph(0.035, 8, 6), P.skin, J.head, [s * 0.14, HC[1] - 0.01, 0], { scale: [0.6, 1, 1] });
    put(sph(0.02, 6, 5), P.skinShade, J.head, [s * 0.15, HC[1] - 0.01, 0.004]);
    // eyes
    put(sph(0.032, 10, 8), P.eyeWhite, J.head, [s * 0.052, HC[1] + 0.015, 0.118], { scale: [1, 1.15, 0.6] });
    put(sph(0.021, 8, 6), P.marker, J.head, [s * 0.052, HC[1] + 0.012, 0.13], { scale: [1, 1.1, 0.5] });
    put(sph(0.008, 6, 4), P.eyeWhite, J.head, [s * 0.058, HC[1] + 0.022, 0.138]);
    put(sph(0.004, 5, 4), P.eyeWhite, J.head, [s * 0.046, HC[1] + 0.005, 0.138]);
    // brows
    put(new THREE.BoxGeometry(0.05, 0.01, 0.01), P.hair, J.head, [s * 0.055, HC[1] + 0.06, 0.125], {
      rotation: [0, 0, s * -10],
    });
    // cheeks
    put(sph(0.022, 8, 6), "#f0a08a", J.head, [s * 0.09, HC[1] - 0.04, 0.1], { scale: [1, 0.7, 0.4] });
  }
  // nose
  put(sph(0.016, 8, 6), P.skinShade, J.head, [0, HC[1] - 0.012, 0.136]);

  // Mouth: upper and lower jaw
  const jawY = HC[1] - 0.075;
  put(new THREE.BoxGeometry(0.07, 0.014, 0.02), P.marker, J.head, [0, jawY + 0.012, 0.122]);
  put(new THREE.BoxGeometry(0.02, 0.01, 0.02), P.marker, J.head, [0.04, jawY + 0.02, 0.118], { rotation: [0, 0, 35] });
  put(new THREE.BoxGeometry(0.02, 0.01, 0.02), P.marker, J.head, [-0.04, jawY + 0.02, 0.118], { rotation: [0, 0, -35] });
  put(new THREE.BoxGeometry(0.06, 0.012, 0.018), "#c9605a", J.jaw, [0, jawY, 0.12]); // tongue lip
  put(new THREE.BoxGeometry(0.1, 0.03, 0.09), P.skin, J.jaw, [0, jawY - 0.028, 0.075]); // chin
  put(sph(0.045, 8, 6), P.skin, J.jaw, [0, jawY - 0.03, 0.08], { scale: [1.2, 0.6, 0.9] });
  put(new THREE.BoxGeometry(0.05, 0.008, 0.012), P.eyeWhite, J.jaw, [0, jawY + 0.003, 0.124]); // teeth
}
    return buildKidBody;
  })(),
  // costumeTorso
  (() => {
function buildCostumeTorso({ b, J, P }: any) {
  const R = rng(5);
  const chest = J.chest, hips = J.hips;
  const box = (w: number, h: number, d: number, c: string, at: number[], rot: number[] = [0, 0, 0], bone = chest) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const cyl = (r: number, h: number, c: string, at: number[], dir: number[], seg = 12, bone = chest) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { bone, at, dir });

  // main box (hollow look: walls) 
  box(0.6, 0.46, 0.48, P.cardboard, [0, 0.74, 0]);
  box(0.6, 0.04, 0.48, P.cardboardDark, [0, 0.52, 0], [0, 0, 0], hips);
  // neck hole rim
  box(0.26, 0.012, 0.26, P.marker, [0, 0.975, 0]);
  // top flaps
  const flaps: [number, number, number, number, number][] = [
    [0, 0.99, 0.2, -28, 0], [0, 0.99, -0.2, 28, 0],
  ];
  for (const [x, y, z, rx] of flaps) box(0.58, 0.015, 0.17, P.cardboardLight, [x, y + 0.02, z + (z > 0 ? 0.06 : -0.06)], [rx * (z > 0 ? 1 : 1) * Math.PI / 180 * (z > 0 ? -1 : 1) * -1, 0, 0]);
  for (const s of [1, -1]) box(0.16, 0.015, 0.4, P.cardboardLight, [s * 0.34, 1.0, 0], [0, 0, s * -0.4]);
  // bottom flaps
  box(0.6, 0.015, 0.1, P.cardboardDark, [0, 0.5, 0.27], [0.5, 0, 0], hips);
  box(0.6, 0.015, 0.1, P.cardboardDark, [0, 0.5, -0.27], [-0.5, 0, 0], hips);
  // corrugated edge stripes on front vertical edges
  for (const sx of [1, -1]) for (const sz of [1, -1])
    for (let i = 0; i < 9; i++)
      box(0.012, 0.03, 0.012, P.corrugation, [sx * 0.302, 0.52 + i * 0.05 + 0.02, sz * 0.242]);
  for (let i = 0; i < 10; i++) box(0.5 / 10 * 0.6, 0.012, 0.01, P.corrugation, [-0.27 + i * 0.06, 0.982, 0.242]);
  // tape seams
  box(0.62, 0.05, 0.49, P.tapeSilver, [0, 0.74, 0]).mesh.scale.set(1, 1, 1);
  box(0.05, 0.47, 0.492, P.tapeRed, [0, 0.74, 0]);
  // wobbly tape strips
  for (let i = 0; i < 4; i++) box(0.06, 0.012, 0.012, P.tapeSilver, [-0.2 + i * 0.13, 0.99, 0.246], [0, 0, (R() - 0.5) * 0.4]);
  // control panel
  const pz = 0.246;
  box(0.34, 0.2, 0.01, P.cardboardLight, [0, 0.79, pz], [0, 0, 0.03]);
  box(0.34, 0.012, 0.012, P.marker, [0, 0.89, pz + 0.004]);
  box(0.34, 0.012, 0.012, P.marker, [0, 0.69, pz + 0.004]);
  box(0.012, 0.2, 0.012, P.marker, [-0.17, 0.79, pz + 0.004]);
  box(0.012, 0.2, 0.012, P.marker, [0.17, 0.79, pz + 0.004]);
  // buttons
  const caps = [P.capRed, P.capYellow, P.capGreen];
  caps.forEach((c, i) => {
    cyl(0.025, 0.014, c, [-0.12 + i * 0.06, 0.84, pz + 0.01], [0, 0, 1]);
    cyl(0.012, 0.016, P.cardboardLight, [-0.12 + i * 0.06, 0.84, pz + 0.012], [0, 0, 1], 8);
  });
  // dial
  cyl(0.045, 0.012, P.foil, [0.09, 0.76, pz + 0.01], [0, 0, 1], 14);
  box(0.006, 0.04, 0.006, P.markerBlue, [0.09, 0.78, pz + 0.018], [0, 0, -0.6]);
  // grille
  for (let i = 0; i < 5; i++) box(0.12, 0.01, 0.008, P.marker, [-0.07, 0.72 + i * 0.02, pz + 0.006]);
  // label with staples
  box(0.12, 0.07, 0.006, P.eyeWhite, [-0.17, 0.6, pz], [0, 0, -0.08]);
  box(0.07, 0.008, 0.008, P.markerBlue, [-0.17, 0.61, pz + 0.005], [0, 0, -0.08]);
  box(0.05, 0.008, 0.008, P.marker, [-0.17, 0.585, pz + 0.005], [0, 0, -0.08]);
  for (const x of [-0.225, -0.115]) box(0.012, 0.004, 0.006, P.foilShade, [x, 0.635, pz + 0.006]);
  // arm holes with torn rims
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.01, 12), P.marker, { bone: chest, at: [s * 0.302, 0.88, 0], dir: [1, 0, 0] });
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      box(0.012, 0.03, 0.02, P.cardboardLight, [s * 0.304, 0.88 + Math.sin(a) * 0.085, Math.cos(a) * 0.085], [a, 0, 0.2 * R()]);
    }
    // shoulder strap tape
    box(0.06, 0.012, 0.3, P.tapeSilver, [s * 0.2, 1.003, 0]);
  }
  // backpack
  box(0.4, 0.36, 0.14, P.cardboardDark, [0, 0.76, -0.31]);
  box(0.42, 0.04, 0.16, P.cardboardLight, [0, 0.95, -0.31]);
  box(0.4, 0.05, 0.142, P.tapeRed, [0, 0.7, -0.31]);
  cyl(0.045, 0.2, P.foil, [0.1, 0.8, -0.43], [0, 0, 1], 12);
  cyl(0.034, 0.02, P.marker, [0.1, 0.8, -0.535], [0, 0, 1], 10);
  for (let i = 0; i < 4; i++) cyl(0.047, 0.01, P.foilShade, [0.1, 0.74 + i * 0.001, -0.37 - i * 0.045], [0, 0, 1], 12);
  for (let i = 0; i < 6; i++) box(0.012, 0.025, 0.01, P.corrugation, [-0.17 + i * 0.065, 0.58, -0.385]);
  box(0.1, 0.06, 0.006, P.capYellow, [-0.1, 0.8, -0.385]);
  box(0.06, 0.012, 0.008, P.marker, [-0.1, 0.8, -0.39]);
}
    return buildCostumeTorso;
  })(),
  // costumeHelmet
  (() => {
function buildCostumeHelmet({ b, J, P, M }: Ctx) {
  const head = J.head;
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, at: number[], rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: head, at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, c: string, at: number[], axis: "x" | "y" | "z" = "y", seg = 12) => {
    const dir = axis === "x" ? [1, 0, 0] : axis === "z" ? [0, 0, 1] : [0, 1, 0];
    return b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: head, at, dir });
  };

  const cy = 1.175, zc = 0.01;
  const W = 0.54, H = 0.34, D = 0.44, F = zc + D / 2;
  // visor opening: x +-0.15, y 1.1..1.27
  const vy0 = 1.09, vy1 = 1.27, vx = 0.16;
  const vc = (vy0 + vy1) / 2, vh = vy1 - vy0;
  // shell built around the opening
  box(W, 1.09 - 1.0, D, P.cardboard, [0, 1.045, zc]); // bottom band
  box(W, 1.35 - 1.27 - 0.02, D, P.cardboard, [0, 1.31, zc]); // top band
  const sideW = (W - vx * 2) / 2;
  for (const s of [1, -1]) box(sideW, vh + 0.01, D, P.cardboard, [s * (vx + sideW / 2), vc, zc]);
  // back & inner dark
  box(vx * 2, vh, 0.02, P.cardboardDark, [0, vc, zc - D / 2 + 0.03]);
  // visor rim dark + corrugation
  box(vx * 2 + 0.03, 0.012, 0.012, P.marker, [0, vy1 + 0.004, F + 0.004]);
  box(vx * 2 + 0.03, 0.012, 0.012, P.marker, [0, vy0 - 0.004, F + 0.004]);
  for (const s of [1, -1]) box(0.012, vh + 0.02, 0.012, P.marker, [s * (vx + 0.004), vc, F + 0.004]);
  for (let i = 0; i < 9; i++) {
    const x = -vx + 0.02 + i * ((vx * 2 - 0.04) / 8);
    box(0.008, 0.006, 0.02, P.corrugation, [x, vy1 + 0.003, F - 0.01]);
  }
  // pane (pale translucent look)
  box(vx * 2 + 0.01, vh + 0.01, 0.004, "#e8f3f8", [0, vc, F - 0.08]);
  box(0.02, vh * 0.8, 0.005, "#ffffff", [-0.1, vc, F - 0.077], [0, 0, 20]);
  box(0.008, vh * 0.7, 0.005, "#ffffff", [-0.06, vc, F - 0.077], [0, 0, 20]);
  // tape corners on pane
  for (const sx of [1, -1])
    for (const sy of [1, -1])
      box(0.04, 0.012, 0.006, P.tapeSilver, [sx * (vx - 0.01), vc + sy * (vh / 2 - 0.004), F + 0.006], [0, 0, sx * sy * 45]);
  // top corrugated edge stripes front/back
  for (let i = 0; i < 12; i++) {
    const x = -0.24 + i * 0.0436;
    box(0.012, 0.012, 0.004, P.corrugation, [x, 1.35 - 0.006, F + 0.002]);
    box(0.012, 0.012, 0.004, P.corrugation, [x, 1.0 + 0.006, F + 0.002]);
  }
  // top wobbly flaps
  for (const [i, s] of [1, -1].entries()) {
    b.part(new THREE.BoxGeometry(0.27, 0.01, 0.2), i ? P.cardboardLight : P.cardboardDark, {
      bone: head, at: [s * 0.14, 1.36, zc + s * 0.0 + 0.08], rotation: [-8 + R() * 6, s * 4, s * -12],
    });
  }
  b.part(new THREE.BoxGeometry(0.5, 0.01, 0.16), P.cardboardLight, { bone: head, at: [0, 1.358, zc - 0.17], rotation: [10, 2, 0] });
  b.part(new THREE.BoxGeometry(0.5, 0.01, 0.12), P.cardboardLight, { bone: head, at: [0.01, 1.355, zc + 0.2], rotation: [-14, -2, 0] });
  // tape strips top
  box(0.05, 0.004, 0.44, P.tapeSilver, [0, 1.352, zc]);
  box(0.4, 0.004, 0.04, P.tapeRed, [0, 1.354, zc - 0.05]);

  // smile vent below visor on front
  box(0.2, 0.05, 0.004, P.cardboardDark, [0, 1.045, F + 0.003]);
  for (let i = 0; i < 7; i++) {
    const x = -0.09 + i * 0.03;
    const y = 1.045 + (Math.abs(i - 3) - 1.5) * -0.006 - 0.0;
    box(0.008, 0.032, 0.004, P.marker, [x, y + 0.004, F + 0.006]);
  }
  // marker smile curve
  for (let i = 0; i < 9; i++) {
    const t = (i / 8) * 2 - 1;
    box(0.03, 0.007, 0.004, P.marker, [t * 0.115, 1.025 + t * t * 0.02 + 0.0, F + 0.006], [0, 0, t * 25]);
  }
  // tape bands front
  box(0.03, 0.34, 0.004, P.tapeRed, [-0.24, cy, F + 0.002]);
  box(0.03, 0.34, 0.004, P.tapeSilver, [0.24, cy, F + 0.002]);

  // side: lightning bolt and ears (right/left)
  const sx = W / 2;
  // bolt on -X side? put bolt on +X
  const bolt = [[0.07, 0.07], [0.0, 0.0], [0.04, -0.01], [-0.04, -0.08]];
  box(0.004, 0.17, 0.17, P.capYellow, [sx + 0.002, cy - 0.01, zc]);
  box(0.005, 0.15, 0.15, P.cardboardLight, [sx + 0.003, cy - 0.01, zc]);
  const seg = (a: number[], c: number[]) => {
    const dz = c[0] - a[0], dy = c[1] - a[1];
    const len = Math.hypot(dz, dy);
    b.part(new THREE.BoxGeometry(0.006, len, 0.014), P.markerBlue, {
      bone: head, at: [sx + 0.008, cy - 0.01 + (a[1] + c[1]) / 2, zc + (a[0] + c[0]) / 2],
      rotation: [(Math.atan2(dz, dy) * 180) / Math.PI * -1, 0, 0],
    });
  };
  seg([0.05, 0.06], [-0.02, 0.005]);
  seg([-0.02, 0.005], [0.03, 0.0]);
  seg([0.03, 0.0], [-0.04, -0.06]);
  // other side: tape cross
  box(0.004, 0.2, 0.03, P.tapeSilver, [-sx - 0.002, cy, zc]);
  box(0.004, 0.03, 0.2, P.tapeRed, [-sx - 0.002, cy, zc]);

  // ears: foil cylinders with caps
  for (const s of [1, -1]) {
    const ex = s * (sx + 0.04);
    cyl(0.05, 0.05, 0.08, P.foil, [ex, cy, zc], "x");
    for (let i = -2; i <= 2; i++) cyl(0.052, 0.052, 0.006, P.foilShade, [ex, cy, zc + 0.0].map((v, k) => (k === 0 ? v : v)), "x").position.x += 0 * i;
    cyl(0.052, 0.052, 0.01, P.foilShade, [s * (sx + 0.015), cy, zc], "x");
    cyl(0.03, 0.03, 0.012, s > 0 ? P.capRed : P.capGreen, [s * (sx + 0.085), cy, zc], "x", 10);
    cyl(0.012, 0.012, 0.014, P.capYellow, [s * (sx + 0.09), cy, zc], "x", 8);
  }

  // antenna: bendy straw
  const pts: number[][] = [[0.07, 1.35, -0.05], [0.07, 1.42, -0.05], [0.09, 1.49, -0.05], [0.09, 1.54, -0.05]];
  // keep inside spec-ish: base on top, kinked segments
  const base = [0.08, 1.35, -0.06];
  let prev = base;
  const kinks = [[0.08, 1.41, -0.06], [0.1, 1.45, -0.06], [0.1, 1.5, -0.06], [0.12, 1.54, -0.06]];
  kinks.forEach((p, i) => {
    b.rod(prev, p, 0.007, i % 2 ? P.strawPink : P.tapeRed, { bone: head });
    if (i < kinks.length - 1) b.part(new THREE.SphereGeometry(0.009, 6, 4), P.strawPink, { bone: head, at: p });
    prev = p;
  });
  void pts;
  cyl(0.014, 0.014, 0.01, P.tapeSilver, [0.08, 1.355, -0.06]);
  b.part(new THREE.IcosahedronGeometry(0.035, 0), P.pom, { bone: head, at: [0.12, 1.57, -0.06], flat: true });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.IcosahedronGeometry(0.014, 0), P.pom, { bone: head, at: [0.12 + Math.cos(a) * 0.03, 1.57 + Math.sin(a * 2) * 0.015, -0.06 + Math.sin(a) * 0.03], flat: true });
  }

  // back: staples & tape
  box(0.54, 0.03, 0.004, P.tapeSilver, [0, 1.2, zc - D / 2 - 0.002]);
  for (let i = 0; i < 4; i++) box(0.03, 0.006, 0.006, P.foilShade, [-0.18 + i * 0.12, 1.2, zc - D / 2 - 0.005]);
  // staples at visor-side corners
  for (const s of [1, -1]) for (const y of [1.14, 1.3]) box(0.02, 0.004, 0.004, P.foilShade, [s * 0.23, y, F + 0.005]);
  // bottom flap folded toward torso
  box(0.5, 0.008, 0.1, P.cardboardDark, [0, 1.0, zc + 0.2], [10, 0, 0]);
  box(0.5, 0.008, 0.1, P.cardboardDark, [0, 1.0, zc - 0.2], [-10, 0, 0]);
  void frame; void M;
}
    return buildCostumeHelmet;
  })(),
  // costumeArms
  (() => {
function buildCostumeArms({ b, J, P, M }: any) {
  const R = rng(11);
  const wob = () => (R() - 0.5) * 8;

  for (const s of [1, -1]) {
    const sh = J[s > 0 ? "shoulderL" : "shoulderR"];
    const el = J[s > 0 ? "elbowL" : "elbowR"];
    const wr = J[s > 0 ? "wristL" : "wristR"];
    const S: number[] = [s * 0.3, 0.92, 0];
    const E: number[] = [s * 0.45, 0.78, 0];
    const W: number[] = [s * 0.58, 0.64, 0.02];
    const lerp = (a: number[], c: number[], t: number) => a.map((v, i) => v + (c[i] - v) * t);

    // sleeve tubes
    b.rod(S, E, 0.05, P.foil, { bone: sh, sides: 8 });
    b.rod(E, W, 0.046, P.foil, { bone: el, sides: 8 });
    // shoulder cuff where it exits the arm hole
    b.rod(lerp(S, E, 0.0), lerp(S, E, 0.1), 0.062, P.cardboardDark, { bone: sh, sides: 8 });
    b.rod(lerp(S, E, 0.1), lerp(S, E, 0.18), 0.058, P.tapeRed, { bone: sh, sides: 8 });

    // accordion rings and foil shade stripes
    const ringsFor = (a: number[], c: number[], bone: any, r: number, n: number) => {
      for (let i = 0; i < n; i++) {
        const t = 0.24 + (0.62 * i) / (n - 1);
        const p = lerp(a, c, t);
        const q = lerp(a, c, t + 0.035);
        b.rod(p, q, r, i % 2 ? P.foilShade : P.foil, { bone, sides: 8 });
      }
    };
    ringsFor(S, E, sh, 0.056, 4);
    ringsFor(E, W, el, 0.052, 4);

    // tape cuffs
    b.rod(lerp(E, W, 0.82), lerp(E, W, 0.94), 0.054, P.tapeSilver, { bone: el, sides: 8 });
    b.rod(lerp(E, W, 0.94), lerp(E, W, 0.99), 0.057, P.tapeRed, { bone: el, sides: 8 });

    // elbow disc with brass fasteners
    const ed = new THREE.CylinderGeometry(0.07, 0.07, 0.02, 10);
    b.part(ed, P.cardboardLight, { bone: el, at: [E[0] + s * 0.0, E[1], E[2] + 0.05], dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.01, 10), P.cardboardDark, { bone: el, at: [E[0], E[1], E[2] + 0.062], dir: [0, 0, 1] });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), P.capYellow, { bone: el, at: [E[0], E[1], E[2] + 0.07] });
    for (const a of [0, 1, 2, 3, 4]) {
      const ang = (a / 5) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.007, 5, 4), P.capYellow, {
        bone: el, at: [E[0] + Math.cos(ang) * 0.05, E[1] + Math.sin(ang) * 0.05, E[2] + 0.066],
      });
    }

    // mitten claw: palm box
    const dir = new THREE.Vector3(s * 0.58 - s * 0.45, -0.14, 0.02).normalize();
    const palmC: number[] = [W[0] + dir.x * 0.045, W[1] + dir.y * 0.045, W[2]];
    b.part(new THREE.BoxGeometry(0.09, 0.07, 0.1), P.cardboard, {
      bone: wr, at: palmC, dir: dir.toArray(), rotation: [0, 0, 0],
    });
    b.part(new THREE.BoxGeometry(0.094, 0.012, 0.104), P.tapeRed, { bone: wr, at: [W[0] + dir.x * 0.01, W[1] + dir.y * 0.01, W[2]], dir: dir.toArray() });
    // two pincer prongs
    for (const z of [0.032, -0.032]) {
      const at: number[] = [W[0] + dir.x * 0.13, W[1] + dir.y * 0.13, W[2] + z];
      b.part(new THREE.BoxGeometry(0.075, 0.075, 0.03), P.cardboardLight, {
        bone: wr, at, dir: dir.toArray(), rotation: [0, 0, wob() * 0.3],
      });
      // corrugated edge stripe
      b.part(new THREE.BoxGeometry(0.076, 0.076, 0.006), P.corrugation, {
        bone: wr, at: [at[0], at[1], at[2] + Math.sign(z) * 0.017], dir: dir.toArray(),
      });
      // tip
      b.part(new THREE.BoxGeometry(0.03, 0.03, 0.026), P.cardboardDark, {
        bone: wr, at: [at[0] + dir.x * 0.05, at[1] + dir.y * 0.05, at[2]], dir: dir.toArray(),
      });
    }
    // thumb
    b.part(new THREE.BoxGeometry(0.03, 0.06, 0.03), P.cardboardLight, {
      bone: wr, at: [palmC[0], palmC[1] + 0.045, W[2] + 0.0], rotation: [0, 0, s * -20],
    });
    // marker line on palm
    b.part(new THREE.BoxGeometry(0.05, 0.006, 0.006), P.marker, { bone: wr, at: [palmC[0], palmC[1], W[2] + 0.052], dir: dir.toArray() });
  }
}
    return buildCostumeArms;
  })(),
  // costumeLegs
  (() => {
function buildCostumeLegs({ b, J, P, M }: any) {
  const r = rng(11);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);
  const put = (g: THREE.BufferGeometry, c: string, bone: any, at: number[], rot?: number[]) =>
    b.part(g, c, { bone, at, rotation: rot });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = J["hip" + side], knee = J["knee" + side], ankle = J["ankle" + side];
    const x = s * 0.11;

    // thigh and shin (pants)
    b.rod([s * 0.1, 0.5, 0], [s * 0.11, 0.29, 0], 0.052, P.pants, { bone: hip, sides: 8 });
    b.rod([s * 0.11, 0.29, 0], [s * 0.12, 0.1, 0], 0.046, P.pants, { bone: knee, sides: 8 });
    // knee disc and fastener
    put(cyl(0.05, 0.05, 0.02, 12), P.cardboardLight, knee, [s * 0.11, 0.29, 0.05], [90, 0, 0]);
    put(cyl(0.012, 0.012, 0.024, 8), P.capYellow, knee, [s * 0.11, 0.29, 0.058], [90, 0, 0]);

    // shin guard box
    const gz = 0.058;
    put(box(0.1, 0.15, 0.03), P.cardboard, knee, [x + s * 0.005, 0.19, gz]);
    put(box(0.104, 0.15, 0.006), P.cardboardDark, knee, [x + s * 0.005, 0.19, gz - 0.016]);
    // corrugation stripes on the top/bottom edges
    for (let i = 0; i < 5; i++) {
      put(box(0.016, 0.006, 0.032), P.corrugation, knee, [x + s * 0.005 + (i - 2) * 0.02, 0.268, gz]);
      put(box(0.016, 0.006, 0.032), P.corrugation, knee, [x + s * 0.005 + (i - 2) * 0.02, 0.112, gz]);
    }
    // tape band
    put(box(0.106, 0.026, 0.034), P.tapeRed, knee, [x + s * 0.005, 0.19, gz + 0.001]);
    // bolt dots
    for (const dx of [-0.032, 0.032])
      for (const y of [0.24, 0.14])
        put(new THREE.SphereGeometry(0.007, 6, 4), P.marker, knee, [x + s * 0.005 + dx, y, gz + 0.017]);
    // marker scribble
    put(box(0.05, 0.004, 0.002), P.markerBlue, knee, [x + s * 0.005, 0.225, gz + 0.016], [0, 0, (r() - 0.5) * 12]);

    // foil ankle cuff
    put(cyl(0.056, 0.058, 0.04, 10), P.foil, ankle, [s * 0.12, 0.1, 0]);
    put(cyl(0.059, 0.059, 0.008, 10), P.foilShade, ankle, [s * 0.12, 0.115, 0]);
    put(cyl(0.059, 0.059, 0.008, 10), P.foilShade, ankle, [s * 0.12, 0.085, 0]);

    // sneaker
    const fx = s * 0.12;
    put(box(0.1, 0.012, 0.2), P.sole, ankle, [fx, 0.006, 0.04]);
    put(box(0.1, 0.05, 0.19), P.shoe, ankle, [fx, 0.037, 0.04]);
    put(box(0.09, 0.05, 0.08), P.shoe, ankle, [fx, 0.05, -0.03]);
    // toe cap
    put(new THREE.SphereGeometry(0.05, 8, 6), P.shoe, ankle, [fx, 0.032, 0.115]);
    put(new THREE.SphereGeometry(0.04, 8, 5), P.eyeWhite, ankle, [fx, 0.034, 0.138]);
    put(box(0.102, 0.008, 0.02), P.sole, ankle, [fx, 0.014, 0.17]);
    // laces
    for (let i = 0; i < 3; i++) {
      put(box(0.06, 0.006, 0.01), P.tapeSilver, ankle, [fx, 0.066 + i * 0.002, 0.03 + i * 0.03]);
    }
    // sole stripe
    put(box(0.104, 0.006, 0.2), P.tapeRed, ankle, [fx, 0.016, 0.04]);
  }
}
    return buildCostumeLegs;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "cardboardRobotKid" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.5,0], dir: [0,1,0], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["hips"], at: [0,0.78,0], dir: [0,1,0], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["chest"], at: [0,1,0], dir: [0,1,0], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,1.06,0], dir: [0,1,0], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.1,0.06], dir: [0,0,1], role: "jaw" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["chest"], at: [0.3,0.92,0], dir: [1,-0.6,0], role: "arm", group: "arms" });
  J["elbowL"] = b.joint("elbowL", { parent: J["shoulderL"], at: [0.45,0.78,0], dir: [1,-0.6,0], role: "arm", group: "arms" });
  J["wristL"] = b.joint("wristL", { parent: J["elbowL"], at: [0.58,0.64,0.02], dir: [1,-0.6,0], role: "arm", group: "arms" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["chest"], at: [-0.3,0.92,0], dir: [-1,-0.6,0], role: "arm", group: "arms" });
  J["elbowR"] = b.joint("elbowR", { parent: J["shoulderR"], at: [-0.45,0.78,0], dir: [-1,-0.6,0], role: "arm", group: "arms" });
  J["wristR"] = b.joint("wristR", { parent: J["elbowR"], at: [-0.58,0.64,0.02], dir: [-1,-0.6,0], role: "arm", group: "arms" });
  J["hipL"] = b.joint("hipL", { parent: J["hips"], at: [0.1,0.5,0], dir: [0,-1,0], role: "leg", group: "legs" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.11,0.29,0], dir: [0,-1,0], role: "leg", group: "legs" });
  J["ankleL"] = b.joint("ankleL", { parent: J["kneeL"], at: [0.12,0.07,0], dir: [0,-1,0], role: "leg", group: "legs" });
  J["hipR"] = b.joint("hipR", { parent: J["hips"], at: [-0.1,0.5,0], dir: [0,-1,0], role: "leg", group: "legs" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.11,0.29,0], dir: [0,-1,0], role: "leg", group: "legs" });
  J["ankleR"] = b.joint("ankleR", { parent: J["kneeR"], at: [-0.12,0.07,0], dir: [0,-1,0], role: "leg", group: "legs" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
