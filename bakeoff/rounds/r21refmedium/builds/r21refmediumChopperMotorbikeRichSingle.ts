import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { catmull } from "../../../../src/path";
import { countershade, mix, paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Custom Chopper Motorbike",
  description:
    "Long-fork V-twin chopper in a polished hero-game look: teal and navy bodywork with one orange accent, bevelled plates, wire wheels, drag pipes, ape-hanger bars and glowing lamps.",
  style: "Overwatch",
  commit: "88fc1f0",
};

type V = [number, number, number];

const BLACK = "#1a1c21";
const RUBBER = "#26282c";
const STEEL = "#aab4bd";
const DSTEEL = "#5b6670";
const CHROME = "#dfe7ec";
const TEAL = "#1f7d8c";
const NAVY = "#12313f";
const ORANGE = "#ff7a18";
const CREAM = "#f1ede2";
const RED = "#ff3b30";
const AMBER = "#ffb02e";
const GLASS = "#fff1b8";
const DIALC = "#14232b";

const v3 = (p: readonly number[]) => new THREE.Vector3(p[0], p[1], p[2]);

/** Orient a geometry so its +Y follows yDir and its +X stays near xHint, then move it to pos. */
function put(geo: THREE.BufferGeometry, pos: V, yDir: V = [0, 1, 0], xHint: V = [1, 0, 0]) {
  const y = v3(yDir).normalize();
  let x = v3(xHint);
  x.addScaledVector(y, -x.dot(y));
  if (x.lengthSq() < 1e-6) {
    x = v3([0, 0, 1]);
    x.addScaledVector(y, -x.dot(y));
  }
  x.normalize();
  const z = new THREE.Vector3().crossVectors(x, y);
  const m = new THREE.Matrix4().makeBasis(x, y, z).setPosition(v3(pos));
  return geo.applyMatrix4(m);
}

function rodGeo(a: V, c: V, r: number, seg = 6) {
  const A = v3(a);
  const C = v3(c);
  const g = new THREE.CylinderGeometry(r, r, A.distanceTo(C), seg, 1);
  return put(g, [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2], C.clone().sub(A).toArray() as V);
}

function merge(geos: THREE.BufferGeometry[]) {
  const m = mergeGeometries(geos);
  if (!m) throw new Error("chopperMotorbike: merge failed");
  return m;
}

function arcPts(cy: number, cz: number, R: number, t0: number, t1: number, n: number): V[] {
  const out: V[] = [];
  for (let i = 0; i <= n; i++) {
    const t = ((t0 + ((t1 - t0) * i) / n) * Math.PI) / 180;
    out.push([0, cy + R * Math.sin(t), cz + R * Math.cos(t)]);
  }
  return out;
}

export default function build() {
  const b = createBuilder({ name: "chopperMotorbike" });

  // ---------------------------------------------------------------- skeleton
  const frameJ = b.joint("frame", { at: [0, 0.6, 0] });
  const steer = b.joint("steer", { parent: frameJ, at: [0, 1.0, 0.46], dir: [0, -0.655, 0.54], role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: steer, at: [0, 0.345, 1.0], dir: [1, 0, 0], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: frameJ, at: [0, 0.355, -0.75], dir: [1, 0, 0], role: "hinge" });
  const stand = b.joint("kickstand", { parent: frameJ, at: [0.14, 0.34, -0.08], dir: [0, -0.17, -0.3], role: "hinge" });
  const clutchL = b.joint("clutchLever", { parent: steer, at: [0.47, 1.27, 0.56], dir: [0.09, -0.07, 0.14], role: "hinge" });
  const brakeL = b.joint("brakeLever", { parent: steer, at: [-0.47, 1.27, 0.56], dir: [-0.09, -0.07, 0.14], role: "hinge" });
  const shifter = b.joint("shiftPedal", { parent: frameJ, at: [0.17, 0.27, 0.1], dir: [0, 0, 1], role: "hinge" });

  // ---------------------------------------------------------------- helpers
  const box = (w: number, h: number, d: number, color: Fill, bone: Joint, at: V, rot?: V) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot });
  const cyl = (r: number, len: number, color: Fill, bone: Joint, at: V, dir: V, seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { bone, at, dir });
  const ball = (r: number, color: Fill, bone: Joint, at: V, scale?: V, seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(4, Math.round(seg * 0.6))), color, { bone, at, scale });
  const rod = (a: V, c: V, r: number, color: Fill, bone: Joint) => b.rod(a, c, r, color, { bone });
  const mp = (geos: THREE.BufferGeometry[], color: Fill, bone: Joint) =>
    b.part(merge(geos), color, { bone, at: [0, 0, 0] });

  const tone = (c: string) =>
    countershade(mix(c, "#ffffff", 0.16), mix(c, "#0a1626", 0.22), { level: 0.1, soft: 0.9 });
  const TEAL_P = tone(TEAL);
  const NAVY_P = tone(NAVY);
  const ORANGE_P = tone(ORANGE);
  const CREAM_P = tone(CREAM);

  // ---------------------------------------------------------------- textures
  const CHEV = svg(
    `<svg viewBox="0 0 100 70"><rect x="2" y="2" width="96" height="66" rx="9" fill="#12313f"/><rect x="2" y="2" width="96" height="66" rx="9" fill="none" stroke="#f1ede2" stroke-width="3"/><path d="M12 56 L38 14 L56 14 L30 56 Z" fill="#ff7a18"/><path d="M46 56 L72 14 L84 14 L58 56 Z" fill="#f1ede2"/><path d="M70 56 L90 22 L90 36 L80 56 Z" fill="#ff7a18"/></svg>`,
    { size: 128 },
  );
  const DIAL = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#14232b"/><circle cx="32" cy="32" r="25" fill="none" stroke="#ff7a18" stroke-width="3" stroke-dasharray="3 3"/><circle cx="32" cy="32" r="17" fill="none" stroke="#1f7d8c" stroke-width="2"/><path d="M32 32 L46 20" stroke="#f1ede2" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="32" r="4" fill="#ff7a18"/></svg>`,
    { size: 128 },
  );
  const PLATE = svg(
    `<svg viewBox="0 0 100 60"><rect x="1" y="1" width="98" height="58" rx="8" fill="#f1ede2"/><rect x="5" y="5" width="90" height="50" rx="5" fill="none" stroke="#12313f" stroke-width="3"/><rect x="5" y="5" width="90" height="9" fill="#ff7a18"/><text x="50" y="45" font-family="sans-serif" font-weight="bold" font-size="26" text-anchor="middle" fill="#12313f">CHOP-01</text></svg>`,
    { size: 192 },
  );

  // ---------------------------------------------------------------- wheels
  function wheel(bone: Joint, cy: number, cz: number, o: { R: number; tube: number; rim: number; n: number; bw: number }) {
    b.part(new THREE.TorusGeometry(o.R, o.tube, 8, 28), BLACK, { bone, at: [0, cy, cz], rotation: [0, 90, 0] });
    // tread blocks: centre and two shoulders
    const tread: THREE.BufferGeometry[] = [];
    for (let i = 0; i < o.n; i++) {
      const a = (i / o.n) * Math.PI * 2 + (i % 2 ? 0.03 : 0);
      const dir: V = [0, Math.sin(a), Math.cos(a)];
      const place = (x: number, w: number) => {
        const rad = o.R + Math.sqrt(Math.max(o.tube * o.tube - x * x, 0)) - 0.003;
        tread.push(
          put(new THREE.BoxGeometry(w, 0.014, 0.034), [x, cy + rad * dir[1], cz + rad * dir[2]], dir),
        );
      };
      place(0, o.bw);
      place(o.tube * 0.72, 0.022);
      place(-o.tube * 0.72, 0.022);
    }
    mp(tread, RUBBER, bone);
    for (const s of [1, -1]) {
      const x = Math.sqrt(o.tube * o.tube - 0.03 * 0.03) - 0.001;
      b.part(new THREE.TorusGeometry(o.R - 0.03, 0.005, 5, 32), ORANGE, {
        bone,
        at: [s * x, cy, cz],
        rotation: [0, 90, 0],
      });
    }
    b.part(new THREE.TorusGeometry(o.rim, 0.012, 6, 32), CHROME, { bone, at: [0, cy, cz], rotation: [0, 90, 0] });
    cyl(0.045, 0.16, CHROME, bone, [0, cy, cz], [1, 0, 0], 10);
    cyl(0.03, 0.19, ORANGE, bone, [0, cy, cz], [1, 0, 0], 8);
    const spokes: THREE.BufferGeometry[] = [];
    const nS = 18;
    for (const s of [1, -1])
      for (let k = 0; k < nS; k++) {
        const a0 = (k / nS) * Math.PI * 2 + (s > 0 ? 0 : Math.PI / nS);
        const a1 = a0 + s * 0.42;
        spokes.push(
          rodGeo(
            [s * 0.035, cy + 0.048 * Math.sin(a0), cz + 0.048 * Math.cos(a0)],
            [s * 0.004, cy + o.rim * Math.sin(a1), cz + o.rim * Math.cos(a1)],
            0.0032,
            4,
          ),
        );
      }
    mp(spokes, DSTEEL, bone);
    for (const s of [1, -1]) cyl(0.052, 0.01, CHROME, bone, [s * 0.04, cy, cz], [1, 0, 0], 12);
  }
  wheel(wheelF, 0.345, 1.0, { R: 0.3, tube: 0.045, rim: 0.245, n: 34, bw: 0.03 });
  wheel(wheelR, 0.355, -0.75, { R: 0.27, tube: 0.085, rim: 0.185, n: 30, bw: 0.07 });

  // front brake disc
  {
    const cy = 0.345;
    const cz = 1.0;
    cyl(0.135, 0.006, DSTEEL, wheelF, [0.056, cy, cz], [1, 0, 0], 20);
    const holes: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      holes.push(
        put(new THREE.CylinderGeometry(0.012, 0.012, 0.009, 6), [0.056, cy + 0.095 * Math.sin(a), cz + 0.095 * Math.cos(a)], [1, 0, 0]),
      );
    }
    mp(holes, BLACK, wheelF);
    box(0.03, 0.06, 0.05, ORANGE, steer, [0.06, cy + 0.12, cz - 0.07], [-39.5, 0, 0]);
  }
  // rear sprocket
  {
    const cy = 0.355;
    const cz = -0.75;
    cyl(0.1, 0.012, DSTEEL, wheelR, [0.11, cy, cz], [1, 0, 0], 22);
    cyl(0.055, 0.016, ORANGE, wheelR, [0.112, cy, cz], [1, 0, 0], 10);
    const teeth: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const d: V = [0, Math.sin(a), Math.cos(a)];
      teeth.push(put(new THREE.BoxGeometry(0.012, 0.016, 0.02), [0.11, cy + 0.104 * d[1], cz + 0.104 * d[2]], d));
    }
    mp(teeth, STEEL, wheelR);
    // right rear disc
    cyl(0.11, 0.006, DSTEEL, wheelR, [-0.1, cy, cz], [1, 0, 0], 18);
    box(0.03, 0.05, 0.06, ORANGE, frameJ, [-0.105, cy + 0.085, cz + 0.07]);
  }

  // ---------------------------------------------------------------- front fork
  const P = (t: number, x: number): V => [x, 1.0 - 0.655 * t, 0.46 + 0.54 * t];
  const upDir: V = [0, 0.771, -0.636];
  for (const s of [1, -1]) {
    const x = s * 0.095;
    rod(P(-0.1, x), P(0.55, x), 0.022, CHROME, steer);
    rod(P(0.5, x), P(1.0, x), 0.03, NAVY, steer);
    rod(P(0.52, x), P(0.57, x), 0.034, ORANGE, steer);
    rod(P(0.9, x), P(0.96, x), 0.034, STEEL, steer);
    cyl(0.021, 0.02, CHROME, steer, [s * 0.108, 0.345, 1.0], [1, 0, 0], 10);
    // fork boot rings
    rod(P(0.44, x), P(0.5, x), 0.027, DSTEEL, steer);
    // fender stay
    rod([s * 0.075, 0.345, 1.0], [s * 0.065, 0.5, 0.9], 0.006, CHROME, steer);
    // top bolt
    cyl(0.02, 0.02, CHROME, steer, [x, P(-0.075, 0)[1], P(-0.075, 0)[2]], upDir, 8);
    // handlebar clamp
    box(0.05, 0.04, 0.05, NAVY, steer, [s * 0.06, 1.05, 0.45]);
  }
  rod(P(-0.07, 0), P(0.16, 0), 0.028, STEEL, steer);
  box(0.28, 0.03, 0.12, TEAL_P, steer, [0, P(-0.04, 0)[1], P(-0.04, 0)[2]], [-39.5, 0, 0]);
  box(0.24, 0.03, 0.11, TEAL_P, steer, [0, P(0.14, 0)[1], P(0.14, 0)[2]], [-39.5, 0, 0]);
  box(0.1, 0.012, 0.04, ORANGE, steer, [0, P(-0.04, 0)[1] + 0.017, P(-0.04, 0)[2] - 0.012], [-39.5, 0, 0]);
  // head tube
  cyl(0.052, 0.22, NAVY, frameJ, [0, 0.96, 0.49], upDir, 10);

  // front fender
  const fenderPaint = paint((p, n) => {
    if (Math.abs(p.x) > 0.052 && Math.abs(n.x) < 0.6) return NAVY_P;
    if (n.y > 0.3 && Math.abs(p.x) < 0.02) return ORANGE_P;
    return TEAL_P;
  });
  b.sweep(catmull(arcPts(0.345, 1.0, 0.382, 18, 155, 10)), (): [number, number] => [0.066, 0.011], {
    section: "box",
    caps: "flat",
    color: fenderPaint,
    bone: steer,
  });

  // headlight
  const headPaint = paint((p, n) => (n.y > 0.7 && Math.abs(p.x) < 0.02 ? ORANGE_P : TEAL_P));
  b.part(new THREE.SphereGeometry(0.115, 14, 10), headPaint, { bone: steer, at: [0, 0.95, 0.62], scale: [1, 1, 0.9] });
  glow(b.part(new THREE.CylinderGeometry(0.088, 0.088, 0.02, 14), GLASS, { bone: steer, at: [0, 0.95, 0.7], dir: [0, 0, 1] }), 1.5);
  b.part(new THREE.TorusGeometry(0.098, 0.013, 6, 18), CHROME, { bone: steer, at: [0, 0.95, 0.705] });
  for (const s of [1, -1]) {
    cyl(0.018, 0.04, NAVY, steer, [s * 0.115, 0.95, 0.6], [1, 0, 0], 8);
    cyl(0.012, 0.02, CHROME, steer, [s * 0.14, 0.95, 0.6], [1, 0, 0], 6);
  }
  // headlight grille bars
  {
    const bars: THREE.BufferGeometry[] = [];
    for (const x of [-0.04, 0, 0.04]) bars.push(rodGeo([x, 0.885, 0.716], [x, 1.015, 0.716], 0.003, 4));
    bars.push(rodGeo([-0.085, 0.95, 0.716], [0.085, 0.95, 0.716], 0.003, 4));
    mp(bars, DSTEEL, steer);
  }

  // ---------------------------------------------------------------- handlebars
  for (const s of [1, -1]) {
    const pts: V[] = [
      [s * 0.06, 1.03, 0.46],
      [s * 0.1, 1.16, 0.45],
      [s * 0.2, 1.3, 0.43],
      [s * 0.33, 1.33, 0.48],
      [s * 0.46, 1.29, 0.55],
    ];
    b.sweep(catmull(pts), 0.014, { color: CHROME, bone: steer });
    rod([s * 0.455, 1.292, 0.545], [s * 0.58, 1.24, 0.62], 0.023, RUBBER, steer);
    cyl(0.025, 0.012, CHROME, steer, [s * 0.585, 1.238, 0.623], [s * 0.5, -0.2, 0.35], 8);
    cyl(0.03, 0.03, NAVY, steer, [s * 0.44, 1.298, 0.53], [s * 0.5, -0.2, 0.35], 8);
    // mirror
    rod([s * 0.39, 1.31, 0.5], [s * 0.44, 1.45, 0.48], 0.006, CHROME, steer);
    b.part(new THREE.IcosahedronGeometry(0.048, 0), CHROME, { bone: steer, at: [s * 0.44, 1.48, 0.48], scale: [1, 0.85, 0.22], rotation: [-15, 0, 0] });
    b.part(new THREE.IcosahedronGeometry(0.042, 0), "#6aa0b0", { bone: steer, at: [s * 0.44, 1.48, 0.468], scale: [1, 0.85, 0.12], rotation: [-15, 0, 0] });
  }
  // levers
  rod([0.47, 1.27, 0.56], [0.56, 1.2, 0.7], 0.008, STEEL, clutchL);
  ball(0.014, STEEL, clutchL, [0.56, 1.2, 0.7]);
  rod([-0.47, 1.27, 0.56], [-0.56, 1.2, 0.7], 0.008, STEEL, brakeL);
  ball(0.014, STEEL, brakeL, [-0.56, 1.2, 0.7]);
  // cables
  b.sweep(catmull([[0.46, 1.255, 0.56], [0.36, 1.1, 0.55], [0.22, 0.95, 0.4], [0.12, 0.75, 0.2]]), 0.005, { color: BLACK, bone: steer });
  b.sweep(catmull([[-0.46, 1.255, 0.56], [-0.34, 1.12, 0.52], [-0.2, 0.95, 0.4], [-0.12, 0.72, 0.2]]), 0.005, { color: BLACK, bone: steer });
  // gauge
  cyl(0.038, 0.034, NAVY, steer, [0, 1.1, 0.47], [0, 0.45, -0.9], 12);
  b.part(new THREE.CircleGeometry(0.032, 14), "#ffffff", { bone: steer, at: [0, 1.113, 0.4425], dir: [0, 0.45, -0.9], axis: "z", texture: DIAL });

  // ---------------------------------------------------------------- frame
  b.sweep(catmull([[0, 0.93, 0.45], [0, 0.76, 0.2], [0, 0.66, -0.05], [0, 0.68, -0.45], [0, 0.7, -0.62]]), 0.034, { color: NAVY, bone: frameJ });
  b.sweep(catmull([[0, 0.9, 0.44], [0, 0.62, 0.36], [0, 0.36, 0.26], [0, 0.3, 0.1], [0, 0.3, -0.2]]), 0.03, { color: TEAL_P, bone: frameJ });
  for (const s of [1, -1]) {
    rod([s * 0.11, 0.31, -0.2], [s * 0.115, 0.355, -0.75], 0.02, NAVY, frameJ);
    rod([s * 0.07, 0.66, -0.5], [s * 0.115, 0.36, -0.75], 0.018, NAVY, frameJ);
    cyl(0.026, 0.03, CHROME, frameJ, [s * 0.125, 0.355, -0.75], [1, 0, 0], 10);
    // head gusset plates
    b.extrude(
      [
        [0.3, 0.98],
        [0.5, 1.0],
        [0.5, 0.86],
        [0.4, 0.72],
        [0.3, 0.8],
      ],
      { at: [s * 0.045, 0, 0], x: [0, 0, 1], thickness: 0.016, bevel: 0.005, color: TEAL_P, bone: frameJ },
    );
    // engine mounting plates
    b.extrude(
      [
        [-0.2, 0.62],
        [0.0, 0.66],
        [0.2, 0.42],
        [0.15, 0.3],
        [-0.2, 0.3],
      ],
      { at: [s * 0.135, 0, 0], x: [0, 0, 1], thickness: 0.012, bevel: 0.004, color: NAVY_P, bone: frameJ },
    );
    // side panels
    const px = s * 0.14;
    box(0.08, 0.16, 0.24, TEAL_P, frameJ, [px, 0.59, -0.34]);
    b.part(new THREE.PlaneGeometry(0.2, 0.14), "#ffffff", {
      bone: frameJ,
      at: [s * 0.184, 0.59, -0.34],
      dir: [s, 0, 0],
      axis: "z",
      texture: CHEV,
      scale: [1, 1, 1],
    });
    // sissy bar clamp
    box(0.03, 0.03, 0.05, CHROME, frameJ, [s * 0.1, 0.7, -0.6]);
  }
  // sissy bar
  b.sweep(catmull([[0.1, 0.7, -0.6], [0.12, 0.95, -0.78], [0, 1.08, -0.83], [-0.12, 0.95, -0.78], [-0.1, 0.7, -0.6]]), 0.013, { color: CHROME, bone: frameJ });
  box(0.2, 0.08, 0.04, NAVY, frameJ, [0, 1.06, -0.84], [10, 0, 0]);
  box(0.12, 0.02, 0.006, ORANGE, frameJ, [0, 1.06, -0.862], [10, 0, 0]);

  // ---------------------------------------------------------------- fuel tank & seat
  const tankPaint = paint((p, n) => {
    if (n.y > 0.55 && Math.abs(p.x) > 0.03 && Math.abs(p.x) < 0.055) return ORANGE_P;
    if (Math.abs(n.x) > 0.35) {
      const k = p.y - 1.0 + 0.45 * (p.z - 0.08);
      if (k > -0.03 && k < 0.015) return ORANGE_P;
      if (k > 0.025 && k < 0.032) return CREAM_P;
    }
    if (p.y < 0.89) return NAVY_P;
    return TEAL_P;
  });
  b.part(new THREE.SphereGeometry(1, 18, 12), tankPaint, { bone: frameJ, at: [0, 1.0, 0.08], scale: [0.17, 0.15, 0.34] });
  cyl(0.04, 0.022, CHROME, frameJ, [0, 1.147, 0.16], [0, 1, 0], 10);
  b.part(new THREE.TorusGeometry(0.043, 0.006, 5, 14), ORANGE, { bone: frameJ, at: [0, 1.152, 0.16], rotation: [90, 0, 0] });
  for (const s of [1, -1]) ball(0.05, RUBBER, frameJ, [s * 0.155, 0.96, 0.06], [0.3, 1.1, 2.0]);
  // tank ridge brace
  rod([0, 1.0, 0.4], [0, 0.95, 0.44], 0.02, STEEL, frameJ);

  const seatPaint = paint((p, n) => {
    const top = n.y > 0.5;
    const u = p.z;
    const v = top ? p.x : p.y;
    const a = ((((u + v) / 0.06) % 1) + 1) % 1;
    const c = ((((u - v) / 0.06) % 1) + 1) % 1;
    if (a < 0.07 || c < 0.07) return ORANGE_P;
    return "#1b1d22";
  });
  b.extrude(
    [
      [-0.62, 0.76],
      [-0.6, 0.84],
      [-0.45, 0.88],
      [-0.3, 0.84],
      [-0.15, 0.78],
      [0.0, 0.74],
      [0.0, 0.7],
      [-0.3, 0.7],
      [-0.6, 0.72],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 0.28, bevel: 0.025, smoothing: 1, color: seatPaint, bone: frameJ },
  );

  // ---------------------------------------------------------------- rear fender & lights
  const rearPaint = paint((p, n) => {
    if (Math.abs(p.x) > 0.082 && Math.abs(n.x) < 0.6) return NAVY_P;
    if (n.y > -0.2 && Math.abs(p.x) < 0.025) return ORANGE_P;
    return TEAL_P;
  });
  b.sweep(catmull(arcPts(0.355, -0.75, 0.415, 55, 180, 10)), (): [number, number] => [0.105, 0.012], {
    section: "box",
    caps: "flat",
    color: rearPaint,
    bone: frameJ,
  });
  glow(b.capsule([-0.06, 0.607, -1.11], [0.06, 0.607, -1.11], 0.018, RED, { bone: frameJ }), 1.6);
  b.part(new THREE.PlaneGeometry(0.2, 0.12), "#ffffff", { bone: frameJ, at: [0, 0.5, -1.195], dir: [0, 0, -1], axis: "z", texture: PLATE });
  rod([0, 0.46, -1.165], [0, 0.44, -1.19], 0.01, DSTEEL, frameJ);
  for (const s of [1, -1]) {
    rod([s * 0.11, 0.62, -1.0], [s * 0.15, 0.66, -1.08], 0.006, CHROME, frameJ);
    glow(ball(0.024, AMBER, frameJ, [s * 0.155, 0.665, -1.09], [1, 1, 1], 6), 1.4);
    rod([s * 0.075, 0.5, -0.99], [s * 0.1, 0.62, -0.92], 0.006, CHROME, frameJ);
  }

  // ---------------------------------------------------------------- engine
  box(0.26, 0.3, 0.42, DSTEEL, frameJ, [0, 0.42, 0.02]);
  box(0.22, 0.24, 0.2, DSTEEL, frameJ, [0, 0.4, -0.18]);
  box(0.2, 0.05, 0.3, STEEL, frameJ, [0, 0.29, 0.02]);
  const cylinders: Array<{ base: V; dir: V }> = [
    { base: [0, 0.52, 0.08], dir: [0, 0.83, 0.56] },
    { base: [0, 0.52, -0.08], dir: [0, 0.83, -0.56] },
  ];
  const fins: THREE.BufferGeometry[] = [];
  const pushrods: THREE.BufferGeometry[] = [];
  for (const c of cylinders) {
    const at = (s: number): V => [c.base[0] + c.dir[0] * s, c.base[1] + c.dir[1] * s, c.base[2] + c.dir[2] * s];
    cyl(0.055, 0.3, DSTEEL, frameJ, at(0.15), c.dir, 10);
    for (let i = 0; i < 8; i++) fins.push(put(new THREE.BoxGeometry(0.15, 0.012, 0.15), at(0.04 + i * 0.032), c.dir));
    box(0.001, 0.001, 0.001, DSTEEL, frameJ, at(0.15)); // keep bone ownership explicit
    b.part(new THREE.BoxGeometry(0.16, 0.1, 0.17), STEEL, { bone: frameJ, at: at(0.31), dir: c.dir });
    b.part(new THREE.BoxGeometry(0.13, 0.04, 0.14), ORANGE, { bone: frameJ, at: at(0.375), dir: c.dir });
    b.part(new THREE.BoxGeometry(0.15, 0.012, 0.15), CHROME, { bone: frameJ, at: at(0.346), dir: c.dir });
    const side: V = [0, c.dir[2] > 0 ? 0.56 : -0.56, 0].map((_, i) => (i === 1 ? c.dir[1] * 0 : 0)) as V;
    void side;
    for (const s of [1, -1])
      pushrods.push(rodGeo([s * 0.09, at(0.1)[1], at(0.1)[2]], [s * 0.09, at(0.31)[1], at(0.31)[2]], 0.008, 5));
    // spark plug stub
    rod(at(0.31), [at(0.31)[0] + 0.14, at(0.31)[1] + 0.02, at(0.31)[2]], 0.01, BLACK, frameJ);
  }
  mp(fins, "#6c7782", frameJ);
  mp(pushrods, CHROME, frameJ);
  // primary + clutch covers
  cyl(0.12, 0.04, STEEL, frameJ, [0.15, 0.4, 0.0], [1, 0, 0], 18);
  cyl(0.08, 0.02, DSTEEL, frameJ, [0.17, 0.4, 0.0], [1, 0, 0], 14);
  cyl(0.035, 0.02, ORANGE, frameJ, [0.183, 0.4, 0.0], [1, 0, 0], 10);
  cyl(0.1, 0.04, STEEL, frameJ, [-0.15, 0.4, 0.04], [1, 0, 0], 16);
  cyl(0.06, 0.02, DSTEEL, frameJ, [-0.17, 0.4, 0.04], [1, 0, 0], 12);
  cyl(0.03, 0.02, ORANGE, frameJ, [-0.183, 0.4, 0.04], [1, 0, 0], 10);
  {
    const bolts: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      bolts.push(put(new THREE.CylinderGeometry(0.01, 0.01, 0.01, 6), [0.17, 0.4 + 0.103 * Math.sin(a), 0.103 * Math.cos(a)], [1, 0, 0]));
      bolts.push(put(new THREE.CylinderGeometry(0.01, 0.01, 0.01, 6), [-0.17, 0.4 + 0.083 * Math.sin(a), 0.04 + 0.083 * Math.cos(a)], [1, 0, 0]));
    }
    mp(bolts, CHROME, frameJ);
  }
  // air cleaner
  cyl(0.085, 0.06, CHROME, frameJ, [0.14, 0.66, 0.1], [1, 0, 0], 16);
  cyl(0.05, 0.02, ORANGE, frameJ, [0.175, 0.66, 0.1], [1, 0, 0], 10);
  rod([0.1, 0.66, 0.1], [0, 0.66, 0.1], 0.03, STEEL, frameJ);
  // front drive sprocket + chain
  cyl(0.05, 0.014, DSTEEL, frameJ, [0.11, 0.33, -0.22], [1, 0, 0], 14);
  rod([0.11, 0.455, -0.75], [0.11, 0.38, -0.22], 0.008, DSTEEL, frameJ);
  rod([0.11, 0.255, -0.75], [0.11, 0.28, -0.22], 0.008, DSTEEL, frameJ);
  {
    const links: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 18; i++) {
      const t = i / 17;
      links.push(new THREE.BoxGeometry(0.014, 0.02, 0.018).translate(0.11, 0.455 + (0.38 - 0.455) * t, -0.75 + 0.53 * t));
    }
    mp(links, CHROME, frameJ);
  }
  box(0.012, 0.03, 0.46, TEAL_P, frameJ, [0.128, 0.43, -0.49], [-8, 0, 0]);
  // oil lines
  b.sweep(catmull([[-0.1, 0.34, -0.2], [-0.12, 0.45, -0.3], [-0.1, 0.62, -0.32]]), 0.007, { color: ORANGE, bone: frameJ });

  // ---------------------------------------------------------------- exhaust
  b.sweep(
    catmull([
      [-0.1, 0.76, 0.33],
      [-0.14, 0.72, 0.42],
      [-0.2, 0.55, 0.44],
      [-0.22, 0.38, 0.36],
      [-0.22, 0.33, 0.2],
      [-0.22, 0.33, -0.12],
    ]),
    0.034,
    { color: CHROME, bone: frameJ },
  );
  b.sweep(
    catmull([
      [-0.1, 0.74, -0.18],
      [-0.19, 0.66, -0.22],
      [-0.24, 0.5, -0.18],
      [-0.24, 0.38, -0.12],
      [-0.23, 0.34, -0.12],
    ]),
    0.03,
    { color: CHROME, bone: frameJ },
  );
  b.rod([-0.23, 0.34, -0.1], [-0.23, 0.34, -0.95], 0.052, CHROME, {
    bone: frameJ,
    bands: [
      [0.08, CHROME],
      [0.12, NAVY],
      [0.5, CHROME],
      [0.56, ORANGE],
      [0.9, CHROME],
      [0.94, NAVY],
      [1, CHROME],
    ],
  });
  cyl(0.044, 0.01, BLACK, frameJ, [-0.23, 0.34, -0.953], [0, 0, 1], 12);
  cyl(0.058, 0.014, DSTEEL, frameJ, [-0.23, 0.34, -0.94], [0, 0, 1], 12);
  for (const z of [-0.3, -0.7]) {
    box(0.03, 0.05, 0.03, DSTEEL, frameJ, [-0.2, 0.39, z]);
  }
  rod([-0.1, 0.31, -0.3], [-0.2, 0.34, -0.3], 0.01, DSTEEL, frameJ);

  // ---------------------------------------------------------------- foot controls
  for (const s of [1, -1]) {
    box(0.06, 0.06, 0.06, NAVY, frameJ, [s * 0.14, 0.2, 0.2]);
    rod([s * 0.14, 0.2, 0.2], [s * 0.4, 0.2, 0.2], 0.014, STEEL, frameJ);
    rod([s * 0.33, 0.2, 0.2], [s * 0.46, 0.2, 0.2], 0.024, RUBBER, frameJ);
    cyl(0.026, 0.01, CHROME, frameJ, [s * 0.465, 0.2, 0.2], [1, 0, 0], 8);
  }
  rod([0.16, 0.27, 0.1], [0.16, 0.27, 0.3], 0.008, STEEL, shifter);
  box(0.05, 0.02, 0.07, RUBBER, shifter, [0.17, 0.27, 0.32]);
  ball(0.012, CHROME, shifter, [0.16, 0.27, 0.1]);
  // kickstand (folded)
  rod([0.14, 0.34, -0.08], [0.14, 0.17, -0.38], 0.012, STEEL, stand);
  box(0.05, 0.015, 0.06, DSTEEL, stand, [0.14, 0.165, -0.39]);
  box(0.03, 0.04, 0.04, NAVY, frameJ, [0.12, 0.34, -0.08]);

  return b.root;
}
