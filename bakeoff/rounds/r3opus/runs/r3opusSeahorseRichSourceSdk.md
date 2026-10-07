```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  spiral,
  paint,
  mix,
  smoothstep,
  noise,
  cells,
  spots,
  mottle,
  grain,
  gradient,
  stripes,
  interpolate,
} from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";

export const meta = {
  name: "Lined Seahorse",
  description:
    "A sunny-yellow lined seahorse with ridged bony rings, thin dark lines and white freckles, a spiky coronet, long tube snout, big teal eyes and a rippling dorsal fin, its square tail coiled around a seagrass blade rising from a sandy mound with a starfish and a little shell.",
};

const YEL = "#ffcb2b";
const YEL_DEEP = "#f2a114";
const BELLY = "#ffe68f";
const LINE = "#3a220f";
const FRECKLE = "#fffaf0";
const KNOB = "#e8961a";
const CROWN = "#f2a524";
const CROWN_TIP = "#7a3d12";

function skin(lines: number, seed: number) {
  return paint((p, n, s) => {
    let c: Rgb = mix(YEL, YEL_DEEP, smoothstep(0.35, 0.75, noise(p, 0.018, seed)));
    c = mix(c, BELLY, smoothstep(0.35, 0.95, n.z) * 0.55);
    const period = 360 / lines;
    const wob = (noise(p, 0.012, seed + 4) - 0.5) * period * 0.9;
    const k = (((s[1] + wob) % period) + period) % period;
    const d = Math.min(k, period - k);
    const line = smoothstep(period * 0.1, period * 0.04, d);
    c = mix(c, LINE, line * 0.85);
    const cell = cells(p, 0.0055, seed + 9);
    if (cell.id > 0.78) c = mix(c, FRECKLE, smoothstep(0.22, 0.13, cell.d1));
    return c;
  });
}

export default function build() {
  const b = createBuilder({ name: "linedSeahorse", paintSize: 2048 });
  b.joint("root", { at: [0, 0, 0] });

  // ---------------- Seafloor mound ----------------
  const sand = spots(
    mottle("#ead7a8", "#cfb47f", { size: 0.02, seed: 2 }),
    ["#9c7f55", "#f7ecd0"],
    { size: 0.0045, amount: 0.15, seed: 4 },
  );
  const mound = b.lathe(
    [
      [0, 0],
      [0.075, 0],
      [0.071, 0.004],
      [0.05, 0.009],
      [0.02, 0.0115],
      [0, 0.012],
    ],
    { at: [0, -0.001, -0.02], color: sand, segments: 16, bone: "root", name: "sandMound" },
  );
  const moundSurf = b.surface(mound);
  const onSand = (x: number, z: number) => moundSurf.ray([x, 0.1, z], [0, -1, 0]) ?? moundSurf.nearest([x, 0.01, z]);

  // pebbles
  const pebbleSpots: Array<[number, number, string, number]> = [
    [-0.045, 0.01, "#8c8577", 1],
    [0.05, -0.03, "#a59c8a", 0.8],
    [-0.02, 0.035, "#6f6a60", 0.7],
    [0.03, -0.06, "#9a9284", 0.9],
    [-0.055, -0.04, "#7d776b", 1.1],
  ];
  for (const [x, z, col, s] of pebbleSpots) {
    b.stick(new THREE.DodecahedronGeometry(0.0045 * s, 0), col, onSand(x, z), {
      scale: [1, 0.55, 1.2],
      embed: 0.35,
      flat: true,
      spin: x * 900,
      bone: "root",
    });
  }

  // starfish
  const star: Array<[number, number]> = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.0065 : 0.017;
    const a = (i * Math.PI) / 5 + Math.PI / 2;
    star.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  const starHit = onSand(0.036, 0.018);
  b.extrude(star, {
    at: starHit.at.clone().add(new THREE.Vector3(0, 0.0012, 0)),
    x: [Math.cos(0.3), 0, Math.sin(0.3)],
    y: [0, 0, -1],
    thickness: 0.0035,
    bevel: 0.0013,
    smoothing: 1,
    color: spots("#ef5a35", "#ffd6b0", { size: 0.0035, amount: 0.3, seed: 6 }),
    bone: "root",
    name: "starfish",
  });

  // little turban shell
  const shellHit = onSand(-0.035, 0.03);
  b.lathe(
    [
      [0, 0],
      [0.0062, 0],
      [0.0048, 0.004],
      [0.003, 0.0072],
      [0.0012, 0.0094],
      [0, 0.0102],
    ],
    {
      at: shellHit.at.clone().add(new THREE.Vector3(0, -0.0008, 0)),
      axis: [0.35, 1, 0.25],
      color: stripes("#f6e8d4", "#b8693a", { size: 0.0018, axis: [0.35, 1, 0.25], width: 0.45, seed: 3 }),
      segments: 9,
      smoothing: 1,
      bone: "root",
      name: "shell",
    },
  );

  // ---------------- Seagrass ----------------
  const grassPaint = (lo: string, hi: string) =>
    gradient(
      grain(lo, "#2a5f28", { size: 0.0015, seed: 1 }),
      grain(hi, "#c4e070", { size: 0.0015, seed: 2 }),
      [0, 0, 0],
      [0, 0.3, 0],
    );
  const blade = (
    name: string,
    pts: number[][],
    width: number,
    lo: string,
    hi: string,
    twist: (t: number) => number,
  ) => {
    const chain = b.chain(name, catmull(pts), { parent: "root", count: 4, twist });
    b.sweep(chain, (t) => [width * (t < 0.72 ? 1 : 1 - ((t - 0.72) / 0.28) * 0.8), 0.0009], {
      section: "box",
      color: grassPaint(lo, hi),
      caps: { start: "flat", end: "point" },
    });
    return chain;
  };
  blade(
    "grassA",
    [
      [0, -0.002, -0.036],
      [0, 0.06, -0.036],
      [0, 0.13, -0.04],
      [-0.007, 0.2, -0.05],
      [-0.018, 0.26, -0.06],
      [-0.034, 0.3, -0.064],
    ],
    0.0045,
    "#2e6f2c",
    "#9ccf4a",
    (t) => (t < 0.35 ? 0 : (t - 0.35) * 110),
  );
  blade(
    "grassB",
    [
      [0.022, -0.002, -0.045],
      [0.025, 0.08, -0.05],
      [0.035, 0.16, -0.056],
      [0.052, 0.22, -0.05],
    ],
    0.004,
    "#346e2a",
    "#b5d556",
    (t) => t * 140,
  );
  blade(
    "grassC",
    [
      [-0.025, -0.002, -0.03],
      [-0.03, 0.07, -0.028],
      [-0.045, 0.13, -0.02],
      [-0.06, 0.16, -0.004],
    ],
    0.0038,
    "#2b6634",
    "#8fc75a",
    (t) => -t * 90,
  );

  // ---------------- Seahorse skeleton ----------------
  const P = [
    [0, 0.1, -0.004],
    [0, 0.122, 0.006],
    [0, 0.148, 0.007],
    [0, 0.17, 0.0],
    [0, 0.186, -0.006],
    [0, 0.198, -0.005],
  ];
  const spine = b.chain("spine", catmull(P.slice(0, 4)), { parent: "root", count: 3, role: "spine" });
  const neck = b.chain("neck", catmull(P.slice(3, 6)), {
    parent: spine,
    count: 2,
    role: "neck",
    names: ["neck1", "neck2"],
  });
  b.joint("head", { at: P[5], dir: [0, -0.15, 1], parent: neck, role: "head" });

  // ---------------- Trunk ----------------
  const BODY_N = 11;
  const ridge = (t: number, n: number) => Math.pow(Math.abs(Math.cos(Math.PI * t * n)), 6);
  const BODY_T = [0, 0.18, 0.4, 0.6, 0.8, 1];
  const BODY_RX = [0.0066, 0.0088, 0.0094, 0.0078, 0.0052, 0.0058];
  const BODY_RY = [0.0085, 0.0122, 0.0126, 0.0104, 0.0066, 0.0072];
  const bodyR = (t: number): [number, number] => {
    const s = 1 + 0.11 * ridge(t, BODY_N) * (t < 0.85 ? 1 : 0.4);
    return [interpolate(BODY_T, BODY_RX, t) * s, interpolate(BODY_T, BODY_RY, t) * s];
  };
  const bodyPath = catmull(P);
  const body = b.sweep(bodyPath, bodyR, {
    bone: [spine, neck],
    section: { ngon: 7 },
    color: skin(16, 1),
    name: "trunk",
  });
  const bodySurf = b.surface(body);

  // bony tubercles on the ring corners
  const knob = new THREE.IcosahedronGeometry(0.0011, 0);
  const bodyFrames = bodyPath.frames();
  for (let k = 1; k < BODY_N; k++) {
    const t = k / BODY_N;
    if (t > 0.8) break;
    const T = bodyPath.tangentAt(t);
    const N = bodyFrames.normalAt(t);
    const B = T.clone().cross(N);
    const [rx, ry] = bodyR(t);
    const c = bodyPath.at(t);
    for (const v of [0, 1, 2, 5, 6]) {
      if (v === 0 && t > 0.12 && t < 0.56) continue;
      const ph = Math.PI / 2 + (2 * Math.PI * v) / 7;
      const pos = c
        .clone()
        .addScaledVector(B, Math.cos(ph) * rx)
        .addScaledVector(N, Math.sin(ph) * ry);
      const dir = B.clone().multiplyScalar(Math.cos(ph)).addScaledVector(N, Math.sin(ph)).normalize();
      b.part(knob, KNOB, { at: pos, dir, flat: true });
    }
  }

  // ---------------- Tail ----------------
  const tailPath = catmull([
    [0, 0.1, -0.004],
    [0, 0.086, -0.011],
    [0.002, 0.074, -0.019],
    [0.006, 0.067, -0.026],
    [0, 0.062, -0.029],
  ]).concat(spiral([0, 0.062, -0.036], [0, 0.062, -0.029], [0, -1, 0], { turns: 1.35, r1: 0.0058, pitch: 0.0065 }));
  const tail = b.chain("tail", tailPath, {
    parent: "spine1",
    count: 10,
    role: "tail",
    names: (i) => `tail${i + 1}`,
  });
  const TAIL_N = 20;
  const TAIL_T = [0, 0.25, 0.5, 0.75, 1];
  const TAIL_R = [0.0074, 0.0053, 0.0037, 0.0028, 0.0017];
  const tailR = (t: number): [number, number] => {
    const r = interpolate(TAIL_T, TAIL_R, t) * (1 + 0.14 * ridge(t, TAIL_N) * (t < 0.5 ? 1 : 0.5));
    return [r, r];
  };
  b.sweep(tail, tailR, { section: { ngon: 4 }, color: skin(8, 2), name: "tail" });
  const smallKnob = new THREE.IcosahedronGeometry(0.0008, 0);
  for (let k = 1; k < TAIL_N; k++) {
    const t = k / TAIL_N;
    if (t > 0.42) break;
    const cp = tail.at(t);
    const r = tailR(t)[0];
    for (const [x, z] of [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ]) {
      b.part(smallKnob, KNOB, { at: cp.moved([x * r, 0, z * r]), dir: cp.dir([x, 0, z]), flat: true });
    }
  }

  // ---------------- Head ----------------
  const headSkin = skin(14, 3);
  const head = b.loft(
    [
      { at: [0, 0.2005, -0.009], w: 0.01, h: 0.012 },
      { at: [0, 0.2, -0.002], w: 0.0155, h: 0.017 },
      { at: [0, 0.1975, 0.007], w: 0.012, h: 0.013 },
      { at: [0, 0.1935, 0.0145], w: 0.0075, h: 0.008 },
    ],
    { bone: "head", color: headSkin, sides: 10, name: "head" },
  );
  b.capsule([0, 0.1935, 0.013], [0, 0.1875, 0.038], [0.0036, 0.003], {
    bone: "head",
    color: skin(8, 5),
    sides: 9,
    name: "snout",
  });
  // mouth: upper lip on the head, lower jaw on its own hinge
  b.joint("jaw", { at: [0, 0.1868, 0.0372], aim: [0, 0.1856, 0.0448], parent: "head", role: "jaw" });
  b.capsule([0, 0.1888, 0.0372], [0, 0.1884, 0.0448], 0.0019, { bone: "head", color: "#d98a1c", sides: 8, name: "upperLip" });
  b.capsule([0, 0.1861, 0.0372], [0, 0.1857, 0.0444], 0.0017, { bone: "jaw", color: "#c9771a", sides: 8, name: "lowerJaw" });
  b.part(new THREE.SphereGeometry(0.0009, 8, 6), "#3a1a0a", { at: [0, 0.1873, 0.0452], bone: "head", name: "mouth" });

  // coronet
  b.lathe(
    [
      [0, 0],
      [0.0032, 0],
      [0.0029, 0.003],
      [0.0023, 0.0048],
      [0, 0.0048],
    ],
    { at: [0, 0.2048, -0.0055], color: CROWN, segments: 6, bone: "head", name: "coronet" },
  );
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    const base: [number, number, number] = [Math.cos(a) * 0.0017, 0.2093, -0.0055 + Math.sin(a) * 0.0017];
    b.spike(base, [Math.cos(a) * 0.45, 1, Math.sin(a) * 0.45], 0.0045, 0.001, {
      color: (t) => (t < 0.55 ? CROWN : CROWN_TIP),
      sides: 5,
      bone: "head",
    });
  }
  // neck spines along the dorsal ridge
  for (const y of [0.161, 0.171, 0.181]) {
    const hit = bodySurf.ray([0, y, -0.1], [0, 0, 1]);
    if (!hit) continue;
    const dir = hit.n.clone().add(new THREE.Vector3(0, 0.7, 0)).normalize();
    b.spike(hit, dir, 0.003, 0.0009, { color: (t) => (t < 0.6 ? KNOB : CROWN_TIP), sides: 5 });
  }

  // ---------------- Eyes ----------------
  const headSurf = b.surface(head);
  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    const hit = headSurf.ray([side * 0.05, 0.2012, 0.0], [-side, 0, 0]) ?? headSurf.nearest([side * 0.01, 0.2012, 0]);
    const d = new THREE.Vector3(side * 0.85, 0.12, 0.5).normalize();
    const c = hit.at.clone().addScaledVector(hit.n, 0.0012);
    const eye = b.joint(`eye${tag}`, { at: c, dir: d, parent: "head" });
    b.part(new THREE.TorusGeometry(0.0044, 0.0012, 5, 14), "#f4ac1c", {
      at: c.clone().addScaledVector(d, -0.0012),
      dir: d,
      axis: "z",
      bone: eye,
      name: `eyeRim${tag}`,
    });
    b.part(new THREE.SphereGeometry(0.0042, 14, 10), "#fffaf0", { at: c, dir: d, bone: eye, name: `eyeball${tag}` });
    b.part(new THREE.SphereGeometry(0.00428, 16, 5, 0, Math.PI * 2, 0, 0.85), "#2f97ad", {
      at: c,
      dir: d,
      bone: eye,
      name: `iris${tag}`,
    });
    b.part(new THREE.SphereGeometry(0.00436, 14, 4, 0, Math.PI * 2, 0, 0.45), "#0d0a08", {
      at: c,
      dir: d,
      bone: eye,
      name: `pupil${tag}`,
    });
    const up = new THREE.Vector3(0, 1, 0).addScaledVector(d, -d.y).normalize();
    const across = d.clone().cross(up).normalize();
    b.part(new THREE.SphereGeometry(0.00085, 8, 6), "#ffffff", {
      at: c.clone().addScaledVector(d, 0.0037).addScaledVector(up, 0.0017).addScaledVector(across, 0.0006),
      bone: eye,
      name: `glint${tag}`,
    });
    b.part(new THREE.SphereGeometry(0.0004, 6, 4), "#ffffff", {
      at: c.clone().addScaledVector(d, 0.0042).addScaledVector(up, -0.0011).addScaledVector(across, -0.0009),
      bone: eye,
      name: `glint${tag}2`,
    });
    // brow spine
    b.spike(
      c.clone().add(new THREE.Vector3(-side * 0.0012, 0.0036, -0.0012)),
      [side * 0.45, 1, -0.35],
      0.0032,
      0.0009,
      { color: (t) => (t < 0.55 ? CROWN : CROWN_TIP), sides: 5, bone: "head" },
    );
  }

  // ---------------- Pectoral fins ----------------
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const pec = b.joint(`pec${tag}`, {
      at: [s * 0.0056, 0.19, -0.0055],
      dir: [s * 0.3, 0, -1],
      parent: "neck2",
      role: "fan",
    });
    const pecPaint = paint((p) => {
      const a = Math.atan2(p.y - 0.19, -(p.z + 0.0055));
      const k = (((a * 14) / Math.PI) % 1 + 1) % 1;
      const ray = smoothstep(0.18, 0.05, Math.min(k, 1 - k));
      const edge = smoothstep(0.006, 0.0095, Math.hypot(p.y - 0.19, p.z + 0.0055));
      return mix(mix("#ffeeb0", "#fff8e2", edge), "#e8962a", ray * (1 - edge * 0.6));
    });
    b.slab(
      [
        [s * 0.0056, 0.1928, -0.0058],
        [s * 0.0056, 0.1872, -0.005],
        [s * 0.0085, 0.1855, -0.0115],
        [s * 0.0098, 0.1885, -0.0142],
        [s * 0.0098, 0.1925, -0.0142],
        [s * 0.0088, 0.1955, -0.0118],
      ],
      { color: pecPaint, thickness: 0.0006, bone: pec, name: `pecFin${tag}` },
    );
  }

  // ---------------- Dorsal fin ----------------
  const baseN = 9;
  const basePts: THREE.Vector3[] = [];
  const topPts: THREE.Vector3[] = [];
  for (let i = 0; i < baseN; i++) {
    const f = i / (baseN - 1);
    const y = 0.116 + f * 0.036;
    const hit = bodySurf.ray([0, y, -0.1], [0, 0, 1]) ?? bodySurf.nearest([0, y, -0.02]);
    const base = hit.at.clone().add(new THREE.Vector3(0, 0, 0.0007));
    basePts.push(base);
    const h = 0.0045 + 0.0055 * Math.pow(Math.sin(Math.PI * Math.min(1, f * 1.08)), 0.8);
    topPts.push(base.clone().add(new THREE.Vector3(0.0013 * Math.sin(f * Math.PI * 3), 0.0028, -h)));
  }
  const dorsal = b.chain("dorsal", catmull(basePts), {
    parent: spine.nearestJoint(basePts[0]),
    count: 4,
    role: "fan",
  });
  const finPaint = paint((_p, _n, s) => {
    const u = s[0];
    const v = s[1];
    const k = ((u * 14) % 1 + 1) % 1;
    const ray = smoothstep(0.16, 0.05, Math.min(k, 1 - k));
    let c: Rgb = mix("#ffe7a1", "#fffaea", v);
    c = mix(c, "#e39a2c", ray * (1 - v * 0.55));
    c = mix(c, "#ffb84a", smoothstep(0.82, 0.97, v) * 0.5);
    return c;
  });
  b.membrane(dorsal, catmull(topPts), {
    color: finPaint,
    thickness: 0.0007,
    rows: 4,
    cols: 16,
    name: "dorsalFin",
  });

  return b.root;
}
```