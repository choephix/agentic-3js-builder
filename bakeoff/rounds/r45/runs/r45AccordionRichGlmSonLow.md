<!-- call: plan -->

```json
{
  "name": "Mother-of-Pearl Piano Accordion",
  "description": "A full-size Italian piano accordion standing on small feet, its treble case and keyboard facing the viewer, with a pleated oxblood bellows inlaid with pearl lozenges and a stradella bass board on its left face, every surface trimmed in mother-of-pearl sheen panels and gold pinstripes.",
  "builderName": "pearlAccordion",
  "size": [0.6, 0.45, 0.62],
  "layout": "Static display model, no joints, all geometry in model space. Front view (+Z): the piano keyboard runs across the top of the shallow treble case (white keys y 0.302..0.320, black keys proud above them, keycase with sloped lid up to y 0.445); below the keys the ornate grille with a pearl lozenge rosette; a nacre shelf under the keybed carries the deck. The bellows spine runs straight back: 13 oxblood fold cards with pearl lozenge inlays alternating with dark recessed pleats, ending at the bass box (z -0.155..-0.315) whose tall walnut bellows frame plates cap both ends. The bass button board sits on the left face (+X) with 4 diagonal rows of stradella buttons and a bass strap; the treble strap wraps the right face (-X). Both boxes rest on small rubber feet at y=0. Mother-of-pearl shows on every part: iridescent sheen built from alternating small tiles of nacre, blush, sea, sky, lilac and warm nacre, separated by inkPlum seams, edged with gold and goldLight pinstripes, with chrome corner caps and buckles as hardware accents.",
  "palette": {
    "nacre": "#f6efe2",
    "nacreBlush": "#f2d8d2",
    "nacreSea": "#ddeee4",
    "nacreSky": "#dce9f4",
    "nacreLilac": "#e9ddf2",
    "nacreGold": "#f3e3bd",
    "inkPlum": "#35263f",
    "ivory": "#fcf8f0",
    "ebony": "#201a28",
    "oxblood": "#7c2233",
    "oxbloodDark": "#4c101d",
    "gold": "#c9962a",
    "goldLight": "#e9c864",
    "walnut": "#6e4426",
    "walnutDark": "#4d2e18",
    "leather": "#7d4630",
    "feltRed": "#a1233a",
    "chrome": "#d8dee6",
    "rubber": "#242028",
    "teal": "#3f8f85"
  },
  "mounts": {
    "keybedSeat": [0, 0.288, 0.2],
    "bellowsFrameFront": [0, 0.23, 0.1],
    "bellowsFrameBack": [0, 0.23, -0.14]
  },
  "joints": [],
  "parts": [
    {
      "id": "keyboard",
      "builds": "The treble keyboard and keycase, facing +Z. WalnutDark keybed deck: slab x -0.255..0.255, y 0.288..0.302, z 0.185..0.30, sitting on the treble shelf; its front edge carries a walnut thumb rail (x -0.255..0.255, y 0.288..0.302, z 0.292..0.302) with a goldLight pinstripe. One inkPlum seam strip under the keys (x -0.24..0.24, y 0.301..0.304, z 0.194..0.298) so key gaps read dark. A feltRed strip (x -0.25..0.25, y 0.302..0.317, z 0.19..0.194) shows just behind the key fronts. 24 ivory white keys: boxes 0.0186 wide x 0.018 tall x 0.11 deep (y 0.302..0.320, z 0.19..0.30) on a 0.0196 pitch centred on x=0. 17 ebony black keys: boxes 0.011 wide x 0.016 tall x 0.06 deep (y 0.320..0.336, z 0.236..0.296) in the standard 2+3 pattern: one between each adjacent white-key pair except after every E and B (boundaries 2, 6, 9, 13, 16, 20 counting from the left are skipped). Keycase: two walnut cheek blocks at x +/- (0.225..0.26), y 0.30..0.44, z 0.185..0.30, each with a nacreBlush inlay panel (0.02 x 0.09, proud 0.004) on its front face and a gold pinstripe down its outer edge. Keycase lid: sloped board from y 0.415 at z 0.30 up to y 0.44 at z 0.185, thickness 0.012, walnutDark, carrying an inset nacre panel framed by a gold pinstripe and a centred rosette of 8 lozenge tiles alternating nacreSea and nacreLilac with inkPlum outlines and a small teal diamond accent at the centre. Front fascia below the lid (walnutDark, x -0.225..0.225, y 0.34..0.415, z 0.29..0.302) with 5 small nacreSky rectangular tiles and a nacreGold maker's plate (0.05 x 0.012) with a gold border at its centre.",
      "box": [[-0.26, 0.288, 0.183], [0.26, 0.445, 0.302]],
      "attaches": "The deck rests on the trebleBody's nacre shelf (its top face at y 0.288, mount keybedSeat); cheeks and lid back edge align at z 0.185 over the treble case front.",
      "joints": [],
      "floor": false,
      "budget": 260
    },
    {
      "id": "trebleBody",
      "builds": "The lower treble case. Main box x -0.26..0.26, y 0.018..0.285, z 0.115..0.185 clad in nacre; its two side faces carry three vertical sheen tiles each (nacre, nacreBlush, nacreSky) separated by inkPlum seam lines, with gold pinstripes along top and bottom. Nacre shelf supporting the keybed: x -0.255..0.255, y 0.27..0.288, z 0.185..0.302, with a goldLight pinstripe along its front edge. Front grille: recessed inkPlum backing panel (x -0.225..0.225, y 0.03..0.26, z 0.172..0.178) behind an ornamental gold frame (x -0.235..0.235, y 0.02..0.265, proud to z 0.19) with a goldLight inner bead; a lattice of 6 vertical gold bars (0.006 wide, evenly spread) over the backing; centred rosette at (0, 0.16): 12 lozenge tiles in a diamond of 3 rows alternating nacreSea, nacreBlush and nacreSky with inkPlum outlines, a teal diamond accent at its centre, and a small nacreGold crown emblem (three tiny gold spikes on a gold band) just above the rosette at y 0.22. Bellows frame plate: walnut ring x -0.245..0.245, y 0.016..0.444, z 0.100..0.115 with a goldLight inlay line around its outer edge and a raised inner lip; it butts the first bellows fold at mount bellowsFrameFront and rises behind the keycase. Two rubber feet (cylinders r 0.02, h 0.018) at (+/-0.20, 0.009, 0.145). Treble strap on the right face (-X): leather band 0.055 wide x 0.006 thick in a horizontal loop at y 0.20..0.255, running from the front face at z 0.19 around the side bulging to x -0.298 and ending on the back face at z 0.115, with a chrome buckle mid-band and 5 goldLight studs along it.",
      "box": [[-0.298, 0, 0.098], [0.26, 0.446, 0.192]],
      "attaches": "Feet on the floor at y=0; its shelf top (y 0.288) carries the keyboard deck at mount keybedSeat; its bellows frame plate butts the first bellows fold at mount bellowsFrameFront.",
      "joints": [],
      "floor": true,
      "budget": 210
    },
    {
      "id": "bellows",
      "builds": "The pleated bellows spine between the two frame plates. 13 outer fold cards: slabs x -0.232..0.232, y 0.028..0.428, thickness 0.004, centred at z = 0.098 - i x 0.0198 for i = 0..12 (the first card butts mount bellowsFrameFront at z 0.100, the last butts mount bellowsFrameBack at z -0.140), colour oxblood. Each card carries 4 pearl lozenge tiles (rotated-square diamonds 0.045 tall and 0.045 wide) with inkPlum outlines at mid-height y 0.205..0.25, centred at x = -0.15, -0.05, 0.05, 0.15, colours cycling nacreGold, nacreSky, nacreBlush, nacreSea; plus a goldLight pinstripe along its top edge (y 0.422..0.426) and bottom edge (y 0.030..0.034). Between consecutive cards, 12 recessed inner pleat boxes (oxbloodDark, x -0.227..0.227, y 0.033..0.423, thickness 0.013, centred midway between adjacent cards). Chrome corner protectors: small L-caps (0.035 x 0.035 x 0.012, chrome) wrapping the four corners of the first and last fold cards, 8 caps in total.",
      "box": [[-0.245, 0.026, -0.145], [0.245, 0.43, 0.102]],
      "attaches": "Front card butts the treble frame plate at mount bellowsFrameFront (z 0.100); back card butts the bass frame plate at mount bellowsFrameBack (z -0.140); it hangs between the two bodies and never touches the floor.",
      "joints": [],
      "floor": false,
      "budget": 180
    },
    {
      "id": "bassBody",
      "builds": "The bass half. Case box x -0.24..0.24, y 0.018..0.44, z -0.315..-0.155 clad in nacre with sheen tiling: top face and both side faces carry panels of alternating nacre and nacreSea rectangles separated by inkPlum seams, gold pinstripes along all top and bottom edges; the back face (z -0.315) carries a centred rosette of 8 lozenge tiles alternating nacreBlush and nacreSky with inkPlum outlines inside a gold ring. Bellows frame plate: walnut ring x -0.245..0.245, y 0.016..0.444, z -0.155..-0.140 with a goldLight inlay line and raised inner lip, butting the last bellows fold at mount bellowsFrameBack. Bass button board on the left face (+X): walnutDark panel proud of the case at x 0.24..0.248, y 0.075..0.30, z -0.19..-0.29, trimmed with goldLight beading; 4 diagonal rows of 16 stradella buttons: cylinders r 0.005, h 0.011 protruding along +X from the board face (x 0.248), row r (0..3) at y = 0.275 - r x 0.053, button c (0..15) at z = -0.202 - c x 0.0058 with each row also rising 0.0016 per button (slight diagonal), rows 0 and 3 ebony, rows 1 and 2 ivory. One chrome-ringed air button (ivory cylinder r 0.009, h 0.012) below the board at (x 0.252, y 0.05, z -0.19). Bass strap on the left face: leather band 0.055 wide x 0.006 thick in a horizontal loop at y 0.30..0.355, from the case front at z -0.16 around the side bulging to x +0.298 to the case back at z -0.31, with a chrome buckle and 5 goldLight studs. Two rubber feet (cylinders r 0.02, h 0.018) at (+/-0.19, 0.009, -0.23).",
      "box": [[-0.26, 0, -0.318], [0.298, 0.446, -0.138]],
      "attaches": "Feet on the floor at y=0; its bellows frame plate butts the last bellows fold at mount bellowsFrameBack; it stands clear of the keyboard and treble case.",
      "joints": [],
      "floor": true,
      "budget": 190
    }
  ]
}
```

<!-- call: bellows -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildBellows({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], name });
  const cycle = [P.nacreGold, P.nacreSky, P.nacreBlush, P.nacreSea];
  const diamond = (s: number, th: number) => {
    const g = new THREE.CylinderGeometry(s * Math.SQRT1_2, s * Math.SQRT1_2, th, 4, 1);
    g.rotateX(Math.PI / 2);
    g.rotateZ(0);
    return g;
  };
  // Cylinder with 4 sides has vertices at +/-X after rotation; rotate 45deg about Z to point up
  const lozenge = (s: number, th: number) => {
    const g = new THREE.CylinderGeometry(s / 2, s / 2, th, 4, 1);
    g.rotateX(Math.PI / 2);
    return g;
  };
  void diamond;

  const zs: number[] = [];
  for (let i = 0; i < 13; i++) zs.push(0.098 - i * 0.0198);

  for (let i = 0; i < 13; i++) {
    const z = zs[i];
    box(0.464, 0.4, 0.004, P.oxblood, 0, 0.228, z, `fold${i}`);
    // pinstripes
    box(0.46, 0.004, 0.0046, P.goldLight, 0, 0.424, z);
    box(0.46, 0.004, 0.0046, P.goldLight, 0, 0.032, z);
    // pearl lozenges on both faces of the card
    [-0.15, -0.05, 0.05, 0.15].forEach((x, k) => {
      const col = cycle[(k + i) % 4];
      for (const f of [1, -1]) {
        b.part(lozenge(0.05, 0.0012), P.inkPlum, { at: [x, 0.2275, z + f * 0.0022] });
        b.part(lozenge(0.042, 0.0016), col, { at: [x, 0.2275, z + f * 0.0027] });
      }
    });
    // inner pleats
    if (i < 12) {
      const zm = (z + zs[i + 1]) / 2;
      box(0.454, 0.39, 0.013, P.oxbloodDark, 0, 0.228, zm, `pleat${i}`);
    }
  }

  // chrome L corner caps on first and last cards
  for (const [i, dir] of [[0, 1], [12, -1]] as const) {
    const z = zs[i] + dir * 0.0;
    for (const sx of [1, -1])
      for (const sy of [1, -1]) {
        const x = sx * (0.232 - 0.0175);
        const y = 0.228 + sy * (0.2 - 0.0175);
        box(0.035, 0.035, 0.012, P.chrome, x, y, z + dir * 0.0, "cap");
        // small raised bead in gold to make it an L-cap feel
        box(0.012, 0.012, 0.0135, P.gold, x - sx * 0.007, y - sy * 0.007, z);
      }
  }
}
```

<!-- call: keyboard -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildKeyboard({ b, J, P, M }: Ctx) {
  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, c: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), c, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    });

  // deck, thumb rail, seam, felt
  box(-0.255, 0.255, 0.288, 0.302, 0.185, 0.3, P.walnutDark);
  box(-0.255, 0.255, 0.288, 0.302, 0.292, 0.302, P.walnut);
  box(-0.255, 0.255, 0.3015, 0.3025, 0.3015, 0.3035, P.goldLight);
  box(-0.24, 0.24, 0.301, 0.304, 0.194, 0.298, P.inkPlum);
  box(-0.25, 0.25, 0.302, 0.317, 0.19, 0.194, P.feltRed);

  // white keys
  const pitch = 0.0196;
  for (let i = 0; i < 24; i++) {
    const x = (i - 11.5) * pitch;
    box(x - 0.0093, x + 0.0093, 0.302, 0.32, 0.19, 0.3, P.ivory);
  }
  // black keys
  const skip = new Set([2, 6, 9, 13, 16, 20]);
  for (let k = 1; k < 24; k++) {
    if (skip.has(k)) continue;
    const x = (k - 12) * pitch;
    box(x - 0.0055, x + 0.0055, 0.32, 0.336, 0.236, 0.296, P.ebony);
  }

  // cheeks
  for (const s of [1, -1]) {
    const x0 = s > 0 ? 0.225 : -0.26;
    const x1 = s > 0 ? 0.26 : -0.225;
    box(x0, x1, 0.3, 0.44, 0.185, 0.3, P.walnut);
    const cx = s * 0.2425;
    box(cx - 0.01, cx + 0.01, 0.335, 0.425, 0.3, 0.304, P.nacreBlush);
    // gold pinstripe on outer edge
    const ox = s * 0.2585;
    box(ox - 0.001, ox + 0.001, 0.302, 0.438, 0.19, 0.298, P.gold);
    // sheen tiles on the cheek front
    box(cx - 0.006, cx + 0.006, 0.34, 0.352, 0.3035, 0.305, P.nacreSea);
    box(cx - 0.006, cx + 0.006, 0.408, 0.42, 0.3035, 0.305, P.nacreLilac);
  }

  // sloped lid
  const slope = Math.atan2(0.025, 0.115);
  const lidLen = Math.hypot(0.115, 0.025);
  const lidMid: [number, number, number] = [0, (0.415 + 0.44) / 2 + 0.006, 0.2425];
  const lidPart = (w: number, d: number, c: string, dy: number, dx = 0, dz = 0) =>
    b.part(new THREE.BoxGeometry(w, 0.002 + dy * 0, d), c, {
      at: [lidMid[0] + dx, lidMid[1] + dy, lidMid[2] + dz],
      rotation: [slope * (180 / Math.PI), 0, 0],
    });
  b.part(new THREE.BoxGeometry(0.45, 0.012, lidLen), P.walnutDark, {
    at: [0, 0.4275, 0.2425],
    rotation: [slope * (180 / Math.PI), 0, 0],
  });
  lidPart(0.4, lidLen - 0.02, P.gold, 0.0075);
  lidPart(0.392, lidLen - 0.028, P.nacre, 0.0085);
  // rosette: 8 lozenges
  const cy = 0.4275 + 0.0095;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const r = 0.03;
    const c = i % 2 ? P.nacreLilac : P.nacreSea;
    const px = Math.cos(a) * r;
    const pz = Math.sin(a) * r * 0.9;
    const outline = b.part(new THREE.BoxGeometry(0.02, 0.0015, 0.02), P.inkPlum, {
      at: [px, cy + 0.0005 - pz * 0.0, 0.2425 + pz],
      rotation: [slope * (180 / Math.PI), 45, 0],
    });
    outline.mesh.position.y += -pz * Math.tan(slope) * -1;
    const t = b.part(new THREE.BoxGeometry(0.016, 0.0015, 0.016), c, {
      at: [px, cy + 0.0015 + pz * Math.tan(slope) * -1, 0.2425 + pz],
      rotation: [slope * (180 / Math.PI), 45, 0],
    });
    void t;
  }
  b.part(new THREE.BoxGeometry(0.012, 0.002, 0.012), P.teal, {
    at: [0, cy + 0.003, 0.2425],
    rotation: [slope * (180 / Math.PI), 45, 0],
  });

  // front fascia
  box(-0.225, 0.225, 0.34, 0.415, 0.29, 0.302, P.walnutDark);
  const xs = [-0.17, -0.085, 0, 0.085, 0.17];
  xs.forEach((x, i) => {
    if (i === 2) return;
    box(x - 0.025, x + 0.025, 0.375, 0.405, 0.302, 0.3035, P.nacreSky);
  });
  box(-0.03, 0.03, 0.352, 0.368, 0.302, 0.3028, P.gold);
  box(-0.025, 0.025, 0.354, 0.366, 0.3028, 0.3042, P.nacreGold);
  // fascia sky tiles mid + lower
  box(-0.17, 0.17, 0.342, 0.346, 0.302, 0.3032, P.goldLight);
  // central sky tile to make 5
  box(-0.025, 0.025, 0.375, 0.405, 0.302, 0.3035, P.nacreSky);
}
```

<!-- call: bassBody -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildBassBody({ b, P }: any) {
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (r: number, h: number, c: string, x: number, y: number, z: number, axis: "x" | "y", seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, {
      at: [x, y, z],
      ...(axis === "x" ? { rotation: [0, 0, 90] } : {}),
    });
  void glow;
  const X0 = -0.24, X1 = 0.24, Y0 = 0.018, Y1 = 0.44, Z0 = -0.315, Z1 = -0.155;
  const W = X1 - X0, H = Y1 - Y0, D = Z1 - Z0;
  const cy = (Y0 + Y1) / 2, cz = (Z0 + Z1) / 2;
  // case
  box(W, H, D, P.nacre, 0, cy, cz);
  // top and side tiles
  const tc = [P.nacre, P.nacreSea];
  for (let i = 0; i < 4; i++) {
    const z = Z1 - 0.02 - i * 0.04;
    for (let j = 0; j < 4; j++) {
      const x = -0.18 + j * 0.12;
      box(0.108, 0.002, 0.036, tc[(i + j) % 2], x, Y1 + 0.001, z);
    }
  }
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 3; j++)
        box(0.002, 0.12, 0.036, tc[(i + j) % 2], s * (X1 + 0.001), 0.09 + j * 0.13, Z1 - 0.02 - i * 0.04);
  }
  // seams
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) box(0.0025, 0.004, D - 0.01, P.inkPlum, s * (X1 + 0.0015), 0.152 + k * 0.13 - 0.0, cz);
  }
  for (let k = 0; k < 3; k++) box(W - 0.01, 0.0025, 0.004, P.inkPlum, 0, Y1 + 0.0015, Z1 - 0.04 - k * 0.04);
  // gold pinstripes
  for (const y of [Y0 + 0.006, Y1 - 0.006])
    for (const s of [1, -1]) {
      box(0.003, 0.004, D, P.gold, s * (X1 + 0.002), y, cz);
      box(W, 0.004, 0.003, P.gold, 0, y, s > 0 ? Z1 + 0.001 : Z0 - 0.001);
    }
  for (const x of [-1, 1]) box(0.003, 0.003, D, P.gold, x * (X1 - 0.006), Y1 + 0.0015, cz);
  // back rosette
  const bz = Z0 - 0.001, rc = 0.2;
  cyl(0.075, 0.003, P.gold, 0, rc, bz - 0.001, "y", 24).part?.rotation;
  const ring = b.part(new THREE.TorusGeometry(0.075, 0.003, 6, 24), P.gold, { at: [0, rc, bz - 0.002] });
  void ring;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const r = 0.045;
    b.part(new THREE.BoxGeometry(0.034, 0.034, 0.003), P.inkPlum, {
      at: [Math.cos(a) * r, rc + Math.sin(a) * r, bz - 0.002],
      rotation: [0, 0, 45],
    });
    b.part(new THREE.BoxGeometry(0.028, 0.028, 0.004), i % 2 ? P.nacreSky : P.nacreBlush, {
      at: [Math.cos(a) * r, rc + Math.sin(a) * r, bz - 0.003],
      rotation: [0, 0, 45],
    });
  }
  box(0.02, 0.02, 0.004, P.gold, 0, rc, bz - 0.003);
  // frame plate (ring from 4 bars)
  const fz = -0.1475;
  box(0.49, 0.026, 0.015, P.walnut, 0, 0.029, fz);
  box(0.49, 0.026, 0.015, P.walnut, 0, 0.431, fz);
  box(0.026, 0.428, 0.015, P.walnut, -0.2325, cy, fz);
  box(0.026, 0.428, 0.015, P.walnut, 0.2325, cy, fz);
  box(0.46, 0.003, 0.003, P.goldLight, 0, 0.0165, fz + 0.0075);
  box(0.46, 0.003, 0.003, P.goldLight, 0, 0.4435, fz + 0.0075);
  box(0.003, 0.4, 0.003, P.goldLight, -0.2445, cy, fz + 0.0075);
  box(0.003, 0.4, 0.003, P.goldLight, 0.2445, cy, fz + 0.0075);
  box(0.43, 0.006, 0.006, P.walnutDark, 0, 0.044, fz + 0.01);
  box(0.43, 0.006, 0.006, P.walnutDark, 0, 0.416, fz + 0.01);
  // button board
  box(0.008, 0.225, 0.1, P.walnutDark, 0.244, 0.1875, -0.24);
  box(0.0095, 0.003, 0.104, P.goldLight, 0.244, 0.077, -0.24);
  box(0.0095, 0.003, 0.104, P.goldLight, 0.244, 0.298, -0.24);
  box(0.0095, 0.222, 0.003, P.goldLight, 0.244, 0.1875, -0.19);
  box(0.0095, 0.222, 0.003, P.goldLight, 0.244, 0.1875, -0.29);
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 16; c++)
      cyl(0.005, 0.011, r === 0 || r === 3 ? P.ebony : P.ivory, 0.2535, 0.275 - r * 0.053 + c * 0.0016, -0.202 - c * 0.0058, "x", 8);
  cyl(0.012, 0.004, P.chrome, 0.25, 0.05, -0.19, "x", 14);
  cyl(0.009, 0.012, P.ivory, 0.252, 0.05, -0.19, "x", 12);
  // strap
  const sy = 0.3275;
  box(0.006, 0.055, 0.15, P.leather, 0.2985 - 0.003, sy, -0.235);
  box(0.06, 0.055, 0.006, P.leather, 0.27, sy, -0.16);
  box(0.06, 0.055, 0.006, P.leather, 0.27, sy, -0.31);
  box(0.013, 0.04, 0.03, P.chrome, 0.3, sy, -0.235);
  box(0.015, 0.03, 0.02, P.leather, 0.3, sy, -0.235);
  for (let i = 0; i < 5; i++) cyl(0.004, 0.004, P.goldLight, 0.3, sy, -0.18 - i * 0.0 - (i < 2 ? i * 0.015 : 0.03 + i * 0.012), "x", 8);
  // feet
  for (const s of [1, -1]) cyl(0.02, 0.018, P.rubber, s * 0.19, 0.009, -0.23, "y", 12);
}
```

<!-- call: trebleBody -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTrebleBody({ b, J, P, M }: Ctx) {
  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, c: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), c, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    });
  const diamond = (cx: number, cy: number, z: number, w: number, h: number, c: string, o = true) => {
    const mk = (sw: number, sh: number, col: string, zz: number) => {
      const g = new THREE.CylinderGeometry(0.5, 0.5, 0.002, 4);
      b.part(g, col, { at: [cx, cy, zz], dir: [0, 0, 1], axis: "y", scale: [sw, 1, sh] });
    };
    if (o) mk(w * 1.12, h * 1.12, P.inkPlum, z);
    mk(w, h, c, z + 0.001);
  };

  // main box
  box(-0.26, 0.26, 0.018, 0.285, 0.115, 0.185, P.nacre);
  // side tiles, seams, pinstripes
  const cols = [P.nacre, P.nacreBlush, P.nacreSky];
  for (const s of [1, -1]) {
    const x = s * 0.2605;
    for (let i = 0; i < 3; i++) {
      const z0 = 0.115 + i * (0.07 / 3);
      box(Math.min(x, x + s * 0.002), Math.max(x, x + s * 0.002), 0.04, 0.263, z0 + 0.002, z0 + 0.07 / 3 - 0.002, cols[i]);
    }
    for (const z of [0.115 + 0.07 / 3, 0.115 + 0.14 / 3])
      box(Math.min(x, x + s * 0.003), Math.max(x, x + s * 0.003), 0.036, 0.267, z - 0.001, z + 0.001, P.inkPlum);
    for (const y of [0.032, 0.268])
      box(Math.min(x, x + s * 0.004), Math.max(x, x + s * 0.004), y, y + 0.004, 0.117, 0.183, P.gold);
  }
  // shelf
  box(-0.255, 0.255, 0.27, 0.288, 0.185, 0.302, P.nacre);
  box(-0.255, 0.255, 0.272, 0.276, 0.302, 0.304, P.goldLight);
  // grille
  box(-0.225, 0.225, 0.03, 0.26, 0.172, 0.178, P.inkPlum);
  const fr = (x0: number, x1: number, y0: number, y1: number, c: string, z1 = 0.19) => box(x0, x1, y0, y1, 0.178, z1, c);
  fr(-0.235, -0.225, 0.02, 0.265, P.gold);
  fr(0.225, 0.235, 0.02, 0.265, P.gold);
  fr(-0.235, 0.235, 0.02, 0.03, P.gold);
  fr(-0.235, 0.235, 0.255, 0.265, P.gold);
  fr(-0.225, -0.222, 0.03, 0.255, P.goldLight, 0.186);
  fr(0.222, 0.225, 0.03, 0.255, P.goldLight, 0.186);
  fr(-0.225, 0.225, 0.03, 0.033, P.goldLight, 0.186);
  fr(-0.225, 0.225, 0.252, 0.255, P.goldLight, 0.186);
  for (let i = 0; i < 6; i++) {
    const x = -0.18 + i * 0.072;
    box(x - 0.003, x + 0.003, 0.033, 0.252, 0.178, 0.184, P.gold);
  }
  // rosette: 12 lozenges in 3 rows (diamond layout 3-... )
  const rc = [P.nacreSea, P.nacreBlush, P.nacreSky];
  const rows: [number, number][] = [[-1, 3], [0, 5], [1, 4]];
  let k = 0;
  for (const [r, n] of rows) {
    for (let j = 0; j < n; j++) {
      const x = (j - (n - 1) / 2) * 0.034;
      diamond(x, 0.16 - r * 0.026, 0.1845, 0.03, 0.03, rc[k++ % 3]);
    }
  }
  diamond(0, 0.16, 0.19, 0.022, 0.022, P.teal);
  // crown
  box(-0.02, 0.02, 0.218, 0.222, 0.18, 0.186, P.gold);
  for (const x of [-0.015, 0, 0.015])
    b.part(new THREE.ConeGeometry(0.005, x === 0 ? 0.016 : 0.012, 4), P.gold, { at: [x, 0.23, 0.183] });
  b.part(new THREE.SphereGeometry(0.003, 6, 4), P.nacreGold, { at: [0, 0.241, 0.183] });

  // frame plate ring
  box(-0.245, 0.245, 0.016, 0.03, 0.1, 0.115, P.walnut);
  box(-0.245, 0.245, 0.43, 0.444, 0.1, 0.115, P.walnut);
  box(-0.245, -0.231, 0.03, 0.43, 0.1, 0.115, P.walnut);
  box(0.231, 0.245, 0.03, 0.43, 0.1, 0.115, P.walnut);
  box(-0.245, 0.245, 0.016, 0.019, 0.115, 0.117, P.goldLight);
  box(-0.245, 0.245, 0.441, 0.444, 0.115, 0.117, P.goldLight);
  box(-0.245, -0.242, 0.019, 0.441, 0.115, 0.117, P.goldLight);
  box(0.242, 0.245, 0.019, 0.441, 0.115, 0.117, P.goldLight);
  box(-0.231, 0.231, 0.03, 0.036, 0.115, 0.12, P.walnutDark);
  box(-0.231, 0.231, 0.424, 0.43, 0.115, 0.12, P.walnutDark);
  box(-0.231, -0.225, 0.036, 0.424, 0.115, 0.12, P.walnutDark);
  box(0.225, 0.231, 0.036, 0.424, 0.115, 0.12, P.walnutDark);

  // feet
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.018, 12), P.rubber, { at: [s * 0.2, 0.009, 0.145] });

  // strap on -X
  const pts = [
    [-0.2, 0.19], [-0.24, 0.19], [-0.285, 0.18], [-0.298, 0.15], [-0.285, 0.12], [-0.262, 0.116],
  ];
  const path = pts.map(([x, z]) => new THREE.Vector3(x, 0.2275, z));
  const curve = new THREE.CatmullRomCurve3(path);
  const sp = curve.getPoints(24);
  for (let i = 0; i < sp.length - 1; i++) {
    const a = sp[i], c = sp[i + 1];
    const d = c.clone().sub(a);
    const m = a.clone().add(c).multiplyScalar(0.5);
    const g = new THREE.BoxGeometry(0.006, 0.055, d.length() * 1.15);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), d.clone().normalize());
    b.part(g, P.leather, { at: [m.x, m.y, m.z], quat: q });
  }
  const bk = curve.getPoint(0.72);
  box(bk.x - 0.006, bk.x + 0.006, 0.2, 0.255, bk.z - 0.012, bk.z + 0.012, P.chrome);
  box(bk.x - 0.009, bk.x + 0.003, 0.212, 0.243, bk.z - 0.006, bk.z + 0.006, P.leather);
  for (let i = 0; i < 5; i++) {
    const p = curve.getPoint(0.12 + i * 0.1);
    b.part(new THREE.SphereGeometry(0.0055, 6, 4), P.goldLight, { at: [p.x - 0.003, 0.2275, p.z] });
  }
}
```