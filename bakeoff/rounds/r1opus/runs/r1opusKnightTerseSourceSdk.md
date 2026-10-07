```ts
import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, noise, scales, mottle, svg, frame } from "agentic-3js-builder";

export const meta = {
  name: "Armored Knight",
  description:
    "A knight in full plate standing in a rest T-pose. The steel has baked highlights and gold trim. He wears layered pauldrons, a mail undercoat and a hinged visor with breathing holes. A red and cream plume rises from the helm. A blue tabard with a gold fleur-de-lis hangs below the belt, a quartered heater shield sits on his back and a sword hangs in its scabbard at his left hip.",
};

export default function build() {
  const b = createBuilder({ name: "knight", paintSize: 2048 });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const DEG = Math.PI / 180;

  // ---------- palette ----------
  const GOLD = "#d6a634";
  const LEATHER = "#6a3f22";
  const LEATHER_DK = "#3a2414";
  const RED = "#b3242c";
  const CREAM = "#efe8d6";
  const SLIT = "#0c0e12";
  const BLUE = "#1c3a86";

  const LIGHT = new THREE.Vector3(0.35, 0.75, 0.55).normalize();
  const metal = (dark: string, light: string) =>
    paint((p, n) => {
      const d = n.dot(LIGHT);
      const base = mix(dark, light, smoothstep(-0.7, 0.85, d));
      const c = mix(base, "#f5f9fc", smoothstep(0.8, 0.97, d) * 0.8);
      const k = 0.93 + 0.14 * noise(p, 0.04, 7);
      return [Math.min(c[0] * k, 1), Math.min(c[1] * k, 1), Math.min(c[2] * k, 1)] as const;
    });
  const steel = metal("#4a5563", "#bcc8d3");
  const mail = scales(["#8f979e", "#788087", "#9aa2a8"], "#353b41", { size: 0.022, width: 0.3, seed: 4 });
  const cloth = mottle(BLUE, "#25489c", { size: 0.05, seed: 2 });
  const tabard = paint((p) => {
    const ax = Math.abs(p.x);
    const yEdge = 0.5 + (0.06 * ax) / 0.155;
    const xEdge = 0.155 - (0.02 * (p.y - 0.56)) / 0.44;
    if (p.y < yEdge + 0.035 || ax > xEdge - 0.025) return GOLD;
    if (p.y < yEdge + 0.045 || ax > xEdge - 0.033) return "#0f1f4a";
    return cloth;
  });
  const shieldPaint = paint((p) => ((p.x > 0) !== (p.y > 1.27) ? cloth : RED));

  const fleur = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">
      <g fill="#e8b63a" stroke="#5a3a10" stroke-width="3" stroke-linejoin="round">
        <path d="M50 5 C62 25 64 45 50 70 C36 45 38 25 50 5Z"/>
        <path d="M46 62 C30 66 14 52 18 36 C22 26 32 28 30 38 C28 48 40 52 46 50Z"/>
        <path d="M54 62 C70 66 86 52 82 36 C78 26 68 28 70 38 C72 48 60 52 54 50Z"/>
        <path d="M44 74 C40 90 30 100 24 108 L40 104 L50 118 L60 104 L76 108 C70 100 60 90 56 74Z"/>
        <rect x="28" y="63" width="44" height="11" rx="3"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 0.98, 0] });
  const spine = b.chain("spine", [[0, 0.98, 0], [0, 1.15, 0], [0, 1.33, 0], [0, 1.5, 0]], {
    parent: root,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
    up: [0, 0, 1],
  });
  b.chain("neck", [[0, 1.5, 0], [0, 1.6, 0]], { parent: "chest", names: ["neck"], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 1.6, 0], dir: [0, 1, 0], role: "head" });
  b.joint("visor", { parent: "head", at: [0, 1.69, 0], dir: [0, 0, 1], role: "hinge" });

  const sides = [
    [1, "L"],
    [-1, "R"],
  ] as const;
  const arms: Record<string, ReturnType<typeof b.chain>> = {};
  const legs: Record<string, ReturnType<typeof b.chain>> = {};
  for (const [s, tag] of sides) {
    arms[tag] = b.chain(
      `arm${tag}`,
      [[0.06 * s, 1.46, 0], [0.2 * s, 1.45, 0], [0.47 * s, 1.45, -0.012], [0.73 * s, 1.45, 0], [0.83 * s, 1.45, 0]],
      { parent: "chest", names: [`clavicle${tag}`, `shoulder${tag}`, `elbow${tag}`, `wrist${tag}`], role: "arm" },
    );
    b.chain(`fingers${tag}`, [[0.83 * s, 1.45, 0], [0.885 * s, 1.45, 0], [0.935 * s, 1.442, 0]], {
      parent: `wrist${tag}`,
      names: [`finger${tag}1`, `finger${tag}2`],
      role: "digit",
    });
    b.chain(`thumb${tag}`, [[0.765 * s, 1.44, 0.035], [0.8 * s, 1.44, 0.075], [0.83 * s, 1.438, 0.1]], {
      parent: `wrist${tag}`,
      names: [`thumb${tag}1`, `thumb${tag}2`],
      role: "digit",
    });
    legs[tag] = b.chain(
      `leg${tag}`,
      [[0.11 * s, 0.95, 0], [0.12 * s, 0.52, 0.025], [0.12 * s, 0.1, 0], [0.12 * s, 0.035, 0.12], [0.12 * s, 0.03, 0.22]],
      { parent: root, names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`, `ball${tag}`], role: "leg", contact: [0.12 * s, 0, 0.08] },
    );
  }

  // ---------- torso ----------
  const breast = b.loft(
    [
      { at: [0, 0.9, 0], w: 0.32, h: 0.22 },
      { at: [0, 1.02, 0], w: 0.29, h: 0.2 },
      { at: [0, 1.2, 0], w: 0.36, h: 0.24 },
      { at: [0, 1.36, 0], w: 0.42, h: 0.26 },
      { at: [0, 1.48, 0], w: 0.36, h: 0.22 },
    ],
    { color: steel, bone: spine, caps: { start: "round", end: "flat" }, up: [0, 0, 1], sides: 12, name: "breastplate" },
  );
  b.sweep(breast.line(0, 0.002), 0.008, { color: steel, bone: spine, from: 0.15, to: 0.55, name: "keel" });
  b.decal(breast, fleur, { at: [0, 1.31, 0.13], dir: [0, 0, 1], size: [0.09, 0.11], name: "chestCrest" });
  b.part(new THREE.TorusGeometry(1, 0.05, 4, 20), GOLD, {
    at: [0, 1.48, 0],
    bone: "chest",
    rotation: [90, 0, 0],
    scale: [0.182, 0.112, 0.15],
    name: "neckTrim",
  });

  // gorget
  b.part(new THREE.CylinderGeometry(0.1, 0.135, 0.1, 10), steel, {
    at: [0, 1.53, 0],
    bone: "chest",
    scale: [1, 1, 0.85],
    flat: true,
    name: "gorget",
  });
  b.part(new THREE.TorusGeometry(0.1, 0.009, 5, 16), GOLD, {
    at: [0, 1.58, 0],
    bone: "neck",
    rotation: [90, 0, 0],
    scale: [1, 0.85, 1],
    name: "gorgetTrim",
  });

  // faulds, belt, tabard
  for (let i = 0; i < 3; i++)
    b.part(new THREE.CylinderGeometry(0.165 + 0.012 * i, 0.185 + 0.012 * i, 0.065, 10), steel, {
      at: [0, 0.95 - 0.05 * i, 0],
      bone: "root",
      scale: [1, 1, 0.72],
      flat: true,
      name: `fauld${i + 1}`,
    });
  b.part(new THREE.TorusGeometry(1, 0.1, 4, 24), LEATHER, {
    at: [0, 0.985, 0],
    bone: "root",
    rotation: [90, 0, 0],
    scale: [0.19, 0.15, 0.22],
    name: "belt",
  });
  b.part(new THREE.BoxGeometry(0.055, 0.05, 0.014), GOLD, { at: [0, 0.985, 0.168], bone: "root", name: "buckle" });
  b.part(new THREE.BoxGeometry(0.025, 0.028, 0.016), LEATHER_DK, { at: [0, 0.985, 0.172], bone: "root", name: "buckleHole" });
  b.part(new THREE.BoxGeometry(0.035, 0.08, 0.08), LEATHER, { at: [-0.205, 0.93, 0.03], bone: "root", name: "pouch" });
  b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, { at: [-0.224, 0.945, 0.03], bone: "root", name: "pouchStud" });

  const front = b.slab(
    [
      [-0.135, 1.0, 0.152],
      [-0.155, 0.56, 0.2],
      [0, 0.5, 0.205],
      [0.155, 0.56, 0.2],
      [0.135, 1.0, 0.152],
    ],
    { color: tabard, thickness: 0.012, bone: "root", name: "tabardFront" },
  );
  b.decal(front, fleur, { at: [0, 0.8, 0.19], dir: [0, 0, 1], size: [0.15, 0.18], name: "tabardFleur" });
  const back = b.slab(
    [
      [0.135, 0.98, -0.152],
      [0.155, 0.56, -0.2],
      [0, 0.5, -0.205],
      [-0.155, 0.56, -0.2],
      [-0.135, 0.98, -0.152],
    ],
    { color: tabard, thickness: 0.012, bone: "root", name: "tabardBack" },
  );
  b.decal(back, fleur, { at: [0, 0.76, -0.19], dir: [0, 0, -1], size: [0.13, 0.16], name: "tabardFleurBack" });

  // shield on the back
  const shieldOutline: Array<[number, number] | [number, number, "sharp"]> = [
    [-0.24, 0.21, "sharp"],
    [0.24, 0.21, "sharp"],
    [0.23, 0.0],
    [0.16, -0.16],
    [0, -0.28, "sharp"],
    [-0.16, -0.16],
    [-0.23, 0.0],
  ];
  const shield = b.extrude(shieldOutline, {
    color: shieldPaint,
    at: [0, 1.26, -0.155],
    x: [-1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    bevel: 0.006,
    smoothing: 1,
    bone: "chest",
    name: "shield",
  });
  b.extrude(
    shieldOutline.map((p) => (p.length === 3 ? [p[0] * 1.07, p[1] * 1.07, "sharp"] : [p[0] * 1.07, p[1] * 1.07])),
    { color: GOLD, at: [0, 1.255, -0.149], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.02, smoothing: 1, bone: "chest", name: "shieldRim" },
  );
  b.decal(shield, fleur, { at: [0, 1.27, -0.175], dir: [0, 0, -1], size: [0.17, 0.2], name: "shieldFleur" });

  // ---------- helmet ----------
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.125, 0.035],
      [0.131, 0.1],
      [0.128, 0.16],
      [0.112, 0.205],
      [0.075, 0.24],
      [0, 0.255],
    ],
    { color: steel, at: [0, 1.58, 0], segments: 10, bone: "head", name: "helm" },
  );
  b.part(new THREE.TorusGeometry(0.111, 0.008, 5, 16), GOLD, { at: [0, 1.592, 0], bone: "head", rotation: [90, 0, 0], name: "browBand" });
  b.extrude(
    [
      [-0.02, 0],
      [0.1, 0],
      [0.07, 0.03],
      [0.02, 0.055],
      [-0.02, 0.055],
    ],
    { color: GOLD, at: [0, 1.775, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, smoothing: 1, bone: "head", name: "comb" },
  );
  for (const sx of [1, -1])
    b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { at: [0.13 * sx, 1.69, 0], bone: "head", flat: true, name: "visorPin" });

  // visor (hinged)
  b.part(new THREE.CylinderGeometry(0.137, 0.126, 0.15, 8, 1, true, -1.25, 2.5), steel, {
    at: [0, 1.66, 0],
    bone: "visor",
    flat: true,
    name: "visorPlate",
  });
  b.frustumBox([0, 1.588, 0.128], [0, 1.733, 0.139], [0.016, 0.01], [0.016, 0.01], { color: GOLD, bone: "visor", name: "visorProw" });
  const visorPoint = (a: number, y: number, lift: number) => {
    const r = 0.126 + (0.011 * (y - 1.585)) / 0.15 + lift;
    const n = V(Math.sin(a), 0, Math.cos(a));
    return frame(V(r * Math.sin(a), y, r * Math.cos(a)), n);
  };
  for (const k of [1, -1])
    b.stick(new THREE.BoxGeometry(0.068, 0.012, 0.014), SLIT, visorPoint(0.3 * k, 1.705, 0.002), {
      bone: "visor",
      embed: 0.4,
      name: `eyeSlit${k > 0 ? "L" : "R"}`,
    });
  for (const k of [1, -1])
    for (const a of [0.35, 0.47, 0.59])
      for (const y of [1.615, 1.635, 1.655])
        b.stick(new THREE.CylinderGeometry(0.0055, 0.0055, 0.01, 6), SLIT, visorPoint(a * k, y, 0.001), {
          bone: "visor",
          embed: 0.5,
        });

  // plume
  const plumeCols = [RED, CREAM, RED, CREAM, RED];
  b.part(new THREE.CylinderGeometry(0.018, 0.024, 0.04, 8), GOLD, { at: [0, 1.83, -0.04], bone: "head", name: "plumeHolder" });
  for (let i = 0; i < 5; i++) {
    const xo = (i - 2) * 0.022;
    const c = Math.abs(i - 2);
    const pts: number[][] = [
      [xo * 0.3, 1.84, -0.04],
      [xo * 0.8, 1.95 - 0.012 * c, -0.11],
      [xo * 1.4, 1.93 - 0.02 * c, -0.25],
      [xo * 1.9, 1.79 - 0.03 * c, -0.34],
    ];
    b.sweep(pts.map((p) => V(p[0], p[1], p[2])), [0.012, 0.03, 0.026, 0.006], {
      color: plumeCols[i],
      bone: "head",
      sides: 6,
      name: `plume${i + 1}`,
    });
  }

  // ---------- limbs ----------
  const shoulderPlate = (r: [number, number, number], at: number[], rotZ: number, bone: string) => {
    b.part(new THREE.SphereGeometry(1, 10, 7), steel, { at, bone, scale: r, rotation: [0, 0, rotZ], flat: true });
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, rotZ * DEG, "ZYX"));
    b.part(new THREE.TorusGeometry(1, 0.07, 4, 20), GOLD, { at, bone, quat: q, scale: [r[0], r[2], 0.12] });
  };

  for (const [s, tag] of sides) {
    const arm = arms[tag];
    const leg = legs[tag];
    const X = (x: number, y: number, z: number) => V(x * s, y, z);

    // arm
    b.sweep(arm, [0.05, 0.042], { color: mail, from: arm.ts[1], to: arm.ts[3], name: `mailArm${tag}` });
    shoulderPlate([0.13, 0.085, 0.125], [0.215 * s, 1.5, 0], -18 * s, `clavicle${tag}`);
    shoulderPlate([0.105, 0.06, 0.11], [0.28 * s, 1.445, 0], -30 * s, `shoulder${tag}`);
    shoulderPlate([0.085, 0.05, 0.095], [0.325 * s, 1.405, 0], -38 * s, `shoulder${tag}`);
    b.capsule(X(0.27, 1.45, -0.003), X(0.435, 1.45, -0.011), [0.06, 0.055], { color: steel, bone: `shoulder${tag}`, name: `rerebrace${tag}` });
    const E = X(0.47, 1.45, -0.012);
    b.part(new THREE.SphereGeometry(0.064, 8, 6), steel, { at: E, bone: `elbow${tag}`, flat: true, name: `couter${tag}` });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 8), steel, {
      at: E.clone().add(V(0, 0, -0.058)),
      dir: [0, 0, -1],
      bone: `elbow${tag}`,
      flat: true,
      name: `couterWing${tag}`,
    });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, { at: E.clone().add(V(0, 0, -0.066)), bone: `elbow${tag}` });
    b.capsule(X(0.51, 1.45, -0.01), X(0.715, 1.45, 0), [0.056, 0.047], { color: steel, bone: `elbow${tag}`, name: `vambrace${tag}` });
    b.part(new THREE.CylinderGeometry(0.068, 0.05, 0.085, 8), steel, {
      at: X(0.722, 1.45, 0),
      dir: [-s, 0, 0],
      bone: `wrist${tag}`,
      flat: true,
      name: `cuff${tag}`,
    });
    b.part(new THREE.TorusGeometry(0.066, 0.007, 4, 12), GOLD, {
      at: X(0.68, 1.45, 0),
      dir: [s, 0, 0],
      axis: "z",
      bone: `wrist${tag}`,
    });
    b.part(new THREE.BoxGeometry(0.1, 0.045, 0.095), steel, { at: X(0.79, 1.45, 0), bone: `wrist${tag}`, flat: true, name: `hand${tag}` });
    b.capsule(X(0.835, 1.474, -0.045), X(0.835, 1.474, 0.045), 0.009, { color: GOLD, bone: `wrist${tag}`, name: `knuckles${tag}` });
    b.part(new THREE.BoxGeometry(0.055, 0.036, 0.09), steel, { at: X(0.858, 1.45, 0), bone: `finger${tag}1`, flat: true });
    b.part(new THREE.BoxGeometry(0.055, 0.03, 0.085), steel, { at: X(0.906, 1.446, 0), bone: `finger${tag}2`, flat: true });
    b.capsule(X(0.765, 1.44, 0.035), X(0.8, 1.44, 0.075), 0.019, { color: steel, bone: `thumb${tag}1` });
    b.capsule(X(0.8, 1.44, 0.075), X(0.828, 1.438, 0.1), 0.016, { color: steel, bone: `thumb${tag}2` });

    // leg
    b.sweep(leg, [0.075, 0.05], { color: mail, to: leg.ts[2], name: `mailLeg${tag}` });
    b.capsule(X(0.11, 0.9, 0.012), X(0.12, 0.56, 0.03), [0.088, 0.072], { color: steel, bone: `hip${tag}`, name: `cuisse${tag}` });
    const K = X(0.12, 0.52, 0.025);
    b.part(new THREE.SphereGeometry(0.07, 8, 6), steel, {
      at: K.clone().add(V(0, 0, 0.04)),
      bone: `knee${tag}`,
      scale: [1, 1.05, 0.8],
      flat: true,
      name: `poleyn${tag}`,
    });
    b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.012, 8), steel, {
      at: K.clone().add(V(0.072 * s, 0, 0.01)),
      dir: [s, 0, 0],
      bone: `knee${tag}`,
      flat: true,
      name: `poleynWing${tag}`,
    });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, { at: K.clone().add(V(0.08 * s, 0, 0.01)), bone: `knee${tag}` });
    b.capsule(X(0.12, 0.47, 0.02), X(0.12, 0.14, 0), [0.068, 0.05], { color: steel, bone: `knee${tag}`, name: `greave${tag}` });
    b.frustumBox(X(0.12, 0.065, -0.075), X(0.12, 0.065, 0.12), [0.11, 0.13], [0.1, 0.11], {
      color: steel,
      bone: `ankle${tag}`,
      name: `sabaton${tag}`,
    });
    b.frustumBox(X(0.12, 0.05, 0.11), X(0.12, 0.028, 0.255), [0.095, 0.1], [0.035, 0.03], {
      color: steel,
      bone: `ball${tag}`,
      name: `toe${tag}`,
    });
    for (const [z, y] of [
      [0.01, 0.129],
      [0.07, 0.124],
    ])
      b.rod(X(0.065, y, z), X(0.175, y, z), 0.005, { color: GOLD, bone: `ankle${tag}` });
    b.rod(X(0.12, 0.07, -0.07), X(0.12, 0.075, -0.13), 0.006, { color: GOLD, bone: `ankle${tag}`, name: `spur${tag}` });
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.006, 8), GOLD, {
      at: X(0.12, 0.075, -0.14),
      dir: [1, 0, 0],
      bone: `ankle${tag}`,
      flat: true,
      name: `rowel${tag}`,
    });
  }

  // ---------- sword at the left hip ----------
  const T = V(0.245, 0.97, 0.075);
  const Bt = V(0.3, 0.2, -0.245);
  const d = T.clone().sub(Bt).normalize();
  const g = new THREE.Vector3().crossVectors(d, V(1, 0, 0)).normalize();
  b.frustumBox(T, Bt, [0.06, 0.024], [0.045, 0.02], { color: LEATHER, bone: "root", up: [1, 0, 0], name: "scabbard" });
  b.frustumBox(T.clone().addScaledVector(d, 0.005), T.clone().addScaledVector(d, -0.07), [0.068, 0.03], [0.066, 0.03], {
    color: GOLD,
    bone: "root",
    up: [1, 0, 0],
    name: "locket",
  });
  b.frustumBox(Bt.clone().addScaledVector(d, 0.08), Bt.clone().addScaledVector(d, -0.005), [0.052, 0.027], [0.04, 0.025], {
    color: GOLD,
    bone: "root",
    up: [1, 0, 0],
    name: "chape",
  });
  const C = T.clone().addScaledVector(d, 0.015);
  b.capsule(C.clone().addScaledVector(g, -0.11), C.clone().addScaledVector(g, 0.11), 0.012, { color: GOLD, bone: "root", name: "crossguard" });
  b.rod(C, C.clone().addScaledVector(d, 0.15), 0.016, {
    bone: "root",
    bands: [
      [0.25, LEATHER_DK],
      [0.5, "#5a3a20"],
      [0.75, LEATHER_DK],
      [1, "#5a3a20"],
    ],
    name: "grip",
  });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), GOLD, { at: C.clone().addScaledVector(d, 0.18), bone: "root", flat: true, name: "pommel" });

  // ---------- material tuning ----------
  const gold = b.material(GOLD);
  gold.metalness = 0.55;
  gold.roughness = 0.35;
  const pm = b.ctx.paintMaterial();
  pm.roughness = 0.5;
  pm.metalness = 0.15;
  const slit = b.material(SLIT);
  slit.roughness = 0.9;

  return b.root;
}
```