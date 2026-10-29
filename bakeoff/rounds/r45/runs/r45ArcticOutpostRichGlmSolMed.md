<!-- call: plan -->

```json
{
  "name": "Duskwatch Arctic Outpost",
  "description": "A Firewatch-style flat-colour arctic research outpost at dusk: a stilted teal cabin with warm glowing windows, a red lattice radio tower with a lit beacon, a weather pole, and a gear yard on a sculpted snow diorama base.",
  "builderName": "arcticOutpost",
  "size": [4.8, 4.6, 5.8],
  "layout": "A low, wide snow diorama base (about 4.8 x 5.8 m, tallest drifts 0.35 m) carries everything and rests on the floor. The hero sits centre-front: a cabin raised on tall dark stilts (deck top at y 1.9), its teal plank walls cut by big warm-glowing windows and one red door, a steep dark roof with a snow cap, a smoking chimney and a small front porch with steps and a rail; it reads as the warm heart of the scene against the cold palette. Back-right (x ~1.7, z ~-1.7) stands a slender red lattice radio tower 4.4 m tall, the model's tallest silhouette, braced with guy wires, carrying two parabolic dishes, whip antennas and a glowing red beacon at its tip, with a small dark instrument shed and cable trunking at its foot. Left of the cabin (x ~-1.7, z ~0.3) a slim weather pole carries a windsock, spinning anemometer cups and a tilted solar panel. Front-right is the gear yard: stacked crates, red fuel drums, a supply sledge, a shovel and a rope coil, plus a short lantern post whose lantern glows. From front (+Z) to back: gear yard and station steps at the front edge, cabin centre, weather pole left and tower shed right behind the cabin, tower rising at the back. Style: every surface one flat colour in a Firewatch dusk palette — snow in three cool tones lit warm on top, deep teal walls with red-orange trim, dark blue-black roofs and poles, amber window glow and red beacon glow as the only bright notes; shapes are bold and chunky, edges crisp, details (plank lines, trim boards, rivets, flags, footprints) built as small parts in their own colours seated on the big shapes.",
  "palette": {
    "snowLit": "#eef3f6",
    "snowMid": "#c7d6e4",
    "snowShade": "#93aec6",
    "ice": "#bfe3ec",
    "wallTeal": "#2e6f7c",
    "wallTealDark": "#20505c",
    "trimRed": "#c8452c",
    "trimAmber": "#e8a33d",
    "roofInk": "#1c2b33",
    "stiltInk": "#26313a",
    "woodWarm": "#8a5a33",
    "woodDark": "#5d3a22",
    "steel": "#3d4a55",
    "gearGreen": "#5e7a4a",
    "ropeTan": "#c9b18a",
    "sockOrange": "#e07a2f",
    "smokePale": "#dfe8ef",
    "glowWarm": "#ffd27a",
    "glowRed": "#ff5c49",
    "inkLine": "#182028"
  },
  "mounts": {
    "groundTop": [0, 0.15, 0],
    "stiltDeck": [0, 1.9, 1.1],
    "towerFoot": [1.7, 0.18, -1.7],
    "poleFoot": [-1.7, 0.18, 0.3],
    "gearYard": [1.4, 0.16, 2.3]
  },
  "joints": [
    { "name": "outpost", "at": [0, 0, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "anemoHub", "parent": "outpost", "at": [-1.7, 2.35, 0.3], "dir": [0, 1, 0], "role": "hinge", "group": "weather" },
    { "name": "windSock", "parent": "outpost", "at": [-1.7, 1.75, 0.3], "dir": [0, 0, 1], "role": "hinge", "group": "weather" }
  ],
  "parts": [
    {
      "id": "snowBase",
      "builds": "The diorama ground: a rounded-corner snow platform slab in snowLit on top and snowShade on sides, with three or four low overlapping snow drifts (flattened spheres or lofted humps) in snowMid and snowShade building a soft skyline around the edges, highest at the back corners. A trampled path in snowShade runs from the front edge to the cabin steps, with a trail of small pressed footprint pairs (tiny flattened dark-snow ellipses in snowShade) marching along it. One or two smooth ice patches (ice) with a thin inkLine rim near the gear yard, a couple of chunky buried boulders in snowShade with ice-glazed tops, and a few scattered small snow lumps. A short wooden boundary signpost at the front-left corner in woodWarm with a small trimRed arrow board pointing at the station. Everything on the base belongs to this part; it holds no buildings, poles or gear.",
      "box": [[-2.4, 0.0, -2.9], [2.4, 0.35, 2.9]],
      "attaches": "Owns the ground plane from y 0 to y ~0.15-0.35 at the drifts; every other part stands on or sinks into it at groundTop; its footprint path lands at the cabin's steps and the gearYard mount.",
      "joints": ["outpost"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "mainStation",
      "builds": "The hero cabin on stilts. Six chunky dark stiltInk legs with cross-bracing rods run from snow (sunk into drifts) up to the stiltDeck mount at y 1.9, each foot with a small snowShade cap where it enters the snow. On the deck sits the cabin body: teal wallTeal plank walls with thin wallTealDark horizontal plank-seam strips and corner boards, one long side facing +Z with a wide picture window and two side windows — each window a recessed dark frame with a glowing warm glowWarm pane and a thin trimAmber sill, the picture window divided by a mullion cross. A trimRed plank door on the front with woodDark frame, a tiny round porthole window in glowWarm, and a small awning above it. A second smaller rear window. The steep gabled roof is roofInk with a thick snow cap (snowLit slab over the ridge and eaves, little snow lips sagging over the edges) and a woodDark ridge board. A wide stone-grey chimney in stiltInk on the roof ridge with a trimAmber band, from which three chunky flat-colour smoke puffs in smokePale rise and fade to the right. A small front porch at deck level: woodWarm deck boards on two shorter stilts, three plank steps down to the snow path, a woodDark handrail with trimAmber post caps, and a trimRed name board above the door. A tiny trimRed pennant on a short pole at the roof peak. All glowing panes use glowWarm on their own parts.",
      "box": [[-1.6, 0.3, -0.2], [1.6, 3.4, 2.4]],
      "attaches": "Stilt feet sink into snowBase around groundTop; deck sits exactly at the stiltDeck mount; the front steps meet the snowBase footprint path; nothing overlaps the tower or weather pole boxes.",
      "joints": ["outpost"],
      "floor": false,
      "budget": 260
    },
    {
      "id": "radioTower",
      "builds": "The tallest silhouette: a slim lattice radio tower at x ~1.7, z ~-1.7, standing on three short stiltInk footings sunk into the snow at the towerFoot mount. The tower is a tapering four-post frame in trimRed (Firewatch red-orange) with horizontal cross-braces every rung and X diagonals in steel, narrowing from ~0.5 m square at the base to ~0.22 m at the top, all built from thin rod and box segments. Two thin steel guy wires run from mid-tower down to snow-anchor rings on the base drifts (short dark stakes with ropeTan wire). On the mast: one large parabolic dish (a shallow lathe bowl in snowMid with a dark inkLine rim and a short arm to its feed horn) aimed at the horizon, one smaller dish aimed up-left, two whip antennas (thin steel rods with small trimAmber insulator beads), and a small dark instrument box with a trimAmber stripe lashed to the lattice. At the very tip a steel cross-tree carries a glowing glowRed beacon sphere on a short stem, the model's highest light, plus a tiny red tail antenna. At the foot sits a small instrument shed: a stiltInk box hut with a shallow snow-capped roof, one dark vent slat, a trimRed door strap, and steel cable trunking running up the tower leg. A spare coil of cable leans on the shed wall in ropeTan.",
      "box": [[0.9, 0.0, -3.2], [2.4, 4.6, -0.2]],
      "attaches": "Footings sink into snowBase at the towerFoot mount; guy wires land on snowBase drifts; the shed's snow cap matches snowBase's snow palette; its box stops short of the mainStation box so the two read side by side behind the cabin.",
      "joints": ["outpost"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "weatherStation",
      "builds": "The weather corner, left of the cabin: one slim tapered steel pole (stiltInk with a trimAmber band at each instrument) rising from a small three-leg snow shoe at the poleFoot mount to y ~2.6. At the top, an anemometer: a tiny steel hub joint (anemoHub) with three flat snowLit rotor cups on short steel arms (each cup its own part on the joint) and a small steel finial. Just below, a wind vane: a flat woodDark arrow with a trimRed tail fin on a horizontal pivot. At y ~1.75 a second joint (windSock) carries a short horizontal arm with a sockOrange windsock: a tapered cone of two flat stripes (sockOrange and snowLit) hanging and streaming backward with a ropeTan hoop at its mouth. Lower on the pole, a tilted solar panel: a steel frame slab in dark inkLine with a grid of cell seams in steel and a glass face in ice, angled toward the sky, on a short strut. A white instrument shelter box (snowLit, louvered slats in snowShade, tiny trimRed latch) hangs at chest height, plus a small steel cable running down the pole into the snow. A short snow-shoveled clearing in snowShade circles the pole foot on the base.",
      "box": [[-2.4, 0.0, -0.5], [-1.2, 2.6, 1.2]],
      "attaches": "Pole foot and its snow shoe sink into snowBase at the poleFoot mount; the anemoHub and windSock joints are pre-created at the stated positions and this part builds everything that rides them; its box stays clear of the mainStation and snowBase signpost.",
      "joints": ["outpost", "anemoHub", "windSock"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "campGear",
      "builds": "The working yard at the front-right, grounded at the gearYard mount. A stack of three crates: two large woodWarm crates with plank seams in woodDark, steel corner brackets, and a stencil-style trimAmber panel on one face, plus one smaller gearGreen crate on top with a ropeTan rope lashing over it. A leaning pair of red trimRed fuel drums with steel bung caps and a pale snowLit snow cap on the top lid, one drum standing alone half-sunk in a drift. A supply sledge: a long low woodWarm deck with curved woodDark runners, a ropeTan cargo net of crossing straps over two strapped-down duffel shapes in gearGreen and trimAmber, parked at an angle with its nose toward the path. Propped against the crates, a long-handled shovel with a steel blade and woodDark shaft. A short lantern post: a dark stiltInk post with a trimAmber cap, a small steel cross-arm, and a hanging lantern whose glass panes glow warm (glowWarm parts) under a tiny dark roof. A coil of ropeTan rope on the snow, a small stack of three steel supply canisters with trimRed lids, and one dark inkLine ice-core sample tube rack with three pale ice cores sticking up. A small trimRed flag on a short pole marks the yard's corner.",
      "box": [[0.4, 0.0, 1.9], [2.4, 1.1, 2.9]],
      "attaches": "Everything rests on snowBase inside the gearYard mount area, crates and drums sunk a few centimetres into drifts; the lantern's glow echoes the cabin windows; its box stays clear of the cabin steps and the snowBase footprint path end.",
      "joints": ["outpost"],
      "floor": false,
      "budget": 160
    }
  ]
}
```

<!-- call: mainStation -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildMainStation({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const at = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  const box = (
    size: [number, number, number],
    color: string,
    pos: [number, number, number],
    opts: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone,
      at: pos,
      ...opts,
    });

  const cyl = (
    radius: number,
    height: number,
    color: string,
    pos: [number, number, number],
    opts: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 10), color, {
      bone,
      at: pos,
      ...opts,
    });

  const sphere = (
    radius: number,
    color: string,
    pos: [number, number, number],
    opts: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
      bone,
      at: pos,
      ...opts,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    opts: Record<string, unknown> = {},
  ) => b.rod(a, c, radius, { bone, color, ...opts });

  const WALL = P.wallTeal;
  const WALL_DARK = P.wallTealDark;
  const RED = P.trimRed;
  const AMBER = P.trimAmber;
  const ROOF = P.roofInk;
  const STILT = P.stiltInk;
  const WARM = P.woodWarm;
  const WOOD = P.woodDark;
  const SNOW = P.snowLit;
  const SMOKE = P.smokePale;
  const GLOW = P.glowWarm;
  const STEEL = P.steel;
  const INK = P.inkLine;

  // ---------------------------------------------------------------------------
  // Six heavy stilts, each sunk into the snow and capped with a visible snow boot.
  // ---------------------------------------------------------------------------

  const stiltXs = [-1.18, 0, 1.18];
  const stiltZs = [0.65, 1.82];

  for (const x of stiltXs) {
    for (const z of stiltZs) {
      box([0.22, 1.62, 0.22], STILT, at(x, 1.02, z), { name: "station.stilt" });
      box([0.30, 0.13, 0.30], P.snowShade, at(x, 0.25, z), {
        name: "station.stiltSnowCap",
      });
      box([0.30, 0.13, 0.30], STILT, at(x, 1.84, z), {
        name: "station.stiltHead",
      });
    }
  }

  // Long side-to-side and fore-aft under-deck beams.
  box([2.95, 0.16, 0.18], WOOD, at(0, 1.78, 0.63), { name: "station.deckBeamFront" });
  box([2.95, 0.16, 0.18], WOOD, at(0, 1.78, 1.84), { name: "station.deckBeamBack" });
  box([0.18, 0.16, 1.48], WOOD, at(-1.31, 1.78, 1.24), { name: "station.deckBeamL" });
  box([0.18, 0.16, 1.48], WOOD, at(1.31, 1.78, 1.24), { name: "station.deckBeamR" });

  // Dark diagonal braces make the elevated cabin read structurally.
  for (const x of [-1.18, 0, 1.18]) {
    rod(at(x, 0.40, 0.66), at(x + (x > 0 ? -0.38 : 0.38), 1.72, 1.80), 0.035, STILT);
    rod(at(x, 0.40, 1.80), at(x + (x > 0 ? -0.38 : 0.38), 1.72, 0.66), 0.035, STILT);
  }
  rod(at(-1.33, 1.15, 0.62), at(1.33, 1.15, 0.62), 0.026, STEEL);
  rod(at(-1.33, 1.15, 1.84), at(1.33, 1.15, 1.84), 0.026, STEEL);

  // ---------------------------------------------------------------------------
  // Main timber platform and teal cabin shell.
  // ---------------------------------------------------------------------------

  box([3.08, 0.16, 1.78], WARM, at(0, 1.86, 1.28), {
    name: "station.mainDeck",
  });

  // Individual deck boards and dark board ends.
  for (let i = -6; i <= 6; i++) {
    box([0.19, 0.025, 1.68], WOOD, at(i * 0.23, 1.955, 1.28), {
      name: "station.deckBoard",
    });
  }
  box([3.14, 0.18, 0.10], WOOD, at(0, 1.98, 0.38), { name: "station.deckFrontTrim" });
  box([3.14, 0.18, 0.10], WOOD, at(0, 1.98, 2.17), { name: "station.deckBackTrim" });

  // Solid wall block.
  box([2.78, 0.88, 1.66], WALL, at(0, 2.38, 1.28), {
    name: "station.tealCabinBody",
  });

  // Dark horizontal plank seams on front and rear walls.
  for (const y of [2.03, 2.24, 2.45, 2.66, 2.87]) {
    box([2.72, 0.026, 0.018], WALL_DARK, at(0, y, 2.118), {
      name: "station.frontPlankSeam",
    });
    box([2.72, 0.026, 0.018], WALL_DARK, at(0, y, 0.442), {
      name: "station.rearPlankSeam",
    });
  }

  // Side-wall plank seams.
  for (const y of [2.03, 2.24, 2.45, 2.66, 2.87]) {
    box([0.018, 0.026, 1.56], WALL_DARK, at(-1.405, y, 1.28), {
      name: "station.sidePlankSeam",
    });
    box([0.018, 0.026, 1.56], WALL_DARK, at(1.405, y, 1.28), {
      name: "station.sidePlankSeam",
    });
  }

  // Four broad teal corner boards.
  for (const x of [-1.43, 1.43]) {
    for (const z of [0.40, 2.16]) {
      box([0.12, 0.94, 0.12], WALL_DARK, at(x, 2.39, z), {
        name: "station.cornerBoard",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Front picture window: deep dark recess, warm pane, cross mullions and sill.
  // ---------------------------------------------------------------------------

  box([1.44, 0.48, 0.075], ROOF, at(0, 2.46, 2.125), {
    name: "station.pictureWindowRecess",
  });
  const picturePane = box([1.27, 0.33, 0.028], GLOW, at(0, 2.46, 2.175), {
    name: "station.pictureWindowGlow",
  });
  glow(picturePane, 1.35);
  box([0.055, 0.42, 0.08], WOOD, at(0, 2.46, 2.205), {
    name: "station.pictureMullionV",
  });
  box([1.35, 0.055, 0.08], WOOD, at(0, 2.46, 2.205), {
    name: "station.pictureMullionH",
  });
  box([1.55, 0.10, 0.12], AMBER, at(0, 2.20, 2.18), {
    name: "station.pictureSill",
  });
  box([1.54, 0.07, 0.10], WOOD, at(0, 2.73, 2.18), {
    name: "station.pictureHeader",
  });

  // Side windows, placed high enough to leave chunky teal wall beneath.
  for (const s of [-1, 1]) {
    const x = s * 1.415;
    box([0.075, 0.40, 0.72], ROOF, at(x, 2.48, 1.24), {
      name: "station.sideWindowRecess",
    });
    const pane = box([0.028, 0.29, 0.58], GLOW, at(x + s * 0.045, 2.48, 1.24), {
      name: "station.sideWindowGlow",
    });
    glow(pane, 1.3);
    box([0.10, 0.07, 0.78], AMBER, at(x + s * 0.06, 2.24, 1.24), {
      name: "station.sideWindowSill",
    });
    box([0.10, 0.055, 0.76], WOOD, at(x + s * 0.06, 2.72, 1.24), {
      name: "station.sideWindowHeader",
    });
    box([0.10, 0.34, 0.055], WOOD, at(x + s * 0.06, 2.48, 0.89), {
      name: "station.sideWindowL",
    });
    box([0.10, 0.34, 0.055], WOOD, at(x + s * 0.06, 2.48, 1.59), {
      name: "station.sideWindowR",
    });
  }

  // Smaller rear window.
  box([0.72, 0.34, 0.065], ROOF, at(0, 2.48, 0.405), {
    name: "station.rearWindowRecess",
  });
  const rearPane = box([0.57, 0.22, 0.025], GLOW, at(0, 2.48, 0.365), {
    name: "station.rearWindowGlow",
  });
  glow(rearPane, 1.2);
  box([0.84, 0.08, 0.10], AMBER, at(0, 2.27, 0.34), {
    name: "station.rearWindowSill",
  });

  // ---------------------------------------------------------------------------
  // Front red door with dark casing, porthole and awning.
  // ---------------------------------------------------------------------------

  box([0.70, 0.82, 0.075], WOOD, at(0, 2.38, 2.145), {
    name: "station.doorFrame",
  });
  box([0.56, 0.70, 0.065], RED, at(0, 2.37, 2.195), {
    name: "station.redDoor",
  });
  box([0.07, 0.72, 0.09], WOOD, at(-0.32, 2.37, 2.23), {
    name: "station.doorHingeStile",
  });
  box([0.07, 0.72, 0.09], WOOD, at(0.32, 2.37, 2.23), {
    name: "station.doorLatchStile",
  });
  box([0.58, 0.07, 0.09], WOOD, at(0, 2.05, 2.23), {
    name: "station.doorBottomRail",
  });
  box([0.58, 0.055, 0.09], AMBER, at(0, 2.70, 2.23), {
    name: "station.doorHeader",
  });

  const porthole = cyl(0.105, 0.035, GLOW, at(0, 2.52, 2.245), {
    dir: [0, 0, 1],
    axis: "y",
    name: "station.doorPortholeGlow",
  });
  glow(porthole, 1.5);
  cyl(0.125, 0.028, WOOD, at(0, 2.52, 2.225), {
    dir: [0, 0, 1],
    axis: "y",
    name: "station.doorPortholeRim",
  });
  box([0.10, 0.035, 0.10], AMBER, at(0.20, 2.37, 2.255), {
    name: "station.doorHandle",
  });

  // Tiny red awning over door.
  box([0.98, 0.10, 0.34], ROOF, at(0, 2.88, 2.25), {
    rotation: [-12, 0, 0],
    name: "station.doorAwning",
  });
  box([1.00, 0.08, 0.06], RED, at(0, 2.81, 2.41), {
    rotation: [-12, 0, 0],
    name: "station.awningFrontTrim",
  });

  // Red name board above the awning.
  box([1.18, 0.15, 0.07], RED, at(0, 3.04, 2.17), {
    name: "station.nameBoard",
  });
  for (const x of [-0.42, -0.22, -0.02, 0.18, 0.38]) {
    box([0.08, 0.035, 0.015], AMBER, at(x, 3.045, 2.215), {
      name: "station.nameBoardLetter",
    });
  }

  // ---------------------------------------------------------------------------
  // Gabled roof, snow cap, eaves and ridge board.
  // ---------------------------------------------------------------------------

  const roofAngle = 31;
  const frontRoof = box([3.18, 0.16, 1.20], ROOF, at(0, 3.12, 1.77), {
    rotation: [roofAngle, 0, 0],
    name: "station.frontRoof",
  });
  const rearRoof = box([3.18, 0.16, 1.20], ROOF, at(0, 3.12, 0.79), {
    rotation: [-roofAngle, 0, 0],
    name: "station.rearRoof",
  });

  // Broad pale snow strips sitting over both roof planes.
  box([3.22, 0.13, 1.16], SNOW, at(0, 3.22, 1.78), {
    rotation: [roofAngle, 0, 0],
    name: "station.frontSnowRoof",
  });
  box([3.22, 0.13, 1.16], SNOW, at(0, 3.22, 0.78), {
    rotation: [-roofAngle, 0, 0],
    name: "station.rearSnowRoof",
  });

  // Sagging snow lips along the front and back eaves.
  box([3.28, 0.18, 0.16], SNOW, at(0, 2.78, 2.28), {
    rotation: [-4, 0, 0],
    name: "station.frontSnowLip",
  });
  box([3.28, 0.18, 0.16], SNOW, at(0, 2.78, 0.28), {
    rotation: [4, 0, 0],
    name: "station.rearSnowLip",
  });

  box([3.20, 0.15, 0.13], WOOD, at(0, 3.52, 1.28), {
    name: "station.ridgeBoard",
  });
  box([3.28, 0.15, 0.20], SNOW, at(0, 3.61, 1.28), {
    name: "station.ridgeSnowCap",
  });

  // Small red pennant at the roof peak.
  rod(at(-0.82, 3.60, 1.28), at(-0.82, 3.98, 1.28), 0.018, WOOD);
  box([0.36, 0.18, 0.025], RED, at(-0.66, 3.88, 1.28), {
    rotation: [0, 0, -8],
    name: "station.roofPennant",
  });
  box([0.08, 0.06, 0.035], AMBER, at(-0.94, 3.61, 1.28), {
    name: "station.pennantSocket",
  });

  // ---------------------------------------------------------------------------
  // Chimney, collar and three readable drifting smoke puffs.
  // ---------------------------------------------------------------------------

  box([0.32, 0.64, 0.32], STILT, at(0.62, 3.76, 1.28), {
    name: "station.chimney",
  });
  box([0.39, 0.11, 0.39], AMBER, at(0.62, 3.62, 1.28), {
    name: "station.chimneyBand",
  });
  box([0.39, 0.10, 0.39], ROOF, at(0.62, 4.09, 1.28), {
    name: "station.chimneyCap",
  });

  sphere(0.16, SMOKE, at(0.62, 4.31, 1.28), { name: "station.smokePuffA" });
  sphere(0.20, SMOKE, at(0.78, 4.54, 1.27), { name: "station.smokePuffB" });
  sphere(0.14, P.snowMid, at(1.01, 4.73, 1.27), { name: "station.smokePuffC" });

  // ---------------------------------------------------------------------------
  // Front porch, rail, steps and amber post caps.
  // ---------------------------------------------------------------------------

  box([1.05, 0.14, 0.58], WARM, at(0, 1.99, 2.42), {
    name: "station.porchDeck",
  });
  box([0.14, 0.72, 0.14], WOOD, at(-0.42, 1.60, 2.39), {
    name: "station.porchStiltL",
  });
  box([0.14, 0.72, 0.14], WOOD, at(0.42, 1.60, 2.39), {
    name: "station.porchStiltR",
  });

  for (let i = 0; i < 3; i++) {
    const y = 1.79 - i * 0.22;
    const z = 2.68 + i * 0.21;
    box([0.92 - i * 0.12, 0.13, 0.25], WARM, at(0, y, z), {
      name: "station.porchStep",
    });
    box([0.98 - i * 0.12, 0.035, 0.035], WOOD, at(0, y + 0.075, z + 0.10), {
      name: "station.stepEdge",
    });
  }

  // Porch rail posts and sloping handrail.
  for (const x of [-0.47, 0.47]) {
    rod(at(x, 2.02, 2.28), at(x, 2.52, 2.28), 0.035, WOOD);
    box([0.12, 0.07, 0.12], AMBER, at(x, 2.55, 2.28), {
      name: "station.railPostCap",
    });
  }
  rod(at(-0.47, 2.49, 2.28), at(0.47, 2.49, 2.28), 0.04, WOOD);
  rod(at(-0.47, 2.18, 2.28), at(0.47, 2.18, 2.28), 0.024, AMBER);

  // A few dark fasteners give the porch a crafted puppet-like finish.
  for (const x of [-0.37, 0.37]) {
    cyl(0.025, 0.018, INK, at(x, 2.07, 2.42), {
      dir: [0, 1, 0],
      name: "station.porchRivet",
    });
  }
}
```

<!-- call: weatherStation -->

```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export function buildWeatherStation({ b, J, P, M }: Ctx) {
  const O = J.outpost;
  const HUB = J.anemoHub;
  const SOCK = J.windSock;

  const x = -1.7;
  const z = 0.3;
  const poleBottom = 0.17;
  const poleTop = 2.6;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    opts: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone: O,
      at,
      ...opts,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    opts: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 8, 1), color, {
      bone: O,
      at,
      ...opts,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    bone: any = O,
  ) =>
    b.rod(a, c, radius, {
      color,
      bone,
      section: { ngon: 6 },
      caps: "flat",
    });

  // Shoveled snow clearing and raised snow shoe.
  b.part(
    new THREE.CylinderGeometry(0.34, 0.4, 0.055, 12),
    P.snowShade,
    {
      bone: O,
      at: [x, 0.175, z],
      scale: [1.2, 1, 0.78],
    },
  );
  b.part(
    new THREE.CylinderGeometry(0.28, 0.34, 0.018, 12),
    P.snowLit,
    {
      bone: O,
      at: [x - 0.02, 0.208, z + 0.02],
      scale: [1.25, 1, 0.8],
    },
  );

  // Three-legged snow shoe.
  cyl(0.085, 0.1, [x, 0.235, z], P.stiltInk);
  for (const [dx, dz] of [
    [-0.23, -0.1],
    [0.2, -0.12],
    [0.02, 0.23],
  ] as [number, number][]) {
    rod([x, 0.24, z], [x + dx, 0.18, z + dz], 0.028, P.stiltInk);
    box(
      [0.18, 0.035, 0.075],
      [x + dx, 0.155, z + dz],
      P.stiltInk,
      { rotation: [0, dx > 0 ? 8 : -8, 0] },
    );
    box([0.14, 0.025, 0.1], [x + dx, 0.183, z + dz], P.snowShade);
  }

  // Tapered pole.
  b.frustumBox(
    [x, poleBottom, z],
    [x, poleTop, z],
    [0.075, 0.075],
    [0.043, 0.043],
    {
      color: P.stiltInk,
      bone: O,
      section: { ngon: 6 },
    },
  );

  for (const y of [1.72, 2.16, 2.48]) {
    cyl(0.064, 0.035, [x, y, z], P.trimAmber);
  }

  rod([x + 0.01, 0.24, z + 0.01], [x + 0.01, 1.08, z + 0.01], 0.012, P.steel);

  // Three-cup anemometer on the supplied hinge joint.
  const hubAt: [number, number, number] = [-1.7, 2.35, 0.3];
  cyl(0.075, 0.09, hubAt, P.steel, { bone: HUB });

  const rotorAngles = [0, 120, 240];
  for (let i = 0; i < 3; i++) {
    const angle = (rotorAngles[i] * Math.PI) / 180;
    const ex = x + Math.sin(angle) * 0.25;
    const ez = z + Math.cos(angle) * 0.25;

    rod([x, 2.35, z], [ex, 2.35, ez], 0.014, P.steel, HUB);

    box(
      [0.105, 0.045, 0.075],
      [ex, 2.35, ez],
      P.snowLit,
      {
        bone: HUB,
        rotation: [0, rotorAngles[i] + 28, 0],
      },
    );

    box(
      [0.075, 0.012, 0.055],
      [ex, 2.325, ez],
      P.snowShade,
      {
        bone: HUB,
        rotation: [0, rotorAngles[i] + 28, 0],
      },
    );
  }

  rod([x, 2.35, z], [x, 2.53, z], 0.012, P.steel, HUB);
  cyl(0.026, 0.05, [x, 2.57, z], P.trimAmber, { bone: HUB });

  // Wind vane.
  rod([x - 0.3, 2.1, z], [x + 0.29, 2.1, z], 0.012, P.steel);

  b.extrude(
    [
      [-0.3, 0],
      [0.18, 0],
      [0.18, -0.07],
      [0.34, 0],
      [0.18, 0.07],
      [0.18, 0],
    ],
    {
      at: [x, 2.1, z],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.025,
      color: P.woodDark,
      bone: O,
    },
  );

  b.extrude(
    [
      [-0.3, 0],
      [-0.18, 0.15],
      [-0.03, 0.15],
      [-0.03, 0],
    ],
    {
      at: [x, 2.1, z - 0.015],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.035,
      color: P.trimRed,
      bone: O,
    },
  );

  cyl(0.035, 0.045, [x, 2.1, z], P.trimAmber, {
    rotation: [Math.PI / 2, 0, 0],
  });

  // Windsock arm on its supplied hinge.
  rod([x, 1.75, z], [x, 1.75, z - 0.27], 0.018, P.steel, SOCK);
  cyl(0.032, 0.055, [x, 1.75, z], P.trimAmber, {
    bone: SOCK,
    rotation: [Math.PI / 2, 0, 0],
  });

  // Alternating windsock sections.
  const sockSections = [
    [0.0, 0.12, 0.16, P.sockOrange],
    [0.12, 0.23, 0.125, P.snowLit],
    [0.23, 0.36, 0.085, P.sockOrange],
  ] as [number, number, number, string][];

  for (const [start, end, radius, color] of sockSections) {
    b.frustumBox(
      [x, 1.75, z - 0.27 - start],
      [x, 1.75, z - 0.27 - end],
      [radius, radius * 0.8],
      [radius * 0.82, radius * 0.68],
      {
        color,
        bone: SOCK,
        section: { ngon: 6 },
        caps: "flat",
      },
    );
  }

  const hoop = new THREE.TorusGeometry(0.105, 0.012, 6, 12);
  hoop.rotateX(Math.PI / 2);
  b.part(hoop, P.ropeTan, {
    bone: SOCK,
    at: [x, 1.75, z - 0.27],
  });
  rod([x, 1.75, z - 0.27], [x, 1.75, z - 0.39], 0.009, P.ropeTan, SOCK);

  // Solar-panel support and panel.
  rod([-1.92, 0.72, 0.18], [-1.92, 1.13, 0.18], 0.025, P.steel);

  const panelAt: [number, number, number] = [-1.92, 1.23, 0.16];
  const panelDir: [number, number, number] = [0, 0.86, -0.51];

  box([0.62, 0.035, 0.43], panelAt, P.inkLine, {
    dir: panelDir,
  });
  box([0.54, 0.018, 0.35], [-1.92, 1.252, 0.145], P.ice, {
    dir: panelDir,
  });

  for (const dx of [-0.18, -0.06, 0.06, 0.18]) {
    rod(
      [-1.92 + dx, 1.245, 0.0],
      [-1.92 + dx, 1.245, 0.3],
      0.006,
      P.steel,
    );
  }

  for (const yy of [1.17, 1.25, 1.33]) {
    rod([-2.18, yy, 0.15], [-1.66, yy, 0.15], 0.006, P.steel);
  }

  box([0.67, 0.035, 0.025], [-1.92, 1.1, 0.16], P.steel, {
    dir: panelDir,
  });

  // Instrument shelter with louvers.
  box([0.42, 0.32, 0.36], [-1.43, 1.34, 0.3], P.snowLit);
  box([0.46, 0.035, 0.39], [-1.43, 1.515, 0.3], P.snowShade);

  for (const yy of [1.26, 1.32, 1.38, 1.44]) {
    box([0.31, 0.022, 0.018], [-1.43, yy, 0.493], P.snowShade);
  }

  box([0.07, 0.12, 0.025], [-1.25, 1.34, 0.495], P.trimRed);
  cyl(0.018, 0.028, [-1.285, 1.34, 0.515], P.trimAmber, {
    rotation: [Math.PI / 2, 0, 0],
  });

  // Small readout, cable, and service markers.
  box([0.12, 0.12, 0.025], [-1.76, 1.04, 0.34], P.steel);
  box([0.07, 0.075, 0.012], [-1.76, 1.045, 0.357], P.trimAmber);
  b.rod([-1.76, 1.0, 0.34], [x, 0.23, z], 0.009, {
    color: P.steel,
    bone: O,
  });

  for (const yy of [0.58, 0.9, 1.3]) {
    box([0.12, 0.028, 0.035], [x - 0.055, yy, z + 0.005], P.trimAmber);
  }

  cyl(0.035, 0.045, [x, 0.22, z + 0.06], P.steel);
}
```

<!-- call: snowBase -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildSnowBase({ b, J, P, M }: any) {
  const bone = J.outpost ?? J.body;
  const R = rng(8127);

  const snowLit = P.snowLit;
  const snowMid = P.snowMid;
  const snowShade = P.snowShade;
  const ice = P.ice;
  const woodWarm = P.woodWarm;
  const trimRed = P.trimRed;
  const ink = P.inkLine;
  const woodDark = P.woodDark;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    extra: Record<string, any> = {},
  ) => b.part(geometry, color, { bone, at, ...extra });

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    extra: Record<string, any> = {},
  ) =>
    part(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      at,
      extra,
    );

  const sphere = (
    radius: number,
    scale: [number, number, number],
    color: string,
    at: [number, number, number],
  ) =>
    part(
      new THREE.SphereGeometry(radius, 10, 6),
      color,
      at,
      { scale },
    );

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    radial = 8,
    extra: Record<string, any> = {},
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, radial),
      color,
      at,
      extra,
    );

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
  ) => b.rod(a, c, radius, { bone, color, caps: "round" });

  // Broad, slightly stepped diorama plinth. The darker lower block leaves a
  // clean cool side wall while the thin upper layer reads as lit snow.
  box([4.8, 0.18, 5.8], snowShade, [0, 0.09, 0]);
  box([4.68, 0.12, 5.68], snowLit, [0, 0.21, 0]);

  // Chunky rounded corner shoulders make the rectangular slab feel sculpted.
  sphere(0.5, [1.35, 0.24, 1.3], snowMid, [-2.05, 0.27, -2.35]);
  sphere(0.5, [1.4, 0.28, 1.35], snowMid, [2.02, 0.3, -2.38]);
  sphere(0.45, [1.15, 0.2, 1.15], snowShade, [-2.15, 0.25, 2.35]);
  sphere(0.43, [1.2, 0.2, 1.15], snowShade, [2.13, 0.25, 2.35]);

  // Low overlapping edge drifts, deliberately broad and low-poly.
  sphere(0.5, [1.55, 0.42, 0.72], snowMid, [-1.75, 0.29, -2.3]);
  sphere(0.5, [1.4, 0.3, 0.85], snowShade, [1.45, 0.26, -2.38]);
  sphere(0.48, [1.4, 0.34, 0.7], snowMid, [-2.08, 0.27, 1.55]);
  sphere(0.48, [1.35, 0.4, 0.82], snowShade, [2.08, 0.31, 1.48]);
  sphere(0.42, [1.15, 0.26, 0.65], snowMid, [0.05, 0.25, -2.68]);

  // A broad trampled route from the front lip toward the station steps.
  const pathOutline: [number, number][] = [
    [-0.4, 2.92],
    [0.4, 2.92],
    [0.34, 2.35],
    [0.27, 1.75],
    [0.32, 1.16],
    [-0.32, 1.16],
    [-0.27, 1.75],
    [-0.34, 2.35],
  ];
  b.extrude(pathOutline, {
    at: [0, 0.292, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.018,
    bevel: 0.008,
    color: snowShade,
    bone,
    name: "snowBase.trampledPath",
  });

  // Pressed footprint pairs. Each is a tiny flattened oval sunk into the path.
  const footprints: Array<[number, number, number]> = [
    [-0.16, 2.67, 12],
    [0.16, 2.46, -12],
    [-0.15, 2.23, 10],
    [0.15, 2.02, -10],
    [-0.13, 1.79, 8],
    [0.13, 1.58, -8],
    [-0.11, 1.38, 6],
  ];
  for (let i = 0; i < footprints.length; i++) {
    const [x, z, yaw] = footprints[i];
    part(
      new THREE.SphereGeometry(0.105, 8, 5),
      snowShade,
      [x, 0.307, z],
      {
        scale: [0.62, 0.06, 1.2],
        rotation: [0, yaw, 0],
        name: `snowBase.footprint${i}`,
      },
    );
  }

  // Two icy, flat patches in the future gear-yard area, each with a dark rim.
  const icePatch = (x: number, z: number, sx: number, sz: number, rot: number) => {
    part(
      new THREE.CylinderGeometry(1, 1, 0.018, 12),
      ice,
      [x, 0.31, z],
      {
        scale: [sx, 1, sz],
        rotation: [0, rot, 0],
        name: "snowBase.icePatch",
      },
    );
    part(
      new THREE.TorusGeometry(1, 0.018, 5, 16),
      ink,
      [x, 0.325, z],
      {
        scale: [sx, 1, sz],
        rotation: [0, 0, 0],
        name: "snowBase.iceRim",
      },
    );
  };
  icePatch(1.48, 2.34, 0.48, 0.28, 0.22);
  icePatch(0.9, 2.68, 0.32, 0.2, -0.35);

  // Buried boulders with small blue-white glazed caps.
  sphere(0.34, [1.25, 0.85, 0.95], snowShade, [-1.68, 0.38, -1.82]);
  sphere(0.27, [1.35, 0.72, 0.9], snowShade, [2.02, 0.36, -1.12]);
  part(
    new THREE.SphereGeometry(0.23, 8, 5),
    ice,
    [-1.68, 0.58, -1.82],
    { scale: [1.1, 0.25, 0.8], rotation: [0.1, 0.25, -0.12] },
  );
  part(
    new THREE.SphereGeometry(0.18, 8, 5),
    ice,
    [2.02, 0.54, -1.12],
    { scale: [1.15, 0.22, 0.75], rotation: [-0.12, -0.2, 0.08] },
  );

  // Scattered little lumps soften the otherwise graphic platform silhouette.
  const lumps: Array<[number, number, number, number]> = [
    [-0.95, 0.34, -2.52, 0.28],
    [0.7, 0.31, -2.46, 0.23],
    [-2.12, 0.32, 0.35, 0.22],
    [2.18, 0.31, 0.65, 0.2],
    [-0.55, 0.31, 2.48, 0.18],
    [1.92, 0.34, 2.58, 0.2],
  ];
  lumps.forEach(([x, y, z, s], i) => {
    sphere(0.5, [s * 1.5, s * 0.5, s], i % 2 ? snowShade : snowMid, [x, y, z]);
  });

  // Front-left boundary marker: stout post sunk into the snow.
  cylinder(0.055, 0.62, woodWarm, [-2.08, 0.58, 2.43], 7);
  cylinder(0.08, 0.045, snowShade, [-2.08, 0.285, 2.43], 8);

  // Arrow-shaped station sign, drawn in the vertical X/Y plane and facing the viewer.
  const sign = [
    [-0.34, -0.1],
    [0.14, -0.1],
    [0.14, -0.19],
    [0.38, 0],
    [0.14, 0.19],
    [0.14, 0.1],
    [-0.34, 0.1],
  ] as [number, number][];
  b.extrude(sign, {
    at: [-2.02, 0.78, 2.43],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.045,
    bevel: 0.008,
    color: trimRed,
    bone,
    name: "snowBase.stationArrow",
  });
  box([0.24, 0.025, 0.025], woodDark, [-2.08, 0.78, 2.39], {
    rotation: [0, 0, 0],
    name: "snowBase.signLowerTrim",
  });

  // Tiny dark-red marker stakes at the two path shoulders give the ground a
  // designed, Firewatch-signage feel without competing with the cabin.
  for (const x of [-0.58, 0.58]) {
    cylinder(0.018, 0.26, woodDark, [x, 0.43, 2.83], 6);
    box([0.11, 0.035, 0.045], trimRed, [x, 0.55, 2.83]);
  }

  // A few deterministic pinprick snow facets around the boundary.
  for (let i = 0; i < 8; i++) {
    const x = -2.15 + R() * 4.3;
    const z = -2.65 + R() * 5.25;
    if (Math.abs(x) < 1.4 && z > 0.9) continue;
    sphere(0.5, [0.06, 0.035, 0.045], snowLit, [x, 0.325, z]);
  }

  // Keep the specified ground mount semantically represented by a small,
  // buried snow collar; it is hidden once the other station parts arrive.
  if (M?.groundTop) {
    sphere(0.5, [0.16, 0.035, 0.12], snowMid, [
      M.groundTop[0],
      0.318,
      M.groundTop[2],
    ]);
  }
}
```

<!-- call: campGear -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCampGear({ b, J, P, M }: Ctx) {
  const bone = J.outpost ?? J.body;
  const G = (name: string) => P[name];
  const at = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  const box = (
    name: string,
    p: [number, number, number],
    size: [number, number, number],
    color: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      name: `campGear_${name}`,
      bone,
      at: p,
      rotation,
    });

  const cyl = (
    name: string,
    p: [number, number, number],
    radius: number,
    height: number,
    color: string,
    sides = 10,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, sides), color, {
      name: `campGear_${name}`,
      bone,
      at: p,
      rotation,
    });

  const sphere = (
    name: string,
    p: [number, number, number],
    radius: number,
    color: string,
    scale?: [number, number, number],
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      name: `campGear_${name}`,
      bone,
      at: p,
      scale,
    });

  const rod = (
    name: string,
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
  ) =>
    b.rod(a, c, radius, {
      name: `campGear_${name}`,
      bone,
      color,
      sides: 8,
    });

  const wood = G("woodWarm");
  const darkWood = G("woodDark");
  const steel = G("steel");
  const red = G("trimRed");
  const amber = G("trimAmber");
  const green = G("gearGreen");
  const rope = G("ropeTan");
  const ink = G("inkLine");
  const snow = G("snowLit");
  const glowWarm = G("glowWarm");

  // ---------------------------------------------------------------------------
  // Crate stack: two broad lower crates and one smaller green crate above them.
  // ---------------------------------------------------------------------------
  const crateA: [number, number, number] = at(0.82, 0.39, 2.22);
  const crateB: [number, number, number] = at(1.27, 0.39, 2.22);
  const crateTop: [number, number, number] = at(1.05, 0.82, 2.27);

  box("crateA", crateA, [0.48, 0.42, 0.55], wood);
  box("crateB", crateB, [0.48, 0.42, 0.55], wood);
  box("crateTop", crateTop, [0.38, 0.31, 0.42], green);

  const crateFaces = [
    [0.82, 2.22],
    [1.27, 2.22],
    [1.05, 2.27],
  ];
  for (let i = 0; i < crateFaces.length; i++) {
    const [x, z] = crateFaces[i];
    const w = i === 2 ? 0.38 : 0.48;
    const y0 = i === 2 ? 0.82 : 0.39;
    const h = i === 2 ? 0.31 : 0.42;
    const d = i === 2 ? 0.42 : 0.55;

    // Front plank seams.
    for (const yy of [y0 - h * 0.18, y0 + h * 0.18]) {
      box(`crate${i}_seam_${yy}`, at(x, yy, z + d / 2 + 0.006), [w * 0.88, 0.018, 0.012], darkWood);
    }

    // Vertical corner straps.
    for (const xx of [x - w * 0.43, x + w * 0.43]) {
      box(`crate${i}_corner_${xx}`, at(xx, y0, z + d / 2 + 0.012), [0.032, h * 0.94, 0.018], steel);
    }

    // Amber stencil-like central mark.
    box(`crate${i}_stencil`, at(x, y0 + 0.015, z + d / 2 + 0.019), [w * 0.35, h * 0.28, 0.012], amber);
    box(`crate${i}_stencilCut`, at(x, y0 + 0.015, z + d / 2 + 0.027), [w * 0.18, 0.025, 0.008], wood);
  }

  // Green crate rope lashing: two bands over the top and a crosswise strap.
  for (const xx of [0.91, 1.19]) {
    rod(`topCrateLash${xx}`, at(xx, 0.98, 2.04), at(xx, 0.98, 2.50), 0.014, rope);
  }
  rod("topCrateCrossLash", at(0.84, 0.995, 2.27), at(1.26, 0.995, 2.27), 0.014, rope);
  sphere("topCrateKnot", at(1.26, 0.99, 2.27), 0.026, rope);

  // ---------------------------------------------------------------------------
  // Fuel drums: two leaning together, plus a solitary half-buried drum.
  // ---------------------------------------------------------------------------
  const drum1 = cyl("fuelDrumA", at(1.53, 0.37, 2.12), 0.16, 0.45, red, 12, [0, 0, -10]);
  const drum2 = cyl("fuelDrumB", at(1.78, 0.37, 2.12), 0.16, 0.45, red, 12, [0, 0, 9]);
  const drum3 = cyl("fuelDrumC", at(1.48, 0.29, 2.67), 0.16, 0.34, red, 12, [0, 0, 0]);

  for (const [i, x, y, z, tilt] of [
    [0, 1.53, 0.37, 2.12, -10],
    [1, 1.78, 0.37, 2.12, 9],
    [2, 1.48, 0.29, 2.67, 0],
  ] as const) {
    const topY = y + (i === 2 ? 0.19 : 0.25);
    cyl(`drumBung${i}`, at(x, topY + 0.012, z), 0.043, 0.018, steel, 8, [0, 0, tilt]);
    cyl(`drumSnowCap${i}`, at(x, topY + 0.032, z), 0.135, 0.018, snow, 12, [0, 0, tilt]);
    box(`drumBand${i}`, at(x, y, z + 0.145), [0.28, 0.025, 0.018], darkWood, [0, 0, tilt]);
  }

  // ---------------------------------------------------------------------------
  // Supply sledge, parked diagonally with its nose toward the front path.
  // ---------------------------------------------------------------------------
  const sledgeAngle = -22;
  box("sledgeDeck", at(1.92, 0.27, 2.57), [0.92, 0.12, 0.42], wood, [0, sledgeAngle, 0]);
  box("sledgeNose", at(2.37, 0.33, 2.57), [0.18, 0.12, 0.36], darkWood, [0, sledgeAngle, 0]);

  const runnerA: [number, number, number] = at(1.48, 0.14, 2.45);
  const runnerB: [number, number, number] = at(2.48, 0.14, 2.45);
  const runnerC: [number, number, number] = at(1.48, 0.14, 2.69);
  const runnerD: [number, number, number] = at(2.48, 0.14, 2.69);
  rod("sledgeRunnerNear", runnerA, runnerB, 0.035, darkWood);
  rod("sledgeRunnerFar", runnerC, runnerD, 0.035, darkWood);
  rod("sledgeRunnerTip", runnerB, at(2.54, 0.20, 2.45), 0.034, darkWood);
  rod("sledgeRunnerTipFar", runnerD, at(2.54, 0.20, 2.69), 0.034, darkWood);
  rod("sledgeCrossbarA", at(1.67, 0.24, 2.45), at(1.67, 0.24, 2.69), 0.025, darkWood);
  rod("sledgeCrossbarB", at(2.20, 0.24, 2.45), at(2.20, 0.24, 2.69), 0.025, darkWood);

  // Two duffels.
  box("duffelGreen", at(1.87, 0.48, 2.55), [0.31, 0.25, 0.28], green, [0, sledgeAngle, 0]);
  box("duffelAmber", at(2.18, 0.48, 2.57), [0.27, 0.24, 0.25], amber, [0, sledgeAngle, 0]);

  // Cargo net crossing diagonals.
  rod("netA", at(1.63, 0.63, 2.39), at(2.36, 0.63, 2.73), 0.012, rope);
  rod("netB", at(1.63, 0.63, 2.73), at(2.36, 0.63, 2.39), 0.012, rope);
  rod("netC", at(1.78, 0.66, 2.39), at(2.42, 0.66, 2.70), 0.011, rope);

  // ---------------------------------------------------------------------------
  // Shovel propped against the crate stack.
  // ---------------------------------------------------------------------------
  const shovelBottom: [number, number, number] = at(1.30, 0.25, 2.02);
  const shovelTop: [number, number, number] = at(1.12, 1.06, 2.00);
  rod("shovelShaft", shovelBottom, shovelTop, 0.018, darkWood);
  rod("shovelGrip", at(1.095, 1.04, 2.00), at(1.15, 1.04, 2.00), 0.026, darkWood);
  box("shovelBlade", at(1.315, 0.18, 2.015), [0.17, 0.24, 0.035], steel, [0, 0, -12]);
  box("shovelBladeRib", at(1.315, 0.30, 2.018), [0.025, 0.20, 0.045], ink, [0, 0, -12]);

  // ---------------------------------------------------------------------------
  // Lantern post and glowing hanging lantern.
  // ---------------------------------------------------------------------------
  cyl("lanternPost", at(2.24, 0.55, 2.12), 0.045, 0.82, ink, 8);
  cyl("lanternPostFoot", at(2.24, 0.16, 2.12), 0.11, 0.045, steel, 8);
  cyl("lanternCap", at(2.24, 0.98, 2.12), 0.075, 0.055, amber, 8);
  rod("lanternArm", at(2.24, 0.91, 2.12), at(2.24, 0.91, 2.39), 0.025, steel);
  box("lanternTop", at(2.24, 0.87, 2.39), [0.18, 0.045, 0.15], ink);

  const lanternGlass = box("lanternGlow", at(2.24, 0.73, 2.39), [0.13, 0.22, 0.11], glowWarm);
  glow(lanternGlass, 1.8);
  box("lanternFrameTop", at(2.24, 0.855, 2.39), [0.16, 0.025, 0.14], steel);
  box("lanternFrameBottom", at(2.24, 0.605, 2.39), [0.16, 0.025, 0.14], steel);
  box("lanternFrameSideL", at(2.155, 0.73, 2.39), [0.018, 0.22, 0.14], steel);
  box("lanternFrameSideR", at(2.325, 0.73, 2.39), [0.018, 0.22, 0.14], steel);
  cyl("lanternHook", at(2.24, 0.93, 2.39), 0.012, 0.10, steel, 6);

  // ---------------------------------------------------------------------------
  // Rope coil lying on the snow.
  // ---------------------------------------------------------------------------
  for (let i = 0; i < 4; i++) {
    const r = 0.19 - i * 0.032;
    const torus = new THREE.TorusGeometry(r, 0.014, 6, 16);
    b.part(torus, rope, {
      name: `campGear_ropeCoil${i}`,
      bone,
      at: at(2.00, 0.185 + i * 0.012, 2.08),
      rotation: [0, 0, 0],
    });
  }
  sphere("ropeCoilKnot", at(1.86, 0.22, 2.08), 0.027, rope);
  rod("ropeCoilTail", at(1.86, 0.21, 2.08), at(1.73, 0.20, 2.02), 0.013, rope);

  // ---------------------------------------------------------------------------
  // Three stacked steel supply canisters with red lids.
  // ---------------------------------------------------------------------------
  for (let i = 0; i < 3; i++) {
    const x = 2.05 + (i % 2) * 0.15;
    const z = 2.83 - Math.floor(i / 2) * 0.16;
    const y = 0.29 + (i % 2) * 0.19;
    cyl(`canister${i}`, at(x, y, z), 0.09, 0.28, steel, 10);
    cyl(`canisterLid${i}`, at(x, y + 0.15, z), 0.095, 0.028, red, 10);
    cyl(`canisterBung${i}`, at(x, y + 0.17, z), 0.025, 0.014, amber, 8);
    box(`canisterBand${i}`, at(x, y, z + 0.082), [0.17, 0.025, 0.012], ink);
  }

  // ---------------------------------------------------------------------------
  // Ice-core sample rack with three pale cores.
  // ---------------------------------------------------------------------------
  box("coreRack", at(2.24, 0.25, 2.78), [0.38, 0.12, 0.18], ink);
  for (let i = 0; i < 3; i++) {
    const x = 2.12 + i * 0.12;
    cyl(`iceCore${i}`, at(x, 0.45, 2.78), 0.035, 0.42, snow, 8);
    cyl(`iceCoreBand${i}`, at(x, 0.29, 2.78), 0.041, 0.025, iceColor(P), 8);
  }
  box("coreRackFront", at(2.24, 0.29, 2.88), [0.40, 0.08, 0.025], steel);

  // ---------------------------------------------------------------------------
  // Yard marker: short pole and triangular red flag.
  // ---------------------------------------------------------------------------
  rod("yardFlagPole", at(0.53, 0.18, 2.86), at(0.53, 0.82, 2.86), 0.018, darkWood);
  b.extrude(
    [
      [0, 0],
      [0.22, 0.05],
      [0, 0.19],
    ],
    {
      name: "campGear_yardFlag",
      bone,
      at: at(0.54, 0.68, 2.86),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: red,
    },
  );
  sphere("yardFlagCap", at(0.53, 0.84, 2.86), 0.032, amber);

  // A few small snow clumps visibly sink the grounded gear into the diorama.
  sphere("snowAtCrates", at(0.69, 0.18, 2.18), 0.10, snow, [1.4, 0.35, 0.8]);
  sphere("snowAtDrums", at(1.62, 0.18, 2.16), 0.095, snow, [1.7, 0.32, 0.8]);
  sphere("snowAtLantern", at(2.24, 0.18, 2.12), 0.08, snow, [1.3, 0.3, 1.0]);

  function iceColor(palette: Record<string, string>) {
    return palette.ice;
  }
}
```

<!-- call: radioTower -->

```ts
import * as THREE from "three";
import { spiral } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildRadioTower({ b, J, P, M }: Ctx) {
  const bone = J.body ?? J.outpost;
  const red = P.trimRed;
  const dark = P.stiltInk;
  const steel = P.steel;
  const snow = P.snowMid;
  const snowLit = P.snowLit;
  const rope = P.ropeTan;
  const amber = P.trimAmber;
  const ink = P.inkLine;
  const glowRed = P.glowRed;
  const wood = P.woodDark;

  const v = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    r: number,
    color: string,
    name?: string,
  ) =>
    b.rod(a, c, r, {
      color,
      bone,
      caps: "flat",
      section: { ngon: 6 },
      name,
      group: "radioTower",
    });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      flat: true,
      name,
      group: "radioTower",
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name?: string,
    segments = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      bone,
      flat: true,
      name,
      group: "radioTower",
    });

  const towerX = 1.7;
  const towerZ = -1.7;
  const levels = [0.2, 0.92, 1.64, 2.36, 3.08, 3.8, 4.18];
  const widths = [0.5, 0.45, 0.4, 0.35, 0.3, 0.255, 0.22];

  // Three chunky footings, deliberately buried into the snow.
  const footings: [number, number, number][] = [
    v(towerX - 0.21, 0.16, towerZ - 0.2),
    v(towerX + 0.21, 0.16, towerZ - 0.2),
    v(towerX, 0.16, towerZ + 0.22),
  ];
  footings.forEach((p, i) => {
    box([0.16, 0.28, 0.16], p, dark, `towerFoot${i}`);
    box([0.2, 0.035, 0.2], v(p[0], 0.31, p[2]), snow, `buriedFootCap${i}`);
  });

  // Four tapered red legs. Each span is a separately readable puppet-like member.
  for (let i = 0; i < 4; i++) {
    const sx = i < 2 ? -1 : 1;
    const sz = i % 2 === 0 ? -1 : 1;
    for (let j = 0; j < levels.length - 1; j++) {
      const a = v(
        towerX + sx * widths[j] * 0.5,
        levels[j],
        towerZ + sz * widths[j] * 0.5,
      );
      const c = v(
        towerX + sx * widths[j + 1] * 0.5,
        levels[j + 1],
        towerZ + sz * widths[j + 1] * 0.5,
      );
      b.frustumBox(
        a,
        c,
        [0.045, 0.045],
        [0.039, 0.039],
        {
          color: red,
          bone,
          section: "box",
          caps: "flat",
          name: `redTowerLeg${i}_${j}`,
          group: "radioTower",
        },
      );
    }
  }

  // Horizontal perimeter rungs.
  for (let j = 0; j < levels.length; j++) {
    const y = levels[j];
    const w = widths[j];
    rod(v(towerX - w / 2, y, towerZ - w / 2), v(towerX + w / 2, y, towerZ - w / 2), 0.025, red, `frontRung${j}`);
    rod(v(towerX - w / 2, y, towerZ + w / 2), v(towerX + w / 2, y, towerZ + w / 2), 0.025, red, `backRung${j}`);
    rod(v(towerX - w / 2, y, towerZ - w / 2), v(towerX - w / 2, y, towerZ + w / 2), 0.025, red, `leftRung${j}`);
    rod(v(towerX + w / 2, y, towerZ - w / 2), v(towerX + w / 2, y, towerZ + w / 2), 0.025, red, `rightRung${j}`);
  }

  // Steel X-braces on each bay, with alternating visual emphasis.
  for (let j = 0; j < levels.length - 1; j++) {
    const y0 = levels[j];
    const y1 = levels[j + 1];
    const w0 = widths[j];
    const w1 = widths[j + 1];
    const faces = [
      [
        v(towerX - w0 / 2, y0, towerZ - w0 / 2),
        v(towerX + w1 / 2, y1, towerZ - w1 / 2),
        v(towerX + w0 / 2, y0, towerZ - w0 / 2),
        v(towerX - w1 / 2, y1, towerZ - w1 / 2),
      ],
      [
        v(towerX - w0 / 2, y0, towerZ + w0 / 2),
        v(towerX + w1 / 2, y1, towerZ + w1 / 2),
        v(towerX + w0 / 2, y0, towerZ + w0 / 2),
        v(towerX - w1 / 2, y1, towerZ + w1 / 2),
      ],
      [
        v(towerX - w0 / 2, y0, towerZ - w0 / 2),
        v(towerX - w1 / 2, y1, towerZ + w1 / 2),
        v(towerX - w0 / 2, y0, towerZ + w0 / 2),
        v(towerX - w1 / 2, y1, towerZ - w1 / 2),
      ],
      [
        v(towerX + w0 / 2, y0, towerZ - w0 / 2),
        v(towerX + w1 / 2, y1, towerZ + w1 / 2),
        v(towerX + w0 / 2, y0, towerZ + w0 / 2),
        v(towerX + w1 / 2, y1, towerZ - w1 / 2),
      ],
    ];
    for (let f = 0; f < faces.length; f++) {
      rod(faces[f][0], faces[f][1], 0.014, steel, `crossBrace${j}_${f}a`);
      rod(faces[f][2], faces[f][3], 0.014, steel, `crossBrace${j}_${f}b`);
    }
  }

  // Guy wires and their small dark snow anchors.
  const guyStarts = [
    v(towerX - 0.19, 2.45, towerZ - 0.19),
    v(towerX + 0.19, 2.45, towerZ + 0.19),
  ];
  const guyEnds = [v(1.0, 0.22, -2.62), v(2.38, 0.22, -0.92)];
  for (let i = 0; i < 2; i++) {
    rod(guyEnds[i], v(guyEnds[i][0], 0.12, guyEnds[i][2]), 0.035, dark, `guyStake${i}`);
    rod(guyStarts[i], guyEnds[i], 0.009, rope, `guyWire${i}`);
    cylinder(0.035, 0.018, v(guyEnds[i][0], 0.245, guyEnds[i][2]), dark, `guyAnchorRing${i}`, 8);
  }

  // Instrument shed at the tower foot.
  box([0.62, 0.48, 0.52], v(1.15, 0.42, -1.23), dark, "instrumentShed");
  box([0.7, 0.055, 0.58], v(1.15, 0.69, -1.23), snow, "shedSnowCap");
  box([0.55, 0.035, 0.48], v(1.15, 0.73, -1.23), snowLit, "shedSnowTop");
  box([0.035, 0.24, 0.15], v(1.15, 0.39, -0.958), red, "shedDoorStrap");
  box([0.22, 0.045, 0.025], v(1.15, 0.49, -0.961), ink, "shedVent");
  for (let i = 0; i < 3; i++) {
    box([0.18, 0.012, 0.018], v(1.15, 0.51 + i * 0.045, -0.972), steel, `shedVentSlat${i}`);
  }
  rod(v(1.44, 0.24, -1.35), v(1.56, 1.12, -1.82), 0.025, steel, "cableTrunk");
  rod(v(1.46, 0.25, -1.32), v(1.58, 1.1, -1.78), 0.009, amber, "cableHighlight");

  // Spare cable coil leaning against the shed.
  const coilPath = spiral(
    v(1.46, 0.32, -0.94),
    v(1.46, 0.32, -0.94),
    [0, 0.26, 0],
    { turns: 2.5, r1: 0.045, pitch: 0.045 },
  );
  b.sweep(coilPath, 0.012, {
    color: rope,
    bone,
    caps: "round",
    name: "spareCableCoil",
    group: "radioTower",
  });

  // Main parabolic dish, aimed toward the horizon (+Z).
  const dishAt = v(1.32, 2.83, -1.7);
  b.lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.34, 0.035],
      [0.28, 0.075],
      [0.14, 0.13],
      [0, 0.17],
    ],
    {
      at: dishAt,
      axis: [0, 0, 1],
      segments: 12,
      color: snow,
      bone,
      name: "largeRadioDish",
      group: "radioTower",
    },
  );
  // Dark polygonal rim around the bowl.
  const dishRim: [number, number, number][] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    dishRim.push(v(dishAt[0] + 0.345 * Math.cos(a), dishAt[1] + 0.345 * Math.sin(a), dishAt[2] + 0.006));
  }
  for (let i = 0; i < 12; i++) rod(dishRim[i], dishRim[(i + 1) % 12], 0.012, ink, `dishRim${i}`);
  rod(dishAt, v(dishAt[0], dishAt[1], dishAt[2] + 0.27), 0.018, steel, "largeDishFeedArm");
  cylinder(0.045, 0.07, v(dishAt[0], dishAt[1], dishAt[2] + 0.3), amber, "largeDishFeedHorn", 8);

  // Small dish angled up and left.
  const smallAt = v(2.03, 3.2, -1.7);
  const smallAim: [number, number, number] = [-0.42, 0.48, 0.25];
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.2, 0.025],
      [0.145, 0.06],
      [0.06, 0.1],
      [0, 0.12],
    ],
    {
      at: smallAt,
      axis: smallAim,
      segments: 10,
      color: snow,
      bone,
      name: "smallRadioDish",
      group: "radioTower",
    },
  );
  const smallRimA = v(1.86, 3.2, -1.7);
  rod(smallRimA, v(1.86, 3.25, -1.67), 0.011, ink, "smallDishRim");
  rod(smallAt, v(1.86, 3.42, -1.59), 0.012, steel, "smallDishArm");
  cylinder(0.027, 0.05, v(1.84, 3.46, -1.57), amber, "smallDishFeed", 7);

  // Instrument box lashed to the upper lattice.
  box([0.26, 0.28, 0.18], v(1.93, 2.25, -1.48), dark, "upperInstrumentBox");
  box([0.275, 0.035, 0.19], v(1.93, 2.35, -1.48), amber, "instrumentStripe");
  rod(v(1.79, 2.12, -1.55), v(2.07, 2.12, -1.55), 0.012, rope, "instrumentLashLower");
  rod(v(1.79, 2.39, -1.41), v(2.07, 2.39, -1.41), 0.012, rope, "instrumentLashUpper");

  // Two whip antennas with amber insulator beads.
  rod(v(1.53, 3.83, -1.7), v(1.42, 4.38, -1.67), 0.012, steel, "whipA");
  rod(v(1.87, 3.88, -1.7), v(2.0, 4.34, -1.76), 0.012, steel, "whipB");
  cylinder(0.035, 0.05, v(1.42, 4.17, -1.67), amber, "whipInsulatorA", 8);
  cylinder(0.035, 0.05, v(1.97, 4.13, -1.75), amber, "whipInsulatorB", 8);

  // Beacon cross-tree, red lamp, and tail antenna.
  rod(v(1.59, 4.18, -1.7), v(1.81, 4.18, -1.7), 0.018, steel, "beaconCrossTree");
  rod(v(towerX, 4.18, towerZ), v(towerX, 4.29, towerZ), 0.022, steel, "beaconStem");
  const beacon = b.part(new THREE.SphereGeometry(0.095, 10, 6), glowRed, {
    at: v(towerX, 4.39, towerZ),
    bone,
    flat: true,
    name: "redBeacon",
    group: "radioTower",
  });
  glow(beacon, 2.2);
  rod(v(towerX, 4.47, towerZ), v(towerX, 4.6, towerZ), 0.009, red, "beaconTailAntenna");
  cylinder(0.035, 0.025, v(towerX, 4.28, towerZ), amber, "beaconCollar", 8);
}
```