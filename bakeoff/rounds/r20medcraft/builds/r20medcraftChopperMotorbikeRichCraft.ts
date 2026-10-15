import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { catmull } from "../../../../src/path";
import { mix, mottle, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Chopper Motorbike",
  description:
    "Custom V-twin chopper: raked springer-style fork, apehanger bars, teardrop tank with racing stripe decals, belt drive, drag pipes and cast wheels, in a clean polished sci-fi look with one orange accent.",
  style: "Overwatch",
  commit: "88fc1f0",
};

type P = [number, number, number];

const GUN = "#2b3240";
const GUN2 = "#434d61";
const STEEL = "#9aa6b8";
const STEEL_D = "#5d6879";
const CHROME = "#dfe7f2";
const BLACK = "#12141a";
const RUBBER = "#1c1e24";
const TREAD = "#2b2e37";
const ORANGE = "#ff7a18";
const ORANGE_D = "#d4560a";
const CREAM = "#f5efe2";
const NAVY = "#1a2236";
const LEATHER = "#5a3626";
const GLASS = "#8fd0ee";
const LAMP = "#fff3c4";
const RED = "#ff3b2a";
const EMBER = "#ffa040";

// Paint: light facing up, shaded facing down.
const lit = (base: string, dark: string) => paint((_p, n) => mix(dark, base, smoothstep(-0.7, 0.6, n.y)));

const TANK_PAINT = paint((p, n) => {
  const w = Math.abs(p.x);
  if (n.y > 0.5 && w < 0.02) return CREAM;
  if (n.y > 0.45 && w < 0.034) return NAVY;
  return mix(ORANGE_D, ORANGE, smoothstep(-0.8, 0.5, n.y));
});
const FENDER_PAINT = paint((p, n) => {
  const w = Math.abs(p.x);
  if (n.y > 0.3 && w < 0.012) return CREAM;
  if (n.y > 0.3 && w < 0.024) return NAVY;
  return mix(ORANGE_D, ORANGE, smoothstep(-0.8, 0.5, n.y));
});
const SEAT_PAINT = paint((p, n) => {
  const base = mix("#33201a", LEATHER, smoothstep(-0.6, 0.8, n.y));
  if (n.y > 0.2 && Math.sin(p.z * 55) > 0.9) return mix(base, "#000000", 0.35);
  if (n.y > 0.3 && Math.abs(p.x) < 0.006) return ORANGE;
  if (Math.abs(p.x) > 0.115 && n.y < 0.5) return ORANGE_D;
  return base;
});
const ENG = mottle(lit(GUN2, GUN), lit(STEEL_D, GUN), { size: 0.05, contrast: 0.7, seed: 3 });
const COVER = lit(ORANGE, ORANGE_D);
const FRAME_PAINT = lit(GUN2, "#181c26");

const DISC_TEX = (() => {
  let holes = "";
  for (const [r, n] of [
    [22, 10],
    [32, 14],
    [41, 18],
  ] as Array<[number, number]>)
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + r;
      holes += `<circle cx="${50 + r * Math.cos(a)}" cy="${50 + r * Math.sin(a)}" r="2.4" fill="#2a3040"/>`;
    }
  return svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="#aab4c4"/><circle cx="50" cy="50" r="49" fill="none" stroke="#5d6879" stroke-width="3"/><circle cx="50" cy="50" r="15" fill="#3b4558"/>${holes}<circle cx="50" cy="50" r="7" fill="#aab4c4"/></svg>`,
    { size: 128 },
  );
})();

const TANK_DECAL = svg(
  `<svg viewBox="0 0 120 56">
  <path d="M4 38 L72 9 L118 3 L86 22 L40 44 Z" fill="#f5efe2" stroke="#1a2236" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M8 47 L76 18 L117 13 L92 28 L46 50 Z" fill="#1a2236"/>
  <path d="M14 53 L80 28 L112 24 L98 35 L54 54 Z" fill="#ffd2a0" stroke="#1a2236" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="22" cy="22" r="15" fill="#f5efe2" stroke="#1a2236" stroke-width="2.5"/>
  <circle cx="22" cy="22" r="10" fill="#1a2236"/>
  <path d="M22 13 L25 20 L32 22 L25 24 L22 31 L19 24 L12 22 L19 20 Z" fill="#ff7a18"/>
</svg>`,
  { size: 256 },
);

const PLATE = svg(
  `<svg viewBox="0 0 120 60"><rect x="1" y="1" width="118" height="58" rx="6" fill="#f5efe2" stroke="#1a2236" stroke-width="3"/><rect x="6" y="6" width="108" height="8" fill="#ff7a18"/><text x="60" y="46" font-size="30" font-weight="700" font-family="sans-serif" text-anchor="middle" fill="#1a2236">CH-07</text></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "chopperMotorbike", detail: 0.8, paintSize: 1024 });
  type J = ReturnType<typeof b.joint>;

  // ---------------------------------------------------------------- skeleton
  const HEAD: P = [0, 0.98, 0.52];
  const FD: P = [0, -0.766, 0.643];
  const FX = 0.105;
  const forkAt = (t: number, x = 0): P => [x, HEAD[1] + FD[1] * t, HEAD[2] + FD[2] * t];
  const AXF = forkAt(0.81);
  const AXR: P = [0, 0.38, -0.95];

  const chassis = b.joint("chassis", { at: [0, 0.6, 0] });
  const steer = b.joint("steer", { parent: chassis, at: HEAD, dir: FD, role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: steer, at: AXF, dir: [1, 0, 0], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: chassis, at: AXR, dir: [1, 0, 0], role: "hinge" });
  const stand = b.joint("kickstand", {
    parent: chassis,
    at: [0.14, 0.34, -0.25],
    dir: [0.25, -0.2, -0.95],
    role: "hinge",
  });

  // ---------------------------------------------------------------- helpers
  const rod = (a: P, c: P, r: number | [number, number], col: Fill, bone: J) =>
    b.rod(a, c, r, col, { bone, sides: 6 });
  const tube = (pts: P[], r: number | ((t: number) => number), col: Fill, bone: J, sides = 8) =>
    b.sweep(catmull(pts), r, col, { bone, sides });
  const cyl = (at: P, dir: P, rt: number, rb: number, len: number, col: Fill, bone: J, sides = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, len, sides), col, { bone, at, dir });
  const box = (at: P, size: P, col: Fill, bone: J, dir?: P) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), col, dir ? { bone, at, dir } : { bone, at });
  const bolt = (at: P, dir: P, bone: J, r = 0.011, col: Fill = STEEL) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.01, 6), col, { bone, at, dir });
  const boltRingX = (c: P, sx: number, r: number, n: number, bone: J, col: Fill = STEEL) => {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      bolt([c[0], c[1] + r * Math.cos(a), c[2] + r * Math.sin(a)], [sx, 0, 0], bone, 0.009, col);
    }
  };
  const ball = (at: P, r: number, col: Fill, bone: J) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { bone, at });

  // ---------------------------------------------------------------- wheels
  const wheel = (
    j: J,
    c: P,
    Rt: number,
    tubeR: number,
    sz: number,
    rimR: number,
    hubR: number,
    spokes: number,
    blocks: number,
    hubLen: number,
  ) => {
    const cy = c[1];
    const cz = c[2];
    b.part(new THREE.TorusGeometry(Rt, tubeR, 8, 28), RUBBER, { bone: j, at: c, rotation: [0, 90, 0], scale: [1, 1, sz] });
    const geos: THREE.BufferGeometry[] = [];
    const rows: Array<[number, number]> = [
      [0, 0],
      [1, 52],
      [-1, 52],
    ];
    const X = new THREE.Vector3(1, 0, 0);
    const Z = new THREE.Vector3(0, 0, 1);
    for (let k = 0; k < blocks; k++) {
      const phi = (k / blocks) * Math.PI * 2;
      const qx = new THREE.Quaternion().setFromAxisAngle(X, phi);
      for (const [s, aDeg] of rows) {
        const a = (aDeg * Math.PI) / 180;
        const local = new THREE.Vector3(s * tubeR * sz * Math.sin(a), Rt + tubeR * Math.cos(a), 0);
        const q = qx.clone().multiply(new THREE.Quaternion().setFromAxisAngle(Z, -s * a));
        const pos = local.applyQuaternion(qx).add(new THREE.Vector3(0, cy, cz));
        const wdt = s === 0 ? 0.7 * tubeR * sz : 0.4 * tubeR * sz;
        geos.push(
          new THREE.BoxGeometry(wdt, 0.016, ((2 * Math.PI * Rt) / blocks) * 0.5).applyMatrix4(
            new THREE.Matrix4().compose(pos, q, new THREE.Vector3(1, 1, 1)),
          ),
        );
      }
    }
    b.part(mergeGeometries(geos)!, TREAD, { bone: j, at: [0, 0, 0] });
    // sidewall stripe
    const sx = sz * Math.sqrt(tubeR * tubeR - 0.03 * 0.03) + 0.002;
    for (const s of [1, -1])
      b.part(new THREE.RingGeometry(Rt - 0.036, Rt - 0.026, 28), CREAM, {
        bone: j,
        at: [s * sx, cy, cz],
        dir: [s, 0, 0],
        axis: "z",
      });
    // rim
    b.part(new THREE.TorusGeometry(rimR, 0.016, 6, 28), STEEL, { bone: j, at: c, rotation: [0, 90, 0], scale: [1, 1, 2.6] });
    b.part(new THREE.TorusGeometry(rimR - 0.018, 0.009, 6, 28), ORANGE, {
      bone: j,
      at: c,
      rotation: [0, 90, 0],
      scale: [1, 1, 3.4],
    });
    for (let k = 0; k < spokes; k++) {
      const a = (k / spokes) * Math.PI * 2 + 0.2;
      const p0: P = [0, cy + hubR * Math.cos(a), cz + hubR * Math.sin(a)];
      const p1: P = [0, cy + (rimR - 0.01) * Math.cos(a), cz + (rimR - 0.01) * Math.sin(a)];
      b.part(new THREE.BoxGeometry(0.05, rimR - 0.01 - hubR, 0.018), GUN2, {
        bone: j,
        at: [0, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2],
        dir: [0, p1[1] - p0[1], p1[2] - p0[2]],
      });
    }
    cyl(c, [1, 0, 0], hubR, hubR, hubLen, STEEL, j, 12);
    cyl(c, [1, 0, 0], hubR * 0.62, hubR * 0.62, hubLen + 0.03, ORANGE, j, 8);
    boltRingX([hubLen / 2 + 0.002, cy, cz], 1, hubR * 0.85, 5, j, CHROME);
    boltRingX([-hubLen / 2 - 0.002, cy, cz], -1, hubR * 0.85, 5, j, CHROME);
  };

  wheel(wheelF, AXF, 0.275, 0.085, 0.75, 0.2, 0.05, 5, 30, 0.13);
  wheel(wheelR, AXR, 0.265, 0.115, 1.1, 0.175, 0.055, 6, 30, 0.17);

  // brake discs
  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.15, 22), "#ffffff", {
      bone: wheelF,
      at: [s * 0.053, AXF[1], AXF[2]],
      dir: [s, 0, 0],
      axis: "z",
      texture: DISC_TEX,
    });
  }
  b.part(new THREE.CircleGeometry(0.13, 22), "#ffffff", {
    bone: wheelR,
    at: [-0.198, AXR[1], AXR[2]],
    dir: [-1, 0, 0],
    axis: "z",
    texture: DISC_TEX,
  });
  b.part(new THREE.CircleGeometry(0.13, 22), "#ffffff", {
    bone: wheelR,
    at: [-0.196, AXR[1], AXR[2]],
    dir: [1, 0, 0],
    axis: "z",
    texture: DISC_TEX,
  });
  // axles
  cyl(AXF, [1, 0, 0], 0.017, 0.017, 0.27, STEEL_D, wheelF, 8);
  cyl(AXR, [1, 0, 0], 0.02, 0.02, 0.5, STEEL_D, wheelR, 8);
  for (const s of [1, -1]) {
    cyl([s * 0.14, AXF[1], AXF[2]], [s, 0, 0], 0.03, 0.03, 0.01, CHROME, wheelF, 6);
    cyl([s * 0.252, AXR[1], AXR[2]], [s, 0, 0], 0.032, 0.032, 0.012, CHROME, wheelR, 6);
  }

  // ---------------------------------------------------------------- front fork and steering
  for (const s of [1, -1]) {
    const x = s * FX;
    rod(forkAt(-0.02, x), forkAt(0.47, x), 0.019, CHROME, steer);
    rod(forkAt(0.44, x), forkAt(0.81, x), 0.026, FRAME_PAINT, steer);
    cyl(forkAt(0.5, x), FD, 0.032, 0.032, 0.06, ORANGE_D, steer, 8);
    cyl(forkAt(0.8, x), FD, 0.03, 0.03, 0.03, STEEL, steer, 8);
    ball(forkAt(-0.03, x), 0.022, CHROME, steer);
    // fender brackets
    const ang = (deg: number): P => {
      const a = (deg * Math.PI) / 180;
      return [0, AXF[1] + 0.44 * Math.cos(a), AXF[2] + 0.44 * Math.sin(a)];
    };
    const f1 = ang(-35);
    const f2 = ang(40);
    rod([s * 0.07, f1[1], f1[2]], forkAt(0.42, x), 0.009, STEEL, steer);
    rod([s * 0.066, f2[1], f2[2]], [x, AXF[1] + 0.03, AXF[2] - 0.03], 0.008, STEEL, steer);
    // caliper
    if (s > 0) {
      box([0.082, AXF[1] - 0.06, AXF[2] - 0.11], [0.05, 0.07, 0.045], ORANGE, steer);
      bolt([0.108, AXF[1] - 0.06, AXF[2] - 0.11], [1, 0, 0], steer, 0.01, CHROME);
    }
  }
  // triple trees
  box(forkAt(-0.06), [0.28, 0.035, 0.075], FRAME_PAINT, steer, FD);
  box(forkAt(0.085), [0.27, 0.035, 0.075], FRAME_PAINT, steer, FD);
  rod(forkAt(-0.1), forkAt(0.12), 0.034, STEEL_D, steer);
  cyl(forkAt(-0.095), FD, 0.045, 0.04, 0.03, ORANGE, steer, 10);
  for (const s of [1, -1]) boltRingX([s * 0.15, 0, 0], s, 0.0, 0, steer);

  // front fender
  const fenderPts: P[] = [-35, -10, 15, 40, 65].map((d) => {
    const a = (d * Math.PI) / 180;
    return [0, AXF[1] + 0.44 * Math.cos(a), AXF[2] + 0.44 * Math.sin(a)] as P;
  });
  b.sweep(catmull(fenderPts), () => [0.07, 0.012], FENDER_PAINT, { bone: steer, sides: 8 });

  // headlight
  const HL: P = [0, 0.88, 0.7];
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.09, 0.05],
      [0.095, 0.12],
      [0, 0.12],
    ],
    { at: HL, axis: [0, 0, 1], bone: steer, color: FRAME_PAINT, segments: 14 },
  );
  b.part(new THREE.TorusGeometry(0.093, 0.011, 6, 18), ORANGE, { bone: steer, at: [0, 0.88, 0.822] });
  b.part(new THREE.TorusGeometry(0.083, 0.006, 6, 18), CHROME, { bone: steer, at: [0, 0.88, 0.826] });
  glow(
    b.part(new THREE.CircleGeometry(0.081, 16), LAMP, { bone: steer, at: [0, 0.88, 0.824], dir: [0, 0, 1], axis: "z" }),
    1.3,
  );
  for (const s of [1, -1]) {
    rod([s * 0.09, 0.9, 0.7], forkAt(0.12, s * FX), 0.012, STEEL, steer);
    ball([s * 0.095, 0.88, 0.74], 0.016, CHROME, steer);
  }

  // handlebars (apehangers), grips, levers, mirrors, cables
  for (const s of [1, -1]) {
    const name = s > 0 ? "L" : "R";
    tube(
      [
        [s * 0.05, 1.03, 0.47],
        [s * 0.1, 1.08, 0.46],
        [s * 0.2, 1.19, 0.43],
        [s * 0.28, 1.25, 0.37],
        [s * 0.33, 1.26, 0.28],
        [s * 0.35, 1.26, 0.2],
      ],
      0.013,
      CHROME,
      steer,
      6,
    );
    const grip = b.joint(`grip${name}`, { parent: steer, at: [s * 0.355, 1.26, 0.2], dir: [0, 0, -1], role: "hinge" });
    cyl([s * 0.355, 1.26, 0.13], [0, 0, 1], 0.021, 0.021, 0.14, RUBBER, grip, 8);
    for (const dz of [0.09, 0.13, 0.17]) cyl([s * 0.355, 1.26, dz], [0, 0, 1], 0.023, 0.023, 0.012, ORANGE_D, grip, 8);
    cyl([s * 0.355, 1.26, 0.057], [0, 0, 1], 0.017, 0.017, 0.012, CHROME, grip, 8);
    // lever
    const lever = b.joint(`lever${name}`, { parent: steer, at: [s * 0.335, 1.25, 0.25], dir: [0, -0.25, 1], role: "hinge" });
    rod([s * 0.335, 1.25, 0.25], [s * 0.325, 1.225, 0.38], [0.009, 0.006], CHROME, lever);
    ball([s * 0.325, 1.222, 0.388], 0.012, ORANGE, lever);
    box([s * 0.335, 1.262, 0.27], [0.05, 0.035, 0.07], GUN, steer);
    bolt([s * 0.335, 1.282, 0.27], [0, 1, 0], steer, 0.009, CHROME);
    // mirror
    rod([s * 0.31, 1.27, 0.3], [s * 0.345, 1.41, 0.27], 0.006, CHROME, steer);
    b.part(new THREE.SphereGeometry(1, 10, 6), CHROME, {
      bone: steer,
      at: [s * 0.345, 1.43, 0.27],
      scale: [0.062, 0.045, 0.012],
    });
    b.part(new THREE.SphereGeometry(1, 10, 6), GLASS, {
      bone: steer,
      at: [s * 0.345, 1.43, 0.261],
      scale: [0.054, 0.038, 0.008],
    });
    // cable
    tube(
      [
        [s * 0.325, 1.235, 0.37],
        [s * 0.22, 1.19, 0.5],
        [s * 0.09, 1.05, 0.56],
        [s * 0.04, 0.97, 0.52],
      ],
      0.005,
      BLACK,
      steer,
      5,
    );
  }
  // risers clamp, speedo
  box([0, 1.045, 0.47], [0.14, 0.03, 0.05], FRAME_PAINT, steer);
  rod([0, 1.04, 0.47], [0, 1.09, 0.44], 0.01, STEEL, steer);
  const SP: P = [0, 1.11, 0.43];
  const spd: P = [0, 0.6, -0.8];
  cyl(SP, spd, 0.046, 0.046, 0.04, FRAME_PAINT, steer, 12);
  b.part(new THREE.TorusGeometry(0.046, 0.006, 6, 14), ORANGE, {
    bone: steer,
    at: [SP[0], SP[1] + 0.012, SP[2] - 0.0165],
    dir: spd,
    axis: "z",
  });
  glow(
    b.part(new THREE.CircleGeometry(0.039, 14), EMBER, {
      bone: steer,
      at: [SP[0], SP[1] + 0.0125, SP[2] - 0.0175],
      dir: spd,
      axis: "z",
    }),
    1.1,
  );

  // ---------------------------------------------------------------- frame
  tube(
    [
      [0, 0.99, 0.5],
      [0, 0.93, 0.1],
      [0, 0.87, -0.2],
      [0, 0.83, -0.48],
    ],
    0.03,
    FRAME_PAINT,
    chassis,
  );
  tube(
    [
      [0, 0.92, 0.55],
      [0, 0.68, 0.45],
      [0, 0.46, 0.32],
    ],
    0.03,
    FRAME_PAINT,
    chassis,
  );
  for (const s of [1, -1]) {
    tube(
      [
        [0, 0.46, 0.32],
        [s * 0.1, 0.34, 0.2],
        [s * 0.1, 0.33, -0.2],
        [s * 0.12, 0.35, -0.6],
        [s * 0.175, 0.38, -0.95],
      ],
      0.022,
      FRAME_PAINT,
      chassis,
      6,
    );
    tube(
      [
        [s * 0.07, 0.82, -0.5],
        [s * 0.15, 0.62, -0.7],
        [s * 0.175, 0.38, -0.95],
      ],
      0.018,
      FRAME_PAINT,
      chassis,
      6,
    );
    box([s * 0.178, AXR[1], AXR[2]], [0.014, 0.1, 0.14], GUN2, chassis);
    bolt([s * 0.186, AXR[1] + 0.03, AXR[2] + 0.04], [s, 0, 0], chassis, 0.012, CHROME);
    bolt([s * 0.186, AXR[1] - 0.03, AXR[2] - 0.04], [s, 0, 0], chassis, 0.012, CHROME);
    // engine mount plates
    box([s * 0.12, 0.42, 0.28], [0.014, 0.14, 0.12], GUN2, chassis);
  }
  rod([0, 0.82, -0.5], [0, 0.55, -0.6], 0.018, FRAME_PAINT, chassis);
  rod([-0.1, 0.35, -0.6], [0.1, 0.35, -0.6], 0.014, FRAME_PAINT, chassis);
  cyl([0, 0.84, -0.32], [1, 0, 0], 0.02, 0.02, 0.2, FRAME_PAINT, chassis, 6);

  // fuel tank
  const tank = b.loft(
    [
      { at: [0, 1.07, 0.34], w: 0.1, h: 0.1 },
      { at: [0, 1.1, 0.24], w: 0.28, h: 0.22 },
      { at: [0, 1.1, 0.05], w: 0.32, h: 0.26 },
      { at: [0, 1.07, -0.12], w: 0.26, h: 0.22 },
      { at: [0, 1.04, -0.22], w: 0.14, h: 0.14 },
    ],
    { bone: chassis, color: TANK_PAINT, sides: 10 },
  );
  for (const s of [1, -1])
    b.decal(tank, TANK_DECAL, { at: [s * 0.16, 1.08, 0.08], dir: [s, 0, 0], size: [0.32, 0.15], mirror: s < 0 });
  cyl([0, 1.225, 0.14], [0, 1, 0], 0.036, 0.04, 0.022, CHROME, chassis, 10);
  cyl([0, 1.238, 0.14], [0, 1, 0], 0.022, 0.022, 0.012, ORANGE, chassis, 8);
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.78;
    bolt([0.03 * Math.cos(a), 1.236, 0.14 + 0.03 * Math.sin(a)], [0, 1, 0], chassis, 0.005, CHROME);
  }
  for (const z of [0.2, -0.05]) box([0, 0.94, z], [0.05, 0.03, 0.05], GUN, chassis);

  // seat
  b.loft(
    [
      { at: [0, 0.885, -0.08], w: 0.16, h: 0.05 },
      { at: [0, 0.87, -0.28], w: 0.27, h: 0.07 },
      { at: [0, 0.87, -0.48], w: 0.25, h: 0.07 },
      { at: [0, 0.89, -0.62], w: 0.14, h: 0.05 },
    ],
    { bone: chassis, color: SEAT_PAINT, sides: 10 },
  );
  box([0, 0.835, -0.34], [0.2, 0.012, 0.5], GUN, chassis);
  for (const s of [1, -1]) {
    cyl([s * 0.08, 0.85, -0.1], [0, 1, 0], 0.016, 0.016, 0.04, STEEL, chassis, 6);
  }

  // sissy bar and pad
  tube(
    [
      [0.1, 0.82, -0.52],
      [0.12, 0.98, -0.64],
      [0.1, 1.16, -0.74],
      [0.04, 1.24, -0.77],
      [-0.04, 1.24, -0.77],
      [-0.1, 1.16, -0.74],
      [-0.12, 0.98, -0.64],
      [-0.1, 0.82, -0.52],
    ],
    0.012,
    CHROME,
    chassis,
    6,
  );
  b.part(new THREE.BoxGeometry(0.2, 0.12, 0.05), LEATHER, { bone: chassis, at: [0, 1.06, -0.69], rotation: [-15, 0, 0] });
  b.part(new THREE.BoxGeometry(0.205, 0.012, 0.055), ORANGE_D, { bone: chassis, at: [0, 1.12, -0.7], rotation: [-15, 0, 0] });

  // rear fender, tail light, plate
  const rearPts: P[] = [-62, -35, -10, 15, 40].map((d) => {
    const a = (d * Math.PI) / 180;
    return [0, AXR[1] + 0.45 * Math.cos(a), AXR[2] + 0.45 * Math.sin(a)] as P;
  });
  b.sweep(catmull(rearPts), () => [0.135, 0.013], FENDER_PAINT, { bone: chassis, sides: 8 });
  for (const s of [1, -1]) {
    rod([s * 0.1, 0.82, -0.6], [s * 0.12, 0.72, -0.66], 0.008, STEEL, chassis);
  }
  glow(box([0, 0.585, -1.372], [0.12, 0.04, 0.05], RED, chassis), 1.4);
  box([0, 0.5, -1.383], [0.17, 0.09, 0.008], NAVY, chassis);
  b.part(new THREE.PlaneGeometry(0.16, 0.08), "#ffffff", {
    bone: chassis,
    at: [0, 0.5, -1.389],
    dir: [0, 0, -1],
    axis: "z",
    texture: PLATE,
  });
  rod([0, 0.585, -1.355], [0, 0.52, -1.38], 0.008, STEEL, chassis);

  // ---------------------------------------------------------------- engine
  const CR: P = [0, 0.4, 0.05];
  frustumCase();
  function frustumCase() {
    b.frustumBox([0, 0.4, 0.22], [0, 0.4, -0.12], [0.22, 0.2], [0.24, 0.22], { bone: chassis, color: ENG });
    b.frustumBox([0, 0.38, -0.12], [0, 0.38, -0.38], [0.24, 0.2], [0.2, 0.18], { bone: chassis, color: ENG });
    b.frustumBox([0, 0.27, 0.12], [0, 0.27, -0.28], [0.15, 0.06], [0.15, 0.06], { bone: chassis, color: GUN });
  }
  for (const sgn of [1, -1]) {
    const d: P = [0, 0.866, 0.5 * sgn];
    const pt = (t: number, x = 0): P => [x, CR[1] + d[1] * t, CR[2] + d[2] * t];
    cyl(pt(0.2), d, 0.07, 0.07, 0.2, ENG, chassis, 10);
    for (let k = 0; k < 7; k++) cyl(pt(0.12 + k * 0.03), d, 0.098, 0.098, 0.011, lit(STEEL, STEEL_D), chassis, 12);
    box(pt(0.34), [0.17, 0.1, 0.17], ENG, chassis, d);
    box(pt(0.405), [0.12, 0.04, 0.12], COVER, chassis, d);
    for (const [bx, bz] of [
      [0.045, 0.045],
      [-0.045, 0.045],
      [0.045, -0.045],
      [-0.045, -0.045],
    ])
      bolt([bx, pt(0.427)[1] + bz * d[2] * -0.0, pt(0.427)[2]], d, chassis, 0.008, CHROME);
    for (const s of [1, -1]) {
      const pp = pt(0.34, s * 0.12);
      cyl(pp, [s, 0, 0], 0.011, 0.011, 0.06, CREAM, chassis, 6);
      cyl([pp[0] + s * 0.04, pp[1], pp[2]], [s, 0, 0], 0.007, 0.007, 0.03, BLACK, chassis, 5);
    }
  }
  // primary cover on the left, with bolts and glowing accent
  cyl([0.145, 0.4, -0.05], [1, 0, 0], 0.1, 0.1, 0.05, COVER, chassis, 14);
  cyl([0.175, 0.4, -0.05], [1, 0, 0], 0.05, 0.05, 0.012, GUN, chassis, 10);
  glow(
    b.part(new THREE.CircleGeometry(0.035, 10), EMBER, { bone: chassis, at: [0.1825, 0.4, -0.05], dir: [1, 0, 0], axis: "z" }),
    1.2,
  );
  boltRingX([0.172, 0.4, -0.05], 1, 0.078, 8, chassis, CHROME);
  // air cleaner on the right
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.115, 0.02],
      [0.11, 0.07],
      [0.08, 0.09],
      [0, 0.095],
    ],
    { at: [-0.1, 0.6, 0.05], axis: [-1, 0, 0], bone: chassis, color: CHROME, segments: 14 },
  );
  cyl([-0.2, 0.6, 0.05], [1, 0, 0], 0.035, 0.035, 0.012, ORANGE, chassis, 8);
  // oil tank, battery
  cyl([-0.1, 0.56, -0.42], [0, 1, 0], 0.065, 0.065, 0.22, COVER, chassis, 10);
  cyl([-0.1, 0.68, -0.42], [0, 1, 0], 0.025, 0.025, 0.02, CHROME, chassis, 6);
  box([0.12, 0.58, -0.42], [0.09, 0.18, 0.16], GUN, chassis);
  box([0.12, 0.675, -0.42], [0.095, 0.012, 0.165], ORANGE_D, chassis);
  // coil + plug wires
  box([0, 0.78, 0.04], [0.06, 0.05, 0.08], GUN2, chassis);
  for (const sgn of [1, -1])
    tube(
      [
        [0.11, 0.76 + (sgn > 0 ? 0 : 0), 0.04 + 0.18 * sgn],
        [0.09, 0.8, 0.05 + 0.05 * sgn],
        [0.03, 0.8, 0.04],
      ],
      0.005,
      BLACK,
      chassis,
      5,
    );

  // exhaust: two drag pipes down the right side
  const pipes: Array<{ pts: P[]; col: Fill }> = [
    {
      pts: [
        [-0.06, 0.66, 0.28],
        [-0.15, 0.6, 0.34],
        [-0.23, 0.5, 0.3],
        [-0.25, 0.38, 0.12],
        [-0.25, 0.37, -0.3],
        [-0.25, 0.38, -0.8],
        [-0.25, 0.4, -1.2],
      ],
      col: CHROME,
    },
    {
      pts: [
        [-0.06, 0.66, -0.18],
        [-0.15, 0.58, -0.25],
        [-0.2, 0.4, -0.27],
        [-0.21, 0.27, -0.32],
        [-0.21, 0.26, -0.7],
        [-0.21, 0.28, -1.1],
        [-0.21, 0.3, -1.2],
      ],
      col: STEEL,
    },
  ];
  for (const pipe of pipes) {
    const path = catmull(pipe.pts);
    b.sweep(path, (t) => 0.036 + 0.02 * smoothstep(0.78, 1, t), pipe.col, {
      bone: chassis,
      sides: 8,
      caps: { start: "flat", end: "flat" },
    });
    const end = pipe.pts[pipe.pts.length - 1];
    b.part(new THREE.CircleGeometry(0.052, 10), BLACK, {
      bone: chassis,
      at: [end[0], end[1], end[2] - 0.001],
      dir: [0, 0, -1],
      axis: "z",
    });
    glow(
      b.part(new THREE.TorusGeometry(0.057, 0.006, 5, 12), EMBER, { bone: chassis, at: [end[0], end[1], end[2] - 0.001] }),
      1.1,
    );
    b.along(path, 4, (at) => {
      b.part(new THREE.TorusGeometry(0.043, 0.007, 5, 10), STEEL_D, { bone: chassis, at, dir: at, axis: "z" });
    }, { from: 0.25, to: 0.7 });
  }

  // belt drive, pulleys
  const PX = 0.215;
  cyl([PX, 0.36, -0.3], [1, 0, 0], 0.05, 0.05, 0.05, STEEL, chassis, 14);
  cyl([0.18, 0.36, -0.3], [1, 0, 0], 0.025, 0.025, 0.08, STEEL_D, chassis, 8);
  cyl([PX, AXR[1], AXR[2]], [1, 0, 0], 0.105, 0.105, 0.03, STEEL, wheelR, 18);
  for (const dx of [-0.017, 0.017]) cyl([PX + dx, AXR[1], AXR[2]], [1, 0, 0], 0.115, 0.115, 0.006, STEEL_D, wheelR, 18);
  boltRingX([PX + 0.019, AXR[1], AXR[2]], 1, 0.07, 6, wheelR, CHROME);
  b.sweep(
    [
      [PX, 0.41, -0.3],
      [PX, 0.485, -0.95],
    ],
    () => [0.022, 0.006],
    BLACK,
    { bone: chassis, section: "box", caps: "flat" },
  );
  b.sweep(
    [
      [PX, 0.31, -0.3],
      [PX, 0.275, -0.95],
    ],
    () => [0.022, 0.006],
    BLACK,
    { bone: chassis, section: "box", caps: "flat" },
  );
  // rear caliper
  box([-0.19, AXR[1] + 0.02, AXR[2] + 0.13], [0.05, 0.07, 0.05], ORANGE, chassis);

  // ---------------------------------------------------------------- controls, pegs, stand
  for (const s of [1, -1]) {
    cyl([s * 0.21, 0.3, 0.5], [1, 0, 0], 0.02, 0.02, 0.12, RUBBER, chassis, 8);
    cyl([s * 0.275, 0.3, 0.5], [1, 0, 0], 0.025, 0.025, 0.012, ORANGE, chassis, 8);
    rod([s * 0.12, s > 0 ? 0.32 : 0.3, 0.05], [s * 0.2, 0.27, 0.46], 0.008, CHROME, chassis);
    ball([s * 0.2, 0.27, 0.46], 0.016, s > 0 ? ORANGE : CHROME, chassis);
    // rear pegs
    cyl([s * 0.215, 0.43, -0.45], [1, 0, 0], 0.016, 0.016, 0.1, RUBBER, chassis, 6);
    rod([s * 0.14, 0.4, -0.4], [s * 0.2, 0.43, -0.45], 0.012, STEEL, chassis);
  }
  rod(stand.at.toArray() as P, [0.2, 0.28, -0.55], 0.014, STEEL, stand);
  box([0.2, 0.275, -0.57], [0.07, 0.015, 0.08], BLACK, stand);
  rod([0.14, 0.34, -0.25], [0.1, 0.34, -0.25], 0.012, STEEL_D, stand);

  return b.root;
}
