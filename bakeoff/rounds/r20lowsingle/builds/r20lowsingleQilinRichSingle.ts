import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, gradient, scales } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK, animeEye } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Qilin",
  description:
    "Scaled, hooved chimera with dragon head, branching antlers and a billowing cloud mane, cel-shaded in jade and gold.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const GOLD = "#ffc83d";
const GOLD_DARK = "#c47f22";
const FLAME = "#ff4f6e";
const GEM = "#7ff4ff";
const CREAM = "#fff0c4";
const DARK = "#2a1a3a";

const cloud = (fill: string, shade: string, edge: string) =>
  svg(
    `<svg viewBox="0 0 64 80">
    <path d="M32 78 C10 70 4 52 14 40 C6 30 16 14 30 18 C34 4 56 8 54 26 C66 36 58 56 46 62 C48 72 40 78 32 78Z" fill="${fill}" stroke="${edge}" stroke-width="2.5"/>
    <path d="M32 78 C10 70 4 52 14 40 C22 52 36 60 46 62 C48 72 40 78 32 78Z" fill="${shade}"/>
    <path d="M22 44 q10 -14 22 -2 q4 12 -8 14" stroke="${edge}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M26 24 q8 -8 16 0" stroke="${edge}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </svg>`,
    { size: 128 },
  );

const FLAME_TEX = svg(
  `<svg viewBox="0 0 40 100">
    <path d="M20 98 C2 80 6 50 18 36 C16 26 22 12 24 2 C30 20 38 40 34 62 C34 80 28 92 20 98Z" fill="#ff4f6e" stroke="#a81f48" stroke-width="2"/>
    <path d="M20 96 C10 80 14 56 22 44 C26 60 30 78 20 96Z" fill="#ffc15a"/>
  </svg>`,
  { size: 128 },
);

const swirlPaths = `<path d="M20 60 C20 30 60 20 70 45 C78 66 48 74 44 55 C42 44 56 40 58 50"/><path d="M62 78 C74 84 90 76 92 62"/><path d="M12 80 q10 6 22 -2"/><path d="M70 22 C80 14 92 18 90 30"/>`;
const SWIRL = svg(
  `<svg viewBox="0 0 100 100">
    <g fill="none" stroke="#a8561c" stroke-width="10" stroke-linecap="round">${swirlPaths}</g>
    <g fill="none" stroke="#ffd25a" stroke-width="5" stroke-linecap="round">${swirlPaths}</g>
    <circle cx="58" cy="50" r="4" fill="#ffd25a"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "qilin" });
  const rand = rng(11);

  const CLOUD_A = cloud("#f4fdff", "#b9e8f0", "#3a7a96");
  const CLOUD_B = cloud("#bff3e6", "#6fc9c4", "#1f7f84");
  const CLOUD_C = cloud("#ffeaa8", "#f0b95a", "#a8661c");

  const rawCoat = countershade(scales("#3cc4a6", "#1a7a78", { size: 0.05, seed: 3 }), CREAM, { level: -0.3 });
  const COAT = cel(rawCoat);
  const HEAD = cel(scales("#42cfae", "#1a7a78", { size: 0.035, seed: 5 }));
  const BRONZE = cel(gradient(rawCoat, GOLD_DARK, [0, 0.3, 0], [0, 0.16, 0]));
  const TAILC = cel(gradient(rawCoat, FLAME, [0, 1.3, -1.2], [0, 1.1, -1.75]));
  const GOLDC = cel(GOLD);
  const ANTLER = cel("#ffe08a");

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 1.12, -0.55], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.12, -0.55],
      [0, 1.13, -0.2],
      [0, 1.16, 0.15],
      [0, 1.2, 0.5],
    ]),
    { parent: hips, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.22, 0.45],
      [0, 1.45, 0.62],
      [0, 1.7, 0.85],
      [0, 1.82, 1.0],
    ]),
    { parent: spine.joints[spine.joints.length - 1], role: "neck" },
  );
  const head = b.joint("head", { at: neck.at(1), dir: [0, -0.25, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.06, down: 0.07 }),
    aim: head.local({ forward: 0.36, down: 0.1 }),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.14, -0.6],
      [0, 1.28, -1.0],
      [0, 1.3, -1.4],
      [0, 1.1, -1.75],
    ]),
    { parent: hips, role: "tail" },
  );

  // ---- body ----
  const bodyTube = b.sweep(spine, (t) => [0.24 + 0.05 * t, 0.28 + 0.03 * t], {
    color: COAT,
    shift: [0, -0.04],
    extend: [0.12, 0.04],
  });
  b.along(bodyTube, 9, (at) => b.spike(at, at, 0.08, 0.03, { color: GOLDC }));

  const neckTube = b.sweep(neck, [0.17, 0.13, 0.11, 0.1], { color: COAT });
  b.along(neckTube, 6, (at) => b.spike(at, at, 0.06, 0.022, { color: GOLDC }));
  b.sweep(tail, [0.1, 0.07, 0.05, 0.035], { color: TAILC });

  // gold collar
  const collar = b.ring(neck.at(0.25), { count: 12, radius: 0.16 }).items;
  b.sweep(collar, 0.022, { color: GOLDC });

  // ---- legs ----
  const fore: { chain: ReturnType<typeof b.chain>; s: number }[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const shoulder: [number, number, number] = [s * 0.2, 1.12, 0.4];
    const fpts = limb(shoulder, [s * 0.2, 0.1, 0.46], [0.4, 0.38, 0.34], [
      [0, 0, -1],
      [0, 0, 1],
    ]);
    const fchain = b.chain(`legF${S}`, fpts, {
      parent: spine.joints[spine.joints.length - 1],
      names: [`shoulder${S}`, `elbow${S}`, `kneeF${S}`, `hoofF${S}`],
      role: "leg",
    });
    fore.push({ chain: fchain, s });
    const hip: [number, number, number] = [s * 0.2, 1.1, -0.55];
    const hpts = limb(hip, [s * 0.2, 0.1, -0.62], [0.4, 0.38, 0.34], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hchain = b.chain(`legH${S}`, hpts, {
      parent: hips,
      names: [`hip${S}`, `stifle${S}`, `hock${S}`, `hoofH${S}`],
      role: "leg",
    });
    fore.push({ chain: hchain, s });
  }

  for (const [i, leg] of fore.entries()) {
    const { chain, s } = leg;
    const front = i % 2 === 0;
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      at: chain.joints[0].at,
      bone: chain.joints[0],
      scale: front ? [0.17, 0.2, 0.2] : [0.19, 0.24, 0.24],
    });
    b.sweep(chain, [0.1, 0.075, 0.055, 0.04], { color: BRONZE });
    const foot = chain.at(1).at;
    for (const h of [-1, 1]) {
      b.part(new THREE.CylinderGeometry(0.032, 0.045, 0.11, 6), GOLD_DARK, {
        at: [foot.x + h * 0.03, 0.054, foot.z + 0.02],
        bone: chain.tip!,
        flat: true,
      });
    }
    // gold cuff
    b.sweep(b.ring(chain.at(0.8), { count: 10, radius: 0.052 }).items, 0.013, { color: GOLDC });
    // tufts
    const pastern = b.ring(chain.at(0.93), { count: 6, radius: 0.04 }).items;
    b.cards(pastern, FLAME_TEX, { size: [0.08, 0.2], lean: 55, flow: [0, -1, 0], bend: 25, vary: 0.2, rng: rand });
    const knee = b.ring(chain.at(0.48), { count: 5, radius: 0.05 }).items;
    b.cards(knee, [CLOUD_A, CLOUD_B], { size: [0.12, 0.15], lean: 60, flow: [0, -0.3, -1], bend: 25, vary: 0.2, rng: rand });
    void s;
  }

  // flank swirls
  for (const s of [1, -1]) {
    for (const z of [-0.4, 0.2]) {
      b.decal(bodyTube, SWIRL, {
        at: [s * 0.3, 1.2, z],
        dir: [s, 0, 0],
        size: [0.34, 0.34],
        mirror: s < 0,
      });
    }
  }

  // ---- head ----
  const skull = b.part(new THREE.SphereGeometry(1, 12, 10), HEAD, {
    bone: head,
    at: head.local({ forward: 0.08 }),
    scale: [0.13, 0.12, 0.16],
  });
  b.frustumBox(
    head.local({ forward: 0.1, up: -0.01 }),
    head.local({ forward: 0.38, down: 0.03 }),
    [0.2, 0.17],
    [0.15, 0.1],
    { bone: head, color: HEAD },
  );
  b.part(new THREE.SphereGeometry(0.06, 8, 6), HEAD, {
    bone: head,
    at: head.local({ forward: 0.385, down: 0.02 }),
    scale: [1.2, 0.9, 0.8],
  });
  b.frustumBox(head.local({ forward: 0.1, down: 0.075 }), head.local({ forward: 0.36, down: 0.1 }), [0.15, 0.06], [0.11, 0.045], {
    bone: jaw,
    color: cel(CREAM),
  });
  for (const s of [1, -1]) {
    // nostril
    b.part(new THREE.SphereGeometry(0.014, 6, 4), DARK, {
      bone: head,
      at: head.local({ left: s * 0.04, forward: 0.43, up: 0.01 }),
    });
    // teeth
    for (let k = 0; k < 4; k++) {
      b.spike(head.local({ left: s * 0.06, forward: 0.2 + k * 0.045, down: 0.06 }), [0, -1, 0], 0.03, 0.01, {
        color: "#fffaf0",
        bone: head,
        sides: 5,
      });
      b.spike(head.local({ left: s * 0.05, forward: 0.2 + k * 0.045, down: 0.075 }), [0, 1, 0], 0.025, 0.009, {
        color: "#fffaf0",
        bone: jaw,
        sides: 5,
      });
    }
    b.spike(head.local({ left: s * 0.065, forward: 0.32, down: 0.06 }), [0, -1, 0], 0.06, 0.014, {
      color: "#fffaf0",
      bone: head,
      sides: 5,
    });
    // brow ridge
    b.sweep(
      catmull([
        head.local({ left: s * 0.05, forward: 0.14, up: 0.1 }),
        head.local({ left: s * 0.1, forward: 0.06, up: 0.1 }),
        head.local({ left: s * 0.13, forward: -0.02, up: 0.06 }),
      ]),
      [0.022, 0.01],
      { color: GOLDC, bone: head },
    );
    // cheek fin
    b.extrude(
      [
        [0, 0],
        [0.1, 0.06],
        [0.22, 0.03, "sharp"],
        [0.12, -0.02],
        [0.2, -0.1, "sharp"],
        [0.06, -0.07],
      ],
      {
        at: head.local({ left: s * 0.12, forward: -0.02, up: -0.02 }),
        x: [s * 0.4, 0, -1],
        thickness: 0.012,
        bevel: 0.003,
        color: GOLDC,
        bone: head,
      },
    );
    // eyes
    b.decal(skull, animeEye({ iris: "#ffb41f", blush: false }), {
      at: head.local({ left: s * 0.11, up: 0.03, forward: 0.1 }),
      dir: [s * 0.8, 0.1, 0.6],
      size: [0.075, 0.1],
      mirror: s > 0,
    });
    // whiskers
    for (const [k, drop] of [
      [0, 0.35],
      [1, 0.6],
    ] as const) {
      const m = head.local({ left: s * 0.07, forward: 0.34, down: 0.02 });
      const o = (dx: number, dy: number, dz: number) => m.clone().add(new THREE.Vector3(s * dx, dy, dz));
      b.sweep(catmull([m, o(0.15, -0.03 - k * 0.04, -0.12), o(0.32, -0.12 - k * 0.05, -0.34), o(0.4, -drop, -0.55)]), [0.012, 0.003], {
        color: k ? GOLDC : cel(CREAM),
        bone: head,
        caps: { start: "flat", end: "point" },
        sides: 5,
      });
    }
    // antlers
    const B = head.local({ left: s * 0.06, up: 0.1 });
    const o = (dx: number, dy: number, dz: number) => B.clone().add(new THREE.Vector3(s * dx, dy, dz));
    const beam = catmull([B, o(0.04, 0.14, -0.08), o(0.09, 0.3, -0.2), o(0.12, 0.46, -0.24), o(0.1, 0.6, -0.2)]);
    b.sweep(beam, [0.032, 0.01], { color: ANTLER, bone: head, caps: { start: "flat", end: "point" }, sides: 6 });
    const tines: [number, number, number, number][] = [
      [0.2, 0.06, 0.06, -0.16],
      [0.35, 0.1, 0.1, 0.14],
      [0.58, 0.11, 0.1, 0.12],
      [0.8, 0.07, 0.14, 0.06],
    ];
    for (const [t, dx, dy, dz] of tines) {
      const p = beam.at(t);
      const tip = p.clone().add(new THREE.Vector3(s * dx, dy, dz));
      b.spike(p, tip, null, 0.016, { color: ANTLER, bone: head, sides: 5 });
      glow(b.part(new THREE.IcosahedronGeometry(0.016, 0), GEM, { bone: head, at: tip }), 1.5);
    }
    glow(b.part(new THREE.IcosahedronGeometry(0.022, 0), GEM, { bone: head, at: beam.at(1) }), 1.5);
  }
  glow(b.part(new THREE.IcosahedronGeometry(0.03, 0), FLAME, { bone: head, at: head.local({ forward: 0.17, up: 0.115 }) }), 1.4);

  // beard / chin tassels
  const chin = [0.15, 0.22, 0.29, 0.34].map((f) => frame(head.local({ forward: f, down: 0.12 }), [0, 1, 0]));
  b.cards(chin, [CLOUD_C, FLAME_TEX], { size: [0.07, 0.16], lean: 180, flow: [0, 0, 1], rng: rand, bone: jaw, vary: 0.2 });

  // ---- cloud mane ----
  const mane = b.surface(neckTube).scatter(48, { rng: rng(21), minDist: 0.06, filter: (h) => h.n.y > 0.15 });
  b.cards(mane, [CLOUD_A, CLOUD_B, CLOUD_A, CLOUD_C], {
    size: [0.2, 0.24],
    lean: 55,
    bend: 25,
    vary: 0.25,
    spin: 20,
    rng: rng(22),
  });
  const withers = b.surface(bodyTube).scatter(16, { rng: rng(23), minDist: 0.1, filter: (h) => h.n.y > 0.5 && h.at.z > -0.1 });
  b.cards(withers, [CLOUD_A, CLOUD_B], { size: [0.16, 0.2], lean: 60, bend: 25, vary: 0.25, rng: rng(24) });
  const chest = b.surface(neckTube).scatter(14, { rng: rng(25), minDist: 0.07, filter: (h) => h.n.y < -0.1 || h.n.z > 0.5 });
  b.cards(chest, [CLOUD_A, CLOUD_C], { size: [0.12, 0.15], lean: 60, bend: 20, vary: 0.2, rng: rng(26) });

  // ---- tail tuft ----
  const tuft = b.ring(tail.at(1), { count: 8, radius: 0.03 }).items;
  b.cards(tuft, FLAME_TEX, { size: [0.16, 0.45], lean: 40, bend: 30, vary: 0.2, rng: rand, cross: true });
  const wisps = b.ring(tail.at(0.6), { count: 5, radius: 0.05 }).items;
  b.cards(wisps, [CLOUD_A, CLOUD_C], { size: [0.15, 0.2], lean: 60, bend: 20, vary: 0.2, rng: rand });

  void INK;
  return b.root;
}
