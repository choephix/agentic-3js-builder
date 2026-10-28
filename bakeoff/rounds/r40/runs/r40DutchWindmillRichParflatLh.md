<!-- call: plan -->

```json
{
  "name": "Dutch Windmill (Animal Crossing)",
  "description": "A chubby, cozy Animal Crossing style Dutch windmill with a stone base, tapered thatched-brick tower, rotating cap and four lattice sails, on its own small footprint.",
  "builderName": "dutchWindmill",
  "size": [4.4, 5.2, 3.2],
  "layout": "Squat, rounded octagonal tower tapering upward, centred on x=0, facing +Z. A wide stone plinth sits on the floor, then a cream plastered brick body with a red-brown trim band, a front door with a little step, round-top windows and a balcony (gallery) ring partway up. A domed red-roofed cap sits on top with a small tail pole and ladder at the back, and a hub on the front (+Z) of the cap carries four big wooden lattice sails in an X shape, tilted slightly toward the viewer. Everything is chunky and soft with bevelled, faceted primitives; flat pastel colours, warm tops and cooler undersides, little props like flower boxes, a lantern and a sack of flour at the door.",
  "palette": {
    "stone": "#a9a39a",
    "stoneDark": "#7f7a73",
    "wall": "#f3e6cc",
    "wallShade": "#d9c7a4",
    "brick": "#c4694a",
    "trimWood": "#8a5a3a",
    "darkWood": "#5e3b25",
    "roof": "#d4513f",
    "roofLight": "#ee7a62",
    "sailCloth": "#fbf3e0",
    "sailFrame": "#a8744a",
    "window": "#8fd3e8",
    "windowFrame": "#fff7e6",
    "door": "#4f9a8a",
    "doorKnob": "#f2c94c",
    "leaf": "#6fbf5a",
    "flowerPink": "#f58fb0",
    "flowerYellow": "#ffd84a",
    "lantern": "#ffcf6a",
    "sack": "#e8d3a0",
    "grass": "#8fd06a",
    "iron": "#3d3a40"
  },
  "mounts": {
    "plinthTop": [0, 0.45, 0],
    "towerBase": [0, 0.45, 0],
    "galleryDeck": [0, 2.0, 0],
    "towerTop": [0, 3.9, 0],
    "capCentre": [0, 3.9, 0],
    "hubFront": [0, 4.35, 1.0],
    "doorFront": [0, 0.45, 1.45],
    "tailPoleBack": [0, 4.1, -1.2]
  },
  "joints": [
    { "name": "base", "at": [0, 0, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "cap", "parent": "base", "at": [0, 3.9, 0], "dir": [0, 1, 0], "role": "hinge", "group": "cap" },
    { "name": "sails", "parent": "cap", "at": [0, 4.35, 1.0], "dir": [0, 0, 1], "role": "hinge", "group": "sails" }
  ],
  "parts": [
    {
      "id": "baseAndGround",
      "builds": "Stone plinth (octagonal, two stacked tiers in stone/stoneDark with stone block seams as small parts), small grass tuft ring hugging the plinth, flagstone path stub to the door, and the door step. Keep simple, sized to the footprint.",
      "box": [[-1.9, 0, -1.9], [1.9, 0.45, 2.4]],
      "attaches": "Top at plinthTop; tower stands on towerBase; path ends at doorFront.",
      "joints": ["base"],
      "floor": true,
      "budget": 130
    },
    {
      "id": "towerBody",
      "builds": "Tapered octagonal tower from radius ~1.55 at the base to ~1.05 at the top in wall cream, with a brick-coloured lower skirt band, trimWood bands at bottom, mid and top, vertical corner ribs in wallShade, small brick patches, and a rounded top ring. Includes the gallery balcony ring at galleryDeck (wood deck, posts, rail).",
      "box": [[-1.6, 0.45, -1.6], [1.6, 3.9, 1.6]],
      "attaches": "Stands on towerBase; cap sits on towerTop; door and windows are mounted on its surface by the detail part.",
      "joints": ["base"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "doorAndWindows",
      "builds": "Front door in teal with a round top, frame, planks, golden knob and hinges, a lantern beside it glowing, a sack of flour and barrel by the door. Round-top windows (windowFrame surround, window glass, shutters in teal, cross bars) at three heights around the tower, flower boxes with pink and yellow flowers and leaves under the front windows, and a small loft hatch.",
      "box": [[-1.7, 0.45, -1.7], [1.7, 3.5, 1.9]],
      "attaches": "Seated on the tower surface at doorFront and around the tower; rides base joint.",
      "joints": ["base"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "capAndRoof",
      "builds": "Domed cap on capCentre: a roof lathe in roof red with lighter shingle rows as small parts, a trim ring at the eaves, a tiny finial with a golden ball on top, a small round gable window, the front axle housing and hub boss at hubFront, and at the back a tail pole with a ladder (wood rails and rungs) running down toward the ground.",
      "box": [[-1.3, 3.9, -2.4], [1.3, 5.2, 1.3]],
      "attaches": "Sits on towerTop; hub at hubFront connects to the sails joint; tail pole ends at tailPoleBack.",
      "joints": ["cap"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "sails",
      "builds": "Four big lattice sails of sailFrame wood crossing at a spinning hub at hubFront: each has a long main spar, a thinner outer rail, many cross-bars and cream sailCloth panels on the leading half in alternating neat patches, a rounded tip cap, and small colour pennant ribbons on the tips (roof and flowerYellow). A hub cap in darkWood with golden nail studs. Arms extend ~2.2 m from the hub, tilted slightly outward, one pair vertical and one horizontal in rest pose (plus-shape rotated 45 degrees to an X), all rigid on the sails joint.",
      "box": [[-2.2, 2.2, 0.9], [2.2, 6.5, 1.4]],
      "attaches": "Centred on mount hubFront, riding the sails joint.",
      "joints": ["sails"],
      "floor": false,
      "budget": 190
    }
  ]
}
```

<!-- call: baseAndGround -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildBaseAndGround({ b, J, P, M }: Ctx) {
  const R = rng(1207);
  const D2R = Math.PI / 180;

  // A few extra colours of my own (6 max)
  const STONE_LIGHT = "#c4beb4";
  const SEAM = "#66615b";
  const DIRT = "#8a7a5a";
  const FLAG_A = "#bdb5a6";
  const FLAG_B = "#a69e90";
  const GRASS_DARK = "#58a34a";

  const doorZ = M.doorFront[2]; // 1.45: where the tower wall meets the door

  // Placement helper: yaw about Y (0 = facing +Z), optional tilt toward the facing direction
  const put = (
    geo: THREE.BufferGeometry,
    color: string,
    x: number,
    y: number,
    z: number,
    yawDeg = 0,
    tiltDeg = 0,
  ) =>
    b.part(geo, color, {
      bone: J.base,
      at: [x, y, z],
      quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(tiltDeg * D2R, yawDeg * D2R, 0, "YXZ")),
      flat: true,
    });

  const oct = (rTop: number, rBot: number, h: number) => new THREE.CylinderGeometry(rTop, rBot, h, 8, 1);

  // Octagon distance from the centre to the outline at azimuth a (deg, 0 = +Z), faces centred on multiples of 45
  const octDist = (apothem: number, a: number) => {
    const rel = ((((a + 22.5) % 45) + 45) % 45) - 22.5;
    return apothem / Math.cos(rel * D2R);
  };

  // Point on a face of the octagon at azimuth a, shifted along the face tangent
  const onFace = (apothem: number, a: number, off: number, y: number): [number, number, number] => {
    const s = Math.sin(a * D2R);
    const c = Math.cos(a * D2R);
    return [s * apothem + c * off, y, c * apothem - s * off];
  };

  // ---------- dirt skirt on the floor ----------
  put(oct(2.02, 2.04, 0.03), DIRT, 0, 0.015, 0, 22.5);

  // ---------- plinth tiers ----------
  const LOW_R = 2.0; // circumradius, apothem ~1.85
  const LOW_APO = LOW_R * Math.cos(22.5 * D2R);
  const UP_R = 1.8; // apothem ~1.66
  const UP_APO = UP_R * Math.cos(22.5 * D2R);

  put(oct(LOW_R * 0.98, LOW_R, 0.25), P.stoneDark, 0, 0.125 + 0.03, 0, 22.5); // lower tier 0.03..0.28
  // bring lower tier top to ~0.25 by sinking a touch into the dirt
  put(oct(UP_R * 0.985, UP_R, 0.17), P.stone, 0, 0.25 + 0.085, 0, 22.5); // upper tier 0.25..0.42
  put(oct(UP_R * 1.01, UP_R * 1.03, 0.04), STONE_LIGHT, 0, 0.43, 0, 22.5); // capstone ring up to 0.45

  // horizontal mortar rings
  put(oct(LOW_R * 0.995, LOW_R * 1.005, 0.014), SEAM, 0, 0.16, 0, 22.5);

  // ---------- stone block seams ----------
  const vSeam = (apo: number, a: number, off: number, y: number, h: number, color: string) => {
    const p = onFace(apo + 0.005, a, off, y);
    put(new THREE.BoxGeometry(0.03, h, 0.03), color, p[0], p[1], p[2], a);
  };
  for (let i = 0; i < 8; i++) {
    const a = i * 45;
    // lower tier: bottom course seam at 0, upper course at +-0.38
    vSeam(LOW_APO * 0.99, a, 0, 0.095, 0.12, SEAM);
    vSeam(LOW_APO * 0.99, a, -0.4, 0.21, 0.1, SEAM);
    vSeam(LOW_APO * 0.99, a, 0.4, 0.21, 0.1, SEAM);
    // upper tier: one course, two seams
    vSeam(UP_APO * 0.995, a, -0.33, 0.335, 0.15, SEAM);
    vSeam(UP_APO * 0.995, a, 0.33, 0.335, 0.15, SEAM);
  }

  // ---------- mossy bits on the ledge ----------
  const mossAngles = [-70, 40, 95, 150, 215, -120];
  for (const a of mossAngles) {
    const d = octDist(UP_APO + 0.09, a);
    const s = Math.sin(a * D2R);
    const c = Math.cos(a * D2R);
    const g = new THREE.SphereGeometry(0.075, 6, 4);
    g.scale(1.3, 0.35, 1);
    put(g, P.leaf, s * d, 0.265, c * d, a);
  }

  // ---------- door steps ----------
  // landing (flush with plinth top, juts out from the upper tier)
  put(new THREE.BoxGeometry(1.3, 0.06, 0.45), STONE_LIGHT, 0, 0.42, doorZ + 0.22);
  put(new THREE.BoxGeometry(1.3, 0.2, 0.4), P.stone, 0, 0.32, doorZ + 0.22);
  // middle step
  put(new THREE.BoxGeometry(1.1, 0.045, 0.3), STONE_LIGHT, 0, 0.283, 1.9);
  put(new THREE.BoxGeometry(1.1, 0.28, 0.28), P.stone, 0, 0.14 + 0.0, 1.92);
  // bottom step
  put(new THREE.BoxGeometry(0.95, 0.04, 0.28), STONE_LIGHT, 0, 0.14, 2.08);
  put(new THREE.BoxGeometry(0.95, 0.14, 0.26), P.stoneDark, 0, 0.07, 2.08);

  // ---------- flagstone path stub ----------
  const flags: [number, number, number, number][] = [
    [0.0, 2.27, 0.19, 0],
    [-0.38, 2.28, 0.14, 25],
    [0.4, 2.29, 0.13, -15],
    [0.75, 2.23, 0.15, 40],
    [-0.72, 2.22, 0.14, 10],
    [1.08, 2.14, 0.13, 5],
    [-1.05, 2.1, 0.12, 30],
  ];
  flags.forEach(([x, z, r, yaw], i) => {
    const g = new THREE.CylinderGeometry(r * 0.94, r, 0.05, 7, 1);
    g.scale(1, 1, 0.78);
    put(g, i % 2 ? FLAG_B : FLAG_A, x, 0.025, z, yaw);
  });

  // ---------- grass tuft ring hugging the plinth ----------
  const N = 22;
  const flowerSlots = new Set([2, 6, 10, 14, 18]);
  for (let i = 0; i < N; i++) {
    const a = (i + 0.5) * (360 / N) + (R() - 0.5) * 6;
    const wrapped = ((a + 180) % 360) - 180;
    if (Math.abs(wrapped) < 30) continue; // keep the front clear for the path
    const d = octDist(LOW_APO, a) + 0.03;
    const s = Math.sin(a * D2R);
    const c = Math.cos(a * D2R);
    const tx = c;
    const tz = -s;
    // main blade
    const h1 = 0.2 + R() * 0.08;
    put(new THREE.ConeGeometry(0.045, h1, 5), i % 2 ? P.leaf : P.grass, s * d, h1 / 2 * 0.95 + 0.01, c * d, a, 18);
    // side blade
    const h2 = 0.13 + R() * 0.06;
    put(
      new THREE.ConeGeometry(0.038, h2, 5),
      GRASS_DARK,
      s * (d + 0.02) + tx * 0.06,
      h2 / 2 * 0.95 + 0.01,
      c * (d + 0.02) + tz * 0.06,
      a + 20,
      28,
    );
    if (flowerSlots.has(i)) {
      const fd = d + 0.09;
      const fy = 0.2;
      const pink = i % 4 === 2;
      put(new THREE.SphereGeometry(0.045, 6, 4), pink ? P.flowerPink : P.flowerYellow, s * fd, fy, c * fd, a);
      put(new THREE.SphereGeometry(0.02, 5, 4), pink ? P.flowerYellow : "#ffffff", s * (fd + 0.03), fy + 0.005, c * (fd + 0.03), a);
    }
  }

  // ---------- a few pebbles ----------
  const pebbles: [number, number, number, string][] = [
    [1.35, 2.0, 0.07, P.stone],
    [-1.4, 1.95, 0.06, P.stoneDark],
    [1.55, -1.45, 0.06, P.stone],
  ];
  for (const [x, z, r, col] of pebbles) {
    const g = new THREE.SphereGeometry(r, 5, 4);
    g.scale(1.2, 0.6, 1);
    put(g, col, x, r * 0.5, z, R() * 90);
  }
}
```

<!-- call: sails -->

```ts
import * as THREE from "three";

export function buildSails({ b, J, P, M }: Ctx) {
  const bone = J.sails;
  const HUB = new THREE.Vector3(M.hubFront[0], M.hubFront[1], M.hubFront[2]);
  const TILT = (5 * Math.PI) / 180; // arm tips lean toward the viewer
  const LIGHT_WOOD = "#c99565";
  const TIP_WOOD = "#7a4f31";
  const Z = new THREE.Vector3(0, 0, 1);
  const X = new THREE.Vector3(1, 0, 0);

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const ball = (r: number, ws = 8, hs = 6) => new THREE.SphereGeometry(r, ws, hs);

  // ---- one arm, built in its own frame: x across, y along the arm, z depth ----
  function buildArm(theta: number, ribbonA: string, ribbonB: string) {
    const qz = new THREE.Quaternion().setFromAxisAngle(Z, theta - Math.PI / 2);
    const qt = new THREE.Quaternion().setFromAxisAngle(X, TILT);
    const q = qz.clone().multiply(qt);
    const pos = (u: number, v: number, w: number) =>
      new THREE.Vector3(v, u, w + 0.1).applyQuaternion(q).add(HUB);
    const put = (geo: THREE.BufferGeometry, color: string, u: number, v: number, w: number, flat = false) =>
      b.part(geo, color, { bone, at: pos(u, v, w), quat: q, flat });

    // main spar (the stock) running through the hub
    put(box(0.1, 2.15, 0.1), P.sailFrame, 1.075, 0, 0);
    // lighter top edge strip on the spar
    put(box(0.04, 2.0, 0.03), LIGHT_WOOD, 1.15, 0, 0.055);
    // thinner outer rail on the leading side
    put(box(0.06, 1.65, 0.06), P.sailFrame, 1.35, 0.62, 0);
    // cross-bars of the lattice (first and last are the frame ends)
    for (let i = 0; i <= 8; i++) {
      const end = i === 0 || i === 8;
      put(box(0.6, end ? 0.07 : 0.04, 0.055), end ? P.sailFrame : LIGHT_WOOD, 0.55 + 0.2 * i, 0.35, 0);
    }
    // middle longitudinal lattice bar
    put(box(0.04, 1.6, 0.05), LIGHT_WOOD, 1.35, 0.335, 0);
    // neat alternating cloth patches
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 2; j++) {
        if ((i + j) % 2 !== 0) continue;
        put(box(0.22, 0.17, 0.02), P.sailCloth, 0.65 + 0.2 * i, j === 0 ? 0.1925 : 0.4775, -0.005);
      }
    }
    // trailing wind-boards
    put(box(0.04, 1.1, 0.05), P.sailFrame, 1.5, -0.34, 0);
    for (let i = 0; i < 5; i++) put(box(0.27, 0.14, 0.03), LIGHT_WOOD, 0.98 + 0.22 * i, -0.19, -0.01);
    // gold nails on the spar
    for (const u of [0.75, 1.2, 1.65, 2.05]) put(ball(0.026, 6, 4), P.doorKnob, u, 0, 0.055, true);
    // rounded tip cap and corner knobs
    b.part(ball(0.1, 8, 6), TIP_WOOD, { bone, at: pos(2.17, 0, 0), quat: q, scale: [1, 1.15, 0.9], flat: true });
    put(ball(0.045, 6, 4), TIP_WOOD, 2.15, 0.65, 0, true);
    put(ball(0.045, 6, 4), TIP_WOOD, 0.55, 0.65, 0, true);
    // iron strap near the hub
    put(box(0.14, 0.26, 0.12), P.iron, 0.46, 0, 0);

    // pennant pole + two swallow-tail ribbons
    put(box(0.025, 0.36, 0.025), P.darkWood, 2.37, 0, 0);
    put(ball(0.03, 6, 4), P.doorKnob, 2.56, 0, 0, true);
    const xDir = new THREE.Vector3(-1, 0, 0).applyQuaternion(q);
    const yDir = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    const ribbon = (len: number, half: number, u: number, color: string) =>
      b.extrude(
        [
          [0, -half * 0.75],
          [len, -half],
          [len * 0.78, 0],
          [len, half],
          [0, half * 0.75],
        ],
        { at: pos(u, -0.02, 0), x: [xDir.x, xDir.y, xDir.z], y: [yDir.x, yDir.y, yDir.z], thickness: 0.014, color, bone },
      );
    ribbon(0.55, 0.075, 2.34, ribbonA);
    ribbon(0.4, 0.06, 2.47, ribbonB);
  }

  for (let k = 0; k < 4; k++) {
    const theta = Math.PI / 4 + (k * Math.PI) / 2;
    buildArm(theta, k % 2 === 0 ? P.roof : P.flowerYellow, k % 2 === 0 ? P.flowerYellow : P.roof);
  }

  // ---- hub ----
  const at = (z: number) => [HUB.x, HUB.y, HUB.z + z] as [number, number, number];
  const cyl = (r0: number, r1: number, len: number, seg: number, color: string, z: number) =>
    b.part(new THREE.CylinderGeometry(r0, r1, len, seg), color, { bone, at: at(z), dir: [0, 0, 1], flat: true });

  cyl(0.44, 0.44, 0.06, 8, P.sailFrame, 0.06); // back plate where the stocks cross
  cyl(0.33, 0.36, 0.2, 10, P.darkWood, 0.22); // hub boss
  cyl(0.375, 0.375, 0.04, 10, P.iron, 0.14); // iron bands
  cyl(0.345, 0.345, 0.04, 10, P.iron, 0.3);
  cyl(0.3, 0.3, 0.03, 10, TIP_WOOD, 0.335); // cap face

  // golden nail studs around the cap face
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    b.part(ball(0.035, 6, 4), P.doorKnob, {
      bone,
      at: [HUB.x + Math.cos(a) * 0.23, HUB.y + Math.sin(a) * 0.23, HUB.z + 0.35],
      flat: true,
    });
  }
  // domed nose with gold ball
  b.part(ball(0.15, 8, 6), P.darkWood, { bone, at: at(0.34), scale: [1, 1, 0.7], flat: true });
  b.part(ball(0.06, 8, 6), P.doorKnob, { bone, at: at(0.43), flat: true });

  // sturdy square cross-block at the centre, seen between the arms
  for (let k = 0; k < 2; k++) {
    b.part(box(0.2, 0.9, 0.08), P.sailFrame, {
      bone,
      at: at(0.04),
      rotation: [0, 0, 45 + 90 * k],
    });
  }
}
```

<!-- call: capAndRoof -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildCapAndRoof({ b, J, P, M }: { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> }) {
  const bone = J.cap;
  const R = rng(41);
  const GOLD = P.doorKnob;
  const ROOF_MID = "#e8664f";
  const IRON = P.iron;

  const put = (geo: THREE.BufferGeometry, color: string, at: number[], o: any = {}) =>
    b.part(geo, color, { bone, at, ...o });

  const unit = (a: number[], c: number[]) => {
    const v = new THREE.Vector3(a[0] - c[0], a[1] - c[1], a[2] - c[2]).normalize();
    return [v.x, v.y, v.z];
  };

  // ---- Roof profile (radius, height above the roof base) ----
  const ROOF_Y = 4.0;
  const prof: [number, number][] = [
    [1.3, 0], [1.3, 0.06], [1.2, 0.14], [1.02, 0.26], [0.88, 0.36],
    [0.64, 0.58], [0.4, 0.76], [0.17, 0.9], [0, 0.95],
  ];
  const surf = (yr: number) => {
    for (let i = 0; i < prof.length - 1; i++) {
      const [r0, y0] = prof[i];
      const [r1, y1] = prof[i + 1];
      if (yr >= y0 && yr <= y1) {
        const t = (yr - y0) / (y1 - y0 || 1);
        const dr = r1 - r0, dy = y1 - y0;
        const l = Math.hypot(dr, dy);
        return { r: r0 + dr * t, nr: dy / l, ny: -dr / l };
      }
    }
    return { r: 0, nr: 0, ny: 1 };
  };
  // point + normal on the dome at height yr, azimuth a (0 = +Z, pi/2 = +X)
  const dome = (yr: number, a: number, lift = 0) => {
    const s = surf(yr);
    const rr = s.r * 0.985 + s.nr * lift;
    const pt = [Math.sin(a) * rr, ROOF_Y + yr + s.ny * lift, Math.cos(a) * rr];
    const n = [Math.sin(a) * s.nr, s.ny, Math.cos(a) * s.nr];
    return { pt, n };
  };

  // ---- Eave collar sitting on the tower top ----
  b.lathe(
    [[0, 0], [1.2, 0], [1.2, 0.05], [1.32, 0.07], [1.32, 0.13], [0, 0.13]],
    { at: [0, 3.9, 0], bone, segments: 16, color: P.trimWood },
  );
  // dark blocks around the collar
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    put(new THREE.BoxGeometry(0.14, 0.09, 0.05), P.darkWood, [Math.sin(a) * 1.325, 3.97, Math.cos(a) * 1.325], {
      dir: [Math.sin(a), 0, Math.cos(a)], axis: "z", up: [0, 1, 0],
    });
  }

  // ---- Roof dome ----
  b.lathe(prof.map(([r, y]) => [r, y]), {
    at: [0, ROOF_Y, 0], bone, segments: 16, color: P.roof,
  });
  // bright eave bead
  put(new THREE.TorusGeometry(1.29, 0.04, 5, 16), P.roofLight, [0, ROOF_Y + 0.03, 0], { dir: [0, 1, 0], axis: "z" });

  // ---- Shingle rows ----
  const rows = [0.1, 0.24, 0.38, 0.52, 0.66, 0.8];
  rows.forEach((yr, ri) => {
    const s = surf(yr);
    const count = Math.max(4, Math.round((Math.PI * 2 * s.r) / 0.32));
    for (let k = 0; k < count; k++) {
      const a = ((k + 0.5 * (ri % 2)) / count) * Math.PI * 2 + (R() - 0.5) * 0.03;
      const { pt, n } = dome(yr, a, 0.012);
      if (yr >= 0.24 && pt[2] > 0 && Math.abs(pt[0]) < 0.4) continue; // bonnet / window room
      const col = (k + ri) % 2 === 0 ? P.roofLight : ROOF_MID;
      put(new THREE.BoxGeometry(0.3, 0.04, 0.17), col, pt, { dir: n });
    }
  });

  // ---- Round gable window on the front slope ----
  const wy = 0.74;
  {
    const { pt, n } = dome(wy, 0, 0.0);
    const at = (l: number) => [pt[0] + n[0] * l, pt[1] + n[1] * l, pt[2] + n[2] * l];
    const o = { dir: n, axis: "z", up: [0, 1, 0] };
    put(new THREE.TorusGeometry(0.115, 0.026, 5, 12), P.windowFrame, at(0.03), o);
    put(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 12), P.window, at(0.02), { dir: n });
    put(new THREE.BoxGeometry(0.22, 0.02, 0.02), P.windowFrame, at(0.045), o);
    put(new THREE.BoxGeometry(0.02, 0.22, 0.02), P.windowFrame, at(0.045), o);
    put(new THREE.TorusGeometry(0.16, 0.03, 5, 12, Math.PI), P.roofLight, at(0.03), o);
    put(new THREE.BoxGeometry(0.28, 0.04, 0.07), P.windowFrame, [pt[0], pt[1] - 0.135, pt[2] + 0.04], o);
  }
  // little round vent at the back
  {
    const { pt, n } = dome(0.5, Math.PI, 0.0);
    const at = (l: number) => [pt[0] + n[0] * l, pt[1] + n[1] * l, pt[2] + n[2] * l];
    const o = { dir: n, axis: "z", up: [0, 1, 0] };
    put(new THREE.TorusGeometry(0.075, 0.02, 5, 10), P.windowFrame, at(0.03), o);
    put(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 10), P.darkWood, at(0.02), { dir: n });
    put(new THREE.BoxGeometry(0.13, 0.016, 0.016), P.windowFrame, at(0.04), o);
  }

  // ---- Finial ----
  put(new THREE.CylinderGeometry(0.03, 0.08, 0.06, 8), P.trimWood, [0, 4.93, 0]);
  b.rod([0, 4.93, 0], [0, 5.05, 0], 0.025, P.darkWood, { bone, sides: 6 });
  put(new THREE.SphereGeometry(0.075, 8, 6), GOLD, [0, 5.09, 0]);
  put(new THREE.ConeGeometry(0.03, 0.07, 6), GOLD, [0, 5.165, 0]);

  // ---- Axle housing (bonnet) and hub boss at hubFront ----
  const hx = M.hubFront[0], hy = M.hubFront[1], hz = M.hubFront[2];
  put(new THREE.BoxGeometry(0.56, 0.42, 0.38), P.trimWood, [hx, hy + 0.01, 0.78]);
  put(new THREE.BoxGeometry(0.64, 0.06, 0.48), P.roofLight, [hx, hy + 0.25, 0.8]);
  put(new THREE.BoxGeometry(0.6, 0.05, 0.4), P.roof, [hx, hy + 0.29, 0.78]);
  for (const z of [0.66, 0.9]) put(new THREE.BoxGeometry(0.6, 0.46, 0.04), P.darkWood, [hx, hy + 0.01, z]);
  for (const s of [1, -1]) {
    put(new THREE.BoxGeometry(0.03, 0.34, 0.3), P.darkWood, [s * 0.29, hy + 0.01, 0.78]);
  }
  put(new THREE.CylinderGeometry(0.2, 0.22, 0.1, 10), P.darkWood, [hx, hy, hz], { dir: [0, 0, 1] });
  put(new THREE.CylinderGeometry(0.15, 0.17, 0.04, 10), P.trimWood, [hx, hy, hz + 0.06], { dir: [0, 0, 1] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    put(new THREE.SphereGeometry(0.022, 5, 4), GOLD, [hx + Math.cos(a) * 0.12, hy + Math.sin(a) * 0.12, hz + 0.085]);
  }
  put(new THREE.CylinderGeometry(0.07, 0.07, 0.28, 8), IRON, [hx, hy, hz + 0.1], { dir: [0, 0, 1] });
  put(new THREE.SphereGeometry(0.06, 6, 5), GOLD, [hx, hy, hz + 0.24]);

  // ---- Tail pole and ladder ----
  const pa = [0, 4.17, -0.85], pb = [0, 3.98, -2.3];
  const poleDir = unit(pb, pa);
  const poleAt = (z: number) => {
    const t = (pa[2] - z) / (pa[2] - pb[2]);
    return [0, pa[1] + (pb[1] - pa[1]) * t, z];
  };
  b.rod(pa, pb, 0.07, P.trimWood, { bone, sides: 6 });
  for (const z of [-1.25, -2.1]) {
    put(new THREE.CylinderGeometry(0.095, 0.095, 0.06, 8), IRON, poleAt(z), { dir: poleDir });
  }
  // end handle bar
  b.rod([-0.4, pb[1], -2.32], [0.4, pb[1], -2.32], 0.035, P.darkWood, { bone, sides: 6 });
  for (const s of [1, -1]) put(new THREE.SphereGeometry(0.05, 6, 5), P.darkWood, [s * 0.42, pb[1], -2.32]);
  put(new THREE.TorusGeometry(0.06, 0.012, 5, 10), IRON, [0, pb[1] + 0.02, -2.34], { dir: [0, 1, 0], axis: "z" });
  // ladder alongside the pole
  const z0 = -1.4, z1 = -2.22;
  for (const s of [1, -1]) {
    const a = poleAt(z0), c = poleAt(z1);
    b.rod([s * 0.22, a[1], z0], [s * 0.22, c[1], z1], 0.028, P.trimWood, { bone, sides: 6 });
    for (const z of [z0, z1]) {
      const p = poleAt(z);
      b.rod([0, p[1], z], [s * 0.22, p[1], z], 0.022, P.darkWood, { bone, sides: 5 });
    }
  }
  const rungs = 6;
  for (let i = 0; i < rungs; i++) {
    const z = z0 + ((z1 - z0) * (i + 0.5)) / rungs;
    const p = poleAt(z);
    b.rod([-0.22, p[1], z], [0.22, p[1], z], 0.02, P.sailFrame, { bone, sides: 5 });
  }
}
```

<!-- call: towerBody -->

```ts
import * as THREE from "three";
import { aim, rng } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildTowerBody({ b, J, P, M }: Ctx) {
  const bone = J.base;
  const rand = rng(11);
  const PI = Math.PI;
  const DEG = PI / 180;

  // own colours (4 extra)
  const BRICK_DARK = "#a85a40";
  const BRICK_LIGHT = "#da8461";
  const PLANK = "#b9855a";
  const CREAM_LIGHT = "#fff3dc";

  // ---- tower profile -------------------------------------------------------------
  const Y0 = 0.45;
  const Y1 = 3.9;
  const R = (y: number) => 1.55 - (0.5 * (y - Y0)) / (Y1 - Y0); // circumradius
  const COS = Math.cos(PI / 8);
  const A = (y: number) => R(y) * COS; // apothem (flat face distance)
  const TILT = Math.atan((0.5 / (Y1 - Y0)) * COS); // face lean

  // flat octagonal frustum, flat face toward +Z
  const oct = (y0: number, y1: number, grow: number, color: string, name: string) => {
    const g = new THREE.CylinderGeometry(R(y1) + grow, R(y0) + grow, y1 - y0, 8, 1);
    g.rotateY(PI / 8);
    return b.part(g, color, { bone, at: [0, (y0 + y1) / 2, 0], flat: true, name });
  };

  // ---- merged small details -------------------------------------------------------
  const acc = new Map<string, THREE.BufferGeometry[]>();
  const add = (color: string, geo: THREE.BufferGeometry, pos: THREE.Vector3, quat?: THREE.Quaternion) => {
    geo.applyMatrix4(new THREE.Matrix4().compose(pos, quat ?? new THREE.Quaternion(), new THREE.Vector3(1, 1, 1)));
    if (!acc.has(color)) acc.set(color, []);
    acc.get(color)!.push(geo);
  };
  const flush = () => {
    let i = 0;
    for (const [color, list] of acc) {
      const merged = mergeGeometries(list);
      if (merged) b.part(merged, color, { bone, at: [0, 0, 0], flat: true, name: `towerBodyDetail${i++}` });
    }
  };

  // box seated on a tower face k (0 = front), height y, offset u along the face
  const faceBox = (
    color: string, k: number, y: number, u: number,
    w: number, h: number, d: number, surfOff = 0,
  ) => {
    const psi = (k * PI) / 4;
    const nh = [Math.sin(psi), Math.cos(psi)];
    const tg = [Math.cos(psi), -Math.sin(psi)];
    const n = new THREE.Vector3(Math.sin(psi) * Math.cos(TILT), Math.sin(TILT), Math.cos(psi) * Math.cos(TILT));
    const a = A(y);
    const pos = new THREE.Vector3(nh[0] * a + tg[0] * u, y, nh[1] * a + tg[1] * u).addScaledVector(
      n,
      surfOff + d / 2 - 0.006,
    );
    add(color, new THREE.BoxGeometry(w, h, d), pos, aim(n, [0, 1, 0], "z"));
  };

  const cyl = (color: string, p0: THREE.Vector3, p1: THREE.Vector3, r: number, sides: number) => {
    const dir = p1.clone().sub(p0);
    const g = new THREE.CylinderGeometry(r, r, dir.length(), sides, 1);
    add(color, g, p0.clone().add(p1).multiplyScalar(0.5), aim(dir));
  };

  const ball = (color: string, p: THREE.Vector3, r: number) =>
    add(color, new THREE.SphereGeometry(r, 6, 4), p);

  // ---- main body -----------------------------------------------------------------
  oct(Y0, Y1, 0, P.wall, "towerBodyWall");
  oct(Y0, 1.06, 0.015, BRICK_DARK, "towerBodySkirt");
  oct(1.17, 1.6, 0.012, P.wallShade, "towerBodyDirt");

  // trim bands: bottom, skirt top (mid), top
  oct(Y0, 0.6, 0.05, P.trimWood, "towerBodyBandBottom");
  oct(1.05, 1.17, 0.045, P.trimWood, "towerBodyBandMid");
  oct(3.64, 3.8, 0.045, P.trimWood, "towerBodyBandTop");
  // thin cream highlight lip over the top band
  oct(3.8, 3.84, 0.05, CREAM_LIGHT, "towerBodyLip");

  // rounded top ring
  {
    const torusR = (A(3.82) + 0.05) / COS;
    const g = new THREE.TorusGeometry(torusR, 0.09, 6, 8);
    g.rotateX(PI / 2);
    g.rotateY(PI / 8);
    b.part(g, P.trimWood, { bone, at: [0, 3.82, 0], flat: true, name: "towerBodyTopRing" });
    const g2 = new THREE.CylinderGeometry(R(3.9) - 0.03, R(3.9) - 0.03, 0.06, 8);
    g2.rotateY(PI / 8);
    b.part(g2, P.darkWood, { bone, at: [0, 3.87, 0], flat: true, name: "towerBodyTopPlate" });
  }

  // ---- corner ribs ---------------------------------------------------------------
  for (let k = 0; k < 8; k++) {
    const phi = (k * 45 + 22.5) * DEG;
    const at = (y: number, g: number) =>
      new THREE.Vector3(Math.sin(phi) * (R(y) + g), y, Math.cos(phi) * (R(y) + g));
    b.rod(at(1.17, 0.012), at(3.64, 0.012), [0.065, 0.048], P.wallShade, {
      bone,
      sides: 6,
      caps: "flat",
      name: `towerBodyRib${k}`,
    });
    // iron studs along each rib
    for (const y of [1.45, 2.45, 3.3]) ball(P.iron, at(y, 0.055), 0.032);
  }

  // ---- skirt bricks (skip the door face) -------------------------------------------
  for (let k = 1; k < 8; k++) {
    for (let r = 0; r < 3; r++) {
      const y = 0.7 + r * 0.115 + 0.0;
      const us = r % 2 === 0 ? [-0.38, 0, 0.38] : [-0.19, 0.19];
      for (const u of us) {
        const col = rand() > 0.5 ? BRICK_LIGHT : P.brick;
        faceBox(col, k, y + 0.1 * 0, u, 0.34, 0.095, 0.04, 0.015);
      }
    }
  }
  // door-face skirt: small flanking bricks only, kept thin so the door frame stays clear
  for (const u of [-0.5, 0.5]) for (let r = 0; r < 3; r++)
    faceBox(r % 2 ? BRICK_LIGHT : P.brick, 0, 0.7 + r * 0.115, u, 0.14, 0.095, 0.012, 0.015);

  // ---- exposed brick patches on the plaster ------------------------------------------
  const patches: [number, number, number][] = [
    [1, 2.75, 0.34], [2, 1.55, -0.34], [3, 3.35, 0.34], [4, 2.55, -0.34],
    [5, 1.5, 0.34], [6, 3.15, -0.34], [7, 2.65, 0.34], [5, 3.4, -0.34], [3, 1.65, 0.34],
    [1, 1.5, -0.34], [7, 3.4, -0.34], [2, 3.0, 0.34],
  ];
  for (const [k, y, u] of patches) {
    // chipped plaster edge behind the bricks
    faceBox(P.wallShade, k, y, u, 0.44, 0.24, 0.012, 0.004);
    const rows = 3;
    for (let r = 0; r < rows; r++) {
      const cnt = r % 2 === 0 ? 3 : 2;
      for (let c = 0; c < cnt; c++) {
        if (rand() < 0.12) continue;
        const du = (c - (cnt - 1) / 2) * 0.125 + (rand() - 0.5) * 0.01;
        const dy = (r - 1) * 0.075;
        faceBox(rand() > 0.45 ? P.brick : BRICK_LIGHT, k, y + dy, u + du, 0.11, 0.062, 0.03, 0.006);
      }
    }
  }

  // ---- dentils under the top band ----------------------------------------------------
  for (let k = 0; k < 8; k++)
    for (const u of [-0.3, 0, 0.3]) faceBox(P.darkWood, k, 3.57, u, 0.12, 0.07, 0.05, 0.0);

  // ---- gallery balcony ---------------------------------------------------------------
  const deckTop = M.galleryDeck[1]; // 2.0
  {
    const deck = new THREE.CylinderGeometry(1.6, 1.6, 0.1, 8, 1);
    deck.rotateY(PI / 8);
    b.part(deck, P.trimWood, { bone, at: [0, deckTop - 0.05, 0], flat: true, name: "towerBodyDeck" });
    const under = new THREE.CylinderGeometry(1.42, 1.3, 0.1, 8, 1);
    under.rotateY(PI / 8);
    b.part(under, P.darkWood, { bone, at: [0, deckTop - 0.15, 0], flat: true, name: "towerBodyDeckUnder" });
    const top = new THREE.CylinderGeometry(1.56, 1.56, 0.014, 8, 1);
    top.rotateY(PI / 8);
    b.part(top, PLANK, { bone, at: [0, deckTop + 0.004, 0], flat: true, name: "towerBodyDeckPlanks" });
    // outer deck edge lip
    const lip = new THREE.CylinderGeometry(1.64, 1.64, 0.035, 8, 1);
    lip.rotateY(PI / 8);
    b.part(lip, P.darkWood, { bone, at: [0, deckTop - 0.1, 0], flat: true, name: "towerBodyDeckLip" });
  }
  // plank seams, radial, two per face
  for (let k = 0; k < 8; k++) {
    const psi = (k * PI) / 4;
    const dirH = new THREE.Vector3(Math.sin(psi), 0, Math.cos(psi));
    const tg = new THREE.Vector3(Math.cos(psi), 0, -Math.sin(psi));
    for (const u of [-0.32, 0.32]) {
      const c = dirH.clone().multiplyScalar(1.34).addScaledVector(tg, u * 1.1);
      c.y = deckTop + 0.012;
      add(P.darkWood, new THREE.BoxGeometry(0.014, 0.006, 0.22), c, aim(dirH, [0, 1, 0], "z"));
    }
    // corbels under the deck at the face centres
    const cc = dirH.clone().multiplyScalar(1.33);
    cc.y = deckTop - 0.32;
    add(P.darkWood, new THREE.BoxGeometry(0.14, 0.2, 0.34), cc, aim(dirH, [0, 1, 0], "z"));
    const cb = dirH.clone().multiplyScalar(1.4);
    cb.y = deckTop - 0.24;
    add(PLANK, new THREE.BoxGeometry(0.1, 0.04, 0.22), cb, aim(dirH, [0, 1, 0], "z"));
  }

  // posts, rails and balusters at the 8 deck corners
  const postR = 1.5;
  const railTop = deckTop + 0.52;
  const railMid = deckTop + 0.27;
  const postPt = (k: number, y: number) => {
    const phi = (k * 45 + 22.5) * DEG;
    return new THREE.Vector3(Math.sin(phi) * postR, y, Math.cos(phi) * postR);
  };
  for (let k = 0; k < 8; k++) {
    cyl(P.darkWood, postPt(k, deckTop), postPt(k, railTop + 0.04), 0.048, 6);
    ball(PLANK, postPt(k, railTop + 0.075), 0.075);
    const a0 = postPt(k, railTop), a1 = postPt(k + 1, railTop);
    cyl(P.trimWood, a0, a1, 0.034, 6);
    const m0 = postPt(k, railMid), m1 = postPt(k + 1, railMid);
    cyl(P.trimWood, m0, m1, 0.026, 6);
    // toe board
    const t0 = postPt(k, deckTop + 0.05), t1 = postPt(k + 1, deckTop + 0.05);
    cyl(P.darkWood, t0, t1, 0.03, 6);
    for (const t of [0.25, 0.5, 0.75]) {
      const lo = postPt(k, deckTop + 0.03).lerp(postPt(k + 1, deckTop + 0.03), t);
      const hi = postPt(k, railTop).lerp(postPt(k + 1, railTop), t);
      cyl(PLANK, lo, hi, 0.018, 5);
    }
  }

  // wall-side wooden gallery door / shutter hint on the back-left (small hatch to the gallery)
  faceBox(P.darkWood, 4, deckTop + 0.45, 0, 0.0, 0.0, 0.0001, 0); // no-op safety anchor (keeps helper reused)

  // anchor plates ("muurankers") – iron stars between dentils and ribs
  for (let k = 0; k < 8; k++) {
    faceBox(P.iron, k, 3.28, 0.5, 0.07, 0.07, 0.02, 0.0);
    faceBox(P.iron, k, 3.28, -0.5, 0.07, 0.07, 0.02, 0.0);
  }

  // lighter highlight ring on the deck rim
  flush();
}
```

<!-- call: doorAndWindows -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildDoorAndWindows({ b, J, P, M }: Ctx) {
  const rnd = rng(7);
  const PI = Math.PI;

  // A few own colours on top of the palette
  const TEAL_DARK = "#3a7c6e";
  const LEAF_DARK = "#4c9a42";
  const SOIL = "#4a3324";
  const ROPE = "#c9a66b";
  const SHINE = "#d7f3fa";

  // ---------------------------------------------------------------- merge buckets (one part per colour)
  const buckets = new Map<string, THREE.BufferGeometry[]>();
  const put = (geo: THREE.BufferGeometry, color: string, m: THREE.Matrix4) => {
    const g = geo.index ? geo.toNonIndexed() : geo;
    g.applyMatrix4(m);
    g.computeVertexNormals(); // non-indexed: faceted look
    const list = buckets.get(color) ?? [];
    list.push(g);
    buckets.set(color, list);
  };
  const ONE = new THREE.Vector3(1, 1, 1);
  const Y_AXIS = new THREE.Vector3(0, 1, 0);

  // free-standing prop placement: geometry authored around its own base, then moved/turned/scaled
  const prop = (geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number, ry = 0, s = 1) => {
    const q = new THREE.Quaternion().setFromAxisAngle(Y_AXIS, ry);
    put(geo, color, new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s, s, s)));
  };

  // ---------------------------------------------------------------- arch outlines
  const archPts = (w: number, h: number, oy = 0, n = 6) => {
    const r = w / 2;
    const hs = Math.max(h - r, 0.001);
    const pts = [new THREE.Vector2(-r, oy), new THREE.Vector2(r, oy), new THREE.Vector2(r, oy + hs)];
    for (let i = 1; i < n; i++) {
      const t = (PI * i) / n;
      pts.push(new THREE.Vector2(r * Math.cos(t), oy + hs + r * Math.sin(t)));
    }
    pts.push(new THREE.Vector2(-r, oy + hs));
    return pts;
  };
  const archGeo = (w: number, h: number, d: number) => {
    const g = new THREE.ExtrudeGeometry(new THREE.Shape(archPts(w, h)), { depth: d, bevelEnabled: false });
    g.translate(0, 0, -d / 2);
    return g;
  };
  const ringGeo = (ow: number, oh: number, iw: number, ih: number, iy: number, d: number) => {
    const s = new THREE.Shape(archPts(ow, oh));
    s.holes.push(new THREE.Path(archPts(iw, ih, iy)));
    const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
    g.translate(0, 0, -d / 2);
    return g;
  };

  // ---------------------------------------------------------------- wall frames (tapered octagon, faces centred on angles)
  const apothem = (y: number) => 0.935 * (1.55 - (y - 0.45) * 0.145);
  const TILT = 0.935 * 0.145;

  class Wall {
    o: THREE.Vector3;
    x: THREE.Vector3;
    y: THREE.Vector3;
    z: THREE.Vector3;
    q: THREE.Quaternion;
    constructor(ang: number, y0: number) {
      const a = (ang * PI) / 180;
      const s = Math.sin(a);
      const c = Math.cos(a);
      this.o = new THREE.Vector3(s * apothem(y0), y0, c * apothem(y0));
      this.z = new THREE.Vector3(s, TILT, c).normalize();
      this.x = new THREE.Vector3(c, 0, -s);
      this.y = new THREE.Vector3().crossVectors(this.z, this.x);
      this.q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(this.x, this.y, this.z));
    }
    p(u: number, v: number, out: number) {
      return this.o.clone().addScaledVector(this.x, u).addScaledVector(this.y, v).addScaledVector(this.z, out);
    }
    place(geo: THREE.BufferGeometry, color: string, u: number, v: number, out: number, rot?: [number, number, number]) {
      const q = this.q.clone();
      if (rot) q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])));
      put(geo, color, new THREE.Matrix4().compose(this.p(u, v, out), q, ONE));
    }
    world(geo: THREE.BufferGeometry, color: string, u: number, v: number, out: number) {
      put(geo, color, new THREE.Matrix4().makeTranslation(...this.p(u, v, out).toArray()));
    }
    box(w: number, h: number, d: number, color: string, u: number, v: number, out: number, rot?: [number, number, number]) {
      this.place(new THREE.BoxGeometry(w, h, d), color, u, v, out, rot);
    }
    cyl(rt: number, rb: number, len: number, seg: number, color: string, u: number, v: number, out: number, rot?: [number, number, number]) {
      const g = new THREE.CylinderGeometry(rt, rb, len, seg);
      g.rotateX(PI / 2);
      this.place(g, color, u, v, out, rot);
    }
    sph(r: number, color: string, u: number, v: number, out: number, sc: [number, number, number] = [1, 1, 1], seg: [number, number] = [6, 4]) {
      const g = new THREE.SphereGeometry(r, seg[0], seg[1]);
      g.scale(sc[0], sc[1], sc[2]);
      this.place(g, color, u, v, out);
    }
    arch(w: number, h: number, d: number, color: string, u: number, v: number, out: number) {
      this.place(archGeo(w, h, d), color, u, v, out);
    }
    ring(ow: number, oh: number, iw: number, ih: number, iy: number, d: number, color: string, u: number, v: number, out: number) {
      this.place(ringGeo(ow, oh, iw, ih, iy, d), color, u, v, out);
    }
  }

  // ---------------------------------------------------------------- flower box
  const flowerBox = (W: Wall, bw: number) => {
    W.box(bw, 0.14, 0.19, P.trimWood, 0, -0.11, 0.07);
    W.box(bw + 0.03, 0.03, 0.21, P.darkWood, 0, -0.045, 0.07);
    for (let k = -2; k <= 2; k++) W.box(0.018, 0.1, 0.01, P.darkWood, (k * bw) / 5, -0.115, 0.168);
    W.box(bw - 0.04, 0.02, 0.14, SOIL, 0, -0.032, 0.075);
    for (const sx of [-1, 1]) W.box(0.025, 0.06, 0.16, P.iron, sx * (bw / 2 - 0.07), -0.21, 0.065);
    const n = Math.max(4, Math.round(bw / 0.06));
    for (let i = 0; i < n; i++) {
      const u = -bw / 2 + 0.05 + (i * (bw - 0.1)) / (n - 1);
      W.sph(0.055, i % 2 ? LEAF_DARK : P.leaf, u, -0.01, 0.075 + (rnd() - 0.5) * 0.05, [1, 0.85, 1], [5, 3]);
      const pink = i % 2 === 0;
      const v = 0.05 + rnd() * 0.07;
      const out = 0.08 + rnd() * 0.07;
      W.box(0.008, v + 0.02, 0.008, LEAF_DARK, u, (v - 0.02) / 2, out);
      W.sph(0.036, pink ? P.flowerPink : P.flowerYellow, u, v, out, [1, 1, 0.7], [5, 3]);
      W.sph(0.014, pink ? P.flowerYellow : P.trimWood, u, v, out + 0.022, [1, 1, 1], [4, 3]);
    }
    for (let i = 0; i < 3; i++) {
      const u = (i - 1) * bw * 0.3 + (rnd() - 0.5) * 0.05;
      W.sph(0.03, P.leaf, u, -0.09, 0.17, [1, 1.3, 0.8], [5, 3]);
    }
  };

  // ---------------------------------------------------------------- round-top window
  type WinOpts = { shutters?: boolean; box?: boolean; keystone?: boolean };
  const windowAt = (ang: number, y0: number, w: number, h: number, o: WinOpts) => {
    const W = new Wall(ang, y0);
    const ow = w + 0.16;
    const oh = h + 0.12;
    W.ring(ow, oh, w, h, 0.04, 0.14, P.windowFrame, 0, 0, 0);
    W.arch(w, h, 0.04, P.window, 0, 0.04, 0.02);
    // glass shine
    W.box(0.014, 0.11, 0.006, SHINE, -w * 0.25, 0.04 + h * 0.72, 0.045, [0, 0, 0.6]);
    W.box(0.014, 0.04, 0.006, SHINE, -w * 0.25 - 0.04, 0.04 + h * 0.56, 0.045, [0, 0, 0.6]);
    // cross bars
    W.box(0.022, h, 0.02, P.windowFrame, 0, 0.04 + h / 2, 0.05);
    W.box(w, 0.022, 0.02, P.windowFrame, 0, 0.04 + h * 0.42, 0.05);
    // sill
    W.box(ow + 0.1, 0.04, 0.15, P.windowFrame, 0, -0.02, 0.055);
    if (o.keystone) W.box(0.09, 0.09, 0.1, P.brick, 0, oh, 0.035);
    if (o.shutters) {
      const sw = w * 0.5;
      for (const sx of [-1, 1]) {
        const u = sx * (ow / 2 + 0.02 + sw / 2);
        W.arch(sw, h + 0.08, 0.04, P.door, u, 0, 0.03);
        for (let k = 0; k < 3; k++) W.box(sw - 0.03, 0.014, 0.012, TEAL_DARK, u, h * 0.2 + k * h * 0.2 - 0.02, 0.052);
        W.box(0.045, 0.045, 0.012, P.darkWood, u, h * 0.84, 0.052, [0, 0, PI / 4]);
        W.cyl(0.012, 0.012, 0.014, 5, P.iron, u + sx * (sw / 2 - 0.015), h * 0.1, 0.055);
      }
    }
    if (o.box) flowerBox(W, ow - 0.02);
  };

  // low windows
  for (const a of [45, -45]) windowAt(a, 1.0, 0.36, 0.5, { shutters: true, box: true, keystone: true });
  for (const a of [135, -135]) windowAt(a, 1.0, 0.36, 0.5, { shutters: true, keystone: true });
  // mid windows
  windowAt(0, 2.55, 0.32, 0.5, { shutters: true, box: true, keystone: true });
  windowAt(180, 2.55, 0.32, 0.5, { shutters: true, keystone: true });
  windowAt(-90, 2.55, 0.32, 0.5, { shutters: true, keystone: true });
  // high small windows
  for (const a of [45, -45, 135, -135]) windowAt(a, 3.15, 0.2, 0.28, {});

  // ---------------------------------------------------------------- front door
  const D = new Wall(0, 0.45);
  D.ring(0.96, 1.4, 0.72, 1.23, 0.05, 0.155, P.windowFrame, 0, 0, 0.0075);
  D.arch(0.72, 1.23, 0.06, P.door, 0, 0.05, 0.03);
  D.box(0.14, 0.11, 0.1, P.brick, 0, 1.42, 0.04); // keystone
  D.box(0.12, 0.05, 0.1, P.trimWood, 0, 1.47, 0.04, [0, 0, 0]);
  for (const sx of [-1, 1]) {
    D.box(0.012, 0.8, 0.01, TEAL_DARK, sx * 0.072, 0.5, 0.063);
    D.box(0.012, 0.8, 0.01, TEAL_DARK, sx * 0.216, 0.5, 0.063);
  }
  D.box(0.7, 0.12, 0.012, P.trimWood, 0, 0.12, 0.066); // kick plate
  // porthole
  D.cyl(0.115, 0.115, 0.02, 10, P.windowFrame, 0, 1.02, 0.068);
  D.cyl(0.085, 0.085, 0.02, 10, P.window, 0, 1.02, 0.074);
  D.box(0.17, 0.012, 0.01, P.windowFrame, 0, 1.02, 0.086);
  D.box(0.012, 0.17, 0.01, P.windowFrame, 0, 1.02, 0.086);
  D.box(0.012, 0.05, 0.006, SHINE, -0.03, 1.06, 0.086, [0, 0, 0.6]);
  // hinges
  for (const v of [0.3, 0.78]) {
    D.box(0.3, 0.04, 0.012, P.iron, -0.2, v, 0.066);
    D.cyl(0.028, 0.028, 0.014, 6, P.iron, -0.35, v, 0.066);
    for (const u of [-0.3, -0.2, -0.1]) D.sph(0.012, P.doorKnob, u, v, 0.075, [1, 1, 0.6], [4, 3]);
  }
  // knob
  D.cyl(0.036, 0.036, 0.016, 8, P.iron, 0.25, 0.62, 0.068);
  D.sph(0.03, P.doorKnob, 0.25, 0.62, 0.092, [1, 1, 1], [6, 4]);
  D.box(0.01, 0.03, 0.01, P.iron, 0.25, 0.54, 0.07);

  // ---------------------------------------------------------------- lantern beside door
  {
    const u = 0.54;
    D.box(0.025, 0.025, 0.24, P.iron, u, 1.55, 0.12);
    D.box(0.02, 0.02, 0.26, P.iron, u, 1.465, 0.1, [-0.71, 0, 0]);
    D.box(0.012, 0.06, 0.012, P.iron, u, 1.5, 0.22);
    const c = D.p(u, 1.38, 0.22);
    const at = (dy: number) => c.clone().add(new THREE.Vector3(0, dy, 0));
    const wp = (g: THREE.BufferGeometry, col: string, p: THREE.Vector3) =>
      put(g, col, new THREE.Matrix4().makeTranslation(p.x, p.y, p.z));
    wp(new THREE.CylinderGeometry(0.055, 0.055, 0.14, 6), P.lantern, at(0));
    for (let k = 0; k < 4; k++) {
      const a = (k * PI) / 2 + PI / 4;
      wp(new THREE.BoxGeometry(0.012, 0.15, 0.012), P.iron, at(0).add(new THREE.Vector3(Math.sin(a) * 0.062, 0, Math.cos(a) * 0.062)));
    }
    wp(new THREE.ConeGeometry(0.085, 0.07, 6), P.iron, at(0.105));
    wp(new THREE.SphereGeometry(0.015, 5, 4), P.iron, at(0.15));
    wp(new THREE.CylinderGeometry(0.07, 0.06, 0.02, 6), P.iron, at(-0.08));
    wp(new THREE.ConeGeometry(0.02, 0.04, 5).rotateX(PI), P.iron, at(-0.11));
  }

  // ---------------------------------------------------------------- barrel
  {
    const prof = [
      [0, 0], [0.17, 0], [0.195, 0.08], [0.21, 0.2], [0.195, 0.32], [0.17, 0.4], [0.15, 0.385], [0, 0.385],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const bx = -0.85;
    const bz = 1.42;
    const by = 0.44;
    prop(new THREE.LatheGeometry(prof, 10), P.trimWood, bx, by, bz);
    prop(new THREE.CylinderGeometry(0.15, 0.15, 0.012, 10).translate(0, 0.39, 0), P.darkWood, bx, by, bz);
    for (const [y, r] of [[0.03, 0.188], [0.09, 0.206], [0.31, 0.206], [0.37, 0.188]])
      prop(new THREE.CylinderGeometry(r, r, 0.03, 10).translate(0, y, 0), P.iron, bx, by, bz);
    prop(new THREE.BoxGeometry(0.04, 0.04, 0.08).translate(0, 0.15, 0.22), P.iron, bx, by, bz);
    prop(new THREE.SphereGeometry(0.025, 5, 4).translate(0, 0.12, 0.27), P.doorKnob, bx, by, bz);
  }

  // ---------------------------------------------------------------- flour sacks
  const sack = (x: number, z: number, s: number, ry: number, col: string) => {
    const y = 0.44;
    const body = new THREE.SphereGeometry(1, 8, 6);
    body.scale(0.2, 0.26, 0.17).translate(0, 0.24, 0);
    prop(body, col, x, y, z, ry, s);
    prop(new THREE.CylinderGeometry(0.06, 0.1, 0.1, 7).translate(0, 0.96 - 0.44 + 0.0 - 0.0, 0), col, x, y, z, ry, s);
    prop(new THREE.CylinderGeometry(0.077, 0.077, 0.025, 7).translate(0, 0.505, 0), ROPE, x, y, z, ry, s);
    prop(new THREE.CylinderGeometry(0.1, 0.065, 0.08, 7).translate(0, 0.6, 0), col, x, y, z, ry, s);
    prop(new THREE.CylinderGeometry(0.085, 0.085, 0.01, 7).translate(0, 0.64, 0), P.sailCloth, x, y, z, ry, s);
    prop(new THREE.BoxGeometry(0.1, 0.1, 0.014).rotateZ(PI / 4).translate(0, 0.25, 0.168), P.brick, x, y, z, ry, s);
    prop(new THREE.BoxGeometry(0.05, 0.05, 0.014).rotateZ(PI / 4).translate(0, 0.25, 0.174), P.sailCloth, x, y, z, ry, s);
  };
  sack(0.85, 1.4, 1, 0.25, P.sack);
  sack(1.05, 1.24, 0.75, 0.5, P.wallShade);

  // ---------------------------------------------------------------- loft hatch with hoist beam
  {
    const H = new Wall(90, 2.4);
    H.box(0.64, 0.74, 0.1, P.trimWood, 0, 0.37, 0);
    for (const sx of [-1, 1]) {
      H.box(0.26, 0.62, 0.04, P.darkWood, sx * 0.14, 0.37, 0.04);
      H.box(0.01, 0.6, 0.01, P.trimWood, sx * 0.14 - 0.05, 0.37, 0.063);
      H.box(0.01, 0.6, 0.01, P.trimWood, sx * 0.14 + 0.05, 0.37, 0.063);
      H.cyl(0.02, 0.02, 0.016, 6, P.iron, sx * 0.03, 0.37, 0.07);
      H.box(0.24, 0.03, 0.012, P.iron, sx * 0.2, 0.12, 0.068);
      H.box(0.24, 0.03, 0.012, P.iron, sx * 0.2, 0.62, 0.068);
    }
    H.box(0.03, 0.8, 0.012, P.trimWood, 0, 0.37, 0.07, [0, 0, 0.7]);
    H.box(0.03, 0.8, 0.012, P.trimWood, 0, 0.37, 0.07, [0, 0, -0.7]);
    H.box(0.08, 0.08, 0.45, P.trimWood, 0, 0.9, 0.2);
    H.box(0.05, 0.05, 0.42, P.trimWood, 0, 0.75, 0.185, [-0.66, 0, 0]);
    H.cyl(0.045, 0.045, 0.03, 8, P.iron, 0, 0.82, 0.38, [0, PI / 2, 0]);
    H.box(0.012, 0.4, 0.012, ROPE, 0, 0.62, 0.38);
    H.sph(0.02, P.iron, 0, 0.41, 0.38, [1, 1, 1], [4, 3]);
    H.sph(0.07, P.sack, 0, 0.32, 0.38, [1, 1.25, 1], [6, 4]);
    H.cyl(0.03, 0.04, 0.04, 6, P.sack, 0, 0.44, 0.38);
  }

  // ---------------------------------------------------------------- flush merged geometry to builder
  for (const [color, geos] of buckets) {
    const merged = mergeGeometries(geos, false);
    if (!merged) continue;
    const part = b.part(merged, color, { bone: J.base, at: [0, 0, 0] });
    if (color === P.lantern) glow(part, 1.4);
  }
}
```