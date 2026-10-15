import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { grain, mottle, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "A towering glacier-steel battle axe on a carved ice plinth: crescent blade with frozen edge crystals, glowing rune inlays, a crystal pick and a crystal-capped haft.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const GOLD = "#f2c14e";
const CYAN = "#7df3ff";
const ICE = cel("#a8ecff");
const ICE_DEEP = cel("#6fd2f7");
const STEEL = cel("#9fb4d6");
const NAVY = "#1b2c5c";
const SNOW = "#f4fcff";
const WOOD = cel(grain("#3a4a78", "#27315a", { size: 0.012 }));

export default function build() {
  const b = createBuilder({ name: "frostAxe" });
  b.joint("root", { at: [0, 0.5, 0] });
  const rand = rng(11);
  const HY = 0.95; // height of the axe head centre

  // ---------- plinth ----------
  const plinthPaint = cel(mottle("#9ad8f5", "#5fb0e8", { size: 0.08, seed: 3 }));
  b.lathe(
    [
      [0, 0],
      [0.26, 0],
      [0.27, 0.03],
      [0.24, 0.06],
      [0.2, 0.1],
      [0.12, 0.13],
      [0, 0.13],
    ],
    { at: [0, 0, 0], segments: 8, color: plinthPaint, name: "plinth" },
  );
  // glowing rune ring on the plinth top
  const ringPts: number[][] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    ringPts.push([0.16 * Math.cos(a), 0.118, 0.16 * Math.sin(a)]);
  }
  glow(b.sweep(catmull(ringPts, { closed: true }), 0.006, { color: CYAN, sides: 4 }), 1);
  // ice shards around the base
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rand() * 0.3;
    const base: number[] = [0.22 * Math.cos(a), 0.05, 0.22 * Math.sin(a)];
    const len = 0.14 + rand() * 0.16;
    b.spike(base, [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5], len, 0.03, {
      section: { ngon: 5 },
      color: i % 2 ? ICE : ICE_DEEP,
    });
  }
  // snow drifts
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    b.part(new THREE.SphereGeometry(0.05, 6, 4), SNOW, {
      at: [0.27 * Math.cos(a), 0.012, 0.27 * Math.sin(a)],
      scale: [1.2, 0.5, 1],
    });
  }

  // ---------- haft ----------
  b.rod([0, 0.1, 0], [0, 1.22, 0], 0.026, { color: WOOD, sides: 8, name: "haft" });
  for (let k = 0; k < 13; k++) {
    const y = 0.26 + k * 0.032;
    b.part(new THREE.CylinderGeometry(0.0295, 0.0295, 0.014, 8), k % 4 === 3 ? "#2f6fe0" : NAVY, { at: [0, y, 0] });
  }
  for (const y of [0.2, 0.7, 1.215]) {
    b.part(new THREE.CylinderGeometry(0.036, 0.036, y > 1 ? 0.05 : 0.03, 8), GOLD, { at: [0, y, 0] });
  }
  // pommel
  b.part(new THREE.CylinderGeometry(0.03, 0.042, 0.1, 8), STEEL, { at: [0, 0.16, 0] });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), GOLD, { at: [0, 0.11, 0] });

  // ---------- head mount ----------
  b.part(new THREE.BoxGeometry(0.1, 0.36, 0.07), STEEL, { at: [0, HY, 0], name: "mount" });
  for (const dy of [0.18, -0.18]) b.part(new THREE.BoxGeometry(0.115, 0.03, 0.085), GOLD, { at: [0, HY + dy, 0] });
  for (const sz of [1, -1]) {
    for (const sx of [1, -1])
      for (const dy of [0.11, -0.11])
        b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD, { at: [sx * 0.03, HY + dy, sz * 0.036] });
    glow(
      b.part(new THREE.OctahedronGeometry(0.032), CYAN, { at: [0, HY, sz * 0.045], scale: [1, 1.5, 0.7], flat: true }),
      1.4,
    );
  }

  // ---------- blade ----------
  const BLADE: OutlinePoint[] = [
    [0.03, 0.12, "sharp"],
    [0.1, 0.2],
    [0.22, 0.3],
    [0.36, 0.36, "sharp"],
    [0.46, 0.26],
    [0.53, 0.1],
    [0.55, -0.05],
    [0.52, -0.22],
    [0.44, -0.34],
    [0.34, -0.4, "sharp"],
    [0.24, -0.3],
    [0.12, -0.2],
    [0.03, -0.12, "sharp"],
  ];
  const outerPaint = cel(
    paint((p, n, s) => {
      void p;
      void n;
      const d = Math.hypot(s[0] - 0.1, s[1] * 0.95);
      if (d > 0.43) return "#f2fdff";
      if (d > 0.37) return "#a8ecff";
      return mottle("#5fb6f0", "#7cc8f7", { size: 0.1, seed: 5 });
    }),
  );
  b.extrude(BLADE, { at: [0, HY, 0], x: [1, 0, 0], thickness: 0.026, bevel: 0.008, smoothing: 1, color: outerPaint, name: "blade" });

  const k = 0.7;
  const cx = 0.26;
  const CORE: OutlinePoint[] = BLADE.map((pt): OutlinePoint =>
    pt.length === 3 ? [cx + (pt[0] - cx) * k, pt[1] * k, "sharp"] : [cx + (pt[0] - cx) * k, pt[1] * k],
  );
  const corePaint = cel(
    paint((_p, _n, s) => {
      const d = Math.hypot(s[0] - 0.26, s[1] * 0.9);
      if (Math.abs(d - 0.2) < 0.006) return "#bff4ff";
      return d < 0.12 ? "#2e6bd6" : "#1e4aa8";
    }),
  );
  b.extrude(CORE, { at: [0, HY, 0], x: [1, 0, 0], thickness: 0.036, bevel: 0.005, smoothing: 1, color: corePaint, name: "core" });

  // glowing rune inlays and engraved arcs, both faces
  const RUNE = svg(
    `<svg viewBox="0 0 100 160"><g fill="none" stroke="#7df3ff" stroke-width="4" stroke-linecap="round"><path d="M50 10 L50 150"/><path d="M50 40 L20 20 M50 40 L80 20"/><path d="M50 80 L18 55 M50 80 L82 55"/><path d="M50 120 L25 100 M50 120 L75 100"/><circle cx="50" cy="150" r="6"/></g><circle cx="50" cy="10" r="6" fill="#bff9ff"/></svg>`,
    { size: 256 },
  );
  for (const sz of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.14, 0.22), "#ffffff", {
        at: [0.17, HY, sz * 0.0205],
        dir: [0, 0, sz],
        axis: "z",
        texture: RUNE,
      }),
    );
    for (const r of [0.3, 0.36]) {
      const pts: number[][] = [];
      for (let i = 0; i <= 6; i++) {
        const a = ((-33 + (66 * i) / 6) * Math.PI) / 180;
        pts.push([r * Math.cos(a), HY + r * Math.sin(a), sz * 0.0205]);
      }
      glow(b.sweep(catmull(pts), 0.0045, { color: CYAN, sides: 4 }), 1);
    }
  }

  // frozen edge crystals
  const C: [number, number] = [0.1, 0];
  for (let i = 3; i <= 9; i++) {
    const pt = BLADE[i];
    const dx = pt[0] - C[0];
    const dy = pt[1] - C[1];
    const l = Math.hypot(dx, dy);
    const tip = i === 3 || i === 9;
    const len = (tip ? 0.1 : 0.05) + rand() * 0.04;
    b.spike([pt[0] - (dx / l) * 0.012, HY + pt[1] - (dy / l) * 0.012, 0], [dx / l, dy / l + (tip ? 0.2 * Math.sign(pt[1]) : 0), 0], len, 0.014, {
      section: { ngon: 4 },
      color: i % 2 ? SNOW : ICE,
    });
  }

  // ---------- crystal pick on the back ----------
  b.sweep(bezier([-0.03, HY, 0], [-0.15, HY - 0.01, 0], [-0.32, HY + 0.14, 0]), [0.045, 0], {
    section: { ngon: 4 },
    caps: { start: "flat", end: "point" },
    color: ICE,
    name: "pick",
  });
  b.spike([-0.03, HY - 0.08, 0], [-0.2, HY - 0.22, 0], null, 0.025, { section: { ngon: 4 }, color: ICE_DEEP });
  b.spike([-0.03, HY + 0.08, 0], [-0.17, HY + 0.2, 0], null, 0.02, { section: { ngon: 4 }, color: SNOW });

  // ---------- crown crystals ----------
  glow(b.spike([0, 1.24, 0], [0, 1, 0], 0.26, 0.04, { section: { ngon: 6 }, color: "#9be9ff" }), 0.9);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.5;
    b.spike([0.025 * Math.cos(a), 1.24, 0.025 * Math.sin(a)], [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5], 0.13 + rand() * 0.04, 0.024, {
      section: { ngon: 5 },
      color: "#6fd2f7",
    });
  }

  // ---------- pennant ----------
  const pennantPaint = cel(
    paint((_p, _n, s) => {
      if (s[1] > -0.025) return GOLD;
      if (Math.abs(s[0] - 0.035) < 0.006 && s[1] > -0.15) return CYAN;
      return "#2f6fe0";
    }),
  );
  b.extrude(
    [
      [0, 0],
      [0.07, 0],
      [0.07, -0.2],
      [0.035, -0.15],
      [0, -0.2],
    ],
    { at: [-0.07, HY - 0.2, 0.034], x: [1, 0, 0], thickness: 0.006, color: pennantPaint, name: "pennant" },
  );
  b.part(new THREE.SphereGeometry(0.016, 6, 4), GOLD, { at: [-0.035, HY - 0.2, 0.036] });

  return b.root;
}
