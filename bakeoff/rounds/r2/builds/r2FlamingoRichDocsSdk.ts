import * as THREE from "three";
import { createBuilder, catmull, polyline, limb, countershade, mottle } from "../../../../src/index";

export const meta = {
  name: "Flamingo",
  description:
    "Candy-pink flamingo wading in shallow water: S-curved neck, bent two-part beak with a black tip, coral wings with black flight feathers, knobbly-kneed rose legs and webbed feet.",
};

const PINK = "#f6a0b8";
const PINK_LIGHT = "#fbc4d0";
const PINK_MID = "#f58fa5";
const CORAL = "#ee6c6e";
const CORAL_SOFT = "#f2808a";
const SECOND = "#f48b8b";
const BLACK = "#26202a";
const ROSE = "#e8758f";
const ROSE_DARK = "#d4587a";
const WEB = "#f0a0b4";
const BILL_PALE = "#f8dcd9";
const EYE = "#f6e58a";
const PUPIL = "#18121a";
const WATER = "#8fd1d6";
const RIPPLE = "#d8f1f2";
const TAILC = "#f7a4b8";

type V3 = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "flamingo" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.74, -0.05], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.72, -0.3],
      [0, 0.75, -0.05],
      [0, 0.82, 0.22],
    ]),
    { parent: hips, count: 4, role: "spine" },
  );
  const spineEnd = spine.joints[spine.joints.length - 1];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.82, 0.22],
      [0, 0.93, 0.34],
      [0, 1.08, 0.37],
      [0, 1.22, 0.29],
      [0, 1.36, 0.27],
      [0, 1.47, 0.34],
      [0, 1.52, 0.41],
    ]),
    { parent: spineEnd, count: 6, role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: neck.at(1), dir: [0, -0.08, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.04, down: 0.025 }),
    aim: head.local({ forward: 0.14, down: 0.025 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.72, -0.3],
      [0, 0.7, -0.45],
      [0, 0.66, -0.6],
    ]),
    { parent: spine.joints[0], count: 2, role: "tail" },
  );

  // ---------- body ----------
  const coat = countershade(mottle(PINK, "#f9b3c6", { size: 0.1 }), PINK_LIGHT, { level: -0.1 });
  const bodyR = (t: number): [number, number] => {
    const k = Math.sin(Math.PI * (0.08 + 0.8 * t));
    return [0.05 + 0.14 * k, 0.05 + 0.17 * k];
  };
  b.sweep(spine, bodyR, { color: coat });
  b.sweep(neck, (t: number) => 0.052 - 0.022 * t, { color: coat });

  // head
  b.part(new THREE.SphereGeometry(0.048, 10, 8), PINK, {
    bone: head,
    at: head.local({ forward: 0.03 }),
    scale: [0.85, 0.9, 1.25],
  });

  // beak: upper (on head) and lower (on jaw), both bent downward
  const up = catmull(
    [
      head.local({ forward: 0.07, up: 0.0 }),
      head.local({ forward: 0.13, up: 0.003 }),
      head.local({ forward: 0.18, down: 0.025 }),
      head.local({ forward: 0.205, down: 0.085 }),
    ],
  );
  b.sweep(up, (t: number): [number, number] => [0.027 - 0.02 * t, 0.022 - 0.016 * t], {
    bone: head,
    bands: [
      [0.45, BILL_PALE],
      [1, BLACK],
    ],
    sides: 8,
  });
  const low = catmull([
    head.local({ forward: 0.07, down: 0.024 }),
    head.local({ forward: 0.13, down: 0.028 }),
    head.local({ forward: 0.17, down: 0.045 }),
    head.local({ forward: 0.19, down: 0.077 }),
  ]);
  b.sweep(low, (t: number): [number, number] => [0.02 - 0.014 * t, 0.012 - 0.007 * t], {
    bone: jaw,
    bands: [
      [0.5, BILL_PALE],
      [1, BLACK],
    ],
    sides: 8,
  });

  // eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.014, 8, 6), EYE, {
      bone: head,
      at: head.local({ left: s * 0.036, forward: 0.05, up: 0.014 }),
    });
    b.part(new THREE.SphereGeometry(0.0075, 6, 5), PUPIL, {
      bone: head,
      at: head.local({ left: s * 0.047, forward: 0.057, up: 0.014 }),
    });
  }

  // ---------- feather helpers ----------
  const featherOutline = (L: number, w: number, pointed: boolean) => {
    const o: any[] = [
      [0, -w * 0.35],
      [L * 0.55, -w * 0.5],
      [L * 0.92, -w * 0.28],
      pointed ? [L, 0, "sharp"] : [L, 0],
      [L * 0.92, w * 0.28],
      [L * 0.55, w * 0.5],
      [0, w * 0.35],
    ];
    return o;
  };
  const offAt = (y: number, z: number, layer: number) => {
    const t = Math.min(1, Math.max(0, (z + 0.3) / 0.52));
    const k = Math.sin(Math.PI * (0.08 + 0.8 * t));
    const rx = 0.05 + 0.14 * k;
    const ry = 0.05 + 0.17 * k;
    const yc = 0.75 + 0.25 * (z + 0.05);
    const q = Math.min(0.9, Math.abs((y - yc) / ry));
    return rx * Math.sqrt(1 - q * q) + 0.004 + layer;
  };

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${S}`,
      polyline([
        [s * 0.17, 0.86, 0.14],
        [s * 0.17, 0.8, -0.15],
        [s * 0.17, 0.74, -0.5],
      ]),
      { parent: spine.joints[2], names: [`shoulder${S}`, `wrist${S}`, `wingtip${S}`], role: "wing" },
    );
    const bones = [wing.joints[0], wing.joints[1]];
    const row = (o: {
      y: number; dy: number; n: number; z0: number; z1: number; a0: number; a1: number;
      L0: number; L1: number; w: number; col: string; layer: number; bi: number; round?: boolean;
    }) => {
      for (let i = 0; i < o.n; i++) {
        const f = o.n === 1 ? 0 : i / (o.n - 1);
        const z = o.z0 + (o.z1 - o.z0) * f;
        const y = o.y + o.dy * i;
        const ang = o.a0 + (o.a1 - o.a0) * f;
        const L = o.L0 + (o.L1 - o.L0) * f;
        const a = (ang * Math.PI) / 180;
        const dir: V3 = [0, -Math.sin(a), -Math.cos(a)];
        const yd: V3 = [0, Math.cos(a), -Math.sin(a)];
        b.extrude(featherOutline(L, o.w, !o.round), {
          at: [s * offAt(y, z, o.layer), y, z],
          x: dir,
          y: yd,
          thickness: 0.008,
          smoothing: 1,
          color: o.col,
          bone: bones[o.bi],
        });
      }
    };
    // black flight feathers (primaries)
    row({ y: 0.74, dy: -0.004, n: 7, z0: -0.1, z1: -0.36, a0: 3, a1: 14, L0: 0.42, L1: 0.36, w: 0.07, col: BLACK, layer: 0.0, bi: 1 });
    // secondaries
    row({ y: 0.77, dy: -0.003, n: 9, z0: 0.02, z1: -0.28, a0: 5, a1: 10, L0: 0.26, L1: 0.24, w: 0.075, col: SECOND, layer: 0.006, bi: 1 });
    // coverts, deepening to coral
    row({ y: 0.84, dy: -0.003, n: 8, z0: 0.12, z1: -0.25, a0: 12, a1: 12, L0: 0.22, L1: 0.2, w: 0.08, col: CORAL, layer: 0.012, bi: 0, round: true });
    row({ y: 0.91, dy: -0.003, n: 7, z0: 0.14, z1: -0.14, a0: 16, a1: 14, L0: 0.17, L1: 0.17, w: 0.08, col: CORAL_SOFT, layer: 0.016, bi: 0, round: true });
    row({ y: 0.97, dy: -0.004, n: 6, z0: 0.1, z1: -0.2, a0: 8, a1: 10, L0: 0.22, L1: 0.2, w: 0.08, col: PINK_MID, layer: 0.02, bi: 0, round: true });
  }

  // ---------- tail fan ----------
  for (let i = 0; i < 5; i++) {
    const phi = ((i - 2) * 12 * Math.PI) / 180;
    const d = new THREE.Vector3(Math.sin(phi), -0.12, -Math.cos(phi)).normalize().toArray() as V3;
    const yd: V3 = [Math.cos(phi), 0, Math.sin(phi)];
    b.extrude(featherOutline(0.3, 0.07, false), {
      at: [0, 0.7 + i * 0.002, -0.33],
      x: d,
      y: yd,
      thickness: 0.006,
      smoothing: 1,
      color: TAILC,
      bone: tail.joints[0],
    });
  }

  // ---------- legs & feet ----------
  const footPts: V3[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hipP: V3 = [s * 0.085, 0.6, -0.03];
    const foot: V3 = [s * 0.1, 0.02, 0.0];
    footPts.push(foot);
    const pts = limb(hipP, foot, [0.3, 0.3], [0, 0, -1]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [foot[0], 0, foot[2]],
    });
    b.sweep(leg, [0.026, 0.013], { color: ROSE });
    const knee = leg.joints[1];
    // thigh feathering
    b.part(new THREE.SphereGeometry(0.075, 8, 6), PINK, {
      bone: leg.joints[0],
      at: [s * 0.09, 0.57, -0.03],
      scale: [0.7, 1.2, 0.9],
    });
    // knobbly knee
    b.part(new THREE.IcosahedronGeometry(0.032, 0), ROSE_DARK, { bone: knee, at: knee.at, flat: true });
    b.part(new THREE.IcosahedronGeometry(0.02, 0), ROSE_DARK, {
      bone: knee,
      at: knee.local({ forward: 0.026, left: s * 0.012 }),
      flat: true,
    });
    b.part(new THREE.IcosahedronGeometry(0.018, 0), ROSE_DARK, {
      bone: knee,
      at: knee.local({ back: 0.026, up: 0.022 }),
      flat: true,
    });
    const tip = leg.tip!;
    b.part(new THREE.IcosahedronGeometry(0.02, 0), ROSE_DARK, { bone: tip, at: tip.at, flat: true });

    // toes
    const angs = [-30, 0, 30];
    const lens = [0.11, 0.14, 0.11];
    angs.forEach((deg, i) => {
      const a = (deg * Math.PI) / 180;
      const L = lens[i];
      const p0: V3 = [foot[0], 0.02, foot[2]];
      const p1: V3 = [foot[0] + Math.sin(a) * L * 0.5, 0.02, foot[2] + Math.cos(a) * L * 0.5];
      const p2: V3 = [foot[0] + Math.sin(a) * L, 0.02, foot[2] + Math.cos(a) * L];
      const toe = b.chain(`toe${i}${S}`, polyline([p0, p1, p2]), {
        parent: tip,
        names: [`toe${i}${S}a`, `toe${i}${S}b`],
        role: "digit",
      });
      b.sweep(toe, [0.009, 0.006], { color: ROSE, sides: 6 });
    });
    // web
    b.extrude(
      [
        [0, 0],
        [0.095, 0.055],
        [0.085, 0.03],
        [0.14, 0],
        [0.085, -0.03],
        [0.095, -0.055],
      ],
      { at: [foot[0], 0.016, foot[2]], x: [0, 0, 1], y: [1, 0, 0], thickness: 0.006, color: WEB, bone: tip },
    );
  }

  // ---------- water ----------
  b.lathe(
    [
      [0, 0],
      [0.9, 0],
      [0.9, 0.012],
      [0, 0.012],
    ],
    { at: [0, 0, 0], segments: 28, color: WATER, bone: hips },
  );
  for (const f of footPts) {
    for (const r of [0.2, 0.33]) {
      b.lathe(
        [
          [r - 0.012, 0.011],
          [r, 0.021],
          [r + 0.012, 0.011],
        ],
        { at: [f[0], 0, f[2]], segments: 20, color: RIPPLE, bone: hips },
      );
    }
  }

  return b.root;
}
