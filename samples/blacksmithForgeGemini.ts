import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { glow } from "../kits/glow";

export const meta = {
  name: "Blacksmith's Forge · Gemini",
  builtBy: "Gemini 3.8 Flash",
  description:
    "A medieval blacksmith's forge tabletop diorama on a timber plinth: stone hearth with glowing embers and chimney hood, operable leather bellows, steel anvil on an oak stump, quench barrel with steaming water, tool racks with tongs and hammers, glowing half-forged sword, workbench with vices, horseshoes, firewood stack, oil lantern, and swinging wrought-iron shop sign.",
};

// --- Color Palette ---
const C_STONE_DARK = "#3a3835";
const C_STONE_MID = "#585550";
const C_BRICK = "#7a483b";
const C_BRICK_DARK = "#543026";

const C_COAL_DARK = "#181412";
const C_COAL_HOT = "#ff9900";
const C_COAL_BLAZE = "#ffea66";

const C_IRON_DARK = "#222428";
const C_IRON_MID = "#3c3f46";
const C_STEEL = "#68707d";
const C_STEEL_BRIGHT = "#9aa5b5";

const C_HOT_IRON_BODY = "#ff9a1a";
const C_HOT_IRON_BASE = "#cc3300";

const C_WOOD_OAK = "#4a3321";
const C_WOOD_DARK = "#2e1e12";
const C_WOOD_PLANK = "#63472e";
const C_WOOD_BARK = "#332417";
const C_WOOD_SPLIT = "#8c6c4c";

const C_LEATHER = "#6e3f23";
const C_LEATHER_DARK = "#4a2814";
const C_BRASS = "#b8903b";

const C_WATER_MURKY = "#1f3b3d";
const C_PLINTH_DARK = "#1a120c";
const C_PLINTH_LIGHT = "#2a1e15";
const C_FLAGSTONE = "#4e4c47";
const C_DIRT = "#362a20";

export default function build() {
  const b = createBuilder({ name: "blacksmithForgeGemini", paintSize: 1024 });
  const R = rng(42);

  // --- SKELETON & JOINTS ---
  // Root on floor y=0
  const root = b.joint("root", { at: [0, 0, 0] });

  // Movable joints for animation/posing:
  // 1. Bellows lever & upper paddle hinge
  // Pivot placed right at the nozzle neck where the paddle hinges
  const bellowsHinge = b.joint("bellowsHinge", {
    parent: root,
    at: [-0.46, 0.44, -0.22],
    dir: [0, 0, 1],
  });

  // 2. Shop sign hanging pivot
  // Pivot placed at the top suspension ring of the sign
  const signPivot = b.joint("signPivot", {
    parent: root,
    at: [0.34, 1.05, -0.42],
    dir: [0, 1, 0],
  });

  // --- 1. DIORAMA BASE & PLINTH ---
  // Octagonal wooden plinth, 1.48m wide, ~0.08m tall
  const plinthRadius = 0.74;
  const plinthHeight = 0.08;
  const plinthGeo = new THREE.CylinderGeometry(plinthRadius, plinthRadius * 1.03, plinthHeight, 8);
  plinthGeo.rotateY(Math.PI / 8);
  plinthGeo.translate(0, plinthHeight / 2, 0);
  b.part(plinthGeo, C_PLINTH_DARK, { bone: root, at: [0, 0, 0] });

  // Plinth moulding rim
  const plinthRimGeo = new THREE.CylinderGeometry(plinthRadius * 1.015, plinthRadius * 1.035, 0.02, 8);
  plinthRimGeo.rotateY(Math.PI / 8);
  plinthRimGeo.translate(0, plinthHeight * 0.85, 0);
  b.part(plinthRimGeo, C_PLINTH_LIGHT, { bone: root, at: [0, 0, 0] });

  // Diorama floor: Flagstones, cobblestone, packed dirt on top of plinth
  const floorGeo = new THREE.CylinderGeometry(plinthRadius * 0.98, plinthRadius * 0.98, 0.015, 8);
  floorGeo.rotateY(Math.PI / 8);
  floorGeo.translate(0, plinthHeight + 0.0075, 0);
  b.part(floorGeo, C_DIRT, { bone: root, at: [0, 0, 0] });

  // Flagstone paving tiles around forge and anvil
  const flagstones: THREE.BufferGeometry[] = [];
  const stonePositions: [number, number, number, number, number][] = [
    // [x, z, sx, sz, rot]
    [0.0, 0.1, 0.22, 0.18, 0.1],
    [-0.15, 0.0, 0.2, 0.24, -0.2],
    [0.18, 0.05, 0.22, 0.2, 0.15],
    [-0.05, -0.15, 0.26, 0.2, 0.05],
    [0.15, -0.18, 0.2, 0.22, -0.1],
    [-0.22, -0.28, 0.24, 0.18, 0.2],
    [0.02, -0.32, 0.22, 0.2, -0.05],
    [-0.32, 0.15, 0.18, 0.22, 0.3],
    [-0.12, 0.25, 0.2, 0.18, -0.15],
    [0.12, 0.28, 0.22, 0.2, 0.08],
    [0.32, 0.18, 0.18, 0.22, -0.2],
    [-0.3, -0.1, 0.2, 0.2, 0.12],
    [0.3, -0.1, 0.22, 0.18, -0.15],
  ];

  for (const [x, z, sx, sz, rot] of stonePositions) {
    const tile = new THREE.BoxGeometry(sx, 0.012, sz);
    tile.rotateY(rot);
    tile.translate(x, plinthHeight + 0.015, z);
    flagstones.push(tile);
  }
  b.part(mergeGeometries(flagstones), C_FLAGSTONE, { bone: root, at: [0, 0, 0] });

  // --- 2. STONE FORGE HEARTH & CHIMNEY ---
  // Hearth position: located rear-left at x ~ -0.32, z ~ -0.28
  const hX = -0.34;
  const hZ = -0.3;
  const hBaseY = plinthHeight + 0.015;

  // Forge stone masonry blocks
  const forgeStones: THREE.BufferGeometry[] = [];
  const forgeStonesDark: THREE.BufferGeometry[] = [];

  // Main hearth base table (hollow top for burning bed)
  const hearthBase = new THREE.BoxGeometry(0.52, 0.44, 0.48);
  hearthBase.translate(hX, hBaseY + 0.22, hZ);
  forgeStones.push(hearthBase);

  // Stepped rustic stone trim / courses around hearth base
  for (let layer = 0; layer < 4; layer++) {
    const ly = hBaseY + layer * 0.11 + 0.05;
    for (const sx of [-0.25, 0.25]) {
      const stoneBlock = new THREE.BoxGeometry(0.04, 0.09, 0.2 + (layer % 2) * 0.08);
      stoneBlock.translate(hX + sx * 1.02, ly, hZ + (layer % 2 ? 0.05 : -0.05));
      (layer % 2 === 0 ? forgeStonesDark : forgeStones).push(stoneBlock);
    }
    for (const sz of [-0.23, 0.23]) {
      const stoneBlock = new THREE.BoxGeometry(0.24 + (layer % 2) * 0.06, 0.09, 0.04);
      stoneBlock.translate(hX + (layer % 2 ? -0.06 : 0.06), ly, hZ + sz * 1.02);
      (layer % 2 === 1 ? forgeStonesDark : forgeStones).push(stoneBlock);
    }
  }

  // Stone rim curb around hearth pit
  const curbFront = new THREE.BoxGeometry(0.48, 0.08, 0.08);
  curbFront.translate(hX, hBaseY + 0.44 + 0.04, hZ + 0.2);
  forgeStones.push(curbFront);

  const curbLeft = new THREE.BoxGeometry(0.08, 0.08, 0.4);
  curbLeft.translate(hX - 0.22, hBaseY + 0.44 + 0.04, hZ);
  forgeStones.push(curbLeft);

  const curbRight = new THREE.BoxGeometry(0.08, 0.08, 0.4);
  curbRight.translate(hX + 0.22, hBaseY + 0.44 + 0.04, hZ);
  forgeStones.push(curbRight);

  // Firebox pit floor lining (firebrick)
  const fireboxLining = new THREE.BoxGeometry(0.38, 0.04, 0.34);
  fireboxLining.translate(hX, hBaseY + 0.42, hZ - 0.02);
  b.part(fireboxLining, C_BRICK, { bone: root, at: [0, 0, 0] });

  // Forge hood & chimney arch
  // Rear stone wall behind hearth rising up to chimney
  const rearWall = new THREE.BoxGeometry(0.56, 0.65, 0.14);
  rearWall.translate(hX, hBaseY + 0.44 + 0.325, hZ - 0.2);
  forgeStones.push(rearWall);

  // Forge hood (tapered masonry canopy)
  const hoodPillarsL = new THREE.BoxGeometry(0.08, 0.35, 0.1);
  hoodPillarsL.translate(hX - 0.21, hBaseY + 0.48 + 0.175, hZ + 0.12);
  forgeStones.push(hoodPillarsL);

  const hoodPillarsR = new THREE.BoxGeometry(0.08, 0.35, 0.1);
  hoodPillarsR.translate(hX + 0.21, hBaseY + 0.48 + 0.175, hZ + 0.12);
  forgeStones.push(hoodPillarsR);

  // Hood lintel arch
  const lintel = new THREE.BoxGeometry(0.54, 0.09, 0.12);
  lintel.translate(hX, hBaseY + 0.83 + 0.045, hZ + 0.12);
  forgeStonesDark.push(lintel);

  // Pyramidal stone hood gathering smoke
  const hoodCanopy = new THREE.CylinderGeometry(0.18, 0.32, 0.28, 4);
  hoodCanopy.rotateY(Math.PI / 4);
  hoodCanopy.translate(hX, hBaseY + 0.92 + 0.14, hZ - 0.04);
  forgeStones.push(hoodCanopy);

  // Tall chimney stack rising up
  const chimneyStack = new THREE.BoxGeometry(0.32, 0.5, 0.28);
  chimneyStack.translate(hX, hBaseY + 1.2 + 0.25, hZ - 0.04);
  forgeStones.push(chimneyStack);

  // Chimney cap cornice
  const chimneyCap = new THREE.BoxGeometry(0.38, 0.06, 0.34);
  chimneyCap.translate(hX, hBaseY + 1.45 + 0.03, hZ - 0.04);
  forgeStonesDark.push(chimneyCap);

  // Chimney clay flue pot
  const fluePot = new THREE.CylinderGeometry(0.1, 0.11, 0.16, 8);
  fluePot.translate(hX, hBaseY + 1.48 + 0.08, hZ - 0.04);
  b.part(fluePot, C_BRICK_DARK, { bone: root, at: [0, 0, 0] });

  b.part(mergeGeometries(forgeStones), C_STONE_MID, { bone: root, at: [0, 0, 0] });
  b.part(mergeGeometries(forgeStonesDark), C_STONE_DARK, { bone: root, at: [0, 0, 0] });

  // Iron hood support bracket & rivets
  const hoodBandGeo = new THREE.BoxGeometry(0.55, 0.03, 0.14);
  hoodBandGeo.translate(hX, hBaseY + 0.86, hZ + 0.12);
  b.part(hoodBandGeo, C_IRON_DARK, { bone: root, at: [0, 0, 0] });

  // --- 3. GLOWING COALS, EMBERS & FLAMES ---
  const coalDarkList: THREE.BufferGeometry[] = [];
  const coalGlowHot: THREE.BufferGeometry[] = [];
  const coalGlowBlaze: THREE.BufferGeometry[] = [];

  // Irregular bed of glowing charcoal and burning embers
  const coalBedCenter = [hX, hBaseY + 0.45, hZ - 0.02];
  for (let i = 0; i < 38; i++) {
    const ang = R() * Math.PI * 2;
    const rad = Math.sqrt(R()) * 0.15;
    const cx = coalBedCenter[0] + Math.cos(ang) * rad * 1.1;
    const cz = coalBedCenter[2] + Math.sin(ang) * rad * 0.9;
    const cy = coalBedCenter[1] + 0.01 + (1 - rad / 0.16) * 0.04 + (R() - 0.5) * 0.02;

    const rSize = 0.02 + R() * 0.025;
    const lump = new THREE.BoxGeometry(rSize, rSize * 0.8, rSize);
    lump.rotateX(R() * 3);
    lump.rotateY(R() * 3);
    lump.translate(cx, cy, cz);

    if (rad < 0.07) {
      if (R() < 0.55) {
        coalGlowBlaze.push(lump);
      } else {
        coalGlowHot.push(lump);
      }
    } else if (rad < 0.12) {
      if (R() < 0.5) {
        coalGlowHot.push(lump);
      } else {
        coalDarkList.push(lump);
      }
    } else {
      coalDarkList.push(lump);
    }
  }

  // Licking flame sparks/tongues in the heart of forge
  for (let f = 0; f < 6; f++) {
    const fx = coalBedCenter[0] + (R() - 0.5) * 0.08;
    const fz = coalBedCenter[2] + (R() - 0.5) * 0.08;
    const fy = coalBedCenter[1] + 0.03;
    const fHeight = 0.06 + R() * 0.07;
    const flameGeo = new THREE.ConeGeometry(0.018 + R() * 0.01, fHeight, 5);
    flameGeo.rotateZ((R() - 0.5) * 0.4);
    flameGeo.rotateX((R() - 0.5) * 0.4);
    flameGeo.translate(fx, fy + fHeight / 2, fz);
    coalGlowBlaze.push(flameGeo);
  }

  b.part(mergeGeometries(coalDarkList), C_COAL_DARK, { bone: root, at: [0, 0, 0] });
  glow(b.part(mergeGeometries(coalGlowHot), C_COAL_HOT, { bone: root, at: [0, 0, 0] }), 1.6);
  glow(b.part(mergeGeometries(coalGlowBlaze), C_COAL_BLAZE, { bone: root, at: [0, 0, 0] }), 2.2);

  // --- 4. LEATHER BELLOWS (WITH OPERABLE HINGE) ---
  // Tuyere iron pipe entering forge from side
  const tuyere = new THREE.CylinderGeometry(0.02, 0.025, 0.22, 8);
  tuyere.rotateZ(Math.PI / 2);
  tuyere.translate(hX - 0.28, hBaseY + 0.43, hZ + 0.02);
  b.part(tuyere, C_IRON_DARK, { bone: root, at: [0, 0, 0] });

  // Bellows body: stationary bottom board & bracket attached to root
  const belX = -0.52;
  const belY = hBaseY + 0.32;
  const belZ = -0.22;

  // Sturdy wooden support trestle for bellows
  const belPost1 = new THREE.BoxGeometry(0.04, 0.36, 0.04);
  belPost1.translate(belX, hBaseY + 0.18, belZ - 0.09);
  const belPost2 = new THREE.BoxGeometry(0.04, 0.36, 0.04);
  belPost2.translate(belX, hBaseY + 0.18, belZ + 0.09);
  const belCross = new THREE.BoxGeometry(0.04, 0.04, 0.22);
  belCross.translate(belX, hBaseY + 0.3, belZ);
  b.part(mergeGeometries([belPost1, belPost2, belCross]), C_WOOD_DARK, { bone: root, at: [0, 0, 0] });

  // Bottom paddle / board (teardrop profile shaped)
  const belBottomBoard = new THREE.BoxGeometry(0.18, 0.025, 0.28);
  belBottomBoard.rotateX(0.05);
  belBottomBoard.translate(belX - 0.02, belY, belZ);
  const belNozzle = new THREE.ConeGeometry(0.035, 0.14, 8);
  belNozzle.rotateZ(-Math.PI / 2);
  belNozzle.translate(belX + 0.12, belY + 0.01, belZ);
  b.part(belBottomBoard, C_WOOD_OAK, { bone: root, at: [0, 0, 0] });
  b.part(belNozzle, C_BRASS, { bone: root, at: [0, 0, 0] });

  // Leather accordion ribbed body (creased folds between paddles)
  const bellowsAccordion: THREE.BufferGeometry[] = [];
  for (let rib = 0; rib < 4; rib++) {
    const f = rib / 3;
    const rGeo = new THREE.BoxGeometry(0.16 + (1 - f) * 0.02, 0.02 + f * 0.015, 0.25 - f * 0.03);
    rGeo.translate(belX - 0.02 + f * 0.03, belY + 0.025 + rib * 0.025, belZ);
    bellowsAccordion.push(rGeo);
  }
  b.part(mergeGeometries(bellowsAccordion), C_LEATHER, { bone: root, at: [0, 0, 0] });

  // Top paddle & lever attached to bellowsHinge joint!
  // Vertices positioned in model space relative to bellowsHinge
  const belTopBoard = new THREE.BoxGeometry(0.19, 0.025, 0.29);
  belTopBoard.rotateZ(-0.15);
  belTopBoard.translate(belX - 0.02, belY + 0.12, belZ);

  // Long wooden pull handle extending back
  const belHandle = new THREE.CylinderGeometry(0.015, 0.018, 0.36, 8);
  belHandle.rotateZ(Math.PI / 3.4);
  belHandle.translate(belX - 0.16, belY + 0.2, belZ);

  const bellowsUpperParts = mergeGeometries([belTopBoard, belHandle]);
  b.part(bellowsUpperParts, C_WOOD_OAK, { bone: bellowsHinge, at: [0, 0, 0] });

  // Leather hinge strap & brass decorative tacks on top board
  const strapGeo = new THREE.BoxGeometry(0.04, 0.03, 0.3);
  strapGeo.rotateZ(-0.15);
  strapGeo.translate(belX + 0.06, belY + 0.11, belZ);
  b.part(strapGeo, C_LEATHER_DARK, { bone: bellowsHinge, at: [0, 0, 0] });

  // --- 5. ANVIL ON A TREE STUMP ---
  // Positioned prominently near center-right: x ~ 0.08, z ~ 0.06
  const aX = 0.06;
  const aZ = 0.08;

  // Oak tree stump base
  const stumpHeight = 0.38;
  const stumpRadius = 0.22;
  const stumpGeo = new THREE.CylinderGeometry(stumpRadius * 0.92, stumpRadius, stumpHeight, 10);
  stumpGeo.translate(aX, hBaseY + stumpHeight / 2, aZ);
  b.part(stumpGeo, C_WOOD_BARK, { bone: root, at: [0, 0, 0] });

  // Stump top cut face (showing annual rings / lighter wood)
  const stumpTopGeo = new THREE.CylinderGeometry(stumpRadius * 0.91, stumpRadius * 0.91, 0.01, 10);
  stumpTopGeo.translate(aX, hBaseY + stumpHeight + 0.005, aZ);
  b.part(stumpTopGeo, C_WOOD_SPLIT, { bone: root, at: [0, 0, 0] });

  // Iron reinforcing bands around stump with wedges/spikes
  const stumpBand1 = new THREE.CylinderGeometry(stumpRadius * 0.99, stumpRadius * 0.99, 0.03, 10);
  stumpBand1.translate(aX, hBaseY + stumpHeight * 0.35, aZ);
  const stumpBand2 = new THREE.CylinderGeometry(stumpRadius * 0.94, stumpRadius * 0.94, 0.03, 10);
  stumpBand2.translate(aX, hBaseY + stumpHeight * 0.8, aZ);
  b.part(mergeGeometries([stumpBand1, stumpBand2]), C_IRON_DARK, { bone: root, at: [0, 0, 0] });

  // Anvil securing staples (spikes driven into stump holding anvil foot)
  const staple1 = new THREE.BoxGeometry(0.02, 0.08, 0.06);
  staple1.translate(aX - 0.1, hBaseY + stumpHeight + 0.03, aZ);
  const staple2 = new THREE.BoxGeometry(0.02, 0.08, 0.06);
  staple2.translate(aX + 0.1, hBaseY + stumpHeight + 0.03, aZ);
  b.part(mergeGeometries([staple1, staple2]), C_IRON_MID, { bone: root, at: [0, 0, 0] });

  // The Classic Anvil: Flared base, waist, stepped table, flat polished face, round conical horn, and square heel/pritchel
  const anY = hBaseY + stumpHeight + 0.01;
  const anvilParts: THREE.BufferGeometry[] = [];

  // Anvil flared footing base
  const anFoot = new THREE.BoxGeometry(0.24, 0.05, 0.38);
  anFoot.translate(aX, anY + 0.025, aZ);
  anvilParts.push(anFoot);

  // Anvil waist / column
  const anWaist = new THREE.BoxGeometry(0.12, 0.11, 0.22);
  anWaist.translate(aX, anY + 0.05 + 0.055, aZ);
  anvilParts.push(anWaist);

  // Anvil body table
  const anBody = new THREE.BoxGeometry(0.16, 0.1, 0.3);
  anBody.translate(aX, anY + 0.16 + 0.05, aZ + 0.02);
  anvilParts.push(anBody);

  // Anvil flat hardened face (top plate)
  const anFace = new THREE.BoxGeometry(0.155, 0.025, 0.28);
  anFace.translate(aX, anY + 0.26 + 0.012, aZ + 0.02);

  // Anvil conical bick / round horn (pointing towards -Z or -X)
  const anHorn = new THREE.ConeGeometry(0.065, 0.22, 10);
  anHorn.rotateX(-Math.PI / 2);
  anHorn.translate(aX, anY + 0.25, aZ + 0.25);
  anvilParts.push(anHorn);

  // Anvil square heel with hardy hole
  const anHeel = new THREE.BoxGeometry(0.14, 0.07, 0.14);
  anHeel.translate(aX, anY + 0.23, aZ - 0.18);
  anvilParts.push(anHeel);

  b.part(mergeGeometries(anvilParts), C_IRON_DARK, { bone: root, at: [0, 0, 0] });
  b.part(anFace, C_STEEL_BRIGHT, { bone: root, at: [0, 0, 0] });

  // --- 6. GLOWING HALF-FORGED SWORD (RESTING ON ANVIL) ---
  // A glowing steel broadsword blade being hammered on the anvil face, held by tongs!
  const swordBlade = new THREE.BoxGeometry(0.042, 0.008, 0.28);
  swordBlade.rotateY(0.2);
  swordBlade.translate(aX + 0.02, anY + 0.28 + 0.004, aZ + 0.03);

  // Glowing hot tip & midsection
  const hotBladeTip = new THREE.BoxGeometry(0.038, 0.009, 0.12);
  hotBladeTip.rotateY(0.2);
  hotBladeTip.translate(aX + 0.01, anY + 0.28 + 0.0045, aZ + 0.09);

  const hotBladeCenter = new THREE.BoxGeometry(0.04, 0.0085, 0.08);
  hotBladeCenter.rotateY(0.2);
  hotBladeCenter.translate(aX + 0.02, anY + 0.28 + 0.0045, aZ + 0.01);

  // Tang of sword (cool dark iron)
  const swordTang = new THREE.BoxGeometry(0.016, 0.008, 0.14);
  swordTang.rotateY(0.2);
  swordTang.translate(aX + 0.045, anY + 0.28 + 0.004, aZ - 0.16);

  b.part(mergeGeometries([swordBlade, swordTang]), C_STEEL, { bone: root, at: [0, 0, 0] });
  glow(b.part(hotBladeCenter, C_HOT_IRON_BASE, { bone: root, at: [0, 0, 0] }), 1.8);
  glow(b.part(hotBladeTip, C_HOT_IRON_BODY, { bone: root, at: [0, 0, 0] }), 2.5);

  // Heavy forging cross-peen hammer resting on anvil face beside blade
  const hamHead = new THREE.BoxGeometry(0.045, 0.045, 0.11);
  hamHead.rotateY(-0.4);
  hamHead.translate(aX - 0.05, anY + 0.28 + 0.023, aZ - 0.02);
  const hamHandle = new THREE.CylinderGeometry(0.012, 0.014, 0.32, 8);
  hamHandle.rotateX(Math.PI / 2.3);
  hamHandle.rotateY(-0.4);
  hamHandle.translate(aX - 0.11, anY + 0.28 + 0.01, aZ - 0.15);
  b.part(hamHead, C_IRON_MID, { bone: root, at: [0, 0, 0] });
  b.part(hamHandle, C_WOOD_OAK, { bone: root, at: [0, 0, 0] });

  // Tongs gripping the sword tang
  const tongJaw1 = new THREE.BoxGeometry(0.015, 0.02, 0.06);
  tongJaw1.rotateY(0.2);
  tongJaw1.translate(aX + 0.045, anY + 0.28 + 0.01, aZ - 0.16);
  const tongHandle1 = new THREE.CylinderGeometry(0.008, 0.008, 0.42, 6);
  tongHandle1.rotateX(Math.PI / 2.1);
  tongHandle1.rotateY(0.1);
  tongHandle1.translate(aX + 0.07, anY + 0.28 - 0.08, aZ - 0.34);
  const tongHandle2 = new THREE.CylinderGeometry(0.008, 0.008, 0.42, 6);
  tongHandle2.rotateX(Math.PI / 2.1);
  tongHandle2.rotateY(0.25);
  tongHandle2.translate(aX + 0.03, anY + 0.28 - 0.08, aZ - 0.34);
  b.part(mergeGeometries([tongJaw1, tongHandle1, tongHandle2]), C_IRON_DARK, { bone: root, at: [0, 0, 0] });

  // --- 7. QUENCH BARREL (WITH STEAMING WATER) ---
  // Positioned between forge and anvil: x ~ -0.15, z ~ 0.36
  const qX = -0.36;
  const qZ = 0.22;
  const qRadius = 0.17;
  const qHeight = 0.44;

  // Oak barrel staves
  const barrelGeo = new THREE.CylinderGeometry(qRadius * 0.92, qRadius * 0.86, qHeight, 14);
  barrelGeo.translate(qX, hBaseY + qHeight / 2, qZ);
  b.part(barrelGeo, C_WOOD_OAK, { bone: root, at: [0, 0, 0] });

  // Iron hoops around barrel
  const hoop1 = new THREE.CylinderGeometry(qRadius * 0.94, qRadius * 0.94, 0.025, 14);
  hoop1.translate(qX, hBaseY + qHeight * 0.18, qZ);
  const hoop2 = new THREE.CylinderGeometry(qRadius * 0.97, qRadius * 0.97, 0.025, 14);
  hoop2.translate(qX, hBaseY + qHeight * 0.45, qZ);
  const hoop3 = new THREE.CylinderGeometry(qRadius * 0.93, qRadius * 0.93, 0.025, 14);
  hoop3.translate(qX, hBaseY + qHeight * 0.85, qZ);
  b.part(mergeGeometries([hoop1, hoop2, hoop3]), C_IRON_DARK, { bone: root, at: [0, 0, 0] });

  // Dark murky water surface inside barrel
  const waterGeo = new THREE.CylinderGeometry(qRadius * 0.88, qRadius * 0.88, 0.01, 14);
  waterGeo.translate(qX, hBaseY + qHeight - 0.04, qZ);
  b.part(waterGeo, C_WATER_MURKY, { bone: root, at: [0, 0, 0] });

  // Quenched hot piece cooling in water with wisps of steam
  const quenchedRod = new THREE.CylinderGeometry(0.01, 0.01, 0.28, 6);
  quenchedRod.rotateX(0.4);
  quenchedRod.translate(qX, hBaseY + qHeight + 0.04, qZ);
  b.part(quenchedRod, C_IRON_MID, { bone: root, at: [0, 0, 0] });

  // Steam puffs (soft stylised low-poly bubbles rising)
  const steamPuffs: THREE.BufferGeometry[] = [];
  for (let s = 0; s < 5; s++) {
    const pRadius = 0.02 + s * 0.007;
    const puff = new THREE.SphereGeometry(pRadius, 6, 5);
    puff.translate(qX + (s - 2) * 0.025, hBaseY + qHeight + 0.04 + s * 0.05, qZ + (R() - 0.5) * 0.03);
    steamPuffs.push(puff);
  }
  b.part(mergeGeometries(steamPuffs), "#d0d8dc", { bone: root, at: [0, 0, 0] });

  // --- 8. TOOL RACK WITH HAMMERS & TONGS ---
  // Freestanding sturdy timber A-frame / rail tool rack: x ~ -0.44, z ~ 0.16
  const trX = -0.44;
  const trZ = -0.06;
  const trHeight = 0.52;

  const rackLegL = new THREE.BoxGeometry(0.04, trHeight, 0.05);
  rackLegL.translate(trX, hBaseY + trHeight / 2, trZ - 0.18);
  const rackLegR = new THREE.BoxGeometry(0.04, trHeight, 0.05);
  rackLegR.translate(trX, hBaseY + trHeight / 2, trZ + 0.18);
  const rackFeetL = new THREE.BoxGeometry(0.04, 0.04, 0.14);
  rackFeetL.translate(trX, hBaseY + 0.02, trZ - 0.18);
  const rackFeetR = new THREE.BoxGeometry(0.04, 0.04, 0.14);
  rackFeetR.translate(trX, hBaseY + 0.02, trZ + 0.18);
  const rackBar = new THREE.BoxGeometry(0.04, 0.04, 0.42);
  rackBar.translate(trX, hBaseY + trHeight - 0.04, trZ);

  b.part(mergeGeometries([rackLegL, rackLegR, rackFeetL, rackFeetR, rackBar]), C_WOOD_DARK, { bone: root, at: [0, 0, 0] });

  // Assortment of blacksmith tongs hanging on the rack
  const rackTongs: THREE.BufferGeometry[] = [];
  for (let t = 0; t < 4; t++) {
    const tz = trZ - 0.12 + t * 0.08;
    const tJaw = new THREE.BoxGeometry(0.03, 0.05, 0.02);
    tJaw.translate(trX + 0.02, hBaseY + trHeight - 0.02, tz);
    const tLeg1 = new THREE.CylinderGeometry(0.006, 0.006, 0.28, 6);
    tLeg1.translate(trX + 0.03, hBaseY + trHeight - 0.18, tz - 0.012);
    const tLeg2 = new THREE.CylinderGeometry(0.006, 0.006, 0.28, 6);
    tLeg2.translate(trX + 0.03, hBaseY + trHeight - 0.18, tz + 0.012);
    rackTongs.push(tJaw, tLeg1, tLeg2);
  }
  b.part(mergeGeometries(rackTongs), C_IRON_MID, { bone: root, at: [0, 0, 0] });

  // Assortment of hammers hanging or leaning on rack
  const rackHamHeads: THREE.BufferGeometry[] = [];
  const rackHamHandles: THREE.BufferGeometry[] = [];

  // Sledgehammer leaning on rack
  const sledgeHead = new THREE.BoxGeometry(0.06, 0.06, 0.13);
  sledgeHead.translate(trX + 0.08, hBaseY + 0.04, trZ - 0.16);
  rackHamHeads.push(sledgeHead);
  const sledgeShaft = new THREE.CylinderGeometry(0.015, 0.016, 0.58, 8);
  sledgeShaft.rotateX(-0.25);
  sledgeShaft.translate(trX + 0.08, hBaseY + 0.28, trZ - 0.1);
  rackHamHandles.push(sledgeShaft);

  // Ball-peen hammer hanging
  const bpHead = new THREE.CylinderGeometry(0.02, 0.02, 0.09, 8);
  bpHead.rotateX(Math.PI / 2);
  bpHead.translate(trX - 0.03, hBaseY + trHeight - 0.02, trZ + 0.08);
  rackHamHeads.push(bpHead);
  const bpShaft = new THREE.CylinderGeometry(0.01, 0.01, 0.25, 8);
  bpShaft.translate(trX - 0.03, hBaseY + trHeight - 0.14, trZ + 0.08);
  rackHamHandles.push(bpShaft);

  b.part(mergeGeometries(rackHamHeads), C_STEEL, { bone: root, at: [0, 0, 0] });
  b.part(mergeGeometries(rackHamHandles), C_WOOD_OAK, { bone: root, at: [0, 0, 0] });

  // --- 9. WORKBENCH WITH BENCH VISE & HORSESHOES ---
  // Heavy timber workbench on the right side: x ~ 0.44, z ~ -0.05
  const wbX = 0.42;
  const wbZ = -0.06;
  const wbHeight = 0.46;
  const wbWidth = 0.32;
  const wbLength = 0.64;

  const wbParts: THREE.BufferGeometry[] = [];
  // 4 thick timber legs
  for (const dx of [-wbWidth / 2 + 0.04, wbWidth / 2 - 0.04]) {
    for (const dz of [-wbLength / 2 + 0.06, wbLength / 2 - 0.06]) {
      const leg = new THREE.BoxGeometry(0.06, wbHeight, 0.06);
      leg.translate(wbX + dx, hBaseY + wbHeight / 2, wbZ + dz);
      wbParts.push(leg);
    }
  }
  // Bottom stretchers / shelf
  const stretcher1 = new THREE.BoxGeometry(wbWidth - 0.04, 0.04, 0.04);
  stretcher1.translate(wbX, hBaseY + 0.12, wbZ - wbLength / 2 + 0.06);
  const stretcher2 = new THREE.BoxGeometry(wbWidth - 0.04, 0.04, 0.04);
  stretcher2.translate(wbX, hBaseY + 0.12, wbZ + wbLength / 2 - 0.06);
  const longStretcher = new THREE.BoxGeometry(0.04, 0.04, wbLength - 0.1);
  longStretcher.translate(wbX, hBaseY + 0.12, wbZ);
  wbParts.push(stretcher1, stretcher2, longStretcher);

  // Heavy planked workbench top
  const wbTop = new THREE.BoxGeometry(wbWidth + 0.04, 0.055, wbLength + 0.06);
  wbTop.translate(wbX, hBaseY + wbHeight + 0.027, wbZ);
  wbParts.push(wbTop);

  b.part(mergeGeometries(wbParts), C_WOOD_PLANK, { bone: root, at: [0, 0, 0] });

  // Blacksmith's leg vise mounted on the edge of the workbench
  const viseX = wbX - wbWidth / 2;
  const viseZ = wbZ + 0.15;
  const viseY = hBaseY + wbHeight + 0.05;

  const viseJawFixed = new THREE.BoxGeometry(0.04, 0.08, 0.08);
  viseJawFixed.translate(viseX + 0.02, viseY + 0.04, viseZ);
  const viseJawMove = new THREE.BoxGeometry(0.035, 0.08, 0.08);
  viseJawMove.translate(viseX - 0.025, viseY + 0.04, viseZ);
  const viseScrew = new THREE.CylinderGeometry(0.012, 0.012, 0.1, 8);
  viseScrew.rotateZ(Math.PI / 2);
  viseScrew.translate(viseX, viseY + 0.03, viseZ);
  const viseHandle = new THREE.CylinderGeometry(0.007, 0.007, 0.14, 6);
  viseHandle.translate(viseX - 0.05, viseY + 0.03, viseZ);
  const viseLeg = new THREE.CylinderGeometry(0.015, 0.015, wbHeight + 0.05, 8);
  viseLeg.translate(viseX - 0.01, hBaseY + (wbHeight + 0.05) / 2, viseZ);

  b.part(mergeGeometries([viseJawFixed, viseJawMove, viseScrew, viseHandle, viseLeg]), C_IRON_MID, { bone: root, at: [0, 0, 0] });

  // Finished horseshoes on the workbench and hung on bench side
  const horseshoes: THREE.BufferGeometry[] = [];
  function makeHorseshoe(scale = 1): THREE.BufferGeometry {
    const shoe = new THREE.TorusGeometry(0.032 * scale, 0.007 * scale, 5, 8, Math.PI * 1.4);
    shoe.rotateZ(Math.PI * 0.8);
    return shoe;
  }

  // Two horseshoes lying on workbench top
  const shoe1 = makeHorseshoe();
  shoe1.rotateX(Math.PI / 2);
  shoe1.translate(wbX - 0.04, hBaseY + wbHeight + 0.06, wbZ - 0.12);
  const shoe2 = makeHorseshoe();
  shoe2.rotateX(Math.PI / 2);
  shoe2.rotateY(0.6);
  shoe2.translate(wbX + 0.04, hBaseY + wbHeight + 0.06, wbZ - 0.18);
  horseshoes.push(shoe1, shoe2);

  // A stack of horseshoes hung on an iron peg on workbench leg
  // Workbench rear-right leg is at x = wbX + wbWidth/2 - 0.04 = 0.54, z = wbZ - wbLength/2 + 0.06 = -0.32
  const peg = new THREE.CylinderGeometry(0.008, 0.008, 0.1, 6);
  peg.rotateZ(Math.PI / 2);
  peg.translate(0.54, hBaseY + wbHeight * 0.6, -0.32);
  b.part(peg, C_IRON_MID, { bone: root, at: [0, 0, 0] });

  for (let hs = 0; hs < 3; hs++) {
    const hungShoe = makeHorseshoe();
    hungShoe.rotateY(Math.PI / 2);
    hungShoe.translate(0.58 + hs * 0.015, hBaseY + wbHeight * 0.6 - 0.02, -0.32);
    horseshoes.push(hungShoe);
  }
  // Also metal files, chisels, and iron stock ingots on workbench
  const ingot1 = new THREE.BoxGeometry(0.04, 0.025, 0.14);
  ingot1.translate(wbX + 0.06, hBaseY + wbHeight + 0.065, wbZ + 0.08);
  const ingot2 = new THREE.BoxGeometry(0.04, 0.025, 0.12);
  ingot2.rotateY(0.3);
  ingot2.translate(wbX + 0.05, hBaseY + wbHeight + 0.088, wbZ + 0.07);
  horseshoes.push(ingot1, ingot2);

  b.part(mergeGeometries(horseshoes), C_STEEL, { bone: root, at: [0, 0, 0] });

  // --- 10. FIREWOOD PILE & COAL BUCKET ---
  // Stacked cordwood logs behind forge / rear corner: x ~ -0.15, z ~ -0.52
  const fwX = -0.12;
  const fwZ = -0.5;
  const woodLogs: THREE.BufferGeometry[] = [];
  const logRadius = 0.035;
  const logLen = 0.28;

  // Stack of split firewood logs in pyramid rows
  const logLayers = [
    { count: 4, yOff: 0.035 },
    { count: 3, yOff: 0.095 },
    { count: 2, yOff: 0.155 },
    { count: 1, yOff: 0.215 },
  ];

  for (const { count, yOff } of logLayers) {
    const startX = fwX - ((count - 1) * logRadius * 1.8) / 2;
    for (let l = 0; l < count; l++) {
      const lx = startX + l * logRadius * 1.8 + (R() - 0.5) * 0.01;
      const log = new THREE.CylinderGeometry(logRadius * (0.9 + R() * 0.2), logRadius * (0.9 + R() * 0.2), logLen, 7);
      log.rotateX(Math.PI / 2);
      log.rotateZ((R() - 0.5) * 0.1);
      log.translate(lx, hBaseY + yOff, fwZ + (R() - 0.5) * 0.02);
      woodLogs.push(log);
    }
  }

  // Kindling sticks and axe stuck in a chopping block
  const chopBlock = new THREE.CylinderGeometry(0.12, 0.14, 0.22, 9);
  chopBlock.translate(fwX + 0.22, hBaseY + 0.11, fwZ + 0.06);
  b.part(chopBlock, C_WOOD_BARK, { bone: root, at: [0, 0, 0] });

  const axeHead = new THREE.BoxGeometry(0.025, 0.08, 0.11);
  axeHead.translate(fwX + 0.22, hBaseY + 0.24, fwZ + 0.06);
  const axeHandle = new THREE.CylinderGeometry(0.012, 0.014, 0.35, 7);
  axeHandle.rotateX(0.4);
  axeHandle.translate(fwX + 0.22, hBaseY + 0.35, fwZ + 0.14);
  b.part(axeHead, C_STEEL, { bone: root, at: [0, 0, 0] });
  b.part(axeHandle, C_WOOD_OAK, { bone: root, at: [0, 0, 0] });

  b.part(mergeGeometries(woodLogs), C_WOOD_SPLIT, { bone: root, at: [0, 0, 0] });

  // Coal scuttle / iron bucket with extra coal chunks
  const bucketGeo = new THREE.CylinderGeometry(0.1, 0.075, 0.18, 10);
  bucketGeo.translate(hX + 0.35, hBaseY + 0.09, hZ + 0.22);
  const bucketHandle = new THREE.TorusGeometry(0.095, 0.008, 5, 10, Math.PI);
  bucketHandle.rotateX(-0.5);
  bucketHandle.translate(hX + 0.35, hBaseY + 0.18, hZ + 0.22);
  b.part(mergeGeometries([bucketGeo, bucketHandle]), C_IRON_DARK, { bone: root, at: [0, 0, 0] });

  const bucketCoals: THREE.BufferGeometry[] = [];
  for (let c = 0; c < 8; c++) {
    const cl = new THREE.BoxGeometry(0.035, 0.03, 0.035);
    cl.rotateX(R() * 2);
    cl.rotateY(R() * 2);
    cl.translate(hX + 0.35 + (R() - 0.5) * 0.08, hBaseY + 0.15 + (R() - 0.5) * 0.02, hZ + 0.22 + (R() - 0.5) * 0.08);
    bucketCoals.push(cl);
  }
  b.part(mergeGeometries(bucketCoals), C_COAL_DARK, { bone: root, at: [0, 0, 0] });

  // --- 11. OIL LANTERN & POST ---
  // Lantern hung from a decorative iron bracket on the forge hood front-right pillar
  const lanX = hX + 0.25;
  const lanY = hBaseY + 0.72;
  const lanZ = hZ + 0.25;

  const lanBracket1 = new THREE.BoxGeometry(0.02, 0.02, 0.16);
  lanBracket1.translate(lanX, lanY + 0.14, lanZ - 0.08);
  const lanBracket2 = new THREE.BoxGeometry(0.02, 0.12, 0.02);
  lanBracket2.rotateX(0.4);
  lanBracket2.translate(lanX, lanY + 0.08, lanZ - 0.08);
  b.part(mergeGeometries([lanBracket1, lanBracket2]), C_IRON_DARK, { bone: root, at: [0, 0, 0] });

  // The Lantern: Brass/iron cap, glass chamber with warm glowing flame, oil base
  const lanCap = new THREE.ConeGeometry(0.05, 0.035, 8);
  lanCap.translate(lanX, lanY + 0.09, lanZ);
  const lanRing = new THREE.TorusGeometry(0.018, 0.004, 6, 8);
  lanRing.translate(lanX, lanY + 0.12, lanZ);
  const lanBase = new THREE.CylinderGeometry(0.045, 0.05, 0.025, 8);
  lanBase.translate(lanX, lanY - 0.055, lanZ);
  const lanStruts: THREE.BufferGeometry[] = [];
  for (let a = 0; a < 4; a++) {
    const ang = (a * Math.PI) / 2;
    const strut = new THREE.CylinderGeometry(0.0035, 0.0035, 0.1, 4);
    strut.translate(lanX + Math.cos(ang) * 0.038, lanY + 0.015, lanZ + Math.sin(ang) * 0.038);
    lanStruts.push(strut);
  }
  b.part(mergeGeometries([lanCap, lanRing, lanBase, ...lanStruts]), C_BRASS, { bone: root, at: [0, 0, 0] });

  // Glowing lantern glass core
  const lanGlass = new THREE.CylinderGeometry(0.035, 0.035, 0.08, 8);
  lanGlass.translate(lanX, lanY + 0.015, lanZ);
  glow(b.part(lanGlass, "#fff2b3", { bone: root, at: [0, 0, 0] }), 1.9);

  // --- 12. HANGING BLACKSMITH SHOP SIGN (ON PIVOT JOINT) ---
  // Heavy timber beam / gallows arm holding wrought iron hanging sign:
  // Positioned rear right: x ~ 0.36, z ~ -0.42
  const beamX = 0.52;
  const beamZ = -0.42;
  const beamHeight = 1.25;

  const beamPost = new THREE.BoxGeometry(0.09, beamHeight, 0.09);
  beamPost.translate(beamX, hBaseY + beamHeight / 2, beamZ);
  // Gallows arm extending along -X from post: length 0.36
  const beamGallows = new THREE.BoxGeometry(0.36, 0.08, 0.08);
  beamGallows.translate(beamX - 0.18, hBaseY + beamHeight - 0.04, beamZ);
  const beamStrut = new THREE.BoxGeometry(0.06, 0.22, 0.06);
  beamStrut.rotateZ(-Math.PI / 4);
  beamStrut.translate(beamX - 0.1, hBaseY + beamHeight - 0.13, beamZ);
  b.part(mergeGeometries([beamPost, beamGallows, beamStrut]), C_WOOD_DARK, { bone: root, at: [0, 0, 0] });

  // Two iron chains hanging down to the sign
  const signX = 0.34;
  const signZ = beamZ;
  const signY = hBaseY + beamHeight - 0.14;

  const chainL = new THREE.CylinderGeometry(0.005, 0.005, 0.09, 5);
  chainL.translate(signX - 0.08, signY - 0.045, signZ);
  const chainR = new THREE.CylinderGeometry(0.005, 0.005, 0.09, 5);
  chainR.translate(signX + 0.08, signY - 0.045, signZ);
  b.part(mergeGeometries([chainL, chainR]), C_IRON_DARK, { bone: root, at: [0, 0, 0] });

  // The Swinging Sign itself (attached to signPivot joint!)
  const sY = signY - 0.15;
  const signAngle = 0.15; // slightly angled toward viewer

  const signboard = new THREE.BoxGeometry(0.26, 0.15, 0.022);
  signboard.rotateY(signAngle);
  signboard.translate(signX, sY, signZ);

  // Border trim
  const ironTrimT = new THREE.BoxGeometry(0.28, 0.015, 0.03);
  ironTrimT.rotateY(signAngle);
  ironTrimT.translate(signX, sY + 0.08, signZ);
  const ironTrimB = new THREE.BoxGeometry(0.28, 0.015, 0.03);
  ironTrimB.rotateY(signAngle);
  ironTrimB.translate(signX, sY - 0.08, signZ);
  const ironTrimL = new THREE.BoxGeometry(0.015, 0.16, 0.03);
  ironTrimL.rotateY(signAngle);
  ironTrimL.translate(signX - 0.135 * Math.cos(signAngle), sY, signZ + 0.135 * Math.sin(signAngle));
  const ironTrimR = new THREE.BoxGeometry(0.015, 0.16, 0.03);
  ironTrimR.rotateY(signAngle);
  ironTrimR.translate(signX + 0.135 * Math.cos(signAngle), sY, signZ - 0.135 * Math.sin(signAngle));

  // Wrought iron scrollwork crest on top of sign
  const scrollCrest = new THREE.TorusGeometry(0.04, 0.006, 5, 10, Math.PI);
  scrollCrest.rotateY(signAngle);
  scrollCrest.translate(signX, sY + 0.095, signZ);

  // Golden / brass anvil emblem relief on sign front & back
  const normX = Math.sin(signAngle) * 0.013;
  const normZ = Math.cos(signAngle) * 0.013;

  const emblemAnvilF = new THREE.BoxGeometry(0.09, 0.04, 0.008);
  emblemAnvilF.rotateY(signAngle);
  emblemAnvilF.translate(signX + normX, sY - 0.01, signZ + normZ);
  const emblemHornF = new THREE.ConeGeometry(0.02, 0.06, 6);
  emblemHornF.rotateZ(Math.PI / 2);
  emblemHornF.rotateY(signAngle);
  emblemHornF.translate(signX + 0.045 * Math.cos(signAngle) + normX, sY, signZ - 0.045 * Math.sin(signAngle) + normZ);

  const emblemAnvilB = new THREE.BoxGeometry(0.09, 0.04, 0.008);
  emblemAnvilB.rotateY(signAngle);
  emblemAnvilB.translate(signX - normX, sY - 0.01, signZ - normZ);
  const emblemHornB = new THREE.ConeGeometry(0.02, 0.06, 6);
  emblemHornB.rotateZ(-Math.PI / 2);
  emblemHornB.rotateY(signAngle);
  emblemHornB.translate(signX + 0.045 * Math.cos(signAngle) - normX, sY, signZ - 0.045 * Math.sin(signAngle) - normZ);

  const signWood = signboard;
  const signIron = mergeGeometries([ironTrimT, ironTrimB, ironTrimL, ironTrimR, scrollCrest]);
  const signBrass = mergeGeometries([emblemAnvilF, emblemHornF, emblemAnvilB, emblemHornB]);

  b.part(signWood, C_WOOD_OAK, { bone: signPivot, at: [0, 0, 0] });
  b.part(signIron, C_IRON_DARK, { bone: signPivot, at: [0, 0, 0] });
  b.part(signBrass, C_BRASS, { bone: signPivot, at: [0, 0, 0] });

  return b.root;
}
