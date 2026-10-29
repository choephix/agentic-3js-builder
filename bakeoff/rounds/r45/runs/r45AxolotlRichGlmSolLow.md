<!-- call: plan -->

```json
{
  "name": "Chibi Axolotl",
  "description": "A chibi axolotl with an oversized round head, a wide sleepy smile, stubby legs and six frilly pink gill stalks fanning from its cheeks.",
  "builderName": "chibiAxolotl",
  "size": [0.38, 0.34, 0.62],
  "layout": "A chibi axolotl facing +Z, standing on four stubby legs at y=0. The silhouette is dominated by the head: a wide, slightly squashed sphere centred at [0, 0.17, 0.13] (radius ~0.15) that takes almost half the model's length and overhangs a tiny plump torso behind it. The face reads at a glance: two huge glossy black bead eyes with white highlights low and wide on the front, pink blush discs under them, a wide gentle smile line curved across the lower front, two tiny nostril dots, and a cream chin/lower-jaw piece that sits slightly inside the head so the mouth can open. Behind and above the eyes, three gill stalks per side sprout from the head's flanks (upper-front, mid, lower-back) and sweep outward and back in a fan; every stalk carries rows of soft frilly filaments in pink-to-magenta, the signature feature, built richest. The torso is a short capsule from z=+0.05 back to z=-0.15, pale pink on top with a cream belly, blended under the head. Four stubby legs (front pair at z=+0.05, back pair at z=-0.10, hips at x=±0.085) drop straight down to round feet with three toes each, all touching y=0. The tail continues the torso line, tapering from the rump to a curled tip at z=-0.30, framed by pale translucent-looking dorsal and ventral fin folds. Everything is soft, round and toy-like: low-poly facets, no sharp edges, colour doing the work (warm pale pink up top, cream below, saturated magenta-pink only on the gills and blush so the face and gills pop).",
  "palette": {
    "bodyPink": "#f5c3d2",
    "bodyShadow": "#e3a7bd",
    "bellyCream": "#fdeef4",
    "gillPink": "#ff7fa8",
    "gillDeep": "#e0568a",
    "gillTip": "#ffc0d3",
    "fin membrane": "#f9d7e3",
    "ink": "#2a1a24",
    "glossWhite": "#ffffff",
    "blush": "#ff9fb6",
    "nostril": "#c98aa4",
    "toePad": "#eec0d0"
  },
  "mounts": {
    "neckSocket": [0, 0.16, 0.06],
    "tailRoot": [0, 0.14, -0.13],
    "gillRowL": [0.11, 0.20, 0.11],
    "gillRowR": [-0.11, 0.20, 0.11],
    "legRowFront": [0.085, 0.085, 0.05],
    "legRowBack": [0.085, 0.085, -0.1]
  },
  "joints": [
    { "name": "body", "at": [0, 0.14, -0.04], "dir": [0, 0.3, 1], "role": "spine" },
    { "name": "head", "parent": "body", "at": [0, 0.17, 0.08], "dir": [0, 0.15, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 0.1, 0.14], "dir": [0, -0.4, 1], "role": "jaw" },
    { "name": "tail1", "parent": "body", "at": [0, 0.14, -0.14], "dir": [0, 0.1, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 0.14, -0.22], "dir": [0, 0.05, -1], "role": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 0.13, -0.28], "dir": [0, 0.1, -1], "role": "tail" },
    { "name": "gillL1", "parent": "head", "at": [0.105, 0.245, 0.13], "dir": [1, 0.55, 0.35], "role": "tentacle", "group": "gills" },
    { "name": "gillL1tip", "parent": "gillL1", "at": [0.155, 0.29, 0.1], "dir": [1, 0.35, -0.3], "role": "tentacle", "group": "gills" },
    { "name": "gillL2", "parent": "head", "at": [0.125, 0.2, 0.1], "dir": [1, 0.2, 0.1], "role": "tentacle", "group": "gills" },
    { "name": "gillL2tip", "parent": "gillL2", "at": [0.18, 0.225, 0.05], "dir": [1, 0.25, -0.35], "role": "tentacle", "group": "gills" },
    { "name": "gillL3", "parent": "head", "at": [0.115, 0.16, 0.07], "dir": [1, 0, -0.15], "role": "tentacle", "group": "gills" },
    { "name": "gillL3tip", "parent": "gillL3", "at": [0.165, 0.165, 0.0], "dir": [1, 0.05, -0.4], "role": "tentacle", "group": "gills" },
    { "name": "gillR1", "parent": "head", "at": [-0.105, 0.245, 0.13], "dir": [-1, 0.55, 0.35], "role": "tentacle", "group": "gills" },
    { "name": "gillR1tip", "parent": "gillR1", "at": [-0.155, 0.29, 0.1], "dir": [-1, 0.35, -0.3], "role": "tentacle", "group": "gills" },
    { "name": "gillR2", "parent": "head", "at": [-0.125, 0.2, 0.1], "dir": [-1, 0.2, 0.1], "role": "tentacle", "group": "gills" },
    { "name": "gillR2tip", "parent": "gillR2", "at": [-0.18, 0.225, 0.05], "dir": [-1, 0.25, -0.35], "role": "tentacle", "group": "gills" },
    { "name": "gillR3", "parent": "head", "at": [-0.115, 0.16, 0.07], "dir": [-1, 0, -0.15], "role": "tentacle", "group": "gills" },
    { "name": "gillR3tip", "parent": "gillR3", "at": [-0.165, 0.165, 0.0], "dir": [-1, 0.05, -0.4], "role": "tentacle", "group": "gills" },
    { "name": "legFL", "parent": "body", "at": [0.085, 0.085, 0.05], "dir": [0, -1, 0.1], "role": "leg", "group": "legs" },
    { "name": "legFR", "parent": "body", "at": [-0.085, 0.085, 0.05], "dir": [0, -1, 0.1], "role": "leg", "group": "legs" },
    { "name": "legBL", "parent": "body", "at": [0.085, 0.085, -0.1], "dir": [0, -1, -0.1], "role": "leg", "group": "legs" },
    { "name": "legBR", "parent": "body", "at": [-0.085, 0.085, -0.1], "dir": [0, -1, -0.1], "role": "leg", "group": "legs" }
  ],
  "parts": [
    {
      "id": "headFace",
      "builds": "The oversized chibi head and its whole face. One wide low-poly sphere (slightly squashed: scale ~[1.05, 0.92, 0.95], radius 0.15, centre [0, 0.17, 0.13]) in bodyPink, skinned over the head joint. Face pieces seated on its front surface: two huge glossy eyes (black ink spheres ~0.035 with small glossWhite highlight dots offset up-and-out, placed low and wide at roughly x=±0.065, y=0.15, z=0.26 facing forward), soft blush discs in blush under and slightly outboard of each eye, a wide gentle smile built as a thin curved extruded arc in ink across the lower front at y≈0.085 with small upturned corners, two tiny nostril dots in nostril above the smile, and faint ink eyelid crease lines above each eye. The lower jaw is a separate shallow cream (bellyCream) chin piece — a squashed half-sphere seated under the jaw joint at [0, 0.095, 0.20] — tucked inside the head silhouette so the mouth can open; the smile sits on the head, the chin on the jaw. A few tiny bodyShadow freckle dots scatter on the top of the head. All face details are their own parts in their own palette colours, seated flush on the head surface.",
      "box": [[-0.17, 0.02, 0.0], [0.17, 0.34, 0.3]],
      "attaches": "Head sphere blends over the neckSocket mount at [0, 0.16, 0.06] where it meets the torso; chin rides the jaw joint; the gillRowL/gillRowR mounts on the head's flanks are left clear for the gills part.",
      "joints": ["head", "jaw"],
      "floor": false,
      "budget": 95
    },
    {
      "id": "gills",
      "builds": "The six frilly external gills, the model's signature feature. Each of the six gill chains (gillL1..gillL3tip and mirrored R) carries one swept stalk: a tapered tube from its base joint to its tip joint, radius ~0.016 tapering to ~0.007, coloured gillPink with the last third in gillDeep, capped round. From each stalk sprout the frills: along both sides of every stalk, two rows of 6-8 small tapered filaments (thin swept spikes or tiny curved rods ~0.05-0.07 long) angled backward off the stalk like a bottlebrush, coloured gillTip near the base shifting to gillPink at the tips, plus one longer hero filament at each stalk tip in gillTip. Filaments get slightly denser toward the tip so each gill reads as a soft feather duster. The six stalks fan out symmetrically: upper pair angled up-and-back, mid pair straight out, lower pair drooping slightly, all curving back toward -Z so nothing covers the face.",
      "box": [[-0.24, 0.12, -0.06], [0.24, 0.33, 0.26]],
      "attaches": "Each stalk base buries itself into the head sphere at the gillRowL/gillRowR mount region, riding the gill chain joints parented to head.",
      "joints": ["head", "gillL1", "gillL1tip", "gillL2", "gillL2tip", "gillL3", "gillL3tip", "gillR1", "gillR1tip", "gillR2", "gillR2tip", "gillR3", "gillR3tip"],
      "floor": false,
      "budget": 120
    },
    {
      "id": "torso",
      "builds": "The plump little body under and behind the head. A smooth capsule swept along the spine from the neckSocket mount [0, 0.16, 0.06] back to the tailRoot mount [0, 0.14, -0.13], radius ~0.10 bulging to 0.105 at the belly, in bodyPink with a countershaded bellyCream underside (paint or a separate belly panel part in bellyCream wrapping the lower half). A pair of tiny shoulder humps in bodyShadow hint at the front legs, and a small smooth bulge where the tail joins. The top line is a gentle arch from the head down to the rump. The torso stays simple so the head, gills and tail carry the character; its only details are the belly colour split with a soft irregular boundary and two tiny bodyShadow speckles on each flank.",
      "box": [[-0.13, 0.04, -0.16], [0.13, 0.27, 0.09]],
      "attaches": "Front blends into the head at neckSocket; rear hands off to the tail at tailRoot; its underside is open to the four leg hips on the legRowFront/legRowBack mounts.",
      "joints": ["body"],
      "floor": false,
      "budget": 70
    },
    {
      "id": "legs",
      "builds": "Four stubby chibi legs, each riding its leg joint (legFL, legFR, legBL, legBR). Each leg is a short tapered tube from the hip at [±0.085, 0.085, 0.05 or -0.1] straight down to the foot, radius ~0.032 tapering to ~0.024, in bodyPink with a subtle bodyShadow underside. The foot is a rounded pad (squashed sphere ~0.032 radius) resting exactly on y=0, in bellyCream, with three short forward-splayed toes: tiny tapered capsules ~0.035 long fanned in a V, each tipped with a small toePad ball in toePad. Front toes point forward (+Z), back toes slightly outward. Feet are flat enough that the whole model rests on these eight ground contacts.",
      "box": [[-0.13, 0.0, -0.15], [0.13, 0.11, 0.1]],
      "attaches": "Each hip tube's top tucks up into the torso underside at the legRowFront/legRowBack mounts, riding the leg joints parented to body.",
      "joints": ["body", "legFL", "legFR", "legBL", "legBR"],
      "floor": true,
      "budget": 65
    },
    {
      "id": "tail",
      "builds": "The tapering tail and its fin folds. A swept tube along the tail chain (tail1..tail3) from the tailRoot mount [0, 0.14, -0.13] to a curled tip near [0, 0.15, -0.30], radius 0.085 tapering smoothly to ~0.01 with the last stretch curling slightly upward, in bodyPink. Framing it, an axial fin: two thin membranes (fin membrane colour) — a dorsal one running along the tail's top line and a ventral one along its underside, each starting just behind the rump, widest (~0.045) at mid-tail and rounding off at the tip, with soft scalloped trailing edges like an axolotl's fin fold. Three small bodyShadow speckles dot the tail's upper surface. The tail tip's curl gives the silhouette a playful flick.",
      "box": [[-0.08, 0.03, -0.32], [0.08, 0.24, -0.11]],
      "attaches": "Front end continues the torso's centreline at the tailRoot mount; fin membranes root onto the tail tube's own surface lines, riding the tail joints.",
      "joints": ["body", "tail1", "tail2", "tail3"],
      "floor": false,
      "budget": 65
    }
  ]
}
```

<!-- call: gills -->

```ts
import * as THREE from "three";
import { catmull } from "agentic-3js-builder";

export function buildGills({ b, J, P }: Ctx) {
  const pink = P.gillPink;
  const deep = P.gillDeep;
  const tip = P.gillTip;

  const stalks = [
    ["L1", J.gillL1, J.gillL1tip, 1],
    ["L2", J.gillL2, J.gillL2tip, 1],
    ["L3", J.gillL3, J.gillL3tip, 1],
    ["R1", J.gillR1, J.gillR1tip, -1],
    ["R2", J.gillR2, J.gillR2tip, -1],
    ["R3", J.gillR3, J.gillR3tip, -1],
  ] as const;

  for (const [label, base, end, side] of stalks) {
    const a = base.at.clone();
    const z = end.at.clone();
    const mid = a.clone().lerp(z, 0.5);
    mid.z -= 0.012;
    mid.y += label.endsWith("1") ? 0.008 : label.endsWith("3") ? -0.004 : 0.002;

    const path = catmull([a, mid, z]);
    const stalk = b.sweep(path, (t) => 0.016 - 0.009 * t, {
      bone: [base, end],
      color: pink,
      bands: [[0.68, deep]],
      caps: "round",
      sides: 7,
      name: `gillStalk${label}`,
      group: "gills",
    });

    // Small fleshy socket where each stalk disappears into the cheek.
    b.part(new THREE.SphereGeometry(0.019, 7, 5), deep, {
      bone: base,
      at: a,
      scale: [1.05, 0.9, 0.8],
      name: `gillSocket${label}`,
      group: "gills",
    });

    // Two bottlebrush rows.  The rows become slightly longer toward the free end.
    const count = 7;
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < count; i++) {
        const t = 0.13 + (i / (count - 1)) * 0.78;
        const angle = row === 0 ? 42 : -42;
        const at = stalk.at(t, angle, 0.002);
        const n = at.n.clone().normalize();

        // Push the frills backward, while the two rows open away from the stalk.
        const outward = n.multiplyScalar(0.72);
        const backward = new THREE.Vector3(0, 0, -1).multiplyScalar(0.58);
        const lift = new THREE.Vector3(
          0,
          (label.endsWith("1") ? 0.32 : label.endsWith("3") ? -0.12 : 0.04) *
            (row === 0 ? 1 : -1),
          0,
        );
        const dir = outward.add(backward).add(lift).normalize();
        const length = 0.043 + 0.018 * (i / (count - 1));
        const color = i < 2 ? tip : pink;

        b.spike(at, dir, length, 0.0045 - i * 0.00025, {
          color,
          caps: "round",
          sides: 6,
          name: `gillFilament${label}_${row}_${i}`,
          group: "gills",
        });

        // A tiny rounded terminal bead makes the soft filament ends catch the light.
        if (i >= 4) {
          const bead = at.at.clone().addScaledVector(dir, length * 0.92);
          b.part(new THREE.SphereGeometry(0.006, 6, 4), tip, {
            bone: at.bone ?? base,
            at: bead,
            name: `gillBead${label}_${row}_${i}`,
            group: "gills",
          });
        }
      }
    }

    // One longer crown filament gives each frill a recognizable feathery silhouette.
    const crown = stalk.at(0.94, side * 18, 0.003);
    const crownDir = crown.n
      .clone()
      .normalize()
      .multiplyScalar(0.78)
      .add(new THREE.Vector3(0, label.endsWith("1") ? 0.45 : label.endsWith("3") ? -0.18 : 0.08, -0.72))
      .normalize();

    b.spike(crown, crownDir, 0.067, 0.005, {
      color: tip,
      caps: "round",
      sides: 7,
      name: `gillHero${label}`,
      group: "gills",
    });

    // Two short overlapping ruffles at the crown broaden the pink fan.
    for (const s of [-1, 1]) {
      const r = stalk.at(0.78, side * (55 + s * 18), 0.002);
      const d = r.n
        .clone()
        .normalize()
        .multiplyScalar(0.62)
        .add(new THREE.Vector3(0, s * 0.16, -0.78))
        .normalize();
      b.spike(r, d, 0.052, 0.004, {
        color: s > 0 ? tip : deep,
        caps: "round",
        sides: 6,
        name: `gillRuffle${label}_${s}`,
        group: "gills",
      });
    }
  }
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { catmull, createBuilder } from "agentic-3js-builder";

export function buildTorso({ b, J, P, M }: Ctx) {
  const body = J.body;
  const pink = P.bodyPink;
  const cream = P.bellyCream;
  const shadow = P.bodyShadow;

  const spine = catmull(
    [
      [0, 0.165, 0.065],
      [0, 0.178, 0.015],
      [0, 0.158, -0.055],
      [0, 0.145, -0.13],
    ],
    { tension: 0.35 },
  );

  // Main soft torso: the cream sector is placed on the underside while the pink
  // remains a broad uninterrupted upper silhouette.
  const torso = b.sweep(spine, (t: number) => {
    const bulge = Math.sin(Math.PI * t) * 0.006;
    return 0.091 + bulge;
  }, {
    bone: body,
    color: pink,
    sides: 10,
    detail: 1,
    sectors: [
      [112, 248, cream],
    ],
    caps: "round",
    group: "torso",
    name: "torsoCore",
  });

  // Soft transition lobes where the torso disappears beneath the oversized head.
  for (const s of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(0.041, 8, 6),
      shadow,
      {
        bone: body,
        at: [s * 0.073, 0.184, 0.045],
        scale: [1.0, 0.72, 0.9],
        group: "torso",
        name: `shoulderHump${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // A rounded rump socket gives the tail builder a clean, padded hand-off.
  b.part(
    new THREE.SphereGeometry(0.083, 10, 7),
    pink,
    {
      bone: body,
      at: [0, 0.145, -0.125],
      scale: [0.92, 0.88, 0.72],
      group: "torso",
      name: "tailSocket",
    },
  );

  // Tiny flank freckles, kept low-poly and embedded into the torso silhouette.
  const freckles: [number, number, number][] = [
    [0.089, 0.181, -0.018],
    [0.087, 0.151, -0.071],
    [-0.089, 0.181, -0.018],
    [-0.087, 0.151, -0.071],
  ];

  for (let i = 0; i < freckles.length; i++) {
    const p = freckles[i];
    b.part(
      new THREE.SphereGeometry(0.0065, 6, 4),
      shadow,
      {
        bone: body,
        at: p,
        scale: [1.15, 0.55, 0.72],
        group: "torso",
        name: `flankFreckle${i + 1}`,
      },
    );
  }

  // A pair of very small cream belly accents makes the underside read clearly
  // between the front and rear legs without adding a hard panel seam.
  for (let i = 0; i < 2; i++) {
    b.part(
      new THREE.SphereGeometry(0.012, 7, 5),
      cream,
      {
        bone: body,
        at: [i === 0 ? -0.043 : 0.043, 0.071, -0.035],
        scale: [1.4, 0.32, 1.0],
        group: "torso",
        name: `bellyHighlight${i + 1}`,
      },
    );
  }

  return torso;
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  rng,
} from "agentic-3js-builder";

export function buildTail({ b, J, P, M }: Ctx) {
  const tailPink = P.bodyPink;
  const shadow = P.bodyShadow;
  const fin = P["fin membrane"];

  const body = J.body;
  const tail1 = J.tail1;
  const tail2 = J.tail2;
  const tail3 = J.tail3;

  const spine = catmull([
    M.tailRoot ?? [0, 0.14, -0.13],
    tail1.at,
    tail2.at,
    tail3.at,
    [0.012, 0.142, -0.305],
    [0.028, 0.165, -0.323],
    [0.048, 0.19, -0.315],
  ]);

  const tail = b.sweep(spine, (t: number) => {
    if (t < 0.08) return 0.078;
    if (t < 0.22) return 0.085 - (t - 0.08) * 0.09;
    if (t < 0.58) return 0.072 - (t - 0.22) * 0.075;
    return Math.max(0.012, 0.045 - (t - 0.58) * 0.082);
  }, {
    bone: [body, tail1, tail2, tail3],
    color: tailPink,
    sides: 8,
    caps: { start: "round", end: "round" },
    name: "tailTube",
    group: "tail",
  });

  const topEdge = catmull([
    [0, 0.19, -0.145],
    [0, 0.215, -0.18],
    [0, 0.235, -0.225],
    [0.008, 0.235, -0.27],
    [0.028, 0.205, -0.315],
  ]);

  const topRoot = tail.line(0, -0.002).slice(0.045, 0.98);
  b.membrane(topRoot, topEdge, {
    bone: [body, tail1, tail2, tail3],
    color: fin,
    thickness: 0.006,
    rows: 4,
    cols: 12,
    scallop: 0.22,
    name: "tailDorsalFin",
    group: "tailFin",
  });

  const bottomEdge = catmull([
    [0, 0.095, -0.145],
    [0, 0.075, -0.18],
    [0, 0.07, -0.225],
    [0.008, 0.085, -0.27],
    [0.028, 0.14, -0.315],
  ]);

  const bottomRoot = tail.line(180, -0.002).slice(0.045, 0.98);
  b.membrane(bottomRoot, bottomEdge, {
    bone: [body, tail1, tail2, tail3],
    color: fin,
    thickness: 0.006,
    rows: 4,
    cols: 12,
    scallop: 0.22,
    name: "tailVentralFin",
    group: "tailFin",
  });

  const top = b.surface(tail);
  const spots = [
    top.nearest([0.018, 0.198, -0.17]),
    top.nearest([-0.022, 0.181, -0.205]),
    top.nearest([0.01, 0.17, -0.247]),
  ];

  for (let i = 0; i < spots.length; i++) {
    const hit = spots[i];
    if (!hit) continue;
    b.stick(
      new THREE.SphereGeometry(0.009 - i * 0.0012, 7, 4),
      shadow,
      hit,
      {
        embed: 0.72,
        name: `tailFreckle${i + 1}`,
        group: "tailDetail",
      },
    );
  }

  const ridge = b.along(tail, 5, (at: any) => {
    if (at.t < 0.14 || at.t > 0.82) return;
    b.spike(at, at, 0.012, 0.006, {
      color: shadow,
      name: "tailRidge",
      group: "tailDetail",
    });
  });

  return b.root;
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: Ctx) {
  const pink = P.bodyPink;
  const shadow = P.bodyShadow;
  const cream = P.bellyCream;
  const toe = P.toePad;

  const legData = [
    { name: "legFL", joint: J.legFL, x: 0.085, z: 0.05, side: 1, front: true },
    { name: "legFR", joint: J.legFR, x: -0.085, z: 0.05, side: -1, front: true },
    { name: "legBL", joint: J.legBL, x: 0.085, z: -0.1, side: 1, front: false },
    { name: "legBR", joint: J.legBR, x: -0.085, z: -0.1, side: -1, front: false },
  ];

  const footRadius = 0.034;
  const ankleY = 0.032;

  for (const leg of legData) {
    const bone = leg.joint;
    const hip = new THREE.Vector3(leg.x, 0.085, leg.z);
    const ankle = new THREE.Vector3(leg.x, ankleY, leg.z);

    // Rounded, gently tapered upper leg, buried slightly into the torso.
    b.capsule(hip, ankle, [0.032, 0.024], {
      bone,
      color: pink,
      caps: "round",
      section: { ngon: 8 },
      name: `${leg.name}_pink`,
      group: "legs",
    });

    // A small shadow-colored underside gives the otherwise simple limb a soft
    // cel-like separation from the pale belly.
    const shadowTop = new THREE.Vector3(leg.x, 0.064, leg.z + (leg.front ? 0.006 : -0.004));
    const shadowBottom = new THREE.Vector3(leg.x, 0.035, leg.z + (leg.front ? 0.008 : -0.006));
    b.capsule(shadowTop, shadowBottom, [0.018, 0.013], {
      bone,
      color: shadow,
      caps: "round",
      section: { ngon: 7 },
      name: `${leg.name}_underside`,
      group: "legs",
    });

    // Squashed cream foot pad: its lower surface is just above the floor.
    const pad = b.part(new THREE.SphereGeometry(footRadius, 10, 7), cream, {
      bone,
      at: [leg.x, 0.031, leg.z + (leg.front ? 0.006 : -0.004)],
      scale: [1.12, 0.62, 1.18],
      name: `${leg.name}_foot`,
      group: "legs",
      flat: true,
    });

    const padCenter = new THREE.Vector3(
      leg.x,
      0.025,
      leg.z + (leg.front ? 0.008 : -0.006),
    );

    // Three stubby toes. Front feet point forward; rear feet fan slightly
    // outward while still retaining the characteristic axolotl paddle shape.
    const toeOffsets = [
      [-0.014, 0.000],
      [0.000, leg.front ? 0.006 : -0.002],
      [0.014, 0.000],
    ] as const;

    for (let i = 0; i < toeOffsets.length; i++) {
      const [outward, forward] = toeOffsets[i];
      const spread = outward * leg.side;
      const forwardBias =
        forward +
        (leg.front ? 0.032 : 0.018) +
        (i === 1 ? 0.006 : 0);

      const start = new THREE.Vector3(
        padCenter.x + spread * 0.35,
        0.019,
        padCenter.z + (leg.front ? 0.012 : -0.006),
      );
      const end = new THREE.Vector3(
        padCenter.x + spread,
        0.014,
        padCenter.z + forwardBias,
      );

      b.capsule(start, end, 0.008, {
        bone,
        color: cream,
        caps: "round",
        section: { ngon: 7 },
        name: `${leg.name}_toe${i + 1}`,
        group: "legs",
      });

      // Tiny pink toe bean at each tip, seated low enough to make contact
      // without hanging visibly below the foot silhouette.
      b.part(new THREE.SphereGeometry(0.009, 7, 5), toe, {
        bone,
        at: [end.x, 0.013, end.z],
        scale: [1.05, 0.7, 1.15],
        name: `${leg.name}_toe${i + 1}_pad`,
        group: "legs",
        flat: true,
      });
    }
  }
}
```

<!-- call: headFace -->

```ts
import * as THREE from "three";
import { catmull, createBuilder, rng } from "agentic-3js-builder";

export function buildHeadFace({ b, J, P, M }: Ctx) {
  const BODY = P.bodyPink ?? "#f5c3d2";
  const SHADOW = P.bodyShadow ?? "#e3a7bd";
  const CREAM = P.bellyCream ?? "#fdeef4";
  const INK = P.ink ?? "#2a1a24";
  const WHITE = P.glossWhite ?? "#ffffff";
  const BLUSH = P.blush ?? "#ff9fb6";
  const NOSTRIL = P.nostril ?? "#c98aa4";

  const headCenter: [number, number, number] = [0, 0.17, 0.13];

  // Oversized, deliberately faceted head. The small overlap at the back hides the
  // neck socket and lets the torso blend into the silhouette.
  b.part(
    new THREE.SphereGeometry(0.15, 14, 10),
    BODY,
    {
      bone: J.head,
      at: headCenter,
      scale: [1.05, 0.92, 0.95],
      flat: true,
      name: "headFace.skull",
      group: "headFace",
    },
  );

  // A slightly darker lower rim gives the round head a soft painted underside.
  b.part(
    new THREE.SphereGeometry(0.151, 14, 8, 0, Math.PI * 2, Math.PI * 0.48, Math.PI * 0.34),
    SHADOW,
    {
      bone: J.head,
      at: [0, 0.17, 0.13],
      scale: [1.04, 0.9, 0.955],
      flat: true,
      name: "headFace.lowerShade",
      group: "headFace",
    },
  );

  // Separate cream chin/lower jaw, attached to the jaw hinge so it can open.
  b.part(
    new THREE.SphereGeometry(0.105, 12, 7),
    CREAM,
    {
      bone: J.jaw,
      at: [0, 0.095, 0.205],
      scale: [1.0, 0.42, 0.43],
      flat: true,
      name: "headFace.chin",
      group: "face",
    },
  );

  // Tiny cream muzzle highlight tucked into the chin.
  b.part(
    new THREE.SphereGeometry(0.052, 10, 6),
    "#fff8fb",
    {
      bone: J.jaw,
      at: [0, 0.112, 0.235],
      scale: [1.18, 0.36, 0.28],
      flat: true,
      name: "headFace.chinHighlight",
      group: "face",
    },
  );

  // Big bead eyes: wide, low, and slightly proud of the face.
  for (const side of [-1, 1]) {
    const x = side * 0.066;

    b.part(
      new THREE.SphereGeometry(0.035, 10, 8),
      INK,
      {
        bone: J.head,
        at: [x, 0.158, 0.267],
        scale: [1.0, 1.08, 0.72],
        flat: true,
        name: `headFace.eye${side > 0 ? "L" : "R"}`,
        group: "face",
      },
    );

    // Two little highlights make the black eyes glossy and toy-like.
    b.part(
      new THREE.SphereGeometry(0.0085, 7, 5),
      WHITE,
      {
        bone: J.head,
        at: [x - side * 0.009, 0.169, 0.292],
        scale: [1, 0.85, 0.45],
        flat: true,
        name: `headFace.eye${side > 0 ? "L" : "R"}.highlight`,
        group: "face",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.0042, 6, 4),
      WHITE,
      {
        bone: J.head,
        at: [x + side * 0.010, 0.145, 0.294],
        scale: [1, 0.8, 0.4],
        flat: true,
        name: `headFace.eye${side > 0 ? "L" : "R"}.glint`,
        group: "face",
      },
    );

    // Soft pink cheek discs, slightly below and outward from each eye.
    b.part(
      new THREE.CircleGeometry(0.027, 10),
      BLUSH,
      {
        bone: J.head,
        at: [x + side * 0.012, 0.116, 0.278],
        dir: [0, 0, 1],
        axis: "z",
        scale: [1.15, 0.62, 1],
        name: `headFace.blush${side > 0 ? "L" : "R"}`,
        group: "face",
      },
    );

    // Eyelid creases: two short, raised arcs over the eyes.
    const lid = catmull([
      [x - side * 0.027, 0.199, 0.287],
      [x - side * 0.013, 0.207, 0.291],
      [x + side * 0.014, 0.207, 0.291],
      [x + side * 0.029, 0.198, 0.287],
    ]);
    b.sweep(lid, 0.0023, {
      bone: J.head,
      color: INK,
      caps: "round",
      sides: 6,
      name: `headFace.lid${side > 0 ? "L" : "R"}`,
      group: "face",
    });
  }

  // Wide sleepy smile with lifted corners.
  const smile = catmull([
    [-0.073, 0.096, 0.278],
    [-0.058, 0.086, 0.286],
    [-0.031, 0.079, 0.291],
    [0, 0.077, 0.293],
    [0.031, 0.079, 0.291],
    [0.058, 0.086, 0.286],
    [0.073, 0.096, 0.278],
  ]);
  b.sweep(smile, 0.0031, {
    bone: J.head,
    color: INK,
    caps: "round",
    sides: 6,
    name: "headFace.sleepySmile",
    group: "face",
  });

  // Small inner smile dimple lines reinforce the upturned ends.
  for (const side of [-1, 1]) {
    b.sweep(
      [
        [side * 0.069, 0.096, 0.279],
        [side * 0.078, 0.104, 0.276],
        [side * 0.082, 0.112, 0.271],
      ],
      0.0018,
      {
        bone: J.head,
        color: INK,
        caps: "round",
        sides: 6,
        name: `headFace.smileCorner${side > 0 ? "L" : "R"}`,
        group: "face",
      },
    );
  }

  // Two tiny nostril dots, placed above the smile.
  for (const side of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(0.005, 7, 5),
      NOSTRIL,
      {
        bone: J.head,
        at: [side * 0.018, 0.193, 0.286],
        scale: [1.15, 0.7, 0.48],
        flat: true,
        name: `headFace.nostril${side > 0 ? "L" : "R"}`,
        group: "face",
      },
    );
  }

  // Sparse freckles on the crown: deliberately irregular and very subtle.
  const freckles = [
    [-0.073, 0.246, 0.207, 0.004],
    [-0.045, 0.259, 0.199, 0.003],
    [0.055, 0.257, 0.205, 0.004],
    [0.082, 0.238, 0.214, 0.003],
    [0.018, 0.266, 0.201, 0.0028],
    [-0.012, 0.269, 0.202, 0.0026],
  ] as const;

  for (let i = 0; i < freckles.length; i++) {
    const [x, y, z, r] = freckles[i];
    b.part(
      new THREE.SphereGeometry(r, 6, 4),
      SHADOW,
      {
        bone: J.head,
        at: [x, y, z],
        scale: [1, 0.7, 0.45],
        flat: true,
        name: `headFace.freckle${i + 1}`,
        group: "face",
      },
    );
  }

  // A pair of tiny pale lower-face accents gives the chin a soft plush boundary.
  for (const side of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(0.006, 6, 4),
      CREAM,
      {
        bone: J.head,
        at: [side * 0.042, 0.106, 0.281],
        scale: [1.2, 0.6, 0.5],
        flat: true,
        name: `headFace.muzzleAccent${side > 0 ? "L" : "R"}`,
        group: "face",
      },
    );
  }
}
```