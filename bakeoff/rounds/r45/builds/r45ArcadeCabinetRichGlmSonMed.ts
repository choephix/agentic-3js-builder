import * as THREE from "three";
import { createBuilder, type Builder, type Joint, polyline, frame, rng } from "../../../../src/index";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Neon Horizon — 1980s Arcade Cabinet",
  "description": "A 1980s upright arcade cabinet rendered in synthwave: a black-and-purple shell with chrome trim, a glowing sunset marquee, a CRT alive with a neon grid and striped sun, and a deck of glowing buttons and a magenta ball-top joystick."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  cabinetBlack: "#151021",
  cabinetPurple: "#2c1b45",
  deckDark: "#1d1528",
  chrome: "#c9d4e6",
  steel: "#5a6172",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff3fa4",
  neonViolet: "#8a4dff",
  sunsetGold: "#ffd23c",
  sunsetOrange: "#ff7a3c",
  sunsetPink: "#ff5e8a",
  glowWhite: "#fff6e0",
  screenDeep: "#0a0616",
  buttonRed: "#ff4757",
  buttonWhite: "#f2f2f2",
  coinGold: "#f5c542",
  cordBlack: "#0d0a12",
};
const M = {
  waistSeam: [0, 0.9, -0.05] as [number, number, number],
  screenWell: [0, 1.22, 0.14] as [number, number, number],
  deckRoot: [0, 0.95, 0.2] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // shell
  (() => {
function buildShell({ b, P }: Ctx) {
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const CHROME = P.chrome;
  const FR = -10.2; // recess lean-back, degrees
  const MQ = 9.46; // marquee forward tilt, degrees
  // point on the recess front plane: t along the slope, x across, off out along the normal
  const front = (t: number, x: number, off: number): [number, number, number] => [
    x,
    1.0 + 0.5 * t + 0.177 * off,
    0.33 - 0.09 * t + 0.984 * off,
  ];
  // point on the marquee face at height y
  const mq = (y: number, x: number, off: number): [number, number, number] => [
    x,
    y - 0.164 * off,
    0.3 + (0.05 * (y - 1.5)) / 0.3 + 0.986 * off,
  ];

  // ---- side panels ----
  const profile: [number, number][] = [
    [0.3, 0.9],
    [0.33, 1.0],
    [0.24, 1.5],
    [0.3, 1.5],
    [0.35, 1.8],
    [-0.25, 1.8],
    [-0.45, 1.6],
    [-0.45, 0.9],
  ];
  const edge3 = (x: number, pts: [number, number][]) => pts.map(([z, y]) => [x, y, z] as [number, number, number]);
  const inset: [number, number][] = profile.map(([z, y]) => [-0.05 + (z + 0.05) * 0.93, 1.35 + (y - 1.35) * 0.93]);

  for (const s of [1, -1]) {
    b.extrude(profile, { at: [s * 0.35, 0, 0], x: [0, 0, 1], thickness: 0.02, color: P.cabinetBlack });
    b.extrude(profile, { at: [s * 0.33, 0, 0], x: [0, 0, 1], thickness: 0.02, color: P.cabinetPurple });
    // chrome T-molding around the silhouette
    b.sweep(polyline(edge3(s * 0.35, profile), { closed: true }), 0.01, { color: CHROME, sides: 6 });
    // cyan neon tube tracing the silhouette
    glow(
      b.sweep(polyline(edge3(s * 0.362, inset), { closed: true }), 0.004, { color: P.neonCyan, sides: 6 }),
      1.4,
    );
    // synthwave side stripes
    glow(
      b.part(box(0.003, 0.014, 0.5), P.neonMagenta, { at: [s * 0.3625, 1.27, -0.12], rotation: [-18, 0, 0] }),
      1.2,
    );
    glow(
      b.part(box(0.003, 0.01, 0.46), P.neonViolet, { at: [s * 0.3625, 1.235, -0.12], rotation: [-18, 0, 0] }),
      1.2,
    );
    glow(
      b.part(box(0.003, 0.006, 0.42), P.neonCyan, { at: [s * 0.3625, 1.208, -0.12], rotation: [-18, 0, 0] }),
      1.2,
    );
  }

  // ---- magenta waist seam (shared with the base) ----
  glow(
    b.sweep(
      polyline(
        [
          [0.368, 0.9, 0.3],
          [0.368, 0.9, -0.455],
          [-0.368, 0.9, -0.455],
          [-0.368, 0.9, 0.3],
        ],
        { closed: true },
      ),
      0.004,
      { color: P.neonMagenta, sides: 6 },
    ),
    1.5,
  );
  glow(b.rod([0.368, 0.9, 0.3], [-0.368, 0.9, 0.3], 0.004, { color: P.neonMagenta, sides: 6 }), 1.5);

  // ---- top, slope, back ----
  b.part(box(0.7, 0.02, 0.6), P.cordBlack, { at: [0, 1.79, 0.05] });
  b.part(box(0.7, 0.012, 0.283), P.cordBlack, { at: [0, 1.7, -0.35], rotation: [-45, 0, 0] });
  b.part(box(0.7, 0.72, 0.02), P.cordBlack, { at: [0, 1.25, -0.44] });
  b.part(box(0.7, 0.012, 0.2), P.cabinetPurple, { at: [0, 1.806, 0.05] });
  // back vent grille
  b.part(box(0.32, 0.18, 0.004), P.steel, { at: [0, 1.15, -0.4515] });
  const ventSlits = [];
  for (let i = 0; i < 8; i++) ventSlits.push(box(0.28, 0.008, 0.003).translate(0, 1.15 - 0.07 + i * 0.02, 0));
  b.part(mergeGeometries(ventSlits)!, P.cordBlack, { at: [0, 0, -0.4545], bone: undefined });
  for (const s of [1, -1]) for (const dy of [1, -1]) b.part(new THREE.SphereGeometry(0.006, 6, 4), CHROME, { at: [s * 0.15, 1.15 + dy * 0.08, -0.455] });

  // ---- lower front panel / deck ledge ----
  b.part(box(0.68, 0.1, 0.02), P.cabinetPurple, { at: [0, 0.95, 0.315], rotation: [-16, 0, 0] });
  b.part(box(0.68, 0.012, 0.03), CHROME, { at: [0, 1.004, 0.325] });
  glow(b.part(box(0.6, 0.004, 0.004), P.neonViolet, { at: [0, 0.99, 0.342] }), 1.2);

  // ---- screen recess ----
  b.part(box(0.62, 0.5, 0.02), P.screenDeep, { at: front(0.5, 0, -0.04), rotation: [FR, 0, 0] });
  for (const s of [1, -1]) {
    b.part(box(0.026, 0.508, 0.03), P.cabinetBlack, { at: front(0.5, s * 0.333, 0), rotation: [FR, 0, 0] });
    b.part(box(0.006, 0.5, 0.034), CHROME, { at: front(0.5, s * 0.318, 0), rotation: [FR, 0, 0] });
  }
  b.part(box(0.68, 0.04, 0.03), P.cabinetBlack, { at: front(0.04, 0, 0), rotation: [FR, 0, 0] });
  b.part(box(0.64, 0.006, 0.034), CHROME, { at: front(0.075, 0, 0), rotation: [FR, 0, 0] });
  b.part(box(0.68, 0.05, 0.03), P.cabinetBlack, { at: front(0.96, 0, 0), rotation: [FR, 0, 0] });
  b.part(box(0.64, 0.006, 0.034), CHROME, { at: front(0.92, 0, 0), rotation: [FR, 0, 0] });
  glow(b.part(box(0.6, 0.004, 0.004), P.neonViolet, { at: front(0.99, 0, 0.018), rotation: [FR, 0, 0] }), 1.2);

  // ---- marquee frame ----
  b.part(box(0.7, 0.304, 0.02), P.cabinetPurple, { at: mq(1.65, 0, -0.012), rotation: [MQ, 0, 0] });
  b.part(box(0.7, 0.014, 0.016), CHROME, { at: mq(1.793, 0, 0), rotation: [MQ, 0, 0] });
  b.part(box(0.7, 0.014, 0.016), CHROME, { at: mq(1.507, 0, 0), rotation: [MQ, 0, 0] });
  for (const s of [1, -1]) {
    b.part(box(0.016, 0.3, 0.016), CHROME, { at: mq(1.65, s * 0.344, 0), rotation: [MQ, 0, 0] });
    for (const y of [1.51, 1.79]) b.part(new THREE.SphereGeometry(0.008, 6, 4), P.steel, { at: mq(y, s * 0.325, 0.01) });
  }

  // sign: dark glass, chrome border, cyan edge glow
  b.part(box(0.6, 0.18, 0.008), P.screenDeep, { at: mq(1.7, 0, 0.002), rotation: [MQ, 0, 0] });
  for (const dy of [1, -1])
    b.part(box(0.62, 0.008, 0.012), CHROME, { at: mq(1.7 + dy * 0.094, 0, 0.004), rotation: [MQ, 0, 0] });
  for (const s of [1, -1]) b.part(box(0.008, 0.196, 0.012), CHROME, { at: mq(1.7, s * 0.304, 0.004), rotation: [MQ, 0, 0] });
  glow(b.part(box(0.59, 0.003, 0.004), P.neonViolet, { at: mq(1.7 + 0.086, 0, 0.007), rotation: [MQ, 0, 0] }), 1.2);

  // sunset stripe bands
  const bands = [P.sunsetGold, P.sunsetOrange, P.sunsetPink];
  bands.forEach((c, i) => {
    glow(b.part(box(0.58, 0.0145, 0.004), c, { at: mq(1.6235 + i * 0.0185, 0, 0.007), rotation: [MQ, 0, 0] }), 0.9);
  });
  glow(b.part(box(0.58, 0.003, 0.004), P.neonMagenta, { at: mq(1.6815, 0, 0.007), rotation: [MQ, 0, 0] }), 1);

  // neon letters from pixel strokes
  const FONT: Record<string, string[]> = {
    N: ["X..X", "XX.X", "X.XX", "X..X", "X..X"],
    E: ["XXX", "X..", "XX.", "X..", "XXX"],
    O: ["XXX", "X.X", "X.X", "X.X", "XXX"],
    R: ["XX.", "X.X", "XX.", "X.X", "X.X"],
    I: ["XXX", ".X.", ".X.", ".X.", "XXX"],
    D: ["XX.", "X.X", "X.X", "X.X", "XX."],
  };
  const px = 0.0135;
  const word = (text: string, x0: number) => {
    const geos: THREE.BufferGeometry[] = [];
    let cx = x0;
    for (const ch of text) {
      const rows = FONT[ch];
      rows.forEach((row, r) => {
        for (let c = 0; c < row.length; c++)
          if (row[c] === "X") geos.push(box(px * 0.92, px * 0.92, 0.008).translate((cx + c + 0.5) * px, (2 - r) * px, 0));
      });
      cx += rows[0].length + 1;
    }
    return mergeGeometries(geos)!;
  };
  // NEON = 17 units, gap 3, RIDER = 19 units
  const total = 39;
  glow(b.part(word("NEON", -total / 2), P.neonCyan, { at: mq(1.725, 0, 0.012), rotation: [MQ, 0, 0] }), 1.6);
  glow(b.part(word("RIDER", -total / 2 + 20), P.neonMagenta, { at: mq(1.725, 0, 0.012), rotation: [MQ, 0, 0] }), 1.6);
  // underline bar
  glow(b.part(box(0.46, 0.004, 0.004), P.neonViolet, { at: mq(1.682, 0, 0.009), rotation: [MQ, 0, 0] }), 1.2);

  // ---- speaker panels ----
  for (const s of [1, -1]) {
    b.part(box(0.25, 0.082, 0.012), CHROME, { at: mq(1.553, s * 0.19, -0.002), rotation: [MQ, 0, 0] });
    b.part(box(0.238, 0.07, 0.014), P.cabinetBlack, { at: mq(1.553, s * 0.19, 0.0), rotation: [MQ, 0, 0] });
    const slits: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) slits.push(box(0.21, 0.005, 0.004).translate(0, -0.025 + i * 0.01, 0));
    glow(b.part(mergeGeometries(slits)!, P.glowWhite, { at: mq(1.553, s * 0.19, 0.009), rotation: [MQ, 0, 0] }), 1.1);
  }
  // centre divider glow between speakers
  glow(b.part(box(0.02, 0.07, 0.01), P.neonViolet, { at: mq(1.553, 0, 0.004), rotation: [MQ, 0, 0] }), 1.0);
}
    return buildShell;
  })(),
  // screen
  (() => {
function buildScreen({ b, J, P, M }: any) {
  const TILT = 12 * Math.PI / 180;
  const c = new THREE.Vector3(M.screenWell[0], M.screenWell[1], M.screenWell[2]);
  // Screen plane local frame: x right-left, y up along glass, z out of glass.
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-(Math.PI / 2 - TILT) , 0, 0));
  // plane faces +Z in local; rotate so normal points up-forward: normal = (0, sin(90-12)... )
  // Using rotation about X by -(90deg - TILT) maps +Z to (0, cos(TILT)... ) -> up-forward leaning.
  const n = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
  const U = new THREE.Vector3(0, 1, 0).applyQuaternion(q); // up along glass (toward back)
  const place = (u: number, v: number, d: number) =>
    c.clone().addScaledVector(new THREE.Vector3(1, 0, 0), u).addScaledVector(U, v).addScaledVector(n, d);
  const W = 0.5, H = 0.4;
  const flat = (w: number, h: number, t: number, col: string, u: number, v: number, d: number, g = 0) => {
    const p = b.part(new THREE.BoxGeometry(w, h, t), col, { at: place(u, v, d), quat: q });
    if (g) glow(p, g);
    return p;
  };
  // bezel
  flat(0.62, 0.5, 0.02, P.cabinetBlack, 0, 0, -0.012);
  flat(0.58, 0.46, 0.012, P.chrome, 0, 0, 0.0);
  flat(W + 0.02, H + 0.02, 0.012, P.cabinetBlack, 0, 0, 0.004);
  flat(W + 0.012, H + 0.012, 0.01, P.neonViolet, 0, 0, 0.008, 1.2);
  flat(W, H, 0.014, P.screenDeep, 0, 0, 0.012);
  const z0 = 0.021;
  // corner screws
  for (const sx of [1, -1]) for (const sy of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 8), P.steel, { at: place(sx * 0.285, sy * 0.225, 0.005), quat: q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0))) });
  }
  // stars
  const r = rng(5);
  for (let i = 0; i < 14; i++) {
    const p = b.part(new THREE.BoxGeometry(0.006, 0.006, 0.002), P.glowWhite, { at: place((r() - 0.5) * 0.46, 0.08 + r() * 0.11, z0 + 0.001), quat: q });
    glow(p, 1.5);
  }
  // sun bands (half disc above horizon at v=0.0 .. 0.17)
  const cols = [P.sunsetGold, P.sunsetGold, P.sunsetOrange, P.sunsetOrange, P.sunsetPink, P.sunsetPink];
  const R = 0.15;
  for (let i = 0; i < 6; i++) {
    const v0 = 0.01 + i * 0.026;
    const vm = v0 + 0.0105;
    const w = 2 * Math.sqrt(Math.max(R * R - vm * vm * 0.0 - Math.pow(vm / 0.17 * R, 2) * 0 - vm * vm, 0.0004)) ;
    flat(Math.min(w * 1.0, 0.3), 0.021, 0.002, cols[5 - i], 0, vm, z0, 1);
  }
  // horizon
  flat(W - 0.01, 0.007, 0.003, P.neonMagenta, 0, 0.0, z0 + 0.001, 1.6);
  // grid rails
  for (let i = -5; i <= 5; i++) {
    const topU = i * 0.02, botU = i * 0.09;
    const len = Math.hypot(botU - topU, 0.19);
    const mid = place((topU + botU) / 2, -0.095, z0);
    const ang = Math.atan2(botU - topU, 0.19);
    const rq = q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, ang)));
    glow(b.part(new THREE.BoxGeometry(0.003, len, 0.002), P.neonCyan, { at: mid, quat: rq }), 1.2);
  }
  // rungs
  [-0.02, -0.045, -0.08, -0.125, -0.185].forEach((v) => {
    const w = Math.min(W - 0.01, 0.1 + (-v) * 2.2);
    glow(b.part(new THREE.BoxGeometry(w, 0.004, 0.002), P.neonCyan, { at: place(0, v, z0), quat: q }), 1.2);
  });
  // ledge items
  flat(0.12, 0.028, 0.008, P.chrome, -0.1, -0.265, 0.003);
  glow(b.part(new THREE.SphereGeometry(0.008, 8, 6), P.neonCyan, { at: place(0.2, -0.265, 0.01) }), 2);
  // cable stub
  const cb = place(0.2, 0.2, -0.03);
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 6), P.cordBlack, { at: cb.clone().add(new THREE.Vector3(0, -0.06, -0.01)) });
}
    return buildScreen;
  })(),
  // deck
  (() => {
function buildDeck({ b, J, P, M }: any) {
  const r = rng(11);
  const TILT = 8 * Math.PI / 180;
  // deck local frame: origin at panel centre, panel plane tilted so front is higher
  const cy = 0.945, cz = 0.235;
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-TILT, 0, 0));
  const W = 0.68, D = 0.37, T = 0.03;
  // panel-space (x right-left, y up from surface, z forward) -> model
  const P3 = (x: number, y: number, z: number): [number, number, number] => {
    const v = new THREE.Vector3(x, y, z).applyQuaternion(q);
    return [v.x, cy + v.y, cz + v.z];
  };
  const put = (geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number, o: any = {}) =>
    b.part(geo, color, { at: P3(x, y, z), quat: q, flat: true, ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s);
  const g = (p: any, s = 1) => glow(p, s);

  // main slab
  put(box(W, T, D), P.deckDark, 0, 0, 0);
  // underside
  put(box(W - 0.04, 0.02, D - 0.04), P.cordBlack, 0, -T / 2 - 0.008, -0.01);
  // front skirt
  put(box(W, 0.07, 0.02), P.deckDark, 0, -0.05, D / 2 - 0.01);
  // chrome edge trim
  put(box(W + 0.01, 0.012, 0.012), P.chrome, 0, T / 2, D / 2);
  put(box(W + 0.01, 0.012, 0.012), P.chrome, 0, T / 2, -D / 2);
  for (const s of [1, -1]) put(box(0.012, 0.012, D), P.chrome, s * W / 2, T / 2, 0);
  // forward neon lip
  g(put(box(W - 0.02, 0.008, 0.008), P.neonCyan, 0, T / 2 + 0.004, D / 2 - 0.016), 1.4);
  g(put(box(W - 0.02, 0.006, 0.006), P.neonCyan, 0, -0.07, D / 2 + 0.002), 1.2);

  const top = T / 2;
  // joystick (left of model = +X)
  const jx = 0.2, jz = 0.04;
  put(cyl(0.04, 0.045, 0.008, 16), P.steel, jx, top + 0.004, jz);
  put(cyl(0.028, 0.03, 0.006, 16), P.cabinetBlack, jx, top + 0.011, jz);
  const lean = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0.12)); // lean toward model right
  const shaftLen = 0.09;
  const base = new THREE.Vector3(jx, top + 0.01, jz);
  const dir = new THREE.Vector3(0, 1, 0).applyQuaternion(lean);
  const sc = base.clone().addScaledVector(dir, shaftLen / 2);
  const bc = base.clone().addScaledVector(dir, shaftLen + 0.025);
  put(cyl(0.006, 0.007, shaftLen, 8), P.chrome, sc.x, sc.y, sc.z, { quat: q.clone().multiply(lean) });
  g(put(new THREE.SphereGeometry(0.03, 14, 10), P.neonMagenta, bc.x, bc.y, bc.z), 0.8);
  put(new THREE.SphereGeometry(0.008, 6, 4), P.glowWhite, bc.x + 0.01, bc.y + 0.014, bc.z + 0.01);

  // button clusters (right station, -X) and mirrored inner cluster
  const caps = [P.buttonWhite, P.buttonRed, P.sunsetGold];
  const button = (x: number, z: number, c: string) => {
    put(cyl(0.021, 0.023, 0.006, 14), P.cabinetBlack, x, top + 0.003, z);
    put(new THREE.TorusGeometry(0.021, 0.0025, 5, 14), P.chrome, x, top + 0.007, z, { rotation: [90, 0, 0] });
    put(cyl(0.016, 0.018, 0.012, 14), c, x, top + 0.011, z);
    put(cyl(0.012, 0.012, 0.002, 10), P.glowWhite, x, top + 0.0175, z);
  };
  let k = 0;
  for (let row = 0; row < 2; row++)
    for (let col = 0; col < 3; col++) {
      const x = -0.15 - col * 0.055 - (row ? 0.0 : 0.012);
      const z = 0.07 - row * 0.065 + (col === 1 ? 0.01 : 0);
      button(x, z, caps[(k++) % 3]);
    }
  // mirrored second cluster on inner side of left station
  for (let row = 0; row < 2; row++)
    for (let col = 0; col < 3; col++) {
      const x = 0.095 + col * 0.0 - 0.0 - (col * 0) ;
      void x;
    }
  // left player's extra buttons beside joystick
  for (let col = 0; col < 3; col++) {
    button(0.27 + col * 0.0, 0.1 - col * 0.06, caps[col]);
  }

  // start panel
  put(box(0.1, 0.006, 0.08), P.cabinetBlack, 0, top + 0.001, 0.03);
  put(box(0.108, 0.004, 0.088), P.chrome, 0, top - 0.0005, 0.03);
  g(put(cyl(0.013, 0.014, 0.01, 12), P.neonCyan, -0.026, top + 0.007, 0.045), 1.2);
  g(put(cyl(0.013, 0.014, 0.01, 12), P.neonMagenta, 0.026, top + 0.007, 0.045), 1.2);
  g(put(box(0.07, 0.002, 0.012), P.glowWhite, 0, top + 0.005, 0.01), 1);
  // credit letters-ish ticks
  for (let i = 0; i < 8; i++) put(box(0.004, 0.001, 0.007), P.cordBlack, -0.03 + i * 0.0085, top + 0.0062, 0.01);
  g(put(box(0.05, 0.002, 0.005), P.neonViolet, 0, top + 0.005, -0.012), 1.3);

  // bolts on trim
  for (let i = 0; i < 6; i++) {
    const x = -0.3 + i * 0.12;
    put(new THREE.SphereGeometry(0.004, 6, 4), P.steel, x, top + 0.008, D / 2 - 0.03);
  }
  void r; void frame; void M; void J;

  // support bracket: angled back toward cabinet body
  const a = new THREE.Vector3(...P3(0, -0.04, 0.05));
  const c = new THREE.Vector3(a.x, 0.84, 0.1);
  for (const s of [-1, 1]) {
    const p0 = new THREE.Vector3(s * 0.26, a.y - 0.01, a.z + 0.1);
    const p1 = new THREE.Vector3(s * 0.26, 0.865 - 0.0, 0.08);
    b.rod(p0, p1, 0.007, P.steel);
    void c;
  }
  b.rod(new THREE.Vector3(-0.26, 0.875, 0.1), new THREE.Vector3(0.26, 0.875, 0.1), 0.006, P.steel);
}
    return buildDeck;
  })(),
  // base
  (() => {
function buildBase({ b, J, P, M }: Ctx) {
  const BLACK = P.cabinetBlack, PURPLE = P.cabinetPurple, CHROME = P.chrome, STEEL = P.steel;
  const CYAN = P.neonCyan, MAG = P.neonMagenta, VIO = P.neonViolet, CORD = P.cordBlack, GOLD = P.coinGold;

  // helpers
  const box = (w: number, h: number, d: number, color: string, at: [number, number, number], g = 0, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...extra });
  const lit = (w: number, h: number, d: number, color: string, at: [number, number, number], s = 1.2) =>
    glow(box(w, h, d, color, at), s);

  // Side profile (z, y): front slants back going down, back is straight. Drawn as x = z, y = y.
  // front top at z 0.35 (y 0.9), slant to z 0.22 at y 0.18, kick zone to z 0.2 at y 0.
  const FT = 0.35, FB = 0.22, BK = -0.45;
  const profile: [number, number][] = [
    [BK, 0.04], [BK + 0.03, 0.0], [FB - 0.02, 0.0], [FB, 0.18], [FT, 0.9], [BK, 0.9],
  ];
  const frontZ = (y: number) => FB + ((y - 0.18) / (0.9 - 0.18)) * (FT - FB);

  for (const s of [1, -1]) {
    // outer black panel
    b.extrude(profile, { at: [s * 0.345, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.03, color: BLACK });
    // purple inner face
    b.extrude(profile.map(([x, y]) => [x * 0.97 + (x > 0 ? 0 : 0.01), y] as [number, number]), {
      at: [s * 0.322, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.016, color: PURPLE,
    });
    // chrome T-molding strips on front slant, back edge, top edge
    const xs = s * 0.362;
    b.rod([xs, 0.18, FB + 0.003], [xs, 0.9, FT + 0.003], 0.011, CHROME);
    b.rod([xs, 0.02, BK - 0.003], [xs, 0.9, BK - 0.003], 0.011, CHROME);
    b.rod([xs, 0.9, BK], [xs, 0.9, FT], 0.009, CHROME);
    // cyan neon tube tracing the edge just inside the molding
    const xn = s * 0.368;
    glow(b.rod([xn, 0.2, FB + 0.012], [xn, 0.89, FT + 0.012], 0.005, CYAN), 1.6);
    glow(b.rod([xn, 0.05, BK + 0.012], [xn, 0.89, BK + 0.012], 0.005, CYAN), 1.6);
    // underglow strip on foot line
    glow(b.rod([xn, 0.025, BK + 0.03], [xn, 0.025, FB - 0.02], 0.006, CYAN), 1.8);
    // levelling feet
    for (const z of [BK + 0.06, FB - 0.06]) {
      b.part(new THREE.CylinderGeometry(0.025, 0.03, 0.024, 8), CORD, { at: [s * 0.3, 0.012, z] });
    }
    // magenta seam end cap
    glow(b.rod([s * 0.364, 0.896, BK], [s * 0.364, 0.896, FT], 0.006, MAG), 1.6);
  }

  // magenta seam across front and back
  glow(box(0.72, 0.012, 0.012, MAG, [0, 0.894, FT + 0.002]), 1.6);
  glow(box(0.72, 0.012, 0.012, MAG, [0, 0.894, BK - 0.002]), 1.6);

  // front panel (slanted)
  const fa = Math.atan2(FT - FB, 0.9 - 0.18); // lean angle of the front
  const fl = Math.hypot(FT - FB, 0.72);
  b.part(new THREE.BoxGeometry(0.63, fl, 0.02), BLACK, {
    at: [0, 0.54, (FT + FB) / 2 - 0.01], rotation: [-(fa * 180) / Math.PI, 0, 0],
  });
  // top ledge under the deck
  box(0.63, 0.016, 0.8, DECK(), [0, 0.892, -0.05]);
  function DECK() { return P.deckDark; }

  // back panel
  box(0.66, 0.84, 0.02, CORD, [0, 0.46, BK + 0.01]);
  box(0.66, 0.05, 0.03, BLACK, [0, 0.04, BK + 0.015]);
  // back vent grille
  box(0.3, 0.2, 0.012, STEEL, [0, 0.62, BK - 0.003]);
  for (let i = 0; i < 9; i++) box(0.28, 0.008, 0.016, CORD, [0, 0.54 + i * 0.022, BK - 0.008]);
  box(0.3, 0.012, 0.012, CHROME, [0, 0.725, BK - 0.006]);
  box(0.3, 0.012, 0.012, CHROME, [0, 0.515, BK - 0.006]);
  lit(0.22, 0.014, 0.01, VIO, [0, 0.4, BK - 0.006], 1.5);
  // floor underglow at back and front
  glow(box(0.66, 0.01, 0.01, CYAN, [0, 0.025, BK - 0.003]), 1.8);
  glow(box(0.6, 0.01, 0.01, CYAN, [0, 0.025, FB + 0.012]), 1.8);

  // normal-offset placement on the slanted front
  const onFront = (y: number, off: number): [number, number, number] => {
    const z = frontZ(y);
    return [0, y, z + off * Math.cos(fa) ];
  };
  const tilt = -(fa * 180) / Math.PI;
  const fpart = (w: number, h: number, d: number, color: string, y: number, x: number, off: number, glowS = 0) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), color, {
      at: [x, y, frontZ(y) + off], rotation: [tilt, 0, 0],
    });
    if (glowS) glow(p, glowS);
    return p;
  };

  // coin door
  const dy = 0.52;
  fpart(0.3, 0.38, 0.014, CHROME, dy, 0, 0.012);
  fpart(0.27, 0.35, 0.012, "#0c0914", dy, 0, 0.02);
  for (const [i, y] of [dy + 0.09, dy - 0.07].entries()) {
    // slot with glowing rim
    fpart(0.05, 0.1, 0.012, CYAN, y, 0, 0.026, 1.6);
    fpart(0.036, 0.082, 0.014, CORD, y, 0, 0.032);
    fpart(0.006, 0.05, 0.016, "#000000", y, 0, 0.036);
    // coin return button
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 10), GOLD, {
      at: [-0.085 + i * 0.0 , y + 0.0, frontZ(y) + 0.034], rotation: [tilt + 90, 0, 0],
    });
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 10), GOLD, {
      at: [0.085, y, frontZ(y) + 0.034], rotation: [tilt + 90, 0, 0],
    });
  }
  // coin return tray
  fpart(0.12, 0.04, 0.014, STEEL, dy - 0.15, 0, 0.03);
  fpart(0.1, 0.026, 0.016, CORD, dy - 0.15, 0, 0.036);
  // INSERT COIN strip
  fpart(0.2, 0.026, 0.01, MAG, dy + 0.155, 0, 0.028, 1.8);
  for (let i = 0; i < 9; i++) fpart(0.012, 0.012, 0.012, "#fff6e0", dy + 0.155, -0.08 + i * 0.02, 0.034, 1.5);
  // door screws
  for (const sx of [-1, 1]) for (const sy of [-1, 1])
    fpart(0.012, 0.012, 0.01, STEEL, dy + sy * 0.17, sx * 0.13, 0.02);

  // kick plate recess + brushed chrome plate
  box(0.63, 0.14, 0.03, CORD, [0, 0.09, FB - 0.02]);
  box(0.6, 0.12, 0.012, CHROME, [0, 0.085, FB - 0.002]);
  for (let i = 0; i < 7; i++) box(0.045, 0.05, 0.014, PURPLE, [-0.27 + i * 0.09, 0.085, FB + 0.004]);
  box(0.6, 0.008, 0.016, STEEL, [0, 0.148, FB]);
  box(0.6, 0.008, 0.016, STEEL, [0, 0.025, FB]);

  // mid-panel chrome trim lines on the front sides
  for (const s of [1, -1]) {
    const y1 = 0.24, y2 = 0.85;
    b.rod([s * 0.318, y1, frontZ(y1) + 0.01], [s * 0.318, y2, frontZ(y2) + 0.01], 0.007, CHROME);
  }
  // purple accent panel beneath the deck
  fpart(0.6, 0.05, 0.01, PURPLE, 0.84, 0, 0.012);
  glow(fpart(0.5, 0.006, 0.008, VIO, 0.81, 0, 0.018), 1.3);
}
    return buildBase;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "arcadeCabinet" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
