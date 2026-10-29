<!-- call: plan -->

```json
{
  "name": "Bauhaus Songbird on a Branch",
  "description": "A small perched songbird built as a Bauhaus composition of circles, triangles and squares in flat red, yellow and blue, gripping a black branch that rests on a white plinth with two posts.",
  "builderName": "bauhausSongbird",
  "size": [0.34, 0.27, 0.31],
  "layout": "Real songbird scale: about 15 cm from beak tip to tail tip, standing about 16 cm above the floor (beak side +Z). Everything is centred on x = 0, the bird sits in the middle of a horizontal branch that runs along X, and the branch is held on two thin posts over a flat plinth lying on y = 0, so the plinth is the only thing touching the floor. The bird is seen in profile or three-quarter view and is a stack of simple solids, each a different primary shape. The body is a squat red ellipsoid (radii about 0.052 x, 0.05 y, 0.068 z) centred at [0, 0.17, 0]. Its head is a yellow sphere of radius 0.034 at [0, 0.228, 0.052], pushed forward and up. A blue pyramid or cone beak points forward from the head, with a smaller dark-blue lower beak on the jaw. The two blue wings lie folded against the flanks, slightly apart from the body and angled back and down, built as layered rectangular feathers. A fan of five rectangular tail feathers (yellow and blue) points back and slightly down to z = -0.19. Two thin yellow-dark legs come out of the belly and end in four-toed feet whose toes wrap over the branch top at y = 0.102. The style on every part is Bauhaus: bold geometry, flat primary colours (red, yellow and blue, plus black and off-white), no gradients, no organic detail. Circles are thin discs, squares are boxes, triangles are cones with 3 sides or extruded triangles. Each detail is a small separate part in its own flat colour, seated on the surface: eyes are stacked concentric discs (black outline, white, black pupil), bands are thin rings or boxes, and a black thin outline disc sits behind each coloured disc (about 0.0015 m larger) so shapes read as printed. Use low segment counts (8 to 12 around, 6 to 8 up) so facets show. Keep symmetric left/right pairs exact mirrors. Only the perch is on the floor. The bird's body, head, wings, tail and legs all sit above y = 0.10.",
  "palette": {
    "red": "#d9261c",
    "redDark": "#9c1a14",
    "blue": "#1c3fa8",
    "blueDark": "#122a74",
    "blueLight": "#3f6fd8",
    "yellow": "#f5c400",
    "yellowDark": "#c79a00",
    "black": "#15151a",
    "white": "#f3eee1",
    "cream": "#e4dcc4",
    "grey": "#8d8d8a",
    "branch": "#2a2420",
    "branchLight": "#4d4038"
  },
  "mounts": {
    "branchTop": [0, 0.102, 0],
    "branchAxis": [0, 0.09, 0],
    "bodyCenter": [0, 0.17, 0],
    "neckBase": [0, 0.2, 0.05],
    "headCenter": [0, 0.228, 0.052],
    "beakBase": [0, 0.222, 0.084],
    "jawHinge": [0, 0.218, 0.07],
    "tailRoot": [0, 0.158, -0.06],
    "shoulderL": [0.048, 0.19, 0.03],
    "shoulderR": [-0.048, 0.19, 0.03],
    "hipSocketL": [0.028, 0.135, 0],
    "hipSocketR": [-0.028, 0.135, 0],
    "footL": [0.028, 0.106, 0.004],
    "footR": [-0.028, 0.106, 0.004],
    "postL": [0.12, 0.016, 0],
    "postR": [-0.12, 0.016, 0],
    "twigRoot": [0.1, 0.09, 0]
  },
  "joints": [
    { "name": "perch", "at": [0, 0, 0], "dir": [0, 1, 0] },
    { "name": "hips", "parent": "perch", "at": [0, 0.165, -0.03], "dir": [0, 0, 1], "role": "spine" },
    { "name": "chest", "parent": "hips", "at": [0, 0.17, 0.03], "dir": [0, 0.2, 1], "role": "spine" },
    { "name": "neck", "parent": "chest", "at": [0, 0.2, 0.05], "dir": [0, 1, 0.3], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 0.222, 0.054], "dir": [0, 0, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 0.218, 0.07], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "tail1", "parent": "hips", "at": [0, 0.158, -0.06], "dir": [0, -0.1, -1], "role": "tail", "group": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 0.15, -0.1], "dir": [0, -0.12, -1], "role": "tail", "group": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 0.14, -0.145], "dir": [0, -0.12, -1], "role": "tail", "group": "tail" },
    { "name": "wingL1", "parent": "chest", "at": [0.048, 0.19, 0.03], "dir": [0.2, -0.3, -1], "role": "wing", "group": "wings" },
    { "name": "wingL2", "parent": "wingL1", "at": [0.056, 0.178, -0.02], "dir": [0.1, -0.2, -1], "role": "wing", "group": "wings" },
    { "name": "wingL3", "parent": "wingL2", "at": [0.058, 0.165, -0.07], "dir": [0, -0.2, -1], "role": "wing", "group": "wings" },
    { "name": "wingR1", "parent": "chest", "at": [-0.048, 0.19, 0.03], "dir": [-0.2, -0.3, -1], "role": "wing", "group": "wings" },
    { "name": "wingR2", "parent": "wingR1", "at": [-0.056, 0.178, -0.02], "dir": [-0.1, -0.2, -1], "role": "wing", "group": "wings" },
    { "name": "wingR3", "parent": "wingR2", "at": [-0.058, 0.165, -0.07], "dir": [0, -0.2, -1], "role": "wing", "group": "wings" },
    { "name": "hipL", "parent": "hips", "at": [0.028, 0.135, 0], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "kneeL", "parent": "hipL", "at": [0.028, 0.122, -0.003], "dir": [0, -1, 0.3], "role": "leg", "group": "legs" },
    { "name": "ankleL", "parent": "kneeL", "at": [0.028, 0.108, 0], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "toeL1", "parent": "ankleL", "at": [0.028, 0.106, 0.006], "dir": [0.25, 0, 1], "role": "digit", "group": "legs" },
    { "name": "toeL2", "parent": "ankleL", "at": [0.028, 0.106, 0.006], "dir": [0, 0, 1], "role": "digit", "group": "legs" },
    { "name": "toeL3", "parent": "ankleL", "at": [0.028, 0.106, 0.006], "dir": [-0.25, 0, 1], "role": "digit", "group": "legs" },
    { "name": "toeL4", "parent": "ankleL", "at": [0.028, 0.106, 0.002], "dir": [0, 0, -1], "role": "digit", "group": "legs" },
    { "name": "hipR", "parent": "hips", "at": [-0.028, 0.135, 0], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.028, 0.122, -0.003], "dir": [0, -1, 0.3], "role": "leg", "group": "legs" },
    { "name": "ankleR", "parent": "kneeR", "at": [-0.028, 0.108, 0], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "toeR1", "parent": "ankleR", "at": [-0.028, 0.106, 0.006], "dir": [-0.25, 0, 1], "role": "digit", "group": "legs" },
    { "name": "toeR2", "parent": "ankleR", "at": [-0.028, 0.106, 0.006], "dir": [0, 0, 1], "role": "digit", "group": "legs" },
    { "name": "toeR3", "parent": "ankleR", "at": [-0.028, 0.106, 0.006], "dir": [0.25, 0, 1], "role": "digit", "group": "legs" },
    { "name": "toeR4", "parent": "ankleR", "at": [-0.028, 0.106, 0.002], "dir": [0, 0, -1], "role": "digit", "group": "legs" }
  ],
  "parts": [
    {
      "id": "head",
      "builds": "The whole head and neck collar. A yellow sphere head, radius 0.034, centred at headCenter, slightly flattened in y. A blue half-disc crest, an extruded semicircle about 0.028 wide, stands on the crown with a thin black outline disc behind it and a small red circle at its middle. On each side is a red cheek disc, radius 0.012, with a black outline disc behind it. The eyes sit on the front-sides of the head at about x ±0.022, y 0.235, z 0.075, each made of stacked discs: a black outline disc r 0.0125, a white disc r 0.0105, a black pupil disc r 0.006 and a tiny white highlight disc. A thin black brow bar sits above each eye, slanted slightly. The upper beak is a blue 4-sided pyramid or cone about 0.032 long, base radius 0.014, from beakBase pointing +Z, on the head bone. The lower beak is a smaller blueDark wedge on the jaw joint, with a thin black mouth-line box between them and two black nostril dots. Under the head is a neck collar: a white flat ring (short wide cylinder) with thin black rings above and below it, and a small red triangle bib point on the throat. Yellow-dark triangular feather points sit on the back of the head as a nape detail. Seat every detail on the sphere surface with stick.",
      "box": [[-0.036, 0.195, 0.02], [0.036, 0.268, 0.118]],
      "attaches": "Neck collar sits on the top of the torso near neckBase. Head parts ride neck and head, and the lower beak rides jaw (hinge at jawHinge). Nothing in front of the face.",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "torso",
      "builds": "Body mass only, with the rump and the front of the chest. A red ellipsoid body (radii ~0.052, 0.05, 0.068) at bodyCenter, built as a loft or scaled sphere with 10 to 12 sides. An off-white belly half-ellipsoid or half-disc sits on the underside and front, hugging the body surface. A yellow chest bib triangle (extruded, pointing down, ~0.04 wide) sits on the front of the chest, outlined by a slightly larger black triangle behind it. Three thin black ring bands cross the breast, below the bib. A blueDark back saddle of overlapping rectangles lies along the top of the back. A yellow square rump patch is above the tail root. Thin black dividing bars separate the colour blocks. Two blue shoulder discs (r 0.014, black outline behind) sit on the flanks at the shoulderL and shoulderR mounts, but under the wings. Small red thigh-cover bumps (half spheres) sit at the hipSockets. All details are seated on the body surface using b.surface and stick.",
      "box": [[-0.056, 0.115, -0.072], [0.056, 0.224, 0.072]],
      "attaches": "Head part's collar overlaps the top-front at neckBase. Wings start at shoulderL/R on the sides. Tail starts at tailRoot at the back. Legs come out below at hipSocketL/R.",
      "joints": ["hips", "chest"],
      "floor": false,
      "budget": 140
    },
    {
      "id": "wingsTail",
      "builds": "Both wings and the tail, mirrored exactly. Each wing is a folded slab group that lies along the flank starting at the shoulder mount and angling back and slightly down and out (wingL1/2/3 and wingR1/2/3 bones). It has a blue covert panel (rounded/pointed extruded rectangle) over the shoulder, then 5 overlapping long primary feathers: rectangles with pointed ends in alternating blue and blueDark, longer toward the back, a yellow stripe bar across the middle, a red circle on the covert (with a black outline disc behind), and a white small square tip on each primary. A thin black edge line follows the leading edge. The tail is a fan of 5 rectangular feathers (thin boxes), 0.02 wide and 0.11 to 0.13 long, starting at tailRoot, running back and slightly down to z -0.19, spread by about 8 degrees each. The colours alternate yellow and blue, with the middle feather yellow, and each has a black end band and a white tip square. A red circle sits on the tail base, with a black outline behind it. Feathers on tail1/tail2/tail3 and wing bones by span.",
      "box": [[-0.066, 0.11, -0.192], [0.066, 0.205, 0.045]],
      "attaches": "Wings start at the shoulderL/R mounts on the torso's flanks and sit just outside the body (x about ±0.052 to ±0.066). The tail starts at tailRoot, at the torso's back.",
      "joints": ["wingL1", "wingL2", "wingL3", "wingR1", "wingR2", "wingR3", "tail1", "tail2", "tail3"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "legsFeet",
      "builds": "Both legs and feet, mirrored. Each has a short blueDark feather-trouser prism (small triangular or box block) at the hip socket. Under it, a thin yellowDark tarsus rod (radius ~0.0035) runs from hipSocket down to the foot, with a small red disc at the ankle and a black thin ring at the knee. Each foot has four toes: three forward and one back (toeX1..4 bones), thin yellowDark rods (radius ~0.003) that curl over and wrap the branch top at y 0.102 (toes end slightly below the branch's top silhouette edge, at about y 0.098 on the sides), each tipped with a black cone claw. The toes' pads are tiny black cubes. Feet sit exactly on branchTop at footL/footR.",
      "box": [[-0.036, 0.095, -0.03], [0.036, 0.14, 0.045]],
      "attaches": "Hips at hipSocketL/R on the torso's underside. Toes grip the top of the branch at footL/footR (branch radius 0.012, axis y 0.09).",
      "joints": ["hipL", "kneeL", "ankleL", "toeL1", "toeL2", "toeL3", "toeL4", "hipR", "kneeR", "ankleR", "toeR1", "toeR2", "toeR3", "toeR4"],
      "floor": false,
      "budget": 80
    },
    {
      "id": "perch",
      "builds": "The branch and its stand, in a Bauhaus style. An off-white flat plinth box (0.34 long in x, 0.016 tall, 0.09 deep in z) lies on y = 0, with three small squares on its top face in red, yellow and blue and thin black edge lines. Two thin black posts (0.012 square, y 0.016 to 0.09) stand at postL and postR (x ±0.12). The branch is a dark (branch colour) faceted rod, radius 0.012 with 6 to 8 sides, along X at y 0.09 from x -0.17 to 0.17, with slightly tapered ends. It has rounded or flat end caps (a red disc at the left end, a blue disc at the right end), and thin yellow ring bands at x ±0.06 and ±0.15 and a few raised knots (branchLight small blocks). A twig rises from twigRoot (x 0.1) diagonally up and forward to about [0.15, 0.19, 0.03] as a thin sweep, with a short fork. Geometric leaves sit on the twig: a red circle disc, a yellow triangle and a blue square, each with a thin black outline shape behind it, each about 0.03 wide. They face +Z or the viewer. A matching small twig stub on the left end carries one yellow disc. No part of the perch intrudes into the area x within ±0.07 above y 0.102, which is the bird's space.",
      "box": [[-0.17, 0, -0.045], [0.17, 0.215, 0.05]],
      "attaches": "Branch top at branchTop is where the bird's toes grip. All the perch's geometry rides the perch root joint. Its plinth is the only thing on y = 0.",
      "joints": ["perch"],
      "floor": true,
      "budget": 230
    }
  ]
}
```

<!-- call: legsFeet -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLegsFeet({ b, J, P, M }: Ctx) {
  const R = rng(5);
  void R;
  const BRANCH_TOP = 0.102;

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = J["hip" + side];
    const knee = J["knee" + side];
    const ankle = J["ankle" + side];
    const x = s * 0.028;

    // feather trouser: box block with a triangular cap
    b.part(new THREE.BoxGeometry(0.02, 0.016, 0.026), P.blueDark, {
      bone: hip,
      at: [x, 0.134, -0.001],
    });
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.02, 3), P.blueDark, {
      bone: hip,
      at: [x, 0.125, -0.003],
      rotation: [0, 0, 90],
    });
    // tarsus: thigh to knee, knee to ankle
    b.rod([x, 0.128, -0.002], [x, 0.122, -0.003], 0.0035, P.yellowDark, { bone: hip, sides: 6 });
    b.rod([x, 0.122, -0.003], [x, 0.108, 0.0], 0.0035, P.yellowDark, { bone: knee, sides: 6 });
    // knee black ring
    b.part(new THREE.CylinderGeometry(0.0052, 0.0052, 0.003, 8), P.black, {
      bone: knee,
      at: [x, 0.122, -0.003],
    });
    // ankle red disc, facing outward
    b.part(new THREE.CylinderGeometry(0.0062, 0.0062, 0.0016, 8), P.black, {
      bone: ankle,
      at: [x + s * 0.0035, 0.109, 0],
      rotation: [0, 0, 90],
    });
    b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.0016, 8), P.red, {
      bone: ankle,
      at: [x + s * 0.0045, 0.109, 0],
      rotation: [0, 0, 90],
    });
    // ankle ball joint
    b.part(new THREE.SphereGeometry(0.0045, 6, 5), P.yellowDark, { bone: ankle, at: [x, 0.107, 0.002] });

    // toes: three forward, one back, arching over the branch (radius 0.012, axis y 0.09)
    const toeDefs: { n: number; dx: number; len: number }[] = [
      { n: 1, dx: s * 0.25, len: 1 },
      { n: 2, dx: 0, len: 1.15 },
      { n: 3, dx: -s * 0.25, len: 1 },
      { n: 4, dx: 0, len: -0.8 },
    ];
    for (const t of toeDefs) {
      const bone = J["toe" + side + t.n];
      const dir = t.len > 0 ? 1 : -1;
      const L = Math.abs(t.len);
      const z0 = 0.004 * dir;
      const p0: [number, number, number] = [x, 0.106, z0];
      const p1: [number, number, number] = [x + t.dx * 0.012 * L, 0.1035, z0 + dir * 0.012 * L];
      const p2: [number, number, number] = [x + t.dx * 0.02 * L, 0.0985, z0 + dir * 0.0215 * L];
      const p3: [number, number, number] = [x + t.dx * 0.023 * L, 0.0915, z0 + dir * 0.0245 * L];
      b.rod(p0, p1, 0.003, P.yellowDark, { bone, sides: 6 });
      b.rod(p1, p2, 0.003, P.yellowDark, { bone, sides: 6 });
      b.rod(p2, p3, 0.0028, P.yellowDark, { bone, sides: 6 });
      // knuckle
      b.part(new THREE.SphereGeometry(0.0033, 6, 4), P.yellowDark, { bone, at: p1 });
      // pad cube
      b.part(new THREE.BoxGeometry(0.004, 0.0025, 0.004), P.black, {
        bone,
        at: [p1[0], p1[1] + 0.0025, p1[2]],
      });
      // claw cone
      const cdir: [number, number, number] = [t.dx * 0.1, -0.9, dir * 0.4];
      b.part(new THREE.ConeGeometry(0.0022, 0.0075, 5), P.black, {
        bone,
        at: [p3[0], p3[1] - 0.003, p3[2] + dir * 0.0005],
        dir: cdir,
      });
    }
  }
}
```

<!-- call: wingsTail -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildWingsTail({ b, J, P, M }: any) {
  const r = rng(5);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const disc = (rad: number, t = 0.002, seg = 12) => new THREE.CylinderGeometry(rad, rad, t, seg);
  const tri = (w: number, l: number, t: number) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, l); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false });
    g.translate(0, 0, -t / 2);
    return g;
  };

  // ---------- Wings ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const w1 = J["wing" + side + "1"];
    const w2 = J["wing" + side + "2"];
    const w3 = J["wing" + side + "3"];
    const x0 = s * 0.056;
    // covert panel over the shoulder
    b.extrude(
      [[-0.022, 0], [0.022, 0], [0.026, -0.03], [0, -0.05], [-0.026, -0.03]].map(
        (p) => [p[0], p[1]] as [number, number],
      ),
      { at: [x0 + s * 0.004, 0.2, 0.05], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.006, color: P.blue, bone: w1 },
    );
    // outline + red circle on covert
    const cAt: [number, number, number] = [s * 0.063, 0.182, 0.032];
    b.part(disc(0.0115), P.black, { at: cAt, dir: [s, 0, 0], bone: w1 });
    b.part(disc(0.01, 0.0024), P.red, { at: [s * 0.0635, 0.182, 0.032], dir: [s, 0, 0], bone: w1 });
    b.part(disc(0.004, 0.0028), P.yellow, { at: [s * 0.064, 0.182, 0.032], dir: [s, 0, 0], bone: w1 });
    // leading edge black line
    b.part(box(0.003, 0.003, 0.1), P.black, { at: [s * 0.0645, 0.2, -0.01], rotation: [4, 0, 0], bone: w1 });

    // primaries
    for (let i = 0; i < 5; i++) {
      const len = 0.06 + i * 0.012;
      const bone = i < 2 ? w1 : i < 4 ? w2 : w3;
      const col = i % 2 ? P.blueDark : P.blue;
      const y = 0.19 - i * 0.0075;
      const x = s * (0.053 + i * 0.0026);
      const z0 = 0.02 - i * 0.012;
      const zc = z0 - len / 2;
      b.part(box(0.004, 0.0085, len), col, { at: [x, y, zc], rotation: [-5, 0, 0], bone });
      // pointed end
      b.part(tri(0.0085, 0.012, 0.004), col, {
        at: [x, y - 0.0005, z0 - len],
        rotation: [0, 0, 90],
        dir: [0, 0, -1],
        bone,
      });
      // yellow stripe
      b.part(box(0.0046, 0.0088, 0.008), P.yellow, { at: [x + s * 0.0004, y, zc + 0.002], rotation: [-5, 0, 0], bone });
      // white tip square
      b.part(box(0.0048, 0.005, 0.005), P.white, { at: [x + s * 0.0004, y - 0.001, z0 - len + 0.004], bone });
    }
  }

  // ---------- Tail ----------
  const root = M.tailRoot;
  const tb = [J.tail1, J.tail1, J.tail2, J.tail3, J.tail3];
  const order = [-2, -1, 0, 1, 2];
  order.forEach((k, i) => {
    const len = 0.12 - Math.abs(k) * 0.005;
    const ang = k * 8 * (Math.PI / 180);
    const col = k === 0 || Math.abs(k) === 2 ? P.yellow : P.blue;
    const pitch = -0.08;
    const dirv = new THREE.Vector3(Math.sin(ang), pitch, -Math.cos(ang)).normalize();
    const mid = new THREE.Vector3(root[0], root[1] - 0.002, root[2]).addScaledVector(dirv, len / 2);
    const tip = new THREE.Vector3(root[0], root[1] - 0.002, root[2]).addScaledVector(dirv, len);
    const bone = tb[i];
    b.part(box(0.02, 0.004, len), col, { at: mid, dir: dirv, axis: "z", bone });
    // black band
    const bandAt = new THREE.Vector3(root[0], root[1] - 0.002, root[2]).addScaledVector(dirv, len - 0.022);
    b.part(box(0.0205, 0.0045, 0.006), P.black, { at: bandAt, dir: dirv, axis: "z", bone });
    // white tip square
    const tipAt = new THREE.Vector3(root[0], root[1] - 0.002, root[2]).addScaledVector(dirv, len - 0.006);
    b.part(box(0.0205, 0.0046, 0.008), P.white, { at: tipAt, dir: dirv, axis: "z", bone });
  });
  // red circle with outline at the tail base
  b.part(disc(0.0135, 0.002, 12), P.black, { at: [0, 0.1625, -0.07], dir: [0, 1, 0], bone: J.tail1 });
  b.part(disc(0.012, 0.0026, 12), P.red, { at: [0, 0.1632, -0.07], dir: [0, 1, 0], bone: J.tail1 });
  b.part(disc(0.0045, 0.003, 8), P.yellow, { at: [0, 0.1638, -0.07], dir: [0, 1, 0], bone: J.tail1 });
  void r; void frame;
}
```

<!-- call: perch -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildPerch({ b, J, P, M }: Ctx) {
  const bone = J.perch;
  const R = rng(5);
  const BR = 0.012;
  const BY = 0.09;

  const box = (w: number, h: number, d: number, color: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot });
  const disc = (r: number, t: number, color: string, at: [number, number, number], dir: [number, number, number], seg = 16) =>
    b.part(new THREE.CylinderGeometry(r, r, t, seg), color, { bone, at, dir });
  const tri = (s: number, t: number, color: string, at: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(s, s, t, 3), color, { bone, at, dir: [0, 0, 1] });

  // plinth
  box(0.34, 0.016, 0.09, P.white, [0, 0.008, 0]);
  // black edge lines on top
  const top = 0.0165;
  box(0.34, 0.0008, 0.002, P.black, [0, top, 0.044]);
  box(0.34, 0.0008, 0.002, P.black, [0, top, -0.044]);
  box(0.002, 0.0008, 0.09, P.black, [0.169, top, 0]);
  box(0.002, 0.0008, 0.09, P.black, [-0.169, top, 0]);
  // colour squares with outline
  const sq: [number, string][] = [[-0.05, P.red], [0, P.yellow], [0.05, P.blue]];
  for (const [x, c] of sq) {
    box(0.036, 0.0008, 0.036, P.black, [x, top, 0]);
    box(0.033, 0.0012, 0.033, c, [x, top + 0.0003, 0]);
  }

  // posts
  for (const s of [1, -1]) {
    box(0.012, 0.074, 0.012, P.black, [s * 0.12, 0.053, 0]);
    box(0.02, 0.004, 0.02, P.black, [s * 0.12, 0.018, 0]);
    box(0.02, 0.004, 0.02, P.black, [s * 0.12, 0.088, 0]);
  }

  // branch: tapered faceted rod
  b.rod([-0.17, BY, 0], [0.17, BY, 0], [BR * 0.85, BR * 0.85], P.branch, { bone, sides: 8, caps: "flat" });
  b.rod([-0.14, BY, 0], [0.14, BY, 0], BR * 1.02, P.branch, { bone, sides: 8, caps: "flat" });
  // end discs
  disc(0.0125, 0.003, P.black, [-0.1715, BY, 0], [1, 0, 0], 12);
  disc(0.011, 0.003, P.red, [-0.173, BY, 0], [1, 0, 0], 12);
  disc(0.0125, 0.003, P.black, [0.1715, BY, 0], [1, 0, 0], 12);
  disc(0.011, 0.003, P.blue, [0.173, BY, 0], [1, 0, 0], 12);

  // yellow ring bands
  for (const x of [-0.15, -0.06, 0.06, 0.15]) {
    const r = x < -0.1 || x > 0.1 ? BR * 0.93 : BR * 1.06;
    b.part(new THREE.CylinderGeometry(r * 1.06, r * 1.06, 0.004, 8), P.yellow, { bone, at: [x, BY, 0], dir: [1, 0, 0] });
  }

  // knots (outside x within 0.07 above branch top)
  for (const [x, z, y] of [[-0.11, 0.008, BY + 0.008], [0.04, -0.011, BY - 0.002], [-0.085, -0.009, BY + 0.003], [0.13, 0.01, BY + 0.005]] as number[][]) {
    box(0.012, 0.01, 0.01, P.branchLight, [x, y, z], [R() * 30, R() * 40, R() * 30]);
  }

  // twig on the right
  const root: [number, number, number] = [M.twigRoot[0], M.twigRoot[1], M.twigRoot[2]];
  const tip: [number, number, number] = [0.15, 0.19, 0.03];
  b.rod(root, tip, [0.0065, 0.0035], P.branch, { bone, sides: 6 });
  // fork
  const forkAt: [number, number, number] = [0.128, 0.148, 0.018];
  const forkTip: [number, number, number] = [0.095, 0.178, 0.04];
  b.rod(forkAt, forkTip, [0.0045, 0.002], P.branch, { bone, sides: 6 });
  b.part(new THREE.SphereGeometry(0.005, 6, 4), P.branchLight, { bone, at: forkAt });

  // leaves
  const lz = 0.036;
  // red circle at tip
  disc(0.0165, 0.002, P.black, [0.15, 0.2, lz], [0, 0, 1], 16);
  disc(0.015, 0.002, P.red, [0.15, 0.2, lz + 0.0015], [0, 0, 1], 16);
  b.rod([0.15, 0.19, 0.03], [0.15, 0.2, lz], 0.0015, P.branch, { bone, sides: 6 });
  // yellow triangle
  tri(0.0185, 0.002, P.black, [0.172, 0.168, 0.03]);
  tri(0.0165, 0.002, P.yellow, [0.172, 0.168, 0.0315]);
  b.rod([0.14, 0.17, 0.024], [0.168, 0.168, 0.03], 0.0015, P.branch, { bone, sides: 6 });
  // blue square on fork
  box(0.03, 0.03, 0.002, P.black, [0.095, 0.2, 0.046], [0, 0, 15]);
  box(0.027, 0.027, 0.002, P.blue, [0.095, 0.2, 0.0475], [0, 0, 15]);
  b.rod(forkTip, [0.095, 0.195, 0.045], 0.0015, P.branch, { bone, sides: 6 });

  // left twig stub with yellow disc
  const stubRoot: [number, number, number] = [-0.12, BY + 0.008, 0];
  const stubTip: [number, number, number] = [-0.145, 0.135, 0.02];
  b.rod(stubRoot, stubTip, [0.005, 0.003], P.branch, { bone, sides: 6 });
  disc(0.0165, 0.002, P.black, [-0.148, 0.15, 0.028], [0, 0, 1], 16);
  disc(0.015, 0.002, P.yellow, [-0.148, 0.15, 0.0295], [0, 0, 1], 16);
  b.rod(stubTip, [-0.148, 0.145, 0.027], 0.0015, P.branch, { bone, sides: 6 });
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  const HC = M.headCenter;
  const R = 0.034;
  const head = J.head;
  const jaw = J.jaw;
  const neck = J.neck;

  // helper: disc facing a direction, placed in model space
  const disc = (r: number, h: number, color: string, at: number[], dir: number[], bone: any, seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at, dir });

  // head sphere (flattened in y)
  const skull = b.part(new THREE.SphereGeometry(R, 12, 8), P.yellow, {
    bone: head,
    at: HC,
    scale: [1, 0.94, 1],
  });
  const skin = b.surface(skull);

  // seat a flat disc on the skull at azimuth/elevation
  const seat = (r: number, h: number, color: string, az: number, el: number, lift = 0) => {
    const hit = skin.around(HC).at(az, el);
    if (!hit) return null;
    return b.stick(new THREE.CylinderGeometry(r, r, h, 12), color, hit, { embed: 0.3 + lift });
  };

  // cheeks: black outline then red disc, mirrored
  for (const s of [1, -1]) {
    seat(0.0135, 0.002, P.black, s * 80, -8);
    seat(0.012, 0.003, P.red, s * 80, -8, 0.05);
  }

  // eyes: stacked discs on front-sides
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 48, 14);
    if (!hit) continue;
    const layers: [number, string, number][] = [
      [0.0125, P.black, 0.3],
      [0.0105, P.white, -0.2],
      [0.006, P.black, -0.7],
      [0.0025, P.white, -1.2],
    ];
    let lift = 0;
    for (const [r, c] of layers) {
      lift += 0.0012;
      const h = hit.moved([0, lift, 0]);
      b.stick(new THREE.CylinderGeometry(r, r, 0.0012, 12), c, h, { embed: 0.2 });
    }
    // brow bar
    const brow = hit.moved([0, 0.002, 0]);
    b.stick(new THREE.BoxGeometry(0.02, 0.0016, 0.004), P.black, brow.moved([0, 0, 0.0145]), {
      embed: 0.2,
      spin: s * -18,
    });
  }

  // crest: blue half-disc on crown with black outline and red dot
  const crownY = HC[1] + R * 0.94;
  const semi = (r: number, n = 8): [number, number, string?][] => {
    const pts: any[] = [];
    for (let i = 0; i <= n; i++) {
      const a = (Math.PI * i) / n;
      pts.push([Math.cos(a) * r, Math.sin(a) * r * 1.0]);
    }
    return pts;
  };
  const crestAt = (z: number) => [0, crownY - 0.004, z];
  b.extrude(semi(0.0155), {
    at: crestAt(HC[2] - 0.004),
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.0015,
    color: P.black,
    bone: head,
  });
  // outline sits behind (more -x); use shifted extrudes along x thickness
  for (const [r, c, dx] of [
    [0.0165, P.black, -0.0035],
    [0.0145, P.blue, 0.0],
    [0.0165, P.black, 0.0035],
  ] as [number, string, number][]) {
    b.extrude(semi(r), {
      at: [dx, crownY - 0.005, HC[2] - 0.004],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.0025,
      color: c,
      bone: head,
    });
  }
  for (const s of [1, -1])
    disc(0.0055, 0.0014, P.red, [s * 0.00555, crownY + 0.006, HC[2] - 0.004], [1, 0, 0], head, 10);

  // beak: blue 4-sided pyramid
  const bb = M.beakBase;
  b.part(new THREE.ConeGeometry(0.014, 0.032, 4), P.blue, {
    bone: head,
    at: [bb[0], bb[1] + 0.001, bb[2] + 0.016],
    dir: [0, 0, 1],
  });
  // nostrils
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.0025, 6, 4), P.black, {
      bone: head,
      at: [s * 0.0055, bb[1] + 0.005, bb[2] + 0.009],
    });

  // lower beak wedge on jaw
  const jh = M.jawHinge;
  b.part(new THREE.ConeGeometry(0.011, 0.026, 4), P.blueDark, {
    bone: jaw,
    at: [jh[0], jh[1] - 0.0045, jh[2] + 0.025],
    dir: [0, 0, 1],
    scale: [1, 1, 0.55],
  });
  // mouth line
  b.part(new THREE.BoxGeometry(0.003, 0.0014, 0.028), P.black, {
    bone: head,
    at: [0, bb[1] - 0.002, bb[2] + 0.002],
  });

  // nape feather points
  const r2 = rng(5);
  for (let i = 0; i < 5; i++) {
    const az = 180 + (i - 2) * 22;
    const el = 20 + (i % 2) * 22 + r2() * 4;
    const hit = skin.around(HC).at(az, el);
    if (hit) b.stick(new THREE.ConeGeometry(0.0065, 0.016, 3), P.yellowDark, hit, { embed: 0.25 });
  }

  // neck collar
  const nb = M.neckBase;
  const cy = nb[1] + 0.003;
  const cz = nb[2] - 0.004;
  b.part(new THREE.CylinderGeometry(0.03, 0.033, 0.008, 12), P.white, { bone: neck, at: [0, cy, cz] });
  for (const dy of [0.0055, -0.0055])
    b.part(new THREE.CylinderGeometry(0.0315, 0.0315, 0.0016, 12), P.black, {
      bone: neck,
      at: [0, cy + dy, cz],
    });

  // red bib triangle on throat
  b.extrude(
    [
      [-0.011, 0],
      [0.011, 0],
      [0, -0.02, "sharp"],
    ],
    { at: [0, cy + 0.001, cz + 0.0345], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.002, color: P.red, bone: neck },
  );
  b.extrude(
    [
      [-0.0125, 0.0015],
      [0.0125, 0.0015],
      [0, -0.0225, "sharp"],
    ],
    { at: [0, cy + 0.001, cz + 0.0335], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.0015, color: P.black, bone: neck },
  );
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTorso({ b, J, P, M }: Ctx) {
  const C = M.bodyCenter;
  const R = [0.052, 0.05, 0.068];
  const hips = J.hips;
  const chest = J.chest;
  const r = rng(11);

  // Ellipsoid of the body: point on its surface for a direction.
  const surf = (dx: number, dy: number, dz: number, lift = 0): [number, number, number] => {
    const l = Math.hypot(dx / R[0], dy / R[1], dz / R[2]);
    const k = 1 / l;
    return [C[0] + dx * k, C[1] + dy * k, C[2] + dz * k].map((v, i) => v) as [number, number, number];
  };
  // Outward normal at a surface point.
  const nrm = (p: number[]) => {
    const n = new THREE.Vector3((p[0] - C[0]) / (R[0] * R[0]), (p[1] - C[1]) / (R[1] * R[1]), (p[2] - C[2]) / (R[2] * R[2]));
    return n.normalize();
  };
  // Place a geometry (axis +Y) on the surface along direction, lifted outward by 'lift'.
  const place = (geo: THREE.BufferGeometry, color: string, d: number[], lift: number, bone: any, extra: any = {}) => {
    const p = surf(d[0], d[1], d[2]);
    const n = nrm(p);
    const at = [p[0] + n.x * lift, p[1] + n.y * lift, p[2] + n.z * lift];
    return b.part(geo, color, { at, dir: [n.x, n.y, n.z], bone, ...extra });
  };
  // Flat shape facing out of surface (axis z)
  const flat = (geo: THREE.BufferGeometry, color: string, d: number[], lift: number, bone: any, up: number[] = [0, 1, 0]) => {
    const p = surf(d[0], d[1], d[2]);
    const n = nrm(p);
    return b.part(geo, color, {
      at: [p[0] + n.x * lift, p[1] + n.y * lift, p[2] + n.z * lift],
      dir: [n.x, n.y, n.z],
      axis: "z",
      up,
      bone,
    });
  };

  // Body: scaled low-poly sphere
  b.part(new THREE.SphereGeometry(1, 12, 8), P.red, { at: C, scale: R, bone: chest, flat: true });

  // Belly: off-white lower half-ellipsoid, slightly larger, front/underside
  b.part(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, Math.PI * 0.58, Math.PI * 0.42), P.white, {
    at: [C[0], C[1] - 0.004, C[2] + 0.004],
    scale: [R[0] * 1.012, R[1] * 1.02, R[2] * 1.012],
    bone: hips,
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(R[0] * 1.012, R[0] * 1.012, 0.0012, 12), P.black, {
    at: [C[0], C[1] - 0.0045 + 0.012, C[2] + 0.004],
    scale: [1, 1, R[2] / R[0]],
    bone: hips,
  });

  // Chest bib: black outline triangle then yellow triangle pointing down
  const tri = (w: number, h: number) =>
    new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-w / 2, h / 2), new THREE.Vector2(w / 2, h / 2), new THREE.Vector2(0, -h / 2)]), {
      depth: 0.002,
      bevelEnabled: false,
    });
  flat(tri(0.044, 0.05), P.black, [0, 0.01, 1], 0.001, chest);
  flat(tri(0.04, 0.046), P.yellow, [0, 0.01, 1], 0.0028, chest);

  // Breast ring bands (black) below the bib
  for (let i = 0; i < 3; i++) {
    const y = -0.014 - i * 0.011;
    const rr = Math.sqrt(Math.max(0, 1 - (y / R[1]) ** 2));
    const zc = C[2] + 0.012;
    b.part(new THREE.TorusGeometry(1, 0.0012, 4, 12, Math.PI * 0.9), P.black, {
      at: [C[0], C[1] + y, C[2] + 0.006 + 0.0],
      rotation: [90, 0, 0],
      scale: [R[0] * rr * 1.02, R[2] * rr * 1.02, 1],
      bone: chest,
    });
    void zc;
  }
  // Fix: torus above rotated lies horizontal, arc facing +? keep as thin ring; add small black bars as markers
  for (const s of [1, -1])
    place(new THREE.BoxGeometry(0.003, 0.004, 0.003), P.black, [s * 0.05, -0.016, 0.06], 0.001, chest);

  // Back saddle: overlapping blueDark rectangles along top
  for (let i = 0; i < 4; i++) {
    const z = -0.04 + i * 0.022;
    const g = new THREE.BoxGeometry(0.05 - i * 0.004, 0.003, 0.02);
    const p = surf(0, 1, z / R[2] * 0.9 > 0 ? 0 : 0);
    void p;
    const y = C[1] + R[1] * Math.sqrt(Math.max(0.01, 1 - (z / R[2]) ** 2));
    const slope = (z / R[2]) * (R[1] / R[2]);
    b.part(g, i % 2 ? P.blueDark : P.blue, {
      at: [0, y + 0.0012 + (i % 2) * 0.0008, z + C[2]],
      rotation: [(Math.atan(slope) * 180) / Math.PI, 0, 0],
      bone: chest,
    });
  }
  // black dividers between saddle and rump
  b.part(new THREE.BoxGeometry(0.056, 0.0025, 0.0025), P.black, { at: [0, 0.2185, -0.044], rotation: [-30, 0, 0], bone: hips });

  // Yellow rump patch above tail root
  const rp = surf(0, 0.55, -1);
  const rn = nrm(rp);
  b.part(new THREE.BoxGeometry(0.03, 0.002, 0.03), P.black, {
    at: [rp[0] + rn.x * 0.001, rp[1] + rn.y * 0.001, rp[2] + rn.z * 0.001],
    dir: [rn.x, rn.y, rn.z],
    bone: hips,
  });
  b.part(new THREE.BoxGeometry(0.027, 0.002, 0.027), P.yellow, {
    at: [rp[0] + rn.x * 0.0022, rp[1] + rn.y * 0.0022, rp[2] + rn.z * 0.0022],
    dir: [rn.x, rn.y, rn.z],
    bone: hips,
  });
  b.part(new THREE.BoxGeometry(0.056, 0.0025, 0.0025), P.black, {
    at: [rp[0] + rn.x * 0.001, rp[1] + rn.y * 0.001 + 0.0, rp[2] + 0.02],
    dir: [rn.x, rn.y, rn.z],
    bone: hips,
  });

  // Shoulder discs and thigh bumps, mirrored
  for (const s of [1, -1]) {
    const sh = M[s > 0 ? "shoulderL" : "shoulderR"];
    const d = [sh[0] - C[0], sh[1] - C[1], sh[2] - C[2]];
    flat(new THREE.CylinderGeometry(0.0155, 0.0155, 0.0015, 10).rotateX(Math.PI / 2), P.black, d, 0.0005, chest);
    flat(new THREE.CylinderGeometry(0.014, 0.014, 0.0015, 10).rotateX(Math.PI / 2), P.blue, d, 0.0015, chest);

    const hp = M[s > 0 ? "hipSocketL" : "hipSocketR"];
    b.part(new THREE.SphereGeometry(0.014, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.red, {
      at: [hp[0], hp[1] + 0.004, hp[2]],
      rotation: [180, 0, 0],
      scale: [1, 0.8, 1.2],
      bone: hips,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.0145, 8, 3, 0, Math.PI * 2, Math.PI / 2 - 0.12, 0.12), P.black, {
      at: [hp[0], hp[1] + 0.004, hp[2]],
      scale: [1, 0.8, 1.2],
      bone: hips,
    });
  }
}
```