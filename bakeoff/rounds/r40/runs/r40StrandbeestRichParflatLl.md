<!-- call: plan -->

```json
{
  "name": "Strandbeest Tube Walker",
  "description": "A Theo Jansen style kinetic beach creature: a spine of yellow tubes carried on twelve linkage legs with a sail wing, standing in rest pose.",
  "builderName": "strandbeest",
  "size": [3.2, 2.4, 4.4],
  "layout": "Long low creature facing +Z. A central yellow tube frame (two parallel main rails, crossbars and a pair of crank shafts) sits at y 1.0-1.5. Six Jansen linkage legs per side hang below it, each a triangulated set of thin tubes ending in a rounded foot on y=0, with joints capped by small white nylon-sleeve connectors. At the front a rounded tube head with two big round eyes and a separate upper and lower jaw. At the back a tail of tapering tubes with a fan of sail-cloth wing panels on a tube mast. Every piece is a plain yellow, white or grey tube, rod, sleeve or flat sail panel, giving a bare kinetic sculpture look.",
  "palette": {
    "tubeYellow": "#f2c418",
    "tubeDark": "#c79a0c",
    "sleeveWhite": "#f4f1e8",
    "steel": "#8d96a3",
    "sailCream": "#efe4c4",
    "sailShade": "#d8c79a",
    "footBlack": "#2b2b30",
    "eyeWhite": "#ffffff",
    "pupil": "#1a1a20",
    "ribbon": "#e8553a"
  },
  "mounts": {
    "frameCenter": [0, 1.25, 0],
    "frameFront": [0, 1.25, 1.6],
    "frameBack": [0, 1.25, -1.6],
    "headMount": [0, 1.35, 1.7],
    "mastBase": [0, 1.5, -0.6],
    "legHipL": [0.7, 1.2, 0],
    "legHipR": [-0.7, 1.2, 0],
    "crankShaft": [0, 1.15, 0]
  },
  "joints": [
    { "name": "body", "at": [0, 1.25, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "neck", "parent": "body", "at": [0, 1.3, 1.6], "dir": [0, 0.3, 1], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 1.5, 2.0], "dir": [0, 0, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.4, 2.25], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "tail1", "parent": "body", "at": [0, 1.25, -1.6], "dir": [0, 0, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 1.3, -2.2], "dir": [0, 0.1, -1], "role": "tail" },
    { "name": "mast", "parent": "body", "at": [0, 1.5, -0.6], "dir": [0, 1, 0], "role": "hinge", "group": "wing" }
  ],
  "parts": [
    {
      "id": "frame",
      "builds": "The central yellow tube chassis: two main rails, crossbars every 0.4 m, a diagonal bracing lattice, the steel crank shaft with offset crank arms, white sleeve connectors at every crossing, and the top ridge tube.",
      "box": [[-0.85, 0.95, -1.7], [0.85, 1.55, 1.7]],
      "attaches": "Carries all other parts at frameCenter, frameFront, frameBack, mastBase, legHipL, legHipR and crankShaft.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "legsLeft",
      "builds": "Six Jansen linkage legs on the model's left (+X): each a triangulated set of thin yellow tubes (upper link, two thigh links, shin, ankle) with white sleeve joints, steel pivot pins, a dark yellow brace and a rounded black foot. Staggered phases so the feet are spread along z and alternately lifted a few cm, with the lowest feet resting on y=0.",
      "box": [[0.2, 0, -1.6], [1.6, 1.3, 1.6]],
      "attaches": "Hips at legHipL, riding the crankShaft line, hung off the frame rails.",
      "joints": ["body"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "legsRight",
      "builds": "Mirror of the left legs on the model's right (-X): six linkage legs with the same tube, sleeve, pin and foot construction, phase offset by half a cycle from the left side.",
      "box": [[-1.6, 0, -1.6], [-0.2, 1.3, 1.6]],
      "attaches": "Hips at legHipR, hung off the frame rails.",
      "joints": ["body"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "head",
      "builds": "Front creature head: a neck tube, a rounded yellow tube-loop skull, two large round white eyes with black pupils on tube stalks, a separate upper jaw and lower jaw (flat-ish tube frames with white sleeve teeth), and two forward antenna tubes with red ribbon tips.",
      "box": [[-0.5, 1.0, 1.6], [0.5, 1.9, 2.4]],
      "attaches": "Neck begins at headMount / frameFront; neck, head and jaw joints.",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "sailTail",
      "builds": "Rear section: a tapering two-segment tube tail with sleeve joints and a small steel foot-rest tip, plus a vertical tube mast at mastBase carrying a fan of cream sail-cloth panels (flat extrudes, alternating cream and shade tones) on spar tubes, with red ribbon streamers and cord tubes back to the tail.",
      "box": [[-1.0, 0.9, -2.2], [1.0, 2.4, -0.3]],
      "attaches": "Tail joints from frameBack; mast on mastBase.",
      "joints": ["tail1", "tail2", "mast"],
      "floor": false,
      "budget": 150
    }
  ]
}
```

<!-- call: legsLeft -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLegsLeft({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(5);
  const YEL = P.tubeYellow, DRK = P.tubeDark, WHT = P.sleeveWhite, STL = P.steel, BLK = P.footBlack;
  const rail = (a: number[], c: number[], r: number, col: string) =>
    b.rod(a, c, r, col, { bone, sides: 6 });
  const joint = (p: number[], r = 0.04) => {
    b.part(new THREE.SphereGeometry(r, 8, 6), WHT, { bone, at: p });
  };
  const pin = (p: number[], r = 0.015) => {
    b.part(new THREE.CylinderGeometry(r, r, 0.14, 6), STL, { bone, at: p, dir: [1, 0, 0] });
  };

  // crank shaft support line along z at the left of the frame
  const hipX = M.legHipL[0];
  const hipY = M.legHipL[1];

  for (let i = 0; i < 6; i++) {
    const z0 = -1.35 + i * 0.54;
    const phase = (i % 2 === 0 ? 1 : 0);
    const lift = phase * 0.05;
    // two lanes of x per leg to avoid clashes
    const lane = i % 2 === 0 ? 0.0 : 0.16;
    const x = hipX + lane;
    const hip = [x, hipY, z0];
    const crank = [x, hipY - 0.2, z0 + 0.12];
    const knee = [x, hipY - 0.5, z0 + 0.38];
    const knee2 = [x, hipY - 0.45, z0 - 0.32];
    const ankle = [x, 0.42 + lift, z0 + 0.2 + (R() - 0.5) * 0.04];
    const foot = [x, 0.09 + lift, z0 + 0.28];

    // mount stub from frame rail
    rail([0.62, hipY + 0.05, z0], hip, 0.025, YEL);
    // crank link
    rail(hip, crank, 0.022, YEL);
    // upper link and thigh links
    rail(crank, knee, 0.024, YEL);
    rail(hip, knee2, 0.024, YEL);
    rail(crank, knee2, 0.02, DRK);
    rail(knee2, knee, 0.022, YEL);
    // shin / ankle
    rail(knee, ankle, 0.025, YEL);
    rail(knee2, ankle, 0.02, YEL);
    rail(ankle, foot, 0.024, DRK);
    // dark brace
    rail(hip, ankle, 0.012, DRK);

    for (const p of [hip, crank, knee, knee2, ankle]) joint(p, 0.04);
    pin(hip, 0.016);
    pin(knee, 0.014);
    pin(knee2, 0.014);
    pin(ankle, 0.014);

    // rounded foot, bottom at y = lift
    b.part(new THREE.SphereGeometry(0.09, 10, 8), BLK, {
      bone, at: [x, 0.09 + lift, foot[2]], scale: [0.8, 1, 1.4],
    });
    // small sleeve at foot neck
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.06, 8), WHT, { bone, at: [x, 0.2 + lift, foot[2]] });
  }
  // lowest feet on the ground: ensure at least some reach y=0 (even indexes lift 0.05, odds 0)
}
```

<!-- call: sailTail -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildSailTail({ b, J, P, M }: Ctx) {
  const Y = P.tubeYellow, YD = P.tubeDark, W = P.sleeveWhite, S = P.steel;
  const R = rng(5);

  const sleeve = (p: number[], bone: any, r = 0.05) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.07, 8), W, { bone, at: p as any, dir: [1, 0, 0] });
  const ball = (p: number[], bone: any, r: number, c: string) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { bone, at: p as any });

  // tail segments
  const t0 = [0, 1.25, -1.6], t1 = [0, 1.3, -2.2], t2 = [0, 1.35, -2.18];
  b.rod(t0, t1, [0.06, 0.045], Y, { bone: J.tail1, sides: 8 });
  sleeve(t0, J.tail1, 0.07);
  sleeve(t1, J.tail2, 0.06);
  const tip = [0, 1.4, -2.2 - 0.0];
  b.rod(t1, tip, [0.045, 0.025], Y, { bone: J.tail2, sides: 8 });
  b.part(new THREE.CylinderGeometry(0.03, 0.02, 0.06, 8), S, { bone: J.tail2, at: [0, 1.42, -2.2] });
  // upper brace on the tail
  b.rod([0, 1.4, -1.6], [0, 1.31, -2.15], 0.02, YD, { bone: J.tail1 });
  sleeve([0, 1.4, -1.6], J.tail1, 0.04);

  // mast
  const base = M.mastBase;
  const top = [0, 2.3, -0.6];
  b.rod(base, top, [0.05, 0.035], Y, { bone: J.mast, sides: 8 });
  sleeve(base, J.mast, 0.07);
  sleeve([0, 1.9, -0.6], J.mast, 0.05);
  b.part(new THREE.ConeGeometry(0.04, 0.1, 8), S, { bone: J.mast, at: [0, 2.35, -0.6] });
  // guy braces
  for (const s of [1, -1]) b.rod([s * 0.3, 1.5, -0.6], [0, 1.95, -0.6], 0.015, S, { bone: J.mast });

  // sail fan
  const hub = [0, 1.75, -0.6];
  const n = 7;
  const tips: number[][] = [];
  for (let i = 0; i < n; i++) {
    const a = (-70 + (140 * i) / (n - 1)) * Math.PI / 180;
    const len = 1.0 - Math.abs(a) * 0.12;
    const tx = Math.sin(a) * len * 0.95;
    const ty = 1.75 + Math.cos(a) * len * 0.62;
    const tz = -0.6 - 0.3 - Math.cos(a) * 0.35;
    tips.push([tx, ty, tz]);
    b.rod(hub, [tx, ty, tz], [0.022, 0.012], i % 2 ? YD : Y, { bone: J.mast, sides: 6 });
    ball([tx, ty, tz], J.mast, 0.03, W);
  }
  for (let i = 0; i < n - 1; i++) {
    const a = tips[i], c = tips[i + 1];
    b.slab([hub, a, c], { color: i % 2 ? P.sailShade : P.sailCream, thickness: 0.012, bone: J.mast });
  }
  sleeve(hub, J.mast, 0.06);
  ball(hub, J.mast, 0.05, S);

  // ribbons off spar tips
  for (const i of [0, 3, 6]) {
    const p = tips[i];
    const e = [p[0] * 1.05, p[1] - 0.25, p[2] - 0.3];
    b.rod(p, e, [0.012, 0.006], P.ribbon, { bone: J.mast });
    b.part(new THREE.BoxGeometry(0.05, 0.12, 0.01), P.ribbon, { bone: J.mast, at: [e[0], e[1] - 0.05, e[2]] });
  }
  // cords down to tail
  for (const i of [1, 5]) {
    const p = tips[i];
    b.rod(p, [i < 3 ? 0.04 : -0.04, 1.32, -2.0], 0.008, S, { bone: J.mast });
  }
  b.rod([0, 2.0, -0.6], [0, 1.38, -2.0], 0.01, S, { bone: J.mast });
}
```

<!-- call: legsRight -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLegsRight({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const Y = P.tubeYellow, D = P.tubeDark, W = P.sleeveWhite, S = P.steel, K = P.footBlack;
  const hip0 = M.legHipR;
  const R = rng(11);

  const sleeve = (p: number[], r = 0.04) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.07, 8), W, { at: p, bone, dir: [1, 0, 0] });
  const pin = (p: number[]) =>
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.16, 6), S, { at: p, bone, dir: [1, 0, 0] });
  const link = (a: number[], c: number[], r: number, col: string) =>
    b.rod(a, c, r, col, { bone, sides: 6 });

  // crank shaft stub on the right side
  link([-0.3, 1.15, -1.5], [-0.3, 1.15, 1.5], 0.022, S);

  const N = 6;
  for (let i = 0; i < N; i++) {
    const z = -1.35 + i * (2.7 / (N - 1));
    // phase: half cycle offset vs left -> alternate lift, opposite of left parity
    const lift = i % 2 === 0 ? 0.0 : 0.05;
    const x = hip0[0] - 0.12 - (i % 2) * 0.1; // stagger lateral lanes
    const xo = x - 0.04;
    const ph = (i * Math.PI) / 1.5 + Math.PI;
    // crank pivot circles around crank shaft line
    const crank = [x, 1.15 + Math.sin(ph) * 0.08, z + Math.cos(ph) * 0.08];
    const hip = [x, 1.2, z];
    const upper = [x, 1.28, z + 0.28 * (i % 2 ? 1 : -1) * 0.5 + 0.1];
    const knee = [x, 0.82 + lift * 0.5, z - 0.38];
    const knee2 = [x, 0.78 + lift * 0.5, z + 0.34];
    const ankle = [x, 0.42 + lift, z - 0.1];
    const foot = [x, 0.09 + lift, z + 0.05];

    // frame hanger from rail to hip
    link([x + 0.1, 1.3, z], hip, 0.018, D);
    link(hip, crank, 0.016, S);
    // triangulated linkage
    link(crank, knee, 0.02, Y);
    link(crank, knee2, 0.02, Y);
    link(hip, upper, 0.02, Y);
    link(upper, knee2, 0.02, Y);
    link(upper, knee, 0.02, Y);
    link(knee, ankle, 0.022, Y);
    link(knee2, ankle, 0.022, Y);
    link(knee, knee2, 0.014, D); // brace
    link(ankle, foot, 0.026, Y);

    // second plane tubes (outer) for stiffness
    link([xo - 0.03, knee[1], knee[2]], [xo - 0.03, ankle[1], ankle[2]], 0.012, D);
    link([xo - 0.03, knee2[1], knee2[2]], [xo - 0.03, ankle[1], ankle[2]], 0.012, D);

    for (const p of [hip, upper, knee, knee2, ankle, crank]) sleeve(p);
    for (const p of [hip, knee, knee2, ankle]) pin(p);

    // rounded black foot
    b.part(new THREE.SphereGeometry(0.075, 8, 6), K, { at: [x, foot[1] - 0.0, foot[2]], bone, scale: [0.9, 0.9, 1.4] });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8), W, { at: [x, foot[1] + 0.07, foot[2]], bone });
  }

  // cross ties between legs along z
  for (let i = 0; i < N - 1; i++) {
    const z0 = -1.35 + i * 0.54;
    link([hip0[0] - 0.12, 1.3, z0], [hip0[0] - 0.12, 1.3, z0 + 0.54], 0.016, D);
  }
}
```

<!-- call: frame -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildFrame({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const Y = P.tubeYellow, D = P.tubeDark, W = P.sleeveWhite, S = P.steel;
  const R = rng(5);
  const sleeve = (p: number[], r = 0.05) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.07, 8), W, { bone, at: p, dir: [1, 0, 0] });
  const rod = (a: number[], c: number[], r: number, col: string) =>
    b.rod(a, c, r, col, { bone, sides: 6 });

  const railY = 1.1, topY = 1.5, X = 0.55;
  const zs: number[] = [];
  for (let z = -1.6; z <= 1.601; z += 0.4) zs.push(+z.toFixed(2));

  for (const s of [1, -1]) {
    // main lower rail and upper rail
    rod([s * X, railY, -1.7], [s * X, railY, 1.7], 0.04, Y);
    rod([s * X, topY, -1.5], [s * X, topY, 1.5], 0.03, D);
    // end caps
    for (const z of [-1.7, 1.7]) b.part(new THREE.SphereGeometry(0.045, 8, 6), W, { bone, at: [s * X, railY, z] });
    // vertical posts and diagonals
    for (let i = 0; i < zs.length; i++) {
      const z = zs[i];
      if (i % 2 === 0) {
        rod([s * X, railY, z], [s * X, topY, z], 0.025, Y);
        sleeve([s * X, topY, z], 0.04);
      }
      if (i < zs.length - 1) {
        const up = i % 2 === 0;
        rod([s * X, up ? railY : topY, z], [s * X, up ? topY : railY, zs[i + 1]], 0.018, D);
      }
      sleeve([s * X, railY, z], 0.048);
    }
  }

  // crossbars
  for (const z of zs) {
    rod([-X, railY, z], [X, railY, z], 0.03, Y);
    sleeve([0, railY, z], 0.04);
    if (Math.abs(z) < 1.5) rod([-X, topY, z], [X, topY, z], 0.02, D);
  }
  // horizontal X bracing between rails
  for (let i = 0; i < zs.length - 1; i += 2) {
    const j = Math.min(i + 2, zs.length - 1);
    rod([-X, railY, zs[i]], [X, railY, zs[j]], 0.014, D);
    rod([X, railY, zs[i]], [-X, railY, zs[j]], 0.014, D);
  }
  // top ridge tube and its stands
  rod([0, 1.52, -1.5], [0, 1.52, 1.5], 0.04, Y);
  for (const z of [-1.2, -0.4, 0.4, 1.2]) {
    rod([0, 1.52, z], [X, topY, z], 0.018, D);
    rod([0, 1.52, z], [-X, topY, z], 0.018, D);
    sleeve([0, 1.52, z], 0.05);
  }
  for (const z of [-1.5, 1.5]) b.part(new THREE.SphereGeometry(0.05, 8, 6), W, { bone, at: [0, 1.52, z] });

  // crank shaft
  const cy = M.crankShaft[1];
  b.rod([-0.85, cy, 0], [0.85, cy, 0], 0.025, S, { bone, sides: 8 });
  const cz = [-1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2];
  cz.forEach((z, i) => {
    const a = i * 1.05 + R() * 0.1;
    const oy = cy + Math.sin(a) * 0.12, oz = z + Math.cos(a) * 0.12;
    for (const s of [1, -1]) {
      const x = s * 0.7;
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8), S, { bone, at: [x, cy, z], dir: [1, 0, 0] });
      rod([x, cy, z], [x, oy, oz], 0.016, S);
      sleeve([x, oy, oz], 0.032);
    }
  });
  // shaft end caps
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.04, 8, 6), W, { bone, at: [s * 0.86, cy, 0] });
    // hip stubs reaching legHip mounts
    rod([s * X, railY, 0], [s * 0.7, M.legHipL[1], 0], 0.03, Y);
    sleeve([s * 0.7, M.legHipL[1], 0], 0.055);
  }
  // mast base plate
  b.part(new THREE.CylinderGeometry(0.09, 0.1, 0.04, 8), W, { bone, at: [0, 1.55, M.mastBase[2]] });
  // neck mount ring at front
  b.part(new THREE.TorusGeometry(0.08, 0.02, 6, 10), W, { bone, at: [0, 1.25, 1.62] });
  rod([0, railY, 1.6], [0, 1.28, 1.62], 0.025, Y);
  rod([0, railY, -1.6], [0, 1.25, -1.62], 0.025, Y);
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  const Y = P.tubeYellow, D = P.tubeDark, W = P.sleeveWhite, S = P.steel;
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // sleeve connector at a point
  const sleeve = (p: number[], bone: any, r = 0.035) =>
    b.part(sph(r, 8, 6), W, { bone, at: p });

  // tube with sleeves at ends
  const tube = (a: number[], c: number[], r: number, bone: any, col = Y, caps = true) => {
    b.rod(a, c, r, col, { bone, sides: 8 });
    if (caps) { sleeve(a, bone, r * 1.5); sleeve(c, bone, r * 1.5); }
  };

  // neck: from frameFront up and forward to the head
  const n0 = [0, 1.3, 1.6], n1 = [0, 1.5, 2.0];
  tube(n0, n1, 0.06, J.neck, Y);
  tube([0.07, 1.27, 1.6], [0.07, 1.47, 2.0], 0.03, J.neck, D, false);
  tube([-0.07, 1.27, 1.6], [-0.07, 1.47, 2.0], 0.03, J.neck, D, false);

  // skull: tube loops (side loops + top and front rings)
  const ring = (z: number, rx: number, ry: number, cy: number, bone: any, col = Y, r = 0.03) => {
    const pts: number[][] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      pts.push([Math.cos(a) * rx, cy + Math.sin(a) * ry, z]);
    }
    for (let i = 0; i < 12; i++) b.rod(pts[i], pts[(i + 1) % 12], r, col, { bone, sides: 6 });
    for (let i = 0; i < 12; i += 3) sleeve(pts[i], bone, r * 1.5);
  };
  ring(1.98, 0.3, 0.26, 1.58, J.head);
  ring(2.2, 0.22, 0.19, 1.56, J.head, Y, 0.028);
  // longitudinal skull rails
  for (const [x, y] of [[0.3, 1.58], [-0.3, 1.58], [0, 1.84], [0.22, 1.37], [-0.22, 1.37], [0, 1.75]] as number[][]) {
    const x2 = x * 0.73, y2 = y === 1.84 ? 1.75 : y - 0.02;
    tube([x, y, 1.98], [x2, y2, 2.2], 0.025, J.head, D, false);
  }
  tube([0, 1.84, 1.98], [0, 1.88, 1.7], 0.03, J.head, D);
  b.part(sph(0.17, 10, 8), Y, { bone: J.head, at: [0, 1.6, 2.02] });

  // eyes on stalks
  for (const s of [1, -1]) {
    const base = [s * 0.2, 1.8, 2.05], eye = [s * 0.28, 1.88, 2.15];
    tube(base, eye, 0.02, J.head, S, false);
    sleeve(base, J.head, 0.03);
    b.part(sph(0.115, 12, 8), P.eyeWhite, { bone: J.head, at: [eye[0], eye[1], eye[2]] });
    b.part(sph(0.06, 8, 6), P.pupil, { bone: J.head, at: [s * 0.3, 1.89, 2.25] });
    b.part(sph(0.018, 6, 4), P.eyeWhite, { bone: J.head, at: [s * 0.32, 1.92, 2.3] });
  }

  // upper jaw frame
  const uj = [[0.2, 1.42, 2.2], [-0.2, 1.42, 2.2], [0.14, 1.42, 2.42], [-0.14, 1.42, 2.42]];
  tube(uj[0], uj[2], 0.025, J.head, Y);
  tube(uj[1], uj[3], 0.025, J.head, Y);
  tube(uj[2], uj[3], 0.025, J.head, Y);
  tube([0, 1.44, 2.2], [0, 1.44, 2.42], 0.02, J.head, D, false);
  // upper teeth
  for (let i = 0; i < 5; i++) {
    const x = -0.12 + i * 0.06;
    b.part(new THREE.ConeGeometry(0.018, 0.07, 5), W, { bone: J.head, at: [x, 1.38, 2.4], rotation: [180, 0, 0] });
  }

  // lower jaw frame
  const lj = [[0.18, 1.3, 2.18], [-0.18, 1.3, 2.18], [0.12, 1.3, 2.38], [-0.12, 1.3, 2.38]];
  b.part(sph(0.03, 6, 4), S, { bone: J.jaw, at: [0.2, 1.33, 2.2] });
  b.part(sph(0.03, 6, 4), S, { bone: J.jaw, at: [-0.2, 1.33, 2.2] });
  tube(lj[0], lj[2], 0.025, J.jaw, Y);
  tube(lj[1], lj[3], 0.025, J.jaw, Y);
  tube(lj[2], lj[3], 0.025, J.jaw, Y);
  tube(lj[0], lj[1], 0.022, J.jaw, D);
  for (let i = 0; i < 4; i++) {
    const x = -0.09 + i * 0.06;
    b.part(new THREE.ConeGeometry(0.016, 0.06, 5), W, { bone: J.jaw, at: [x, 1.35, 2.36] });
  }

  // antennae with red ribbon tips
  const rr = rng(5);
  for (const s of [1, -1]) {
    const a = [s * 0.1, 1.84, 2.0], t = [s * 0.2, 1.88, 2.38];
    tube(a, t, 0.015, J.head, Y, false);
    sleeve(a, J.head, 0.028);
    b.part(sph(0.025, 6, 4), P.ribbon, { bone: J.head, at: t });
    for (let k = 0; k < 2; k++) {
      const e = [s * (0.22 + rr() * 0.04), 1.8 - k * 0.04, 2.5 + rr() * 0.05];
      b.rod(t, e, 0.008, P.ribbon, { bone: J.head, sides: 4 });
    }
  }
}
```