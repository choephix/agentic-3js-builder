<!-- call: plan -->

```json
{
  "name": "Baba Yaga's Hut",
  "description": "A Slavic folk-art diorama of a carved wooden izba standing on two giant scaly chicken legs, with a fenced yard of skull posts, a stump stair and a mortar and pestle.",
  "builderName": "babaYagaHut",
  "size": [3.6, 3.4, 3.6],
  "layout": "The hut is a squat log cabin raised on two huge yellow chicken legs, with the front door facing +Z. The legs stand on a low round earth mound at the floor (mound radius 1.7, centred x=0, z=0). The cabin sits on a floor platform at y=1.2, and a steep two-slope shingled roof with a carved ridge horse-head at the front tops it. Carved folk-art window frames in red, blue and white with flower motifs flank the door. A small porch with a ladder-like stair reaches down from the door toward +Z, ending on the mound. Around the mound stands a ring of picket fence with glowing skull posts, a mortar and pestle sits at the front left, and a birch tree stands at the back right. Style: bold flat colours, ornate repeated sunburst, flower and zigzag trim motifs in red, white, and gold on every wooden surface, with chunky, blocky shapes.",
  "palette": {
    "logDark": "#6b4423",
    "logLight": "#8f5e2f",
    "logEnd": "#c9985a",
    "roofShingle": "#3f6b4a",
    "roofShingleDark": "#2b4d36",
    "trimRed": "#c62a2a",
    "trimBlue": "#2a5cb8",
    "trimWhite": "#f4ecd8",
    "gold": "#e8b830",
    "legYellow": "#e8b53a",
    "legDark": "#b07d1c",
    "claw": "#3a2a1a",
    "earth": "#4a3a28",
    "moss": "#4f7a3a",
    "skullBone": "#ece4cc",
    "glowEye": "#ff7a1a",
    "windowGlow": "#ffcc55",
    "birchWhite": "#e8e4da",
    "birchMark": "#2a2622",
    "leaf": "#6a9a3a",
    "iron": "#3a3a44",
    "fence": "#7a5230"
  },
  "mounts": {
    "cabinFloor": [0, 1.2, 0],
    "legHipL": [0.6, 1.25, -0.1],
    "legHipR": [-0.6, 1.25, -0.1],
    "footL": [0.7, 0.1, 0.1],
    "footR": [-0.7, 0.1, 0.1],
    "doorBase": [0, 1.3, 0.95],
    "porchEdge": [0, 1.2, 1.35],
    "roofEave": [0, 2.35, 0],
    "ridgeFront": [0, 3.2, 0.95],
    "yardFront": [0, 0.1, 1.7]
  },
  "joints": [],
  "parts": [
    {
      "id": "legsMound",
      "builds": "The round earth mound (moss patches, a few stones) and the two huge chicken legs: each a thick yellow scaly tube with thigh, drumstick and shin segments (alternating legYellow and legDark scale bands), a bent knee, and a foot with three forward toes and one rear toe, each with a dark claw. Includes the gnarled crossbeam hip sockets that go up under the cabin floor at the legHip mounts.",
      "box": [[-1.7, 0, -1.7], [1.7, 1.25, 1.7]],
      "attaches": "Leg tops meet the cabin underside at legHipL and legHipR (y 1.2). Feet at footL and footR on the mound.",
      "joints": [],
      "floor": true,
      "budget": 170
    },
    {
      "id": "cabinWalls",
      "builds": "The log cabin body from y=1.2 to y=2.35: stacked horizontal round logs with protruding corner-notch log ends (logEnd discs), a floor platform slab, carved door (trimRed frame, gold sunburst, iron hinges and ring handle) at doorBase on the front, two side windows plus one front window each with blue and white carved frames, flower motifs, glowing windowGlow panes and shutters. Includes the small porch deck, two posts with carved tops, and a stair of three steps descending from porchEdge toward +Z.",
      "box": [[-1.1, 1.2, -1.1], [1.1, 2.35, 1.9]],
      "attaches": "Sits on the leg hips at cabinFloor; the roof starts at roofEave; the stair ends near yardFront.",
      "joints": [],
      "floor": false,
      "budget": 190
    },
    {
      "id": "roof",
      "builds": "The steep gabled roof from y=2.35 to 3.4 overhanging the walls: rows of overlapping shingle slabs alternating roofShingle and roofShingleDark, bargeboards with zigzag trim in trimRed and trimWhite, a front gable with a carved round window and sunburst, a ridge beam ending in a carved horse-head (ridgeFront) with gold mane, small gold finials on the rear, and a crooked clay chimney with a little smoke puff.",
      "box": [[-1.4, 2.35, -1.4], [1.4, 3.4, 1.6]],
      "attaches": "Eaves rest on the cabin walls at roofEave. Horse-head at ridgeFront.",
      "joints": [],
      "floor": false,
      "budget": 190
    },
    {
      "id": "yardFence",
      "builds": "The yard dressing on the floor: a ring of picket fence posts around the mound radius ~1.75 with gaps at the front for the stair, with pointed tops in fence colour; every fourth post is a taller skull post with a skullBone skull (cranium, jaw, two glowing glowEye sockets). Also a mortar and pestle (iron mortar, long wooden pestle) at front left (x 1.5, z 1.3), and a stump with a mushroom or two.",
      "box": [[-1.9, 0, -1.9], [1.9, 1.4, 1.9]],
      "attaches": "Fence is placed outside the mound edge; the stair end at yardFront remains clear between posts.",
      "joints": [],
      "floor": true,
      "budget": 150
    },
    {
      "id": "birchTree",
      "builds": "A tall slender birch tree at the back right (x 1.5, z -1.5) rising behind the hut to about 3.4 m: white trunk of stacked tapered segments with dark birchMark dashes, three bare branches, and clusters of faceted leaf blobs in leaf and moss colours, plus a small crow perched on a branch. A tuft of grass and two stones at the base.",
      "box": [[1.0, 0, -2.0], [1.9, 3.4, -1.0]],
      "attaches": "Stands on the floor beside the fence ring, behind the roof's rear corner.",
      "joints": [],
      "floor": true,
      "budget": 150
    }
  ]
}
```

<!-- call: legsMound -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLegsMound({ b, J, P, M }: Ctx) {
  const R = rng(5);
  // Earth mound
  b.part(new THREE.CylinderGeometry(1.6, 1.7, 0.16, 20), P.earth, { at: [0, 0.08, 0] });
  b.part(new THREE.CylinderGeometry(1.2, 1.55, 0.1, 20), P.earth, { at: [0, 0.2, 0] });
  // moss patches
  for (let i = 0; i < 9; i++) {
    const a = R() * 6.28, r = 0.5 + R() * 1.0;
    b.part(new THREE.CylinderGeometry(0.16 + R() * 0.14, 0.2 + R() * 0.14, 0.04, 7), P.moss, {
      at: [Math.cos(a) * r, 0.23, Math.sin(a) * r],
    });
  }
  // stones
  for (let i = 0; i < 6; i++) {
    const a = i * 1.1 + 0.4, r = 1.35 + R() * 0.2;
    b.part(new THREE.DodecahedronGeometry(0.1 + R() * 0.07, 0), "#7a7770", {
      at: [Math.cos(a) * r, 0.15, Math.sin(a) * r],
      rotation: [R() * 90, R() * 90, 0],
    });
  }
  // crossbeam under floor
  b.part(new THREE.BoxGeometry(1.9, 0.14, 0.34), P.logDark, { at: [0, 1.15, -0.1] });
  b.part(new THREE.BoxGeometry(1.7, 0.08, 0.1), P.logLight, { at: [0, 1.2, -0.1] });

  for (const s of [1, -1]) {
    const hx = s * 0.6, fx = s * 0.7;
    const hip = new THREE.Vector3(hx, 1.2, -0.1);
    const knee = new THREE.Vector3(hx + s * 0.05, 0.85, -0.3);
    const hock = new THREE.Vector3(fx, 0.5, -0.05);
    const ankle = new THREE.Vector3(fx, 0.3, 0.05);
    // hip socket
    b.part(new THREE.SphereGeometry(0.2, 8, 6), P.logDark, { at: hip.toArray() as [number, number, number] });
    b.part(new THREE.TorusGeometry(0.2, 0.04, 5, 10), P.gold, { at: [hx, 1.1, -0.1], rotation: [90, 0, 0] });
    // segments
    const segs: [THREE.Vector3, THREE.Vector3, number, number][] = [
      [hip, knee, 0.2, 0.17],
      [knee, hock, 0.17, 0.12],
      [hock, ankle, 0.12, 0.1],
    ];
    segs.forEach(([a, c, r0, r1], k) => {
      b.rod(a, c, [r0, r1], P.legYellow, { sides: 8 });
      const n = 4;
      for (let i = 0; i < n; i++) {
        const t0 = (i + 0.5) / n;
        const p = a.clone().lerp(c, t0);
        const r = r0 + (r1 - r0) * t0;
        if (i % 2 === 0)
          b.part(new THREE.CylinderGeometry(r * 1.08, r * 1.08, 0.05, 8), P.legDark, {
            at: p.toArray() as [number, number, number],
            aim: c.toArray() as [number, number, number],
          });
      }
      b.part(new THREE.SphereGeometry(r1 * 1.15, 8, 6), P.legDark, { at: c.toArray() as [number, number, number] });
    });
    // foot pad
    b.part(new THREE.SphereGeometry(0.14, 8, 6), P.legYellow, { at: [fx, 0.2, 0.05], scale: [1.1, 0.8, 1.2] });
    // three forward toes
    [-0.32, 0, 0.32].forEach((ang) => {
      const dx = Math.sin(ang), dz = Math.cos(ang);
      const base = new THREE.Vector3(fx, 0.12, 0.08);
      const tip = new THREE.Vector3(fx + dx * 0.5, 0.07, 0.08 + dz * 0.5);
      b.rod(base, tip, [0.07, 0.05], P.legYellow, { sides: 6 });
      b.part(new THREE.SphereGeometry(0.06, 6, 5), P.legDark, {
        at: base.clone().lerp(tip, 0.5).toArray() as [number, number, number],
      });
      const ct = new THREE.Vector3(fx + dx * 0.68, 0.03, 0.08 + dz * 0.68);
      b.spike(tip.clone().setY(0.07), ct.toArray() as [number, number, number], null, 0.055, P.claw);
    });
    // rear toe
    const rb = new THREE.Vector3(fx, 0.12, 0.0);
    const rt = new THREE.Vector3(fx, 0.07, -0.3);
    b.rod(rb, rt, [0.07, 0.05], P.legYellow, { sides: 6 });
    b.spike([fx, 0.07, -0.3], [fx, 0.03, -0.45], null, 0.05, P.claw);
  }
}
```

<!-- call: birchTree -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildBirchTree({ b, P }: any) {
  const R = rng(11);
  const cx = 1.5, cz = -1.5;
  const WHITE = P.birchWhite, MARK = P.birchMark;
  const trunkPts: number[][] = [];
  const segs = 8;
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    trunkPts.push([cx + Math.sin(t * 3) * 0.06, t * 3.0, cz + Math.cos(t * 2) * 0.04 - 0.04]);
  }
  // stacked tapered segments
  for (let i = 0; i < segs; i++) {
    const a = trunkPts[i], c = trunkPts[i + 1];
    const r0 = 0.11 - i * 0.008, r1 = 0.11 - (i + 1) * 0.008;
    b.rod(a, c, [r0, r1], WHITE, { sides: 8, caps: "flat" });
    // dark bands at joints
    b.part(new THREE.CylinderGeometry(r0 * 1.04, r0 * 1.04, 0.02, 8), MARK, { at: [a[0], a[1] + 0.01, a[2]] });
    // dashes
    for (let k = 0; k < 2; k++) {
      const ang = R() * 6.28;
      const y = a[1] + 0.2 + R() * 0.3;
      b.part(new THREE.BoxGeometry(0.07, 0.025, 0.012), MARK, {
        at: [a[0] + Math.sin(ang) * r0 * 0.98, y, a[2] + Math.cos(ang) * r0 * 0.98],
        rotation: [0, ang * 57.3, 0],
      });
    }
  }
  const top = trunkPts[segs];
  // base flare
  b.part(new THREE.CylinderGeometry(0.11, 0.17, 0.12, 8), WHITE, { at: [cx, 0.06, cz - 0.04] });
  // branches
  const branches = [
    [[0.5, 2.2, 0.1], [0.55, 0.15]],
    [[-0.45, 2.5, -0.2], [-0.4, 0.15]],
    [[0.1, 2.8, 0.45], [0.2, 0.1]],
  ];
  const tips: number[][] = [];
  const startY = [1.9, 2.2, 2.5];
  branches.forEach((br, i) => {
    const d = br[0];
    const s = [cx + 0.03, startY[i], cz - 0.05];
    const tip = [s[0] + d[0], s[1] + d[1] - 1.9 + 0.45, s[2] + d[2] * 0.8];
    b.rod(s, tip, [0.04, 0.012], WHITE, { sides: 6 });
    tips.push(tip);
  });
  // leaf clusters
  const cols = [P.leaf, P.moss];
  const spots = [...tips, [top[0], top[1] + 0.15, top[2]], [cx + 0.2, 2.9, cz + 0.2], [cx - 0.25, 2.4, cz - 0.3]];
  spots.forEach((p, i) => {
    for (let k = 0; k < 4; k++) {
      const s = 0.1 + R() * 0.1;
      b.part(new THREE.IcosahedronGeometry(s, 0), cols[(i + k) % 2], {
        at: [p[0] + (R() - 0.5) * 0.3, p[1] + (R() - 0.3) * 0.25, p[2] + (R() - 0.5) * 0.3],
        flat: true,
      });
    }
  });
  // crow on first branch
  const cp = [tips[0][0] - 0.2, tips[0][1] + 0.07, tips[0][2]];
  const CROW = P.birchMark;
  b.part(new THREE.SphereGeometry(0.07, 6, 5), CROW, { at: cp, scale: [0.8, 0.8, 1.3] });
  b.part(new THREE.SphereGeometry(0.045, 6, 5), CROW, { at: [cp[0], cp[1] + 0.07, cp[2] + 0.08] });
  b.part(new THREE.ConeGeometry(0.018, 0.06, 5), P.gold, { at: [cp[0], cp[1] + 0.07, cp[2] + 0.15], rotation: [90, 0, 0] });
  b.part(new THREE.ConeGeometry(0.04, 0.14, 4), CROW, { at: [cp[0], cp[1] - 0.02, cp[2] - 0.15], rotation: [-100, 0, 0] });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.01, 4, 3), P.trimWhite, { at: [cp[0] + s * 0.022, cp[1] + 0.09, cp[2] + 0.11] });
  // grass tuft
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * 6.28;
    b.part(new THREE.ConeGeometry(0.014, 0.18 + R() * 0.08, 4), i % 2 ? P.leaf : P.moss, {
      at: [cx + 0.2 + Math.sin(a) * 0.06, 0.09, cz + 0.15 + Math.cos(a) * 0.06],
      rotation: [Math.cos(a) * 20, 0, -Math.sin(a) * 20],
    });
  }
  // stones
  b.part(new THREE.DodecahedronGeometry(0.1, 0), "#8a8780", { at: [cx - 0.25, 0.06, cz + 0.2], scale: [1, 0.7, 1.2], flat: true });
  b.part(new THREE.DodecahedronGeometry(0.07, 0), "#6e6b66", { at: [cx + 0.3, 0.04, cz + 0.3], scale: [1, 0.7, 1], flat: true });
}
```

<!-- call: yardFence -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildYardFence({ b, J, P, M }: any) {
  const R = rng(5);
  const part = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { at, ...o });
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const cone = (r: number, h: number, s = 6) => new THREE.ConeGeometry(r, h, s);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  const N = 28;
  const RAD = 1.75;
  // low rails are segments between posts
  const posts: { x: number; z: number; a: number }[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const x = Math.sin(a) * RAD;
    const z = Math.cos(a) * RAD;
    // gap at the front for the stair
    if (z > 0 && Math.abs(x) < 0.4) continue;
    posts.push({ x, z, a });
  }
  posts.forEach((p, i) => {
    const skull = i % 4 === 0;
    const h = skull ? 1.15 : 0.7 + R() * 0.12;
    part(cyl(0.045, 0.055, h, 6), P.fence, [p.x, h / 2, p.z]);
    if (!skull) {
      part(cone(0.06, 0.14), P.fence, [p.x, h + 0.07, p.z]);
      part(box(0.02, 0.02, 0.02), P.trimRed, [p.x, h * 0.55, p.z]);
    } else {
      const sy = h + 0.12;
      part(cyl(0.035, 0.035, 0.05, 6), P.fence, [p.x, h + 0.02, p.z]);
      const q = new THREE.Euler(0, p.a, 0);
      const dir = [Math.sin(p.a), 0, Math.cos(p.a)];
      const side = [Math.cos(p.a), 0, -Math.sin(p.a)];
      part(sph(0.12, 8, 6), P.skullBone, [p.x, sy + 0.04, p.z], { rotation: [0, (p.a * 180) / Math.PI, 0] });
      part(box(0.11, 0.06, 0.1), P.skullBone, [p.x + dir[0] * 0.03, sy - 0.1, p.z + dir[2] * 0.03], {
        rotation: [0, (p.a * 180) / Math.PI, 0],
      });
      for (const s of [1, -1]) {
        const ex = p.x + dir[0] * 0.095 + side[0] * s * 0.045;
        const ez = p.z + dir[2] * 0.095 + side[2] * s * 0.045;
        part(sph(0.032, 6, 4), P.glowEye, [ex, sy + 0.04, ez]);
        part(box(0.012, 0.03, 0.012), P.skullBone, [
          p.x + dir[0] * 0.115 + side[0] * s * 0.02,
          sy - 0.09,
          p.z + dir[2] * 0.115 + side[2] * s * 0.02,
        ]);
      }
      part(cone(0.014, 0.04, 4), P.birchMark, [p.x + dir[0] * 0.12, sy - 0.01, p.z + dir[2] * 0.12], {
        rotation: [90, (p.a * 180) / Math.PI, 0],
      });
      void q;
    }
  });
  // rails
  for (let i = 0; i < posts.length - 1; i++) {
    const a = posts[i];
    const c = posts[i + 1];
    if (Math.hypot(a.x - c.x, a.z - c.z) > 0.5) continue;
    const len = Math.hypot(a.x - c.x, a.z - c.z);
    const ang = Math.atan2(c.x - a.x, c.z - a.z);
    part(box(0.025, 0.04, len), P.fence, [(a.x + c.x) / 2, 0.4, (a.z + c.z) / 2], {
      rotation: [0, (ang * 180) / Math.PI, 0],
    });
  }

  // mortar and pestle
  const mx = 1.5;
  const mz = 1.3;
  part(b.lathe([[0, 0], [0.2, 0], [0.26, 0.1], [0.3, 0.3], [0.25, 0.3], [0.2, 0.16], [0, 0.14]], { at: [mx, 0, mz], segments: 10, color: P.iron }).geometry ?? cyl(0.1, 0.1, 0.1), P.iron, [mx, 0, mz]);
  part(cyl(0.31, 0.31, 0.03, 10), P.trimRed, [mx, 0.29, mz]);
  part(cyl(0.22, 0.22, 0.02, 10), P.claw, [mx, 0.285, mz]);
  part(cyl(0.035, 0.05, 0.9, 6), P.logLight, [mx + 0.12, 0.7, mz - 0.08], { rotation: [10, 0, -22] });
  part(sph(0.06, 6, 4), P.logDark, [mx + 0.31, 1.14, mz - 0.1]);
  part(sph(0.055, 6, 4), P.logDark, [mx + 0.0, 0.3, mz - 0.07]);
  part(box(0.02, 0.02, 0.02), P.gold, [mx + 0.2, 0.2, mz + 0.27]);

  // stump + mushrooms
  const sx = -1.55;
  const sz = 1.25;
  part(cyl(0.2, 0.26, 0.35, 8), P.logDark, [sx, 0.175, sz]);
  part(cyl(0.2, 0.2, 0.02, 8), P.logEnd, [sx, 0.355, sz]);
  part(cyl(0.12, 0.12, 0.022, 8), P.logLight, [sx, 0.362, sz]);
  part(cyl(0.04, 0.04, 0.022, 8), P.logDark, [sx, 0.368, sz]);
  for (const [dx, dz, s] of [[-0.05, 0.05, 1], [0.1, -0.05, 0.7], [-0.28, 0.15, 0.8]]) {
    const y = dx === -0.28 ? 0 : 0.36;
    part(cyl(0.015 * s, 0.02 * s, 0.1 * s, 6), P.trimWhite, [sx + dx, y + 0.05 * s, sz + dz]);
    part(new THREE.SphereGeometry(0.06 * s, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.trimRed, [sx + dx, y + 0.1 * s, sz + dz]);
    for (const [ox, oz] of [[0.02, 0.02], [-0.025, 0.0], [0.0, -0.03]])
      part(sph(0.01 * s, 4, 3), P.trimWhite, [sx + dx + ox * s, y + 0.15 * s, sz + dz + oz * s]);
  }
  // moss at stump base
  part(sph(0.1, 6, 4), P.moss, [sx + 0.2, 0.02, sz - 0.2], { scale: [1, 0.3, 1] });
}
```

<!-- call: roof -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildRoof({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const SH = [P.roofShingle, P.roofShingleDark];
  const eaveY = 2.35, ridgeY = 3.25, halfW = 1.35;
  const zMin = -1.35, zMax = 1.5, len = zMax - zMin, zc = (zMin + zMax) / 2;
  const ang = Math.atan2(ridgeY - eaveY, halfW);
  const slopeLen = Math.hypot(halfW, ridgeY - eaveY);

  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, rotation: rot });

  // shingle rows on both slopes
  const rows = 8;
  for (const s of [1, -1]) {
    for (let i = 0; i < rows; i++) {
      const t = (i + 0.5) / rows;
      const x = s * (halfW + 0.12 - t * (halfW + 0.12)) ;
      const y = eaveY - 0.03 + t * (ridgeY - eaveY + 0.03);
      const h = slopeLen / rows * 1.35;
      const cols = 7;
      for (let k = 0; k < cols; k++) {
        const w = len / cols;
        box(0.05, h, w * 0.96, SH[(i + k) % 2], [x, y, zMin + w * (k + 0.5)], [0, 0, s * (90 - ang * 180 / Math.PI) * -1 + 0]);
      }
    }
  }
  // base slab under shingles
  for (const s of [1, -1])
    box(0.06, slopeLen, len, P.logDark, [s * halfW / 2, (eaveY + ridgeY) / 2 - 0.02, zc], [0, 0, -s * (90 - ang * 180 / Math.PI) * -1]);

  // ridge beam
  box(0.14, 0.12, len + 0.1, P.logLight, [0, ridgeY + 0.04, zc]);
  // horse head at front
  const hz = zMax + 0.08, hy = ridgeY + 0.05;
  box(0.12, 0.22, 0.26, P.logLight, [0, hy + 0.1, hz], [30, 0, 0]);
  box(0.12, 0.14, 0.3, P.logLight, [0, hy + 0.27, hz + 0.16], [-35, 0, 0]);
  box(0.1, 0.1, 0.16, P.logLight, [0, hy + 0.2, hz + 0.34], [-10, 0, 0]);
  b.part(new THREE.SphereGeometry(0.025, 6, 4), P.birchMark, { at: [0.065, hy + 0.33, hz + 0.2] });
  b.part(new THREE.SphereGeometry(0.025, 6, 4), P.birchMark, { at: [-0.065, hy + 0.33, hz + 0.2] });
  for (let i = 0; i < 5; i++)
    box(0.06, 0.12, 0.05, P.gold, [0, hy + 0.35 - i * 0.04 + 0.04, hz - 0.02 - i * 0.04 + 0.1], [-40, 0, 0]);
  b.part(new THREE.ConeGeometry(0.04, 0.12, 5), P.trimRed, { at: [0, hy + 0.4, hz + 0.1] });

  // front gable
  const gz = zMax - 0.02;
  const tri = [[-halfW, 0], [halfW, 0], [0, ridgeY - eaveY]] as [number, number][];
  b.extrude(tri, { at: [0, eaveY, gz], x: [1, 0, 0], thickness: 0.08, color: P.logDark });
  // round window with sunburst
  const wy = eaveY + 0.42;
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 14), P.trimRed, { at: [0, wy, gz + 0.06], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 14), P.windowGlow, { at: [0, wy, gz + 0.07], dir: [0, 0, 1] });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.ConeGeometry(0.025, 0.1, 4), P.gold, {
      at: [Math.cos(a) * 0.27, wy + Math.sin(a) * 0.27, gz + 0.06],
      rotation: [0, 0, (a * 180) / Math.PI - 90],
    });
  }
  box(0.02, 0.28, 0.06, P.trimWhite, [0, wy, gz + 0.1]);
  box(0.28, 0.02, 0.06, P.trimWhite, [0, wy, gz + 0.1]);

  // bargeboards with zigzag trim (front and back)
  for (const z of [zMax + 0.04, zMin - 0.04])
    for (const s of [1, -1]) {
      const mx = s * halfW / 2, my = (eaveY + ridgeY) / 2;
      box(0.05, 0.14, 0.05, P.trimWhite, [mx, my, z], [0, 0, 0]).mesh.rotation.z = s * -ang;
      const n = 12;
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        const x = s * halfW * (1 - t), y = eaveY + t * (ridgeY - eaveY);
        const tt = new THREE.Mesh();
        const p = b.part(new THREE.ConeGeometry(0.045, 0.1, 3), i % 2 ? P.trimRed : P.trimWhite, { at: [x, y - 0.1, z + (z > 0 ? 0.01 : -0.01)] });
        p.mesh.rotation.z = Math.PI;
        void tt;
      }
    }

  // rear gold finials
  for (const x of [-0.5, 0.5]) {
    b.part(new THREE.ConeGeometry(0.05, 0.28, 6), P.gold, { at: [x * 0.0, ridgeY + 0.2, zMin + 0.05 + (x > 0 ? 0 : 0.0)] });
  }
  b.part(new THREE.SphereGeometry(0.06, 6, 5), P.gold, { at: [0, ridgeY + 0.38, zMin + 0.05] });

  // crooked chimney
  const cx = 0.6, cz = -0.5, cy = 2.95;
  b.part(new THREE.CylinderGeometry(0.13, 0.15, 0.4, 6), P.trimRed, { at: [cx, cy, cz] });
  b.part(new THREE.CylinderGeometry(0.11, 0.13, 0.3, 6), P.legDark, { at: [cx + 0.03, cy + 0.3, cz], rotation: [0, 0, -8] });
  b.part(new THREE.CylinderGeometry(0.15, 0.12, 0.06, 6), P.claw, { at: [cx + 0.06, cy + 0.5, cz], rotation: [0, 0, -8] });
  for (let i = 0; i < 4; i++) {
    const r = 0.07 + i * 0.03;
    b.part(new THREE.IcosahedronGeometry(r, 0), i % 2 ? P.birchWhite : "#cfcfcf", {
      at: [cx + 0.1 + i * 0.07, cy + 0.65 + i * 0.12, cz + R() * 0.04],
    });
  }
}
```

<!-- call: cabinWalls -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildCabinWalls({ b, J, P, M }: any) {
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, c: string, at: number[], dir: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at, dir });
  const R = rng(5);

  // floor platform
  box(2.3, 0.1, 2.3, P.logDark, [0, 1.25, 0]);
  // porch deck
  box(1.0, 0.08, 0.6, P.logLight, [0, 1.24, 1.6]);
  box(1.0, 0.03, 0.6, P.trimRed, [0, 1.285, 1.6]);

  // log walls: rows of horizontal logs
  const rows = 7, y0 = 1.33, dy = 0.145, h = 1.0;
  for (let i = 0; i < rows; i++) {
    const y = y0 + i * dy;
    const col = i % 2 ? P.logLight : P.logDark;
    for (const s of [1, -1]) {
      // front/back logs (along X)
      const z = s * 0.95;
      if (s === -1 || true) {
        cyl(0.075, 0.075, 2.2, col, [0, y, z], [1, 0, 0], 8);
        for (const e of [1, -1]) cyl(0.065, 0.065, 0.03, P.logEnd, [e * 1.11, y, z], [1, 0, 0], 8);
      }
      // side logs (along Z)
      const x = s * 0.95;
      cyl(0.075, 0.075, 1.9, col, [x, y, 0], [0, 0, 1], 8);
      for (const e of [1, -1]) cyl(0.065, 0.065, 0.03, P.logEnd, [x, y + 0.0, e * 0.97 + (e > 0 ? 0.0 : 0)], [0, 0, 1], 8);
    }
  }
  // inner fill to keep walls solid
  box(1.8, h, 1.8, P.logDark, [0, 1.8, 0]);

  const wx = (s: number) => s;
  // window builder
  const window = (at: number[], dir: number[], ang: number, col: string) => {
    const g = new THREE.Group();
    void g;
    const [x, y, z] = at;
    const nx = dir[0], nz = dir[2];
    const px = nz !== 0 ? 1 : 0, pz = nx !== 0 ? 1 : 0;
    const off = (d: number, u: number, v: number) => [x + nx * d + px * u, y + v, z + nz * d + pz * u];
    const sz = (w: number, hh: number, t: number) => (nz !== 0 ? [w, hh, t] : [t, hh, w]);
    const bx = (w: number, hh: number, t: number, c: string, d: number, u: number, v: number) => {
      const s = sz(w, hh, t);
      box(s[0], s[1], s[2], c, off(d, u, v));
    };
    bx(0.5, 0.5, 0.03, col, 0.0, 0, 0);
    bx(0.36, 0.36, 0.03, P.windowGlow, 0.02, 0, 0);
    bx(0.36, 0.03, 0.035, P.trimWhite, 0.03, 0, 0);
    bx(0.03, 0.36, 0.035, P.trimWhite, 0.03, 0, 0);
    bx(0.62, 0.06, 0.05, P.trimWhite, 0.02, 0, 0.3);
    bx(0.62, 0.05, 0.05, P.trimWhite, 0.02, 0, -0.29);
    for (const s of [1, -1]) {
      bx(0.14, 0.5, 0.04, P.trimBlue, 0.03, s * 0.34, 0); // shutter
      bx(0.05, 0.3, 0.045, P.trimWhite, 0.04, s * 0.34, 0);
    }
    // flower on top
    b.part(new THREE.OctahedronGeometry(0.06, 0), P.gold, { at: off(0.05, 0, 0.38) });
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2;
      b.part(new THREE.SphereGeometry(0.035, 5, 4), P.trimRed, { at: off(0.05, Math.cos(a) * 0.08, 0.38 + Math.sin(a) * 0.08) });
    }
    void ang;
  };
  window([0.6, 1.85, 0.97], [0, 0, 1], 0, P.trimBlue);
  window([0.97 + 0.0, 1.85, 0.1], [1, 0, 0], 0, P.trimBlue);
  window([-0.97, 1.85, 0.1], [-1, 0, 0], 0, P.trimRed);
  window([0.0, 1.85, -0.97], [0, 0, -1], 0, P.trimBlue);

  // door
  const dz = 1.0;
  box(0.62, 0.95, 0.05, P.trimRed, [-0.35, 1.75, dz + 0.02]);
  box(0.48, 0.82, 0.05, P.logDark, [-0.35, 1.72, dz + 0.04]);
  for (let i = 0; i < 4; i++) box(0.02, 0.8, 0.02, P.logLight, [-0.5 + i * 0.1, 1.72, dz + 0.07]);
  // sunburst
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 10), P.gold, { at: [-0.35, 1.85, dz + 0.08], dir: [0, 0, 1] });
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    b.part(new THREE.ConeGeometry(0.025, 0.1, 4), P.gold, {
      at: [-0.35 + Math.cos(a) * 0.14, 1.85 + Math.sin(a) * 0.14, dz + 0.08],
      dir: [Math.cos(a), Math.sin(a), 0],
    });
  }
  for (const yy of [1.5, 1.95]) box(0.3, 0.04, 0.03, P.iron, [-0.28, yy, dz + 0.1]);
  b.part(new THREE.TorusGeometry(0.04, 0.01, 5, 8), P.iron, { at: [-0.18, 1.65, dz + 0.1] });
  box(0.7, 0.05, 0.06, P.trimWhite, [-0.35, 2.25 - 0.28, dz + 0.04]);

  // porch posts with carved tops
  for (const s of [1, -1]) {
    box(0.08, 0.9, 0.08, P.logLight, [s * 0.46, 1.7, 1.85]);
    b.part(new THREE.OctahedronGeometry(0.08, 0), P.gold, { at: [s * 0.46, 2.2, 1.85] });
    box(0.12, 0.04, 0.12, P.trimRed, [s * 0.46, 2.12, 1.85]);
    box(0.04, 0.04, 0.6, P.logDark, [s * 0.46, 1.6, 1.6]);
  }
  box(1.0, 0.06, 0.06, P.trimRed, [0, 2.15, 1.85]);
  // zigzag trim
  for (let i = 0; i < 9; i++) {
    b.part(new THREE.ConeGeometry(0.05, 0.1, 3), i % 2 ? P.trimWhite : P.trimRed, { at: [-0.4 + i * 0.1, 2.08, 1.86], dir: [0, -1, 0] });
  }

  // stair: 3 steps toward +Z
  for (let i = 0; i < 3; i++) {
    const y = 1.2 - (i + 1) * 0.35 + 0.15;
    box(0.8, 0.08, 0.3, i % 2 ? P.logLight : P.logDark, [0, Math.max(y, 0.15), 1.75 + i * 0.12]);
    box(0.84, 0.03, 0.02, P.trimRed, [0, Math.max(y, 0.15) + 0.045, 1.9 + i * 0.12]);
  }
  for (const s of [1, -1]) box(0.05, 0.05, 0.5, P.logDark, [s * 0.42, 0.6, 1.9], [30, 0, 0]);

  // corner log ends accents
  for (const sx of [1, -1]) for (const sz of [1, -1])
    for (let i = 0; i < 4; i++)
      b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8), P.logEnd, {
        at: [sx * 1.12, 1.4 + i * 0.28 + R() * 0.01, sz * 0.95 * 0 + sz * 0.95], dir: [1, 0, 0],
      });
  void frame; void M; void J;
}
```