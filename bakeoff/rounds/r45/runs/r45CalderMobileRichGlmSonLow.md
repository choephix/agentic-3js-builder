<!-- call: plan -->

```json
{
  "name": "Calder Standing Mobile",
  "description": "A Calder-style standing mobile: a black pedestal and curving stem carry a crown of sweeping wire arms from which three tiers of flat red, orange, yellow, white and black sheet-metal shapes hang in balanced suspension.",
  "builderName": "calderMobile",
  "size": [2.1, 2.2, 1.0],
  "layout": "Front view (+Z): a low black pedestal disc sits on the floor at the origin; a slightly S-curved black stem rises 2.0 m to mount mastTop. From mastTop the wire crown sweeps one arm out left-forward to hookL [0.55, 1.94, 0.2] and one arm right-back to hookR [-0.5, 1.8, -0.1], with a short central branch bearing a small yellow triangle finial at the very top (~2.14). From each hook a thin vertical wire drop hangs the upper tier (canopy): on the left a big black leaf and a red petal, on the right a big white fan and a small orange disc; the drops continue down to pivotA (right-forward) and pivotB (left-back). The middle tier (midSwags) hangs from those pivots: an orange leaf forward-right and a black triangle behind it, a yellow half-moon and a small red disc to the left-back; the drops continue to pivotC and pivotD. The bottom tier (finials) hangs lowest: a large black blob-leaf on a balance arm with a solid counterweight sphere and a white disc at right-forward, and the model's boldest accent — a big red petal — with a yellow triangle and a single small cerulean disc at left-back. Lowest shape edges hover ~0.23 m above the floor; only the pedestal touches y = 0. Style on every part: nothing straight — every wire is one confident sweeping catmull curve in near-black; every shape is a flat cutout with visible 2-3 cm thickness so it reads as painted sheet metal seen both face-on and edge-on; hard-edged matte colours, asymmetric balance (heavy black mass left, bold red note right), black calligraphy lines holding coloured notes in the air.",
  "palette": {
    "wire": "#17171a",
    "sheetBlack": "#232327",
    "pedestal": "#26262b",
    "white": "#f5efe3",
    "red": "#d63a2b",
    "orange": "#e9742e",
    "yellow": "#f3b71f",
    "cerulean": "#2f6fb2"
  },
  "mounts": {
    "mastTop": [0, 2.0, 0],
    "hookL": [0.55, 1.94, 0.2],
    "hookR": [-0.5, 1.8, -0.1],
    "pivotA": [0.85, 1.45, 0.3],
    "pivotB": [-0.8, 1.25, -0.05],
    "pivotC": [0.55, 0.85, 0.15],
    "pivotD": [-0.45, 0.7, -0.1]
  },
  "joints": [
    { "name": "stem", "at": [0, 0.16, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "pivotL", "parent": "stem", "at": [0.55, 1.94, 0.2], "dir": [0, -1, 0], "role": "hinge" },
    { "name": "pivotR", "parent": "stem", "at": [-0.5, 1.8, -0.1], "dir": [0, -1, 0], "role": "hinge" },
    { "name": "pivotA", "parent": "pivotL", "at": [0.85, 1.45, 0.3], "dir": [0, -1, 0], "role": "hinge" },
    { "name": "pivotB", "parent": "pivotR", "at": [-0.8, 1.25, -0.05], "dir": [0, -1, 0], "role": "hinge" },
    { "name": "pivotC", "parent": "pivotA", "at": [0.55, 0.85, 0.15], "dir": [0, -1, 0], "role": "hinge" },
    { "name": "pivotD", "parent": "pivotB", "at": [-0.45, 0.7, -0.1], "dir": [0, -1, 0], "role": "hinge" }
  ],
  "parts": [
    {
      "id": "pedestal",
      "builds": "The floor-standing base and stem, everything below mastTop [0, 2.0, 0]. The foot: b.lathe a low disc profile r 0.42, height 0.07, with a rounded lip and a shallow dome top, colour pedestal, resting on y = 0; on its top a small raised collar disc r 0.16, h 0.05, same colour, carrying a thin 2 mm white inlay ring (colour white) around its rim. The stem: b.sweep along catmull [[0,0.12,0],[0.025,0.7,0],[-0.02,1.35,0.02],[0,2.0,0]], radius [0.024, 0.015], colour wire — a gentle S-curve, never straight. A small side twig near the base: b.rod from the stem at [0.03, 0.5, 0.0] to [0.2, 0.52, 0.05], r 0.008, colour wire, carrying one tiny white oval leaf (b.extrude outline ~0.10 x 0.16, smoothing 2, thickness 0.02, colour white, facing mostly +Z tilted ~20 degrees) — a quiet Calder whisper near the ground. At mastTop the stem ends in a tiny upturned hook: a half-torus (tube r 0.005, ring r 0.018, colour wire) opening upward, so the armature's attachment ring hangs in it; both parts build their meeting hardware at mastTop.",
      "box": [[-0.45, 0, -0.45], [0.45, 2.0, 0.45]],
      "attaches": "Rises to mount mastTop [0, 2.0, 0], where the armature's ring hangs in the stem's terminal hook.",
      "joints": ["stem"],
      "floor": true,
      "budget": 130
    },
    {
      "id": "armature",
      "builds": "The black wire crown above the stem, from mastTop [0, 2.0, 0]. Two main curved arms, each one b.sweep along a catmull, colour wire: the left arm r 0.014 from [0, 2.0, 0] rising through [0.12, 2.06, 0.04] and curving out left-forward to hookL [0.55, 1.94, 0.2]; the right arm r 0.013 from [0, 2.0, 0] through [-0.14, 2.07, -0.03] curving out right-back to hookR [-0.5, 1.8, -0.1]. A short central branch up to [0, 2.12, 0.01] carrying the crown finial: a small yellow triangle (b.extrude outline ~0.09 per side, thickness 0.02, colour yellow, facing +Z). At hookL and hookR each arm ends in a closed attachment ring: b.part TorusGeometry(0.02, 0.005) in the vertical plane of the coming drop, colour wire — the canopy's top wire loops through it. Two small spacer spheres r 0.012 (colour wire) seated on the arms at mid-span. Style: every arm a single confident curved line, no straight segments, the whole crown reading as black calligraphy against the air.",
      "box": [[-0.7, 1.7, -0.35], [0.75, 2.2, 0.45]],
      "attaches": "Roots at mount mastTop [0, 2.0, 0] on the stem's terminal hook; ends at mounts hookL and hookR with its closed rings, which the canopy hangs from.",
      "joints": ["stem"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "canopy",
      "builds": "The upper tier of hanging sheet shapes, suspended from hookL [0.55, 1.94, 0.2] and hookR [-0.5, 1.8, -0.1]. Left drop: b.sweep along catmull from hookL down through [0.62, 1.75, 0.22] to mount pivotA [0.85, 1.45, 0.3], r 0.010, colour wire, ending in a small closed ring (torus 0.016 / 0.004, colour wire) for the next tier. On it, short twigs (r 0.006, colour wire) carry: a big black leaf — b.extrude an organic 3-4 point outline ~0.34 wide x 0.50 tall, smoothing 2, thickness 0.03, colour sheetBlack — hung at [0.78, 1.62, 0.26], facing mostly +Z tilted ~25 degrees; a red petal ~0.20 x 0.28, thickness 0.025, colour red, at [0.58, 1.78, 0.12], facing forward with a slight jaunty tilt. Right drop: b.sweep from hookR down through [-0.62, 1.5, -0.03] to mount pivotB [-0.8, 1.25, -0.05], r 0.010, ring at pivotB. On it: a big white fan/petal ~0.30 x 0.40, thickness 0.028, colour white, at [-0.55, 1.58, -0.02], facing forward-right (normal ~[0.4, 0, 0.85]); a small orange disc r 0.09, thickness 0.03, colour orange, at [-0.4, 1.72, 0.02], facing mostly +Z. Spacer balls r 0.012 (colour wire) where twigs join the drops. Every shape hangs with its own slight tilt; no two planes coplanar, so edges and faces alternate down the tier.",
      "box": [[-1.0, 1.15, -0.4], [1.05, 2.0, 0.55]],
      "attaches": "Hangs from mounts hookL and hookR (the armature's rings) and ends at mounts pivotA and pivotB, where midSwags hangs below.",
      "joints": ["pivotL", "pivotR"],
      "floor": false,
      "budget": 220
    },
    {
      "id": "midSwags",
      "builds": "The middle tier, hanging from pivotA [0.85, 1.45, 0.3] and pivotB [-0.8, 1.25, -0.05]. Left branch: b.sweep along catmull [0.85,1.45,0.3] -> [0.7,1.15,0.35] -> [0.6,1.02,0.33] -> pivotC [0.55,0.85,0.15], r 0.009, colour wire, small closed ring at pivotC. Twigs (r 0.006): a big orange leaf — organic outline ~0.30 x 0.42, thickness 0.03, smoothing 2, colour orange — hung at [0.72, 0.92, 0.45] on a forward twig, facing +Z tilted ~20 degrees; a small black triangle ~0.16 per side, thickness 0.025, colour sheetBlack, at [0.48, 1.08, 0.12] on a backward twig, angled ~40 degrees off +Z. Right branch: b.sweep along catmull [-0.8,1.25,-0.05] -> [-0.6,1.0,0.0] -> pivotD [-0.45,0.7,-0.1], r 0.009, ring at pivotD. Twigs: a yellow half-moon ~0.26 x 0.30, thickness 0.028, colour yellow, at [-0.55, 0.95, 0.02], facing +Z with a slight roll; a small red disc r 0.07, thickness 0.025, colour red, at [-0.85, 1.08, -0.18], facing forward-left. Spacer balls r 0.010 at twig junctions, colour wire.",
      "box": [[-1.0, 0.55, -0.45], [1.05, 1.55, 0.5]],
      "attaches": "Hangs from mounts pivotA and pivotB (the canopy's rings) and ends at mounts pivotC and pivotD, where finials hangs below.",
      "joints": ["pivotA", "pivotB"],
      "floor": false,
      "budget": 220
    },
    {
      "id": "finials",
      "builds": "The bottom tier, hanging from pivotC [0.55, 0.85, 0.15] and pivotD [-0.45, 0.7, -0.1]. Right cluster: b.sweep from pivotC down to [0.55, 0.55, 0.18], r 0.008, colour wire, then a gentle horizontal balance arm r 0.008 from [0.42, 0.52, 0.16] to [0.72, 0.5, 0.24]; at its left end a solid black counterweight sphere r 0.05 (colour wire); from the arm's middle a 0.06 twig holds a large black blob-leaf — rounded organic outline ~0.40 x 0.34, thickness 0.032, smoothing 2, colour sheetBlack — at [0.55, 0.42, 0.2], facing +Z tilted ~15 degrees; another twig up to a small white disc r 0.06, thickness 0.02, colour white, at [0.7, 0.62, 0.3]. Left cluster: b.sweep from pivotD down to [-0.4, 0.45, -0.06], r 0.008; the model's boldest accent: a big red petal — organic outline ~0.30 wide x 0.34 tall, thickness 0.03, smoothing 2, colour red — at [-0.42, 0.40, -0.04], facing mostly +Z tilted ~30 degrees; a twig up to a small yellow triangle ~0.14 per side, thickness 0.02, colour yellow, at [-0.58, 0.52, -0.14]; a tiny cerulean disc r 0.045, thickness 0.02, colour cerulean, at [-0.28, 0.5, 0.02] — the single blue note in the whole composition. All shape bottoms stay at or above y = 0.23, floating free of the pedestal top.",
      "box": [[-0.85, 0.2, -0.35], [0.9, 0.95, 0.4]],
      "attaches": "Hangs from mounts pivotC and pivotD (the midSwags rings); nothing below it, its shapes hover ~0.23 m above the floor.",
      "joints": ["pivotC", "pivotD"],
      "floor": false,
      "budget": 180
    }
  ]
}
```

<!-- call: pedestal -->

```ts
import * as THREE from "three";
import { catmull } from "agentic-3js-builder";

export function buildPedestal({ b, J, P, M }: Ctx) {
  const bone = J.stem;

  // Foot: lathe disc with rounded lip and shallow dome top
  b.lathe(
    [
      [0, 0],
      [0.38, 0],
      [0.415, 0.012],
      [0.42, 0.03],
      [0.405, 0.055],
      [0.33, 0.062],
      [0.2, 0.07],
      [0, 0.078],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 28, bone, color: P.pedestal },
  );

  // Collar disc
  b.part(new THREE.CylinderGeometry(0.16, 0.17, 0.05, 20), P.pedestal, {
    bone,
    at: [0, 0.098, 0],
  });
  // White inlay ring around the collar rim
  b.part(new THREE.TorusGeometry(0.158, 0.002, 4, 32), P.white, {
    bone,
    at: [0, 0.124, 0],
    rotation: [90, 0, 0],
  });

  // Stem: gentle S-curve
  const stemPath = catmull([
    [0, 0.12, 0],
    [0.025, 0.7, 0],
    [-0.02, 1.35, 0.02],
    [0, 2.0, 0],
  ]);
  b.sweep(stemPath, [0.024, 0.015], { bone, color: P.wire, sides: 8 });

  // Side twig near the base
  b.rod([0.03, 0.5, 0], [0.2, 0.52, 0.05], 0.008, P.wire, { bone });
  b.part(new THREE.SphereGeometry(0.012, 6, 4), P.wire, { bone, at: [0.03, 0.5, 0] });

  // Tiny white oval leaf
  b.extrude(
    [
      [0, 0],
      [0.05, 0.05],
      [0, 0.16],
      [-0.05, 0.05],
    ],
    {
      at: [0.2, 0.49, 0.05],
      x: [1, 0, 0],
      y: [0, 1, 0.35],
      thickness: 0.02,
      smoothing: 2,
      color: P.white,
      bone,
    },
  );

  // Terminal hook: upturned half-torus at mastTop
  b.part(new THREE.TorusGeometry(0.018, 0.005, 6, 12, Math.PI), P.wire, {
    bone,
    at: [M.mastTop[0], M.mastTop[1] - 0.004, M.mastTop[2]],
    rotation: [0, 0, 180],
  });
}
```

<!-- call: armature -->

```ts
import * as THREE from "three";
import { catmull, frame } from "agentic-3js-builder";

export function buildArmature({ b, J, P, M }: Ctx) {
  const bone = J.stem;
  const top = M.mastTop;
  const hookL = M.hookL;
  const hookR = M.hookR;

  // Left arm: rises, then curves out left-forward to hookL
  const armL = catmull([
    top,
    [0.12, 2.06, 0.04],
    [0.3, 2.04, 0.1],
    [hookL[0] - 0.04, hookL[1] + 0.01, hookL[2] - 0.02],
    [hookL[0], hookL[1] + 0.02, hookL[2]],
  ]);
  b.sweep(armL, [0.014, 0.01], { color: P.wire, bone, sides: 8 });

  // Right arm: rises, then curves out right-back to hookR
  const armR = catmull([
    top,
    [-0.14, 2.07, -0.03],
    [-0.32, 1.99, -0.07],
    [hookR[0] + 0.04, hookR[1] + 0.06, hookR[2] - 0.01],
    [hookR[0], hookR[1] + 0.02, hookR[2]],
  ]);
  b.sweep(armR, [0.013, 0.01], { color: P.wire, bone, sides: 8 });

  // Central branch to finial
  const branch = catmull([top, [0.015, 2.05, 0.0], [-0.01, 2.09, 0.008], [0, 2.12, 0.01]]);
  b.sweep(branch, [0.011, 0.007], { color: P.wire, bone, sides: 8 });

  // Yellow triangle finial
  const s = 0.09;
  const h = s * 0.866;
  b.extrude(
    [
      [-s / 2, 0],
      [s / 2, 0],
      [0, h],
    ],
    { at: [0, 2.115, 0.01], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, color: P.yellow, bone },
  );

  // Terminal hook of the stem: small upturned half torus
  b.part(new THREE.TorusGeometry(0.018, 0.005, 6, 10, Math.PI), P.wire, {
    at: [0, 2.0, 0],
    bone,
    rotation: [0, 0, 180],
  });

  // Attachment rings at hooks, vertical planes facing the drop direction
  const ringL = b.part(new THREE.TorusGeometry(0.02, 0.005, 6, 14), P.wire, {
    at: [hookL[0], hookL[1] - 0.012, hookL[2]],
    bone,
    rotation: [0, 25, 0],
  });
  const ringR = b.part(new THREE.TorusGeometry(0.02, 0.005, 6, 14), P.wire, {
    at: [hookR[0], hookR[1] - 0.012, hookR[2]],
    bone,
    rotation: [0, -20, 0],
  });
  void ringL;
  void ringR;

  // Spacer spheres at mid-span of the arms
  const mids = [armL.at(0.5), armR.at(0.5)];
  for (const p of mids) {
    b.part(new THREE.SphereGeometry(0.012, 8, 6), P.wire, { at: [p.x, p.y, p.z], bone });
  }
}
```

<!-- call: midSwags -->

```ts
import * as THREE from "three";
import { catmull } from "agentic-3js-builder";

export function buildMidSwags({ b, J, P, M }: Ctx) {
  const WIRE = P.wire;
  const ring = (at: number[], bone: any, rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.TorusGeometry(0.016, 0.004, 6, 12), WIRE, { bone, at, rotation: rot });
  const ball = (at: number[], bone: any) =>
    b.part(new THREE.SphereGeometry(0.01, 6, 4), WIRE, { bone, at });

  // Left branch (hangs from pivotA)
  b.sweep(
    catmull([M.pivotA, [0.7, 1.15, 0.35], [0.6, 1.02, 0.33], M.pivotC]),
    0.009,
    { color: WIRE, bone: J.pivotA },
  );
  ring([M.pivotC[0], M.pivotC[1] - 0.012, M.pivotC[2]], J.pivotA, [0, 90, 0]);

  // Orange leaf on forward twig
  b.sweep(catmull([[0.7, 1.15, 0.35], [0.72, 1.12, 0.41], [0.72, 1.07, 0.45]]), 0.006, { color: WIRE, bone: J.pivotA });
  ball([0.7, 1.15, 0.35], J.pivotA);
  const leaf = [
    [0, 0.21], [0.15, 0.02], [0.09, -0.21], [-0.12, -0.12], [-0.14, 0.05],
  ] as any;
  b.extrude(leaf, {
    at: [0.72, 0.92, 0.45], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.03, smoothing: 2, color: P.orange, bone: J.pivotA,
  });
  b.sweep(catmull([[0.72, 1.07, 0.45], [0.72, 1.0, 0.45], [0.72, 0.95, 0.45]]), 0.005, { color: WIRE, bone: J.pivotA });

  // Black triangle on backward twig
  b.sweep(catmull([[0.6, 1.02, 0.33], [0.54, 1.06, 0.22], [0.48, 1.13, 0.12]]), 0.006, { color: WIRE, bone: J.pivotA });
  ball([0.6, 1.02, 0.33], J.pivotA);
  const tri = [[0, 0.09], [0.08, -0.05], [-0.08, -0.05]] as any;
  b.extrude(tri, {
    at: [0.48, 1.03, 0.12], x: [0.77, 0, 0.64], y: [0, 1, 0],
    thickness: 0.025, color: P.sheetBlack, bone: J.pivotA,
  });

  // Right branch (hangs from pivotB)
  b.sweep(
    catmull([M.pivotB, [-0.6, 1.0, 0.0], M.pivotD]),
    0.009,
    { color: WIRE, bone: J.pivotB },
  );
  ring([M.pivotD[0], M.pivotD[1] - 0.012, M.pivotD[2]], J.pivotB, [0, 90, 0]);

  // Yellow half-moon
  b.sweep(catmull([[-0.6, 1.0, 0.0], [-0.57, 0.99, 0.01], [-0.55, 0.97, 0.02]]), 0.006, { color: WIRE, bone: J.pivotB });
  ball([-0.6, 1.0, 0.0], J.pivotB);
  const moon = [
    [-0.13, 0.15], [0, 0.17], [0.13, 0.15], [0.07, 0.0], [0, -0.1], [-0.07, 0.0],
  ] as any;
  b.extrude(moon, {
    at: [-0.55, 0.8, 0.02], x: [1, 0.1, 0], y: [-0.1, 1, 0],
    thickness: 0.028, smoothing: 2, color: P.yellow, bone: J.pivotB,
  });
  b.sweep(catmull([[-0.55, 0.97, 0.02], [-0.55, 0.93, 0.02], [-0.55, 0.92, 0.02]]), 0.005, { color: WIRE, bone: J.pivotB });

  // Red disc
  b.sweep(catmull([[-0.8, 1.25, -0.05], [-0.84, 1.17, -0.12], [-0.85, 1.14, -0.18]]), 0.006, { color: WIRE, bone: J.pivotB });
  ball([-0.8, 1.25, -0.05], J.pivotB);
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.025, 16), P.red, {
    bone: J.pivotB, at: [-0.85, 1.08, -0.18], dir: [-0.5, 0.1, 0.85],
  });
  ball([-0.6, 1.0, 0.0], J.pivotB);
}
```

<!-- call: canopy -->

```ts
import * as THREE from "three";
import { catmull, offset } from "agentic-3js-builder";

export function buildCanopy({ b, J, P, M }: any) {
  const WIRE = P.wire;
  const ring = (at: number[], bone: any) =>
    b.part(new THREE.TorusGeometry(0.016, 0.004, 6, 12), WIRE, { bone, at, dir: [1, 0, 0], axis: "z" });
  const ball = (at: number[], bone: any, r = 0.012) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), WIRE, { bone, at });

  // a shape: outline in meters, hung at `at`, facing along normal `n`, tied by a twig to wire point `tie`
  const shape = (outline: any[], color: string, at: number[], n: number[], thick: number, tie: number[], bone: any, roll = 0) => {
    const up = [Math.sin(roll), Math.cos(roll), 0];
    const x = new THREE.Vector3(...up).cross(new THREE.Vector3(...n)).normalize();
    const y = new THREE.Vector3(...n).cross(x).normalize();
    // centre the outline on `at`
    const part = b.extrude(outline, {
      at, x: [x.x, x.y, x.z], y: [y.x, y.y, y.z], thickness: thick, bevel: 0.003, smoothing: 2, color, bone,
    });
    // twig from wire to the top of the shape
    const top = [at[0], at[1] + 0.02, at[2]];
    b.sweep(catmull([tie, [(tie[0] + top[0]) / 2, (tie[1] + top[1]) / 2 + 0.015, (tie[2] + top[2]) / 2], top]), 0.006, { color: WIRE, bone });
    ball(tie, bone);
    return part;
  };

  const leaf = (w: number, h: number): any[] => [
    [0, -h / 2], [w * 0.5, -h * 0.1], [w * 0.2, h * 0.35], [-w * 0.05, h / 2], [-w * 0.5, h * 0.1],
  ];
  const petal = (w: number, h: number): any[] => [
    [0, -h / 2], [w / 2, -h * 0.05], [w * 0.3, h * 0.4], [-w * 0.3, h * 0.4], [-w / 2, -h * 0.05],
  ];
  const fan = (w: number, h: number): any[] => [
    [0, -h / 2], [w / 2, h * 0.1], [w * 0.25, h / 2], [-w * 0.25, h / 2], [-w / 2, h * 0.1],
  ];
  const disc = (r: number, n = 14): any[] =>
    Array.from({ length: n }, (_, i) => [Math.cos((i / n) * Math.PI * 2) * r, Math.sin((i / n) * Math.PI * 2) * r]);

  const hl = M.hookL, hr = M.hookR, pa = M.pivotA, pb = M.pivotB;

  // left drop
  b.sweep(catmull([hl, [0.62, 1.75, 0.22], pa]), 0.01, { color: WIRE, bone: J.pivotL });
  ring(pa, J.pivotL);
  shape(leaf(0.34, 0.5), P.sheetBlack, [0.78, 1.5, 0.26], [0.42, 0, 0.9], 0.03, [0.7, 1.72, 0.235], J.pivotL, 0.1);
  shape(petal(0.2, 0.28), P.red, [0.58, 1.7, 0.12], [-0.15, 0.1, 0.98], 0.025, [0.6, 1.8, 0.2], J.pivotL, -0.25);

  // right drop
  b.sweep(catmull([hr, [-0.62, 1.5, -0.03], pb]), 0.01, { color: WIRE, bone: J.pivotR });
  ring(pb, J.pivotR);
  shape(fan(0.3, 0.4), P.white, [-0.55, 1.5, -0.02], [0.4, 0, 0.85], 0.028, [-0.6, 1.58, -0.03], J.pivotR, 0.15);
  shape(disc(0.09), P.orange, [-0.4, 1.66, 0.02], [0.1, 0.05, 1], 0.03, [-0.55, 1.62, -0.03], J.pivotR);
  ball([-0.62, 1.5, -0.03], J.pivotR);
  ball([0.62, 1.75, 0.22], J.pivotL);
}
```

<!-- call: finials -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildFinials({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const wire = P.wire;

  // flat cutout helper: outline in local shape coords, placed at a point, tilted about Y and roll
  const cut = (
    outline: any[],
    color: string,
    at: number[],
    th: number,
    yawDeg: number,
    rollDeg: number,
    bone: any,
  ) => {
    const yaw = (yawDeg * Math.PI) / 180;
    const roll = (rollDeg * Math.PI) / 180;
    const x: [number, number, number] = [Math.cos(yaw), 0, -Math.sin(yaw)];
    const y: [number, number, number] = [Math.sin(roll) * Math.cos(yaw), Math.cos(roll), -Math.sin(roll) * Math.sin(yaw)];
    return b.extrude(outline, { at, x, y, thickness: th, bevel: th * 0.15, smoothing: 2, color, bone });
  };
  const ball = (p: number[], r: number, color: string, bone: any) =>
    b.part(new THREE.SphereGeometry(r, 10, 8), color, { at: p, bone });
  const ring = (p: number[], bone: any) =>
    b.part(new THREE.TorusGeometry(0.016, 0.004, 6, 14), wire, { at: p, bone, rotation: [0, 90, 0] });
  const disc = (p: number[], r: number, th: number, color: string, yaw: number, bone: any) =>
    b.part(new THREE.CylinderGeometry(r, r, th, 20), color, {
      at: p,
      bone,
      dir: [Math.sin((yaw * Math.PI) / 180), 0, Math.cos((yaw * Math.PI) / 180)],
    });

  const C = J.pivotC;
  const D = J.pivotD;

  // ---------- Right cluster (from pivotC) ----------
  const cpos = M.pivotC;
  b.sweep(
    [cpos, [cpos[0] + 0.03, 0.72, 0.17], [0.54, 0.6, 0.18], [0.55, 0.55, 0.18]],
    0.008,
    { color: wire, bone: C },
  );
  ring([cpos[0], cpos[1] + 0.012, cpos[2]], C);
  // balance arm
  b.sweep([[0.42, 0.52, 0.16], [0.55, 0.54, 0.2], [0.72, 0.5, 0.24]], 0.008, { color: wire, bone: C });
  ball([0.55, 0.55, 0.18], 0.012, wire, C);
  ball([0.4, 0.52, 0.16], 0.05, wire, C); // counterweight
  // twig down to blob leaf
  b.sweep([[0.55, 0.54, 0.2], [0.555, 0.5, 0.2], [0.55, 0.47, 0.2]], 0.006, { color: wire, bone: C });
  const blob: any[] = [
    [-0.2, 0.0], [-0.18, 0.1], [-0.05, 0.17], [0.12, 0.15], [0.2, 0.02], [0.14, -0.1], [0.0, -0.17], [-0.14, -0.1],
  ];
  cut(blob, P.sheetBlack, [0.55, 0.43, 0.2], 0.032, 0, 15, C);
  // twig to white disc
  b.sweep([[0.68, 0.51, 0.23], [0.7, 0.57, 0.28], [0.7, 0.6, 0.3]], 0.006, { color: wire, bone: C });
  ball([0.68, 0.51, 0.23], 0.01, wire, C);
  disc([0.7, 0.67, 0.3], 0.06, 0.02, P.white, 20, C);

  // ---------- Left cluster (from pivotD) ----------
  const dpos = M.pivotD;
  b.sweep(
    [dpos, [-0.46, 0.62, -0.09], [-0.42, 0.52, -0.07], [-0.4, 0.45, -0.06]],
    0.008,
    { color: wire, bone: D },
  );
  ring([dpos[0], dpos[1] + 0.012, dpos[2]], D);
  ball([-0.4, 0.45, -0.06], 0.012, wire, D);
  const petal: any[] = [
    [0, -0.17, "sharp"], [0.12, -0.06], [0.15, 0.06], [0.06, 0.15], [-0.04, 0.16], [-0.13, 0.05], [-0.1, -0.07],
  ];
  cut(petal, P.red, [-0.42, 0.4, -0.04], 0.03, 30, -8, D);
  // twig to yellow triangle
  b.sweep([[-0.45, 0.62, -0.09], [-0.52, 0.58, -0.12], [-0.57, 0.55, -0.14]], 0.006, { color: wire, bone: D });
  ball([-0.45, 0.62, -0.09], 0.01, wire, D);
  const tri: any[] = [[-0.07, -0.06, "sharp"], [0.07, -0.06, "sharp"], [0, 0.07, "sharp"]];
  cut(tri, P.yellow, [-0.58, 0.46, -0.14], 0.02, -25, 12, D);
  // cerulean disc
  b.sweep([[-0.42, 0.55, -0.06], [-0.34, 0.56, -0.02], [-0.28, 0.55, 0.0]], 0.006, { color: wire, bone: D });
  disc([-0.28, 0.5, 0.02], 0.045, 0.02, P.cerulean, 10, D);
}
```