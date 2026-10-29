<!-- call: plan -->

```json
{
  "name": "Helix Glowfrond",
  "description": "A tall bioluminescent alien plant in the Avatar style: a dark curling stalk rising from a mound of glowing roots and bulbs, crowned with a spiral of magenta fronds whose tips, vein-lines and undersides shine cyan and violet.",
  "builderName": "helixGlowfrond",
  "size": [3.8, 4.3, 3.6],
  "layout": "Model space: +Y up, front faces +Z, centred on x = 0, standing on y = 0. The silhouette is a dark twisting stalk (about 3.2 m tall, leaning slightly forward, centreline drifting from [0, 0, 0.1] at the ground up to [0, 2.75, 0.75]) rising out of a low gnarled root mound that flares to a radius of about 1.4 m at the floor. Around the lower stalk, a cluster of translucent glowing sacs and pods hangs and bulges on short stems. At the crown hub the stalk splits into 5 to 7 long tapering fronds that spiral outward and curl under at the tips, the longest reaching about 1.5 m out and down to y ≈ 2.4, each frond striped with glowing vein ribs and capped with a bright luminous tip. The floor around the roots is dotted with small glowing undergrowth: a few stalk mushrooms, sprouts and spore motes, kept small and subordinate to the hero plant. Style on every part: near-black blue-teal bark and ground lit from within; every luminous element (sacs, veins, tips, spores, mushrooms) is its own bright flat colour and built as a separate small part seated on the darker surface, so the glow reads as geometry, not shading. Faceted low-poly surfaces throughout.",
  "palette": {
    "barkDark": "#16222e",
    "barkMid": "#243a4c",
    "barkRidge": "#33526a",
    "rootMoss": "#0e2438",
    "glowCyan": "#3df5e4",
    "glowTeal": "#1fa8b4",
    "glowViolet": "#9d6bff",
    "glowBlue": "#3f8dff",
    "frondMagenta": "#d94fd6",
    "frondDeep": "#7c2a9e",
    "frondEdge": "#f2a0ff",
    "sac membrane": "#6fe8d8",
    "sacCore": "#c9fff6",
    "sporeGold": "#ffd97a",
    "mushroomCap": "#2f4f7a",
    "mushroomGill": "#39e6ff",
    "sproutLeaf": "#2b6d8f",
    "inkOutline": "#08121c"
  },
  "mounts": {
    "groundRing": [0, 0.02, 0.1],
    "stalkBase": [0, 0.55, 0.15],
    "crownHub": [0, 2.75, 0.75],
    "sacAnchor": [0.32, 1.8, 0.55]
  },
  "joints": [
    { "name": "stem", "at": [0, 0.05, 0.1], "dir": [0, 1, 0.25], "role": "spine" },
    { "name": "stalkMid", "parent": "stem", "at": [0, 1.55, 0.4], "dir": [0, 1, 0.35], "role": "spine" },
    { "name": "crown", "parent": "stalkMid", "at": [0, 2.75, 0.75], "dir": [0, 1, 0.45], "role": "neck" },
    { "name": "frondA", "parent": "crown", "at": [0.18, 2.9, 0.85], "dir": [1, 0.5, 0.5], "role": "tentacle" },
    { "name": "frondB", "parent": "crown", "at": [-0.2, 2.85, 0.8], "dir": [-1, 0.55, 0.4], "role": "tentacle" },
    { "name": "frondC", "parent": "crown", "at": [0.05, 2.8, 0.4], "dir": [0.3, 0.7, -1], "role": "tentacle" },
    { "name": "frondD", "parent": "crown", "at": [-0.1, 2.95, 0.9], "dir": [-0.4, 0.4, 1], "role": "tentacle" },
    { "name": "sacCluster", "parent": "stalkMid", "at": [0.3, 1.8, 0.55], "dir": [1, 0, 0.3], "role": "hinge" }
  ],
  "parts": [
    {
      "id": "rootMound",
      "builds": "The floor-level foundation. A low dome mound of dark mossy ground (a squashed lathe or swept ring, rootMoss, about 0.35 m tall) from which 6 to 8 thick gnarled roots radiate outward and dive into the ground, each root a tapering swept tube in barkDark with barkMid ridge stripes seated on top as thin curved rods. Between the roots, small glowing root-vein filaments (thin rods, glowCyan) trace from the stalk base outward, fading to glowTeal at their ends. Where the roots meet the stalk, a ring of 5 to 7 swollen bulbous root-knots (small spheres, barkMid) each capped by a tiny glowing pore (glowCyan disc, seated on the knot facing up). The mound's top face carries a few moss tufts (small spikes, rootMoss darker) and 2 or 3 pale spore motes floating just above it (tiny spheres, sporeGold). Everything shares the groundRing mount at the centre and meets the stalk exactly at stalkBase.",
      "box": [[-1.5, 0, -1.4], [1.5, 0.62, 1.7]],
      "attaches": "Centre on groundRing; the stalk of the stalk part rises from stalkBase at its centre; the undergrowth part surrounds it, sharing the floor ring.",
      "joints": ["stem"],
      "floor": true,
      "budget": 140
    },
    {
      "id": "stalk",
      "builds": "The hero trunk. One smooth catmull chain (stem to stalkMid to crown) swept with a tapering radius from about 0.42 m at the base to 0.2 m at the crown hub, in barkDark with a countershading drift toward barkMid on the lit side; give it a gentle S-curve leaning forward as laid out. Vertical ridge fins: 4 to 6 narrow extruded blades running up the stalk at different heights, barkRidge, seated on the surface with b.surface and ending in a small glowing vein tip (glowCyan) at each blade's top. Horizontal glowing rings: 3 bands of small studs or thin swept loops round the trunk at about y = 0.8, 1.5 and 2.2, glowTeal, spaced like growth-node scars. A short branch stub halfway up carries a single small side frond (one curling swept tube, frondMagenta, with a glowCyan tip). The stalk's base is buried into the root mound at stalkBase; its top terminates exactly at crownHub where the fronds attach.",
      "box": [[-0.5, 0.45, -0.35], [0.5, 3.05, 1.05]],
      "attaches": "Roots into stalkBase over the rootMound part; carries sacCluster's sacs on its flank at sacAnchor; ends at crownHub under the frondCrown part.",
      "joints": ["stem", "stalkMid", "crown"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "frondCrown",
      "builds": "The signature feature: 5 to 7 long curling fronds sprouting from crownHub, each one its own swept chain riding a frond joint. Each frond is a tapering spiral path (radius from about 0.09 m at the base to a thin 0.015 m tip) that rises, arcs outward and curls under, the longest reaching about 1.5 m; different fronds spiral at different azimuths so the crown reads as a helix from every side. Frond body in frondMagenta shaded to frondDeep on the underside, every frond edged with a thin swept rim line in frondEdge. Along each frond's upper side, a row of glowing vein studs or small leaf blades (frondEdge and glowViolet, alternating) placed with b.along, and at each frond's tip a bright luminous bud: a small sphere of glowCyan inside a tiny collar of frondDeep, with 3 or 4 short glow filaments (thin rods, glowCyan) splaying from it. Where each frond leaves the hub, a sheathing bract (a small extruded leaf, frondDeep with frondEdge margin) covers the junction, and the hub itself is a swollen cone of barkMid with a glowing crown-eye disc (glowCyan) facing forward.",
      "box": [[-1.7, 2.35, -0.9], [1.7, 4.3, 1.5]],
      "attaches": "Sprouts exactly at crownHub on top of the stalk part; nothing hangs below y = 2.35 except the tips, which stay clear of the sacs and undergrowth.",
      "joints": ["crown", "frondA", "frondB", "frondC", "frondD"],
      "floor": false,
      "budget": 280
    },
    {
      "id": "glowSacs",
      "builds": "The bioluminescent bulb cluster. 6 to 9 translucent teardrop sacs of graded sizes (largest about 0.3 m tall, smallest 0.1 m) hanging and bulging from short stems on the stalk's lower flank around sacAnchor, using the sacCluster hinge joint. Each sac is a lathe or squashed sphere in sacMembrane with a visible inner core sphere of sacCore, seated so the core shows through a small opening; each sac's narrow neck is a short swept tube in barkDark connecting back to the stalk, and its base carries a tiny glowing collar ring (glowTeal). Two or three sacs are cracked open at the top, their rims peeled back in barkMid with a bright spore cluster (3 to 5 tiny spheres, sporeGold and glowCyan) spilling inside. Thin connecting vines (thin rods, glowViolet) link neighbouring sacs so the cluster reads as one organism. The cluster hangs from sacAnchor on the stalk part's surface and must not touch the floor.",
      "box": [[-0.9, 0.7, 0.35], [1.3, 1.85, 1.2]],
      "attaches": "Hangs from sacAnchor on the stalk part's flank; sits above the rootMound and inside the undergrowth part's outer ring.",
      "joints": ["stalkMid", "sacCluster"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "undergrowth",
      "builds": "The modest staging around the hero plant's footprint. A scatter of small glowing flora inside the root ring: 4 or 5 stalk mushrooms (thin swept stems in barkMid, flared caps in mushroomCap with glowing gill discs and rim rings in mushroomGill facing down), 6 or 8 curved sprout blades (extruded leaves in sproutLeaf with a glowTeal midrib, leaning outward), and 5 or 6 tiny glow pustules (small domes, glowCyan and glowViolet) on the ground among them. A few spore motes float between y = 0.4 and 1.0 (tiny spheres, sporeGold and glowCyan), and one fallen frond segment lies across the ground at the front, frondMagenta with a dimmed glowTeal tip, to tie the undergrowth to the crown's palette. Everything is small (under 0.45 m tall), ring-shaped around the centre, and clearly subordinate to the stalk and crown.",
      "box": [[-1.8, 0, -1.8], [1.8, 0.85, 2.1]],
      "attaches": "Surrounds the rootMound part on the same groundRing, staying outside the stalk's footprint and below the hanging glowSacs.",
      "joints": ["stem"],
      "floor": true,
      "budget": 150
    }
  ]
}
```

<!-- call: stalk -->

```ts
import * as THREE from "three";
import { frame, rng, catmull, bezier, offset } from "agentic-3js-builder";

export function buildStalk({ b, J, P, M }: any) {
  const R = rng(11);
  const base = [0, 0.05, 0.1];
  const path = catmull([
    base,
    [0.06, 0.8, 0.2],
    [-0.05, 1.55, 0.4],
    [0.05, 2.2, 0.58],
    [0, 2.75, 0.75],
  ]);
  const chain = b.chain("stalkChain", path, { parent: J.stem, count: 4, role: "spine" });
  const tube = b.sweep(path, (t: number) => 0.42 - 0.22 * t + 0.02 * Math.sin(t * 18), {
    bone: [chain, J.stem, J.stalkMid, J.crown],
    color: P.barkDark,
    sectors: [[-70, 70, P.barkMid, 0, 1]],
    sides: 10,
    caps: "flat",
  });
  const skin = b.surface(tube);

  // ridge fins with glowing tips
  const angles = [20, 80, 140, 200, 260, 320];
  angles.forEach((a, i) => {
    const t0 = 0.12 + (i % 3) * 0.12;
    const t1 = t0 + 0.38 + R() * 0.12;
    const p0 = tube.at(t0, a);
    const p1 = tube.at(t1, a);
    const mid = tube.at((t0 + t1) / 2, a, 0.03);
    const fin = b.sweep(catmull([offset(p0, p0.n, 0.0), mid, offset(p1, p1.n, 0.0)]), [0.03, 0.008], {
      color: P.barkRidge,
      caps: "point",
      bone: J.stalkMid,
      sides: 5,
    });
    b.stick(new THREE.SphereGeometry(0.03, 6, 4), P.glowCyan, p1, { embed: 0.2 });
  });

  // growth rings with studs
  [0.8, 1.5, 2.2].forEach((y) => {
    const c = path.at(path.closestT([0, y, 0.4] as any));
    const loop = skin.loop(c, { dir: [0, 1, 0], lift: 0.012 });
    b.sweep(loop, 0.014, { color: P.glowTeal });
    b.along(loop, 14, (at: any) => b.stick(new THREE.SphereGeometry(0.022, 6, 4), P.glowCyan, at, { embed: 0.3 }));
  });

  // branch stub with side frond
  const hit = tube.at(0.5, 90);
  const out = [0.5, 0.2, 0.15];
  const tip = offset(hit, hit.n, 0.28);
  b.spike(hit, tip, null, 0.06, { color: P.barkMid, bone: J.stalkMid });
  const f0 = offset(tip, [0.6, 0.5, 0.1], 0.2);
  const f1 = offset(f0, [0.6, 0.3, 0.1], 0.25);
  const f2 = offset(f1, [0.2, -0.5, 0.1], 0.25);
  const f3 = offset(f2, [-0.3, -0.7, 0.1], 0.15);
  b.sweep(catmull([tip, f0, f1, f2, f3]), [0.045, 0.01], {
    color: P.frondMagenta,
    bone: J.stalkMid,
    sides: 6,
    caps: "point",
  });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), P.glowCyan, { at: f3, bone: J.stalkMid });
}
```

<!-- call: glowSacs -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildGlowSacs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const MEM = P["sac membrane"] ?? "#6fe8d8";
  const anchor = M.sacAnchor;
  const bone = J.sacCluster;
  const stalkBone = J.stalkMid;

  // sacs: [dx, dy, dz, height, cracked]
  const sacs: [number, number, number, number, boolean][] = [
    [0.15, -0.35, 0.2, 0.3, false],
    [0.55, -0.2, 0.1, 0.24, true],
    [-0.3, -0.45, 0.15, 0.22, false],
    [0.3, -0.75, 0.35, 0.2, true],
    [0.75, -0.55, 0.3, 0.16, false],
    [-0.1, -0.85, 0.25, 0.14, false],
    [-0.55, -0.15, 0.1, 0.12, false],
    [0.95, -0.85, 0.2, 0.1, true],
  ];

  const centers: THREE.Vector3[] = [];
  sacs.forEach(([dx, dy, dz, h, cracked], i) => {
    const base = new THREE.Vector3(anchor[0] + dx, anchor[1] + dy, anchor[2] + dz);
    const stemTop = new THREE.Vector3(anchor[0] + dx * 0.15, anchor[1] + dy * 0.2 + 0.05, anchor[2] - 0.12);
    const top = base.clone().add(new THREE.Vector3(0, h * 0.5 + 0.02, 0));
    const c = base.clone();
    centers.push(c);
    // neck stem
    b.rod(stemTop, top, [0.03 + h * 0.06, 0.02 + h * 0.04], P.barkDark, { bone, sides: 6 });
    // membrane body (squashed sphere, teardrop via lathe)
    const w = h * 0.5;
    b.lathe(
      [[0, -h * 0.5], [w * 0.6, -h * 0.4], [w, -h * 0.05], [w * 0.7, h * 0.3], [w * 0.28, h * 0.5], [0, h * 0.5]],
      { at: c.toArray() as [number, number, number], axis: [0, 1, 0], segments: 8, color: MEM, bone },
    );
    // inner core
    glow(
      b.part(new THREE.SphereGeometry(w * 0.5, 7, 5), P.sacCore, {
        bone,
        at: [c.x, c.y - h * 0.05, c.z + w * 0.3],
      }),
      1.4,
    );
    // collar ring at top
    glow(
      b.part(new THREE.TorusGeometry(w * 0.3, 0.008, 4, 10), P.glowTeal, {
        bone,
        at: [c.x, c.y + h * 0.48, c.z],
        rotation: [90, 0, 0],
      }),
      1.2,
    );
    if (cracked) {
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        b.part(new THREE.ConeGeometry(0.02, h * 0.28, 4), P.barkMid, {
          bone,
          at: [c.x + Math.cos(a) * w * 0.33, c.y + h * 0.5, c.z + Math.sin(a) * w * 0.33],
          rotation: [Math.sin(a) * 40, 0, -Math.cos(a) * 40],
        });
      }
      for (let k = 0; k < 4; k++) {
        glow(
          b.part(new THREE.SphereGeometry(0.018 + R() * 0.008, 5, 4), k % 2 ? P.sporeGold : P.glowCyan, {
            bone,
            at: [c.x + (R() - 0.5) * w * 0.5, c.y + h * 0.55 + R() * 0.04, c.z + (R() - 0.5) * w * 0.5],
          }),
          1.6,
        );
      }
    }
    // vine to previous sac
    if (i > 0) {
      const p = centers[i - 1];
      glow(
        b.rod([p.x, p.y + 0.03, p.z], [c.x, c.y + 0.03, c.z], 0.008, P.glowViolet, { bone, sides: 4 }),
        1.2,
      );
    }
  });
  // vine from stalk to first sacs
  glow(b.rod([anchor[0] - 0.1, anchor[1], anchor[2] - 0.1], [anchor[0] + 0.55, anchor[1] - 0.2, anchor[2] + 0.1], 0.01, P.glowViolet, { bone: stalkBone, sides: 4 }), 1.2);
}
```

<!-- call: undergrowth -->

```ts
import * as THREE from "three";
import { rng, catmull } from "agentic-3js-builder";

export function buildUndergrowth({ b, J, P }: any) {
  const r = rng(11);
  const bone = J.stem;
  const col = (k: string, d: string) => (P && P[k]) || d;
  const MID = col("barkMid", "#243a4c"), CAP = col("mushroomCap", "#2f4f7a"), GILL = col("mushroomGill", "#39e6ff");
  const LEAF = col("sproutLeaf", "#2b6d8f"), TEAL = col("glowTeal", "#1fa8b4"), CY = col("glowCyan", "#3df5e4");
  const VI = col("glowViolet", "#9d6bff"), GOLD = col("sporeGold", "#ffd97a"), MAG = col("frondMagenta", "#d94fd6");
  const EDGE = col("frondEdge", "#f2a0ff");

  const ring = (i: number, n: number, rad: number, off = 0) => {
    const a = (i / n) * Math.PI * 2 + off;
    return [Math.sin(a) * rad, Math.cos(a) * rad + 0.1, a] as const;
  };

  // mushrooms
  for (let i = 0; i < 5; i++) {
    const [x, z] = ring(i, 5, 1.45 + r() * 0.3, 0.3);
    const h = 0.2 + r() * 0.15, cr = 0.09 + r() * 0.05;
    const lean = (r() - 0.5) * 0.06;
    b.sweep(catmull([[x, 0, z], [x + lean, h * 0.5, z], [x + lean * 2, h, z]]), [0.02, 0.012], { bone, color: MID, sides: 6 });
    const cy = h + 0.01;
    b.part(new THREE.SphereGeometry(cr, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), CAP, { bone, at: [x + lean * 2, cy, z], flat: true });
    b.part(new THREE.CylinderGeometry(cr * 0.85, cr * 0.85, 0.01, 8), GILL, { bone, at: [x + lean * 2, cy + 0.003, z] });
    b.part(new THREE.TorusGeometry(cr * 0.97, 0.007, 4, 10), GILL, { bone, at: [x + lean * 2, cy + 0.008, z], rotation: [90, 0, 0] });
    b.part(new THREE.SphereGeometry(0.012, 5, 4), CY, { bone, at: [x + lean * 2, cy + cr * 0.9, z] });
  }

  // sprout blades
  const leafO: [number, number][] = [[0, 0], [0.05, 0.12], [0.03, 0.26], [0, 0.4], [-0.03, 0.26], [-0.05, 0.12]];
  for (let i = 0; i < 8; i++) {
    const [x, z, a] = ring(i, 8, 1.2 + r() * 0.5, 0.15);
    const out: [number, number, number] = [Math.sin(a), 0.9, Math.cos(a)];
    b.extrude(leafO, { at: [x, 0, z], x: [Math.cos(a), 0, -Math.sin(a)], y: out, thickness: 0.012, smoothing: 1, color: LEAF, bone });
    const e = 0.38;
    b.rod([x, 0.01, z], [x + out[0] * e * 0.4, 0.01 + out[1] * e * 0.4, z + out[2] * e * 0.4], 0.006, TEAL, { bone });
  }

  // pustules
  for (let i = 0; i < 6; i++) {
    const [x, z] = ring(i, 6, 1.0 + r() * 0.9, 0.7);
    b.part(new THREE.SphereGeometry(0.035 + r() * 0.025, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), i % 2 ? VI : CY, { bone, at: [x, 0, z], flat: true });
  }

  // spore motes
  for (let i = 0; i < 8; i++) {
    const [x, z] = ring(i, 8, 0.9 + r() * 0.8, 0.4);
    b.part(new THREE.SphereGeometry(0.015 + r() * 0.01, 5, 4), i % 2 ? GOLD : CY, { bone, at: [x, 0.4 + r() * 0.6, z] });
  }

  // fallen frond at front
  const p = catmull([[-0.7, 0.07, 1.9], [-0.2, 0.09, 1.75], [0.4, 0.07, 1.8], [0.9, 0.05, 1.6]]);
  b.sweep(p, [0.07, 0.015], { bone, color: MAG, sides: 6, caps: "point" });
  b.rod([-0.6, 0.13, 1.88], [0.8, 0.1, 1.66], 0.006, EDGE, { bone });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), TEAL, { bone, at: [0.92, 0.05, 1.6] });
}
```

<!-- call: rootMound -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildRootMound({ b, J, P, M }: Ctx) {
  const bone = J.stem;
  const R = rng(11);
  const base = M.groundRing;
  const cx = base[0], cz = base[2];

  // Mound: squashed lathe dome
  b.lathe(
    [
      [0, 0],
      [1.0, 0],
      [1.15, 0.08],
      [0.9, 0.22],
      [0.55, 0.32],
      [0.25, 0.37],
      [0, 0.38],
    ],
    { at: [cx, 0, cz], segments: 14, bone, color: P.rootMoss },
  );
  // Darker lower skirt ring
  b.lathe(
    [
      [1.0, 0],
      [1.3, 0],
      [1.25, 0.05],
      [1.0, 0.1],
    ],
    { at: [cx, 0, cz], segments: 14, bone, color: P.barkDark },
  );

  const N = 7;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + 0.3;
    const len = 1.15 + R() * 0.25;
    const ca = Math.cos(a), sa = Math.sin(a);
    const wob = (R() - 0.5) * 0.3;
    const pts: [number, number, number][] = [
      [cx + ca * 0.25, 0.5, cz + sa * 0.25],
      [cx + ca * 0.55 - sa * wob, 0.4, cz + sa * 0.55 + ca * wob],
      [cx + ca * 0.95 + sa * wob, 0.24, cz + sa * 0.95 - ca * wob],
      [cx + ca * len, 0.07, cz + sa * len],
    ];
    const path = pts;
    b.sweep(path, [0.15, 0.04], { bone, color: P.barkDark, sides: 6, caps: { start: "round", end: "point" } });
    // ridge stripes
    for (const off of [-0.05, 0.05]) {
      const rp = pts.map((p, k) => [
        p[0] - sa * off,
        p[1] + 0.12 * (1 - k / 3) + 0.02,
        p[2] + ca * off,
      ] as [number, number, number]);
      b.sweep(rp.slice(0, 3), [0.02, 0.01], { bone, color: P.barkMid, sides: 4 });
    }
    // glow filament between roots
    const a2 = a + Math.PI / N;
    const c2 = Math.cos(a2), s2 = Math.sin(a2);
    const fl: [number, number, number][] = [
      [cx + c2 * 0.3, 0.37, cz + s2 * 0.3],
      [cx + c2 * 0.6 + s2 * 0.05, 0.3, cz + s2 * 0.6],
      [cx + c2 * 0.95, 0.15, cz + s2 * 0.95 - c2 * 0.05],
    ];
    b.sweep(fl, [0.014, 0.008], { bone, color: P.glowCyan, sides: 4 });
    b.sphere
      ? null
      : b.part(new THREE.SphereGeometry(0.02, 5, 4), P.glowTeal, {
          bone,
          at: [cx + c2 * 1.12, 0.1, cz + s2 * 1.12],
        });
    b.part(new THREE.SphereGeometry(0.022, 5, 4), P.glowTeal, {
      bone,
      at: [cx + c2 * 1.05, 0.09, cz + s2 * 1.05],
    });
  }

  // Root knots with pores
  const K = 6;
  for (let i = 0; i < K; i++) {
    const a = (i / K) * Math.PI * 2 + 0.1;
    const x = cx + Math.cos(a) * 0.5, z = cz + Math.sin(a) * 0.5;
    const r = 0.09 + R() * 0.03;
    b.part(new THREE.SphereGeometry(r, 7, 5), P.barkMid, { bone, at: [x, 0.42, z] });
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 8), P.glowCyan, {
      bone,
      at: [x, 0.42 + r * 0.92, z],
    });
  }

  // Moss tufts
  for (let i = 0; i < 9; i++) {
    const a = R() * Math.PI * 2;
    const d = 0.3 + R() * 0.55;
    const x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
    const y = 0.34 - d * 0.18;
    b.part(new THREE.ConeGeometry(0.035, 0.12, 5), "#0a1a2a", {
      bone,
      at: [x, y + 0.04, z],
      dir: [Math.cos(a) * 0.3, 1, Math.sin(a) * 0.3],
    });
  }

  // Spore motes
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1 + 0.5;
    b.part(new THREE.SphereGeometry(0.025, 5, 4), P.sporeGold, {
      bone,
      at: [cx + Math.cos(a) * 0.7, 0.55 + i * 0.07, cz + Math.sin(a) * 0.7],
    });
  }
}
```

<!-- call: frondCrown -->

```ts
import * as THREE from "three";
import { frame, rng, catmull, offset } from "agentic-3js-builder";

export function buildFrondCrown({ b, J, P, M }: any) {
  const R = rng(11);
  const hub = M.crownHub as number[];
  const crown = J.crown;
  const glowOf = (m: any, s = 1) => m;

  // hub: swollen cone of barkMid
  b.part(new THREE.ConeGeometry(0.3, 0.5, 8), P.barkMid, {
    bone: crown, at: [hub[0], hub[1] + 0.1, hub[2]], flat: true,
  });
  b.part(new THREE.SphereGeometry(0.2, 8, 6), P.barkRidge, {
    bone: crown, at: [hub[0], hub[1] + 0.38, hub[2]], flat: true,
  });
  // crown eye
  b.part(new THREE.CircleGeometry(0.09, 10), P.glowCyan, {
    bone: crown, at: [hub[0], hub[1] + 0.2, hub[2] + 0.27], dir: [0, 0.1, 1], axis: "z",
  });
  b.part(new THREE.RingGeometry(0.09, 0.12, 10), P.inkOutline, {
    bone: crown, at: [hub[0], hub[1] + 0.2, hub[2] + 0.268], dir: [0, 0.1, 1], axis: "z",
  });

  const fronds = [
    { j: J.frondA, az: 0, len: 1.5 },
    { j: J.frondB, az: 60, len: 1.35 },
    { j: J.frondC, az: 130, len: 1.45 },
    { j: J.frondD, az: 200, len: 1.2 },
    { j: J.frondA, az: 260, len: 1.3 },
    { j: J.frondB, az: 320, len: 1.1 },
  ];

  fronds.forEach((f, i) => {
    const a = (f.az * Math.PI) / 180;
    const dx = Math.sin(a), dz = Math.cos(a);
    const L = f.len;
    const base = [hub[0] + dx * 0.12, hub[1] + 0.3, hub[2] + dz * 0.12];
    const pts = [
      base,
      [base[0] + dx * 0.15 * L, base[1] + 0.55 * L, base[2] + dz * 0.15 * L],
      [base[0] + dx * 0.6 * L, base[1] + 0.95 * L, base[2] + dz * 0.6 * L],
      [base[0] + dx * 0.95 * L + dz * 0.15, base[1] + 0.85 * L, base[2] + dz * 0.95 * L - dx * 0.15],
      [base[0] + dx * 1.0 * L + dz * 0.2, base[1] + 0.45 * L, base[2] + dz * 1.0 * L - dx * 0.2],
    ].map((p) => [
      Math.max(-1.55, Math.min(1.55, p[0])),
      Math.min(4.15, p[1]),
      Math.max(-0.8, Math.min(1.4, p[2])),
    ]);
    const path = catmull(pts);
    const body = b.sweep(path, [0.09, 0.015], {
      bone: f.j, color: P.frondMagenta,
      sectors: [[120, 240, P.frondDeep]], sides: 6,
      caps: { end: "point" },
    });
    // rim line
    b.sweep(body.line(90, 0.005), 0.008, { bone: f.j, color: P.frondEdge, sides: 4 });
    b.sweep(body.line(-90, 0.005), 0.008, { bone: f.j, color: P.frondEdge, sides: 4 });
    // vein studs
    let k = 0;
    b.along(body, 7, (at: any) => {
      const c = k++ % 2 ? P.glowViolet : P.frondEdge;
      b.stick(new THREE.OctahedronGeometry(0.032 * (1 - k * 0.07), 0), c, at, { embed: 0.3 });
    }, { from: 0.15, to: 0.85 });
    // tip bud
    const tip = path.at(1);
    const tp = [tip.x, tip.y, tip.z];
    const td = path.tangentAt(1);
    b.part(new THREE.CylinderGeometry(0.045, 0.025, 0.05, 6), P.frondDeep, {
      bone: f.j, at: tp, dir: [td.x, td.y, td.z],
    });
    b.part(new THREE.SphereGeometry(0.05, 8, 6), P.glowCyan, {
      bone: f.j, at: [tp[0] + td.x * 0.04, tp[1] + td.y * 0.04, tp[2] + td.z * 0.04], flat: true,
    });
    for (let q = 0; q < 4; q++) {
      const ang = (q / 4) * Math.PI * 2 + i;
      const d = [td.x + Math.cos(ang) * 0.9, td.y + 0.2, td.z + Math.sin(ang) * 0.9];
      b.spike([tp[0] + td.x * 0.06, tp[1] + td.y * 0.06, tp[2] + td.z * 0.06], d, 0.1, 0.007, {
        bone: f.j, color: P.glowCyan,
      });
    }
    // bract at junction
    b.extrude(
      [[0, 0], [0.07, 0.08], [0.05, 0.22], [0, 0.3, "sharp"], [-0.05, 0.22], [-0.07, 0.08]],
      {
        at: [base[0] - dx * 0.02, hub[1] + 0.08, base[2] - dz * 0.02],
        x: [dz, 0, -dx], y: [dx * 0.4, 1, dz * 0.4],
        thickness: 0.02, color: P.frondDeep, bone: crown, smoothing: 1,
      },
    );
    b.part(new THREE.SphereGeometry(0.02, 5, 4), P.frondEdge, {
      bone: crown, at: [base[0] + dx * 0.05, hub[1] + 0.33, base[2] + dz * 0.05],
    });
  });
}
```