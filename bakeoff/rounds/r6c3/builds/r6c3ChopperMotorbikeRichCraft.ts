import * as THREE from "three";
import { createBuilder, frame, catmull, paint, mix, noise, resolve, svg } from "../../../../src/index";
import type { ColorInput, Rgb, Joint } from "../../../../src/index";
import {
  metal,
  panelled,
  gearGeometry,
  gearTexture,
  gearSize,
  gaugeTexture,
  coil,
  TINT,
} from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Route-66 Hero Chopper",
  description:
    "A long-fork custom chopper in a hero-shooter style: navy tank with painted flames, ape-hanger bars, V-twin with finned jugs, glowing teal wheel rings, belt drive, sissy bar with pennant, parked on a hex garage pad with props.",
};

// ---------------------------------------------------------------------------------------------------------------
// Constants and small helpers

const G = 0.07; // top of the stage slab: the bike's wheels rest here
const D2R = Math.PI / 180;
const X_AXIS = new THREE.Vector3(1, 0, 0);

/** Bike-space point (the deck top is y = 0 for the bike). */
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y + G, z);
const mv = (v: THREE.Vector3, x: number, y: number, z: number) => v.clone().add(new THREE.Vector3(x, y, z));
const sc = (v: THREE.Vector3, d: THREE.Vector3, k: number) => v.clone().addScaledVector(d, k);
const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);
const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg, 1);
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const ball = (r: number) => new THREE.SphereGeometry(r, 8, 6);

// Palette
const INK = "#161f3a";
const NAVY = "#2e4a9c";
const ORANGE = "#f58a1f";
const ORANGE_D = "#c4570f";
const CREAM = "#ffe9bd";
const TEAL = "#42d9ff";
const RUBBER = "#17171d";
const TREAD = "#2a2b34";
const TREAD_D = "#101015";
const LEATHER = "#5a3320";
const LEATHER_L = "#8a5230";
const RED = "#ff3b30";
const SLATE = "#5d6d9a";

const WARM: Rgb = [1, 0.93, 0.78];
const COOL: Rgb = [0.12, 0.18, 0.42];

/** Hand-painted look: warm on top faces, cool and darker underneath. */
const toned = (base: ColorInput, up = 0.2, down = 0.32) =>
  paint((p, n) => {
    const c = resolve(base, p, n);
    return n.y > 0 ? mix(c, WARM, up * n.y) : mix(c, COOL, down * -n.y);
  });

const CHROME = toned("#e3ecf6", 0.12, 0.4);
const GUNM = toned("#7a8dc6", 0.3, 0.4);
const BLUED = metal("blued");
const ORANGE_P = toned(ORANGE);

// Fenders: navy with a centre pinstripe.
const BODY = toned(
  paint((p) => {
    const ax = Math.abs(p.x);
    if (ax < 0.01) return ORANGE;
    if (ax < 0.017) return CREAM;
    if (ax < 0.021) return INK;
    return NAVY;
  }),
);

// Tank: navy with shark-fin flames licking back from the nose.
const TANK = toned(
  paint((p) => {
    const zf = clamp((p.z + 0.1) / 0.5, 0, 1);
    const yc = 0.975 + 0.235 * p.z + G;
    const saw = (((p.z / 0.12) % 1) + 1) % 1;
    const yb = yc + 0.075 - (0.09 + 0.2 * zf) * (1 - saw);
    const d = p.y - yb;
    if (Math.abs(d) < 0.005) return INK;
    if (d < 0) return d < -0.09 ? "#fff0b8" : d < -0.045 ? "#ffc83d" : ORANGE;
    if (p.y > yc + 0.07 && Math.abs(p.x) < 0.012) return CREAM;
    return NAVY;
  }),
);

const SEAT = toned(
  paint((p) => {
    const stitch = Math.abs(Math.abs(p.x) - 0.075) < 0.0035 && (((p.z / 0.022) % 1) + 1) % 1 < 0.55;
    if (stitch) return ORANGE;
    return mix(LEATHER, LEATHER_L, noise(p, 0.12, 4));
  }),
);

const HAZARD = toned("#34436e", 0.25, 0.3);
const DECK = panelled("#8c9fcf", { size: 0.4, aspect: 1, rivets: 0.1 });

const CONE_P = paint((p, n) => {
  const k = ((((p.y - G) / 0.075) % 2) + 2) % 2;
  const c = k < 1 ? ORANGE : CREAM;
  return n.y > 0.3 ? c : mix(c, COOL, 0.25);
});

const tireProfile = (R: number, hw: number, rin: number): Array<[number, number]> => [
  [rin, -hw * 0.65],
  [R * 0.8, -hw * 0.95],
  [R * 0.96, -hw * 0.78],
  [R, -hw * 0.38],
  [R, hw * 0.38],
  [R * 0.96, hw * 0.78],
  [R * 0.8, hw * 0.95],
  [rin, hw * 0.65],
];

/** Tread blocks on the crown, an orange pinstripe on the sidewalls. */
const tirePaint = (c: THREE.Vector3, axis: THREE.Vector3, R: number, hw: number) => {
  const d = new THREE.Vector3();
  return paint((p, n, s) => {
    d.copy(p).sub(c);
    const along = d.dot(axis);
    const r = Math.sqrt(Math.max(d.lengthSq() - along * along, 0));
    const face = Math.abs(n.dot(axis));
    if (face < 0.6 && Math.abs(s[0]) < hw * 0.55) {
      const a = (((s[1] % 15) + 15) % 15);
      return a < 5.5 ? TREAD_D : TREAD;
    }
    if (face >= 0.6 && r > R * 0.7 && r < R * 0.79) return ORANGE;
    return RUBBER;
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const EMBLEM_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<polygon points="50,3 92,27 92,73 50,97 8,73 8,27" fill="#161f3a"/>
<polygon points="50,10 86,31 86,69 50,90 14,69 14,31" fill="#f58a1f"/>
<polygon points="50,18 79,35 79,65 50,82 21,65 21,35" fill="#27345c"/>
<path d="M57 24 L35 55 H48 L42 79 L66 45 H53 Z" fill="#ffe9bd" stroke="#161f3a" stroke-width="3" stroke-linejoin="round"/>
</svg>`;

const PLATE_SVG = `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
<rect x="2" y="2" width="116" height="56" rx="8" fill="#ffe9bd" stroke="#161f3a" stroke-width="4"/>
<rect x="8" y="8" width="104" height="44" rx="5" fill="none" stroke="#f58a1f" stroke-width="2"/>
<text x="60" y="40" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="#27345c" letter-spacing="2">RT-66</text>
<circle cx="14" cy="14" r="2.5" fill="#161f3a"/><circle cx="106" cy="14" r="2.5" fill="#161f3a"/>
</svg>`;

const FLAG_SVG = `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
<polygon points="0,100 60,100 60,42 30,0 0,42" fill="#f58a1f" stroke="#161f3a" stroke-width="4" stroke-linejoin="round"/>
<polygon points="30,48 48,58 48,78 30,88 12,78 12,58" fill="#27345c" stroke="#161f3a" stroke-width="3"/>
<path d="M33 54 L22 70 H29 L26 82 L38 66 H31 Z" fill="#ffe9bd"/>
</svg>`;

const CRATE_SVG = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
<rect width="64" height="64" fill="#b07a3c"/>
<g stroke="#8a5a28" stroke-width="1.5"><path d="M0 16H64M0 32H64M0 48H64"/></g>
<rect x="2" y="2" width="60" height="60" fill="none" stroke="#6a3f1a" stroke-width="5"/>
<path d="M6 6L58 58M58 6L6 58" stroke="#6a3f1a" stroke-width="5"/>
<rect x="17" y="24" width="30" height="16" rx="2" fill="#ffe9bd" stroke="#161f3a" stroke-width="2"/>
<text x="32" y="36" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="10" fill="#27345c">HOG</text>
</svg>`;

const TOOL_SVG = `<svg viewBox="0 0 80 30" xmlns="http://www.w3.org/2000/svg">
<rect x="1" y="1" width="78" height="28" rx="5" fill="#ffe9bd" stroke="#161f3a" stroke-width="2.5"/>
<text x="40" y="21" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="15" fill="#c4570f">FIX-IT</text>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "chopper" });

  // placement shortcut: geometry, colour, bone, position, extra options
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const P = (geo: THREE.BufferGeometry, color: ColorInput, bone: Joint, at: THREE.Vector3 | number[], o: any = {}) =>
    b.part(geo, color, { bone, at, flat: true, ...o });

  // ---- key points -------------------------------------------------------------------------------------------
  const RC = V(0, 0.37, -0.9); // rear axle
  const AF = V(0, 0.33, 1.1); // front axle
  const DF = new THREE.Vector3(0, -0.788, 0.616).normalize(); // fork axis, steering head to axle
  const PERP = new THREE.Vector3(0, 0.616, 0.788).normalize();
  const T = sc(AF, DF, -0.85); // lower triple tree
  const HT = sc(T, DF, -0.19); // top of head tube

  // ---- skeleton ---------------------------------------------------------------------------------------------
  const frameJ = b.joint("frame", { at: V(0, 0.55, 0) });
  const wheelR = b.joint("wheelR", { parent: frameJ, at: RC, dir: [1, 0, 0], role: "hinge" });
  const steer = b.joint("steer", { parent: frameJ, at: T, aim: AF, role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: steer, at: AF, dir: [1, 0, 0], role: "hinge" });
  const stand = b.joint("kickstand", { parent: frameJ, at: V(0.16, 0.34, -0.12), aim: V(0.4, 0, -0.12), role: "hinge" });
  const stage = b.joint("stage", { parent: frameJ, at: [0, 0, 0], dir: [0, 1, 0] });

  // ---- textures ---------------------------------------------------------------------------------------------
  const EMBLEM = svg(EMBLEM_SVG, { size: 192 });
  const PLATE = svg(PLATE_SVG, { size: 192 });
  const FLAG = svg(FLAG_SVG, { size: 160 });
  const CRATE = svg(CRATE_SVG, { size: 128 });
  const TOOL = svg(TOOL_SVG, { size: 128 });
  const GEAR = { teeth: 18, module: 0.006, spokes: 4, bore: 0.003 };
  const GEARTEX = gearTexture(GEAR);
  const DIAL = gaugeTexture({ needle: 45, label: "MPH" });

  // ---- wheels -----------------------------------------------------------------------------------------------
  function wheel(bone: Joint, c: THREE.Vector3, R: number, hw: number, rin: number, spokeEnd: number, hubW: number) {
    b.lathe(tireProfile(R, hw, rin), {
      at: c,
      axis: X_AXIS,
      segments: 24,
      bone,
      color: tirePaint(c, X_AXIS, R, hw),
    });
    const rimR = rin + 0.015;
    const rh = hw * 0.85;
    b.lathe(
      [
        [rimR - 0.045, -rh * 0.8],
        [rimR, -rh],
        [rimR, rh],
        [rimR - 0.045, rh * 0.8],
        [rimR - 0.06, 0],
      ],
      { at: c, axis: X_AXIS, segments: 24, bone, color: CHROME },
    );
    b.lathe(
      [
        [0, -hubW],
        [0.045, -hubW],
        [0.06, -hubW * 0.74],
        [0.06, hubW * 0.74],
        [0.045, hubW],
        [0, hubW],
      ],
      { at: c, axis: X_AXIS, segments: 10, bone, color: CHROME },
    );
    for (let i = 0; i < 6; i++) {
      const a = (i * 60 + 15) * D2R;
      const d = new THREE.Vector3(0, Math.cos(a), Math.sin(a));
      b.rod(sc(c, d, 0.05), sc(c, d, spokeEnd), [0.028, 0.016], CHROME, { bone, sides: 5 });
    }
    for (const s of [1, -1]) {
      glow(
        P(new THREE.TorusGeometry(rimR - 0.02, 0.007, 5, 26), TEAL, bone, sc(c, X_AXIS, s * (rh + 0.003)), {
          dir: X_AXIS,
          axis: "z",
        }),
        1.5,
      );
      P(cyl(0.034, 0.034, 0.012, 8), ORANGE, bone, sc(c, X_AXIS, s * (hubW + 0.006)), { dir: X_AXIS });
    }
  }
  wheel(wheelR, RC, 0.37, 0.11, 0.235, 0.2, 0.115);
  wheel(wheelF, AF, 0.33, 0.065, 0.215, 0.18, 0.082);

  // brake discs
  b.lathe(
    [
      [0.1, -0.004],
      [0.16, -0.004],
      [0.16, 0.004],
      [0.1, 0.004],
    ],
    { at: mv(AF, -0.07, 0, 0), axis: X_AXIS, segments: 20, bone: wheelF, color: CHROME },
  );
  b.lathe(
    [
      [0.09, -0.004],
      [0.15, -0.004],
      [0.15, 0.004],
      [0.09, 0.004],
    ],
    { at: mv(RC, -0.108, 0, 0), axis: X_AXIS, segments: 20, bone: wheelR, color: CHROME },
  );
  P(box(0.035, 0.09, 0.06), ORANGE_P, steer, mv(AF, -0.075, 0.02, -0.14));
  P(box(0.03, 0.07, 0.05), ORANGE_P, frameJ, mv(RC, -0.112, 0.12, 0.0));

  // axles
  b.rod(mv(AF, -0.115, 0, 0), mv(AF, 0.115, 0, 0), 0.02, CHROME, { bone: wheelF, sides: 6 });
  b.rod(mv(RC, -0.17, 0, 0), mv(RC, 0.2, 0, 0), 0.02, CHROME, { bone: wheelR, sides: 6 });

  // ---- frame ------------------------------------------------------------------------------------------------
  const tube = (pts: THREE.Vector3[], r: number, color: ColorInput, bone: Joint = frameJ) =>
    b.sweep(catmull(pts), r, { color, bone, sides: 6 });

  tube([HT, V(0, 0.97, 0.1), V(0, 0.8, -0.2), V(0, 0.74, -0.55)], 0.03, GUNM);
  b.rod(HT, sc(T, DF, 0.03), 0.042, GUNM, { bone: frameJ, sides: 8 });
  P(cyl(0.05, 0.05, 0.03, 8), CHROME, frameJ, sc(HT, DF, -0.01), { dir: DF });
  for (const s of [1, -1]) {
    // double cradle down tubes, ending at the axle plates
    tube(
      [mv(HT, s * 0.03, -0.04, 0), V(s * 0.09, 0.78, 0.42), V(s * 0.15, 0.55, 0.26), V(s * 0.15, 0.36, 0.1), V(s * 0.15, 0.34, -0.2), V(s * 0.155, 0.37, -0.9)],
      0.026,
      GUNM,
    );
    // hardtail upper rails
    tube([V(s * 0.08, 0.8, -0.2), V(s * 0.12, 0.62, -0.55), V(s * 0.155, 0.37, -0.9)], 0.024, GUNM);
    P(box(0.016, 0.1, 0.13), ORANGE_P, frameJ, mv(RC, s * 0.158, 0, 0));
    // engine mounts
    b.rod(V(s * 0.15, 0.36, 0.1), V(s * 0.12, 0.48, 0.08), 0.022, GUNM, { bone: frameJ, sides: 6 });
  }
  b.rod(V(0.1, 0.8, -0.2), V(-0.1, 0.8, -0.2), 0.018, GUNM, { bone: frameJ, sides: 6 });

  // ---- engine: V-twin ---------------------------------------------------------------------------------------
  const C = V(0, 0.5, 0.08);
  b.loft(
    [
      { at: V(0, 0.5, 0.24), w: 0.22, h: 0.22 },
      { at: V(0, 0.49, 0.08), w: 0.3, h: 0.3 },
      { at: V(0, 0.47, -0.15), w: 0.3, h: 0.28 },
      { at: V(0, 0.45, -0.4), w: 0.24, h: 0.24 },
    ],
    { bone: frameJ, color: GUNM },
  );
  const jug = [
    new THREE.Vector3(0, Math.cos(35 * D2R), Math.sin(35 * D2R)),
    new THREE.Vector3(0, Math.cos(35 * D2R), -Math.sin(35 * D2R)),
  ];
  for (const D of jug) {
    b.rod(sc(C, D, 0.04), sc(C, D, 0.31), 0.06, GUNM, { bone: frameJ, sides: 8 });
    for (let k = 0; k < 6; k++) P(cyl(0.095, 0.095, 0.011, 10), GUNM, frameJ, sc(C, D, 0.1 + k * 0.041), { dir: D });
    P(cyl(0.1, 0.1, 0.03, 10), GUNM, frameJ, sc(C, D, 0.31), { dir: D });
    b.lathe(
      [
        [0, 0],
        [0.1, 0],
        [0.106, 0.025],
        [0.088, 0.06],
        [0, 0.078],
      ],
      { at: sc(C, D, 0.325), axis: D, segments: 10, bone: frameJ, color: ORANGE_P },
    );
    for (const s of [1, -1])
      b.rod(mv(sc(C, D, 0.07), s * 0.115, 0, 0), mv(sc(C, D, 0.33), s * 0.115, 0, 0), 0.009, CHROME, {
        bone: frameJ,
        sides: 5,
      });
    P(cyl(0.011, 0.011, 0.07, 6), CREAM, frameJ, mv(sc(C, D, 0.36), 0.1, 0, 0), { dir: X_AXIS });
    P(cyl(0.014, 0.014, 0.012, 6), CHROME, frameJ, mv(sc(C, D, 0.36), 0.138, 0, 0), { dir: X_AXIS });
  }

  // air cleaner (left, in the V) with emblem
  const AC = V(0.14, 0.74, 0.08);
  b.lathe(
    [
      [0, 0],
      [0.085, 0],
      [0.105, 0.02],
      [0.105, 0.06],
      [0.09, 0.078],
      [0, 0.078],
    ],
    { at: AC, axis: X_AXIS, segments: 14, bone: frameJ, color: CHROME },
  );
  P(new THREE.CircleGeometry(0.062, 14), "#ffffff", frameJ, sc(AC, X_AXIS, 0.0795), {
    dir: X_AXIS,
    axis: "z",
    texture: EMBLEM,
  });
  for (let i = 0; i < 6; i++) {
    const a = i * 60 * D2R;
    P(ball(0.009), ORANGE, frameJ, mv(AC, 0.08, 0.082 * Math.cos(a), 0.082 * Math.sin(a)));
  }
  b.rod(AC, V(0, 0.66, 0.08), 0.03, GUNM, { bone: frameJ, sides: 6 });

  // primary cover with a drawn gear
  const PC = V(0.15, 0.47, -0.02);
  b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.16, 0.02],
      [0.15, 0.055],
      [0.1, 0.075],
      [0, 0.08],
    ],
    { at: PC, axis: X_AXIS, segments: 16, bone: frameJ, color: GUNM },
  );
  b.lathe(
    [
      [0.1, 0.03],
      [0.145, 0.03],
      [0.145, 0.04],
      [0.1, 0.04],
    ],
    { at: PC, axis: X_AXIS, segments: 16, bone: frameJ, color: ORANGE_P },
  );
  const gPlane = gearSize(GEAR).plane;
  P(new THREE.PlaneGeometry(gPlane, gPlane), TINT.brass, frameJ, sc(PC, X_AXIS, 0.084), {
    dir: X_AXIS,
    axis: "z",
    texture: GEARTEX,
  });
  glow(
    P(new THREE.TorusGeometry(0.075, 0.006, 5, 24), TEAL, frameJ, sc(PC, X_AXIS, 0.083), { dir: X_AXIS, axis: "z" }),
    1.4,
  );

  // gearbox / engine accents
  P(box(0.32, 0.035, 0.1), ORANGE_P, frameJ, V(0, 0.34, 0.08));
  for (const s of [1, -1]) P(ball(0.012), CHROME, frameJ, V(s * 0.152, 0.5, 0.2));
  // teal underglow strips
  for (const s of [1, -1]) {
    glow(b.capsule(V(s * 0.19, 0.3, -0.3), V(s * 0.19, 0.3, 0.38), 0.014, TEAL, { bone: frameJ, sides: 6 }), 1.6);
    glow(P(box(0.05, 0.006, 2.0), TEAL, stage, [s * 0.62, G + 0.004, 0.05]), 1.3);
  }

  // ---- belt drive -------------------------------------------------------------------------------------------
  const sprocket = { teeth: 28, module: 0.0095, spokes: 5, bore: 0.01 };
  b.part(gearGeometry(sprocket), CHROME, { bone: wheelR, at: mv(RC, 0.19, 0, 0), dir: X_AXIS });
  b.rod(mv(RC, 0.12, 0, 0), mv(RC, 0.2, 0, 0), 0.035, GUNM, { bone: wheelR, sides: 8 });
  b.frustumBox(V(0.19, 0.58, -0.04), V(0.19, 0.505, -0.9), [0.04, 0.012], [0.04, 0.012], { bone: frameJ, color: RUBBER });
  b.frustumBox(V(0.19, 0.36, -0.04), V(0.19, 0.237, -0.9), [0.04, 0.012], [0.04, 0.012], { bone: frameJ, color: RUBBER });

  // ---- exhaust ----------------------------------------------------------------------------------------------
  const pipes = [
    catmull([
      V(-0.05, 0.74, 0.4),
      V(-0.15, 0.7, 0.45),
      V(-0.24, 0.52, 0.38),
      V(-0.255, 0.4, 0.15),
      V(-0.25, 0.37, -0.3),
      V(-0.25, 0.39, -0.7),
      V(-0.26, 0.41, -1.12),
    ]),
    catmull([
      V(-0.05, 0.76, -0.2),
      V(-0.15, 0.74, -0.26),
      V(-0.25, 0.6, -0.26),
      V(-0.27, 0.5, -0.4),
      V(-0.27, 0.48, -0.55),
      V(-0.28, 0.5, -0.8),
      V(-0.29, 0.53, -1.18),
    ]),
  ];
  pipes.forEach((path, i) => {
    b.sweep(path, 0.034, {
      bone: frameJ,
      sides: 8,
      bands: [
        [0.22, BLUED],
        [1, CHROME],
      ],
    });
    b.sweep(path, 0.047, { from: 0.4 + i * 0.05, to: 0.78 + i * 0.05, bone: frameJ, sides: 8, color: CHROME, caps: "flat" });
    const end = path.at(1);
    const tan = path.tangentAt(1);
    P(cyl(0.054, 0.034, 0.1, 10), CHROME, frameJ, sc(end, tan, 0.05), { dir: tan });
    glow(P(new THREE.CircleGeometry(0.04, 8), ORANGE, frameJ, sc(end, tan, 0.102), { dir: tan, axis: "z" }), 1.6);
  });

  // ---- tank -------------------------------------------------------------------------------------------------
  const tank = b.loft(
    [
      { at: V(0, 1.07, 0.4), w: 0.1, h: 0.1 },
      { at: V(0, 1.07, 0.3), w: 0.25, h: 0.25 },
      { at: V(0, 1.02, 0.1), w: 0.36, h: 0.3 },
      { at: V(0, 0.97, -0.1), w: 0.32, h: 0.26 },
      { at: V(0, 0.91, -0.28), w: 0.18, h: 0.13 },
    ],
    { bone: frameJ, color: TANK },
  );
  const tankSkin = b.surface(tank);
  const capHit = tankSkin.ray(V(0, 2, 0.12), [0, -1, 0]);
  if (capHit) {
    b.stick(cyl(0.045, 0.05, 0.03, 10), CHROME, capHit, { embed: 0.3 });
    b.stick(cyl(0.022, 0.022, 0.02, 6), ORANGE, capHit.moved([0, 0.02, 0]), { embed: 0.2 });
  }
  for (const s of [1, -1]) {
    const h = tankSkin.around(V(0, 1.0, 0.1)).at(s * 90, 5);
    if (h) b.decal(tank, EMBLEM, { at: h, dir: [s, 0, 0], size: [0.17, 0.17] });
  }

  // ---- seat -------------------------------------------------------------------------------------------------
  b.loft(
    [
      { at: V(0, 0.83, -0.12), w: 0.16, h: 0.08 },
      { at: V(0, 0.82, -0.25), w: 0.3, h: 0.1 },
      { at: V(0, 0.81, -0.45), w: 0.3, h: 0.09 },
      { at: V(0, 0.8, -0.58), w: 0.2, h: 0.07 },
    ],
    { bone: frameJ, color: SEAT },
  );
  for (const s of [1, -1])
    b.sweep(coil(V(s * 0.1, 0.69, -0.17), V(s * 0.1, 0.8, -0.17), 0.028, 5), 0.006, {
      color: CHROME,
      bone: frameJ,
      sides: 4,
    });

  // ---- front end --------------------------------------------------------------------------------------------
  const DFneg = DF.clone().negate();
  P(box(0.3, 0.03, 0.11), CHROME, steer, sc(T, DF, -0.02), { dir: DFneg });
  P(box(0.28, 0.03, 0.1), CHROME, steer, sc(T, DF, 0.2), { dir: DFneg });
  for (const s of [1, -1]) {
    b.rod(mv(sc(T, DF, -0.02), s * 0.11, 0, 0), mv(sc(T, DF, 0.42), s * 0.11, 0, 0), 0.03, CHROME, { bone: steer, sides: 8 });
    b.rod(mv(sc(T, DF, 0.4), s * 0.11, 0, 0), mv(AF, s * 0.085, 0, 0), 0.024, ORANGE_P, { bone: steer, sides: 8 });
    P(cyl(0.032, 0.032, 0.03, 8), CHROME, steer, mv(sc(T, DF, 0.41), s * 0.11, 0, 0), { dir: DF });
  }

  // headlight
  const HL = sc(sc(T, DF, 0.25), PERP, 0.14);
  const FWD = new THREE.Vector3(0, 0.08, 1).normalize();
  P(cyl(0.1, 0.085, 0.15, 14), CHROME, steer, HL, { dir: FWD });
  P(new THREE.TorusGeometry(0.098, 0.012, 5, 16), CHROME, steer, sc(HL, FWD, 0.078), { dir: FWD, axis: "z" });
  glow(P(new THREE.CircleGeometry(0.088, 14), "#fff3c4", steer, sc(HL, FWD, 0.08), { dir: FWD, axis: "z" }), 1.7);
  for (const s of [1, -1])
    b.rod(mv(sc(T, DF, 0.25), s * 0.11, 0, 0), mv(HL, s * 0.095, 0, 0), 0.012, CHROME, { bone: steer, sides: 5 });

  // front fender
  const frontPt = (deg: number) => new THREE.Vector3(0, AF.y + 0.395 * Math.cos(deg * D2R), AF.z + 0.395 * Math.sin(deg * D2R));
  b.sweep(catmull([-55, -35, -15, 5, 25, 45, 65, 80].map(frontPt)), (t) => [0.07 + 0.012 * Math.sin(Math.PI * t), 0.011], {
    section: "box",
    caps: "flat",
    bone: steer,
    color: BODY,
  });
  const fp = frontPt(-12);
  const u = fp.clone().sub(T).dot(DF);
  for (const s of [1, -1])
    b.rod(mv(fp, s * 0.07, 0, 0), mv(sc(T, DF, u), s * 0.11, 0, 0), 0.012, CHROME, { bone: steer, sides: 5 });

  // ape-hanger bars, grips, levers, mirrors
  const B = mv(HT, 0, 0.035, 0);
  P(box(0.13, 0.04, 0.06), CHROME, steer, B);
  b.rod(HT, B, 0.025, CHROME, { bone: steer, sides: 6 });
  b.rod(mv(B, 0.13, 0.14, -0.02), mv(B, -0.13, 0.14, -0.02), 0.012, CHROME, { bone: steer, sides: 5 });
  for (const s of [1, -1]) {
    const bar: Array<[number, number, number]> = [
      [0.04, 0, 0],
      [0.13, 0.14, -0.02],
      [0.22, 0.3, -0.06],
      [0.34, 0.37, 0],
      [0.44, 0.35, 0.1],
    ];
    const pts = bar.map(([x, y, z]) => mv(B, s * x, y, z));
    b.sweep(catmull(pts), 0.016, { color: CHROME, bone: steer, sides: 6 });
    const end = pts[4];
    const gEnd = mv(end, s * 0.025, -0.01, 0.15);
    b.rod(end, gEnd, 0.021, RUBBER, { bone: steer, sides: 6 });
    P(cyl(0.026, 0.026, 0.02, 8), ORANGE, steer, gEnd, { dir: gEnd.clone().sub(end).normalize() });
    b.rod(mv(end, -s * 0.015, -0.01, 0.04), mv(end, 0, -0.045, 0.17), 0.007, CHROME, { bone: steer, sides: 4 });
    // bar-end mirror
    const stalkTop = mv(pts[3], s * 0.03, 0.17, -0.02);
    b.rod(pts[3], stalkTop, 0.007, CHROME, { bone: steer, sides: 4 });
    const mdir = new THREE.Vector3(0, 0.3, -1).normalize();
    const mpos = sc(stalkTop, mdir, 0.012);
    P(cyl(0.047, 0.047, 0.014, 10), CHROME, steer, mpos, { dir: mdir });
    P(new THREE.CircleGeometry(0.039, 10), "#bfe9f5", steer, sc(mpos, mdir, 0.0075), { dir: mdir, axis: "z" });
  }

  // gauge pod
  const podDir = new THREE.Vector3(0, 0.55, -0.83).normalize();
  const pod = mv(HT, 0, 0.1, 0.0);
  b.rod(HT, pod, 0.014, CHROME, { bone: steer, sides: 5 });
  P(cyl(0.057, 0.057, 0.035, 12), GUNM, steer, pod, { dir: podDir });
  P(new THREE.CircleGeometry(0.047, 20), "#ffffff", steer, sc(pod, podDir, 0.0185), { dir: podDir, axis: "z", texture: DIAL });

  // ---- rear fender, lights, plate, sissy bar, pennant ------------------------------------------------------
  const rearPt = (deg: number) => new THREE.Vector3(0, RC.y + 0.44 * Math.cos(deg * D2R), RC.z - 0.44 * Math.sin(deg * D2R));
  b.sweep(catmull([-25, -5, 15, 35, 55, 75, 95, 105].map(rearPt)), (t) => [0.12 + 0.015 * Math.sin(Math.PI * t), 0.012], {
    section: "box",
    caps: "flat",
    bone: frameJ,
    color: BODY,
  });
  for (const s of [1, -1]) {
    b.rod(V(s * 0.155, 0.37, -0.9), mv(rearPt(70), s * 0.12, 0, 0), 0.012, CHROME, { bone: frameJ, sides: 5 });
    b.rod(V(s * 0.12, 0.62, -0.55), mv(rearPt(-20), s * 0.11, 0, 0), 0.012, CHROME, { bone: frameJ, sides: 5 });
  }
  const tailEnd = rearPt(105);
  glow(P(box(0.09, 0.04, 0.05), RED, frameJ, mv(tailEnd, 0, 0.0, -0.02)), 1.8);
  b.rod(tailEnd, V(0, 0.27, -1.37), 0.01, CHROME, { bone: frameJ, sides: 4 });
  P(new THREE.PlaneGeometry(0.2, 0.1), "#ffffff", frameJ, V(0, 0.22, -1.375), {
    dir: [0, 0.1, -1],
    axis: "z",
    texture: PLATE,
  });

  // sissy bar with leather pad
  for (const s of [1, -1])
    tube([V(s * 0.13, 0.62, -0.62), V(s * 0.145, 0.85, -0.7), V(s * 0.14, 1.08, -0.78), V(s * 0.1, 1.2, -0.8)], 0.016, CHROME);
  b.rod(V(0.1, 1.2, -0.8), V(-0.1, 1.2, -0.8), 0.016, CHROME, { bone: frameJ, sides: 6 });
  P(box(0.26, 0.16, 0.05), SEAT, frameJ, V(0, 1.07, -0.835), { rotation: [-12, 0, 0] });
  for (const s of [1, -1]) for (const y of [1.03, 1.11]) P(ball(0.01), ORANGE, frameJ, V(s * 0.1, y, -0.865));

  // antenna and pennant
  const top = V(-0.13, 1.9, -0.8);
  b.rod(V(-0.13, 1.12, -0.8), top, 0.005, CHROME, { bone: frameJ, sides: 4 });
  glow(P(ball(0.016), ORANGE, frameJ, mv(top, 0, 0.01, 0)), 1.4);
  glow(
    b.cards([frame(mv(top, 0, -0.01, 0), [0, 0, -1])], FLAG, {
      size: [0.2, 0.42],
      flow: [1, 0, 0],
      bend: 35,
      lean: 0,
      sink: 0,
      bone: frameJ,
    }),
    0.75,
  );

  // ---- foot pegs and kickstand -----------------------------------------------------------------------------
  for (const s of [1, -1]) {
    b.rod(V(s * 0.15, 0.3, -0.15), V(s * 0.34, 0.3, -0.15), 0.014, CHROME, { bone: frameJ, sides: 5 });
    P(cyl(0.028, 0.028, 0.09, 8), RUBBER, frameJ, V(s * 0.37, 0.3, -0.15), { dir: X_AXIS });
    P(box(0.03, 0.06, 0.06), GUNM, frameJ, V(s * 0.15, 0.31, -0.15));
  }
  b.rod(V(0.16, 0.34, -0.12), V(0.4, 0, -0.12), 0.016, CHROME, { bone: stand, sides: 6 });
  P(box(0.09, 0.012, 0.1), GUNM, stand, V(0.4, 0.006, -0.12));
  P(cyl(0.025, 0.025, 0.05, 8), GUNM, stand, V(0.16, 0.34, -0.12), { dir: X_AXIS });

  // ---- stage: hex garage pad --------------------------------------------------------------------------------
  P(new THREE.CylinderGeometry(1.72, 1.8, 0.05, 6), HAZARD, stage, [0, 0.025, 0.08]);
  // hazard chevron blocks round the pad edge
  for (let k = 0; k < 6; k++) {
    const a1 = (k * Math.PI) / 3;
    const a2 = ((k + 1) * Math.PI) / 3;
    const x1 = 1.62 * Math.sin(a1);
    const z1 = 0.08 + 1.62 * Math.cos(a1);
    const x2 = 1.62 * Math.sin(a2);
    const z2 = 0.08 + 1.62 * Math.cos(a2);
    const len = Math.hypot(x2 - x1, z2 - z1);
    const yaw = Math.atan2(-(z2 - z1), x2 - x1) / D2R;
    for (let i = 0; i < 8; i++) {
      const t = 0.06 + (i + 0.5) * (0.88 / 8);
      P(box((len * 0.88) / 8, 0.014, 0.15), i % 2 ? "#1b2133" : ORANGE, stage, [x1 + (x2 - x1) * t, 0.056, z1 + (z2 - z1) * t], {
        rotation: [0, yaw, 0],
      });
    }
  }
  P(new THREE.CylinderGeometry(1.52, 1.52, 0.02, 6), DECK, stage, [0, 0.06, 0.08]);
  glow(
    b.lathe(
      [
        [1.25, 0],
        [1.28, 0],
        [1.28, 0.004],
        [1.25, 0.004],
      ],
      { at: [0, G, 0.08], axis: [0, 1, 0], segments: 36, bone: stage, color: ORANGE },
    ),
    1.2,
  );
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    const x = 1.62 * Math.sin(a);
    const z = 0.08 + 1.62 * Math.cos(a);
    P(cyl(0.055, 0.065, 0.12, 8), GUNM, stage, [x, 0.11, z]);
    glow(P(ball(0.05), TEAL, stage, [x, 0.19, z]), 1.5);
  }
  for (const s of [1, -1])
    P(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", stage, [s * 0.92, G + 0.003, 0.08], {
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: EMBLEM,
    });

  // toolbox with wrench
  {
    const x = -0.9;
    const z = -0.55;
    P(box(0.42, 0.17, 0.2), "#d9412f", stage, [x, G + 0.085, z]);
    P(box(0.44, 0.05, 0.21), "#b5301f", stage, [x, G + 0.195, z]);
    P(new THREE.TorusGeometry(0.07, 0.01, 5, 10, Math.PI), CHROME, stage, [x, G + 0.22, z]);
    for (const s of [1, -1]) P(box(0.04, 0.05, 0.015), CHROME, stage, [x + s * 0.12, G + 0.17, z + 0.105]);
    P(new THREE.PlaneGeometry(0.16, 0.06), "#ffffff", stage, [x, G + 0.09, z + 0.102], {
      dir: [0, 0, 1],
      axis: "z",
      texture: TOOL,
    });
    const w = 25 * D2R;
    b.extrude(
      [
        [-0.12, -0.012],
        [0.1, -0.012],
        [0.11, -0.03],
        [0.14, -0.03],
        [0.16, -0.015],
        [0.16, 0.015],
        [0.14, 0.03],
        [0.11, 0.03],
        [0.1, 0.012],
        [-0.12, 0.012],
        [-0.14, 0.025],
        [-0.17, 0.025],
        [-0.17, -0.025],
        [-0.14, -0.025],
      ],
      {
        at: [x + 0.02, G + 0.222, z],
        x: [Math.cos(w), 0, -Math.sin(w)],
        y: [Math.sin(w), 0, Math.cos(w)],
        thickness: 0.014,
        bevel: 0.003,
        color: CHROME,
        bone: stage,
      },
    );
  }

  // stacked tyres
  {
    const x = 0.92;
    const z = -0.55;
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < 2; i++) {
      const c = new THREE.Vector3(x + i * 0.012, G + 0.075 + i * 0.15, z);
      b.lathe(tireProfile(0.19, 0.075, 0.115), {
        at: c,
        axis: up,
        segments: 20,
        bone: stage,
        color: tirePaint(c, up, 0.19, 0.075),
      });
    }
    glow(P(new THREE.TorusGeometry(0.12, 0.006, 5, 20), TEAL, stage, [x + 0.012, G + 0.302, z], { dir: [0, 1, 0], axis: "z" }), 1.3);
  }

  // crates
  P(box(0.3, 0.3, 0.3), "#ffffff", stage, [-0.95, G + 0.15, 0.55], { rotation: [0, 12, 0], texture: CRATE });
  P(box(0.22, 0.22, 0.22), "#ffffff", stage, [-0.95, G + 0.41, 0.55], { rotation: [0, -25, 0], texture: CRATE });

  // traffic cone
  P(box(0.2, 0.02, 0.2), "#1b2133", stage, [0.82, G + 0.01, 0.82]);
  P(new THREE.ConeGeometry(0.075, 0.3, 10), CONE_P, stage, [0.82, G + 0.17, 0.82]);
  glow(P(ball(0.015), ORANGE, stage, [0.82, G + 0.325, 0.82]), 1.4);

  // jerrycan
  {
    const x = 0.95;
    const z = 0.45;
    const yaw = -18 * D2R;
    b.extrude(
      [
        [-0.14, 0],
        [0.14, 0],
        [0.14, 0.26],
        [0.07, 0.33],
        [-0.05, 0.33],
        [-0.14, 0.27],
      ],
      {
        at: [x, G, z],
        x: [Math.cos(yaw), 0, -Math.sin(yaw)],
        y: [0, 1, 0],
        thickness: 0.13,
        bevel: 0.015,
        color: toned("#3b9e86"),
        bone: stage,
      },
    );
    P(cyl(0.032, 0.032, 0.05, 8), ORANGE, stage, [x - 0.01, G + 0.355, z]);
    P(box(0.1, 0.02, 0.1), "#2b6e5d", stage, [x + 0.07, G + 0.335, z], { rotation: [0, -18, 0] });
  }

  return b.root;
}
