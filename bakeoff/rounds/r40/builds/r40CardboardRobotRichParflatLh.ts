import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, catmull } from "../../../../src/index";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { coil } from "../../../../kits/clockwork";

export const meta = {
  "name": "Cardboard Box Robot Kid",
  "description": "A child in a homemade cardboard-box robot costume: boxy torso and head box, foil-covered limbs, bottle-cap buttons, duct-tape seams and marker-drawn details."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  cardboard: "#b98a55",
  cardboardDark: "#8f6736",
  cardboardLight: "#d4aa74",
  corrugation: "#a07442",
  tapeGrey: "#8d949b",
  tapeRed: "#c8372d",
  marker: "#1d1d22",
  foil: "#c9ced6",
  foilDark: "#8e949e",
  skin: "#f0c09a",
  hair: "#5a3a22",
  jeans: "#3d5a8c",
  sneaker: "#d9d9d9",
  sole: "#f2f2f2",
  capRed: "#d83a34",
  capBlue: "#2f6fd1",
  capYellow: "#f2c230",
  screenGreen: "#8fe0a0",
  shirt: "#e8e2d0",
  glove: "#f2c230",
  eyeWhite: "#ffffff",
  mouth: "#b5483f",
};
const M = {
  hips: [0, 0.5, 0] as [number, number, number],
  torsoBottom: [0, 0.5, 0] as [number, number, number],
  torsoTop: [0, 1, 0] as [number, number, number],
  neck: [0, 1, 0] as [number, number, number],
  headCenter: [0, 1.15, 0.01] as [number, number, number],
  faceWindow: [0, 1.13, 0.175] as [number, number, number],
  shoulderL: [0.26, 0.88, 0] as [number, number, number],
  shoulderR: [-0.26, 0.88, 0] as [number, number, number],
  hipL: [0.1, 0.5, 0] as [number, number, number],
  hipR: [-0.1, 0.5, 0] as [number, number, number],
  panelCenter: [0, 0.75, 0.185] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(41);
  const JEANS_DARK = "#2f466f";
  const JEANS_LIGHT = "#5f82b8";
  const STRAP = "#2b2b30";

  const box = (
    w: number,
    h: number,
    d: number,
    color: string,
    bone: any,
    at: [number, number, number],
    rot?: [number, number, number],
  ) => b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot });
  const cyl = (
    rt: number,
    rb: number,
    h: number,
    sides: number,
    color: string,
    bone: any,
    at: [number, number, number],
    rot?: [number, number, number],
  ) => b.part(new THREE.CylinderGeometry(rt, rb, h, sides), color, { bone, at, rotation: rot, flat: true });

  // pelvis block of jeans under the torso box, riding the hips
  box(0.3, 0.07, 0.17, P.jeans, J.hips, [0, 0.465, 0]);
  box(0.3, 0.012, 0.172, JEANS_DARK, J.hips, [0, 0.438, 0]);
  // belt loops / waist stitch
  for (const x of [-0.1, 0, 0.1]) box(0.012, 0.05, 0.176, JEANS_DARK, J.hips, [x, 0.468, 0]);

  for (const s of [1, -1]) {
    const hip = s === 1 ? J.hipL : J.hipR;
    const knee = s === 1 ? J.kneeL : J.kneeR;
    const ankle = s === 1 ? J.ankleL : J.ankleR;

    // ---------- thigh (jeans) ----------
    b.frustumBox([s * 0.1, 0.5, 0], [s * 0.11, 0.28, 0], [0.15, 0.14], [0.11, 0.11], {
      bone: hip,
      color: P.jeans,
    });
    // fade patch on the outer thigh and side seams
    box(0.006, 0.17, 0.012, JEANS_LIGHT, hip, [s * (0.1 + 0.0745), 0.39, 0]);
    box(0.006, 0.17, 0.012, JEANS_DARK, hip, [s * (0.1 - 0.0745), 0.39, 0]);
    // front pocket with stitched edge
    box(0.06, 0.07, 0.006, JEANS_DARK, hip, [s * 0.1, 0.45, 0.0725]);
    box(0.05, 0.004, 0.0075, JEANS_LIGHT, hip, [s * 0.1, 0.481, 0.0725]);
    box(0.05, 0.004, 0.0075, JEANS_LIGHT, hip, [s * 0.1, 0.419, 0.0725]);
    // knee patch
    box(0.07, 0.05, 0.006, JEANS_LIGHT, hip, [s * 0.108, 0.335, 0.062]);
    for (const dx of [-0.03, 0.03]) box(0.004, 0.05, 0.0075, JEANS_DARK, hip, [s * (0.108 + dx), 0.335, 0.062]);
    // rolled / crumpled hem folds
    box(0.118, 0.012, 0.116, JEANS_DARK, hip, [s * 0.11, 0.305, 0]);

    // ---------- red tape knee ring ----------
    box(0.125, 0.032, 0.125, P.tapeRed, knee, [s * 0.11, 0.281, 0]);
    box(0.127, 0.004, 0.127, "#a82a22", knee, [s * 0.11, 0.268, 0]);
    // tape tab sticking out
    box(0.03, 0.03, 0.004, P.tapeRed, knee, [s * 0.125, 0.28, 0.066], [0, 0, 14 * s]);

    // ---------- foil dryer-duct shin ----------
    const sx = s * 0.116;
    cyl(0.052, 0.047, 0.185, 8, P.foil, knee, [sx, 0.17, 0]);
    // corrugated duct ridges
    for (const y of [0.245, 0.215, 0.185, 0.155, 0.125]) {
      cyl(0.056, 0.056, 0.011, 8, P.foilDark, knee, [sx + s * (0.12 - y) * 0.04, y, 0]);
    }
    // crinkle facets: little crumpled foil flaps around the shin
    for (let i = 0; i < 10; i++) {
      const a = ((i * 36 + R() * 20) * Math.PI) / 180;
      const y = 0.12 + R() * 0.14;
      const r = 0.054;
      const deg = (a * 180) / Math.PI;
      b.part(new THREE.BoxGeometry(0.034, 0.024, 0.004), i % 2 ? P.foilDark : "#e6eaf0", {
        bone: knee,
        at: [sx + Math.sin(a) * r, y, Math.cos(a) * r],
        rotation: [(R() - 0.5) * 40, deg, (R() - 0.5) * 40],
      });
    }
    // grey tape strip holding the foil, running down the front
    box(0.03, 0.17, 0.004, P.tapeGrey, knee, [sx, 0.17, 0.0535], [0, 0, 0]);
    // marker dashes on the tape
    for (let i = 0; i < 4; i++) box(0.016, 0.004, 0.0045, P.marker, knee, [sx, 0.12 + i * 0.04, 0.0537]);
    // foil bottom lip
    cyl(0.053, 0.053, 0.01, 8, P.foilDark, ankle, [s * 0.12, 0.096, 0]);

    // ---------- sneaker ----------
    const fx = s * 0.12;
    // sole
    box(0.118, 0.03, 0.3, P.sole, ankle, [fx, 0.015, 0.07]);
    // sole tread stripe
    box(0.12, 0.006, 0.302, P.tapeGrey, ankle, [fx, 0.026, 0.07]);
    // heel counter / upper body
    box(0.106, 0.07, 0.19, P.sneaker, ankle, [fx, 0.065, 0.035]);
    // toe box
    b.part(new THREE.SphereGeometry(0.05, 8, 6), P.sneaker, {
      bone: ankle,
      at: [fx, 0.062, 0.155],
      scale: [1.02, 0.78, 1.25],
      flat: true,
    });
    // toe cap rubber
    b.part(new THREE.SphereGeometry(0.05, 8, 6), P.sole, {
      bone: ankle,
      at: [fx, 0.045, 0.19],
      scale: [1.04, 0.55, 0.9],
      flat: true,
    });
    // heel tab
    box(0.05, 0.05, 0.012, P.tapeRed, ankle, [fx, 0.075, -0.066]);
    // side stripe in grey
    box(0.004, 0.025, 0.1, P.tapeGrey, ankle, [fx + s * 0.0535, 0.062, 0.03], [0, 0, 0]);
    // collar around the ankle opening
    box(0.112, 0.016, 0.1, P.tapeGrey, ankle, [fx, 0.104, -0.01]);
    // tongue
    box(0.06, 0.05, 0.01, P.sneaker, ankle, [fx, 0.115, 0.045], [-30, 0, 0]);
    // laces: marker strips with eyelets
    for (let i = 0; i < 4; i++) {
      const z = 0.065 + i * 0.022;
      box(0.075, 0.004, 0.009, P.marker, ankle, [fx, 0.102 - i * 0.004, z]);
      for (const dx of [-0.036, 0.036]) box(0.008, 0.005, 0.008, P.tapeGrey, ankle, [fx + dx, 0.1 - i * 0.004, z]);
    }
    // bow loops
    for (const dx of [-0.014, 0.014]) box(0.02, 0.004, 0.012, P.marker, ankle, [fx + dx, 0.093, 0.15], [0, dx * 1500, 0]);
    // velcro strap across the instep
    box(0.112, 0.058, 0.03, STRAP, ankle, [fx, 0.068, 0.0]);
    box(0.114, 0.008, 0.032, P.tapeGrey, ankle, [fx, 0.092, 0.0]);
    box(0.03, 0.03, 0.006, P.sole, ankle, [fx - s * 0.02, 0.07, 0.0165]);
    // scuff marks in marker on toe
    box(0.02, 0.003, 0.004, P.marker, ankle, [fx - s * 0.015, 0.076, 0.2], [0, 0, 20]);
    box(0.014, 0.003, 0.004, P.marker, ankle, [fx + s * 0.015, 0.072, 0.201], [0, 0, -20]);
  }
}
    return buildLegs;
  })(),
  // torsoBox
  (() => {
function buildTorsoBox({ b, J, P, M }: Ctx) {
  const bone = J.chest;
  const D = Math.PI / 180;
  const R = rng(1177);
  const jit = (a: number) => (R() * 2 - 1) * a;

  // ---- dimensions ---------------------------------------------------------------------------
  const HX = 0.26; // half width
  const HZ = 0.18; // half depth
  const T = 0.012; // wall thickness
  const PB = 0.189; // outer face of the foil control panel
  const PAPER = "#f1ead6";
  const BOLT = "#6b7078";
  const SCAN = "#62c07e";

  // ---- placement helpers ----------------------------------------------------------------------
  type Kind = "front" | "back" | "left" | "right";
  const ROTY: Record<Kind, number> = { front: 0, left: 90, back: 180, right: -90 };
  // A point on a wall plane: u runs to the viewer's right, v is up, w is distance from the centre axis.
  const mp = (kind: Kind, u: number, v: number, w: number, a = 0) => {
    const m = new THREE.Matrix4().makeRotationY(ROTY[kind] * D);
    m.multiply(new THREE.Matrix4().makeTranslation(u, v, w));
    m.multiply(new THREE.Matrix4().makeRotationZ(a * D));
    return m;
  };
  const mm = (x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx * D, ry * D, rz * D));
    m.setPosition(x, y, z);
    return m;
  };
  const zu = (kind: Kind, z: number) => (kind === "left" ? -z : z);

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  // cylinder with its axis along +Z (standing on a front wall)
  const cylZ = (rt: number, rb: number, h: number, seg: number) => {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg);
    g.rotateX(Math.PI / 2);
    return g;
  };
  // cylinder with its axis along X
  const cylX = (r: number, h: number, seg: number) => {
    const g = new THREE.CylinderGeometry(r, r, h, seg);
    g.rotateZ(Math.PI / 2);
    return g;
  };

  const solid = (color: string, geo: THREE.BufferGeometry, m: THREE.Matrix4, name?: string, flat = false) => {
    geo.applyMatrix4(m);
    return b.part(geo, color, { bone, at: [0, 0, 0], flat, ...(name ? { name } : {}) });
  };
  const batches = new Map<string, THREE.BufferGeometry[]>();
  const fine = (color: string, geo: THREE.BufferGeometry, m: THREE.Matrix4) => {
    geo.applyMatrix4(m);
    let arr = batches.get(color);
    if (!arr) {
      arr = [];
      batches.set(color, arr);
    }
    arr.push(geo);
  };

  type Tilt = { cx: number; cy: number; a: number } | null;
  // a marker stroke between two points on a wall plane
  const seg = (
    color: string,
    kind: Kind,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    wd: number,
    d: number,
    w0: number,
    t: Tilt = null,
  ) => {
    let p1 = [x1, y1];
    let p2 = [x2, y2];
    if (t) {
      const c = Math.cos(t.a * D);
      const s = Math.sin(t.a * D);
      const f = (x: number, y: number) => [
        t.cx + (x - t.cx) * c - (y - t.cy) * s,
        t.cy + (x - t.cx) * s + (y - t.cy) * c,
      ];
      p1 = f(x1, y1);
      p2 = f(x2, y2);
    }
    const du = p2[0] - p1[0];
    const dv = p2[1] - p1[1];
    const len = Math.hypot(du, dv) + wd * 0.7;
    fine(
      color,
      box(len, wd, d),
      mp(kind, (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2, w0 + d / 2, Math.atan2(dv, du) / D),
    );
  };
  const poly = (
    color: string,
    kind: Kind,
    pts: number[][],
    wd: number,
    d: number,
    w0: number,
    t: Tilt = null,
  ) => {
    for (let i = 0; i < pts.length - 1; i++)
      seg(color, kind, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], wd, d, w0, t);
  };

  const GLYPHS: Record<string, number[][]> = {
    B: [[0, 0, 0, 2], [0, 2, 0.8, 2], [0.8, 2, 0.8, 1], [0.8, 1, 0, 1], [0.8, 1, 0.8, 0], [0.8, 0, 0, 0]],
    O: [[0, 0, 0, 2], [0, 2, 0.8, 2], [0.8, 2, 0.8, 0], [0.8, 0, 0, 0]],
    T: [[0, 2, 0.8, 2], [0.4, 2, 0.4, 0]],
    "-": [[0.1, 1, 0.7, 1]],
    "7": [[0, 2, 0.8, 2], [0.8, 2, 0.25, 0]],
  };
  const text = (
    str: string,
    x0: number,
    y0: number,
    s: number,
    pitch: number,
    kind: Kind,
    wd: number,
    d: number,
    w0: number,
    t: Tilt,
  ) => {
    [...str].forEach((ch, i) => {
      for (const g of GLYPHS[ch] ?? [])
        seg(P.marker, kind, x0 + i * pitch + g[0] * s, y0 + g[1] * s, x0 + i * pitch + g[2] * s, y0 + g[3] * s, wd, d, w0, t);
    });
  };

  // =================================================================================================
  // 1. SHELL: front, back, sides with arm holes
  // =================================================================================================
  solid(P.cardboard, box(2 * HX, 0.5, T), mm(0, 0.75, HZ - T / 2), "torsoFrontWall");
  solid(P.cardboard, box(2 * HX, 0.5, T), mm(0, 0.75, -HZ + T / 2), "torsoBackWall");
  const zin = HZ - T;
  for (const s of [1, -1]) {
    const x = s * (HX - T / 2);
    solid(P.cardboard, box(T, 0.05, 2 * zin), mm(x, 0.975, 0), "torsoSideTop");
    solid(P.cardboard, box(T, 0.31, 2 * zin), mm(x, 0.655, 0), "torsoSideLow");
    for (const q of [1, -1])
      solid(P.cardboard, box(T, 0.14, zin - 0.07), mm(x, 0.88, (q * (0.07 + zin)) / 2), "torsoSideHolePost");
  }

  // interior: dark underside, shirt body, sleeves, collar
  solid(P.cardboardDark, box(2 * (HX - T), 0.008, 2 * zin), mm(0, 0.504, 0), "torsoUnderside");
  solid(P.shirt, box(0.28, 0.47, 0.2), mm(0, 0.735, 0), "torsoShirt");
  for (const s of [1, -1]) solid(P.shirt, cylX(0.06, 0.12, 10), mm(s * 0.19, 0.88, 0), "torsoSleeve");
  solid(P.shirt, new THREE.TorusGeometry(0.08, 0.013, 5, 12).rotateX(Math.PI / 2), mm(0, 0.99, 0), "torsoCollar", true);

  // dark inside rim at the top opening
  solid(P.cardboardDark, box(2 * (HX - T) - 0.02, 0.025, 0.01), mm(0, 0.985, HZ - T - 0.005), "torsoRimFront");
  solid(P.cardboardDark, box(2 * (HX - T) - 0.02, 0.025, 0.01), mm(0, 0.985, -HZ + T + 0.005), "torsoRimBack");
  for (const s of [1, -1])
    solid(P.cardboardDark, box(0.01, 0.025, 2 * zin - 0.02), mm(s * (HX - T - 0.005), 0.985, 0), "torsoRimSide");

  // =================================================================================================
  // 2. CORRUGATED EDGES: corner posts, fluting ridges, bottom band
  // =================================================================================================
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const px = sx * 0.255;
      const pz = sz * 0.175;
      solid(P.corrugation, box(0.03, 0.5, 0.03), mm(px, 0.75, pz), "torsoCornerPost");
      for (let y = 0.525; y < 0.99; y += 0.034) {
        fine(P.cardboardDark, box(0.026, 0.0045, 0.003), mm(px, y, sz * (HZ + 0.01)));
        fine(P.cardboardDark, box(0.003, 0.0045, 0.026), mm(sx * (HX + 0.01), y, pz));
      }
    }

  const wrap = (color: string, y: number, h: number, d: number, name: string, sides = 4) => {
    solid(color, box(2 * (HX + d), h, d), mm(0, y, HZ + d / 2), name + "Front");
    solid(color, box(2 * (HX + d), h, d), mm(0, y, -HZ - d / 2), name + "Back");
    if (sides === 4)
      for (const s of [1, -1]) solid(color, box(d, h, 2 * HZ), mm(s * (HX + d / 2), y, 0), name + "Side");
  };
  // bottom corrugated band with visible flutes
  wrap(P.corrugation, 0.511, 0.022, 0.012, "torsoFlute");
  for (let x = -HX + 0.011; x < HX; x += 0.022)
    for (const sz of [1, -1]) fine(P.cardboardDark, box(0.004, 0.018, 0.003), mm(x, 0.511, sz * (HZ + 0.012)));
  for (let z = -HZ + 0.011; z < HZ; z += 0.022)
    for (const sx of [1, -1]) fine(P.cardboardDark, box(0.003, 0.018, 0.004), mm(sx * (HX + 0.012), 0.511, z));

  // =================================================================================================
  // 3. TOP FLAPS
  // =================================================================================================
  for (const s of [1, -1]) {
    solid(P.cardboardLight, box(0.062, 0.006, 0.35), mm(s * 0.229, 0.997, 0), "torsoSideFlap");
    for (let z = -0.16; z <= 0.165; z += 0.02) fine(P.cardboardDark, box(0.004, 0.0065, 0.003), mm(s * 0.1985, 0.997, z));
    // shoulder strap of tape over the flap, down the front and back
    solid(P.tapeGrey, box(0.035, 0.003, 0.37), mm(s * 0.23, 1.0015, 0), "torsoStrapTop");
    solid(P.tapeGrey, box(0.035, 0.12, 0.005), mm(s * 0.23, 0.94, HZ + 0.0025), "torsoStrapFront");
    solid(P.tapeGrey, box(0.035, 0.12, 0.005), mm(s * 0.23, 0.94, -HZ - 0.0025), "torsoStrapBack");
    // marker rivet dots on the strap
    for (const zz of [-0.12, 0, 0.12]) fine(P.marker, cylZ(0.0035, 0.0035, 0.002, 6).rotateX(Math.PI / 2), mm(s * 0.23, 1.0045, zz));
  }

  // front flap: folded up and open a bit
  const frontFlapM = mm(0, 1.0 + 0.025 * Math.sin(12 * D), HZ + 0.025 * Math.cos(12 * D), -12, jit(1.5), 0);
  solid(P.cardboardLight, box(2 * HX, 0.006, 0.05), frontFlapM, "torsoFrontFlap");
  const child = (pm: THREE.Matrix4, x: number, y: number, z: number) =>
    pm.clone().multiply(new THREE.Matrix4().makeTranslation(x, y, z));
  solid(P.tapeRed, box(0.04, 0.003, 0.05), child(frontFlapM, 0.12, 0.0045, 0), "torsoFlapTape");
  for (let x = -0.245; x <= 0.25; x += 0.025) fine(P.cardboardDark, box(0.003, 0.0065, 0.004), child(frontFlapM, x, 0, 0.0245));
  // marker arrow on the flap
  fine(P.marker, box(0.003, 0.0015, 0.035), child(frontFlapM, -0.1, 0.0033, 0.0));
  fine(P.marker, box(0.003, 0.0015, 0.0128), child(frontFlapM, -0.104, 0.0033, 0.015).multiply(new THREE.Matrix4().makeRotationY(-141 * D)));
  fine(P.marker, box(0.003, 0.0015, 0.0128), child(frontFlapM, -0.096, 0.0033, 0.015).multiply(new THREE.Matrix4().makeRotationY(141 * D)));

  // back flap: folded up more
  const backFlapM = mm(0, 1.0 + 0.03 * Math.sin(10 * D), -HZ - 0.03 * Math.cos(10 * D), 10, jit(1), 0);
  solid(P.cardboardLight, box(2 * HX - 0.02, 0.006, 0.06), backFlapM, "torsoBackFlap");
  for (let x = -0.24; x <= 0.245; x += 0.025) fine(P.cardboardDark, box(0.003, 0.0065, 0.004), child(backFlapM, x, 0, -0.0295));

  // =================================================================================================
  // 4. DUCT TAPE SEAMS
  // =================================================================================================
  wrap(P.tapeGrey, 0.5475, 0.035, 0.004, "torsoBelt");
  // red repair X over the belt
  solid(P.tapeRed, box(0.075, 0.022, 0.0015), mp("front", -0.13, 0.5475, 0.18475, 40 + jit(4)), "torsoBeltX1");
  solid(P.tapeRed, box(0.075, 0.022, 0.0015), mp("front", -0.13, 0.5475, 0.1855, -40 + jit(4)), "torsoBeltX2");
  // red band under the top edge, front and back
  wrap(P.tapeRed, 0.97, 0.02, 0.004, "torsoRedBand", 2);

  // =================================================================================================
  // 5. CONTROL PANEL
  // =================================================================================================
  solid(P.cardboardLight, box(0.37, 0.235, 0.003), mp("front", 0, 0.785, 0.1815, 0.8), "panelMat");
  solid(P.foil, box(0.34, 0.21, 0.006), mp("front", 0, 0.785, 0.186), "panelFoil");
  // grey tape border
  solid(P.tapeGrey, box(0.34, 0.012, 0.003), mp("front", 0, 0.884, PB + 0.0015), "panelTapeTop");
  solid(P.tapeGrey, box(0.34, 0.012, 0.003), mp("front", 0, 0.686, PB + 0.0015), "panelTapeBottom");
  for (const s of [1, -1]) solid(P.tapeGrey, box(0.012, 0.186, 0.003), mp("front", s * 0.164, 0.785, PB + 0.0015), "panelTapeSide");
  // corner bolts
  for (const sx of [1, -1])
    for (const y of [0.884, 0.686])
      solid(BOLT, cylZ(0.0045, 0.0045, 0.004, 8), mp("front", sx * 0.164, y, PB + 0.005), "panelBolt");
  // red tape at the corner
  solid(P.tapeRed, box(0.075, 0.02, 0.002), mp("front", -0.15, 0.872, PB + 0.004, 38), "panelCornerTape");
  // foil crinkles
  for (const c of [
    [0.022, 0.87, 0.05, 0.84],
    [0.03, 0.805, 0.055, 0.78],
    [-0.15, 0.7, -0.11, 0.712],
    [0.148, 0.745, 0.15, 0.768],
    [0.02, 0.76, 0.04, 0.745],
    [-0.04, 0.705, -0.02, 0.69],
  ])
    seg(P.foilDark, "front", c[0], c[1], c[2], c[3], 0.003, 0.001, PB);

  // screen: marker frame, green fill, scanlines, scribble wave, glints
  const SY = 0.826;
  const SX = -0.074;
  solid(P.marker, box(0.156, 0.006, 0.004), mp("front", SX, SY + 0.047, PB + 0.002), "screenFrameTop");
  solid(P.marker, box(0.156, 0.006, 0.004), mp("front", SX, SY - 0.047, PB + 0.002), "screenFrameBottom");
  solid(P.marker, box(0.006, 0.1, 0.004), mp("front", SX - 0.075, SY, PB + 0.002), "screenFrameL");
  solid(P.marker, box(0.006, 0.1, 0.004), mp("front", SX + 0.075, SY, PB + 0.002), "screenFrameR");
  solid(P.screenGreen, box(0.144, 0.088, 0.003), mp("front", SX, SY, PB + 0.0015), "screenFill");
  for (let k = 0; k < 5; k++) seg(SCAN, "front", -0.14, SY - 0.036 + k * 0.018, -0.008, SY - 0.036 + k * 0.018, 0.0025, 0.001, PB + 0.003);
  const wave: number[][] = [
    [0, 0], [0.1, 0], [0.16, 0.022], [0.22, -0.026], [0.3, 0.012], [0.38, -0.012], [0.45, 0],
    [0.55, 0], [0.6, 0.032], [0.65, -0.032], [0.71, 0.02], [0.78, -0.004], [0.86, 0.008], [1, 0],
  ];
  poly(P.marker, "front", wave.map((p) => [-0.142 + 0.136 * p[0], SY + p[1]]), 0.0028, 0.0015, PB + 0.003);
  seg(P.eyeWhite, "front", -0.143, 0.866, -0.126, 0.849, 0.003, 0.001, PB + 0.003);
  seg(P.eyeWhite, "front", -0.135, 0.867, -0.126, 0.858, 0.002, 0.001, PB + 0.003);
  for (let x = -0.14; x < -0.01; x += 0.02) fine(P.marker, box(0.002, 0.005, 0.001), mp("front", x, SY - 0.040, PB + 0.0035));

  // dials with marker tick marks
  const dials: [number, string, number][] = [
    [0.065, P.cardboardLight, 40],
    [0.125, P.tapeRed, -55],
  ];
  for (const [cx, topColor, ang] of dials) {
    solid(P.cardboardDark, cylZ(0.019, 0.019, 0.008, 10), mp("front", cx, SY, PB + 0.004), "dialBase");
    solid(topColor, cylZ(0.0145, 0.0145, 0.004, 10), mp("front", cx, SY, PB + 0.01), "dialTop");
    const pr = ang * D;
    fine(P.marker, box(0.0028, 0.013, 0.0012), mp("front", cx + Math.sin(pr) * 0.0065, SY + Math.cos(pr) * 0.0065, PB + 0.0126, -ang));
    for (let i = 0; i < 7; i++) {
      const a = (-120 + i * 40) * D;
      const long = i % 3 === 0;
      fine(
        P.marker,
        box(0.0025, long ? 0.009 : 0.006, 0.0012),
        mp("front", cx + Math.sin(a) * 0.027, SY + Math.cos(a) * 0.027, PB + 0.0006, -(a / D)),
      );
    }
  }

  // bottle-cap buttons: red, blue, yellow
  const caps: [number, string][] = [
    [-0.125, P.capRed],
    [-0.065, P.capBlue],
    [-0.005, P.capYellow],
  ];
  for (const [x, color] of caps) {
    solid(color, cylZ(0.0235, 0.026, 0.008, 12), mp("front", x, 0.725, PB + 0.004), "buttonCap", true);
    solid(color, cylZ(0.016, 0.017, 0.004, 12), mp("front", x, 0.725, PB + 0.01), "buttonCapTop", true);
    fine(P.marker, new THREE.TorusGeometry(0.0285, 0.0012, 4, 16), mp("front", x, 0.725, PB + 0.0012));
    fine(P.marker, new THREE.TorusGeometry(0.009, 0.0011, 4, 10), mp("front", x, 0.725, PB + 0.0125));
    fine(P.eyeWhite, cylZ(0.003, 0.003, 0.002, 6), mp("front", x - 0.008, 0.733, PB + 0.0125));
  }

  // slider switch
  fine(P.marker, box(0.09, 0.012, 0.002), mp("front", 0.105, 0.725, PB + 0.001));
  solid(P.cardboardLight, box(0.016, 0.03, 0.007), mp("front", 0.12, 0.725, PB + 0.0045), "sliderKnob");
  fine(P.marker, box(0.0025, 0.02, 0.001), mp("front", 0.12, 0.725, PB + 0.0078));
  fine(P.marker, box(0.002, 0.022, 0.001), mp("front", 0.056, 0.725, PB + 0.0005));
  fine(P.marker, box(0.002, 0.022, 0.001), mp("front", 0.154, 0.725, PB + 0.0005));

  // =================================================================================================
  // 6. HAND-LETTERED LABEL
  // =================================================================================================
  const LT: Tilt = { cx: 0, cy: 0.62, a: 0.8 };
  solid(PAPER, box(0.25, 0.075, 0.003), mp("front", 0, 0.62, 0.1815, 0.8), "emblemLabel");
  text("BOT-7", -0.096, 0.595, 0.025, 0.042, "front", 0.0045, 0.002, 0.183, LT);
  for (const sx of [1, -1])
    for (const sy of [1, -1])
      fine(P.marker, cylZ(0.0028, 0.0028, 0.0015, 6), mp("front", sx * 0.113, 0.62 + sy * 0.03, 0.1838));

  // =================================================================================================
  // 7. ARM HOLES
  // =================================================================================================
  for (const s of [1, -1]) {
    const kind: Kind = s > 0 ? "left" : "right";
    // outer cut edge showing corrugation
    solid(P.corrugation, box(0.004, 0.012, 0.164), mm(s * (HX + 0.002), 0.956, 0), "holeEdgeTop");
    solid(P.corrugation, box(0.004, 0.012, 0.164), mm(s * (HX + 0.002), 0.804, 0), "holeEdgeBottom");
    for (const q of [1, -1]) solid(P.corrugation, box(0.004, 0.14, 0.012), mm(s * (HX + 0.002), 0.88, q * 0.076), "holeEdgeSide");
    // dark inner rim
    solid(P.cardboardDark, box(0.03, 0.008, 0.14), mm(s * 0.245, 0.946, 0), "holeRimTop");
    solid(P.cardboardDark, box(0.03, 0.008, 0.14), mm(s * 0.245, 0.814, 0), "holeRimBottom");
    for (const q of [1, -1]) solid(P.cardboardDark, box(0.03, 0.132, 0.008), mm(s * 0.245, 0.88, q * 0.066), "holeRimSide");
    // grey reinforcement tape at two corners
    solid(P.tapeGrey, box(0.05, 0.014, 0.0015), mp(kind, zu(kind, 0.09), 0.968, HX + 0.0048, 45), "holeTape1");
    solid(P.tapeGrey, box(0.05, 0.014, 0.0015), mp(kind, zu(kind, -0.09), 0.792, HX + 0.0048, 45), "holeTape2");
  }

  // =================================================================================================
  // 8. SIDE PANEL DOODLES AND TAPE
  // =================================================================================================
  // left side (+X): red seam, cardboard patch with battery drawing
  solid(P.tapeRed, box(0.035, 0.27, 0.004), mp("left", 0.11, 0.665, HX + 0.002), "sideRedTapeL");
  solid(P.cardboardLight, box(0.17, 0.1, 0.003), mp("left", -0.01, 0.64, HX + 0.0015, 1.5), "sidePatch");
  solid(P.tapeGrey, box(0.05, 0.016, 0.0015), mp("left", 0.075, 0.685, HX + 0.0038, 45), "patchTape1");
  solid(P.tapeGrey, box(0.05, 0.016, 0.0015), mp("left", -0.095, 0.595, HX + 0.0038, 45), "patchTape2");
  poly(P.marker, "left", [[-0.07, 0.61], [0.04, 0.61], [0.04, 0.67], [-0.07, 0.67], [-0.07, 0.61]], 0.004, 0.002, HX + 0.003);
  fine(P.marker, box(0.012, 0.02, 0.002), mp("left", 0.048, 0.64, HX + 0.004));
  for (const u of [-0.052, -0.027, -0.002]) seg(P.marker, "left", u, 0.62, u, 0.66, 0.006, 0.002, HX + 0.003);

  // right side (-X): red seam and a lightning bolt
  solid(P.tapeRed, box(0.035, 0.27, 0.004), mp("right", 0.11, 0.665, HX + 0.002), "sideRedTapeR");
  poly(P.marker, "right", [[0.0, 0.73], [-0.04, 0.66], [-0.005, 0.66], [-0.05, 0.585]], 0.005, 0.002, HX);
  seg(P.marker, "right", -0.065, 0.74, -0.04, 0.745, 0.003, 0.002, HX);
  poly(P.marker, "right", [[0.04, 0.585], [0.06, 0.6], [0.04, 0.615], [0.06, 0.63]], 0.003, 0.002, HX);

  // back: grey seam with red patches, vent grille, handle slot
  solid(P.tapeGrey, box(0.04, 0.46, 0.004), mp("back", 0, 0.75, HZ + 0.002), "backSeam");
  solid(P.tapeRed, box(0.1, 0.03, 0.0015), mp("back", 0, 0.62, HZ + 0.0048, 8), "backPatch1");
  solid(P.tapeRed, box(0.1, 0.03, 0.0015), mp("back", 0, 0.88, HZ + 0.0048, -6), "backPatch2");
  poly(P.marker, "back", [[0.09, 0.65], [0.2, 0.65], [0.2, 0.85], [0.09, 0.85], [0.09, 0.65]], 0.004, 0.002, HZ);
  for (let v = 0.682; v < 0.84; v += 0.032) seg(P.marker, "back", 0.098, v, 0.192, v, 0.005, 0.002, HZ);
  fine(P.marker, box(0.12, 0.03, 0.002), mp("back", -0.14, 0.795, HZ + 0.001));
  fine(P.marker, box(0.12, 0.004, 0.002), mp("back", -0.14, 0.775, HZ + 0.001));

  // =================================================================================================
  // flush merged fine details: one part per colour
  // =================================================================================================
  let idx = 0;
  for (const [color, arr] of batches) {
    if (!arr.length) continue;
    const merged = mergeGeometries(arr);
    if (merged) b.part(merged, color, { bone, at: [0, 0, 0], name: `torsoDetail${idx++}` });
  }
}
    return buildTorsoBox;
  })(),
  // headBox
  (() => {
function buildHeadBox({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const PI = Math.PI;

  // Three colours of my own, on top of the palette.
  const ROSY = "#f08f80";
  const RED_LIGHT = "#ee6b61";
  const BLUE_LIGHT = "#5b94e6";

  // ---- Merged-geometry bag: one part per bone and colour -----------------------------------------------------
  const makeBag = (bone: any) => {
    const m = new Map<string, THREE.BufferGeometry[]>();
    const add = (
      geo: THREE.BufferGeometry,
      color: string,
      x: number,
      y: number,
      z: number,
      rx = 0,
      ry = 0,
      rz = 0,
      sx = 1,
      sy = 1,
      sz = 1,
    ) => {
      const mat = new THREE.Matrix4().compose(
        new THREE.Vector3(x, y, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
        new THREE.Vector3(sx, sy, sz),
      );
      geo.applyMatrix4(mat);
      if (!m.has(color)) m.set(color, []);
      m.get(color)!.push(geo);
    };
    const box = (sx: number, sy: number, sz: number, x: number, y: number, z: number, color: string, rx = 0, ry = 0, rz = 0) =>
      add(new THREE.BoxGeometry(sx, sy, sz), color, x, y, z, rx, ry, rz);
    const cyl = (rad: number, h: number, seg: number, x: number, y: number, z: number, color: string, axis: "x" | "y" | "z" = "y") =>
      add(
        new THREE.CylinderGeometry(rad, rad, h, seg),
        color,
        x,
        y,
        z,
        axis === "z" ? PI / 2 : 0,
        0,
        axis === "x" ? PI / 2 : 0,
      );
    const ell = (ax: number, ay: number, az: number, x: number, y: number, z: number, color: string, ws = 8, hs = 6) =>
      add(new THREE.SphereGeometry(1, ws, hs), color, x, y, z, 0, 0, 0, ax, ay, az);
    const flush = () => {
      for (const [color, geos] of m) {
        const merged = mergeGeometries(geos, false);
        if (merged) b.part(merged, color, { bone, at: [0, 0, 0], flat: true });
      }
      m.clear();
    };
    return { add, box, cyl, ell, flush };
  };

  const H = makeBag(J.head);

  // Corrugated strip: a base box with proud dark flute lines every `step` along axis `ax` (0 x, 1 y, 2 z).
  const flutes = (
    bag: ReturnType<typeof makeBag>,
    cx: number,
    cy: number,
    cz: number,
    sx: number,
    sy: number,
    sz: number,
    ax: 0 | 1 | 2,
    step = 0.009,
  ) => {
    bag.box(sx, sy, sz, cx, cy, cz, P.corrugation);
    const dims = [sx, sy, sz];
    const len = dims[ax];
    const n = Math.max(2, Math.floor(len / step));
    for (let k = 0; k < n; k++) {
      const off = -len / 2 + (len * (k + 0.5)) / n;
      const d = [sx + 0.0012, sy + 0.0012, sz + 0.0012];
      d[ax] = 0.0016;
      const c = [cx, cy, cz];
      c[ax] += off;
      bag.box(d[0], d[1], d[2], c[0], c[1], c[2], P.cardboardDark);
    }
  };

  // Marker rectangle outline facing +Z (dir 1) or -Z (dir -1).
  const outlineRect = (bag: ReturnType<typeof makeBag>, cx: number, cy: number, w: number, h: number, t: number, zS: number, dir: number, color: string) => {
    const th = 0.0016;
    const zc = zS + (dir * th) / 2;
    bag.box(w + t, t, th, cx, cy + h / 2, zc, color);
    bag.box(w + t, t, th, cx, cy - h / 2, zc, color);
    bag.box(t, h, th, cx - w / 2, cy, zc, color);
    bag.box(t, h, th, cx + w / 2, cy, zc, color);
  };

  // Marker rivet with a tiny highlight, facing +Z.
  const rivet = (x: number, y: number, zS: number, dir = 1) => {
    H.cyl(0.0045, 0.003, 6, x, y, zS + (dir * 0.003) / 2, P.marker, "z");
    H.box(0.0016, 0.0016, 0.0008, x - 0.0012, y + 0.0012, zS + dir * 0.0034, P.foil);
  };

  // ---- Shell dimensions --------------------------------------------------------------------------------------
  const X = 0.18;
  const T = 0.01;

  // Side walls
  for (const s of [1, -1]) H.box(T, 0.25, 0.36, s * (X - T / 2), 1.105, 0.01, P.cardboard);
  // Back wall
  H.box(0.34, 0.25, T, 0, 1.105, -0.165, P.cardboardDark);
  // Fixed part of the top (folded flaps meeting) and the dark hole under the open flap
  H.box(0.36, 0.008, 0.21, 0, 1.226, 0.085, P.cardboardLight);
  H.box(0.35, 0.004, 0.105, 0, 1.215, -0.1175, P.cardboardDark);
  // seam between the closed flaps, grey tape over it
  H.box(0.003, 0.0012, 0.21, 0, 1.2304, 0.085, P.cardboardDark);
  H.box(0.036, 0.0012, 0.2, 0, 1.2308, 0.09, P.tapeGrey, 0, 0.01, 0);
  // red tape over the top front edge
  H.box(0.37, 0.0012, 0.034, 0, 1.2316, 0.172, P.tapeRed, 0, 0.012, 0);
  H.box(0.37, 0.034, 0.0016, 0, 1.2125, 0.1908, P.tapeRed);

  // Front frame around the window (window x ±0.11, y 1.045..1.195)
  H.box(0.36, 0.035, T, 0, 1.2125, 0.185, P.cardboard);
  H.box(0.36, 0.065, T, 0, 1.0125, 0.185, P.cardboard);
  for (const s of [1, -1]) H.box(0.07, 0.15, T, s * 0.145, 1.12, 0.185, P.cardboard);
  // window reveal (inner depth)
  H.box(0.22, 0.004, 0.035, 0, 1.193, 0.1725, P.cardboardDark);
  H.box(0.22, 0.004, 0.035, 0, 1.047, 0.1725, P.cardboardDark);
  for (const s of [1, -1]) H.box(0.004, 0.15, 0.035, s * 0.108, 1.12, 0.1725, P.cardboardDark);

  // Bottom ring around the neck hole
  for (const s of [1, -1]) H.box(0.13, 0.008, 0.36, s * 0.115, 0.984, 0.01, P.cardboardDark);
  H.box(0.1, 0.008, 0.14, 0, 0.984, 0.12, P.cardboardDark);
  H.box(0.1, 0.008, 0.12, 0, 0.984, -0.11, P.cardboardDark);

  // ---- Kid's head inside the box -----------------------------------------------------------------------------
  H.box(0.216, 0.17, 0.22, 0, 1.115, 0.045, P.skin); // face block, front at z 0.155
  H.box(0.224, 0.034, 0.23, 0, 1.205, 0.04, P.hair); // hair cap
  H.box(0.224, 0.14, 0.012, 0, 1.13, -0.071, P.hair); // back hair
  // fringe: hanging blocks under the window top
  H.box(0.216, 0.012, 0.008, 0, 1.19, 0.1585, P.hair);
  for (let i = 0; i < 9; i++) {
    const h = 0.016 + r() * 0.022;
    H.box(0.03, h, 0.007, -0.1 + i * 0.025, 1.195 - h / 2, 0.1585, P.hair, 0, 0, (r() - 0.5) * 0.3);
  }
  // side tufts
  for (const s of [1, -1]) {
    H.box(0.016, 0.055, 0.01, s * 0.098, 1.165, 0.1585, P.hair, 0, 0, s * 0.12);
    H.box(0.011, 0.025, 0.01, s * 0.101, 1.125, 0.1585, P.hair, 0, 0, s * 0.2);
  }

  // Eyes, brows, cheeks, nose, mouth
  for (const s of [1, -1]) {
    H.ell(0.0285, 0.0335, 0.004, s * 0.048, 1.135, 0.1575, P.marker);
    H.ell(0.0255, 0.031, 0.004, s * 0.048, 1.135, 0.1583, P.eyeWhite);
    H.ell(0.0135, 0.0175, 0.003, s * 0.045, 1.134, 0.1606, P.marker);
    H.ell(0.0042, 0.0048, 0.0015, s * 0.0405, 1.1425, 0.1628, P.eyeWhite, 6, 4);
    H.box(0.034, 0.0065, 0.004, s * 0.05, 1.169, 0.1586, P.hair, 0, 0, -s * 0.1);
    H.ell(0.017, 0.011, 0.003, s * 0.077, 1.092, 0.1565, ROSY);
  }
  H.ell(0.009, 0.008, 0.006, 0, 1.108, 0.1575, ROSY);
  b.sweep(
    catmull([
      [-0.032, 1.087, 0.1575],
      [-0.017, 1.075, 0.1578],
      [0, 1.071, 0.1578],
      [0.017, 1.075, 0.1578],
      [0.032, 1.087, 0.1575],
    ]),
    0.0045,
    { color: P.mouth, bone: J.head, sides: 5 },
  );
  for (const s of [1, -1]) H.ell(0.0035, 0.0035, 0.002, s * 0.036, 1.09, 0.1575, P.mouth, 5, 4);

  // ---- Marker details on the front --------------------------------------------------------------------------
  outlineRect(H, 0, 1.12, 0.228, 0.158, 0.0022, 0.19, 1, P.marker); // window outline
  // mouth grille below the window
  outlineRect(H, 0, 1.0125, 0.13, 0.04, 0.0032, 0.19, 1, P.marker);
  for (let i = 0; i < 4; i++) H.box(0.114, 0.004, 0.0016, 0, 1.0125 + (i - 1.5) * 0.0095, 0.19075, P.marker);
  for (const s of [1, -1]) {
    rivet(s * 0.1, 1.0125, 0.19);
    rivet(s * 0.135, 1.2125, 0.19);
    rivet(s * 0.135, 1.0125, 0.19);
  }
  // red tape wrapped around the front vertical corners
  for (const s of [1, -1]) {
    H.box(0.025, 0.25, 0.003, s * 0.1675, 1.105, 0.1915, P.tapeRed, 0, 0, s * 0.008);
    H.box(0.003, 0.25, 0.03, s * 0.1815, 1.105, 0.175, P.tapeRed);
  }

  // ---- Corrugated edge strips --------------------------------------------------------------------------------
  flutes(H, 0, 0.986, 0.1915, 0.31, 0.012, 0.003, 0);
  flutes(H, 0, 0.986, -0.1715, 0.31, 0.012, 0.003, 0);
  for (const s of [1, -1]) {
    flutes(H, s * 0.1815, 0.986, 0.01, 0.003, 0.012, 0.36, 2);
    flutes(H, s * 0.1815, 1.2245, 0.01, 0.003, 0.01, 0.36, 2);
    flutes(H, s * 0.172, 1.105, -0.172, 0.016, 0.25, 0.004, 1);
  }

  // ---- Back details ------------------------------------------------------------------------------------------
  H.box(0.04, 0.25, 0.002, -0.03, 1.105, -0.171, P.tapeGrey, 0, 0, 0.01);
  outlineRect(H, 0.085, 1.12, 0.08, 0.06, 0.0025, -0.171, -1, P.marker);
  H.box(0.09, 0.0016, 0.0016, 0.085, 1.12, -0.1718, P.marker, 0, 0, 0.6);
  H.box(0.09, 0.0016, 0.0016, 0.085, 1.12, -0.1718, P.marker, 0, 0, -0.6);
  rivet(0.135, 1.2, -0.171, -1);
  rivet(0.04, 1.04, -0.171, -1);

  // ---- Bottle-cap ears ---------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    H.cyl(0.043, 0.012, 14, s * 0.186, 1.11, 0, P.capRed, "x");
    H.cyl(0.033, 0.002, 14, s * 0.193, 1.11, 0, RED_LIGHT, "x");
    H.cyl(0.026, 0.004, 12, s * 0.196, 1.11, 0, P.capBlue, "x");
    H.cyl(0.017, 0.0015, 12, s * 0.19875, 1.11, 0, BLUE_LIGHT, "x");
    H.ell(0.004, 0.004, 0.0015, s * 0.1995, 1.11, 0, P.foilDark, 6, 4);
    H.add(new THREE.TorusGeometry(0.054, 0.0022, 4, 18), P.marker, s * 0.1807, 1.11, 0, 0, PI / 2, 0);
    // vent slits under the ear
    for (let i = 0; i < 3; i++) H.box(0.0016, 0.004, 0.06, s * 0.1808, 1.003 + i * 0.011, 0, P.marker);
  }

  // ---- Antenna: toilet-roll tube, spring, yellow cap ball --------------------------------------------------
  const AZ = 0.07;
  H.cyl(0.0255, 0.005, 10, 0, 1.2325, AZ, P.tapeRed);
  H.cyl(0.024, 0.025, 10, 0, 1.2425, AZ, P.cardboardLight);
  H.cyl(0.0245, 0.004, 10, 0, 1.244, AZ, P.marker);
  H.cyl(0.0205, 0.001, 10, 0, 1.2555, AZ, P.cardboardDark);
  H.ell(0.0125, 0.0125, 0.0125, 0, 1.2875, AZ, P.capYellow, 8, 6);
  H.cyl(0.0128, 0.0025, 10, 0, 1.2875, AZ, P.marker);
  H.ell(0.003, 0.003, 0.002, 0.004, 1.2955, AZ + 0.007, P.eyeWhite, 5, 4);
  b.sweep(coil([0, 1.2555, AZ], [0, 1.2755, AZ], 0.0085, 5), 0.0018, { color: P.foilDark, bone: J.head, sides: 4 });

  H.flush();

  // ---- Hatch flap (hinged at the back, slightly open) ---------------------------------------------------------
  const hatch = b.joint("headBoxHatch", { parent: J.head, at: [0, 1.23, -0.17], dir: [0, 0, 1], role: "hinge" });
  const F = makeBag(hatch);
  F.box(0.36, 0.008, 0.15, 0, 1.23, -0.095, P.cardboardLight);
  flutes(F, 0, 1.23, -0.0215, 0.36, 0.01, 0.003, 0);
  for (const s of [1, -1]) flutes(F, s * 0.1815, 1.23, -0.095, 0.003, 0.01, 0.15, 2);
  F.box(0.36, 0.0012, 0.035, 0, 1.2346, -0.15, P.tapeGrey, 0, 0.01, 0);
  F.box(0.035, 0.0012, 0.1, 0.11, 1.2346, -0.09, P.tapeRed, 0, 0.3, 0);
  F.box(0.06, 0.0012, 0.004, -0.08, 1.2346, -0.09, P.marker, 0, 0.7, 0);
  F.box(0.06, 0.0012, 0.004, -0.08, 1.2346, -0.09, P.marker, 0, -0.7, 0);
  F.flush();
  b.pose(hatch, { axis: [1, 0, 0], deg: -12 });

  // ---- Neck: skin cylinder inside the torso opening -----------------------------------------------------------
  b.part(new THREE.CylinderGeometry(0.045, 0.048, 0.07, 8), P.skin, { bone: J.neck, at: [0, 1.01, 0], flat: true });
}
    return buildHeadBox;
  })(),
  // armsLeft
  (() => {
function buildArmsLeft({ b, J, P, M }: Ctx) {
  const R = rng(4417);
  const Y = M.shoulderL[1]; // arm height, 0.88
  const Z = M.shoulderL[2];
  const FOIL_LIGHT = "#e8ecf2";
  const GLOVE_DARK = "#d9a820";
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- helpers ----------
  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    bone: any,
    rot: [number, number, number] = [0, 0, 0],
  ) => b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, bone, rotation: rot });

  // cylinder lying along the arm (+X)
  const ringX = (r0: number, r1: number, h: number, sides: number, color: string, x: number, bone: any) =>
    b.part(new THREE.CylinderGeometry(r1, r0, h, sides), color, {
      at: [x, Y, Z],
      dir: [1, 0, 0],
      bone,
      flat: sides < 10,
    });

  const ball = (r: number, color: string, at: THREE.Vector3, bone: any) =>
    b.part(new THREE.SphereGeometry(r, 7, 5), color, { at, bone });

  // ---------- upper arm: skin, with a shirt sleeve at the torso hole ----------
  b.rod([0.24, Y, Z], [0.455, Y, Z], 0.031, P.skin, { bone: J.shoulderL, sides: 10 });
  // shirt sleeve stub inside / at the arm hole
  ringX(0.041, 0.04, 0.11, 10, P.shirt, 0.295, J.shoulderL);
  ringX(0.043, 0.043, 0.01, 10, "#cfc8b2", 0.347, J.shoulderL); // sleeve hem
  // little muscle/elbow shaping
  ball(0.035, P.skin, V(0.452, Y, Z), J.elbowL);
  // elbow crease marks (slightly darker skin tone via marker-thin lines)
  box([0.0025, 0.004, 0.02], "#d9a67c", [0.42, Y + 0.0285, Z], J.shoulderL);
  box([0.0025, 0.004, 0.016], "#d9a67c", [0.427, Y + 0.0285, Z + 0.004], J.shoulderL);

  // ---------- foil tube sleeve (forearm) ----------
  b.rod([0.465, Y, Z], [0.605, Y, Z], [0.045, 0.041], P.foil, {
    bone: J.elbowL,
    section: { ngon: 7 },
    caps: "flat",
  });
  // end rim of sleeve at the elbow (darker foil lip)
  ringX(0.047, 0.047, 0.012, 7, P.foilDark, 0.468, J.elbowL);
  // crinkle bands
  [0.49, 0.525, 0.558].forEach((x, i) => {
    ringX(0.0455 - i * 0.0018, 0.0455 - i * 0.0018, 0.009, 7, P.foilDark, x, J.elbowL);
  });
  // crinkle facets: random bits of crumpled foil
  for (let i = 0; i < 16; i++) {
    const x = 0.48 + R() * 0.115;
    const a = R() * Math.PI * 2;
    const rad = 0.043 - (x - 0.465) * 0.02;
    const col = i % 3 === 0 ? FOIL_LIGHT : i % 3 === 1 ? P.foilDark : P.foil;
    const deg = (a * 180) / Math.PI;
    box(
      [0.014 + R() * 0.012, 0.004, 0.012 + R() * 0.01],
      col,
      [x, Y + Math.cos(a) * rad, Z + Math.sin(a) * rad],
      J.elbowL,
      [deg, (R() - 0.5) * 50, (R() - 0.5) * 40],
    );
  }
  // grey tape seam running along the top of the sleeve
  box([0.085, 0.003, 0.014], P.tapeGrey, [0.535, Y + 0.0425, Z], J.elbowL);
  // marker arrow doodle on the sleeve top
  box([0.03, 0.002, 0.004], P.marker, [0.535, Y + 0.0455, Z], J.elbowL);
  box([0.011, 0.002, 0.004], P.marker, [0.547, Y + 0.0455, Z + 0.004], J.elbowL, [0, -35, 0]);
  box([0.011, 0.002, 0.004], P.marker, [0.547, Y + 0.0455, Z - 0.004], J.elbowL, [0, 35, 0]);

  // ---------- red tape cuff ----------
  ringX(0.049, 0.049, 0.03, 8, P.tapeRed, 0.59, J.elbowL);
  ringX(0.0505, 0.0505, 0.004, 8, "#a52a22", 0.578, J.elbowL);
  ringX(0.0505, 0.0505, 0.004, 8, "#a52a22", 0.602, J.elbowL);
  // loose tape tail hanging from the cuff
  box([0.016, 0.03, 0.002], P.tapeRed, [0.588, Y - 0.062, Z + 0.016], J.elbowL, [8, 0, 10]);

  // ---------- cardboard claw-style cuff flaps ----------
  const L = 0.032;
  const tilt = 28;
  const th = (tilt * Math.PI) / 180;
  const r0 = 0.047;
  const x0 = 0.603;
  for (let i = 0; i < 6; i++) {
    const adeg = i * 60 + 15;
    const a = (adeg * Math.PI) / 180;
    const cx = x0 + 0.5 * L * Math.cos(th);
    const rad = r0 + 0.5 * L * Math.sin(th);
    box(
      [L, 0.003, 0.02],
      i % 2 ? P.cardboardDark : P.cardboard,
      [cx, Y + Math.cos(a) * rad, Z + Math.sin(a) * rad],
      J.wristL,
      [adeg, 0, tilt],
    );
    const tx = x0 + L * Math.cos(th);
    const trad = r0 + L * Math.sin(th);
    box(
      [0.004, 0.0045, 0.02],
      P.corrugation,
      [tx, Y + Math.cos(a) * trad, Z + Math.sin(a) * trad],
      J.wristL,
      [adeg, 0, tilt],
    );
  }

  // ---------- glove hand ----------
  ringX(0.035, 0.035, 0.05, 8, P.glove, 0.625, J.wristL); // glove wrist
  ringX(0.0385, 0.0385, 0.01, 8, GLOVE_DARK, 0.642, J.wristL); // elastic cuff band
  box([0.078, 0.03, 0.072], P.glove, [0.677, Y, Z], J.wristL); // palm
  box([0.078, 0.004, 0.074], GLOVE_DARK, [0.677, Y - 0.0165, Z], J.wristL); // palm underside shade
  // thumb mound
  b.part(new THREE.SphereGeometry(0.02, 7, 5), P.glove, { at: [0.665, Y - 0.001, Z + 0.036], bone: J.wristL });
  // back-of-glove stitch lines
  [-0.027, -0.009, 0.009, 0.027].forEach((dz) => {
    box([0.05, 0.002, 0.0022], P.marker, [0.68, Y + 0.0155, Z + dz], J.wristL);
  });
  box([0.0022, 0.002, 0.06], P.marker, [0.655, Y + 0.0155, Z], J.wristL);
  // tiny cardboard glued star-ish patch on glove back (craft detail)
  box([0.022, 0.003, 0.022], P.cardboardLight, [0.69, Y + 0.0165, Z + 0.004], J.wristL, [0, 20, 0]);
  box([0.012, 0.0035, 0.004], P.tapeRed, [0.69, Y + 0.0172, Z + 0.004], J.wristL, [0, 20, 0]);

  // ---------- fingers: 2 segments each, with digit joints ----------
  const fingers = [
    { n: "Pinky", z: -0.027, ang: -22, s1: 0.028, s2: 0.022, r: 0.0082 },
    { n: "Ring", z: -0.009, ang: -8, s1: 0.034, s2: 0.026, r: 0.0088 },
    { n: "Middle", z: 0.009, ang: 6, s1: 0.037, s2: 0.028, r: 0.009 },
    { n: "Index", z: 0.027, ang: 20, s1: 0.033, s2: 0.026, r: 0.0088 },
  ];
  const buildDigit = (
    name: string,
    base: THREE.Vector3,
    dir: THREE.Vector3,
    s1: number,
    s2: number,
    r: number,
  ) => {
    const d = dir.clone().normalize();
    const mid = base.clone().addScaledVector(d, s1);
    const tip = mid.clone().addScaledVector(d, s2);
    const j1 = b.joint(`armsLeft${name}1`, {
      parent: J.wristL,
      at: [base.x, base.y, base.z],
      dir: [d.x, d.y, d.z],
      role: "digit",
    });
    const j2 = b.joint(`armsLeft${name}2`, {
      parent: j1,
      at: [mid.x, mid.y, mid.z],
      dir: [d.x, d.y, d.z],
      role: "digit",
    });
    b.capsule([base.x, base.y, base.z], [mid.x, mid.y, mid.z], r, P.glove, { bone: j1, sides: 6 });
    b.capsule([mid.x, mid.y, mid.z], [tip.x, tip.y, tip.z], r * 0.92, P.glove, { bone: j2, sides: 6 });
    ball(r * 1.06, P.glove, mid, j2);
    // knuckle crease on top of the finger
    b.part(new THREE.BoxGeometry(0.0025, 0.002, r * 1.2), GLOVE_DARK, {
      at: [mid.x, mid.y + r * 0.95, mid.z],
      bone: j2,
      rotation: [0, 0, 0],
    });
  };

  for (const f of fingers) {
    const a = (f.ang * Math.PI) / 180;
    buildDigit(f.n, V(0.712, Y, Z + f.z), V(Math.cos(a), 0, Math.sin(a)), f.s1, f.s2, f.r);
  }
  // thumb points forward (+Z) with the palm facing down
  buildDigit("Thumb", V(0.66, Y - 0.001, Z + 0.036), V(0.55, -0.08, 0.83), 0.028, 0.024, 0.0098);
}
    return buildArmsLeft;
  })(),
  // armsRight
  (() => {
function buildArmsRight({ b, J, P }: Ctx) {
  const r = rng(4107);
  const Y0 = 0.88; // arm axis height
  const X = (d: number) => -d; // d = distance outward from the mid-plane along the right arm

  // Own extra colours
  const GLOVE_DARK = "#c99a1c";
  const FOIL_LIGHT = "#e9edf3";
  const TAPE_EDGE = "#9c2820";

  const pt = (d: number, y = Y0, z = 0): [number, number, number] => [X(d), y, z];

  // ---------- Skin upper arm (comes out of the torso hole) ----------
  b.rod(pt(0.24), pt(0.31), 0.032, P.skin, { bone: J.shoulderR, sides: 8, smooth: false });
  // soft shadow ring where the arm leaves the hole
  b.rod(pt(0.281), pt(0.287), 0.0335, "#d9a67f", { bone: J.shoulderR, sides: 8, smooth: false });

  // ---------- Foil tube sleeve ----------
  b.rod(pt(0.3), pt(0.352), [0.05, 0.046], P.foil, { bone: J.elbowR, sides: 8, smooth: false });
  // darker crinkle bands
  for (const [d, rad] of [
    [0.31, 0.0515],
    [0.322, 0.0505],
    [0.3325, 0.0495],
  ] as [number, number][]) {
    b.rod(pt(d), pt(d + 0.0055), rad, P.foilDark, { bone: J.elbowR, sides: 8, smooth: false });
  }
  // crinkle facets: tilted little foil shards around the sleeve
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * 360 + r() * 14;
    const d = 0.305 + r() * 0.04;
    const rad = 0.0505 - (d - 0.3) * 0.08 + 0.0012;
    const rr = (a * Math.PI) / 180;
    const dark = i % 2 === 0;
    b.part(
      new THREE.BoxGeometry(0.011 + r() * 0.006, 0.0035, 0.009 + r() * 0.006),
      dark ? P.foilDark : FOIL_LIGHT,
      {
        bone: J.elbowR,
        at: [X(d), Y0 + Math.cos(rr) * rad, Math.sin(rr) * rad],
        rotation: [a, (r() - 0.5) * 40, (r() - 0.5) * 30],
      },
    );
  }
  // marker scribble on the sleeve (front face)
  for (let i = 0; i < 3; i++) {
    b.part(new THREE.BoxGeometry(0.012, 0.0022, 0.0018), P.marker, {
      bone: J.elbowR,
      at: [X(0.312 + i * 0.011), Y0 + 0.001, 0.0505],
      rotation: [0, 0, i % 2 ? 25 : -25],
    });
  }

  // ---------- Red tape cuff ----------
  b.rod(pt(0.335), pt(0.352), 0.0525, P.tapeRed, { bone: J.elbowR, sides: 8, smooth: false });
  b.rod(pt(0.335), pt(0.3375), 0.0535, TAPE_EDGE, { bone: J.elbowR, sides: 8, smooth: false });
  b.rod(pt(0.3495), pt(0.352), 0.0535, TAPE_EDGE, { bone: J.elbowR, sides: 8, smooth: false });
  // loose tape tail
  b.part(new THREE.BoxGeometry(0.014, 0.0025, 0.016), P.tapeRed, {
    bone: J.elbowR,
    at: [X(0.343), Y0 + 0.0535, 0.012],
    rotation: [-8, 10, 12],
  });

  // little cardboard claw-style cuff flap
  const flap = b.part(new THREE.BoxGeometry(0.02, 0.003, 0.03), P.cardboard, {
    bone: J.elbowR,
    at: [X(0.351), Y0 + 0.052, -0.006],
    rotation: [-14, 0, 0],
  });
  b.part(new THREE.BoxGeometry(0.02, 0.0012, 0.004), P.corrugation, {
    bone: J.elbowR,
    at: [X(0.351), Y0 + 0.0535, 0.0085],
    rotation: [-14, 0, 0],
  });
  void flap;

  // ---------- Glove ----------
  b.rod(pt(0.35), pt(0.366), 0.036, P.glove, { bone: J.wristR, sides: 8, smooth: false });
  // palm
  b.part(new THREE.BoxGeometry(0.026, 0.028, 0.066), P.glove, { bone: J.wristR, at: pt(0.374) });
  // back-of-hand seams
  for (const z of [-0.02, -0.0, 0.02]) {
    b.part(new THREE.BoxGeometry(0.022, 0.0016, 0.0016), GLOVE_DARK, {
      bone: J.wristR,
      at: pt(0.375, Y0 + 0.0145, z + 0.007),
    });
  }
  // palm patch / stitched knuckle row
  b.part(new THREE.BoxGeometry(0.004, 0.0016, 0.05), GLOVE_DARK, { bone: J.wristR, at: pt(0.384, Y0 + 0.0135, 0) });
  // cuff stitch
  b.part(new THREE.BoxGeometry(0.002, 0.07, 0.07), GLOVE_DARK, { bone: J.wristR, at: pt(0.3615) });

  // ---------- Fingers (4 spread) + thumb ----------
  const makeDigit = (
    id: string,
    base: [number, number, number],
    dir: [number, number, number],
    segLen: number,
    rad: number,
  ) => {
    const v = new THREE.Vector3(...dir).normalize();
    const p0 = new THREE.Vector3(...base);
    const p1 = p0.clone().addScaledVector(v, segLen);
    const p2 = p1.clone().addScaledVector(v, segLen);
    const chain = b.chain(
      `armsRight${id}`,
      [p0.toArray(), p1.toArray(), p2.toArray()] as number[][],
      {
        parent: J.wristR,
        role: "digit",
        names: [`armsRight${id}1`, `armsRight${id}2`, `armsRight${id}Tip`],
      },
    );
    b.sweep(chain, [rad, rad * 0.85], { color: P.glove, sides: 6 });
    // knuckle bulge and fold line
    b.part(new THREE.SphereGeometry(rad * 1.12, 6, 4), P.glove, { bone: chain.joints[0], at: p1.toArray() });
    b.part(new THREE.BoxGeometry(0.0016, rad * 0.5, rad * 1.7), GLOVE_DARK, {
      bone: chain.joints[0],
      at: [p1.x, p1.y + rad * 1.02, p1.z],
    });
  };

  const names = ["Pinky", "Ring", "Middle", "Index"];
  const lens = [0.019, 0.022, 0.024, 0.022];
  for (let i = 0; i < 4; i++) {
    const k = i - 1.5; // -1.5..1.5, front fingers have +z
    const sgn = -1;
    makeDigit(
      `Finger${names[3 - i]}`,
      pt(0.386, Y0, -k * 0.0165 * sgn * -1),
      [-1, 0, -k * 0.22 * sgn * -1],
      lens[i],
      0.0085,
    );
  }
  // thumb forward-and-out
  makeDigit("Thumb", pt(0.368, Y0 - 0.002, 0.03), [-0.75, 0, 0.66], 0.02, 0.0095);

  // small yellow glove-tip highlights are skipped: glove reads best flat.
  // Marker dot on the glove palm back (a hand-drawn smiley eye pair)
  for (const z of [-0.012, 0.004]) {
    b.part(new THREE.CylinderGeometry(0.0022, 0.0022, 0.0012, 6), P.marker, {
      bone: J.wristR,
      at: pt(0.37, Y0 + 0.0148, z),
    });
  }
}
    return buildArmsRight;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "cardboardRobotKid" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.5,0], dir: [0,1,0], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["hips"], at: [0,0.7,0], dir: [0,1,0], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["chest"], at: [0,1,0], dir: [0,1,0], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,1,0], dir: [0,1,0], role: "head" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["chest"], at: [0.26,0.88,0], dir: [1,0,0], role: "arm" });
  J["elbowL"] = b.joint("elbowL", { parent: J["shoulderL"], at: [0.45,0.88,0], dir: [1,0,0], role: "arm" });
  J["wristL"] = b.joint("wristL", { parent: J["elbowL"], at: [0.62,0.88,0], dir: [1,0,0], role: "arm" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["chest"], at: [-0.26,0.88,0], dir: [-1,0,0], role: "arm" });
  J["elbowR"] = b.joint("elbowR", { parent: J["shoulderR"], at: [-0.45,0.88,0], dir: [-1,0,0], role: "arm" });
  J["wristR"] = b.joint("wristR", { parent: J["elbowR"], at: [-0.62,0.88,0], dir: [-1,0,0], role: "arm" });
  J["hipL"] = b.joint("hipL", { parent: J["hips"], at: [0.1,0.5,0], dir: [0,-1,0], role: "leg" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.11,0.28,0], dir: [0,-1,0], role: "leg" });
  J["ankleL"] = b.joint("ankleL", { parent: J["kneeL"], at: [0.12,0.07,0], dir: [0,0,1], role: "leg" });
  J["hipR"] = b.joint("hipR", { parent: J["hips"], at: [-0.1,0.5,0], dir: [0,-1,0], role: "leg" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.11,0.28,0], dir: [0,-1,0], role: "leg" });
  J["ankleR"] = b.joint("ankleR", { parent: J["kneeR"], at: [-0.12,0.07,0], dir: [0,0,1], role: "leg" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
