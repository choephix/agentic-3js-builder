import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Fill } from "../src/context";
import { frame } from "../src/frame";
import { svg } from "../src/texture";
import { cel, inkLines, INK } from "../kits/toon";
import { glow } from "../kits/glow";

const WOOD = cel("#8b4a32", "#54293a");
const WOOD_LIGHT = cel("#c47748", "#7a3440");
const WOOD_GOLD = cel("#e2a04d", "#9b4b36");
const BRASS = cel("#f1c45b", "#a86836");
const BRASS_DARK = cel("#b8793f", "#673747");
const PAPER = cel("#fff0bd", "#d6a067");
const PAPER_DARK = cel("#dca66a", "#8c4d44");
const GLASS = cel("#b7f5e3", "#4c9d98");
const PLUM = cel("#7d3f91", "#401f61");
const TEAL = cel("#45e0d0", "#197a91");
const AMBER = cel("#ffc84f", "#b65431");
const ROSE = cel("#f36a9c", "#913c68");
const BLUE = cel("#6bb8ff", "#3459a1");
const MOSS = cel("#73b85b", "#376b56");
const LEAF = cel("#a8d86d", "#4f8553");
const INK_PAINT = inkLines(WOOD_LIGHT, { levels: [0.15], axis: [0, 1, 0], width: 0.08, ink: INK });

const LABEL = svg(
  `<svg viewBox="0 0 96 64"><rect width="96" height="64" rx="8" fill="#f8e7ad"/><path d="M8 48 Q24 12 48 34 T88 16" fill="none" stroke="#7d3f91" stroke-width="5"/><circle cx="48" cy="31" r="11" fill="none" stroke="#c07c45" stroke-width="4"/><path d="M48 14v34M31 31h34" stroke="#c07c45" stroke-width="3"/><circle cx="17" cy="15" r="4" fill="#45e0d0"/><circle cx="78" cy="48" r="4" fill="#f36a9c"/></svg>`,
  { size: 192 },
);
const BOOK_SIGIL = svg(
  `<svg viewBox="0 0 96 128"><rect width="96" height="128" rx="5" fill="#54293a"/><path d="M48 16 58 43 84 48 58 56 48 112 38 56 12 48 38 43Z" fill="#f1c45b"/><circle cx="48" cy="48" r="9" fill="#45e0d0"/><path d="M21 83h54M21 94h54M21 105h35" stroke="#f8e7ad" stroke-width="4"/></svg>`,
  { size: 256 },
);
const LEAF_TEX = svg(
  `<svg viewBox="0 0 48 96"><path d="M24 94V8M24 37C8 31 3 18 7 5c14 4 21 15 17 32ZM25 63c15-5 20-18 16-31-13 4-20 15-16 31ZM24 83C10 78 4 68 7 56c12 3 19 13 17 27Z" fill="#a8d86d" stroke="#274d46" stroke-width="3"/><path d="M24 10v79" stroke="#f1c45b" stroke-width="2"/></svg>`,
  { size: 128 },
);
const RUNES = svg(
  `<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="#24163b"/><path d="M12 48 27 16l15 32 15-32 15 32 15-32 15 32" fill="none" stroke="#45e0d0" stroke-width="5"/><circle cx="27" cy="16" r="5" fill="#ffc84f"/><circle cx="102" cy="16" r="5" fill="#f36a9c"/></svg>`,
  { size: 256 },
);

export const meta = {
  name: "Alchemist's Starboard Workbench",
  description: "A richly dressed Genshin Impact-inspired alchemist workbench with glowing potions, books, scales, herbs, and hand-painted magical details.",
  style: "Genshin Impact",
  commit: "07503e3",
};

export default function build() {
  const b = createBuilder({ name: "alchemistWorkbench", detail: 0.85, paintSize: 1024 });
  const root = b.joint("workbenchRoot", { at: [0, 0, 0], role: "fan" });

  const box = (name: string, size: [number, number, number], at: [number, number, number], color: Fill, rotation?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...size), color, { bone: root, at, rotation, flat: true, name });
  const cyl = (name: string, radius: number, height: number, at: [number, number, number], color: Fill, radial = 8) =>
    b.part(new THREE.CylinderGeometry(radius, radius * 1.04, height, b.segments(radial, 0.8)), color, { bone: root, at, flat: true, name });
  const sphere = (name: string, radius: number, at: [number, number, number], color: Fill, scale?: [number, number, number]) =>
    b.part(new THREE.SphereGeometry(radius, b.segments(12, 0.8), b.segments(8, 0.8)), color, { bone: root, at, scale, flat: true, name });
  const torus = (name: string, major: number, minor: number, at: [number, number, number], color: Fill, rotation: [number, number, number] = [0, 0, 0]) =>
    b.part(new THREE.TorusGeometry(major, minor, b.segments(6, 0.8), b.segments(16, 0.75)), color, { bone: root, at, rotation, flat: true, name });

  // Main carpenter's bench: thick slab, inset aprons, joinery, and a lower shelf.
  box("benchTop", [1.9, 0.11, 0.42], [0, 1.03, 0], INK_PAINT);
  box("benchTopEdge", [1.93, 0.035, 0.46], [0, 0.91, 0], WOOD_GOLD);
  box("frontApron", [1.73, 0.16, 0.07], [0, 0.77, 0.37], WOOD_LIGHT);
  box("leftApron", [0.07, 0.16, 0.35], [0.87, 0.77, 0], WOOD_LIGHT);
  box("rightApron", [0.07, 0.16, 0.35], [-0.87, 0.77, 0], WOOD_LIGHT);
  box("lowerShelf", [1.55, 0.08, 0.33], [0, 0.30, -0.01], WOOD);
  box("lowerShelfLip", [1.62, 0.04, 0.37], [0, 0.39, 0.30], WOOD_GOLD);
  for (const x of [-0.78, 0.78]) {
    box(`legFront${x}`, [0.13, 0.76, 0.13], [x, 0.42, 0.29], WOOD_LIGHT, [0, x * 0.012, 0]);
    box(`legBack${x}`, [0.13, 0.76, 0.13], [x, 0.42, -0.29], WOOD);
    cyl(`foot${x}`, 0.16, 0.08, [x, 0.045, 0.29], BRASS_DARK, 8);
    torus(`legCollar${x}`, 0.13, 0.018, [x, 0.70, 0.29], BRASS);
  }
  for (const x of [-0.78, -0.52, -0.26, 0, 0.26, 0.52, 0.78]) {
    sphere(`frontRivet${x}`, 0.022, [x, 0.77, 0.45], BRASS);
  }
  for (const x of [-0.78, 0.78]) {
    box(`drawer${x}`, [0.34, 0.15, 0.045], [x, 0.65, 0.43], WOOD_GOLD);
    box(`drawerInset${x}`, [0.27, 0.095, 0.012], [x, 0.65, 0.48], WOOD);
    torus(`drawerHandle${x}`, 0.045, 0.012, [x, 0.66, 0.505], BRASS, [90, 0, 0]);
  }

  // Backboard and a small apothecary hutch with two shelves.
  box("backboard", [0.92, 0.70, 0.055], [0, 1.48, -0.34], WOOD);
  box("backboardInset", [0.80, 0.56, 0.012], [0, 1.48, -0.402], PAPER_DARK);
  b.part(new THREE.PlaneGeometry(0.70, 0.34), "#ffffff", { bone: root, at: [0, 1.53, -0.418], dir: [0, 0, -1], axis: "z", texture: RUNES, name: "backboardRunes" });
  for (const x of [-0.87, 0.87]) {
    box(`hutchPost${x}`, [0.10, 0.93, 0.12], [x, 1.43, -0.30], WOOD_LIGHT);
    torus(`postCap${x}`, 0.11, 0.022, [x, 1.88, -0.30], BRASS);
    sphere(`postFinial${x}`, 0.08, [x, 1.98, -0.30], BRASS);
  }
  for (const y of [1.24, 1.63, 1.92]) {
    box(`shelf${y}`, [0.82, 0.055, 0.28], [0, y, -0.25], WOOD_LIGHT);
    box(`shelfTrim${y}`, [0.86, 0.025, 0.035], [0, y - 0.07, 0.02], WOOD_GOLD);
  }
  box("hutchCrown", [1.04, 0.10, 0.35], [0, 2.02, -0.25], WOOD_GOLD);
  b.rod([-0.82, 2.10, 0.08], [0.82, 2.10, 0.08], 0.018, { color: BRASS, bone: root, name: "crownFiligree" });
  for (const x of [-0.65, -0.38, -0.11, 0.16, 0.43, 0.70]) {
    sphere(`crownBead${x}`, 0.027, [x, 2.07, 0.10], AMBER);
  }

  // Painted potion bottles, each with a neck, stopper, gold ring, and alchemical label.
  const bottle = (id: string, x: number, y: number, z: number, color: Fill, liquid: string, scale = 1) => {
    const body = sphere(`${id}Bottle`, 0.105 * scale, [x, y, z], color, [1.0, 1.12, 0.82]);
    const fluid = cyl(`${id}Glow`, 0.073 * scale, 0.10 * scale, [x, y - 0.025 * scale, z + 0.008], liquid, 10);
    glow(fluid, 1.35);
    cyl(`${id}Neck`, 0.038 * scale, 0.105 * scale, [x, y + 0.105 * scale, z], GLASS, 8);
    cyl(`${id}Cork`, 0.045 * scale, 0.035 * scale, [x, y + 0.175 * scale, z], WOOD_GOLD, 8);
    torus(`${id}Ring`, 0.048 * scale, 0.009 * scale, [x, y + 0.13 * scale, z], BRASS);
    b.part(new THREE.PlaneGeometry(0.105 * scale, 0.067 * scale), "#ffffff", { bone: root, at: [x, y - 0.005 * scale, z + 0.083 * scale], dir: [0, 0, 1], axis: "z", texture: LABEL, name: `${id}Label` });
    return body;
  };
  bottle("violet", -0.82, 1.22, 0.12, PLUM, "#e879c4", 1.08);
  bottle("teal", -0.62, 1.21, 0.12, TEAL, "#63fff0", 0.90);
  bottle("amber", -0.40, 1.20, 0.12, AMBER, "#fff0a0", 1.16);
  bottle("rose", 0.52, 1.20, 0.12, ROSE, "#ffb4d8", 1.06);
  bottle("azure", 0.72, 1.22, 0.12, BLUE, "#9fd9ff", 0.92);
  bottle("emerald", 0.90, 1.20, 0.12, MOSS, "#c2ff88", 0.80);
  bottle("shelfVial", -0.52, 1.41, -0.18, TEAL, "#8afffa", 0.62);
  bottle("shelfVialTwo", 0.52, 1.40, -0.18, PLUM, "#f5a0ff", 0.64);
  bottle("shelfVialThree", 0.28, 1.79, -0.18, AMBER, "#fff1a0", 0.56);
  bottle("shelfVialFour", -0.26, 1.79, -0.18, ROSE, "#ffd0dc", 0.58);

  // Books: colorful stacked spellbooks with pages, spine ribs and sigil plates.
  const book = (id: string, x: number, y: number, z: number, size: [number, number, number], cover: Fill, angle = 0) => {
    box(`${id}Cover`, size, [x, y, z], cover, [0, angle, 0]);
    box(`${id}Pages`, [size[0] * 0.88, size[1] * 0.82, size[2] + 0.008], [x, y + 0.008, z + 0.008], PAPER, [0, angle, 0]);
    box(`${id}Spine`, [size[0] * 0.10, size[1] * 0.9, size[2] * 1.08], [x - size[0] * 0.43, y + 0.01, z + 0.012], BRASS_DARK, [0, angle, 0]);
    for (const dz of [-size[2] * 0.32, 0, size[2] * 0.32]) {
      torus(`${id}Rib${dz}`, 0.028, 0.008, [x - size[0] * 0.43, y + 0.01, z + dz], BRASS, [0, 90, 0]);
    }
    b.part(new THREE.PlaneGeometry(size[0] * 0.60, size[1] * 0.62), "#ffffff", { bone: root, at: [x, y + size[1] * 0.54, z + size[2] * 0.50], dir: [0, 0, 1], axis: "z", texture: BOOK_SIGIL, name: `${id}Sigil` });
  };
  book("bookBlue", -0.76, 1.22, -0.16, [0.40, 0.065, 0.28], BLUE, -0.07);
  book("bookRose", -0.72, 1.31, -0.16, [0.40, 0.065, 0.28], ROSE, 0.05);
  book("bookPlum", 0.72, 1.20, -0.15, [0.45, 0.070, 0.30], PLUM, -0.10);
  book("bookAmber", 0.76, 1.31, -0.15, [0.44, 0.065, 0.29], AMBER, 0.06);
  book("bookShelf", -0.68, 1.39, -0.18, [0.30, 0.05, 0.20], MOSS, 0.03);

  // Ornate balance scale, centered behind the mortar.
  cyl("scaleFoot", 0.16, 0.045, [0.10, 1.14, 0.04], BRASS_DARK, 10);
  cyl("scaleStem", 0.045, 0.30, [0.10, 1.31, 0.04], BRASS, 8);
  sphere("scaleHub", 0.065, [0.10, 1.47, 0.04], BRASS);
  b.rod([-0.40, 1.47, 0.04], [0.60, 1.47, 0.04], 0.024, { color: BRASS, bone: root, name: "scaleBeam" });
  for (const x of [-0.32, 0.52]) {
    b.rod([x, 1.47, 0.04], [x, 1.27, 0.04], 0.010, { color: BRASS_DARK, bone: root, name: `scaleChain${x}` });
    b.rod([x - 0.06, 1.37, 0.04], [x + 0.06, 1.37, 0.04], 0.009, { color: BRASS_DARK, bone: root, name: `scaleChainCross${x}` });
    sphere(`scalePan${x}`, 0.11, [x, 1.23, 0.04], BRASS, [1.2, 0.25, 1.0]);
    torus(`scalePanRim${x}`, 0.105, 0.012, [x, 1.255, 0.04], BRASS_DARK, [90, 0, 0]);
  }
  sphere("scaleCounterweight", 0.055, [0.48, 1.51, 0.04], AMBER);

  // Mortar, pestle and a little brass alchemical burner in the foreground.
  cyl("mortarBody", 0.19, 0.16, [-0.05, 1.17, 0.27], BRASS_DARK, 10);
  cyl("mortarBowl", 0.16, 0.06, [-0.05, 1.27, 0.27], WOOD_GOLD, 10);
  torus("mortarRim", 0.16, 0.018, [-0.05, 1.30, 0.27], BRASS);
  b.sweep([[0.03, 1.29, 0.27], [0.23, 1.57, 0.25], [0.30, 1.70, 0.24]], [0.038, 0.026], { color: WOOD_LIGHT, section: { ngon: 6 }, caps: "round", bone: root, name: "pestle" });
  cyl("burner", 0.13, 0.11, [0.45, 1.16, 0.27], BRASS, 8);
  torus("burnerRim", 0.12, 0.015, [0.45, 1.22, 0.27], BRASS_DARK);
  const flame = sphere("burnerFlame", 0.065, [0.45, 1.29, 0.27], "#63fff0", [0.70, 1.35, 0.70]);
  glow(flame, 2.2);

  // Herb bundles in the shelves: stems, leaves and hanging seed charms.
  for (const [x, y, z, h] of [[-0.48, 1.28, -0.18, 0.22], [0.46, 1.28, -0.18, 0.28], [-0.08, 1.67, -0.18, 0.24], [0.48, 1.67, -0.18, 0.20]] as [number, number, number, number][]) {
    b.rod([x, y, z], [x + 0.015, y + h, z], 0.009, { color: MOSS, bone: root, name: `herbStem${x}${y}` });
    const fs = [-1, 1, -0.55, 0.55];
    const herbFrames = fs.map((s, i) =>
      frame([x + s * 0.035, y + h * (0.20 + i * 0.17), z + 0.012 * i], [0, 1, 0]),
    );
    b.cards(herbFrames, LEAF_TEX, {
      size: [0.045, 0.12],
      lean: 18,
      flow: [0, 0, 1],
      mirror: true,
      color: LEAF,
    });
    for (const dz of [-0.035, 0.035]) sphere(`herbSeed${x}${y}${dz}`, 0.015, [x + dz, y + h + 0.015, z], AMBER);
  }

  // A foreground ribbon, loose quill and ink pot tell a small story on the bench.
  b.sweep([[0.55, 1.14, 0.30], [0.72, 1.10, 0.40], [0.84, 1.13, 0.32], [0.92, 1.10, 0.42]], [0.018, 0.008], { color: ROSE, section: { ngon: 5 }, caps: "round", bone: root, name: "ribbon" });
  cyl("inkPot", 0.09, 0.11, [-0.47, 1.16, 0.31], PLUM, 8);
  torus("inkPotRim", 0.08, 0.012, [-0.47, 1.22, 0.31], BRASS);
  b.sweep([[-0.44, 1.22, 0.33], [-0.30, 1.43, 0.41], [-0.20, 1.60, 0.46]], [0.012, 0.004], { color: PAPER_DARK, caps: "point", bone: root, name: "quill" });
  for (const s of [-1, 1]) {
    b.cards([frame([-0.37 + s * 0.015, 1.30 + Math.abs(s) * 0.01, 0.39], [0, 0, 1])], LEAF_TEX, { size: [0.035, 0.10], lean: s * 55, flow: [1, 0, 0], color: PAPER });
  }

  // Brass corner ornaments and tassels finish the hutch silhouette.
  for (const x of [-0.78, 0.78]) {
    torus(`ornament${x}`, 0.10, 0.014, [x, 1.86, 0.02], BRASS, [90, 0, 0]);
    b.rod([x - 0.07, 1.86, 0.03], [x + 0.07, 1.86, 0.03], 0.010, { color: BRASS, bone: root, name: `ornamentBar${x}` });
    for (const dz of [-0.04, 0, 0.04]) {
      cyl(`tassel${x}${dz}`, 0.009, 0.11, [x + dz, 1.72, 0.03], ROSE, 5);
      sphere(`tasselTip${x}${dz}`, 0.014, [x + dz, 1.65, 0.03], BRASS);
    }
  }

  return b.root;
}
