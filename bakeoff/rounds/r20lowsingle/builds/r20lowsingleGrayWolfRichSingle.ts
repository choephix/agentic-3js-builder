import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { countershade, gradient, mix, mottle, noise, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import type { Joint } from "../../../../src/skeleton";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gray Wolf",
  description:
    "A gray wolf standing alert, ears pricked, built in a chunky hand-painted Warcraft style: oversized head, heavy shoulders, big paws, fur-tuft cards and painted saddle, mask and tail tip.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

const GREY = "#7d828a";
const GREY_L = "#b2b4b6";
const GREY_D = "#44474f";
const CREAM = "#e2d8c0";
const CREAM_D = "#b9ae96";
const BLACK = "#202126";
const NOSE = "#141317";
const LEGLO = "#5b4a3b";
const AMBER = "#ffb81f";
const PINK = "#b8998b";
const CLAW = "#2b2622";
const TOOTH = "#f4efdf";

export default function build() {
  const b = createBuilder({ name: "grayWolf" });

  // ---------- paints ----------
  const saddle = paint((p, n) => {
    const m = noise(p, 0.1, 3);
    const streak = noise(new THREE.Vector3(p.x * 3, p.y * 3, p.z * 0.45), 0.06, 5);
    const base = mix(GREY, GREY_L, m * 0.8 + streak * 0.2);
    const back = smoothstep(0.1, 0.9, n.y) * (0.35 + 0.65 * streak);
    return mix(base, GREY_D, back * 0.85);
  });
  const belly = mottle(CREAM, CREAM_D, { size: 0.1, seed: 4 });
  const coat = countershade(saddle, belly, { level: -0.25, soft: 0.3 });
  const legCoat = gradient(coat, LEGLO, [0, 0.45, 0], [0, 0.12, 0]);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.8, -0.5], dir: [0, 0, 1] });
  const spinePath = catmull([
    [0, 0.8, -0.5],
    [0, 0.8, -0.18],
    [0, 0.84, 0.2],
    [0, 0.88, 0.45],
  ]);
  const spine = b.chain("spine", spinePath, { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" });
  const chestJ = spine.joints[2];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.88, 0.45],
      [0, 0.98, 0.64],
      [0, 1.0, 0.8],
    ]),
    { parent: chestJ, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.0, 0.8], dir: [0, -0.05, 1], role: "head" });
  const H = (l: number, u: number, f: number) => head.local({ left: l, up: u, forward: f });
  const jaw = b.joint("jaw", { parent: head, at: H(0, -0.045, 0.04), aim: H(0, -0.07, 0.31), role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.8, -0.55],
      [0, 0.76, -0.78],
      [0, 0.6, -0.98],
      [0, 0.38, -1.08],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ---------- body ----------
  const chestT = (t: number) => smoothstep(0.4, 0.9, t);
  const body = b.sweep(spine, (t) => [0.115 + 0.055 * chestT(t), 0.135 + 0.115 * chestT(t)], {
    color: coat,
    shift: (t) => [0, -0.04 * chestT(t)],
  });
  // shoulder hump and scapulae
  b.part(new THREE.SphereGeometry(1, 10, 8), coat, { bone: chestJ, at: [0, 0.93, 0.36], scale: [0.17, 0.14, 0.2] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
      bone: chestJ,
      at: [s * 0.15, 0.76, 0.36],
      scale: [0.1, 0.17, 0.15],
    });
  }

  // ---------- neck ----------
  const neckSweep = b.sweep(neck, [0.17, 0.155, 0.13, 0.105], { color: coat });

  // ---------- tail ----------
  const tailPaint = gradient(coat, BLACK, tail.path.at(0.72), tail.path.at(1));
  const tailSweep = b.sweep(tail, [0.06, 0.095, 0.11, 0.1, 0.06, 0.02], {
    color: tailPaint,
    caps: { end: "point" },
  });

  // ---------- legs ----------
  const foot = (x: number, z: number, r: number, bone: Joint) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), LEGLO, {
      bone,
      at: [x, 0.05, z + 0.04],
      scale: [0.062 * r, 0.052 * r, 0.095 * r],
    });
    for (const dx of [-0.03, 0, 0.03]) {
      const tx = x + dx * r;
      b.part(new THREE.SphereGeometry(1, 6, 5), "#4b3d31", {
        bone,
        at: [tx, 0.03, z + 0.12],
        scale: [0.028 * r, 0.026 * r, 0.036 * r],
      });
      b.spike([tx, 0.03, z + 0.15], [0, -0.3, 1], 0.045 * r, 0.01 * r, CLAW, { bone, sides: 5 });
    }
  };

  const legSweeps = [];
  for (const s of [1, -1]) {
    const S = s === 1 ? "L" : "R";
    // front
    const fPts = limb(
      [s * 0.15, 0.74, 0.38],
      [s * 0.15, 0.05, 0.42],
      [0.3, 0.3, 0.16],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const fLeg = b.chain(`legF${S}`, fPts, {
      parent: chestJ,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `pawF${S}`],
      role: "leg",
    });
    legSweeps.push(b.sweep(fLeg, [0.09, 0.07, 0.055, 0.046, 0.042, 0.04], { color: legCoat }));
    foot(s * 0.15, 0.42, 1, fLeg.joints[3]);
    // elbow pad
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, {
      bone: fLeg.joints[1],
      at: [s * 0.16, fPts[1].y + 0.02, fPts[1].z - 0.03],
      scale: [0.06, 0.07, 0.07],
    });

    // hind
    const hPts = limb(
      [s * 0.15, 0.74, -0.4],
      [s * 0.15, 0.05, -0.6],
      [0.3, 0.3, 0.24],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hLeg = b.chain(`legH${S}`, hPts, {
      parent: spine.joints[0],
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `pawH${S}`],
      role: "leg",
    });
    legSweeps.push(b.sweep(hLeg, [0.1, 0.075, 0.055, 0.042, 0.04, 0.042, 0.038], { color: legCoat }));
    foot(s * 0.15, -0.6, 0.92, hLeg.joints[3]);
    // haunch
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
      bone: hLeg.joints[0],
      at: [s * 0.16, 0.72, -0.4],
      scale: [0.1, 0.17, 0.16],
    });
  }

  // ---------- head ----------
  const facePaint = paint((p, n) => {
    const dz = p.z - head.at.z;
    if (n.y > 0.3 && dz > 0.12 && Math.abs(p.x) < 0.03 + 0.008 * noise(p, 0.03, 9)) return "#5a5249";
    if (dz > 0.1 && Math.abs(n.y + 0.25) < 0.06) return "#2a2320";
    if (n.y < -0.1 || (n.y < 0.2 && Math.abs(p.x) > 0.035 && dz > 0.14)) return CREAM;
    if (dz < 0.08 && Math.abs(p.x) > 0.07 && n.y < 0.5) return mix(GREY_L, CREAM, 0.5);
    return coat;
  });
  const cranium = b.part(new THREE.SphereGeometry(1, 12, 9), facePaint, {
    bone: head,
    at: H(0, 0.02, 0.04),
    scale: [0.105, 0.1, 0.12],
  });
  b.sweep([H(0, 0.0, 0.08), H(0, -0.01, 0.34)], (t) => [0.075 - 0.035 * t, 0.065 - 0.03 * t], {
    color: facePaint,
    bone: head,
    caps: { start: "round", end: "round" },
    sides: 8,
  });
  b.sweep([H(0, -0.045, 0.06), H(0, -0.07, 0.31)], (t) => [0.058 - 0.028 * t, 0.04 - 0.014 * t], {
    color: facePaint,
    bone: jaw,
    sides: 8,
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, { bone: head, at: H(0, 0.008, 0.355), scale: [0.036, 0.028, 0.03] });
  b.part(new THREE.SphereGeometry(1, 6, 5), NOSE, { bone: jaw, at: H(0, -0.075, 0.325), scale: [0.02, 0.016, 0.02] });

  for (const s of [1, -1]) {
    // ears
    b.extrude(
      [
        [-0.05, 0],
        [0.055, 0],
        [0.065, 0.08],
        [0.04, 0.17, "sharp"],
        [-0.03, 0.09],
      ],
      {
        at: H(s * 0.07, 0.075, 0.0),
        x: [s, 0, 0],
        thickness: 0.026,
        bevel: 0.006,
        color: paint((_p, _n, c) => (c[1] > 0.12 ? BLACK : GREY)),
        bone: head,
      },
    );
    b.extrude(
      [
        [-0.03, 0.012],
        [0.035, 0.012],
        [0.045, 0.075],
        [0.035, 0.135, "sharp"],
        [-0.015, 0.08],
      ],
      { at: H(s * 0.07, 0.075, 0.014), x: [s, 0, 0], thickness: 0.012, color: PINK, bone: head },
    );
    // eyes
    const ec = H(s * 0.055, 0.045, 0.13);
    glow(
      b.part(new THREE.SphereGeometry(1, 8, 6), AMBER, { bone: head, at: ec, scale: [0.022, 0.026, 0.03] }),
      0.5,
    );
    b.part(new THREE.SphereGeometry(1, 6, 5), NOSE, {
      bone: head,
      at: H(s * 0.076, 0.047, 0.15),
      scale: [0.006, 0.014, 0.012],
    });
    b.part(new THREE.SphereGeometry(1, 5, 4), "#ffffff", {
      bone: head,
      at: H(s * 0.074, 0.058, 0.153),
      scale: [0.004, 0.004, 0.004],
    });
    b.capsule(H(s * 0.035, 0.08, 0.1), H(s * 0.072, 0.07, 0.175), 0.013, GREY_D, { bone: head, sides: 6 });
    // fangs
    b.spike(H(s * 0.034, -0.045, 0.3), [0, -1, 0], 0.038, 0.01, TOOTH, { bone: head, sides: 5 });
    b.spike(H(s * 0.026, -0.06, 0.3), [0, 1, 0.1], 0.03, 0.009, TOOTH, { bone: jaw, sides: 5 });
    // whisker dots
    for (let i = 0; i < 3; i++)
      b.part(new THREE.SphereGeometry(1, 5, 4), "#3a332e", {
        bone: head,
        at: H(s * (0.05 - i * 0.004), -0.012 - i * 0.012, 0.24 - i * 0.025),
        scale: [0.007, 0.007, 0.007],
      });
  }

  // ---------- fur cards ----------
  const tuft = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 0 C22 14 30 40 28 64 L4 64 C2 40 10 14 16 0Z" fill="#ffffff"/><path d="M16 8 C17 26 17 44 16 64" stroke="#c4c4c4" stroke-width="3" fill="none"/><path d="M10 30 C11 42 11 52 10 64 M22 30 C21 42 21 52 22 64" stroke="#dcdcdc" stroke-width="2" fill="none"/></svg>`,
    { size: 128 },
  );
  b.cards(
    b.surface(neckSweep).scatter(150, { rng: rng(3), minDist: 0.03, filter: (h) => h.n.y > -0.5 }),
    tuft,
    { size: [0.05, 0.12], lean: 55, bend: 20, vary: 0.25, spin: 15, rng: rng(4), color: coat },
  );
  b.cards(
    b.surface(body).scatter(100, {
      rng: rng(5),
      minDist: 0.04,
      filter: (h) => h.at.z > 0.2 && h.n.y < 0.2 && h.n.y > -0.7,
    }),
    tuft,
    { size: [0.05, 0.11], lean: 60, bend: 20, vary: 0.25, rng: rng(6), color: coat },
  );
  b.cards(
    b.surface(body).scatter(90, { rng: rng(7), minDist: 0.045, filter: (h) => h.n.y > 0.7 && h.at.z > -0.3 }),
    tuft,
    { size: [0.035, 0.09], lean: 40, bend: 15, vary: 0.25, rng: rng(8), color: "#55585f" },
  );
  b.cards(b.surface(tailSweep).scatter(100, { rng: rng(9), minDist: 0.04 }), tuft, {
    size: [0.05, 0.12],
    lean: 50,
    bend: 20,
    vary: 0.25,
    spin: 15,
    rng: rng(10),
    color: tailPaint,
  });
  b.cards(
    b.surface(cranium).scatter(40, {
      rng: rng(11),
      minDist: 0.03,
      filter: (h) => h.at.z < head.at.z + 0.05 && h.n.y < 0.5 && Math.abs(h.at.x) > 0.06,
    }),
    tuft,
    { size: [0.04, 0.09], lean: 65, bend: 20, vary: 0.2, rng: rng(12), color: CREAM },
  );
  for (const leg of legSweeps)
    b.cards(
      b.surface(leg).scatter(10, { rng: rng(13), minDist: 0.04, filter: (h) => h.n.z < -0.3 && h.at.y > 0.2 }),
      tuft,
      { size: [0.03, 0.08], lean: 70, bend: 15, vary: 0.2, rng: rng(14), color: coat },
    );

  return b.root;
}
