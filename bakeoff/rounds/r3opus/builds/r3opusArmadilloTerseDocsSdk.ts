import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  limb,
  rng,
  paint,
  scales,
  mottle,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Nine-banded Armadillo",
  description:
    "A stylized low-poly nine-banded armadillo: domed carapace with scaly shields and nine ridged bands, a long ringed tail, a pointed snout with a hinged jaw, tall leaf ears and digging claws, rigged in a neutral rest pose.",
};

const SHELL = "#b98a5e";
const SHELL_LIGHT = "#d6ae80";
const EDGE = "#5e3f2a";
const RIDGE = "#6e4b33";
const BAND = "#a87a52";
const BAND_LIGHT = "#d8b48a";
const SKIN = "#e3b39b";
const SKIN_DARK = "#c48f7a";
const EAR_IN = "#d98f86";
const CLAW = "#efe2c4";
const EYE = "#15100d";
const WHITE = "#ffffff";
const NOSE = "#7a4a44";
const STUD = "#cfa476";

const fract = (x: number) => x - Math.floor(x);

export default function build() {
  const b = createBuilder({ name: "armadillo" });

  // ---------------- Skeleton ----------------
  const hips = b.joint("hips", { at: [0, 0.15, -0.12], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.155, -0.02],
      [0, 0.157, 0.08],
      [0, 0.15, 0.17],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.tip!;
  const neck = b.joint("neck", { parent: chest, at: [0, 0.145, 0.19], aim: [0, 0.128, 0.27], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.128, 0.27], dir: [0, -0.3, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.0, -0.018]),
    aim: head.local([0, 0.11, -0.03]),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.13, -0.24],
      [0, 0.11, -0.34],
      [0, 0.07, -0.46],
      [0, 0.025, -0.6],
    ]),
    { parent: hips, count: 6, role: "tail" },
  );

  // ---------------- Body: belly + carapace ----------------
  const bodyPath = catmull([
    [0, 0.14, -0.23],
    [0, 0.15, -0.12],
    [0, 0.157, 0.03],
    [0, 0.15, 0.18],
  ]);
  const k = (t: number) => Math.sin(Math.PI * (0.1 + 0.82 * t));
  const rx = (t: number) => 0.055 + 0.052 * k(t);
  const ry = (t: number) => 0.05 + 0.035 * k(t);

  const bellyPaint = mottle(SKIN, SKIN_DARK, { size: 0.05, contrast: 0.4, seed: 3 });
  const belly = b.sweep(bodyPath, (t: number) => [rx(t) * 0.9, ry(t) * 0.88], {
    bone: [hips, spine],
    shift: [0, -0.012],
    color: bellyPaint,
    name: "belly",
  });

  // band region in body t
  const B0 = 0.32;
  const B1 = 0.73;
  const NB = 9;
  const bandW = (B1 - B0) / NB;
  const shieldPaint = scales(SHELL, EDGE, { size: 0.016, seed: 5 });
  const bandPaint = paint((_p, _n, s) => {
    const f = fract((s[0] - B0) / bandW);
    const cell = Math.floor((s[1] + 360) / 9) % 2;
    if (f > 0.62) return BAND_LIGHT;
    return cell ? BAND : SHELL;
  });
  const shellPaint = paint((_p, _n, s) => (s[0] > B0 && s[0] < B1 ? bandPaint : shieldPaint));

  const cara = b.sweep(bodyPath, (t: number) => [rx(t) * 1.12, ry(t)], {
    bone: [hips, spine],
    shift: [0, 0.022],
    sectors: [
      [-120, 120, shellPaint],
      [120, 240, SKIN_DARK],
    ],
    name: "carapace",
  });

  // shell skirt rims
  for (const d of [118, -118]) {
    b.sweep(cara.line(d, 0.002), 0.007, { bone: [hips, spine], color: EDGE, name: "rim" });
  }

  // band ridges with little scute teeth
  for (let i = 0; i <= NB; i++) {
    const t = B0 + i * bandW;
    const pts: THREE.Vector3[] = [];
    for (let d = -115; d <= 115; d += 23) pts.push(cara.at(t, d, 0.002).at.clone());
    const ridge = catmull(pts);
    const bone = cara.at(t, 0).bone!;
    b.sweep(ridge, 0.0055, { bone, color: RIDGE, sides: 6, name: "ridge" });
    if (i > 0) {
      b.along(ridge, 13, (pt) => {
        b.part(new THREE.ConeGeometry(0.0055, 0.014, 3), BAND_LIGHT, {
          at: pt,
          dir: [0, -0.25, -1],
          bone,
          flat: true,
          name: "scute",
        });
      });
    }
  }

  // raised hex studs on the scapular and pelvic shields
  const caraSurf = b.surface(cara);
  const studHits = caraSurf.scatter(90, {
    rng: rng(7),
    minDist: 0.024,
    filter: (h) => h.n.y > 0.12 && (h.at.z > 0.075 || h.at.z < -0.105),
  });
  for (const h of studHits) {
    b.stick(new THREE.CylinderGeometry(0.008, 0.0105, 0.006, 6), STUD, h, { embed: 0.4, flat: true, name: "stud" });
  }

  // sparse belly hairs
  const hair = svg(
    `<svg viewBox="0 0 8 32"><path d="M4 32 Q2.5 16 5 1" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
    { size: 64 },
  );
  const hairHits = b.surface(belly).scatter(70, {
    rng: rng(5),
    minDist: 0.018,
    filter: (h) => h.at.y < 0.085 && h.n.y < 0.5,
  });
  b.cards(hairHits, hair, { size: [0.008, 0.028], lean: 35, bend: 20, vary: 0.3, rng: rng(6), color: "#e9d6bb" });

  // ---------------- Neck & head ----------------
  b.capsule(neck.at, head.local([0, 0.01, 0]), 0.036, { bone: neck, color: SKIN_DARK, name: "neck" });

  const skull = b.sweep(
    polyline([head.local([0, -0.035, 0]), head.local([0, 0.02, 0]), head.local([0, 0.13, 0])]),
    (t: number) => {
      const a = t < 0.3 ? 1 : 1 - ((t - 0.3) / 0.7) * 0.72;
      return [0.042 * a, 0.036 * a];
    },
    {
      bone: head,
      shift: [0, 0.006],
      caps: { start: "round", end: "flat" },
      color: mottle(SKIN_DARK, SHELL, { size: 0.03, contrast: 0.5, seed: 9 }),
      name: "skull",
    },
  );

  // head shield decal
  let cells = "";
  for (let row = 0; row < 13; row++) {
    for (let col = 0; col < 8; col++) {
      const cx = 4 + col * 8 + (row % 2) * 4;
      const cy = 6 + row * 7;
      const hw = cy < 26 ? 4 + 24 * (cy / 26) : 28 - (cy > 70 ? ((cy - 70) / 24) * 12 : 0);
      if (Math.abs(cx - 32) > hw - 3) continue;
      const pts: string[] = [];
      for (let j = 0; j < 6; j++) {
        const a = (Math.PI / 3) * j + Math.PI / 6;
        pts.push(`${(cx + 3.5 * Math.cos(a)).toFixed(2)},${(cy + 3.5 * Math.sin(a)).toFixed(2)}`);
      }
      const shade = fract(Math.sin(row * 12.9 + col * 78.2) * 43758.5) > 0.5 ? "#d6ae80" : "#b98a5e";
      cells += `<polygon points="${pts.join(" ")}" fill="${shade}"/>`;
    }
  }
  const shieldTex = svg(
    `<svg viewBox="0 0 64 96"><path d="M32 2 L8 26 L4 66 Q4 92 32 94 Q60 92 60 66 L56 26 Z" fill="#5e3f2a"/>${cells}</svg>`,
    { size: 256 },
  );
  b.decal(skull, shieldTex, {
    at: head.local({ up: 0.06, forward: 0.045 }),
    dir: head.dir([0, 0, 1]),
    up: head.axis,
    size: [0.055, 0.085],
    bone: head,
    name: "headShield",
  });

  // snout nose pad
  b.part(new THREE.CylinderGeometry(0.0115, 0.0125, 0.006, 8), NOSE, {
    bone: head,
    at: head.local([0, 0.131, 0.006]),
    dir: head.axis,
    name: "nose",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0028, 5, 4), EYE, {
      bone: head,
      at: head.local([s * 0.0045, 0.134, 0.006]),
      name: "nostril",
    });
  }

  // lower jaw
  b.sweep(polyline([jaw.at, jaw.local([0, 0.105, 0])]), (t: number) => [0.026 * (1 - 0.55 * t), 0.011 * (1 - 0.3 * t)], {
    bone: jaw,
    color: SKIN,
    name: "jaw",
  });

  // eyes
  const skullSurf = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurf.nearest(head.local({ left: s * 0.04, up: 0.018, forward: 0.035 }));
    b.stick(new THREE.SphereGeometry(0.0075, 8, 6), EYE, hit, { embed: 0.45, bone: head, name: "eye" });
    b.part(new THREE.SphereGeometry(0.0024, 4, 3), WHITE, {
      bone: head,
      at: hit.local([0, 0.0065, 0.003]),
      name: "eyeGlint",
    });
  }

  // ears
  const earOutline: [number, number][] = [
    [-0.011, -0.008],
    [0.011, -0.008],
    [0.017, 0.022],
    [0.011, 0.048],
    [0, 0.062],
    [-0.012, 0.045],
    [-0.016, 0.018],
  ];
  const earPaint = paint((_p, _n, s) =>
    Math.hypot(s[0] / 0.0095, (s[1] - 0.026) / 0.022) < 1 ? EAR_IN : SKIN_DARK,
  );
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: head.local({ left: s * 0.026, up: 0.034, back: 0.012 }),
      dir: [s * 0.5, 1, -0.45],
      role: "hinge",
    });
    b.extrude(earOutline, {
      at: ear.at,
      x: [0, 0.45, 1],
      y: [s * 0.5, 1, -0.45],
      thickness: 0.004,
      bevel: 0.0015,
      smoothing: 2,
      color: earPaint,
      bone: ear,
      name: "ear",
    });
  }

  // ---------------- Legs ----------------
  const legPaint = scales("#a8785a", EDGE, { size: 0.012, seed: 4 });
  const legs = [
    { key: "F", z: 0.13, fz: 0.16, parent: spine.joints[1], lens: [0.06, 0.065], bend: [0, 0, -1], names: ["shoulder", "elbow", "wrist"], toes: [[-0.012, 0.02], [-0.004, 0.032], [0.004, 0.032], [0.012, 0.02]] },
    { key: "H", z: -0.13, fz: -0.12, parent: hips, lens: [0.065, 0.06], bend: [0, 0, 1], names: ["hip", "knee", "ankle"], toes: [[-0.014, 0.015], [-0.007, 0.022], [0, 0.025], [0.007, 0.022], [0.014, 0.015]] },
  ];
  for (const L of legs) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const root: [number, number, number] = [s * 0.075, 0.12, L.z];
      const fx = s * 0.085;
      const foot: [number, number, number] = [fx, 0.012, L.fz];
      const pts = limb(root, foot, L.lens, [L.bend as [number, number, number]]);
      const chain = b.chain(`leg${L.key}${side}`, pts, {
        parent: L.parent,
        names: L.names.map((n) => `${n}${L.key}${side}`),
        role: "leg",
        contact: [fx, 0, L.fz],
      });
      b.sweep(chain, [0.024, 0.016], { color: legPaint, name: "leg" });
      const tip = chain.tip!;
      b.part(new THREE.SphereGeometry(0.018, 7, 5), SKIN_DARK, {
        bone: tip,
        at: [fx, 0.0095, L.fz + 0.006],
        scale: [1.1, 0.55, 1.3],
        name: "foot",
      });
      for (const [dx, len] of L.toes) {
        const bx = fx + s * dx;
        b.capsule([bx, 0.011, L.fz + 0.008], [bx + s * dx * 0.3, 0.009, L.fz + 0.02], 0.0055, {
          bone: tip,
          color: SKIN_DARK,
          name: "toe",
        });
        b.spike([bx + s * dx * 0.3, 0.009, L.fz + 0.02], [bx + s * dx * 0.6, 0.002, L.fz + 0.02 + len], null, 0.0045, {
          bone: tip,
          color: CLAW,
          sides: 5,
          name: "claw",
        });
      }
    }
  }

  // ---------------- Tail ----------------
  const tailPaint = paint((_p, _n, s) => (fract(s[0] * 13) < 0.28 ? EDGE : scales(SHELL, RIDGE, { size: 0.01, seed: 8 })));
  const tailSweep = b.sweep(tail, [0.034, 0.006], { color: tailPaint, name: "tail" });
  for (let i = 0; i < 8; i++) {
    const t = 0.06 + i * 0.075;
    const pts: THREE.Vector3[] = [];
    for (let d = 0; d < 360; d += 30) pts.push(tailSweep.at(t, d, 0.0015).at.clone());
    b.sweep(catmull(pts, { closed: true }), 0.003 * (1 - t * 0.6), {
      bone: tailSweep.at(t, 0).bone!,
      color: BAND_LIGHT,
      sides: 5,
      name: "tailRing",
    });
  }

  return b.root;
}
