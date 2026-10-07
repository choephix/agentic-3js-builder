```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Nine-banded armadillo",
  description:
    "A trotting nine-banded armadillo: overlapping tan shell bands, pointed snout, tall leathery ears, beady eyes, clawed feet and a banded tail tapering to a point.",
};

type V = [number, number, number];

const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V, b: V): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: V): number => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V): V => mul(a, 1 / len(a));
const mid = (a: V, b: V): V => mul(add(a, b), 0.5);

// Palette: dusty pinkish-tan shell, darker shields, pale coarse hair, ivory claws.
const BAND_A = "#cca08c";
const BAND_B = "#bd927f";
const SHIELD = "#a27868";
const SCUTE = "#e6c5b2";
const SKIN = "#c99b87";
const SNOUT = "#c39581";
const JAW = "#b98b79";
const LEG = "#b38573";
const PAW = "#9c6e5f";
const CLAW = "#efe3c9";
const EAR = "#9b6a5d";
const EYE = "#16110f";
const GLINT = "#ffffff";
const NOSE = "#2b2021";
const HAIR = "#f3e8d6";
const TAIL = "#c39884";
const TAIL_RING = "#8c635a";
const BELLY = "#dbb6a4";

const SHELL = { yc: 0.075, wx: 0.085, hy: 0.12, half: 0.21, bulge: 1.03 };
const profile = (z: number): number => Math.sqrt(Math.max(0, 1 - (z / SHELL.half) ** 2));

/** Bake a rotation so the geometry's +Y axis points along dir. */
function alignY<G extends THREE.BufferGeometry>(geo: G, dir: V): G {
  const y = new THREE.Vector3(...unit(dir));
  const ref = Math.abs(y.z) < 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
  const x = new THREE.Vector3().crossVectors(ref, y).normalize();
  const z = new THREE.Vector3().crossVectors(x, y);
  return geo.applyMatrix4(new THREE.Matrix4().makeBasis(x, y, z));
}

/** A tapered piece from p0 (radius r0) to p1 (radius r1), centred on its midpoint. */
function tube(p0: V, p1: V, r0: number, r1: number, seg = 10) {
  const d = sub(p1, p0);
  return {
    geo: alignY(new THREE.CylinderGeometry(r1, r0, len(d), seg, 1, false), d),
    at: mid(p0, p1),
  };
}

function ellipsoid(rx: number, ry: number, rz: number, seg = 14): THREE.BufferGeometry {
  return new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75)).scale(rx, ry, rz);
}

/** One transverse shell band: an open arc over the back, extruded along Z, centred on the origin. */
function arch(rx: number, ry: number, depth: number): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(1, 1, depth, 18, 1, true, Math.PI / 2 - 0.22, Math.PI + 0.44);
  g.rotateX(Math.PI / 2);
  return g.scale(rx, ry, 1);
}

/** Two-bone solve: the knee for a hip-to-foot span, bending toward `bend`. */
function kneeOf(top: V, foot: V, L1: number, L2: number, bend: V): V {
  const d = len(sub(foot, top));
  const u = unit(sub(foot, top));
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const perp = unit(sub(bend, mul(u, dot(bend, u))));
  return add(add(top, mul(u, a)), mul(perp, h));
}

export default function build() {
  const b = createBuilder({ name: "nine-banded armadillo" });
  const rand = rng(9);
  type J = ReturnType<typeof b.joint>;
  type P = ReturnType<typeof b.part>;

  // ---- skeleton ------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.095, -0.12], aim: [0, 0.095, 0.085] });
  const chest = b.joint("chest", { at: [0, 0.095, 0.085], aim: [0, 0.12, 0.17], parent: hips });
  const head = b.joint("head", { at: [0, 0.12, 0.17], aim: [0, 0.11, 0.37], parent: chest });
  const jaw = b.joint("jaw", { at: [0, 0.09, 0.22], aim: [0, 0.08, 0.345], parent: head });
  const earL = b.joint("earL", { at: [0.03, 0.18, 0.16], aim: [0.03, 0.24, 0.14], parent: head });
  const earR = b.joint("earR", { at: [-0.03, 0.18, 0.16], aim: [-0.03, 0.24, 0.14], parent: head });

  const TP: V[] = [
    [0, 0.095, -0.12], [0, 0.1, -0.18], [0, 0.096, -0.24], [0, 0.09, -0.3],
    [0, 0.082, -0.36], [0, 0.073, -0.41], [0, 0.065, -0.45], [0, 0.058, -0.49],
  ];
  const TR = [0.036, 0.034, 0.03, 0.026, 0.022, 0.017, 0.011, 0];
  const tail: J[] = [hips];
  for (let i = 1; i <= 6; i++) {
    tail.push(b.joint(`tail${i}`, { at: TP[i], aim: TP[i + 1], parent: tail[i - 1] }));
  }

  // Legs: hip/shoulder -> knee/elbow -> ankle/wrist, solved onto ground targets for a trot.
  const leg = (names: [string, string, string], top: V, foot: V, bend: V, parent: J, front: boolean) => {
    const k = kneeOf(top, foot, 0.05, 0.045, bend);
    const jT = b.joint(names[0], { at: top, aim: k, parent });
    const jK = b.joint(names[1], { at: k, aim: foot, parent: jT });
    const jA = b.joint(names[2], { at: foot, aim: [foot[0], foot[1] + 0.02, foot[2] + 0.04], parent: jK });

    const thigh = tube(top, k, 0.0195, 0.015);
    b.part(thigh.geo, LEG, { at: thigh.at, bone: jT });
    b.part(new THREE.SphereGeometry(0.0155, 10, 8), LEG, { at: k, bone: jK });
    const shin = tube(k, foot, 0.0145, 0.0115);
    b.part(shin.geo, LEG, { at: shin.at, bone: jK });
    b.part(ellipsoid(0.0155, 0.0085, 0.0205), PAW, { at: [foot[0], 0.0085, foot[2] + 0.004], bone: jA });

    const dir: V = front ? [0, -0.45, 0.9] : [0, -0.5, 0.85];
    const L = front ? 0.02 : 0.018;
    const toes = front ? [-0.0095, -0.0032, 0.0032, 0.0095] : [-0.0115, -0.0058, 0, 0.0058, 0.0115];
    for (const o of toes) {
      const base: V = [foot[0] + o, 0.011, foot[2] + (front ? 0.018 : 0.02)];
      b.part(alignY(new THREE.CylinderGeometry(0.0003, 0.0042, L, 6), dir), CLAW, {
        at: add(base, mul(unit(dir), L / 2)),
        bone: jA,
      });
    }
  };

  leg(["shoulderL", "elbowL", "wristL"], [0.058, 0.09, 0.11], [0.058, 0.022, 0.14], [0.25, 0, -1], chest, true);
  leg(["shoulderR", "elbowR", "wristR"], [-0.058, 0.09, 0.11], [-0.058, 0.022, 0.08], [-0.25, 0, -1], chest, true);
  leg(["hipL", "kneeL", "ankleL"], [0.055, 0.09, -0.11], [0.055, 0.022, -0.14], [0.2, 0, 1], hips, false);
  leg(["hipR", "kneeR", "ankleR"], [-0.055, 0.09, -0.11], [-0.055, 0.022, -0.08], [-0.2, 0, 1], hips, false);

  // ---- shell: rear shield, nine movable bands, front shield ----------------
  const bands: { part: P; zc: number; rx: number; ry: number }[] = [];
  const slices: [number, number, string, boolean][] = [];
  for (let i = 0; i < 5; i++) slices.push([-0.2 + i * 0.019, -0.2 + (i + 1) * 0.019, SHIELD, false]);
  for (let i = 0; i < 9; i++) {
    const w = 0.19 / 9;
    slices.push([-0.105 + i * w, -0.105 + (i + 1) * w, i % 2 ? BAND_B : BAND_A, true]);
  }
  for (let i = 0; i < 5; i++) slices.push([0.085 + i * 0.023, 0.085 + (i + 1) * 0.023, SHIELD, false]);

  for (const [z0, z1, color, isBand] of slices) {
    const zc = (z0 + z1) / 2;
    const k = profile(zc) * SHELL.bulge;
    const rx = SHELL.wx * k;
    const ry = SHELL.hy * k;
    const part = b.part(arch(rx, ry, z1 - z0 + 0.003), color, {
      at: [0, SHELL.yc, zc],
      bone: zc < -0.05 ? hips : chest,
    });
    if (isBand) bands.push({ part, zc, rx, ry });
  }

  // Rows of small square scutes on every band.
  for (const band of bands) {
    const surf = b.surface(band.part);
    for (const deg of [-60, -40, -20, 0, 20, 40, 60]) {
      const a = (deg * Math.PI) / 180;
      const p: V = [band.rx * Math.sin(a), SHELL.yc + band.ry * Math.cos(a), band.zc];
      b.stick(new THREE.CylinderGeometry(0.0056, 0.0062, 0.0055, 4), SCUTE, surf.nearest(p));
    }
  }

  // Coarse pale hairs poking out where the bands meet on the flanks.
  for (const band of bands) {
    const surf = b.surface(band.part);
    for (const side of [1, -1]) {
      for (let n = 0; n < 2; n++) {
        const a = side * (0.95 + rand() * 0.7);
        const zz = band.zc + (rand() < 0.5 ? -0.42 : 0.42) * 0.0211;
        const p: V = [band.rx * Math.sin(a), SHELL.yc + band.ry * Math.cos(a), zz];
        const L = 0.022 + rand() * 0.012;
        const hair = new THREE.CylinderGeometry(0.0006, 0.0025, L, 5, 1, false).translate(0, L / 2, 0);
        b.stick(hair, HAIR, surf.nearest(p));
      }
    }
  }

  b.part(ellipsoid(0.066, 0.02, 0.17), BELLY, { at: [0, 0.075, 0], bone: chest });

  // ---- head ----------------------------------------------------------------
  const cranium = b.part(ellipsoid(0.06, 0.05, 0.065), SKIN, { at: [0, 0.12, 0.2], bone: head });
  const snout = tube([0, 0.115, 0.22], [0, 0.108, 0.37], 0.042, 0.009, 12);
  const snoutPart = b.part(snout.geo, SNOUT, { at: snout.at, bone: head });
  const lowerJaw = tube([0, 0.085, 0.235], [0, 0.08, 0.345], 0.017, 0.005, 10);
  b.part(lowerJaw.geo, JAW, { at: lowerJaw.at, bone: jaw });

  // Beady eyes with a small glint, seated on the skull.
  const skull = b.surface(cranium);
  for (const s of [1, -1]) {
    b.stick(new THREE.SphereGeometry(0.0082, 10, 8), EYE, skull.nearest([s * 0.05, 0.135, 0.19]));
    b.stick(
      new THREE.SphereGeometry(0.0026, 8, 6).translate(0, 0.0074, 0),
      GLINT,
      skull.nearest([s * 0.05, 0.135, 0.19]),
    );
  }
  b.stick(new THREE.SphereGeometry(0.0095, 10, 8), NOSE, b.surface(snoutPart).nearest([0, 0.108, 0.37]));

  // Tall, thin, leathery ears leaning back and out.
  const earGeo = (sx: number) =>
    new THREE.CylinderGeometry(0.0012, 0.017, 0.066, 6, 1, false)
      .scale(0.45, 1, 1)
      .rotateX(-0.3)
      .rotateZ(-0.15 * sx);
  b.part(earGeo(1), EAR, { at: [0.03, 0.18, 0.16], bone: earL });
  b.part(earGeo(-1), EAR, { at: [-0.03, 0.18, 0.16], bone: earR });

  // ---- tail: tapering banded segments -------------------------------------
  for (let k = 0; k < 7; k++) {
    const t = tube(TP[k], TP[k + 1], TR[k], TR[k + 1], 10);
    b.part(t.geo, TAIL, { at: t.at, bone: tail[k] });
  }
  for (let k = 1; k <= 6; k++) {
    const dir = unit(sub(TP[k + 1], TP[k - 1]));
    const r = TR[k] * 1.16 + 0.001;
    b.part(alignY(new THREE.CylinderGeometry(r, r, 0.01, 12, 1, false), dir), TAIL_RING, {
      at: TP[k],
      bone: tail[k],
    });
  }

  return b.root;
}
```