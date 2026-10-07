```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Reef Octopus",
  description:
    "A curious coral-and-rust reef octopus with bumpy mottled skin, golden bar-pupilled eyes under grumpy brows, cream-suckered arms, and a brass key held up from a shipwreck.",
};

// ---- palette -----------------------------------------------------------------
const CORAL = "#e56b4c";
const CORAL_ARM = "#d45f3e";
const RUST = "#9a3b22";
const RUST_DARK = "#6c2817";
const PALE = "#fbd3ae";
const CREAM = "#f7ecd2";
const GOLD = "#eba72a";
const PUPIL = "#1c0c08";
const BRASS = "#d1a040";
const BRASS_DARK = "#8a6428";

// ---- proportions (metres, +Y up, faces +Z) -----------------------------------
const HEAD_C: [number, number, number] = [0, 0.33, 0];
const HEAD_R = 0.23;
const HEAD_S: [number, number, number] = [0.92, 1.12, 0.98];
const RAD: [number, number, number] = [
  HEAD_R * HEAD_S[0],
  HEAD_R * HEAD_S[1],
  HEAD_R * HEAD_S[2],
];
const ARM_BASE_Y = 0.15;
const ARM_BASE_R = 0.1;

type Arm = {
  az: number; // azimuth of the arm's outward direction, from +Z toward +X
  len: number;
  th0: number; // starting heading (in the arm's up/out plane)
  curl: number; // total heading change toward the tip (the curl)
  wob: number; // sideways sway
  phase: number;
};

const ARMS: Arm[] = [
  // arm 0: raised high, holding the key
  { az: 1.2, len: 0.62, th0: 0.5, curl: 0.9, wob: 0.03, phase: 0.0 },
  { az: 1.99, len: 0.7, th0: -0.9, curl: 3.4, wob: 0.1, phase: 0.3 },
  { az: 2.77, len: 0.6, th0: -0.85, curl: 3.0, wob: -0.11, phase: 0.8 },
  { az: 3.56, len: 0.74, th0: -0.95, curl: 3.7, wob: 0.12, phase: 0.1 },
  { az: 4.34, len: 0.62, th0: -0.8, curl: 3.1, wob: -0.1, phase: 0.6 },
  { az: 5.13, len: 0.72, th0: -0.92, curl: 3.6, wob: 0.09, phase: 0.4 },
  { az: 5.9, len: 0.58, th0: -0.85, curl: 2.8, wob: -0.08, phase: 0.9 },
  { az: 6.7, len: 0.7, th0: -0.9, curl: 3.5, wob: 0.1, phase: 0.2 },
];

// ---- small helpers -----------------------------------------------------------
const armRadius = (t: number) => 0.05 - 0.038 * t;

const norm = (v: number[]): number[] => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Basis whose +Z is `z`, used to orient flat geometry onto a surface. */
function facing(z: THREE.Vector3): THREE.Matrix4 {
  const zn = z.clone().normalize();
  const x = new THREE.Vector3(0, 1, 0).cross(zn).normalize();
  const y = new THREE.Vector3().crossVectors(zn, x);
  return new THREE.Matrix4().makeBasis(x, y, zn);
}

type Trace = { pts: number[][]; inner: number[][]; side: number[] };

/**
 * Integrates an arm's centreline: it leaves the mantle heading down, lies on
 * the reef, then curls up and over. `inner` is the concave side of the curl
 * (where the suckers sit), `side` the arm's lateral axis.
 */
function trace(a: Arm, steps: number): Trace {
  const R = [Math.cos(a.az), 0, Math.sin(a.az)];
  const W = [-Math.sin(a.az), 0, Math.cos(a.az)];
  const ds = a.len / steps;
  const pts: number[][] = [];
  const inner: number[][] = [];
  let u = 0;
  let v = 0;
  for (let k = 0; k <= steps; k++) {
    const s = k / steps;
    const th = a.th0 + a.curl * Math.pow(s, 1.5);
    const w = a.wob * Math.sin(Math.PI * (1.1 + a.phase) * s) * s;
    const r = ARM_BASE_R + u;
    pts.push([
      R[0] * r + W[0] * w,
      Math.max(ARM_BASE_Y + v, armRadius(s)), // rest on the reef, never below it
      R[2] * r + W[2] * w,
    ]);
    inner.push([-Math.sin(th) * R[0], Math.cos(th), -Math.sin(th) * R[2]]);
    if (k < steps) {
      const mid = a.th0 + a.curl * Math.pow(s + 0.5 / steps, 1.5);
      u += Math.cos(mid) * ds;
      v += Math.sin(mid) * ds;
    }
  }
  return { pts, inner, side: W };
}

export default function build() {
  const b = createBuilder({ name: "reef-octopus" });
  const rand = rng(41);

  const uniform = (): number[] => {
    const z = rand() * 2 - 1;
    const t = rand() * Math.PI * 2;
    const r = Math.sqrt(1 - z * z);
    return [r * Math.cos(t), z, r * Math.sin(t)];
  };

  // ---- skeleton first ------------------------------------------------------
  const root = b.joint("mantle", { at: HEAD_C });
  const chains = ARMS.map((a, i) =>
    b.chain(`arm${i}`, trace(a, 10).pts, { parent: root, role: "tentacle" }),
  );

  // ---- eye placement, computed on the mantle ellipsoid ----------------------
  const eyes = [0.6, -0.6].map((az) => {
    const el = 0.12;
    const d = norm([
      Math.sin(az) * Math.cos(el),
      Math.sin(el),
      Math.cos(az) * Math.cos(el),
    ]);
    const t = 1 / Math.hypot(d[0] / RAD[0], d[1] / RAD[1], d[2] / RAD[2]);
    const p = [d[0] * t, d[1] * t, d[2] * t];
    const n = norm([
      p[0] / (RAD[0] * RAD[0]),
      p[1] / (RAD[1] * RAD[1]),
      p[2] / (RAD[2] * RAD[2]),
    ]);
    const E = [
      HEAD_C[0] + p[0] + n[0] * 0.012,
      HEAD_C[1] + p[1] + n[1] * 0.012,
      HEAD_C[2] + p[2] + n[2] * 0.012,
    ];
    return { d, n, E, side: Math.sign(az) };
  });
  const nearEye = (d: number[]) => eyes.some((e) => dot(d, e.d) > 0.93);

  // ---- mantle: bulbous body, bumps and pale mottling -----------------------
  const head = b.part(new THREE.SphereGeometry(HEAD_R, 24, 16), CORAL, {
    at: HEAD_C,
    scale: HEAD_S,
  });
  const headSkin = b.surface(head);

  const N_BUMP = 130;
  for (let i = 0; i < N_BUMP; i++) {
    const y = 1 - (2 * i + 1) / N_BUMP;
    if (y < -0.45) continue;
    const r = Math.sqrt(1 - y * y);
    const phi = i * 2.399963;
    const d = norm([
      Math.cos(phi) * r + (rand() - 0.5) * 0.12,
      y + (rand() - 0.5) * 0.12,
      Math.sin(phi) * r + (rand() - 0.5) * 0.12,
    ]);
    if (nearEye(d)) continue;
    const hit = headSkin.ray(HEAD_C, d);
    if (hit) {
      b.stick(
        new THREE.SphereGeometry(0.009 + 0.01 * rand(), 5, 4),
        rand() < 0.6 ? RUST : RUST_DARK,
        hit,
      );
    }
  }

  for (let c = 0; c < 7; c++) {
    const centre = uniform();
    for (let j = 0; j < 6; j++) {
      const d = norm([
        centre[0] + (rand() - 0.5) * 0.45,
        centre[1] + (rand() - 0.5) * 0.45,
        centre[2] + (rand() - 0.5) * 0.45,
      ]);
      if (d[1] < -0.4 || nearEye(d)) continue;
      const hit = headSkin.ray(HEAD_C, d);
      if (hit) {
        b.stick(new THREE.SphereGeometry(0.02 + 0.012 * rand(), 6, 4), PALE, hit);
      }
    }
  }

  // ---- eyes: gold orbs, bar pupils, heavy grumpy brows ---------------------
  eyes.forEach((e) => {
    const N = new THREE.Vector3(e.n[0], e.n[1], e.n[2]);
    const M = facing(N);
    const up = new THREE.Vector3().setFromMatrixColumn(M, 1);

    b.part(new THREE.SphereGeometry(0.062, 14, 10), GOLD, { at: e.E });

    const pupil = new THREE.BoxGeometry(0.058, 0.02, 0.02);
    pupil.applyMatrix4(M);
    pupil.translate(N.x * 0.06, N.y * 0.06, N.z * 0.06);
    b.part(pupil, PUPIL, { at: e.E });

    // The brow slopes down toward the midline for a grumpy look.
    const brow = new THREE.BoxGeometry(0.13, 0.034, 0.06);
    brow.rotateZ(0.32 * e.side);
    brow.applyMatrix4(M);
    brow.translate(
      up.x * 0.058 + N.x * 0.014,
      up.y * 0.058 + N.y * 0.014,
      up.z * 0.058 + N.z * 0.014,
    );
    b.part(brow, RUST_DARK, { at: e.E });
  });

  // ---- arms: tapered tubes with suckers, warts and flecks ------------------
  ARMS.forEach((a, i) => {
    const tube = b.sweep(chains[i], { radius: armRadius, color: CORAL_ARM });
    const skin = b.surface(tube);
    const dense = trace(a, 40);

    // Two rows of cream suckers along the inside of the curl.
    for (let k = 6; k <= 34; k += 2) {
      const s = k / 40;
      for (const sg of [-1, 1]) {
        const al = 0.5 * sg;
        const dir = dense.inner[k].map(
          (c, j) => c * Math.cos(al) + dense.side[j] * Math.sin(al),
        );
        const hit = skin.ray(dense.pts[k], dir);
        if (hit) {
          b.stick(
            new THREE.SphereGeometry(0.0075 + 0.0045 * (1 - s), 6, 4),
            CREAM,
            hit,
          );
        }
      }
    }

    // Rust warts scattered around the arm.
    for (let k = 3; k <= 37; k += 4) {
      const phi = rand() * Math.PI * 2;
      const dir = dense.inner[k].map(
        (c, j) => c * Math.cos(phi) + dense.side[j] * Math.sin(phi),
      );
      const hit = skin.ray(dense.pts[k], dir);
      if (hit) {
        b.stick(new THREE.SphereGeometry(0.007 + 0.005 * rand(), 5, 4), RUST, hit);
      }
    }

    // A few pale flecks on the arm.
    for (let k = 5; k <= 35; k += 8) {
      const phi = rand() * Math.PI * 2;
      const dir = dense.inner[k].map(
        (c, j) => c * Math.cos(phi) + dense.side[j] * Math.sin(phi),
      );
      const hit = skin.ray(dense.pts[k], dir);
      if (hit) {
        b.stick(new THREE.SphereGeometry(0.011, 5, 4), PALE, hit);
      }
    }
  });

  // ---- the brass key, held up by the raised arm ----------------------------
  const keyPts = trace(ARMS[0], 10).pts;
  const tip = keyPts[keyPts.length - 1];
  const [kx, ky, kz] = tip;
  const yBot = ky - 0.1;
  const yTop = ky + 0.14;

  b.part(new THREE.CylinderGeometry(0.009, 0.009, yTop - yBot, 8), BRASS, {
    at: [kx, (yBot + yTop) / 2, kz],
  });
  b.part(new THREE.TorusGeometry(0.036, 0.01, 8, 16), BRASS, {
    at: [kx, yTop + 0.03, kz],
  });
  b.part(new THREE.BoxGeometry(0.05, 0.022, 0.016), BRASS_DARK, {
    at: [kx + 0.018, yBot + 0.012, kz],
  });
  for (let t = 0; t < 3; t++) {
    b.part(new THREE.BoxGeometry(0.009, 0.014, 0.016), BRASS_DARK, {
      at: [kx + 0.012 + t * 0.014, yBot - 0.004, kz],
    });
  }

  return b.root;
}
```