import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { glow } from "../kits/glow";
import { bayer, pixelArt, pixelTexture, pick, tileBox } from "../kits/pixel";

export const meta = {
  name: "Pixel Dungeon Props",
  description: "A richly dressed pixel-art dungeon vignette with a locked chest, torch sconces, barrel, bones, and a spiked floor trap.",
  style: "pixel art",
  commit: "07503e3",
};

const TEXEL = 0.02;
const STONE_DARK = "#25263a";
const STONE = "#45465b";
const STONE_LIGHT = "#68697b";
const STONE_EDGE = "#303145";
const WOOD_DARK = "#3b1f26";
const WOOD = "#70402f";
const WOOD_LIGHT = "#a2603d";
const IRON_DARK = "#202231";
const IRON = "#596071";
const IRON_LIGHT = "#8a8e9b";
const GOLD = "#d9a441";
const GOLD_LIGHT = "#f0ce65";
const FIRE_RED = "#c33a32";
const FIRE_ORANGE = "#f47e32";
const FIRE_YELLOW = "#ffe18a";
const BONE = "#d8c49a";
const BONE_LIGHT = "#f3dfad";
const BONE_DARK = "#806b61";
const VOID = "#111321";

const STONE_TILE = pixelTexture(64, 64, (g) => {
  g.fill((x, y) => {
    const mortar = x % 16 === 0 || y % 16 === 0;
    if (mortar) return STONE_DARK;
    const n = (x * 17 + y * 31 + ((x >> 2) ^ (y >> 3)) * 13) % 11;
    return pick([STONE_DARK, STONE, STONE, STONE_LIGHT], n / 12, bayer(x, y));
  });
  for (let y = 2; y < 64; y += 16) {
    const offset = (y / 16) % 2 ? 8 : 0;
    for (let x = offset + 2; x < 64; x += 16) {
      g.set(x, y, STONE_LIGHT);
      g.set(x + 1, y, STONE_LIGHT);
      g.set(x, y + 1, STONE);
    }
  }
});

const WOOD_TILE = pixelTexture(48, 48, (g) => {
  g.fill((x, y) => {
    const seam = y % 12 === 0 || y % 12 === 1;
    if (seam) return WOOD_DARK;
    const n = (x * 7 + y * 19 + (y >> 2) * 5) % 9;
    return pick([WOOD_DARK, WOOD, WOOD, WOOD_LIGHT], n / 10, bayer(x, y));
  });
  for (let x = 4; x < 48; x += 13) {
    g.set(x, 3, WOOD_LIGHT);
    g.set(x + 1, 3, WOOD_LIGHT);
    g.set(x, 4, WOOD);
  }
});

const IRON_TILE = pixelTexture(32, 32, (g) => {
  g.fill((x, y) => {
    const stripe = (x + y) % 9 === 0;
    return stripe ? IRON_LIGHT : (x * 11 + y * 7) % 5 === 0 ? IRON : IRON_DARK;
  });
  for (let y = 4; y < 32; y += 10) g.set(4, y, IRON_LIGHT);
});

const FLAME = pixelArt(
  [
    "......rr......",
    ".....rRrr.....",
    ".....rOOrr....",
    "....rOOOOrr...",
    "....rOYYOrr...",
    "...rOOYYYOr...",
    "...rOYYYYOr...",
    "...rOOOOOOr...",
    "..rrOOOOOrr...",
    "..rOOOOOOOr...",
    "..rOOOOOOOr...",
    "...rOOOOOr....",
    "...rrOOOrr....",
    "....rOOr......",
    "....rrr.......",
    "..............",
  ],
  { r: FIRE_RED, R: FIRE_ORANGE, O: FIRE_ORANGE, Y: FIRE_YELLOW },
);

const LOCK = pixelArt(
  ["kkkkkkkk", "kggggggk", "kggkkggk", "kggkkggk", "kggkkggk", "kggggggk", "kkkkkkkk", "kkkkkkkk"],
  { k: IRON_DARK, g: GOLD_LIGHT },
);

const EYE_SOCKET = pixelArt(
  ["kkkkkkkk", "k......k", "k..kk..k", "k.kkkk.k", "k..kk..k", "k......k", "kkkkkkkk", "........"],
  { k: VOID },
);

export default function build() {
  const b = createBuilder({ name: "pixelDungeonProps", detail: 0.72, paintSize: 1024 });
  const root = b.joint("dungeon", { at: [0, 0, 0], role: "spine" });
  const rand = rng(90210);

  const box = (
    size: readonly [number, number, number],
    at: readonly [number, number, number],
    color: string,
    name: string,
    texture?: THREE.Texture,
    rotation?: readonly [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      bone: root,
      at,
      name,
      texture,
      rotation,
      flat: true,
    });

  const tile = (
    size: readonly [number, number, number],
    at: readonly [number, number, number],
    texture: THREE.Texture,
    name: string,
  ) =>
    b.part(tileBox(size, texture, TEXEL, { rand, step: [1, 1] }), "#ffffff", {
      bone: root,
      at,
      name,
      texture,
      flat: true,
    });

  const cyl = (
    radius: number,
    height: number,
    at: readonly [number, number, number],
    color: string,
    name: string,
    radial = 8,
    texture?: THREE.Texture,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, b.segments(radial, 0.8)), color, {
      bone: root,
      at,
      name,
      texture,
      flat: true,
    });

  const sphere = (radius: number, at: readonly [number, number, number], color: string, name: string) =>
    b.part(new THREE.SphereGeometry(radius, b.segments(8, 0.7), b.segments(5, 0.7)), color, {
      bone: root,
      at,
      name,
      flat: true,
    });

  const torus = (
    major: number,
    minor: number,
    at: readonly [number, number, number],
    color: string,
    name: string,
  ) =>
    b.part(new THREE.TorusGeometry(major, minor, b.segments(4, 0.7), b.segments(12, 0.7)), color, {
      bone: root,
      at,
      name,
      rotation: [90, 0, 0],
      flat: true,
    });

  // A chunky tiled plinth gives every prop a shared pixel-art floor contact.
  tile([2.8, 0.16, 2.15], [0, 0.08, 0], STONE_TILE, "dungeonFloor");
  tile([2.82, 0.12, 0.12], [0, 0.21, 1.03], STONE_TILE, "frontFloorLip");
  tile([2.82, 0.12, 0.12], [0, 0.21, -1.03], STONE_TILE, "backFloorLip");
  for (const x of [-1.28, 1.28]) tile([0.12, 0.12, 1.95], [x, 0.21, 0], STONE_TILE, `sideFloorLip${x}`);

  // Two broken wall piers and a lintel make a strong silhouette behind the props.
  for (const x of [-1.22, 1.22]) {
    tile([0.28, 1.82, 0.34], [x, 1.08, 0.82], STONE_TILE, `wallPier${x}`);
    tile([0.38, 0.16, 0.44], [x, 1.93, 0.82], STONE_TILE, `pierCap${x}`);
    for (let y = 0.38; y < 1.8; y += 0.34) {
      box([0.33, 0.055, 0.38], [x, y, 0.63 + ((y * 17) % 3) * 0.008], STONE_EDGE, `pierSeam${x}-${y}`);
    }
  }
  tile([2.25, 0.25, 0.35], [0, 1.92, 0.82], STONE_TILE, "wallLintel");
  for (const x of [-0.8, -0.4, 0, 0.4, 0.8]) box([0.05, 0.16, 0.38], [x, 2.07, 0.82], STONE_LIGHT, `lintelChip${x}`);

  // Chest: plank body, overhanging lid, iron bands, feet, hinges, rivets, and a readable lock.
  tile([0.68, 0.38, 0.52], [-0.48, 0.42, 0.12], WOOD_TILE, "chestBody");
  tile([0.74, 0.18, 0.58], [-0.48, 0.70, 0.12], WOOD_TILE, "chestLid");
  box([0.74, 0.045, 0.06], [-0.48, 0.60, 0.415], WOOD_LIGHT, "chestFrontRim");
  box([0.74, 0.045, 0.06], [-0.48, 0.60, -0.185], WOOD_DARK, "chestBackRim");
  for (const x of [-0.75, -0.21]) {
    box([0.065, 0.43, 0.07], [x, 0.43, 0.39], IRON, `chestBandFront${x}`);
    box([0.065, 0.43, 0.07], [x, 0.43, -0.15], IRON_DARK, `chestBandBack${x}`);
    box([0.08, 0.10, 0.55], [x, 0.71, 0.12], IRON, `chestLidBand${x}`);
  }
  box([0.19, 0.16, 0.045], [-0.48, 0.50, 0.405], GOLD, "chestLockPlate", LOCK);
  box([0.045, 0.07, 0.02], [-0.48, 0.48, 0.433], VOID, "chestKeyhole");
  for (const x of [-0.76, -0.2]) {
    for (const z of [-0.14, 0.40]) {
      box([0.08, 0.08, 0.08], [x, 0.25, z], IRON_DARK, `chestFoot${x}${z}`);
      sphere(0.035, [x, 0.25, z], IRON_LIGHT, `chestRivet${x}${z}`);
    }
  }
  for (const x of [-0.70, -0.26]) {
    box([0.13, 0.09, 0.06], [x, 0.76, -0.18], IRON_DARK, `chestHinge${x}`);
    sphere(0.028, [x, 0.76, -0.22], IRON_LIGHT, `hingePin${x}`);
  }
  for (let i = 0; i < 5; i++) {
    const x = -0.72 + i * 0.12;
    box([0.045, 0.045, 0.022], [x, 0.52, 0.438], WOOD_LIGHT, `chestGrain${i}`);
  }

  // Barrel: faceted staves, four iron hoops, a lid, top planks, and a side handle.
  cyl(0.31, 0.58, [0.72, 0.50, -0.36], WOOD, "barrelBody", 10, WOOD_TILE);
  for (const y of [0.27, 0.43, 0.60, 0.75]) torus(0.305, 0.024, [0.72, y, -0.36], IRON_DARK, `barrelHoop${y}`);
  cyl(0.275, 0.035, [0.72, 0.80, -0.36], WOOD_LIGHT, "barrelLid", 10, WOOD_TILE);
  for (const x of [0.60, 0.69, 0.78, 0.87]) box([0.065, 0.035, 0.50], [x, 0.825, -0.36], WOOD_DARK, `barrelTopPlank${x}`);
  box([0.06, 0.16, 0.12], [1.04, 0.50, -0.36], IRON, "barrelHandleMount");
  torus(0.09, 0.016, [1.09, 0.50, -0.36], IRON_LIGHT, "barrelHandle");
  for (const x of [0.51, 0.92]) {
    box([0.045, 0.32, 0.04], [x, 0.50, -0.06], WOOD_LIGHT, `barrelStave${x}`);
  }

  const makeTorch = (x: number, z: number, side: string) => {
    box([0.24, 0.50, 0.10], [x, 1.05, z + 0.06], IRON_DARK, `torchSconce${side}`);
    box([0.18, 0.10, 0.14], [x, 1.27, z + 0.01], IRON, `torchCup${side}`);
    b.rod([x, 0.30, z], [x, 1.24, z], 0.045, { bone: root, color: WOOD_DARK, name: `torchHandle${side}`, section: { ngon: 6 }, caps: "flat" });
    for (const y of [0.53, 0.86, 1.16]) box([0.13, 0.045, 0.13], [x, y, z], WOOD_LIGHT, `torchWrap${side}${y}`);
    const flame = b.part(new THREE.BoxGeometry(0.24, 0.30, 0.035), "#ffffff", {
      bone: root,
      at: [x, 1.49, z + 0.005],
      name: `torchFlame${side}`,
      texture: FLAME,
      flat: true,
    });
    glow(flame, 1.7);
    const flameSide = b.part(new THREE.BoxGeometry(0.035, 0.25, 0.20), "#ffffff", {
      bone: root,
      at: [x, 1.49, z],
      name: `torchFlameSide${side}`,
      texture: FLAME,
      rotation: [0, 90, 0],
      flat: true,
    });
    glow(flameSide, 1.4);
    for (const [dx, dy] of [[-0.12, 0.16], [0.13, 0.08], [-0.08, -0.03]] as const) {
      const ember = box([0.035, 0.045, 0.035], [x + dx, 1.49 + dy, z + 0.03], FIRE_ORANGE, `torchEmber${side}${dx}${dy}`);
      glow(ember, 1.1);
    }
  };
  makeTorch(-1.02, 0.44, "L");
  makeTorch(1.02, 0.44, "R");

  // Spike trap: a dark pit plate, raised iron frame, bolts, and nine deliberately readable spikes.
  const trapX = 0.18;
  const trapZ = 0.78;
  tile([0.88, 0.07, 0.62], [trapX, 0.24, trapZ], IRON_TILE, "trapPit");
  box([0.95, 0.10, 0.09], [trapX, 0.29, trapZ - 0.32], IRON, "trapRimFront");
  box([0.95, 0.10, 0.09], [trapX, 0.29, trapZ + 0.32], IRON, "trapRimBack");
  box([0.09, 0.10, 0.55], [trapX - 0.46, 0.29, trapZ], IRON, "trapRimLeft");
  box([0.09, 0.10, 0.55], [trapX + 0.46, 0.29, trapZ], IRON, "trapRimRight");
  for (const x of [trapX - 0.37, trapX, trapX + 0.37]) {
    for (const z of [trapZ - 0.24, trapZ, trapZ + 0.24]) {
      cyl(0.035, 0.035, [x, 0.35, z], GOLD, `trapBolt${x}${z}`, 6);
      b.spike([x, 0.30, z], [0, 1, 0], 0.43, 0.048, {
        bone: root,
        color: IRON_LIGHT,
        name: `trapSpike${x}${z}`,
        section: { ngon: 5 },
        caps: "point",
      });
    }
  }
  box([0.10, 0.07, 0.06], [trapX, 0.38, trapZ], GOLD, "trapCenterLatch");

  // A loose skeleton sprawls beside the trap: skull, jaw, spine, ribs, and finger-like phalanges.
  sphere(0.16, [0.72, 0.39, 0.40], BONE, "skull");
  box([0.20, 0.07, 0.08], [0.72, 0.28, 0.48], BONE_LIGHT, "skullJaw");
  box([0.16, 0.08, 0.03], [0.72, 0.44, 0.545], VOID, "skullFace", EYE_SOCKET);
  for (const x of [0.67, 0.77]) box([0.04, 0.06, 0.035], [x, 0.43, 0.55], VOID, `skullEye${x}`);
  for (const x of [0.65, 0.72, 0.79]) box([0.035, 0.045, 0.025], [x, 0.29, 0.535], BONE_DARK, `jawTooth${x}`);
  b.rod([0.53, 0.32, 0.22], [0.16, 0.29, 0.10], 0.045, { bone: root, color: BONE, name: "skeletonSpine", section: { ngon: 6 }, caps: "round" });
  for (let i = 0; i < 5; i++) {
    const x = 0.44 - i * 0.075;
    const z = 0.20 - i * 0.03;
    sphere(0.055, [x, 0.32, z], BONE_LIGHT, `vertebra${i}`);
    b.rod([x, 0.32, z], [x - 0.12, 0.32, z + 0.15], 0.026, { bone: root, color: BONE, name: `ribL${i}`, section: { ngon: 5 }, caps: "round" });
    b.rod([x, 0.32, z], [x - 0.12, 0.32, z - 0.15], 0.026, { bone: root, color: BONE_DARK, name: `ribR${i}`, section: { ngon: 5 }, caps: "round" });
  }
  b.rod([0.08, 0.30, 0.08], [-0.24, 0.27, 0.34], 0.05, { bone: root, color: BONE, name: "skeletonFemur", section: { ngon: 6 }, caps: "round" });
  sphere(0.075, [-0.24, 0.27, 0.34], BONE_LIGHT, "femurKnuckle");
  b.rod([-0.24, 0.27, 0.34], [-0.47, 0.27, 0.12], 0.035, { bone: root, color: BONE, name: "skeletonShin", section: { ngon: 5 }, caps: "round" });
  for (let i = 0; i < 4; i++) b.rod([-0.46, 0.28, 0.12], [-0.56 - i * 0.06, 0.27, 0.02 - i * 0.02], 0.014, { bone: root, color: BONE_LIGHT, name: `toe${i}`, section: { ngon: 5 }, caps: "point" });

  // Pixel coins, rubble, and tiny dungeon clutter fill the negative space without hiding the hero props.
  const coins: readonly [number, number, number][] = [
    [-0.06, 0.27, 0.20],
    [0.06, 0.27, 0.27],
    [0.15, 0.27, 0.32],
    [-0.91, 0.28, 0.05],
    [-0.82, 0.28, 0.10],
    [0.98, 0.28, -0.02],
    [1.06, 0.28, 0.06],
  ];
  for (let i = 0; i < coins.length; i++) {
    const [x, y, z] = coins[i];
    cyl(0.045, 0.018, [x, y, z], GOLD, `coin${i}`, 6);
    box([0.025, 0.008, 0.008], [x, y + 0.012, z], GOLD_LIGHT, `coinMark${i}`);
  }
  const rubble: readonly [number, number, number, number, number, number][] = [
    [-1.03, 0.29, -0.12, 0.15, 0.11, 0.12],
    [-0.88, 0.29, -0.23, 0.10, 0.10, 0.15],
    [-0.10, 0.28, 0.72, 0.17, 0.10, 0.12],
    [0.10, 0.29, 0.78, 0.13, 0.11, 0.15],
    [1.06, 0.29, 0.35, 0.12, 0.10, 0.10],
    [1.00, 0.29, 0.24, 0.08, 0.09, 0.12],
    [-0.16, 0.29, -0.18, 0.11, 0.08, 0.08],
    [0.34, 0.28, -0.94, 0.16, 0.09, 0.10],
    [0.52, 0.29, -0.93, 0.09, 0.08, 0.12],
  ];
  for (let i = 0; i < rubble.length; i++) {
    const [x, y, z, w, h, d] = rubble[i];
    box([w, h, d], [x, y, z], i % 2 ? STONE : STONE_LIGHT, `rubble${i}`);
  }
  // A few sharply pixelated floor glyphs point toward the trap and break up the large floor texture.
  for (const [x, z, rot] of [[-0.55, 0.00, 0], [-0.18, 0.00, 0], [-0.55, 0.30, 90]] as const) {
    box([0.04, 0.012, 0.22], [x, 0.285, z], GOLD, `floorGlyph${x}${z}`, undefined, [0, rot, 0]);
  }

  // Small random chips give the wall and floor a hand-placed pixel-dungeon finish.
  for (let i = 0; i < 18; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (1.08 + rand() * 0.24);
    const z = 0.66 + rand() * 0.30;
    const y = 0.36 + rand() * 1.25;
    box([0.035 + rand() * 0.04, 0.025 + rand() * 0.035, 0.025], [x, y, z], i % 3 === 0 ? STONE_LIGHT : STONE_DARK, `wallChip${i}`);
  }

  return b.root;
}
