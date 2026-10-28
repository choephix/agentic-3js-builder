<!-- call: plan -->

```json
{
  "name": "Bauhaus Songbird on a Branch",
  "description": "A stylized songbird made of circles, triangles and rectangles in red, yellow, blue, black and cream, perched on a straight wooden branch with a few geometric leaves.",
  "builderName": "bauhausSongbird",
  "size": [0.34, 0.3, 0.5],
  "layout": "Branch: a thin rod running along X at y 0.02-0.05, resting on the floor with a small wooden base block at each end. The bird perches on top, facing +Z, with its feet gripping the branch at x=0. Body is a big blue sphere-like egg (tilted slightly up at the front), cream circular belly disc on the front, a red round head with a big yellow circle eye ringed in black, and a yellow triangular beak split into upper and lower jaw. Wings are flat extruded red triangles/quarter circles on each side, with black and cream stripe bars. Tail is a long flat black rectangle with a yellow tip, angled back and down. Legs are thin black rods with three forward toes and one rear toe, each wrapped around the branch. Every part is flat primary colour with cream, black and white details. Geometry is blocky, with hard primitive shapes (cones, boxes, discs) and a few circle and triangle emblems.",
  "palette": {
    "red": "#d62d20",
    "yellow": "#f6c500",
    "blue": "#1f4fb4",
    "black": "#151515",
    "cream": "#f2e8d0",
    "wood": "#8a5a32",
    "woodDark": "#5e3b20",
    "leaf": "#2f8f4e",
    "white": "#ffffff"
  },
  "mounts": {
    "branchTop": [0, 0.05, 0],
    "perch": [0, 0.15, 0],
    "neckBase": [0, 0.2, 0.06],
    "headCenter": [0, 0.26, 0.1],
    "beakBase": [0, 0.255, 0.16],
    "wingRoot": [0.08, 0.2, -0.01],
    "tailRoot": [0, 0.17, -0.1]
  },
  "joints": [
    { "name": "body", "at": [0, 0.19, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "neck", "parent": "body", "at": [0, 0.2, 0.06], "dir": [0, 0.5, 1], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 0.26, 0.1], "dir": [0, 0, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 0.25, 0.15], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "wingL", "parent": "body", "at": [0.08, 0.2, -0.01], "dir": [1, 0, -0.3], "role": "wing" },
    { "name": "wingR", "parent": "body", "at": [-0.08, 0.2, -0.01], "dir": [-1, 0, -0.3], "role": "wing" },
    { "name": "tail1", "parent": "body", "at": [0, 0.17, -0.1], "dir": [0, -0.2, -1], "role": "tail" },
    { "name": "legL", "parent": "body", "at": [0.03, 0.14, 0], "dir": [0, -1, 0], "role": "leg" },
    { "name": "legR", "parent": "body", "at": [-0.03, 0.14, 0], "dir": [0, -1, 0], "role": "leg" }
  ],
  "parts": [
    {
      "id": "branch",
      "builds": "The wooden branch: a long 8-sided rod along X (wood) with darker ring knots, two short side twigs ending in cut ends, one dark wood base block under each end resting on the floor, and three flat geometric leaves (green triangles and a circle disc) on the twigs, plus a small red circle berry on one twig.",
      "box": [[-0.17, 0, -0.06], [0.17, 0.14, 0.08]],
      "attaches": "Top surface at mount branchTop; the bird's feet grip it at x=0.",
      "joints": [],
      "floor": true,
      "budget": 120
    },
    {
      "id": "bodyAndLegs",
      "builds": "Blue egg-shaped body (stretched sphere, faceted) tilted up at front, a cream circular belly disc seated on the front-lower surface with a thin black ring outline, a yellow triangle emblem on the chest, a black collar stripe band near the neck, a rump of red cap. Plus legs: black thin rods from hips to branchTop, each with an ankle knob, three forward toes and one rear toe wrapped over the branch, tiny yellow claw tips.",
      "box": [[-0.07, 0.05, -0.1], [0.07, 0.25, 0.1]],
      "attaches": "Legs end at branchTop at x=+-0.03; body meets the neck at neckBase, the wings at wingRoot and the tail at tailRoot.",
      "joints": ["body", "legL", "legR"],
      "floor": false,
      "budget": 180
    },
    {
      "id": "headAndBeak",
      "builds": "Red round head (faceted sphere) on a short blue neck, large yellow disc eyes with black ring and pupil and white highlight on both sides facing forward-out, black eyebrow bars angled, a yellow triangular beak as separate upper cone/wedge and lower smaller wedge on the jaw joint, with a black line between, a blue triangle crest of 3 flat blades on top, a cream cheek circle behind each eye.",
      "box": [[-0.06, 0.2, 0.04], [0.06, 0.3, 0.2]],
      "attaches": "Neck base at neckBase on the body, centred on headCenter; beak at beakBase.",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "wingsAndTail",
      "builds": "Two mirrored wings: flat extruded red quarter-circle/triangle slabs with stacked feather bars in yellow, black and cream along the trailing edge, a blue circle emblem at the shoulder; separated and slightly spread. Tail of three long flat feather rectangles fanned (black, blue, black) with yellow tip squares and a red base block, angled back and slightly down.",
      "box": [[-0.17, 0.1, -0.25], [0.17, 0.25, 0.0]],
      "attaches": "Wings root at wingRoot (+-x) on the body joint wingL/wingR; tail at tailRoot on tail1.",
      "joints": ["wingL", "wingR", "tail1"],
      "floor": false,
      "budget": 190
    }
  ]
}
```

<!-- call: wingsAndTail -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildWingsAndTail({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const feathers = ["#f6c500", "#151515", "#f2e8d0"];

  for (const s of [1, -1]) {
    const bone = s > 0 ? J.wingL : J.wingR;
    const root = M.wingRoot;
    const ox = s * (root[0] + 0.012);
    const oy = root[1];
    const oz = root[2];
    // Wing slab: outline drawn in (back, up) and pushed sideways.
    const outline: [number, number, string?][] = [
      [0, 0.04, "sharp"],
      [-0.03, 0.055],
      [-0.1, 0.02, "sharp"],
      [-0.2, -0.05, "sharp"],
      [-0.12, -0.075],
      [-0.03, -0.06],
      [0, -0.03, "sharp"],
    ];
    const pts = outline.map((p) => [p[0], p[1]] as [number, number]);
    const wing = b.extrude(pts, {
      at: [ox, oy, oz],
      x: [s * 0.3, 0, -1],
      y: [0, 1, 0],
      thickness: 0.012,
      color: P.red,
      bone,
    });
    // Feather bars along trailing edge
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const bx = ox + s * (0.012 + t * 0.06);
      const bz = oz - 0.06 - t * 0.12;
      const by = oy - 0.02 - t * 0.045;
      b.part(new THREE.BoxGeometry(0.018, 0.012, 0.045), feathers[i % 3], {
        at: [bx + s * 0.003, by, bz],
        bone,
        rotation: [0, s * -18, 0],
      });
    }
    // Black outline stripe on top edge
    b.part(new THREE.BoxGeometry(0.006, 0.006, 0.12), P.black, {
      at: [ox + s * 0.026, oy + 0.045, oz - 0.06],
      bone,
      rotation: [0, s * -17, 0],
    });
    // Blue circle emblem at shoulder, with cream centre
    const emb = [ox + s * 0.01, oy + 0.005, oz - 0.03] as [number, number, number];
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.006, 14), P.blue, {
      at: [emb[0] + s * 0.007, emb[1], emb[2]],
      dir: [s, 0, 0],
      bone,
    });
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.006, 10), P.cream, {
      at: [emb[0] + s * 0.011, emb[1], emb[2]],
      dir: [s, 0, 0],
      bone,
    });
    void wing;
  }

  // Tail
  const tr = M.tailRoot;
  const bone = J.tail1;
  const dirs = [
    { yaw: 16, c: P.black },
    { yaw: 0, c: P.blue },
    { yaw: -16, c: P.black },
  ];
  b.part(new THREE.BoxGeometry(0.05, 0.026, 0.03), P.red, {
    at: [tr[0], tr[1], tr[2] - 0.012],
    bone,
    rotation: [-8, 0, 0],
  });
  for (const d of dirs) {
    const a = (d.yaw * Math.PI) / 180;
    const L = 0.14;
    const cx = tr[0] + Math.sin(a) * (L / 2 + 0.02) * -1;
    const cz = tr[2] - 0.02 - Math.cos(a) * (L / 2);
    const cy = tr[1] - 0.012 - (d.yaw === 0 ? 0.012 : 0.008);
    const w = d.yaw === 0 ? 0.034 : 0.028;
    b.part(new THREE.BoxGeometry(w, 0.008, L), d.c, {
      at: [cx, cy, cz],
      bone,
      rotation: [-10, d.yaw, 0],
    });
    // yellow tip square
    const ex = tr[0] + Math.sin(a) * -(L + 0.03);
    const ez = tr[2] - 0.02 - Math.cos(a) * (L - 0.01);
    b.part(new THREE.BoxGeometry(w, 0.009, 0.03), P.yellow, {
      at: [ex, cy - 0.022, ez - 0.006],
      bone,
      rotation: [-10, d.yaw, 0],
    });
    // cream stripe bar
    b.part(new THREE.BoxGeometry(w * 0.9, 0.009, 0.01), P.cream, {
      at: [cx * 0.9 + tr[0] * 0.1, cy + 0.001, cz + 0.03],
      bone,
      rotation: [-10, d.yaw, 0],
    });
  }
  void frame;
  void R;
}
```

<!-- call: bodyAndLegs -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildBodyAndLegs({ b, J, P, M }: any) {
  const BLUE = P.blue, CREAM = P.cream, BLACK = P.black, YEL = P.yellow, RED = P.red;
  const body = J.body;

  // Egg body: faceted stretched sphere, tilted up at front
  const tilt = -0.18; // rotation about X (front up)
  const eggC: [number, number, number] = [0, 0.175, 0];
  b.part(new THREE.SphereGeometry(1, 12, 9), BLUE, {
    bone: body, at: eggC, scale: [0.066, 0.068, 0.092], rotation: [tilt * 57.3, 0, 0], flat: true,
  });

  // Red rump cap at the back
  b.part(new THREE.SphereGeometry(1, 10, 7, 0, Math.PI * 2, 0, Math.PI / 2), RED, {
    bone: body, at: [0, 0.172, -0.062], dir: [0, 0.25, -1], scale: [0.05, 0.03, 0.05], flat: true,
  });

  // Cream belly disc on front-lower surface with black ring outline
  const bellyDir: [number, number, number] = [0, -0.35, 1];
  const bellyAt: [number, number, number] = [0, 0.15, 0.052];
  b.part(new THREE.CylinderGeometry(0.047, 0.047, 0.006, 20), BLACK, {
    bone: body, at: [0, 0.149, 0.0505], dir: bellyDir, axis: "y",
  });
  b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.008, 20), CREAM, {
    bone: body, at: [0, 0.1495, 0.0525], dir: bellyDir,
  });
  // inner cream/black accent ring
  b.part(new THREE.TorusGeometry(0.03, 0.002, 4, 18), BLACK, {
    bone: body, at: [0, 0.1505, 0.0565], dir: bellyDir, axis: "z",
  });

  // Yellow triangle emblem on chest
  const tri = b.extrude([[-0.014, -0.012], [0.014, -0.012], [0, 0.016]], {
    at: [0, 0.207, 0.056], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.004, color: YEL, bone: body,
  });
  void tri;

  // Black collar band near the neck
  b.part(new THREE.CylinderGeometry(0.046, 0.05, 0.012, 12, 1, true), BLACK, {
    bone: body, at: [0, 0.222, 0.036], dir: [0, 0.5, 1], flat: true,
  });
  b.part(new THREE.TorusGeometry(0.047, 0.005, 4, 14), BLACK, {
    bone: body, at: [0, 0.221, 0.036], dir: [0, 0.5, 1], axis: "z",
  });

  // Legs
  const top = M.branchTop;
  for (const s of [1, -1]) {
    const hip: [number, number, number] = [s * 0.03, 0.125, 0.0];
    const ankle: [number, number, number] = [s * 0.03, top[1] + 0.022, 0.0];
    const leg = s > 0 ? J.legL : J.legR;
    b.rod(hip, ankle, 0.0045, BLACK, { bone: leg, sides: 6 });
    // thigh feather puff
    b.part(new THREE.SphereGeometry(0.014, 6, 4), BLUE, { bone: leg, at: [s * 0.03, 0.13, 0], flat: true });
    // ankle knob
    b.part(new THREE.SphereGeometry(0.0085, 6, 5), BLACK, { bone: leg, at: ankle, flat: true });
    // three forward toes curling over branch
    const spread = [-0.012, 0, 0.012];
    for (const dx of spread) {
      const tip: [number, number, number] = [s * 0.03 + dx, top[1] + 0.004, 0.036];
      const mid: [number, number, number] = [s * 0.03 + dx * 0.6, top[1] + 0.016, 0.02];
      b.rod(ankle, mid, 0.0034, BLACK, { bone: leg, sides: 5 });
      b.rod(mid, tip, 0.003, BLACK, { bone: leg, sides: 5 });
      b.spike(tip, [0, -0.4, 1], 0.009, 0.003, { bone: leg, color: YEL, sides: 5 });
    }
    // rear toe
    const rmid: [number, number, number] = [s * 0.03, top[1] + 0.016, -0.016];
    const rtip: [number, number, number] = [s * 0.03, top[1] + 0.004, -0.032];
    b.rod(ankle, rmid, 0.0034, BLACK, { bone: leg, sides: 5 });
    b.rod(rmid, rtip, 0.003, BLACK, { bone: leg, sides: 5 });
    b.spike(rtip, [0, -0.4, -1], 0.009, 0.003, { bone: leg, color: YEL, sides: 5 });
  }
}
```

<!-- call: headAndBeak -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHeadAndBeak({ b, J, P, M }: Ctx) {
  const HC = M.headCenter;
  const hc = (x: number, y: number, z: number): [number, number, number] => [HC[0] + x, HC[1] + y, HC[2] + z];

  // neck: short blue frustum on the neck joint
  b.part(new THREE.CylinderGeometry(0.03, 0.038, 0.07, 8), P.blue, {
    bone: J.neck,
    at: [0, 0.225, 0.08],
    dir: [0, 0.5, 1],
  });
  // black collar ring at neck base
  b.part(new THREE.TorusGeometry(0.036, 0.004, 4, 10), P.black, {
    bone: J.neck,
    at: [0, 0.205, 0.068],
    dir: [0, 0.5, 1],
    axis: "z",
  });

  // head: faceted red sphere
  b.part(new THREE.SphereGeometry(0.05, 10, 8), P.red, { bone: J.head, at: HC, flat: true });

  // cheeks + eyes on each side
  for (const s of [1, -1]) {
    const out: [number, number, number] = [s * 0.8, 0.1, 0.6];
    // cream cheek circle behind eye
    b.part(new THREE.CylinderGeometry(0.017, 0.017, 0.006, 12), P.cream, {
      bone: J.head,
      at: hc(s * 0.044, -0.012, -0.012),
      dir: [s, 0, -0.1],
    });
    // eye layers: black ring, yellow disc, pupil, highlight
    const e = hc(s * 0.037, 0.013, 0.027);
    const d: [number, number, number] = [s * 0.75, 0.1, 0.65];
    b.part(new THREE.CylinderGeometry(0.0205, 0.0205, 0.006, 14), P.black, { bone: J.head, at: e, dir: d });
    b.part(new THREE.CylinderGeometry(0.0165, 0.0165, 0.008, 14), P.yellow, {
      bone: J.head,
      at: hc(s * 0.0385, 0.0135, 0.0285),
      dir: d,
    });
    b.part(new THREE.CylinderGeometry(0.0075, 0.0075, 0.01, 10), P.black, {
      bone: J.head,
      at: hc(s * 0.0405, 0.0145, 0.0305),
      dir: d,
    });
    b.part(new THREE.SphereGeometry(0.0028, 5, 4), P.white, {
      bone: J.head,
      at: hc(s * 0.0435, 0.019, 0.034),
    });
    // angled eyebrow bar
    b.part(new THREE.BoxGeometry(0.03, 0.006, 0.007), P.black, {
      bone: J.head,
      at: hc(s * 0.03, 0.04, 0.03),
      rotation: [0, s * 35, s * -22],
    });
  }

  // crest: three flat blue triangle blades
  const blade: [number, number][] = [
    [-0.012, 0],
    [0.012, 0],
    [0, 0.04],
  ];
  const tilts = [-18, 0, 18];
  const heights = [0.03, 0.042, 0.03];
  tilts.forEach((t, i) => {
    const k = heights[i] / 0.04;
    const sh = blade.map(([x, y]) => [x * 1, y * k] as [number, number]);
    b.extrude(sh, {
      at: hc(0, 0.044, -0.012 - i * 0.0 + (i === 1 ? 0.006 : 0)),
      x: [Math.cos((t * Math.PI) / 180), 0, 0],
      y: [Math.sin((t * Math.PI) / 180) * 0 + 0, 1, -Math.sin((t * Math.PI) / 180) * 0.6],
      thickness: 0.006,
      color: P.blue,
      bone: J.head,
    });
  });
  // yellow tips on crest
  b.part(new THREE.SphereGeometry(0.004, 5, 4), P.yellow, { bone: J.head, at: hc(0, 0.088, -0.006) });

  // beak: upper cone wedge (4-sided pyramid) on head
  const bk = M.beakBase;
  b.part(new THREE.ConeGeometry(0.02, 0.05, 4), P.yellow, {
    bone: J.head,
    at: [bk[0], bk[1] + 0.003, bk[2] + 0.022],
    dir: [0, 0, 1],
    rotation: undefined,
  });
  // lower jaw wedge on jaw joint
  b.part(new THREE.ConeGeometry(0.015, 0.036, 4), P.yellow, {
    bone: J.jaw,
    at: [bk[0], bk[1] - 0.011, bk[2] + 0.017],
    dir: [0, 0, 1],
  });
  // black line between the mandibles
  b.part(new THREE.BoxGeometry(0.003, 0.0025, 0.04), P.black, {
    bone: J.jaw,
    at: [bk[0], bk[1] - 0.004, bk[2] + 0.02],
  });
  // nostrils
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.0025, 4, 3), P.black, {
      bone: J.head,
      at: [s * 0.009, bk[1] + 0.011, bk[2] + 0.012],
    });
}
```

<!-- call: branch -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildBranch({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const WOOD = P.wood, DARK = P.woodDark, LEAF = P.leaf, RED = P.red, CREAM = P.cream;
  const Y = 0.035; // branch axis height; top surface at 0.05 => radius 0.015 (8-sided: flat faces at r)
  const R = 0.015;

  // Main branch rod along X (flat faces sit exactly at R)
  b.sweep([[-0.15, Y, 0], [0.15, Y, 0]], R, { color: WOOD, sides: 8, caps: "flat" });
  // Slight taper ends: cut-end discs
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(R * 0.8, R * 0.8, 0.004, 8), DARK, { at: [s * 0.1515, Y, 0], dir: [s, 0, 0] });
  }

  // Base blocks resting on the floor, under each end
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.05, 0.02, 0.05), DARK, { at: [s * 0.13, 0.01, 0] });
    b.part(new THREE.BoxGeometry(0.056, 0.004, 0.056), WOOD, { at: [s * 0.13, 0.02, 0] });
    // saddle notch block that cradles the branch
    b.part(new THREE.BoxGeometry(0.03, 0.008, 0.03), DARK, { at: [s * 0.13, 0.024, 0] });
  }

  // Dark ring knots
  for (const x of [-0.1, -0.05, 0.06, 0.1, 0.0]) {
    if (Math.abs(x) < 0.001) continue;
    b.part(new THREE.CylinderGeometry(R + 0.003, R + 0.003, 0.006, 8), DARK, { at: [x, Y, 0], dir: [1, 0, 0] });
  }
  // a bump knot
  b.part(new THREE.SphereGeometry(0.008, 6, 4), DARK, { at: [-0.075, Y + 0.012, 0.008] });

  // Twigs
  const twigs = [
    { base: [-0.09, Y, 0.005], tip: [-0.12, 0.085, 0.05] },
    { base: [0.085, Y, -0.005], tip: [0.12, 0.08, -0.045] },
  ];
  for (const t of twigs) {
    b.rod(t.base, t.tip, [0.009, 0.006], WOOD, { sides: 6, caps: "flat" });
    const d = new THREE.Vector3(...t.tip).sub(new THREE.Vector3(...t.base)).normalize();
    b.part(new THREE.CylinderGeometry(0.0062, 0.0062, 0.003, 6), DARK, { at: t.tip, dir: [d.x, d.y, d.z] });
  }

  // Leaves: flat extruded shapes
  const tri = [[0, 0], [0.028, 0.012], [0, 0.05], [-0.028, 0.012]] as [number, number][];
  const triSimple = [[-0.022, 0], [0.022, 0], [0, 0.05]] as [number, number][];
  // leaf 1 on twig 1 (triangle)
  b.extrude(triSimple, { at: [-0.12, 0.085, 0.05], x: [1, 0, 0], y: [-0.4, 0.8, 0.45], thickness: 0.004, color: LEAF });
  b.extrude([[-0.003, 0.002], [0.003, 0.002], [0, 0.04]], { at: [-0.12, 0.088, 0.052], x: [1, 0, 0], y: [-0.4, 0.8, 0.45], thickness: 0.006, color: P.leaf === LEAF ? "#1f6a38" : LEAF });
  // leaf 2 on twig 2 (diamond)
  b.extrude(tri, { at: [0.12, 0.08, -0.045], x: [1, 0, 0], y: [0.4, 0.8, -0.45], thickness: 0.004, color: LEAF });
  // leaf 3: circle disc on twig 1 lower
  const mid = [-0.105, 0.06, 0.03];
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.004, 12), LEAF, { at: [-0.1, 0.068, 0.066], dir: [0.2, 0.9, 0.3] });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.0045, 8), "#1f6a38", { at: [-0.1, 0.0682, 0.0662], dir: [0.2, 0.9, 0.3] });
  b.rod(mid, [-0.1, 0.068, 0.066], 0.003, DARK, { sides: 5 });

  // Red berry on twig 2 with cream highlight
  const bp = [0.105, 0.062, -0.03];
  b.rod([0.095, 0.05, -0.012], bp, 0.0035, DARK, { sides: 5 });
  b.part(new THREE.SphereGeometry(0.01, 8, 6), RED, { at: [0.105, 0.07, -0.03] });
  b.part(new THREE.SphereGeometry(0.0025, 5, 4), CREAM, { at: [0.108, 0.075, -0.024] });

  // Tiny bark grooves
  for (let i = 0; i < 6; i++) {
    const x = -0.12 + r() * 0.24;
    if (Math.abs(x) < 0.02) continue;
    b.part(new THREE.BoxGeometry(0.02, 0.0015, 0.004), DARK, { at: [x, Y + R * 0.98, (r() - 0.5) * 0.01] });
  }
}
```