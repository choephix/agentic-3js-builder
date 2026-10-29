<!-- call: plan -->

```json
{
  "name": "Pip the Chibi Axolotl",
  "description": "A chibi axolotl with a huge round head, frilly coral-pink external gills, a wide contented smile and a broad ribbon tail, standing on four stubby legs.",
  "builderName": "axolotlChibi",
  "size": [0.56, 0.36, 0.8],
  "layout": "A chibi salamander facing +Z, roughly one-third head, one-third body, one-third tail. The head is an oversized rounded dome (the hero feature) whose sides carry three pairs of coral gill stalks fanning up, out and back, each stalk dressed with soft frilly filaments; the face is wide and flat with two small dark bead eyes set far apart, tiny nostrils, rosy cheek blushes and a very wide gentle smile with a thin darker mouth line. The torso is a short plump capsule lower than the head, with a cream belly and a faint dorsal ridge. Four very short stubby legs (front pair at the chest, hind pair under the hips) end in little rounded feet with three toes each, and they are the only parts touching the floor. The tail is a thick root that tapers into a broad flat fin ribbon sweeping back to z = -0.62, with a slightly transparent-look lighter fin edge. The style is bold and toy-like: every shape a chunky primitive, gills and smile oversized, cheeks blushing, belly pale, all flat colours with the coral gills as the loudest accent against the soft pink skin.",
  "palette": {
    "skin": "#f2a7c3",
    "skinShadow": "#e287ab",
    "belly": "#fdeaf0",
    "gillCoral": "#ff5c8a",
    "gillLight": "#ff9ebc",
    "finEdge": "#ffc9dc",
    "ink": "#3a2438",
    "eyeShine": "#ffffff",
    "blush": "#ff8fb0",
    "toe": "#e989ad"
  },
  "mounts": {
    "neck": [0, 0.22, 0.12],
    "tailRoot": [0, 0.16, -0.22],
    "shoulderFL": [0.1, 0.11, 0.04],
    "shoulderFR": [-0.1, 0.11, 0.04],
    "hipHL": [0.11, 0.11, -0.16],
    "hipHR": [-0.11, 0.11, -0.16]
  },
  "joints": [
    { "name": "body", "at": [0, 0.16, -0.05], "dir": [0, 1, 0], "role": "spine" },
    { "name": "head", "parent": "body", "at": [0, 0.22, 0.12], "dir": [0, 0.35, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 0.16, 0.19], "dir": [0, -0.4, 1], "role": "jaw" },
    { "name": "gillLT", "parent": "head", "at": [0.15, 0.28, 0.13], "dir": [1, 0.45, 0.5], "role": "fan", "group": "gills" },
    { "name": "gillLM", "parent": "head", "at": [0.17, 0.24, 0.09], "dir": [1, 0.1, 0.7], "role": "fan", "group": "gills" },
    { "name": "gillLB", "parent": "head", "at": [0.15, 0.2, 0.05], "dir": [1, -0.25, 0.75], "role": "fan", "group": "gills" },
    { "name": "gillRT", "parent": "head", "at": [-0.15, 0.28, 0.13], "dir": [-1, 0.45, 0.5], "role": "fan", "group": "gills" },
    { "name": "gillRM", "parent": "head", "at": [-0.17, 0.24, 0.09], "dir": [-1, 0.1, 0.7], "role": "fan", "group": "gills" },
    { "name": "gillRB", "parent": "head", "at": [-0.15, 0.2, 0.05], "dir": [-1, -0.25, 0.75], "role": "fan", "group": "gills" },
    { "name": "tail1", "parent": "body", "at": [0, 0.16, -0.22], "dir": [0, 0, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 0.17, -0.4], "dir": [0, 0, -1], "role": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 0.18, -0.55], "dir": [0, 0.1, -1], "role": "tail" },
    { "name": "legFL", "parent": "body", "at": [0.1, 0.11, 0.04], "dir": [0, -1, 0.25], "role": "leg", "group": "legs" },
    { "name": "footFL", "parent": "legFL", "at": [0.11, 0.02, 0.06], "dir": [0, -1, 0.4], "role": "digit", "group": "legs" },
    { "name": "legFR", "parent": "body", "at": [-0.1, 0.11, 0.04], "dir": [0, -1, 0.25], "role": "leg", "group": "legs" },
    { "name": "footFR", "parent": "legFR", "at": [-0.11, 0.02, 0.06], "dir": [0, -1, 0.4], "role": "digit", "group": "legs" },
    { "name": "legHL", "parent": "body", "at": [0.11, 0.11, -0.16], "dir": [0, -1, 0.1], "role": "leg", "group": "legs" },
    { "name": "footHL", "parent": "legHL", "at": [0.12, 0.02, -0.15], "dir": [0, -1, 0.25], "role": "digit", "group": "legs" },
    { "name": "legHR", "parent": "body", "at": [-0.11, 0.11, -0.16], "dir": [0, -1, 0.1], "role": "leg", "group": "legs" },
    { "name": "footHR", "parent": "legHR", "at": [-0.12, 0.02, -0.15], "dir": [0, -1, 0.25], "role": "digit", "group": "legs" }
  ],
  "parts": [
    {
      "id": "head",
      "builds": "The oversized chibi head and every face feature plus the gill crowns. Skull: a large rounded dome (sphere or lofted capsule roughly 0.34 m wide and 0.3 m tall) in skin pink, slightly wider than tall, with a short blunt snout box/loft protruding to z = 0.4 in skin pink with a cream chin and underside. Face (all on the head bone, nothing in front of the eyes): two small glossy bead eyes (dark ink spheres with a white shine stud each) set wide at about x = ±0.1, y = 0.26; tiny ink nostril dots on the snout tip; a very wide smile built as a shallow swept ink mouth line across the front from x = -0.11 to x = 0.11 with small upturned corner ticks; rosy blush ovals (flat pink discs) under each eye. The signature feature: three gill stalks per side rising from the head's upper sides on the gillLT/gillLM/gillLB joints, each stalk a short tapering sweep in gill coral that fans outward and back, and each stalk carrying 5-7 soft frilly filaments (small tapered spikes or short swept fronds alternating gill coral and gill light) branching off both sides along its length, the fronds longest on the top stalk so the crown reads instantly. Give each gill joint a small rest-pose splay so the frills are separated and readable.",
      "box": [[-0.26, 0.08, 0.06], [0.26, 0.34, 0.4]],
      "attaches": "The skull's lower back sits over the neck mount [0, 0.22, 0.12], overlapping the body part's front; its underside meets the jaw mount. All geometry rides the head, jaw and gill joints.",
      "joints": ["head", "jaw", "gillLT", "gillLM", "gillLB", "gillRT", "gillRM", "gillRB"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "body",
      "builds": "The plump torso between head and tail. A short horizontal capsule or loft (about 0.24 m wide, 0.14 m tall, from z = -0.26 to z = 0.14) in skin pink, sagging slightly lower at the belly. Belly: a cream underside built as either a paint-free second loft or stuck belly plates covering the lower third. A subtle dorsal ridge: a row of 6-8 tiny rounded skin-shadow studs or a low frill running along the spine from the neck mount back to the tailRoot mount. Small shoulder and hip smooth bulges where the legs attach, and a soft neck crease ring where the head overlaps. The body's top surface is a touch warmer pink, its underside cream, keeping the countershade reading.",
      "box": [[-0.14, 0.07, -0.28], [0.14, 0.24, 0.16]],
      "attaches": "Front face meets the head part at the neck mount [0, 0.22, 0.12]; rear face meets the tail part at the tailRoot mount [0, 0.16, -0.22]; undersides open at the four leg-socket mounts (shoulderFL/FR, hipHL/HR). Rides the body joint.",
      "joints": ["body"],
      "floor": false,
      "budget": 90
    },
    {
      "id": "legs",
      "builds": "Four stubby chibi legs with feet and toes. Each leg: a short thick tapered tube or two-sweep limb from its socket mount down to the floor, in skin pink with a skin-shadow crease ring at the ankle, ending in a rounded foot (a squashed sphere or low dome in toe pink) whose bottom rests exactly on y = 0. Each foot carries three small toe bumps (tiny spheres or short digit spikes) fanning forward, in toe pink, plus a small pale claw nub per toe. Front pair slightly shorter and turned a few degrees outward, hind pair a touch sturdier. All four legs identical in construction, mirrored across x = 0.",
      "box": [[-0.2, 0.0, -0.24], [0.2, 0.12, 0.1]],
      "attaches": "Each leg's top socket meets the body part at its named mount (shoulderFL, shoulderFR, hipHL, hipHR) and is hidden inside the torso's lower edge. Rides that leg's leg and foot joints.",
      "joints": ["legFL", "footFL", "legFR", "footFR", "legHL", "footHL", "legHR", "footHR"],
      "floor": true,
      "budget": 120
    },
    {
      "id": "tail",
      "builds": "The broad ribbon tail with its fin. Tail root: a thick tapering sweep continuing the body line from the tailRoot mount back to about z = -0.5, in skin pink with a cream underside. Fin: a wide flat membrane or extruded fin lobe wrapping the tail's last third, from the dorsal ridge line down past the belly line on both sides (top fin and bottom fin lobes or one full caudal fin), in finEdge pink, lighter and thinner toward the scalloped trailing edge so it reads as translucent against the body; the fin's root joins smoothly into the tail root's skin. Give the fin a soft wavy or scalloped trailing edge and a faint midline seam in skin shadow where fin meets tail. Tip of the tail rounds off at z = -0.62.",
      "box": [[-0.16, 0.04, -0.64], [0.16, 0.27, -0.2]],
      "attaches": "Front face meets the body part at the tailRoot mount [0, 0.16, -0.22], its root radius matching the torso's rear. Rides the tail1, tail2 and tail3 joints.",
      "joints": ["tail1", "tail2", "tail3"],
      "floor": false,
      "budget": 110
    }
  ]
}
```

<!-- call: body -->

```ts
import * as THREE from "three";
import { catmull } from "agentic-3js-builder";

export function buildBody({ b, J, P, M }: Ctx) {
  const skin = P.skin;
  const belly = P.belly;
  const shadow = P.skinShadow;
  const ink = P.ink;

  // A low, plump horizontal capsule. The centreline follows the two shared
  // attachment mounts so the head and tail overlap this volume cleanly.
  const torsoPath = catmull([
    [M.neck[0], 0. sixteen ?? 0.16, M.neck[2]],
    [0, 0.148, 0.03],
    [0, 0.143, -0.10],
    [M.tailRoot[0], M.tailRoot[1], M.tailRoot[2]],
  ]);

  const torso = b.sweep(torsoPath, () => [0.14, 0.082], {
    bone: J.body,
    color: skin,
    section: { ngon: 8 },
    caps: "flat",
    name: "bodyTorso",
    group: "body",
    sectors: [
      [112, 248, belly],
    ],
  });

  // A soft dark crease where the oversized head settles over the torso.
  const neckSurface = b.surface(torso);
  const neckLoop = neckSurface.loop(
    [0, 0.158, 0.112],
    { dir: [0, 0, 1], lift: 0.004 },
  );
  b.sweep(neckLoop, 0.006, {
    bone: J.body,
    color: shadow,
    caps: "none",
    name: "bodyNeckCrease",
    group: "trim",
  });

  // A second, quieter belly accent follows the lower front half of the body.
  const bellyLine = torso.line(180, 0.004).slice(0.03, 0.58);
  b.sweep(bellyLine, 0.0045, {
    bone: J.body,
    color: belly,
    caps: "round",
    name: "bodyBellySeam",
    group: "belly",
  });

  // Rounded socket pads make the four limb roots feel embedded in the torso.
  const socketPads = [
    [0.102, 0.105, 0.045],
    [-0.102, 0.105, 0.045],
    [0.112, 0.106, -0.158],
    [-0.112, 0.106, -0.158],
  ] as const;

  for (let i = 0; i < socketPads.length; i++) {
    const pad = b.part(
      new THREE.SphereGeometry(0.047, 8, 5),
      skin,
      {
        bone: J.body,
        at: socketPads[i],
        scale: [1.08, 0.72, 0.92],
        name: `bodySocket${i}`,
        group: "sockets",
        flat: true,
      },
    );

    // A small shadow crescent under each socket gives separation from the belly.
    b.stick(
      new THREE.SphereGeometry(0.019, 7, 4),
      shadow,
      {
        at: [socketPads[i][0], 0.071, socketPads[i][2] + 0.008],
        bone: J.body,
        embed: 0.42,
        scale: [1.5, 0.3, 0.8],
        name: `bodySocketShadow${i}`,
        group: "sockets",
      },
    );
  }

  // Seven low dorsal beads form a readable ridge without turning the body
  // into a smooth generic tube.
  for (let i = 0; i < 7; i++) {
    const t = 0.12 + (i / 6) * 0.76;
    const top = torso.at(t, 0, 0.002);
    const radius = i === 0 || i === 6 ? 0.010 : 0.013;
    b.stick(
      new THREE.SphereGeometry(radius, 7, 4),
      shadow,
      top,
      {
        embed: 0.38,
        name: `bodyDorsalStud${i}`,
        group: "dorsalRidge",
      },
    );
  }

  // Tiny warm-pink plates tucked between the dorsal beads add a toy-like
  // ridge silhouette when viewed from above.
  for (let i = 0; i < 6; i++) {
    const t = 0.18 + (i / 5) * 0.68;
    const top = torso.at(t, 0, 0.006);
    b.stick(
      new THREE.ConeGeometry(0.011, 0.018, 6),
      skin,
      top,
      {
        embed: 0.68,
        spin: i % 2 ? 18 : -18,
        name: `bodyRidgePlate${i}`,
        group: "dorsalRidge",
      },
    );
  }

  // A pair of subtle side panels visually joins the socket pads to the tail.
  for (const side of [1, -1]) {
    const flankPath = catmull([
      [side * 0.122, 0.155, 0.06],
      [side * 0.143, 0.145, -0.045],
      [side * 0.125, 0.15, -0.16],
    ]);
    b.sweep(flankPath, [0.009, 0.012], {
      bone: J.body,
      color: shadow,
      section: { ngon: 6 },
      caps: "round",
      name: side > 0 ? "bodyFlankL" : "bodyFlankR",
      group: "bodyDetails",
    });
  }

  // A small underside patch keeps the cream belly visible between the legs.
  b.part(
    new THREE.SphereGeometry(1, 10, 6),
    belly,
    {
      bone: J.body,
      at: [0, 0.081, -0.055],
      scale: [0.105, 0.018, 0.145],
      name: "bodyBellyPatch",
      group: "belly",
      flat: true,
    },
  );

  // Two tiny ink freckles at the front edge act as understated body markings
  // and help the head/body overlap read as intentional.
  for (const side of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(0.006, 6, 4),
      ink,
      {
        bone: J.body,
        at: [side * 0.095, 0.156, 0.121],
        scale: [1, 0.55, 0.8],
        name: side > 0 ? "bodyFrontMarkL" : "bodyFrontMarkR",
        group: "bodyDetails",
      },
    );
  }

  return torso;
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: Ctx) {
  const V = (p: any) => new THREE.Vector3(p[0], p[1], p[2]);
  const add = (a: THREE.Vector3, x: number, y: number, z: number) =>
    new THREE.Vector3(a.x + x, a.y + y, a.z + z);

  const legData = [
    { side: 1, front: true, leg: J.legFL, foot: J.footFL, mount: M.shoulderFL },
    { side: -1, front: true, leg: J.legFR, foot: J.footFR, mount: M.shoulderFR },
    { side: 1, front: false, leg: J.legHL, foot: J.footHL, mount: M.hipHL },
    { side: -1, front: false, leg: J.legHR, foot: J.footHR, mount: M.hipHR },
  ];

  for (let li = 0; li < legData.length; li++) {
    const d = legData[li];
    const legAt = V(d.leg.at);
    const footAt = V(d.foot.at);
    const legRadius = d.front ? 0.022 : 0.026;

    // A short, rounded shin disappears into the torso at its upper end and into the foot below.
    const shinEnd = new THREE.Vector3(footAt.x, 0.043, footAt.z);
    b.capsule(legAt, shinEnd, legRadius, {
      color: P.skin,
      bone: d.leg,
      name: d.front ? `frontShin${d.side > 0 ? "L" : "R"}` : `hindShin${d.side > 0 ? "L" : "R"}`,
      group: "legs",
    });

    // A dark-pink low-poly cuff gives each ankle a readable crease.
    const ankle = new THREE.Vector3(
      footAt.x,
      d.front ? 0.064 : 0.061,
      footAt.z,
    );
    b.part(
      new THREE.TorusGeometry(
        d.front ? 0.023 : 0.027,
        0.0042,
        6,
        10,
      ),
      P.skinShadow,
      {
        at: ankle,
        bone: d.leg,
        dir: new THREE.Vector3(0, -1, d.front ? 0.22 : 0.12),
        name: `ankleCuff${d.side > 0 ? "L" : "R"}${d.front ? "F" : "H"}`,
        group: "legs",
      },
    );

    // Squashed rounded foot: its lowest point is about 7 mm above zero,
    // leaving the small toes as the only pieces approaching the floor.
    const footCenter = new THREE.Vector3(footAt.x, 0.035, footAt.z);
    const foot = b.part(
      new THREE.SphereGeometry(1, 10, 7),
      P.toe,
      {
        at: footCenter,
        bone: d.foot,
        scale: [d.front ? 0.043 : 0.048, 0.028, d.front ? 0.052 : 0.057],
        name: `roundedFoot${d.side > 0 ? "L" : "R"}${d.front ? "F" : "H"}`,
        group: "legs",
        flat: true,
      },
    );

    // Three chunky forward-pointing toes, fanned slightly across each foot.
    const toeX = [-0.022, 0, 0.022];
    const toeZ = d.front ? [0.032, 0.047, 0.032] : [0.036, 0.052, 0.036];

    for (let ti = 0; ti < 3; ti++) {
      const x = toeX[ti];
      const start = new THREE.Vector3(
        footCenter.x + x * 0.55,
        0.027,
        footCenter.z + 0.018,
      );
      const end = new THREE.Vector3(
        footCenter.x + x,
        0.015,
        footCenter.z + toeZ[ti],
      );

      b.capsule(start, end, d.front ? 0.009 : 0.0105, {
        color: P.toe,
        bone: d.foot,
        name: `toe${ti + 1}${d.side > 0 ? "L" : "R"}${d.front ? "F" : "H"}`,
        group: "legs",
      });

      // Tiny pale claw nub at the end of every toe.
      const claw = new THREE.Vector3(end.x, 0.013, end.z + 0.003);
      b.part(
        new THREE.SphereGeometry(0.0052, 6, 4),
        P.belly,
        {
          at: claw,
          bone: d.foot,
          scale: [0.72, 0.62, 1.2],
          name: `claw${ti + 1}${d.side > 0 ? "L" : "R"}${d.front ? "F" : "H"}`,
          group: "legs",
          flat: true,
        },
      );
    }

    // A small upper socket bulge makes the legs feel embedded in the plump torso.
    const socket = V(d.mount);
    b.part(
      new THREE.SphereGeometry(1, 8, 6),
      P.skinShadow,
      {
        at: socket,
        bone: d.leg,
        scale: [0.031, 0.025, 0.031],
        name: `socket${d.side > 0 ? "L" : "R"}${d.front ? "F" : "H"}`,
        group: "legs",
        flat: true,
      },
    );
  }
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import { catmull, createBuilder } from "agentic-3js-builder";

export function buildTail({ b, J, P, M }: Ctx) {
  const skin = P.skin;
  const skinShadow = P.skinShadow;
  const belly = P.belly;
  const fin = P.finEdge;
  const ink = P.ink;

  const tailRoot = M.tailRoot ?? [0, 0.16, -0.22];
  const tailPath = catmull([
    tailRoot,
    [0, 0.162, -0.30],
    [0, 0.17, -0.405],
    [0, 0.18, -0.505],
    [0, 0.185, -0.595],
  ]);

  const tailTube = b.sweep(tailPath, (t: number) => {
    if (t < 0.18) return 0.073;
    if (t < 0.48) return 0.066;
    if (t < 0.78) return 0.047;
    return 0.024;
  }, {
    bone: [J.tail1, J.tail2, J.tail3],
    color: skin,
    sides: 8,
    caps: { start: "round", end: "round" },
    sectors: [
      [125, 235, belly],
      [235, 305, skinShadow],
    ],
    name: "tailCore",
    group: "tail",
  });

  // A soft pale underside stripe gives the thick root a clear belly without
  // making the whole ribbon look detached from the body.
  const underside = b.sweep(tailPath.slice(0.02, 0.76), (t: number) => {
    const radius = t < 0.35 ? 0.027 : 0.021;
    return radius;
  }, {
    bone: [J.tail1, J.tail2, J.tail3],
    color: belly,
    sides: 6,
    shift: [0, 0.038],
    caps: "round",
    name: "tailBelly",
    group: "tail",
  });

  const finSections = [
    {
      z0: -0.285,
      z1: -0.395,
      bone: J.tail1,
      width0: 0.065,
      width1: 0.105,
      top0: 0.215,
      top1: 0.245,
      bottom0: 0.115,
      bottom1: 0.095,
    },
    {
      z0: -0.395,
      z1: -0.505,
      bone: J.tail2,
      width0: 0.105,
      width1: 0.145,
      top0: 0.245,
      top1: 0.258,
      bottom0: 0.095,
      bottom1: 0.078,
    },
    {
      z0: -0.505,
      z1: -0.595,
      bone: J.tail3,
      width0: 0.145,
      width1: 0.102,
      top0: 0.258,
      top1: 0.216,
      bottom0: 0.078,
      bottom1: 0.108,
    },
  ];

  const upperEdges: THREE.Vector3[][] = [];
  const lowerEdges: THREE.Vector3[][] = [];

  for (let i = 0; i < finSections.length; i++) {
    const s = finSections[i];
    const mid0 = (s.top0 + s.bottom0) * 0.5;
    const mid1 = (s.top1 + s.bottom1) * 0.5;

    const upperA = catmull([
      [-s.width0, s.top0, s.z0],
      [-s.width0 * 0.72, s.top0 + 0.006, s.z0 - 0.035],
      [-s.width1 * 0.78, s.top1 - 0.004, s.z1 + 0.018],
      [-s.width1, s.top1, s.z1],
    ]);
    const upperB = catmull([
      [s.width0, s.top0, s.z0],
      [s.width0 * 0.72, s.top0 + 0.006, s.z0 - 0.035],
      [s.width1 * 0.78, s.top1 - 0.004, s.z1 + 0.018],
      [s.width1, s.top1, s.z1],
    ]);

    const lowerA = catmull([
      [-s.width0 * 0.98, s.bottom0, s.z0],
      [-s.width0 * 0.72, s.bottom0 - 0.005, s.z0 - 0.032],
      [-s.width1 * 0.76, s.bottom1 + 0.005, s.z1 + 0.018],
      [-s.width1 * 0.94, s.bottom1, s.z1],
    ]);
    const lowerB = catmull([
      [s.width0 * 0.98, s.bottom0, s.z0],
      [s.width0 * 0.72, s.bottom0 - 0.005, s.z0 - 0.032],
      [s.width1 * 0.76, s.bottom1 + 0.005, s.z1 + 0.018],
      [s.width1 * 0.94, s.bottom1, s.z1],
    ]);

    const center = catmull([
      [0, mid0, s.z0],
      [0, mid0 + 0.004, s.z0 - 0.035],
      [0, mid1 - 0.003, s.z1 + 0.018],
      [0, mid1, s.z1],
    ]);

    // Two halves make the central seam readable and keep the fin visually
    // wrapped around the body rather than looking like a single flat plate.
    b.membrane(center, upperA, {
      bone: s.bone,
      color: fin,
      thickness: 0.004,
      rows: 3,
      cols: 5,
      scallop: 0.18,
      name: `finUpperL${i}`,
      group: "tailFin",
    });
    b.membrane(center, upperB, {
      bone: s.bone,
      color: fin,
      thickness: 0.004,
      rows: 3,
      cols: 5,
      scallop: 0.18,
      name: `finUpperR${i}`,
      group: "tailFin",
    });
    b.membrane(lowerA, center, {
      bone: s.bone,
      color: fin,
      thickness: 0.004,
      rows: 3,
      cols: 5,
      scallop: 0.16,
      name: `finLowerL${i}`,
      group: "tailFin",
    });
    b.membrane(center, lowerB, {
      bone: s.bone,
      color: fin,
      thickness: 0.004,
      rows: 3,
      cols: 5,
      scallop: 0.16,
      name: `finLowerR${i}`,
      group: "tailFin",
    });

    // Bright low-poly rim cords exaggerate the scalloped silhouette.
    b.sweep(upperA, [0.007, 0.003], {
      bone: s.bone,
      color: fin,
      sides: 6,
      caps: "round",
      name: `upperRimL${i}`,
      group: "finTrim",
    });
    b.sweep(upperB, [0.007, 0.003], {
      bone: s.bone,
      color: fin,
      sides: 6,
      caps: "round",
      name: `upperRimR${i}`,
      group: "finTrim",
    });
    b.sweep(lowerA, [0.006, 0.003], {
      bone: s.bone,
      color: fin,
      sides: 6,
      caps: "round",
      name: `lowerRimL${i}`,
      group: "finTrim",
    });
    b.sweep(lowerB, [0.006, 0.003], {
      bone: s.bone,
      color: fin,
      sides: 6,
      caps: "round",
      name: `lowerRimR${i}`,
      group: "finTrim",
    });

    // Small transverse fin rays provide graphic detail at the root and fan.
    for (let r = 1; r <= 2; r++) {
      const t = r / 3;
      const z = s.z0 + (s.z1 - s.z0) * t;
      const top = s.top0 + (s.top1 - s.top0) * t;
      const bottom = s.bottom0 + (s.bottom1 - s.bottom0) * t;
      const w = s.width0 + (s.width1 - s.width0) * t;
      b.rod(
        [-w * 0.92, bottom + 0.006, z],
        [w * 0.92, top - 0.006, z],
        0.0022,
        skinShadow,
        {
          bone: s.bone,
          sides: 5,
          caps: "round",
          name: `finRay${i}_${r}`,
          group: "tailFin",
        },
      );
    }
  }

  // A thin darker seam follows the centre of the ribbon where it grows out
  // of the fleshy tail, tying the fin back into the torso.
  b.sweep(
    catmull([
      [0, 0.207, -0.285],
      [0, 0.211, -0.36],
      [0, 0.218, -0.445],
      [0, 0.224, -0.525],
      [0, 0.218, -0.585],
    ]),
    [0.0045, 0.002],
    {
      bone: [J.tail1, J.tail2, J.tail3],
      color: skinShadow,
      sides: 6,
      caps: "round",
      name: "finMidlineSeam",
      group: "tailFin",
    },
  );

  // Tiny paired root marks make the fin attachment feel folded into the tail.
  for (const side of [-1, 1]) {
    b.spike(
      [side * 0.035, 0.205, -0.265],
      [side * 0.18, 0.04, -0.12],
      0.035,
      0.006,
      {
        bone: J.tail1,
        color: skinShadow,
        name: `rootFold${side > 0 ? "L" : "R"}`,
        group: "tail",
      },
    );
  }

  return {
    tailTube,
    underside,
  };
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { polyline, rng } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  const random = rng(41);

  const skin = P.skin;
  const skinShadow = P.skinShadow;
  const belly = P.belly;
  const coral = P.gillCoral;
  const coralLight = P.gillLight;
  const edge = P.finEdge;
  const ink = P.ink;
  const white = P.eyeShine;
  const blush = P.blush;

  const sphere = (
    radius: number,
    color: string,
    at: THREE.Vector3 | [number, number, number],
    scale: [number, number, number],
    bone: any,
    name: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 12, 8), color, {
      at,
      bone,
      scale,
      flat: true,
      name,
      group: "head",
    });

  const box = (
    size: [number, number, number],
    color: string,
    at: THREE.Vector3 | [number, number, number],
    bone: any,
    name: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      flat: true,
      name,
      group: "head",
    });

  // Oversized rounded chibi skull.
  sphere(
    1,
    skin,
    [0, 0.215, 0.215],
    [0.26, 0.135, 0.19],
    J.head,
    "headSkull",
  );

  // Soft shadow cap along the lower rear of the skull, giving the dome a toy-like rim.
  b.sweep(
    polyline([
      [-0.205, 0.145, 0.11],
      [-0.12, 0.115, 0.085],
      [0, 0.105, 0.078],
      [0.12, 0.115, 0.085],
      [0.205, 0.145, 0.11],
    ]),
    0.018,
    {
      bone: J.head,
      color: skinShadow,
      caps: "round",
      section: { ngon: 6 },
      name: "headLowerRim",
      group: "head",
    },
  );

  // Blunt, broad snout projecting toward the viewer.
  box([0.225, 0.085, 0.095], skin, [0, 0.205, 0.348], J.head, "snout");
  sphere(
    1,
    belly,
    [0, 0.168, 0.388],
    [0.105, 0.036, 0.026],
    J.jaw,
    "creamChin",
  );

  // Wide-set bead eyes with two-layer glossy highlights.
  for (const side of [-1, 1]) {
    const x = side * 0.105;

    sphere(0.024, ink, [x, 0.258, 0.382], [1, 1, 0.72], J.head, `eye${side}`);
    sphere(0.007, white, [x - side * 0.006, 0.266, 0.401], [1, 1, 0.55], J.head, `eyeShine${side}`);
    sphere(0.0038, white, [x + side * 0.008, 0.248, 0.402], [1, 1, 0.45], J.head, `eyePin${side}`);

    // Blush is made from a flattened, faceted oval rather than a texture.
    sphere(
      1,
      blush,
      [x, 0.205, 0.394],
      [0.040, 0.018, 0.008],
      J.head,
      `cheek${side}`,
    );

    // Tiny nostril bead on the forward snout face.
    sphere(
      0.006,
      ink,
      [side * 0.038, 0.236, 0.404],
      [1, 0.8, 0.45],
      J.head,
      `nostril${side}`,
    );
  }

  // A broad, shallow contented smile.
  const smile = b.sweep(
    polyline([
      [-0.118, 0.177, 0.412],
      [-0.087, 0.166, 0.416],
      [-0.045, 0.158, 0.418],
      [0, 0.155, 0.419],
      [0.045, 0.158, 0.418],
      [0.087, 0.166, 0.416],
      [0.118, 0.177, 0.412],
    ]),
    0.0052,
    {
      bone: J.jaw,
      color: ink,
      caps: "round",
      section: { ngon: 6 },
      name: "wideSmile",
      group: "head",
    },
  );

  // Upturned corner ticks make the smile readable from a distance.
  for (const side of [-1, 1]) {
    b.sweep(
      polyline([
        [side * 0.116, 0.177, 0.412],
        [side * 0.126, 0.187, 0.411],
      ]),
      0.004,
      {
        bone: J.jaw,
        color: ink,
        caps: "round",
        section: { ngon: 6 },
        name: `smileCorner${side}`,
        group: "head",
      },
    );
  }

  // A little cream lower lip/chin glint below the mouth.
  b.sweep(
    polyline([
      [-0.052, 0.145, 0.405],
      [0, 0.139, 0.411],
      [0.052, 0.145, 0.405],
    ]),
    0.006,
    {
      bone: J.jaw,
      color: belly,
      caps: "round",
      section: { ngon: 6 },
      name: "lowerLip",
      group: "head",
    },
  );

  // Gill stalks. The supplied joints are deliberately used as the roots so every
  // crown can be posed independently by an animator.
  const gillDefs = [
    { key: "T", y: 0.28, z: 0.13, reach: 0.085, rise: 0.070, back: -0.028, r0: 0.014, r1: 0.007 },
    { key: "M", y: 0.24, z: 0.09, reach: 0.075, rise: 0.025, back: -0.040, r0: 0.013, r1: 0.0065 },
    { key: "B", y: 0.20, z: 0.055, reach: 0.065, rise: -0.015, back: -0.047, r0: 0.012, r1: 0.0055 },
  ] as const;

  for (const side of [-1, 1]) {
    for (let gi = 0; gi < gillDefs.length; gi++) {
      const d = gillDefs[gi];
      const joint = J[`gill${side > 0 ? "L" : "R"}${d.key}`];
      const root = joint.at.clone();

      // Splay each crown slightly differently while keeping all tips inside the
      // characteristic head-and-gill silhouette.
      const phase = (random() - 0.5) * 0.012;
      const tip = new THREE.Vector3(
        side * (0.215 + d.reach + phase),
        d.y + d.rise,
        d.z + d.back,
      );

      const stalk = b.sweep(
        polyline([root, root.clone().lerp(tip, 0.46), tip]),
        (t: number) => d.r0 * (1 - t) + d.r1 * t,
        {
          bone: joint,
          color: coral,
          caps: "round",
          section: { ngon: 7 },
          name: `gillStalk${side}${d.key}`,
          group: "gills",
        },
      );

      // Small collar at each stalk root makes the gill assembly feel attached
      // rather than pasted onto the skull.
      b.part(
        new THREE.SphereGeometry(1, 8, 6),
        coralLight,
        {
          at: root,
          bone: joint,
          scale: [0.021, 0.020, 0.018],
          flat: true,
          name: `gillCollar${side}${d.key}`,
          group: "gills",
        },
      );

      // Six alternating fronds, three on either side of each stalk. The fronds
      // are tapered primitive sweeps with rounded roots and pointed ends.
      const frondCount = gi === 0 ? 7 : 6;
      for (let fi = 0; fi < frondCount; fi++) {
        const t = 0.16 + (fi / Math.max(1, frondCount - 1)) * 0.72;
        const along = root.clone().lerp(tip, t);
        const fan = fi % 2 === 0 ? 1 : -1;
        const vertical = (fi - (frondCount - 1) * 0.5) / frondCount;

        const length =
          (gi === 0 ? 0.042 : gi === 1 ? 0.034 : 0.027) *
          (1 - Math.abs(vertical) * 0.28);

        const frondTip = along.clone().add(
          new THREE.Vector3(
            side * (0.010 + length * 0.34),
            fan * (0.014 + length * 0.35) + vertical * 0.010,
            -0.008 - length * 0.64 + Math.abs(vertical) * 0.008,
          ),
        );

        const frondColor = (fi + gi + (side > 0 ? 0 : 1)) % 2 === 0 ? coralLight : coral;
        b.sweep(
          polyline([
            along,
            along.clone().lerp(frondTip, 0.48),
            frondTip,
          ]),
          (u: number) => 0.0055 * (1 - u) + 0.0008,
          {
            bone: joint,
            color: frondColor,
            caps: "point",
            section: { ngon: 6 },
            name: `gillFrond${side}${d.key}${fi}`,
            group: "gills",
          },
        );
      }

      // A small bright terminal bud gives each stalk a clean coral silhouette.
      b.part(
        new THREE.SphereGeometry(1, 8, 6),
        coralLight,
        {
          at: tip,
          bone: joint,
          scale: [0.010, 0.010, 0.010],
          flat: true,
          name: `gillTip${side}${d.key}`,
          group: "gills",
        },
      );
    }
  }

  // Tiny warm shadow tabs at the gill bases visually seat the crowns against the
  // pink dome and echo the crease under the head.
  for (const side of [-1, 1]) {
    for (const z of [0.105, 0.075, 0.050]) {
      sphere(
        1,
        skinShadow,
        [side * 0.158, 0.235 + (z - 0.075) * 1.2, z],
        [0.020, 0.014, 0.010],
        J.head,
        `gillBaseShadow${side}${z.toFixed(3)}`,
      );
    }
  }
}
```