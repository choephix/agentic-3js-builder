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