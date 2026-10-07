```ts
import * as THREE from "three";
import { createBuilder, frame, rng, paint, scales, mix, mottle, gradient, svg, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Nine-banded Armadillo",
  description:
    "A stylised nine-banded armadillo with banded, tiled armour in dusty pinkish-tan, a pointy snout on a separate jaw, tall leathery ears, beady eyes, clawed feet, a ringed tapering tail and coarse pale hairs between the bands.",
};

export default function build() {
  const b = createBuilder({ name: "armadillo", paintSize: 1024 });
  const R = rng(11);

  // ---------- palette ----------
  const SHELL = "#c8a08a";
  const SHELL2 = "#d4ae97";
  const LIGHT = "#e6c8b0";
  const EDGE = "#8a6656";
  const DEEP = "#6e5045";
  const HEADSKIN = "#cfa99b";
  const HAIR = "#f1e7d6";

  // ---------- skeleton ----------
  const pelvis = b.joint("pelvis", { at: [0, 0.15, -0.13], dir: [0, 0, 1] });
  const spine = b.chain("spine", [[0, 0.15, -0.13], [0, 0.155, -0.01], [0, 0.155, 0.12]], {
    parent: pelvis,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const neck = b.chain("neck", [[0, 0.155, 0.12], [0, 0.158, 0.19]], {
    parent: "chest",
    names: ["neck"],
    role: "neck",
  });
  const head = b.joint("head", { parent: "neck", at: [0, 0.158, 0.2], dir: [0, -0.25, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.13, 0.24], aim: [0, 0.105, 0.345], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([[0, 0.12, -0.21], [0, 0.103, -0.33], [0, 0.078, -0.44], [0, 0.056, -0.56]]),
    { parent: pelvis, count: 4, names: ["tail1", "tail2", "tail3", "tail4", "tailTip"], role: "tail" },
  );

  // ---------- paints ----------
  const skinPaint = mottle("#dcb7a9", "#c99f93", { size: 0.03, seed: 2 });
  const legPaint = scales(["#b48e82", "#c09b8e"], "#7f6158", { size: 0.007, width: 0.2, seed: 4 });
  const shieldScales = scales(["#c59b85", "#cfa892", "#bd937e", "#d6b29b"], EDGE, { size: 0.017, width: 0.16, seed: 3 });
  const shieldFill = paint((p) => (p.y < 0.098 ? DEEP : p.y < 0.106 ? EDGE : shieldScales));
  const headScales = scales(["#c59b85", "#d3ad96"], EDGE, { size: 0.009, width: 0.18, seed: 8 });

  const bandPaint = (zc: number, seed: number) =>
    paint((p) => {
      const a = Math.atan2(p.y - 0.12, p.x);
      const k = (a / Math.PI) * 24;
      const i = Math.floor(k);
      const f = k - i;
      const dz = ((p.y - 0.12) * 0.139 + (p.z - zc) * 0.99) / 0.017 + 0.5;
      if (Math.min(f, 1 - f) < 0.07) return EDGE;
      if (p.y < 0.095) return DEEP;
      const h = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
      const r = h - Math.floor(h);
      const base = mix(SHELL, SHELL2, r);
      if (dz < 0.22) return mix(base, LIGHT, 0.75);
      if (dz > 0.85) return mix(base, EDGE, 0.4);
      return base;
    });

  const tailPaint = paint((p, n, s) => {
    const k = s[0] * 18;
    const f = k - Math.floor(k);
    if (f < 0.13) return EDGE;
    const g = ((s[1] / 360) * 12) % 1;
    if (g < 0.07) return DEEP;
    if (f > 0.82) return LIGHT;
    const h = Math.sin(Math.floor(k) * 7.31 + Math.floor((s[1] / 360) * 12) * 3.7) * 9137.13;
    return mix(SHELL, SHELL2, h - Math.floor(h));
  });

  // ---------- body core ----------
  b.loft(
    [
      { at: [0, 0.15, -0.21], w: 0.12, h: 0.1 },
      { at: [0, 0.15, -0.12], w: 0.19, h: 0.16 },
      { at: [0, 0.15, 0.02], w: 0.19, h: 0.16 },
      { at: [0, 0.153, 0.13], w: 0.15, h: 0.13 },
      { at: [0, 0.156, 0.2], w: 0.075, h: 0.07 },
    ],
    { color: skinPaint, bone: [spine, neck] },
  );

  // ---------- shell: shields ----------
  const capGeo = new THREE.SphereGeometry(1, 16, 9, 0, Math.PI * 2, 0, Math.PI * 0.58);
  b.part(capGeo, shieldFill, { at: [0, 0.12, -0.135], scale: [0.118, 0.138, 0.11], bone: pelvis, name: "pelvicShield" });
  b.part(capGeo, shieldFill, { at: [0, 0.12, 0.085], scale: [0.112, 0.13, 0.085], bone: "spine2", name: "scapularShield" });

  // ---------- shell: nine bands ----------
  const bandZ: number[] = [];
  const bandR: Array<[number, number]> = [];
  for (let i = 0; i < 9; i++) {
    const zc = 0.035 - i * 0.0135;
    const s = 1 - (0.035 * Math.abs(i - 4)) / 4;
    const rx = 0.121 * s;
    const ry = 0.142 * s;
    const th = 0.0065;
    const N = 18;
    const outer: number[][] = [];
    const inner: number[][] = [];
    for (let k = 0; k <= N; k++) {
      const a = ((-14 + (208 * k) / N) * Math.PI) / 180;
      outer.push([rx * Math.cos(a), ry * Math.sin(a)]);
      inner.push([(rx - th) * Math.cos(a), (ry - th) * Math.sin(a)]);
    }
    b.extrude([...outer, ...inner.reverse()], {
      color: bandPaint(zc, i + 1),
      at: [0, 0.12, zc],
      x: [1, 0, 0],
      y: [0, 1, -0.14],
      thickness: 0.017,
      bevel: 0.0015,
      bone: zc < -0.01 ? "spine1" : "spine2",
      name: `band${i + 1}`,
    });
    bandZ.push(zc);
    bandR.push([rx, ry]);
  }

  // ---------- tail ----------
  b.sweep(tail, (t: number) => 0.003 + 0.026 * Math.pow(1 - t, 1.1), {
    color: tailPaint,
    caps: { start: "round", end: "point" },
    sides: 10,
  });

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(1, 12, 9), HEADSKIN, {
    at: [0, 0.152, 0.228],
    scale: [0.044, 0.04, 0.052],
    bone: head,
    name: "skull",
  });
  b.part(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), headScales, {
    at: [0, 0.158, 0.24],
    scale: [0.036, 0.03, 0.062],
    rotation: [12, 0, 0],
    bone: head,
    name: "headShield",
  });

  const snoutBase = new THREE.Vector3(0, 0.15, 0.255);
  const snoutTip = new THREE.Vector3(0, 0.118, 0.37);
  const snoutLen = snoutBase.distanceTo(snoutTip);
  b.part(new THREE.CylinderGeometry(0.009, 0.03, snoutLen, 10), gradient(HEADSKIN, "#b88d81", snoutBase, snoutTip), {
    at: snoutBase.clone().lerp(snoutTip, 0.5),
    dir: snoutTip.clone().sub(snoutBase),
    scale: [1, 1, 0.85],
    bone: head,
    name: "snout",
  });
  b.part(new THREE.SphereGeometry(0.011, 10, 7), "#7a4f4a", {
    at: snoutTip,
    scale: [1, 0.8, 0.7],
    bone: head,
    name: "nosePad",
  });
  for (const sx of [1, -1])
    b.part(new THREE.SphereGeometry(0.0025, 6, 4), "#3a2422", {
      at: [sx * 0.004, 0.121, 0.377],
      bone: head,
      name: sx > 0 ? "nostrilL" : "nostrilR",
    });

  const jawBase = new THREE.Vector3(0, 0.13, 0.24);
  const jawTip = new THREE.Vector3(0, 0.105, 0.345);
  b.part(new THREE.CylinderGeometry(0.006, 0.018, jawBase.distanceTo(jawTip), 8), "#c49b8f", {
    at: jawBase.clone().lerp(jawTip, 0.5),
    dir: jawTip.clone().sub(jawBase),
    scale: [1, 1, 0.7],
    bone: jaw,
    name: "lowerJaw",
  });

  // ears
  const earPaint = paint((p, n, s) => {
    if (Math.abs(s[0]) < 0.0065 && s[1] > 0.008 && s[1] < 0.045) return "#d3a59b";
    return mix("#b08a80", "#7f5f57", s[1] / 0.058);
  });
  const earOutline: (number | string)[][] = [
    [-0.009, 0],
    [0.009, 0],
    [0.015, 0.018],
    [0.013, 0.038],
    [0.006, 0.052],
    [0, 0.058, "sharp"],
    [-0.007, 0.05],
    [-0.012, 0.034],
    [-0.013, 0.015],
  ];
  for (const sx of [1, -1]) {
    const S = sx > 0 ? "L" : "R";
    const ear = b.joint(`ear${S}`, { parent: head, at: [sx * 0.026, 0.18, 0.212], dir: [sx * 0.45, 1, -0.35], role: "hinge" });
    b.extrude(earOutline, {
      color: earPaint,
      at: ear,
      x: [-sx * 0.6, 0, 1],
      y: [sx * 0.45, 1, -0.35],
      thickness: 0.004,
      bevel: 0.0012,
      smoothing: 1,
      bone: ear,
      name: `earFlap${S}`,
    });

    // eyes
    const eyeAt = new THREE.Vector3(sx * 0.031, 0.163, 0.262);
    b.part(new THREE.SphereGeometry(0.0055, 10, 7), "#16100e", { at: eyeAt, bone: head, name: `eye${S}` });
    b.part(new THREE.SphereGeometry(0.0016, 6, 4), "#ffffff", {
      at: eyeAt.clone().add(new THREE.Vector3(sx * 0.0035, 0.003, 0.0035)),
      bone: head,
      name: `eyeGlint${S}`,
    });
    b.part(new THREE.TorusGeometry(0.0062, 0.0014, 5, 12), "#9b7569", {
      at: eyeAt,
      dir: [sx * 0.6, 0.2, 0.75],
      axis: "z",
      bone: head,
      name: `eyelid${S}`,
    });
  }

  // ---------- legs ----------
  const sphere = new THREE.SphereGeometry(1, 10, 7);
  const leg = (sx: number, front: boolean) => {
    const S = sx > 0 ? "L" : "R";
    const x0 = (front ? 0.062 : 0.065) * sx;
    const x1 = (front ? 0.072 : 0.078) * sx;
    const pts: number[][] = front
      ? [[x0, 0.13, 0.11], [x1, 0.075, 0.125], [x1, 0.026, 0.13], [x1, 0.009, 0.165]]
      : [[x0, 0.13, -0.15], [x1, 0.08, -0.12], [x1, 0.03, -0.158], [x1, 0.009, -0.115]];
    const names = front
      ? [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`]
      : [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`];
    const ch = b.chain(front ? `arm${S}` : `leg${S}`, pts, {
      parent: front ? "spine2" : pelvis,
      names,
      role: "leg",
    });
    const [j0, j1, j2, j3] = ch.joints;
    b.capsule(pts[0], pts[1], front ? [0.026, 0.019] : [0.03, 0.021], { color: legPaint, bone: j0 });
    b.capsule(pts[1], pts[2], front ? [0.017, 0.013] : [0.019, 0.014], { color: legPaint, bone: j1 });
    const fz = front ? 0.15 : -0.135;
    const fr = front ? 0.027 : 0.03;
    b.part(sphere, legPaint, {
      at: [x1, 0.01, fz],
      scale: [front ? 0.018 : 0.02, 0.009, fr],
      bone: j2,
      name: `${front ? "hand" : "foot"}Pad${S}`,
    });
    const lens = front ? [0.012, 0.02, 0.02, 0.01] : [0.009, 0.014, 0.016, 0.014, 0.009];
    lens.forEach((len, k) => {
      const off = (k / (lens.length - 1) - 0.5) * (front ? 0.024 : 0.028);
      const bz = fz + fr - 0.006;
      b.spike([x1 + off, 0.009, bz], [x1 + off * 1.25, 0.002, bz + len], null, 0.0032, {
        color: "#e3d5c0",
        bone: j3,
        sides: 6,
      });
    });
  };
  for (const sx of [1, -1]) {
    leg(sx, true);
    leg(sx, false);
  }

  // ---------- coarse pale hairs ----------
  const hairTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 64"><path d="M8 64 C7 44 9 24 6 2" stroke="#ffffff" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M10 64 C11 46 12 30 13 14" stroke="#d8d8d8" stroke-width="1.7" fill="none" stroke-linecap="round"/></svg>`,
    { size: 64 },
  );
  const hairFrames = [];
  for (let i = 0; i < 9; i++) {
    const z = bandZ[i] - 0.0075;
    const [rx, ry] = bandR[i];
    for (const deg of [-10, 4, 18, 34, 146, 162, 176, 190]) {
      const a = ((deg + (R() - 0.5) * 8) * Math.PI) / 180;
      const p = new THREE.Vector3(rx * Math.cos(a), 0.12 + ry * Math.sin(a) + 0.002, z);
      const nrm = new THREE.Vector3(Math.cos(a) / rx, Math.sin(a) / ry, 0).normalize().add(new THREE.Vector3(0, 0, -0.3));
      hairFrames.push(frame(p, nrm));
    }
  }
  // along the shield rims
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2;
    const front = k % 2 === 0;
    const cz = front ? 0.085 : -0.135;
    const rz = front ? 0.085 : 0.11;
    const p = new THREE.Vector3(Math.sin(a) * 0.115, 0.093, cz + Math.cos(a) * rz * 0.97);
    if (Math.abs(p.z) < 0.08 && Math.abs(p.x) > 0.05) continue;
    hairFrames.push(frame(p, [Math.sin(a), -0.4, Math.cos(a) * 0.5]));
  }
  b.cards(hairFrames, hairTex, {
    size: [0.006, 0.024],
    lean: 25,
    bend: 20,
    flow: [0, -1, -0.4],
    color: HAIR,
    vary: 0.3,
    spin: 25,
    rng: rng(5),
    bone: "spine1",
  });

  // belly hairs
  const belly = [];
  for (let k = 0; k < 46; k++) {
    const z = -0.17 + R() * 0.3;
    const x = (R() - 0.5) * 0.13;
    const y = 0.15 - 0.078 * Math.sqrt(Math.max(0.05, 1 - (x / 0.095) ** 2));
    belly.push(frame([x, y + 0.003, z], [x * 4, -1, -0.15]));
  }
  b.cards(belly, hairTex, {
    size: [0.005, 0.02],
    lean: 20,
    flow: [0, -0.3, -1],
    color: "#e9dcc8",
    vary: 0.35,
    spin: 30,
    rng: rng(9),
    bone: "spine1",
  });

  // a few snout bristles
  const whiskers = [];
  for (let k = 0; k < 8; k++) {
    const sx = k % 2 ? 1 : -1;
    const t = 0.35 + (k >> 1) * 0.12;
    const p = snoutBase.clone().lerp(snoutTip, t);
    p.x += sx * (0.022 - t * 0.016);
    whiskers.push(frame(p, [sx, 0.3, 0.3]));
  }
  b.cards(whiskers, hairTex, { size: [0.004, 0.016], lean: 30, flow: [0, -0.2, -1], color: HAIR, bone: head });

  return b.root;
}
```