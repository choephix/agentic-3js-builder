<!-- call: plan -->

```json
{
  "name": "Madreperla Piano Accordion",
  "description": "A 34-key Italian piano accordion lying on its base, with a wine-red bellows and cabinets tiled in a mosaic of iridescent mother-of-pearl celluloid, gold lines and chrome corner trim.",
  "builderName": "madreperlaAccordion",
  "size": [0.64, 0.46, 0.40],
  "layout": "Scale: a real 34-key, 72-bass accordion, bellows slightly open. The bellows axis runs along x and the instrument rests on the flat bottoms of its two cabinets at y=0. Seen from the front (+Z): on the model's left (+X) is the taller TREBLE cabinet (x 0.17..0.31, y 0..0.46, z -0.14..0.14). Its +Z face carries a vertical piano keyboard. Each key is a strip lying along x with its top facing +Z, and the strips are stacked up the y axis (white keys 0.0165 m wide) from y=0.045 to y=0.40. On the right (-X) is the BASS cabinet (x -0.31..-0.17, y 0..0.44, z -0.14..0.14). Its +Z face carries a button board of round pearl buttons (6 columns x 8 rows). Between them is the BELLOWS (x -0.17..0.17, y 0.02..0.43, z -0.125..0.125), pleated like a concertina. Its folds are wine red, and each fold edge is trimmed in cream. Cream-pearl corner guards sit at all four long corners of the bellows. The back (-Z) carries the shoulder straps and the bass hand strap, which are leather. The outer end of the treble cabinet (+X face) holds a pearl-framed, perforated treble grille with a gold medallion. The outer end of the bass cabinet (-X face) holds a bass grille of vertical slots. Register switches in pearl and black sit in a row on the treble top (y=0.46) near the back edge. A chrome air-button lever sits on the bass top. STYLE: the cabinet faces are covered in mother-of-pearl mosaic. The tile is a thin square slab of about 0.024 m, with small variation, seated 2 mm proud of the cabinetBase face. Tiles cycle through pearlWhite, pearlCream, pearlPink, pearlAqua, pearlLilac and pearlGold, each with a slightly different size and a 1.5 mm gap showing the base. The tiles run in diagonal harlequin rows. Around each mosaic panel runs a 4 mm gold line, then a chrome edge. Thin nacreShadow slabs under each tile give a cool iridescent depth, and the warm tiles sit on top faces while the cool aqua and lilac tiles sit lower and on the shaded sides. Every vertical cabinet edge has a chrome angle strip. All parts share this mosaic recipe so the pattern reads as one celluloid skin. Everything is chunky, simple primitives with small details on top: tiles, buttons, screws, rivets, grille holes, gold fillets.",
  "palette": {
    "pearlWhite": "#f4efe6",
    "pearlCream": "#e9dcc3",
    "pearlPink": "#efc9d0",
    "pearlAqua": "#bfe3e1",
    "pearlLilac": "#cdbfe3",
    "pearlGold": "#e9cf9a",
    "nacreShadow": "#8d9aa6",
    "nacreDeep": "#4f5e6b",
    "cabinetBase": "#d9cfc0",
    "black": "#16141a",
    "grilleDark": "#2a2230",
    "gold": "#d9a93a",
    "goldLight": "#f5d77a",
    "chrome": "#c9ced6",
    "chromeDark": "#7d838d",
    "bellowsRed": "#8e1530",
    "bellowsDark": "#5a0c20",
    "bellowsEdge": "#f1e6d2",
    "keyIvory": "#fbf7ee",
    "keyShadow": "#d8d0bd",
    "keyBlack": "#1b1920",
    "leather": "#3a2218",
    "leatherLight": "#5e3a26",
    "stitch": "#e8d9b8"
  },
  "mounts": {
    "trebleCenter": [0.24, 0.23, 0],
    "trebleFrontFace": [0.24, 0.23, 0.14],
    "trebleEndFace": [0.31, 0.23, 0],
    "trebleTop": [0.24, 0.46, 0],
    "trebleBackFace": [0.24, 0.23, -0.14],
    "keyboardBottom": [0.24, 0.045, 0.14],
    "keyboardTop": [0.24, 0.40, 0.14],
    "bassCenter": [-0.24, 0.22, 0],
    "bassFrontFace": [-0.24, 0.22, 0.14],
    "bassEndFace": [-0.31, 0.22, 0],
    "bassTop": [-0.24, 0.44, 0],
    "bassBackFace": [-0.24, 0.22, -0.14],
    "bellowsTrebleEnd": [0.17, 0.225, 0],
    "bellowsBassEnd": [-0.17, 0.225, 0],
    "strapTrebleAnchor": [0.24, 0.42, -0.14],
    "strapBassAnchor": [-0.24, 0.40, -0.14]
  },
  "joints": [],
  "parts": [
    {
      "id": "trebleCabinet",
      "builds": "The right-hand cabinet as a cabinetBase box (x 0.17..0.31, y 0..0.46, z -0.14..0.14) with its pearl mosaic skin. The mosaic covers the top, the back, the bottom rim, the +X end panel framing and the strip of front face either side of the keyboard (the keyboard itself belongs to the 'keyboard' part). Also: gold fillet lines and chrome edge angles on all vertical edges; four small rubber feet in black at the bottom corners resting on y=0; the +X END GRILLE (a pearl-framed panel about 0.26 high and 0.20 deep, inset slightly, with a grilleDark backing and a perforated pattern of small holes or slots in nested arcs, a central gold medallion disc with a raised goldLight rim and a small star or scroll motif, and chrome screws at the corners); and the top-face REGISTER SWITCHES, a row of 7 small rocker pads (alternating pearlWhite and black, each with a thin chrome pivot pin) along the back edge of the top, with a gold nameplate strip in front of them. A bellows-clamp frame (chrome plate with four screws) on the -X face where the bellows meets.",
      "box": [[0.17, 0, -0.14], [0.315, 0.46, 0.14]],
      "attaches": "Its -X face at x=0.17 meets the bellows at mount bellowsTrebleEnd. Its front face (z=0.14) is where the keyboard part sits, at trebleFrontFace. Its back face (z=-0.14) is where the straps part attaches, at strapTrebleAnchor and trebleBackFace. Its bottom rests on y=0.",
      "joints": [],
      "floor": true,
      "budget": 230
    },
    {
      "id": "keyboard",
      "builds": "The piano keyboard on the treble front face. A fascia frame in nacreDeep with a gold inner fillet and a chrome edge surrounds the key well (x 0.185..0.295, y 0.03..0.42, z 0.14..0.152). Inside it, 21 ivory white keys in keyIvory with keyShadow undersides, each lying along x and 0.0155 m wide, stacked from y=0.045 to y=0.40 with 1 mm gaps, tops at z about 0.165. 14 black keys in keyBlack are narrower (0.009 m) and shorter in x, raised to z about 0.178, in the usual 2-3 grouping, each with a thin pearlWhite sheen sliver on its top. Two or three pearl 'key cheek' blocks sit at the ends of the key well, and a gold maker's name rail runs along the upper fascia edge. Everything is simple boxes.",
      "box": [[0.17, 0.02, 0.14], [0.31, 0.44, 0.18]],
      "attaches": "Backed flat against the treble cabinet front face (z=0.14) at mount trebleFrontFace; the key stack runs from keyboardBottom to keyboardTop.",
      "joints": [],
      "floor": false,
      "budget": 120
    },
    {
      "id": "bassCabinet",
      "builds": "The left-hand cabinet (x -0.31..-0.17, y 0..0.44, z -0.14..0.14) in cabinetBase with the same pearl mosaic recipe on the top, back and front rim. The +Z face has a BUTTON BOARD, a nacreDeep panel inset with a gold border. On it sit 6 columns x 8 rows of round pearl bass buttons (small cylinders, 0.011 m across, in pearlWhite, with two index buttons in black on the third row and a thin chrome ring under each). The rows are staggered slightly, and the buttons stand about 0.012 m proud of the board. The -X END has a BASS GRILLE, with a grilleDark backing and a pearl frame, with vertical slots carved by narrow dark slats and a gold medallion at the top. The top has a chrome AIR-BUTTON lever near the back (a base plate, a pivot and a pearl thumb pad), and four black rubber feet resting on y=0. Chrome edge angles on all vertical edges, plus the bellows-clamp plate with four screws on the +X face.",
      "box": [[-0.315, 0, -0.14], [-0.17, 0.44, 0.16]],
      "attaches": "Its +X face at x=-0.17 meets the bellows at mount bellowsBassEnd. Its back face (z=-0.14) receives the straps part at strapBassAnchor and bassBackFace. Its bottom rests on y=0.",
      "joints": [],
      "floor": true,
      "budget": 230
    },
    {
      "id": "bellows",
      "builds": "The concertina bellows between the cabinets (x -0.17..0.17, y 0.02..0.43, z -0.125..0.125), slightly open. It has about 11 pleats, each a rectangular frame of wine-red panels folding in and out (alternating bellowsRed peaks and bellowsDark valleys, tapering a little in depth at the valley). Each fold edge on the front, back, top and bottom carries a thin bellowsEdge cream paper trim line. Two end frames in nacreDeep with gold fillets close the ends flush against the cabinets. The four long edges of the bellows carry cream-pearl CORNER GUARDS, a row of small pearlWhite/pearlPink/pearlAqua tile-like plates, one per fold, over a gold or chrome folded corner strip (x from -0.17 to 0.17, at z=±0.125, y=0.02 and 0.43). On the front a leather bellows strap crosses the middle fold (leather with stitch seams, a chrome buckle and a goldLight rivet), the latch hook on the bass side. A small gold maker's badge sits centred on the front.",
      "box": [[-0.17, 0.02, -0.125], [0.17, 0.43, 0.125]],
      "attaches": "End frames are flush with the cabinets at mounts bellowsTrebleEnd (x=0.17) and bellowsBassEnd (x=-0.17). Floats above the floor (bottom at y=0.02), carried by the cabinets.",
      "joints": [],
      "floor": false,
      "budget": 200
    },
    {
      "id": "strapsBack",
      "builds": "Everything on the back (-Z side) of the instrument. Two padded leather SHOULDER STRAPS, one over each side of the treble top and bass top, with a chrome slide buckle and a leatherLight pad each. They run in simple chunky rod/slab segments looping down the back toward y=0.08 at z about -0.18 to -0.21. A hand strap for the right hand is a leatherLight band on the treble back with a pearl-studded plate, and a left bass strap with a chrome adjuster on the bass back. Stitch-colour seam lines run along every strap. Chrome strap-anchor plates with gold screws sit at strapTrebleAnchor and strapBassAnchor. A pearlWhite back plaque with a gold border on each cabinet's back face carries a small maker's inscription made of tiny gold bars. Hanging tassels optional.",
      "box": [[-0.31, 0.06, -0.225], [0.31, 0.47, -0.14]],
      "attaches": "Anchors at strapTrebleAnchor and strapBassAnchor, on the back faces of the two cabinets (z=-0.14). Nothing touches the floor.",
      "joints": [],
      "floor": false,
      "budget": 90
    }
  ]
}
```

<!-- call: keyboard -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildKeyboard({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });

  const cx = 0.24;
  const FZ = 0.14;

  // Fascia frame (nacreDeep) around key well: x 0.185..0.295, y 0.03..0.42
  const x0 = 0.185, x1 = 0.295, y0 = 0.03, y1 = 0.42;
  const wx = x1 - x0, wy = y1 - y0;
  const fw = 0.012; // frame width
  const fz = FZ + 0.006;
  // backing well plate
  box(wx, wy, 0.004, P.nacreDeep, cx, (y0 + y1) / 2, FZ + 0.002);
  // frame bars
  box(wx + 2 * fw, fw, 0.012, P.nacreDeep, cx, y0 - fw / 2, fz);
  box(wx + 2 * fw, fw + 0.008, 0.012, P.nacreDeep, cx, y1 + (fw + 0.008) / 2, fz);
  box(fw, wy, 0.012, P.nacreDeep, x0 - fw / 2, (y0 + y1) / 2, fz);
  box(fw, wy, 0.012, P.nacreDeep, x1 + fw / 2, (y0 + y1) / 2, fz);
  // chrome outer edge
  const ox0 = x0 - fw, ox1 = x1 + fw, oy0 = y0 - fw, oy1 = y1 + fw + 0.008;
  const ow = ox1 - ox0, oh = oy1 - oy0;
  const ocx = (ox0 + ox1) / 2, ocy = (oy0 + oy1) / 2;
  box(ow + 0.002, 0.0015, 0.0135, P.chrome, ocx, oy0 - 0.00075, FZ + 0.0068);
  box(ow + 0.002, 0.0015, 0.0135, P.chrome, ocx, oy1 + 0.00075, FZ + 0.0068);
  box(0.0015, oh, 0.0135, P.chrome, ox0 - 0.00075, ocy, FZ + 0.0068);
  box(0.0015, oh, 0.0135, P.chrome, ox1 + 0.00075, ocy, FZ + 0.0068);
  // gold inner fillet
  const gz = FZ + 0.0125;
  box(wx + 0.002, 0.0012, 0.001, P.gold, cx, y0 - 0.0006, gz);
  box(wx + 0.002, 0.0012, 0.001, P.gold, cx, y1 + 0.0006, gz);
  box(0.0012, wy, 0.001, P.gold, x0 - 0.0006, (y0 + y1) / 2, gz);
  box(0.0012, wy, 0.001, P.gold, x1 + 0.0006, (y0 + y1) / 2, gz);

  // Gold maker's name rail on upper fascia
  const railY = y1 + 0.0105;
  box(0.07, 0.0075, 0.0015, P.gold, cx, railY, FZ + 0.0128);
  box(0.064, 0.0045, 0.0012, P.goldLight, cx, railY, FZ + 0.0138);
  // tiny letter bars
  for (let i = 0; i < 9; i++) {
    const h = 0.0025 + R() * 0.0012;
    box(0.0022, h, 0.0008, P.black, cx - 0.026 + i * 0.0065, railY, FZ + 0.0146);
  }
  // screws on fascia corners
  for (const sx of [ox0 + 0.006, ox1 - 0.006])
    for (const sy of [oy0 + 0.006, oy1 - 0.008]) {
      b.part(new THREE.CylinderGeometry(0.0022, 0.0022, 0.0015, 8), P.chrome, {
        at: [sx, sy, FZ + 0.0132], dir: [0, 0, 1],
      });
    }

  // White keys: 21, pitch 0.0155+0.001 from y=0.045
  const kw = 0.0155, gap = 0.001;
  const wlen = 0.108;
  const whiteY: number[] = [];
  for (let i = 0; i < 21; i++) {
    const y = 0.045 + kw / 2 + i * (kw + gap);
    whiteY.push(y);
    box(wlen, kw, 0.012, P.keyIvory, cx, y, 0.159);
    // front lip shadow underside (bottom edge of strip)
    box(wlen, 0.0016, 0.0125, P.keyShadow, cx, y - kw / 2 + 0.0008, 0.159);
    // key front end line
    box(0.0012, kw - 0.002, 0.0005, P.keyShadow, cx + wlen / 2 - 0.004, y, 0.1655);
  }

  // Black keys: between white pairs, pattern 2-3 grouping (E-F and B-C gaps omitted)
  // gaps between white i and i+1, skip when i%7 is 2 or 6 (E, B)
  const bw = 0.009, blen = 0.068;
  const bx = cx - (wlen - blen) / 2 + 0.0; // aligned toward the inner (-x) side
  let count = 0;
  for (let i = 0; i < 20 && count < 14; i++) {
    const m = i % 7;
    if (m === 2 || m === 6) continue;
    const y = (whiteY[i] + whiteY[i + 1]) / 2;
    box(blen, bw, 0.012, P.keyBlack, bx, y, 0.172);
    box(blen - 0.006, 0.0016, 0.0008, P.pearlWhite, bx - 0.001, y + 0.0015, 0.1786);
    count++;
  }

  // Key cheek pearl blocks at ends of the key well
  const cheekC = [P.pearlWhite, P.pearlPink, P.pearlAqua];
  box(wx, 0.006, 0.02, P.pearlWhite, cx, y0 + 0.0065, 0.15);
  box(wx, 0.006, 0.02, P.pearlCream, cx, y1 - 0.0065, 0.15);
  box(0.006, 0.014, 0.014, cheekC[1], cx + 0.0515, y0 + 0.012, 0.156);
  box(0.006, 0.014, 0.014, cheekC[2], cx - 0.0515, y1 - 0.012, 0.156);

  // Back felt strip behind keys (dark) at the far inner edge
  box(0.003, 0.35, 0.01, P.grilleDark, cx - 0.056, 0.2225, 0.156);
}
```

<!-- call: bellows -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildBellows({ b, J, P, M }: Ctx) {
  const X0 = -0.17, X1 = 0.17, Y0 = 0.02, Y1 = 0.43, HZ = 0.125;
  const cy = (Y0 + Y1) / 2, hy = (Y1 - Y0) / 2;
  const box = (w: number, h: number, d: number, col: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { at: [x, y, z] });

  // end frames
  const EF = 0.012;
  for (const s of [1, -1]) {
    const x = s > 0 ? X1 - EF / 2 : X0 + EF / 2;
    box(EF, Y1 - Y0, HZ * 2, P.nacreDeep, x, cy, 0);
    // gold fillet rim on the inner side
    const xi = x - s * (EF / 2 + 0.0015);
    box(0.003, 0.004, HZ * 2, P.gold, xi, Y1 - 0.002, 0);
    box(0.003, 0.004, HZ * 2, P.gold, xi, Y0 + 0.002, 0);
    box(0.003, Y1 - Y0, 0.004, P.gold, xi, cy, HZ - 0.002);
    box(0.003, Y1 - Y0, 0.004, P.gold, xi, cy, -HZ + 0.002);
  }

  // pleats
  const N = 11;
  const x0 = X0 + EF, x1 = X1 - EF;
  const span = x1 - x0;
  const pitch = span / N;
  const thick = 0.0025;
  // inner core so valleys are filled
  box(span, (Y1 - Y0) - 0.03, HZ * 2 - 0.03, P.bellowsDark, 0, cy, 0);

  const faceDefs = [
    { nz: 1 }, { nz: -1 }, { ny: 1 }, { ny: -1 },
  ] as any[];
  for (let i = 0; i < N; i++) {
    const xc = x0 + pitch * (i + 0.5);
    // each pleat: two slanted ring halves, peak at centre, valley at edges
    for (const half of [-1, 1]) {
      const xm = xc + half * pitch * 0.25;
      const ang = Math.atan2(0.016, pitch * 0.5);
      const len = Math.hypot(pitch * 0.5, 0.016);
      const col = i % 2 === 0 ? P.bellowsRed : P.bellowsDark;
      const col2 = i % 2 === 0 ? P.bellowsDark : P.bellowsRed;
      const useCol = half < 0 ? col : col2;
      // front / back panels (tilt about y)
      for (const sz of [1, -1]) {
        const depth = HZ - 0.008 + (half * sz > 0 ? 0 : 0.0); // peak outward at centre
        const zz = sz * (depth - 0.004 * -half * 0 );
        const p = b.part(new THREE.BoxGeometry(len, hy * 2 - 0.004, thick), useCol, {
          at: [xm, cy, zz], rotation: [0, -half * sz * ang * 57.3 * -1, 0],
        });
      }
      // top / bottom panels
      for (const sy of [1, -1]) {
        const yy = cy + sy * (hy - 0.004);
        b.part(new THREE.BoxGeometry(len, thick, HZ * 2 - 0.004), useCol, {
          at: [xm, yy, 0], rotation: [0, 0, half * sy * ang * 57.3],
        });
      }
    }
    // cream trim lines on peak edges
    box(0.0035, 0.0035 + hy * 2 - 0.004, 0.0035, P.bellowsEdge, xc, cy, HZ - 0.001);
    box(0.0035, hy * 2 - 0.004, 0.0035, P.bellowsEdge, xc, cy, -HZ + 0.001);
    box(0.0035, 0.0035, HZ * 2 - 0.004, P.bellowsEdge, xc, Y1 - 0.004, 0);
    box(0.0035, 0.0035, HZ * 2 - 0.004, P.bellowsEdge, xc, Y0 + 0.004, 0);
  }

  // corner strips and guards
  const r = rng(11);
  const tile = [P.pearlWhite, P.pearlPink, P.pearlAqua];
  for (const sz of [1, -1])
    for (const sy of [-1, 1]) {
      const y = sy > 0 ? Y1 - 0.003 : Y0 + 0.003;
      const z = sz * (HZ - 0.001);
      box(span, 0.008, 0.008, P.gold, 0, y, z);
      box(span, 0.002, 0.002, P.chrome, 0, y + sy * 0.0035, z + sz * 0.0035);
      for (let i = 0; i < N; i++) {
        const w = pitch * (0.7 + r() * 0.1);
        b.part(new THREE.BoxGeometry(w, 0.011, 0.011), tile[(i + (sz > 0 ? 0 : 1) + (sy > 0 ? 1 : 0)) % 3], {
          at: [x0 + pitch * (i + 0.5), y - sy * 0.001, z + sz * 0.002],
          rotation: [sy * sz * 45, 0, 0],
        });
      }
    }

  // leather strap across middle fold on front
  const xm = x0 + pitch * 5.5;
  const zf = HZ + 0.004;
  box(0.03, hy * 2 - 0.02, 0.003, P.leather, xm, cy, zf);
  box(0.003, hy * 2 - 0.022, 0.0015, P.stitch, xm - 0.011, cy, zf + 0.002);
  box(0.003, hy * 2 - 0.022, 0.0015, P.stitch, xm + 0.011, cy, zf + 0.002);
  for (let k = 0; k < 12; k++) {
    const y = Y0 + 0.02 + k * ((Y1 - Y0 - 0.04) / 11);
    box(0.0025, 0.004, 0.0012, P.stitch, xm - 0.011, y, zf + 0.0028);
  }
  // buckle
  box(0.026, 0.02, 0.003, P.chrome, xm, cy + 0.03, zf + 0.003);
  box(0.018, 0.012, 0.004, P.leatherLight, xm, cy + 0.03, zf + 0.004);
  b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.004, 10), P.goldLight, {
    at: [xm, cy + 0.03, zf + 0.007], rotation: [90, 0, 0],
  });
  // latch hook on bass side
  box(0.012, 0.016, 0.004, P.chrome, xm - 0.03, cy - 0.04, zf + 0.002);
  b.part(new THREE.TorusGeometry(0.007, 0.0018, 6, 10, Math.PI * 1.5), P.chromeDark, {
    at: [xm - 0.03, cy - 0.04, zf + 0.006],
  });

  // maker's badge
  const bx = xm + 0.06;
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.003, 14), P.gold, {
    at: [bx, cy, HZ + 0.004], rotation: [90, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.0015, 14), P.goldLight, {
    at: [bx, cy, HZ + 0.0058], rotation: [90, 0, 0],
  });
  box(0.012, 0.0025, 0.001, P.bellowsDark, bx, cy, HZ + 0.0068);
  box(0.0025, 0.012, 0.001, P.bellowsDark, bx, cy, HZ + 0.0068);
}
```

<!-- call: strapsBack -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildStrapsBack({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, rotation: rot });
  const cyl = (r: number, h: number, c: string, at: number[], dir: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at, dir });

  // Strap segment between two points: padded leather slab with stitch lines
  const seg = (a: number[], c: number[], w: number, t: number, col: string, stitch = true) => {
    const mid = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
    const dx = c[0] - a[0], dy = c[1] - a[1], dz = c[2] - a[2];
    const len = Math.hypot(dx, dy, dz);
    const dir = [dx / len, dy / len, dz / len];
    b.part(new THREE.BoxGeometry(w, len, t), col, { at: mid, dir, up: [1, 0, 0] });
    if (stitch) {
      for (const s of [-1, 1]) {
        b.part(new THREE.BoxGeometry(0.0015, len * 0.96, 0.0015), P.stitch, {
          at: [mid[0] + s * (w / 2 - 0.004) * 1, mid[1], mid[2] - t / 2 - 0.0008],
          dir,
          up: [1, 0, 0],
        });
      }
    }
  };

  const anchorPlate = (x: number, y: number, z: number) => {
    box(0.05, 0.03, 0.004, P.chrome, [x, y, z - 0.002]);
    for (const sx of [-1, 1])
      for (const sy of [-1, 1]) {
        cyl(0.0034, 0.003, P.gold, [x + sx * 0.019, y + sy * 0.01, z - 0.0055], [0, 0, -1], 6);
      }
  };

  // Shoulder straps: one per cabinet. Run from top anchor, over back, down to y=0.08
  const shoulder = (x: number, topY: number, sgn: number) => {
    const pts = [
      [x, topY + 0.01, -0.13],
      [x, topY + 0.012, -0.152],
      [x, topY - 0.05, -0.185],
      [x, 0.2, -0.205],
      [x, 0.09, -0.2],
    ];
    for (let i = 0; i < pts.length - 1; i++) seg(pts[i], pts[i + 1], 0.034, 0.012, P.leather);
    // pad on upper run
    box(0.04, 0.09, 0.018, P.leatherLight, [x, topY - 0.07, -0.19]);
    for (const s of [-1, 1]) box(0.0015, 0.08, 0.0015, P.stitch, [x + s * 0.016, topY - 0.07, -0.2]);
    // chrome slide buckle
    box(0.044, 0.006, 0.01, P.chrome, [x, 0.17, -0.211]);
    box(0.044, 0.006, 0.01, P.chrome, [x, 0.145, -0.211]);
    for (const s of [-1, 1]) box(0.005, 0.03, 0.01, P.chrome, [x + s * 0.02, 0.1575, -0.211]);
    box(0.03, 0.004, 0.012, P.chromeDark, [x, 0.1575, -0.212]);
    // bottom tab
    box(0.036, 0.02, 0.012, P.leatherLight, [x, 0.085, -0.2]);
    cyl(0.005, 0.004, P.goldLight, [x, 0.085, -0.207], [0, 0, -1], 8);
    // top loop where it wraps top
    box(0.036, 0.004, 0.04, P.leather, [x, topY + 0.012, -0.13]);
    void sgn;
  };
  shoulder(0.2, 0.46, 1);
  shoulder(0.28, 0.46, 1);
  shoulder(-0.2, 0.44, -1);
  shoulder(-0.28, 0.44, -1);

  // Anchor plates
  anchorPlate(M.strapTrebleAnchor[0], M.strapTrebleAnchor[1], -0.14);
  anchorPlate(M.strapBassAnchor[0], M.strapBassAnchor[1], -0.14);
  anchorPlate(0.24, 0.1, -0.14);
  anchorPlate(-0.24, 0.1, -0.14);

  // Plaques with gold border and inscription bars
  const plaque = (cx: number, cy: number) => {
    box(0.1, 0.07, 0.003, P.gold, [cx, cy, -0.1415]);
    box(0.092, 0.062, 0.0035, P.pearlWhite, [cx, cy, -0.1425]);
    for (let i = 0; i < 7; i++) {
      const w = 0.012 + R() * 0.02;
      box(w, 0.0025, 0.002, P.gold, [cx - 0.04 + w / 2 + (i % 2) * 0.01, cy + 0.02 - i * 0.0065, -0.1448]);
    }
    for (const sx of [-1, 1])
      for (const sy of [-1, 1]) cyl(0.0025, 0.002, P.chromeDark, [cx + sx * 0.044, cy + sy * 0.029, -0.1448], [0, 0, -1], 6);
  };
  plaque(0.24, 0.3);
  plaque(-0.24, 0.3);

  // Right hand strap on treble back: band with pearl-studded plate
  box(0.1, 0.045, 0.012, P.leatherLight, [0.24, 0.2, -0.146]);
  for (const s of [-1, 1]) box(0.09, 0.0015, 0.0015, P.stitch, [0.24, 0.2 + s * 0.017, -0.1525]);
  box(0.05, 0.034, 0.004, P.chrome, [0.24, 0.2, -0.154]);
  const cols = [P.pearlWhite, P.pearlPink, P.pearlAqua, P.pearlLilac];
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 2; j++)
      b.part(new THREE.SphereGeometry(0.0055, 8, 6), cols[(i + j) % 4], {
        at: [0.24 - 0.018 + i * 0.012, 0.2 - 0.008 + j * 0.016, -0.157],
      });
  for (const s of [-1, 1]) cyl(0.004, 0.004, P.gold, [0.24 + s * 0.043, 0.2, -0.1535], [0, 0, -1], 6);

  // Left bass strap with chrome adjuster
  box(0.1, 0.05, 0.012, P.leather, [-0.24, 0.17, -0.146]);
  for (const s of [-1, 1]) box(0.09, 0.0015, 0.0015, P.stitch, [-0.24, 0.17 + s * 0.019, -0.1525]);
  box(0.03, 0.058, 0.006, P.chrome, [-0.24 + 0.02, 0.17, -0.153]);
  box(0.018, 0.04, 0.007, P.cabinetBase, [-0.24 + 0.02, 0.17, -0.1535]);
  box(0.006, 0.062, 0.004, P.chromeDark, [-0.24 + 0.02, 0.17, -0.157]);
  for (let i = 0; i < 4; i++) cyl(0.0025, 0.003, P.gold, [-0.24 - 0.03 + i * 0.012, 0.17, -0.1525], [0, 0, -1], 6);

  // Tassels
  for (const x of [0.2, -0.2]) {
    cyl(0.003, 0.03, P.leatherLight, [x, 0.065, -0.2], [0, 1, 0], 6);
    b.part(new THREE.ConeGeometry(0.008, 0.02, 6), P.gold, { at: [x, 0.048, -0.2], dir: [0, -1, 0] });
  }
}
```

<!-- call: bassCabinet -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildBassCabinet({ b, J, P, M }: any) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
  const cyl = (rt: number, h: number, color: string, x: number, y: number, z: number, axis: "x" | "y" | "z", seg = 10) => {
    const g = new THREE.CylinderGeometry(rt, rt, h, seg);
    if (axis === "z") g.rotateX(Math.PI / 2);
    if (axis === "x") g.rotateZ(Math.PI / 2);
    return b.part(g, color, { at: [x, y, z] });
  };
  const X0 = -0.31, X1 = -0.17, Z0 = -0.14, Z1 = 0.14, H = 0.44;
  const cx = (X0 + X1) / 2;

  // main body
  box(0.14, 0.43, 0.28, P.cabinetBase, cx, 0.225, 0);
  // base rim
  box(0.146, 0.012, 0.286, P.nacreDeep, cx, 0.02, 0);
  // rubber feet
  for (const sx of [-0.295, -0.185]) for (const sz of [-0.12, 0.12])
    cyl(0.013, 0.014, P.black, sx, 0.007, sz, "y", 8);

  // top mosaic
  const tiles = [P.pearlWhite, P.pearlCream, P.pearlPink, P.pearlAqua, P.pearlLilac, P.pearlGold];
  const mosaic = (u0: number, u1: number, v0: number, v1: number, place: (u: number, v: number, s: number, c: string, i: number) => void, cool: boolean) => {
    const step = 0.0255;
    let i = 0;
    for (let v = v0; v < v1 - 0.01; v += step) {
      const row = Math.round((v - v0) / step);
      for (let u = u0 + (row % 2) * step * 0.5 + 0.012; u < u1 - 0.008; u += step) {
        const k = (i + row * 2) % 6;
        const c = cool ? tiles[[3, 4, 0, 3, 4, 1][k]] : tiles[[5, 1, 2, 0, 5, 2][k]];
        place(u, v + 0.012, 0.022 + R() * 0.002, c, i);
        i++;
      }
    }
  };
  // top
  const topPlace = (u: number, v: number, s: number, c: string) => {
    box(s, 0.0015, s, P.nacreShadow, u, H - 0.001, v);
    box(s, 0.004, s, c, u, H + 0.001, v);
  };
  box(0.13, 0.004, 0.268, P.cabinetBase, cx, H, 0);
  const inner = (u: number, lo: number, hi: number) => u > lo && u < hi;
  mosaic(X0 + 0.01, X1 - 0.01, Z0 + 0.01, Z1 - 0.01, (u, v, s, c) => {
    if (inner(u, X0 + 0.012, X1 - 0.012) && inner(v, Z0 + 0.012, Z1 - 0.012) && !(v > -0.06 && v < -0.01 && u > -0.28 && u < -0.2)) topPlace(u, v, s, c);
  }, false);
  // gold line + chrome edge around top
  box(0.138, 0.003, 0.003, P.gold, cx, H + 0.001, Z1 - 0.004);
  box(0.138, 0.003, 0.003, P.gold, cx, H + 0.001, Z0 + 0.004);
  box(0.003, 0.003, 0.28, P.gold, X0 + 0.004, H + 0.001, 0);
  box(0.003, 0.003, 0.28, P.gold, X1 - 0.004, H + 0.001, 0);
  box(0.146, 0.004, 0.003, P.chrome, cx, H + 0.001, Z1);
  box(0.146, 0.004, 0.003, P.chrome, cx, H + 0.001, Z0);

  // air-button lever
  box(0.05, 0.003, 0.03, P.chrome, cx, H + 0.003, -0.045);
  cyl(0.004, 0.034, P.chromeDark, cx - 0.018, H + 0.009, -0.045, "z", 8);
  box(0.045, 0.004, 0.012, P.chrome, cx + 0.004, H + 0.012, -0.045);
  box(0.016, 0.006, 0.016, P.pearlWhite, cx + 0.024, H + 0.014, -0.045);
  for (const sx of [-0.02, 0.02]) for (const sz of [-0.057, -0.033]) cyl(0.0022, 0.003, P.chromeDark, cx + sx, H + 0.006, sz, "y", 6);

  // back mosaic (z=-0.14), tiles cool
  for (let y = 0.03; y < H - 0.02; y += 0.0255) {
    const row = Math.round((y - 0.03) / 0.0255);
    for (let x = X0 + 0.02 + (row % 2) * 0.012; x < X1 - 0.012; x += 0.0255) {
      const k = (row * 2 + Math.round((x - X0) / 0.0255)) % 6;
      const s = 0.022 + R() * 0.002;
      box(s, s, 0.0015, P.nacreShadow, x, y + 0.012, Z0 - 0.0005);
      box(s, s, 0.004, tiles[[3, 4, 0, 3, 4, 1][k]], x, y + 0.012, Z0 - 0.002);
    }
  }
  // back gold line frame
  box(0.134, 0.003, 0.003, P.gold, cx, 0.024, Z0 - 0.004);
  box(0.134, 0.003, 0.003, P.gold, cx, H - 0.014, Z0 - 0.004);

  // front: button board
  const fz = Z1;
  box(0.126, 0.38, 0.004, P.nacreDeep, cx, 0.22, fz + 0.002);
  // gold border
  box(0.13, 0.004, 0.005, P.gold, cx, 0.414, fz + 0.003);
  box(0.13, 0.004, 0.005, P.gold, cx, 0.026, fz + 0.003);
  box(0.004, 0.392, 0.005, P.gold, cx - 0.064, 0.22, fz + 0.003);
  box(0.004, 0.392, 0.005, P.gold, cx + 0.064, 0.22, fz + 0.003);
  // front rim mosaic top strip
  for (let x = X0 + 0.02; x < X1 - 0.01; x += 0.0255) {
    const k = Math.round((x - X0) / 0.0255) % 6;
    box(0.02, 0.014, 0.004, tiles[k], x, 0.432, fz + 0.002);
  }
  // buttons
  for (let r = 0; r < 8; r++) for (let c = 0; c < 6; c++) {
    const x = cx - 0.045 + c * 0.018 + (r % 2) * 0.004;
    const y = 0.07 + r * 0.043;
    const idx = r === 5 && (c === 2 || c === 3);
    cyl(0.0085, 0.002, P.chrome, x, y, fz + 0.005, "z", 12);
    cyl(0.0055, 0.012, idx ? P.black : P.pearlWhite, x, y, fz + 0.01, "z", 10);
    cyl(0.0035, 0.002, idx ? P.keyBlack : P.pearlCream, x, y, fz + 0.017, "z", 8);
  }

  // end grille (-X)
  const ex = X0;
  box(0.004, 0.3, 0.22, P.pearlWhite, ex - 0.002, 0.2, 0);
  box(0.004, 0.28, 0.2, P.grilleDark, ex - 0.005, 0.2, 0);
  for (let i = 0; i < 12; i++) {
    const z = -0.088 + i * 0.016;
    box(0.003, 0.2, 0.006, P.chromeDark, ex - 0.0075, 0.17, z);
  }
  box(0.004, 0.004, 0.2, P.gold, ex - 0.005, 0.345, 0);
  box(0.004, 0.004, 0.2, P.gold, ex - 0.005, 0.055, 0);
  for (const y of [0.06, 0.34]) for (const z of [-0.1, 0.1]) cyl(0.004, 0.004, P.chrome, ex - 0.006, y, z, "x", 6);
  cyl(0.026, 0.005, P.goldLight, ex - 0.009, 0.375, 0, "x", 16);
  cyl(0.02, 0.006, P.gold, ex - 0.011, 0.375, 0, "x", 16);
  cyl(0.008, 0.007, P.goldLight, ex - 0.014, 0.375, 0, "x", 6);
  box(0.004, 0.04, 0.05, P.pearlWhite, ex - 0.004, 0.41, 0).visible = true;

  // end mosaic around grille
  for (let y = 0.04; y < 0.42; y += 0.0255) for (const z of [-0.125, 0.125]) {
    const k = Math.round(y / 0.0255) % 6;
    box(0.004, 0.02, 0.02, tiles[[3, 4, 0, 3, 4, 1][k]], ex - 0.002, y + 0.01, z);
  }

  // chrome vertical edge angles
  for (const sx of [X0, X1]) for (const sz of [Z0, Z1]) {
    box(0.006, 0.43, 0.012, P.chrome, sx + (sx < cx ? 0.001 : -0.001), 0.225, sz + (sz > 0 ? -0.003 : 0.003));
    box(0.012, 0.43, 0.006, P.chrome, sx + (sx < cx ? 0.003 : -0.003), 0.225, sz + (sz > 0 ? -0.001 : 0.001));
  }

  // bellows clamp plate on +X
  box(0.004, 0.2, 0.18, P.chrome, X1 + 0.002, 0.22, 0);
  box(0.003, 0.186, 0.166, P.chromeDark, X1 + 0.004, 0.22, 0);
  for (const y of [0.14, 0.3]) for (const z of [-0.07, 0.07]) {
    cyl(0.005, 0.004, P.chrome, X1 + 0.007, y, z, "x", 8);
    box(0.002, 0.0015, 0.008, P.chromeDark, X1 + 0.0095, y, z);
  }
}
```

<!-- call: trebleCabinet -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTrebleCabinet({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, color: string, at: number[], dir: number[], seg = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, dir });

  const X0 = 0.17, X1 = 0.31, Y1 = 0.46, Z0 = -0.14, Z1 = 0.14;
  const CX = (X0 + X1) / 2, CY = Y1 / 2;
  const tiles = [P.pearlWhite, P.pearlCream, P.pearlPink, P.pearlAqua, P.pearlLilac, P.pearlGold];
  const warm = [P.pearlWhite, P.pearlCream, P.pearlPink, P.pearlGold];
  const cool = [P.pearlAqua, P.pearlLilac, P.pearlWhite, P.pearlCream];

  // main body
  box(X1 - X0, Y1 - 0.01, Z1 - Z0, P.cabinetBase, CX, 0.01 + (Y1 - 0.01) / 2, 0);

  // mosaic helper: panel on a face. face: 'top','back','front','end'
  function mosaic(face: string, u0: number, u1: number, v0: number, v1: number, fixed: number, palette: string[], seed: number) {
    const step = 0.0255, t = 0.024;
    let i = 0;
    for (let v = v0 + t / 2; v < v1 - t / 2 + 1e-6; v += step) {
      for (let u = u0 + t / 2 + ((i % 2) * step) / 2; u < u1 - t / 2 + 1e-6; u += step) {
        const k = Math.floor(R() * 1000 + seed + i + Math.round(u * 40)) % palette.length;
        const s = t * (0.88 + R() * 0.1);
        const c = palette[k];
        const th = 0.002;
        if (face === "top") {
          box(s + 0.002, 0.001, s + 0.002, P.nacreShadow, u, fixed + 0.0005, v);
          box(s, th, s, c, u, fixed + 0.001 + th / 2, v);
        } else if (face === "back") {
          box(s + 0.002, s + 0.002, 0.001, P.nacreShadow, u, v, fixed - 0.0005);
          box(s, s, th, c, u, v, fixed - 0.001 - th / 2);
        } else if (face === "front") {
          box(s + 0.002, s + 0.002, 0.001, P.nacreShadow, u, v, fixed + 0.0005);
          box(s, s, th, c, u, v, fixed + 0.001 + th / 2);
        } else {
          box(0.001, s + 0.002, s + 0.002, P.nacreShadow, fixed + 0.0005, u, v);
          box(th, s, s, c, fixed + 0.001 + th / 2, u, v);
        }
      }
      i++;
    }
  }
  // top: warm, x 0.18..0.30, z -0.13..0.13 (switches area left plain-ish)
  mosaic("top", 0.18, 0.30, -0.02, 0.13, Y1 - 0.01 + 0.0, warm, 1);
  // back: cooler lower
  mosaic("back", 0.18, 0.30, 0.04, 0.44, Z0, tiles, 3);
  // front strips: low rim and top strip, plus side strips
  mosaic("front", 0.18, 0.30, 0.01, 0.028, Z1, cool, 5);
  mosaic("front", 0.18, 0.30, 0.425, 0.455, Z1, warm, 7);

  // gold lines around back panel and top panel
  const goldFrame = (cx: number, cy: number, w: number, h: number, z: number, dz: number) => {
    box(w, 0.004, 0.003, P.gold, cx, cy + h / 2, z + dz);
    box(w, 0.004, 0.003, P.gold, cx, cy - h / 2, z + dz);
    box(0.004, h, 0.003, P.gold, cx - w / 2, cy, z + dz);
    box(0.004, h, 0.003, P.gold, cx + w / 2, cy, z + dz);
  };
  goldFrame(CX, 0.24, 0.128, 0.41, Z0, -0.001);
  box(0.004, 0.003, 0.26, P.gold, 0.176, Y1 - 0.005, 0);
  box(0.004, 0.003, 0.26, P.gold, 0.304, Y1 - 0.005, 0);

  // chrome vertical edge angles
  for (const sx of [X0 + 0.002, X1 - 0.002])
    for (const sz of [Z0 + 0.002, Z1 - 0.002]) {
      box(0.006, Y1, 0.006, P.chrome, sx, CY, sz);
      const ix = sx > CX ? sx - 0.005 : sx + 0.005;
      const iz = sz > 0 ? sz - 0.005 : sz + 0.005;
      box(0.003, Y1 - 0.01, 0.003, P.gold, ix, CY, sz);
      box(0.003, Y1 - 0.01, 0.003, P.gold, sx, CY, iz);
    }
  // top and bottom chrome rims
  box(0.14, 0.004, 0.004, P.chrome, CX, Y1, Z0 + 0.002);
  box(0.14, 0.004, 0.004, P.chrome, CX, Y1, Z1 - 0.002);
  box(0.004, 0.004, 0.28, P.chrome, X1 - 0.002, Y1, 0);
  box(0.004, 0.004, 0.28, P.chrome, X0 + 0.002, Y1, 0);

  // feet
  for (const sx of [0.185, 0.295])
    for (const sz of [-0.12, 0.12]) cyl(0.012, 0.014, 0.012, P.black, [sx, 0.004, sz], [0, 1, 0], 8);
  box(0.14, 0.01, 0.28, P.nacreDeep, CX, 0.012, 0);

  // END GRILLE on +X
  const gx = X1;
  box(0.003, 0.27, 0.21, P.pearlWhite, gx + 0.0015, 0.23, 0);
  box(0.003, 0.26, 0.002, P.gold, gx + 0.003, 0.23, 0.1);
  box(0.003, 0.26, 0.002, P.gold, gx + 0.003, 0.23, -0.1);
  box(0.003, 0.002, 0.2, P.gold, gx + 0.003, 0.36, 0);
  box(0.003, 0.002, 0.2, P.gold, gx + 0.003, 0.1, 0);
  box(0.004, 0.24, 0.18, P.grilleDark, gx + 0.004, 0.23, 0);
  // nested arc holes
  for (const rad of [0.045, 0.065, 0.085, 0.105]) {
    const n = Math.round(rad * 220);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      const y = 0.23 + Math.sin(a) * rad * 1.05, z = Math.cos(a) * rad * 0.82;
      if (Math.abs(y - 0.23) > 0.115 || Math.abs(z) > 0.088) continue;
      cyl(0.0035, 0.0035, 0.002, P.nacreShadow, [gx + 0.0065, y, z], [1, 0, 0], 6);
    }
  }
  // medallion
  cyl(0.034, 0.034, 0.004, P.goldLight, [gx + 0.007, 0.23, 0], [1, 0, 0], 20);
  cyl(0.029, 0.029, 0.005, P.gold, [gx + 0.0085, 0.23, 0], [1, 0, 0], 20);
  // star motif
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 4;
    b.part(new THREE.BoxGeometry(0.002, 0.04, 0.005), P.goldLight, {
      at: [gx + 0.0105, 0.23, 0],
      rotation: [k * 45, 0, 0],
    });
  }
  cyl(0.005, 0.005, 0.003, P.chrome, [gx + 0.012, 0.23, 0], [1, 0, 0], 8);
  // screws at grille corners
  for (const sy of [0.1, 0.36])
    for (const sz of [-0.098, 0.098]) cyl(0.004, 0.004, 0.003, P.chrome, [gx + 0.0035, sy - Math.sign(sy - 0.23) * 0.004, sz], [1, 0, 0], 8);
  // end panel mosaic framing: lower strip and upper strip
  mosaic("end", 0.01, 0.092, -0.125, 0.125, gx, cool, 9);
  mosaic("end", 0.372, 0.452, -0.125, 0.125, gx, warm, 13);

  // register switches on top near back edge
  for (let k = 0; k < 7; k++) {
    const z = -0.115 + 0.0 ;
    const x = 0.185 + k * 0.0175;
    const c = k % 2 ? P.black : P.pearlWhite;
    b.part(new THREE.BoxGeometry(0.013, 0.006, 0.02), c, { at: [x, Y1 + 0.003, z], rotation: [0, 0, 0] });
    b.part(new THREE.BoxGeometry(0.013, 0.003, 0.008), c === P.black ? P.pearlWhite : P.black, {
      at: [x, Y1 + 0.0075, z + 0.004],
    });
    cyl(0.0012, 0.0012, 0.015, P.chrome, [x, Y1 + 0.004, z], [1, 0, 0], 6);
  }
  box(0.12, 0.003, 0.014, P.gold, CX, Y1 + 0.0015, -0.085);
  box(0.1, 0.0015, 0.004, P.goldLight, CX, Y1 + 0.0035, -0.085);

  // bellows clamp plate on -X face
  box(0.003, 0.3, 0.2, P.chromeDark, X0 - 0.0015, 0.23, 0);
  box(0.003, 0.28, 0.18, P.chrome, X0 - 0.003, 0.23, 0);
  for (const sy of [0.1, 0.36])
    for (const sz of [-0.08, 0.08]) cyl(0.005, 0.005, 0.003, P.gold, [X0 - 0.0055, sy, sz], [1, 0, 0], 8);
}
```