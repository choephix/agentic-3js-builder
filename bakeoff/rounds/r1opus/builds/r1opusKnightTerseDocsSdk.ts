import * as THREE from "three";
import {
  createBuilder,
  frame,
  polyline,
  catmull,
  lerp,
  countershade,
  scales,
  paint,
  gradient,
  svg,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Armored Knight",
  description:
    "A stylized full-plate knight in a T-pose rest stance: a faceted great helm with a hinged visor, a split jaw plate and a gold coronet with a red-and-white plume. A blue tabard with a gold cross patée, layered pauldrons, rondels, segmented sabatons with spurs, a sheathed sword and a quartered heater shield on his back.",
};

const STEEL_HI = "#d6dde6";
const STEEL = "#8a94a3";
const STEEL_DK = "#4d5563";
const GOLD = "#dcaa3c";
const BLUE = "#24479a";
const RED = "#b8242e";
const RED_DK = "#741019";
const WHITE = "#f1ebdd";
const LEATHER = "#6b3f22";
const LEATHER_DK = "#3e2418";
const MAIL = "#7d848e";
const MAIL_DK = "#3d424a";
const VOID = "#111318";
const WOOD = "#7a5533";

type P3 = number[] | THREE.Vector3;
const V = (a: P3) => (a instanceof THREE.Vector3 ? a.clone() : new THREE.Vector3(a[0], a[1], a[2]));
const add = (a: P3, d: P3, k = 1) => V(a).addScaledVector(V(d), k);

function inPoly(x: number, y: number, poly: number[][]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export default function build() {
  const b = createBuilder({ name: "knight", paintSize: 2048 });
  const steel = countershade(STEEL_HI, STEEL, { level: -0.1 });
  const mail = scales(MAIL, MAIL_DK, { size: 0.018, seed: 3 });

  // ---------------- Skeleton ----------------
  const hips = b.joint("hips", { at: [0, 0.95, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 1.0, 0],
      [0, 1.16, 0.01],
      [0, 1.32, 0.01],
      [0, 1.5, -0.01],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    polyline([
      [0, 1.5, -0.01],
      [0, 1.6, 0],
    ]),
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 1.6, 0], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.665, 0.02], aim: [0, 1.63, 0.16], role: "jaw" });
  const visor = b.joint("visor", { parent: head, at: [0, 1.765, 0], aim: [0, 1.765, 0.16], role: "hinge" });

  // ---------------- Torso ----------------
  const torsoPaint = paint((p) => {
    if (p.y < 1.03) return mail;
    const ax = Math.abs(p.x);
    if (p.y > 1.415 || ax > 0.165) return steel;
    if (p.y > 1.39 || ax > 0.145) return GOLD;
    return BLUE;
  });
  const torso = b.loft(
    [
      { at: [0, 0.86, 0], w: 0.28, h: 0.2 },
      { at: [0, 1.0, 0], w: 0.29, h: 0.21 },
      { at: [0, 1.16, 0.01], w: 0.34, h: 0.25 },
      { at: [0, 1.32, 0.015], w: 0.42, h: 0.28 },
      { at: [0, 1.45, 0], w: 0.42, h: 0.25 },
      { at: [0, 1.54, -0.01], w: 0.22, h: 0.17 },
    ],
    { bone: [hips, spine], color: torsoPaint, sides: 10, name: "torso" },
  );
  const torsoSurf = b.surface(torso);

  // chest emblem: gold cross patée
  const crest = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M24 4 L40 4 L35 28 L60 24 L60 40 L35 36 L40 60 L24 60 L29 36 L4 40 L4 24 L29 28 Z"
        fill="#e2b043" stroke="#5a3a10" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="32" cy="32" r="6" fill="#b8242e" stroke="#5a3a10" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );
  b.decal(torso, crest, { at: [0, 1.24, 0.2], dir: [0, 0, 1], size: [0.17, 0.17], name: "chestCrest" });

  // belt
  const beltPath = torsoSurf.loop([0, 1.04, 0], { lift: 0.012 });
  b.sweep(beltPath, () => [0.012, 0.026], { section: "box", color: LEATHER, bone: hips, name: "belt" });
  b.along(torsoSurf.loop([0, 1.04, 0], { lift: 0.026 }), 18, (at) => {
    if (Math.abs(at.at.x) < 0.05 && at.at.z > 0) return;
    b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD, { at, bone: hips });
  });
  b.part(new THREE.BoxGeometry(0.07, 0.066, 0.02), GOLD, { at: [0, 1.04, 0.122], bone: hips, flat: true, name: "buckle" });
  b.part(new THREE.BoxGeometry(0.036, 0.032, 0.024), LEATHER_DK, { at: [0, 1.04, 0.122], bone: hips, name: "buckleHole" });

  // faulds (hip lames)
  for (let i = 0; i < 3; i++) {
    const y = 0.94 - i * 0.055;
    const rT = 0.165 + i * 0.017;
    const rB = rT + 0.02;
    b.part(new THREE.CylinderGeometry(rT, rB, 0.065, 12), steel, {
      at: [0, y, 0],
      bone: hips,
      scale: [1, 1, 0.82],
      flat: true,
      name: `fauld${i}`,
    });
    b.part(new THREE.CylinderGeometry(rB + 0.003, rB + 0.003, 0.012, 12), GOLD, {
      at: [0, y - 0.0265, 0],
      bone: hips,
      scale: [1, 1, 0.82],
      flat: true,
      name: `fauldTrim${i}`,
    });
  }

  // tabard front panel with dagged hem
  const ty = new THREE.Vector3(0, 1, -0.38).normalize();
  const tabardOutline: OutlinePoint[] = [
    [-0.12, 0],
    [0.12, 0],
    [0.13, -0.36, "sharp"],
    [0.09, -0.42, "sharp"],
    [0.045, -0.36, "sharp"],
    [0, -0.42, "sharp"],
    [-0.045, -0.36, "sharp"],
    [-0.09, -0.42, "sharp"],
    [-0.13, -0.36, "sharp"],
  ];
  const tabardPaint = paint((_p, _n, s) => {
    if (s[1] < -0.33 || Math.abs(s[0]) > 0.108) return GOLD;
    if (Math.abs(s[0]) < 0.024) return RED;
    return BLUE;
  });
  b.extrude(tabardOutline, {
    at: [0, 1.04, 0.115],
    x: [1, 0, 0],
    y: [ty.x, ty.y, ty.z],
    thickness: 0.012,
    bevel: 0.003,
    color: tabardPaint,
    bone: hips,
    name: "tabard",
  });

  // ---------------- Neck & gorget ----------------
  b.sweep(neck, 0.065, { color: mail, name: "neckMail" });
  b.lathe(
    [
      [0.165, 0],
      [0.18, 0],
      [0.115, 0.09],
      [0.1, 0.09],
    ],
    { at: [0, 1.46, -0.005], segments: 10, color: steel, bone: chest, name: "gorgetLow" },
  );
  b.lathe(
    [
      [0.115, 0],
      [0.128, 0],
      [0.092, 0.085],
      [0.08, 0.085],
    ],
    { at: [0, 1.53, -0.005], segments: 10, color: steel, bone: neck.joints[0], name: "gorgetHigh" },
  );
  b.part(new THREE.TorusGeometry(0.17, 0.009, 4, 10), GOLD, {
    at: [0, 1.465, -0.005],
    dir: [0, 1, 0],
    axis: "z",
    bone: chest,
    flat: true,
    name: "gorgetTrim",
  });

  // ---------------- Helmet ----------------
  const helm = b.lathe(
    [
      [0, 0],
      [0.118, 0],
      [0.126, 0.02],
      [0.126, 0.16],
      [0.11, 0.215],
      [0.07, 0.252],
      [0, 0.265],
    ],
    { at: [0, 1.58, 0], segments: 10, color: steel, bone: head, name: "helm" },
  );
  b.part(new THREE.TorusGeometry(0.124, 0.01, 4, 10), GOLD, {
    at: [0, 1.588, 0],
    dir: [0, 1, 0],
    axis: "z",
    bone: head,
    flat: true,
    name: "helmRim",
  });
  // ridge over the crown
  b.sweep(
    b.surface(helm).drape(
      catmull([
        [0, 1.8, 0.12],
        [0, 1.83, 0.07],
        [0, 1.848, 0],
        [0, 1.83, -0.07],
        [0, 1.76, -0.125],
      ]),
      { lift: 0.003 },
    ),
    0.008,
    { color: GOLD, bone: head, sides: 6, name: "helmRidge" },
  );

  for (const s of [1, -1]) {
    const nrm = new THREE.Vector3(s * 0.09, 0, 0.112).normalize();
    // dark eye-slit backing
    b.slab(
      [
        [0, 1.7, 0.138],
        [s * 0.11, 1.7, 0.052],
        [s * 0.11, 1.748, 0.052],
        [0, 1.748, 0.138],
      ],
      { color: VOID, thickness: 0.01, bone: head, name: `slit${s > 0 ? "L" : "R"}` },
    );
    // lower face plate (jaw)
    b.slab(
      [
        [0, 1.6, 0.152],
        [s * 0.112, 1.6, 0.062],
        [s * 0.112, 1.706, 0.062],
        [0, 1.706, 0.152],
      ],
      { color: steel, thickness: 0.014, bone: jaw, name: `faceplate${s > 0 ? "L" : "R"}` },
    );
    // upper visor (brow)
    b.slab(
      [
        [0, 1.737, 0.152],
        [s * 0.112, 1.737, 0.062],
        [s * 0.112, 1.795, 0.062],
        [0, 1.795, 0.152],
      ],
      { color: steel, thickness: 0.014, bone: visor, name: `visor${s > 0 ? "L" : "R"}` },
    );
    // breath holes
    for (const u of [0.35, 0.55, 0.75])
      for (const y of [1.625, 1.65, 1.675]) {
        const p = lerp([0, y, 0.152], [s * 0.112, y, 0.062], u);
        b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 6), VOID, {
          at: add(p, nrm, 0.007),
          dir: [nrm.x, nrm.y, nrm.z],
          bone: jaw,
        });
      }
  }
  // gold edge on the visor ridge
  b.rod([0, 1.737, 0.162], [0, 1.795, 0.162], 0.006, { color: GOLD, bone: visor, sides: 6, name: "visorRidge" });
  b.rod([0, 1.6, 0.162], [0, 1.706, 0.162], 0.006, { color: GOLD, bone: jaw, sides: 6, name: "jawRidge" });

  // coronet
  b.part(new THREE.TorusGeometry(0.127, 0.011, 4, 10), GOLD, {
    at: [0, 1.745, 0],
    dir: [0, 1, 0],
    axis: "z",
    bone: head,
    flat: true,
    name: "coronet",
  });
  const crown = b.ring(frame([0, 1.745, 0], [0, 1, 0]), { count: 8, radius: 0.128 });
  crown.items.forEach((item, i) => {
    if (i === 0) return; // the visor sits at the front
    b.spike(item, [0, 1, 0], 0.055, 0.016, { color: GOLD, bone: head, sides: 4 });
    b.part(new THREE.OctahedronGeometry(0.011), i % 2 ? RED : BLUE, {
      at: item.local([0, 0.009, 0]),
      bone: head,
      flat: true,
    });
  });

  // plume
  b.rod([0, 1.83, -0.03], [0, 1.88, -0.03], 0.022, { color: GOLD, bone: head, sides: 6, name: "plumeHolder" });
  const plumes: [number, string, number][] = [
    [0, RED, 1],
    [0.045, WHITE, 0.75],
    [-0.045, WHITE, 0.75],
  ];
  for (const [x, col, k] of plumes) {
    const start = [0, 1.875, -0.03];
    const end = [x * 1.3, 1.78 + (1 - k) * 0.05, -0.42 * k - 0.03];
    const path = catmull([start, [x * 0.5, 2.0 - (1 - k) * 0.06, -0.12], [x, 1.97 - (1 - k) * 0.05, -0.3 * k], end]);
    b.sweep(path, [0.02 * k, 0.05 * k, 0.04 * k, 0.008], {
      color: col === RED ? gradient(RED, RED_DK, start, end) : gradient(WHITE, "#c9c2b2", start, end),
      bone: head,
      sides: 6,
      caps: { start: "round", end: "point" },
      name: `plume${col === RED ? "C" : x > 0 ? "L" : "R"}`,
    });
  }

  // ---------------- Arms ----------------
  for (const s of [1, -1]) {
    const N = s > 0 ? "L" : "R";
    const sh = [s * 0.2, 1.43, 0];
    const el = [s * 0.46, 1.42, -0.01];
    const wr = [s * 0.7, 1.42, 0];
    const clav = b.joint(`clavicle${N}`, { parent: chest, at: [s * 0.04, 1.46, 0], aim: sh });
    const arm = b.chain(`arm${N}`, polyline([sh, el, wr]), {
      parent: clav,
      names: [`shoulder${N}`, `elbow${N}`, `hand${N}`],
      role: "arm",
    });
    const shoulderJ = arm.joints[0];
    const elbowJ = arm.joints[1];
    const hand = arm.tip!;

    b.sweep(polyline([sh, el, wr]), 0.05, { bone: arm, color: mail, name: `armMail${N}` });
    // rerebrace
    b.sweep(polyline([lerp(sh, el, 0.12), lerp(sh, el, 0.85)]), [0.064, 0.058], {
      bone: shoulderJ, color: steel, sides: 8, caps: "flat", name: `rerebrace${N}`,
    });
    b.rod(lerp(sh, el, 0.8), lerp(sh, el, 0.84), 0.066, { color: GOLD, bone: shoulderJ, sides: 8 });
    // vambrace
    b.sweep(polyline([lerp(el, wr, 0.15), lerp(el, wr, 0.92)]), [0.056, 0.047], {
      bone: elbowJ, color: steel, sides: 8, caps: "flat", name: `vambrace${N}`,
    });
    // couter + rondel
    b.part(new THREE.SphereGeometry(0.062, 8, 6), steel, { at: el, bone: elbowJ, flat: true, name: `couter${N}` });
    b.part(new THREE.CylinderGeometry(0.066, 0.066, 0.012, 8), steel, {
      at: add(el, [0, 0, -1], 0.058), dir: [0, 0, -1], bone: elbowJ, flat: true,
    });
    b.part(new THREE.TorusGeometry(0.064, 0.006, 4, 8), GOLD, {
      at: add(el, [0, 0, -1], 0.065), dir: [0, 0, -1], axis: "z", bone: elbowJ, flat: true,
    });
    b.part(new THREE.SphereGeometry(0.018, 6, 4), GOLD, { at: add(el, [0, 0, -1], 0.066), bone: elbowJ });

    // pauldron
    const ax = new THREE.Vector3(s * 0.45, 1, 0).normalize();
    const pA = V([s * 0.22, 1.47, 0]);
    b.lathe(
      [
        [0, 0.1],
        [0.06, 0.095],
        [0.11, 0.06],
        [0.13, 0],
        [0.115, 0],
        [0.095, 0.05],
        [0.05, 0.075],
        [0, 0.08],
      ],
      { at: pA, axis: ax, segments: 10, color: steel, bone: shoulderJ, name: `pauldron${N}` },
    );
    for (let i = 1; i <= 2; i++) {
      const r = 0.128 + i * 0.012;
      b.lathe(
        [
          [r, 0],
          [r + 0.012, 0],
          [r + 0.005, 0.035],
          [r - 0.007, 0.035],
        ],
        { at: add(pA, ax, -0.032 * i), axis: ax, segments: 10, color: steel, bone: shoulderJ, name: `pauldronLame${N}${i}` },
      );
    }
    b.part(new THREE.TorusGeometry(0.129, 0.009, 4, 10), GOLD, {
      at: pA, dir: [ax.x, ax.y, ax.z], axis: "z", bone: shoulderJ, flat: true, name: `pauldronTrim${N}`,
    });
    for (const it of b.ring(frame(add(pA, ax, 0.034), [ax.x, ax.y, ax.z]), { count: 8, radius: 0.12 }).items)
      b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, { at: it, bone: shoulderJ });
    // besagew (armpit rondel)
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.01, 8), GOLD, {
      at: [s * 0.2, 1.37, 0.11], dir: [0, 0, 1], bone: shoulderJ, flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 8), steel, {
      at: [s * 0.2, 1.37, 0.115], dir: [0, 0, 1], bone: shoulderJ, flat: true,
    });

    // gauntlet
    b.lathe(
      [
        [0.046, 0],
        [0.055, 0],
        [0.079, 0.1],
        [0.07, 0.1],
      ],
      { at: [s * 0.695, 1.42, 0], axis: [-s, 0, 0], segments: 8, color: steel, bone: hand, name: `cuff${N}` },
    );
    b.part(new THREE.TorusGeometry(0.075, 0.006, 4, 8), GOLD, {
      at: [s * 0.597, 1.42, 0], dir: [s, 0, 0], axis: "z", bone: hand, flat: true,
    });
    b.part(new THREE.BoxGeometry(0.1, 0.036, 0.095), steel, { at: [s * 0.745, 1.42, 0], bone: hand, flat: true, name: `palm${N}` });
    b.part(new THREE.BoxGeometry(0.024, 0.014, 0.1), GOLD, { at: [s * 0.787, 1.437, 0], bone: hand, flat: true });

    const fz = [0.033, 0.011, -0.011, -0.033];
    const fl = [0.075, 0.085, 0.08, 0.065];
    fz.forEach((z, i) => {
      const base = [s * 0.79, 1.42, z];
      const ch = b.chain(
        `finger${i + 1}${N}`,
        polyline([base, [s * (0.79 + fl[i] * 0.55), 1.42, z * 1.08], [s * (0.79 + fl[i]), 1.42, z * 1.15]]),
        { parent: hand, names: [`finger${i + 1}a${N}`, `finger${i + 1}b${N}`], role: "digit" },
      );
      b.sweep(ch, [0.0115, 0.009], { section: "box", skin: "rigid", caps: "flat", color: steel });
    });
    const th = b.chain(
      `thumb${N}`,
      polyline([
        [s * 0.735, 1.415, 0.045],
        [s * 0.76, 1.41, 0.078],
        [s * 0.78, 1.41, 0.105],
      ]),
      { parent: hand, names: [`thumbA${N}`, `thumbB${N}`], role: "digit" },
    );
    b.sweep(th, [0.012, 0.0095], { section: "box", skin: "rigid", caps: "flat", color: steel });
  }

  // ---------------- Legs ----------------
  for (const s of [1, -1]) {
    const N = s > 0 ? "L" : "R";
    const x = s * 0.12;
    const hp = [s * 0.1, 0.9, 0];
    const kn = [s * 0.115, 0.52, 0.03];
    const an = [x, 0.11, -0.02];
    const toe = [x, 0.045, 0.17];
    const leg = b.chain(`leg${N}`, polyline([hp, kn, an, toe]), {
      parent: hips,
      names: [`hip${N}`, `knee${N}`, `foot${N}`, `toe${N}`],
      role: "leg",
      contact: [x, 0, 0.05],
    });
    const hipJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const footJ = leg.joints[2];
    const toeJ = leg.joints[3];

    b.sweep(polyline([hp, kn, an]), [0.072, 0.05], { bone: leg, color: mail, name: `legMail${N}` });
    // cuisse
    b.sweep(polyline([lerp(hp, kn, 0.08), lerp(hp, kn, 0.86)]), [0.082, 0.066], {
      bone: hipJ, color: steel, sides: 8, caps: "flat", name: `cuisse${N}`,
    });
    b.rod(lerp(hp, kn, 0.82), lerp(hp, kn, 0.86), 0.069, { color: GOLD, bone: hipJ, sides: 8 });
    // poleyn + rondel
    b.part(new THREE.SphereGeometry(0.068, 8, 6), steel, { at: add(kn, [0, 0, 1], 0.012), bone: kneeJ, flat: true, name: `poleyn${N}` });
    b.part(new THREE.CylinderGeometry(0.056, 0.056, 0.012, 8), steel, {
      at: add(kn, [s, 0, 0], 0.066), dir: [s, 0, 0], bone: kneeJ, flat: true,
    });
    b.part(new THREE.TorusGeometry(0.055, 0.006, 4, 8), GOLD, {
      at: add(kn, [s, 0, 0], 0.073), dir: [s, 0, 0], axis: "z", bone: kneeJ, flat: true,
    });
    b.part(new THREE.SphereGeometry(0.016, 6, 4), GOLD, { at: add(kn, [s, 0, 0], 0.074), bone: kneeJ });
    // greave
    b.sweep(polyline([lerp(kn, an, 0.12), lerp(kn, an, 0.96)]), [0.058, 0.064, 0.048], {
      bone: kneeJ, color: steel, sides: 8, caps: "flat", name: `greave${N}`,
    });
    b.rod(add(lerp(kn, an, 0.18), [0, 0, 1], 0.064), add(lerp(kn, an, 0.9), [0, 0, 1], 0.05), 0.007, {
      color: GOLD, bone: kneeJ, sides: 6,
    });

    // sabaton lames
    const zs = [-0.075, -0.025, 0.025, 0.07, 0.11, 0.15, 0.2];
    const hs = [0.13, 0.12, 0.1, 0.08, 0.066, 0.052, 0.036];
    const ws = [0.1, 0.106, 0.11, 0.11, 0.1, 0.085, 0.06];
    for (let i = 0; i < zs.length - 1; i++) {
      b.frustumBox(
        [x, hs[i] / 2 + 0.012, zs[i]],
        [x, hs[i + 1] / 2 + 0.012, zs[i + 1] + 0.012],
        [ws[i], hs[i]],
        [ws[i + 1], hs[i + 1]],
        { color: steel, bone: i < 4 ? footJ : toeJ, name: `sabaton${N}${i}` },
      );
    }
    b.part(new THREE.BoxGeometry(0.03, 0.014, 0.025), GOLD, { at: [x, 0.028, 0.212], bone: toeJ, flat: true });
    b.frustumBox([x, 0.008, -0.085], [x, 0.008, 0.2], [0.1, 0.016], [0.06, 0.016], {
      color: LEATHER_DK, bone: footJ, name: `sole${N}`,
    });
    // spur
    b.rod([x, 0.075, -0.08], [x, 0.075, -0.135], 0.007, { color: GOLD, bone: footJ, sides: 6 });
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.006, 6), GOLD, {
      at: [x, 0.075, -0.145], dir: [1, 0, 0], bone: footJ, flat: true, name: `rowel${N}`,
    });
  }

  // ---------------- Sword at the left hip ----------------
  const M = V([0.26, 0.98, 0.1]);
  const d = new THREE.Vector3(0.05, -0.95, -0.3).normalize();
  const c = new THREE.Vector3().crossVectors(d, new THREE.Vector3(1, 0, 0)).normalize();
  b.sweep(polyline([M, add(M, d, 0.8)]), 0.024, {
    bone: hips, color: LEATHER_DK, section: { ngon: 6 }, caps: "flat", name: "scabbard",
  });
  b.rod(add(M, d, 0.0), add(M, d, 0.06), 0.028, { color: GOLD, bone: hips, section: { ngon: 6 } });
  b.rod(add(M, d, 0.38), add(M, d, 0.41), 0.027, { color: GOLD, bone: hips, section: { ngon: 6 } });
  b.spike(add(M, d, 0.8), [d.x, d.y, d.z], 0.07, 0.026, { color: GOLD, bone: hips, sides: 6, name: "chape" });
  const cg = add(M, d, -0.015);
  b.rod(add(cg, c, -0.12), add(cg, c, 0.12), 0.012, { color: GOLD, bone: hips, sides: 6, name: "crossguard" });
  for (const k of [-1, 1]) b.part(new THREE.SphereGeometry(0.018, 6, 4), GOLD, { at: add(cg, c, k * 0.125), bone: hips, flat: true });
  b.rod(add(M, d, -0.025), add(M, d, -0.17), 0.016, { color: LEATHER, bone: hips, sides: 6, name: "grip" });
  for (const k of [0.06, 0.1, 0.14]) b.rod(add(M, d, -k), add(M, d, -k - 0.008), 0.018, { color: GOLD, bone: hips, sides: 6 });
  b.part(new THREE.IcosahedronGeometry(0.032, 0), GOLD, { at: add(M, d, -0.2), bone: hips, flat: true, name: "pommel" });
  b.part(new THREE.OctahedronGeometry(0.014), RED, { at: add(add(M, d, -0.2), [0, 0, 1], 0.026), bone: hips, flat: true });
  b.rod([0.14, 1.03, 0.06], M, 0.012, { color: LEATHER, bone: hips, sides: 6, name: "frog" });

  // ---------------- Shield on the back ----------------
  const shieldOut: OutlinePoint[] = [
    [-0.24, 0.2, "sharp"],
    [0.24, 0.2, "sharp"],
    [0.235, 0],
    [0.17, -0.2],
    [0, -0.36, "sharp"],
    [-0.17, -0.2],
    [-0.235, 0],
  ];
  const innerPoly = [
    [-0.24, 0.2],
    [0.24, 0.2],
    [0.235, 0],
    [0.17, -0.2],
    [0, -0.36],
    [-0.17, -0.2],
    [-0.235, 0],
  ].map(([px, py]) => [px * 0.86, -0.02 + (py + 0.02) * 0.86]);
  const thick = new THREE.Vector3(0, 0, -1);
  const shieldPaint = paint((_p, n, s) => {
    const dd = n.dot(thick);
    if (Math.abs(dd) < 0.5) return GOLD;
    if (dd < 0) return WOOD;
    if (!inPoly(s[0], s[1], innerPoly)) return GOLD;
    if (Math.abs(s[0]) < 0.022 || Math.abs(s[1] - 0.03) < 0.022) return GOLD;
    return s[0] > 0 === s[1] > 0.03 ? BLUE : RED;
  });
  const shield = b.extrude(shieldOut, {
    at: [0, 1.24, -0.175],
    x: [-1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    bevel: 0.008,
    smoothing: 1,
    color: shieldPaint,
    bone: chest,
    name: "shield",
  });
  b.part(new THREE.SphereGeometry(0.036, 8, 6), GOLD, {
    at: shield.local([0, 0.03, 0.015]),
    bone: chest,
    scale: [1, 1, 0.5],
    flat: true,
    name: "shieldBoss",
  });
  for (const sx of [1, -1])
    for (const sy of [1.36, 1.12])
      b.part(new THREE.BoxGeometry(0.04, 0.03, 0.075), LEATHER, { at: [sx * 0.12, sy, -0.128], bone: chest });

  return b.root;
}
