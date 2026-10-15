import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { countershade, mottle, scales } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kraken",
  description:
    "A kraken rising from the sea on six arched tentacles, two raised armoured arms and a tendril beard, glowing cyan runes and eyes.",
  style: "Overwatch",
  commit: "88fc1f0",
};

const CYAN = "#3ff3ff";
const BONE = "#e9bf8a";
const CORAL = "#f0775b";
const SUCK = "#f08a74";
const SUCKIN = "#7a2f4a";
const ARMOR = "#232a52";
const FOAM = "#c4f6ee";
const DARK = "#120f2a";

const DEG = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "kraken", paintSize: 2048 });

  // Paints: cel shaded scale skin, indigo back and teal belly.
  const SKIN = cel(
    countershade(
      scales("#2e3d86", "#1b2253", { size: 0.16, width: 0.1 }),
      scales("#2aa0a0", "#1f6d7c", { size: 0.16, width: 0.1 }),
      { level: 0.05, soft: 0.35 },
    ),
  );

  // ---------------------------------------------------------------- skeleton: spine, head, jaw
  const pelvis = b.joint("pelvis", { at: [0, 1.9, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.2, 0],
      [0, 2.8, 0.05],
      [0, 3.4, 0.15],
      [0, 3.9, 0.3],
    ]),
    { parent: pelvis, names: ["spine1", "spine2", "chest", "neck"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = spine.joints[spine.joints.length - 1];
  const head = b.joint("head", { parent: neck, at: [0, 3.95, 0.3], dir: [0, 0.5, 0.85], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 3.95, 0.65], aim: [0, 3.75, 1.2], role: "jaw" });

  // ---------------------------------------------------------------- water base
  b.lathe(
    [
      [0, 0],
      [5.3, 0],
      [5.3, 0.05],
      [4.2, 0.075],
      [0, 0.1],
    ],
    { at: [0, 0, 0], bone: pelvis, color: mottle("#1f6f86", "#2f98ab", { size: 0.7, seed: 4 }) },
  );
  for (const R of [1.25, 1.75, 2.4]) {
    b.part(new THREE.TorusGeometry(R, 0.03, 4, 28), FOAM, { bone: pelvis, at: [0, 0.1, 0], rotation: [90, 0, 0] });
  }

  // ---------------------------------------------------------------- body
  b.part(new THREE.SphereGeometry(1, 12, 9), SKIN, { bone: pelvis, at: [0, 2.0, 0], scale: [0.98, 0.85, 0.98] });
  const body = b.sweep(spine, (t) => [0.82 - 0.42 * t * t * t, 0.66 - 0.3 * t * t * t], { color: SKIN });
  const bodySkin = b.surface(body);

  // dorsal spines
  for (let k = 0; k < 5; k++) {
    const at = body.at(0.12 + k * 0.17, 0);
    b.spike(at, at, 0.32 - k * 0.03, 0.07, BONE);
  }
  // chest runes
  for (const a of [160, -160]) {
    glow(b.sweep(body.line(a, 0.0), (t) => 0.022 * (1 - 0.6 * t) + 0.004, { bone: spine, color: CYAN, sides: 5 }));
  }
  // chest armour plates with glowing core
  for (const [y, k] of [
    [2.75, 0.75],
    [3.3, 0.55],
  ]) {
    const h = bodySkin.nearest([0, y, 2]);
    const z = h.at.z - 0.03;
    b.extrude(
      [
        [0.35 * k * 1.3, 0.38 * k * 1.3],
        [0.5 * k * 1.3, 0],
        [0.32 * k * 1.3, -0.4 * k * 1.3],
        [-0.32 * k * 1.3, -0.4 * k * 1.3],
        [-0.5 * k * 1.3, 0],
        [-0.35 * k * 1.3, 0.38 * k * 1.3],
      ],
      { at: [0, y, z], x: [1, 0, 0], thickness: 0.12, bevel: 0.025, color: ARMOR, bone: chest },
    );
    glow(
      b.extrude(
        [
          [0, 0.2 * k],
          [0.08 * k, 0],
          [0, -0.2 * k],
          [-0.08 * k, 0],
        ],
        { at: [0, y, z + 0.035], x: [1, 0, 0], thickness: 0.06, bevel: 0.01, color: CYAN, bone: chest },
      ),
    );
  }

  // ---------------------------------------------------------------- tentacle builder
  const tentacle = (name: string, parent: Joint, pts: number[][], rootR: number, sAng: number, nS: number) => {
    const chain = b.chain(name, catmull(pts), { parent, role: "tentacle" });
    const r = (t: number) => rootR * Math.pow(1 - t, 1.15) + 0.045;
    const sw = b.sweep(chain, r, { color: SKIN });
    for (let i = 0; i < nS; i++) {
      const t = 0.1 + (i * 0.8) / Math.max(nS - 1, 1);
      const hit = sw.at(t, sAng);
      const R = r(t) * 0.42;
      b.stick(new THREE.CylinderGeometry(R, R * 1.15, 0.05, 8), SUCK, hit, { embed: 0.35 });
      b.stick(new THREE.CylinderGeometry(R * 0.6, R * 0.6, 0.06, 8), SUCKIN, hit, { embed: 0.2 });
    }
    for (let k = 0; k < 6; k++) {
      const hit = sw.at(0.08 + k * 0.1, 0);
      const rr = r(0.08 + k * 0.1);
      b.spike(hit, hit, 0.08 + rr * 0.9, rr * 0.22, BONE);
    }
    for (const a of [38, -38]) {
      glow(b.sweep(sw.line(a, 0), (t) => 0.02 * (1 - t) + 0.006, { bone: chain, color: CYAN, sides: 5 }));
    }
    return chain;
  };

  // ground tentacles, three per side
  const prof = [
    [0.35, 2.0, 0],
    [1.1, 2.45, 0.1],
    [2.0, 2.3, 0.25],
    [2.8, 1.4, 0.4],
    [3.3, 0.55, 0.5],
    [3.9, 0.14, 0.7],
    [4.5, 0.2, 0.9],
    [4.9, 0.6, 1.1],
    [4.85, 1.0, 1.1],
  ];
  const specs: Array<[number, number, string]> = [
    [28, 3.9, "tentA"],
    [78, 4.4, "tentB"],
    [132, 3.8, "tentC"],
    [-28, 3.9, "tentD"],
    [-78, 4.4, "tentE"],
    [-132, 3.8, "tentF"],
  ];
  for (const [az, R, name] of specs) {
    const d = az * DEG;
    const sgn = az >= 0 ? 1 : -1;
    const k = R / 4.5;
    const pts = prof.map(([r, y, l]) => [
      Math.sin(d) * r * k + Math.cos(d) * l * k * sgn,
      y,
      Math.cos(d) * r * k - Math.sin(d) * l * k * sgn,
    ]);
    tentacle(name, pelvis, pts, 0.36, sgn * 150, 13);
    const c = pts[5];
    for (const rr of [0.4, 0.58]) {
      b.part(new THREE.TorusGeometry(rr, 0.03, 4, 18), FOAM, { bone: pelvis, at: [c[0], 0.1, c[2]], rotation: [90, 0, 0] });
    }
  }

  // raised arms and shoulder armour
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = [
      [s * 0.7, 3.3, 0.1],
      [s * 1.5, 3.5, 0.3],
      [s * 2.3, 4.1, 0.5],
      [s * 2.9, 4.9, 0.6],
      [s * 2.7, 5.4, 0.5],
      [s * 2.1, 5.55, 0.4],
      [s * 1.6, 5.25, 0.35],
      [s * 1.5, 4.8, 0.3],
    ];
    tentacle(`arm${side}`, chest, pts, 0.3, s * 150, 11);
    b.part(new THREE.SphereGeometry(1, 10, 8), ARMOR, { bone: chest, at: [s * 0.78, 3.35, 0.1], scale: [0.52, 0.42, 0.52] });
    b.part(new THREE.TorusGeometry(0.46, 0.035, 4, 16), BONE, { bone: chest, at: [s * 0.78, 3.35, 0.1], rotation: [0, 90, 0] });
    glow(b.part(new THREE.TorusGeometry(0.3, 0.025, 4, 14), CYAN, { bone: chest, at: [s * 1.0, 3.4, 0.1], rotation: [0, 90, 0] }));
    for (const dir of [
      [s * 0.3, 1, 0.2],
      [s * 0.8, 0.7, 0],
      [s * 0.6, 0.8, -0.5],
    ]) {
      b.spike([s * 0.78, 3.55, 0.1], dir, 0.42, 0.09, BONE, { bone: chest });
    }
  }

  // ---------------------------------------------------------------- head
  b.part(new THREE.SphereGeometry(1, 12, 9), SKIN, { bone: head, at: [0, 4.15, 0.4], scale: [0.55, 0.62, 0.6] });
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { bone: head, at: [0, 4.3, -0.15], scale: [0.5, 0.65, 0.7] });
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { bone: head, at: [0, 3.95, 0.85], scale: [0.42, 0.3, 0.35] });
  b.part(new THREE.SphereGeometry(1, 8, 6), DARK, { bone: head, at: [0, 3.82, 1.0], scale: [0.22, 0.08, 0.22] });

  const K = 0.65;
  b.extrude(
    [
      [0.3 * K, 0],
      [0.3 * K, 0.6 * K],
      [0.0, 1.1 * K],
      [-0.5 * K, 1.6 * K, "sharp"],
      [-0.6 * K, 1.0 * K],
      [-1.0 * K, 0.9 * K, "sharp"],
      [-0.8 * K, 0.3 * K],
      [-0.4 * K, 0],
    ],
    { at: [0, 4.6, 0.35], x: [0, 0, 1], thickness: 0.1, bevel: 0.02, color: SKIN, bone: head },
  );

  const eyeSpot = [0.3, 4.15, 0.88];
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0.2, 0],
        [0.25, 0.5],
        [-0.4, 0.9, "sharp"],
        [-0.3, 0.4],
        [-0.9, 0.7, "sharp"],
        [-0.7, 0.1],
        [-0.4, -0.2],
      ],
      { at: [s * 0.5, 4.15, 0.15], x: [0, 0, 1], y: [s * 0.7, 1, 0], thickness: 0.05, bevel: 0.01, color: CORAL, bone: head },
    );
    glow(b.part(new THREE.SphereGeometry(0.11, 8, 6), CYAN, { bone: head, at: [s * eyeSpot[0], eyeSpot[1], eyeSpot[2]] }));
    b.part(new THREE.SphereGeometry(0.1, 6, 5), DARK, {
      bone: head,
      at: [s * eyeSpot[0], eyeSpot[1], eyeSpot[2] + 0.07],
      scale: [0.25, 0.85, 0.25],
    });
    b.part(new THREE.BoxGeometry(0.34, 0.07, 0.16), ARMOR, {
      bone: head,
      at: [s * 0.3, 4.31, 0.88],
      rotation: [-10, 0, s * 22],
    });
  }
  glow(
    b.extrude(
      [
        [0, 0.2],
        [0.08, 0],
        [0, -0.2],
        [-0.08, 0],
      ],
      { at: [0, 4.5, 0.84], x: [1, 0, 0], thickness: 0.06, bevel: 0.01, color: CYAN, bone: head },
    ),
  );

  // jaw
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { bone: jaw, at: [0, 3.78, 0.95], scale: [0.3, 0.13, 0.32] });
  for (const s of [1, -1]) {
    b.spike([s * 0.2, 3.8, 1.12], [s * 0.2, 1, 0.4], 0.24, 0.05, BONE, { bone: jaw });
  }

  // tendril beard
  const xs = [0.14, -0.14, 0.34, -0.34];
  const lens = [1, 1, 0.8, 0.8];
  xs.forEach((x, i) => {
    const short = (1 - lens[i]) * 0.6;
    const chain = b.chain(
      `beard${i}`,
      catmull([
        [x, 3.85, 0.95],
        [x * 1.2, 3.4, 1.3],
        [x * 1.5, 2.9, 1.5],
        [x * 1.7, 2.45 + short, 1.45],
        [x * 1.8, 2.15 + short, 1.7],
      ]),
      { parent: jaw, role: "tentacle" },
    );
    b.sweep(chain, (t) => 0.1 * (1 - t) + 0.02, {
      color: "#e8b88a",
      bands: [
        [0.55, "#e8b88a"],
        [1, "#d98a6a"],
      ],
    });
  });

  return b.root;
}
