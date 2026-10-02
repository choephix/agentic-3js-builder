import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

const RED = "#c83f35";
const RED_DARK = "#8e2526";
const CREAM = "#f7d79b";
const CREAM_LIGHT = "#fff1c9";
const BLUE = "#4d8194";
const BLUE_DARK = "#173b50";
const BLACK = "#20232a";
const RUBBER = "#25252b";
const BRASS = "#d59b43";
const BRASS_DARK = "#8a5729";
const CHROME = "#b8c5c9";
const WOOD = "#8d4a2e";
const ORANGE = "#f28b31";

export const meta = {
  name: "Whimsical Vintage Fire Truck",
  description: "A cheerful, brass-trimmed vintage fire truck with a raised rescue ladder, hose reel, bell and glowing lamps.",
  style: "whimsical",
  commit: "07503e3",
};

const signTexture = svg(
  `<svg viewBox="0 0 320 112" xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="112" rx="18" fill="#fff1c9"/>
    <rect x="7" y="7" width="306" height="98" rx="14" fill="none" stroke="#c83f35" stroke-width="12"/>
    <text x="160" y="73" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="55" fill="#8e2526">FIRE</text>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "fireTruck", detail: 0.8 });
  const root = b.joint("chassis", { at: [0, 0.78, 0], role: "spine" });

  const box = (name: string, size: [number, number, number], at: [number, number, number], color: string, options: Record<string, unknown> = {}) =>
    b.part(new THREE.BoxGeometry(...size), color, { bone: root, at, name, flat: true, ...options });
  const cyl = (name: string, radius: number, height: number, at: [number, number, number], color: string, dir: [number, number, number] = [0, 1, 0], options: Record<string, unknown> = {}) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 12), color, { bone: root, at, dir, name, flat: true, ...options });
  const rod = (name: string, a: [number, number, number], z: [number, number, number], radius: number, color: string, options: Record<string, unknown> = {}) =>
    b.rod(a, z, radius, { bone: root, color, name, section: { ngon: 6 }, ...options });

  // Low, friendly chassis and fenders.
  box("frame", [4.9, 0.34, 2.05], [0, 0.88, 0], RED_DARK);
  box("bodyLower", [4.55, 0.9, 1.92], [0, 1.37, -0.05], RED);
  box("creamBelt", [4.6, 0.16, 1.96], [0, 1.70, -0.05], CREAM);
  box("frontBumper", [4.9, 0.20, 0.20], [0, 0.76, 2.48], CHROME);
  box("rearBumper", [4.7, 0.18, 0.18], [0, 0.78, -2.38], CHROME);
  box("frontNose", [4.1, 0.62, 0.55], [0, 1.52, 2.12], RED_DARK);
  box("hood", [2.15, 0.32, 1.22], [0, 2.00, 1.58], RED);
  box("hoodCrown", [1.75, 0.12, 1.12], [0, 2.20, 1.57], CREAM);

  // Cab with chunky rounded-feeling stepped silhouette.
  box("cab", [2.15, 1.65, 1.82], [0, 2.24, 0.82], RED);
  box("cabRoof", [2.35, 0.20, 1.96], [0, 3.10, 0.82], CREAM);
  box("cabVisor", [2.40, 0.15, 0.35], [0, 2.93, 1.82], RED_DARK);
  box("windshield", [1.65, 0.65, 0.06], [0, 2.45, 1.755], BLUE_DARK);
  box("windshieldTop", [1.80, 0.08, 0.08], [0, 2.82, 1.80], CREAM_LIGHT);
  box("windshieldBar", [0.09, 0.68, 0.11], [0, 2.46, 1.79], CREAM);
  for (const s of [-1, 1]) {
    box(`sideWindow${s}`, [0.06, 0.64, 0.95], [s * 1.09, 2.45, 0.87], BLUE, { dir: [s, 0, 0] });
    box(`windowFrame${s}`, [0.08, 0.08, 1.05], [s * 1.12, 2.82, 0.87], CREAM);
    box(`windowSill${s}`, [0.08, 0.09, 1.10], [s * 1.12, 2.08, 0.87], CREAM);
    box(`doorSeam${s}`, [0.035, 1.00, 0.07], [s * 1.125, 2.26, 0.08], RED_DARK);
    cyl(`doorHandle${s}`, 0.035, 0.16, [s * 1.16, 2.00, 0.36], BRASS, [1, 0, 0]);
    b.part(new THREE.PlaneGeometry(0.86, 0.30), "#ffffff", {
      bone: root,
      at: [s * 1.145, 1.52, -0.45],
      dir: [s, 0, 0],
      axis: "z",
      texture: signTexture,
      name: `fireSign${s}`,
    });
  }

  // Running boards, wheel arches and broad toy-like wheels.
  for (const s of [-1, 1]) {
    box(`runningBoard${s}`, [0.24, 0.16, 3.55], [s * 1.20, 0.93, -0.10], CREAM);
    box(`frontFender${s}`, [0.28, 0.24, 1.15], [s * 1.06, 1.12, 1.35], RED_DARK);
    box(`rearFender${s}`, [0.28, 0.24, 1.15], [s * 1.06, 1.12, -1.52], RED_DARK);
    for (const [i, z] of [[0, 1.38], [1, -1.58]] as const) {
      const wheel = b.joint(`wheel${s < 0 ? "L" : "R"}${i === 0 ? "Front" : "Rear"}`, {
        parent: root,
        at: [s * 1.18, 0.49, z],
        dir: [1, 0, 0],
        role: "hinge",
        group: "wheels",
      });
      b.part(new THREE.CylinderGeometry(0.49, 0.49, 0.25, 14), RUBBER, {
        bone: wheel,
        at: [s * 1.18, 0.49, z],
        dir: [1, 0, 0],
        name: `tire${s < 0 ? "L" : "R"}${i}`,
        flat: true,
      });
      b.part(new THREE.CylinderGeometry(0.27, 0.27, 0.265, 12), CREAM, {
        bone: wheel,
        at: [s * 1.18, 0.49, z],
        dir: [1, 0, 0],
        name: `hubcap${s < 0 ? "L" : "R"}${i}`,
        flat: true,
      });
      b.part(new THREE.CylinderGeometry(0.10, 0.10, 0.28, 10), BRASS, {
        bone: wheel,
        at: [s * 1.18, 0.49, z],
        dir: [1, 0, 0],
        name: `hub${s < 0 ? "L" : "R"}${i}`,
        flat: true,
      });
      for (let spoke = 0; spoke < 4; spoke++) {
        const a = (spoke * Math.PI) / 2;
        const x = s * 1.18;
        const y = 0.49 + Math.cos(a) * 0.18;
        const zz = z + Math.sin(a) * 0.18;
        b.part(new THREE.BoxGeometry(0.29, 0.045, 0.045), BRASS_DARK, {
          bone: wheel,
          at: [x, y, zz],
          dir: [1, 0, 0],
          rotation: [0, a * 180 / Math.PI, 0],
          name: `spoke${s < 0 ? "L" : "R"}${i}${spoke}`,
        });
      }
    }
  }

  // Grille, lamps and a smiling front face.
  for (let i = -2; i <= 2; i++) box(`grille${i}`, [0.12, 0.42, 0.05], [i * 0.27, 1.48, 2.405], BLACK);
  box("grilleTop", [1.32, 0.08, 0.07], [0, 1.72, 2.41], BRASS);
  for (const s of [-1, 1]) {
    const lamp = cyl(`headlamp${s}`, 0.16, 0.10, [s * 1.55, 1.72, 2.43], CREAM_LIGHT, [0, 0, 1]);
    glow(lamp, 1.6);
    cyl(`lampRim${s}`, 0.20, 0.07, [s * 1.55, 1.72, 2.37], BRASS, [0, 0, 1]);
  }
  // Roof beacon and bell.
  cyl("beaconBase", 0.23, 0.08, [0, 3.31, 0.82], BRASS_DARK);
  const beacon = b.part(new THREE.SphereGeometry(0.18, 12, 8), ORANGE, { bone: root, at: [0, 3.46, 0.82], name: "beacon" });
  glow(beacon, 1.8);
  cyl("bellStand", 0.08, 0.30, [0, 3.32, 1.46], BRASS_DARK);
  b.part(new THREE.ConeGeometry(0.23, 0.22, 12), BRASS, { bone: root, at: [0, 3.56, 1.46], name: "bell", flat: true });
  cyl("bellClapper", 0.05, 0.10, [0, 3.42, 1.46], BRASS_DARK);

  // Rear deck, water tank and cheerful hose reel.
  box("rearDeck", [2.08, 0.18, 1.75], [0, 2.02, -1.22], CREAM);
  box("tank", [1.62, 1.05, 1.20], [0, 2.58, -1.15], RED_DARK);
  box("tankBandA", [1.72, 0.12, 1.30], [0, 2.28, -1.15], BRASS);
  box("tankBandB", [1.72, 0.12, 1.30], [0, 2.86, -1.15], BRASS);
  cyl("tankCap", 0.18, 0.08, [0, 3.14, -1.15], BRASS, [0, 1, 0]);
  const reel = b.joint("hoseReelHinge", { parent: root, at: [0, 2.42, -2.03], dir: [1, 0, 0], role: "hinge" });
  b.part(new THREE.CylinderGeometry(0.52, 0.52, 0.20, 16), WOOD, { bone: reel, at: [0, 2.42, -2.03], dir: [1, 0, 0], name: "hoseReel", flat: true });
  b.part(new THREE.CylinderGeometry(0.20, 0.20, 0.24, 12), BRASS, { bone: reel, at: [0, 2.42, -2.03], dir: [1, 0, 0], name: "hoseHub", flat: true });
  for (const s of [-1, 1]) {
    cyl(`reelFlange${s}`, 0.62, 0.08, [s * 0.16, 2.42, -2.03], BRASS_DARK, [1, 0, 0]);
    rod(`hoseLoop${s}`, [s * 0.20, 2.05, -2.03], [s * 0.20, 2.78, -2.03], 0.035, ORANGE);
  }
  // Side hose, nozzle and ladder storage blocks.
  for (const s of [-1, 1]) {
    rod(`sideHose${s}`, [s * 1.16, 1.91, -0.9], [s * 1.16, 1.91, -1.88], 0.055, ORANGE);
    cyl(`nozzle${s}`, 0.09, 0.30, [s * 1.16, 1.91, -0.9], BRASS, [0, 0, 1]);
    box(`ladderRack${s}`, [0.16, 0.20, 1.68], [s * 0.82, 2.10, -1.18], BRASS_DARK);
  }

  // Raised two-rail rescue ladder, all carried by a named hinge bone.
  const ladderPivot = b.joint("ladderHinge", { parent: root, at: [0, 2.17, -0.72], dir: [0, 1, 0.2], role: "hinge", group: "ladder" });
  const ladderRailL: [number, number, number] = [-0.36, 2.17, -0.72];
  const ladderRailLT: [number, number, number] = [-0.36, 5.55, 0.92];
  const ladderRailR: [number, number, number] = [0.36, 2.17, -0.72];
  const ladderRailRT: [number, number, number] = [0.36, 5.55, 0.92];
  b.rod(ladderRailL, ladderRailLT, 0.075, { bone: ladderPivot, color: CREAM, name: "ladderRailL", section: { ngon: 6 } });
  b.rod(ladderRailR, ladderRailRT, 0.075, { bone: ladderPivot, color: CREAM, name: "ladderRailR", section: { ngon: 6 } });
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const y = 2.24 + t * 3.12;
    const z = -0.67 + t * 1.52;
    b.rod([-0.36, y, z], [0.36, y, z], 0.038, { bone: ladderPivot, color: BRASS, name: `ladderStep${i}`, section: { ngon: 6 } });
  }
  b.part(new THREE.SphereGeometry(0.12, 10, 8), BRASS, { bone: ladderPivot, at: [0, 5.58, 0.94], name: "ladderTopCap", flat: true });
  b.rod([-0.51, 2.15, -0.71], [-0.51, 2.82, -0.39], 0.045, { bone: root, color: BRASS_DARK, name: "ladderSupportL" });
  b.rod([0.51, 2.15, -0.71], [0.51, 2.82, -0.39], 0.045, { bone: root, color: BRASS_DARK, name: "ladderSupportR" });

  // Small bells, rivets and trim that keep the silhouette lively from every side.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      cyl(`bodyRivet${s}${i}`, 0.035, 0.035, [s * 1.03, 1.74, 1.48 - i * 0.52], BRASS, [1, 0, 0]);
    }
    box(`rearStripe${s}`, [0.08, 0.11, 1.80], [s * 1.05, 1.84, -1.18], CREAM_LIGHT);
  }
  // Mirrors, tail lamps and a tiny registration plate finish the road-going story.
  for (const s of [-1, 1]) {
    b.rod([s * 1.10, 2.72, 1.48], [s * 1.36, 2.78, 1.55], 0.035, { bone: root, color: BRASS_DARK, name: `mirrorArm${s}` });
    box(`mirror${s}`, [0.10, 0.25, 0.34], [s * 1.40, 2.84, 1.55], BLUE_DARK);
    const tail = cyl(`tailLamp${s}`, 0.10, 0.08, [s * 1.55, 1.36, -2.33], ORANGE, [0, 0, 1]);
    glow(tail, 0.8);
  }
  box("licensePlate", [0.65, 0.14, 0.04], [0, 0.99, 2.44], CREAM_LIGHT);
  // A little rescue platform makes the ladder read as working equipment, not a loose prop.
  box("ladderPlatform", [0.92, 0.10, 0.44], [0, 5.42, 0.90], CREAM, { bone: ladderPivot });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.28, 10), BRASS, {
    bone: ladderPivot,
    at: [0, 5.56, 1.04],
    dir: [0, 0, 1],
    name: "ladderNozzle",
    flat: true,
  });

  return b.root;
}
