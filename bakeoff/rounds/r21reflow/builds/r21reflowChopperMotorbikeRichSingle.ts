import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { gradient, paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Custom Chopper Motorbike",
  description:
    "Long-fork custom chopper in a polished Overwatch look: teal and orange colour blocking, faceted tank, V-twin, ape hangers, spoked wheels.",
  style: "Overwatch",
  commit: "88fc1f0",
};

const TEAL = "#1f5a6b";
const TEAL_L = "#2f8294";
const TEAL_D = "#16404c";
const ORANGE = "#f0792a";
const STEEL = "#a7adb3";
const CHROME = "#dfe4e8";
const DARK = "#2b2e33";
const ENG = "#4a5058";
const BLACK = "#16171a";
const TIRE = "#1c1c1f";
const TIRE2 = "#2a2a2f";
const SEAT = "#1d1e22";
const SEAT2 = "#2c2e35";
const RED = "#ff2a2a";

const v = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);

/** Cylinder between two model-space points (for merging). */
function cyl(a: number[], b: number[], r: number, seg = 6, r2 = r) {
  const A = v(a);
  const B = v(b);
  const d = B.clone().sub(A);
  const m = A.clone().add(B).multiplyScalar(0.5);
  const g = new THREE.CylinderGeometry(r2, r, d.length(), seg, 1);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
  g.translate(m.x, m.y, m.z);
  return g;
}

/** Cylinder whose axis runs along X, centred on c. */
function xcyl(c: number[], r: number, len: number, seg = 10) {
  const g = new THREE.CylinderGeometry(r, r, len, seg, 1);
  g.rotateZ(Math.PI / 2);
  g.translate(c[0], c[1], c[2]);
  return g;
}

function ball(c: number[], r: number) {
  const g = new THREE.SphereGeometry(r, 6, 4);
  g.translate(c[0], c[1], c[2]);
  return g;
}

function box(c: number[], w: number, h: number, d: number) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(c[0], c[1], c[2]);
  return g;
}

const merge = (list: THREE.BufferGeometry[]) => mergeGeometries(list)!;

export default function build() {
  const b = createBuilder({ name: "chopperMotorbike" });
  const WY = 0.365; // wheel centre height (tire outer radius)

  // ---------------------------------------------------------------- skeleton
  const frame = b.joint("frame", { at: [0, 0.6, 0.05] });
  const headP = [0, 1.05, 0.5];
  const frontAxle = [0, WY, 1.1];
  const rearAxle = [0, WY, -0.7];
  const D = v(frontAxle).sub(v(headP)).normalize();
  const steer = b.joint("steer", { parent: frame, at: headP, dir: D, role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: steer, at: frontAxle, dir: [1, 0, 0], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: frame, at: rearAxle, dir: [1, 0, 0], role: "hinge" });
  const kick = b.joint("kickstand", {
    parent: frame,
    at: [0.14, 0.3, -0.2],
    aim: [0.3, 0.03, -0.15],
    role: "hinge",
  });
  const leverL = b.joint("leverL", {
    parent: steer,
    at: [0.54, 1.38, 0.3],
    aim: [0.56, 1.35, 0.44],
    role: "hinge",
  });
  const leverR = b.joint("leverR", {
    parent: steer,
    at: [-0.54, 1.38, 0.3],
    aim: [-0.56, 1.35, 0.44],
    role: "hinge",
  });

  const world = (g: THREE.BufferGeometry, color: Fill, bone: Joint, name?: string) =>
    b.part(g, color, { bone, at: [0, 0, 0], name });

  // ---------------------------------------------------------------- wheels
  const wheel = (bone: Joint, cz: number, wide: number, front: boolean) => {
    const c = [0, WY, cz];
    const tire = paint((p, n, s) => {
      const r = Math.hypot(p.y - WY, p.z - cz);
      if (Math.abs(n.x) > 0.55 && Math.abs(r - 0.335) < 0.007) return ORANGE;
      return (Math.floor(s[0] * 56) + (s[1] < 0.5 ? 0 : 1)) % 2 === 0 ? TIRE : TIRE2;
    });
    b.part(new THREE.TorusGeometry(0.3, 0.065, 8, 28), tire, {
      bone,
      at: c,
      rotation: [0, 90, 0],
      scale: [1, 1, wide],
      name: front ? "tireF" : "tireR",
    });
    b.part(new THREE.TorusGeometry(0.245, 0.014, 6, 28), CHROME, {
      bone,
      at: c,
      rotation: [0, 90, 0],
      scale: [1, 1, wide * 1.4],
      name: front ? "rimF" : "rimR",
    });
    const spokes: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const ha = a + 0.25 * (i % 2 ? 1 : -1);
      const hx = (i % 2 ? 1 : -1) * 0.04;
      spokes.push(
        cyl(
          [hx, WY + 0.045 * Math.cos(ha), cz + 0.045 * Math.sin(ha)],
          [0, WY + 0.245 * Math.cos(a), cz + 0.245 * Math.sin(a)],
          0.0035,
          3,
        ),
      );
    }
    world(merge(spokes), STEEL, bone, front ? "spokesF" : "spokesR");
    world(xcyl(c, 0.05, 0.14, 8), ENG, bone, front ? "hubF" : "hubR");
    world(xcyl(c, 0.025, 0.4, 8), CHROME, bone, front ? "axleF" : "axleR");
  };
  wheel(wheelF, frontAxle[2], 1.0, true);
  wheel(wheelR, rearAxle[2], 1.5, false);

  // front brake disc + caliper
  {
    const cz = frontAxle[2];
    b.part(new THREE.CylinderGeometry(0.135, 0.135, 0.006, 20), STEEL, {
      bone: wheelF,
      at: [0.062, WY, cz],
      rotation: [0, 0, 90],
      name: "discF",
    });
    const holes: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      holes.push(xcyl([0.0645, WY + 0.095 * Math.cos(a), cz + 0.095 * Math.sin(a)], 0.011, 0.004, 6));
    }
    world(merge(holes), DARK, wheelF, "discHolesF");
    b.part(new THREE.BoxGeometry(0.04, 0.08, 0.06), ORANGE, { bone: steer, at: [0.075, WY, cz - 0.13], name: "caliperF" });
  }
  // rear brake disc + sprocket + chain (right side)
  {
    const cz = rearAxle[2];
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.006, 18), STEEL, {
      bone: wheelR,
      at: [0.115, WY, cz],
      rotation: [0, 0, 90],
      name: "discR",
    });
    b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.012, 16), ENG, {
      bone: wheelR,
      at: [-0.13, WY, cz],
      rotation: [0, 0, 90],
      name: "sprocketR",
    });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.016, 10), ENG, {
      bone: frame,
      at: [-0.13, 0.4, -0.12],
      rotation: [0, 0, 90],
      name: "sprocketEng",
    });
    world(
      merge([
        cyl([-0.13, 0.45, -0.12], [-0.13, 0.468, cz], 0.007, 4),
        cyl([-0.13, 0.35, -0.12], [-0.13, 0.262, cz], 0.007, 4),
      ]),
      DARK,
      frame,
      "chain",
    );
  }

  // ---------------------------------------------------------------- fenders
  const fq = (a0: number) =>
    new THREE.Quaternion()
      .setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)
      .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), a0));
  const rad = (d: number) => (d * Math.PI) / 180;
  b.part(new THREE.TorusGeometry(0.415, 0.03, 4, 16, rad(125)), TEAL, {
    bone: steer,
    at: frontAxle,
    quat: fq(rad(32)),
    scale: [1, 1, 2.6],
    name: "fenderF",
  });
  b.part(new THREE.TorusGeometry(0.451, 0.01, 4, 10, rad(70)), ORANGE, {
    bone: steer,
    at: frontAxle,
    quat: fq(rad(60)),
    scale: [1, 1, 3],
    name: "fenderFTrim",
  });
  b.part(new THREE.TorusGeometry(0.41, 0.03, 4, 16, rad(130)), TEAL, {
    bone: frame,
    at: rearAxle,
    quat: fq(rad(16)),
    scale: [1, 1, 4.2],
    name: "fenderR",
  });
  b.part(new THREE.TorusGeometry(0.446, 0.01, 4, 10, rad(80)), ORANGE, {
    bone: frame,
    at: rearAxle,
    quat: fq(rad(45)),
    scale: [1, 1, 4.6],
    name: "fenderRTrim",
  });
  for (const s of [1, -1]) {
    b.rod([s * 0.1, WY, frontAxle[2]], [s * 0.07, 0.774, 1.172], 0.008, STEEL, { bone: steer });
    b.rod([s * 0.13, 0.79, rearAxle[2]], [s * 0.18, WY, rearAxle[2]], 0.012, STEEL, { bone: frame });
  }
  glow(b.part(new THREE.BoxGeometry(0.08, 0.04, 0.03), RED, { bone: frame, at: [0, 0.5, -1.1], name: "tailLight" }), 1.4);
  b.part(new THREE.BoxGeometry(0.12, 0.07, 0.01), CHROME, { bone: frame, at: [0, 0.43, -1.09], name: "plate" });

  // ---------------------------------------------------------------- frame tubes
  b.sweep(catmull([[0, 1.0, 0.49], [0, 0.72, 0.51], [0, 0.45, 0.5], [0, 0.3, 0.42], [0, 0.28, 0.2], [0, 0.28, -0.1]]), 0.032, {
    bone: frame,
    bands: [
      [0.18, TEAL_D],
      [0.26, ORANGE],
      [1, TEAL_D],
    ],
    name: "downtube",
  });
  b.sweep(catmull([[0, 1.0, 0.49], [0, 0.88, 0.0], [0, 0.8, -0.5]]), 0.03, TEAL_D, { bone: frame, name: "backbone" });
  b.rod([0, 0.82, -0.42], [0, 0.28, -0.1], 0.026, TEAL_D, { bone: frame });
  b.rod([-0.12, 0.8, -0.5], [0.12, 0.8, -0.5], 0.024, TEAL_D, { bone: frame });
  for (const s of [1, -1]) {
    b.rod([0, 0.28, -0.1], [s * 0.18, 0.28, -0.1], 0.026, TEAL_D, { bone: frame });
    b.rod([s * 0.18, 0.28, -0.1], [s * 0.18, WY, rearAxle[2]], 0.028, TEAL, { bone: frame, name: "rail" + s });
    b.rod([s * 0.12, 0.8, -0.5], [s * 0.18, WY, rearAxle[2]], 0.022, TEAL_D, { bone: frame, name: "stay" + s });
  }
  // head tube + trees
  const head = v(headP);
  const hp = (k: number) => head.clone().addScaledVector(D, k).toArray();
  b.rod(hp(-0.11), hp(0.11), 0.04, STEEL, { bone: steer, name: "headTube" });
  b.part(new THREE.BoxGeometry(0.26, 0.05, 0.08), STEEL, { bone: steer, at: hp(-0.12), dir: D, name: "crown" });
  b.part(new THREE.BoxGeometry(0.26, 0.04, 0.08), STEEL, { bone: steer, at: hp(0.13), dir: D, name: "lowerTree" });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 8), CHROME, { bone: steer, at: hp(-0.15), dir: D, name: "stemCap" });
  for (const s of [1, -1]) {
    b.sweep([[s * 0.1, 0, 0].map((x, i) => x + hp(-0.12)[i]), [s * 0.1, WY, frontAxle[2]]], 0.026, {
      bone: steer,
      caps: "flat",
      bands: [
        [0.5, CHROME],
        [0.74, TEAL],
        [0.8, ORANGE],
        [1, TEAL],
      ],
      name: "fork" + s,
    });
    // fork bolts
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 6), CHROME, {
      bone: steer,
      at: [s * 0.125, WY, frontAxle[2]],
      rotation: [0, 0, 90],
    });
  }

  // ---------------------------------------------------------------- headlight
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.105, 0.04],
      [0.105, 0.12],
      [0, 0.12],
    ],
    { at: [0, 0.93, 0.66], axis: [0, 0, 1], bone: steer, color: TEAL, name: "headBucket" },
  );
  b.part(new THREE.TorusGeometry(0.1, 0.013, 5, 16), CHROME, { bone: steer, at: [0, 0.93, 0.78], name: "headRim" });
  const lens = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#fff3c8"/><circle cx="32" cy="32" r="14" fill="#fffbe6"/>
     <path d="M0 21H64M0 43H64M21 0V64M43 0V64" stroke="#b7ab7a" stroke-width="2.5"/></svg>`,
    { size: 128 },
  );
  glow(
    b.part(new THREE.CircleGeometry(0.093, 14), "#ffffff", {
      bone: steer,
      at: [0, 0.93, 0.776],
      dir: [0, 0, 1],
      axis: "z",
      texture: lens,
      name: "headLens",
    }),
    1.2,
  );
  b.rod([0, 0.93, 0.65], [0, 1.05, 0.58], 0.012, STEEL, { bone: steer });

  // ---------------------------------------------------------------- handlebars
  const bolt = new THREE.SphereGeometry(0.012, 6, 4);
  for (const s of [1, -1]) {
    const bar = [
      [s * 0.04, 1.1, 0.46],
      [s * 0.12, 1.3, 0.44],
      [s * 0.28, 1.46, 0.4],
      [s * 0.52, 1.385, 0.3],
    ];
    b.sweep(catmull(bar), 0.014, CHROME, { bone: steer, name: "bar" + s });
    b.rod([s * 0.52, 1.385, 0.3], [s * 0.68, 1.37, 0.27], 0.019, BLACK, { bone: steer, name: "grip" + s });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 8), CHROME, {
      bone: steer,
      at: [s * 0.69, 1.368, 0.27],
      rotation: [0, 0, 90],
    });
    b.part(new THREE.BoxGeometry(0.05, 0.04, 0.05), STEEL, { bone: steer, at: [s * 0.1, 1.12, 0.46], name: "clamp" + s });
    b.part(bolt, CHROME, { bone: steer, at: [s * 0.1, 1.145, 0.46] });
    b.part(new THREE.BoxGeometry(0.035, 0.03, 0.05), ORANGE, { bone: steer, at: [s * 0.46, 1.395, 0.31], name: "perch" + s });
    // mirror
    b.rod([s * 0.47, 1.4, 0.3], [s * 0.52, 1.56, 0.26], 0.007, STEEL, { bone: steer });
    b.part(new THREE.OctahedronGeometry(0.04), STEEL, {
      bone: steer,
      at: [s * 0.52, 1.585, 0.26],
      scale: [1, 1.1, 0.4],
      name: "mirror" + s,
    });
    b.part(new THREE.OctahedronGeometry(0.03), CHROME, {
      bone: steer,
      at: [s * 0.52, 1.585, 0.285],
      scale: [1, 1.1, 0.2],
    });
  }
  for (const [s, lever] of [
    [1, leverL],
    [-1, leverR],
  ] as const) {
    b.rod([s * 0.54, 1.38, 0.3], [s * 0.56, 1.35, 0.44], 0.008, STEEL, { bone: lever, name: "lever" + s });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), ORANGE, { bone: lever, at: [s * 0.56, 1.35, 0.445] });
  }
  // brake line
  b.sweep(catmull([[0.46, 1.38, 0.31], [0.3, 1.3, 0.4], [0.1, 1.18, 0.44], [0.07, 1.05, 0.46]]), 0.005, DARK, {
    bone: steer,
    name: "brakeLine",
  });

  // ---------------------------------------------------------------- tank
  const tankColor = gradient(TEAL_L, TEAL_D, [0, 1.12, 0.6], [0, 0.9, 0.0]);
  b.loft(
    [
      { at: [0, 0.98, 0.62], w: 0.2, h: 0.2 },
      { at: [0, 1.0, 0.45], w: 0.3, h: 0.3 },
      { at: [0, 0.99, 0.25], w: 0.34, h: 0.3 },
      { at: [0, 0.95, 0.05], w: 0.24, h: 0.2 },
    ],
    {
      bone: frame,
      color: tankColor,
      sectors: [
        [28, 72, ORANGE, 0.2, 0.85],
        [-72, -28, ORANGE, 0.2, 0.85],
      ],
      name: "tank",
    },
  );
  const hex: OutlinePoint[] = [
    [-0.075, 0],
    [-0.04, 0.062],
    [0.04, 0.062],
    [0.075, 0],
    [0.04, -0.062],
    [-0.04, -0.062],
  ];
  const hexS: OutlinePoint[] = hex.map(([x, y]) => [x * 0.62, y * 0.62] as OutlinePoint);
  for (const s of [1, -1]) {
    b.extrude(hex, { at: [s * 0.172, 0.97, 0.3], x: [0, 0, 1], thickness: 0.02, bone: frame, color: ORANGE, bevel: 0.003, name: "badge" + s });
    b.extrude(hexS, { at: [s * 0.172, 0.97, 0.3], x: [0, 0, 1], thickness: 0.026, bone: frame, color: TEAL_D, bevel: 0.003, name: "badgeIn" + s });
  }
  b.part(new THREE.CylinderGeometry(0.035, 0.04, 0.025, 8), CHROME, { bone: frame, at: [0, 1.14, 0.2], name: "fuelCap" });
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 6), ORANGE, { bone: frame, at: [0, 1.155, 0.2] });
  b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.03, 10), STEEL, {
    bone: frame,
    at: [0, 1.125, 0.5],
    dir: [0, 1, 0.3],
    name: "gaugeHousing",
  });
  const dial = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#10161c"/><path d="M10 44A24 24 0 1 1 54 44" stroke="#f0792a" stroke-width="5" fill="none"/>
     <path d="M32 34L44 18" stroke="#ffffff" stroke-width="4"/><circle cx="32" cy="34" r="4" fill="#dfe4e8"/></svg>`,
    { size: 128 },
  );
  glow(
    b.part(new THREE.CircleGeometry(0.038, 12), "#ffffff", {
      bone: frame,
      at: [0, 1.143, 0.508],
      dir: [0, 1, 0.3],
      axis: "z",
      up: [0, 0, -1],
      texture: dial,
      name: "gauge",
    }),
    0.8,
  );

  // ---------------------------------------------------------------- seat
  const seatPaint = paint((p) => (Math.floor(p.x / 0.045) + Math.floor(p.z / 0.045)) % 2 === 0 ? SEAT : SEAT2);
  b.loft(
    [
      { at: [0, 0.9, -0.04], w: 0.28, h: 0.1 },
      { at: [0, 0.88, -0.2], w: 0.3, h: 0.1 },
      { at: [0, 0.87, -0.4], w: 0.26, h: 0.1 },
      { at: [0, 0.86, -0.6], w: 0.2, h: 0.09 },
    ],
    { bone: frame, color: seatPaint, name: "seat" },
  );
  b.sweep(catmull([[0.12, 0.84, -0.5], [0.12, 1.12, -0.74], [-0.12, 1.12, -0.74], [-0.12, 0.84, -0.5]]), 0.013, CHROME, {
    bone: frame,
    name: "sissyBar",
  });
  b.part(new THREE.BoxGeometry(0.22, 0.1, 0.03), SEAT2, { bone: frame, at: [0, 1.06, -0.73], name: "backPad" });

  // ---------------------------------------------------------------- engine
  b.part(new THREE.BoxGeometry(0.24, 0.28, 0.4), ENG, { bone: frame, at: [0, 0.44, 0.12], name: "crankcase" });
  b.part(new THREE.BoxGeometry(0.22, 0.22, 0.2), DARK, { bone: frame, at: [0, 0.4, -0.12], name: "gearbox" });
  const cylB = [0, 0.5, 0.15];
  for (const [tag, top] of [
    ["F", [0, 0.82, 0.36]],
    ["R", [0, 0.82, -0.06]],
  ] as const) {
    b.rod(cylB, top, 0.062, DARK, { bone: frame, name: "barrel" + tag });
    const T = v(top);
    const B = v(cylB);
    const fins: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 7; k++) {
      const t = 0.15 + 0.1 * k;
      const p = B.clone().lerp(T, t);
      const q = B.clone().lerp(T, t + 0.035);
      fins.push(cyl(p.toArray(), q.toArray(), 0.088, 10));
    }
    world(merge(fins), STEEL, frame, "fins" + tag);
    world(merge([cyl(B.clone().lerp(T, 0.86).toArray(), top, 0.078, 8)]), CHROME, frame, "headCover" + tag);
    b.part(new THREE.BoxGeometry(0.2, 0.035, 0.06), STEEL, { bone: frame, at: [0, top[1] + 0.02, top[2]], name: "rocker" + tag });
  }
  // primary cover (left) and air cleaner (right)
  world(xcyl([0.18, 0.46, 0.0], 0.115, 0.05, 14), STEEL, frame, "primary");
  world(xcyl([0.21, 0.46, 0.0], 0.07, 0.02, 10), CHROME, frame, "primaryCap");
  world(xcyl([0.215, 0.46, 0.0], 0.03, 0.02, 6), ORANGE, frame, "primaryDot");
  const primBolts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    primBolts.push(ball([0.205, 0.46 + 0.1 * Math.cos(a), 0.1 * Math.sin(a)], 0.01));
  }
  world(merge(primBolts), CHROME, frame, "primaryBolts");
  world(xcyl([-0.17, 0.74, 0.12], 0.07, 0.08, 10), CHROME, frame, "airCleaner");
  world(xcyl([-0.215, 0.74, 0.12], 0.045, 0.01, 8), ORANGE, frame, "airCleanerDot");
  // engine-side panels (orange insets) and oil tank
  b.part(new THREE.BoxGeometry(0.1, 0.2, 0.2), TEAL, { bone: frame, at: [-0.14, 0.62, -0.32], name: "oilTank" });
  b.part(new THREE.BoxGeometry(0.104, 0.05, 0.14), ORANGE, { bone: frame, at: [-0.14, 0.64, -0.32], name: "oilTankStripe" });
  b.part(new THREE.BoxGeometry(0.06, 0.12, 0.16), TEAL, { bone: frame, at: [0.12, 0.62, -0.3], name: "battery" });

  // exhaust (right)
  b.sweep(
    catmull([
      [-0.06, 0.74, 0.42],
      [-0.2, 0.62, 0.5],
      [-0.27, 0.4, 0.42],
      [-0.27, 0.31, 0.2],
      [-0.27, 0.3, -0.4],
      [-0.26, 0.32, -0.95],
    ]),
    (t) => 0.026 + 0.03 * Math.min(1, Math.max(0, (t - 0.5) / 0.1)),
    { bone: frame, color: CHROME, caps: { start: "round", end: "flat" }, name: "exhaust" },
  );
  b.sweep(catmull([[-0.05, 0.72, -0.1], [-0.18, 0.55, -0.14], [-0.27, 0.32, -0.12]]), 0.024, CHROME, {
    bone: frame,
    name: "exhaustR",
  });
  const bands: THREE.BufferGeometry[] = [];
  for (const z of [-0.55, -0.67, -0.79]) bands.push(cyl([-0.265, 0.3 + 0.0, z], [-0.265, 0.3, z + 0.016], 0.062, 10));
  world(merge(bands), ORANGE, frame, "mufflerBands");
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 8), BLACK, {
    bone: frame,
    at: [-0.26, 0.32, -0.955],
    rotation: [90, 0, 0],
    name: "mufflerTip",
  });

  // ---------------------------------------------------------------- foot controls
  for (const s of [1, -1]) {
    b.rod([s * 0.03, 0.33, 0.52], [s * 0.3, 0.33, 0.52], 0.014, STEEL, { bone: frame });
    b.rod([s * 0.3, 0.33, 0.52], [s * 0.4, 0.33, 0.52], 0.028, BLACK, { bone: frame, name: "peg" + s });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 8), ORANGE, {
      bone: frame,
      at: [s * 0.405, 0.33, 0.52],
      rotation: [0, 0, 90],
    });
  }
  b.rod([0.18, 0.3, 0.1], [0.2, 0.33, 0.52], 0.01, STEEL, { bone: frame, name: "shifterRod" });

  // kickstand
  b.rod([0.14, 0.3, -0.2], [0.3, 0.03, -0.15], 0.014, STEEL, { bone: kick, name: "kickLeg" });
  b.part(new THREE.BoxGeometry(0.06, 0.02, 0.05), BLACK, { bone: kick, at: [0.3, 0.015, -0.15], name: "kickFoot" });

  // ---------------------------------------------------------------- frame bolts and trim
  const rivets: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    rivets.push(ball([0.034, 0.95 - 0.55 * t, 0.49 + 0.02 * t], 0.009));
    rivets.push(ball([-0.034, 0.95 - 0.55 * t, 0.49 + 0.02 * t], 0.009));
  }
  world(merge(rivets), CHROME, frame, "downtubeRivets");
  const rivets2: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    rivets2.push(ball([0.012 * Math.cos(a), 0.93 + 0.1 * Math.cos(a), 0.69 + 0.1 * Math.sin(a) * 0], 0.0));
  }
  void rivets2;
  b.part(box([0, 0, 0], 0.001, 0.001, 0.001), STEEL, { bone: frame, at: [0, 0.3, 0.2], name: "dummyTrim" });

  return b.root;
}
