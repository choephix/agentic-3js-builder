<!-- call: plan -->

```json
{
  "name": "Pandoran Lumen Bloom",
  "description": "A bioluminescent alien plant in the Avatar/Pandora style: an S-curved indigo stalk with glowing veins, a crown of eight arching veined fronds, hanging glowing tendrils and pods, and a ring of spiral fan flowers at its base.",
  "builderName": "pandoranLumenBloom",
  "size": [2.8, 3.2, 2.8],
  "layout": "A tall S-curved stalk stands at x=0,z=0 and rises from a flared root buttress at y=0 to a crown cup at y≈2.55. Eight broad leaf fronds radiate from the crown at 45° steps, rise to about y=3.1 and arch outward and down, so the canopy is about 2.8 m wide. A spiky central bud glows above the crown. Under the canopy, 10 glowing tendrils with bulb tips hang from a ring around the upper stalk, with 6 glowing seed pods on short stems at radius ~0.9. Five helicoradian spiral-fan plants form a front-biased arc at the base (+Z side) on short stems 0.5 to 0.9 m tall. Their glowing spiral fans can be opened or closed. Colours follow Pandora: a deep indigo-teal body lit by cyan, teal, violet, magenta and lime glow. Every glow colour (names starting 'glow' or 'spore') is wrapped in glow() from the glow kit, so the glowing parts read as self-lit against the dark body. The style shows as bulbous rounded masses ending in sharp tips, rows of small glowing dots along veins and edges, and a root-to-tip colour shift from dark indigo to bright teal to a glowing cyan edge. Dark body parts never glow. Glow is built as small parts seated on the surface: vein sweeps, dots, rings, edge trims. No ground, rocks or props anywhere.",
  "palette": {
    "ink": "#0a1020",
    "trunkDark": "#1a2540",
    "trunkMid": "#2a4263",
    "trunkLight": "#3d6a88",
    "rootDark": "#141a2c",
    "rootMid": "#27304f",
    "moss": "#1e5a4a",
    "mossLight": "#33966e",
    "leafDeep": "#0e3550",
    "leafMid": "#17788a",
    "leafTip": "#3bd0c2",
    "podShell": "#34276a",
    "podMid": "#6347c2",
    "glowCyan": "#35f3ff",
    "glowTeal": "#2ee6c0",
    "glowViolet": "#b06cff",
    "glowMagenta": "#ff4fd8",
    "glowPink": "#ffa0ea",
    "glowLime": "#a8ff5c",
    "sporeWhite": "#e8fffc"
  },
  "mounts": {
    "base": [0, 0.1, 0],
    "stalk1": [0.06, 0.8, 0],
    "stalk2": [0.12, 1.5, 0.04],
    "stalk3": [0, 2.1, 0.1],
    "crown": [0, 2.55, 0.12],
    "crownRim": [0, 2.6, 0.12],
    "tendrilRing": [0, 2.3, 0.12],
    "rootCollar": [0, 0.55, 0],
    "fanArc": [0, 0, 0.8],
    "budTop": [0, 3.15, 0.12]
  },
  "joints": [
    { "name": "base", "at": [0, 0.1, 0], "dir": [0.05, 1, 0], "role": "spine", "group": "stalk" },
    { "name": "stalk1", "parent": "base", "at": [0.06, 0.8, 0], "dir": [0.05, 1, 0.03], "role": "spine", "group": "stalk" },
    { "name": "stalk2", "parent": "stalk1", "at": [0.12, 1.5, 0.04], "dir": [-0.1, 1, 0.05], "role": "spine", "group": "stalk" },
    { "name": "stalk3", "parent": "stalk2", "at": [0, 2.1, 0.1], "dir": [0, 1, 0.05], "role": "spine", "group": "stalk" },
    { "name": "crown", "parent": "stalk3", "at": [0, 2.55, 0.12], "dir": [0, 1, 0], "role": "head", "group": "stalk" },
    { "name": "frondA", "parent": "crown", "at": [0, 2.6, 0.32], "dir": [0, 0.45, 0.9], "role": "arm", "group": "fronds" },
    { "name": "frondB", "parent": "crown", "at": [0.14, 2.6, 0.26], "dir": [0.63, 0.45, 0.63], "role": "arm", "group": "fronds" },
    { "name": "frondC", "parent": "crown", "at": [0.2, 2.6, 0.12], "dir": [0.9, 0.45, 0], "role": "arm", "group": "fronds" },
    { "name": "frondD", "parent": "crown", "at": [0.14, 2.6, -0.02], "dir": [0.63, 0.45, -0.63], "role": "arm", "group": "fronds" },
    { "name": "frondE", "parent": "crown", "at": [0, 2.6, -0.08], "dir": [0, 0.45, -0.9], "role": "arm", "group": "fronds" },
    { "name": "frondF", "parent": "crown", "at": [-0.14, 2.6, -0.02], "dir": [-0.63, 0.45, -0.63], "role": "arm", "group": "fronds" },
    { "name": "frondG", "parent": "crown", "at": [-0.2, 2.6, 0.12], "dir": [-0.9, 0.45, 0], "role": "arm", "group": "fronds" },
    { "name": "frondH", "parent": "crown", "at": [-0.14, 2.6, 0.26], "dir": [-0.63, 0.45, 0.63], "role": "arm", "group": "fronds" },
    { "name": "helixA", "parent": "base", "at": [-1.0, 0.05, 0.55], "dir": [-0.15, 1, 0.1], "role": "fan", "group": "helix" },
    { "name": "helixB", "parent": "base", "at": [-0.55, 0.05, 0.95], "dir": [-0.05, 1, 0.15], "role": "fan", "group": "helix" },
    { "name": "helixC", "parent": "base", "at": [0.0, 0.05, 1.1], "dir": [0, 1, 0.2], "role": "fan", "group": "helix" },
    { "name": "helixD", "parent": "base", "at": [0.55, 0.05, 0.95], "dir": [0.05, 1, 0.15], "role": "fan", "group": "helix" },
    { "name": "helixE", "parent": "base", "at": [1.0, 0.05, 0.55], "dir": [0.15, 1, 0.1], "role": "fan", "group": "helix" }
  ],
  "parts": [
    {
      "id": "rootBase",
      "builds": "The flared root buttress and ground contact. Four to six thick buttress roots sweep out from rootCollar to the floor and curl outward, in rootDark with rootMid highlights, each ending in a pointed tip that touches y=0. Small low moss patches (moss with mossLight tops) grow on the upward faces of the roots, and a few short surface rootlets reach out. Glowing veins (glowTeal sweeps, with rows of small glowCyan dots seated along the roots) run from the stalk base down each root and fade toward the tips. A dark knobbly collar ring around the stalk at rootCollar overlaps the trunk's base. Roots stay within radius ~1.3 and leave the front arc (z>0.5) mostly free for the helicoradians. Rides joint base.",
      "box": [[-1.3, 0, -1.3], [1.3, 0.75, 1.1]],
      "attaches": "Covers the trunk's bottom at mount base and rootCollar. The trunk starts at y=0.5 inside the collar.",
      "joints": ["base"],
      "floor": true,
      "budget": 170
    },
    {
      "id": "stalk",
      "builds": "The S-curved main stalk and crown cup, as one skinned sweep or loft over the chain base, stalk1, stalk2, stalk3, crown through mounts base, stalk1, stalk2, stalk3, crown. Radius is about 0.36 at y=0.5, narrows to about 0.15 near y=1.5, swells slightly at stalk3 and flares into a cupped crown (lathe or flared loft with a lip at y≈2.6, radius ~0.34). The body is trunkDark with trunkMid lengthwise ridge bands and trunkLight highlights on the sun side. Raised knuckle rings (bulging nodes) at stalk1 and stalk2 are trunkMid. Glowing veins: three or four glowCyan and glowTeal thin sweeps spiral around the stalk, dotted with small round glowTeal beads at the knuckles, so the glow is brightest at the crown and fades toward the base. The crown cup has a glowViolet inner rim ring and a glowMagenta dot ring just below the lip. Stalk-mounted details are a few small leaf-scale bumps (leafDeep) and a couple of moss tufts at the lower trunk. No fronds, tendrils or roots here.",
      "box": [[-0.55, 0.45, -0.5], [0.55, 2.75, 0.6]],
      "attaches": "Starts inside the root collar at rootCollar (y≈0.5). The crown cup at crown and crownRim carries the frond roots and the bud. The tendrilRing sits on the stalk at y≈2.3, and tendril chains parent to stalk3.",
      "joints": ["base", "stalk1", "stalk2", "stalk3", "crown"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "fronds",
      "builds": "The canopy: eight broad, arching leaf fronds on joints frondA to frondH (each frond a 3 to 4 joint chain parented to its joint, named like frondA1..frondA3, role arm, group fronds) plus the central bud. Each frond is about 1.3 to 1.45 m long. It rises from crownRim, climbs to about y=3.1 around 40% of its length, then arches outward and droops to a pointed tip near y≈2.3. It is a wide lance or leaf shape (extruded or swept membrane, about 0.5 m at the widest, pointed tip with a slight curl) with flat colours by section: leafDeep at the root, leafMid in the middle, leafTip near the tip. Front and back faces differ: leafMid on top, leafDeep under with violet-tinged underside. Each frond has a raised midrib sweep (trunkLight) with a glowCyan vein line on top, 4 to 5 pairs of side veins in glowTeal branching toward the edge, and a thin glowCyan edge trim sweep. Rows of tiny glowLime or glowCyan dots seat along the veins, and each tip ends in a bright glowPink or glowCyan bead. Alternate fronds A, C, E, G with glowViolet vein accents and the others with glowTeal, so the canopy shifts colour around it. The central bud is a spiky closed-petal cone (5 to 7 overlapping pointed petals in leafMid and leafTip with glowMagenta tips), rising from the crown at crown to budTop (y≈3.15), with a glowPink core sphere showing between the petals and a few floating sporeWhite motes near it. Fronds are the hero silhouette: keep them readable and sharp-tipped.",
      "box": [[-1.4, 2.2, -1.3], [1.4, 3.2, 1.5]],
      "attaches": "Frond roots start at the crown cup at crownRim and the frondA to frondH joints, parented to crown. The bud sits on crown at the cup's centre.",
      "joints": ["crown", "frondA", "frondB", "frondC", "frondD", "frondE", "frondF", "frondG", "frondH"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "tendrilsPods",
      "builds": "Hanging bioluminescent growth under the canopy, in the style of the Tree of Voices. 10 tendrils form a ring at tendrilRing (radius ~0.4 around the stalk at y≈2.3, parented to stalk3), each a 4 joint chain named tendril0..tendril9 plus joint index (role tentacle, group tendrils). Each hangs 1.0 to 1.5 m, drifting outward to radius 0.6 to 1.1, with lengths varied, never below y=0.95. Each is a thin tapered sweep (trunkMid at the root to leafMid at the tip) with a glowing spiral thread: alternating glowCyan and glowViolet beads along its length, and a bulb (a small icosphere with a ring of tiny sporeWhite dots) at its tip in glowTeal or glowMagenta. Six seed pods hang on short curved stems at radius ~0.9 and y 1.6 to 2.2: each a rounded teardrop in podShell with podMid lengthwise ribs, a glowing slit (glowMagenta or glowLime) down its front and a cap ring in trunkDark. Glow-spore motes (small sporeWhite and glowCyan low-poly spheres, 20 to 30 of them) drift in the airy space between tendrils at various heights between y=1.0 and y=2.6. Roots attach at the stalk ring, so a small trunkMid collar ring with glowViolet dots sits on the stalk at tendrilRing.",
      "box": [[-1.25, 0.9, -1.25], [1.25, 2.45, 1.25]],
      "attaches": "The tendril roots sit on the stalk at tendrilRing (mount, on joint stalk3). Pod stems start from fronds' undersides near radius 0.8 or from the tendril ring. Nothing touches the floor.",
      "joints": ["stalk3"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "helicoradians",
      "builds": "Five Helicoradian-style spiral-fan plants in a front arc at the base, on joints helixA to helixE (each a 2 to 3 joint chain parented to its joint: helixA1.., role fan, group helix). Positions run along fanArc, from the left rear (-1.0,0.55) round the front (0,1.1) to (1.0,0.55). Each has a slim curved trunkMid stem 0.45 to 0.9 m tall (helixC the tallest at ~0.9 m, the outer ones shorter) with a bulb base in moss at the floor. At the top is a spiral fan: 10 to 14 thin feathery filament blades (swept thin tapered tubes or small extruded leaves) arranged in a spiral on a ring, tilted outward like a cone. Colour runs root to tip as leafDeep, leafMid and glowTeal at the tips, and each filament ends in a bead (glowCyan, glowViolet, glowMagenta or glowLime, a different dominant colour on each plant). A glowing glowPink centre bud sits at the middle of the fan. Fans are about 0.3 to 0.45 m across, shown open. A few small ground sprouts (stubby cones in moss with a glowLime tip, 6 to 8 of them) fill gaps between the plants, and moss tufts sit at the stem bases. Everything rests on the floor (stem bases touch y=0). Keep the roots' area free, so these sit in front of the buttress roots.",
      "box": [[-1.3, 0, 0.3], [1.3, 1.15, 1.4]],
      "attaches": "Stem bases meet the floor in front of the buttress roots, parented to base. Nothing is built above y=1.15. The tallest fan stays below the tendrils' lowest point (y≈0.95 at radius 0.6 to 1.1), so keep fan tops at or below y=1.1 and their footprint at z≥0.3.",
      "joints": ["base", "helixA", "helixB", "helixC", "helixD", "helixE"],
      "floor": true,
      "budget": 170
    }
  ]
}
```

<!-- call: stalk -->

```ts
import * as THREE from "three";
import { catmull, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildStalk({ b, J, P, M }: any) {
  const r = rng(11);
  const pts = [M.base, M.stalk1, M.stalk2, M.stalk3, M.crown].map((p: number[]) => [p[0], p[1], p[2]]);
  pts[0] = [0, 0.45, 0];
  const path = catmull(pts);
  const bones = [J.base, J.stalk1, J.stalk2, J.stalk3, J.crown];
  const rad = [0.36, 0.3, 0.2, 0.15, 0.17, 0.2, 0.2];
  const tube = b.sweep(path, rad, {
    bone: bones,
    color: P.trunkDark,
    sides: 10,
    caps: "flat",
    sectors: [
      [-30, 30, P.trunkLight],
      [60, 100, P.trunkMid],
      [260, 300, P.trunkMid],
    ],
  });

  // knuckle rings
  for (const [t, j] of [[0.3, J.stalk1], [0.6, J.stalk2]] as any) {
    const at = tube.at(t);
    b.part(new THREE.TorusGeometry(0.2, 0.05, 6, 12), P.trunkMid, {
      at: at.at, dir: at.tangent, axis: "z", bone: j, scale: [1, 1, 1],
    });
  }

  // crown cup
  const c = M.crown;
  b.lathe(
    [[0, 0], [0.16, 0], [0.26, 0.1], [0.34, 0.22], [0.32, 0.24], [0.22, 0.12], [0.1, 0.06], [0, 0.06]],
    { at: [c[0], c[1] - 0.1, c[2]], bone: J.crown, color: P.trunkMid, segments: 12 },
  );
  glow(b.part(new THREE.TorusGeometry(0.31, 0.025, 5, 16), P.glowViolet, {
    at: [c[0], c[1] + 0.12, c[2]], dir: [0, 1, 0], axis: "z", bone: J.crown,
  }), 1.4);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    glow(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.glowMagenta, {
      at: [c[0] + Math.cos(a) * 0.325, c[1] + 0.03, c[2] + Math.sin(a) * 0.325], bone: J.crown,
    }), 1.5);
  }

  // spiral glowing veins
  const cols = [P.glowCyan, P.glowTeal, P.glowCyan, P.glowTeal];
  for (let k = 0; k < 4; k++) {
    const vp: number[][] = [];
    for (let i = 0; i <= 24; i++) {
      const t = 0.08 + (i / 24) * 0.9;
      const s = tube.at(t, ((k * 90 + t * 540) % 360));
      vp.push([s.at.x + s.n.x * 0.008, s.at.y + s.n.y * 0.008, s.at.z + s.n.z * 0.008]);
    }
    const vein = catmull(vp);
    glow(b.sweep(vein, [0.006, 0.014], { color: cols[k], sides: 4, bone: bones }), 1.2);
    for (let i = 0; i < 9; i++) {
      const t = 0.1 + (i / 8) * 0.88;
      const s = vein.at(t);
      glow(b.part(new THREE.SphereGeometry(0.012 + t * 0.012, 5, 4), cols[k], { at: s, bone: bones[Math.min(4, Math.floor(t * 5))] }), 1.4);
    }
  }

  // knuckle beads
  for (const t of [0.3, 0.6]) {
    for (let i = 0; i < 6; i++) {
      const s = tube.at(t, i * 60 + 30, 0.045);
      glow(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.glowTeal, { at: s.at, bone: t < 0.45 ? J.stalk1 : J.stalk2 }), 1.4);
    }
  }

  // leaf-scale bumps
  for (let i = 0; i < 6; i++) {
    const t = 0.15 + r() * 0.7;
    const s = tube.at(t, r() * 360);
    b.stick(new THREE.ConeGeometry(0.04, 0.09, 5), P.leafDeep, s, { embed: 0.3 });
  }
  // moss tufts at the lower trunk
  for (let i = 0; i < 4; i++) {
    const s = tube.at(0.05 + r() * 0.1, i * 90 + 20);
    b.stick(new THREE.ConeGeometry(0.05, 0.1, 5), P.moss, s, { embed: 0.2 });
    b.stick(new THREE.ConeGeometry(0.025, 0.07, 5), P.mossLight, s, { embed: 0.1 });
  }
}
```

<!-- call: rootBase -->

```ts
import * as THREE from "three";
import { rng, catmull, glow } from "agentic-3js-builder";
import { glow as glowKit } from "agentic-3js-builder/kits/glow";

export function buildRootBase({ b, J, P, M }: Ctx) {
  const bone = J.base;
  const R = rng(11);
  const g = glowKit ?? glow;
  const N = 5;
  const angles = [0.35, 1.35, 2.5, 3.7, 4.9].map((a, i) => a + (i === 1 ? 0.3 : 0) + (i === 2 ? 0.7 : 0));
  // Root directions biased away from +Z front (z>0.5)
  const dirs = [
    [1, 0.1], [0.55, -0.85], [-0.6, -0.8], [-1, 0.15], [0.05, -1],
  ];
  const ST = 0.3;

  // collar: knobbly ring
  b.part(new THREE.CylinderGeometry(0.42, 0.5, 0.2, 10), P.rootDark, { bone, at: [0, 0.5, 0], flat: true });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const r = 0.46 + R() * 0.04;
    b.part(new THREE.IcosahedronGeometry(0.075 + R() * 0.03, 0), i % 2 ? P.rootMid : P.rootDark, {
      bone, at: [Math.cos(a) * r, 0.52 + R() * 0.08, Math.sin(a) * r], flat: true,
    });
  }
  g(b.part(new THREE.TorusGeometry(0.46, 0.012, 5, 20), P.glowTeal, { bone, at: [0, 0.62, 0], rotation: [90, 0, 0] }), 1.2);

  dirs.forEach(([dx, dz], i) => {
    const l = Math.hypot(dx, dz);
    const ux = dx / l, uz = dz / l;
    const len = 1.0 + R() * 0.2;
    const pts = [
      [ux * 0.2, 0.62, uz * 0.2],
      [ux * 0.45, 0.5, uz * 0.45],
      [ux * 0.75, 0.24, uz * 0.75],
      [ux * (len + 0.1), 0.03, uz * (len + 0.1)],
    ];
    const path = catmull(pts);
    b.sweep(path, [0.16, 0.012], { bone, color: P.rootDark, sides: 7, caps: { start: "round", end: "point" } });
    // highlight ridge
    b.sweep(path.slice(0.05, 0.8), [0.05, 0.01], { bone, color: P.rootMid, sides: 5, caps: "round" });
    // glowing vein on top
    const vein = catmull(pts.map((p, k) => [p[0], p[1] + 0.12 - k * 0.025, p[2]]));
    g(b.sweep(vein.slice(0.05, 0.85), [0.016, 0.004], { bone, color: P.glowTeal, sides: 5 }), 1.3);
    for (let k = 0; k < 7; k++) {
      const t = 0.12 + k * 0.1;
      const p = path.at(t);
      const rr = 0.16 * (1 - t) + 0.02;
      g(b.part(new THREE.SphereGeometry(0.014, 5, 4), P.glowCyan, { bone, at: [p.x, p.y + rr * 0.95, p.z] }), 1.4);
    }
    // moss
    for (let k = 0; k < 3; k++) {
      const t = 0.25 + k * 0.2;
      const p = path.at(t);
      const rr = 0.16 * (1 - t) + 0.02;
      b.part(new THREE.SphereGeometry(0.06 - k * 0.01, 6, 4), P.moss, {
        bone, at: [p.x + (R() - 0.5) * 0.05, p.y + rr * 0.7, p.z + (R() - 0.5) * 0.05], scale: [1, 0.4, 1], flat: true,
      });
      b.part(new THREE.SphereGeometry(0.03, 5, 3), P.mossLight, {
        bone, at: [p.x, p.y + rr * 0.7 + 0.02, p.z], scale: [1, 0.5, 1], flat: true,
      });
    }
    // rootlet
    const side = i % 2 ? 1 : -1;
    const q = path.at(0.6);
    const rl = catmull([
      [q.x, q.y, q.z],
      [q.x - uz * side * 0.15, q.y - 0.04, q.z + ux * side * 0.15],
      [q.x - uz * side * 0.3, 0.02, q.z + ux * side * 0.3],
    ]);
    b.sweep(rl, [0.035, 0.005], { bone, color: P.rootMid, sides: 5, caps: "point" });
  });

  // veins running down trunk base
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    g(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.glowCyan, {
      bone, at: [Math.cos(a) * 0.5, 0.6, Math.sin(a) * 0.5],
    }), 1.4);
  }
}
```

<!-- call: helicoradians -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHelicoradians({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const plants = [
    { j: "helixA", h: 0.5, glowC: P.glowCyan, lean: [-0.08, 0.04] },
    { j: "helixB", h: 0.7, glowC: P.glowViolet, lean: [-0.04, 0.05] },
    { j: "helixC", h: 0.9, glowC: P.glowMagenta, lean: [0, 0.08] },
    { j: "helixD", h: 0.7, glowC: P.glowLime, lean: [0.04, 0.05] },
    { j: "helixE", h: 0.5, glowC: P.glowCyan, lean: [0.08, 0.04] },
  ];
  const sph = (r: number, w = 6, h = 4) => new THREE.SphereGeometry(r, w, h);
  const tuft = (x: number, z: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + R();
      const dx = Math.cos(a) * 0.05, dz = Math.sin(a) * 0.05;
      b.spike([x + dx, 0, z + dz], [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5], 0.09 + R() * 0.05, 0.016, {
        color: i % 2 ? P.moss : P.mossLight, bone: J.base,
      });
    }
  };
  for (const p of plants) {
    const jt = J[p.j];
    const bx = jt.at.x, bz = jt.at.z;
    const top: [number, number, number] = [bx + p.lean[0] * p.h * 3, p.h, bz + p.lean[1] * p.h * 3];
    const mid: [number, number, number] = [bx + p.lean[0] * p.h * 1.2 + 0.04, p.h * 0.5, bz + p.lean[1] * p.h];
    const stemPath = [[bx, 0.06, bz], mid, top];
    const stem = b.chain(p.j + "S", stemPath as any, { parent: jt, names: [p.j + "1", p.j + "2", p.j + "3"], role: "fan", group: "helix" });
    b.sweep(stem, [0.035, 0.018], { color: P.trunkMid });
    // bulb base in moss
    b.part(sph(0.08, 8, 6), P.moss, { bone: jt, at: [bx, 0.06, bz], scale: [1, 0.8, 1] });
    b.part(sph(0.05, 6, 4), P.mossLight, { bone: jt, at: [bx, 0.12, bz], scale: [1, 0.6, 1] });
    tuft(bx, bz, 4);
    // glow dots on stem
    for (let i = 1; i < 4; i++) {
      const t = i / 4;
      const y = p.h * t;
      glow(b.part(sph(0.012, 5, 3), P.glowTeal, {
        bone: jt, at: [mid[0] + (top[0] - mid[0]) * Math.max(0, t - 0.5) * 2 * 0.5 + 0.03, y, bz + p.lean[1] * y],
      }), 1);
    }
    // fan
    const n = 12;
    const c = new THREE.Vector3(...top);
    const tipBone = stem.tip ?? stem.joints[stem.joints.length - 1];
    for (let i = 0; i < n; i++) {
      const a = i * 2.4 + 0.3; // spiral phase
      const rr = 0.04 + (i / n) * 0.03;
      const dx = Math.cos(a), dz = Math.sin(a);
      const base: [number, number, number] = [c.x + dx * rr, c.y + 0.01, c.z + dz * rr];
      const len = 0.17 + (i % 3) * 0.02;
      const tip: [number, number, number] = [c.x + dx * (rr + len), c.y + 0.1 + len * 0.45, c.z + dz * (rr + len)];
      const ctl: [number, number, number] = [c.x + dx * (rr + len * 0.4), c.y + 0.1 + len * 0.45, c.z + dz * (rr + len * 0.4)];
      const bl = b.sweep([base, ctl, tip] as any, [0.011, 0.003], {
        bone: tipBone, color: (t: number) => (t < 0.35 ? P.leafDeep : t < 0.7 ? P.leafMid : P.glowTeal),
      });
      glow(bl, 0.6);
      glow(b.part(sph(0.016, 6, 4), p.glowC, { bone: tipBone, at: tip }), 1.4);
    }
    glow(b.part(sph(0.04, 7, 5), P.glowPink, { bone: tipBone, at: [c.x, c.y + 0.045, c.z] }), 1.5);
    b.part(new THREE.CylinderGeometry(0.05, 0.03, 0.03, 8), P.leafDeep, { bone: tipBone, at: [c.x, c.y, c.z] });
  }
  // ground sprouts
  const sp: [number, number][] = [[-0.8, 0.9], [-0.3, 0.7], [0.3, 0.65], [0.8, 0.95], [-0.25, 1.2], [0.3, 1.25], [1.2, 0.8]];
  for (const [x, z] of sp) {
    b.part(new THREE.ConeGeometry(0.05, 0.14, 6), P.moss, { bone: J.base, at: [x, 0.07 - 0.01, z] });
    glow(b.part(sph(0.015, 5, 3), P.glowLime, { bone: J.base, at: [x, 0.15, z] }), 1.3);
  }
  tuft(-0.4, 0.5, 3);
  tuft(0.45, 0.5, 3);
}
```

<!-- call: tendrilsPods -->

```ts
import * as THREE from "three";
import { catmull, glow, rng } from "agentic-3js-builder";
import { glow as glowKit } from "agentic-3js-builder/kits/glow";

export function buildTendrilsPods({ b, J, P, M }: any) {
  const R = rng(11);
  const g = (x: any, s = 1) => glowKit(x, s);
  const ringY = M.tendrilRing[1];
  const cz = M.tendrilRing[2];

  // collar ring on the stalk
  b.part(new THREE.CylinderGeometry(0.2, 0.22, 0.08, 10), P.trunkMid, { bone: J.stalk3, at: [0, ringY, cz] });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    g(b.part(new THREE.SphereGeometry(0.02, 6, 4), P.glowViolet, {
      bone: J.stalk3, at: [Math.sin(a) * 0.225, ringY + 0.02, cz + Math.cos(a) * 0.225],
    }));
  }

  // tendrils
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.15;
    const len = 1.0 + R() * 0.45;
    const out = 0.6 + R() * 0.5;
    const sx = Math.sin(a), sz = Math.cos(a);
    const pts: number[][] = [];
    for (let k = 0; k <= 4; k++) {
      const t = k / 4;
      const r = 0.3 + (out - 0.3) * Math.sin(t * Math.PI * 0.5);
      pts.push([sx * r, Math.max(1.0, ringY - 0.05 - len * t), cz + sz * r]);
    }
    const path = catmull(pts);
    const names = [0, 1, 2, 3].map((k) => `tendrilsPodsTendril${i}${k}`);
    const ch = b.chain(`tendrilsPodsT${i}`, path, { parent: J.stalk3, names, role: "tentacle", group: "tendrils" });
    const sw = b.sweep(ch, [0.03, 0.01], {
      color: (t: number) => (t < 0.5 ? P.trunkMid : P.leafMid),
    });
    void sw;
    for (let k = 1; k <= 7; k++) {
      const t = k / 8;
      const p = path.at(t);
      const s2 = 0.045 * (1 - t * 0.5);
      const ang = t * 9 + i;
      g(b.part(new THREE.SphereGeometry(0.02, 6, 4), k % 2 ? P.glowCyan : P.glowViolet, {
        bone: ch.joints[Math.min(3, Math.floor(t * 4))],
        at: [p.x + Math.cos(ang) * s2 * 0.6, p.y, p.z + Math.sin(ang) * s2 * 0.6],
      }));
    }
    const tip = path.at(1);
    const tb = ch.joints[3];
    g(b.part(new THREE.IcosahedronGeometry(0.065, 0), i % 2 ? P.glowMagenta : P.glowTeal, { bone: tb, at: [tip.x, tip.y - 0.04, tip.z] }));
    for (let k = 0; k < 6; k++) {
      const aa = (k / 6) * Math.PI * 2;
      g(b.part(new THREE.SphereGeometry(0.012, 5, 4), P.sporeWhite, {
        bone: tb, at: [tip.x + Math.cos(aa) * 0.075, tip.y - 0.04, tip.z + Math.sin(aa) * 0.075],
      }));
    }
  }

  // seed pods
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.5;
    const sx = Math.sin(a), sz = Math.cos(a);
    const y = 1.6 + R() * 0.6;
    const top = [sx * 0.7, y + 0.3, cz + sz * 0.7];
    const base = [sx * 0.9, y + 0.05, cz + sz * 0.9];
    b.sweep(catmull([[sx * 0.3, ringY + 0.1, cz + sz * 0.3], [sx * 0.55, ringY + 0.25, cz + sz * 0.55], top, base]), 0.012, {
      color: P.trunkMid, bone: J.stalk3,
    });
    const px = base[0], pz = base[2];
    const body = new THREE.SphereGeometry(0.1, 8, 6);
    b.part(body, P.podShell, { bone: J.stalk3, at: [px, y - 0.08, pz], scale: [1, 1.5, 1] });
    b.part(new THREE.ConeGeometry(0.06, 0.14, 8), P.podShell, { bone: J.stalk3, at: [px, y - 0.26, pz], rotation: [180, 0, 0] });
    b.part(new THREE.TorusGeometry(0.075, 0.015, 5, 10), P.trunkDark, { bone: J.stalk3, at: [px, y + 0.04, pz], rotation: [90, 0, 0] });
    for (let k = 0; k < 6; k++) {
      const aa = (k / 6) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(0.012, 0.22, 0.012), P.podMid, {
        bone: J.stalk3, at: [px + Math.sin(aa) * 0.095, y - 0.1, pz + Math.cos(aa) * 0.095],
      });
    }
    const fx = Math.sin(a), fz = Math.cos(a);
    g(b.part(new THREE.BoxGeometry(0.025, 0.2, 0.012), i % 2 ? P.glowMagenta : P.glowLime, {
      bone: J.stalk3, at: [px + fx * 0.105, y - 0.08, pz + fz * 0.105], rotation: [0, a * 57.3, 0],
    }));
  }

  // spore motes
  for (let i = 0; i < 26; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.3 + R() * 0.85;
    g(b.part(new THREE.IcosahedronGeometry(0.012 + R() * 0.012, 0), i % 2 ? P.sporeWhite : P.glowCyan, {
      bone: J.stalk3, at: [Math.sin(a) * r, 1.0 + R() * 1.6, cz + Math.cos(a) * r],
    }));
  }
}
```

<!-- call: fronds -->

```ts
import * as THREE from "three";
import { frame, rng, catmull, glow } from "agentic-3js-builder";
import { glow as glowKit } from "agentic-3js-builder/kits/glow";

export function buildFronds({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const G = (t: any, s = 1) => glowKit(t, s);
  const names = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const crownJ = J.crown;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  names.forEach((n, i) => {
    const ang = (i * Math.PI) / 4;
    const dx = Math.sin(ang);
    const dz = Math.cos(ang);
    const px = -dz;
    const pz = dx;
    const pt = (r: number, y: number) => V(dx * r, y, 0.12 + dz * r);
    const root = J["frond" + n];
    const pts = [pt(0.2, 2.6), pt(0.5, 2.95), pt(0.85, 3.08), pt(1.15, 2.85), pt(1.38, 2.35)];
    const path = catmull(pts);
    const ch = b.chain("frond" + n, path, {
      parent: root,
      names: [`frond${n}1`, `frond${n}2`, `frond${n}3`, `frond${n}4`],
      role: "arm",
      group: "fronds",
    });
    const accent = i % 2 === 0 ? P.glowViolet : P.glowTeal;
    // leaf blade as a wide flat loft
    const stations = [0, 0.15, 0.35, 0.55, 0.75, 0.92].map((t) => {
      const w = [0.1, 0.34, 0.5, 0.44, 0.24, 0.05][[0, 0.15, 0.35, 0.55, 0.75, 0.92].indexOf(t)];
      return { at: path.at(t), w, h: 0.02 };
    });
    const bands: [number, string][] = [
      [0.3, P.leafDeep],
      [0.7, P.leafMid],
      [1, P.leafTip],
    ];
    b.loft(stations, { bone: root, color: P.leafMid, group: "fronds" });
    // underside tint
    b.loft(
      stations.map((s) => ({ at: [s.at.x, s.at.y - 0.02, s.at.z] as any, w: s.w * 0.96, h: 0.015 })),
      { bone: root, color: "#2c2a6a", group: "fronds" },
    );
    // colour sections as overlays on top
    b.loft(
      stations.slice(0, 2).map((s) => ({ at: [s.at.x, s.at.y + 0.012, s.at.z] as any, w: s.w * 0.9, h: 0.012 })),
      { bone: root, color: P.leafDeep, group: "fronds" },
    );
    b.loft(
      stations.slice(4).map((s) => ({ at: [s.at.x, s.at.y + 0.012, s.at.z] as any, w: s.w * 0.9, h: 0.012 })),
      { bone: root, color: P.leafTip, group: "fronds" },
    );
    const top = (t: number, off = 0, lift = 0.03) => {
      const p = path.at(t);
      return V(p.x + px * off, p.y + lift, p.z + pz * off);
    };
    // midrib
    b.sweep(catmull(pts.map((p) => V(p.x, p.y + 0.03, p.z))), [0.022, 0.008], {
      bone: root,
      color: P.trunkLight,
      group: "fronds",
    });
    G(
      b.sweep(catmull([0.05, 0.3, 0.55, 0.8, 0.96].map((t) => top(t, 0, 0.05))), [0.01, 0.005], {
        bone: root,
        color: P.glowCyan,
        group: "fronds",
      }),
    );
    // side veins + dots
    [0.2, 0.35, 0.5, 0.65, 0.8].forEach((t, k) => {
      const wmax = [0.3, 0.45, 0.4, 0.3, 0.16][k];
      for (const s of [1, -1]) {
        const a = top(t, 0, 0.04);
        const m = top(t + 0.07, s * wmax * 0.55, 0.035);
        const e = top(t + 0.14, s * wmax, 0.02);
        G(b.sweep(catmull([a, m, e]), [0.007, 0.003], { bone: root, color: accent, group: "fronds" }));
        G(
          b.part(new THREE.SphereGeometry(0.014, 5, 4), i % 3 === 0 ? P.glowLime : P.glowCyan, {
            bone: root,
            at: m,
            group: "fronds",
          }),
        );
      }
    });
    // edge trim
    for (const s of [1, -1]) {
      const edge = [0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 0.96].map((t, k) => {
        const w = [0.2, 0.4, 0.5, 0.42, 0.28, 0.12, 0.02][k];
        return top(t, s * w * 0.95, 0.02);
      });
      G(b.sweep(catmull(edge), 0.007, { bone: root, color: P.glowCyan, group: "fronds" }));
    }
    // tip bead
    const tip = path.at(1);
    G(
      b.part(new THREE.IcosahedronGeometry(0.045, 0), i % 2 ? P.glowCyan : P.glowPink, {
        bone: root,
        at: [tip.x, tip.y - 0.02, tip.z],
        group: "fronds",
      }),
      1.5,
    );
    b.spike(V(tip.x, tip.y, tip.z), [dx * 0.8, -0.5, dz * 0.8], 0.1, 0.03, {
      bone: root,
      color: P.leafTip,
      group: "fronds",
    });
  });

  // central bud
  const bc = V(0, 2.6, 0.12);
  G(b.part(new THREE.IcosahedronGeometry(0.1, 1), P.glowPink, { bone: crownJ, at: [0, 2.85, 0.12], group: "fronds" }), 1.4);
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const base = V(dx * 0.1, 2.6, 0.12 + dz * 0.1);
    const mid = V(dx * 0.13, 2.85, 0.12 + dz * 0.13);
    const tp = V(dx * 0.04, 3.15, 0.12 + dz * 0.04);
    b.sweep(catmull([base, mid, tp]), [0.07, 0.0], {
      bone: crownJ,
      color: k % 2 ? P.leafTip : P.leafMid,
      caps: { end: "point" },
      group: "fronds",
    });
    G(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.glowMagenta, { bone: crownJ, at: tp, group: "fronds" }), 1.5);
  }
  for (let k = 0; k < 6; k++) {
    G(
      b.part(new THREE.IcosahedronGeometry(0.016, 0), P.sporeWhite, {
        bone: crownJ,
        at: [(R() - 0.5) * 0.6, 3.0 + R() * 0.2, 0.12 + (R() - 0.5) * 0.6],
        group: "fronds",
      }),
    );
  }
}
```