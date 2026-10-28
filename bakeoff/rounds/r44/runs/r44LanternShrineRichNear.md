```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { rng } from "agentic-3js-builder";
import { frame } from "agentic-3js-builder";
import { catmull } from "agentic-3js-builder";
import { grain, mottle, paint, patches } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { cel } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Roadside Shrine",
  description: "A cel-shaded roadside shrine: vermilion torii, small hokora with fox guardians, stone lanterns, paper lanterns, shimenawa and offerings.",
};

type V3 = [number, number, number];

const RED = cel("#d8412f", "#8f2230");
const BLACK = cel("#2a2230", "#161226");
const GOLD = "#f3c14f";
const WOOD = grain("#a8794a", "#7a4e2e", { size: 0.05, axis: "y", seed: 4 });
const DARKWOOD = grain("#6a4630", "#432a1e", { size: 0.05, axis: "y", seed: 8 });
const STONE = mottle("#a9b2bb", "#7d8a9a", { size: 0.25, seed: 3 });
const STONE_D = mottle("#8794a6", "#5e6b80", { size: 0.2, seed: 6 });
const PATH = patches("#59657a", ["#98a3b3", "#aab4c0", "#8794a6"], { size: 0.45, gap: 0.08, seed: 2 });
const MOSS = "#6fae48";
const ROPE = "#e3d2a0";
const PAPER = "#ff9a3c";
const WHITE = "#f7f3e8";
const TEAL = "#3ed6bd";

const FOX_FACE = svg(
  `<svg viewBox="0 0 64 64"><path d="M14 30 Q20 22 28 26 M50 30 Q44 22 36 26" stroke="#2a2230" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M26 42 L32 47 L38 42" stroke="#2a2230" stroke-width="3" fill="none"/><circle cx="32" cy="38" r="3" fill="#2a2230"/><path d="M12 36 Q18 34 20 40 M52 36 Q46 34 44 40" stroke="#d8412f" stroke-width="3" fill="none"/></svg>`,
  { size: 128 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#f7f3e8" stroke="#f3c14f" stroke-width="4"/><g fill="none" stroke="#3ed6bd" stroke-width="4" stroke-linecap="round"><path d="M32 32 C32 25 40 24 41 30 C42 38 30 42 23 36 C16 29 22 17 33 16 C42 15 50 21 50 29"/></g></svg>`,
  { size: 192 },
);
const DOOR = svg(
  `<svg viewBox="0 0 64 80"><rect x="2" y="2" width="60" height="76" fill="#e8d5a8" stroke="#432a1e" stroke-width="4"/><path d="M32 2V78M2 40H62" stroke="#432a1e" stroke-width="3"/><path d="M8 8H26M38 8H56M8 46H26M38 46H56" stroke="#c9a96a" stroke-width="3"/></svg>`,
  { size: 192 },
);
const PLAQUE = svg(
  `<svg viewBox="0 0 80 60"><path d="M4 18 L40 4 L76 18 V56 H4Z" fill="#c8935a" stroke="#432a1e" stroke-width="3"/><path d="M22 26 L40 40 L58 26 M40 22V50" stroke="#432a1e" stroke-width="4" fill="none"/><circle cx="40" cy="12" r="2.5" fill="#432a1e"/></svg>`,
  { size: 128 },
);
const SHIDE = svg(
  `<svg viewBox="0 0 24 64"><path d="M12 2 L22 12 L8 22 L20 32 L6 44 L16 62 L12 62 L2 44 L14 32 L2 22 L14 12 L2 8Z" fill="#fff" stroke="#bfc8d8" stroke-width="2"/></svg>`,
  { size: 96 },
);
const PETAL = svg(
  `<svg viewBox="0 0 32 32"><path d="M16 30 C2 20 2 6 10 2 L16 8 L22 2 C30 6 30 20 16 30Z" fill="#ffb7cf" stroke="#ff8fb0" stroke-width="2"/></svg>`,
  { size: 64 },
);
const GRASS = svg(
  `<svg viewBox="0 0 48 64"><path d="M6 64 L8 14 L18 64Z" fill="#4f9d36"/><path d="M16 64 L26 4 L32 64Z" fill="#6fae48"/><path d="M30 64 L44 18 L42 64Z" fill="#8cc94a"/></svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "roadsideShrine", paintSize: 2048 });
  const R = rng(11);

  const box = (size: V3, at: V3, color: any, rot?: V3, name?: string) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, rotation: rot, name, flat: true });
  const cyl = (rt: number, rb: number, h: number, at: V3, color: any, seg = 10, rot?: V3, name?: string) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, rotation: rot, name, flat: true });
  const sph = (r: number, at: V3, color: any, scale?: V3, name?: string) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at, scale, name });

  // ---- ground: stone platform and path
  box([4.6, 0.1, 4.2], [0, 0.05, 0], PATH, undefined, "platform");
  box([4.8, 0.05, 4.4], [0, 0.025, 0], STONE_D, undefined, "platformFoot");
  box([1.0, 0.07, 1.8], [0, 0.055, 3.0], PATH, undefined, "pathA");
  box([0.8, 0.06, 1.0], [0.05, 0.05, 4.2], PATH, [0, 8, 0], "pathB");
  for (let i = 0; i < 7; i++) box([0.4, 0.08, 0.3], [(i % 2 ? 0.2 : -0.2), 0.045, 2.0 + i * 0.35], i % 2 ? STONE : STONE_D, [0, i * 9, 0], "stepStone");

  // ---- torii gate
  const TZ = 1.5;
  for (const s of [-1, 1]) {
    cyl(0.15, 0.17, 3.1, [s * 1.15, 1.6, TZ], RED, 10, undefined, "toriiPillar");
    cyl(0.2, 0.2, 0.18, [s * 1.15, 0.19, TZ], BLACK, 10, undefined, "pillarFoot");
    cyl(0.26, 0.28, 0.14, [s * 1.15, 0.12, TZ], STONE, 8, undefined, "pillarStone");
  }
  b.extrude(
    [[-2.05, 3.3], [-1.3, 3.13], [1.3, 3.13], [2.05, 3.3], [1.98, 3.46], [1.3, 3.3], [-1.3, 3.3], [-1.98, 3.46]],
    { at: [0, 0, TZ], x: [1, 0, 0], thickness: 0.36, bevel: 0.02, color: RED, name: "kasagi" },
  );
  box([4.2, 0.1, 0.4], [0, 3.52, TZ], BLACK, undefined, "shimaki");
  box([2.7, 0.2, 0.2], [0, 2.78, TZ], RED, undefined, "nuki");
  for (const s of [-1, 1]) box([0.24, 0.24, 0.26], [s * 1.15, 2.78, TZ], BLACK, undefined, "nukiCap");
  box([0.34, 0.5, 0.14], [0, 3.0, TZ], BLACK, undefined, "gakuzuka");
  b.part(new THREE.PlaneGeometry(0.4, 0.34), "#ffffff", { at: [0, 3.0, TZ + 0.078], dir: [0, 0, 1], axis: "z", texture: PLAQUE, name: "plaque" });
  for (const s of [-1, 1]) {
    b.part(new THREE.PlaneGeometry(0.4, 0.34), "#ffffff", { at: [0, 3.0, TZ - 0.078], dir: [0, 0, -1], axis: "z", texture: PLAQUE, name: "plaqueBack" });
    break;
  }

  // shimenawa rope with shide
  const rope = catmull([[-1.0, 2.95, TZ + 0.18], [-0.5, 2.78, TZ + 0.22], [0, 2.72, TZ + 0.24], [0.5, 2.78, TZ + 0.22], [1.0, 2.95, TZ + 0.18]]);
  b.sweep(rope, [0.065, 0.065], { color: ROPE, sides: 6, name: "shimenawa" });
  b.sweep(catmull([[-1.0, 2.95, TZ + 0.18], [-1.1, 2.9, TZ + 0.17]]), 0.05, { color: ROPE, sides: 6 });
  b.cards(
    [0.12, 0.3, 0.5, 0.7, 0.88].map((t) => frame(rope.at(t), [0, 1, 0])),
    SHIDE,
    { size: [0.14, 0.34], lean: 180, flow: [0, 0, 1], sink: 0, name: "shide" },
  );

  // hanging paper lanterns (glow)
  for (const s of [-1, 1]) {
    const x = s * 0.62;
    b.rod([x, 3.1, TZ + 0.0], [x, 2.78, TZ + 0.0], 0.012, { color: BLACK });
    b.lathe([[0, 0], [0.08, 0], [0.13, 0.06], [0.16, 0.18], [0.13, 0.3], [0.08, 0.36], [0, 0.36]], {
      at: [x, 2.42, TZ - 0.3 + 0.3], segments: 10, color: BLACK, name: "lanternShell",
    });
    glow(b.lathe([[0, 0.02], [0.075, 0.02], [0.12, 0.08], [0.15, 0.18], [0.12, 0.28], [0.075, 0.34], [0, 0.34]], {
      at: [x, 2.43, TZ], segments: 10, color: PAPER, name: "lanternPaper",
    }), 1.3);
    b.rod([x, 2.78, TZ], [x, 2.78, TZ], 0.001, { color: BLACK });
  }

  // ---- hokora shrine
  const SZ = -1.0;
  box([1.7, 0.22, 1.4], [0, 0.21, SZ], STONE, undefined, "shrineBase");
  box([1.9, 0.06, 1.6], [0, 0.13, SZ], STONE_D, undefined, "shrineStep");
  box([1.3, 1.0, 1.0], [0, 0.82, SZ], WOOD, undefined, "shrineBody");
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.07, 0.07, 1.1, [sx * 0.68, 0.87, SZ + sz * 0.5], RED, 8, undefined, "shrinePost");
  box([1.5, 0.08, 0.14], [0, 1.38, SZ + 0.52], RED, undefined, "shrineBeam");
  b.part(new THREE.PlaneGeometry(0.58, 0.72), "#ffffff", { at: [0, 0.8, SZ + 0.505], dir: [0, 0, 1], axis: "z", texture: DOOR, name: "door" });
  // roof
  b.extrude([[-1.15, 0], [1.15, 0], [0.12, 0.62], [-0.12, 0.62]], {
    at: [0, 1.4, SZ], x: [1, 0, 0], thickness: 1.5, bevel: 0.02, color: DARKWOOD, name: "roofGable",
  });
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.06, 1.8), s > 0 ? BLACK : BLACK, { at: [s * 0.6, 1.72, SZ], rotation: [0, 0, s * -28], name: "roofSlab" });
    b.part(new THREE.BoxGeometry(0.8, 0.07, 1.82), cel("#3a4a6a", "#222c50"), { at: [s * 0.62, 1.74, SZ], rotation: [0, 0, s * -28], name: "roofTile" });
  }
  cyl(0.07, 0.07, 1.8, [0, 2.05, SZ], GOLD, 6, [90, 0, 0], "ridge");
  for (const s of [-1, 1]) sph(0.09, [0, 2.05, SZ + s * 0.9], GOLD, undefined, "ridgeEnd");
  b.part(new THREE.CircleGeometry(0.2, 16), "#ffffff", { at: [0, 1.7, SZ + 0.752], dir: [0, 0, 1], axis: "z", texture: EMBLEM, name: "gableEmblem" });
  // front rope + bell
  b.sweep(catmull([[-0.6, 1.3, SZ + 0.6], [0, 1.2, SZ + 0.62], [0.6, 1.3, SZ + 0.6]]), 0.03, { color: ROPE, sides: 6, name: "bellRope" });
  sph(0.08, [0, 1.12, SZ + 0.62], GOLD, [1, 1, 1], "bell");
  glow(b.part(new THREE.BoxGeometry(0.02, 0.5, 0.02), "#ffd27a", { at: [0, 0.8, SZ + 0.5], name: "doorGap" }), 0.8);

  // ---- fox guardians
  for (const s of [-1, 1]) {
    const x = s * 1.35;
    const z = 0.2;
    box([0.5, 0.36, 0.5], [x, 0.28, z], STONE, undefined, "foxPlinth");
    const body = b.part(new THREE.SphereGeometry(0.2, 8, 6), STONE, { at: [x, 0.66, z - 0.02], scale: [0.95, 1.5, 0.95], name: "foxBody" });
    void body;
    for (const e of [-1, 1]) cyl(0.04, 0.05, 0.32, [x + e * 0.07, 0.62, z + 0.14], STONE, 6, undefined, "foxLeg");
    sph(0.15, [x, 1.0, z + 0.05], STONE, [1, 0.95, 1], "foxHead");
    b.part(new THREE.ConeGeometry(0.1, 0.16, 6), STONE, { at: [x, 0.97, z + 0.22], rotation: [90, 0, 0], name: "foxMuzzle" });
    sph(0.025, [x, 0.97, z + 0.31], "#2a2230", undefined, "foxNose");
    for (const e of [-1, 1]) {
      b.part(new THREE.ConeGeometry(0.06, 0.2, 4), STONE, { at: [x + e * 0.09, 1.19, z + 0.0], rotation: [0, 0, e * -12], name: "foxEar" });
      sph(0.02, [x + e * 0.07, 1.04, z + 0.17], "#2a2230", undefined, "foxEye");
    }
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", { at: [x, 1.0, z + 0.2], dir: [0, 0, 1], axis: "z", texture: FOX_FACE, name: "foxFace" });
    // bib
    b.part(new THREE.TorusGeometry(0.13, 0.04, 5, 10), RED, { at: [x, 0.82, z + 0.04], rotation: [90, 0, 0], name: "foxBib" });
    b.sweep(catmull([[x - s * 0.18, 0.45, z - 0.18], [x - s * 0.3, 0.6, z - 0.28], [x - s * 0.22, 0.95, z - 0.3], [x - s * 0.08, 1.05, z - 0.2]]), [0.07, 0.025], { color: STONE, sides: 6, name: "foxTail" });
  }

  // ---- stone lanterns (toro)
  for (const s of [-1, 1]) {
    const x = s * 1.9;
    const z = -0.2;
    cyl(0.28, 0.32, 0.12, [x, 0.16, z], STONE_D, 6, undefined, "toroBase");
    cyl(0.1, 0.12, 0.85, [x, 0.64, z], STONE, 8, undefined, "toroPost");
    b.lathe([[0, 0], [0.34, 0.04], [0.3, 0.1], [0.14, 0.14], [0, 0.14]], { at: [x, 1.07, z], segments: 6, color: STONE, name: "toroDeck" });
    box([0.3, 0.32, 0.3], [x, 1.37, z], STONE_D, undefined, "toroFire");
    for (const d of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      glow(b.part(new THREE.BoxGeometry(d[0] ? 0.02 : 0.15, 0.18, d[1] ? 0.02 : 0.15), "#ffc766", { at: [x + d[0] * 0.152, 1.37, z + d[1] * 0.152], name: "toroLight" }), 1.4);
    }
    b.part(new THREE.ConeGeometry(0.5, 0.3, 6), STONE, { at: [x, 1.68, z], rotation: [0, 0, 0], name: "toroRoof" });
    b.part(new THREE.ConeGeometry(0.58, 0.08, 6), STONE_D, { at: [x, 1.55, z], name: "toroEave" });
    sph(0.08, [x, 1.88, z], TEAL, [1, 1.3, 1], "toroJewel");
    // moss
    b.part(new THREE.SphereGeometry(0.2, 7, 4, 0, 6.28, 0, 1.2), MOSS, { at: [x + s * 0.05, 0.2, z + 0.1], scale: [1, 0.35, 1], name: "toroMoss" });
  }

  // ---- offering table
  const OX = 0.0;
  const OZ = 0.45;
  box([1.0, 0.07, 0.5], [OX, 0.58, OZ], WOOD, undefined, "tableTop");
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box([0.06, 0.45, 0.06], [OX + sx * 0.44, 0.345, OZ + sz * 0.2], DARKWOOD, undefined, "tableLeg");
  box([0.9, 0.012, 0.4], [OX, 0.625, OZ], "#c0392b", undefined, "cloth");
  // plate of apples
  cyl(0.15, 0.1, 0.03, [OX - 0.3, 0.65, OZ], WHITE, 10, undefined, "plate");
  for (const [dx, dz, dy] of [[-0.05, 0, 0], [0.06, 0.02, 0], [0, -0.07, 0], [0.01, -0.02, 0.07]] as const)
    sph(0.058, [OX - 0.3 + dx, 0.715 + dy, OZ + dz], "#e8453c", undefined, "apple");
  // rice mound & sake
  b.part(new THREE.ConeGeometry(0.1, 0.12, 8), WHITE, { at: [OX + 0.05, 0.7, OZ + 0.02], name: "riceMound" });
  cyl(0.11, 0.1, 0.03, [OX + 0.05, 0.65, OZ + 0.02], "#2a2230", 10, undefined, "riceBowl");
  b.lathe([[0, 0], [0.06, 0], [0.065, 0.14], [0.03, 0.2], [0.025, 0.28], [0, 0.28]], { at: [OX + 0.33, 0.62, OZ - 0.05], segments: 8, color: "#e9e4d4", name: "sakeBottle" });
  b.part(new THREE.CylinderGeometry(0.066, 0.066, 0.07, 8), "#2f6fb0", { at: [OX + 0.33, 0.7, OZ - 0.05], name: "sakeLabel" });
  cyl(0.04, 0.03, 0.05, [OX + 0.42, 0.66, OZ + 0.1], "#f7f3e8", 8, undefined, "sakeCup");
  // incense
  cyl(0.05, 0.05, 0.04, [OX + 0.18, 0.66, OZ + 0.12], "#8a6a3a", 8, undefined, "incenseBurner");
  for (const k of [-1, 0, 1]) {
    b.rod([OX + 0.18 + k * 0.015, 0.68, OZ + 0.12], [OX + 0.18 + k * 0.03, 0.85, OZ + 0.12], 0.004, { color: "#7a4a2a", sides: 4 });
    glow(sph(0.01, [OX + 0.18 + k * 0.03, 0.855, OZ + 0.12], "#ff7a3c"), 1.6);
  }
  // coins
  for (let i = 0; i < 5; i++) cyl(0.025, 0.025, 0.006, [OX - 0.05 + R() * 0.2, 0.632 + (i > 2 ? 0.006 : 0), OZ + 0.17 + R() * 0.03], GOLD, 8, undefined, "coin");
  // ema wooden plaques hanging on a rack
  box([0.06, 0.8, 0.06], [1.5, 0.5, -0.1], DARKWOOD, undefined, "emaPost");
  box([0.06, 0.8, 0.06], [2.2, 0.5, -0.1], DARKWOOD, undefined, "emaPost");
  box([0.8, 0.06, 0.08], [1.85, 0.9, -0.1], DARKWOOD, undefined, "emaBar");
  for (let i = 0; i < 3; i++) {
    const x = 1.62 + i * 0.22;
    b.part(new THREE.PlaneGeometry(0.17, 0.14), "#ffffff", { at: [x, 0.76, -0.04], dir: [0, 0, 1], axis: "z", texture: PLAQUE, name: "ema" });
    b.rod([x, 0.9, -0.1], [x, 0.84, -0.04], 0.004, { color: ROPE, sides: 4 });
  }

  // ---- glowing crystal-flower offering and fairy-light lanterns on ground
  for (const [x, z] of [[-0.9, 2.4], [0.9, 2.4]] as const) {
    cyl(0.12, 0.14, 0.12, [x, 0.12, z], STONE_D, 6, undefined, "pedestal");
    glow(b.part(new THREE.OctahedronGeometry(0.12), "#7ff3d8", { at: [x, 0.38, z], scale: [0.8, 1.5, 0.8], name: "windCrystal" }), 1.5);
  }

  // ---- vegetation and petals
  const hits: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 70; i++) {
    const a = R() * Math.PI * 2;
    const r = 2.3 + R() * 0.25;
    const x = Math.cos(a) * r * 1.0;
    const z = Math.sin(a) * r * 0.9;
    if (Math.abs(x) < 0.7 && z > 1.8) continue;
    hits.push(frame([Math.max(-2.3, Math.min(2.3, x)), 0.08, Math.max(-2.1, Math.min(2.1, z))], [0, 1, 0]));
  }
  b.cards(hits, GRASS, { size: [0.14, 0.2], cross: true, vary: 0.3, spin: 180, rng: rng(3), lean: 8 });
  const pet: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 50; i++) pet.push(frame([(R() - 0.5) * 4.2, 0.115, (R() - 0.5) * 3.8 + 0.5], [0, 1, 0]));
  b.cards(pet, PETAL, { size: 0.07, lean: 90, flow: [1, 0, 0], mirror: true, spin: 180, rng: rng(9), sink: 0 });

  return b.root;
}
```