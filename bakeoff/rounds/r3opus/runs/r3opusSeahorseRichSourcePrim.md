```ts
import * as THREE from "three";
import {
  createBuilder,
  paint,
  mix,
  smoothstep,
  noise,
  cells,
  gradient,
  mottle,
  spots,
  catmull,
  rng,
} from "agentic-3js-builder";

export const meta = {
  name: "Lined Seahorse",
  description:
    "A sunny-yellow lined seahorse with a ringed, knobbly body, thin dark lines and white freckles, a spiky crown, long tube snout, fluttering dorsal fin and big curious eyes, its tail curled around a seagrass strand on a little sand mound.",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const frac = (x: number) => x - Math.floor(x);

// Palette
const DEEP = "#e89a18";
const YEL = "#f9c935";
const LIGHT = "#ffe58a";
const RIDGE = "#c4740f";
const LINE = "#4a2a12";
const FRECK = "#fffaf0";
const SPINE = "#f2b52a";
const SPINE_TIP = "#7a3f12";
const KNOB = "#eaa21e";
const LIP = "#d4831a";

/** Seahorse skin: countershaded yellow, ring ridges (by tube t), thin dark lines, white freckles. */
function skinPaint(rings: number) {
  return paint((p, n, s) => {
    let c = mix(mix(DEEP, YEL, smoothstep(-0.7, 0.1, n.z)), LIGHT, smoothstep(0.35, 1, n.z) * 0.8);
    if (rings > 0) {
      const f = Math.abs(frac(s[0] * rings) - 0.5);
      c = mix(c, RIDGE, 0.7 * smoothstep(0.1, 0.025, f));
      c = mix(c, LIGHT, 0.25 * smoothstep(0.32, 0.45, f));
    }
    const w = rings > 0 ? (s[1] + 34 * (noise(p, 0.03, 5) - 0.5)) / 22 : noise(p, 0.014, 5) * 7;
    const d = Math.abs(frac(w) - 0.5);
    c = mix(c, LINE, 0.9 * smoothstep(0.43, 0.47, d));
    const cl = cells(p, 0.008, 13);
    if (cl.id > 0.82) c = mix(c, FRECK, smoothstep(0.24, 0.15, cl.d1));
    return c;
  });
}

const finPaint = paint((p, n, s) => {
  let c = mix("#fff4c8", "#ffd65c", smoothstep(0, 0.02, Math.abs(s[0])));
  const r = Math.abs(frac(s[1] / 0.0048) - 0.5);
  c = mix(c, "#e39f26", 0.8 * smoothstep(0.36, 0.46, r));
  return c;
});

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "lined-seahorse", detail: 1, paintSize: 1024 });
  const random = rng(7);

  b.joint("root", { at: [0, 0, 0] });

  // ---------------------------------------------------------------- scenery
  const sandBase = mottle("#ead9ab", "#cdb385", { size: 0.022, seed: 3 });
  const sand = paint((p) => {
    const c = cells(p, 0.004, 2);
    if (c.id > 0.88 && c.d1 < 0.25) return "#8f7d5e";
    if (c.id < 0.05 && c.d1 < 0.22) return "#fbf3e0";
    return sandBase;
  });
  b.part(new THREE.SphereGeometry(1, 22, 6, 0, Math.PI * 2, 0, Math.PI / 2), sand, {
    at: [0, 0, 0],
    scale: [0.1, 0.022, 0.09],
    bone: "root",
  });
  const moundH = (x: number, z: number) => {
    const q = (x / 0.1) ** 2 + (z / 0.09) ** 2;
    return q >= 1 ? 0 : 0.022 * Math.sqrt(1 - q);
  };

  // Pebbles
  const pebbleColors = ["#8a8f96", "#a58f8a", "#6f7a72", "#b9ada0", "#7d6f86"];
  const pebbleAt: Array<[number, number]> = [
    [-0.06, 0.04],
    [0.07, -0.03],
    [-0.04, -0.06],
    [0.02, 0.07],
    [-0.08, -0.02],
    [0.06, 0.055],
  ];
  pebbleAt.forEach(([x, z], i) => {
    const r = 0.006 + random() * 0.004;
    b.part(new THREE.IcosahedronGeometry(r, 0), pebbleColors[i % pebbleColors.length], {
      at: [x, moundH(x, z) - r * 0.15, z],
      rotation: [random() * 60, random() * 180, random() * 60],
      scale: [1, 0.6, 1],
      bone: "root",
      flat: true,
    });
  });

  // Starfish
  const star: Array<[number, number]> = [];
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? 0.0065 : 0.017;
    star.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  b.extrude(star, {
    color: spots("#ef6f3a", ["#ffd0a0", "#fff0d8"], { size: 0.005, amount: 0.45, seed: 4 }),
    at: [0.052, 0.0185, 0.03],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.004,
    bevel: 0.0015,
    smoothing: 1,
    bone: "root",
    name: "starfish",
  });

  // The held seagrass strand (rigged so it can sway)
  const grassPath = catmull([
    [0, 0, 0],
    [0, 0.1, 0],
    [0.006, 0.2, -0.008],
    [0.02, 0.29, -0.025],
    [0.045, 0.36, -0.045],
    [0.07, 0.41, -0.06],
  ]);
  const grass = b.chain("grass", grassPath, { parent: "root", count: 4, names: ["grass1", "grass2", "grass3", "grass4"] });
  b.sweep(grass, (t: number) => [0.0047 * (1 - 0.35 * t), 0.0011] as const, {
    section: "box",
    color: gradient("#2c6a37", "#9bd068", [0, 0, 0], [0, 0.42, 0]),
    caps: { start: "flat", end: "point" },
    name: "seagrassStrand",
  });

  // Other blades around
  const blades: Array<{ pts: number[][]; a: string; c: string }> = [
    { pts: [[-0.03, 0, 0.02], [-0.035, 0.08, 0.025], [-0.05, 0.16, 0.035], [-0.075, 0.22, 0.03]], a: "#2f6b3a", c: "#8fc75a" },
    { pts: [[0.035, 0, -0.02], [0.04, 0.1, -0.03], [0.05, 0.2, -0.05], [0.04, 0.27, -0.075]], a: "#285e34", c: "#a7d26f" },
    { pts: [[-0.015, 0, -0.035], [-0.02, 0.07, -0.045], [-0.035, 0.14, -0.06]], a: "#356f3d", c: "#b8d978" },
    { pts: [[0.05, 0, 0.03], [0.055, 0.06, 0.035], [0.07, 0.11, 0.045]], a: "#3a7a42", c: "#c4e28a" },
    { pts: [[-0.05, 0, -0.01], [-0.06, 0.09, -0.015], [-0.07, 0.17, -0.03], [-0.068, 0.24, -0.05]], a: "#24563a", c: "#7fbf63" },
  ];
  blades.forEach((bl, i) => {
    const top = bl.pts[bl.pts.length - 1];
    b.sweep(catmull(bl.pts), (t: number) => [0.0042 * (1 - 0.4 * t), 0.001] as const, {
      section: "box",
      color: gradient(bl.a, bl.c, [bl.pts[0][0], 0, bl.pts[0][2]], [top[0], top[1], top[2]]),
      caps: { start: "flat", end: "point" },
      bone: "root",
      up: [Math.sin(i * 1.7), 0, Math.cos(i * 1.7)],
      name: `seagrass${i + 1}`,
    });
  });

  // ---------------------------------------------------------------- seahorse skeleton
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.118, 0.03],
      [0, 0.155, 0.049],
      [0, 0.195, 0.045],
      [0, 0.232, 0.024],
    ]),
    { parent: "root", names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const H = V(0, 0.252, 0.027);
  const hd = V(0, -0.2, 1).normalize();
  b.joint("neck", { at: [0, 0.232, 0.024], parent: spine, aim: H, role: "neck" });
  b.joint("head", { at: H, parent: "neck", dir: hd, role: "head" });

  // Tail: down from the trunk, then curled around the strand
  const tailPts: number[][] = [
    [0, 0.122, 0.033],
    [0, 0.105, 0.034],
    [0, 0.088, 0.024],
  ];
  const R = 0.0095;
  const turns = 1.5;
  for (let k = 0; k <= 10; k++) {
    const a = (k / 10) * turns * Math.PI * 2;
    tailPts.push([R * Math.sin(a), 0.076 - 0.018 * (k / 10), R * Math.cos(a)]);
  }
  const tail = b.chain("tail", catmull(tailPts), {
    parent: "spine1",
    count: 8,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6", "tail7", "tail8"],
    role: "tail",
  });
  const tailTube = b.sweep(tail, (t: number) => 0.0078 - 0.005 * Math.pow(t, 0.8), {
    color: skinPaint(30),
    name: "tail",
  });

  // Body
  const body = b.loft(
    [
      { at: [0, 0.108, 0.028], w: 0.016, h: 0.018 },
      { at: [0, 0.13, 0.04], w: 0.026, h: 0.032 },
      { at: [0, 0.16, 0.05], w: 0.032, h: 0.042 },
      { at: [0, 0.19, 0.047], w: 0.028, h: 0.036 },
      { at: [0, 0.215, 0.036], w: 0.019, h: 0.022 },
      { at: [0, 0.235, 0.024], w: 0.015, h: 0.016 },
      { at: [0, 0.25, 0.024], w: 0.02, h: 0.022 },
    ],
    { color: skinPaint(12), bone: [spine, "neck", "head"], name: "body" },
  );

  // Ridge knobs along the body rings
  const knob = new THREE.ConeGeometry(0.0016, 0.0032, 5);
  for (let k = 0; k < 10; k++) {
    const t = (k + 0.5) / 12;
    for (const ang of [45, 135, 225, 315]) {
      b.stick(knob, KNOB, body.at(t, ang), { embed: 0.35, flat: true });
    }
  }
  const smallKnob = new THREE.ConeGeometry(0.0011, 0.0022, 5);
  for (let k = 0; k < 8; k++) {
    const t = 0.04 + k * 0.05;
    b.stick(smallKnob, KNOB, tailTube.at(t, 90), { embed: 0.35, flat: true });
    b.stick(smallKnob, KNOB, tailTube.at(t, 270), { embed: 0.35, flat: true });
  }

  // ---------------------------------------------------------------- head
  const headPaint = skinPaint(0);
  b.part(new THREE.SphereGeometry(1, 12, 9), headPaint, {
    at: H,
    dir: hd,
    axis: "z",
    scale: [0.0105, 0.0125, 0.016],
    bone: "head",
    name: "cranium",
  });

  // Snout
  const sd = V(0, -0.28, 1).normalize();
  const upS = V(0, 1, 0).addScaledVector(sd, -sd.y).normalize();
  const S0 = H.clone().addScaledVector(hd, 0.008).add(V(0, -0.003, 0));
  const S1 = S0.clone().addScaledVector(sd, 0.04);
  b.rod(S0, S1, [0.0058, 0.0042], { color: headPaint, bone: "head", name: "snout" });
  b.part(new THREE.BoxGeometry(0.0085, 0.0026, 0.006), LIP, {
    at: S1.clone().addScaledVector(sd, 0.0018).addScaledVector(upS, 0.0008),
    dir: sd,
    axis: "z",
    up: upS,
    bone: "head",
    name: "upperLip",
  });
  const jawAt = S1.clone().addScaledVector(sd, -0.002).addScaledVector(upS, -0.0018);
  b.joint("jaw", { at: jawAt, parent: "head", dir: sd, up: upS, role: "jaw" });
  b.part(new THREE.BoxGeometry(0.0078, 0.0022, 0.0065), LIP, {
    at: jawAt.clone().addScaledVector(sd, 0.003),
    dir: sd,
    axis: "z",
    up: upS,
    bone: "jaw",
    name: "lowerJaw",
  });

  // Eyes, cheeks, brow spines
  for (const sgn of [1, -1]) {
    const side = sgn > 0 ? "L" : "R";
    const E = H.clone().add(V(sgn * 0.0098, 0.0035, 0.003));
    const out = V(sgn, 0.1, 0.35).normalize();
    const eye = `eye${side}`;
    b.joint(eye, { at: E, parent: "head", dir: out });
    b.part(new THREE.SphereGeometry(0.0062, 14, 10), "#fdf8ec", { at: E, bone: eye, name: `sclera${side}` });
    b.part(new THREE.SphereGeometry(0.0063, 16, 6, 0, Math.PI * 2, 0, 0.95), "#e0a52b", {
      at: E, dir: out, axis: "y", bone: eye, name: `irisRing${side}`,
    });
    b.part(new THREE.SphereGeometry(0.0064, 16, 6, 0, Math.PI * 2, 0, 0.75), "#1d7d7a", {
      at: E, dir: out, axis: "y", bone: eye, name: `iris${side}`,
    });
    b.part(new THREE.SphereGeometry(0.0065, 16, 4, 0, Math.PI * 2, 0, 0.42), "#0d1416", {
      at: E, dir: out, axis: "y", bone: eye, name: `pupil${side}`,
    });
    const hv = out.clone().add(V(0, 0.55, 0.35)).normalize();
    b.part(new THREE.SphereGeometry(0.0012, 8, 6), "#ffffff", {
      at: E.clone().addScaledVector(hv, 0.0064), bone: eye, name: `glint${side}`,
    });
    b.part(new THREE.TorusGeometry(0.0062, 0.0011, 6, 18), RIDGE, {
      at: E.clone().addScaledVector(out, 0.0015), dir: out, axis: "z", bone: "head", name: `eyeRim${side}`,
    });
    // Brow spine
    b.spike(E.clone().add(V(0, 0.0055, -0.001)), [sgn * 0.4, 1, -0.3], 0.0045, 0.0011, {
      bands: [[0.55, SPINE], [1, SPINE_TIP]], bone: "head", name: `brow${side}`,
    });
    // Cheek plate + spine
    const C = H.clone().add(V(sgn * 0.0075, -0.004, -0.005));
    b.part(new THREE.SphereGeometry(1, 10, 8), headPaint, {
      at: C, scale: [0.004, 0.0065, 0.0065], bone: "head", name: `cheek${side}`,
    });
    b.spike(C.clone().add(V(sgn * 0.003, -0.002, -0.002)), [sgn * 0.6, -0.3, -0.6], 0.004, 0.001, {
      bands: [[0.55, SPINE], [1, SPINE_TIP]], bone: "head", name: `cheekSpine${side}`,
    });
  }

  // Crown (coronet)
  const T = H.clone().add(V(0, 0.0125, -0.003));
  b.part(new THREE.CylinderGeometry(0.0028, 0.0042, 0.005, 7), SPINE, {
    at: T, rotation: [-12, 0, 0], bone: "head", name: "coronet", flat: true,
  });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const base = T.clone().add(V(Math.sin(a) * 0.0022, 0.002, Math.cos(a) * 0.0022));
    b.spike(base, [Math.sin(a) * 0.55, 1, Math.cos(a) * 0.55 - 0.15], 0.0055, 0.001, {
      bands: [[0.6, SPINE], [1, SPINE_TIP]], bone: "head", name: `crownSpike${i + 1}`,
    });
  }
  b.spike(T.clone().add(V(0, 0.002, 0)), [0, 1, -0.2], 0.0075, 0.0012, {
    bands: [[0.6, SPINE], [1, SPINE_TIP]], bone: "head", name: "crownSpikeTop",
  });

  // ---------------------------------------------------------------- fins
  b.joint("dorsalFin", { at: [0, 0.17, 0.03], parent: "spine2", dir: [0, 0, -1], role: "fan" });
  const fin: Array<[number, number] | [number, number, "sharp"]> = [
    [-0.004, 0, "sharp"],
    [-0.004, 0.05, "sharp"],
  ];
  for (let i = 0; i <= 10; i++) {
    const y = 0.048 - i * 0.0046;
    const env = 0.35 + 0.65 * Math.sin(Math.PI * (i / 10));
    fin.push([env * (i % 2 ? 0.0155 : 0.019), y]);
  }
  b.extrude(fin, {
    color: finPaint,
    at: [0, 0.145, 0.032],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.0012,
    smoothing: 1,
    bone: "dorsalFin",
    name: "dorsalFin",
  });

  for (const sgn of [1, -1]) {
    const side = sgn > 0 ? "L" : "R";
    const j = `pectoral${side}`;
    b.joint(j, { at: [sgn * 0.007, 0.236, 0.02], parent: "neck", dir: [sgn, 0, -0.6], role: "fan" });
    b.slab(
      [
        [sgn * 0.006, 0.231, 0.022],
        [sgn * 0.006, 0.241, 0.019],
        [sgn * 0.013, 0.246, 0.013],
        [sgn * 0.018, 0.241, 0.01],
        [sgn * 0.016, 0.233, 0.012],
      ],
      { color: finPaint, thickness: 0.0012, bone: j, name: `pectoralFin${side}` },
    );
  }

  return b.root;
}
```