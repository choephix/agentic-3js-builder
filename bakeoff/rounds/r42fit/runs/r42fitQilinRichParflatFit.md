<!-- call: plan -->

```json
{
  "name": "Qilin of the Cloud Court",
  "description": "High-fantasy anime qilin: a scaled, hooved chimera with a dragon head, branching antlers, a swirling cloud mane and a flame-tipped ox tail.",
  "builderName": "qilin",
  "size": [1.5, 2.3, 3.0],
  "layout": "Standing quadruped, deer/horse-sized (shoulder height 1.45 m). Faces +Z. Body barrel centred at z=0 from z=-0.75 (rump) to z=0.6 (chest). Neck rises forward from the chest at (0,1.45,0.6) up to the head at (0,1.9,1.2). Dragon head with a boxy muzzle points forward-down, separate upper and lower jaw, large anime eyes, whiskers. Antlers branch up and back from the skull. Cloud mane: layered swirling cream/teal cloud blades along the neck and nape, plus cloud tufts at the fetlocks and knees. Cloven hooves on gold. Tail is a long ox-like plume sweeping back with a flame tip. Scales are small stacked plates in a root-to-tip palette, jade-teal on the back fading to cream on the belly. Gold trim bands, glowing runes on the flanks, a glowing forehead gem. Everything is chunky low-poly primitives with bold shapes, and the flat colour is placed by region.",
  "palette": {
    "scaleTeal": "#1fa392",
    "scaleDeep": "#0f5f6e",
    "scaleJade": "#58d6a0",
    "belly": "#f6ead0",
    "cloudWhite": "#f4fbff",
    "cloudTeal": "#8fe3e0",
    "cloudViolet": "#b59cf0",
    "gold": "#f2b93a",
    "goldDark": "#a87420",
    "hoof": "#3a2a2a",
    "antler": "#e8d3a0",
    "antlerTip": "#ffd27a",
    "eyeIris": "#ffb21f",
    "ink": "#22112f",
    "white": "#ffffff",
    "glow": "#7ffcff",
    "flame": "#ff7a2a",
    "flameCore": "#ffd84a",
    "tongue": "#e85a7a",
    "tooth": "#fff6e0",
    "blush": "#ff9ab0"
  },
  "mounts": {
    "chestTop": [0, 1.45, 0.55],
    "neckBase": [0, 1.5, 0.6],
    "headJoint": [0, 1.95, 1.15],
    "skullTop": [0, 2.08, 1.1],
    "jawPivot": [0, 1.88, 1.25],
    "rump": [0, 1.35, -0.75],
    "tailBase": [0, 1.35, -0.8],
    "shoulderL": [0.25, 1.2, 0.5],
    "hipL": [0.25, 1.15, -0.5]
  },
  "joints": [
    { "name": "hips", "at": [0, 1.2, -0.45], "dir": [0, 0, 1], "role": "spine" },
    { "name": "chest", "parent": "hips", "at": [0, 1.25, 0.4], "dir": [0, 0, 1], "role": "spine" },
    { "name": "neck1", "parent": "chest", "at": [0, 1.45, 0.6], "dir": [0, 0.8, 0.5], "role": "neck" },
    { "name": "neck2", "parent": "neck1", "at": [0, 1.7, 0.85], "dir": [0, 0.7, 0.7], "role": "neck" },
    { "name": "head", "parent": "neck2", "at": [0, 1.95, 1.15], "dir": [0, -0.1, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.88, 1.25], "dir": [0, -0.05, 1], "role": "jaw" },
    { "name": "tail1", "parent": "hips", "at": [0, 1.35, -0.8], "dir": [0, 0.1, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 1.4, -1.2], "dir": [0, 0.2, -1], "role": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 1.5, -1.6], "dir": [0, 0.3, -1], "role": "tail" },
    { "name": "shoulderL", "parent": "chest", "at": [0.25, 1.2, 0.5], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "shoulderR", "parent": "chest", "at": [-0.25, 1.2, 0.5], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "hipL", "parent": "hips", "at": [0.25, 1.15, -0.5], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "hipR", "parent": "hips", "at": [-0.25, 1.15, -0.5], "dir": [0, -1, 0], "role": "leg", "group": "legs" }
  ],
  "parts": [
    {
      "id": "body",
      "builds": "Torso loft from rump to chest (barrel, deeper chest, tucked belly) on hips/chest joints, using scaleTeal on the back with a belly-cream countershade. Rows of stuck scale plates (scaleJade tips, scaleDeep edges) over the back and flanks. Gold girth band and gold chest plate. Glowing rune/cloud-spiral emblems on both flanks (glow). Gold shoulder and hip roundels. Also builds the chest-top cloud-swirl fluffs and the spine ridge of small gold spikes. Neck is NOT included, but ends where neckBase begins.",
      "box": [[-0.4, 0.85, -0.85], [0.4, 1.6, 0.75]],
      "attaches": "Neck sweep starts at neckBase on the chest joint. Legs hang from shoulder/hip joints at shoulderL/hipL. Tail begins at tailBase.",
      "joints": ["hips", "chest"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "legs",
      "builds": "Four slender deer-like legs with the hooved chimera look, built with limb() IK: shoulder/hip, knee/hock (hind legs digitigrade-ish), cannon, fetlock, and cloven hooves in hoof colour with gold rims. Scaled upper legs (scaleTeal, small stuck plates), cream lower legs. Cloud tufts (cloudWhite/cloudTeal cards or blade clusters) at knees and fetlocks. Gold anklets. Feet touch y=0. Chain names kneeFL, kneeFR, kneeHL, kneeHR; joints named hoof tips as ankle tips.",
      "box": [[-0.42, 0, -0.75], [0.42, 1.25, 0.7]],
      "attaches": "Joints parent to shoulderL/R and hipL/R at the mounts shoulderL and hipL, mirrored on x.",
      "joints": ["shoulderL", "shoulderR", "hipL", "hipR"],
      "floor": true,
      "budget": 170
    },
    {
      "id": "headNeck",
      "builds": "Curved neck sweep (scaleTeal, belly-cream underside) from neckBase to the head, with scale plates. Dragon head: skull, boxy tapered upper muzzle with flared nostrils, a separate lower jaw on the jaw joint with a pink tongue and little fangs, brow ridges, cheek fins in scaleJade, blush marks. Big anime eyes (white, eyeIris, ink pupil, two highlights) at the front sides, with gold lashes. Long drooping whiskers (gold) from the muzzle. Pointed ears. Glowing forehead gem (glow). Does NOT include the antlers or mane.",
      "box": [[-0.3, 1.4, 0.5], [0.3, 2.15, 1.75]],
      "attaches": "Starts at neckBase on chest joint, neck1/neck2/head/jaw joints. Antlers and mane mount to skullTop and the neck line.",
      "joints": ["neck1", "neck2", "head", "jaw"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "antlersMane",
      "builds": "Two branching antlers (antler to antlerTip gradient, 3 tines each, gold bases) sprouting from skullTop (x ±0.1) and sweeping up and back, with small glowing cloud-curl ornaments. Signature cloud mane: a big overlapping series of swirly cloud blades (extruded cloud-lobe outlines or spirals) running from between the antlers down the nape and neck crest to the withers, in cloudWhite with cloudTeal and cloudViolet layers, bigger at the nape, plus two long cloud tresses drifting back from the cheeks. Fully assembled on the head and neck joints.",
      "box": [[-0.45, 1.5, 0.3], [0.45, 2.3, 1.3]],
      "attaches": "Antler roots at skullTop on the head joint; mane follows the neck line from skullTop down to chestTop on neck1/neck2/head joints.",
      "joints": ["head", "neck1", "neck2"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "tail",
      "builds": "Long ox-like tail on tail1..tail3, swept back and up from tailBase: scaleTeal base fading into a big plume of cloud-white and teal blades, with a flame tip (flame and flameCore layered blades, glow) at the end. Gold tail ring bands. Also the hip-side fur cloud tufts around the rump (cloudWhite) and small gold spine spikes along the rump.",
      "box": [[-0.3, 1.1, -1.5], [0.3, 1.9, -0.7]],
      "attaches": "Root at tailBase on the hips joint, joints tail1, tail2, tail3.",
      "joints": ["tail1", "tail2", "tail3"],
      "floor": false,
      "budget": 150
    }
  ]
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import { catmull, offset, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTail({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const base = M.tailBase;
  // tail path swept back and up
  const pts: [number, number, number][] = [
    [0, 1.35, -0.75],
    [0, 1.4, -1.0],
    [0, 1.48, -1.25],
    [0, 1.6, -1.45],
  ];
  const path = catmull(pts);
  const chain = [J.tail1, J.tail2, J.tail3];
  const tube = b.sweep(path, [0.085, 0.045], {
    bone: chain,
    sectors: [[125, 235, P.belly]],
    color: P.scaleTeal,
    caps: "round",
  });

  // gold ring bands
  for (const t of [0.25, 0.55, 0.85]) {
    const p = path.at(t);
    const rad = 0.085 - 0.04 * t + 0.012;
    const bone = t < 0.4 ? J.tail1 : t < 0.7 ? J.tail2 : J.tail3;
    b.part(new THREE.TorusGeometry(rad, 0.012, 5, 10), P.gold, {
      at: [p.x, p.y, p.z],
      dir: path.tangentAt(t),
      axis: "z",
      bone,
    });
  }

  // scale plates on top of tail
  for (let i = 0; i < 6; i++) {
    const t = 0.08 + i * 0.15;
    const h = tube.at(t, 0);
    b.stick(new THREE.ConeGeometry(0.03, 0.035, 4), i % 2 ? P.scaleJade : P.scaleDeep, h, { embed: 0.3 });
  }

  // plume blades fanning from tail end
  const end = path.at(1);
  const blade = (len: number, w: number, dir: number[], color: string, bone: any) => {
    const tip = [end.x + dir[0] * len, end.y + dir[1] * len, end.z + dir[2] * len];
    b.spike([end.x, end.y, end.z], tip, null, w, { color, bone });
  };
  const cols = [P.cloudWhite, P.cloudTeal, P.cloudViolet, P.cloudWhite, P.cloudTeal];
  for (let i = 0; i < 13; i++) {
    const a = (i / 12 - 0.5) * 2.4;
    const lift = (r() - 0.3) * 0.5;
    const d = [Math.sin(a) * 0.55, 0.15 + lift + 0.25 * Math.cos(a), -0.8];
    const L = 0.38 + r() * 0.2;
    const n = Math.hypot(d[0], d[1], d[2]);
    blade(L, 0.07 + r() * 0.03, d.map((v) => v / n), cols[i % cols.length], J.tail3);
  }
  // swirl puffs
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.IcosahedronGeometry(0.07 + r() * 0.04, 0), cols[i % 3], {
      at: [(r() - 0.5) * 0.25, end.y + 0.02 + r() * 0.15, end.z - 0.1 - r() * 0.2],
      bone: J.tail3,
    });
  }

  // flame tip
  const fz = end.z - 0.52;
  glow(b.spike([end.x, end.y + 0.1, end.z - 0.2], [0, end.y + 0.28, fz - 0.1], null, 0.09, { color: P.flame, bone: J.tail3 }), 1.3);
  glow(b.spike([end.x, end.y + 0.1, end.z - 0.2], [0, end.y + 0.24, fz - 0.02], null, 0.05, { color: P.flameCore, bone: J.tail3 }), 1.6);
  for (const s of [1, -1])
    glow(b.spike([s * 0.03, end.y + 0.08, end.z - 0.18], [s * 0.14, end.y + 0.15, fz + 0.05], null, 0.045, { color: P.flame, bone: J.tail3 }), 1.3);

  // rump fur cloud tufts
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.IcosahedronGeometry(0.075 - i * 0.008, 0), i % 2 ? P.cloudTeal : P.cloudWhite, {
        at: [s * (0.2 - i * 0.01), 1.28 + i * 0.03, -0.62 - i * 0.07],
        bone: J.tail1,
      });
    }
  }

  // gold spine spikes along rump
  for (let i = 0; i < 5; i++) {
    const z = -0.5 - i * 0.07;
    b.spike([0, 1.5 - i * 0.02, z], [0, 1, 0.1 * 0], 0.09 - i * 0.008, 0.02, { color: P.gold, bone: J.tail1 });
  }
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { limb, rng } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: Ctx) {
  const rand = rng(11);
  const hoofR = 0.045;

  const leg = (s: number, front: boolean) => {
    const side = s > 0 ? "L" : "R";
    const root = front ? J["shoulder" + side] : J["hip" + side];
    const hx = s * 0.25;
    const hy = front ? 1.2 : 1.15;
    const hz = front ? 0.5 : -0.5;
    const foot: [number, number, number] = [hx, 0.07, hz + (front ? 0.05 : -0.02)];
    const lens = front ? [0.42, 0.4, 0.3] : [0.4, 0.42, 0.3];
    const bends = front
      ? [[0, 0, -1], [0, 0, 1]]
      : [[0, 0, 1], [0, 0, -1]];
    const pts = limb([hx, hy, hz], foot, lens, bends as any);
    const nm = front ? "F" : "H";
    const names = [
      (front ? "upperF" : "thighH") + side,
      "knee" + nm + side,
      "cannon" + nm + side,
      "hoof" + nm + side,
    ];
    const ch = b.chain("leg" + nm + side, pts, { parent: root, names, role: "leg" });

    // upper leg scaled teal, lower cream
    b.sweep(ch, (t: number) => (front ? 0.075 : 0.095) * (1 - t * 0.6) + 0.03, {
      sides: 8,
      bands: [
        [0.4, P.scaleTeal],
        [0.62, P.scaleDeep],
        [1, P.belly],
      ],
      caps: "round",
    });

    // scale plates on upper leg
    const up = pts[0], kn = pts[1];
    for (let i = 0; i < 5; i++) {
      const t = 0.1 + i * 0.16;
      const p = up.clone().lerp(kn, t);
      b.part(new THREE.ConeGeometry(0.03, 0.04, 4), i % 2 ? P.scaleJade : P.scaleTeal, {
        bone: ch.joints[0],
        at: [p.x + s * 0.06, p.y, p.z + 0.01],
        dir: [s, 0, 0.1],
      });
    }

    // knee cloud tufts: blades
    const kneeP = pts[1];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + rand();
      b.part(new THREE.OctahedronGeometry(0.05, 0), i % 2 ? P.cloudTeal : P.cloudWhite, {
        bone: ch.joints[1],
        at: [kneeP.x + Math.cos(a) * 0.055, kneeP.y + Math.sin(a) * 0.04, kneeP.z + Math.sin(a) * 0.05],
        scale: [0.9, 1.1, 0.9],
      });
    }

    // fetlock
    const fet = pts[3].clone().lerp(pts[2], 0.0);
    const fx = pts[3];
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8), P.gold, {
      bone: ch.joints[2], at: [fx.x, fx.y + 0.1, fx.z],
    });
    b.part(new THREE.CylinderGeometry(0.043, 0.043, 0.012, 8), P.goldDark, {
      bone: ch.joints[2], at: [fx.x, fx.y + 0.075, fx.z],
    });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.part(new THREE.OctahedronGeometry(0.04, 0), i % 2 ? P.cloudTeal : P.cloudWhite, {
        bone: ch.joints[2],
        at: [fx.x + Math.cos(a) * 0.05, fx.y + 0.045, fx.z + Math.sin(a) * 0.05],
        scale: [1, 0.8, 1],
      });
    }

    // cloven hooves
    for (const h of [-1, 1]) {
      b.part(new THREE.BoxGeometry(0.036, 0.07, 0.1), P.hoof, {
        bone: ch.joints[3], at: [fx.x + h * 0.02, 0.035, fx.z + 0.035],
      });
      b.part(new THREE.BoxGeometry(0.038, 0.012, 0.102), P.gold, {
        bone: ch.joints[3], at: [fx.x + h * 0.02, 0.068, fx.z + 0.035],
      });
    }
    // dewclaw / pastern block
    b.part(new THREE.BoxGeometry(0.07, 0.05, 0.08), P.hoof, {
      bone: ch.joints[3], at: [fx.x, 0.09, fx.z + 0.01],
    });
    // knee gold roundel
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8), P.gold, {
      bone: ch.joints[1], at: [kneeP.x + s * 0.06, kneeP.y, kneeP.z], dir: [s, 0, 0],
    });
  };

  for (const s of [1, -1]) {
    leg(s, true);
    leg(s, false);
  }
}
```

<!-- call: body -->

```ts
import * as THREE from "three";
import { rng, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildBody({ b, J, P, M }: any) {
  const hips = J.hips, chest = J.chest;
  const r = rng(11);

  // Torso loft: rump -> chest
  const st = [
    { at: [0, 1.28, -0.78], w: 0.46, h: 0.5 },
    { at: [0, 1.27, -0.45], w: 0.7, h: 0.62 },
    { at: [0, 1.25, -0.05], w: 0.68, h: 0.58 },
    { at: [0, 1.25, 0.32], w: 0.72, h: 0.7 },
    { at: [0, 1.28, 0.6], w: 0.62, h: 0.66 },
  ];
  const body = b.loft(st, {
    bone: [hips, chest],
    sectors: [[110, 250, P.belly]],
    color: P.scaleTeal,
  });

  const skin = b.surface(body);

  // Scale plates over back and flanks
  const hits = skin.scatter(80, { rng: r, minDist: 0.1, filter: (h: any) => h.n.y > -0.2 });
  for (const h of hits) {
    const jade = h.n.y > 0.5;
    b.stick(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 6), P.scaleDeep, h, { embed: 0.3 });
    b.stick(new THREE.CylinderGeometry(0.036, 0.04, 0.014, 6), jade ? P.scaleJade : P.scaleTeal, h.moved([0, 0.004, 0]), { embed: 0.3 });
  }

  // Gold girth band
  const girth = skin.loop([0, 1.25, 0.05], { dir: [0, 0, 1], lift: 0.012 });
  b.sweep(girth, 0.022, { color: P.gold });
  b.sweep(skin.loop([0, 1.25, 0.05], { dir: [0, 0, 1], lift: 0.012 }), 0.008, { color: P.goldDark, shift: [0, 0.02] });

  // Chest plate
  const cp = skin.around([0, 1.25, 0.32]).at(0, -5);
  if (cp) {
    b.stick(new THREE.CylinderGeometry(0.14, 0.17, 0.03, 6), P.gold, cp, { embed: 0.3 });
    b.stick(new THREE.CylinderGeometry(0.08, 0.1, 0.03, 6), P.goldDark, cp.moved([0, 0.012, 0]), { embed: 0.3 });
    b.stick(new THREE.SphereGeometry(0.035, 6, 4), P.glow, cp.moved([0, 0.03, 0]), { embed: 0.2 });
  }

  // Flank runes and roundels
  for (const s of [1, -1]) {
    const flank = skin.around([0, 1.25, -0.1]).at(s * 90, 5);
    if (flank) {
      b.stick(new THREE.CylinderGeometry(0.12, 0.12, 0.014, 12), P.gold, flank, { embed: 0.3 });
      b.stick(new THREE.CylinderGeometry(0.095, 0.095, 0.016, 12), P.scaleDeep, flank.moved([0, 0.004, 0]), { embed: 0.3 });
      const sp = b.sweep(
        catmull([[0.0, 0], [0.05, 0.02], [0.06, -0.03], [0.0, -0.05], [-0.04, 0]].map(([x, y]) => flank.moved([0, 0.014, 0]).moved([x, 0.0, y]).at)),
        0.008,
        { color: P.glow },
      );
      glow(sp, 1.5);
      glow(b.stick(new THREE.SphereGeometry(0.018, 6, 4), P.glow, flank.moved([0, 0.02, 0]), { embed: 0.2 }), 2);
    }
    for (const [z, y] of [[0.5, 1.4], [-0.5, 1.4]]) {
      const rd = skin.around([0, 1.25, z]).at(s * 80, 30);
      if (rd) {
        b.stick(new THREE.CylinderGeometry(0.07, 0.08, 0.025, 8), P.gold, rd, { embed: 0.3 });
        b.stick(new THREE.SphereGeometry(0.025, 6, 4), P.goldDark, rd.moved([0, 0.02, 0]), { embed: 0.2 });
      }
    }
  }

  // Spine ridge of gold spikes
  const ridge = catmull([[0, 1.58, -0.7], [0, 1.6, -0.2], [0, 1.6, 0.3], [0, 1.58, 0.55]]);
  b.along(ridge, 14, (at: any) => {
    const hit = skin.ray([at.at.x, 2.2, at.at.z], [0, -1, 0]);
    if (hit) b.stick(new THREE.ConeGeometry(0.025, 0.09, 5), P.gold, hit, { embed: 0.15 });
  });

  // Chest-top cloud swirl fluffs
  for (let i = 0; i < 5; i++) {
    const z = 0.3 + i * 0.07, y = 1.57 - i * 0.02;
    const col = [P.cloudWhite, P.cloudTeal, P.cloudViolet][i % 3];
    b.part(new THREE.IcosahedronGeometry(0.07 - i * 0.006, 0), col, {
      bone: chest, at: [0, y, z], scale: [1.3, 0.8, 1], flat: true,
    });
  }
  for (const s of [1, -1])
    b.part(new THREE.IcosahedronGeometry(0.06, 0), P.cloudWhite, { bone: chest, at: [s * 0.14, 1.54, 0.5], flat: true });
}
```

<!-- call: antlersMane -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildAntlersMane({ b, J, P, M }: Ctx) {
  const head = J.head, neck1 = J.neck1, neck2 = J.neck2;
  const R = rng(11);
  const v = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  // ---- Antlers ----
  for (const s of [1, -1]) {
    const root: [number, number, number] = v(s * 0.1, 2.06, 1.08);
    const p1 = v(s * 0.14, 2.28, 0.98);
    const p2 = v(s * 0.2, 2.5, 0.8);
    const p3 = v(s * 0.26, 2.68, 0.6);
    // gold base
    b.part(new THREE.CylinderGeometry(0.05, 0.065, 0.07, 8), P.gold, { bone: head, at: v(s * 0.1, 2.07, 1.08) });
    b.part(new THREE.TorusGeometry(0.055, 0.012, 5, 10), P.goldDark, { bone: head, at: v(s * 0.1, 2.1, 1.08), rotation: [90, 0, 0] });
    // main beam in two colour segments
    b.sweep([root, p1, p2], [0.04, 0.03], { bone: head, color: P.antler, caps: { start: "flat", end: "round" } });
    b.sweep([p2, p3], [0.03, 0.012], { bone: head, color: P.antlerTip, caps: { end: "point" } });
    // tines
    const tines: [number[], number[], number[]][] = [
      [p1, v(s * 0.2, 2.36, 1.05), v(s * 0.3, 2.5, 1.0)],
      [p2, v(s * 0.3, 2.62, 0.82), v(s * 0.42, 2.78, 0.78)],
      [p2, v(s * 0.26, 2.5, 0.55), v(s * 0.4, 2.52, 0.4)],
    ];
    tines.forEach(([a, m, e], i) => {
      b.sweep([a, m, e], [0.024, 0.008], { bone: head, color: i === 0 ? P.antler : P.antlerTip, caps: { end: "point" } });
      b.part(new THREE.SphereGeometry(0.016, 6, 4), P.glow, { bone: head, at: m });
    });
    // gold bands
    b.part(new THREE.TorusGeometry(0.036, 0.01, 5, 8), P.gold, { bone: head, at: p1, dir: v(s * 0.06, 0.22, -0.1), axis: "z" });
    b.part(new THREE.TorusGeometry(0.03, 0.009, 5, 8), P.gold, { bone: head, at: p2, dir: v(s * 0.06, 0.2, -0.2), axis: "z" });
    // glowing cloud curl ornament
    const curl = b.sweep(
      [v(s * 0.22, 2.58, 0.7), v(s * 0.3, 2.6, 0.68), v(s * 0.32, 2.52, 0.66), v(s * 0.27, 2.5, 0.66)],
      0.01, { bone: head, color: P.glow, caps: { end: "round" } });
    glow(curl, 1.4);
  }

  // ---- Mane blades ----
  const lobe = (w: number, h: number): [number, number][] => [
    [0, 0], [w * 0.5, -h * 0.05], [w * 0.55, h * 0.3], [w * 0.4, h * 0.55], [w * 0.15, h * 0.85],
    [-w * 0.05, h], [-w * 0.25, h * 0.7], [-w * 0.5, h * 0.55], [-w * 0.55, h * 0.25], [-w * 0.35, -h * 0.02],
  ];
  const cols = [P.cloudWhite, P.cloudTeal, P.cloudViolet, P.cloudWhite];
  // path points from skull down the neck to withers
  const pts: [number[], any, number][] = [
    [v(0, 2.1, 1.0), head, 1.0],
    [v(0, 2.03, 0.92), head, 1.1],
    [v(0, 1.98, 0.84), neck2, 1.2],
    [v(0, 1.9, 0.74), neck2, 1.15],
    [v(0, 1.82, 0.66), neck2, 1.05],
    [v(0, 1.74, 0.56), neck1, 0.95],
    [v(0, 1.66, 0.47), neck1, 0.85],
    [v(0, 1.58, 0.38), neck1, 0.75],
    [v(0, 1.52, 0.28), neck1, 0.65],
  ];
  pts.forEach(([at, bone, sc], i) => {
    for (let layer = 0; layer < 3; layer++) {
      const w = (0.2 - layer * 0.03) * sc, h = (0.3 - layer * 0.04) * sc;
      const col = layer === 0 ? cols[i % 3 === 1 ? 1 : 0] : layer === 1 ? cols[(i + 1) % 3] : cols[(i + 2) % 3];
      const side = (layer - 1) * 0.045;
      b.extrude(lobe(w, h), {
        at: [at[0] + side, at[1] + 0.02 * layer, at[2] - 0.01 * layer],
        x: [0, 0, -1], y: [0, 1, -0.5 + layer * 0.25],
        thickness: 0.035, bevel: 0.008, smoothing: 1, color: col, bone,
      });
    }
    // curl accent
    if (i % 2 === 0) {
      b.sweep([v(0.03, at[1] + 0.12 * sc, at[2] - 0.08), v(0.05, at[1] + 0.2 * sc, at[2] - 0.14), v(0.04, at[1] + 0.22 * sc, at[2] - 0.2), v(0.02, at[1] + 0.17 * sc, at[2] - 0.2)],
        0.008, { bone, color: P.cloudViolet });
    }
  });
  // big nape swirl
  b.sweep([v(0, 2.0, 0.8), v(0.02, 2.25, 0.72), v(0.03, 2.35, 0.58), v(0.02, 2.28, 0.46), v(0.0, 2.2, 0.5)],
    [0.03, 0.012], { bone: neck2, color: P.cloudTeal });

  // ---- Cheek tresses ----
  for (const s of [1, -1]) {
    const start = v(s * 0.17, 1.96, 1.1);
    const cs = [P.cloudWhite, P.cloudTeal, P.cloudViolet];
    for (let k = 0; k < 3; k++) {
      const off = (k - 1) * 0.05;
      const path = [
        start,
        v(s * (0.24 + off), 1.86 - k * 0.03, 0.95),
        v(s * (0.3 + off), 1.78 - k * 0.05, 0.7),
        v(s * (0.28 + off), 1.82 - k * 0.04, 0.45),
        v(s * (0.34 + off), 1.74 - k * 0.04, 0.32),
      ];
      b.sweep(path, [0.05 - k * 0.008, 0.004], { bone: head, color: cs[k], caps: { end: "point" }, section: { ngon: 6 } });
    }
    b.part(new THREE.SphereGeometry(0.03, 6, 5), P.gold, { bone: head, at: start });
  }
}
```

<!-- call: headNeck -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHeadNeck({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // ---- Neck
  const neckPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.48, 0.55),
    new THREE.Vector3(0, 1.62, 0.72),
    new THREE.Vector3(0, 1.78, 0.93),
    new THREE.Vector3(0, 1.93, 1.12),
  ]);
  const pts = neckPath.getPoints(12).map((v) => [v.x, v.y, v.z]);
  const neck = b.sweep(pts, [0.2, 0.12], {
    bone: [J.neck1, J.neck2, J.head],
    color: P.scaleTeal,
    sectors: [[125, 235, P.belly]],
    sides: 10,
    caps: "round",
  });
  // scale plates
  for (let i = 0; i < 9; i++) {
    const t = 0.08 + i * 0.1;
    for (const a of [-70, -35, 0, 35, 70]) {
      const h = neck.at(t + (a % 70 === 0 ? 0.03 : 0), a);
      b.stick(new THREE.SphereGeometry(0.03, 5, 3), i % 2 ? P.scaleJade : P.scaleDeep, h, { embed: 0.6, scale: [1.2, 0.35, 0.9] } as any);
    }
  }
  // gold collar
  const c = neck.at(0.12, 0);
  b.ring(c, { count: 12, radius: 0.19 }, (it) =>
    b.stick(new THREE.SphereGeometry(0.02, 5, 4), P.gold, it, { embed: 0.2 }),
  );
  b.ring(neck.at(0.12, 0), { count: 1, radius: 0 });

  // ---- Skull & muzzle
  b.part(sph(1, 12, 8), P.scaleTeal, { bone: J.head, at: [0, 1.97, 1.15], scale: [0.14, 0.125, 0.17] });
  b.part(sph(1, 8, 6), P.scaleJade, { bone: J.head, at: [0, 2.03, 1.18], scale: [0.09, 0.05, 0.12] });
  b.frustumBox([0, 1.94, 1.25], [0, 1.9, 1.62], [0.2, 0.17], [0.15, 0.11], { bone: J.head, color: P.scaleTeal });
  b.frustumBox([0, 1.865, 1.3], [0, 1.835, 1.62], [0.17, 0.03], [0.13, 0.03], { bone: J.head, color: P.belly });
  b.part(new THREE.BoxGeometry(0.17, 0.035, 0.07), P.gold, { bone: J.head, at: [0, 1.96, 1.63] });
  for (const s of [1, -1]) {
    b.part(sph(0.028, 6, 4), P.ink, { bone: J.head, at: [s * 0.05, 1.95, 1.66], scale: [1, 0.8, 0.6] });
    b.part(sph(0.03, 6, 4), P.scaleDeep, { bone: J.head, at: [s * 0.075, 1.945, 1.6] });
    // fangs upper
    b.spike([s * 0.065, 1.855, 1.58], [0, -1, 0], 0.05, 0.012, { bone: J.head, color: P.tooth });
    // blush
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 8), P.blush, {
      bone: J.head, at: [s * 0.115, 1.92, 1.3], dir: [s, 0, 0.1],
    });
    // eye
    const ex = s * 0.1, ey = 1.99, ez = 1.27;
    const d: [number, number, number] = [s * 0.55, 0, 0.83];
    b.part(sph(0.047, 10, 8), P.white, { bone: J.head, at: [ex, ey, ez] });
    b.part(sph(0.035, 8, 6), P.eyeIris, { bone: J.head, at: [ex + d[0] * 0.022, ey, ez + d[2] * 0.022], scale: [0.9, 1.15, 0.9] });
    b.part(sph(0.021, 6, 5), P.ink, { bone: J.head, at: [ex + d[0] * 0.035, ey, ez + d[2] * 0.035], scale: [0.8, 1.2, 0.8] });
    b.part(sph(0.009, 5, 4), P.white, { bone: J.head, at: [ex + d[0] * 0.05 - s * 0.006, ey + 0.017, ez + d[2] * 0.05 + 0.004] });
    b.part(sph(0.005, 4, 3), P.white, { bone: J.head, at: [ex + d[0] * 0.05 + s * 0.008, ey - 0.014, ez + d[2] * 0.05] });
    // lashes
    for (let k = 0; k < 3; k++)
      b.spike([ex + s * 0.01, ey + 0.035, ez - 0.01 - k * 0.012], [s * 0.7, 0.5 - k * 0.1, -0.6], 0.07, 0.006, { bone: J.head, color: P.gold });
    // brow ridge
    b.rod([s * 0.06, 2.05, 1.3], [s * 0.125, 2.04, 1.2], 0.014, { bone: J.head, color: P.scaleDeep });
    // ear
    b.spike([s * 0.085, 2.08, 1.05], [s * 0.5, 0.7, -0.5], 0.16, 0.035, { bone: J.head, color: P.scaleTeal });
    b.spike([s * 0.085, 2.085, 1.06], [s * 0.5, 0.7, -0.5], 0.11, 0.02, { bone: J.head, color: P.blush });
    // cheek fins
    for (let k = 0; k < 3; k++)
      b.spike([s * 0.125, 1.97 - k * 0.04, 1.12 - k * 0.015], [s * 0.8, 0.15 - k * 0.2, -1], 0.17 - k * 0.03, 0.025, { bone: J.head, color: P.scaleJade });
    // whiskers
    const w = b.sweep(
      [[s * 0.07, 1.9, 1.6], [s * 0.2, 1.84, 1.62], [s * 0.28, 1.66, 1.45], [s * 0.3, 1.5, 1.3]],
      [0.009, 0.002],
      { bone: J.head, color: P.gold, sides: 5, caps: "round" },
    );
    b.part(sph(0.022, 6, 4), P.gold, { bone: J.head, at: [s * 0.07, 1.9, 1.6] });
  }

  // ---- Jaw
  b.frustumBox([0, 1.855, 1.27], [0, 1.82, 1.6], [0.17, 0.05], [0.12, 0.045], { bone: J.jaw, color: P.scaleTeal });
  b.part(new THREE.BoxGeometry(0.09, 0.012, 0.22), P.tongue, { bone: J.jaw, at: [0, 1.87, 1.42] });
  b.part(new THREE.BoxGeometry(0.13, 0.03, 0.04), P.gold, { bone: J.jaw, at: [0, 1.815, 1.6] });
  for (const s of [1, -1]) {
    b.spike([s * 0.055, 1.865, 1.56], [0, 1, 0], 0.04, 0.01, { bone: J.jaw, color: P.tooth });
    b.spike([s * 0.08, 1.8, 1.3], [s * 0.8, -0.2, -0.6], 0.07, 0.02, { bone: J.jaw, color: P.scaleJade });
  }

  // ---- Forehead gem
  glow(b.part(new THREE.OctahedronGeometry(0.035), P.glow, { bone: J.head, at: [0, 2.07, 1.27], scale: [0.8, 1.3, 0.8] }), 1.6);
  b.part(new THREE.CylinderGeometry(0.05, 0.055, 0.015, 6), P.gold, { bone: J.head, at: [0, 2.05, 1.27], dir: [0, 0.6, 0.8] });
}
```

<!-- call: fit-headNeck -->

The stray scale plates sit at the neck's start, where `neck.at(t, a)` with a small `t` lands behind the box's -z face. I'm starting the plates later along the neck, at t = 0.2 instead of 0.08, which moves those three spheres forward inside the box.

<<<<<<< SEARCH
    const t = 0.08 + i * 0.1;
=======
    const t = 0.2 + i * 0.085;
>>>>>>> REPLACE

<!-- call: fit-body -->

The torso loft's round end caps were pushing it past the box, and the chest plate, rump spikes and roundels were seated on those caps. Flat end caps keep the loft within z = -0.78 to 0.6, and the pieces seated on it move with it.

<<<<<<< SEARCH
    sectors: [[110, 250, P.belly]],
=======
    caps: "flat",
    sectors: [[110, 250, P.belly]],
>>>>>>> REPLACE

<!-- call: fit-tail -->

```ts
import * as THREE from "three";
import { catmull, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTail({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const pts: [number, number, number][] = [
    [0, 1.35, -0.75],
    [0, 1.4, -0.88],
    [0, 1.46, -1.0],
    [0, 1.52, -1.1],
  ];
  const path = catmull(pts);
  const tube = b.sweep(path, [0.075, 0.04], {
    bone: [J.tail1, J.tail2, J.tail3],
    sectors: [[125, 235, P.belly]],
    color: P.scaleTeal,
    caps: "round",
  });

  for (const t of [0.25, 0.55, 0.85]) {
    const p = path.at(t);
    const rad = 0.075 - 0.035 * t + 0.012;
    const bone = t < 0.4 ? J.tail1 : t < 0.7 ? J.tail2 : J.tail3;
    b.part(new THREE.TorusGeometry(rad, 0.01, 5, 10), P.gold, {
      at: [p.x, p.y, p.z],
      dir: path.tangentAt(t),
      axis: "z",
      bone,
    });
  }

  for (let i = 0; i < 5; i++) {
    const t = 0.1 + i * 0.17;
    const h = tube.at(t, 0);
    b.stick(new THREE.ConeGeometry(0.025, 0.03, 4), i % 2 ? P.scaleJade : P.scaleDeep, h, { embed: 0.3 });
  }

  const end = path.at(1);
  const cols = [P.cloudWhite, P.cloudTeal, P.cloudViolet, P.cloudWhite, P.cloudTeal];
  for (let i = 0; i < 13; i++) {
    const a = (i / 12 - 0.5) * 2.4;
    const lift = (r() - 0.3) * 0.5;
    const d = [Math.sin(a) * 0.55, 0.15 + lift + 0.25 * Math.cos(a), -0.8];
    const n = Math.hypot(d[0], d[1], d[2]);
    const L = 0.22 + r() * 0.1;
    const tip = [end.x + (d[0] / n) * L, end.y + (d[1] / n) * L, end.z + (d[2] / n) * L];
    b.spike([end.x, end.y, end.z], tip, null, 0.05 + r() * 0.02, { color: cols[i % cols.length], bone: J.tail3 });
  }
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.IcosahedronGeometry(0.05 + r() * 0.03, 0), cols[i % 3], {
      at: [(r() - 0.5) * 0.2, end.y + 0.02 + r() * 0.1, end.z - 0.05 - r() * 0.1],
      bone: J.tail3,
    });
  }

  const fz = -1.46;
  glow(b.spike([end.x, end.y + 0.08, end.z - 0.1], [0, end.y + 0.22, fz], null, 0.07, { color: P.flame, bone: J.tail3 }), 1.3);
  glow(b.spike([end.x, end.y + 0.08, end.z - 0.1], [0, end.y + 0.2, fz + 0.05], null, 0.04, { color: P.flameCore, bone: J.tail3 }), 1.6);
  for (const s of [1, -1])
    glow(b.spike([s * 0.03, end.y + 0.07, end.z - 0.1], [s * 0.12, end.y + 0.13, fz + 0.1], null, 0.035, { color: P.flame, bone: J.tail3 }), 1.3);

  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.IcosahedronGeometry(0.06 - i * 0.006, 0), i % 2 ? P.cloudTeal : P.cloudWhite, {
        at: [s * (0.2 - i * 0.015), 1.28 + i * 0.03, -0.74 - i * 0.05],
        bone: J.tail1,
      });
    }
  }

  for (let i = 0; i < 4; i++) {
    const z = -0.72 - i * 0.05;
    b.spike([0, 1.46 - i * 0.02, z], [0, 1, 0], 0.08 - i * 0.008, 0.018, { color: P.gold, bone: J.tail1 });
  }
}
```

<!-- call: fit-antlersMane -->

The antlers rose to 2.79 m, so I compressed their heights into the box (max y 2.3) and moved the nape neck piece forward to z ≥ 0.3. I'm sending the whole function, with the antler points lowered and tightened.

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildAntlersMane({ b, J, P, M }: Ctx) {
  const head = J.head, neck1 = J.neck1, neck2 = J.neck2;
  const R = rng(11);
  const v = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  // ---- Antlers ----
  for (const s of [1, -1]) {
    const root: [number, number, number] = v(s * 0.1, 2.06, 1.08);
    const p1 = v(s * 0.13, 2.14, 1.0);
    const p2 = v(s * 0.18, 2.23, 0.88);
    const p3 = v(s * 0.23, 2.3, 0.74);
    b.part(new THREE.CylinderGeometry(0.05, 0.065, 0.07, 8), P.gold, { bone: head, at: v(s * 0.1, 2.07, 1.08) });
    b.part(new THREE.TorusGeometry(0.055, 0.012, 5, 10), P.goldDark, { bone: head, at: v(s * 0.1, 2.1, 1.08), rotation: [90, 0, 0] });
    b.sweep([root, p1, p2], [0.04, 0.03], { bone: head, color: P.antler, caps: { start: "flat", end: "round" } });
    b.sweep([p2, p3], [0.03, 0.012], { bone: head, color: P.antlerTip, caps: { end: "point" } });
    const tines: [number[], number[], number[]][] = [
      [p1, v(s * 0.2, 2.2, 1.04), v(s * 0.3, 2.28, 1.0)],
      [p2, v(s * 0.26, 2.28, 0.88), v(s * 0.37, 2.3, 0.84)],
      [p2, v(s * 0.24, 2.27, 0.66), v(s * 0.36, 2.29, 0.52)],
    ];
    tines.forEach(([a, m, e], i) => {
      b.sweep([a, m, e], [0.024, 0.008], { bone: head, color: i === 0 ? P.antler : P.antlerTip, caps: { end: "point" } });
      b.part(new THREE.SphereGeometry(0.016, 6, 4), P.glow, { bone: head, at: m });
    });
    b.part(new THREE.TorusGeometry(0.036, 0.01, 5, 8), P.gold, { bone: head, at: p1, dir: v(s * 0.06, 0.22, -0.1), axis: "z" });
    b.part(new THREE.TorusGeometry(0.03, 0.009, 5, 8), P.gold, { bone: head, at: p2, dir: v(s * 0.06, 0.2, -0.2), axis: "z" });
    const curl = b.sweep(
      [v(s * 0.2, 2.2, 0.8), v(s * 0.27, 2.22, 0.78), v(s * 0.29, 2.16, 0.76), v(s * 0.24, 2.15, 0.76)],
      0.01, { bone: head, color: P.glow, caps: { end: "round" } });
    glow(curl, 1.4);
  }

  // ---- Mane blades ----
  const lobe = (w: number, h: number): [number, number][] => [
    [0, 0], [w * 0.5, -h * 0.05], [w * 0.55, h * 0.3], [w * 0.4, h * 0.55], [w * 0.15, h * 0.85],
    [-w * 0.05, h], [-w * 0.25, h * 0.7], [-w * 0.5, h * 0.55], [-w * 0.55, h * 0.25], [-w * 0.35, -h * 0.02],
  ];
  const cols = [P.cloudWhite, P.cloudTeal, P.cloudViolet, P.cloudWhite];
  const pts: [number[], any, number][] = [
    [v(0, 2.1, 1.0), head, 1.0],
    [v(0, 2.03, 0.92), head, 1.1],
    [v(0, 1.98, 0.84), neck2, 1.2],
    [v(0, 1.9, 0.74), neck2, 1.15],
    [v(0, 1.82, 0.66), neck2, 1.05],
    [v(0, 1.74, 0.56), neck1, 0.95],
    [v(0, 1.66, 0.47), neck1, 0.85],
    [v(0, 1.58, 0.4), neck1, 0.75],
    [v(0, 1.52, 0.34), neck1, 0.65],
  ];
  pts.forEach(([at, bone, sc], i) => {
    for (let layer = 0; layer < 3; layer++) {
      const w = (0.2 - layer * 0.03) * sc, h = (0.3 - layer * 0.04) * sc;
      const col = layer === 0 ? cols[i % 3 === 1 ? 1 : 0] : layer === 1 ? cols[(i + 1) % 3] : cols[(i + 2) % 3];
      const side = (layer - 1) * 0.045;
      b.extrude(lobe(w, h), {
        at: [at[0] + side, at[1] + 0.02 * layer, at[2] - 0.01 * layer],
        x: [0, 0, -1], y: [0, 1, -0.5 + layer * 0.25],
        thickness: 0.035, bevel: 0.008, smoothing: 1, color: col, bone,
      });
    }
    if (i % 2 === 0) {
      b.sweep([v(0.03, at[1] + 0.12 * sc, at[2] - 0.08), v(0.05, at[1] + 0.2 * sc, at[2] - 0.14), v(0.04, at[1] + 0.22 * sc, at[2] - 0.2), v(0.02, at[1] + 0.17 * sc, at[2] - 0.2)],
        0.008, { bone, color: P.cloudViolet });
    }
  });
  b.sweep([v(0, 2.0, 0.8), v(0.02, 2.18, 0.72), v(0.03, 2.25, 0.6), v(0.02, 2.2, 0.5), v(0.0, 2.14, 0.52)],
    [0.03, 0.012], { bone: neck2, color: P.cloudTeal });

  // ---- Cheek tresses ----
  for (const s of [1, -1]) {
    const start = v(s * 0.17, 1.96, 1.1);
    const cs = [P.cloudWhite, P.cloudTeal, P.cloudViolet];
    for (let k = 0; k < 3; k++) {
      const off = (k - 1) * 0.05;
      const path = [
        start,
        v(s * (0.24 + off), 1.86 - k * 0.03, 0.95),
        v(s * (0.3 + off), 1.78 - k * 0.05, 0.7),
        v(s * (0.28 + off), 1.82 - k * 0.04, 0.45),
        v(s * (0.34 + off), 1.74 - k * 0.04, 0.32),
      ];
      b.sweep(path, [0.05 - k * 0.008, 0.004], { bone: head, color: cs[k], caps: { end: "point" }, section: { ngon: 6 } });
    }
    b.part(new THREE.SphereGeometry(0.03, 6, 5), P.gold, { bone: head, at: start });
  }
}
```