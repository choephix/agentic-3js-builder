import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Vanguard Jet Fighter",
  description:
    "A twin-tail, low-wing jet fighter on tricycle landing gear at real size (16 m long, 10.2 m span). Pearl hull over a graphite belly, one safety-orange accent on wing tips, fin caps, the side stripe, wheel hubs and nav lights. Hinged gear, flaps, rudders and canopy.",
  style: "Overwatch",
  commit: "b816db2",
};

// Crisp colour blocking: pearl hull, graphite underside, one orange accent.
const HULL = "#eef2f6";
const PANEL = "#bcc7d3";
const GRAPHITE = "#3a4150";
const DARK = "#15191f";
const ORANGE = "#ff7a1c";
const GLOW_ORANGE = "#ff9a3c";
const GLASS = "#13303d";
const GLASS_HI = "#3f7b9c";
const METAL = "#9aa6b4";
const TIRE = "#1b1d22";
const HUB = "#d4dbe3";
const NOZZLE = "#2c323c";

const hullPaint = paint((p, n) => {
  if (Math.abs(p.z - 6.9) < 0.012) return PANEL; // radome seam
  if (p.z > 6.9) return DARK; // dark radome
  if (p.y < 1.42) return GRAPHITE; // graphite belly
  if (Math.abs(p.y - 1.98) < 0.045 && Math.abs(n.x) > 0.35 && p.z > -6.2 && p.z < 6.3) return ORANGE; // side stripe
  if (Math.abs(p.z - 1.6 * Math.round(p.z / 1.6)) < 0.012) return PANEL; // frame seams
  return HULL;
});

const wingPaint = paint((_p, n, s) => {
  const [u, z] = s;
  if (n.y < -0.5) return GRAPHITE; // lower wing skin
  if (u > 4.55) return ORANGE; // wing-tip accent
  if (u > 0.5 && Math.abs(u - 1.2 * Math.round(u / 1.2)) < 0.012) return PANEL; // rib seams
  if (Math.abs(z + 1.0) < 0.012) return PANEL; // chord seam
  return HULL;
});

const finPaint = paint((_p, _n, s) => {
  const y = s[1];
  if (y > 1.85) return ORANGE; // fin cap
  if (Math.abs(y - 1.0) < 0.012) return PANEL; // fin seam
  return HULL;
});

const glassPaint = paint((p) => {
  if (Math.abs(p.x) < 0.03) return GRAPHITE; // centre frame bar
  const band = (((p.z * 0.9 + p.x * 0.5) % 1.8) + 1.8) % 1.8;
  return band < 0.5 ? GLASS_HI : GLASS; // long reflection streaks
});

const CHEVRON = svg(
  `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6 L76 30 L4 54 L4 42 L56 30 L4 18 Z" fill="${DARK}"/>
    <path d="M44 6 L116 30 L44 54 L44 42 L96 30 L44 18 Z" fill="${ORANGE}"/>
  </svg>`,
  { size: 256 },
);

/** Leading-edge height (z) of the wing at span u: a 2.3 m sweep over the 4.7 m panel. */
const leadingEdge = (u: number) => 1.9 - (u - 0.4) * (2.3 / 4.7);

export default function build() {
  const b = createBuilder({ name: "vanguard", paintSize: 2048 });

  const hull = b.joint("hull", { at: [0, 1.98, 0], role: "spine" });

  // Fuselage: one lofted body from the radome to the twin nozzles, deepest over the wing.
  const body = b.loft(
    [
      { at: [0, 1.95, 8.05], w: 0.12, h: 0.12 },
      { at: [0, 1.95, 7.4], w: 0.55, h: 0.5 },
      { at: [0, 1.95, 6.2], w: 1.0, h: 0.95 },
      { at: [0, 1.95, 5.0], w: 1.4, h: 1.42 },
      { at: [0, 1.96, 3.5], w: 1.64, h: 1.75 },
      { at: [0, 1.97, 1.0], w: 1.76, h: 2.04 },
      { at: [0, 1.97, -1.5], w: 1.7, h: 1.98 },
      { at: [0, 1.95, -3.5], w: 1.43, h: 1.62 },
      { at: [0, 1.93, -5.2], w: 1.0, h: 1.15 },
      { at: [0, 1.92, -6.4], w: 1.0, h: 0.95 },
      { at: [0, 1.9, -7.25], w: 0.9, h: 0.82 },
    ],
    { bone: hull, color: hullPaint, sides: 12, name: "fuselage" },
  );

  for (const s of [1, -1]) {
    b.decal(body, CHEVRON, { at: [s * 0.8, 2.4, -2.6], dir: [s, 0, 0], size: [0.9, 0.45] });
  }

  // Canopy, hinged at its rear edge.
  const canopy = b.joint("canopy", { parent: hull, at: [0, 2.95, -1.3], role: "hinge" });
  b.loft(
    [
      { at: [0, 2.95, 2.6], w: 0.9, h: 0.5 },
      { at: [0, 3.05, 1.2], w: 1.1, h: 0.74 },
      { at: [0, 3.02, -0.2], w: 1.04, h: 0.62 },
      { at: [0, 2.92, -1.3], w: 0.6, h: 0.36 },
    ],
    { bone: canopy, color: glassPaint, sides: 12, name: "canopy" },
  );

  // Dorsal spine, antenna, drag-chute housing, tail hook, pitot.
  b.frustumBox([0, 2.97, -1.0], [0, 2.5, -5.6], [0.5, 0.32], [0.34, 0.22], { bone: hull, color: GRAPHITE, name: "spine" });
  b.rod([0, 2.98, -2.4], [0, 3.45, -2.75], 0.018, { bone: hull, color: METAL, name: "antenna" });
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.3, 0.08],
      [0.22, 0.22],
      [0, 0.26],
    ],
    { at: [0, 2.22, -6.0], axis: [0, 1, 0], color: GRAPHITE, bone: hull, name: "chuteHousing" },
  );
  b.rod([0, 1.45, -6.9], [0, 1.12, -7.5], 0.03, { bone: hull, color: GRAPHITE, name: "tailHook" });
  b.rod([0, 1.9, 7.7], [0, 1.9, 8.4], 0.02, { bone: hull, color: METAL, name: "pitot" });
  glow(
    b.part(new THREE.CircleGeometry(0.09, 14).rotateX(-Math.PI / 2), "#ffffff", {
      bone: hull,
      at: [0, 1.44, 6.0],
      name: "landingLight",
    }),
    1.2,
  );

  // Air intakes: pearl lip, a dark mouth split by a splitter bar, and side vent slats aft of the wing.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.BoxGeometry(0.08, 0.9, 2.2), HULL, { bone: hull, at: [s * 0.9, 1.85, 3.3], name: `intakeLip${side}` });
    b.part(new THREE.BoxGeometry(0.1, 0.6, 1.9), DARK, { bone: hull, at: [s * 0.94, 1.85, 3.3], name: `intakeMouth${side}` });
    b.part(new THREE.BoxGeometry(0.07, 0.05, 1.9), HULL, { bone: hull, at: [s * 0.96, 1.85, 3.3], name: `splitter${side}` });
    for (let k = 0; k < 4; k++)
      b.part(new THREE.BoxGeometry(0.04, 0.03, 0.5), DARK, {
        bone: hull,
        at: [s * 0.7, 2.18 - k * 0.07, -3.6],
        name: `vent${side}${k}`,
      });
  }

  // Centreline drop tank with its pylon and fin.
  b.lathe(
    [
      [0, 0],
      [0.24, 0],
      [0.27, 0.2],
      [0.27, 1.8],
      [0.22, 2.0],
      [0, 2.0],
    ],
    { at: [0, 0.98, -0.4], axis: [0, 0, 1], color: HULL, bone: hull, name: "dropTank" },
  );
  b.extrude(
    [
      [0, -0.2],
      [0.5, -0.2],
      [0.35, 0.2],
      [0, 0.2],
    ],
    { at: [0, 0.98, -0.4], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.02, color: GRAPHITE, bone: hull, name: "dropTankFin" },
  );
  b.rod([0, 1.12, 0.3], [0, 1.0, 0.3], 0.04, { bone: hull, color: GRAPHITE, name: "dropTankPylon" });

  // Wings: one flat planform each, with its own aileron joint at the trailing edge.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.extrude(
      [
        [0.4, 1.9, "sharp"],
        [5.1, -0.4, "sharp"],
        [5.1, -2.2, "sharp"],
        [0.4, -2.2, "sharp"],
      ],
      {
        at: [0, 1.45, 0],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: [0.07, 0.16],
        bevel: 0.02,
        color: wingPaint,
        bone: hull,
        name: `wing${side}`,
      },
    );

    const aileron = b.joint(`aileron${side}`, { parent: hull, at: [s * 2.4, 1.45, -2.2], role: "hinge" });
    b.extrude(
      [
        [0, 0, "sharp"],
        [2.6, 0, "sharp"],
        [2.6, -0.62, "sharp"],
        [0, -0.62, "sharp"],
      ],
      {
        at: [s * 2.4, 1.45, -2.2],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.06,
        bevel: 0.015,
        color: GRAPHITE,
        bone: aileron,
        name: `aileron${side}`,
      },
    );

    b.part(new THREE.SphereGeometry(0.07, 8, 6), ORANGE, {
      bone: hull,
      at: [s * 5.1, 1.5, -1.0],
      name: `wingtipLight${side}`,
    });
  }

  // Underwing pylons and two missiles per wing.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const [u, len] of [
      [2.1, 2.4],
      [3.7, 2.0],
    ] as const) {
      const cx = s * u;
      const tailZ = leadingEdge(u) - 0.12 - len;
      const at: [number, number, number] = [cx, 1.05, tailZ];
      b.rod([cx, 1.42, tailZ + 0.9], [cx, 1.16, tailZ + 0.9], 0.03, { bone: hull, color: GRAPHITE, name: `pylon${side}${u}` });
      b.lathe(
        [
          [0, 0],
          [0.12, 0],
          [0.12, len - 0.45],
          [0.08, len - 0.2],
          [0.03, len],
          [0, len],
        ],
        { at, axis: [0, 0, 1], color: HULL, bone: hull, name: `missile${side}${u}` },
      );
      b.part(new THREE.CylinderGeometry(0.125, 0.125, 0.14, 12).rotateX(Math.PI / 2), ORANGE, {
        bone: hull,
        at: [cx, 1.05, tailZ + len * 0.6],
        name: `missileBand${side}${u}`,
      });
      b.part(new THREE.CylinderGeometry(0.06, 0.09, 0.12, 10).rotateX(Math.PI / 2), DARK, {
        bone: hull,
        at: [cx, 1.05, tailZ - 0.03],
        name: `motor${side}${u}`,
      });
      b.extrude(
        [
          [0, -0.14],
          [0.45, -0.14],
          [0.3, 0.14],
          [0, 0.14],
        ],
        { at, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.02, color: GRAPHITE, bone: hull, name: `missileFinV${side}${u}` },
      );
      b.extrude(
        [
          [0, -0.14],
          [0.45, -0.14],
          [0.3, 0.14],
          [0, 0.14],
        ],
        { at, x: [0, 0, 1], y: [1, 0, 0], thickness: 0.02, color: GRAPHITE, bone: hull, name: `missileFinH${side}${u}` },
      );
    }
  }

  // Twin vertical fins, canted outward, each with a rudder on a hinge.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const finAt: [number, number, number] = [s * 0.58, 1.95, -5.0];
    b.extrude(
      [
        [0, 0, "sharp"],
        [-1.6, 0, "sharp"],
        [-1.4, 2.5, "sharp"],
        [-1.0, 2.5, "sharp"],
      ],
      { at: finAt, x: [0, 0, 1], y: [s * 0.26, 1, 0], thickness: 0.12, bevel: 0.03, color: finPaint, bone: hull, name: `fin${side}` },
    );
    const rudder = b.joint(`rudder${side}`, { parent: hull, at: [s * 0.58, 1.95, -6.6], dir: [s * 0.26, 1, 0], role: "hinge" });
    b.extrude(
      [
        [-1.6, 0, "sharp"],
        [-2.4, 0, "sharp"],
        [-1.9, 2.5, "sharp"],
        [-1.4, 2.5, "sharp"],
      ],
      { at: finAt, x: [0, 0, 1], y: [s * 0.26, 1, 0], thickness: 0.12, bevel: 0.03, color: GRAPHITE, bone: rudder, name: `rudder${side}` },
    );
    b.part(new THREE.SphereGeometry(0.05, 8, 6), ORANGE, {
      bone: hull,
      at: [s * 1.23, 4.45, -6.45],
      name: `finLight${side}`,
    });
  }

  // Main gear: a strut hinged under each wing root, with a wheel on its own hinge.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = s * 1.15;
    const strut = b.joint(`strutMain${side}`, { parent: hull, at: [x, 1.4, -0.6], role: "hinge" });
    const wheel = b.joint(`wheelMain${side}`, { parent: strut, at: [x, 0.5, -0.6], role: "hinge" });
    b.rod([x, 1.36, -0.6], [x, 0.92, -0.6], [0.085, 0.07], { bone: strut, color: GRAPHITE, name: `oleoMain${side}` });
    b.rod([x, 0.92, -0.6], [x, 0.58, -0.6], 0.05, { bone: strut, color: METAL, name: `pistonMain${side}` });
    b.part(new THREE.TorusGeometry(0.4, 0.1, 12, 24).rotateY(Math.PI / 2), TIRE, { bone: wheel, at: [x, 0.5, -0.6], name: `tireMain${side}` });
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.22, 14).rotateZ(Math.PI / 2), HUB, { bone: wheel, at: [x, 0.5, -0.6], name: `rimMain${side}` });
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.24, 8).rotateZ(Math.PI / 2), ORANGE, { bone: wheel, at: [x, 0.5, -0.6], name: `capMain${side}` });
  }

  // Nose gear: one strut and wheel, forward of the intakes.
  const strutN = b.joint("strutNose", { parent: hull, at: [0, 1.25, 4.6], role: "hinge" });
  const wheelN = b.joint("wheelNose", { parent: strutN, at: [0, 0.35, 4.6], role: "hinge" });
  b.rod([0, 1.22, 4.6], [0, 0.72, 4.6], [0.07, 0.055], { bone: strutN, color: GRAPHITE, name: "oleoNose" });
  b.rod([0, 0.72, 4.6], [0, 0.42, 4.6], 0.04, { bone: strutN, color: METAL, name: "pistonNose" });
  b.part(new THREE.TorusGeometry(0.28, 0.07, 12, 20).rotateY(Math.PI / 2), TIRE, { bone: wheelN, at: [0, 0.35, 4.6], name: "tireNose" });
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.16, 12).rotateZ(Math.PI / 2), HUB, { bone: wheelN, at: [0, 0.35, 4.6], name: "rimNose" });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.18, 8).rotateZ(Math.PI / 2), ORANGE, { bone: wheelN, at: [0, 0.35, 4.6], name: "capNose" });

  // Twin nozzles: a flared cup each, with a glowing throat.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.lathe(
      [
        [0, 0],
        [0.26, 0],
        [0.26, 0.55],
        [0.31, 0.7],
        [0.24, 0.7],
        [0.2, 0.55],
        [0.16, 0.5],
        [0, 0.5],
      ],
      { at: [s * 0.25, 1.9, -7.25], axis: [0, 0, -1], color: NOZZLE, bone: hull, name: `nozzle${side}` },
    );
    glow(
      b.part(new THREE.CircleGeometry(0.14, 16).rotateY(Math.PI), GLOW_ORANGE, {
        bone: hull,
        at: [s * 0.25, 1.9, -7.74],
        name: `throat${side}`,
      }),
      1.5,
    );
  }

  return b.root;
}
