```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Octopus",
  description:
    "A stylised octopus: a coral mantle with plum spots over a peach belly, heavy-lidded gold eyes, a beak, a siphon, and eight curling arms lined with pale suckers.",
};

type V3 = [number, number, number];
type Sample = { p: V3; h: number; t: number; turned: number };

const COL = {
  coral: "#e4572e",
  peach: "#f7b58f",
  sucker: "#fde3d2",
  plum: "#7a2757",
  siphon: "#a8322a",
  white: "#fbf3e4",
  gold: "#e9a51c",
  pupil: "#1c0f16",
  beak: "#3b1d2e",
};

const CORE_Y = 0.4;
const CORE: V3 = [0, CORE_Y, 0];
const EYE_AZ = 0.66; // eyes sit about 38 degrees either side of the front

// Mantle outline as [radius, height above the core], bottom to top.
const MANTLE: [number, number][] = [
  [0.0, -0.17], [0.085, -0.17], [0.125, -0.14], [0.145, -0.09], [0.152, -0.03],
  [0.15, 0.0], [0.14, 0.07], [0.12, 0.13], [0.085, 0.18], [0.04, 0.2], [0.0, 0.205],
];

const ARM_N = 12;         // joints per arm
const ARM_SAMPLES = 240;  // dense samples used to shape each arm
const CURL_START = 0.3;   // fraction of each arm that runs straight before it curls
const ROOT_R = 0.1;       // arm roots ring the underside of the mantle
const CURL_SIGN = [1, -1, 1, -1, -1, 1, -1, 1];

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

function mantleR(y: number): number {
  for (let i = 0; i < MANTLE.length - 1; i++) {
    const [r0, y0] = MANTLE[i];
    const [r1, y1] = MANTLE[i + 1];
    if (y1 > y0 && y >= y0 && y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return 0;
}

function lathe(profile: [number, number][], seg: number) {
  return new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg);
}

// A point on the eye ring: azimuth around the mantle, radius out from the axis, height relative to the core.
function ringPoint(az: number, rr: number, yRel: number): V3 {
  return [rr * Math.sin(az), CORE_Y + yRel, rr * Math.cos(az)];
}

function armRadius(t: number): number {
  return 0.044 - 0.031 * t;
}

// Height of the arm centreline: drapes from the mantle, lies on the floor, then coils upward at the tip.
function armY(t: number): number {
  const drape = 0.2 * Math.pow(Math.max(0, 1 - t / 0.42), 2);
  const coil = 0.09 * Math.pow(Math.max(0, (t - CURL_START) / (1 - CURL_START)), 1.5);
  return armRadius(t) + drape + coil;
}

// Walks one arm across the floor: straight outward, then curling with increasing curvature.
function armSamples(i: number): Sample[] {
  const base = (i / 8) * Math.PI * 2 + 0.18 * Math.sin(i * 2.1);
  const len = 0.54 + 0.05 * Math.sin(i * 1.7 + 0.4);
  const turn = 2.2 + 0.4 * Math.cos(i * 1.3 + 0.5);
  const sign = CURL_SIGN[i];
  const K = (turn * 2.5) / (len * (1 - CURL_START));
  const ds = len / (ARM_SAMPLES - 1);

  let x = ROOT_R * Math.cos(base);
  let z = ROOT_R * Math.sin(base);
  let h = base;
  let turned = 0;
  const out: Sample[] = [];
  for (let j = 0; j < ARM_SAMPLES; j++) {
    const t = j / (ARM_SAMPLES - 1);
    out.push({ p: [x, armY(t), z], h, t, turned });
    const u = Math.max(0, (t - CURL_START) / (1 - CURL_START));
    const dh = sign * K * Math.pow(u, 1.5) * ds;
    h += dh;
    turned += Math.abs(dh);
    x += Math.cos(h) * ds;
    z += Math.sin(h) * ds;
  }
  return out;
}

// Joints spaced evenly by a mix of arc length and turning, so the curl gets enough bones.
function armChain(S: Sample[]): V3[] {
  const total = S[S.length - 1].turned || 1;
  const metric = (s: Sample) => s.t + s.turned / total;
  const pts: V3[] = [];
  let prev = -1;
  for (let k = 0; k < ARM_N; k++) {
    const target = (2 * k) / (ARM_N - 1);
    let best = prev + 1;
    for (let j = prev + 1; j < S.length; j++) {
      if (Math.abs(metric(S[j]) - target) <= Math.abs(metric(S[best]) - target)) best = j;
    }
    pts.push(S[best].p);
    prev = best;
  }
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "octopus" });
  const core = b.joint("core", { at: CORE });

  // Mantle: a coral dome over a peach belly, split at the equator
  b.part({ geo: lathe(MANTLE.slice(5), 24), color: COL.coral, at: CORE });
  b.part({ geo: lathe(MANTLE.slice(0, 6), 24), color: COL.peach, at: CORE });

  // Plum spots over the dome, on a golden-angle spiral, kept clear of the eyes
  for (let k = 0; k < 34; k++) {
    const az = k * 2.39996;
    const yRel = 0.03 + 0.14 * ((k * 0.618034) % 1);
    const nearEye =
      Math.min(Math.abs(wrap(az - EYE_AZ)), Math.abs(wrap(az + EYE_AZ))) < 0.42;
    if (yRel < 0.11 && nearEye) continue;
    const r = 0.009 + 0.008 * ((k * 0.37) % 1);
    const R = mantleR(yRel) - r * 0.3;
    b.part({
      geo: new THREE.SphereGeometry(r, 8, 6),
      color: COL.plum,
      at: [R * Math.sin(az), CORE_Y + yRel, R * Math.cos(az)],
    });
  }

  // Heavy-lidded gold eyes on the front flanks, each with its own joint
  for (const side of [1, -1]) {
    const az = side * EYE_AZ;
    const eyeAt = ringPoint(az, 0.135, 0.02);
    b.joint(side > 0 ? "eyeL" : "eyeR", { at: eyeAt, parent: core });

    b.part({ geo: new THREE.SphereGeometry(0.042, 18, 12), color: COL.white, at: eyeAt });
    b.part({
      geo: new THREE.SphereGeometry(0.024, 14, 10),
      color: COL.gold,
      at: ringPoint(az, 0.16, 0.02),
    });
    // Horizontal slot pupil, turned to face outward from the eye
    b.part({
      geo: new THREE.SphereGeometry(0.02, 12, 8).scale(1.8, 0.45, 0.6).rotateY(az),
      color: COL.pupil,
      at: ringPoint(az, 0.18, 0.02),
    });
    // Lid: a cap over the top of the eye, in mantle colour
    b.part({
      geo: new THREE.SphereGeometry(0.047, 18, 10, 0, Math.PI * 2, 0, 1.35),
      color: COL.coral,
      at: [eyeAt[0], eyeAt[1] + 0.012, eyeAt[2]],
    });
  }

  // Beak: upper and lower mandibles on their own joints, pointing down
  b.joint("jawU", { at: [0, 0.224, 0.006], parent: core });
  b.joint("jawL", { at: [0, 0.2, 0], parent: core });
  b.part({
    geo: new THREE.ConeGeometry(0.02, 0.046, 8).rotateX(Math.PI),
    color: COL.beak,
    at: [0, 0.224, 0.006],
  });
  b.part({
    geo: new THREE.ConeGeometry(0.016, 0.034, 8).rotateX(Math.PI),
    color: COL.beak,
    at: [0, 0.2, 0],
  });

  // Siphon: a short tube angled forward and down from the mantle
  b.part({
    geo: new THREE.CylinderGeometry(0.02, 0.026, 0.08, 10).rotateX(Math.PI / 2 + 0.3),
    color: COL.siphon,
    at: [0, 0.32, 0.14],
  });

  // Eight arms: a bending skin along a chain, with suckers on the inside of the curl
  for (let i = 0; i < 8; i++) {
    const S = armSamples(i);
    const arm = b.chain(`arm${i}`, armChain(S), { parent: core, role: "tentacle" });
    b.sweep(arm, { radius: armRadius, color: COL.coral });

    const sign = CURL_SIGN[i];
    for (let k = 0; k < 13; k++) {
      const s = S[Math.round((0.08 + k * 0.07) * (S.length - 1))];
      const r = armRadius(s.t);
      const nx = -sign * Math.sin(s.h);
      const nz = sign * Math.cos(s.h);
      b.part({
        geo: new THREE.SphereGeometry(Math.max(0.006, 0.36 * r), 7, 5),
        color: COL.sucker,
        at: [s.p[0] + nx * r * 0.88, s.p[1] + r * 0.3, s.p[2] + nz * r * 0.88],
      });
    }

    // Plum rings along the top of the arm
    for (const t of [0.26, 0.46, 0.66, 0.84]) {
      const s = S[Math.round(t * (S.length - 1))];
      const r = armRadius(s.t);
      b.part({
        geo: new THREE.SphereGeometry(0.5 * r, 8, 6),
        color: COL.plum,
        at: [s.p[0], s.p[1] + r * 0.85, s.p[2]],
      });
    }
  }

  return b.root;
}
```