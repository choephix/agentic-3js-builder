import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { glow } from "../kits/glow";
import { mix, paint, smoothstep } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Rally Hatchback",
  description:
    "A 4 m rally hatchback in hextech blue and gold: flared arches, a roof light bar and fog pods, a rear wing, hinged wheels, steering, hood, hatch and mud flaps, with cyan and magenta glow on the lamps, grille and rune plate.",
  style: "League of Legends",
  commit: "b816db2",
};

type Pt = [number, number];

// Palette: hextech blue body, gold trim, cyan and magenta light.
const BLUE = "#1c56dc";
const BLUE_HI = "#5aa6ff";
const BLUE_DEEP = "#0b1f6b";
const GOLD = "#ffc233";
const MAGENTA = "#ff3d9a";
const TRIM = "#15172c";
const SKIRT = "#0e1124";
const SEAM = "#050818";
const TYRE = "#17171e";
const RIM = "#ffd35a";
const CHROME = "#d3dcea";
const CYAN = "#7ff6ff";
const RED = "#ff3d4a";
const LAMP = "#eafcff";

const WR = 0.33; // wheel radius (m)
const TRACK = 0.8; // wheel centre |x|
const AXF = 1.22; // front axle z
const AXR = -1.22; // rear axle z
const SEAMS = [0.7, -0.12, -0.8]; // door seams along the flank

const bodyPaint = paint((p, n) => {
  if (p.y < 0.36 || n.y < -0.5) return SKIRT;
  if (Math.abs(n.x) > 0.6) {
    if (SEAMS.some((z) => Math.abs(p.z - z) < 0.008)) return SEAM;
    if (p.y > 0.534 && p.y < 0.562) return GOLD;
    if (p.y > 0.57 && p.y < 0.582) return MAGENTA;
  }
  if (n.y > 0.6 && Math.abs(p.x) < 0.075) return GOLD;
  if (n.y > 0.6) return mix(BLUE, BLUE_HI, 0.5);
  return mix(BLUE_DEEP, BLUE, smoothstep(-1.9, 1.9, p.z));
});

const hoodPaint = paint((p, n) => (Math.abs(p.x) < 0.075 ? GOLD : mix(BLUE, BLUE_HI, smoothstep(0.7, 1, n.y))));

const cabinPaint = paint((p, n) => (n.y > 0.6 ? (Math.abs(p.x) < 0.075 ? GOLD : BLUE) : TRIM));

const glassPaint = paint((p) => mix("#3d8ad8", "#071431", smoothstep(0.95, 1.4, p.y)));

const wingPaint = paint((p) => (p.z < -2.0 ? GOLD : BLUE_DEEP));

// Body stations: centre height, full width and full height along z (nose at +z).
const station = (z: number, bottom: number, top: number, w: number) => ({
  at: [0, (bottom + top) / 2, z],
  w,
  h: top - bottom,
});
const BODY = [
  station(1.98, 0.26, 0.66, 1.34),
  station(1.78, 0.22, 0.74, 1.5),
  station(1.4, 0.22, 0.82, 1.56),
  station(0.8, 0.22, 0.86, 1.58),
  station(0.1, 0.22, 0.88, 1.6),
  station(-0.9, 0.22, 0.9, 1.58),
  station(-1.45, 0.24, 0.94, 1.52),
  station(-1.9, 0.3, 0.98, 1.38),
  station(-1.99, 0.3, 0.96, 1.3),
];
const CABIN = [
  station(0.66, 0.84, 0.96, 1.46),
  station(0.38, 0.84, 1.2, 1.5),
  station(0.1, 0.84, 1.38, 1.52),
  station(-0.4, 0.86, 1.4, 1.52),
  station(-1.0, 0.9, 1.36, 1.4),
];

// Side-profile outlines in (z, y); extruded across x.
const WINDSCREEN: Pt[] = [
  [0.66, 0.99],
  [0.38, 1.22],
  [0.1, 1.4],
  [0.02, 1.42],
  [0.02, 1.36],
  [0.1, 1.35],
  [0.38, 1.16],
  [0.66, 0.92],
];
const FRONT_WIN: Pt[] = [
  [0.6, 0.98],
  [0.34, 1.19],
  [0.12, 1.34],
  [-0.1, 1.34],
  [-0.12, 0.98],
];
const REAR_WIN: Pt[] = [
  [-0.22, 0.98],
  [-0.22, 1.34],
  [-0.8, 1.34],
  [-0.92, 1.22],
  [-0.92, 0.98],
];
const REAR_GLASS: Pt[] = [
  [-0.84, 1.38],
  [-1.0, 1.36],
  [-1.66, 0.99],
  [-1.56, 0.96],
];
const WING: Pt[] = [
  [-1.7, 1.08],
  [-1.84, 1.16],
  [-2.04, 1.17],
  [-2.12, 1.11],
  [-2.04, 1.04],
  [-1.84, 1.02],
];
const WING_PLATE: Pt[] = [
  [-1.66, 0.98],
  [-1.66, 1.18],
  [-2.14, 1.18],
  [-2.14, 0.96],
];
// Flap in (outward x, y), placed by its mirror sign and z.
const FLAP: Pt[] = [
  [0.66, 0.36],
  [0.94, 0.36],
  [0.94, 0.18],
  [0.8, 0.07],
  [0.66, 0.18],
];
const HEAD_LAMP: Pt[] = [
  [0.36, 0.7],
  [0.72, 0.745],
  [0.8, 0.7],
  [0.72, 0.655],
  [0.4, 0.645],
];
const TAIL_LAMP: Pt[] = [
  [0.36, 0.78],
  [0.78, 0.88],
  [0.84, 0.81],
  [0.4, 0.72],
];

// Wheel-arch annulus in (z, y) around an axle, from the top of the wheel up and over.
function arch(zc: number, ro: number, ri: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= 14; i++) {
    const a = (Math.PI * i) / 14;
    pts.push([zc + Math.cos(a) * ro, WR + Math.sin(a) * ro]);
  }
  for (let i = 14; i >= 0; i--) {
    const a = (Math.PI * i) / 14;
    pts.push([zc + Math.cos(a) * ri, WR + Math.sin(a) * ri]);
  }
  return pts;
}

// Vector grille: a hex mesh with gold rims.
function grilleSvg(): string {
  const R = 11;
  const W = Math.sqrt(3) * R;
  const H = 1.5 * R;
  let hexes = "";
  for (let row = 0; row < 6; row++) {
    for (let col = -1; col < 14; col++) {
      const cx = col * W + (row % 2 ? W / 2 : 0) + 4;
      const cy = row * H + 4;
      const pts: string[] = [];
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 3) * k + Math.PI / 6;
        pts.push(`${(cx + R * 0.9 * Math.cos(a)).toFixed(1)},${(cy + R * 0.9 * Math.sin(a)).toFixed(1)}`);
      }
      hexes += `<polygon points="${pts.join(" ")}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80"><rect width="200" height="80" fill="#0b0d1c"/><g fill="#1b2140" stroke="${GOLD}" stroke-width="2.4" stroke-linejoin="round">${hexes}</g></svg>`;
}

const GLYPH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><g fill="none" stroke="${CYAN}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><polygon points="50,3 90,16 90,44 50,57 10,44 10,16"/><polygon points="50,15 72,30 50,45 28,30"/><line x1="50" y1="3" x2="50" y2="15"/><line x1="50" y1="45" x2="50" y2="57"/><line x1="10" y1="30" x2="28" y2="30"/><line x1="72" y1="30" x2="90" y2="30"/></g></svg>`;

const NUMBER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="${LAMP}"/><circle cx="50" cy="50" r="38" fill="${MAGENTA}"/><text x="50" y="64" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="bold" text-anchor="middle" fill="${LAMP}">07</text></svg>`;

const merge = (g: THREE.BufferGeometry[]) => {
  const m = mergeGeometries(g);
  if (!m) throw new Error("geometry merge failed");
  return m;
};

export default function build() {
  const b = createBuilder({ name: "rallyHatchback" });
  const root = b.joint("chassis", { at: [0, 0.5, 0], dir: [0, 0, 1], role: "spine" });

  const grille = svg(grilleSvg(), { size: 512 });
  const glyph = svg(GLYPH_SVG, { size: 512 });
  const number = svg(NUMBER_SVG, { size: 256 });

  // Shell: lower body, greenhouse, windscreen and side glass.
  b.loft(BODY, { section: "box", caps: "flat", bone: root, color: bodyPaint });
  b.loft(CABIN, { section: "box", caps: "flat", bone: root, color: cabinPaint });
  b.extrude(WINDSCREEN, { x: [0, 0, 1], at: [0, 0, 0], thickness: 1.36, color: glassPaint, bone: root });
  for (const s of [1, -1]) {
    b.extrude(FRONT_WIN, { x: [0, 0, 1], at: [s * 0.765, 0, 0], thickness: 0.02, color: glassPaint, bone: root });
    b.extrude(REAR_WIN, { x: [0, 0, 1], at: [s * 0.765, 0, 0], thickness: 0.02, color: glassPaint, bone: root });
    b.rod([s * 0.745, 1.36, 0.14], [s * 0.735, 1.36, -0.92], 0.013, { bone: root, color: GOLD });
  }

  // Hood and hatch: hinged at the cowl and the roof's rear edge.
  const hood = b.joint("hood", { parent: root, at: [0, 0.86, 0.64], dir: [0, -0.08, 1], role: "hinge" });
  b.frustumBox([0, 0.88, 0.62], [0, 0.79, 1.8], [1.52, 0.05], [1.4, 0.05], { bone: hood, color: hoodPaint });
  b.frustumBox([0, 0.86, 1.2], [0, 0.84, 1.44], [0.36, 0.06], [0.34, 0.06], { bone: hood, color: TRIM });
  b.frustumBox([-0.16, 0.9, 1.3], [0.16, 0.9, 1.3], [0.04, 0.02], [0.04, 0.02], { bone: hood, color: GOLD });
  for (const s of [1, -1]) {
    for (const z of [0.95, 1.06, 1.17]) {
      b.part(new THREE.BoxGeometry(0.2, 0.012, 0.05), TRIM, { bone: hood, at: [s * 0.36, 0.911 - 0.0763 * (z - 0.62), z] });
    }
  }

  const hatch = b.joint("hatch", { parent: root, at: [0, 1.36, -0.98], dir: [0, -0.5, -1], role: "hinge" });
  b.extrude(REAR_GLASS, { x: [0, 0, 1], at: [0, 0, 0], thickness: 1.3, color: glassPaint, bone: hatch });
  b.rod([-0.66, 1.36, -1.0], [0.66, 1.36, -1.0], 0.02, { bone: hatch, color: GOLD });

  // Wheel-arch flares with gold lips.
  for (const z of [AXF, AXR]) {
    for (const s of [1, -1]) {
      b.extrude(arch(z, 0.46, 0.37), { x: [0, 0, 1], at: [s * 0.86, 0, 0], thickness: 0.18, bevel: 0.02, color: TRIM, bone: root });
      b.extrude(arch(z, 0.48, 0.46), { x: [0, 0, 1], at: [s * 0.955, 0, 0], thickness: 0.02, bevel: 0.005, color: GOLD, bone: root });
    }
  }

  // Wheels: each corner gets a spin joint; the front corners also steer.
  const wheel = (cx: number, cz: number, joint: Joint) => {
    const tyre: THREE.BufferGeometry[] = [
      new THREE.CylinderGeometry(WR, WR, 0.25, 26).rotateZ(Math.PI / 2).translate(cx, WR, cz),
    ];
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      tyre.push(
        new THREE.BoxGeometry(0.26, 0.04, 0.06)
          .rotateX(a)
          .translate(cx, WR + 0.33 * Math.cos(a), cz + 0.33 * Math.sin(a)),
      );
    }
    const rims: THREE.BufferGeometry[] = [];
    const hubs: THREE.BufferGeometry[] = [];
    const nuts: THREE.BufferGeometry[] = [];
    const calipers: THREE.BufferGeometry[] = [];
    for (const side of [1, -1]) {
      const fx = cx + side * 0.142;
      rims.push(new THREE.CylinderGeometry(0.2, 0.2, 0.016, 20).rotateZ(Math.PI / 2).translate(cx + side * 0.128, WR, cz));
      hubs.push(
        new THREE.CylinderGeometry(0.035, 0.035, 0.02, 12).rotateZ(Math.PI / 2).translate(fx + side * 0.01, WR, cz),
      );
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        nuts.push(
          new THREE.CylinderGeometry(0.014, 0.014, 0.03, 6)
            .rotateZ(Math.PI / 2)
            .translate(fx + side * 0.02, WR + 0.06 * Math.cos(a), cz + 0.06 * Math.sin(a)),
        );
      }
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 + 0.3;
        tyre.push(
          new THREE.BoxGeometry(0.02, 0.15, 0.04)
            .rotateX(a)
            .translate(fx, WR + 0.105 * Math.cos(a), cz + 0.105 * Math.sin(a)),
        );
      }
      const ca = 2.4;
      calipers.push(
        new THREE.BoxGeometry(0.03, 0.07, 0.08)
          .rotateX(ca)
          .translate(cx + side * 0.16, WR + 0.14 * Math.cos(ca), cz + 0.14 * Math.sin(ca)),
      );
    }
    b.part(merge(tyre), TYRE, { bone: joint, at: [0, 0, 0] });
    b.part(merge(rims), RIM, { bone: joint, at: [0, 0, 0] });
    b.part(merge(calipers), RED, { bone: joint, at: [0, 0, 0] });
    glow(b.part(merge(hubs), CYAN, { bone: joint, at: [0, 0, 0] }), 1.4);
    b.part(merge(nuts), CHROME, { bone: joint, at: [0, 0, 0] });
  };

  const corner = (tag: string, x: number, z: number, steered: boolean) => {
    let parent: Joint = root;
    if (steered) parent = b.joint(`steer${tag}`, { parent: root, at: [x, WR, z], dir: [0, 1, 0], role: "hinge" });
    const spin = b.joint(`spin${tag}`, { parent, at: [x, WR, z], dir: [1, 0, 0], role: "hinge" });
    wheel(x, z, spin);
  };
  corner("FL", TRACK, AXF, true);
  corner("FR", -TRACK, AXF, true);
  corner("RL", TRACK, AXR, false);
  corner("RR", -TRACK, AXR, false);

  // Mud flaps behind each wheel, hinged at their top edge.
  for (const [tag, s, z] of [
    ["FL", 1, AXF - 0.36],
    ["FR", -1, AXF - 0.36],
    ["RL", 1, AXR - 0.36],
    ["RR", -1, AXR - 0.36],
  ] as const) {
    const flap = b.joint(`flap${tag}`, { parent: root, at: [s * TRACK, 0.36, z], dir: [0, -1, 0], role: "hinge" });
    b.extrude(FLAP, { at: [0, 0, z], x: [s, 0, 0], thickness: 0.02, color: TRIM, bone: flap });
    b.part(new THREE.BoxGeometry(0.3, 0.014, 0.026), GOLD, { bone: flap, at: [s * TRACK, 0.355, z] });
  }

  // Lights: angled headlamps, DRLs, angled taillights, and the rear rune plate.
  for (const s of [1, -1]) {
    glow(b.extrude(HEAD_LAMP, { at: [0, 0, 1.99], x: [s, 0, 0], thickness: 0.05, color: LAMP, bone: root }), 1.3);
    glow(b.part(new THREE.BoxGeometry(0.34, 0.014, 0.03), CYAN, { bone: root, at: [s * 0.62, 0.63, 2.0] }));
    glow(b.extrude(TAIL_LAMP, { at: [0, 0, -2.0], x: [s, 0, 0], thickness: 0.05, color: MAGENTA, bone: root }), 1.4);
  }
  glow(b.part(new THREE.BoxGeometry(0.44, 0.026, 0.04), MAGENTA, { bone: root, at: [0, 0.88, -2.0] }), 1.4);
  glow(
    b.part(new THREE.PlaneGeometry(0.44, 0.264), "#ffffff", {
      bone: root,
      at: [0, 0.56, -2.01],
      dir: [0, 0, -1],
      axis: "z",
      texture: glyph,
    }),
    1.2,
  );

  // Grille, splitter and tow hooks.
  b.part(new THREE.PlaneGeometry(0.8, 0.32), "#ffffff", {
    bone: root,
    at: [0, 0.52, 2.0],
    dir: [0, 0, 1],
    axis: "z",
    texture: grille,
  });
  b.part(new THREE.BoxGeometry(1.7, 0.03, 0.22), TRIM, { bone: root, at: [0, 0.25, 2.0] });
  b.part(new THREE.BoxGeometry(1.7, 0.02, 0.02), GOLD, { bone: root, at: [0, 0.238, 2.12] });
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.05, 0.012, 6, 12), RED, { bone: root, at: [s * 0.5, 0.2, 2.02] });
  }

  // Light pods: four on the roof bar, two in the bumper.
  const pods: [number, number, number][] = [
    [-0.46, 1.48, -0.02],
    [-0.15, 1.48, -0.02],
    [0.15, 1.48, -0.02],
    [0.46, 1.48, -0.02],
    [-0.56, 0.42, 1.99],
    [0.56, 0.42, 1.99],
  ];
  const housing: THREE.BufferGeometry[] = [];
  const rings: THREE.BufferGeometry[] = [];
  const lenses: THREE.BufferGeometry[] = [];
  for (const [x, y, z] of pods) {
    housing.push(new THREE.CylinderGeometry(0.07, 0.075, 0.05, 18).rotateX(Math.PI / 2).translate(x, y, z + 0.025));
    rings.push(new THREE.TorusGeometry(0.072, 0.009, 6, 18).translate(x, y, z + 0.05));
    lenses.push(new THREE.CylinderGeometry(0.052, 0.052, 0.012, 16).rotateX(Math.PI / 2).translate(x, y, z + 0.052));
  }
  b.part(merge(housing), TRIM, { bone: root, at: [0, 0, 0] });
  b.part(merge(rings), GOLD, { bone: root, at: [0, 0, 0] });
  glow(b.part(merge(lenses), CYAN, { bone: root, at: [0, 0, 0] }), 1.6);
  b.rod([-0.66, 1.44, -0.02], [0.66, 1.44, -0.02], 0.022, { bone: root, color: TRIM });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.05, 0.06, 0.06), TRIM, { bone: root, at: [s * 0.6, 1.41, -0.02] });
  }

  // Rear wing on uprights, with endplates.
  b.extrude(WING, { x: [0, 0, 1], at: [0, 0, 0], thickness: 1.56, color: wingPaint, bone: root });
  for (const s of [1, -1]) {
    b.extrude(WING_PLATE, { x: [0, 0, 1], at: [s * 0.78, 0, 0], thickness: 0.02, color: TRIM, bone: root });
    b.rod([s * 0.5, 0.94, -1.84], [s * 0.5, 1.03, -1.84], 0.022, { bone: root, color: TRIM });
  }

  // Rear diffuser and twin exhausts.
  b.part(new THREE.BoxGeometry(1.36, 0.1, 0.1), TRIM, { bone: root, at: [0, 0.27, -1.98] });
  const pipes: THREE.BufferGeometry[] = [];
  const tips: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    pipes.push(new THREE.CylinderGeometry(0.045, 0.045, 0.14, 12).rotateX(Math.PI / 2).translate(s * 0.36, 0.24, -2.02));
    tips.push(new THREE.CylinderGeometry(0.052, 0.052, 0.03, 12).rotateX(Math.PI / 2).translate(s * 0.36, 0.24, -2.1));
  }
  b.part(merge(pipes), CHROME, { bone: root, at: [0, 0, 0] });
  b.part(merge(tips), GOLD, { bone: root, at: [0, 0, 0] });

  // Finishing details: underglow, roof fin, bumper and rear trim.
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.02, 0.018, 2.9), CYAN, { bone: root, at: [s * 0.8, 0.215, 0] }), 1.1);
  }
  b.extrude(
    [
      [-0.5, 1.34],
      [-0.84, 1.34],
      [-0.78, 1.5],
      [-0.62, 1.5],
    ],
    { x: [0, 0, 1], at: [0, 0, 0], thickness: 0.03, color: TRIM, bone: root },
  );
  b.part(new THREE.BoxGeometry(1.36, 0.024, 0.03), GOLD, { bone: root, at: [0, 0.31, -2.0] });
  b.part(new THREE.BoxGeometry(1.5, 0.024, 0.03), GOLD, { bone: root, at: [0, 0.36, 2.0] });
  b.part(new THREE.BoxGeometry(1.5, 0.024, 0.03), GOLD, { bone: root, at: [0, 0.68, 2.0] });
  const sticker = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 60"><rect x="2" y="6" width="296" height="48" rx="8" fill="${GOLD}"/><text x="150" y="46" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="${BLUE_DEEP}">HEXTECH RALLY</text></svg>`,
    { size: 512 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.3, 0.06), "#ffffff", {
      bone: root,
      at: [s * 0.812, 0.74, -0.46],
      dir: [s, 0, 0],
      axis: "z",
      texture: sticker,
    });
  }
  // Mirrors, door handles and the race-number decals.
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.16, 0.07, 0.11), TRIM, { bone: root, at: [s * 0.86, 0.96, 0.46] });
    b.rod([s * 0.74, 0.9, 0.5], [s * 0.84, 0.94, 0.46], 0.018, { bone: root, color: TRIM });
    for (const z of [0.3, -0.46]) {
      b.part(new THREE.BoxGeometry(0.1, 0.018, 0.03), GOLD, { bone: root, at: [s * 0.81, 0.64, z] });
    }
    b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", {
      bone: root,
      at: [s * 0.812, 0.72, 0.29],
      dir: [s, 0, 0],
      axis: "z",
      texture: number,
    });
  }

  return b.root;
}
