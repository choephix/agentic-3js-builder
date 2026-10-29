<!-- call: plan -->

```json
{
  "name": "The Five-Mawed Hydra",
  "description": "A God of War style five-headed hydra: a heavy serpent torso coiled on the ground, a spiked tail sweeping back, five scaled necks fanning up to armored skulls with hinged jaws, glowing ember eyes, gold-fitted bone plating and glowing teal runes along every spine.",
  "builderName": "hydra",
  "size": [5.2, 3.6, 5.6],
  "layout": "The model is a five-headed hydra facing +Z, standing on y = 0. The BODY (part 1) is a massive serpent torso lying along the ground: a broad coiled belly from z = 2.2 back to z = -1.0, thickest at about y = 1.0 around z = 0.3, sinking slightly into the floor line, with two short fore-claw limbs gripping the ground at about z = 1.6 on either side (x = ±1.3) and the tail tapering from the rear of the torso back and down to a fine point near z = -3.2, curling slightly to the right. From the top of the torso five NECK roots fan out (mounts neckRootC at [0, 1.5, 0.6], neckRootML at [0.8, 1.35, 0.35], neckRootMR at [-0.8, 1.35, 0.35], neckRootOL at [1.55, 1.15, 0.05], neckRootOR at [-1.55, 1.15, 0.05]): the central neck rises tallest and most forward to about y = 3.05, the mid necks rise to about y = 2.8 leaning out to x = ±1.05, and the outer necks are shortest, curving out to x = ±1.9 at about y = 2.35, all five necks sweeping forward so every head faces +Z. Each HEAD caps its neck tip at the mounts headC [0, 3.05, 1.5], headML [1.05, 2.8, 1.35], headMR [-1.05, 2.8, 1.35], headOL [1.95, 2.35, 1.05], headOR [-1.95, 2.35, 1.05]; heads are heavy angular skulls with openable jaws (built as separate upper and lower jaw), fangs, horn crowns and glowing eyes, the central head the largest with a bone crest crown. ARMOR (part 4) runs the whole dorsal line: big overlapping bone plates and ridged spikes down the torso's back, smaller plate rings and spikes following each neck's outside curve, a large crest crown piece on the central head's skull, gold trim fittings at each plate's base, and small glowing teal runes stamped on the largest plates. Style everywhere: dark sea-green scaled hide with a pale bone-colored belly countershade, weathered bone plates with gold God of War fittings, deep crimson throat and mouth interiors, ember-orange glowing eyes and mouth glow, hard low-poly facets, ink-dark seams.",
  "palette": {
    "scale": "#3d5a4a",
    "scaleDark": "#24352c",
    "scaleBelly": "#b3ab8c",
    "bone": "#d9cbaa",
    "boneDark": "#8f8570",
    "horn": "#cfc4a6",
    "gold": "#c9973c",
    "goldDark": "#7a5a22",
    "ember": "#ff7a26",
    "emberCore": "#ffd23f",
    "crimson": "#7a1f26",
    "claw": "#e8e0c8",
    "rune": "#2fd8c8",
    "ink": "#141a17",
    "tooth": "#efe8d4"
  },
  "mounts": {
    "neckRootC": [0, 1.5, 0.6],
    "neckRootML": [0.8, 1.35, 0.35],
    "neckRootMR": [-0.8, 1.35, 0.35],
    "neckRootOL": [1.55, 1.15, 0.05],
    "neckRootOR": [-1.55, 1.15, 0.05],
    "headC": [0, 3.05, 1.5],
    "headML": [1.05, 2.8, 1.35],
    "headMR": [-1.05, 2.8, 1.35],
    "headOL": [1.95, 2.35, 1.05],
    "headOR": [-1.95, 2.35, 1.05],
    "tailRoot": [0, 0.75, -1.0],
    "spineTop": [0, 1.5, 0.5]
  },
  "joints": [
    { "name": "body", "at": [0, 0.95, 0.3], "dir": [0, 1, 0], "role": "spine" },
    { "name": "tail1", "parent": "body", "at": [0, 0.75, -1.0], "dir": [0, -0.15, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 0.55, -2.0], "dir": [0.1, -0.25, -1], "role": "tail" },
    { "name": "neckC1", "parent": "body", "at": [0, 1.5, 0.6], "dir": [0, 0.85, 0.53], "role": "neck" },
    { "name": "neckC2", "parent": "neckC1", "at": [0, 2.15, 1.0], "dir": [0, 0.95, 0.32], "role": "neck" },
    { "name": "neckC3", "parent": "neckC2", "at": [0, 2.75, 1.25], "dir": [0, 0.9, 0.45], "role": "neck" },
    { "name": "neckML1", "parent": "body", "at": [0.8, 1.35, 0.35], "dir": [0.25, 0.9, 0.36], "role": "neck" },
    { "name": "neckML2", "parent": "neckML1", "at": [1.15, 2.0, 0.6], "dir": [0.3, 0.9, 0.3], "role": "neck" },
    { "name": "neckML3", "parent": "neckML2", "at": [1.4, 2.55, 0.85], "dir": [0.25, 0.85, 0.45], "role": "neck" },
    { "name": "neckMR1", "parent": "body", "at": [-0.8, 1.35, 0.35], "dir": [-0.25, 0.9, 0.36], "role": "neck" },
    { "name": "neckMR2", "parent": "neckMR1", "at": [-1.15, 2.0, 0.6], "dir": [-0.3, 0.9, 0.3], "role": "neck" },
    { "name": "neckMR3", "parent": "neckMR2", "at": [-1.4, 2.55, 0.85], "dir": [-0.25, 0.85, 0.45], "role": "neck" },
    { "name": "neckOL1", "parent": "body", "at": [1.55, 1.15, 0.05], "dir": [0.6, 0.8, 0.1], "role": "neck" },
    { "name": "neckOL2", "parent": "neckOL1", "at": [2.15, 1.7, 0.2], "dir": [0.5, 0.8, 0.33], "role": "neck" },
    { "name": "neckOR1", "parent": "body", "at": [-1.55, 1.15, 0.05], "dir": [-0.6, 0.8, 0.1], "role": "neck" },
    { "name": "neckOR2", "parent": "neckOR1", "at": [-2.15, 1.7, 0.2], "dir": [-0.5, 0.8, 0.33], "role": "neck" },
    { "name": "headC", "parent": "neckC3", "at": [0, 3.05, 1.5], "dir": [0, 0.2, 1], "role": "head" },
    { "name": "jawC", "parent": "headC", "at": [0, 2.95, 1.62], "dir": [0, 0.1, 1], "role": "jaw" },
    { "name": "headML", "parent": "neckML3", "at": [1.05, 2.8, 1.35], "dir": [0.1, 0.2, 1], "role": "head" },
    { "name": "jawML", "parent": "headML", "at": [1.05, 2.71, 1.46], "dir": [0.1, 0.1, 1], "role": "jaw" },
    { "name": "headMR", "parent": "neckMR3", "at": [-1.05, 2.8, 1.35], "dir": [-0.1, 0.2, 1], "role": "head" },
    { "name": "jawMR", "parent": "headMR", "at": [-1.05, 2.71, 1.46], "dir": [-0.1, 0.1, 1], "role": "jaw" },
    { "name": "headOL", "parent": "neckOL2", "at": [1.95, 2.35, 1.05], "dir": [0.15, 0.2, 1], "role": "head" },
    { "name": "jawOL", "parent": "headOL", "at": [1.95, 2.27, 1.16], "dir": [0.15, 0.1, 1], "role": "jaw" },
    { "name": "headOR", "parent": "neckOR2", "at": [-1.95, 2.35, 1.05], "dir": [-0.15, 0.2, 1], "role": "head" },
    { "name": "jawOR", "parent": "headOR", "at": [-1.95, 2.27, 1.16], "dir": [-0.15, 0.1, 1], "role": "jaw" }
  ],
  "parts": [
    {
      "id": "torso",
      "builds": "The serpent body: a broad low-poly lofted torso lying along the ground from z = 2.2 (chest, below the central neck root) back to the tail root mount at [0, 0.75, -1.0], thickest and tallest (about 1.1 m radius) near z = 0.3 and sinking to touch the floor, with a pale bone-belly countershade band on the underside and dark green scaled hide on top. The tail is a tapering chain from tailRoot through tail2 to a fine curled tip near z = -3.2, ringed in dark bands, ending in a spiked bone tail-club of 3-4 bone spikes. Two short muscular fore-limb arms at x = ±1.3, z = 1.6 reach down from the torso's flanks to splayed three-claw feet gripping the floor (claws pale bone), floor: true. Hide detail: raised scale ridges as small darker studs scattered on the upper flanks, ink-dark seam rings at the tail joints, gold band fittings where the neck roots meet the torso, and ember-orange glow seeping between the belly plates near the chest.",
      "box": [[-1.8, 0, -3.2], [1.8, 1.75, 2.3]],
      "attaches": "Torso top carries the five neckRoot mounts and the spineTop mount; tail chain starts at the tailRoot mount. Neck roots are covered by the necks part; gold collar rings at each neckRoot are built by the torso and the necks part seats its first tube section over them.",
      "joints": ["body", "tail1", "tail2"],
      "floor": true,
      "budget": 220
    },
    {
      "id": "necks",
      "builds": "Five serpent necks, one tube each from its neckRoot mount up to its head mount: neckC the thickest rising to headC, neckML/neckMR mid thickness to headML/headMR, neckOL/neckOR the thinnest curving widest to headOL/headOR. Each neck is a tapering smooth-skinned sweep in the dark green scale colour with a pale belly countershade strip on the underside facing inward, and on the outer curve a row of small dark scale ridges. Throat detail: a crimson throat patch facing forward under each head, gold ring collars at each neck's midpoint and at its root over the torso's gold fittings, and a few raised scale studs along the inner curve. The neck tubes seat over the torso's root collars and end exactly at their head mounts, where the heads part caps them.",
      "box": [[-2.3, 1.05, -0.3], [2.3, 3.15, 1.7]],
      "attaches": "Rooted on the five neckRoot mounts on the torso, riding the neck chains (neckC1-3, neckML1-3, neckMR1-3, neckOL1-2, neckOR1-2); each neck's end lands exactly on its head mount (headC, headML, headMR, headOL, headOR) where the heads part begins.",
      "joints": ["body", "neckC1", "neckC2", "neckC3", "neckML1", "neckML2", "neckML3", "neckMR1", "neckMR2", "neckMR3", "neckOL1", "neckOL2", "neckOR1", "neckOR2"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "heads",
      "builds": "Five angular crocodile-drake skulls in the God of War style, one per head mount, the central head largest (about 0.55 m long) and the outer pair smallest (about 0.38 m). Each skull: a blocky faceted skull cap and brow in dark green scale with a bone-plated brow ridge, two ember-orange glowing eyes set deep under the brow (small emberCore glints), a separate upper jaw and lower jaw (jaw joints) hinged to open, the mouth interior crimson with ember-orange glow at the throat, rows of pale teeth as small cones along both jaw lines with 2-3 long fangs at the front, and dark ink lip seams. Horns: a crown of two swept bone horns curving back and out on each head, the central head with a taller third central horn. Bone nose-bridge plates down each snout with a gold fitting band at the skull's rear where it meets the neck, and small gold cheek studs. Nostrils as dark ink slits on the snout top. All heads face +Z, sized to their mounts.",
      "box": [[-2.5, 2.0, 0.6], [2.5, 3.5, 2.5]],
      "attaches": "Each head is seated exactly on its head mount (headC, headML, headMR, headOL, headOR), capping its neck tube; skulls ride the head joints, lower jaws ride the jaw joints.",
      "joints": ["headC", "jawC", "headML", "jawML", "headMR", "jawMR", "headOL", "jawOL", "headOR", "jawOR"],
      "floor": false,
      "budget": 280
    },
    {
      "id": "armor",
      "builds": "The dorsal bone armor running the whole dorsal line, God of War style: on the torso's back a ridge of 4-5 large overlapping faceted bone plates (weathered bone with boneDark edges) from the chest back to the tail root, each plate edged with a thin gold trim strip and the two largest carrying small glowing teal runes stamped as flat rune-shaped parts seated on the plate faces. Ridged bone spikes (dark tipped) rise from alternate plates and along the tail's top every segment, shrinking to the tip. On each neck: a row of small bone plate scutes down its outer curve following the neck's bend, seated on the neck surface, with a gold base fitting per scute and a short dark spike on the scutes near each head. A large central-head crest crown: a fan of 5 bone blades rising from the central skull's rear, gold-fitted at the base, plus one smaller crest of 3 blades on each mid head. All armor sits flush on the body, necks and central head built by the other parts; nothing floats free.",
      "box": [[-2.2, 0.15, -3.3], [2.2, 3.35, 1.9]],
      "attaches": "Torso plates and tail spikes ride the body/tail chains along the torso's dorsal line; neck scutes and spikes seat on the necks part's five neck tubes along their outer curve; the crest crowns seat on the heads part's central and mid skulls at the head joints.",
      "joints": ["body", "tail1", "tail2", "neckC1", "neckC2", "neckC3", "neckML1", "neckML2", "neckML3", "neckMR1", "neckMR2", "neckMR3", "neckOL1", "neckOL2", "neckOR1", "neckOR2", "headC", "headML", "headMR"],
      "floor": false,
      "budget": 210
    }
  ]
}
```

<!-- call: necks -->

```ts
import * as THREE from "three";
import { frame, rng, catmull } from "agentic-3js-builder";

type Ctx = { b: any; J: any; P: any; M: any };

export function buildNecks({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const necks = [
    { id: "C", root: M.neckRootC, joints: ["neckC1", "neckC2", "neckC3"], head: M.headC, r: 0.34, mid: [0, 2.3, 0.95], s: 0 },
    { id: "ML", root: M.neckRootML, joints: ["neckML1", "neckML2", "neckML3"], head: M.headML, r: 0.26, mid: [1.35, 2.1, 0.55], s: 1 },
    { id: "MR", root: M.neckRootMR, joints: ["neckMR1", "neckMR2", "neckMR3"], head: M.headMR, r: 0.26, mid: [-1.35, 2.1, 0.55], s: -1 },
    { id: "OL", root: M.neckRootOL, joints: ["neckOL1", "neckOL2"], head: M.headOL, r: 0.2, mid: [2.3, 1.75, 0.3], s: 1 },
    { id: "OR", root: M.neckRootOR, joints: ["neckOR1", "neckOR2"], head: M.headOR, r: 0.2, mid: [-2.3, 1.75, 0.3], s: -1 },
  ];
  for (const n of necks) {
    const path = catmull([n.root, n.mid, n.head]);
    const chainBones = n.joints.map((j: string) => J[j]);
    const tube = b.sweep(path, (t: number) => n.r * (1.15 - 0.45 * t), {
      bone: chainBones,
      color: P.scale,
      sectors: [[125, 235, P.scaleBelly]],
      sides: 8,
    });
    // root gold collar and mid collar
    for (const t of [0.04, 0.5]) {
      const at = tube.at(t, 0);
      const rr = n.r * (1.15 - 0.45 * t) * 1.08;
      b.stick(new THREE.CylinderGeometry(rr, rr, 0.07, 8), P.gold, at, { embed: 0.5 });
      const ring = b.ring(path.at(t) ? frame(path.at(t), path.tangentAt(t)) : at, { count: 0 });
    }
    // outer-curve ridges
    for (let i = 1; i <= 6; i++) {
      const t = 0.12 + i * 0.12;
      const hit = tube.at(t, n.s === 0 ? 0 : n.s * 40 + 0);
      b.stick(new THREE.ConeGeometry(0.05, 0.14, 5), P.scaleDark, hit, { embed: 0.15 });
    }
    // inner-curve studs
    for (let i = 0; i < 3; i++) {
      const hit = tube.at(0.25 + i * 0.2, n.s === 0 ? 90 : -n.s * 70);
      b.stick(new THREE.SphereGeometry(0.035, 5, 4), P.scaleDark, hit, { embed: 0.3 });
    }
    // crimson throat patch facing forward under head
    const th = tube.at(0.9, 150);
    b.stick(new THREE.BoxGeometry(n.r * 0.9, 0.02, n.r * 1.2), P.crimson, th, { embed: 0.4 });
    // ink seam ring near head
    const sm = tube.at(0.8, 0);
    b.stick(new THREE.CylinderGeometry(n.r * 0.7, n.r * 0.7, 0.025, 8), P.ink, sm, { embed: 0.5 });
  }
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { frame, rng, catmull, offset } from "agentic-3js-builder";

export function buildTorso({ b, J, P, M }: any) {
  const R = rng(11);
  const body = J.body, t1 = J.tail1, t2 = J.tail2;

  // Torso loft: chest at z=2.2 back to tail root at z=-1
  const stations = [
    { at: [0, 0.55, 2.2], w: 0.9, h: 0.8 },
    { at: [0, 0.85, 1.4], w: 1.9, h: 1.5 },
    { at: [0, 1.0, 0.3], w: 2.5, h: 2.0 },
    { at: [0, 0.95, -0.4], w: 2.0, h: 1.75 },
    { at: [0, 0.78, -1.0], w: 1.1, h: 1.2 },
  ];
  const torso = b.loft(stations, {
    bone: [t1, body],
    color: P.scale,
    sectors: [[125, 235, P.scaleBelly]],
    sides: 10,
  });

  // belly plates with ember glow near chest
  for (let i = 0; i < 5; i++) {
    const z = 2.0 - i * 0.28;
    b.part(new THREE.BoxGeometry(0.9 - i * 0.05, 0.05, 0.1), P.ember, {
      bone: body, at: [0, 0.1 + i * 0.02, z], flat: true,
    });
    b.part(new THREE.BoxGeometry(1.0 - i * 0.05, 0.04, 0.05), P.ink, {
      bone: body, at: [0, 0.09 + i * 0.02, z + 0.08], flat: true,
    });
  }

  // gold collars at neck roots
  for (const k of ["neckRootC", "neckRootML", "neckRootMR", "neckRootOL", "neckRootOR"]) {
    const m = M[k];
    b.part(new THREE.TorusGeometry(0.34, 0.06, 6, 10), P.gold, {
      bone: body, at: [m[0], m[1] - 0.02, m[2]], rotation: [90, 0, 0], flat: true,
    });
  }

  // scale studs on upper flanks
  const skin = b.surface(torso);
  const hits = skin.scatter(70, { rng: R, minDist: 0.22, filter: (h: any) => h.n.y > 0.1 });
  for (const h of hits)
    b.stick(new THREE.ConeGeometry(0.06, 0.1, 5), P.scaleDark, h, { embed: 0.3 });

  // tail
  const tailPath = catmull([
    [0, 0.75, -1], [0, 0.65, -1.6], [0, 0.55, -2], [0.1, 0.35, -2.6], [0.35, 0.22, -3.1],
  ]);
  const tail = b.sweep(tailPath, [0.55, 0.05], {
    bone: [t1, t2],
    color: P.scale,
    sectors: [[125, 235, P.scaleBelly]],
    sides: 8,
  });
  b.along(tail, 6, (at: any) => {
    b.stick(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 8), P.scaleDark, at, { embed: -0.1 });
  });
  for (const j of [t1, t2]) {
    b.part(new THREE.TorusGeometry(0.4, 0.03, 5, 10), P.ink, {
      bone: j, at: [j.at.x, j.at.y, j.at.z], rotation: [90, 0, 0], flat: true,
    });
  }
  // tail club spikes
  const tip = [0.35, 0.22, -3.1];
  b.part(new THREE.SphereGeometry(0.14, 6, 4), P.bone, { bone: t2, at: tip, flat: true });
  const dirs = [[0, 1, -0.3], [0.8, 0.3, -0.2], [-0.8, 0.3, -0.2], [0, 0.1, -1]];
  for (const d of dirs)
    b.spike(tip, d, 0.32, 0.06, { bone: t2, color: P.bone });

  // fore-limbs
  for (const s of [1, -1]) {
    const shoulder = [s * 1.1, 0.85, 1.6];
    const foot = [s * 1.4, 0.1, 1.9];
    const arm = b.chain(`torsoArm${s > 0 ? "L" : "R"}`, catmull([shoulder, [s * 1.35, 0.5, 1.7], foot]), {
      parent: body, names: [`torsoShoulder${s}`.replace("-", "R"), `torsoElbow${s}`.replace("-", "R"), `torsoWrist${s}`.replace("-", "R")], role: "arm",
    });
    b.sweep(arm, [0.3, 0.17], { color: P.scale });
    b.part(new THREE.SphereGeometry(0.24, 7, 5), P.scaleDark, {
      bone: arm.tip ?? body, at: [foot[0], 0.2, foot[2]], scale: [1.1, 0.7, 1.4], flat: true,
    });
    b.part(new THREE.TorusGeometry(0.2, 0.04, 5, 8), P.gold, {
      bone: body, at: [s * 1.3, 0.62, 1.68], rotation: [90, 0, 0], flat: true,
    });
    for (const a of [-0.5, 0, 0.5]) {
      b.spike([foot[0] + a * 0.25, 0.12, foot[2] + 0.2], [a * 0.6, -0.15, 1], 0.3, 0.05, {
        bone: arm.tip ?? body, color: P.claw,
      });
    }
  }
}
```

<!-- call: heads -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHeads({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const heads = [
    { n: "C", s: 1.0, x: 0, jx: 0 },
    { n: "ML", s: 0.8, x: 1, jx: 0.1 },
    { n: "MR", s: 0.8, x: -1, jx: -0.1 },
    { n: "OL", s: 0.7, x: 1, jx: 0.15 },
    { n: "OR", s: 0.7, x: -1, jx: -0.15 },
  ];
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cone = (r: number, h: number, seg = 5) => new THREE.ConeGeometry(r, h, seg);

  for (const hd of heads) {
    const head = J["head" + hd.n];
    const jaw = J["jaw" + hd.n];
    const m = M["head" + hd.n];
    const S = hd.s;
    // local helper: position relative to head mount (x right-left in model space, y up, z forward)
    const p = (x: number, y: number, z: number): [number, number, number] => [m[0] + x * S, m[1] + y * S, m[2] + z * S];
    const put = (g: THREE.BufferGeometry, c: string, bone: any, at: [number, number, number], rot?: [number, number, number]) =>
      b.part(g, c, { bone, at, rotation: rot, flat: true });

    // skull cap and snout (upper jaw)
    put(box(0.34 * S, 0.22 * S, 0.34 * S), P.scale, head, p(0, 0.02, 0.02));
    put(box(0.24 * S, 0.12 * S, 0.34 * S), P.scale, head, p(0, -0.01, 0.26));
    put(box(0.2 * S, 0.04 * S, 0.3 * S), P.scale, head, p(0, 0.06, 0.28));
    // bone brow ridge and nose bridge
    put(box(0.38 * S, 0.05 * S, 0.14 * S), P.bone, head, p(0, 0.13, 0.12));
    put(box(0.08 * S, 0.03 * S, 0.2 * S), P.bone, head, p(0, 0.09, 0.3));
    put(box(0.07 * S, 0.025 * S, 0.12 * S), P.boneDark, head, p(0, 0.075, 0.44));
    // gold rear band
    put(box(0.37 * S, 0.24 * S, 0.04 * S), P.gold, head, p(0, 0.02, -0.14));
    put(box(0.38 * S, 0.02 * S, 0.05 * S), P.goldDark, head, p(0, 0.13, -0.14));
    // upper mouth interior and lip seam
    put(box(0.2 * S, 0.02 * S, 0.3 * S), P.crimson, head, p(0, -0.065, 0.26));
    for (const s of [1, -1]) {
      put(box(0.012 * S, 0.012 * S, 0.34 * S), P.ink, head, p(s * 0.125, -0.06, 0.27));
      // eyes
      put(new THREE.SphereGeometry(0.035 * S, 6, 4), P.ember, head, p(s * 0.15, 0.08, 0.2));
      put(new THREE.SphereGeometry(0.014 * S, 5, 4), P.emberCore, head, p(s * 0.165, 0.09, 0.225));
      put(box(0.05 * S, 0.02 * S, 0.07 * S), P.boneDark, head, p(s * 0.15, 0.125, 0.2));
      // cheek studs
      put(new THREE.SphereGeometry(0.018 * S, 5, 4), P.gold, head, p(s * 0.175, -0.02, 0.0));
      // nostrils
      put(box(0.02 * S, 0.01 * S, 0.04 * S), P.ink, head, p(s * 0.05, 0.085, 0.4));
      // horns: 3 segments swept back and out
      for (let i = 0; i < 3; i++) {
        const t = i / 3;
        const g = cone((0.04 - i * 0.01) * S, 0.14 * S, 5);
        put(g, i === 2 ? P.boneDark : P.horn, head, p(s * (0.1 + t * 0.12), 0.15 + t * 0.07, -0.05 - t * 0.12), [-70, 0, s * -25]);
      }
      // upper fangs and teeth
      for (const z of [0.4, 0.34]) {
        put(cone(0.018 * S, (z > 0.38 ? 0.1 : 0.05) * S, 5), P.tooth, head, p(s * 0.1, -0.1, z), [180, 0, 0]);
      }
      for (let i = 0; i < 4; i++)
        put(cone(0.012 * S, 0.04 * S, 4), P.tooth, head, p(s * 0.105, -0.085, 0.1 + i * 0.07), [180, 0, 0]);
    }
    put(box(0.1 * S, 0.02 * S, 0.02 * S), P.ink, head, p(0, -0.065, 0.43));
    // central/third horn
    if (hd.n === "C") {
      put(cone(0.05 * S, 0.3 * S, 5), P.horn, head, p(0, 0.2, -0.05), [-25, 0, 0]);
      put(box(0.06 * S, 0.02 * S, 0.1 * S), P.gold, head, p(0, 0.14, 0.0));
    }
    // lower jaw
    const jp = (x: number, y: number, z: number) => p(x, y - 0.12, z);
    put(box(0.2 * S, 0.06 * S, 0.4 * S), P.scaleDark, jaw, jp(0, 0.0, 0.28));
    put(box(0.16 * S, 0.02 * S, 0.34 * S), P.crimson, jaw, jp(0, 0.04, 0.28));
    put(box(0.1 * S, 0.02 * S, 0.14 * S), P.ember, jaw, jp(0, 0.05, 0.06));
    put(box(0.14 * S, 0.03 * S, 0.1 * S), P.scaleBelly, jaw, jp(0, -0.04, 0.4));
    put(box(0.17 * S, 0.05 * S, 0.06 * S), P.boneDark, jaw, jp(0, -0.02, 0.5));
    for (const s of [1, -1]) {
      put(box(0.012 * S, 0.012 * S, 0.38 * S), P.ink, jaw, jp(s * 0.102, 0.01, 0.28));
      for (let i = 0; i < 4; i++)
        put(cone(0.012 * S, 0.04 * S, 4), P.tooth, jaw, jp(s * 0.085, 0.07, 0.15 + i * 0.07));
      put(cone(0.018 * S, 0.09 * S, 5), P.tooth, jaw, jp(s * 0.075, 0.1, 0.46));
    }
  }
}
```

<!-- call: armor -->

```ts
import * as THREE from "three";
import { frame, rng, glow } from "agentic-3js-builder";
import { glow as glowKit } from "agentic-3js-builder/kits/glow";

export function buildArmor({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // generic plate: faceted slab with gold trim, on a bone
  function plate(at: number[], w: number, h: number, d: number, bone: any, tilt = 0, rune = false) {
    const g = new THREE.BoxGeometry(w, h, d);
    b.part(g, P.bone, { bone, at, rotation: [tilt, 0, 0], flat: true });
    b.part(new THREE.BoxGeometry(w * 1.04, h * 0.18, d * 1.04), P.boneDark, {
      bone, at: [at[0], at[1] - h * 0.5, at[2]], rotation: [tilt, 0, 0], flat: true,
    });
    b.part(new THREE.BoxGeometry(w * 1.06, h * 0.08, d * 1.06), P.gold, {
      bone, at: [at[0], at[1] - h * 0.34, at[2]], rotation: [tilt, 0, 0], flat: true,
    });
    if (rune) {
      const y = at[1] + h * 0.5 + 0.01;
      const parts = [
        new THREE.BoxGeometry(0.04, 0.01, 0.26),
        new THREE.BoxGeometry(0.2, 0.01, 0.04),
        new THREE.BoxGeometry(0.04, 0.01, 0.14),
      ];
      const offs = [[0, 0, 0], [0, 0, 0.04], [0.08, 0, -0.06]];
      parts.forEach((g2, i) =>
        glowKit(b.part(g2, P.rune, { bone, at: [at[0] + offs[i][0], y, at[2] + offs[i][2]] }), 1.4),
      );
    }
  }

  function spike(at: number[], len: number, r: number, bone: any, dir: number[] = [0, 1, 0]) {
    b.part(new THREE.ConeGeometry(r, len, 6), P.bone, { bone, at, dir, flat: true });
    const tip = v(...at).addScaledVector(v(...dir).normalize(), len * 0.3);
    b.part(new THREE.ConeGeometry(r * 0.45, len * 0.45, 6), P.ink, {
      bone, at: [tip.x, tip.y, tip.z], dir, flat: true,
    });
    b.part(new THREE.CylinderGeometry(r * 1.15, r * 1.3, len * 0.1, 6), P.gold, {
      bone, at: [at[0], at[1] - len * 0.4, at[2]], flat: true,
    });
  }

  // torso dorsal plates: chest to tail root
  const zs = [1.45, 0.95, 0.4, -0.15, -0.7];
  const ys = [1.78, 2.02, 2.1, 1.98, 1.72];
  zs.forEach((z, i) => {
    const s = 1 - Math.abs(i - 2) * 0.12;
    plate([0, ys[i], z], 0.95 * s, 0.14, 0.62, J.body, -8 + i * 4, i === 1 || i === 2);
    if (i % 2 === 0) spike([0, ys[i] + 0.16, z], 0.42 * s, 0.09, J.body, [0, 1, -0.25]);
  });
  // side flank ridge studs
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++)
      b.part(new THREE.ConeGeometry(0.07, 0.2, 5), P.boneDark, {
        bone: J.body, at: [s * (0.85 - i * 0.04), 1.85 - i * 0.05, 1.1 - i * 0.55],
        dir: [s * 0.8, 0.6, 0], flat: true,
      });

  // tail spikes shrinking
  const tailPts: [any, number[], number][] = [
    [J.tail1, [0, 1.0, -1.3], 0.34],
    [J.tail1, [0, 0.9, -1.75], 0.28],
    [J.tail2, [0, 0.72, -2.2], 0.22],
    [J.tail2, [0.03, 0.55, -2.6], 0.16],
    [J.tail2, [0.06, 0.4, -2.95], 0.1],
  ];
  tailPts.forEach(([bn, p, l], i) => spike(p, l, 0.07 - i * 0.01, bn, [0, 1, -0.3]));

  // neck scutes
  const necks: [any[], number[][], number][] = [
    [[J.neckC1, J.neckC2, J.neckC3], [[0, 1.95, 0.5], [0, 2.4, 0.95], [0, 2.85, 1.2], [0, 3.05, 1.3]], 0],
    [[J.neckML1, J.neckML2, J.neckML3], [[0.9, 1.75, 0.2], [1.2, 2.3, 0.55], [1.45, 2.7, 0.8], [1.2, 2.9, 1.1]], 1],
    [[J.neckMR1, J.neckMR2, J.neckMR3], [[-0.9, 1.75, 0.2], [-1.2, 2.3, 0.55], [-1.45, 2.7, 0.8], [-1.2, 2.9, 1.1]], -1],
    [[J.neckOL1, J.neckOL2, J.neckOL2], [[1.75, 1.5, -0.1], [2.25, 1.95, 0.2], [2.45, 2.3, 0.6], [2.2, 2.5, 0.9]], 1],
    [[J.neckOR1, J.neckOR2, J.neckOR2], [[-1.75, 1.5, -0.1], [-2.25, 1.95, 0.2], [-2.45, 2.3, 0.6], [-2.2, 2.5, 0.9]], -1],
  ];
  necks.forEach(([bones, pts, s]) => {
    pts.forEach((p, i) => {
      const bn = bones[Math.min(i, bones.length - 1)];
      const sc = 1 - i * 0.12;
      const out = s * 0.0;
      b.part(new THREE.BoxGeometry(0.2 * sc, 0.06, 0.2 * sc), P.bone, {
        bone: bn, at: [p[0] + out, p[1], p[2] - 0.12], rotation: [-25, 0, s * -10], flat: true,
      });
      b.part(new THREE.CylinderGeometry(0.1 * sc, 0.11 * sc, 0.035, 6), P.gold, {
        bone: bn, at: [p[0], p[1] - 0.05, p[2] - 0.1], rotation: [-25, 0, 0], flat: true,
      });
      if (i >= 2)
        spike([p[0], p[1] + 0.1, p[2] - 0.15], 0.16, 0.035, bn, [s * 0.2, 1, -0.4]);
    });
  });

  // crest crowns
  function crest(bone: any, base: number[], n: number, size: number) {
    for (let i = 0; i < n; i++) {
      const a = (i - (n - 1) / 2) * 0.42;
      const len = size * (1 - Math.abs(a) * 0.35);
      const dir = [Math.sin(a), Math.cos(a) * 0.9, -0.45];
      const d = v(...dir).normalize();
      const c = v(...base).addScaledVector(d, len * 0.5);
      b.part(new THREE.ConeGeometry(size * 0.16, len, 4), P.bone, {
        bone, at: [c.x, c.y, c.z], dir, flat: true,
      });
      const t = v(...base).addScaledVector(d, len * 0.85);
      b.part(new THREE.ConeGeometry(size * 0.07, len * 0.3, 4), P.boneDark, {
        bone, at: [t.x, t.y, t.z], dir, flat: true,
      });
    }
    b.part(new THREE.BoxGeometry(size * 0.9, size * 0.12, size * 0.25), P.gold, {
      bone, at: [base[0], base[1] - 0.01, base[2]], flat: true,
    });
  }
  crest(J.headC, [M.headC[0], M.headC[1] + 0.2, M.headC[2] - 0.25], 5, 0.6);
  crest(J.headML, [M.headML[0], M.headML[1] + 0.15, M.headML[2] - 0.2], 3, 0.38);
  crest(J.headMR, [M.headMR[0], M.headMR[1] + 0.15, M.headMR[2] - 0.2], 3, 0.38);
}
```