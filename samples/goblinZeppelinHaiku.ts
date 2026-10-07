import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { Fill } from "../src/context";
import { catmull } from "../src/path";
import { countershade, gradient, grain, patches, paint, stripes } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Rattletrap Goblin Zeppelin",
  description:
    "A ramshackle goblin airship hovering on sagging mooring ropes: a patched canvas envelope with stitched gores, rope hoops and hazard-banded nose, a scrap-plank basket with a glowing brew tank, a goblin pilot at the nose window, pusher props, mismatched fins, and a rope ladder, tied down by sandbagged stakes.",
  style: "Blizzard/Warcraft",
  commit: "b816db2",
};

type Vec = [number, number, number];

// Palette: sun-faded canvas, goblin-green and rust patches, dark stitching, worn iron, bright goblin green.
const CANVAS_A = "#e3c98f";
const CANVAS_B = "#c9a46a";
const PATCH_G = "#7fa23a";
const PATCH_R = "#c4572a";
const PATCH_T = "#6f9185";
const SEAM = "#4a2d17";
const BELLY = "#7a5230";
const FIN_R = "#c9652e";
const FIN_D = "#6b2c17";
const HAZ_D = "#2a2118";
const HAZ_Y = "#f0c23a";
const ROPE = "#b48b52";
const HEMP = "#8d6a3c";
const IRON = "#4d535c";
const IRON_L = "#8f98a2";
const RIVET = "#c4cbd3";
const BRASS = "#c9a14a";
const WOOD_A = "#8a5a33";
const WOOD_B = "#a06c40";
const WOOD_D = "#4a2c17";
const WINDOW = "#1d1816";
const GOB = "#94d857";
const GOB_D = "#4c8a2a";
const CAP = "#8a2f22";
const EYE = "#f4f0df";
const PUPIL = "#ffd23a";
const DARK = "#231a14";
const MOUTH = "#5a1e1a";
const TOOTH = "#f2ecd7";
const GLOW_G = "#8dff4a";
const GLOW_W = "#ffc063";
const TANK = "#5f6a55";
const TANK_D = "#3f4739";

const merge = (geos: THREE.BufferGeometry[]) => {
  const m = mergeGeometries(geos);
  if (!m) throw new Error("merge: geometries differ in attributes or indexing");
  return m;
};
const box = (w: number, h: number, d: number, x: number, y: number, z: number) =>
  new THREE.BoxGeometry(w, h, d).translate(x, y, z);

export default function build() {
  const b = createBuilder({ name: "goblinZeppelin", detail: 1.25 });
  const CY = 6.5; // envelope axis height
  const R = 2.2; // envelope half-height at its widest
  const hull = b.joint("hull", { at: [0, CY, 0] });

  // Model-space geometry rides the hull unless it has its own joint.
  const put = (geo: THREE.BufferGeometry, color: Fill, name?: string) =>
    b.part(geo, color, { bone: hull, at: [0, 0, 0], name });
  const rod = (a: Vec, c: Vec, r: number | [number, number], color: Fill) =>
    b.rod(a, c, r, { color, bone: hull });

  // ---- Paints -------------------------------------------------------------
  const planks = paint((p) => {
    const row = p.y / 0.135;
    const f = row - Math.floor(row);
    if (f < 0.08) return WOOD_D;
    return Math.floor(row) % 2 ? WOOD_A : WOOD_B;
  });
  const floorWood = grain(WOOD_B, WOOD_D, { size: 0.12, axis: "x" });
  const canvas = patches(SEAM, [CANVAS_A, CANVAS_A, PATCH_G, CANVAS_B, PATCH_R, PATCH_T], {
    size: 1.2,
    gap: 0.015,
    seed: 7,
  });
  const envBody = countershade(canvas, BELLY, { level: -0.2, soft: 0.6 });
  const nose = stripes(HAZ_D, HAZ_Y, { size: 0.3, axis: "z" });
  const envPaint = paint((p) => (p.z > 4.45 ? nose : envBody));
  const finGrad = gradient(FIN_R, FIN_D, [0, CY + 1.5, -3.9], [0, CY - 1.2, -3.9]);
  const finPatch = patches(FIN_D, [CANVAS_A, FIN_R, CANVAS_B], { size: 0.45, gap: 0.03, seed: 3 });
  const propWood = grain("#b57c46", "#6e4623", { size: 0.06, axis: "y" });
  const skin = countershade(GOB, GOB_D, { level: -0.1 });
  const sackPaint = countershade("#b8a46a", "#7d6a3c", { level: 0 });
  const tankPaint = grain(TANK, TANK_D, { size: 0.08, axis: "y" });
  const barrelPaint = grain("#8a5a33", "#5a3619", { size: 0.07, axis: "y" });

  // ---- Envelope -----------------------------------------------------------
  const envPath = catmull([
    [0, CY, -5.5],
    [0, CY, -2.75],
    [0, CY, 0],
    [0, CY, 2.75],
    [0, CY, 5.5],
  ]);
  const envR = (t: number): [number, number] => {
    const r = Math.max(0.22, R * Math.sqrt(Math.sin(Math.PI * t)));
    return [r * 0.96, r];
  };
  const env = b.sweep(envPath, envR, { bone: hull, sides: 14, color: envPaint, name: "envelope" });
  const envSurf = b.surface(env);

  // Stitched gore seams running the length of the envelope.
  for (const deg of [0, 45, 90, 135, 180, 225, 270, 315]) {
    b.sweep(env.line(deg, 0.012), 0.016, { bone: hull, sides: 6, color: SEAM });
  }
  // A tattered pennant flying from a pole on the envelope's crown.
  rod([0, CY + 2.1, -0.5], [0, CY + 2.9, -0.5], 0.025, IRON);
  b.extrude(
    [
      [0, 0],
      [1.0, -0.06],
      [0.88, 0.18],
      [1.0, 0.42],
      [0, 0.36],
    ],
    { at: [0, CY + 2.45, -0.5], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.03, color: finPatch, bone: hull, name: "pennant" },
  );
  // Rope hoops for the netting.
  for (const z of [-2.6, -0.6, 1.4, 3.4]) {
    const loop = envSurf.loop([0, CY, z], { dir: [0, 0, 1], lift: 0.025 });
    b.sweep(loop, 0.03, { bone: hull, sides: 6, color: ROPE });
  }
  // Rivets along four seams.
  for (const deg of [45, 135, 225, 315]) {
    const seam = env.line(deg, 0.01);
    for (let i = 1; i < 12; i++) {
      b.stick(new THREE.SphereGeometry(0.035, 6, 4), RIVET, envSurf.nearest(seam.at(i / 12)), {
        embed: 0.35,
        bone: hull,
      });
    }
  }
  // Hand-painted name banners on both flanks.
  const banner = svg(
    `<svg viewBox="0 0 480 120" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="12" width="472" height="96" rx="16" fill="#3a2412"/>
      <rect x="16" y="22" width="448" height="76" rx="9" fill="#e8cf86"/>
      <text x="240" y="82" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" font-size="68" font-weight="900" fill="#c9341f" stroke="#3a2412" stroke-width="6" paint-order="stroke" letter-spacing="3">RATTLETRAP</text>
    </svg>`,
    { size: 1024 },
  );
  b.decal(env, banner, {
    at: envSurf.nearest([2.1, CY + 0.15, 0.9]),
    dir: [1, 0, 0],
    size: [3.0, 0.75],
    lift: 0.012,
  });
  b.decal(env, banner, {
    at: envSurf.nearest([-2.1, CY + 0.15, 0.9]),
    dir: [-1, 0, 0],
    size: [3.0, 0.75],
    lift: 0.012,
  });

  // ---- Tail fins ----------------------------------------------------------
  const vFin = b.extrude(
    [
      [0.5, -1.4],
      [-1.0, -1.1],
      [-0.9, 1.2],
      [0.2, 1.75],
    ],
    { at: [0, CY, -3.9], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.12, bevel: 0.03, smoothing: 1, color: finGrad, bone: hull, name: "finTop" },
  );
  // Rivet heads on the fin's front face.
  for (const [u, v] of [
    [-0.25, -0.9],
    [-0.3, -0.1],
    [-0.2, 0.6],
    [-0.5, -0.6],
    [-0.5, 0.3],
  ] as [number, number][]) {
    const q = vFin.local([u, v, 0.07]);
    put(new THREE.SphereGeometry(0.03, 6, 4).translate(q.x, q.y, q.z), RIVET, "fin.rivet");
  }
  // The rudder is a separate flap hinged on the fin's trailing edge.
  const rudder = b.joint("rudder", { parent: hull, at: [0, CY + 0.35, -4.9], dir: [0, 1, 0], role: "hinge" });
  b.extrude(
    [
      [0, -1.2],
      [0, 1.2],
      [0.8, 1.0],
      [0.95, -0.9],
    ],
    { at: [0, CY + 0.35, -4.9], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.08, bevel: 0.02, color: FIN_D, bone: rudder, name: "rudder" },
  );
  b.extrude(
    [
      [0.5, -1.6],
      [-1.0, -1.3],
      [-0.8, 0],
      [-1.0, 1.3],
      [0.5, 1.6],
      [0, 0],
    ],
    { at: [0, CY - 0.02, -3.9], x: [0, 0, 1], y: [1, 0, 0], thickness: 0.1, bevel: 0.02, smoothing: 0, color: finPatch, bone: hull, name: "finSide" },
  );
  // Ventral stub: a spare fin bolted on under the tail.
  b.extrude(
    [
      [0.4, 0.5],
      [-0.7, 0.4],
      [-0.6, -0.9],
      [0.1, -0.8],
    ],
    { at: [0, CY - 1.5, -3.9], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.08, bevel: 0.02, color: finPatch, bone: hull, name: "finVentral" },
  );

  // ---- Gondola basket -----------------------------------------------------
  const FLOOR_Y = 3.04;
  put(box(1.44, 0.1, 4.11, 0, 2.99, -0.195), floorWood, "basket.floor");
  put(box(0.14, 0.12, 4.3, 0.5, 2.86, -0.195), WOOD_D, "runner.L");
  put(box(0.14, 0.12, 4.3, -0.5, 2.86, -0.195), WOOD_D, "runner.R");
  put(box(0.08, 1.02, 4.11, 0.72, 3.55, -0.195), planks, "basket.wallL");
  put(box(0.08, 1.02, 4.11, -0.72, 3.55, -0.195), planks, "basket.wallR");
  put(box(1.52, 1.02, 0.08, 0, 3.55, -2.25), planks, "basket.back");
  put(box(1.52, 1.02, 0.08, 0, 3.55, 1.86), planks, "basket.front");
  // Cap boards along the top of both side walls.
  for (const s of [1, -1]) {
    put(box(0.02, 0.08, 4.0, s * 0.765, 4.0, -0.195), WOOD_D, "trim");
  }
  // Front window with a dark glass pane and an iron frame.
  put(box(0.56, 0.46, 0.03, 0, 3.62, 1.875), WINDOW, "window");
  put(box(0.64, 0.05, 0.05, 0, 3.87, 1.88), IRON, "window.top");
  put(box(0.64, 0.05, 0.05, 0, 3.37, 1.88), IRON, "window.bottom");
  put(box(0.05, 0.5, 0.05, -0.3, 3.62, 1.88), IRON, "window.L");
  put(box(0.05, 0.5, 0.05, 0.3, 3.62, 1.88), IRON, "window.R");
  // Bolted patch plates on the outside walls.
  for (const [x, y, z] of [
    [0.765, 3.3, 0.5],
    [0.765, 3.75, -1.2],
    [-0.765, 3.4, -0.9],
  ] as Vec[]) {
    put(box(0.02, 0.22, 0.32, x, y, z), IRON, "patch");
  }

  // Iron rails, corner posts and corner brackets.
  const ring: [number, number][] = [
    [0.72, -2.25],
    [-0.72, -2.25],
    [-0.72, 1.86],
    [0.72, 1.86],
  ];
  for (const y of [3.3, 4.09]) {
    for (let i = 0; i < 4; i++) {
      const [x0, z0] = ring[i];
      const [x1, z1] = ring[(i + 1) % 4];
      rod([x0, y, z0], [x1, y, z1], 0.03, IRON_L);
    }
  }
  for (const [x, z] of ring) {
    rod([x, 2.94, z], [x, 4.12, z], 0.05, IRON);
    put(box(0.14, 0.04, 0.14, x, 2.94, z), IRON, "bracket");
    put(box(0.14, 0.04, 0.14, x, 4.07, z), IRON, "bracket");
  }
  // Rivets along the top rail.
  for (let i = 0; i < 4; i++) {
    const [x0, z0] = ring[i];
    const [x1, z1] = ring[(i + 1) % 4];
    for (let k = 1; k < 6; k++) {
      const t = k / 6;
      put(new THREE.SphereGeometry(0.03, 6, 4).translate(x0 + (x1 - x0) * t, 4.09, z0 + (z1 - z0) * t), RIVET, "rivet");
    }
  }

  // Brew tank with a glowing sight tube and iron hoops.
  const tankAt: Vec = [0, FLOOR_Y, -1.1];
  b.lathe(
    [
      [0, 0],
      [0.36, 0],
      [0.4, 0.06],
      [0.41, 0.8],
      [0.37, 0.9],
      [0.2, 0.94],
      [0, 0.94],
    ],
    { at: tankAt, bone: hull, smoothing: 1, color: tankPaint, name: "brewTank" },
  );
  for (const y of [3.2, 3.76]) {
    const pts: Vec[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      pts.push([Math.cos(a) * 0.42, y, -1.1 + Math.sin(a) * 0.42]);
    }
    b.sweep(catmull(pts, { closed: true }), 0.024, { bone: hull, sides: 6, color: IRON });
  }
  glow(put(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 8).translate(0, 3.55, -0.7), GLOW_G, "brewTube"), 1.4);
  put(box(0.16, 0.06, 0.07, 0, 3.25, -0.7), IRON, "brewTube.clampB");
  put(box(0.16, 0.06, 0.07, 0, 3.85, -0.7), IRON, "brewTube.clampT");
  // Brass exhaust pipe bent out through the basket wall.
  b.sweep(
    catmull([
      [0.36, 3.5, -1.1],
      [0.72, 3.5, -1.1],
      [0.98, 3.65, -1.1],
      [1.05, 4.2, -1.1],
    ]),
    0.035,
    { bone: hull, sides: 6, color: BRASS, name: "exhaust" },
  );

  // Lantern hanging from the back rail.
  rod([0, 4.09, -2.2], [0, 3.86, -1.95], 0.018, IRON);
  glow(put(box(0.18, 0.22, 0.18, 0, 3.74, -1.9), GLOW_W, "lantern"), 1.2);
  put(box(0.22, 0.04, 0.22, 0, 3.86, -1.9), IRON, "lantern.cap");

  // Crates and barrels on the floor.
  put(box(0.5, 0.4, 0.5, -0.42, FLOOR_Y + 0.2, 0.5), planks, "crate1");
  put(box(0.44, 0.36, 0.44, -0.4, FLOOR_Y + 0.58, 0.52), planks, "crate2");
  put(box(0.4, 0.28, 0.42, 0.4, FLOOR_Y + 0.14, 0.8), planks, "crate3");
  for (const [x, z] of [
    [0.44, -1.9],
    [-0.44, -1.9],
  ] as [number, number][]) {
    b.lathe(
      [
        [0, 0],
        [0.2, 0],
        [0.24, 0.04],
        [0.26, 0.4],
        [0.24, 0.76],
        [0.2, 0.8],
        [0, 0.8],
      ],
      { at: [x, FLOOR_Y, z], bone: hull, smoothing: 1, color: barrelPaint, name: "barrel" },
    );
    for (const y of [0.1, 0.7]) {
      const pts: Vec[] = [];
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        pts.push([x + Math.cos(a) * 0.255, FLOOR_Y + y, z + Math.sin(a) * 0.255]);
      }
      b.sweep(catmull(pts, { closed: true }), 0.018, { bone: hull, sides: 5, color: IRON });
    }
  }
  // Sacks by the crates.
  for (const [x, y, z, r] of [
    [0.45, FLOOR_Y + 0.13, 0.12, 0.2],
    [0.2, FLOOR_Y + 0.12, 0.16, 0.18],
  ] as [number, number, number, number][]) {
    put(new THREE.SphereGeometry(r, 10, 7).scale(1.2, 0.85, 1.0).translate(x, y, z), sackPaint, "sack");
  }
  // Coiled rope on the floor.
  put(new THREE.TorusGeometry(0.12, 0.035, 6, 12).rotateX(Math.PI / 2).translate(0.1, FLOOR_Y + 0.05, 1.45), HEMP, "ropeCoil");

  // Steering wheel: its own hinge, spun about the bone (model Z).
  const wheelJ = b.joint("wheel", { parent: hull, at: [0, 3.55, 1.2], dir: [0, 0, 1], role: "hinge" });
  b.part(
    merge([
      new THREE.TorusGeometry(0.24, 0.024, 6, 18).translate(0, 3.55, 1.2),
      new THREE.CylinderGeometry(0.05, 0.05, 0.05, 6).rotateX(Math.PI / 2).translate(0, 3.55, 1.2),
      new THREE.BoxGeometry(0.46, 0.03, 0.03).translate(0, 3.55, 1.2),
      new THREE.BoxGeometry(0.46, 0.03, 0.03).rotateZ(Math.PI / 3).translate(0, 3.55, 1.2),
      new THREE.BoxGeometry(0.46, 0.03, 0.03).rotateZ(-Math.PI / 3).translate(0, 3.55, 1.2),
    ]),
    WOOD_B,
    { bone: wheelJ, at: [0, 0, 0], name: "steeringWheel" },
  );
  rod([0, FLOOR_Y, 1.2], [0, 3.52, 1.2], 0.03, IRON);

  // Suspension struts from the basket to the envelope.
  for (const s of [1, -1]) {
    rod([s * 0.6, 4.07, -1.6], [s * 0.5, 4.6, -1.6], 0.035, IRON);
    rod([s * 0.6, 4.07, 1.2], [s * 0.5, 4.6, 1.2], 0.035, IRON);
  }

  // Goblin pilot poking his head out of the nose window.
  const HEAD: Vec = [0, 3.72, 2.0];
  put(new THREE.SphereGeometry(0.27, 12, 9).scale(1, 0.95, 0.95).translate(...HEAD), skin, "pilot.head");
  const EAR: [number, number][] = [
    [0, -0.09],
    [0.3, -0.15],
    [0.42, 0.02],
    [0.28, 0.15],
    [0, 0.09],
  ];
  for (const s of [1, -1]) {
    b.extrude(EAR, {
      at: [s * 0.23, 3.78, 1.96],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.04,
      bevel: 0.012,
      smoothing: 1,
      color: skin,
      bone: hull,
      name: "pilot.ear",
    });
    put(new THREE.SphereGeometry(0.065, 8, 6).translate(s * 0.1, 3.78, 2.22), EYE, "pilot.eye");
    put(new THREE.SphereGeometry(0.03, 6, 4).translate(s * 0.1, 3.78, 2.28), PUPIL, "pilot.pupil");
    put(new THREE.BoxGeometry(0.13, 0.04, 0.05).rotateZ(s * 0.3).translate(s * 0.1, 3.88, 2.2), DARK, "pilot.brow");
    put(new THREE.ConeGeometry(0.024, 0.05, 4).rotateZ(Math.PI).translate(s * 0.045, 3.6, 2.23), TOOTH, "pilot.tooth");
  }
  put(new THREE.ConeGeometry(0.065, 0.2, 6).rotateX(Math.PI / 2).translate(0, 3.66, 2.3), skin, "pilot.nose");
  put(box(0.18, 0.04, 0.04, 0, 3.56, 2.23), MOUTH, "pilot.mouth");
  b.lathe(
    [
      [0, 0],
      [0.27, 0],
      [0.25, 0.06],
      [0.16, 0.17],
      [0.06, 0.25],
      [0, 0.26],
    ],
    { at: [0, 3.86, 2.0], bone: hull, smoothing: 1, color: CAP, name: "pilot.cap" },
  );
  b.spike([0, 4.1, 2.0], [0.3, 1, -0.1], 0.4, 0.035, { color: FIN_R, bone: hull });

  // ---- Propellers: pusher props on pylons behind the basket --------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hub: Vec = [s * 0.85, 3.45, -2.78];
    const prop = b.joint(`prop${side}`, { parent: hull, at: hub, dir: [0, 0, 1], role: "hinge" });
    const blades = [0, 1, 2].map((k) => {
      const len = k === 2 ? 0.44 : 0.62; // the third blade was patched from a shorter one
      return new THREE.BoxGeometry(0.2, len, 0.05)
        .translate(0, len / 2 + 0.06, 0)
        .rotateZ((k * 2 * Math.PI) / 3 + 0.3)
        .translate(hub[0], hub[1], hub[2]);
    });
    b.part(merge(blades), propWood, { bone: prop, at: [0, 0, 0], name: `prop${side}.blades` });
    b.part(new THREE.TorusGeometry(0.66, 0.022, 5, 18).translate(hub[0], hub[1], hub[2]), IRON, {
      bone: prop,
      at: [0, 0, 0],
      name: `prop${side}.guard`,
    });
    b.lathe(
      [
        [0, 0],
        [0.17, 0],
        [0.17, 0.04],
        [0.1, 0.14],
        [0, 0.2],
      ],
      { at: hub, axis: [0, 0, -1], bone: prop, smoothing: 1, color: BRASS, name: `prop${side}.spinner` },
    );
    rod([s * 0.85, 3.45, -2.2], [s * 0.85, 3.45, -2.7], 0.05, IRON);
  }

  // Rope ladder from the basket's front edge down to the grass.
  const ladderRails: [Vec, Vec][] = [
    [
      [0.3, 2.94, 1.95],
      [0.34, 0.05, 2.7],
    ],
    [
      [-0.3, 2.94, 1.95],
      [-0.34, 0.05, 2.7],
    ],
  ];
  for (const [a, c] of ladderRails) rod(a, c, 0.018, HEMP);
  const rungs: THREE.BufferGeometry[] = [];
  for (let k = 1; k <= 7; k++) {
    const t = k / 8;
    const y = 2.94 + (0.05 - 2.94) * t;
    const z = 1.95 + (2.7 - 1.95) * t;
    rungs.push(new THREE.CylinderGeometry(0.014, 0.014, 0.64, 5).rotateZ(Math.PI / 2).translate(0, y, z));
  }
  put(merge(rungs), WOOD_B, "ladder.rungs");

  // ---- Mooring: sagging ropes to sandbagged stakes -----------------------
  const moor: { a: Vec; c: Vec; sag: number }[] = [
    { a: [0.72, 2.94, 1.86], c: [3.4, 0.9, 2.4], sag: 0.45 },
    { a: [-0.72, 2.94, 1.86], c: [-3.2, 0.9, 3.0], sag: 0.45 },
    { a: [0.72, 2.94, -2.25], c: [3.6, 0.9, -3.4], sag: 0.45 },
    { a: [-0.72, 2.94, -2.25], c: [-3.5, 0.9, -2.9], sag: 0.45 },
    { a: [0, 5.6, 4.9], c: [0.3, 0.9, 7.8], sag: 0.9 },
  ];
  for (const { a, c, sag } of moor) {
    const m: Vec = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2 - sag, (a[2] + c[2]) / 2];
    b.sweep(catmull([a, m, c]), 0.024, { bone: hull, sides: 6, color: HEMP, name: "mooringRope" });
    rod([c[0], 0, c[2]], [c[0], c[1], c[2]], [0.07, 0.045], WOOD_D);
    put(
      merge([
        new THREE.SphereGeometry(0.28, 10, 7).scale(1.25, 0.42, 0.95).translate(c[0] - 0.12, 0.12, c[2] + 0.1),
        new THREE.SphereGeometry(0.28, 10, 7).scale(1.25, 0.42, 0.95).translate(c[0] + 0.18, 0.12, c[2] - 0.06),
      ]),
      sackPaint,
      "sandbags",
    );
  }
  // A lantern hung on the nose stake.
  glow(put(box(0.14, 0.18, 0.14, 0.3, 1.05, 7.8), GLOW_W, "stakeLantern"), 1.2);

  // A lost cart wheel lying in the grass.
  put(
    merge([
      new THREE.TorusGeometry(0.55, 0.05, 6, 16).rotateX(Math.PI / 2).translate(-3.0, 0.05, 5.0),
      ...[0, 1, 2, 3].map((k) =>
        new THREE.BoxGeometry(1.0, 0.03, 0.03).rotateY((k * Math.PI) / 4).translate(-3.0, 0.05, 5.0),
      ),
    ]),
    WOOD_B,
    "cartWheel",
  );

  return b.root;
}
