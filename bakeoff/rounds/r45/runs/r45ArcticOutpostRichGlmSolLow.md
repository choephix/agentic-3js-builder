<!-- call: plan -->

```json
{
  "name": "Frostline Station 9",
  "description": "A Firewatch-style arctic research outpost diorama: a red-roofed timber cabin with glowing windows on a snow-cut platform, a tall guyed radio mast with a lit beacon, a storage shed, and scattered crates, barrels, a sled and a snowmobile, all flat-coloured with bold warm-and-cold contrasts.",
  "builderName": "arcticOutpost",
  "size": [3.8, 4.7, 5.4],
  "layout": "The diorama reads as a warm island in a cold field. A snow platform covers the whole footprint with sculpted drifts, a darker packed-snow path running front (+Z) to back, and exposed rock chunks at the edges; a plank deck is raised on the platform at its centre-left. The main cabin (centre-left, roughly x -1.2..0.6, z -0.8..0.9) stands on the deck: dark timber walls, a steep Firewatch orange-red gabled roof, yellow trim boards, a teal door, a stone chimney with a pale smoke wisp of cards, and warm glowing windows set in dark frames. A tall lattice radio mast rises at the right rear (x ~1.35, z ~-1.7) to y 4.6: steel-dark legs, a radar dish aimed up-forward, cross-braces, guy ropes and a red glowing beacon at the tip. Left rear sits a small timber storage shed (x -1.6..-0.7, z -2.2..-1.1) with the same roof colour and a tilted weather-vane pole. The front strip (z 0.7..2.5) holds the props: a wood sled with steel runners, a stack of crates, a ring of red fuel drums, a compact snowmobile in teal with steel skis, and a row of fence posts with a windsock on a pole at the far front-right. Style: every surface one flat colour, chunky readable silhouettes, warm oranges and yellows on cabin, roof, door glow and drums against cool blue-white snow and grey-blue steel, small parts (trim, bands, frames, flags) as their own flat-coloured pieces seated on the surfaces.",
  "palette": {
    "snow": "#eef4f7",
    "snowShade": "#c9dbe8",
    "iceDeep": "#8fb8cf",
    "rock": "#7c8894",
    "timber": "#6b4a35",
    "timberLight": "#a8815c",
    "plank": "#8a6244",
    "roof": "#d1542f",
    "roofTrim": "#8a3520",
    "trimYellow": "#e8b83a",
    "doorTeal": "#2e7f86",
    "windowGlow": "#ffd47a",
    "frameDark": "#3a2a22",
    "steel": "#9aa7b2",
    "steelDark": "#4a5560",
    "beaconRed": "#ff5a4d",
    "dish": "#d9e4ec",
    "crate": "#b98a52",
    "crateLid": "#7a5a34",
    "barrel": "#c34a2e",
    "barrelBand": "#3a3f46",
    "rope": "#caa06a",
    "smokePale": "#e8eef2",
    "flagRed": "#e0482f"
  },
  "mounts": {
    "deckTop": [-0.3, 0.55, 0.05],
    "snowPadRight": [1.35, 0.42, -1.7],
    "snowPadLeft": [-1.15, 0.45, -1.65],
    "groundLine": [0, 0.0, 0]
  },
  "joints": [],
  "parts": [
    {
      "id": "snowBase",
      "builds": "The snow platform the whole station stands on: a big low chunky snow slab (rounded box/loft silhouette) from x -1.9..1.9, z -2.8..2.6, top y ~0.35-0.5, standing on y=0. Cut a darker packed-snow path strip running front to back across it (snowShade) and a few iceDeep patches. Sculpt 6-8 snow drifts (squashed spheres/cones in snow and snowShade) pressed against where cabin, shed and mast bases sit. Scatter 4-5 low rock chunks (rock colour, angular boxes/prisms half-sunk) along the left, right and back edges. Build the raised plank deck at the deckTop mount: a plank (plank colour) platform ~1.9 x 1.1 with visible edge boards (timberLight), short timber stilt legs down into the snow, and 3-4 plank steps at the front edge down the drift. Also lay 2-3 flat stepping stones (rock) on the path toward the shed and mast. Keep the platform simpler than the buildings: broad shapes, no fine noise.",
      "box": [[-1.9, 0.0, -2.8], [1.9, 0.6, 2.6]],
      "attaches": "Owns the ground line; deckTop mount is the exact deck surface where the cabin sits; snowPadRight and snowPadLeft are the flattened snow pads under the mast base and shed; drifts rise toward the other parts' boxes but stay below their boxes' floors.",
      "joints": [],
      "floor": true,
      "budget": 170
    },
    {
      "id": "mainCabin",
      "builds": "The hero cabin on the deckTop mount, centred around x -0.3, z 0.05: a timber body (timber walls, horizontal plank boards suggested by 3-4 thin timberLight board strips as parts on each long wall) roughly 1.7 wide x 1.1 deep, from y 0.55 to y 1.95, with a steep gabled roof (roof colour) peaked at y 2.6, roofTrim fascia boards along the eaves, and a yellow trimYellow corner trim and door frame. Front faces +Z: a teal doorTeal door with a frameDark frame and trimYellow lintel, one big glowing windowGlow window left of the door and a smaller one right, both in frameDark frames with 2-3 muntin bars, plus a trimYellow-framed small gable window under the peak. A rock-coloured stone chimney climbs the right wall to y 2.9 with a frameDark cap and a smoke wisp: 4-6 smokePale cards drifting up and back on their own frames. Add a small porch: two timber posts, a plank awning strip of roof under the main roof line, and a glowing porch lamp (windowGlow dome on a steelDark bracket) beside the door. Signature detail: a trimYellow station sign board on the wall above the door with 3-4 small frameDark notches as painted lettering blocks, and a rope-and-post boot scraper by the steps.",
      "box": [[-1.35, 0.55, -0.9], [0.75, 3.0, 1.0]],
      "attaches": "Rests exactly on the deckTop mount (floor at y 0.55); porch posts land on the deck; chimney and roof peak stay inside this box; nothing hangs below the deck.",
      "joints": [],
      "floor": false,
      "budget": 230
    },
    {
      "id": "radioMast",
      "builds": "A tall guyed radio mast at the snowPadRight mount (x ~1.35, z ~-1.7): three tapering steelDark leg rods converging from a triangular ~0.5 m base at y 0.4 to a single pole reaching y 4.5, with 5-6 horizontal steel cross-brace rings and X-braces (thin steel rods) up the height, and small steelDark platform collars. At the top: a dish (dish colour, a lathe or squashed-cone bowl ~0.45 across) on a short steel boom, tilted aiming up-forward (+Z, ~35 deg elevation) on the pole's front side at y ~3.4, with a feed horn rod in its centre. The tip carries a beaconRed glowing beacon dome (y ~4.5) and two thin steel whip antennas angled out. Three guy ropes (thin rope-colour rods) run from y ~3.8 down to three snow-anchored blocks (rock chunks on the snowPadRight pad). Halfway up add a small timberLight equipment box and a short crossarm with two tiny windowGlow lamp pods. Signature: a trimYellow and flagRed striped hazard band wrapped at the mast base and a small directional arrow vane (frameDark) under the dish.",
      "box": [[0.8, 0.4, -2.6], [1.9, 4.7, -0.8]],
      "attaches": "Base feet sit on the snowPadRight mount; guy-rope anchors land on the snow surface inside this box; the mast tip is the model's highest point.",
      "joints": [],
      "floor": false,
      "budget": 180
    },
    {
      "id": "storageShed",
      "builds": "The small storage shed on the snowPadLeft mount (centred x ~-1.15, z ~-1.65): a timber shed ~0.9 x 0.7 footprint, walls y 0.45..1.35 (timber with one timberLight board strip), a single-slope roof of roof colour with roofTrim edge, doorTeal double doors with frameDark frames and trimYellow hinges, a small glowing windowGlow porthole high on the side wall in a frameDark ring, and a short steel chimney stub. In front of the shed: a row of three upright tool handles/skis leaning against the wall (timberLight and steel), a barrel with a snow cap (barrel body, snow top) beside the door, and a dim trimYellow lantern hanging from the eave on a rope hook (glow). Beside the shed, a weather station: a timberLight pole to y 2.0 with a small white-lattice radiation shield box (snow colour), a rotating-cup anemometer of steel cross-arms and cups at the top, and a small flagRed pennant flag card on a short arm. Also build the far front-right windsock here: a steelDark pole at x ~1.5, z ~2.2 to y 1.7, with a horizontal steel arm and a snowShade-and-flagRed striped cone sock of cards or a swept cone pointing back (toward -Z, blowing inland), plus 4-5 fence posts (timber, frameDark caps) with two rope lines running along the front path between them.",
      "box": [[-1.9, 0.4, -2.4], [1.75, 2.1, 2.6]],
      "attaches": "Shed floor rests on the snowPadLeft mount; weather pole and windsock poles and fence posts plant into the snow; flag and sock cards attach at their pole tips; all stays inside this box.",
      "joints": [],
      "floor": false,
      "budget": 160
    },
    {
      "id": "props",
      "builds": "The working clutter of the station across the front strip (z 0.7..2.6) on the snow: a wood sled (crate-coloured runners and deck slats with crateLid rails, steel runner blades, a coiled rope rope-colour on top) lying flat near the path at x ~-0.6, z ~1.6; a stack of three crates (crate with crateLid lids and frameDark edge battens, one tilted, one with a trimYellow stencil bar) beside the cabin steps at x ~0.6, z ~1.0; a cluster of four fuel drums (barrel colour with two barrelBand rings each, one drum steelDark, one with a snow cap) standing in a loose ring at x ~1.3, z ~0.9; a compact snowmobile parked angled at x ~-1.0, z ~1.3 facing front-left: doorTeal body shell with trimYellow accent stripe, frameDark seat and windshield, steel skis and a small flagRed pennant on its rear rack; a pair of scattered snow-shoveled crates and a snow-covered plank; and 4-5 small details: a shovel (timberLight handle, steel blade) stuck in a drift, a steel bucket, a small stack of cut firewood (timber cylinders) by the shed path, and 3-4 tiny snow-topped crates half-buried near the back. Where snow sits on top of props, add snow-caps (snow colour flattened spheres/boxes) so everything reads as weathered in place.",
      "box": [[-1.7, 0.4, 0.6], [1.9, 1.6, 2.6]],
      "attaches": "Everything rests on the snow surface of snowBase (tops of drifts vary; sink prop bottoms slightly into the snow); the sled and snowmobile flank the packed path; the crate stack leans against the cabin's front steps.",
      "joints": [],
      "floor": false,
      "budget": 160
    }
  ]
}
```

<!-- call: radioMast -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";
import { createBuilder, frame, line, polyline, rng } from "agentic-3js-builder";

export function buildRadioMast({ b, J, P, M }: Ctx) {
  const steel = P.steel;
  const dark = P.steelDark;
  const rope = P.rope;
  const rock = P.rock;
  const dishCol = P.dish;
  const light = P.windowGlow;
  const beaconCol = P.beaconRed;
  const yellow = P.trimYellow;
  const flag = P.flagRed;
  const wood = P.timberLight;
  const ink = P.frameDark;

  const cx = M.snowPadRight[0];
  const cz = M.snowPadRight[2];
  const baseY = 0.43;
  const topY = 4.43;

  const v = (x: number, y: number, z: number): [number, number, number] => [cx + x, y, cz + z];

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) => b.rod(a, c, radius, { color, section: { ngon: 6 }, name });

  const capsule = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) => b.capsule(a, c, radius, { color, sides: 6, name });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      flat: true,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, {
      at,
      dir,
      name,
      flat: true,
    });

  // Three-legged tapered lattice tower.
  const base: [number, number, number][] = [
    v(-0.24, baseY, -0.18),
    v(0.24, baseY, -0.18),
    v(0, baseY, 0.27),
  ];
  const apex = v(0, topY, 0);

  for (let i = 0; i < 3; i++) {
    rod(base[i], apex, 0.027, dark, `mastLeg${i}`);
    box([0.12, 0.045, 0.12], [base[i][0], baseY - 0.01, base[i][2]], rock, `mastFoot${i}`);
  }

  // Cross-brace levels and triangular collar rings.
  const levels = [0.82, 1.42, 2.02, 2.62, 3.22, 3.78];
  const ringPoints = (y: number) => {
    const t = (y - baseY) / (topY - baseY);
    const pts: [number, number, number][] = [];
    for (const p of base) {
      pts.push([
        p[0] * (1 - t) + apex[0] * t,
        y,
        p[2] * (1 - t) + apex[2] * t,
      ]);
    }
    return pts;
  };

  for (let li = 0; li < levels.length; li++) {
    const pts = ringPoints(levels[li]);
    for (let i = 0; i < 3; i++) {
      rod(pts[i], pts[(i + 1) % 3], 0.014, steel, `collarRail${li}_${i}`);
    }
    const centre = [
      (pts[0][0] + pts[1][0] + pts[2][0]) / 3,
      levels[li],
      (pts[0][2] + pts[1][2] + pts[2][2]) / 3,
    ] as [number, number, number];
    cylinder(0.045, 0.035, centre, dark, [0, 1, 0], `platformCollar${li}`);

    if (li > 0) {
      const prev = ringPoints(levels[li - 1]);
      for (let i = 0; i < 3; i++) {
        rod(prev[i], pts[(i + 1) % 3], 0.010, steel, `crossX${li}_${i}a`);
        rod(prev[i], pts[(i + 2) % 3], 0.010, steel, `crossX${li}_${i}b`);
      }
    }
  }

  // Dark central mast cap and slim tip pole.
  cylinder(0.055, 0.25, v(0, 4.36, 0), dark, [0, 1, 0], "tipPole");

  // Alternating hazard bands around the triangular base.
  for (let i = 0; i < 3; i++) {
    const p = base[i];
    const q: [number, number, number] = [p[0], p[1] + 0.045, p[2]];
    cylinder(0.041, 0.045, q, i % 2 ? flag : yellow, [0, 1, 0], `hazardBand${i}`);
  }

  // Guy ropes and three anchor blocks.
  const guyTop = v(0, 3.72, 0);
  const anchors: [number, number, number][] = [
    v(-0.52, 0.48, -0.42),
    v(0.53, 0.48, -0.40),
    v(0.02, 0.48, 0.58),
  ];
  for (let i = 0; i < anchors.length; i++) {
    box([0.16, 0.10, 0.13], anchors[i], rock, `guyAnchor${i}`);
    rod(guyTop, anchors[i], 0.009, rope, `guyRope${i}`);
    cylinder(0.012, 0.16, [anchors[i][0], anchors[i][1] + 0.075, anchors[i][2]], dark, [0, 1, 0], `anchorPeg${i}`);
  }

  // Equipment box half way up, with a small hatch and latch.
  const equipAt = v(0.16, 2.12, 0.02);
  box([0.30, 0.34, 0.26], equipAt, wood, "equipmentBox");
  box([0.20, 0.19, 0.012], [equipAt[0], equipAt[1], equipAt[2] + 0.137], dark, "equipmentHatch");
  box([0.045, 0.012, 0.028], [equipAt[0], equipAt[1] + 0.015, equipAt[2] + 0.148], yellow, "equipmentLatch");

  // Crossarm and two warm service lamps.
  const armY = 2.43;
  rod(v(-0.34, armY, 0), v(0.34, armY, 0), 0.018, dark, "lampCrossarm");
  for (const s of [-1, 1]) {
    const lamp = b.part(new THREE.SphereGeometry(0.045, 8, 6), light, {
      at: v(s * 0.31, armY - 0.035, 0.015),
      scale: [1, 0.75, 1],
      name: `mastLamp${s > 0 ? "R" : "L"}`,
    });
    glow(lamp, 1.6);
    cylinder(0.012, 0.07, v(s * 0.31, armY + 0.035, 0), dark, [0, 1, 0], `lampStem${s}`);
  }

  // Forward-facing radar dish on a boom, tilted 35 degrees upward.
  const aimDir = new THREE.Vector3(0, Math.sin(35 * Math.PI / 180), Math.cos(35 * Math.PI / 180)).normalize();
  const aimArray: [number, number, number] = [aimDir.x, aimDir.y, aimDir.z];
  const dishCentre = v(0, 3.48, 0.18);
  rod(v(0, 3.48, 0), dishCentre, 0.022, dark, "dishBoom");

  const dish = b.part(new THREE.SphereGeometry(0.225, 12, 7), dishCol, {
    at: dishCentre,
    dir: aimArray,
    scale: [1, 0.18, 1],
    name: "radarDish",
    flat: true,
  });
  // Raised feed arm and horn, following the same look direction.
  const feedBase: [number, number, number] = [
    dishCentre[0] + aimDir.x * 0.03,
    dishCentre[1] + aimDir.y * 0.03,
    dishCentre[2] + aimDir.z * 0.03,
  ];
  const feedTip: [number, number, number] = [
    dishCentre[0] + aimDir.x * 0.30,
    dishCentre[1] + aimDir.y * 0.30,
    dishCentre[2] + aimDir.z * 0.30,
  ];
  rod(feedBase, feedTip, 0.012, steel, "feedArm");
  const horn = b.part(new THREE.ConeGeometry(0.045, 0.10, 8), dishCol, {
    at: feedTip,
    dir: aimArray,
    name: "feedHorn",
    flat: true,
  });

  // Directional arrow vane below the dish.
  const vaneY = 3.14;
  rod(v(-0.18, vaneY, 0), v(0.20, vaneY, 0), 0.010, ink, "directionVane");
  b.part(new THREE.ConeGeometry(0.045, 0.14, 4), ink, {
    at: v(0.27, vaneY, 0),
    dir: [1, 0, 0],
    name: "directionArrow",
    flat: true,
  });

  // Red beacon at the very tip, plus two outward whip antennas.
  const beacon = b.part(new THREE.SphereGeometry(0.075, 10, 6), beaconCol, {
    at: v(0, 4.50, 0),
    scale: [1, 0.8, 1],
    name: "redBeacon",
  });
  glow(beacon, 2.2);

  rod(v(0, 4.50, 0), v(-0.16, 4.69, 0.02), 0.006, steel, "whipAntennaL");
  rod(v(0, 4.50, 0), v(0.16, 4.69, 0.02), 0.006, steel, "whipAntennaR");

  // Tiny warning pennant on the equipment side.
  rod(v(0.18, 2.62, 0), v(0.42, 2.62, 0), 0.008, dark, "warningArm");
  b.extrude(
    [
      [0, 0],
      [0.20, 0.055],
      [0, 0.11, "sharp"],
    ],
    {
      at: v(0.40, 2.62, 0),
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.006,
      color: flag,
      name: "warningPennant",
    },
  );
}
```

<!-- call: snowBase -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildSnowBase({ b, J, P, M }: Ctx) {
  const snow = P.snow;
  const shade = P.snowShade;
  const ice = P.iceDeep;
  const rock = P.rock;
  const plank = P.plank;
  const timber = P.timberLight;
  const dark = P.frameDark;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      name: "snowBaseBox",
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    rotation?: [number, number, number],
    sides = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius * 0.94, height, sides), color, {
      at,
      rotation,
      name: "snowBaseCylinder",
    });

  const sphere = (
    radius: [number, number, number],
    at: [number, number, number],
    color: string,
  ) => {
    const p = b.part(new THREE.SphereGeometry(1, 10, 6), color, {
      at,
      scale: radius,
      name: "snowBaseDrift",
    });
    return p;
  };

  // Main chunky snow island. Its broad, irregular-looking border is built from overlapping slabs.
  box([3.8, 0.34, 5.4], [0, 0.17, -0.1], snow);
  box([3.55, 0.16, 5.05], [0, 0.39, -0.1], snow);
  box([3.35, 0.10, 4.55], [0, 0.50, -0.1], snow);

  // Low stepped perimeter snow lips, giving the platform a cut, graphic silhouette.
  box([3.8, 0.20, 0.28], [0, 0.38, -2.63], shade);
  box([3.8, 0.16, 0.22], [0, 0.48, -2.48], snow);
  box([0.25, 0.20, 4.65], [-1.77, 0.38, -0.08], shade);
  box([0.22, 0.16, 4.30], [1.77, 0.48, -0.08], snow);
  box([2.85, 0.14, 0.25], [0.05, 0.47, 2.38], shade);

  // Packed-snow road, deliberately broad enough to read from the camera.
  box([0.58, 0.026, 4.62], [0.12, 0.548, -0.08], shade);
  box([0.38, 0.012, 4.48], [0.12, 0.568, -0.08], ice);

  // Graphic ice plates embedded in the snow.
  box([0.52, 0.018, 0.24], [-1.28, 0.565, 1.86], ice, [0, -12, 0]);
  box([0.34, 0.018, 0.62], [1.18, 0.565, 0.30], ice, [0, 18, 0]);
  box([0.74, 0.018, 0.22], [-0.40, 0.565, -2.18], ice, [0, -8, 0]);
  box([0.24, 0.016, 0.48], [1.53, 0.565, 1.54], ice, [0, 22, 0]);

  // Eight broad drifts around the building footprints and equipment pads.
  sphere([0.62, 0.22, 0.34], [-1.18, 0.58, -0.72], snow);
  sphere([0.45, 0.18, 0.30], [-1.52, 0.57, -1.65], snow);
  sphere([0.42, 0.16, 0.30], [-0.72, 0.57, -2.06], shade);
  sphere([0.55, 0.19, 0.34], [1.28, 0.58, -1.72], snow);
  sphere([0.40, 0.15, 0.26], [1.60, 0.57, -1.10], shade);
  sphere([0.48, 0.16, 0.30], [0.90, 0.57, -2.34], snow);
  sphere([0.52, 0.17, 0.31], [-1.70, 0.57, 0.25], snow);
  sphere([0.44, 0.14, 0.28], [1.62, 0.57, 0.58], snow);

  // Angular exposed rocks along the rim, sunk halfway into the snow.
  const rocks: Array<[number, number, number, number, number, number]> = [
    [-1.67, 0.55, -2.42, 0.34, 0.24, 0.28],
    [1.62, 0.55, -2.38, 0.30, 0.22, 0.25],
    [-1.78, 0.55, 1.92, 0.29, 0.20, 0.34],
    [1.73, 0.55, 2.05, 0.34, 0.22, 0.26],
    [-1.48, 0.55, 0.82, 0.24, 0.18, 0.27],
  ];
  rocks.forEach(([x, y, z, sx, sy, sz], i) => {
    b.part(new THREE.DodecahedronGeometry(0.5, 0), rock, {
      at: [x, y, z],
      scale: [sx, sy, sz],
      rotation: [0, i * 19, i * 7],
      name: "snowBaseRock",
    });
  });

  // Raised timber deck: exact top is y=.55, matching deckTop.
  box([1.92, 0.12, 1.10], [-0.30, 0.49, 0.05], plank);
  box([1.98, 0.14, 0.10], [-0.30, 0.56, -0.49], timber);
  box([1.98, 0.14, 0.10], [-0.30, 0.56, 0.59], timber);
  box([0.10, 0.14, 0.90], [-1.25, 0.56, 0.05], timber);
  box([0.10, 0.14, 0.90], [0.65, 0.56, 0.05], timber);

  // Visible deck boards.
  for (let i = 0; i < 7; i++) {
    box([0.055, 0.018, 0.92], [-1.12 + i * 0.27, 0.565, 0.05], timber);
  }

  // Four short legs, disappearing naturally into snow.
  for (const x of [-1.08, 0.48]) {
    for (const z of [-0.36, 0.46]) {
      box([0.13, 0.34, 0.13], [x, 0.34, z], timber);
      box([0.18, 0.035, 0.18], [x, 0.18, z], dark);
    }
  }

  // Three broad front steps descending toward the packed path.
  box([0.78, 0.10, 0.25], [-0.30, 0.47, 0.69], plank);
  box([0.66, 0.10, 0.24], [-0.30, 0.38, 0.88], timber);
  box([0.54, 0.10, 0.23], [-0.30, 0.29, 1.07], plank);
  box([0.42, 0.08, 0.20], [-0.30, 0.21, 1.25], timber);

  // Simple stepping stones leading from the path toward the shed and mast.
  const stones: Array<[number, number, number, number, number]> = [
    [-0.70, 0.585, -0.90, 0.25, 0.16],
    [-0.92, 0.585, -1.30, 0.22, 0.14],
    [-1.12, 0.585, -1.70, 0.27, 0.17],
    [0.55, 0.585, -1.02, 0.25, 0.14],
    [0.86, 0.585, -1.40, 0.22, 0.15],
  ];
  stones.forEach(([x, y, z, sx, sz], i) => {
    b.part(new THREE.CylinderGeometry(1, 0.92, 0.055, 6), rock, {
      at: [x, y, z],
      scale: [sx, 1, sz],
      rotation: [0, i * 23, 0],
      name: "snowBaseSteppingStone",
    });
  });

  // A few small snow ridges feather the otherwise hard edge of the platform.
  box([0.78, 0.10, 0.18], [-1.28, 0.59, 1.98], snow);
  box([0.64, 0.08, 0.16], [1.25, 0.59, 2.16], snow);
  box([0.55, 0.09, 0.18], [-1.55, 0.59, -0.46], snow);
  box([0.48, 0.075, 0.14], [1.54, 0.59, -0.38], snow);

  // Small rectangular anchor pads for the future mast guy ropes.
  box([0.22, 0.10, 0.22], [0.78, 0.58, -2.12], rock);
  box([0.22, 0.10, 0.22], [1.78, 0.58, -1.68], rock);
  box([0.22, 0.10, 0.22], [1.08, 0.58, -1.02], rock);
}
```

<!-- call: storageShed -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";
import { frame } from "agentic-3js-builder";

export function buildStorageShed({ b, J, P, M }: Ctx) {
  const timber = P.timber;
  const lightWood = P.timberLight;
  const roof = P.roof;
  const roofTrim = P.roofTrim;
  const teal = P.doorTeal;
  const dark = P.frameDark;
  const yellow = P.trimYellow;
  const steel = P.steel;
  const steelDark = P.steelDark;
  const snow = P.snow;
  const snowShade = P.snowShade;
  const red = P.flagRed;
  const barrel = P.barrel;
  const rope = P.rope;

  const box = (size: [number, number, number], at: [number, number, number], color: string, rotation?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      name: "storageShed.box",
      group: "storageShed",
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    segments = 8,
    dir?: [number, number, number],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      dir,
      name: "storageShed.cylinder",
      group: "storageShed",
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
  ) => b.rod(a, c, radius, { color, group: "storageShed", name: "storageShed.rod" });

  const slab = (points: [number, number, number][], color: string) =>
    b.slab(points, { color, thickness: 0.018, group: "storageShed", name: "storageShed.slab" });

  const at = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  // Shed body: compact timber walls, slightly sunk into the snow pad.
  box([0.92, 0.88, 0.70], at(-1.18, 0.86, -1.66), timber);
  box([0.98, 0.07, 0.72], at(-1.18, 0.445, -1.66), dark);

  // Horizontal plank seam strips on the visible front and side.
  for (const y of [0.62, 0.88, 1.14]) {
    box([0.88, 0.025, 0.012], at(-1.18, y, -1.305), lightWood);
    box([0.012, 0.025, 0.64], at(-1.638, y, -1.66), lightWood);
  }

  // Corner posts and lower sill.
  for (const x of [-1.64, -0.72]) {
    box([0.075, 0.96, 0.075], at(x, 0.91, -1.305), lightWood);
    box([0.075, 0.96, 0.075], at(x, 0.91, -2.015), lightWood);
  }
  box([0.98, 0.08, 0.08], at(-1.18, 0.49, -1.305), lightWood);

  // Single-slope roof, rising toward the back (-Z).
  box([1.10, 0.12, 0.84], at(-1.18, 1.43, -1.66), roof, [12, 0, 0]);
  box([1.16, 0.055, 0.07], at(-1.18, 1.34, -1.245), roofTrim, [12, 0, 0]);
  box([1.16, 0.055, 0.07], at(-1.18, 1.53, -2.075), roofTrim, [12, 0, 0]);
  box([0.075, 0.12, 0.84], at(-1.715, 1.43, -1.66), roofTrim, [12, 0, 0]);
  box([0.075, 0.12, 0.84], at(-0.645, 1.43, -1.66), roofTrim, [12, 0, 0]);

  // Front double doors facing +Z.
  box([0.38, 0.62, 0.035], at(-1.18, 0.82, -1.295), teal);
  box([0.035, 0.70, 0.07], at(-1.405, 0.82, -1.275), dark);
  box([0.035, 0.70, 0.07], at(-0.955, 0.82, -1.275), dark);
  box([0.50, 0.07, 0.07], at(-1.18, 1.17, -1.275), dark);
  box([0.50, 0.065, 0.045], at(-1.18, 1.205, -1.275), yellow);
  for (const x of [-1.34, -1.02]) {
    box([0.025, 0.10, 0.025], at(x, 0.82, -1.245), yellow);
    cyl(0.018, 0.035, at(x, 0.82, -1.215), dark, 8, [0, 0, 1]);
  }
  box([0.025, 0.025, 0.025], at(-1.20, 0.83, -1.225), dark);
  box([0.025, 0.025, 0.025], at(-1.16, 0.83, -1.225), dark);

  // Side porthole on the left wall: dark surround, glowing centre and cross muntins.
  cyl(0.115, 0.035, at(-1.655, 1.10, -1.67), dark, 12, [1, 0, 0]);
  const porthole = cyl(0.083, 0.040, at(-1.682, 1.10, -1.67), P.windowGlow, 12, [1, 0, 0]);
  glow(porthole, 0.8);
  box([0.012, 0.17, 0.025], at(-1.707, 1.10, -1.67), dark, [0, 0, 0]);
  box([0.012, 0.025, 0.17], at(-1.707, 1.10, -1.67), dark, [0, 0, 0]);

  // Short chimney stub with cap.
  box([0.18, 0.30, 0.18], at(-0.84, 1.62, -1.86), steelDark);
  box([0.24, 0.045, 0.24], at(-0.84, 1.785, -1.86), dark);
  box([0.22, 0.035, 0.22], at(-0.84, 1.81, -1.86), snow);

  // Three leaning skis/tool handles against the front-left corner.
  rod(at(-1.55, 0.48, -1.21), at(-1.48, 1.40, -1.24), 0.018, lightWood);
  rod(at(-1.48, 0.48, -1.21), at(-1.36, 1.34, -1.24), 0.015, steel);
  rod(at(-1.41, 0.48, -1.20), at(-1.27, 1.27, -1.24), 0.015, lightWood);
  slab([at(-1.57, 0.48, -1.23), at(-1.50, 0.48, -1.23), at(-1.43, 0.53, -1.24), at(-1.50, 0.53, -1.24)], steel);

  // Barrel beside the doors with two dark hoops and a snow cap.
  cyl(0.14, 0.30, at(-0.70, 0.61, -1.26), barrel, 10);
  for (const y of [0.52, 0.70]) {
    cyl(0.148, 0.025, at(-0.70, y, -1.26), dark, 10);
  }
  box([0.20, 0.035, 0.20], at(-0.70, 0.775, -1.26), snow);

  // Hanging lantern under the eave.
  rod(at(-0.75, 1.34, -1.24), at(-0.75, 1.18, -1.24), 0.009, rope);
  box([0.10, 0.025, 0.10], at(-0.75, 1.17, -1.24), dark);
  const lantern = cyl(0.045, 0.075, at(-0.75, 1.11, -1.24), yellow, 8);
  glow(lantern, 0.65);
  box([0.12, 0.018, 0.12], at(-0.75, 1.155, -1.24), dark);

  // Weather station mast beside the shed.
  rod(at(-0.42, 0.43, -1.78), at(-0.42, 2.00, -1.78), 0.025, lightWood);
  box([0.19, 0.25, 0.19], at(-0.42, 1.33, -1.78), snow);
  for (const y of [1.24, 1.42]) {
    box([0.23, 0.018, 0.018], at(-0.42, y, -1.78), steel);
    box([0.018, 0.018, 0.23], at(-0.42, y, -1.78), steel);
  }
  // Cross-arm and four cup anemometer cups.
  rod(at(-0.42, 1.99, -1.78), at(-0.42, 2.12, -1.78), 0.012, steelDark);
  rod(at(-0.42, 2.06, -1.78), at(-0.22, 2.06, -1.78), 0.012, steel);
  rod(at(-0.42, 2.06, -1.78), at(-0.62, 2.06, -1.78), 0.012, steel);
  rod(at(-0.42, 2.06, -1.78), at(-0.42, 2.06, -1.98), 0.012, steel);
  rod(at(-0.42, 2.06, -1.78), at(-0.42, 2.06, -1.58), 0.012, steel);
  for (const p of [[-0.20, 2.06, -1.78], [-0.64, 2.06, -1.78], [-0.42, 2.06, -1.99], [-0.42, 2.06, -1.57]] as [number, number, number][]) {
    cyl(0.045, 0.045, p, steel, 8, [0, 0, 1]);
  }
  // Small weather flag.
  rod(at(-0.42, 1.92, -1.78), at(-0.22, 1.92, -1.78), 0.009, steelDark);
  slab([at(-0.22, 1.92, -1.78), at(-0.05, 1.86, -1.78), at(-0.22, 1.80, -1.78)], red);

  // Far front-right windsock pole and arm.
  rod(at(1.45, 0.43, 2.18), at(1.45, 1.72, 2.18), 0.026, steelDark);
  box([0.10, 0.05, 0.10], at(1.45, 1.74, 2.18), dark);
  rod(at(1.45, 1.62, 2.18), at(1.45, 1.62, 1.85), 0.014, steel);
  // Alternating flat cone panels, widening toward the blowing (-Z) end.
  const sockPath = [
    at(1.45, 1.62, 1.85),
    at(1.45, 1.60, 1.68),
    at(1.45, 1.57, 1.50),
  ];
  b.sweep(sockPath, [0.045, 0.075], { color: red, section: { ngon: 6 }, caps: "point", group: "storageShed", name: "storageShed.windsockRed" });
  b.sweep([at(1.45, 1.62, 1.85), at(1.45, 1.60, 1.68)], [0.047, 0.060], {
    color: snowShade,
    section: { ngon: 6 },
    caps: "flat",
    group: "storageShed",
    name: "storageShed.windsockStripe",
  });

  // Front fence: four posts and two sagging rope lines.
  const posts: [number, number, number][] = [
    [-1.75, 0.48, 1.95],
    [-1.10, 0.48, 2.12],
    [-0.42, 0.48, 2.16],
    [0.28, 0.48, 2.10],
  ];
  for (const [x, y, z] of posts) {
    rod(at(x, y, z), at(x, 1.02, z), 0.032, timber);
    box([0.09, 0.06, 0.09], at(x, 1.04, z), dark);
    box([0.13, 0.025, 0.13], at(x, 0.49, z), snow);
  }
  b.sweep(
    [
      posts[0],
      at(-1.43, 0.84, 2.04),
      at(-0.76, 0.80, 2.14),
      at(-0.07, 0.84, 2.13),
      posts[3],
    ],
    0.012,
    { color: rope, group: "storageShed", name: "storageShed.fenceRopeUpper" },
  );
  b.sweep(
    [
      at(posts[0][0], 0.68, posts[0][2]),
      at(-1.43, 0.60, 2.04),
      at(-0.76, 0.58, 2.14),
      at(-0.07, 0.61, 2.13),
      at(posts[3][0], 0.68, posts[3][2]),
    ],
    0.010,
    { color: rope, group: "storageShed", name: "storageShed.fenceRopeLower" },
  );

  // A few snow caps make the whole shed feel weathered and anchored.
  box([0.30, 0.035, 0.12], at(-1.18, 1.52, -2.00), snow);
  box([0.18, 0.035, 0.16], at(-0.70, 0.79, -1.26), snow);
  box([0.12, 0.028, 0.12], at(-0.42, 1.47, -1.78), snowShade);
}
```

<!-- call: mainCabin -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildMainCabin({ b, J, P, M }: Ctx) {
  const timber = P.timber;
  const timberLight = P.timberLight;
  const plank = P.plank;
  const roof = P.roof;
  const roofTrim = P.roofTrim;
  const yellow = P.trimYellow;
  const teal = P.doorTeal;
  const glowColor = P.windowGlow;
  const dark = P.frameDark;
  const stone = P.rock;
  const steel = P.steelDark;
  const rope = P.rope;
  const smoke = P.smokePale;

  const cabinX = -0.3;
  const cabinY = 1.25;
  const cabinZ = 0.05;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    extra: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone: J.body,
      ...extra,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    radial = 8,
    extra: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      bone: J.body,
      ...extra,
    });

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
  ) => b.rod(a, z, radius, { color, bone: J.body, section: { ngon: 6 } });

  const glowingBox = (
    size: [number, number, number],
    at: [number, number, number],
    strength = 1.5,
  ) => glow(box(size, at, glowColor), strength);

  const glowingCylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    strength = 1.5,
  ) => glow(cylinder(radius, height, at, glowColor, 10), strength);

  // Main dark timber cabin shell, resting exactly on the deck at y = 0.55.
  box([1.72, 1.38, 1.08], [cabinX, 1.24, cabinZ], timber);

  // Slightly lighter lower sill and heavy corner posts.
  box([1.78, 0.13, 1.14], [cabinX, 0.60, cabinZ], timberLight);
  for (const x of [-1.12, 0.52]) {
    box([0.13, 1.42, 0.13], [x, 1.28, cabinZ - 0.01], timberLight);
  }

  // Horizontal plank suggestions on both long side walls.
  for (const y of [0.78, 1.04, 1.30, 1.56, 1.82]) {
    box([1.50, 0.045, 0.018], [cabinX, y, 0.598], timberLight);
    box([1.50, 0.045, 0.018], [cabinX, y, -0.498], timberLight);
  }

  // Back wall cross-braces and side board seams.
  box([0.045, 1.16, 0.025], [-1.12, 1.28, -0.505], timberLight);
  box([0.045, 1.16, 0.025], [0.52, 1.28, -0.505], timberLight);
  for (const x of [-0.86, -0.30, 0.26]) {
    box([0.025, 1.20, 0.025], [x, 1.28, -0.565], timberLight);
  }

  // Steep Firewatch roof: two chunky sloping planes meeting at a high ridge.
  const roofHalf = 0.62;
  const roofAngle = Math.atan2(0.58, 0.86) * 180 / Math.PI;
  const roofLength = Math.sqrt(0.86 * 0.86 + 0.58 * 0.58) + 0.10;

  box(
    [roofLength, 0.11, 1.28],
    [-0.735, 2.27, cabinZ],
    roof,
    { rotation: [0, 0, -roofAngle] },
  );
  box(
    [roofLength, 0.11, 1.28],
    [0.135, 2.27, cabinZ],
    roof,
    { rotation: [0, 0, roofAngle] },
  );

  // Roof ridge cap and bold eave fascia.
  box([0.14, 0.13, 1.34], [cabinX, 2.58, cabinZ], roofTrim);
  box([0.10, 0.16, 1.34], [-1.14, 1.96, cabinZ], roofTrim, {
    rotation: [0, 0, -roofAngle],
  });
  box([0.10, 0.16, 1.34], [0.54, 1.96, cabinZ], roofTrim, {
    rotation: [0, 0, roofAngle],
  });
  box([1.78, 0.09, 0.10], [cabinX, 1.93, 0.61], roofTrim);
  box([1.78, 0.09, 0.10], [cabinX, 1.93, -0.51], roofTrim);

  // Front door: dark surround, teal leaf, yellow lintel and hinges.
  box([0.53, 1.02, 0.075], [-0.10, 1.10, 0.615], dark);
  box([0.40, 0.91, 0.035], [-0.10, 1.08, 0.658], teal);
  box([0.48, 0.075, 0.10], [-0.10, 1.58, 0.685], yellow);
  box([0.075, 1.08, 0.09], [-0.36, 1.10, 0.675], yellow);
  box([0.075, 1.08, 0.09], [0.16, 1.10, 0.675], yellow);
  cylinder(0.025, 0.035, [0.04, 1.08, 0.692], yellow, 8, {
    dir: [0, 0, 1],
  });
  box([0.13, 0.035, 0.035], [-0.10, 1.08, 0.687], dark);
  cylinder(0.018, 0.06, [-0.10, 1.08, 0.70], yellow, 8, {
    dir: [0, 0, 1],
  });

  // Large left front window with deep frame, glowing pane, and muntins.
  box([0.52, 0.66, 0.075], [-0.82, 1.34, 0.615], dark);
  glowingBox([0.40, 0.53, 0.025], [-0.82, 1.34, 0.662], 1.8);
  for (const x of [-0.82]) box([0.035, 0.55, 0.035], [x, 1.34, 0.688], dark);
  for (const y of [1.34]) box([0.42, 0.035, 0.035], [-0.82, y, 0.69], dark);
  box([0.58, 0.07, 0.08], [-0.82, 1.70, 0.68], yellow);

  // Smaller right window.
  box([0.34, 0.48, 0.075], [0.36, 1.36, 0.615], dark);
  glowingBox([0.23, 0.34, 0.025], [0.36, 1.36, 0.662], 1.7);
  box([0.032, 0.36, 0.035], [0.36, 1.36, 0.688], dark);
  box([0.25, 0.032, 0.035], [0.36, 1.36, 0.69], dark);
  box([0.40, 0.055, 0.08], [0.36, 1.63, 0.68], yellow);

  // Gable face, triangular trim and small upper window.
  b.extrude(
    [
      [0, 0],
      [0.86, 0],
      [0.43, 0.58],
    ],
    {
      at: [-0.73, 1.96, 0.60],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      color: timber,
      bone: J.body,
    },
  );
  rod([-1.13, 1.96, 0.635], [-0.30, 2.57, 0.635], 0.035, yellow);
  rod([-0.30, 2.57, 0.635], [0.53, 1.96, 0.635], 0.035, yellow);
  box([0.30, 0.27, 0.05], [-0.30, 2.20, 0.67], dark);
  glowingBox([0.20, 0.17, 0.025], [-0.30, 2.20, 0.704], 1.8);
  box([0.025, 0.19, 0.03], [-0.30, 2.20, 0.728], yellow);
  box([0.22, 0.025, 0.03], [-0.30, 2.20, 0.73], yellow);

  // Stone chimney on the cabin's right rear shoulder.
  box([0.28, 0.88, 0.30], [0.39, 2.31, -0.28], stone);
  for (const y of [2.03, 2.29, 2.55]) {
    box([0.30, 0.025, 0.32], [0.39, y, -0.28], timberLight);
  }
  box([0.38, 0.10, 0.40], [0.39, 2.78, -0.28], dark);
  box([0.30, 0.05, 0.32], [0.39, 2.84, -0.28], stone);

  // Smoke puffs, kept chunky and pale, drifting upward and toward the back.
  const smokePuffs: Array<[number, number, number, number]> = [
    [0.39, 2.96, -0.28, 0.11],
    [0.34, 3.12, -0.34, 0.13],
    [0.25, 3.27, -0.43, 0.10],
    [0.18, 3.40, -0.51, 0.075],
    [0.10, 3.51, -0.60, 0.055],
  ];
  for (const [x, y, z, r] of smokePuffs)
    b.part(new THREE.SphereGeometry(r, 7, 5), smoke, {
      at: [x, y, z],
      bone: J.body,
      scale: [1.0, 0.8, 0.72],
    });

  // Small porch roof projecting over the front door.
  box([0.88, 0.10, 0.36], [-0.10, 1.84, 0.78], roofTrim);
  box([0.82, 0.08, 0.30], [-0.10, 1.91, 0.76], roof);
  box([0.10, 0.88, 0.10], [-0.48, 1.23, 0.77], timberLight);
  box([0.10, 0.88, 0.10], [0.28, 1.23, 0.77], timberLight);
  box([0.95, 0.10, 0.12], [-0.10, 0.61, 0.77], timberLight);

  // Porch lamp on a dark bracket beside the door.
  rod([0.30, 1.46, 0.70], [0.30, 1.46, 0.82], 0.018, steel);
  box([0.25, 0.04, 0.04], [0.30, 1.46, 0.79], steel);
  glowingCylinder(0.075, 0.10, [0.30, 1.52, 0.81], 2.0);
  box([0.12, 0.025, 0.08], [0.30, 1.59, 0.81], dark);

  // Station sign above the entry, with blocky lettering marks.
  box([0.72, 0.20, 0.065], [-0.10, 1.78, 0.70], yellow);
  box([0.62, 0.045, 0.025], [-0.10, 1.78, 0.74], timberLight);
  for (const x of [-0.34, -0.20, -0.06, 0.08, 0.22]) {
    box([0.055, 0.075, 0.025], [x, 1.78, 0.765], dark);
  }

  // Boot scraper: two short posts, rope rail, and dark metal scraping bar.
  box([0.06, 0.34, 0.06], [-0.53, 0.80, 0.88], timberLight);
  box([0.06, 0.34, 0.06], [-0.28, 0.80, 0.88], timberLight);
  rod([-0.53, 0.94, 0.88], [-0.28, 0.94, 0.88], rope, 0.012);
  box([0.34, 0.045, 0.045], [-0.405, 0.64, 0.88], steel);
  for (const x of [-0.50, -0.42, -0.34, -0.26]) {
    box([0.018, 0.10, 0.07], [x, 0.70, 0.88], steel);
  }

  // A few warm trim nails and corner fasteners for the close-up silhouette.
  for (const x of [-1.12, 0.52]) {
    for (const y of [0.82, 1.18, 1.54]) {
      cylinder(0.018, 0.025, [x, y, 0.675], yellow, 6, {
        dir: [0, 0, 1],
      });
    }
  }

  // Small snow caps where the cabin meets the winter platform.
  box([0.28, 0.06, 0.28], [-1.03, 0.61, -0.40], P.snow);
  box([0.24, 0.05, 0.24], [0.40, 0.61, 0.38], P.snow);
}
```

<!-- call: props -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildProps({ b, J, P, M }: Ctx) {
  const dark = P.frameDark;
  const steel = P.steel;
  const teal = P.doorTeal;
  const snow = P.snow;
  const crate = P.crate;
  const lid = P.crateLid;
  const red = P.barrel;
  const band = P.barrelBand;
  const rope = P.rope;
  const yellow = P.trimYellow;
  const wood = P.timberLight;
  const blade = P.steelDark;
  const flag = P.flagRed;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      name,
      flat: true,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    rotation?: [number, number, number],
    name?: string,
    radial = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial, 1), color, {
      at,
      rotation,
      name,
      flat: true,
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    scale?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      at,
      scale,
      name,
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) => b.rod(a, c, radius, { color, caps: "round", name });

  const rngProps = rng(19);

  // ---------------------------------------------------------------------------
  // SLED: low wooden runners, slatted bed, rails, rope coil and snow dusting.
  // ---------------------------------------------------------------------------
  const sledX = -0.62;
  const sledZ = 1.72;

  for (const x of [sledX - 0.24, sledX + 0.24]) {
    rod(
      [x, 0.47, sledZ - 0.34],
      [x, 0.49, sledZ + 0.38],
      0.027,
      blade,
      "sledSteelRunner",
    );
    rod(
      [x, 0.51, sledZ - 0.36],
      [x, 0.56, sledZ + 0.34],
      0.045,
      crate,
      "sledWoodRunner",
    );
    rod(
      [x, 0.57, sledZ - 0.38],
      [x, 0.67, sledZ - 0.47],
      0.035,
      crate,
      "sledUpturnedNose",
    );
  }

  for (let i = 0; i < 5; i++) {
    const z = sledZ - 0.28 + i * 0.16;
    box([0.58, 0.055, 0.105], [sledX, 0.68, z], crate, [0, 0, 0], "sledSlat");
  }
  for (const x of [sledX - 0.27, sledX + 0.27]) {
    box([0.055, 0.11, 0.72], [x, 0.73, sledZ], lid, [0, 0, 0], "sledSideRail");
  }
  for (const z of [sledZ - 0.34, sledZ + 0.34]) {
    box([0.62, 0.12, 0.055], [sledX, 0.75, z], lid, [0, 0, 0], "sledEndRail");
  }

  // Rope coil made from several short overlapping rings.
  for (let i = 0; i < 4; i++) {
    const r = 0.07 - i * 0.012;
    cyl(0.012, 0.014, [sledX + 0.09, 0.81 + i * 0.006, sledZ + 0.02], rope, [0, 0, 0], "sledRope", 10);
    b.part(new THREE.TorusGeometry(r, 0.009, 5, 12), rope, {
      at: [sledX + 0.09, 0.82 + i * 0.006, sledZ + 0.02],
      rotation: [0, 0, 0],
      name: "sledRopeCoil",
      flat: true,
    });
  }
  box([0.22, 0.025, 0.12], [sledX - 0.12, 0.815, sledZ - 0.12], snow, [0, 0, 0], "sledSnowCap");

  // ---------------------------------------------------------------------------
  // CRATE STACK beside the cabin steps.
  // ---------------------------------------------------------------------------
  const crateBase: [number, number, number] = [0.56, 0.51, 1.02];

  const makeCrate = (
    at: [number, number, number],
    size: [number, number, number],
    tiltZ = 0,
    stencil = false,
  ) => {
    box(size, at, crate, [0, 0, tiltZ], "propCrate");
    const [w, h, d] = size;
    const z = at[2] + d / 2 + 0.004;
    box([w * 0.84, 0.035, 0.025], [at[0], at[1], z], lid, [0, 0, tiltZ], "crateLid");
    box([0.035, h * 0.9, 0.035], [at[0] - w * 0.42, at[1], z], dark, [0, 0, tiltZ], "crateBatton");
    box([0.035, h * 0.9, 0.035], [at[0] + w * 0.42, at[1], z], dark, [0, 0, tiltZ], "crateBatton");
    if (stencil)
      box([w * 0.52, 0.045, 0.012], [at[0], at[1] + 0.02, z + 0.02], yellow, [0, 0, tiltZ], "crateStencil");
  };

  makeCrate([crateBase[0], 0.63, crateBase[2]], [0.42, 0.25, 0.38], 0, true);
  makeCrate([crateBase[0] - 0.03, 0.89, crateBase[2] + 0.01], [0.37, 0.25, 0.34], 0, false);
  makeCrate([crateBase[0] + 0.04, 1.15, crateBase[2] - 0.01], [0.34, 0.23, 0.31], -0.11, false);
  box([0.27, 0.035, 0.23], [crateBase[0] + 0.04, 1.29, crateBase[2] - 0.01], snow, [0, 0, -0.11], "crateSnow");

  // Two half-buried scattered supply crates.
  makeCrate([-1.38, 0.49, 1.03], [0.32, 0.20, 0.29], 0.04, false);
  box([0.27, 0.025, 0.24], [-1.38, 0.605, 1.03], snow, [0, 0, 0.04], "smallCrateSnow");
  makeCrate([1.72, 0.47, 1.95], [0.29, 0.18, 0.27], -0.06, false);
  box([0.23, 0.022, 0.22], [1.72, 0.57, 1.95], snow, [0, 0, -0.06], "smallCrateSnow");

  // ---------------------------------------------------------------------------
  // FUEL DRUM CLUSTER, four vertical chunky cylinders with bands and caps.
  // ---------------------------------------------------------------------------
  const drums: Array<[number, number, string]> = [
    [1.22, 0.92, red],
    [1.55, 0.91, red],
    [1.38, 1.18, red],
    [1.72, 1.18, blade],
  ];
  for (let i = 0; i < drums.length; i++) {
    const [x, z, color] = drums[i];
    cyl(0.14, 0.38, [x, 0.68, z], color, undefined, "fuelDrum", 10);
    for (const y of [0.57, 0.79]) {
      b.part(new THREE.TorusGeometry(0.145, 0.014, 5, 12), band, {
        at: [x, y, z],
        rotation: [Math.PI / 2, 0, 0],
        name: "fuelDrumBand",
        flat: true,
      });
    }
    cyl(0.095, 0.014, [x, 0.88, z], i === 2 ? snow : band, undefined, "drumTop", 10);
    if (i === 0)
      box([0.025, 0.12, 0.025], [x + 0.09, 0.93, z], yellow, [0, 0, 0.3], "drumWarning");
  }

  // ---------------------------------------------------------------------------
  // SNOWMOBILE angled toward front-left (+Z and -X).
  // ---------------------------------------------------------------------------
  const sx = -1.03;
  const sz = 1.37;
  const yaw = -0.24;

  // Main low body and raised nose.
  box([0.58, 0.20, 0.82], [sx, 0.62, sz], teal, [0, yaw, 0], "snowmobileBody");
  box([0.42, 0.16, 0.38], [sx - 0.015, 0.77, sz - 0.15], teal, [0.08, yaw, 0], "snowmobileCowling");
  box([0.31, 0.035, 0.72], [sx, 0.74, sz + 0.02], yellow, [0, yaw, 0], "snowmobileAccent");
  box([0.30, 0.12, 0.28], [sx, 0.84, sz - 0.20], dark, [0, yaw, 0], "snowmobileSeat");

  // Dark windshield as a tilted block.
  box([0.28, 0.20, 0.035], [sx, 0.91, sz - 0.36], dark, [-0.28, yaw, 0], "snowmobileWindshield");

  // Skis and steering struts.
  for (const side of [-1, 1]) {
    const x = sx + side * 0.22;
    rod([x, 0.48, sz + 0.16], [x + side * 0.015, 0.48, sz + 0.63], 0.025, steel, "snowmobileSki");
    rod([x, 0.51, sz + 0.08], [sx + side * 0.13, 0.77, sz - 0.19], 0.018, blade, "skiStrut");
    box([0.09, 0.025, 0.12], [x, 0.47, sz + 0.62], steel, [0, yaw, 0], "skiTip");
  }

  // Rear rack and pennant.
  rod([sx - 0.22, 0.79, sz - 0.38], [sx + 0.22, 0.79, sz - 0.38], 0.018, steel, "snowmobileRack");
  rod([sx + 0.16, 0.80, sz - 0.38], [sx + 0.16, 1.03, sz - 0.38], 0.012, steel, "snowmobileFlagPole");
  b.extrude(
    [
      [0, 0],
      [0.20, -0.035],
      [0.07, -0.12],
      [0, -0.12],
    ],
    {
      at: [sx + 0.16, 1.02, sz - 0.39],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      color: flag,
      name: "snowmobilePennant",
    },
  );

  // ---------------------------------------------------------------------------
  // Snow-covered plank and firewood pile.
  // ---------------------------------------------------------------------------
  box([0.72, 0.07, 0.16], [0.95, 0.48, 2.30], wood, [0, 0.18, 0.05], "snowPlank");
  box([0.70, 0.055, 0.16], [0.95, 0.535, 2.30], snow, [0, 0.18, 0.05], "snowPlankCap");

  for (let i = 0; i < 5; i++) {
    const x = -1.47 + (i % 3) * 0.10;
    const z = 1.48 + Math.floor(i / 3) * 0.10;
    cyl(0.047, 0.18, [x, 0.53 + (i % 2) * 0.045, z], wood, [Math.PI / 2, 0, 0], "cutFirewood", 7);
    cyl(0.025, 0.006, [x, 0.53 + (i % 2) * 0.045, z + 0.091], lid, [Math.PI / 2, 0, 0], "woodEnd", 7);
  }

  // ---------------------------------------------------------------------------
  // SHOVEL stuck in the snow, bucket, and a few tiny snow-capped boxes.
  // ---------------------------------------------------------------------------
  rod([-0.28, 0.46, 2.32], [-0.10, 1.12, 2.17], 0.018, wood, "shovelHandle");
  box([0.16, 0.025, 0.25], [-0.10, 1.01, 2.16], steel, [0.26, -0.08, 0], "shovelBlade");
  box([0.11, 0.035, 0.025], [-0.10, 1.13, 2.17], dark, [0.26, -0.08, 0], "shovelGrip");

  cyl(0.13, 0.16, [0.10, 0.54, 2.18], steel, undefined, "steelBucket", 10);
  b.part(new THREE.TorusGeometry(0.125, 0.012, 5, 12), dark, {
    at: [0.10, 0.63, 2.18],
    rotation: [Math.PI / 2, 0, 0],
    name: "bucketRim",
    flat: true,
  });
  rod([-0.01, 0.66, 2.18], [0.22, 0.83, 2.18], 0.012, steel, "bucketHandle");

  for (let i = 0; i < 4; i++) {
    const x = -0.20 + (i % 2) * 0.18;
    const z = 2.48 + Math.floor(i / 2) * 0.12;
    box([0.15, 0.13, 0.16], [x, 0.49, z], crate, [0, 0, (i - 1.5) * 0.05], "tinySupplyCrate");
    box([0.14, 0.018, 0.15], [x, 0.565, z], snow, [0, 0, (i - 1.5) * 0.05], "tinySnowCap");
  }

  // Loose rope tie-down near the snowmobile.
  for (let i = 0; i < 3; i++) {
    const t = i / 2;
    rod(
      [-0.55 + t * 0.22, 0.76 + 0.035 * Math.sin(t * Math.PI), 1.10],
      [-0.44 + t * 0.22, 0.78 + 0.035 * Math.sin(t * Math.PI), 1.10],
      0.009,
      rope,
      "looseTieRope",
    );
  }

  // A few intentional snow lumps seated over clutter, keeping the weathered-in-place read.
  sphere(0.09, [1.38, 0.91, 1.18], snow, [1.7, 0.35, 1.1], "drumSnow");
  sphere(0.07, [-1.30, 0.68, 1.53], snow, [1.5, 0.28, 0.8], "woodSnow");
  sphere(0.055, [0.55, 1.31, 1.00], snow, [1.4, 0.25, 0.9], "crateSnowDust");

  // Deterministic tiny orange marker on the equipment clutter.
  const markerX = 0.92 + rngProps() * 0.18;
  box([0.045, 0.045, 0.012], [markerX, 0.88, 1.54], yellow, [0, 0, 0], "equipmentMarker");

  return b.root;
}
```