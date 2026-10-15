```ts
import * as THREE from "three";
import { createBuilder, frame, rng, aim, catmull, polyline, gradient, mottle, paint, svg } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Basalt Lava Golem",
  description:
    "A hulking Genshin-style lava golem: hex basalt plates with gold trim, molten seams, a glowing Pyro core, flame crest and rigged jaw, fingers and legs.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette and paints

const LAVA = "#ff6a1a";
const LAVA_DEEP = "#e0400f";
const HOT = "#ffd25a";
const EMBER = "#7a2a18";
const TOOTH = "#f1dcb4";
const SHADOW = "#1d1829";

const BASALT = cel(mottle("#4a445f", "#3a3550", { size: 0.22, seed: 3 }), "#242034");
const BASALT_L = cel(mottle("#5d5778", "#4a4464", { size: 0.18, seed: 5 }), "#2e2944");
const OBS = cel("#221c30", "#120e1b");
const GOLD = cel("#f4c64e", "#bd7e26");
const SCORCH = paint((p) => (p.y < 0.13 ? EMBER : p.y < 0.2 ? "#2a1f2c" : BASALT));

// ---------------------------------------------------------------------------------------------------------------
// Textures

const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="45" fill="none" stroke="#fff0b0" stroke-width="5"/>
  <circle cx="50" cy="50" r="37" fill="none" stroke="#ffb02e" stroke-width="2.5" stroke-dasharray="5 4"/>
  <path d="M50 14 C58 30 76 38 72 58 C70 74 60 84 50 86 C38 84 28 74 29 60 C30 50 37 46 40 38 C44 46 46 48 49 49 C45 38 45 26 50 14Z" fill="#ff9a1f" stroke="#fff0b0" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M50 44 C55 54 62 58 60 68 C58 76 54 79 50 80 C45 79 41 75 41 68 C41 62 46 60 47 54 C48 58 49 58 50 58Z" fill="#fff4c0"/>
</svg>`,
  { size: 256 },
);

const crackSvg = (mirror: boolean) =>
  svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g ${mirror ? 'transform="translate(64 0) scale(-1 1)"' : ""} fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path d="M30 0 L26 11 L35 21 L28 33 L38 44 L32 55 L35 64 M35 21 L47 25 L52 36 M28 33 L16 38 L10 50 M38 44 L50 50 M26 11 L14 14" stroke="#ff5a14" stroke-width="3.6"/>
  <path d="M30 0 L26 11 L35 21 L28 33 L38 44 L32 55 L35 64 M35 21 L47 25 L52 36 M28 33 L16 38 L10 50 M38 44 L50 50 M26 11 L14 14" stroke="#ffd25a" stroke-width="1.3"/>
</g></svg>`,
    { size: 256 },
  );
const CRACK_A = crackSvg(false);
const CRACK_B = crackSvg(true);

const eyeSvg = (flip: boolean) =>
  svg(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><g ${flip ? 'transform="translate(80 0) scale(-1 1)"' : ""}>
  <path d="M2 8 L70 2 L78 20 L36 38 Z" fill="#ff7a1a" stroke="#ffd25a" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M16 12 L62 8 L66 19 L38 29 Z" fill="#fff0a0"/>
  <path d="M42 11 L58 10 L58 20 L44 22 Z" fill="#ff4a10"/>
</g></svg>`,
    { size: 256 },
  );
const EYE_R = eyeSvg(false);
const EYE_L = eyeSvg(true);

const FLAME = svg(
  `<svg viewBox="0 0 48 96" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff0a8"/><stop offset="0.45" stop-color="#ffa020"/><stop offset="1" stop-color="#e0300c"/></linearGradient></defs>
  <path d="M24 0 C28 20 44 34 42 60 C41 82 32 94 24 96 C14 94 6 82 6 62 C6 46 16 40 17 26 C20 32 22 34 24 34 C21 22 22 10 24 0Z" fill="url(#g)"/>
  <path d="M24 44 C28 56 34 62 32 76 C31 86 27 92 24 93 C20 92 16 86 16 76 C16 68 22 64 23 58Z" fill="#fff6c8" opacity="0.8"/>
</svg>`,
  { size: 128 },
);

const RUNES = svg(
  `<svg viewBox="0 0 120 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#ffc94a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <path d="M8 4 L8 20 M8 12 L16 6"/><path d="M26 4 L36 12 L26 20 M36 4 L36 20"/><path d="M46 20 L46 4 L56 12 L46 12"/>
  <path d="M66 4 L76 4 L66 20 L76 20"/><path d="M86 20 L86 6 M86 12 L96 4 M86 12 L96 20"/><path d="M106 4 L106 20 M102 12 L112 12"/></g></svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------

type V = [number, number, number];
const V3 = (a: V) => new THREE.Vector3(a[0], a[1], a[2]);

export default function build() {
  const b = createBuilder({ name: "lava_golem" });
  const R = rng(11);

  // --- Skeleton -------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.45, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.45, 0],
      [0, 1.95, 0.05],
      [0, 2.4, 0.12],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[1];
  const upper = spine.joints[2];
  const neck = b.joint("neck", { parent: upper, at: [0, 2.5, 0.16], dir: [0, 1, 0.35], role: "neck" });
  const HC: V = [0, 2.86, 0.34];
  const head = b.joint("head", { parent: neck, at: [0, 2.72, 0.24], dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, HC[1] - 0.15, HC[2] - 0.12], aim: [0, HC[1] - 0.15, HC[2] + 0.3], role: "jaw" });

  // --- Helpers --------------------------------------------------------------------------------------------------
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const hex = (rt: number, rb: number, h: number) => new THREE.CylinderGeometry(rt, rb, h, 6);

  /** hex column from a base point along a direction */
  const column = (bone: any, base: V, dir: V, len: number, rb: number, rt: number, color: any) => {
    const d = V3(dir).normalize();
    const c = V3(base).addScaledVector(d, len / 2);
    return b.part(hex(rt, rb, len), color, { bone, at: [c.x, c.y, c.z], dir: [d.x, d.y, d.z], flat: true });
  };

  /** trapezoid plate with explicit orientation (pitch/yaw degrees); returns frame data for decals */
  const fplate = (
    bone: any,
    at: V,
    w: number,
    h: number,
    th: number,
    o: { pitch?: number; yaw?: number; taper?: number; color?: any; bevel?: number } = {},
  ) => {
    const taper = o.taper ?? 0.8;
    const e = new THREE.Euler(((o.pitch ?? 0) * Math.PI) / 180, ((o.yaw ?? 0) * Math.PI) / 180, 0, "YXZ");
    const x = new THREE.Vector3(1, 0, 0).applyEuler(e);
    const y = new THREE.Vector3(0, 1, 0).applyEuler(e);
    const n = x.clone().cross(y).normalize();
    const part = b.extrude(
      [
        [-w / 2, -h / 2],
        [w / 2, -h / 2],
        [(w * taper) / 2, h / 2],
        [(-w * taper) / 2, h / 2],
      ],
      {
        at,
        x: [x.x, x.y, x.z],
        y: [y.x, y.y, y.z],
        thickness: th,
        bevel: o.bevel ?? th * 0.3,
        color: o.color ?? BASALT,
        bone,
      },
    );
    return { part, at: V3(at), n, y, th, w, h };
  };

  /** a glowing crack drawing laid flat on a plate */
  const crack = (pl: ReturnType<typeof fplate>, tex: THREE.Texture, scale = 0.9) => {
    const c = pl.at.clone().addScaledVector(pl.n, pl.th / 2 + 0.006);
    const s = Math.min(pl.w, pl.h) * scale;
    const p = b.part(new THREE.PlaneGeometry(s, s), "#ffffff", {
      bone: (pl.part as any).bone ?? undefined,
      at: [c.x, c.y, c.z],
      dir: [pl.n.x, pl.n.y, pl.n.z],
      axis: "z",
      up: [pl.y.x, pl.y.y, pl.y.z],
      texture: tex,
    });
    return glow(p, 1.3);
  };

  /** ring of box plates around a segment a→bp (hex gauntlet look) */
  const wrap = (
    bone: any,
    a: V,
    bp: V,
    rad: number,
    n: number,
    th: number,
    t0: number,
    t1: number,
    color: any,
    phase = 0,
  ) => {
    const A = V3(a);
    const axis = V3(bp).sub(A);
    const len = axis.length();
    axis.normalize();
    const ref = Math.abs(axis.y) > 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
    const e1 = ref.clone().addScaledVector(axis, -ref.dot(axis)).normalize();
    const e2 = axis.clone().cross(e1);
    const parts = [];
    for (let i = 0; i < n; i++) {
      const ang = phase + (i / n) * Math.PI * 2;
      const out = e1.clone().multiplyScalar(Math.cos(ang)).addScaledVector(e2, Math.sin(ang));
      const mid = A.clone().addScaledVector(axis, len * (t0 + t1) * 0.5).addScaledVector(out, rad);
      const w = 2 * rad * Math.tan(Math.PI / n) * 0.92;
      parts.push(
        b.part(box(w, len * (t1 - t0), th), color, {
          bone,
          at: [mid.x, mid.y, mid.z],
          quat: aim(axis, out),
          flat: true,
        }),
      );
    }
    return parts;
  };

  const loopPath = (cx: number, cy: number, cz: number, rx: number, rz: number, n = 12) => {
    const pts: V[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([cx + Math.sin(a) * rx, cy, cz + Math.cos(a) * rz]);
    }
    return catmull(pts, { closed: true });
  };

  const flames = (bone: any, pts: V[], size: [number, number], lean = 0) => {
    const meshes = b.cards(
      pts.map((p) => frame(p, [0, 1, 0])),
      FLAME,
      { size, lean, cross: true, bone, vary: 0.35, spin: 25, rng: R, sink: 0.05 },
    );
    glow(meshes, 1.2);
  };

  // --- Torso ----------------------------------------------------------------------------------------------------
  // molten core body visible through the gaps
  glow(
    b.sweep(spine, (t) => [0.52 + 0.2 * t, 0.34 + 0.1 * t], { color: LAVA_DEEP, section: { ngon: 8 }, caps: "round" }),
    1.1,
  );
  // pelvis
  b.part(box(1.0, 0.3, 0.6), BASALT, { bone: hips, at: [0, 1.38, 0], flat: true });
  glow(b.part(box(0.8, 0.06, 0.62), LAVA, { bone: hips, at: [0, 1.22, 0] }), 1.0);
  for (const s of [1, -1]) {
    b.part(box(0.34, 0.34, 0.62), BASALT_L, { bone: hips, at: [s * 0.58, 1.38, 0], flat: true });
    // tassets
    fplate(hips, [s * 0.42, 1.12, 0.36], 0.34, 0.5, 0.07, { pitch: -12, yaw: s * 14, taper: 0.7, color: BASALT_L });
  }
  const loin = fplate(hips, [0, 1.12, 0.4], 0.38, 0.55, 0.08, { pitch: -10, taper: 0.65, color: BASALT });
  crack(loin, CRACK_A, 0.8);
  // belt rings with gold
  b.sweep(loopPath(0, 1.56, 0.02, 0.66, 0.5), 0.045, { color: GOLD, bone: hips });
  glow(b.sweep(loopPath(0, 1.5, 0.02, 0.64, 0.48), 0.03, { color: LAVA, bone: hips }), 1.2);
  glow(b.part(new THREE.PlaneGeometry(0.2, 0.05), "#ffffff", { bone: hips, at: [0, 1.57, 0.545], dir: [0, 0, 1], axis: "z", texture: RUNES }), 1.2);

  // abdomen plates, three per row
  [1.72, 1.93].forEach((y, row) => {
    const w = 0.6 + row * 0.08;
    const front = fplate(chest, [0, y, 0.44 + row * 0.03], w, 0.2, 0.09, { pitch: -4, taper: 0.9, color: row ? BASALT_L : BASALT });
    if (row === 0) crack(front, CRACK_B, 0.8);
    for (const s of [1, -1]) {
      fplate(chest, [s * (0.5 + row * 0.06), y, 0.3 + row * 0.03], 0.44, 0.2, 0.09, { yaw: s * 52, taper: 0.9, color: BASALT });
    }
  });
  // ribs on flanks and spine-side plates
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      fplate(chest, [s * 0.66, 1.72 + i * 0.2, 0.06], 0.4, 0.16, 0.07, { yaw: s * 90, taper: 0.85, color: BASALT_L });
    }
  }

  // chest: pecs, core, collar
  const coreAt: V = [0, 2.28, 0.58];
  for (const s of [1, -1]) {
    const pec = fplate(upper, [s * 0.5, 2.3, 0.56], 0.5, 0.5, 0.13, { pitch: -8, yaw: s * 14, taper: 0.88, color: BASALT_L, bevel: 0.04 });
    crack(pec, s > 0 ? CRACK_A : CRACK_B, 0.85);
    fplate(upper, [s * 0.46, 2.62, 0.4], 0.5, 0.2, 0.1, { pitch: -28, yaw: s * 16, taper: 0.8, color: BASALT });
    // gold rim over pec
    b.part(box(0.46, 0.03, 0.03), GOLD, { bone: upper, at: [s * 0.5, 2.56, 0.64], rotation: [0, s * 14, 0] });
  }
  // core frame: hex ring of plates
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const px = Math.sin(a) * 0.28;
    const py = Math.cos(a) * 0.28;
    b.part(box(0.17, 0.1, 0.1), GOLD, {
      bone: upper,
      at: [coreAt[0] + px, coreAt[1] + py, coreAt[2] + 0.02],
      rotation: [0, 0, (-a * 180) / Math.PI],
      flat: true,
    });
  }
  glow(b.part(new THREE.IcosahedronGeometry(0.21, 1), HOT, { bone: upper, at: coreAt, scale: [1, 1, 0.65], flat: true }), 1.6);
  glow(
    b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone: upper, at: [0, 2.28, 0.738], dir: [0, 0, 1], axis: "z", texture: EMBLEM }),
    1.5,
  );
  // collar / gorget
  b.sweep(loopPath(0, 2.55, 0.1, 0.5, 0.4), 0.07, { color: BASALT, bone: upper });
  glow(b.sweep(loopPath(0, 2.5, 0.1, 0.52, 0.42), 0.03, { color: LAVA, bone: upper }), 1.2);
  b.sweep(loopPath(0, 2.6, 0.1, 0.5, 0.4), 0.025, { color: GOLD, bone: upper });

  // back: dorsal plates and columns
  for (let i = 0; i < 3; i++) {
    const bp = fplate(i === 0 ? chest : upper, [0, 1.85 + i * 0.34, -0.42 - i * 0.02], 0.9 - i * 0.12, 0.34, 0.1, {
      pitch: 14,
      yaw: 180,
      taper: 0.85,
      color: i % 2 ? BASALT_L : BASALT,
    });
    if (i === 1) crack(bp, CRACK_A, 0.8);
  }
  const spikes: [number, number, number, number][] = [
    [0, 2.3, -0.5, 0.75],
    [0.3, 2.15, -0.46, 0.55],
    [-0.3, 2.15, -0.46, 0.55],
    [0.55, 2.0, -0.38, 0.4],
    [-0.55, 2.0, -0.38, 0.4],
    [0, 1.85, -0.52, 0.45],
  ];
  for (const [x, y, z, l] of spikes) {
    column(upper, [x, y, z], [x * 0.5, 0.8, -0.65], l, 0.1, 0.045, OBS);
    glow(
      b.part(hex(0.102, 0.102, 0.03), LAVA, { bone: upper, at: [x, y + 0.015, z - 0.01], dir: [x * 0.5, 0.8, -0.65] }),
      1.2,
    );
  }
  flames(
    upper,
    [
      [0, 2.62, -0.46],
      [0.22, 2.55, -0.44],
      [-0.22, 2.55, -0.44],
    ],
    [0.28, 0.6],
  );

  // --- Head -----------------------------------------------------------------------------------------------------
  const at = (dx: number, dy: number, dz: number): V => [HC[0] + dx, HC[1] + dy, HC[2] + dz];
  b.part(box(0.62, 0.38, 0.52), BASALT_L, { bone: head, at: at(0, 0, 0), flat: true });
  b.part(box(0.72, 0.1, 0.22), OBS, { bone: head, at: at(0, 0.17, 0.25), rotation: [-12, 0, 0], flat: true });
  b.part(box(0.5, 0.04, 0.05), GOLD, { bone: head, at: at(0, 0.215, 0.33) });
  glow(b.part(new THREE.OctahedronGeometry(0.06, 0), HOT, { bone: head, at: at(0, 0.12, 0.28), scale: [0.8, 1.3, 0.6] }), 1.6);
  for (const s of [1, -1]) {
    b.part(box(0.14, 0.28, 0.32), BASALT, { bone: head, at: at(s * 0.37, -0.04, 0.08), flat: true });
    b.part(box(0.1, 0.1, 0.12), GOLD, { bone: head, at: at(s * 0.41, 0.02, 0.2), flat: true });
    glow(b.part(box(0.16, 0.025, 0.1), LAVA, { bone: head, at: at(s * 0.37, -0.14, 0.1) }), 1.2);
    // eyes
    glow(
      b.part(new THREE.PlaneGeometry(0.2, 0.1), "#ffffff", {
        bone: head,
        at: at(s * 0.17, 0.04, 0.267),
        dir: [0, 0, 1],
        axis: "z",
        texture: s > 0 ? EYE_L : EYE_R,
        rotation: undefined,
      }),
      1.8,
    );
    // horn columns swept back
    column(head, at(s * 0.26, 0.17, -0.05), [s * 0.45, 0.65, -0.6], 0.5, 0.09, 0.035, OBS);
    column(head, at(s * 0.14, 0.18, -0.15), [s * 0.2, 0.8, -0.55], 0.62, 0.09, 0.03, BASALT);
  }
  column(head, at(0, 0.19, -0.1), [0, 0.85, -0.5], 0.75, 0.11, 0.035, OBS);
  // upper lip + teeth
  b.part(box(0.46, 0.1, 0.18), BASALT, { bone: head, at: at(0, -0.15, 0.24), flat: true });
  glow(b.part(box(0.4, 0.14, 0.34), "#d8380e", { bone: head, at: at(0, -0.2, 0.08) }), 1.3);
  for (let i = 0; i < 5; i++) {
    const x = -0.18 + i * 0.09;
    b.part(new THREE.ConeGeometry(0.026, 0.08, 4), TOOTH, { bone: head, at: at(x, -0.24, 0.325), dir: [0, -1, 0] });
  }
  // lower jaw (on the jaw bone)
  b.part(box(0.5, 0.11, 0.4), BASALT, { bone: jaw, at: at(0, -0.23, 0.1), flat: true });
  b.part(box(0.4, 0.15, 0.1), OBS, { bone: jaw, at: at(0, -0.28, 0.3), flat: true });
  glow(b.part(box(0.36, 0.03, 0.3), LAVA, { bone: jaw, at: at(0, -0.17, 0.1) }), 1.3);
  for (let i = 0; i < 4; i++) {
    const x = -0.135 + i * 0.09;
    b.part(new THREE.ConeGeometry(0.026, 0.08, 4), TOOTH, { bone: jaw, at: at(x, -0.15, 0.27), dir: [0, 1, 0] });
  }
  for (const s of [1, -1]) column(jaw, at(s * 0.2, -0.26, 0.28), [s * 0.4, 0.6, 0.7], 0.14, 0.05, 0.02, TOOTH);
  // flame crest
  flames(head, [at(0, 0.2, -0.2), at(0.15, 0.2, -0.22), at(-0.15, 0.2, -0.22), at(0, 0.18, -0.02)], [0.22, 0.5]);
  // neck
  b.part(hex(0.2, 0.26, 0.28), BASALT, { bone: neck, at: [0, 2.58, 0.15], flat: true });
  glow(b.part(hex(0.19, 0.19, 0.05), LAVA, { bone: neck, at: [0, 2.68, 0.19] }), 1.0);

  // --- Arms -----------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh: V = [s * 1.05, 2.45, 0.0];
    const el: V = [s * 1.3, 1.75, 0.05];
    const wr: V = [s * 1.36, 1.05, 0.25];
    const arm = b.chain(`arm${S}`, catmull([sh, el, wr]), {
      parent: upper,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const [jS, jE, jW] = [arm.joints[0], arm.joints[1], arm.joints[2]];
    glow(b.sweep(arm, [0.24, 0.2, 0.22], { color: LAVA_DEEP, section: { ngon: 8 }, caps: "round" }), 1.1);
    // pauldron: three stacked hex slabs and spikes
    [0.36, 0.3, 0.23].forEach((r, i) => {
      b.part(hex(r, r + 0.03, 0.11), i % 2 ? BASALT_L : BASALT, {
        bone: jS,
        at: [s * (1.12 + i * 0.03), 2.6 + i * 0.12, 0],
        rotation: [0, 0, -s * 14],
        flat: true,
      });
      glow(b.part(hex(r - 0.02, r - 0.02, 0.025), LAVA, { bone: jS, at: [s * (1.12 + i * 0.03), 2.545 + i * 0.12, 0], rotation: [0, 0, -s * 14] }), 1.1);
    });
    b.sweep(loopPath(s * 1.14, 2.58, 0, 0.36, 0.36, 10), 0.025, { color: GOLD, bone: jS });
    column(jS, [s * 1.2, 2.88, 0], [s * 0.35, 1, -0.2], 0.5, 0.1, 0.035, OBS);
    column(jS, [s * 1.38, 2.68, 0.1], [s * 0.9, 0.5, 0.3], 0.4, 0.08, 0.03, OBS);
    column(jS, [s * 1.3, 2.7, -0.15], [s * 0.7, 0.55, -0.5], 0.42, 0.08, 0.03, OBS);
    flames(jS, [[s * 1.1, 2.9, 0.08], [s * 1.0, 2.88, -0.1]], [0.24, 0.55]);
    // upper arm armour
    wrap(jS, sh, el, 0.29, 6, 0.1, 0.18, 0.5, BASALT);
    wrap(jS, sh, el, 0.29, 6, 0.1, 0.56, 0.92, BASALT_L, Math.PI / 6);
    // elbow
    b.part(hex(0.2, 0.22, 0.22), OBS, { bone: jE, at: [s * 1.3, 1.75, 0.05], rotation: [0, 0, 90], flat: true });
    column(jE, [s * 1.46, 1.74, -0.06], [s * 0.6, 0.2, -1], 0.4, 0.09, 0.03, OBS);
    // forearm gauntlet
    wrap(jE, el, wr, 0.31, 6, 0.12, 0.08, 0.42, BASALT_L, Math.PI / 6);
    wrap(jE, el, wr, 0.34, 6, 0.13, 0.5, 0.92, BASALT);
    // runes + gold cuff
    b.sweep(loopPath(s * 1.345, 1.2, 0.2, 0.37, 0.37, 10), 0.03, { color: GOLD, bone: jE });
    glow(
      b.part(new THREE.PlaneGeometry(0.34, 0.07), "#ffffff", {
        bone: jE,
        at: [s * 1.33 + s * 0.0, 1.46, 0.045 + 0.38 * 0 + 0.18],
        dir: [s * 0.2, 0, 1],
        axis: "z",
        texture: RUNES,
      }),
      1.2,
    );
    // fist
    b.part(box(0.46, 0.3, 0.32), BASALT, { bone: jW, at: [s * 1.36, 0.86, 0.26], flat: true });
    b.part(box(0.5, 0.06, 0.36), GOLD, { bone: jW, at: [s * 1.36, 1.0, 0.26] });
    glow(b.part(box(0.44, 0.025, 0.3), LAVA, { bone: jW, at: [s * 1.36, 0.7, 0.26] }), 1.1);
    // fingers
    const W = wr;
    const base: V[] = [];
    [-0.165, -0.055, 0.055, 0.165].forEach((ox, i) => {
      const y0 = W[1] - 0.52;
      const pts: V[] = [
        [W[0] + ox, y0, W[2] + 0.05],
        [W[0] + ox * 1.15, y0 - 0.17, W[2] + 0.08],
        [W[0] + ox * 1.3, y0 - 0.32, W[2] + 0.16],
      ];
      base.push(pts[0]);
      digit(`index${i}${S}`, pts, jW);
    });
    digit(
      `thumb${S}`,
      [
        [W[0] - s * 0.22, W[1] - 0.46, W[2] + 0.1],
        [W[0] - s * 0.32, W[1] - 0.62, W[2] + 0.18],
        [W[0] - s * 0.38, W[1] - 0.76, W[2] + 0.28],
      ],
      jW,
    );
  }

  function digit(name: string, pts: V[], parent: any) {
    const ch = b.chain(name, catmull(pts), { parent, names: [`${name}1`, `${name}2`, `${name}3`], role: "digit" });
    b.sweep(ch, [0.062, 0.044], { color: BASALT, section: { ngon: 6 }, caps: "flat" });
    const d = V3(pts[2]).sub(V3(pts[1])).normalize();
    b.part(hex(0.07, 0.07, 0.04), GOLD, { bone: ch.joints[1], at: pts[1], dir: [d.x, d.y, d.z] });
    glow(b.spike(pts[2], [d.x, d.y, d.z], 0.12, 0.048, { color: HOT, bone: ch.tip ?? ch.joints[2] }), 1.4);
  }

  // --- Legs -----------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hp: V = [s * 0.5, 1.5, 0.0];
    const kn: V = [s * 0.55, 0.85, 0.18];
    const an: V = [s * 0.56, 0.3, 0.0];
    const leg = b.chain(`leg${S}`, catmull([hp, kn, an]), { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" });
    const [jH, jK, jA] = [leg.joints[0], leg.joints[1], leg.joints[2]];
    glow(b.sweep(leg, [0.27, 0.23, 0.22], { color: LAVA_DEEP, section: { ngon: 8 }, caps: "round" }), 1.1);
    wrap(jH, hp, kn, 0.33, 6, 0.12, 0.1, 0.46, BASALT_L);
    wrap(jH, hp, kn, 0.34, 6, 0.12, 0.52, 0.94, BASALT, Math.PI / 6);
    const thigh = fplate(jH, [s * 0.54, 1.2, 0.52], 0.4, 0.36, 0.08, { pitch: 10, taper: 0.8, color: BASALT_L });
    crack(thigh, s > 0 ? CRACK_A : CRACK_B, 0.85);
    // knee cap
    b.part(hex(0.22, 0.25, 0.2), OBS, { bone: jK, at: [s * 0.55, 0.88, 0.36], rotation: [90, 0, 0], flat: true });
    column(jK, [s * 0.55, 0.88, 0.44], [0, 0.1, 1], 0.3, 0.09, 0.03, OBS);
    glow(b.part(hex(0.12, 0.12, 0.03), LAVA, { bone: jK, at: [s * 0.55, 0.88, 0.37], rotation: [90, 0, 0] }), 1.4);
    // shin
    wrap(jK, kn, an, 0.31, 6, 0.12, 0.08, 0.44, BASALT, Math.PI / 6);
    wrap(jK, kn, an, 0.33, 6, 0.13, 0.5, 0.92, BASALT_L);
    b.sweep(loopPath(s * 0.555, 0.58, 0.1, 0.36, 0.36, 10), 0.025, { color: GOLD, bone: jK });
    // foot
    b.part(box(0.56, 0.28, 0.84), SCORCH, { bone: jA, at: [s * 0.56, 0.14, 0.14], flat: true });
    b.part(box(0.6, 0.06, 0.5), GOLD, { bone: jA, at: [s * 0.56, 0.31, 0.12] });
    glow(b.part(box(0.5, 0.03, 0.04), LAVA, { bone: jA, at: [s * 0.56, 0.29, 0.38] }), 1.2);
    for (let i = -1; i <= 1; i++) {
      column(jA, [s * 0.56 + i * 0.19, 0.12, 0.5], [i * 0.15, 0, 1], 0.3, 0.1, 0.07, BASALT_L);
      glow(b.part(new THREE.ConeGeometry(0.055, 0.1, 6), HOT, { bone: jA, at: [s * 0.56 + i * 0.19 + i * 0.045, 0.12, 0.84], dir: [i * 0.15, 0, 1] }), 1.3);
    }
    b.part(box(0.5, 0.36, 0.2), BASALT, { bone: jA, at: [s * 0.56, 0.3, -0.22], flat: true });
  }

  return b.root;
}
```