import * as THREE from "three";
import { catmull, createBuilder, frame, grain, mix, noise, paint, stripes, svg } from "../../../../src/index";
import type { ColorInput } from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Roadside Shrine",
  description:
    "A small wayside shrine on a stone plinth: a wooden hokora with a red-cloth offering table, two stone lanterns, " +
    "a vermilion torii behind with a shimenawa rope and shide streamers, and incense smoking from a bronze burner.",
};

type Pt = [number, number] | [number, number, "sharp"];
type V = [number, number, number];
type Opt = NonNullable<Parameters<ReturnType<typeof createBuilder>["part"]>[2]>;

// ---------------------------------------------------------------------------------------------------------------
// Palette: saturated, cel-shaded, with a few painted surfaces.

const VERM = cel("#e0412f", "#a8262a");
const BLACK = cel("#37334f", "#221f36");
const GOLD = cel("#ffd35c", "#d99a2b");
const CLOTH = cel("#e8475a", "#a52c48");
const PAPER = cel("#fff6e6", "#d9c7aa");
const RICE = cel("#ffffff", "#d8d4e8");
const ORANGE = cel("#ff9a3c", "#d0581e");
const SAKE = cel("#fff0d6", "#d9b98c");
const STICK = cel("#c9a57a", "#8e6a46");
const WOOD = cel(grain("#b5673a", "#7a3b22", { size: 0.035, axis: "y" }));
const ROPE = cel(stripes("#f1e6c8", "#b89b6a", { size: 0.035, axis: "x", width: 0.5 }));
const STONE = cel(
  paint((p, n) =>
    n.y > 0.55 && noise(p, 0.09, 4) > 0.5 ? "#7fb35a" : mix("#cbc8d8", "#a4a1b8", noise(p, 0.05, 8)),
  ),
);
const LANTERN = "#ffd77a";
const EMBER = "#ff5a3c";
const MITSU = "#ffe9a8";

// Textures
const OFUDA = svg(
  `<svg viewBox="0 0 40 120">
    <rect width="40" height="120" fill="#f6ecd2"/>
    <rect x="4" y="4" width="32" height="112" fill="none" stroke="#b3261e" stroke-width="2.5"/>
    <path d="M20 18 V102 M12 34 H28 M12 56 H28 M12 78 H28" stroke="#b3261e" stroke-width="3" fill="none"/>
  </svg>`,
  { size: 160 },
);
const SMOKE = svg(
  `<svg viewBox="0 0 64 128">
    <path d="M32 124 C16 100 48 84 32 62 C16 40 48 26 32 4" stroke="#ffffff" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M44 120 C34 98 56 88 46 66" stroke="#ffffff" stroke-width="6" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

// Shide: the zigzag paper streamer.
const ZIG: Pt[] = [
  [-0.06, 0],
  [0.06, 0],
  [0.06, -0.16],
  [0.03, -0.22],
  [0, -0.16],
  [-0.03, -0.22],
  [-0.06, -0.16],
];
const BOWL: Pt[] = [
  [0, 0],
  [0.06, 0],
  [0.09, 0.06],
  [0.1, 0.1],
  [0.085, 0.1],
  [0.07, 0.06],
  [0, 0.03],
];
const CUP: Pt[] = [
  [0, 0],
  [0.035, 0],
  [0.04, 0.035],
  [0.034, 0.035],
  [0.028, 0.012],
  [0, 0.012],
];
const BURNER: Pt[] = [
  [0, 0],
  [0.1, 0],
  [0.11, 0.035],
  [0.07, 0.085],
  [0.03, 0.09],
  [0, 0.09],
];
const LANTERN_BASE: Pt[] = [
  [0, 0],
  [0.2, 0],
  [0.2, 0.04],
  [0.12, 0.08],
  [0, 0.08],
];
const LANTERN_PLATE: Pt[] = [
  [0, 0],
  [0.17, 0],
  [0.17, 0.05],
  [0.1, 0.09],
  [0, 0.09],
];
const LANTERN_ROOF: Pt[] = [
  [0, 0],
  [0.25, 0],
  [0.19, 0.07],
  [0.06, 0.12],
  [0, 0.14],
];
const KASAGI: Pt[] = [
  [-2.1, 3.25],
  [2.1, 3.25],
  [2.45, 3.5, "sharp"],
  [2.0, 3.35],
  [-2.0, 3.35],
  [-2.45, 3.5, "sharp"],
];
const KASAGI_CAP: Pt[] = [
  [-2.2, 3.3],
  [2.2, 3.3],
  [2.62, 3.6, "sharp"],
  [2.1, 3.45],
  [-2.1, 3.45],
  [-2.62, 3.6, "sharp"],
];
const HOKORA_ROOF: Pt[] = [
  [-0.62, 0.06],
  [0.62, 0.06],
  [0.62, 0.1],
  [0, 0.36, "sharp"],
  [-0.62, 0.1],
];

export default function build() {
  const b = createBuilder({ name: "roadside-shrine" });

  const put = (g: THREE.BufferGeometry, color: ColorInput, at: V, o: Partial<Opt> = {}) =>
    b.part(g, color, { at, flat: true, ...o } as Opt);
  const box = (w: number, h: number, d: number, color: ColorInput, at: V, o: Partial<Opt> = {}) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, o);
  const sphere = (r: number, color: ColorInput, at: V, scale?: V) =>
    put(new THREE.SphereGeometry(r, 8, 6), color, at, scale ? { scale } : {});
  const lathe = (outline: Pt[], color: ColorInput, at: V, segments = 10) =>
    b.lathe(outline, { at, color, segments });

  // -------------------------------------------------------------------------------------------------------------
  // Torii, behind the shrine, standing on its own stone bases.
  const TZ = -1.5;
  for (const s of [-1, 1]) {
    box(0.36, 0.14, 0.36, BLACK, [s * 1.3, 0.07, TZ]);
    put(new THREE.CylinderGeometry(0.095, 0.11, 3.16, 10), VERM, [s * 1.3, 1.72, TZ]);
  }
  b.extrude(KASAGI, { at: [0, 0, TZ], x: [1, 0, 0], thickness: 0.24, color: VERM });
  b.extrude(KASAGI_CAP, { at: [0, 0, TZ], x: [1, 0, 0], thickness: 0.3, color: BLACK });
  b.rod([-1.3, 2.7, TZ], [1.3, 2.7, TZ], 0.07, VERM);
  // Shimenawa rope sagging between the pillars, with shide streamers hung along it.
  b.sweep(
    catmull([
      [-1.25, 2.95, TZ],
      [0, 2.78, TZ],
      [1.25, 2.95, TZ],
    ]),
    0.032,
    { color: ROPE },
  );
  for (const x of [-0.9, -0.45, 0, 0.45, 0.9]) {
    const top = 2.78 + 0.17 * (x / 1.25) ** 2;
    b.extrude(ZIG, { at: [x, top - 0.02, TZ + 0.03], x: [1, 0, 0], thickness: 0.008, color: PAPER });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Stone plinth under the shrine.
  box(3.0, 0.12, 1.9, STONE, [0, 0.06, 0.5]);

  // -------------------------------------------------------------------------------------------------------------
  // Hokora, the wooden shrine box.
  box(1.0, 0.25, 0.8, STONE, [0, 0.245, 0.2]);
  box(0.8, 0.55, 0.6, WOOD, [0, 0.645, 0.2]);
  box(0.36, 0.34, 0.02, cel("#4a2b28"), [0, 0.6, 0.51]);
  b.extrude(HOKORA_ROOF, { at: [0, 0.86, 0.2], x: [0, 0, 1], thickness: 1.16, color: BLACK });
  box(0.1, 0.1, 0.1, GOLD, [0, 1.23, 0.2]);
  sphere(0.05, GOLD, [0, 1.26, 0.2]);
  // Ofuda talismans on the side walls.
  for (const s of [-1, 1]) {
    put(new THREE.PlaneGeometry(0.1, 0.3), "#ffffff", [s * 0.405, 0.7, 0.2], {
      dir: [s, 0, 0],
      axis: "z",
      texture: OFUDA,
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Offering table with a red cloth, in front of the shrine.
  box(1.0, 0.06, 0.46, WOOD, [0, 0.4, 0.92]);
  for (const x of [-0.44, 0.44]) for (const z of [0.73, 1.11]) box(0.06, 0.25, 0.06, WOOD, [x, 0.245, z]);
  box(1.02, 0.012, 0.48, CLOTH, [0, 0.436, 0.92]);
  box(1.0, 0.12, 0.02, CLOTH, [0, 0.37, 1.16]);

  // Rice bowls with heaped rice.
  for (const x of [-0.3, 0.3]) {
    lathe(BOWL, RICE, [x, 0.442, 0.98]);
    sphere(0.07, RICE, [x, 0.5, 0.98], [1, 0.5, 1]);
  }
  // Sake cups.
  for (const x of [-0.14, 0.14]) lathe(CUP, SAKE, [x, 0.442, 0.86], 8);
  // Mochi stack.
  sphere(0.04, RICE, [-0.32, 0.482, 0.78]);
  sphere(0.035, RICE, [-0.32, 0.545, 0.78]);
  // Oranges.
  sphere(0.045, ORANGE, [0.3, 0.487, 0.76]);
  sphere(0.045, ORANGE, [0.36, 0.487, 0.8]);
  sphere(0.045, ORANGE, [0.33, 0.53, 0.78]);

  // Bronze incense burner with three sticks, glowing at the tips.
  lathe(BURNER, GOLD, [0, 0.442, 0.76]);
  const sticks: [V, V][] = [
    [
      [-0.02, 0.53, 0.76],
      [-0.03, 0.68, 0.76],
    ],
    [
      [0, 0.53, 0.76],
      [0, 0.7, 0.76],
    ],
    [
      [0.02, 0.53, 0.76],
      [0.03, 0.67, 0.76],
    ],
  ];
  for (const [a, c] of sticks) {
    b.rod(a, c, 0.004, STICK);
    glow(put(new THREE.SphereGeometry(0.008, 6, 4), EMBER, c));
  }
  // Smoke wisps rising from the burner.
  const smoke = [
    frame([0, 0.72, 0.76], [0, 1, 0]),
    frame([0.02, 0.86, 0.77], [0, 1, 0]),
    frame([-0.01, 0.98, 0.75], [0, 1, 0]),
  ];
  b.cards(smoke, SMOKE, { size: [0.14, 0.34], lean: 0, color: "#e6e2f2" });

  // -------------------------------------------------------------------------------------------------------------
  // Two stone lanterns (tōrō) flanking the shrine, glowing through their windows.
  const toro = (x: number, z: number) => {
    const y0 = 0.12;
    lathe(LANTERN_BASE, STONE, [x, y0, z], 8);
    put(new THREE.CylinderGeometry(0.06, 0.085, 0.5, 8), STONE, [x, 0.45, z]);
    lathe(LANTERN_PLATE, STONE, [x, 0.7, z], 8);
    box(0.26, 0.18, 0.26, STONE, [x, 0.88, z]);
    for (const s of [1, -1]) {
      glow(
        put(new THREE.PlaneGeometry(0.15, 0.15), MITSU, [x, 0.88, z + s * 0.134], {
          dir: [0, 0, s],
          axis: "z",
        }),
        1.3,
      );
    }
    lathe(LANTERN_ROOF, STONE, [x, 0.97, z], 6);
    sphere(0.035, GOLD, [x, 1.13, z]);
  };
  toro(-1.15, 0.45);
  toro(1.15, 0.45);

  // Light glowing from the burner's lantern-like tips is handled above; the lanterns carry the warm glow.
  void LANTERN;
  return b.root;
}
