import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  polyline,
  bezier,
  paint,
  noise,
  cells,
  mix,
  smoothstep,
  gradient,
} from "../../../../src/index";
import type { Joint, ColorInput } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Basalt Lava Golem",
  description:
    "A hulking lava golem of dark hexagonal basalt plates with glowing molten seams, a flame-glyph chest core, obsidian horn crown and gold trim, standing on a runed hex plinth. Genshin-style pyro monster.",
};

type V3 = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Constants. The golem is authored from its own floor (y = 0); P lifts everything onto the plinth top.
const F = 0.18; // plinth height
const HEAD = 1.0; // head scale constant
const FIST = 1.0; // hand scale constant
const CORE = 1.0; // chest medallion scale constant
const P = (x: number, y: number, z: number): V3 => [x, y + F, z];
const L = (a: V3, c: V3, t: number): V3 => [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];
const norm = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

const LAVA = "#ff6a14";
const HOT = "#ffb431";
const WHITE = "#fff0a0";
const DEEP = "#e0440e";
const EMBER = "#ff7a1a";
const OBSC = "#1b1226";

// ---------------------------------------------------------------------------------------------------------------
// Paints
const basalt = (seed: number, tint = "#3a4052") =>
  paint((p, n) => {
    const m = noise(p, 0.22, seed);
    let c = mix(tint, "#566078", smoothstep(0.35, 0.75, m) * 0.8);
    const cr = cells(p, 0.16, seed + 3);
    c = mix(c, "#14161f", 0.55 * (1 - smoothstep(0.0, 0.07, cr.d2 - cr.d1)));
    c = mix(c, "#9a96a4", 0.32 * smoothstep(0.45, 0.95, n.y) * smoothstep(0.3, 0.7, noise(p, 0.07, seed + 9)));
    c = mix(c, "#171a28", 0.4 * smoothstep(-0.2, -0.9, n.y));
    c = mix(c, "#b24a1c", 0.45 * smoothstep(1.0, 0.2, p.y) * smoothstep(0.5, -0.4, n.y));
    return c;
  });

const obsidian = paint((p, n) => {
  const m = noise(p, 0.1, 4);
  let c = mix("#150e20", "#2c1d42", m);
  c = mix(c, "#6b4fa0", 0.25 * smoothstep(0.6, 1, n.y) * smoothstep(0.5, 0.8, noise(p, 0.04, 8)));
  return c;
});

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const FLAME =
  "M64 14 C78 38 100 52 96 80 C94 98 80 110 64 110 C48 110 34 98 34 80 C34 62 46 56 50 40 C56 50 58 54 62 54 C60 40 60 28 64 14Z";
const FLAME_IN = "M64 56 C72 70 82 76 80 88 C79 98 72 102 64 102 C56 102 49 98 48 88 C48 78 58 72 64 56Z";

const eyeSvg = (flip: boolean) =>
  svg(
    `<svg viewBox="0 0 80 48" xmlns="http://www.w3.org/2000/svg"><g ${flip ? 'transform="translate(80,0) scale(-1,1)"' : ""}>
    <path d="M2 34 L28 12 Q54 2 78 8 L64 36 Q34 46 2 34Z" fill="#2a0c06"/>
    <path d="M8 33 L30 16 Q54 8 71 12 L60 32 Q34 41 8 33Z" fill="#ff7a1a"/>
    <path d="M16 31 L33 20 Q52 14 64 17 L56 29 Q36 36 16 31Z" fill="#ffd34a"/>
    <path d="M30 28 L38 21 Q50 18 56 20 L52 27 Q40 31 30 28Z" fill="#fffbe0"/>
    <ellipse cx="44" cy="24" rx="3" ry="5" fill="#3a1004"/></g></svg>`,
    { size: 256 },
  );

const medallionSvg = () => {
  let ticks = "";
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r0 = i % 2 ? 54 : 50;
    ticks += `<path d="M${(64 + Math.sin(a) * r0).toFixed(1)} ${(64 - Math.cos(a) * r0).toFixed(1)} L${(64 + Math.sin(a) * 61).toFixed(1)} ${(64 - Math.cos(a) * 61).toFixed(1)}" stroke="#ffcf5a" stroke-width="3" stroke-linecap="round"/>`;
  }
  return svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="47" fill="none" stroke="#ff9a2a" stroke-width="2.5"/>
    ${ticks}
    <path d="${FLAME}" fill="#7a1c06" stroke="#3a0e04" stroke-width="4" stroke-linejoin="round"/>
    <path d="${FLAME}" fill="#ff8a1c" transform="translate(64 64) scale(0.9) translate(-64 -64)"/>
    <path d="${FLAME_IN}" fill="#ffe27a" stroke="#fff6c0" stroke-width="2"/></svg>`,
    { size: 256 },
  );
};

const crackSvg = () => {
  const R = rng(5);
  let lines = "";
  for (let i = 0; i < 16; i++) {
    let x = 64 + (R() - 0.5) * 20;
    let y = 64 + (R() - 0.5) * 20;
    const a0 = (i / 16) * Math.PI * 2 + R() * 0.3;
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    for (let k = 0; k < 4; k++) {
      const a = a0 + (R() - 0.5) * 0.9;
      const len = 10 + R() * 12;
      x += Math.sin(a) * len;
      y -= Math.cos(a) * len;
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    lines += `<path d="${d}" fill="none" stroke="#c8360a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g"><stop offset="0" stop-color="#fff2a0"/><stop offset="0.6" stop-color="#ffc73a"/><stop offset="1" stop-color="#ff8a1c"/></radialGradient></defs>
    <rect width="128" height="128" fill="url(#g)"/>${lines}</svg>`,
    { size: 256 },
  );
};

const runeSvg = () =>
  svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 3 L59 32 L32 61 L5 32Z" fill="#2a0c06"/>
    <path d="M32 10 L52 32 L32 54 L12 32Z" fill="#ff7a1a"/>
    <path d="M32 18 C38 26 44 30 42 38 C41 44 37 46 32 46 C27 46 23 44 22 38 C22 32 27 29 29 24 C30 28 31 29 32 29 C31 24 31 21 32 18Z" fill="#fff0a0"/></svg>`,
    { size: 128 },
  );

const baseRuneSvg = () => {
  let glyphs = "";
  let ticks = "";
  for (let i = 0; i < 6; i++) {
    const a = i * 60;
    glyphs += `<g transform="translate(128 128) rotate(${a}) translate(0 -84) scale(0.34) translate(-64 -64)"><path d="${FLAME}" fill="#ff9a2a" stroke="#ffe27a" stroke-width="5"/></g>`;
  }
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const r0 = i % 4 ? 106 : 100;
    ticks += `<path d="M${(128 + Math.sin(a) * r0).toFixed(1)} ${(128 - Math.cos(a) * r0).toFixed(1)} L${(128 + Math.sin(a) * 112).toFixed(1)} ${(128 - Math.cos(a) * 112).toFixed(1)}" stroke="#ffb431" stroke-width="3"/>`;
  }
  return svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <circle cx="128" cy="128" r="122" fill="none" stroke="#ff9a2a" stroke-width="6"/>
    <circle cx="128" cy="128" r="64" fill="none" stroke="#ff7a1a" stroke-width="4"/>
    <path d="M128 70 L178 99 L178 157 L128 186 L78 157 L78 99Z" fill="none" stroke="#ffb431" stroke-width="5" stroke-linejoin="round"/>
    ${ticks}${glyphs}
    <path d="${FLAME}" fill="#ff8a1c" transform="translate(128 128) scale(0.3) translate(-64 -64)"/></svg>`,
    { size: 512 },
  );
};

// bulb at the drawing's top: cards hang with the drawing upside down, so the bulb ends up as the hanging tip
const dripSvg = () =>
  svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a0"/><stop offset="0.5" stop-color="#ffb431"/><stop offset="1" stop-color="#ff5a10"/></linearGradient></defs>
    <path d="M13 64 C14 44 14 36 8 26 C3 16 8 4 16 4 C24 4 29 16 24 26 C18 36 18 44 19 64Z" fill="url(#d)"/></svg>`,
    { size: 128 },
  );

const sparkSvg = () =>
  svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 1 L19 13 L31 16 L19 19 L16 31 L13 19 L1 16 L13 13Z" fill="#ffd34a"/><path d="M16 8 L17.5 14.5 L24 16 L17.5 17.5 L16 24 L14.5 17.5 L8 16 L14.5 14.5Z" fill="#fffbe0"/></svg>`,
    { size: 64 },
  );

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "lava_golem" });
  const R = rng(11);

  const BAS = basalt(1);
  const BAS2 = basalt(7, "#2f3547");
  const GOLD = metal("gilt");

  const EYE_R = eyeSvg(false);
  const EYE_L = eyeSvg(true);
  const MEDAL = medallionSvg();
  const CRACK = crackSvg();
  const RUNE = runeSvg();
  const BASE_RUNE = baseRuneSvg();
  const DRIP = dripSvg();
  const SPARK = sparkSvg();

  // ---- skeleton --------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: P(0, 1.0, 0), role: "spine" });
  const spine = b.joint("spine", { parent: hips, at: P(0, 1.1, 0), aim: P(0, 1.6, 0), role: "spine" });
  const chest = b.joint("chest", { parent: spine, at: P(0, 1.6, 0), aim: P(0, 2.0, 0), role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: P(0, 1.88, 0), aim: P(0, 1.97, 0.05), role: "neck" });
  const head = b.joint("head", { parent: neck, at: P(0, 1.97, 0.05), aim: P(0, 2.2, 0.05), role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: P(0, 1.8, -0.12), aim: P(0, 1.8, 0.3), role: "jaw" });

  // ---- helpers ---------------------------------------------------------------------------------------------
  const blk = (bone: Joint, size: V3, at: V3, color: ColorInput, rot?: V3) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone,
      at: P(...at),
      ...(rot ? { rotation: rot } : {}),
    });
  const hot = (bone: Joint, size: V3, at: V3, color = LAVA, strength = 1, rot?: V3) =>
    glow(blk(bone, size, at, color, rot), strength);
  const hex = (
    bone: Joint,
    rTop: number,
    rBot: number,
    h: number,
    at: V3,
    color: ColorInput,
    o: { rot?: V3; dir?: V3; sides?: number } = {},
  ) =>
    b.part(new THREE.CylinderGeometry(rTop, rBot, h, o.sides ?? 6, 1), color, {
      bone,
      at: P(...at),
      flat: true,
      ...(o.rot ? { rotation: o.rot } : {}),
      ...(o.dir ? { dir: o.dir } : {}),
    });
  const rivet = (bone: Joint, at: V3, dir: V3) =>
    b.part(new THREE.CylinderGeometry(0.025, 0.03, 0.03, 6), GOLD, { bone, at: P(...at), dir, flat: true });

  // A limb segment made of hex plates with glowing gaps showing a molten core.
  const stack = (
    bone: Joint,
    a: V3,
    c: V3,
    r0: number,
    r1: number,
    n: number,
    color: ColorInput,
    seed: number,
  ) => {
    glow(b.rod(P(...a), P(...c), [r0 * 0.82, r1 * 0.82], { color: DEEP, bone, sides: 6 }), 0.9);
    const len = Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const d = norm([c[0] - a[0], c[1] - a[1], c[2] - a[2]]);
    const gap = 0.08;
    for (let i = 0; i < n; i++) {
      const t0 = i / n + gap / 2;
      const t1 = (i + 1) / n - gap / 2;
      const ctr = L(a, c, (t0 + t1) / 2);
      const rb = r0 + (r1 - r0) * t0;
      const rt = r0 + (r1 - r0) * t1;
      b.part(new THREE.CylinderGeometry(rt, rb, len * (t1 - t0), 6, 1), color, {
        bone,
        at: P(...ctr),
        dir: d,
        up: [Math.sin(i * 2 + seed), 0, Math.cos(i * 2 + seed)],
        flat: true,
      });
    }
  };

  const hornSweep = (base: V3, ctrl: V3, tip: V3, r: number) => {
    const start = P(...base);
    const end = P(...tip);
    const mid = [start[0] + (end[0] - start[0]) * 0.45, start[1] + (end[1] - start[1]) * 0.45, start[2] + (end[2] - start[2]) * 0.45];
    b.sweep(bezier(start, P(...ctrl), end), [r, 0], {
      bone: head,
      color: gradient(OBSC, EMBER, mid, end),
      caps: { start: "flat", end: "point" },
      sides: 6,
    });
  };

  // ---- pelvis, belt, loincloth -------------------------------------------------------------------------------
  hot(hips, [0.7, 0.26, 0.55], [0, 0.98, 0], DEEP, 0.8);
  blk(hips, [0.8, 0.3, 0.62], [0, 1.0, 0], BAS);
  blk(hips, [0.86, 0.07, 0.68], [0, 1.15, 0], GOLD);
  blk(hips, [0.3, 0.34, 0.08], [0, 0.84, 0.35], BAS2);
  blk(hips, [0.6, 0.3, 0.08], [0, 0.92, -0.34], BAS2);
  for (const s of [1, -1]) {
    blk(hips, [0.24, 0.3, 0.08], [s * 0.3, 0.88, 0.34], BAS, [0, 0, -s * 10]);
    hot(hips, [0.04, 0.26, 0.05], [s * 0.15, 0.86, 0.34], LAVA, 1);
    rivet(hips, [s * 0.3, 0.98, 0.39], [0, 0, 1]);
  }
  hex(hips, 0.07, 0.07, 0.03, [0, 1.15, 0.36], GOLD, { dir: [0, 0, 1] });
  glow(
    b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
      bone: hips,
      at: P(0, 1.15, 0.378),
      dir: [0, 0, 1],
      axis: "z",
      texture: MEDAL,
    }),
    0.9,
  );

  // ---- torso -----------------------------------------------------------------------------------------------
  glow(b.frustumBox(P(0, 1.08, 0), P(0, 1.5, 0), [0.76, 0.62], [0.9, 0.74], { color: DEEP, bone: spine }), 0.8);
  glow(b.frustumBox(P(0, 1.5, 0), P(0, 2.0, 0), [0.9, 0.74], [1.15, 0.82], { color: DEEP, bone: chest }), 0.8);

  // abdomen plates
  [1.17, 1.3, 1.43].forEach((y, i) => {
    blk(spine, [0.5 - i * 0.02, 0.11, 0.1], [0, y, 0.36 + i * 0.012], i % 2 ? BAS2 : BAS);
  });
  for (const s of [1, -1]) {
    blk(spine, [0.1, 0.4, 0.5], [s * 0.47, 1.3, 0], BAS2);
    blk(spine, [0.1, 0.26, 0.2], [s * 0.46, 1.3, 0.3], BAS, [0, 0, s * 3]);
  }
  blk(spine, [0.7, 0.4, 0.1], [0, 1.3, -0.4], BAS2);

  // chest plates
  for (const s of [1, -1]) {
    blk(chest, [0.34, 0.26, 0.12], [s * 0.43, 1.86, 0.34], BAS, [0, 0, -s * 2]);
    blk(chest, [0.34, 0.2, 0.12], [s * 0.43, 1.6, 0.34], BAS2, [0, 0, s * 2]);
    blk(chest, [0.1, 0.5, 0.32], [s * 0.6, 1.75, 0.18], BAS);
    blk(chest, [0.1, 0.5, 0.32], [s * 0.6, 1.75, -0.18], BAS2);
    for (const dx of [-0.12, 0.12])
      for (const dy of [0.08, -0.06]) rivet(chest, [s * 0.43 + dx, 1.86 + dy * 0.9 - (dy < 0 ? 0.0 : 0), 0.405], [0, 0, 1]);
    // trapezius blocks: the head sits sunk between them
    blk(chest, [0.3, 0.2, 0.5], [s * 0.55, 2.04, -0.08], BAS, [0, 0, -s * 15]);
  }
  blk(chest, [0.28, 0.08, 0.1], [0, 1.98, 0.35], GOLD);

  // chest core
  const coreAt: V3 = P(0, 1.72, 0.405);
  b.part(new THREE.TorusGeometry(0.2 * CORE, 0.03, 5, 10), GOLD, { bone: chest, at: P(0, 1.72, 0.4), flat: true });
  glow(
    b.part(new THREE.CircleGeometry(0.18 * CORE, 16), "#ffffff", {
      bone: chest,
      at: coreAt,
      dir: [0, 0, 1],
      axis: "z",
      texture: CRACK,
    }),
    1.3,
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.36 * CORE, 0.36 * CORE), "#ffffff", {
      bone: chest,
      at: P(0, 1.72, 0.412),
      dir: [0, 0, 1],
      axis: "z",
      texture: MEDAL,
    }),
    1.4,
  );
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    blk(chest, [0.07, 0.05, 0.04], [Math.sin(a) * 0.2 * CORE, 1.72 + Math.cos(a) * 0.2 * CORE, 0.41], BAS2, [0, 0, -(a * 180) / Math.PI]);
  }

  // back shell and chimneys
  for (let i = 0; i < 4; i++) {
    blk(chest, [1.0 - 0.09 * i, 0.22, 0.1], [0, 1.9 - i * 0.24, -0.46 - i * 0.03], i % 2 ? BAS2 : BAS, [18, 0, 0]);
    hot(chest, [0.9 - 0.09 * i, 0.04, 0.08], [0, 1.78 - i * 0.24, -0.43 - i * 0.03], LAVA, 0.9);
  }
  const chimTops: V3[] = [];
  for (const s of [1, -1]) {
    hex(chest, 0.07, 0.09, 0.32, [s * 0.28, 2.02, -0.5], BAS2, { rot: [-20, 0, 0] });
    const top: V3 = [s * 0.28, 2.02 + 0.17 * Math.cos(Math.PI / 9), -0.5 - 0.17 * Math.sin(Math.PI / 9)];
    glow(hex(chest, 0.055, 0.055, 0.025, top, HOT, { rot: [-20, 0, 0] }), 1.4);
    hex(chest, 0.085, 0.085, 0.03, [s * 0.28, 2.0, -0.5], GOLD, { rot: [-20, 0, 0] });
    chimTops.push([top[0], top[1] + 0.05, top[2]]);
  }
  glow(
    b.cards(
      chimTops.map((p) => frame(P(...p), [0, 1, 0])),
      SPARK,
      { size: 0.1, cross: true, bone: chest, vary: 0.3, rng: R },
    ),
    1.3,
  );

  // ---- neck and head ----------------------------------------------------------------------------------------
  hex(neck, 0.2, 0.24, 0.2, [0, 1.9, 0], DEEP, {});
  glow(hex(neck, 0.2, 0.22, 0.12, [0, 1.9, 0], DEEP), 0.9);

  const H = HEAD;
  // skull
  blk(head, [0.62 * H, 0.3 * H, 0.5 * H], [0, 2.05, 0.05], BAS);
  blk(head, [0.5 * H, 0.1 * H, 0.4 * H], [0, 2.2, 0.03], BAS2, [0, 45, 0]);
  blk(head, [0.5 * H, 0.3 * H, 0.1 * H], [0, 2.0, -0.22], BAS2);
  hot(head, [0.34 * H, 0.03, 0.04], [0, 2.0, -0.275], LAVA, 1);
  hot(head, [0.3 * H, 0.15 * H, 0.3 * H], [0, 1.95, 0.0], DEEP, 0.8);
  // cheeks and vents
  for (const s of [1, -1]) {
    blk(head, [0.1 * H, 0.3 * H, 0.36 * H], [s * 0.34 * H, 1.95, 0.07], BAS2);
    for (let i = 0; i < 3; i++) hot(head, [0.015, 0.025, 0.1], [s * 0.395 * H, 1.88 + i * 0.05, 0.05 + (i % 2) * 0.03], HOT, 1.2);
    // brow bars in an angry V
    blk(head, [0.3 * H, 0.08 * H, 0.12 * H], [s * 0.15 * H, 2.1, 0.31], BAS, [0, 0, s * 14]);
    // eyes
    glow(
      b.part(new THREE.PlaneGeometry(0.15 * H, 0.09 * H), "#ffffff", {
        bone: head,
        at: P(s * 0.14 * H, 2.0, 0.32),
        dir: [0, 0, 1],
        axis: "z",
        texture: s > 0 ? EYE_R : EYE_L,
      }),
      1.5,
    );
  }
  // molten mask
  hot(head, [0.46 * H, 0.2 * H, 0.03], [0, 2.0, 0.3], DEEP, 0.85);
  // forehead rune
  glow(
    b.part(new THREE.PlaneGeometry(0.09, 0.09), "#ffffff", {
      bone: head,
      at: P(0, 2.16, 0.304),
      dir: [0, 0, 1],
      axis: "z",
      texture: RUNE,
    }),
    1.3,
  );
  // upper jaw and fangs
  blk(head, [0.6 * H, 0.06, 0.12], [0, 1.87, 0.26], BAS2);
  hot(head, [0.5, 0.04, 0.3], [0, 1.83, 0.12], LAVA, 1.1);
  for (const x of [-0.19, -0.065, 0.065, 0.19])
    b.spike(P(x, 1.85, 0.3), [0, -1, 0], 0.07, 0.025, { color: OBSC, bone: head, sides: 5 });
  // lower jaw (own bone)
  blk(jaw, [0.56, 0.12, 0.42], [0, 1.76, 0.09], BAS);
  blk(jaw, [0.5, 0.06, 0.3], [0, 1.69, 0.1], BAS2);
  blk(jaw, [0.3, 0.09, 0.06], [0, 1.74, 0.32], BAS2);
  for (const s of [1, -1]) {
    b.spike(P(s * 0.25, 1.78, 0.34), [0, 1, 0.08], 0.15, 0.04, { color: obsidian, bone: jaw, sides: 5 });
    hot(jaw, [0.02, 0.04, 0.04], [s * 0.25, 1.9, 0.345], HOT, 1.4);
  }
  // crown: gold band, gem, five horns
  b.part(new THREE.TorusGeometry(0.27, 0.035, 5, 10), GOLD, { bone: head, at: P(0, 2.2, 0.02), rotation: [90, 0, 0], flat: true });
  for (const s of [1, -1]) rivet(head, [s * 0.27, 2.2, 0.02], [s, 0, 0]);
  glow(
    b.part(new THREE.OctahedronGeometry(0.045), HOT, { bone: head, at: P(0, 2.2, 0.3), scale: [1, 1.4, 0.7], flat: true }),
    1.4,
  );
  hornSweep([0, 2.17, 0], [0, 2.4, -0.03], [0, 2.62, -0.08], 0.065);
  for (const s of [1, -1]) {
    hornSweep([s * 0.15, 2.17, 0], [s * 0.19, 2.35, -0.05], [s * 0.26, 2.52, -0.12], 0.055);
    hornSweep([s * 0.27, 2.14, 0], [s * 0.38, 2.28, -0.03], [s * 0.5, 2.4, -0.1], 0.05);
  }
  // jaw drips
  glow(
    b.cards(
      [-0.12, 0.12].map((x) => frame(P(x, 1.68, 0.26), [0, 1, 0])),
      DRIP,
      { size: [0.04, 0.12], lean: 180, flow: [0, 0, 1], bone: jaw },
    ),
    1.2,
  );

  // ---- arms -------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh: V3 = [s * 0.8, 1.8, 0];
    const el: V3 = [s * 0.93, 1.38, -0.02];
    const wr: V3 = [s * 1.03, 0.98, 0.1];
    const arm = b.chain(`arm${S}`, polyline([P(...sh), P(...el), P(...wr)]), {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const [shJ, elJ, wrJ] = arm.joints;

    // pauldron: three stacked hex slabs with a molten core and gold trim
    const pc: V3 = [s * 0.8, 1.82, 0];
    const ax = norm([s * 0.35, 1, 0]);
    const at = (o: number): V3 => [pc[0] + ax[0] * o, pc[1] + ax[1] * o, pc[2] + ax[2] * o];
    glow(
      b.part(new THREE.CylinderGeometry(0.2, 0.26, 0.34, 6), DEEP, { bone: shJ, at: P(...at(0.17)), dir: ax, flat: true }),
      0.9,
    );
    const layers: [number, number, number][] = [
      [0, 0.36, 0.12],
      [0.155, 0.3, 0.11],
      [0.295, 0.22, 0.1],
    ];
    layers.forEach(([o, r, h], i) => {
      b.lathe(
        [
          [0, 0],
          [r, 0],
          [r * 0.9, h],
          [0, h],
        ],
        { at: P(...at(o)), axis: ax, segments: 6, color: i === 1 ? BAS2 : BAS, bone: shJ },
      );
    });
    b.part(new THREE.TorusGeometry(0.31, 0.02, 4, 12), GOLD, { bone: shJ, at: P(...at(0.137)), dir: ax, axis: "z", flat: true });
    b.part(new THREE.TorusGeometry(0.26, 0.018, 4, 12), GOLD, { bone: shJ, at: P(...at(0.283)), dir: ax, axis: "z", flat: true });
    const top = at(0.4);
    const spikes: [V3, V3][] = [
      [[top[0] + s * 0.08, top[1], top[2]], [s * 0.8, 1, 0]],
      [[top[0] - s * 0.03, top[1], top[2] + 0.1], [s * 0.3, 1, 0.8]],
      [[top[0] - s * 0.03, top[1], top[2] - 0.1], [s * 0.3, 1, -0.8]],
    ];
    for (const [base, dir] of spikes) b.spike(P(...base), dir, 0.2, 0.05, { color: obsidian, bone: shJ, sides: 5 });

    // upper arm, elbow, forearm
    stack(shJ, [sh[0], sh[1] - 0.02, sh[2]], el, 0.17, 0.15, 3, BAS, s);
    b.part(new THREE.IcosahedronGeometry(0.2, 0), BAS2, { bone: elJ, at: P(...el), flat: true, scale: [1, 0.95, 1] });
    b.spike(P(el[0] + s * 0.1, el[1] + 0.02, el[2] - 0.12), [s * 0.5, 0.2, -1], 0.22, 0.07, { color: obsidian, bone: elJ, sides: 5 });
    stack(elJ, el, wr, 0.19, 0.24, 2, BAS, s + 5);
    // cuff and ridge fins
    const cuff = L(el, wr, 0.8);
    hex(wrJ, 0.27, 0.27, 0.09, cuff, GOLD, { dir: norm([wr[0] - el[0], wr[1] - el[1], wr[2] - el[2]]) });
    [-0.12, 0, 0.12].forEach((dz, i) => {
      blk(elJ, [0.035, 0.22 - Math.abs(i - 1) * 0.04, 0.1], [cuff[0] + s * 0.25, cuff[1] + 0.1, cuff[2] + dz], i === 1 ? obsidian : BAS2);
    });
    glow(
      b.cards(
        [frame(P(el[0], el[1] - 0.15, el[2] + 0.12), [0, 1, 0]), frame(P(el[0] + s * 0.08, el[1] - 0.17, el[2] - 0.08), [0, 1, 0])],
        DRIP,
        { size: [0.05, 0.16], lean: 180, flow: [0, 0, 1], bone: elJ },
      ),
      1.2,
    );

    // fist (FIST scales it)
    const c: V3 = [s * 1.05, 0.8, 0.13];
    const Fx = FIST;
    hot(wrJ, [0.3 * Fx, 0.26 * Fx, 0.36 * Fx], c, DEEP, 0.9);
    blk(wrJ, [0.42 * Fx, 0.1 * Fx, 0.44 * Fx], [c[0], c[1] + 0.16 * Fx, c[2]], BAS);
    blk(wrJ, [0.1 * Fx, 0.3 * Fx, 0.44 * Fx], [c[0] + s * 0.19 * Fx, c[1], c[2]], BAS2);
    blk(wrJ, [0.1 * Fx, 0.26 * Fx, 0.4 * Fx], [c[0] - s * 0.19 * Fx, c[1], c[2]], BAS);
    for (let k = 0; k < 4; k++) {
      blk(wrJ, [0.36 * Fx, 0.12 * Fx, 0.085 * Fx], [c[0], c[1] - 0.2 * Fx, c[2] + (k - 1.5) * 0.105 * Fx], k % 2 ? BAS : BAS2);
    }
    blk(wrJ, [0.09 * Fx, 0.2 * Fx, 0.1 * Fx], [c[0] - s * 0.21 * Fx, c[1] + 0.02, c[2] + 0.21 * Fx], obsidian, [20, 0, 0]);
    // knuckle spikes
    for (const dz of [-0.1, 0.1]) b.spike(P(c[0] + s * 0.23, c[1] + 0.02, c[2] + dz), [s, 0.2, 0], 0.09, 0.035, { color: obsidian, bone: wrJ, sides: 5 });
  }

  // ---- legs ---------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hipP: V3 = [s * 0.34, 1.0, 0];
    const kneeP: V3 = [s * 0.36, 0.58, 0.05];
    const ankP: V3 = [s * 0.36, 0.24, 0.0];
    const leg = b.chain(`leg${S}`, polyline([P(...hipP), P(...kneeP), P(...ankP)]), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.36, F, 0.2],
    });
    const [hipJ, kneeJ, ankJ] = leg.joints;
    stack(hipJ, hipP, kneeP, 0.3, 0.27, 2, BAS, s + 2);
    stack(kneeJ, kneeP, ankP, 0.27, 0.21, 2, BAS2, s + 7);
    b.part(new THREE.IcosahedronGeometry(0.17, 0), BAS, { bone: kneeJ, at: P(s * 0.36, 0.6, 0.28), flat: true, scale: [1, 0.9, 0.8] });
    hex(kneeJ, 0.275, 0.275, 0.05, [kneeP[0], 0.5, 0.05], GOLD, {});
    // foot
    const fx = s * 0.36;
    hot(ankJ, [0.4, 0.12, 0.7], [fx, 0.07, 0.12], DEEP, 0.9);
    blk(ankJ, [0.48, 0.2, 0.3], [fx, 0.1, -0.08], BAS);
    blk(ankJ, [0.5, 0.1, 0.25], [fx, 0.15, 0.2], BAS2);
    for (const dx of [-0.16, 0, 0.16]) {
      blk(ankJ, [0.14, 0.15, 0.22], [fx + dx, 0.075, 0.5], dx === 0 ? BAS : BAS2);
      b.spike(P(fx + dx, 0.12, 0.6), [0, 0.1, 1], 0.07, 0.04, { color: obsidian, bone: ankJ, sides: 5 });
    }
    b.spike(P(fx, 0.16, -0.22), [0, 0.3, -1], 0.14, 0.055, { color: obsidian, bone: ankJ, sides: 5 });
  }

  // ---- base ---------------------------------------------------------------------------------------------------
  const BR = 1.6;
  b.part(new THREE.CylinderGeometry(BR, BR + 0.06, F, 6), BAS2, { bone: hips, at: [0, F / 2, 0], flat: true });
  b.part(new THREE.CylinderGeometry(BR - 0.2, BR - 0.2, 0.02, 6), BAS, { bone: hips, at: [0, F + 0.001, 0], flat: true });
  const apothem = BR * 0.866;
  for (let k = 0; k < 6; k++) {
    const th = k * 60 + 30;
    const t = (th * Math.PI) / 180;
    // gold edge trim
    b.part(new THREE.BoxGeometry(BR, 0.03, 0.06), GOLD, {
      bone: hips,
      at: [Math.sin(t) * (apothem - 0.03), F, Math.cos(t) * (apothem - 0.03)],
      rotation: [0, th, 0],
    });
    // glowing slits on the side faces
    for (const dx of [-0.4, 0.4]) {
      const mid = apothem + 0.026;
      b.part(
        new THREE.BoxGeometry(0.05, 0.1, 0.03),
        glowColor(),
        { bone: hips, at: [Math.sin(t) * mid + Math.cos(t) * dx, F * 0.5, Math.cos(t) * mid - Math.sin(t) * dx], rotation: [0, th, 0] },
      );
    }
    // lava channels fanning out from the rune circle
    const mc = (0.95 + apothem - 0.04) / 2;
    glow(
      b.part(new THREE.BoxGeometry(0.07, 0.012, apothem - 0.04 - 0.95), LAVA, {
        bone: hips,
        at: [Math.sin(t) * mc, F + 0.008, Math.cos(t) * mc],
        rotation: [0, th, 0],
      }),
      1,
    );
    glow(
      b.part(new THREE.BoxGeometry(0.17, 0.012, 0.05), HOT, {
        bone: hips,
        at: [Math.sin(t) * (mc + 0.06) + Math.cos(t) * 0.07, F + 0.01, Math.cos(t) * (mc + 0.06) - Math.sin(t) * 0.07],
        rotation: [0, th + 30, 0],
      }),
      1,
    );
  }
  glow(
    b.part(new THREE.CircleGeometry(0.95, 24), "#ffffff", {
      bone: hips,
      at: [0, F + 0.006, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: BASE_RUNE,
    }),
    0.8,
  );
  // lava pools at back corners
  for (const th of [120, 180, 240]) {
    const t = (th * Math.PI) / 180;
    const x = Math.sin(t) * 1.28;
    const z = Math.cos(t) * 1.28;
    b.part(new THREE.CylinderGeometry(0.2, 0.22, 0.03, 7), BAS, { bone: hips, at: [x, F + 0.012, z], flat: true });
    glow(b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 7), HOT, { bone: hips, at: [x, F + 0.026, z], flat: true }), 1.2);
  }

  // props: broken columns behind, ember rocks in front corners
  const columns: [number, number, number, number][] = [
    [-0.6, -0.9, 0.2, 0.9],
    [0.65, -0.85, 0.17, 0.6],
  ];
  for (const [x, z, r, h] of columns) {
    b.part(new THREE.CylinderGeometry(r * 0.95, r, h, 6), BAS, { bone: hips, at: [x, F + h / 2, z], flat: true });
    b.part(new THREE.ConeGeometry(r * 0.9, 0.14, 6), BAS2, { bone: hips, at: [x, F + h + 0.05, z], rotation: [0, 0, 8], flat: true });
    b.part(new THREE.CylinderGeometry(r * 1.05, r * 1.1, 0.06, 6), GOLD, { bone: hips, at: [x, F + 0.03, z], flat: true });
    glow(b.part(new THREE.BoxGeometry(0.03, h * 0.6, 0.03), LAVA, { bone: hips, at: [x + r * 0.8, F + h * 0.5, z + r * 0.45], rotation: [0, 0, 4] }), 1);
    glow(b.part(new THREE.BoxGeometry(0.03, h * 0.35, 0.03), HOT, { bone: hips, at: [x - r * 0.4, F + h * 0.7, z + r * 0.85], rotation: [0, 0, -5] }), 1);
  }
  for (const s of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(0.11, 0), BAS, { bone: hips, at: [s * 0.85, F + 0.07, 0.85], flat: true });
    b.part(new THREE.IcosahedronGeometry(0.06, 0), BAS2, { bone: hips, at: [s * 0.98, F + 0.04, 0.72], flat: true });
    glow(b.part(new THREE.BoxGeometry(0.04, 0.04, 0.04), HOT, { bone: hips, at: [s * 0.85, F + 0.15, 0.85], rotation: [30, 45, 0] }), 1.4);
  }

  // ---- floating ember shards and sparks -------------------------------------------------------------------
  const shards: V3[] = [
    [-0.95, 2.55, 0.2],
    [0.95, 2.6, -0.1],
    [-0.55, 2.9, -0.3],
    [0.5, 2.85, 0.35],
    [-1.15, 1.9, 0.5],
    [1.2, 1.7, 0.45],
    [0.1, 3.0, -0.5],
    [-0.3, 2.7, 0.6],
  ];
  shards.forEach((p, i) => {
    glow(
      b.part(new THREE.OctahedronGeometry(0.06 + (i % 3) * 0.015), i % 2 ? HOT : LAVA, {
        bone: hips,
        at: P(...p),
        scale: [0.8, 1.6, 0.8],
        rotation: [i * 20, i * 35, i * 10],
        flat: true,
      }),
      1.5,
    );
  });
  const sparkFrames = [];
  for (let i = 0; i < 12; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.9 + R() * 0.45;
    sparkFrames.push(frame([Math.sin(a) * r, F + 0.3 + R() * 2.4, Math.cos(a) * r], [0, 1, 0]));
  }
  glow(b.cards(sparkFrames, SPARK, { size: 0.09, cross: true, bone: hips, vary: 0.4, rng: R, spin: 180 }), 1.4);

  return b.root;

  function glowColor() {
    return LAVA;
  }
}
