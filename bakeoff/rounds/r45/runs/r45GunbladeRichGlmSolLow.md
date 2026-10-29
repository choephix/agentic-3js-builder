<!-- call: plan -->

```json
{
  "name": "Lionheart Gunblade",
  "description": "A Final Fantasy-style revolver gunblade planted point-down in the ground after battle, its silver chain hanging slack behind the blade.",
  "builderName": "gunblade",
  "size": [0.46, 2.0, 0.92],
  "layout": "One vertical gunblade standing on its planted tip at x=0, front (+Z) is the polished cutting edge. From the ground up: a steel blade tapering from 0.16 m wide at the guard seat to a point sunk 2 cm into the floor, carrying a dark blood groove, a light polished edge strip and a row of spine teeth on the back (−Z) edge. At y 1.28–1.56 the ornate guard wraps the blade and carries the revolver mechanism: an 8-fluted drum with its axis along Z at [0, 1.42, 0.02], a brass-banded barrel pointing forward to a muzzle at z 0.34, a curved spur hammer at the back top and a trigger in a brass loop under the drum. Above the guard a back-leaning leather grip rises to a gold pommel dome with a glowing ruby at y 1.90. From the pommel a silver chain hangs down the back of the model, swaying behind the blade to about y 0.72 at z −0.56. The style is faceted low-poly metalwork: cool steel against warm brass and gold trim, dark gunmetal mechanism, ivory side-plate medallions, a glowing blue rune near the blade base and a glowing ruby pommel stone as the only magic.",
  "palette": {
    "steel": "#b9c2cc",
    "steelDark": "#6b7480",
    "edge": "#e8edf2",
    "gunmetal": "#2e3440",
    "gunmetalDark": "#1b1f27",
    "brass": "#c9973a",
    "brassLight": "#e8c76a",
    "gold": "#e7b814",
    "ivory": "#efe6d2",
    "gripLeather": "#5a2e24",
    "gripWrap": "#3a1c16",
    "silver": "#8e99a6",
    "emberRed": "#c8322a",
    "runeGlow": "#5fd8ff",
    "black": "#12151c"
  },
  "mounts": {
    "guardSeat": [0, 1.3, 0],
    "cylinderAxis": [0, 1.42, 0.02],
    "gripSeat": [0, 1.56, 0.02],
    "pommelCap": [0, 1.9, -0.06],
    "chainRoot": [0, 1.88, -0.09]
  },
  "joints": [
    { "name": "core", "at": [0, 1.35, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "hammer", "parent": "core", "at": [0, 1.58, -0.09], "dir": [0, 0.85, -0.5], "role": "hinge" },
    { "name": "trigger", "parent": "core", "at": [0, 1.48, 0.1], "dir": [0, 1, 0], "role": "hinge" },
    { "name": "pommel", "parent": "core", "at": [0, 1.9, -0.06], "dir": [0, 1, 0], "role": "hinge" },
    { "name": "chain1", "parent": "pommel", "at": [0, 1.7, -0.2], "dir": [0, -1, -0.25], "role": "tail" },
    { "name": "chain2", "parent": "chain1", "at": [0, 1.4, -0.34], "dir": [0, -1, -0.4], "role": "tail" },
    { "name": "chain3", "parent": "chain2", "at": [0, 1.05, -0.48], "dir": [0, -0.9, -0.55], "role": "tail" },
    { "name": "chain4", "parent": "chain3", "at": [0, 0.72, -0.56], "dir": [0, -0.7, -0.6], "role": "tail" }
  ],
  "parts": [
    {
      "id": "blade",
      "builds": "The planted blade, tip down. Main body: a flat tapered slab drawn as a faceted extrude facing ±X, silhouette from the point at y 0.02 rising to full width 0.16 m at the guardSeat mount y 1.30, with a gentle forward (+Z) sweep of the edge and a slight recurve near the tip; thickness about 0.035 m; wears steel. Details as their own seated parts: a polished cutting-edge strip (edge) running the full +Z edge from tip to guard; a narrow blood groove (gunmetalDark) inset down the blade centre face on both sides; the back spine (−Z) shaded steelDark. Seven staggered triangular teeth (steelDark bodies, brassLight tips) project backward from the −Z edge between y 0.35 and y 1.05, largest near the base. At y 0.22 a winged emblem plate on both flats: an ivory disc with a gold winged lion silhouette in gold over it, held by two silver rivets. Two faint chevron runes (runeGlow, glowing) flanking the emblem at y 0.32 and y 0.14, small extrudes seated flush on the flats. Two brass collar rivets at the top where the blade enters the guard.",
      "box": [[-0.09, -0.02, -0.09], [0.09, 1.32, 0.12]],
      "attaches": "The blade's top face ends exactly at mount guardSeat [0, 1.30, 0], where the gunCore's wing plates and drum wrap around it; the tip sinks 2 cm below y 0.",
      "joints": ["core"],
      "floor": true,
      "budget": 230
    },
    {
      "id": "gunCore",
      "builds": "The guard and revolver mechanism. Guard: two broad swept wing plates (faceted extrudes facing ±X, gunmetal) rising from the blade seat to wrap the drum, each trimmed with a brass edge band, three brassLight rivets and a small steelDark underline shadow where the wing meets the drum. Revolver drum: a lathe cylinder, axis +Z, centre at mount cylinderAxis, radius 0.085, length 0.20, gunmetal, with eight brass flute ridges running its length and a brassLight centre band; its rear face is a gunmetalDark plate. Barrel: a gunmetal tube radius 0.032 from z 0.10 to z 0.34 forward (+Z), with a brassLight muzzle ring, a black bore disc, and a small brass front-sight blade on top. Hammer: rides joint hammer, a curved gunmetalDark spur with a steelDark face and a brassLight pin at its pivot, swept up and back from the drum's top rear. Trigger: rides joint trigger, a small curved steelDark trigger blade hanging inside a brass trigger-guard loop that arcs from the drum's underside forward to the gripSeat mount. Side plates: an ivory plate with a gold lion-head medallion and three silver screws on each flat of the drum. A small steelDark rear-sight notch sits on the drum top.",
      "box": [[-0.23, 1.26, -0.14], [0.23, 1.66, 0.36]],
      "attaches": "Wing plates clamp the blade at mount guardSeat; the drum barrel axis runs through mount cylinderAxis; the trigger-guard loop lands on mount gripSeat where the grip enters.",
      "joints": ["core", "hammer", "trigger"],
      "floor": false,
      "budget": 280
    },
    {
      "id": "grip",
      "builds": "The grip and pommel above the mechanism. Grip core: a slightly back-leaning tapered frustum sweep from mount gripSeat [0, 1.56, 0.02] to mount pommelCap [0, 1.90, -0.06], square-ish section 0.055 m at the collar shrinking to 0.04 m at the pommel, wearing gripLeather. Wraps: five diagonal leather bands (gripWrap) evenly spaced up the grip, each with a tiny brass stud at both ends, plus a diamond column of ivory inlay studs (four, alternating offsets) down the front (+Z) face. Collar: a brass ring with a brassLight bevel where the grip enters the guard at gripSeat. Pommel: a gold lathe dome cap with a brassLight rim ring seated on the pommel joint at pommelCap, holding a faceted emberRed ruby (glowing) set into its back face; a small brass ring mount projects from the pommel's back at chainRoot [0, 1.88, -0.09] where the chain roots.",
      "box": [[-0.09, 1.5, -0.14], [0.09, 1.98, 0.14]],
      "attaches": "Bottom of the grip enters the gunCore at mount gripSeat inside the trigger-guard loop; the pommel cap closes on mount pommelCap and hands the chain off at mount chainRoot.",
      "joints": ["core", "pommel"],
      "floor": false,
      "budget": 210
    },
    {
      "id": "chain",
      "builds": "The hanging chain and charm. Chain: about fourteen alternating links swept along the chain1..chain4 joints from mount chainRoot downward behind the blade — short silver capsules (rod sweeps) alternating 90° orientation link to link, each with a tiny steelDark inner shadow ring so the links read as open metal. The chain follows the joints' gentle backward sway, ending at the last link around y 0.72, z −0.56. Charm: from the final link hangs a talisman — a small gold triangle frame (extrude) with a faceted emberRed crystal (glowing) inside it, a brassLight cap on the crystal, and two ivory beads on a short silver drop wire above the frame.",
      "box": [[-0.08, 0.62, -0.62], [0.08, 1.94, -0.02]],
      "attaches": "Roots at mount chainRoot on the pommel's ring mount and hangs clear behind the blade, never touching it; the lowest link stays above y 0.62.",
      "joints": ["pommel", "chain1", "chain2", "chain3", "chain4"],
      "floor": false,
      "budget": 120
    }
  ]
}
```

<!-- call: gunCore -->

```ts
import * as THREE from "three";
import { polyline, catmull } from "agentic-3js-builder";

export function buildGunCore({ b, J, P, M }: Ctx) {
  const gun = P.gunmetal;
  const dark = P.gunmetalDark;
  const steel = P.steelDark;
  const brass = P.brass;
  const brassLight = P.brassLight;
  const ivory = P.ivory;
  const gold = P.gold;
  const silver = P.silver;
  const black = P.black;

  const core = J.core;
  const hammer = J.hammer;
  const trigger = J.trigger;
  const C = (M.cylinderAxis ?? [0, 1.42, 0.02]) as [number, number, number];
  const seat = (M.guardSeat ?? [0, 1.3, 0]) as [number, number, number];
  const grip = (M.gripSeat ?? [0, 1.56, 0.02]) as [number, number, number];

  const box = (size: [number, number, number], at: [number, number, number], color: string, bone = core) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      flat: true,
    });

  const cyl = (
    radius: number,
    length: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    bone = core,
    sides = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, length, sides, 1, false), color, {
      at,
      dir,
      bone,
      flat: true,
    });

  const sphere = (radius: number, at: [number, number, number], color: string, bone = core) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, { at, bone, flat: true });

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
    bone = core,
  ) => b.rod(a, z, radius, { color, bone, section: { ngon: 6 }, caps: "flat" });

  // Broad swept guard wings, mirrored across the blade.
  const wing: [number, number][] = [
    [-0.015, 1.285],
    [0.045, 1.315],
    [0.145, 1.405],
    [0.205, 1.505],
    [0.17, 1.585],
    [0.105, 1.615],
    [0.07, 1.54],
    [0.018, 1.465],
  ];

  for (const s of [-1, 1]) {
    const outline = wing.map(([z, y]) => [z, y] as [number, number]);
    const plate = b.extrude(outline, {
      at: [s * 0.018, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.036,
      bevel: 0.004,
      smoothing: 0,
      color: gun,
      bone: core,
      name: `guardWing${s > 0 ? "L" : "R"}`,
    });

    // Bright swept rim follows the upper outside edge.
    const rim = catmull([
      [s * 0.041, 1.315, 0.035],
      [s * 0.205, 1.505, 0.035],
      [s * 0.17, 1.585, 0.035],
      [s * 0.105, 1.615, 0.035],
    ]);
    b.sweep(rim, 0.008, {
      color: brass,
      bone: core,
      section: { ngon: 6 },
      caps: "round",
      name: `guardRim${s > 0 ? "L" : "R"}`,
    });

    // Underline shadow where plate disappears beneath the drum.
    rod(
      [s * 0.05, 1.405, 0.045],
      [s * 0.17, 1.47, 0.045],
      0.009,
      steel,
    );

    // Three decorative rivets per wing.
    for (const [z, y] of [
      [0.075, 1.34],
      [0.145, 1.45],
      [0.135, 1.555],
    ] as [number, number][]) {
      sphere(0.014, [s * 0.052, y, z], brassLight);
      cyl(0.006, 0.006, [s * 0.069, y, z], gold, [s, 0, 0], core, 6);
    }

    // Small dark triangular gusset at the blade seat.
    b.extrude(
      [
        [0, 1.285],
        [0.09, 1.285],
        [0.055, 1.35],
        [0.015, 1.365],
      ],
      {
        at: [s * 0.04, 0, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.018,
        color: dark,
        bone: core,
        name: `guardGusset${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // Central revolver drum, its cylinder axis points forward/back through Z.
  cyl(0.085, 0.20, [C[0], C[1], C[2]], gun, [0, 0, 1], core, 12);

  // Rear dark plate and front shoulder.
  cyl(0.078, 0.012, [0, 1.42, -0.085], dark, [0, 0, 1], core, 12);
  cyl(0.072, 0.010, [0, 1.42, 0.125], steel, [0, 0, 1], core, 12);

  // Eight longitudinal flute ridges.
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8;
    const x = Math.sin(a) * 0.076;
    const y = 1.42 + Math.cos(a) * 0.076;
    rod([x, y, -0.105], [x, y, 0.105], 0.009, brass, core);
  }

  // Centre band and thin band highlights.
  cyl(0.088, 0.018, [0, 1.42, 0.02], brassLight, [0, 0, 1], core, 12);
  cyl(0.091, 0.006, [0, 1.42, 0.012], brass, [0, 0, 1], core, 12);
  cyl(0.091, 0.006, [0, 1.42, 0.028], brass, [0, 0, 1], core, 12);

  // Six dark chamber sockets visible on the front face.
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI * 2) / 6 + Math.PI / 6;
    const x = Math.sin(a) * 0.053;
    const y = 1.42 + Math.cos(a) * 0.053;
    cyl(0.012, 0.006, [x, y, 0.132], black, [0, 0, 1], core, 8);
  }

  // Ivory side plates and lion-like gold medallions on both flats.
  for (const s of [-1, 1]) {
    const x = s * 0.091;
    cyl(0.047, 0.009, [x, 1.42, 0.022], ivory, [s, 0, 0], core, 10);
    cyl(0.030, 0.012, [s * 0.098, 1.42, 0.022], gold, [s, 0, 0], core, 8);

    // Stylised lion mane, muzzle and ears.
    sphere(0.020, [s * 0.107, 1.42, 0.022], brassLight);
    sphere(0.008, [s * 0.111, 1.438, 0.038], ivory);
    sphere(0.007, [s * 0.111, 1.402, 0.039], ivory);
    b.spike([s * 0.109, 1.455, 0.021], [0, 1, 0], 0.018, 0.006, { color: gold, bone: core });

    for (const [dy, dz] of [
      [0.035, 0.040],
      [-0.035, 0.040],
      [0, -0.043],
    ] as [number, number][]) {
      cyl(0.006, 0.008, [s * 0.108, 1.42 + dy, 0.022 + dz], silver, [s, 0, 0], core, 6);
    }
  }

  // Barrel projecting forward.
  rod([0, 1.42, 0.105], [0, 1.42, 0.34], 0.032, dark, core);
  cyl(0.043, 0.018, [0, 1.42, 0.335], brassLight, [0, 0, 1], core, 10);
  cyl(0.026, 0.006, [0, 1.42, 0.348], black, [0, 0, 1], core, 10);

  // Raised front sight blade.
  b.extrude(
    [
      [0.305, 0],
      [0.338, 0],
      [0.333, 0.018],
      [0.312, 0.018],
    ],
    {
      at: [0, 1.448, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.010,
      color: brassLight,
      bone: core,
      name: "frontSight",
    },
  );

  // Rear sight notch.
  box([0.042, 0.018, 0.028], [0, 1.515, -0.078], steel);
  box([0.014, 0.008, 0.034], [0, 1.527, -0.078], dark);

  // Hammer: curved spur rising from rear top of drum.
  const hammerPath = catmull([
    [0, 1.50, -0.085],
    [0, 1.575, -0.105],
    [0, 1.635, -0.145],
    [0, 1.655, -0.185],
  ]);
  b.sweep(hammerPath, [0.022, 0.015], {
    color: dark,
    bone: hammer,
    section: { ngon: 6 },
    caps: "round",
    name: "hammerSpur",
  });
  rod([0, 1.50, -0.091], [0, 1.50, -0.11], 0.014, brassLight, hammer);
  b.extrude(
    [
      [-0.018, 1.60],
      [0.018, 1.60],
      [0.014, 1.645],
      [0, 1.66],
      [-0.014, 1.645],
    ],
    {
      at: [0, 0, -0.192],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: steel,
      bone: hammer,
      name: "hammerFace",
    },
  );

  // Trigger guard loop, forward of the grip seat.
  const guardLoop = catmull([
    [-0.055, 1.445, 0.105],
    [-0.070, 1.385, 0.115],
    [-0.052, 1.325, 0.105],
    [0, 1.285, 0.085],
    [0.052, 1.325, 0.105],
    [0.070, 1.385, 0.115],
    [0.055, 1.475, 0.105],
  ]);
  b.sweep(guardLoop, 0.012, {
    color: brass,
    bone: core,
    section: { ngon: 6 },
    caps: "round",
    name: "triggerGuard",
  });

  // Trigger blade on its own hinge joint.
  const triggerPath = catmull([
    [0, 1.48, 0.105],
    [0, 1.43, 0.125],
    [0, 1.385, 0.13],
    [0, 1.355, 0.118],
  ]);
  b.sweep(triggerPath, [0.014, 0.009], {
    color: steel,
    bone: trigger,
    section: { ngon: 6 },
    caps: "round",
    name: "triggerBlade",
  });
  sphere(0.012, [0, 1.48, 0.105], brassLight, trigger);

  // Small brass collar blocks where the guard clamps the blade.
  for (const s of [-1, 1]) {
    cyl(0.018, 0.026, [s * 0.065, 1.30, 0.015], brass, [1, 0, 0], core, 8);
    sphere(0.011, [s * 0.082, 1.30, 0.015], brassLight);
  }
}
```

<!-- call: chain -->

```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  glow,
  polyline,
  rng,
} from "agentic-3js-builder";

export function buildChain({ b, J, P, M }: Ctx) {
  const silver = P.silver;
  const steelDark = P.steelDark;
  const gold = P.gold;
  const brassLight = P.brassLight;
  const ivory = P.ivory;
  const emberRed = P.emberRed;

  const chainPoints: THREE.Vector3[] = [
    new THREE.Vector3(...M.chainRoot),
    new THREE.Vector3(0.012, 1.78, -0.255),
    new THREE.Vector3(-0.014, 1.67, -0.315),
    new THREE.Vector3(0.018, 1.57, -0.365),
    new THREE.Vector3(-0.016, 1.47, -0.405),
    new THREE.Vector3(0.014, 1.37, -0.445),
    new THREE.Vector3(-0.018, 1.27, -0.475),
    new THREE.Vector3(0.016, 1.17, -0.505),
    new THREE.Vector3(-0.014, 1.07, -0.525),
    new THREE.Vector3(0.018, 0.97, -0.542),
    new THREE.Vector3(-0.016, 0.88, -0.552),
    new THREE.Vector3(0.012, 0.81, -0.558),
  ];

  const path = catmull(chainPoints, { tension: 0.35 });
  const chainJoints = [J.chain1, J.chain2, J.chain3, J.chain4];

  const nearestBone = (p: THREE.Vector3) => {
    let best = J.pommel;
    let bestD = Infinity;
    for (const joint of chainJoints) {
      const d = joint.at.distanceToSquared(p);
      if (d < bestD) {
        bestD = d;
        best = joint;
      }
    }
    return best;
  };

  const silverLink = new THREE.TorusGeometry(0.036, 0.007, 6, 10);
  const darkLink = new THREE.TorusGeometry(0.030, 0.0028, 5, 8);

  const linkCount = 14;
  for (let i = 0; i < linkCount; i++) {
    const t = (i + 0.12) / linkCount;
    const p = path.at(t);
    const tangent = path.tangentAt(t).normalize();
    const bone = nearestBone(p);

    const outer = new THREE.TorusGeometry(
      i % 2 === 0 ? 0.037 : 0.034,
      0.0065,
      6,
      10,
    );
    const inner = new THREE.TorusGeometry(
      i % 2 === 0 ? 0.029 : 0.026,
      0.0027,
      5,
      8,
    );

    const rotation = i % 2 === 0 ? [90, 0, 0] : [0, 0, 90];

    b.part(outer, silver, {
      at: p,
      bone,
      rotation,
      name: `chainLink${i}`,
      group: "chain",
      flat: true,
    });

    b.part(inner, steelDark, {
      at: p.clone().addScaledVector(tangent, -0.002),
      bone,
      rotation,
      name: `chainShadow${i}`,
      group: "chain",
      flat: true,
    });

    // A tiny bright facet on alternating links makes the low-poly metal read clearly.
    const facet = new THREE.SphereGeometry(0.008, 5, 4);
    const facetPos = p.clone().add(
      new THREE.Vector3(
        i % 2 === 0 ? 0.026 : 0,
        0.018,
        i % 2 === 0 ? 0 : 0.026,
      ),
    );
    b.part(facet, brassLight, {
      at: facetPos,
      bone,
      name: `chainGlint${i}`,
      group: "chain",
      flat: true,
    });
  }

  const finalLink = path.at(0.91);
  const dropTop = new THREE.Vector3(0.012, 0.755, -0.56);
  const charmTop = new THREE.Vector3(0.012, 0.704, -0.56);
  const charmCenter = new THREE.Vector3(0.012, 0.665, -0.56);

  b.rod(finalLink, dropTop, 0.004, {
    color: silver,
    bone: J.chain4,
    caps: "round",
    name: "charmDropWire",
    group: "charm",
  });

  for (const [i, y] of [0.735, 0.713].entries()) {
    b.part(new THREE.SphereGeometry(0.014, 7, 5), ivory, {
      at: [0.012, y, -0.56],
      bone: J.chain4,
      name: `charmBead${i}`,
      group: "charm",
      flat: true,
    });
  }

  // Three separate gold bars form a small, unmistakably open triangular talisman frame.
  const triA = new THREE.Vector3(-0.045, 0.625, -0.56);
  const triB = new THREE.Vector3(0.069, 0.625, -0.56);
  const triC = new THREE.Vector3(0.012, 0.712, -0.56);

  for (const [i, a, c] of [
    [0, triA, triB],
    [1, triB, triC],
    [2, triC, triA],
  ] as const) {
    b.rod(a, c, 0.006, {
      color: gold,
      bone: J.chain4,
      caps: "round",
      name: `talismanFrame${i}`,
      group: "charm",
    });
  }

  const crystal = b.part(
    new THREE.ConeGeometry(0.021, 0.061, 6),
    emberRed,
    {
      at: [0.012, 0.665, -0.56],
      bone: J.chain4,
      name: "talismanCrystal",
      group: "charm",
      flat: true,
    },
  );
  glow(crystal, 1.8);

  b.part(new THREE.ConeGeometry(0.014, 0.018, 6), brassLight, {
    at: [0.012, 0.704, -0.56],
    bone: J.chain4,
    name: "talismanCrystalCap",
    group: "charm",
    flat: true,
  });

  b.part(new THREE.SphereGeometry(0.009, 6, 4), gold, {
    at: [0.012, 0.624, -0.56],
    bone: J.chain4,
    name: "talismanPoint",
    group: "charm",
    flat: true,
  });
}
```

<!-- call: grip -->

```ts
import * as THREE from "three";
import { polyline, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildGrip({ b, J, P, M }: Ctx) {
  const gripLeather = P.gripLeather;
  const gripWrap = P.gripWrap;
  const brass = P.brass;
  const brassLight = P.brassLight;
  const gold = P.gold;
  const ivory = P.ivory;
  const silver = P.silver;
  const emberRed = P.emberRed;

  const core = J.core;
  const pommel = J.pommel;

  const gripBottom = M.gripSeat as [number, number, number];
  const pommelCap = M.pommelCap as [number, number, number];
  const chainRoot = M.chainRoot as [number, number, number];

  const gripPath = polyline([
    gripBottom,
    [0, 1.625, 0.005],
    [0, 1.715, -0.018],
    [0, 1.805, -0.043],
    pommelCap,
  ]);

  const grip = b.sweep(gripPath, (t: number) => {
    const w = 0.055 * (1 - t) + 0.04 * t;
    return w;
  }, {
    bone: core,
    color: gripLeather,
    section: "box",
    sides: 6,
    caps: "flat",
    name: "gripCore",
    group: "grip",
  });

  const gripFrame = (t: number) => grip.at(t, 0);
  const random = rng(17);

  // Five broad diagonal leather wraps. Each is a short, flat strap crossing the
  // visible front and side faces of the tapered grip.
  for (let i = 0; i < 5; i++) {
    const t = 0.08 + i * 0.19;
    const c = gripFrame(t);
    const half = 0.048 - t * 0.008;
    const rise = 0.027;
    const left = c.moved([-half, 0.012, 0.035]);
    const right = c.moved([half, 0.012, -0.035]);

    b.rod(left, right, 0.009, {
      color: gripWrap,
      bone: core,
      caps: "flat",
      section: "box",
      name: `gripWrap${i + 1}`,
      group: "gripWrap",
    });

    // Brass end studs make the wraps read as fitted bands rather than painted lines.
    for (const end of [left, right]) {
      b.part(new THREE.SphereGeometry(0.009, 7, 5), brass, {
        bone: core,
        at: end.at,
        scale: [1, 0.7, 0.7],
        name: `gripWrapStud${i + 1}`,
        group: "gripWrap",
      });
    }
  }

  // A second, darker seam below each wrap adds graphic separation.
  for (let i = 0; i < 5; i++) {
    const t = 0.08 + i * 0.19;
    const c = gripFrame(Math.max(0, t - 0.025));
    b.rod(
      c.moved([-0.043, -0.004, 0.038]),
      c.moved([0.043, -0.004, 0.038]),
      0.0035,
      {
        color: gripWrap,
        bone: core,
        caps: "flat",
        name: `gripWrapShadow${i + 1}`,
        group: "gripWrap",
      },
    );
  }

  // Four ivory diamond-shaped inlay studs down the forward face.
  for (let i = 0; i < 4; i++) {
    const t = 0.16 + i * 0.19;
    const c = gripFrame(t);
    const x = i % 2 === 0 ? -0.012 : 0.012;
    const stud = b.part(new THREE.OctahedronGeometry(0.014, 0), ivory, {
      bone: core,
      at: c.moved([x, 0.006, 0.047]).at,
      scale: [0.72, 1.15, 0.34],
      name: `gripInlay${i + 1}`,
      group: "gripInlay",
    });

    // Tiny brass pin behind each ivory lozenge.
    b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.006, 6), brassLight, {
      bone: core,
      at: c.moved([x, 0.002, 0.041]).at,
      dir: [0, 0, 1],
      name: `gripInlayPin${i + 1}`,
      group: "gripInlay",
    });
  }

  // Heavy lower collar and a thinner highlight collar.
  b.part(new THREE.CylinderGeometry(0.066, 0.061, 0.026, 10), brass, {
    bone: core,
    at: [gripBottom[0], gripBottom[1] - 0.008, gripBottom[2]],
    name: "gripCollar",
    group: "gripTrim",
  });

  b.part(new THREE.CylinderGeometry(0.061, 0.057, 0.008, 10), brassLight, {
    bone: core,
    at: [gripBottom[0], gripBottom[1] + 0.009, gripBottom[2]],
    name: "gripCollarBevel",
    group: "gripTrim",
  });

  // Small vertical collar screws.
  for (const x of [-0.043, 0.043]) {
    b.part(new THREE.SphereGeometry(0.008, 6, 4), brassLight, {
      bone: core,
      at: [x, gripBottom[1] + 0.008, gripBottom[2] + 0.047],
      name: "gripCollarRivet",
      group: "gripTrim",
    });
  }

  // Gold pommel: a faceted, slightly flattened dome rising from the top of the grip.
  const pommelDome = b.lathe(
    [
      [0, 0],
      [0.043, 0],
      [0.067, 0.012],
      [0.078, 0.032],
      [0.068, 0.061],
      [0.044, 0.084],
      [0, 0.094],
    ],
    {
      at: pommelCap,
      axis: [0, 1, 0],
      segments: 10,
      bone: pommel,
      color: gold,
      name: "goldPommel",
      group: "pommel",
    },
  );

  // Bright rim beneath the dome.
  b.part(new THREE.TorusGeometry(0.066, 0.008, 5, 10), brassLight, {
    bone: pommel,
    at: [pommelCap[0], pommelCap[1] + 0.012, pommelCap[2]],
    name: "pommelRim",
    group: "pommel",
  });

  // Small gold facets on the dome shoulder.
  for (const x of [-0.034, 0.034]) {
    b.part(new THREE.SphereGeometry(0.012, 6, 4), brassLight, {
      bone: pommel,
      at: [x, pommelCap[1] + 0.038, pommelCap[2] + 0.045],
      scale: [0.8, 0.55, 0.45],
      name: "pommelFacet",
      group: "pommel",
    });
  }

  // Ruby set into the rear face, kept within the supplied grip bounds.
  const ruby = b.part(new THREE.DodecahedronGeometry(0.031, 0), emberRed, {
    bone: pommel,
    at: [0, 1.935, -0.118],
    scale: [0.9, 1.18, 0.55],
    name: "pommelRuby",
    group: "magic",
  });
  glow(ruby, 1.8);

  // Dark setting behind the ruby and a narrow gold bezel around it.
  b.part(new THREE.CylinderGeometry(0.039, 0.039, 0.008, 8), brass, {
    bone: pommel,
    at: [0, 1.935, -0.097],
    dir: [0, 0, -1],
    name: "rubySetting",
    group: "pommel",
  });

  b.part(new THREE.TorusGeometry(0.038, 0.005, 5, 8), brassLight, {
    bone: pommel,
    at: [0, 1.935, -0.123],
    dir: [0, 0, -1],
    name: "rubyBezel",
    group: "pommel",
  });

  // Rear chain mounting eye: a short silver neck, brass socket, and dark inner hole.
  b.rod(
    [0, 1.895, -0.075],
    chainRoot,
    0.012,
    {
      color: brass,
      bone: pommel,
      caps: "flat",
      name: "chainMountNeck",
      group: "chainMount",
    },
  );

  b.part(new THREE.TorusGeometry(0.026, 0.007, 6, 10), brassLight, {
    bone: pommel,
    at: chainRoot,
    dir: [1, 0, 0],
    name: "chainMountRing",
    group: "chainMount",
  });

  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.009, 8), silver, {
    bone: pommel,
    at: [0, chainRoot[1], chainRoot[2] - 0.004],
    dir: [0, 0, 1],
    name: "chainMountPin",
    group: "chainMount",
  });

  // A few minute dark sockets under the lower collar reinforce the mechanical fit.
  for (let i = 0; i < 3; i++) {
    const a = (i - 1) * 0.55;
    const x = Math.sin(a) * 0.045;
    const z = Math.cos(a) * 0.045;
    b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.006, 6), gripWrap, {
      bone: core,
      at: [x, gripBottom[1] - 0.023, z + gripBottom[2]],
      name: "gripSocket",
      group: "gripTrim",
    });
  }
}
```

<!-- call: blade -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildBlade({ b, J, P, M }: Ctx) {
  const bone = J.core;
  const steel = P.steel;
  const steelDark = P.steelDark;
  const edge = P.edge;
  const gunmetalDark = P.gunmetalDark;
  const brass = P.brass;
  const brassLight = P.brassLight;
  const ivory = P.ivory;
  const silver = P.silver;
  const runeGlow = P.runeGlow;
  const black = P.black;
  const gold = P.gold;

  const flat = true;
  const faceX = (side: number) => [side * 0.0192, 0, 0] as [number, number, number];

  // Main blade silhouette. Local outline x is model +Z, local outline y is model +Y.
  const bladeOutline: [number, number, "sharp"][] = [
    [0.018, 0.02, "sharp"],
    [0.032, 0.105, "sharp"],
    [0.047, 0.23, "sharp"],
    [0.052, 0.39, "sharp"],
    [0.061, 0.58, "sharp"],
    [0.073, 0.83, "sharp"],
    [0.086, 1.08, "sharp"],
    [0.088, 1.30, "sharp"],
    [-0.072, 1.30, "sharp"],
    [-0.079, 1.12, "sharp"],
    [-0.081, 0.92, "sharp"],
    [-0.076, 0.72, "sharp"],
    [-0.067, 0.53, "sharp"],
    [-0.055, 0.36, "sharp"],
    [-0.037, 0.19, "sharp"],
    [-0.012, 0.065, "sharp"],
  ];

  b.extrude(bladeOutline, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.035,
    bevel: 0.003,
    color: steel,
    bone,
    flat,
    name: "blade.main",
    group: "blade",
  });

  // Broad darker spine on the rear edge.
  b.extrude(
    [
      [-0.079, 0.34, "sharp"],
      [-0.084, 0.54, "sharp"],
      [-0.091, 0.76, "sharp"],
      [-0.097, 1.02, "sharp"],
      [-0.097, 1.30, "sharp"],
      [-0.071, 1.30, "sharp"],
      [-0.076, 1.08, "sharp"],
      [-0.074, 0.82, "sharp"],
      [-0.068, 0.60, "sharp"],
      [-0.055, 0.38, "sharp"],
    ],
    {
      at: [0, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.039, 0.043],
      bevel: 0.002,
      color: steelDark,
      bone,
      flat,
      name: "blade.spine",
      group: "blade",
    },
  );

  // Polished cutting edge following the forward edge.
  b.extrude(
    [
      [0.018, 0.02, "sharp"],
      [0.033, 0.11, "sharp"],
      [0.049, 0.27, "sharp"],
      [0.061, 0.49, "sharp"],
      [0.074, 0.74, "sharp"],
      [0.087, 1.02, "sharp"],
      [0.094, 1.30, "sharp"],
      [0.078, 1.30, "sharp"],
      [0.071, 1.05, "sharp"],
      [0.059, 0.79, "sharp"],
      [0.046, 0.53, "sharp"],
      [0.031, 0.27, "sharp"],
    ],
    {
      at: [0, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.043, 0.047],
      bevel: 0.0015,
      color: edge,
      bone,
      flat,
      name: "blade.cuttingEdge",
      group: "blade",
    },
  );

  // Central blood groove, mirrored on both flat faces.
  const groove = [
    [-0.009, 0.18, "sharp"] as [number, number, "sharp"],
    [0.006, 0.27, "sharp"],
    [0.009, 1.22, "sharp"],
    [-0.006, 1.22, "sharp"],
  ];
  for (const side of [-1, 1]) {
    b.extrude(groove, {
      at: faceX(side),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.002,
      color: gunmetalDark,
      bone,
      flat,
      name: `blade.bloodGroove${side}`,
      group: "blade.detail",
    });

    // Narrow highlight immediately beside the groove.
    b.extrude(
      [
        [0.012, 0.26, "sharp"],
        [0.018, 0.29, "sharp"],
        [0.020, 1.18, "sharp"],
        [0.014, 1.20, "sharp"],
      ],
      {
        at: [side * 0.0208, 0, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.0015,
        color: steelDark,
        bone,
        flat,
        name: `blade.grooveRim${side}`,
        group: "blade.detail",
      },
    );
  }

  // Seven serrated rear teeth, each with a darker body and a bright tip.
  const teeth = [
    { y: 0.36, h: 0.095, z: -0.067 },
    { y: 0.47, h: 0.105, z: -0.073 },
    { y: 0.59, h: 0.115, z: -0.078 },
    { y: 0.72, h: 0.125, z: -0.082 },
    { y: 0.85, h: 0.135, z: -0.086 },
    { y: 0.98, h: 0.145, z: -0.091 },
    { y: 1.11, h: 0.155, z: -0.094 },
  ];

  for (let i = 0; i < teeth.length; i++) {
    const t = teeth[i];
    const z0 = t.z;
    const z1 = z0 - t.h;
    b.extrude(
      [
        [z0 + 0.006, t.y - 0.045, "sharp"],
        [z0 + 0.006, t.y + 0.045, "sharp"],
        [z1, t.y + 0.008, "sharp"],
        [z1, t.y - 0.008, "sharp"],
      ],
      {
        at: [0, 0, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.028,
        bevel: 0.001,
        color: steelDark,
        bone,
        flat,
        name: `blade.tooth${i}`,
        group: "blade.teeth",
      },
    );

    b.extrude(
      [
        [z1 + 0.003, t.y - 0.018, "sharp"],
        [z1 + 0.003, t.y + 0.018, "sharp"],
        [z1 - 0.014, t.y + 0.004, "sharp"],
        [z1 - 0.014, t.y - 0.004, "sharp"],
      ],
      {
        at: [0, 0, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.031,
        color: brassLight,
        bone,
        flat,
        name: `blade.toothTip${i}`,
        group: "blade.teeth",
      },
    );
  }

  // Emblem discs on both faces.
  for (const side of [-1, 1]) {
    const disc = b.part(
      new THREE.CylinderGeometry(0.057, 0.057, 0.008, 12),
      ivory,
      {
        at: [side * 0.024, 0.22, 0.012],
        dir: [side, 0, 0],
        axis: "y",
        bone,
        flat,
        name: `blade.emblemPlate${side}`,
        group: "blade.emblem",
      },
    );

    // Gold winged lion-like crest: crown, wings, and central body.
    const crestAt = (z: number, y: number) => [side * 0.029, y, z] as [number, number, number];

    b.extrude(
      [
        [-0.010, -0.018, "sharp"],
        [0.010, -0.018, "sharp"],
        [0.014, 0.018, "sharp"],
        [0, 0.031, "sharp"],
        [-0.014, 0.018, "sharp"],
      ],
      {
        at: crestAt(0.012, 0.22),
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.004,
        color: gold,
        bone,
        flat,
        name: `blade.lionBody${side}`,
        group: "blade.emblem",
      },
    );

    b.extrude(
      [
        [0.006, 0.005, "sharp"],
        [0.050, 0.019, "sharp"],
        [0.033, -0.001, "sharp"],
        [0.010, -0.012, "sharp"],
      ],
      {
        at: crestAt(0.012, 0.22),
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.004,
        color: gold,
        bone,
        flat,
        name: `blade.lionWingR${side}`,
        group: "blade.emblem",
      },
    );

    b.extrude(
      [
        [-0.006, 0.005, "sharp"],
        [-0.050, 0.019, "sharp"],
        [-0.033, -0.001, "sharp"],
        [-0.010, -0.012, "sharp"],
      ],
      {
        at: crestAt(0.012, 0.22),
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.004,
        color: gold,
        bone,
        flat,
        name: `blade.lionWingL${side}`,
        group: "blade.emblem",
      },
    );

    // Two silver fasteners.
    for (const z of [-0.035, 0.058]) {
      b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 8), silver, {
        at: [side * 0.032, 0.22, z],
        dir: [side, 0, 0],
        axis: "y",
        bone,
        flat,
        name: `blade.emblemRivet${side}${z}`,
        group: "blade.emblem",
      });
    }
  }

  // Two pairs of glowing chevron runes, one pair above and one below the emblem.
  for (const side of [-1, 1]) {
    for (const y of [0.14, 0.32]) {
      const z = side * 0.052;
      const rune = b.extrude(
        [
          [z - side * 0.018, y, "sharp"],
          [z, y + 0.018, "sharp"],
          [z + side * 0.018, y, "sharp"],
          [z + side * 0.008, y - 0.006, "sharp"],
          [z, y + 0.007, "sharp"],
          [z - side * 0.008, y - 0.006, "sharp"],
        ],
        {
          at: [side * 0.026, 0, 0],
          x: [0, 0, 1],
          y: [0, 1, 0],
          thickness: 0.003,
          color: runeGlow,
          bone,
          flat,
          name: `blade.rune${side}${y}`,
          group: "blade.runes",
        },
      );
      glow(rune, 2.2);
    }
  }

  // Brass collar rivets where the blade disappears into the guard.
  for (const side of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.014, 8, 5), brassLight, {
      at: [side * 0.073, 1.294, 0.045],
      bone,
      flat,
      name: `blade.collarRivet${side}`,
      group: "blade.guardSeat",
    });
    b.part(new THREE.CylinderGeometry(0.010, 0.010, 0.006, 8), brass, {
      at: [side * 0.075, 1.294, -0.052],
      dir: [side, 0, 0],
      axis: "y",
      bone,
      flat,
      name: `blade.collarRearRivet${side}`,
      group: "blade.guardSeat",
    });
  }

  // Small dark fuller marks near the planted tip, giving the point a forged, faceted finish.
  for (const side of [-1, 1]) {
    b.extrude(
      [
        [-0.010, 0.045, "sharp"],
        [0.003, 0.072, "sharp"],
        [0.010, 0.12, "sharp"],
        [-0.003, 0.095, "sharp"],
      ],
      {
        at: [side * 0.021, 0, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.0015,
        color: gunmetalDark,
        bone,
        flat,
        name: `blade.tipForgeMark${side}`,
        group: "blade.detail",
      },
    );
  }
}
```