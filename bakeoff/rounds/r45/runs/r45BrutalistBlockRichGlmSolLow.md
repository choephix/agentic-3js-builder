<!-- call: plan -->

```json
{
  "name": "Rawa Flats — Brutalist Housing Block",
  "description": "A raw-concrete brutalist apartment slab on pilotis over a plaza, with stacked window grids, cantilevered front balconies and a taller stair core rising past the roof.",
  "builderName": "brutalistBlock",
  "size": [6.0, 8.7, 5.0],
  "layout": "A monumental concrete slab tower, front toward +Z. At the ground: a heavy raised plaza slab (y 0 to 0.3) covering the full footprint, with wide steps at the front and the whole first storey held on chunky pilotis columns (six front, six back) so the lobby glows recessed and glassy underneath. The main tower mass runs y 3.0 to 7.0, a deep concrete exoskeleton: four stacked storeys whose front face is a rigid grid of deep-set window openings — each window is a recessed dark glass panel sunk between chunky concrete mullions and spandrel beams, so the facade reads as coffered raw concrete, not paint. Cantilevered balcony slabs project off the front face (+Z) at each storey line, each with a solid concrete upstand divider wall every bay and a thin metal railing on top; the balcony undersides show raw slab soffits with visible slab edges. At the back (-Z) a service/stair core box rises from first-floor level right through the roof and one full storey above it (to y 8.7), clad in darker board-marked concrete with a vertical strip of narrow slit windows, vents and a canopy door; it carries the rooftop gear on the roof deck: water tank on legs, vent stacks, an antenna mast, and a parapet lip around the roof edge. The style shows everywhere: flat raw concrete in three weathering tones (lighter on up-facing and sunlit faces, darker and mossy low down and in shadow), deep geometric shadow gaps between slabs, banded stains under every balcony edge, small parts in their own colours for glass, railings, doors, vents and drainpipes. Nothing is smooth; edges are chunky, openings are deep, the whole thing reads as poured concrete.",
  "palette": {
    "concreteLight": "#a9a59c",
    "concreteMid": "#8f8b82",
    "concreteDark": "#6f6b63",
    "concreteShadow": "#514e47",
    "stainBand": "#5a564e",
    "moss": "#5c6b47",
    "glass": "#33424e",
    "glassLit": "#7fa0a8",
    "metalDark": "#3a3d40",
    "railing": "#2e3134",
    "rustDoor": "#8a4432",
    "ventGrey": "#565a52",
    "plazaGround": "#59554d",
    "whitePaint": "#d8d4c8"
  },
  "mounts": {
    "plazaTop": [0, 0.3, 0],
    "firstFloorLevel": [0, 3.0, 0],
    "roofDeck": [0, 7.0, 0],
    "backCoreLine": [0, 3.0, -1.8]
  },
  "joints": [],
  "parts": [
    {
      "id": "plazaAndPilotis",
      "builds": "The ground level. A heavy plaza slab (x -3.0..3.0, z -2.5..2.5, y 0..0.3) in plazaGround concrete with a lighter concreteLight top border kerb and a shallow ramp of wide steps at the front edge (z about 2.5..2.9, three chunky steps down to y 0). Above it, the pilotis: ten to twelve solid rectangular concrete columns (roughly 0.45 x 0.45 m) from plaza top y 0.3 up to the first-floor soffit at y 3.0, in two rows (front row near z 1.9, back row near z -1.9, plus mid-row at z 0), concreteMid at the bottom with darker stainBand on the lower third where rain ran down. Between the columns sits the recessed lobby: a glassy box (glass panels with a few glassLit lit panes) set back between columns, with two heavy rustDoor entry doors, a whitePaint lobby sign strip above them, a concreteDark ground-floor ceiling soffit slab capping it all at y 2.7..3.0, and a couple of round ceiling lamps. A thin dark drainpipe drops at one front corner column. Lowest points are the plaza slab and steps at y 0.",
      "box": [[-3.0, 0.0, -2.5], [3.0, 3.0, 2.9]],
      "attaches": "Columns land on the plaza slab (its own top, plazaTop); the soffit slab at y 3.0 meets the tower shell exactly at firstFloorLevel; column positions leave the tower footprint x -2.4..2.4 clear.",
      "joints": [],
      "floor": true,
      "budget": 200
    },
    {
      "id": "towerShell",
      "builds": "The main concrete mass, the hero of the model. A slab block x -2.4..2.4, y 3.0..7.0, z -1.8..1.8, built as an exposed concrete exoskeleton rather than a plain box: four stacked storeys, each with a thick front and back band of vertical concrete mullions (about 7 bays across the front) and horizontal spandrel beams at every floor line, so the window openings between them are truly recessed. Each window opening gets a dark glass panel (glass) seated deep inside the reveal, with two or three panes per storey glowing glassLit, plus a thin whitePaint or concreteDark sill. The concrete faces use all four tones: concreteLight on sunlit top edges and upstands, concreteMid on main faces, concreteDark in the deep window reveals and under-beam shadow, stainBand as weathering streaks below window corners. End walls (left x 2.4 and right x -2.4) are mostly blind concrete with a few small punched slit windows in glass and a vertical drainpipe each, concreteDark. The back face (z -1.8) is plainer raw concreteMid with a regular grid of small dark windows. Top of the mass at y 7.0 meets the roofDeck; leave a slot at the back x -1.3..1.3, z -1.8..-0.9 clear where the service core passes through.",
      "box": [[-2.4, 3.0, -1.8], [2.4, 7.0, 1.8]],
      "attaches": "Sits on the pilotis soffit exactly at firstFloorLevel (mount); roof at y 7.0 is the roofDeck mount; back slot is shared with the core at backCoreLine; front face at z 1.8 is where balconies bolt on.",
      "joints": [],
      "floor": false,
      "budget": 260
    },
    {
      "id": "balconies",
      "builds": "The cantilevered front balconies, the signature silhouette. Four balcony slabs, one per storey, projecting from the front face z 1.8 out to z 2.55, each spanning x -2.3..2.3, about 0.18 m thick, in concreteLight (sun catches the slab tops and fascia edges). Each slab shows its raw underside soffit in concreteDark with a banded stainBand weathering streak running along the outer fascia below every edge. On each balcony: solid concrete upstand divider walls (about 1.0 m high, 0.12 thick, one between each of the ~6 bays, splitting it into apartments) in concreteMid with lighter tops, and on top of the slab edge away from the dividers a thin metalDark railing of simple vertical bars with a rustDoor handrail. A few balcony floors get small details: a moss-green planter box, a whitePaint drying-rack or a dark door frame recessed into the facade glass line. The lowest balcony at y 3.0 overlaps the plaza below, so its edge casts the deep shadow gap the style needs. Nothing touches the floor; everything is carried on the towerShell front face.",
      "box": [[-2.45, 3.0, 1.6], [2.45, 7.0, 2.55]],
      "attaches": "Slabs root into the towerShell front face at z 1.8 at each storey line (y 3.0, 4.0, 5.0, 6.0); outer edges hang free above the plazaAndPilotis steps.",
      "joints": [],
      "floor": false,
      "budget": 180
    },
    {
      "id": "serviceCore",
      "builds": "The stair/service core that punches above the roofline. A tall box x -1.3..1.3, z -1.9..-0.9, running from first-floor level y 3.0 up to y 8.7, one full storey above the main roof at 7.0. Clad in the darkest concrete (concreteDark) with board-marked banding (thin horizontal concreteShadow ribs every ~0.5 m) so it reads as a different, harder pour than the tower. Its back and side faces carry a vertical strip of narrow slit windows in glass, one pane lit glassLit near the top. At first-floor level on its side face: a rustDoor service door with a small concreteDark canopy slab over it. Above the main roof it becomes the penthouse housing the lift machine room: a heavier cap slab, two or three large vent louvre openings (ventGrey slats) on each face, a small whitePaint painted sign panel, and a thin parapet upstand. Its very top edge is capped in concreteLight. Protruding stub pipes in metalDark where it meets the roof deck. The core spans continuously from firstFloorLevel through roofDeck to its cap.",
      "box": [[-1.3, 3.0, -2.0], [1.3, 8.7, -0.85]],
      "attaches": "Rises through the towerShell back slot (its walls are the slot walls) resting at firstFloorLevel, passes through the roofDeck plane at y 7.0, and stands free above it.",
      "joints": [],
      "floor": false,
      "budget": 170
    },
    {
      "id": "rooftopGear",
      "builds": "Everything on the roof deck at y 7.0, kept simpler than the facade. A parapet lip (0.25 m high, 0.15 thick) in concreteMid running around the tower roof edge x -2.4..2.4, z -1.8..1.8, skipping the core slot at the back. Inside: a rooftop water tank on four short legs in the left-front quadrant — a squat cylinder in concreteMid with a concreteDark coned top, a metalDark access ladder and a small vent cap; two or three squat vent stacks (ventGrey cylinders with metalDark caps) scattered on the right side; a slim antenna mast (metalDark rod about 1.6 m with two crossbars and a small glassLit red lamp at the tip) near the back right; a skylight box (glass with whitePaint frame) mid-roof; and patches of moss where the roof membrane has cracked, plus a stainBand drip trail running over the parapet on one side. A short metalDark stair-bulkhead door leans against the core wall. All resting on the roofDeck plane; nothing hangs off the model edge except the antenna tip, well inside the bounding box.",
      "box": [[-2.4, 7.0, -1.8], [2.4, 8.3, 1.8]],
      "attaches": "Everything stands on the towerShell roof plane (roofDeck mount, y 7.0) and clears the serviceCore box; the parapet sits on the tower's outer edge line.",
      "joints": [],
      "floor": false,
      "budget": 90
    }
  ]
}
```

<!-- call: plazaAndPilotis -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildPlazaAndPilotis({ b, J, P, M }: Ctx) {
  const G = P.plazaGround;
  const L = P.concreteLight;
  const C = P.concreteMid;
  const D = P.concreteDark;
  const S = P.stainBand;
  const GL = P.glass;
  const GLL = P.glassLit;
  const MD = P.metalDark;
  const RD = P.rustDoor;
  const W = P.whitePaint;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone: J.body,
      name: name ?? "plaza.box",
      flat: true,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name?: string,
    radial = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      bone: J.body,
      name: name ?? "plaza.cylinder",
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) => b.rod(a, c, radius, color, { bone: J.body, name: name ?? "plaza.rod" });

  // Monumental raised plaza slab, with a deliberately heavy lower shadow band.
  box([6, 0.3, 5], [0, 0.15, 0], G, "plaza.slab");
  box([5.82, 0.055, 4.82], [0, 0.327, 0], L, "plaza.topKerb");
  box([6.04, 0.055, 0.12], [0, 0.325, -2.43], S, "plaza.backShadow");
  box([6.04, 0.055, 0.12], [0, 0.325, 2.43], L, "plaza.frontKerb");
  box([0.12, 0.055, 4.75], [-2.94, 0.325, 0], L, "plaza.leftKerb");
  box([0.12, 0.055, 4.75], [2.94, 0.325, 0], L, "plaza.rightKerb");

  // Three broad, low steps descending toward the front (+Z).
  box([5.8, 0.10, 0.18], [0, 0.25, 2.57], C, "steps.upper");
  box([5.8, 0.10, 0.18], [0, 0.15, 2.75], C, "steps.middle");
  box([5.8, 0.10, 0.18], [0, 0.05, 2.91], L, "steps.lower");
  box([5.95, 0.035, 0.08], [0, 0.312, 2.52], L, "steps.upperEdge");
  box([5.95, 0.035, 0.08], [0, 0.212, 2.70], L, "steps.middleEdge");
  box([5.95, 0.035, 0.08], [0, 0.112, 2.86], L, "steps.lowerEdge");

  // Twelve pilotis: six on the front and six at the rear.
  // The outer pair sits outside the tower shell, making the raised slab visibly supported.
  const xs = [-2.62, -1.58, -0.52, 0.52, 1.58, 2.62];
  for (const z of [1.92, -1.92]) {
    for (let i = 0; i < xs.length; i++) {
      const x = xs[i];
      const tag = z > 0 ? "front" : "back";
      box([0.46, 0.72, 0.46], [x, 0.66, z], S, `piloti.${tag}.${i}.stain`);
      box([0.46, 1.98, 0.46], [x, 1.98, z], C, `piloti.${tag}.${i}.shaft`);
      box([0.56, 0.12, 0.56], [x, 2.985, z], L, `piloti.${tag}.${i}.capital`);
      box([0.50, 0.035, 0.50], [x, 0.315, z], D, `piloti.${tag}.${i}.footShadow`);
    }
  }

  // Recessed lobby glazing, kept behind the front pilotis.
  box([4.92, 2.16, 0.08], [0, 1.43, 1.69], GL, "lobby.glassWall");
  box([1.18, 1.52, 0.045], [-1.82, 1.52, 1.744], GLL, "lobby.litPaneL");
  box([1.08, 1.52, 0.045], [0.02, 1.52, 1.744], GLL, "lobby.litPaneC");
  box([1.18, 1.52, 0.045], [1.82, 1.52, 1.744], GL, "lobby.darkPaneR");

  // Concrete mullions over the glass give the entry a deep, coffered rhythm.
  for (const x of [-2.35, -1.18, 0, 1.18, 2.35]) {
    box([0.11, 2.28, 0.16], [x, 1.43, 1.79], C, "lobby.mullion");
  }
  for (const y of [0.34, 2.50]) {
    box([4.92, 0.13, 0.18], [0, y, 1.80], D, "lobby.glassReveal");
  }

  // Pair of emphatic entry doors, recessed into the glowing lobby.
  box([0.78, 1.72, 0.075], [-0.48, 1.18, 1.785], RD, "lobby.doorL");
  box([0.78, 1.72, 0.075], [0.48, 1.18, 1.785], RD, "lobby.doorR");
  box([0.035, 1.54, 0.09], [-0.04, 1.18, 1.838], MD, "lobby.doorSeam");
  for (const x of [-0.70, -0.26, 0.26, 0.70]) {
    cyl(0.025, 0.055, [x, 1.18, 1.845], W, "lobby.doorHandle", 8);
  }

  // Sign fascia and small graphic-like inset blocks above the doors.
  box([1.72, 0.22, 0.10], [0, 2.26, 1.86], W, "lobby.sign");
  box([0.18, 0.035, 0.02], [-0.57, 2.27, 1.918], MD, "sign.mark1");
  box([0.11, 0.035, 0.02], [-0.28, 2.27, 1.918], MD, "sign.mark2");
  box([0.28, 0.035, 0.02], [0.17, 2.27, 1.918], MD, "sign.mark3");
  box([0.12, 0.035, 0.02], [0.52, 2.27, 1.918], MD, "sign.mark4");

  // Thick ground-floor soffit, shadow gap, and a few round recessed lamps.
  box([5.15, 0.30, 3.72], [0, 2.85, 0], D, "lobby.soffit");
  box([5.18, 0.045, 3.76], [0, 2.695, 0], S, "lobby.soffitShadow");
  for (const x of [-1.55, 1.55]) {
    cyl(0.105, 0.025, [x, 2.675, 0.55], MD, "soffit.lampTrim", 12);
    cyl(0.060, 0.028, [x, 2.653, 0.55], GLL, "soffit.lamp", 12);
  }
  cyl(0.105, 0.025, [0, 2.675, -0.62], MD, "soffit.lampTrim", 12);
  cyl(0.060, 0.028, [0, 2.653, -0.62], GLL, "soffit.lamp", 12);

  // Side returns and low lobby plinths make the recess read as architectural depth.
  box([0.22, 2.30, 0.42], [-2.58, 1.48, 1.72], D, "lobby.leftReturn");
  box([0.22, 2.30, 0.42], [2.58, 1.48, 1.72], D, "lobby.rightReturn");
  box([4.86, 0.14, 0.38], [0, 0.40, 1.73], D, "lobby.plinth");
  box([1.05, 0.06, 0.44], [-1.55, 0.51, 1.78], G, "lobby.matL");
  box([1.05, 0.06, 0.44], [1.55, 0.51, 1.78], G, "lobby.matR");

  // Thin rainwater pipe at the left front piloti, with collars and a splash shoe.
  rod([-2.83, 2.92, 2.12], [-2.83, 0.34, 2.12], 0.028, MD, "drainpipe.main");
  for (const y of [2.55, 1.72, 0.88]) {
    cyl(0.045, 0.045, [-2.83, y, 2.12], MD, "drainpipe.collar", 8);
  }
  box([0.16, 0.07, 0.22], [-2.83, 0.37, 2.12], S, "drainpipe.splash");

  // A few isolated construction joints and dark bolt-like marks on the front supports.
  for (const x of [-2.62, -1.58, -0.52, 0.52, 1.58, 2.62]) {
    box([0.025, 1.55, 0.012], [x - 0.18, 1.45, 2.158], D, "piloti.formworkJoint");
    cyl(0.018, 0.018, [x + 0.14, 1.12, 2.165], MD, "piloti.tieMark", 6);
  }
}
```

<!-- call: balconies -->

```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export function buildBalconies({ b, J, P, M }: Ctx) {
  const CL = P.concreteLight;
  const CM = P.concreteMid;
  const CD = P.concreteDark;
  const ST = P.stainBand;
  const MTL = P.metalDark ?? P.railing;
  const RUST = P.rustDoor;
  const MOSS = P.moss;
  const WHITE = P.whitePaint;
  const GLASS = P.glass;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name?: string,
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      flat: true,
    });
  };

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name?: string,
    sides = 8,
  ) => {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, sides), color, {
      at,
      name,
      flat: true,
    });
  };

  const levels = [3, 4, 5, 6];
  const bays = [-1.92, -1.28, -0.64, 0, 0.64, 1.28, 1.92];

  for (let floor = 0; floor < levels.length; floor++) {
    const y = levels[floor];

    // Cantilevered slab: a dark soffit recessed beneath the lighter structural plate.
    box([4.6, 0.18, 0.76], [0, y + 0.09, 2.17], CL, `balconiesSlab${floor}`);
    box([4.62, 0.045, 0.73], [0, y - 0.012, 2.18], CD, `balconiesSoffit${floor}`);

    // Chunky outer fascia and the continuous rain-stain band below it.
    box([4.68, 0.23, 0.12], [0, y + 0.115, 2.53], CM, `balconiesFascia${floor}`);
    box([4.60, 0.055, 0.045], [0, y - 0.135, 2.525], ST, `balconiesStain${floor}`);

    // Short vertical weathering marks make the fascia read as poured and rain-washed.
    for (const x of [-2.12, -1.42, -0.71, 0.03, 0.76, 1.47, 2.12]) {
      box([0.025, 0.13, 0.012], [x, y - 0.215, 2.588], ST, `balconiesDrip${floor}`);
    }

    // Dividing walls between the six apartments. They are solid, not painted window mullions.
    for (let i = 0; i < bays.length - 1; i++) {
      const x = (bays[i] + bays[i + 1]) * 0.5;
      box([0.12, 0.86, 0.48], [x, y + 0.59, 2.28], CM, `balconiesDivider${floor}_${i}`);
      box([0.14, 0.045, 0.50], [x, y + 1.035, 2.28], CL, `balconiesDividerCap${floor}_${i}`);
      box([0.025, 0.72, 0.025], [x, y + 0.56, 2.535], CD, `balconiesDividerShadow${floor}_${i}`);
    }

    // Thin railing set behind the solid fascia, with deliberately oversized blocky posts.
    const railY = y + 0.40;
    box([4.34, 0.045, 0.045], [0, railY + 0.34, 2.485], MTL, `balconiesRailTop${floor}`);
    box([4.34, 0.035, 0.035], [0, railY + 0.08, 2.485], MTL, `balconiesRailMid${floor}`);
    for (let i = 0; i <= 12; i++) {
      const x = -2.16 + i * 0.36;
      box([0.035, 0.68, 0.035], [x, railY + 0.08, 2.485], MTL, `balconiesRailBar${floor}_${i}`);
    }
    box([4.40, 0.055, 0.055], [0, railY + 0.405, 2.485], RUST, `balconiesHandrail${floor}`);

    // Heavy end returns visually anchor the railings to the concrete.
    for (const x of [-2.25, 2.25]) {
      box([0.10, 0.78, 0.10], [x, y + 0.48, 2.49], CM, `balconiesEndReturn${floor}`);
      box([0.12, 0.045, 0.12], [x, y + 0.885, 2.49], CL, `balconiesEndCap${floor}`);
    }

    // Recessed dark thresholds/door frames at the facade line, visible between dividers.
    for (const x of [-1.60, -0.52, 0.56, 1.64]) {
      box([0.38, 0.68, 0.035], [x, y + 0.42, 1.825], GLASS, `balconiesDoorGlass${floor}`);
      box([0.43, 0.045, 0.06], [x, y + 0.765, 1.805], CD, `balconiesDoorHeader${floor}`);
      box([0.045, 0.72, 0.06], [x - 0.215, y + 0.41, 1.805], CD, `balconiesDoorJamb${floor}`);
      box([0.045, 0.72, 0.06], [x + 0.215, y + 0.41, 1.805], CD, `balconiesDoorJamb${floor}`);
      box([0.035, 0.035, 0.025], [x + 0.12, y + 0.40, 1.855], RUST, `balconiesDoorHandle${floor}`);
    }

    // Individual balcony objects: planters, drying frames, and small maintenance trays.
    if (floor === 0 || floor === 2) {
      const px = floor === 0 ? -1.65 : 1.55;
      box([0.48, 0.22, 0.24], [px, y + 0.235, 2.16], MOSS, `balconiesPlanter${floor}`);
      box([0.54, 0.035, 0.28], [px, y + 0.36, 2.16], CM, `balconiesPlanterLip${floor}`);
      for (let k = -1; k <= 1; k++) {
        cyl(0.018, 0.18, [px + k * 0.12, y + 0.48, 2.16], MOSS, `balconiesPlant${floor}_${k}`, 6);
      }
    }

    if (floor === 1) {
      box([0.72, 0.035, 0.035], [-1.02, y + 0.30, 2.38], WHITE, `balconiesDryRail${floor}`);
      for (let k = 0; k < 5; k++) {
        box([0.025, 0.30, 0.025], [-1.35 + k * 0.16, y + 0.15, 2.38], WHITE, `balconiesDryBar${floor}_${k}`);
      }
      box([0.78, 0.04, 0.04], [-1.02, y + 0.05, 2.38], WHITE, `balconiesDryBase${floor}`);
    }

    if (floor === 3) {
      box([0.32, 0.08, 0.22], [1.55, y + 0.24, 2.20], CD, `balconiesUtilityTray${floor}`);
      cyl(0.025, 0.34, [1.55, y + 0.46, 2.20], MTL, `balconiesUtilityPipe${floor}`, 6);
      box([0.18, 0.025, 0.025], [1.55, y + 0.64, 2.20], MTL, `balconiesUtilityBracket${floor}`);
    }
  }

  // Small exposed fixing plates under the outer balcony noses: an architectural seam detail.
  for (const y of levels) {
    for (const x of [-2.05, -1.02, 0, 1.02, 2.05]) {
      box([0.16, 0.035, 0.035], [x, y - 0.17, 2.52], MTL, `balconiesFixingPlate`);
    }
  }

  // Two narrow downpipes at the balcony ends, broken by each slab edge like a real facade drain.
  for (const x of [-2.34, 2.34]) {
    for (let i = 0; i < 4; i++) {
      cyl(0.026, 0.82, [x, levels[i] + 0.49, 2.535], MTL, `balconiesDrain${x}_${i}`, 8);
      cyl(0.042, 0.035, [x, levels[i] + 0.08, 2.535], MTL, `balconiesDrainCollar${x}_${i}`, 8);
    }
  }
}
```

<!-- call: serviceCore -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildServiceCore({ b, J, P, M }: Ctx) {
  const body = J.body;
  const C = P.concreteDark;
  const CS = P.concreteShadow;
  const CL = P.concreteLight;
  const GLASS = P.glass;
  const LIT = P.glassLit;
  const DOOR = P.rustDoor;
  const VENT = P.ventGrey;
  const METAL = P.metalDark;
  const WHITE = P.whitePaint;
  const moss = "#5c6b47";
  const black = "#272a2b";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
    opts: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone: body,
      at,
      name,
      ...opts,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name: string,
    segments = 10,
    dir: [number, number, number] = [0, 1, 0],
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, height, segments, 1, false),
      color,
      { bone: body, at, dir, name },
    );

  const slab = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
  ) => box(size, at, color, name);

  // Main continuous stair/service shaft. The inset upper penthouse is deliberately
  // expressed as a second mass, giving the roofline a strong stepped silhouette.
  box([2.6, 3.92, 1.15], [0, 4.96, -1.425], C, "serviceCore.shaft");
  box([2.6, 1.62, 1.15], [0, 7.78, -1.425], C, "serviceCore.penthouse");

  // Hard horizontal board-form ribs, slightly proud of all four elevations.
  for (let i = 0; i < 11; i++) {
    const y = 3.24 + i * 0.5;
    box([2.68, 0.055, 1.21], [0, y, -1.425], CS, `serviceCore.boardRib${i}`);
  }

  // Vertical pour seams on the broad rear wall.
  for (let i = -2; i <= 2; i++) {
    box([0.025, 3.7, 0.018], [i * 0.48, 5.02, -2.011], CS, `serviceCore.rearSeam${i + 2}`);
  }

  // Narrow slit windows on the rear elevation, arranged as a severe vertical stair
  // strip. One upper pane is visibly lit.
  const rearYs = [3.55, 4.15, 4.75, 5.35, 5.95, 6.55, 7.32, 7.82, 8.28];
  rearYs.forEach((y, i) => {
    const lit = i === rearYs.length - 2;
    box([0.34, 0.28, 0.018], [0.62, y, -2.025], lit ? LIT : GLASS, `serviceCore.rearSlit${i}`);
    box([0.39, 0.035, 0.025], [0.62, y - 0.17, -2.038], CS, `serviceCore.rearSill${i}`);
  });

  // A second, offset strip wraps the left flank.
  const sideYs = [3.7, 4.3, 4.9, 5.5, 6.1, 6.7, 7.38, 7.92];
  sideYs.forEach((y, i) => {
    box([0.018, 0.29, 0.42], [-1.315, y, -1.42], i === 6 ? LIT : GLASS, `serviceCore.leftSlit${i}`);
  });

  // Tiny right-side ventilation slots above the roof, with deep reveal surrounds.
  for (let i = 0; i < 3; i++) {
    const y = 7.42 + i * 0.36;
    box([0.018, 0.2, 0.48], [1.315, y, -1.43], GLASS, `serviceCore.rightSlit${i}`);
    box([0.035, 0.24, 0.54], [1.33, y, -1.43], CS, `serviceCore.rightReveal${i}`);
    box([0.018, 0.2, 0.48], [1.352, y, -1.43], GLASS, `serviceCore.rightGlass${i}`);
  }

  // Recessed service door at first-floor level on the exposed left side.
  box([0.022, 1.22, 0.72], [-1.326, 3.78, -1.42], black, "serviceCore.doorReveal");
  box([0.028, 0.94, 0.54], [-1.347, 3.78, -1.42], DOOR, "serviceCore.serviceDoor");
  box([0.035, 0.07, 0.07], [-1.375, 3.82, -1.12], METAL, "serviceCore.doorHandle");
  box([0.22, 0.08, 0.78], [-1.39, 4.45, -1.42], C, "serviceCore.doorCanopy");

  // Door lintel, jamb blocks and a small painted warning/sign plate.
  box([0.18, 0.16, 0.78], [-1.4, 4.42, -1.42], CS, "serviceCore.doorLintel");
  box([0.18, 1.25, 0.11], [-1.4, 3.78, -1.82], CS, "serviceCore.doorJambFront");
  box([0.46, 0.28, 0.018], [-1.405, 8.05, -0.84], WHITE, "serviceCore.signPanel");
  box([0.26, 0.035, 0.022], [-1.405, 8.05, -0.855], METAL, "serviceCore.signMark");

  // Penthouse cap: broad shadow gap, heavy top slab, and a lighter weathered crown.
  slab([2.82, 0.18, 1.35], [0, 8.58, -1.425], CS, "serviceCore.capShadow");
  slab([2.9, 0.16, 1.42], [0, 8.69, -1.425], CL, "serviceCore.capLight");
  slab([2.76, 0.08, 1.32], [0, 8.805, -1.425], C, "serviceCore.capTop");

  // Thin parapet-like upstands around the penthouse roof.
  box([2.82, 0.27, 0.12], [0, 8.88, -0.91], C, "serviceCore.parapetFront");
  box([2.82, 0.27, 0.12], [0, 8.88, -1.94], C, "serviceCore.parapetBack");
  box([0.12, 0.27, 0.92], [-1.35, 8.88, -1.425], C, "serviceCore.parapetLeft");
  box([0.12, 0.27, 0.92], [1.35, 8.88, -1.425], C, "serviceCore.parapetRight");

  // Large penthouse louvre fields on the front-facing side.
  for (let i = 0; i < 3; i++) {
    const x = -0.72 + i * 0.72;
    box([0.48, 0.5, 0.028], [x, 7.85, -0.833], black, `serviceCore.frontLouvreVoid${i}`);
    for (let j = 0; j < 5; j++) {
      box([0.5, 0.035, 0.055], [x, 7.64 + j * 0.105, -0.857], VENT, `serviceCore.frontLouvre${i}_${j}`);
    }
  }

  // Matching louvre bank on the rear, partially visible over the roof.
  for (let i = 0; i < 2; i++) {
    const x = -0.58 + i * 0.78;
    box([0.5, 0.42, 0.025], [x, 7.85, -2.018], black, `serviceCore.backLouvreVoid${i}`);
    for (let j = 0; j < 4; j++) {
      box([0.52, 0.035, 0.045], [x, 7.68 + j * 0.105, -2.04], VENT, `serviceCore.backLouvre${i}_${j}`);
    }
  }

  // Roof-deck pipe stubs, with collars and shadow plates.
  for (let i = -1; i <= 1; i += 2) {
    const x = i * 0.96;
    cyl(0.07, 0.28, [x, 7.12, -0.98], METAL, `serviceCore.pipeStub${i}`, 8);
    cyl(0.09, 0.035, [x, 7.25, -0.98], CS, `serviceCore.pipeCollar${i}`, 8);
  }
  cyl(0.045, 0.5, [1.06, 7.3, -1.83], METAL, "serviceCore.riserPipe", 8);
  box([0.12, 0.06, 0.12], [1.06, 7.08, -1.83], CS, "serviceCore.riserFoot");

  // Downpipe at the exposed corner, broken by deliberately chunky collars.
  const px = 1.25;
  const pz = -0.88;
  cyl(0.035, 3.2, [px, 4.65, pz], METAL, "serviceCore.downpipe", 8);
  for (let i = 0; i < 6; i++)
    cyl(0.055, 0.045, [px, 3.15 + i * 0.55, pz], CS, `serviceCore.pipeClamp${i}`, 8);

  // Mossy low ledges and a few rough stain blocks, kept as separate geometry so
  // the weathering reads as construction detail rather than a texture.
  box([0.38, 0.025, 0.16], [-0.86, 3.06, -0.79], moss, "serviceCore.mossLedgeA");
  box([0.22, 0.025, 0.13], [0.98, 3.06, -0.79], moss, "serviceCore.mossLedgeB");
  for (let i = 0; i < 5; i++) {
    const x = -1.02 + i * 0.48;
    box([0.06, 0.42 + (i % 2) * 0.18, 0.018], [x, 3.35, -2.026], CS, `serviceCore.stain${i}`);
  }

  // Short metal access ladder leaning visually against the penthouse face.
  for (let i = 0; i < 5; i++) {
    const y = 7.12 + i * 0.27;
    box([0.05, 0.035, 0.54], [0.78, y, -0.79], METAL, `serviceCore.ladderStep${i}`);
  }
  cyl(0.025, 1.35, [0.55, 7.65, -0.79], METAL, "serviceCore.ladderRailL", 8, [0, 1, 0]);
  cyl(0.025, 1.35, [1.01, 7.65, -0.79], METAL, "serviceCore.ladderRailR", 8, [0, 1, 0]);
}
```

<!-- call: towerShell -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTowerShell({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const C = P.concreteLight;
  const CM = P.concreteMid;
  const CD = P.concreteDark;
  const CS = P.concreteShadow;
  const STAIN = P.stainBand;
  const GLASS = P.glass;
  const GLOW = P.glassLit;
  const WHITE = P.whitePaint;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      name,
      group: "towerShell",
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name: string,
    segments = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      bone,
      name,
      group: "towerShell",
    });

  // Main structural end walls. The front is intentionally left open between its
  // concrete ribs so the facade reads as a genuinely deep exoskeleton.
  box([0.28, 4.0, 3.6], [-2.26, 5.0, 0], CM, "endWallL");
  box([0.28, 4.0, 3.6], [2.26, 5.0, 0], CM, "endWallR");

  // Rear wall is segmented around the service-core penetration. This leaves the
  // back slot open from x=-1.3..1.3 and z=-1.8..-0.9.
  box([1.1, 4.0, 0.22], [-1.85, 5.0, -1.69], CM, "rearWallL");
  box([1.1, 4.0, 0.22], [1.85, 5.0, -1.69], CM, "rearWallR");
  box([0.85, 4.0, 0.22], [-0.42, 5.0, -1.69], CM, "rearWallSlotL");
  box([0.85, 4.0, 0.22], [0.42, 5.0, -1.69], CM, "rearWallSlotR");

  // Heavy corner piers and continuous front/rear floor bands.
  for (const x of [-2.08, 2.08]) {
    box([0.36, 4.0, 0.42], [x, 5.0, 1.61], CD, `frontCorner${x < 0 ? "L" : "R"}`);
    box([0.36, 4.0, 0.42], [x, 5.0, -1.61], CD, `backCorner${x < 0 ? "L" : "R"}`);
  }

  const floorYs = [3.0, 4.0, 5.0, 6.0, 7.0];
  for (let i = 0; i < floorYs.length; i++) {
    const y = floorYs[i];
    box([4.15, 0.22, 0.46], [0, y, 1.62], i === 4 ? C : CM, `frontSpandrel${i}`);
    box([4.15, 0.22, 0.34], [0, y, -1.62], CD, `backSpandrel${i}`);

    // A narrow shadow joint below every front spandrel.
    if (i > 0) {
      box([4.02, 0.055, 0.025], [0, y - 0.145, 1.855], CS, `frontShadowGap${i}`);
      box([4.0, 0.045, 0.025], [0, y - 0.15, -1.855], CS, `rearShadowGap${i}`);
    }
  }

  // Seven deeply recessed front window bays per storey.
  const bayX = [-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8];
  const floorCenters = [3.5, 4.5, 5.5, 6.5];

  for (let row = 0; row < 4; row++) {
    const y = floorCenters[row];

    for (let col = 0; col < bayX.length; col++) {
      const x = bayX[col];

      // Dark reveal cavity behind the frame.
      box([0.49, 0.68, 0.12], [x, y, 1.43], CD, `reveal_${row}_${col}`);

      // Three narrow panes make the facade feel occupied rather than a blank grid.
      const paneW = 0.135;
      for (let p = 0; p < 3; p++) {
        const px = x + (p - 1) * 0.155;
        const lit = (row + col * 2 + p) % 7 === 0 || (row === 3 && p === 1);
        box(
          [paneW, 0.54, 0.018],
          [px, y + 0.005, 1.355],
          lit ? GLOW : GLASS,
          `glass_${row}_${col}_${p}`,
        );
      }

      // Vertical reveal cheeks and lintel, visibly proud of the glass.
      box([0.065, 0.78, 0.28], [x - 0.285, y, 1.57], CD, `revealLeft_${row}_${col}`);
      box([0.065, 0.78, 0.28], [x + 0.285, y, 1.57], CD, `revealRight_${row}_${col}`);
      box([0.62, 0.075, 0.30], [x, y + 0.385, 1.57], CD, `lintel_${row}_${col}`);

      // Pale sill catches the light at the bottom of every opening.
      box([0.56, 0.055, 0.32], [x, y - 0.37, 1.60], WHITE, `sill_${row}_${col}`);

      // Occasional vertical rain stains under the sill corners.
      if ((row + col) % 3 === 0) {
        box([0.028, 0.17 + 0.04 * ((row + col) % 2), 0.018], [
          x - 0.22,
          y - 0.49,
          1.748,
        ], STAIN, `stain_${row}_${col}`);
      }
    }

    // Chunky mullions separate each apartment bay.
    for (let i = 0; i < 8; i++) {
      const x = -2.1 + i * 0.6;
      box([0.13, 0.78, 0.38], [x, y, 1.70], CM, `mullion_${row}_${i}`);
      box([0.13, 0.78, 0.035], [x, y - 0.43, 1.90], STAIN, `mullionShadow_${row}_${i}`);
    }
  }

  // Roofline coping and a contrasting sunlit top edge.
  box([4.75, 0.16, 0.20], [0, 7.02, 1.72], C, "roofFrontCoping");
  box([4.75, 0.16, 0.20], [0, 7.02, -1.72], C, "roofRearCoping");
  box([0.20, 0.16, 3.25], [-2.28, 7.02, 0], C, "roofCopingL");
  box([0.20, 0.16, 3.25], [2.28, 7.02, 0], C, "roofCopingR");

  // Mostly blind side walls: small punched slit windows in irregular but
  // disciplined vertical stacks.
  for (const s of [-1, 1]) {
    const x = s * 2.415;
    for (let i = 0; i < 4; i++) {
      const y = 3.52 + i * 0.88;
      box([0.025, 0.18, 0.44], [x, y, 0.48], GLASS, `sideSlit_${s}_${i}_a`);
      box([0.025, 0.18, 0.44], [x, y, -0.72], GLASS, `sideSlit_${s}_${i}_b`);

      // Thin concrete eyebrow above each side slit.
      box([0.08, 0.045, 0.52], [s * 2.43, y + 0.13, 0.48], CD, `sideLintel_${s}_${i}_a`);
      box([0.08, 0.045, 0.52], [s * 2.43, y + 0.13, -0.72], CD, `sideLintel_${s}_${i}_b`);
    }

    // Vertical rainwater pipe on each blind end wall.
    cyl(0.035, 3.65, [s * 2.46, 4.87, 1.28], STAIN, `endDrain_${s}`, 8);
    box([0.09, 0.08, 0.12], [s * 2.44, 3.16, 1.28], CS, `drainFoot_${s}`);
    box([0.09, 0.08, 0.12], [s * 2.44, 6.62, 1.28], CS, `drainHead_${s}`);
  }

  // Plain rear facade windows, kept smaller and darker than the front grid.
  const rearRows = [3.48, 4.48, 5.48, 6.48];
  const rearCols = [-1.85, -1.35, 1.35, 1.85];
  for (let r = 0; r < rearRows.length; r++) {
    for (let c = 0; c < rearCols.length; c++) {
      const x = rearCols[c];
      const y = rearRows[r];
      box([0.26, 0.30, 0.025], [x, y, -1.815], GLASS, `rearWindow_${r}_${c}`);
      box([0.31, 0.045, 0.10], [x, y + 0.18, -1.84], CD, `rearLintel_${r}_${c}`);
      box([0.31, 0.04, 0.10], [x, y - 0.18, -1.84], CS, `rearSill_${r}_${c}`);
    }
  }

  // A few deliberately oversized poured-concrete patch plates add the raw,
  // formwork-built character without becoming decorative cladding.
  box([0.72, 0.035, 0.018], [-1.42, 5.18, 1.87], C, "patchFrontA");
  box([0.46, 0.035, 0.018], [1.48, 4.17, 1.87], C, "patchFrontB");
  box([0.58, 0.035, 0.018], [-1.78, 6.27, -1.84], CD, "patchRearA");
}
```

<!-- call: rooftopGear -->

```ts
import * as THREE from "three";
import { frame } from "agentic-3js-builder";

export function buildRooftopGear({ b, J, P, M }: Ctx) {
  const y0 = M.roofDeck[1];
  const C = P.concreteMid;
  const CL = P.concreteLight;
  const CD = P.concreteDark;
  const CS = P.concreteShadow;
  const STAIN = P.stainBand;
  const MOSS = P.moss;
  const GLASS = P.glass;
  const GLASS_LIT = P.glassLit;
  const METAL = P.metalDark;
  const VENT = P.ventGrey;
  const WHITE = P.whitePaint;
  const RED = "#bd443d";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name: name ?? "rooftopGear.box",
      group: "rooftopGear",
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    segments = 10,
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      name: name ?? "rooftopGear.cylinder",
      group: "rooftopGear",
    });

  const cone = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    segments = 8,
    name?: string,
  ) =>
    b.part(new THREE.ConeGeometry(radius, height, segments), color, {
      at,
      name: name ?? "rooftopGear.cone",
      group: "rooftopGear",
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) =>
    b.rod(a, c, radius, {
      color,
      name: name ?? "rooftopGear.rod",
      group: "rooftopGear",
    });

  // A low, heavy roof curb makes the roof edge read as a constructed parapet.
  box([4.8, 0.25, 0.15], [0, y0 + 0.125, 1.725], C, "parapetFront");
  box([4.8, 0.25, 0.15], [0, y0 + 0.125, -1.725], C, "parapetBackLeft");
  box([2.0, 0.25, 0.15], [-1.9, y0 + 0.125, -1.725], C, "parapetBackOuterL");
  box([0.8, 0.25, 0.15], [1.9, y0 + 0.125, -1.725], C, "parapetBackOuterR");
  box([0.15, 0.25, 3.3], [-2.325, y0 + 0.125, 0], C, "parapetLeft");
  box([0.15, 0.25, 3.3], [2.325, y0 + 0.125, 0], C, "parapetRight");

  // Pale cap strips catch the light along the parapet top.
  box([4.9, 0.045, 0.18], [0, y0 + 0.272, 1.725], CL, "parapetCapFront");
  box([4.9, 0.045, 0.18], [0, y0 + 0.272, -1.725], CL, "parapetCapBack");
  box([0.18, 0.045, 3.35], [-2.325, y0 + 0.272, 0], CL, "parapetCapLeft");
  box([0.18, 0.045, 3.35], [2.325, y0 + 0.272, 0], CL, "parapetCapRight");

  // The tank occupies the left-front quadrant, on four visible concrete feet.
  const tx = -1.35;
  const tz = 0.62;
  for (const dx of [-0.22, 0.22]) {
    for (const dz of [-0.19, 0.19]) {
      box([0.13, 0.34, 0.13], [tx + dx, y0 + 0.17, tz + dz], C, "tankLeg");
      box([0.17, 0.045, 0.17], [tx + dx, y0 + 0.35, tz + dz], CD, "tankFoot");
    }
  }
  cyl(0.62, 0.62, [tx, y0 + 0.69, tz], C, 12, "waterTank");
  cyl(0.56, 0.035, [tx, y0 + 1.005, tz], CL, 12, "tankTopRing");
  cone(0.53, 0.28, [tx, y0 + 1.16, tz], CD, 10, "tankConicalLid");
  cyl(0.12, 0.08, [tx, y0 + 1.34, tz], METAL, 8, "tankVentBase");
  cone(0.16, 0.11, [tx, y0 + 1.43, tz], METAL, 8, "tankVentCap");

  // Tank access ladder: two rails and square rungs, leaning against the front.
  const ladderX = tx + 0.62;
  const ladderZ = tz + 0.12;
  rod(
    [ladderX - 0.17, y0 + 0.36, ladderZ + 0.16],
    [ladderX - 0.17, y0 + 0.99, ladderZ + 0.16],
    0.025,
    METAL,
    "tankLadderRailL",
  );
  rod(
    [ladderX + 0.17, y0 + 0.36, ladderZ + 0.16],
    [ladderX + 0.17, y0 + 0.99, ladderZ + 0.16],
    0.025,
    METAL,
    "tankLadderRailR",
  );
  for (let i = 0; i < 5; i++) {
    const yy = y0 + 0.43 + i * 0.13;
    rod(
      [ladderX - 0.17, yy, ladderZ + 0.16],
      [ladderX + 0.17, yy, ladderZ + 0.16],
      0.018,
      METAL,
      "tankLadderRung",
    );
  }

  // Three compact vent stacks on the right half of the deck.
  const vents: [number, number, number][] = [
    [1.35, y0, 0.92],
    [1.78, y0, 0.45],
    [1.28, y0, -0.52],
  ];
  vents.forEach(([x, _, z], i) => {
    cyl(0.14, 0.38, [x, y0 + 0.19, z], VENT, 10, `ventStack${i}`);
    cyl(0.18, 0.045, [x, y0 + 0.405, z], METAL, 10, `ventCap${i}`);
    box([0.20, 0.025, 0.035], [x, y0 + 0.43, z], CS, `ventSlot${i}`);
  });

  // Antenna mast at the back-right, safely outside the service core.
  const ax = 1.82;
  const az = -1.05;
  rod([ax, y0 + 0.28, az], [ax, y0 + 1.72, az], 0.026, METAL, "antennaMast");
  rod([ax - 0.24, y0 + 1.15, az], [ax + 0.24, y0 + 1.15, az], 0.022, METAL, "antennaCrossbarLow");
  rod([ax - 0.16, y0 + 1.48, az], [ax + 0.16, y0 + 1.48, az], 0.018, METAL, "antennaCrossbarHigh");
  cyl(0.065, 0.085, [ax, y0 + 1.79, az], RED, 8, "antennaWarningLamp");
  cyl(0.035, 0.025, [ax, y0 + 1.85, az], GLASS_LIT, 8, "antennaLampTop");

  // Low skylight, with a deliberately chunky concrete frame.
  const sx = 0.38;
  const sz = 0.34;
  box([0.9, 0.12, 0.58], [sx, y0 + 0.12, sz], WHITE, "skylightBase");
  box([0.72, 0.10, 0.40], [sx, y0 + 0.22, sz], GLASS, "skylightGlass");
  box([0.10, 0.18, 0.56], [sx - 0.40, y0 + 0.22, sz], WHITE, "skylightFrameL");
  box([0.10, 0.18, 0.56], [sx + 0.40, y0 + 0.22, sz], WHITE, "skylightFrameR");
  box([0.88, 0.18, 0.10], [sx, y0 + 0.22, sz - 0.24], WHITE, "skylightFrameBack");
  box([0.88, 0.18, 0.10], [sx, y0 + 0.22, sz + 0.24], WHITE, "skylightFrameFront");
  box([0.035, 0.12, 0.42], [sx, y0 + 0.25, sz], GLASS_LIT, "skylightGlint");

  // A small bulkhead door leaning against the core, with a projecting head.
  const bx = 1.08;
  const bz = -1.20;
  box([0.58, 0.82, 0.055], [bx, y0 + 0.43, bz], METAL, "bulkheadDoor");
  box([0.45, 0.68, 0.018], [bx, y0 + 0.43, bz + 0.035], CD, "bulkheadInset");
  box([0.66, 0.10, 0.16], [bx, y0 + 0.88, bz], C, "bulkheadLintel");
  cyl(0.035, 0.12, [bx + 0.17, y0 + 0.42, bz + 0.06], WHITE, 8, "bulkheadHandle");

  // Board-marked ribs on the exposed core edge.
  for (let i = 0; i < 4; i++) {
    box([0.12, 0.035, 1.12], [-1.355, y0 + 0.42 + i * 0.48, -1.43], CS, "coreBoardRib");
  }

  // Moss patches and cracked roof membrane fragments, kept flat and graphic.
  box([0.48, 0.018, 0.16], [-0.18, y0 + 0.014, -0.72], MOSS, "mossPatchA");
  box([0.22, 0.020, 0.11], [-0.46, y0 + 0.016, -0.79], MOSS, "mossPatchB");
  box([0.38, 0.018, 0.13], [0.82, y0 + 0.015, 0.96], MOSS, "mossPatchC");
  box([0.16, 0.018, 0.08], [0.99, y0 + 0.017, 0.86], MOSS, "mossPatchD");
  rod([-0.12, y0 + 0.026, -0.64], [0.18, y0 + 0.026, -0.80], 0.012, CS, "roofCrackA");
  rod([0.18, y0 + 0.027, -0.80], [0.29, y0 + 0.027, -0.66], 0.010, CS, "roofCrackB");
  rod([0.79, y0 + 0.027, 0.94], [0.96, y0 + 0.027, 1.03], 0.010, CS, "roofCrackC");

  // One dark rain trail descends over the front parapet and breaks into drip blocks.
  box([0.12, 0.32, 0.018], [-0.82, y0 + 0.10, 1.815], STAIN, "parapetRainStreak");
  box([0.075, 0.11, 0.022], [-0.82, y0 - 0.02, 1.817], STAIN, "parapetRainDrip");
  box([0.045, 0.07, 0.022], [-0.69, y0 + 0.01, 1.817], STAIN, "parapetRainDripSmall");
}
```