<!-- call: plan -->

```json
{
  "name": "Nostromo Galley",
  "description": "A cutaway crew galley in the lived-in 1979 Alien Nostromo style: a grimy beige-and-grey industrial kitchen with a back-wall counter, tall fridge and lockers, a bolted-down crew table with benches, and a CRT and toggle-switch wall.",
  "builderName": "nostromoGalley",
  "size": [4.2, 2.7, 4.1],
  "layout": "A room cut away at the front: floor deck, back wall (z=-2.0), +X wall (x=2.0, with a round hatch), -X wall (x=-2.0), and no ceiling, only pipe runs and light boxes along y=2.6. +Z is open to the viewer. Interior is x -2..2, z -2..2, deck top at y=0.1. Everything is a blocky, chunky, practical hardware look: boxes, cylinders and slabs, no curves except pipes, hatch and knobs. The Nostromo style shows as dirty beige and grey painted panels, riveted seams, hazard stripes, amber and CRT-green glow, toggle switches, stencilled warning labels (small red, white and blue plates) and bolted-down furniture. Back wall, left to right (-X to +X): counter run x -1.95..0.65 (sink at x=-1.2, hob at x=-0.1, coffee machine at x=0.35, hood over the hob, upper cabinets above), then the tall fridge and locker bank x 0.65..1.95, with a supply crate stack in the back-right corner. Mid-room: a crew table x -1.15..0.95, z 0.1..1.0, with a bench on each long side. -X wall: a bank of CRT monitors and a switch panel. +X wall: a hatch at z≈0.9. Detail zones are split so nothing overlaps: the shell owns the deck, wall slabs, corner pilasters, the top band above y=2.3 on all walls, the whole +X wall face, the ceiling structure and the hatch. Other parts own what stands on or in front of the walls inside their boxes. Wall colours are hullBeige at the top, hullDark below y=0.5 as a kick band, with hazard stripes on floor edges.",
  "palette": {
    "hullBeige": "#b9b19a",
    "hullDark": "#6f6c64",
    "hullGrey": "#8d9094",
    "ribGrey": "#555a5e",
    "floorDeck": "#3c3f42",
    "floorGrate": "#26292b",
    "steel": "#aeb4b8",
    "steelDark": "#6b7176",
    "counterTop": "#c4c8c9",
    "cabinetCream": "#d3cbb2",
    "cabinetGrey": "#7f868b",
    "pipeGrey": "#9a9d9a",
    "pipeRust": "#8a5a35",
    "hazardYellow": "#d9a521",
    "hazardBlack": "#1c1c1c",
    "amberLight": "#ffb23a",
    "crtGreen": "#5cff9a",
    "crtDark": "#0e1a14",
    "redWarn": "#c8322a",
    "blueLabel": "#3b6a9c",
    "white": "#ece8dc",
    "rubber": "#1f2022",
    "foodTan": "#c99a5b",
    "foodGreen": "#7a8a4a"
  },
  "mounts": {
    "deckTop": [0, 0.1, 0],
    "backWallFace": [0, 1.3, -2.0],
    "wallLeftFace": [2.0, 1.3, 0.5],
    "wallRightFace": [-2.0, 1.3, 0.5],
    "ceilingLine": [0, 2.6, 0],
    "counterTop": [-0.65, 0.95, -1.65],
    "counterFrontEdge": [-0.65, 0.95, -1.3],
    "counterLockerSeam": [0.65, 0.1, -1.65],
    "sinkCenter": [-1.2, 0.95, -1.65],
    "hobCenter": [-0.1, 0.95, -1.65],
    "coffeeSpot": [0.35, 0.95, -1.7],
    "hoodBase": [-0.1, 1.65, -1.65],
    "fridgeDoor": [1.0, 1.1, -1.3],
    "crateCorner": [1.65, 0.1, -0.95],
    "tableTop": [-0.1, 0.8, 0.55],
    "benchBack": [-0.1, 0.45, -0.28],
    "benchFront": [-0.1, 0.45, 1.28],
    "lampMount": [-0.1, 2.6, 0.55],
    "monitorBank": [-1.95, 1.4, 0.4],
    "hatchCenter": [2.0, 1.0, 0.9]
  },
  "joints": [],
  "parts": [
    {
      "id": "shell",
      "builds": "The room structure. (1) Floor deck: a slab x -2.1..2.1, z -2.1..2.0, y 0..0.1 in floorDeck, with an inset grating field in floorGrate (a grid of thin slats and cross-bars, 0.01 proud, covering x -1.9..1.9, z -1.2..1.9, leaving the strip under the counter plain). Hazard-stripe border strips (alternating hazardYellow and hazardBlack small slanted blocks) along the front edge z≈1.95 and around the hatch threshold. Bolt heads on the deck in ribGrey. (2) Wall slabs 0.1 thick: back wall x -2.1..2.1, z -2.1..-2.0, y 0.1..2.6; +X wall x 2.0..2.1, z -2.0..2.0; -X wall x -2.1..-2.0, z -2.0..2.0. Their main colour is hullBeige, and a hullDark kick band y 0.1..0.5 is a separate slab 0.01 proud. (3) Corner pilasters, square ribGrey columns 0.12 wide at the back-left and back-right corners and at the front ends of both side walls, full height to y=2.6, with a rivet row of small steelDark discs. (4) Ceiling structure: ribGrey cross-beams (box girders) spanning x at z=-1.5, 0.0 and 1.5 at y 2.5..2.62, and two long beams along z at x=±1.9. Pipe runs along the ceiling: 4 to 6 horizontal cylinders (radius 0.05 to 0.09) along z and x in pipeGrey and pipeRust with flange rings and valve wheels (small red or amber discs), clamps every 0.5 m, and one pipe drop down the back-right corner. Three flat light boxes under the beams at y 2.45..2.5 (hullGrey frames with white and amberLight glowing panels): one at z=-1.2, one at z=0.5 (centered at x=-0.1, leave room for the table lamp, so offset it to x=0.9), one at z=1.6. (5) Top band: on all three walls above y=2.3, add horizontal panel seams and rivets, stencilled plates in white, redWarn and blueLabel (tiny flat boxes), and ventilation grilles (slatted boxes in steelDark) at x=-1.0 and x=1.0 on the back wall, y 2.35..2.55. (6) The whole +X wall face (x≈1.99), from y=0.5 to 2.3: panel seams every 0.8 m (thin vertical ribGrey strips), rivets, a stencilled red 'GALLEY' bar plate at z=-1.2, y=1.9, and the HATCH centered at hatchCenter: a round bulkhead door of radius 0.55 as a lathe or cylinder along X in hullGrey, with a thick steelDark frame ring, a hazard-stripe outer ring made of alternating small blocks, 8 bolt heads, a central wheel handle (cross of 3 rods and a rim) in steel, a small round porthole (crtDark disc with amberLight glow rim), and a hinge block on the z=0.3 side. Do not put anything on the -X wall face between y=0.5 and 2.3, z>-1.25, and do not put anything on the back wall below y=2.3 except the pilasters.",
      "box": [[-2.1, 0, -2.1], [2.1, 2.7, 2.0]],
      "attaches": "Provides deckTop, backWallFace, wallLeftFace, wallRightFace and ceilingLine. Every other part stands on deckTop or against these wall faces. The ceiling hanging lamp of 'table' ties to lampMount on a beam at y=2.6, and the shell must leave x -0.4..0.2, z 0.35..0.75 free of pipes.",
      "joints": [],
      "floor": true,
      "budget": 180
    },
    {
      "id": "counter",
      "builds": "The back-wall kitchen run, x -1.95..0.65, z -2.0..-1.3, y 0.1..2.3. Lower units: a base box in cabinetGrey x -1.95..0.65, z -1.98..-1.32, y 0.1..0.92, with a hullDark recessed kick plate; a row of 4 to 5 door fronts (cabinetCream slabs 0.02 proud with ribGrey borders) each with a steel bar handle and a pair of rivets, one door with a hazardYellow stripe and a small redWarn label, and one drawer with an amberLight indicator dot. Countertop: a counterTop slab y 0.92..0.97, x -2.0..0.65, z -2.0..-1.28, with a raised steel lip along the front edge and a splashback strip up the wall (steelDark, y 0.97..1.15). Sink at sinkCenter: a recessed steel basin (dark inner box, steel rim), a tall swan-neck tap (cylinder plus a bent rod, with small red and blue knob discs), and a drain grille. Hob at hobCenter: a steel plate with 4 round burners (steelDark discs with rubber ring grates of crossed thin bars), 4 front knobs (rubber cylinders with white marks) on a control strip, and a small pot with lid (steel cylinder, black handle) and a pan on two burners with a foodGreen and foodTan blob inside. Hood over hoodBase: a trapezoid hood in hullGrey (frustumBox, narrowing upward) at y 1.65..2.1, x -0.55..0.35, with a chimney duct up to y=2.3, a steel mesh underside with a glowing amberLight lamp, and a hazardYellow band. Coffee machine at coffeeSpot (x=0.35): a boxy steel unit 0.3 wide, 0.4 high with a glass jug (small white-translucent-looking box or cylinder, use white), a drip spout, a redWarn power button, amberLight status LED and a toggle. Utensil rail along the back wall at y=1.3 between x -0.5..0.55 with hanging ladle, spatula and whisk (thin rods plus small flat heads in steel and rubber). Upper cabinets: boxes in cabinetGrey x -1.95..-0.6, z -2.0..-1.65, y 1.5..2.3 with 3 doors, latches (steel hook blocks), stencil plates in white/blueLabel, rivets. Also a small shelf at x 0.05..0.65, y 1.55, with 3 labelled jars (cylinders in white, foodTan, foodGreen) and a spice rack. A knife strip magnet bar. Dirty details: darker hullDark smudge patches (flat thin boxes) under the hob and around the sink.",
      "box": [[-2.0, 0.1, -2.0], [0.65, 2.3, -1.28]],
      "attaches": "Back sits against backWallFace (z=-2.0). The right end meets the 'lockers' part at counterLockerSeam (x=0.65). The left end meets the -X wall at x=-2.0. Counter top is at y 0.97 (counterTop mount). The front edge is at z=-1.3 (counterFrontEdge).",
      "joints": [],
      "floor": false,
      "budget": 190
    },
    {
      "id": "lockers",
      "builds": "The back-right storage block. Tall fridge x 0.65..1.35, z -2.0..-1.3, y 0.1..1.95: body in hullGrey, door in cabinetCream 0.03 proud with ribGrey frame, a thick vertical steel handle (rod with two standoff blocks), a hazard-striped lower kick, a digital temperature display (crtDark box with crtGreen digits made of tiny bars, glowing), a redWarn 'COLD' plate, a white sticker and a blueLabel plate, rivets in two columns, a rubber gasket line. Next to it the locker bank x 1.35..1.95, z -2.0..-1.3, y 0.1..2.3: six stacked-cabinet doors in cabinetGrey (two columns of three, bottom ones taller) with steel latches, numbered plates (white tiny boxes with dark dashes), one padlock hasp (steel) and a few dents (slightly rotated flat darker plates). A top storage box above the fridge x 0.65..1.35, y 2.0..2.3 with 2 small doors. Right of the lockers the +X wall is at x=2.0, so the lockers' right face stays at x=1.95 with a hullDark filler strip. Supply crate stack in the back-right corner at crateCorner (x 1.3..1.95, z -1.25..-0.6): three stacked crates (boxes 0.5 x 0.35 x 0.5 in foodTan and hullDark, with ribGrey corner brackets, hazardYellow stripes and stencilled white text bars), a smaller crate on top slightly rotated, and a strap (rubber thin box) round the stack with a steel buckle. A steel barrel (cylinder, radius 0.2, height 0.5, with 3 ribGrey hoop rings and a redWarn lid label) at x≈0.95, z≈-0.85. On the floor: a cat bowl (Jones) of redWarn short cylinder with a foodTan kibble pile and a tiny steel water dish beside it, at x≈0.65, z≈-1.0. A coiled hose (swept torus-like path in rubber) hung on a steel hook at the side of the lockers if the budget allows.",
      "box": [[0.65, 0.1, -2.0], [1.95, 2.3, -0.5]],
      "attaches": "Left edge at counterLockerSeam (x=0.65). Back against backWallFace. Right side meets the +X wall (x=2.0). Stands on deckTop. The crate stack must stay within z<-0.6 so the hatch zone (z>0.2 on the +X wall) stays clear.",
      "joints": [],
      "floor": false,
      "budget": 170
    },
    {
      "id": "table",
      "builds": "The crew dining area, centred on tableTop (-0.1, 0.8, 0.55). Table: a steel top slab x -1.15..0.95, z 0.1..1.0, y 0.76..0.82 in steel, with a raised steelDark rim lip, two recessed tray wells, a central hullDark seam strip, hazardYellow corner caps and rivets, on two chunky trestle pedestals (ribGrey boxes with flared feet bolted to the deck by 4 bolt heads each, cross brace bar), x=-0.8 and x=0.6. A bolted-down look. Benches: tops in cabinetGrey with rubber pad strips, y 0.4..0.46, at benchBack (z -0.45..-0.1) and benchFront (z 1.1..1.45), x -1.1..0.9, each on 3 ribGrey leg slabs bolted down, with a hazardYellow edge stripe and a few dirt smudges. Table contents: 3 meal trays (white and hullGrey flat boxes with compartments: foodTan, foodGreen and redWarn bits as tiny boxes and cylinders), 3 mugs (white cylinders with handles made from thin rods; one with a dark rubber coffee disc), a salt and pepper pair, a steel water jug, utensils (thin steel rods in rubber holders), a folded cloth, a stack of 3 plates, a crumpled food packet, and a tiny amber warning lamp. One bench seat holds a jacket (hullDark folded boxes). Hanging lamp at lampMount (x=-0.1, z=0.55): two thin steel rods from the ceiling beam at y=2.6 down to a long lamp box in hullGrey (x -0.7..0.5, y 2.0..2.15) with a white translucent-looking underside panel and amberLight end caps, a cable (rubber rod) draped to the beam. A fold-up condiment shelf is not needed. A pinned paper menu or note with tiny dark lines on the table end is optional. Keep the area x -1.25..-0.3, z 1.0..1.5 clear of tall things so the monitors on the -X wall stay visible.",
      "box": [[-1.25, 0.1, -0.5], [1.05, 2.6, 1.5]],
      "attaches": "Pedestals and bench legs stand on deckTop. The hanging lamp hangs from the beam at ceilingLine (y=2.6) at lampMount. It does not touch any wall. The back bench stays at z>-0.5 so the aisle to the counter (z -1.3..-0.5) stays free.",
      "joints": [],
      "floor": false,
      "budget": 190
    },
    {
      "id": "wallTech",
      "builds": "The -X wall technology bank, x -2.0..-1.7, z -1.25..1.9, y 0.5..2.3, centred on monitorBank (-1.95, 1.4, 0.4); everything faces +X. A wall back-panel in hullGrey 0.05 thick as a base, with ribGrey frame strips. Monitors: three boxy CRT screens in a staggered stack, each an off-white or hullBeige housing box 0.28 deep (extending from the wall to x≈-1.72) with a recessed crtDark face, a glowing crtGreen text pattern (rows of tiny bars of varying length, a tiny cursor block, a small waveform line made of short segments), a bezel, tiny knobs and a vent slot on the side. Sizes: one large (0.7 x 0.55) at y 1.5..2.05, z 0.0..0.7, two smaller (0.45 x 0.35) below it at y 0.95..1.3, z 0.0..0.45 and z 0.5..0.95. Another medium CRT at z 1.1..1.6, y 1.3..1.7 displaying an amberLight status table. Switch panel: a hullDark panel under or beside the screens (z -0.8..-0.1, y 1.0..1.6) with 3 rows of toggle switches (small steel cylinders with rubber tips, alternating up and down), 2 rows of round indicator lights in amberLight, crtGreen and redWarn, two rotary dials (steel cylinders with white pointer marks) and a hazardYellow bordered emergency button (redWarn cap in a steel guard). Menu board near the counter (z -1.2..-0.85, y 1.4..2.0): a slim white board with rows of dark text-bars, a blueLabel header, and a magnet clip. Wall-mounted items: a fire extinguisher (redWarn cylinder with steel nozzle, black hose, white label, bracket) at z=1.75, y 0.7..1.3; a round wall clock (white disc, rim steelDark, tiny hands) at z=-0.55, y=2.1; an intercom unit (hullGrey box with speaker grille slats and an amberLight button) at z=1.3, y=1.9; stencilled signs: a redWarn 'NO SMOKING' plate and a blueLabel 'MOTHER' plate; a cable bundle (rubber swept tubes with clamps) running from the monitors up to the ceiling at y=2.6 and a conduit (pipeGrey cylinder) vertically at z=1.85. A wall-mounted tray rack with 4 slots near the front end, z 1.55..1.9, y 0.7..1.0. Glowing items (screens, LEDs) use the glow kit. Keep it flat against the wall: nothing extends past x=-1.65, and the large pieces stay clear of the -X wall corner pilaster at z>1.88.",
      "box": [[-2.0, 0.5, -1.25], [-1.65, 2.3, 1.9]],
      "attaches": "Back faces sit against wallRightFace (x=-2.0). Top edge ends at y=2.3, under the shell's top band. The front edge (z=-1.25) meets the counter's left end beyond x=-2.0 side, so the menu board sits just beside the upper cabinets. Cables run up to the shell's ceilingLine at y=2.6 at z=0.9.",
      "joints": [],
      "floor": false,
      "budget": 170
    }
  ]
}
```

<!-- call: table -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTable({ b, J, P, M }: any) {
  const R = rng(11);
  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, c: string, g = false) => {
    const p = b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), c, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    });
    if (g) glow(p, 1);
    return p;
  };
  const cyl = (x: number, y: number, z: number, r: number, h: number, c: string, seg = 10, g = false) => {
    const p = b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at: [x, y, z] });
    if (g) glow(p, 1);
    return p;
  };
  const rod = (a: number[], bb: number[], r: number, c: string) => b.rod(a, bb, r, c, { sides: 6 });
  const bolt = (x: number, y: number, z: number, r = 0.018) => cyl(x, y, z, r, 0.012, P.ribGrey, 6);

  // table top
  box(-1.15, 0.95, 0.76, 0.82, 0.1, 1.0, P.steel);
  // rim lip
  box(-1.15, 0.95, 0.82, 0.84, 0.1, 0.12, P.steelDark);
  box(-1.15, 0.95, 0.82, 0.84, 0.98, 1.0, P.steelDark);
  box(-1.15, -1.13, 0.82, 0.84, 0.1, 1.0, P.steelDark);
  box(0.93, 0.95, 0.82, 0.84, 0.1, 1.0, P.steelDark);
  // wells
  box(-1.0, -0.2, 0.815, 0.825, 0.2, 0.9, P.steelDark);
  box(0.0, 0.8, 0.815, 0.825, 0.2, 0.9, P.steelDark);
  box(-0.12, -0.08, 0.82, 0.83, 0.12, 0.98, P.hullDark);
  // hazard corner caps
  for (const x of [-1.15, 0.89]) for (const z of [0.1, 0.94]) {
    box(x, x + 0.06, 0.82, 0.845, z, z + 0.06, P.hazardYellow);
    bolt(x + 0.03, 0.848, z + 0.03, 0.01);
  }
  for (let i = 0; i < 8; i++) { bolt(-1.05 + i * 0.28, 0.84, 0.15, 0.01); bolt(-1.05 + i * 0.28, 0.84, 0.95, 0.01); }

  // pedestals
  for (const x of [-0.8, 0.6]) {
    box(x - 0.1, x + 0.1, 0.1, 0.76, 0.35, 0.75, P.ribGrey);
    box(x - 0.16, x + 0.16, 0.1, 0.16, 0.25, 0.85, P.ribGrey);
    box(x - 0.14, x + 0.14, 0.7, 0.76, 0.3, 0.8, P.steelDark);
    for (const dx of [-0.12, 0.12]) for (const dz of [-0.28, 0.28]) bolt(x + dx, 0.166, 0.55 + dz);
  }
  rod([-0.8, 0.3, 0.55], [0.6, 0.3, 0.55], 0.03, P.ribGrey);

  // benches
  for (const [z0, z1] of [[-0.45, -0.1], [1.1, 1.45]]) {
    box(-1.1, 0.9, 0.4, 0.46, z0, z1, P.cabinetGrey);
    box(-1.08, 0.88, 0.46, 0.465, z0 + 0.1, z1 - 0.1, P.rubber);
    const edge = z0 < 0 ? z1 - 0.02 : z0;
    box(-1.1, 0.9, 0.4, 0.462, edge, edge + 0.02, P.hazardYellow);
    for (const x of [-0.9, -0.1, 0.7]) {
      box(x - 0.04, x + 0.04, 0.1, 0.4, z0 + 0.1, z1 - 0.1, P.ribGrey);
      box(x - 0.08, x + 0.08, 0.1, 0.13, z0 + 0.05, z1 - 0.05, P.ribGrey);
      bolt(x, 0.135, (z0 + z1) / 2);
    }
    for (let i = 0; i < 3; i++) box(-0.9 + R() * 1.6, -0.8 + R() * 1.6, 0.466, 0.468, z0 + 0.05 + R() * 0.2, z0 + 0.15 + R() * 0.15, P.hullDark);
  }
  // jacket
  box(0.4, 0.8, 0.465, 0.51, 1.15, 1.4, P.hullDark);
  box(0.45, 0.75, 0.51, 0.55, 1.18, 1.34, P.hullDark);

  // trays
  [-0.85, -0.35, 0.5].forEach((x, i) => {
    const z = i === 2 ? 0.35 : 0.75;
    box(x - 0.2, x + 0.2, 0.82, 0.835, z - 0.14, z + 0.14, P.hullGrey);
    box(x - 0.18, x - 0.02, 0.835, 0.845, z - 0.12, z + 0.12, P.white);
    box(x + 0.01, x + 0.18, 0.835, 0.845, z - 0.12, z, P.white);
    box(x - 0.15, x - 0.05, 0.845, 0.86, z - 0.08, z + 0.02, P.foodTan);
    box(x + 0.04, x + 0.14, 0.845, 0.855, z - 0.09, z - 0.03, P.foodGreen);
    cyl(x + 0.1, 0.85, z + 0.07, 0.03, 0.02, P.redWarn);
  });
  // mugs
  [[-0.6, 0.45], [0.2, 0.7], [0.7, 0.5]].forEach(([x, z], i) => {
    cyl(x, 0.875, z, 0.04, 0.11, P.white, 10);
    rod([x + 0.04, 0.9, z], [x + 0.08, 0.875, z], 0.006, P.white);
    rod([x + 0.08, 0.875, z], [x + 0.04, 0.85, z], 0.006, P.white);
    if (i === 0) cyl(x, 0.928, z, 0.034, 0.005, P.rubber, 10);
  });
  // salt, pepper, jug
  cyl(0.3, 0.86, 0.3, 0.02, 0.07, P.white, 8);
  cyl(0.36, 0.86, 0.3, 0.02, 0.07, P.rubber, 8);
  cyl(0.85, 0.92, 0.55, 0.06, 0.2, P.steel, 10);
  rod([0.85, 1.0, 0.5], [0.85, 1.0, 0.45], 0.008, P.steelDark);
  // utensils
  box(-0.3, -0.2, 0.82, 0.86, 0.15, 0.2, P.rubber);
  for (let i = 0; i < 3; i++) rod([-0.28 + i * 0.04, 0.85, 0.175], [-0.27 + i * 0.04, 0.95, 0.18], 0.005, P.steel);
  // cloth
  box(-1.05, -0.92, 0.82, 0.835, 0.15, 0.3, P.cabinetCream);
  box(-1.05, -0.92, 0.835, 0.845, 0.17, 0.28, P.white);
  // plates
  for (let i = 0; i < 3; i++) cyl(0.1, 0.83 + i * 0.012, 0.3, 0.07, 0.01, P.white, 12);
  // packet
  box(0.45, 0.55, 0.82, 0.84, 0.8, 0.9, P.foodTan).rotation.y = 0.4;
  // amber lamp
  cyl(-0.7, 0.84, 0.95, 0.025, 0.04, P.amberLight, 8, true);

  // hanging lamp
  for (const x of [-0.5, 0.3]) {
    rod([x, 2.6, 0.55], [x, 2.15, 0.55], 0.008, P.steel);
  }
  box(-0.7, 0.5, 2.0, 2.15, 0.45, 0.65, P.hullGrey);
  box(-0.65, 0.45, 1.99, 2.0, 0.47, 0.63, P.white, true);
  box(-0.72, -0.7, 2.01, 2.14, 0.47, 0.63, P.amberLight, true);
  box(0.5, 0.52, 2.01, 2.14, 0.47, 0.63, P.amberLight, true);
  b.sweep([[0.45, 2.15, 0.65], [0.6, 2.3, 0.7], [0.3, 2.45, 0.6], [0.4, 2.6, 0.55]], 0.01, P.rubber, { sides: 6 });
  return b.root;
}
```

<!-- call: lockers -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildLockers({ b, J, P, M }: any) {
  const r = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: [0, ry, 0] });
  const cyl = (rt: number, h: number, c: string, x: number, y: number, z: number, seg = 14) =>
    b.part(new THREE.CylinderGeometry(rt, rt, h, seg), c, { at: [x, y, z] });
  const cylX = (rt: number, h: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(rt, rt, h, 8), c, { at: [x, y, z], rotation: [0, 0, 90] });

  // ---------- Fridge ----------
  const fz = -1.3;
  box(0.7, 1.85, 0.7, P.hullGrey, 1.0, 1.025, -1.65);
  box(0.64, 1.7, 0.03, P.cabinetCream, 1.0, 1.0, fz + 0.015);
  // frame
  box(0.68, 0.03, 0.04, P.ribGrey, 1.0, 1.87, fz + 0.02);
  box(0.68, 0.03, 0.04, P.ribGrey, 1.0, 0.16, fz + 0.02);
  box(0.03, 1.72, 0.04, P.ribGrey, 0.665, 1.0, fz + 0.02);
  box(0.03, 1.72, 0.04, P.ribGrey, 1.335, 1.0, fz + 0.02);
  // gasket line
  box(0.6, 0.012, 0.01, P.rubber, 1.0, 1.0, fz + 0.035);
  // handle
  box(0.04, 0.05, 0.05, P.steelDark, 0.75, 1.5, fz + 0.05);
  box(0.04, 0.05, 0.05, P.steelDark, 0.75, 0.8, fz + 0.05);
  cyl(0.02, 0.85, P.steel, 0.75, 1.15, fz + 0.085, 8);
  // hazard kick
  for (let i = 0; i < 8; i++) box(0.07, 0.1, 0.02, i % 2 ? P.hazardBlack : P.hazardYellow, 0.69 + i * 0.08, 0.17, fz + 0.04, 0);
  // display
  box(0.22, 0.1, 0.02, P.crtDark, 1.12, 1.7, fz + 0.04);
  const seg = [[-0.07, 0], [-0.02, 0], [0.04, 0]];
  seg.forEach(([dx]) => {
    glow(box(0.03, 0.006, 0.006, P.crtGreen, 1.12 + dx, 1.725, fz + 0.055));
    glow(box(0.03, 0.006, 0.006, P.crtGreen, 1.12 + dx, 1.675, fz + 0.055));
    glow(box(0.006, 0.05, 0.006, P.crtGreen, 1.12 + dx + 0.012, 1.7, fz + 0.055));
  });
  box(0.14, 0.06, 0.012, P.redWarn, 1.12, 1.55, fz + 0.036);
  box(0.1, 0.012, 0.006, P.white, 1.12, 1.55, fz + 0.045);
  box(0.09, 0.09, 0.008, P.white, 0.9, 1.35, fz + 0.034, 0);
  box(0.12, 0.05, 0.008, P.blueLabel, 1.2, 1.3, fz + 0.034);
  for (const x of [0.7, 1.3]) for (let k = 0; k < 6; k++) cyl(0.008, 0.01, P.steelDark, x, 0.4 + k * 0.28, fz + 0.04, 6).rotation.x = Math.PI / 2;

  // top storage box
  box(0.7, 0.3, 0.7, P.cabinetGrey, 1.0, 2.15, -1.65);
  for (const s of [-1, 1]) {
    box(0.32, 0.24, 0.02, P.cabinetCream, 1.0 + s * 0.17, 2.15, fz + 0.01);
    box(0.06, 0.015, 0.02, P.steel, 1.0 + s * 0.17 - s * 0.1, 2.15, fz + 0.03);
  }

  // ---------- Lockers ----------
  box(0.6, 2.2, 0.7, P.hullDark, 1.65, 1.2, -1.65);
  const rows = [[0.1, 0.9], [1.0, 0.65], [1.65, 0.65]];
  let num = 1;
  [1.5, 1.8].forEach((x) => {
    rows.forEach(([y0, h]) => {
      const y = y0 + h / 2 + 0.01;
      box(0.27, h - 0.04, 0.03, P.cabinetGrey, x, y, fz + 0.015);
      box(0.29, 0.015, 0.035, P.ribGrey, x, y + h / 2 - 0.03, fz + 0.015);
      box(0.04, 0.08, 0.04, P.steel, x - 0.08, y, fz + 0.045);
      box(0.06, 0.02, 0.02, P.steel, x - 0.08, y + 0.05, fz + 0.06);
      box(0.08, 0.04, 0.008, P.white, x + 0.05, y + h / 2 - 0.1, fz + 0.034);
      box(0.012, 0.02, 0.006, P.rubber, x + 0.03 + (num % 3) * 0.01, y + h / 2 - 0.1, fz + 0.04);
      box(0.012, 0.02, 0.006, P.rubber, x + 0.06, y + h / 2 - 0.1, fz + 0.04);
      num++;
    });
  });
  // padlock hasp
  box(0.05, 0.07, 0.02, P.steel, 1.76, 0.55, fz + 0.06);
  box(0.04, 0.05, 0.02, P.hazardYellow, 1.76, 0.5, fz + 0.075);
  // dents
  box(0.1, 0.07, 0.006, P.steelDark, 1.82, 1.35, fz + 0.034, 0).rotation.z = 0.4;
  box(0.08, 0.05, 0.006, P.hullDark, 1.5, 2.0, fz + 0.034).rotation.z = -0.3;
  box(0.1, 0.3, 0.02, P.hullDark, 1.9, 2.0, fz + 0.01);
  // filler strip
  box(0.05, 2.2, 0.7, P.hullDark, 1.975, 1.2, -1.65);

  // ---------- Crates ----------
  const crate = (x: number, y: number, z: number, c: string, ry = 0) => {
    box(0.5, 0.35, 0.5, c, x, y, z, ry);
    for (const s of [-1, 1]) {
      box(0.04, 0.37, 0.52, P.ribGrey, x + s * 0.23 * Math.cos(ry * Math.PI / 180), y, z - s * 0.23 * Math.sin(ry * Math.PI / 180), ry);
    }
    box(0.3, 0.05, 0.505, P.hazardYellow, x, y + 0.1, z, ry);
    box(0.2, 0.025, 0.505, P.white, x, y - 0.05, z, ry);
  };
  crate(1.65, 0.275, -0.92, P.foodTan);
  crate(1.62, 0.625, -0.92, P.hullDark);
  crate(1.66, 0.975, -0.92, P.foodTan);
  crate(1.65, 1.28, -0.9, P.hullDark, 15).scale.set(0.7, 0.8, 0.7);
  box(0.54, 0.05, 0.54, P.rubber, 1.65, 0.62, -0.92);
  box(0.06, 0.07, 0.02, P.steel, 1.65, 0.62, -0.64);

  // ---------- Barrel ----------
  cyl(0.2, 0.5, P.steel, 0.95, 0.35, -0.85, 16);
  for (const y of [0.18, 0.35, 0.52]) cyl(0.207, 0.03, P.ribGrey, 0.95, y, -0.85, 16);
  cyl(0.15, 0.01, P.redWarn, 0.95, 0.605, -0.85, 12);

  // ---------- Cat bowl ----------
  cyl(0.09, 0.05, P.redWarn, 0.75, 0.125, -1.0, 12);
  for (let i = 0; i < 9; i++)
    box(0.02, 0.02, 0.02, P.foodTan, 0.75 + (r() - 0.5) * 0.09, 0.155 + r() * 0.01, -1.0 + (r() - 0.5) * 0.09, r() * 90);
  cyl(0.05, 0.03, P.steel, 0.9 - 0.02, 0.115, -1.12, 10);
  // dish water
  cyl(0.04, 0.005, P.blueLabel, 0.88, 0.132, -1.12, 10);

  // ---------- Hose on hook ----------
  box(0.04, 0.04, 0.06, P.steel, 1.92, 1.3, -0.6);
  const hoseP = new THREE.Curve<THREE.Vector3>();
  for (let i = 0; i < 3; i++) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.09 - i * 0.008, 0.015, 6, 14), new THREE.MeshStandardMaterial());
    b.part(new THREE.TorusGeometry(0.1 - i * 0.008, 0.016, 6, 14), P.rubber, {
      at: [1.9, 1.2, -0.6 - i * 0.035],
      rotation: [0, 90, 0],
    });
    t.geometry.dispose();
  }
  void hoseP;
}
```

<!-- call: counter -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCounter({ b, J, P, M }: any) {
  const R = rng(5);
  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, c: string, g = false) => {
    const p = b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), c, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    });
    if (g) glow(p, 1);
    return p;
  };
  const cyl = (x: number, y: number, z: number, r: number, h: number, c: string, dir: number[] = [0, 1, 0], seg = 10, g = false) => {
    const p = b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at: [x, y, z], dir });
    if (g) glow(p, 1);
    return p;
  };
  const rod = (a: number[], c: number[], r: number, col: string) => b.rod(a, c, r, col);

  // base, kick, top
  box(-1.95, 0.65, 0.1, 0.92, -1.98, -1.32, P.cabinetGrey);
  box(-1.95, 0.65, 0.1, 0.2, -1.31, -1.3, P.hullDark);
  box(-2, 0.65, 0.92, 0.97, -2, -1.28, P.counterTop);
  box(-2, 0.65, 0.97, 1.02, -1.3, -1.28, P.steel);
  box(-2, 0.65, 0.97, 1.15, -2, -1.97, P.steelDark);

  // doors
  const doors = [-1.9, -1.4, -0.9, -0.4, 0.1];
  const dw = 0.46;
  doors.forEach((x0, i) => {
    const cx = x0 + dw / 2;
    const drawer = i === 3;
    box(x0 - 0.01, x0 + dw + 0.01, 0.22, 0.9, -1.325, -1.315, P.ribGrey);
    box(x0, x0 + dw, 0.24, 0.88, -1.315, -1.295, P.cabinetCream);
    if (drawer) {
      box(x0 + 0.02, x0 + dw - 0.02, 0.6, 0.62, -1.295, -1.285, P.ribGrey);
      cyl(x0 + 0.4, 0.8, -1.292, 0.015, 0.01, P.amberLight, [0, 0, 1], 8, true);
    }
    rod([cx - 0.12, 0.7, -1.27], [cx + 0.12, 0.7, -1.27], 0.01, P.steel);
    for (const s of [-1, 1]) cyl(cx + s * 0.17, 0.82, -1.292, 0.01, 0.01, P.steelDark, [0, 0, 1], 6);
    for (const s of [-1, 1]) cyl(cx + s * 0.17, 0.3, -1.292, 0.01, 0.01, P.steelDark, [0, 0, 1], 6);
  });
  box(-1.4, -0.96, 0.4, 0.5, -1.294, -1.284, P.hazardYellow);
  box(-1.2, -1.1, 0.33, 0.37, -1.294, -1.284, P.redWarn);

  // sink
  box(-1.5, -0.9, 0.97, 0.985, -1.85, -1.45, P.steel);
  box(-1.42, -0.98, 0.97, 0.99, -1.78, -1.52, P.crtDark);
  box(-1.3, -1.1, 0.985, 0.995, -1.7, -1.6, P.steelDark);
  cyl(-1.2, 1.2, -1.9, 0.02, 0.5, P.steel);
  rod([-1.2, 1.45, -1.9], [-1.2, 1.5, -1.8], 0.02, P.steel);
  rod([-1.2, 1.5, -1.8], [-1.2, 1.4, -1.7], 0.02, P.steel);
  cyl(-1.28, 1.02, -1.92, 0.025, 0.02, P.redWarn);
  cyl(-1.12, 1.02, -1.92, 0.025, 0.02, P.blueLabel);

  // hob
  box(-0.45, 0.25, 0.97, 0.99, -1.9, -1.4, P.steel);
  const burners = [[-0.3, -1.8], [0.1, -1.8], [-0.3, -1.52], [0.1, -1.52]];
  burners.forEach(([x, z]) => {
    cyl(x, 1.0, z, 0.08, 0.02, P.steelDark, [0, 1, 0], 12);
    rod([x - 0.09, 1.025, z], [x + 0.09, 1.025, z], 0.006, P.rubber);
    rod([x, 1.025, z - 0.09], [x, 1.025, z + 0.09], 0.006, P.rubber);
  });
  box(-0.45, 0.25, 0.97, 1.0, -1.42, -1.38, P.hullDark);
  [-0.35, -0.15, 0.05, 0.2].forEach((x) => {
    cyl(x, 1.0, -1.37, 0.025, 0.04, P.rubber, [0, 0, 1], 8);
    box(x - 0.003, x + 0.003, 1.0, 1.025, -1.34, -1.335, P.white);
  });
  cyl(-0.3, 1.1, -1.8, 0.08, 0.14, P.steel, [0, 1, 0], 12);
  cyl(-0.3, 1.18, -1.8, 0.085, 0.02, P.steelDark, [0, 1, 0], 12);
  rod([-0.22, 1.15, -1.8], [-0.12, 1.15, -1.8], 0.01, P.rubber);
  cyl(0.1, 1.03, -1.8, 0.1, 0.04, P.steelDark, [0, 1, 0], 12);
  box(0.0, 0.2, 1.05, 1.06, -1.85, -1.75, P.foodGreen);
  box(0.05, 0.15, 1.05, 1.07, -1.82, -1.78, P.foodTan);
  rod([0.2, 1.05, -1.8], [0.32, 1.05, -1.8], 0.01, P.rubber);

  // hood
  b.frustumBox([-0.1, 1.65, -1.78], [-0.1, 2.1, -1.78], [0.9, 0.45], [0.35, 0.3], { color: P.hullGrey });
  box(-0.25, 0.05, 2.1, 2.3, -1.9, -1.65, P.hullGrey);
  box(-0.5, 0.3, 1.66, 1.7, -1.5, -1.45, P.hazardYellow);
  box(-0.4, 0.2, 1.64, 1.65, -2.0, -1.5, P.steelDark);
  cyl(-0.1, 1.63, -1.65, 0.05, 0.02, P.amberLight, [0, 1, 0], 8, true);

  // coffee machine
  box(0.2, 0.5, 0.97, 1.37, -1.95, -1.65, P.steel);
  box(0.22, 0.48, 1.0, 1.1, -1.68, -1.45, P.steelDark);
  cyl(0.35, 1.1, -1.55, 0.06, 0.14, P.white, [0, 1, 0], 10);
  cyl(0.35, 1.25, -1.62, 0.015, 0.06, P.steelDark);
  cyl(0.28, 1.3, -1.64, 0.015, 0.01, P.redWarn, [0, 0, 1], 8);
  cyl(0.38, 1.3, -1.64, 0.01, 0.01, P.amberLight, [0, 0, 1], 6, true);
  rod([0.44, 1.25, -1.64], [0.44, 1.3, -1.62], 0.006, P.steel);

  // utensil rail
  rod([-0.5, 1.3, -1.97], [0.55, 1.3, -1.97], 0.01, P.steel);
  [[-0.35, 0.3, P.steel], [-0.15, 0.28, P.rubber], [0.05, 0.25, P.steel]].forEach(([x, l, c]: any) => {
    rod([x, 1.3, -1.95], [x, 1.3 - l, -1.95], 0.006, P.steelDark);
    box(x - 0.025, x + 0.025, 1.3 - l - 0.06, 1.3 - l, -1.96, -1.94, c);
  });
  box(0.3, 0.55, 1.4, 1.42, -1.97, -1.95, P.steelDark);

  // upper cabinets
  box(-1.95, -0.6, 1.5, 2.3, -2, -1.65, P.cabinetGrey);
  [-1.95, -1.5, -1.05].forEach((x, i) => {
    box(x + 0.02, x + 0.43, 1.54, 2.26, -1.655, -1.645, P.ribGrey);
    box(x + 0.04, x + 0.41, 1.56, 2.24, -1.645, -1.635, P.cabinetCream);
    box(x + 0.36, x + 0.4, 1.6, 1.66, -1.63, -1.6, P.steel);
    box(x + 0.12, x + 0.28, 2.1, 2.16, -1.634, -1.628, i % 2 ? P.blueLabel : P.white);
    cyl(x + 0.08, 2.2, -1.633, 0.008, 0.01, P.steelDark, [0, 0, 1], 6);
    cyl(x + 0.38, 2.2, -1.633, 0.008, 0.01, P.steelDark, [0, 0, 1], 6);
  });

  // shelf & jars
  box(0.05, 0.65, 1.52, 1.55, -1.95, -1.7, P.steelDark);
  [[0.15, P.white], [0.3, P.foodTan], [0.45, P.foodGreen]].forEach(([x, c]: any) => {
    cyl(x, 1.62, -1.82, 0.05, 0.1, c, [0, 1, 0], 8);
    cyl(x, 1.68, -1.82, 0.052, 0.015, P.rubber, [0, 1, 0], 8);
  });
  box(0.05, 0.65, 1.8, 1.82, -1.97, -1.9, P.steel);
  for (let i = 0; i < 5; i++) cyl(0.1 + i * 0.11, 1.87, -1.93, 0.025, 0.08, i % 2 ? P.redWarn : P.foodTan, [0, 1, 0], 6);

  // knife strip
  box(-0.55, -0.15, 1.1, 1.13, -1.97, -1.95, P.steelDark);
  for (let i = 0; i < 4; i++) box(-0.5 + i * 0.1, -0.48 + i * 0.1, 0.96, 1.1, -1.955, -1.945, P.steel);

  // smudges
  box(-0.4, 0.2, 0.97, 0.972, -1.95, -1.7, P.hullDark);
  box(-1.55, -0.85, 0.99, 0.992, -1.9, -1.4, P.hullDark);
  for (let i = 0; i < 3; i++) {
    const x = -1.5 + R() * 1.8;
    box(x, x + 0.15, 0.4, 0.5, -1.295, -1.293, P.hullDark);
  }
}
```

<!-- call: shell -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildShell({ b, J, P, M }: any) {
  const r = rng(11);
  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, c: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), c, { at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
  const cyl = (rad: number, len: number, c: string, at: number[], axis: "x" | "y" | "z", seg = 10) =>
    b.part(new THREE.CylinderGeometry(rad, rad, len, seg), c, {
      at,
      dir: axis === "x" ? [1, 0, 0] : axis === "y" ? [0, 1, 0] : [0, 0, 1],
    });

  // Floor deck
  box(-2.1, 2.1, 0, 0.1, -2.1, 2.0, P.floorDeck);
  // Grating
  for (let x = -1.9; x <= 1.91; x += 0.2) box(x - 0.01, x + 0.01, 0.1, 0.11, -1.2, 1.9, P.floorGrate);
  for (let z = -1.2; z <= 1.91; z += 0.3) box(-1.9, 1.9, 0.1, 0.11, z - 0.015, z + 0.015, P.floorGrate);
  // Hazard strips front edge
  for (let i = 0; i < 20; i++) {
    const x = -2.0 + i * 0.2;
    b.part(new THREE.BoxGeometry(0.1, 0.012, 0.1), i % 2 ? P.hazardBlack : P.hazardYellow, {
      at: [x + 0.05, 0.106, 1.95], rotation: [0, 25, 0],
    });
  }
  // Hazard strips by hatch threshold
  for (let i = 0; i < 10; i++)
    b.part(new THREE.BoxGeometry(0.1, 0.012, 0.1), i % 2 ? P.hazardBlack : P.hazardYellow, {
      at: [1.85, 0.106, 0.35 + i * 0.1 + 0.05], rotation: [0, 25, 0],
    });
  // Floor bolts
  for (let i = 0; i < 14; i++) cyl(0.02, 0.012, P.ribGrey, [-1.9 + (i % 7) * 0.63, 0.106, i < 7 ? 1.7 : -1.25], "y", 6);

  // Walls
  box(-2.1, 2.1, 0.1, 2.6, -2.1, -2.0, P.hullBeige);
  box(2.0, 2.1, 0.1, 2.6, -2.0, 2.0, P.hullBeige);
  box(-2.1, -2.0, 0.1, 2.6, -2.0, 2.0, P.hullBeige);
  box(-2.0, 2.0, 0.1, 0.5, -2.0, -1.99, P.hullDark);
  box(1.99, 2.0, 0.1, 0.5, -2.0, 2.0, P.hullDark);
  box(-2.0, -1.99, 0.1, 0.5, -2.0, 2.0, P.hullDark);

  // Pilasters
  for (const [x, z] of [[-1.94, -1.94], [1.94, -1.94], [-1.94, 1.94], [1.94, 1.94]]) {
    box(x - 0.06, x + 0.06, 0.1, 2.6, z - 0.06, z + 0.06, P.ribGrey);
    for (let k = 0; k < 6; k++)
      cyl(0.015, 0.01, P.steelDark, [x, 0.4 + k * 0.4, z + (z > 0 ? 0.065 : 0.065)], "z", 6);
  }

  // Ceiling beams
  for (const z of [-1.5, 0, 1.5]) box(-2.0, 2.0, 2.5, 2.62, z - 0.06, z + 0.06, P.ribGrey);
  for (const x of [-1.9, 1.9]) box(x - 0.06, x + 0.06, 2.5, 2.62, -2.0, 2.0, P.ribGrey);

  // Pipes
  const pipes: [number, string, number[], "x" | "z", number][] = [
    [0.07, P.pipeGrey, [-1.4, 2.4, 0], "z", 4],
    [0.05, P.pipeRust, [-1.1, 2.42, 0], "z", 4],
    [0.08, P.pipeGrey, [0, 2.38, -1.8], "x", 4],
    [0.05, P.pipeRust, [0.8, 2.42, 1.2], "x", 2.4],
    [0.06, P.pipeGrey, [1.5, 2.4, 0], "z", 4],
  ];
  for (const [rad, c, at, ax, len] of pipes) {
    cyl(rad, len, c, at, ax);
    for (let k = -3; k <= 3; k++) {
      const o = k * 0.5;
      const p = ax === "z" ? [at[0], at[1], at[2] + o] : [at[0] + o, at[1], at[2]];
      if (Math.abs(o) < len / 2) {
        cyl(rad * 1.3, 0.03, P.steelDark, p, ax);
        if (k % 2 === 0) box(p[0] - 0.02, p[0] + 0.02, at[1] + rad, 2.5, p[2] - 0.02, p[2] + 0.02, P.ribGrey);
      }
    }
  }
  // Valve wheels
  cyl(0.06, 0.015, P.redWarn, [-1.4, 2.5, -0.6], "y");
  cyl(0.05, 0.015, P.amberLight, [1.5, 2.5, 0.8], "y");
  // Corner drop pipe
  cyl(0.06, 2.3, P.pipeGrey, [1.82, 1.4, -1.82], "y");
  for (let k = 0; k < 4; k++) cyl(0.08, 0.04, P.steelDark, [1.82, 0.5 + k * 0.6, -1.82], "y");

  // Light boxes
  for (const [x, z] of [[0, -1.2], [0.9, 0.5], [0, 1.6]] as number[][]) {
    box(x - 0.4, x + 0.4, 2.45, 2.5, z - 0.12, z + 0.12, P.hullGrey);
    box(x - 0.34, x + 0.34, 2.44, 2.45, z - 0.07, z + 0.07, P.white);
    box(x - 0.36, x - 0.3, 2.435, 2.45, z - 0.07, z + 0.07, P.amberLight);
    box(x + 0.3, x + 0.36, 2.435, 2.45, z - 0.07, z + 0.07, P.amberLight);
  }

  // Top band: seams
  box(-2.0, 2.0, 2.3, 2.31, -1.99, -1.98, P.ribGrey);
  box(1.98, 1.99, 2.3, 2.31, -2.0, 2.0, P.ribGrey);
  box(-1.99, -1.98, 2.3, 2.31, -2.0, 2.0, P.ribGrey);
  for (let i = 0; i < 16; i++) {
    const x = -1.8 + i * 0.24;
    cyl(0.012, 0.01, P.steelDark, [x, 2.4, -1.99], "z", 6);
    cyl(0.012, 0.01, P.steelDark, [x, 2.4, -1.99], "z", 6);
  }
  // Plates
  const cols = [P.white, P.redWarn, P.blueLabel, P.white, P.redWarn];
  cols.forEach((c, i) => box(-0.6 + i * 0.3, -0.6 + i * 0.3 + 0.2, 2.42, 2.5, -1.985, -1.98, c));
  cols.forEach((c, i) => box(1.975, 1.98, 2.42, 2.5, -1.5 + i * 0.5, -1.3 + i * 0.5, c));
  cols.forEach((c, i) => box(-1.98, -1.975, 2.42, 2.5, -1.4 + i * 0.6, -1.2 + i * 0.6, c));
  // Vent grilles
  for (const x of [-1.0, 1.0]) {
    box(x - 0.25, x + 0.25, 2.35, 2.55, -1.98, -1.96, P.steelDark);
    for (let k = 0; k < 7; k++) box(x - 0.22, x + 0.22, 2.38 + k * 0.026, 2.395 + k * 0.026, -1.96, -1.94, P.ribGrey);
  }

  // +X wall face
  for (let z = -1.6; z <= 1.7; z += 0.8) box(1.97, 1.99, 0.5, 2.3, z - 0.02, z + 0.02, P.ribGrey);
  for (let i = 0; i < 10; i++)
    for (const y of [0.6, 2.2]) cyl(0.012, 0.01, P.steelDark, [1.985, y, -1.9 + i * 0.4], "x", 6);
  box(1.96, 1.98, 1.85, 1.95, -1.5, -0.9, P.redWarn);
  for (let i = 0; i < 5; i++) box(1.955, 1.96, 1.87, 1.93, -1.45 + i * 0.11, -1.4 + i * 0.11, P.white);

  // Hatch
  const hz = 0.9, hy = 1.0;
  cyl(0.62, 0.04, P.steelDark, [1.97, hy, hz], "x", 20);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.03, 0.09, 0.09), i % 2 ? P.hazardBlack : P.hazardYellow, {
      at: [1.945, hy + Math.sin(a) * 0.6, hz + Math.cos(a) * 0.6], rotation: [(-a * 180) / Math.PI, 0, 0],
    });
  }
  cyl(0.55, 0.05, P.hullGrey, [1.94, hy, hz], "x", 20);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    cyl(0.025, 0.02, P.steel, [1.91, hy + Math.sin(a) * 0.45, hz + Math.cos(a) * 0.45], "x", 6);
  }
  // wheel
  cyl(0.02, 0.5, P.steel, [1.9, hy, hz], "y");
  cyl(0.02, 0.5, P.steel, [1.9, hy, hz], "z");
  b.part(new THREE.TorusGeometry(0.2, 0.02, 6, 16), P.steel, { at: [1.9, hy, hz], dir: [1, 0, 0], axis: "z" });
  cyl(0.04, 0.04, P.steel, [1.9, hy, hz], "x");
  // porthole
  cyl(0.11, 0.02, P.amberLight, [1.915, hy + 0.32, hz], "x", 14);
  cyl(0.085, 0.025, P.crtDark, [1.91, hy + 0.32, hz], "x", 14);
  // hinge
  box(1.88, 1.96, hy - 0.3, hy + 0.3, 0.22, 0.34, P.steelDark);
  for (const y of [-0.2, 0.2]) cyl(0.03, 0.14, P.steel, [1.9, hy + y, 0.3], "y", 8);

  return b.root;
}
```

<!-- call: wallTech -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildWallTech({ b, J, P, M }: Ctx) {
  const R = rng(11);
  // box helper: x range, y range, z range
  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, c: string, g = false) => {
    const p = b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), c, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    });
    if (g) glow(p, 1);
    return p;
  };
  // cylinder along X
  const cylX = (x: number, y: number, z: number, r: number, len: number, c: string, g = false, seg = 10) => {
    const p = b.part(new THREE.CylinderGeometry(r, r, len, seg), c, { at: [x, y, z], dir: [1, 0, 0] });
    if (g) glow(p, 1);
    return p;
  };
  const cylY = (x: number, y: number, z: number, r: number, len: number, c: string, seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), c, { at: [x, y, z] });

  // back panel
  box(-2.0, -1.95, 0.5, 2.3, -1.25, 1.9, P.hullGrey);
  // frame strips
  box(-1.95, -1.92, 0.5, 0.56, -1.25, 1.9, P.ribGrey);
  box(-1.95, -1.92, 2.24, 2.3, -1.25, 1.9, P.ribGrey);
  for (const z of [-1.22, 0.97, 1.87]) box(-1.95, -1.92, 0.5, 2.3, z - 0.03, z + 0.03, P.ribGrey);

  // CRT builder
  const X0 = -1.95, XF = -1.72;
  const crt = (z0: number, z1: number, y0: number, y1: number, kind: "green" | "amber") => {
    const zc = (z0 + z1) / 2, yc = (y0 + y1) / 2;
    box(X0, XF, y0, y1, z0, z1, P.white);
    box(XF, XF + 0.01, y0 + 0.02, y1 - 0.02, z0 + 0.02, z1 - 0.02, P.hullBeige); // bezel
    box(XF + 0.01, XF + 0.02, y0 + 0.05, y1 - 0.05, z0 + 0.05, z1 - 0.05, P.crtDark);
    const col = kind === "green" ? P.crtGreen : P.amberLight;
    const w = z1 - z0 - 0.12, h = y1 - y0 - 0.12;
    const rows = Math.max(3, Math.floor(h / 0.045));
    const xs = XF + 0.02;
    for (let i = 0; i < rows - 1; i++) {
      const y = y1 - 0.07 - i * (h / rows);
      if (kind === "amber") {
        for (let k = 0; k < 3; k++) {
          const len = w / 3 - 0.02;
          box(xs, xs + 0.006, y - 0.007, y + 0.007, z0 + 0.06 + k * (w / 3), z0 + 0.06 + k * (w / 3) + len * (0.4 + R() * 0.6), col, true);
        }
      } else {
        const len = w * (0.3 + R() * 0.65);
        box(xs, xs + 0.006, y - 0.007, y + 0.007, z0 + 0.06, z0 + 0.06 + len, col, true);
      }
    }
    // cursor
    box(xs, xs + 0.008, y0 + 0.06, y0 + 0.08, z0 + 0.06, z0 + 0.08, col, true);
    // waveform
    for (let k = 0; k < 8; k++) {
      const zz = z0 + 0.09 + k * ((w - 0.1) / 8);
      box(xs, xs + 0.006, y0 + 0.07 + (k % 2) * 0.012, y0 + 0.08 + (k % 2) * 0.012, zz, zz + (w - 0.1) / 8, col, true);
    }
    // knobs and vent
    cylX(XF + 0.02, y0 + 0.025, z1 - 0.05, 0.012, 0.025, P.steelDark);
    cylX(XF + 0.02, y0 + 0.025, z1 - 0.1, 0.012, 0.025, P.steelDark);
    for (let k = 0; k < 4; k++) box(XF - 0.01, XF + 0.0, yc - 0.06 + k * 0.03, yc - 0.045 + k * 0.03, z1 - 0.003, z1 + 0.004, P.hullDark);
  };
  crt(0.0, 0.7, 1.5, 2.05, "green");
  crt(0.0, 0.45, 0.95, 1.3, "green");
  crt(0.5, 0.95, 0.95, 1.3, "green");
  crt(1.1, 1.6, 1.3, 1.7, "amber");

  // switch panel
  box(-1.95, -1.9, 1.0, 1.6, -0.8, -0.1, P.hullDark);
  box(-1.9, -1.885, 1.0, 1.02, -0.8, -0.1, P.hazardYellow);
  box(-1.9, -1.885, 1.58, 1.6, -0.8, -0.1, P.hazardYellow);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 6; c++) {
      const z = -0.74 + c * 0.1, y = 1.5 - r * 0.07;
      box(-1.9, -1.885, y - 0.015, y + 0.015, z - 0.02, z + 0.02, P.steelDark);
      const up = (r + c) % 2 ? 1 : -1;
      b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.04, 6), P.steel, { at: [-1.88, y + up * 0.018, z], dir: [0.3, up, 0] });
      b.part(new THREE.SphereGeometry(0.011, 6, 4), P.rubber, { at: [-1.875, y + up * 0.036, z] });
    }
  const cols = [P.amberLight, P.crtGreen, P.redWarn];
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 6; c++)
      glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), cols[(c + r) % 3], { at: [-1.89, 1.24 - r * 0.05, -0.74 + c * 0.1] }), 1);
  for (const z of [-0.65, -0.5]) {
    cylX(-1.88, 1.07, z, 0.03, 0.03, P.steel);
    box(-1.862, -1.856, 1.07, 1.1, z - 0.004, z + 0.004, P.white);
  }
  box(-1.89, -1.87, 1.03, 1.1, -0.35, -0.22, P.hazardYellow);
  cylX(-1.865, 1.065, -0.285, 0.035, 0.02, P.steel);
  cylX(-1.855, 1.065, -0.285, 0.025, 0.025, P.redWarn);

  // menu board
  box(-1.95, -1.92, 1.4, 2.0, -1.2, -0.85, P.white);
  box(-1.92, -1.91, 1.88, 2.0, -1.2, -0.85, P.blueLabel);
  for (let i = 0; i < 6; i++) box(-1.92, -1.912, 1.45 + i * 0.07, 1.47 + i * 0.07, -1.15, -1.15 + 0.1 + R() * 0.15, P.crtDark);
  box(-1.92, -1.9, 1.97, 2.03, -1.04, -1.0, P.steelDark);

  // clock
  cylX(-1.94, 2.1, -0.55, 0.12, 0.03, P.steelDark, false, 14);
  cylX(-1.92, 2.1, -0.55, 0.1, 0.02, P.white, false, 14);
  box(-1.905, -1.9, 2.1, 2.17, -0.555, -0.545, P.crtDark);
  box(-1.905, -1.9, 2.095, 2.105, -0.55, -0.48, P.crtDark);

  // intercom
  box(-1.95, -1.88, 1.78, 2.02, 1.2, 1.4, P.hullGrey);
  for (let i = 0; i < 5; i++) box(-1.88, -1.87, 1.9 + i * 0.02, 1.91 + i * 0.02, 1.23, 1.37, P.steelDark);
  glow(cylX(-1.87, 1.82, 1.3, 0.016, 0.015, P.amberLight), 1);

  // signs
  box(-1.95, -1.935, 1.62, 1.72, 1.15, 1.45, P.redWarn);
  box(-1.935, -1.93, 1.67, 1.69, 1.18, 1.42, P.white);
  box(-1.95, -1.935, 0.6, 0.66, -0.55, -0.1, P.blueLabel);
  box(-1.935, -1.93, 0.62, 0.64, -0.5, -0.15, P.white);

  // extinguisher
  cylX(-1.84, 0.95, 1.75, 0.07, 0.6, P.redWarn, false, 12).rotation.set(0, 0, 0);
  cylY(-1.84, 0.95, 1.75, 0.07, 0.6, P.redWarn, 12);
  cylY(-1.84, 1.27, 1.75, 0.03, 0.06, P.steel);
  box(-1.87, -1.81, 1.28, 1.31, 1.72, 1.78, P.steelDark);
  b.part(new THREE.TorusGeometry(0.05, 0.01, 5, 8), P.rubber, { at: [-1.84, 1.1, 1.69], rotation: [0, 90, 0] });
  box(-1.77, -1.765, 0.85, 1.05, 1.72, 1.78, P.white);
  for (const y of [0.78, 1.12]) box(-1.9, -1.78, y - 0.02, y + 0.02, 1.68, 1.82, P.steelDark);

  // conduit
  cylY(-1.9, 1.4, 1.85, 0.03, 1.8, P.pipeGrey, 8);
  for (const y of [0.7, 1.3, 1.9, 2.25]) cylY(-1.9, y, 1.85, 0.04, 0.03, P.steelDark, 8);

  // cables to ceiling at z=0.9
  for (let k = 0; k < 3; k++) {
    const z = 0.84 + k * 0.05;
    b.sweep([[-1.9, 2.05, z], [-1.88, 2.2, z], [-1.9, 2.4, z], [-1.92, 2.6, z]], 0.014, P.rubber, { sides: 6 });
  }
  for (const y of [2.15, 2.35]) box(-1.93, -1.85, y - 0.015, y + 0.015, 0.8, 1.04, P.steelDark);

  // tray rack
  box(-1.95, -1.78, 0.7, 1.0, 1.55, 1.9, P.steelDark);
  for (let i = 0; i < 4; i++) {
    const z = 1.58 + i * 0.08;
    box(-1.94, -1.8, 0.72, 0.98, z, z + 0.012, P.steel);
    box(-1.9, -1.84, 0.74, 0.9, z + 0.015, z + 0.06, P.hullGrey);
  }
  // rivets
  for (const z of [-1.18, 0.95, 1.85]) for (const y of [0.55, 1.0, 1.5, 2.0, 2.27])
    cylX(-1.915, y, z, 0.01, 0.01, P.steelDark, false, 6);
}
```