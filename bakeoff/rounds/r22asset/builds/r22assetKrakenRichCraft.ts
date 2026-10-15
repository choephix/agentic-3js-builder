import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { mottle, paint } from "../../../../src/paint";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kraken",
  description:
    "A giant kraken rising from a churning water column, eight tentacles spread and two feelers raised, in a polished Overwatch-style sci-fi look with an orange accent.",
  style: "Overwatch",
  commit: "88fc1f0",
};

const ORANGEF = "#ff8a2b";
const CREAMF = "#f4e3c1";
const SUCKIN = "#7a3a5c";
const DARKF = "#1b2347";
const BEAK = "#2b1d33";

const BODY = cel(mottle("#34509e", "#3f66b8", { size: 0.6, contrast: 1.2 }));
const DARK = cel(DARKF);
const ORANGE = cel(ORANGEF);
const CREAM = cel(CREAMF);

const MANTLE = paint((_p, _n, s) => {
  const d = Math.min(s[1], 360 - s[1]);
  if (d < 10 && s[0] > 0.12) return ORANGE;
  const band = (s[0] * 9) % 1;
  if (band < 0.035) return DARK;
  return BODY;
});
const HEAD = paint((_p, n) => (n.y < -0.4 ? CREAM : BODY));

export default function build() {
  const b = createBuilder({ name: "kraken" });
  const core = b.joint("core", { at: [0, 1.75, 0] });

  // Water column and base
  b.part(new THREE.CylinderGeometry(6.5, 6.5, 0.12, 24), "#1f8fb0", { bone: core, at: [0, 0.04, 0] });
  b.lathe(
    [
      [0, 0],
      [1.7, 0],
      [1.45, 0.25],
      [1.0, 0.8],
      [0.8, 1.3],
      [0.7, 1.5],
      [0, 1.5],
    ],
    { at: [0, 0, 0], bone: core, color: "#1b78a6", segments: 14 },
  );
  for (const [rad, col] of [
    [1.6, "#e6f7fb"],
    [2.6, "#a8e3f0"],
    [3.9, "#e6f7fb"],
  ] as const)
    b.part(new THREE.TorusGeometry(rad, 0.07, 5, 28), col, { bone: core, at: [0, 0.1, 0], rotation: [90, 0, 0] });
  const rd = rng(11);
  for (let i = 0; i < 16; i++) {
    const ang = rd() * Math.PI * 2;
    const rr = 1.8 + rd() * 3;
    b.part(new THREE.SphereGeometry(0.06 + 0.08 * rd(), 6, 4), "#bfeaf5", {
      bone: core,
      at: [Math.sin(ang) * rr, 0.5 + rd() * 2.6, Math.cos(ang) * rr],
    });
  }

  // Body
  b.part(new THREE.SphereGeometry(1, 14, 10), BODY, { bone: core, at: [0, 1.75, -0.1], scale: [1.15, 1.0, 1.2] });
  const mantle = b.chain(
    "mantle",
    catmull([
      [0, 1.75, 0],
      [0, 2.5, -0.45],
      [0, 3.3, -0.95],
      [0, 4.0, -1.5],
    ]),
    { parent: core, count: 3, role: "spine" },
  );
  const mantleSweep = b.sweep(mantle, [1.0, 1.05, 0.85, 0.4], { color: MANTLE });
  b.along(mantleSweep, 5, (at) => {
    b.spike(at, at, 0.4, 0.09, ORANGEF);
  });
  const skin = b.surface(mantleSweep);
  for (const h of skin.scatter(16, { rng: rng(5), minDist: 0.4, filter: (hit) => hit.n.y > 0.2 }))
    b.stick(new THREE.ConeGeometry(0.1, 0.18, 6), CREAMF, h);
  glow(
    b.part(new THREE.OctahedronGeometry(0.28), ORANGEF, {
      bone: mantle.joints[mantle.joints.length - 1],
      at: [0, 4.35, -1.75],
      scale: [0.8, 1.6, 0.8],
    }),
    1.3,
  );
  for (const s of [1, -1])
    b.extrude(
      [
        [0, 0.2],
        [0.3, 1.1],
        [1.1, 1.6, "sharp"],
        [1.6, 0.6],
        [1.0, 0.0],
      ],
      {
        at: [s * 0.7, 3.0, -0.7],
        x: [0, 0, -1],
        y: [s, 0, 0],
        thickness: 0.07,
        bevel: 0.02,
        color: ORANGE,
        bone: mantle.joints[1],
      },
    );
  b.part(new THREE.TorusGeometry(1.2, 0.09, 6, 18), ORANGE, { bone: core, at: [0, 1.7, 0.05], scale: [1, 0.95, 1] });

  // Head
  const head = b.joint("head", { parent: core, at: [0, 1.7, 0.5], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.35, 1.0], aim: [0, 1.25, 1.6], role: "jaw" });
  b.part(new THREE.SphereGeometry(1, 14, 10), HEAD, { bone: head, at: [0, 1.75, 0.75], scale: [0.95, 0.8, 0.9] });
  b.part(new THREE.SphereGeometry(0.4, 8, 6), "#14091f", { bone: head, at: [0, 1.38, 1.25] });
  b.spike([0, 1.55, 1.15], [0, 1.2, 1.85], null, 0.24, BEAK, { bone: head, sides: 6 });
  b.spike([0, 1.3, 1.1], [0, 1.38, 1.7], null, 0.18, BEAK, { bone: jaw, sides: 6 });
  for (const s of [1, -1]) {
    const E = [s * 0.6, 1.85, 1.2];
    b.part(new THREE.SphereGeometry(0.34, 8, 6), DARKF, { bone: head, at: [E[0], E[1], E[2] - 0.04] });
    glow(b.part(new THREE.SphereGeometry(0.28, 10, 8), ORANGEF, { bone: head, at: E }), 1.2);
    b.part(new THREE.SphereGeometry(0.1, 8, 6), "#14091f", {
      bone: head,
      at: [E[0] + s * 0.12, E[1] + 0.02, E[2] + 0.24],
      scale: [1.7, 0.6, 0.6],
    });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), "#ffffff", {
      bone: head,
      at: [E[0] + s * 0.06, E[1] + 0.13, E[2] + 0.22],
    });
    b.part(new THREE.BoxGeometry(0.6, 0.1, 0.35), ORANGEF, {
      bone: head,
      at: [s * 0.6, 2.12, 1.1],
      rotation: [-15, 0, -s * 25],
    });
  }
  for (let i = 0; i < 6; i++) {
    const a = ((200 + i * 28) * Math.PI) / 180;
    const cx = Math.cos(a);
    const sy = Math.sin(a);
    b.sweep(
      catmull([
        [cx * 0.25, 1.3 + sy * 0.15, 1.3],
        [cx * 0.6, 1.15 + sy * 0.35, 1.8],
        [cx * 1.0, 0.9 + sy * 0.35, 2.2],
      ]),
      [0.09, 0.02],
      { bone: head, color: BODY, sides: 6 },
    );
  }

  // Tentacles
  const arm = (name: string, pts: number[][], r0: number, nSuck: number, nGlow: number) => {
    const ch = b.chain(name, catmull(pts), { parent: core, count: 6, role: "tentacle" });
    const rad = (t: number) => r0 * Math.pow(1 - t, 1.2) + 0.05;
    const sw = b.sweep(ch, rad, { color: BODY, sectors: [[135, 225, CREAM]] });
    for (let k = 1; k <= nSuck; k++) {
      const t = 0.1 + (0.8 * k) / (nSuck + 1);
      const rs = rad(t) * 0.55;
      const hit = sw.at(t, 180);
      b.stick(new THREE.CylinderGeometry(rs * 0.75, rs, 0.04, 7), CREAMF, hit, { embed: 0.3 });
      b.stick(new THREE.CylinderGeometry(rs * 0.45, rs * 0.45, 0.06, 7), SUCKIN, hit, { embed: 0.3 });
    }
    for (let k = 1; k <= nGlow; k++) {
      const t = 0.12 + (0.76 * k) / (nGlow + 1);
      glow(b.stick(new THREE.SphereGeometry(rad(t) * 0.35, 6, 4), ORANGEF, sw.at(t, 0), { embed: 0.3 }), 1);
    }
    for (const t of [0.15, 0.35]) {
      const p = ch.at(t);
      b.part(new THREE.TorusGeometry(rad(t) + 0.01, 0.05, 5, 10), ORANGEF, {
        at: p.at,
        dir: p.tangent,
        axis: "z",
        bone: p.bone,
      });
    }
    return ch;
  };

  const rs = [0.7, 1.7, 2.9, 4.0, 5.0, 5.7];
  const ys = [1.45, 1.2, 0.8, 0.42, 0.22, 0.1];
  const lat = [0, 0, 0.1, 0.4, 0.9, 1.4];
  const lens = [1, 0.92, 1.08, 0.95, 1.0, 0.9, 1.06, 0.96];
  "ABCDEFGH".split("").forEach((letter, i) => {
    const a = ((i * 45 + 22.5) * Math.PI) / 180;
    const s = i % 2 ? 1 : -1;
    const pts = rs.map((r, k) => {
      const rr = k === 0 ? r : r * lens[i];
      const l = lat[k] * s;
      return [Math.sin(a) * rr + Math.cos(a) * l, ys[k], Math.cos(a) * rr - Math.sin(a) * l];
    });
    arm(`arm${letter}`, pts, 0.42, 10, 6);
  });

  for (const s of [1, -1]) {
    const pts = [
      [s * 0.7, 2.1, 0.1],
      [s * 1.7, 2.7, 0.3],
      [s * 2.7, 3.7, 0.6],
      [s * 3.1, 4.8, 0.9],
      [s * 2.5, 5.7, 1.1],
      [s * 1.7, 5.9, 1.3],
    ];
    const ch = arm(s > 0 ? "feelerL" : "feelerR", pts, 0.3, 9, 5);
    glow(
      b.part(new THREE.SphereGeometry(0.18, 8, 6), ORANGEF, {
        bone: ch.joints[ch.joints.length - 1],
        at: pts[pts.length - 1],
        scale: [1, 1.6, 1],
      }),
      1.2,
    );
  }

  return b.root;
}
