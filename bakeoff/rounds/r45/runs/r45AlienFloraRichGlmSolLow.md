<!-- call: plan -->

```json
{
  "name": "Pandoran Glowspire",
  "description": "A tall bioluminescent alien plant: a dark indigo spiral-veined stalk rising from a root mound into a crown of glowing fronds, ringed by three huge unfurling helicoradian coils and clusters of lit ground pods.",
  "builderName": "luminousFlora",
  "size": [2.2, 2.6, 2.0],
  "layout": "Front (+Z) view: a low root mound 0.4 m tall fills the footprint, its rim carrying buttress roots, moss, glowing mushroom clusters and lit ground pods. From the mound centre a single dark indigo stalk rises with a gentle forward-then-back lean to 2.3 m, wrapped in glowing vertebra rings at each spine joint. At the crown hub the stalk opens into a fan of 8-10 broad teal fronds that arc out and down to a 2.0 m spread, every frond edged and veined in bright cyan light, with glowing spore pods hanging beneath them. Three helicoradian coils anchor to the mound ring: one front-left, one back-right, one front-right, each a thin stem curling into a huge spiralled frond sheet up to 1.5 m tall, its rim glowing pink-cyan. All silhouettes are bold low-poly curves; every light line, vein and pod is its own small glowing part against the dark flora colours.",
  "palette": {
    "bark": "#2b3a4a",
    "barkLight": "#3e5866",
    "frondDark": "#1d4a4e",
    "frondMid": "#2f7a72",
    "glowCyan": "#39e6d2",
    "glowBlue": "#4aa8ff",
    "glowPink": "#ff5fd2",
    "glowViolet": "#8a5cff",
    "sporeGold": "#ffd25f",
    "rootPlum": "#332a55",
    "soil": "#1a2233",
    "moss": "#2f6f5f",
    "capViolet": "#5a3ec8",
    "gillCyan": "#63f2ff",
    "stemCoil": "#244a5e",
    "ink": "#101a24"
  },
  "mounts": {
    "soilRing": [0, 0.12, 0],
    "stalkFoot": [0, 0.35, 0],
    "crownHub": [0, 2.25, 0.28],
    "coilAnchorA": [0.72, 0.12, 0.18],
    "coilAnchorB": [-0.58, 0.12, -0.42],
    "coilAnchorC": [-0.12, 0.12, 0.68]
  },
  "joints": [
    { "name": "base", "at": [0, 0.12, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "stalk1", "parent": "base", "at": [0, 0.55, 0.04], "dir": [0, 1, 0.18], "role": "spine" },
    { "name": "stalk2", "parent": "stalk1", "at": [0, 1.2, 0.18], "dir": [0, 1, 0.12], "role": "spine" },
    { "name": "stalk3", "parent": "stalk2", "at": [0, 1.8, 0.27], "dir": [0, 1, 0.02], "role": "spine" },
    { "name": "crown", "parent": "stalk3", "at": [0, 2.25, 0.28], "dir": [0, 0.9, -0.25], "role": "neck" },
    { "name": "coilA", "parent": "base", "at": [0.72, 0.12, 0.18], "dir": [0.55, 0.7, 0.45], "role": "tentacle" },
    { "name": "coilB", "parent": "base", "at": [-0.58, 0.12, -0.42], "dir": [-0.5, 0.75, -0.42], "role": "tentacle" },
    { "name": "coilC", "parent": "base", "at": [-0.12, 0.12, 0.68], "dir": [-0.1, 0.8, 0.58], "role": "tentacle" }
  ],
  "parts": [
    {
      "id": "rootMound",
      "builds": "The ground piece: a smooth lathe or lofted mound of dark soil (soil) rising from y=0 to about 0.35 m at the centre and thinning to a lip at radius ~0.9 m, with 5-7 buttress roots in rootPlum flaring out of the mound sides like low fins, each tipped with a tiny glowCyan stud. Moss patches (moss) as flat painted blotches or thin slabs on upward faces. Two features cluster on the mound: a group of 5 glowing mushrooms (capViolet domes on short stems, gillCyan undersides and stem rings, all glow kit lit) near the front-left, and a cluster of 3 teardrop ground pods in rootPlum with vertical glowPink slit lights and glowCyan rim rims near the front-right. Scatter small glowCyan pebble-lights over the soil. The stalk passes through the mound centre; leave a collar of dark bark there so stalkFoot reads as planted. This part owns joints base, coilA, coilB, coilC.",
      "box": [[-1.05, 0, -0.95], [1.05, 0.45, 1.0]],
      "attaches": "Owns the floor (floor: true). Its top centre is the stalkFoot mount where the stalk emerges; its mound surface at the three coilAnchor points is where the coils root.",
      "joints": ["base", "coilA", "coilB", "coilC"],
      "floor": true,
      "budget": 210
    },
    {
      "id": "stalk",
      "builds": "The main trunk: one sweep along the base-stalk1-stalk2-stalk3-crown chain, radius tapering from ~0.11 m at the foot to ~0.05 m under the crown, catmull through the joint positions so the lean reads. Bark in bark with a subtle two-tone mottle or gradient toward barkLight on up-facing sides; section circle with modest sides for a faceted look. Signature detail: at each spine joint, a glowing vertebra ring in glowCyan (a thin band or ring of small studs seated on the bark via surface loop/along), and 2-3 rows of small blister studs in barkLight climbing the trunk between rings. Near the foot, two short bark thorn frustumBoxes or spikes lean against the trunk. Add 3-4 tiny glowBlue lichen dots scattered up the shaded side. The crown joint tops out at the crownHub mount; cap the sweep with a small bud in frondDark so the canopy sits on it.",
      "box": [[-0.4, 0.3, -0.35], [0.4, 2.3, 0.55]],
      "attaches": "Emerges from rootMound at the stalkFoot mount (its buried foot continues into the mound); its top ends at the crownHub mount where canopy attaches.",
      "joints": ["base", "stalk1", "stalk2", "stalk3", "crown"],
      "floor": false,
      "budget": 180
    },
    {
      "id": "canopy",
      "builds": "The glowing crown: around the crownHub mount, a ring of 8-10 fronds built as b.ring frames about the crown line, each frond an extruded leaf shape (smooth 2, thickness tapering 0.02 to 0.004) curving outward and down like an umbrella, sized 0.5-0.8 m. Frond bodies in frondDark with the outer third fading to frondMid via gradient; every frond carries 3-5 thin vein slabs or rod lines in glowCyan running root to tip, plus a glowCyan rim edge, all glow-lit. Between fronds, the central bud at the hub: a small lathe dome in frondMid with a glowViolet tip light. Beneath the fronds hang 6-8 spore pods on thin stalk rods: small lathe or capsule pods in sporeGold and glowPink, alternating, each glowing softly, dangling at varied lengths 0.15-0.3 m. Group the fronds under 3-4 fan group joints created with b.ring joints option so they can be posed together.",
      "box": [[-1.0, 1.85, -0.9], [1.0, 2.6, 0.7]],
      "attaches": "Roots entirely at the crownHub mount on top of the stalk; hanging pods stay above rootMound's box and clear of the coils.",
      "joints": ["crown"],
      "floor": false,
      "budget": 240
    },
    {
      "id": "coils",
      "builds": "Three helicoradian spirals, one per coilAnchor mount, each riding its coil joint: a thin stem rod (stemCoil, radius ~0.02) rising from the anchor and curling over via a catmull or spiral path up to 1.2-1.5 m, then a huge unfurling frond sheet built as a membrane or lofted ribbon following a spiral that tightens toward the tip, in frondDark with the curl edge in frondMid. Each coil's outer rim carries a continuous glowPink edge line (a thin swept band along the rim) and 4-6 glowCyan vein rods across the sheet, glow-lit. Vary the three coils: coilA tallest and leaning right-forward, coilB shorter and curled tighter, coilC mid-height unfurling toward the front so the trio reads as a family, not copies. Each stem base gets a small mound collar and 2 root fins in rootPlum to seat it on the mound. Keep the inner volumes clear of the stalk box.",
      "box": [[-1.1, 0, -1.0], [1.1, 1.5, 1.0]],
      "attaches": "Each coil stems from its named coilAnchor mount on the rootMound surface, geometry riding its coilA/coilB/coilC joint; tips stay inside the box, below the canopy.",
      "joints": ["coilA", "coilB", "coilC"],
      "floor": false,
      "budget": 220
    }
  ]
}
```

<!-- call: canopy -->

```ts
import * as THREE from "three";
import {
  catmull,
  frame,
  line,
  rng,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCanopy({ b, J, P, M }: Ctx) {
  const crown = J.crown;
  const crownAt = M.crownHub ?? crown.at;

  const dark = P.frondDark ?? "#1d4a4e";
  const mid = P.frondMid ?? "#2f7a72";
  const cyan = P.glowCyan ?? "#39e6d2";
  const blue = P.glowBlue ?? "#4aa8ff";
  const pink = P.glowPink ?? "#ff5fd2";
  const violet = P.glowViolet ?? "#8a5cff";
  const gold = P.sporeGold ?? "#ffd25f";
  const ink = P.ink ?? "#101a24";

  const random = rng(9137);
  const crownLine = line(crown, crown.dir([0, 1, 0.05]));

  // A compact group of fan bones gives the fronds a useful, recognizable rig.
  const fan = b.ring(
    crownLine,
    {
      count: 9,
      radius: 0.075,
      fromDeg: 0,
      toDeg: 360,
      joints: 3,
      parent: crown,
      name: "canopyFan",
      names: ["canopyFanL", "canopyFanC", "canopyFanR"],
      role: "fan",
      group: "canopy",
    },
  );

  const frondTips: THREE.Vector3[] = [];
  const frondRoots: THREE.Vector3[] = [];

  for (let i = 0; i < fan.items.length; i++) {
    const at = fan.items[i];
    const a = (i / fan.items.length) * Math.PI * 2;
    const side = Math.sin(a);
    const front = Math.cos(a);
    const reach = 0.54 + (i % 3) * 0.065;
    const drop = 0.12 + ((i * 7) % 4) * 0.025;

    const root = at.at.clone().add(new THREE.Vector3(0, 0.015, 0));
    const bend = new THREE.Vector3(
      Math.sin(a) * reach * 0.48,
      2.25 - 0.045 * (i % 2),
      0.28 + Math.cos(a) * reach * 0.5,
    );
    const tip = new THREE.Vector3(
      Math.sin(a) * reach,
      2.13 - drop,
      0.28 + Math.cos(a) * reach,
    );
    const crest = new THREE.Vector3(
      Math.sin(a) * reach * 0.78,
      2.2 - drop * 0.35,
      0.28 + Math.cos(a) * reach * 0.82,
    );

    frondRoots.push(root);
    frondTips.push(tip);

    const center = catmull([root, bend, crest, tip]);
    const body = b.sweep(center, (t) => 0.055 * (1 - t) + 0.018 * t, {
      color: t => t > 0.68 ? mid : dark,
      bone: at.bone ?? crown,
      section: { ngon: 6 },
      caps: "round",
      group: "canopy-frond",
      name: `canopyFrond${i}`,
    });
    glow(body, 0.18);

    // Broad leaf blade, tapering to a sharp outer end.
    const tangent = center.tangentAt(0.52).normalize();
    const across = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const left: THREE.Vector3[] = [];
    const right: THREE.Vector3[] = [];
    const samples = 7;
    for (let j = 0; j <= samples; j++) {
      const t = j / samples;
      const p = center.at(t);
      const width = 0.025 + 0.115 * Math.sin(Math.PI * t) * (1 - 0.18 * t);
      left.push(p.clone().addScaledVector(across, width));
      right.push(p.clone().addScaledVector(across, -width));
    }
    const blade = b.membrane(left, right, {
      color: mid,
      thickness: 0.012,
      rows: 3,
      cols: 8,
      bone: at.bone ?? crown,
      group: "canopy-blade",
      name: `canopyBlade${i}`,
    });
    glow(blade, 0.3);

    // Five independent luminous veins, each narrowing toward the tip.
    for (let v = -2; v <= 2; v++) {
      const frac = v / 2;
      const vein: THREE.Vector3[] = [];
      for (let j = 0; j <= 5; j++) {
        const t = j / 5;
        const p = center.at(t);
        const width = frac * (0.012 + 0.078 * Math.sin(Math.PI * t));
        vein.push(p.clone().addScaledVector(across, width));
      }
      const tube = b.sweep(catmull(vein), [0.006, 0.002], {
        color: cyan,
        bone: at.bone ?? crown,
        caps: "round",
        section: { ngon: 5 },
        group: "canopy-vein",
        name: `canopyVein${i}_${v + 2}`,
      });
      glow(tube, 1.5);
    }

    // A bright perimeter on both sides of every blade.
    for (const edge of [left, right]) {
      const rim = b.sweep(catmull(edge), [0.008, 0.0025], {
        color: cyan,
        bone: at.bone ?? crown,
        caps: "round",
        section: { ngon: 5 },
        group: "canopy-rim",
        name: `canopyRim${i}`,
      });
      glow(rim, 1.8);
    }
  }

  // Central crown bud: faceted, layered, and tipped with violet light.
  const bud = b.lathe(
    [
      [0, 0],
      [0.12, 0],
      [0.145, 0.045],
      [0.12, 0.13],
      [0.075, 0.22],
      [0, 0.27],
    ],
    {
      at: new THREE.Vector3(crownAt.x, crownAt.y - 0.01, crownAt.z),
      axis: [0, 1, 0],
      segments: 10,
      color: mid,
      bone: crown,
      group: "canopy-bud",
      name: "canopyBud",
    },
  );
  b.stick(new THREE.SphereGeometry(0.045, 8, 6), violet, bud.moved([0, 0.275, 0]), {
    embed: 0.15,
    name: "canopyBudLight",
  });
  glow(bud, 0.25);
  const budLight = b.part(
    new THREE.SphereGeometry(0.04, 8, 6),
    violet,
    { at: new THREE.Vector3(crownAt.x, crownAt.y + 0.265, crownAt.z), bone: crown, group: "canopy-light" },
  );
  glow(budLight, 2.2);

  // Hanging spore lanterns distributed beneath the crown.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.18;
    const radial = 0.22 + (i % 4) * 0.105;
    const x = crownAt.x + Math.sin(a) * radial;
    const z = crownAt.z + Math.cos(a) * radial;
    const y = crownAt.y - 0.14 - (i % 4) * 0.055;

    const hanger = b.rod(
      new THREE.Vector3(x, crownAt.y - 0.06, z),
      new THREE.Vector3(x, y + 0.05, z),
      0.009,
      cyan,
      { bone: crown, caps: "round", group: "spore-stalk", name: `canopySporeStem${i}` },
    );
    glow(hanger, 1.15);

    const podColor = i % 2 === 0 ? gold : pink;
    const pod = b.lathe(
      [
        [0, -0.08],
        [0.035, -0.065],
        [0.055, -0.01],
        [0.047, 0.06],
        [0.018, 0.105],
        [0, 0.12],
      ],
      {
        at: new THREE.Vector3(x, y, z),
        axis: [0, 1, 0],
        segments: 8,
        color: podColor,
        bone: crown,
        group: "spore-pod",
        name: `canopySporePod${i}`,
      },
    );
    glow(pod, i % 2 === 0 ? 1.25 : 1.8);

    const slit = b.part(
      new THREE.BoxGeometry(0.012, 0.065, 0.006),
      i % 2 === 0 ? pink : violet,
      {
        at: new THREE.Vector3(x, y + 0.008, z + 0.052),
        dir: [0, 0, 1],
        axis: "z",
        bone: crown,
        group: "spore-light",
        name: `canopySporeSlit${i}`,
      },
    );
    glow(slit, 2.1);

    const collar = b.part(
      new THREE.CylinderGeometry(0.048, 0.048, 0.012, 8),
      cyan,
      {
        at: new THREE.Vector3(x, y + 0.09, z),
        bone: crown,
        group: "spore-rim",
        name: `canopySporeRim${i}`,
      },
    );
    glow(collar, 1.4);
  }

  // Tiny floating crown motes reinforce the bioluminescent silhouette.
  for (let i = 0; i < 10; i++) {
    const a = random() * Math.PI * 2;
    const r = 0.48 + random() * 0.32;
    const p = new THREE.Vector3(
      crownAt.x + Math.sin(a) * r,
      crownAt.y - 0.03 + random() * 0.27,
      crownAt.z + Math.cos(a) * r,
    );
    const mote = b.part(new THREE.SphereGeometry(0.012 + random() * 0.009, 6, 4), i % 3 ? cyan : blue, {
      at: p,
      bone: crown,
      group: "canopy-motes",
      name: `canopyMote${i}`,
    });
    glow(mote, 2.4);
  }
}
```

<!-- call: stalk -->

```ts
import * as THREE from "three";
import { catmull, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildStalk({ b, J, P, M }: Ctx) {
  const bark = P.bark;
  const barkLight = P.barkLight;
  const cyan = P.glowCyan;
  const blue = P.glowBlue;
  const dark = P.frondDark;
  const ink = P.ink;

  const spine = [J.base, J.stalk1, J.stalk2, J.stalk3, J.crown];
  const points = spine.map((j: any) => j.at);
  const trunkPath = catmull(points, { tension: 0.18 });

  const trunk = b.sweep(trunkPath, (t: number) => 0.108 - 0.058 * t, {
    bone: spine,
    color: bark,
    sides: 7,
    caps: { start: "round", end: "flat" },
    smooth: false,
    name: "stalkTrunk",
    group: "stalk",
  });

  // A dark planted collar makes the trunk visibly emerge from the mound.
  b.part(new THREE.CylinderGeometry(0.135, 0.155, 0.09, 8), ink, {
    bone: J.base,
    at: [0, 0.39, 0.025],
    name: "stalkFootCollar",
    group: "stalk",
  });

  // Bright vertebrae: each ring is a torus plus a crown of raised luminous studs.
  const vertebrae = [
    { j: J.base, p: [0, 0.48, 0.03], r: 0.102 },
    { j: J.stalk1, p: [0, 0.56, 0.045], r: 0.096 },
    { j: J.stalk2, p: [0, 1.20, 0.18], r: 0.078 },
    { j: J.stalk3, p: [0, 1.80, 0.27], r: 0.061 },
  ];

  for (let k = 0; k < vertebrae.length; k++) {
    const v = vertebrae[k];
    const ring = b.part(new THREE.TorusGeometry(v.r, 0.009, 5, 12), cyan, {
      bone: v.j,
      at: v.p,
      name: `vertebraRing${k}`,
      group: "stalkGlow",
    });
    glow(ring, 1.8);

    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const x = v.p[0] + Math.cos(a) * (v.r + 0.004);
      const z = v.p[2] + Math.sin(a) * (v.r + 0.004);
      const stud = b.part(new THREE.SphereGeometry(0.014, 6, 4), cyan, {
        bone: v.j,
        at: [x, v.p[1] + 0.006 * Math.sin(a * 2), z],
        name: `vertebraStud${k}_${i}`,
        group: "stalkGlow",
      });
      glow(stud, 2.1);
    }
  }

  // Small angular bark blisters arranged in staggered climbing rows.
  const blisterRows = [
    [0.70, -0.050, 0.080],
    [0.86, 0.052, 0.075],
    [1.02, -0.045, 0.064],
    [1.38, 0.045, 0.055],
    [1.53, -0.040, 0.052],
    [1.67, 0.038, 0.047],
    [1.96, -0.030, 0.040],
    [2.08, 0.028, 0.037],
  ];

  for (let i = 0; i < blisterRows.length; i++) {
    const [y, x, zoff] = blisterRows[i];
    const parent =
      y < 0.9 ? J.stalk1 :
      y < 1.5 ? J.stalk2 :
      y < 1.9 ? J.stalk3 : J.crown;

    const blister = b.part(
      new THREE.IcosahedronGeometry(0.018 + (i % 3) * 0.003, 0),
      barkLight,
      {
        bone: parent,
        at: [x, y, 0.27 + zoff],
        scale: [1.0, 1.45, 0.7],
        name: `barkBlister${i}`,
        group: "stalkDetail",
      },
    );
  }

  // Four cool-blue lichen lights on the shaded, viewer-facing side.
  const lichen = [
    [0.070, 0.74, 0.105],
    [0.064, 1.08, 0.225],
    [0.046, 1.48, 0.300],
    [0.030, 1.92, 0.318],
  ];
  for (let i = 0; i < lichen.length; i++) {
    const [x, y, z] = lichen[i];
    const parent = y < 1 ? J.stalk1 : y < 1.6 ? J.stalk2 : y < 1.9 ? J.stalk3 : J.crown;
    const dot = b.part(new THREE.SphereGeometry(0.012, 6, 4), blue, {
      bone: parent,
      at: [x, y, z],
      name: `blueLichen${i}`,
      group: "stalkGlow",
    });
    glow(dot, 1.6);
  }

  // Two low-poly thorns brace the lower trunk.
  const thornL = b.spike([0.075, 0.50, 0.045], [0.18, 0.20, 0.10], 0.19, 0.027, {
    color: bark,
    bone: J.base,
    caps: "point",
    name: "footThornL",
    group: "stalkDetail",
  });
  const thornR = b.spike([-0.075, 0.53, 0.045], [-0.17, 0.16, 0.11], 0.17, 0.025, {
    color: bark,
    bone: J.base,
    caps: "point",
    name: "footThornR",
    group: "stalkDetail",
  });

  // Faceted crown bud, seated exactly at the crown mount.
  const bud = b.part(new THREE.ConeGeometry(0.095, 0.18, 7), dark, {
    bone: J.crown,
    at: [0, 2.31, 0.265],
    name: "crownBud",
    group: "stalk",
  });

  const budTip = b.part(new THREE.SphereGeometry(0.026, 7, 5), cyan, {
    bone: J.crown,
    at: [0, 2.405, 0.245],
    name: "crownBudLight",
    group: "stalkGlow",
  });
  glow(budTip, 2.2);

  // Tiny cyan collar immediately below the canopy hub.
  const crownRing = b.part(new THREE.TorusGeometry(0.073, 0.008, 5, 12), cyan, {
    bone: J.crown,
    at: [0, 2.245, 0.28],
    name: "crownCollar",
    group: "stalkGlow",
  });
  glow(crownRing, 1.8);
}
```

<!-- call: coils -->

```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  frame,
  line,
  rng,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCoils({ b, J, P, M }: Ctx) {
  const stem = P.stemCoil;
  const dark = P.frondDark;
  const mid = P.frondMid;
  const root = P.rootPlum;
  const cyan = P.glowCyan;
  const pink = P.glowPink;
  const violet = P.glowViolet;
  const ink = P.ink;

  const random = rng(4817);

  const v = (p: readonly number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const add = (a: THREE.Vector3, b: THREE.Vector3) => a.clone().add(b);
  const scale = (a: THREE.Vector3, n: number) => a.clone().multiplyScalar(n);
  const norm = (a: THREE.Vector3) => a.clone().normalize();

  const makeCoil = (
    name: "A" | "B" | "C",
    mount: readonly number[],
    target: THREE.Vector3,
    turns: number,
    spread: number,
    phase: number,
  ) => {
    const bone = J[`coil${name}`];
    const anchor = v(mount);

    // A sturdy, slightly bent stem grows from the mound before becoming the spiral.
    const rise = add(anchor, new THREE.Vector3(0, 0.22, 0));
    const shoulder = add(anchor, new THREE.Vector3(
      target.x * 0.32,
      target.y * 0.55,
      target.z * 0.32,
    ));

    const stemPath = catmull([anchor, rise, shoulder, target]);
    const stemTube = b.sweep(stemPath, [0.026, 0.018], {
      bone,
      color: stem,
      sides: 7,
      caps: "round",
      name: `coilStem${name}`,
      group: "coils",
    });
    glow(stemTube, 0.18);

    // Collar and paired buttress fins seat every coil visibly into the mound.
    const collar = b.part(
      new THREE.CylinderGeometry(0.075, 0.095, 0.055, 8),
      root,
      {
        bone,
        at: add(anchor, new THREE.Vector3(0, 0.025, 0)),
        name: `coilCollar${name}`,
        group: "coils",
      },
    );

    for (const side of [-1, 1]) {
      const fin = b.extrude(
        [
          [0, 0],
          [0.16, 0.025],
          [0.105, 0.15],
          [0.035, 0.26],
          [0, 0.26],
        ],
        {
          at: add(anchor, new THREE.Vector3(side * 0.045, 0.025, 0)),
          x: [side, 0, 0],
          y: [0, 1, 0],
          thickness: [0.035, 0.012],
          bevel: 0.006,
          smoothing: 1,
          color: root,
          bone,
          name: `coilButtress${name}${side > 0 ? "L" : "R"}`,
          group: "coils",
        },
      );
      const tip = fin.moved(fin.local([0.105, 0.15, 0.025]));
      const stud = b.part(new THREE.SphereGeometry(0.018, 7, 5), cyan, {
        bone,
        at: tip.at,
        name: `buttressLight${name}${side > 0 ? "L" : "R"}`,
        group: "coils",
      });
      glow(stud, 1.8);
    }

    // Spiral centreline. It opens broadly near the root and tightens toward a pointed tip.
    const axis = norm(new THREE.Vector3(
      target.x - anchor.x,
      target.y - anchor.y,
      target.z - anchor.z,
    ));
    const radial = norm(new THREE.Vector3(-axis.z, 0.05, axis.x));
    const lateral = norm(new THREE.Vector3(0, 1, 0).cross(radial));

    const centre: THREE.Vector3[] = [];
    const count = 17;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const angle = phase + turns * Math.PI * 2 * t;
      const radius = spread * (1 - t) * (0.92 - 0.12 * t);
      const along = add(anchor, scale(axis, 0.28 + t * 0.72));
      centre.push(
        along
          .addScaledVector(radial, Math.cos(angle) * radius)
          .addScaledVector(lateral, Math.sin(angle) * radius * 0.66),
      );
    }

    const centrePath = catmull(centre);
    const rachis = b.sweep(centrePath, (t: number) => 0.042 * (1 - 0.72 * t), {
      bone,
      color: mid,
      sides: 7,
      caps: { start: "round", end: "point" },
      name: `coilRachis${name}`,
      group: "coils",
    });

    // Ribbon edges sit on either side of the rachis and form a broad alien leaf.
    const left: THREE.Vector3[] = [];
    const right: THREE.Vector3[] = [];
    for (let i = 0; i < centre.length; i++) {
      const t = i / (centre.length - 1);
      const tangent =
        i === centre.length - 1
          ? centre[i].clone().sub(centre[i - 1]).normalize()
          : centre[i + 1].clone().sub(centre[i]).normalize();
      const across = norm(tangent.clone().cross(new THREE.Vector3(0, 1, 0)));
      const width = spread * (0.72 - 0.58 * t) * (0.88 + 0.12 * Math.sin(t * Math.PI));
      left.push(centre[i].clone().addScaledVector(across, width));
      right.push(centre[i].clone().addScaledVector(across, -width));
    }

    const leaf = b.membrane(catmull(left), catmull(right), {
      bone,
      color: dark,
      thickness: 0.012,
      rows: 7,
      cols: 18,
      scallop: 0.12,
      name: `coilFrond${name}`,
      group: "coils",
    });

    // A darker inner seam and a luminous outer rim make the silhouette legible.
    const innerRim = b.sweep(catmull(left), [0.012, 0.004], {
      bone,
      color: mid,
      sides: 5,
      caps: "point",
      name: `coilInnerRim${name}`,
      group: "coils",
    });
    const outerRim = b.sweep(catmull(right), [0.016, 0.003], {
      bone,
      color: pink,
      sides: 6,
      caps: "point",
      name: `coilGlowRim${name}`,
      group: "coils",
    });
    glow(outerRim, 2.4);

    // Bright veins cross the sheet at varied angles, each tapering toward the edge.
    const veinCount = name === "B" ? 4 : 5;
    for (let j = 1; j <= veinCount; j++) {
      const t = j / (veinCount + 1);
      const idx = Math.max(1, Math.min(centre.length - 2, Math.floor(t * (centre.length - 1))));
      const tangent = centre[idx + 1].clone().sub(centre[idx - 1]).normalize();
      const across = norm(tangent.clone().cross(new THREE.Vector3(0, 1, 0)));
      const p = centre[idx].clone();
      const w = spread * (0.62 - 0.38 * t);
      const bend = Math.sin(j * 2.3 + phase) * 0.035;
      const a = p.clone().addScaledVector(across, -w * 0.92).addScaledVector(tangent, -0.06);
      const c = p.clone().addScaledVector(across, bend);
      const d = p.clone().addScaledVector(across, w * 0.92).addScaledVector(tangent, 0.06);
      const vein = b.sweep(catmull([a, c, d]), [0.009, 0.003], {
        bone,
        color: cyan,
        sides: 5,
        caps: "point",
        name: `coilVein${name}${j}`,
        group: "coils",
      });
      glow(vein, 2.1);
    }

    // Small violet seed-lights sit at the tightening end of each spiral.
    const tip = centre[centre.length - 1];
    const bud = b.part(new THREE.SphereGeometry(0.035, 8, 6), violet, {
      bone,
      at: tip,
      scale: [1, 1.4, 1],
      name: `coilTip${name}`,
      group: "coils",
    });
    glow(bud, 2.2);

    // Discrete cyan beads emphasize the otherwise continuous rim.
    for (let i = 2; i < centre.length - 1; i += 3) {
      const bead = b.part(new THREE.SphereGeometry(0.014, 6, 4), cyan, {
        bone,
        at: right[i],
        name: `coilRimBead${name}${i}`,
        group: "coils",
      });
      glow(bead, 1.7);
    }

    // A few tiny ink-dark underside scales add contrast to the sheet.
    for (let i = 3; i < centre.length - 2; i += 5) {
      const scalePart = b.part(new THREE.ConeGeometry(0.022, 0.035, 5), ink, {
        bone,
        at: centre[i].clone().add(new THREE.Vector3(0, -0.012, 0)),
        dir: [0, -1, 0],
        name: `coilUnderside${name}${i}`,
        group: "coils",
      });
      scalePart.mesh.scale.set(1, 0.55, 1);
    }

    return { collar, stemTube, rachis, leaf, outerRim };
  };

  makeCoil(
    "A",
    M.coilAnchorA,
    new THREE.Vector3(0.78, 1.43, 0.48),
    1.72,
    0.31,
    0.45,
  );

  makeCoil(
    "B",
    M.coilAnchorB,
    new THREE.Vector3(-0.78, 1.18, -0.16),
    1.98,
    0.27,
    2.5,
  );

  makeCoil(
    "C",
    M.coilAnchorC,
    new THREE.Vector3(0.18, 1.30, 0.88),
    1.48,
    0.34,
    -0.85,
  );
}
```

<!-- call: rootMound -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildRootMound({ b, J, P, M }: Ctx) {
  const soil = P.soil;
  const root = P.rootPlum;
  const moss = P.moss;
  const cyan = P.glowCyan;
  const pink = P.glowPink;
  const violet = P.capViolet;
  const gill = P.gillCyan;
  const bark = P.bark;
  const ink = P.ink;
  const gold = P.sporeGold;

  const baseBone = J.base;
  const rA = J.coilA;
  const rB = J.coilB;
  const rC = J.coilC;
  const rand = rng(417);

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    bone = baseBone,
    extra: Record<string, unknown> = {},
  ) => b.part(geometry, color, { at, bone, ...extra });

  const glowing = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    bone = baseBone,
    strength = 1.7,
    extra: Record<string, unknown> = {},
  ) => glow(part(geometry, color, at, bone, extra), strength);

  // Broad, faceted soil mound, with a low dark skirt that visibly meets the floor.
  part(
    new THREE.CylinderGeometry(0.91, 1.02, 0.035, 12, 1, false),
    soil,
    [0, 0.017, 0],
  );
  b.lathe(
    [
      [0, 0.025],
      [0.98, 0.025],
      [0.95, 0.075],
      [0.84, 0.15],
      [0.69, 0.245],
      [0.48, 0.335],
      [0.23, 0.405],
      [0, 0.425],
    ],
    {
      at: [0, 0, 0],
      axis: [0, 1, 0],
      segments: 12,
      color: soil,
      bone: baseBone,
      name: "rootMound.soil",
      group: "rootMound",
    },
  );

  // Raised central collar: the stalk appears planted rather than simply ending on the soil.
  part(
    new THREE.CylinderGeometry(0.19, 0.23, 0.11, 9, 1),
    bark,
    [0, 0.39, 0],
    baseBone,
  );
  part(
    new THREE.TorusGeometry(0.18, 0.018, 5, 12),
    root,
    [0, 0.45, 0],
    baseBone,
    { rotation: [-90, 0, 0] },
  );

  // Seven angular buttress roots around the mound. The front roots are intentionally larger.
  const rootAngles = [-155, -112, -62, -18, 35, 92, 148];
  rootAngles.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const x = Math.sin(a);
    const z = Math.cos(a);
    const near: [number, number, number] = [x * 0.22, 0.12, z * 0.22];
    const far: [number, number, number] = [x * (0.88 + (i % 2) * 0.06), 0.025, z * (0.88 + (i % 2) * 0.06)];
    const width = i % 3 === 0 ? 0.19 : 0.14;
    const pts: [number, number, number][] = [
      [near[0] - z * width, 0.04, near[2] + x * width],
      [near[0] + z * width, 0.04, near[2] - x * width],
      [far[0] + z * width * 0.32, 0.035, far[2] - x * width * 0.32],
      [far[0], 0.27 + (i % 2) * 0.035, far[2]],
      [far[0] - z * width * 0.32, 0.035, far[2] + x * width * 0.32],
    ];
    const geo = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const faces = [
      [0, 1, 2], [0, 2, 3], [0, 3, 4],
      [5, 7, 6], [5, 8, 7], [5, 9, 8],
      [0, 5, 6], [0, 6, 1],
      [1, 6, 7], [1, 7, 2],
      [2, 7, 8], [2, 8, 3],
      [3, 8, 9], [3, 9, 4],
      [4, 9, 5], [4, 5, 0],
    ];
    const bottom = pts.map(p => [p[0], 0.025, p[2]] as [number, number, number]);
    [...pts, ...bottom].forEach(p => vertices.push(...p));
    const indices: number[] = [];
    for (const f of faces) indices.push(...f);
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    part(geo, root, [0, 0, 0], baseBone, { name: `rootMound.buttress${i}` });
    glowing(
      new THREE.SphereGeometry(0.027, 7, 5),
      cyan,
      [far[0] * 1.015, 0.275 + (i % 2) * 0.035, far[2] * 1.015],
    );
  });

  // Moss shelves and flat polygonal patches on the upward-facing mound.
  const mossPatches: [number, number, number, number][] = [
    [-0.58, 0.255, 0.12, -18],
    [-0.24, 0.355, 0.16, 22],
    [0.38, 0.285, 0.13, -30],
    [0.64, 0.17, 0.11, 42],
    [-0.72, 0.13, 0.10, 8],
  ];
  mossPatches.forEach(([x, y, z, rot], i) => {
    const g = new THREE.CircleGeometry(0.085 + (i % 2) * 0.025, 7);
    part(g, moss, [x, y + 0.006, z], baseBone, {
      rotation: [-90, 0, rot],
      name: `rootMound.moss${i}`,
    });
    if (i < 4)
      glowing(
        new THREE.SphereGeometry(0.012, 6, 4),
        cyan,
        [x + 0.045, y + 0.012, z + 0.018],
        baseBone,
        1.3,
      );
  });

  // Five little mushroom colonies on the front-left quadrant.
  const mushrooms: [number, number, number, number][] = [
    [-0.58, 0.23, 0.42, 0.105],
    [-0.43, 0.25, 0.53, 0.078],
    [-0.72, 0.16, 0.55, 0.065],
    [-0.29, 0.31, 0.47, 0.06],
    [-0.61, 0.22, 0.67, 0.048],
  ];
  mushrooms.forEach(([x, y, z, radius], i) => {
    const stemH = 0.10 + (i % 3) * 0.025;
    part(
      new THREE.CylinderGeometry(radius * 0.22, radius * 0.3, stemH, 7),
      gill,
      [x, y + stemH / 2, z],
      baseBone,
    );
    part(
      new THREE.TorusGeometry(radius * 0.25, radius * 0.012, 4, 8),
      cyan,
      [x, y + stemH * 0.45, z],
      baseBone,
      { rotation: [-90, 0, 0] },
    );
    const cap = b.lathe(
      [
        [0, 0],
        [radius * 0.38, 0.008],
        [radius * 0.78, 0.025],
        [radius, 0.055],
        [radius * 0.74, 0.082],
        [radius * 0.28, 0.093],
        [0, 0.09],
      ],
      {
        at: [x, y + stemH, z],
        axis: [0, 1, 0],
        segments: 8,
        color: violet,
        bone: baseBone,
        name: `rootMound.mushroomCap${i}`,
      },
    );
    glow(cap, 1.45);
    glowing(
      new THREE.CylinderGeometry(radius * 0.65, radius * 0.72, 0.008, 8),
      gill,
      [x, y + stemH - 0.004, z],
      baseBone,
      1.6,
    );
    glowing(
      new THREE.SphereGeometry(radius * 0.1, 6, 4),
      gold,
      [x + radius * 0.25, y + stemH + 0.07, z + radius * 0.18],
      baseBone,
      1.8,
    );
  });

  // Three low teardrop pods at the front-right, each with a bright slit and cyan rim.
  const pods: [number, number, number, number][] = [
    [0.43, 0.12, 0.48, 0.17],
    [0.68, 0.10, 0.38, 0.14],
    [0.58, 0.09, 0.66, 0.115],
  ];
  pods.forEach(([x, y, z, s], i) => {
    const pod = b.lathe(
      [
        [0, 0],
        [s * 0.48, 0.012],
        [s * 0.75, s * 0.12],
        [s * 0.82, s * 0.35],
        [s * 0.53, s * 0.76],
        [s * 0.16, s],
        [0, s * 1.04],
      ],
      {
        at: [x, y, z],
        axis: [0, 1, 0],
        segments: 8,
        color: root,
        bone: baseBone,
        name: `rootMound.groundPod${i}`,
      },
    );
    const rim = part(
      new THREE.TorusGeometry(s * 0.49, 0.012, 5, 10),
      cyan,
      [x, y + s * 0.94, z],
      baseBone,
      { rotation: [-90, 0, 0] },
    );
    glow(rim, 1.8);
    const slit = glowing(
      new THREE.BoxGeometry(s * 0.095, s * 0.52, 0.012),
      pink,
      [x, y + s * 0.48, z + s * 0.79],
      baseBone,
      2.4,
      { rotation: [0, 0, (i - 1) * 12] },
    );
    void pod;
    void slit;
    part(
      new THREE.SphereGeometry(s * 0.08, 6, 4),
      ink,
      [x - s * 0.16, y + s * 0.63, z + s * 0.76],
      baseBone,
    );
  });

  // Scattered cyan pebble-lights make the mound read as alive in silhouette.
  const pebbles: [number, number, number, number][] = [
    [-0.82, 0.09, -0.06, 0.018],
    [-0.49, 0.19, -0.23, 0.014],
    [-0.13, 0.30, -0.39, 0.016],
    [0.22, 0.24, -0.46, 0.013],
    [0.77, 0.10, 0.08, 0.019],
    [0.86, 0.07, 0.55, 0.012],
    [0.16, 0.34, 0.43, 0.011],
    [-0.86, 0.08, 0.22, 0.012],
    [0.34, 0.18, -0.10, 0.010],
    [-0.27, 0.27, 0.12, 0.012],
  ];
  pebbles.forEach(([x, y, z, r], i) => {
    glowing(
      new THREE.IcosahedronGeometry(r, 0),
      i % 3 === 0 ? pink : cyan,
      [x, y + r, z],
      baseBone,
      1.5,
      { name: `rootMound.pebble${i}` },
    );
  });

  // Small root collars at the three named coil mounts, ensuring a clean visual handoff.
  const collars: Array<[[number, number, number], typeof baseBone]> = [
    [M.coilAnchorA, rA],
    [M.coilAnchorB, rB],
    [M.coilAnchorC, rC],
  ];
  collars.forEach(([p, bone], i) => {
    part(
      new THREE.CylinderGeometry(0.105, 0.14, 0.045, 8),
      root,
      [p[0], 0.105, p[2]],
      bone,
      { rotation: [0, rand() * 20, 0], name: `rootMound.coilCollar${i}` },
    );
    for (const side of [-1, 1]) {
      const fin = new THREE.ConeGeometry(0.038, 0.16, 5);
      part(
        fin,
        root,
        [p[0] + side * 0.075, 0.17, p[2]],
        bone,
        { rotation: [0, side * 38, side * 18], name: `rootMound.coilFin${i}${side}` },
      );
    }
    glowing(
      new THREE.SphereGeometry(0.014, 6, 4),
      cyan,
      [p[0], 0.145, p[2] + 0.09],
      bone,
      1.4,
    );
  });
}
```