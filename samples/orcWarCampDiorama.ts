import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { paint, grain, mottle, Paint } from "../src/paint";
import { glow } from "../kits/glow";

export const meta = {
  name: "Orc War Camp Diorama",
  description: "A hand-painted Warcraft-style orc war camp with a fortified hut, blood banners, carved totems, and a glowing campfire.",
  style: "Blizzard/Warcraft",
  commit: "67d30d1",
};

const INK = "#17110f";
const SOIL = "#3a241b";
const SOIL_LIGHT = "#68412a";
const WOOD_DARK = "#2a1712";
const WOOD_LIGHT = "#95623a";
const ROOF = "#3d281e";
const ROOF_LIGHT = "#735035";
const IRON = "#242326";
const IRON_HI = "#55464a";
const BRASS = "#c18a2c";
const BONE = "#c9ae79";
const BONE_DARK = "#806344";
const ORC_GREEN = "#4a7133";
const ORC_DARK = "#263b24";
const RED = "#8e2630";
const RED_LIGHT = "#c4493f";
const OCHRE = "#d18b31";
const EMBER = "#ff5729";
const FIRE = "#ffb52d";
const FIRE_OUTER = "#dc421f";
const SMOKE = "#6b5650";

const timber = grain(WOOD_DARK, WOOD_LIGHT, { size: 0.19, axis: "y", seed: 11 });
const thatch = grain(ROOF, ROOF_LIGHT, { size: 0.11, axis: "z", seed: 19 });
const stone = mottle(SOIL, SOIL_LIGHT, { size: 0.24, contrast: 0.75, seed: 7 });
const hide = mottle(RED, RED_LIGHT, { size: 0.16, contrast: 0.55, seed: 31 });
const wornIron = mottle(IRON, IRON_HI, { size: 0.09, contrast: 0.7, seed: 3 });
const emberPaint = paint((_p, _n, s) => (s[1] > 0.45 ? FIRE : EMBER));

export default function build() {
  const b = createBuilder({ name: "orcWarCampDiorama", detail: 0.8, paintSize: 1024 });
  const root = b.joint("campRoot", { at: [0, 0, 0] });
  const part = (geometry: THREE.BufferGeometry, color: string | Paint, at: [number, number, number], name: string, extra: Record<string, unknown> = {}) =>
    b.part(geometry, color, { bone: root, at, name, ...extra });
  const box = (size: [number, number, number], color: string | Paint, at: [number, number, number], name: string, rotation?: [number, number, number]) =>
    part(new THREE.BoxGeometry(...size), color, at, name, rotation ? { rotation } : {});
  const cyl = (radius: number, height: number, color: string | Paint, at: [number, number, number], name: string, segments = 8, dir?: [number, number, number]) =>
    part(new THREE.CylinderGeometry(radius, radius * 1.04, height, segments), color, at, name, dir ? { dir } : {});
  const sphere = (radius: number, color: string | Paint, at: [number, number, number], name: string, segments = 8) =>
    part(new THREE.SphereGeometry(radius, segments, Math.max(4, Math.floor(segments * 0.7))), color, at, name);
  const cone = (radius: number, height: number, color: string | Paint, at: [number, number, number], name: string, segments = 7, dir?: [number, number, number]) =>
    part(new THREE.ConeGeometry(radius, height, segments), color, at, name, dir ? { dir } : {});

  // Heavy earthen plinth and painted rim stones.
  box([3.05, 0.18, 2.65], stone, [0, 0.09, 0], "warCampBase");
  box([2.78, 0.08, 2.38], SOIL_LIGHT, [0, 0.22, 0], "baseRaisedEarth");
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const x = Math.cos(a) * 1.41;
    const z = Math.sin(a) * 1.18;
    sphere(0.105 + (i % 3) * 0.018, i % 2 ? SOIL_LIGHT : stone, [x, 0.27, z], `rimStone${i}`, 7);
  }
  // Embedded stakes and scattered camp clutter give the base a lived-in silhouette.
  for (let i = 0; i < 10; i++) {
    const x = -1.25 + (i * 0.29) % 2.5;
    const z = -1.02 + ((i * 0.47) % 0.34);
    cyl(0.026, 0.38 + (i % 3) * 0.04, WOOD_DARK, [x, 0.42, z], `groundStake${i}`, 6, [0.08 * ((i % 2) ? 1 : -1), 0.98, 0]);
  }

  // Hut: oversized posts, patched walls, and a ridge-beamed thatch roof.
  const hutX = -0.35;
  const hutZ = 0.18;
  const postXs = [hutX - 0.62, hutX + 0.62];
  const postZs = [hutZ - 0.48, hutZ + 0.48];
  for (let i = 0; i < postXs.length; i++) for (let j = 0; j < postZs.length; j++) {
    box([0.14, 1.33, 0.14], timber, [postXs[i], 0.9, postZs[j]], `hutPost${i}${j}`);
    sphere(0.095, WOOD_LIGHT, [postXs[i], 1.55, postZs[j]], `postCap${i}${j}`, 7);
  }
  // Side and rear wall boards, leaving the front readable as an entrance.
  box([0.98, 1.10, 0.10], timber, [hutX, 0.88, hutZ - 0.49], "hutBackWall");
  box([0.10, 1.10, 1.02], timber, [hutX - 0.67, 0.88, hutZ], "hutLeftWall");
  box([0.10, 1.10, 1.02], timber, [hutX + 0.67, 0.88, hutZ], "hutRightWall");
  box([0.52, 0.22, 0.10], timber, [hutX - 0.30, 1.39, hutZ + 0.49], "hutFrontLintel");
  box([0.22, 0.98, 0.10], timber, [hutX - 0.63, 0.87, hutZ + 0.49], "hutDoorLeft");
  box([0.22, 0.98, 0.10], timber, [hutX + 0.30, 0.87, hutZ + 0.49], "hutDoorRight");
  box([0.46, 0.80, 0.055], INK, [hutX - 0.01, 0.84, hutZ + 0.555], "hutDoorVoid");
  // Door planks, iron straps, and a tusk-shaped handle.
  for (let i = 0; i < 4; i++) box([0.105, 0.72, 0.018], WOOD_DARK, [hutX - 0.18 + i * 0.12, 0.82, hutZ + 0.592], `doorPlank${i}`);
  for (const y of [0.52, 1.10]) box([0.54, 0.045, 0.025], wornIron, [hutX - 0.01, y, hutZ + 0.61], `doorIronBand${y}`);
  sphere(0.04, BRASS, [hutX + 0.16, 0.84, hutZ + 0.63], "doorKnob", 8);
  // Crossed support timbers on the side.
  box([0.12, 1.24, 0.12], timber, [hutX - 0.70, 0.9, hutZ], "hutBraceA", [0, 0, -34]);
  box([0.12, 1.24, 0.12], timber, [hutX + 0.70, 0.9, hutZ], "hutBraceB", [0, 0, 34]);
  // Roof panels and thick ridge.
  box([0.88, 0.13, 1.34], thatch, [hutX - 0.35, 1.72, hutZ], "thatchRoofLeft", [0, 0, 34]);
  box([0.88, 0.13, 1.34], thatch, [hutX + 0.35, 1.72, hutZ], "thatchRoofRight", [0, 0, -34]);
  cyl(0.105, 1.22, WOOD_LIGHT, [hutX, 2.04, hutZ], "roofRidge", 8, [0, 0, 1]);
  for (let i = 0; i < 7; i++) {
    const z = hutZ - 0.53 + i * 0.18;
    box([0.10, 0.17, 0.28], ROOF_LIGHT, [hutX - 0.51, 1.78, z], `thatchTuftL${i}`, [0, 0, 34]);
    box([0.10, 0.17, 0.28], ROOF_LIGHT, [hutX + 0.51, 1.78, z], `thatchTuftR${i}`, [0, 0, -34]);
  }
  // Painted war marks above the door: a crude ochre chevron and riveted trim.
  box([0.025, 0.29, 0.028], OCHRE, [hutX - 0.13, 1.30, hutZ + 0.63], "hutWarMarkL", [0, 0, -42]);
  box([0.025, 0.29, 0.028], OCHRE, [hutX + 0.13, 1.30, hutZ + 0.63], "hutWarMarkR", [0, 0, 42]);
  for (let i = 0; i < 8; i++) sphere(0.018, BRASS, [hutX - 0.57 + (i % 2) * 1.14, 0.45 + Math.floor(i / 2) * 0.26, hutZ + 0.57], `hutRivet${i}`, 6);

  // Two war banners on rough poles, with spearheads and dangling cords.
  for (const side of [-1, 1]) {
    const x = side * 1.18;
    cyl(0.045, 1.82, timber, [x, 1.05, 0.32], `bannerPole${side}`, 8);
    cone(0.14, 0.34, wornIron, [x, 2.13, 0.32], `bannerSpear${side}`, 6);
    sphere(0.065, BRASS, [x, 1.88, 0.32], `bannerTopRing${side}`, 8);
    b.extrude(
      [[0, 0], [0.47, 0], [0.42, 0.60], [0.27, 0.52], [0.12, 0.62], [0, 0.44, "sharp"]],
      { at: [x - 0.235, 1.53, 0.32], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035, bevel: 0.008, color: hide, name: `warBanner${side}` },
    );
    box([0.035, 0.56, 0.045], RED_LIGHT, [x - side * 0.01, 1.51, 0.35], `bannerStripe${side}`, [0, side * 0, side * 18]);
    for (let i = 0; i < 4; i++) {
      const z = 0.07 + i * 0.11;
      b.sweep([[x - 0.20, 1.53, z], [x - 0.20, 1.33, z - 0.04]], 0.009, { color: BONE, caps: "point", name: `bannerTassel${side}${i}`, bone: root });
    }
  }

  // Totem poles with crude stacked masks, tusks, and a third squat shrine.
  const totems: Array<[number, number, number]> = [[1.10, 0.35, -0.77], [-1.17, 0.36, -0.73], [0.78, 0.34, 0.95]];
  totems.forEach(([x, y, z], ti) => {
    cyl(0.105, ti === 2 ? 1.05 : 1.34, timber, [x, y + (ti === 2 ? 0.52 : 0.67), z], `totemPole${ti}`, 8);
    const levels = ti === 2 ? 2 : 3;
    for (let k = 0; k < levels; k++) {
      const yy = y + 0.48 + k * 0.35;
      box([0.30 - k * 0.018, 0.28, 0.22], ti === 2 ? WOOD_LIGHT : ORC_DARK, [x, yy, z], `totemMask${ti}${k}`);
      box([0.22, 0.045, 0.03], ORC_GREEN, [x, yy + 0.02, z + 0.12], `totemBrow${ti}${k}`);
      for (const s of [-1, 1]) {
        cone(0.042, 0.18, BONE, [x + s * 0.08, yy - 0.08, z + 0.14], `totemTusk${ti}${k}${s}`, 6, [s * 0.35, -0.92, 0.08]);
        sphere(0.026, EMBER, [x + s * 0.055, yy + 0.04, z + 0.13], `totemEye${ti}${k}${s}`, 6);
      }
    }
    cone(0.17, 0.25, BONE_DARK, [x, y + (ti === 2 ? 1.18 : 1.66), z], `totemCrown${ti}`, 6);
  });

  // Foreground fire pit: stones, crossed logs, charcoal, layered flame and smoke.
  const fireX = 0.36;
  const fireZ = 0.87;
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    const r = 0.39 + (i % 2) * 0.025;
    const p: [number, number, number] = [fireX + Math.cos(a) * r, 0.33, fireZ + Math.sin(a) * r * 0.72];
    sphere(0.13, i % 3 ? stone : BONE_DARK, p, `fireStone${i}`, 7);
  }
  b.capsule([fireX - 0.30, 0.43, fireZ - 0.11], [fireX + 0.31, 0.46, fireZ + 0.13], 0.075, { color: timber, bone: root, name: "fireLogA", section: { ngon: 6 } });
  b.capsule([fireX - 0.28, 0.45, fireZ + 0.12], [fireX + 0.29, 0.42, fireZ - 0.12], 0.075, { color: timber, bone: root, name: "fireLogB", section: { ngon: 6 } });
  glow(part(new THREE.ConeGeometry(0.28, 0.70, 7), FIRE_OUTER, [fireX, 0.82, fireZ], "flameOuter"), 1.7);
  glow(part(new THREE.ConeGeometry(0.15, 0.48, 7), FIRE, [fireX, 0.77, fireZ + 0.015], "flameInner"), 2.2);
  cone(0.075, 0.34, FIRE, [fireX - 0.15, 0.70, fireZ + 0.08], "flameLickL", 6, [-0.24, 0.96, 0.1]);
  cone(0.07, 0.31, emberPaint, [fireX + 0.16, 0.72, fireZ - 0.05], "flameLickR", 6, [0.2, 0.96, -0.08]);
  sphere(0.07, SMOKE, [fireX + 0.05, 1.32, fireZ - 0.02], "smokePuffA", 7);
  sphere(0.10, SMOKE, [fireX - 0.03, 1.52, fireZ + 0.02], "smokePuffB", 7);
  sphere(0.13, SMOKE, [fireX + 0.09, 1.72, fireZ + 0.04], "smokePuffC", 7);

  // Leaning spears and an axe rack behind the fire.
  const spearData: Array<[number, number, number, number]> = [[-0.95, 0.55, 0.94, -17], [-0.75, 0.51, 1.00, 13], [1.25, 0.48, 0.88, 21]];
  spearData.forEach(([x, y, z, rot], i) => {
    cyl(0.025, 1.18, timber, [x, y + 0.51, z], `spearShaft${i}`, 6, [Math.sin(rot * Math.PI / 180), Math.cos(rot * Math.PI / 180), 0]);
    cone(0.08, 0.24, wornIron, [x + Math.sin(rot * Math.PI / 180) * 0.58, y + 1.15, z], `spearHead${i}`, 6, [Math.sin(rot * Math.PI / 180), Math.cos(rot * Math.PI / 180), 0]);
    sphere(0.045, RED, [x - Math.sin(rot * Math.PI / 180) * 0.25, y + 0.72, z], `spearWrap${i}`, 7);
  });
  box([0.62, 0.07, 0.07], timber, [0.28, 0.58, -0.74], "axeRackBeam");
  for (let i = 0; i < 3; i++) {
    const x = 0.06 + i * 0.22;
    cyl(0.018, 0.74, WOOD_LIGHT, [x, 0.90, -0.74], `axeHandle${i}`, 6);
    b.extrude([[0, 0], [0.18, 0.03], [0.15, 0.25], [0.03, 0.29]], { at: [x - 0.075, 1.20, -0.74], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.025, bevel: 0.005, color: wornIron, name: `axeHead${i}` });
  }

  // Bone charms, a hide drum, and bedroll beside the hut.
  b.sweep([[0.95, 0.38, 0.10], [1.05, 0.57, 0.12], [1.15, 0.38, 0.10]], 0.024, { color: BONE, caps: "point", name: "boneCharm", bone: root });
  cyl(0.23, 0.28, hide, [-1.05, 0.43, 0.62], "warDrum", 10, [0, 0, 1]);
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    sphere(0.025, BRASS, [-1.05 + Math.cos(a) * 0.20, 0.43 + Math.sin(a) * 0.20, 0.78], `drumStud${i}`, 6);
  }
  box([0.60, 0.18, 0.34], WOOD_DARK, [-1.02, 0.33, -0.18], "bedrollBody");
  cyl(0.19, 0.62, hide, [-1.02, 0.47, -0.18], "bedrollBlanket", 8, [1, 0, 0]);
  for (let i = 0; i < 5; i++) box([0.025, 0.16, 0.36], OCHRE, [-1.26 + i * 0.12, 0.48, -0.18], `bedrollStitch${i}`);

  // A few bright metal studs and red paint accents unify the Blizzard-style palette.
  for (let i = 0; i < 10; i++) {
    const x = -1.20 + (i % 5) * 0.60;
    const z = -1.15 + Math.floor(i / 5) * 0.12;
    sphere(0.026, BRASS, [x, 0.30, z], `rimRivet${i}`, 6);
  }
  // A tiny hanging lantern under the hut eave, self-lit amber.
  glow(part(new THREE.SphereGeometry(0.062, 8, 6), FIRE, [hutX + 0.46, 1.28, hutZ + 0.62], "lanternGlow"), 1.8);
  cyl(0.025, 0.15, BRASS, [hutX + 0.46, 1.43, hutZ + 0.62], "lanternHook", 6);
  return b.root;
}
