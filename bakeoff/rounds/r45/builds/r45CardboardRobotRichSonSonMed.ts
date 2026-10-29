import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull, spiral } from "../../../../src/index";
import { glow, glow as glowFn } from "../../../../kits/glow";

export const meta = {
  "name": "Cardboard Box Robot Kid",
  "description": "A grinning six-year-old in a homemade cardboard-box robot costume: a taped corrugated torso box with a marker-and-bottle-cap control panel, a box helmet with a face window and foil antennae, paper-tube arms ending in cardboard pincer claws, and foil-strapped shins over sneakers."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  cardboard: "#c8955a",
  cardboardDark: "#a06f3a",
  cardboardLight: "#dcae72",
  cardboardInner: "#7e5229",
  tape: "#e3c98f",
  tapeBrown: "#7a4a22",
  marker: "#1e1a18",
  foil: "#cfd4dc",
  foilDark: "#8b93a2",
  red: "#d93a2b",
  blue: "#2f6fd6",
  yellow: "#f2c230",
  green: "#3aa656",
  glowCyan: "#5ff0ff",
  glowRed: "#ff4a3a",
  glowLime: "#8cff5a",
  skin: "#f1c09a",
  skinShade: "#d9a17c",
  hair: "#5a3418",
  leggings: "#3a4a8a",
  white: "#f6f4ee",
  sole: "#d8d0bc",
  iris: "#4a2f1d",
  mouth: "#b8504e",
};
const M = {
  hipsPivot: [0, 0.55, 0] as [number, number, number],
  torsoBase: [0, 0.5, 0] as [number, number, number],
  torsoTop: [0, 0.95, 0] as [number, number, number],
  torsoFrontFace: [0, 0.72, 0.18] as [number, number, number],
  torsoBackFace: [0, 0.74, -0.18] as [number, number, number],
  chestPanelCenter: [0, 0.73, 0.18] as [number, number, number],
  backpackCenter: [0, 0.74, -0.18] as [number, number, number],
  legTopL: [0.09, 0.5, 0] as [number, number, number],
  legTopR: [-0.09, 0.5, 0] as [number, number, number],
  ankleL: [0.09, 0.08, 0] as [number, number, number],
  ankleR: [-0.09, 0.08, 0] as [number, number, number],
  armHoleL: [0.25, 0.85, 0] as [number, number, number],
  armHoleR: [-0.25, 0.85, 0] as [number, number, number],
  elbowL: [0.47, 0.83, 0] as [number, number, number],
  elbowR: [-0.47, 0.83, 0] as [number, number, number],
  wristL: [0.68, 0.8, 0] as [number, number, number],
  wristR: [-0.68, 0.8, 0] as [number, number, number],
  neckBase: [0, 0.95, 0] as [number, number, number],
  helmetBase: [0, 0.95, 0] as [number, number, number],
  helmetCenter: [0, 1.125, 0] as [number, number, number],
  faceWindowCenter: [0, 1.125, 0.19] as [number, number, number],
  kidHeadCenter: [0, 1.12, 0.02] as [number, number, number],
  antennaBase: [0, 1.3, 0] as [number, number, number],
  earTubeL: [0.19, 1.13, 0] as [number, number, number],
  earTubeR: [-0.19, 1.13, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, n = 8) => new THREE.CylinderGeometry(rt, rb, h, n);

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const hip = J["hip" + L], knee = J["knee" + L], ankle = J["ankle" + L], toe = J["toe" + L];
    const x = s * 0.09;

    // Leg tubes
    b.sweep([[x, 0.52, 0], [x, 0.4, 0.005], [x, 0.29, 0.01]], [0.06, 0.052], { bone: hip, color: P.leggings, sides: 10, caps: "round" });
    b.sweep([[x, 0.29, 0.01], [x, 0.18, 0.005], [x, 0.09, 0]], [0.05, 0.042], { bone: knee, color: P.leggings, sides: 10, caps: "round" });
    // Knee patch
    b.part(box(0.07, 0.07, 0.014), P.leggings, { bone: knee, at: [x, 0.29, 0.058], rotation: [0, 0, s * 2] });
    b.part(box(0.05, 0.05, 0.006), "#2a3668", { bone: knee, at: [x, 0.29, 0.066], rotation: [0, 0, s * 2] });
    // Inner shadow collar at hem
    b.part(cyl(0.066, 0.066, 0.02, 10), P.cardboardInner, { bone: hip, at: [x, 0.505, 0] });

    // Thigh doodles
    const dz = 0.058;
    b.part(box(0.022, 0.005, 0.004), P.white, { bone: hip, at: [x, 0.42, dz], rotation: [0, 0, 20] });
    b.part(box(0.022, 0.005, 0.004), P.white, { bone: hip, at: [x, 0.42, dz], rotation: [0, 0, -40] });
    b.part(box(0.022, 0.005, 0.004), P.white, { bone: hip, at: [x, 0.42, dz], rotation: [0, 0, 80] });
    b.part(box(0.03, 0.005, 0.004), P.yellow, { bone: hip, at: [x + s * 0.02, 0.37, dz - 0.002], rotation: [0, 0, -15] });
    b.part(box(0.016, 0.005, 0.004), P.yellow, { bone: hip, at: [x - s * 0.02, 0.46, dz - 0.002], rotation: [0, 0, 30] });
    b.part(new THREE.SphereGeometry(0.006, 5, 4), P.white, { bone: hip, at: [x - s * 0.025, 0.4, dz] });

    // Shin guard (curved: three facets)
    const gy = 0.19, gz = 0.04;
    b.part(box(0.07, 0.15, 0.012), P.cardboard, { bone: knee, at: [x, gy, gz + 0.012], rotation: [1, 0, 0] });
    b.part(box(0.026, 0.15, 0.012), P.cardboard, { bone: knee, at: [x + 0.04, gy, gz - 0.002], rotation: [0, 25, 0] });
    b.part(box(0.026, 0.15, 0.012), P.cardboard, { bone: knee, at: [x - 0.04, gy, gz - 0.002], rotation: [0, -25, 0] });
    for (const e of [1, -1]) {
      b.part(box(0.07, 0.01, 0.016), P.cardboardDark, { bone: knee, at: [x, gy + e * 0.075, gz + 0.012] });
    }
    for (let i = 0; i < 4; i++)
      b.part(box(0.06, 0.004, 0.003), i % 2 ? P.cardboardLight : P.cardboardDark, { bone: knee, at: [x, gy - 0.05 + i * 0.033, gz + 0.019] });
    // Red stripe + bolt
    b.part(box(0.062, 0.012, 0.004), P.red, { bone: knee, at: [x, gy + 0.05, gz + 0.021] });
    const bz = gz + 0.02;
    b.part(box(0.006, 0.03, 0.003), P.marker, { bone: knee, at: [x - 0.006, gy - 0.02, bz], rotation: [0, 0, 25] });
    b.part(box(0.006, 0.03, 0.003), P.marker, { bone: knee, at: [x + 0.006, gy - 0.04, bz], rotation: [0, 0, 25] });
    b.part(box(0.022, 0.005, 0.003), P.marker, { bone: knee, at: [x, gy - 0.03, bz] });
    // Foil strips
    for (const fy of [0.25, 0.13]) {
      b.part(cyl(0.052, 0.052, 0.022, 7), P.foil, { bone: knee, at: [x, fy, 0.01], rotation: [0, r() * 20, 0] });
      b.part(cyl(0.054, 0.054, 0.004, 7), P.foilDark, { bone: knee, at: [x, fy + 0.008, 0.01] });
      b.part(box(0.02, 0.025, 0.008), P.tape, { bone: knee, at: [x + s * 0.03, fy, 0.045], rotation: [0, 0, s * 3] });
    }

    // Ankle sock
    b.part(cyl(0.043, 0.047, 0.03, 8), P.white, { bone: ankle, at: [x, 0.095, 0.003] });

    // Sneaker
    const sx = x;
    b.part(box(0.095, 0.02, 0.25), P.sole, { bone: ankle, at: [sx, 0.01, 0.08] });
    b.part(box(0.097, 0.004, 0.2), P.marker, { bone: ankle, at: [sx, 0.016, 0.09] });
    b.part(box(0.09, 0.045, 0.2), P.white, { bone: ankle, at: [sx, 0.043, 0.09] });
    b.part(box(0.088, 0.06, 0.08), P.white, { bone: ankle, at: [sx, 0.06, -0.0] });
    b.part(new THREE.SphereGeometry(0.048, 8, 6), P.white, { bone: toe, at: [sx, 0.04, 0.17], scale: [0.95, 0.75, 1.1] });
    b.part(new THREE.SphereGeometry(0.046, 8, 6), P.white, { bone: toe, at: [sx, 0.046, 0.185], scale: [0.9, 0.55, 0.8] });
    b.part(box(0.092, 0.01, 0.03), P.sole, { bone: toe, at: [sx, 0.022, 0.2] });
    // Tongue
    b.part(box(0.04, 0.03, 0.012), P.white, { bone: ankle, at: [sx, 0.092, 0.05], rotation: [-30, 0, 0] });
    // Velcro straps
    for (const vz of [0.07, 0.115]) {
      b.part(box(0.094, 0.008, 0.026), P.red, { bone: ankle, at: [sx, 0.067, vz] });
      b.part(box(0.03, 0.01, 0.012), P.white, { bone: ankle, at: [sx - s * 0.02, 0.071, vz] });
    }
    // Heel tab
    b.part(box(0.04, 0.035, 0.012), P.red, { bone: ankle, at: [sx, 0.07, -0.043] });
    // Side stripes
    for (const e of [1, -1]) {
      const side = sx + e * 0.046;
      b.part(box(0.004, 0.012, 0.09), P.red, { bone: ankle, at: [side, 0.045, 0.08], rotation: [0, 0, 0] });
      b.part(box(0.004, 0.006, 0.05), P.blue, { bone: ankle, at: [side, 0.032, 0.08] });
    }
    // Scuff
    b.part(box(0.05, 0.004, 0.02), P.sole, { bone: toe, at: [sx, 0.07, 0.205], rotation: [20, 0, 0] });
  }
}
    return buildLegs;
  })(),
  // torsoBox
  (() => {
function buildTorsoBox({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const X0 = 0.25, Z0 = 0.18, Y0 = 0.5, Y1 = 0.95, YM = (Y0 + Y1) / 2, H = Y1 - Y0;
  const bone = J.chest;
  const box = (w: number, h: number, d: number, color: string, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: o.bone ?? bone, at, rotation: o.rot });
  const cyl = (r: number, len: number, color: string, at: number[], axis: "x" | "y" | "z", seg = 16) => {
    const rot = axis === "x" ? [0, 0, 90] : axis === "z" ? [90, 0, 0] : [0, 0, 0];
    return b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { bone, at, rotation: rot });
  };

  // walls (thin shell)
  const t = 0.012;
  box(2 * X0, H, t, P.cardboard, [0, YM, Z0 - t / 2]);
  box(2 * X0, H, t, P.cardboard, [0, YM, -Z0 + t / 2]);
  box(t, H, 2 * Z0, P.cardboard, [X0 - t / 2, YM, 0]);
  box(t, H, 2 * Z0, P.cardboard, [-X0 + t / 2, YM, 0]);
  // dark inside + hem rim
  box(2 * X0 - 0.04, 0.01, 2 * Z0 - 0.04, P.marker, [0, Y0 + 0.02, 0]);
  box(2 * X0 - 0.03, 0.02, 0.012, P.cardboardInner, [0, Y0 + 0.01, Z0 - 0.02]);
  box(2 * X0 - 0.03, 0.02, 0.012, P.cardboardInner, [0, Y0 + 0.01, -Z0 + 0.02]);
  box(0.012, 0.02, 2 * Z0 - 0.03, P.cardboardInner, [X0 - 0.02, Y0 + 0.01, 0]);
  box(0.012, 0.02, 2 * Z0 - 0.03, P.cardboardInner, [-X0 + 0.02, Y0 + 0.01, 0]);

  // corner edge strips and hem strips
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    box(0.02, H, 0.02, P.cardboardDark, [sx * (X0 - 0.005), YM, sz * (Z0 - 0.005)]);
    // tape on corners
    box(0.03, H - 0.02, 0.03, P.tape, [sx * (X0 + 0.0), YM, sz * (Z0 + 0.0)]);
    box(0.026, H - 0.02, 0.026, P.cardboardDark, [sx * (X0 - 0.003), YM, sz * (Z0 - 0.003)]).mesh.visible = false;
  }
  for (const sz of [1, -1]) box(2 * X0 + 0.01, 0.025, 0.012, P.cardboardDark, [0, Y0 + 0.0125, sz * (Z0 + 0.002)]);
  for (const sx of [1, -1]) box(0.012, 0.025, 2 * Z0 + 0.01, P.cardboardDark, [sx * (X0 + 0.002), Y0 + 0.0125, 0]);

  // ridges
  for (const sz of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const y = Y0 + 0.07 + i * 0.1;
      if (sz === 1 && y > 0.58 && y < 0.88) continue;
      box(2 * X0 - 0.06, 0.006, 0.004, i % 2 ? P.cardboardDark : P.cardboardLight, [0, y, sz * (Z0 + 0.001)]);
    }
  }
  for (const sx of [1, -1]) for (let i = 0; i < 4; i++) {
    const y = Y0 + 0.06 + i * 0.1;
    if (y > 0.76 && y < 0.92) continue;
    box(0.004, 0.006, 2 * Z0 - 0.06, i % 2 ? P.cardboardDark : P.cardboardLight, [sx * (X0 + 0.001), y, 0]);
  }

  // back X tape
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.34, 0.03, 0.006), P.tape, { bone, at: [0.05, 0.72, -Z0 - 0.003], rotation: [0, 0, s * 38] });
  box(0.08, 0.06, 0.004, P.cardboardDark, [0.05, 0.72, -Z0 - 0.001]);

  // top flaps
  const ft = 0.01, ang = 20;
  for (const s of [1, -1]) {
    const f = box(2 * X0, ft, 0.12, P.cardboard, [0, Y1 + 0.02, s * (Z0 - 0.04) + s * 0.03], { rot: [-s * ang, 0, 0] });
    box(2 * X0 - 0.02, 0.004, 0.11, P.cardboardInner, [0, Y1 + 0.013, s * (Z0 - 0.04) + s * 0.03 - s * 0.002], { rot: [-s * ang, 0, 0] });
    box(0.07, 0.006, 0.05, P.tape, [s * 0.12, Y1 + 0.032, s * (Z0 + 0.0) + s * 0.03], { rot: [-s * ang, 0, s * 2] });
  }
  // folded-in side flaps
  for (const s of [1, -1]) {
    box(0.07, ft, 0.26, P.cardboardInner, [s * (X0 - 0.05), Y1 - 0.005, 0]);
    box(0.06, 0.004, 0.26, P.cardboardLight, [s * (X0 - 0.05), Y1 + 0.002, 0]);
    box(0.03, 0.006, 0.06, P.tape, [s * (X0 - 0.045), Y1 + 0.006, 0.05], { rot: [0, 3, 0] });
  }
  // neck hole shirt collar ring
  b.part(new THREE.TorusGeometry(0.075, 0.016, 6, 14), P.leggings, { bone, at: [0, Y1 - 0.005, 0], rotation: [90, 0, 0] });
  b.part(new THREE.TorusGeometry(0.09, 0.006, 4, 14), P.marker, { bone, at: [0, Y1 + 0.004, 0], rotation: [90, 0, 0] });

  // arm holes
  for (const s of [1, -1]) {
    const x = s * X0;
    b.part(new THREE.TorusGeometry(0.075, 0.006, 4, 18), P.marker, { bone, at: [x + s * 0.002, 0.85, 0], rotation: [0, 90, 0] });
    b.part(new THREE.CylinderGeometry(0.067, 0.067, 0.03, 16, 1, true), P.cardboardInner, { bone, at: [x - s * 0.012, 0.85, 0], rotation: [0, 0, 90] });
    b.part(new THREE.RingGeometry(0.058, 0.07, 16), P.cardboardInner, { bone, at: [x + s * 0.0035, 0.85, 0], rotation: [0, s * 90, 0] });
    b.part(new THREE.CircleGeometry(0.058, 16), P.marker, { bone, at: [x - s * 0.003, 0.85, 0], rotation: [0, s * 90, 0] });
  }

  // shoulder straps
  for (const s of [1, -1]) {
    const x = s * 0.1;
    box(0.035, 0.008, 0.2, P.tape, [x, Y1 + 0.03, 0.0], { rot: [0, 0, s * 2] });
    box(0.006, 0.006, 0.2, P.tapeBrown, [x + s * 0.02, Y1 + 0.036, 0]);
    box(0.035, 0.1, 0.008, P.tape, [x, Y1 - 0.04, Z0 + 0.004]).mesh.visible = false;
    box(0.035, 0.12, 0.006, P.tape, [x, 0.88, Z0 + 0.044 - 0.04], { rot: [-20, 0, 0] }).mesh.visible = false;
  }

  // shipping label on lower left side (+X)
  const lx = X0 + 0.002;
  box(0.004, 0.09, 0.14, P.tapeBrown, [lx, 0.6, 0.02]);
  box(0.005, 0.07, 0.11, P.tape, [lx + 0.0005, 0.6, 0.02]);
  for (let i = 0; i < 4; i++) box(0.006, 0.005, 0.08 - (i % 2) * 0.02, P.marker, [lx + 0.001, 0.625 - i * 0.015, 0.02 - (i % 2) * 0.01]);
  // THIS SIDE UP arrow on the left side
  box(0.006, 0.07, 0.012, P.marker, [lx + 0.001, 0.69, -0.1]);
  b.part(new THREE.ConeGeometry(0.03, 0.04, 3), P.marker, { bone, at: [lx + 0.001, 0.74, -0.1], rotation: [0, 0, 0] });
  box(0.006, 0.01, 0.06, P.marker, [lx + 0.001, 0.62, -0.1]);
  // FRAGILE sticker on right side
  box(0.004, 0.06, 0.12, P.red, [-X0 - 0.002, 0.6, -0.05], { rot: [2, 0, 0] });
  for (let i = 0; i < 3; i++) box(0.005, 0.008, 0.08 - i * 0.015, P.white, [-X0 - 0.004, 0.615 - i * 0.015, -0.05]);

  // front scuffs and back scuffs
  for (let i = 0; i < 6; i++) {
    const sx = R() < 0.5 ? 1 : -1, sz = R() < 0.5 ? 1 : -1;
    box(0.04 + R() * 0.03, 0.03 + R() * 0.04, 0.004, P.cardboardDark, [sx * (X0 - 0.04), Y0 + 0.05 + R() * 0.35, sz * (Z0 + 0.0015)], { rot: [0, 0, R() * 4 - 2] });
  }
  // hot glue blobs
  const blobs: number[][] = [[0.2, 0.93, Z0], [-0.19, 0.55, Z0], [0.18, 0.9, -Z0], [-0.2, 0.9, -Z0], [X0, 0.55, -0.12], [-X0, 0.93, 0.1]];
  for (const p of blobs)
    b.part(new THREE.SphereGeometry(0.011, 6, 4), "#efe6cf", { bone, at: p, scale: [1, 1, 0.5] });
}
    return buildTorsoBox;
  })(),
  // gadgets
  (() => {
function buildGadgets({ b, J, P, M }: Ctx) {
  const chest = J.chest;
  const spine = J.spine;
  const R = rng(11);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, s = 12) => new THREE.CylinderGeometry(r, r, h, s);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone: o.bone ?? chest, at, rotation: o.rot, ...(o.dir ? { dir: o.dir, axis: o.axis ?? "y" } : {}) });
  // front-facing flat cylinder (axis along z)
  const disc = (r: number, h: number, c: string, at: number[], s = 12, bone = chest) =>
    put(cyl(r, h, s), c, at, { bone, dir: [0, 0, 1] });
  const bar = (w: number, h: number, c: string, at: number[], rotZ = 0, d = 0.004, bone = chest) =>
    put(box(w, h, d), c, at, { bone, rot: [0, 0, rotZ] });

  const cx = M.chestPanelCenter[0], cy = M.chestPanelCenter[1];
  const zf = 0.18;
  // ---------- FRONT PANEL ----------
  put(box(0.32, 0.24, 0.02), P.cardboardDark, [cx, cy, zf + 0.01]);
  const zb = zf + 0.021;
  // tape border
  bar(0.34, 0.016, P.tape, [cx, cy + 0.124, zf + 0.012], 0.5, 0.024);
  bar(0.34, 0.016, P.tape, [cx, cy - 0.124, zf + 0.012], -0.5, 0.024);
  bar(0.016, 0.26, P.tape, [cx - 0.164, cy, zf + 0.012], 0, 0.024);
  bar(0.016, 0.26, P.tape, [cx + 0.164, cy, zf + 0.012], 0, 0.024);
  // dials
  const dialCols = [P.red, P.blue, P.yellow];
  dialCols.forEach((c, i) => {
    const x = cx - 0.095 + i * 0.095, y = cy + 0.085;
    disc(0.03, 0.012, P.marker, [x, y, zb + 0.002], 14);
    disc(0.026, 0.014, c, [x, y, zb + 0.004], 14);
    for (let k = 0; k < 5; k++) {
      const a = -1 + k * 0.5;
      bar(0.003, 0.008, P.marker, [x + Math.sin(a) * 0.036, y + Math.cos(a) * 0.036, zb + 0.004], -a, 0.003);
    }
    const na = -0.6 + i * 0.6;
    bar(0.004, 0.024, P.marker, [x + Math.sin(na) * 0.01, y + Math.cos(na) * 0.01, zb + 0.012], -na, 0.004);
  });
  // screen
  put(box(0.15, 0.08, 0.008), P.marker, [cx, cy + 0.005, zb + 0.002]);
  glowFn(put(box(0.134, 0.066, 0.006), P.glowCyan, [cx, cy + 0.005, zb + 0.006]), 1.2);
  const zz = [[-0.055, -0.01], [-0.03, 0.02], [-0.005, -0.015], [0.02, 0.02], [0.045, -0.005]];
  for (let i = 0; i < zz.length - 1; i++) {
    const [x0, y0] = zz[i], [x1, y1] = zz[i + 1];
    const L = Math.hypot(x1 - x0, y1 - y0);
    bar(L + 0.003, 0.004, P.marker, [cx + (x0 + x1) / 2, cy + 0.005 + (y0 + y1) / 2, zb + 0.01], Math.atan2(y1 - y0, x1 - x0), 0.003);
  }
  // buttons 2 rows x 4
  const bc = [P.green, P.yellow, P.red, P.blue];
  for (let r = 0; r < 2; r++)
    for (let i = 0; i < 4; i++) {
      const x = cx - 0.125 + i * 0.03 - 0.0 , y = cy - 0.055 - r * 0.035;
      disc(0.012, 0.004, P.marker, [x - 0.0, y, zb + 0.001], 10);
      disc(0.009, 0.008, bc[(i + r * 2) % 4], [x, y, zb + 0.004], 10);
    }
  // LEDs
  [P.glowRed, P.glowLime, P.glowCyan].forEach((c, i) => {
    const x = cx + 0.03 + i * 0.03, y = cy - 0.04;
    disc(0.011, 0.004, P.marker, [x, y, zb + 0.001], 8);
    glowFn(put(new THREE.SphereGeometry(0.008, 6, 4), c, [x, y, zb + 0.004]), 2);
  });
  // speaker grille
  for (let i = 0; i < 6; i++) bar(0.04, 0.003, P.marker, [cx + 0.095, cy - 0.085 + i * 0.0 - 0.0 + (i - 2.5) * -0.0, zb + 0.002 + 0], 0, 0.002);
  for (let i = 0; i < 6; i++) { /* replaced below */ }
  // (grille bars stacked)
  for (let i = 0; i < 6; i++) bar(0.045, 0.003, P.marker, [cx + 0.1, cy - 0.095 + i * 0.0, zb], 0, 0.001);
  for (let i = 0; i < 6; i++) bar(0.045, 0.003, P.marker, [cx + 0.1, cy - 0.032 - 0.0 + (i - 3) * 0.0 + 0, zb], 0, 0.001);
  for (let i = 0; i < 6; i++) bar(0.003, 0.034, P.marker, [cx + 0.082 + i * 0.0072, cy - 0.065 - 0.0, zb + 0.002], 0, 0.002);
  // clothespin switch
  put(box(0.014, 0.04, 0.012), P.cardboardLight, [cx - 0.135, cy - 0.095, zb + 0.008]);
  put(box(0.016, 0.012, 0.014), P.tapeBrown, [cx - 0.135, cy - 0.078, zb + 0.009]);
  b.sweep(catmull([[cx - 0.135, cy - 0.115, zb + 0.008], [cx - 0.14, cy - 0.14, zb + 0.015], [cx - 0.128, cy - 0.16, zb + 0.012]]), 0.003, { bone: chest, color: P.tapeBrown });
  // smiley
  disc(0.022, 0.003, P.yellow, [cx - 0.1, cy - 0.035, zb + 0.001], 12);
  put(cyl(0.003, 0.004, 6), P.marker, [cx - 0.108, cy - 0.028, zb + 0.004], { dir: [0, 0, 1] });
  put(cyl(0.003, 0.004, 6), P.marker, [cx - 0.092, cy - 0.028, zb + 0.004], { dir: [0, 0, 1] });
  bar(0.02, 0.003, P.marker, [cx - 0.1, cy - 0.044, zb + 0.004], 0, 0.002);
  // bolt emblem
  bar(0.012, 0.03, P.yellow, [cx + 0.14, cy + 0.07, zb + 0.002], 0.4, 0.003);
  bar(0.012, 0.02, P.yellow, [cx + 0.145, cy + 0.055, zb + 0.002], 0.4, 0.003);
  // B-07 label
  put(box(0.06, 0.022, 0.003), P.tape, [cx + 0.03, cy - 0.105, zb + 0.001]);
  bar(0.003, 0.014, P.marker, [cx + 0.008, cy - 0.105, zb + 0.004], 0, 0.002);
  bar(0.008, 0.003, P.marker, [cx + 0.012, cy - 0.100, zb + 0.004], 0, 0.002);
  bar(0.008, 0.003, P.marker, [cx + 0.012, cy - 0.110, zb + 0.004], 0, 0.002);
  bar(0.008, 0.003, P.marker, [cx + 0.032, cy - 0.105, zb + 0.004], 0, 0.002);
  bar(0.008, 0.003, P.marker, [cx + 0.048, cy - 0.105, zb + 0.004], 0, 0.002);
  bar(0.003, 0.014, P.marker, [cx + 0.052, cy - 0.105, zb + 0.004], 0, 0.002);
  // ---------- SIDE VENTS ----------
  for (const s of [1, -1]) {
    const x = s * 0.255;
    put(box(0.008, 0.1, 0.16), P.foil, [x, 0.62, 0.0]).mesh.rotation.x = 0.02 * s;
    put(box(0.012, 0.1, 0.01), P.tape, [x, 0.62, -0.08]);
    put(box(0.012, 0.1, 0.01), P.tape, [x, 0.62, 0.08]);
    for (let i = 0; i < 5; i++) put(box(0.012, 0.004, 0.13), P.foilDark, [x + s * 0.001, 0.59 + i * 0.02, 0]);
    put(new THREE.IcosahedronGeometry(0.008, 0), P.cardboardLight, [x, 0.67, 0.07]);
  }
  // ---------- BACKPACK ----------
  const by = M.backpackCenter[1];
  put(box(0.34, 0.34, 0.12), P.cardboardLight, [0, by, -0.24], { bone: spine });
  put(box(0.35, 0.05, 0.13), P.cardboard, [0, by + 0.2, -0.24], { bone: spine }).mesh.rotation.x = -0.05;
  for (const sx of [1, -1]) for (const sy of [1, -1]) {
    put(box(0.04, 0.04, 0.125), P.tape, [sx * 0.165, by + sy * 0.16, -0.24], { bone: spine });
  }
  for (let i = 0; i < 4; i++) put(box(0.3, 0.004, 0.003), P.cardboard, [0, by - 0.1 + i * 0.07, -0.303], { bone: spine });
  // exhaust pipes
  for (const s of [1, -1]) {
    const p = catmull([[s * 0.09, by + 0.12, -0.27], [s * 0.09, by + 0.3, -0.27], [s * 0.1, by + 0.37, -0.22], [s * 0.1, by + 0.35, -0.17 + 0.0]]);
    b.sweep(p, 0.03, { bone: spine, color: P.foil, sides: 7 });
    for (const t of [0.25, 0.5, 0.75]) {
      const q = p.at(t);
      put(cyl(0.034, 0.012, 7), P.foilDark, [q.x, q.y, q.z], { bone: spine });
    }
  }
  // vent dish
  put(new THREE.CylinderGeometry(0.06, 0.04, 0.02, 8), P.foil, [0, by - 0.06, -0.31], { bone: spine, dir: [0, 0, -1] });
  put(cyl(0.025, 0.01, 8), P.foilDark, [0, by - 0.06, -0.318], { bone: spine, dir: [0, 0, -1] });
  // ON/OFF switch
  put(box(0.05, 0.03, 0.006), P.red, [-0.09, by + 0.1, -0.303], { bone: spine });
  bar(0.004, 0.018, P.marker, [-0.105, by + 0.1, -0.307], 0, 0.002, spine);
  put(cyl(0.007, 0.003, 8), P.marker, [-0.08, by + 0.1, -0.308], { bone: spine, dir: [0, 0, -1] });
  // curly cord
  const cord: number[][] = [];
  for (let i = 0; i <= 40; i++) {
    const a = i * 0.9;
    cord.push([0.08 + Math.cos(a) * 0.015, by - 0.1 - i * 0.004 + Math.sin(a) * 0.0, -0.31 - Math.sin(a) * 0.015]);
  }
  b.sweep(catmull(cord), 0.0035, { bone: spine, color: P.marker });
  // straps
  for (const s of [1, -1]) {
    put(box(0.04, 0.4, 0.008), P.tapeBrown, [s * 0.12, by + 0.0, -0.31], { bone: spine });
    put(box(0.04, 0.008, 0.14), P.tapeBrown, [s * 0.12, 0.955, -0.12], { bone: chest });
    put(box(0.04, 0.012, 0.012), P.tape, [s * 0.12, by + 0.17, -0.31], { bone: spine });
  }
  // glue + scribbles
  for (let i = 0; i < 5; i++)
    put(new THREE.IcosahedronGeometry(0.007 + R() * 0.004, 0), P.tape, [(R() - 0.5) * 0.3, by - 0.14 + R() * 0.28, -0.305], { bone: spine });
  for (let i = 0; i < 4; i++) bar(0.04, 0.003, P.marker, [0.07, by - 0.02 - i * 0.012, -0.304], 0.3 * (i % 2 ? 1 : -1), 0.002, spine);
}
    return buildGadgets;
  })(),
  // headHelmet
  (() => {
function buildHeadHelmet({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const GLUE = "#f3ecd0";
  const MOUTH_DARK = "#6e2626";
  const TONGUE = "#e58a8a";
  const sgn = [1, -1];

  type Rot = [number, number, number];
  const box = (
    sx: number, sy: number, sz: number, color: string,
    x: number, y: number, z: number, rot?: Rot, bone: any = J.head,
  ) => b.part(new THREE.BoxGeometry(sx, sy, sz), color, { bone, at: [x, y, z], rotation: rot });
  const ball = (
    r: number, color: string, x: number, y: number, z: number,
    scale: [number, number, number] = [1, 1, 1], bone: any = J.head, seg = 8,
  ) => b.part(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), color, { bone, at: [x, y, z], scale });
  const cyl = (
    r0: number, r1: number, h: number, color: string,
    x: number, y: number, z: number, rot?: Rot, bone: any = J.head, sides = 8,
  ) => b.part(new THREE.CylinderGeometry(r0, r1, h, sides), color, { bone, at: [x, y, z], rotation: rot });

  // ---------------- KID ----------------
  const hc = M.kidHeadCenter; // [0,1.12,0.02]
  // neck
  cyl(0.04, 0.045, 0.095, P.skinShade, 0, 0.9975, 0, undefined, J.neck, 10);

  // head
  ball(0.1, P.skin, hc[0], hc[1], hc[2], [1, 0.97, 1], J.head, 14);
  // ears
  for (const s of sgn) {
    ball(0.022, P.skinShade, s * 0.099, 1.115, 0.01, [0.5, 1, 0.8], J.head, 6);
    ball(0.012, P.skin, s * 0.102, 1.115, 0.012, [0.4, 0.8, 0.6], J.head, 6);
  }
  // nose + cheeks
  ball(0.015, P.skinShade, 0, 1.105, 0.122, [1, 0.9, 0.9], J.head, 6);
  for (const s of sgn) ball(0.02, P.mouth, s * 0.07, 1.09, 0.088, [1, 0.8, 0.35], J.head, 6);

  // eyes
  for (const s of sgn) {
    const ex = s * 0.045;
    ball(0.021, P.white, ex, 1.136, 0.106, [1, 1.05, 0.9], J.head, 8);
    ball(0.0125, P.iris, ex, 1.136, 0.124, [1, 1, 0.5], J.head, 8);
    ball(0.0068, P.marker, ex, 1.136, 0.1275, [1, 1, 0.5], J.head, 6);
    ball(0.0034, P.white, ex + s * 0.004, 1.141, 0.13, [1, 1, 0.6], J.head, 5);
    // brow
    box(0.044, 0.011, 0.01, P.hair, ex, 1.168, 0.1, [0, 0, -8 * s]);
  }

  // mouth: upper
  const grin = [
    [-0.058, 1.093, 0.092], [-0.03, 1.077, 0.108], [0, 1.071, 0.111],
    [0.03, 1.077, 0.108], [0.058, 1.093, 0.092],
  ];
  b.sweep(grin, 0.006, { color: P.mouth, bone: J.head });
  box(0.082, 0.02, 0.008, MOUTH_DARK, 0, 1.079, 0.107);
  box(0.062, 0.009, 0.006, P.white, 0, 1.0885, 0.111, [-8, 0, 0]);
  box(0.0012, 0.009, 0.007, P.skinShade, 0, 1.0885, 0.1115);
  // lower jaw
  b.part(new THREE.SphereGeometry(0.092, 12, 5, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), P.skin, {
    bone: J.jaw, at: [0, 1.077, 0.022], scale: [0.95, 0.8, 1.0],
  });
  ball(0.02, TONGUE, 0, 1.066, 0.098, [1.3, 0.5, 1.2], J.jaw, 6);
  box(0.054, 0.008, 0.006, P.white, 0, 1.0705, 0.1085, undefined, J.jaw);
  b.sweep([[-0.046, 1.073, 0.098], [0, 1.058, 0.113], [0.046, 1.073, 0.098]], 0.005, {
    color: P.mouth, bone: J.jaw,
  });

  // hair
  b.part(new THREE.SphereGeometry(0.106, 12, 6, 0, Math.PI * 2, 0, 1.15), P.hair, {
    bone: J.head, at: [0, 1.13, -0.004], scale: [1, 1, 1.02],
  });
  // back & side hair
  b.part(new THREE.SphereGeometry(0.104, 10, 6, 0, Math.PI * 2, 1.0, 0.5), P.hair, {
    bone: J.head, at: [0, 1.13, -0.012],
  });
  for (let i = 0; i < 9; i++) {
    const a = -0.85 + i * 0.21;
    const x = Math.sin(a) * 0.075;
    const len = 0.045 + R() * 0.02;
    b.part(new THREE.ConeGeometry(0.02 + R() * 0.006, len, 5), i % 2 ? P.hair : "#6e4322", {
      bone: J.head, at: [x, 1.188 - Math.abs(x) * 0.25, 0.085 - Math.abs(x) * 0.2],
      dir: [x * 0.8, -0.5, 1],
    });
  }
  for (let i = 0; i < 6; i++) {
    const a = i * 1.05;
    b.part(new THREE.ConeGeometry(0.022, 0.05, 5), i % 2 ? P.hair : "#6e4322", {
      bone: J.head, at: [Math.sin(a) * 0.06, 1.21, Math.cos(a) * 0.06 - 0.01],
      dir: [Math.sin(a), 1.0, Math.cos(a) * 0.9],
    });
  }

  // ---------------- HELMET ----------------
  const C = P.cardboard, CD = P.cardboardDark, CL = P.cardboardLight, CI = P.cardboardInner;
  // walls
  box(0.38, 0.09, 0.012, C, 0, 0.995, 0.184); // front below window
  box(0.38, 0.09, 0.012, C, 0, 1.255, 0.184); // front above window
  for (const s of sgn) box(0.075, 0.17, 0.012, C, s * 0.1525, 1.125, 0.184);
  box(0.38, 0.35, 0.012, C, 0, 1.125, -0.184); // back
  for (const s of sgn) box(0.012, 0.338, 0.356, C, s * 0.184, 1.119, 0);
  box(0.37, 0.012, 0.37, CL, 0, 1.2955, 0); // top
  // window inner rim
  box(0.23, 0.008, 0.024, CI, 0, 1.206, 0.18);
  box(0.23, 0.008, 0.024, CI, 0, 1.044, 0.18);
  for (const s of sgn) box(0.008, 0.17, 0.024, CI, s * 0.111, 1.125, 0.18);
  // bottom open rim inside
  box(0.36, 0.01, 0.01, CI, 0, 0.955, 0.17);
  box(0.36, 0.01, 0.01, CI, 0, 0.955, -0.17);
  for (const s of sgn) box(0.01, 0.01, 0.34, CI, s * 0.17, 0.955, 0);
  // marker outline of window
  box(0.27, 0.012, 0.004, P.marker, 0, 1.217, 0.1925);
  box(0.27, 0.012, 0.004, P.marker, 0, 1.033, 0.1925);
  for (const s of sgn) box(0.012, 0.196, 0.004, P.marker, s * 0.1215, 1.125, 0.1925);

  // corner edge strips
  for (const sx of sgn)
    for (const sz of sgn) box(0.016, 0.35, 0.016, CD, sx * 0.186, 1.125, sz * 0.186);
  for (const sz of sgn) {
    box(0.38, 0.014, 0.016, CD, 0, 1.296, sz * 0.186);
    box(0.38, 0.014, 0.016, CD, 0, 0.957, sz * 0.186);
  }
  for (const sx of sgn) {
    box(0.016, 0.014, 0.36, CD, sx * 0.186, 1.296, 0);
    box(0.016, 0.014, 0.36, CD, sx * 0.186, 0.957, 0);
  }
  // corner tape (front corners & top seam)
  for (const s of sgn) {
    box(0.034, 0.34, 0.006, P.tape, s * 0.18, 1.125, 0.1935, [0, 0, s * 0.8]);
    box(0.006, 0.3, 0.034, P.tape, s * 0.1935, 1.125, -0.17);
  }
  box(0.04, 0.006, 0.38, P.tape, 0.02, 1.3025, 0, [0, 1, 0]);
  // back X tape
  box(0.03, 0.31, 0.005, P.tape, 0, 1.125, -0.1935, [0, 0, 38]);
  box(0.03, 0.31, 0.005, P.tape, 0, 1.125, -0.1938, [0, 0, -38]);
  // ridges
  for (const y of [0.99, 1.01, 1.24, 1.26])
    box(0.37, 0.004, 0.004, CD, 0, y, -0.1915);
  for (const s of sgn) {
    for (const y of [0.98, 1.0, 1.25, 1.27]) box(0.004, 0.004, 0.33, i2(y) ? CD : CL, s * 0.1915, y, 0);
    for (const x of [0.15, 0.165]) box(0.004, 0.17, 0.004, CL, s * x, 1.125, 0.1915);
    // scuff
    box(0.03, 0.02, 0.004, CD, s * 0.15, 1.01, 0.1915, [0, 0, 5]);
  }
  function i2(y: number) { return Math.round(y * 100) % 2 === 0; }

  // grille: 5 marker bars on the chin area
  for (let i = 0; i < 5; i++) box(0.15, 0.007, 0.004, P.marker, 0, 0.966 + i * 0.0145, 0.1915, [0, 0, i % 2 ? 0.6 : -0.5]);
  // eyebrow bars
  for (const s of sgn) box(0.065, 0.011, 0.004, P.marker, s * 0.135, 1.248, 0.1915, [0, 0, -s * 12]);
  // red B on forehead
  const bz = 0.1915, by = 1.268;
  box(0.007, 0.052, 0.004, P.red, -0.011, by, bz);
  box(0.024, 0.007, 0.004, P.red, 0, by + 0.0225, bz);
  box(0.024, 0.007, 0.004, P.red, 0, by, bz);
  box(0.024, 0.007, 0.004, P.red, 0, by - 0.0225, bz);
  box(0.007, 0.025, 0.004, P.red, 0.0125, by + 0.0115, bz);
  box(0.007, 0.025, 0.004, P.red, 0.0125, by - 0.0115, bz);

  // visor flap (rides visor joint)
  const vj = J.visor;
  box(0.22, 0.01, 0.07, CL, 0, 1.232, 0.222, [-11, 0, 1.5], vj);
  box(0.22, 0.012, 0.008, CD, 0, 1.2385, 0.254, [-11, 0, 1.5], vj);
  box(0.2, 0.0035, 0.016, P.foil, 0.0, 1.2395, 0.225, [-11, 0, 1.5], vj);
  box(0.2, 0.0035, 0.012, P.red, 0.0, 1.2385, 0.24, [-11, 0, 1.5], vj);
  cyl(0.007, 0.007, 0.226, P.tape, 0, 1.2215, 0.19, [0, 0, 90], vj, 6);
  for (const s of sgn) box(0.03, 0.006, 0.02, P.tape, s * 0.1, 1.226, 0.2, [-11, 0, 0], vj);

  // ear tubes
  for (const s of sgn) {
    const col = s > 0 ? P.red : P.blue;
    cyl(0.05, 0.05, 0.07, col, s * 0.225, 1.13, 0, [0, 0, 90], J.head, 12);
    cyl(0.045, 0.045, 0.006, P.foil, s * 0.2625, 1.13, 0, [0, 0, 90], J.head, 7);
    cyl(0.03, 0.03, 0.007, P.foilDark, s * 0.2655, 1.13, 0, [0, 0, 90], J.head, 7);
    cyl(0.052, 0.052, 0.01, P.tape, s * 0.194, 1.13, 0, [0, 0, 90], J.head, 12);
    b.sweep(spiral([s * 0.19, 1.13, 0], [s * 0.19, 1.13 + 0.0515, 0], [s, 0, 0], { turns: s * 1.3, r1: 0.0515, pitch: 0.04 }),
      0.0028, { color: P.marker, bone: J.head });
    // glue blobs
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1 + 0.5;
      ball(0.006, GLUE, s * 0.192, 1.13 + Math.sin(a) * 0.052, Math.cos(a) * 0.052, [1, 1, 1], J.head, 5);
    }
  }

  // antennae
  const base = M.antennaBase;
  const lean = Math.tan((12 * Math.PI) / 180) * 0.12;
  for (const s of sgn) {
    const a: [number, number, number] = [s * 0.07, base[1], 0];
    const t: [number, number, number] = [s * (0.07 + lean), 1.42, 0];
    b.rod(a, t, 0.008, P.foil, { bone: J.head, sides: 6 });
    for (let k = 0; k < 3; k++)
      b.rod([a[0] + s * lean * (k / 3 + 0.16), 1.305 + k * 0.038, 0], [a[0] + s * lean * (k / 3 + 0.2), 1.31 + k * 0.038, 0], 0.0105, P.foilDark, { bone: J.head, sides: 6 });
    ball(0.011, GLUE, a[0], base[1] + 0.004, 0, [1.3, 0.8, 1.3], J.head, 5);
    if (s > 0) {
      cyl(0.026, 0.026, 0.007, P.yellow, t[0], 1.423, 0, [2, 0, -3], J.head, 10);
      cyl(0.018, 0.018, 0.002, CD, t[0], 1.4275, 0, undefined, J.head, 8);
    } else {
      ball(0.02, P.red, t[0], 1.428, 0, [1, 1, 1], J.head, 7);
      const cx = a[0] + s * lean * 0.45;
      b.sweep(spiral([cx, 1.335, 0], [cx + 0.017, 1.335, 0], [0, 1, 0], { turns: 4, r1: 0.017, pitch: 0.0125 }),
        0.0022, { color: P.foilDark, bone: J.head });
    }
  }
  // foil dish on top
  cyl(0.045, 0.018, 0.016, P.foil, 0, 1.311, -0.06, [0, 0, 1.5], J.head, 7);
  cyl(0.02, 0.02, 0.004, P.foilDark, 0, 1.319, -0.06, undefined, J.head, 7);
  ball(0.008, GLUE, 0.03, 1.304, -0.04, [1, 0.7, 1], J.head, 5);
  ball(0.007, GLUE, -0.035, 1.304, -0.075, [1, 0.7, 1], J.head, 5);
}
    return buildHeadHelmet;
  })(),
  // arms
  (() => {
function buildArms({ b, J, P }: Ctx) {
  const GLUE = "#efe6c8";
  const R = rng(77);
  // arm centreline height, piecewise through shoulder, elbow, wrist
  const yAt = (x: number) => {
    if (x <= 0.25) return 0.85;
    if (x <= 0.47) return 0.85 + ((x - 0.25) / 0.22) * -0.02;
    if (x <= 0.68) return 0.83 + ((x - 0.47) / 0.21) * -0.03;
    return 0.8;
  };
  const slope = (x: number) => (yAt(x + 0.01) - yAt(x - 0.01)) / 0.02;

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = J[`shoulder${S}`], el = J[`elbow${S}`], wr = J[`wrist${S}`];
    const pt = (x: number, dy = 0, dz = 0): [number, number, number] => [s * x, yAt(x) + dy, dz];

    const tube = (x0: number, x1: number, r: number, color: string, bone: any, sides = 8) => {
      const a = pt(x0), c = pt(x1);
      const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
      return b.part(new THREE.CylinderGeometry(r, r, len, sides), color, {
        at: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, 0],
        dir: [c[0] - a[0], c[1] - a[1], 0],
        bone,
      });
    };
    const band = (x: number, len: number, r: number, color: string, bone: any, sides = 10) =>
      b.part(new THREE.CylinderGeometry(r, r, len, sides), color, {
        at: pt(x),
        dir: [s, slope(x), 0],
        bone,
      });
    const box = (at: number[], size: number[], color: string, bone: any, rot?: number[]) =>
      b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, bone, rotation: rot });
    const blob = (at: number[], r: number, bone: any) =>
      b.part(new THREE.SphereGeometry(r, 6, 4), GLUE, { at, bone, flat: true });

    // ---------- upper arm (paper-towel tube)
    tube(0.23, 0.452, 0.055, P.cardboardLight, sh);
    band(0.236, 0.012, 0.0575, P.cardboardDark, sh);
    band(0.446, 0.012, 0.0575, P.cardboardDark, sh);
    // spiral seam
    {
      const c = pt(0.235);
      const ax: [number, number, number] = [s, slope(0.34), 0];
      const path = spiral(c, [c[0], c[1] + 0.0575, c[2]], ax, { turns: 2.5, pitch: 0.215 / 2.5 });
      b.sweep(path, 0.0028, { color: P.cardboardDark, bone: sh, detail: 0.5 });
    }
    band(0.30, 0.03, 0.0578, P.yellow, sh);
    band(0.365, 0.03, 0.0578, P.red, sh);
    band(0.265, 0.032, 0.0605, P.tape, sh);
    band(0.265, 0.004, 0.0615, P.tapeBrown, sh);
    // tape tab at collar
    box(pt(0.27, 0.06, 0.012), [0.024, 0.004, 0.026], P.tape, sh, [1, 2, 3]);
    // marker scribbles on band
    box(pt(0.332, 0.0575), [0.012, 0.003, 0.003], P.marker, sh, [0, 0, 20]);
    box(pt(0.34, 0.056, 0.01), [0.01, 0.003, 0.003], P.marker, sh, [0, 25, -30]);
    blob(pt(0.235, 0.045, 0.04), 0.008, sh);

    // ---------- elbow (dryer hose)
    tube(0.45, 0.50, 0.043, P.foilDark, el, 10);
    for (let i = 0; i < 5; i++) {
      const x = 0.4575 + i * 0.0225;
      band(x, 0.008, 0.051, i % 2 ? P.foil : P.foilDark, el, 10);
    }
    // ---------- forearm (foil)
    tube(0.50, 0.675, 0.05, P.foil, el, 7);
    for (let i = 0; i < 9; i++) {
      const x = 0.52 + R() * 0.14;
      const a = R() * Math.PI * 2;
      box(
        pt(x, Math.cos(a) * 0.0505, Math.sin(a) * 0.0505),
        [0.028, 0.004, 0.012],
        i % 3 ? P.foilDark : "#f2f4f8",
        el,
        [(-a * 180) / Math.PI + 90, R() * 60 - 30, R() * 40 - 20],
      );
    }
    band(0.505, 0.03, 0.0545, P.tape, el, 10);
    band(0.665, 0.03, 0.0545, P.tape, el, 10);
    box(pt(0.505, 0.056, -0.02), [0.022, 0.004, 0.024], P.tape, el, [0, 3, 2]);
    // rivet bottle caps
    for (const x of [0.54, 0.575, 0.61]) {
      b.part(new THREE.CylinderGeometry(0.0115, 0.0125, 0.007, 8), P.blue, {
        at: pt(x, 0.049),
        bone: el,
      });
      b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.009, 6), P.foil, { at: pt(x, 0.051), bone: el });
    }
    // marker wristwatch
    band(0.645, 0.02, 0.0525, P.marker, el, 10);
    box(pt(0.645, 0.056), [0.022, 0.006, 0.022], P.yellow, el, [0, 2, 0]);
    box(pt(0.645, 0.0605), [0.01, 0.002, 0.002], P.marker, el, [0, 0, 30]);
    blob(pt(0.68, -0.04, 0.03), 0.007, el);

    // ---------- wrist cuff (skin gap)
    band(0.687, 0.012, 0.0455, P.skinShade, wr, 10);

    // ---------- palm
    box([s * 0.712, 0.8, 0], [0.044, 0.075, 0.075], P.cardboard, wr);
    box([s * 0.712, 0.8, 0], [0.048, 0.02, 0.079], P.tape, wr);
    box([s * 0.7, 0.8, 0.0], [0.012, 0.078, 0.078], P.cardboardDark, wr);
    box([s * 0.716, 0.8, 0.037], [0.036, 0.05, 0.004], P.cardboardDark, wr);
    glow(
      b.part(new THREE.SphereGeometry(0.008, 6, 4), P.glowLime, { at: [s * 0.712, 0.84, 0], bone: wr }),
      1.4,
    );
    for (const z of [1, -1]) {
      glow(
        b.part(new THREE.SphereGeometry(0.006, 6, 4), P.glowCyan, { at: [s * 0.72, 0.805, z * 0.039], bone: wr }),
        1.3,
      );
    }
    blob([s * 0.695, 0.765, 0.03], 0.007, wr);

    // ---------- claw jaws
    const T: [number, number][] = [
      [0, -0.014], [0.07, -0.002], [0.12, 0.006], [0.14, 0.022], [0.105, 0.04], [0.06, 0.042], [0, 0.026],
    ];
    const edgeV = (u: number) => {
      for (let i = 0; i < 3; i++) {
        if (u <= T[i + 1][0]) {
          const t = (u - T[i][0]) / (T[i + 1][0] - T[i][0]);
          return T[i][1] + t * (T[i + 1][1] - T[i][1]);
        }
      }
      return T[3][1];
    };
    for (const sign of [1, -1]) {
      const k = sign > 0 ? "Top" : "Bot";
      const c1 = J[`claw${k}${S}1`], c2 = J[`claw${k}${S}2`];
      const y0 = sign > 0 ? 0.815 : 0.785;
      const W = (u: number, v: number): [number, number, number] => [s * (0.72 + u), y0 + sign * v, 0];
      b.extrude(
        T.map(([u, v], i) => [u, sign * v, i === 3 ? "sharp" : undefined].filter((q) => q !== undefined) as any),
        { at: [s * 0.72, y0, 0], x: [s, 0, 0], thickness: 0.02, bevel: 0.002, color: P.cardboard, bone: c1 },
      );
      // dark outer edge rods
      b.rod(W(0, 0.026), W(0.06, 0.042), 0.0105, P.cardboardDark, { bone: c1, sides: 6 });
      b.rod(W(0.06, 0.042), W(0.105, 0.04), 0.0105, P.cardboardDark, { bone: c2, sides: 6 });
      // foil tip
      b.part(new THREE.ConeGeometry(0.013, 0.04, 6), P.foil, {
        at: W(0.128, 0.017),
        dir: [s, sign * 0.45, 0],
        bone: c2,
      });
      // pivot pin
      b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.026, 6), P.marker, {
        at: W(0.018, 0.006),
        dir: [0, 0, 1],
        bone: c1,
      });
      // serrated marker teeth
      for (const u of [0.075, 0.092, 0.109]) {
        const v = edgeV(u) - 0.004;
        box(W(u, v), [0.007, 0.011, 0.022], P.marker, c2 === undefined ? c1 : u > 0.1 ? c2 : c1, [0, 0, sign * 8]);
      }
      // marker stripe on jaw
      box(W(0.045, 0.02), [0.03, 0.004, 0.0215], P.red, c1, [0, 0, sign * 10]);
    }
  }
}
    return buildArms;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "cardboardBoxRobotKid" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.55,0], dir: [0,1,0], role: "spine", group: "torso" });
  J["spine"] = b.joint("spine", { parent: J["hips"], at: [0,0.68,0], dir: [0,1,0], role: "spine", group: "torso" });
  J["chest"] = b.joint("chest", { parent: J["spine"], at: [0,0.84,0], dir: [0,1,0], role: "spine", group: "torso" });
  J["neck"] = b.joint("neck", { parent: J["chest"], at: [0,0.95,0], dir: [0,1,0], role: "neck", group: "head" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,1,0], dir: [0,1,0], role: "head", group: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.07,0], dir: [0,0,1], role: "jaw", group: "head" });
  J["visor"] = b.joint("visor", { parent: J["head"], at: [0,1.22,0.19], dir: [0,0,1], role: "hinge", group: "head" });
  J["hipL"] = b.joint("hipL", { parent: J["hips"], at: [0.09,0.52,0], dir: [0,-1,0], role: "leg", group: "legs" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.09,0.29,0.01], dir: [0,-1,0], role: "leg", group: "legs" });
  J["ankleL"] = b.joint("ankleL", { parent: J["kneeL"], at: [0.09,0.08,0], dir: [0,-1,0.3], role: "leg", group: "legs" });
  J["toeL"] = b.joint("toeL", { parent: J["ankleL"], at: [0.09,0.04,0.12], dir: [0,0,1], role: "leg", group: "legs" });
  J["hipR"] = b.joint("hipR", { parent: J["hips"], at: [-0.09,0.52,0], dir: [0,-1,0], role: "leg", group: "legs" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.09,0.29,0.01], dir: [0,-1,0], role: "leg", group: "legs" });
  J["ankleR"] = b.joint("ankleR", { parent: J["kneeR"], at: [-0.09,0.08,0], dir: [0,-1,0.3], role: "leg", group: "legs" });
  J["toeR"] = b.joint("toeR", { parent: J["ankleR"], at: [-0.09,0.04,0.12], dir: [0,0,1], role: "leg", group: "legs" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["chest"], at: [0.25,0.85,0], dir: [1,-0.05,0], role: "arm", group: "arms" });
  J["elbowL"] = b.joint("elbowL", { parent: J["shoulderL"], at: [0.47,0.83,0], dir: [1,-0.05,0], role: "arm", group: "arms" });
  J["wristL"] = b.joint("wristL", { parent: J["elbowL"], at: [0.68,0.8,0], dir: [1,0,0], role: "arm", group: "arms" });
  J["clawTopL1"] = b.joint("clawTopL1", { parent: J["wristL"], at: [0.72,0.815,0], dir: [1,0.25,0], role: "digit", group: "arms" });
  J["clawTopL2"] = b.joint("clawTopL2", { parent: J["clawTopL1"], at: [0.79,0.85,0], dir: [1,-0.15,0], role: "digit", group: "arms" });
  J["clawBotL1"] = b.joint("clawBotL1", { parent: J["wristL"], at: [0.72,0.785,0], dir: [1,-0.25,0], role: "digit", group: "arms" });
  J["clawBotL2"] = b.joint("clawBotL2", { parent: J["clawBotL1"], at: [0.79,0.75,0], dir: [1,0.15,0], role: "digit", group: "arms" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["chest"], at: [-0.25,0.85,0], dir: [-1,-0.05,0], role: "arm", group: "arms" });
  J["elbowR"] = b.joint("elbowR", { parent: J["shoulderR"], at: [-0.47,0.83,0], dir: [-1,-0.05,0], role: "arm", group: "arms" });
  J["wristR"] = b.joint("wristR", { parent: J["elbowR"], at: [-0.68,0.8,0], dir: [-1,0,0], role: "arm", group: "arms" });
  J["clawTopR1"] = b.joint("clawTopR1", { parent: J["wristR"], at: [-0.72,0.815,0], dir: [-1,0.25,0], role: "digit", group: "arms" });
  J["clawTopR2"] = b.joint("clawTopR2", { parent: J["clawTopR1"], at: [-0.79,0.85,0], dir: [-1,-0.15,0], role: "digit", group: "arms" });
  J["clawBotR1"] = b.joint("clawBotR1", { parent: J["wristR"], at: [-0.72,0.785,0], dir: [-1,-0.25,0], role: "digit", group: "arms" });
  J["clawBotR2"] = b.joint("clawBotR2", { parent: J["clawBotR1"], at: [-0.79,0.75,0], dir: [-1,0.15,0], role: "digit", group: "arms" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
