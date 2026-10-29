<!-- call: plan -->

```json
{
  "name": "Polar Dusk Outpost",
  "description": "A Firewatch-style diorama of a red-timbered arctic research station on stilts, with a radome, wind turbine, weather mast and a snowmobile yard, under a flat layered sunset of purple ridges and a huge orange sun.",
  "builderName": "arcticResearchOutpost",
  "size": [7.2, 5.0, 7.2],
  "layout": "A square snow-slab diorama 7.2 x 7.2 m, with ground at y=0.4 (drifts up to 0.45). A flat sunset backdrop wall stands along the back edge (z -3.6 to -2.95), 5.0 m tall. It is made of stacked horizontal sky bands (purple at the top, magenta, then coral at the horizon), a huge sun disc with 2 translucent-looking halo rings in flat warm colours, 3 layered ridge silhouettes (far pink, mid plum, near dark violet, each a thin extrude at a slightly different z) and a few flat aurora ribbons in iceBlue. The hero is the main cabin at the centre (x -1.9..1.9, z -1.4..1.9): a long red timber lab cabin on 8 short stilts, deck at y=0.95, with the porch and door on the FRONT (+Z). It has cream window frames with glowing windows, a dark pitched roof ridge running along X (ridge y~3.0), a stove chimney with a smoke puff, and an outdoor stair down to the snow. Behind it (z -2.9..-1.5) stand the instruments: a white-and-cream radome on a short lattice tower at the left (x -2.3), a wind turbine at the right (x 2.4, hub y 3.4, rotor facing +Z), and a tall weather mast at x 0.2 with an anemometer on top and a small solar panel rack beside it. The yard (z in front, plus left and right sides, outside the cabin box) holds a snowmobile and sled on the left (x ~ -2.6, z 0.6), a crate-and-fuel-drum stack on the right (x ~ 2.6, z 0.3), and on the front zone a flag pole, an ice-core rack and an orange survey tent. A frozen pond sits front right (x 1.5..3.2, z 1.8..3.3) and belongs to the base. STYLE (Firewatch flat colour): no gradients and no noise. Every shape is a bold flat colour with chunky blocky silhouettes. Light faces are warm (snowLit, pink-cream), shaded undersides and snow shadows are cool violet (snowShadow, snowDeep), and every object has a small dark violet-ink underside or outline strip where it meets the ground. Keep shapes simple and add detail as small flat-colour parts (window panes, plank seams, rivets, stripes). Use warm sunset hues everywhere and no pure white or pure black.",
  "palette": {
    "skyTop": "#2b1d4a",
    "skyMid": "#8a3b6e",
    "skyGlow": "#e8604c",
    "sunOrange": "#ff9a3c",
    "sunYellow": "#ffd37a",
    "ridgeFar": "#c4506a",
    "ridgeMid": "#7a3a6a",
    "ridgeNear": "#3e2a5c",
    "snowLit": "#fbe3d4",
    "snowShadow": "#b9a3c9",
    "snowDeep": "#8b7bb0",
    "iceBlue": "#7fc4d9",
    "iceDark": "#3f7f9c",
    "rock": "#5a4258",
    "cabinRed": "#c8402f",
    "cabinDark": "#8f2b2a",
    "trimCream": "#f4d9a8",
    "wood": "#7a4a32",
    "woodDark": "#4a2c26",
    "roofDark": "#3a2a40",
    "windowGlow": "#ffc65a",
    "metal": "#6b6275",
    "metalLight": "#a89bb0",
    "ink": "#261a2e"
  },
  "mounts": {
    "ground": [0, 0.4, 0],
    "cabinCenter": [0, 0.95, 0.25],
    "cabinDeck": [0, 0.95, 0.25],
    "porchEdge": [0.6, 0.95, 1.9],
    "doorCenter": [0.6, 1.65, 0.7],
    "stairFoot": [0.6, 0.4, 2.7],
    "roofRidge": [0, 3.0, -0.35],
    "chimneyTop": [-1.0, 3.5, -0.6],
    "radomeBase": [-2.3, 0.4, -2.3],
    "turbineBase": [2.4, 0.4, -2.2],
    "turbineHub": [2.4, 3.4, -1.95],
    "mastBase": [0.2, 0.4, -2.4],
    "mastTop": [0.2, 4.5, -2.4],
    "snowmobilePad": [-2.6, 0.4, 0.6],
    "cratePad": [2.6, 0.4, 0.3],
    "flagPad": [-0.9, 0.4, 3.0],
    "tentPad": [-2.3, 0.4, 2.7],
    "pondCenter": [2.35, 0.4, 2.55],
    "backdropFront": [0, 0.4, -2.95],
    "sunCenter": [1.2, 3.3, -3.45]
  },
  "joints": [
    { "name": "outpost", "at": [0, 0.4, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "turbineRotor", "parent": "outpost", "at": [2.4, 3.4, -1.95], "dir": [0, 0, 1], "role": "hinge", "group": "instruments" },
    { "name": "anemometer", "parent": "outpost", "at": [0.2, 4.5, -2.4], "dir": [0, 1, 0], "role": "hinge", "group": "instruments" }
  ],
  "parts": [
    {
      "id": "snowBase",
      "builds": "The diorama slab: a chunky low-poly snow plinth, 7.2 x 7.2 m, top at y=0.4 with a darker snowShadow/snowDeep side skirt and a thin ink strip at the bottom, and ice-blue strata lines on the sides. On top: a few soft flat drift mounds (snowLit tops, snowShadow lee sides, up to y 0.45) kept away from the cabin footprint, a frozen pond (iceBlue disc with an iceDark rim, pale crack lines and a small round fishing hole) at the mount pondCenter, a trampled path of snowShadow flat strips from stairFoot to the front edge with small footprint ovals, and sled-track lines to the snowmobile pad. Add a few angular rocks (rock with snowLit caps) at the edges and corners, and 2-3 small ice crystals. Leave the areas for the cabin, yard objects and instrument bases free. It owns nothing above y 0.5.",
      "box": [[-3.6, 0, -3.6], [3.6, 0.5, 3.6]],
      "attaches": "Top surface at the mount ground (y 0.4). Every other part rests on it. The backdrop starts at backdropFront z -2.95.",
      "joints": ["outpost"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "mainCabin",
      "builds": "The hero research cabin facing +Z, built as a blocky puppet: 8 woodDark/wood stilts from ground to the deck at y 0.95, with cross-braces and snowLit drifts at their feet; a deck slab; cabinRed walls (x -1.7..1.7, z -1.3..0.7, y 0.95..2.35) with darker cabinDark plank seam strips and corner posts; trimCream window frames with windowGlow panes (3 on the front, 2 on each side, 2 on the back, each pane with a thin cross muntin) and small awning slabs; a porch deck (z 0.7..1.9, x -0.2..1.5) with a railing (wood posts and rail), a front door at doorCenter (wood, with a round window, a cream frame and a small lantern in windowGlow), an outdoor stair of 6 steps from porchEdge down to stairFoot with two stringers, and a snow stripe on each tread; a dark roofDark pitched roof (ridge y 3.0, along X) with overhanging eaves, a trimCream fascia, snowLit snow caps on the upper roof with chunky drip edges, a stove chimney (metal with a rock-cap, at x -1.0) with 2 flat smoke puffs of snowShadow and snowLit rising to y 3.9, a small red-and-cream sign board over the door reading a simple glyph, a side vent box and a stack of firewood (wood logs with trimCream ends) on the left side wall, and a small generator shed attached to the right wall (cabinDark, with a metal pipe). Bright windowGlow sparkle, an ink-coloured shadow band under the eaves.",
      "box": [[-1.9, 0.4, -1.4], [1.9, 3.9, 1.9]],
      "attaches": "Stilts stand on the ground mount (y 0.4). The stair foot ends at stairFoot [0.6, 0.4, 2.7], which lies just outside the box; the path from the base starts there. Keep clear of the instruments at z < -1.5.",
      "joints": ["outpost"],
      "floor": false,
      "budget": 230
    },
    {
      "id": "instrumentField",
      "builds": "The scientific gear behind the cabin, z -2.9..-1.5. (1) A radome at radomeBase: a three-legged metal lattice tower (metalLight, with cross-braces) about 1.4 m tall carrying a faceted trimCream/snowLit dome (about 0.9 m across, from a low-poly sphere) with panel seam lines in snowShadow, a red beacon light and a small hatch; the dome centre is near y 2.4. (2) A wind turbine at turbineBase: a tapered white-cream tower to the hub at turbineHub [2.4, 3.4, -1.95], a nacelle box with a cabinRed nose cone, and three tapered blades, 1.0 m long, on the joint turbineRotor (rigged to the joint, facing +Z, blades at 0, 120 and 240 degrees, with a sunOrange tip stripe on each) — the hub and blades ride the joint turbineRotor. (3) A weather mast at mastBase: a thin metal pole up to y 4.5 with 2 cross-arms, guy wires (thin ink rods) anchored in the snow, a small instrument box, and an anemometer on top riding the joint anemometer (3 cups on arms, sunOrange cups). (4) A solar panel rack at x 0.9..1.7, with 2 tilted iceDark panels with lighter grid lines and a metal frame on legs, tilted to face +Z. (5) A little Stevenson-screen weather box (trimCream louvers, wood legs) near x -0.9. Add snow drifts piled at all bases and a thin ink-coloured cable run from the mast base towards the cabin back wall, ending at (0, 1.1, -1.4).",
      "box": [[-3.2, 0.4, -2.9], [3.2, 4.6, -1.5]],
      "attaches": "Bases stand on the ground mount (y 0.4) at radomeBase, mastBase and turbineBase. Its cable ends at the back wall of the mainCabin (z -1.4). The backdrop is behind at z < -2.95.",
      "joints": ["outpost", "turbineRotor", "anemometer"],
      "floor": false,
      "budget": 210
    },
    {
      "id": "yardGear",
      "builds": "Everything staged around the cabin outside the cabin box (x -1.9..1.9, z -1.4..1.9), and out of the pond (x 1.5..3.2, z 1.8..3.3), in blocky puppet style. (1) A snowmobile at snowmobilePad, facing +Z: a cabinRed body, a black-ink seat, a trimCream windscreen, a headlight in windowGlow, ski runners (metal) front and a track block rear with snow-capped tread details, and a sunOrange stripe; behind it a wooden sled (wood, woodDark runners) carrying a tarp-covered load (sunOrange tarp, with rope lines) and two small boxes. (2) A stack of cargo at cratePad: 5 wooden crates (wood with woodDark slats and a stencilled trimCream glyph) stacked in a pyramid, with 3 fuel drums (sunOrange and cabinDark, with ink bands, metal lids and bungs) beside them and a snow cap on top. (3) In front: a flag pole at flagPad (metal pole, a cabinRed flag with a trimCream stripe, flat but a few facets tall), an ice-core rack (a wood A-frame with 6 horizontal iceBlue core tubes) near x 0.2, z 2.8, and an orange survey tent at tentPad (a sunOrange low pyramid or dome with trimCream guy lines, a dark door flap and snow skirts). Add a pair of skis and poles leaning against the cabin front-left stair rail (outside the cabin box, so near x -2.1, z 1.9), and a lone ice axe in a snowdrift. All objects get a small snowShadow drift at the base.",
      "box": [[-3.4, 0.4, -1.0], [3.4, 1.9, 3.4]],
      "attaches": "All items rest on the ground mount (y 0.4) at their named pads. Keep clear of the pond region (x 1.5..3.2, z 1.8..3.3), the path from stairFoot, and the cabin box.",
      "joints": ["outpost"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "sunsetBackdrop",
      "builds": "A flat sunset diorama wall along the back edge (z -3.6..-2.95, x -3.6..3.6, standing on the base from y 0.4 to 5.0), built from thin extrudes or slabs in a stack of z layers. Layer 1 (z ~ -3.55): sky bands as full-width horizontal strips: skyTop at the top, then skyMid, then skyGlow at the horizon, with a thin sunOrange band right above the ridges. Layer 2: a huge sun disc at sunCenter [1.2, 3.3, -3.45], radius about 0.75, in sunYellow with a sunOrange ring and 2 larger halo rings (skyGlow tones, flat) behind it, and a few thin flat horizontal cloud streaks in ridgeFar and skyMid across the sky. Layer 3: aurora ribbons, 2-3 wavy thin extruded bands in iceBlue and trimCream near the top. Layer 4: far ridge silhouette (ridgeFar, jagged peaks up to y 2.8) at z -3.4. Layer 5: mid ridge (ridgeMid, peaks up to y 2.2) at z -3.3 with snowLit snow-cap triangles on peaks. Layer 6: near ridge (ridgeNear, peaks up to y 1.5) at z -3.15 with a few tiny snowLit highlights on the sunward slopes. Frame the wall with a thin ink-coloured border (a flat box frame around the edge, 0.08 m) so it reads like a stage flat, plus two rear brace struts at the back. All pieces are flat-coloured, tall angular silhouettes with sharp peaks. The sun and ridges must not intrude on z > -2.95, so leave the instrument zone free.",
      "box": [[-3.6, 0.4, -3.6], [3.6, 5.0, -2.95]],
      "attaches": "Stands on the base's back edge at y 0.4. Its front face is at backdropFront z -2.95. The mast top (y 4.5) and turbine blades (up to y 4.4) stand in front of it.",
      "joints": ["outpost"],
      "floor": false,
      "budget": 110
    }
  ]
}
```

<!-- call: sunsetBackdrop -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildSunsetBackdrop({ b, J, P, M }: Ctx) {
  const bone = J.outpost;
  const X: [number, number, number] = [1, 0, 0];
  const slab = (
    outline: [number, number][],
    z: number,
    th: number,
    color: string,
    ox = 0,
    oy = 0,
  ) =>
    b.extrude(outline, {
      at: [ox, oy, z],
      x: X,
      thickness: th,
      color,
      bone,
    });
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], bone });

  // Layer 1: sky bands (y 0.4..5.0)
  const bands: [number, number, string][] = [
    [0.4, 1.4, P.skyGlow],
    [1.4, 1.5, P.sunOrange],
    [1.5, 2.6, P.skyGlow],
    [2.6, 3.8, P.skyMid],
    [3.8, 5.0, P.skyTop],
  ];
  for (const [y0, y1, c] of bands) box(7.2, y1 - y0, 0.06, c, 0, (y0 + y1) / 2, -3.55);

  // Layer 2: sun and halos
  const [sx, sy] = [M.sunCenter[0], M.sunCenter[1]];
  const disc = (r: number, c: string, z: number, seg = 28) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.03, seg), c, {
      at: [sx, sy, z],
      dir: [0, 0, 1],
      bone,
    });
  disc(1.55, P.skyMid, -3.5);
  disc(1.2, P.skyGlow, -3.48);
  disc(0.9, P.sunOrange, -3.46);
  disc(0.75, P.sunOrange, -3.45);
  disc(0.64, P.sunYellow, -3.43);

  // clouds
  const clouds: [number, number, number, number, string][] = [
    [-2.3, 3.1, 1.4, 0.07, P.ridgeFar],
    [-1.6, 2.7, 1.9, 0.06, P.skyMid],
    [2.4, 2.4, 1.3, 0.06, P.ridgeFar],
    [-0.4, 3.6, 1.0, 0.05, P.ridgeFar],
    [2.5, 3.9, 1.1, 0.05, P.skyMid],
  ];
  for (const [x, y, w, h, c] of clouds) box(w, h, 0.03, c, x, y, -3.5);

  // Layer 3: aurora ribbons
  const ribbon = (y: number, amp: number, c: string, z: number) => {
    const top: [number, number][] = [];
    const bot: [number, number][] = [];
    for (let i = 0; i <= 12; i++) {
      const x = -3.4 + (6.8 * i) / 12;
      const w = y + Math.sin(i * 0.8) * amp;
      top.push([x, w + 0.08]);
      bot.push([x, w - 0.08]);
    }
    slab([...top, ...bot.reverse()], z, 0.03, c);
  };
  ribbon(4.4, 0.15, P.iceBlue, -3.52);
  ribbon(4.1, 0.12, P.trimCream, -3.51);
  ribbon(4.7, 0.1, P.iceBlue, -3.5);

  // Ridges
  const ridge = (
    peaks: [number, number][],
    z: number,
    c: string,
    th: number,
  ) => {
    const o: [number, number, "sharp"?][] = [[-3.5, 0.4]];
    for (const [x, y] of peaks) o.push([x, y, "sharp"]);
    o.push([3.5, 0.4]);
    slab(o as [number, number][], z, th, c);
  };
  const far: [number, number][] = [[-3.5, 1.6], [-2.8, 2.5], [-2.2, 1.7], [-1.4, 2.8], [-0.6, 1.8], [0.4, 2.4], [1.4, 1.7], [2.3, 2.7], [3.0, 1.9], [3.5, 2.2]];
  const mid: [number, number][] = [[-3.5, 1.3], [-2.5, 2.1], [-1.7, 1.2], [-0.8, 2.2], [0.2, 1.3], [1.2, 2.0], [2.2, 1.2], [3.0, 1.9], [3.5, 1.4]];
  const near: [number, number][] = [[-3.5, 1.0], [-2.7, 1.5], [-1.8, 0.9], [-0.9, 1.4], [0.1, 0.8], [1.0, 1.4], [2.0, 0.9], [2.9, 1.5], [3.5, 1.0]];
  ridge(far, -3.4, P.ridgeFar, 0.06);
  ridge(mid, -3.3, P.ridgeMid, 0.06);
  ridge(near, -3.15, P.ridgeNear, 0.08);

  // snow caps on mid peaks
  for (const [x, y] of mid.filter((p) => p[1] > 1.9))
    slab([[-0.2, -0.32], [0, 0, ] as any, [0.2, -0.32], [0.08, -0.22], [-0.08, -0.38]].slice(0, 3) as [number, number][], -3.27, 0.03, P.snowLit, x, y);
  // highlights on near ridge sunward slopes
  for (const [x, y] of near.filter((p) => p[1] > 1.3))
    slab([[0, 0], [0.14, -0.2], [0.02, -0.2]], -3.1, 0.03, P.snowLit, x - 0.02, y - 0.02);

  // Frame
  const f = 0.08;
  box(7.2, f, 0.12, P.ink, 0, 5.0 - f / 2, -3.5);
  box(7.2, f, 0.12, P.ink, 0, 0.4 + f / 2, -3.5);
  box(f, 4.6, 0.12, P.ink, -3.6 + f / 2, 2.7, -3.5);
  box(f, 4.6, 0.12, P.ink, 3.6 - f / 2, 2.7, -3.5);

  // Rear braces
  for (const s of [-1, 1]) {
    b.rod([s * 2.6, 0.4, -3.95], [s * 2.6, 3.6, -3.6], 0.05, P.woodDark, { bone });
    box(0.3, 0.05, 0.4, P.ink, s * 2.6, 0.42, -3.85);
  }
}
```

<!-- call: snowBase -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildSnowBase({ b, J, P, M }: Ctx) {
  const bone = J.outpost;
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], rotation: [0, ry, 0] });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at: [x, y, z] });

  // plinth
  box(7.2, 0.36, 7.2, P.snowDeep, 0, 0.18, 0);
  box(7.2, 0.04, 7.2, P.ink, 0, 0.02, 0);
  box(7.2, 0.1, 7.2, P.snowShadow, 0, 0.35, 0);
  // strata lines on sides
  for (const y of [0.14, 0.26]) {
    box(7.22, 0.018, 7.22 - 0.0, P.iceBlue, 0, y, 0).scale.set(1, 1, 0.9999);
  }
  // top slab
  box(7.2, 0.05, 7.2, P.snowLit, 0, 0.375, 0);
  // fix strata so they read: shallow slices
  for (const [x, z, w] of [[-1.5, 3.605, 1.6], [1.8, 3.605, 1.2], [3.605, -1, 1.4]] as number[][]) {
    if (x > 3) box(0.01, 0.03, w, P.iceBlue, x, 0.2, z);
    else box(w, 0.03, 0.01, P.iceBlue, x, 0.2, z);
  }

  // drifts (away from cabin)
  const drifts: [number, number, number, number][] = [
    [-3.0, 1.9, 0.7, 0.3], [3.0, -0.8, 0.6, 0.4], [-3.0, -1.6, 0.8, 0.3],
    [0.2, 3.2, 0.5, 0.5], [3.0, -2.5, 0.5, 0.3], [-1.6, 3.2, 0.5, 0.3],
  ];
  for (const [x, z, r, s] of drifts) {
    const g = new THREE.CylinderGeometry(r * 0.7, r, 0.07, 7);
    b.part(g, P.snowShadow, { bone, at: [x + 0.06, 0.41, z + 0.05], flat: true });
    b.part(new THREE.CylinderGeometry(r * 0.5, r * 0.75, 0.06, 7), P.snowLit, { bone, at: [x, 0.43, z], flat: true });
  }

  // pond
  const [px, , pz] = M.pondCenter;
  cyl(0.88, 0.9, 0.04, 14, P.iceDark, px, 0.405, pz);
  cyl(0.78, 0.78, 0.04, 14, P.iceBlue, px, 0.415, pz);
  for (const [dx, dz, w, a] of [[-0.2, 0.1, 0.9, 20], [0.2, -0.3, 0.6, -50], [0.3, 0.35, 0.5, 70]] as number[][])
    box(w, 0.01, 0.025, P.trimCream, px + dx, 0.438, pz + dz, a * Math.PI / 180);
  cyl(0.12, 0.12, 0.02, 10, P.iceDark, px - 0.25, 0.44, pz - 0.3);
  cyl(0.08, 0.08, 0.02, 10, P.ink, px - 0.25, 0.45, pz - 0.3);

  // path stairFoot to front edge
  const [sx, , sz] = M.stairFoot;
  for (let i = 0; i < 4; i++) box(0.5, 0.02, 0.28, P.snowShadow, sx + (i % 2) * 0.05, 0.405, sz + 0.15 + i * 0.2);
  for (let i = 0; i < 5; i++) {
    const s = i % 2 ? 1 : -1;
    const f = b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 8), P.snowDeep, { bone, at: [sx + s * 0.12, 0.42, sz + 0.05 + i * 0.17] });
    f.mesh.scale.set(1, 1, 1.6);
  }
  // sled tracks to snowmobile pad
  const [tx, , tz] = M.snowmobilePad;
  for (const dx of [-0.2, 0.2]) {
    box(0.04, 0.012, 2.4, P.snowDeep, tx + dx, 0.41, tz + 1.2 + 0.9 * 0, 0);
    box(0.04, 0.012, 1.6, P.snowDeep, tx + dx - 0.1, 0.41, tz - 1.6);
  }

  // rocks
  const rocks: [number, number, number][] = [[-3.2, 3.2, 0.3], [3.3, 3.3, 0.25], [-3.3, -2.0, 0.28], [3.3, -3.0, 0.3], [-0.3, 3.4, 0.18]];
  for (const [x, z, r] of rocks) {
    b.part(new THREE.DodecahedronGeometry(r, 0), P.rock, { bone, at: [x, 0.42 + r * 0.4, z], rotation: [R() * 40, R() * 90, 0], flat: true });
    b.part(new THREE.ConeGeometry(r * 0.6, r * 0.35, 5), P.snowLit, { bone, at: [x, 0.42 + r * 0.95, z], flat: true });
  }

  // ice crystals
  for (const [x, z] of [[-3.1, 0.3], [1.0, 3.35], [3.35, 1.0]]) {
    b.part(new THREE.ConeGeometry(0.07, 0.3, 5), P.iceBlue, { bone, at: [x, 0.55, z], flat: true });
    b.part(new THREE.ConeGeometry(0.05, 0.2, 5), P.iceDark, { bone, at: [x + 0.1, 0.5, z + 0.05], rotation: [0, 0, 12], flat: true });
  }
}
```

<!-- call: instrumentField -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildInstrumentField({ b, J, P, M }: any) {
  const root = J.outpost;
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: root, at, ...o });
  const cyl = (r0: number, r1: number, h: number, c: string, at: number[], o: any = {}, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r1, r0, h, seg), c, { bone: root, at, ...o });
  const rod = (a: number[], c2: number[], r: number, c: string, bone: any = root) =>
    b.rod(a, c2, r, c, { bone, sides: 5 });
  const drift = (x: number, z: number, s: number) => {
    b.part(new THREE.SphereGeometry(1, 7, 4), P.snowShadow, { bone: root, at: [x, 0.4, z], scale: [s, s * 0.22, s * 0.8] });
    b.part(new THREE.SphereGeometry(1, 7, 4), P.snowLit, { bone: root, at: [x - 0.03, 0.42, z + 0.03], scale: [s * 0.7, s * 0.16, s * 0.55] });
  };

  // Radome
  const [rx, , rz] = M.radomeBase;
  const legs: number[][] = [];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    const bot = [rx + Math.sin(a) * 0.55, 0.4, rz + Math.cos(a) * 0.55];
    const top = [rx + Math.sin(a) * 0.3, 1.8, rz + Math.cos(a) * 0.3];
    legs.push(bot, top);
    rod(bot, top, 0.025, P.metalLight);
    cyl(0.07, 0.07, 0.03, P.ink, [bot[0], 0.41, bot[2]]);
  }
  for (const y of [0.8, 1.2, 1.6]) {
    const t = (y - 0.4) / 1.4;
    for (let i = 0; i < 3; i++) {
      const a1 = legs[i * 2], b1 = legs[i * 2 + 1];
      const a2 = legs[((i + 1) % 3) * 2], b2 = legs[((i + 1) % 3) * 2 + 1];
      const p1 = [a1[0] + (b1[0] - a1[0]) * t, y, a1[2] + (b1[2] - a1[2]) * t];
      const p2 = [a2[0] + (b2[0] - a2[0]) * t, y, a2[2] + (b2[2] - a2[2]) * t];
      rod(p1, p2, 0.014, P.metal);
    }
  }
  cyl(0.38, 0.38, 0.1, P.metal, [rx, 1.85, rz], {}, 6);
  b.part(new THREE.SphereGeometry(0.45, 8, 6), P.trimCream, { bone: root, at: [rx, 2.4, rz], flat: true });
  b.part(new THREE.SphereGeometry(0.455, 8, 6, 0, Math.PI * 2, 1.2, 0.5), P.snowLit, { bone: root, at: [rx, 2.4, rz], flat: true });
  for (const y of [2.25, 2.5]) b.part(new THREE.TorusGeometry(Math.sqrt(0.2025 - (y - 2.4) ** 2) + 0.004, 0.006, 4, 16), P.snowShadow, { bone: root, at: [rx, y, rz], rotation: [90, 0, 0] });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI;
    b.part(new THREE.BoxGeometry(0.01, 0.9, 0.01), P.snowShadow, { bone: root, at: [rx, 2.4, rz], rotation: [0, (a * 180) / Math.PI, 0] });
  }
  cyl(0.04, 0.04, 0.08, P.cabinRed, [rx, 2.88, rz]);
  b.part(new THREE.SphereGeometry(0.05, 6, 4), P.cabinRed, { bone: root, at: [rx, 2.94, rz] });
  box(0.16, 0.2, 0.03, P.metal, [rx, 2.3, rz + 0.43], { rotation: [-8, 0, 0] });
  box(0.1, 0.14, 0.02, P.snowShadow, [rx, 2.3, rz + 0.45]);
  drift(rx, rz, 0.8);

  // Turbine
  const [tx, , tz] = M.turbineBase;
  const hub = M.turbineHub;
  b.part(new THREE.CylinderGeometry(0.06, 0.13, 3.0, 8), P.trimCream, { bone: root, at: [tx, 1.9, tz] });
  cyl(0.15, 0.15, 0.05, P.ink, [tx, 0.43, tz]);
  box(0.2, 0.2, 0.5, P.snowLit, [tx, 3.4, tz + 0.1]);
  box(0.21, 0.04, 0.5, P.snowShadow, [tx, 3.3, tz + 0.1]);
  b.part(new THREE.ConeGeometry(0.13, 0.2, 8), P.cabinRed, { bone: J.turbineRotor, at: [hub[0], hub[1], hub[2] + 0.1], rotation: [90, 0, 0] });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * 360;
    const ang = (a * Math.PI) / 180;
    const dir = [-Math.sin(ang), Math.cos(ang), 0];
    const base = [hub[0] + dir[0] * 0.1, hub[1] + dir[1] * 0.1, hub[2] + 0.05];
    const tip = [hub[0] + dir[0] * 1.1, hub[1] + dir[1] * 1.1, hub[2] + 0.05];
    const mid = [hub[0] + dir[0] * 0.8, hub[1] + dir[1] * 0.8, hub[2] + 0.05];
    b.rod(base, tip, [0.06, 0.02], P.snowLit, { bone: J.turbineRotor, section: "box" });
    b.rod(mid, tip, [0.05, 0.018], P.sunOrange ?? "#ff9a3c", { bone: J.turbineRotor, section: "box" });
  }
  drift(tx, tz, 0.7);

  // Mast
  const [mx, , mz] = M.mastBase;
  rod([mx, 0.4, mz], [mx, 4.4, mz], 0.03, P.metal);
  for (const y of [3.3, 3.9]) box(0.7, 0.04, 0.04, P.metalLight, [mx, y, mz]);
  box(0.22, 0.2, 0.14, P.trimCream, [mx, 2.4, mz + 0.1]);
  box(0.16, 0.05, 0.02, P.windowGlow, [mx, 2.42, mz + 0.18]);
  for (const [gx, gz] of [[-0.9, -0.2], [0.9, -0.2], [0.1, 0.9]]) {
    rod([mx, 3.6, mz], [mx + gx, 0.42, mz + gz], 0.006, P.ink);
    cyl(0.06, 0.06, 0.04, P.rock, [mx + gx, 0.42, mz + gz]);
  }
  const an = J.anemometer;
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 6), P.metalLight, { bone: an, at: [mx, 4.5, mz] });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const e = [mx + Math.cos(a) * 0.17, 4.55, mz + Math.sin(a) * 0.17];
    b.rod([mx, 4.55, mz], e, 0.01, P.metal, { bone: an, sides: 4 });
    b.part(new THREE.SphereGeometry(0.05, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2 + 0.3), P.sunOrange ?? "#ff9a3c", { bone: an, at: e });
  }
  drift(mx, mz, 0.6);

  // Solar rack
  for (let i = 0; i < 2; i++) {
    const x = 1.1 + i * 0.4;
    box(0.36, 0.03, 0.55, P.metal, [x, 1.0, -2.2], { rotation: [-35, 0, 0] });
    box(0.32, 0.02, 0.5, P.iceDark, [x, 1.01, -2.2], { rotation: [-35, 0, 0] });
    for (const k of [-1, 0, 1]) box(0.005, 0.005, 0.5, P.iceBlue, [x + k * 0.1, 1.025, -2.2], { rotation: [-35, 0, 0] });
    box(0.32, 0.005, 0.005, P.iceBlue, [x, 1.03, -2.2], { rotation: [-35, 0, 0] });
  }
  for (const x of [0.95, 1.55]) {
    rod([x, 0.4, -2.05], [x, 0.9, -2.1], 0.02, P.metal);
    rod([x, 0.4, -2.45], [x, 1.2, -2.35], 0.02, P.metal);
  }
  drift(1.3, -2.2, 0.55);

  // Stevenson screen
  for (const [dx, dz] of [[-0.12, -0.1], [0.12, -0.1], [-0.12, 0.1], [0.12, 0.1]])
    rod([-0.9 + dx, 0.4, -1.9 + dz], [-0.9 + dx, 0.85, -1.9 + dz], 0.015, P.wood);
  box(0.4, 0.3, 0.3, P.trimCream, [-0.9, 1.0, -1.9]);
  box(0.46, 0.04, 0.36, P.snowLit, [-0.9, 1.17, -1.9]);
  for (let i = 0; i < 4; i++) box(0.34, 0.015, 0.01, P.snowShadow, [-0.9, 0.9 + i * 0.06, -1.74]);
  drift(-0.9, -1.9, 0.4);

  // Cable
  b.sweep([[mx, 0.42, mz + 0.05], [0.2, 0.43, -2.0], [0.1, 0.6, -1.6], [0, 1.1, -1.4]], 0.012, { color: P.ink, bone: root });
}
```

<!-- call: mainCabin -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildMainCabin({ b, J, P, M }: Ctx) {
  const bone = J.outpost;
  const R = rng(5);
  // box helper: center x,y,z, size w,h,d
  const box = (c: number[], s: number[], col: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), col, { bone, at: c, ...(rot ? { rotation: rot } : {}) });
  const cyl = (c: number[], r: number, h: number, col: string, seg = 8, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), col, { bone, at: c, ...(rot ? { rotation: rot } : {}) });
  const g = (p: any, s = 1) => glow(p, s);

  const G = 0.4, DECK = 0.95;
  // stilts: 4 x 2
  for (const x of [-1.6, -0.55, 0.55, 1.6]) for (const z of [-1.1, 0.5]) {
    box([x, (G + DECK) / 2, z], [0.14, DECK - G, 0.14], R() > 0.5 ? P.wood : P.woodDark);
    box([x, G + 0.03, z], [0.34, 0.07, 0.34], P.snowLit);
    box([x, G + 0.01, z], [0.4, 0.03, 0.4], P.snowShadow);
  }
  // cross braces
  for (const z of [-1.1, 0.5]) for (const x of [-1.075, 0, 1.075]) {
    const a = x === 0 ? 1.1 : 1.05;
    box([x, 0.67, z + 0.09], [a, 0.06, 0.04], P.woodDark, [0, 0, x === 0 ? 0.4 : -0.4]);
  }
  // deck
  box([0, DECK - 0.06, -0.3], [3.8, 0.12, 2.1], P.woodDark);
  box([0, DECK - 0.14, -0.3], [3.9, 0.04, 2.2], P.ink);
  // walls
  box([0, 1.65, -0.3], [3.4, 1.4, 2.0], P.cabinRed);
  // plank seams on front/back
  for (let i = 0; i < 7; i++) {
    const y = 1.05 + i * 0.2;
    box([0, y + 0.1, 0.705], [3.4, 0.025, 0.012], P.cabinDark);
    box([0, y + 0.1, -1.305], [3.4, 0.025, 0.012], P.cabinDark);
  }
  // corner posts
  for (const x of [-1.72, 1.72]) for (const z of [-1.32, 0.72]) box([x, 1.65, z], [0.1, 1.44, 0.1], P.cabinDark);
  // eave shadow band
  box([0, 2.3, 0.72], [3.5, 0.08, 0.04], P.ink);
  // windows
  const win = (c: number[], face: "f" | "s", w = 0.5, h = 0.5) => {
    const d = face === "f" ? [w, h] : [0.0, h];
    const sz = face === "f" ? [w + 0.14, h + 0.14, 0.05] : [0.05, h + 0.14, w + 0.14];
    box(c, sz, P.trimCream);
    const o = face === "f" ? [0, 0, 0.02] : [0.02 * Math.sign(c[0]), 0, 0];
    const psz = face === "f" ? [w, h, 0.05] : [0.05, h, w];
    g(box([c[0] + o[0], c[1], c[2] + o[2]], psz, P.windowGlow));
    const msz1 = face === "f" ? [w, 0.03, 0.06] : [0.06, 0.03, w];
    const msz2 = face === "f" ? [0.03, h, 0.06] : [0.06, h, 0.03];
    const k = face === "f" ? [0, 0, 0.03] : [0.03 * Math.sign(c[0]), 0, 0];
    box([c[0] + k[0], c[1], c[2] + k[2]], msz1, P.trimCream);
    box([c[0] + k[0], c[1], c[2] + k[2]], msz2, P.trimCream);
    // awning
    const asz = face === "f" ? [w + 0.3, 0.05, 0.22] : [0.22, 0.05, w + 0.3];
    const ao = face === "f" ? [0, h / 2 + 0.12, 0.12] : [0.12 * Math.sign(c[0]), h / 2 + 0.12, 0];
    box([c[0] + ao[0], c[1] + ao[1], c[2] + ao[2]], asz, P.roofDark);
  };
  win([-1.2, 1.7, 0.73], "f"); win([0, 1.7, 0.73], "f"); // third front window beside door
  win([1.3, 1.9, 0.73], "f", 0.4, 0.4);
  for (const z of [-0.8, 0.2]) { win([1.73, 1.7, z], "s"); win([-1.73, 1.7, z], "s"); }
  for (const x of [-0.9, 0.9]) win([x, 1.7, -1.33], "f");
  // porch deck
  box([0.65, DECK - 0.06, 1.3], [1.7, 0.12, 1.2], P.wood);
  box([0.65, DECK - 0.14, 1.3], [1.75, 0.04, 1.25], P.ink);
  for (const x of [-0.15, 1.45]) box([x, 0.65, 1.8], [0.12, 0.5, 0.12], P.woodDark);
  // railing
  const post = (x: number, z: number) => box([x, 1.25, z], [0.08, 0.6, 0.08], P.wood);
  for (const x of [-0.2, 1.5]) for (const z of [0.8, 1.9]) post(x, z);
  box([-0.2, 1.52, 1.35], [0.07, 0.07, 1.1], P.wood);
  box([1.5, 1.52, 1.35], [0.07, 0.07, 1.1], P.wood);
  box([0.65, 1.52, 1.9], [0.37, 0.07, 0.07], P.wood);
  box([-0.2, 1.3, 1.35], [0.04, 0.04, 1.1], P.woodDark);
  box([1.5, 1.3, 1.35], [0.04, 0.04, 1.1], P.woodDark);
  // door
  box([0.6, 1.65, 0.72], [0.8, 1.3, 0.05], P.trimCream);
  box([0.6, 1.62, 0.76], [0.66, 1.2, 0.04], P.wood);
  for (const x of [0.45, 0.6, 0.75]) box([x, 1.5, 0.785], [0.012, 1.0, 0.01], P.woodDark);
  cyl([0.6, 1.95, 0.8], 0.14, 0.03, P.trimCream, 10, [90, 0, 0]);
  g(cyl([0.6, 1.95, 0.82], 0.1, 0.03, P.windowGlow, 10, [90, 0, 0]));
  box([0.93, 1.68, 0.78], [0.05, 0.05, 0.04], P.metal);
  box([1.05, 1.85, 0.8], [0.12, 0.18, 0.12], P.ink);
  g(box([1.05, 1.85, 0.8], [0.09, 0.14, 0.09], P.windowGlow), 1.5);
  // sign
  box([0.6, 2.15, 0.74], [0.8, 0.22, 0.04], P.trimCream);
  box([0.6, 2.15, 0.77], [0.74, 0.16, 0.02], P.cabinRed);
  box([0.6, 2.15, 0.79], [0.3, 0.04, 0.01], P.trimCream);
  box([0.6, 2.15, 0.79], [0.04, 0.12, 0.01], P.trimCream);
  // stairs: from porch edge z~1.9 y .95 to z 2.7 y .4
  for (let i = 0; i < 6; i++) {
    const y = DECK - (i + 1) * 0.0917;
    const z = 2.0 + i * 0.13;
    box([0.6, y - 0.03, z], [0.7, 0.06, 0.16], P.wood);
    box([0.6, y, z + 0.01], [0.6, 0.015, 0.1], P.snowLit);
  }
  for (const x of [0.25, 0.95]) box([x, 0.72, 2.35], [0.06, 0.1, 1.0], P.woodDark, [-0.62, 0, 0]);
  box([0.6, 0.45, 2.72], [0.8, 0.03, 0.15], P.snowShadow);
  // roof: two slopes
  const ang = Math.atan2(0.65, 1.0);
  for (const s of [1, -1]) {
    box([0, 2.67, -0.3 + s * 0.55], [3.9, 0.1, 1.35], P.roofDark, [-s * ang, 0, 0]);
    box([0, 2.78, -0.3 + s * 0.6], [3.7, 0.06, 0.85], P.snowLit, [-s * ang, 0, 0]);
    box([0, 2.5, -0.3 + s * 1.15], [3.9, 0.07, 0.06], P.ink);
    for (let i = 0; i < 6; i++) box([-1.6 + i * 0.64, 2.52, -0.3 + s * 1.2], [0.2, 0.12, 0.08], P.snowLit);
  }
  box([0, 3.0, -0.3], [3.95, 0.1, 0.12], P.snowLit);
  box([0, 2.33, 0.76], [3.9, 0.06, 0.04], P.trimCream);
  box([0, 2.33, -1.36], [3.9, 0.06, 0.04], P.trimCream);
  // gable fascia
  for (const x of [-1.95, 1.95]) box([x, 2.65, -0.3], [0.05, 0.3, 2.0], P.cabinDark);
  // chimney
  box([-1.0, 3.15, -0.6], [0.34, 0.9, 0.34], P.metal);
  box([-1.0, 3.62, -0.6], [0.44, 0.1, 0.44], P.rock);
  box([-1.0, 3.5, -0.43], [0.3, 0.05, 0.02], P.metalLight);
  b.part(new THREE.IcosahedronGeometry(0.18, 0), P.snowShadow, { bone, at: [-1.0, 3.8, -0.6] });
  b.part(new THREE.IcosahedronGeometry(0.14, 0), P.snowLit, { bone, at: [-0.9, 3.98, -0.55] });
  // vent box + firewood on left wall
  box([-1.8, 1.4, 0.2], [0.16, 0.3, 0.3], P.cabinDark);
  for (let i = 0; i < 4; i++) box([-1.8, 1.4 + (i - 1.5) * 0.04, 0.2], [0.18, 0.02, 0.26], P.ink);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4 - r; c++) {
    const z = -1.0 + c * 0.2 + r * 0.1, y = 1.1 + r * 0.17;
    cyl([-1.95, y, z], 0.08, 0.28, P.wood, 7, [0, 0, 90]);
    cyl([-2.1, y, z], 0.065, 0.02, P.trimCream, 7, [0, 0, 90]);
  }
  box([-1.9, 0.98, -0.6], [0.3, 0.06, 0.9], P.woodDark);
  // generator shed on right wall
  box([2.1, 1.3, -0.5], [0.8, 0.8, 0.9], P.cabinDark);
  box([2.1, 1.74, -0.5], [0.9, 0.08, 1.0], P.roofDark);
  box([2.1, 1.8, -0.5], [0.8, 0.04, 0.9], P.snowLit);
  box([2.1, 0.88, -0.5], [0.9, 0.1, 1.0], P.woodDark);
  box([2.51, 1.3, -0.5], [0.03, 0.4, 0.5], P.cabinRed);
  cyl([2.3, 2.0, -0.8], 0.04, 0.5, P.metal, 8);
  cyl([2.3, 2.27, -0.8], 0.06, 0.05, P.metalLight, 8);
  box([1.6, 2.2, -0.5], [0.04, 0.04, 0.04], P.ink);
}
```

<!-- call: yardGear -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildYardGear({ b, J, P, M }: Ctx) {
  const bone = J.outpost;
  const G = M.ground[1];
  const R = rng(5);

  // Box helper: centre x,y,z; size w,h,d
  const box = (x: number, y: number, z: number, w: number, h: number, d: number, c: string, rot: [number, number, number] = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], rotation: rot });
  const cyl = (x: number, y: number, z: number, rt: number, rb: number, h: number, c: string, seg = 8, rot: [number, number, number] = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at: [x, y, z], rotation: rot });
  const drift = (x: number, z: number, rx: number, rz: number, h = 0.07) => {
    b.part(new THREE.CylinderGeometry(1, 1.15, h, 8), P.snowShadow, { bone, at: [x, G + h / 2 - 0.01, z], scale: [rx, 1, rz] });
    b.part(new THREE.CylinderGeometry(0.7, 0.9, h * 0.5, 8), P.snowLit, { bone, at: [x, G + h * 0.9, z + rz * 0.05], scale: [rx * 0.8, 1, rz * 0.8] });
  };

  // ---------- Snowmobile ----------
  const [sx, , sz] = M.snowmobilePad;
  drift(sx, sz, 0.75, 0.55);
  // skis
  for (const s of [1, -1]) {
    box(sx + s * 0.28, G + 0.05, sz + 0.4, 0.1, 0.04, 0.55, P.metal);
    box(sx + s * 0.28, G + 0.03, sz + 0.7, 0.1, 0.04, 0.1, P.metal, [-30, 0, 0]);
    box(sx + s * 0.28, G + 0.04, sz + 0.4, 0.12, 0.012, 0.5, P.ink);
    box(sx + s * 0.25, G + 0.2, sz + 0.35, 0.04, 0.3, 0.04, P.metal, [0, 0, s * 8]);
  }
  // body
  box(sx, G + 0.28, sz + 0.3, 0.55, 0.22, 0.5, P.cabinRed);
  box(sx, G + 0.22, sz + 0.28, 0.58, 0.07, 0.55, P.cabinDark);
  box(sx, G + 0.43, sz + 0.42, 0.45, 0.12, 0.28, P.cabinRed, [-12, 0, 0]);
  box(sx, G + 0.54, sz + 0.45, 0.04, 0.003 + 0.1, 0.01, P.trimCream);
  box(sx, G + 0.56, sz + 0.5, 0.4, 0.2, 0.03, P.trimCream, [-35, 0, 0]);
  box(sx, G + 0.45, sz + 0.57, 0.12, 0.07, 0.04, P.windowGlow);
  box(sx, G + 0.46, sz + 0.2, 0.28, 0.1, 0.4, P.ink);
  box(sx, G + 0.46, sz + 0.0, 0.3, 0.08, 0.1, P.ink, [10, 0, 0]);
  box(sx, G + 0.41, sz + 0.3, 0.1, 0.02, 0.55, P.sunOrange);
  box(sx, G + 0.34, sz + 0.56, 0.4, 0.06, 0.03, P.cabinDark);
  // handlebar
  box(sx, G + 0.58, sz + 0.28, 0.4, 0.03, 0.03, P.metal);
  // track block
  box(sx, G + 0.14, sz - 0.12, 0.34, 0.2, 0.6, P.ink);
  box(sx, G + 0.06, sz - 0.12, 0.38, 0.05, 0.62, P.rock);
  for (let i = 0; i < 5; i++) box(sx, G + 0.26, sz - 0.34 + i * 0.12, 0.36, 0.015, 0.05, P.snowLit);
  box(sx, G + 0.27, sz - 0.1, 0.3, 0.05, 0.5, P.snowShadow);

  // ---------- Sled ----------
  const sledZ = sz - 0.95;
  for (const s of [1, -1]) {
    box(sx + s * 0.22, G + 0.04, sledZ, 0.05, 0.05, 0.8, P.woodDark);
    box(sx + s * 0.22, G + 0.07, sledZ + 0.42, 0.05, 0.05, 0.1, P.woodDark, [-35, 0, 0]);
  }
  box(sx, G + 0.1, sledZ, 0.5, 0.05, 0.75, P.wood);
  for (let i = 0; i < 4; i++) box(sx, G + 0.135, sledZ - 0.28 + i * 0.19, 0.5, 0.012, 0.03, P.woodDark);
  box(sx, G + 0.22, sledZ + 0.05, 0.4, 0.18, 0.4, P.sunOrange);
  box(sx, G + 0.32, sledZ + 0.05, 0.3, 0.04, 0.3, P.sunOrange);
  for (const dz of [-0.1, 0.1]) box(sx, G + 0.23, sledZ + 0.05 + dz, 0.42, 0.04, 0.02, P.trimCream);
  box(sx - 0.1, G + 0.18, sledZ - 0.28, 0.16, 0.12, 0.14, P.wood);
  box(sx + 0.1, G + 0.17, sledZ - 0.28, 0.14, 0.1, 0.14, P.cabinDark);
  box(sx, G + 0.1, sz - 0.5, 0.03, 0.03, 0.2, P.woodDark);

  // ---------- Cargo ----------
  const [cx, , cz] = M.cratePad;
  drift(cx, cz, 0.95, 0.75);
  const crate = (x: number, y: number, z: number, s: number) => {
    box(x, y, z, s, s, s, P.wood);
    for (const dy of [-1, 1]) box(x, y + dy * s * 0.4, z + s * 0.5 + 0.004, s * 1.02, s * 0.1, 0.012, P.woodDark);
    for (const dx of [-1, 1]) box(x + dx * s * 0.4, y, z + s * 0.5 + 0.005, s * 0.1, s, 0.012, P.woodDark);
    box(x, y, z + s * 0.5 + 0.012, s * 0.2, s * 0.04, 0.01, P.trimCream);
    box(x, y, z + s * 0.5 + 0.012, s * 0.04, s * 0.2, 0.01, P.trimCream);
  };
  crate(cx - 0.25, G + 0.2, cz - 0.1, 0.4);
  crate(cx + 0.2, G + 0.2, cz - 0.1, 0.4);
  crate(cx + 0.65, G + 0.17, cz - 0.15, 0.34);
  crate(cx - 0.02, G + 0.58, cz - 0.1, 0.36);
  crate(cx + 0.45, G + 0.5, cz - 0.15, 0.3);
  box(cx, G + 0.78, cz - 0.1, 0.4, 0.05, 0.4, P.snowLit);
  const drum = (x: number, z: number, c: string) => {
    cyl(x, G + 0.22, z, 0.15, 0.15, 0.44, c, 10);
    for (const y of [0.1, 0.34]) cyl(x, G + y, z, 0.16, 0.16, 0.035, P.ink, 10);
    cyl(x, G + 0.45, z, 0.14, 0.14, 0.02, P.metal, 10);
    cyl(x + 0.06, G + 0.47, z + 0.04, 0.025, 0.025, 0.02, P.ink, 6);
  };
  drum(cx - 0.35, cz + 0.4, P.sunOrange);
  drum(cx + 0.0, cz + 0.45, P.cabinDark);
  drum(cx + 0.35, cz + 0.4, P.sunOrange);
  cyl(cx - 0.35, G + 0.48, cz + 0.4, 0.1, 0.12, 0.03, P.snowLit, 8);

  // ---------- Flag pole ----------
  const [fx, , fz] = M.flagPad;
  drift(fx, fz, 0.4, 0.35);
  cyl(fx, G + 0.9, fz, 0.025, 0.03, 1.8, P.metal, 6);
  cyl(fx, G + 1.82, fz, 0.04, 0.04, 0.05, P.metalLight, 6);
  box(fx + 0.3, G + 1.55, fz, 0.55, 0.32, 0.015, P.cabinRed);
  box(fx + 0.3, G + 1.55, fz + 0.01, 0.55, 0.07, 0.01, P.trimCream);
  box(fx + 0.62, G + 1.55, fz, 0.1, 0.2, 0.012, P.cabinRed, [0, 0, 10]);

  // ---------- Ice-core rack ----------
  const rx = 0.2, rz = 2.8;
  drift(rx, rz, 0.65, 0.35);
  for (const s of [1, -1]) {
    box(rx + s * 0.4, G + 0.4, rz, 0.05, 0.9, 0.05, P.wood, [0, 0, s * -10]);
    box(rx + s * 0.4, G + 0.02, rz, 0.1, 0.04, 0.3, P.ink);
  }
  box(rx, G + 0.84, rz, 0.8, 0.05, 0.06, P.woodDark);
  for (let i = 0; i < 6; i++) {
    const y = G + 0.18 + (i % 3) * 0.2;
    const z = rz + (i < 3 ? 0.08 : -0.08);
    cyl(rx, y, z, 0.04, 0.04, 0.82, P.iceBlue, 6, [0, 0, 90]);
    cyl(rx - 0.42, y, z, 0.045, 0.045, 0.015, P.iceDark, 6, [0, 0, 90]);
  }
  box(rx, G + 0.1, rz, 0.7, 0.03, 0.04, P.woodDark);

  // ---------- Survey tent ----------
  const [tx, , tz] = M.tentPad;
  drift(tx, tz, 1.0, 0.9, 0.09);
  b.part(new THREE.ConeGeometry(0.78, 0.8, 4), P.sunOrange, { bone, at: [tx, G + 0.4, tz], rotation: [0, 45, 0], scale: [1, 1, 0.85] });
  b.part(new THREE.ConeGeometry(0.4, 0.45, 4), P.cabinRed, { bone, at: [tx, G + 0.6, tz], rotation: [0, 45, 0], scale: [1.1, 1, 0.9] });
  box(tx, G + 0.22, tz + 0.5, 0.26, 0.38, 0.03, P.roofDark, [18, 0, 0]);
  box(tx, G + 0.04, tz + 0.7, 0.9, 0.06, 0.12, P.snowLit);
  cyl(tx, G + 0.84, tz, 0.012, 0.012, 0.12, P.metal, 5);
  for (const [dx, dz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const ex = tx + dx * 0.95, ez = tz + dz * 0.8;
    b.rod([tx + dx * 0.3, G + 0.3, tz + dz * 0.25], [ex, G + 0.04, ez], 0.008, P.trimCream, { bone });
    box(ex, G + 0.05, ez, 0.04, 0.1, 0.04, P.wood);
  }

  // ---------- Skis & poles at stair rail ----------
  const kx = -2.1, kz = 1.9;
  drift(kx, kz, 0.3, 0.25, 0.05);
  for (const s of [1, -1]) {
    box(kx + s * 0.07, G + 0.65, kz, 0.06, 1.3, 0.015, s > 0 ? P.cabinRed : P.iceDark, [8, 0, s * 3]);
    box(kx + s * 0.07, G + 0.1, kz + 0.12, 0.06, 0.03, 0.02, P.ink);
    b.rod([kx + s * 0.18, G + 0.04, kz + 0.15], [kx + s * 0.14, G + 1.0, kz - 0.03], 0.008, P.metalLight, { bone });
    cyl(kx + s * 0.18, G + 0.04, kz + 0.15, 0.04, 0.04, 0.01, P.ink, 6);
  }

  // ---------- Ice axe in drift ----------
  const ax = -1.5, az = 3.0;
  drift(ax, az, 0.3, 0.25, 0.06);
  b.rod([ax, G + 0.04, az], [ax + 0.05, G + 0.62, az - 0.04], 0.018, P.wood, { bone });
  box(ax + 0.07, G + 0.64, az - 0.04, 0.2, 0.04, 0.03, P.metalLight, [0, 0, 8]);
  box(ax + 0.17, G + 0.6, az - 0.04, 0.06, 0.08, 0.03, P.metalLight, [0, 0, -30]);

  // few footprints of scattered snow chunks
  for (let i = 0; i < 4; i++) {
    const x = -3 + R() * 2.5, z = 1.2 + R() * 2;
    box(x, G + 0.015, z, 0.12, 0.03, 0.12, P.snowShadow, [0, R() * 90, 0]);
  }
}
```