import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull, polyline, spiral } from "../../../../src/path";
import { gradient, grain, mottle, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "A frost-forged battle axe on an icy plinth: crescent blade with glowing rune, gold fittings, wrapped haft, crystal finial.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const NAVY = "#223a78";
const BLUE = "#3f74c8";
const ICE = "#b6ecff";
const WHITE = "#f4fcff";
const CYAN = "#4de6ff";
const GOLD = "#e8b84a";
const LEATHER = "#3b2a45";
const LEATHER2 = "#5b3f66";

const S = 0.8; // blade scale
const HY = 0.78; // blade origin height

export default function build() {
  const b = createBuilder({ name: "frostAxe" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const r = rng(11);

  const crystal = (at: number[], dir: number[], len: number, rad: number, color: string, g = 0) => {
    const geo = new THREE.ConeGeometry(rad, len, 5, 1);
    geo.translate(0, len / 2, 0);
    const p = b.part(geo, color, { at, dir, flat: true });
    if (g) glow(p, g);
    return p;
  };

  // ---------- plinth ----------
  b.lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.36, 0.03],
      [0.32, 0.1],
      [0.27, 0.12],
      [0, 0.12],
    ],
    { at: [0, 0, 0], segments: 8, color: cel(mottle("#5b80b8", "#dff4ff", { size: 0.12, seed: 3 })) },
  );
  b.lathe(
    [
      [0.2, 0],
      [0.3, 0],
      [0.3, 0.012],
      [0.2, 0.012],
    ],
    { at: [0, 0.12, 0], segments: 8, color: GOLD },
  );
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.055, 0.04],
      [0.042, 0.05],
      [0, 0.05],
    ],
    { at: [0, 0.12, 0], segments: 8, color: cel(NAVY) },
  );
  const shardCount = 10;
  for (let i = 0; i < shardCount; i++) {
    const a = (i / shardCount) * Math.PI * 2;
    const rad = 0.2 + 0.08 * r();
    const len = 0.12 + 0.22 * r();
    crystal(
      [Math.sin(a) * rad, 0.1, Math.cos(a) * rad],
      [Math.sin(a) * 0.4, 1, Math.cos(a) * 0.4],
      len,
      0.035 + 0.02 * r(),
      i % 3 === 0 ? CYAN : i % 3 === 1 ? ICE : WHITE,
      i % 3 === 0 ? 0.8 : 0,
    );
  }
  for (let i = 0; i < 6; i++) {
    const a = r() * Math.PI * 2;
    const rad = 0.12 + 0.18 * r();
    b.part(new THREE.SphereGeometry(0.04 + 0.03 * r(), 6, 4), WHITE, {
      at: [Math.sin(a) * rad, 0.12, Math.cos(a) * rad],
      scale: [1, 0.45, 1],
    });
  }

  // ---------- haft ----------
  const leatherPaint = cel(stripes(LEATHER, LEATHER2, { size: 0.03, axis: "y", width: 0.5, wobble: 0.2 }));
  const steelPaint = cel(grain(NAVY, BLUE, { size: 0.02, axis: "y" }));
  b.sweep(
    [
      [0, 0.1, 0],
      [0, 1.42, 0],
    ],
    0.028,
    {
      sides: 8,
      caps: "flat",
      bands: [
        [0.03, cel(NAVY)],
        [0.45, leatherPaint],
        [1, steelPaint],
      ],
    },
  );
  const collar = (y: number, rad: number, color: string) =>
    b.lathe(
      [
        [0, 0],
        [rad, 0],
        [rad + 0.008, 0.008],
        [rad + 0.008, 0.026],
        [rad, 0.034],
        [0, 0.034],
      ],
      { at: [0, y, 0], segments: 8, color },
    );
  collar(0.14, 0.04, GOLD);
  collar(0.44, 0.04, GOLD);
  collar(0.68, 0.042, GOLD);
  collar(1.36, 0.045, GOLD);
  collar(HY - 0.1, 0.058, GOLD);
  collar(HY + 0.36, 0.058, GOLD);
  // cloth wrap spiralling up the grip
  b.sweep(spiral([0, 0.25, 0], [0.032, 0.25, 0], [0, 1, 0], { turns: 6, r1: 0.032, pitch: 0.07 }), 0.007, CYAN, {
    sides: 5,
  });
  // grip bumps
  for (let i = 0; i < 6; i++)
    b.part(new THREE.SphereGeometry(0.016, 6, 4), GOLD, { at: [0, 0.2 + i * 0.045, 0.03], scale: [1, 1, 0.5] });

  // ---------- head ----------
  b.part(new THREE.BoxGeometry(0.085, 0.42, 0.095), cel(NAVY), { at: [0, HY + 0.13, 0] });
  b.part(new THREE.BoxGeometry(0.095, 0.03, 0.105), GOLD, { at: [0, HY + 0.3, 0] });
  b.part(new THREE.BoxGeometry(0.095, 0.03, 0.105), GOLD, { at: [0, HY - 0.02, 0] });

  const P = (u: number, v: number) => [0, HY + v * S, u * S];
  const base: OutlinePoint[] = [
    [0.04, -0.05],
    [0.18, -0.2],
    [0.36, -0.34, "sharp"],
    [0.47, -0.1],
    [0.49, 0.15],
    [0.46, 0.4],
    [0.4, 0.64, "sharp"],
    [0.22, 0.5],
    [0.04, 0.42],
  ];
  const outer = base.map((p): OutlinePoint => (p[2] ? [p[0] * S, p[1] * S, "sharp"] : [p[0] * S, p[1] * S]));
  const cx = 0.27;
  const cy = 0.17;
  const inner = base.map((p): OutlinePoint => {
    const x = (cx + (p[0] - cx) * 0.68) * S;
    const y = (cy + (p[1] - cy) * 0.68) * S;
    return p[2] ? [x, y, "sharp"] : [x, y];
  });
  b.extrude(outer, {
    at: [0, HY, 0],
    x: [0, 0, 1],
    thickness: 0.03,
    bevel: 0.006,
    smoothing: 1,
    color: cel(gradient(NAVY, "#7fb8f0", [0, 0, 0.08], [0, 0, 0.4])),
  });
  b.extrude(inner, {
    at: [0, HY, 0],
    x: [0, 0, 1],
    thickness: 0.038,
    bevel: 0.005,
    smoothing: 1,
    color: cel(gradient("#5d95dd", WHITE, [0, 0, 0.1], [0, 0, 0.38])),
  });
  // glowing cutting edge
  glow(
    b.sweep(catmull([P(0.36, -0.34), P(0.47, -0.1), P(0.49, 0.15), P(0.46, 0.4), P(0.4, 0.64)]), 0.008, WHITE, {
      sides: 5,
      caps: "point",
    }),
    1,
  );
  // rune on both faces
  const RUNE = svg(
    `<svg viewBox="0 0 64 96">
      <g fill="none" stroke="#7df3ff" stroke-linecap="round" stroke-linejoin="round" stroke-width="3">
        <path d="M56 86 Q63 48 52 8"/>
        <path d="M46 78 Q52 48 44 18"/>
        <path d="M26 30 V66 M12 38 L40 58 M12 58 L40 38"/>
        <path d="M20 26 L26 20 L32 26 M20 70 L26 76 L32 70"/>
      </g>
      <circle cx="26" cy="48" r="4" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.24, 0.36), "#ffffff", {
        at: [s * 0.0215, HY + 0.12, 0.2],
        dir: [s, 0, 0],
        axis: "z",
        up: [0, 1, 0],
        texture: RUNE,
      }),
      1.2,
    );
    glow(b.part(new THREE.OctahedronGeometry(0.03), CYAN, { at: [s * 0.045, HY + 0.13, 0], scale: [0.6, 1.3, 1] }), 1.2);
    // hanging ribbon
    b.extrude(
      [
        [-0.035, 0],
        [0.035, 0],
        [0.03, -0.22],
        [0, -0.16],
        [-0.03, -0.24],
      ],
      {
        at: [s * 0.052, HY - 0.04, 0],
        x: [0, 0, 1],
        thickness: 0.008,
        color: cel(gradient(CYAN, NAVY, [0, HY - 0.04, 0], [0, HY - 0.28, 0])),
      },
    );
    b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { at: [s * 0.052, HY - 0.035, 0] });
  }

  // rivets on the head box
  const rivets: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++)
      rivets.push(new THREE.SphereGeometry(0.01, 6, 4).translate(s * 0.043, HY + 0.05 + i * 0.065, 0.03));
  b.part(mergeGeometries(rivets)!, GOLD, { bone: root, at: [0, 0, 0] });

  // back spike (beard)
  b.sweep(catmull([[0, HY + 0.17, -0.04], [0, HY + 0.2, -0.2], [0, HY + 0.12, -0.34]]), [0.045, 0], cel(NAVY), {
    sides: 5,
    caps: { start: "flat", end: "point" },
  });
  b.sweep(polyline([[0, HY + 0.17, -0.1], [0, HY + 0.18, -0.26]]), [0.02, 0], WHITE, {
    sides: 5,
    caps: { start: "flat", end: "point" },
  });

  // crystals sprouting from the back of the head and the finial
  crystal([0, HY + 0.3, -0.04], [0, 0.7, -1], 0.2, 0.035, CYAN, 0.9);
  crystal([0, HY + 0.24, -0.04], [0, 0.2, -1], 0.14, 0.028, ICE);
  crystal([0, HY + 0.05, -0.04], [0, -0.4, -1], 0.12, 0.026, ICE);
  b.spike([0, 1.4, 0], [0, 1, 0], 0.22, 0.034, cel(BLUE));
  crystal([0, 1.4, 0], [0.3, 1, 0], 0.17, 0.028, CYAN, 0.9);
  crystal([0, 1.4, 0], [-0.3, 1, 0.1], 0.14, 0.026, ICE);
  crystal([0, 1.4, 0], [0, 1, -0.35], 0.12, 0.024, WHITE);
  // pommel nub
  b.part(new THREE.SphereGeometry(0.03, 6, 4), GOLD, { at: [0, 0.2, 0], scale: [1, 0.5, 1] });

  return b.root;
}
