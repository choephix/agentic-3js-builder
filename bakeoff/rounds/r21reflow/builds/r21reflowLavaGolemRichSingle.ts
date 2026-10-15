import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { cells, mottle, paint } from "../../../../src/paint";
import { polyline } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import type { Joint } from "../../../../src/skeleton";
import type { Sweep } from "../../../../src/sweep";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Lava Golem",
  description:
    "A hulking basalt golem, shoulders and fists oversized, bound with molten seams and gilded rune plates, cel-shaded in a Genshin Impact elemental-guardian style.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const LAVA = "#ff7a1a";
const LAVA_HOT = "#ffd45a";
const GOLD_LIT = "#e8b04a";
const GOLD_SHADE = "#a9731f";
const DARK = "#2a1a22";

const BAS_A = cel(mottle("#6c4640", "#553836", { size: 0.22, seed: 3 }), "#35202c");
const BAS_B = cel(mottle("#5d3d3e", "#4a3033", { size: 0.18, seed: 11 }), "#2d1b28");
const GOLD = cel(GOLD_LIT, GOLD_SHADE);

// Basalt with molten cracks between irregular cells.
const cracked = (seed: number) =>
  paint((p) => {
    const c = cells(p, 0.32, seed);
    const e = c.d2 - c.d1;
    if (e < 0.025) return LAVA_HOT;
    if (e < 0.07) return LAVA;
    return c.id > 0.5 ? BAS_A : BAS_B;
  });

const EMBLEM = svg(
  `<svg viewBox="0 0 100 100">
    <polygon points="50,2 98,50 50,98 2,50" fill="#e8b04a"/>
    <polygon points="50,10 90,50 50,90 10,50" fill="#ff8a1c"/>
    <polygon points="50,22 78,50 50,78 22,50" fill="#ffd45a"/>
    <path d="M50 50 L58 50 L58 58 L42 58 L42 42 L66 42 L66 66 L34 66 L34 34 L74 34" stroke="#8a2e10" stroke-width="4" fill="none" stroke-linejoin="round"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "lavaGolem" });
  const R = rng(21);

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.45, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 1.45, 0],
      [0, 1.9, 0.02],
      [0, 2.3, 0.22],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.tip!;
  const neck = b.chain(
    "neck",
    polyline([
      [0, 2.3, 0.22],
      [0, 2.62, 0.4],
    ]),
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 2.62, 0.4], aim: [0, 2.72, 0.8], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.66, 0.6], aim: [0, 2.56, 0.84], role: "jaw" });

  // ---------------------------------------------------------------- torso
  const torso = b.sweep(spine, (t) => [0.5 + 0.3 * t, 0.36 + 0.1 * t], {
    color: cracked(5),
    sides: 8,
    smooth: false,
  });
  const dress = (
    sw: Sweep,
    count: number,
    size: number,
    seed: number,
    filter?: (h: { n: THREE.Vector3; at: THREE.Vector3 }) => boolean,
  ) => {
    const rr = rng(seed);
    const hits = b.surface(sw).scatter(count, { rng: rng(seed + 1), minDist: size * 1.15, filter });
    for (const hit of hits) {
      const g = new THREE.DodecahedronGeometry(size * (0.8 + rr() * 0.6), 0);
      b.stick(g, rr() < 0.3 ? cracked(seed) : rr() < 0.5 ? BAS_A : BAS_B, hit, {
        embed: 0.35,
        scale: [1, 0.65 + rr() * 0.5, 0.9 + rr() * 0.5],
        spin: rr() * 360,
        flat: true,
      });
    }
  };
  dress(torso, 34, 0.15, 31, (h) => !(h.n.z > 0.45 && h.at.y > 1.75 && Math.abs(h.at.x) < 0.38));

  // chest emblem
  const front = b.surface(torso).ray([0, 2.05, 3], [0, 0, -1]);
  if (front) {
    glow(
      b.part(new THREE.PlaneGeometry(0.52, 0.52), "#ffffff", {
        at: front.moved([0, 0.03, 0]),
        dir: front.n,
        axis: "z",
        up: [0, 1, 0],
        texture: EMBLEM,
      }),
      1.3,
    );
  }

  // spine ridge spikes on the back
  b.along(torso, 6, (at) => {
    b.spike(at, at, 0.26, 0.08, BAS_A, { sides: 5, smooth: false });
  });

  // pelvis
  b.part(new THREE.DodecahedronGeometry(1, 0), BAS_A, {
    bone: hips,
    at: [0, 1.4, 0.02],
    scale: [0.62, 0.34, 0.45],
    flat: true,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.DodecahedronGeometry(0.24, 0), BAS_B, {
      bone: hips,
      at: [s * 0.55, 1.5, 0.05],
      rotation: [R() * 60, R() * 60, 0],
      scale: [1, 0.8, 1.1],
      flat: true,
    });
  }
  // gold belt plate
  b.extrude(
    [
      [0, -0.2],
      [0.17, 0],
      [0, 0.2],
      [-0.17, 0],
    ],
    { at: [0, 1.62, 0.5], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.07, bevel: 0.015, color: GOLD, bone: hips },
  );
  glow(b.part(new THREE.OctahedronGeometry(0.07, 0), LAVA_HOT, { bone: hips, at: [0, 1.62, 0.55], scale: [0.7, 1.1, 0.5], flat: true }), 1.4);

  // lava belts
  const belt = (sw: Sweep, joint: Joint, r = 0.026) => {
    try {
      const loop = b.surface(sw).loop(joint, { lift: 0.012 });
      glow(b.sweep(loop, r, LAVA, { sides: 5 }), 1.3);
    } catch {
      /* plane missed the surface: no belt */
    }
  };
  belt(torso, spine.joints[1], 0.035);
  belt(torso, spine.joints[0], 0.03);

  // neck
  const neckSweep = b.sweep(neck, 0.2, { color: cracked(9), sides: 6, smooth: false });
  belt(neckSweep, neck.joints[0], 0.022);

  // ---------------------------------------------------------------- head
  b.part(new THREE.DodecahedronGeometry(1, 0), BAS_A, {
    bone: head,
    at: [0, 2.8, 0.5],
    scale: [0.34, 0.3, 0.33],
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.66, 0.1, 0.18), BAS_B, {
    bone: head,
    at: [0, 2.93, 0.78],
    rotation: [-10, 0, 0],
    flat: true,
  });
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.BoxGeometry(0.12, 0.035, 0.05), LAVA_HOT, {
        bone: head,
        at: [s * 0.14, 2.85, 0.8],
        rotation: [0, 0, -s * 22],
      }),
      1.8,
    );
    b.part(new THREE.DodecahedronGeometry(0.15, 0), BAS_B, {
      bone: head,
      at: [s * 0.3, 2.74, 0.58],
      scale: [0.7, 1, 1.1],
      rotation: [R() * 40, R() * 40, 0],
      flat: true,
    });
    // crown spikes
    b.spike([s * 0.16, 3.02, 0.46], [s * 0.35, 1, -0.2], 0.34, 0.08, BAS_A, { bone: head, sides: 5, smooth: false });
    b.spike([s * 0.3, 2.95, 0.4], [s * 0.9, 0.6, -0.1], 0.3, 0.07, BAS_B, { bone: head, sides: 5, smooth: false });
  }
  b.spike([0, 3.05, 0.4], [0, 1, -0.35], 0.42, 0.1, GOLD, { bone: head, sides: 5, smooth: false });
  b.spike([0, 3.0, 0.55], [0, 1, 0.3], 0.28, 0.08, BAS_A, { bone: head, sides: 5, smooth: false });
  glow(b.part(new THREE.OctahedronGeometry(1, 0), LAVA, { bone: head, at: [0, 2.74, 0.83], scale: [0.04, 0.12, 0.03], flat: true }), 1.5);
  // mouth
  glow(b.part(new THREE.BoxGeometry(0.3, 0.03, 0.14), LAVA, { bone: head, at: [0, 2.665, 0.7] }), 1.4);
  b.part(new THREE.BoxGeometry(0.42, 0.13, 0.3), BAS_B, { bone: jaw, at: [0, 2.6, 0.68], rotation: [8, 0, 0], flat: true });
  b.spike([0, 2.62, 0.82], [0, -0.5, 1], 0.14, 0.07, GOLD, { bone: jaw, sides: 5, smooth: false });
  for (const x of [-0.1, 0, 0.1]) {
    b.spike([x, 2.655, 0.74], [0, 1, 0], 0.05, 0.02, LAVA_HOT, { bone: jaw, sides: 4, smooth: false });
  }

  // ---------------------------------------------------------------- arms
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${S}`,
      polyline([
        [s * 0.95, 2.35, 0.15],
        [s * 1.2, 1.65, 0.3],
        [s * 1.1, 0.95, 0.55],
      ]),
      { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" },
    );
    const wrist = arm.tip!;
    const armSweep = b.sweep(arm, [0.34, 0.3, 0.28, 0.32, 0.3], { color: cracked(40 + s), sides: 7, smooth: false });
    dress(armSweep, 26, 0.13, 50 + (s > 0 ? 0 : 7));
    belt(armSweep, arm.joints[1], 0.03);
    belt(armSweep, arm.joints[0], 0.028);

    // pauldron
    b.part(new THREE.DodecahedronGeometry(1, 0), BAS_A, {
      bone: chest,
      at: [s * 1.02, 2.58, 0.1],
      scale: [0.46, 0.34, 0.42],
      rotation: [10, s * 20, s * 10],
      flat: true,
    });
    b.part(new THREE.DodecahedronGeometry(1, 0), BAS_B, {
      bone: chest,
      at: [s * 1.1, 2.86, 0.02],
      scale: [0.3, 0.24, 0.28],
      rotation: [20, 40, 0],
      flat: true,
    });
    b.spike([s * 1.0, 2.8, 0.05], [s * 0.45, 1, -0.15], 0.68, 0.17, GOLD, { bone: chest, sides: 5, smooth: false });
    b.spike([s * 1.18, 2.7, 0.15], [s * 1, 0.5, 0.1], 0.5, 0.14, BAS_A, { bone: chest, sides: 5, smooth: false });
    b.spike([s * 0.8, 2.85, -0.05], [s * 0.2, 1, -0.4], 0.5, 0.12, BAS_B, { bone: chest, sides: 5, smooth: false });
    b.extrude(
      [
        [0, -0.16],
        [0.1, 0],
        [0, 0.16],
        [-0.1, 0],
      ],
      {
        at: [s * 1.3, 2.6, 0.15],
        x: [0, 0, -s],
        y: [0, 1, 0],
        thickness: 0.06,
        bevel: 0.012,
        color: GOLD,
        bone: chest,
      },
    );

    // forearm gauntlet shards
    const shard = (sw: Sweep, center: V3, az: number, el: number, len: number, w: number, color: typeof GOLD) => {
      const hit = b.surface(sw).around(center).at(az, el);
      if (hit)
        b.stick(new THREE.OctahedronGeometry(1, 0), color, hit, {
          embed: 0.2,
          scale: [w, len, w * 0.6],
          spin: R() * 360,
          flat: true,
        });
    };
    shard(armSweep, [s * 1.15, 1.3, 0.42], s * 90, 10, 0.34, 0.14, GOLD);
    shard(armSweep, [s * 1.15, 1.3, 0.42], s * 90, 50, 0.3, 0.12, BAS_A);
    shard(armSweep, [s * 1.1, 2.0, 0.25], s * 90, 40, 0.3, 0.12, GOLD);
    shard(armSweep, [s * 1.2, 1.65, 0.3], s * 150, 0, 0.26, 0.12, BAS_B);

    // fist
    b.part(new THREE.DodecahedronGeometry(1, 0), cracked(60 + s), {
      bone: wrist,
      at: [s * 1.1, 0.88, 0.58],
      scale: [0.34, 0.3, 0.34],
      rotation: [0, s * 15, 0],
      flat: true,
    });
    b.part(new THREE.DodecahedronGeometry(1, 0), BAS_A, {
      bone: wrist,
      at: [s * 1.2, 1.02, 0.5],
      scale: [0.22, 0.2, 0.22],
      rotation: [30, 20, 0],
      flat: true,
    });
    glow(b.part(new THREE.TorusGeometry(0.3, 0.025, 4, 7), LAVA, { bone: wrist, at: [s * 1.1, 1.0, 0.55], rotation: [90, 0, 0] }), 1.3);
    b.spike([s * 1.1, 1.1, 0.5], [s * 0.2, 1, -0.3], 0.3, 0.1, GOLD, { bone: wrist, sides: 5, smooth: false });

    // fingers
    [-0.2, -0.07, 0.07, 0.2].forEach((dx, i) => {
      const x = s * 1.1 + dx;
      const f = b.chain(
        `finger${S}${i}`,
        polyline([
          [x, 0.8, 0.76],
          [x, 0.62, 0.84],
          [x, 0.46, 0.8],
        ]),
        { parent: wrist, names: [`finger${S}${i}a`, `finger${S}${i}b`], role: "digit" },
      );
      b.sweep(f, [0.075, 0.062, 0.05], { color: i % 2 ? BAS_A : BAS_B, sides: 6, smooth: false });
      glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), LAVA, { bone: wrist, at: [x, 0.64, 0.9] }), 1.2);
    });
    const thumb = b.chain(
      `thumb${S}`,
      polyline([
        [s * 0.84, 0.88, 0.62],
        [s * 0.78, 0.72, 0.78],
        [s * 0.8, 0.6, 0.86],
      ]),
      { parent: wrist, names: [`thumb${S}a`, `thumb${S}b`], role: "digit" },
    );
    b.sweep(thumb, [0.08, 0.065, 0.05], { color: BAS_A, sides: 6, smooth: false });
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      polyline([
        [s * 0.4, 1.42, 0],
        [s * 0.5, 0.8, 0.18],
        [s * 0.5, 0.28, -0.02],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
    );
    const ankle = leg.tip!;
    const legSweep = b.sweep(leg, [0.36, 0.3, 0.33, 0.27, 0.26], { color: cracked(70 + s), sides: 7, smooth: false });
    dress(legSweep, 30, 0.14, 80 + (s > 0 ? 0 : 5));
    belt(legSweep, leg.joints[1], 0.03);
    belt(legSweep, leg.joints[0], 0.028);

    // knee cap + gold shards
    b.part(new THREE.DodecahedronGeometry(1, 0), BAS_A, {
      bone: leg.joints[1],
      at: [s * 0.52, 0.82, 0.44],
      scale: [0.24, 0.24, 0.2],
      rotation: [20, 30, 10],
      flat: true,
    });
    b.spike([s * 0.52, 0.9, 0.5], [s * 0.1, 0.5, 1], 0.3, 0.1, GOLD, { bone: leg.joints[1], sides: 5, smooth: false });
    b.extrude(
      [
        [0, -0.14],
        [0.09, 0],
        [0, 0.14],
        [-0.09, 0],
      ],
      {
        at: [s * 0.86, 1.15, 0.12],
        x: [0, 0, -s],
        y: [0, 1, 0],
        thickness: 0.06,
        bevel: 0.012,
        color: GOLD,
        bone: leg.joints[0],
      },
    );
    const shardLeg = (center: V3, az: number, el: number, len: number, w: number, color: typeof GOLD) => {
      const hit = b.surface(legSweep).around(center).at(az, el);
      if (hit)
        b.stick(new THREE.OctahedronGeometry(1, 0), color, hit, {
          embed: 0.2,
          scale: [w, len, w * 0.6],
          spin: R() * 360,
          flat: true,
        });
    };
    shardLeg([s * 0.45, 1.1, 0.1], s * 90, 20, 0.34, 0.13, GOLD);
    shardLeg([s * 0.5, 0.5, 0.1], s * 90, 10, 0.3, 0.12, BAS_A);
    shardLeg([s * 0.5, 0.5, 0.1], s * 150, 10, 0.26, 0.1, BAS_B);

    // foot
    b.part(new THREE.BoxGeometry(0.62, 0.28, 0.85), BAS_A, {
      bone: ankle,
      at: [s * 0.5, 0.13, 0.15],
      rotation: [0, s * 6, 0],
      flat: true,
    });
    b.part(new THREE.DodecahedronGeometry(1, 0), cracked(90 + s), {
      bone: ankle,
      at: [s * 0.5, 0.3, 0.2],
      scale: [0.3, 0.14, 0.38],
      flat: true,
    });
    b.part(new THREE.DodecahedronGeometry(1, 0), BAS_B, {
      bone: ankle,
      at: [s * 0.5, 0.17, -0.38],
      scale: [0.24, 0.2, 0.2],
      rotation: [10, 20, 0],
      flat: true,
    });
    glow(b.part(new THREE.BoxGeometry(0.3, 0.03, 0.04), LAVA, { bone: ankle, at: [s * 0.5, 0.29, 0.42], rotation: [0, s * 10, 0] }), 1.3);
    [-0.2, 0, 0.2].forEach((dx, i) => {
      const x = s * 0.5 + dx;
      const toe = b.chain(
        `toe${S}${i}`,
        polyline([
          [x, 0.11, 0.56],
          [x, 0.1, 0.8],
        ]),
        { parent: ankle, names: [`toe${S}${i}`], role: "digit" },
      );
      b.sweep(toe, [0.1, 0.085], { color: i === 1 ? BAS_A : BAS_B, sides: 5, smooth: false });
      b.spike([x, 0.12, 0.84], [0, 0, 1], 0.1, 0.07, GOLD, { bone: toe.joints[0], sides: 5, smooth: false });
    });
  }

  // ---------------------------------------------------------------- embers
  for (let i = 0; i < 12; i++) {
    const a = R() * Math.PI * 2;
    const rad = 0.9 + R() * 0.7;
    glow(
      b.part(new THREE.OctahedronGeometry(0.016 + R() * 0.014, 0), i % 3 ? LAVA : LAVA_HOT, {
        bone: hips,
        at: [Math.cos(a) * rad, 0.4 + R() * 2.4, Math.sin(a) * rad],
        flat: true,
      }),
      1.5,
    );
  }

  return b.root;
}
