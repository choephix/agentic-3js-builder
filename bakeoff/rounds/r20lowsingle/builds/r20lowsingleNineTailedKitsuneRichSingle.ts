import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import type { Frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A celestial nine-tailed fox in cel-shaded high-fantasy anime style: golden coat with cream bib, vermilion markings, gold collar and tassels, nine fanned tails tipped with violet spirit flames and drifting hitodama orbs.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const ORANGE = "#ff9d2e";
const CREAM = "#fff3dc";
const SOCK = "#3a2145";
const RED = "#d6283f";
const GOLD = "#f2c14e";
const PINK = "#ff9fb5";
const DARK = "#2a1730";

const coatRaw = furEdge(ORANGE, CREAM, { level: -0.25, teeth: 0.22, period: 0.03, ink: INK });
const COAT = cel(coatRaw);
const bibRaw = furEdge(CREAM, coatRaw, {
  axis: [0, 0, 1],
  level: 0.5,
  teeth: 0.25,
  period: 0.028,
  along: [1, 0, 0],
  ink: INK,
});
const NECKP = cel(bibRaw);
const LEGP = furEdge(COAT, cel(SOCK), {
  by: "position",
  level: 0.17,
  teeth: 0.05,
  period: 0.035,
  along: [1, 0, 1],
});
const HEADP = cel(
  furEdge(ORANGE, CREAM, { by: "position", level: 0.955, teeth: 0.025, period: 0.025, along: [1, 0, 0] }),
);
const CREAMP = cel(CREAM);
const ORANGEP = cel(ORANGE);
const EARP = paint((_p, _n, s) => (s[1] > 0.17 ? cel(DARK) : COAT));

function flameSvg(c1: string, c2: string, c3: string) {
  const body = "M32 126 C8 118 4 92 18 70 C22 60 18 48 26 34 C28 52 38 54 36 40 C44 22 40 12 36 2 C52 24 62 60 58 92 C56 112 46 124 32 126 Z";
  return svg(
    `<svg viewBox="0 0 64 128">
      <path d="${body}" fill="${c1}"/>
      <path d="${body}" fill="${c2}" transform="translate(32 126) scale(0.68 0.72) translate(-32 -126)"/>
      <path d="${body}" fill="${c3}" transform="translate(32 126) scale(0.36 0.46) translate(-32 -126)"/>
    </svg>`,
    { size: 128 },
  );
}
const FLAME_A = flameSvg("#8a4dff", "#5ad8ff", "#ffffff");
const FLAME_B = flameSvg("#4f7bff", "#9af0ff", "#ffffff");

const WISP = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 63 C4 48 6 22 16 1 C26 22 28 48 16 63 Z" fill="#ffffff"/></svg>`,
  { size: 96 },
);
const FOREHEAD = svg(
  `<svg viewBox="0 0 40 40">
    <path d="M5 32 Q20 -6 35 32 Q20 14 5 32 Z" fill="${RED}"/>
    <path d="M20 16 L20 36" stroke="${RED}" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 128 },
);
const CHEEK = svg(
  `<svg viewBox="0 0 64 32">
    <g stroke="${RED}" stroke-width="4" stroke-linecap="round" fill="none">
      <path d="M2 6 Q30 0 62 10"/><path d="M4 16 Q30 12 58 22"/><path d="M8 26 Q30 24 50 30"/>
    </g>
  </svg>`,
  { size: 192 },
);
const SWIRL = svg(
  `<svg viewBox="0 0 64 64">
    <g stroke="${RED}" stroke-width="5" stroke-linecap="round" fill="none">
      <path d="M32 6 C52 14 56 40 36 52 C22 58 10 46 16 34 C20 26 32 28 32 36"/>
      <path d="M8 14 Q16 8 22 16"/><path d="M50 56 Q58 50 60 42"/>
    </g>
  </svg>`,
  { size: 192 },
);
const TASSEL = svg(
  `<svg viewBox="0 0 24 64">
    <rect x="8" y="52" width="8" height="12" rx="3" fill="${GOLD}"/>
    <rect x="6" y="46" width="12" height="6" fill="${RED}"/>
    <path d="M6 46 L2 2 L8 6 L12 0 L16 6 L22 2 L18 46 Z" fill="${RED}"/>
    <path d="M12 46 L12 6" stroke="#ff7a8a" stroke-width="2" fill="none"/>
  </svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "nineTailedKitsune" });

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.62, -0.25], dir: [0, 0.1, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.62, -0.25],
      [0, 0.67, 0.05],
      [0, 0.72, 0.36],
    ]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "chest"] },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.72, 0.36],
      [0, 0.84, 0.5],
      [0, 0.96, 0.66],
    ]),
    { parent: chest, role: "neck", names: ["neck1", "neck2"] },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.96, 0.66], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.93, 0.7],
    aim: [0, 0.905, 0.92],
    role: "jaw",
  });

  // ---------------------------------------------------------------- body and neck
  const R = [0.09, 0.14, 0.15, 0.165, 0.11];
  const prof = (t: number) => {
    const x = Math.min(Math.max(t, 0), 1) * (R.length - 1);
    const i = Math.min(Math.floor(x), R.length - 2);
    return R[i] + (R[i + 1] - R[i]) * (x - i);
  };
  const body = b.sweep(
    catmull([
      [0, 0.6, -0.42],
      [0, 0.62, -0.25],
      [0, 0.67, 0.05],
      [0, 0.72, 0.36],
      [0, 0.76, 0.45],
    ]),
    (t) => [prof(t) * 0.82, prof(t)],
    { bone: [hips, spine], color: COAT },
  );
  const neckSw = b.sweep(neck, [0.105, 0.09, 0.078], { color: NECKP });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, { at: [s * 0.105, 0.55, -0.3], scale: [0.085, 0.16, 0.14] });
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, { at: [s * 0.1, 0.6, 0.3], scale: [0.075, 0.15, 0.12] });
    for (const z of [-0.22, 0.22])
      b.decal(body, SWIRL, {
        at: [s * 0.12, 0.66, z],
        dir: [s, 0, 0],
        size: [0.2, 0.2],
        mirror: s < 0,
      });
  }

  // ---------------------------------------------------------------- head
  const HC: [number, number, number] = [0, 0.98, 0.72];
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), HEADP, {
    bone: head,
    at: HC,
    scale: [0.1, 0.09, 0.105],
  });
  b.sweep(
    [
      [0, 0.97, 0.76],
      [0, 0.95, 0.93],
    ],
    [0.06, 0.027],
    { bone: head, color: HEADP, caps: "round" },
  );
  b.sweep(
    [
      [0, 0.915, 0.75],
      [0, 0.905, 0.915],
    ],
    [0.04, 0.018],
    { bone: jaw, color: CREAMP, caps: "round" },
  );
  b.part(new THREE.SphereGeometry(0.022, 8, 6), INK, { bone: head, at: [0, 0.957, 0.95] });

  const skin = b.surface(skull);
  const EYE = animeEye({ iris: "#ffc933", blush: "#ff8aa6" });
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 38, 2)!;
    b.decal(skin, EYE, { at: hit, size: [0.05, 0.068], mirror: s > 0 });
    const cheekHit = skin.around(HC).at(s * 78, -8)!;
    b.decal(skin, CHEEK, { at: cheekHit, size: [0.09, 0.045], mirror: s > 0 });
  }
  const fh = skin.around(HC).at(0, 30)!;
  b.decal(skin, FOREHEAD, { at: fh, size: [0.06, 0.06], up: [0, 1, -0.3] });
  const gemHit = skin.around(HC).at(0, 48)!;
  glow(b.stick(new THREE.OctahedronGeometry(0.024), "#b86bff", gemHit, { embed: 0.2 }), 1.3);

  for (const s of [1, -1]) {
    // ears
    const ear = b.extrude(
      [
        [-0.065, 0],
        [0.06, 0],
        [0.045, 0.12],
        [0, 0.25, "sharp"],
        [-0.04, 0.12],
      ],
      {
        at: [s * 0.065, 1.04, 0.66],
        x: [s, 0, 0],
        y: [s * 0.25, 1, 0],
        thickness: 0.02,
        bevel: 0.005,
        smoothing: 1,
        color: EARP,
        bone: head,
      },
    );
    b.extrude(
      [
        [-0.04, 0.015],
        [0.035, 0.015],
        [0, 0.19, "sharp"],
      ],
      {
        at: [s * 0.065, 1.04, 0.68],
        x: [s, 0, 0],
        y: [s * 0.25, 1, 0],
        thickness: 0.008,
        color: PINK,
        bone: head,
      },
    );
    b.part(new THREE.TorusGeometry(0.017, 0.004, 5, 10), GOLD, {
      bone: head,
      at: ear.local([0.05, 0.03, 0]),
      rotation: [0, 90, 0],
    });
    // cheek ruff
    for (let k = 0; k < 3; k++)
      b.spike([s * 0.085, 0.95 - 0.012 * k, 0.72 - 0.015 * k], [s * 0.8, -0.2 - 0.15 * k, -0.5], 0.1 - 0.012 * k, 0.03, {
        color: CREAM,
        bone: head,
      });
    // whiskers
    for (let k = 0; k < 2; k++)
      b.rod(
        [s * 0.04, 0.945 - 0.012 * k, 0.9],
        [s * 0.21, 0.94 - 0.03 * k, 0.86 - 0.03 * k],
        0.003,
        { color: CREAM, bone: head, sides: 4 },
      );
    // fangs
    b.spike([s * 0.025, 0.915, 0.89], [0, -1, 0.1], 0.03, 0.007, { color: "#ffffff", bone: head, sides: 5 });
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const front = limb(
      [s * 0.1, 0.66, 0.3],
      [s * 0.1, 0.04, 0.32],
      [0.28, 0.24, 0.14],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const legF = b.chain(`legF${S}`, front, {
      parent: chest,
      role: "leg",
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `paw${S}`],
    });
    b.sweep(legF, [0.052, 0.04, 0.032, 0.03], { color: LEGP, sides: 6 });
    const hind = limb(
      [s * 0.1, 0.62, -0.3],
      [s * 0.1, 0.04, -0.32],
      [0.3, 0.3, 0.14],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const legH = b.chain(`legH${S}`, hind, {
      parent: hips,
      role: "leg",
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`],
    });
    b.sweep(legH, [0.06, 0.04, 0.03, 0.028], { color: LEGP, sides: 6 });

    for (const [leg, z] of [
      [legF, 0.32],
      [legH, -0.32],
    ] as const) {
      const toe = leg.joints[3];
      b.part(new THREE.SphereGeometry(1, 8, 6), cel(SOCK), {
        bone: toe,
        at: [s * 0.1, 0.03, z + 0.03],
        scale: [0.045, 0.03, 0.07],
      });
      for (let k = -1; k <= 1; k++)
        b.spike([s * 0.1 + k * 0.02, 0.02, z + 0.09], [0, -0.2, 1], 0.035, 0.008, {
          color: CREAM,
          bone: toe,
          sides: 5,
        });
    }
  }

  // ---------------------------------------------------------------- collar, pendant
  const neckSkin = b.surface(neckSw);
  const loop = neckSkin.loop(neck.joints[1], { lift: 0.012 });
  b.sweep(loop, 0.016, { color: RED, sides: 6 });
  b.along(loop, 12, (at) => {
    b.part(new THREE.SphereGeometry(0.019, 6, 4), GOLD, { at });
  });
  const P = neckSkin.nearest([0, 0.76, 0.57]);
  b.stick(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 10), GOLD, P, { embed: 0.3 });
  glow(b.stick(new THREE.OctahedronGeometry(0.026), "#ff4b6e", P.moved([0, 0.012, 0]), { embed: 0.1 }), 1.2);
  b.cards(
    [-0.02, 0.02].map((dx) => frame([dx, P.at.y - 0.035, P.at.z + 0.01], [0, 1, 0])),
    TASSEL,
    { size: [0.035, 0.16], lean: 180, flow: [0, 0, 1] },
  );
  const bibHits = neckSkin.scatter(30, { rng: rng(5), minDist: 0.04, filter: (h) => h.n.z > 0.35 && h.n.y < 0.3 });
  b.cards(bibHits, WISP, {
    size: [0.045, 0.09],
    lean: 60,
    flow: [0, -1, -0.2],
    cross: true,
    vary: 0.3,
    rng: rng(6),
    color: CREAM,
  });

  // ---------------------------------------------------------------- nine tails
  const tips: Frame[] = [];
  for (let i = 0; i < 9; i++) {
    const a = ((i - 4) * 17 * Math.PI) / 180;
    const k = Math.abs(i - 4) / 4;
    const h = 0.9 - 0.32 * k;
    const pts: number[][] = [0, 0.25, 0.5, 0.75, 1].map((u) => [
      Math.sin(a) * (0.04 + 0.64 * u),
      0.66 + h * Math.pow(u, 1.35),
      -0.4 - 0.55 * Math.cos(a) * u,
    ]);
    const tipPt = new THREE.Vector3(pts[4][0], pts[4][1], pts[4][2]);
    const tail = b.chain(`tail${i + 1}_`, catmull(pts), { parent: hips, role: "tail" });
    const tp = paint((p) => (p.distanceTo(tipPt) < 0.22 ? CREAMP : ORANGEP));
    const sw = b.sweep(tail, (t) => 0.04 + 0.075 * Math.sin(Math.PI * Math.pow(t, 0.7)), {
      color: tp,
      caps: { end: "point" },
    });
    const cp = tail.at(0.2);
    b.part(new THREE.TorusGeometry(0.107, 0.008, 5, 12), GOLD, { at: cp, dir: cp.axis, axis: "z" });
    const hits = b.surface(sw).scatter(24, { rng: rng(20 + i), minDist: 0.05 });
    b.cards(hits, WISP, {
      size: [0.05, 0.11],
      lean: 55,
      flow: [0, 1, 0],
      cross: true,
      vary: 0.3,
      bend: 20,
      rng: rng(40 + i),
      color: tp,
    });
    tips.push(tail.at(1));
  }
  glow(
    b.cards(tips, [FLAME_A, FLAME_B], {
      size: [0.17, 0.32],
      cross: true,
      vary: 0.25,
      rng: rng(9),
      sink: 0.3,
    }),
    1.4,
  );

  // ---------------------------------------------------------------- hitodama (floating spirit flames)
  const ys = [0.4, 0.9, 0.55, 1.15, 0.7, 1.0, 0.45];
  const orbFrames: Frame[] = [];
  for (let k = 0; k < 7; k++) {
    const a = ((-120 + k * 40) * Math.PI) / 180;
    const p: [number, number, number] = [1.15 * Math.sin(a), ys[k], 0.1 + 1.15 * Math.cos(a)];
    glow(b.part(new THREE.SphereGeometry(0.045, 8, 6), "#d9f6ff", { at: p, bone: hips }), 1.5);
    orbFrames.push(frame([p[0], p[1] + 0.03, p[2]], [0, 1, 0]));
  }
  glow(
    b.cards(orbFrames, [FLAME_A, FLAME_B], { size: [0.13, 0.24], cross: true, vary: 0.2, rng: rng(11), bone: hips }),
    1.4,
  );

  return b.root;
}
