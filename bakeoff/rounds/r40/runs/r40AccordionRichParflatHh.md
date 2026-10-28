<!-- call: plan -->

```json
{
  "name": "Madreperla Piano Accordion",
  "description": "A full-size 41-key, 120-bass piano accordion in Italian mother-of-pearl style: iridescent pearl-mosaic cases trimmed in gold and chrome, gold fan grilles, and a ruby-red gold-edged bellows, shown on the floor with its straps.",
  "builderName": "pianoAccordionMadreperla",
  "size": [0.76, 0.54, 0.35],
  "layout": "STATIC OBJECT, no joints. It stands on y=0 on its two case bottoms, bellows axis along X, in a symmetric composition. The front (+Z) is the grille side, shown to the audience. The treble (right-hand) case sits at -X with the 41-key piano keyboard on its -X end face. The bass (left-hand) case sits at +X with the 120 bass buttons on its +X end face. The bellows spans x -0.14..+0.14 between them, a little open. The back (-Z) carries straps and hardware, which stand 0.05 m out. Heights: treble case 0.54, bass case 0.50, bellows 0.02..0.49, so the silhouette steps down from treble to bass. Cases are 0.30 deep (z -0.15..0.15), 0.21 wide each. The Italian mother-of-pearl style shows in four ways. (1) Every case surface (top, bottom, back, front bezel, end-plate margins) is a pearl MOSAIC: a base slab in pearlShadow, covered with small raised tiles about 0.035 x 0.03 m and 2 mm thick, with 1-2 mm gaps showing the base. Tile colours are chosen deterministically by rng: 50% pearlWhite, 20% pearlCream, 10% each of pearlPink, pearlAqua and pearlLilac. Both cases use this same rule so they read as one set. (2) Every case edge has gold piping (thin 6 mm rods in goldBright) with goldDeep shadow rods beside it. Rhinestones (rhinestoneBlue and rhinestoneRose) sit as small faceted gems at the case corners and the grille centres. (3) The grilles are gold slats on a dark grilleBack recess, with a rosette in the middle. (4) The bellows is ruby red with gold-leaf edging and gold-and-pearl corner guards. Chrome is used for switches, buckles and hooks. Keep every shape simple and blocky: boxes, wedges, short cylinders of 6-10 sides. All the character comes from small coloured parts seated on the faces.",
  "palette": {
    "pearlWhite": "#f4efe6",
    "pearlCream": "#efe3cf",
    "pearlPink": "#f2d6dc",
    "pearlAqua": "#cfe9e6",
    "pearlLilac": "#dcd2ec",
    "pearlShadow": "#bfb7c4",
    "goldBright": "#e8bf52",
    "goldDeep": "#a8782a",
    "chrome": "#d6dbe2",
    "chromeDark": "#7f8794",
    "bellowsRed": "#a3121e",
    "bellowsRedDark": "#6e0a14",
    "bellowsRedLight": "#c8283a",
    "black": "#17151a",
    "keyWhite": "#fbf8ef",
    "keyBlack": "#1c1a20",
    "felt": "#3a1620",
    "strapBlack": "#26222a",
    "leather": "#4a2a1c",
    "rhinestoneBlue": "#5fb8ff",
    "rhinestoneRose": "#ff7ab0",
    "labelCream": "#f6ecd2",
    "grilleBack": "#2b1c22"
  },
  "mounts": {
    "trebleBellowsFace": [-0.14, 0.255, 0],
    "bassBellowsFace": [0.14, 0.255, 0],
    "keyboardPlane": [-0.35, 0.27, 0],
    "bassButtonPlane": [0.35, 0.25, 0],
    "trebleFrontGrille": [-0.245, 0.27, 0.15],
    "bassFrontGrille": [0.245, 0.25, 0.15],
    "trebleTopSwitches": [-0.245, 0.54, -0.02],
    "shoulderStrapTopA": [-0.3, 0.54, -0.1],
    "shoulderStrapTopB": [-0.19, 0.54, -0.1],
    "shoulderStrapBottomA": [-0.3, 0.04, -0.15],
    "shoulderStrapBottomB": [-0.19, 0.04, -0.15],
    "bassStrapPad": [0.245, 0.25, -0.15],
    "bellowsStrapAnchor": [0.2, 0.5, 0],
    "bellowsStrapKeeper": [-0.06, 0.49, 0]
  },
  "joints": [],
  "parts": [
    {
      "id": "trebleCase",
      "builds": "The right-hand (treble) case, a blocky box x -0.35..-0.14, y 0..0.54, z -0.15..0.15. It is pearl-mosaic covered on top, bottom, back and the -X end margins (the keyboard part sits on the -X face at x=-0.35, so leave the keyboard window x -0.35, y 0.03..0.51, z -0.115..0.115 free; mosaic tiles surround it). The bellows-side face at x=-0.14 is a plain pearlCream frame lip 0.012 m deep, which the bellows end frame meets. FRONT +Z: an inset pearl bezel and a dark grilleBack recess about 0.17 wide x 0.44 tall. In the recess sit about 13 goldBright slats radiating as a fan from a point near the bottom centre, each a thin 6-sided rod or box, with a goldDeep shadow slat under alternating ones. A rosette in the middle is a stack of goldBright and goldDeep 10-sided discs with a rhinestoneBlue centre. A labelCream nameplate reading 'BELLINI' (a small gold-bordered plate with tiny black bar glyphs for letters) sits below it on the bezel. TOP (+Y): a chrome register-switch bank at trebleTopSwitches, a 0.12 x 0.05 chrome plate with 6 pearlWhite rocker tabs, each with a tiny goldBright dot, and one larger master switch. Gold piping on every case edge and a rhinestone at each of the 4 top corners and 4 bottom corners, alternating rhinestoneBlue and rhinestoneRose. Four small black rubber feet (0.012 high) are sunk into the bottom so the case rests on y=0. BACK -Z: a goldDeep serial plate and two chrome strap hooks' base plates at shoulderStrapTopA/B and shoulderStrapBottomA/B (the harness part builds the straps themselves). Keep mosaic tiles merged by colour to save parts.",
      "box": [[-0.35, 0, -0.15], [-0.14, 0.54, 0.15]],
      "attaches": "The keyboard part sits on the -X face (mount keyboardPlane). The bellows meets the +X face at trebleBellowsFace. The harness hooks at the shoulderStrapTop/Bottom mounts on the back face.",
      "joints": [],
      "floor": true,
      "budget": 210
    },
    {
      "id": "keyboard",
      "builds": "The 41-key piano keyboard on the treble case's -X end face. It is a mother-of-pearl-framed keybed: 24 white keys (keyWhite) and 17 black keys (keyBlack). Keys are 0.02 pitch along Y, starting at y=0.03 (the lowest key) up to y=0.51. White keys are boxes about 0.0185 tall (y) x 0.20 long (z -0.10..0.10) x 0.03 thick (x -0.385..-0.355), with 1.5 mm gaps between them showing the felt keybed. Black keys follow the standard grouping (2 black, gap, 3 black, gap, repeating, starting after the first white key as an F-sharp pattern). Each is 0.011 tall (y), 0.11 long (z, sitting on the +Z half: z -0.01..0.10), and 0.045 thick (x -0.40..-0.355). Each black key has a thin chromeDark highlight strip on its top face and its tip is slightly bevelled with a wedge. The keybed is a felt slab (x -0.355..-0.35, y 0.03..0.51, z -0.115..0.115). Framing it: a goldBright rail along the top and bottom ends (y 0.51..0.52 and 0.02..0.03), a pearl-mosaic cap rail along the back z -0.115..-0.125 and along the front z 0.115..0.125 (pearlCream tiles with gold piping, using the same mosaic rule as the cases), and tiny rhinestones at the 4 corners of the frame. A thin labelCream key-cover felt strip with a goldDeep line sits between the keys and the +Z rail. Optionally include small goldBright pitch-marker dots on every C white key's end.",
      "box": [[-0.4, 0.02, -0.125], [-0.35, 0.52, 0.125]],
      "attaches": "Sits flush on the treble case -X face at keyboardPlane; its back x=-0.35 touches the case. The top and bottom rails stay inside the case's y range.",
      "joints": [],
      "floor": false,
      "budget": 130
    },
    {
      "id": "bellows",
      "builds": "The ruby-red folding bellows between the cases, x -0.14..0.14, y 0.02..0.49, z -0.125..0.125, with corner guards reaching 0.13. It is slightly open, with 13 pleats. Each pleat is a sharp V crest, ridge at the full outline (z +-0.125, y 0.02..0.49), valley inset 0.02 m on all four sides. Build each as 4 thin tapered slabs per side or as rectangular loft rings alternating bellowsRed (outer faces), bellowsRedLight (top-facing facets) and bellowsRedDark (valley faces), so every crest reads as a ridge. Along each crest edge a thin goldBright wire (4 mm rod) runs round all four sides, and gold leaf dots sit in every other valley on the front. The four long corners of the bellows each carry corner guards, one every 0.04 m along X: small pearlCream-and-goldBright L-shaped brackets (a box 0.012 x 0.02 and a gold rivet) over the crests, so the corner reads as a gold-and-pearl bound edge. Each end has a pearlCream end frame, a rectangular ring 0.01 deep at x=-0.14 and x=+0.14, with goldBright piping and a thin black felt gasket line. Black reinforcing tape lines run along the top of the bellows on the valley folds. On the front +Z face of the bellows, a centred gold diamond lozenge motif made of 3 small gold diamond extrudes sits at x=0 on the centre pleat, flanked by 2 rhinestoneRose gems.",
      "box": [[-0.14, 0.015, -0.13], [0.14, 0.495, 0.13]],
      "attaches": "End frames meet the treble case at trebleBellowsFace (x=-0.14) and the bass case at bassBellowsFace (x=0.14). The harness bellows strap lies across its top near x=-0.06..0.2.",
      "joints": [],
      "floor": false,
      "budget": 200
    },
    {
      "id": "bassCase",
      "builds": "The left-hand (bass) case, a blocky box x 0.14..0.35, y 0..0.50, z -0.15..0.15, built in the same pearl-mosaic rule and gold piping as the treble case (tile ~0.035, 2 mm raised, same colour split) on top, bottom, back and front bezel. The bellows-side face at x=0.14 is a plain pearlCream lip 0.012 deep. FRONT +Z: an inset pearl bezel and grilleBack recess 0.17 x 0.40, filled with about 9 horizontal-ish goldBright slats (a ladder pattern, slightly fanned) and a smaller rosette with a rhinestoneRose centre. END FACE +X (x=0.35, bassButtonPlane): a pearl-mosaic margin framing a dark felt recess plate, 0.25 (z) x 0.46 (y). It carries 120 bass buttons in 6 rows (z -0.09..+0.09, 0.036 pitch) of 20 (y 0.03..0.47, 0.022 pitch). Each is an 8-sided cylinder, radius 0.0085, height 0.012, projecting to x~0.362 (the part's box reaches 0.38 to allow a little button travel clearance): pearlWhite for most, chrome for the C buttons (every 3rd column in rows 3-4) and goldBright for the E buttons in rows 5-6; each button has a thin chromeDark ring base disc. All buttons of one colour are merged into one part. An air-release button sits at the top rear of the end plate (y 0.478, z -0.10): a red bellowsRedLight disc in a goldBright ring. The case has a top gold piping, rhinestones at its 8 corners (rhinestoneBlue and rhinestoneRose alternating), four black rubber feet sunk into the bottom so the case rests on y=0, and a small goldDeep brand plate on the back. On the back face, a pearl-mosaic region leaves the strap pad area at bassStrapPad free for the harness.",
      "box": [[0.14, 0, -0.15], [0.38, 0.5, 0.15]],
      "attaches": "Bellows end frame meets the -X face at bassBellowsFace (x=0.14). The harness hand-strap pad and bellows strap anchor are on its back and top at bassStrapPad and bellowsStrapAnchor. Buttons rise from the plate at bassButtonPlane (x=0.35).",
      "joints": [],
      "floor": true,
      "budget": 220
    },
    {
      "id": "harness",
      "builds": "All the straps and the hardware on them, kept to the back (-Z, out to z=-0.20) and the bellows top. (a) Two shoulder straps, each 0.045 wide and 0.008 thick strapBlack, with stitched goldDeep edge lines and a thin chromeDark centre line. Each runs from its top hook (shoulderStrapTopA/B, on the treble case top at y 0.54) in a loose arc out to z -0.19 and back down to its bottom hook (shoulderStrapBottomA/B at y 0.04 on the back). The lowest point stays at y>=0.015. Each has a chrome slide buckle (a rectangular frame with a bar) at mid-height and a leather end tab with 3 small chrome rivets. Hooks are chrome U-shapes seated on the base plates the treble case builds. Build the arcs as a sweep over a catmull path or as a few segmented boxes. (b) The bass hand-strap: a leather pad (box 0.07 wide x 0.20 tall x 0.02 thick, in leather) centred at bassStrapPad on the back of the bass case, with a strapBlack strap across it, a chrome buckle, gold stitching dots along both edges, and two chrome mounting rivets at each end. (c) The bellows strap: strapBlack, 0.03 wide, anchored on the bass case top at bellowsStrapAnchor on a chrome base plate. It runs along the bellows top (y~0.495, x 0.2 to -0.06) lying flat, ending in a leather tab at bellowsStrapKeeper with a chrome snap stud, and a chrome buckle at x~0.10. A small goldBright tassel (a cone with a 6-sided cap and 3 short rods) hangs from the buckle toward +Z off the bellows front edge. (d) a tiny labelCream tag on the left shoulder strap with a black dot pattern.",
      "box": [[-0.34, 0.01, -0.2], [0.24, 0.55, 0.03]],
      "attaches": "Hooks sit on the treble back plates at shoulderStrapTopA/B and shoulderStrapBottomA/B. The hand strap pad sits on the bass back at bassStrapPad. The bellows strap starts at bellowsStrapAnchor on the bass top and ends at bellowsStrapKeeper on the bellows top.",
      "joints": [],
      "floor": false,
      "budget": 100
    }
  ]
}
```

<!-- call: keyboard -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { rng } from "agentic-3js-builder";

export function buildKeyboard({ b, P }: Ctx) {
  // ---- palette (spec colours plus three of my own) -------------------------------------------------------
  const KEY_SHADE = "#d9d2bf"; // shaded lower bevel on the white key ends
  const BLACK_BEVEL = "#2e2a34"; // lighter bevelled tip of the black keys
  const GOLD_SCREW = P.goldDeep;

  // ---- geometry buckets: everything of one colour is merged into one part ------------------------------
  const buckets = new Map<string, THREE.BufferGeometry[]>();
  const add = (color: string, g: THREE.BufferGeometry) => {
    let list = buckets.get(color);
    if (!list) buckets.set(color, (list = []));
    list.push(g);
  };
  const box = (color: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
    const [ax, bx] = [Math.min(x0, x1), Math.max(x0, x1)];
    const [ay, by] = [Math.min(y0, y1), Math.max(y0, y1)];
    const [az, bz] = [Math.min(z0, z1), Math.max(z0, z1)];
    const g = new THREE.BoxGeometry(bx - ax, by - ay, bz - az);
    g.translate((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
    add(color, g);
  };
  const flush = () => {
    for (const [color, list] of buckets) {
      const prepared = list.map((g) => {
        const n = g.index ? g.toNonIndexed() : g;
        for (const name of Object.keys(n.attributes)) if (name !== "position" && name !== "normal") n.deleteAttribute(name);
        return n;
      });
      const merged = mergeGeometries(prepared);
      if (merged) b.part(merged, color, { at: [0, 0, 0], flat: true, name: `keyboard.${color}` });
    }
  };

  // ---- key layout -------------------------------------------------------------------------------------
  const Y0 = 0.03;
  const PITCH = 0.02;
  const WHITE_H = 0.0185;
  const WHITE_COUNT = 24;
  const BLACK_H = 0.011;
  const whiteBottom = (i: number) => Y0 + PITCH * i;
  // black key sits centred on the gap between white key i and i+1
  const blackCentre = (i: number) => Y0 + PITCH * i + WHITE_H + (PITCH - WHITE_H) / 2;
  // white 0 = F: black keys after F G A (3), gap after B, then after C D (2), gap after E, ...
  const hasBlack = (i: number) => [0, 1, 2, 4, 5].includes(i % 7);

  // ---- felt keybed ------------------------------------------------------------------------------------
  box(P.felt, -0.355, -0.35, 0.03, 0.51, -0.115, 0.115);

  // ---- white keys ---------------------------------------------------------------------------------------
  for (let i = 0; i < WHITE_COUNT; i++) {
    const yb = whiteBottom(i);
    box(P.keyWhite, -0.385, -0.355, yb, yb + WHITE_H, -0.1, 0.1);
    // shaded lower bevel band on the key end
    box(KEY_SHADE, -0.3857, -0.385, yb, yb + 0.003, -0.098, 0.098);
  }
  // gap above the top key filled with a gold shadow
  box(P.goldDeep, -0.388, -0.355, whiteBottom(WHITE_COUNT - 1) + WHITE_H, 0.51, -0.1, 0.1);

  // pitch-marker dots on every C key end (white keys 4, 11, 18)
  for (const i of [4, 11, 18]) {
    const g = new THREE.CylinderGeometry(0.003, 0.003, 0.0018, 8);
    g.rotateZ(Math.PI / 2);
    g.translate(-0.3859, whiteBottom(i) + WHITE_H / 2, -0.05);
    add(P.goldBright, g);
  }

  // ---- black keys ---------------------------------------------------------------------------------------
  let blackCount = 0;
  for (let i = 0; i < WHITE_COUNT - 1; i++) {
    if (!hasBlack(i)) continue;
    blackCount++;
    const yc = blackCentre(i);
    const top = yc + BLACK_H / 2;
    // body
    box(P.keyBlack, -0.392, -0.355, yc - BLACK_H / 2, top, -0.01, 0.1);
    // bevelled tip wedge (profile in x/y, extruded along z)
    const shape = new THREE.Shape();
    shape.moveTo(-0.392, yc - BLACK_H / 2);
    shape.lineTo(-0.392, top);
    shape.lineTo(-0.4, top - 0.004);
    shape.lineTo(-0.4, yc - BLACK_H / 2);
    shape.closePath();
    const wedge = new THREE.ExtrudeGeometry(shape, { depth: 0.11, bevelEnabled: false, steps: 1 });
    wedge.translate(0, 0, -0.01);
    add(BLACK_BEVEL, wedge);
    // chromeDark highlight strip on the top face
    box(P.chromeDark, -0.381, -0.375, top, top + 0.0008, 0.0, 0.095);
  }
  void blackCount; // 17 by construction

  // ---- gold rails at the top and bottom ends ------------------------------------------------------------
  box(P.goldBright, -0.39, -0.35, 0.51, 0.52, -0.125, 0.125);
  box(P.goldBright, -0.39, -0.35, 0.02, 0.03, -0.125, 0.125);
  // screw heads on the rail faces
  for (const yc of [0.515, 0.025]) {
    for (const z of [-0.08, -0.04, 0, 0.04, 0.08]) {
      const g = new THREE.CylinderGeometry(0.0026, 0.0026, 0.0014, 6);
      g.rotateZ(Math.PI / 2);
      g.translate(-0.3907, yc, z);
      add(GOLD_SCREW, g);
    }
  }

  // ---- pearl-mosaic cap rails, front (+Z) and back (-Z) -------------------------------------------------
  const rnd = rng(1941);
  const pickTile = () => {
    const r = rnd();
    if (r < 0.5) return P.pearlWhite;
    if (r < 0.7) return P.pearlCream;
    if (r < 0.8) return P.pearlPink;
    if (r < 0.9) return P.pearlAqua;
    return P.pearlLilac;
  };
  const TILE_ROWS = 15;
  for (const s of [1, -1]) {
    // base slab
    box(P.pearlShadow, -0.388, -0.35, 0.03, 0.51, s * 0.115, s * 0.123);
    for (let k = 0; k < TILE_ROWS; k++) {
      const y0 = 0.031 + 0.032 * k;
      // tiles on the -X face (audience side)
      box(pickTile(), -0.39, -0.388, y0, y0 + 0.03, s * 0.1155, s * 0.1205);
      // tiles on the outer side face
      box(pickTile(), -0.383, -0.3525, y0, y0 + 0.03, s * 0.123, s * 0.125);
    }
    // gold piping on the outer corner, with a goldDeep shadow rod beside it
    box(P.goldBright, -0.39, -0.386, 0.03, 0.51, s * 0.121, s * 0.125);
    box(P.goldDeep, -0.3855, -0.3835, 0.03, 0.51, s * 0.1235, s * 0.125);
    // thin goldBright piping along the inner edge, next to the keys
    box(P.goldBright, -0.3895, -0.3875, 0.03, 0.51, s * 0.1145, s * 0.1158);
  }

  // ---- key-cover felt strip with a goldDeep line (front) -----------------------------------------------
  box(P.labelCream, -0.362, -0.355, 0.031, 0.509, 0.1025, 0.1105);
  box(P.goldDeep, -0.364, -0.355, 0.031, 0.509, 0.1105, 0.1125);
  // matching goldDeep line on the back margin
  box(P.goldDeep, -0.364, -0.355, 0.031, 0.509, -0.1125, -0.1105);

  // ---- rhinestones at the 4 frame corners (alternating blue / rose) -------------------------------------
  const gems: [number, number, string][] = [
    [0.515, 0.1195, P.rhinestoneBlue],
    [0.515, -0.1195, P.rhinestoneRose],
    [0.025, 0.1195, P.rhinestoneRose],
    [0.025, -0.1195, P.rhinestoneBlue],
  ];
  for (const [y, z, color] of gems) {
    const g = new THREE.IcosahedronGeometry(0.0042, 0);
    g.scale(0.7, 1, 1);
    g.translate(-0.3915, y, z);
    add(color, g);
  }

  flush();
}
```

<!-- call: bellows -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildBellows({ b, P }: Ctx) {
  // ---------------------------------------------------------------- geometry accumulators (merged by colour)
  const acc = new Map<string, THREE.BufferGeometry[]>();
  const put = (color: string, geo: THREE.BufferGeometry) => {
    const g = geo.index ? geo.toNonIndexed() : geo;
    if (g.getAttribute("uv")) g.deleteAttribute("uv");
    if (!g.getAttribute("normal")) g.computeVertexNormals();
    const list = acc.get(color) ?? [];
    list.push(g);
    acc.set(color, list);
  };
  const box = (color: string, cx: number, cy: number, cz: number, sx: number, sy: number, sz: number) =>
    put(color, new THREE.BoxGeometry(sx, sy, sz).translate(cx, cy, cz));
  const cylZ = (color: string, x: number, y: number, z: number, r: number, len: number, sides = 8) =>
    put(color, new THREE.CylinderGeometry(r, r, len, sides).rotateX(Math.PI / 2).translate(x, y, z));

  // A thin closed prism from a quad, thickened toward the bellows axis.
  const prism = (color: string, p: THREE.Vector3[], center: THREE.Vector3, thick: number) => {
    const n = new THREE.Vector3()
      .subVectors(p[1], p[0])
      .cross(new THREE.Vector3().subVectors(p[3], p[0]))
      .normalize();
    if (n.dot(p[0].clone().sub(center)) < 0) n.negate();
    const q = p.map((v) => v.clone().addScaledVector(n, -thick));
    const cen = new THREE.Vector3();
    [...p, ...q].forEach((v) => cen.add(v));
    cen.multiplyScalar(1 / 8);
    const pos: number[] = [];
    const tri = (a: THREE.Vector3, bb: THREE.Vector3, c: THREE.Vector3) => {
      const nn = new THREE.Vector3().subVectors(bb, a).cross(new THREE.Vector3().subVectors(c, a));
      const m = a.clone().add(bb).add(c).multiplyScalar(1 / 3).sub(cen);
      if (nn.dot(m) < 0) [bb, c] = [c, bb];
      pos.push(a.x, a.y, a.z, bb.x, bb.y, bb.z, c.x, c.y, c.z);
    };
    const quad = (a: THREE.Vector3, bb: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3) => {
      tri(a, bb, c);
      tri(a, c, d);
    };
    quad(p[0], p[1], p[2], p[3]);
    quad(q[0], q[1], q[2], q[3]);
    for (let i = 0; i < 4; i++) quad(p[i], p[(i + 1) % 4], q[(i + 1) % 4], q[i]);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    put(color, g);
  };

  // ---------------------------------------------------------------- pleated bellows
  const Y_LO = 0.02;
  const Y_HI = 0.49;
  const ZH = 0.125;
  const INSET = 0.02;
  const YC = (Y_LO + Y_HI) / 2;
  const PLEATS = 13;
  const PITCH = 0.26 / PLEATS; // 0.02
  const X0 = -0.13;
  const THICK = 0.003;
  const valleyX = (i: number) => X0 + PITCH * i;
  const crestX = (i: number) => X0 + PITCH * (i + 0.5);

  // Ring corners at x with inset d: top-back, top-front, bottom-front, bottom-back.
  const ring = (x: number, d: number) => {
    const y1 = Y_HI - d;
    const y0 = Y_LO + d;
    const z = ZH - d;
    return [
      new THREE.Vector3(x, y1, -z),
      new THREE.Vector3(x, y1, z),
      new THREE.Vector3(x, y0, z),
      new THREE.Vector3(x, y0, -z),
    ];
  };
  const ringAt = (vx: number, cx: number, u: number) => ring(vx + (cx - vx) * u, INSET * (1 - u));

  const SPLIT = 0.45;
  // side 0 top, 1 front, 2 bottom, 3 back
  const facet = (vx: number, cx: number, leftHalf: boolean) => {
    const parts: [number, number, (side: number) => string][] = [
      [0, SPLIT, () => P.bellowsRedDark],
      [
        SPLIT,
        1,
        (side) => (side === 0 && leftHalf ? P.bellowsRedLight : P.bellowsRed),
      ],
    ];
    const cen = new THREE.Vector3((vx + cx) / 2, YC, 0);
    for (const [u0, u1, col] of parts) {
      const A = ringAt(vx, cx, u0);
      const B = ringAt(vx, cx, u1);
      for (let j = 0; j < 4; j++) {
        const k = (j + 1) % 4;
        prism(col(j), [A[j], A[k], B[k], B[j]], cen, THICK);
      }
    }
  };
  for (let i = 0; i < PLEATS; i++) {
    facet(valleyX(i), crestX(i), true);
    facet(valleyX(i + 1), crestX(i), false);
  }

  // Crest wires: goldBright 4 mm rods all round each crest.
  for (let i = 0; i < PLEATS; i++) {
    const x = crestX(i);
    for (const sz of [1, -1]) box(P.goldBright, x, YC, sz * ZH, 0.004, Y_HI - Y_LO + 0.004, 0.004);
    for (const y of [Y_HI, Y_LO]) box(P.goldBright, x, y, 0, 0.004, 0.004, 2 * ZH + 0.004);
  }

  // Black reinforcing tape in the top valley folds.
  for (let i = 1; i < PLEATS; i++) {
    box(P.black, valleyX(i), Y_HI - INSET + 0.0015, 0, 0.005, 0.002, 2 * (ZH - INSET) - 0.004);
  }

  // Gold-leaf beads in every other front valley.
  for (let i = 1; i < PLEATS; i += 2) {
    for (let k = 0; k < 6; k++) {
      const y = 0.095 + k * 0.0735;
      put(P.goldBright, new THREE.SphereGeometry(0.0035, 6, 4).translate(valleyX(i), y, ZH - INSET + 0.0065));
    }
  }

  // ---------------------------------------------------------------- corner guards (pearl L + gold)
  const corners: [number, number][] = [
    [Y_HI, 1],
    [Y_HI, -1],
    [Y_LO, 1],
    [Y_LO, -1],
  ];
  for (let k = 0; k < 7; k++) {
    const x = -0.12 + 0.04 * k;
    for (const [cy, sz] of corners) {
      const out = cy > YC ? 1 : -1;
      // plate over the top / bottom face
      box(P.pearlCream, x, cy + out * 0.0025, sz * 0.116, 0.012, 0.004, 0.022);
      box(P.goldBright, x, cy + out * 0.0025, sz * 0.1045, 0.012, 0.0042, 0.003);
      // plate over the front / back face
      box(P.pearlCream, x, cy - out * 0.011, sz * 0.127, 0.012, 0.024, 0.003);
      box(P.goldBright, x, cy - out * 0.0225, sz * 0.127, 0.012, 0.003, 0.0032);
      // rivet
      cylZ(P.goldBright, x, cy - out * 0.011, sz * 0.1292, 0.0028, 0.0016, 6);
    }
  }

  // ---------------------------------------------------------------- end frames, piping, gasket, felt backing
  for (const s of [-1, 1]) {
    const xc = s * 0.135;
    const xf = s * 0.13; // bellows-facing plane
    // pearlCream ring: outer z +-0.128, y 0.017..0.493; opening z +-0.112, y 0.032..0.478
    box(P.pearlCream, xc, 0.4855, 0, 0.01, 0.015, 0.224);
    box(P.pearlCream, xc, 0.0245, 0, 0.01, 0.015, 0.224);
    for (const sz of [1, -1]) box(P.pearlCream, xc, YC - 0.0, sz * 0.12, 0.01, 0.476, 0.016);
    // gold piping around the outer faces
    for (const sz of [1, -1]) box(P.goldBright, xc, YC, sz * 0.1290, 0.004, 0.476, 0.002);
    box(P.goldBright, xc, 0.494, 0, 0.004, 0.002, 0.256);
    box(P.goldBright, xc, 0.016, 0, 0.004, 0.002, 0.256);
    // gold piping on the bellows-facing face
    for (const sz of [1, -1]) box(P.goldBright, xf - s * 0.0007, YC, sz * 0.1205, 0.0016, 0.45, 0.003);
    box(P.goldBright, xf - s * 0.0007, 0.4855, 0, 0.0016, 0.003, 0.227);
    box(P.goldBright, xf - s * 0.0007, 0.0245, 0, 0.0016, 0.003, 0.227);
    // black felt gasket line just outside the opening
    for (const sz of [1, -1]) box(P.black, xf - s * 0.0007, YC, sz * 0.1135, 0.0016, 0.45, 0.003);
    box(P.black, xf - s * 0.0007, 0.4775 + 0.0015, 0, 0.0016, 0.003, 0.227);
    box(P.black, xf - s * 0.0007, 0.0325 - 0.0015, 0, 0.0016, 0.003, 0.227);
    // felt backing plate behind the first valley
    box(P.felt, s * 0.1335, YC, 0, 0.007, 0.445, 0.224);
    // small gold studs on the frame front, three per side
    for (let k = 0; k < 3; k++) {
      const y = 0.1 + k * 0.155;
      for (const sz of [1, -1]) cylZ(P.goldDeep, xc, y, sz * 0.1295, 0.0025, 0.0016, 6);
    }
  }

  // ---------------------------------------------------------------- flush merged colours into parts
  for (const [color, list] of acc) {
    const merged = mergeGeometries(list, false);
    if (merged) b.part(merged, color, { at: [0, 0, 0] });
  }

  // ---------------------------------------------------------------- lozenge motif on the centre pleat
  const zc = ZH - 0.0005;
  const diamond = (w: number, h: number): [number, number][] => [
    [0, -h],
    [w, 0],
    [0, h],
    [-w, 0],
  ];
  b.extrude(diamond(0.0092, 0.037), {
    at: [0, YC, zc - 0.002],
    x: [1, 0, 0],
    thickness: 0.008,
    color: P.goldDeep,
  });
  b.extrude(diamond(0.0075, 0.03), {
    at: [0, YC, zc],
    x: [1, 0, 0],
    thickness: 0.01,
    color: P.goldBright,
  });
  for (const sy of [1, -1]) {
    b.extrude(diamond(0.0052, 0.017), {
      at: [0, YC + sy * 0.063, zc],
      x: [1, 0, 0],
      thickness: 0.01,
      color: P.goldBright,
    });
  }
  // flanking rhinestones on their gold settings
  for (const sx of [-1, 1]) {
    const gx = sx * PITCH;
    b.part(new THREE.CylinderGeometry(0.0058, 0.0058, 0.0025, 8).rotateX(Math.PI / 2), P.goldBright, {
      at: [gx, YC, ZH],
    });
    b.part(new THREE.IcosahedronGeometry(0.0042, 0), P.rhinestoneRose, { at: [gx, YC, ZH + 0.0012] });
  }
}
```

<!-- call: harness -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildHarness({ b, P, M }: Ctx) {
  // ---------- palette (own: one extra leather tone) ----------
  const C: Record<string, string> = {
    strap: P.strapBlack,
    stitch: P.goldDeep,
    gold: P.goldBright,
    chrome: P.chrome,
    chromeDark: P.chromeDark,
    leather: P.leather,
    leatherLight: "#6b3d27",
    cream: P.labelCream,
    black: P.black,
  };

  // ---------- geometry bag: everything merged per colour ----------
  const bag = new Map<string, THREE.BufferGeometry[]>();
  const put = (key: string, geo: THREE.BufferGeometry, m?: THREE.Matrix4) => {
    if (m) geo.applyMatrix4(m);
    const list = bag.get(key);
    if (list) list.push(geo);
    else bag.set(key, [geo]);
  };
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const AX = V(1, 0, 0);
  const AY = V(0, 1, 0);
  const AZm = V(0, 0, -1);

  const box = (key: string, size: [number, number, number], at: [number, number, number], rotZ = 0) => {
    const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
    if (rotZ) g.rotateZ(rotZ);
    g.translate(at[0], at[1], at[2]);
    put(key, g);
  };
  const cyl = (
    key: string,
    r: number,
    h: number,
    sides: number,
    at: [number, number, number],
    axis: "x" | "y" | "z" = "y",
  ) => {
    const g = new THREE.CylinderGeometry(r, r, h, sides);
    if (axis === "z") g.rotateX(Math.PI / 2);
    if (axis === "x") g.rotateZ(Math.PI / 2);
    g.translate(at[0], at[1], at[2]);
    put(key, g);
  };
  // local placement in a strap frame: x across, y out of the strap face, z along it
  const loc = (key: string, geo: THREE.BufferGeometry, basis: THREE.Matrix4, l: [number, number, number]) => {
    const m = basis.clone().multiply(new THREE.Matrix4().makeTranslation(l[0], l[1], l[2]));
    put(key, geo, m);
  };
  const lbox = (key: string, size: [number, number, number], basis: THREE.Matrix4, l: [number, number, number]) =>
    loc(key, new THREE.BoxGeometry(size[0], size[1], size[2]), basis, l);

  // ---------- strap helpers ----------
  const curveOf = (pts: THREE.Vector3[]) => new THREE.CatmullRomCurve3(pts, false, "centripetal");

  const basisAt = (curve: THREE.CatmullRomCurve3, u: number, W: THREE.Vector3) => {
    const p = curve.getPointAt(u);
    const T = curve.getTangentAt(u).normalize();
    const N = new THREE.Vector3().crossVectors(W, T).normalize();
    const m = new THREE.Matrix4().makeBasis(W.clone().negate(), N, T);
    m.setPosition(p);
    return m;
  };

  type RibbonOpts = {
    off?: number;
    w: number;
    t: number;
    lift?: number;
    step: number;
    dash?: boolean;
    from?: number;
    to?: number;
  };
  const ribbon = (key: string, curve: THREE.CatmullRomCurve3, W: THREE.Vector3, o: RibbonOpts) => {
    const L = curve.getLength();
    const a = o.from ?? 0;
    const c = o.to ?? 1;
    const n = Math.max(1, Math.ceil((L * (c - a)) / o.step));
    for (let i = 0; i < n; i++) {
      const p0 = curve.getPointAt(a + ((c - a) * i) / n);
      const p1 = curve.getPointAt(a + ((c - a) * (i + 1)) / n);
      const d = p1.clone().sub(p0);
      const len = d.length();
      if (len < 1e-6) continue;
      const T = d.clone().divideScalar(len);
      const N = new THREE.Vector3().crossVectors(W, T).normalize();
      const center = p0.clone().add(p1).multiplyScalar(0.5).addScaledVector(N, o.lift ?? 0).addScaledVector(W, o.off ?? 0);
      const m = new THREE.Matrix4().makeBasis(W.clone().negate(), N, T);
      m.setPosition(center);
      put(key, new THREE.BoxGeometry(o.w, o.t, len * (o.dash ? 0.55 : 1.12)), m);
    }
  };

  const findU = (curve: THREE.CatmullRomCurve3, f: (p: THREE.Vector3) => number, target: number, a = 0) => {
    let best = a;
    let bd = Infinity;
    for (let i = 0; i <= 400; i++) {
      const u = a + ((1 - a) * i) / 400;
      const d = Math.abs(f(curve.getPointAt(u)) - target);
      if (d < bd) {
        bd = d;
        best = u;
      }
    }
    return best;
  };

  // chrome slide buckle: rectangular frame with centre bar and tongue
  const buckle = (basis: THREE.Matrix4, across: number, along: number) => {
    const ht = 0.008;
    const ly = 0.004;
    for (const sz of [-1, 1]) lbox("chrome", [across, ht, 0.004], basis, [0, ly, sz * (along / 2 - 0.002)]);
    for (const sx of [-1, 1]) lbox("chrome", [0.004, ht, along], basis, [sx * (across / 2 - 0.002), ly, 0]);
    lbox("chrome", [across - 0.008, 0.005, 0.003], basis, [0, ly + 0.0045, 0]);
    lbox("chromeDark", [0.003, 0.0016, along - 0.006], basis, [0, ly + 0.0045, 0]);
    lbox("chromeDark", [across - 0.01, 0.0012, 0.0015], basis, [0, ly + 0.0075, 0]);
  };

  // ======================================================================
  // (a) Shoulder straps
  // ======================================================================
  const shoulderStrap = (x: number, withTag: boolean) => {
    const zy: [number, number][] = [
      [-0.1, 0.5435],
      [-0.125, 0.5445],
      [-0.152, 0.5465],
      [-0.172, 0.53],
      [-0.188, 0.48],
      [-0.192, 0.4],
      [-0.192, 0.28],
      [-0.188, 0.17],
      [-0.176, 0.085],
      [-0.162, 0.052],
      [-0.1585, 0.038],
    ];
    const curve = curveOf(zy.map(([z, y]) => V(x, y, z)));
    const L = curve.getLength();

    // webbing, centre line and stitching on the outer face
    ribbon("strap", curve, AX, { w: 0.045, t: 0.008, step: 0.014 });
    ribbon("chromeDark", curve, AX, { w: 0.0022, t: 0.0012, lift: 0.0043, step: 0.014 });
    for (const s of [-1, 1])
      ribbon("stitch", curve, AX, { off: s * 0.019, w: 0.0016, t: 0.0012, lift: 0.0043, step: 0.012, dash: true });

    // hooks (chrome U-loops on the treble back / top plates)
    const hx = [x - 0.0265, x + 0.0265];
    for (const px of hx) {
      box("chrome", [0.004, 0.0105, 0.004], [px, 0.54475, -0.104]);
      box("chrome", [0.004, 0.004, 0.0215], [px, 0.04, -0.1625]);
    }
    box("chrome", [0.057, 0.003, 0.004], [x, 0.5485, -0.104]);
    box("chrome", [0.057, 0.004, 0.003], [x, 0.04, -0.1725]);
    cyl("chromeDark", 0.0022, 0.0045, 6, [x, 0.5485, -0.104], "y");

    // slide buckle at mid height
    const uB = findU(curve, (p) => p.y, 0.28, 0.3);
    buckle(basisAt(curve, uB, AX), 0.056, 0.026);

    // leather end tab with 3 chrome rivets
    const uT = 1 - 0.018 / L;
    const tb = basisAt(curve, uT, AX);
    lbox("leather", [0.04, 0.007, 0.036], tb, [0, 0.0075, 0]);
    lbox("leatherLight", [0.03, 0.0012, 0.027], tb, [0, 0.0114, 0]);
    for (const lz of [-0.01, 0, 0.01]) loc("chrome", new THREE.CylinderGeometry(0.0028, 0.0028, 0.0025, 8), tb, [0, 0.0128, lz]);

    // tag with a black dot pattern on the left (+X) strap
    if (withTag) {
      const uG = findU(curve, (p) => p.y, 0.41, 0.15);
      const gb = basisAt(curve, uG, AX);
      lbox("stitch", [0.035, 0.0015, 0.029], gb, [0, 0.0049, 0]);
      lbox("cream", [0.032, 0.002, 0.026], gb, [0, 0.0063, 0]);
      const rnd = rng(5);
      for (const lz of [-0.008, 0, 0.008])
        for (const lx of [-0.009, 0, 0.009])
          if ((lx === 0 && lz === 0) || rnd() > 0.4)
            loc("black", new THREE.CylinderGeometry(0.0021, 0.0021, 0.0012, 6), gb, [lx, 0.0079, lz]);
    }
  };
  shoulderStrap(M.shoulderStrapTopA[0], false);
  shoulderStrap(M.shoulderStrapTopB[0], true);

  // ======================================================================
  // (b) Bass hand-strap on the back of the bass case
  // ======================================================================
  {
    const [cx, cy] = [M.bassStrapPad[0], M.bassStrapPad[1]];
    const zPad = -0.162;
    box("leather", [0.07, 0.2, 0.02], [cx, cy, zPad]);
    box("leatherLight", [0.056, 0.186, 0.004], [cx, cy, -0.174]);
    // gold stitching dots round the margin
    for (let i = 0; i <= 10; i++) {
      const y = cy - 0.0965 + i * 0.0193;
      for (const s of [-1, 1]) cyl("gold", 0.0018, 0.002, 6, [cx + s * 0.0315, y, -0.1724], "z");
    }
    for (let i = 1; i <= 4; i++) {
      const x = cx - 0.0315 + i * 0.0126;
      for (const s of [-1, 1]) cyl("gold", 0.0018, 0.002, 6, [x, cy + s * 0.0965, -0.1724], "z");
    }
    // gold diamonds embossed above and below the strap
    for (const s of [-1, 1]) box("gold", [0.009, 0.009, 0.0015], [cx, cy + s * 0.07, -0.1766], Math.PI / 4);

    // strap arching across the pad
    const pts = [
      [cx - 0.037, -0.1795],
      [cx - 0.029, -0.1795],
      [cx - 0.019, -0.189],
      [cx, -0.1945],
      [cx + 0.019, -0.189],
      [cx + 0.029, -0.1795],
      [cx + 0.037, -0.1795],
    ].map(([x, z]) => V(x, cy, z));
    const curve = curveOf(pts);
    ribbon("strap", curve, AY, { w: 0.032, t: 0.006, step: 0.007 });
    for (const s of [-1, 1])
      ribbon("gold", curve, AY, { off: s * 0.0125, w: 0.0015, t: 0.001, lift: 0.0032, step: 0.007, dash: true });
    // chrome end plates with two mounting rivets each
    for (const sx of [-1, 1]) {
      const x = cx + sx * 0.0325;
      box("chrome", [0.014, 0.036, 0.003], [x, cy, -0.184]);
      for (const sy of [-1, 1]) cyl("chromeDark", 0.0037, 0.0032, 8, [x, cy + sy * 0.011, -0.1865], "z");
    }
    // chrome buckle on the arch
    buckle(basisAt(curve, 0.3, AY), 0.044, 0.022);
  }

  // ======================================================================
  // (c) Bellows strap and tassel
  // ======================================================================
  {
    const ax = M.bellowsStrapAnchor[0];
    const kx = M.bellowsStrapKeeper[0];
    // base plate on the bass case top, clamp and screws
    box("chrome", [0.05, 0.004, 0.036], [ax, 0.502, 0]);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) cyl("chromeDark", 0.0025, 0.002, 6, [ax + sx * 0.019, 0.5045, sz * 0.013], "y");
    box("chrome", [0.014, 0.003, 0.036], [ax + 0.005, 0.511, 0]);
    for (const sz of [-1, 1]) cyl("chromeDark", 0.003, 0.003, 8, [ax + 0.005, 0.5135, sz * 0.011], "y");

    const pts = [
      [ax, 0.5065],
      [0.165, 0.5065],
      [0.14, 0.5035],
      [0.12, 0.4985],
      [0.1, 0.4975],
      [0.0, 0.4975],
      [kx - 0.005, 0.4975],
    ].map(([x, y]) => V(x, y, 0));
    const curve = curveOf(pts);
    ribbon("strap", curve, AZm, { w: 0.03, t: 0.005, step: 0.01 });
    for (const s of [-1, 1])
      ribbon("stitch", curve, AZm, { off: s * 0.0115, w: 0.0015, t: 0.001, lift: 0.0027, step: 0.009, dash: true });

    // leather keeper tab with chrome snap stud
    box("leather", [0.036, 0.008, 0.034], [kx - 0.0005, 0.4995, 0]);
    box("leatherLight", [0.028, 0.0012, 0.026], [kx - 0.0005, 0.5039, 0]);
    cyl("chrome", 0.0065, 0.004, 8, [kx, 0.506, 0], "y");
    const dome = new THREE.SphereGeometry(0.004, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
    dome.translate(kx, 0.508, 0);
    put("chrome", dome);

    // chrome buckle at x ~ 0.10
    const uB = findU(curve, (p) => p.x, 0.1);
    buckle(basisAt(curve, uB, AZm), 0.04, 0.028);

    // tassel hanging off the bellows front edge
    const tx = 0.1;
    const cord = new THREE.TubeGeometry(
      curveOf([
        V(tx, 0.4965, 0.026),
        V(tx, 0.4955, 0.07),
        V(tx, 0.4945, 0.115),
        V(tx, 0.492, 0.129),
        V(tx, 0.48, 0.137),
        V(tx, 0.4765, 0.138),
      ]),
      16,
      0.0018,
      5,
      false,
    );
    put("stitch", cord);
    cyl("gold", 0.0055, 0.005, 6, [tx, 0.4745, 0.138], "y");
    const cone = new THREE.ConeGeometry(0.009, 0.03, 6);
    cone.translate(tx, 0.457, 0.138);
    put("gold", cone);
    cyl("stitch", 0.0097, 0.002, 6, [tx, 0.4435, 0.138], "y");
    const rods: [number, number][] = [
      [-0.005, 0.003],
      [0.005, 0.003],
      [0, -0.005],
    ];
    for (const [dx, dz] of rods) cyl("gold", 0.0013, 0.012, 5, [tx + dx, 0.436, 0.138 + dz], "y");
  }

  // ---------- emit one part per colour ----------
  for (const [key, geos] of bag) {
    const merged = mergeGeometries(geos, false);
    if (!merged) throw new Error(`harness: could not merge ${key}`);
    b.part(merged, C[key], { at: [0, 0, 0], flat: true, name: `harness.${key}` });
  }
}
```

<!-- call: bassCase -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { rng } from "agentic-3js-builder";

export function buildBassCase({ b, P, M }: Ctx) {
  // ---------------------------------------------------------------- constants
  const X0 = 0.152; // case body starts here (pearlCream lip fills 0.14..0.152)
  const X1 = 0.35;
  const Y0 = 0.01; // body bottom; rubber feet reach down to y = 0
  const Y1 = 0.5;
  const Z0 = -0.15;
  const Z1 = 0.15;
  const XC = 0.245;
  const PIPE = 0.006;
  const padX = M.bassStrapPad[0];
  const padY = M.bassStrapPad[1];

  // ------------------------------------------------------- geometry collector
  const G = new Map<string, THREE.BufferGeometry[]>();
  const add = (key: string, geo: THREE.BufferGeometry) => {
    const list = G.get(key) ?? [];
    list.push(geo);
    G.set(key, list);
  };

  type Axis = "x" | "y" | "z";
  const AX: Record<Axis, [Axis, Axis]> = { x: ["z", "y"], y: ["x", "z"], z: ["x", "y"] };

  /** Axis-aligned slab from min/max ranges. */
  const slab = (key: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
    const g = new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0));
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    add(key, g);
  };

  /** A thin plate lying on a face. `fixed` is the face coordinate along `axis`, `sign` its outward direction; the
   *  plate sits inward of it by `thick`. u/v run along the other two axes (see AX). */
  const plate = (
    key: string,
    axis: Axis,
    fixed: number,
    sign: number,
    thick: number,
    u0: number,
    u1: number,
    v0: number,
    v1: number,
  ) => {
    const [ua, va] = AX[axis];
    const lo = { x: 0, y: 0, z: 0 };
    const hi = { x: 0, y: 0, z: 0 };
    lo[ua] = u0;
    hi[ua] = u1;
    lo[va] = v0;
    hi[va] = v1;
    if (sign > 0) {
      lo[axis] = fixed - thick;
      hi[axis] = fixed;
    } else {
      lo[axis] = fixed;
      hi[axis] = fixed + thick;
    }
    slab(key, lo.x, hi.x, lo.y, hi.y, lo.z, hi.z);
  };

  /** Four rods framing a rectangle on a face. */
  const frameRods = (
    key: string,
    axis: Axis,
    fixed: number,
    sign: number,
    thick: number,
    u0: number,
    u1: number,
    v0: number,
    v1: number,
    w: number,
  ) => {
    plate(key, axis, fixed, sign, thick, u0, u1, v1 - w, v1);
    plate(key, axis, fixed, sign, thick, u0, u1, v0, v0 + w);
    plate(key, axis, fixed, sign, thick, u0, u0 + w, v0 + w, v1 - w);
    plate(key, axis, fixed, sign, thick, u1 - w, u1, v0 + w, v1 - w);
  };

  const cyl = (
    key: string,
    axis: Axis,
    c: [number, number, number],
    rTop: number,
    rBot: number,
    h: number,
    seg: number,
    noBottom = true,
  ) => {
    const g = new THREE.CylinderGeometry(rTop, rBot, h, seg, 1, false);
    if (noBottom && g.index) {
      const n = g.groups[0].count + g.groups[1].count;
      g.setIndex(Array.from(g.index.array).slice(0, n));
    }
    g.clearGroups();
    if (axis === "x") g.rotateZ(-Math.PI / 2);
    else if (axis === "z") g.rotateX(Math.PI / 2);
    g.translate(c[0], c[1], c[2]);
    add(key, g);
  };

  const discX = (key: string, x: number, y: number, z: number, r: number) => {
    const g = new THREE.CircleGeometry(r, 8);
    g.rotateY(Math.PI / 2);
    g.translate(x, y, z);
    add(key, g);
  };

  const gem = (key: string, x: number, y: number, z: number, r: number) => {
    const g = new THREE.OctahedronGeometry(r, 0);
    g.scale(1, 1.35, 1);
    g.translate(x, y, z);
    add(key, g);
  };

  const slat = (
    key: string,
    w: number,
    h: number,
    d: number,
    dy: number,
    ang: number,
    cy: number,
    cz: number,
  ) => {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(0, dy, 0);
    g.rotateZ(ang);
    g.translate(XC, cy, cz);
    add(key, g);
  };

  // ----------------------------------------------------------- mosaic tiles
  const r = rng(2024);
  const pickTile = () => {
    const v = r();
    if (v < 0.5) return "pearlWhite";
    if (v < 0.7) return "pearlCream";
    if (v < 0.8) return "pearlPink";
    if (v < 0.9) return "pearlAqua";
    return "pearlLilac";
  };

  type Skip = (u: number, v: number, cu: number, cv: number) => boolean;
  const tiles = (
    axis: Axis,
    fixed: number,
    sign: number,
    u0: number,
    u1: number,
    v0: number,
    v1: number,
    skip?: Skip,
  ) => {
    const lu = u1 - u0;
    const lv = v1 - v0;
    if (lu < 0.004 || lv < 0.004) return;
    const nu = Math.max(1, Math.round(lu / 0.035));
    const nv = Math.max(1, Math.round(lv / 0.03));
    const cu = lu / nu;
    const cv = lv / nv;
    const gap = 0.0015;
    for (let i = 0; i < nu; i++)
      for (let j = 0; j < nv; j++) {
        const key = pickTile();
        const uc = u0 + (i + 0.5) * cu;
        const vc = v0 + (j + 0.5) * cv;
        if (skip && skip(uc, vc, cu, cv)) continue;
        plate(key, axis, fixed, sign, 0.002, uc - (cu - gap) / 2, uc + (cu - gap) / 2, vc - (cv - gap) / 2, vc + (cv - gap) / 2);
      }
  };

  // -------------------------------------------------------------- base body
  // Core slab in pearlShadow (shows through the tile gaps).
  slab("pearlShadow", X0, 0.344, 0.012, 0.498, -0.148, 0.14);
  // Front bezel frame around the grille recess (recess x 0.17..0.32, y 0.05..0.45).
  slab("pearlShadow", X0, X1, 0.45, 0.498, 0.14, 0.148);
  slab("pearlShadow", X0, X1, 0.012, 0.05, 0.14, 0.148);
  slab("pearlShadow", X0, 0.17, 0.05, 0.45, 0.14, 0.148);
  slab("pearlShadow", 0.32, X1, 0.05, 0.45, 0.14, 0.148);
  // End-face frame around the button recess (z +-0.125, y 0.03..0.47).
  slab("pearlShadow", 0.344, 0.348, 0.47, 0.498, -0.148, 0.148);
  slab("pearlShadow", 0.344, 0.348, 0.012, 0.03, -0.148, 0.148);
  slab("pearlShadow", 0.344, 0.348, 0.03, 0.47, 0.125, 0.148);
  slab("pearlShadow", 0.344, 0.348, 0.03, 0.47, -0.148, -0.125);
  // Plain pearlCream lip where the bellows end frame meets the case.
  slab("pearlCream", 0.14, X0, Y0, Y1, Z0, Z1);
  slab("goldDeep", 0.1395, 0.14, Y0 + 0.004, Y1 - 0.004, Z0 + 0.004, Z0 + 0.0065);
  slab("goldDeep", 0.1395, 0.14, Y0 + 0.004, Y1 - 0.004, Z1 - 0.0065, Z1 - 0.004);

  // ------------------------------------------------------------ gold piping
  for (const y of [[Y0, Y0 + PIPE], [Y1 - PIPE, Y1]])
    for (const z of [[Z0, Z0 + PIPE], [Z1 - PIPE, Z1]]) slab("goldBright", X0, X1, y[0], y[1], z[0], z[1]);
  for (const x of [[X0, X0 + PIPE], [X1 - PIPE, X1]])
    for (const z of [[Z0, Z0 + PIPE], [Z1 - PIPE, Z1]]) slab("goldBright", x[0], x[1], Y0 + PIPE, Y1 - PIPE, z[0], z[1]);
  for (const x of [[X0, X0 + PIPE], [X1 - PIPE, X1]])
    for (const y of [[Y0, Y0 + PIPE], [Y1 - PIPE, Y1]]) slab("goldBright", x[0], x[1], y[0], y[1], Z0 + PIPE, Z1 - PIPE);

  // --------------------------------------------------- top, bottom, back mosaics
  const FX0 = X0 + PIPE;
  const FX1 = X1 - PIPE;
  const FZ = 0.144;
  const w3 = 0.003;
  // top
  frameRods("goldDeep", "y", Y1, 1, 0.003, FX0, FX1, -FZ, FZ, w3);
  tiles("y", Y1, 1, FX0 + w3, FX1 - w3, -FZ + w3, FZ - w3);
  // bottom
  frameRods("goldDeep", "y", Y0, -1, 0.003, FX0, FX1, -FZ, FZ, w3);
  tiles("y", Y0, -1, FX0 + w3, FX1 - w3, -FZ + w3, FZ - w3);
  // back: leave the hand-strap pad area free
  const FY0 = Y0 + PIPE;
  const FY1 = Y1 - PIPE;
  frameRods("goldDeep", "z", Z0, -1, 0.003, FX0, FX1, FY0, FY1, w3);
  tiles("z", Z0, -1, FX0 + w3, FX1 - w3, FY0 + w3, FY1 - w3, (u, v, cu, cv) =>
    Math.abs(u - padX) < 0.04 + 0.005 + cu / 2 && Math.abs(v - padY) < 0.1 + 0.005 + cv / 2,
  );

  // ------------------------------------------------ front bezel + grille recess
  const w25 = 0.0025;
  frameRods("goldDeep", "z", Z1, 1, 0.0025, FX0, FX1, FY0, FY1, w25);
  const fx0 = FX0 + w25;
  const fx1 = FX1 - w25;
  const fy0 = FY0 + w25;
  const fy1 = FY1 - w25;
  const RX0 = 0.17;
  const RX1 = 0.32;
  const RY0 = 0.05;
  const RY1 = 0.45;
  tiles("z", Z1, 1, fx0, fx1, RY1 + w25, fy1);
  tiles("z", Z1, 1, fx0, fx1, fy0, RY0 - w25);
  tiles("z", Z1, 1, fx0, RX0 - w25, RY0 - w25, RY1 + w25);
  tiles("z", Z1, 1, RX1 + w25, fx1, RY0 - w25, RY1 + w25);
  // gold rim around the recess
  frameRods("goldDeep", "z", Z1, 1, 0.0025, RX0 - w25, RX1 + w25, RY0 - w25, RY1 + w25, w25);

  // grille: dark recess, rails, fanned slats
  slab("grilleBack", RX0, RX1, RY0, RY1, 0.14, 0.141);
  slab("goldDeep", 0.183, 0.187, 0.07, 0.43, 0.141, 0.1435);
  slab("goldDeep", 0.303, 0.307, 0.07, 0.43, 0.141, 0.1435);
  for (let i = 0; i < 9; i++) {
    const y = 0.25 + (i - 4) * 0.0425;
    const ang = (i - 4) * 0.03;
    slat("goldBright", 0.13, 0.014, 0.003, 0, ang, y, 0.145);
    if (i % 2 === 0) slat("goldDeep", 0.13, 0.016, 0.002, -0.0075, ang, y, 0.1425);
  }
  // rosette
  cyl("goldDeep", "z", [XC, 0.25, 0.1473], 0.034, 0.034, 0.0015, 10);
  cyl("goldBright", "z", [XC, 0.25, 0.14875], 0.029, 0.029, 0.0015, 10);
  cyl("goldDeep", "z", [XC, 0.25, 0.15], 0.021, 0.021, 0.001, 10);
  cyl("goldBright", "z", [XC, 0.25, 0.1508], 0.015, 0.015, 0.0008, 10);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    cyl("goldBright", "z", [XC + Math.cos(a) * 0.0315, 0.25 + Math.sin(a) * 0.0315, 0.1485], 0.0016, 0.0016, 0.0016, 6);
  }
  gem("rhinestoneRose", XC, 0.25, 0.1512, 0.0075);
  for (const [dx, dy] of [[-0.058, 0.115], [0.058, 0.115], [-0.058, -0.115], [0.058, -0.115]])
    gem("rhinestoneBlue", XC + dx, 0.25 + dy, 0.1475, 0.0042);

  // ---------------------------------------------- end face +X: mosaic + felt plate
  frameRods("goldDeep", "x", X1, 1, 0.003, -FZ, FZ, FY0, FY1, w3);
  const ez0 = -FZ + w3;
  const ez1 = FZ - w3;
  const ey0 = FY0 + w3;
  const ey1 = FY1 - w3;
  const EZ = 0.125;
  const EY0 = 0.03;
  const EY1 = 0.47;
  tiles("x", X1, 1, ez0, ez1, EY1 + w25, ey1);
  tiles("x", X1, 1, ez0, ez1, ey0, EY0 - w25);
  tiles("x", X1, 1, EZ + w25, ez1, EY0 - w25, EY1 + w25);
  tiles("x", X1, 1, ez0, -EZ - w25, EY0 - w25, EY1 + w25);
  frameRods("goldDeep", "x", X1, 1, 0.0025, -EZ - w25, EZ + w25, EY0 - w25, EY1 + w25, w25);
  slab("felt", 0.344, 0.346, EY0, EY1, -EZ, EZ);

  // 120 bass buttons: 6 rows (z) x 20 columns (y)
  for (let k = 0; k < 6; k++) {
    const z = -0.09 + 0.036 * k;
    for (let j = 0; j < 20; j++) {
      const y = 0.03 + 0.022 * (j + 0.5);
      let key = "pearlWhite";
      if ((k === 2 || k === 3) && j % 3 === 0) key = "chrome";
      else if ((k === 4 || k === 5) && j % 3 === 1) key = "goldBright";
      cyl(key, "x", [0.3535, y, z], 0.0078, 0.0085, 0.015, 8);
      discX("chromeDark", 0.3462, y, z, 0.0105);
    }
  }
  // air-release button: red disc in a gold ring, top rear of the plate
  cyl("goldBright", "x", [0.3515, 0.478, -0.1], 0.0105, 0.0105, 0.003, 8);
  cyl("bellowsRedLight", "x", [0.3525, 0.478, -0.1], 0.0075, 0.0078, 0.004, 8);

  // ---------------------------------------------------------------- back brand plate
  plate("goldBright", "z", Z0 - 0.0025, -1, 0.0025, XC - 0.04, XC + 0.04, 0.428, 0.454);
  plate("goldDeep", "z", Z0 - 0.0045, -1, 0.002, XC - 0.037, XC + 0.037, 0.4305, 0.4515);
  const glyphX = [-0.026, -0.016, -0.007, 0.002, 0.011, 0.02, 0.028];
  const glyphW = [0.003, 0.005, 0.003, 0.005, 0.003, 0.005, 0.003];
  glyphX.forEach((gx, i) =>
    plate("labelCream", "z", Z0 - 0.0055, -1, 0.001, XC + gx - glyphW[i] / 2, XC + gx + glyphW[i] / 2, 0.4345, 0.4475),
  );

  // ------------------------------------------------------------ rubber feet
  for (const x of [0.17, 0.33])
    for (const z of [-0.12, 0.12]) cyl("black", "y", [x, 0.006, z], 0.011, 0.011, 0.012, 8);

  // -------------------------------------------------------- corner rhinestones
  let n = 0;
  for (const x of [X0 + 0.0035, X1 - 0.0035])
    for (const y of [Y0 + 0.0035, Y1 - 0.0035])
      for (const z of [Z0 + 0.0035, Z1 - 0.0035]) {
        gem(n % 2 === 0 ? "rhinestoneBlue" : "rhinestoneRose", x, y, z, 0.0065);
        n++;
      }

  // ------------------------------------------------------------- flush parts
  for (const [key, geos] of G) {
    const flat = geos.map((g) => (g.index ? g.toNonIndexed() : g));
    const merged = mergeGeometries(flat);
    if (!merged) throw new Error(`bassCase: could not merge ${key}`);
    b.part(merged, P[key], { at: [0, 0, 0], flat: true, name: `bassCase.${key}` });
  }
}
```

<!-- call: trebleCase -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildTrebleCase({ b, P, M }: Ctx) {
  type V = [number, number, number];
  const rand = rng(1177);

  // ---- case envelope (body sits on 4 feet, bottom at Y0, top at Y1) ----
  const X0 = -0.35, X1 = -0.14, Y0 = 0.008, Y1 = 0.54, Z0 = -0.15, Z1 = 0.15;
  const CX = (X0 + X1) / 2;
  const GX = -0.247; // grille centre x
  const LIP = -0.152; // body/lip seam

  // ---- geometry collector: everything merges by colour ----
  const groups = new Map<string, THREE.BufferGeometry[]>();
  const put = (geo: THREE.BufferGeometry, color: string, at: V, rot?: V) => {
    if (rot) {
      geo.rotateX(rot[0]);
      geo.rotateY(rot[1]);
      geo.rotateZ(rot[2]);
    }
    geo.translate(at[0], at[1], at[2]);
    const ng = geo.index ? geo.toNonIndexed() : geo;
    let list = groups.get(color);
    if (!list) groups.set(color, (list = []));
    list.push(ng);
  };
  const box = (sx: number, sy: number, sz: number, at: V, color: string, rot?: V) =>
    put(new THREE.BoxGeometry(sx, sy, sz), color, at, rot);
  const boxR = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, color: string) =>
    box(x1 - x0, y1 - y0, z1 - z0, [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], color);
  const cyl = (r: number, len: number, sides: number, at: V, axis: "x" | "y" | "z", color: string, rTop = r) => {
    const g = new THREE.CylinderGeometry(rTop, r, len, sides);
    if (axis === "x") g.rotateZ(Math.PI / 2);
    else if (axis === "z") g.rotateX(Math.PI / 2);
    put(g, color, at);
  };
  const gem = (at: V, color: string, r = 0.0085, squash = 1) => {
    const g = new THREE.OctahedronGeometry(r, 0);
    g.scale(1, 1, squash);
    put(g, color, at);
  };
  const gemFront = (x: number, y: number, z: number, color: string) => {
    cyl(0.0095, 0.002, 8, [x, y, z], "z", P.goldBright);
    gem([x, y, z + 0.0035], color, 0.0075, 0.8);
  };

  // ---- pearl mosaic ----
  const TILE_T = 0.002;
  const pickPearl = () => {
    const r = rand();
    if (r < 0.5) return P.pearlWhite;
    if (r < 0.7) return P.pearlCream;
    if (r < 0.8) return P.pearlPink;
    if (r < 0.9) return P.pearlAqua;
    return P.pearlLilac;
  };
  const mosaic = (axis: "x" | "y" | "z", sign: number, plane: number, a: [number, number], c: [number, number]) => {
    const la = a[1] - a[0];
    const lc = c[1] - c[0];
    if (la < 0.003 || lc < 0.003) return;
    const na = Math.max(1, Math.round(la / 0.036));
    const nc = Math.max(1, Math.round(lc / 0.031));
    const gap = 0.0015;
    const wa = (la - gap * (na - 1)) / na;
    const wc = (lc - gap * (nc - 1)) / nc;
    const n = plane + sign * (TILE_T / 2 - 0.0002);
    for (let i = 0; i < na; i++)
      for (let j = 0; j < nc; j++) {
        const ca = a[0] + wa / 2 + i * (wa + gap);
        const cc = c[0] + wc / 2 + j * (wc + gap);
        const col = pickPearl();
        if (axis === "x") box(TILE_T, wa, wc, [n, ca, cc], col);
        else if (axis === "y") box(wa, TILE_T, wc, [ca, n, cc], col);
        else box(wa, wc, TILE_T, [ca, cc, n], col);
      }
  };

  // ---- body: core, lip, front bezel frame, recess ----
  const RX0 = -0.327, RX1 = -0.167, RY0 = 0.05, RY1 = 0.49; // grille recess
  const ZB = 0.138; // recess floor
  boxR(X0, LIP, Y0, Y1, Z0, ZB, P.pearlShadow);
  boxR(X0, LIP, RY1, Y1, ZB, Z1, P.pearlShadow);
  boxR(X0, LIP, Y0, RY0, ZB, Z1, P.pearlShadow);
  boxR(X0, RX0, RY0, RY1, ZB, Z1, P.pearlShadow);
  boxR(RX1, LIP, RY0, RY1, ZB, Z1, P.pearlShadow);
  boxR(RX0, RX1, RY0, RY1, ZB, ZB + 0.0015, P.grilleBack);
  // plain pearlCream frame lip facing the bellows
  boxR(LIP, X1, Y0, Y1, Z0, Z1, P.pearlCream);

  // ---- mosaic on top, bottom, back, front bezel, end margins ----
  const I = 0.0105;
  mosaic("y", 1, Y1, [X0 + I, X1 - I], [Z0 + I, Z1 - I]);
  mosaic("y", -1, Y0, [X0 + I, X1 - I], [Z0 + I, Z1 - I]);
  mosaic("z", -1, Z0, [X0 + I, X1 - I], [Y0 + I, Y1 - I]);
  // front bezel strips
  mosaic("z", 1, Z1, [X0 + I, X1 - 0.0125], [0.496, Y1 - I]);
  mosaic("z", 1, Z1, [X0 + I, X1 - 0.0125], [Y0 + I, 0.044]);
  mosaic("z", 1, Z1, [-0.3425, -0.3325], [0.046, 0.494]);
  mosaic("z", 1, Z1, [-0.1615, -0.1535], [0.046, 0.494]);
  // -X end margins around the keyboard window
  mosaic("x", -1, X0, [0.51, Y1 - I], [Z0 + I, Z1 - I]);
  mosaic("x", -1, X0, [Y0 + I, 0.03], [Z0 + I, Z1 - I]);
  mosaic("x", -1, X0, [0.03, 0.51], [0.115, Z1 - I]);
  mosaic("x", -1, X0, [0.03, 0.51], [Z0 + I, -0.115]);

  // ---- gold piping on every edge, goldDeep shadow rods beside ----
  const R = 0.003;
  const SR = 0.002;
  const midX = CX;
  const midY = (Y0 + Y1) / 2;
  for (const y of [Y0, Y1])
    for (const z of [Z0, Z1]) {
      const iy = y === Y0 ? 1 : -1;
      const iz = z === Z0 ? 1 : -1;
      cyl(R, X1 - X0, 6, [midX, y + iy * R, z + iz * R], "x", P.goldBright);
      cyl(SR, X1 - X0 - 0.01, 6, [midX, y - iy * 0.0005, z + iz * 0.0065], "x", P.goldDeep);
      cyl(SR, X1 - X0 - 0.01, 6, [midX, y + iy * 0.0065, z - iz * 0.0005], "x", P.goldDeep);
    }
  for (const x of [X0, X1])
    for (const z of [Z0, Z1]) {
      const ix = x === X0 ? 1 : -1;
      const iz = z === Z0 ? 1 : -1;
      cyl(R, Y1 - Y0, 6, [x + ix * R, midY, z + iz * R], "y", P.goldBright);
      cyl(SR, Y1 - Y0 - 0.01, 6, [x - ix * 0.0005, midY, z + iz * 0.0065], "y", P.goldDeep);
      if (z !== Z1) cyl(SR, Y1 - Y0 - 0.01, 6, [x + ix * 0.0065, midY, z - iz * 0.0005], "y", P.goldDeep);
    }
  for (const x of [X0, X1])
    for (const y of [Y0, Y1]) {
      const ix = x === X0 ? 1 : -1;
      const iy = y === Y0 ? 1 : -1;
      cyl(R, Z1 - Z0, 6, [x + ix * R, y + iy * R, 0], "z", P.goldBright);
      cyl(SR, Z1 - Z0 - 0.01, 6, [x - ix * 0.0005, y + iy * 0.0065, 0], "z", P.goldDeep);
      cyl(SR, Z1 - Z0 - 0.01, 6, [x + ix * 0.0065, y - iy * 0.0005, 0], "z", P.goldDeep);
    }

  // ---- rhinestones on the 8 corners ----
  for (let xi = 0; xi < 2; xi++)
    for (let yi = 0; yi < 2; yi++)
      for (let zi = 0; zi < 2; zi++) {
        const x = xi ? X1 : X0;
        const y = yi ? Y1 : Y0;
        const z = zi ? Z1 : Z0;
        const col = (xi + yi + zi) % 2 ? P.rhinestoneRose : P.rhinestoneBlue;
        gem([x + (xi ? -0.002 : 0.002), y + (yi ? -0.002 : 0.002), z + (zi ? -0.002 : 0.002)], col, 0.0085);
      }

  // ---- rubber feet (sunk into the bottom) ----
  for (const x of [-0.32, -0.17])
    for (const z of [-0.12, 0.12]) cyl(0.014, 0.012, 8, [x, 0.006, z], "y", P.black);

  // ---- front grille: gold rim, fan slats, rosette ----
  const rimZ = 0.148;
  cyl(0.002, RX1 - RX0 + 0.004, 6, [GX, RY1 + 0.002, rimZ], "x", P.goldBright);
  cyl(0.002, RX1 - RX0 + 0.004, 6, [GX, RY0 - 0.002, rimZ], "x", P.goldBright);
  cyl(0.002, RY1 - RY0 + 0.004, 6, [RX0 - 0.002, 0.27, rimZ], "y", P.goldBright);
  cyl(0.002, RY1 - RY0 + 0.004, 6, [RX1 + 0.002, 0.27, rimZ], "y", P.goldBright);

  const OX = GX;
  const OY = 0.052;
  const halfW = 0.0765;
  const topY = 0.4855;
  const N = 13;
  for (let i = 0; i < N; i++) {
    const a = ((i - 6) * 11.5 * Math.PI) / 180;
    const sa = Math.sin(a);
    const ca = Math.cos(a);
    const tx = Math.abs(sa) > 1e-4 ? halfW / Math.abs(sa) : 9;
    const ty = (topY - OY) / ca;
    const r1 = Math.min(tx, ty) - 0.001;
    const r0 = 0.035;
    const len = r1 - r0;
    const mid = (r0 + r1) / 2;
    if (i % 2 === 0) {
      const sg = new THREE.CylinderGeometry(0.0033, 0.0033, len, 6);
      put(sg, P.goldDeep, [OX + sa * mid + 0.0025, OY + ca * mid - 0.0025, 0.1405], [0, 0, -a]);
    }
    const g = new THREE.CylinderGeometry(0.0028, 0.0028, len, 6);
    put(g, P.goldBright, [OX + sa * mid, OY + ca * mid, 0.1425], [0, 0, -a]);
  }

  const RCX = GX;
  const RCY = 0.27;
  const discs: [number, string, number][] = [
    [0.05, P.goldDeep, 0.145],
    [0.044, P.goldBright, 0.1475],
    [0.036, P.goldDeep, 0.1495],
    [0.03, P.goldBright, 0.151],
    [0.02, P.goldDeep, 0.152],
    [0.012, P.goldBright, 0.1535],
  ];
  for (const [r, col, z] of discs) cyl(r, 0.003, 10, [RCX, RCY, z], "z", col);
  for (let i = 0; i < 10; i++) {
    const t = (i / 10) * Math.PI * 2;
    cyl(0.0035, 0.003, 6, [RCX + Math.cos(t) * 0.04, RCY + Math.sin(t) * 0.04, 0.1515], "z", P.goldBright);
  }
  cyl(0.009, 0.002, 10, [RCX, RCY, 0.155], "z", P.goldBright);
  gem([RCX, RCY, 0.1585], P.rhinestoneBlue, 0.0075, 0.8);

  // ---- nameplate BELLINI ----
  const NY = 0.029;
  boxR(GX - 0.046, GX + 0.046, NY - 0.012, NY + 0.012, 0.152, 0.1545, P.labelCream);
  boxR(GX - 0.047, GX + 0.047, NY + 0.012, NY + 0.0135, 0.152, 0.1555, P.goldBright);
  boxR(GX - 0.047, GX + 0.047, NY - 0.0135, NY - 0.012, 0.152, 0.1555, P.goldBright);
  boxR(GX - 0.047, GX - 0.0455, NY - 0.012, NY + 0.012, 0.152, 0.1555, P.goldBright);
  boxR(GX + 0.0455, GX + 0.047, NY - 0.012, NY + 0.012, 0.152, 0.1555, P.goldBright);
  const GL: Record<string, string[]> = {
    B: ["110", "101", "110", "101", "110"],
    E: ["111", "100", "110", "100", "111"],
    L: ["100", "100", "100", "100", "111"],
    I: ["111", "010", "010", "010", "111"],
    N: ["101", "111", "111", "101", "101"],
  };
  const px = 0.0027;
  const word = "BELLINI";
  const startX = GX - (27 * px) / 2;
  for (let li = 0; li < word.length; li++) {
    const rows = GL[word[li]];
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 3; c++)
        if (rows[r][c] === "1")
          box(px, px, 0.001, [startX + li * 4 * px + c * px + px / 2, NY + (2 - r) * px, 0.155], P.black);
  }
  gemFront(GX - 0.062, NY, 0.152, P.rhinestoneBlue);
  gemFront(GX + 0.062, NY, 0.152, P.rhinestoneRose);
  gemFront(GX, 0.5135, 0.152, P.rhinestoneRose);

  // ---- top: chrome register switch bank + master switch ----
  const [TSX, , TSZ] = M.trebleTopSwitches;
  boxR(TSX - 0.06, TSX + 0.06, Y1, Y1 + 0.004, TSZ - 0.025, TSZ + 0.025, P.chrome);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) cyl(0.0017, 0.0012, 6, [TSX + sx * 0.0575, Y1 + 0.0044, TSZ + sz * 0.0225], "y", P.chromeDark);
  for (let i = 0; i < 6; i++) {
    const x = TSX + (i - 2.5) * 0.0185;
    box(0.0145, 0.0008, 0.024, [x, Y1 + 0.0044, TSZ], P.chromeDark);
    box(0.011, 0.004, 0.018, [x, Y1 + 0.0064, TSZ], P.pearlWhite, [0.2, 0, 0]);
    cyl(0.0017, 0.0012, 6, [x, Y1 + 0.0097, TSZ - 0.0055], "y", P.goldBright);
  }
  const MZ = TSZ + 0.075;
  boxR(TSX - 0.017, TSX + 0.017, Y1, Y1 + 0.007, MZ - 0.013, MZ + 0.013, P.chrome);
  box(0.03, 0.0008, 0.012, [TSX, Y1 + 0.0074, MZ], P.chromeDark);
  box(0.024, 0.008, 0.014, [TSX, Y1 + 0.0105, MZ], P.pearlWhite, [0.25, 0, 0]);
  cyl(0.0024, 0.0014, 6, [TSX, Y1 + 0.0158, MZ - 0.0065], "y", P.goldBright);

  // ---- back: serial plate and strap hook base plates ----
  const SY = 0.27;
  boxR(GX - 0.036, GX + 0.036, SY - 0.018, SY + 0.018, Z0 - 0.003, Z0, P.goldDeep);
  boxR(GX - 0.036, GX + 0.036, SY + 0.0165, SY + 0.018, Z0 - 0.0035, Z0, P.goldBright);
  boxR(GX - 0.036, GX + 0.036, SY - 0.018, SY - 0.0165, Z0 - 0.0035, Z0, P.goldBright);
  for (let i = 0; i < 3; i++) box(0.05 - i * 0.01, 0.0015, 0.001, [GX - 0.004, SY + 0.007 - i * 0.0065, Z0 - 0.0035], P.black);
  for (const s of [-1, 1]) cyl(0.002, 0.0012, 6, [GX + s * 0.0305, SY, Z0 - 0.0033], "z", P.goldBright);

  for (const m of [M.shoulderStrapTopA, M.shoulderStrapTopB]) {
    const [hx, , hz] = m;
    boxR(hx - 0.017, hx + 0.017, Y1, Y1 + 0.0045, hz - 0.013, hz + 0.013, P.chrome);
    boxR(hx - 0.008, hx + 0.008, Y1 + 0.0045, Y1 + 0.0105, hz - 0.004, hz + 0.004, P.chromeDark);
    for (const s of [-1, 1]) cyl(0.0017, 0.0012, 6, [hx + s * 0.0125, Y1 + 0.0051, hz], "y", P.chromeDark);
  }
  for (const m of [M.shoulderStrapBottomA, M.shoulderStrapBottomB]) {
    const [hx, hy] = m;
    boxR(hx - 0.017, hx + 0.017, hy - 0.013, hy + 0.013, Z0 - 0.0045, Z0, P.chrome);
    boxR(hx - 0.008, hx + 0.008, hy - 0.004, hy + 0.004, Z0 - 0.0105, Z0 - 0.0045, P.chromeDark);
    for (const s of [-1, 1]) cyl(0.0017, 0.0012, 6, [hx + s * 0.0125, hy, Z0 - 0.0051], "z", P.chromeDark);
  }

  // ---- flush merged geometry, one part per colour ----
  for (const [color, list] of groups) {
    const merged = mergeGeometries(list);
    if (!merged) continue;
    b.part(merged, color, { at: [0, 0, 0], flat: true, name: `trebleCase.${color.replace("#", "")}` });
  }
}
```