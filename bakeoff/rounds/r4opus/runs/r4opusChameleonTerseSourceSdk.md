```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  limb,
  paint,
  mottle,
  stripes,
  countershade,
  cells,
  resolve,
  rgb,
  mix,
  smoothstep,
} from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";

export const meta = {
  name: "Chameleon",
  description:
    "A stylized veiled chameleon in a rest pose: tall striped casque, turret eyes on their own joints, a dorsal crest, mitten-grip feet, an opening jaw and a curled prehensile tail.",
};

/** Granular chameleon skin: small tiles with dark seams, varied shading and a few pale tubercles. */
function skinOf(base: ColorInput, speck: string, size = 0.0055, seed = 4) {
  const sp = rgb(speck);
  return paint((p, n) => {
    const c = cells(p, size, seed);
    const face = c.id > 0.93 ? sp : resolve(base, p, n);
    const shade = 0.9 + 0.18 * c.id - 0.12 * Math.min(c.d1, 1);
    const lit: [number, number, number] = [
      Math.min(face[0] * shade, 1),
      Math.min(face[1] * shade, 1),
      Math.min(face[2] * shade, 1),
    ];
    const dark: [number, number, number] = [face[0] * 0.55, face[1] * 0.62, face[2] * 0.55];
    return mix(dark, lit, smoothstep(0.04, 0.14, c.d2 - c.d1));
  });
}

export default function build() {
  const b = createBuilder({ name: "chameleon", paintSize: 1024 });

  // ---------------------------------------------------------------- palette & paints
  const YELLOW = "#f1c232";
  const TEAL = "#2bb9a6";
  const CLAW = "#3b2f22";
  const PINK = "#e46a7a";
  const greens = mottle("#36a646", "#5cc251", { size: 0.025, seed: 2 });
  const banded = stripes(greens, [YELLOW, TEAL, YELLOW], { size: 0.034, axis: "z", width: 0.34, wobble: 0.3, seed: 7 });
  const bodyBase = countershade(banded, "#bcd85a", { level: -0.6, soft: 0.2 });
  const bodySkin = skinOf(bodyBase, "#effad0");

  const cheek = paint((p, n) => {
    const d = Math.hypot((Math.abs(p.x) - 0.017) / 0.012, (p.y - 0.112) / 0.008, (p.z - 0.128) / 0.022);
    return d < 1 ? "#f29a35" : bodyBase;
  });
  const headSkin = skinOf(cheek, "#f4fbd8", 0.0045);
  const upperHeadPaint = paint((p, n) => (n.y < -0.75 && p.y < 0.109 ? PINK : headSkin));
  const jawPaint = paint((p, n) => (n.y > 0.75 && p.y > 0.104 ? PINK : headSkin));

  const legGreens = mottle("#2f9a40", "#4cb64a", { size: 0.02, seed: 12 });
  const legSkin = skinOf(stripes(legGreens, YELLOW, { size: 0.03, axis: "y", width: 0.3, seed: 3 }), "#eafad0", 0.0045);
  const toeSkin = skinOf("#9ccf4c", "#eef8c8", 0.0035, 9);

  const casqueSkin = skinOf(
    stripes(greens, [TEAL, YELLOW], { size: 0.022, axis: [0, 0.4, 1], width: 0.4, wobble: 0.25, seed: 21 }),
    "#effad0",
    0.005,
  );

  // ---------------------------------------------------------------- skeleton
  b.joint("root", { at: [0, 0, -0.01] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.105, -0.065],
      [0, 0.109, -0.015],
      [0, 0.112, 0.035],
      [0, 0.115, 0.07],
    ]),
    { names: ["pelvis", "spine1", "chest"], role: "spine", parent: "root" },
  );
  const neck = b.chain(
    "neck",
    polyline([
      [0, 0.115, 0.07],
      [0, 0.122, 0.1],
    ]),
    { names: ["neck"], role: "neck", parent: "chest" },
  );
  const head = b.joint("head", { parent: "neck", at: [0, 0.122, 0.1], dir: [0, -0.08, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.108, 0.105], aim: [0, 0.099, 0.185], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.108, -0.08],
      [0, 0.104, -0.13],
      [0, 0.094, -0.18],
      [0, 0.078, -0.225],
      [0, 0.056, -0.255],
      [0, 0.033, -0.263],
      [0, 0.019, -0.246],
      [0, 0.022, -0.226],
      [0, 0.036, -0.222],
    ]),
    { count: 9, role: "tail", parent: "pelvis" },
  );

  // ---------------------------------------------------------------- body
  const body = b.loft(
    [
      { at: [0, 0.104, -0.1], w: 0.03, h: 0.04 },
      { at: [0, 0.106, -0.065], w: 0.046, h: 0.068 },
      { at: [0, 0.11, -0.015], w: 0.056, h: 0.092 },
      { at: [0, 0.113, 0.035], w: 0.054, h: 0.088 },
      { at: [0, 0.117, 0.075], w: 0.04, h: 0.058 },
      { at: [0, 0.122, 0.105], w: 0.032, h: 0.042 },
    ],
    { color: bodySkin, bone: [spine, neck], sides: 14, name: "body" },
  );

  const tailTube = b.sweep(tail, (t: number) => [0.016 * (1 - 0.78 * t), 0.021 * (1 - 0.8 * t)] as const, {
    color: bodySkin,
    sides: 10,
    name: "tailSkin",
  });

  // Dorsal crest: serrated spikes leaning back, tallest over the shoulders.
  b.along(
    body,
    18,
    (pt) => {
      const k = Math.sin(Math.PI * Math.min(Math.max((pt.t - 0.05) / 0.9, 0), 1));
      const dir = pt.axis.add(new THREE.Vector3(0, 0, -0.45));
      b.spike(pt.moved([0, -0.0012, 0]), dir, null === null ? 0.004 + 0.007 * k : 0, 0.0022 + 0.0012 * k, {
        color: Math.round(pt.t * 18) % 2 ? "#e4c33a" : "#8fcf45",
        sides: 4,
      });
    },
    { from: 0.06, to: 0.92 },
  );
  b.along(
    tailTube,
    10,
    (pt) => {
      const k = 1 - pt.t / 0.5;
      const dir = pt.axis.add(new THREE.Vector3(0, 0, -0.5));
      b.spike(pt.moved([0, -0.001, 0]), dir, 0.002 + 0.004 * k, 0.0014 + 0.001 * k, {
        color: Math.round(pt.t * 20) % 2 ? "#e4c33a" : "#8fcf45",
        sides: 4,
      });
    },
    { from: 0.02, to: 0.45 },
  );

  // Ventral crest of small white scales and a lateral row of pale tubercles.
  for (let i = 0; i < 9; i++) {
    const pt = body.at(0.18 + (0.6 * i) / 8, 180);
    b.spike(pt.moved([0, -0.001, 0]), pt.axis.add(new THREE.Vector3(0, 0, -0.4)), 0.0045, 0.0017, {
      color: "#f3f6dc",
      sides: 4,
    });
  }
  const dot = new THREE.SphereGeometry(0.0028, 6, 4);
  for (let i = 0; i < 7; i++)
    for (const deg of [100, -100]) {
      const pt = body.at(0.25 + (0.5 * i) / 6, deg);
      b.stick(dot, "#f2f7da", pt, { embed: 0.45 });
    }

  // ---------------------------------------------------------------- legs and mitten feet
  const legDefs = [
    {
      root: [0.02, 0.095, 0.045],
      target: [0.06, 0.016, 0.06],
      lengths: [0.05, 0.046],
      bend: [0.6, 0, -1],
      parent: "chest",
      names: ["shoulder", "elbow", "wrist"],
      chain: "arm",
      toe: "finger",
      toes: [
        { off: [-0.008, 0.026], r: [0.0068, 0.0058] },
        { off: [0.009, -0.02], r: [0.006, 0.005] },
      ],
    },
    {
      root: [0.02, 0.092, -0.055],
      target: [0.06, 0.016, -0.072],
      lengths: [0.052, 0.048],
      bend: [0.6, 0, 1],
      parent: "pelvis",
      names: ["hip", "knee", "ankle"],
      chain: "leg",
      toe: "toe",
      toes: [
        { off: [0.009, 0.022], r: [0.006, 0.005] },
        { off: [-0.006, -0.026], r: [0.0068, 0.0058] },
      ],
    },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const def of legDefs) {
      const root = [def.root[0] * s, def.root[1], def.root[2]];
      const target = [def.target[0] * s, def.target[1], def.target[2]];
      const pts = limb(root, target, def.lengths, [def.bend[0] * s, def.bend[1], def.bend[2]]);
      const chain = b.chain(`${def.chain}${side}`, polyline(pts), {
        names: def.names.map((n) => `${n}${side}`),
        role: "leg",
        parent: def.parent,
        contact: [target[0], 0, target[2]],
      });
      b.sweep(chain, [0.011, 0.0085, 0.0072], { color: legSkin, sides: 8 });
      const wrist = chain.joints[chain.joints.length - 1];
      const w = pts[pts.length - 1];
      def.toes.forEach((toe, k) => {
        const tip = new THREE.Vector3(w.x + toe.off[0] * s, toe.r[1], w.z + toe.off[1]);
        const { chain: toeChain } = b.sprout(`${def.toe}${k === 0 ? "A" : "B"}${side}`, wrist, tip, [toe.r[0], toe.r[1]], {
          color: toeSkin,
          role: "digit",
          sides: 8,
        });
        const toeJoint = toeChain!.joints[0];
        const flat = tip.clone().sub(w).setY(0).normalize();
        const across = new THREE.Vector3(-flat.z, 0, flat.x);
        const clawDir = flat.clone().add(new THREE.Vector3(0, -0.55, 0));
        for (const o of [-1, 1]) {
          const base = tip.clone().addScaledVector(flat, 0.003).addScaledVector(across, o * 0.0024);
          b.spike(base, clawDir, 0.0055, 0.0016, { color: CLAW, bone: toeJoint, sides: 4 });
        }
      });
    }
  }

  // ---------------------------------------------------------------- head
  const upperHead = b.loft(
    [
      { at: [0, 0.128, 0.092], w: 0.036, h: 0.044 },
      { at: [0, 0.127, 0.12], w: 0.044, h: 0.044 },
      { at: [0, 0.121, 0.15], w: 0.036, h: 0.032 },
      { at: [0, 0.114, 0.175], w: 0.022, h: 0.02 },
      { at: [0, 0.112, 0.188], w: 0.012, h: 0.012 },
    ],
    { color: upperHeadPaint, bone: "head", sides: 10, name: "skull" },
  );
  const jaw = b.loft(
    [
      { at: [0, 0.103, 0.1], w: 0.034, h: 0.026 },
      { at: [0, 0.1, 0.13], w: 0.036, h: 0.022 },
      { at: [0, 0.099, 0.158], w: 0.028, h: 0.016 },
      { at: [0, 0.102, 0.18], w: 0.016, h: 0.01 },
      { at: [0, 0.105, 0.19], w: 0.008, h: 0.006 },
    ],
    { color: jawPaint, bone: "jaw", sides: 10, name: "lowerJaw" },
  );
  b.capsule([0, 0.104, 0.112], [0, 0.104, 0.16], 0.006, { color: PINK, bone: "jaw", name: "tongue" });

  // Gular crest under the chin.
  for (let i = 0; i < 6; i++) {
    const pt = jaw.at(0.12 + (0.6 * i) / 5, 180);
    b.spike(pt.moved([0, -0.001, 0]), pt.axis.add(new THREE.Vector3(0, 0, -0.3)), 0.0045 - 0.0004 * i, 0.0016, {
      color: "#f3f6dc",
      sides: 4,
    });
  }

  // The casque: a tall helmet blade swept up and back over the neck.
  b.extrude(
    [
      [0.045, 0.012],
      [0.02, 0.034],
      [-0.005, 0.056],
      [-0.03, 0.072, "sharp"],
      [-0.043, 0.05],
      [-0.04, 0.022],
      [-0.02, 0.0],
      [0.02, -0.002],
    ],
    {
      color: casqueSkin,
      at: head,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.03, 0.006],
      bevel: 0.004,
      smoothing: 1,
      bone: "head",
      name: "casque",
    },
  );

  // Smiling lip line and nostrils, draped onto the head.
  const headSurf = b.surface([upperHead, jaw]);
  for (const s of [1, -1]) {
    const lip = headSurf.drape(
      catmull([
        [s * 0.02, 0.106, 0.108],
        [s * 0.019, 0.105, 0.135],
        [s * 0.015, 0.105, 0.16],
        [s * 0.008, 0.106, 0.184],
      ]),
      { lift: 0.0004 },
    );
    b.sweep(lip, 0.0017, { color: "#f6eaa2", bone: "head", sides: 5, name: `lip${s > 0 ? "L" : "R"}` });
    const nose = headSurf.nearest([s * 0.008, 0.118, 0.185]);
    b.stick(new THREE.SphereGeometry(0.0018, 6, 4), "#1d3d22", nose, { embed: 0.6, bone: "head" });
  }

  // Turret eyes: each on its own joint, ringed skin closing in on a gold-rimmed pupil.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const c = new THREE.Vector3(0.019 * s, 0.131, 0.133);
    const dir = new THREE.Vector3(s, 0.22, 0.6).normalize();
    const eye = b.joint(`eye${side}`, { parent: "head", at: c, dir });
    const eyePaint = paint((p) => {
      const a = p.clone().sub(c).normalize().angleTo(dir);
      if (a < 0.42) return "#f0c64a";
      if (a < 0.5) return "#2c7a36";
      return Math.sin(a * 26) > 0.25 ? "#2f8c3e" : "#5cc455";
    });
    b.part(new THREE.SphereGeometry(0.0135, 14, 10), eyePaint, { at: c, dir, bone: eye, scale: [1, 1.12, 1] });
    b.part(new THREE.SphereGeometry(0.0036, 8, 6), "#121212", {
      at: c.clone().addScaledVector(dir, 0.0146),
      bone: eye,
    });
    b.part(new THREE.TorusGeometry(0.0045, 0.0013, 6, 14), "#f2b51e", {
      at: c.clone().addScaledVector(dir, 0.0142),
      dir,
      axis: "z",
      bone: eye,
    });
    const up = new THREE.Vector3(0, 1, 0).addScaledVector(dir, -dir.y).normalize();
    b.part(new THREE.SphereGeometry(0.0012, 6, 4), "#ffffff", {
      at: c.clone().addScaledVector(dir, 0.0172).addScaledVector(up, 0.0016),
      bone: eye,
    });
  }

  return b.root;
}
```