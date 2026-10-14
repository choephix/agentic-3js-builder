```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { catmull } from "agentic-3js-builder";
import { limb } from "agentic-3js-builder";

export const meta = {
  name: "Nine-banded armadillo",
  description:
    "Trotting-pose armadillo with a banded dusty pink-tan shell, pointed snout, tall ears, clawed feet, an armoured tapering tail and pale hairs between the bands.",
};

const PLATE = "#c79d8b";
const PLATE2 = "#b98b7b";
const SHIELD = "#bd917f";
const STUD = "#d6b3a1";
const SKIN = "#a67d6e";
const BELLY = "#d9bca9";
const EAR = "#b0796d";
const EAR_IN = "#d99a92";
const CLAW = "#efe3d2";
const HAIR = "#f1e8da";
const DARK = "#1c1412";
const NOSE = "#7d5348";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "armadillo" });
  const r = rng(11);
  const CY = 0.165;

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, CY, -0.22] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, CY, -0.22],
      [0, CY, -0.075],
      [0, CY, 0.075],
      [0, CY, 0.22],
    ]),
    { parent: hips, role: "spine" },
  );
  const [sp1, sp2, sp3] = spine.joints;
  const boneAt = (z: number) => (z < -0.075 ? sp1 : z < 0.075 ? sp2 : sp3);

  const neck = b.chain(
    "neck",
    catmull([
      [0, CY, 0.2],
      [0, CY - 0.005, 0.27],
      [0, CY - 0.012, 0.33],
    ]),
    { parent: sp3, names: ["neck1", "neck2", "head"], role: "neck" },
  );
  const head = neck.tip!;
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.04, up: -0.035 }),
    aim: head.local({ forward: 0.14, up: -0.06 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, CY - 0.005, -0.23],
      [0, CY - 0.02, -0.38],
      [0, 0.1, -0.52],
      [0, 0.06, -0.66],
    ]),
    { parent: sp1, count: 5, role: "tail" },
  );

  // ---------- body ----------
  const env = (z: number) => Math.sqrt(Math.max(0, 1 - (z / 0.27) ** 2));
  const belly = b.sweep(spine, (t) => {
    const e = env(-0.22 + 0.44 * t);
    return [0.1 * e + 0.015, 0.08 * e + 0.015];
  }, { color: BELLY, sectors: [[-80, 80, SKIN]], sides: 10 });

  // ---------- shell bands ----------
  const arc = (250 * Math.PI) / 180;
  const rot = (-35 * Math.PI) / 180;
  const studGeo = new THREE.SphereGeometry(0.0075, 5, 3);
  studGeo.scale(1, 1, 0.65);
  const band = (z: number, tube: number, color: string, extra: number, studs: boolean) => {
    const e = env(z);
    const rx = 0.115 * e + 0.012 + extra;
    const ry = 0.092 * e + 0.012 + extra;
    const k = ry / rx;
    const g = new THREE.TorusGeometry(rx, tube, 5, 16, arc);
    g.rotateZ(rot);
    g.scale(1, k, 1);
    b.part(g, color, { at: [0, CY, z], bone: boneAt(z), flat: true });
    if (studs) {
      for (let i = 0; i < 9; i++) {
        const a = (-70 + i * (140 / 8)) * (Math.PI / 180);
        const px = Math.sin(a) * (rx + tube);
        const py = Math.cos(a) * (ry + k * tube);
        b.part(studGeo, STUD, {
          at: [px, CY + py, z],
          dir: [Math.sin(a), Math.cos(a) * 1.2, 0],
          bone: boneAt(z),
          flat: true,
        });
      }
    }
  };
  // scapular shield (front)
  [0.2, 0.175, 0.15, 0.125].forEach((z, i) => band(z, 0.02, SHIELD, i * 0.002, true));
  // nine movable bands
  for (let i = 0; i < 9; i++) {
    const z = 0.095 - i * 0.025;
    band(z, 0.017, i % 2 ? PLATE2 : PLATE, (i % 2) * 0.003, false);
  }
  // pelvic shield (rear)
  [-0.13, -0.155, -0.18, -0.205, -0.23].forEach((z, i) => band(z, 0.02, SHIELD, 0.002 - i * 0.001, true));

  // coarse pale hairs poking from between the bands
  for (let i = 0; i < 9; i++) {
    const zb = 0.095 - i * 0.025 - 0.014;
    const e = env(zb);
    const rx = 0.115 * e + 0.03;
    const ry = 0.092 * e + 0.03;
    for (const s of [1, -1]) {
      for (let j = 0; j < 2; j++) {
        const a = ((100 + r() * 25) * Math.PI) / 180;
        const z = zb + (r() - 0.5) * 0.012;
        b.spike(
          [s * rx * Math.sin(a), CY + ry * Math.cos(a), z],
          [s * 0.8, -0.35, -0.45 + r() * 0.3],
          0.03 + r() * 0.025,
          0.0028,
          { color: HAIR, bone: boneAt(z), sides: 4 },
        );
      }
    }
  }
  // belly hairs
  for (const hit of b.surface(belly).scatter(40, { rng: rng(5), minDist: 0.04, filter: (h) => h.n.y < -0.2 })) {
    b.spike(hit, hit, 0.03, 0.0025, { color: HAIR, sides: 4 });
  }

  // ---------- head ----------
  const skull = new THREE.SphereGeometry(0.056, 8, 6);
  skull.scale(0.88, 0.85, 1.1);
  b.part(skull, SKIN, { bone: head, at: head.local({ forward: 0.015 }), flat: true });
  const cap = new THREE.SphereGeometry(0.059, 8, 4, 0, Math.PI * 2, 0, 1.25);
  cap.scale(0.88, 0.85, 1.12);
  b.part(cap, SHIELD, { bone: head, at: head.local({ forward: 0.015, up: 0.004 }), flat: true });
  b.part(new THREE.ConeGeometry(0.047, 0.17, 6), SKIN, {
    bone: head,
    at: head.local({ forward: 0.095, up: -0.012 }),
    dir: [0, -0.2, 1],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.012, 6, 4), NOSE, {
    bone: head,
    at: head.local({ forward: 0.178, up: -0.036 }),
    flat: true,
  });
  b.part(new THREE.ConeGeometry(0.03, 0.11, 6), BELLY, {
    bone: jaw,
    at: jaw.local({ forward: 0.05, down: 0.004 }),
    dir: [0, -0.15, 1],
    flat: true,
  });

  for (const s of [1, -1]) {
    const base = head.local({ up: 0.04, forward: -0.02, left: s * 0.04 });
    b.extrude(
      [[-0.03, 0], [0.03, 0], [0.034, 0.075], [0, 0.135, "sharp"], [-0.034, 0.075]],
      { at: base, x: [1, 0, 0], y: [s * 0.3, 1, -0.25], thickness: 0.008, smoothing: 1, color: EAR, bone: head },
    );
    b.extrude(
      [[-0.018, 0.008], [0.018, 0.008], [0.02, 0.07], [0, 0.112, "sharp"], [-0.02, 0.07]],
      {
        at: head.local({ up: 0.04, forward: -0.015, left: s * 0.04 }),
        x: [1, 0, 0], y: [s * 0.3, 1, -0.25], thickness: 0.006, smoothing: 1, color: EAR_IN, bone: head,
      },
    );
    const eyeAt = head.local({ left: s * 0.044, up: 0.02, forward: 0.035 });
    b.part(new THREE.SphereGeometry(0.0115, 6, 4), DARK, { bone: head, at: eyeAt, flat: true });
    b.part(new THREE.SphereGeometry(0.0035, 4, 3), "#ffffff", {
      bone: head,
      at: head.local({ left: s * 0.052, up: 0.025, forward: 0.04 }),
    });
  }

  // ---------- legs ----------
  const legs: [string, number, number, number, boolean][] = [
    ["HL", 1, -0.17, -0.2, false],
    ["HR", -1, -0.17, -0.2, false],
    ["FL", 1, 0.14, 0.17, true],
    ["FR", -1, 0.14, 0.17, true],
  ];
  for (const [tag, s, hz, fz, front] of legs) {
    const x = s * 0.085;
    const pts = limb(
      [x, 0.135, hz],
      [x, 0.03, fz],
      [0.085, 0.08],
      [[0, 0, front ? -1 : 1]],
    );
    const names = front
      ? [`shoulder${tag}`, `elbow${tag}`, `wrist${tag}`]
      : [`hip${tag}`, `knee${tag}`, `ankle${tag}`];
    const leg = b.chain(`leg${tag}`, pts, {
      parent: front ? sp3 : sp1,
      names,
      role: "leg",
      contact: [x, 0, fz],
    });
    b.sweep(leg, (t) => 0.043 - 0.016 * t, { color: SKIN, sides: 8 });
    const foot = leg.tip!;
    b.part(new THREE.BoxGeometry(0.056, 0.03, 0.07), SKIN, { bone: foot, at: [x, 0.015, fz + 0.018], flat: true });
    const cl = front ? 0.06 : 0.045;
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.ConeGeometry(0.011, cl, 5), CLAW, {
        bone: foot,
        at: [x + k * 0.019, 0.017, fz + 0.05 + cl / 2],
        dir: [k * 0.1, -0.12, 1],
        flat: true,
      });
    }
  }

  // ---------- tail ----------
  const tr = (t: number) => 0.046 * (1 - t) + 0.005;
  b.sweep(tail, tr, { color: SKIN, caps: { end: "point" }, sides: 8 });
  b.along(tail, 11, (pt) => {
    const rr = tr(pt.t) + 0.004;
    b.part(new THREE.TorusGeometry(rr, 0.011 * (1 - pt.t) + 0.004, 4, 9), pt.t % 0.2 > 0.1 ? PLATE2 : PLATE, {
      frame: pt,
      dir: pt.axis,
      axis: "z",
      flat: true,
    });
  });

  return b.root;
}
```