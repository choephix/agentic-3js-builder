<!-- call: plan -->

```json
{
  "name": "Molen — Little Dutch Windmill",
  "description": "A chunky Animal Crossing-style Dutch windmill with a cream brick tower, a gallery deck, a coral-red arched door, a fat thatched cap and four lattice sails facing the front.",
  "builderName": "windmill",
  "size": [4.1, 6.1, 2.9],
  "layout": "A squat rounded stone plinth (y 0-0.85) carries a cream-brick tower that tapers gently from radius 1.3 to 0.85 up to y 3.7; the front (+Z) has an arched coral door with a stone step at ground level, a porthole window pair below and a shuttered window pair above. A wooden gallery deck ring wraps the tower at y 2.3-2.62 with a cute post railing. On top sits a fat rounded thatch cap (y 3.7-4.85) like a big muff, with a scalloped fringe, a wooden neck housing poking forward to z 1.15 that holds the sail bearing, a gold ball finial and weathervane at y up to 5.2, and a wooden tail pole sloping down the back to [0, 2.75, -1.7]. The four sails form a big X on the front face: hub at mount sailHub [0, 4.05, 0.75], arms reaching 1.95 m out (sail bottoms at y 2.05, tops at y 6.05), each with cream canvas panels, a coral stripe and gold tips. Everything rests on the plinth at y = 0; shapes are chunky and rounded, every seam, trim, knob and flower is its own small part in a flat palette colour, giving the soft toy-like ACNH look.",
  "palette": {
    "brick": "#f4e7cb",
    "brickSeam": "#cfa76a",
    "brickShade": "#e0cda6",
    "stone": "#aab2b8",
    "stoneShade": "#828c94",
    "thatch": "#e8993c",
    "thatchShade": "#c4732a",
    "wood": "#8a5a33",
    "woodDark": "#5f3d22",
    "coralRed": "#e35d5d",
    "creamTrim": "#fff3da",
    "windowGlass": "#9fdcf0",
    "shutterGreen": "#5f9e6e",
    "flowerPink": "#ff9ec6",
    "leafGreen": "#4f9e57",
    "ink": "#4a3428",
    "gold": "#e7b814",
    "lampGlow": "#ffd98a"
  },
  "mounts": {
    "towerMid": [0, 2.0, 0],
    "towerTop": [0, 3.7, 0],
    "sailHub": [0, 4.05, 0.75]
  },
  "joints": [
    { "name": "millRoot", "at": [0, 0, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "capYaw", "parent": "millRoot", "at": [0, 3.95, 0], "dir": [0, 1, 0], "role": "hinge", "group": "cap" },
    { "name": "sailHub", "parent": "millRoot", "at": [0, 4.05, 0.75], "dir": [0, 0, 1], "role": "hinge", "group": "sails" }
  ],
  "parts": [
    {
      "id": "plinthTower",
      "builds": "Stone plinth and lower tower. Plinth y 0-0.85: a turned lathe profile in stone (stoneShade for the underside foot), radius 1.45 at the ground with a chamfered step at y 0.12 and radius 1.3 at the top, plus 5-6 small rounded stone chunks tucked around its base and a thin stoneShade seam ring at y 0.45. Tower y 0.85-2.0: a cream-brick cylinder (brick) tapering from radius 1.3 to 1.15, with thin brickSeam horizontal rings every ~0.28 m and a few single brickShade patch bricks stuck on for texture; a soft ink outline ring sits right under the top edge at y 1.98. Front face (+Z), all centred on x=0: an arched door 0.72 wide x 1.2 tall with its base on the plinth top — coralRed door leaf with wood plank seams (thin woodDark strips), a creamTrim arch frame with an ink outline, a gold round knob at mid height and a tiny gold hinge plate each side; a small stone step slab (stone, stoneShade top) protruding to z 1.5 under the door. Two round porthole windows at y 1.55, x = +/-0.5, seated on the curved brick: windowGlass disc with a creamTrim ring and a thin ink outline. A little wall lantern right of the door: wood bracket arm, small glass cube in lampGlow with an ink cap and gold ring, glowing warmly. Everything rides millRoot.",
      "box": [[-1.45, 0, -1.45], [1.45, 2.0, 1.45]],
      "attaches": "Stands on the floor (y = 0). Its top face at y 2.0 is mount towerMid, where towerGallery begins; it builds nothing above y 2.0.",
      "joints": ["millRoot"],
      "floor": true,
      "budget": 220
    },
    {
      "id": "towerGallery",
      "builds": "Upper tower and gallery. Tower y 2.0-3.7: cream brick (brick) tapering radius 1.15 to 0.85, continuing the brickSeam ring spacing from below so the seams line up across mount towerMid; a wood beam trim ring (wood, with woodDark edge line) radius 1.17 at y 2.0 caps the joint. Gallery deck at y 2.3-2.62: a circular wooden walkway ring radius 1.38 (wood planks with thin woodDark plank seams and a stoneShade weathered edge), wrapping clear around the tower. Railing on its outer edge: 12 evenly spaced rounded posts (creamTrim) radius 1.32, each 0.34 tall with an ink outline band at the base and a small gold ball finial on the three posts facing front (+Z, within +/-45 deg of front); one continuous creamTrim top rail ring at y 2.98 with a thin ink underside line. Tower face details: a small gallery door on +Z at y 2.7 (coralRed leaf, creamTrim frame, gold knob); two shuttered windows at y 3.15, x = +/-0.45 on the front curve — windowGlass pane in a creamTrim frame with ink outline, shutterGreen shutters swung open flat to each side with two horizontal slat seams and a tiny gold latch each; under each window a little woodDark window box with a leafGreen foliage mound and three round flowerPink blooms and one gold-centred bloom. Everything rides millRoot.",
      "box": [[-1.45, 2.0, -1.45], [1.45, 3.7, 1.45]],
      "attaches": "Bottom face at y 2.0 meets plinthTower at mount towerMid; top face at y 3.7 is mount towerTop where capTail sits. The gallery ring clears the tower surface; nothing else builds on the deck.",
      "joints": ["millRoot"],
      "floor": false,
      "budget": 230
    },
    {
      "id": "capTail",
      "builds": "Thatched cap, neck and tail pole. Cap y 3.7-4.85: a fat rounded muff (lathe) starting radius 1.02 at y 3.72, swelling to radius 1.08 at y 4.1 then rounding over to a soft dome top at y 4.85 — thatch colour with thatchShade bands on the underside and lower half; a wood cap band (wood, woodDark edge) radius 1.02 at y 3.65-3.75 seats it on mount towerTop. Scalloped fringe around the base edge: 14 small rounded thatch teeth (thatchShade) hanging down ~0.14 like a trim. Front neck housing: chunky wood beams (wood with woodDark corner caps) protruding from the cap front from z 0.7 to z 1.15, centred at mount sailHub, carrying a dark woodDark bearing ring radius 0.16 with a thin gold rim — the sail axle passes through it. Top: a gold lathe finial (ball + small spire) from y 4.85 to 5.2, with a tiny weathervane arrow above it: wood arrow shaft, gold arrowhead and tail fins. Tail pole: a wooden pole (wood) from the cap rear at [0, 4.35, -0.85] sloping down and back to [0, 2.75, -1.7], ending in a rounded woodDark knob, with 4 short ladder rungs (woodDark) spaced along its lower half for a climber's grip. Everything rides capYaw.",
      "box": [[-1.5, 3.65, -1.75], [1.5, 5.2, 1.35]],
      "attaches": "Sits on mount towerTop [0, 3.7, 0] (towerGallery below); its neck housing holds the bearing at mount sailHub [0, 4.05, 0.75] which the sails part builds through. The tail pole hangs outside the gallery railing.",
      "joints": ["capYaw"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "sails",
      "builds": "The sail assembly, an X on the front face. Axle: a woodDark rod from [0, 4.05, 0.6] out to z 0.98, passing through the cap's bearing ring at mount sailHub; a chunky rounded hub boss (woodDark, radius 0.24) at z 0.8 with a gold hub cap disc facing +Z and a tiny gold centre stud. Four whip arms at 45, 135, 225 and 315 degrees (so the X is diagonal from the front), each a tapered rod from the hub to length 1.95 (wood, woodDark at the root collar, a small gold tip cap at the outer end). Each arm carries: two cross ribs (woodDark, thin rounded sticks) across it at 0.7 and 1.35 from the hub; a canvas panel — a flat cream slab 0.62 wide x 1.35 long, 0.03 thick, mounted flat against the arm from 0.25 to 1.6 out, canvas colour with a coralRed stripe band near the outer edge, a thin gold trim line along the panel's outer edge and an ink outline around the panel; on the bare outer 0.35 m of the arm, three short leading-board slats (creamTrim) like a classic Dutch sail lattice. All four sails read as one airy X silhouette against the tower. Everything rides sailHub so the whole X can spin.",
      "box": [[-2.05, 2.0, 0.2], [2.05, 6.1, 1.1]],
      "attaches": "The axle seats in the bearing at mount sailHub [0, 4.05, 0.75] built by capTail; sails float in front of towerGallery and capTail, never touching them.",
      "joints": ["sailHub"],
      "floor": false,
      "budget": 240
    }
  ]
}
```

<!-- call: sails -->

```ts
import * as THREE from "three";
import { frame } from "agentic-3js-builder";

export function buildSails({ b, J, P, M }: Ctx) {
  const bone = J.sailHub;
  const wood = P.wood;
  const woodDark = P.woodDark;
  const cream = P.creamTrim;
  const coral = P.coralRed;
  const gold = P.gold;
  const ink = P.ink;

  const hub = M.sailHub as [number, number, number];
  const hx = hub[0];
  const hy = hub[1];
  const hz = hub[2];

  const v = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
  const point = (d: number, a: number, z = hz) =>
    v(hx + Math.sin(a) * d, hy + Math.cos(a) * d, z);
  const lerpPoint = (a: number, b: number, t: number, z = hz) =>
    point(a + (b - a) * t, b, z);

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
  ) => b.rod(a, c, radius, { color, bone, caps: "round" });

  const sphere = (at: [number, number, number], radius: number, color: string) =>
    b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      at,
      bone,
      flat: true,
    });

  const cylinder = (
    at: [number, number, number],
    radius: number,
    depth: number,
    color: string,
    sides = 12,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, sides), color, {
      at,
      bone,
      dir: [0, 0, 1],
      flat: true,
    });

  /* The exposed axle, seated through the cap bearing. */
  rod(v(hx, hy, 0.58), v(hx, hy, 1.02), 0.075, woodDark);
  cylinder(v(hx, hy, 0.805), 0.13, 0.48, woodDark, 12);

  /* Chunky front hub, cap, and central gold rivet. */
  sphere(v(hx, hy, 0.86), 0.235, woodDark);
  cylinder(v(hx, hy, 1.015), 0.17, 0.035, gold, 14);
  sphere(v(hx, hy, 1.045), 0.042, gold);

  const ring = b.part(new THREE.TorusGeometry(0.205, 0.025, 6, 14), gold, {
    at: v(hx, hy, 1.045),
    bone,
    dir: [0, 0, 1],
    flat: true,
  });

  /* Four diagonal canvas sails. */
  const sailAngles = [45, 135, 225, 315].map((deg) => (deg * Math.PI) / 180);

  for (let i = 0; i < sailAngles.length; i++) {
    const a = sailAngles[i];
    const sx = Math.sin(a);
    const sy = Math.cos(a);
    const d = [-sy, sx, 0] as [number, number, number];
    const along = [sx, sy, 0] as [number, number, number];

    const start = point(0.18, a, 0.98);
    const end = point(1.95, a, 0.98);

    /* Main tapered wooden whip and its heavy root collar. */
    b.sweep(
      [
        point(0.14, a, 0.975),
        point(0.78, a, 0.975),
        point(1.48, a, 0.975),
        point(1.95, a, 0.975),
      ],
      (t: number) => 0.068 - t * 0.036,
      {
        color: wood,
        bone,
        sides: 8,
        caps: "round",
      },
    );
    rod(point(0.14, a, 0.985), point(0.39, a, 0.985), 0.105, woodDark);

    /* Cross ribs sit behind the cloth and remain visible at the edges. */
    for (const r of [0.7, 1.35]) {
      const c = point(r, a, 0.975);
      rod(
        v(c[0] - d[0] * 0.39, c[1] - d[1] * 0.39, 0.975),
        v(c[0] + d[0] * 0.39, c[1] + d[1] * 0.39, 0.975),
        0.023,
        woodDark,
      );
      sphere(v(c[0] - d[0] * 0.36, c[1] - d[1] * 0.36, 0.985), 0.028, gold);
      sphere(v(c[0] + d[0] * 0.36, c[1] + d[1] * 0.36, 0.985), 0.028, gold);
    }

    /* A dark silhouette under the canvas gives the panel a friendly outlined look. */
    const panelStart = point(0.22, a, 1.0);
    const darkPanel = b.extrude(
      [
        [-0.355, 0],
        [0.355, 0],
        [0.355, 1.42],
        [0.22, 1.42],
        [-0.355, 1.42],
      ],
      {
        at: panelStart,
        x: d,
        y: along,
        thickness: 0.042,
        bevel: 0.008,
        color: ink,
        bone,
        name: `sailsPanelOutline${i}`,
      },
    );

    const canvasStart = point(0.25, a, 1.018);
    b.extrude(
      [
        [-0.31, 0],
        [0.31, 0],
        [0.31, 1.35],
        [0.18, 1.35],
        [-0.31, 1.35],
      ],
      {
        at: canvasStart,
        x: d,
        y: along,
        thickness: 0.026,
        bevel: 0.006,
        color: cream,
        bone,
        name: `sailsCanvas${i}`,
      },
    );

    /* Coral-red canvas band near the outer shoulder of each sail. */
    const stripeAt = point(1.27, a, 1.043);
    b.extrude(
      [
        [-0.305, 0],
        [0.305, 0],
        [0.305, 0.115],
        [-0.305, 0.115],
      ],
      {
        at: stripeAt,
        x: d,
        y: along,
        thickness: 0.012,
        bevel: 0.003,
        color: coral,
        bone,
        name: `sailsCoralStripe${i}`,
      },
    );

    /* Gold outer hem and two cream edging rods. */
    const hemA = point(1.57, a, 1.055);
    rod(
      v(hemA[0] - d[0] * 0.285, hemA[1] - d[1] * 0.285, 1.055),
      v(hemA[0] + d[0] * 0.285, hemA[1] + d[1] * 0.285, 1.055),
      0.014,
      gold,
    );

    const side0 = point(0.28, a, 1.055);
    const side1 = point(1.58, a, 1.055);
    for (const s of [-1, 1]) {
      rod(
        v(side0[0] + d[0] * 0.295 * s, side0[1] + d[1] * 0.295 * s, 1.055),
        v(side1[0] + d[0] * 0.295 * s, side1[1] + d[1] * 0.295 * s, 1.055),
        0.009,
        cream,
      );
    }

    /* Little gold fasteners on the four corners of each canvas. */
    for (const r of [0.29, 1.56]) {
      const c = point(r, a, 1.065);
      for (const s of [-1, 1]) {
        sphere(
          v(c[0] + d[0] * 0.29 * s, c[1] + d[1] * 0.29 * s, 1.068),
          0.018,
          gold,
        );
      }
    }

    /* Bare outer arm: three short leading-board slats. */
    for (const r of [1.67, 1.79, 1.91]) {
      const c = point(r, a, 1.0);
      rod(
        v(c[0] - d[0] * 0.17, c[1] - d[1] * 0.17, 1.0),
        v(c[0] + d[0] * 0.17, c[1] + d[1] * 0.17, 1.0),
        0.018,
        cream,
      );
    }

    /* Decorative gold end cap and a dark underside nub. */
    sphere(point(1.95, a, 0.985), 0.078, gold);
    sphere(point(1.95, a, 0.955), 0.036, woodDark);
  }

  /* Four small bolts around the hub emphasize the rotating mechanism. */
  for (const deg of [0, 90, 180, 270]) {
    const a = (deg * Math.PI) / 180;
    sphere(v(hx + Math.sin(a) * 0.15, hy + Math.cos(a) * 0.15, 1.07), 0.025, gold);
  }

  return ring;
}
```

<!-- call: capTail -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildCapTail({ b, J, P, M }: Ctx) {
  const bone = J.capYaw ?? J.body;
  const at = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  const wood = P.wood;
  const woodDark = P.woodDark;
  const thatch = P.thatch;
  const thatchShade = P.thatchShade;
  const gold = P.gold;
  const cream = P.creamTrim;
  const ink = P.ink;

  const box = (
    size: [number, number, number],
    p: [number, number, number],
    color: string,
    name: string,
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone,
      at: p,
      name,
      flat: true,
    });
  };

  const cylinder = (
    radius: number,
    height: number,
    p: [number, number, number],
    color: string,
    name: string,
    segments = 12,
    dir: [number, number, number] = [0, 1, 0],
  ) => {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      bone,
      at: p,
      dir,
      name,
      flat: true,
    });
  };

  const sphere = (
    radius: number,
    p: [number, number, number],
    color: string,
    name: string,
    widthSegments = 10,
    heightSegments = 7,
  ) => {
    return b.part(
      new THREE.SphereGeometry(radius, widthSegments, heightSegments),
      color,
      { bone, at: p, name, flat: true },
    );
  };

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) => b.rod(a, z, radius, { bone, color, name, section: { ngon: 8 }, caps: "round" });

  const capsule = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) => b.capsule(a, z, radius, { bone, color, name, sides: 8 });

  // ---------------------------------------------------------------------------
  // The large, friendly thatched cap. The profile is deliberately broad at the
  // shoulders and pinches into a soft toy-like dome at the top.
  // ---------------------------------------------------------------------------

  b.lathe(
    [
      [0, 0],
      [0.96, 0],
      [1.035, 0.055],
      [1.075, 0.22],
      [1.085, 0.42],
      [1.055, 0.64],
      [0.98, 0.83],
      [0.82, 1.02],
      [0.57, 1.12],
      [0.2, 1.15],
      [0, 1.15],
    ],
    {
      at: at(0, 3.7, 0),
      bone,
      color: thatch,
      segments: 16,
      smoothing: 1,
      name: "capTail.thatchMuff",
    },
  );

  // Broad darker bands make the low-poly cap read as layered thatch rather
  // than a single orange blob.
  b.lathe(
    [
      [0, 0.035],
      [1.045, 0.035],
      [1.075, 0.085],
      [1.07, 0.14],
      [0, 0.14],
    ],
    {
      at: at(0, 3.7, 0),
      bone,
      color: thatchShade,
      segments: 16,
      name: "capTail.lowerThatchBand",
    },
  );

  b.lathe(
    [
      [0, 0.29],
      [1.082, 0.29],
      [1.083, 0.37],
      [1.075, 0.43],
      [0, 0.43],
    ],
    {
      at: at(0, 3.7, 0),
      bone,
      color: thatchShade,
      segments: 16,
      name: "capTail.middleThatchBand",
    },
  );

  b.lathe(
    [
      [0, 0.66],
      [1.04, 0.66],
      [1.025, 0.72],
      [0.99, 0.77],
      [0, 0.77],
    ],
    {
      at: at(0, 3.7, 0),
      bone,
      color: thatchShade,
      segments: 16,
      name: "capTail.upperThatchBand",
    },
  );

  // Wooden seating collar, with a dark lower and upper edge.
  cylinder(1.035, 0.105, at(0, 3.685, 0), wood, "capTail.capBand", 16);
  cylinder(1.045, 0.026, at(0, 3.632, 0), woodDark, "capTail.capBandLowerEdge", 16);
  cylinder(1.035, 0.022, at(0, 3.748, 0), woodDark, "capTail.capBandUpperEdge", 16);

  // Fourteen individually modeled hanging straw scallops.
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + Math.PI / 14;
    const x = Math.sin(a) * 1.025;
    const z = Math.cos(a) * 1.025;
    const inward = 0.035;
    const top: [number, number, number] = [
      x * (1 - inward),
      3.69,
      z * (1 - inward),
    ];
    const bottom: [number, number, number] = [
      x * 0.985,
      3.555 + (i % 3) * 0.012,
      z * 0.985,
    ];
    b.spike(top, bottom, null, 0.065, {
      bone,
      color: thatchShade,
      name: `capTail.fringe${i}`,
      caps: { start: "round", end: "point" },
    });
    sphere(
      0.052,
      top,
      thatchShade,
      `capTail.fringeKnot${i}`,
      7,
      5,
    );
  }

  // ---------------------------------------------------------------------------
  // Front neck housing. It is a compact wooden muzzle projecting from the
  // cap, leaving the later sail axle plenty of room to pass through.
  // ---------------------------------------------------------------------------

  box([0.48, 0.38, 0.45], at(0, 4.04, 0.82), wood, "capTail.frontNeckBlock");
  box([0.52, 0.10, 0.12], at(0, 3.91, 0.96), woodDark, "capTail.frontNeckLowerBeam");
  box([0.52, 0.10, 0.12], at(0, 4.18, 0.96), woodDark, "capTail.frontNeckUpperBeam");
  box([0.11, 0.34, 0.16], at(-0.22, 4.045, 1.00), woodDark, "capTail.neckLeftCap");
  box([0.11, 0.34, 0.16], at(0.22, 4.045, 1.00), woodDark, "capTail.neckRightCap");

  // Small cream pegs on the housing corners.
  for (const s of [-1, 1]) {
    sphere(0.047, at(s * 0.22, 4.22, 1.03), cream, `capTail.neckPegTop${s}`);
    sphere(0.047, at(s * 0.22, 3.87, 1.03), cream, `capTail.neckPegBottom${s}`);
  }

  // Bearing stack, aimed toward the front (+Z).
  cylinder(0.185, 0.14, at(0, 4.05, 1.105), woodDark, "capTail.bearingHousing", 14, [0, 0, 1]);
  cylinder(0.166, 0.028, at(0, 4.05, 1.185), gold, "capTail.bearingGoldRim", 16, [0, 0, 1]);
  cylinder(0.135, 0.025, at(0, 4.05, 1.205), ink, "capTail.bearingInnerShadow", 16, [0, 0, 1]);

  // Four chunky bolts around the bearing face.
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + i * Math.PI / 2;
    sphere(
      0.024,
      at(Math.sin(a) * 0.14, 4.05 + Math.cos(a) * 0.14, 1.222),
      gold,
      `capTail.bearingBolt${i}`,
      7,
      5,
    );
  }

  // ---------------------------------------------------------------------------
  // Golden finial and the little silhouette-defining weather arrow.
  // ---------------------------------------------------------------------------

  sphere(0.13, at(0, 4.91, 0), gold, "capTail.finialBall", 12, 8);
  b.lathe(
    [
      [0, 0],
      [0.085, 0],
      [0.068, 0.16],
      [0.025, 0.30],
      [0, 0.34],
    ],
    {
      at: at(0, 4.94, 0),
      bone,
      color: gold,
      segments: 10,
      name: "capTail.finialSpire",
    },
  );
  cylinder(0.035, 0.16, at(0, 5.22, 0), woodDark, "capTail.vaneMast", 8);

  // Weather vane arrow running left-right above the spire.
  rod(at(-0.34, 5.30, 0), at(0.34, 5.30, 0), 0.018, wood, "capTail.vaneArrowShaft");
  b.spike(at(0.34, 5.30, 0), [1, 0, 0], 0.13, 0.055, {
    bone,
    color: gold,
    name: "capTail.vaneArrowHead",
    caps: { start: "round", end: "point" },
  });
  box([0.16, 0.055, 0.025], at(-0.30, 5.30, 0.045), gold, "capTail.vaneTailFinA");
  box([0.055, 0.16, 0.025], at(-0.30, 5.30, 0.045), gold, "capTail.vaneTailFinB");
  sphere(0.034, at(0, 5.30, 0), gold, "capTail.vanePivot", 8, 6);

  // ---------------------------------------------------------------------------
  // Rear tail pole, sloping down and away from the viewer. The pole is a
  // strong diagonal silhouette, with four darker climber rungs.
  // ---------------------------------------------------------------------------

  const tailTop: [number, number, number] = [0, 4.37, -0.78];
  const tailBottom: [number, number, number] = [0, 2.77, -1.68];

  capsule(tailTop, tailBottom, 0.068, wood, "capTail.rearTailPole");
  sphere(0.10, tailTop, woodDark, "capTail.tailPoleSocket", 9, 6);
  sphere(0.105, tailBottom, woodDark, "capTail.tailPoleEndKnob", 9, 6);

  // Rungs are placed in the lower portion and remain perpendicular to the
  // pole in the readable front view.
  for (let i = 0; i < 4; i++) {
    const t = 0.52 + i * 0.13;
    const y = tailTop[1] + (tailBottom[1] - tailTop[1]) * t;
    const z = tailTop[2] + (tailBottom[2] - tailTop[2]) * t;
    rod(
      at(-0.16, y, z),
      at(0.16, y, z),
      0.026,
      woodDark,
      `capTail.tailRung${i}`,
    );
    sphere(0.035, at(-0.17, y, z), woodDark, `capTail.tailRungLeft${i}`, 7, 5);
    sphere(0.035, at(0.17, y, z), woodDark, `capTail.tailRungRight${i}`, 7, 5);
  }

  // Two tiny pale inspection pegs on the tail socket add a friendly crafted
  // detail without competing with the sail assembly.
  sphere(0.035, at(-0.095, 4.34, -0.70), cream, "capTail.tailSocketPegL", 7, 5);
  sphere(0.035, at(0.095, 4.34, -0.70), cream, "capTail.tailSocketPegR", 7, 5);
}
```

<!-- call: towerGallery -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildTowerGallery({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = (name: string) => P[name];

  const brick = R("brick");
  const seam = R("brickSeam");
  const shade = R("brickShade");
  const stoneShade = R("stoneShade");
  const wood = R("wood");
  const woodDark = R("woodDark");
  const coral = R("coralRed");
  const cream = R("creamTrim");
  const glass = R("windowGlass");
  const green = R("shutterGreen");
  const foliage = R("leafGreen");
  const pink = R("flowerPink");
  const ink = R("ink");
  const gold = R("gold");

  const part = (
    geo: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    opts: Record<string, unknown> = {},
  ) => b.part(geo, color, { bone, at, ...opts });

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    rotation: [number, number, number] = [0, 0, 0],
  ) => part(new THREE.BoxGeometry(...size), color, at, { rotation });

  const cyl = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    dir: [number, number, number] = [0, 1, 0],
    segments = 12,
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, segments, 1, false),
      color,
      at,
      { dir },
    );

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    segments = 8,
  ) => part(new THREE.SphereGeometry(radius, segments, Math.max(5, segments - 2)), color, at);

  const torus = (
    major: number,
    tube: number,
    color: string,
    at: [number, number, number],
    rotation: [number, number, number] = [0, 0, 0],
    radial = 16,
    tubular = 8,
  ) =>
    part(
      new THREE.TorusGeometry(major, tube, tubular, radial),
      color,
      at,
      { rotation },
    );

  // ---------------------------------------------------------------------------
  // Upper tapering tower, from the shared towerMid mount to towerTop.

  part(
    new THREE.LatheGeometry(
      [
        new THREE.Vector2(0.0, 0.0),
        new THREE.Vector2(1.12, 0.0),
        new THREE.Vector2(1.16, 0.07),
        new THREE.Vector2(1.15, 0.16),
        new THREE.Vector2(1.11, 0.72),
        new THREE.Vector2(1.04, 1.27),
        new THREE.Vector2(0.96, 1.58),
        new THREE.Vector2(0.86, 1.70),
        new THREE.Vector2(0.0, 1.70),
      ],
      18,
      1,
    ),
    brick,
    [0, 2, 0],
  );

  // Warm horizontal mortar courses, deliberately chunky and slightly proud.
  const towerCourses = [
    [2.27, 1.115],
    [2.54, 1.075],
    [2.81, 1.035],
    [3.08, 0.995],
    [3.35, 0.935],
    [3.60, 0.885],
  ] as const;

  for (const [y, radius] of towerCourses) {
    torus(radius, 0.014, seam, [0, y, 0], [0, 0, 0], 20, 5);
    torus(radius - 0.018, 0.006, shade, [0, y - 0.018, 0], [0, 0, 0], 20, 4);
  }

  // A few visible individual face bricks break up the large clean tower.
  const patchBricks: Array<[[number, number, number], [number, number, number], number]> = [
    [[-0.70, 2.19, 0.995], [0.25, 0.075, 0.025], -8],
    [[0.38, 2.43, 1.035], [0.30, 0.07, 0.025], 5],
    [[-0.83, 2.70, 0.95], [0.22, 0.075, 0.025], 3],
    [[0.65, 2.96, 0.95], [0.24, 0.07, 0.025], -7],
    [[-0.52, 3.23, 0.89], [0.28, 0.07, 0.025], 4],
    [[0.48, 3.48, 0.84], [0.22, 0.065, 0.025], -4],
    [[-0.30, 3.64, 0.81], [0.20, 0.06, 0.025], 8],
  ];

  for (const [at, size, angle] of patchBricks) {
    box(size, shade, at, [0, angle, 0]);
  }

  // Heavy wooden beam at the gallery's lower edge.
  torus(1.17, 0.075, wood, [0, 2.03, 0], [0, 0, 0], 24, 8);
  torus(1.18, 0.018, woodDark, [0, 1.965, 0], [0, 0, 0], 24, 5);
  torus(1.12, 0.014, cream, [0, 2.085, 0], [0, 0, 0], 24, 5);

  // ---------------------------------------------------------------------------
  // Circular gallery deck: broad toroidal edge plus twelve visible plank wedges.

  torus(1.245, 0.145, wood, [0, 2.43, 0], [0, 0, 0], 32, 8);
  torus(1.365, 0.025, stoneShade, [0, 2.38, 0], [0, 0, 0], 32, 5);
  torus(1.26, 0.018, woodDark, [0, 2.56, 0], [0, 0, 0], 32, 5);

  // Radial plank seams on the top of the walkway.
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const x = Math.sin(a) * 1.245;
    const z = Math.cos(a) * 1.245;
    box([0.018, 0.018, 0.43], woodDark, [x, 2.575, z], [0, a * 180 / Math.PI, 0]);
  }

  // Small weathered blocks around the outer deck rim.
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x = Math.sin(a) * 1.355;
    const z = Math.cos(a) * 1.355;
    box([0.10, 0.055, 0.16], stoneShade, [x, 2.47, z], [0, a * 180 / Math.PI, 0]);
  }

  // ---------------------------------------------------------------------------
  // Twelve-post cream railing and its continuous top rail.

  const postAngles: number[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    postAngles.push(a);
    const x = Math.sin(a) * 1.32;
    const z = Math.cos(a) * 1.32;

    cyl(0.035, 0.34, cream, [x, 2.80, z], [0, 1, 0], 8);
    torus(0.038, 0.009, ink, [x, 2.635, z], [0, 0, 0], 8, 4);

    // Squared foot gives each post a toy-like planted look.
    box([0.085, 0.035, 0.085], woodDark, [x, 2.625, z], [0, a * 180 / Math.PI, 0]);

    // Three front-facing finials, at -30, 0 and +30 degrees from +Z.
    if (Math.abs(a) < Math.PI / 4 || Math.abs(a - Math.PI * 2) < Math.PI / 4) {
      sphere(0.065, gold, [x, 2.995, z], 8);
      cyl(0.018, 0.035, woodDark, [x, 2.945, z], [0, 1, 0], 7);
    }
  }

  torus(1.32, 0.038, cream, [0, 2.985, 0], [0, 0, 0], 32, 7);
  torus(1.32, 0.012, ink, [0, 2.945, 0], [0, 0, 0], 32, 4);

  // Four little corner braces beneath the most visible front rail.
  for (const s of [-1, 1]) {
    box([0.045, 0.22, 0.045], woodDark, [s * 0.92, 2.73, 0.95], [s * 25, 0, 0]);
  }

  // ---------------------------------------------------------------------------
  // Small gallery door on the front.

  const doorOutline: [number, number, "sharp"][] = [
    [-0.27, 0, "sharp"],
    [0.27, 0, "sharp"],
    [0.27, 0.43, "sharp"],
    [0.21, 0.56, "sharp"],
    [0.10, 0.67, "sharp"],
    [0, 0.70, "sharp"],
    [-0.10, 0.67, "sharp"],
    [-0.21, 0.56, "sharp"],
    [-0.27, 0.43, "sharp"],
  ];

  b.extrude(doorOutline, {
    at: [0, 2.18, 1.055],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.055,
    bevel: 0.012,
    color: coral,
    bone,
  });

  const doorFrame: [number, number, "sharp"][] = [
    [-0.32, 0, "sharp"],
    [0.32, 0, "sharp"],
    [0.32, 0.45, "sharp"],
    [0.26, 0.60, "sharp"],
    [0.14, 0.76, "sharp"],
    [0, 0.80, "sharp"],
    [-0.14, 0.76, "sharp"],
    [-0.26, 0.60, "sharp"],
    [-0.32, 0.45, "sharp"],
  ];

  b.extrude(doorFrame, {
    at: [0, 2.16, 1.085],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.035,
    bevel: 0.008,
    color: cream,
    bone,
  });

  // Door seams and crossbar.
  for (const y of [2.30, 2.48, 2.66]) {
    box([0.47, 0.018, 0.018], woodDark, [0, y, 1.125]);
  }
  box([0.035, 0.70, 0.018], woodDark, [0, 2.51, 1.13]);
  sphere(0.042, gold, [0.16, 2.52, 1.145], 8);
  for (const s of [-1, 1]) {
    box([0.035, 0.11, 0.025], gold, [s * 0.255, 2.46, 1.145]);
  }

  // ---------------------------------------------------------------------------
  // Two upper shuttered windows.

  const windowXs = [-0.45, 0.45] as const;
  for (const s of windowXs) {
    const towerRadius = 0.93;
    const z = Math.sqrt(Math.max(0.1, towerRadius * towerRadius - s * s)) + 0.018;

    cyl(0.205, 0.035, ink, [s, 3.17, z], [0, 0, 1], 16);
    cyl(0.182, 0.038, cream, [s, 3.17, z + 0.018], [0, 0, 1], 16);
    cyl(0.145, 0.041, glass, [s, 3.17, z + 0.040], [0, 0, 1], 12);
    box([0.018, 0.25, 0.018], cream, [s, 3.17, z + 0.067]);
    box([0.28, 0.018, 0.018], cream, [s, 3.17, z + 0.067]);

    // Open shutters, tilted slightly away from the window.
    for (const side of [-1, 1]) {
      const sx = s + side * 0.245;
      const angle = side * 19;
      box([0.16, 0.30, 0.045], green, [sx, 3.17, z + 0.005], [0, angle, 0]);

      for (const yy of [3.09, 3.17, 3.25]) {
        box([0.135, 0.014, 0.012], woodDark, [sx, yy, z + 0.038], [0, angle, 0]);
      }

      box([0.025, 0.045, 0.018], gold, [s + side * 0.12, 3.17, z + 0.052], [0, angle, 0]);
    }

    // Window box under each window.
    box([0.58, 0.12, 0.20], woodDark, [s, 2.86, z + 0.055]);
    box([0.62, 0.035, 0.23], wood, [s, 2.925, z + 0.065]);

    sphere(0.13, foliage, [s - 0.16, 2.99, z + 0.10], 7);
    sphere(0.14, foliage, [s, 2.995, z + 0.11], 7);
    sphere(0.12, foliage, [s + 0.16, 2.985, z + 0.10], 7);

    sphere(0.042, pink, [s - 0.17, 3.055, z + 0.13], 7);
    sphere(0.042, pink, [s + 0.01, 3.075, z + 0.14], 7);
    sphere(0.042, pink, [s + 0.17, 3.04, z + 0.13], 7);
    sphere(0.026, gold, [s + 0.01, 3.105, z + 0.15], 7);
  }

  // A few tiny cream rivets on the gallery's beam and railing joints.
  for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
    const x = Math.sin(a) * 1.17;
    const z = Math.cos(a) * 1.17;
    sphere(0.026, gold, [x, 2.055, z], 7);
  }

  // Small stone-colored sill blocks visually anchor the upper facade.
  box([0.62, 0.045, 0.13], stoneShade, [-0.45, 2.94, 0.98]);
  box([0.62, 0.045, 0.13], stoneShade, [0.45, 2.94, 0.98]);
}
```

<!-- call: plinthTower -->

```ts
import * as THREE from "three";
import { polyline, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildPlinthTower({ b, J, P, M }: Ctx) {
  const bone = J.millRoot ?? J.body;
  const R = (p: string) => P[p];

  const add = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    extra: Record<string, unknown> = {},
  ) => b.part(geometry, color, { bone, at, ...extra });

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    extra: Record<string, unknown> = {},
  ) => add(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, extra);

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    seg = 8,
    rings = 5,
  ) => add(new THREE.SphereGeometry(radius, seg, rings), color, at);

  const cylinder = (
    radius: number,
    depth: number,
    color: string,
    at: [number, number, number],
    sides = 12,
    dir: [number, number, number] = [0, 1, 0],
  ) =>
    add(new THREE.CylinderGeometry(radius, radius, depth, sides), color, at, {
      dir,
      axis: "y",
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    options: Record<string, unknown> = {},
  ) => b.rod(a, c, radius, color, { bone, section: { ngon: 8 }, ...options });

  const torus = (
    major: number,
    minor: number,
    color: string,
    at: [number, number, number],
    dir: [number, number, number] = [0, 1, 0],
    radial = 12,
    tubular = 5,
  ) =>
    add(
      new THREE.TorusGeometry(major, minor, tubular, radial),
      color,
      at,
      { dir, axis: "y" },
    );

  const stone = R("stone");
  const stoneShade = R("stoneShade");
  const brick = R("brick");
  const brickSeam = R("brickSeam");
  const brickShade = R("brickShade");
  const coral = R("coralRed");
  const trim = R("creamTrim");
  const wood = R("wood");
  const woodDark = R("woodDark");
  const glass = R("windowGlass");
  const green = R("shutterGreen");
  const pink = R("flowerPink");
  const leaf = R("leafGreen");
  const gold = R("gold");
  const ink = R("ink");
  const lamp = R("lampGlow");

  // ---------------------------------------------------------------------------
  // Rounded stone plinth, with a darker inset foot and a broad stepped shoulder.
  // ---------------------------------------------------------------------------

  b.lathe(
    [
      [0, 0],
      [1.31, 0],
      [1.42, 0.055],
      [1.46, 0.13],
      [1.43, 0.2],
      [1.36, 0.25],
      [1.34, 0.68],
      [1.30, 0.82],
      [1.27, 0.85],
      [0, 0.85],
    ],
    {
      bone,
      at: [0, 0, 0],
      axis: [0, 1, 0],
      segments: 14,
      smoothing: 1,
      color: stone,
      name: "plinth.stone",
      group: "plinthTower",
    },
  );

  b.lathe(
    [
      [0, 0],
      [1.31, 0],
      [1.42, 0.055],
      [1.44, 0.115],
      [1.34, 0.16],
      [0, 0.16],
    ],
    {
      bone,
      at: [0, 0, 0],
      axis: [0, 1, 0],
      segments: 14,
      smoothing: 1,
      color: stoneShade,
      name: "plinth.underfoot",
      group: "plinthTower",
    },
  );

  torus(1.36, 0.025, stoneShade, [0, 0.445, 0], [0, 1, 0], 42, 5);
  torus(1.29, 0.025, stoneShade, [0, 0.805, 0], [0, 1, 0], 42, 5);

  const stoneRng = rng(412);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.12;
    const rr = 1.30 + stoneRng() * 0.1;
    const s = 0.13 + stoneRng() * 0.07;
    sphere(
      s,
      i % 2 ? stoneShade : stone,
      [Math.cos(a) * rr, 0.15 + stoneRng() * 0.08, Math.sin(a) * rr],
      7,
      4,
    );
  }

  // ---------------------------------------------------------------------------
  // Lower tower. The continuous sweep keeps the taper soft and toy-like.
  // ---------------------------------------------------------------------------

  const towerPath = polyline([
    [0, 0.80, 0],
    [0, 1.12, 0],
    [0, 1.52, 0],
    [0, 1.98, 0],
  ]);

  b.sweep(towerPath, [1.30, 1.15], {
    bone,
    color: brick,
    sides: 14,
    section: "circle",
    caps: "flat",
    name: "tower.lower",
    group: "plinthTower",
  });

  for (const y of [0.94, 1.22, 1.50, 1.78]) {
    const t = (y - 0.8) / 1.18;
    const radius = 1.30 + (1.15 - 1.30) * t;
    torus(radius + 0.006, 0.014, brickSeam, [0, y, 0], [0, 1, 0], 40, 4);
  }
  torus(1.145, 0.018, ink, [0, 1.975, 0], [0, 1, 0], 40, 4);

  // A handful of deliberately large individual "bricks" break up the smooth body.
  const patchBricks: Array<[number, number, number, number, number]> = [
    [-0.78, 1.03, 1.10, 0.27, 0.12],
    [0.44, 1.16, 1.20, 0.31, 0.13],
    [-0.58, 1.43, 1.17, 0.36, 0.12],
    [0.67, 1.68, 1.12, 0.28, 0.13],
    [-0.22, 1.84, 1.16, 0.30, 0.11],
    [0.86, 1.88, 0.95, 0.18, 0.10],
  ];
  for (const [x, y, z, w, h] of patchBricks) {
    box([w, h, 0.026], brickShade, [x, y, z], {
      name: "tower.patchBrick",
      group: "plinthTower",
    });
  }

  // Small pale corner-like flecks on the left flank, giving the tower a handmade wall.
  for (const [x, y, z] of [
    [-1.02, 1.08, 0.55],
    [-1.00, 1.36, 0.54],
    [-0.95, 1.70, 0.62],
    [0.99, 1.28, 0.46],
  ] as Array<[number, number, number]>) {
    box([0.17, 0.10, 0.025], brickShade, [x, y, z], {
      rotation: [0, x < 0 ? -18 : 18, 0],
      name: "tower.sideBrick",
      group: "plinthTower",
    });
  }

  // ---------------------------------------------------------------------------
  // Front arched door. The dark larger arch is tucked behind the cream trim.
  // ---------------------------------------------------------------------------

  const arch = (half: number, base: number, spring: number, crown: number, z: number) => {
    const pts: [number, number, number][] = [
      [-half, base, z],
      [half, base, z],
      [half, spring, z],
    ];
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * Math.PI;
      pts.push([
        Math.cos(a) * half,
        spring + Math.sin(a) * (crown - spring),
        z,
      ]);
    }
    pts.push([-half, spring, z]);
    return pts;
  };

  const doorOutline = arch(0.405, 0.86, 1.62, 1.93, 1.205);
  b.sweep(doorOutline, 0.047, {
    bone,
    color: ink,
    sides: 8,
    caps: "round",
    name: "door.inkArch",
    group: "plinthTower",
  });

  b.extrude(
    [
      [-0.36, 0],
      [0.36, 0],
      [0.36, 0.76],
      [0.33, 0.91],
      [0.24, 1.06],
      [0, 1.13, "sharp"],
      [-0.24, 1.06],
      [-0.33, 0.91],
      [-0.36, 0.76],
    ],
    {
      bone,
      at: [0, 0.86, 1.225],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.008,
      smoothing: 1,
      color: coral,
      name: "door.leaf",
      group: "plinthTower",
    },
  );

  // Door plank seams and a low sill shadow.
  for (const y of [1.08, 1.31, 1.53]) {
    box([0.69, 0.014, 0.012], woodDark, [0, y, 1.254], {
      name: "door.plankSeam",
      group: "plinthTower",
    });
  }
  box([0.014, 0.70, 0.012], woodDark, [0, 1.20, 1.255], {
    name: "door.centerSeam",
    group: "plinthTower",
  });

  const frameArch = arch(0.43, 0.82, 1.61, 1.98, 1.255);
  b.sweep(frameArch, 0.036, {
    bone,
    color: trim,
    sides: 8,
    caps: "round",
    name: "door.creamFrame",
    group: "plinthTower",
  });
  b.sweep(
    [
      [-0.43, 0.84, 1.255],
      [-0.43, 1.61, 1.255],
    ],
    0.036,
    { bone, color: trim, sides: 8, name: "door.leftFrame", group: "plinthTower" },
  );
  b.sweep(
    [
      [0.43, 0.84, 1.255],
      [0.43, 1.61, 1.255],
    ],
    0.036,
    { bone, color: trim, sides: 8, name: "door.rightFrame", group: "plinthTower" },
  );

  sphere(0.065, gold, [0.225, 1.37, 1.29], 10, 6);
  for (const x of [-0.295, 0.295]) {
    box([0.045, 0.11, 0.018], gold, [x, 1.32, 1.285], {
      name: "door.hinge",
      group: "plinthTower",
    });
  }

  // Chunky step, with a darker top inset and a broad front face.
  box([0.98, 0.15, 0.52], stone, [0, 0.89, 1.40], {
    name: "door.step",
    group: "plinthTower",
  });
  box([0.86, 0.025, 0.43], stoneShade, [0, 0.972, 1.42], {
    name: "door.stepTop",
    group: "plinthTower",
  });
  box([0.82, 0.018, 0.018], ink, [0, 0.988, 1.64], {
    name: "door.stepEdge",
    group: "plinthTower",
  });

  // ---------------------------------------------------------------------------
  // Two round portholes, each assembled as outline, trim, glass and crossbars.
  // ---------------------------------------------------------------------------

  for (const x of [-0.53, 0.53]) {
    const z = 1.18;
    torus(0.205, 0.027, ink, [x, 1.55, z], [0, 0, 1], 20, 5);
    torus(0.181, 0.030, trim, [x, 1.55, z + 0.018], [0, 0, 1], 20, 5);
    cylinder(0.145, 0.026, glass, [x, 1.55, z + 0.039], 16, [0, 0, 1]);
    rod([x - 0.12, 1.55, z + 0.06], [x + 0.12, 1.55, z + 0.06], 0.010, trim);
    rod([x, 1.43, z + 0.061], [x, 1.67, z + 0.061], 0.010, trim);
    sphere(0.022, gold, [x, 1.55, z + 0.075], 7, 4);
  }

  // ---------------------------------------------------------------------------
  // Little wall lantern: bracket, warm glass cube, dark cap and gold collar.
  // ---------------------------------------------------------------------------

  rod([0.79, 1.22, 1.11], [0.79, 1.22, 1.34], 0.035, woodDark);
  rod([0.79, 1.22, 1.34], [0.79, 1.32, 1.34], 0.035, wood);
  box([0.22, 0.28, 0.20], lamp, [0.79, 1.50, 1.34], {
    name: "lantern.glass",
    group: "plinthTower",
  });
  const glowingLantern = b.part(
    new THREE.BoxGeometry(0.16, 0.21, 0.15),
    lamp,
    { bone, at: [0.79, 1.50, 1.34], name: "lantern.glow", group: "plinthTower" },
  );
  glow(glowingLantern, 1.35);
  box([0.23, 0.035, 0.21], ink, [0.79, 1.665, 1.34], {
    name: "lantern.cap",
    group: "plinthTower",
  });
  torus(0.115, 0.014, gold, [0.79, 1.35, 1.34], [0, 1, 0], 16, 4);
  sphere(0.035, gold, [0.79, 1.70, 1.34], 7, 4);
  box([0.045, 0.18, 0.045], woodDark, [0.79, 1.76, 1.34], {
    name: "lantern.finial",
    group: "plinthTower",
  });

  // Tiny flower-like masonry marks at the base soften the transition into the ground.
  for (const [x, z] of [
    [-1.08, 0.93],
    [1.12, 0.75],
    [-0.82, -1.08],
    [0.87, -1.02],
  ] as Array<[number, number]>) {
    sphere(0.038, brickShade, [x, 0.86, z], 7, 4);
    sphere(0.022, stoneShade, [x + 0.035, 0.89, z + 0.01], 6, 4);
  }
}
```