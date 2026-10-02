import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { paint, mix, noise } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Stormsplitter Rally Hatchback",
  description: "An enchanted rally hatch with heroic fenders, four crystal light pods, battle-worn indigo paint and copper-gold lightning livery.",
  style: "League of Legends",
  commit: "e503085",
};

export default function build() {
  const b = createBuilder({ name: "rallyHatchback", paintSize: 2048 });
  const navy = "#172347", blue = "#354caf", edge = "#869bd7", gold = "#e9ad48", pale = "#ffdf89";
  const dark = "#111824", rubber = "#23242e", cyan = "#64f8ed", red = "#df4e65", mud = "#76604c";
  const lacquer = paint((p, n) => mix(navy, blue, Math.min(1, 0.48 + n.y * 0.3 + noise(p, 0.32, 7) * 0.28)));
  const glass = paint((p) => mix("#101e35", "#3e788c", Math.max(0, Math.min(1, (p.y - 1.04) * 1.2))));
  const root = b.joint("chassis", { at: [0, 0.64, 0], role: "spine" });
  const hood = b.joint("hood", { parent: root, at: [0, 1.08, 0.91], role: "hinge" });
  const hatch = b.joint("rearHatch", { parent: root, at: [0, 1.56, -0.97], role: "hinge" });
  const doors = [1, -1].map(s => b.joint(`door${s === 1 ? "L" : "R"}`, { parent: root, at: [s * 0.78, 1.0, 0.67], dir: [0, 0, 1], role: "hinge" }));
  const wheels = [1, -1].flatMap(s => [1.21, -1.22].map(z => {
    const id = `${z > 0 ? "Front" : "Rear"}${s > 0 ? "L" : "R"}`;
    const suspension = b.joint(`suspension${id}`, { parent: root, at: [s * 0.63, 0.63, z], role: "hinge" });
    const steer = z > 0 ? b.joint(`steering${id}`, { parent: suspension, at: [s * 0.91, 0.39, z], dir: [0, 0, 1], role: "hinge" }) : suspension;
    const axle = b.joint(`wheel${id}`, { parent: steer, at: [s * 0.91, 0.39, z], dir: [0, 0, 1], role: "hinge" });
    const flap = b.joint(`mudflap${id}`, { parent: root, at: [s * 0.93, 0.59, z - 0.46], role: "hinge" });
    return { s, z, id, suspension, axle, flap };
  }));
  type Joint = typeof root;
  const box = (name: string, p: number[], size: number[], color: Parameters<typeof b.part>[1], bone: Joint = root, rotation: number[] = [0, 0, 0]) => b.part(new THREE.BoxGeometry(...size as [number, number, number]), color, { name, at: p, bone, rotation });
  const rod = (name: string, a: number[], c: number[], r: number, color: string, bone: Joint = root) => b.rod(a, c, r, { name, color, bone, sides: 6 });
  const plate = (name: string, points: number[][], color: Parameters<typeof b.part>[1], bone: Joint = root, thickness = 0.025) => b.slab(points, { name, color, bone, thickness });
  const bolt = (name: string, p: number[], dir: number[], bone: Joint = root) => b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 6), pale, { name, at: p, dir, bone });

  box("armoredFloor", [0, 0.43, 0], [1.6, 0.18, 3.42], dark);
  b.extrude([[-1.87, 0.55], [-1.84, 0.99], [-1.33, 1.1], [0.95, 1.11], [1.82, 0.93], [1.91, 0.59]], { at: [0, 0, 0], thickness: 1.6, color: lacquer, bone: root, name: "hatchbackBody", bevel: 0.045 });
  box("frontSplitter", [0, 0.4, 1.84], [1.87, 0.1, 0.32], navy);
  box("rearSkid", [0, 0.43, -1.87], [1.79, 0.12, 0.22], navy);
  box("frontGrille", [0, 0.68, 1.91], [1.25, 0.31, 0.05], dark);
  for (let i = -5; i <= 5; i++) rod(`grilleSlat${i}`, [i * 0.1, 0.54, 1.943], [i * 0.1, 0.8, 1.943], 0.012, edge);
  box("grilleGoldBrow", [0, 0.86, 1.93], [1.28, 0.05, 0.04], gold);
  box("rearDiffuser", [0, 0.53, -1.946], [1.12, 0.16, 0.04], dark);
  for (let i = -3; i <= 3; i++) box(`diffuserFin${i}`, [i * 0.14, 0.42, -1.91], [0.025, 0.16, 0.24], edge);

  plate("hood", [[-0.77, 1.107, 0.86], [0.77, 1.107, 0.86], [0.72, 0.984, 1.75], [-0.72, 0.984, 1.75]], lacquer, hood, 0.045);
  for (const s of [1, -1]) {
    plate(`hoodGoldSlash${s}`, [[s * 0.1, 1.136, 0.89], [s * 0.24, 1.136, 0.89], [s * 0.5, 1.015, 1.73], [s * 0.38, 1.015, 1.73]], gold, hood, 0.006);
    for (let i = 0; i < 4; i++) box(`hoodVent${s}_${i}`, [s * 0.55, 1.088 - i * 0.012, 1.09 + i * 0.1], [0.23, 0.025, 0.035], dark, hood, [8, 0, 0]);
    bolt(`hoodPin${s}`, [s * 0.64, 1.026, 1.59], [0, 1, 0], hood);
  }
  // The upper cabin is a hollow shell: openable doors, windshield, rear hatch and roof.
  plate("windshieldSeal", [[-0.79, 1.105, 0.87], [0.79, 1.105, 0.87], [0.64, 1.57, 0.38], [-0.64, 1.57, 0.38]], dark);
  plate("windscreen", [[-0.7, 1.15, 0.824], [0.7, 1.15, 0.824], [0.59, 1.524, 0.43], [-0.59, 1.524, 0.43]], glass);
  box("roof", [0, 1.57, -0.3], [1.34, 0.09, 1.37], lacquer);
  plate("hatchFrame", [[-0.65, 1.575, -0.99], [0.65, 1.575, -0.99], [0.8, 1.04, -1.66], [-0.8, 1.04, -1.66]], lacquer, hatch);
  plate("rearGlass", [[-0.55, 1.51, -1.084], [0.55, 1.51, -1.084], [0.68, 1.14, -1.55], [-0.68, 1.14, -1.55]], glass, hatch);
  box("rearHatchHandle", [0, 1.014, -1.74], [0.21, 0.045, 0.03], gold, hatch);
  for (const s of [1, -1]) {
    const door = doors[s === 1 ? 0 : 1];
    plate(`doorPanel${s}`, [[s * 0.82, 0.61, -0.57], [s * 0.82, 0.61, 0.69], [s * 0.82, 1.08, 0.69], [s * 0.82, 1.08, -0.57]], lacquer, door, 0.04);
    plate(`sideWindowSeal${s}`, [[s * 0.812, 1.1, -0.62], [s * 0.812, 1.1, 0.76], [s * 0.66, 1.57, 0.36], [s * 0.66, 1.57, -0.62]], dark, door);
    plate(`sideWindow${s}`, [[s * 0.81, 1.15, -0.53], [s * 0.81, 1.15, 0.61], [s * 0.686, 1.51, 0.31], [s * 0.686, 1.51, -0.53]], glass, door);
    rod(`doorPillar${s}`, [s * 0.814, 1.11, -0.24], [s * 0.679, 1.54, -0.24], 0.024, gold, door);
    plate(`quarterGlass${s}`, [[s * 0.79, 1.13, -0.72], [s * 0.68, 1.51, -0.72], [s * 0.68, 1.51, -0.98], [s * 0.78, 1.13, -1.42]], glass);
    rod(`aPillar${s}`, [s * 0.78, 1.11, 0.85], [s * 0.64, 1.57, 0.38], 0.038, gold);
    rod(`cPillar${s}`, [s * 0.79, 1.1, -1.62], [s * 0.65, 1.57, -0.99], 0.045, gold);
    box(`doorHandle${s}`, [s * 0.858, 1.02, -0.37], [0.045, 0.043, 0.18], gold, door);
    rod(`mirrorStalk${s}`, [s * 0.8, 1.13, 0.65], [s * 0.99, 1.18, 0.58], 0.03, navy, door);
    box(`mirrorHousing${s}`, [s * 1.035, 1.19, 0.58], [0.23, 0.12, 0.18], lacquer, door);
    box(`mirrorGlass${s}`, [s * 1.035, 1.19, 0.483], [0.19, 0.08, 0.009], edge, door);
    box(`rocker${s}`, [s * 0.86, 0.46, 0], [0.15, 0.13, 1.42], gold);
    glow(rod(`magicRocker${s}`, [s * 0.941, 0.48, -0.63], [s * 0.941, 0.48, 0.64], 0.018, cyan), 0.7);
    plate(`lightningLivery${s}`, [[s * 0.85, 0.88, -0.59], [s * 0.85, 1.04, 0.38], [s * 0.85, 0.87, 0.08], [s * 0.85, 0.86, 0.69], [s * 0.85, 0.69, -0.03], [s * 0.85, 0.82, 0.07]], gold, door, 0.009);
    // Tinted glazing is backed by racing seats and a gold roll cage.
    box(`bucketSeat${s}`, [s * 0.37, 0.99, -0.14], [0.4, 0.58, 0.18], dark);
    box(`seatHarness${s}`, [s * 0.37, 1.02, -0.033], [0.1, 0.42, 0.024], red);
    rod(`rollCage${s}`, [s * 0.57, 0.76, -0.76], [s * 0.57, 1.48, -0.65], 0.03, gold);
  }
  rod("rollCageCrossbar", [-0.57, 1.48, -0.65], [0.57, 1.48, -0.65], 0.03, gold);
  box("dashboard", [0, 1.0, 0.58], [1.25, 0.15, 0.26], dark);
  const steering = b.joint("steeringWheel", { parent: root, at: [-0.39, 1.12, 0.46], role: "hinge" });
  b.part(new THREE.TorusGeometry(0.14, 0.018, 5, 12), gold, { bone: steering, at: [-0.39, 1.12, 0.46], rotation: [-25, 0, 0], name: "steeringWheelRim" });
  for (const s of [1, -1]) rod(`wiper${s}`, [s * 0.2, 1.163, 0.842], [s * 0.58, 1.27, 0.73], 0.012, dark);

  for (const { s, z, id, suspension, axle, flap } of wheels) {
    const x = s * 0.91;
    rod(`wishbone${id}`, [s * 0.55, 0.57, z], [x, 0.39, z], 0.035, edge, suspension);
    rod(`damper${id}`, [s * 0.78, 0.39, z], [s * 0.7, 0.88, z], 0.03, red, suspension);
    b.part(new THREE.CylinderGeometry(0.39, 0.39, 0.29, 16), rubber, { at: [x, 0.39, z], dir: [1, 0, 0], bone: axle, name: `tire${id}`, flat: true });
    b.part(new THREE.CylinderGeometry(0.277, 0.277, 0.028, 12), dark, { at: [s * 1.062, 0.39, z], dir: [1, 0, 0], bone: axle, name: `rimWell${id}` });
    b.part(new THREE.TorusGeometry(0.262, 0.026, 5, 12), gold, { at: [s * 1.079, 0.39, z], dir: [s, 0, 0], axis: "z", bone: axle, name: `rimLip${id}` });
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      rod(`spoke${id}_${i}`, [s * 1.083, 0.39, z], [s * 1.083, 0.39 + Math.sin(a) * 0.24, z + Math.cos(a) * 0.24], 0.036, edge, axle);
      bolt(`lug${id}_${i}`, [s * 1.108, 0.39 + Math.sin(a) * 0.068, z + Math.cos(a) * 0.068], [s, 0, 0], axle);
    }
    b.part(new THREE.CylinderGeometry(0.066, 0.066, 0.045, 6), gold, { at: [s * 1.1, 0.39, z], dir: [s, 0, 0], bone: axle, name: `hub${id}` });
    for (let i = 0; i < 16; i++) {
      const a = (i + 0.5) * Math.PI / 8;
      box(`tread${id}_${i}`, [x, 0.39 + Math.cos(a) * 0.371, z + Math.sin(a) * 0.371], [0.3, 0.025, 0.068], dark, axle, [a * 180 / Math.PI, 0, 0]);
    }
    const arch = Array.from({ length: 9 }, (_, i) => {
      const a = i * Math.PI / 8;
      return [s * 0.91, 0.39 + Math.sin(a) * 0.48, z + Math.cos(a) * 0.48];
    });
    b.sweep(arch, () => [0.13, 0.062], { color: lacquer, bone: root, section: "box", caps: "flat", name: `heroFender${id}` });
    b.sweep(arch.map(p => [s * 1.055, p[1], p[2]]), 0.019, { color: gold, bone: root, sides: 5, name: `fenderEdge${id}` });
    for (let i = 1; i < 8; i += 2) bolt(`fenderBolt${id}_${i}`, [s * 1.077, arch[i][1], arch[i][2]], [s, 0, 0]);
    box(`mudFlap${id}`, [s * 0.93, 0.34, z - 0.465], [0.35, 0.48, 0.036], red, flap, [-9, 0, 0]);
    box(`mudFlapHem${id}`, [s * 0.93, 0.113, z - 0.43], [0.36, 0.055, 0.048], gold, flap);
    for (let k = 0; k < 3; k++) box(`flapWear${id}_${k}`, [s * 0.93 - 0.11 + k * 0.1, 0.18 + k * 0.017, z - 0.497], [0.046, 0.13, 0.01], mud, flap, [-9, 0, 0]);
  }

  // Four oversize roof pods read as magical rally lamps from a top-down camera.
  for (const s of [1, -1]) rod(`podBarFoot${s}`, [s * 0.48, 1.6, 0.11], [s * 0.48, 1.72, 0.12], 0.032, gold);
  box("podBar", [0, 1.71, 0.12], [1.4, 0.075, 0.08], navy);
  for (let i = 0; i < 4; i++) {
    const x = -0.51 + i * 0.34;
    b.part(new THREE.CylinderGeometry(0.158, 0.142, 0.17, 8), navy, { at: [x, 1.76, 0.15], dir: [0, 0, 1], bone: root, name: `lightPodHousing${i}` });
    b.part(new THREE.TorusGeometry(0.13, 0.025, 5, 8), gold, { at: [x, 1.76, 0.246], bone: root, name: `lightPodBezel${i}` });
    glow(b.part(new THREE.CircleGeometry(0.116, 8), pale, { at: [x, 1.76, 0.25], bone: root, name: `lightPodLens${i}` }), 0.8);
    rod(`lensGuardV${i}`, [x, 1.65, 0.257], [x, 1.87, 0.257], 0.009, gold);
    rod(`lensGuardH${i}`, [x - 0.11, 1.76, 0.257], [x + 0.11, 1.76, 0.257], 0.009, gold);
  }
  for (const s of [1, -1]) {
    box(`headlampSocket${s}`, [s * 0.7, 0.91, 1.819], [0.36, 0.17, 0.075], dark);
    glow(box(`headlamp${s}`, [s * 0.7, 0.91, 1.864], [0.26, 0.105, 0.02], cyan), 0.8);
    box(`tailLampSocket${s}`, [s * 0.68, 0.91, -1.856], [0.26, 0.23, 0.04], gold);
    for (let i = 0; i < 3; i++) glow(box(`tailLamp${s}_${i}`, [s * 0.68, 0.845 + i * 0.064, -1.885], [0.21, 0.045, 0.015], red), 0.6);
    rod(`spoilerPost${s}`, [s * 0.57, 1.48, -1.16], [s * 0.57, 1.67, -1.43], 0.038, gold, hatch);
    plate(`spoilerEndplate${s}`, [[s * 0.88, 1.57, -1.25], [s * 0.88, 1.81, -1.55], [s * 0.88, 1.82, -1.71], [s * 0.88, 1.59, -1.65]], gold, hatch);
  }
  box("rallySpoiler", [0, 1.67, -1.48], [1.78, 0.085, 0.37], lacquer, hatch, [-9, 0, 0]);
  box("spoilerGoldLip", [0, 1.71, -1.66], [1.76, 0.055, 0.04], gold, hatch);
  box("roofScoop", [0, 1.68, -0.39], [0.49, 0.17, 0.45], lacquer);
  box("scoopMouth", [0, 1.68, -0.156], [0.37, 0.09, 0.018], dark);
  for (const x of [-0.12, 0, 0.12]) rod(`scoopVane${x}`, [x, 1.64, -0.14], [x, 1.72, -0.14], 0.012, gold);
  rod("antenna", [0.48, 1.62, -0.76], [0.48, 2.025, -0.91], 0.012, navy);
  glow(b.part(new THREE.OctahedronGeometry(0.039), cyan, { at: [0.48, 2.025, -0.91], bone: root, name: "antennaCrystal" }), 0.7);
  const raceNumber = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 192"><path d="M14 12H242V180H14Z" fill="#172347" stroke="#e9ad48" stroke-width="10"/><path d="M28 32H228" stroke="#64f8ed" stroke-width="7"/><text x="128" y="140" font-family="sans-serif" font-weight="900" font-style="italic" font-size="113" text-anchor="middle" fill="#ffdf89">27</text><text x="128" y="168" font-family="sans-serif" letter-spacing="3" font-size="16" text-anchor="middle" fill="#869bd7">STORMSPLITTER</text></svg>`, { size: 512 });
  for (const s of [1, -1]) b.part(new THREE.PlaneGeometry(0.48, 0.36), "#ffffff", { at: [s * 0.855, 0.865, -0.21], axis: "z", dir: [s, 0, 0], texture: raceNumber, bone: doors[s === 1 ? 0 : 1], name: `raceNumber${s}` });
  b.part(new THREE.PlaneGeometry(0.5, 0.375), "#ffffff", { at: [0, 1.622, -0.8], axis: "z", dir: [0, 1, 0], up: [0, 0, 1], texture: raceNumber, bone: root, name: "roofNumber" });
  const rune = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M55 5L16 58H43L34 95L88 35H58L70 5Z" fill="#64f8ed" stroke="#ffdf89" stroke-width="4"/></svg>`, { size: 256 });
  glow(b.part(new THREE.PlaneGeometry(0.27, 0.33), "#ffffff", { at: [0, 1.069, 1.36], rotation: [-82, 0, 0], texture: rune, bone: hood, name: "hoodStormRune" }), 0.65);
  // Recovery loops, exhaust, mud scars, and rivets finish every viewing angle.
  for (const z of [1.98, -1.99]) {
    b.part(new THREE.TorusGeometry(0.072, 0.018, 5, 8), red, { at: [0.42, 0.53, z], bone: root, name: `towLoop${z}` });
    box(`towBracket${z}`, [0.42, 0.62, z > 0 ? z - 0.04 : z + 0.04], [0.12, 0.1, 0.13], gold);
  }
  for (const x of [-0.58, -0.39]) {
    b.part(new THREE.CylinderGeometry(0.065, 0.055, 0.24, 8), edge, { at: [x, 0.43, -1.92], dir: [0, 0, 1], bone: root, name: `exhaust${x}` });
    b.part(new THREE.CircleGeometry(0.047, 8), dark, { at: [x, 0.43, -2.047], rotation: [0, 180, 0], bone: root, name: `exhaustMouth${x}` });
  }
  for (const s of [1, -1]) for (let i = 0; i < 10; i++) {
    const z = -0.62 + i * 0.13;
    plate(`mudScar${s}_${i}`, [[s * 0.838, 0.56, z], [s * 0.838, 0.6 + (i % 3) * 0.017, z + 0.05], [s * 0.838, 0.59, z + 0.11]], mud, doors[s === 1 ? 0 : 1], 0.006);
  }
  for (const z of [-1.86, 1.86]) for (let i = -3; i <= 3; i++) bolt(`bumperRivet${z}_${i}`, [i * 0.25, 0.455, z], [0, 1, 0]);
  return b.root;
}
