```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  polyline,
  mix,
  noise,
  cells,
  paint,
  rgb,
  smoothstep,
  spots,
  stripes,
  mottle,
  svg,
} from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Clownfish Reef Diorama",
  description:
    "A round Finding-Nemo style coral reef: three rigged clownfish (Marlin, Nemo with his lucky fin, and a little one) nestled in glowing-tipped anemones, with staghorn, brain, table, tube and soft corals, sea fans, tube worms, rocks, urchins, a starfish and sea grass.",
};

type V3 = [number, number, number];
type Fill = string | ReturnType<typeof paint>;

const RAD = Math.PI / 180;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const unit = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const ORANGE = "#ff7a14";
const ORANGE_D = "#e24f0a";
const ORANGE_L = "#ffa63a";
const WHITE = "#fbf9f2";
const BLACK = "#17121c";
const MOUTH = "#5a1a14";
const SAND_L = "#fbe7b0";
const SAND_D = "#e8c27c";
const ROCK_D = "#4a4670";
const ROCK_L = "#8a86b4";
const MOSS = "#4fb487";

/** Warm-on-top, cool-underneath light baked into a colour. */
const lit = (c: string | Rgb, n: THREE.Vector3): Rgb => {
  const [r, g, bl] = rgb(c);
  const up = n.y * 0.5 + 0.5;
  const k = 0.76 + 0.32 * up;
  return [Math.min(1, r * k * (0.96 + 0.1 * up)), Math.min(1, g * k), Math.min(1, bl * k * (1.12 - 0.12 * up))];
};
const scaleRgb = (c: Rgb, k: number): Rgb => [Math.min(1, c[0] * k), Math.min(1, c[1] * k), Math.min(1, c[2] * k)];

// ---------------------------------------------------------------------------------------------------------------
// Textures (SVG drawings)
const EYE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="29" fill="#f6a31a" stroke="#2a1306" stroke-width="3.2"/>
    <circle cx="32" cy="34" r="18.5" fill="#0a0a12"/>
    <circle cx="24" cy="24" r="7.5" fill="#ffffff"/>
    <circle cx="41" cy="42" r="3.8" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

function fanSvg(): string {
  const r = rng(33);
  let dark = "";
  let light = "";
  const at = (R: number, a: number): [number, number] => [50 + R * Math.sin(a), 99 - R * Math.cos(a)];
  const line = (d: string, w: number) => {
    dark += `<path d="${d}" stroke="#6e6e6e" stroke-width="${w + 1.7}" fill="none" stroke-linecap="round"/>`;
    light += `<path d="${d}" stroke="#ffffff" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  };
  line("M50 100 L50 86", 6);
  const spokes = 15;
  for (let i = 0; i < spokes; i++) {
    const a = (-64 + (128 * i) / (spokes - 1)) * RAD;
    const L = 92 - 22 * Math.pow(Math.abs(a) / (64 * RAD), 2);
    const [x1, y1] = at(12, a);
    const [x2, y2] = at(L, a + (r() - 0.5) * 0.1);
    const [cx, cy] = at(L * 0.55, a + (r() - 0.5) * 0.2);
    line(`M${x1.toFixed(1)} ${y1.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`, 2.3);
  }
  for (const R of [26, 41, 56, 70, 83]) {
    const lim = (R > 76 ? 64 - (R - 76) * 3.2 : 64) * RAD;
    const [x1, y1] = at(R, -lim);
    const [x2, y2] = at(R, lim);
    line(`M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`, 1.9);
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${dark}${light}</svg>`;
}
const FAN = svg(fanSvg(), { size: 384 });

const GRASS = svg(
  `<svg viewBox="0 0 24 100" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1f7a46"/><stop offset="1" stop-color="#93e86c"/></linearGradient></defs>
    <path d="M3 100 C5 62 10 30 21 0 C19 36 19 70 21 100 Z" fill="url(#g)" stroke="#14532d" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M12 98 C13 66 16 36 20 8" stroke="#d2f9a4" stroke-width="1.4" fill="none" opacity="0.75"/>
  </svg>`,
  { size: 160 },
);

const POLYP = svg(
  `<svg viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
    <g stroke-linecap="round" fill="none">
      <path d="M20 48 Q18 30 7 10" stroke="#8a1c55" stroke-width="7.4"/>
      <path d="M20 48 Q20 28 20 6" stroke="#8a1c55" stroke-width="7.4"/>
      <path d="M20 48 Q22 30 33 10" stroke="#8a1c55" stroke-width="7.4"/>
      <path d="M20 48 Q16 34 12 20" stroke="#8a1c55" stroke-width="6"/>
      <path d="M20 48 Q24 34 28 20" stroke="#8a1c55" stroke-width="6"/>
      <path d="M20 48 Q18 30 7 10" stroke="#ff9ec9" stroke-width="4.6"/>
      <path d="M20 48 Q20 28 20 6" stroke="#ffb3d6" stroke-width="4.6"/>
      <path d="M20 48 Q22 30 33 10" stroke="#ff9ec9" stroke-width="4.6"/>
      <path d="M20 48 Q16 34 12 20" stroke="#ffc2de" stroke-width="3.4"/>
      <path d="M20 48 Q24 34 28 20" stroke="#ffc2de" stroke-width="3.4"/>
    </g>
    <circle cx="7" cy="10" r="3" fill="#fff6c8"/><circle cx="20" cy="6" r="3" fill="#fff6c8"/><circle cx="33" cy="10" r="3" fill="#fff6c8"/>
  </svg>`,
  { size: 128 },
);

function wormSvg(): string {
  let s = `<rect x="16" y="44" width="8" height="16" rx="2" fill="#f4e9d0" stroke="#7a5a30" stroke-width="1.4"/>`;
  const cone = (cx: number, c1: string, c2: string) => {
    for (let i = 0; i < 6; i++) {
      const rx = 11 - i * 1.7;
      s += `<ellipse cx="${cx}" cy="${44 - i * 6.6}" rx="${rx.toFixed(1)}" ry="4.4" fill="${i % 2 ? c1 : c2}" stroke="#14214a" stroke-width="1.3"/>`;
    }
  };
  cone(12, "#2fd3ff", "#2a62f0");
  cone(28, "#ffd23a", "#ff7a1a");
  return `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}
const WORM = svg(wormSvg(), { size: 160 });

// ---------------------------------------------------------------------------------------------------------------
// Fish profile (shared): half height by t along the body, tail (t=0) to nose (t=1)
const RYK: [number, number][] = [
  [0, 0.015],
  [0.12, 0.021],
  [0.3, 0.038],
  [0.5, 0.052],
  [0.7, 0.051],
  [0.86, 0.04],
  [0.96, 0.02],
  [1, 0.009],
];
const ry0 = (t: number) => {
  const tt = clamp01(t);
  for (let i = 1; i < RYK.length; i++) {
    if (tt <= RYK[i][0]) {
      const [t0, v0] = RYK[i - 1];
      const [t1, v1] = RYK[i];
      const k = (tt - t0) / (t1 - t0);
      const sm = k * k * (3 - 2 * k);
      return v0 + (v1 - v0) * (0.4 * k + 0.6 * sm);
    }
  }
  return RYK[RYK.length - 1][1];
};
const tOf = (z: number) => (z + 0.108) / 0.206;

const US = [0, 0.019, 0.038, 0.057, 0.076, 0.095, 0.114, 0.133];
const DORSAL_H = [0.012, 0.026, 0.03, 0.022, 0.03, 0.034, 0.026, 0.01];
const hAt = (u: number) => {
  const k = clamp01(u / 0.133) * (US.length - 1);
  const i = Math.min(Math.floor(k), US.length - 2);
  return DORSAL_H[i] + (DORSAL_H[i + 1] - DORSAL_H[i]) * (k - i);
};

const TAIL: [number, number][] = [
  [0, -0.012],
  [0.02, -0.03],
  [0.05, -0.046],
  [0.074, -0.044],
  [0.082, -0.02],
  [0.079, 0],
  [0.082, 0.02],
  [0.074, 0.044],
  [0.05, 0.046],
  [0.02, 0.03],
  [0, 0.012],
];
const PEC: [number, number][] = [
  [0, 0.007],
  [0.008, 0.015],
  [0.026, 0.017],
  [0.042, 0.008],
  [0.047, -0.004],
  [0.038, -0.017],
  [0.016, -0.018],
  [0.004, -0.009],
];
const PELV: [number, number][] = [
  [0, 0.007],
  [0.012, 0.011],
  [0.03, 0.006],
  [0.036, -0.002],
  [0.026, -0.009],
  [0.01, -0.009],
  [0, -0.006],
];
const ANAL: [number, number][] = [
  [0, 0.012],
  [0.004, -0.012],
  [0.02, -0.024],
  [0.036, -0.026],
  [0.047, -0.014],
  [0.048, 0.016],
];

export default function build() {
  const b = createBuilder({ name: "clownfish_reef", paintSize: 2048 });
  const reef = b.joint("reef", { at: [0, 0, 0], dir: [0, 1, 0] });
  const G = 0.128; // sand surface height

  const put = (
    geo: THREE.BufferGeometry,
    color: Fill,
    at: V3,
    o: { scale?: V3; rotation?: V3; flat?: boolean } = {},
  ) => b.part(geo, color, { bone: reef, at, ...o });

  // -------------------------------------------------------------------------------------------------------------
  // Paints
  const sandPaint = paint((p, n) => {
    if (n.y > 0.42 && p.y > 0.1) {
      const r = Math.hypot(p.x, p.z);
      const warp = noise(p, 0.12, 2) * 0.06;
      const rip = Math.sin((p.x * 0.8 + p.z * 0.6 + warp) * 90) * 0.5 + 0.5;
      let c: Rgb = mix(SAND_D, SAND_L, 0.35 + 0.4 * noise(p, 0.15, 1) + 0.12 * rip);
      c = mix(c, "#fffbe0", Math.abs(noise(p, 0.09, 8) - 0.5) < 0.018 ? 0.4 : 0);
      c = mix(c, "#d9a56b", smoothstep(0.38, 0.5, r) * 0.45);
      return lit(c, n);
    }
    const band = 0.5 + 0.5 * Math.sin(p.y * 130 + noise(p, 0.1, 3) * 6);
    const c: Rgb = mix(mix(ROCK_D, ROCK_L, noise(p, 0.07, 4)), "#c8b8e8", band * 0.25);
    return lit(c, n);
  });

  const ROCK = paint((p, n) => {
    let c: Rgb = mix(ROCK_D, ROCK_L, 0.2 + 0.7 * noise(p, 0.08, 5));
    c = mix(c, MOSS, smoothstep(0.55, 0.95, n.y) * smoothstep(0.45, 0.65, noise(p, 0.05, 7)) * 0.85);
    c = mix(c, "#f2a6c8", smoothstep(0.66, 0.74, noise(p, 0.03, 9)) * 0.55);
    return lit(c, n);
  });

  // -------------------------------------------------------------------------------------------------------------
  // Plinth: a round slice of seabed
  b.lathe(
    [
      [0, 0],
      [0.5, 0],
      [0.575, 0.03],
      [0.58, 0.075],
      [0.52, 0.11],
      [0.47, 0.12],
      [0.3, 0.128],
      [0, 0.135],
    ],
    { at: [0, 0, 0], bone: reef, segments: 20, color: sandPaint, name: "plinth" },
  );

  // Rocks: back mass and a boulder rim
  const ico = () => new THREE.IcosahedronGeometry(1, 1);
  put(ico(), ROCK, [0, 0.14, -0.3], { scale: [0.28, 0.19, 0.2], rotation: [0, 15, 0], flat: true });
  put(ico(), ROCK, [-0.25, 0.1, -0.3], { scale: [0.17, 0.14, 0.15], rotation: [0, 50, 0], flat: true });
  put(ico(), ROCK, [0.25, 0.1, -0.3], { scale: [0.17, 0.13, 0.15], rotation: [0, -30, 0], flat: true });
  put(ico(), ROCK, [0.04, 0.3, -0.37], { scale: [0.11, 0.1, 0.09], rotation: [0, 70, 0], flat: true });
  put(ico(), ROCK, [-0.11, 0.26, -0.36], { scale: [0.08, 0.07, 0.07], rotation: [0, 20, 0], flat: true });
  const rr2 = rng(21);
  for (let i = 0; i < 12; i++) {
    const ang = (70 + i * 20) * RAD;
    const rad = 0.5 + rr2() * 0.05;
    const sz = 0.075 + rr2() * 0.045 + (Math.cos(ang) < -0.5 ? 0.03 : 0);
    put(ico(), ROCK, [Math.sin(ang) * rad, 0.07 + sz * 0.3, Math.cos(ang) * rad], {
      scale: [sz * 1.2, sz * 0.85, sz],
      rotation: [0, rr2() * 360, 0],
      flat: true,
    });
  }
  for (const a of [-42, 44]) {
    const ang = a * RAD;
    put(ico(), ROCK, [Math.sin(ang) * 0.52, 0.07, Math.cos(ang) * 0.52], {
      scale: [0.05, 0.04, 0.045],
      rotation: [0, a * 3, 0],
      flat: true,
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Staghorn coral: recursive branching tubes
  const stag = (x: number, z: number, h: number, seed: number, base: string, tip: string, depth: number) => {
    const r = rng(seed);
    const col = paint((p, n) => {
      const t = smoothstep(G + h * 0.25, G + h * 1.05, p.y);
      const c = mix(base, tip, t * t);
      return scaleRgb(c, 0.88 + 0.22 * noise(p, 0.015, seed) + 0.06 * n.y);
    });
    const grow = (start: THREE.Vector3, dir: THREE.Vector3, len: number, rad: number, d: number) => {
      const end = start.clone().addScaledVector(dir, len);
      const m = start
        .clone()
        .lerp(end, 0.5)
        .add(new THREE.Vector3(r() - 0.5, 0.1, r() - 0.5).multiplyScalar(len * 0.3));
      b.sweep(catmull([start, m, end]), [rad, rad * 0.72], { bone: reef, color: col, sides: 5 });
      if (d <= 0) return;
      const n = d === 1 ? 2 : r() < 0.5 ? 2 : 3;
      const ref = Math.abs(dir.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      const u = ref.clone().cross(dir).normalize();
      const v = dir.clone().cross(u);
      for (let i = 0; i < n; i++) {
        const az = (i / n) * Math.PI * 2 + r() * 1.2;
        const tilt = 0.42 + r() * 0.36;
        const nd = dir
          .clone()
          .multiplyScalar(Math.cos(tilt))
          .addScaledVector(u, Math.cos(az) * Math.sin(tilt))
          .addScaledVector(v, Math.sin(az) * Math.sin(tilt));
        nd.y += 0.22;
        nd.normalize();
        grow(end, nd, len * (0.68 + r() * 0.12), rad * 0.74, d - 1);
      }
    };
    grow(new THREE.Vector3(x, G - 0.012, z), new THREE.Vector3(0.05, 1, 0.03).normalize(), h * 0.4, 0.028, depth);
  };
  stag(0.31, -0.14, 0.3, 5, "#ff7a3c", "#ffd2e6", 3);
  stag(0.12, -0.13, 0.22, 8, "#e0489a", "#ffe9a8", 3);
  stag(-0.08, -0.2, 0.18, 12, "#ffb02e", "#fff2c0", 2);

  // -------------------------------------------------------------------------------------------------------------
  // Brain corals with Christmas-tree worms
  const brain = (x: number, z: number, rad: number, base: string, groove: string, seed: number) => {
    const col = paint((p, n) => {
      const q = new THREE.Vector3(
        p.x + 0.02 * (noise(p, 0.06, seed) - 0.5),
        p.y + 0.02 * (noise(p, 0.06, seed + 3) - 0.5),
        p.z + 0.02 * (noise(p, 0.06, seed + 6) - 0.5),
      );
      const c = cells(q, 0.036, seed);
      const e = c.d2 - c.d1;
      const ridge = smoothstep(0.05, 0.17, e);
      const body: Rgb = mix(base, "#fff0a0", 0.25 * c.id);
      return lit(mix(groove, body, ridge), n);
    });
    return put(new THREE.SphereGeometry(1, 14, 10), col, [x, G + 0.005, z], { scale: [rad, rad * 0.78, rad] });
  };
  const brainBig = brain(0.39, -0.01, 0.11, "#9be34a", "#2f7d3e", 4);
  brain(0.2, -0.24, 0.07, "#ffb347", "#a8531a", 6);
  const worms = b.surface(brainBig).scatter(9, { rng: rng(41), minDist: 0.045, filter: (h) => h.n.y > 0.5 });
  b.cards(worms, WORM, { size: [0.032, 0.042], cross: true, vary: 0.25, rng: rng(42), bone: reef, spin: 180 });

  // -------------------------------------------------------------------------------------------------------------
  // Tube coral cluster
  const tube = (x: number, z: number, h: number, r: number, base: string, band: string) => {
    const bands = stripes(base, band, { size: 0.03, axis: "y", width: 0.3, wobble: 0.25, seed: 3 });
    const col = paint((p, n, s) => {
      if (n.y > 0.15 && s[0] > h - 0.022 && Math.hypot(p.x - x, p.z - z) < r * 0.85) return lit("#2a0f4a", n);
      if (s[0] > h - 0.006) return lit("#ffe3f6", n);
      return bands;
    });
    b.lathe(
      [
        [0, 0],
        [r, 0],
        [r * 0.9, h * 0.85],
        [r * 1.05, h],
        [r * 0.78, h],
        [r * 0.58, h - 0.012],
        [0, h - 0.016],
      ],
      { at: [x, G - 0.01, z], bone: reef, segments: 9, color: col },
    );
  };
  const tubes: [number, number, number, number, string, string][] = [
    [0, 0, 0.2, 0.03, "#8b5cf6", "#c9a8ff"],
    [0.05, 0.03, 0.14, 0.027, "#3a7bff", "#9cc4ff"],
    [-0.045, 0.035, 0.11, 0.025, "#22c7c0", "#9af0e8"],
    [0.03, -0.05, 0.16, 0.026, "#b24ae8", "#e6aaff"],
    [-0.05, -0.03, 0.15, 0.024, "#3a7bff", "#9cc4ff"],
    [0.085, -0.005, 0.08, 0.022, "#22c7c0", "#9af0e8"],
    [0.0, 0.075, 0.07, 0.02, "#8b5cf6", "#c9a8ff"],
  ];
  for (const [dx, dz, h, r, c1, c2] of tubes) tube(-0.35 + dx, 0.06 + dz, h, r, c1, c2);

  // -------------------------------------------------------------------------------------------------------------
  // Table coral
  {
    const tcx = -0.25;
    const tcz = -0.17;
    const col = paint((p, n) => {
      const rr = Math.hypot(p.x - tcx, p.z - tcz);
      let c: Rgb = mix("#27c6b4", "#b58cff", smoothstep(0.04, 0.15, rr));
      const ridge = 0.5 + 0.5 * Math.sin(rr * 260);
      c = mix(c, "#ffffff", (n.y > 0.5 && rr > 0.125 ? 0.5 : 0) + (n.y > 0.3 ? 0.1 * ridge : 0));
      return lit(c, n);
    });
    b.lathe(
      [
        [0, 0],
        [0.026, 0],
        [0.02, 0.085],
        [0.14, 0.13],
        [0.15, 0.143],
        [0.12, 0.154],
        [0, 0.158],
      ],
      { at: [tcx, G - 0.012, tcz], axis: [0.08, 1, 0.04], bone: reef, segments: 14, color: col },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Soft coral mound with polyp tufts
  {
    const mound = put(
      new THREE.SphereGeometry(1, 10, 7),
      mottle("#ff8fb5", "#ffc4d6", { size: 0.05, seed: 2 }),
      [-0.08, G + 0.01, -0.06],
      { scale: [0.085, 0.055, 0.085] },
    );
    const hits = b.surface(mound).scatter(42, { rng: rng(51), minDist: 0.022, filter: (h) => h.n.y > 0.2 });
    b.cards(hits, POLYP, { size: [0.022, 0.036], lean: 10, cross: true, vary: 0.3, rng: rng(52), bone: reef });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Sea fans growing from the back rocks
  b.cards([frame([0.1, 0.28, -0.31], [0, 1, 0])], FAN, {
    size: [0.32, 0.3],
    flow: [0.3, 0, 1],
    color: "#e0457b",
    bone: reef,
    sink: 0.04,
  });
  b.cards([frame([-0.15, 0.26, -0.3], [0, 1, 0])], FAN, {
    size: [0.28, 0.26],
    flow: [-0.35, 0, 1],
    color: "#ff9a2e",
    bone: reef,
    sink: 0.04,
  });

  // -------------------------------------------------------------------------------------------------------------
  // Anemones
  type AnemoneSpec = {
    x: number;
    z: number;
    R: number;
    H: number;
    len: number;
    body: string;
    bodyL: string;
    disc: string;
    tent0: string;
    tent1: string;
    bead: string;
    seed: number;
    rings: number[];
    fr: number[];
  };
  const anemone = (a: AnemoneSpec) => {
    const { x, z, R, H } = a;
    const topY = G - 0.012 + H;
    const column = paint((p, n, s) => {
      if (n.y > 0.6) return lit(mix(a.disc, a.bodyL, 0.25 * noise(p, 0.03, a.seed)), n);
      const k = Math.sin(s[1] * RAD * 14) * 0.5 + 0.5;
      let c: Rgb = mix(a.body, a.bodyL, k * 0.55);
      const w = cells(p, 0.022, a.seed);
      if (w.d1 < 0.16) c = mix(c, "#fff0f6", 0.75);
      return lit(c, n);
    });
    b.lathe(
      [
        [0, 0],
        [R * 0.62, 0],
        [R * 0.72, H * 0.55],
        [R * 0.95, H],
        [R * 0.5, H * 1.06],
        [0, H * 0.96],
      ],
      { at: [x, G - 0.012, z], bone: reef, segments: 12, color: column },
    );
    const tentPaint = paint((p, n) => {
      const t = smoothstep(topY, topY + a.len, p.y);
      return lit(mix(a.tent0, a.tent1, t), n);
    });
    const r = rng(a.seed);
    const beads: THREE.BufferGeometry[] = [];
    a.rings.forEach((count, ri) => {
      const f = a.fr[ri];
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2 + ri * 0.7 + (r() - 0.5) * 0.3;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        const rad0 = R * f * (0.92 + 0.16 * r());
        const start = new THREE.Vector3(x + ca * rad0, topY - 0.004, z + sa * rad0);
        const L = a.len * (0.8 + 0.4 * r()) * (0.8 + 0.25 * f);
        const spread = 0.25 + 0.75 * f;
        const out = new THREE.Vector3(ca, 0, sa);
        const tan = new THREE.Vector3(-sa, 0, ca);
        const sway = (r() - 0.5) * 0.5 * L;
        const p1 = start
          .clone()
          .addScaledVector(out, spread * L * 0.28)
          .addScaledVector(tan, sway * 0.4)
          .add(new THREE.Vector3(0, L * 0.5, 0));
        const p2 = start
          .clone()
          .addScaledVector(out, spread * L * 0.65)
          .addScaledVector(tan, sway)
          .add(new THREE.Vector3(0, L * 0.92, 0));
        b.sweep(catmull([start, p1, p2]), [0.0095, 0.0045], { bone: reef, color: tentPaint, sides: 5 });
        beads.push(new THREE.SphereGeometry(0.0105, 6, 4).translate(p2.x, p2.y + 0.003, p2.z));
      }
    });
    const merged = mergeGeometries(beads);
    if (merged) glow(b.part(merged, a.bead, { bone: reef, at: [0, 0, 0] }), 0.7);
  };
  anemone({
    x: 0,
    z: 0.2,
    R: 0.13,
    H: 0.07,
    len: 0.13,
    body: "#d9568c",
    bodyL: "#f08fb8",
    disc: "#7a2b6e",
    tent0: "#f6b6d0",
    tent1: "#c86ad8",
    bead: "#e9a0ff",
    seed: 61,
    rings: [18, 13, 8, 4],
    fr: [0.9, 0.65, 0.4, 0.14],
  });
  anemone({
    x: 0.29,
    z: 0.19,
    R: 0.085,
    H: 0.06,
    len: 0.1,
    body: "#3fb7a5",
    bodyL: "#8be0cf",
    disc: "#1f6b78",
    tent0: "#aef0d6",
    tent1: "#6f9bf0",
    bead: "#a7f3ff",
    seed: 62,
    rings: [14, 9, 5],
    fr: [0.88, 0.58, 0.26],
  });
  anemone({
    x: -0.26,
    z: 0.27,
    R: 0.07,
    H: 0.05,
    len: 0.09,
    body: "#e0a030",
    bodyL: "#ffd36a",
    disc: "#8a4a14",
    tent0: "#ffe08a",
    tent1: "#ff7a3c",
    bead: "#ffd27a",
    seed: 63,
    rings: [12, 8, 4],
    fr: [0.86, 0.55, 0.22],
  });

  // -------------------------------------------------------------------------------------------------------------
  // Starfish, urchins, sea grass
  {
    const x = -0.12;
    const z = 0.4;
    const r = 0.06;
    const rot = 0.5;
    const pts: [number, number][] = [];
    for (let i = 0; i < 10; i++) {
      const a = rot + (i * Math.PI) / 5;
      const rad = i % 2 === 0 ? r : r * 0.42;
      pts.push([Math.sin(a) * rad, Math.cos(a) * rad]);
    }
    b.extrude(pts, {
      at: [x, G + 0.004, z],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.016,
      bevel: 0.006,
      smoothing: 1,
      color: spots("#ff6a3d", "#ffd7a0", { size: 0.018, amount: 0.55, seed: 4 }),
      bone: reef,
      name: "starfish",
    });
  }
  const urchin = (x: number, z: number, s: number) => {
    const c = new THREE.Vector3(x, G + 0.03 * s, z);
    put(new THREE.SphereGeometry(0.032 * s, 8, 6), "#2b1650", [c.x, c.y, c.z]);
    const N = 26;
    for (let i = 0; i < N; i++) {
      const y = 1 - ((i + 0.5) / N) * 1.5;
      const rad = Math.sqrt(1 - y * y);
      const th = i * 2.399963;
      const dir: V3 = [Math.cos(th) * rad, y, Math.sin(th) * rad];
      const base: V3 = [c.x + dir[0] * 0.026 * s, c.y + dir[1] * 0.026 * s, c.z + dir[2] * 0.026 * s];
      b.spike(base, dir, 0.05 * s, 0.0035 * s, { color: i % 5 === 0 ? "#7b3fb0" : "#3a1d6e", bone: reef, sides: 4 });
    }
  };
  urchin(0.14, 0.4, 1);
  urchin(0.23, 0.35, 0.7);

  const clump = (x: number, z: number, n: number, seed: number) => {
    const r = rng(seed);
    const frames = Array.from({ length: n }, () =>
      frame([x + (r() - 0.5) * 0.05, G, z + (r() - 0.5) * 0.05], [0, 1, 0]),
    );
    b.cards(frames, GRASS, {
      size: [0.03, 0.11],
      lean: 12,
      bend: 28,
      vary: 0.4,
      spin: 180,
      rng: r,
      bone: reef,
      flow: () => {
        const a = r() * Math.PI * 2;
        return [Math.cos(a), -0.1, Math.sin(a)];
      },
    });
  };
  clump(-0.43, 0.17, 8, 71);
  clump(0.43, 0.15, 8, 72);
  clump(0.05, -0.11, 6, 73);
  clump(-0.26, 0.37, 7, 74);
  clump(0.28, 0.37, 7, 75);

  // -------------------------------------------------------------------------------------------------------------
  // Clownfish
  type FishSpec = {
    id: string;
    pos: V3;
    yaw: number;
    sc: number;
    stripes: [number, number][];
    rightFin?: number;
  };

  const clownfish = (f: FishSpec) => {
    const { id, sc } = f;
    const cy = Math.cos(f.yaw * RAD);
    const sy = Math.sin(f.yaw * RAD);
    const D = (x: number, y: number, z: number): V3 => [x * cy + z * sy, y, -x * sy + z * cy];
    const P = (x: number, y: number, z: number): V3 => {
      const d = D(x * sc, y * sc, z * sc);
      return [d[0] + f.pos[0], d[1] + f.pos[1], d[2] + f.pos[2]];
    };
    const S2 = (pts: [number, number][], k = 1): [number, number][] =>
      pts.map(([x, y]) => [x * sc * k, y * sc * k] as [number, number]);

    // Skeleton
    const root = b.joint(`${id}Root`, { parent: reef, at: P(0, 0, 0), dir: D(0, 0, 1) });
    const back = b.chain(`${id}Tail`, polyline([P(0, 0, 0), P(0, 0, -0.055), P(0, 0, -0.108)]), {
      parent: root,
      names: [`${id}Tail1`, `${id}Tail2`, `${id}TailFin`],
      role: "tail",
    });
    const front = b.chain(`${id}Spine`, polyline([P(0, 0, 0), P(0, 0, 0.05), P(0, 0, 0.098)]), {
      parent: root,
      names: [`${id}Spine1`, `${id}Head`],
      role: "spine",
    });
    const head = front.joints[1];
    const jaw = b.joint(`${id}Jaw`, {
      parent: head,
      at: P(0, -0.014, 0.07),
      aim: P(0, -0.018, 0.105),
      role: "jaw",
    });
    const tailBone = back.joints[back.joints.length - 1];

    // Body
    const skin = paint((_p, n, s) => {
      const tt = s[0] - 0.03 * Math.cos(s[1] * RAD);
      for (const [c, w] of f.stripes) {
        const d = Math.abs(tt - c);
        if (d < w) return lit(WHITE, n);
        if (d < w + 0.016) return BLACK;
      }
      const deep = smoothstep(0.2, 0.95, n.y) * 0.5;
      const belly = smoothstep(-0.2, -0.85, n.y);
      let c: Rgb = mix(ORANGE, ORANGE_D, deep);
      c = mix(c, ORANGE_L, belly * 0.6);
      return lit(c, n);
    });
    b.sweep(
      catmull([P(0, 0, -0.108), P(0, 0, 0), P(0, 0, 0.098)]),
      (t: number): [number, number] => {
        const h = ry0(t) * sc;
        return [h * 0.74, h];
      },
      { bone: [back, root, front], color: skin, sides: 10 },
    );

    // Tail fin
    const tailPaint = paint((_p, n, s) => {
      const x = s[0] / sc;
      const y = s[1] / sc;
      const e = Math.hypot(x / 0.082, y / 0.052);
      if (e > 1.02) return BLACK;
      if (e > 0.88) return WHITE;
      return lit(mix(ORANGE_D, ORANGE, smoothstep(0.1, 0.75, e)), n);
    });
    b.extrude(S2(TAIL), {
      at: P(0, 0, -0.1),
      x: D(0, 0, -1),
      y: D(0, 1, 0),
      thickness: 0.0045 * sc,
      color: tailPaint,
      bone: tailBone,
    });

    // Dorsal fin, following the back
    const dorsal = b.joint(`${id}Dorsal`, { parent: root, at: P(0, 0.045, 0), dir: D(0, 0, -1), role: "fan" });
    const lower = US.map((u) => [u * sc, (ry0(tOf(0.062 - u)) - 0.012) * sc] as [number, number]);
    const upper = US.map((u, i) => [u * sc, (ry0(tOf(0.062 - u)) + DORSAL_H[i]) * sc] as [number, number]).reverse();
    const dorsalPaint = paint((_p, n, s) => {
      const u = s[0] / sc;
      const y = s[1] / sc;
      const d = ry0(tOf(0.062 - u)) + hAt(u) - y;
      if (d < 0.0045) return BLACK;
      if (d < 0.0095) return WHITE;
      return lit(mix(ORANGE_D, ORANGE_L, smoothstep(0.01, 0.04, d)), n);
    });
    b.extrude([...lower, ...upper], {
      at: P(0, 0, 0.062),
      x: D(0, 0, -1),
      y: D(0, 1, 0),
      thickness: 0.0038 * sc,
      color: dorsalPaint,
      bone: dorsal,
    });

    // Pectoral fins (Nemo's right one is small)
    const pecPaint = paint((_p, n, s) => {
      const x = s[0] / (sc * (f.rightFin && s[0] < 0 ? 1 : 1));
      if (x > 0.043) return BLACK;
      if (x > 0.036) return WHITE;
      return lit(mix(ORANGE_L, ORANGE, smoothstep(0, 0.03, x)), n);
    });
    for (const s of [1, -1]) {
      const k = s < 0 ? (f.rightFin ?? 1) : 1;
      const pj = b.joint(`${id}Pec${s > 0 ? "L" : "R"}`, {
        parent: front.joints[0],
        at: P(s * 0.03, -0.01, 0.035),
        dir: D(s * 0.4, -0.1, -1),
        role: "fan",
      });
      const fin = paint((_p, n, st) => {
        const x = st[0] / (sc * k);
        if (x > 0.043) return BLACK;
        if (x > 0.036) return WHITE;
        return lit(mix(ORANGE_L, ORANGE, smoothstep(0, 0.03, x)), n);
      });
      b.extrude(S2(PEC, k), {
        at: P(s * 0.029, -0.008, 0.036),
        x: unit(D(s * 0.4, 0, -1)),
        y: D(0, 1, 0),
        thickness: 0.0035 * sc * k,
        color: s < 0 && f.rightFin ? fin : pecPaint,
        bone: pj,
      });
    }

    // Pelvic fins and anal fin
    for (const s of [1, -1]) {
      b.extrude(S2(PELV), {
        at: P(s * 0.016, -0.046, 0.025),
        x: unit(D(s * 0.15, -0.7, -1)),
        y: unit(D(0, 1, -0.7)),
        thickness: 0.003 * sc,
        color: paint((_p, n, st) => {
          const x = st[0] / sc;
          if (x > 0.029) return WHITE;
          if (x > 0.008) return BLACK;
          return lit(ORANGE_D, n);
        }),
        bone: root,
      });
    }
    b.extrude(S2(ANAL), {
      at: P(0, -0.03, -0.04),
      x: D(0, 0, -1),
      y: D(0, 1, 0),
      thickness: 0.0035 * sc,
      color: paint((_p, n, st) => {
        const y = st[1] / sc;
        if (y < -0.021) return WHITE;
        if (y < -0.01) return BLACK;
        return lit(ORANGE_D, n);
      }),
      bone: root,
    });

    // Eyes: cream ball with a drawn pupil conformed onto it
    for (const s of [1, -1]) {
      const eyeC = P(s * 0.029, 0.016, 0.052);
      const out = unit(D(s * 0.9, 0.2, 0.45));
      const rE = 0.0165 * sc;
      const ball = b.part(new THREE.SphereGeometry(rE, 10, 8), "#fff6df", { bone: head, at: eyeC });
      b.decal(ball, EYE, {
        at: [eyeC[0] + out[0] * rE, eyeC[1] + out[1] * rE, eyeC[2] + out[2] * rE],
        dir: out,
        size: [0.025 * sc, 0.025 * sc],
        segments: 6,
        lift: 0.001 * sc,
      });
    }

    // Mouth: a protruding lower jaw on its own joint and a dark slit
    b.part(new THREE.SphereGeometry(1, 7, 5), ORANGE_L, {
      bone: jaw,
      at: P(0, -0.02, 0.094),
      scale: [0.015 * sc, 0.0085 * sc, 0.02 * sc],
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), MOUTH, {
      bone: head,
      at: P(0, -0.0125, 0.1),
      scale: [0.011 * sc, 0.003 * sc, 0.012 * sc],
    });
  };

  clownfish({
    id: "marlin",
    pos: [0.06, 0.36, 0.25],
    yaw: 28,
    sc: 0.9,
    stripes: [
      [0.66, 0.055],
      [0.41, 0.055],
      [0.105, 0.035],
    ],
  });
  clownfish({
    id: "nemo",
    pos: [-0.1, 0.29, 0.32],
    yaw: -30,
    sc: 0.66,
    rightFin: 0.55,
    stripes: [
      [0.66, 0.05],
      [0.42, 0.05],
      [0.11, 0.03],
    ],
  });
  clownfish({
    id: "tiny",
    pos: [0.29, 0.3, 0.26],
    yaw: 62,
    sc: 0.55,
    stripes: [
      [0.66, 0.05],
      [0.42, 0.05],
      [0.11, 0.03],
    ],
  });

  return b.root;
}
```