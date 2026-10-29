<!-- call: plan -->

```json
{
  "name": "Module 9 — Raw Concrete Housing Block",
  "description": "A tall brutalist housing block on heavy pilotis, stacked concrete floor bands with deep window recesses, cantilevered balconies on the front face, a taller service core at the rear and a working rooftop plant deck.",
  "builderName": "brutalistBlock",
  "size": [5.8, 14.4, 8.6],
  "layout": "The block faces +Z. Ground level (y 0–2.6) is open: a grid of thick square concrete pilotis carries everything, with a recessed dark glazed lobby box set back at z -1.5..0.5, a deep cast canopy slab over the entry on the +Z side, low concrete planter walls and a rusted metal door — this part rests on y = 0. From 2.6 to 9.0 the main shaft rises as five stacked concrete floor bands (each 1.28 m), each band a slightly different concrete tone, punched with deep vertical window recesses: dark glass set 0.25 m back, separated by broad concrete piers, with two rows of narrow slit windows near the flanks. The front (+Z) face carries cantilevered balcony slabs at each floor line, projecting 1.2 m, with low concrete upstand walls and dark metal railings. At the rear (z -3.8..-2.2), offset toward +X, a bare service core of sheer board-marked concrete rises through and 4.2 m past the shaft to y 13.2, with a column of small stair windows, a stack of dark louvre openings and horizontal formwork board lines. On the shaft roof (y 9.0) sits the roofscape: a tall parapet, a clustered plant enclosure in darker concrete, round vent stacks, a tarred water tank on short legs and a thin antenna mast to y 14.4 — the model's highest point. The style is raw concrete everywhere: flat unrelieved masses, deep shadow in every recess, weathering streaks read as darker concrete pieces under sills and edges, board-form seam lines as thin inset slats, and colour used only sparingly (rusted door, dark glass, one mustard service door, moss on north-facing planters).",
  "palette": {
    "concreteLight": "#b9b6ab",
    "concreteMid": "#a19e92",
    "concreteDark": "#7d7a70",
    "concreteWeathered": "#615e56",
    "concreteShadow": "#45433f",
    "boardSeam": "#54514a",
    "glassDark": "#23282e",
    "glassTeal": "#31525a",
    "railingMetal": "#3a3d42",
    "railingHighlight": "#5a5e66",
    "doorRust": "#a34d2a",
    "doorService": "#d9a13b",
    "roofTar": "#35332f",
    "planterSoil": "#3d352c",
    "mossGreen": "#55663c",
    "ventGalvanised": "#8b8d90",
    "recessBlack": "#1a1c20"
  },
  "mounts": {
    "podiumTop": [0, 2.6, 0],
    "facadeFront": [0, 5.8, 3.5],
    "towerTop": [0, 9.0, 0],
    "coreBase": [0.1, 2.6, -3.0],
    "coreRoof": [0.1, 13.2, -3.0]
  },
  "joints": [],
  "parts": [
    {
      "id": "podium",
      "builds": "The open ground level, floor: true. Six to eight thick square concrete pilotis (about 0.45 m across, built as stacked frustum boxes or chunky boxes with slightly battered sides) in concreteMid with concreteDark bases, standing on low pad footings that touch y = 0. A recessed lobby volume set back to z -1.5..0.5 between two columns: a box of dark glassDark panels with thin concreteDark mullions, a recessBlack doorway opening and the doorRust door with a small round handle. A deep cast canopy slab (concreteLight, 0.3 m thick, cantilevering to z 2.6) over the entry, carried on two of the pilotis, with a boardSeam line of thin inset slats on its soffit. Around the perimeter: low concrete planter walls (concreteDark, 0.55 m high) holding planterSoil with a few blocky mossGreen shrubs, and a concreteDark ground slab whose top surface is the podium floor. One mustard doorService side door on the -X flank. Everything sits inside the box, columns and footings on y = 0.",
      "box": [[-2.9, 0, -3.7], [2.9, 2.6, 3.7]],
      "attaches": "Its top face is exactly the podiumTop plane at y 2.6 across the full footprint; the shaft and serviceCore start there. Shares the footprint edges x ±2.7, z ±3.5 with the parts above.",
      "joints": [],
      "floor": true,
      "budget": 170
    },
    {
      "id": "shaftTower",
      "builds": "The main housing shaft, y 2.6 to 9.0. Built as five stacked floor bands, each 1.28 m tall, each a frustumBox or box slab in a slightly different concrete tone cycling concreteLight, concreteMid, concreteDark so the stacking reads, with a thin concreteShadow shadow gap line between bands. Each band is punched on the +Z front face with deep vertical window recesses: recesses built as recessBlack inset boxes set 0.25 m back, each holding a glassDark or glassTeal window pane part with thin railingMetal frames, separated by broad 0.5 m concrete piers. Two narrow slit-window columns near each flank (x ±2.1) run the full height. On the -Z rear face and the ±X flanks, smaller square windows in a sparser rhythm with concreteWeathered streak pieces cast just below each sill (small thin boxes in a darker tone seated on the wall). Horizontal boardSeam thin slat lines at each band joint on all four faces. Small concreteLight spandrel panels between window heads and the band above. The top of the shaft is a flat slab edge meeting towerTop exactly.",
      "box": [[-2.7, 2.6, -3.5], [2.7, 9.0, 3.5]],
      "attaches": "Its bottom face sits exactly on the podiumTop plane at y 2.6; its front face at z 3.5 is the facadeFront plane where balcony slabs land; its top face is towerTop at y 9.0 under the roofscape; the serviceCore passes alongside it at the rear, not through it.",
      "joints": [],
      "floor": false,
      "budget": 190
    },
    {
      "id": "balconies",
      "builds": "The cantilevered balcony stack on the front face. Five balcony slabs (concreteLight, 0.18 m thick, 5.6 m wide, projecting from z 3.5 to z 4.6), one at each floor line: tops at y 3.9, 5.18, 6.46, 7.74 and the parapet-line slab at 8.9. Each slab has a visible fascia edge band in concreteMid with a boardSeam thin seam. On each slab: a low concrete upstand wall (concreteMid, 0.35 m) along the outer edge and short returns, and above it a dark railingMetal balustrade built from thin vertical balusters (0.03 m square, about 14 per balcony) with a top handrail rail in railingHighlight and a bottom rail — all small parts seated on the slab. Under each slab nose, two short angled concreteDark corbel brackets tying back to the facade. On two balconies, small human touches: a glassTeal privacy screen panel, a planter box with mossGreen shrubs, a folded deckchair shape in doorRust canvas. A vertical drainage streak of concreteWeathered runs down the facade below each slab's corner drain.",
      "box": [[-2.9, 2.6, 3.0], [2.9, 9.4, 4.7]],
      "attaches": "Slabs root into the shaft's front face on the facadeFront plane at z 3.5, at the floor lines of the shaft's five bands (tops at 3.9, 5.18, 6.46, 7.74, 8.9); the top slab edge meets the roofscape parapet line.",
      "joints": [],
      "floor": false,
      "budget": 170
    },
    {
      "id": "serviceCore",
      "builds": "The bare rear service core, the model's tallest element. A sheer board-marked concrete tower from y 2.6 to 13.2, footprint x -1.6..1.9, z -3.8..-2.3, in concreteDark with strong horizontal formwork: repeated thin boardSeam slat strips 0.4 m apart wrapping all four faces, and a few concreteWeathered panels where the pour varied. A single column of small stair windows runs up the +Z face of the core: pairs of small glassDark panes with concreteLight surrounds at each level, deeply recessed in recessBlack boxes. Near the top, a stack of three wide dark louvre openings on the -Z face (recessBlack boxes with thin railingMetal louvre fins inside). The core roof at y 13.2 is a thick concreteLight cap slab with a small parapet, carrying a short vent stack and a tiny ladder cage of railingMetal. A doorService access door with a concrete surround at its base facing -Z, and a floodlight box in ventGalvanised on an arm. The core reads as unrelieved mass: almost no openings, deep shadow, board lines only.",
      "box": [[-1.7, 2.6, -3.8], [1.9, 13.2, -2.2]],
      "attaches": "Rises from the podiumTop plane at y 2.6 alongside the shaft's rear face (z -3.5 edge of the shaft meets z -3.8..-2.2 core, they read as one mass but each builds its own side); its cap slab is the coreRoof mount at y 13.2.",
      "joints": [],
      "floor": false,
      "budget": 160
    },
    {
      "id": "roofscape",
      "builds": "Everything on the shaft roof, y 9.0 upward. A tall cast parapet wall (concreteMid, 0.5 m high, 0.15 m thick) around the shaft's full footprint edge, with two concreteWeathered streaks down its outer face and a gap section where the balconies' top slab arrives. Inside: a clustered plant enclosure of two linked concreteDark boxes (about 2.2 × 1.4 m, 1.6 m tall) with a concreteLight roof slab, a doorService metal access door, railingMetal louvre fins on one face and a small gauge panel. Three round vent stacks of different heights in ventGalvanised (lathe-like cylinders or swept tubes, 0.15–0.25 m across) grouped beside the enclosure. A tarred water tank: a squat cylinder in roofTar on four short railingMetal legs, with a coned top and a small caged ladder. A thin antenna mast (railingMetal, 0.04 m) rising to y 14.4 with two cross arms and a small red aircraft-warning lamp block near its top. Tarred roof deck in roofTar between the plant, with one mossGreen patch pooling around a vent base and a scuttle hatch in ventGalvanised.",
      "box": [[-2.7, 9.0, -3.8], [2.7, 14.4, 3.6]],
      "attaches": "Sits exactly on the towerTop plane at y 9.0 (the shaft's top face); its parapet stays clear of the serviceCore's box at the rear; the antenna mast is the model's highest point at y 14.4.",
      "joints": [],
      "floor": false,
      "budget": 180
    }
  ]
}
```

<!-- call: balconies -->

```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export function buildBalconies({ b, J, P, M }: Ctx) {
  const front = M.facadeFront?.[2] ?? 3.5;
  const slabFront = 4.6;
  const slabWidth = 5.6;
  const levels = [3.9, 5.18, 6.46, 7.74, 8.9];

  const concreteLight = P.concreteLight;
  const concreteMid = P.concreteMid;
  const concreteDark = P.concreteDark;
  const weathered = P.concreteWeathered;
  const seam = P.boardSeam;
  const rail = P.railingMetal;
  const railHi = P.railingHighlight;
  const teal = P.glassTeal;
  const rust = P.doorRust;
  const moss = P.mossGreen;
  const soil = P.planterSoil;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      group: "balconies",
    });

  const railRod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) => b.rod(a, c, radius, { color, name, group: "balconies" });

  const shrub = (x: number, y: number, z: number, i: number) => {
    box([0.16, 0.22, 0.16], [x, y + 0.11, z], moss, `balconiesShrub${i}`);
    box([0.11, 0.12, 0.11], [x + 0.045, y + 0.27, z - 0.015], moss, `balconiesShrubTop${i}`);
  };

  levels.forEach((top, floor) => {
    const slabY = top - 0.09;
    const tag = `balconies${floor + 1}`;

    // Deep cantilevered floor plate and its darker projecting fascia.
    box([slabWidth, 0.18, 1.10], [0, slabY, (front + slabFront) / 2], concreteLight, `${tag}Slab`);
    box([5.68, 0.16, 0.10], [0, top - 0.08, 4.56], concreteMid, `${tag}Fascia`);
    box([5.40, 0.018, 0.012], [0, top - 0.012, 4.612], seam, `${tag}FasciaSeam`);

    // Low cast parapet/upstand on the outer edge, with short side returns.
    box([5.58, 0.35, 0.14], [0, top + 0.175, 4.52], concreteMid, `${tag}Upstand`);
    box([0.14, 0.35, 0.88], [-2.72, top + 0.175, 4.08], concreteMid, `${tag}ReturnL`);
    box([0.14, 0.35, 0.88], [2.72, top + 0.175, 4.08], concreteMid, `${tag}ReturnR`);

    // Front balustrade: fourteen square-section vertical members.
    const balusterBottom = top + 0.35;
    const balusterTop = top + 0.69;
    for (let i = 0; i < 14; i++) {
      const x = -2.48 + (i * 4.96) / 13;
      box([0.03, 0.34, 0.03], [x, top + 0.52, 4.52], rail, `${tag}Baluster${i + 1}`);
    }
    railRod([-2.78, balusterTop, 4.52], [2.78, balusterTop, 4.52], 0.027, railHi, `${tag}Handrail`);
    railRod([-2.76, balusterBottom, 4.52], [2.76, balusterBottom, 4.52], 0.018, rail, `${tag}BottomRail`);

    // Minimal return rails on both sides, keeping the front silhouette dominant.
    railRod([-2.72, balusterBottom, 4.08], [-2.72, balusterTop, 4.08], 0.022, rail, `${tag}SideRailL`);
    railRod([2.72, balusterBottom, 4.08], [2.72, balusterTop, 4.08], 0.022, rail, `${tag}SideRailR`);

    // Heavy paired triangular-looking corbels below each balcony nose.
    railRod([-2.18, top - 0.12, 3.56], [-2.18, top - 0.08, 4.38], 0.075, concreteDark, `${tag}CorbelL`);
    railRod([2.18, top - 0.12, 3.56], [2.18, top - 0.08, 4.38], 0.075, concreteDark, `${tag}CorbelR`);
    box([0.24, 0.10, 0.46], [-2.18, top - 0.11, 3.78], concreteDark, `${tag}CorbelFootL`);
    box([0.24, 0.10, 0.46], [2.18, top - 0.11, 3.78], concreteDark, `${tag}CorbelFootR`);

    // Dark vertical rain marks directly below the outer balcony corners.
    box([0.075, 0.54, 0.028], [-2.56, top - 0.38, front + 0.018], weathered, `${tag}DrainL`);
    box([0.075, 0.38, 0.028], [2.56, top - 0.30, front + 0.018], weathered, `${tag}DrainR`);
    box([0.025, 0.10, 0.035], [-2.56, top - 0.67, front + 0.018], seam, `${tag}DrainEndL`);
    box([0.025, 0.10, 0.035], [2.56, top - 0.51, front + 0.018], seam, `${tag}DrainEndR`);

    // Small lived-in interventions, deliberately sparse against the raw concrete.
    if (floor === 1) {
      // Translucent-looking teal privacy screen, framed in dark metal.
      box([1.05, 0.92, 0.045], [1.10, top + 0.58, 4.20], teal, `${tag}PrivacyGlass`);
      box([1.10, 0.035, 0.065], [1.10, top + 0.13, 4.20], rail, `${tag}PrivacyBottom`);
      box([1.10, 0.035, 0.065], [1.10, top + 1.03, 4.20], railHi, `${tag}PrivacyTop`);
      box([0.035, 0.92, 0.065], [0.55, top + 0.58, 4.20], rail, `${tag}PrivacySideL`);
      box([0.035, 0.92, 0.065], [1.65, top + 0.58, 4.20], rail, `${tag}PrivacySideR`);
    }

    if (floor === 2) {
      // Low planter against one return, soil recessed below its rim.
      box([0.92, 0.28, 0.38], [-1.55, top + 0.24, 4.15], concreteDark, `${tag}Planter`);
      box([0.78, 0.045, 0.28], [-1.55, top + 0.405, 4.15], soil, `${tag}PlanterSoil`);
      shrub(-1.78, top + 0.43, 4.15, floor * 3);
      shrub(-1.53, top + 0.43, 4.15, floor * 3 + 1);
      shrub(-1.29, top + 0.43, 4.15, floor * 3 + 2);
    }

    if (floor === 3) {
      // Folded deckchair: rust canvas stretched between two dark angular frames.
      box([0.72, 0.055, 0.42], [1.12, top + 0.48, 4.06], rust, `${tag}DeckCanvas`);
      railRod([0.76, top + 0.12, 4.22], [1.45, top + 0.82, 4.22], 0.025, rail, `${tag}ChairFrameA`);
      railRod([1.45, top + 0.12, 4.22], [0.76, top + 0.82, 4.22], 0.025, rail, `${tag}ChairFrameB`);
      railRod([0.76, top + 0.12, 4.22], [0.76, top + 0.12, 4.58], 0.025, railHi, `${tag}ChairLegA`);
      railRod([1.45, top + 0.12, 4.22], [1.45, top + 0.12, 4.58], 0.025, railHi, `${tag}ChairLegB`);
    }
  });
}
```

<!-- call: shaftTower -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildShaftTower({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const C = P.concreteLight;
  const MIDL = P.concreteMid;
  const DARK = P.concreteDark;
  const WEATHER = P.concreteWeathered;
  const SHADOW = P.concreteShadow;
  const SEAM = P.boardSeam;
  const GLASS = P.glassDark;
  const TEAL = P.glassTeal;
  const RAIL = P.railingMetal;
  const HIGHLIGHT = P.railingHighlight;
  const BLACK = P.recessBlack;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    name?: string,
  ) =>
    b.part(geometry, color, {
      at,
      bone,
      name: name ?? "shaftTower.part",
      group: "shaftTower",
      flat: true,
    });

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    name?: string,
  ) => part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, name);

  const cyl = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    name?: string,
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, 8, 1),
      color,
      at,
      name,
    );

  const bandY = [3.18, 4.46, 5.74, 7.02, 8.30];
  const bandColors = [C, MIDL, DARK, MIDL, C];
  const bandHeight = 1.12;

  // Solid rear body of each floor band. The front edge stops short of the
  // facade so the window voids read as genuinely recessed.
  for (let i = 0; i < 5; i++) {
    const y = bandY[i];
    box(
      [5.4, bandHeight, 6.65],
      bandColors[i],
      [0, y, -0.18],
      `shaftTower.band${i + 1}`,
    );

    // Slightly heavier lower edge gives each storey a cast, stacked reading.
    box(
      [5.42, 0.07, 6.68],
      SHADOW,
      [0, y - bandHeight / 2 + 0.035, -0.18],
      `shaftTower.band${i + 1}.lowerShadow`,
    );

    // Front spandrel immediately over the windows.
    box(
      [5.4, 0.20, 0.34],
      C,
      [0, y + 0.41, 3.33],
      `shaftTower.spandrel${i + 1}`,
    );

    // Broad front piers. These leave four deep vertical openings and keep
    // the structural rhythm legible from a distance.
    const pierXs = [-2.42, -1.34, -0.27, 0.80, 1.88, 2.48];
    const pierWidths = [0.56, 0.25, 0.25, 0.25, 0.25, 0.50];
    for (let p = 0; p < pierXs.length; p++) {
      box(
        [pierWidths[p], 0.88, 0.36],
        bandColors[i],
        [pierXs[p], y - 0.03, 3.34],
        `shaftTower.frontPier${i + 1}_${p}`,
      );
    }

    // Four deep black recesses, then smaller panes nested inside them.
    const windows = [-1.86, -0.78, 0.30, 1.38];
    for (let w = 0; w < windows.length; w++) {
      const x = windows[w];
      box(
        [0.86, 0.78, 0.16],
        BLACK,
        [x, y - 0.02, 3.19],
        `shaftTower.frontRecess${i + 1}_${w}`,
      );

      box(
        [0.68, 0.59, 0.035],
        i === 1 || i === 4 ? TEAL : GLASS,
        [x, y - 0.01, 3.275],
        `shaftTower.frontGlass${i + 1}_${w}`,
      );

      // Simple metal frame, set proud of the pane but still behind the pier.
      box(
        [0.035, 0.62, 0.045],
        RAIL,
        [x - 0.37, y - 0.01, 3.30],
        `shaftTower.windowFrameL${i + 1}_${w}`,
      );
      box(
        [0.035, 0.62, 0.045],
        RAIL,
        [x + 0.37, y - 0.01, 3.30],
        `shaftTower.windowFrameR${i + 1}_${w}`,
      );
      box(
        [0.78, 0.035, 0.045],
        HIGHLIGHT,
        [x, y + 0.28, 3.30],
        `shaftTower.windowFrameT${i + 1}_${w}`,
      );
      box(
        [0.78, 0.035, 0.045],
        RAIL,
        [x, y - 0.31, 3.30],
        `shaftTower.windowFrameB${i + 1}_${w}`,
      );

      // Weathering cast below alternate sills.
      if ((i + w) % 2 === 0) {
        box(
          [0.10, 0.22, 0.025],
          WEATHER,
          [x - 0.27, y - 0.47, 3.505],
          `shaftTower.frontWeather${i + 1}_${w}a`,
        );
        box(
          [0.06, 0.14, 0.022],
          WEATHER,
          [x + 0.22, y - 0.44, 3.506],
          `shaftTower.frontWeather${i + 1}_${w}b`,
        );
      }
    }

    // Narrow slit columns at each facade flank.
    for (const x of [-2.55, 2.55]) {
      box(
        [0.18, 0.80, 0.08],
        BLACK,
        [x, y - 0.02, 3.22],
        `shaftTower.slitRecess${i}_${x}`,
      );
      box(
        [0.10, 0.57, 0.025],
        TEAL,
        [x, y - 0.02, 3.275],
        `shaftTower.slitGlass${i}_${x}`,
      );
    }
  }

  // Horizontal board-form seam strips at every floor joint. Each is kept
  // narrow and slightly inset in colour so the building does not become
  // graphically striped.
  const seamYs = [2.62, 3.74, 5.02, 6.30, 7.58, 8.86, 8.98];
  for (let i = 0; i < seamYs.length; i++) {
    const y = seamYs[i];
    box([5.42, 0.026, 0.035], SEAM, [0, y, 3.505], `shaftTower.seamFront${i}`);
    box([5.42, 0.026, 0.035], SEAM, [0, y, -3.505], `shaftTower.seamRear${i}`);
    box([0.035, 0.026, 6.98], SEAM, [2.705, y, -0.02], `shaftTower.seamRight${i}`);
    box([0.035, 0.026, 6.98], SEAM, [-2.705, y, -0.02], `shaftTower.seamLeft${i}`);
  }

  // Sparse rear windows: small, square, and much less welcoming than the
  // front glazing.
  const rearRows = [
    { y: 3.26, xs: [-1.75, -0.52, 0.70, 1.75] },
    { y: 5.82, xs: [-1.72, 0.10, 1.48] },
    { y: 8.38, xs: [-1.48, -0.18, 1.15] },
  ];
  for (let r = 0; r < rearRows.length; r++) {
    for (let j = 0; j < rearRows[r].xs.length; j++) {
      const x = rearRows[r].xs[j];
      const y = rearRows[r].y;
      box([0.70, 0.54, 0.06], BLACK, [x, y, -3.48], `shaftTower.rearVoid${r}_${j}`);
      box([0.51, 0.36, 0.025], GLASS, [x, y, -3.515], `shaftTower.rearGlass${r}_${j}`);
      box([0.08, 0.06, 0.025], WEATHER, [x - 0.25, y - 0.33, -3.535], `shaftTower.rearStreak${r}_${j}a`);
      if (j % 2 === 0) {
        box([0.05, 0.12, 0.02], WEATHER, [x + 0.23, y - 0.35, -3.536], `shaftTower.rearStreak${r}_${j}b`);
      }
    }
  }

  // Side elevations use a sparse vertical rhythm of square windows and
  // occasional board-dark weather marks beneath their sills.
  const sideLevels = [3.35, 5.85, 8.35];
  for (let s = 0; s < 2; s++) {
    const x = s === 0 ? -2.715 : 2.715;
    for (let i = 0; i < sideLevels.length; i++) {
      const y = sideLevels[i];
      const zs = i === 1 ? [-2.05, 0.15, 2.05] : [-2.25, 0.55];
      for (let j = 0; j < zs.length; j++) {
        const z = zs[j];
        box([0.06, 0.52, 0.68], BLACK, [x, y, z], `shaftTower.sideVoid${s}_${i}_${j}`);
        box([0.025, 0.34, 0.48], j === 1 ? TEAL : GLASS, [x + (s === 0 ? -0.035 : 0.035), y, z], `shaftTower.sideGlass${s}_${i}_${j}`);
        box([0.025, 0.07, 0.10], WEATHER, [x + (s === 0 ? -0.05 : 0.05), y - 0.32, z - 0.22], `shaftTower.sideStreak${s}_${i}_${j}`);
      }
    }
  }

  // A restrained top edge and parapet-seat shadow make the exact towerTop
  // line read cleanly beneath the roofscape part.
  box([5.46, 0.08, 6.98], C, [0, 8.96, -0.02], "shaftTower.topCrown");
  box([5.48, 0.025, 0.05], SEAM, [0, 8.995, 3.505], "shaftTower.topFrontJoint");
  box([5.48, 0.025, 0.05], SEAM, [0, 8.995, -3.505], "shaftTower.topRearJoint");

  // Tiny cast stains beneath the upper front corners, aligned with future
  // balcony drainage points without building the balconies themselves.
  for (const x of [-2.48, 2.48]) {
    box([0.07, 0.44, 0.025], WEATHER, [x, 8.55, 3.53], `shaftTower.upperStain${x}`);
  }
}
```

<!-- call: roofscape -->

```ts
import * as THREE from "three";
import { createBuilder, frame, rng } from "agentic-3js-builder";

export function buildRoofscape({ b, J, P, M }: Ctx) {
  const C = P.concreteMid;
  const CL = P.concreteLight;
  const CD = P.concreteDark;
  const CW = P.concreteWeathered;
  const SEAM = P.boardSeam;
  const GLASS = P.glassDark;
  const TEAL = P.glassTeal;
  const RAIL = P.railingMetal;
  const RAILHI = P.railingHighlight;
  const VENT = P.ventGalvanised;
  const TAR = P.roofTar;
  const MOSS = P.mossGreen;
  const DOOR = P.doorService;
  const BLACK = P.recessBlack;
  const WARNING = "#b43a2e";

  const roofY = 9.0;
  const shaftX = 5.4;
  const shaftZ = 7.0;

  const box = (
    w: number,
    h: number,
    d: number,
    at: [number, number, number],
    color: string,
    name?: string,
  ) => {
    return b.part(new THREE.BoxGeometry(w, h, d), color, {
      at,
      name: name ?? "roofscape.box",
      flat: true,
    });
  };

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    sides = 10,
    name?: string,
  ) => {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, sides), color, {
      at,
      name: name ?? "roofscape.cylinder",
      flat: true,
    });
  };

  const cone = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    sides = 10,
    name?: string,
  ) => {
    return b.part(new THREE.ConeGeometry(radius, height, sides), color, {
      at,
      name: name ?? "roofscape.cone",
      flat: true,
    });
  };

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) => {
    return b.rod(a, z, radius, {
      color,
      name: name ?? "roofscape.rod",
      section: { ngon: 6 },
    });
  };

  const plate = (
    w: number,
    d: number,
    at: [number, number, number],
    color: string,
    name?: string,
  ) => box(w, 0.08, d, at, color, name);

  // Tarred roof deck, deliberately visible between the hard rooftop objects.
  box(5.4, 0.12, 7.0, [0, 9.02, 0], TAR, "roofscape.tarred roof deck");

  // A broken, heavy parapet. The rear edge is interrupted around the service core.
  box(5.4, 0.5, 0.15, [0, 9.29, 3.425], C, "roofscape.front parapet");
  box(0.15, 0.5, 7.0, [-2.625, 9.29, 0], C, "roofscape.left parapet");
  box(0.15, 0.5, 7.0, [2.625, 9.29, 0], C, "roofscape.right parapet");
  box(1.45, 0.5, 0.15, [-1.98, 9.29, -3.425], C, "roofscape.rear parapet left");
  box(1.25, 0.5, 0.15, [1.98, 9.29, -3.425], C, "roofscape.rear parapet right");

  // Slightly darker top caps and pour seams make the parapet read as cast concrete.
  box(5.48, 0.035, 0.18, [0, 9.56, 3.425], CL, "roofscape.front parapet cap");
  box(0.18, 0.035, 7.08, [-2.625, 9.56, 0], CL, "roofscape.left parapet cap");
  box(0.18, 0.035, 7.08, [2.625, 9.56, 0], CL, "roofscape.right parapet cap");
  box(1.52, 0.035, 0.18, [-1.98, 9.56, -3.425], CL, "roofscape.rear cap left");
  box(1.32, 0.035, 0.18, [1.98, 9.56, -3.425], CL, "roofscape.rear cap right");

  for (const x of [-2.57, 2.57]) {
    box(0.028, 0.29, 0.012, [x, 9.16, 3.505], CW, "roofscape.parapet weather streak");
    box(0.028, 0.22, 0.012, [x * 0.82, 9.22, -3.505], CW, "roofscape.rear weather streak");
  }

  // Plant enclosure: two offset monolithic boxes, with a narrow joint between them.
  box(1.18, 1.55, 1.42, [-0.82, 9.84, -0.35], CD, "roofscape.plant enclosure west");
  box(1.04, 1.55, 1.42, [0.30, 9.84, -0.35], CD, "roofscape.plant enclosure east");
  box(2.38, 0.12, 1.52, [-0.26, 10.65, -0.35], CL, "roofscape.plant enclosure roof");
  box(2.18, 0.035, 1.32, [-0.26, 10.73, -0.35], C, "roofscape.plant roof inset");

  // Formwork seams on the plant room.
  for (const y of [9.20, 9.57, 9.94, 10.31]) {
    box(2.28, 0.025, 0.018, [-0.26, y, 0.365], SEAM, "roofscape.plant board seam");
  }
  for (const x of [-1.39, -0.26, 0.82]) {
    box(0.025, 1.48, 0.018, [x, 9.84, 0.365], CW, "roofscape.plant pour mark");
  }

  // Service door and concrete surround on the front of the enclosure.
  box(0.43, 0.82, 0.035, [0.48, 9.60, 0.385], C, "roofscape.plant door surround");
  box(0.31, 0.64, 0.025, [0.48, 9.53, 0.414], DOOR, "roofscape.plant service door");
  box(0.035, 0.035, 0.018, [0.58, 9.53, 0.438], RAILHI, "roofscape.service door handle");

  // Louvre bank on the west-facing side of the plant room.
  box(0.018, 0.82, 0.72, [-1.425, 9.72, -0.35], BLACK, "roofscape.louvre recess");
  for (let i = 0; i < 7; i++) {
    const y = 9.38 + i * 0.12;
    box(0.035, 0.035, 0.62, [-1.455, y, -0.35], RAIL, "roofscape.louvre fin");
  }

  // A small graphic-like gauge panel on the enclosure front.
  box(0.48, 0.42, 0.025, [-0.72, 10.12, 0.414], BLACK, "roofscape.gauge panel");
  cyl(0.145, 0.018, [-0.72, 10.13, 0.438], CL, 16, "roofscape.gauge face");
  cyl(0.112, 0.022, [-0.72, 10.13, 0.452], GLASS, 16, "roofscape.gauge glass");
  rod([-0.72, 10.13, 0.463], [-0.66, 10.25, 0.463], 0.012, WARNING, "roofscape.gauge needle");
  cyl(0.024, 0.026, [-0.72, 10.13, 0.472], RAIL, 8, "roofscape.gauge hub");

  // Three roof vents, intentionally different heights and proportions.
  const vents = [
    { x: 1.05, z: 1.15, r: 0.105, h: 0.72 },
    { x: 1.48, z: 1.12, r: 0.135, h: 0.98 },
    { x: 1.91, z: 1.12, r: 0.085, h: 0.54 },
  ];
  vents.forEach((v, i) => {
    cyl(v.r, v.h, [v.x, 9.08 + v.h / 2, v.z], VENT, 10, `roofscape.vent ${i}`);
    cyl(v.r * 1.18, 0.06, [v.x, 9.08 + v.h + 0.025, v.z], CL, 10, `roofscape.vent cap ${i}`);
    for (let j = 0; j < 5; j++) {
      rod(
        [v.x - v.r * 0.72, 9.18 + j * 0.1, v.z + v.r * 0.8],
        [v.x + v.r * 0.72, 9.18 + j * 0.1, v.z + v.r * 0.8],
        0.008,
        SEAM,
        `roofscape.vent grille ${i}`,
      );
    }
  });

  // Moss patch pooled at the foot of the tallest vent.
  box(0.46, 0.018, 0.34, [1.48, 9.105, 1.12], MOSS, "roofscape.moss patch");
  box(0.18, 0.035, 0.12, [1.34, 9.14, 1.10], MOSS, "roofscape.moss lump");
  box(0.15, 0.03, 0.10, [1.62, 9.14, 1.20], MOSS, "roofscape.moss lump two");

  // Tarred water tank on four short legs.
  const tankX = 1.36;
  const tankZ = -1.62;
  for (const x of [tankX - 0.31, tankX + 0.31]) {
    for (const z of [tankZ - 0.27, tankZ + 0.27]) {
      rod([x, 9.08, z], [x, 9.68, z], 0.045, RAIL, "roofscape.tank leg");
      box(0.16, 0.045, 0.16, [x, 9.085, z], RAIL, "roofscape.tank foot");
    }
  }
  cyl(0.48, 0.78, [tankX, 10.02, tankZ], TAR, 14, "roofscape.water tank");
  cyl(0.52, 0.055, [tankX, 9.64, tankZ], RAIL, 14, "roofscape.tank lower band");
  cyl(0.52, 0.055, [tankX, 10.40, tankZ], RAIL, 14, "roofscape.tank upper band");
  cone(0.47, 0.28, [tankX, 10.55, tankZ], TAR, 12, "roofscape.water tank cone");
  cyl(0.08, 0.08, [tankX, 10.72, tankZ], VENT, 8, "roofscape.tank vent");
  for (const x of [tankX - 0.49, tankX + 0.49]) {
    rod([x, 9.72, tankZ - 0.34], [x, 10.38, tankZ - 0.34], 0.018, RAILHI, "roofscape.tank cage upright");
  }
  rod([tankX - 0.49, 10.38, tankZ - 0.34], [tankX + 0.49, 10.38, tankZ - 0.34], 0.018, RAILHI, "roofscape.tank cage top");
  for (let y = 9.83; y < 10.34; y += 0.13) {
    rod([tankX - 0.49, y, tankZ - 0.34], [tankX + 0.49, y, tankZ - 0.34], 0.012, RAIL, "roofscape.tank ladder rung");
  }

  // Roof scuttle hatch, raised slightly above the tar.
  box(0.72, 0.09, 0.62, [-1.88, 9.13, 1.72], VENT, "roofscape.scuttle hatch");
  box(0.58, 0.025, 0.48, [-1.88, 9.19, 1.72], TAR, "roofscape.scuttle inset");
  rod([-2.12, 9.25, 1.55], [-2.12, 9.52, 1.55], 0.018, RAIL, "roofscape.scuttle handle");
  rod([-2.12, 9.52, 1.55], [-1.66, 9.52, 1.55], 0.018, RAIL, "roofscape.scuttle handle crossbar");

  // Antenna mast: tallest element, with two asymmetric cross arms and warning lamp.
  const mastX = 1.95;
  const mastZ = 2.20;
  rod([mastX, 9.10, mastZ], [mastX, 14.38, mastZ], 0.022, RAIL, "roofscape.antenna mast");
  rod([mastX - 0.52, 11.55, mastZ], [mastX + 0.52, 11.55, mastZ], 0.018, RAILHI, "roofscape.antenna lower arm");
  rod([mastX - 0.28, 12.72, mastZ], [mastX + 0.36, 12.72, mastZ], 0.014, RAILHI, "roofscape.antenna upper arm");
  rod([mastX, 11.55, mastZ - 0.10], [mastX, 11.55, mastZ + 0.10], 0.012, RAIL, "roofscape.lower antenna brace");
  box(0.10, 0.12, 0.10, [mastX, 14.28, mastZ], WARNING, "roofscape.aircraft warning lamp");
  box(0.055, 0.035, 0.055, [mastX, 14.36, mastZ], CL, "roofscape.warning lamp cap");

  // A sparse maintenance guard around the tank-side roof edge.
  rod([0.92, 9.10, -2.95], [1.72, 9.10, -2.95], 0.018, RAIL, "roofscape.maintenance rail lower");
  rod([0.92, 9.52, -2.95], [1.72, 9.52, -2.95], 0.022, RAILHI, "roofscape.maintenance rail top");
  for (const x of [0.92, 1.18, 1.44, 1.72]) {
    rod([x, 9.10, -2.95], [x, 9.52, -2.95], 0.014, RAIL, "roofscape.maintenance baluster");
  }

  return b.root;
}
```

<!-- call: serviceCore -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildServiceCore({ b, J, P, M }: Ctx) {
  const C = P.concreteDark;
  const CL = P.concreteLight;
  const CW = P.concreteWeathered;
  const SEAM = P.boardSeam;
  const GLASS = P.glassDark;
  const BLACK = P.recessBlack;
  const METAL = P.railingMetal;
  const HI = P.railingHighlight;
  const GALV = P.ventGalvanised;
  const SERVICE = P.doorService;
  const TAR = P.roofTar;
  const RUST = P.doorRust;
  const MOSS = P.mossGreen;
  const WARNING = "#b7352c";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
    bevel = 0,
  ) => {
    const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
    if (bevel > 0) {
      const e = new THREE.EdgesGeometry(g);
      e.dispose();
    }
    return b.part(g, color, { at, name, group: "serviceCore" });
  };

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name: string,
    radial = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      name,
      group: "serviceCore",
    });

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) => b.rod(a, z, radius, { color, name, group: "serviceCore" });

  const x0 = -1.7;
  const x1 = 1.9;
  const zFront = -2.2;
  const zBack = -3.8;
  const cx = 0.1;
  const cz = -3.0;

  // Sheer, almost monolithic board-form concrete core.
  box([3.6, 10.6, 1.6], [cx, 7.9, cz], C, "coreMass");

  // Slightly proud, irregular-looking pour panels on the broad faces.
  const weatherPanels: Array<[number, number, number, number, number, number]> = [
    [-1.28, 4.05, -2.175, 0.62, 0.035, 0.24],
    [0.72, 5.95, -2.176, 0.82, 0.035, 0.18],
    [-0.62, 8.25, -2.176, 0.74, 0.035, 0.16],
    [1.38, 10.85, -2.176, 0.38, 0.035, 0.22],
    [-1.15, 3.55, -3.825, 0.66, 0.035, 0.16],
    [0.62, 7.1, -3.826, 0.88, 0.035, 0.19],
    [1.35, 11.55, -3.826, 0.42, 0.035, 0.2],
  ];
  for (let i = 0; i < weatherPanels.length; i++) {
    const [x, y, z, w, d, h] = weatherPanels[i];
    box([w, h, d], [x, y, z], CW, `weatherPanel${i}`);
  }

  // Strong horizontal formwork boards, front and rear.
  let seamIndex = 0;
  for (let y = 2.98; y <= 12.98; y += 0.4) {
    box([3.64, 0.026, 0.035], [cx, y, zFront - 0.018], SEAM, `formworkFront${seamIndex}`);
    box([3.64, 0.026, 0.035], [cx, y, zBack + 0.018], SEAM, `formworkRear${seamIndex}`);
    seamIndex++;
  }

  // The same board seams wrap around both narrow sides.
  for (let y = 2.98, i = 0; y <= 12.98; y += 0.4, i++) {
    box([0.035, 0.026, 1.64], [x0 - 0.018, y, cz], SEAM, `formworkLeft${i}`);
    box([0.035, 0.026, 1.64], [x1 + 0.018, y, cz], SEAM, `formworkRight${i}`);
  }

  // Occasional vertical construction joints, kept sparse and severe.
  for (const [x, n] of [
    [-0.48, "A"],
    [1.12, "B"],
  ] as const) {
    box([0.026, 10.55, 0.035], [x, 7.9, zFront - 0.02], SEAM, `verticalJointFront${n}`);
    box([0.026, 10.55, 0.035], [x, 7.9, zBack + 0.02], SEAM, `verticalJointRear${n}`);
  }

  // Deeply recessed stair windows on the +Z face.
  const stairLevels = [3.55, 4.7, 5.85, 7.0, 8.15, 9.3, 10.45, 11.6, 12.55];
  for (let i = 0; i < stairLevels.length; i++) {
    const y = stairLevels[i];

    // Black opening behind the glazing, with a pair of narrow panes.
    box([1.34, 0.58, 0.14], [0.1, y, zFront + 0.035], BLACK, `stairRecess${i}`);
    box([0.51, 0.42, 0.018], [-0.25, y, zFront + 0.11], GLASS, `stairGlassL${i}`);
    box([0.51, 0.42, 0.018], [0.45, y, zFront + 0.11], GLASS, `stairGlassR${i}`);

    // Concrete surround: heavy top, bottom, and side jambs.
    box([1.58, 0.09, 0.22], [0.1, y + 0.345, zFront - 0.005], CL, `stairLintel${i}`);
    box([1.58, 0.09, 0.22], [0.1, y - 0.345, zFront - 0.005], CL, `stairSill${i}`);
    box([0.1, 0.60, 0.22], [-0.71, y, zFront - 0.005], CL, `stairJambL${i}`);
    box([0.1, 0.60, 0.22], [0.91, y, zFront - 0.005], CL, `stairJambR${i}`);

    // Central mullion and two tiny projecting glazing catches.
    box([0.045, 0.46, 0.025], [0.1, y, zFront + 0.13], METAL, `stairMullion${i}`);
    box([0.045, 0.07, 0.035], [-0.25, y + 0.22, zFront + 0.145], HI, `stairCatchL${i}`);
    box([0.045, 0.07, 0.035], [0.45, y + 0.22, zFront + 0.145], HI, `stairCatchR${i}`);
  }

  // Weather streaks directly beneath selected front sills.
  for (const [i, x, y, w] of [
    [0, -0.55, 3.19, 0.22],
    [1, 0.76, 5.49, 0.16],
    [2, -0.35, 8.89, 0.27],
    [3, 0.7, 11.29, 0.18],
  ] as const) {
    box([w, 0.11, 0.032], [x, y, zFront - 0.025], CW, `frontStreak${i}`);
  }

  // Three broad dark louvre openings on the -Z rear face near the top.
  for (let i = 0; i < 3; i++) {
    const y = 10.15 + i * 0.78;
    box([2.45, 0.53, 0.16], [0.15, y, zBack - 0.04], BLACK, `louvreRecess${i}`);
    box([2.7, 0.08, 0.22], [0.15, y + 0.34, zBack + 0.005], CL, `louvreLintel${i}`);
    box([2.7, 0.08, 0.22], [0.15, y - 0.34, zBack + 0.005], CL, `louvreSill${i}`);

    // Slanted-looking louvre fins made as thin horizontal blades.
    for (let j = 0; j < 5; j++) {
      box([2.18, 0.035, 0.055], [0.15, y - 0.22 + j * 0.11, zBack - 0.14], METAL, `louvreFin${i}_${j}`);
    }
  }

  // Rear door surround at the base, facing -Z.
  box([1.22, 2.16, 0.18], [0.2, 3.72, zBack - 0.06], C, "serviceDoorRecess");
  box([0.92, 1.86, 0.035], [0.2, 3.72, zBack - 0.17], SERVICE, "serviceDoor");
  box([0.06, 1.9, 0.04], [-0.27, 3.72, zBack - 0.195], CW, "serviceDoorHingeSide");
  box([0.06, 1.9, 0.04], [0.67, 3.72, zBack - 0.195], CW, "serviceDoorLatchSide");
  box([0.035, 1.74, 0.045], [0.2, 3.72, zBack - 0.205], HI, "serviceDoorSeam");
  cyl(0.045, 0.025, [0.48, 3.72, zBack - 0.225], METAL, "serviceDoorHandle", 8);

  // Heavy head and foot pieces around the door.
  box([1.38, 0.17, 0.25], [0.2, 4.76, zBack - 0.08], CL, "serviceDoorHeader");
  box([0.17, 2.24, 0.25], [-0.48, 3.72, zBack - 0.08], CL, "serviceDoorJambL");
  box([0.17, 2.24, 0.25], [0.88, 3.72, zBack - 0.08], CL, "serviceDoorJambR");

  // Roof cap at the exact 13.2 m core roof.
  box([3.78, 0.28, 1.78], [cx, 13.20, cz], CL, "coreRoofCap");
  box([3.72, 0.12, 0.18], [cx, 13.40, zFront - 0.02], C, "coreRoofFrontUpstand");
  box([3.72, 0.12, 0.18], [cx, 13.40, zBack + 0.02], C, "coreRoofRearUpstand");
  box([0.18, 0.12, 1.60], [x0 + 0.02, 13.40, cz], C, "coreRoofLeftUpstand");
  box([0.18, 0.12, 1.60], [x1 - 0.02, 13.40, cz], C, "coreRoofRightUpstand");

  // Small raised access curb and roof hatch.
  box([0.72, 0.16, 0.56], [-0.7, 13.52, -2.86], C, "roofHatchCurb");
  box([0.56, 0.035, 0.40], [-0.7, 13.62, -2.86], GALV, "roofHatch");
  box([0.035, 0.08, 0.44], [-0.98, 13.68, -2.86], METAL, "hatchHandle");

  // Short galvanised vent stack with cap.
  cyl(0.16, 0.66, [0.82, 13.77, -2.92], GALV, "coreVentStack", 10);
  cyl(0.23, 0.08, [0.82, 14.13, -2.92], GALV, "coreVentCap", 10);
  box([0.46, 0.045, 0.055], [0.82, 14.16, -2.92], HI, "ventCapRim");

  // Tiny ladder cage at the rear roof edge.
  const ladderX = -1.18;
  const ladderZ = -3.55;
  rod([ladderX - 0.28, 13.42, ladderZ], [ladderX - 0.28, 14.12, ladderZ], 0.025, METAL, "ladderRailL");
  rod([ladderX + 0.28, 13.42, ladderZ], [ladderX + 0.28, 14.12, ladderZ], 0.025, METAL, "ladderRailR");
  for (let i = 0; i < 5; i++) {
    const y = 13.52 + i * 0.14;
    rod([ladderX - 0.28, y, ladderZ], [ladderX + 0.28, y, ladderZ], 0.018, HI, `ladderRung${i}`);
  }
  rod([ladderX - 0.36, 13.45, ladderZ - 0.1], [ladderX - 0.36, 14.08, ladderZ - 0.1], 0.018, METAL, "ladderCageOuterL");
  rod([ladderX + 0.36, 13.45, ladderZ - 0.1], [ladderX + 0.36, 14.08, ladderZ - 0.1], 0.018, METAL, "ladderCageOuterR");

  // Floodlight on a small arm at the rear door level.
  rod([1.35, 5.18, zBack - 0.02], [1.35, 5.18, zBack - 0.46], 0.035, METAL, "floodlightArm");
  box([0.22, 0.16, 0.18], [1.35, 5.18, zBack - 0.56], GALV, "floodlightHousing");
  box([0.14, 0.09, 0.025], [1.35, 5.16, zBack - 0.66], HI, "floodlightFace");

  // A few restrained moss-coloured roof stains and concrete chips.
  box([0.36, 0.018, 0.25], [1.28, 13.365, -2.58], MOSS, "roofMossPatchA");
  box([0.22, 0.018, 0.18], [1.48, 13.368, -2.44], MOSS, "roofMossPatchB");
  box([0.18, 0.035, 0.28], [-1.54, 7.4, zFront - 0.04], CW, "pourScarA");
  box([0.14, 0.04, 0.32], [1.7, 9.1, zBack + 0.04], CW, "pourScarB");

  // Compact pipe brackets and two drain mouths make the service face feel inhabited.
  for (const [i, x] of [-1.42, 1.62].entries()) {
    rod([x, 3.0, zFront - 0.08], [x, 12.75, zFront - 0.08], 0.026, METAL, `serviceDrainPipe${i}`);
    box([0.12, 0.08, 0.08], [x, 3.04, zFront - 0.12], GALV, `serviceDrainFoot${i}`);
  }

  return b.root;
}
```

<!-- call: podium -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildPodium({ b, J, P, M }: Ctx) {
  const R = rng(9041);

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      group: "podium",
      flat: true,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    segments = 8,
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      name,
      group: "podium",
      flat: true,
    });

  const beam = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) => b.rod(a, c, radius, { color, name, group: "podium", section: "box" });

  const mid = P.concreteMid;
  const light = P.concreteLight;
  const dark = P.concreteDark;
  const weather = P.concreteWeathered;
  const shadow = P.concreteShadow;
  const seam = P.boardSeam;
  const glass = P.glassDark;
  const teal = P.glassTeal;
  const black = P.recessBlack;
  const rust = P.doorRust;
  const mustard = P.doorService;
  const metal = P.railingMetal;
  const hiMetal = P.railingHighlight;
  const soil = P.planterSoil;
  const moss = P.mossGreen;

  // Ground slab: a heavy, almost monolithic datum, with a slightly proud edge.
  box([5.8, 0.18, 7.4], [0, 0.09, 0], dark, "podiumGroundSlab");
  box([5.92, 0.08, 7.52], [0, 0.04, 0], shadow, "podiumGroundShadowEdge");

  // Eight square pilotis. Each has a dark battered-looking foot, a wider pad,
  // a main concrete shaft, and a small capital hidden beneath the upper mass.
  const pilotiSites: [number, number][] = [
    [-2.35, -2.9],
    [0, -2.9],
    [2.35, -2.9],
    [-2.35, -0.85],
    [2.35, -0.85],
    [-2.35, 2.85],
    [0, 2.85],
    [2.35, 2.85],
  ];

  pilotiSites.forEach(([x, z], i) => {
    box([0.68, 0.16, 0.68], [x, 0.22, z], shadow, `pilotiPad${i}`);
    box([0.54, 0.26, 0.54], [x, 0.43, z], dark, `pilotiFoot${i}`);
    box([0.47, 1.72, 0.47], [x, 1.37, z], mid, `pilotiShaft${i}`);
    box([0.54, 0.16, 0.54], [x, 2.28, z], light, `pilotiCapital${i}`);

    // A few deliberately irregular vertical pour marks make the columns less pristine.
    if (i % 2 === 0) {
      box([0.018, 0.92, 0.012], [x - 0.241, 1.06, z + 0.08], weather, `pilotiStreak${i}a`);
      box([0.012, 0.42, 0.018], [x + 0.12, 0.74, z + 0.241], seam, `pilotiStreak${i}b`);
    }
  });

  // Recessed lobby volume. The dark glazing is deliberately split into panels
  // so the concrete mullions read as deep, structural cuts.
  box([4.05, 1.72, 1.72], [0, 1.18, -0.52], black, "lobbyRecess");
  box([3.72, 1.48, 0.055], [0, 1.18, 0.37], glass, "lobbyFrontGlass");
  box([0.055, 1.48, 1.62], [-1.91, 1.18, -0.48], glass, "lobbyGlassLeft");
  box([0.055, 1.48, 1.62], [1.91, 1.18, -0.48], glass, "lobbyGlassRight");
  box([0.055, 1.48, 1.62], [-0.66, 1.18, -0.48], teal, "lobbyGlassPanelL");
  box([0.055, 1.48, 1.62], [0.66, 1.18, -0.48], teal, "lobbyGlassPanelR");

  // Lobby mullions and head beam.
  box([0.12, 1.58, 0.12], [-1.3, 1.18, 0.405], dark, "lobbyMullionL");
  box([0.12, 1.58, 0.12], [1.3, 1.18, 0.405], dark, "lobbyMullionR");
  box([3.96, 0.18, 0.18], [0, 1.98, 0.405], dark, "lobbyHead");
  box([4.02, 0.18, 1.82], [0, 0.29, -0.52], dark, "lobbySill");

  // Recess-black entry opening, rust door, and a small handle.
  box([0.94, 1.72, 0.10], [0, 1.12, 0.445], black, "entryDoorRecess");
  box([0.78, 1.54, 0.055], [0, 1.10, 0.505], rust, "rustedLobbyDoor");
  box([0.055, 0.12, 0.025], [0.29, 1.10, 0.55], hiMetal, "lobbyDoorHandle");
  cyl(0.035, 0.025, [0.29, 1.10, 0.59], hiMetal, 8, "lobbyDoorKnob");

  // Small transom blocks and the entry reveal.
  box([1.12, 0.12, 0.10], [0, 2.0, 0.45], concreteLight, "entryTransom");
  box([0.10, 1.78, 0.11], [-0.55, 1.12, 0.47], shadow, "entryRevealL");
  box([0.10, 1.78, 0.11], [0.55, 1.12, 0.47], shadow, "entryRevealR");

  // Deep entry canopy, with thick fascia and visible board seams in the soffit.
  box([4.75, 0.30, 2.05], [0, 2.36, 1.62], light, "entryCanopy");
  box([4.84, 0.24, 0.12], [0, 2.29, 2.64], mid, "canopyNose");
  box([4.82, 0.09, 0.10], [0, 2.18, 2.61], seam, "canopySoffitShadow");

  for (let i = -4; i <= 4; i++) {
    box([0.035, 0.025, 1.76], [i * 0.47, 2.185, 1.62], seam, `canopySoffitSlat${i}`);
  }

  // Short bearing blocks make the canopy visibly land on the front pilotis.
  for (const x of [-2.35, 2.35]) {
    box([0.62, 0.24, 0.72], [x, 2.16, 2.78], dark, `canopyBearing${x}`);
    box([0.50, 0.16, 0.42], [x, 2.03, 2.91], shadow, `canopyBearingShadow${x}`);
  }

  // Low perimeter planter walls. The front wall is broken around the entry.
  box([0.34, 0.55, 2.15], [-2.68, 0.52, 0.75], dark, "planterWallFrontL");
  box([0.34, 0.55, 2.15], [2.68, 0.52, 0.75], dark, "planterWallFrontR");
  box([0.34, 0.55, 1.72], [-2.68, 0.52, -2.28], dark, "planterWallBackL");
  box([0.34, 0.55, 1.72], [2.68, 0.52, -2.28], dark, "planterWallBackR");
  box([5.18, 0.55, 0.30], [0, 0.52, -3.42], dark, "planterWallRear");
  box([0.30, 0.55, 1.25], [-2.66, 0.52, -0.72], dark, "planterWallSideL");
  box([0.30, 0.55, 1.25], [2.66, 0.52, -0.72], dark, "planterWallSideR");

  // Soil beds, inset below the coping.
  box([0.22, 0.035, 1.93], [-2.68, 0.805, 0.75], soil, "soilFrontL");
  box([0.22, 0.035, 1.93], [2.68, 0.805, 0.75], soil, "soilFrontR");
  box([0.22, 0.035, 1.50], [-2.68, 0.805, -2.28], soil, "soilBackL");
  box([0.22, 0.035, 1.50], [2.68, 0.805, -2.28], soil, "soilBackR");
  box([4.95, 0.035, 0.20], [0, 0.805, -3.42], soil, "soilRear");

  // Blocky shrubs, deliberately sparse and architectural rather than garden-like.
  const shrubSites: [number, number, number, number][] = [
    [-2.68, 0.92, 0.25, 0.30],
    [-2.68, 0.96, 1.18, 0.22],
    [2.68, 0.94, 0.44, 0.28],
    [2.68, 0.97, 1.36, 0.23],
    [-2.68, 0.93, -2.75, 0.20],
    [2.68, 0.96, -2.10, 0.27],
    [0.0, 0.93, -3.42, 0.24],
  ];

  shrubSites.forEach(([x, y, z, s], i) => {
    const dx = (R() - 0.5) * 0.11;
    const dz = (R() - 0.5) * 0.12;
    box([s * 0.72, s * 0.62, s * 0.72], [x + dx, y + s * 0.31, z + dz], moss, `mossBlock${i}`);
    box([s * 0.42, s * 0.32, s * 0.38], [x - dx * 0.5, y + s * 0.75, z + dz * 0.4], moss, `mossCrown${i}`);
  });

  // Coping stones on planter walls.
  box([0.42, 0.08, 2.20], [-2.68, 0.825, 0.75], mid, "planterCopingFrontL");
  box([0.42, 0.08, 2.20], [2.68, 0.825, 0.75], mid, "planterCopingFrontR");
  box([0.42, 0.08, 1.78], [-2.68, 0.825, -2.28], mid, "planterCopingBackL");
  box([0.42, 0.08, 1.78], [2.68, 0.825, -2.28], mid, "planterCopingBackR");
  box([5.25, 0.08, 0.40], [0, 0.825, -3.42], mid, "planterCopingRear");

  // Mustard service door on the left flank, set into a black reveal.
  box([0.09, 1.64, 1.08], [-2.87, 1.12, -0.82], black, "sideDoorReveal");
  box([0.045, 1.42, 0.86], [-2.925, 1.12, -0.82], mustard, "serviceDoor");
  box([0.025, 0.10, 0.025], [-2.955, 1.12, -0.55], hiMetal, "serviceDoorHandle");
  box([0.12, 1.72, 0.12], [-2.79, 2.02, -0.82], light, "serviceDoorLintel");
  box([0.12, 0.12, 1.18], [-2.79, 0.24, -0.82], dark, "serviceDoorSill");

  // A few brutalist construction joints around the open level.
  box([5.60, 0.025, 0.035], [0, 2.595, 3.46], seam, "podiumFrontJoint");
  box([5.60, 0.025, 0.035], [0, 2.595, -3.46], seam, "podiumRearJoint");
  box([0.035, 0.025, 6.90], [-2.68, 2.595, 0], seam, "podiumLeftJoint");
  box([0.035, 0.025, 6.90], [2.68, 2.595, 0], seam, "podiumRightJoint");

  // Drainage stains beneath the canopy and at the outer corners.
  box([0.055, 0.72, 0.018], [-2.18, 1.78, 3.455], weather, "canopyDrainStreakL");
  box([0.055, 0.46, 0.018], [2.18, 1.92, 3.455], weather, "canopyDrainStreakR");
  box([0.028, 0.52, 0.055], [-2.68, 1.35, 3.38], weather, "frontCornerWeathering");
}
```