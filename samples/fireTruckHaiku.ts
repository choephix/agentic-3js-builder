// A storybook 1930s pumper: a cherry-red cab with a cream roof, a rounded hood with a chrome grille and big brass
// lamps, a hose bed with hinged compartment doors, and a wooden extension ladder carried on a rack. Real size,
// about 6.9 m long, 2.4 m wide and 3.3 m tall with the ladder; the wheels, steering, steering wheel, doors, ladder
// and bell each have their own hinge joint.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "../kits/glow";
import { createBuilder } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { paint } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Vintage fire truck",
  description:
    "A storybook 1930s pumper: cherry-red cab and hose bed, cream roof and fenders, brass bell and lamps, a wooden extension ladder on a rack, hinged compartment doors and steering.",
  style: "whimsical",
  commit: "b816db2",
};

const RED = "#d7372b";
const CREAM = "#fff1d6";
const GOLD = "#f2b33d";
const BRASS = "#d89a2b";
const CHROME = "#dfe6ea";
const TIRE = "#2a2730";
const INK = "#2b2633";
const GLASS = "#1c3a57";
const TEAL = "#2a9d8f";
const WOOD = "#d8a064";
const WOOD_DARK = "#a86a3a";
const CANVAS = "#f3d9a4";
const LAMP = "#fff0b0";
const TAIL = "#ff5b4a";

// Two-tone body: red with gold pinstripes on the sill and along the hose bed.
const BODY = paint((p, n) => {
  if (Math.abs(n.x) > 0.6 && (Math.abs(p.y - 2.22) < 0.018 || Math.abs(p.y - 0.98) < 0.014)) return GOLD;
  return RED;
});

// Cab sides: red with a navy side window framed in cream, a mullion, and a gold belt line.
const CAB_SIDE = paint((p, n) => {
  if (Math.abs(n.x) < 0.5) return RED;
  const y = p.y;
  const z = p.z;
  if (y > 1.9 && y < 2.4 && z > -0.55 && z < 0.8) {
    if (y < 1.94 || y > 2.36 || z < -0.51 || z > 0.76 || Math.abs(z - 0.15) < 0.02) return CREAM;
    return GLASS;
  }
  if (Math.abs(z + 0.62) < 0.01 && y > 1.2 && y < 2.44) return INK;
  if (Math.abs(y - 1.5) < 0.02) return GOLD;
  return RED;
});

// Hood: red, with a gold centre stripe on top and dark louvres along each flank.
const HOOD = paint((p, n) => {
  if (n.y > 0.8 && Math.abs(p.x) < 0.035) return GOLD;
  if (Math.abs(n.x) > 0.5 && p.z > 1.3 && p.z < 2.5 && p.y > 1.0 && p.y < 1.42) {
    const slat = (((p.z - 1.3) % 0.13) + 0.13) % 0.13;
    if (slat < 0.04) return INK;
  }
  return RED;
});

// Round star medallion: gold rim, red field, cream star. Used on the tailgate and the hose bed doors.
const STAR = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="${GOLD}"/>
  <circle cx="50" cy="50" r="41" fill="${RED}"/>
  <circle cx="50" cy="50" r="36" fill="none" stroke="${CREAM}" stroke-width="2.5"/>
  <polygon points="50,20 57,40.3 78.5,40.7 61.4,53.7 67.6,74.3 50,62 32.4,74.3 38.6,53.7 21.5,40.7 42.9,40.3" fill="${CREAM}"/>
</svg>`,
  { size: 256 },
);

const rb = (w: number, h: number, d: number, r: number) => new RoundedBoxGeometry(w, h, d, 3, r);

export default function build() {
  const b = createBuilder({ name: "fireTruck", paintSize: 2048 });

  // ---- skeleton -------------------------------------------------------------------------------------------------
  const chassis = b.joint("chassis", { at: [0, 0.85, 0], role: "spine" });

  // Wheel: a round black tyre, a red disc, a brass hub and six cream spokes on each face.
  const wheel = (bone: Joint, x: number, z: number) => {
    const c = [x, 0.5, z];
    b.part(new THREE.TorusGeometry(0.41, 0.09, 12, 32), TIRE, { bone, at: c, dir: [1, 0, 0], axis: "z" });
    b.part(new THREE.CylinderGeometry(0.36, 0.36, 0.14, 28), RED, { bone, at: c, dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.26, 16), BRASS, { bone, at: c, dir: [1, 0, 0] });
    for (const s of [1, -1])
      for (let k = 0; k < 6; k++) {
        const a = (k * Math.PI) / 3;
        b.rod(
          [x + s * 0.1, 0.5 + 0.12 * Math.cos(a), z + 0.12 * Math.sin(a)],
          [x + s * 0.1, 0.5 + 0.33 * Math.cos(a), z + 0.33 * Math.sin(a)],
          0.018,
          { bone, color: CREAM },
        );
      }
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // Front wheels steer about a kingpin above the hub.
    const steer = b.joint(`steer${side}`, { parent: chassis, at: [s * 1.0, 0.85, 2.15], role: "hinge" });
    const frontWheel = b.joint(`wheelF${side}`, { parent: steer, at: [s * 1.08, 0.5, 2.15], role: "hinge" });
    wheel(frontWheel, s * 1.08, 2.15);
    const rearWheel = b.joint(`wheelR${side}`, { parent: chassis, at: [s * 1.08, 0.5, -2.35], role: "hinge" });
    wheel(rearWheel, s * 1.08, -2.35);
  }

  // Steering wheel: its hinge aims along the column, so the wheel spins about the column.
  const hub = new THREE.Vector3(0.5, 2.02, 0.42);
  const columnTop = new THREE.Vector3(0.5, 1.72, 1.0);
  const normal = hub.clone().sub(columnTop).normalize();
  const e1 = new THREE.Vector3(1, 0, 0);
  const e2 = normal.clone().cross(e1).normalize();
  const steerWheel = b.joint("steerWheel", {
    parent: chassis,
    at: hub,
    aim: hub.clone().add(normal),
    role: "hinge",
  });
  b.part(new THREE.TorusGeometry(0.23, 0.026, 8, 28), INK, { bone: steerWheel, at: hub, dir: normal, axis: "z" });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.07, 14), BRASS, { bone: steerWheel, at: hub, dir: normal });
  for (const deg of [90, 210, 330]) {
    const a = (deg * Math.PI) / 180;
    const rim = hub.clone().add(e1.clone().multiplyScalar(Math.cos(a) * 0.2).add(e2.clone().multiplyScalar(Math.sin(a) * 0.2)));
    b.rod(hub, rim, 0.016, { bone: steerWheel, color: CHROME });
  }
  b.rod(columnTop, hub, 0.025, { bone: chassis, color: CHROME });

  // Two-leaf hose-bed compartment doors, one hinge each, on both sides.
  const doors = [
    { s: 1, name: "hoseDoorLF", z0: -0.95, len: 0.88 },
    { s: 1, name: "hoseDoorLR", z0: -1.95, len: 1.0 },
    { s: -1, name: "hoseDoorRF", z0: -0.95, len: 0.88 },
    { s: -1, name: "hoseDoorRR", z0: -1.95, len: 1.0 },
  ];
  for (const d of doors) {
    const hinge = b.joint(d.name, { parent: chassis, at: [d.s * 1.14, 1.6, d.z0], role: "hinge" });
    const zc = d.z0 - d.len / 2;
    b.part(rb(0.05, 1.2, d.len, 0.02), CREAM, { bone: hinge, at: [d.s * 1.14, 1.6, zc] });
    for (const y of [1.08, 2.12])
      b.part(rb(0.06, 0.04, d.len - 0.12, 0.015), GOLD, { bone: hinge, at: [d.s * 1.14, y, zc] });
    b.part(new THREE.CircleGeometry(0.18, 32), "#ffffff", {
      bone: hinge,
      at: [d.s * 1.168, 1.6, zc],
      dir: [d.s, 0, 0],
      axis: "z",
      texture: STAR,
    });
    b.capsule(
      [d.s * 1.165, 1.72, d.z0 - d.len + 0.12],
      [d.s * 1.2, 1.72, d.z0 - d.len + 0.12],
      0.018,
      { bone: hinge, color: BRASS },
    );
  }

  // Wooden extension ladder on a rack; its hinge sits at the rear end so it can be tipped up.
  const ladder = b.joint("ladder", { parent: chassis, at: [0, 3.1, -3.25], role: "hinge" });
  for (const s of [1, -1]) {
    b.part(rb(0.1, 0.16, 6.0, 0.03), WOOD, { bone: ladder, at: [s * 0.28, 3.1, -0.25] });
    b.part(rb(0.09, 0.12, 5.2, 0.03), WOOD, { bone: ladder, at: [s * 0.28, 3.25, 0.0] });
  }
  for (let k = 0; k < 14; k++) {
    const z = -2.9 + 0.4 * k;
    b.rod([-0.3, 3.1, z], [0.3, 3.1, z], 0.022, { bone: ladder, color: WOOD_DARK });
  }

  // Bell on a bracket at the cab roof's front-left; its hinge swings it like a rope-pull bell.
  const bell = b.joint("bell", { parent: chassis, at: [-0.85, 3.04, 0.45], role: "hinge" });
  b.rod([-0.85, 2.81, 0.45], [-0.85, 3.04, 0.45], 0.03, { bone: chassis, color: CHROME });
  b.lathe(
    [
      [0, 0],
      [0.13, 0],
      [0.14, 0.015],
      [0.115, 0.1],
      [0.075, 0.17],
      [0.035, 0.205],
      [0, 0.215],
    ],
    { at: [-0.85, 2.84, 0.45], bone: bell, color: BRASS, smoothing: 1 },
  );

  // ---- chassis and running gear -----------------------------------------------------------------------------------
  b.part(new THREE.BoxGeometry(2.1, 0.22, 6.6), INK, { bone: chassis, at: [0, 0.72, -0.2] });
  for (const s of [1, -1])
    b.part(rb(0.36, 0.07, 2.2, 0.03), INK, { bone: chassis, at: [s * 1.2, 0.66, 0] });

  // Cream fenders: each is a side profile of an arch over its wheel, extruded across the truck.
  const fender = (s: number, zc: number) => {
    const arch: number[][] = [];
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (1 - i / 12);
      arch.push([0.66 * Math.cos(a), 0.66 * Math.sin(a)]);
    }
    b.extrude(arch, {
      at: [s * 1.2, 0.5, zc],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.3,
      bevel: 0.05,
      color: CREAM,
      bone: chassis,
    });
  };
  for (const s of [1, -1]) {
    fender(s, 2.15);
    fender(s, -2.35);
  }

  // ---- cab --------------------------------------------------------------------------------------------------------
  b.part(rb(2.26, 0.34, 1.95, 0.1), BODY, { bone: chassis, at: [0, 1.0, 0.1] });
  for (const s of [1, -1])
    b.part(rb(0.1, 1.3, 1.95, 0.04), CAB_SIDE, { bone: chassis, at: [s * 1.12, 1.82, 0.1] });
  for (const s of [1, -1]) b.capsule([s * 1.16, 1.7, -0.1], [s * 1.2, 1.7, -0.1], 0.02, { bone: chassis, color: CHROME });
  b.part(rb(2.14, 1.3, 0.1, 0.04), BODY, { bone: chassis, at: [0, 1.82, -0.84] });
  b.part(rb(2.36, 0.36, 2.0, 0.12), CREAM, { bone: chassis, at: [0, 2.63, 0.1] });
  b.part(rb(2.14, 0.55, 0.1, 0.04), BODY, { bone: chassis, at: [0, 1.445, 1.05] });
  for (const s of [1, -1])
    b.part(rb(0.14, 0.73, 0.16, 0.05), BODY, { bone: chassis, at: [s * 1.0, 2.085, 1.06] });
  // Chrome windscreen frame and the open windscreen behind it, so the cab interior reads from the front.
  b.rod([-0.93, 1.74, 1.15], [0.93, 1.74, 1.15], 0.022, { bone: chassis, color: CHROME });
  b.rod([-0.93, 2.42, 1.15], [0.93, 2.42, 1.15], 0.022, { bone: chassis, color: CHROME });

  // Interior: two teal seats, a helmet on the passenger seat, and gauges set into the dash.
  for (const s of [1, -1]) {
    b.part(rb(0.66, 0.2, 0.66, 0.07), TEAL, { bone: chassis, at: [s * 0.5, 1.27, 0.12] });
    b.part(rb(0.62, 0.8, 0.14, 0.06), TEAL, { bone: chassis, at: [s * 0.5, 1.77, -0.22] });
  }
  b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.16, 0.03],
      [0.15, 0.07],
      [0.12, 0.12],
      [0.06, 0.16],
      [0, 0.17],
    ],
    { at: [-0.5, 1.37, 0.12], bone: chassis, color: BRASS, smoothing: 1 },
  );
  for (const x of [-0.62, -0.36, -0.1, 0.16]) {
    b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.03, 18), BRASS, { bone: chassis, at: [x, 1.5, 1.115], dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.035, 18), CREAM, { bone: chassis, at: [x, 1.5, 1.13], dir: [0, 0, 1] });
    b.rod([x, 1.5, 1.15], [x + 0.03, 1.56, 1.15], 0.008, { bone: chassis, color: RED });
  }

  // Side mirrors on brass arms.
  for (const s of [1, -1]) {
    b.rod([s * 1.04, 2.2, 1.12], [s * 1.36, 2.26, 1.16], 0.02, { bone: chassis, color: CHROME });
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 16), BRASS, { bone: chassis, at: [s * 1.37, 2.26, 1.16], dir: [s, 0, 0] });
    b.part(new THREE.CircleGeometry(0.085, 16), "#cfe9f2", { bone: chassis, at: [s * 1.386, 2.26, 1.16], dir: [s, 0, 0], axis: "z" });
  }

  // Beacon on the cab roof: a red glass dome, glowing.
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.06, 12), INK, { bone: chassis, at: [0, 2.84, -0.55] });
  glow(
    b.part(new THREE.SphereGeometry(0.13, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), TAIL, {
      bone: chassis,
      at: [0, 2.87, -0.55],
    }),
    1.2,
  );

  // Ladder cradles: a rear pair on the hose bed and a short front pair on the cab roof.
  b.part(rb(1.5, 0.08, 0.14, 0.02), INK, { bone: chassis, at: [0, 2.98, -1.0] });
  b.part(rb(1.5, 0.08, 0.14, 0.02), INK, { bone: chassis, at: [0, 2.98, 1.0] });
  for (const s of [1, -1]) {
    b.part(rb(0.12, 0.54, 0.12, 0.03), INK, { bone: chassis, at: [s * 0.7, 2.67, -1.0] });
    b.part(rb(0.12, 0.2, 0.12, 0.03), INK, { bone: chassis, at: [s * 0.7, 2.91, 1.0] });
  }

  // ---- hood and nose ---------------------------------------------------------------------------------------------
  b.loft(
    [
      { at: [0, 1.35, 0.9], w: 2.1, h: 1.0 },
      { at: [0, 1.32, 1.9], w: 2.0, h: 0.9 },
      { at: [0, 1.25, 2.6], w: 1.7, h: 0.72 },
      { at: [0, 1.15, 3.05], w: 1.25, h: 0.56 },
    ],
    { bone: chassis, color: HOOD, section: { ngon: 8 }, caps: "flat" },
  );
  // Chrome grille: a plate and seven vertical bars on the flat nose face, merged into one part.
  const grille = new THREE.BoxGeometry(0.8, 0.36, 0.06).translate(0, 1.14, 3.08);
  const bars: THREE.BufferGeometry[] = [grille];
  for (let i = 0; i < 7; i++) bars.push(new THREE.BoxGeometry(0.035, 0.3, 0.04).translate(-0.33 + i * 0.11, 1.14, 3.12));
  const grilleMerged = mergeGeometries(bars);
  if (!grilleMerged) throw new Error("grille: merge failed");
  b.part(grilleMerged, CHROME, { bone: chassis, at: [0, 0, 0] });
  // Brass radiator cap on the bonnet's crown.
  b.part(new THREE.CylinderGeometry(0.07, 0.09, 0.12, 14), BRASS, { bone: chassis, at: [0, 1.66, 2.35] });
  // Big brass lamps with glowing glass.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.19, 14, 10), BRASS, { bone: chassis, at: [s * 0.68, 1.3, 2.9] });
    b.part(new THREE.TorusGeometry(0.19, 0.022, 8, 24), CHROME, {
      bone: chassis,
      at: [s * 0.68, 1.3, 2.9],
      dir: [0, 0, 1],
      axis: "z",
    });
    glow(
      b.part(new THREE.CircleGeometry(0.14, 20), LAMP, {
        bone: chassis,
        at: [s * 0.68, 1.3, 3.1],
        dir: [0, 0, 1],
        axis: "z",
      }),
      1.5,
    );
  }
  b.capsule([-1.05, 0.62, 3.2], [1.05, 0.62, 3.2], 0.055, { bone: chassis, color: CHROME });
  for (const s of [1, -1]) b.rod([s * 0.95, 0.62, 3.2], [s * 0.95, 0.62, 2.9], 0.035, { bone: chassis, color: CHROME });

  // ---- hose bed -------------------------------------------------------------------------------------------------
  b.part(rb(2.24, 1.55, 2.5, 0.1), BODY, { bone: chassis, at: [0, 1.62, -2.12] });
  // Coiled hose stacks on the bed, rear left and right.
  for (const s of [1, -1])
    for (let k = 0; k < 4; k++)
      b.part(new THREE.TorusGeometry(0.2, 0.06, 10, 22), CANVAS, {
        bone: chassis,
        at: [s * 0.72, 2.47 + 0.12 * k, -2.9],
        dir: [0, 1, 0],
        axis: "z",
      });
  // Brass rivets along the sill and bed edges.
  const rivets: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (let i = 0; i < 10; i++) {
      const z = -1.0 - 0.25 * i;
      for (const y of [0.92, 2.3]) rivets.push(new THREE.SphereGeometry(0.02, 6, 4).translate(s * 1.125, y, z));
    }
  const rivetMerged = mergeGeometries(rivets);
  if (!rivetMerged) throw new Error("rivets: merge failed");
  b.part(rivetMerged, BRASS, { bone: chassis, at: [0, 0, 0] });
  // Tailgate medallion, a spare tyre slung behind, and red tail lamps with brass rings.
  b.part(new THREE.CircleGeometry(0.22, 36), "#ffffff", {
    bone: chassis,
    at: [0, 2.02, -3.39],
    dir: [0, 0, -1],
    axis: "z",
    texture: STAR,
  });
  b.part(new THREE.TorusGeometry(0.36, 0.11, 12, 30), TIRE, { bone: chassis, at: [0, 1.25, -3.45], dir: [0, 0, 1], axis: "z" });
  b.part(new THREE.CylinderGeometry(0.24, 0.24, 0.1, 24), CREAM, { bone: chassis, at: [0, 1.25, -3.4], dir: [0, 0, 1] });
  b.capsule([-1.0, 0.62, -3.55], [1.0, 0.62, -3.55], 0.06, { bone: chassis, color: CHROME });
  for (const s of [1, -1]) {
    b.rod([s * 1.0, 0.62, -3.55], [s * 1.0, 0.62, -3.37], 0.035, { bone: chassis, color: CHROME });
    glow(b.part(new THREE.SphereGeometry(0.1, 12, 8), TAIL, { bone: chassis, at: [s * 0.92, 1.45, -3.36] }), 1.0);
    b.part(new THREE.TorusGeometry(0.11, 0.02, 8, 20), BRASS, {
      bone: chassis,
      at: [s * 0.92, 1.45, -3.36],
      dir: [0, 0, -1],
      axis: "z",
    });
  }

  return b.root;
}
