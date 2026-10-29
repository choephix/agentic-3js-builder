<!-- call: plan -->

```json
{
  "name": "Dutch Windmill",
  "description": "A cozy Animal Crossing-style Dutch tower windmill: a tapered octagonal terracotta brick tower with a wooden gallery and stairs, a mint boat-shaped cap with a weathervane and tail pole, and four cloth-and-lattice sails in a plus shape on a spinning rotor.",
  "builderName": "dutchWindmill",
  "size": [8.8, 11.4, 8.9],
  "layout": "Units are meters. +Z is the front, with the door, the sails and the stair foot. The sails sit in the plane z=3.6, so the cap is in the middle and the tail pole slopes down behind it. Everything is centred on x=0 and rests on y=0 at the stone plinth, the gallery stairs and the barrels. The tower is an 8-sided tapered octagon with flat faces toward +Z, -Z, +X and -X. WALL RULE shared by every part: the apothem (centre to flat face) at height y is A(y) = 2.30 - 0.1316*(y-0.5), from A(0.5)=2.30 to A(6.2)=1.55. The front face is z=A(y), the left face is x=+A(y) and the right face is x=-A(y). Anything seated on a wall sits at A(y)+0.01. The octagon tower builder must make its flat faces land exactly on these values (the circumradius is apothem*1.0824; if an 8-segment lathe puts vertices on the axes, spin it 22.5 deg). A plinth ring of apothem 2.65 runs from y=0 to 0.5. The cap has a rounded boat-shaped dome over the tower top, about 1.8 m in radius and elongated in z, from y=6.2 to 8.0. The rotating hub is at [0,7.2,3.6]. The sails reach radius 4.2 from the hub in a plus shape, so the tips are at y=11.4, y=3.0 and x=+-4.2. Proportions are chunky and toy-like, with a slightly bulbous round-looking cap. Nothing is thinner than 0.1 m, so the thinnest bars stay readable, and edges look soft because of wide trim bands, bevel-like stacked rims and pill shapes. STYLE (Animal Crossing): warm pastel flat colours, a simple base shape with little cute details on top, and a hand-made crafted feel with wooden pegs, planks, patches and flower boxes. Colours go warmer on top and cooler or darker below, with moss and mud only at the plinth. Facets are low (8 to 12 sides). Every detail is a small separate part in its own colour: dark-outline layer, main colour, highlight. Lantern glass and windows use the glow kit sparingly (lanterns warm yellow, window panes a faint blue glow). No ground slab or scenery beyond the listed items.",
  "palette": {
    "brick": "#d9826b",
    "brickLight": "#e99c82",
    "brickDark": "#b4634e",
    "plaster": "#fbf1dc",
    "plasterShade": "#e8d9bb",
    "stone": "#b9b4a6",
    "stoneDark": "#8f8a7d",
    "moss": "#8ab36a",
    "wood": "#b9814f",
    "woodLight": "#d9a56e",
    "woodDark": "#7d5233",
    "outline": "#5a3a2a",
    "roofMint": "#78b5a8",
    "roofMintDark": "#51877d",
    "roofMintLight": "#a6d6c8",
    "doorRed": "#cc5750",
    "doorRedDark": "#9c3d3a",
    "shutterTeal": "#5fa89e",
    "glass": "#9fd8e6",
    "glassLight": "#e0f5f9",
    "sailCloth": "#fff6e0",
    "sailClothAlt": "#f6d98a",
    "iron": "#4a4a55",
    "brass": "#e3b04b",
    "lanternGlow": "#ffd36b",
    "rope": "#d8c08a",
    "sack": "#e6d3a8",
    "flowerPink": "#f49ab6",
    "flowerYellow": "#ffd45c",
    "leaf": "#7bbf6a",
    "leafDark": "#4f9a55"
  },
  "mounts": {
    "plinthTop": [0, 0.5, 0],
    "towerTop": [0, 6.2, 0],
    "doorBase": [0, 0.5, 2.3],
    "galleryFloor": [0, 3.0, 0],
    "galleryDoor": [1.89, 3.05, 0],
    "stairBottom": [3.45, 0, 3.2],
    "stairTop": [3.45, 3.0, 0.3],
    "capBase": [0, 6.2, 0],
    "capTop": [0, 8.0, 0],
    "hub": [0, 7.2, 3.6],
    "windshaftBack": [0, 7.2, 0.9],
    "tailPoleTop": [0, 7.0, -1.7],
    "tailPoleEnd": [0, 1.2, -4.2]
  },
  "joints": [
    { "name": "tower", "at": [0, 0.5, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "cap", "parent": "tower", "at": [0, 6.2, 0], "dir": [0, 1, 0], "role": "hinge", "group": "cap" },
    { "name": "rotor", "parent": "cap", "at": [0, 7.2, 3.6], "dir": [0, 0, 1], "role": "hinge", "group": "sails" }
  ],
  "parts": [
    {
      "id": "towerBody",
      "builds": "The brick tower and plinth. (1) An octagonal stone plinth with apothem 2.65 from y=0 to 0.5, in stone, with a darker stoneDark course on its lower 0.15 and small moss patches on its upward faces and at the corners. A few rounded boulders or flagstone blocks at the foot are fine. (2) The tapered octagonal tower body from y=0.5 to 6.2 following the WALL RULE A(y) exactly, in brick. Brick detail: thin brickDark mortar bands every 0.3 m as shallow octagonal ring plates, alternating lighter and darker brick pads (brickLight) as small seated rectangles on every face in a staggered brick pattern (at least 3 rows on each of the 8 faces, kept low in count), brickDark shaded corner edges, and eight thin pilaster strips up the corners in brickLight. (3) A plaster whitewash band from y=0.5 to 0.9 around the base and a wider plaster cornice at the top (y=5.95 to 6.2, apothem 1.55 to 1.75) with a stepped plasterShade underside. (4) Two iron tie-rod anchor plates (small plaster-ringed iron discs) on the front face at y=5.2, x=+-0.9. Do not build the door, windows, gallery or cap.",
      "box": [[-2.9, 0, -2.9], [2.9, 6.3, 2.9]],
      "attaches": "Plinth sits on y=0. The tower top meets the cap at towerTop/capBase. The doorBase, galleryFloor and gallery door mounts lie on its surface. Rides joint tower.",
      "joints": ["tower"],
      "floor": true,
      "budget": 160
    },
    {
      "id": "openings",
      "builds": "Everything seated on the front and side walls below the cap, using the WALL RULE. (1) The front door at doorBase: a plaster surround 1.3 wide and 1.9 tall with a rounded arch top (stacked slab or lathe half-disc). Inside it are two door leaves of doorRed planks with doorRedDark plank seams, a brass handle and hinge straps in iron, a rounded wood step in stone, and a small wooden awning of woodLight with woodDark supports above. (2) Three windows on the front wall: two at y 4.4 to 5.4, x=+-0.75, and one round attic window at y=5.7, x=0, with a plaster frame, glass panes with a glassLight highlight and a cross mullion in woodDark. Each has shutterTeal shutters, each with a heart or diamond cutout in plaster, and a woodDark flower box under it with flowerPink and flowerYellow blossoms and leaf buds. The windows are small and the shutters big, so they read as cute. (3) The same style of one window at y 1.4 on the right (-X) and left (+X) faces and one at y 4.8 on the rear (-Z) face. Mind the gallery: nothing on the left (+X) face between y=3.05 and 4.4 near z=0, since the gallery builder puts its door there. (4) A hanging wooden sign bracket to the right of the door at [-1.35,2.1,2.12+] holding a little board with a simple bread-loaf or windmill emblem in brass and plaster. (5) Props at the door: two barrels (woodDark bands, wood staves) at [-1.45,0,2.9] and [-1.9,0,2.5], and two plump sacks (sack, rope tie) at [1.35,0,2.8] and [1.8,0,2.55]. A potted tulip or two is fine, using the flower and leaf colours. Everything stays within +-2.4 in x and below y=5.9.",
      "box": [[-2.4, 0, -2.4], [2.4, 5.9, 3.2]],
      "attaches": "Seated on the walls of towerBody by the WALL RULE; the door stands on the plinth/floor at doorBase (barrels and sacks rest on y=0). Rides joint tower.",
      "joints": ["tower"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "gallery",
      "builds": "The wooden stage gallery and stairs. (1) An octagonal ring floor at galleryFloor y=2.9 to 3.05 from apothem 1.95 out to 3.0, in wood, with plank seams as thin woodDark strips and a darker rim band. (2) Eight diagonal wooden brackets (woodDark) under the floor, from the wall at y 2.1 out to the ring edge at y 2.9. (3) The railing: posts every octagon corner and mid-edge (woodLight posts with brass-capped tops, 0.12 square, 0.9 tall to y=4.0), two horizontal rails (top and mid) in wood, with a gap for the gate at the stair top at +X, z -0.1 to 0.7. (4) The left-side (+X) gallery door on the wall at galleryDoor (y 3.05 to 4.4, 0.8 wide) in doorRed with a woodDark frame, a small brass knob, and a tiny plaster-framed arch. (5) Stairs on the +X side: a wooden staircase 0.9 wide centred at x=3.45, rising from stairBottom (z=3.2, y=0) to stairTop (z=0.3, y=3.0) with about 12 treads in woodLight and risers in wood, two woodDark side stringers, and a railing on the outer side (+x edge, x=3.9) with posts and a handrail, ending at the gallery gate. Two stone feet blocks at the bottom. (6) Two hanging lanterns (iron cap, lanternGlow glass cube with glow, brass ring) from gallery posts at the front corners, y 3.7, and one at the stair foot post. (7) A coil of rope (rope-coloured stacked torus pieces) and a small woodDark hook on the rail near the back.",
      "box": [[-3.2, 0, -3.2], [4.0, 4.2, 3.3]],
      "attaches": "Ring floor butts the tower wall at galleryFloor, per the WALL RULE; the gallery door sits on the wall at galleryDoor; stairs land on y=0 at stairBottom and meet the gate at stairTop. Rides joint tower. It must stay clear of the sail plane z>=3.45 (the stair foot ends at z=3.2).",
      "joints": ["tower"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "capRoof",
      "builds": "The turning cap and tail. Rides joint cap. (1) A base ring (plaster, apothem about 1.75, y 6.2 to 6.45) and an eave ring of roofMintDark at y 6.45 to 6.7, radius 1.9. (2) A boat-shaped domed roof from y=6.5 to capTop y=8.0, made of roofMint: a lathe or loft squashed to x radius 1.8 and z radius 2.0, with its front more rounded and a ridge line running front to back. Add ribbed seams as thin roofMintDark curved strips (8 to 10 ribs), a roofMintLight highlight cap on top, and a scalloped (shingle-like) row of small rounded roofMintLight shingles around the eave. (3) A front gable face visor over the hub opening: a wooden beam frame (woodDark) around a round opening at [0,7.2,1.9], with a plaster collar. (4) Two round dormer windows on the sides at y 7.0, x=+-1.7 (plaster frame, glass pane, mint mini-roof). (5) A finial: an iron pole from y=8.0 to 8.6 with a brass ball and a small weathervane (an extruded rooster or arrow in brass, with an N/S cross bar) on top. (6) The tail pole: a long wooden beam (wood, 0.2 thick) from tailPoleTop [0,7.0,-1.7] to tailPoleEnd [0,1.2,-4.2], with woodDark rungs/ladder steps every 0.45 m, two woodDark bracing struts under it near the cap, a capstan wheel (woodLight spokes, woodDark rim, radius 0.4, horizontal axle) at tailPoleEnd, and a rope loop (rope colour) around the wheel. Do not build the windshaft, hub or sails.",
      "box": [[-2.0, 0.7, -4.7], [2.0, 8.7, 2.2]],
      "attaches": "Sits on the tower top at capBase; the hub opening aligns with the windshaft (rotor part) on the line y=7.2, x=0, which exits through the visor at z=1.9. The tail pole's top meets the cap at the tailPoleTop mount. The wheel hangs clear of the floor. Rides joint cap.",
      "joints": ["cap"],
      "floor": false,
      "budget": 160
    },
    {
      "id": "sailRotor",
      "builds": "The spinning sail assembly, riding joint rotor, with local rest layout as follows. (1) A windshaft: a wood cylinder (radius 0.18) from windshaftBack z=0.9 to z=3.9 along the line y=7.2, x=0, with woodDark iron-band rings every 0.5 and a brake wheel (a disc of woodLight with spokes, radius 0.8) at z=1.2, hidden inside the cap. (2) The hub at z=3.6: a plaster cylinder drum (radius 0.55, length 0.5), a brass cone spinner nose to z=4.4 (it ends at z=4.3), a woodDark ring and eight brass bolts around the drum. (3) Four sail arms at angles 0, 90, 180 and 270 deg in a + shape (up, left, down, right), each in the plane z=3.6. Every arm has: a main stock beam (wood, 0.18 square) from radius 0.5 to the tip at radius 4.2; a lattice sail frame that starts at radius 1.1 and ends at 4.1, 0.95 wide on the trailing side (counter-clockwise from the viewer's side, the same tangential side on every arm), with two long woodDark rails, a woodDark tip bar and rungs every 0.3; and sailCloth panels in the gaps: three or four stretched cloth panels alternating sailCloth and sailClothAlt, thin slabs seated on the lattice. Add a lighter woodLight leading board along the stock, a small iron tip cap, and two or three rope-tie details per arm. Every arm should be a recognisable cartoon blade, with joints between lattice and stock marked by small brass studs. The overall silhouette extends to exactly radius 4.2.",
      "box": [[-4.4, 3.0, 0.9], [4.4, 11.4, 4.4]],
      "attaches": "The windshaft enters the cap visor (capRoof) on the line y=7.2, x=0; the hub is the rotor joint at the hub mount [0,7.2,3.6] and rides joint rotor. Sails must clear the gallery railing and the stair (they sit at z>=3.45 and the stair foot ends at z=3.2).",
      "joints": ["rotor"],
      "floor": false,
      "budget": 210
    }
  ]
}
```

<!-- call: sailRotor -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildSailRotor({ b, J, P, M }: any) {
  const bone = J.rotor;
  const HUB = M.hub as number[];
  const [hx, hy, hz] = HUB;
  const put = (geo: THREE.BufferGeometry, color: string, at: number[], o: any = {}) =>
    b.part(geo, color, { bone, at, ...o });
  const box = (w: number, h: number, d: number, color: string, at: number[], o: any = {}) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (r: number, len: number, seg: number, color: string, at: number[], o: any = {}) =>
    put(new THREE.CylinderGeometry(r, r, len, seg), color, at, { dir: [0, 0, 1], ...o });

  // windshaft
  cyl(0.18, 3.0, 10, P.wood, [hx, hy, 2.4]);
  for (let z = 1.0; z <= 3.8; z += 0.5) cyl(0.215, 0.1, 10, P.woodDark, [hx, hy, z]);
  // brake wheel
  cyl(0.8, 0.12, 12, P.woodLight, [hx, hy, 1.2]);
  cyl(0.82, 0.08, 12, P.woodDark, [hx, hy, 1.2]);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 4;
    box(1.5, 0.1, 0.16, P.woodDark, [hx, hy, 1.2], { rotation: [0, 0, (a * 180) / Math.PI] });
  }

  // hub
  cyl(0.55, 0.5, 12, P.plaster, [hx, hy, hz]);
  cyl(0.6, 0.12, 12, P.woodDark, [hx, hy, hz - 0.2]);
  cyl(0.58, 0.08, 12, P.woodDark, [hx, hy, hz + 0.22]);
  put(new THREE.ConeGeometry(0.4, 0.8, 12), P.brass, [hx, hy, hz + 0.65], { dir: [0, 0, 1] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    put(new THREE.SphereGeometry(0.05, 6, 4), P.brass, [hx + Math.cos(a) * 0.48, hy + Math.sin(a) * 0.48, hz + 0.27]);
  }

  // arms: local frame u = radial, v = tangential, placed by rotation about Z
  for (let k = 0; k < 4; k++) {
    const ang = k * 90;
    const rad = (ang * Math.PI) / 180;
    const ur = [-Math.sin(rad), Math.cos(rad)]; // radial (0 deg = up)
    const tv = [Math.cos(rad), Math.sin(rad)]; // tangential
    const P2 = (r: number, t: number, z: number) => [hx + ur[0] * r + tv[0] * t, hy + ur[1] * r + tv[1] * t, hz + z];
    const bx = (r0: number, r1: number, t0: number, t1: number, z: number, th: number, c: string) => {
      const L = r1 - r0, W = t1 - t0;
      return box(W, L, th, c, P2((r0 + r1) / 2, (t0 + t1) / 2, z), { rotation: [0, 0, ang] });
    };
    // stock
    bx(0.5, 4.2, -0.09, 0.09, 0, 0.18, P.wood);
    bx(0.6, 4.1, -0.07, 0.07, 0.1, 0.06, P.woodLight);
    // lattice rails
    bx(1.1, 4.1, 0.0, 0.1, 0.0, 0.14, P.woodDark);
    bx(1.1, 4.1, 0.9, 1.0, 0.0, 0.14, P.woodDark);
    bx(4.0, 4.1, 0.0, 1.0, 0.0, 0.14, P.woodDark);
    bx(1.1, 1.2, 0.0, 1.0, 0.0, 0.14, P.woodDark);
    for (let r = 1.4; r < 4.0; r += 0.3) bx(r - 0.03, r + 0.03, 0.1, 0.9, 0.0, 0.1, P.woodDark);
    // cloth panels
    const edges = [1.2, 1.97, 2.73, 3.5, 4.0];
    for (let i = 0; i < 4; i++) {
      bx(edges[i] + 0.04, edges[i + 1] - 0.04, 0.1, 0.9, 0.05, 0.05, i % 2 ? P.sailClothAlt : P.sailCloth);
    }
    // studs and ropes
    for (const r of [1.15, 2.5, 3.9]) {
      put(new THREE.SphereGeometry(0.07, 6, 4), P.brass, P2(r, 0.04, 0.1));
      bx(r - 0.04, r + 0.04, -0.12, 0.2, 0.05, 0.22, P.rope);
    }
    // tip cap
    bx(4.2, 4.28, -0.1, 0.1, 0, 0.2, P.iron);
  }
  glow(box(0.01, 0.01, 0.01, P.brass, [hx, hy, hz - 0.4]), 0.01);
}
```

<!-- call: towerBody -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildTowerBody({ b, J, P, M }: Ctx) {
  const bone = J.tower;
  const R = rng(11);
  const A = (y: number) => 2.3 - 0.1316 * (y - 0.5);
  const K = 1.0824;
  const part = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at, flat: true, ...o });

  // octagonal prism lathe-like: CylinderGeometry with 8 sides, vertex at +Z -> rotate 22.5deg so flats face axes
  const oct = (rTop: number, rBot: number, h: number) => {
    const g = new THREE.CylinderGeometry(rTop * K, rBot * K, h, 8);
    g.rotateY(Math.PI / 8);
    return g;
  };
  const ring = (a0: number, a1: number, h: number, c: string, y: number) =>
    part(oct(a1, a0, h), c, [0, y, 0]);

  // plinth
  ring(2.65, 2.65, 0.5, P.stone, 0.25);
  ring(2.68, 2.68, 0.15, P.stoneDark, 0.075);
  ring(2.55, 2.55, 0.04, P.stoneDark, 0.52);
  // moss patches
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const r = 2.62 * K;
    part(new THREE.SphereGeometry(0.17, 6, 4), P.moss, [Math.sin(a) * r, 0.46, Math.cos(a) * r], { scale: [1.2, 0.35, 1.2] });
    if (i % 2 === 0) {
      const a2 = a + 0.4;
      part(new THREE.SphereGeometry(0.2, 6, 4), P.moss, [Math.sin(a2) * 2.4, 0.5, Math.cos(a2) * 2.4], { scale: [1.3, 0.3, 1] });
    }
  }
  // boulders
  for (let i = 0; i < 6; i++) {
    const a = 0.5 + i * 1.05;
    const r = 2.95 + R() * 0.2;
    if (Math.abs(Math.sin(a)) < 0.1 && Math.cos(a) > 0) continue;
    const s = 0.16 + R() * 0.12;
    part(new THREE.IcosahedronGeometry(s, 0), i % 2 ? P.stone : P.stoneDark, [Math.sin(a) * r * 0.97, s * 0.6, -Math.abs(Math.cos(a)) * r * 0.97 - (i % 3 === 0 ? 0 : 0)]);
  }

  // tower body: segments of 0.3 following A(y) exactly
  const seg = 19;
  const h = 5.7 / seg;
  for (let i = 0; i < seg; i++) {
    const y0 = 0.5 + i * h;
    const y1 = y0 + h;
    const c = i < 2 ? P.plaster : i % 2 ? P.brick : P.brick;
    part(oct(A(y1), A(y0), h), c, [0, (y0 + y1) / 2, 0]);
    // mortar band
    if (i > 2) part(oct(A(y0) - 0.0, A(y0) + 0.0, 0.03).scale(1.0, 1, 1), P.brickDark, [0, y0, 0], { scale: [1.012, 1, 1.012] });
  }
  // whitewash band
  part(oct(A(0.9) + 0.02, A(0.5) + 0.02, 0.4), P.plaster, [0, 0.7, 0]);
  part(oct(A(0.9) + 0.06, A(0.9) + 0.06, 0.06), P.plasterShade, [0, 0.9, 0]);

  // brick pads, staggered on 8 faces
  const rows = [1.4, 1.75, 2.1, 2.45, 2.8, 3.15, 3.5, 3.85, 4.2, 4.55, 4.9];
  for (let f = 0; f < 8; f++) {
    const ang = (f * Math.PI) / 4;
    const nx = Math.sin(ang), nz = Math.cos(ang);
    const tx = nz, tz = -nx;
    rows.forEach((y, ri) => {
      if (f === 0 && y > 5 ) return;
      const n = ri % 2 ? 2 : 3;
      for (let k = 0; k < n; k++) {
        const off = (k - (n - 1) / 2) * 0.62;
        const a = A(y) + 0.015;
        const light = (k + ri) % 2 === 0;
        part(new THREE.BoxGeometry(0.4 * (A(y) / 2), 0.17, 0.03), light ? P.brickLight : P.brickDark,
          [nx * a + tx * off * (A(y) / 2), y, nz * a + tz * off * (A(y) / 2)], { rotation: [0, (ang * 180) / Math.PI, 0] });
      }
    });
  }

  // corner edges and pilasters
  for (let f = 0; f < 8; f++) {
    const ang = (f * Math.PI) / 4 + Math.PI / 8;
    const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
    const p0 = dir.clone().multiplyScalar(A(0.9) * K + 0.02).setY(0.9);
    const p1 = dir.clone().multiplyScalar(A(5.95) * K + 0.02).setY(5.95);
    b.rod(p0.toArray(), p1.toArray(), 0.055, P.brickLight, { bone, sides: 6 });
    const q0 = dir.clone().multiplyScalar(A(0.9) * K - 0.02).setY(0.9);
    const q1 = dir.clone().multiplyScalar(A(5.95) * K - 0.02).setY(5.95);
    b.rod(q0.toArray(), q1.toArray(), 0.1, P.brickDark, { bone, sides: 6 });
  }

  // cornice
  part(oct(1.62, 1.55, 0.25), P.plaster, [0, 6.075, 0]);
  part(oct(1.75, 1.7, 0.1), P.plaster, [0, 6.12, 0]);
  part(oct(1.75, 1.6, 0.1), P.plasterShade, [0, 5.95, 0]);
  part(oct(1.68, 1.68, 0.06), P.plasterShade, [0, 5.88, 0]);

  // tie-rod plates
  for (const s of [1, -1]) {
    const z = A(5.2) + 0.02;
    part(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 10), P.plaster, [s * 0.9, 5.2, z], { dir: [0, 0, 1] });
    part(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 10), P.iron, [s * 0.9, 5.2, z + 0.03], { dir: [0, 0, 1] });
    part(new THREE.SphereGeometry(0.04, 5, 4), P.brass, [s * 0.9, 5.2, z + 0.08]);
  }
}
```

<!-- call: capRoof -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCapRoof({ b, J, P, M }: Ctx) {
  const bone = J.cap;
  const R = rng(5);
  const part = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at, flat: true, ...o });
  const cyl = (rt: number, rb: number, h: number, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const sph = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);

  // base rings
  part(cyl(1.82, 1.9, 0.25, 8), P.plaster, [0, 6.325, 0], { rotation: [0, 22.5, 0] });
  part(cyl(1.9, 1.95, 0.25, 12), P.roofMintDark, [0, 6.575, 0]);

  // dome: squashed sphere (x1.8, z2.0, y1.5), front rounder via stacked layers
  part(sph(1, 14, 10, ), P.roofMint, [0, 6.5, 0], { scale: [1.8, 1.5, 2.0] });
  // highlight cap
  part(sph(1, 10, 6), P.roofMintLight, [0, 7.78, -0.05], { scale: [0.75, 0.3, 0.9] });
  // ridge
  part(box(0.14, 0.12, 3.0), P.roofMintDark, [0, 7.98, 0]);
  // ribs
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    if (Math.abs(Math.sin(a)) < 0.01 && Math.cos(a) > 0) continue;
    const dx = Math.sin(a), dz = Math.cos(a);
    const r = 0.98;
    for (let k = 0; k < 3; k++) {
      const el = 0.3 + k * 0.38;
      const x = dx * 1.8 * Math.cos(el) * r, z = dz * 2.0 * Math.cos(el) * r, y = 6.5 + 1.5 * Math.sin(el) * r;
      part(box(0.1, 0.1, 0.5), P.roofMintDark, [x, y, z], { rotation: [-el * 57 * dz, a * 57, 0] });
    }
  }
  // scallop shingles
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    part(sph(0.17, 6, 5), P.roofMintLight, [Math.sin(a) * 1.92, 6.72, Math.cos(a) * 2.0 * 0.96], { scale: [1, 0.7, 1] });
  }

  // front visor
  const hz = 1.9;
  part(cyl(0.7, 0.7, 0.2, 12), P.woodDark, [0, 7.2, 1.85], { rotation: [90, 0, 0] });
  part(new THREE.TorusGeometry(0.62, 0.12, 6, 12), P.plaster, [0, 7.2, 1.97]);
  part(cyl(0.45, 0.45, 0.1, 12), P.outline, [0, 7.2, 2.0], { rotation: [90, 0, 0] });
  for (const s of [1, -1]) {
    part(box(0.18, 1.6, 0.2), P.woodDark, [s * 0.85, 7.2, 1.85]);
  }
  part(box(1.9, 0.18, 0.2), P.woodDark, [0, 8.05 - 0.25, 1.7]);
  part(box(1.9, 0.18, 0.2), P.woodDark, [0, 6.45, 1.9]);

  // dormers
  for (const s of [1, -1]) {
    part(cyl(0.38, 0.38, 0.2, 10), P.plaster, [s * 1.72, 7.0, 0], { rotation: [0, 0, 90] });
    glow(part(cyl(0.28, 0.28, 0.1, 10), P.glass, [s * 1.84, 7.0, 0], { rotation: [0, 0, 90] }), 0.5);
    part(box(0.06, 0.5, 0.06), P.woodDark, [s * 1.9, 7.0, 0]);
    part(box(0.06, 0.06, 0.5), P.woodDark, [s * 1.9, 7.0, 0]);
    part(new THREE.ConeGeometry(0.5, 0.35, 8), P.roofMintDark, [s * 1.8, 7.5, 0]);
  }

  // finial
  part(cyl(0.04, 0.05, 0.7, 6), P.iron, [0, 8.3, 0]);
  part(sph(0.1, 8, 6), P.brass, [0, 8.4, 0]);
  part(box(0.9, 0.05, 0.05), P.brass, [0, 8.5, 0]);
  part(box(0.05, 0.05, 0.9), P.brass, [0, 8.5, 0]);
  part(box(0.05, 0.22, 0.4), P.brass, [0, 8.62, 0.35]);
  part(new THREE.ConeGeometry(0.1, 0.25, 4), P.brass, [0, 8.62, 0.62], { rotation: [90, 0, 0] });
  part(box(0.04, 0.3, 0.3), P.brass, [0, 8.65, -0.3]);

  // tail pole
  const a = new THREE.Vector3(0, 7.0, -1.7), e = new THREE.Vector3(0, 1.2, -4.2);
  const d = e.clone().sub(a), L = d.length();
  const dir = d.clone().normalize();
  b.rod(a, e, 0.12, P.wood, { bone });
  const n = Math.floor(L / 0.45);
  for (let i = 1; i < n; i++) {
    const p = a.clone().addScaledVector(dir, i * 0.45);
    part(box(0.5, 0.07, 0.1), P.woodDark, [p.x, p.y, p.z], { rotation: [Math.atan2(d.y, -d.z) * 57 * -1 + 0, 0, 0] });
  }
  for (const [y, z, tz] of [[5.8, -1.7, -2.5], [5.2, -1.2, -2.9]]) {
    const s0 = new THREE.Vector3(0, 6.3, -1.1);
    const p = a.clone().addScaledVector(dir, 1.2 + (y > 5.5 ? 0 : 0.8));
    b.rod(s0.clone().add(new THREE.Vector3(0, 0.2, 0.2)), p.clone().add(new THREE.Vector3(0, -0.1, 0)), 0.06, P.woodDark, { bone });
    b.rod(new THREE.Vector3(0, 6.2, -0.5), p.clone().add(new THREE.Vector3(0, -0.1, 0)), 0.06, P.woodDark, { bone });
    break;
  }

  // capstan wheel at the end, horizontal
  const w = [0, 1.2, -4.2];
  part(cyl(0.06, 0.06, 0.5, 6), P.iron, w);
  part(new THREE.TorusGeometry(0.4, 0.06, 6, 14), P.woodDark, w, { rotation: [90, 0, 0] });
  for (let i = 0; i < 4; i++) {
    part(box(0.8, 0.07, 0.07), P.woodLight, w, { rotation: [0, i * 45, 0] });
  }
  part(new THREE.TorusGeometry(0.34, 0.03, 5, 14), P.rope, [0, 1.2, -4.2], { rotation: [90, 0, 0] });
  part(cyl(0.12, 0.12, 0.3, 8), P.woodDark, [0, 1.2, -4.2]);
  void frame; void R; void M; void hz;
}
```

<!-- call: gallery -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildGallery({ b, J, P, M }: Ctx) {
  const bone = J.tower;
  const R = rng(11);
  const A = (y: number) => 2.3 - 0.1316 * (y - 0.5);
  const part = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at, flat: true, ...o });
  const box = (w: number, h: number, d: number, c: string, at: number[], o: any = {}) =>
    part(new THREE.BoxGeometry(w, h, d), c, at, o);
  // rod between two points
  const rod = (a: number[], c2: number[], w: number, c: string) => {
    const dx = c2[0] - a[0], dy = c2[1] - a[1], dz = c2[2] - a[2];
    const len = Math.hypot(dx, dy, dz);
    part(new THREE.BoxGeometry(w, len, w), c, [(a[0] + c2[0]) / 2, (a[1] + c2[1]) / 2, (a[2] + c2[2]) / 2], {
      dir: [dx, dy, dz],
    });
  };

  // floor ring: octagonal lathe, flat faces on axes
  const prof: [number, number][] = [[1.95, 0], [3.0, 0], [3.0, 0.15], [1.95, 0.15]];
  const apo = (r: number) => r / Math.cos(Math.PI / 8);
  b.lathe(prof.map(([x, y]) => [apo(x), y] as [number, number]), {
    at: [0, 2.9, 0], segments: 8, spin: 22.5, color: P.wood, bone,
  });
  // dark rim band
  b.lathe([[apo(2.96), 0], [apo(3.04), 0], [apo(3.04), 0.15], [apo(2.96), 0.15]], {
    at: [0, 2.9, 0], segments: 8, spin: 22.5, color: P.woodDark, bone,
  });
  // plank seams on top (radial thin strips)
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + 0.2;
    const r = 2.5;
    box(0.04, 0.02, 1.0, P.woodDark, [Math.sin(a) * r, 3.055, Math.cos(a) * r], { rotation: [0, (a * 180) / Math.PI, 0] });
  }
  // brackets
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const s = Math.sin(a), c = Math.cos(a);
    rod([s * A(2.1), 2.1, c * A(2.1)], [s * 2.75, 2.9, c * 2.75], 0.12, P.woodDark);
  }
  // railing
  const rr = apo(2.9);
  const corners: number[][] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    corners.push([Math.sin(a) * rr, Math.cos(a) * rr]);
  }
  const posts: number[][] = [];
  for (let i = 0; i < 8; i++) {
    const p = corners[i], q = corners[(i + 1) % 8];
    posts.push(p, [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]);
  }
  const gate = (x: number, z: number) => x > 2.5 && z > -0.1 && z < 0.7;
  for (const [x, z] of posts) {
    if (gate(x, z) && Math.abs(z - 0.3) < 0.35 && false) continue;
    box(0.12, 0.9, 0.12, P.woodLight, [x, 3.5, z]);
    box(0.16, 0.06, 0.16, P.brass, [x, 3.98, z]);
  }
  for (let i = 0; i < 8; i++) {
    const p = corners[i], q = corners[(i + 1) % 8];
    for (const y of [3.9, 3.5]) {
      const segs = [[p, q]];
      // split edge at +X face for the gate
      if (i === 1 || i === 2 || (p[0] > 2.5 && q[0] > 2.5)) {
        const lo = [p[0], p[1]], hi = [q[0], q[1]];
        const a = p[1] < q[1] ? lo : hi, c = p[1] < q[1] ? hi : lo;
        const ga = [a[0], -0.1], gb = [a[0], 0.7];
        segs.length = 0;
        segs.push([a, ga], [gb, c]);
      }
      for (const [u, v] of segs) rod([u[0], y, u[1]], [v[0], y, v[1]], 0.1, P.wood);
    }
  }

  // gallery door on +X wall
  const wx = A(3.7);
  box(0.1, 1.4, 0.95, P.woodDark, [wx + 0.01, 3.75, 0]);
  box(0.1, 1.25, 0.8, P.doorRed, [wx + 0.06, 3.7, 0]);
  part(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 8, 1, false, 0, Math.PI), P.plaster, [wx + 0.04, 4.4, 0], {
    rotation: [0, 0, 90],
  });
  part(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 8, 1, false, 0, Math.PI), P.doorRedDark, [wx + 0.09, 4.4, 0], {
    rotation: [0, 0, 90],
  });
  box(0.04, 1.1, 0.03, P.doorRedDark, [wx + 0.13, 3.7, 0]);
  part(new THREE.SphereGeometry(0.05, 6, 4), P.brass, [wx + 0.14, 3.65, 0.28]);

  // stairs
  const N = 12, z0 = 3.2, z1 = 0.3, sx = 3.45;
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N;
    const z = z0 + (z1 - z0) * t;
    const h = (3 * (i + 1)) / N;
    box(0.9, 0.08, 0.3, P.woodLight, [sx, h - 0.04, z]);
    box(0.84, 3 / N, 0.05, P.wood, [sx, h - 3 / N / 2 - 0.04, z + 0.13]);
  }
  for (const s of [-1, 1]) {
    rod([sx + s * 0.47, 0.05, 3.2], [sx + s * 0.47, 2.95, 0.3], 0.1, P.woodDark);
  }
  // outer railing
  for (let i = 0; i <= 5; i++) {
    const t = i / 5;
    const z = z0 + (z1 - z0) * t, y = 3 * t;
    box(0.12, 0.9, 0.12, P.woodLight, [3.9, y + 0.5, z]);
    box(0.16, 0.06, 0.16, P.brass, [3.9, y + 0.98, z]);
  }
  rod([3.9, 1.0, 3.2], [3.9, 4.0, 0.3], 0.1, P.wood);
  rod([3.9, 0.6, 3.2], [3.9, 3.6, 0.3], 0.08, P.wood);
  // stone feet
  for (const s of [-1, 1]) box(0.3, 0.2, 0.4, P.stone, [sx + s * 0.47, 0.08, 3.1]);

  // lanterns
  const lantern = (x: number, y: number, z: number) => {
    box(0.03, 0.2, 0.03, P.iron, [x, y + 0.3, z]);
    part(new THREE.CylinderGeometry(0.13, 0.19, 0.1, 6), P.iron, [x, y + 0.2, z]);
    glow(box(0.22, 0.22, 0.22, P.lanternGlow, [x, y, z]), 1.5);
    part(new THREE.TorusGeometry(0.07, 0.02, 4, 8), P.brass, [x, y + 0.38, z]);
    box(0.26, 0.04, 0.26, P.iron, [x, y - 0.13, z]);
  };
  for (const s of [-1, 1]) lantern(s * 1.1, 3.55, corners[0][1] > 0 ? 2.95 : 2.95);
  lantern(3.9, 1.0 + 0.0, 3.35 - 0.1);

  // rope coil and hook near back
  for (let i = 0; i < 4; i++)
    part(new THREE.TorusGeometry(0.16, 0.04, 5, 10), P.rope, [-0.4, 3.12 + i * 0.07, -2.75], {
      rotation: [90, 0, 0],
    });
  box(0.05, 0.05, 0.14, P.woodDark, [0.2, 3.7, -2.95 - 0.0]);
  void R; void frame; void M;
}
```

<!-- call: openings -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildOpenings({ b, J, P, M }: any) {
  const bone = J.tower;
  const A = (y: number) => 2.3 - 0.1316 * (y - 0.5);
  // Generic box helper: size, center, color, optional rotation about Y
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: string, ry = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], rotation: [0, ry, 0] });
  const cyl = (r: number, h: number, x: number, y: number, z: number, c: string, seg = 10, rot: number[] = [0, 0, 0], sx = 1, sz = 1) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { bone, at: [x, y, z], rotation: rot, scale: [sx, 1, sz] });
  const sph = (r: number, x: number, y: number, z: number, c: string, sc: number[] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { bone, at: [x, y, z], scale: sc });

  // ---- Door (front) ----
  const dz = A(1.5) + 0.01;
  box(1.3, 1.2, 0.14, 0, 1.1, dz + 0.05, P.plaster);
  cyl(0.65, 0.14, 0, 1.7, dz + 0.05, P.plaster, 14, [90, 0, 0]);
  box(1.0, 1.15, 0.1, 0, 1.075, dz + 0.12, P.doorRedDark);
  cyl(0.5, 0.1, 0, 1.65, dz + 0.12, P.doorRedDark, 14, [90, 0, 0]);
  for (const s of [1, -1]) {
    box(0.47, 1.15, 0.06, s * 0.255, 1.075, dz + 0.17, P.doorRed);
    cyl(0.235, 0.06, s * 0.255, 1.65, dz + 0.17, P.doorRed, 10, [90, 0, 0], 1, 1);
    for (const px of [0.12, 0.38]) box(0.025, 1.5, 0.02, s * px, 1.1, dz + 0.21, P.doorRedDark);
    box(0.4, 0.07, 0.03, s * 0.25, 0.6, dz + 0.21, P.iron);
    box(0.4, 0.07, 0.03, s * 0.25, 1.5, dz + 0.21, P.iron);
    sph(0.05, s * 0.1, 1.05, dz + 0.22, P.brass);
  }
  box(1.6, 0.14, 0.7, 0, 0.57, dz + 0.4, P.stone);
  box(1.8, 0.1, 0.8, 0, 2.62, dz + 0.45, P.woodLight);
  box(1.8, 0.04, 0.05, 0, 2.58, dz + 0.85, P.woodDark);
  for (const s of [1, -1]) box(0.1, 0.9, 0.1, s * 0.82, 2.15, dz + 0.78, P.woodDark);

  // ---- Windows ----
  const flowerBox = (x: number, y: number, z: number, ry: number) => {
    const g = new THREE.Group();
    const f = (lx: number, ly: number, lz: number, w: number, h: number, d: number, c: string) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: c }));
      m.position.set(lx, ly, lz);
      g.add(m);
    };
    f(0, 0, 0, 0.8, 0.2, 0.25, P.woodDark);
    [-0.28, -0.1, 0.1, 0.28].forEach((lx, i) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), new THREE.MeshStandardMaterial({ color: i % 2 ? P.flowerYellow : P.flowerPink }));
      m.position.set(lx, 0.15, 0.02);
      g.add(m);
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), new THREE.MeshStandardMaterial({ color: P.leaf }));
      l.position.set(lx + 0.05, 0.1, 0.1);
      g.add(l);
    });
    g.position.set(x, y, z);
    g.rotation.y = ry;
    bone.add ? bone.add(g) : bone.object.add(g);
  };
  // Window in local frame: rotated about Y to face outward (ry), at wall point
  const win = (cx: number, cy: number, cz: number, ry: number, round = false) => {
    const c = Math.cos(ry), s = Math.sin(ry);
    const P3 = (lx: number, ly: number, lz: number) => [cx + lx * c + lz * s, cy + ly, cz - lx * s + lz * c];
    const bx = (w: number, h: number, d: number, lx: number, ly: number, lz: number, col: string) =>
      b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at: P3(lx, ly, lz), rotation: [0, (ry * 180) / Math.PI, 0] });
    if (round) {
      const rot = [90, (ry * 180) / Math.PI, 0];
      b.part(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 12), P.plaster, { bone, at: P3(0, 0, 0.04), rotation: [0, 0, 0], dir: [Math.sin(ry), 0, Math.cos(ry)] });
      glow(b.part(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 12), P.glass, { bone, at: P3(0, 0, 0.09), dir: [Math.sin(ry), 0, Math.cos(ry)] }), 0.4);
      void rot;
    } else {
      bx(0.7, 0.9, 0.1, 0, 0, 0.04, P.plaster);
      glow(bx(0.5, 0.7, 0.06, 0, 0, 0.1, P.glass), 0.4);
      bx(0.2, 0.2, 0.02, -0.1, 0.18, 0.14, P.glassLight);
    }
    bx(0.06, 0.74, 0.04, 0, 0, 0.14, P.woodDark);
    bx(0.54, 0.06, 0.04, 0, 0, 0.14, P.woodDark);
    for (const sd of [1, -1]) {
      bx(0.3, 0.8, 0.07, sd * 0.5, 0, 0.12, P.shutterTeal);
      bx(0.1, 0.14, 0.02, sd * 0.5, 0.1, 0.17, P.plaster);
      bx(0.1, 0.14, 0.02, sd * 0.5, 0.1, 0.17, P.plaster);
    }
    const [fx, fy, fz] = P3(0, -0.55, 0.2);
    flowerBox(fx, fy, fz, ry);
  };
  win(-0.75, 4.9, A(4.9) + 0.01, 0);
  win(0.75, 4.9, A(4.9) + 0.01, 0);
  win(0, 5.7, A(5.7) + 0.01, 0, true);
  win(A(1.4) + 0.01, 1.4, 0, Math.PI / 2);
  win(-A(1.4) - 0.01, 1.4, 0, -Math.PI / 2);
  win(0, 4.8, -A(4.8) - 0.01, Math.PI);

  // ---- Sign ----
  const sx = -1.35, sy = 2.1;
  box(0.1, 0.1, 0.5, sx, sy + 0.5, 2.3, P.woodDark);
  box(0.5, 0.35, 0.06, sx, sy + 0.1, 2.5, P.wood);
  cyl(0.1, 0.04, sx, sy + 0.1, 2.54, P.brass, 8, [90, 0, 0]);
  box(0.05, 0.2, 0.04, sx, sy + 0.1, 2.56, P.plaster);
  box(0.2, 0.05, 0.04, sx, sy + 0.1, 2.56, P.plaster);

  // ---- Barrels ----
  for (const [x, z] of [[-1.45, 2.9], [-1.9, 2.5]]) {
    cyl(0.3, 0.7, x, 0.35, z, P.wood, 10);
    for (const y of [0.15, 0.55]) cyl(0.32, 0.06, x, y, z, P.woodDark, 10);
    cyl(0.28, 0.04, x, 0.71, z, P.woodLight, 10);
  }
  // ---- Sacks ----
  for (const [x, z] of [[1.35, 2.8], [1.8, 2.55]]) {
    sph(0.36, x, 0.36, z, P.sack, [1, 1, 1]);
    cyl(0.12, 0.16, x, 0.76, z, P.sack, 8);
    cyl(0.14, 0.04, x, 0.7, z, P.rope, 8);
  }
  // ---- Potted tulip ----
  cyl(0.12, 0.2, 0.9, 0.1, 2.9, P.brick, 8);
  cyl(0.015, 0.3, 0.9, 0.35, 2.9, P.leafDark, 5);
  sph(0.07, 0.9, 0.52, 2.9, P.flowerPink, [1, 1.3, 1]);
}
```