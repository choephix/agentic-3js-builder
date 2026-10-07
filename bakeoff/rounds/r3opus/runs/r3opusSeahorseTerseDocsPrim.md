```ts
import * as THREE from "three";
import { createBuilder, catmull, frame, paint, spots } from "agentic-3js-builder";

export const meta = {
  name: "Seahorse",
  description:
    "A stylized, rigged seahorse in its rest pose. It has a faceted armoured body with banded rings, a tail curled on the floor, turquoise fan fins with rays, a spiked coronet, big golden eyes and a long snout split into upper and lower jaws.",
};

const BODY = "#f4a23c";
const BAND = "#c9512f";
const BELLY = "#ffe2a8";
const BELLY_BAND = "#f2b36b";
const SPECK = "#fff0c4";
const FIN = "#63d8d2";
const FIN2 = "#2f9fb0";
const SPIKE = "#fff4d6";
const EYE = "#ffd23f";
const PUPIL = "#1c1830";
const WHITE = "#ffffff";
const BLUSH = "#ff7a6b";
const LIP = "#9c3b25";

export default function build() {
  const b = createBuilder({ name: "seahorse" });

  // ---- one continuous centreline: tail tip (curled) -> hips -> neck top ----
  const pts: number[][] = [
    [0, 0.026, 0.012], // tail tip, inside the curl
    [0, 0.033, 0.022],
    [0, 0.026, 0.034],
    [0, 0.012, 0.034],
    [0, 0.006, 0.02], // lowest point of the curl
    [0, 0.012, 0.004],
    [0, 0.03, -0.008],
    [0, 0.055, -0.012],
    [0, 0.08, -0.008], // hips
    [0, 0.105, 0.0], // belly
    [0, 0.13, 0.004],
    [0, 0.15, 0.0], // chest
    [0, 0.168, -0.008], // neck
    [0, 0.18, -0.005], // top of neck
  ];
  const body = catmull(pts);
  const HIPS = pts[8];

  const core = b.joint("hips", { at: HIPS, role: "spine" });
  const rootT = body.closestT(HIPS);
  const spine = b.chain("spine", body.slice(rootT, 1), {
    parent: core,
    count: 4,
    names: ["spine1", "spine2", "chest", "neck"],
    role: "spine",
  });
  const tail = b.chain("tail", body.slice(rootT, 0), { parent: core, count: 7, role: "tail" });
  const neck = spine.joints[3];

  // ---- radius profile ----
  const radiusAt = (t: number) => {
    if (t < rootT) return 0.0028 + 0.0117 * (t / rootT);
    const u = (t - rootT) / (1 - rootT);
    if (u < 0.4) {
      const k = u / 0.4;
      return 0.0145 + 0.0065 * (k * k * (3 - 2 * k));
    }
    const k = (u - 0.4) / 0.6;
    return 0.021 - 0.0115 * k;
  };

  // ---- paints ----
  const speck = spots(BODY, SPECK, { size: 0.012, amount: 0.22, seed: 3 });
  const bodyPaint = paint((p, n, s) => {
    const ring = (s[0] * 34) % 1 < 0.14;
    const belly = p.y > 0.08 && n.z > 0.45;
    if (ring) return belly ? BELLY_BAND : BAND;
    return belly ? BELLY : speck;
  });

  const torso = b.sweep(
    body,
    (t: number) => {
      const r = radiusAt(t);
      return [r * 0.82, r];
    },
    { bone: [tail, core, spine], color: bodyPaint, section: { ngon: 8 } },
  );

  // ---- spikes along the back / outer curl ----
  const curlC = new THREE.Vector3(0, 0.02, 0.02);
  const backAt = (t: number) => {
    const a = torso.at(t, 0);
    const c = torso.at(t, 180);
    if (t < 0.42) return a.at.distanceTo(curlC) > c.at.distanceTo(curlC) ? a : c;
    return a.at.z < c.at.z ? a : c;
  };

  const tD = rootT + 0.09; // dorsal fin station
  const N = 32;
  for (let i = 0; i < N; i++) {
    const t = 0.06 + ((0.965 - 0.06) * i) / (N - 1);
    if (Math.abs(t - tD) < 0.05) continue;
    const sp = backAt(t);
    const r = radiusAt(t);
    const jitter = 1 + 0.25 * Math.sin(i * 2.7);
    b.spike(sp.moved([0, -0.0005, 0]), sp, (r * 0.32 + 0.0014) * jitter, r * 0.12 + 0.0006, { color: SPIKE });
  }

  // side tubercles: the bony ridge knobs
  for (const deg of [90, 270]) {
    for (let i = 0; i < 7; i++) {
      const t = rootT + 0.03 + ((0.92 - rootT - 0.03) * i) / 6;
      b.stick(new THREE.IcosahedronGeometry(0.0017, 0), SPIKE, torso.at(t, deg), { flat: true });
    }
    for (let i = 0; i < 8; i++) {
      const t = 0.14 + ((rootT - 0.02 - 0.14) * i) / 7;
      b.stick(new THREE.IcosahedronGeometry(0.0011 + 0.0006 * (t / rootT), 0), SPIKE, torso.at(t, deg), {
        flat: true,
      });
    }
  }

  // ---- dorsal fin ----
  const dsp = backAt(tD);
  const dorsalPaint = paint((_p, _n, uv) => {
    if (uv[1] < 0.0012) return BAND;
    const k = Math.floor((uv[0] + 0.02) / 0.0024);
    return ((k % 2) + 2) % 2 === 0 ? FIN2 : FIN;
  });
  b.extrude(
    [
      [-0.013, -0.002, "sharp"],
      [0.013, -0.002, "sharp"],
      [0.012, 0.006],
      [0.004, 0.013],
      [-0.008, 0.011],
      [-0.013, 0.004],
    ],
    {
      at: dsp,
      x: [0, 1, 0],
      y: [0, 0, -1],
      thickness: 0.0012,
      bevel: 0.0003,
      smoothing: 1,
      color: dorsalPaint,
      name: "dorsalFin",
    },
  );

  // ---- pectoral fins ----
  const pecPaint = paint((_p, _n, uv) => {
    const a = Math.atan2(uv[1], uv[0]);
    const k = Math.floor((a + 0.1) / 0.16);
    return ((k % 2) + 2) % 2 === 0 ? FIN : FIN2;
  });
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.013, 0.001],
        [0.012, 0.007],
        [0.007, 0.0105],
        [0.002, 0.008],
      ],
      {
        at: [s * 0.0085, 0.158, -0.006],
        x: [0, 1, 0],
        y: [s, 0, -0.6],
        thickness: 0.001,
        bevel: 0.0003,
        smoothing: 1,
        color: pecPaint,
        bone: neck,
        name: s > 0 ? "pectoralFinL" : "pectoralFinR",
      },
    );
  }

  // ---- head ----
  const head = b.joint("head", { parent: neck, at: pts[13], dir: [0, -0.25, 1], role: "head" });

  b.capsule(head.local({ back: 0.005, up: 0.007 }), head.local({ forward: 0.011, up: 0.002 }), 0.0105, {
    bone: head,
    color: speck,
    name: "skull",
  });

  // snout (upper jaw)
  const F = head.local({ forward: 0.012, down: 0.0005 });
  const T = head.local({ forward: 0.043, down: 0.0045 });
  const snoutDir = new THREE.Vector3().subVectors(T, F).normalize();
  const snoutPaint = paint((_p, _n, uv) => (uv[0] > 0.86 ? BAND : uv[0] > 0.45 && uv[0] < 0.52 ? BAND : speck));
  b.rod(F, T, [0.0044, 0.0036], { bone: head, color: snoutPaint, name: "snout" });
  b.part(new THREE.CylinderGeometry(0.0046, 0.0038, 0.003, 8), LIP, {
    at: T,
    dir: snoutDir,
    bone: head,
    name: "upperLip",
  });

  // lower jaw
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.016, down: 0.0045 }),
    aim: head.local({ forward: 0.0425, down: 0.0075 }),
    role: "jaw",
  });
  const J2 = head.local({ forward: 0.0425, down: 0.0075 });
  b.rod(jaw.at, J2, [0.0029, 0.0026], { bone: jaw, color: BELLY, name: "lowerJaw" });
  b.part(new THREE.SphereGeometry(0.0029, 8, 6), LIP, { at: J2, bone: jaw, name: "lowerLip" });

  // eyes
  for (const s of [1, -1]) {
    const E = head.local({ left: s * 0.0085, up: 0.004, forward: 0.006 });
    const gaze = new THREE.Vector3(s * 0.8, 0.15, 0.55).normalize();
    b.part(new THREE.SphereGeometry(0.0055, 10, 8), EYE, { at: E, bone: head, name: s > 0 ? "eyeL" : "eyeR" });
    const P = E.clone().addScaledVector(gaze, 0.0036);
    b.part(new THREE.SphereGeometry(0.0029, 8, 6), PUPIL, { at: P, bone: head });
    b.part(new THREE.SphereGeometry(0.001, 6, 4), WHITE, {
      at: E.clone().addScaledVector(gaze, 0.0058).add(new THREE.Vector3(0, 0.0016, 0.0005)),
      bone: head,
    });
    b.part(new THREE.TorusGeometry(0.0055, 0.0011, 4, 12), BAND, {
      at: E.clone().addScaledVector(gaze, 0.0012),
      dir: gaze,
      axis: "z",
      bone: head,
    });
    // brow spike
    b.spike(head.local({ left: s * 0.0075, up: 0.0105, forward: 0.006 }), [s * 0.45, 1, 0.3], 0.0045, 0.0013, {
      color: SPIKE,
      bone: head,
    });
    // cheek spine, pointing back
    b.spike(head.local({ left: s * 0.009, down: 0.004, back: 0.002 }), [s * 0.5, -0.3, -1], 0.004, 0.0011, {
      color: SPIKE,
      bone: head,
    });
    // blush
    b.part(new THREE.SphereGeometry(0.0038, 8, 6), BLUSH, {
      at: head.local({ left: s * 0.0101, down: 0.0035, forward: 0.0005 }),
      bone: head,
      scale: [0.35, 0.8, 1.2],
    });
  }

  // coronet
  const crownBase = head.local({ up: 0.011, back: 0.002 });
  const C = head.local({ up: 0.019, back: 0.003 });
  b.rod(crownBase, C, [0.0052, 0.0036], { bone: head, color: speck, name: "coronet" });
  b.ring(frame(C, [0, 1, 0]), { count: 5, radius: 0.003, tilt: 40 }, (it) => {
    b.spike(it, it, 0.0045, 0.0012, { color: SPIKE, bone: head });
  });
  b.spike(C, [0, 1, 0.1], 0.004, 0.0015, { color: SPIKE, bone: head });

  return b.root;
}
```