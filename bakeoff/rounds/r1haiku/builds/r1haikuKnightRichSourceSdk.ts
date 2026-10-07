import * as THREE from "three";
import { aim, catmull, cells, createBuilder, gradient, mottle, paint, rng, stripes, svg } from "../../../../src/index";
import type { Paint } from "../../../../src/index";

export const meta = {
  name: "Battle-worn knight",
  description:
    "A fantasy knight in dented plate: great helm with a crimson plume, gold-etched pauldrons, a blue surcoat with a silver griffin, a kite shield, a broadsword and a torn crimson cape.",
};

// ---------------------------------------------------------------- paints
const STEEL = mottle("#aab2bc", "#7c8693", { size: 0.22, seed: 2 });
const BLUE = mottle("#22437f", "#16305e", { size: 0.35, seed: 6 });
const CRIMSON = mottle("#9c1d2d", "#6a0e1b", { size: 0.2, seed: 8 });
const DARK_RED = "#4a0a14";
const GOLD = mottle("#e3b74e", "#b07f2a", { size: 0.06, seed: 1 });
const SILVER = "#e4e9f0";
const BLACK = "#0c0d10";
const DARK_STEEL = "#3a4048";

/** Steel with dents (dark pits) and scratches (bright hairlines) across its cells. */
function battered(base: string | Paint, seed: number) {
  return paint((p) => {
    const c = cells(p, 0.1, seed);
    if (c.d1 < 0.05 && c.id < 0.35) return DARK_STEEL;
    if (c.d2 - c.d1 < 0.005 && c.id > 0.6) return "#dfe4ea";
    return base;
  });
}

const FILIGREE = stripes(battered(STEEL, 3), GOLD, { size: 0.035, axis: "y", width: 0.22, wobble: 0.6 });

// Silver griffin, drawn in white and greys so the part's silver tint shows through.
const GRIFFIN = svg(`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<g fill="#ffffff" stroke="#8a8a8a" stroke-width="2" stroke-linejoin="round">
<path d="M50 46 C30 12 8 20 6 40 C18 36 26 42 30 52 C20 54 14 62 12 70 C26 64 36 62 46 64 Z"/>
<path d="M50 46 C70 12 92 20 94 40 C82 36 74 42 70 52 C80 54 86 62 88 70 C74 64 64 62 54 64 Z"/>
<path d="M40 56 Q50 48 60 56 L63 82 L54 94 L50 84 L46 94 L37 82 Z"/>
<circle cx="50" cy="34" r="9"/>
<path d="M42 32 L24 36 L42 40 Z"/>
<path d="M46 26 L42 12 L52 24 Z"/>
</g></svg>`);

// ---------------------------------------------------------------- build
export default function knight() {
  const b = createBuilder({ name: "knight" });

  // Skeleton
  b.joint("hips", { at: [0, 0.98, 0] });
  const spine = b.chain("spine", [[0, 0.98, 0], [0, 1.2, 0], [0, 1.44, 0]], {
    role: "spine",
    names: ["spine1", "spine2", "neck"],
    parent: "hips",
  });
  b.joint("head", { at: [0, 1.62, 0], parent: "neck", role: "head" });

  const armL = b.chain("armL", [[0.2, 1.4, 0], [0.27, 1.15, 0.02], [0.3, 0.93, 0.05]], {
    role: "arm",
    names: ["shoulderL", "elbowL", "wristL"],
    parent: "spine2",
  });
  const armR = b.chain("armR", [[-0.2, 1.4, 0], [-0.27, 1.15, 0.02], [-0.3, 0.93, 0.05]], {
    role: "arm",
    names: ["shoulderR", "elbowR", "wristR"],
    parent: "spine2",
  });
  const legL = b.chain("legL", [[0.11, 0.98, 0], [0.12, 0.52, 0], [0.12, 0.1, 0.02]], {
    role: "leg",
    names: ["hipL", "kneeL", "ankleL"],
    parent: "hips",
  });
  const legR = b.chain("legR", [[-0.11, 0.98, 0], [-0.12, 0.52, 0], [-0.12, 0.1, 0.02]], {
    role: "leg",
    names: ["hipR", "kneeR", "ankleR"],
    parent: "hips",
  });

  // Torso: steel cuirass, then a blue surcoat over the lower body
  const cuirass = b.loft(
    [
      { at: [0, 1.06, 0], w: 0.3, h: 0.2 },
      { at: [0, 1.22, 0], w: 0.4, h: 0.24 },
      { at: [0, 1.38, 0], w: 0.36, h: 0.22 },
      { at: [0, 1.46, 0], w: 0.22, h: 0.18 },
    ],
    { color: battered(STEEL, 3), bone: spine },
  );
  const surcoat = b.loft(
    [
      { at: [0, 0.8, 0], w: 0.46, h: 0.3 },
      { at: [0, 0.95, 0], w: 0.42, h: 0.27 },
      { at: [0, 1.1, 0], w: 0.4, h: 0.26 },
      { at: [0, 1.18, 0], w: 0.38, h: 0.25 },
    ],
    { color: BLUE, bone: spine },
  );

  // Gold hem trim on the surcoat
  const hem = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return [0.225 * Math.sin(a), 0.81, 0.14 * Math.cos(a)];
  });
  b.sweep(catmull(hem, { closed: true }), 0.011, { color: GOLD, bone: "hips", name: "hemTrim" });

  // Griffin on the surcoat, seated on the nearest front surface
  const emblemSpot = b.surface(surcoat).nearest([0, 1.02, 0.4]);
  b.part(new THREE.PlaneGeometry(0.2, 0.22), SILVER, {
    texture: GRIFFIN,
    frame: emblemSpot,
    at: emblemSpot.at.clone().addScaledVector(emblemSpot.n, 0.004),
    quat: aim(emblemSpot.n, undefined, "z"),
    name: "surcoatGriffin",
  });

  // Pauldrons: three layered gold-etched bowls per shoulder
  const bowl = (k: number): [number, number][] => [
    [0, 0],
    [0.11 * k, 0],
    [0.12 * k, 0.025],
    [0.1 * k, 0.07],
    [0.05 * k, 0.095],
    [0, 0.1],
  ];
  for (const side of [1, -1]) {
    const shoulder = side > 0 ? "shoulderL" : "shoulderR";
    for (const [k, y] of [
      [1, 1.42],
      [0.9, 1.455],
      [0.75, 1.49],
    ] as const)
      b.lathe(bowl(k), { color: FILIGREE, at: [side * 0.21, y, 0], bone: shoulder });
  }

  // Helm: a tall loft bound to the head, with an eye slit and a nasal bar
  const helm = b.loft(
    [
      { at: [0, 1.5, 0], w: 0.2, h: 0.22 },
      { at: [0, 1.62, 0.01], w: 0.24, h: 0.26 },
      { at: [0, 1.76, 0], w: 0.23, h: 0.25 },
      { at: [0, 1.85, -0.02], w: 0.14, h: 0.16 },
    ],
    { color: battered(STEEL, 9), bone: "head" },
  );
  b.part(new THREE.BoxGeometry(0.15, 0.022, 0.03), BLACK, { at: [0, 1.665, 0.135], bone: "head", name: "eyeSlit" });
  b.part(new THREE.BoxGeometry(0.018, 0.13, 0.025), battered(STEEL, 9), {
    at: [0, 1.63, 0.14],
    bone: "head",
    name: "nasal",
  });
  b.sweep(
    [
      [0, 1.84, 0.1],
      [0, 1.87, 0],
      [0, 1.84, -0.12],
    ],
    0.012,
    { color: battered(STEEL, 9), bone: "head", name: "crest" },
  );
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.1, 10), battered(STEEL, 4), {
    at: [0, 1.5, 0],
    bone: "neck",
    name: "gorget",
  });

  // Tall crimson plume, sweeping back from the crown
  b.sweep(
    [
      [0, 1.83, -0.02],
      [0, 1.98, -0.05],
      [0, 2.1, -0.12],
      [0, 2.16, -0.24],
    ],
    [0.04, 0.03, 0.018, 0.004],
    { color: CRIMSON, bone: "head", name: "plume" },
  );
  b.sweep(
    [
      [0.02, 1.83, -0.02],
      [0.03, 1.96, -0.06],
      [0.03, 2.07, -0.13],
      [0.02, 2.11, -0.22],
    ],
    [0.024, 0.02, 0.01, 0.003],
    { color: DARK_RED, bone: "head", name: "plumeBack" },
  );

  // Limbs
  b.sweep(legL, [0.072, 0.06, 0.048], { color: battered(STEEL, 4), name: "greaveL" });
  b.sweep(legR, [0.072, 0.06, 0.048], { color: battered(STEEL, 4), name: "greaveR" });
  b.sweep(armL, [0.058, 0.05, 0.045], { color: battered(STEEL, 5), name: "armourL" });
  b.sweep(armR, [0.058, 0.05, 0.045], { color: battered(STEEL, 5), name: "armourR" });
  b.part(new THREE.SphereGeometry(0.06, 8, 6), battered(STEEL, 4), { at: [0.12, 0.52, 0.02], bone: "kneeL", name: "kneeCapL" });
  b.part(new THREE.SphereGeometry(0.06, 8, 6), battered(STEEL, 4), { at: [-0.12, 0.52, 0.02], bone: "kneeR", name: "kneeCapR" });

  // Sabatons and gauntlets
  b.part(new THREE.BoxGeometry(0.12, 0.1, 0.26), battered(STEEL, 7), { at: [0.12, 0.05, 0.07], bone: "ankleL", name: "sabatonL" });
  b.part(new THREE.BoxGeometry(0.12, 0.1, 0.26), battered(STEEL, 7), { at: [-0.12, 0.05, 0.07], bone: "ankleR", name: "sabatonR" });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), battered(STEEL, 5), { at: [0.3, 0.9, 0.06], bone: "wristL", name: "gauntletL" });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), battered(STEEL, 5), { at: [-0.3, 0.9, 0.06], bone: "wristR", name: "gauntletR" });

  // Kite shield on the left arm, its face blue, its griffin on the front
  const kite: [number, number][] = [
    [-0.16, 0.42],
    [0.16, 0.42],
    [0.16, 0.05],
    [0, -0.4],
    [-0.16, 0.05],
  ];
  const shield = b.extrude(kite, {
    color: battered(BLUE, 11),
    at: [0.36, 1.04, 0.12],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    bevel: 0.01,
    bone: "wristL",
    name: "shield",
  });
  b.part(new THREE.PlaneGeometry(0.2, 0.22), SILVER, {
    texture: GRIFFIN,
    frame: shield,
    at: shield.local([0, 0.02, 0.0175]),
    name: "shieldGriffin",
  });

  // Broadsword in the right hand, point down
  b.extrude(
    [
      [-0.03, 0],
      [0.03, 0],
      [0.03, 0.7],
      [0, 0.84],
      [-0.03, 0.7],
    ],
    {
      color: battered(STEEL, 6),
      at: [-0.31, 0.88, 0.08],
      x: [1, 0, 0],
      y: [0, -1, 0],
      thickness: 0.012,
      bevel: 0.004,
      bone: "wristR",
      name: "blade",
    },
  );
  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.035), GOLD, { at: [-0.31, 0.885, 0.08], bone: "wristR", name: "crossguard" });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.12, 6), BLACK, { at: [-0.31, 0.95, 0.08], bone: "wristR", name: "grip" });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLD, { at: [-0.31, 1.02, 0.08], bone: "wristR", name: "pommel" });

  // Torn crimson cape from the shoulders
  b.membrane(
    [
      [0.22, 1.42, -0.12],
      [0.1, 1.46, -0.16],
      [0, 1.44, -0.17],
      [-0.1, 1.46, -0.16],
      [-0.22, 1.42, -0.12],
    ],
    [
      [0.24, 1.0, -0.18],
      [0.18, 0.92, -0.2],
      [0.12, 0.98, -0.21],
      [0.04, 0.84, -0.22],
      [-0.04, 0.95, -0.22],
      [-0.12, 0.86, -0.21],
      [-0.2, 0.94, -0.2],
      [-0.24, 1.0, -0.18],
    ],
    {
      color: gradient(CRIMSON, DARK_RED, [0, 1.42, -0.16], [0, 0.86, -0.2]),
      thickness: 0.012,
      rows: 6,
      bone: "spine2",
      name: "cape",
    },
  );

  // Rivets across the front of the cuirass
  const rivets = b.surface(cuirass).scatter(18, { rng: rng(4), minDist: 0.06, filter: (h) => h.n.z > 0.5 });
  for (const hit of rivets) b.stick(new THREE.SphereGeometry(0.008, 5, 4), GOLD, hit, { embed: 0.4, name: "rivet" });

  return b.root;
}
