<!-- call: plan -->

```json
{
  "name": "Baku, Dream-Eating Spirit",
  "description": "A stylised ukiyo-e woodblock-print baku: a tapir-bodied spirit with an elephant trunk, rhinoceros eyes, tiger paws and an ox tail, drawn in flat indigo, cream and vermilion with sumi outlines, spiral medallions, seigaiha waves and drifting dream-mist clouds at the tip of its trunk.",
  "builderName": "bakuDreamEater",
  "size": [1.1, 1.95, 4.0],
  "layout": "Stands on four legs facing +Z. Front to back: kasumi dream-mist clouds and glowing dream orbs (z 2.15 to 2.5), a trunk hanging from the snout and curling up at the tip (z 1.5 to 2.2), a tapir-shaped head with big round rhinoceros eyes and a white-tipped upper lip (z 1.0 to 1.55), a short thick neck with a flame-blade mane, a deep barrel torso (z -0.95 to 0.9, belly y 0.6, back y 1.38), a high rounded rump, and an ox tail with a tuft hanging behind (to z -1.45). Only the four tiger paws touch y = 0. Legs are short and sturdy with chunky paws. Ukiyo-e look: every surface is one flat colour with no shading tricks. Key shapes sit on a slightly larger sumi underlay so a bold dark outline shows. Colour comes in hard stepped bands (the bokashi gradient is three flat bands, never a blend). Pattern is built as small parts: vermilion spiral medallions on shoulders and haunches, a cream saddle cloth with seigaiha wave arcs, and cloud scrolls. The body is indigo, fore and hind quarters dark and the mid-body cream like a tapir. The palette is limited to woodblock pigments: indigo, vermilion, cream paper, ochre, sumi black.",
  "palette": {
    "sumi": "#16120f",
    "indigo": "#243f73",
    "deepIndigo": "#14264a",
    "midBlue": "#4b6f9e",
    "paleBlue": "#a9c6d6",
    "paper": "#f1e4c3",
    "waveWhite": "#f8f2e2",
    "vermilion": "#d8442b",
    "deepRed": "#9c2a1e",
    "ochre": "#d9a441",
    "gold": "#e8b94a",
    "rose": "#e8a39b",
    "ivory": "#efe6cf",
    "bark": "#7a4a2e",
    "moss": "#5f7f55",
    "dreamViolet": "#8a6bb5",
    "dreamGlow": "#ffe9a8",
    "eyeGold": "#f2c14a",
    "nose": "#3a2a3a"
  },
  "mounts": {
    "hipsCentre": [0, 0.98, -0.5],
    "chestCentre": [0, 1.05, 0.6],
    "saddleTop": [0, 1.38, -0.1],
    "neckBase": [0, 1.1, 0.85],
    "headPivot": [0, 1.42, 1.0],
    "jawHinge": [0, 1.3, 1.2],
    "trunkRoot": [0, 1.38, 1.48],
    "trunkTip": [0, 1.06, 2.2],
    "earRootL": [0.17, 1.6, 1.08],
    "earRootR": [-0.17, 1.6, 1.08],
    "eyeL": [0.18, 1.5, 1.33],
    "eyeR": [-0.18, 1.5, 1.33],
    "foreheadEmblem": [0, 1.62, 1.28],
    "shoulderL": [0.3, 0.95, 0.55],
    "shoulderR": [-0.3, 0.95, 0.55],
    "hipL": [0.3, 0.98, -0.55],
    "hipR": [-0.3, 0.98, -0.55],
    "tailRoot": [0, 1.05, -0.95],
    "maneStart": [0, 1.5, 1.05],
    "maneEnd": [0, 1.4, -0.7],
    "dreamOrigin": [0, 1.1, 2.3]
  },
  "joints": [
    { "name": "hips", "at": [0, 0.98, -0.5], "dir": [0, 0, 1], "role": "spine" },
    { "name": "spine1", "parent": "hips", "at": [0, 1.0, -0.1], "dir": [0, 0, 1], "role": "spine" },
    { "name": "spine2", "parent": "spine1", "at": [0, 1.03, 0.3], "dir": [0, 0, 1], "role": "spine" },
    { "name": "chest", "parent": "spine2", "at": [0, 1.05, 0.6], "dir": [0, 0.2, 1], "role": "spine" },
    { "name": "neck1", "parent": "chest", "at": [0, 1.1, 0.85], "dir": [0, 0.5, 1], "role": "neck" },
    { "name": "neck2", "parent": "neck1", "at": [0, 1.27, 0.96], "dir": [0, 0.35, 1], "role": "neck" },
    { "name": "head", "parent": "neck2", "at": [0, 1.42, 1.0], "dir": [0, -0.05, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.3, 1.2], "dir": [0, -0.05, 1], "role": "jaw" },
    { "name": "earL", "parent": "head", "at": [0.17, 1.6, 1.08], "dir": [0.5, 1, -0.2], "role": "hinge" },
    { "name": "earR", "parent": "head", "at": [-0.17, 1.6, 1.08], "dir": [-0.5, 1, -0.2], "role": "hinge" },
    { "name": "trunk1", "parent": "head", "at": [0, 1.38, 1.48], "dir": [0, -0.6, 1], "role": "tentacle", "group": "trunk" },
    { "name": "trunk2", "parent": "trunk1", "at": [0, 1.22, 1.7], "dir": [0, -0.8, 0.8], "role": "tentacle", "group": "trunk" },
    { "name": "trunk3", "parent": "trunk2", "at": [0, 1.05, 1.85], "dir": [0, -0.4, 1], "role": "tentacle", "group": "trunk" },
    { "name": "trunk4", "parent": "trunk3", "at": [0, 0.98, 2.05], "dir": [0, 0.4, 1], "role": "tentacle", "group": "trunk" },
    { "name": "trunkTip", "parent": "trunk4", "at": [0, 1.06, 2.2], "dir": [0, 0.8, 0.6], "role": "tentacle", "group": "trunk" },
    { "name": "tail1", "parent": "hips", "at": [0, 1.05, -0.95], "dir": [0, -0.3, -1], "role": "tail", "group": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 0.97, -1.1], "dir": [0, -0.5, -1], "role": "tail", "group": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 0.85, -1.2], "dir": [0, -1, -0.4], "role": "tail", "group": "tail" },
    { "name": "tail4", "parent": "tail3", "at": [0, 0.7, -1.27], "dir": [0, -1, -0.2], "role": "tail", "group": "tail" },
    { "name": "shoulderL", "parent": "chest", "at": [0.3, 0.95, 0.55], "dir": [0, -1, 0.05], "role": "leg", "group": "legs" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.3, 0.55, 0.58], "dir": [0, -1, -0.05], "role": "leg", "group": "legs" },
    { "name": "wristL", "parent": "elbowL", "at": [0.3, 0.24, 0.55], "dir": [0, -1, 0.1], "role": "leg", "group": "legs" },
    { "name": "pawL", "parent": "wristL", "at": [0.3, 0.08, 0.6], "dir": [0, -0.3, 1], "role": "leg", "group": "legs" },
    { "name": "shoulderR", "parent": "chest", "at": [-0.3, 0.95, 0.55], "dir": [0, -1, 0.05], "role": "leg", "group": "legs" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.3, 0.55, 0.58], "dir": [0, -1, -0.05], "role": "leg", "group": "legs" },
    { "name": "wristR", "parent": "elbowR", "at": [-0.3, 0.24, 0.55], "dir": [0, -1, 0.1], "role": "leg", "group": "legs" },
    { "name": "pawR", "parent": "wristR", "at": [-0.3, 0.08, 0.6], "dir": [0, -0.3, 1], "role": "leg", "group": "legs" },
    { "name": "hipL", "parent": "hips", "at": [0.3, 0.98, -0.55], "dir": [0, -1, 0.4], "role": "leg", "group": "legs" },
    { "name": "kneeL", "parent": "hipL", "at": [0.3, 0.62, -0.4], "dir": [0, -1, -0.5], "role": "leg", "group": "legs" },
    { "name": "hockL", "parent": "kneeL", "at": [0.3, 0.3, -0.7], "dir": [0, -1, 0.2], "role": "leg", "group": "legs" },
    { "name": "footL", "parent": "hockL", "at": [0.3, 0.07, -0.62], "dir": [0, -0.3, 1], "role": "leg", "group": "legs" },
    { "name": "hipR", "parent": "hips", "at": [-0.3, 0.98, -0.55], "dir": [0, -1, 0.4], "role": "leg", "group": "legs" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.3, 0.62, -0.4], "dir": [0, -1, -0.5], "role": "leg", "group": "legs" },
    { "name": "hockR", "parent": "kneeR", "at": [-0.3, 0.3, -0.7], "dir": [0, -1, 0.2], "role": "leg", "group": "legs" },
    { "name": "footR", "parent": "hockR", "at": [-0.3, 0.07, -0.62], "dir": [0, -0.3, 1], "role": "leg", "group": "legs" }
  ],
  "parts": [
    {
      "id": "body",
      "builds": "Torso, neck and all the printed pattern on them. One loft or sweep body skinned over hips, spine1, spine2 and chest: deep barrel, half width about 0.4, height about 0.76 (belly y 0.6, back y 1.38), rump rounded and slightly higher than the withers. A short thick neck sweep over neck1 and neck2 (radius about 0.2 tapering to 0.16) ending inside the skull at headPivot. Colour in hard stepped bands, no blends. Fore and hind quarters are indigo (sectors), the mid-body is a wide cream (paper) tapir saddle with a sumi-outlined edge (a slightly larger sumi underlay strip, then the paper strip on top). The belly is a pale-blue (paleBlue) band below it, with a thin midBlue step between paleBlue and indigo. The neck is indigo with a paper throat band. On top of the body: a woven saddle cloth in deepRed with a gold trim border over the paper saddle (a flat box or loft bulging only slightly), carrying a seigaiha (blue-wave) pattern of 3 to 4 concentric arcs per wave, in waveWhite, midBlue and indigo, as small flat half-rings (thin cylinders or sweeps, each about 3 cm) in overlapping rows. A shimenawa-style rope (twisted ochre and paper sweeps) loops round the girth with 4 vermilion tassels and tiny paper zigzag shide on it. Spiral medallions in vermilion with cream centres and sumi outlines (swept spiral paths, about 0.2 m across) seated on the shoulder at (±0.4, 1.05, 0.5) and the haunch at (±0.4, 1.05, -0.6), the signature karashishi swirl motif. Sumi outline pieces on the chest and rump. A cream cloud-scroll (kasumi) band along the flank, each cloud a flat scalloped extrude. Rump: tail root plug in indigo at tailRoot. Bone: put pieces on the nearest of hips, spine1, spine2, chest, neck1, neck2.",
      "box": [[-0.46, 0.58, -1.0], [0.46, 1.5, 0.95]],
      "attaches": "Hind legs hang from hipL and hipR (hips); front legs from shoulderL and shoulderR (chest); neck sweep ends at headPivot and the head part continues from it; tail begins at tailRoot; the extras part's mane rides the neck and back from maneStart to maneEnd and sits on the surface.",
      "joints": ["hips", "spine1", "spine2", "chest", "neck1", "neck2"],
      "floor": false,
      "budget": 230
    },
    {
      "id": "head",
      "builds": "Head, trunk, jaws, ears, tusks and face. Skull is a tapir wedge: braincase about 0.36 wide and 0.4 tall from z 1.0 to 1.3, tapering to a broad snout. The upper jaw and snout is its own piece in indigo with a paper-white lip tip (tapir white lip) outlined in sumi. Lower jaw is a separate piece on joint jaw (z 1.2 to 1.5, under the snout), indigo with a paper chin and a row of small ivory teeth; the mouth can open. Elephant trunk: a thick sweep over trunk1..trunk4 and trunkTip, root radius 0.11 tapering to 0.05, from trunkRoot hanging down and curling up at trunkTip. Cream ring ribs every 6 cm as thin torus or sweep rings, paper underside stripe (sector), two nose-hole discs in nose colour at the tip, and a vermilion band cuff halfway. Two ivory tusks curl up from the upper lip beside the trunk root. Rhinoceros eyes: big round eyes at eyeL and eyeR (radius about 0.055) built in layers: a sumi underlay disc, an eyeGold iris, a vermilion ring, a sumi slit pupil and a small waveWhite highlight; heavy indigo brow ridges above, with rose-and-sumi lashes or brow flicks in ukiyo-e line style. A vermilion tomoe (comma) emblem on the forehead at foreheadEmblem, outlined in sumi and gold. Round ears on joints earL and earR: indigo outer disc, paper rim, a rose inner disc and a few ochre fur tufts. Cheek ruffs of 5 to 6 overlapping flame-blade shapes in indigo, midBlue and paper on each side. Everything is flat colour with an outline underlay layer beneath the key shapes.",
      "box": [[-0.42, 0.9, 0.95], [0.42, 1.75, 2.25]],
      "attaches": "Skull base meets the neck sweep at headPivot (head joint). The jaw hinges at jawHinge. The trunk starts at trunkRoot and ends at trunkTip. Ears root at earRootL and earRootR. The mane begins just behind the skull at maneStart; nothing of the head part lies behind z 0.95.",
      "joints": ["head", "jaw", "earL", "earR", "trunk1", "trunk2", "trunk3", "trunk4", "trunkTip"],
      "floor": false,
      "budget": 240
    },
    {
      "id": "legs",
      "builds": "All four legs, short and sturdy, with chunky tiger paws. Front legs are sweeps skinned over shoulder, elbow and wrist joints (radius about 0.11 to 0.075); hind legs are skinned over hip, knee, hock and foot (thicker thigh about 0.16, hock bending back). Legs are indigo with a midBlue step on the lower leg and paper socks. Each foot is a big rounded tiger paw (a squashed sphere or capsule about 0.15 wide) in paper with a sumi outline underlay, four toes as small paper spheres or capsules, a rose pad under it, and four ivory claws peeking out in front. Paw soles rest on y = 0 (sink at most 2 cm). Vermilion garter bands with gold studs at each wrist and hock, with a small cloud-curl tuft above them. Fur ruffs at elbow and hock made of 4 to 5 overlapping flame-blade extrudes in indigo, midBlue and paper. A small vermilion spiral on the outer upper hind thigh. Thighs and shoulders tuck into the torso volume, so no gaps show. Put pieces on the leg joints of their own side, mirrored for x-positive L and x-negative R.",
      "box": [[-0.56, 0.0, -0.98], [0.56, 1.08, 0.82]],
      "attaches": "Front legs start at shoulderL and shoulderR on the chest, hind legs at hipL and hipR on the hips, buried into the torso. Foot centres are at x of plus or minus 0.3, y 0.07, z 0.6 (front) and z -0.62 (hind). The body part's shoulder and haunch spirals sit just above and outside them.",
      "joints": ["shoulderL", "elbowL", "wristL", "pawL", "shoulderR", "elbowR", "wristR", "pawR", "hipL", "kneeL", "hockL", "footL", "hipR", "kneeR", "hockR", "footR"],
      "floor": true,
      "budget": 220
    },
    {
      "id": "extras",
      "builds": "Mane, tail and dream mist. Mane: a crest of broad overlapping flame-blade extrudes (ukiyo-e wind-swept hair) from maneStart down the neck and along the spine to maneEnd, each about 0.15 to 0.3 long leaning backward, in a root-to-tip palette of deepIndigo, indigo, midBlue, paper, with a vermilion tip on every third blade, over a solid indigo ridge sweep; a few gold-edged curls at the base of the skull. Ox tail on tail1..tail4: indigo tapering sweep (radius 0.06 to 0.035) with a big tuft at the end made of 8 to 10 overlapping flame blades in indigo, paper and vermilion tips, plus a gold band at the tuft base. Dream mist (the dreams the baku eats): around dreamOrigin, in front of trunkTip at z 2.15 to 2.5, within x plus or minus 0.45 and y 0.85 to 1.95 (never on the floor, nothing touching the legs). Four flat kasumi clouds made of scalloped extrudes (waveWhite, paleBlue, rose, each with a thin sumi or midBlue offset underlay for the outline), stacked in loose bands. Three or four dream orbs (dreamGlow, dreamViolet, vermilion spheres of radius 0.04 to 0.07, with tiny waveWhite highlights), some with swirling spiral tails. A thin spiral wisp sweep in dreamViolet and waveWhite flows from the clouds into the trunk tip. Use the glow kit on the orbs and a few wisp pieces. All details are small seated parts in their own flat colours. Put the mane on the neck1, neck2, chest, spine joints, the tail on the tail joints, and the mist on trunkTip or the root.",
      "box": [[-0.5, 0.7, -1.5], [0.5, 1.95, 2.5]],
      "attaches": "Mane sits on the neck and back surface from maneStart to maneEnd, just behind the head's skull. The tail roots at tailRoot on joint tail1, continuing the rump plug. Mist hovers at dreamOrigin just beyond trunkTip, and its wisp ends at trunkTip, touching the trunk.",
      "joints": ["tail1", "tail2", "tail3", "tail4"],
      "floor": false,
      "budget": 210
    }
  ]
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // flame-blade fur tuft: a small leaning extrude on a bone
  const tuft = (at: number[], bone: any, s: number, len: number, color: string, lean: number) => {
    b.extrude(
      [[-0.035, 0], [0.035, 0], [0.02, len * 0.6], [lean * 0.04, len, "sharp"]],
      { at, x: [s, 0, 0], y: [0, 1, -0.5], thickness: 0.012, color, bone, smoothing: 1 },
    );
  };

  const leg = (s: number, side: string, front: boolean) => {
    const names = front
      ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`]
      : [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`];
    const [j0, j1, j2, j3] = names.map((n) => J[n]);
    const p0 = j0.at, p1 = j1.at, p2 = j2.at;
    const x = s * 0.3;
    const zf = front ? 0.6 : -0.62;
    const pawC: number[] = [x, 0.07, zf];

    // leg tube skinned over the joints
    const pts = [p0, p1, p2, [x, 0.1, zf - 0.02]];
    const r0 = front ? 0.11 : 0.16;
    b.sweep(pts, [r0, 0.07], { bone: [j0, j1, j2, j3], color: P.indigo, sides: 8 });
    // midBlue step on lower leg
    b.sweep([[x, 0.42, p1[2] + (front ? 0 : -0.1)], p2], [0.082, 0.074], { bone: j1, color: P.midBlue, sides: 8 });
    // paper sock
    b.rod([x, 0.17, zf - 0.03], [x, 0.07, zf], 0.082, P.paper, { bone: j2 });

    // sumi underlay + paw
    b.part(sph(1, 10, 7), P.sumi, { bone: j3, at: [x, 0.075, zf + 0.03], scale: [0.095, 0.075, 0.125] });
    b.part(sph(1, 10, 7), P.paper, { bone: j3, at: [x, 0.08, zf + 0.035], scale: [0.085, 0.07, 0.115] });
    // rose pad
    b.part(sph(1, 8, 4), P.rose, { bone: j3, at: [x, 0.02, zf + 0.01], scale: [0.06, 0.02, 0.07] });
    // toes + claws
    for (let i = 0; i < 4; i++) {
      const tx = x + (i - 1.5) * 0.04;
      const tz = zf + 0.14 - Math.abs(i - 1.5) * 0.015;
      b.part(sph(0.026, 6, 5), P.paper, { bone: j3, at: [tx, 0.05, tz] });
      b.part(new THREE.ConeGeometry(0.01, 0.04, 5), P.ivory, { bone: j3, at: [tx, 0.04, tz + 0.035], dir: [0, -0.2, 1] });
    }

    // garter band + studs at wrist/hock
    const gy = 0.24;
    const gz = p2[2];
    b.part(new THREE.CylinderGeometry(0.092, 0.092, 0.045, 10), P.vermilion, { bone: j2, at: [x, gy + 0.02, gz] });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.part(sph(0.01, 5, 4), P.gold, { bone: j2, at: [x + Math.sin(a) * 0.095, gy + 0.02, gz + Math.cos(a) * 0.095] });
    }
    // cloud-curl tuft above band
    for (let i = 0; i < 3; i++) b.part(sph(0.028, 6, 5), P.paper, { bone: j2, at: [x + s * 0.07, gy + 0.075 + i * 0.012, gz + (i - 1) * 0.04] });

    // fur ruffs at elbow/hock
    const cols = [P.indigo, P.midBlue, P.paper, P.midBlue, P.indigo];
    for (let i = 0; i < 5; i++) {
      const a = (i - 2) * 0.35;
      tuft([x + s * 0.09 + s * 0.01 * i, p1[1] - 0.02, p1[2] + (front ? -0.09 : -0.1) - Math.abs(a) * 0.05 + a * 0.05], j1, s, 0.14 + R() * 0.04, cols[i], -1);
    }
  };

  for (const [s, side] of [[1, "L"], [-1, "R"]] as [number, string][]) {
    leg(s, side, true);
    leg(s, side, false);
    // vermilion spiral on outer hind thigh
    const hip = J[`hip${side}`];
    const c = [s * 0.46, 0.85, -0.55];
    const pts: number[][] = [];
    for (let i = 0; i < 14; i++) {
      const a = i * 0.55, r = 0.012 + i * 0.006;
      pts.push([c[0], c[1] + Math.sin(a) * r, c[2] + Math.cos(a) * r]);
    }
    b.sweep(pts, 0.011, { bone: hip, color: P.vermilion, sides: 5 });
    b.part(sph(0.018, 6, 5), P.paper, { bone: hip, at: c });
  }
}
```

<!-- call: body -->

```ts
import * as THREE from "three";
import { catmull, rng } from "agentic-3js-builder";

export function buildBody({ b, J, P, M }: any) {
  const R = rng(5);
  // Body loft over hips..chest
  const stations = [
    { at: [0, 1.0, -0.95], w: 0.5, h: 0.5 },
    { at: [0, 1.0, -0.6], w: 0.8, h: 0.78 },
    { at: [0, 0.99, -0.1], w: 0.82, h: 0.76 },
    { at: [0, 1.0, 0.4], w: 0.8, h: 0.76 },
    { at: [0, 1.02, 0.8], w: 0.66, h: 0.68 },
  ];
  const bone = [J.hips, J.spine1, J.spine2, J.chest];
  b.loft(stations, { bone, color: P.indigo, section: "box" } as any);
  // cream saddle with sumi underlay
  const strip = (z0: number, z1: number, w: number, y: number, col: string, bn: any) => {
    b.part(new THREE.BoxGeometry(w, 0.02, z1 - z0), col, { bone: bn, at: [0, y, (z0 + z1) / 2] });
  };
  strip(-0.55, 0.35, 0.8, 1.385, P.sumi, J.spine1);
  strip(-0.5, 0.3, 0.74, 1.395, P.paper, J.spine1);
  // belly bands
  for (const [y, w, c] of [[0.6, 0.62, P.midBlue], [0.585, 0.56, P.paleBlue]] as any)
    b.part(new THREE.BoxGeometry(w, 0.03, 1.4), c, { bone: J.spine1, at: [0, y, -0.1] });
  // saddle cloth
  b.part(new THREE.BoxGeometry(0.62, 0.025, 0.7), P.gold, { bone: J.spine1, at: [0, 1.41, -0.1] });
  b.part(new THREE.BoxGeometry(0.56, 0.03, 0.64), P.deepRed, { bone: J.spine1, at: [0, 1.415, -0.1] });
  // seigaiha rows
  const cols = [P.waveWhite, P.midBlue, P.indigo];
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 5; c++) {
      const x = -0.2 + c * 0.1 + (r % 2) * 0.05, z = -0.35 + r * 0.12;
      for (let k = 0; k < 3; k++)
        b.part(new THREE.TorusGeometry(0.045 - k * 0.013, 0.004, 4, 8, Math.PI), cols[k], {
          bone: J.spine1, at: [x, 1.435 + k * 0.001, z], rotation: [90, 0, 0],
        });
    }
  // neck
  const neck = catmull([[0, 1.05, 0.7], [0, 1.15, 0.88], [0, 1.3, 0.97], [0, 1.42, 1.02]]);
  b.sweep(neck, [0.22, 0.17], { bone: [J.neck1, J.neck2], color: P.indigo });
  b.part(new THREE.BoxGeometry(0.2, 0.05, 0.2), P.paper, { bone: J.neck1, at: [0, 1.1, 1.0] });
  // rope girth
  const rope = [] as number[][];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    rope.push([Math.sin(a) * 0.43, 1.0 + Math.cos(a) * 0.4, 0.3]);
  }
  b.sweep(catmull(rope, { closed: true }), 0.022, { bone: J.spine2, color: P.ochre });
  for (let i = 0; i < 4; i++) {
    const a = 1.9 + i * 0.5;
    const x = Math.sin(a) * 0.45, y = 1.0 + Math.cos(a) * 0.42;
    b.part(new THREE.ConeGeometry(0.03, 0.12, 6), P.vermilion, { bone: J.spine2, at: [x, y - 0.06, 0.3], rotation: [180, 0, 0] });
    b.part(new THREE.BoxGeometry(0.01, 0.06, 0.03), P.paper, { bone: J.spine2, at: [x * 1.03, y + 0.03, 0.3] });
  }
  // spiral medallions
  for (const s of [1, -1])
    for (const z of [0.5, -0.6]) {
      const bn = z > 0 ? J.chest : J.hips;
      const x = s * 0.415;
      b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 14), P.sumi, { bone: bn, at: [x, 1.05, z], rotation: [0, 0, 90] });
      b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.02, 14), P.vermilion, { bone: bn, at: [x + s * 0.01, 1.05, z], rotation: [0, 0, 90] });
      const pts: number[][] = [];
      for (let i = 0; i < 18; i++) {
        const a = i * 0.45, r = 0.01 + i * 0.004;
        pts.push([x + s * 0.025, 1.05 + Math.sin(a) * r, z + Math.cos(a) * r]);
      }
      b.sweep(catmull(pts), 0.008, { bone: bn, color: P.paper });
      b.part(new THREE.SphereGeometry(0.02, 6, 4), P.paper, { bone: bn, at: [x + s * 0.03, 1.05, z] });
    }
  // kasumi clouds on flank
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      const z = -0.35 + i * 0.3;
      const o = [[0, 0], [0.1, 0.03], [0.2, 0], [0.17, -0.04], [0.03, -0.04]] as any;
      b.extrude(o, { at: [s * 0.412, 0.8, z - 0.1], x: [0, 0, 1], thickness: 0.01, color: P.paper, bone: J.spine1, smoothing: 1 });
    }
  // chest and rump outlines
  b.part(new THREE.SphereGeometry(0.3, 8, 6), P.sumi, { bone: J.chest, at: [0, 1.02, 0.78], scale: [1, 1.1, 0.35] });
  b.part(new THREE.SphereGeometry(0.3, 8, 6), P.sumi, { bone: J.hips, at: [0, 1.1, -0.93], scale: [1, 1.1, 0.35] });
  // tail plug
  b.part(new THREE.SphereGeometry(0.1, 8, 6), P.indigo, { bone: J.hips, at: M.tailRoot });
}
```

<!-- call: extras -->

```ts
import * as THREE from "three";
import { rng, catmull, spiral } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildExtras({ b, J, P, M }: any) {
  const R = rng(11);
  const flame = (len: number, w: number): [number, number, string?][] => [
    [0, 0], [w * 0.5, len * 0.35], [w * 0.3, len * 0.75], [0, len, "sharp"], [-w * 0.35, len * 0.6], [-w * 0.5, len * 0.3],
  ] as any;

  // Mane: ridge sweep and flame blades from maneStart to maneEnd
  const ridgePts = [[0, 1.5, 1.05], [0, 1.52, 0.8], [0, 1.47, 0.4], [0, 1.43, 0], [0, 1.41, -0.4], [0, 1.4, -0.7]];
  const ridge = catmull(ridgePts);
  b.sweep(ridge, [0.05, 0.035], { color: P.indigo, bone: [J.chest, J.spine2, J.spine1, J.hips].filter(Boolean) as any });
  const cols = [P.deepIndigo, P.indigo, P.midBlue, P.paper];
  const bones = [J.neck2, J.neck1, J.chest, J.spine2, J.spine1, J.hips];
  const N = 22;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const p = ridge.at(t);
    const bone = bones[Math.min(bones.length - 1, Math.floor(t * bones.length))];
    const len = 0.15 + 0.15 * R();
    const w = 0.09 + 0.05 * R();
    for (let k = 0; k < 3; k++) {
      const c = k === 2 && i % 3 === 0 ? P.vermilion : cols[k + (i % 2)] ?? P.paper;
      const l = len * (1 - k * 0.22);
      const side = (i % 2 ? 1 : -1) * 0.02;
      b.extrude(flame(l, w * (1 - k * 0.2)) as any, {
        at: [p.x + side, p.y + 0.01 + k * 0.004, p.z],
        x: [1, 0, 0], y: [0, 0.75, -0.7], thickness: 0.025, color: c, bone,
      });
    }
  }
  // gold curls at skull base
  for (const s of [1, -1]) {
    const c = spiral([s * 0.1, 1.55, 0.98], [s * 0.1, 1.62, 0.98], [1, 0, 0], { turns: 1.2 * s, r1: 0.02 });
    b.sweep(c, 0.012, { color: P.gold, bone: J.neck2 });
  }

  // Tail
  const tailPath = catmull([[0, 1.05, -0.95], [0, 0.97, -1.1], [0, 0.85, -1.2], [0, 0.7, -1.27], [0, 0.55, -1.3]]);
  b.sweep(tailPath, [0.06, 0.035], { color: P.indigo, bone: [J.tail1, J.tail2, J.tail3, J.tail4] });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 8), P.gold, { bone: J.tail4, at: [0, 0.6, -1.29] });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const c = i % 3 === 0 ? P.vermilion : i % 2 ? P.paper : P.indigo;
    b.extrude(flame(0.28, 0.1) as any, {
      at: [Math.sin(a) * 0.03, 0.58, -1.3 + Math.cos(a) * 0.03],
      x: [Math.cos(a), 0, -Math.sin(a)], y: [Math.sin(a) * 0.35, -1, Math.cos(a) * 0.35],
      thickness: 0.02, color: c, bone: J.tail4,
    });
  }

  // Dream mist
  const scallop = (w: number, h: number) => {
    const o: any[] = [];
    const n = 5;
    for (let i = 0; i <= n; i++) o.push([-w / 2 + (w * i) / n, h * 0.4 + Math.sin(i * 1.7) * h * 0.2 + h * 0.3 * Math.sin((i / n) * Math.PI)]);
    for (let i = n; i >= 0; i--) o.push([-w / 2 + (w * i) / n, 0]);
    return o.slice(0, -0).filter((_, i, a) => i === 0 || a[i][0] !== a[i - 1][0] || a[i][1] !== a[i - 1][1]);
  };
  const clouds: [number, number, number, number, string][] = [
    [0.15, 1.7, 2.35, 0.4, P.waveWhite], [-0.2, 1.4, 2.3, 0.36, P.paleBlue],
    [0.2, 1.1, 2.4, 0.34, P.rose], [-0.1, 1.85, 2.2, 0.3, P.waveWhite],
  ];
  for (const [x, y, z, w, c] of clouds) {
    const sh = scallop(w * 1.08, 0.13);
    b.extrude(sh, { at: [x, y - 0.012, z - 0.01], x: [1, 0, 0], thickness: 0.02, color: P.midBlue, bone: J.trunkTip ?? J.hips });
    b.extrude(scallop(w, 0.12), { at: [x, y, z], x: [1, 0, 0], thickness: 0.02, color: c, bone: J.trunkTip ?? J.hips });
  }
  const orbs: [number[], number, string][] = [
    [[0.3, 1.5, 2.3], 0.06, P.dreamGlow], [[-0.3, 1.2, 2.4], 0.05, P.dreamViolet],
    [[0.05, 1.3, 2.45], 0.045, P.vermilion], [[-0.15, 1.65, 2.28], 0.04, P.dreamGlow],
  ];
  for (const [p, r, c] of orbs) {
    glow(b.part(new THREE.SphereGeometry(r, 8, 6), c, { bone: J.trunkTip ?? J.hips, at: p }), 1.4);
    b.part(new THREE.SphereGeometry(r * 0.25, 5, 4), P.waveWhite, { bone: J.trunkTip ?? J.hips, at: [p[0] + r * 0.4, p[1] + r * 0.5, p[2] + r * 0.7] });
  }
  const tail = spiral([0.3, 1.5, 2.3], [0.3, 1.5, 2.2], [1, 0, 0], { turns: 1.5, r1: 0.02 });
  glow(b.sweep(tail, 0.008, { color: P.dreamViolet, bone: J.trunkTip ?? J.hips }), 1);
  const wisp = catmull([[0.1, 1.4, 2.35], [0.12, 1.25, 2.3], [-0.05, 1.12, 2.26], [0, 1.06, 2.2]]);
  glow(b.sweep(wisp, [0.014, 0.006], { color: P.waveWhite, bone: J.trunkTip ?? J.hips }), 1);
  b.sweep(wisp, [0.02, 0.01], { color: P.dreamViolet, bone: J.trunkTip ?? J.hips });
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  const SUMI = P.sumi, IND = P.indigo, DEEP = P.deepIndigo, MID = P.midBlue, PAPER = P.paper;
  const VER = P.vermilion, GOLD = P.gold, ROSE = P.rose, IVORY = P.ivory, OCH = P.ochre;
  const head = J.head, jaw = J.jaw;

  const sph = (r: number, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, sc?: number[], rot?: number[]) =>
    b.part(g, c, { bone, at, scale: sc as any, rotation: rot as any });

  // skull: sumi underlay then indigo
  put(sph(1), SUMI, [0, 1.5, 1.14], head, [0.2, 0.225, 0.25]);
  put(sph(1), IND, [0, 1.5, 1.14], head, [0.185, 0.21, 0.235]);
  // snout upper jaw
  put(new THREE.BoxGeometry(1, 1, 1), SUMI, [0, 1.38, 1.35], head, [0.3, 0.21, 0.42]);
  put(new THREE.BoxGeometry(1, 1, 1), IND, [0, 1.385, 1.36], head, [0.27, 0.185, 0.42]);
  // white lip tip
  put(new THREE.BoxGeometry(1, 1, 1), SUMI, [0, 1.35, 1.57], head, [0.29, 0.19, 0.06]);
  put(new THREE.BoxGeometry(1, 1, 1), PAPER, [0, 1.35, 1.585], head, [0.26, 0.165, 0.05]);
  // nostril dots
  for (const s of [1, -1]) put(sph(0.02, 6, 4), P.nose, [s * 0.06, 1.4, 1.61], head);

  // lower jaw
  put(new THREE.BoxGeometry(1, 1, 1), SUMI, [0, 1.2, 1.36], jaw, [0.25, 0.08, 0.34]);
  put(new THREE.BoxGeometry(1, 1, 1), IND, [0, 1.205, 1.35], jaw, [0.225, 0.065, 0.32]);
  put(new THREE.BoxGeometry(1, 1, 1), PAPER, [0, 1.19, 1.5], jaw, [0.2, 0.06, 0.08]);
  for (let i = 0; i < 6; i++) for (const s of [1, -1])
    if (i < 3) put(new THREE.ConeGeometry(0.01, 0.03, 5), IVORY, [s * (0.05 + i * 0.03) * 1, 1.25, 1.52 - i * 0.1], jaw);

  // trunk
  const tj = ["trunk1", "trunk2", "trunk3", "trunk4", "trunkTip"].map((n) => J[n]);
  const pts = [[0, 1.38, 1.48], [0, 1.22, 1.7], [0, 1.05, 1.85], [0, 0.98, 2.05], [0, 1.06, 2.2]];
  for (let i = 0; i < 4; i++) {
    const a = new THREE.Vector3(...pts[i]), c = new THREE.Vector3(...pts[i + 1]);
    const r0 = 0.11 - i * 0.017, r1 = 0.11 - (i + 1) * 0.017 + (i === 3 ? 0 : 0);
    b.capsule(a, c, [Math.max(r0, 0.05), Math.max(r1, 0.05)], IND, { bone: tj[i] });
    b.capsule(a.clone().add(new THREE.Vector3(0, -0.012, 0)), c.clone().add(new THREE.Vector3(0, -0.012, 0)), [Math.max(r0, 0.05) * 0.8, Math.max(r1, 0.05) * 0.8], PAPER, { bone: tj[i] });
    // ribs
    for (let k = 1; k < 4; k++) {
      const p = a.clone().lerp(c, k / 4);
      const rr = r0 + (r1 - r0) * (k / 4) + 0.004;
      const d = c.clone().sub(a).normalize();
      b.part(new THREE.TorusGeometry(Math.max(rr, 0.05), 0.007, 5, 10), PAPER, { bone: tj[i], at: p, dir: d, axis: "z" });
    }
  }
  const cuff = new THREE.Vector3(...pts[1]).lerp(new THREE.Vector3(...pts[2]), 0.5);
  b.part(new THREE.TorusGeometry(0.085, 0.016, 5, 10), VER, { bone: tj[1], at: cuff, dir: [0, -0.7, 0.5], axis: "z" });
  b.part(sph(0.07, 8, 6), IND, { bone: tj[4], at: [0, 1.08, 2.22] } as any);
  for (const s of [1, -1]) put(new THREE.CircleGeometry(0.018, 8), P.nose, [s * 0.025, 1.1, 2.275], tj[4], undefined, [-20, 0, 0]);

  // tusks
  for (const s of [1, -1]) {
    const base = [s * 0.09, 1.31, 1.52], tip = [s * 0.13, 1.5, 1.7];
    b.sweep([base, [s * 0.12, 1.37, 1.64], tip], [0.03, 0.005], { bone: head, color: IVORY, caps: { end: "point" } });
  }

  // eyes
  for (const s of [1, -1]) {
    const e = [s * 0.18, 1.5, 1.33];
    const d = [s * 0.55, 0.1, 0.8];
    const layer = (r: number, c: string, o: number, seg = 14) =>
      b.part(new THREE.CircleGeometry(r, seg), c, { bone: head, at: [e[0] + s * o * 0.5, e[1], e[2] + o * 0.8], dir: d, axis: "z" });
    layer(0.068, SUMI, 0);
    layer(0.056, P.eyeGold, 0.004);
    layer(0.05, VER, 0.006);
    layer(0.04, P.eyeGold, 0.008);
    b.part(new THREE.PlaneGeometry(0.014, 0.06), SUMI, { bone: head, at: [e[0] + s * 0.007, e[1], e[2] + 0.011], dir: d, axis: "z" });
    b.part(sph(0.01, 5, 4), P.waveWhite, { bone: head, at: [e[0] + s * 0.02, e[1] + 0.02, e[2] + 0.02] });
    // brow
    b.capsule([s * 0.1, 1.6, 1.3], [s * 0.25, 1.58, 1.28], 0.03, DEEP, { bone: head });
    b.capsule([s * 0.2, 1.56, 1.42], [s * 0.3, 1.6, 1.34], 0.007, SUMI, { bone: head });
    b.capsule([s * 0.22, 1.54, 1.42], [s * 0.33, 1.54, 1.34], 0.006, ROSE, { bone: head });
  }

  // forehead tomoe
  b.part(new THREE.CircleGeometry(0.055, 12), GOLD, { bone: head, at: [0, 1.65, 1.32], dir: [0, 0.4, 1], axis: "z" });
  b.part(new THREE.CircleGeometry(0.047, 12), SUMI, { bone: head, at: [0, 1.652, 1.325], dir: [0, 0.4, 1], axis: "z" });
  b.part(new THREE.CircleGeometry(0.04, 12), VER, { bone: head, at: [0, 1.654, 1.33], dir: [0, 0.4, 1], axis: "z" });
  b.part(sph(0.014, 6, 4), SUMI, { bone: head, at: [0.012, 1.665, 1.335] });

  // ears
  for (const s of [1, -1]) {
    const ear = s > 0 ? J.earL : J.earR;
    const at = [s * 0.17, 1.6, 1.08], d = [s * 0.5, 1, -0.2];
    const disc = (r: number, c: string, o: number) =>
      b.part(new THREE.CylinderGeometry(r, r, 0.02, 14), c, { bone: ear, at: [at[0] + s * o * 0.5, at[1] + o * 0.2 + 0.07, at[2]], dir: [s * 0.4, 0.2, 1], axis: "y" });
    disc(0.11, SUMI, 0); disc(0.1, IND, 0.005); disc(0.085, PAPER, 0.01); disc(0.062, ROSE, 0.015);
    for (let k = 0; k < 3; k++)
      b.spike([at[0] + s * (0.03 + k * 0.025), at[1] + 0.07, at[2] + 0.03], [0, 0.4, 0.8], 0.05, 0.01, { bone: ear, color: OCH });
  }

  // cheek ruffs
  const cols = [DEEP, IND, MID, PAPER, IND, MID];
  for (const s of [1, -1]) for (let i = 0; i < 6; i++) {
    const out = [[0, 0], [0.2, 0], [0.14, 0.12], [0, 0.18, "sharp"]] as any;
    b.extrude(out, { at: [s * 0.18, 1.34 - (i % 3) * 0.04, 1.2 - i * 0.025], x: [s * 0.5, -0.2, -0.8], y: [0, 1, 0], thickness: 0.02, color: cols[i], bone: head });
  }
}
```