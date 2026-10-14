```ts
import * as THREE from "three";
import { createBuilder, catmull, polyline, bezier, paint, scales, svg } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Armored Knight",
  description:
    "A stylized plate-armored knight in a rigging T-pose: houndskull visor on a hinge, chin bevor on a jaw joint, red-and-cream plume, layered pauldrons with gold trim, blue tabard with a gold cross, heraldic shield on the back and a sheathed sword at the hip.",
};

const STEEL = "#c3ccd6";
const STEEL_D = "#7d8896";
const DARK = "#22252b";
const GOLD = "#e0a93b";
const BLUE = "#2649a6";
const CREAM = "#f1e7cf";
const RED = "#c92f2f";
const RED_D = "#8f1d24";
const LEATHER = "#6e4426";
const LEATHER_D = "#4a2c18";
const MAIL = "#9aa1aa";
const MAIL_D = "#5d636c";

type V = [number, number, number];

const ellipse = (y: number, rx: number, rz: number, z = 0, n = 14) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [Math.sin(a) * rx, y, z + Math.cos(a) * rz];
  });

const FLEUR = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g fill="${GOLD}" stroke="#3a2a10" stroke-width="3" stroke-linejoin="round">
    <path d="M50 6 C64 22 64 40 50 58 C36 40 36 22 50 6 Z"/>
    <path d="M44 56 C30 64 10 56 12 38 C14 30 24 28 28 36 C22 38 22 46 30 48 C36 49 40 46 42 42 Z"/>
    <path d="M56 56 C70 64 90 56 88 38 C86 30 76 28 72 36 C78 38 78 46 70 48 C64 49 60 46 58 42 Z"/>
    <rect x="30" y="56" width="40" height="9" rx="2"/>
    <path d="M44 65 L56 65 L60 92 L50 84 L40 92 Z"/>
  </g></svg>`,
  { size: 256 },
);

const holes: string[] = [];
for (let r = 0; r < 3; r++)
  for (let c = 0; c < 3; c++) {
    const y = 34 + r * 8;
    holes.push(`<circle cx="${18 + c * 8}" cy="${y}" r="2.6" fill="#15171b"/>`);
    holes.push(`<circle cx="${66 + c * 8}" cy="${y}" r="2.6" fill="#15171b"/>`);
  }
const VISOR = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60">
  <rect x="6" y="12" width="38" height="9" rx="3" fill="#15171b" stroke="${GOLD}" stroke-width="2"/>
  <rect x="56" y="12" width="38" height="9" rx="3" fill="#15171b" stroke="${GOLD}" stroke-width="2"/>
  <rect x="48.5" y="2" width="3" height="56" fill="${GOLD}"/>
  ${holes.join("")}
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "knight" });

  // ---------------- Skeleton ----------------
  const hips = b.joint("hips", { at: [0, 1.0, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 1.0, 0],
      [0, 1.15, 0],
      [0, 1.3, 0],
      [0, 1.5, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.5, 0], aim: [0, 1.62, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.62, 0], dir: [0, 1, 0], role: "head" });
  const visor = b.joint("visor", { parent: head, at: [0, 1.76, 0], dir: [0, 0, 1], role: "hinge" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.64, 0.02], dir: [0, -0.3, 1], role: "jaw" });

  const rimPaint = (X: V, Y: V, face: string | ReturnType<typeof paint>, rim: string) => {
    const thick = new THREE.Vector3(...X).cross(new THREE.Vector3(...Y)).normalize();
    return paint((_p, n) => (Math.abs(n.dot(thick)) < 0.5 ? rim : face));
  };
  const mail = scales(MAIL, MAIL_D, { size: 0.016 });

  // ---------------- Torso ----------------
  const torsoPaint = paint((p) =>
    p.y > 0.97 && p.y < 1.2 && Math.abs((p.y - 0.985) % 0.055) < 0.005 ? STEEL_D : STEEL,
  );
  const torso = b.loft(
    [
      { at: [0, 0.92, 0], w: 0.3, h: 0.22 },
      { at: [0, 1.02, 0], w: 0.3, h: 0.22 },
      { at: [0, 1.15, 0.005], w: 0.33, h: 0.245 },
      { at: [0, 1.29, 0.015], w: 0.41, h: 0.29 },
      { at: [0, 1.42, 0.01], w: 0.45, h: 0.3 },
      { at: [0, 1.52, 0], w: 0.3, h: 0.22 },
    ],
    { bone: spine, section: { ngon: 8 }, caps: "flat", color: torsoPaint, name: "breastplate" },
  );
  const torsoSurf = b.surface(torso);
  // gold keel on the abdomen
  b.sweep(
    torsoSurf.drape(
      catmull([
        [0, 1.0, 0.3],
        [0, 1.1, 0.3],
        [0, 1.2, 0.3],
      ]),
      { lift: 0.003 },
    ),
    0.009,
    { color: GOLD, sides: 6 },
  );
  b.decal(torso, FLEUR, { at: [0, 1.37, 0.2], dir: [0, 0, 1], size: [0.13, 0.13], name: "chestEmblem" });

  // shield strap (guige) across the chest
  b.sweep(
    torsoSurf.drape(
      catmull(
        [
          [0.21, 1.47, 0.03],
          [0.1, 1.27, 0.18],
          [-0.1, 1.08, 0.14],
          [-0.17, 1.05, -0.05],
          [0, 1.25, -0.18],
          [0.15, 1.45, -0.12],
        ],
        { closed: true },
      ),
      { lift: 0.008 },
    ),
    0.013,
    { color: LEATHER, sides: 6 },
  );
  b.part(new THREE.BoxGeometry(0.035, 0.035, 0.012), GOLD, {
    bone: spine.joints[1],
    at: [0.02, 1.2, 0.17],
    rotation: [0, 0, 40],
    flat: true,
  });

  // gorget
  b.part(new THREE.CylinderGeometry(0.115, 0.2, 0.1, 10), STEEL, { bone: chest, at: [0, 1.53, 0], flat: true });
  b.sweep(catmull(ellipse(1.485, 0.198, 0.198), { closed: true }), 0.011, { bone: chest, color: GOLD, sides: 6 });

  // belt
  const beltPath = catmull(ellipse(0.995, 0.168, 0.128), { closed: true });
  b.sweep(beltPath, 0.022, { bone: hips, color: LEATHER, sides: 6 });
  b.along(beltPath, 12, (at) => {
    b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, { bone: hips, at });
  });
  b.part(new THREE.BoxGeometry(0.065, 0.055, 0.016), GOLD, { bone: hips, at: [0, 0.995, 0.152], flat: true });
  b.part(new THREE.BoxGeometry(0.035, 0.025, 0.01), DARK, { bone: hips, at: [0, 0.995, 0.161], flat: true });

  // faulds
  for (let i = 0; i < 3; i++) {
    const r = i * 0.012;
    b.lathe(
      [
        [0.158 + r, 0.06],
        [0.168 + r, 0.06],
        [0.19 + r, 0],
        [0.178 + r, 0],
      ],
      { at: [0, 0.935 - i * 0.045, 0], bone: hips, segments: 10, color: i === 2 ? GOLD : STEEL },
    );
  }

  // tabard front and back
  const tabardOutline: OutlinePoint[] = [
    [-0.075, 0],
    [0.075, 0],
    [0.12, -0.1],
    [0.125, -0.4],
    [0.06, -0.36],
    [0, -0.43],
    [-0.06, -0.36],
    [-0.125, -0.4],
    [-0.12, -0.1],
  ];
  for (const f of [1, -1]) {
    const X: V = [f, 0, 0];
    const Y: V = [0, 1, 0];
    const thick = new THREE.Vector3(...X).cross(new THREE.Vector3(...Y)).normalize();
    const tab = paint((_p, n, s) =>
      Math.abs(n.dot(thick)) < 0.5
        ? GOLD
        : Math.abs(s[0]) < 0.022 || (s[1] < -0.12 && s[1] > -0.165)
          ? GOLD
          : BLUE,
    );
    b.extrude(tabardOutline, {
      at: [0, 0.86, f * 0.198],
      x: X,
      y: Y,
      thickness: 0.012,
      bevel: 0.003,
      color: tab,
      bone: hips,
      name: f > 0 ? "tabardFront" : "tabardBack",
    });
  }

  // ---------------- Helmet ----------------
  const bowl = b.lathe(
    [
      [0, 0, "sharp"],
      [0.13, 0],
      [0.136, 0.07],
      [0.125, 0.15],
      [0.08, 0.22],
      [0, 0.27, "sharp"],
    ],
    { at: [0, 1.64, 0], bone: head, segments: 10, smoothing: 1, color: STEEL, name: "helmetBowl" },
  );
  b.sweep(catmull(ellipse(1.645, 0.134, 0.134), { closed: true }), 0.011, { bone: head, color: GOLD, sides: 6 });
  b.sweep(
    b.surface(bowl).drape(
      catmull([
        [0, 1.86, 0.06],
        [0, 1.905, 0],
        [0, 1.86, -0.07],
        [0, 1.76, -0.13],
        [0, 1.68, -0.14],
      ]),
      { lift: 0.004 },
    ),
    0.011,
    { color: GOLD, sides: 6, bone: head },
  );

  const visorPart = b.lathe(
    [
      [0, 0, "sharp"],
      [0.125, 0],
      [0.128, 0.07],
      [0.1, 0.15],
      [0.05, 0.21],
      [0, 0.235, "sharp"],
    ],
    { at: [0, 1.76, 0], axis: [0, 0, 1], bone: visor, segments: 8, smoothing: 1, color: STEEL, name: "visor" },
  );
  b.decal(visorPart, VISOR, { at: [0, 1.77, 0.2], dir: [0, 0, 1], size: [0.24, 0.15], bone: visor, name: "visorSlits" });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.022, 6, 4), GOLD, { bone: visor, at: [s * 0.133, 1.76, 0.01] });

  // bevor (chin guard) on the jaw
  b.part(new THREE.CylinderGeometry(0.13, 0.105, 0.08, 10), STEEL, { bone: jaw, at: [0, 1.605, 0.005], flat: true });
  b.sweep(catmull(ellipse(1.567, 0.107, 0.107, 0.005), { closed: true }), 0.008, { bone: jaw, color: GOLD, sides: 6 });

  // plume
  b.part(new THREE.CylinderGeometry(0.02, 0.026, 0.06, 6), GOLD, {
    bone: head,
    at: [0, 1.915, -0.03],
    dir: [0, 1, -0.6],
    flat: true,
  });
  for (let i = 0; i < 5; i++) {
    const dx = (i - 2) * 0.035;
    const lift = i === 2 ? 0.03 : i === 1 || i === 3 ? 0.015 : 0;
    b.sweep(
      bezier(
        [dx * 0.3, 1.94, -0.05],
        [dx * 0.7, 2.12 + lift, -0.2],
        [dx * 1.4, 1.99 + lift, -0.45],
        [dx * 1.8, 1.72 + lift, -0.55],
      ),
      [0.026, 0.042, 0.032, 0.008],
      {
        bone: head,
        sides: 6,
        bands: [
          [0.66, RED],
          [0.8, RED_D],
          [1, CREAM],
        ],
      },
    );
  }

  // ---------------- Shield on the back ----------------
  const shieldPts: [number, number][] = [
    [0, 0],
    [0.09, 0.04],
    [0.16, 0.11],
    [0.2, 0.2],
    [0.22, 0.32],
    [0.22, 0.55],
    [-0.22, 0.55],
    [-0.22, 0.32],
    [-0.2, 0.2],
    [-0.16, 0.11],
    [-0.09, 0.04],
  ];
  const SX: V = [-1, 0, 0];
  const SY: V = [0, 1, 0];
  const sThick = new THREE.Vector3(...SX).cross(new THREE.Vector3(...SY)).normalize();
  const shieldPaint = paint((_p, n, s) =>
    Math.abs(n.dot(sThick)) < 0.5 ? GOLD : (s[0] > 0) !== (s[1] > 0.33) ? BLUE : CREAM,
  );
  const shield = b.extrude(shieldPts, {
    at: [0, 0.95, -0.205],
    x: SX,
    y: SY,
    thickness: 0.03,
    bevel: 0.006,
    color: shieldPaint,
    bone: chest,
    name: "shield",
  });
  b.sweep(polyline(shieldPts.map(([u, v]) => shield.local([u, v, 0.016])), { closed: true }), 0.013, {
    bone: chest,
    color: GOLD,
    sides: 6,
  });
  b.decal(shield, FLEUR, { at: shield.local([0, 0.3, 0.015]), dir: [0, 0, -1], size: [0.24, 0.24], bone: chest });

  // ---------------- Sword at the left hip ----------------
  const A = new THREE.Vector3(0.25, 0.93, 0.1);
  const B = new THREE.Vector3(0.3, 0.2, -0.18);
  const d = A.clone().sub(B).normalize();
  const perp = new THREE.Vector3().crossVectors(d, new THREE.Vector3(1, 0, 0)).normalize();
  const along = (k: number) => A.clone().addScaledVector(d, k);
  b.frustumBox(A, B, [0.06, 0.028], [0.045, 0.024], { bone: hips, color: LEATHER, name: "scabbard" });
  b.frustumBox(B.clone().addScaledVector(d, 0.1), B.clone().addScaledVector(d, -0.008), [0.05, 0.028], [0.048, 0.027], {
    bone: hips,
    color: GOLD,
  });
  b.frustumBox(along(0.004), along(-0.07), [0.066, 0.034], [0.064, 0.033], { bone: hips, color: GOLD });
  b.frustumBox(along(-0.34), along(-0.37), [0.058, 0.03], [0.057, 0.03], { bone: hips, color: GOLD });
  const g0 = along(0.012).addScaledVector(perp, 0.11);
  const g1 = along(0.012).addScaledVector(perp, -0.11);
  b.rod(g0, g1, 0.014, { bone: hips, color: GOLD, sides: 6 });
  for (const g of [g0, g1]) b.part(new THREE.IcosahedronGeometry(0.02, 0), GOLD, { bone: hips, at: g, flat: true });
  b.rod(along(0.02), along(0.17), 0.016, {
    bone: hips,
    sides: 6,
    color: (t: number) => (Math.floor(t * 7) % 2 ? LEATHER_D : LEATHER),
  });
  b.part(new THREE.IcosahedronGeometry(0.032, 0), GOLD, { bone: hips, at: along(0.2), flat: true });
  b.part(new THREE.SphereGeometry(0.012, 6, 4), RED, {
    bone: hips,
    at: along(0.2).add(new THREE.Vector3(0.028, 0, 0)),
  });
  b.rod([0.15, 0.99, 0.08], along(-0.035), 0.009, { bone: hips, color: LEATHER_D, sides: 5 });

  // ---------------- Arms ----------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh: V = [s * 0.2, 1.45, 0];
    const el: V = [s * 0.47, 1.45, -0.01];
    const wr: V = [s * 0.72, 1.45, 0];
    const clav = b.joint(`clavicle${S}`, { parent: chest, at: [s * 0.05, 1.46, 0], aim: sh });
    const arm = b.chain(`arm${S}`, polyline([sh, el, wr]), {
      parent: clav,
      names: [`shoulder${S}`, `elbow${S}`, `hand${S}`],
      role: "arm",
    });
    const [shJ, elJ, handJ] = arm.joints;
    const fingers = b.joint(`fingers${S}`, {
      parent: handJ,
      at: [s * 0.83, 1.45, 0],
      aim: [s * 0.93, 1.45, 0],
      role: "digit",
    });
    const thumb = b.joint(`thumb${S}`, {
      parent: handJ,
      at: [s * 0.76, 1.44, 0.045],
      aim: [s * 0.81, 1.44, 0.11],
      role: "digit",
    });

    // pauldron
    const pAxis: V = [s * 0.5, 1, 0];
    const pAt: V = [s * 0.22, 1.47, 0];
    b.lathe(
      [
        [0, 0.11],
        [0.09, 0.095],
        [0.15, 0.04],
        [0.17, -0.03],
        [0.155, -0.035],
        [0.135, 0.03],
        [0.08, 0.08],
        [0, 0.095],
      ],
      { at: pAt, axis: pAxis, bone: shJ, segments: 10, smoothing: 1, color: STEEL, name: `pauldron${S}` },
    );
    b.lathe(
      [
        [0.168, -0.045],
        [0.182, -0.1],
        [0.166, -0.1],
        [0.153, -0.05],
      ],
      { at: pAt, axis: pAxis, bone: shJ, segments: 10, color: STEEL },
    );
    b.lathe(
      [
        [0.18, -0.11],
        [0.192, -0.155],
        [0.177, -0.155],
        [0.165, -0.115],
      ],
      { at: pAt, axis: pAxis, bone: shJ, segments: 10, color: GOLD },
    );
    const top = new THREE.Vector3(...pAt).addScaledVector(new THREE.Vector3(...pAxis).normalize(), 0.11);
    b.part(new THREE.SphereGeometry(0.018, 6, 4), GOLD, { bone: shJ, at: top });

    // upper arm: mail under a steel rerebrace
    b.capsule(sh, el, 0.055, { bone: shJ, color: mail, sides: 8 });
    b.rod([s * 0.28, 1.45, 0], [s * 0.43, 1.45, -0.008], [0.064, 0.06], { bone: shJ, color: STEEL, sides: 8 });

    // couter with gold fan
    b.part(new THREE.SphereGeometry(0.066, 8, 6), STEEL, { bone: elJ, at: el, flat: true });
    b.extrude(
      [
        [0, 0.07],
        [0.05, 0],
        [0, -0.07],
        [-0.05, 0],
      ],
      { at: [s * 0.47, 1.45, -0.072], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, smoothing: 1, color: GOLD, bone: elJ },
    );

    // vambrace
    b.rod([s * 0.5, 1.45, -0.008], [s * 0.66, 1.45, 0], [0.057, 0.05], { bone: elJ, color: STEEL, sides: 8 });
    b.rod([s * 0.5, 1.45, -0.008], [s * 0.52, 1.45, -0.007], 0.061, { bone: elJ, color: GOLD, sides: 8 });

    // gauntlet
    b.part(new THREE.CylinderGeometry(0.048, 0.075, 0.09, 8), STEEL, {
      bone: handJ,
      at: [s * 0.7, 1.45, 0],
      dir: [s, 0, 0],
      flat: true,
    });
    b.part(new THREE.TorusGeometry(0.073, 0.008, 4, 8), GOLD, {
      bone: handJ,
      at: [s * 0.656, 1.45, 0],
      dir: [s, 0, 0],
      axis: "z",
    });
    b.part(new THREE.BoxGeometry(0.11, 0.05, 0.095), STEEL, { bone: handJ, at: [s * 0.775, 1.45, 0], flat: true });
    b.part(new THREE.BoxGeometry(0.09, 0.04, 0.09), STEEL, { bone: fingers, at: [s * 0.875, 1.448, 0], flat: true });
    b.part(new THREE.BoxGeometry(0.014, 0.048, 0.098), GOLD, { bone: fingers, at: [s * 0.835, 1.45, 0], flat: true });
    for (const k of [0.86, 0.89])
      b.part(new THREE.BoxGeometry(0.005, 0.042, 0.092), STEEL_D, { bone: fingers, at: [s * k, 1.449, 0], flat: true });
    b.capsule([s * 0.76, 1.44, 0.045], [s * 0.805, 1.44, 0.1], 0.02, { bone: thumb, color: STEEL, sides: 6 });
  }

  // ---------------- Legs ----------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.125;
    const hp: V = [s * 0.11, 0.96, 0];
    const kn: V = [s * 0.12, 0.54, 0.03];
    const an: V = [x, 0.1, 0];
    const leg = b.chain(`leg${S}`, polyline([hp, kn, an]), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `foot${S}`],
      role: "leg",
      contact: [x, 0, 0.03],
    });
    const [hipJ, kneeJ, footJ] = leg.joints;
    const toe = b.joint(`toe${S}`, { parent: footJ, at: [x, 0.04, 0.1], dir: [0, 0, 1], role: "digit" });

    // cuisse
    b.sweep(polyline([hp, kn]), [0.088, 0.07], { bone: hipJ, color: STEEL, sides: 8 });

    // tasset on the outer thigh
    const TX: V = [0, 0, 1];
    const TY: V = [-s * 0.25, 1, 0];
    const tThick = new THREE.Vector3(...TX).cross(new THREE.Vector3(...TY)).normalize();
    b.extrude(
      [
        [-0.08, 0],
        [0.08, 0],
        [0.07, -0.17],
        [-0.07, -0.17],
      ],
      {
        at: [s * 0.205, 0.88, 0],
        x: TX,
        y: TY,
        thickness: 0.014,
        bevel: 0.004,
        bone: hipJ,
        color: paint((_p, n, sc) =>
          Math.abs(n.dot(tThick)) < 0.5 ? GOLD : Math.abs(sc[1] + 0.085) < 0.006 ? STEEL_D : STEEL,
        ),
        name: `tasset${S}`,
      },
    );

    // poleyn with gold fan
    b.part(new THREE.SphereGeometry(0.075, 8, 6), STEEL, { bone: kneeJ, at: [s * 0.12, 0.55, 0.06], flat: true });
    b.extrude(
      [
        [0, 0.075],
        [0.055, 0],
        [0, -0.075],
        [-0.055, 0],
      ],
      { at: [s * 0.2, 0.55, 0.035], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, smoothing: 1, color: GOLD, bone: kneeJ },
    );

    // greave
    b.sweep(polyline([kn, an]), [0.062, 0.07, 0.058, 0.05], {
      bone: kneeJ,
      sides: 8,
      bands: [
        [0.1, GOLD],
        [1, STEEL],
      ],
    });

    // sabaton
    b.part(new THREE.BoxGeometry(0.115, 0.08, 0.21), STEEL, { bone: footJ, at: [x, 0.04, 0.015], flat: true });
    b.part(new THREE.BoxGeometry(0.12, 0.012, 0.215), GOLD, { bone: footJ, at: [x, 0.076, 0.015], flat: true });
    b.frustumBox([x, 0.04, 0.1], [x, 0.03, 0.26], [0.1, 0.07], [0.05, 0.035], {
      bone: toe,
      color: paint((_p, _n, sc) => ((sc[0] * 4) % 1 < 0.12 ? STEEL_D : STEEL)),
    });

    // spur
    b.rod([x, 0.055, -0.09], [x, 0.055, -0.15], 0.007, { bone: footJ, color: GOLD, sides: 5 });
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.006, 6), GOLD, {
      bone: footJ,
      at: [x, 0.055, -0.16],
      dir: [1, 0, 0],
      flat: true,
    });
  }

  return b.root;
}
```