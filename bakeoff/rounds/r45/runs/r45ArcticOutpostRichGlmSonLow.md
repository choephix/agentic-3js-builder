<!-- call: plan -->

```json
{
  "name": "Outpost Vulpes — Arctic Research Station",
  "description": "A Firewatch-style flat-colour arctic research outpost: a red hab cabin on stilts with warm glowing windows, a red-and-cream radar tower, fuel tanks and crates in the yard, and a lamp-lit boardwalk, all on a sculpted snowfield.",
  "builderName": "arcticOutpostFirewatch",
  "size": [3.2, 3.3, 4.6],
  "layout": "Static diorama, no joints. Reading front (+Z) to back: the front strip is the yard and boardwalk — fuel tanks, a generator shed, crates and barrels on the left, the lamp-lit boardwalk and trail markers centre/right, a flagpole at the front. Centre sits the hero: a red-orange hab cabin raised on wooden stilts, its floor deck at y = 1.05, cabin body 1.05..2.35, pitched roof cresting near y = 2.95, chimney and stovepipe above, two large warm glowing windows and a door facing +Z. Back-right stands the science tower: a lattice mast in Firewatch red with cream bands rising to y = 3.3, a parabolic radar dish at y = 2.3 facing +Z, whip antennas and a glowing red beacon on top. Everything rests on one sculpted snowfield slab (the only floor: true part) with drift mounds, an exposed rock shoulder on the right rear, and darker trampled snow where the stilts, tower foot and yard pad sit. Style on every part: bold low-poly silhouettes, every surface one flat colour from the palette, panel seams and trim as thin seated strips in navy or cream, snow caps (snowShade) on every upward face, warm glowing pieces (windowWarm, windowWarmCore, beaconRed, lampGlow via the glow kit) as the only bright accents against the cold blue-white snow and red-orange structures. Colour by place: warm wood and red-orange on structures, cool blues in snow shadow, navy for ironwork, rock greys where the ground breaks through.",
  "palette": {
    "snow": "#dfe8f2",
    "snowShade": "#b8c8dc",
    "snowDeep": "#8fa5c0",
    "rock": "#5a6474",
    "rockDark": "#3d4553",
    "wood": "#7a4a2e",
    "woodDark": "#54301c",
    "hullRed": "#c8502e",
    "hullRedDark": "#8f3320",
    "cream": "#f2e3c2",
    "navy": "#2a3242",
    "metal": "#6e7b8c",
    "metalDark": "#39424f",
    "tankTeal": "#3e7d82",
    "rust": "#a05a2c",
    "windowWarm": "#ffb14e",
    "windowWarmCore": "#ffe3a0",
    "beaconRed": "#ff4a3c",
    "flagOrange": "#e07830",
    "smoke": "#c9d4e4"
  },
  "mounts": {
    "habFootings": [-0.35, 0.45, 0],
    "towerFoot": [1.05, 0.42, -0.45],
    "yardPad": [-1.0, 0.4, 1.5],
    "walkPad": [0.4, 0.4, 1.6],
    "habDoorDeck": [-0.35, 1.05, 0.9]
  },
  "joints": [],
  "parts": [
    {
      "id": "terrain",
      "builds": "The snowfield the whole outpost stands on, and the only floor: true part; its lowest points touch y = 0. Build a low-poly snow slab roughly 3.2 x 0.45 x 4.6 in plan (a beveled box or a loft with a few gentle height steps between y = 0 and y = 0.5): flat snow on top, snowShade on north/east drift faces, snowDeep in the shadowed undersides and the slab's carved edge. Add 3-4 rounded drift mounds (squashed spheres or low lathe domes) near the hab footings and tower foot, an exposed rock shoulder of 2-3 chunky rock/rockDark prisms breaking through at the right rear around [1.2, 0, -1.6], a few smaller rock nubs at the left edge, and 4-5 flat darker trampled-snow patches (thin snowDeep slabs 1-2 cm proud) exactly under habFootings, towerFoot, yardPad and walkPad so the structures read as planted. Two or three tiny snow lumps against structure bases are welcome but nothing else: no props, no buildings. Keep triangle counts chunky and readable.",
      "box": [[-1.6, 0.0, -2.3], [1.6, 0.5, 2.3]],
      "attaches": "Everything rests on it: hab stilts land at habFootings, the tower foot at towerFoot, yard props on yardPad, boardwalk posts on walkPad. No other part builds ground.",
      "joints": [],
      "floor": true,
      "budget": 150
    },
    {
      "id": "habModule",
      "builds": "The hero: a stilted hab cabin in Firewatch red. Four to six tapered wood/woodDark stilt legs (boxes or frustum boxes) run from the snow at habFootings up to the cabin floor frame at y = 1.05, cross-braced with two thin navy rods. Floor deck: a wood slab 1.7 x 1.9 at y = 1.02..1.08 spanning [-1.1, -0.9]..[0.45, 0.9] with cream edge trim. Cabin body: a box from y = 1.08 to 2.3, hullRed walls, hullRedDark corner posts and a navy plinth strip at the bottom, horizontal cream panel-seam strips at mid height. Front (+Z) face: a woodDark door (with a cream frame and a tiny navy handle) slightly right of centre, and two large glowing windows left and right of it — each a navy recess frame, a windowWarm pane and an inner windowWarmCore square, wrapped with glow() so they emit; a thin cream sill under each. Side faces get one smaller glowing window each. Roof: a pitched wedge (two slabs or a prism) in metalDark with a thick snow cap layer in snow/snowShade overhanging the eaves and a cream fascia line. Chimney: a rust square stack on the roof's left rear rising to y = 3.15 with a snowShade cap and two stacked smoke puffs (smoke-coloured squashed spheres) drifting up and back; plus a thin metal stovepipe with a small cap. A tiny whip antenna and a navy vents box on the roof. A short wooden stair of 4 steps drops from the door at habDoorDeck toward +Z (the top step at y = 1.05, the bottom near y = 0.5) with a navy handrail — the walkway builder meets its bottom step.",
      "box": [[-1.15, 0.3, -0.95], [0.5, 3.2, 0.95]],
      "attaches": "Stilts land on the snow at habFootings; the door deck edge at habDoorDeck [-0.35, 1.05, 0.9] is where the stair hands off to the walkway part.",
      "joints": [],
      "floor": false,
      "budget": 230
    },
    {
      "id": "scienceTower",
      "builds": "The tall silhouette: a lattice observation/radar mast at the back right. Base: four splayed hullRedDark legs from the snow at towerFoot converging to a hullRed mast column at y = 1.6, with a small metalDark equipment box and a navy cross-brace X between the legs. Mast: a slender hullRed column (or 4-post lattice) from y = 1.6 to 3.0 with cream band rings at y = 2.0 and 2.6, and a small railed platform at y = 2.55 (cream deck, navy rails). Radar dish: a shallow cream lathe or extruded paraboloid, about 0.55 m across, mounted on a short navy arm on the platform's front, aimed +Z and tilted slightly up, with a navy feed strut and a small metalDark counterweight. Above the platform the mast tapers to y = 3.1 carrying two thin whip antennas (metal, one with a small tankTeal insulator bead) and a crossbar; on top a glowing beaconRed sphere in a navy fork mount, wrapped with glow(), the model's highest point at y = 3.3. Guy wires: three thin navy rods from the mast's upper third down to tiny metalDark anchor stakes in the snow. A ladder (two navy rails with 5-6 rungs) climbs the front leg from the snow to the platform.",
      "box": [[0.55, 0.3, -1.45], [1.55, 3.3, 0.55]],
      "attaches": "Legs and guy anchors land on the snow around towerFoot.",
      "joints": [],
      "floor": false,
      "budget": 190
    },
    {
      "id": "utilityYard",
      "builds": "The working front-left corner of the outpost on the snow at yardPad. Two horizontal fuel tanks: tankTeal cylinders about 0.35 m across and 0.9 m long on cradle stands of woodDark, stacked one low and one slightly raised behind, each with rust end caps, a navy band seam and a small metalDark valve; a thin metal pipe runs from a tank to the generator shed. Generator shed: a small box hut about 0.7 x 0.6 x 0.8, hullRed walls with cream corner trim, a metalDark lean-to roof with a snowShade cap, a navy louvre vent and one small warm-glowing windowWarm slit low on its front. Around them: a stack of three wood crates (wood with woodDark edges and a cream stencil-ish stripe), two rust barrels with navy hoop bands half-drifted in snow (a snowShade cap slab on top), a snow shovel leaned on the shed (wood handle, metalDark blade), and a short pole with a tankTeal sign board. A low snowShade drift partially buries the crates' lower edges. Keep the pieces chunky, flat-coloured and clearly read as equipment, not scenery filler.",
      "box": [[-1.55, 0.3, 0.7], [-0.45, 1.7, 2.25]],
      "attaches": "Everything stands on the snow around yardPad; the boardwalk passes to its right but the walkway builder owns that strip.",
      "joints": [],
      "floor": false,
      "budget": 180
    },
    {
      "id": "walkwayAndLights",
      "builds": "The lit path that ties the outpost together. Boardwalk: a plank deck of wood slats 0.9 m wide on short woodDark posts, running from the bottom of the hab stair (meets the stair builder near [-0.35, 0.55, 1.05]) forward to z = 1.75, then turning right along x toward the tower's front foot, ending in a small landing near [1.0, 0.55, 1.55]; deck top around y = 0.55, cream trim strip along its edge, snowShade dusting on alternate planks. Lamp posts: three navy posts 1.3 m tall with a crossarm and a hanging lamp — each lamp a navy cap, a glowing windowWarm lantern body with a windowWarmCore inner pane, wrapped with glow(), one near the stair, one at the turn, one at the landing. Trail markers: two short poles with flagOrange flag boards (one chevron-tipped) planted in the snow beside the walk. Flagpole: a 2.2 m metal pole at [-0.3, ?, 2.05] with a cream truck ball, a navy cleat and a waving flagOrange flag (an extrude with a gentle S-curve, cream star-ish emblem square). A short rope fence: three navy posts with a thin cream rope sag between them along the yard side of the walkway. Small details: a thermometer/weather post with a white dial disc near the landing, and two snowShade drifts lapping over the walkway's edges.",
      "box": [[-0.5, 0.3, 0.9], [1.45, 1.65, 2.3]],
      "attaches": "Posts stand on the snow around walkPad; its start meets the hab stair bottom and it ends at a landing facing the scienceTower's front leg.",
      "joints": [],
      "floor": false,
      "budget": 150
    }
  ]
}
```

<!-- call: terrain -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildTerrain({ b, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: [0, ry, 0], flat: true });

  // Slab: deep base, shaded band, snow top
  box(3.2, 0.2, 4.6, P.snowDeep, 0, 0.1, 0);
  box(3.2, 0.12, 4.6, P.snowShade, 0, 0.26, 0);
  box(3.12, 0.1, 4.52, P.snow, 0, 0.37, 0);
  // stepped height: raised plateaus
  box(2.2, 0.06, 3.0, P.snow, -0.3, 0.45, 0.2);
  box(2.3, 0.02, 3.1, P.snowShade, -0.3, 0.415, 0.2);
  box(1.0, 0.05, 1.2, P.snow, 1.0, 0.44, -0.6);
  // drift faces on north/east edges
  box(0.08, 0.14, 4.4, P.snowShade, 1.57, 0.4, 0);
  box(3.0, 0.14, 0.08, P.snowShade, 0, 0.4, -2.27);
  // carved edge strips
  box(3.22, 0.04, 0.04, P.snowDeep, 0, 0.03, 2.3);
  box(0.04, 0.04, 4.62, P.snowDeep, -1.6, 0.03, 0);

  // drift mounds
  const mound = (x: number, z: number, rx: number, ry: number, rz: number, c: string) =>
    b.part(new THREE.SphereGeometry(1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), c, {
      at: [x, 0.43, z], scale: [rx, ry, rz], flat: true,
    });
  mound(-0.9, 0.2, 0.45, 0.12, 0.35, P.snow);
  mound(0.1, -0.3, 0.4, 0.1, 0.32, P.snowShade);
  mound(0.7, -0.1, 0.35, 0.1, 0.4, P.snow);
  mound(-0.2, 1.9, 0.5, 0.09, 0.3, P.snowShade);

  // rock shoulder right rear
  const rock = (x: number, z: number, w: number, h: number, d: number, c: string, ry: number) => {
    b.part(new THREE.CylinderGeometry(w * 0.6, w * 0.85, h, 6), c, {
      at: [x, 0.35 + h / 2 - 0.02, z], rotation: [0, ry, 0], scale: [1, 1, d / w], flat: true,
    });
  };
  rock(1.2, -1.6, 0.7, 0.5, 0.6, P.rock, 20);
  rock(1.0, -1.95, 0.5, 0.38, 0.5, P.rockDark, 50);
  rock(1.4, -1.25, 0.4, 0.3, 0.4, P.rock, 80);
  // snow cap on the big rock
  b.part(new THREE.CylinderGeometry(0.3, 0.42, 0.06, 6), P.snow, { at: [1.2, 0.87, -1.6], rotation: [0, 20, 0], flat: true });
  // small nubs left edge
  rock(-1.45, -0.8, 0.22, 0.14, 0.2, P.rockDark, 10);
  rock(-1.4, 0.4, 0.18, 0.12, 0.18, P.rock, 40);
  rock(-1.48, 1.6, 0.2, 0.16, 0.2, P.rock, 70);

  // trampled patches
  const patch = (m: number[], w: number, d: number) =>
    box(w, 0.025, d, P.snowDeep, m[0], 0.415 + 0.03, m[2]);
  patch(M.habFootings, 1.5, 1.7);
  patch(M.towerFoot, 0.9, 0.9);
  patch(M.yardPad, 1.0, 1.1);
  patch(M.walkPad, 1.0, 0.9);
  box(0.5, 0.02, 0.8, P.snowDeep, -0.35, 0.47, 1.2);

  // tiny lumps
  for (const [x, z] of [[-1.1, -0.2], [0.55, 0.45], [0.9, -0.1]]) {
    const s = 0.05 + R() * 0.03;
    b.part(new THREE.SphereGeometry(s, 6, 4), P.snow, { at: [x, 0.46, z], scale: [1.4, 0.8, 1.2], flat: true });
  }
}
```

<!-- call: scienceTower -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildScienceTower({ b, P, M }: any) {
  const [fx, , fz] = M.towerFoot;
  const V = (x: number, y: number, z: number): [number, number, number] => [fx + x, y, fz + z];
  const box = (w: number, h: number, d: number, c: string, at: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at });
  const rod = (a: number[], c2: number[], r: number, c: string) => b.rod(a, c2, r, c);

  // Legs: splayed from snow to mast at y=1.6
  const sx = [1, -1, 1, -1], sz = [1, 1, -1, -1];
  for (let i = 0; i < 4; i++) {
    rod(V(sx[i] * 0.4, 0.42, sz[i] * 0.4), V(sx[i] * 0.1, 1.6, sz[i] * 0.1), 0.035, P.hullRedDark);
    box(0.12, 0.04, 0.12, P.metalDark, V(sx[i] * 0.4, 0.43, sz[i] * 0.4));
    box(0.14, 0.02, 0.14, P.snowShade, V(sx[i] * 0.4, 0.45, sz[i] * 0.4));
  }
  // cross-brace X (front and back faces)
  for (const z of [0.27, -0.27]) {
    rod(V(-0.3, 0.7, z), V(0.3, 1.3, z), 0.012, P.navy);
    rod(V(0.3, 0.7, z), V(-0.3, 1.3, z), 0.012, P.navy);
  }
  // sides
  for (const x of [0.27, -0.27]) {
    rod(V(x, 0.7, -0.3), V(x, 1.3, 0.3), 0.012, P.navy);
    rod(V(x, 0.7, 0.3), V(x, 1.3, -0.3), 0.012, P.navy);
  }
  box(0.28, 0.2, 0.22, P.metalDark, V(0.2, 0.55, 0.05));
  box(0.3, 0.02, 0.24, P.snowShade, V(0.2, 0.66, 0.05));
  // Mast
  b.part(new THREE.BoxGeometry(0.2, 1.4, 0.2), P.hullRed, { at: V(0, 2.3, 0) });
  b.part(new THREE.BoxGeometry(0.26, 0.08, 0.26), P.hullRedDark, { at: V(0, 1.6, 0) });
  for (const y of [2.0, 2.6]) box(0.23, 0.07, 0.23, P.cream, V(0, y, 0));
  // upper taper
  b.part(new THREE.CylinderGeometry(0.03, 0.06, 0.2, 6), P.hullRed, { at: V(0, 3.1, 0) });
  // Platform
  box(0.8, 0.05, 0.8, P.cream, V(0, 2.55, 0));
  const hs = 0.38;
  for (const [x, z] of [[hs, hs], [-hs, hs], [hs, -hs], [-hs, -hs]]) box(0.03, 0.4, 0.03, P.navy, V(x, 2.77, z));
  for (const y of [2.8, 2.98]) {
    box(0.8, 0.02, 0.02, P.navy, V(0, y, hs));
    box(0.8, 0.02, 0.02, P.navy, V(0, y, -hs));
    box(0.02, 0.02, 0.8, P.navy, V(hs, y, 0));
    box(0.02, 0.02, 0.8, P.navy, V(-hs, y, 0));
  }
  // Dish on arm at front
  box(0.05, 0.05, 0.3, P.navy, V(0, 2.75, 0.5));
  const dishAt = V(0, 2.95, 0.7);
  b.lathe([[0, 0], [0.12, 0.012], [0.22, 0.05], [0.27, 0.09], [0.25, 0.09], [0.2, 0.06], [0.1, 0.025], [0, 0.015]],
    { at: dishAt, axis: [0, 0.2, 1], color: P.cream, segments: 14 });
  rod(dishAt, V(0, 3.0, 0.97), 0.008, P.navy);
  b.part(new THREE.SphereGeometry(0.03, 6, 4), P.metalDark, { at: V(0, 3.0, 0.97) });
  box(0.1, 0.1, 0.08, P.metalDark, V(0, 2.9, 0.58));
  // Crossbar & whips
  box(0.5, 0.025, 0.025, P.metal, V(0, 3.02, 0));
  rod(V(0.22, 3.02, 0), V(0.25, 3.28, 0), 0.006, P.metal);
  rod(V(-0.22, 3.02, 0), V(-0.28, 3.25, 0.03), 0.006, P.metal);
  b.part(new THREE.SphereGeometry(0.02, 6, 4), P.tankTeal, { at: V(-0.25, 3.13, 0.015) });
  // Beacon fork
  box(0.08, 0.04, 0.08, P.navy, V(0, 3.2, 0));
  box(0.012, 0.1, 0.07, P.navy, V(0.045, 3.26, 0));
  box(0.012, 0.1, 0.07, P.navy, V(-0.045, 3.26, 0));
  glow(b.part(new THREE.SphereGeometry(0.05, 8, 6), P.beaconRed, { at: V(0, 3.25, 0) }), 1.6);
  // Guy wires
  const anchors = [[0.9, 0.5], [-0.9, 0.2], [0.1, -0.9]];
  for (const [ax, az] of anchors) {
    rod(V(0, 2.75, 0), V(ax, 0.45, az), 0.006, P.navy);
    box(0.06, 0.1, 0.06, P.metalDark, V(ax, 0.47, az));
  }
  // Ladder on front-right leg
  const lz = 0.5;
  const lo = V(0.28, 0.45, lz), hi = V(0.28, 2.55, lz - 0.1);
  for (const dx of [-0.07, 0.07]) rod([lo[0] + dx, lo[1], lo[2]], [hi[0] + dx, hi[1], hi[2]], 0.012, P.navy);
  for (let i = 0; i < 6; i++) {
    const t = (i + 0.5) / 6;
    box(0.16, 0.015, 0.015, P.navy, [lo[0], lo[1] + (hi[1] - lo[1]) * t, lo[2] + (hi[2] - lo[2]) * t]);
  }
}
```

<!-- call: walkwayAndLights -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildWalkwayAndLights({ b, J, P, M }: Ctx) {
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as any, ...(rot ? { rotation: rot as any } : {}) });
  const cyl = (r: number, h: number, c: string, at: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at: at as any });
  const sph = (r: number, c: string, at: number[], sc: number[] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at: at as any, scale: sc as any });

  const DECK = 0.55;
  // Deck segment helper: planks along z (run1) and along x (run2)
  const plankRun = (x0: number, x1: number, z0: number, z1: number, alongZ: boolean) => {
    const n = 8;
    const len = alongZ ? z1 - z0 : x1 - x0;
    const step = len / n;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) * step;
      const cx = alongZ ? (x0 + x1) / 2 : x0 + t;
      const cz = alongZ ? z0 + t : (z0 + z1) / 2;
      const w = alongZ ? x1 - x0 : step - 0.015;
      const d = alongZ ? step - 0.015 : z1 - z0;
      box(w, 0.04, d, i % 2 ? P.wood : P.woodDark, [cx, DECK - 0.02, cz]);
      if (i % 2 === 0) box(w * 0.9, 0.012, d * 0.8, P.snowShade, [cx, DECK + 0.004, cz]);
    }
    // trim strips
    if (alongZ) {
      box(0.03, 0.05, len, P.cream, [x0, DECK - 0.015, (z0 + z1) / 2]);
      box(0.03, 0.05, len, P.cream, [x1, DECK - 0.015, (z0 + z1) / 2]);
    } else {
      box(len, 0.05, 0.03, P.cream, [(x0 + x1) / 2, DECK - 0.015, z0]);
      box(len, 0.05, 0.03, P.cream, [(x0 + x1) / 2, DECK - 0.015, z1]);
    }
  };
  // leg A: z 1.05..1.75 at x -0.8..-0.1 ; leg B: x -0.8..1.2 at z 1.3..1.75 (landing at end)
  plankRun(-0.8, -0.1, 1.05, 1.75, true);
  plankRun(-0.1, 1.2, 1.3, 1.75, false);
  // posts
  const posts: number[][] = [
    [-0.78, 1.08], [-0.12, 1.08], [-0.78, 1.72], [-0.12, 1.4], [0.5, 1.72], [1.15, 1.72], [1.15, 1.35], [0.5, 1.35],
  ];
  for (const [x, z] of posts) box(0.07, 0.3, 0.07, P.woodDark, [x, 0.4, z]);

  // lamp posts
  const lamp = (x: number, z: number, dir: number) => {
    box(0.05, 1.3, 0.05, P.navy, [x, 0.55 + 0.65 - 0.02, z]);
    box(0.28, 0.035, 0.035, P.navy, [x + dir * 0.12, 1.78, z]);
    const lx = x + dir * 0.24;
    cyl(0.004, 0.06, P.navy, [lx, 1.74, z], 4);
    box(0.1, 0.035, 0.1, P.navy, [lx, 1.7, z]);
    glow(box(0.08, 0.1, 0.08, P.windowWarm, [lx, 1.62, z]), 1.4);
    glow(box(0.045, 0.06, 0.045, P.windowWarmCore, [lx, 1.62, z + 0.0]), 1.8);
    box(0.09, 0.02, 0.09, P.navy, [lx, 1.56, z]);
    box(0.07, 0.015, 0.07, P.snowShade, [lx, 1.725, z]);
    box(0.1, 0.04, 0.1, P.metalDark, [x, 0.46, z]);
  };
  lamp(-0.82, 1.15, 1);
  lamp(-0.1, 1.72, -1);
  lamp(1.15, 1.7, -1);

  // trail markers
  for (const [x, z, chev] of [[0.3, 1.1, 0], [-0.55, 1.95, 1]] as number[][]) {
    cyl(0.015, 0.8, P.wood, [x, 0.65, z], 6);
    box(0.2, 0.1, 0.012, P.flagOrange, [x + 0.1, 0.9, z]);
    if (chev) b.part(new THREE.ConeGeometry(0.06, 0.1, 3), P.flagOrange, { at: [x + 0.25, 0.9, z], rotation: [0, 0, -90] as any });
    box(0.1, 0.02, 0.014, P.cream, [x + 0.08, 0.9, z]);
    sph(0.05, P.snowShade, [x, 0.27, z], [1.4, 0.5, 1.4]);
  }

  // flagpole
  const fx = -0.3, fz = 2.05;
  cyl(0.014, 2.2, P.metal, [fx, 1.4, fz], 6);
  sph(0.03, P.cream, [fx, 2.52, fz]);
  box(0.03, 0.05, 0.03, P.navy, [fx, 1.0, fz + 0.02]);
  cyl(0.06, 0.04, P.metalDark, [fx, 0.32, fz]);
  const flag = b.extrude(
    [[0, 0], [0.12, 0.03], [0.26, -0.03], [0.4, 0.01], [0.4, 0.26], [0.26, 0.3], [0.12, 0.23], [0, 0.26]],
    { at: [fx, 2.2, fz], x: [1, 0, 0], thickness: 0.012, color: P.flagOrange, smoothing: 1 },
  );
  box(0.09, 0.09, 0.016, P.cream, [fx + 0.14, 2.35, fz]);
  box(0.04, 0.04, 0.018, P.flagOrange, [fx + 0.14, 2.35, fz], [0, 0, 45]);

  // rope fence along yard side
  const rp = [[-0.85, 1.85], [-0.6, 2.2], [-0.1, 2.25]];
  const top = 0.82;
  for (const [x, z] of rp) {
    cyl(0.02, 0.55, P.navy, [x, 0.55, z], 6);
    sph(0.03, P.cream, [x, 0.84, z]);
  }
  for (let k = 0; k < 2; k++) {
    const [ax, az] = rp[k], [bx, bz] = rp[k + 1];
    const mx = (ax + bx) / 2, mz = (az + bz) / 2;
    const len = Math.hypot(bx - ax, bz - az);
    const ang = Math.atan2(bx - ax, bz - az) * 180 / Math.PI;
    b.part(new THREE.BoxGeometry(0.012, 0.012, len * 0.52), P.cream, { at: [ax * 0.75 + bx * 0.25, top - 0.03, az * 0.75 + bz * 0.25] as any, rotation: [0, ang, 0] as any });
    b.part(new THREE.BoxGeometry(0.012, 0.012, len * 0.52), P.cream, { at: [ax * 0.25 + bx * 0.75, top - 0.03, az * 0.25 + bz * 0.75] as any, rotation: [0, ang, 0] as any });
    b.part(new THREE.BoxGeometry(0.012, 0.012, len * 0.2), P.cream, { at: [mx, top - 0.06, mz] as any, rotation: [0, ang, 0] as any });
  }

  // weather post
  cyl(0.02, 0.7, P.wood, [1.3, 0.62, 1.55], 6);
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.015, 12), "#ffffff", { at: [1.3, 0.85, 1.575] as any, rotation: [90, 0, 0] as any });
  box(0.008, 0.05, 0.005, P.beaconRed, [1.3, 0.86, 1.585]);
  box(0.03, 0.12, 0.012, P.metal, [1.3, 0.62, 1.575]);
  sph(0.012, P.beaconRed, [1.3, 0.55, 1.575]);

  // drifts
  sph(0.22, P.snowShade, [0.6, 0.4, 1.9], [1.5, 0.5, 1]);
  sph(0.2, P.snow, [-0.7, 0.4, 1.7], [1.2, 0.45, 1.3]);
}
```

<!-- call: habModule -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHabModule({ b, P }: any) {
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], ...(rot ? { rotation: rot } : {}) });
  const rod = (a: number[], c2: number[], r: number, c: string) => b.rod(a, c2, r, c, { sides: 4 } as any);

  // Cabin dims
  const cx = -0.35, y0 = 1.08, y1 = 2.3, W = 1.5, D = 1.7;
  const fz = D / 2, sx = W / 2;

  // Stilts
  const feet: number[][] = [[-1.05, -0.85], [0.35, -0.85], [-1.05, 0.85], [0.35, 0.85], [-0.35, -0.85], [-0.35, 0.85]];
  for (const [x, z] of feet) {
    b.frustumBox([x, 0.45, z], [x, 1.03, z], [0.14, 0.14], [0.1, 0.1], { color: P.wood });
    box(0.2, 0.05, 0.2, P.woodDark, x, 0.47, z);
  }
  rod([-1.05, 0.55, 0.85], [0.35, 1.0, 0.85], 0.012, P.navy);
  rod([0.35, 0.55, 0.85], [-1.05, 1.0, 0.85], 0.012, P.navy);
  rod([-1.05, 0.55, -0.85], [0.35, 1.0, -0.85], 0.012, P.navy);

  // Deck
  box(1.7, 0.06, 1.9, P.wood, cx, 1.05, 0);
  box(1.74, 0.03, 0.03, P.cream, cx, 1.06, 0.95);
  box(1.74, 0.03, 0.03, P.cream, cx, 1.06, -0.95);
  box(0.03, 0.03, 1.9, P.cream, cx + 0.86, 1.06, 0);
  box(0.03, 0.03, 1.9, P.cream, cx - 0.86, 1.06, 0);

  // Body
  box(W, y1 - y0, D, P.hullRed, cx, (y0 + y1) / 2, 0);
  box(W + 0.04, 0.1, D + 0.04, P.navy, cx, y0 + 0.05, 0);
  for (const sxn of [-1, 1]) for (const szn of [-1, 1])
    box(0.08, y1 - y0, 0.08, P.hullRedDark, cx + sxn * (sx - 0.02), (y0 + y1) / 2, szn * (fz - 0.02));
  box(W + 0.02, 0.025, D + 0.02, P.cream, cx, 1.7, 0);
  box(W + 0.02, 0.025, D + 0.02, P.cream, cx, 2.0, 0);

  // Door (right of centre -> model right is -X)
  const dx = cx - 0.38 + 0.0;
  box(0.4, 0.78, 0.03, P.cream, -0.35 + 0.0, 1.5, fz + 0.01);
  box(0.34, 0.72, 0.04, P.woodDark, -0.35, 1.48, fz + 0.02);
  box(0.03, 0.08, 0.04, P.navy, -0.35 + 0.12, 1.5, fz + 0.05);
  void dx;

  // Windows front
  const win = (x: number, y: number, z: number, w: number, h: number, side: boolean) => {
    const dz = side ? [0.03, 0, 0] : [0, 0, 0.03];
    const fw = side ? 0.04 : w + 0.08, fd = side ? w + 0.08 : 0.04;
    box(fw, h + 0.08, fd, P.navy, x, y, z);
    const pw = side ? 0.05 : w, pd = side ? w : 0.05;
    const s = side ? Math.sign(x - cx) : 1;
    const px = x + (side ? s * 0.015 : 0), pz = z + (side ? 0 : 0.015);
    glow(box(pw, h, pd, P.windowWarm, px, y, pz), 1.2);
    glow(box(side ? 0.055 : w * 0.5, h * 0.5, side ? w * 0.5 : 0.055, P.windowWarmCore, px + (side ? s * 0.01 : 0), y, pz + (side ? 0 : 0.01)), 1.5);
    void dz;
    if (!side) box(w + 0.14, 0.03, 0.08, P.cream, x, y - h / 2 - 0.06, z + 0.03);
  };
  win(cx + 0.45, 1.65, fz + 0.01, 0.4, 0.36, false);
  win(cx - 0.45 - 0.0, 1.65, fz + 0.01, 0.0001, 0.0001, false);
  win(cx - 0.52, 1.65, fz + 0.01, 0.34, 0.36, false);
  win(cx + sx, 1.65, 0, 0.36, 0.3, true);
  win(cx - sx, 1.65, 0, 0.36, 0.3, true);

  // Roof: two slopes
  const rise = 0.6, half = W / 2 + 0.12;
  const ang = Math.atan2(rise, half) * 180 / Math.PI;
  const len = Math.hypot(rise, half);
  for (const s of [1, -1]) {
    const mx = cx + s * half / 2;
    b.part(new THREE.BoxGeometry(len, 0.07, D + 0.2), P.metalDark, { at: [mx, y1 + rise / 2 + 0.03, 0], rotation: [0, 0, -s * ang] });
    b.part(new THREE.BoxGeometry(len + 0.02, 0.08, D + 0.22), P.snow, { at: [mx, y1 + rise / 2 + 0.09, 0], rotation: [0, 0, -s * ang] });
    b.part(new THREE.BoxGeometry(0.03, 0.08, D + 0.2), P.cream, { at: [cx + s * (half + 0.0), y1 + 0.0, 0] });
  }
  box(0.2, 0.06, D + 0.22, P.snowShade, cx, y1 + rise + 0.1, 0);
  box(W + 0.28, 0.04, 0.03, P.cream, cx, y1 - 0.02, fz + 0.1);

  // Chimney
  box(0.2, 0.9, 0.2, P.rust, cx + 0.35, 2.7, -0.55);
  box(0.26, 0.05, 0.26, P.snowShade, cx + 0.35, 3.17, -0.55);
  b.part(new THREE.SphereGeometry(0.1, 7, 5), P.smoke, { at: [cx + 0.35, 3.3, -0.6], scale: [1, 0.7, 1] });
  b.part(new THREE.SphereGeometry(0.13, 7, 5), P.smoke, { at: [cx + 0.38, 3.5, -0.7], scale: [1, 0.7, 1] });
  // Stovepipe
  rod([cx - 0.3, 2.5, -0.3], [cx - 0.3, 3.05, -0.3], 0.035, P.metal);
  b.part(new THREE.CylinderGeometry(0.06, 0.04, 0.04, 8), P.metalDark, { at: [cx - 0.3, 3.07, -0.3] });
  // Vent box + antenna
  box(0.25, 0.12, 0.2, P.navy, cx - 0.1, 2.97, 0.3);
  rod([cx - 0.05, 3.0, 0.35], [cx - 0.1, 3.2, 0.4], 0.006, P.metal);

  // Stairs: 4 steps from door toward +Z
  for (let i = 0; i < 4; i++) {
    const y = 1.05 - i * 0.14, z = 0.95 + 0.1 + i * 0.1;
    box(0.5, 0.05, 0.12, P.wood, -0.35, y - 0.02, z);
    box(0.5, 0.03, 0.01, P.woodDark, -0.35, y - 0.06, z + 0.06);
  }
  for (const s of [1, -1]) {
    const x = -0.35 + s * 0.27;
    box(0.025, 0.05, 0.5, P.woodDark, x, 0.8, 1.2, [0.62, 0, 0].map(v => v * 57.3 * -1));
    rod([x, 1.3, 0.95], [x, 1.0, 1.4], 0.012, P.navy);
    rod([x, 0.75, 1.4], [x, 1.0, 1.4], 0.012, P.navy);
  }
}
```

<!-- call: utilityYard -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildUtilityYard({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0, rz = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: [0, ry, rz] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, dir: [number, number, number] = [0, 1, 0], seg = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], dir });
  const ball = (r: number, c: string, x: number, y: number, z: number, sc: [number, number, number] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at: [x, y, z], scale: sc });

  // ---- tanks (axis along Z)
  const tanks: [number, number, number][] = [
    [-1.1, 0.4 + 0.19, 1.95],
    [-0.9, 0.4 + 0.56, 1.35],
  ];
  tanks.forEach(([x, y, z], i) => {
    const Z: [number, number, number] = [0, 0, 1];
    cyl(0.175, 0.175, 0.9, P.tankTeal, x, y, z, Z, 12);
    for (const s of [1, -1]) {
      cyl(0.18, 0.18, 0.04, P.rust, x, y, z + s * 0.45, Z, 12);
      ball(0.1, P.rust, x, y, z + s * 0.47, [1, 1, 0.4]);
    }
    for (const dz of [-0.2, 0.2]) cyl(0.182, 0.182, 0.035, P.navy, x, y, z + dz, Z, 12);
    // snow on top
    box(0.18, 0.025, 0.7, P.snowShade, x, y + 0.178, z);
    // valve
    cyl(0.02, 0.02, 0.07, P.metalDark, x, y + 0.2, z - 0.1);
    cyl(0.045, 0.045, 0.012, P.metalDark, x, y + 0.245, z - 0.1);
    // cradles
    for (const dz of [-0.28, 0.28]) {
      box(0.34, 0.06, 0.08, P.woodDark, x, y - 0.17, z + dz);
      box(0.06, y - 0.4 - 0.1, 0.07, P.woodDark, x - 0.13, (y - 0.17 + 0.4) / 2, z + dz);
      box(0.06, y - 0.4 - 0.1, 0.07, P.woodDark, x + 0.13, (y - 0.17 + 0.4) / 2, z + dz);
    }
    if (i === 1) box(0.4, 0.03, 0.9, P.woodDark, x, 0.415, z);
  });

  // ---- shed
  const sx = -0.95, sz = 1.0 - 0.0, sy = 0.4;
  const sxc = -0.85, szc = 1.0;
  box(0.7, 0.6, 0.8, P.hullRed, sxc, sy + 0.3, szc - 0.55 + 0.0 + 0.55 - 0.55);
  const cz = szc - 0.55;
  for (const dx of [-0.35, 0.35]) for (const dz of [-0.4, 0.4])
    box(0.05, 0.62, 0.05, P.cream, sxc + dx, sy + 0.31, cz + dz);
  box(0.72, 0.04, 0.82, P.navy, sxc, sy + 0.02, cz);
  // lean-to roof
  b.part(new THREE.BoxGeometry(0.84, 0.05, 0.94), P.metalDark, { at: [sxc, sy + 0.66, cz], rotation: [0, 0, 6] });
  box(0.78, 0.04, 0.88, P.snowShade, sxc, sy + 0.71, cz, 0, 0.1);
  // front slit window
  glow(box(0.3, 0.07, 0.02, P.windowWarm, sxc + 0.1, sy + 0.17, cz + 0.405), 1.4);
  glow(box(0.2, 0.03, 0.022, P.windowWarmCore, sxc + 0.1, sy + 0.17, cz + 0.408), 1.6);
  // louvre vent on side
  box(0.02, 0.2, 0.26, P.navy, sxc + 0.355, sy + 0.38, cz);
  for (let i = 0; i < 4; i++) box(0.025, 0.02, 0.24, P.metalDark, sxc + 0.365, sy + 0.3 + i * 0.05, cz);
  // door
  box(0.2, 0.36, 0.02, P.woodDark, sxc - 0.18, sy + 0.2, cz + 0.405);

  // pipe tank -> shed
  cyl(0.02, 0.02, 0.5, P.metal, -0.9, 1.05, 1.62, [1, 0, 0].map((v) => v) as [number, number, number], 6);
  cyl(0.02, 0.02, 0.5, P.metal, -0.65, 0.8, 1.62, [0, 1, 0], 6);
  cyl(0.02, 0.02, 0.2, P.metal, -0.75, 0.6, 1.62, [1, 0, 0], 6);

  // ---- crates stack (right-front)
  const crate = (x: number, y: number, z: number, s: number, ry: number) => {
    box(s, s, s, P.wood, x, y, z, ry);
    for (const dx of [-1, 1]) for (const dz of [-1, 1]) {
      const o = (s / 2) * 0.96;
      const c = Math.cos((ry * Math.PI) / 180), sn = Math.sin((ry * Math.PI) / 180);
      box(0.04, s + 0.005, 0.04, P.woodDark, x + (dx * o) * c + dz * o * sn, y, z - dx * o * sn + dz * o * c, ry);
    }
    b.part(new THREE.BoxGeometry(s * 0.6, s * 0.1, 0.01), P.cream, {
      at: [x + Math.sin((ry * Math.PI) / 180) * (s / 2 + 0.003), y, z + Math.cos((ry * Math.PI) / 180) * (s / 2 + 0.003)],
      rotation: [0, ry, 0],
    });
    box(s * 0.98, 0.02, s * 0.98, P.snowShade, x, y + s / 2 + 0.005, z, ry);
  };
  crate(-0.6, 0.55, 2.0, 0.3, 10);
  crate(-0.9, 0.55, 2.0, 0.3, -8);
  crate(-0.74, 0.85, 2.0, 0.26, 20);

  // ---- barrels
  [[-0.55, 1.45], [-0.62, 1.7]].forEach(([x, z], i) => {
    cyl(0.1, 0.1, 0.3, P.rust, x, 0.5, z, [0, 1, 0], 10);
    for (const dy of [-0.08, 0.08]) cyl(0.104, 0.104, 0.03, P.navy, x, 0.5 + dy, z, [0, 1, 0], 10);
    cyl(0.1, 0.1, 0.025, P.snowShade, x, 0.665, z, [0, 1, 0], 10);
    if (i === 0) ball(0.14, P.snowShade, x + 0.05, 0.4, z + 0.12, [1, 0.3, 1]);
  });

  // ---- drift near crates
  ball(0.3, P.snowShade, -0.75, 0.4, 2.12, [1.4, 0.35, 0.8]);
  ball(0.2, P.snowShade, -1.15, 0.4, 1.9, [1.2, 0.3, 1]);

  // ---- shovel leaned on shed
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.8, 6), P.wood, { at: [-0.52, 0.85, 1.42], rotation: [0, 0, 18] });
  box(0.03, 0.04, 0.03, P.woodDark, -0.6, 1.23, 1.42);
  b.part(new THREE.BoxGeometry(0.14, 0.18, 0.02), P.metalDark, { at: [-0.4, 0.5, 1.44], rotation: [0, 0, 18] });

  // ---- sign pole
  cyl(0.02, 0.025, 1.1, P.woodDark, -1.45, 0.95, 1.2, [0, 1, 0], 6);
  box(0.3, 0.2, 0.025, P.tankTeal, -1.45, 1.4, 1.2);
  box(0.32, 0.02, 0.03, P.cream, -1.45, 1.51, 1.2);
  box(0.32, 0.02, 0.03, P.cream, -1.45, 1.29, 1.2);
  box(0.16, 0.03, 0.03, P.cream, -1.45, 1.4, 1.215);
  box(0.28, 0.02, 0.04, P.snowShade, -1.45, 1.52, 1.2);
}
```