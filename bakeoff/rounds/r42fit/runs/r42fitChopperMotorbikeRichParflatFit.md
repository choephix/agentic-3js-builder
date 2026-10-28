<!-- call: plan -->

```json
{
  "name": "Overwatch Chopper",
  "description": "A stylized Overwatch-look custom chopper motorcycle with a long front fork, teardrop tank, fat rear tire, chrome exhaust and glowing cyan accents.",
  "builderName": "owChopper",
  "size": [0.9, 1.25, 2.9],
  "layout": "Low, long chopper facing +Z. Raked front fork with a 21 inch spoked wheel at the front (z about +1.25), a fat rear wheel at the back (z about -1.0), the engine and frame between them on the floor line, a teardrop tank above the engine, a solo seat behind it, high ape-hanger handlebars up front. Overwatch style: bold chunky shapes, a dark steel base with orange and white trim panels, hex and chevron motifs, glowing cyan energy strips on the engine, wheel hubs and exhaust tips, thin dark outline bands between colour zones. Both wheels touch y=0. Everything is built from primitives with flat colours.",
  "palette": {
    "frameDark": "#2b313d",
    "steel": "#8c97a8",
    "chrome": "#d9e2ee",
    "tankOrange": "#f2791f",
    "trimWhite": "#f4f6f8",
    "outline": "#14171d",
    "rubber": "#1b1d22",
    "seatLeather": "#4a2f22",
    "neonCyan": "#3cf0ff",
    "engineGrey": "#515b6b",
    "brass": "#c8963c",
    "lampGlass": "#fff1b0"
  },
  "mounts": {
    "frontAxle": [0, 0.33, 1.25],
    "rearAxle": [0, 0.33, -1.0],
    "headstock": [0, 0.82, 0.62],
    "tankTop": [0, 0.92, 0.2],
    "seatTop": [0, 0.78, -0.45],
    "engineCentre": [0, 0.4, 0.05],
    "swingarmPivot": [0, 0.42, -0.35],
    "handlebarCentre": [0, 1.15, 0.55]
  },
  "joints": [
    { "name": "frame", "at": [0, 0.5, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "steering", "parent": "frame", "at": [0, 0.82, 0.62], "dir": [0, 0.5, 1], "role": "hinge", "group": "front" },
    { "name": "wheelF", "parent": "steering", "at": [0, 0.33, 1.25], "dir": [1, 0, 0], "role": "hinge", "group": "front" },
    { "name": "swingarm", "parent": "frame", "at": [0, 0.42, -0.35], "dir": [0, 0, -1], "role": "hinge", "group": "rear" },
    { "name": "wheelR", "parent": "swingarm", "at": [0, 0.33, -1.0], "dir": [1, 0, 0], "role": "hinge", "group": "rear" }
  ],
  "parts": [
    {
      "id": "frontEnd",
      "builds": "Raked springer fork (two chrome tubes with outline collars and orange fork sleeves), triple tree, 21 inch front wheel with thin tyre, chrome spokes, cyan hex hub glow, disc brake with caliper, round headlamp with lampGlass lens and white ring, ape-hanger handlebars with grips, mirrors, brake lever, front fender in orange with white chevron stripe.",
      "box": [[-0.45, 0, 0.5], [0.45, 1.25, 1.55]],
      "attaches": "Rides steering and wheelF joints; fork top at headstock, wheel at frontAxle, bars at handlebarCentre.",
      "joints": ["steering", "wheelF"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "frameTank",
      "builds": "Tubular dark steel frame (backbone, down tubes, cradle) with outline-colour welds, large teardrop tankOrange tank with white racing stripe, Overwatch hex emblem on each side, cyan edge strip, thin outline band at tank seams, filler cap in chrome, solo seat in seatLeather with orange piping and rear tail lamp, small rear fender struts.",
      "box": [[-0.3, 0.3, -0.9], [0.3, 1.05, 0.65]],
      "attaches": "Rides frame joint; neck meets steering at headstock, tank sits at tankTop, seat at seatTop, rear frame ends at swingarmPivot.",
      "joints": ["frame"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "engineDrive",
      "builds": "V-twin engine (two angled cylinders with ribbed fins, engineGrey and steel, brass bolts), crankcase with glowing cyan energy core under a hex window, primary chain cover with white chevron, footpegs and shifter, kickstand, side chain run to rear sprocket, belt guard.",
      "box": [[-0.35, 0.12, -0.45], [0.35, 0.75, 0.55]],
      "attaches": "Rides frame joint (and swingarm for the chain); centred at engineCentre.",
      "joints": ["frame", "swingarm"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "rearEnd",
      "builds": "Fat 240 rear wheel with rubber tyre and white sidewall ring, chrome spokes, cyan hub glow, brake disc, swingarm arms in frameDark with orange tips, orange rear fender with white stripe and tail lamp, two long chrome drag-pipe exhausts running back along the right side with heat-shield bands and glowing cyan tips, license plate with hex logo.",
      "box": [[-0.45, 0, -1.45], [0.45, 0.85, -0.3]],
      "attaches": "Rides swingarm and wheelR joints; wheel at rearAxle, arms pivot at swingarmPivot, exhaust headers start at engineCentre.",
      "joints": ["swingarm", "wheelR", "frame"],
      "floor": true,
      "budget": 190
    }
  ]
}
```

<!-- call: rearEnd -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildRearEnd({ b, J, P, M }: any) {
  const R = M.rearAxle as number[];
  const AX: [number, number, number] = [1, 0, 0];
  const part = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, o: any = {}) =>
    b.part(g, c, { at, bone, ...o });
  const wheel = J.wheelR;
  const arm = J.swingarm;
  const frm = J.frame;

  // Tyre: torus, fat
  part(new THREE.TorusGeometry(0.27, 0.07, 8, 24), P.rubber, R, wheel, { dir: AX, axis: "z" });
  part(new THREE.TorusGeometry(0.2, 0.012, 4, 24), P.trimWhite, [0.075, R[1], R[2]], wheel, { dir: AX, axis: "z" });
  part(new THREE.TorusGeometry(0.2, 0.012, 4, 24), P.trimWhite, [-0.075, R[1], R[2]], wheel, { dir: AX, axis: "z" });
  // rim
  for (const s of [1, -1])
    part(new THREE.TorusGeometry(0.2, 0.012, 4, 24), P.chrome, [s * 0.04, R[1], R[2]], wheel, { dir: AX, axis: "z" });
  // spokes
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    for (const s of [1, -1]) {
      const y = R[1] + Math.cos(a) * 0.11, z = R[2] + Math.sin(a) * 0.11;
      part(new THREE.CylinderGeometry(0.004, 0.004, 0.2, 4), P.chrome, [s * 0.03, y, z], wheel, {
        rotation: [(a * 180) / Math.PI + 90 - 90 + 90, 0, 0],
      });
    }
  }
  // hub glow
  glow(part(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 6), P.neonCyan, R, wheel, { dir: AX }), 1.6);
  part(new THREE.CylinderGeometry(0.03, 0.03, 0.26, 6), P.chrome, R, wheel, { dir: AX });
  // disc
  part(new THREE.CylinderGeometry(0.15, 0.15, 0.008, 18), P.steel, [-0.1, R[1], R[2]], wheel, { dir: AX });
  part(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 6), P.outline, [-0.105, R[1], R[2]], wheel, { dir: AX });

  // swingarm arms
  for (const s of [1, -1]) {
    const x = s * 0.13;
    b.rod([x, M.swingarmPivot[1], M.swingarmPivot[2]], [x, R[1], R[2]], 0.025, P.frameDark, { bone: arm });
    part(new THREE.BoxGeometry(0.05, 0.07, 0.07), P.tankOrange, [x, R[1], R[2] + 0.02], arm);
    part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 8), P.outline, [x, M.swingarmPivot[1], M.swingarmPivot[2]], arm, { dir: AX });
  }

  // fender
  b.sweep([[0, 0.66, -0.7], [0, 0.69, -1.0], [0, 0.6, -1.3]], [0.15, 0.1], { bone: arm, color: P.tankOrange, sides: 8 });
  b.sweep([[0, 0.69, -0.7], [0, 0.72, -1.0], [0, 0.63, -1.3]], [0.03, 0.03], { bone: arm, color: P.trimWhite, sides: 6 });
  // tail lamp
  glow(part(new THREE.BoxGeometry(0.1, 0.04, 0.03), "#ff3030", [0, 0.58, -1.34], arm), 1.5);
  // plate
  part(new THREE.BoxGeometry(0.2, 0.12, 0.01), P.trimWhite, [0, 0.46, -1.36], arm, { rotation: [-10, 0, 0] });
  part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 6), P.tankOrange, [0, 0.46, -1.368], arm, { rotation: [80, 0, 0] });

  // exhausts on right side (-x)
  const ex = [0.0, 0.0];
  [0, 1].forEach((k) => {
    const y = 0.3 - k * 0.0 + k * 0.1;
    const x = -0.2 - k * 0.07;
    const pts = [
      [x + 0.05, M.engineCentre[1] - 0.02 + k * 0.08, M.engineCentre[2] + 0.1],
      [x, y - 0.05 + k * 0.0, 0.0],
      [x - 0.02, y, -0.5],
      [x - 0.03, y + 0.02, -1.2],
    ];
    b.sweep(pts, 0.032, { bone: frm, color: P.chrome, sides: 8 });
    for (const t of [0.6, 0.75, 0.9]) {
      const z = -0.3 - t * 0.9;
      part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 8), P.outline, [x - 0.02, y + 0.015, z], frm, { dir: [0, 0, 1] });
    }
    part(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 8), P.steel, [x - 0.025, y + 0.01, -0.62], frm, { dir: [0, 0, 1] });
    glow(part(new THREE.CylinderGeometry(0.026, 0.026, 0.03, 8), P.neonCyan, [x - 0.03, y + 0.02, -1.215], frm, { dir: [0, 0, 1] }), 1.8);
  });
}
```

<!-- call: engineDrive -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildEngineDrive({ b, J, P, M }: any) {
  const F = J.frame, S = J.swingarm;
  const ec = M.engineCentre as number[];
  const put = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone: F, at, ...o });
  const cyl = (rt: number, rb: number, h: number, n = 8) => new THREE.CylinderGeometry(rt, rb, h, n);

  // crankcase
  put(new THREE.BoxGeometry(0.34, 0.26, 0.4), P.engineGrey, [ec[0], 0.36, ec[2]]);
  put(new THREE.BoxGeometry(0.36, 0.06, 0.3), P.outline, [0, 0.21, ec[2]]);
  put(new THREE.BoxGeometry(0.3, 0.05, 0.36), P.steel, [0, 0.5, ec[2]]);
  // cyan core under hex window (both sides)
  for (const s of [1, -1]) {
    put(cyl(0.085, 0.085, 0.02, 6), P.outline, [s * 0.175, 0.37, ec[2] + 0.02], { dir: [s, 0, 0] });
    glow(put(cyl(0.065, 0.065, 0.024, 6), P.neonCyan, [s * 0.178, 0.37, ec[2] + 0.02], { dir: [s, 0, 0] }), 1.6);
  }
  // cylinders in V
  for (const a of [-1, 1]) {
    const dir = [0, 1, a * 0.7];
    const base = [0, 0.5, ec[2] + a * 0.07];
    const d = new THREE.Vector3(...dir).normalize();
    const mk = (t: number) => base.map((v, i) => v + d.getComponent(i) * t);
    put(cyl(0.07, 0.08, 0.26, 8), P.engineGrey, mk(0.14), { dir });
    for (let i = 0; i < 6; i++)
      put(cyl(0.105, 0.105, 0.016, 8), i % 2 ? P.steel : P.engineGrey, mk(0.05 + i * 0.04), { dir });
    put(cyl(0.095, 0.095, 0.05, 8), P.steel, mk(0.3), { dir });
    put(cyl(0.03, 0.03, 0.03, 6), P.brass, mk(0.34), { dir });
    for (const s of [1, -1]) put(new THREE.SphereGeometry(0.014, 6, 4), P.brass, [s * 0.09, 0.5, ec[2] + a * 0.1 + a * 0.05]);
  }
  // primary chain cover (left, +X) with chevron
  put(cyl(0.15, 0.15, 0.05, 10), P.steel, [0.21, 0.34, ec[2] - 0.2], { dir: [1, 0, 0] });
  put(cyl(0.155, 0.155, 0.012, 10), P.outline, [0.19, 0.34, ec[2] - 0.2], { dir: [1, 0, 0] });
  for (const k of [0, 1]) {
    for (const z of [-1, 1])
      put(new THREE.BoxGeometry(0.012, 0.035, 0.1), P.trimWhite, [0.24, 0.34 + 0.03 * k + 0.0 , ec[2] - 0.2], {
        rotation: [z * 35, 0, 0],
        at: [0.24, 0.35 + 0.04 * k - 0.02 * 0, ec[2] - 0.2 + z * 0.03],
      });
  }
  // right-side belt guard
  put(new THREE.BoxGeometry(0.03, 0.1, 0.5), P.frameDark, [-0.2, 0.4, ec[2] - 0.32], { bone: S });
  put(new THREE.BoxGeometry(0.034, 0.02, 0.5), P.outline, [-0.2, 0.46, ec[2] - 0.32], { bone: S });
  // chain run to rear sprocket
  for (const y of [0.46, 0.3])
    b.rod([0.22, y, -0.12], [0.22, y - 0.02, -0.95], 0.01, P.outline, { bone: S });
  put(cyl(0.1, 0.1, 0.03, 12), P.steel, [0.22, 0.33, -1.0], { dir: [1, 0, 0], bone: S });
  glow(put(cyl(0.04, 0.04, 0.034, 6), P.neonCyan, [0.22, 0.33, -1.0], { dir: [1, 0, 0], bone: S }), 1.3);
  // footpegs, shifter
  for (const s of [1, -1]) {
    put(cyl(0.015, 0.015, 0.1, 6), P.chrome, [s * 0.2, 0.28, 0.22], { dir: [s, 0, 0], at: [s * 0.26, 0.28, 0.22] });
    put(cyl(0.022, 0.022, 0.05, 6), P.rubber, [s * 0.34, 0.28, 0.22], { dir: [s, 0, 0] });
  }
  b.rod([0.22, 0.3, -0.05], [0.34, 0.26, 0.08], 0.008, P.chrome, { bone: F });
  put(new THREE.BoxGeometry(0.05, 0.02, 0.05), P.rubber, [0.35, 0.26, 0.1]);
  // exhaust headers hint
  for (const a of [-1, 1]) b.rod([-0.1, 0.34, ec[2] + a * 0.1], [-0.2, 0.3, ec[2] - 0.2], 0.018, P.chrome, { bone: F });
  // kickstand
  b.rod([0.25, 0.3, -0.2], [0.4, 0.13, -0.28], 0.014, P.steel, { bone: F });
  put(new THREE.BoxGeometry(0.07, 0.015, 0.06), P.outline, [0.4, 0.125, -0.28]);
}
```

<!-- call: frameTank -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildFrameTank({ b, J, P, M }: Ctx) {
  const F = J.frame;
  const hex = (r: number, h: number, seg = 6) => new THREE.CylinderGeometry(r, r, h, seg);
  const rod = (a: number[], c: number[], r: number, col: string) =>
    b.rod(a, c, r, col, { bone: F, sides: 6 });
  const ball = (p: number[], r: number, col: string) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { at: p, bone: F });
  const box = (s: number[], p: number[], col: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), col, { at: p, bone: F, rotation: rot });
  const weld = (p: number[], r = 0.022) => ball(p, r, P.outline);

  // Frame tubes (both sides)
  const head = [0, 0.82, 0.62];
  rod([0, 0.7, 0.66], [0, 0.95, 0.58], 0.035, P.frameDark);
  weld(head, 0.04);
  rod([0, 0.88, 0.58], [0, 0.82, 0.05], 0.03, P.frameDark); // backbone
  rod([0, 0.82, 0.05], [0, 0.72, -0.4], 0.028, P.frameDark);
  weld([0, 0.82, 0.05]);
  weld([0, 0.72, -0.4]);
  for (const s of [1, -1]) {
    rod([s * 0.03, 0.76, 0.6], [s * 0.1, 0.4, 0.3], 0.03, P.frameDark); // down tubes
    rod([s * 0.1, 0.4, 0.3], [s * 0.12, 0.3, 0.0], 0.03, P.frameDark);
    rod([s * 0.12, 0.3, 0.0], [s * 0.12, 0.38, -0.3], 0.03, P.frameDark); // cradle
    rod([s * 0.12, 0.38, -0.3], [s * 0.09, 0.42, -0.35], 0.03, P.frameDark);
    rod([s * 0.03, 0.7, -0.4], [s * 0.11, 0.42, -0.35], 0.026, P.frameDark);
    rod([s * 0.04, 0.74, -0.3], [s * 0.1, 0.4, -0.35], 0.02, P.frameDark);
    // fender struts
    rod([s * 0.05, 0.74, -0.42], [s * 0.1, 0.62, -0.88], 0.014, P.steel);
    rod([s * 0.1, 0.45, -0.35], [s * 0.1, 0.62, -0.85], 0.014, P.steel);
    for (const p of [[s * 0.1, 0.4, 0.3], [s * 0.12, 0.3, 0.0], [s * 0.11, 0.42, -0.35]]) weld(p);
    // seat pivot bolts
    ball([s * 0.12, 0.38, -0.3], 0.02, P.brass);
  }

  // Tank: teardrop built from stretched spheres
  const tc = [0, 0.92, 0.2];
  const tank = (r: number, sc: number[], p: number[], col: string) =>
    b.part(new THREE.SphereGeometry(r, 14, 10), col, { at: p, bone: F, scale: sc });
  tank(0.17, [0.9, 0.75, 1.55], [0, tc[1] - 0.04, tc[2]], P.tankOrange);
  tank(0.1, [0.9, 0.8, 1.7], [0, tc[1] - 0.05, tc[2] + 0.28], P.tankOrange);
  tank(0.06, [0.9, 0.8, 1.2], [0, tc[1] - 0.06, tc[2] + 0.4], P.tankOrange);
  // outline seam bands
  for (const z of [0.0, 0.42]) {
    b.part(new THREE.TorusGeometry(z ? 0.085 : 0.15, 0.006, 4, 16), P.outline, {
      at: [0, tc[1] - 0.04 - (z ? 0.01 : 0), tc[2] + z - 0.05], bone: F, scale: [0.95, 0.8, 1],
    });
  }
  // racing stripe
  b.part(new THREE.BoxGeometry(0.05, 0.012, 0.5), P.trimWhite, { at: [0, tc[1] + 0.088, tc[2] + 0.12], bone: F });
  for (const s of [1, -1]) box([0.006, 0.012, 0.5], [s * 0.032, tc[1] + 0.086, tc[2] + 0.12], P.outline);
  // cap
  b.part(hex(0.035, 0.02, 10), P.chrome, { at: [0, tc[1] + 0.092, tc[2] - 0.05], bone: F });
  b.part(hex(0.015, 0.025, 6), P.outline, { at: [0, tc[1] + 0.1, tc[2] - 0.05], bone: F });
  // side emblems and cyan strips
  for (const s of [1, -1]) {
    const x = s * 0.157;
    const rot = [0, 0, -s * 90];
    b.part(hex(0.06, 0.008, 6), P.outline, { at: [x, 0.89, 0.18], bone: F, rotation: rot });
    b.part(hex(0.048, 0.01, 6), P.trimWhite, { at: [x + s * 0.002, 0.89, 0.18], bone: F, rotation: rot });
    b.part(hex(0.028, 0.012, 6), P.tankOrange, { at: [x + s * 0.004, 0.89, 0.18], bone: F, rotation: rot });
    box([0.012, 0.012, 0.16], [s * 0.17, 0.82, 0.18], P.neonCyan);
    box([0.014, 0.01, 0.3], [s * 0.15, 0.78, 0.12], P.outline);
  }

  // Seat
  const st = M.seatTop;
  box([0.24, 0.05, 0.3], [0, st[1] - 0.04, st[2] + 0.02], P.seatLeather);
  box([0.18, 0.06, 0.18], [0, st[1] - 0.03, st[2] - 0.2], P.seatLeather);
  box([0.12, 0.05, 0.14], [0, st[1] - 0.025, st[2] + 0.2], P.seatLeather);
  for (const s of [1, -1]) {
    box([0.01, 0.012, 0.34], [s * 0.125, st[1] - 0.018, st[2] + 0.02], P.tankOrange);
    box([0.01, 0.012, 0.2], [s * 0.095, st[1] - 0.005, st[2] - 0.2], P.tankOrange);
  }
  box([0.26, 0.02, 0.34], [0, st[1] - 0.075, st[2] + 0.02], P.frameDark);
  // seat springs
  for (const s of [1, -1]) rod([s * 0.08, 0.7, -0.38], [s * 0.08, 0.76, -0.38], 0.01, P.steel);

  // Tail lamp
  const tl = [0, 0.74, -0.9];
  b.part(hex(0.03, 0.03, 8), P.outline, { at: tl, bone: F, rotation: [90, 0, 0] });
  b.part(hex(0.022, 0.03, 8), P.neonCyan, { at: [0, 0.74, -0.915], bone: F, rotation: [90, 0, 0] });
  box([0.05, 0.03, 0.05], [0, 0.745, -0.86], P.frameDark);
  rod([0, 0.72, -0.42], [0, 0.74, -0.86], 0.012, P.frameDark);
}
```

<!-- call: frontEnd -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildFrontEnd({ b, J, P, M }: any) {
  const st = J.steering, wh = J.wheelF;
  const ax = M.frontAxle as number[];
  const hs = M.headstock as number[];
  const hb = M.handlebarCentre as number[];
  const R = 0.33;

  // helpers
  const part = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, o: any = {}) =>
    b.part(g, c, { bone, at, ...o });
  const cyl = (r: number, h: number, seg = 10) => new THREE.CylinderGeometry(r, r, h, seg);
  const X = [0, 0, 1] as any; // not used for axis; wheel axle is along x

  // ---------- Wheel (axle along X) ----------
  const wheelPart = (g: THREE.BufferGeometry, c: string, dx: number, o: any = {}) =>
    part(g, c, [ax[0] + dx, ax[1], ax[2]], wh, { dir: [1, 0, 0], ...o });
  // tyre
  const tyre = new THREE.TorusGeometry(R - 0.035, 0.035, 8, 28);
  b.part(tyre, P.rubber, { bone: wh, at: ax, dir: [1, 0, 0], axis: "z" });
  // rim rings
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(R - 0.075, 0.009, 6, 28), P.chrome, { bone: wh, at: [ax[0] + s * 0.018, ax[1], ax[2]], dir: [1, 0, 0], axis: "z" });
  }
  // hub
  wheelPart(cyl(0.05, 0.1, 6), P.chrome, 0);
  for (const s of [1, -1]) {
    wheelPart(cyl(0.062, 0.012, 6), P.outline, s * 0.05);
    glow(wheelPart(cyl(0.04, 0.012, 6), P.neonCyan, s * 0.058), 1.4);
  }
  // spokes
  const sp = rng(3);
  for (const s of [1, -1]) {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + (s > 0 ? 0 : 0.2);
      const len = R - 0.08;
      const cy = Math.cos(a), sz = Math.sin(a);
      const r0 = 0.05, r1 = R - 0.075;
      const mid = (r0 + r1) / 2;
      const p = [ax[0] + s * 0.012, ax[1] + cy * mid, ax[2] + sz * mid];
      b.part(cyl(0.004, r1 - r0, 4), P.chrome, { bone: wh, at: p, dir: [0, cy, sz] });
    }
  }
  // disc brake (right side x<0? put on left +x)
  const dx = 0.06;
  wheelPart(new THREE.CylinderGeometry(0.15, 0.15, 0.008, 20), P.steel, dx);
  wheelPart(new THREE.CylinderGeometry(0.11, 0.11, 0.01, 12), P.outline, dx);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    part(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 6), P.frameDark,
      [ax[0] + dx, ax[1] + Math.cos(a) * 0.13, ax[2] + Math.sin(a) * 0.13], wh, { dir: [1, 0, 0] });
  }
  // caliper
  part(new THREE.BoxGeometry(0.04, 0.07, 0.05), P.tankOrange, [ax[0] + dx, ax[1] + 0.1, ax[2] - 0.12], st);
  part(new THREE.BoxGeometry(0.05, 0.02, 0.055), P.outline, [ax[0] + dx, ax[1] + 0.1, ax[2] - 0.12], st);

  // ---------- Fork (raked) ----------
  const top = [0, hs[1] + 0.05, hs[2]];
  for (const s of [1, -1]) {
    const x = s * 0.1;
    const a = [x, top[1], top[2]];
    const e = [s * 0.075, ax[1], ax[2]];
    // lower chrome tube
    b.rod(a, e, 0.016, P.chrome, { bone: st, sides: 8 });
    // orange sleeve upper
    const sl = [x, top[1] - 0.02, top[2] + 0.02];
    const sl2 = [x + (e[0] - x) * 0.3, top[1] + (e[1] - top[1]) * 0.3, top[2] + (e[2] - top[2]) * 0.3];
    b.rod(sl, sl2, 0.028, P.tankOrange, { bone: st, sides: 8 });
    // collars
    for (const t of [0.32, 0.62, 0.9]) {
      const p = [x + (e[0] - x) * t, a[1] + (e[1] - a[1]) * t, a[2] + (e[2] - a[2]) * t];
      b.part(cyl(0.024, 0.016, 8), P.outline, { bone: st, at: p, dir: [e[0] - x, e[1] - a[1], e[2] - a[2]] });
    }
    // axle plate
    part(new THREE.BoxGeometry(0.02, 0.06, 0.05), P.steel, e, st);
    part(cyl(0.012, 0.05, 6), P.chrome, [s * 0.1, ax[1], ax[2]], st, { dir: [1, 0, 0] });
  }
  // springer rear rods
  for (const s of [1, -1]) {
    b.rod([s * 0.1, top[1] - 0.02, top[2] - 0.05], [s * 0.085, ax[1] + 0.1, ax[2] - 0.08], 0.008, P.steel, { bone: st, sides: 6 });
  }
  // triple tree
  part(new THREE.BoxGeometry(0.26, 0.04, 0.09), P.steel, [0, top[1] + 0.02, top[2]], st);
  part(new THREE.BoxGeometry(0.28, 0.012, 0.1), P.outline, [0, top[1] - 0.005, top[2]], st);
  part(cyl(0.035, 0.12, 8), P.frameDark, [0, top[1] + 0.02, top[2]], st);
  for (const s of [1, -1]) part(cyl(0.012, 0.01, 6), P.brass, [s * 0.05, top[1] + 0.045, top[2]], st);

  // ---------- Fender ----------
  const fz = ax[2];
  b.part(new THREE.CylinderGeometry(R + 0.05, R + 0.05, 0.12, 16, 1, true, -Math.PI * 0.05, Math.PI * 0.6), P.tankOrange,
    { bone: st, at: [0, ax[1], fz], dir: [1, 0, 0], rotation: [0, 0, 0], flat: true });
  // simple orange arc via torus slices
  for (let i = 0; i < 6; i++) {
    const a = Math.PI * 0.08 + i * 0.17;
    const rr = R + 0.045;
    const p = [0, ax[1] + Math.sin(a) * rr, fz + Math.cos(a) * rr * 0.98];
    const q = [0, ax[1] + Math.sin(a) * rr, fz + Math.cos(a) * rr];
    part(new THREE.BoxGeometry(0.15, 0.02, 0.09), i % 2 ? P.tankOrange : P.tankOrange, q, st, { rotation: [-(a * 180) / Math.PI + 90 - 90, 0, 0] });
    if (i === 2 || i === 3) part(new THREE.BoxGeometry(0.152, 0.004, 0.03), P.trimWhite, [0, p[1] + 0.011, p[2]], st, { rotation: [-(a * 180) / Math.PI, 0, 0] });
  }
  // fender stays
  for (const s of [1, -1]) b.rod([s * 0.075, ax[1] + 0.03, fz + 0.02], [s * 0.075, ax[1] + 0.3, fz - 0.07], 0.008, P.steel, { bone: st, sides: 6 });

  // ---------- Headlamp ----------
  const hl = [0, hs[1] + 0.02, hs[2] + 0.17];
  part(new THREE.SphereGeometry(0.075, 12, 8), P.frameDark, hl, st);
  part(new THREE.TorusGeometry(0.073, 0.01, 6, 16), P.trimWhite, [hl[0], hl[1], hl[2] + 0.04], st);
  glow(part(new THREE.SphereGeometry(0.06, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), P.lampGlass, [hl[0], hl[1], hl[2] + 0.035], st, { dir: [0, 0, 1] }), 1.3);
  for (const s of [1, -1]) b.rod([s * 0.1, top[1] - 0.04, top[2] + 0.04], [s * 0.07, hl[1], hl[2] - 0.01], 0.008, P.steel, { bone: st, sides: 6 });

  // ---------- Ape hangers ----------
  const bz = hb[2], by = hb[1];
  part(cyl(0.022, 0.09, 8), P.steel, [0, hs[1] + 0.1, hs[2] - 0.02], st);
  for (const s of [1, -1]) {
    const pts = [
      new THREE.Vector3(0.02 * s, hs[1] + 0.14, bz - 0.04),
      new THREE.Vector3(0.12 * s, hs[1] + 0.2, bz - 0.04),
      new THREE.Vector3(0.3 * s, by - 0.05, bz - 0.02),
      new THREE.Vector3(0.38 * s, by + 0.04, bz + 0.02),
      new THREE.Vector3(0.4 * s, by + 0.05, bz + 0.12),
    ];
    b.sweep(pts.map(p => [p.x, p.y, p.z]), 0.012, { bone: st, color: P.chrome, sides: 8 });
    const g0 = pts[4];
    part(cyl(0.02, 0.12, 8), P.rubber, [g0.x, g0.y, g0.z + 0.03], st, { dir: [0, 0, 1] });
    part(cyl(0.024, 0.012, 8), P.tankOrange, [g0.x, g0.y, g0.z - 0.04], st, { dir: [0, 0, 1] });
    // lever (right side s=-1 = brake)
    b.rod([g0.x, g0.y + 0.03, g0.z + 0.0], [g0.x * 0.9, g0.y + 0.02, g0.z + 0.17], 0.005, P.chrome, { bone: st, sides: 5 });
    part(new THREE.SphereGeometry(0.01, 6, 4), P.chrome, [g0.x * 0.9, g0.y + 0.02, g0.z + 0.17], st);
    // mirror
    const m0 = [pts[3].x - s * 0.02, pts[3].y + 0.02, pts[3].z];
    const m1 = [m0[0] + s * 0.05, m0[1] + 0.16, m0[2] - 0.04];
    b.rod(m0, m1, 0.006, P.chrome, { bone: st, sides: 5 });
    part(cyl(0.04, 0.012, 12), P.outline, [m1[0], m1[1] + 0.03, m1[2]], st, { dir: [0, 0.3, -1] });
    part(cyl(0.034, 0.012, 12), P.steel, [m1[0], m1[1] + 0.03, m1[2] - 0.006], st, { dir: [0, 0.3, -1] });
  }
  // cyan strip on fork sleeves
  for (const s of [1, -1]) glow(part(new THREE.BoxGeometry(0.006, 0.1, 0.006), P.neonCyan, [s * 0.13, top[1] - 0.12, top[2] + 0.12], st, { rotation: [-18, 0, 0] }), 1.2);
}
```

<!-- call: fit-rearEnd -->

The exhaust headers started at z = 0.18 and ran forward of the box's +z face at z = -0.3. I moved the header start back to z = -0.3 and kept the rest of each pipe as it was.

<<<<<<< SEARCH
      [x + 0.05, M.engineCentre[1] - 0.02 + k * 0.08, M.engineCentre[2] + 0.1],
      [x, y - 0.05 + k * 0.0, 0.0],
=======
      [x + 0.05, M.engineCentre[1] - 0.02 + k * 0.08, -0.3],
      [x, y - 0.05 + k * 0.0, -0.36],
>>>>>>> REPLACE

<!-- call: fit-engineDrive -->

The chain run and rear sprocket reached back to the rear axle, outside my box. I shortened the chain to end at z = -0.4 and moved the sprocket to z = -0.4 with a smaller radius, so everything stays inside the box.

<<<<<<< SEARCH
    b.rod([0.22, y, -0.12], [0.22, y - 0.02, -0.95], 0.01, P.outline, { bone: S });
  put(cyl(0.1, 0.1, 0.03, 12), P.steel, [0.22, 0.33, -1.0], { dir: [1, 0, 0], bone: S });
  glow(put(cyl(0.04, 0.04, 0.034, 6), P.neonCyan, [0.22, 0.33, -1.0], { dir: [1, 0, 0], bone: S }), 1.3);
=======
    b.rod([0.22, y, -0.12], [0.22, y - 0.02, -0.38], 0.01, P.outline, { bone: S });
  put(cyl(0.09, 0.09, 0.03, 12), P.steel, [0.22, 0.33, -0.4], { dir: [1, 0, 0], bone: S });
  glow(put(cyl(0.04, 0.04, 0.034, 6), P.neonCyan, [0.22, 0.33, -0.4], { dir: [1, 0, 0], bone: S }), 1.3);
>>>>>>> REPLACE

<!-- call: fit-frontEnd -->

The four stray pieces are the mirror discs. The mirror stalk rises from the handlebar and ends too high, so I lower the stalk and the mirror heads.

The stalk top was `m0[1] + 0.16`, which puts the discs at about 1.44 m. Changing it to `m0[1] + 0.08` brings the discs down to about 1.36 m. The disc is 0.04 m wide, so its top reaches about 1.36 + 0.04 = 1.40 m. That is still over 1.25, so I need a lower handlebar reference as well.

The handlebar centre is 1.15 and `m0` is at about `by + 0.06`, which is 1.21. The mirror then has to sit at 1.25 or lower, so the stalk rises only 0.01 and the disc radius shrinks to 0.03. The mirror then sits at about 1.23 m and the disc top at about 1.26 m. I lower it a little more with a 0.005 rise, so the disc top is about 1.25 m.

```ts
<<<<<<< SEARCH
    const m1 = [m0[0] + s * 0.05, m0[1] + 0.16, m0[2] - 0.04];
=======
    const m1 = [m0[0] + s * 0.05, m0[1] - 0.005, m0[2] - 0.04];
>>>>>>> REPLACE
<<<<<<< SEARCH
    part(cyl(0.04, 0.012, 12), P.outline, [m1[0], m1[1] + 0.03, m1[2]], st, { dir: [0, 0.3, -1] });
    part(cyl(0.034, 0.012, 12), P.steel, [m1[0], m1[1] + 0.03, m1[2] - 0.006], st, { dir: [0, 0.3, -1] });
=======
    part(cyl(0.03, 0.012, 12), P.outline, [m1[0], m1[1] + 0.005, m1[2]], st, { dir: [0, 0.3, -1] });
    part(cyl(0.025, 0.012, 12), P.steel, [m1[0], m1[1] + 0.005, m1[2] - 0.006], st, { dir: [0, 0.3, -1] });
>>>>>>> REPLACE
```