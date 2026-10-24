```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, svg, paint, noise, mix, smoothstep, rgb, polyline, catmull } from "agentic-3js-builder";
import type { ColorInput, Joint } from "agentic-3js-builder";
import { coil, gaugeTexture, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Tin Wind-Up Robot",
  description:
    "1950s Japanese lithographed tin wind-up robot: scuffed boxy body with printed dials, banner and rivets, accordion arms, pincer hands, a clear spark-filled dome head and a big brass butterfly key in its back.",
};

type V3 = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette (flat colours for drawings and small parts; the big tin surfaces are worn paints)
const BLUE = "#3f86c8";
const NAVY = "#24467a";
const SILVER = "#b9c0ca";
const RED = "#d9382b";
const CREAM = "#f3e6c4";
const YELLOW = "#f6c93a";
const INK = "#1c1b24";
const BRASS = "#d9a441";
const NAVYS = "#1d3a66";

const BARE = rgb("#d4d7db");
const RUSTC = rgb("#8b5a3c");

// ---------------------------------------------------------------------------------------------------------------
// Worn tin paint: scuffs at edges, chipped specks, bare tin and rust showing through, warm top light
const boxEdge = (c: V3, h: V3) => (p: THREE.Vector3) => {
  const d = [h[0] - Math.abs(p.x - c[0]), h[1] - Math.abs(p.y - c[1]), h[2] - Math.abs(p.z - c[2])].sort(
    (a, b) => a - b,
  );
  return d[1];
};
const cylEdge = (a: V3, c: V3) => {
  const av = new THREE.Vector3(...a);
  const dir = new THREE.Vector3(...c).sub(av);
  const len = dir.length();
  dir.normalize();
  const q = new THREE.Vector3();
  return (p: THREE.Vector3) => {
    const along = q.copy(p).sub(av).dot(dir);
    return Math.max(0, Math.min(along, len - along));
  };
};
function worn(base: string, edge: (p: THREE.Vector3) => number, seed: number) {
  const c0 = rgb(base);
  return paint((p, n) => {
    const e = edge(p);
    const t = 0.0012 + 0.006 * noise(p, 0.018, seed);
    let w = 1 - smoothstep(t * 0.55, t, e);
    const chip = smoothstep(0.66, 0.72, noise(p, 0.007, seed + 2)) * smoothstep(0.42, 0.55, noise(p, 0.05, seed + 5));
    w = Math.max(w, chip);
    const rust = smoothstep(0.55, 0.78, noise(p, 0.012, seed + 7)) * 0.75;
    const col = mix(c0, mix(BARE, RUSTC, rust), w);
    const k = 0.88 + 0.16 * Math.max(-1, Math.min(1, n.y));
    return [Math.min(col[0] * (k + 0.02), 1), Math.min(col[1] * k, 1), Math.min(col[2] * (k - 0.02), 1)] as const;
  });
}
const chipsOnly = (base: string, seed: number) => worn(base, () => 1, seed);

// ---------------------------------------------------------------------------------------------------------------
// SVG drawing helpers
const starPts = (cx: number, cy: number, R: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r : R;
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

function scratches(r: () => number, w: number, h: number, n: number, col = "#dfe6ee") {
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = 4 + r() * (w - 8);
    const y = 4 + r() * (h - 8);
    const a = r() * Math.PI;
    const l = 3 + r() * 6;
    s += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} l${(Math.cos(a) * l).toFixed(1)} ${(Math.sin(a) * l).toFixed(1)}" stroke="${col}" stroke-width="1" stroke-linecap="round"/>`;
  }
  return s;
}

function ticks(cx: number, cy: number, r0: number, r1: number, n: number, a0: number, a1: number, w: number, col: string) {
  let s = "";
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    const x0 = cx + r0 * Math.sin(a);
    const y0 = cy - r0 * Math.cos(a);
    const x1 = cx + r1 * Math.sin(a);
    const y1 = cy - r1 * Math.cos(a);
    s += `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
  }
  return s;
}

const FONT = `font-family="Impact, 'Arial Black', sans-serif" font-weight="900"`;

function chestTex(r: () => number) {
  return svg(
    `<svg viewBox="0 0 140 98">
    <rect x="2.5" y="2.5" width="135" height="93" rx="7" fill="none" stroke="${CREAM}" stroke-width="2.4"/>
    <rect x="6.5" y="6.5" width="127" height="85" rx="5" fill="none" stroke="${NAVYS}" stroke-width="1.3"/>
    <circle cx="106" cy="24" r="21.5" fill="${CREAM}" stroke="${NAVYS}" stroke-width="1.8"/>
    <circle cx="34" cy="24" r="20" fill="${CREAM}" stroke="${NAVYS}" stroke-width="1.8"/>
    ${ticks(34, 24, 15, 19, 10, -135, 135, 1.6, NAVYS)}
    ${[46, 70, 94].map((x) => `<circle cx="${x}" cy="50" r="8.5" fill="#2a1a10" stroke="#c9972e" stroke-width="2.4"/>`).join("")}
    <rect x="12" y="62" width="116" height="28" rx="6" fill="${RED}" stroke="${CREAM}" stroke-width="2"/>
    <text x="70" y="84" text-anchor="middle" ${FONT} font-size="25" letter-spacing="3" fill="${CREAM}" stroke="#7a1a12" stroke-width="1">ROBOT</text>
    <polygon points="${starPts(23, 76, 6.5, 2.7)}" fill="${YELLOW}"/>
    <polygon points="${starPts(117, 76, 6.5, 2.7)}" fill="${YELLOW}"/>
    ${scratches(r, 140, 98, 9)}
  </svg>`,
    { size: 512 },
  );
}

function backTex(r: () => number) {
  const vents = (x: number) =>
    [13, 18, 23].map((y) => `<rect x="${x}" y="${y}" width="16" height="2.6" rx="1.3" fill="${INK}"/>`).join("");
  return svg(
    `<svg viewBox="0 0 140 98">
    <rect x="2.5" y="2.5" width="135" height="93" rx="7" fill="none" stroke="${CREAM}" stroke-width="2.4"/>
    <rect x="6.5" y="6.5" width="127" height="85" rx="5" fill="none" stroke="${NAVYS}" stroke-width="1.3"/>
    <text x="70" y="19" text-anchor="middle" ${FONT} font-size="13" letter-spacing="2" fill="${CREAM}">WIND UP</text>
    <path d="M70 25 A24 24 0 1 1 46 49" stroke="${YELLOW}" stroke-width="3" fill="none" stroke-dasharray="6 3.5"/>
    <polygon points="40,49 52,49 46,39" fill="${YELLOW}"/>
    ${vents(10)}${vents(114)}
    <rect x="14" y="76" width="32" height="8" rx="4" fill="${INK}" stroke="${CREAM}" stroke-width="1.4"/>
    <text x="14" y="91" font-family="sans-serif" font-weight="bold" font-size="6.5" fill="${CREAM}">GO</text>
    <text x="38" y="91" font-family="sans-serif" font-weight="bold" font-size="6.5" fill="${CREAM}">STOP</text>
    <text x="102" y="80" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="8" fill="${CREAM}">MADE IN</text>
    <text x="102" y="91" text-anchor="middle" ${FONT} font-size="11" letter-spacing="1" fill="${YELLOW}">JAPAN</text>
    ${scratches(r, 140, 98, 8)}
  </svg>`,
    { size: 512 },
  );
}

function sideTex(r: () => number) {
  return svg(
    `<svg viewBox="0 0 80 60">
    <rect x="2" y="2" width="76" height="56" rx="6" fill="none" stroke="${CREAM}" stroke-width="2"/>
    <circle cx="40" cy="30" r="24" fill="${YELLOW}" stroke="${RED}" stroke-width="3"/>
    <polygon points="44,9 28,34 38,34 33,52 54,25 43,25" fill="${RED}" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>
    <circle cx="9" cy="9" r="2.4" fill="${CREAM}"/><circle cx="71" cy="9" r="2.4" fill="${CREAM}"/>
    <circle cx="9" cy="51" r="2.4" fill="${CREAM}"/><circle cx="71" cy="51" r="2.4" fill="${CREAM}"/>
    ${scratches(r, 80, 60, 5)}
  </svg>`,
    { size: 384 },
  );
}

function beltTex() {
  let sq = "";
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 15; col++)
      sq += `<rect x="${col * 9}" y="${row * 9}" width="9" height="9" fill="${(row + col) % 2 ? RED : CREAM}"/>`;
  return svg(
    `<svg viewBox="0 0 130 36">${sq}<rect x="0.8" y="0.8" width="128.4" height="34.4" fill="none" stroke="${INK}" stroke-width="1.6"/></svg>`,
    { size: 512 },
  );
}

function faceTex() {
  return svg(
    `<svg viewBox="0 0 104 40">
    <path d="M10 8 Q26 -1 42 7" stroke="${INK}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    <path d="M62 7 Q78 -1 94 8" stroke="${INK}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    <circle cx="26" cy="20" r="14" fill="${CREAM}" stroke="${RED}" stroke-width="2"/>
    <circle cx="78" cy="20" r="14" fill="${CREAM}" stroke="${RED}" stroke-width="2"/>
    <circle cx="8" cy="31" r="4.6" fill="#f0867a"/><circle cx="96" cy="31" r="4.6" fill="#f0867a"/>
    <polygon points="52,16 47,26 57,26" fill="${INK}"/>
    <path d="M4 38 L14 38 M90 38 L100 38" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`,
    { size: 512 },
  );
}

function jawTex() {
  let teeth = "";
  for (let i = 0; i < 9; i++)
    teeth += `<rect x="${7 + i * 9.4}" y="2" width="5.4" height="9" rx="1" fill="${CREAM}"/>`;
  return svg(
    `<svg viewBox="0 0 92 13"><rect x="0.8" y="0.8" width="90.4" height="11.4" rx="3.5" fill="${INK}" stroke="${CREAM}" stroke-width="1.4"/>${teeth}</svg>`,
    { size: 512 },
  );
}

function starTex() {
  return svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="${CREAM}" stroke="${INK}" stroke-width="3"/><polygon points="${starPts(32, 33, 23, 9.5)}" fill="${RED}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/></svg>`,
    { size: 128 },
  );
}

function domeTex() {
  const FR = "#a9dff2";
  let mer = "";
  for (let i = 0; i <= 8; i++) mer += `<path d="M${i * 32} 6 L${i * 32} 64" stroke="${FR}" stroke-width="3"/>`;
  const glint = (o: number) =>
    `<path d="M${o + 44} 56 Q${o + 40} 36 ${o + 52} 14" stroke="#f4fcff" stroke-width="5" fill="none" stroke-linecap="round"/>
     <path d="M${o + 54} 50 Q${o + 52} 42 ${o + 56} 32" stroke="#f4fcff" stroke-width="3.4" fill="none" stroke-linecap="round"/>
     <circle cx="${o + 47}" cy="62" r="2.2" fill="#f4fcff"/>`;
  return svg(
    `<svg viewBox="0 0 256 64">
    ${mer}
    <path d="M0 20 L256 20 M0 40 L256 40" stroke="${FR}" stroke-width="3"/>
    <rect x="0" y="0" width="256" height="8" fill="#c9972e"/>
    <rect x="0" y="58" width="256" height="6" fill="#c9972e"/>
    ${glint(0)}${glint(128)}
  </svg>`,
    { size: 512 },
  );
}

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "tin-robot" });
  const rand = rng(11);

  const BRASSP = metal("brass", { polish: 0.7, tarnish: 0.2, size: 0.03 });
  const GILTP = metal("gilt", { size: 0.03 });
  const STEELP = metal("steel", { polish: 0.55, tarnish: 0.25, size: 0.04 });
  const COPPERP = metal("copper", { size: 0.03 });

  const CHEST = chestTex(rng(21));
  const BACK = backTex(rng(22));
  const SIDE = sideTex(rng(23));
  const BELT = beltTex();
  const FACE = faceTex();
  const JAW = jawTex();
  const STAR = starTex();
  const DOME = domeTex();
  const GAUGE = gaugeTexture({ needle: 50, label: "STEAM" });

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 0.105, 0], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.15, 0], dir: [0, 1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.236, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.25, 0], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.265, -0.03], aim: [0, 0.265, 0.04], role: "jaw" });
  const key = b.joint("key", { parent: chest, at: [0, 0.18, -0.05], dir: [0, 0, -1], role: "hinge" });

  // ---- helpers
  const box = (size: V3, color: ColorInput, at: V3, bone: Joint) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at });
  const cyl = (r: number, h: number, color: ColorInput, at: V3, dir: V3, bone: Joint, seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at, dir });
  const ball = (r: number, color: ColorInput, at: V3, bone: Joint, seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(3, seg >> 1)), color, { bone, at });
  const plate = (tex: THREE.Texture, w: number, h: number, at: V3, dir: V3, bone: Joint) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });
  const tube = (a: V3, c: V3, r: number, base: string, bone: Joint, seed: number, seg = 12) => {
    const av = new THREE.Vector3(...a);
    const cv = new THREE.Vector3(...c);
    const h = av.distanceTo(cv);
    const m = av.clone().add(cv).multiplyScalar(0.5);
    return b.part(new THREE.CylinderGeometry(r, r, h, seg), worn(base, cylEdge(a, c), seed), {
      bone,
      at: m,
      dir: cv.clone().sub(av),
    });
  };
  const studs = (pts: V3[], r: number, color: string, bone: Joint) => {
    const geos = pts.map(([x, y, z]) => new THREE.SphereGeometry(r, 6, 4).translate(x, y, z));
    return b.part(mergeGeometries(geos)!, color, { bone, at: [0, 0, 0] });
  };
  const accordion = (a: THREE.Vector3, c: THREE.Vector3, R: number, n: number, bone: Joint, color: ColorInput) => {
    const d = c.clone().sub(a);
    const L = d.length();
    d.normalize();
    const o: [number, number][] = [[0, 0]];
    for (let i = 0; i <= n; i++) o.push([i % 2 === 0 ? R : R * 0.72, (i * L) / n]);
    o.push([0, L]);
    return b.lathe(o, { at: a, axis: d, segments: 10, bone, color });
  };

  const chestRivets: V3[] = [];
  const hipRivets: V3[] = [];
  const headRivets: V3[] = [];

  // ---- pelvis & belt
  box([0.136, 0.04, 0.085], worn(NAVY, boxEdge([0, 0.105, 0], [0.068, 0.02, 0.0425]), 31), [0, 0.105, 0], hips);
  plate(BELT, 0.13, 0.036, [0, 0.105, 0.044], [0, 0, 1], hips);
  cyl(0.0125, 0.004, GILTP, [0, 0.105, 0.046], [0, 0, 1], hips, 14);
  b.part(new THREE.CircleGeometry(0.0095, 14), "#ffffff", {
    bone: hips,
    at: [0, 0.105, 0.0483],
    dir: [0, 0, 1],
    axis: "z",
    texture: STAR,
  });
  for (const s of [1, -1]) {
    cyl(0.009, 0.012, BRASSP, [s * 0.068, 0.105, 0], [s, 0, 0], hips, 10);
    hipRivets.push([s * 0.064, 0.094, 0.0425], [s * 0.064, 0.116, 0.0425]);
  }

  // ---- torso
  const TC: V3 = [0, 0.18, 0];
  box([0.15, 0.11, 0.1], worn(BLUE, boxEdge(TC, [0.075, 0.055, 0.05]), 3), TC, chest);
  box([0.16, 0.008, 0.11], worn(RED, boxEdge([0, 0.239, 0], [0.08, 0.004, 0.055]), 5), [0, 0.239, 0], chest);
  box([0.158, 0.008, 0.108], worn(NAVY, boxEdge([0, 0.127, 0], [0.079, 0.004, 0.054]), 6), [0, 0.127, 0], chest);
  // folded tin tabs along the bottom lip
  for (let i = 0; i < 6; i++)
    box([0.014, 0.004, 0.004], chipsOnly(NAVY, 40 + i), [-0.05 + i * 0.02, 0.121, 0.0555], chest);

  plate(CHEST, 0.14, 0.098, [0, 0.18, 0.0515], [0, 0, 1], chest);
  plate(BACK, 0.14, 0.098, [0, 0.18, -0.0515], [0, 0, -1], chest);
  for (const s of [1, -1]) plate(SIDE, 0.08, 0.06, [s * 0.0765, 0.157, 0], [s, 0, 0], chest);

  // dials, knob, lamps
  cyl(0.0235, 0.006, GILTP, [0.036, 0.205, 0.053], [0, 0, 1], chest, 16);
  b.part(new THREE.CircleGeometry(0.0205, 20), "#ffffff", {
    bone: chest,
    at: [0.036, 0.205, 0.0565],
    dir: [0, 0, 1],
    axis: "z",
    texture: GAUGE,
  });
  tube([-0.036, 0.205, 0.0515], [-0.036, 0.205, 0.0625], 0.0125, RED, chest, 52, 12);
  cyl(0.008, 0.004, BRASSP, [-0.036, 0.205, 0.0635], [0, 0, 1], chest, 10);
  box([0.0016, 0.009, 0.002], INK, [-0.036, 0.2095, 0.0658], chest);
  for (const l of [
    { c: "#ff4a3a", x: -0.024 },
    { c: "#ffd23a", x: 0 },
    { c: "#5be06a", x: 0.024 },
  ])
    glow(ball(0.0058, l.c, [l.x, 0.179, 0.0535], chest, 8), 1.2);

  // rivets around plates
  for (let i = 0; i < 6; i++) {
    const y = 0.138 + i * 0.0176;
    for (const x of [-0.0725, 0.0725]) {
      chestRivets.push([x, y, 0.0505]);
      chestRivets.push([x, y, -0.0505]);
    }
  }

  // ---- shoulders
  for (const s of [1, -1]) {
    tube([s * 0.075, 0.208, 0], [s * 0.091, 0.208, 0], 0.023, RED, chest, 60 + s, 14);
    for (let k = 0; k < 4; k++) {
      const a = (Math.PI / 4) * (1 + 2 * k);
      chestRivets.push([s * 0.0915, 0.208 + 0.0205 * Math.cos(a), 0.0205 * Math.sin(a)]);
    }
  }

  // ---- neck & head
  accordion(new THREE.Vector3(0, 0.241, 0), new THREE.Vector3(0, 0.2495, 0), 0.027, 4, neck, STEELP);

  const HC: V3 = [0, 0.287, 0];
  box([0.11, 0.044, 0.09], worn(SILVER, boxEdge(HC, [0.055, 0.022, 0.045]), 71), HC, head);
  box([0.1, 0.016, 0.078], worn(RED, boxEdge([0, 0.257, 0.003], [0.05, 0.008, 0.039]), 72), [0, 0.257, 0.003], jaw);
  box([0.112, 0.005, 0.092], worn(RED, boxEdge([0, 0.3065, 0], [0.056, 0.0025, 0.046]), 73), [0, 0.3065, 0], head);
  box([0.102, 0.004, 0.08], worn(NAVY, boxEdge([0, 0.251, 0.003], [0.051, 0.002, 0.04]), 74), [0, 0.251, 0.003], jaw);
  plate(FACE, 0.104, 0.04, [0, 0.287, 0.0465], [0, 0, 1], head);
  plate(JAW, 0.092, 0.013, [0, 0.257, 0.0435], [0, 0, 1], jaw);
  for (const s of [1, -1]) {
    // eyes: dark socket, glowing lens, pupil
    cyl(0.0125, 0.006, INK, [s * 0.026, 0.287, 0.0485], [0, 0, 1], head, 14);
    glow(ball(0.0095, "#ffe27a", [s * 0.026, 0.287, 0.0505], head, 10), 1.2);
    ball(0.004, INK, [s * 0.026, 0.287, 0.0585], head, 6);
    // ear knobs
    tube([s * 0.055, 0.287, 0], [s * 0.067, 0.287, 0], 0.0155, RED, head, 80 + s, 14);
    cyl(0.011, 0.004, BRASSP, [s * 0.0675, 0.287, 0], [s, 0, 0], head, 12);
    b.part(new THREE.CircleGeometry(0.0095, 14), "#ffffff", {
      bone: head,
      at: [s * 0.0705, 0.287, 0],
      dir: [s, 0, 0],
      axis: "z",
      texture: STAR,
    });
    headRivets.push([s * 0.0535, 0.272, 0.045], [s * 0.0535, 0.302, 0.045]);
  }

  // ---- clear dome with sparks
  b.lathe(
    [
      [0.0405, 0],
      [0.0535, 0],
      [0.0535, 0.005],
      [0.0505, 0.0075],
      [0.0415, 0.0075],
    ],
    { at: [0, 0.309, 0], axis: [0, 1, 0], segments: 16, bone: head, color: chipsOnly(RED, 90) },
  );
  cyl(0.0425, 0.002, "#262a3d", [0, 0.3105, 0], [0, 1, 0], head, 16);
  b.part(new THREE.SphereGeometry(0.0435, 16, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#ffffff", {
    bone: head,
    at: [0, 0.3135, 0],
    texture: DOME,
  });
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    headRivets.push([0.0505 * Math.sin(a), 0.3155, 0.0505 * Math.cos(a)]);
  }
  cyl(0.008, 0.01, BRASSP, [0, 0.3155, 0], [0, 1, 0], head, 10);
  cyl(0.0025, 0.016, BRASSP, [0, 0.3285, 0], [0, 1, 0], head, 6);
  b.sweep(coil([0, 0.322, 0], [0, 0.332, 0], 0.0065, 4), 0.0012, { bone: head, color: COPPERP, sides: 4 });
  const BALL: V3 = [0, 0.3355, 0];
  glow(ball(0.0065, "#fff6c8", BALL, head, 8), 2);
  const DC = new THREE.Vector3(0, 0.3135, 0);
  for (let k = 0; k < 7; k++) {
    const az = k * ((Math.PI * 2) / 7) + rand() * 0.4;
    const el = ((12 + rand() * 52) * Math.PI) / 180;
    const dir = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
    const end = DC.clone().addScaledVector(dir, 0.037);
    const ballV = new THREE.Vector3(...BALL);
    const jit = () => (rand() - 0.5) * 0.01;
    const m1 = ballV.clone().lerp(end, 0.4).add(new THREE.Vector3(jit(), jit(), jit()));
    const m2 = ballV.clone().lerp(end, 0.75).add(new THREE.Vector3(jit(), jit(), jit()));
    const bolt = b.sweep(polyline([ballV.toArray(), m1.toArray(), m2.toArray(), end.toArray()]), 0.0016, {
      section: { ngon: 3 },
      caps: "flat",
      bone: head,
      color: k % 2 ? "#ffe66b" : "#bfeaff",
    });
    glow(bolt, 1.4);
  }
  for (const col of ["#ffe66b", "#bfeaff"]) {
    const octs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      const az = rand() * Math.PI * 2;
      const el = (15 + rand() * 60) * (Math.PI / 180);
      const rr = 0.012 + rand() * 0.02;
      octs.push(
        new THREE.OctahedronGeometry(0.0018 + rand() * 0.0014, 0).translate(
          rr * Math.cos(el) * Math.sin(az),
          0.3135 + rr * Math.sin(el) + 0.004,
          rr * Math.cos(el) * Math.cos(az),
        ),
      );
    }
    glow(b.part(mergeGeometries(octs)!, col, { bone: head, at: [0, 0, 0] }), 1.6);
  }

  // ---- wind-up key
  b.rod([0, 0.18, -0.05], [0, 0.18, -0.084], 0.0055, BRASSP, { bone: key, sides: 8 });
  cyl(0.02, 0.003, GILTP, [0, 0.18, -0.0535], [0, 0, -1], chest, 18);
  cyl(0.011, 0.004, BRASSP, [0, 0.18, -0.0825], [0, 0, -1], key, 10);
  const half: [number, number][] = [
    [0.004, -0.006],
    [0.014, -0.012],
    [0.03, -0.016],
    [0.038, -0.006],
    [0.038, 0.012],
    [0.03, 0.022],
    [0.014, 0.018],
    [0.005, 0.008],
  ];
  const bow: [number, number][] = [...half, ...half.slice().reverse().map(([x, y]) => [-x, y] as [number, number])];
  b.extrude(bow, {
    at: [0, 0.18, -0.0875],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.007,
    bevel: 0.002,
    smoothing: 1,
    color: BRASSP,
    bone: key,
  });
  ball(0.007, GILTP, [0, 0.182, -0.0905], key, 8);
  // start/stop lever in its slot
  b.rod([0.04, 0.149, -0.0505], [0.04, 0.149, -0.06], 0.0025, STEELP, { bone: chest, sides: 6 });
  ball(0.0055, RED, [0.04, 0.149, -0.061], chest, 8);

  // ---- legs
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const hip: V3 = [s * 0.04, 0.1, 0];
    const knee: V3 = [s * 0.04, 0.062, 0];
    const ankle: V3 = [s * 0.04, 0.024, 0];
    const leg = b.chain(`leg${n}`, polyline([hip, knee, ankle]), {
      parent: hips,
      names: [`hip${n}`, `knee${n}`, `ankle${n}`],
      role: "leg",
      contact: [s * 0.04, 0, 0.01],
    });
    const [hipJ, kneeJ, ankleJ] = leg.joints;
    tube(hip, knee, 0.0205, RED, hipJ, 100 + s, 12);
    tube(knee, ankle, 0.0195, RED, kneeJ, 110 + s, 12);
    cyl(0.0228, 0.012, BRASSP, knee, [0, 1, 0], kneeJ, 12);
    cyl(0.0225, 0.006, BRASSP, [s * 0.04, 0.032, 0], [0, 1, 0], kneeJ, 12);
    // foot
    b.extrude(
      [
        [-0.038, 0],
        [0.05, 0],
        [0.058, 0.007],
        [0.056, 0.016],
        [0.045, 0.022],
        [-0.038, 0.022],
      ],
      {
        at: [s * 0.04, 0, 0.005],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.062,
        bevel: 0.002,
        color: worn(NAVY, boxEdge([s * 0.04, 0.011, 0.01], [0.031, 0.011, 0.048]), 120 + s),
        bone: ankleJ,
      },
    );
    box([0.064, 0.003, 0.01], BRASSP, [s * 0.04, 0.0235, 0.03], ankleJ);
    for (let g = 0; g < 3; g++) box([0.052, 0.0015, 0.0015], INK, [s * 0.04, 0.0222, 0.044 + g * 0.004], ankleJ);
  }

  // ---- arms with accordion tubes and pincer hands
  const up = new THREE.Vector3(0, 1, 0);
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const S = new THREE.Vector3(s * 0.088, 0.208, 0);
    const u1 = new THREE.Vector3(s * 0.8, -0.35, 0.2).normalize();
    const u2 = new THREE.Vector3(s * 0.6, -0.45, 0.55).normalize();
    const E = S.clone().addScaledVector(u1, 0.07);
    const W = E.clone().addScaledVector(u2, 0.07);
    const arm = b.chain(`arm${n}`, polyline([S.toArray(), E.toArray(), W.toArray()]), {
      parent: chest,
      names: [`shoulder${n}`, `elbow${n}`, `wrist${n}`],
      role: "arm",
    });
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.tip!;
    accordion(S, E, 0.017, 8, shoulder, STEELP);
    accordion(E, W, 0.016, 8, elbow, STEELP);
    ball(0.0175, BRASSP, E.toArray() as V3, elbow, 8);
    const cuffA = W.clone().addScaledVector(u2, -0.008).toArray() as V3;
    const cuffB = W.clone().addScaledVector(u2, 0.004).toArray() as V3;
    tube(cuffA, cuffB, 0.0165, RED, wrist, 130 + s, 12);
    ball(0.0145, chipsOnly(RED, 140 + s), W.clone().addScaledVector(u2, 0.009).toArray() as V3, wrist, 8);
    const perp = new THREE.Vector3().crossVectors(u2, up).normalize();
    for (const k of [1, -1]) {
      const base = W.clone().addScaledVector(u2, 0.008).addScaledVector(perp, k * 0.01);
      const mid = W.clone().addScaledVector(u2, 0.03).addScaledVector(perp, k * 0.015);
      const tip = W.clone().addScaledVector(u2, 0.05).addScaledVector(perp, k * 0.006);
      const cj = b.joint(`claw${k > 0 ? "A" : "B"}${n}`, {
        parent: wrist,
        at: base.toArray() as V3,
        aim: tip.toArray() as V3,
        role: "digit",
      });
      b.sweep(catmull([base.toArray(), mid.toArray(), tip.toArray()]), [0.0065, 0.0025], {
        bone: cj,
        color: chipsOnly(RED, 150 + k + s * 3),
        sides: 6,
      });
    }
  }

  // ---- rivet groups
  studs(chestRivets, 0.0028, BRASS, chest);
  studs(hipRivets, 0.0026, BRASS, hips);
  studs(headRivets, 0.0026, BRASS, head);

  return b.root;
}
```