import * as THREE from "three";
import { createBuilder, frame, paint, gradient, catmull, spiral } from "../../../../src/index";

export const meta = {
  name: "Lined Seahorse on Seagrass",
  description:
    "A yellow lined seahorse with a crown of spikes, tube snout, fluttering dorsal fin and big eyes, gripping a strand of seagrass with its curled tail.",
};

const YELLOW = "#f6c21c";
const YELLOW2 = "#eba912";
const PALE = "#fde58b";
const DARK = "#5b3a12";
const WHITE = "#fffcee";
const GOLD = "#c98a0c";
const AMBER = "#e07d1c";
const FINPALE = "#fff0b0";
const EYE = "#f0902a";
const PUPIL = "#150e06";
const GRASS_D = "#2b7a3d";
const GRASS_L = "#5cc05a";
const SAND = "#e9d6a6";
const PEBBLE = "#bfae8a";
const PEBBLE2 = "#9c8f78";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const frac = (x: number) => ((x % 1) + 1) % 1;

export default function build() {
  const b = createBuilder({ name: "seahorse" });

  // ---------- body path (head -> tail start -> helix around the grass) ----------
  const neckTopP = [0, 0.318, 0.01];
  const neckP = [0, 0.285, 0.022];
  const chestP = [0, 0.235, 0.048];
  const bellyP = [0, 0.19, 0.045];
  const lowP = [0, 0.145, 0.015];
  const tailStartP = [0, 0.115, -0.012];
  const trunkPath = catmull([neckTopP, neckP, chestP, bellyP, lowP, tailStartP]);
  const grassX = 0, grassZ = -0.04;
  const helix = spiral([grassX, 0.115, grassZ], tailStartP, [0, -1, 0], { turns: 1.7, r1: 0.0135, pitch: 0.022 });
  const full = trunkPath.concat(helix);
  const body = full.slice(1, 0); // tail tip -> head

  const core = b.joint("core", { at: chestP, role: "spine" });
  const rootT = body.closestT(V(chestP[0], chestP[1], chestP[2]));
  const tts = body.closestT(V(tailStartP[0], tailStartP[1], tailStartP[2]));

  const neck = b.chain("neck", body.slice(rootT, 1), { parent: core, count: 3, role: "neck" });
  const trunk = b.chain("trunk", body.slice(rootT, tts), { parent: core, count: 3, role: "spine" });
  const tail = b.chain("tail", body.slice(tts, 0), {
    parent: trunk.joints[trunk.joints.length - 1],
    count: 14,
    role: "tail",
  });

  // ---------- radius profile ----------
  const tOf = (p: number[]) => body.closestT(V(p[0], p[1], p[2]));
  const keys: [number, number][] = [
    [0, 0.0035],
    [tts * 0.5, 0.0065],
    [tts, 0.011],
    [tOf(lowP), 0.021],
    [tOf(bellyP), 0.036],
    [tOf(chestP), 0.034],
    [tOf(neckP), 0.02],
    [1, 0.017],
  ];
  keys.sort((a, c) => a[0] - c[0]);
  const R = (t: number) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, r0] = keys[i - 1];
        const [t1, r1] = keys[i];
        const k = t1 > t0 ? (t - t0) / (t1 - t0) : 0;
        return r0 + (r1 - r0) * k;
      }
    }
    return keys[keys.length - 1][1];
  };
  const radius = (t: number): [number, number] => [R(t) * 0.85, R(t) * 1.05];

  // ---------- paint: thin dark lines, pale belly, white freckles ----------
  const nRings = Math.round(body.length / 0.011);
  const bodyPaint = paint((p, _n, s) => {
    if (frac(s[0] * nRings) < 0.15) return DARK;
    const deg = frac(s[1] / 360) * 360;
    const f = Math.sin(p.y * 260 + p.z * 130 + p.x * 90) * Math.sin(p.z * 250 - p.y * 90 + p.x * 300);
    if (f > 0.9) return WHITE;
    if (deg > 125 && deg < 235) return PALE;
    return Math.sin(p.y * 60 + p.z * 40) > 0.4 ? YELLOW2 : YELLOW;
  });

  b.sweep(body, radius, {
    bone: [tail, trunk, core, neck],
    color: bodyPaint,
    section: { ngon: 8 },
    caps: "round",
  });

  // ---------- dorsal ridge spikes ----------
  const tA = tOf(lowP);
  for (let i = 0; i < 10; i++) {
    const t = tA + ((0.93 - tA) * i) / 9;
    const p = body.at(t);
    const T = body.tangentAt(t);
    const back = new THREE.Vector3().crossVectors(T, V(1, 0, 0)).normalize();
    const pos = p.clone().addScaledVector(back, radius(t)[1] * 0.9);
    const dir = back.clone().addScaledVector(T, 0.35).normalize();
    b.spike(pos, dir, 0.014 - i * 0.0004, 0.0055, { color: GOLD, sides: 5 });
  }

  // ---------- head ----------
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: neckTopP,
    dir: [0, -0.3, 1],
    role: "head",
  });
  const D = V(0, -0.3, 1).normalize();
  const C = V(0, 0.334, 0.022);
  const snoutBase = C.clone().addScaledVector(D, 0.018);
  const tip = C.clone().addScaledVector(D, 0.1);

  b.part(new THREE.SphereGeometry(0.027, 10, 7), YELLOW, {
    bone: head,
    at: C,
    scale: [0.85, 1, 1.12],
    flat: true,
  });
  const snoutPaint = paint((_p, _n, s) => (frac(s[0] * 5) < 0.13 ? DARK : YELLOW));
  b.rod(snoutBase, tip, [0.014, 0.0085], { bone: head, color: snoutPaint, sides: 6 });
  b.part(new THREE.SphereGeometry(0.0065, 6, 4), DARK, { bone: head, at: tip.clone().addScaledVector(D, -0.001) });

  const jawPos = tip.clone().addScaledVector(D, -0.03).add(V(0, -0.011, 0));
  const jaw = b.joint("jaw", { parent: head, at: jawPos, aim: jawPos.clone().add(D), role: "jaw" });
  b.rod(jawPos, jawPos.clone().addScaledVector(D, 0.032), [0.005, 0.0035], {
    bone: jaw,
    color: YELLOW2,
    sides: 6,
  });

  // crown of spikes
  const crownBase = C.clone().add(V(0, 0.022, -0.006));
  b.spike(crownBase, [0, 1, 0], 0.036, 0.0075, { bone: head, color: GOLD, sides: 6 });
  b.ring(frame(crownBase, [0, 1, 0]), { count: 6, radius: 0.012, tilt: 28 }, (item) =>
    b.spike(item, item, 0.03, 0.0062, { bone: head, color: GOLD, sides: 6 }),
  );

  // eyes, brows, cheek spines
  for (const s of [1, -1]) {
    const out = V(s * 0.8, 0.1, 0.55).normalize();
    const ePos = C.clone().add(V(s * 0.021, 0.008, 0.012));
    b.part(new THREE.SphereGeometry(0.0125, 8, 6), EYE, { bone: head, at: ePos, dir: out });
    b.part(new THREE.SphereGeometry(0.0085, 8, 6), PUPIL, {
      bone: head,
      at: ePos.clone().addScaledVector(out, 0.0058),
    });
    b.part(new THREE.SphereGeometry(0.0028, 5, 4), WHITE, {
      bone: head,
      at: ePos.clone().addScaledVector(out, 0.0118).add(V(-s * 0.003, 0.004, 0.002)),
    });
    b.spike(ePos.clone().add(V(0, 0.011, -0.002)), V(s * 0.2, 1, -0.2).normalize(), 0.014, 0.0045, {
      bone: head,
      color: GOLD,
      sides: 5,
    });
    b.spike(C.clone().add(V(s * 0.017, -0.012, -0.012)), V(s * 0.6, -0.4, -0.7).normalize(), 0.016, 0.0045, {
      bone: head,
      color: GOLD,
      sides: 5,
    });
  }

  // ---------- fins ----------
  const dorsal = b.joint("dorsalFin", { parent: core, at: [0, 0.18, -0.01], dir: [0, 1, 0], role: "fan" });
  const finOutline: [number, number][] = [
    [-0.015, 0],
    [0.02, -0.003],
    [0.044, 0.01],
    [0.036, 0.024],
    [0.05, 0.038],
    [0.04, 0.052],
    [0.045, 0.066],
    [0.03, 0.078],
    [-0.01, 0.088],
    [-0.04, 0.088],
    [-0.03, 0.04],
  ];
  const finPaint = paint((_p, _n, s) => {
    const a = Math.atan2(s[1], s[0] + 0.04);
    return frac(a * 9) < 0.22 ? AMBER : FINPALE;
  });
  b.extrude(finOutline, {
    at: [0, 0.14, -0.01],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.003,
    color: finPaint,
    bone: dorsal,
  });

  const pecOutline: [number, number][] = [
    [0, -0.004],
    [0.012, -0.008],
    [0.024, -0.002],
    [0.026, 0.01],
    [0.016, 0.02],
    [0.002, 0.014],
  ];
  for (const s of [1, -1]) {
    const pj = b.joint(`pectoral${s > 0 ? "L" : "R"}`, {
      parent: core,
      at: [s * 0.02, 0.268, 0.012],
      dir: [s * 0.5, 0.3, -0.8],
      role: "fan",
    });
    b.extrude(pecOutline, {
      at: [s * 0.02, 0.268, 0.012],
      x: [0, 0, -1],
      y: [s * 0.35, 1, 0],
      thickness: 0.002,
      color: finPaint,
      bone: pj,
    });
  }

  // ---------- seagrass, sand ----------
  const bladeR = (w: number) => (t: number): [number, number] => [w * (1 - t * 0.6) + 0.002, 0.0028];
  const bladeColor = gradient(GRASS_D, GRASS_L, [0, 0, 0], [0, 0.45, 0]);
  const blades: { pts: number[][]; w: number }[] = [
    { pts: [[0, 0.005, -0.04], [0, 0.1, -0.04], [0, 0.2, -0.04], [0.006, 0.3, -0.045], [0.03, 0.4, -0.06], [0.06, 0.47, -0.075]], w: 0.009 },
    { pts: [[0.03, 0.005, -0.07], [0.035, 0.12, -0.075], [0.02, 0.26, -0.085], [-0.02, 0.36, -0.1]], w: 0.011 },
    { pts: [[-0.03, 0.005, -0.055], [-0.04, 0.1, -0.05], [-0.06, 0.2, -0.055], [-0.09, 0.28, -0.07]], w: 0.01 },
    { pts: [[0.02, 0.005, -0.02], [0.05, 0.07, -0.02], [0.09, 0.13, -0.03]], w: 0.008 },
  ];
  for (const bl of blades)
    b.sweep(catmull(bl.pts), bladeR(bl.w), { bone: core, color: bladeColor, sides: 6, caps: "point" });

  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.095, 0.01],
      [0.06, 0.022],
      [0.02, 0.03],
      [0, 0.03],
    ],
    { at: [0, 0, -0.045], bone: core, color: SAND, segments: 10, smoothing: 1 },
  );
  const peb: [number, number, number, number, string][] = [
    [0.07, 0.01, -0.02, 0.014, PEBBLE],
    [-0.065, 0.008, -0.07, 0.011, PEBBLE2],
    [0.03, 0.008, 0.03, 0.009, PEBBLE2],
    [-0.04, 0.007, 0.02, 0.008, PEBBLE],
  ];
  for (const [x, y, z, r, c] of peb)
    b.part(new THREE.SphereGeometry(r, 6, 4), c, { bone: core, at: [x, y, z], scale: [1, 0.6, 1], flat: true });

  return b.root;
}
