```ts
import * as THREE from "three";
import { catmull, cells, createBuilder, gradient, grain, mix, mottle, paint, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Lined seahorse",
  description:
    "A sunny-yellow seahorse with fine dark plate lines and a few white freckles, a crown of spikes, a tube snout, a fluttering dorsal fin and big eyes, its tail coiled round a strand of seagrass.",
};

const YELLOW = "#fbc52e";
const INK = "#4f3310";
const SPECK = "#fffbf0";
const SCLERA = "#fffdf4";
const PUPIL = "#17100a";
const CROWN = "#f7a21b";
const RAY = "#e09a12";
const SAND = { light: "#efdca6", dark: "#d9bc7c" };
const GRASS = { deep: "#2f8a3c", light: "#8ad05f" };

/** A few white freckles: about one cell in three of 1.1 cm carries one. */
function speckle(p: THREE.Vector3) {
  const c = cells(p, 0.011, 7);
  return c.id < 0.3 ? smoothstep(0.19, 0.13, c.d1) : 0;
}

/** Yellow with fine dark plate lines across a tube (`count` plates along its length), plus freckles. */
function plated(count: number) {
  return paint((p, _n, s) => {
    const f = s[0] * count;
    const line = smoothstep(0.075, 0.04, Math.abs(f - Math.round(f)));
    return mix(mix(YELLOW, INK, line), SPECK, speckle(p));
  });
}

/** A value along t, piecewise linear through [t, value] stops. */
function profile(stops: ReadonlyArray<readonly [number, number]>) {
  return (t: number) => {
    for (let i = 1; i < stops.length; i++) {
      const [t1, v1] = stops[i];
      if (t <= t1) {
        const [t0, v0] = stops[i - 1];
        const f = Math.min(Math.max((t - t0) / (t1 - t0), 0), 1);
        return v0 + (v1 - v0) * f;
      }
    }
    return stops[stops.length - 1][1];
  };
}

/** Plate count for a tube of this length at roughly this spacing. */
const plates = (length: number, spacing: number) => Math.max(2, Math.round(length / spacing));

const midpoint = (a: number[], c: number[]) => a.map((v, i) => (v + c[i]) / 2);

export default function seahorse() {
  const b = createBuilder({ name: "seahorse" });

  const headPaint = paint((p) => mix(YELLOW, SPECK, speckle(p)));
  const grass = grain(GRASS.deep, GRASS.light, { size: 0.006, axis: "y", seed: 4 });
  const sand = mottle(SAND.light, SAND.dark, { size: 0.02, contrast: 1.4, seed: 2 });
  const finPaint = gradient("#ffd55c", "#fff8dc", [0, 0.09, -0.02], [0, 0.14, -0.04]);

  // ---- Skeleton -------------------------------------------------------------
  // Hips at the tail root, the trunk and neck as chains, the head as the neck's tip, the tail as a chain that coils
  // round the seagrass strand (which stands at x = -0.035, z = -0.02).
  b.joint("hips", { at: [0, 0.075, 0] });

  const trunkPath = catmull([
    [0, 0.075, 0],
    [0, 0.1, 0.016],
    [0, 0.127, 0.018],
    [0, 0.15, 0.01],
  ]);
  const spine = b.chain("spine", trunkPath, {
    parent: "hips",
    count: 3,
    names: ["spine1", "spine2", "spine3", "chest"],
    role: "spine",
  });

  const neckPath = catmull([
    [0, 0.15, 0.01],
    [0, 0.172, 0.016],
    [0, 0.199, 0.026],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: "chest",
    count: 2,
    names: ["neck1", "neck2", "head"],
    role: "neck",
  });

  const CX = -0.035;
  const CZ = -0.02;
  const COIL = 0.0118;
  const coil: number[][] = [];
  for (let i = 0; i <= 14; i++) {
    const u = i / 14;
    const a = Math.PI / 2 + 3 * Math.PI * u; // one and a half turns round the grass
    const r = COIL + 0.007 * smoothstep(0.8, 1, u); // the tip flares out
    coil.push([CX + r * Math.sin(a), 0.056 - 0.03 * u, CZ + r * Math.cos(a)]);
  }
  const tailPath = catmull([[0, 0.075, 0], [-0.011, 0.068, -0.009], ...coil]);
  const tail = b.chain("tail", tailPath, {
    parent: "hips",
    count: 6,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6", "tailTip"],
    role: "tail",
  });

  // ---- Body -----------------------------------------------------------------
  const trunkSide = profile([
    [0, 0.011],
    [0.25, 0.017],
    [0.6, 0.019],
    [0.9, 0.0155],
    [1, 0.0125],
  ]);
  const trunkDepth = profile([
    [0, 0.013],
    [0.25, 0.0185],
    [0.6, 0.021],
    [0.9, 0.0165],
    [1, 0.0125],
  ]);
  b.sweep(spine, (t): [number, number] => [trunkSide(t), trunkDepth(t)], {
    name: "trunk",
    color: plated(plates(trunkPath.length, 0.0085)),
    section: { ngon: 8 },
  });

  const neckR = profile([
    [0, 0.0125],
    [0.6, 0.0105],
    [1, 0.0112],
  ]);
  b.sweep(neck, (t): [number, number] => [neckR(t), neckR(t)], {
    name: "neck",
    color: plated(plates(neckPath.length, 0.0085)),
    section: { ngon: 8 },
  });

  const tailR = profile([
    [0, 0.0105],
    [0.2, 0.0068],
    [0.82, 0.0058],
    [0.95, 0.0052],
    [1, 0.0034],
  ]);
  b.sweep(tail, tailR, {
    name: "tail",
    color: plated(plates(tailPath.length, 0.0075)),
    sides: 8,
  });

  // ---- Head and face --------------------------------------------------------
  const head = b.part(new THREE.SphereGeometry(0.021, b.segments(16), b.segments(12)), headPaint, {
    name: "head",
    at: [0, 0.199, 0.026],
    bone: "head",
    scale: [0.95, 0.98, 1.08],
  });

  // Big, curious eyes: a white ball, a dark pupil looking forward, a small glint.
  for (const side of [1, -1]) {
    const eye = new THREE.Vector3(side * 0.0175, 0.206, 0.035);
    const gaze = new THREE.Vector3(side * 0.45, 0.12, 0.88).normalize();
    const pupil = eye.clone().addScaledVector(gaze, 0.008);
    const glint = pupil.clone().addScaledVector(new THREE.Vector3(-side * 0.35, 0.6, 0.72).normalize(), 0.0046);
    const tag = side > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.0118, b.segments(16), b.segments(12)), SCLERA, {
      name: `eye${tag}`,
      at: eye,
      bone: "head",
    });
    b.part(new THREE.SphereGeometry(0.0066, b.segments(12), b.segments(10)), PUPIL, {
      name: `pupil${tag}`,
      at: pupil,
      bone: "head",
    });
    b.part(new THREE.SphereGeometry(0.0021, 8, 6), "#ffffff", {
      name: `glint${tag}`,
      at: glint,
      bone: "head",
    });
  }

  // Crown of spikes standing on the back and top of the head, seated on the real head surface.
  const crown = b.surface(head).around([0, 0.199, 0.026]);
  for (const [az, el] of [
    [125, 26],
    [152, 46],
    [180, 60],
    [208, 46],
    [235, 26],
  ]) {
    const hit = crown.at(az, el);
    if (!hit) continue;
    b.spike(hit, hit.n.clone().add(new THREE.Vector3(0, 0.7, 0)), 0.016, 0.0034, {
      name: "crownSpike",
      color: CROWN,
    });
  }

  // Long tube snout (the upper jaw), and the lower jaw hinged under its back.
  b.rod([0, 0.196, 0.034], [0, 0.193, 0.102], [0.0074, 0.005], {
    name: "snout",
    color: plated(plates(0.068, 0.0085)),
    bone: "head",
    caps: "round",
  });
  b.joint("jaw", { parent: "head", at: [0, 0.1862, 0.06], dir: [0, 0, 1], up: [0, 1, 0], role: "jaw" });
  b.rod([0, 0.1862, 0.06], [0, 0.1855, 0.099], [0.0032, 0.0023], {
    name: "jawLower",
    color: plated(plates(0.039, 0.0085)),
    bone: "jaw",
    caps: "round",
  });

  // ---- Dorsal fin: a thin, wavy membrane on the back, with fine rays ---------
  const finBase = [
    [0, 0.086, -0.008],
    [0, 0.106, -0.004],
    [0, 0.126, -0.003],
    [0, 0.146, -0.003],
  ];
  const finEdge = [
    [0, 0.094, -0.03],
    [0.002, 0.112, -0.043],
    [-0.003, 0.13, -0.041],
    [0.002, 0.146, -0.03],
  ];
  b.membrane(finBase, finEdge, {
    name: "dorsalFin",
    color: finPaint,
    thickness: 0.0013,
    rows: 4,
    bone: spine,
  });
  const rays: Array<[number[], number[]]> = [];
  finBase.forEach((p, i) => rays.push([p, finEdge[i]]));
  for (let i = 0; i < finBase.length - 1; i++)
    rays.push([midpoint(finBase[i], finBase[i + 1]), midpoint(finEdge[i], finEdge[i + 1])]);
  for (const [from, to] of rays) {
    b.rod(from, to, 0.00085, { name: "finRay", color: RAY, bone: "spine2" });
  }

  // ---- Seagrass strand the tail is wrapped round, with a companion leaf -------
  const stemPath = catmull([
    [CX, 0, CZ],
    [CX, 0.1, CZ],
    [CX - 0.002, 0.2, CZ - 0.003],
    [CX + 0.002, 0.29, CZ + 0.002],
  ]);
  b.sweep(stemPath, (t) => 0.0042 - 0.0022 * t, {
    name: "seagrassStem",
    color: grass,
    bone: "hips",
    sides: 8,
    caps: { start: "flat", end: "point" },
  });

  const bladePath = catmull([
    [0.03, 0, -0.046],
    [0.038, 0.08, -0.05],
    [0.044, 0.17, -0.056],
    [0.036, 0.25, -0.05],
    [0.046, 0.31, -0.06],
  ]);
  b.sweep(bladePath, (t): [number, number] => [0.0056 - 0.0038 * t, 0.0009], {
    name: "seagrassLeaf",
    color: grass,
    bone: "hips",
    section: "box",
    twist: 50,
    caps: { start: "flat", end: "point" },
  });

  // ---- A little sand mound the seagrass grows from (its base sits on y = 0) ---
  b.lathe(
    [
      [0, 0],
      [0.072, 0],
      [0.066, 0.0035],
      [0.05, 0.0085],
      [0.028, 0.0118],
      [0, 0.0125],
    ],
    { name: "sand", at: [0, 0, 0], color: sand, bone: "hips" },
  );

  return b.root;
}
```