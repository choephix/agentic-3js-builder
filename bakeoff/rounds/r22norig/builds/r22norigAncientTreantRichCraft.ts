import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { cells, grain, mottle, noise, paint, spots } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Ancient Treant",
  description:
    "A towering walking tree guardian: cracked mossy bark body, oversized burl shoulders and root-fingered hands, glowing amber eyes and runes, bronze druid bands, leafy crown, mushrooms and a nest on its shoulder.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

const AMBER = "#ffb21f";
const BRONZE = "#c58a2e";
const CREAM = "#e8d7a8";
const DARK = "#1b0f08";

const leafSvg = (dark: string, mid: string, light: string, vein: string) =>
  svg(
    `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
<path d="M16 46 C3 34 2 14 16 1 C30 14 29 34 16 46Z" fill="${dark}"/>
<path d="M16 43 C7 33 6 16 16 5 C26 16 25 33 16 43Z" fill="${mid}"/>
<path d="M16 43 C20 35 26 30 25 18 C24 12 20 8 16 5 Z" fill="${light}"/>
<path d="M16 44 L16 8" stroke="${vein}" stroke-width="1.6" fill="none"/>
<path d="M16 34 L9 27 M16 26 L9 19 M16 34 L23 27 M16 26 L23 19 M16 18 L11 13 M16 18 L21 13" stroke="${vein}" stroke-width="1.3" fill="none"/>
</svg>`,
    { size: 96 },
  );

const MOSS_STRAND = svg(
  `<svg viewBox="0 0 16 48" xmlns="http://www.w3.org/2000/svg">
<path d="M8 0 C12 8 4 16 8 24 C11 32 6 40 8 47 C6 40 3 32 5 24 C7 16 2 8 8 0Z" fill="#2f7040"/>
<path d="M8 2 C11 9 5 16 8 24 C10 31 7 38 8 44 C9 37 10 30 9 24 C8 16 10 9 8 2Z" fill="#7fbf3a"/>
<circle cx="8" cy="46" r="1.8" fill="#a8d84a"/>
</svg>`,
  { size: 96 },
);

const RUNE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
<circle cx="32" cy="32" r="27" fill="none" stroke="#ff9a1a" stroke-width="4"/>
<circle cx="32" cy="32" r="21" fill="none" stroke="#ffd45a" stroke-width="2.4"/>
<path d="M32 11 L32 53 M19 24 L32 35 L45 24 M22 46 L32 37 L42 46 M32 11 L24 18 M32 11 L40 18" stroke="#ffd45a" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="32" cy="32" r="3.5" fill="#fff3b0"/>
</svg>`,
  { size: 192 },
);

const v3 = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "ancientTreant" });
  const R = rng(11);

  // ---------- palette & paints ----------
  const BARK_L = cel(
    grain("#80552f", "#6a4325", { size: 0.045, seed: 3 }),
    grain("#4d2f18", "#3d2412", { size: 0.045, seed: 3 }),
  );
  const MOSS_C = cel(
    mottle("#86c443", "#5ea02f", { size: 0.1, seed: 4 }),
    mottle("#3f8a45", "#2f7040", { size: 0.1, seed: 4 }),
  );
  const CRACK = cel("#2a170b", "#1d0f07");
  const MUD = "#3a2a1c";
  const bark = paint((p, n) => {
    if (p.y < 0.1) return MUD;
    const c = cells(p, 0.16, 2);
    if (c.d2 - c.d1 < 0.012) return CRACK;
    if (n.y > 0.5 && noise(p, 0.35, 9) > 0.45) return MOSS_C;
    return BARK_L;
  });
  const RIDGE = cel("#a06c3e", "#5c391d");
  const LEAF_C = cel(
    mottle("#4e9d2a", "#6fb830", { size: 0.2, seed: 6 }),
    mottle("#2c6c38", "#2f7a3a", { size: 0.2, seed: 6 }),
  );
  const CAPC = cel(spots("#d6402a", "#fff1d0", { size: 0.035, amount: 0.45, seed: 2 }));

  const leafA = leafSvg("#1f5a2a", "#4fa22b", "#8fd04a", "#23602c");
  const leafB = leafSvg("#3d6b1d", "#7ab82e", "#c6e660", "#2f5a1a");
  const leafC = leafSvg("#8a5a12", "#e0a820", "#ffe070", "#7a4a10");

  const leafFrames: ReturnType<typeof frame>[] = [];

  // ---------- helpers ----------
  function clump(c: THREE.Vector3, r: number, n: number) {
    for (let k = 0; k < 2; k++) {
      const o = new THREE.Vector3(R() - 0.5, R() - 0.3, R() - 0.5).multiplyScalar(r * 0.7);
      b.part(new THREE.IcosahedronGeometry(r * 0.7, 1), LEAF_C, { at: c.clone().add(o) });
    }
    for (let i = 0; i < n; i++) {
      const v = new THREE.Vector3(R() - 0.5, R() - 0.3, R() - 0.5).normalize();
      const pos = c.clone().addScaledVector(v, r * 0.85 * (0.6 + 0.4 * R()));
      leafFrames.push(frame(pos, v));
    }
  }

  function limbTree(pts: number[][], r: number, twigs: number, cr: number) {
    const path = catmull(pts);
    b.sweep(path, [r, r * 0.62, r * 0.3], { color: bark, caps: { start: "round", end: "point" }, sides: 7 });
    const tip = path.at(1);
    const td = path.tangentAt(1).clone();
    clump(tip.clone().addScaledVector(td, cr * 0.4), cr, 30);
    for (let i = 0; i < twigs; i++) {
      const t = 0.3 + (0.55 * (i + R() * 0.5)) / twigs;
      const base = path.at(t).clone();
      const tg = path.tangentAt(t).clone();
      const side = new THREE.Vector3(R() - 0.5, R() * 0.4, R() - 0.5).normalize();
      const d = tg.multiplyScalar(0.8).add(side).normalize();
      const end = base.clone().addScaledVector(d, 0.45 + R() * 0.4);
      b.rod(base, end, [r * 0.4, r * 0.15], bark);
      clump(end.clone().addScaledVector(d, 0.1), cr * 0.62, 16);
    }
  }

  function mushroom(at: number[], s: number, lean: number[] = [0, 1, 0]) {
    const base = v3(at);
    const dir = v3(lean).normalize();
    const top = base.clone().addScaledVector(dir, 0.1 * s);
    b.rod(base, top, [0.022 * s, 0.016 * s], CREAM);
    b.part(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), CAPC, {
      at: top,
      dir,
      axis: "y",
      scale: [0.065 * s, 0.045 * s, 0.065 * s],
    });
  }

  function band(center: THREE.Vector3, tangent: THREE.Vector3, rad: number) {
    b.part(new THREE.TorusGeometry(rad, 0.035, 5, 14), BRONZE, { at: center, dir: tangent, axis: "z" });
    b.part(new THREE.TorusGeometry(rad + 0.012, 0.014, 4, 14), "#e8b84a", {
      at: center.clone().addScaledVector(tangent, 0.05),
      dir: tangent,
      axis: "z",
    });
  }

  // ---------- torso ----------
  const torsoPath = catmull([
    [0, 1.7, 0],
    [0, 2.4, 0.04],
    [0, 3.1, 0.15],
  ]);
  const rx = (t: number) => 0.52 + 0.3 * Math.pow(t, 0.8);
  const ry = (t: number) => 0.42 + 0.18 * t;
  const torso = b.sweep(torsoPath, (t: number): [number, number] => [rx(t), ry(t)], {
    color: bark,
    sides: 10,
    caps: { start: "round", end: "round" },
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), bark, { at: [0, 1.85, 0], scale: [0.72, 0.45, 0.52] });

  // bark ridges on the flanks and back
  for (let a = 0.85; a < 5.5; a += 0.55) {
    const pts: number[][] = [];
    for (let t = 0.05; t <= 0.96; t += 0.15) {
      const c = torsoPath.at(t);
      const w = (R() - 0.5) * 0.04;
      pts.push([c.x + rx(t) * 1.0 * Math.sin(a) + w, c.y, c.z + ry(t) * Math.cos(a)]);
    }
    b.sweep(catmull(pts), [0.07, 0.05, 0.06, 0.04], { color: RIDGE, sides: 5, caps: "point" });
  }
  // spine root spikes
  for (let t = 0.25; t < 0.95; t += 0.14) {
    const c = torsoPath.at(t);
    b.spike([c.x + (R() - 0.5) * 0.1, c.y, c.z - ry(t) + 0.05], [0, 0.5, -1], 0.3 + R() * 0.12, 0.1, bark);
  }
  // chest rune
  glow(b.decal(torso, RUNE, { at: [0, 2.75, 0.7], dir: [0, 0, 1], size: [0.55, 0.55] }), 1.4);

  // vine wrapped round the torso
  {
    const pts: number[][] = [];
    for (let k = 0; k <= 16; k++) {
      const t = 0.08 + (0.85 * k) / 16;
      const c = torsoPath.at(t);
      const a = -2.2 + k * 0.45;
      pts.push([c.x + (rx(t) + 0.03) * Math.sin(a), c.y, c.z + (ry(t) + 0.03) * Math.cos(a)]);
    }
    const vine = catmull(pts);
    b.sweep(vine, 0.04, { color: "#4f8f2c", sides: 5 });
    const vf: ReturnType<typeof frame>[] = [];
    for (let k = 0; k < 18; k++) {
      const p = vine.at(k / 18);
      vf.push(frame(p, [p.x, 0.4, p.z - 0.1]));
    }
    b.cards(vf, [leafA, leafB], { size: [0.12, 0.16], lean: 40, vary: 0.3, spin: 180, rng: R });
  }

  // belt of bronze with medallion
  {
    const c = torsoPath.at(0.3);
    const pts: number[][] = [];
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      pts.push([c.x + (rx(0.3) + 0.03) * Math.sin(a), 2.05, c.z + (ry(0.3) + 0.03) * Math.cos(a)]);
    }
    b.sweep(catmull(pts, { closed: true }), 0.06, { color: "#8a5a22", sides: 6 });
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 10), BRONZE, {
      at: [0, 2.05, c.z + ry(0.3) + 0.07],
      dir: [0, 0, 1],
      axis: "y",
    });
    glow(b.part(new THREE.SphereGeometry(0.06, 7, 5), "#7dff6a", { at: [0, 2.05, c.z + ry(0.3) + 0.11] }), 1.4);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.014, 5, 4), "#f0cc6a", {
        at: [Math.sin(a) * 0.1, 2.05 + Math.cos(a) * 0.1, c.z + ry(0.3) + 0.1],
      });
    }
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const legPts = [
      [s * 0.45, 1.9, 0],
      [s * 0.55, 1.1, 0.2],
      [s * 0.55, 0.35, 0.3],
    ];
    const leg = catmull(legPts);
    b.sweep(leg, [0.38, 0.3, 0.27], { color: bark, sides: 9, caps: { start: "round", end: "none" } });
    b.part(new THREE.SphereGeometry(1, 9, 7), bark, { at: [s * 0.55, 1.1, 0.4], scale: [0.3, 0.28, 0.2] });
    b.part(new THREE.SphereGeometry(1, 9, 7), MOSS_C, { at: [s * 0.55, 1.35, 0.3], scale: [0.26, 0.1, 0.24] });
    b.part(new THREE.SphereGeometry(1, 10, 8), bark, { at: [s * 0.55, 0.2, 0.35], scale: [0.36, 0.2, 0.4] });
    band(leg.at(0.82), leg.tangentAt(0.82), 0.3);
    for (let i = 0; i < 4; i++) {
      const dx = (i - 1.5) * 0.2;
      const tip: number[] = [s * 0.55 + dx * 1.5, 0.07, 0.98];
      b.rod([s * 0.55 + dx, 0.12, 0.5], tip, [0.12, 0.05], bark, { caps: "point" });
      b.spike(tip, [0, -0.1, 1], 0.12, 0.04, CREAM);
    }
    // rear heel root
    b.spike([s * 0.55, 0.2, 0.0], [0, -0.1, -1], 0.35, 0.12, bark);
    mushroom([s * 0.9, 0.5, 0.25], 1.2, [s * 0.8, 0.6, 0]);
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const arm = catmull([
      [s * 0.8, 3.0, 0.0],
      [s * 1.3, 2.3, 0.25],
      [s * 1.45, 1.5, 0.5],
      [s * 1.4, 1.15, 0.7],
    ]);
    b.sweep(arm, [0.32, 0.3, 0.25, 0.2], { color: bark, sides: 9, caps: { start: "round", end: "round" } });
    // pauldron burl
    b.part(new THREE.SphereGeometry(1, 10, 8), bark, { at: [s * 0.95, 3.1, 0], scale: [0.5, 0.4, 0.45] });
    b.part(new THREE.SphereGeometry(1, 9, 7), MOSS_C, { at: [s * 0.95, 3.4, 0], scale: [0.42, 0.14, 0.38] });
    for (let k = 0; k < 4; k++) {
      const a = -0.4 + k * 0.5;
      b.spike([s * (0.95 + 0.38 * Math.sin(a + 1.2)), 3.25, 0.35 * Math.cos(a + 1.2)], [s * 0.7, 0.8, 0.3 * Math.cos(a)], 0.34, 0.09, bark);
    }
    glow(b.decal(b.surface(b.root), RUNE, { at: [s * 1.43, 3.12, 0.05], dir: [s, 0, 0], size: [0.28, 0.28] }), 1.3);
    // elbow burl
    b.part(new THREE.SphereGeometry(1, 9, 7), bark, { at: [s * 1.38, 2.3, 0.2], scale: [0.3, 0.3, 0.3] });
    b.spike([s * 1.55, 2.3, 0.1], [s * 1, 0.1, -0.5], 0.3, 0.09, bark);
    band(arm.at(0.9), arm.tangentAt(0.9), 0.25);
    band(arm.at(0.3), arm.tangentAt(0.3), 0.37);
    // palm and fingers
    b.part(new THREE.SphereGeometry(1, 9, 7), bark, { at: [s * 1.4, 1.0, 0.78], scale: [0.27, 0.2, 0.28] });
    for (let i = 0; i < 4; i++) {
      const o = i - 1.5;
      const x0 = s * (1.36 + o * 0.11);
      const pts = [
        [x0, 1.02, 0.86],
        [x0 + s * o * 0.03, 0.88, 1.1],
        [x0 + s * o * 0.06, 0.62, 1.24],
        [x0 + s * o * 0.08, 0.42, 1.2],
      ];
      b.sweep(catmull(pts), [0.09, 0.065, 0.03], { color: bark, sides: 6, caps: { start: "round", end: "point" } });
      b.spike(pts[3], [0, -0.7, -0.2], 0.1, 0.03, CREAM);
    }
    b.sweep(
      catmull([
        [s * 1.2, 1.1, 0.8],
        [s * 1.1, 0.95, 1.0],
        [s * 1.05, 0.78, 1.1],
      ]),
      [0.09, 0.065, 0.03],
      { color: bark, sides: 6, caps: { start: "round", end: "point" } },
    );
    // forearm twig
    limbTree(
      [
        [s * 1.5, 1.9, 0.4],
        [s * 1.8, 2.3, 0.35],
        [s * 2.0, 2.8, 0.3],
      ],
      0.1,
      2,
      0.4,
    );
    mushroom([s * 1.2, 3.45, 0.2], 1.6, [s * 0.3, 1, 0]);
    mushroom([s * 1.05, 3.5, -0.15], 1.1, [s * 0.1, 1, -0.2]);
  }

  // nest on the right (-x) shoulder
  b.part(new THREE.TorusGeometry(0.2, 0.06, 5, 10), "#8a6a32", { at: [-0.8, 3.58, 0.05], rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 8), "#6a4a22", { at: [-0.8, 3.52, 0.05] });
  for (let k = 0; k < 3; k++) {
    b.part(new THREE.SphereGeometry(0.06, 7, 5), "#9fd8d0", {
      at: [-0.8 + Math.cos(k * 2.1) * 0.07, 3.62, 0.05 + Math.sin(k * 2.1) * 0.07],
      scale: [1, 1.3, 1],
    });
  }

  // ---------- head ----------
  const HY = 3.55;
  const HZ = 0.6;
  const head = b.part(new THREE.SphereGeometry(1, 12, 9), bark, { at: [0, HY, HZ], scale: [0.42, 0.46, 0.4] });
  b.part(new THREE.SphereGeometry(1, 9, 7), bark, { at: [0, HY - 0.32, HZ + 0.12], scale: [0.26, 0.16, 0.22] });
  b.spike([0, HY, HZ + 0.37], [0, -0.35, 1], 0.2, 0.09, bark);
  b.sweep(
    catmull([
      [-0.3, HY - 0.2, HZ + 0.19],
      [-0.18, HY - 0.25, HZ + 0.28],
      [0, HY - 0.27, HZ + 0.335],
      [0.18, HY - 0.25, HZ + 0.28],
      [0.3, HY - 0.2, HZ + 0.19],
    ]),
    0.03,
    { color: DARK, sides: 5 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), INK, { at: [s * 0.17, HY + 0.06, HZ + 0.34], scale: [0.1, 0.085, 0.06] });
    glow(b.part(new THREE.SphereGeometry(0.055, 7, 5), AMBER, { at: [s * 0.17, HY + 0.06, HZ + 0.385] }), 1.8);
    glow(b.part(new THREE.SphereGeometry(0.025, 5, 4), "#fff3b0", { at: [s * 0.17, HY + 0.06, HZ + 0.425] }), 1.8);
    b.rod([s * 0.36, HY + 0.2, HZ + 0.2], [s * 0.05, HY + 0.12, HZ + 0.38], [0.065, 0.05], bark);
    b.part(new THREE.SphereGeometry(1, 7, 5), bark, { at: [s * 0.3, HY - 0.08, HZ + 0.18], scale: [0.11, 0.1, 0.1] });
    b.spike([s * 0.12, HY - 0.28, HZ + 0.31], [0, 1, 0.5], 0.1, 0.03, CREAM);
    // ear-like fungus shelf
    b.part(new THREE.SphereGeometry(1, 8, 5, 0, Math.PI, 0, Math.PI), "#b8683a", {
      at: [s * 0.42, HY + 0.02, HZ - 0.02],
      scale: [0.12, 0.2, 0.2],
      dir: [s, 0, 0],
      axis: "z",
    });
    // head antlers / crown branches
    limbTree(
      [
        [s * 0.2, HY + 0.38, HZ - 0.05],
        [s * 0.45, HY + 0.9, HZ - 0.1],
        [s * 0.7, HY + 1.4, HZ - 0.15],
      ],
      0.1,
      3,
      0.5,
    );
    // shoulder branches
    limbTree(
      [
        [s * 0.95, 3.3, -0.1],
        [s * 1.5, 4.0, -0.2],
        [s * 1.9, 4.6, 0],
      ],
      0.16,
      3,
      0.55,
    );
  }
  // brow-line decal-free: moss on top of head
  b.part(new THREE.SphereGeometry(1, 9, 7), MOSS_C, { at: [0, HY + 0.38, HZ - 0.05], scale: [0.34, 0.12, 0.32] });
  // back crown
  limbTree(
    [
      [0, 3.2, -0.3],
      [0.1, 3.9, -0.6],
      [0.15, 4.5, -0.5],
      [0, 5.0, -0.3],
    ],
    0.22,
    4,
    0.65,
  );
  limbTree(
    [
      [-0.2, 3.3, -0.3],
      [-0.6, 3.9, -0.7],
      [-0.9, 4.4, -0.6],
    ],
    0.14,
    2,
    0.5,
  );
  limbTree(
    [
      [0.2, 3.3, -0.3],
      [0.6, 3.9, -0.7],
      [0.8, 4.3, -0.65],
    ],
    0.14,
    2,
    0.5,
  );

  // hanging moss: beard, shoulders, elbows, belt
  {
    const mf: ReturnType<typeof frame>[] = [];
    for (let k = 0; k < 9; k++) {
      const x = -0.26 + k * 0.065;
      mf.push(frame([x, HY - 0.36, HZ + 0.2 + 0.12 * Math.cos(x * 4)], [0, 1, 0]));
    }
    for (const s of [1, -1]) {
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * Math.PI * 2;
        mf.push(frame([s * (0.95 + 0.42 * Math.cos(a)), 2.95, 0.4 * Math.sin(a)], [0, 1, 0]));
      }
      for (let k = 0; k < 4; k++) mf.push(frame([s * (1.3 + k * 0.05), 2.1, 0.3 + k * 0.05], [0, 1, 0]));
    }
    b.cards(mf, MOSS_STRAND, { size: [0.12, 0.42], lean: 180, flow: [0, 0, 1], vary: 0.35, rng: R });
  }

  // leaf cards for every canopy clump
  b.cards(leafFrames, [leafA, leafA, leafB, leafB, leafC], {
    size: [0.3, 0.36],
    lean: 35,
    bend: 20,
    vary: 0.3,
    spin: 180,
    rng: R,
  });

  void head;
  return b.root;
}
