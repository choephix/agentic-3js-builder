<!-- call: stage1 -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

export const meta = {
  name: "Piano accordion",
  description:
    "Italian mother-of-pearl piano accordion: pearl treble and bass boxes, red-and-black pleated bellows, chrome and gold trim, 15 white and 10 black keys.",
};

// Palette (top level so stage 2 can use the names)
export const PEARL = "#f4ece6";
export const PEARL_PINK = "#f1cddb";
export const PEARL_BLUE = "#cde2ee";
export const PEARL_MINT = "#cfeadf";
export const LACQUER = "#14121a";
export const CHROME = "#c9ced6";
export const GOLD = "#d9a93c";
export const IVORY = "#fbf6e6";
export const KEY_BLACK = "#1b1a20";
export const BELLOWS = "#1c1722";
export const BELLOWS_RED = "#6a1426";
export const RUBBER = "#26242a";
export const KEYBED = "#2a2330";

export const REQUESTS = [
  {
    id: "trebleGrille",
    kind: "add",
    part: "trebleBody",
    what: "Treble end grille: a chrome perforated plate (CHROME) with a ring of round holes, a GOLD border, and PEARL_PINK scrollwork corners, seated flat on the treble end face.",
    at: [0.31, 0.24, 0],
    normal: [1, 0, 0],
    bone: null,
    room: [0.04, 0.34, 0.16],
  },
  {
    id: "registerSwitches",
    kind: "add",
    part: "trebleBody",
    what: "Row of five register switch tabs on the treble top: small PEARL and IVORY rocker tabs with GOLD pivots in a slim LACQUER slot bar.",
    at: [0.22, 0.46, 0.04],
    normal: [0, 1, 0],
    bone: null,
    room: [0.14, 0.03, 0.12],
  },
  {
    id: "bassButtons",
    kind: "add",
    part: "bassBody",
    what: "Bass button board: five columns by six rows of small round buttons with PEARL caps, a CHROME rim each, and GOLD-marked root buttons, on the dark panel.",
    at: [-0.22, 0.23, 0.104],
    normal: [0, 0, 1],
    bone: null,
    room: [0.15, 0.37, 0.03],
  },
  {
    id: "brandPlate",
    kind: "add",
    part: "trebleBody",
    what: "Brand plate above the keys: a GOLD cartouche with LACQUER outline and a tiny PEARL_PINK flourish, rich engraved look.",
    at: [0.22, 0.435, 0.101],
    normal: [0, 0, 1],
    bone: null,
    room: [0.15, 0.04, 0.02],
  },
  {
    id: "bellowsTrim",
    kind: "add",
    part: "bellowsPeak0",
    what: "Bellows dressing: GOLD thin binding lines along each black peak, small PEARL_PINK corner protectors on the front edges, and metal corner studs.",
    at: [0, 0.24, 0.1],
    normal: [0, 0, 1],
    bone: null,
    room: [0.26, 0.4, 0.02],
  },
  {
    id: "bellowsStrap",
    kind: "add",
    part: "bellowsValley0",
    what: "Bellows closing strap across the front: LACQUER leather strap with CHROME buckle and GOLD stud, hanging from the bass side.",
    at: [0, 0.12, 0.1],
    normal: [0, 0, 1],
    bone: null,
    room: [0.34, 0.04, 0.03],
  },
  {
    id: "shoulderStraps",
    kind: "add",
    part: "trebleBody",
    what: "Back of the instrument: two wide padded shoulder straps in LACQUER with BELLOWS_RED lining, CHROME slides and GOLD rivets, plus a bass-side wrist strap.",
    at: [0, 0.24, -0.11],
    normal: [0, 0, -1],
    bone: null,
    room: [0.5, 0.44, 0.04],
  },
  {
    id: "bassEndInlay",
    kind: "add",
    part: "bassBody",
    what: "Mother-of-pearl mosaic on the bass end face: diamond and lozenge tiles in PEARL_PINK, PEARL_BLUE and PEARL_MINT framed by a thin GOLD line.",
    at: [-0.31, 0.24, 0],
    normal: [-1, 0, 0],
    bone: null,
    room: [0.03, 0.34, 0.16],
  },
  {
    id: "airButton",
    kind: "add",
    part: "bassBody",
    what: "Air release button on the bass top: a CHROME stem with a PEARL domed cap in a GOLD collar.",
    at: [-0.28, 0.46, -0.03],
    normal: [0, 1, 0],
    bone: null,
    room: [0.04, 0.03, 0.04],
  },
  {
    id: "keyMarks",
    kind: "add",
    part: "whiteKey7",
    what: "Tiny LACQUER and GOLD mark on the middle-C white key and thin LACQUER key dividing lines on the key bed.",
    at: [0.22, 0.226, 0.115],
    normal: [0, 0, 1],
    bone: null,
    room: [0.14, 0.03, 0.01],
  },
  {
    id: "pearlShimmer",
    kind: "texture",
    part: "trebleBody",
    what: "Mother-of-pearl celluloid on trebleBody, bassBody and the lozenges: swirling soft PEARL base with veins of PEARL_PINK, PEARL_BLUE and PEARL_MINT, glossy and iridescent.",
  },
  {
    id: "bellowsPaper",
    kind: "texture",
    part: "bellowsValley0",
    what: "Bellows valleys bellowsValley0..6: BELLOWS_RED marbled paper with fine darker pleat lines and soft gold flecks; bellowsPeak0..6 get glossy LACQUER grain.",
  },
  {
    id: "ivoryKeys",
    kind: "texture",
    part: "whiteKey0",
    what: "White keys whiteKey0..14: IVORY with faint yellowed grain and a subtle worn front edge; black keys get a glossy KEY_BLACK sheen.",
  },
  {
    id: "chromeEngraving",
    kind: "texture",
    part: "edgeStrip",
    what: "Chrome corner strips and top/bottom bands: brushed CHROME with fine engraved tick lines and small GOLD dot inlays.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "pianoAccordion" });

  const box = (name: string, size: [number, number, number], at: [number, number, number], color: string, rotY = 0) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, rotation: [0, rotY, 0], name });

  const H = 0.44;
  const CY = 0.24;
  const W = 0.18;
  const D = 0.2;

  // Feet
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      for (const side of [1, -1])
        b.part(new THREE.CylinderGeometry(0.014, 0.016, 0.03, 8), RUBBER, {
          at: [side * 0.22 + sx * 0.06, 0.012, sz * 0.07],
          name: "foot",
        });

  // Boxes
  for (const side of [1, -1]) {
    const cx = side * 0.22;
    const nm = side > 0 ? "trebleBody" : "bassBody";
    box(nm, [W, H, D], [cx, CY, 0], PEARL);
    // lacquer top and bottom bands
    for (const y of [CY + H / 2 - 0.006, CY - H / 2 + 0.006]) box("band", [W + 0.006, 0.014, D + 0.006], [cx, y, 0], LACQUER);
    // chrome corner strips and gold studs
    for (const sx of [1, -1])
      for (const sz of [1, -1]) {
        const x = cx + sx * (W / 2 + 0.001);
        box("edgeStrip", [0.008, H, 0.008], [x, CY, sz * (D / 2)], CHROME);
        for (const sy of [1, -1]) {
          if (sz > 0)
            b.part(new THREE.SphereGeometry(0.009, 8, 6), GOLD, {
              at: [x, CY + sy * (H / 2 - 0.004), sz * (D / 2 + 0.003)],
              name: "stud",
            });
        }
      }
    // lozenge inlays on top (bass) and back (both)
    if (side < 0) {
      box("lozengeTop", [0.07, 0.003, 0.07], [cx, CY + H / 2 + 0.0015, 0.02], PEARL_PINK, Math.PI / 4);
      box("lozengeTop2", [0.04, 0.004, 0.04], [cx, CY + H / 2 + 0.003, 0.02], PEARL_BLUE, Math.PI / 4);
    }
    box("lozengeBack", [0.1, 0.1, 0.003], [cx, CY, -D / 2 - 0.0015], PEARL_BLUE, 0).rotation.z = Math.PI / 4;
    const inner = b.part(new THREE.BoxGeometry(0.05, 0.05, 0.004), PEARL_PINK, { at: [cx, CY, -D / 2 - 0.004], name: "lozengeBack2" });
    inner.rotation.z = Math.PI / 4;
    // keybed / button panel
    box("keybed", [0.15, 0.37, 0.004], [cx, 0.23, D / 2 + 0.002], side > 0 ? KEYBED : LACQUER);
  }

  // Treble keys
  const pitch = 0.0233;
  const kx = 0.22;
  const y0 = 0.055 + 0.0116;
  const zKey = D / 2 + 0.004 + 0.005;
  for (let i = 0; i < 15; i++) {
    box(`whiteKey${i}`, [0.13, 0.0205, 0.01], [kx, y0 + i * pitch, zKey], IVORY);
  }
  for (let i = 0; i < 14; i++) {
    if (![0, 1, 3, 4, 5].includes(i % 7)) continue;
    box(`blackKey${i}`, [0.075, 0.013, 0.012], [kx + 0.0275, y0 + (i + 0.5) * pitch, zKey + 0.008], KEY_BLACK);
  }

  // Bellows
  for (let i = 0; i < 7; i++) {
    const x = -0.13 + 0.0093 + i * 0.0372;
    box(`bellowsPeak${i}`, [0.015, 0.43, 0.19], [x, CY, 0], BELLOWS);
    box(`bellowsValley${i}`, [0.0186, 0.4, 0.165], [x + 0.0186, CY, 0], BELLOWS_RED);
    for (const sz of [1, -1]) box(`bellowsEdge`, [0.016, 0.43, 0.006], [x, CY, sz * 0.095], PEARL);
  }
  box("bellowsCoreFrame", [0.26, 0.38, 0.15], [0, CY, 0], LACQUER);
  // gold collar rings where bellows meet the boxes
  for (const sx of [1, -1]) box("collar", [0.006, 0.43, 0.195], [sx * 0.133, CY, 0], GOLD);

  for (const add of STAGE2) add(b);
  return b.root;
}
```

<!-- call: texture -->

Paint plan, one line per request:

- **pearlShimmer**: a swirling cream base with pink, blue and mint veins from layered noise, on the treble and bass bodies and every lozenge. A shared `PEARL_PAINT` continues the pattern across all of them, with a soft iridescent sheen on up-facing surfaces.
- **bellowsPaper**: the valleys get red marbled paper with dark pleat lines on the vertical axis and gold flecks. The peaks get fine lacquer grain with a faint highlight.
- **ivoryKeys**: the white keys get ivory with yellowed grain and a worn front edge, and the black keys get a glossy sheen gradient.
- **chromeEngraving**: the corner strips and the top/bottom bands get brushed chrome with engraved tick lines along the length and sparse gold dot inlays.

<<<<<<< SEARCH
import { createBuilder, type Builder } from "agentic-3js-builder";
=======
import { createBuilder, paint, noise, mix, smoothstep, cells, grain, type Builder } from "agentic-3js-builder";

const PEARL_PAINT = paint((p, n) => {
  const w = noise(p, 0.09, 3);
  const w2 = noise(new THREE.Vector3(p.x + w * 0.1, p.y + w * 0.1, p.z), 0.05, 8);
  let c = mix(PEARL, "#fffaf5", smoothstep(0.3, 0.8, noise(p, 0.15, 1)) * 0.6);
  const v = Math.abs(w2 - 0.5);
  const vein = smoothstep(0.06, 0.0, v);
  const hue = noise(p, 0.2, 11);
  const tint = hue < 0.33 ? PEARL_PINK : hue < 0.66 ? PEARL_BLUE : PEARL_MINT;
  c = mix(c, tint, 0.35 + 0.45 * vein);
  c = mix(c, tint, 0.3 * smoothstep(0.55, 0.85, noise(p, 0.03, 5)));
  return mix(c, "#ffffff", 0.25 * smoothstep(0.5, 1, n.y) * smoothstep(0.4, 0.8, noise(p, 0.02, 7)));
});

const VALLEY_PAINT = paint((p) => {
  const marble = noise(new THREE.Vector3(p.x * 0.5, p.y, p.z), 0.06, 21);
  let c = mix(BELLOWS_RED, "#8e2238", smoothstep(0.35, 0.75, marble) * 0.7);
  c = mix(c, "#3e0a18", 0.55 * smoothstep(0.12, 0, Math.abs(((p.y * 60) % 1) - 0.5) - 0.42));
  const fl = cells(p, 0.02, 4);
  if (fl.id > 0.8 && fl.d1 < 0.12) c = mix(c, GOLD, 0.8);
  return c;
});

const PEAK_PAINT = paint((p, n) => {
  const g = grain(BELLOWS, "#2c2536", { size: 0.01, axis: "y", seed: 2 });
  return mix(g.at(p, n), "#4a4056", 0.25 * smoothstep(0.6, 1, n.z));
});

const WHITE_KEY_PAINT = paint((p, n) => {
  let c = mix(IVORY, "#efe2b4", smoothstep(0.4, 0.8, noise(p, 0.012, 6)) * 0.6);
  c = mix(c, "#e4d6a0", 0.25 * smoothstep(0.45, 0.7, noise(new THREE.Vector3(p.x * 0.2, p.y * 3, p.z), 0.01, 9)));
  const worn = smoothstep(0.55, 0.95, n.z) * smoothstep(0.0, 0.01, 0.075 - Math.abs(p.x - 0.22));
  return mix(c, "#d8c78e", 0.25 * worn * noise(p, 0.01, 12));
});

const BLACK_KEY_PAINT = paint((p, n) => {
  const s = smoothstep(0.3, 1, n.z) * 0.5 + smoothstep(0.6, 1, n.y) * 0.5;
  return mix(KEY_BLACK, "#5a5868", s * (0.5 + 0.5 * noise(p, 0.02, 3)));
});

const CHROME_PAINT = paint((p, n) => {
  const brush = noise(new THREE.Vector3(p.x * 8, p.y * 0.3, p.z * 8), 0.01, 14);
  let c = mix("#aab0ba", "#eef1f6", brush * 0.8 + 0.2 * smoothstep(0.3, 1, n.y));
  const tick = Math.abs(((p.y * 100) % 1 + 1) % 1 - 0.5);
  if (tick > 0.44 && ((p.y * 100) | 0) % 5 === 0) c = mix(c, "#4a4f58", 0.7);
  const d = cells(p, 0.07, 17);
  if (d.id > 0.6 && d.d1 < 0.1) c = GOLD;
  return c;
});
>>>>>>> REPLACE

<<<<<<< SEARCH
  const box = (name: string, size: [number, number, number], at: [number, number, number], color: string, rotY = 0) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, rotation: [0, rotY, 0], name });
=======
  const box = (name: string, size: [number, number, number], at: [number, number, number], color: any, rotY = 0) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, rotation: [0, rotY, 0], name });
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(nm, [W, H, D], [cx, CY, 0], PEARL);
    // lacquer top and bottom bands
    for (const y of [CY + H / 2 - 0.006, CY - H / 2 + 0.006]) box("band", [W + 0.006, 0.014, D + 0.006], [cx, y, 0], LACQUER);
=======
    box(nm, [W, H, D], [cx, CY, 0], PEARL_PAINT);
    // lacquer top and bottom bands
    for (const y of [CY + H / 2 - 0.006, CY - H / 2 + 0.006]) box("band", [W + 0.006, 0.014, D + 0.006], [cx, y, 0], CHROME_PAINT);
>>>>>>> REPLACE

<<<<<<< SEARCH
        box("edgeStrip", [0.008, H, 0.008], [x, CY, sz * (D / 2)], CHROME);
=======
        box("edgeStrip", [0.008, H, 0.008], [x, CY, sz * (D / 2)], CHROME_PAINT);
>>>>>>> REPLACE

<<<<<<< SEARCH
      box("lozengeTop", [0.07, 0.003, 0.07], [cx, CY + H / 2 + 0.0015, 0.02], PEARL_PINK, Math.PI / 4);
      box("lozengeTop2", [0.04, 0.004, 0.04], [cx, CY + H / 2 + 0.003, 0.02], PEARL_BLUE, Math.PI / 4);
    }
    box("lozengeBack", [0.1, 0.1, 0.003], [cx, CY, -D / 2 - 0.0015], PEARL_BLUE, 0).rotation.z = Math.PI / 4;
    const inner = b.part(new THREE.BoxGeometry(0.05, 0.05, 0.004), PEARL_PINK, {
=======
      box("lozengeTop", [0.07, 0.003, 0.07], [cx, CY + H / 2 + 0.0015, 0.02], PEARL_PAINT, Math.PI / 4);
      box("lozengeTop2", [0.04, 0.004, 0.04], [cx, CY + H / 2 + 0.003, 0.02], PEARL_PAINT, Math.PI / 4);
    }
    box("lozengeBack", [0.1, 0.1, 0.003], [cx, CY, -D / 2 - 0.0015], PEARL_PAINT, 0).rotation.z = Math.PI / 4;
    const inner = b.part(new THREE.BoxGeometry(0.05, 0.05, 0.004), PEARL_PAINT, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(`whiteKey${i}`, [0.13, 0.0205, 0.01], [kx, y0 + i * pitch, zKey], IVORY);
=======
    box(`whiteKey${i}`, [0.13, 0.0205, 0.01], [kx, y0 + i * pitch, zKey], WHITE_KEY_PAINT);
>>>>>>> REPLACE

<<<<<<< SEARCH
[kx + 0.0275, y0 + (i + 0.5) * pitch, zKey + 0.008], KEY_BLACK);
=======
[kx + 0.0275, y0 + (i + 0.5) * pitch, zKey + 0.008], BLACK_KEY_PAINT);
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(`bellowsPeak${i}`, [0.015, 0.43, 0.19], [x, CY, 0], BELLOWS);
    box(`bellowsValley${i}`, [0.0186, 0.4, 0.165], [x + 0.0186, CY, 0], BELLOWS_RED);
=======
    box(`bellowsPeak${i}`, [0.015, 0.43, 0.19], [x, CY, 0], PEAK_PAINT);
    box(`bellowsValley${i}`, [0.0186, 0.4, 0.165], [x + 0.0186, CY, 0], VALLEY_PAINT);
>>>>>>> REPLACE

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";

export function addTrebleGrille(b: Builder) {
  const cx = 0.31;
  const cy = 0.24;
  const X = 0.0015;

  // Grille drawing: chrome plate, perforations, gold border, pink scroll corners
  let holes = "";
  const ring = (r: number, n: number, hr: number) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      holes += `<circle cx="${(50 + Math.cos(a) * r).toFixed(1)}" cy="${(100 + Math.sin(a) * r * 1.9).toFixed(1)}" r="${hr}" fill="#2a2330" stroke="#8a8f98" stroke-width="0.8"/>`;
    }
  };
  ring(10, 8, 2.6);
  ring(19, 14, 2.4);
  ring(28, 20, 2.2);
  const scroll = (tx: number, ty: number, sx: number, sy: number) =>
    `<g transform="translate(${tx} ${ty}) scale(${sx} ${sy})"><path d="M0 0 Q14 0 14 12 Q14 22 6 20 Q2 19 4 14" fill="none" stroke="#f1cddb" stroke-width="3.2" stroke-linecap="round"/><circle cx="4" cy="14" r="2.4" fill="#f1cddb"/></g>`;
  const tex = svg(
    `<svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="98" height="198" rx="8" fill="#c9ced6" stroke="#d9a93c" stroke-width="3.5"/>
      <rect x="6" y="6" width="88" height="188" rx="5" fill="none" stroke="#8a8f98" stroke-width="1"/>
      ${holes}
      <circle cx="50" cy="100" r="4" fill="#d9a93c" stroke="#7a5a22" stroke-width="1"/>
      ${scroll(8, 8, 1, 1)}${scroll(92, 8, -1, 1)}${scroll(8, 192, 1, -1)}${scroll(92, 192, -1, -1)}
    </svg>`,
    { size: 512 },
  );

  // Plate faces +X: plane +Z rotated to +X, drawing upright
  b.part(new THREE.PlaneGeometry(0.15, 0.3), "#ffffff", {
    at: [cx + X, cy, 0],
    dir: [1, 0, 0],
    axis: "z",
    texture: tex,
    name: "grillePlate",
  });

  // Raised gold frame bars
  const t = 0.004;
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.006, 0.31, t), GOLD, { at: [cx + 0.003, cy, s * 0.077], name: "grilleFrameZ" });
    b.part(new THREE.BoxGeometry(0.006, t, 0.154), GOLD, { at: [cx + 0.003, cy + s * 0.153, 0], name: "grilleFrameY" });
  }

  // Corner gold studs
  for (const sy of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.SphereGeometry(0.0065, 8, 6), GOLD, {
        at: [cx + 0.004, cy + sy * 0.14, sz * 0.068],
        name: "grilleStud",
      });

  // Central domed boss with pearl cap
  b.part(new THREE.CylinderGeometry(0.014, 0.016, 0.006, 12), GOLD, {
    at: [cx + 0.006, cy, 0],
    dir: [1, 0, 0],
    name: "grilleBossBase",
  });
  b.part(new THREE.SphereGeometry(0.011, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), PEARL, {
    at: [cx + 0.009, cy, 0],
    dir: [1, 0, 0],
    name: "grilleBossCap",
  });

  // Small chrome rails above and below
  for (const sy of [1, -1])
    b.part(new THREE.BoxGeometry(0.004, 0.006, 0.12), CHROME, {
      at: [cx + 0.004, cy + sy * 0.162, 0],
      name: "grilleRail",
    });
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addRegisterSwitches(b: Builder) {
  // ---------- Register switches on treble top ----------
  const topY = 0.46; // treble top surface (0.24 + 0.22)
  const cx = 0.22;
  const slotZ = 0.04;

  // slim lacquer slot bar
  b.part(new THREE.BoxGeometry(0.13, 0.004, 0.034), LACQUER, { at: [cx, topY + 0.002, slotZ], name: "regSlot" });
  // chrome frame lines either side of the bar
  for (const dz of [-1, 1])
    b.part(new THREE.BoxGeometry(0.134, 0.003, 0.002), CHROME, {
      at: [cx, topY + 0.0015, slotZ + dz * 0.019],
      name: "regRail",
    });

  for (let i = 0; i < 5; i++) {
    const x = cx - 0.052 + i * 0.026;
    const col = i % 2 === 0 ? PEARL : IVORY;
    // recessed dark well
    b.part(new THREE.BoxGeometry(0.02, 0.002, 0.026), KEY_BLACK, { at: [x, topY + 0.0045, slotZ], name: "regWell" });
    // rocker tab, tilted about X
    const tab = b.part(new THREE.BoxGeometry(0.018, 0.006, 0.016), col, {
      at: [x, topY + 0.0085, slotZ + 0.002],
      name: `regTab${i}`,
    });
    tab.rotation.x = i % 2 === 0 ? 0.28 : -0.28;
    // pearl pink tip on the raised edge
    b.part(new THREE.BoxGeometry(0.018, 0.0045, 0.004), PEARL_PINK, {
      at: [x, topY + 0.0105 + (i % 2 === 0 ? 0.0005 : -0.0005), slotZ + (i % 2 === 0 ? 0.009 : -0.005)],
      name: "regTip",
    });
    // gold pivot pins at the sides
    for (const sx of [-1, 1])
      b.part(new THREE.CylinderGeometry(0.0022, 0.0022, 0.003, 6), GOLD, {
        at: [x + sx * 0.0105, topY + 0.0075, slotZ],
        rotation: [0, 0, 90],
        name: "regPivot",
      });
  }

  // ---------- Bass button board ----------
  const bx = -0.22;
  const by = 0.23;
  const bz = 0.104; // panel front surface
  const cols = 5;
  const rows = 6;
  const dx = 0.026;
  const dy = 0.052;

  // chrome frame around the board
  const fw = 0.146;
  const fh = 0.366;
  for (const sy of [-1, 1])
    b.part(new THREE.BoxGeometry(fw, 0.004, 0.004), CHROME, { at: [bx, by + sy * fh / 2, bz + 0.002], name: "bassFrame" });
  for (const sx of [-1, 1])
    b.part(new THREE.BoxGeometry(0.004, fh, 0.004), CHROME, { at: [bx + sx * fw / 2, by, bz + 0.002], name: "bassFrame" });

  const rimG = new THREE.CylinderGeometry(0.0105, 0.0115, 0.004, 10);
  const stemG = new THREE.CylinderGeometry(0.0075, 0.0075, 0.008, 8);
  const capG = new THREE.SphereGeometry(0.0095, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2);
  const markG = new THREE.CylinderGeometry(0.0035, 0.0035, 0.0015, 8);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // staggered rows like a real stradella board
      const x = bx + (c - (cols - 1) / 2) * dx + (r % 2 ? 0.005 : -0.005);
      const y = by + (r - (rows - 1) / 2) * dy * 0.96 + 0.0;
      const p: [number, number, number] = [x, y, bz];
      b.part(rimG, CHROME, { at: [x, y, bz + 0.002], dir: [0, 0, 1], name: "bassRim" });
      b.part(stemG, KEY_BLACK, { at: [x, y, bz + 0.005], dir: [0, 0, 1], name: "bassStem" });
      b.part(capG, PEARL, { at: [x, y, bz + 0.008], dir: [0, 0, 1], name: "bassCap" });
      // gold root marker on the middle column
      if (c === 2)
        b.part(markG, GOLD, { at: [p[0], p[1], bz + 0.0185], dir: [0, 0, 1], name: "bassRoot" });
    }
  }
  // pearl-blue marker strips on the sides of the board for orientation
  for (const sx of [-1, 1])
    b.part(new THREE.BoxGeometry(0.003, 0.3, 0.002), PEARL_BLUE, {
      at: [bx + sx * 0.0685, by, bz + 0.0015],
      name: "bassInlay",
    });
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder, svg, rng } from "agentic-3js-builder";

export function addBrandPlate(b: Builder) {
  const R = rng(11);

  // ---------- Brand plate (treble, above the keys, faces +Z) ----------
  const cx = 0.22, cy = 0.435, cz = 0.101;
  const plateTex = svg(
    `<svg viewBox="0 0 150 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="148" height="38" rx="9" fill="#d9a93c" stroke="#14121a" stroke-width="2.6"/>
      <rect x="6" y="6" width="138" height="28" rx="6" fill="none" stroke="#14121a" stroke-width="1.2"/>
      <path d="M10 20 Q16 10 24 20 Q16 30 10 20Z" fill="#f1cddb" stroke="#14121a" stroke-width="1"/>
      <path d="M140 20 Q134 10 126 20 Q134 30 140 20Z" fill="#f1cddb" stroke="#14121a" stroke-width="1"/>
      <text x="75" y="25.5" text-anchor="middle" font-family="serif" font-weight="bold" font-size="15" fill="#14121a" letter-spacing="2">ROSSINI</text>
      <path d="M45 31 Q75 36 105 31" stroke="#f1cddb" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <circle cx="75" cy="8" r="1.6" fill="#f1cddb"/>
    </svg>`,
    { size: 512 },
  );
  b.part(new THREE.PlaneGeometry(0.15, 0.04), "#ffffff", {
    at: [cx, cy, cz + 0.0015],
    dir: [0, 0, 1],
    axis: "z",
    texture: plateTex,
    name: "brandPlate",
  });
  b.part(new THREE.BoxGeometry(0.152, 0.042, 0.002), LACQUER, { at: [cx, cy, cz + 0.0005], name: "brandBacking" });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.003, 6, 4), CHROME, { at: [cx + s * 0.07, cy, cz + 0.003], name: "brandRivet" });

  // ---------- Bellows trim ----------
  const CYb = 0.24;
  const frontZ = 0.1;
  // gold binding lines on each peak front edge, front and back
  for (let i = 0; i < 7; i++) {
    const x = -0.13 + 0.0093 + i * 0.0372;
    for (const sz of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.004, 0.43, 0.003), GOLD, { at: [x, CYb, sz * (frontZ - 0.002) + sz * 0.0005], name: "bellowsBinding" });
    }
    // small gold studs top and bottom front on each peak
    for (const sy of [1, -1])
      b.part(new THREE.SphereGeometry(0.004, 6, 4), GOLD, {
        at: [x, CYb + sy * 0.2, frontZ + 0.002],
        name: "bellowsStud",
      });
  }
  // pink corner protectors at the four front corners of the bellows
  for (const sx of [1, -1])
    for (const sy of [1, -1]) {
      const px = sx * 0.123;
      const py = CYb + sy * 0.208;
      b.part(new THREE.BoxGeometry(0.02, 0.022, 0.012), PEARL_PINK, { at: [px, py, frontZ + 0.002], name: "cornerProtector" });
      b.part(new THREE.BoxGeometry(0.022, 0.004, 0.014), GOLD, {
        at: [px, py + sy * 0.0105, frontZ + 0.002],
        name: "cornerTrim",
      });
      b.part(new THREE.SphereGeometry(0.0035, 6, 4), CHROME, {
        at: [px, py, frontZ + 0.0095],
        name: "cornerStud",
      });
    }
  // chrome center clasp plate on the bellows front
  b.part(new THREE.BoxGeometry(0.03, 0.05, 0.004), CHROME, { at: [0, CYb + R() * 0.0, frontZ + 0.003], name: "bellowsClasp" });
  b.part(new THREE.SphereGeometry(0.006, 8, 6), GOLD, { at: [0, CYb, frontZ + 0.006], name: "claspStud" });
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";

export function addBellowsStrap(b: Builder) {
  const STRAP_DARK = "#0c0a10";
  const STITCH = "#e8dcc0";

  // Leather texture: stitch lines along the edges, drawn on a strap plane
  const leatherTex = svg(
    `<svg viewBox="0 0 128 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="24" fill="#d8d8d8"/>
      <path d="M0 4 H128 M0 20 H128" stroke="#ffffff" stroke-width="1.6" stroke-dasharray="4 3"/>
      <path d="M0 0.5 H128 M0 23.5 H128" stroke="#8a8a8a" stroke-width="1"/>
    </svg>`,
    { size: 256 },
  );

  const zFront = 0.1 + 0.0; // bellows front plane ~ 0.095 half depth
  const zS = 0.101;
  const y = 0.12;
  const xMin = -0.13;
  const xMax = 0.13;

  // Main strap band across the bellows front
  const len = xMax - xMin;
  const strapMid = (xMin + xMax) / 2;
  b.part(new THREE.PlaneGeometry(len, 0.034), LACQUER, {
    at: [strapMid, y, zS + 0.0005],
    dir: [0, 0, 1],
    axis: "z",
    texture: leatherTex,
    name: "strapBand",
  });
  b.part(new THREE.BoxGeometry(len, 0.03, 0.003), LACQUER, {
    at: [strapMid, y, zS - 0.0005],
    name: "strapCore",
  });

  // Wraps around the bellows sides (thin side pieces) where it hangs from the bass side
  for (const sx of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.003, 0.03, 0.02), LACQUER, {
      at: [sx * (len / 2 + 0.0015), y, zS - 0.01],
      name: "strapWrap",
    });
  }

  // Bass-side anchor: gold-edged leather tab with stud
  const ax = -0.12;
  b.part(new THREE.BoxGeometry(0.04, 0.042, 0.004), STRAP_DARK, { at: [ax, y, zS + 0.002], name: "anchorTab" });
  b.part(new THREE.BoxGeometry(0.044, 0.003, 0.0045), GOLD, { at: [ax, y + 0.0225, zS + 0.002], name: "anchorTrimTop" });
  b.part(new THREE.BoxGeometry(0.044, 0.003, 0.0045), GOLD, { at: [ax, y - 0.0225, zS + 0.002], name: "anchorTrimBot" });
  b.part(new THREE.CylinderGeometry(0.007, 0.008, 0.005, 10), GOLD, {
    at: [ax, y, zS + 0.0055],
    dir: [0, 0, 1],
    name: "goldStud",
  });
  b.part(new THREE.SphereGeometry(0.0035, 6, 4), PEARL, { at: [ax, y, zS + 0.0085], name: "studPearl" });

  // Chrome buckle on treble side
  const bx = 0.075;
  const fz = zS + 0.004;
  const frameT = 0.004;
  const bw = 0.036;
  const bh = 0.04;
  b.part(new THREE.BoxGeometry(bw, frameT, 0.004), CHROME, { at: [bx, y + bh / 2 - frameT / 2, fz], name: "buckleTop" });
  b.part(new THREE.BoxGeometry(bw, frameT, 0.004), CHROME, { at: [bx, y - bh / 2 + frameT / 2, fz], name: "buckleBot" });
  for (const sx of [1, -1])
    b.part(new THREE.BoxGeometry(frameT, bh, 0.004), CHROME, {
      at: [bx + sx * (bw / 2 - frameT / 2), y, fz],
      name: "buckleSide",
    });
  // centre bar and prong
  b.part(new THREE.BoxGeometry(0.003, bh - 0.004, 0.003), CHROME, { at: [bx - 0.003, y, fz + 0.001], name: "buckleBar" });
  b.part(new THREE.BoxGeometry(0.022, 0.0035, 0.003), CHROME, { at: [bx + 0.006, y, fz + 0.003], name: "prong" });
  b.part(new THREE.SphereGeometry(0.0035, 6, 4), GOLD, { at: [bx - 0.003, y, fz + 0.003], name: "prongPivot" });

  // Holes and keeper loop on strap tail
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.CylinderGeometry(0.0022, 0.0022, 0.001, 8), STRAP_DARK, {
      at: [0.015 - i * 0.017 - 0.03, y, zS + 0.0022],
      dir: [0, 0, 1],
      name: "strapHole",
    });
  }
  b.part(new THREE.BoxGeometry(0.008, 0.036, 0.0045), STRAP_DARK, { at: [0.035, y, zS + 0.0025], name: "keeper" });

  // Hanging tail end tip, pointed
  const tail = b.extrude(
    [
      [0, -0.015],
      [0.05, -0.015],
      [0.062, 0, "sharp"],
      [0.05, 0.015],
      [0, 0.015],
    ],
    { at: [0.1, y, zS + 0.001], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.003, color: STRAP_DARK },
  );
  b.part(new THREE.CylinderGeometry(0.0035, 0.0035, 0.002, 8), GOLD, {
    at: [0.158, y, zS + 0.0035],
    dir: [0, 0, 1],
    name: "tailEyelet",
  });
  void tail;
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder, svg, rng } from "agentic-3js-builder";

export function addShoulderStraps(b: Builder) {
  const r = rng(25);
  const PAD = "#2b2530";

  // ---------- helpers ----------
  const box = (size: [number, number, number], at: [number, number, number], color: string, name: string, rot: [number, number, number] = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, rotation: rot, name });

  const stitchTex = svg(
    `<svg viewBox="0 0 32 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="128" fill="#ffffff"/>
      <path d="M5 0V128M27 0V128" stroke="#9a9aa0" stroke-width="3" stroke-dasharray="7 5"/>
      <path d="M16 4 L22 16 L16 28 L10 16Z M16 52 L22 64 L16 76 L10 64Z M16 100 L22 112 L16 124 L10 112Z" fill="#cfcfd6"/>
    </svg>`,
    { size: 128 },
  );

  const BACK = -0.1 - 0.012; // just behind back lozenge plane
  const zBack = -0.1;

  // ---------- shoulder straps ----------
  for (const s of [1, -1]) {
    const x = s * 0.2;
    // pad strip (lacquer) with textured stitched face
    b.part(new THREE.BoxGeometry(0.065, 0.46, 0.014), LACQUER, { at: [x, 0.24, zBack - 0.016], name: "s25strap" });
    b.part(new THREE.PlaneGeometry(0.065, 0.44), LACQUER, {
      at: [x, 0.24, zBack - 0.0235],
      dir: [0, 0, -1],
      axis: "z",
      texture: stitchTex,
      name: "s25stitch",
    });
    // red lining edges
    for (const e of [1, -1]) box([0.006, 0.46, 0.016], [x + e * 0.0355, 0.24, zBack - 0.016], BELLOWS_RED, "s25lining");
    // padded cushion near the top
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.1, 8), PAD, {
      at: [x, 0.37, zBack - 0.034],
      rotation: [0, 0, 0],
      scale: [1, 1, 0.35],
      name: "s25pad",
    });
    box([0.05, 0.08, 0.012], [x, 0.37, zBack - 0.042], BELLOWS_RED, "s25padInlay");
    // chrome slide (adjuster)
    box([0.075, 0.012, 0.022], [x, 0.16, zBack - 0.03], CHROME, "s25slide");
    box([0.05, 0.006, 0.024], [x, 0.16, zBack - 0.032], LACQUER, "s25slideBar");
    // gold rivets
    for (const y of [0.025, 0.1, 0.3, 0.455])
      for (const dx of [-0.02, 0.02])
        b.part(new THREE.SphereGeometry(0.0065, 6, 4), GOLD, { at: [x + dx, y, zBack - 0.025], name: "s25rivet" });
    // chrome D-ring anchors at bottom and top
    for (const y of [0.012, 0.468]) {
      b.part(new THREE.TorusGeometry(0.014, 0.0035, 5, 10), CHROME, { at: [x, y, zBack - 0.026], name: "s25ring" });
    }
  }
  // cross strap behind the boxes joining straps
  box([0.4, 0.03, 0.01], [0, 0.4, zBack - 0.026], LACQUER, "s25cross");
  box([0.4, 0.004, 0.011], [0, 0.4, zBack - 0.0265], BELLOWS_RED, "s25crossLine");
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.012, 8), CHROME, {
    at: [0, 0.4, zBack - 0.034],
    dir: [0, 0, -1],
    name: "s25crossBuckle",
  });
  b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD, { at: [0, 0.4, zBack - 0.042], name: "s25crossStud" });

  // ---------- bass wrist strap (bass box back, on -x side) ----------
  const bx = -0.22;
  box([0.12, 0.05, 0.01], [bx, 0.3, zBack - 0.016], LACQUER, "s25wrist");
  box([0.12, 0.036, 0.011], [bx, 0.3, zBack - 0.0165], PAD, "s25wristPad");
  box([0.12, 0.004, 0.012], [bx, 0.3, zBack - 0.019], BELLOWS_RED, "s25wristLine");
  for (const dx of [-0.05, 0.05]) {
    box([0.014, 0.06, 0.016], [bx + dx, 0.3, zBack - 0.018], CHROME, "s25wristPlate");
    b.part(new THREE.SphereGeometry(0.006, 6, 4), GOLD, { at: [bx + dx, 0.3, zBack - 0.028], name: "s25wristRivet" });
  }

  // ---------- bass end inlay mosaic ----------
  const ex = -0.31 - 0.001;
  const tiles = [PEARL_PINK, PEARL_BLUE, PEARL_MINT];
  const plate = box([0.004, 0.32, 0.15], [ex - 0.001, 0.24, 0], PEARL, "s25inlayBase");
  // gold frame
  for (const dy of [0.16, -0.16]) box([0.006, 0.004, 0.152], [ex - 0.002, 0.24 + dy, 0], GOLD, "s25frame");
  for (const dz of [0.076, -0.076]) box([0.006, 0.324, 0.004], [ex - 0.002, 0.24, dz], GOLD, "s25frame");
  // diamond grid
  let k = 0;
  for (let row = 0; row < 7; row++)
    for (let col = 0; col < 3; col++) {
      const off = row % 2 ? 0.025 : 0;
      const z = -0.05 + col * 0.05 + off - 0.0125;
      if (Math.abs(z) > 0.062) continue;
      const y = 0.24 - 0.135 + row * 0.045;
      const d = b.part(new THREE.BoxGeometry(0.004, 0.034, 0.034), tiles[k++ % 3], {
        at: [ex - 0.004, y, z],
        name: "s25tile",
      });
      d.rotation.x = Math.PI / 4;
      if (r() > 0.6)
        b.part(new THREE.SphereGeometry(0.004, 5, 4), GOLD, { at: [ex - 0.0065, y, z], name: "s25tileDot" });
    }
  // central rosette
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.004, 8), GOLD, {
    at: [ex - 0.006, 0.24, 0],
    dir: [-1, 0, 0],
    name: "s25rosette",
  });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.005, 8), PEARL_PINK, {
    at: [ex - 0.008, 0.24, 0],
    dir: [-1, 0, 0],
    name: "s25rosetteCap",
  });
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";

export function addAirButton(b: Builder) {
  const EN = "#8a6a1e";

  // ---- Air release button on bass top (box top y = 0.46) ----
  const ax = -0.28, az = -0.03, top = 0.46;
  // gold collar (lathe-like stack of cylinders)
  b.part(new THREE.CylinderGeometry(0.019, 0.021, 0.006, 12), GOLD, { at: [ax, top + 0.003, az], name: "airCollar" });
  b.part(new THREE.CylinderGeometry(0.014, 0.017, 0.004, 12), CHROME, { at: [ax, top + 0.008, az], name: "airCollarRing" });
  // chrome stem
  b.part(new THREE.CylinderGeometry(0.0045, 0.0045, 0.014, 8), CHROME, { at: [ax, top + 0.013, az], name: "airStem" });
  // pearl dome cap
  b.part(new THREE.SphereGeometry(0.015, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), PEARL, {
    at: [ax, top + 0.019, az],
    scale: [1, 0.7, 1],
    name: "airCap",
  });
  b.part(new THREE.TorusGeometry(0.0152, 0.0013, 5, 14), GOLD, {
    at: [ax, top + 0.0195, az],
    rotation: [90, 0, 0],
    name: "airCapRim",
  });
  // small glint on cap
  b.part(new THREE.SphereGeometry(0.003, 6, 4), "#ffffff", { at: [ax - 0.005, top + 0.0275, az + 0.005], name: "airGlint" });
  // tiny gold studs around collar
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.0022, 6, 4), GOLD, {
      at: [ax + Math.cos(a) * 0.0235, top + 0.0015, az + Math.sin(a) * 0.0235],
      name: "airStud",
    });
  }

  // ---- Key marks ----
  const kx = 0.22;
  const zFront = 0.1 + 0.004 + 0.01 + 0.0006; // front face of the white keys
  const midY = 0.226;
  // middle C mark: small lacquer dot with gold ring on key 7
  b.part(new THREE.CylinderGeometry(0.0045, 0.0045, 0.001, 10), GOLD, {
    at: [kx - 0.05, midY, zFront],
    rotation: [90, 0, 0],
    name: "midCRing",
  });
  b.part(new THREE.CylinderGeometry(0.003, 0.003, 0.0012, 10), LACQUER, {
    at: [kx - 0.05, midY, zFront + 0.0003],
    rotation: [90, 0, 0],
    name: "midCDot",
  });

  // key dividing lines: thin lacquer strips between white keys
  const pitch = 0.0233;
  const y0 = 0.055 + 0.0116;
  for (let i = 0; i < 16; i++) {
    const y = y0 + (i - 0.5) * pitch;
    b.part(new THREE.BoxGeometry(0.13, 0.0008, 0.0012), LACQUER, { at: [kx, y, zFront], name: "keyLine" });
  }

  // engraved tick drawing on the key bed's left margin (a tiny gold scale)
  const ticks = svg(
    `<svg viewBox="0 0 16 64" xmlns="http://www.w3.org/2000/svg">${Array.from({ length: 15 }, (_, i) =>
      `<rect x="${i % 2 ? 6 : 2}" y="${4 + i * 4}" width="${i % 2 ? 4 : 10}" height="1.6" fill="${EN}"/>`,
    ).join("")}</svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.012, 0.34), "#ffffff", {
    at: [kx - 0.0715, 0.23, 0.1045],
    dir: [0, 0, 1],
    axis: "z",
    texture: ticks,
    name: "keyScale",
  });
  // matching scale on right margin
  b.part(new THREE.PlaneGeometry(0.012, 0.34), "#ffffff", {
    at: [kx + 0.0715, 0.23, 0.1045],
    dir: [0, 0, 1],
    axis: "z",
    texture: ticks,
    name: "keyScale2",
  });
}
```