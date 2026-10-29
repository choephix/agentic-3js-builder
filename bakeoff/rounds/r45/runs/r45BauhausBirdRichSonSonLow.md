<!-- call: plan -->

```json
{
  "name": "Bauhaus Songbird",
  "description": "A small perching songbird assembled from primitive geometry in Bauhaus primary colours (red sphere body, blue head, yellow triangle beak and wings), sitting on a black geometric branch with a block trunk.",
  "builderName": "bauhausSongbird",
  "size": [0.6, 0.43, 0.3],
  "layout": "Real songbird scale: about 0.30 m from beak tip (z +0.118) to tail tip (z -0.18), head top at y 0.425. The branch is a horizontal black limb along X (x -0.30..0.30, axis y 0.20, radius 0.02, top y 0.22, z 0) with a square trunk post at x -0.24 standing on a flat base plate on y = 0. The bird perches centred at x 0, faces +Z, perpendicular to the branch. From front to back: small yellow beak, a round blue head sphere, a red egg-shaped body, a cream round belly disc on the chest, yellow triangular wings folded along the flanks, and a long flat blue tail slanting down and back with red and yellow bars. Two thin black legs (tarsus) drop from the body and the toes grip the branch top (3 front toes, 1 back toe, each resting at y about 0.224-0.23). Bauhaus language: every form is a pure primitive (sphere, 3-4 sided cone, box, disc, triangle extrude) with hard flat colour. Primary red, yellow, blue plus black and cream. Facets stay visible (low segment counts, 6-10 around). The composition repeats circle / triangle / square: circle = body, head, eyes, cheek discs; triangle = beak, wings, tail tip, branch leaves; square = trunk, base, tail bars. Details (eye rings, wing bars, belly disc, feather stripes) are small separate parts in their own colours seated on the surfaces.",
  "palette": {
    "red": "#d9261c",
    "redDeep": "#a31a14",
    "yellow": "#f5c400",
    "yellowPale": "#ffe27a",
    "blue": "#1f4fa6",
    "navy": "#14316b",
    "black": "#16161a",
    "charcoal": "#2e2e33",
    "cream": "#f2ead6",
    "white": "#fbf8ee"
  },
  "mounts": {
    "floorOrigin": [0, 0, 0],
    "perchTop": [0, 0.22, 0],
    "branchAxis": [0, 0.2, 0],
    "trunkTop": [-0.24, 0.2, 0],
    "footL": [0.022, 0.226, 0],
    "footR": [-0.022, 0.226, 0],
    "hipL": [0.024, 0.272, -0.005],
    "hipR": [-0.024, 0.272, -0.005],
    "bodyCenter": [0, 0.305, -0.01],
    "bellyFront": [0, 0.29, 0.05],
    "shoulderL": [0.044, 0.335, 0.025],
    "shoulderR": [-0.044, 0.335, 0.025],
    "neckBase": [0, 0.345, 0.035],
    "headCenter": [0, 0.388, 0.05],
    "jawHinge": [0, 0.378, 0.07],
    "beakBase": [0, 0.378, 0.083],
    "beakTip": [0, 0.372, 0.118],
    "tailRoot": [0, 0.3, -0.055],
    "tailTip": [0, 0.25, -0.18]
  },
  "joints": [
    { "name": "root", "at": [0, 0, 0], "dir": [0, 1, 0] },
    { "name": "body", "parent": "root", "at": [0, 0.305, -0.01], "dir": [0, 0, 1], "role": "spine" },
    { "name": "neck", "parent": "body", "at": [0, 0.345, 0.035], "dir": [0, 0.5, 1], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 0.375, 0.05], "dir": [0, 0, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 0.378, 0.07], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "tail1", "parent": "body", "at": [0, 0.3, -0.055], "dir": [0, -0.25, -1], "role": "tail", "group": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 0.28, -0.115], "dir": [0, -0.3, -1], "role": "tail", "group": "tail" },
    { "name": "wingL", "parent": "body", "at": [0.044, 0.335, 0.025], "dir": [0.1, -0.25, -1], "role": "wing", "group": "wings" },
    { "name": "wingL2", "parent": "wingL", "at": [0.052, 0.31, -0.04], "dir": [0.05, -0.2, -1], "role": "wing", "group": "wings" },
    { "name": "wingR", "parent": "body", "at": [-0.044, 0.335, 0.025], "dir": [-0.1, -0.25, -1], "role": "wing", "group": "wings" },
    { "name": "wingR2", "parent": "wingR", "at": [-0.052, 0.31, -0.04], "dir": [-0.05, -0.2, -1], "role": "wing", "group": "wings" },
    { "name": "hipL", "parent": "body", "at": [0.024, 0.272, -0.005], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "ankleL", "parent": "hipL", "at": [0.022, 0.228, 0], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "toeL1", "parent": "ankleL", "at": [0.022, 0.228, 0], "dir": [0.15, -0.1, 1], "role": "digit", "group": "legs" },
    { "name": "toeL2", "parent": "ankleL", "at": [0.022, 0.228, 0], "dir": [-0.15, -0.1, 1], "role": "digit", "group": "legs" },
    { "name": "toeL3", "parent": "ankleL", "at": [0.022, 0.228, 0], "dir": [0, -0.1, -1], "role": "digit", "group": "legs" },
    { "name": "hipR", "parent": "body", "at": [-0.024, 0.272, -0.005], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "ankleR", "parent": "hipR", "at": [-0.022, 0.228, 0], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "toeR1", "parent": "ankleR", "at": [-0.022, 0.228, 0], "dir": [-0.15, -0.1, 1], "role": "digit", "group": "legs" },
    { "name": "toeR2", "parent": "ankleR", "at": [-0.022, 0.228, 0], "dir": [0.15, -0.1, 1], "role": "digit", "group": "legs" },
    { "name": "toeR3", "parent": "ankleR", "at": [-0.022, 0.228, 0], "dir": [0, -0.1, -1], "role": "digit", "group": "legs" }
  ],
  "parts": [
    {
      "id": "perch",
      "builds": "The branch and its stand, all on joint root. A flat square base plate (cream, about 0.12 x 0.012 x 0.12 at x -0.24) on the floor; a square trunk post (black, 0.04 x 0.04, y 0.012..0.2) at x -0.24; the main horizontal branch as an 8-sided black rod/sweep from x -0.30 to x 0.30 along y 0.20, z 0, radius 0.02 (top at y 0.22, so the bird's feet rest on it), with a slight taper to 0.015 at the +x end. Bauhaus decoration: three cream ring bands (thin discs/rods) around the branch at x -0.15, 0.15, 0.24 (not under the bird, clear of |x| < 0.06); a red flat disc and a yellow triangle extrude as leaf motifs on short charcoal twig rods at the +x end and near the trunk, rising no higher than y 0.30 and staying at |x| > 0.12; a blue small cube knot on the trunk; a yellow cap triangle or disc on the branch's cut end at x 0.30 and a red disc on the -x end. No bird anatomy. Nothing at |x| < 0.06 above y 0.225.",
      "box": [[-0.3, 0, -0.08], [0.3, 0.3, 0.08]],
      "attaches": "Branch top at perchTop (y 0.22) carries the feet at footL/footR. Stand on floorOrigin.",
      "joints": ["root"],
      "floor": true,
      "budget": 180
    },
    {
      "id": "torso",
      "builds": "Body and tail. Red egg-shaped body: sphere scaled to radii x 0.045, y 0.048, z 0.065 at bodyCenter (about 10 x 7 segments, faceted), on joint body. Cream round belly disc/half-sphere seated on the front-lower chest around bellyFront (radius ~0.032, flattened), plus a thin yellow ring disc around it. Blue back saddle: a flattened blue cap over the upper back (a squashed sphere or lathe cap hugging the body top, y up to 0.353), with 3 small yellow triangle chevrons or discs on it as Bauhaus pattern. A small redDeep rump wedge near tailRoot. Tail: a long flat blue tail built as a few overlapping flat boxes/extruded rectangles fanned slightly (centre feather plus two side feathers, thickness 0.004, width about 0.03 total, length from tailRoot to tailTip z -0.18, slanting down to y 0.25) riding tail1/tail2; red and yellow square bar stripes across it (thin boxes in their own colour, seated on top), a yellow triangle tip. Navy undertail coverts block below tail root. The body stays clear of the head sphere (neck mount at neckBase) and leaves room for wings on the flanks (x +-0.043..0.06) and legs at hipL/hipR.",
      "box": [[-0.05, 0.245, -0.18], [0.05, 0.357, 0.06]],
      "attaches": "Neck at neckBase, wings at shoulderL/shoulderR, legs at hipL/hipR, tail begins at tailRoot (joint tail1). Everything else rides body / tail1 / tail2.",
      "joints": ["body", "tail1", "tail2"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "head",
      "builds": "Neck, head and beak, the face settled first. Blue head sphere radius 0.036 centred at headCenter (about 10 x 8 segments) on joint head, with a short blue neck collar cylinder/sphere linking neckBase to the head on joint neck. Eyes: on each side at about x +-0.027, y 0.395, z 0.07, a white disc (radius 0.0095), black ring behind, a black pupil disc (0.0055) in front and a tiny white highlight; discs face outward-forward and sit proud of the head sphere surface by about 1 mm. Red round cheek disc (radius 0.012) below and behind each eye. Yellow triangle brow wedge or crown: a small yellow extruded triangle on top of the head (crest) plus a thin black stripe across the crown. Beak: upper beak a yellow 4-sided cone (radius 0.014 base at beakBase, tip at beakTip, slightly flattened vertically) on joint head; lower beak a smaller, shorter yellowPale 4-sided cone below it on joint jaw (hinge jawHinge), a thin gap/black mouth line (thin dark box) between them. Two tiny black nostril dots on the upper beak. Nothing in front of the face. Cream chin/throat disc under the beak on the head.",
      "box": [[-0.04, 0.335, 0.01], [0.04, 0.428, 0.12]],
      "attaches": "Neck base meets the torso at neckBase; head sphere centre headCenter; jaw hinges at jawHinge; beak starts at beakBase and ends at beakTip.",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 180
    },
    {
      "id": "wings",
      "builds": "Left and right wings (mirror with +x = left), folded against the flanks but slightly separate from the body. Each wing: a yellow main triangular extruded slab (thickness about 0.008, shoulder at shoulderL/R, broad at the front, pointing back to a tip near z -0.13, y about 0.27, x about +-0.058) on joint wingL/wingR, following the flank so its inner face sits at x about +-0.044..0.05 (just outside the body's side at those heights). Layered Bauhaus feather shapes on the outside face: a smaller blue triangle covert layer near the shoulder, a red disc/half-disc spot, 3 long thin primary strips (navy, blue, red) stacked towards the tip riding wingL2/wingR2 with slightly fanned angles, a thin black outline strip along the leading edge, and a white small square bar. Each wing is a clear assembly of 8-14 pieces. Wings stay inside x +-0.07 and do not touch the tail attachments or head.",
      "box": [[-0.07, 0.25, -0.14], [0.07, 0.36, 0.05]],
      "attaches": "Roots at shoulderL / shoulderR on the body flanks; tips trail towards tailRoot's side, beside the tail.",
      "joints": ["wingL", "wingL2", "wingR", "wingR2"],
      "floor": false,
      "budget": 160
    },
    {
      "id": "legs",
      "builds": "Both legs and feet. Each leg: a short feathered cream thigh tuft (small sphere/cone) at hipL/hipR just hiding the body underside, a thin black tarsus rod (radius 0.0035, 6 sides) from the hip down to the ankle at y 0.228 (x +-0.022), a small yellow ankle ball. Four toes per foot from the ankle: two front toes angled slightly apart forward (+z up to z +0.035) and one longer back toe (hallux) to z -0.022, each a thin black rod radius 0.003-0.004 with a small yellow claw tip (tiny cone) and a small black knuckle sphere; toes rest on the branch top, lying at y about 0.224-0.23 and curling down slightly at the ends, with bottoms touching but not deeper than y 0.221 (branch top 0.22). Left and right legs mirror in x.",
      "box": [[-0.04, 0.215, -0.03], [0.04, 0.285, 0.045]],
      "attaches": "Hips at hipL/hipR under the body; feet at footL/footR on the perchTop.",
      "joints": ["hipL", "ankleL", "toeL1", "toeL2", "toeL3", "hipR", "ankleR", "toeR1", "toeR2", "toeR3"],
      "floor": false,
      "budget": 100
    }
  ]
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: Ctx) {
  const BLACK = P.black, YEL = P.yellow, CREAM = P.cream;
  const r = rng(5);
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const hip = J["hip" + L], ank = J["ankle" + L];
    const hx = s * 0.024, ax = s * 0.022;
    // thigh tuft
    b.part(new THREE.SphereGeometry(0.014, 6, 5), CREAM, { bone: hip, at: [hx, 0.274, -0.005], scale: [1, 1.1, 1.2] });
    b.part(new THREE.ConeGeometry(0.011, 0.02, 6), CREAM, { bone: hip, at: [hx, 0.262, -0.008], dir: [0, -1, 0] });
    // tarsus
    b.rod([hx, 0.266, -0.005], [ax, 0.23, 0], 0.0035, BLACK, { bone: hip, sides: 6 });
    // ankle ball
    b.part(new THREE.SphereGeometry(0.0062, 6, 5), YEL, { bone: ank, at: [ax, 0.2285, 0] });
    // toes
    const toes = [
      { n: "1", dx: s * 0.006, z: 0.034, len: 0.0 },
      { n: "2", dx: -s * 0.006, z: 0.032, len: 0.0 },
      { n: "3", dx: 0, z: -0.022, len: 0.0 },
    ];
    toes.forEach((t, i) => {
      const bone = J["toe" + L + t.n];
      const mid: [number, number, number] = [ax + t.dx * 0.5, 0.2265, t.z * 0.55];
      const end: [number, number, number] = [ax + t.dx, 0.2245, t.z];
      const start: [number, number, number] = [ax, 0.228, 0];
      const rad = i === 2 ? 0.0036 : 0.0033;
      b.rod(start, mid, rad, BLACK, { bone, sides: 6 });
      b.rod(mid, end, rad, BLACK, { bone, sides: 6 });
      b.part(new THREE.SphereGeometry(0.0045, 5, 4), BLACK, { bone, at: mid });
      const d = new THREE.Vector3(end[0] - mid[0], -0.0015, end[2] - mid[2]).normalize();
      const tip: [number, number, number] = [end[0] + d.x * 0.004, 0.2245 - 0.0005, end[2] + d.z * 0.004];
      b.part(new THREE.ConeGeometry(0.0034, 0.008, 5), YEL, {
        bone,
        at: tip,
        dir: [d.x, d.y, d.z],
      });
    });
    r();
  }
}
```

<!-- call: wings -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildWings({ b, J, P, M }: Ctx) {
  const YEL = P.yellow, BLUE = P.blue, NAVY = P.navy, RED = P.red, BLK = P.black, WHT = P.white;
  const r = rng(5);

  for (const s of [1, -1]) {
    const main = s > 0 ? J.wingL : J.wingR;
    const tipJ = s > 0 ? J.wingL2 : J.wingR2;
    const X = 0.054 * s;
    // outline in side view: u runs along -z (back), v is up
    const face = (outline: [number, number][], z0: number, y0: number, x: number, th: number, color: string, bone: any) =>
      b.extrude(outline, { at: [x, y0, z0], x: [0, 0, -1], y: [0, 1, 0], thickness: th, color, bone });

    // main yellow slab: broad at the front, pointing back
    face([[0, 0.03], [0.02, -0.03], [0.1, -0.06], [0.155, -0.045], [0.06, 0.035]], 0.03, 0.31, X, 0.008, YEL, main);
    // black leading edge strip
    b.part(new THREE.BoxGeometry(0.004, 0.004, 0.07), BLK, {
      bone: main, at: [X + 0.005 * s, 0.343, -0.005], rotation: [-12, 0, 0],
    });
    // blue covert triangle near shoulder
    face([[0, 0.025], [0.0, -0.02], [0.06, -0.01]], 0.025, 0.318, X + 0.006 * s, 0.005, BLUE, main);
    // red half disc spot
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 8), RED, {
      bone: main, at: [X + 0.007 * s, 0.31, -0.03], dir: [s, 0, 0],
    });
    // white small square bar
    b.part(new THREE.BoxGeometry(0.003, 0.012, 0.012), WHT, {
      bone: main, at: [X + 0.007 * s, 0.322, -0.05],
    });
    // primaries riding the wing tip joint, fanned
    const cols = [NAVY, BLUE, RED];
    cols.forEach((c, i) => {
      const y = 0.298 - i * 0.012;
      const len = 0.075 - i * 0.008;
      const g = b.part(new THREE.BoxGeometry(0.005, 0.007, len), c, {
        bone: tipJ, at: [X + 0.005 * s, y, -0.07 - len / 2 + 0.02],
        rotation: [(i - 1) * 3, s * (i - 1) * 2, 0],
      });
      // tiny triangle tip on each primary
      b.part(new THREE.ConeGeometry(0.005, 0.012, 3), c, {
        bone: tipJ, at: [X + 0.005 * s, y, -0.07 - len + 0.014 - 0.006],
        rotation: [-90, 0, 0],
      });
    });
    // yellow tip dot on outer face
    b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.003, 6), YEL, {
      bone: tipJ, at: [X + 0.008 * s, 0.292, -0.11], dir: [s, 0, 0],
    });
  }
}
```

<!-- call: perch -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildPerch({ b, J, P, M }: Ctx) {
  const root = J.root;
  const BLACK = P.black, CHAR = P.charcoal, CREAM = P.cream, RED = P.red, YEL = P.yellow, BLUE = P.blue;
  const part = (g: THREE.BufferGeometry, c: string, at: [number, number, number], o: any = {}) =>
    b.part(g, c, { bone: root, at, flat: true, ...o });

  // base plate and trunk
  part(new THREE.BoxGeometry(0.12, 0.012, 0.12), CREAM, [-0.24, 0.006, 0]);
  part(new THREE.BoxGeometry(0.1, 0.004, 0.1), CHAR, [-0.24, 0.014, 0]);
  part(new THREE.BoxGeometry(0.04, 0.188, 0.04), BLACK, [-0.24, 0.106, 0]);
  // trunk bands and blue cube knot
  part(new THREE.BoxGeometry(0.046, 0.006, 0.046), CREAM, [-0.24, 0.05, 0]);
  part(new THREE.BoxGeometry(0.024, 0.024, 0.024), BLUE, [-0.24, 0.1, 0.026]);
  part(new THREE.BoxGeometry(0.012, 0.012, 0.004), YEL, [-0.24, 0.1, 0.04]);

  // main branch, tapered, 8 sided
  b.rod([-0.3, 0.2, 0], [0.3, 0.2, 0], [0.02, 0.015], BLACK, { bone: root, sides: 8, caps: "flat" } as any);

  // ring bands
  const bandR = (x: number) => 0.0205 - ((x + 0.3) / 0.6) * 0.0055 + 0.002;
  for (const x of [-0.15, 0.15, 0.24]) {
    part(new THREE.CylinderGeometry(bandR(x), bandR(x), 0.008, 8), CREAM, [x, 0.2, 0], { dir: [1, 0, 0] });
  }

  // end caps
  part(new THREE.CylinderGeometry(0.019, 0.019, 0.004, 10), RED, [-0.302, 0.2, 0], { dir: [1, 0, 0] });
  const cap = b.extrude([[-0.014, -0.012], [0.014, -0.012], [0, 0.014]], {
    at: [0.3, 0.2, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.004, color: YEL, bone: root,
  });

  // twigs with leaf motifs
  const twig = (x0: number, x1: number, y1: number, z1: number) => {
    b.rod([x0, 0.215, 0], [x1, y1, z1], 0.0035, CHAR, { bone: root, sides: 6 } as any);
  };
  // +x end: red disc
  twig(0.2, 0.22, 0.27, 0.03);
  part(new THREE.CylinderGeometry(0.022, 0.022, 0.005, 10), RED, [0.22, 0.282, 0.03], { dir: [0, 0, 1] });
  part(new THREE.CylinderGeometry(0.01, 0.01, 0.006, 8), CREAM, [0.22, 0.282, 0.0325], { dir: [0, 0, 1] });
  // +x end second twig: yellow triangle
  twig(0.27, 0.27, 0.26, -0.03);
  b.extrude([[-0.02, 0], [0.02, 0], [0, 0.034]], {
    at: [0.27, 0.262, -0.03], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.005, color: YEL, bone: root,
  });
  // near trunk: yellow triangle and red disc
  twig(-0.17, -0.15, 0.255, -0.035);
  b.extrude([[-0.02, 0], [0.02, 0], [0, 0.034]], {
    at: [-0.15, 0.256, -0.035], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.005, color: YEL, bone: root,
  });
  twig(-0.2, -0.19, 0.25, 0.03);
  part(new THREE.CylinderGeometry(0.016, 0.016, 0.005, 10), RED, [-0.19, 0.266, 0.03], { dir: [0, 0, 1] });
  part(new THREE.CylinderGeometry(0.007, 0.007, 0.006, 8), BLUE, [-0.19, 0.266, 0.0325], { dir: [0, 0, 1] });

  // small blue knots on branch
  part(new THREE.BoxGeometry(0.014, 0.014, 0.014), BLUE, [-0.1, 0.222, 0.0]);
  part(new THREE.BoxGeometry(0.01, 0.01, 0.01), RED, [0.1, 0.222, 0.0]);
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTorso({ b, J, P, M }: Ctx) {
  const body = J.body;
  const bc = M.bodyCenter;
  const R = rng(5);

  // Body: faceted egg
  b.part(new THREE.SphereGeometry(1, 10, 7), P.red, {
    bone: body, at: bc, scale: [0.045, 0.048, 0.065], flat: true,
  });

  // Belly disc on chest, facing forward-down
  const bf = M.bellyFront;
  const bellyDir: [number, number, number] = [0, -0.25, 1];
  b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.004, 10), P.yellow, {
    bone: body, at: [bf[0], bf[1] - 0.001, bf[2] - 0.004], dir: bellyDir, flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.031, 0.031, 0.007, 10), P.cream, {
    bone: body, at: [bf[0], bf[1] - 0.001, bf[2] - 0.002], dir: bellyDir, flat: true,
  });

  // Blue back saddle: flattened cap
  b.part(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.blue, {
    bone: body, at: [bc[0], bc[1] + 0.012, bc[2] - 0.006], scale: [0.04, 0.042, 0.058], flat: true,
  });

  // Yellow triangle chevrons on the saddle
  for (let i = 0; i < 3; i++) {
    const z = bc[2] + 0.02 - i * 0.02;
    const k = Math.sqrt(Math.max(0, 1 - Math.pow((z - bc[2] + 0.006) / 0.058, 2)));
    const y = bc[1] + 0.012 + 0.042 * k * 0.97;
    b.part(new THREE.ConeGeometry(0.008, 0.004, 3), P.yellow, {
      bone: body, at: [0, y, z], dir: [0, 1, -0.2], flat: true,
    });
  }

  // Redeep rump wedge
  b.part(new THREE.ConeGeometry(0.02, 0.04, 4), P.redDeep, {
    bone: body, at: [0, M.tailRoot[1] + 0.002, M.tailRoot[2] + 0.002], dir: [0, -0.2, -1], flat: true,
  });

  // Navy undertail coverts
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.04), P.navy, {
    bone: J.tail1, at: [0, 0.286, -0.07], rotation: [-8, 0, 0],
  });

  // Tail feathers: centre + two side feathers on tail1 / tail2
  const feather = (x: number, yaw: number, len: number, w: number, z0: number, bone: any, y0: number) => {
    const slope = -0.3;
    const cz = z0 - len / 2;
    const cy = y0 + slope * (len / 2) * 0.5;
    b.part(new THREE.BoxGeometry(w, 0.004, len), P.blue, {
      bone, at: [x, cy, cz], rotation: [-14, yaw, 0],
    });
  };
  feather(0, 0, 0.12, 0.018, -0.055, J.tail1, 0.295);
  feather(0.011, -6, 0.1, 0.012, -0.06, J.tail1, 0.294);
  feather(-0.011, 6, 0.1, 0.012, -0.06, J.tail1, 0.294);
  // Outer extension on tail2
  b.part(new THREE.BoxGeometry(0.018, 0.004, 0.05), P.navy, {
    bone: J.tail2, at: [0, 0.262, -0.152], rotation: [-14, 0, 0],
  });

  // Bars across tail (red / yellow)
  const bars: [number, string][] = [[-0.08, P.red], [-0.105, P.yellow], [-0.13, P.red], [-0.152, P.yellow]];
  bars.forEach(([z, c], i) => {
    const y = 0.3 - 0.0 + (z + 0.055) * 0.25 + 0.0035;
    b.part(new THREE.BoxGeometry(0.03, 0.002, 0.009), c, {
      bone: i < 2 ? J.tail1 : J.tail2, at: [0, y + 0.0, z], rotation: [-14, 0, 0],
    });
  });

  // Yellow triangle tip
  b.part(new THREE.ConeGeometry(0.016, 0.03, 3), P.yellow, {
    bone: J.tail2, at: [0, M.tailTip[1] + 0.002, M.tailTip[2] + 0.005], dir: [0, -0.2, -1], flat: true,
  });
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  const HC = M.headCenter;
  const R = 0.036;
  const v = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  // neck collar
  b.part(new THREE.SphereGeometry(0.03, 8, 6), P.blue, {
    bone: J.neck, at: v(0, 0.352, 0.038), scale: [1, 0.8, 1], flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.026, 0.03, 0.02, 8), P.navy, {
    bone: J.neck, at: v(0, 0.347, 0.036), flat: true,
  });

  // head
  b.part(new THREE.SphereGeometry(R, 10, 8), P.blue, { bone: J.head, at: HC, flat: true });

  // cream throat disc
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.003, 10), P.cream, {
    bone: J.head, at: v(0, 0.362, 0.07), dir: [0, -0.6, 0.8],
  });

  // eyes and cheeks
  for (const s of [1, -1]) {
    const out = new THREE.Vector3(s * 0.9, 0.1, 0.45).normalize();
    const place = (r: number, h: number, col: string, off: number, seg = 12) =>
      b.part(new THREE.CylinderGeometry(r, r, h, seg), col, {
        bone: J.head,
        at: v(s * 0.0275 + out.x * off, 0.395 + out.y * off, 0.068 + out.z * off),
        dir: [out.x, out.y, out.z],
      });
    place(0.0125, 0.0014, P.black, 0.0005);
    place(0.0095, 0.0014, P.white, 0.0017);
    place(0.0055, 0.0014, P.black, 0.0029);
    b.part(new THREE.CylinderGeometry(0.0018, 0.0018, 0.001, 6), P.white, {
      bone: J.head,
      at: v(s * 0.0275 + out.x * 0.0042 - s * 0.0005, 0.395 + out.y * 0.0042 + 0.0025, 0.068 + out.z * 0.0042 + 0.002),
      dir: [out.x, out.y, out.z],
    });
    // cheek
    const c = new THREE.Vector3(s * 0.9, -0.35, 0.1).normalize();
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.003, 10), P.red, {
      bone: J.head,
      at: v(s * 0.031, 0.375, 0.04),
      dir: [c.x, c.y, c.z],
    });
  }

  // crest triangle
  b.extrude(
    [[-0.012, 0], [0.012, 0], [0, 0.022, "sharp"]],
    { at: v(0, 0.419, 0.045), x: [0, 0, 1], y: [0, 1, 0], thickness: 0.006, color: P.yellow, bone: J.head },
  );
  // crown stripe
  b.part(new THREE.BoxGeometry(0.056, 0.0015, 0.005), P.black, {
    bone: J.head, at: v(0, 0.4235, 0.062), rotation: [0, 0, 0],
  });
  b.part(new THREE.BoxGeometry(0.052, 0.0015, 0.004), P.black, {
    bone: J.head, at: v(0, 0.4195, 0.03), rotation: [0, 0, 0],
  });

  // beak upper
  const bb = M.beakBase, bt = M.beakTip;
  b.part(new THREE.ConeGeometry(0.014, 0.036, 4), P.yellow, {
    bone: J.head,
    at: v(0, 0.3765, 0.1005),
    dir: [0, -0.15, 1],
    scale: [1, 1, 0.75],
    flat: true,
  });
  // nostrils
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.0020, 5, 4), P.black, { bone: J.head, at: v(s * 0.0045, 0.3835, 0.092) });

  // mouth line
  b.part(new THREE.BoxGeometry(0.014, 0.0012, 0.026), P.black, {
    bone: J.head, at: v(0, 0.3745, 0.098),
  });

  // lower beak
  b.part(new THREE.ConeGeometry(0.0105, 0.026, 4), P.yellowPale, {
    bone: J.jaw,
    at: v(0, 0.3715, 0.092),
    dir: [0, -0.1, 1],
    scale: [1, 1, 0.6],
    flat: true,
  });
}
```