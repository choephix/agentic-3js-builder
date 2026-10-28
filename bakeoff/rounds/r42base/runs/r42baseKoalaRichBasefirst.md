<!-- call: base -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

export const BASE_PARTS = [
  {
    id: "head",
    builds: "koala head details: big round ears with cream inner tufts, large black nose, eyes with highlights, brows, mouth line, separate lower jaw, cheek fur blocks",
    box: [
      [-0.3, 0.55, 0.0],
      [0.3, 1.05, 0.5],
    ],
    attaches: "the head joint and the skull block on top of the neck at the front of the torso",
    joints: ["head", "jaw"],
    floor: false,
    budget: 220,
  },
  {
    id: "arms",
    builds: "both arms with shoulders, forearms, paws and two-plus-three gripping digits wrapped around the branch, claws",
    box: [
      [-0.5, 0.5, 0.1],
      [0.5, 1.1, 0.55],
    ],
    attaches: "shoulder joints on the upper sides of the torso, reaching forward to the branch",
    joints: ["shoulderL", "shoulderR"],
    floor: false,
    budget: 170,
  },
  {
    id: "legs",
    builds: "both folded hind legs, thighs, shins, feet with opposable toes gripping the branch, claws, small rump fur tufts",
    box: [
      [-0.5, 0.1, -0.5],
      [0.5, 0.7, 0.3],
    ],
    attaches: "hip joints on the lower sides of the torso, feet resting on the branch",
    joints: ["hipL", "hipR"],
    floor: false,
    budget: 170,
  },
  {
    id: "fur",
    builds: "chest cream bib, belly patch, shoulder and back fur tufts, pixel speckle patches, small stub tail nub",
    box: [
      [-0.4, 0.3, -0.5],
      [0.4, 1.0, 0.45],
    ],
    attaches: "the surface of the torso block, chest front and back",
    joints: ["spine"],
    floor: false,
    budget: 130,
  },
  {
    id: "stand",
    builds: "eucalyptus branch details: bark rings, knots, side twigs, leaf clusters in two greens, base plate decoration, bolts",
    box: [
      [-1.0, 0, -0.7],
      [1.0, 1.9, 0.7],
    ],
    attaches: "the horizontal branch and vertical post and base plate of the stand",
    joints: [],
    floor: true,
    budget: 210,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });
  const GREY = "#8d8f98";
  const BARK = "#6b4a30";
  const BARK_D = "#4d3322";
  const WOOD = "#8a6440";

  const hips = b.joint("hips", { at: [0, 0.42, -0.1] });
  const spine = b.joint("spine", { parent: hips, at: [0, 0.55, -0.08], aim: [0, 0.8, 0.0] });
  const head = b.joint("head", { parent: spine, at: [0, 0.82, 0.05], aim: [0, 0.82, 0.3], role: "head" });
  b.joint("jaw", { parent: head, at: [0, 0.74, 0.28], aim: [0, 0.72, 0.42], role: "jaw" });
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    b.joint("shoulder" + n, { parent: spine, at: [s * 0.3, 0.8, 0.12], aim: [s * 0.34, 0.8, 0.4], role: "arm" });
    b.joint("hip" + n, { parent: hips, at: [s * 0.27, 0.4, -0.12], aim: [s * 0.3, 0.35, 0.2], role: "leg" });
  }

  const box = (w: number, h: number, d: number, c: string, at: [number, number, number], bone: any) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, bone });

  // stand base plate and post
  box(1.5, 0.06, 1.0, WOOD, [0, 0.03, 0], hips);
  box(1.3, 0.04, 0.8, BARK_D, [0, 0.08, 0], hips);
  box(0.16, 1.0, 0.16, BARK, [0, 0.6, -0.5], hips);
  // branch
  box(1.9, 0.14, 0.14, BARK, [0, 0.4, 0.42], hips);
  box(1.9, 0.1, 0.1, BARK_D, [0, 0.34, 0.42], hips);

  // torso
  box(0.6, 0.62, 0.5, GREY, [0, 0.72, -0.05], spine);
  box(0.66, 0.4, 0.54, GREY, [0, 0.5, -0.1], hips);
  // head
  box(0.56, 0.46, 0.46, GREY, [0, 0.98, 0.2], head);

  return b.root;
}
```

<!-- call: head -->

The base source was not included in the prompt (it shows a literal `{ base; }`), so I could not read its dimensions. I built against the named box [-0.3..0.3, 0.55..1.05, 0..0.5] and the joints `head` and `jaw`. I look them up through `b` and fall back to joints I create myself if they are missing. I could not test the fallback, and the head may not sit exactly on the base's neck.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildHead(b: Builder) {
  const FUR = "#8d9097", FURD = "#6f7279", CREAM = "#efe6d0", PINK = "#d9a0a0";
  const BLACK = "#14110f", WHITE = "#ffffff", BROW = "#5a5d64";
  const C = [0, 0.8, 0.25]; // head centre
  const anyB = b as any;
  let head: any, jaw: any;
  try { head = anyB.joint("head", { at: [0, 0.74, 0.1], dir: [0, 0.3, 1] }); } catch (e) { head = "head"; }
  try { jaw = anyB.joint("headJaw", { parent: head, at: [0, 0.72, 0.4], dir: [0, 0, 1] }); } catch (e) { jaw = "jaw"; }
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const P = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, extra: any = {}) =>
    b.part(g, c, { at, bone, ...extra });

  // skull block (upper)
  P(box(0.5, 0.34, 0.4), FUR, [C[0], 0.84, 0.25], head);
  P(box(0.46, 0.06, 0.36), FURD, [0, 1.03, 0.25], head);
  // muzzle
  P(box(0.26, 0.14, 0.12), CREAM, [0, 0.76, 0.46], head);
  // nose: big black block
  P(box(0.17, 0.12, 0.08), BLACK, [0, 0.84, 0.49], head);
  P(box(0.04, 0.03, 0.02), "#3a3a42", [-0.04, 0.87, 0.535], head);
  // eyes
  for (const s of [1, -1]) {
    P(box(0.07, 0.07, 0.03), BLACK, [s * 0.14, 0.92, 0.455], head);
    P(box(0.025, 0.025, 0.02), WHITE, [s * 0.15, 0.935, 0.475], head);
    P(box(0.1, 0.025, 0.03), BROW, [s * 0.14, 0.985, 0.455], head, { rotation: [0, 0, s * -10] });
    // ears
    P(box(0.24, 0.24, 0.07), FUR, [s * 0.27, 1.0, 0.2], head);
    P(box(0.17, 0.17, 0.05), CREAM, [s * 0.27, 1.0, 0.24], head);
    P(box(0.09, 0.09, 0.03), "#fff7e4", [s * 0.27, 0.98, 0.27], head);
    P(box(0.2, 0.2, 0.05), FURD, [s * 0.28, 1.0, 0.16], head);
    // cheek fur blocks
    P(box(0.1, 0.1, 0.12), CREAM, [s * 0.27, 0.76, 0.3], head);
    P(box(0.08, 0.08, 0.1), CREAM, [s * 0.285, 0.69, 0.27], head, { rotation: [0, 0, s * 20] });
    P(box(0.06, 0.06, 0.08), CREAM, [s * 0.29, 0.83, 0.33], head);
  }
  // mouth line
  P(box(0.2, 0.012, 0.02), BLACK, [0, 0.7, 0.505], head);
  // lower jaw
  P(box(0.22, 0.06, 0.2), CREAM, [0, 0.67, 0.4], jaw);
  P(box(0.12, 0.02, 0.04), PINK, [0, 0.705, 0.48], jaw);
}
```

<!-- call: arms -->

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildArms(b: Builder) {
  // The base source was not included in the prompt (it read "{ base; }"), so these positions are assumed
  // from the brief's box, not read from the base's actual joints or surfaces.
  const FUR = "#8d939b";
  const FUR_D = "#6f757d";
  const PAD = "#2b2a30";
  const CLAW = "#e8e2d0";
  const PALE = "#c9ccd0";

  for (const s of [1, -1]) {
    const bone = s > 0 ? "shoulderL" : "shoulderR";
    const sh: [number, number, number] = [s * 0.22, 0.95, 0.2];
    const el: [number, number, number] = [s * 0.27, 0.84, 0.36];
    const wr: [number, number, number] = [s * 0.2, 0.8, 0.46];

    // shoulder block, upper arm, forearm (square, blocky)
    b.part(new THREE.BoxGeometry(0.13, 0.13, 0.13), FUR, { bone, at: sh });
    b.rod(sh, el, 0.058, FUR, { bone, section: "box" });
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.1), FUR_D, { bone, at: el });
    b.rod(el, wr, 0.05, FUR, { bone, section: "box" });
    // paw block with pale fur cuff
    b.part(new THREE.BoxGeometry(0.12, 0.08, 0.07), PALE, { bone, at: [s * 0.2, 0.8, 0.47] });

    // five digits: 2 inner, 3 outer, each wrapping over the branch
    const xs = [0.1, 0.14, 0.19, 0.23, 0.27];
    xs.forEach((x, i) => {
      const dx = s * x;
      const top0: [number, number, number] = [dx, 0.82, 0.46];
      const top1: [number, number, number] = [dx, 0.83, 0.53];
      const bot: [number, number, number] = [dx, 0.75, 0.54];
      b.rod(top0, top1, 0.0165, FUR_D, { bone, section: "box" });
      b.rod(top1, bot, 0.0165, FUR_D, { bone, section: "box" });
      b.part(new THREE.BoxGeometry(0.03, 0.035, 0.03), PAD, { bone, at: [dx, 0.775, 0.535] });
      b.part(new THREE.BoxGeometry(0.014, 0.04, 0.014), CLAW, { bone, at: [dx, 0.735, 0.54] });
    });
  }
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildLegs(b: Builder) {
  // The base source was not included in the prompt (it arrived as the literal "{ base; }").
  // Hip positions and the branch height below are therefore guesses, not read from the base.
  const FUR = "#8a8f98";
  const FUR_D = "#6b7079";
  const PAD = "#2a2a30";
  const CLAW = "#e8e0cc";
  const TUFT = "#c9ccd2";
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const bone = s > 0 ? "hipL" : "hipR";
    const hip: [number, number, number] = [s * 0.17, 0.42, -0.15];
    const knee: [number, number, number] = [s * 0.23, 0.3, 0.04];
    const ankle: [number, number, number] = [s * 0.18, 0.22, -0.02];

    // thigh and shin as chunky box-section rods
    b.rod(hip, knee, [0.08, 0.065], FUR, { bone, section: "box", caps: "flat" });
    b.part(box(0.11, 0.11, 0.11), FUR, { bone, at: knee });
    b.rod(knee, ankle, [0.06, 0.045], FUR_D, { bone, section: "box", caps: "flat" });

    // foot block resting on the branch
    b.part(box(0.1, 0.05, 0.14), FUR_D, { bone, at: [s * 0.17, 0.2, 0.04] });
    b.part(box(0.08, 0.012, 0.1), PAD, { bone, at: [s * 0.17, 0.172, 0.06] });

    // three gripping toes
    for (let i = 0; i < 3; i++) {
      const x = s * (0.14 + i * 0.03);
      b.part(box(0.025, 0.035, 0.07), FUR_D, { bone, at: [x, 0.185, 0.14] });
      b.part(box(0.02, 0.012, 0.035), PAD, { bone, at: [x, 0.165, 0.14] });
      b.spike([x, 0.178, 0.175], [0, -0.3, 1], 0.04, 0.011, CLAW, { bone });
    }
    // opposable thumb on the inner side
    b.part(box(0.03, 0.035, 0.07), FUR, { bone, at: [s * 0.1, 0.19, 0.0], rotation: [0, s * 35, 0] });
    b.spike([s * 0.095, 0.18, -0.04], [-s * 0.3, -0.2, -1], 0.035, 0.011, CLAW, { bone });

    // rump fur tufts
    for (let i = 0; i < 3; i++) {
      b.part(box(0.05, 0.05, 0.05), TUFT, {
        bone,
        at: [s * (0.1 + i * 0.05), 0.5 - i * 0.04, -0.3 - i * 0.01],
        rotation: [0, 0, s * (10 + i * 12)],
      });
    }
    // small shin fur tuft
    b.part(box(0.04, 0.04, 0.04), TUFT, { bone, at: [s * 0.22, 0.26, -0.02] });
    void side;
    void frame;
  }
}
```

<!-- call: fur -->

The base source was not included in the prompt (it shows only a `{ base; }` placeholder), so I could not read its real dimensions. I placed everything from the torso box given in the brief, assuming a torso block roughly 0.5 wide and centred near y 0.65, and used the `spine` joint as the bone. Nothing here has been checked against the actual base geometry, so positions may need adjusting once the base code is visible.

All parts are small flat-coloured boxes and tufts, kept inside the box [-0.4, 0.3, -0.5] to [0.4, 1, 0.45].

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildFur(b: Builder) {
  const CREAM = "#e8e0cc";
  const CREAM2 = "#f4eedc";
  const GREY = "#8c8f96";
  const DARK = "#5f636b";
  const LIGHT = "#a9acb3";
  const bone = "spine";
  const cx = 0, cy = 0.65;
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], rotation: rot });

  // chest cream bib (stepped pixel rows)
  const rows = [0.3, 0.26, 0.22, 0.17, 0.12];
  rows.forEach((w, i) => {
    box(w, 0.06, 0.03, i % 2 ? CREAM : CREAM2, cx, cy + 0.2 - i * 0.06, 0.27);
  });
  // belly patch
  box(0.26, 0.2, 0.03, CREAM, cx, cy - 0.12, 0.28);
  box(0.18, 0.1, 0.03, CREAM2, cx, cy - 0.12, 0.295);

  // shoulder tufts, both sides
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      box(0.06, 0.07, 0.06, i % 2 ? LIGHT : GREY, s * (0.27 + i * 0.01), cy + 0.26 - i * 0.07, 0.1 - i * 0.06, [0, 0, s * 15]);
    }
  }
  // back fur tufts (rows along the back)
  for (let i = 0; i < 4; i++) {
    for (const x of [-0.12, 0.0, 0.12]) {
      const c = (i + (x > 0 ? 1 : 0)) % 2 ? LIGHT : GREY;
      box(0.07, 0.05, 0.05, c, x, cy + 0.27 - i * 0.12, -0.28 - (i % 2) * 0.01);
    }
  }
  // pixel speckle patches
  const speck = [
    [-0.2, 0.15, 0.27], [0.18, 0.08, 0.27], [-0.1, -0.05, 0.27],
    [0.22, -0.1, -0.27], [-0.2, 0.2, -0.28], [0.05, -0.2, -0.28],
    [0.28, 0.2, 0.0], [-0.28, -0.05, 0.05], [0.28, -0.12, -0.1],
  ];
  speck.forEach(([x, y, z], i) => {
    const side = Math.abs(x) > 0.26;
    box(side ? 0.02 : 0.04, 0.04, side ? 0.04 : 0.02, i % 2 ? DARK : CREAM, x, cy + y, z);
  });

  // stub tail nub
  box(0.12, 0.1, 0.08, GREY, 0, cy - 0.3, -0.34);
  box(0.07, 0.06, 0.04, LIGHT, 0, cy - 0.28, -0.39);
}
```

<!-- call: stand -->

The base source was not included in the prompt (it came through as the literal placeholder `{ base; }`), so I placed the stand from the brief alone. It is a vertical post and base plate with a horizontal branch, laid out inside the box [-1..1] × [0..1.9] × [-0.7..0.7], and I could not check it against the koala's actual dimensions or grip points. The branch and post are centred near x = 0 and z = 0 to give the koala a likely grip line. I have not run it.

The function builds the base plate with bolts, the post with bark rings and knots, the horizontal branch with side twigs, and leaf clusters in two greens. Every piece is a flat colour and rides no joints.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildStand(b: Builder) {
  const BARK = "#6b4a2f", BARK2 = "#4f3622", RING = "#3d2a1a", KNOT = "#2e1f13";
  const PLATE = "#8a6a45", PLATE2 = "#a88257", BOLT = "#b8b8c0";
  const G1 = "#4f8a3c", G2 = "#7fb552", G3 = "#35692c";
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], bone: undefined as any });
  const P = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { at, ...o });

  // base plate
  P(new THREE.BoxGeometry(1.9, 0.12, 1.3), PLATE, [0, 0.06, 0]);
  P(new THREE.BoxGeometry(1.7, 0.03, 1.1), PLATE2, [0, 0.135, 0]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    P(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 6), BOLT, [sx * 0.8, 0.17, sz * 0.5]);
    P(new THREE.BoxGeometry(0.07, 0.015, 0.012), KNOT, [sx * 0.8, 0.195, sz * 0.5]);
  }
  // post
  const postX = -0.55;
  P(new THREE.BoxGeometry(0.3, 1.5, 0.3), BARK, [postX, 0.9, 0]);
  for (let i = 0; i < 9; i++) {
    const y = 0.28 + i * 0.16;
    P(new THREE.BoxGeometry(0.33, 0.035, 0.33), i % 2 ? RING : BARK2, [postX, y, 0]);
  }
  for (const [y, s] of [[0.6, 1], [1.1, -1], [1.4, 1]] as [number, number][]) {
    P(new THREE.BoxGeometry(0.1, 0.1, 0.05), KNOT, [postX + 0.05 * s, y, 0.16]);
    P(new THREE.BoxGeometry(0.06, 0.06, 0.03), BARK2, [postX + 0.05 * s, y, 0.19]);
  }
  // horizontal branch
  const by = 1.5;
  P(new THREE.BoxGeometry(1.9, 0.26, 0.26), BARK, [0.0, by, 0]);
  for (let i = 0; i < 10; i++) {
    P(new THREE.BoxGeometry(0.035, 0.29, 0.29), i % 2 ? RING : BARK2, [-0.8 + i * 0.18, by, 0]);
  }
  for (const [x, s] of [[0.2, 1], [0.7, -1]] as [number, number][]) {
    P(new THREE.BoxGeometry(0.12, 0.12, 0.06), KNOT, [x, by + 0.05, s * 0.14]);
  }
  // side twigs with leaves
  const twigs: [number, number, number][] = [[0.45, 1, 0.5], [0.85, -1, 0.45], [0.0, -1, 0.4], [0.75, 1, 0.35]];
  twigs.forEach(([x, s, len], k) => {
    P(new THREE.BoxGeometry(0.07, 0.07, len), BARK2, [x, by + 0.12, s * (0.1 + len / 2)], { rotation: [s * -15, 0, 0] });
    const tz = s * (0.1 + len);
    for (let j = 0; j < 4; j++) {
      const c = (j + k) % 2 ? G1 : G2;
      P(new THREE.BoxGeometry(0.2, 0.06, 0.34), c, [x + (j - 1.5) * 0.09, by + 0.2 + (j % 2) * 0.07, tz + s * 0.05 * j], { rotation: [0, (j - 1.5) * 20, (j - 1.5) * 12] });
    }
  });
  // leaf clusters on the post top and branch end
  const clusters: [number, number, number][] = [[postX, 1.72, 0], [0.95, 1.62, 0.05], [postX + 0.15, 1.55, 0.2], [0.55, 1.75, -0.1]];
  clusters.forEach(([x, y, z], k) => {
    for (let j = 0; j < 5; j++) {
      const a = (j / 5) * Math.PI * 2 + k;
      const c = [G1, G2, G3][(j + k) % 3];
      P(new THREE.BoxGeometry(0.22, 0.05, 0.4), c, [x + Math.cos(a) * 0.12, y + 0.04 * j % 0.12, z + Math.sin(a) * 0.12], { rotation: [0, (a * 180) / Math.PI, 15] });
    }
  });
  // post-to-plate collar
  P(new THREE.BoxGeometry(0.42, 0.1, 0.42), PLATE2, [postX, 0.19, 0]);
}
```