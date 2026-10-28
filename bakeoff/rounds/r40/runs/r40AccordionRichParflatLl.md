<!-- call: plan -->

```json
{
  "name": "Piano Accordion (Italian Mother-of-Pearl)",
  "description": "A full-size 41-key piano accordion standing upright on its bass end, in a pearly celluloid finish with gold trim, a red bellows and a chrome grille.",
  "builderName": "pearlAccordion",
  "size": [0.5, 0.42, 0.24],
  "layout": "The accordion stands upright on the floor, resting on its bass-end foot pads (the tabs of the left-hand end), in its rest pose with the bellows half-open. Y is the long axis of the instrument. From the bottom (y=0) up: the bass (left-hand) box on the floor, with the grille and bass buttons facing +Z; the bellows in the middle, whose pleats run along y and are red with white pearl-edged gold-trimmed corners; the treble (right-hand) box on top, whose front face (+Z) carries the piano keyboard (white keys with black sharps, a fine gold keyboard rail), with the treble grille on the +X side and the register switches on the top. The piano keyboard is in the front face, the player's side. Straps (red leather with gold buckles) run on the back (-Z). Mother-of-pearl style: the box bodies are a creamy iridescent pearl in flat colours, using a pale cream, a pink-lilac and an aqua-blue as inlaid swirl or diamond bands, chased with gold filigree and rhinestone-like small studs. Every part wears the pearl with gold edging and a crimson bellows, to read as Italian.",
  "palette": {
    "pearl": "#f4efe6",
    "pearlPink": "#ecd3dc",
    "pearlAqua": "#bfe3e6",
    "pearlShadow": "#cfc6b8",
    "gold": "#d9a93a",
    "goldDark": "#8f6a1c",
    "bellowsRed": "#a3121f",
    "bellowsDark": "#5e0a12",
    "keyWhite": "#fffdf6",
    "keyBlack": "#16131a",
    "chrome": "#c9ced6",
    "grilleDark": "#2a2630",
    "leather": "#4a1b14",
    "strapRed": "#8c1a1a",
    "stud": "#8fd3ff",
    "buttonPearl": "#faf6ee"
  },
  "mounts": {
    "floorFoot": [0, 0, 0],
    "bassTop": [0, 0.125, 0],
    "bellowsBottom": [0, 0.125, 0],
    "bellowsTop": [0, 0.295, 0],
    "trebleBottom": [0, 0.295, 0],
    "keyboardFront": [0, 0.35, 0.115],
    "gridBass": [0, 0.06, 0.1]
  },
  "joints": [
    { "name": "bassBox", "at": [0, 0.06, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "bellows", "parent": "bassBox", "at": [0, 0.125, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "trebleBox", "parent": "bellows", "at": [0, 0.295, 0], "dir": [0, 1, 0], "role": "spine" }
  ],
  "parts": [
    {
      "id": "bassBox",
      "builds": "Left-hand bass box, 0.38 wide (x) by 0.22 deep (z) by 0.125 tall, as a faceted pearl box with bevelled gold edge trim, four little foot pads on the floor, the front +Z face carrying 6 rows of round pearl bass buttons with gold rims, a grille of dark slats with a chrome frame on the +X side, inlaid pink and aqua diamond panels, gold filigree corner pieces and a cluster of studs, plus a leather wrist strap on the -X side.",
      "box": [[-0.2, 0, -0.115], [0.2, 0.125, 0.115]],
      "attaches": "Top face at bassTop meets the bellows bottom. Rides joint bassBox.",
      "joints": ["bassBox"],
      "floor": true,
      "budget": 200
    },
    {
      "id": "bellowsPart",
      "builds": "Red bellows with about 14 pleats stacked along y between y=0.125 and 0.295, each pleat a thin trapezoid box in bellowsRed alternating with bellowsDark folds, tapering slightly at the ends, with white pearl and gold corner protectors on all 4 vertical edges, gold pleat-edge lines, and a pair of leather bellows straps with gold buckles on the -Z side.",
      "box": [[-0.19, 0.125, -0.108], [0.19, 0.295, 0.108]],
      "attaches": "Bottom at bellowsBottom, top at bellowsTop. Rides joint bellows.",
      "joints": ["bellows"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "trebleBody",
      "builds": "Right-hand treble box, 0.4 wide by 0.23 deep by 0.125 tall, the pearl shell with pink and aqua inlaid bands, gold edge trim, the +X side carrying a chrome grille with slats, and the top with a gold-edged cap. Its back face has a leather back plate and two red shoulder straps with gold slides and buckles hanging down the -Z side. Includes the pearl inlay patterns, studs and gold filigree swirls on the sides and top, and a chrome logo plate with a small gold emblem.",
      "box": [[-0.205, 0.295, -0.12], [0.205, 0.42, 0.11]],
      "attaches": "Bottom at trebleBottom; keyboard overhang is built by the keyboard part. Rides joint trebleBox.",
      "joints": ["trebleBox"],
      "floor": false,
      "budget": 250
    },
    {
      "id": "keyboard",
      "builds": "Piano keyboard on the front +Z face of the treble box: 26 white keys 0.0125 wide across x from -0.16 to 0.16 and 0.075 long (y), with a gold rail along the top and bottom, 18 black sharp keys in the 2-3 groups, a pearl key bed, a row of 5 register switches in pearl above the keys with gold tips, and a little gold-lettered nameplate drawn as a small gold slab.",
      "box": [[-0.175, 0.31, 0.105], [0.175, 0.415, 0.13]],
      "attaches": "Sits on the treble box front at keyboardFront. Rides joint trebleBox.",
      "joints": ["trebleBox"],
      "floor": false,
      "budget": 200
    }
  ]
}
```

<!-- call: bellowsPart -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildBellowsPart({ b, J, P, M }: Ctx) {
  const bone = J.bellows;
  const y0 = 0.125, y1 = 0.295;
  const N = 14;
  const H = (y1 - y0) / N;
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z], name });

  // half extents at height y (slight taper at both ends)
  const hx = (t: number) => 0.186 - 0.012 * Math.pow(Math.abs(t - 0.5) * 2, 3) * 0.0 - 0.004 * (1 - Math.sin(Math.PI * t));
  const hz = (t: number) => 0.104 - 0.004 * (1 - Math.sin(Math.PI * t));

  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N;
    const yc = y0 + (i + 0.5) * H;
    const wx = hx(t) * 2, wz = hz(t) * 2;
    // outward pleat ridge (red) and inward fold (dark)
    const ridge = b.part(
      new THREE.CylinderGeometry(1, 1, H * 0.55, 4, 1).rotateY(Math.PI / 4),
      P.bellowsRed,
      { bone, at: [0, yc + H * 0.1, 0], scale: [wx / 2 * 1.0, 1, wz / 2 * 1.0] },
    );
    void ridge;
    box(wx - 0.012, H * 0.42, wz - 0.012, P.bellowsDark, 0, yc - H * 0.28, 0);
    // gold pleat-edge line on front and back
    if (i % 2 === 0) {
      box(wx * 0.9, 0.0008, 0.0012, P.gold, 0, yc + H * 0.38, wz / 2 + 0.0005);
      box(wx * 0.9, 0.0008, 0.0012, P.gold, 0, yc + H * 0.38, -wz / 2 - 0.0005);
    }
  }

  // corner protectors on all 4 vertical edges
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 0.184, z = sz * 0.1;
      box(0.016, y1 - y0, 0.016, P.pearl, x, (y0 + y1) / 2, z);
      box(0.004, y1 - y0, 0.004, P.gold, sx * 0.192, (y0 + y1) / 2, sz * 0.108);
      box(0.004, y1 - y0 - 0.004, 0.004, P.gold, sx * 0.176, (y0 + y1) / 2, sz * 0.108);
      for (let k = 0; k < 4; k++)
        box(0.018, 0.003, 0.018, P.gold, x, y0 + 0.01 + k * 0.05, z);
    }

  // two leather straps with gold buckles on the -Z side
  for (const sx of [-0.09, 0.09]) {
    box(0.022, y1 - y0 + 0.002, 0.004, P.leather, sx, (y0 + y1) / 2, -0.1085);
    box(0.026, 0.012, 0.006, P.gold, sx, y0 + 0.095, -0.111);
    box(0.016, 0.006, 0.007, P.leather, sx, y0 + 0.095, -0.1115);
    box(0.016, 0.004, 0.005, P.gold, sx, y0 + 0.03, -0.111);
    box(0.016, 0.004, 0.005, P.gold, sx, y1 - 0.03, -0.111);
  }
}
```

<!-- call: keyboard -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildKeyboard({ b, J, P, M }: any) {
  const bone = J.trebleBox;
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z] });

  // Key bed: pearl backing plate on the front face
  box(0.35, 0.105, 0.012, P.pearl, 0, 0.3625, 0.111);
  // Gold rails: frame the key area top and bottom
  const yTop = 0.396, yBot = 0.318, zr = 0.121;
  box(0.345, 0.004, 0.012, P.gold, 0, yTop + 0.002, zr);
  box(0.345, 0.004, 0.012, P.gold, 0, yBot - 0.002, zr);
  for (const s of [1, -1]) box(0.004, 0.082, 0.012, P.gold, s * 0.1705, 0.357, zr);

  // 26 white keys, 0.0125 wide, 0.075 tall
  const kw = 0.0125, x0 = -0.16 + kw / 2, keyY = 0.357;
  for (let i = 0; i < 26; i++) {
    const x = x0 + i * kw;
    box(kw - 0.0012, 0.075, 0.008, P.keyWhite, x, keyY, 0.119);
    // dark gap line shadow
    box(0.0006, 0.075, 0.0085, P.pearlShadow, x + kw / 2, keyY, 0.1185);
  }
  // Black keys: sharps between white keys, skipping gaps in the 2-3 pattern
  // pattern over 7-note octave: sharps after C,D,F,G,A
  const has = [1, 1, 0, 1, 1, 1, 0];
  let count = 0;
  for (let i = 0; i < 25 && count < 18; i++) {
    if (has[i % 7]) {
      const x = x0 + i * kw + kw / 2;
      box(0.0078, 0.046, 0.007, P.keyBlack, x, keyY + 0.0145, 0.1255);
      box(0.0078, 0.002, 0.0072, P.grilleDark, x, keyY - 0.0095, 0.1255);
      count++;
    }
  }

  // Register switches above keys: 5 pearl switches with gold tips
  const swY = 0.4065;
  for (let i = 0; i < 5; i++) {
    const x = -0.06 + i * 0.03;
    box(0.016, 0.006, 0.006, P.buttonPearl, x, swY, 0.12);
    box(0.016, 0.0012, 0.0066, P.goldDark, x, swY - 0.0033, 0.12);
    box(0.005, 0.0045, 0.007, P.gold, x, swY, 0.1235);
  }
  // Nameplate: small gold slab with engraved dark lettering marks
  box(0.05, 0.007, 0.004, P.gold, -0.12, swY, 0.1175);
  const r = rng(5);
  for (let i = 0; i < 8; i++)
    box(0.003, 0.0035 + r() * 0.0015, 0.0012, P.goldDark, -0.1405 + i * 0.0055, swY, 0.1203);
  // Rhinestone studs at plate ends
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0032, 6, 4), P.stud, { bone, at: [s * 0.162, swY, 0.1195] });
  }
}
```

<!-- call: bassBox -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildBassBox({ b, J, P }: any) {
  const bone = J.bassBox;
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, x: number, y: number, z: number, axis: "x" | "y" | "z" = "y") =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at: [x, y, z], dir: axis === "x" ? [1, 0, 0] : axis === "z" ? [0, 0, 1] : [0, 1, 0] });

  // main shell
  box(0.38, 0.115, 0.22, P.pearl, 0, 0.0675, 0);
  // top plate meeting bellows
  box(0.4, 0.008, 0.23, P.pearlShadow, 0, 0.121, 0);
  // bottom plate
  box(0.4, 0.008, 0.23, P.pearlShadow, 0, 0.014, 0);
  // gold edge trim: vertical corners
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    box(0.008, 0.117, 0.008, P.gold, sx * 0.192, 0.0675, sz * 0.112);
    // foot pads
    box(0.035, 0.01, 0.03, P.goldDark, sx * 0.15, 0.005, sz * 0.075);
    // filigree corner pieces on top
    cyl(0.012, 0.012, 0.004, 8, P.gold, sx * 0.17, 0.126, sz * 0.095);
    cyl(0.005, 0.005, 0.006, 6, P.stud, sx * 0.17, 0.128, sz * 0.095);
  }
  // gold horizontal rails
  for (const y of [0.012, 0.124]) {
    box(0.4, 0.005, 0.005, P.gold, 0, y, 0.116);
    box(0.4, 0.005, 0.005, P.gold, 0, y, -0.116);
    box(0.005, 0.005, 0.23, P.gold, 0.2, y, 0);
    box(0.005, 0.005, 0.23, P.gold, -0.2, y, 0);
  }

  // bass buttons: 6 rows x 8
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 8; c++) {
      const x = -0.16 + c * 0.0185 + (r % 2) * 0.009;
      const y = 0.098 - r * 0.0155;
      cyl(0.0068, 0.0068, 0.003, 10, P.gold, x, y, 0.1165, "z");
      cyl(0.0052, 0.0052, 0.005, 10, P.buttonPearl, x, y, 0.1175, "z");
    }
  }
  // inlaid diamond panels on front, left of buttons
  const dia = (c: string, x: number, y: number, z: number, s: number, ax: "z" | "x") => {
    const m = b.part(new THREE.BoxGeometry(s, s, 0.003), c, { bone, at: [x, y, z] });
    if (ax === "z") m.mesh.rotation.z = Math.PI / 4;
    return m;
  };
  dia(P.pearlPink, -0.18, 0.09, 0.1115, 0.016, "z");
  dia(P.pearlAqua, -0.18, 0.06, 0.1115, 0.016, "z");
  dia(P.pearlPink, -0.18, 0.03, 0.1115, 0.016, "z");
  // front lower band
  box(0.37, 0.006, 0.003, P.pearlAqua, 0, 0.022, 0.1115);
  box(0.37, 0.006, 0.003, P.pearlPink, 0, 0.108, 0.1115);

  // +X grille: chrome frame, dark slats
  box(0.004, 0.09, 0.15, P.chrome, 0.1915, 0.065, 0);
  for (let i = 0; i < 11; i++) {
    box(0.005, 0.078, 0.007, P.grilleDark, 0.1945, 0.065, -0.06 + i * 0.012);
  }
  // side inlay diamonds on -X
  dia(P.pearlAqua, -0.1915, 0.04, 0.05, 0.02, "z");
  // -X side diamond panels (rotated about x)
  for (let i = 0; i < 3; i++) {
    const m = b.part(new THREE.BoxGeometry(0.003, 0.02, 0.02), i % 2 ? P.pearlAqua : P.pearlPink, { bone, at: [-0.1915, 0.08 - i * 0.003, -0.07 + i * 0.03] });
    m.mesh.rotation.x = Math.PI / 4;
  }
  // leather wrist strap on -X side
  box(0.012, 0.075, 0.1, P.leather, -0.197, 0.065, 0);
  box(0.004, 0.012, 0.03, P.gold, -0.2045, 0.065, 0);
  box(0.006, 0.07, 0.004, P.strapRed, -0.2, 0.065, 0.03);
  box(0.006, 0.07, 0.004, P.strapRed, -0.2, 0.065, -0.03);

  // stud cluster on front right
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const x = 0.17 + Math.cos(a) * 0.012, y = 0.04 + Math.sin(a) * 0.012;
    b.part(new THREE.SphereGeometry(0.0035, 6, 4), P.stud, { bone, at: [x, y, 0.1165] });
  }
  b.part(new THREE.SphereGeometry(0.005, 6, 4), P.stud, { bone, at: [0.17, 0.04, 0.1175] });
  // scattered small gold studs on back/top
  for (let i = 0; i < 8; i++) {
    b.part(new THREE.SphereGeometry(0.003, 6, 4), P.gold, { bone, at: [-0.15 + R() * 0.3, 0.0675 + (R() - 0.5) * 0.08, -0.1165] });
  }
}
```

<!-- call: trebleBody -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTrebleBody({ b, J, P, M }: Ctx) {
  const bone = J.trebleBox;
  const X0 = -0.205, X1 = 0.205, Y0 = 0.295, Y1 = 0.42, Z0 = -0.12, Z1 = 0.11;
  const cx = (X0 + X1) / 2, cy = (Y0 + Y1) / 2, cz = (Z0 + Z1) / 2;
  const W = X1 - X0, H = Y1 - Y0, D = Z1 - Z0;

  const box = (w: number, h: number, d: number, color: string, at: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at });
  const cyl = (r: number, len: number, seg: number, color: string, at: [number, number, number], dir: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { bone, at, dir });
  const ball = (r: number, color: string, at: [number, number, number]) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), color, { bone, at });

  // pearl shell
  box(W, H, D, P.pearl, [cx, cy, cz]);
  // bottom shadow band
  box(W + 0.002, 0.006, D + 0.002, P.pearlShadow, [cx, Y0 + 0.003, cz]);
  // gold edge trim: vertical corners
  for (const sx of [X0, X1]) for (const sz of [Z0, Z1])
    box(0.007, H + 0.002, 0.007, P.gold, [sx, cy, sz]);
  // top and bottom rim rails
  for (const y of [Y0 + 0.001, Y1 - 0.001]) {
    for (const sz of [Z0, Z1]) box(W + 0.006, 0.006, 0.006, P.gold, [cx, y, sz]);
    for (const sx of [X0, X1]) box(0.006, 0.006, D + 0.006, P.gold, [sx, y, cz]);
  }
  // top cap
  box(W - 0.02, 0.006, D - 0.02, P.pearlPink, [cx, Y1 + 0.002, cz]);
  box(W - 0.05, 0.003, D - 0.05, P.pearl, [cx, Y1 + 0.0055, cz]);
  for (const sx of [X0 + 0.012, X1 - 0.012]) for (const sz of [Z0 + 0.012, Z1 - 0.012])
    box(0.012, 0.004, 0.012, P.gold, [sx, Y1 + 0.004, sz]);

  // top gold filigree: diamond studs and swirl bars
  const r = rng(5);
  for (let i = 0; i < 9; i++) {
    const x = -0.15 + i * 0.0375;
    const d = b.part(new THREE.OctahedronGeometry(0.006), i % 2 ? P.pearlAqua : P.stud, { bone, at: [x, Y1 + 0.009, -0.045] });
    d.mesh.scale.set(1, 0.5, 1);
    box(0.02, 0.0015, 0.003, P.gold, [x + 0.019, Y1 + 0.007, -0.045]);
  }
  for (let i = 0; i < 6; i++) ball(0.003, P.stud, [-0.1 + i * 0.04 + r() * 0.002, Y1 + 0.008, -0.085]);

  // inlaid bands on the -Z back face and +X side
  const band = (y: number, h: number, c: string) => box(W - 0.02, h, 0.002, c, [cx, y, Z0 - 0.001]);
  band(cy + 0.03, 0.014, P.pearlPink);
  band(cy - 0.03, 0.014, P.pearlAqua);
  // leather back plate
  box(0.3, 0.09, 0.004, P.leather, [cx, cy, Z0 - 0.002]);
  box(0.304, 0.002, 0.005, P.gold, [cx, cy + 0.046, Z0 - 0.002]);
  box(0.304, 0.002, 0.005, P.gold, [cx, cy - 0.046, Z0 - 0.002]);
  for (let i = 0; i < 7; i++) ball(0.003, P.gold, [-0.12 + i * 0.04, cy, Z0 - 0.005]);

  // shoulder straps hanging down -Z
  for (const sx of [-0.08, 0.08]) {
    box(0.03, 0.1, 0.004, P.strapRed, [sx, Y0 - 0.02, Z0 - 0.004]);
    box(0.03, 0.1, 0.002, P.strapRed, [sx, Y0 - 0.02, Z0 - 0.007]);
    box(0.036, 0.012, 0.006, P.gold, [sx, Y0 + 0.02, Z0 - 0.006]); // slide
    box(0.026, 0.008, 0.007, P.goldDark, [sx, Y0 + 0.02, Z0 - 0.006]);
    box(0.034, 0.014, 0.006, P.gold, [sx, Y0 - 0.055, Z0 - 0.006]); // buckle
    box(0.022, 0.006, 0.007, P.strapRed, [sx, Y0 - 0.055, Z0 - 0.006]);
    box(0.002, 0.012, 0.008, P.goldDark, [sx, Y0 - 0.055, Z0 - 0.006]);
  }
  box(0.2, 0.014, 0.005, P.leather, [cx, Y1 - 0.012, Z0 - 0.003]); // upper strap
  for (const sx of [-0.08, 0.08]) box(0.03, 0.03, 0.005, P.strapRed, [sx, Y1 - 0.025, Z0 - 0.004]);

  // chrome grille on +X side
  const gx = X1;
  box(0.004, 0.1, 0.19, P.gold, [gx + 0.001, cy, cz]);
  box(0.006, 0.094, 0.184, P.chrome, [gx + 0.002, cy, cz]);
  box(0.007, 0.084, 0.174, P.grilleDark, [gx + 0.0025, cy, cz]);
  for (let i = 0; i < 12; i++) {
    const z = cz - 0.08 + i * (0.16 / 11);
    box(0.009, 0.086, 0.007, P.chrome, [gx + 0.003, cy, z]);
  }
  for (const y of [cy + 0.036, cy - 0.036]) box(0.009, 0.004, 0.176, P.gold, [gx + 0.003, y, cz]);
  // side inlay diamonds
  for (const z of [Z0 + 0.02, Z1 - 0.02]) {
    const d = b.part(new THREE.OctahedronGeometry(0.014), z < 0 ? P.pearlPink : P.pearlAqua, { bone, at: [gx + 0.002, cy, z] });
    d.mesh.scale.set(0.3, 1.4, 0.9);
    ball(0.003, P.gold, [gx + 0.004, cy, z]);
  }

  // left (-X) side: swirl panel
  box(0.003, 0.09, 0.17, P.pearlPink, [X0 - 0.0015, cy, cz]);
  box(0.004, 0.07, 0.15, P.pearl, [X0 - 0.002, cy, cz]);
  for (let i = 0; i < 4; i++) {
    const d = b.part(new THREE.OctahedronGeometry(0.012), i % 2 ? P.pearlAqua : P.pearlPink, { bone, at: [X0 - 0.004, cy, cz - 0.06 + i * 0.04] });
    d.mesh.scale.set(0.3, 1.2, 1);
    ball(0.003, P.stud, [X0 - 0.006, cy, cz - 0.06 + i * 0.04]);
  }
  cyl(0.02, 0.003, 12, P.gold, [X0 - 0.002, cy, cz], [1, 0, 0]);

  // chrome logo plate on the back with gold emblem
  box(0.07, 0.022, 0.003, P.chrome, [0.1, cy + 0.052 - 0.0, Z0 - 0.0015]);
  box(0.074, 0.002, 0.004, P.gold, [0.1, cy + 0.0635, Z0 - 0.0015]);
  const em = b.part(new THREE.OctahedronGeometry(0.007), P.gold, { bone, at: [0.1, cy + 0.052, Z0 - 0.004] });
  em.mesh.scale.set(1, 1, 0.4);
  for (const dx of [-0.022, 0.022]) box(0.016, 0.003, 0.004, P.goldDark, [0.1 + dx, cy + 0.052, Z0 - 0.004]);

  // front face top/bottom pearl bands (keyboard part sits between)
  box(W - 0.01, 0.008, 0.003, P.pearlPink, [cx, Y1 - 0.004, Z1 + 0.001]);
  box(W - 0.01, 0.008, 0.003, P.pearlAqua, [cx, Y0 + 0.004, Z1 + 0.001]);
  for (let i = 0; i < 10; i++) ball(0.0025, P.stud, [-0.18 + i * 0.04, Y0 + 0.004, Z1 + 0.004]);
}
```