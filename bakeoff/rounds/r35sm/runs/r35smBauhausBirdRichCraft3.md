```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, svg, paint, countershade, grain, offset } from "agentic-3js-builder";

export const meta = {
  name: "Bauhaus songbird",
  description: "A songbird on a branch built from primary-colour circles, triangles and bars.",
};

const RED = "#d62828";
const BLUE = "#1d4ed8";
const YELLOW = "#f7c81e";
const BLACK = "#161616";
const WHITE = "#f4f1e8";

export default function build() {
  const b = createBuilder({ name: "songbird" });

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.075, -0.02], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.085, 0.015], dir: [0, 0.1, 1], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.105, 0.037], dir: [0, 0.6, 1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.126, 0.05], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.12, 0.074], aim: [0, 0.118, 0.105], role: "jaw" });

  // ---- body ----
  const bodyPaint = countershade(RED, WHITE, { level: -0.45, soft: 0.2 });
  b.part(new THREE.SphereGeometry(1, 12, 9), bodyPaint, {
    bone: chest,
    at: [0, 0.085, -0.005],
    scale: [0.045, 0.042, 0.062],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.033, 10, 8), RED, { bone: neck, at: [0, 0.107, 0.036], flat: true });

  // ---- head ----
  const HC: [number, number, number] = [0, 0.128, 0.052];
  b.part(new THREE.SphereGeometry(0.03, 12, 9), YELLOW, { bone: head, at: HC, flat: true });

  const eyeTex = svg(
    `<svg viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="31" fill="#161616"/>
      <circle cx="32" cy="32" r="26" fill="#f4f1e8"/>
      <circle cx="34" cy="33" r="15" fill="#161616"/>
      <circle cx="39" cy="27" r="5" fill="#f4f1e8"/>
    </svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    const eyeDir = new THREE.Vector3(s * 0.75, 0.25, 0.6).normalize();
    const eyeAt = new THREE.Vector3(...HC).addScaledVector(eyeDir, 0.0295);
    b.part(new THREE.CircleGeometry(0.0115, 16), "#ffffff", {
      bone: head,
      at: eyeAt,
      dir: eyeDir,
      axis: "z",
      texture: eyeTex,
    });
    const cheekDir = new THREE.Vector3(s * 0.9, -0.3, 0.25).normalize();
    const cheekAt = new THREE.Vector3(...HC).addScaledVector(cheekDir, 0.0296);
    b.part(new THREE.CircleGeometry(0.008, 12), RED, { bone: head, at: cheekAt, dir: cheekDir, axis: "z" });
  }

  // crest: a black right triangle
  b.extrude(
    [
      [-0.022, 0],
      [0.014, 0],
      [-0.022, 0.04],
    ],
    { at: [0, 0.152, 0.05], x: [0, 0, 1], thickness: 0.006, color: BLACK, bone: head },
  );

  // beak: triangular prisms
  const dirUp = new THREE.Vector3(0, -0.05, 1).normalize();
  const upBase = new THREE.Vector3(0, 0.124, 0.076);
  b.part(new THREE.ConeGeometry(0.012, 0.036, 3), BLACK, {
    bone: head,
    at: upBase.clone().addScaledVector(dirUp, 0.016),
    dir: dirUp,
    flat: true,
  });
  const dirLo = new THREE.Vector3(0, 0.04, 1).normalize();
  const loBase = new THREE.Vector3(0, 0.1175, 0.078);
  b.part(new THREE.ConeGeometry(0.0085, 0.028, 3), "#3a3a3a", {
    bone: jaw,
    at: loBase.clone().addScaledVector(dirLo, 0.012),
    dir: dirLo,
    flat: true,
  });

  // ---- wings ----
  const wingPaint = paint((_p, _n, s) => {
    const x = s[0];
    if (x > 0.03 && x < 0.042) return BLACK;
    if (x > 0.05 && x < 0.07) return RED;
    if (x > 0.074 && x < 0.082) return YELLOW;
    return BLUE;
  });
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const shoulder = b.joint(`wing${S}`, {
      parent: chest,
      at: [s * 0.043, 0.095, 0.022],
      dir: [s * 0.25, 0, -1],
      role: "wing",
    });
    b.joint(`wingTip${S}`, {
      parent: shoulder,
      at: [s * 0.055, 0.088, -0.06],
      dir: [s * 0.25, 0, -1],
      role: "wing",
    });
    b.extrude(
      [
        [0, 0.028],
        [0, -0.024],
        [0.09, -0.012],
      ],
      {
        at: [s * 0.043, 0.09, 0.022],
        x: [s * 0.25, 0, -1],
        y: [0, 1, 0],
        thickness: [0.009, 0.004],
        color: wingPaint,
        bone: shoulder,
      },
    );
    // yellow covert triangle on the outside
    b.extrude(
      [
        [0.004, 0.022],
        [0.004, 0.0],
        [0.034, 0.012],
      ],
      {
        at: [s * 0.0505, 0.094, 0.018],
        x: [s * 0.25, 0, -1],
        y: [0, 1, 0],
        thickness: 0.003,
        color: YELLOW,
        bone: shoulder,
      },
    );
  }

  // ---- tail ----
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.078, -0.045],
      [0, 0.07, -0.105],
      [0, 0.058, -0.175],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, (t) => [0.012 + 0.02 * t, 0.0035], {
    section: "box",
    caps: "flat",
    bands: [
      [0.4, BLUE],
      [0.75, YELLOW],
      [1, BLACK],
    ],
  });

  // ---- legs ----
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const root: [number, number, number] = [s * 0.022, 0.064, -0.01];
    const foot: [number, number, number] = [s * 0.022, 0.0335, 0.0];
    const pts = limb(root, foot, [0.02, 0.018], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    b.sweep(leg, 0.0035, { color: BLACK, sides: 6 });
    const f = pts[pts.length - 1];
    const toes: [number, number, number][] = [
      [0, 0, 1],
      [-0.45, 0, 1],
      [0.45, 0, 1],
      [0, 0, -1],
    ];
    toes.forEach((d, i) => {
      const len = i === 3 ? 0.016 : 0.026;
      const tip = offset(f, d, len);
      b.rod(f, tip, 0.0028, BLACK, { bone: leg.tip ?? leg.joints[leg.joints.length - 1], sides: 5 });
    });
  }

  // ---- branch ----
  const branchPath = catmull([
    [-0.3, 0.022, 0.0],
    [-0.1, 0.016, 0.01],
    [0.1, 0.016, -0.01],
    [0.3, 0.023, 0.012],
  ]);
  b.sweep(branchPath, [0.017, 0.012], {
    color: grain("#5a3a22", "#8a5a34", { size: 0.01, axis: "x" }),
    sides: 7,
    caps: "flat",
    bone: hips,
  });
  // twigs, leaves in primaries
  const twigs: { base: [number, number, number]; tip: [number, number, number]; c: string }[] = [
    { base: [0.13, 0.028, -0.01], tip: [0.2, 0.09, -0.03], c: RED },
    { base: [-0.15, 0.026, 0.01], tip: [-0.22, 0.085, 0.03], c: BLUE },
    { base: [0.22, 0.03, 0.01], tip: [0.3, 0.07, 0.05], c: YELLOW },
  ];
  for (const t of twigs) {
    b.spike(t.base, t.tip, null, 0.006, "#5a3a22", { bone: hips, sides: 5 });
    const d = new THREE.Vector3(t.tip[0] - t.base[0], t.tip[1] - t.base[1], t.tip[2] - t.base[2]).normalize();
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.004, t.c === RED ? 14 : t.c === BLUE ? 4 : 3), t.c, {
      bone: hips,
      at: t.tip,
      dir: d,
      flat: true,
    });
  }

  return b.root;
}
```