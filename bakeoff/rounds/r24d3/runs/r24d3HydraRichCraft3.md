```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  limb,
  catmull,
  bezier,
  paint,
  mottle,
  scales,
  countershade,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Hydra of the Broken Oath",
  description:
    "A five-headed, war-scarred hydra in a God of War mood: ash-green hide, red war paint, Greek-key bronze collars, ember cracks and runes, and the spears, swords and a Spartan shield of dead heroes buried in its back.",
};

type B = ReturnType<typeof createBuilder>;
type J = ReturnType<B["joint"]>;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- palette
const HEAD_DARK = "#252a23";
const SKIN_MID = "#3b4337";
const SKIN_DARK = "#2b3027";
const HORN = "#2b2724";
const BONE = "#cbbf9c";
const TOOTH = "#d8ccaa";
const CLAW = "#3a332c";
const BRONZE = "#a9742f";
const BRONZE_D = "#6b4519";
const IRON = "#4a4c54";
const IRON_L = "#8a8d98";
const WOOD = "#5a3f26";
const WOOD_L = "#8a6a44";
const LEATHER = "#3a2418";
const RED = "#8f1d16";
const RED_D = "#5c110d";
const EMBER = "#ff6a1a";
const MOUTH = "#4a0f0c";
const TONGUE = "#8a2a22";

// ---------------------------------------------------------------- paints
const SCALE = scales(["#3b4337", "#333a30", "#434a3c", "#2c332b"], "#141712", { size: 0.075, width: 0.16, seed: 2 });
const BELLY = scales(["#8c7f5c", "#7a6e50", "#968867"], "#3a3220", { size: 0.1, width: 0.2, seed: 4 });
const HIDE = countershade(mottle(SCALE, "#5a6150", { size: 0.4, seed: 5, contrast: 0.6 }), BELLY, {
  level: -0.3,
  soft: 0.25,
});
const HEADP = countershade(mottle("#313830", "#4b5343", { size: 0.18, seed: 8 }), "#7e7253", {
  level: -0.45,
  soft: 0.2,
});
const JAWP = mottle("#3d3a2e", "#6e6446", { size: 0.15, seed: 9 });

// war-paint slashes across the sides of a neck
const neckPaint = (seed: number) =>
  paint((_p, _n, s) => {
    const u = s[0] * 10 + seed;
    const k = Math.floor(u);
    const f = u - k;
    const a = ((s[1] % 360) + 360) % 360;
    const side = (a > 35 && a < 150) || (a > 210 && a < 325);
    if (side && (k * 7 + seed) % 3 === 0 && f > 0.4 && f < 0.52) return RED;
    return HIDE;
  });

// ribbed membrane of the jaw frills
const FRILLP = paint((_p, _n, s) => {
  const ang = Math.atan2(s[1], s[0]);
  const f = (((ang / 0.2) % 1) + 1) % 1;
  return Math.abs(f - 0.5) < 0.1 ? RED_D : RED;
});

// ---------------------------------------------------------------- textures
const eyeTex = (iris: string, rim: string) =>
  svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="g" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="#fff2a0"/><stop offset="0.55" stop-color="${iris}"/><stop offset="1" stop-color="${rim}"/></radialGradient></defs>
    <circle cx="32" cy="32" r="31.5" fill="#1a0a05"/>
    <circle cx="32" cy="32" r="27" fill="url(#g)"/>
    <ellipse cx="32" cy="32" rx="5.5" ry="23" fill="#0b0504"/>
    <circle cx="23" cy="22" r="4" fill="#ffffff"/>
  </svg>`,
    { size: 128 },
  );

const TEX = {
  eye: eyeTex("#ffb020", "#e0480c"),
  blind: svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="31.5" fill="#2a2420"/>
    <circle cx="32" cy="32" r="27" fill="#bfbdad"/>
    <circle cx="35" cy="34" r="13" fill="#8d8f86"/>
    <circle cx="35" cy="34" r="5" fill="#4a4c48"/>
    <path d="M5 13 L60 52" stroke="#5c110d" stroke-width="5.5" fill="none" stroke-linecap="round"/>
    <path d="M7 11 L61 50" stroke="#d9c8b0" stroke-width="1.4" fill="none"/>
  </svg>`,
    { size: 128 },
  ),
  key16: keyTex(16, 1024),
  key8: keyTex(8, 512),
  shield: svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="63.5" fill="#4a2f14"/>
    <circle cx="64" cy="64" r="60" fill="#9a6b2e"/>
    <circle cx="64" cy="64" r="52" fill="#7d1a14"/>
    <circle cx="64" cy="64" r="52" fill="none" stroke="#c99a4a" stroke-width="2"/>
    <path d="M32 100 L64 28 L96 100" stroke="#3a2008" stroke-width="18" fill="none" stroke-linejoin="miter"/>
    <path d="M32 100 L64 28 L96 100" stroke="#d9a84e" stroke-width="12" fill="none" stroke-linejoin="miter"/>
    <path d="M32 100 L64 28" stroke="#f4d58a" stroke-width="3" fill="none"/>
    <circle cx="104" cy="92" r="24" fill="#000000" opacity="0.35"/>
    <path d="M64 4 L58 30 L70 48 L60 70 L72 90 L66 124" stroke="#140c08" stroke-width="3" fill="none"/>
    <path d="M20 40 L34 46 L30 60" stroke="#140c08" stroke-width="2.4" fill="none"/>
    <ellipse cx="36" cy="30" rx="7" ry="4" fill="#3a0c08" opacity="0.7"/>
  </svg>`,
    { size: 256 },
  ),
  rune: svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g stroke="#ff5a10" stroke-width="10" opacity="0.55">
      <path d="M32 6 V38 M32 12 L48 22 L32 32"/>
      <path d="M18 54 L46 84 M46 54 L18 84 M32 50 V88"/>
      <path d="M32 98 V124 M32 98 L18 110 M32 110 L18 122 M32 98 L46 110"/>
    </g>
    <g stroke="#ffd27a" stroke-width="4">
      <path d="M32 6 V38 M32 12 L48 22 L32 32"/>
      <path d="M18 54 L46 84 M46 54 L18 84 M32 50 V88"/>
      <path d="M32 98 V124 M32 98 L18 110 M32 110 L18 122 M32 98 L46 110"/>
    </g>
  </svg>`,
    { size: 256 },
  ),
  crack: svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g stroke="#ff4a0a" stroke-width="7" opacity="0.6">
      <path d="M64 4 L58 26 L70 40 L55 62 L66 78 L52 98 L60 124 M70 40 L90 52 L104 74 M55 62 L36 70 L20 92 M66 78 L84 96 L88 118"/>
    </g>
    <g stroke="#ffc060" stroke-width="2.6">
      <path d="M64 4 L58 26 L70 40 L55 62 L66 78 L52 98 L60 124 M70 40 L90 52 L104 74 M55 62 L36 70 L20 92 M66 78 L84 96 L88 118"/>
    </g>
  </svg>`,
    { size: 256 },
  ),
  war: svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g fill="${RED}">
      <path d="M8 3 Q14 1 18 6 L30 61 L24 59Z"/>
      <path d="M26 2 Q32 0 36 5 L46 62 L40 60Z"/>
      <path d="M44 4 Q50 2 54 7 L62 58 L56 57Z"/>
    </g>
  </svg>`,
    { size: 128 },
  ),
  cloth: svg(
    `<svg viewBox="0 0 48 96" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 0 H46 L46 70 L40 62 L36 90 L30 66 L24 96 L18 64 L12 84 L6 62 L2 70Z" fill="#7d1a14" stroke="#2a0a08" stroke-width="1.5"/>
    <rect x="2" y="9" width="44" height="5" fill="#c99a4a"/>
    <path d="M14 20 L12 60 M26 20 L28 66 M38 20 L36 56" stroke="#4a0e0a" stroke-width="1.6" fill="none"/>
  </svg>`,
    { size: 192 },
  ),
};

// Greek-key band, N units around
function keyTex(N: number, size: number) {
  let d = "";
  for (let i = 0; i < N; i++) {
    const x = i * 10;
    d += `M${x + 1} 11 V3 H${x + 9} V9 H${x + 4} V6 H${x + 6.5} M${x + 9} 9 V11 H${x + 11} `;
  }
  const W = N * 10;
  return svg(
    `<svg viewBox="0 0 ${W} 14" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="14" fill="#b9833a"/>
    <rect width="${W}" height="1.6" fill="#6b4519"/>
    <rect y="12.4" width="${W}" height="1.6" fill="#6b4519"/>
    <path d="${d}" stroke="#3b230c" stroke-width="1.5" fill="none"/>
    <path d="${d}" transform="translate(0,-0.5)" stroke="#e3b765" stroke-width="0.5" fill="none"/>
  </svg>`,
    { size },
  );
}

// ---------------------------------------------------------------- helpers
function prof(keys: [number, number][]) {
  return (t: number) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, v0] = keys[i - 1];
        const [t1, v1] = keys[i];
        const k = (t - t0) / (t1 - t0);
        return v0 + (v1 - v0) * k * k * (3 - 2 * k);
      }
    }
    return keys[keys.length - 1][1];
  };
}

const frillOutline = (k: number): [number, number][] =>
  (
    [
      [0, 0],
      [0.3, 0.1],
      [0.28, 0.02],
      [0.45, -0.05],
      [0.3, -0.08],
      [0.38, -0.2],
      [0.12, -0.12],
    ] as [number, number][]
  ).map(([x, y]) => [x * k, y * k] as [number, number]);

const BLADE: [number, number][] = [
  [-0.05, 0],
  [0.05, 0],
  [0.05, 0.5],
  [0.02, 0.58],
  [0, 0.5],
  [-0.03, 0.62],
  [-0.05, 0.45],
];

type HeadSpec = {
  id: string;
  hs: number;
  open: number;
  seed: number;
  pts: number[][];
  look: [number, number, number];
  blind?: boolean;
  broken?: boolean;
};

// ---------------------------------------------------------------- one head
function buildHead(b: B, spec: HeadSpec, neckEnd: J, P: THREE.Vector3, F0: THREE.Vector3) {
  const hs = spec.hs;
  const F = F0.clone().normalize();
  const U = V(0, 1, 0).addScaledVector(F, -F.y).normalize();
  const Lf = new THREE.Vector3().crossVectors(U, F).normalize();
  const h = (f: number, u: number, l: number) =>
    P.clone()
      .addScaledVector(F, f * hs)
      .addScaledVector(U, u * hs)
      .addScaledVector(Lf, l * hs);

  const hd = b.joint(`head${spec.id}`, { parent: neckEnd, at: P, dir: F, role: "head" });
  const jaw = b.joint(`jaw${spec.id}`, { parent: hd, at: h(0, -0.11, 0), aim: h(0.82, -0.11, 0), role: "jaw" });

  // skull, snout, nose pad
  const skull = b.frustumBox(h(-0.12, 0.02, 0), h(0.36, 0, 0), [0.36 * hs, 0.3 * hs], [0.28 * hs, 0.24 * hs], {
    bone: hd,
    color: HEADP,
  });
  b.frustumBox(h(0.34, 0, 0), h(0.9, -0.02, 0), [0.27 * hs, 0.2 * hs], [0.2 * hs, 0.13 * hs], {
    bone: hd,
    color: HEADP,
  });
  b.frustumBox(h(0.88, -0.01, 0), h(0.98, -0.015, 0), [0.2 * hs, 0.13 * hs], [0.22 * hs, 0.11 * hs], {
    bone: hd,
    color: HEAD_DARK,
  });
  // lower jaw, tongue, palate
  b.frustumBox(h(0, -0.11, 0), h(0.84, -0.115, 0), [0.3 * hs, 0.09 * hs], [0.17 * hs, 0.07 * hs], {
    bone: jaw,
    color: JAWP,
  });
  b.frustumBox(h(0.08, -0.076, 0), h(0.7, -0.074, 0), [0.14 * hs, 0.02 * hs], [0.07 * hs, 0.015 * hs], {
    bone: jaw,
    color: TONGUE,
  });
  b.frustumBox(h(0.3, -0.096, 0), h(0.85, -0.094, 0), [0.22 * hs, 0.01 * hs], [0.13 * hs, 0.01 * hs], {
    bone: hd,
    color: MOUTH,
  });
  glow(b.part(new THREE.SphereGeometry(0.05 * hs, 6, 4), EMBER, { bone: hd, at: h(0.34, -0.1, 0), flat: true }), 1.6);

  // nostrils
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.032 * hs, 5, 4), HEAD_DARK, { bone: hd, at: h(0.85, 0.045, s * 0.058), flat: true });
  }

  // teeth
  const down = U.clone().multiplyScalar(-1);
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const f = 0.42 + i * 0.1;
      const half = ((0.27 - ((f - 0.34) / 0.56) * 0.07) / 2 - 0.012) * 1;
      const big = i === 1;
      b.spike(
        h(f, -0.07, s * half),
        down.clone().addScaledVector(Lf, s * 0.12),
        (big ? 0.17 : 0.09) * hs,
        (big ? 0.026 : 0.017) * hs,
        { color: TOOTH, bone: hd, sides: 5 },
      );
    }
    for (let i = 0; i < 4; i++) {
      const f = 0.38 + i * 0.12;
      const half = (0.3 - (f / 0.84) * 0.13) / 2 - 0.014;
      const big = i === 2;
      b.spike(
        h(f, -0.085, s * half),
        U.clone().addScaledVector(Lf, -s * 0.1),
        (big ? 0.14 : 0.08) * hs,
        (big ? 0.024 : 0.016) * hs,
        { color: TOOTH, bone: jaw, sides: 5 },
      );
    }
  }
  // chin hooks
  for (const f of [0.52, 0.72]) {
    b.spike(h(f, -0.14, 0), down.clone().addScaledVector(F, 0.5), 0.13 * hs, 0.03 * hs, {
      color: HORN,
      bone: jaw,
      sides: 5,
    });
  }

  // crest of spikes
  for (let i = 0; i < 5; i++) {
    const f = i * 0.12;
    const top = 0.16 - 0.18 * f;
    b.spike(h(f, top - 0.02, 0), U.clone().addScaledVector(F, -0.45), (0.15 - i * 0.017) * hs, (0.045 - i * 0.005) * hs, {
      color: HORN,
      bone: hd,
      sides: 5,
    });
  }

  for (const s of [1, -1]) {
    // eyes
    const E = h(0.22, 0.075, s * 0.135);
    const out = Lf.clone().multiplyScalar(s).addScaledVector(F, 0.35).addScaledVector(U, 0.12).normalize();
    b.part(new THREE.CylinderGeometry(0.06 * hs, 0.068 * hs, 0.045 * hs, 8), HEAD_DARK, { bone: hd, at: E, dir: out });
    const blind = !!spec.blind && s === 1;
    const eye = b.part(new THREE.CircleGeometry(0.046 * hs, 12), "#ffffff", {
      bone: hd,
      at: E.clone().addScaledVector(out, 0.0235 * hs),
      dir: out,
      axis: "z",
      texture: blind ? TEX.blind : TEX.eye,
    });
    if (!blind) glow(eye, 1.5);

    // brow
    b.capsule(h(0.36, 0.14, s * 0.09), h(0.06, 0.165, s * 0.16), 0.032 * hs, { bone: hd, color: HEAD_DARK });

    // great swept horn
    const base = h(0.02, 0.13, s * 0.12);
    const broken = !!spec.broken && s === 1;
    const ctrl = broken ? h(-0.12, 0.2, s * 0.2) : h(-0.22, 0.3, s * 0.24);
    const tip = broken ? h(-0.3, 0.26, s * 0.3) : h(-0.62, 0.28, s * 0.4);
    b.sweep(bezier(base, ctrl, tip), broken ? [0.052 * hs, 0.03 * hs] : [0.052 * hs, 0.004], {
      bone: hd,
      color: HORN,
      bands: broken
        ? [[1, HORN]]
        : [
            [0.7, HORN],
            [1, BONE],
          ],
      caps: { start: "flat", end: broken ? "flat" : "point" },
      sides: 6,
    });
    // cheek horn
    b.sweep(bezier(h(0.05, -0.01, s * 0.16), h(-0.05, -0.02, s * 0.3), h(-0.28, -0.12, s * 0.4)), [0.04 * hs, 0.003], {
      bone: hd,
      color: HORN,
      caps: { start: "flat", end: "point" },
      sides: 6,
    });

    // jaw frill
    const x = F.clone().multiplyScalar(-1);
    const y = U.clone().multiplyScalar(0.45).addScaledVector(Lf, s * 0.85).normalize();
    b.extrude(frillOutline(hs), {
      at: h(0.02, -0.03, s * 0.15),
      x,
      y,
      thickness: 0.016 * hs,
      color: FRILLP,
      bone: hd,
    });
  }

  // war paint across the brow
  b.decal(skull, TEX.war, {
    at: h(0.12, 0.157, 0),
    dir: U,
    up: F,
    size: [0.2 * hs, 0.32 * hs],
    bone: hd,
  });

  b.pose(jaw, { axis: Lf, deg: spec.open });
  return hd;
}

// ---------------------------------------------------------------- the beast
const NECKS: HeadSpec[] = [
  {
    id: "C",
    hs: 1.15,
    open: 20,
    seed: 1,
    pts: [[0, 1.8, 0.9], [0, 2.6, 1.15], [0, 3.4, 1.5], [0, 3.95, 2.2], [0, 3.85, 2.8]],
    look: [0, -0.2, 1],
  },
  {
    id: "L1",
    hs: 0.95,
    open: 8,
    seed: 2,
    blind: true,
    pts: [[0.3, 1.8, 0.9], [0.75, 2.4, 1.2], [1.1, 3.0, 1.6], [1.15, 3.3, 2.3], [1.2, 3.15, 2.85]],
    look: [0.15, -0.25, 1],
  },
  {
    id: "L2",
    hs: 0.85,
    open: 14,
    seed: 3,
    pts: [[0.55, 1.7, 0.8], [1.2, 2.0, 1.1], [1.9, 2.3, 1.5], [2.3, 2.3, 2.2], [2.4, 2.0, 2.7]],
    look: [0.45, -0.45, 1],
  },
  {
    id: "R1",
    hs: 1.0,
    open: 5,
    seed: 4,
    pts: [[-0.3, 1.8, 0.9], [-0.7, 2.5, 1.3], [-1.0, 3.2, 1.5], [-1.1, 3.6, 2.1], [-1.0, 3.55, 2.7]],
    look: [-0.15, -0.2, 1],
  },
  {
    id: "R2",
    hs: 0.85,
    open: 12,
    seed: 5,
    broken: true,
    pts: [[-0.55, 1.7, 0.8], [-1.1, 2.1, 1.0], [-1.7, 2.7, 1.2], [-2.2, 3.1, 1.7], [-2.45, 2.95, 2.3]],
    look: [-0.5, -0.3, 1],
  },
];

export default function build() {
  const b = createBuilder({ name: "hydra" });
  const rand = rng(21);

  // ----- skeleton
  const hips = b.joint("hips", { at: [0, 1.35, -0.6], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 1.35, -0.6], [0, 1.4, 0.1], [0, 1.45, 0.8], [0, 1.5, 1.35]]),
    { parent: hips, role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const tail = b.chain(
    "tail",
    catmull([[0, 1.35, -0.6], [0, 1.25, -1.5], [0.05, 0.95, -2.4], [0.25, 0.5, -3.2], [0.5, 0.1, -3.9]]),
    { parent: hips, role: "tail", count: 6 },
  );

  // ----- torso
  const rxB = prof([[0, 0.42], [0.18, 0.68], [0.5, 0.82], [0.8, 0.78], [1, 0.5]]);
  const ryB = prof([[0, 0.45], [0.18, 0.76], [0.5, 0.86], [0.8, 0.8], [1, 0.55]]);
  const body = b.sweep(
    catmull([[0, 1.3, -1.45], [0, 1.35, -0.6], [0, 1.4, 0.1], [0, 1.45, 0.8], [0, 1.5, 1.45]]),
    (t: number) => [rxB(t), ryB(t)] as [number, number],
    { bone: [tail, hips, spine], color: HIDE, shift: [0, -0.08] },
  );
  const hump = b.part(new THREE.SphereGeometry(1, 10, 8), HIDE, {
    bone: chest,
    at: [0, 1.9, 0.95],
    scale: [0.95, 0.62, 0.75],
    flat: true,
  });

  // ----- tail
  const tailTube = b.sweep(tail, prof([[0, 0.44], [0.3, 0.3], [0.65, 0.17], [1, 0.05]]), { color: HIDE });
  b.along(tailTube, 7, (at) => b.spike(at, at, 0.26 * (1 - at.t * 0.7), 0.06, { color: HORN, sides: 4 }), {
    from: 0.05,
    to: 0.9,
  });
  const tailEnd = tail.at(1);
  b.part(new THREE.SphereGeometry(0.15, 6, 5), BONE, { bone: tailEnd.bone ?? tail.joints[tail.joints.length - 1], at: tailEnd.at.clone().add(V(0, 0.07, -0.05)), flat: true });
  b.ring(tailEnd, { count: 5, radius: 0.1, fromDeg: -90, toDeg: 90, tilt: 20 }, (item) =>
    b.spike(item, item, 0.2, 0.045, { color: BONE, sides: 5 }),
  );

  // ----- legs
  const makeLeg = (s: number, hind: boolean) => {
    const S = s > 0 ? "L" : "R";
    const hipP: [number, number, number] = hind ? [s * 0.66, 1.15, -0.75] : [s * 0.72, 1.25, 1.0];
    const footP: [number, number, number] = hind ? [s * 0.82, 0.13, -0.5] : [s * 0.88, 0.13, 1.3];
    const lengths = hind ? [0.62, 0.6, 0.42] : [0.56, 0.56, 0.4];
    const bends = hind
      ? [[0, 0, 1], [0, 0, -1]]
      : [[0, 0, -1], [0, 0, 1]];
    const pts = limb(hipP, footP, lengths, bends);
    const names = hind
      ? [`hipH${S}`, `kneeH${S}`, `ankleH${S}`, `footH${S}`]
      : [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`];
    const leg = b.chain(`leg${hind ? "H" : "F"}${S}`, pts, {
      parent: hind ? hips : chest,
      names,
      role: "leg",
      contact: [footP[0], 0, footP[2]],
    });
    const foot = leg.tip ?? leg.joints[2];
    b.sweep(leg, hind ? [0.27, 0.2, 0.12, 0.1] : [0.24, 0.18, 0.12, 0.1], { color: HIDE });
    // muscle mass
    b.part(new THREE.SphereGeometry(1, 8, 6), HIDE, {
      bone: leg.joints[0],
      at: [s * (hind ? 0.74 : 0.78), hind ? 1.1 : 1.2, hind ? -0.75 : 1.0],
      scale: hind ? [0.34, 0.5, 0.5] : [0.3, 0.42, 0.42],
      flat: true,
    });
    // knee / elbow spike
    b.spike(pts[1].clone(), V(s * 0.5, 0.2, hind ? 0.7 : -0.7).normalize(), 0.24, 0.07, {
      color: HORN,
      bone: leg.joints[1],
      sides: 5,
    });
    // bronze cuff with Greek key
    const cuffAt = pts[2].clone().lerp(pts[3], 0.45);
    const cuffDir = pts[3].clone().sub(pts[2]).normalize();
    const R = 0.125;
    b.part(new THREE.CylinderGeometry(R, R, (2 * Math.PI * R) / (80 / 14), 12, 1, true), "#ffffff", {
      bone: leg.joints[2],
      at: cuffAt,
      dir: cuffDir,
      texture: TEX.key8,
    });
    // heel knob + toes + claws
    const fx = footP[0];
    const fz = footP[2];
    b.part(new THREE.SphereGeometry(0.11, 7, 5), SKIN_MID, { bone: foot, at: [fx, 0.11, fz + 0.02], flat: true });
    for (const k of [-1, 0, 1]) {
      const a = V(fx + k * 0.04, 0.12, fz);
      const e = V(fx + k * 0.17 + s * 0.03, 0.065, fz + 0.4 - Math.abs(k) * 0.05);
      b.capsule(a, e, 0.062, { color: SKIN_MID, bone: foot, sides: 6 });
      const dir = e.clone().sub(a).normalize().add(V(0, -0.15, 0)).normalize();
      b.spike(e.clone().addScaledVector(dir, -0.03), dir, 0.18, 0.042, { color: CLAW, bone: foot, sides: 5 });
    }
    b.spike(V(fx, 0.12, fz - 0.08), V(0, -0.1, -1).normalize(), 0.14, 0.04, { color: CLAW, bone: foot, sides: 5 });
  };
  for (const s of [1, -1]) {
    makeLeg(s, true);
    makeLeg(s, false);
  }

  // ----- body ornaments: dorsal spikes and barbs
  b.along(body, 7, (at) => b.spike(at, at, 0.3, 0.07, { color: HORN, sides: 4 }), { from: 0.06, to: 0.5 });
  const skin = b.surface([body, hump]);
  for (const hit of skin.scatter(24, {
    rng: rand,
    minDist: 0.24,
    filter: (hh) => hh.n.y > 0.35 && hh.at.z < 0.9,
  })) {
    b.stick(new THREE.ConeGeometry(0.055, 0.2, 5), HORN, hit, { embed: 0.3 });
  }

  // ----- glowing ember cracks and runes
  glow(b.decal(body, TEX.crack, { at: [0, 1.3, 1.95], dir: [0, 0, 1], size: [0.75, 0.85] }), 1.7);
  glow(b.decal(body, TEX.crack, { at: [0.8, 1.1, 0.85], dir: [1, 0, 0], size: [0.8, 0.8] }), 1.7);
  glow(b.decal(body, TEX.crack, { at: [-0.8, 1.2, 0.3], dir: [-1, 0, 0], size: [0.9, 0.8], mirror: true }), 1.7);
  glow(b.decal(body, TEX.rune, { at: [0.76, 1.35, -0.95], dir: [1, 0, 0], size: [0.34, 0.68] }), 1.6);
  glow(b.decal(body, TEX.rune, { at: [-0.76, 1.35, -0.95], dir: [-1, 0, 0], size: [0.34, 0.68], mirror: true }), 1.6);

  // ----- necks and heads
  for (const spec of NECKS) {
    const hs = spec.hs;
    const path = catmull(spec.pts);
    const chain = b.chain(`neck${spec.id}`, path, { parent: chest, count: 6, role: "neck" });
    const rad = prof([[0, 0.42 * hs], [0.35, 0.31 * hs], [1, 0.2 * hs]]);
    const tube = b.sweep(chain, rad, { color: neckPaint(spec.seed * 3) });

    // bronze Greek-key collar
    const cp = chain.at(0.3);
    const R = rad(0.3) * 1.1 + 0.02;
    const hgt = (2 * Math.PI * R) / (160 / 14);
    const cBone = cp.bone ?? chest;
    b.part(new THREE.CylinderGeometry(R, R, hgt, 16, 1, true), "#ffffff", {
      bone: cBone,
      at: cp.at,
      dir: cp.tangent,
      texture: TEX.key16,
    });
    for (const sg of [1, -1]) {
      b.part(new THREE.TorusGeometry(R, 0.018, 4, 16), BRONZE_D, {
        bone: cBone,
        at: cp.at.clone().addScaledVector(cp.tangent, (sg * hgt) / 2),
        dir: cp.tangent,
        axis: "z",
      });
    }

    // spiked iron collar
    const cq = chain.at(0.62);
    const R2 = rad(0.62) * 1.1 + 0.015;
    b.part(new THREE.TorusGeometry(R2, 0.035, 5, 14), IRON, {
      bone: cq.bone ?? chest,
      at: cq.at,
      dir: cq.tangent,
      axis: "z",
    });
    b.ring(cq, { count: 7, radius: R2 }, (item) => b.spike(item, item, 0.11, 0.032, { color: IRON_L, sides: 4 }));

    // dorsal spines
    b.along(tube, 6, (at) => b.spike(at, at, 0.2 * hs, 0.05 * hs, { color: HORN, sides: 5 }), { from: 0.08, to: 0.95 });

    // broken shackle chain on some necks
    if (spec.id === "L2" || spec.id === "R1") {
      const anchor = tube.at(0.32, 180);
      const lBone = anchor.bone ?? chest;
      b.part(new THREE.TorusGeometry(0.07, 0.02, 5, 10), BRONZE_D, { bone: lBone, at: anchor.at, dir: [0, 0, 1], axis: "z" });
      for (let i = 0; i < 6; i++) {
        b.part(new THREE.TorusGeometry(0.045, 0.012, 5, 8), IRON, {
          bone: lBone,
          at: anchor.at.clone().add(V(0, -0.1 - 0.085 * i, 0.02)),
          dir: i % 2 ? [1, 0, 0] : [0, 0, 1],
          axis: "z",
        });
      }
    }

    // the head itself
    const P = new THREE.Vector3().copy(path.at(1));
    const F = V(spec.look[0], spec.look[1], spec.look[2]).normalize();
    buildHead(b, spec, chain.joints[chain.joints.length - 1], P, F);
  }

  // ----- weapons of dead heroes buried in the hide
  const C: [number, number, number] = [0, 1.4, 0];
  const stab = (az: number, el: number, tilt: [number, number, number]) => {
    const hit = skin.around(C).at(az, el);
    if (!hit) return null;
    const d = hit.n.clone().add(V(tilt[0], tilt[1], tilt[2])).normalize();
    return { o: hit.at.clone(), d, bone: hit.bone ?? hips };
  };
  const perp = (d: THREE.Vector3) => {
    const s1 = new THREE.Vector3().crossVectors(d, Math.abs(d.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0)).normalize();
    const s2 = new THREE.Vector3().crossVectors(d, s1).normalize();
    return [s1, s2] as const;
  };

  // spears with broken shafts
  for (const [az, el, tilt, cloth] of [
    [-35, 62, [0.2, 0.3, -0.5], false],
    [140, 55, [-0.2, 0.2, -0.4], true],
  ] as [number, number, [number, number, number], boolean][]) {
    const sp = stab(az, el, tilt);
    if (!sp) continue;
    const a = sp.o.clone().addScaledVector(sp.d, -0.15);
    const c = sp.o.clone().addScaledVector(sp.d, 1.2);
    b.rod(a, c, [0.032, 0.022], WOOD, { bone: sp.bone, sides: 6 });
    b.rod(sp.o.clone().addScaledVector(sp.d, 0.3), sp.o.clone().addScaledVector(sp.d, 0.4), 0.036, LEATHER, {
      bone: sp.bone,
      sides: 6,
    });
    b.spike(c, sp.d, 0.14, 0.022, { color: WOOD_L, bone: sp.bone, sides: 5 });
    if (cloth) {
      b.cards([frame(sp.o.clone().addScaledVector(sp.d, 0.95), [0, 1, 0])], TEX.cloth, {
        size: [0.3, 0.55],
        lean: 180,
        flow: [0, 0, 1],
        bone: sp.bone,
        cross: true,
      });
    }
  }

  // swords
  const sword = (sp: NonNullable<ReturnType<typeof stab>>, mode: "hilt" | "blade") => {
    let side = new THREE.Vector3().crossVectors(sp.d, V(0, 0, 1)).normalize();
    if (side.lengthSq() < 0.1) side = V(1, 0, 0);
    const s2 = new THREE.Vector3().crossVectors(side, sp.d).normalize();
    if (mode === "hilt") {
      b.part(new THREE.BoxGeometry(0.36, 0.05, 0.07), BRONZE, { bone: sp.bone, at: sp.o, dir: sp.d, up: s2 });
      b.rod(sp.o.clone().addScaledVector(sp.d, 0.02), sp.o.clone().addScaledVector(sp.d, 0.3), 0.024, LEATHER, {
        bone: sp.bone,
        sides: 6,
      });
      b.part(new THREE.SphereGeometry(0.045, 6, 5), BRONZE, {
        bone: sp.bone,
        at: sp.o.clone().addScaledVector(sp.d, 0.33),
        flat: true,
      });
    } else {
      glow(
        b.extrude(BLADE, {
          at: sp.o.clone().addScaledVector(sp.d, -0.05),
          x: side,
          y: sp.d,
          thickness: 0.03,
          color: EMBER,
          bone: sp.bone,
        }),
        1.3,
      );
    }
  };
  const s1 = stab(-75, 35, [-0.5, 0.3, -0.1]);
  if (s1) sword(s1, "hilt");
  const s2 = stab(70, 48, [0.5, 0.4, 0.1]);
  if (s2) sword(s2, "blade");

  // arrows
  for (const [az, el] of [[110, 20], [120, 35], [-110, 30], [-100, 15]] as [number, number][]) {
    const sp = stab(az, el, [0, 0.15, -0.3]);
    if (!sp) continue;
    const c = sp.o.clone().addScaledVector(sp.d, 0.6);
    b.rod(sp.o.clone().addScaledVector(sp.d, -0.1), c, 0.011, WOOD_L, { bone: sp.bone, sides: 5 });
    const [p1, p2] = perp(sp.d);
    for (const y of [p1, p2]) {
      b.extrude(
        [[0, -0.04], [0.12, -0.045], [0.15, 0.04], [0.03, 0.045]],
        { at: c.clone().addScaledVector(sp.d, -0.14), x: sp.d, y, thickness: 0.004, color: RED, bone: sp.bone },
      );
    }
  }

  // Spartan shield on the left flank
  const sh = skin.around(C).at(85, -5);
  if (sh) {
    const n = sh.n.clone().add(V(0, 0.2, 0.1)).normalize();
    const ctr = sh.at.clone().addScaledVector(sh.n, 0.1);
    const sb = sh.bone ?? hips;
    b.part(new THREE.CircleGeometry(0.42, 18), "#ffffff", { bone: sb, at: ctr, dir: n, axis: "z", texture: TEX.shield });
    b.part(new THREE.TorusGeometry(0.42, 0.035, 5, 18), BRONZE, { bone: sb, at: ctr, dir: n, axis: "z" });
    b.part(new THREE.SphereGeometry(0.08, 6, 4), BRONZE, {
      bone: sb,
      at: ctr.clone().addScaledVector(n, 0.01),
      flat: true,
      scale: [1, 1, 0.5],
    });
    b.rod(ctr.clone().addScaledVector(sh.n, -0.2), ctr.clone().addScaledVector(sh.n, 0.0), 0.05, IRON, { bone: sb });
  }

  return b.root;
}
```