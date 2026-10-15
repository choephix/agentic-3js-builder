import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { offset, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { countershade, paint, scales } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Qilin",
  description:
    "Scaled, hooved chimera with a dragon head, gold branching antlers, a cloud mane and a flame-plumed tail, cel-shaded in high-fantasy anime style.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "qilin" });
  const r = rng(11);

  // ---------- palette ----------
  const SCALE = scales(["#2cc3a4", "#35d3b2", "#23a98f"], "#126a5c", { size: 0.055, width: 0.14, seed: 3 });
  const COAT = cel(countershade(SCALE, "#f6e7b4", { level: -0.3, soft: 0.25 }));
  const SOCK = cel(scales(["#fff1c4", "#f9e3a0"], "#c9a14a", { size: 0.04, width: 0.14, seed: 5 }));
  const LEGP = paint((p) => (p.y < 0.34 ? SOCK : COAT));
  const HEADP = cel(scales(["#2cc3a4", "#35d3b2", "#23a98f"], "#126a5c", { size: 0.035, width: 0.16, seed: 8 }));
  const JAW = cel("#9fe8d4");
  const GOLD = cel("#f2bf46", "#c4802a");
  const DGOLD = cel("#c98a2c", "#8c561f");
  const EAR = cel("#23a98f", "#157a74");
  const CREAM = cel("#fff4d6", "#e9cf9f");
  const MANE = [cel("#fff8e6"), cel("#c9f4ea"), cel("#9fe6dc")];
  const CYAN = "#8ffcff";

  // ---------- textures ----------
  const plume = svg(
    `<svg viewBox="0 0 64 128">
    <path d="M22 128 C10 96 14 60 34 36 C44 22 52 14 58 2 C60 24 54 44 46 60 C40 72 40 96 44 128 Z" fill="#fff6df" stroke="#59d8c6" stroke-width="4" stroke-linejoin="round"/>
    <path d="M30 120 C24 92 28 66 42 46" fill="none" stroke="#9fe9dc" stroke-width="4" stroke-linecap="round"/>
    <path d="M38 118 C36 96 40 80 48 64" fill="none" stroke="#c4f3ea" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
    { size: 128 },
  );
  const flame = svg(
    `<svg viewBox="0 0 48 96">
    <path d="M24 96 C6 70 16 52 20 34 C22 24 18 14 24 2 C30 16 38 24 36 40 C44 36 46 30 44 24 C54 48 46 78 24 96 Z" fill="#ffb12e" stroke="#ff5a2a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M24 90 C14 72 22 58 26 44 C32 56 36 66 24 90 Z" fill="#fff0a0"/>
  </svg>`,
    { size: 128 },
  );
  const scroll = svg(
    `<svg viewBox="0 0 120 90">
    <path d="M20 62 C20 40 45 35 52 52 C58 66 40 74 34 62 C30 54 40 48 44 56" fill="none" stroke="#f6c94c" stroke-width="4" stroke-linecap="round"/>
    <path d="M52 52 C70 30 100 40 112 60 C100 56 88 58 80 66" fill="none" stroke="#f6c94c" stroke-width="4" stroke-linecap="round"/>
    <path d="M60 70 C70 62 82 66 90 74" fill="none" stroke="#fff1b0" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
    { size: 256 },
  );
  const EYE = animeEye({ iris: "#ffb02e", blush: false });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 1.05, -0.55], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.05, -0.55],
      [0, 1.1, -0.05],
      [0, 1.12, 0.45],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.12, 0.45],
      [0, 1.35, 0.72],
      [0, 1.62, 0.88],
    ]),
    { parent: spine.joints[1], names: ["neck1", "neck2"], role: "neck" },
  );
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.08, -0.7],
      [0, 1.15, -1.05],
      [0, 1.0, -1.4],
      [0, 0.75, -1.6],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.62, 0.88], dir: [0, -0.25, 1], role: "head" });
  const H = head;
  const jaw = b.joint("jaw", {
    parent: head,
    at: H.local({ forward: 0.07, down: 0.075 }),
    aim: H.local({ forward: 0.38, down: 0.1 }),
    role: "jaw",
  });

  // ---------- body, neck, tail ----------
  const bodySw = b.sweep(
    spine,
    (t) => [0.21 + 0.06 * Math.sin(Math.PI * t), 0.25 + 0.06 * Math.sin(Math.PI * t)],
    { color: COAT },
  );
  const neckSw = b.sweep(neck, [0.2, 0.15, 0.11], { color: COAT });
  const tailSw = b.sweep(tail, [0.07, 0.05, 0.035], { color: COAT, caps: "round" });

  // dorsal fins
  for (let i = 0; i < 12; i++) {
    const hit = bodySw.at(0.06 + (0.88 * i) / 11, 0);
    b.stick(new THREE.ConeGeometry(0.03, 0.09, 5), GOLD, hit, { embed: 0.3 });
  }
  // cloud-scroll decals on flanks
  for (const s of [1, -1]) {
    for (const z of [0.3, -0.38]) {
      b.decal(bodySw, scroll, {
        at: [s * 0.3, 1.12, z],
        dir: [s, 0, 0],
        size: [0.36, 0.27],
        mirror: s < 0,
      });
    }
  }
  // shoulder flames
  const shoulderFrames = [75, -75, 105, -105].map((a) => bodySw.at(0.82, a));
  b.cards(shoulderFrames, flame, { size: [0.13, 0.3], lean: 55, bend: 30, flow: [0, 0.5, -1], vary: 0.25, rng: r });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const legs = [
      {
        key: "F",
        parent: spine.joints[1],
        root: [s * 0.2, 1.0, 0.45],
        foot: [s * 0.2, 0.14, 0.5],
        lens: [0.4, 0.38, 0.22],
        bends: [
          [0, 0, -1],
          [0, 0, 1],
        ],
        names: [`shoulder${S}`, `elbow${S}`, `knee${S}`, `hoof${S}`],
        blob: [s * 0.2, 1.0, 0.45],
        bs: [0.12, 0.18, 0.17],
      },
      {
        key: "H",
        parent: hips,
        root: [s * 0.2, 1.0, -0.55],
        foot: [s * 0.2, 0.14, -0.66],
        lens: [0.45, 0.42, 0.2],
        bends: [
          [0, 0, 1],
          [0, 0, -1],
        ],
        names: [`hip${S}`, `stifle${S}`, `hock${S}`, `hoofH${S}`],
        blob: [s * 0.2, 0.95, -0.58],
        bs: [0.13, 0.2, 0.2],
      },
    ];
    for (const L of legs) {
      const pts = limb(L.root, L.foot, L.lens, L.bends);
      const leg = b.chain(`leg${L.key}${S}`, pts, { parent: L.parent, names: L.names, role: "leg" });
      const tip = leg.joints[leg.joints.length - 1];
      const sw = b.sweep(leg, [0.12, 0.085, 0.055, 0.045], { color: LEGP });
      b.part(new THREE.SphereGeometry(1, 10, 8), COAT, { bone: leg.joints[0], at: L.blob, scale: L.bs });
      b.part(new THREE.CylinderGeometry(0.055, 0.075, 0.12, 8), GOLD, {
        bone: tip,
        at: [L.foot[0], 0.06, L.foot[2]],
      });
      b.part(new THREE.TorusGeometry(0.056, 0.012, 5, 10), DGOLD, {
        bone: tip,
        at: [L.foot[0], 0.2, L.foot[2]],
        dir: [0, 1, 0],
        axis: "z",
      });
      const fr = [0.45, 0.85].flatMap((t) => [90, -90].map((a) => sw.at(t, a)));
      b.cards(fr, flame, { size: [0.09, 0.2], lean: 60, bend: 25, flow: [0, -1, -0.2], vary: 0.2, rng: r });
    }
  }

  // ---------- collar ----------
  const nk = neck.at(0.1);
  b.part(new THREE.TorusGeometry(0.205, 0.026, 6, 14), GOLD, {
    bone: neck.joints[0],
    at: nk.at,
    dir: nk.tangent,
    axis: "z",
  });
  const bellAt = offset(nk.at, [0, -0.4, 1], 0.21);
  b.part(new THREE.SphereGeometry(0.045, 8, 6), GOLD, { bone: neck.joints[0], at: bellAt });
  glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), CYAN, { bone: neck.joints[0], at: offset(bellAt, [0, -1, 0.2], 0.045) }));

  // ---------- cloud mane ----------
  let mi = 0;
  for (let i = 0; i < 10; i++) {
    const t = 0.04 + i * 0.1;
    const size = 0.085 - 0.02 * (i / 9);
    for (const a of [-45, 0, 45]) {
      const hit = neckSw.at(t, a);
      const rad = (a === 0 ? 1.15 : 0.85) * size;
      b.stick(new THREE.SphereGeometry(rad, 8, 6), MANE[mi++ % 3], hit, { embed: 0.35 });
    }
  }
  const maneFrames = [0.08, 0.2, 0.32, 0.44, 0.56, 0.68, 0.8, 0.92].flatMap((t) =>
    [-60, -25, 0, 25, 60].map((a) => neckSw.at(t, a)),
  );
  b.cards(maneFrames, plume, {
    size: [0.14, 0.34],
    lean: 50,
    bend: 45,
    flow: [0, -0.4, -1],
    vary: 0.3,
    spin: 15,
    rng: r,
  });

  // ---------- tail plume ----------
  for (const t of [1, 0.82]) {
    const items = b.ring(tail.at(t), { count: 6, radius: 0.03, tilt: 40 }).items;
    b.cards(items, plume, { size: [0.2, 0.46], lean: 30, bend: 50, flow: [0, -1, -0.5], vary: 0.2, spin: 20, rng: r });
  }
  b.cards(
    [0.5, 0.7].flatMap((t) => [60, 0, -60].map((a) => tailSw.at(t, a))),
    flame,
    { size: [0.1, 0.24], lean: 45, bend: 30, flow: [0, 0.2, -1], vary: 0.2, rng: r },
  );

  // ---------- head ----------
  const HC = H.local({ forward: 0.08 });
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), HEADP, {
    bone: head,
    at: HC,
    scale: [0.125, 0.115, 0.16],
  });
  b.sweep([H.local({ forward: 0.1 }), H.local({ forward: 0.38, down: 0.03 })], (t) => [0.085 - 0.04 * t, 0.08 - 0.035 * t], {
    bone: head,
    color: HEADP,
  });
  b.sweep([jaw.at, H.local({ forward: 0.38, down: 0.1 })], (t) => [0.07 - 0.035 * t, 0.04 - 0.015 * t], {
    bone: jaw,
    color: JAW,
  });
  b.rod(H.local({ forward: 0.12, down: 0.07 }), H.local({ forward: 0.32, down: 0.07 }), 0.016, "#ff8fa0", { bone: jaw });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.016, 6, 4), INK, {
      bone: head,
      at: H.local({ forward: 0.4, left: s * 0.03, up: 0.015 }),
    });
    for (const f of [0.26, 0.31]) {
      b.spike(H.local({ left: s * 0.055, forward: f, down: 0.045 }), [0, -1, 0], 0.05, 0.011, "#fffbea", { bone: head });
    }
    // brow
    b.rod(H.local({ left: s * 0.04, up: 0.1, forward: 0.14 }), H.local({ left: s * 0.1, up: 0.09, forward: 0.02 }), [0.02, 0.014], EAR, {
      bone: head,
    });
    // ears and cheek frills
    b.extrude(
      [
        [0, 0],
        [0.06, 0.1],
        [0.2, 0.2, "sharp"],
        [0.12, 0.04],
      ],
      {
        at: H.local({ left: s * 0.1, up: 0.06, back: 0.02 }),
        x: [0, 0, -1],
        y: [s * 0.5, 1, 0],
        thickness: 0.016,
        bevel: 0.004,
        color: EAR,
        bone: head,
      },
    );
    b.extrude(
      [
        [0, 0],
        [0.1, 0.05],
        [0.2, 0.0, "sharp"],
        [0.12, -0.06],
        [0.04, -0.05],
      ],
      {
        at: H.local({ left: s * 0.11, down: 0.02, forward: 0.04 }),
        x: [0, 0, -1],
        y: [s * 0.4, 1, 0],
        thickness: 0.012,
        color: CREAM,
        bone: head,
      },
    );
    // whiskers
    for (const k of [0, 1]) {
      const d = k * 0.05;
      b.sweep(
        catmull([
          H.local({ left: s * 0.06, forward: 0.36, down: 0.02 + d }),
          H.local({ left: s * 0.16, forward: 0.4, down: d }),
          H.local({ left: s * 0.3, forward: 0.15, up: 0.05 - d }),
          H.local({ left: s * 0.4, back: 0.2, down: 0.15 + d }),
          H.local({ left: s * 0.35, back: 0.5, down: 0.35 + d }),
        ]),
        [0.009, 0.003],
        { bone: head, color: "#fff2c9" },
      );
    }
    // eyes
    const hit = b.surface(skull).around(skull.at).at(s * 52, 8)!;
    b.decal(b.surface(skull), EYE, { at: hit, size: [0.058, 0.08], mirror: s > 0 });

    // antlers
    const crown = b.surface(skull).around(skull.at).at(s * 30, 62)!;
    const beam = catmull([
      H.local({ left: s * 0.07, up: 0.2 }),
      H.local({ left: s * 0.11, up: 0.36, back: 0.1 }),
      H.local({ left: s * 0.1, up: 0.52, back: 0.3 }),
      H.local({ left: s * 0.06, up: 0.62, back: 0.55 }),
    ]);
    b.sprout(`antler${s > 0 ? "L" : "R"}`, crown, beam, [0.032, 0.012], GOLD, { count: 0, caps: { end: "point" } });
    b.along(beam, 4, (at) =>
      b.part(new THREE.TorusGeometry(0.026 * (1 - 0.6 * at.t) + 0.01, 0.007, 5, 8), DGOLD, {
        at,
        dir: at.axis,
        axis: "z",
        bone: head,
      }),
    );
    const tines: Array<[number, number[], number]> = [
      [0.3, [s * 0.4, 0.6, 0.7], 0.2],
      [0.55, [s * 0.5, 0.8, 0.3], 0.22],
      [0.78, [s * 0.3, 0.9, -0.2], 0.16],
    ];
    for (const [t, dir, len] of tines) {
      const p = beam.at(t);
      b.spike(p, dir, len, 0.017, GOLD, { bone: head });
      glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), CYAN, { bone: head, at: offset(p, dir, len + 0.005) }));
    }
    glow(b.part(new THREE.SphereGeometry(0.016, 6, 4), CYAN, { bone: head, at: offset(beam.at(1), [0, 0.3, -1], 0.03) }));
  }
  // forehead gem
  glow(
    b.part(new THREE.OctahedronGeometry(0.03, 0), CYAN, {
      bone: head,
      at: H.local({ forward: 0.2, up: 0.095 }),
    }),
    1.3,
  );
  // goatee
  for (const [dx, dir] of [
    [0, [0, -0.8, -0.5]],
    [0.03, [0.3, -0.8, -0.5]],
    [-0.03, [-0.3, -0.8, -0.5]],
  ] as Array<[number, number[]]>) {
    b.spike(H.local({ left: dx, forward: 0.26, down: 0.14 }), dir, 0.2, 0.028, MANE[1], { bone: jaw });
  }

  return b.root;
}
