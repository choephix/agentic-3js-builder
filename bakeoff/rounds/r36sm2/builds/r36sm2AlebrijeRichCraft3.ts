import * as THREE from "three";
import { createBuilder, rng, catmull, limb, countershade, spots, stripes, paint, svg, glow } from "../../../../src/index";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description: "Oaxacan painted-wood alebrije: a jaguar body with an eagle's head, wings and a feathered tail, covered in bright dots, rosettes and flowers.",
};

const PAL = ["#e4207a", "#00a6a6", "#ffc400", "#7a2bbf", "#ff6a00", "#2d9d3a"];
const ORANGE = "#ff8a1c";
const PURPLE = "#4b1a7a";
const CREAM = "#ffe58a";
const BONE = "#fff3d6";
const BEAK = "#ffc21a";

type V = [number, number, number];

const FLOWER = svg(
  `<svg viewBox="0 0 100 100">
  <g transform="translate(50 50)">
  ${[0, 45, 90, 135, 180, 225, 270, 315]
    .map((a, i) => `<ellipse cx="0" cy="-30" rx="9" ry="17" fill="${PAL[i % 6]}" stroke="#2a0e45" stroke-width="2.5" transform="rotate(${a})"/>`)
    .join("")}
  <circle r="17" fill="#ffe58a" stroke="#2a0e45" stroke-width="3"/>
  <circle r="9" fill="#e4207a" stroke="#2a0e45" stroke-width="2"/>
  <circle r="3" fill="#ffffff"/>
  ${[0, 60, 120, 180, 240, 300].map((a) => `<circle cx="0" cy="-42" r="3" fill="#ffffff" transform="rotate(${a + 20})"/>`).join("")}
  </g></svg>`,
  { size: 192 },
);

const EYE = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#e4207a" stroke="#2a0e45" stroke-width="4"/>
  <circle cx="50" cy="50" r="36" fill="#ffffff" stroke="#2a0e45" stroke-width="3"/>
  <circle cx="50" cy="50" r="27" fill="#ffc400" stroke="#2a0e45" stroke-width="3"/>
  <circle cx="50" cy="50" r="15" fill="#120620"/>
  <circle cx="42" cy="41" r="6" fill="#ffffff"/>
  ${[0, 40, 80, 120, 160, 200, 240, 280, 320].map((a) => `<circle cx="50" cy="4" r="2.5" fill="#00a6a6" transform="rotate(${a} 50 50)"/>`).join("")}
  </svg>`,
  { size: 128 },
);

const SWIRL = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 32 m0 -4 a4 4 0 1 1 -4 4 a8 8 0 1 1 8 8 a12 12 0 1 1 -12 -12" fill="none" stroke="#fff3d6" stroke-width="3.5" stroke-linecap="round"/>
  <circle cx="54" cy="10" r="4" fill="#00a6a6"/><circle cx="10" cy="54" r="4" fill="#e4207a"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "alebrije" });
  const R = rng(11);

  const coat = countershade(
    spots(ORANGE, ["#6b1e8f", "#0aa3a0", "#e4207a"], { size: 0.1, amount: 0.65, rosette: true, seed: 3 }),
    CREAM,
    { level: -0.35 },
  );
  const legPaint = stripes(ORANGE, [PURPLE, "#00a6a6"], { size: 0.07, axis: "y", width: 0.4 });
  const tailPaint = stripes(ORANGE, PURPLE, { size: 0.13, axis: "z", width: 0.45 });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.65, -0.35], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.65, -0.35], [0, 0.68, 0], [0, 0.72, 0.35]]), {
    parent: hips, names: ["spine1", "spine2"], role: "spine",
  });
  const H: V = [0, 1.15, 0.72];
  const neck = b.chain("neck", catmull([[0, 0.72, 0.35], [0, 0.95, 0.55], H]), {
    parent: spine.joints[1], names: ["neck1", "neck2"], role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: H, dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head, at: [0, H[1] - 0.06, H[2] + 0.05], aim: [0, H[1] - 0.08, H[2] + 0.22], role: "jaw",
  });

  // ---------- body ----------
  const body = b.sweep(spine, (t) => [0.19 + 0.04 * t, 0.21], { color: coat });
  b.part(new THREE.SphereGeometry(0.2, 12, 9), coat, { bone: hips, at: [0, 0.65, -0.37], scale: [1, 1.05, 1.05] });
  b.part(new THREE.SphereGeometry(0.24, 12, 9), coat, { bone: spine.joints[1], at: [0, 0.71, 0.33], scale: [1, 1, 1] });
  b.sweep(neck, [0.15, 0.11], { color: coat });

  // flank flowers and swirls
  for (const s of [1, -1]) {
    b.decal(body, FLOWER, { at: [s * 0.2, 0.7, -0.02], dir: [s, 0, 0], size: [0.32, 0.32], mirror: s < 0 });
    b.decal(body, SWIRL, { at: [s * 0.2, 0.72, 0.28], dir: [s, 0, 0], size: [0.18, 0.18] });
  }
  const skin = b.surface(body);
  skin.scatter(50, { rng: R, minDist: 0.075, filter: (h) => h.n.y > -0.1 }).forEach((h, i) =>
    b.stick(new THREE.SphereGeometry(0.014, 5, 4), i % 3 ? "#fff3d6" : PAL[i % 6], h, { embed: 0.4 }),
  );

  // neck ruff
  b.ring(neck.joints[0], { count: 12, radius: 0.15, tilt: -45 }, (it) =>
    b.spike(it, it, 0.17, 0.04, { color: PAL[it.i % 6] }),
  );
  b.ring(neck.joints[1], { count: 10, radius: 0.12, tilt: -50 }, (it) =>
    b.spike(it, it, 0.13, 0.032, { color: PAL[(it.i + 3) % 6] }),
  );

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(0.13, 12, 9), coat, { bone: head, at: H, scale: [1, 0.95, 1.1] });
  const bdir: V = [0, -0.3, 1];
  b.part(new THREE.ConeGeometry(0.075, 0.24, 6), BEAK, {
    bone: head, at: [0, H[1] - 0.02, H[2] + 0.2], dir: bdir, scale: [0.85, 1, 1], flat: true,
  });
  b.part(new THREE.ConeGeometry(0.032, 0.08, 6), "#e8941a", {
    bone: head, at: [0, H[1] - 0.075, H[2] + 0.3], dir: [0, -1, 0.35], flat: true,
  });
  b.part(new THREE.ConeGeometry(0.055, 0.17, 6), "#f0a818", {
    bone: jaw, at: [0, H[1] - 0.095, H[2] + 0.17], dir: [0, -0.12, 1], scale: [0.85, 1, 0.9], flat: true,
  });
  for (const s of [1, -1]) {
    // nostrils
    b.part(new THREE.SphereGeometry(0.013, 5, 4), PURPLE, { bone: head, at: [s * 0.03, H[1] + 0.0, H[2] + 0.2] });
    // eyes
    const n = new THREE.Vector3(s * 0.1, 0.05, 0.07).normalize();
    b.part(new THREE.CircleGeometry(0.052, 14), "#ffffff", {
      bone: head, at: [H[0] + n.x * 0.14, H[1] + n.y * 0.14, H[2] + n.z * 0.14], dir: [n.x, n.y, n.z], axis: "z", texture: EYE,
    });
    // brow
    b.rod([s * 0.04, H[1] + 0.105, H[2] + 0.095], [s * 0.12, H[1] + 0.08, H[2] + 0.04], 0.013, { bone: head, color: PURPLE });
    // ears
    b.part(new THREE.SphereGeometry(0.05, 8, 6), ORANGE, { bone: head, at: [s * 0.09, H[1] + 0.12, H[2] - 0.03], scale: [0.8, 1, 0.8] });
    b.part(new THREE.SphereGeometry(0.03, 6, 5), "#e4207a", { bone: head, at: [s * 0.09, H[1] + 0.125, H[2] - 0.01], scale: [0.7, 0.9, 0.5] });
    // cheek dots
    for (let k = 0; k < 3; k++)
      b.part(new THREE.SphereGeometry(0.011, 5, 4), k % 2 ? "#ffffff" : "#00a6a6", {
        bone: head, at: [s * (0.115 - k * 0.012), H[1] - 0.04 - k * 0.012, H[2] + 0.02 + k * 0.03],
      });
  }
  // crest
  for (let i = 0; i < 9; i++) {
    const a = ((20 + i * 15) * Math.PI) / 180;
    const sx = (i % 3 - 1) * 0.5;
    b.spike([sx * 0.03, H[1] + 0.09, H[2] - 0.04], [sx * 0.4, Math.sin(a), -Math.cos(a)], 0.17, 0.026, {
      bone: head, color: PAL[i % 6],
    });
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // front
    const fp = limb([s * 0.17, 0.62, 0.3], [s * 0.17, 0.05, 0.34], [0.31, 0.3], [[0, 0, -1]]);
    const fl = b.chain(`legF${S}`, fp, { parent: spine.joints[1], names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "leg" });
    b.sweep(fl, [0.085, 0.05], { color: legPaint });
    // hind
    const hp = limb([s * 0.18, 0.65, -0.35], [s * 0.18, 0.05, -0.3], [0.3, 0.28, 0.2], [[0, 0, 1], [0, 0, -1]]);
    const hl = b.chain(`legH${S}`, hp, { parent: hips, names: [`hip${S}`, `knee${S}`, `hock${S}`, `ankle${S}`], role: "leg" });
    b.sweep(hl, [0.095, 0.045], { color: legPaint });
    for (const [leg, fx, fz] of [[fl, s * 0.17, 0.34], [hl, s * 0.18, -0.3]] as [any, number, number][]) {
      const bone = leg.tip ?? leg.joints[leg.joints.length - 1];
      b.part(new THREE.SphereGeometry(0.06, 8, 6), ORANGE, { bone, at: [fx, 0.04, fz + 0.03], scale: [1.05, 0.62, 1.35] });
      for (let k = -1; k <= 1; k++) {
        b.spike([fx + k * 0.03, 0.035, fz + 0.1], [k * 0.15, -0.25, 1], 0.08, 0.013, { bone, color: BONE });
        b.part(new THREE.SphereGeometry(0.02, 5, 4), PAL[(k + 4) % 6], { bone, at: [fx + k * 0.03, 0.045, fz + 0.095] });
      }
    }
  }

  // ---------- feathers ----------
  const feather = (at: V, dir: V, perp: V, L: number, w: number, bone: any, c1: string, c2: string, tip: string) => {
    const outline: any = [[0, -0.4 * w], [0.35 * L, -w], [0.75 * L, -0.8 * w], [L, 0, "sharp"], [0.75 * L, 0.8 * w], [0.35 * L, w], [0, 0.4 * w]];
    const fp = paint((_p, _n, s) => (s[0] < 0.28 * L ? c1 : s[0] > 0.82 * L ? tip : Math.abs(s[1]) < 0.12 * w ? c1 : c2));
    return b.extrude(outline, { at, x: dir, y: perp, thickness: 0.012, smoothing: 1, color: fp, bone });
  };

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const root: V = [s * 0.2, 0.92, 0.12], elb: V = [s * 0.55, 1.12, 0.0], wr: V = [s * 0.95, 1.05, -0.1];
    const wing = b.chain(`wing${S}`, catmull([root, elb, wr]), {
      parent: spine.joints[1], names: [`wingShoulder${S}`, `wingElbow${S}`, `wingWrist${S}`], role: "wing",
    });
    b.sweep(wing, [0.08, 0.045], { color: coat });
    b.part(new THREE.SphereGeometry(0.09, 8, 6), coat, { bone: wing.joints[0], at: root });
    const wristB = wing.tip ?? wing.joints[1];
    const dirOf = (a: number): [V, V] => {
      const r = (a * Math.PI) / 180;
      return [[s * Math.cos(r), 0.07, -Math.sin(r)], [Math.sin(r), 0, s * Math.cos(r)]];
    };
    // primaries
    for (let i = 0; i < 9; i++) {
      const [d, p] = dirOf(i * 9 - 5);
      feather(wr, d, p, 0.78 - Math.abs(i - 2) * 0.012, 0.055, wristB, PAL[i % 6], i % 2 ? "#ffffff" : "#ffc400", PURPLE);
    }
    // secondaries along forearm
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const at: V = [elb[0] + (wr[0] - elb[0]) * (1 - t) + 0, elb[1] + (wr[1] - elb[1]) * (1 - t) - 0.012, elb[2] + (wr[2] - elb[2]) * (1 - t)];
      const [d, p] = dirOf(80 + t * 12);
      feather(at, d, p, 0.5, 0.06, wing.joints[1], PAL[(i + 2) % 6], i % 2 ? "#ff6a00" : "#00a6a6", "#fff3d6");
    }
    // tertials near body
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      const at: V = [root[0] + (elb[0] - root[0]) * t, root[1] + (elb[1] - root[1]) * t - 0.02, root[2] + (elb[2] - root[2]) * t];
      const [d, p] = dirOf(88 + t * 5);
      feather(at, d, p, 0.42 - t * 0.05, 0.06, wing.joints[0], PAL[(i + 4) % 6], "#ffc400", PURPLE);
    }
    // coverts
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const at: V = [root[0] + (wr[0] - root[0]) * t, root[1] + (wr[1] - root[1]) * t + 0.03 + 0.03 * Math.sin(t * 3), root[2] + (wr[2] - root[2]) * t - 0.03];
      const [d, p] = dirOf(75 + (1 - t) * 15);
      feather(at, d, p, 0.26, 0.05, t > 0.5 ? wristB : wing.joints[1], PAL[(i + 1) % 6], "#ffe58a", "#e4207a");
    }
  }

  // ---------- tail ----------
  const tail = b.chain("tail", catmull([[0, 0.68, -0.55], [0, 0.6, -1.0], [0, 0.62, -1.4], [0, 0.8, -1.7]]), {
    parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail",
  });
  b.sweep(tail, [0.08, 0.04], { color: tailPaint });
  for (let i = 0; i < 9; i++) {
    const a = ((i - 4) * 12 * Math.PI) / 180;
    feather([0, 0.8, -1.7], [Math.sin(a), 0.22, -Math.cos(a)], [Math.cos(a), 0, Math.sin(a)], 0.5 - Math.abs(i - 4) * 0.02, 0.06,
      tail.joints[2], PAL[i % 6], i % 2 ? "#ffc400" : "#ff6a00", "#fff3d6");
  }
  glow(b.part(new THREE.SphereGeometry(0.02, 6, 4), "#ffe58a", { bone: tail.joints[2], at: [0, 0.82, -1.72] }), 1);

  return b.root;
}
