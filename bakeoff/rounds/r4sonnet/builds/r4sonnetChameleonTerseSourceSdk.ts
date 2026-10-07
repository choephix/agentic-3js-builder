import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  spiral,
  frame,
  rng,
  paint,
  mottle,
  stripes,
  spots,
  countershade,
  mix,
  rgb,
  smoothstep,
} from "../../../../src/index";
import type { Joint, OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Veiled Chameleon",
  description:
    "A stylised veiled chameleon gripping a bark branch: tall compressed body with a dorsal crest and flank studs, " +
    "casque helmet, conical turret eyes, hinged jaw, zygodactyl feet wrapped round the branch and a coiled prehensile tail. " +
    "Fully rigged (spine, neck, head, jaw, eyes, arms, legs, digits, 9-joint tail).",
};

const D2R = Math.PI / 180;
type P3 = [number, number, number];

// ---------------------------------------------------------------- palette
const GREEN = "#58b13a";
const LIME = "#9bd04a";
const DEEP = "#2c7a36";
const TEAL = "#1fa89b";
const CREAM = "#f1edb4";
const YELLOW = "#f5c840";
const ORANGE = "#ee8a32";
const CREST = "#e8dc78";
const CLAW = "#e9dcc0";
const EYE_RING = "#1d6b4c";
const IRIS = "#e3a42a";
const PUPIL = "#0b0b0b";
const MOUTH = "#2b1414";
const TONGUE = "#e0707f";
const ROOF = "#c75b6a";
const BARK = "#6e4d30";
const BARK_DARK = "#4a3320";
const BARK_LIGHT = "#8a6540";
const BARK_PALE = "#d9bf91";
const LEAF_A = "#2f7d4a";
const LEAF_B = "#4c9a3e";
const VEIN = "#a8d27a";
const RED = "#d63a2a";
const BLACK = "#121212";

const BR = 0.022; // branch radius, its axis runs along z at y = BR

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "veiled_chameleon" });
  const rand = rng(7);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------------------------------------------------------- paints
  const base = mottle(GREEN, LIME, { size: 0.03, seed: 3, contrast: 1.3 });
  const barred = stripes(base, TEAL, { size: 0.045, axis: "z", width: 0.3, wobble: 0.8, seed: 11 });
  const dotted = spots(barred, [YELLOW, ORANGE], { size: 0.024, amount: 0.12, seed: 5 });
  const back = paint((p, n) => mix(dotted.at(p, n), rgb(DEEP), 0.55 * smoothstep(0.55, 0.95, n.y)));
  const skin = countershade(back, CREAM, { level: -0.45, soft: 0.4 });

  const H: P3 = [0, 0.143, 0.165]; // head joint

  // pale lips and jaw, golden casque crown
  const headSkin = paint((p, n) => {
    let c = skin.at(p, n);
    const crown = smoothstep(0.17, 0.195, p.y) * smoothstep(0.183, 0.17, p.z);
    c = mix(c, rgb(YELLOW), 0.85 * crown);
    c = mix(c, rgb(CREAM), smoothstep(0.1385, 0.1315, p.y));
    return c;
  });

  // inner coils of the tail warm towards orange
  const tailSkin = paint((p, n) => {
    const d = Math.hypot(p.y - 0.066, p.z + 0.14);
    return mix(skin.at(p, n), rgb(ORANGE), 0.55 * smoothstep(0.032, 0.016, d));
  });

  // ---------------------------------------------------------------- skeleton
  const root = b.joint("root", { at: [0, 0, 0] });
  const pelvis = b.joint("pelvis", { parent: root, at: [0, 0.113, -0.045], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.113, -0.045],
      [0, 0.126, 0.0],
      [0, 0.126, 0.045],
      [0, 0.123, 0.085],
    ]),
    { parent: pelvis, up: [0, 1, 0], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.123, 0.085],
      [0, 0.128, 0.12],
      [0, 0.138, 0.145],
      [0, 0.143, 0.165],
    ]),
    { parent: spine, up: [0, 1, 0], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: H, dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, H[1] - 0.011, H[2] - 0.012], dir: [0, 0, 1], role: "jaw" });

  // ---------------------------------------------------------------- body
  const body = b.loft(
    [
      { at: [0, 0.11, -0.065], w: 0.03, h: 0.05 },
      { at: [0, 0.116, -0.04], w: 0.05, h: 0.085 },
      { at: [0, 0.126, 0.0], w: 0.058, h: 0.105 },
      { at: [0, 0.126, 0.045], w: 0.058, h: 0.104 },
      { at: [0, 0.123, 0.085], w: 0.052, h: 0.092 },
      { at: [0, 0.128, 0.12], w: 0.038, h: 0.07 },
      { at: [0, 0.138, 0.145], w: 0.03, h: 0.055 },
      { at: [0, 0.143, 0.165], w: 0.032, h: 0.05 },
    ],
    { color: skin, bone: [spine, neck], up: [0, 1, 0], sides: 10, smooth: false, name: "body" },
  );

  // dorsal crest of little serrations
  const crestCone = new THREE.ConeGeometry(0.0045, 0.012, 5);
  b.along(
    body,
    20,
    (p) => {
      const k = Math.min(Math.max((p.t - 0.05) / 0.8, 0), 1);
      b.stick(crestCone, CREST, p, { scale: 0.7 + 0.7 * Math.sin(Math.PI * k), embed: 0.25 });
    },
    { from: 0.08, to: 0.8 },
  );

  // lateral line of studs
  const hexStud = new THREE.CylinderGeometry(0.0062, 0.0075, 0.006, 6);
  for (let i = 0; i < 11; i++) {
    const t = 0.18 + i * 0.044;
    const k = 0.78 + 0.5 * Math.sin((Math.PI * i) / 10);
    const col = i % 4 === 2 ? ORANGE : CREAM;
    for (const a of [90, -90]) b.stick(hexStud, col, body.at(t, a, 0), { scale: k, embed: 0.6 });
  }

  // scattered pale granules on the flanks
  const bump = new THREE.IcosahedronGeometry(0.0034, 0);
  b.surface(body)
    .scatter(46, {
      rng: rand,
      minDist: 0.013,
      keepOut: (p) => Math.abs(p.y - 0.126) < 0.009 && p.z > -0.02 && p.z < 0.075,
      filter: (h) => Math.abs(h.n.x) > 0.5 && h.at.y > 0.1 && h.at.z > -0.045 && h.at.z < 0.1,
    })
    .forEach((h) => b.stick(bump, "#c9e58a", h, { scale: 0.8 + 0.5 * rand(), embed: 0.35 }));

  // gular (throat) crest
  const gularCone = new THREE.ConeGeometry(0.0035, 0.01, 4);
  for (let i = 0; i < 6; i++) b.stick(gularCone, CREAM, body.at(0.76 + i * 0.04, 180, 0), { scale: 0.8, embed: 0.25 });

  // ---------------------------------------------------------------- tail (coiled, prehensile)
  const tailPath = polyline([
    [0, 0.112, -0.045],
    [0, 0.112, -0.14],
  ]).concat(spiral([0, 0.066, -0.14], [0, 0.112, -0.14], [-1, 0, 0], { turns: 1.5, r1: 0.011, pitch: 0.01 }));
  const tail = b.chain("tail", tailPath, { parent: pelvis, count: 9, role: "tail" });
  b.sweep(tail, (t: number) => 0.0045 + 0.0142 * Math.pow(1 - t, 1.3), {
    color: tailSkin,
    sides: 8,
    smooth: false,
    name: "tail",
  });

  // ---------------------------------------------------------------- feet
  const toeR = (t: number) => (t < 0.78 ? 0.0046 - 0.0018 * (t / 0.78) : 0.0028 * (1 - (0.75 * (t - 0.78)) / 0.22));

  const foot = (tag: string, s: number, wrist: Joint, z0: number, front: boolean) => {
    // point on a ring of radius r round the branch, `deg` from the top towards this foot's outside
    const at = (deg: number, r: number, z: number): P3 => [
      s * r * Math.sin(deg * D2R),
      BR + r * Math.cos(deg * D2R),
      z,
    ];
    b.part(new THREE.IcosahedronGeometry(1, 1), skin, {
      at: at(30, 0.0262, z0),
      rotation: [0, 0, -30 * s],
      scale: [0.0125, 0.0068, 0.0175],
      bone: wrist,
    });
    const medial = front ? [-0.011, 0, 0.011] : [-0.0065, 0.0065];
    const lateral = front ? [-0.0065, 0.0065] : [-0.011, 0, 0.011];
    let n = 0;
    const toe = (start: number, dir: number, dz: number, span: number) => {
      n++;
      const name = `toe${front ? "F" : "H"}${tag}${n}`;
      const angles = [0, 0.34, 0.68, 1].map((f) => start + dir * span * f);
      const radii = [0.0263, 0.0259, 0.0254, 0.025];
      const pts = angles.map((a, k) => at(a, radii[k], z0 + dz * (1 + 0.3 * (k / 3))));
      const chain = b.chain(name, catmull(pts), {
        parent: wrist,
        count: 2,
        role: "digit",
        names: (i: number) => `${name}_${i + 1}`,
      });
      b.sweep(chain, toeR, { color: CLAW, bands: [[0.78, skin]], sides: 5, smooth: false });
    };
    medial.forEach((dz) => toe(24, -1, dz, Math.abs(dz) < 1e-6 ? 84 : 74));
    lateral.forEach((dz) => toe(38, 1, dz, Math.abs(dz) < 1e-6 ? 84 : 72));
  };

  // ---------------------------------------------------------------- limbs, eyes
  const eyeC = (s: number): P3 => [0.021 * s, H[1] + 0.01, H[2] + 0.02];
  const eyeDir = (s: number): P3 => {
    const v = V(0.86 * s, 0.14, 0.5).normalize();
    return [v.x, v.y, v.z];
  };

  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const m = (x: number, y: number, z: number): P3 => [x * s, y, z];
    const zf = s > 0 ? 0.12 : 0.098; // staggered grips
    const zh = s > 0 ? -0.03 : -0.05;

    const arm = b.chain(
      `arm${tag}`,
      [m(0.016, 0.104, 0.09), m(0.064, 0.08, 0.076 + (zf - 0.108) * 0.6), m(0.0205, 0.0505, zf)],
      { parent: spine, role: "arm", names: [`shoulder${tag}`, `elbow${tag}`, `wrist${tag}`] },
    );
    b.sweep(arm, (t: number) => 0.0108 - 0.0042 * t, { color: skin, sides: 6, smooth: false });
    foot(tag, s, arm.tip!, zf, true);

    const leg = b.chain(
      `leg${tag}`,
      [m(0.016, 0.102, -0.034), m(0.066, 0.078, -0.02 + (zh + 0.04) * 0.6), m(0.0205, 0.0505, zh)],
      { parent: pelvis, role: "leg", names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`] },
    );
    b.sweep(leg, (t: number) => 0.0122 - 0.0056 * t, { color: skin, sides: 6, smooth: false });
    foot(tag, s, leg.tip!, zh, false);

    // ---- turret eye
    const c = V(...eyeC(s));
    const d = V(...eyeDir(s));
    const eye = b.joint(`eye${tag}`, { parent: head, at: c.toArray(), dir: d.toArray() });
    const off = (k: number) => c.clone().addScaledVector(d, k).toArray();
    b.part(new THREE.SphereGeometry(0.0165, 9, 7), skin, { at: c.toArray(), bone: eye });
    b.part(new THREE.TorusGeometry(0.0102, 0.0024, 4, 10), EYE_RING, {
      at: off(0.013),
      dir: d.toArray(),
      axis: "z",
      bone: eye,
    });
    b.part(new THREE.SphereGeometry(0.0085, 8, 6), IRIS, { at: off(0.0125), bone: eye });
    b.part(new THREE.SphereGeometry(0.0045, 7, 5), PUPIL, { at: off(0.017), bone: eye });
    const upv = V(0, 1, 0).addScaledVector(d, -d.y).normalize();
    b.part(new THREE.SphereGeometry(0.0013, 4, 3), "#ffffff", {
      at: c.clone().addScaledVector(d, 0.0211).addScaledVector(upv, 0.002).toArray(),
      bone: eye,
    });

    // ---- brow arch over the eye, canthal ridge, nostril
    b.sweep(
      catmull([
        [0.0175 * s, H[1] + 0.0225, H[2] + 0.036],
        [0.0215 * s, H[1] + 0.0265, H[2] + 0.022],
        [0.0185 * s, H[1] + 0.033, H[2] + 0.006],
        [0.0115 * s, H[1] + 0.041, H[2] - 0.01],
      ]),
      [0.0028, 0.0034, 0.003, 0.0022],
      { color: headSkin, bone: head, sides: 5, smooth: false },
    );
    b.capsule(
      [0.0146 * s, H[1] + 0.017, H[2] + 0.034],
      [0.0125 * s, H[1] + 0.014, H[2] + 0.066],
      0.0034,
      { color: headSkin, bone: head, sides: 5, smooth: false },
    );
    b.part(new THREE.SphereGeometry(0.0026, 5, 4), "#1d2a14", {
      at: [0.014 * s, H[1] + 0.011, H[2] + 0.067],
      bone: head,
    });
  }

  // ---------------------------------------------------------------- head
  const skull: OutlinePoint[] = [
    [-0.02, -0.012],
    [0.07, -0.012],
    [0.079, -0.007],
    [0.081, 0.002],
    [0.076, 0.01],
    [0.064, 0.016],
    [0.046, 0.02],
    [0.026, 0.029],
    [0.008, 0.042],
    [-0.012, 0.058],
    [-0.034, 0.07],
    [-0.029, 0.045],
    [-0.025, 0.02],
    [-0.028, 0.002],
    [-0.026, -0.007],
  ];
  b.extrude(skull, { color: headSkin, at: H, thickness: [0.036, 0.008], bevel: 0.005, bone: head, name: "skull" });

  // casque rim serrations
  const rimA: [number, number] = [0.008, 0.042];
  const rimB: [number, number] = [-0.012, 0.058];
  const rimC: [number, number] = [-0.034, 0.07];
  const rimCone = new THREE.ConeGeometry(0.0028, 0.01, 4);
  for (let k = 0; k < 6; k++) {
    const q = (k + 0.5) / 6;
    const [p0, p1, f] = q < 0.5 ? [rimA, rimB, q * 2] : [rimB, rimC, (q - 0.5) * 2];
    const u = p0[0] + (p1[0] - p0[0]) * f;
    const v = p0[1] + (p1[1] - p0[1]) * f;
    b.stick(rimCone, "#f6c445", frame([0, H[1] + v, H[2] + u], [0, 0.92, -0.2]), { bone: head, embed: 0.3 });
  }

  // mouth: roof, lower jaw, dark lip line, tongue
  b.extrude(
    [
      [-0.005, -0.0128],
      [0.068, -0.0128],
      [0.068, -0.0118],
      [-0.005, -0.0118],
    ],
    { color: ROOF, at: H, thickness: 0.024, bone: head },
  );
  const jawLine: OutlinePoint[] = [
    [-0.02, -0.01],
    [0.071, -0.01],
    [0.074, -0.015],
    [0.066, -0.023],
    [0.04, -0.029],
    [0.01, -0.033],
    [-0.012, -0.034],
    [-0.024, -0.027],
    [-0.025, -0.017],
  ];
  b.extrude(jawLine, { color: headSkin, at: H, thickness: [0.026, 0.032], bevel: 0.004, bone: jaw, name: "lowerJaw" });
  b.extrude(
    [
      [-0.015, -0.0135],
      [0.071, -0.0135],
      [0.073, -0.0105],
      [-0.015, -0.0105],
    ],
    { color: MOUTH, at: H, thickness: 0.029, bone: jaw },
  );
  b.extrude(
    [
      [0.0, -0.0105],
      [0.058, -0.0105],
      [0.066, -0.006],
      [0.058, -0.0045],
      [0.0, -0.0045],
    ],
    { color: TONGUE, at: H, thickness: 0.011, bone: jaw },
  );

  // ---------------------------------------------------------------- the branch
  const branchR = (t: number) => (t < 0.72 ? BR : BR - (0.0075 * (t - 0.72)) / 0.28);
  const branch = b.sweep(
    [
      [0, BR, -0.08],
      [0, BR, 0.43],
    ],
    branchR,
    {
      color: BARK,
      bands: [
        [0.016, BARK_PALE],
        [0.2, BARK],
        [0.22, BARK_LIGHT],
        [0.5, BARK],
        [0.52, BARK_LIGHT],
        [0.8, BARK],
      ],
      sectors: [[100, 260, BARK_DARK]],
      sides: 8,
      smooth: false,
      caps: { start: "flat", end: "round" },
      bone: root,
      name: "branch",
    },
  );
  const stub = new THREE.ConeGeometry(0.005, 0.016, 5);
  for (const [t, a] of [
    [0.3, 105],
    [0.45, -100],
    [0.62, 110],
    [0.78, -105],
  ]) {
    b.stick(stub, BARK_DARK, branch.at(t, a, 0), { embed: 0.3, scale: 0.9 });
  }

  const twig = (pts: P3[], r0: number, r1: number) =>
    b.sweep(catmull(pts), [r0, r1], {
      color: BARK_LIGHT,
      sides: 5,
      smooth: false,
      bone: root,
      caps: { start: "none", end: "round" },
    });

  const LEAF: Array<[number, number] | [number, number, "sharp"]> = [
    [0, 0, "sharp"],
    [0.14, 0.12],
    [0.38, 0.19],
    [0.62, 0.16],
    [0.84, 0.08],
    [1, 0, "sharp"],
    [0.84, -0.08],
    [0.62, -0.16],
    [0.38, -0.19],
    [0.14, -0.12],
  ];
  const leaf = (baseP: THREE.Vector3, dir: THREE.Vector3, size: number, color: string) => {
    const d = dir.clone().normalize();
    const side = V(0, 1, 0).cross(d).normalize();
    const pts = LEAF.map((p): OutlinePoint => (p.length === 3 ? [p[0] * size, p[1] * size, "sharp"] : [p[0] * size, p[1] * size]));
    b.extrude(pts, {
      color,
      at: baseP.toArray(),
      x: d.toArray(),
      y: side.toArray(),
      thickness: 0.0018,
      smoothing: 1,
      bone: root,
    });
    b.rod(baseP.toArray(), baseP.clone().addScaledVector(d, 0.86 * size).toArray(), [0.0014, 0.0005], {
      color: VEIN,
      sides: 4,
      bone: root,
    });
    return { base: baseP, d, size };
  };

  twig(
    [
      [0, 0.034, 0.305],
      [0.04, 0.07, 0.335],
      [0.085, 0.095, 0.365],
    ],
    0.0065,
    0.0035,
  );
  const tipA = V(0.085, 0.095, 0.365);
  const hostLeaf = leaf(tipA, V(0.55, -0.12, 0.83), 0.095, LEAF_A);
  leaf(tipA, V(0.95, -0.25, 0.1), 0.08, LEAF_B);
  leaf(V(0.04, 0.07, 0.335), V(0.15, -0.05, 0.98), 0.07, LEAF_B);

  twig(
    [
      [0, 0.034, 0.36],
      [-0.035, 0.06, 0.395],
      [-0.075, 0.085, 0.43],
    ],
    0.006,
    0.0033,
  );
  const tipB = V(-0.075, 0.085, 0.43);
  leaf(tipB, V(-0.5, -0.1, 0.86), 0.09, LEAF_B);
  leaf(tipB, V(-0.95, -0.2, 0.15), 0.075, LEAF_A);

  // ---------------------------------------------------------------- a ladybird on the nearest leaf
  {
    const d = hostLeaf.d;
    const side = V(0, 1, 0).cross(d).normalize();
    const n = d.clone().cross(side).normalize();
    const c = hostLeaf.base.clone().addScaledVector(d, 0.55 * hostLeaf.size).addScaledVector(n, 0.002);
    b.part(new THREE.SphereGeometry(0.0055, 8, 6), RED, {
      at: c.toArray(),
      dir: d.toArray(),
      up: n.toArray(),
      axis: "z",
      scale: [1, 0.62, 1.2],
      bone: root,
    });
    b.part(new THREE.SphereGeometry(0.0027, 6, 5), BLACK, {
      at: c.clone().addScaledVector(d, 0.0064).addScaledVector(n, -0.0003).toArray(),
      bone: root,
    });
    for (const [a, w] of [
      [0.0012, 0.0027],
      [-0.0024, 0.0023],
      [0.0034, 0.0014],
    ]) {
      for (const sg of [1, -1]) {
        const hgt = 0.0034 * Math.sqrt(Math.max(0, 1 - (w / 0.0055) ** 2 - (a / 0.0066) ** 2));
        b.part(new THREE.SphereGeometry(0.0009, 4, 3), BLACK, {
          at: c.clone().addScaledVector(d, a).addScaledVector(side, sg * w).addScaledVector(n, hgt).toArray(),
          bone: root,
        });
      }
    }
  }

  return b.root;
}
