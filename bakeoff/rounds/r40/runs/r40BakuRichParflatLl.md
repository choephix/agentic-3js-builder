<!-- call: plan -->

```json
{
  "name": "Baku, Dream-Eating Tapir Spirit",
  "description": "A stylized ukiyo-e woodblock baku: a tapir-bodied chimera with an elephant trunk, tiger paws, ox tail and curling cloud fur, wreathed in dream-smoke.",
  "builderName": "bakuUkiyoe",
  "size": [1.9, 2.2, 3.4],
  "layout": "A four-legged tapir-shaped spirit facing +Z, standing on four tiger-clawed paws. Front to back: a long drooping prehensile trunk and a small jaw at z=1.7, a heavy wedge head with round white-rimmed ears and small gold tusks, a thick arched neck with a flowing indigo mane of curling wave-blades, a barrel body whose forward half is deep indigo and whose rear and belly are cream (the tapir saddle pattern), muscular legs with curled cloud-swirl shoulder and hip roundels, and a tufted ox tail ending in a flame tuft at z=-1.7. Ukiyo-e style is shown by flat limited colours, bold black outlines built as thin darker backing parts behind each key shape, repeated seigaiha wave and cloud-scroll motifs in vermilion and gold, and a red cartouche seal on the flank. Dream-smoke wisps (pale lilac swirls) float from the trunk tip but stay near the body.",
  "palette": {
    "indigo": "#1f2f5c",
    "deepIndigo": "#141c3a",
    "cream": "#f2e6c8",
    "vermilion": "#d8432b",
    "gold": "#e3b341",
    "ink": "#15121a",
    "waveBlue": "#3f78a8",
    "foam": "#e9f2f0",
    "lilac": "#b9a6d6",
    "jade": "#3f9a7c",
    "paper": "#e8d9b0",
    "pink": "#e58a8a"
  },
  "mounts": {
    "hips": [0, 1.2, -0.7],
    "chest": [0, 1.3, 0.55],
    "neckBase": [0, 1.6, 0.95],
    "headCentre": [0, 1.75, 1.35],
    "trunkRoot": [0, 1.62, 1.75],
    "tailRoot": [0, 1.45, -1.3],
    "shoulderL": [0.42, 1.1, 0.6],
    "hipL": [0.42, 1.1, -0.7],
    "floor": [0, 0, 0]
  },
  "joints": [
    { "name": "hips", "at": [0, 1.2, -0.7], "dir": [0, 0, 1], "role": "spine" },
    { "name": "chest", "parent": "hips", "at": [0, 1.3, 0.55], "dir": [0, 0, 1], "role": "spine" },
    { "name": "neck", "parent": "chest", "at": [0, 1.6, 0.95], "dir": [0, 0.5, 1], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 1.75, 1.3], "dir": [0, -0.1, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.6, 1.5], "dir": [0, -0.1, 1], "role": "jaw" },
    { "name": "trunk1", "parent": "head", "at": [0, 1.62, 1.75], "dir": [0, -0.3, 1], "role": "tentacle" },
    { "name": "trunk2", "parent": "trunk1", "at": [0, 1.45, 1.95], "dir": [0, -1, 0.3], "role": "tentacle" },
    { "name": "trunk3", "parent": "trunk2", "at": [0, 1.2, 2.0], "dir": [0, -1, 0.3], "role": "tentacle" },
    { "name": "tail1", "parent": "hips", "at": [0, 1.45, -1.3], "dir": [0, 0.2, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 1.5, -1.6], "dir": [0, -0.3, -1], "role": "tail" },
    { "name": "hipL", "parent": "hips", "at": [0.42, 1.1, -0.7], "dir": [0, -1, 0.1], "role": "leg" },
    { "name": "kneeL", "parent": "hipL", "at": [0.42, 0.65, -0.6], "dir": [0, -1, -0.1], "role": "leg" },
    { "name": "footL", "parent": "kneeL", "at": [0.42, 0.2, -0.7], "dir": [0, 0, 1], "role": "leg" },
    { "name": "hipR", "parent": "hips", "at": [-0.42, 1.1, -0.7], "dir": [0, -1, 0.1], "role": "leg" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.42, 0.65, -0.6], "dir": [0, -1, -0.1], "role": "leg" },
    { "name": "footR", "parent": "kneeR", "at": [-0.42, 0.2, -0.7], "dir": [0, 0, 1], "role": "leg" },
    { "name": "shoulderL", "parent": "chest", "at": [0.42, 1.1, 0.6], "dir": [0, -1, 0], "role": "arm" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.42, 0.65, 0.6], "dir": [0, -1, 0.05], "role": "arm" },
    { "name": "handL", "parent": "elbowL", "at": [0.42, 0.2, 0.65], "dir": [0, 0, 1], "role": "arm" },
    { "name": "shoulderR", "parent": "chest", "at": [-0.42, 1.1, 0.6], "dir": [0, -1, 0], "role": "arm" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.42, 0.65, 0.6], "dir": [0, -1, 0.05], "role": "arm" },
    { "name": "handR", "parent": "elbowR", "at": [-0.42, 0.2, 0.65], "dir": [0, 0, 1], "role": "arm" }
  ],
  "parts": [
    {
      "id": "torso",
      "builds": "Barrel body as a loft over hips/chest with indigo front half and cream rear/belly saddle (sectors and bands), black outline backing, a vermilion cartouche seal on the left flank, seigaiha wave scale rows in waveBlue and foam along the back, gold cloud-scroll roundels on shoulder and hip, a flat rump, and a woven gold-and-vermilion belly cord with small tassels.",
      "box": [[-0.7, 0.75, -1.35], [0.7, 1.7, 1.0]],
      "attaches": "Neck at neckBase, legs at shoulderL/R and hipL/R sockets, tail at tailRoot.",
      "joints": ["hips", "chest"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "headTrunk",
      "builds": "Tapir wedge head (loft) in deep indigo with cream lips and white-rimmed round ears with pink inner discs, big front-facing eyes built as ink outline, white, vermilion iris and gold highlight, brow ridges, nostril dots, a segmented trunk sweep over trunk1-3 drooping with ring wrinkles and a pink tip, small gold tusks on the upper jaw, separate lower jaw on jaw joint with a tongue and teeth, and floating lilac dream-smoke swirl wisps near the trunk tip.",
      "box": [[-0.5, 1.0, 1.0], [0.5, 2.1, 2.15]],
      "attaches": "Neck joint at neckBase; head sits at headCentre.",
      "joints": ["head", "jaw", "trunk1", "trunk2", "trunk3"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "maneNeck",
      "builds": "Thick arched neck sweep from neckBase to head on the neck joint in indigo with cream throat, topped by the signature mane: overlapping broad curling blade shapes (extrudes) in a root-to-tip palette of deepIndigo, waveBlue, foam with ink outlines, running from between the ears down the spine to mid-back, plus gold bead necklace ring and vermilion shimenawa-style rope collar with paper zigzag tassels.",
      "box": [[-0.45, 1.3, 0.3], [0.45, 2.2, 1.4]],
      "attaches": "Neck base at neckBase, head at headCentre, mane tails onto torso back.",
      "joints": ["neck", "chest"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "forelegs",
      "builds": "Both front legs on shoulder/elbow/hand joints: thick indigo sweeps with cream socks, tiger-style broad paws with four rounded toes and ivory claws, vermilion cloud-swirl fur tufts at the elbow, gold anklet bands, and ink outlines behind paws. Mirrored left and right.",
      "box": [[-0.75, 0, 0.3], [0.75, 1.2, 0.95]],
      "attaches": "Shoulder sockets at shoulderL/R on the torso; paws rest on floor.",
      "joints": ["shoulderL", "elbowL", "handL", "shoulderR", "elbowR", "handR"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "hindLegsTail",
      "builds": "Both hind legs on hip/knee/foot joints in cream-and-indigo with a visible hock bend, tiger paws and claws, gold anklets, wave-pattern thigh roundels; plus the ox tail sweep over tail1-2 ending in a flame-shaped tuft of layered vermilion, gold and cream blades with ink outlines.",
      "box": [[-0.75, 0, -1.7], [0.75, 1.6, -0.3]],
      "attaches": "Hip sockets at hipL/R; tail at tailRoot; paws on floor.",
      "joints": ["hipL", "kneeL", "footL", "hipR", "kneeR", "footR", "tail1", "tail2"],
      "floor": true,
      "budget": 170
    }
  ]
}
```

<!-- call: forelegs -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildForelegs({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const sockets: Record<string, number[]> = { L: [0.42, 1.1, 0.6], R: [-0.42, 1.1, 0.6] };
  for (const side of ["L", "R"]) {
    const s = side === "L" ? 1 : -1;
    const sh = J["shoulder" + side];
    const el = J["elbow" + side];
    const hd = J["hand" + side];
    const x = 0.42 * s;
    const top: number[] = [x, 1.15, 0.6];
    const elbow: number[] = [x, 0.65, 0.6];
    const wrist: number[] = [x, 0.2, 0.64];
    // upper leg: ink outline then indigo
    b.rod(top, elbow, [0.215, 0.17], P.ink, { bone: sh, sides: 8 });
    b.rod(top, elbow, [0.2, 0.155], P.indigo, { bone: sh, sides: 8 });
    // forearm with cream sock lower
    b.rod(elbow, [x, 0.34, 0.63], [0.17, 0.125], P.ink, { bone: el, sides: 8 });
    b.rod(elbow, [x, 0.34, 0.63], [0.155, 0.11], P.indigo, { bone: el, sides: 8 });
    b.rod([x, 0.34, 0.63], [x, 0.1, 0.65], [0.13, 0.135], P.cream, { bone: hd, sides: 8 });
    // gold anklet bands
    for (const [y, rad] of [[0.3, 0.13], [0.25, 0.135]] as number[][])
      b.part(new THREE.CylinderGeometry(rad, rad, 0.03, 8), P.gold, { bone: hd, at: [x, y, 0.635] });
    // elbow joint ball and vermilion cloud swirl
    b.part(new THREE.SphereGeometry(0.17, 8, 6), P.indigo, { bone: el, at: [x, 0.66, 0.58] });
    for (const [dz, dy, rr] of [[0.0, 0.0, 0.07], [0.07, 0.05, 0.05], [-0.07, 0.04, 0.045], [0.0, 0.1, 0.04]]) {
      b.part(new THREE.SphereGeometry(rr, 6, 4), P.vermilion, { bone: el, at: [x + s * 0.15, 0.66 + dy, 0.6 + dz], scale: [0.5, 1, 1] });
    }
    b.part(new THREE.TorusGeometry(0.06, 0.012, 4, 10), P.gold, { bone: el, at: [x + s * 0.17, 0.66, 0.6], dir: [1, 0, 0], axis: "z" });
    // shoulder roundel
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 10), P.ink, { bone: sh, at: [x + s * 0.17, 1.0, 0.6], dir: [s, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.025, 10), P.gold, { bone: sh, at: [x + s * 0.175, 1.0, 0.6], dir: [s, 0, 0] });
    b.part(new THREE.TorusGeometry(0.06, 0.014, 4, 10), P.vermilion, { bone: sh, at: [x + s * 0.19, 1.0, 0.6], dir: [s, 0, 0], axis: "z" });
    // paw: ink backing, cream pad, toes
    b.part(new THREE.CylinderGeometry(0.2, 0.22, 0.1, 10), P.ink, { bone: hd, at: [x, 0.05, 0.72], scale: [1, 1, 1.2] });
    b.part(new THREE.CylinderGeometry(0.18, 0.2, 0.1, 10), P.cream, { bone: hd, at: [x, 0.055, 0.73], scale: [1, 1, 1.2] });
    for (let i = 0; i < 4; i++) {
      const tx = x + (i - 1.5) * 0.085;
      const tz = 0.93 - Math.abs(i - 1.5) * 0.04;
      b.part(new THREE.SphereGeometry(0.052, 7, 5), P.ink, { bone: hd, at: [tx, 0.045, tz], scale: [1.15, 0.85, 1.2] });
      b.part(new THREE.SphereGeometry(0.045, 7, 5), P.cream, { bone: hd, at: [tx, 0.05, tz + 0.005], scale: [1.1, 0.85, 1.15] });
      b.spike([tx, 0.04, tz + 0.05], [0, -0.1, 1], 0.07, 0.016, P.paper, { bone: hd });
      b.part(new THREE.SphereGeometry(0.014, 5, 4), P.pink, { bone: hd, at: [tx, 0.015, tz - 0.02] });
    }
    // dewclaw tuft
    b.spike([x + s * 0.12, 0.2, 0.55], [s, -0.3, -0.5], 0.09, 0.025, P.vermilion, { bone: hd });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), P.pink, { bone: hd, at: [x, 0.03, 0.66], scale: [1.4, 0.4, 1.2] });
  }
}
```

<!-- call: headTrunk -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHeadTrunk({ b, J, P, M }: Ctx) {
  const INK = P.ink, IND = P.deepIndigo, CREAM = P.cream, VER = P.vermilion, GOLD = P.gold;
  const head = J.head, jaw = J.jaw;
  const sph = (r: number, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);

  // Head wedge (outline backing then main)
  b.loft([
    { at: [0, 1.78, 1.2], w: 0.62, h: 0.62 },
    { at: [0, 1.76, 1.45], w: 0.56, h: 0.5 },
    { at: [0, 1.7, 1.66], w: 0.34, h: 0.36 },
  ], { bone: head, color: INK, sides: 8 });
  b.loft([
    { at: [0, 1.78, 1.2], w: 0.58, h: 0.58 },
    { at: [0, 1.76, 1.45], w: 0.52, h: 0.46 },
    { at: [0, 1.7, 1.68], w: 0.3, h: 0.32 },
  ], { bone: head, color: IND, sides: 8 });
  // cream upper lip
  b.part(new THREE.BoxGeometry(0.3, 0.07, 0.2), CREAM, { bone: head, at: [0, 1.57, 1.62] });

  for (const s of [1, -1]) {
    // ears
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 12), INK, { bone: head, at: [s * 0.25, 2.0, 1.12], dir: [s * 0.5, 0.4, -0.2] });
    b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.06, 12), P.foam, { bone: head, at: [s * 0.255, 2.0, 1.12], dir: [s * 0.5, 0.4, -0.2] });
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.07, 10), P.pink, { bone: head, at: [s * 0.26, 2.0, 1.12], dir: [s * 0.5, 0.4, -0.2] });
    // eyes
    const ex = s * 0.2, ey = 1.84, ez = 1.5;
    b.part(sph(0.075), INK, { bone: head, at: [ex, ey, ez] });
    b.part(sph(0.06), P.foam, { bone: head, at: [ex, ey, ez + 0.02] });
    b.part(sph(0.037), VER, { bone: head, at: [ex, ey, ez + 0.055] });
    b.part(sph(0.017), INK, { bone: head, at: [ex, ey, ez + 0.08] });
    b.part(sph(0.012, 6, 4), GOLD, { bone: head, at: [ex - s * 0.015, ey + 0.02, ez + 0.085] });
    // brow
    b.rod([s * 0.1, 1.95, 1.5], [s * 0.3, 1.93, 1.45], 0.025, INK, { bone: head });
    // nostrils
    b.part(sph(0.018, 6, 4), INK, { bone: head, at: [s * 0.06, 1.74, 1.84] });
    // tusks
    b.spike([s * 0.09, 1.55, 1.7], [0, -1, 0.3], 0.1, 0.022, { bone: head, color: GOLD });
  }

  // Lower jaw
  b.part(new THREE.BoxGeometry(0.26, 0.07, 0.3), INK, { bone: jaw, at: [0, 1.52, 1.62] });
  b.part(new THREE.BoxGeometry(0.22, 0.05, 0.26), CREAM, { bone: jaw, at: [0, 1.545, 1.62] });
  b.part(new THREE.BoxGeometry(0.14, 0.02, 0.18), P.pink, { bone: jaw, at: [0, 1.58, 1.6] });
  for (let i = 0; i < 4; i++) for (const s of [1, -1])
    b.spike([s * 0.09, 1.57, 1.52 + i * 0.07], [0, 1, 0], 0.035, 0.012, { bone: jaw, color: P.foam });

  // Trunk
  const t1 = J.trunk1, t2 = J.trunk2, t3 = J.trunk3;
  const pts = [[0, 1.66, 1.7], [0, 1.58, 1.92], [0, 1.4, 2.02], [0, 1.2, 2.04], [0, 1.05, 2.05]];
  b.rod(pts[0], pts[1], [0.1, 0.085], INK, { bone: t1 });
  b.rod(pts[0], pts[1], [0.085, 0.07], IND, { bone: t1 });
  b.rod(pts[1], pts[2], [0.07, 0.06], IND, { bone: t2 });
  b.rod(pts[2], pts[3], [0.06, 0.05], IND, { bone: t3 });
  b.rod(pts[3], pts[4], [0.05, 0.045], P.pink, { bone: t3 });
  b.part(sph(0.048), P.pink, { bone: t3, at: pts[4] });
  const rings: [number[], number[], number, THREE.Object3D | any][] = [];
  for (let i = 0; i < 4; i++) {
    const f = (i + 0.5) / 4;
    const p = [0, 1.66 - 0.5 * f, 1.7 + 0.35 * Math.sin(f * 2)];
    const bone = f < 0.3 ? t1 : f < 0.65 ? t2 : t3;
    b.part(new THREE.TorusGeometry(0.075 - f * 0.02, 0.012, 5, 10), VER, { bone, at: p, dir: [0, -0.5, 0.2], axis: "z" });
  }

  // Dream smoke
  const r = rng(5);
  for (let i = 0; i < 6; i++) {
    const a = i * 1.1;
    b.part(sph(0.04 + 0.01 * (i % 3), 7, 5), P.lilac, {
      bone: t3,
      at: [Math.cos(a) * (0.1 + i * 0.03), 0.95 + i * 0.07 + r() * 0.03, 2.1 + Math.sin(a) * 0.12],
    });
  }
}
```

<!-- call: hindLegsTail -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHindLegsTail({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const INK = P.ink, CREAM = P.cream, IND = P.indigo, GOLD = P.gold, VER = P.vermilion;

  // ---------- hind legs ----------
  for (const [s, side] of [[1, "L"], [-1, "R"]] as const) {
    const hip: any = J["hip" + side], knee: any = J["knee" + side], foot: any = J["foot" + side];
    const x = 0.42 * s;
    const pHip = [x, 1.1, -0.7], pKnee = [x, 0.65, -0.6], pHock = [x, 0.3, -0.82], pToe = [x, 0.1, -0.55];

    // thigh: ink backing then indigo
    b.capsule(pHip, pKnee, [0.25, 0.15], INK, { bone: hip });
    b.capsule(pHip, pKnee, [0.23, 0.135], IND, { bone: hip });
    // shin down to hock with cream
    b.capsule(pKnee, pHock, [0.14, 0.09], INK, { bone: knee });
    b.capsule(pKnee, pHock, [0.125, 0.075], CREAM, { bone: knee });
    // cannon to ankle
    b.capsule(pHock, [x, 0.14, -0.7], [0.08, 0.07], INK, { bone: foot });
    b.capsule(pHock, [x, 0.14, -0.7], [0.065, 0.058], CREAM, { bone: foot });
    // hock knob
    b.part(new THREE.SphereGeometry(0.1, 8, 6), IND, { bone: knee, at: [x, 0.36, -0.86] });

    // gold anklet
    b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.035, 10), GOLD, { bone: foot, at: [x, 0.2, -0.72] });

    // paw: outline + cream pad
    b.part(new THREE.SphereGeometry(0.17, 10, 8), INK, { bone: foot, at: [x, 0.1, -0.62], scale: [1.05, 0.6, 1.4] });
    b.part(new THREE.SphereGeometry(0.15, 10, 8), CREAM, { bone: foot, at: [x, 0.1, -0.62], scale: [1, 0.58, 1.35] });
    for (let i = 0; i < 4; i++) {
      const tx = x + (i - 1.5) * 0.065;
      b.part(new THREE.SphereGeometry(0.05, 7, 5), CREAM, { bone: foot, at: [tx, 0.06, -0.42], scale: [1, 0.8, 1.1] });
      b.spike([tx, 0.05, -0.38], [0, -0.2, 1], 0.07, 0.016, P.paper, { bone: foot });
    }
    // thigh roundel: seigaiha rings
    const rx = x + 0.2 * s;
    const rd = new THREE.Vector3(s, 0, 0);
    const ring = (r: number, c: string, o: number) =>
      b.part(new THREE.CylinderGeometry(r, r, 0.012, 14), c, { bone: hip, at: [rx + o * s, 0.95, -0.7], dir: rd.toArray() });
    ring(0.16, INK, 0); ring(0.14, P.waveBlue, 0.005); ring(0.1, P.foam, 0.009);
    ring(0.07, P.waveBlue, 0.013); ring(0.035, VER, 0.017);
    // cloud tufts at the back of thigh
    for (let i = 0; i < 3; i++)
      b.spike([x - 0.02 * s, 1.0 - i * 0.12, -0.9], [0, -0.3, -1], 0.14, 0.04, i % 2 ? GOLD : VER, { bone: hip });
  }

  // ---------- ox tail ----------
  const t1: any = J.tail1, t2: any = J.tail2;
  b.capsule([0, 1.45, -1.3], [0, 1.5, -1.6], [0.07, 0.05], INK, { bone: t1 });
  b.capsule([0, 1.45, -1.3], [0, 1.5, -1.6], [0.06, 0.04], IND, { bone: t1 });
  b.capsule([0, 1.5, -1.6], [0, 1.4, -1.68], [0.045, 0.035], INK, { bone: t2 });
  b.capsule([0, 1.5, -1.6], [0, 1.4, -1.68], [0.036, 0.028], IND, { bone: t2 });
  for (const z of [-1.4, -1.55])
    b.part(new THREE.TorusGeometry(0.06, 0.014, 5, 10), GOLD, { bone: t1, at: [0, 1.47 + (z < -1.5 ? 0.03 : 0), z], dir: [0, 0.1, 1] });

  // flame tuft: layered blades
  const base = [0, 1.42, -1.66];
  const blades: [string, number, number, number][] = [
    [INK, 0.34, 0.2, 0.1], [VER, 0.32, 0.18, 0.1], [GOLD, 0.26, 0.12, 0.12], [CREAM, 0.18, 0.07, 0.14],
  ];
  const sway = [-0.5, -0.25, 0, 0.25, 0.5];
  sway.forEach((sw, i) => {
    const up = 0.6 + 0.4 * (1 - Math.abs(sw));
    blades.forEach(([c, len, w, t], k) => {
      const l = len * (0.8 + 0.3 * R()) * (1 + 0.5 * (1 - Math.abs(sw)));
      const outline: [number, number, string?][] = [[-w / 2, 0], [-w * 0.6, l * 0.4], [0, l, "sharp"], [w * 0.6, l * 0.4], [w / 2, 0]] as any;
      b.extrude(outline as any, {
        at: [sw * 0.03 + 0 , base[1] + k * 0.002, base[2] - k * 0.01], x: [1, 0, 0], y: [sw * 0.9, up, -0.55],
        thickness: 0.018 + (blades.length - k) * 0.002, smoothing: 1, color: c, bone: t2,
      });
    });
  });
  b.part(new THREE.SphereGeometry(0.06, 8, 6), VER, { bone: t2, at: base });
}
```

<!-- call: maneNeck -->

```ts
import * as THREE from "three";
import { frame, rng, catmull, bezier, offset } from "agentic-3js-builder";

export function buildManeNeck({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const neckJ = J.neck;
  const chestJ = J.chest;
  const nb = M.neckBase;
  const hc = M.headCentre;

  // neck path: arched from neck base up to the head
  const path = catmull([
    [0, nb[1] - 0.12, nb[2] - 0.2],
    [0, nb[1] + 0.05, nb[2] + 0.05],
    [0, nb[1] + 0.2, nb[2] + 0.22],
    [0, hc[1] - 0.05, hc[2] - 0.12],
  ]);
  const radius = (t: number): [number, number] => [0.3 - 0.07 * t, 0.3 - 0.06 * t];

  // ink outline backing, then neck itself
  b.sweep(path, (t) => { const r = radius(t); return [r[0] + 0.02, r[1] + 0.02]; }, {
    color: P.ink, bone: neckJ, sides: 8, caps: "flat",
  });
  const neck = b.sweep(path, radius, {
    color: P.indigo, bone: neckJ, sides: 8, caps: "flat",
    sectors: [[125, 235, P.cream]],
  });

  // gold bead necklace ring
  const beadT = 0.3;
  const beadC = neck.at(beadT, 180);
  for (let i = 0; i < 16; i++) {
    const a = 100 + (i * 160) / 15;
    const h = neck.at(beadT + 0.0, a, 0.0);
    b.stick(new THREE.SphereGeometry(0.022, 6, 4), P.gold, h, { embed: 0.3, bone: neckJ });
  }
  void beadC;

  // shimenawa rope collar: twisted vermilion rope around neck
  const ropeT = 0.62;
  const ropePts: THREE.Vector3[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * 360;
    const h = neck.at(ropeT, a, 0.02);
    ropePts.push(new THREE.Vector3(...(h.at.toArray() as [number, number, number])));
  }
  const rope = b.sweep(catmull(ropePts, { closed: true }), 0.03, { color: P.vermilion, bone: neckJ, sides: 6 });
  void rope;
  // rope twists
  for (let i = 0; i < 24; i += 2) {
    const h = neck.at(ropeT, (i / 24) * 360, 0.05);
    b.stick(new THREE.BoxGeometry(0.02, 0.02, 0.05), P.paper, h, { embed: 0.2, bone: neckJ, spin: 40 });
  }
  // paper zigzag tassels (shide)
  for (let i = 0; i < 5; i++) {
    const a = 130 + i * 25;
    const h = neck.at(ropeT, a, 0.05);
    const p = h.at;
    for (let k = 0; k < 3; k++) {
      const s = k % 2 ? 1 : -1;
      b.part(new THREE.BoxGeometry(0.07, 0.05, 0.008), P.paper, {
        bone: neckJ,
        at: [p.x + s * 0.015, p.y - 0.04 - k * 0.045, p.z + 0.02],
        rotation: [0, 0, s * 18],
      });
    }
    b.part(new THREE.SphereGeometry(0.014, 5, 4), P.gold, { bone: neckJ, at: [p.x, p.y - 0.17, p.z + 0.02] });
  }

  // mane blades: extruded curling shapes along the spine, root-to-tip palette
  const blade = (w: number, l: number): [number, number, string?][] => [
    [0, 0], [w * 0.5, l * 0.25], [w * 0.35, l * 0.7], [-w * 0.1, l, "sharp"] as any,
    [-w * 0.2, l * 0.55], [-w * 0.45, l * 0.2],
  ];
  const mane = catmull([
    [0, hc[1] + 0.12, hc[2] - 0.2],
    [0, nb[1] + 0.42, nb[2] + 0.18],
    [0, nb[1] + 0.35, nb[2] - 0.1],
    [0, 1.62, 0.45],
  ]);
  const N = 14;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const p = mane.at(t);
    const len = 0.32 - 0.1 * t + R() * 0.04;
    const w = 0.2 - 0.04 * t;
    const sc = 1 - t * 0.3;
    const side = i % 2 ? 1 : -1;
    const bone = t > 0.85 ? chestJ : neckJ;
    const x: [number, number, number] = [0, 0, -1];
    const y: [number, number, number] = [side * 0.5, 1, -0.2];
    const o = blade(w * sc, len * sc) as any;
    b.extrude(o, { at: [p.x, p.y - 0.02, p.z], x, y, thickness: 0.05, smoothing: 1, color: P.ink, bone });
    b.extrude(o.map((q: any) => [q[0] * 0.85, q[1] * 0.88 + 0.01, ...(q[2] ? [q[2]] : [])]), {
      at: [p.x + 0.003, p.y, p.z], x, y, thickness: 0.058, smoothing: 1, color: P.deepIndigo, bone,
    });
    b.extrude(o.map((q: any) => [q[0] * 0.6, q[1] * 0.7 + 0.04, ...(q[2] ? [q[2]] : [])]), {
      at: [p.x + 0.006, p.y, p.z], x, y, thickness: 0.062, smoothing: 1, color: P.waveBlue, bone,
    });
    b.extrude(o.map((q: any) => [q[0] * 0.3, q[1] * 0.4 + 0.1, ...(q[2] ? [q[2]] : [])]), {
      at: [p.x + 0.009, p.y, p.z], x, y, thickness: 0.066, smoothing: 1, color: P.foam, bone,
    });
    // curl tip bead
    b.part(new THREE.SphereGeometry(0.025, 6, 4), P.foam, {
      bone, at: [p.x + side * 0.05, p.y + len * sc * 0.85, p.z - 0.04 - 0.08 * sc],
    });
  }
  // side flowing blades down the neck flanks
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const t = 0.15 + i * 0.2;
      const h = neck.at(t, s * 70, 0.0);
      b.extrude(blade(0.14, 0.24) as any, {
        at: h.at, x: [0, 0, -1], y: [s * 0.6, 0.4, 0], thickness: 0.03, smoothing: 1,
        color: i % 2 ? P.waveBlue : P.deepIndigo, bone: neckJ,
      });
    }
  }
  void frame; void bezier; void offset;
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTorso({ b, J, P, M }: Ctx) {
  const R = rng(11);
  // Body spine path from rump to shoulders
  const st = (z: number, y: number, w: number, h: number) => ({ at: [0, y, z] as [number, number, number], w, h });
  const stations = [
    st(-1.3, 1.28, 0.5, 0.5),
    st(-1.0, 1.25, 0.95, 0.85),
    st(-0.5, 1.22, 1.2, 0.95),
    st(0.1, 1.25, 1.28, 1.0),
    st(0.6, 1.3, 1.25, 1.0),
    st(0.95, 1.36, 0.9, 0.8),
  ];
  const bone = [J.hips, J.chest];
  // outline backing (slightly larger, ink)
  b.loft(stations.map((s) => ({ at: s.at, w: s.w + 0.05, h: s.h + 0.05 })), { bone, color: P.ink });
  // cream rear
  b.loft(stations.slice(0, 3).map((s, i) => ({ at: s.at, w: s.w, h: s.h })).concat([
    { at: [0, 1.24, -0.2] as [number, number, number], w: 1.24, h: 0.98 },
  ]), { bone, color: P.cream });
  // indigo front half
  b.loft([
    { at: [0, 1.24, -0.18] as [number, number, number], w: 1.25, h: 0.99 },
    ...stations.slice(3),
  ], { bone, color: P.indigo });
  // cream belly strip
  b.loft([
    { at: [0, 0.86, -0.9] as [number, number, number], w: 0.8, h: 0.12 },
    { at: [0, 0.8, 0], w: 0.9, h: 0.12 },
    { at: [0, 0.83, 0.7], w: 0.7, h: 0.12 },
  ], { bone, color: P.cream });
  // flat rump plate
  b.part(new THREE.CylinderGeometry(0.26, 0.28, 0.04, 10), P.ink, { bone: J.hips, at: [0, 1.28, -1.33], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.22, 0.24, 0.04, 10), P.vermilion, { bone: J.hips, at: [0, 1.28, -1.345], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 8), P.gold, { bone: J.hips, at: [0, 1.28, -1.36], dir: [0, 0, 1] });

  // seigaiha rows along the back
  const rows = [0.6, 0.3, 0.0, -0.3, -0.6, -0.9];
  rows.forEach((z, ri) => {
    for (let k = -2; k <= 2; k++) {
      const x = k * 0.12 + (ri % 2) * 0.06;
      if (Math.abs(x) > 0.27) continue;
      const y = 1.28 + 0.5 * Math.sqrt(Math.max(0, 1 - (x / 0.62) ** 2)) * 0.95 * 0.97;
      const bn = z > 0 ? J.chest : J.hips;
      const at: [number, number, number] = [x, y, z];
      const d: [number, number, number] = [x * 1.2, 1, 0];
      b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 10), P.ink, { bone: bn, at, dir: d });
      b.part(new THREE.CylinderGeometry(0.067, 0.067, 0.014, 10), P.waveBlue, { bone: bn, at, dir: d });
      b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.016, 10), P.foam, { bone: bn, at, dir: d });
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.018, 8), P.waveBlue, { bone: bn, at, dir: d });
    }
  });

  // cartouche seal on left flank
  const sealAt: [number, number, number] = [0.66, 1.3, 0.05];
  b.part(new THREE.BoxGeometry(0.02, 0.34, 0.2), P.ink, { bone: J.chest, at: sealAt });
  b.part(new THREE.BoxGeometry(0.02, 0.3, 0.16), P.vermilion, { bone: J.chest, at: [0.675, 1.3, 0.05] });
  for (let i = 0; i < 3; i++) {
    b.part(new THREE.BoxGeometry(0.02, 0.03, 0.09), P.paper, { bone: J.chest, at: [0.69, 1.38 - i * 0.08, 0.05] });
  }

  // cloud-scroll roundels (shoulder and hip, both sides)
  for (const s of [1, -1]) {
    for (const [z, bn, y] of [[0.6, J.chest, 1.2], [-0.7, J.hips, 1.15]] as const) {
      const x = s * 0.66;
      const d: [number, number, number] = [s, 0, 0];
      b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.014, 14), P.ink, { bone: bn, at: [x, y, z], dir: d });
      b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.018, 14), P.gold, { bone: bn, at: [x + s * 0.004, y, z], dir: d });
      b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.022, 12), P.vermilion, { bone: bn, at: [x + s * 0.008, y, z], dir: d });
      b.part(new THREE.TorusGeometry(0.07, 0.016, 5, 12), P.gold, { bone: bn, at: [x + s * 0.02, y, z], dir: d, axis: "z" });
      b.part(new THREE.SphereGeometry(0.025, 6, 4), P.foam, { bone: bn, at: [x + s * 0.03, y + 0.02, z] });
    }
  }

  // belly cord with tassels
  const cordPts: [number, number, number][] = [];
  for (let i = 0; i <= 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    cordPts.push([Math.cos(a) * 0.64, 1.22 + Math.sin(a) * 0.5, 0.25]);
  }
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const p: [number, number, number] = [Math.cos(a) * 0.65, 1.22 + Math.sin(a) * 0.5 * 0.95, 0.25];
    b.part(new THREE.SphereGeometry(0.035, 6, 4), i % 2 ? P.gold : P.vermilion, { bone: J.chest, at: p });
    if (i === 12 || i === 10 || i === 14) {
      b.part(new THREE.CylinderGeometry(0.012, 0.03, 0.14, 6), P.vermilion, { bone: J.chest, at: [p[0], p[1] - 0.09, p[2]] });
      b.part(new THREE.SphereGeometry(0.025, 6, 4), P.gold, { bone: J.chest, at: [p[0], p[1] - 0.02, p[2]] });
    }
  }
  // saddle-edge fur flicks
  for (let i = 0; i < 8; i++) {
    const s = i % 2 ? 1 : -1;
    b.spike([s * (0.56 + R() * 0.05), 1.05 + R() * 0.3, -0.2], [s, 0.2, 0], 0.09, 0.025, { bone: J.hips, color: P.indigo });
  }
}
```