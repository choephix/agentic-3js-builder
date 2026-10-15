import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  polyline,
  rng,
  mottle,
  countershade,
  grain,
  scales,
  noise,
  mix,
  smoothstep,
  paint,
  resolve,
  svg,
} from "../../../../src/index";
import type { ColorInput } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A League-of-Legends-style reaper's scythe: a dragon-skull crowned haft of vertebrae and wrapped grip, a crescent obsidian blade with a bone spine, glowing soul-edge and runes, a caged soul orb, tattered banners, and a ribbed rune-dais with soul crystals and wisps.",
};

type V3 = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "dragonbone_soul_scythe" });
  const R = rng(7);

  // ------------------------------------------------------------------ palette & paints
  const TEAL = "#4df0d6";
  const TEAL_HOT = "#c8fff6";
  const INK = "#07161c";
  const TOOTH = "#fff4d8";

  const shade = (c: ColorInput) =>
    paint((p, n) => {
      const base = resolve(c, p, n);
      const cool = mix(base, "#10203a", 0.3 * smoothstep(0.1, -0.9, n.y));
      return mix(cool, "#fff0c8", 0.14 * smoothstep(0.3, 1, n.y));
    });

  const BONE = shade(
    mottle(countershade("#f4ead0", "#bdb496", { level: -0.1 }), countershade("#cdbd92", "#8f8872", { level: -0.1 }), {
      size: 0.09,
      contrast: 0.9,
      seed: 2,
    }),
  );
  const BONE_D = shade(
    mottle(countershade("#d9cba2", "#9a9078", { level: -0.1 }), countershade("#a99a76", "#6c6552"), {
      size: 0.07,
      seed: 5,
    }),
  );
  const GOLD = metal("gilt", { tarnish: 0.15 });
  const GOLD_D = metal("bronze", { verdigris: 0.3 });
  const HAFT_DARK = grain("#2a3d46", "#111d25", { size: 0.015, axis: "y", seed: 3 });
  const GRIP = shade(
    paint((_p, _n, s) => {
      const t = s[0];
      if (t > 0.3 && t < 0.68) {
        const k = (((s[1] - 2600 * t) % 72) + 72) % 72;
        return k < 9 ? "#9cc0bd" : k < 22 ? "#1b2c36" : "#456a74";
      }
      return HAFT_DARK;
    }),
  );
  const STONE = paint((p, n) => {
    const g = noise(p, 0.18, 7);
    const f = noise(p, 0.05, 9);
    let c = mix("#2c3d47", "#546a73", g * 0.7 + f * 0.3);
    c = mix(c, "#2e7a68", 0.55 * smoothstep(0.6, 0.95, n.y) * smoothstep(0.5, 0.7, noise(p, 0.1, 11)));
    c = mix(c, "#0b1820", 0.45 * smoothstep(0.1, -0.8, n.y));
    return c;
  });

  // blade geometry curves (x, y) in the blade plane
  const ZB = -0.12;
  const OUT: [number, number][] = [
    [-0.06, 2.02],
    [0.18, 2.22],
    [0.52, 2.38],
    [0.92, 2.31],
    [1.24, 2.03],
    [1.4, 1.74],
    [1.44, 1.5],
  ];
  const INN: [number, number][] = [
    [-0.06, 1.9],
    [0.2, 2.06],
    [0.52, 2.17],
    [0.9, 2.08],
    [1.17, 1.86],
    [1.33, 1.66],
    [1.44, 1.5],
  ];
  const to3 = (a: [number, number][]) => a.map(([x, y]) => [x, y, ZB]);
  const outerP = catmull(to3(OUT));
  const innerP = catmull(to3(INN));
  const N = 16;
  const xy = (v: THREE.Vector3): [number, number] => [v.x, v.y];
  const oS = Array.from({ length: N + 1 }, (_, i) => xy(outerP.at(i / N)));
  const iS = Array.from({ length: N + 1 }, (_, i) => xy(innerP.at(i / N)));
  const dense = Array.from({ length: 48 }, (_, i) => xy(innerP.at(i / 47)));

  const bladeScales = scales(["#1b3944", "#16303b", "#20424d"], "#0b171d", { size: 0.035, width: 0.14, seed: 4 });
  const BLADE = paint((p, n) => {
    let d = 1e9;
    for (const q of dense) {
      const dx = p.x - q[0];
      const dy = p.y - q[1];
      d = Math.min(d, dx * dx + dy * dy);
    }
    d = Math.sqrt(d);
    let c = resolve(bladeScales, p, n);
    c = mix(c, "#3cc3bd", 0.55 * (1 - smoothstep(0.02, 0.16, d)));
    c = mix(c, "#0a141a", 0.5 * smoothstep(0.1, 0.3, d));
    return c;
  });

  // ------------------------------------------------------------------ textures
  const glowPath = (d: string, w: number) =>
    `<path d="${d}" stroke="#0f8f94" stroke-width="${w * 2}"/><path d="${d}" stroke="#57f2dc" stroke-width="${w}"/><path d="${d}" stroke="#eafffb" stroke-width="${w * 0.35}"/>`;
  const runeTex = (d: string) =>
    svg(
      `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-linejoin="round">${glowPath(d, 4.2)}</g></svg>`,
      { size: 160 },
    );
  const RUNE_A = runeTex("M20 8 V72 M20 20 L32 10 M20 36 L8 26 M20 36 L32 46 M20 56 L10 66");
  const RUNE_B = runeTex("M8 12 L20 4 L32 12 M20 4 V76 M8 30 L20 42 L32 30 M8 56 L20 68 L32 56");

  const pt = (r: number, a: number) => `${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`;
  const circ = (r: number) => `M${50 - r} 50 a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;
  let ticks = "";
  for (let i = 0; i < 32; i++) {
    const a = (i * Math.PI * 2) / 32;
    ticks += `M${pt(40, a)} L${pt(i % 4 === 0 ? 46 : 43, a)} `;
  }
  let star = "";
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8;
    const c = (((i + 3) % 8) * Math.PI * 2) / 8;
    star += `M${pt(30, a)} L${pt(30, c)} `;
  }
  const CIRCLE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round">
      ${glowPath(circ(48), 1.5)}${glowPath(circ(38), 1.1)}${glowPath(circ(13), 1.2)}${glowPath(ticks, 1.0)}${glowPath(star, 0.9)}
    </g></svg>`,
    { size: 512 },
  );
  const EYE = svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#7ffbe8"/><stop offset="1" stop-color="#18bfb4"/></radialGradient></defs>
      <path d="M2 24 Q20 2 62 16 Q40 38 2 24Z" fill="url(#g)" stroke="#0b6f78" stroke-width="2"/>
      <path d="M34 8 Q40 20 34 32 Q28 20 34 8Z" fill="#052a31"/></svg>`,
    { size: 192 },
  );
  const WISP = svg(
    `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8fff8"/><stop offset="1" stop-color="#35dcc6"/></linearGradient></defs>
      <path d="M24 3 C38 3 44 16 42 30 C41 42 46 54 40 62 C36 56 32 62 28 56 C24 62 20 56 16 62 C12 54 8 58 6 62 C4 50 6 40 6 30 C4 16 10 3 24 3Z" fill="url(#w)" stroke="#12a99c" stroke-width="2"/>
      <ellipse cx="16" cy="25" rx="4" ry="6" fill="#06353a"/><ellipse cx="32" cy="25" rx="4" ry="6" fill="#06353a"/><ellipse cx="24" cy="39" rx="3.5" ry="5" fill="#06353a"/></svg>`,
    { size: 128 },
  );
  const CLOTH = svg(
    `<svg viewBox="0 0 32 96" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(180 16 48)">
      <defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6470"/><stop offset="1" stop-color="#14303a"/></linearGradient></defs>
      <path d="M1 0 H31 V80 L27 92 L22 82 L16 95 L11 83 L6 90 L1 78 Z" fill="url(#c)" stroke="#e2b650" stroke-width="2" stroke-linejoin="round"/>
      <path d="M6 8 H26" stroke="#e2b650" stroke-width="2"/>
      <path d="M16 20 L25 34 L16 48 L7 34Z" fill="#14303a" stroke="#e2b650" stroke-width="1.8"/>
      <ellipse cx="16" cy="34" rx="4.5" ry="2.8" fill="#7ffbe8"/><path d="M16 31 V37" stroke="#052a31" stroke-width="1.6"/>
      <path d="M10 58 L16 52 L22 58 M10 68 L16 62 L22 68" stroke="#57f2dc" stroke-width="1.6" fill="none"/></g></svg>`,
    { size: 192 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="29" fill="#caa23e" stroke="#6e4e16" stroke-width="3"/>
      <circle cx="32" cy="32" r="21" fill="#1a2f38" stroke="#f4d57a" stroke-width="2"/>
      <path d="M14 33 Q32 14 50 33 Q32 50 14 33Z" fill="#46e8d0" stroke="#0b6f78" stroke-width="1.5"/><path d="M32 22 Q36 33 32 44 Q28 33 32 22Z" fill="#052a31"/></svg>`,
    { size: 128 },
  );
  const SPARK = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 1 L19 13 L31 16 L19 19 L16 31 L13 19 L1 16 L13 13Z" fill="#c8fff6" stroke="#4df0d6" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    { size: 64 },
  );

  // ------------------------------------------------------------------ skeleton
  const root = b.joint("root", { at: [0, 0.1, 0], dir: [0, 1, 0] });
  const haftPath = catmull([
    [0, 0.12, 0],
    [0, 0.7, 0.02],
    [0, 1.35, -0.015],
    [0, 2.0, 0],
  ]);
  const haft = b.chain("haft", haftPath, { parent: root, count: 3, names: ["haft1", "haft2", "haft3"], role: "spine" });
  const top = haft.joints[2];
  const HY = 2.07;
  const H = (x: number, y: number, z: number): V3 => [x, HY + y, z];
  const headJ = b.joint("head", { parent: top, at: [0, HY, 0], dir: [0, 0, 1], role: "head" });
  const jawJ = b.joint("jaw", { parent: headJ, at: H(0, -0.05, -0.04), aim: H(0, -0.085, 0.3), role: "jaw" });
  const bladeJ = b.joint("blade", { parent: top, at: [0, 1.96, ZB], dir: [1, 0, 0] });
  const hb = (t: number) => haft.joints[Math.min(2, Math.floor(t * 3))];

  // ------------------------------------------------------------------ dais & setting
  b.lathe(
    [
      [0, 0],
      [0.68, 0],
      [0.68, 0.05],
      [0.64, 0.09],
      [0.54, 0.09],
      [0.54, 0.14],
      [0.5, 0.17],
      [0, 0.17],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 8, spin: 22.5, bone: root, color: STONE },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.88, 0.88), "#ffffff", {
      at: [0, 0.174, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: CIRCLE,
      bone: root,
    }),
    1.1,
  );
  for (let k = 0; k < 8; k++) {
    const a = ((22.5 + k * 45) * Math.PI) / 180;
    b.spike([Math.sin(a) * 0.6, 0.07, Math.cos(a) * 0.6], [Math.sin(a) * 0.3, 1, Math.cos(a) * 0.3], 0.17, 0.03, {
      color: k % 2 ? BONE_D : BONE,
      bone: root,
    });
  }

  const rib = (phi: number, h: number) => {
    const a = (phi * Math.PI) / 180;
    const P = (r: number, y: number): V3 => [r * Math.sin(a), y, r * Math.cos(a)];
    b.sweep(
      catmull([P(0.5, 0.06), P(0.58, 0.3 * h), P(0.52, 0.62 * h), P(0.36, 0.9 * h), P(0.18, 1.0 * h)]),
      [0.042, 0.007],
      { bone: root, color: BONE_D, sides: 6, caps: { start: "flat", end: "point" } },
    );
    b.part(new THREE.SphereGeometry(0.052, 7, 5), BONE_D, { at: P(0.5, 0.08), bone: root, flat: true });
    b.spike(P(0.58, 0.3 * h), [Math.sin(a) * 0.6, 0.7, Math.cos(a) * 0.6], 0.07, 0.016, { color: BONE, bone: root });
  };
  rib(105, 0.62);
  rib(150, 0.78);
  rib(210, 0.78);
  rib(255, 0.66);

  const crystal = (base: V3, dir: V3, len: number, r: number, col: string) => {
    const d = new THREE.Vector3(...dir).normalize();
    const tip: V3 = [base[0] + d.x * len, base[1] + d.y * len, base[2] + d.z * len];
    glow(
      b.sweep(polyline([base, tip]), [r, r * 0.8], {
        color: col,
        section: { ngon: 6 },
        caps: { start: "flat", end: "point" },
        bone: root,
      }),
      1.3,
    );
  };
  const cluster = (phi: number, rad: number) => {
    const a = (phi * Math.PI) / 180;
    const bx = rad * Math.sin(a);
    const bz = rad * Math.cos(a);
    crystal([bx, 0.08, bz], [0.1, 1, 0.05], 0.3, 0.04, "#46ecd2");
    crystal([bx + 0.06, 0.08, bz - 0.04], [0.6, 1, 0.1], 0.2, 0.03, "#7dfff0");
    crystal([bx - 0.05, 0.08, bz + 0.04], [-0.5, 1, 0.2], 0.17, 0.028, "#27c9c0");
  };
  cluster(35, 0.58);
  cluster(-40, 0.57);
  cluster(180, 0.56);

  // ------------------------------------------------------------------ haft
  b.sweep(haft, (t) => 0.056 - 0.01 * t, { color: GRIP, sides: 8 });

  const band = (t: number, color: ColorInput, h = 0.045, r = 0.07) => {
    const c = haft.at(t);
    b.lathe(
      [
        [0, -h / 2],
        [r * 0.9, -h / 2],
        [r, -h * 0.3],
        [r, h * 0.3],
        [r * 0.9, h / 2],
        [0, h / 2],
      ],
      { at: c.at, axis: [0, 1, 0], segments: 8, bone: hb(t), color },
    );
    glow(
      b.part(new THREE.OctahedronGeometry(0.016, 0), "#6af5de", {
        at: [c.at.x, c.at.y, c.at.z + r + 0.004],
        bone: hb(t),
        scale: [1, 1.3, 0.8],
        flat: true,
      }),
      1.4,
    );
  };
  band(0.3, GOLD);
  band(0.34, GOLD_D, 0.025, 0.066);
  band(0.66, GOLD_D, 0.025, 0.064);
  band(0.7, GOLD);
  band(0.82, GOLD, 0.05, 0.068);

  const vertebra = (t: number, r: number, h: number) => {
    const c = haft.at(t);
    const j = hb(t);
    const { x, y, z } = c.at;
    b.part(new THREE.CylinderGeometry(r * 0.85, r, h, 7), BONE, { at: c.at, bone: j, flat: true });
    for (const s of [1, -1]) b.spike([x + s * r * 0.8, y, z], [s, 0.25, 0], r * 1.1, r * 0.28, { color: BONE_D, bone: j });
    b.spike([x, y + h * 0.1, z - r * 0.7], [0, 0.6, -1], r * 1.2, r * 0.3, { color: BONE, bone: j });
  };
  for (let i = 0; i < 6; i++) vertebra(0.035 + i * 0.036, 0.064 - i * 0.002, 0.05);
  for (let i = 0; i < 3; i++) vertebra(0.88 + i * 0.03, 0.045 - i * 0.003, 0.034);

  // claws gripping the dais
  b.ring(frame([0, 0.17, 0], [0, 1, 0]), { count: 6, radius: 0.05, tilt: 45 }, (it) =>
    b.spike(it, it, 0.14, 0.022, { color: BONE_D, bone: root }),
  );

  // gorget under the skull
  b.lathe(
    [
      [0, 0],
      [0.075, 0],
      [0.088, 0.02],
      [0.072, 0.06],
      [0.055, 0.078],
      [0, 0.078],
    ],
    { at: [0, 1.93, 0], axis: [0, 1, 0], segments: 8, bone: top, color: GOLD },
  );
  b.rod([0, 1.95, 0], [0.03, 1.92, ZB], 0.03, { color: GOLD, bone: top });

  // ------------------------------------------------------------------ dragon skull
  b.part(new THREE.SphereGeometry(1, 10, 8), BONE, { at: H(0, 0.01, -0.01), scale: [0.125, 0.105, 0.15], bone: headJ, flat: true });
  b.frustumBox(H(0, -0.005, 0.08), H(0, -0.03, 0.33), [0.15, 0.115], [0.085, 0.075], { color: BONE, bone: headJ });
  b.rod(H(0, 0.05, 0.06), H(0, 0.012, 0.32), 0.018, { color: BONE_D, bone: headJ, sides: 6 });
  b.spike(H(0, 0.01, 0.31), [0, 0.7, 0.7], 0.07, 0.022, { color: BONE_D, bone: headJ });
  glow(
    b.part(new THREE.OctahedronGeometry(0.022, 0), "#7dfff0", { at: H(0, 0.1, 0.07), scale: [1, 1.4, 1], bone: headJ, flat: true }),
    1.5,
  );

  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.022, 0.016, 0.01), INK, { at: H(s * 0.025, -0.015, 0.332), bone: headJ });
    b.frustumBox(H(s * 0.05, 0.072, 0.05), H(s * 0.115, 0.058, 0.15), [0.05, 0.04], [0.035, 0.03], { color: BONE_D, bone: headJ });
    b.spike(H(s * 0.09, 0.085, 0.1), [s * 0.3, 0.8, -0.2], 0.09, 0.02, { color: BONE, bone: headJ });
    b.part(new THREE.SphereGeometry(0.043, 7, 5), INK, { at: H(s * 0.088, 0.03, 0.1), scale: [0.8, 0.95, 0.9], bone: headJ });
    glow(
      b.part(new THREE.PlaneGeometry(0.082, 0.052), "#ffffff", {
        at: H(s * 0.105, 0.032, 0.129),
        dir: [s * 0.5, 0.05, 0.85],
        axis: "z",
        up: [-s * 0.3, 1, 0],
        texture: EYE,
        bone: headJ,
      }),
      1.3,
    );
    // cheek spikes and sweeping horns
    b.spike(H(s * 0.11, -0.01, 0.0), [s * 0.8, -0.1, -0.6], 0.12, 0.026, { color: BONE_D, bone: headJ });
    b.spike(H(s * 0.1, -0.035, 0.05), [s * 0.9, -0.4, -0.2], 0.08, 0.018, { color: BONE, bone: headJ });
    const horn = b.sweep(
      catmull([H(s * 0.08, 0.075, -0.0), H(s * 0.17, 0.11, -0.02), H(s * 0.26, 0.19, -0.03), H(s * 0.31, 0.31, -0.01)]),
      [0.035, 0.005],
      { color: BONE_D, bone: headJ, sides: 6, caps: { start: "flat", end: "point" } },
    );
    b.along(horn, 3, (at) => b.spike(at, at, 0.05, 0.012, { color: BONE, bone: headJ }));
    // jaw hinge bulbs and rami
    b.part(new THREE.SphereGeometry(0.03, 6, 4), BONE_D, { at: H(s * 0.085, -0.045, -0.04), bone: headJ, flat: true });
    b.rod(H(s * 0.08, -0.05, -0.04), H(s * 0.065, -0.08, 0.08), 0.022, { color: BONE, bone: jawJ, sides: 6 });
    // teeth
    for (let i = 0; i < 6; i++) {
      const z = 0.1 + i * 0.045;
      const xh = 0.075 - 0.13 * (z - 0.08) - 0.006;
      const yb = -0.005 - 0.1 * (z - 0.08) - (0.115 - 0.16 * (z - 0.08)) / 2;
      const fang = i === 3;
      b.spike(H(s * xh, yb + 0.012, z), [s * 0.05, -1, 0.15], fang ? 0.085 : 0.045, fang ? 0.014 : 0.011, { color: TOOTH, bone: headJ });
    }
    for (let i = 0; i < 5; i++) {
      const z = 0.1 + i * 0.047;
      const xh = 0.065 - 0.1 * (z - 0.02) - 0.008;
      b.spike(H(s * xh, -0.078, z), [-s * 0.05, 1, -0.1], i === 4 ? 0.06 : 0.04, 0.009, { color: TOOTH, bone: jawJ });
    }
  }
  b.frustumBox(H(0, -0.075, 0.02), H(0, -0.09, 0.31), [0.13, 0.035], [0.07, 0.03], { color: BONE, bone: jawJ });
  b.spike(H(0, -0.095, 0.28), [0, -1, 0.3], 0.08, 0.02, { color: BONE_D, bone: jawJ });
  // soul flame in the maw
  [
    [0.08, 0.09],
    [0.16, 0.13],
    [0.23, 0.08],
  ].forEach(([z, len]) => glow(b.spike(H(0, -0.06, z), [0, 1, 0.25], len, 0.03, { color: TEAL, bone: headJ }), 1.4));
  b.pose(jawJ, { axis: [1, 0, 0], deg: 14 });

  // swept-back frill fans behind the skull
  const FRILL: [number, number][] = [
    [0, -0.02],
    [0.14, 0.0],
    [0.1, 0.06],
    [0.22, 0.12],
    [0.1, 0.15],
    [0.18, 0.27],
    [0.04, 0.17],
    [0, 0.12],
  ];
  const FRILL_IN: [number, number][] = FRILL.map(([x, y]) => [0.02 + x * 0.62, 0.015 + y * 0.62] as [number, number]);
  for (const s of [1, -1]) {
    b.extrude(FRILL, {
      at: H(s * 0.07, 0.03, -0.1),
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.003,
      color: BONE_D,
      bone: headJ,
    });
    glow(
      b.extrude(FRILL_IN, {
        at: H(s * 0.07 + s * 0.0004, 0.03, -0.1),
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.02,
        color: "#46ecd2",
        bone: headJ,
      }),
      1.2,
    );
  }

  // ------------------------------------------------------------------ blade
  const bladeBody = b.extrude(
    [
      ...oS.slice(0, N),
      [oS[N][0], oS[N][1], "sharp"] as [number, number, "sharp"],
      ...iS.slice(0, N).reverse(),
    ],
    { at: [0, 0, ZB], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, bevel: 0.007, color: BLADE, bone: bladeJ },
  );
  void bladeBody;
  const eS = iS.map((q, i) => [q[0] + (oS[i][0] - q[0]) * 0.17, q[1] + (oS[i][1] - q[1]) * 0.17] as [number, number]);
  glow(
    b.extrude([...iS, ...eS.slice(0, N).reverse()], {
      at: [0, 0, ZB],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.038,
      bevel: 0.01,
      color: "#52f6dc",
      bone: bladeJ,
    }),
    1.3,
  );
  b.sweep(outerP, (t) => (0.048 * Math.pow(1 - t, 0.8) + 0.012) * (1 + 0.25 * Math.cos(t * Math.PI * 16)), {
    color: BONE,
    bone: bladeJ,
    section: { ngon: 6 },
    caps: { start: "flat", end: "point" },
  });
  for (let i = 1; i <= 9; i++) {
    const t = i / 10;
    const p = outerP.at(t);
    const tg = outerP.tangentAt(t);
    const d = new THREE.Vector3(-tg.y - tg.x * 0.45, tg.x - tg.y * 0.45, 0).normalize();
    b.spike([p.x, p.y, ZB], d, 0.12 - 0.07 * t, 0.024 * (1 - 0.4 * t), { color: i % 2 ? BONE : BONE_D, bone: bladeJ });
  }
  // ribs (both faces) and runes
  for (const s of [1, -1]) {
    for (const t of [0.18, 0.32, 0.46, 0.6, 0.74, 0.86]) {
      const o = outerP.at(t);
      const q = innerP.at(t);
      const e = [q.x + (o.x - q.x) * 0.17, q.y + (o.y - q.y) * 0.17, ZB + s * 0.022];
      b.rod([o.x, o.y, ZB + s * 0.02], e, [0.016, 0.008], { color: BONE, bone: bladeJ, sides: 5 });
    }
    [0.25, 0.39, 0.53, 0.67, 0.8].forEach((t, i) => {
      const o = outerP.at(t);
      const q = innerP.at(t);
      const w = Math.hypot(o.x - q.x, o.y - q.y);
      const hh = Math.min(0.12, w * 0.55);
      const up = new THREE.Vector3(o.x - q.x, o.y - q.y, 0).normalize();
      glow(
        b.part(new THREE.PlaneGeometry(hh * 0.5, hh), "#ffffff", {
          at: [(o.x + q.x) / 2, (o.y + q.y) / 2, ZB + s * 0.0195],
          dir: [0, 0, s],
          axis: "z",
          up,
          texture: i % 2 ? RUNE_B : RUNE_A,
          bone: bladeJ,
        }),
        1.2,
      );
    });
  }
  // mount + emblem
  b.part(new THREE.BoxGeometry(0.15, 0.18, 0.075), GOLD, { at: [0.045, 1.93, ZB], bone: bladeJ });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.085, 0.085), "#ffffff", {
      at: [0.045, 1.93, ZB + s * 0.0395],
      dir: [0, 0, s],
      axis: "z",
      texture: EMBLEM,
      bone: bladeJ,
    });
  for (const y of [1.865, 1.995]) b.rod([-0.03, y, ZB], [0.13, y, ZB], 0.02, { color: GOLD_D, bone: bladeJ, sides: 6 });

  // soul orb caged in the crescent
  const C: V3 = [0.78, 1.74, ZB];
  for (const [t, dx] of [
    [0.5, -0.07],
    [0.72, 0.07],
  ] as [number, number][]) {
    const p = innerP.at(t);
    b.sweep(
      catmull([
        [C[0] + dx, C[1] + 0.14, ZB],
        [(C[0] + dx + p.x) / 2, (C[1] + p.y) / 2 + 0.03, ZB],
        [p.x, p.y - 0.02, ZB],
      ]),
      0.014,
      { color: GOLD_D, bone: bladeJ, sides: 6 },
    );
    b.part(new THREE.CylinderGeometry(0.03, 0.035, 0.05, 6), GOLD, { at: [p.x, p.y - 0.01, ZB], bone: bladeJ, flat: true });
  }
  glow(b.part(new THREE.SphereGeometry(0.075, 8, 6), TEAL_HOT, { at: C, bone: bladeJ, flat: true }), 1.6);
  for (const rot of [[0, 0, 0], [0, 65, 0], [65, 0, 0]] as V3[])
    b.part(new THREE.TorusGeometry(0.15, 0.008, 4, 20), GOLD, { at: C, rotation: rot, bone: bladeJ, flat: true });
  b.ring(frame(C, [0, 0, 1]), { count: 8, radius: 0.1 }, (it) =>
    glow(b.spike(it, it, 0.09, 0.022, { color: TEAL, bone: bladeJ }), 1.3),
  );

  // ------------------------------------------------------------------ banners
  const angles = [0, 75, -75];
  const flows: V3[] = angles.map((a) => [Math.sin((a * Math.PI) / 180), 0, Math.cos((a * Math.PI) / 180)]);
  const bf = angles.map((a) => frame([Math.sin((a * Math.PI) / 180) * 0.065, 1.935, Math.cos((a * Math.PI) / 180) * 0.065], [0, 1, 0]));
  b.cards(bf, CLOTH, {
    size: [0.13, 0.5],
    lean: 180,
    flow: (_f, i) => flows[i],
    vary: 0.12,
    rng: R,
    bone: top,
  });

  // ------------------------------------------------------------------ wisps & sparks
  const wisp = (x: number, y: number, z: number, k: number, d: number) => {
    glow(b.part(new THREE.SphereGeometry(0.045 * k, 7, 5), "#bffff3", { at: [x, y, z], bone: root, flat: true }), 1.4);
    glow(
      b.sweep(
        catmull([
          [x, y, z],
          [x + 0.02 * d, y - 0.1 * k, z + 0.01],
          [x - 0.03 * d, y - 0.22 * k, z],
          [x + 0.02 * d, y - 0.34 * k, z - 0.02],
        ]),
        [0.04 * k, 0],
        { color: "#3ee6cc", bone: root, sides: 6, caps: { start: "flat", end: "point" } },
      ),
      1.2,
    );
    for (const s of [1, -1])
      b.part(new THREE.SphereGeometry(0.009 * k, 5, 4), INK, { at: [x + s * 0.018 * k, y + 0.008 * k, z + 0.04 * k], bone: root });
  };
  wisp(-0.62, 0.9, 0.5, 1.0, 1);
  wisp(0.62, 0.6, 0.55, 0.8, -1);
  wisp(-0.75, 1.5, -0.2, 0.9, 1);
  wisp(1.05, 1.15, -0.1, 0.7, -1);


  const stream: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 5; i++) {
    const a = 0.6 + i * 1.3;
    const r = 0.62 + 0.05 * Math.sin(i);
    stream.push(frame([r * Math.sin(a), 0.3 + i * 0.13, r * Math.cos(a)], [0, 1, 0]));
  }
  glow(b.cards(stream, WISP, { size: [0.08, 0.13], lean: 0, flow: [0, 0, 1], cross: true, vary: 0.2, rng: R, bone: root }), 1.1);

  const sparks: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 14; i++)
    sparks.push(frame([0.7 + R() * 0.9, 1.1 + R() * 1.1, -0.35 + R() * 0.5], [0, 1, 0]));
  glow(b.cards(sparks, SPARK, { size: 0.07, lean: 0, flow: [0, 0, 1], cross: true, vary: 0.4, rng: R, bone: bladeJ }), 1.3);

  return b.root;
}
