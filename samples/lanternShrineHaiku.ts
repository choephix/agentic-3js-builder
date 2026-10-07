import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { mottle, paint, scales, type Paint } from "../src/paint";
import { svg } from "../src/texture";
import { cel, inkLines } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Roadside Shrine with Lanterns",
  description:
    "A roadside shrine plot: a vermilion torii with glowing paper lanterns and gold tassels, a small hokora on a stone dais with a bell and an offering table, stone lanterns, a purification basin, an ema rack, a shimenawa-wrapped sacred stone, grass, flowers and cyan elemental crystals, in cel-shaded Genshin-style colour.",
  style: "Genshin Impact",
  commit: "b816db2",
};

type V3 = [number, number, number];
type Fill = Paint | string;

// ---- Palette: one cel per surface colour (bright lit tone, hue-shifted shadow) ----
const VERMILION = cel("#ff5a3c", "#d9363f");
const VERM_RIM = cel(inkLines("#ff5a3c", { levels: [0], axis: [0, 0, 1], width: 0.1 }));
const NAVY = cel("#3c4fa8", "#2d3380");
const GOLD = cel("#ffd35e", "#e4962f");
const CREAM = cel("#fff5dd", "#f1c9ab");
const ROPE = cel("#f7ebb8", "#d8bf78");
const TEAL = cel(scales("#4fe6cf", "#1fa39a", { size: 0.06, width: 0.2 }));
const STONE = cel(scales("#e0d9f7", "#a79fd0", { size: 0.14, width: 0.12 }));
const STONE_DARK = cel(mottle("#8c86b8", "#5f5a8c", { size: 0.1, seed: 2 }));
const WOOD = cel(mottle("#eeb078", "#c9824f", { size: 0.15, seed: 7 }));
const WOOD_DARK = cel(mottle("#b8703f", "#8a4c2c", { size: 0.08, seed: 8 }));
const PAVER = cel(scales("#fff0dc", "#cdb08e", { size: 0.2, width: 0.12 }));
const GRASS = cel(mottle("#a2ef76", "#63cc66", { size: 0.25, seed: 4 }));
const EARTH = cel(mottle("#d6ad7e", "#94694a", { size: 0.1, seed: 9 }));
const GROUND = paint((_p, n) => (n.y > 0.5 ? GRASS : EARTH));
const BUSH = cel(mottle("#72e27a", "#3fb865", { size: 0.08, seed: 13 }));
const ROCK = cel(mottle("#c4bfe2", "#8f8aba", { size: 0.06, seed: 21 }));
const ROCK_PAINT = paint((_p, n) => (n.y > 0.8 ? GRASS : ROCK));
const ORANGE = cel("#ffa23d", "#f0702f");
const SAKE = cel("#b06a3c", "#7d3f2e");
const RICE = cel("#fffaf2", "#e2d4f4");
const PINK = cel("#ffa7cc", "#e77ab0");
const WATER = cel("#7fe3ff", "#3fb3e0");
const VASE = cel("#9fdcff", "#5fa8e6");

// Self-lit colours (flat, so `glow` shows them at full brightness).
const WARM = "#ffd27a";
const CYAN = "#8ff4ff";

// ---- Drawings (SVG textures) ----
const sunRays = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6;
  const p = (r: number) => `${(85 + Math.cos(a) * r).toFixed(1)} ${(50 + Math.sin(a) * r).toFixed(1)}`;
  return `<path d="M${p(27)} L${p(34)}"/>`;
}).join("");
const GOLD_PLAQUE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 100">
<rect x="2" y="2" width="166" height="96" rx="9" fill="#ffd35e" stroke="#a85f12" stroke-width="4"/>
<rect x="12" y="12" width="146" height="76" rx="5" fill="none" stroke="#a85f12" stroke-width="2.5"/>
<g fill="none" stroke="#a85f12" stroke-width="3" stroke-linecap="round">
<path d="M22 50 C22 30 40 26 48 38 C54 48 44 58 38 50"/>
<path d="M148 50 C148 30 130 26 122 38 C116 48 126 58 132 50"/>
<path d="M22 50 C24 72 44 76 52 62"/>
<path d="M148 50 C146 72 126 76 118 62"/>
</g>
<g stroke="#a85f12" stroke-width="3" stroke-linecap="round">${sunRays}</g>
<circle cx="85" cy="50" r="24" fill="#fff1bd" stroke="#a85f12" stroke-width="3"/>
<path d="M85 34 L97 50 L85 66 L73 50 Z" fill="#ff6a4a" stroke="#a85f12" stroke-width="2.5"/>
<circle cx="22" cy="50" r="4" fill="#a85f12"/>
<circle cx="148" cy="50" r="4" fill="#a85f12"/>
<circle cx="85" cy="18" r="3" fill="#a85f12"/>
<circle cx="85" cy="82" r="3" fill="#a85f12"/>
</svg>`,
  { size: 512 },
);

const DOOR = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 100">
<rect width="64" height="100" fill="#ff5a3c"/>
<rect x="3" y="3" width="58" height="94" fill="none" stroke="#ffd35e" stroke-width="3"/>
<rect x="7" y="7" width="50" height="86" fill="none" stroke="#b8651a" stroke-width="1.5"/>
<path d="M3 22 H61 M3 78 H61" stroke="#ffd35e" stroke-width="2.5"/>
<ellipse cx="32" cy="31" rx="6" ry="8" fill="#ffe9a0"/>
<ellipse cx="32" cy="69" rx="6" ry="8" fill="#ffe9a0"/>
<ellipse cx="13" cy="50" rx="8" ry="6" fill="#ffe9a0"/>
<ellipse cx="51" cy="50" rx="8" ry="6" fill="#ffe9a0"/>
<circle cx="32" cy="50" r="11" fill="#ffd35e" stroke="#a85f12" stroke-width="2"/>
<circle cx="32" cy="50" r="5" fill="#ff5a3c"/>
</svg>`,
  { size: 256 },
);

const chochinRibs = Array.from({ length: 8 }, (_, i) => `<line x1="${16 + i * 32}" y1="40" x2="${16 + i * 32}" y2="216"/>`).join("");
const chochinPetals = (cx: number) =>
  Array.from(
    { length: 5 },
    (_, i) =>
      `<ellipse cx="${cx}" cy="112" rx="10" ry="16" transform="rotate(${i * 72} ${cx} 128)" fill="#ffe9a8" stroke="#e8322f" stroke-width="4"/>`,
  ).join("") + `<circle cx="${cx}" cy="128" r="9" fill="#e8322f"/>`;
const CHOCHIN = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
<rect width="256" height="256" fill="#ff9a3d"/>
<rect width="256" height="40" fill="#e8322f"/>
<rect y="216" width="256" height="40" fill="#e8322f"/>
<g stroke="#ffd35e" stroke-width="6" stroke-linecap="round">${chochinRibs}</g>
${[64, 192].map(chochinPetals).join("")}
</svg>`,
  { size: 256 },
);

const LATTICE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<rect width="100" height="100" fill="#ffe08a"/>
<path d="M25 0V100M50 0V100M75 0V100M0 25H100M0 50H100M0 75H100" fill="none" stroke="#8a4f22" stroke-width="5"/>
<rect x="2" y="2" width="96" height="96" fill="none" stroke="#8a4f22" stroke-width="6"/>
<circle cx="50" cy="50" r="9" fill="#fff6c8" stroke="#8a4f22" stroke-width="3"/>
</svg>`,
  { size: 256 },
);

const runeTicks = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6;
  const p = (r: number) => `${(128 + Math.cos(a) * r).toFixed(1)} ${(128 + Math.sin(a) * r).toFixed(1)}`;
  return `<path d="M${p(100)} L${p(116)}"/>`;
}).join("");
const RUNE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
<g fill="none" stroke="#8ff4ff" stroke-width="7" stroke-linecap="round">
<circle cx="128" cy="128" r="116"/>
<circle cx="128" cy="128" r="92" stroke-width="4"/>
${runeTicks}
<path d="M128 46 L196 164 L60 164 Z" stroke-width="5"/>
<path d="M128 210 L60 92 L196 92 Z" stroke-width="5"/>
</g>
<circle cx="128" cy="128" r="30" fill="#c9fff0"/>
</svg>`,
  { size: 512 },
);

const LEAVES = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
<g stroke="#2f7f45" stroke-width="3">
<ellipse cx="30" cy="34" rx="20" ry="11" transform="rotate(-30 30 34)" fill="#6fd96a"/>
<ellipse cx="64" cy="30" rx="19" ry="10" transform="rotate(25 64 30)" fill="#58c75e"/>
<ellipse cx="46" cy="58" rx="22" ry="12" transform="rotate(-10 46 58)" fill="#7fe374"/>
<ellipse cx="22" cy="74" rx="16" ry="9" transform="rotate(35 22 74)" fill="#4fbf5c"/>
<ellipse cx="70" cy="70" rx="17" ry="9" transform="rotate(-40 70 70)" fill="#6fd96a"/>
</g>
<circle cx="50" cy="52" r="3" fill="#ffb3d6"/>
<circle cx="78" cy="50" r="2.5" fill="#ffb3d6"/>
</svg>`,
  { size: 256 },
);

const GRASS_A = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 60">
<path d="M6 60 Q4 32 12 6 Q15 30 17 60 Z" fill="#7fe374" stroke="#2f7f45" stroke-width="1.6"/>
<path d="M16 60 Q18 26 30 10 Q28 34 25 60 Z" fill="#58c75e" stroke="#2f7f45" stroke-width="1.6"/>
<path d="M24 60 Q30 40 38 30 Q34 44 33 60 Z" fill="#9be86f" stroke="#2f7f45" stroke-width="1.6"/>
</svg>`,
  { size: 128 },
);

const GRASS_B = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 60">
<path d="M4 60 Q10 36 6 18 Q16 34 18 60 Z" fill="#63cc66" stroke="#2f7f45" stroke-width="1.6"/>
<path d="M14 60 Q12 30 22 14 Q24 36 26 60 Z" fill="#7fe374" stroke="#2f7f45" stroke-width="1.6"/>
<path d="M28 60 Q32 44 37 40 Q34 50 36 60 Z" fill="#9be86f" stroke="#2f7f45" stroke-width="1.6"/>
</svg>`,
  { size: 128 },
);

const FLOWER = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<g stroke="#e0508a" stroke-width="2">
<circle cx="32" cy="16" r="11" fill="#ffa7cc"/>
<circle cx="47" cy="27" r="11" fill="#ffa7cc"/>
<circle cx="41" cy="46" r="11" fill="#ffc2dd"/>
<circle cx="23" cy="46" r="11" fill="#ffc2dd"/>
<circle cx="17" cy="27" r="11" fill="#ffa7cc"/>
</g>
<circle cx="32" cy="32" r="7" fill="#ffd35e" stroke="#c98a2b" stroke-width="2"/>
</svg>`,
  { size: 128 },
);

// A tassel: the knob sits at the drawing's bottom edge (the root), strands rise to its top.
const FRINGE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 80">
<g stroke="#ffd35e" stroke-width="3.2" stroke-linecap="round">
<path d="M12 66 V6"/><path d="M17 66 V2"/><path d="M20 66 V0"/><path d="M23 66 V2"/><path d="M28 66 V6"/>
</g>
<rect x="10" y="64" width="20" height="16" rx="5" fill="#ffd35e" stroke="#a85f12" stroke-width="2"/>
</svg>`,
  { size: 128 },
);

// Shide: white zigzag paper strips; the free zigzag edge is the drawing's top.
const SHIDE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 60">
<path d="M4 58 V8 L12 14 L20 0 L28 14 L36 8 V58 Z" fill="#fffaf0" stroke="#b9ad92" stroke-width="2"/>
</svg>`,
  { size: 128 },
);

const WISP = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
<g fill="none" stroke="#c9fff0" stroke-width="9" stroke-linecap="round">
<path d="M64 126 C40 108 44 86 64 80 C84 74 88 52 68 44 C54 38 56 24 68 16"/>
<path d="M40 126 C24 112 30 98 42 96"/>
<path d="M88 124 C104 110 100 96 88 92"/>
</g>
</svg>`,
  { size: 256 },
);

const EMA = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 170">
<rect x="6" y="6" width="108" height="158" rx="10" fill="#fff3d6" stroke="#b8702e" stroke-width="4"/>
<g fill="#ff9ec4" stroke="#c9557f" stroke-width="2">
<circle cx="60" cy="52" r="11"/><circle cx="79" cy="66" r="11"/><circle cx="72" cy="88" r="11"/><circle cx="48" cy="88" r="11"/><circle cx="41" cy="66" r="11"/>
</g>
<circle cx="60" cy="72" r="9" fill="#ffd35e" stroke="#b8702e" stroke-width="2"/>
<path d="M22 132 q9 -10 18 0 t18 0 t18 0 t18 0 t18 0" fill="none" stroke="#3fb865" stroke-width="5" stroke-linecap="round"/>
<path d="M24 146 q9 -8 18 0 t18 0 t18 0 t18 0" fill="none" stroke="#3fb865" stroke-width="4" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "roadsideShrine" });
  const root = b.joint("shrine", { at: [0, 0, 0] });
  const TZ = 0.5; // torii centre depth
  const Y0 = 0.355; // offering table top

  const put = (geo: THREE.BufferGeometry, color: Fill, at: V3, rotation?: V3) =>
    b.part(geo, color, rotation ? { bone: root, at, rotation } : { bone: root, at });

  // ---- Ground: a grassy earth slab, the path and the stepping stones ----
  const ground = put(new THREE.BoxGeometry(3.5, 0.1, 1.9), GROUND, [0, 0.05, -0.12]);
  put(new THREE.BoxGeometry(0.5, 0.025, 0.75), PAVER, [0, 0.1125, 0.225]);
  for (const s of [1, -1]) for (const z of [0.2, 0.4, 0.56]) put(new THREE.BoxGeometry(0.06, 0.03, 0.12), STONE_DARK, [s * 0.265, 0.115, z]);
  put(new THREE.CylinderGeometry(0.11, 0.12, 0.03, 7), STONE, [0.44, 0.115, 0.36]);
  put(new THREE.CylinderGeometry(0.1, 0.11, 0.03, 7), STONE, [-0.46, 0.115, 0.22]);
  put(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 7), STONE, [0.52, 0.115, 0.1]);
  put(new THREE.CylinderGeometry(0.11, 0.12, 0.03, 7), STONE, [-0.66, 0.115, -0.25]);
  for (const [x, y, z, r] of [
    [0.62, 0.1 + 0.02, 0.22, 0.03],
    [-0.6, 0.1 + 0.02, 0.3, 0.025],
    [0.62, 0.1 + 0.02, -0.3, 0.035],
    [0.95, 0.1 + 0.02, -0.2, 0.03],
  ]) {
    put(new THREE.SphereGeometry(r, 6, 4).scale(1, 0.7, 1), STONE, [x, y, z]);
  }
  // The paved path carries a glowing rune ring.
  glow(
    b.part(new THREE.CircleGeometry(0.18, 40), "#ffffff", {
      bone: root,
      at: [0, 0.128, 0.38],
      dir: [0, 1, 0],
      up: [0, 0, -1],
      axis: "z",
      texture: RUNE,
    }),
    1.2,
  );

  // ---- Torii (vermilion gate) at the front ----
  for (const s of [1, -1]) {
    put(new THREE.BoxGeometry(0.26, 0.1, 0.26), STONE_DARK, [s * 1.3, 0.15, TZ]);
    put(new THREE.CylinderGeometry(0.068, 0.082, 2.46, 12), VERM_RIM, [s * 1.3, 1.43, TZ]);
    put(new THREE.CylinderGeometry(0.095, 0.095, 0.04, 12), GOLD, [s * 1.3, 0.24, TZ]);
    put(new THREE.CylinderGeometry(0.078, 0.078, 0.03, 12), GOLD, [s * 1.3, 1.1, TZ]);
    put(new THREE.CylinderGeometry(0.08, 0.08, 0.025, 12), GOLD, [s * 1.3, 0.6, TZ]);
    put(new THREE.CylinderGeometry(0.075, 0.075, 0.025, 12), GOLD, [s * 1.3, 2.0, TZ]);
  }
  // Kasagi, the curved top beam with upturned tips.
  b.extrude(
    [
      [-1.72, 0.22], [-1.42, 0.11], [-0.7, 0.03], [0, 0], [0.7, 0.03], [1.42, 0.11], [1.72, 0.22],
      [1.74, 0.36, "sharp"], [1.46, 0.25], [0.8, 0.18], [0, 0.15], [-0.8, 0.18], [-1.46, 0.25], [-1.74, 0.36, "sharp"],
    ],
    { at: [0, 2.5, TZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.16, color: VERMILION, bone: root },
  );
  // Navy cap laid along the top of the kasagi.
  b.extrude(
    [
      [-1.74, 0.4, "sharp"], [-1.46, 0.29], [-0.8, 0.215], [0, 0.185], [0.8, 0.215], [1.46, 0.29], [1.74, 0.4, "sharp"],
      [1.74, 0.33, "sharp"], [1.46, 0.24], [0.8, 0.17], [0, 0.14], [-0.8, 0.17], [-1.46, 0.24], [-1.74, 0.33, "sharp"],
    ],
    { at: [0, 2.5, TZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.19, color: NAVY, bone: root },
  );
  // Gakuzuka, the central tablet, with a gold filigree plaque.
  put(new THREE.BoxGeometry(0.4, 0.3, 0.1), VERMILION, [0, 2.35, TZ]);
  b.part(new THREE.PlaneGeometry(0.3, 0.176), "#ffffff", {
    bone: root,
    at: [0, 2.35, TZ + 0.053],
    dir: [0, 0, 1],
    axis: "z",
    texture: GOLD_PLAQUE,
  });
  // Nuki, the lower beam, with gold end caps.
  put(new THREE.BoxGeometry(2.96, 0.1, 0.12), VERMILION, [0, 2.15, TZ]);
  for (const s of [1, -1]) put(new THREE.BoxGeometry(0.05, 0.11, 0.13), GOLD, [s * 1.5, 2.15, TZ]);
  // Gold rivets along the kasagi and nuki.
  for (const x of [-1.2, -0.8, -0.4, 0.4, 0.8, 1.2])
    put(new THREE.SphereGeometry(0.014, 6, 4), GOLD, [x, 2.5 + 0.075 + 0.09 * (Math.abs(x) / 1.4) ** 1.5, TZ + 0.085]);
  for (const x of [-0.9, 0.9]) put(new THREE.SphereGeometry(0.014, 6, 4), GOLD, [x, 2.15, TZ + 0.065]);

  // Gold tassels hang from the nuki ends.
  for (const s of [1, -1]) {
    put(new THREE.SphereGeometry(0.03, 8, 6), GOLD, [s * 1.4, 2.08, TZ + 0.06]);
    b.cards([frame([s * 1.4, 2.07, TZ + 0.06], [0, 1, 0])], FRINGE, { size: [0.08, 0.2], lean: 180, flow: [0, 0, 1] });
  }

  // Two chochin paper lanterns hang under the nuki and glow.
  for (const s of [1, -1]) {
    const x = s * 0.6;
    b.rod([x, 2.1, TZ], [x, 2.07, TZ], 0.008, { color: NAVY });
    put(new THREE.CylinderGeometry(0.05, 0.05, 0.025, 10), GOLD, [x, 2.0525, TZ]);
    glow(
      b.part(new THREE.SphereGeometry(1, 16, 12).scale(0.13, 0.14, 0.13), "#ffffff", {
        bone: root,
        at: [x, 1.9, TZ],
        texture: CHOCHIN,
      }),
      1.2,
    );
    put(new THREE.CylinderGeometry(0.05, 0.05, 0.025, 10), GOLD, [x, 1.7475, TZ]);
    b.cards([frame([x, 1.735, TZ], [0, 1, 0])], FRINGE, { size: [0.07, 0.12], lean: 180, flow: [0, 0, 1] });
  }

  // ---- Hokora: the small shrine on a stone dais ----
  put(new THREE.BoxGeometry(1.04, 0.06, 0.78), STONE, [0, 0.13, -0.5]);
  put(new THREE.BoxGeometry(0.96, 0.1, 0.7), STONE, [0, 0.21, -0.5]);
  for (const z of [-0.17, -0.83]) put(new THREE.BoxGeometry(0.98, 0.012, 0.03), GOLD, [0, 0.266, z]);
  // Flat colour: the painted wall showed another part's paint on its back face in the v01 render.
  put(new THREE.BoxGeometry(0.6, 0.4, 0.44), "#fff5dd", [0, 0.46, -0.5]);
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.14, 0.3), "#ffffff", {
      bone: root,
      at: [s * 0.2, 0.46, -0.276],
      dir: [0, 0, 1],
      axis: "z",
      texture: LATTICE,
    });
  put(new THREE.BoxGeometry(0.64, 0.03, 0.48), GOLD, [0, 0.275, -0.5]);
  put(new THREE.BoxGeometry(0.62, 0.03, 0.46), GOLD, [0, 0.645, -0.5]);
  for (const s of [1, -1])
    for (const z of [-0.275, -0.725]) put(new THREE.CylinderGeometry(0.022, 0.024, 0.4, 8), VERM_RIM, [s * 0.3, 0.46, z]);
  // Lit lattice windows on both flanks.
  for (const s of [1, -1])
    glow(
      b.part(new THREE.PlaneGeometry(0.22, 0.2), "#ffffff", {
        bone: root,
        at: [s * 0.302, 0.47, -0.5],
        dir: [s, 0, 0],
        axis: "z",
        texture: LATTICE,
      }),
      1.1,
    );
  // Gabled tiled roof with upturned eaves.
  b.extrude(
    [[-0.6, 0.12, "sharp"], [-0.5, 0, "sharp"], [0.5, 0, "sharp"], [0.6, 0.12, "sharp"], [0.52, 0.07], [0, 0.3, "sharp"], [-0.52, 0.07]],
    { at: [0, 0.66, -0.5], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.72, color: TEAL, bone: root },
  );
  b.part(new THREE.PlaneGeometry(0.22, 0.13), "#ffffff", {
    bone: root,
    at: [0, 0.78, -0.136],
    dir: [0, 0, 1],
    axis: "z",
    texture: GOLD_PLAQUE,
  });
  for (const s of [1, -1]) put(new THREE.BoxGeometry(0.05, 0.03, 0.74), GOLD, [s * 0.5, 0.66, -0.5]);
  for (const s of [1, -1]) put(new THREE.BoxGeometry(0.03, 0.03, 0.74), GOLD, [s * 0.6, 0.78, -0.5]);
  put(new THREE.BoxGeometry(0.1, 0.035, 0.74), GOLD, [0, 0.955, -0.5]);
  b.lathe(
    [[0, 0], [0.05, 0], [0.05, 0.02], [0.02, 0.05], [0.035, 0.1], [0.012, 0.15], [0, 0.17]],
    { at: [0, 0.97, -0.5], segments: 10, color: GOLD, bone: root },
  );
  glow(put(new THREE.SphereGeometry(0.03, 10, 8), CYAN, [0, 1.15, -0.5]), 1.4);

  // Suzu bell on a rope under the front eave, with a gold tassel.
  b.rod([0, 0.66, -0.12], [0, 0.6, -0.12], 0.007, { color: ROPE });
  b.lathe(
    [[0, 0], [0.02, 0], [0.035, 0.02], [0.04, 0.045], [0.03, 0.06], [0, 0.065]],
    { at: [0, 0.58, -0.12], segments: 10, color: GOLD, bone: root },
  );
  b.cards([frame([0, 0.575, -0.12], [0, 1, 0])], FRINGE, { size: [0.05, 0.1], lean: 180, flow: [0, 0, 1] });

  // Hinged shrine door on the front.
  const door = b.joint("door", { parent: root, at: [-0.1, 0.27, -0.27], dir: [0, 1, 0], role: "hinge" });
  b.part(new THREE.BoxGeometry(0.2, 0.34, 0.02), VERMILION, { bone: door, at: [0, 0.44, -0.27] });
  b.part(new THREE.PlaneGeometry(0.19, 0.32), "#ffffff", {
    bone: door,
    at: [0, 0.44, -0.256],
    dir: [0, 0, 1],
    axis: "z",
    texture: DOOR,
  });
  b.part(new THREE.SphereGeometry(0.014, 8, 6), GOLD, { bone: door, at: [0.075, 0.44, -0.25] });
  put(new THREE.BoxGeometry(0.24, 0.02, 0.03), GOLD, [0, 0.61, -0.27]);

  // ---- Offering table with offerings ----
  put(new THREE.BoxGeometry(0.62, 0.03, 0.26), WOOD, [0, Y0 - 0.015, 0.03]);
  put(new THREE.BoxGeometry(0.56, 0.04, 0.2), WOOD_DARK, [0, 0.3, 0.03]);
  put(new THREE.BoxGeometry(0.5, 0.012, 0.01), GOLD, [0, 0.3, 0.132]);
  for (const s of [1, -1])
    for (const z of [-0.06, 0.12]) put(new THREE.CylinderGeometry(0.016, 0.018, 0.225, 6), WOOD_DARK, [s * 0.27, 0.2125, z]);

  // Sake bottles.
  for (const [x, z] of [[0.2, -0.05], [0.2, 0.07]]) {
    b.lathe(
      [[0, 0], [0.045, 0], [0.05, 0.03], [0.035, 0.1], [0.02, 0.14], [0.02, 0.17], [0, 0.17]],
      { at: [x, Y0, z], segments: 10, color: SAKE, bone: root },
    );
    put(new THREE.CylinderGeometry(0.046, 0.046, 0.03, 10), CREAM, [x, Y0 + 0.07, z]);
    put(new THREE.CylinderGeometry(0.024, 0.024, 0.03, 10), VERMILION, [x, Y0 + 0.185, z]);
  }
  // Small sake cups with gold rims.
  for (const [x, z] of [[0.13, -0.06], [0.13, 0.03]]) {
    b.lathe([[0, 0], [0.02, 0], [0.028, 0.025], [0.03, 0.035], [0, 0.035]], { at: [x, Y0, z], segments: 8, color: CREAM, bone: root });
    put(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 8), GOLD, [x, Y0 + 0.035, z]);
  }

  // Mochi stack on a plate.
  const mx = -0.23, mz = -0.03;
  b.lathe([[0, 0], [0.09, 0], [0.1, 0.012], [0, 0.012]], { at: [mx, Y0, mz], segments: 12, color: CREAM, bone: root });
  put(new THREE.SphereGeometry(0.055, 12, 8), RICE, [mx, Y0 + 0.067, mz]);
  put(new THREE.SphereGeometry(0.045, 12, 8), RICE, [mx, Y0 + 0.152, mz]);
  put(new THREE.SphereGeometry(0.034, 12, 8), RICE, [mx, Y0 + 0.222, mz]);
  put(new THREE.SphereGeometry(0.008, 6, 4), PINK, [mx, Y0 + 0.152, mz + 0.045]);
  put(new THREE.SphereGeometry(0.028, 10, 8), ORANGE, [mx, Y0 + 0.25, mz]);

  // Fruit dish of oranges.
  const fx = -0.09, fz = 0.09;
  b.lathe([[0, 0], [0.08, 0], [0.09, 0.01], [0, 0.01]], { at: [fx, Y0, fz], segments: 12, color: CREAM, bone: root });
  put(new THREE.SphereGeometry(0.03, 10, 8), ORANGE, [fx - 0.025, Y0 + 0.04, fz]);
  put(new THREE.SphereGeometry(0.03, 10, 8), ORANGE, [fx + 0.025, Y0 + 0.04, fz - 0.01]);
  put(new THREE.SphereGeometry(0.03, 10, 8), ORANGE, [fx, Y0 + 0.075, fz + 0.01]);

  // Sakaki branch in a blue vase.
  const sx = -0.27, sz = 0.11;
  b.lathe(
    [[0, 0], [0.03, 0], [0.04, 0.03], [0.02, 0.07], [0.035, 0.1], [0.03, 0.11], [0, 0.11]],
    { at: [sx, Y0, sz], segments: 10, color: VASE, bone: root },
  );
  b.cards(
    [frame([sx, Y0 + 0.11, sz], [0, 1, 0]), frame([sx - 0.02, Y0 + 0.11, sz + 0.01], [0, 1, 0]), frame([sx + 0.02, Y0 + 0.11, sz - 0.01], [0, 1, 0])],
    LEAVES,
    { size: 0.12, vary: 0.2, rng: rng(81), cross: true },
  );

  // Gold incense burner with rising elemental wisps.
  b.lathe(
    [[0, 0], [0.05, 0], [0.065, 0.03], [0.08, 0.05], [0.075, 0.07], [0.085, 0.08], [0.07, 0.085], [0, 0.085]],
    { at: [0.03, Y0, -0.05], segments: 10, color: GOLD, bone: root },
  );
  glow(
    b.cards(
      [
        frame([0.03, Y0 + 0.09, -0.05], [0, 1, 0]),
        frame([0.035, Y0 + 0.1, -0.045], [0, 1, 0]),
        frame([0.025, Y0 + 0.1, -0.06], [0, 1, 0]),
      ],
      WISP,
      { size: [0.14, 0.32], lean: 10, flow: [1, 0, 0], cross: true, vary: 0.2, rng: rng(41) },
    ),
    1.0,
  );

  // Candles with flames.
  for (const [x, z] of [[0.1, 0.12], [0.28, 0.12]]) {
    put(new THREE.CylinderGeometry(0.016, 0.016, 0.08, 8), CREAM, [x, Y0 + 0.04, z]);
    glow(b.part(new THREE.SphereGeometry(0.012, 8, 6).scale(1, 1.5, 1), WARM, { bone: root, at: [x, Y0 + 0.095, z] }), 1.4);
  }

  // ---- Stone lanterns (toro) flanking the dais ----
  const toro = (x: number, z: number) => {
    put(new THREE.BoxGeometry(0.32, 0.08, 0.32), STONE, [x, 0.14, z]);
    b.lathe(
      [[0, 0], [0.14, 0], [0.15, 0.02], [0.12, 0.04], [0.08, 0.07], [0.06, 0.1], [0, 0.1]],
      { at: [x, 0.18, z], segments: 8, color: STONE, bone: root },
    );
    put(new THREE.CylinderGeometry(0.045, 0.055, 0.2, 8), STONE, [x, 0.38, z]);
    put(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 8), STONE, [x, 0.495, z]);
    put(new THREE.BoxGeometry(0.26, 0.2, 0.26), STONE, [x, 0.61, z]);
    // Lit fire chamber on all four faces.
    const win = (at: V3, dir: V3) =>
      glow(
        b.part(new THREE.PlaneGeometry(0.16, 0.13), "#ffffff", { bone: root, at, dir, axis: "z", texture: LATTICE }),
        1.3,
      );
    win([x, 0.61, z + 0.132], [0, 0, 1]);
    win([x, 0.61, z - 0.132], [0, 0, -1]);
    win([x + 0.132, 0.61, z], [1, 0, 0]);
    win([x - 0.132, 0.61, z], [-1, 0, 0]);
    b.lathe(
      [[0, 0], [0.2, 0], [0.22, 0.02], [0.14, 0.05], [0.1, 0.08], [0.03, 0.12], [0, 0.12]],
      { at: [x, 0.71, z], segments: 8, color: STONE, bone: root },
    );
    b.lathe(
      [[0, 0], [0.035, 0], [0.035, 0.02], [0.02, 0.04], [0.03, 0.06], [0, 0.085]],
      { at: [x, 0.83, z], segments: 8, color: GOLD, bone: root },
    );
  };
  toro(0.74, 0.08);
  toro(-0.74, 0.08);

  // ---- Temizuya: a stone purification basin with a bamboo ladle ----
  const bx = -0.95, bz = 0.42;
  b.lathe(
    [[0, 0], [0.13, 0], [0.14, 0.04], [0.18, 0.12], [0.2, 0.19], [0.21, 0.21], [0, 0.21]],
    { at: [bx, 0.1, bz], segments: 12, color: STONE, bone: root },
  );
  b.part(new THREE.CircleGeometry(0.17, 24), WATER, {
    bone: root,
    at: [bx, 0.312, bz],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    axis: "z",
  });
  b.rod([bx + 0.18, 0.3, bz - 0.02], [bx + 0.3, 0.12, bz + 0.06], 0.008, { color: WOOD });
  put(new THREE.CylinderGeometry(0.03, 0.025, 0.035, 8), WOOD, [bx + 0.3, 0.1375, bz + 0.06]);

  // ---- Ema rack with three wooden wish plaques ----
  const ex = -1.325, ez = -0.35;
  put(new THREE.CylinderGeometry(0.025, 0.025, 0.87, 6), WOOD_DARK, [-1.13, 0.535, ez]);
  put(new THREE.CylinderGeometry(0.025, 0.025, 0.87, 6), WOOD_DARK, [-1.52, 0.535, ez]);
  put(new THREE.BoxGeometry(0.42, 0.04, 0.05), WOOD_DARK, [ex, 0.95, ez]);
  b.extrude(
    [[-0.27, 0, "sharp"], [0.27, 0, "sharp"], [0.22, 0.05], [0, 0.11, "sharp"], [-0.22, 0.05]],
    { at: [ex, 0.97, ez], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.34, color: TEAL, bone: root },
  );
  for (const [i, x] of [-1.22, -1.325, -1.43].entries()) {
    const plaque = b.joint(`ema${i + 1}`, { parent: root, at: [x, 0.93, -0.31], dir: [0, 1, 0], role: "hinge" });
    b.rod([x, 0.945, -0.33], [x, 0.93, -0.31], 0.008, { color: WOOD_DARK });
    b.part(new THREE.BoxGeometry(0.1, 0.142, 0.01), WOOD, { bone: plaque, at: [x, 0.859, -0.31] });
    b.part(new THREE.PlaneGeometry(0.094, 0.136), "#ffffff", {
      bone: plaque,
      at: [x, 0.859, -0.3045],
      dir: [0, 0, 1],
      axis: "z",
      texture: EMA,
    });
  }

  // Mushroom clusters by the bushes, and drifting glow motes.
  for (const [x, z, sc] of [[0.62, -0.6, 1], [0.7, -0.7, 0.8], [0.58, -0.72, 0.65]] as const) {
    put(new THREE.CylinderGeometry(0.01, 0.012, 0.04, 6), CREAM, [x, 0.12, z]);
    put(new THREE.SphereGeometry(0.03 * sc, 8, 5).scale(1, 0.6, 1), PINK, [x, 0.14 + 0.02 * sc, z]);
  }
  for (const [x, y, z, c] of [[0.6, 0.42, 0.5, WARM], [-0.5, 0.5, 0.45, CYAN], [0.42, 0.7, 0.2, CYAN], [-0.42, 0.62, -0.1, WARM], [-0.6, 0.35, -0.42, WARM]] as const) {
    glow(put(new THREE.SphereGeometry(0.012, 6, 4), c, [x, y, z]), 1.2);
  }

  // ---- Crystals, a sacred stone with shimenawa, bushes ----
  const crystal = (x: number, y: number, z: number, h: number, tilt: number) =>
    glow(put(new THREE.ConeGeometry(0.035, h, 6), CYAN, [x, y, z], [0, 0, tilt]), 1.0);
  crystal(-0.66, 0.1 + 0.1 - 0.01, -0.98, 0.2, 10);
  crystal(-0.58, 0.1 + 0.07 - 0.01, -0.86, 0.14, -14);
  crystal(-0.74, 0.1 + 0.06 - 0.01, -0.86, 0.12, 20);

  const rock = (x: number, z: number, r: number) =>
    put(new THREE.SphereGeometry(r, 6, 5).scale(1, 0.7, 1), ROCK_PAINT, [x, 0.1 + 0.35 * r, z]);
  rock(1.56, -0.25, 0.13);
  rock(0.9, -0.9, 0.15);

  // A sacred stone wrapped in a shimenawa rope, with shide paper strips.
  const RX = 0.9, RZ = 0.62;
  rock(RX, RZ, 0.22);
  const ropeRing: V3[] = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return [RX + Math.cos(a) * 0.235, 0.19, RZ + Math.sin(a) * 0.235];
  });
  b.sweep(catmull(ropeRing, { closed: true }), 0.013, { color: ROPE });
  b.cards(
    [1, 2, 3].map((i) => frame(ropeRing[i], [0, 1, 0])),
    SHIDE,
    { size: [0.05, 0.08], lean: 180, flow: [0, 0, 1] },
  );

  const bush = (x: number, z: number, s: number, seed: number) => {
    const blobs: [number, number, number, number][] = [
      [0, 0.22, 0, 0.25],
      [0.22, 0.16, 0.08, 0.18],
      [-0.2, 0.15, -0.1, 0.19],
      [0.02, 0.14, -0.22, 0.16],
    ];
    const parts = blobs.map(([dx, dy, dz, r]) =>
      put(new THREE.SphereGeometry(r * s, 8, 6), BUSH, [x + dx * s, 0.1 + dy * s, z + dz * s]),
    );
    const hits = b.surface(parts).scatter(90, {
      rng: rng(seed),
      minDist: 0.05,
      filter: (h) => h.n.y > -0.1 && h.at.y > 0.14,
    });
    b.cards(hits, LEAVES, { size: 0.16 * s, vary: 0.25, rng: rng(seed + 1), cross: true });
  };
  bush(1.2, -0.5, 1.0, 51);
  bush(-1.1, -0.15, 0.8, 61);
  bush(1.42, 0.22, 0.65, 71);

  // ---- Grass and flowers on the ground, kept clear of the built pieces ----
  const freeGround = (x: number, z: number) =>
    Math.abs(x) < 1.6 &&
    z > -0.98 &&
    z < 0.78 &&
    !(Math.abs(x) < 0.3 && z > -0.2 && z < 0.66) && // path
    !(Math.abs(x) < 0.56 && z > -0.92 && z < -0.08) && // dais and hokora
    !(Math.hypot(Math.abs(x) - 0.74, z - 0.08) < 0.22) && // stone lanterns
    !(Math.hypot(Math.abs(x) - 1.3, z - 0.5) < 0.24) && // torii pillars
    !(x < -1.0 && x > -1.6 && z > -0.5 && z < -0.2) && // ema rack
    !(Math.hypot(x + 0.95, z - 0.42) < 0.26) && // temizuya
    !(Math.hypot(x - 0.9, z - 0.62) < 0.3); // sacred stone
  const grassHits = b.surface(ground).scatter(460, {
    rng: rng(31),
    minDist: 0.065,
    filter: (h) => h.n.y > 0.9 && freeGround(h.at.x, h.at.z),
  });
  b.cards(grassHits, [GRASS_A, GRASS_B], { size: [0.13, 0.17], vary: 0.3, rng: rng(32), cross: true, spin: 25 });
  const flowerHits = b.surface(ground).scatter(110, {
    rng: rng(33),
    minDist: 0.09,
    filter: (h) => h.n.y > 0.9 && freeGround(h.at.x, h.at.z),
  });
  b.cards(flowerHits, [FLOWER], { size: 0.08, vary: 0.2, rng: rng(34), cross: true });

  return b.root;
}
