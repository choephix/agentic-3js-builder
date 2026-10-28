<!-- call: plan -->

```json
{
  "name": "Alebrije Jaguar-Eagle",
  "description": "A Oaxacan alebrije painted-wood fantasy beast: a jaguar-bodied creature with a hooked eagle head and beak, spread feathered wings and a feather-fan tail, covered in dot, flower and leaf patterns in hot folk-art colours.",
  "builderName": "alebrijeJaguarEagle",
  "size": [3.9, 1.8, 3.1],
  "layout": "A jaguar-sized, long-bodied quadruped (about 1.6 m of torso) standing on four paws in a neutral rest pose, facing +Z. From the front (+Z): a hooked eagle beak (upper beak fixed to the head, lower beak on the jaw) at z about 1.45, a big round-eyed feathered head at y about 1.4, two round jaguar ears and a feather crest with a pair of banded horns on top, and a short thick neck with a feather ruff. Behind the neck sit the chest and torso (round, heavy, jaguar-shaped), then the hips and haunches. Wings spread straight out sideways at y about 1.3, each with an arm, a forearm, a hand and a fan of long flight feathers swept back, so the tip-to-tip span is about 3.9 m. Four sturdy legs, all separated and straight: the front legs are jaguar legs with round paws and ivory claws, the hind legs are jaguar thighs with eagle shins and talons, and they stand on y = 0. At the back is a long jaguar tail ending in a fan of feathers (z down to about -1.55), with a ridge of leaf-shaped spines along the spine. Style: painted wood. The base is chunky, faceted and blocky (low segment counts). Every surface is a flat colour, and the character comes from many small separate parts seated on the surface: rows and rings of dots (flattened spheres), jaguar rosettes drawn as a dark ring of dots around an orange or pink centre, stripes, leaf and flower motifs, zig-zag trim, and thin dark outlines. Colours are bright and unmixed and sit side by side with no shading. Warm orange and gold on top; cream, pink and turquoise on the belly and under the wings. The same motifs (dot rosette, five-petal flower, leaf) repeat on every part so the model reads as one painted piece.",
  "palette": {
    "jaguarOrange": "#f08a1c",
    "gold": "#ffc928",
    "ink": "#1b1220",
    "cream": "#fff0cf",
    "hotPink": "#e8348a",
    "turquoise": "#16b8b0",
    "cobalt": "#2b4fc4",
    "leafGreen": "#3fae3a",
    "lime": "#b6dc3a",
    "red": "#d8262b",
    "coral": "#ff6a4a",
    "purple": "#7a3ca8",
    "skyBlue": "#58b8f0",
    "beakYellow": "#ffb81c",
    "beakTip": "#e0561a",
    "eyeWhite": "#fff8e8",
    "claw": "#f4e8c8",
    "bareWood": "#d9a566"
  },
  "mounts": {
    "floorY": [0, 0, 0],
    "chestFront": [0, 0.85, 0.78],
    "neckBase": [0, 1.0, 0.6],
    "headPivot": [0, 1.4, 0.92],
    "jawPivot": [0, 1.36, 1.02],
    "beakTip": [0, 1.33, 1.45],
    "shoulderL": [0.3, 0.8, 0.5],
    "shoulderR": [-0.3, 0.8, 0.5],
    "hipL": [0.3, 0.85, -0.6],
    "hipR": [-0.3, 0.85, -0.6],
    "wingRootL": [0.3, 1.2, 0.32],
    "wingRootR": [-0.3, 1.2, 0.32],
    "dorsalStart": [0, 1.22, 0.55],
    "dorsalEnd": [0, 1.2, -0.7],
    "tailRoot": [0, 0.9, -0.8],
    "tailTip": [0, 0.9, -1.35],
    "pawContactFL": [0.3, 0, 0.62],
    "pawContactFR": [-0.3, 0, 0.62],
    "talonContactL": [0.3, 0, -0.55],
    "talonContactR": [-0.3, 0, -0.55]
  },
  "joints": [
    { "name": "hips", "at": [0, 0.9, -0.45], "dir": [0, 0, 1], "role": "spine" },
    { "name": "spine1", "parent": "hips", "at": [0, 0.92, -0.05], "dir": [0, 0, 1], "role": "spine" },
    { "name": "spine2", "parent": "spine1", "at": [0, 0.95, 0.3], "dir": [0, 0.1, 1], "role": "spine" },
    { "name": "neck1", "parent": "spine2", "at": [0, 1.0, 0.6], "dir": [0, 0.6, 0.6], "role": "neck", "group": "head" },
    { "name": "neck2", "parent": "neck1", "at": [0, 1.22, 0.78], "dir": [0, 0.6, 0.5], "role": "neck", "group": "head" },
    { "name": "head", "parent": "neck2", "at": [0, 1.4, 0.92], "dir": [0, 0, 1], "role": "head", "group": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.36, 1.02], "dir": [0, 0, 1], "role": "jaw", "group": "head" },

    { "name": "shoulderL", "parent": "spine2", "at": [0.3, 0.8, 0.5], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.3, 0.5, 0.45], "dir": [0, -1, 0.1], "role": "leg", "group": "legs" },
    { "name": "wristL", "parent": "elbowL", "at": [0.3, 0.2, 0.5], "dir": [0, -1, 0.2], "role": "leg", "group": "legs" },
    { "name": "pawL", "parent": "wristL", "at": [0.3, 0.06, 0.62], "dir": [0, 0, 1], "role": "leg", "group": "legs" },
    { "name": "shoulderR", "parent": "spine2", "at": [-0.3, 0.8, 0.5], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.3, 0.5, 0.45], "dir": [0, -1, 0.1], "role": "leg", "group": "legs" },
    { "name": "wristR", "parent": "elbowR", "at": [-0.3, 0.2, 0.5], "dir": [0, -1, 0.2], "role": "leg", "group": "legs" },
    { "name": "pawR", "parent": "wristR", "at": [-0.3, 0.06, 0.62], "dir": [0, 0, 1], "role": "leg", "group": "legs" },

    { "name": "hipL", "parent": "hips", "at": [0.3, 0.85, -0.6], "dir": [0, -1, 0.4], "role": "leg", "group": "legs" },
    { "name": "kneeL", "parent": "hipL", "at": [0.3, 0.55, -0.4], "dir": [0, -0.6, -0.8], "role": "leg", "group": "legs" },
    { "name": "hockL", "parent": "kneeL", "at": [0.3, 0.3, -0.68], "dir": [0, -1, 0.5], "role": "leg", "group": "legs" },
    { "name": "footL", "parent": "hockL", "at": [0.3, 0.07, -0.55], "dir": [0, 0, 1], "role": "leg", "group": "legs" },
    { "name": "hipR", "parent": "hips", "at": [-0.3, 0.85, -0.6], "dir": [0, -1, 0.4], "role": "leg", "group": "legs" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.3, 0.55, -0.4], "dir": [0, -0.6, -0.8], "role": "leg", "group": "legs" },
    { "name": "hockR", "parent": "kneeR", "at": [-0.3, 0.3, -0.68], "dir": [0, -1, 0.5], "role": "leg", "group": "legs" },
    { "name": "footR", "parent": "hockR", "at": [-0.3, 0.07, -0.55], "dir": [0, 0, 1], "role": "leg", "group": "legs" },

    { "name": "wingShoulderL", "parent": "spine2", "at": [0.3, 1.2, 0.32], "dir": [1, 0.05, 0], "role": "wing", "group": "wings" },
    { "name": "wingElbowL", "parent": "wingShoulderL", "at": [0.95, 1.28, 0.15], "dir": [1, 0, -0.1], "role": "wing", "group": "wings" },
    { "name": "wingWristL", "parent": "wingElbowL", "at": [1.5, 1.3, 0.1], "dir": [1, 0, -0.1], "role": "wing", "group": "wings" },
    { "name": "wingTipL", "parent": "wingWristL", "at": [1.85, 1.3, 0.0], "dir": [1, 0, -0.1], "role": "wing", "group": "wings" },
    { "name": "wingShoulderR", "parent": "spine2", "at": [-0.3, 1.2, 0.32], "dir": [-1, 0.05, 0], "role": "wing", "group": "wings" },
    { "name": "wingElbowR", "parent": "wingShoulderR", "at": [-0.95, 1.28, 0.15], "dir": [-1, 0, -0.1], "role": "wing", "group": "wings" },
    { "name": "wingWristR", "parent": "wingElbowR", "at": [-1.5, 1.3, 0.1], "dir": [-1, 0, -0.1], "role": "wing", "group": "wings" },
    { "name": "wingTipR", "parent": "wingWristR", "at": [-1.85, 1.3, 0.0], "dir": [-1, 0, -0.1], "role": "wing", "group": "wings" },

    { "name": "tail1", "parent": "hips", "at": [0, 0.9, -0.8], "dir": [0, -0.1, -1], "role": "tail", "group": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 0.84, -1.0], "dir": [0, 0, -1], "role": "tail", "group": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 0.84, -1.2], "dir": [0, 0.2, -1], "role": "tail", "group": "tail" },
    { "name": "tail4", "parent": "tail3", "at": [0, 0.9, -1.35], "dir": [0, 0.3, -1], "role": "tail", "group": "tail" }
  ],
  "parts": [
    {
      "id": "torso",
      "builds": "The jaguar torso and chest. One smooth-skinned loft over hips, spine1 and spine2: a deep round chest (radius about 0.33 at z 0.5), a slightly narrower waist, and round haunches at the hips (radius about 0.32). The loft runs from z -0.9 to z 0.78, with its axis at y about 0.92 and its top at about y 1.22. It is jaguar orange on the back and sides, with a cream belly and chest bib made as sector bands or separate bands on the underside. It also includes a short neck-stub collar at neckBase (a wide faceted ring in gold, with a zig-zag of small cobalt triangles), and a thin ink outline ring at the waist and at the chest. Painted decoration made as many small separate parts seated on the skin with b.stick, scattered by surface hits: about 12 jaguar rosettes on each flank (a ring of 6 to 7 small ink dots around a hotPink or turquoise centre dot), rows of small cream and gold dots along the flanks, a row of cobalt, lime and coral dots down the belly edge, and two bold five-petal flower motifs (a flower is a gold centre with 5 coral or hotPink flattened-sphere petals) on each shoulder and haunch. A turquoise and gold stripe pair follows the flank line from shoulder to hip. Leaf motifs (flattened green cones) fan around each flower. Includes fur-less 'wood' details: a few small bareWood knots seated on the belly.",
      "box": [[-0.4, 0.55, -0.92], [0.4, 1.25, 0.8]],
      "attaches": "Front end meets the head part's neck at neckBase and chestFront. Wings root at wingRootL and wingRootR on the shoulders. Legs meet at shoulderL, shoulderR, hipL and hipR. The tail meets at tailRoot. The dorsal ridge, built by the tail part, sits on the top between dorsalStart and dorsalEnd.",
      "joints": ["hips", "spine1", "spine2"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "legs",
      "builds": "All four legs, rigid-skinned or smooth over their joint chains, and mirrored with s = ±1. FRONT (jaguar): from shoulderL/R down through elbow and wrist to the paw; thick tapering tubes (radius about 0.13 at the shoulder falling to 0.09 at the wrist), a big rounded paw (a squashed faceted sphere about 0.14 wide x 0.09 tall x 0.2 long) whose lowest point touches y = 0, 4 toes as short capsules at the front of the paw, and 4 curved ivory claws (cones in claw) at the toe tips. Paint: jaguar orange with ink stripe rings at the elbow and wrist, a cream paw cuff of three dots around the wrist, a cobalt zig-zag trim band, and a coral dot per toe. HIND (eagle): a heavy jaguar thigh from hipL/R to kneeL/R (radius about 0.2 falling to 0.12) in orange with 3 rosettes on its outer face, then a feathered 'pantaloon' of 8 to 10 overlapping flat turquoise, cobalt, and gold feather blades hanging from the thigh, then a thin yellow scaly eagle shin (beakYellow, radius about 0.05) from knee to hock and from hock to the foot, with ring segments in ink. Each foot is an eagle talon: 3 forward toes and 1 rear toe, each made of 2 capsule segments in beakYellow with ink joint dots and an ivory curved claw (cone) at the tip, so the toes are separated and spread, resting on y = 0 at talonContactL/R. Small hotPink and lime dots on every toe knuckle. All feet touch the floor, sinking at most 2 cm.",
      "box": [[-0.58, 0.0, -0.95], [0.58, 0.9, 0.9]],
      "attaches": "Front legs start at the shoulder mounts (shoulderL/R) just under the torso. Hind legs start at the hip mounts (hipL/R) and are covered by the torso haunch. Feet end at pawContactFL/FR and talonContactL/R on y = 0.",
      "joints": ["shoulderL", "elbowL", "wristL", "pawL", "shoulderR", "elbowR", "wristR", "pawR", "hipL", "kneeL", "hockL", "footL", "hipR", "kneeR", "hockR", "footR"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "head",
      "builds": "The eagle head, neck, jaw and every head ornament, built with the head scale constant. NECK: a short thick smooth sweep over neck1 and neck2 from neckBase (radius about 0.2 to 0.17) rising forward to headPivot, painted jaguar orange with cream and a few rosette dots, and a ruff of two overlapping rings of 12 broad pointed feather blades (cobalt, turquoise, gold, hotPink alternating) around neck1. HEAD: a chunky faceted skull (sphere about 0.2 in radius, slightly longer in z) at the head joint, in gold, with a cream throat. UPPER BEAK on the head joint: a strongly hooked beak (a loft or sweep from about z 1.05 down to beakTip at [0, 1.33, 1.45] curving down to a sharp point), beakYellow with a beakTip-coloured tip, ink nostril dots, and a gold and hotPink dot row along the ridge. LOWER BEAK on the jaw joint: a shorter pointed wedge under it (z about 1.0 to 1.38) in beakYellow, with a red tongue (flat forked shape), a row of tiny ivory fangs, and a hotPink gape line. EYES: two large round eyes, one on each side at x about ±0.14, y 1.46, z 1.08, with an ink outline disc, eyeWhite ball, cobalt iris, ink pupil and a tiny white highlight, a heavy gold brow ridge above each (a wedge, with ink outline), and 3 dot-lashes. Concentric dot rings of cobalt, coral and lime around the eyes, and 2 small rosettes on each cheek. EARS: two round jaguar ears (flat faceted discs) on top, orange with ink rim and a cream inner disc. CREST: 7 long feather blades fanned up and back behind the ears (lime, turquoise, hotPink, cobalt, gold, with ink tips). HORNS: two upward-curving banded horns (a sweep with alternating hotPink, cream and turquoise bands and a gold tip) between the ears and crest, with a dot at each band joint. Highest point about y 1.8.",
      "box": [[-0.4, 1.0, 0.55], [0.4, 1.8, 1.48]],
      "attaches": "The neck sweep starts buried in the torso at neckBase (y 1.0, z 0.6). The head sits at headPivot. The jaw rides jawPivot. The beak tip ends at beakTip.",
      "joints": ["neck1", "neck2", "head", "jaw"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "wings",
      "builds": "Two outstretched eagle wings, mirrored with s = ±1, spread sideways in the rest pose, each over wingShoulder, wingElbow, wingWrist and wingTip (x up to ±1.95). BONES: a thick smooth wing arm sweep (radius about 0.1 tapering to 0.06) along the chain, painted in jaguar orange with ink rosette dots, and a gold cuff at the elbow and wrist. COVERTS: 3 rows of overlapping rounded feather shapes (extrude with smoothing, thickness about 0.015) over the top of the arm, growing in size from the shoulder outward: the first row small and hotPink, the second turquoise with a cream dot, the third cobalt with a gold dot. Each feather carries a small ink rim shape and a coloured central dot. FLIGHT FEATHERS: 8 long secondaries (about 0.7 m) fanned backward (-z) from the forearm and 6 long primaries (about 0.85 m) fanned from the wrist and hand, each a pointed extruded blade with a separate ink centre stripe and a tip cap, alternating cobalt, gold, leafGreen, hotPink and coral, with cream dot rows down each quill, all in a single plane around y 1.3 and separated so that no two feathers overlap in the same layer. The underside has the same feathers in cream and turquoise (a thin slab sat just below each upper feather). The wing leading edge carries a row of lime and cobalt dots, and a single big flower motif (7 petals around a gold centre) sits at the elbow of each wing. The wing is neutral, level and fully extended, with the finger bones separated.",
      "box": [[-1.95, 1.0, -0.62], [1.95, 1.55, 0.6]],
      "attaches": "Roots at wingRootL and wingRootR on the top-side shoulders of the torso at about y 1.2. Feathers extend outward in +/-X and back in -Z.",
      "joints": ["wingShoulderL", "wingElbowL", "wingWristL", "wingTipL", "wingShoulderR", "wingElbowR", "wingWristR", "wingTipR"],
      "floor": false,
      "budget": 230
    },
    {
      "id": "tailAndRidge",
      "builds": "TAIL: a long jaguar tail, a smooth sweep over tail1 to tail4 from tailRoot (radius about 0.11 tapering to 0.06) that curves gently up at the end, painted jaguar orange with ink ring stripes every 0.1 m as separate band sweeps, and a row of cream and turquoise dots between the stripes. FAN: at tail4 (tailTip) a fan of 9 long feather blades spread in an arc of about 100 degrees up and back (length about 0.4 m, ending near z -1.55), coloured in turn cobalt, turquoise, gold, hotPink, lime, coral, each with an ink tip, a centre stripe and a cream dot, plus a small purple and gold flower motif at the fan root. DORSAL RIDGE: a row of 9 leaf-shaped spines (extruded leaf outlines, about 0.12 m tall and 0.09 wide) standing along the back from dorsalStart to dorsalEnd on the top of the torso, with the colours cycling leafGreen, turquoise, hotPink, gold and cobalt, and with a small cream dot at the base of each. Between them runs a thin ink line sweep along the spine. Everything sits on the surface of the torso top (y about 1.22) and never enters the head or wing boxes.",
      "box": [[-0.3, 0.6, -1.6], [0.3, 1.4, 0.6]],
      "attaches": "The tail is rooted at tailRoot under the hips. The ridge runs on the torso top between dorsalStart (front) and dorsalEnd (rear).",
      "joints": ["tail1", "tail2", "tail3", "tail4"],
      "floor": false,
      "budget": 110
    }
  ]
}
```

<!-- call: tailAndRidge -->

```ts
import * as THREE from "three";
import { catmull } from "agentic-3js-builder";

export function buildTailAndRidge({ b, J, P, M }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const lerpN = (a: number, c: number, t: number) => a + (c - a) * t;

  // ---------------------------------------------------------------- helpers
  // Tail bones by z position (tail1 -0.8..-1.0, tail2 -1.0..-1.2, tail3 -1.2..-1.35, tail4 beyond).
  const tailBone = (z: number) => (z > -1.0 ? J.tail1 : z > -1.2 ? J.tail2 : z > -1.35 ? J.tail3 : J.tail4);
  // Ridge rides the torso spine bones.
  const ridgeBone = (z: number) => (z > 0.15 ? J.spine2 : z > -0.25 ? J.spine1 : J.hips);

  // A flattened dot (sphere squashed along its facing direction), seated at a point facing `n`.
  const dot = (at: THREE.Vector3, n: THREE.Vector3, r: number, color: string, bone: any) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), color, { at, dir: n, bone, scale: [1, 0.5, 1] });

  // ---------------------------------------------------------------- TAIL
  const tailPts: [number, number, number][] = [
    [0, 0.9, -0.7],
    [0, 0.9, -0.8],
    [0, 0.84, -1.0],
    [0, 0.84, -1.2],
    [0, 0.9, -1.35],
  ];
  const tailPath = catmull(tailPts);
  const L = tailPath.length;
  const R = (t: number) => 0.115 - 0.055 * t;

  const tail = b.sweep(tailPath, R, {
    color: P.jaguarOrange,
    bone: [J.tail1, J.tail2, J.tail3, J.tail4],
    sectors: [[130, 230, P.cream]],
  });

  // Ink ring stripes every 0.1 m, as separate closed band sweeps.
  const ringAt = (d: number, radiusMul: number, sweepR: number, color: string) => {
    const t = Math.min(d / L, 0.995);
    const c = tailPath.at(t);
    const T = tailPath.tangentAt(t).clone().normalize();
    const e1 = V(1, 0, 0);
    const e2 = T.clone().cross(e1).normalize();
    const rr = R(t) * radiusMul;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      pts.push(c.clone().addScaledVector(e1, Math.cos(a) * rr).addScaledVector(e2, Math.sin(a) * rr));
    }
    return b.sweep(catmull(pts, { closed: true }), sweepR, {
      color,
      bone: tailBone(c.z),
      sides: 6,
    });
  };
  const ringDs = [0.15, 0.25, 0.35, 0.45, 0.55];
  for (const d of ringDs) ringAt(d, 1.07, 0.009, P.ink);

  // Rows of cream and turquoise dots between the stripes.
  [0.2, 0.3, 0.4, 0.5].forEach((d, k) => {
    const t = d / L;
    const topCol = k % 2 === 0 ? P.cream : P.turquoise;
    const sideCol = k % 2 === 0 ? P.turquoise : P.cream;
    const geoTop = new THREE.SphereGeometry(0.017, 6, 4);
    const geoSide = new THREE.SphereGeometry(0.014, 6, 4);
    b.stick(geoTop, topCol, tail.at(t, 0), { embed: 0.3, scale: [1, 0.5, 1] });
    for (const a of [65, -65]) b.stick(geoSide, sideCol, tail.at(t, a), { embed: 0.3, scale: [1, 0.5, 1] });
  });

  // Gold cuff at the fan root.
  ringAt(L * 0.985, 1.1, 0.012, P.gold);

  // Small purple and gold flower motif at the fan root, one on each side of the tail.
  {
    const t = 0.9;
    const c = tailPath.at(t);
    const r = R(t);
    for (const s of [1, -1]) {
      const n = V(s, 0, 0);
      const ctr = V(s * (r + 0.002), c.y, c.z);
      const bone = tailBone(c.z);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + 0.3;
        const p = ctr.clone().add(V(0, Math.cos(a) * 0.031, Math.sin(a) * 0.031));
        dot(p, n, 0.02, P.purple, bone);
      }
      dot(ctr.clone().addScaledVector(n, 0.006), n, 0.016, P.gold, bone);
    }
  }

  // ---------------------------------------------------------------- FEATHER FAN
  const fanRoot = V(M.tailTip[0], M.tailTip[1], M.tailTip[2]);
  const fanCols = [P.cobalt, P.turquoise, P.gold, P.hotPink, P.lime, P.coral, P.cobalt, P.turquoise, P.gold];

  const feather = (
    root: THREE.Vector3,
    dir: THREE.Vector3,
    wdir: THREE.Vector3,
    len: number,
    W: number,
    th: number,
    col: string,
    bone: any,
  ) => {
    const outline: any[] = [
      [-0.3 * W, 0],
      [-0.5 * W, 0.3 * len],
      [-0.5 * W, 0.65 * len],
      [0, len, "sharp"],
      [0.5 * W, 0.65 * len],
      [0.5 * W, 0.3 * len],
      [0.3 * W, 0],
    ];
    b.extrude(outline, { at: root, x: wdir, y: dir, thickness: th, smoothing: 1, color: col, bone });
    // ink tip cap
    const f = 0.74;
    const hw = 0.5 * W * (1 - (f - 0.65) / 0.35) + 0.002;
    const cap: any[] = [
      [-hw, 0],
      [0, (1 - f) * len + 0.003, "sharp"],
      [hw, 0],
    ];
    b.extrude(cap, {
      at: root.clone().addScaledVector(dir, f * len),
      x: wdir,
      y: dir,
      thickness: th + 0.004,
      color: P.ink,
      bone,
    });
    // ink centre stripe
    b.rod(
      root.clone().addScaledVector(dir, 0.14 * len),
      root.clone().addScaledVector(dir, 0.72 * len),
      th * 0.62,
      { color: P.ink, bone, sides: 6 },
    );
    // cream dot bead on the stripe
    b.part(new THREE.SphereGeometry(0.013, 6, 4), P.cream, {
      at: root.clone().addScaledVector(dir, 0.46 * len),
      bone,
    });
  };

  for (let i = 0; i < 9; i++) {
    const alpha = ((10 + i * 12.5) * Math.PI) / 180;
    const deg = 10 + i * 12.5;
    const len = 0.4 - 0.2 * (deg / 100);
    const dir = V(0, Math.cos(alpha), -Math.sin(alpha));
    const off = i % 2 === 0 ? 0.007 : -0.007;
    const root = fanRoot.clone().add(V(off, 0, -0.005));
    feather(root, dir, V(1, 0, 0), Math.max(len, 0.2), 0.085, 0.012, fanCols[i], J.tail4);
  }

  // ---------------------------------------------------------------- DORSAL RIDGE
  const leafCols = [P.leafGreen, P.turquoise, P.hotPink, P.gold, P.cobalt];
  const phi = (10 * Math.PI) / 180;
  const sx = V(0, Math.sin(phi), Math.cos(phi)); // width direction
  const sy = V(0, Math.cos(phi), -Math.sin(phi)); // leaf direction (leans back)
  const thick = V(-1, 0, 0);

  const startY = M.dorsalStart[1];
  const endY = M.dorsalEnd[1];
  const z0 = M.dorsalStart[2];
  const z1 = M.dorsalEnd[2];

  for (let i = 0; i < 9; i++) {
    const u = i / 8;
    const z = lerpN(z0, z1, u);
    const y = lerpN(startY, endY, u) - 0.005;
    const H = 0.12 + 0.015 * Math.sin(Math.PI * u);
    const W = 0.09;
    const bone = ridgeBone(z);
    const origin = V(0, y, z);
    const outline: any[] = [
      [-0.14 * W, -0.03],
      [-0.5 * W, 0.28 * H],
      [-0.42 * W, 0.62 * H],
      [0, H, "sharp"],
      [0.42 * W, 0.62 * H],
      [0.5 * W, 0.28 * H],
      [0.14 * W, -0.03],
    ];
    b.extrude(outline, {
      at: origin,
      x: sx,
      y: sy,
      thickness: 0.016,
      smoothing: 1,
      color: leafCols[i % 5],
      bone,
    });
    // ink midrib
    b.rod(
      origin.clone().addScaledVector(sy, 0.36 * H),
      origin.clone().addScaledVector(sy, 0.86 * H),
      0.0085,
      { color: P.ink, bone, sides: 6 },
    );
    // cream dot at the base, on both faces
    for (const sgn of [1, -1]) {
      const n = thick.clone().multiplyScalar(sgn);
      const p = origin.clone().addScaledVector(sy, 0.2 * H).addScaledVector(n, 0.008);
      dot(p, n, 0.014, P.cream, bone);
    }
  }

  // Thin ink line along the spine between the leaves.
  const linePts: [number, number, number][] = [];
  for (let i = 0; i <= 4; i++) {
    const u = i / 4;
    linePts.push([0, lerpN(startY, endY, u) - 0.004, lerpN(z0 + 0.04, z1 - 0.04, u)]);
  }
  b.sweep(catmull(linePts), 0.007, {
    color: P.ink,
    bone: [J.spine2, J.spine1, J.hips],
    sides: 6,
  });
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";

export function buildLegs({ b, J, P }: Ctx) {
  const JJ = J as unknown as Record<string, any>;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const DEG = Math.PI / 180;

  // ---------- colours ----------
  const ORANGE = P.jaguarOrange;
  const GOLD = P.gold;
  const INK = P.ink;
  const CREAM = P.cream;
  const PINK = P.hotPink;
  const TURQ = P.turquoise;
  const COBALT = P.cobalt;
  const LIME = P.lime;
  const CORAL = P.coral;
  const YELLOW = P.beakYellow;
  const CLAW = P.claw;

  // ---------- segment helper: a tube between two points with a surface basis ----------
  type Seg = {
    a: THREE.Vector3;
    e: THREE.Vector3;
    d: THREE.Vector3;
    u: THREE.Vector3;
    v: THREE.Vector3;
    len: number;
    r0: number;
    r1: number;
    bone: any;
  };

  function seg(a: THREE.Vector3, e: THREE.Vector3, r0: number, r1: number, bone: any, s: number): Seg {
    const d = e.clone().sub(a);
    const len = d.length();
    d.normalize();
    const ref = V(s, 0, 0);
    const u = ref.clone().sub(d.clone().multiplyScalar(ref.dot(d))).normalize();
    const v = new THREE.Vector3().crossVectors(d, u).normalize();
    if (v.z < 0) v.negate();
    return { a, e, d, u, v, len, r0, r1, bone };
  }
  const rAt = (sg: Seg, t: number) => sg.r0 + (sg.r1 - sg.r0) * t;

  // point + outward normal on the tube surface; angle 0 = outer side, 90 = forward
  function pt(sg: Seg, t: number, ang: number, lift = 1.03) {
    const n = sg.u
      .clone()
      .multiplyScalar(Math.cos(ang * DEG))
      .addScaledVector(sg.v, Math.sin(ang * DEG));
    const p = sg.a
      .clone()
      .addScaledVector(sg.d, sg.len * t)
      .addScaledVector(n, rAt(sg, t) * lift);
    return { p, n };
  }

  function tube(sg: Seg, color: string, sides = 10) {
    return b.capsule(sg.a, sg.e, [sg.r0, sg.r1], color, { bone: sg.bone, sides });
  }

  function dot(sg: Seg, t: number, ang: number, r: number, color: string, lift = 1.03, flat = 0.5) {
    const { p, n } = pt(sg, t, ang, lift);
    b.part(new THREE.SphereGeometry(r, 6, 4), color, { bone: sg.bone, at: p, dir: n, scale: [1, flat, 1], flat: true });
  }

  // jaguar rosette: ring of ink dots around a coloured centre
  function rosette(sg: Seg, t: number, ang: number, size: number, center: string, count = 5) {
    const R = rAt(sg, t);
    for (let i = 0; i < count; i++) {
      const phi = (i / count) * Math.PI * 2;
      dot(sg, t + (Math.cos(phi) * size) / sg.len, ang + ((Math.sin(phi) * size) / R) / DEG, 0.011, INK);
    }
    dot(sg, t, ang, 0.017, center, 1.035, 0.6);
  }

  function band(sg: Seg, t: number, color: string, tube = 0.009, k = 1.07) {
    const p = sg.a.clone().addScaledVector(sg.d, sg.len * t);
    b.part(new THREE.TorusGeometry(rAt(sg, t) * k, tube, 5, 14), color, {
      bone: sg.bone,
      at: p,
      dir: sg.d,
      axis: "z",
    });
  }

  // zig-zag trim: triangles alternately pointing up and down around the tube
  function zig(sg: Seg, t: number, color: string, count = 8) {
    for (let i = 0; i < count; i++) {
      const { p, n } = pt(sg, t, (i * 360) / count, 1.0);
      const up = i % 2 === 0;
      const at = p.clone().addScaledVector(n, 0.004);
      b.part(new THREE.ConeGeometry(0.028, 0.05, 3), color, {
        bone: sg.bone,
        at,
        dir: up ? sg.d.clone() : sg.d.clone().negate(),
        flat: true,
      });
    }
  }

  const topDot = (bone: any, x: number, y: number, z: number, r: number, color: string) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), color, {
      bone,
      at: V(x, y, z),
      dir: [0, 1, 0],
      scale: [1, 0.55, 1],
      flat: true,
    });

  // =====================================================================
  // FRONT LEGS: jaguar
  // =====================================================================
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = JJ["shoulder" + side];
    const el = JJ["elbow" + side];
    const wr = JJ["wrist" + side];
    const paw = JJ["paw" + side];
    const x = sh.at.x as number;

    const pawC = V(x, 0.1, 0.59);
    const upper = seg(sh.at.clone(), el.at.clone(), 0.13, 0.105, sh, s);
    const fore = seg(el.at.clone(), wr.at.clone(), 0.105, 0.09, el, s);
    const wp = seg(wr.at.clone(), pawC, 0.09, 0.075, wr, s);

    tube(upper, ORANGE);
    tube(fore, ORANGE);
    tube(wp, ORANGE);

    // paw
    b.part(new THREE.SphereGeometry(1, 8, 6), ORANGE, {
      bone: paw,
      at: V(x, 0.045, 0.62),
      scale: [0.07, 0.045, 0.1],
      flat: true,
    });

    // toes, claws, coral dots
    const offs = [-0.052, -0.017, 0.017, 0.052];
    for (const xo of offs) {
      const a0 = V(x + xo, 0.03, 0.69);
      const a1 = V(x + xo * 1.2, 0.03, 0.765 - Math.abs(xo) * 0.2);
      b.capsule(a0, a1, 0.023, GOLD, { bone: paw, sides: 6 });
      b.spike(a1.clone().add(V(0, 0, 0.008)), V(0, -0.5, 1).normalize(), 0.06, 0.014, {
        color: CLAW,
        bone: paw,
        sides: 6,
      });
      topDot(paw, x + xo, 0.057, 0.73, 0.012, CORAL);
    }

    // paint: ink rings at elbow and wrist, gold cuff with cream dots, cobalt zig-zag, rosette
    band(upper, 0.92, INK, 0.009);
    band(fore, 0.9, INK, 0.009);
    band(wp, 0.5, GOLD, 0.014, 1.1);
    for (const ang of [45, 90, 135]) dot(wp, 0.18, ang, 0.014, CREAM, 1.04);
    zig(fore, 0.45, COBALT, 8);
    rosette(upper, 0.4, 0, 0.04, PINK, 5);
  }

  // =====================================================================
  // HIND LEGS: jaguar thigh, feathered pantaloons, eagle shin and talon
  // =====================================================================
  const rows: { t: number; len: number; color: string; angs: number[] }[] = [
    { t: 0.5, len: 0.27, color: TURQ, angs: [-60, -20, 20, 60] },
    { t: 0.62, len: 0.23, color: COBALT, angs: [-40, 0, 40] },
    { t: 0.74, len: 0.18, color: GOLD, angs: [-20, 20] },
  ];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = JJ["hip" + side];
    const knee = JJ["knee" + side];
    const hock = JJ["hock" + side];
    const foot = JJ["foot" + side];
    const x = hip.at.x as number;
    const A = V(x, 0.05, foot.at.z as number);

    const thigh = seg(hip.at.clone(), knee.at.clone(), 0.2, 0.12, hip, s);
    const shin1 = seg(knee.at.clone(), hock.at.clone(), 0.055, 0.05, knee, s);
    const shin2 = seg(hock.at.clone(), A.clone(), 0.05, 0.045, hock, s);

    tube(thigh, ORANGE);
    tube(shin1, YELLOW, 8);
    tube(shin2, YELLOW, 8);

    // rosettes on the outer thigh
    rosette(thigh, 0.2, -40, 0.038, PINK, 5);
    rosette(thigh, 0.2, 42, 0.038, TURQ, 5);
    rosette(thigh, 0.38, 0, 0.038, PINK, 5);

    // pantaloon feathers
    rows.forEach((row, ri) => {
      const L = row.len;
      const w = 0.105;
      const outline: [number, number, string?][] = [
        [-0.2 * w, 0],
        [0.2 * w, 0],
        [0.5 * w, 0.35 * L],
        [0.45 * w, 0.65 * L],
        [0, L, "sharp"],
        [-0.45 * w, 0.65 * L],
        [-0.5 * w, 0.35 * L],
      ];
      for (const ang of row.angs) {
        const { p, n } = pt(thigh, row.t, ang, 1.06 + 0.035 * ri);
        const ydir = thigh.d.clone().addScaledVector(n, 0.3).normalize();
        const xdir = new THREE.Vector3().crossVectors(ydir, n).normalize();
        b.extrude(outline as any, {
          at: p,
          x: xdir,
          y: ydir,
          thickness: 0.012,
          bevel: 0.003,
          color: row.color,
          bone: hip,
        });
      }
    });

    // shin ring segments and hock ball
    band(shin1, 0.35, INK, 0.008, 1.1);
    band(shin1, 0.7, INK, 0.008, 1.1);
    band(shin2, 0.5, INK, 0.008, 1.1);
    b.part(new THREE.SphereGeometry(1, 6, 5), YELLOW, {
      bone: hock,
      at: hock.at.clone(),
      scale: [0.065, 0.065, 0.065],
      flat: true,
    });

    // talon
    b.part(new THREE.SphereGeometry(1, 6, 5), YELLOW, {
      bone: foot,
      at: A,
      scale: [0.05, 0.05, 0.05],
      flat: true,
    });

    const toes = [
      { ang: -38, l1: 0.1, l2: 0.08, c: PINK },
      { ang: 0, l1: 0.12, l2: 0.09, c: LIME },
      { ang: 38, l1: 0.1, l2: 0.08, c: PINK },
      { ang: 180, l1: 0.07, l2: 0.05, c: LIME },
    ];
    const toeY = 0.022;
    for (const tt of toes) {
      const dir = V(Math.sin(tt.ang * DEG), 0, Math.cos(tt.ang * DEG));
      const P0 = V(x, toeY, A.z).addScaledVector(dir, 0.03);
      const P1 = P0.clone().addScaledVector(dir, tt.l1);
      const P2 = P1.clone().addScaledVector(dir, tt.l2);
      b.capsule(P0, P1, 0.022, YELLOW, { bone: foot, sides: 6 });
      b.capsule(P1, P2, 0.02, YELLOW, { bone: foot, sides: 6 });
      topDot(foot, P1.x, 0.046, P1.z, 0.014, INK);
      const K = P0.clone().addScaledVector(dir, 0.05);
      topDot(foot, K.x, 0.046, K.z, 0.013, tt.c);
      const cd = dir.clone().add(V(0, -0.55, 0)).normalize();
      b.spike(P2.clone().addScaledVector(dir, 0.012), cd, 0.07, 0.016, {
        color: CLAW,
        bone: foot,
        sides: 6,
      });
    }
  }
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { frame, catmull, polyline } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildTorso({ b, J, P, M }: Ctx) {
  const ORANGE = P.jaguarOrange;
  const GOLD = P.gold;
  const INK = P.ink;
  const CREAM = P.cream;
  const PINK = P.hotPink;
  const TURQ = P.turquoise;
  const COBALT = P.cobalt;
  const LEAF = P.leafGreen;
  const LIME = P.lime;
  const CORAL = P.coral;
  const WOOD = P.bareWood;

  // ---------------------------------------------------------------- body
  const Z0 = -0.74;
  const Z1 = 0.47;
  const LEN = Z1 - Z0;
  const keys: [number, number][] = [
    [0, 0.17],
    [0.116, 0.29],
    [0.24, 0.32],
    [0.446, 0.285],
    [0.61, 0.27],
    [0.82, 0.31],
    [1, 0.31],
  ];
  const R = (t: number) => {
    const tt = Math.min(Math.max(t, 0), 1);
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, r0] = keys[i];
      const [t1, r1] = keys[i + 1];
      if (tt <= t1) {
        const u = (tt - t0) / (t1 - t0);
        const e = u * u * (3 - 2 * u);
        return r0 + (r1 - r0) * e;
      }
    }
    return keys[keys.length - 1][1];
  };

  const path = catmull([
    [0, 0.92, Z0],
    [0, 0.92, -0.45],
    [0, 0.92, -0.05],
    [0, 0.93, 0.25],
    [0, 0.93, Z1],
  ]);

  const body = b.sweep(
    path,
    (t: number) => {
      const r = R(t) * 0.97;
      return [r, r];
    },
    {
      bone: [J.hips, J.spine1, J.spine2],
      color: ORANGE,
      sides: 12,
      smooth: false,
      caps: "round",
      sectors: [
        [132, 228, CREAM, 0, 0.78],
        [118, 242, CREAM, 0.78, 1],
      ],
    },
  );
  const skin = b.surface(body);

  // ---------------------------------------------------------------- merged decoration helpers
  type Bucket = { bone: any; color: string; geos: THREE.BufferGeometry[] };
  const buckets = new Map<string, Bucket>();
  const boneAt = (t: number) => (t < 0.4 ? J.hips : t < 0.72 ? J.spine1 : J.spine2);

  const pt = (t: number, th: number, s: number) =>
    body.at(Math.min(Math.max(t, 0.025), 0.975), -s * th);

  function put(geo: THREE.BufferGeometry, color: string, p: any, t: number, lift: number, dirv?: THREE.Vector3) {
    const n = new THREE.Vector3(p.n.x, p.n.y, p.n.z).normalize();
    const T = dirv ? dirv.clone() : new THREE.Vector3(p.tangent.x, p.tangent.y, p.tangent.z);
    T.addScaledVector(n, -T.dot(n));
    if (T.lengthSq() < 1e-8) {
      T.set(0, 0, 1);
      T.addScaledVector(n, -n.z);
    }
    T.normalize();
    const X = new THREE.Vector3().crossVectors(n, T);
    const m = new THREE.Matrix4().makeBasis(X, n, T);
    m.setPosition(p.at.x + n.x * lift, p.at.y + n.y * lift, p.at.z + n.z * lift);
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.deleteAttribute("uv");
    g.applyMatrix4(m);
    g.computeVertexNormals();
    const bone = boneAt(t);
    const key = `${bone.name}|${color}`;
    let bk = buckets.get(key);
    if (!bk) buckets.set(key, (bk = { bone, color, geos: [] }));
    bk.geos.push(g);
  }

  // a flattened button: cylinder with the underside cap removed
  function button(r: number, h: number, sides: number) {
    const g = new THREE.CylinderGeometry(r * 0.8, r, h, sides, 1, false);
    const cnt = g.groups[0].count + g.groups[1].count;
    const idx = Array.from(g.index!.array as ArrayLike<number>).slice(0, cnt);
    g.clearGroups();
    g.setIndex(idx);
    return g;
  }

  function leafGeo(len: number, w: number) {
    const g = new THREE.ConeGeometry(w, len, 4, 1);
    g.translate(0, len / 2, 0);
    g.scale(1, 1, 0.4);
    g.rotateX(Math.PI / 2);
    return g;
  }

  const DEG = 180 / Math.PI;
  const at2 = (t: number, th: number, s: number, du: number, dv: number) =>
    pt(t + du / LEN, th + (dv / R(t)) * DEG, s);

  function dot(
    color: string, t: number, th: number, s: number, du: number, dv: number,
    r: number, h = 0.008, lift = 0.002, sides = 5,
  ) {
    const t2 = t + du / LEN;
    put(button(r, h, sides), color, at2(t, th, s, du, dv), t2, lift);
  }

  function leaf(color: string, t: number, th: number, s: number, a: number, r0: number, r1: number, w: number, lift: number) {
    const base = at2(t, th, s, Math.cos(a) * r0, Math.sin(a) * r0);
    const tip = at2(t, th, s, Math.cos(a) * r1, Math.sin(a) * r1);
    const d = new THREE.Vector3(tip.at.x - base.at.x, tip.at.y - base.at.y, tip.at.z - base.at.z);
    const len = d.length();
    put(leafGeo(len, w), color, base, t + (Math.cos(a) * r0) / LEN, lift, d);
  }

  function rosette(t: number, th: number, s: number, centre: string, size = 1) {
    const n = 6;
    const ringR = 0.036 * size;
    const off = s > 0 ? 0 : 0.5;
    for (let k = 0; k < n; k++) {
      const a = ((k + off) / n) * Math.PI * 2;
      dot(INK, t, th, s, Math.cos(a) * ringR, Math.sin(a) * ringR, 0.011 * size, 0.008, 0.002);
    }
    dot(centre, t, th, s, 0, 0, 0.02 * size, 0.01, 0.003, 6);
    dot(GOLD, t, th, s, 0, 0, 0.0075 * size, 0.01, 0.0045);
  }

  function flower(t: number, th: number, s: number, petal: string) {
    const off = s > 0 ? 0.2 : 0.7;
    for (let k = 0; k < 5; k++) {
      const a = ((k + off) / 5) * Math.PI * 2;
      const du = Math.cos(a) * 0.044;
      const dv = Math.sin(a) * 0.044;
      dot(INK, t, th, s, du, dv, 0.027, 0.008, 0.0015, 6);
      dot(petal, t, th, s, du, dv, 0.021, 0.01, 0.003, 6);
      dot(CREAM, t, th, s, du * 1.25, dv * 1.25, 0.006, 0.01, 0.0045);
      // leaf between petals
      const a2 = ((k + off + 0.5) / 5) * Math.PI * 2;
      leaf(LEAF, t, th, s, a2, 0.06, 0.12, 0.016, 0.0025);
      leaf(LIME, t, th, s, a2, 0.068, 0.1, 0.007, 0.0042);
    }
    dot(INK, t, th, s, 0, 0, 0.027, 0.01, 0.003, 6);
    dot(GOLD, t, th, s, 0, 0, 0.02, 0.012, 0.0045, 6);
    dot(PINK === petal ? CORAL : PINK, t, th, s, 0, 0, 0.008, 0.012, 0.0065);
  }

  const nearRing = (t: number) => Math.abs(t - 0.57) < 0.03 || Math.abs(t - 0.926) < 0.03;

  // ---------------------------------------------------------------- decoration per side
  for (const s of [1, -1]) {
    // jaguar rosettes on the flank, two staggered rows
    const rowA = [0.08, 0.22, 0.36, 0.48, 0.66, 0.74];
    const rowB = [0.14, 0.3, 0.42, 0.68, 0.8];
    rowA.forEach((t, i) => rosette(t, 120, s, i % 2 ? TURQ : PINK));
    rowB.forEach((t, i) => rosette(t, 98, s, i % 2 ? PINK : TURQ));
    rosette(0.06, 58, s, TURQ, 0.8);

    // bold flowers on haunch and shoulder
    flower(0.2, 70, s, CORAL);
    flower(0.84, 70, s, PINK);

    // cream / gold dot row along the upper flank
    let k = 0;
    for (let t = 0.06; t < 0.95; t += 0.055) {
      if (nearRing(t)) continue;
      dot(INK, t, 24, s, 0, 0, 0.0155, 0.007, 0.0015, 6);
      dot(k % 2 ? GOLD : CREAM, t, 24, s, 0, 0, 0.012, 0.009, 0.003, 6);
      k++;
    }

    // belly-edge dots on the cream: cobalt, lime, coral
    const cols = [COBALT, LIME, CORAL];
    k = 0;
    for (let t = 0.07; t < 0.76; t += 0.06) {
      if (nearRing(t)) continue;
      dot(cols[k % 3], t, 148, s, 0, 0, 0.014, 0.009, 0.002, 6);
      k++;
    }
    // chest bib dots
    [0.8, 0.85, 0.89, 0.96].forEach((t, i) => {
      dot(i % 2 ? CORAL : COBALT, t, 168, s, 0, 0, 0.015, 0.009, 0.002, 6);
    });

    // flank stripe pair, thin ink outlines for the belly and bib
    b.sweep(body.line(-s * 38, 0.003).slice(0.06, 0.94), 0.011, { color: GOLD, sides: 5 });
    b.sweep(body.line(-s * 45, 0.003).slice(0.06, 0.94), 0.011, { color: TURQ, sides: 5 });
    b.sweep(body.line(-s * 132, 0.002).slice(0.05, 0.775), 0.0065, { color: INK, sides: 5 });
    b.sweep(body.line(-s * 118, 0.002).slice(0.785, 0.95), 0.0065, { color: INK, sides: 5 });
    const step: number[][] = [];
    for (let i = 0; i <= 3; i++) {
      const p = pt(0.78, 118 + (14 * i) / 3, s);
      step.push([p.at.x + p.n.x * 0.002, p.at.y + p.n.y * 0.002, p.at.z + p.n.z * 0.002]);
    }
    b.sweep(polyline(step), 0.0065, { color: INK, sides: 5, bone: J.spine2 });
  }

  // wood knots on the belly
  [0.25, 0.45, 0.7].forEach((t, i) => {
    dot(INK, t, 180, 1, 0, 0, 0.034, 0.008, 0.0015, 6);
    dot(WOOD, t, 180, 1, 0, 0, 0.026, 0.01, 0.003, 6);
    dot(INK, t, 180, 1, 0, 0, 0.01 + i * 0.002, 0.012, 0.0045);
  });

  // ---------------------------------------------------------------- outline rings: waist and chest
  b.sweep(skin.loop(J.spine1, { lift: 0.003 }), 0.008, { color: INK, sides: 5 });
  b.sweep(skin.loop([0, 0.93, 0.38], { dir: [0, 0, 1], lift: 0.003 }), 0.008, { color: INK, sides: 5 });

  // flush merged dots
  for (const bk of buckets.values()) {
    const merged = mergeGeometries(bk.geos, false);
    if (merged) b.part(merged, bk.color, { bone: bk.bone, at: [0, 0, 0] });
  }

  // ---------------------------------------------------------------- neck collar at neckBase
  const axis = new THREE.Vector3(0, 0.6, 0.6).normalize();
  const nb = new THREE.Vector3(...(M.neckBase as [number, number, number]));
  const c = nb.clone().addScaledVector(axis, 0.14);
  const ax: [number, number, number] = [axis.x, axis.y, axis.z];

  b.part(new THREE.TorusGeometry(0.215, 0.045, 5, 12), GOLD, {
    bone: J.spine2, at: [c.x, c.y, c.z], dir: ax, axis: "z", flat: true,
  });
  for (const o of [-0.035, 0.035]) {
    const cc = c.clone().addScaledVector(axis, o);
    b.part(new THREE.TorusGeometry(0.243, 0.01, 4, 12), INK, {
      bone: J.spine2, at: [cc.x, cc.y, cc.z], dir: ax, axis: "z", flat: true,
    });
  }
  b.ring(frame([c.x, c.y, c.z], ax), { count: 12, radius: 0.25, tilt: 50 }, (item: any) => {
    b.stick(new THREE.ConeGeometry(0.024, 0.06, 3, 1), COBALT, item, { bone: J.spine2, embed: 0.3 });
  });
  b.ring(frame([c.x, c.y, c.z], ax), { count: 12, radius: 0.262, tilt: 0 }, (item: any) => {
    b.stick(button(0.011, 0.01, 5), CREAM, item, { bone: J.spine2, embed: 0.2 });
  });
}
```

<!-- call: wings -->

```ts
import * as THREE from "three";
import { aim, catmull } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildWings({ b, J, P }: Ctx) {
  type Pt = [number, number];
  const D2R = Math.PI / 180;
  const Y = new THREE.Vector3(0, 1, 0);
  const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- outlines (normalised: u along length 0..1, v across -0.5..0.5) ----------
  const FEATHER: Pt[] = [
    [0, -0.35], [0.12, -0.48], [0.4, -0.5], [0.7, -0.4], [0.92, -0.2], [1, 0],
    [0.92, 0.2], [0.7, 0.4], [0.4, 0.5], [0.12, 0.48], [0, 0.35],
  ];
  const CAP: Pt[] = [[0.79, -0.295], [0.93, -0.15], [0.985, 0], [0.93, 0.15], [0.79, 0.295]];
  const OVAL: Pt[] = [[0, -0.3], [0.3, -0.5], [0.75, -0.4], [1, 0], [0.75, 0.4], [0.3, 0.5], [0, 0.3]];
  const sc = (pts: Pt[], L: number, W: number) => pts.map(([u, v]) => [u * L, v * W] as Pt);

  const toShape = (pts: Pt[]) => new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const slab = (pts: Pt[], t: number) => {
    const g = new THREE.ExtrudeGeometry(toShape(pts), { depth: t, bevelEnabled: false, steps: 1, curveSegments: 1 });
    g.translate(0, 0, -t / 2);
    return g;
  };
  const flatShape = (pts: Pt[]) => new THREE.ShapeGeometry(toShape(pts));

  // ---------- merge bag: one part per bone + colour ----------
  const bag = new Map<string, { color: string; bone: string; geos: THREE.BufferGeometry[] }>();
  const put = (geo: THREE.BufferGeometry, color: string, bone: string, m: THREE.Matrix4) => {
    const g = geo.index ? geo.toNonIndexed() : geo;
    g.applyMatrix4(m);
    const key = `${bone}|${color}`;
    let e = bag.get(key);
    if (!e) bag.set(key, (e = { color, bone, geos: [] }));
    e.geos.push(g);
  };

  // basis: local x -> U, local z -> up (or down), origin o
  const basis = (o: THREE.Vector3, U: THREE.Vector3, up: boolean) => {
    const W = up ? Y.clone() : Y.clone().negate();
    const Uu = U.clone().normalize();
    const V = new THREE.Vector3().crossVectors(W, Uu).normalize();
    return new THREE.Matrix4().makeBasis(Uu, V, W).setPosition(o);
  };
  const disc = (p: THREE.Vector3, n: THREE.Vector3, r: number, color: string, bone: string) =>
    put(
      new THREE.CircleGeometry(r, 6),
      color,
      bone,
      new THREE.Matrix4().compose(p, aim(n, undefined, "z"), v3(1, 1, 1)),
    );
  const dome = (p: THREE.Vector3, n: THREE.Vector3, r: number, color: string, bone: string) =>
    put(
      new THREE.SphereGeometry(1, 5, 3),
      color,
      bone,
      new THREE.Matrix4().compose(p, aim(n), v3(r, r * 0.55, r)),
    );

  const cycle = [P.cobalt, P.gold, P.leafGreen, P.hotPink, P.coral];
  const P0 = 1.3; // flight feather plane
  const FB = 1.37; // flower base height

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const joint = (n: string) => J[`wing${n}${S}`];
    const pts = ["Shoulder", "Elbow", "Wrist", "Tip"].map((n) => {
      const a = joint(n).at;
      return [a.x, a.y, a.z] as [number, number, number];
    });
    const path = catmull(pts);
    const rad = (t: number) => 0.1 - 0.04 * t;
    const boneOf = (ax: number) =>
      ax < 0.95 ? `wingShoulder${S}` : ax < 1.5 ? `wingElbow${S}` : `wingWrist${S}`;

    // samples of the arm centreline for seating feathers
    const samples: THREE.Vector3[] = [];
    for (let i = 0; i <= 400; i++) {
      const p = path.at(i / 400);
      samples.push(v3(p.x, p.y, p.z));
    }
    const armAt = (ax: number) => {
      let best = samples[0];
      let bd = Infinity;
      for (const p of samples) {
        const d = Math.abs(Math.abs(p.x) - ax);
        if (d < bd) { bd = d; best = p; }
      }
      return best;
    };

    // ---------- arm ----------
    const arm = b.sweep(path, rad, {
      bone: ["Shoulder", "Elbow", "Wrist", "Tip"].map(joint),
      color: P.jaguarOrange,
      sides: 8,
      smooth: false,
      group: "wings",
      name: `wings.arm${S}`,
    });
    const te = path.closestT(pts[1]);
    const tw = path.closestT(pts[2]);
    const cuffs: [number, string][] = [[te, "Elbow"], [tw, "Wrist"]];
    for (const [tc, bn] of cuffs) {
      const r = rad(tc);
      b.sweep(path.slice(tc - 0.035, tc + 0.035), r + 0.016, {
        color: P.gold, bone: joint(bn), caps: "flat", sides: 8, smooth: false, group: "wings",
        name: `wings.cuff${bn}${S}`,
      });
      for (const d of [-0.0415, 0.0415])
        b.sweep(path.slice(tc + d - 0.007, tc + d + 0.007), r + 0.02, {
          color: P.ink, bone: joint(bn), caps: "flat", sides: 8, smooth: false, group: "wings",
          name: `wings.cuffInk${bn}${S}`,
        });
    }

    // ---------- arm rosettes ----------
    const armDot = (t: number, deg: number, lift: number) => {
      const h = arm.at(t, deg, lift);
      return { p: v3(h.at.x, h.at.y, h.at.z), n: v3(h.n.x, h.n.y, h.n.z) };
    };
    const rosette = (t: number, deg: number, ringR: number, centre: string, ring: string) => {
      const c = armDot(t, deg, 0.004);
      const bone = boneOf(Math.abs(c.p.x));
      dome(c.p, c.n, ringR * 0.5, centre, bone);
      const R = rad(t);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const dt = (Math.cos(a) * ringR) / path.length;
        const dd = ((Math.sin(a) * ringR) / R) / D2R;
        const q = armDot(Math.min(0.99, Math.max(0.01, t + dt)), deg + dd, 0.003);
        disc(q.p, q.n, ringR * 0.3, ring, bone);
      }
    };
    rosette(0.2, s * 38, 0.032, P.hotPink, P.ink);
    rosette(0.6, s * 38, 0.027, P.turquoise, P.ink);
    rosette(0.9, s * 38, 0.021, P.hotPink, P.ink);
    rosette(0.27, 180, 0.03, P.turquoise, P.ink);
    rosette(0.6, 180, 0.026, P.cream, P.ink);
    rosette(0.9, 180, 0.02, P.turquoise, P.ink);

    // leading edge dots
    for (let k = 0; k < 14; k++) {
      const t = 0.09 + (k * 0.88) / 13;
      if (Math.abs(t - te) < 0.05 || Math.abs(t - tw) < 0.05) continue;
      const d = armDot(t, s * 88, 0.003);
      dome(d.p, d.n, rad(t) * 0.22, k % 2 ? P.cobalt : P.lime, boneOf(Math.abs(d.p.x)));
    }

    // ---------- flight feathers ----------
    const feather = (
      i: number, rootX: number, phiDeg: number, trailZ: number, W: number, color: string, under: string, bone: string,
    ) => {
      const a = armAt(rootX);
      const root = v3(s * rootX, P0 + (i % 2) * 0.01, a.z - 0.04);
      const phi = phiDeg * D2R;
      const U = v3(s * Math.sin(phi), 0, -Math.cos(phi));
      const L = (root.z - trailZ) / Math.cos(phi);
      put(slab(sc(FEATHER, L, W), 0.015), color, bone, basis(root, U, true));
      const top = root.clone().addScaledVector(Y, 0.0105);
      const stripe: Pt[] = [[0.04 * L, -0.009], [0.86 * L, -0.005], [0.86 * L, 0.005], [0.04 * L, 0.009]];
      put(flatShape(stripe), P.ink, bone, basis(top, U, true));
      put(flatShape(sc(CAP, L, W)), P.ink, bone, basis(top, U, true));
      for (const f of [0.15, 0.3, 0.45, 0.6, 0.74]) {
        const p = root.clone().addScaledVector(U, L * f).addScaledVector(Y, 0.013);
        put(new THREE.CircleGeometry(0.0125, 6), P.cream, bone, basis(p, U, true));
      }
      // underside slab
      const r2 = root.clone().addScaledVector(Y, -0.0125);
      put(slab(sc(FEATHER, L * 0.985, W * 0.94), 0.01), under, bone, basis(r2, U, true));
      const bot = r2.clone().addScaledVector(Y, -0.008);
      put(flatShape(stripe), P.ink, bone, basis(bot, U, false));
      put(flatShape(sc(CAP, L * 0.985, W * 0.94)), P.ink, bone, basis(bot, U, false));
    };

    for (let i = 0; i < 8; i++) {
      const x = 0.62 + i * 0.111;
      feather(i, x, -10 + i * (12 / 7), -0.565, 0.105, cycle[i % 5], i % 2 ? P.turquoise : P.cream, boneOf(x));
    }
    const trails = [-0.6, -0.6, -0.58, -0.55, -0.51, -0.46];
    for (let j = 0; j < 6; j++) {
      const i = 8 + j;
      const x = 1.5 + j * 0.07;
      feather(i, x, -6 + j * 2.4, trails[j], 0.072, cycle[i % 5], i % 2 ? P.turquoise : P.cream, `wingWrist${S}`);
    }

    // ---------- coverts ----------
    const rows = [
      { n: 10, x0: 0.62, x1: 1.76, L: 0.12, W: 0.11, off: -0.04, y: 1.358, col: P.hotPink, dot: P.lime },
      { n: 8, x0: 0.68, x1: 1.72, L: 0.18, W: 0.14, off: -0.07, y: 1.341, col: P.turquoise, dot: P.cream },
      { n: 7, x0: 0.66, x1: 1.76, L: 0.25, W: 0.16, off: -0.1, y: 1.324, col: P.cobalt, dot: P.gold },
    ];
    for (const row of rows) {
      for (let i = 0; i < row.n; i++) {
        const x = row.x0 + ((row.x1 - row.x0) * i) / (row.n - 1);
        const u = (x - 0.6) / 1.2;
        const L = row.L * (0.8 + 0.45 * u);
        const W = row.W * (0.85 + 0.3 * u);
        const a = armAt(x);
        const y = row.y + (i % 2) * 0.0035;
        const root = v3(s * x, y, a.z + row.off);
        const phi = (-8 + 13 * u) * D2R;
        const U = v3(s * Math.sin(phi), 0, -Math.cos(phi));
        const bone = boneOf(x);
        put(slab(sc(OVAL, L, W), 0.012), row.col, bone, basis(root, U, true));
        const rimO = root.clone().addScaledVector(U, -0.006).addScaledVector(Y, -0.0052);
        put(flatShape(sc(OVAL, L + 0.012, W * 1.17)), P.ink, bone, basis(rimO, U, true));
        const dp = root.clone().addScaledVector(U, L * 0.55).addScaledVector(Y, 0.009);
        put(new THREE.CircleGeometry(0.014 + 0.006 * u, 6), row.dot, bone, basis(dp, U, true));
      }
    }

    // ---------- elbow flower: 7 petals around a gold centre ----------
    {
      const cx = 0.95;
      const a = armAt(cx);
      const c = v3(s * cx, FB, a.z - 0.11);
      const bone = `wingElbow${S}`;
      for (let k = 0; k < 7; k++) {
        const ang = (k / 7) * Math.PI * 2;
        const U = v3(Math.cos(ang), 0, Math.sin(ang));
        const o = c.clone().addScaledVector(U, 0.03);
        put(flatShape(sc(OVAL, 0.14, 0.088)), P.ink, bone, basis(o.clone().addScaledVector(U, -0.008).addScaledVector(Y, 0.001), U, true));
        put(slab(sc(OVAL, 0.125, 0.07), 0.014), P.hotPink, bone, basis(o.clone().addScaledVector(Y, 0.007), U, true));
        const ang2 = ang + Math.PI / 7;
        const U2 = v3(Math.cos(ang2), 0, Math.sin(ang2));
        const o2 = c.clone().addScaledVector(U2, 0.02);
        put(slab(sc(OVAL, 0.08, 0.05), 0.012), P.coral, bone, basis(o2.clone().addScaledVector(Y, 0.02), U2, true));
        const tip = c.clone().addScaledVector(U2, 0.1).addScaledVector(Y, 0.029);
        put(new THREE.CircleGeometry(0.01, 6), P.cream, bone, basis(tip, U2, true));
        const dotP = c.clone().addScaledVector(U, 0.1).addScaledVector(Y, 0.0155);
        put(new THREE.CircleGeometry(0.011, 6), P.cream, bone, basis(dotP, U, true));
        const ringP = c.clone().addScaledVector(U, 0.03).addScaledVector(Y, 0.0357);
        put(new THREE.CircleGeometry(0.006, 6), P.ink, bone, basis(ringP, U, true));
      }
      put(
        new THREE.CylinderGeometry(0.04, 0.04, 0.02, 8),
        P.gold,
        bone,
        new THREE.Matrix4().makeTranslation(c.x, c.y + 0.024, c.z),
      );
      const top = c.clone().addScaledVector(Y, 0.0345);
      put(new THREE.CircleGeometry(0.027, 8), P.ink, bone, basis(top.clone().addScaledVector(Y, 0.0), Y.clone().cross(v3(1, 0, 0)).add(v3(0, 0, 1)).setY(0), true));
      put(new THREE.CircleGeometry(0.02, 8), P.turquoise, bone, basis(top.clone().addScaledVector(Y, 0.002), v3(0, 0, 1), true));
      put(new THREE.CircleGeometry(0.009, 6), P.cream, bone, basis(top.clone().addScaledVector(Y, 0.004), v3(0, 0, 1), true));
    }
  }

  // ---------- flush merged parts ----------
  let n = 0;
  for (const g of bag.values()) {
    const merged = mergeGeometries(g.geos, false);
    if (!merged) continue;
    b.part(merged, g.color, {
      bone: J[g.bone],
      at: [0, 0, 0],
      flat: true,
      group: "wings",
      name: `wings.paint${n++}.${g.bone}`,
    });
  }
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { aim, catmull, frame } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildHead({ b, J, P, M }: Ctx) {
  const D = Math.PI / 180;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const INK = P.ink;
  const WHITE = "#ffffff";
  const SIDES = [1, -1];

  // ---- head scale constants -------------------------------------------------------------------
  const C = V(0, 1.42, 0.97); // skull centre
  const SK: [number, number, number] = [0.2, 0.19, 0.23]; // skull radii

  // ---- merged decoration batches (one part per bone + colour) ---------------------------------
  const batches = new Map<string, { geos: THREE.BufferGeometry[]; color: string; bone: any }>();
  const put = (
    geo: THREE.BufferGeometry,
    at: THREE.Vector3,
    dir: THREE.Vector3 | null,
    color: string,
    bone: any,
    scale?: [number, number, number],
  ) => {
    if (scale) geo.scale(scale[0], scale[1], scale[2]);
    if (dir) geo.applyQuaternion(aim(dir.clone().normalize()));
    geo.translate(at.x, at.y, at.z);
    const key = `${bone.name}|${color}`;
    let e = batches.get(key);
    if (!e) batches.set(key, (e = { geos: [], color, bone }));
    e.geos.push(geo);
  };
  const sph = (r: number) => new THREE.SphereGeometry(r, 6, 4);
  const cyl = (r: number, h: number, seg: number) => new THREE.CylinderGeometry(r, r, h, seg);
  const cone = (r: number, h: number, seg: number) => new THREE.ConeGeometry(r, h, seg).translate(0, h / 2, 0);

  const dotAt = (h: any, r: number, color: string, bone: any, o: { flat?: number; lift?: number } = {}) => {
    const flat = o.flat ?? 0.5;
    const c = h.at.clone().addScaledVector(h.n, (o.lift ?? 0) + r * flat * 0.55);
    put(sph(r), c, h.n, color, bone, [1, flat, 1]);
  };

  // ---- feather blade helper -------------------------------------------------------------------
  const FR = [0, 0.08, 0.3, 0.55, 0.8, 0.93, 1];
  const HW = [0.3, 0.8, 1, 0.9, 0.6, 0.28, 0];
  const hwAt = (f: number) => {
    for (let i = 1; i < FR.length; i++)
      if (f <= FR[i]) return HW[i - 1] + ((HW[i] - HW[i - 1]) * (f - FR[i - 1])) / (FR[i] - FR[i - 1]);
    return 0;
  };
  const outline = (L: number, W: number, f0: number, f1: number): any[] => {
    const fs = [f0, ...FR.filter((f) => f > f0 + 1e-6 && f < f1 - 1e-6), f1];
    const pts: any[] = [];
    fs.forEach((f) => pts.push([(hwAt(f) * W) / 2, f * L]));
    [...fs].reverse().forEach((f) => pts.push([(-hwAt(f) * W) / 2, f * L]));
    if (f1 >= 1) pts[fs.length - 1] = [0, L, "sharp"];
    return pts;
  };
  const stripeOutline = (L: number): any[] => [
    [-0.005, 0.06 * L],
    [0.005, 0.06 * L],
    [0.005, 0.88 * L],
    [0, 0.93 * L, "sharp"],
    [-0.005, 0.88 * L],
  ];
  const feather = (o: {
    at: THREE.Vector3;
    along: THREE.Vector3;
    side: THREE.Vector3;
    L: number;
    W: number;
    color: string;
    tip?: string;
    stripe?: string;
    thick?: number;
    bone: any;
  }) => {
    const th = o.thick ?? 0.012;
    const base = { at: o.at, x: o.side, y: o.along, bone: o.bone };
    b.extrude(outline(o.L, o.W, 0, 1), { ...base, thickness: th, color: o.color });
    if (o.tip) b.extrude(outline(o.L, o.W, 0.74, 1), { ...base, thickness: th + 0.004, color: o.tip });
    if (o.stripe) b.extrude(stripeOutline(o.L), { ...base, thickness: th + 0.006, color: o.stripe });
  };

  // ================================================================================================
  // NECK
  // ================================================================================================
  const neckPath = catmull([M.neckBase, [0, 1.22, 0.78], M.headPivot]);
  const neck = b.sweep(neckPath, [0.2, 0.2, 0.17], {
    bone: [J.neck1, J.neck2],
    color: P.jaguarOrange,
    sectors: [[125, 235, P.cream]],
    sides: 8,
    smooth: false,
  });
  const neckSkin = b.surface(neck);
  const neckBone = (t: number) => (t < 0.55 ? J.neck1 : J.neck2);

  // ink rings
  for (const t of [0.33, 0.57]) {
    const ring = neckSkin.loop(neckPath.at(t), { dir: neckPath.tangentAt(t), lift: 0.004 });
    b.sweep(ring, 0.006, { color: INK, bone: neckBone(t) });
  }
  // rosettes + dot rows on the neck flanks
  const rosette = (
    surf: any,
    h: any,
    size: number,
    centre: string,
    bone: any,
    lift = 0,
    ringColor = INK,
    count = 6,
  ) => {
    dotAt(h, size * 0.6, centre, bone, { lift });
    b.ring(h, { count, radius: size }).items.forEach((it: any) => {
      dotAt(surf.nearest(it.at), size * 0.3, ringColor, bone, { lift });
    });
  };
  for (const s of SIDES) {
    rosette(neckSkin, neck.at(0.45, s * 75), 0.03, P.hotPink, J.neck1);
    for (let i = 0; i < 5; i++) {
      const t = 0.38 + i * 0.04;
      dotAt(neck.at(t, s * 118), 0.011, i % 2 ? P.cobalt : P.cream, neckBone(t));
    }
  }

  // zig-zag collar of cones where neck meets skull
  {
    const t = 0.62;
    const ringItems = b.ring(frame(neckPath.at(t), neckPath.tangentAt(t)), { count: 14, radius: 0.18, tilt: 35 }).items;
    ringItems.forEach((it: any, i: number) => {
      put(cone(0.03, 0.065, 4), it.at, it.axis, i % 2 ? P.cream : P.cobalt, J.neck2);
    });
  }

  // ruff: two overlapping rings of 12 broad blades
  const ruffs = [
    { t: 0.22, from: 0, to: 330, radius: 0.17, tilt: -35, L: 0.2, W: 0.12, cols: [P.cobalt, P.turquoise, P.gold, P.hotPink] },
    { t: 0.08, from: 15, to: 345, radius: 0.19, tilt: -42, L: 0.22, W: 0.13, cols: [P.hotPink, P.gold, P.turquoise, P.cobalt] },
  ];
  for (const r of ruffs) {
    const tan = neckPath.tangentAt(r.t);
    const items = b.ring(frame(neckPath.at(r.t), tan), {
      count: 12,
      radius: r.radius,
      fromDeg: r.from,
      toDeg: r.to,
      tilt: r.tilt,
    }).items;
    items.forEach((it: any, i: number) => {
      const along = new THREE.Vector3().copy(it.axis).normalize();
      const side = new THREE.Vector3().crossVectors(along, tan).normalize();
      feather({
        at: new THREE.Vector3().copy(it.at).addScaledVector(along, -0.02),
        along,
        side,
        L: r.L,
        W: r.W,
        color: r.cols[i % 4],
        tip: P.cream,
        thick: 0.012,
        bone: J.neck1,
      });
    });
  }

  // ================================================================================================
  // SKULL
  // ================================================================================================
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), P.gold, { bone: J.head, at: C, scale: SK, flat: true });
  const skin = b.surface(skull);
  b.part(new THREE.SphereGeometry(1, 10, 8, 0, Math.PI * 2, Math.PI * 0.75, Math.PI * 0.25), P.cream, {
    bone: J.head,
    at: C,
    scale: [SK[0] * 1.03, SK[1] * 1.03, SK[2] * 1.03],
    flat: true,
  });
  // ink line along the cream throat edge
  b.sweep(skin.loop(V(0, 1.286, 0.97), { dir: [0, 1, 0], lift: 0.012 }), 0.005, { color: INK, bone: J.head });

  const hitAt = (az: number, el: number) => {
    const h = skin.around(C).at(az, el);
    if (h) return h;
    const a = az * D;
    const e = el * D;
    return skin.nearest(
      C.clone().add(V(Math.sin(a) * Math.cos(e) * SK[0], Math.sin(e) * SK[1], Math.cos(a) * Math.cos(e) * SK[2])),
    );
  };
  const rayDown = (x: number, z: number) => skin.ray([x, 2, z], [0, -1, 0]) ?? skin.nearest(V(x, 1.5, z));
  const skp = (az: number, el: number, lift: number) => {
    const h = hitAt(az, el);
    return h.at.clone().addScaledVector(h.n, lift);
  };

  // ================================================================================================
  // EYES, BROWS, LASHES, DOT RINGS, CHEEKS
  // ================================================================================================
  for (const s of SIDES) {
    const eh = hitAt(s * 52, 10);
    const n = eh.n;
    const p = eh.at;
    put(cyl(0.085, 0.03, 12), p.clone().addScaledVector(n, 0.004), n, INK, J.head);
    put(new THREE.SphereGeometry(0.068, 10, 8), p, n, P.eyeWhite, J.head);
    put(cyl(0.044, 0.016, 12), p.clone().addScaledVector(n, 0.064), n, P.cobalt, J.head);
    put(cyl(0.025, 0.014, 10), p.clone().addScaledVector(n, 0.069), n, INK, J.head);
    put(sph(0.01), eh.moved([0.016, 0.071, 0.016]).at, n, WHITE, J.head);

    // lashes
    b.ring(eh, { count: 3, radius: 0.086, fromDeg: -55, toDeg: 55 }).items.forEach((it: any) => {
      put(cone(0.009, 0.05, 5), it.at, it.axis, INK, J.head);
    });

    // concentric dot rings around the lower half of the eye
    const rings: [number, number, number, string][] = [
      [0.105, 6, 0.011, P.cobalt],
      [0.123, 7, 0.01, P.coral],
      [0.141, 8, 0.0095, P.lime],
    ];
    for (const [radius, count, r, col] of rings) {
      b.ring(eh, { count, radius, fromDeg: 80, toDeg: 280 }).items.forEach((it: any) => {
        dotAt(skin.nearest(it.at), r, col, J.head);
      });
    }

    // heavy gold brow with ink outline
    const browPts = [
      [34, 30],
      [52, 39],
      [88, 30],
    ];
    const inkPts = [
      [34, 24],
      [52, 33],
      [88, 24],
    ];
    b.sweep(catmull(inkPts.map(([a, e]) => skp(s * a, e, 0.012))), [0.026, 0.036, 0.026], {
      bone: J.head,
      color: INK,
      sides: 6,
    });
    const brow = b.sweep(catmull(browPts.map(([a, e]) => skp(s * a, e, 0.018))), [0.02, 0.032, 0.02], {
      bone: J.head,
      color: P.gold,
      sides: 6,
    });
    [0.28, 0.5, 0.72].forEach((t, i) => dotAt(brow.at(t, 0), 0.009, i === 1 ? P.cobalt : P.hotPink, J.head));

    // cheek rosettes
    rosette(skin, hitAt(s * 125, 3), 0.04, P.hotPink, J.head);
    rosette(skin, hitAt(s * 80, -62), 0.036, P.turquoise, J.head, 0.006);
  }

  // forehead flower with leaves
  {
    const fh = hitAt(0, 55);
    b.ring(fh, { count: 5, radius: 0.034 }).items.forEach((it: any) => {
      dotAt(skin.nearest(it.at), 0.021, P.coral, J.head, { flat: 0.45 });
    });
    dotAt(fh, 0.018, P.cobalt, J.head, { lift: 0.004, flat: 0.6 });
    b.ring(fh, { count: 5, radius: 0.055, fromDeg: 36, toDeg: 324 }).items.forEach((it: any) => {
      const hh = skin.nearest(it.at);
      const d = new THREE.Vector3().copy(it.axis).addScaledVector(hh.n, 0.2).normalize();
      put(cone(0.013, 0.055, 4), hh.at.clone().addScaledVector(hh.n, 0.003), d, P.leafGreen, J.head);
    });
  }

  // row of dots round the back of the head
  {
    const cols = [P.cream, P.coral, P.cobalt];
    let i = 0;
    for (let az = 100; az <= 260; az += 16) dotAt(hitAt(az, 28), 0.013, cols[i++ % 3], J.head);
  }

  // ================================================================================================
  // UPPER BEAK (head bone)
  // ================================================================================================
  const beakPath = catmull([
    [0, 1.42, 1.06],
    [0, 1.43, 1.22],
    [0, 1.41, 1.36],
    [0, 1.37, 1.43],
    M.beakTip,
  ]);
  const beak = b.sweep(
    beakPath,
    (t: number) => {
      const k = 1 - Math.pow(t, 1.7);
      return [0.1 * k, 0.12 * k];
    },
    {
      bone: J.head,
      color: P.beakYellow,
      bands: [
        [0.8, P.beakYellow],
        [1, P.beakTip],
      ],
      sides: 8,
      smooth: false,
      caps: { start: "flat", end: "point" },
    },
  );
  let bi = 0;
  b.along(
    beak,
    6,
    (at: any) => {
      dotAt(at, 0.014, bi++ % 2 ? P.hotPink : P.gold, J.head, { flat: 0.55 });
    },
    { from: 0.4, to: 0.85 },
  );
  for (const s of SIDES) {
    const nf = beak.at(0.38, s * 55);
    dotAt(nf, 0.025, P.cream, J.head, { flat: 0.5 });
    dotAt(nf, 0.016, INK, J.head, { flat: 0.6, lift: 0.004 });
    [0.5, 0.62, 0.74].forEach((t, i) => dotAt(beak.at(t, s * 85), 0.012 - i * 0.001, i === 1 ? P.coral : P.cobalt, J.head));
    b.sweep(beak.line(s * 115, 0.003).slice(0.35, 0.97), 0.005, { color: INK, bone: J.head });
  }

  // ================================================================================================
  // LOWER BEAK (jaw bone)
  // ================================================================================================
  const lowerPath = catmull([
    [0, 1.285, 1.02],
    [0, 1.285, 1.16],
    [0, 1.295, 1.3],
    [0, 1.315, 1.385],
  ]);
  const lower = b.sweep(
    lowerPath,
    (t: number) => {
      const k = 1 - Math.pow(t, 1.5);
      return [0.085 * k + 0.004, 0.045 * k + 0.004];
    },
    {
      bone: J.jaw,
      color: P.beakYellow,
      bands: [
        [0.82, P.beakYellow],
        [1, P.beakTip],
      ],
      sides: 8,
      smooth: false,
      caps: { start: "flat", end: "point" },
    },
  );
  // red forked tongue
  b.extrude(
    [
      [-0.03, 0],
      [0.03, 0],
      [0.027, 0.1],
      [0.02, 0.17],
      [0.017, 0.23, "sharp"],
      [0.005, 0.16],
      [-0.005, 0.16],
      [-0.017, 0.23, "sharp"],
      [-0.02, 0.17],
      [-0.027, 0.1],
    ] as any,
    { at: [0, 1.33, 1.06], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.012, color: P.red, bone: J.jaw },
  );
  for (const s of SIDES) {
    // gape line, fangs, dots
    b.sweep(lower.line(s * 72, 0.003).slice(0.12, 0.92), 0.0055, { color: P.hotPink, bone: J.jaw });
    [0.22, 0.38, 0.54, 0.7].forEach((t) => {
      const f = lower.at(t, s * 60);
      put(cone(0.007, 0.032, 5), f.at.clone().add(V(0, -0.004, 0)), V(0, 1, 0), P.claw, J.jaw);
    });
    [0.3, 0.55].forEach((t) => dotAt(lower.at(t, s * 100), 0.01, P.coral, J.jaw));
  }

  // ================================================================================================
  // EARS
  // ================================================================================================
  for (const s of SIDES) {
    const eh2 = rayDown(s * 0.18, 0.93);
    const a = V(s * 0.55, 0.2, 0.8).normalize();
    const E = eh2.at.clone().add(V(0, 0.045, 0));
    put(cyl(0.095, 0.03, 10), E.clone().addScaledVector(a, -0.006), a, INK, J.head);
    put(cyl(0.085, 0.04, 10), E.clone(), a, P.jaguarOrange, J.head);
    put(cyl(0.055, 0.046, 10), E.clone().addScaledVector(a, 0.004), a, P.cream, J.head);
    b.ring(frame(E, a), { count: 8, radius: 0.07 }).items.forEach((it: any) => {
      put(sph(0.009), new THREE.Vector3().copy(it.at).addScaledVector(a, 0.02), a, P.hotPink, J.head, [1, 0.5, 1]);
    });
  }

  // ================================================================================================
  // HORNS (banded)
  // ================================================================================================
  for (const s of SIDES) {
    const hb = rayDown(s * 0.06, 0.91).at;
    const offs: [number, number, number][] = [
      [0, -0.03, 0],
      [s * 0.012, 0.07, -0.01],
      [s * 0.045, 0.145, -0.03],
      [s * 0.11, 0.2, -0.07],
    ];
    const horn = b.sweep(catmull(offs.map(([x, y, z]) => hb.clone().add(V(x, y, z)))), [0.042, 0.034, 0.022, 0.004], {
      bone: J.head,
      color: P.hotPink,
      bands: [
        [0.17, P.hotPink],
        [0.34, P.cream],
        [0.51, P.turquoise],
        [0.68, P.hotPink],
        [0.84, P.cream],
        [1, P.gold],
      ],
      sides: 8,
      smooth: false,
      caps: { start: "flat", end: "point" },
    });
    [0.17, 0.34, 0.51, 0.68, 0.84].forEach((t) => dotAt(horn.at(t, 180), 0.011, INK, J.head, { flat: 0.6 }));
  }

  // ================================================================================================
  // CREST: 7 feather blades fanned up and back
  // ================================================================================================
  {
    const P0 = rayDown(0, 0.8);
    const base = P0.at.clone().addScaledVector(P0.n, -0.02);
    const u0 = V(0, 0.9, -0.4).normalize();
    const X = V(1, 0, 0);
    const np = new THREE.Vector3().crossVectors(X, u0).normalize();
    const cols = [P.lime, P.turquoise, P.hotPink, P.cobalt, P.gold, P.lime, P.turquoise];
    for (let i = 0; i < 7; i++) {
      const k = i - 3;
      const ang = k * 18 * D;
      const along = u0.clone().multiplyScalar(Math.cos(ang)).addScaledVector(X, Math.sin(ang)).normalize();
      const side = new THREE.Vector3().crossVectors(along, np).normalize();
      feather({
        at: base.clone().addScaledVector(np, (i % 2 ? 1 : -1) * 0.006),
        along,
        side,
        L: 0.31 - 0.032 * Math.abs(k),
        W: 0.075,
        color: cols[i],
        tip: INK,
        stripe: P.cream,
        thick: 0.01,
        bone: J.head,
      });
    }
  }

  // ================================================================================================
  // flush merged decoration and settle the rest pose (beak slightly open)
  // ================================================================================================
  for (const e of batches.values()) {
    const merged = mergeGeometries(e.geos);
    if (merged) b.part(merged, e.color, { bone: e.bone, at: [0, 0, 0], flat: true });
  }
  b.pose(J.jaw, { axis: [1, 0, 0], deg: 6 });
}
```