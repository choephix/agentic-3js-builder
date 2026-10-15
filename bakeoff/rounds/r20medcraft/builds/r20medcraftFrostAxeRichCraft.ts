import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { cells, gradient, grain, mix, paint, patches, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "A towering crescent war axe of glacial steel with a glowing rune-inlaid blade, gold-trimmed socket, ice-crystal fluke, frost-rimed haft and an icy plinth, in a saturated high-contrast League of Legends look.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const GOLD = "#f0b93c";
const GOLD_DK = "#a8721c";
const ICE = "#9ee8ff";
const ICE_DK = "#3f9be0";
const SNOW = "#f2fbff";
const CYAN = "#4fe6ff";
const LEATHER = "#3a2a4e";
const LEATHER_LT = "#5b4478";
const DEEP = "#1b2a5a";

const HY = 1.0; // head centre height

// A bright cyan frost-rune drawing for the blade faces; 1 unit = 1 cm, origin at plane's lower left (x 0.08, y -0.4).
const RUNES = svg(
  `<svg viewBox="0 0 60 80">
    <g fill="none" stroke="#6ff0ff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M43 13 Q55 40 43 67"/>
      <path d="M36 17 Q47 40 36 63" stroke="#c9fbff" stroke-width="1"/>
      <g transform="translate(26 40)">
        <path d="M0 -14 L0 14 M-12.1 -7 L12.1 7 M-12.1 7 L12.1 -7"/>
        <path d="M0 -9 L-3 -12 M0 -9 L3 -12 M0 9 L-3 12 M0 9 L3 12"/>
        <path d="M-7.8 -4.5 L-8 -9 M-7.8 -4.5 L-12 -4 M7.8 4.5 L8 9 M7.8 4.5 L12 4"/>
        <path d="M-7.8 4.5 L-12 4 M-7.8 4.5 L-8 9 M7.8 -4.5 L12 -4 M7.8 -4.5 L8 -9"/>
        <circle r="3" fill="#e8ffff" stroke="none"/>
      </g>
      <path d="M12 22 L16 18 M12 58 L16 62 M30 12 L30 16 M30 64 L30 68" stroke-width="1.4"/>
    </g>
  </svg>`,
  { size: 480 },
);

export default function build() {
  const b = createBuilder({ name: "frostAxe" });
  b.joint("root", { at: [0, 0.05, 0] });
  const rand = rng(11);

  // ---- helpers -------------------------------------------------------------------------------------------
  const shard = (at: number[], dir: number[], len: number, r: number, color: string, lit = 0) => {
    const d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
    const c = new THREE.Vector3(at[0], at[1], at[2]).addScaledVector(d, len / 2 - 0.01);
    const p = b.part(new THREE.ConeGeometry(r, len, 5, 1), color, { at: c, dir: d, flat: true });
    if (lit > 0) glow(p, lit);
    return p;
  };
  const band = (y: number, r: number, tube: number, color: string) =>
    b.part(new THREE.TorusGeometry(r, tube, 5, 12), color, { at: [0, y, 0], dir: [0, 1, 0], axis: "z" });

  // ---- plinth: stepped, frosted stone --------------------------------------------------------------------
  const stone = patches("#33426a", ["#41547f", "#4c6190", "#3a4b76"], { size: 0.12, gap: 0.08, seed: 4 });
  const plinthPaint = paint((_p, n) => (n.y > 0.7 ? SNOW : stone));
  b.lathe(
    [
      [0, -0.01],
      [0.42, -0.01],
      [0.42, 0.04],
      [0.34, 0.065],
      [0.34, 0.1],
      [0.28, 0.13],
      [0, 0.13],
    ] as OutlinePoint[],
    { at: [0, 0, 0], segments: 8, color: plinthPaint, name: "plinth" },
  );
  // Gold-edged rune ring on the lower step
  b.part(new THREE.TorusGeometry(0.385, 0.008, 4, 8), GOLD, { at: [0, 0.058, 0], dir: [0, 1, 0], axis: "z", rotation: [90, 22, 0] });
  // Snow mounds
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.3;
    b.part(new THREE.SphereGeometry(1, 6, 4), SNOW, {
      at: [Math.cos(a) * 0.2, 0.13, Math.sin(a) * 0.2],
      scale: [0.06 + rand() * 0.04, 0.025, 0.05 + rand() * 0.03],
      flat: true,
    });
  }
  // Icicle crown around the lower step
  for (let k = 0; k < 11; k++) {
    const a = (k / 11) * Math.PI * 2 + rand() * 0.2;
    const r = 0.375;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const len = 0.1 + rand() * 0.14;
    shard([x, 0.06, z], [Math.cos(a) * 0.25, 1, Math.sin(a) * 0.25], len, 0.025 + rand() * 0.01, k % 3 === 0 ? CYAN : ICE, k % 3 === 0 ? 0.6 : 0);
  }
  // Frost crystals clustered at the haft base
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    shard([Math.cos(a) * 0.07, 0.12, Math.sin(a) * 0.07], [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5], 0.12 + (k % 2) * 0.06, 0.025, k % 2 ? CYAN : ICE, k % 2 ? 0.8 : 0);
  }

  // ---- haft ----------------------------------------------------------------------------------------------
  const wood = gradient(
    grain("#262a52", "#454d80", { size: 0.012, axis: "y", seed: 2 }),
    "#d5f4ff",
    [0, 1.05, 0],
    [0, 1.3, 0],
  );
  b.rod([0, 0.1, 0], [0, 1.3, 0], 0.03, { color: cel(wood), sides: 8, name: "haft" });
  // Leather grip with diagonal wrap
  const wrap = paint((_p, _n, s) => (((s[1] / 45 + s[0] * 26) % 1 + 1) % 1 < 0.5 ? LEATHER : LEATHER_LT));
  b.rod([0, 0.3, 0], [0, 0.78, 0], 0.036, { color: wrap, sides: 8, name: "grip" });
  for (const y of [0.3, 0.78]) {
    band(y, 0.04, 0.008, GOLD);
  }
  band(0.22, 0.036, 0.007, GOLD_DK);
  band(0.84, 0.036, 0.007, GOLD_DK);
  // Gold pommel stud ring at the base
  band(0.15, 0.037, 0.009, GOLD);
  // Frost rime crystals on the haft
  for (const [y, a, l] of [[0.9, 0.5, 0.07], [0.62, 3.6, 0.0], [0.5, 1.2, 0.0], [0.95, 4.4, 0.06], [1.18, 2.0, 0.07]] as Array<[number, number, number]>) {
    if (l === 0) continue;
    shard([Math.cos(a) * 0.028, y, Math.sin(a) * 0.028], [Math.cos(a), 0.6, Math.sin(a)], l, 0.012, ICE);
  }

  // ---- socket / head mount -------------------------------------------------------------------------------
  b.lathe(
    [
      [0, -0.15],
      [0.055, -0.15],
      [0.078, -0.11],
      [0.066, -0.07],
      [0.066, 0.07],
      [0.078, 0.11],
      [0.055, 0.15],
      [0, 0.15],
    ] as OutlinePoint[],
    { at: [0, HY, 0], segments: 8, color: cel(mix(DEEP, "#2f4f9a", 0.4)), name: "socket" },
  );
  for (const dy of [-0.14, -0.085, 0.085, 0.14]) band(HY + dy, 0.07, 0.01, GOLD);
  // Gold flared cap above head and spike
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.06, 0.03],
      [0.04, 0.06],
      [0.03, 0.09],
      [0, 0.09],
    ] as OutlinePoint[],
    { at: [0, 1.22, 0], segments: 8, color: cel(GOLD), name: "cap" },
  );
  band(1.22, 0.058, 0.009, GOLD_DK);
  b.spike([0, 1.3, 0], [0, 1, 0], 0.3, 0.032, { color: ICE, sides: 6, smooth: false, name: "topSpike" });
  glow(b.part(new THREE.ConeGeometry(0.014, 0.18, 5), "#d8ffff", { at: [0, 1.4, 0], dir: [0, 1, 0], flat: true }), 0.9);
  for (const a of [0, 1.6, 3.2, 4.8]) {
    shard([Math.cos(a) * 0.025, 1.3, Math.sin(a) * 0.025], [Math.cos(a) * 0.7, 1, Math.sin(a) * 0.7], 0.12, 0.016, ICE_DK);
  }

  // ---- main blade ----------------------------------------------------------------------------------------
  const bladeOutline: OutlinePoint[] = [
    [0.06, 0.1],
    [0.18, 0.2],
    [0.32, 0.3],
    [0.5, 0.4, "sharp"],
    [0.62, 0.22],
    [0.67, 0],
    [0.62, -0.24],
    [0.46, -0.42, "sharp"],
    [0.34, -0.28],
    [0.18, -0.17],
    [0.06, -0.1],
  ];
  const bladePaint = cel(
    paint((p, n, s) => {
      if (Math.abs(n.z) < 0.5) return "#f4ffff";
      const r = Math.hypot((s[0] - 0.04) / 0.64, s[1] / 0.44);
      if (r > 0.92) return "#f4ffff";
      const base = mix("#2a5cc0", "#8fe0ff", smoothstep(0.35, 0.9, r));
      const c = cells(p, 0.09, 3);
      if (c.d2 - c.d1 < 0.07 && r > 0.3) return mix(base, "#ffffff", 0.55);
      return base;
    }),
  );
  b.extrude(bladeOutline, {
    at: [0, HY, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.04,
    bevel: 0.012,
    smoothing: 1,
    color: bladePaint,
    name: "blade",
  });
  // Gold root plate sandwiching the blade
  const plate: OutlinePoint[] = [
    [0.0, 0.14],
    [0.1, 0.15],
    [0.22, 0.16],
    [0.22, -0.16],
    [0.1, -0.15],
    [0.0, -0.14],
  ];
  b.extrude(plate, { at: [0, HY, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.06, bevel: 0.01, smoothing: 1, color: cel(GOLD), name: "rootPlate" });
  for (const z of [0.032, -0.032])
    for (const [x, y] of [[0.1, 0.1], [0.1, -0.1], [0.19, 0.1], [0.19, -0.1], [0.145, 0]]) {
      b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD_DK, { at: [x, HY + y, z], flat: true });
    }
  // Rune inlays, both faces
  glow(
    b.part(new THREE.PlaneGeometry(0.6, 0.8), "#ffffff", { at: [0.38, HY, 0.0235], dir: [0, 0, 1], axis: "z", texture: RUNES, name: "runesFront" }),
    1.1,
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.6, 0.8), "#ffffff", { at: [0.38, HY, -0.0235], dir: [0, 0, -1], axis: "z", texture: RUNES, name: "runesBack" }),
    1.1,
  );
  // Icicles hanging and rising along the blade's inner edges
  shard([0.4, HY - 0.35, 0], [0.1, -1, 0], 0.13, 0.026, ICE);
  shard([0.3, HY - 0.25, 0], [0, -1, 0], 0.1, 0.022, CYAN, 0.7);
  shard([0.2, HY - 0.18, 0], [-0.1, -1, 0], 0.08, 0.018, ICE);
  shard([0.25, HY + 0.25, 0], [0, 1, 0], 0.12, 0.024, ICE);
  shard([0.35, HY + 0.31, 0], [0.1, 1, 0], 0.1, 0.02, CYAN, 0.7);
  // Crystal growths on blade faces near the root
  for (const z of [0.02, -0.02]) {
    const sgn = Math.sign(z);
    shard([0.24, HY + 0.08, z], [0.2, 0.5, sgn], 0.11, 0.022, ICE_DK);
    shard([0.26, HY - 0.08, z], [0.25, -0.4, sgn], 0.09, 0.02, ICE);
    shard([0.3, HY + 0.12, z], [0.3, 0.7, sgn * 1.3], 0.07, 0.015, CYAN, 0.8);
  }

  // ---- back fluke ----------------------------------------------------------------------------------------
  const fluke: OutlinePoint[] = [
    [0.06, 0.09],
    [0.22, 0.12],
    [0.4, 0.09],
    [0.58, 0.16, "sharp"],
    [0.42, -0.02],
    [0.22, -0.08],
    [0.06, -0.09],
  ];
  b.extrude(fluke, {
    at: [0, HY, 0],
    x: [-1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.045,
    bevel: 0.01,
    smoothing: 1,
    color: cel(paint((_p, n, s) => (Math.abs(n.z) < 0.5 ? "#f4ffff" : mix("#2a5cc0", "#6fc8f5", smoothstep(0.05, 0.5, s[0]))))),
    name: "fluke",
  });
  // Ice crown rising from the fluke
  shard([-0.2, HY + 0.1, 0], [-0.3, 1, 0], 0.2, 0.035, ICE);
  shard([-0.3, HY + 0.1, 0], [-0.7, 1, 0.1], 0.15, 0.03, CYAN, 0.8);
  shard([-0.12, HY + 0.1, 0], [0.1, 1, 0], 0.15, 0.03, ICE_DK);
  shard([-0.28, HY - 0.07, 0], [-0.4, -1, 0], 0.13, 0.025, ICE);
  shard([-0.4, HY + 0.07, 0], [-1, 0.5, 0], 0.15, 0.025, ICE_DK);

  // ---- core gems -----------------------------------------------------------------------------------------
  for (const z of [0.074, -0.074]) {
    b.part(new THREE.TorusGeometry(0.05, 0.01, 5, 10), GOLD, { at: [0, HY, z * 0.95], dir: [0, 0, 1], axis: "z" });
    glow(b.part(new THREE.SphereGeometry(0.048, 6, 4), CYAN, { at: [0, HY, z], scale: [1, 1.2, 0.8], flat: true, name: "gem" }), 1.4);
  }

  // ---- cloth pennants ------------------------------------------------------------------------------------
  const cloth: OutlinePoint[] = [
    [-0.035, 0],
    [0.035, 0],
    [0.046, -0.3],
    [0, -0.22],
    [-0.046, -0.3],
  ];
  const clothPaint = paint((_p, _n, s) => (Math.abs(s[0]) > 0.028 || s[1] > -0.02 || s[1] < -0.285 + Math.abs(s[0]) * 1 ? GOLD : mix("#2c7fe0", "#8fe0ff", smoothstep(-0.25, 0, s[1]))));
  for (const z of [0.052, -0.052]) {
    b.extrude(cloth, { at: [0, HY - 0.14, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.008, color: clothPaint, name: "pennant" });
    for (const x of [-0.046, 0.046]) b.part(new THREE.SphereGeometry(0.013, 6, 4), GOLD, { at: [x, HY - 0.3, z], flat: true });
  }

  return b.root;
}
