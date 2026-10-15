import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { paint, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "A towering glacier-steel battle axe on an icy plinth: crescent blade with rune glow, gold trim, glowing core gem and frost crystals.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const STEEL = "#34425f";
const STEEL_L = "#6a7fa6";
const GOLD = "#f0b94a";
const GOLD_D = "#b57d26";
const ICE = "#8fe6ff";
const ICE_W = "#eefcff";
const DEEP = "#2f78cc";
const DEEP2 = "#1c4a92";
const GLOW = "#6ff4ff";
const LEATHER = "#6a3f2c";
const LEATHER_D = "#3a2118";
const WOOD = "#2a3150";
const WOOD_L = "#3d4a73";
const STONE = "#4a5778";
const STONE_D = "#2e3852";

export default function build() {
  const b = createBuilder({ name: "frostAxe" });
  const root = b.joint("root", { at: [0, 0.07, 0] });
  const rand = rng(11);

  const P = (g: THREE.BufferGeometry, color: Parameters<typeof b.part>[1], at: number[], o: Record<string, unknown> = {}) =>
    b.part(g, color, { bone: root, at, flat: true, ...o });

  const steelPaint = cel(STEEL);
  const steelLite = cel(STEEL_L);
  const goldPaint = cel(GOLD, GOLD_D);

  // ---- plinth ----
  const stonePaint = cel(
    paint((p, _n, s) => {
      const k = Math.sin(p.x * 40) * Math.sin(p.z * 40);
      return k > 0.55 || s[1] > 0.97 ? STONE_D : STONE;
    }),
  );
  P(new THREE.CylinderGeometry(0.3, 0.33, 0.06, 8), stonePaint, [0, 0.03, 0]);
  P(new THREE.CylinderGeometry(0.22, 0.27, 0.09, 8), cel(STONE_D, "#222b42"), [0, 0.105, 0]);
  P(new THREE.TorusGeometry(0.235, 0.012, 4, 16), goldPaint, [0, 0.152, 0], { rotation: [90, 0, 0] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    P(new THREE.BoxGeometry(0.035, 0.03, 0.035), GOLD, [0.3 * Math.cos(a), 0.06, 0.3 * Math.sin(a)], { rotation: [0, -a * 57.3, 0] });
  }

  // ---- ice crystals round the plinth ----
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + rand() * 0.3;
    const rr = 0.2 + rand() * 0.05;
    const h = 0.1 + rand() * 0.16;
    const x = rr * Math.cos(a);
    const z = rr * Math.sin(a);
    P(new THREE.ConeGeometry(0.028 + rand() * 0.012, h, 5), i % 3 === 0 ? ICE_W : ICE, [x, 0.15 + h * 0.4, z], {
      dir: [Math.cos(a) * 0.45, 1, Math.sin(a) * 0.45],
    });
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.8;
    const x = 0.3 * Math.cos(a);
    const z = 0.3 * Math.sin(a);
    glow(
      P(new THREE.OctahedronGeometry(0.03), GLOW, [x, 0.095, z], { scale: [1, 1.8, 1], dir: [Math.cos(a) * 0.4, 1, Math.sin(a) * 0.4] }),
      1.2,
    );
  }

  // ---- haft ----
  const wood = stripes(WOOD, WOOD_L, { size: 0.03, axis: "x", width: 0.3, wobble: 0.8, seed: 3 });
  b.rod([0, 0.17, 0], [0, 1.37, 0], 0.028, cel(wood), { bone: root, sides: 6 });
  // grip
  const grip = stripes(LEATHER, LEATHER_D, { size: 0.035, axis: "y", width: 0.4, wobble: 0.3, seed: 5 });
  b.rod([0, 0.34, 0], [0, 0.78, 0], 0.036, cel(grip), { bone: root, sides: 8 });
  for (let y = 0.36; y < 0.78; y += 0.055)
    P(new THREE.TorusGeometry(0.037, 0.005, 4, 10), LEATHER_D, [0, y, 0], { rotation: [90, 0, 0] });
  for (const y of [0.33, 0.79]) {
    P(new THREE.CylinderGeometry(0.044, 0.044, 0.025, 8), goldPaint, [0, y, 0]);
    P(new THREE.TorusGeometry(0.044, 0.007, 4, 10), GOLD_D, [0, y + 0.014, 0], { rotation: [90, 0, 0] });
  }
  // butt cap and spike
  P(new THREE.CylinderGeometry(0.04, 0.034, 0.05, 8), steelLite, [0, 0.2, 0]);
  P(new THREE.CylinderGeometry(0.044, 0.044, 0.014, 8), goldPaint, [0, 0.23, 0]);
  P(new THREE.ConeGeometry(0.03, 0.12, 6), ICE, [0, 0.12, 0], { dir: [0, -1, 0] });
  // ribbon / charm hanging from the grip
  const ribbon = [
    [0.05, 0.0],
    [0.05, -0.12],
    [0.025, -0.2, "sharp"],
    [0, -0.12],
    [0, 0.0],
  ] as Array<[number, number] | [number, number, "sharp"]>;
  b.extrude(ribbon, { at: [0.035, 0.78, 0.04], x: [1, 0, 0], thickness: 0.006, color: DEEP, bone: root });
  P(new THREE.OctahedronGeometry(0.018), GLOW, [0.06, 0.6, 0.044]);

  // ---- axe head ----
  const HY = 1.06;
  P(new THREE.BoxGeometry(0.17, 0.54, 0.11), steelPaint, [0, HY, 0]);
  P(new THREE.BoxGeometry(0.19, 0.07, 0.13), steelLite, [0, HY + 0.27, 0]);
  P(new THREE.BoxGeometry(0.19, 0.07, 0.13), steelLite, [0, HY - 0.27, 0]);
  for (const y of [HY + 0.31, HY - 0.31]) P(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 8), goldPaint, [0, y, 0]);
  // gold side plates
  for (const s of [1, -1]) {
    P(new THREE.BoxGeometry(0.012, 0.42, 0.115), goldPaint, [s * 0.088, HY, 0]);
    for (const y of [HY + 0.17, HY - 0.17]) P(new THREE.SphereGeometry(0.012, 5, 4), GOLD_D, [s * 0.095, y, 0.04]);
  }
  // top spike
  P(new THREE.ConeGeometry(0.032, 0.2, 6), ICE, [0, 1.34 + 0.12, 0]);
  P(new THREE.ConeGeometry(0.02, 0.1, 5), ICE_W, [0, 1.34 + 0.06 + 0.1 + 0.02, 0], { scale: [1, 0.8, 1] });
  // core gem
  for (const s of [1, -1]) {
    P(new THREE.TorusGeometry(0.036, 0.008, 4, 8), goldPaint, [0, HY, s * 0.057]);
    glow(P(new THREE.OctahedronGeometry(0.036), GLOW, [0, HY, s * 0.062], { scale: [1, 1.4, 0.7] }), 1.6);
  }
  // rivets on block front
  for (const s of [1, -1])
    for (const y of [HY + 0.12, HY - 0.12]) P(new THREE.SphereGeometry(0.01, 5, 4), GOLD, [s * 0.05, y, 0.057]);

  // main blade
  const outer = (y: number) => 0.54 - 0.14 * (y / 0.34) ** 2;
  const bladePaint = cel(
    paint((_p, _n, s) => {
      const [x, y] = s;
      if (x > outer(y) - 0.035) return ICE_W;
      if (Math.abs(y) < 0.012 && x > 0.12) return DEEP2;
      if (x > outer(y) - 0.13) return ICE;
      if (x > outer(y) - 0.2 && Math.sin((x + y) * 60) > 0.8) return ICE;
      return DEEP;
    }),
  );
  const blade: Array<[number, number] | [number, number, "sharp"]> = [
    [0, 0.17],
    [0.12, 0.21],
    [0.27, 0.3],
    [0.41, 0.36, "sharp"],
    [0.5, 0.19],
    [0.54, 0],
    [0.51, -0.2],
    [0.44, -0.42, "sharp"],
    [0.27, -0.32],
    [0.12, -0.21],
    [0, -0.17],
  ];
  const BX = 0.08;
  b.extrude(blade, { at: [BX, HY, 0], x: [1, 0, 0], thickness: 0.035, bevel: 0.008, color: bladePaint, bone: root, name: "blade" });
  // gold trim along the blade's spine edges, both faces
  for (const s of [1, -1]) {
    const top = [
      [0.1, 0.19],
      [0.12, 0.21],
      [0.27, 0.3],
      [0.4, 0.35],
    ].map(([x, y]) => [BX + x, HY + y - 0.012, s * 0.021]);
    const bot = [
      [0.1, -0.19],
      [0.12, -0.21],
      [0.27, -0.32],
      [0.43, -0.41],
    ].map(([x, y]) => [BX + x, HY + y + 0.012, s * 0.021]);
    b.sweep(top, 0.007, GOLD, { bone: root, sides: 5 });
    b.sweep(bot, 0.007, GOLD, { bone: root, sides: 5 });
  }
  // runes
  const rune1 = svg(
    `<svg viewBox="0 0 40 120"><g stroke="#7ff4ff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 8V112"/><path d="M8 30L20 44L32 30"/><path d="M10 66L20 78L30 66"/><path d="M8 94L20 104L32 94"/></g></svg>`,
    { size: 256 },
  );
  const rune2 = svg(
    `<svg viewBox="0 0 40 120"><g stroke="#bff9ff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10L34 40L20 70L6 40Z"/><path d="M20 70V112"/><path d="M8 96L32 96"/></g></svg>`,
    { size: 256 },
  );
  const runeSpots: Array<[number, number, number, typeof rune1]> = [
    [0.22, 0.04, 0.17, rune1],
    [0.33, 0.04, 0.2, rune2],
    [0.43, 0.02, 0.12, rune1],
  ];
  for (const s of [1, -1])
    for (const [x, y, h, tex] of runeSpots)
      glow(
        b.part(new THREE.PlaneGeometry(h * 0.33, h), "#ffffff", {
          bone: root,
          at: [BX + x, HY + y, s * 0.0205],
          dir: [0, 0, s],
          axis: "z",
          texture: tex,
        }),
        1.3,
      );

  // rear fluke
  const fluke: Array<[number, number] | [number, number, "sharp"]> = [
    [0, 0.12],
    [0.1, 0.1],
    [0.2, 0.03],
    [0.3, -0.04, "sharp"],
    [0.14, -0.08],
    [0, -0.1],
  ];
  b.extrude(fluke, { at: [-0.08, HY + 0.02, 0], x: [-1, 0, 0], thickness: 0.04, bevel: 0.008, color: cel(paint((_p, _n, s) => (s[0] > 0.2 ? ICE : STEEL_L))), bone: root, name: "fluke" });
  P(new THREE.CylinderGeometry(0.016, 0.016, 0.05, 6), GOLD, [-0.1, HY + 0.02, 0], { rotation: [0, 0, 90] });

  // icicles
  for (const [x, z, h] of [
    [-0.045, 0.045, 0.12],
    [0.0, 0.055, 0.17],
    [0.045, 0.04, 0.1],
    [-0.03, -0.05, 0.11],
    [0.04, -0.05, 0.14],
  ] as const) {
    P(new THREE.ConeGeometry(0.012, h, 5), ICE_W, [x, HY - 0.33 - h * 0.5 + 0.02, z], { dir: [0, -1, 0] });
  }
  // frost shards on the blade's lower horn
  for (let i = 0; i < 5; i++) {
    const x = BX + 0.3 + i * 0.045;
    const y = HY - 0.33 - i * 0.015;
    P(new THREE.ConeGeometry(0.01, 0.06 + rand() * 0.04, 4), ICE, [x, y - 0.03, 0.0], { dir: [0.3, -1, 0] });
  }
  for (let i = 0; i < 4; i++) {
    const x = BX + 0.3 + i * 0.03;
    P(new THREE.ConeGeometry(0.012, 0.07 + rand() * 0.04, 4), ICE_W, [x, HY + 0.33 + i * 0.012, 0.0], { dir: [0.2, 1, 0] });
  }

  return b.root;
}
