import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "A chubby, cheerful open-cockpit biplane with a round red cowl, striped wings, big squishy wheels, a goggled pilot with a flying scarf and a teddy-bear passenger.",
  style: "whimsical",
  commit: "88fc1f0",
};

const RED = "#e8433a";
const CREAM = "#fff1cf";
const TEAL = "#2bb3b1";
const YELLOW = "#ffc93c";
const WOOD = "#b7773c";
const DARKWOOD = "#6b4226";
const METAL = "#9aa5b1";
const TIRE = "#3a2f3f";
const GLASS = "#bff0ff";
const LEATHER = "#8a5a33";
const SKIN = "#ffcfa3";

const RED_C = cel(RED);
const CREAM_C = cel(CREAM, "#ecd3a8");
const TEAL_C = cel(TEAL);
const YELLOW_C = cel(YELLOW);
const WOOD_C = cel(WOOD);

const O = (a: Array<[number, number]>): OutlinePoint[] => a;
const mirrored = (a: Array<[number, number]>, s: number): Array<[number, number]> =>
  s > 0 ? a : a.map(([x, y]): [number, number] => [x * s, y]).reverse();

export default function build() {
  const b = createBuilder({ name: "barnstormerBiplane" });

  // ---------------------------------------------------------------- skeleton
  const body = b.joint("body", { at: [0, 1.35, 0] });
  const prop = b.joint("prop", { parent: body, at: [0, 1.35, 1.82], dir: [0, 0, 1], role: "hinge" });
  const rudder = b.joint("rudder", { parent: body, at: [0, 1.55, -3.05], dir: [0, 1, 0], role: "hinge" });
  const elevator = b.joint("elevator", { parent: body, at: [0, 1.52, -2.95], dir: [1, 0, 0], role: "hinge" });
  const tailWheel = b.joint("tailWheel", { parent: body, at: [0, 0.12, -3.2], dir: [1, 0, 0], role: "hinge" });
  const wheels: Record<number, ReturnType<typeof b.joint>> = {};
  const ailerons: Record<number, ReturnType<typeof b.joint>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    wheels[s] = b.joint(`wheel${side}`, {
      parent: body,
      at: [s * 0.85, 0.52, 0.55],
      dir: [s, 0, 0],
      role: "hinge",
    });
    ailerons[s] = b.joint(`aileron${side}`, {
      parent: body,
      at: [s * 2.8, 2.5, 0.2],
      dir: [s, 0, 0],
      role: "hinge",
    });
  }

  // ---------------------------------------------------------------- fuselage
  const fusPaint = paint((p, n) => {
    const edge = 1.22 + Math.max(0, -p.z) * 0.12 + 0.05 * zigzag(p.z / 0.16);
    if (Math.abs(p.y - edge) < 0.011 && p.z < 1.0) return INK;
    if (p.z < -2.55) return YELLOW_C;
    if (p.z > 0.62 && p.z < 0.78) return TEAL_C;
    if (p.z > 0.78 && p.z < 0.84) return YELLOW_C;
    if (Math.abs(((p.z + 0.35) % 0.7)) < 0.01 && n.y > -2) return "#9c2b28";
    if (p.y < edge) return CREAM_C;
    return RED_C;
  });
  const stations = [
    { z: 1.05, y: 1.35, w: 0.95, h: 1.0 },
    { z: 0.4, y: 1.35, w: 1.0, h: 1.05 },
    { z: -0.4, y: 1.36, w: 0.95, h: 1.0 },
    { z: -1.1, y: 1.4, w: 0.75, h: 0.82 },
    { z: -2.0, y: 1.48, w: 0.45, h: 0.55 },
    { z: -2.7, y: 1.55, w: 0.22, h: 0.35 },
    { z: -3.15, y: 1.6, w: 0.1, h: 0.2 },
  ];
  const fus = b.loft(
    stations.map((st) => ({ at: [0, st.y, st.z], w: st.w, h: st.h })),
    { bone: body, color: fusPaint, sides: 10, name: "fuselage" },
  );

  // sun emblem on the flanks
  const SUN = svg(
    `<svg viewBox="0 0 100 100">
      ${Array.from({ length: 12 }, (_, i) => `<g transform="rotate(${i * 30} 50 50)"><path d="M50 3 L58 22 L42 22Z" fill="#ffc93c" stroke="#22112f" stroke-width="2"/></g>`).join("")}
      <circle cx="50" cy="50" r="28" fill="#ff9a3c" stroke="#22112f" stroke-width="3"/>
      <circle cx="40" cy="45" r="4" fill="#22112f"/><circle cx="60" cy="45" r="4" fill="#22112f"/>
      <circle cx="41.5" cy="43.5" r="1.4" fill="#ffffff"/><circle cx="61.5" cy="43.5" r="1.4" fill="#ffffff"/>
      <path d="M38 57 Q50 69 62 57" stroke="#22112f" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="33" cy="55" rx="5" ry="3" fill="#ff6a8a"/><ellipse cx="67" cy="55" rx="5" ry="3" fill="#ff6a8a"/>
    </svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    b.decal(fus, SUN, { at: [s * 0.3, 1.44, -1.6], dir: [s, 0, 0], size: [0.62, 0.62], bone: body, name: "sunEmblem" });

  // head-rest hump behind the pilot
  b.part(new THREE.SphereGeometry(0.5, 10, 7), RED_C, {
    bone: body,
    at: [0, 1.78, -1.55],
    scale: [0.3, 0.2, 0.6],
    name: "hump",
  });

  // ---------------------------------------------------------------- cowl, spinner, prop
  const cowlPaint = paint((p) => (p.z > 1.5 && p.z < 1.62 ? CREAM_C : RED_C));
  b.lathe(
    O([
      [0, 0],
      [0.52, 0],
      [0.6, 0.2],
      [0.6, 0.55],
      [0.52, 0.7],
      [0.3, 0.82],
      [0, 0.86],
    ]),
    { at: [0, 1.35, 0.95], axis: [0, 0, 1], segments: 14, color: cowlPaint, bone: body, name: "cowl" },
  );
  b.part(new THREE.TorusGeometry(0.58, 0.04, 5, 16), YELLOW, { bone: body, at: [0, 1.35, 1.2], name: "cowlBand" });
  b.part(new THREE.TorusGeometry(0.56, 0.035, 5, 16), METAL, { bone: body, at: [0, 1.35, 1.72], name: "cowlRing" });
  const rivets: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    rivets.push(new THREE.SphereGeometry(0.02, 5, 4).translate(Math.sin(a) * 0.605, 1.35 + Math.cos(a) * 0.605, 1.32));
    rivets.push(new THREE.SphereGeometry(0.02, 5, 4).translate(Math.sin(a) * 0.605, 1.35 + Math.cos(a) * 0.605, 1.45));
  }
  const rivetGeo = mergeGeometries(rivets);
  if (rivetGeo) b.part(rivetGeo, METAL, { bone: body, at: [0, 0, 0], name: "cowlRivets" });
  for (const s of [1, -1])
    for (let k = -1; k <= 1; k++)
      b.part(new THREE.BoxGeometry(0.04, 0.035, 0.26), "#3a2f3f", {
        bone: body,
        at: [s * 0.59, 1.35 + k * 0.08, 1.28],
        name: "louvre",
      });

  b.lathe(
    O([
      [0, 0],
      [0.19, 0],
      [0.19, 0.05],
      [0.14, 0.2],
      [0, 0.3],
    ]),
    { at: [0, 1.35, 1.8], axis: [0, 0, 1], segments: 10, color: YELLOW_C, bone: prop, name: "spinner" },
  );
  const bladePaint = paint((p) => (Math.abs(p.y - 1.35) > 0.82 ? YELLOW_C : WOOD_C));
  const blade = O([
    [-0.07, 0],
    [0.07, 0],
    [0.11, 0.5],
    [0.09, 1.05],
    [0, 1.13],
    [-0.09, 1.05],
    [-0.11, 0.5],
  ]);
  for (const s of [1, -1])
    b.extrude(blade, {
      at: prop.at,
      x: [1, 0, 0],
      y: [0, s, 0],
      thickness: 0.045,
      bevel: 0.012,
      color: bladePaint,
      bone: prop,
      name: "propBlade",
    });

  // exhaust pipes
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.5, 1.15, 1.3],
        [s * 0.7, 1.05, 1.1],
        [s * 0.72, 1.02, 0.55],
        [s * 0.7, 1.0, 0.2],
      ]),
      0.045,
      { color: METAL, bone: body, sides: 6, name: "exhaust" },
    );
    b.part(new THREE.SphereGeometry(0.035, 6, 4), "#2a2230", { bone: body, at: [s * 0.7, 1.0, 0.18], name: "exhaustTip" });
  }

  // ---------------------------------------------------------------- wings
  const wingPaint = (lead: number, topC: Paint, tipX: number) =>
    paint((p, n) => {
      const ax = Math.abs(p.x);
      if (Math.abs(n.y) < 0.4) return CREAM_C;
      if (n.y < 0) return ax % 0.55 < 0.02 ? "#e0c28f" : CREAM_C;
      if (ax > tipX) return YELLOW_C;
      if (p.z > lead - 0.2) return CREAM_C;
      if (ax % 0.55 < 0.02) return "#b92d2d";
      return topC;
    });

  const upperY = 2.5;
  const upperZ = 0.5;
  b.extrude(
    O([
      [-4.1, -0.3],
      [4.1, -0.3],
      [4.18, -0.05],
      [4.2, 0.3],
      [4.05, 0.65],
      [3.6, 0.78],
      [0, 0.8],
      [-3.6, 0.78],
      [-4.05, 0.65],
      [-4.2, 0.3],
      [-4.18, -0.05],
    ]),
    {
      at: [0, upperY, upperZ],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.14,
      bevel: 0.05,
      color: wingPaint(upperZ + 0.8, RED_C, 3.85),
      bone: body,
      name: "upperWing",
    },
  );
  const lowerY = 1.0;
  const lowerZ = 0.3;
  b.extrude(
    O([
      [-3.4, -0.55],
      [3.4, -0.55],
      [3.58, -0.3],
      [3.6, 0.15],
      [3.45, 0.5],
      [3.0, 0.6],
      [0, 0.62],
      [-3.0, 0.6],
      [-3.45, 0.5],
      [-3.6, 0.15],
      [-3.58, -0.3],
    ]),
    {
      at: [0, lowerY, lowerZ],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.12,
      bevel: 0.045,
      color: wingPaint(lowerZ + 0.62, TEAL_C, 3.2),
      bone: body,
      name: "lowerWing",
    },
  );
  for (const s of [1, -1]) {
    b.extrude(
      O(
        mirrored(
          [
            [1.6, -0.6],
            [3.9, -0.6],
            [4.12, -0.5],
            [4.15, -0.3],
            [1.6, -0.3],
          ],
          s,
        ),
      ),
      {
        at: [0, upperY, upperZ],
        x: [1, 0, 0],
        y: [0, 0, 1],
        thickness: 0.1,
        bevel: 0.035,
        color: TEAL_C,
        bone: ailerons[s],
        name: "aileron",
      },
    );
  }

  // roundel decals
  const ROUNDEL = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="#22112f"/><circle cx="50" cy="50" r="44" fill="#ffc93c"/>
      <circle cx="50" cy="50" r="33" fill="#2bb3b1"/>
      <polygon points="50,20 58,41 81,41 63,55 70,78 50,64 30,78 37,55 19,41 42,41" fill="#fff1cf" stroke="#22112f" stroke-width="2.5" stroke-linejoin="round"/>
    </svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.95, 0.95), "#ffffff", {
      bone: body,
      at: [s * 2.4, upperY + 0.075, 1.0],
      dir: [0, 1, 0],
      axis: "z",
      texture: ROUNDEL,
      name: "roundelTop",
    });
    b.part(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", {
      bone: body,
      at: [s * 2.3, lowerY - 0.065, 0.5],
      dir: [0, -1, 0],
      axis: "z",
      texture: ROUNDEL,
      name: "roundelBottom",
    });
  }

  // wing-tip lights, landing lights
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.SphereGeometry(0.06, 6, 5), s > 0 ? "#ff5252" : "#52ff7a", {
        bone: body,
        at: [s * 4.12, upperY, 0.7],
        name: "navLight",
      }),
      1.5,
    );
    glow(
      b.part(new THREE.SphereGeometry(0.07, 6, 5), "#fff3a0", {
        bone: body,
        at: [s * 1.2, lowerY, lowerZ + 0.62],
        name: "landingLight",
      }),
      1.4,
    );
  }

  // struts and wires
  const fittings: THREE.BufferGeometry[] = [];
  const fit = (p: number[]) => fittings.push(new THREE.SphereGeometry(0.045, 5, 4).translate(p[0], p[1], p[2]));
  for (const s of [1, -1]) {
    const lines: Array<[number[], number[]]> = [
      [[s * 2.6, 1.04, 0.65], [s * 2.6, 2.44, 0.95]],
      [[s * 2.6, 1.04, 0.0], [s * 2.6, 2.44, 0.28]],
      [[s * 0.35, 1.8, 0.9], [s * 0.75, 2.44, 0.95]],
      [[s * 0.35, 1.85, 0.0], [s * 0.75, 2.44, 0.3]],
    ];
    for (const [a, c] of lines) {
      b.rod(a, c, 0.04, WOOD, { bone: body, sides: 6, name: "strut" });
      fit(a);
      fit(c);
    }
    // cross wires
    b.rod([s * 0.9, 1.06, 0.65], [s * 2.6, 2.44, 0.95], 0.01, "#2a2230", { bone: body, sides: 4, name: "wire" });
    b.rod([s * 2.6, 1.06, 0.65], [s * 0.9, 2.44, 0.95], 0.01, "#2a2230", { bone: body, sides: 4, name: "wire" });
    // flag pole and pennant
    b.rod([s * 3.6, 2.56, 0.9], [s * 3.6, 3.0, 0.9], 0.015, METAL, { bone: body, sides: 5, name: "flagPole" });
    b.extrude(
      O([
        [0, 0],
        [0.55, 0.05],
        [0, 0.22],
      ]),
      {
        at: [s * 3.6, 2.78, 0.9],
        x: [0, 0, -1],
        thickness: 0.012,
        color: s > 0 ? RED_C : YELLOW_C,
        bone: body,
        name: "pennant",
      },
    );
  }
  const fitGeo = mergeGeometries(fittings);
  if (fitGeo) b.part(fitGeo, METAL, { bone: body, at: [0, 0, 0], name: "strutFittings" });
  // pitot tube
  b.rod([-2.6, 1.7, 0.95], [-2.6, 1.7, 1.4], 0.012, METAL, { bone: body, sides: 5, name: "pitot" });

  // ---------------------------------------------------------------- tail
  b.extrude(
    O([
      [0, -0.1],
      [0.6, -0.1],
      [0.6, 0.95],
      [0.4, 1.02],
      [0.05, 0.55],
    ]),
    {
      at: [0, 1.5, -2.45],
      x: [0, 0, -1],
      thickness: 0.07,
      bevel: 0.02,
      color: TEAL_C,
      bone: body,
      name: "fin",
    },
  );
  const rudderPaint = paint((p) => (p.y < 1.9 ? RED_C : p.y < 2.2 ? CREAM_C : TEAL_C));
  b.extrude(
    O([
      [0, -0.1],
      [0.62, -0.1],
      [0.7, 0.35],
      [0.55, 0.8],
      [0.2, 1.0],
      [0, 0.98],
    ]),
    {
      at: [0, 1.55, -3.05],
      x: [0, 0, -1],
      thickness: 0.06,
      bevel: 0.02,
      color: rudderPaint,
      bone: rudder,
      name: "rudder",
    },
  );
  const stabPaint = paint((p) => (Math.abs(p.x) > 1.0 ? TEAL_C : CREAM_C));
  b.extrude(
    O([
      [-1.0, -0.45],
      [1.0, -0.45],
      [1.3, -0.3],
      [1.35, -0.05],
      [1.2, 0.1],
      [0.5, 0.2],
      [-0.5, 0.2],
      [-1.2, 0.1],
      [-1.35, -0.05],
      [-1.3, -0.3],
    ]),
    {
      at: [0, 1.52, -2.5],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.07,
      bevel: 0.025,
      color: stabPaint,
      bone: body,
      name: "stabilizer",
    },
  );
  b.extrude(
    O([
      [-1.05, -0.85],
      [1.05, -0.85],
      [1.3, -0.78],
      [1.3, -0.5],
      [1.05, -0.45],
      [-1.05, -0.45],
      [-1.3, -0.5],
      [-1.3, -0.78],
    ]),
    {
      at: [0, 1.52, -2.5],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.06,
      bevel: 0.02,
      color: RED_C,
      bone: elevator,
      name: "elevatorSurface",
    },
  );
  for (const s of [1, -1]) {
    b.rod([s * 0.9, 1.5, -2.75], [s * 0.15, 1.1, -2.15], 0.025, WOOD, { bone: body, sides: 5, name: "stabStrut" });
    b.rod([s * 1.1, 1.52, -2.8], [0, 2.3, -2.7], 0.01, "#2a2230", { bone: body, sides: 4, name: "tailWire" });
  }

  // tail skid and wheel
  b.rod([0, 1.45, -2.85], [0, 0.2, -3.18], 0.035, DARKWOOD, { bone: body, sides: 6, name: "tailStrut" });
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 10), TIRE, {
    bone: tailWheel,
    at: tailWheel.at,
    dir: [1, 0, 0],
    name: "tailTire",
  });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8), YELLOW, {
    bone: tailWheel,
    at: tailWheel.at,
    dir: [1, 0, 0],
    name: "tailHub",
  });

  // ---------------------------------------------------------------- landing gear
  const HUB = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="#fff1cf" stroke="#22112f" stroke-width="3"/>
      <circle cx="50" cy="50" r="36" fill="#e8433a"/>
      ${Array.from({ length: 6 }, (_, i) => `<line x1="50" y1="50" x2="50" y2="14" stroke="#fff1cf" stroke-width="5" transform="rotate(${i * 60} 50 50)"/>`).join("")}
      <circle cx="50" cy="50" r="10" fill="#9aa5b1" stroke="#22112f" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );
  b.rod([-0.85, 0.52, 0.55], [0.85, 0.52, 0.55], 0.04, METAL, { bone: body, sides: 6, name: "axle" });
  for (const s of [1, -1]) {
    const w = wheels[s];
    b.part(new THREE.TorusGeometry(0.4, 0.14, 8, 14), TIRE, {
      bone: w,
      at: w.at,
      dir: [1, 0, 0],
      axis: "z",
      name: "tire",
    });
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.26, 10), CREAM, { bone: w, at: w.at, dir: [1, 0, 0], name: "hub" });
    b.part(new THREE.PlaneGeometry(0.52, 0.52), "#ffffff", {
      bone: w,
      at: [s * (0.85 + 0.135), 0.52, 0.55],
      dir: [s, 0, 0],
      axis: "z",
      texture: HUB,
      name: "hubFace",
    });
    for (const zo of [0.55, 0.0]) {
      b.rod([s * 0.3, 1.05, zo + 0.2], [s * 0.85, 0.56, 0.55], 0.045, WOOD, { bone: body, sides: 6, name: "gearStrut" });
    }
    b.part(new THREE.SphereGeometry(0.055, 6, 5), METAL, {
      bone: body,
      at: [s * 0.85, 0.56, 0.55],
      name: "gearKnuckle",
    });
  }

  // ---------------------------------------------------------------- cockpits
  const cockpit = (z: number) => {
    b.part(new THREE.SphereGeometry(1, 10, 6), "#2a2230", {
      bone: body,
      at: [0, 1.84, z],
      scale: [0.25, 0.06, 0.34],
      name: "cockpitHole",
    });
    b.part(new THREE.TorusGeometry(0.27, 0.035, 5, 14), CREAM, {
      bone: body,
      at: [0, 1.86, z],
      rotation: [90, 0, 0],
      scale: [0.9, 1.2, 1],
      name: "coaming",
    });
    // windscreen
    b.part(new THREE.BoxGeometry(0.42, 0.2, 0.02), GLASS, {
      bone: body,
      at: [0, 1.99, z + 0.4],
      rotation: [-25, 0, 0],
      name: "windscreen",
    });
    b.part(new THREE.BoxGeometry(0.46, 0.035, 0.045), METAL, {
      bone: body,
      at: [0, 1.9, z + 0.37],
      name: "screenFrame",
    });
  };
  cockpit(-0.9);
  cockpit(-0.05);

  // pilot
  const H: [number, number, number] = [0, 2.05, -0.88];
  const hp = (x: number, y: number, z: number): [number, number, number] => [H[0] + x, H[1] + y, H[2] + z];
  b.part(new THREE.SphereGeometry(1, 8, 6), LEATHER, { bone: body, at: [0, 1.76, -0.92], scale: [0.27, 0.24, 0.22], name: "pilotTorso" });
  b.part(new THREE.SphereGeometry(0.17, 10, 8), SKIN, { bone: body, at: H, name: "pilotHead" });
  b.part(new THREE.SphereGeometry(0.19, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), DARKWOOD, {
    bone: body,
    at: hp(0, 0.015, -0.005),
    name: "pilotCap",
  });
  b.part(new THREE.TorusGeometry(0.178, 0.016, 5, 12), LEATHER, { bone: body, at: hp(0, 0.04, 0), rotation: [90, 0, 0], name: "goggleStrap" });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), "#ff9a8a", { bone: body, at: hp(0, -0.01, 0.17), name: "pilotNose" });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.035, 8), METAL, { bone: body, at: hp(s * 0.075, 0.05, 0.148), dir: [0, 0, 1], name: "gogglesRim" });
    b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 8), "#9ee7ff", { bone: body, at: hp(s * 0.075, 0.05, 0.158), dir: [0, 0, 1], name: "gogglesLens" });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), DARKWOOD, { bone: body, at: hp(s * 0.04, -0.05, 0.155), scale: [1.8, 0.7, 0.8], name: "moustache" });
    b.part(new THREE.SphereGeometry(0.028, 6, 4), "#ff8aa0", { bone: body, at: hp(s * 0.11, -0.03, 0.12), name: "pilotCheek" });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), DARKWOOD, { bone: body, at: hp(s * 0.17, -0.02, 0.0), scale: [0.5, 1.2, 1], name: "earFlap" });
    b.capsule([s * 0.2, 1.82, -0.9], [s * 0.04, 1.78, -0.58], 0.05, LEATHER, { bone: body, sides: 6, name: "pilotArm" });
  }
  b.rod([0, 1.5, -0.55], [0, 1.78, -0.57], 0.015, METAL, { bone: body, sides: 5, name: "stick" });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { bone: body, at: [0, 1.8, -0.57], name: "stickKnob" });
  b.part(new THREE.TorusGeometry(0.14, 0.05, 6, 10), CREAM, { bone: body, at: hp(0, -0.2, 0), rotation: [90, 0, 0], name: "pilotCollar" });
  const scarfPaint = paint((_p, _n, s) => (Math.floor(s[0] * 12) % 2 ? RED_C : YELLOW_C));
  b.sweep(
    catmull([
      hp(0, -0.17, -0.08),
      [0, 1.98, -1.4],
      [0.12, 2.1, -1.95],
      [-0.1, 2.04, -2.5],
      [0.1, 2.1, -3.0],
    ]),
    (t) => [0.09 * (1 - t * 0.3), 0.012],
    { section: "box", color: scarfPaint, bone: body, caps: "flat", name: "scarf" },
  );

  // teddy-bear passenger
  const T: [number, number, number] = [0, 2.08, -0.05];
  const tp = (x: number, y: number, z: number): [number, number, number] => [T[0] + x, T[1] + y, T[2] + z];
  const FUR = "#b9763a";
  b.part(new THREE.SphereGeometry(1, 8, 6), FUR, { bone: body, at: [0, 1.82, -0.05], scale: [0.22, 0.2, 0.2], name: "bearBody" });
  b.part(new THREE.SphereGeometry(0.15, 10, 8), FUR, { bone: body, at: T, name: "bearHead" });
  b.part(new THREE.SphereGeometry(0.07, 8, 6), "#f2d3a0", { bone: body, at: tp(0, -0.04, 0.12), scale: [1.1, 0.8, 1], name: "bearSnout" });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), INK, { bone: body, at: tp(0, -0.015, 0.19), name: "bearNose" });
  b.part(new THREE.BoxGeometry(0.1, 0.05, 0.03), RED, { bone: body, at: tp(0, -0.17, 0.1), name: "bowTie" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.06, 7, 5), FUR, { bone: body, at: tp(s * 0.11, 0.12, -0.02), name: "bearEar" });
    b.part(new THREE.SphereGeometry(0.035, 6, 4), "#f2d3a0", { bone: body, at: tp(s * 0.11, 0.12, 0.02), name: "bearEarIn" });
    b.part(new THREE.SphereGeometry(0.022, 6, 4), INK, { bone: body, at: tp(s * 0.05, 0.03, 0.13), name: "bearEye" });
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), YELLOW, { bone: body, at: tp(s * 0.05, 0.075, 0.115), dir: [0, 0.3, 1], name: "bearGoggle" });
  }

  return b.root;
}
