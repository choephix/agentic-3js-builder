import * as THREE from "three";
import {
  catmull,
  cells,
  createBuilder,
  gradient,
  grain,
  mix,
  mottle,
  paint,
  resolve,
  smoothstep,
} from "../../../../src/index";
import type { Chain, ColorInput } from "../../../../src/index";

const SUN = "#ffd21a"; // body yellow
const AMBER = "#f29a0b"; // bony ridge rings
const LINE = "#4a3212"; // thin dark lines between ridges
const FRECKLE = "#fffbe8";
const EYE = "#fffdf5";
const PUPIL = "#1e1230";
const SPIKE = "#f0a010";
const MOUTH = "#2a180c";
const SIDE_FIN = "#fff2bf";
const BLADE = "#8fd06a";
const FIN_ROOT = "#ffc21a";
const FIN_TIP = "#fff8df";
const GRASS_DARK = "#2e7d3b";
const GRASS_LIGHT = "#7cc65a";
const SAND_A = "#f0dca8";
const SAND_B = "#d6b57a";

export const meta = {
  name: "Sunny seahorse on seagrass",
  description:
    "A ridged yellow seahorse with thin dark lines and white freckles, a crown of spikes, a tube snout, a fluttering dorsal fin and big eyes, its curled tail wrapped around a strand of seagrass.",
};

/** Linear profile through keys spread evenly over t in [0, 1]. */
function profile(keys: readonly number[], t: number) {
  const x = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(x), keys.length - 2);
  return keys[i] + (keys[i + 1] - keys[i]) * (x - i);
}

/** Yellow with a thin dark line where each ridge meets the next, counted along the sweep's own length. */
function plated(ridges: number, from: number, to: number) {
  const period = (to - from) / ridges;
  return paint((_p, _n, s) => {
    const u = (s[0] - from) / period;
    const edge = Math.abs(u - Math.round(u));
    return mix(SUN, LINE, 1 - smoothstep(0.04, 0.085, edge));
  });
}

/** `base` with small white freckles: about `share` of the cells carry one. */
function freckled(base: ColorInput, size: number, seed: number, share: number) {
  return paint((p, n) => {
    const c = cells(p, size, seed);
    if (c.id > share) return base;
    const r = 0.14 + 0.08 * ((c.id * 37) % 1);
    return mix(resolve(base, p, n), FRECKLE, smoothstep(r + 0.03, r - 0.03, c.d1));
  });
}

export default function seahorse() {
  const b = createBuilder({ name: "seahorse", paintSize: 2048 });

  // ---- Skeleton: pelvis root, trunk to the neck, neck to the head, tail curled round the grass ----
  b.joint("hips", { at: [0, 0.078, 0] });
  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 0.078, 0],
      [0, 0.1, 0.009],
      [0, 0.124, 0.011],
      [0, 0.146, 0.008],
      [0, 0.163, 0],
    ]),
    { parent: "hips", names: ["abdomen", "belly", "chest", "shoulder", "neckBase"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.163, 0],
      [0, 0.178, 0.012],
      [0, 0.19, 0.03],
    ]),
    { parent: "neckBase", names: ["neck1", "neck2", "head"], role: "neck" },
  );
  const tailPath: number[][] = [[0, 0.078, 0]];
  for (let k = 0; k <= 12; k++) {
    const u = k / 12;
    const phi = 0.45 + 2 * Math.PI * 1.1 * u;
    const R = 0.022 - 0.006 * u;
    tailPath.push([R * Math.sin(phi), 0.062 - 0.022 * u, -0.04 + R * Math.cos(phi)]);
  }
  const tail = b.chain("tail", catmull(tailPath), {
    parent: "hips",
    count: 5,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
    role: "tail",
  });

  // ---- Body: a faceted, ridged trunk and a round tail ----
  const bodyPaint = (ridges: number, from: number, to: number) =>
    freckled(plated(ridges, from, to), 0.016, 4, 0.18);
  const trunkR = (t: number) => profile([0.0115, 0.0165, 0.0185, 0.0165, 0.0105], t);
  const tailR = (t: number) => 0.0095 - 0.006 * t ** 1.3;
  b.sweep(trunk, trunkR, { color: bodyPaint(7, 0.04, 0.97), section: { ngon: 8 }, name: "trunk" });
  b.sweep(tail, tailR, { color: bodyPaint(9, 0.08, 0.97), name: "tail" });
  b.sweep(neck, [0.0102, 0.0095, 0.009], { color: SUN, name: "neck" });

  /** A bony ridge: a torus lying round the body at chain point t. */
  const ridge = (chain: Chain, t: number, r: number, tube: number) => {
    const geometry = new THREE.TorusGeometry(r * 0.95, tube, 5, 14);
    geometry.rotateX(Math.PI / 2);
    b.part(geometry, AMBER, { frame: chain.at(t), name: "ridge" });
  };
  for (let i = 0; i < 7; i++) {
    const t = 0.04 + ((i + 0.5) * 0.93) / 7;
    ridge(trunk, t, trunkR(t), 0.0026);
  }
  for (let i = 0; i < 9; i++) {
    const t = 0.08 + ((i + 0.5) * 0.89) / 9;
    ridge(tail, t, tailR(t), 0.0018);
  }

  // ---- Head: round cranium, big eyes, a crown of spikes, a tube snout with a lower jaw ----
  const hc = new THREE.Vector3(0, 0.19, 0.03);
  b.part(new THREE.SphereGeometry(1, 16, 12), freckled(SUN, 0.012, 7, 0.12), {
    at: hc,
    bone: "head",
    scale: [0.021, 0.023, 0.025],
    name: "head",
  });

  for (const side of [1, -1]) {
    const eye = new THREE.Vector3(side * 0.0172, 0.004, 0.0125).add(hc);
    const pupil = eye.clone().add(new THREE.Vector3(side * 0.0036, 0.0006, 0.0088));
    const glint = pupil
      .clone()
      .add(new THREE.Vector3(side * 0.3, 0.55, 0.78).normalize().multiplyScalar(0.0056));
    b.part(new THREE.SphereGeometry(0.0112, 14, 10), EYE, { at: eye, bone: "head", name: "eye" });
    b.part(new THREE.SphereGeometry(0.0064, 12, 8), PUPIL, { at: pupil, bone: "head", name: "pupil" });
    b.part(new THREE.SphereGeometry(0.0022, 8, 6), "#ffffff", { at: glint, bone: "head", name: "glint" });
  }

  const crown = [
    { x: -2, y: 0.0145, len: 0.0095, r: 0.0021 },
    { x: -1, y: 0.019, len: 0.0115, r: 0.0025 },
    { x: 0, y: 0.0205, len: 0.013, r: 0.0027 },
    { x: 1, y: 0.019, len: 0.0115, r: 0.0025 },
    { x: 2, y: 0.0145, len: 0.0095, r: 0.0021 },
  ];
  for (const s of crown) {
    const base = hc.clone().add(new THREE.Vector3(s.x * 0.0068, s.y, -0.0115));
    const dir = new THREE.Vector3(s.x * 0.3, 0.85, -0.45);
    b.spike(base, dir, s.len, s.r, { color: SPIKE, bone: "head", name: "crownSpike" });
  }

  const F = hc.clone().add(new THREE.Vector3(0, -0.006, 0.024));
  const d = new THREE.Vector3(0, -0.42, 0.91).normalize();
  const T = F.clone().addScaledVector(d, 0.052);
  b.rod(F, T, [0.0062, 0.0042], { color: SUN, bone: "head", name: "snout" });
  const J = F.clone().lerp(T, 0.4).add(new THREE.Vector3(0, -0.0045, 0));
  const jaw = b.joint("jaw", { parent: "head", at: J, aim: T, role: "jaw" });
  b.rod(J, T, [0.0038, 0.0032], { color: SUN, bone: jaw, name: "jawLower" });
  b.part(new THREE.SphereGeometry(0.0036, 8, 6), MOUTH, {
    at: T.clone().addScaledVector(d, 0.001),
    bone: jaw,
    name: "mouth",
  });

  // ---- Fins: a fluttering dorsal fin along the back, small pale pectorals at the chest ----
  const finPaint = gradient(FIN_ROOT, FIN_TIP, [0, 0.12, -0.004], [0, 0.12, -0.03]);
  b.membrane(
    catmull([
      [0, 0.094, -0.004],
      [0, 0.12, -0.004],
      [0, 0.143, -0.004],
    ]),
    catmull([
      [0, 0.094, -0.014],
      [0.004, 0.106, -0.026],
      [-0.004, 0.116, -0.022],
      [0.005, 0.127, -0.029],
      [-0.003, 0.138, -0.023],
      [0, 0.143, -0.014],
    ]),
    { color: finPaint, thickness: 0.0009, rows: 4, cols: 10, bone: trunk, name: "dorsalFin" },
  );
  for (const side of [1, -1]) {
    b.slab(
      [
        [side * 0.0172, 0.128, 0.016],
        [side * 0.036, 0.124, 0.011],
        [side * 0.034, 0.116, 0.003],
        [side * 0.0172, 0.12, 0.008],
      ],
      { color: SIDE_FIN, thickness: 0.0009, bone: "chest", name: "pectoralFin" },
    );
  }

  // ---- Seagrass strand, a second blade and a sand bed, on a grass joint at the floor ----
  const grass = b.joint("grass", { parent: "hips", at: [0, 0, -0.04] });
  const grassPaint = grain(GRASS_DARK, GRASS_LIGHT, { size: 0.005, axis: "y", seed: 2 });
  b.sweep(
    catmull([
      [0, 0, -0.04],
      [0, 0.08, -0.04],
      [0, 0.15, -0.042],
      [0.006, 0.21, -0.046],
      [0.018, 0.26, -0.048],
    ]),
    (t: number): [number, number] => [0.0055 * (1 - 0.55 * t), 0.0013],
    {
      color: grassPaint,
      section: "box",
      caps: { start: "flat", end: "round" },
      twist: 70,
      bone: grass,
      name: "seagrass",
    },
  );
  b.sweep(
    catmull([
      [0.03, 0, -0.07],
      [0.031, 0.06, -0.072],
      [0.028, 0.12, -0.07],
      [0.02, 0.17, -0.062],
    ]),
    (t: number): [number, number] => [0.0045 * (1 - 0.6 * t), 0.0012],
    { color: BLADE, section: "box", caps: { start: "flat", end: "round" }, twist: -40, bone: grass, name: "seagrassBlade" },
  );
  b.lathe(
    [
      [0, 0],
      [0.075, 0],
      [0.066, 0.0035],
      [0.045, 0.0085],
      [0.02, 0.0125],
      [0, 0.0135],
    ],
    {
      at: [0, 0, 0],
      color: mottle(SAND_A, SAND_B, { size: 0.03, seed: 5, contrast: 1.2 }),
      bone: grass,
      segments: 14,
      name: "sand",
    },
  );

  return b.root;
}
