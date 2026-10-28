<!-- call: plan -->

```json
{
  "name": "Bauhaus Songbird on a Branch",
  "description": "A life-size songbird perched on a gently curved branch, built from Bauhaus primary-colour geometry: a red sphere body, a yellow sphere head, blue half-disc wings, a black blade tail and a branch ringed in red, yellow and cream, with squares, circles and triangles for leaves.",
  "builderName": "bauhausSongbird",
  "size": [0.5, 0.2, 0.26],
  "layout": "Units are metres and the bird is life-size, about 0.25 m from beak tip (z +0.118) to tail tip (z -0.13). The branch runs along X (-0.25 to +0.25) and curves gently upward at both ends. Its lowest point, at x=0, rests on y=0 with axis y=0.02 and radius 0.02, so its top at x=0 is y=0.04. That top is the perch. The bird sits across the branch facing +Z, feet on the perch at x=±0.026. From the front the bird reads as stacked primitives. A big red ellipsoid body (about 0.055 half-width, 0.05 half-height, 0.075 half-length, centre [0,0.115,0.005]) carries a cream oval belly and a yellow triangle emblem on the breast. A black thin collar ring separates the body from a yellow sphere head (radius about 0.036, centre [0,0.165,0.062]). The head has big concentric-circle eyes (black, cream ring, yellow dot) at x=±0.027, a small red circular cheek disc under each eye, a red conical beak split into upper and lower jaw, and a crest of three flat triangles (red, blue, black) leaning back from the crown. The wings are folded on the flanks, angled slightly back and out, about 15 degrees off the body so they read as separate. Each is a blue half-disc or quarter-disc plate stack with a black bar, a cream stripe and a red triangle tip. The tail is a flat fan of three overlapping blocky rectangular blades in black, with a red centre stripe and a yellow tip square, sloping gently down and back from [0,0.108,-0.06] to [0,0.085,-0.13]. The thin black legs end in three forward toes and one back toe that wrap over the branch, with cream claw tips. The branch is charcoal, with alternating red, yellow and cream ring bands and two side twigs. One twig rises at x=-0.15 and carries leaves as flat blue squares, yellow discs and red triangles. The other twig points forward at x=+0.14. Every surface is a flat colour from the palette, and every motif (circle, triangle, square) is its own small part seated on the surface. Facets are visible (6 to 14 segments per primitive), nothing is smooth, and the layout is symmetric about x=0 except the branch twigs. Use primary colours for large areas and black, cream and charcoal for contrast; secondary hues are the only shading.",
  "palette": {
    "red": "#d7261e",
    "redDeep": "#9f1a14",
    "blue": "#1b4f9c",
    "blueDeep": "#12356f",
    "yellow": "#f4c20d",
    "yellowDeep": "#d29a00",
    "black": "#14141a",
    "charcoal": "#2d2d36",
    "cream": "#f2ead7",
    "grey": "#8f949c"
  },
  "mounts": {
    "perchTop": [0, 0.04, 0],
    "branchAxisCenter": [0, 0.02, 0],
    "footL": [0.026, 0.04, 0],
    "footR": [-0.026, 0.04, 0],
    "hipL": [0.026, 0.085, 0.005],
    "hipR": [-0.026, 0.085, 0.005],
    "bodyCenter": [0, 0.115, 0.005],
    "neckBase": [0, 0.13, 0.045],
    "headCenter": [0, 0.165, 0.062],
    "beakRoot": [0, 0.155, 0.093],
    "crownTop": [0, 0.198, 0.05],
    "wingRootL": [0.05, 0.13, 0.015],
    "wingRootR": [-0.05, 0.13, 0.015],
    "tailRoot": [0, 0.105, -0.06],
    "twigUpBase": [-0.15, 0.04, 0],
    "twigForwardBase": [0.14, 0.04, 0]
  },
  "joints": [
    { "name": "root", "at": [0, 0.04, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "body", "parent": "root", "at": [0, 0.105, -0.02], "dir": [0, 0.1, 1], "role": "spine" },
    { "name": "chest", "parent": "body", "at": [0, 0.115, 0.03], "dir": [0, 0.3, 1], "role": "spine" },
    { "name": "neck", "parent": "chest", "at": [0, 0.13, 0.045], "dir": [0, 0.6, 1], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 0.158, 0.062], "dir": [0, 0, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 0.152, 0.085], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "crest", "parent": "head", "at": [0, 0.196, 0.05], "dir": [0, 0.5, -1], "role": "hinge" },
    { "name": "tail1", "parent": "body", "at": [0, 0.105, -0.06], "dir": [0, -0.15, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 0.097, -0.09], "dir": [0, -0.15, -1], "role": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 0.088, -0.115], "dir": [0, -0.15, -1], "role": "tail" },
    { "name": "wingL", "parent": "chest", "at": [0.05, 0.13, 0.015], "dir": [0.3, -0.1, -1], "role": "wing" },
    { "name": "wingMidL", "parent": "wingL", "at": [0.065, 0.122, -0.03], "dir": [0.25, -0.1, -1], "role": "wing" },
    { "name": "wingTipL", "parent": "wingMidL", "at": [0.075, 0.108, -0.075], "dir": [0.2, -0.15, -1], "role": "wing" },
    { "name": "wingR", "parent": "chest", "at": [-0.05, 0.13, 0.015], "dir": [-0.3, -0.1, -1], "role": "wing" },
    { "name": "wingMidR", "parent": "wingR", "at": [-0.065, 0.122, -0.03], "dir": [-0.25, -0.1, -1], "role": "wing" },
    { "name": "wingTipR", "parent": "wingMidR", "at": [-0.075, 0.108, -0.075], "dir": [-0.2, -0.15, -1], "role": "wing" },
    { "name": "hipL", "parent": "body", "at": [0.026, 0.085, 0.005], "dir": [0, -1, 0], "role": "leg" },
    { "name": "ankleL", "parent": "hipL", "at": [0.026, 0.058, 0.0], "dir": [0, -1, 0], "role": "leg" },
    { "name": "toeInnerL", "parent": "ankleL", "at": [0.026, 0.045, 0.004], "dir": [-0.2, -0.1, 1], "role": "digit" },
    { "name": "toeOuterL", "parent": "ankleL", "at": [0.026, 0.045, 0.004], "dir": [0.25, -0.1, 1], "role": "digit" },
    { "name": "toeBackL", "parent": "ankleL", "at": [0.026, 0.045, 0.0], "dir": [0, -0.05, -1], "role": "digit" },
    { "name": "hipR", "parent": "body", "at": [-0.026, 0.085, 0.005], "dir": [0, -1, 0], "role": "leg" },
    { "name": "ankleR", "parent": "hipR", "at": [-0.026, 0.058, 0.0], "dir": [0, -1, 0], "role": "leg" },
    { "name": "toeInnerR", "parent": "ankleR", "at": [-0.026, 0.045, 0.004], "dir": [0.2, -0.1, 1], "role": "digit" },
    { "name": "toeOuterR", "parent": "ankleR", "at": [-0.026, 0.045, 0.004], "dir": [-0.25, -0.1, 1], "role": "digit" },
    { "name": "toeBackR", "parent": "ankleR", "at": [-0.026, 0.045, 0.0], "dir": [0, -0.05, -1], "role": "digit" }
  ],
  "parts": [
    {
      "id": "torso",
      "builds": "The red faceted ellipsoid body, a cream oval belly plate on the underside and chest, and a yellow triangle emblem seated on the breast. A blue half-disc rump patch sits at the lower back above the tail root. A black thin ring collar sits at the neck base [0,0.13,0.045], between body and head. A short yellow cylinder neck rises from the collar into the head. Add a black circle dot at the centre of the belly oval, and a row of three small cream squares down each flank under the wing root as Bauhaus trim. Everything is flat-coloured primitives (spheres, cylinders, extruded triangles, discs), 8 to 14 segments each. Wings, legs and tail attach to the body but are built by other parts. The body ellipsoid is about 0.055 half-width, 0.05 half-height and 0.075 half-length, centred at bodyCenter. It must leave room under it for the hips at y=0.085, and its lowest point stays above y=0.062.",
      "box": [[-0.056, 0.062, -0.075], [0.056, 0.15, 0.088]],
      "attaches": "Neck cylinder top meets the head part at mount neckBase and headCenter. The wing parts start at wingRootL and wingRootR on the flanks. The tail part starts at tailRoot behind the rump patch. The leg part's hips at hipL and hipR sit just inside the lower belly.",
      "joints": ["body", "chest", "neck"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "head",
      "builds": "The yellow faceted sphere head (radius about 0.036) centred on headCenter. Two big eyes at x=±0.027, y=0.172, z=0.08, each made of stacked flat discs facing outward and slightly forward: black outer disc, cream ring, black pupil and a small yellow dot. Each eye also has a thin black half-ring brow bar above it. Small red circular cheek discs sit below and behind each eye. The beak is two separate pieces: a red 4 to 6 sided cone for the upper beak from beakRoot [0,0.155,0.093] to a tip at z=0.118, and a smaller redDeep cone for the lower beak on the jaw joint, with a black thin line between them. A yellow-deep ring sits at the base of the beak and two tiny black nostril dots seat on the upper beak. A crest of three flat extruded triangles (red, blue, black, stacked and fanned slightly, with the tallest 0.03 high) leans back from the crown at crownTop. Add a small black circle on the forehead. Colours are flat; shapes stay low-poly. The head joint carries the head, the eyes and the upper beak, the jaw joint carries the lower beak, and the crest joint carries the three crest triangles.",
      "box": [[-0.04, 0.13, 0.03], [0.04, 0.2, 0.118]],
      "attaches": "The base sinks into the torso's yellow neck cylinder at neckBase / headCenter. The crest sits on the crown at crownTop. The beak starts at beakRoot.",
      "joints": ["head", "jaw", "crest"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "wings",
      "builds": "Two mirrored folded wings (left at +X, right at -X) that start at wingRootL and wingRootR and sweep back and slightly outward, about 15 degrees off the flank so they read as separate shapes. Each wing is a stack of flat extruded plates: a big blue half-disc or quarter-disc shoulder plate (thickness about 0.008), a blueDeep long blade extruded as a rounded rectangle for the flight feathers, running to the tip at wingTipL or wingTipR, a black bar across the middle, a cream stripe and a red triangle tip. Three flat feather blades of blue, blueDeep and black, fanned slightly, form the wing tip. A small yellow circle dot sits on the shoulder as an emblem. Outlines are bold and geometric, with each layer slightly offset outward so nothing is coplanar. Mirror with s=±1.",
      "box": [[-0.088, 0.09, -0.115], [0.088, 0.178, 0.06]],
      "attaches": "The wing roots sit on the flank surface of the torso at wingRootL and wingRootR. The wings don't touch the tail but overlap it slightly at z about -0.08.",
      "joints": ["wingL", "wingMidL", "wingTipL", "wingR", "wingMidR", "wingTipR"],
      "floor": false,
      "budget": 160
    },
    {
      "id": "tailLegs",
      "builds": "The tail and both legs with feet. The tail is three overlapping flat rectangular black blades fanned slightly, sloping from tailRoot [0,0.105,-0.06] to tip z=-0.13. A centre red stripe runs along the middle blade, with a yellow square at the tip and cream squares at the outer blade corners. It is built on the tail1 to tail3 joints. The legs are two thin black cylinders for the tarsus (radius about 0.004) from the hip at hipL/hipR down to the ankle, with a small redDeep feather-thigh sphere at the hip. Each foot has three forward toes and one back toe, which are thin black capsules (radius about 0.0035) wrapping over the branch top at y=0.04 (toe axes at y about 0.044). Each toe ends in a small cream cone claw. A tiny yellow sphere joint sits at each ankle. The toes rest on perchTop, with the left foot at x=+0.026 and the right at x=-0.026.",
      "box": [[-0.045, 0.04, -0.13], [0.045, 0.115, 0.04]],
      "attaches": "The tail root begins at tailRoot at the torso's rear. The thigh spheres seat in the belly at hipL and hipR. The toes touch the branch top at footL and footR (y=0.04).",
      "joints": ["tail1", "tail2", "tail3", "hipL", "ankleL", "toeInnerL", "toeOuterL", "toeBackL", "hipR", "ankleR", "toeInnerR", "toeOuterR", "toeBackR"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "branch",
      "builds": "The charcoal branch, a swept tube along X from x=-0.25 to +0.25 with 6 to 8 sides. Its radius is 0.02 at the centre, tapering to about 0.013 at both ends. Its axis rises gently from y=0.02 at x=0 to y about 0.045 at both ends, so the lowest point at x=0 touches y=0 and the perch top at x=0 is y=0.04. Cut-end discs in cream cap each end. Flat ring bands (short wider cylinders) alternate red, yellow and cream along the branch at about every 0.05 m, skipping the perch zone |x|<0.04 so the feet are on plain charcoal. A twig rises from twigUpBase [-0.15,0.04,0] up and slightly back to about y=0.17, ringed with a yellow band. It carries Bauhaus leaves: a flat blue square, a yellow disc and a red triangle, each extruded 0.004 thick, sized 0.03 to 0.04, with a black circle dot in the centre of the disc. Another twig from twigForwardBase [0.14,0.04,0] points forward to z about +0.1 and slightly up. It has one red disc and one blue triangle leaf at its tip and a cream band. Add a tiny red sphere bud at each twig tip, plus a short stub twig stub on the back at x=0.2. The branch is the only prop; there is no base or ground, and the leaves stay above the wing height range and away from the bird, at x beyond ±0.1.",
      "box": [[-0.25, 0, -0.04], [0.25, 0.19, 0.1]],
      "attaches": "The branch top at perchTop is the surface the feet touch. Everything here rides the root joint. Leaves and twigs stay clear of the bird's body and wings.",
      "joints": ["root"],
      "floor": true,
      "budget": 180
    }
  ]
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTorso({ b, J, P, M }: any) {
  const body = J.body, chest = J.chest, neck = J.neck;
  const C = M.bodyCenter as number[];

  // Body ellipsoid (faceted)
  b.part(new THREE.SphereGeometry(1, 12, 9), P.red, {
    bone: body, at: C, scale: [0.055, 0.05, 0.075], flat: true,
  });

  // Cream belly oval on underside/chest
  b.part(new THREE.SphereGeometry(1, 12, 8), P.cream, {
    bone: body, at: [0, C[1] - 0.026, C[2] + 0.014], scale: [0.04, 0.032, 0.06], flat: true,
  });

  // Black dot at centre of belly oval (facing outward-down-forward)
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.003, 10), P.black, {
    bone: body, at: [0, 0.0805, 0.02], dir: [0, -0.8, 0.45],
  });

  // Yellow triangle emblem on breast
  const tri = new THREE.Shape();
  tri.moveTo(-0.014, -0.012); tri.lineTo(0.014, -0.012); tri.lineTo(0, 0.016); tri.closePath();
  const triGeo = new THREE.ExtrudeGeometry(tri, { depth: 0.004, bevelEnabled: false });
  b.part(triGeo, P.yellow, {
    bone: chest, at: [0, 0.121, 0.0775], dir: [0, 0.25, 1], axis: "z",
  });

  // Blue half-disc rump patch above tail root
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.004, 12, 1, false, 0, Math.PI), P.blue, {
    bone: body, at: [0, 0.128, -0.066], dir: [0, 0.75, -0.65], rotation: undefined,
  });

  // Black collar ring at neck base
  b.part(new THREE.TorusGeometry(0.03, 0.0035, 5, 12), P.black, {
    bone: neck, at: M.neckBase, dir: [0, 0.6, 1], axis: "z",
  });

  // Short yellow neck cylinder
  b.part(new THREE.CylinderGeometry(0.027, 0.03, 0.04, 10), P.yellow, {
    bone: neck, at: [0, 0.147, 0.053], dir: [0, 0.6, 1],
  });

  // Flank trim: three cream squares per side under wing root
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const z = 0.03 - i * 0.026;
      const y = 0.104 - i * 0.002;
      // ellipsoid surface x at this height/z
      const nz = (z - C[2]) / 0.075, ny = (y - C[1]) / 0.05;
      const x = 0.055 * Math.sqrt(Math.max(0.05, 1 - nz * nz - ny * ny));
      b.part(new THREE.BoxGeometry(0.003, 0.012, 0.012), P.cream, {
        bone: body, at: [s * (x + 0.0004), y, z], dir: [s, 0, 0], axis: "x",
      });
    }
  }
}
```

<!-- call: wings -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildWings({ b, J, P, M }: Ctx) {
  const r = rng(5);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const root = M[s > 0 ? "wingRootL" : "wingRootR"];
    const wing = J["wing" + side];
    const mid = J["wingMid" + side];
    const tip = J["wingTip" + side];
    // local wing frame: origin at root, u runs back (-z) and outward, v up, thickness along x
    const base = new THREE.Vector3(root[0] + s * 0.004, root[1], root[2]);
    const back = new THREE.Vector3(s * 0.26, -0.05, -1).normalize();
    const upv = new THREE.Vector3(-s * 0.05, 1, 0).normalize();
    const thick = new THREE.Vector3().crossVectors(back, upv).normalize();
    const out = thick.dot(new THREE.Vector3(s, 0, 0)) > 0 ? 1 : -1;
    const at = (u: number, v: number, o: number) =>
      base.clone().addScaledVector(back, u).addScaledVector(upv, v).addScaledVector(thick, o * out);
    const plate = (pts: any[], color: string, o: number, th: number, bone: any, smoothing = 0) =>
      b.extrude(pts, {
        at: at(0, 0, o),
        x: back.toArray() as any,
        y: upv.toArray() as any,
        thickness: th,
        color,
        bone,
        smoothing,
      });
    // shoulder half-disc (flat edge along bottom... rounded on top)
    const half: any[] = [];
    for (let i = 0; i <= 6; i++) {
      const a = (Math.PI * i) / 6;
      half.push([0.035 - Math.cos(a) * 0.035, Math.sin(a) * 0.04 - 0.012]);
    }
    plate(half, P.blue, 0.0, 0.008, wing);
    // flight blade rounded rectangle
    plate(
      [
        [0.03, -0.028],
        [0.115, -0.022],
        [0.125, -0.008],
        [0.115, 0.012],
        [0.03, 0.02],
      ],
      P.blueDeep,
      0.006,
      0.006,
      mid,
      1,
    );
    // black bar
    plate(
      [
        [0.05, -0.03],
        [0.062, -0.03],
        [0.062, 0.022],
        [0.05, 0.022],
      ],
      P.black,
      0.011,
      0.004,
      mid,
    );
    // cream stripe
    plate(
      [
        [0.07, -0.03],
        [0.076, -0.03],
        [0.076, 0.02],
        [0.07, 0.02],
      ],
      P.cream,
      0.011,
      0.004,
      mid,
    );
    // red triangle tip
    plate(
      [
        [0.1, -0.026, "sharp"],
        [0.14, -0.012, "sharp"],
        [0.1, 0.012, "sharp"],
      ],
      P.red,
      0.011,
      0.004,
      tip,
    );
    // fanned feather blades at the tip
    const cols = [P.blue, P.blueDeep, P.black];
    cols.forEach((c, i) => {
      const a = (i - 1) * 0.18;
      const ca = Math.cos(a), sa = Math.sin(a);
      const o: [number, number][] = [
        [0, -0.008],
        [0.04, -0.008],
        [0.045, 0],
        [0.04, 0.008],
        [0, 0.008],
      ];
      const pts: any[] = o.map(([x, y]) => [x * ca - y * sa + 0.1, x * sa + y * ca - 0.012 - i * 0.003]);
      plate(pts, c, 0.002 - i * 0.0015, 0.004, tip);
    });
    // shoulder emblem dot
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 10), P.yellow, {
      bone: wing,
      at: at(0.035, 0.012, 0.0085),
      dir: thick.clone().multiplyScalar(out).toArray() as any,
    });
  }
}
```

<!-- call: tailLegs -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTailLegs({ b, J, P, M }: any) {
  const BLACK = P.black, RED = P.red, YEL = P.yellow, CREAM = P.cream, RD = P.redDeep;

  // ---- Tail: three overlapping flat blades, fanned slightly
  const tailJ = [J.tail1, J.tail2, J.tail3];
  const slope = -0.15;
  const blade = (yaw: number, len: number, w: number, color: string, lift: number, bone: any) => {
    const cz = -0.06 - len / 2;
    const x = Math.sin(yaw) * len * 0.5;
    const z = -0.06 - Math.cos(yaw) * len * 0.5;
    const y = 0.105 + slope * (0.06 + Math.abs(z + 0.06)) * 0.5 + lift;
    return b.part(new THREE.BoxGeometry(w, 0.004, len), color, {
      bone,
      at: [x, y, z],
      rotation: [(-slope * 180) / Math.PI * 0.6, (yaw * 180) / Math.PI, 0],
    });
  };
  blade(0.22, 0.07, 0.026, BLACK, -0.002, J.tail1);
  blade(-0.22, 0.07, 0.026, BLACK, -0.002, J.tail1);
  blade(0, 0.07, 0.03, BLACK, 0.001, J.tail2);
  // red centre stripe
  b.part(new THREE.BoxGeometry(0.008, 0.0016, 0.062), RED, { bone: J.tail2, at: [0, 0.1055 - 0.012 + 0.0095, -0.094] });
  // yellow tip square
  b.part(new THREE.BoxGeometry(0.014, 0.0022, 0.012), YEL, { bone: J.tail3, at: [0, 0.0915, -0.124] });
  // cream squares at outer blade corners
  for (const s of [1, -1]) {
    const yaw = 0.22 * s;
    const x = Math.sin(yaw) * 0.065;
    const z = -0.06 - Math.cos(yaw) * 0.065;
    b.part(new THREE.BoxGeometry(0.008, 0.0022, 0.008), CREAM, { bone: J.tail3, at: [x, 0.0975 - 0.009, z] });
  }
  // tail base cap sphere
  b.part(new THREE.SphereGeometry(0.01, 8, 6), BLACK, { bone: J.tail1, at: [0, 0.105, -0.06] });

  // ---- Legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = J["hip" + side], ankle = J["ankle" + side];
    const x = 0.026 * s;
    // thigh feather sphere
    b.part(new THREE.SphereGeometry(0.011, 8, 6), RD, { bone: hip, at: [x, 0.085, 0.005] });
    // tarsus
    b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.043, 7), BLACK, { bone: hip, at: [x, 0.0635, 0.003] });
    // ankle joint
    b.part(new THREE.SphereGeometry(0.0055, 7, 5), YEL, { bone: ankle, at: [x, 0.045, 0.004] });
    // toes
    const toes: [string, number, number][] = [
      ["toeInner" + side, -0.2 * s, 1],
      ["toeOuter" + side, 0.25 * s, 1],
      ["toeBack" + side, 0, -1],
    ];
    for (const [name, dx, dz] of toes) {
      const len = dz > 0 ? 0.03 : 0.02;
      const dir = new THREE.Vector3(dx * 0.4, 0, dz).normalize();
      const start = new THREE.Vector3(x, 0.044, 0.004);
      const end = start.clone().addScaledVector(dir, len);
      b.capsule(start.toArray(), end.toArray(), 0.0035, BLACK, { bone: J[name] });
      const tip = end.clone().addScaledVector(dir, 0.004);
      b.spike(end.toArray(), dir.toArray(), 0.01, 0.0032, { color: CREAM, bone: J[name] });
      void tip;
    }
  }
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  const hc = M.headCenter;
  const R = 0.036;
  const head = J.head, jaw = J.jaw, crest = J.crest;

  // skull
  b.part(new THREE.IcosahedronGeometry(R, 1), P.yellow, { bone: head, at: hc, flat: true });
  // yellow-deep neck ruff ring under head
  b.part(new THREE.CylinderGeometry(0.03, 0.026, 0.008, 10), P.yellowDeep, { bone: head, at: [0, 0.135, 0.058] });

  // disc helper: faces direction d, axis z
  const disc = (r: number, color: string, at: number[], d: number[], bone: any, seg = 12, t = 0.0015) =>
    b.part(new THREE.CylinderGeometry(r, r, t, seg), color, { bone, at, dir: d, axis: "y" });

  for (const s of [1, -1]) {
    const n = [s * 0.85, 0.15, 0.5];
    const ep = (k: number) => [s * (0.0265 + n[0] * k * 0.0), 0.172, 0.0795].map((v, i) => v + n[i] * k * 0.0) as number[];
    const base = [s * 0.0285, 0.172, 0.0775];
    const off = (k: number) => [base[0] + s * k * 0.85, base[1] + k * 0.15, base[2] + k * 0.5];
    void ep;
    disc(0.0125, P.black, off(0.0), n, head);
    disc(0.0095, P.cream, off(0.0012), n, head);
    disc(0.0058, P.black, off(0.0024), n, head, 10);
    disc(0.0022, P.yellow, off(0.0036), n, head, 8);
    // brow half ring
    b.part(new THREE.TorusGeometry(0.011, 0.0016, 4, 8, Math.PI), P.black, {
      bone: head, at: [s * 0.0285, 0.1855, 0.0775], dir: n, axis: "z",
    });
    // cheek disc
    disc(0.0085, P.red, [s * 0.0335, 0.1555, 0.0685], [s * 0.9, -0.1, 0.35], head, 10, 0.002);
  }

  // forehead dot
  disc(0.005, P.black, [0, 0.1935, 0.0735], [0, 0.55, 0.85], head, 10, 0.0015);

  // beak upper
  b.part(new THREE.ConeGeometry(0.0125, 0.027, 5), P.red, {
    bone: head, at: [0, 0.1585, 0.1045], dir: [0, 0, 1], flat: true,
  });
  // base ring
  b.part(new THREE.CylinderGeometry(0.0138, 0.0145, 0.004, 8), P.yellowDeep, {
    bone: head, at: [0, 0.155, 0.0925], dir: [0, 0, 1],
  });
  // nostrils
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.0017, 5, 4), P.black, { bone: head, at: [s * 0.0045, 0.1635, 0.101] });

  // lower beak on jaw
  b.part(new THREE.ConeGeometry(0.0095, 0.022, 5), P.redDeep, {
    bone: jaw, at: [0, 0.1495, 0.0975], dir: [0, 0, 1], flat: true,
  });
  // dividing line
  b.part(new THREE.BoxGeometry(0.019, 0.0013, 0.02), P.black, { bone: jaw, at: [0, 0.1527, 0.1], flat: true });

  // crest triangles, extruded in y-z profile, leaning back
  const cols = [P.red, P.blue, P.black];
  const hs = [0.03, 0.025, 0.02];
  cols.forEach((c, i) => {
    const h = hs[i];
    const tri: [number, number][] = [[0, 0], [0.022, 0], [-0.004 - i * 0.003, h]];
    b.extrude(tri, {
      at: [0.0 + (i - 1) * 0.0045, 0.194, 0.04 + i * 0.003],
      x: [0, 0, -1], y: [0, 1, 0],
      thickness: 0.0035, color: c, bone: crest,
    });
  });
  void frame; void rng;
}
```

<!-- call: branch -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildBranch({ b, J, P, M }: Ctx) {
  const root = J.root;
  const R = rng(5);
  const CH = P.charcoal;

  // axis height and radius along x
  const ay = (x: number) => 0.02 + 0.025 * Math.pow(Math.abs(x) / 0.25, 2);
  const rad = (x: number) => 0.02 - 0.007 * Math.pow(Math.abs(x) / 0.25, 1.5);

  const pts: number[][] = [];
  for (let i = 0; i <= 10; i++) {
    const x = -0.25 + 0.05 * i;
    pts.push([x, ay(x), 0]);
  }
  b.sweep(pts, (t: number) => rad(-0.25 + 0.5 * t), {
    color: CH,
    sides: 8,
    bone: root,
    caps: "flat",
    skin: "rigid",
  });

  const cyl = (r: number, h: number, seg: number) => new THREE.CylinderGeometry(r, r, h, seg);
  const side = [0, 0, 1]; // not used for orientation of tube-aligned discs
  void side;

  // end discs, cream
  for (const s of [1, -1]) {
    const x = s * 0.2505;
    b.part(cyl(rad(x) * 1.02, 0.004, 8), P.cream, { bone: root, at: [x, ay(x), 0], dir: [1, 0, 0] });
  }

  // ring bands
  const cols = [P.red, P.yellow, P.cream];
  let k = 0;
  for (let x = -0.225; x <= 0.226; x += 0.05) {
    if (Math.abs(x) < 0.05) continue;
    const xx = Math.round(x * 1000) / 1000;
    const slope = (ay(xx + 0.01) - ay(xx - 0.01)) / 0.02;
    b.part(cyl(rad(xx) * 1.14, 0.009, 8), cols[k++ % 3], {
      bone: root,
      at: [xx, ay(xx), 0],
      dir: [1, slope, 0],
    });
  }

  // generic twig with band and bud
  const twig = (base: number[], tip: number[], r: number, band: string) => {
    b.rod(base, tip, [r, r * 0.6], CH, { bone: root, sides: 6 } as any);
    const m = [0, 1, 2].map((i) => base[i] + (tip[i] - base[i]) * 0.35);
    const d = tip.map((v, i) => v - base[i]);
    b.part(cyl(r * 1.5, 0.007, 6), band, { bone: root, at: m, dir: d });
    b.part(new THREE.SphereGeometry(0.007, 6, 4), P.red, { bone: root, at: tip });
  };

  // leaf helpers (flat shapes facing +Z)
  const leafShape = (outline: [number, number][], color: string, at: number[], rot = 0) => {
    b.extrude(outline, {
      at,
      x: [Math.cos(rot), Math.sin(rot), 0],
      y: [-Math.sin(rot), Math.cos(rot), 0],
      thickness: 0.004,
      color,
      bone: root,
    });
  };
  const sq = (s: number): [number, number][] => [[-s / 2, -s / 2], [s / 2, -s / 2], [s / 2, s / 2], [-s / 2, s / 2]];
  const tri = (s: number): [number, number][] => [[-s / 2, -s / 2], [s / 2, -s / 2], [0, s / 2]];
  const disc = (r: number): [number, number][] =>
    Array.from({ length: 10 }, (_, i) => [r * Math.cos((i / 10) * Math.PI * 2), r * Math.sin((i / 10) * Math.PI * 2)]);

  // rising twig at x=-0.15
  const up0 = [-0.15, 0.04, 0];
  const up1 = [-0.16, 0.17, -0.02];
  twig([-0.15, 0.03, 0], up1, 0.006, P.yellow);
  // side stub twigs carrying leaves
  b.rod([-0.153, 0.1, -0.008], [-0.19, 0.13, -0.008], [0.004, 0.003], CH, { bone: root, sides: 6 } as any);
  b.rod([-0.157, 0.13, -0.014], [-0.125, 0.155, -0.014], [0.004, 0.003], CH, { bone: root, sides: 6 } as any);
  leafShape(sq(0.036), P.blue, [-0.2, 0.14, -0.008], 0.3);
  leafShape(disc(0.019), P.yellow, [-0.112, 0.162, -0.014]);
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.002, 8), P.black, {
    bone: root,
    at: [-0.112, 0.162, -0.0115],
    dir: [0, 0, 1],
  });
  leafShape(tri(0.036), P.red, [-0.165, 0.185, -0.025], -0.2);
  void up0;

  // forward twig at x=0.14
  const f1 = [0.14, 0.06, 0.1];
  twig([0.14, 0.035, 0.005], f1, 0.006, P.cream);
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.004, 10), P.red, { bone: root, at: [0.14, 0.075, 0.108], dir: [0, 0, 1] });
  leafShape(tri(0.034), P.blue, [0.165, 0.075, 0.098], 0.2);

  // back stub at x=0.2
  b.rod([0.2, 0.05, -0.005], [0.2, 0.075, -0.04], [0.005, 0.003], CH, { bone: root, sides: 6 } as any);
  b.part(new THREE.SphereGeometry(0.006, 6, 4), P.red, { bone: root, at: [0.2, 0.076, -0.042] });
  void R;
  void frame;
}
```