```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  mix,
  noise,
  smoothstep,
  scales,
  mottle,
  polyline,
  catmull,
  frame,
  svg,
} from "agentic-3js-builder";
import type { Sweep, Paint } from "agentic-3js-builder";

export const meta = {
  name: "Nine-banded Armadillo",
  description:
    "A stylized nine-banded armadillo: tiled scapular and pelvic shields, nine raised overlapping bands, a ringed armoured tail, pointy snout, tall leathery ears, beady eyes, clawed feet and coarse pale hairs poking out between the bands.",
};

const D = Math.PI / 180;

// Body cross-section stations (z, half width, half height, centre height)
const ZS = [-0.17, -0.12, -0.03, 0.06, 0.12, 0.16];
const RX = [0.05, 0.075, 0.08, 0.075, 0.06, 0.035];
const RY = [0.04, 0.065, 0.07, 0.065, 0.05, 0.0325];
const CY = [0.135, 0.14, 0.145, 0.14, 0.13, 0.125];

function lin(arr: number[], z: number) {
  if (z <= ZS[0]) return arr[0];
  if (z >= ZS[ZS.length - 1]) return arr[arr.length - 1];
  let k = 0;
  while (k < ZS.length - 2 && ZS[k + 1] <= z) k++;
  const f = (z - ZS[k]) / (ZS[k + 1] - ZS[k]);
  return arr[k] + (arr[k + 1] - arr[k]) * f;
}

/** An arch-shaped band outline around the body's elliptical section. */
function arch(rx: number, ry: number, oOut: number, oIn: number, deg = 110, n = 18): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const a = (-deg + (2 * deg * i) / n) * D;
    pts.push([(rx + oOut) * Math.sin(a), (ry + oOut) * Math.cos(a)]);
  }
  for (let i = n; i >= 0; i--) {
    const a = (-deg + (2 * deg * i) / n) * D;
    pts.push([(rx + oIn) * Math.sin(a), (ry + oIn) * Math.cos(a)]);
  }
  return pts;
}

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "armadillo", paintSize: 2048 });
  const R = rng(42);

  // ---------------- palette ----------------
  const SHELL_A = "#c99c86";
  const SHELL_B = "#d8b09a";
  const SHELL_C = "#b98a76";
  const SHELL_LIGHT = "#ecd2bf";
  const GROOVE = "#6e4a3e";
  const RIM = "#8f6556";
  const SKIN = "#d6a396";
  const SKIN_D = "#c18a7e";
  const CLAW = "#4a3a2e";
  const TOE = "#b8806f";

  const tiles = scales([SHELL_A, SHELL_B, SHELL_C], GROOVE, { size: 0.011, width: 0.2, seed: 3 });
  const shellPaint = paint((p, n) => {
    const base = tiles.at(p, n);
    const dust = 0.3 * smoothstep(0.2, 0.95, n.y) * noise(p, 0.03, 9);
    return mix(base, SHELL_LIGHT, dust);
  });
  const belly = mottle(SKIN, SKIN_D, { size: 0.025, seed: 2 });
  const legPaint = scales([SKIN_D, "#b47c6f", "#c69385"], "#7f5448", { size: 0.0065, width: 0.18, seed: 5 });
  const headPaint = paint((p, n) => {
    const s = scales([SKIN, "#cf9a8c"], "#8d5e52", { size: 0.0075, seed: 8 }).at(p, n);
    return mix(s, "#e4bfb2", 0.25 * smoothstep(0.0, -0.8, n.y));
  });
  const shieldPaint = scales([SHELL_B, SHELL_A, SHELL_LIGHT], GROOVE, { size: 0.007, width: 0.22, seed: 12 });
  const jawPaint = mottle("#dcaea2", "#cf9d90", { size: 0.012, seed: 4 });

  const bandPaint = (cy: number, zc: number, seed: number): Paint =>
    paint((p, n) => {
      const phi = Math.atan2(p.x, p.y - cy) / D + 200;
      const f = (phi / 8.5) % 1;
      const id = Math.floor(phi / 8.5);
      const dz = p.z - zc;
      let c = mix(SHELL_A, SHELL_B, noise(p, 0.02, seed));
      c = mix(c, SHELL_LIGHT, 0.45 * smoothstep(-0.006, 0.006, dz) + ((id * 37) % 5) / 25);
      if (f < 0.1 || f > 0.9) c = mix(c, GROOVE, 0.7);
      if (Math.abs(dz) > 0.0055) c = mix(c, GROOVE, 0.45);
      return mix(c, SHELL_LIGHT, 0.2 * smoothstep(0.5, 1, n.y));
    });

  const tailPaint = paint((p, n, s) => {
    const t = s[0];
    const deg = s[1];
    const rings = t * 15;
    const f = rings % 1;
    const k = Math.floor(rings);
    const tile = (deg / 24 + (k % 2) * 0.5) % 1;
    let c = mix(SHELL_A, SHELL_B, noise(p, 0.015, 7));
    c = mix(c, SHELL_LIGHT, 0.35 * f);
    if (tile < 0.08) c = mix(c, GROOVE, 0.6);
    if (f > 0.86) c = mix(c, GROOVE, 0.8);
    if (n.y < -0.4) c = mix(c, SKIN_D, 0.4);
    return c;
  });

  const earPaint = paint((p, n, s) => {
    const inner = Math.abs(s[0]) < 0.0095 && s[1] > 0.008 && s[1] < 0.048;
    let c = mix(inner ? "#a46f64" : "#7c574c", "#6a463c", 0.3 * noise(p, 0.01, 3));
    if (Math.sin(s[1] * 700) > 0.75) c = mix(c, "#5a3a31", 0.5);
    return c;
  });

  // ---------------- skeleton ----------------
  const pelvis = b.joint("pelvis", { at: [0, 0.135, -0.13] });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.14, -0.12],
      [0, 0.145, -0.02],
      [0, 0.135, 0.1],
    ]),
    { parent: pelvis, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    polyline([
      [0, 0.135, 0.1],
      [0, 0.14, 0.155],
      [0, 0.12, 0.29],
    ]),
    { parent: "chest", names: ["neck", "head", "snout"], role: "neck" },
  );
  const jaw = b.joint("jaw", { at: [0, 0.118, 0.165], aim: [0, 0.104, 0.27], parent: "head", role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.12, -0.15],
      [0, 0.105, -0.26],
      [0, 0.08, -0.37],
      [0, 0.052, -0.48],
    ]),
    { parent: pelvis, count: 6, names: (i) => `tail${i + 1}`, role: "tail" },
  );

  // ---------------- body ----------------
  const body = b.loft(
    ZS.map((z, i) => ({ at: [0, CY[i], z], w: RX[i] * 2, h: RY[i] * 2 })),
    {
      color: belly,
      sectors: [[-115, 115, shellPaint, 0, 0.86] as const],
      bone: [spine, neck],
      sides: 12,
      name: "body",
    },
  );

  // shell skirt rims
  for (const a of [113, -113]) {
    b.sweep(body.line(a, 0.001), 0.0038, {
      color: RIM,
      bone: [spine, neck],
      from: 0.03,
      to: 0.84,
      sides: 5,
      name: a > 0 ? "skirtRimR" : "skirtRimL",
    });
  }

  // nine bands + overlap lips
  for (let i = 0; i < 9; i++) {
    const zc = -0.075 + i * 0.0155;
    const rx = lin(RX, zc);
    const ry = lin(RY, zc);
    const cy = lin(CY, zc);
    const bone = zc < -0.02 ? "spine1" : "spine2";
    b.extrude(arch(rx, ry, 0.0045, -0.004), {
      color: bandPaint(cy, zc, i * 3 + 1),
      at: [0, cy, zc],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.013,
      bevel: 0.002,
      bone,
      name: `band${i + 1}`,
    });
    b.extrude(arch(rx, ry, 0.0068, 0.0015), {
      color: "#a87a66",
      at: [0, cy, zc - 0.006],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.004,
      bevel: 0.001,
      bone,
      name: `bandLip${i + 1}`,
    });
  }
  // shield borders front and rear
  for (const [zc, bone] of [
    [0.118, "neck"],
    [-0.158, "spine1"],
  ] as const) {
    const rx = lin(RX, zc);
    const ry = lin(RY, zc);
    const cy = lin(CY, zc);
    b.extrude(arch(rx, ry, 0.004, -0.003, 112), {
      color: RIM,
      at: [0, cy, zc],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.006,
      bevel: 0.0015,
      bone,
    });
  }

  // raised studs on the scapular and pelvic shields
  const bodySurf = b.surface(body);
  const studGeo = new THREE.CylinderGeometry(0.0045, 0.0056, 0.0026, 6);
  bodySurf
    .scatter(70, {
      rng: rng(21),
      minDist: 0.012,
      filter: (h) =>
        h.n.y > 0.15 && (h.at.z > 0.068 || h.at.z < -0.09) && h.at.z < 0.13 && h.at.z > -0.168,
    })
    .forEach((h, i) => {
      b.stick(studGeo, i % 3 === 0 ? "#cfa891" : "#dcb9a2", h, { embed: 0.4, spin: R() * 60, flat: true });
    });

  // ---------------- tail ----------------
  b.sweep(tail, {
    radius: (t) => 0.003 + 0.024 * Math.pow(1 - t, 1.1),
    color: tailPaint,
    caps: { start: "round", end: "point" },
    sides: 9,
    name: "tail",
  });

  // ---------------- head ----------------
  b.loft(
    [
      { at: [0, 0.14, 0.15], w: 0.07, h: 0.065 },
      { at: [0, 0.14, 0.19], w: 0.06, h: 0.055 },
      { at: [0, 0.128, 0.235], w: 0.035, h: 0.032 },
      { at: [0, 0.118, 0.28], w: 0.018, h: 0.016 },
    ],
    { color: headPaint, bone: "head", sides: 10, name: "skull" },
  );
  b.loft(
    [
      { at: [0, 0.115, 0.17], w: 0.045, h: 0.025 },
      { at: [0, 0.108, 0.23], w: 0.025, h: 0.016 },
      { at: [0, 0.104, 0.27], w: 0.012, h: 0.01 },
    ],
    { color: jawPaint, bone: jaw, sides: 8, name: "lowerJaw" },
  );
  // bony head shield
  b.part(new THREE.SphereGeometry(1, 10, 6), shieldPaint, {
    at: [0, 0.158, 0.195],
    bone: "head",
    rotation: [14, 0, 0],
    scale: [0.028, 0.01, 0.045],
    name: "headShield",
  });
  // nose pad
  b.part(new THREE.SphereGeometry(0.009, 8, 6), "#4b302b", {
    at: [0, 0.119, 0.285],
    bone: "head",
    scale: [1, 0.85, 0.7],
    name: "nose",
  });

  // eyes
  const eyeGeo = new THREE.SphereGeometry(0.0055, 8, 6);
  const glintGeo = new THREE.SphereGeometry(0.0016, 5, 4);
  const lidGeo = new THREE.TorusGeometry(0.0062, 0.0015, 4, 10);
  for (const side of [1, -1]) {
    const e = new THREE.Vector3(0.025 * side, 0.145, 0.198);
    b.part(eyeGeo, "#140c0a", { at: e, bone: "head", name: side > 0 ? "eyeL" : "eyeR" });
    b.part(glintGeo, "#ffffff", { at: [e.x + side * 0.003, e.y + 0.003, e.z + 0.0035], bone: "head" });
    b.part(lidGeo, "#6d4a40", { at: e, bone: "head", dir: [side, 0.1, 0.35], axis: "z" });
  }

  // ears
  const EAR: [number, number][] = [
    [-0.008, 0],
    [0.008, 0],
    [0.015, 0.018],
    [0.016, 0.034],
    [0.011, 0.05],
    [0, 0.058],
    [-0.011, 0.05],
    [-0.016, 0.034],
    [-0.014, 0.018],
  ];
  for (const side of [1, -1]) {
    const S = side > 0 ? "L" : "R";
    const dir = [0.5 * side, 1, -0.3];
    const ear = b.joint(`ear${S}`, { at: [0.02 * side, 0.163, 0.16], dir, parent: "head" });
    b.extrude(EAR, {
      color: earPaint,
      at: ear,
      x: [0, 0.25, 1],
      y: dir,
      thickness: 0.003,
      bevel: 0.001,
      smoothing: 1,
      bone: ear,
      name: `ear${S}`,
    });
  }

  // ---------------- legs ----------------
  const legSweeps: Sweep[] = [];
  for (const front of [true, false])
    for (const side of [1, -1]) {
      const S = side > 0 ? "L" : "R";
      const x = side * (front ? 0.066 : 0.07);
      const pts = front
        ? [
            [x, 0.11, 0.1],
            [x, 0.062, 0.092],
            [x, 0.024, 0.11],
            [x, 0.01, 0.14],
          ]
        : [
            [x, 0.12, -0.11],
            [x, 0.07, -0.085],
            [x, 0.022, -0.115],
            [x, 0.012, -0.07],
          ];
      const names = front
        ? [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`]
        : [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`];
      const ch = b.chain(front ? `arm${S}` : `leg${S}`, polyline(pts), {
        parent: front ? "spine2" : "spine1",
        names,
        role: "leg",
      });
      legSweeps.push(
        b.sweep(ch, {
          radius: front ? [0.022, 0.016, 0.012, 0.009] : [0.026, 0.018, 0.013, 0.01],
          color: legPaint,
          sides: 8,
        }),
      );
      // toes and claws
      const wrist = names[2];
      const nT = front ? 4 : 5;
      const spread = front ? 0.0075 : 0.007;
      for (let i = 0; i < nT; i++) {
        const dx = (i - (nT - 1) / 2) * spread;
        const a = front ? [x + dx, 0.011, 0.132] : [x + dx, 0.011, -0.08];
        const e = front ? [x + dx * 1.4, 0.007, 0.152] : [x + dx * 1.4, 0.007, -0.062];
        b.capsule(a, e, 0.004, { color: TOE, bone: wrist, sides: 6 });
        const mid = Math.abs(i - (nT - 1) / 2) < 1;
        const len = front ? (mid ? 0.022 : 0.015) : mid ? 0.012 : 0.009;
        b.spike(e, front ? [0, -0.45, 1] : [0, -0.35, 1], len, 0.0035, { color: CLAW, bone: wrist, sides: 5 });
      }
    }

  // ---------------- coarse pale hairs ----------------
  const hairTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 128">
      <path d="M8 128 C7 90 10 50 7 2" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M5 128 C4 100 3 70 2 40" stroke="#d8d8d8" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M11 128 C12 104 13 84 14 62" stroke="#e8e8e8" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
  const hairFrames = [];
  for (let i = 0; i < 8; i++) {
    const zg = -0.075 + i * 0.0155 + 0.00775;
    const rx = lin(RX, zg);
    const ry = lin(RY, zg);
    const cy = lin(CY, zg);
    for (let k = 0; k < 5; k++) {
      const a = (-95 + R() * 190) * D;
      const at = [(rx + 0.003) * Math.sin(a), cy + (ry + 0.003) * Math.cos(a), zg];
      const dir = [Math.sin(a) / rx, Math.cos(a) / ry, 0];
      hairFrames.push(frame(at, dir));
    }
  }
  b.cards(hairFrames, hairTex, {
    size: [0.005, 0.024],
    lean: 25,
    flow: [0, 0, -1],
    bend: 25,
    vary: 0.3,
    spin: 25,
    rng: rng(11),
    color: "#efe3cf",
    sink: 0.15,
    name: "bandHairs",
  });
  const bellyHits = bodySurf.scatter(40, { rng: rng(4), minDist: 0.012, filter: (h) => h.n.y < -0.35 });
  b.cards(bellyHits, hairTex, {
    size: [0.005, 0.02],
    lean: 30,
    flow: [0, -0.4, -1],
    bend: 20,
    vary: 0.3,
    spin: 30,
    rng: rng(13),
    color: "#f3e8d8",
    name: "bellyHairs",
  });
  const legHits = b
    .surface(legSweeps)
    .scatter(28, { rng: rng(17), minDist: 0.01, filter: (h) => h.at.y > 0.035 && h.n.y > -0.4 });
  b.cards(legHits, hairTex, {
    size: [0.004, 0.016],
    lean: 35,
    flow: [0, -1, -0.2],
    bend: 15,
    vary: 0.3,
    rng: rng(19),
    color: "#efe3cf",
    name: "legHairs",
  });

  return b.root;
}
```