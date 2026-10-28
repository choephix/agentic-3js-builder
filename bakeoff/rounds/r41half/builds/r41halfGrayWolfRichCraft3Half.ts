import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { limb } from "../../../../src/index";
import { catmull } from "../../../../src/index";
import { countershade, mottle } from "../../../../src/index";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Gray Wolf",
  description: "A gray wolf standing alert, built in a chunky, spiky Warcraft style with a bristling ruff and glowing amber eyes.",
};

const DARK = "#2f3238";
const MID = "#7d8187";
const CREAM = "#cfc8b6";
const BONE = "#efe8d2";
const CLAW = "#1b1b1f";
const NOSE = "#121216";
const MUZZLE = "#bdb5a2";

const EYE = svg(
  `<svg viewBox="0 0 60 40">
  <path d="M2 10 Q30 -2 58 22 Q30 40 4 28 Z" fill="#0d0d10"/>
  <path d="M8 16 Q30 6 52 22 Q30 34 9 26 Z" fill="#ffb21f"/>
  <path d="M8 16 Q30 6 52 22 L50 17 Q30 2 8 12Z" fill="#c26a10"/>
  <ellipse cx="30" cy="21" rx="3.2" ry="9" fill="#0d0d10" transform="rotate(-12 30 21)"/>
  <circle cx="24" cy="16" r="2.4" fill="#fff6d0"/>
</svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "wolf" });
  const R = rng(11);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.8, -0.4], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 0.8, -0.4], [0, 0.84, -0.02], [0, 0.9, 0.3]]),
    { parent: hips, role: "spine", names: ["spine1", "spine2"] },
  );
  const neck = b.chain(
    "neck",
    catmull([[0, 0.92, 0.28], [0, 1.0, 0.5], [0, 1.08, 0.68]]),
    { parent: spine.joints[1], role: "neck", names: ["neck1", "neck2"] },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.08, 0.68], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.06, down: 0.05 }),
    aim: head.local({ forward: 0.3, down: 0.07 }),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([[0, 0.8, -0.72], [0, 0.72, -1.0], [0, 0.55, -1.27], [0, 0.34, -1.45]]),
    { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"] },
  );

  // ---------- coat ----------
  const coat = countershade(mottle(DARK, MID, { size: 0.14, seed: 4 }), CREAM, { level: -0.2 });
  const legCoat = countershade(mottle(MID, "#9a9ea3", { size: 0.1, seed: 6 }), CREAM, { level: -0.6 });

  // ---------- body ----------
  const body = b.sweep(
    catmull([[0, 0.8, -0.62], [0, 0.8, -0.4], [0, 0.84, -0.02], [0, 0.9, 0.3]]),
    (t) => [0.14 + 0.06 * t, 0.16 + 0.09 * t * t],
    { bone: [spine, hips], color: coat, shift: [0, -0.04], sides: 10 },
  );
  const neckTube = b.sweep(neck, [0.18, 0.12], { color: coat, sides: 8 });
  b.along(body, 8, (at) => b.spike(at, at, 0.08, 0.03, { color: DARK }));
  b.along(neckTube, 4, (at) => b.spike(at, at, 0.11, 0.035, { color: DARK }));

  // chest ruff
  const hits = b.surface(body).scatter(34, { rng: R, minDist: 0.07, filter: (h) => h.n.z > 0.25 && h.n.y < 0.6 });
  for (const h of hits) b.stick(new THREE.ConeGeometry(0.035, 0.13, 5), CREAM, h, { embed: 0.3 });
  const nh = b.surface(neckTube).scatter(26, { rng: R, minDist: 0.07, filter: (h) => h.n.y < 0.5 });
  for (const h of nh) b.stick(new THREE.ConeGeometry(0.032, 0.12, 5), MID, h, { embed: 0.3 });

  // tail
  b.sweep(tail, (t) => 0.07 + 0.05 * Math.sin(Math.PI * Math.min(t * 1.1, 1)) , {
    color: coat,
    bands: [[0.72, coat], [1, DARK]],
    sides: 8,
    caps: { end: "point" },
  });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front
    const fp = limb([s * 0.14, 0.78, 0.25], [s * 0.14, 0.05, 0.3], [0.4, 0.4], [[0, 0, -1]]);
    const fl = b.chain(`legF${side}`, fp, {
      parent: spine.joints[1],
      role: "leg",
      names: [`shoulder${side}`, `elbow${side}`, `paw${side}`],
    });
    b.sweep(fl, [0.085, 0.05, 0.04].length ? (t) => 0.085 - 0.04 * t : 0.05, { color: legCoat, sides: 8 });
    b.part(new THREE.SphereGeometry(0.15, 8, 6), coat, {
      bone: fl.joints[0], at: [s * 0.15, 0.78, 0.25], scale: [0.85, 1.2, 1.1],
    });
    // hind
    const hp = limb([s * 0.15, 0.78, -0.5], [s * 0.15, 0.05, -0.62], [0.34, 0.34, 0.22], [[0, 0, 1], [0, 0, -1]]);
    const hl = b.chain(`legH${side}`, hp, {
      parent: hips,
      role: "leg",
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
    });
    b.sweep(hl, (t) => 0.1 - 0.06 * t, { color: legCoat, sides: 8 });
    b.part(new THREE.SphereGeometry(0.17, 8, 6), coat, {
      bone: hl.joints[0], at: [s * 0.16, 0.74, -0.5], scale: [0.85, 1.15, 1.2],
    });
    for (const [chain, x, z] of [[fl, s * 0.14, 0.3], [hl, s * 0.15, -0.62]] as const) {
      const tip = chain.tip!;
      b.part(new THREE.SphereGeometry(0.06, 8, 6), legCoat, {
        bone: tip, at: [x, 0.045, z + 0.03], scale: [0.85, 0.7, 1.4],
      });
      for (const k of [-1, 0, 1])
        b.spike([x + k * 0.027, 0.035, z + 0.1], [0, -0.3, 1], 0.055, 0.013, { bone: tip, color: CLAW });
    }
  }

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), coat, {
    bone: head, at: head.local({ forward: 0.06 }), scale: [0.1, 0.095, 0.115],
  });
  b.frustumBox(
    head.local({ forward: 0.1, down: 0.0 }),
    head.local({ forward: 0.32, down: 0.03 }),
    [0.12, 0.1], [0.07, 0.055],
    { bone: head, color: MUZZLE },
  );
  b.part(new THREE.SphereGeometry(0.032, 8, 6), NOSE, { bone: head, at: head.local({ forward: 0.335, down: 0.03 }), scale: [1.2, 0.9, 1] });
  b.frustumBox(
    head.local({ forward: 0.08, down: 0.062 }),
    head.local({ forward: 0.3, down: 0.08 }),
    [0.09, 0.035], [0.05, 0.03],
    { bone: jaw, color: CREAM },
  );
  for (const s of [1, -1]) {
    // fangs
    b.spike(head.local({ left: s * 0.028, forward: 0.29, down: 0.05 }), [0, -1, 0], 0.05, 0.011, { bone: head, color: BONE });
    b.spike(head.local({ left: s * 0.025, forward: 0.28, down: 0.065 }), [0, 1, 0], 0.045, 0.01, { bone: jaw, color: BONE });
    // ears
    b.spike(head.local({ left: s * 0.06, up: 0.08, forward: 0.0 }), [s * 0.2, 1, -0.25], 0.16, 0.05, { bone: head, color: DARK });
    b.spike(head.local({ left: s * 0.06, up: 0.08, forward: 0.015 }), [s * 0.2, 1, -0.25], 0.12, 0.032, { bone: head, color: CREAM });
    // cheek ruff
    for (let i = 0; i < 3; i++)
      b.spike(head.local({ left: s * 0.08, down: -0.01 + i * 0.03, forward: 0.02 - i * 0.015 }), [s * 0.6, -0.15, -0.8], 0.13 - i * 0.015, 0.035, {
        bone: head, color: i === 1 ? CREAM : MID,
      });
    // brow ridge
    b.rod(head.local({ left: s * 0.03, up: 0.075, forward: 0.12 }), head.local({ left: s * 0.085, up: 0.06, forward: 0.07 }), 0.012, DARK, { bone: head });
    // eye
    b.decal(skull, EYE, {
      at: head.local({ left: s * 0.07, up: 0.04, forward: 0.12 }),
      dir: [s * 0.55, 0.1, 0.8],
      size: [0.055, 0.037],
      mirror: s > 0,
    });
  }
  // snarl-ready lip line
  b.rod(head.local({ left: 0.04, forward: 0.31, down: 0.058 }), head.local({ left: -0.04, forward: 0.31, down: 0.058 }), 0.006, NOSE, { bone: head });

  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });
  return b.root;
}
