// Dragonbone soul scythe on a display plinth, League of Legends style: exaggerated crescent blade with a glowing soul
// vein, a dragon skull clasping the blade root, vertebra haft, high-contrast teal/violet magic on ivory and obsidian.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { bezier, catmull, polyline } from "../../../../src/path";
import { mix, mottle, noise, paint, scales, smoothstep } from "../../../../src/paint";
import type { Rgb } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A 2.4 m dragonbone scythe standing on an obsidian scale plinth: a vertebra haft with talon feet, a dragon skull clasping the root of a sweeping ivory blade with a glowing soul vein, rune inlays, floating soul wisps, a swinging soul lantern and streaming ribbons.",
  style: "League of Legends",
  commit: "88fc1f0",
};

type V2 = [number, number];

export default function build() {
  const b = createBuilder({ name: "soulScythe", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });

  // ---------------------------------------------------------------- palette
  const IVORY = "#f2e9d2";
  const BONE = cel(mottle(IVORY, "#e4d6b6", { size: 0.06, contrast: 1.2, seed: 2 }));
  const BONE_DK = cel(mottle("#d9c8a0", "#c4b184", { size: 0.05, contrast: 1.1, seed: 3 }));
  const OBS = cel(mottle("#3b2d5a", "#2a2044", { size: 0.08, seed: 5 }), "#150f27");
  const GOLD = cel("#f6c243", "#b9651f");
  const LEATHER = "#5b2a5e";
  const CORD = "#e9b94a";
  const GRIP = cel(
    paint((_p, _n, s) => (((((s[1] - 1500 * s[0]) % 120) + 120) % 120) < 50 ? CORD : LEATHER)),
  );
  const STONE = cel(
    scales(["#54477a", "#4a3e6e", "#5d5083"], "#251a3d", { size: 0.07, width: 0.16, seed: 4 }),
  );
  const TEAL = "#35f2d6";
  const TEAL_HOT = "#d6fff6";
  const VIOLET = "#a46bff";
  const TOOTH = "#fff7e3";
  const DARK = "#241a38";

  // ---------------------------------------------------------------- textures
  const RUNE_A = svg(
    `<svg viewBox="0 0 64 64"><g fill="none" stroke="${TEAL}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="32" cy="32" r="27"/><path d="M32 12 V52 M19 24 H45 M21 42 L32 32 L43 42"/></g></svg>`,
    { size: 128 },
  );
  const RUNE_B = svg(
    `<svg viewBox="0 0 64 64"><g fill="none" stroke="${TEAL}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M32 5 L59 32 L32 59 L5 32 Z"/><path d="M20 32 H44 M32 18 V46 M24 24 L40 40"/></g></svg>`,
    { size: 128 },
  );
  const glyph = (d: string) =>
    svg(
      `<svg viewBox="0 0 48 48"><g fill="none" stroke="#f6c243" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${d}</g></svg>`,
      { size: 96 },
    );
  const GLYPHS = [
    glyph(`<path d="M24 6 V42 M10 18 H38 M14 34 L24 24 L34 34"/>`),
    glyph(`<circle cx="24" cy="24" r="15"/><path d="M24 9 V39 M9 24 H39"/>`),
    glyph(`<path d="M12 8 L36 24 L12 40 M36 8 V40"/>`),
  ];

  // ---------------------------------------------------------------- blade geometry (blade plane = XY, thickness Z)
  const P0: V2 = [0, 0.12];
  const P1: V2 = [0.45, 0.5];
  const P2: V2 = [1.05, 0.35];
  const P3: V2 = [1.4, -0.45];
  const Q0: V2 = [0.05, -0.12];
  const Q1: V2 = [0.5, 0.18];
  const Q2: V2 = [1.0, 0.12];
  const cub = (a: V2, c: V2, d: V2, e: V2, t: number): V2 => {
    const u = 1 - t;
    const w0 = u * u * u;
    const w1 = 3 * u * u * t;
    const w2 = 3 * u * t * t;
    const w3 = t * t * t;
    return [w0 * a[0] + w1 * c[0] + w2 * d[0] + w3 * e[0], w0 * a[1] + w1 * c[1] + w2 * d[1] + w3 * e[1]];
  };
  const S = (t: number) => cub(P0, P1, P2, P3, t); // spine (outer, convex)
  const E = (t: number) => cub(Q0, Q1, Q2, P3, t); // cutting edge (inner)
  const W = (t: number, f: number): V2 => {
    const s = S(t);
    const e = E(t);
    return [s[0] + (e[0] - s[0]) * f, s[1] + (e[1] - s[1]) * f];
  };
  const BX = 0;
  const BY = 1.97;
  const at3 = (p: V2, z = 0): number[] => [BX + p[0], BY + p[1], z];
  const tangent = (fn: (t: number) => V2, t: number): V2 => {
    const a = fn(Math.max(0, t - 0.004));
    const c = fn(Math.min(1, t + 0.004));
    const l = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1;
    return [(c[0] - a[0]) / l, (c[1] - a[1]) / l];
  };

  const strip = (t0: number, t1: number, fa: (t: number) => number, fb: (t: number) => number, n: number) => {
    const raw: V2[] = [];
    for (let i = 0; i <= n; i++) {
      const t = t0 + ((t1 - t0) * i) / n;
      raw.push(W(t, fa(t)));
    }
    for (let i = n; i >= 0; i--) {
      const t = t0 + ((t1 - t0) * i) / n;
      raw.push(W(t, fb(t)));
    }
    const out: OutlinePoint[] = [];
    for (const p of raw) {
      const last = out[out.length - 1];
      if (last && Math.hypot(last[0] - p[0], last[1] - p[1]) < 1e-5) continue;
      out.push([p[0], p[1]]);
    }
    if (out.length > 1) {
      const f0 = out[0];
      const fl = out[out.length - 1];
      if (Math.hypot(f0[0] - fl[0], f0[1] - fl[1]) < 1e-5) out.pop();
    }
    return out;
  };

  // blade surface coordinates for the painted face: nearest slice along the blade (t) and spine->edge fraction (f)
  const NS = 72;
  const SS: V2[] = [];
  const EE: V2[] = [];
  const MM: V2[] = [];
  for (let i = 0; i <= NS; i++) {
    SS.push(S(i / NS));
    EE.push(E(i / NS));
    MM.push(W(i / NS, 0.5));
  }
  const bladeCoords = (u: number, v: number) => {
    let bi = 0;
    let bd = Infinity;
    for (let i = 0; i <= NS; i++) {
      const dx = u - MM[i][0];
      const dy = v - MM[i][1];
      const d = dx * dx + dy * dy;
      if (d < bd) {
        bd = d;
        bi = i;
      }
    }
    const s = SS[bi];
    const e = EE[bi];
    const dx = e[0] - s[0];
    const dy = e[1] - s[1];
    const f = ((u - s[0]) * dx + (v - s[1]) * dy) / Math.max(dx * dx + dy * dy, 1e-9);
    return { t: bi / NS, f: Math.min(Math.max(f, 0), 1) };
  };
  const BLADE = paint((p, n, s) => {
    if (Math.abs(n.z) < 0.55) return "#7a6a99";
    const { t, f } = bladeCoords(s[0], s[1]);
    let c: Rgb = mix("#f7efdb", "#c6e5ee", smoothstep(0.45, 0.98, f));
    c = mix(c, "#d8c9a6", 0.4 * smoothstep(0.35, 0.0, f));
    const rib = Math.abs((((t * 16 + 0.9 * f) % 1) + 1) % 1 - 0.5);
    if (f > 0.2 && rib < 0.045) c = mix(c, "#9d90b8", 0.8);
    c = mix(c, "#b6a98f", 0.3 * smoothstep(0.58, 0.8, noise(p, 0.05, 11)));
    if (f > 0.955) c = mix(c, "#ffffff", 0.85);
    return c;
  });

  const BLD = { at: [BX, BY, 0], x: [1, 0, 0], bone: root };
  // main ivory blade
  b.extrude(strip(0, 1, () => 0, () => 1, 34), { ...BLD, thickness: 0.026, bevel: 0.007, color: BLADE });
  // obsidian spine band
  b.extrude(strip(0, 1, () => 0, () => 0.2, 34), { ...BLD, thickness: 0.038, bevel: 0.008, color: OBS });
  // gold trim line under the spine band
  b.extrude(strip(0, 0.9, () => 0.2, () => 0.245, 28), { ...BLD, thickness: 0.032, bevel: 0.005, color: GOLD });
  // glowing soul vein, with a hot core
  const env = (t: number) => Math.pow(Math.sin(Math.PI * t), 0.7);
  glow(
    b.extrude(
      strip(0.22, 0.9, (t) => 0.5 - 0.085 * env(t), (t) => 0.5 + 0.085 * env(t), 30),
      { ...BLD, thickness: 0.04, bevel: 0.007, color: TEAL },
    ),
    1.3,
  );
  glow(
    b.extrude(
      strip(0.26, 0.86, (t) => 0.5 - 0.04 * env(t), (t) => 0.5 + 0.04 * env(t), 26),
      { ...BLD, thickness: 0.046, bevel: 0.006, color: TEAL_HOT },
    ),
    1.6,
  );
  // glowing cutting edge bead
  glow(
    b.sweep(catmull(Array.from({ length: 25 }, (_, i) => at3(E(i / 24)))), [0.016, 0.004], {
      color: "#8ffbe9",
      bone: root,
      sides: 6,
      caps: { start: "flat", end: "point" },
    }),
    1.3,
  );

  // spine studs and dragon-vertebra spikes
  for (let k = 0; k < 9; k++) {
    const p = W(0.1 + 0.09 * k, 0.1);
    for (const z of [0.019, -0.019])
      b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, { at: at3(p, z), scale: [1, 1, 0.6], bone: root });
  }
  for (let k = 0; k < 10; k++) {
    const t = 0.08 + 0.085 * k;
    const sp = S(t);
    const tg = tangent(S, t);
    const out: V2 = [-tg[1], tg[0]];
    const dir = [out[0] * 0.8 + tg[0] * 0.6, out[1] * 0.8 + tg[1] * 0.6, 0];
    const base = at3([sp[0] - out[0] * 0.012, sp[1] - out[1] * 0.012]);
    b.spike(base, dir, 0.06 + 0.09 * Math.sin(Math.PI * t), 0.018 * (1 - 0.45 * t), { color: BONE, bone: root });
  }

  // rune glyphs inlaid in gold along the blade face
  for (let k = 0; k < 5; k++) {
    const t = 0.25 + 0.09 * k;
    const p = W(t, 0.74);
    const tg = tangent((u) => W(u, 0.74), t);
    for (const z of [1, -1])
      b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", {
        at: at3(p, z * 0.0145),
        dir: [0, 0, z],
        axis: "z",
        up: [tg[0], tg[1], 0],
        texture: GLYPHS[k % 3],
        bone: root,
      });
  }

  // heel rosette with soul gem
  const HEEL: V2 = [0.15, 0.09];
  b.part(new THREE.CylinderGeometry(0.062, 0.062, 0.036, 10), GOLD, {
    at: at3(HEEL),
    rotation: [90, 0, 0],
    bone: root,
  });
  for (const z of [1, -1]) {
    glow(
      b.part(new THREE.SphereGeometry(0.032, 8, 6), TEAL, {
        at: at3(HEEL, z * 0.016),
        scale: [1, 1, 0.55],
        bone: root,
      }),
      1.5,
    );
    b.part(new THREE.TorusGeometry(0.043, 0.007, 4, 10), GOLD, { at: at3(HEEL, z * 0.019), bone: root });
  }

  // ---------------------------------------------------------------- plinth
  const plinthProfile: OutlinePoint[] = [
    [0, 0],
    [0.56, 0],
    [0.56, 0.045],
    [0.52, 0.075],
    [0.52, 0.105],
    [0.45, 0.13],
    [0.45, 0.21],
    [0.3, 0.21],
    [0.3, 0.25],
    [0.14, 0.3],
    [0, 0.3],
  ];
  b.lathe(plinthProfile, { at: [0, 0, 0], segments: 16, color: STONE, bone: root });
  const flatRing = (radius: number, y: number, tube: number, color: string | typeof GOLD, segs: number) =>
    b.part(new THREE.TorusGeometry(radius, tube, 4, segs), color, { at: [0, y, 0], rotation: [90, 0, 0], bone: root });
  flatRing(0.452, 0.21, 0.01, GOLD, 16);
  flatRing(0.295, 0.248, 0.01, GOLD, 16);
  glow(flatRing(0.526, 0.09, 0.011, TEAL, 16), 1.2);
  // rune ring on the step
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const cx = Math.cos(a);
    const sz = Math.sin(a);
    glow(
      b.part(new THREE.PlaneGeometry(0.095, 0.095), "#ffffff", {
        at: [0.375 * cx, 0.2135, 0.375 * sz],
        dir: [0, 1, 0],
        axis: "z",
        up: [cx, 0, sz],
        texture: k % 2 ? RUNE_A : RUNE_B,
        bone: root,
      }),
      1.2,
    );
  }
  // dragon-tooth spikes around the base
  for (let k = 0; k < 8; k++) {
    const a = ((k + 0.5) * Math.PI) / 4;
    const cx = Math.cos(a);
    const sz = Math.sin(a);
    b.spike([0.49 * cx, 0.07, 0.49 * sz], [cx, 0.55, sz], 0.13, 0.032, { color: BONE, bone: root });
  }

  // ---------------------------------------------------------------- haft
  b.rod([0, 0.28, 0], [0, 1.95, 0], [0.034, 0.03], { color: OBS, bone: root });
  // talon feet gripping the haft base
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    const cx = Math.cos(a);
    const sz = Math.sin(a);
    b.sweep(bezier([0.21 * cx, 0.265, 0.21 * sz], [0.2 * cx, 0.44, 0.2 * sz], [0.05 * cx, 0.64, 0.05 * sz]), [0.032, 0.0], {
      color: BONE,
      bone: root,
      sides: 6,
      caps: { start: "flat", end: "point" },
    });
    b.part(new THREE.SphereGeometry(0.036, 6, 5), BONE, { at: [0.21 * cx, 0.285, 0.21 * sz], bone: root });
  }
  // base collar
  b.lathe(
    [
      [0, 0],
      [0.068, 0],
      [0.058, 0.03],
      [0.042, 0.055],
      [0, 0.055],
    ],
    { at: [0, 0.27, 0], segments: 10, color: GOLD, bone: root },
  );
  // vertebrae with dorsal spines
  const verts: Array<[number, number]> = [
    [0.72, 0.046],
    [0.78, 0.046],
    [0.83, 0.043],
  ];
  for (let k = 0; k < 7; k++) verts.push([1.47 + 0.058 * k, 0.038 + 0.0035 * k]);
  verts.forEach(([y, r], i) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), BONE, { at: [0, y, 0], scale: [r, r * 0.7, r], bone: root });
    b.spike([0, y + 0.01, -r * 0.7], [0, 0.45, -1], 0.045 + 0.006 * i, 0.011, { color: BONE, bone: root });
  });
  // grip with spiral cord
  b.rod([0, 0.9, 0], [0, 1.355, 0], 0.037, { color: GRIP, bone: root });
  for (const y of [0.89, 1.365]) flatRing(0.041, y, 0.01, GOLD, 10);
  // bracket ring below the vertebrae
  flatRing(0.039, 1.405, 0.008, GOLD, 10);

  // skull collar
  b.lathe(
    [
      [0, 0],
      [0.052, 0],
      [0.06, 0.02],
      [0.05, 0.045],
      [0.064, 0.075],
      [0.05, 0.1],
      [0, 0.1],
    ],
    { at: [0, 1.86, 0], segments: 10, color: GOLD, bone: root },
  );

  // ---------------------------------------------------------------- dragon skull
  const C = [0, 2.03, 0.03];
  const c = (x: number, y: number, z: number): number[] => [C[0] + x, C[1] + y, C[2] + z];
  b.part(new THREE.SphereGeometry(1, 10, 8), BONE, { at: c(0, 0.005, -0.015), scale: [0.078, 0.066, 0.088], bone: root });
  b.frustumBox(c(0, -0.01, 0.05), c(0, -0.035, 0.24), [0.1, 0.085], [0.06, 0.05], { color: BONE, bone: root });
  b.frustumBox(c(0, -0.092, 0.035), c(0, -0.098, 0.22), [0.085, 0.032], [0.044, 0.02], { color: BONE_DK, bone: root });
  glow(b.rod(c(0, -0.0715, 0.06), c(0, -0.0715, 0.215), 0.011, { color: TEAL, bone: root, sides: 6 }), 1.4);
  for (const s of [1, -1]) {
    // jaw joint knuckle, eye socket, glowing eye, brow and cheek horns, nostril
    b.part(new THREE.SphereGeometry(0.025, 6, 5), BONE_DK, { at: c(s * 0.05, -0.07, 0.0), bone: root });
    b.part(new THREE.SphereGeometry(0.026, 8, 6), DARK, { at: c(s * 0.06, 0.018, 0.06), bone: root });
    glow(b.part(new THREE.SphereGeometry(0.017, 6, 5), TEAL, { at: c(s * 0.07, 0.02, 0.075), bone: root }), 1.6);
    b.spike(c(s * 0.05, 0.045, 0.03), [s * 0.7, 0.5, -0.6], 0.11, 0.018, { color: BONE, bone: root });
    b.spike(c(s * 0.06, -0.02, -0.02), [s * 0.8, -0.1, -0.5], 0.1, 0.014, { color: BONE_DK, bone: root });
    b.part(new THREE.SphereGeometry(0.008, 5, 4), DARK, { at: c(s * 0.017, -0.02, 0.236), bone: root });
  }
  b.spike(c(0, 0.0, 0.2), [0, 0.8, 0.5], 0.06, 0.012, { color: BONE_DK, bone: root });
  // crest
  b.spike(c(0, 0.062, -0.04), [0, 0.6, -0.8], 0.15, 0.022, { color: BONE, bone: root });
  for (const s of [1, -1]) b.spike(c(s * 0.03, 0.058, -0.04), [s * 0.4, 0.5, -0.75], 0.1, 0.016, { color: BONE, bone: root });
  // teeth
  const fangKey = 3;
  [0.09, 0.13, 0.17, 0.205].forEach((z, i) => {
    const k = (z - 0.05) / 0.19;
    const yc = -0.01 - 0.025 * k;
    const h = 0.085 - 0.035 * k;
    const hw = (0.1 - 0.04 * k) / 2;
    for (const s of [1, -1])
      b.spike(c(s * (hw - 0.007), yc - h / 2 + 0.006, z), [0, -1, 0], i === fangKey ? 0.05 : 0.03, i === fangKey ? 0.009 : 0.0065, {
        color: TOOTH,
        bone: root,
        sides: 6,
      });
  });
  [0.08, 0.12, 0.16, 0.2].forEach((z) => {
    const k = (z - 0.035) / 0.185;
    const yj = -0.092 - 0.006 * k;
    const hj = 0.032 - 0.012 * k;
    const hw = (0.085 - 0.041 * k) / 2;
    for (const s of [1, -1])
      b.spike(c(s * (hw - 0.006), yj + hj / 2 - 0.004, z), [0, 1, 0], 0.026, 0.005, {
        color: TOOTH,
        bone: root,
        sides: 6,
      });
  });
  // horns: long swept horn on the right (-X), short back horn on the left; gold rings on the long one
  const hornR = bezier(c(-0.05, 0.04, -0.03), c(-0.2, 0.07, -0.09), c(-0.36, 0.18, -0.12), c(-0.5, 0.4, -0.04));
  b.sweep(hornR, [0.034, 0.004], {
    color: BONE,
    bands: [
      [0.65, BONE],
      [1, BONE_DK],
    ],
    bone: root,
    caps: { start: "flat", end: "point" },
  });
  for (const t of [0.12, 0.24, 0.36, 0.48, 0.6]) {
    const r = 0.034 - 0.03 * t;
    b.part(new THREE.TorusGeometry(r * 1.05 + 0.002, 0.006, 4, 10), GOLD, {
      at: hornR.at(t),
      dir: hornR.tangentAt(t),
      axis: "z",
      bone: root,
    });
  }
  b.sweep(bezier(c(0.05, 0.045, -0.03), c(0.12, 0.1, -0.1), c(0.1, 0.2, -0.2), c(0.04, 0.3, -0.26)), [0.026, 0.004], {
    color: BONE,
    bone: root,
    caps: { start: "flat", end: "point" },
  });

  // ---------------------------------------------------------------- swinging soul lantern on a chain
  b.rod([0.04, 1.4, 0], [0.17, 1.465, 0.04], 0.008, { color: GOLD, bone: root, sides: 6 });
  const charm = b.chain(
    "charm",
    polyline([
      [0.17, 1.45, 0.04],
      [0.17, 1.36, 0.04],
      [0.17, 1.27, 0.04],
      [0.17, 1.18, 0.04],
    ]),
    { parent: root, names: ["charm1", "charm2", "charm3"], role: "tentacle" },
  );
  const boneAt = (y: number) => charm.joints[Math.min(2, Math.max(0, Math.floor((1.45 - y) / 0.09)))];
  for (let k = 0; k < 6; k++) {
    const y = 1.43 - 0.045 * k;
    b.part(new THREE.TorusGeometry(0.016, 0.0045, 4, 8), GOLD, {
      at: [0.17, y, 0.04],
      rotation: [0, 90 * (k % 2), 0],
      bone: boneAt(y),
    });
  }
  const jb = charm.joints[2];
  glow(b.part(new THREE.OctahedronGeometry(0.05, 0), VIOLET, { at: [0.17, 1.1, 0.04], scale: [0.85, 1.35, 0.85], bone: jb, flat: true }), 1.5);
  b.part(new THREE.ConeGeometry(0.06, 0.035, 4), GOLD, { at: [0.17, 1.185, 0.04], rotation: [0, 45, 0], bone: jb });
  b.part(new THREE.ConeGeometry(0.06, 0.035, 4), GOLD, { at: [0.17, 1.0125, 0.04], rotation: [180, 45, 0], bone: jb });
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.rod([0.17 + sx * 0.037, 1.03, 0.04 + sz * 0.037], [0.17 + sx * 0.037, 1.17, 0.04 + sz * 0.037], 0.004, {
        color: GOLD,
        bone: jb,
        sides: 4,
      });
  b.spike([0.17, 1.0, 0.04], [0, -1, 0], 0.11, 0.012, { color: VIOLET, bone: jb });
  b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, { at: [0.17, 0.89, 0.04], bone: jb });

  // ---------------------------------------------------------------- streaming ribbons from the grip
  const ribbon = (pts: number[][], w: number, c0: string, c1: string) => {
    b.sweep(catmull(pts), (t: number): [number, number] => [w * (1 - 0.45 * t), 0.0025], {
      section: "box",
      caps: "flat",
      color: c0,
      bands: [
        [0.55, c0],
        [1, c1],
      ],
      bone: root,
    });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { at: pts[pts.length - 1], bone: root });
  };
  ribbon(
    [
      [-0.04, 1.36, 0.02],
      [-0.16, 1.31, 0.0],
      [-0.3, 1.2, -0.08],
      [-0.42, 1.1, -0.03],
      [-0.52, 0.97, 0.05],
    ],
    0.024,
    "#13b5c2",
    "#7b4dff",
  );
  ribbon(
    [
      [-0.03, 1.355, -0.02],
      [-0.12, 1.28, -0.06],
      [-0.2, 1.15, -0.14],
      [-0.25, 1.0, -0.1],
      [-0.27, 0.85, -0.02],
    ],
    0.02,
    "#7b4dff",
    "#13b5c2",
  );
  ribbon(
    [
      [0.03, 1.355, -0.02],
      [0.0, 1.27, -0.1],
      [-0.08, 1.18, -0.18],
      [-0.12, 1.05, -0.2],
      [-0.1, 0.9, -0.14],
    ],
    0.018,
    "#13b5c2",
    "#a46bff",
  );

  // ---------------------------------------------------------------- floating souls under the blade
  const wisps: Array<[number, number, number, number, string]> = [
    [0.5, 1.8, 0.03, 0.016, TEAL],
    [0.72, 1.74, -0.04, 0.022, VIOLET],
    [0.93, 1.66, 0.03, 0.014, TEAL],
    [1.1, 1.55, -0.03, 0.02, VIOLET],
    [1.27, 1.4, 0.02, 0.013, TEAL],
    [0.84, 1.5, 0.05, 0.032, TEAL],
    [0.6, 1.58, -0.05, 0.012, VIOLET],
  ];
  for (const [x, y, z, r, col] of wisps) {
    glow(b.part(new THREE.IcosahedronGeometry(r, 1), col, { at: [x, y, z], bone: root, flat: true }), 1.4);
    glow(b.spike([x, y, z], [-0.8, 0.6, 0.1], r * 5, r * 0.7, { color: col, bone: root, sides: 6 }), 1.1);
  }

  return b.root;
}
