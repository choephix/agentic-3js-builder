import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  bezier,
  catmull,
  limb,
  countershade,
  paint,
  gradient,
  mottle,
  svg,
} from "../../../../src/index";
import { cel, INK, animeEye } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kitsune of Nine Flames",
  description:
    "A high-fantasy anime nine-tailed fox with fanned, flame-tipped tails, red kabuki face marks, a bell and charm, hovering spirit flames, and a glowing shrine dais with lanterns and a small torii.",
};

const DEG = Math.PI / 180;
const G = 0.08; // dais top (the fox stands on it)
const H = 1.25; // head scale constant
const P = 1.2; // paw scale constant

// ---- palette ---------------------------------------------------------------------------------------------
const IVORY = "#fffaf2";
const CREAM = "#fff0d6";
const SOCK = "#3a3354";
const RED = "#e0243c";
const GOLD = "#f2c14e";
const LAC = "#c8283c";
const BLK = "#2a2438";

const COAT = cel(countershade(IVORY, CREAM, { level: -0.15 }), "#cfcdf0");
const WHITE = cel(IVORY, "#cfcdf0");
const MUZ = cel("#fff6e6", "#d9d2ee");
const FUR2 = cel("#c9ecff", "#9fc4f2");
const TIPC = cel("#3fd0ff", "#2a8fe0");
const DARKC = cel(SOCK, "#241f3a");
const PINKIN = cel("#f59ab5", "#d06c98");
const STONE = mottle("#a4a9c2", "#868ca8", { size: 0.18, seed: 4 });
const STONE2 = mottle("#8a8fae", "#6f7596", { size: 0.14, seed: 8 });

const scl = (o: any[], k: number, dy = 0): any[] =>
  o.map((q) => (q[2] ? [q[0] * k, q[1] * k + dy, q[2]] : [q[0] * k, q[1] * k + dy]));

const EAR: any[] = [
  [-0.048, 0, "sharp"],
  [0.048, 0, "sharp"],
  [0.04, 0.07],
  [0.014, 0.15],
  [0, 0.185, "sharp"],
  [-0.014, 0.15],
  [-0.04, 0.07],
];

// flame profile: radius, height (unit flame is 1.25 tall)
const FLAME: any[] = [
  [0, 0, "sharp"],
  [0.38, 0.05],
  [0.52, 0.2],
  [0.5, 0.4],
  [0.36, 0.65],
  [0.2, 0.92],
  [0, 1.25, "sharp"],
];

export default function build() {
  const b = createBuilder({ name: "kitsune" });
  const R = rng(9);

  // ---- textures ------------------------------------------------------------------------------------------
  const EYE = animeEye({ iris: "#ffb21c", irisLight: "#ffe27a" });

  const tuftSvg = (a: string, m: string, c: string, vein: string) =>
    svg(
      `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${a}"/><stop offset="0.55" stop-color="${m}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs><path d="M16 63 C3 50 3 24 16 1 C29 24 29 50 16 63Z" fill="url(#g)"/><path d="M16 58 C12 44 12 26 16 10" stroke="${vein}" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`,
      { size: 128 },
    );
  const TUFT = tuftSvg("#ffffff", "#bfeaff", "#2fc4ff", "#ffffff");
  const TUFTW = tuftSvg("#ffffff", "#fff4e2", "#e4e0ff", "#f3eeff");

  const KAB = svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg"><path d="M2 5 Q28 6 62 30 Q30 17 2 11Z" fill="${RED}"/><path d="M9 17 Q30 20 54 37 Q32 27 9 22Z" fill="${RED}"/></svg>`,
    { size: 256 },
  );
  const DIAM = svg(
    `<svg viewBox="0 0 30 46" xmlns="http://www.w3.org/2000/svg"><path d="M15 2 L28 23 L15 44 L2 23Z" fill="${RED}"/><path d="M15 13 L21 23 L15 33 L9 23Z" fill="#ffe28a"/></svg>`,
    { size: 128 },
  );
  const CHARM = svg(
    `<svg viewBox="0 0 40 56" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="34" height="50" rx="5" fill="#d92b45" stroke="${GOLD}" stroke-width="2.5"/><path d="M3 14 H37" stroke="${GOLD}" stroke-width="2"/><circle cx="20" cy="8.5" r="2.2" fill="${GOLD}"/><path d="M11 27 L15 17 L20 25 L25 17 L29 27 L20 45Z" fill="none" stroke="#fff0b0" stroke-width="2.6" stroke-linejoin="round"/></svg>`,
    { size: 128 },
  );
  const PETAL = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 30 C3 22 2 8 11 2 L16 8 L21 2 C30 8 29 22 16 30Z" fill="#ffb7cf"/><path d="M16 28 L16 12" stroke="#ff8fb3" stroke-width="2" stroke-linecap="round"/></svg>`,
    { size: 64 },
  );
  const pt = (r: number, a: number) => `${(100 + r * Math.sin(a)).toFixed(2)},${(100 - r * Math.cos(a)).toFixed(2)}`;
  let circ = "";
  const ringS = (r: number, w: number) =>
    `<circle cx="100" cy="100" r="${r}" fill="none" stroke="#8cf0ff" stroke-width="${w}"/>`;
  circ += ringS(96, 1.8) + ringS(89, 1) + ringS(64, 1.4) + ringS(30, 1.2);
  for (let i = 0; i < 9; i++) {
    const a = i * 40 * DEG;
    circ += `<path d="M${pt(62, a)} L${pt(62, a + 160 * DEG)}" stroke="#ffffff" stroke-width="1.2" fill="none"/>`;
    circ += `<circle cx="${pt(76, a).split(",")[0]}" cy="${pt(76, a).split(",")[1]}" r="4.5" fill="none" stroke="#8cf0ff" stroke-width="1.4"/>`;
    circ += `<path d="M${pt(82, a - 0.1)} L${pt(93, a)} L${pt(82, a + 0.1)}" stroke="#bff6ff" stroke-width="1.4" fill="none" stroke-linejoin="round"/>`;
  }
  for (let i = 0; i < 72; i++) {
    const a = i * 5 * DEG;
    circ += `<path d="M${pt(90, a)} L${pt(94, a)}" stroke="#8cf0ff" stroke-width="1"/>`;
  }
  const CIRCLE = svg(`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${circ}</svg>`, { size: 1024 });

  // ---- skeleton --------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, G + 0.5, -0.28], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, G + 0.5, -0.28],
      [0, G + 0.52, -0.1],
      [0, G + 0.54, 0.06],
      [0, G + 0.56, 0.2],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, G + 0.56, 0.2],
      [0, G + 0.65, 0.27],
      [0, G + 0.73, 0.335],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, G + 0.73, 0.335], dir: [0, 0.12, 1], role: "head" });
  const HC = new THREE.Vector3(0, G + 0.77, 0.41);
  const hp = (x: number, y: number, z: number) => new THREE.Vector3(HC.x + x * H, HC.y + y * H, HC.z + z * H);
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.04, 0.03), aim: hp(0, -0.06, 0.2), role: "jaw" });
  const stage = b.joint("stage", { parent: hips, at: [0, 0, -0.1] });
  const tailBase = b.joint("tailBase", { parent: hips, at: [0, G + 0.53, -0.38], dir: [0, 0.3, -1] });

  // ---- body ------------------------------------------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, G + 0.5, -0.38], w: 0.16, h: 0.18 },
      { at: [0, G + 0.5, -0.24], w: 0.25, h: 0.25 },
      { at: [0, G + 0.5, -0.04], w: 0.2, h: 0.2 },
      { at: [0, G + 0.54, 0.14], w: 0.26, h: 0.27 },
      { at: [0, G + 0.56, 0.26], w: 0.2, h: 0.2 },
    ],
    { bone: [hips, spine], color: COAT },
  );
  b.sweep(neck, [0.088, 0.072], { color: COAT });
  b.part(new THREE.SphereGeometry(1, 10, 8), WHITE, {
    bone: tailBase,
    at: [0, G + 0.55, -0.4],
    scale: [0.1, 0.09, 0.11],
  });

  // ---- legs ------------------------------------------------------------------------------------------------
  const sockFade = gradient(COAT, DARKC, [0, G + 0.2, 0], [0, G + 0.09, 0]);
  const paw = (ch: any, x: number, z: number) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), DARKC, {
      bone: ch.tip,
      at: [x, G + 0.04, z + 0.022],
      scale: [0.042 * P, 0.04, 0.062 * P],
    });
    for (const dx of [-1, 0, 1]) {
      const tx = x + dx * 0.023;
      const tz = z + 0.085 - Math.abs(dx) * 0.01;
      b.part(new THREE.SphereGeometry(0.014, 6, 4), DARKC, { bone: ch.tip, at: [tx, G + 0.016, tz] });
      b.part(new THREE.ConeGeometry(0.0055, 0.018, 5), CREAM, {
        bone: ch.tip,
        at: [tx, G + 0.011, tz + 0.016],
        dir: [0, -0.35, 1],
      });
    }
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fPts = limb([s * 0.1, G + 0.5, 0.17], [s * 0.1, G + 0.04, 0.2], [0.27, 0.25], [[0, 0, -1]]);
    const fl = b.chain(`legF${side}`, fPts as any, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `pawF${side}`],
      role: "leg",
    });
    b.sweep(fl, [0.062, 0.046, 0.032], { color: sockFade });
    paw(fl, s * 0.1, 0.2);
    b.part(new THREE.SphereGeometry(1, 9, 7), COAT, {
      bone: spine.joints[2],
      at: [s * 0.1, G + 0.5, 0.17],
      scale: [0.078, 0.1, 0.09],
    });

    const hPts = limb(
      [s * 0.1, G + 0.5, -0.27],
      [s * 0.1, G + 0.04, -0.2],
      [0.25, 0.25, 0.16],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hl = b.chain(`legH${side}`, hPts as any, {
      parent: hips,
      names: [`hipH${side}`, `kneeH${side}`, `hockH${side}`, `pawH${side}`],
      role: "leg",
    });
    b.sweep(hl, [0.078, 0.056, 0.04, 0.032], { color: sockFade });
    paw(hl, s * 0.1, -0.2);
    b.part(new THREE.SphereGeometry(1, 9, 7), COAT, {
      bone: hips,
      at: [s * 0.11, G + 0.5, -0.27],
      scale: [0.09, 0.115, 0.125],
    });
  }

  // flank swirl marks
  const bodySkin = b.surface(body);
  for (const s of [1, -1]) {
    const hit = bodySkin.around([0, G + 0.5, -0.02]).at(s * 90, 8);
    if (hit) b.decal(body, KAB, { at: hit, dir: [s, 0, 0], size: [0.14, 0.085], mirror: s > 0 });
  }

  // ---- head ------------------------------------------------------------------------------------------------
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), WHITE, {
    bone: head,
    at: HC,
    scale: [0.105 * H, 0.092 * H, 0.1 * H],
  });
  b.loft(
    [
      { at: hp(0, -0.02, 0.07), w: 0.07 * H, h: 0.065 * H },
      { at: hp(0, -0.032, 0.14), w: 0.048 * H, h: 0.045 * H },
      { at: hp(0, -0.04, 0.205), w: 0.026 * H, h: 0.03 * H },
    ],
    { bone: head, color: MUZ },
  );
  b.part(new THREE.SphereGeometry(1, 8, 6), INK, {
    bone: head,
    at: hp(0, -0.032, 0.222),
    scale: [0.017 * H, 0.013 * H, 0.014 * H],
  });
  b.loft(
    [
      { at: hp(0, -0.062, 0.07), w: 0.06 * H, h: 0.022 * H },
      { at: hp(0, -0.064, 0.14), w: 0.04 * H, h: 0.02 * H },
      { at: hp(0, -0.06, 0.19), w: 0.022 * H, h: 0.018 * H },
    ],
    { bone: jaw, color: MUZ },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.005, 0.013, 5), "#ffffff", { bone: jaw, at: hp(s * 0.014, -0.05, 0.17) });
  }

  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const eh = skin.around(HC).at(s * 36, 4);
    if (eh) glow(b.decal(skull, EYE, { at: eh, size: [0.056, 0.077], mirror: s > 0 }), 0.6);
    const kh = skin.around(HC).at(s * 62, -16);
    if (kh) b.decal(skull, KAB, { at: kh, size: [0.09, 0.055], mirror: s > 0 });
    // whiskers
    for (const [dy, ey] of [
      [-0.02, 0.0],
      [-0.035, -0.05],
    ]) {
      b.rod(hp(s * 0.035, dy, 0.12), hp(s * 0.2, ey, 0.09), 0.0025, "#d6d1ee", { bone: head, sides: 4 });
    }
  }
  const dh = skin.around(HC).at(0, 58);
  if (dh) b.decal(skull, DIAM, { at: dh, size: [0.034, 0.052] });

  // ears
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ca = Math.cos(16 * DEG);
    const sa = Math.sin(16 * DEG);
    const X: [number, number, number] = [ca, -s * sa, 0];
    const Y: [number, number, number] = [s * sa, ca, 0];
    const eb = hp(s * 0.072, 0.07, -0.015);
    const earJ = b.joint(`ear${side}`, { parent: head, at: eb, dir: Y, role: "hinge" });
    const ek = 1.2;
    const tipLine = 0.15 * ek;
    b.extrude(scl(EAR, ek), {
      at: eb,
      x: X,
      y: Y,
      thickness: 0.024,
      bevel: 0.004,
      bone: earJ,
      color: paint((_p, _n, sc) => (sc[1] > tipLine ? DARKC : WHITE)),
    });
    b.extrude(scl(EAR, ek * 0.62, 0.014), {
      at: [eb.x, eb.y, eb.z + 0.014],
      x: X,
      y: Y,
      thickness: 0.01,
      bone: earJ,
      color: PINKIN,
    });
    b.part(new THREE.TorusGeometry(0.013, 0.004, 5, 8), GOLD, {
      bone: earJ,
      at: [eb.x + s * 0.03, eb.y + 0.02, eb.z + 0.004],
      dir: [0, 0, 1],
      axis: "z",
    });
  }

  // cheek fluff + head crest
  const cheek: any[] = [];
  for (const s of [1, -1])
    for (const [az, el] of [
      [80, -12],
      [95, -24],
      [68, -30],
    ]) {
      const h = skin.around(HC).at(s * az, el);
      if (h) cheek.push(h);
    }
  b.cards(cheek, TUFTW, { size: [0.07, 0.11], lean: 70, bend: 20, vary: 0.2, rng: R });
  const crest: any[] = [];
  for (const [az, el] of [
    [0, 80],
    [25, 72],
    [-25, 72],
    [180, 55],
    [150, 62],
    [-150, 62],
  ]) {
    const h = skin.around(HC).at(az, el);
    if (h) crest.push(h);
  }
  b.cards(crest, TUFTW, { size: [0.06, 0.1], lean: 55, bend: 20, vary: 0.2, rng: R });

  // ---- ruff, cord, bell, charm ----------------------------------------------------------------------------
  const ringAt = (tt: number, rad: number, n: number, phase: number) => {
    const cp: any = neck.at(tt);
    const T = (cp.tangent as THREE.Vector3).clone().normalize();
    const e1 = new THREE.Vector3(1, 0, 0);
    const e2 = T.clone().cross(e1).normalize();
    const pts: THREE.Vector3[] = [];
    const radials: THREE.Vector3[] = [];
    for (let k = 0; k < n; k++) {
      const a = phase + (k / n) * Math.PI * 2;
      const r = e1.clone().multiplyScalar(Math.cos(a)).addScaledVector(e2, Math.sin(a));
      radials.push(r);
      pts.push((cp.at as THREE.Vector3).clone().addScaledVector(r, rad));
    }
    return { pts, radials };
  };
  for (const [tt, rad, n, ph, sz] of [
    [0.45, 0.085, 14, 0, 0.11],
    [0.72, 0.09, 12, 0.26, 0.09],
  ] as number[][]) {
    const rg = ringAt(tt, rad, n, ph);
    b.cards(
      rg.pts.map((p, i) => frame(p, rg.radials[i])),
      TUFTW,
      {
        size: [sz * 0.7, sz],
        lean: 58,
        bend: 25,
        flow: [0, -1, -0.15],
        vary: 0.2,
        rng: R,
        bone: neck.joints[0],
      },
    );
  }
  const cord = ringAt(0.1, 0.145, 14, 0);
  b.sweep(catmull(cord.pts, { closed: true }), 0.009, { bone: neck.joints[0], color: RED, sides: 5 });
  let front = cord.pts[0];
  for (const p of cord.pts) if (p.z - p.y > front.z - front.y) front = p;
  const bell = front.clone().add(new THREE.Vector3(0, -0.03, 0.005));
  glow(b.part(new THREE.SphereGeometry(0.024, 8, 6), GOLD, { bone: spine.joints[2], at: bell }), 0.6);
  b.part(new THREE.TorusGeometry(0.01, 0.003, 5, 8), GOLD, {
    bone: spine.joints[2],
    at: bell.clone().add(new THREE.Vector3(0, 0.025, 0)),
    dir: [0, 0, 1],
    axis: "z",
  });
  b.part(new THREE.BoxGeometry(0.03, 0.004, 0.004), BLK, {
    bone: spine.joints[2],
    at: bell.clone().add(new THREE.Vector3(0, -0.006, 0.022)),
  });
  const charmAt = bell.clone().add(new THREE.Vector3(0.07, -0.03, 0.005));
  b.rod(bell.clone().add(new THREE.Vector3(0.02, 0.02, 0)), charmAt.clone().add(new THREE.Vector3(0, 0.03, 0)), 0.003, RED, {
    bone: spine.joints[2],
    sides: 4,
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.05, 0.07), "#ffffff", {
      bone: spine.joints[2],
      at: charmAt,
      dir: [0, 0, 1],
      axis: "z",
      texture: CHARM,
    }),
    0.5,
  );

  // ---- nine tails ------------------------------------------------------------------------------------------
  const LET = "ABCDEFGHI";
  const tuftFrames: any[] = [];
  const tipJoints: { p: THREE.Vector3; j: any }[] = [];
  for (let i = 0; i < 9; i++) {
    const u = (i - 4) / 4;
    const au = Math.abs(u);
    const L = 0.95 - au * 0.16;
    const yaw0 = u * 58 * DEG;
    const p0 = 16 - au * 8;
    const p1 = 74 - au * 30;
    const pts: THREE.Vector3[] = [new THREE.Vector3(0, G + 0.53, -0.38)];
    let cur = pts[0].clone();
    const N = 4;
    for (let k = 1; k <= N; k++) {
      const t = (k - 0.5) / N;
      const yaw = yaw0 * (0.45 + 0.55 * t);
      const pitch = (p0 + (p1 - p0) * t) * DEG;
      const d = new THREE.Vector3(
        Math.sin(yaw) * Math.cos(pitch),
        Math.sin(pitch),
        -Math.cos(yaw) * Math.cos(pitch),
      );
      cur = cur.clone().addScaledVector(d, L / N);
      pts.push(cur);
    }
    const ch = b.chain(`tail${LET[i]}`, catmull(pts), {
      parent: tailBase,
      names: [1, 2, 3, 4].map((k) => `tail${LET[i]}${k}`),
      count: 4,
      role: "tail",
    });
    const sw = b.sweep(ch, [0.03, 0.06, 0.088, 0.08, 0.05, 0.01], {
      sides: 8,
      caps: { end: "point" },
      bands: [
        [0.5, WHITE],
        [0.78, FUR2],
        [1, TIPC],
      ],
    });
    for (const [tt, k] of [
      [0.13, 1.0],
      [0.27, 1.12],
    ]) {
      const tp: any = ch.at(tt);
      const sp: any = sw.at(tt);
      b.part(new THREE.TorusGeometry(sp.radius * k, 0.008, 5, 12), GOLD, {
        at: tp.at,
        dir: tp.tangent,
        axis: "z",
        bone: tp.bone,
      });
    }
    for (const tt of [0.25, 0.45, 0.65, 0.82])
      for (const deg of [70, -70]) tuftFrames.push(sw.at(tt, deg));
    const tipP: any = ch.at(1);
    tipJoints.push({
      p: (tipP.at as THREE.Vector3).clone().addScaledVector(tipP.tangent as THREE.Vector3, 0.07),
      j: ch.joints[3],
    });
  }
  b.cards(tuftFrames, TUFT, {
    size: [0.055, 0.13],
    lean: 55,
    bend: 25,
    flow: (f: any) => f.tangent ?? [0, 0, -1],
    vary: 0.25,
    rng: rng(11),
  });

  // ---- spirit flames ---------------------------------------------------------------------------------------
  const flame = (p: THREE.Vector3, size: number, bone: any, nLayers: number, str: number) => {
    const layers: [number, number, string, number][] = [
      [1.0, 1.0, "#5f7bff", str],
      [0.7, 0.8, "#35d4ff", str * 1.15],
      [0.4, 0.55, "#effeff", str * 1.4],
    ];
    layers.slice(0, nLayers).forEach(([rs, hs, col, gs], i) => {
      const outline = FLAME.map((q: any) =>
        q[2] ? [q[0] * size * rs, q[1] * size * hs, q[2]] : [q[0] * size * rs, q[1] * size * hs],
      );
      glow(
        b.lathe(outline, {
          at: [p.x, p.y + size * 0.03 * i, p.z],
          bone,
          color: col,
          segments: 7,
        }),
        gs,
      );
    });
    glow(
      b.sweep(
        bezier(
          [p.x, p.y + size * 0.25, p.z],
          [p.x + size * 0.55, p.y + size * 0.8, p.z],
          [p.x + size * 0.2, p.y + size * 1.3, p.z + size * 0.1],
        ),
        [size * 0.09, 0],
        { bone, color: "#5f7bff", sides: 5 },
      ),
      str,
    );
  };
  for (const tj of tipJoints) flame(tj.p, 0.12, tj.j, 2, 1.3);
  const wispDefs = [
    [0.5, G + 0.74, 0.3, 0.17],
    [-0.52, G + 0.92, 0.05, 0.18],
    [0.56, G + 1.0, -0.28, 0.14],
  ];
  wispDefs.forEach((w, i) => {
    const wj = b.joint(`wisp${i + 1}`, { parent: spine.joints[1], at: [w[0], w[1], w[2]] });
    flame(new THREE.Vector3(w[0], w[1], w[2]), w[3], wj, 3, 1.4);
    glow(
      b.part(new THREE.TorusGeometry(w[3] * 0.7, 0.006, 5, 14), "#8cf0ff", {
        bone: stage,
        at: [w[0], G + 0.006, w[2]],
        dir: [0, 1, 0],
        axis: "z",
      }),
      1,
    );
  });
  for (let i = 0; i < 10; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.45 + R() * 0.45;
    const x = Math.cos(a) * r;
    const z = -0.1 + Math.sin(a) * r * 0.9;
    if (z > 0.4) continue;
    glow(
      b.part(new THREE.OctahedronGeometry(0.012 + R() * 0.01), i % 2 ? "#9ff0ff" : "#ffe08a", {
        bone: stage,
        at: [x, G + 0.25 + R() * 0.95, z],
      }),
      1.5,
    );
  }

  // ---- stage -----------------------------------------------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [1.07, 0],
      [1.07, 0.035],
      [0, 0.035],
    ],
    { at: [0, 0, -0.1], bone: stage, color: STONE2, segments: 24 },
  );
  b.lathe(
    [
      [0, 0.03],
      [1.0, 0.03],
      [1.0, G],
      [0, G],
    ],
    { at: [0, 0, -0.1], bone: stage, color: STONE, segments: 24 },
  );
  b.lathe(
    [
      [0.93, G - 0.002],
      [0.97, G - 0.002],
      [0.97, G + 0.009],
      [0.93, G + 0.009],
    ],
    { at: [0, 0, -0.1], bone: stage, color: GOLD, segments: 24 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(1.8, 1.8), "#ffffff", {
      bone: stage,
      at: [0, G + 0.004, -0.1],
      dir: [0, 1, 0],
      axis: "z",
      texture: CIRCLE,
    }),
    0.9,
  );
  // stepping stones at the front
  for (const [x, z, r] of [
    [0.3, 0.8, 0.06],
    [-0.25, 0.85, 0.05],
    [0.05, 0.92, 0.045],
    [-0.5, 0.65, 0.05],
  ]) {
    b.part(new THREE.CylinderGeometry(r, r * 1.1, 0.025, 7), STONE2, { bone: stage, at: [x, G + 0.012, z - 0.1] });
  }

  // lanterns
  const lantern = (x: number, z: number) => {
    const o = (y: number) => [x, G + y, z];
    b.part(new THREE.BoxGeometry(0.16, 0.04, 0.16), STONE, { bone: stage, at: o(0.02) });
    b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.15, 6), STONE, { bone: stage, at: o(0.115) });
    b.part(new THREE.CylinderGeometry(0.075, 0.065, 0.03, 6), STONE, { bone: stage, at: o(0.205) });
    glow(b.part(new THREE.BoxGeometry(0.08, 0.08, 0.08), "#ffc861", { bone: stage, at: o(0.26) }), 1.6);
    for (const [dx, dz] of [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ])
      b.part(new THREE.BoxGeometry(0.014, 0.1, 0.014), STONE, { bone: stage, at: [x + dx * 0.045, G + 0.26, z + dz * 0.045] });
    b.part(new THREE.ConeGeometry(0.11, 0.09, 6), STONE2, { bone: stage, at: o(0.355) });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLD, { bone: stage, at: o(0.415) });
  };
  lantern(0.85, -0.3);
  lantern(-0.85, -0.3);

  // small torii
  const torii = (cx: number, cz: number, yawDeg: number, w: number, h: number) => {
    const yw = yawDeg * DEG;
    const c = Math.cos(yw);
    const sn = Math.sin(yw);
    const Lx = (lx: number) => [cx + lx * c, cz - lx * sn];
    for (const sg of [1, -1]) {
      const [px, pz] = Lx((sg * w) / 2);
      b.part(new THREE.CylinderGeometry(0.018, 0.022, h, 8), LAC, { bone: stage, at: [px, G + h / 2, pz] });
      b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.03, 8), BLK, { bone: stage, at: [px, G + 0.015, pz] });
    }
    const [mx, mz] = Lx(0);
    b.part(new THREE.BoxGeometry(w * 0.95, 0.025, 0.02), LAC, {
      bone: stage,
      at: [mx, G + h * 0.72, mz],
      rotation: [0, yawDeg, 0],
    });
    b.part(new THREE.BoxGeometry(w * 1.18, 0.035, 0.035), BLK, {
      bone: stage,
      at: [mx, G + h + 0.012, mz],
      rotation: [0, yawDeg, 0],
    });
    b.part(new THREE.BoxGeometry(w * 1.28, 0.02, 0.045), LAC, {
      bone: stage,
      at: [mx, G + h + 0.04, mz],
      rotation: [0, yawDeg, 0],
    });
    glow(
      b.part(new THREE.BoxGeometry(0.03, 0.045, 0.006), "#ffd98a", {
        bone: stage,
        at: [mx, G + h * 0.55, mz],
        rotation: [0, yawDeg, 0],
      }),
      1.2,
    );
  };
  torii(0.55, -0.85, -36, 0.4, 0.42);

  // fallen sakura petals
  const petalFrames: any[] = [];
  for (let i = 0; i < 12; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.5 + R() * 0.38;
    const x = Math.cos(a) * r;
    const z = -0.1 + Math.sin(a) * r;
    if (Math.abs(x) < 0.3 && z < 0.35 && z > -0.7) continue;
    petalFrames.push(frame([x, G + 0.012, z], [0, 1, 0]));
  }
  b.cards(petalFrames, PETAL, {
    size: 0.05,
    lean: 90,
    mirror: true,
    flow: (_f: any, i: number) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
    bone: stage,
  });

  return b.root;
}
