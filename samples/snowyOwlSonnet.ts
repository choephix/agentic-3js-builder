import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { cells, noise, paint, smoothstep } from "../src/paint";
import { svg } from "../src/texture";
import { cel, zigzag } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Moonfeather, the Snowy Owl",
  description:
    "A snowy owl mantling on a mossy stump with both wings thrown wide, in a high-fantasy anime key: cel-shaded plumage with lavender shadows, barred flight feathers, big golden eyes, a gold circlet, bracers and anklets, and glowing moon-mushrooms and runes on the stump.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const PLUM = "#5e4a5c"; // bar colour on the plumage
const WHITE = cel("#fcfdff", "#c6cbf3");
const CLAW = "#2b2433";
const BEAK = cel("#33293a", "#1b1424");
const GOLD = cel("#ffd35a", "#c9782c");
const GEM = "#6fe3ff";
const GEM_DEEP = "#2a6fd6";
const SNOW = cel("#ffffff", "#a9baf2");
const MOSS = cel("#5fae6a", "#27705f");
const STEM = cel("#f6e8d4", "#c9a2b4");
const WOOD_RING = "#b9824a";
const WOOD_LIGHT = "#ecc486";
const WOOD_CRACK = "#7d5532";

// ---------------------------------------------------------------- paints
const spineDir = new THREE.Vector3(0, 0.72, 0.69);
const bodyBars = paint((p, n) => {
  const u = p.dot(spineDir);
  const chevron = Math.abs(p.x) * 0.5;
  const wob = (noise(p, 0.08, 5) - 0.5) * 0.018;
  const ph = (u - chevron + wob) / 0.034;
  const f = ph - Math.floor(ph);
  const zone = smoothstep(0.27, 0.36, u) * (1 - smoothstep(0.66, 0.74, u));
  const barW = 0.1 + 0.26 * zone;
  if (n.y > 0.45 && u > 0.3) {
    const c = cells(p, 0.052, 2);
    return c.d1 < 0.0125 ? PLUM : "#ffffff";
  }
  return f < barW && zone > 0.2 ? PLUM : "#ffffff";
});
const BODY = cel(bodyBars);

const headSpots = paint((p, n) => {
  if (n.y < 0.15) return "#ffffff";
  const c = cells(p, 0.034, 9);
  return c.d1 < 0.0085 ? PLUM : "#ffffff";
});
const HEAD = cel(headSpots);

const shoulderSpots = paint((p) => {
  const c = cells(p, 0.04, 14);
  return c.d1 < 0.011 ? PLUM : "#ffffff";
});
const ARM = cel(shoulderSpots);

const barkTone = paint((p) => {
  const q = new THREE.Vector3(p.x * 5, p.y * 0.8, p.z * 5);
  const g = noise(q, 0.12, 2);
  const fine = noise(new THREE.Vector3(p.x * 9, p.y * 1.1, p.z * 9), 0.06, 7);
  if (g < 0.28 || (fine < 0.1 && g < 0.55)) return "#4a3434";
  if (g > 0.72) return "#a3765a";
  return g > 0.5 ? "#85594a" : "#6f4c3d";
});
const BARK = cel(barkTone);
const topRings = paint((p) => {
  const r = Math.hypot(p.x, p.z) + (noise(p, 0.07, 3) - 0.5) * 0.02;
  const ang = Math.atan2(p.z, p.x);
  const crack = Math.abs(Math.sin(ang * 3.5 + 0.7)) < 0.045 && r > 0.04 && r < 0.2;
  if (crack) return WOOD_CRACK;
  if (r < 0.014) return "#8b5a2f";
  const band = (r / 0.024) % 1;
  return band < 0.3 ? WOOD_RING : WOOD_LIGHT;
});
const TOPWOOD = cel(topRings, "#c58f66");
const stumpPaint = paint((p, n) => {
  const ang = Math.atan2(p.z, p.x);
  const snowLine = 0.06 + 0.05 * zigzag((ang * 0.215) / 0.05 * 0.05 + 0.1) * 1.0 + 0.02 * noise(p, 0.1, 6);
  if (n.y > 0.85 && p.y > 0.38) return TOPWOOD;
  if (p.y < snowLine) return SNOW;
  const knot = Math.hypot(p.x - 0.09, p.y - 0.2, (p.z - 0.205) * 0.9);
  if (knot < 0.05 && n.z > 0.2) return knot < 0.035 ? "#1d1424" : "#4a3030";
  return BARK;
});
const moundPaint = paint((p) => {
  const n1 = noise(p, 0.14, 8);
  return n1 > 0.62 ? cel("#f1f5ff", "#9db1ee") : SNOW;
});

// ---------------------------------------------------------------- drawings
type FeatherSpec = {
  fill: string;
  shade: string;
  edge: string;
  bars?: [number, number][];
  barColor?: string;
  tipFrac?: number;
  tipColor?: string;
  rachis?: string;
  crescent?: string;
  stroke?: number;
};
function featherSvg(w: number, h: number, o: FeatherSpec) {
  const cx = w / 2;
  const outline = `M${cx} 1.5 C${w - 1.5} 1.5 ${w - 1.5} ${h * 0.25} ${w - 1.5} ${h * 0.5} C${w - 1.5} ${h * 0.76} ${cx + 2.5} ${h * 0.94} ${cx + 1} ${h - 1} L${cx - 1} ${h - 1} C${cx - 2.5} ${h * 0.94} 1.5 ${h * 0.76} 1.5 ${h * 0.5} C1.5 ${h * 0.25} 1.5 1.5 ${cx} 1.5 Z`;
  const curve = w * 0.2;
  let inner = `<rect x="0" y="0" width="${w}" height="${h}" fill="${o.fill}"/>`;
  inner += `<rect x="0" y="0" width="${cx}" height="${h}" fill="${o.shade}"/>`;
  for (const [y0, t] of o.bars ?? []) {
    const y = y0 * h;
    const th = t * h;
    inner += `<path d="M0 ${y} Q${cx} ${y + curve} ${w} ${y} L${w} ${y + th} Q${cx} ${y + th + curve} 0 ${y + th} Z" fill="${o.barColor ?? PLUM}"/>`;
  }
  if (o.tipFrac) {
    const ty = o.tipFrac * h;
    inner += `<path d="M0 0 H${w} V${ty} Q${cx} ${ty + curve * 1.4} 0 ${ty} Z" fill="${o.tipColor ?? PLUM}"/>`;
  }
  if (o.crescent) {
    const y = h * 0.28;
    inner += `<path d="M${w * 0.12} ${y} Q${cx} ${y + curve * 2.6} ${w * 0.88} ${y} Q${cx} ${y + curve * 1.1} ${w * 0.12} ${y} Z" fill="${o.crescent}"/>`;
  }
  const sw = o.stroke ?? 1.7;
  const shaft = o.rachis ? `<path d="M${cx} 4 L${cx} ${h - 1}" stroke="${o.rachis}" stroke-width="${sw}" fill="none"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><clipPath id="c"><path d="${outline}"/></clipPath></defs><g clip-path="url(#c)">${inner}</g>${shaft}<path d="${outline}" fill="none" stroke="${o.edge}" stroke-width="${sw}"/></svg>`;
}
const F_EDGE = "#a9aed2";
const F_SHADE = "#e1e5fb";
const PRIMARY = svg(
  featherSvg(30, 128, {
    fill: "#ffffff",
    shade: F_SHADE,
    edge: F_EDGE,
    bars: [
      [0.3, 0.06],
      [0.46, 0.06],
      [0.62, 0.05],
    ],
    tipFrac: 0.13,
    rachis: "#8a85a8",
  }),
  { size: 256 },
);
const SECONDARY = svg(
  featherSvg(34, 110, {
    fill: "#ffffff",
    shade: F_SHADE,
    edge: F_EDGE,
    bars: [
      [0.2, 0.07],
      [0.4, 0.07],
      [0.6, 0.06],
    ],
    rachis: "#8a85a8",
  }),
  { size: 256 },
);
const TERTIAL = svg(
  featherSvg(36, 100, {
    fill: "#ffffff",
    shade: F_SHADE,
    edge: F_EDGE,
    bars: [
      [0.22, 0.09],
      [0.46, 0.09],
    ],
    tipFrac: 0.09,
    tipColor: "#8f7a86",
    rachis: "#8a85a8",
  }),
  { size: 256 },
);
const COVERT = svg(featherSvg(32, 60, { fill: "#ffffff", shade: F_SHADE, edge: F_EDGE, crescent: PLUM, stroke: 1.1 }), { size: 192 });
const COVERT_PLAIN = svg(featherSvg(32, 60, { fill: "#ffffff", shade: F_SHADE, edge: F_EDGE, stroke: 1.1 }), { size: 192 });
const TAILF = svg(
  featherSvg(34, 100, {
    fill: "#ffffff",
    shade: F_SHADE,
    edge: F_EDGE,
    bars: [
      [0.28, 0.08],
      [0.46, 0.08],
      [0.64, 0.07],
    ],
    tipFrac: 0.0,
    rachis: "#8a85a8",
  }),
  { size: 256 },
);
const FLUFF_EDGE = "#bfc3e6";
const FLUFF = svg(featherSvg(26, 34, { fill: "#ffffff", shade: F_SHADE, edge: FLUFF_EDGE, stroke: 0.75 }), { size: 192 });
const FLUFF_BAR = svg(featherSvg(26, 34, { fill: "#ffffff", shade: F_SHADE, edge: FLUFF_EDGE, crescent: PLUM, stroke: 0.75 }), { size: 192 });
const FLUFF_FINE = svg(featherSvg(18, 40, { fill: "#ffffff", shade: F_SHADE, edge: FLUFF_EDGE, stroke: 0.7 }), { size: 192 });
const BRISTLE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 40"><path d="M6 1 C10 6 9 28 7 39 L5 39 C3 28 2 6 6 1 Z" fill="#fff6e4" stroke="#b9a58a" stroke-width="1.2"/></svg>`,
  { size: 160 },
);
const GRASS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64"><g fill="#d8b160" stroke="#8a6a32" stroke-width="1.4"><path d="M6 63 C8 40 10 22 4 4 C14 18 18 40 17 63 Z"/><path d="M16 63 C19 36 24 18 24 2 C31 20 30 42 28 63 Z"/><path d="M28 63 C30 44 36 26 46 8 C44 30 42 48 40 63 Z"/></g><g fill="#ffffff" stroke="#b9c6f0" stroke-width="1.2"><path d="M4 8 C8 12 9 14 6 20 C4 16 3 12 4 8 Z"/><path d="M23 6 C27 10 28 13 25 19 C23 15 22 10 23 6 Z"/><path d="M44 12 C45 16 44 18 41 22 C41 18 42 14 44 12 Z"/></g></svg>`,
  { size: 192 },
);
const MOSS_TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><g fill="#78cf6a" stroke="#2f7a58" stroke-width="1.4"><path d="M4 39 C2 28 5 18 10 10 C13 20 15 30 14 39 Z"/><path d="M13 39 C13 26 17 14 22 4 C26 16 27 28 25 39 Z"/><path d="M24 39 C26 28 30 20 37 14 C36 24 35 32 34 39 Z"/></g><g fill="#c4f08e"><path d="M13 35 C13 28 15 22 19 15 C18 24 18 30 18 35 Z"/></g></svg>`,
  { size: 160 },
);
const TASSEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 48"><path d="M5 1 H11 V8 H5 Z" fill="#ffd35a" stroke="#b5702a" stroke-width="1.3"/><path d="M4 9 H12 L14 46 H2 Z" fill="#ffd35a" stroke="#b5702a" stroke-width="1.3"/><path d="M8 11 V45 M5 11 L5 45 M11 11 L11 45" stroke="#c9782c" stroke-width="1.1" fill="none"/></svg>`,
  { size: 192 },
);
const FALLEN_FEATHER = svg(
  featherSvg(30, 110, {
    fill: "#ffffff",
    shade: F_SHADE,
    edge: F_EDGE,
    bars: [
      [0.3, 0.07],
      [0.5, 0.07],
    ],
    rachis: "#8a85a8",
  }),
  { size: 256 },
);

const EYE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <radialGradient id="i" cx="0.5" cy="0.62" r="0.55"><stop offset="0" stop-color="#fff07a"/><stop offset="0.55" stop-color="#ffc21f"/><stop offset="1" stop-color="#f27d0a"/></radialGradient>
  </defs>
  <circle cx="32" cy="32" r="30.5" fill="#2b1a2e"/>
  <circle cx="32" cy="32" r="27" fill="url(#i)"/>
  <g stroke="#ffdf55" stroke-width="1.1" fill="none" opacity="0.9"><path d="M32 8 V16 M32 56 V48 M8 32 H16 M56 32 H48 M15 15 L20 20 M49 15 L44 20 M15 49 L20 44 M49 49 L44 44"/></g>
  <path d="M5 28 A27 27 0 0 1 59 28 Q32 13 5 28 Z" fill="#c4560a" opacity="0.7"/>
  <ellipse cx="32" cy="33" rx="11.5" ry="12.5" fill="#150c1c"/>
  <ellipse cx="32" cy="33" rx="6" ry="7" fill="#06030b"/>
  <circle cx="22.5" cy="21.5" r="6" fill="#ffffff"/>
  <circle cx="40" cy="42" r="3" fill="#ffffff"/>
  <circle cx="45" cy="30" r="1.8" fill="#fff8c8"/>
  <path d="M14 46 Q32 58 50 46" stroke="#fff3a0" stroke-width="2.2" fill="none" opacity="0.8"/>
  <path d="M3.5 29 Q32 15 60.5 29" stroke="#2b1a2e" stroke-width="3.4" fill="none"/>
</svg>`,
  { size: 256 },
);

const FACE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 88">
  <defs><radialGradient id="d" cx="0.5" cy="0.5" r="0.55"><stop offset="0.7" stop-color="#ffffff"/><stop offset="1" stop-color="#e5e1f6"/></radialGradient></defs>
  <ellipse cx="50" cy="44" rx="48" ry="41" fill="url(#d)" stroke="#8f84a6" stroke-width="2.3"/>
  <ellipse cx="50" cy="44" rx="43" ry="36" fill="none" stroke="#cdbfe0" stroke-width="1.6"/>
  <g stroke="#b8abc8" stroke-width="1.5" fill="none" stroke-linecap="round">
    <path d="M50 10 C50 20 52 26 50 34"/><path d="M26 18 C32 24 38 24 42 28"/><path d="M74 18 C68 24 62 24 58 28"/>
    <path d="M12 44 C20 44 26 46 30 50"/><path d="M88 44 C80 44 74 46 70 50"/>
    <path d="M24 66 C32 62 38 60 42 58"/><path d="M76 66 C68 62 62 60 58 58"/>
  </g>
  <g stroke="#2b1a2e" stroke-width="1.8" stroke-linecap="round" fill="none">
    <path d="M50 58 L50 72 M46 58 L43 71 M54 58 L57 71 M42 56 L36 66 M58 56 L64 66"/>
  </g>
</svg>`,
  { size: 512 },
);

const RUNES = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g stroke="#7fe8ff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="36" stroke-width="2.2"/>
    <path d="M50 20 L50 34 M44 26 L56 26"/>
    <path d="M72 30 L66 44 L76 48"/>
    <path d="M80 60 L68 62 L72 74"/>
    <path d="M50 80 L50 66 M44 72 L56 72"/>
    <path d="M28 70 L34 56 L24 52"/>
    <path d="M20 40 L32 38 L28 26"/>
    <path d="M50 42 L58 50 L50 58 L42 50 Z"/>
  </g></svg>`,
  { size: 400 },
);

export default function build() {
  const b = createBuilder({ name: "snowyOwl" });
  const rand = rng(11);

  // ============================================================ skeleton
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.57, -0.1], dir: [0, 0.7, 0.7], role: "spine" });
  const P0 = [0, 0.51, -0.27];
  const P1 = [0, 0.57, -0.1];
  const P2 = [0, 0.67, 0.02];
  const P3 = [0, 0.77, 0.12];
  const P4 = [0, 0.835, 0.185];
  const spine = b.chain("spine", catmull([P1, P2, P3, P4]), {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([P4, [0, 0.875, 0.205], [0, 0.9, 0.225]]), {
    parent: spine.joints[2],
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.9, 0.225], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.9, 0.255],
    aim: [0, 0.893, 0.335],
    role: "jaw",
  });

  // ============================================================ body
  const bodyPath = catmull([P0, P1, P2, P3, P4]);
  const body = b.sweep(
    bodyPath,
    (t) => {
      const k = [0.045, 0.1, 0.148, 0.146, 0.1][Math.min(4, Math.floor(t * 4))];
      const k2 = [0.045, 0.1, 0.148, 0.146, 0.1][Math.min(4, Math.floor(t * 4) + 1)];
      const f = t * 4 - Math.floor(t * 4);
      return k + (k2 - k) * f;
    },
    { bone: [hips, spine], color: BODY, name: "body" },
  );
  const neckSweep = b.sweep(neck, [0.1, 0.095, 0.09], { color: HEAD, name: "neck" });

  // ============================================================ tail
  const tailC = b.chain("tail", catmull([[0, 0.53, -0.24], [0, 0.5, -0.32], [0, 0.46, -0.42]]), {
    parent: hips,
    names: ["tail1", "tail2"],
    role: "tail",
  });
  const tailBase = [0, 0.53, -0.25];
  const tn = new THREE.Vector3(0, 1, -0.25).normalize();
  const tailDir0 = new THREE.Vector3(0, -0.25, -1).normalize();
  const tcount = 11;
  for (let k = 0; k < tcount; k++) {
    const u = k / (tcount - 1) - 0.5;
    const phi = u * 2 * 36;
    const dir = tailDir0.clone().applyAxisAngle(tn, (phi * Math.PI) / 180);
    const len = 0.32 - 0.07 * Math.abs(u * 2) * Math.abs(u * 2);
    const off = tn.clone().multiplyScalar(0.003 * (6 - Math.abs(k - 5)));
    const at = new THREE.Vector3(...tailBase).add(off).add(new THREE.Vector3(u * 0.06, 0, 0));
    b.cards([frame(at, tn)], TAILF, {
      size: [0.085, len],
      lean: 90,
      flow: dir,
      mirror: true,
      bone: tailC.joints[0],
    });
  }
  // upper tail coverts
  for (let k = 0; k < 7; k++) {
    const u = k / 6 - 0.5;
    const dir = tailDir0.clone().applyAxisAngle(tn, (u * 2 * 24 * Math.PI) / 180);
    const at = new THREE.Vector3(u * 0.1, 0.545, -0.2).add(tn.clone().multiplyScalar(0.03));
    b.cards([frame(at, tn)], COVERT, {
      size: [0.075, 0.16],
      lean: 90,
      flow: dir,
      mirror: true,
      bone: tailC.joints[0],
    });
  }

  // ============================================================ head
  const C = [0, 0.93, 0.23];
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), HEAD, {
    bone: head,
    at: C,
    scale: [0.104, 0.09, 0.097],
    name: "skull",
  });
  const skin = b.surface(skull);
  const at = (az: number, el: number) => skin.around(C).at(az, el)!;
  b.decal(skin, FACE, { at: at(0, 0), dir: [0, 0, 1], size: [0.19, 0.165], lift: 0.0015, segments: 14, name: "faceDisc" });
  for (const s of [1, -1]) {
    const hit = at(s * 30, 2);
    b.decal(skin, EYE, { at: hit, dir: hit.n, size: [0.062, 0.062], lift: 0.004, name: s > 0 ? "eyeL" : "eyeR" });
    // feathered brow ridge, stern and elegant
    const brow = catmull([at(s * 10, 25).moved([0, 0.002, 0]), at(s * 26, 29).moved([0, 0.002, 0]), at(s * 44, 33).moved([0, 0.002, 0]), at(s * 60, 28).moved([0, 0.002, 0])]);
    b.sweep(brow, [0.004, 0.007, 0.008, 0.003], { color: WHITE, bone: head, name: "brow", sides: 6 });
    const cheek = catmull([at(s * 16, -20).moved([0, 0.002, 0]), at(s * 34, -15).moved([0, 0.002, 0]), at(s * 52, -7).moved([0, 0.002, 0])]);
    b.sweep(cheek, [0.003, 0.006, 0.003], { color: WHITE, bone: head, name: "cheekLid", sides: 6 });
  }

  // face ruff + crown fluff
  const ruff = Array.from({ length: 36 }, (_, i) => {
    const ph = (i / 36) * Math.PI * 2;
    return at(70 * Math.cos(ph), 54 * Math.sin(ph) + 2);
  });
  b.cards(ruff, [FLUFF, FLUFF, FLUFF_BAR], {
    size: [0.036, 0.052],
    lean: 78,
    bend: 8,
    flow: [0, -0.1, -1],
    color: "#ffffff",
    vary: 0.15,
    rng: rng(3),
    bone: head,
  });
  const crown = skin.scatter(110, {
    rng: rng(5),
    minDist: 0.026,
    filter: (h) => h.n.z < 0.4 && h.n.y > -0.3 && !(h.at.z > 0.22 && h.at.y > 0.955),
  });
  b.cards(crown, [FLUFF, FLUFF, FLUFF_BAR], {
    size: [0.04, 0.055],
    lean: 68,
    bend: 10,
    flow: [0, -0.2, -1],
    color: "#ffffff",
    vary: 0.2,
    rng: rng(6),
    bone: head,
  });
  // rictal bristles over the beak base
  const bristleHits = [-70, -48, -26, -9, 9, 26, 48, 70].map((a) => at(a * 0.36, -13 - Math.abs(a) * 0.08));
  b.cards(bristleHits, BRISTLE, { size: [0.016, 0.045], lean: 75, flow: [0, -0.3, 1], bone: head, vary: 0.2, rng: rng(7) });

  // beak: hooked upper, small lower on the jaw joint
  b.sweep(bezier([0, 0.905, 0.316], [0, 0.908, 0.352], [0, 0.866, 0.362]), (t) => [0.019 * (1 - t) + 0.003, 0.021 * (1 - t) + 0.003], {
    color: BEAK,
    bone: head,
    caps: "point",
    sides: 8,
    name: "beakUpper",
  });
  b.sweep(bezier([0, 0.888, 0.3], [0, 0.882, 0.335], [0, 0.874, 0.352]), (t) => [0.014 * (1 - t) + 0.003, 0.012 * (1 - t) + 0.003], {
    color: BEAK,
    bone: jaw,
    caps: "point",
    sides: 8,
    name: "beakLower",
  });
  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });

  // gold circlet with moon-gem
  const band = skin.loop(frame([0, 0.985, 0.23], [0, 1, -0.2]), { lift: 0.004 });
  b.sweep(band, 0.0058, { color: GOLD, bone: head, name: "circlet", sides: 5 });
  const gemHit = at(0, 51);
  b.stick(new THREE.OctahedronGeometry(0.014, 0), GEM_DEEP, gemHit, { embed: 0.1, name: "circletGem" });
  glow(b.stick(new THREE.OctahedronGeometry(0.008, 0), GEM, gemHit.moved([0, 0.011, 0]), { embed: 0, name: "circletGemCore" }), 1.4);
  for (const s of [1, -1]) {
    const h = at(s * 66, 42);
    const p0 = h.at;
    b.sweep(bezier(p0, [p0.x + s * 0.02, p0.y + 0.012, p0.z - 0.015], [p0.x + s * 0.038, p0.y + 0.03, p0.z - 0.05]), [0.006, 0.001], {
      color: GOLD,
      bone: head,
      caps: "point",
      sides: 5,
      name: "circletWing",
    });
  }

  // ============================================================ wings
  const wingDefs = [1, -1].map((s) => {
    const L = s > 0 ? "L" : "R";
    const S = [s * 0.12, 0.75, 0.07];
    const E = [s * 0.27, 0.87, -0.03];
    const W = [s * 0.44, 1.01, 0.07];
    const H = [s * 0.55, 1.1, 0.11];
    const chain = b.chain(`wing${L}`, [S, E, W, H], {
      parent: spine.joints[2],
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hand${L}`],
      role: "wing",
    });
    return { s, L, S, E, W, H, chain };
  });
  for (const { s, L, S, E, W, H, chain } of wingDefs) {
    const arm = b.sweep(chain, [0.034, 0.028, 0.02, 0.014], { color: ARM, name: `arm${L}` });
    const sh = chain.joints[0];
    const el = chain.joints[1];
    const wr = chain.joints[2];
    const hd = chain.joints[3];
    const span = new THREE.Vector3(...H).sub(new THREE.Vector3(...S)).normalize();
    const chord = new THREE.Vector3(0, 0.45, -1).normalize();
    const n = new THREE.Vector3().crossVectors(span, chord).normalize();
    if (n.y < 0) n.negate();
    const cIn = chord.clone().sub(n.clone().multiplyScalar(chord.dot(n))).normalize();
    const uIn = span.clone().sub(n.clone().multiplyScalar(span.dot(n))).normalize();
    const dirAt = (deg: number) => cIn.clone().multiplyScalar(Math.cos((deg * Math.PI) / 180)).add(uIn.clone().multiplyScalar(Math.sin((deg * Math.PI) / 180)));
    const pt = (a: number[], c: number[], t: number) => new THREE.Vector3(...a).lerp(new THREE.Vector3(...c), t);
    const place = (tex: typeof PRIMARY, root: THREE.Vector3, deg: number, len: number, w: number, lift: number, bone: THREE.Object3D | typeof sh, ) => {
      b.cards([frame(root.clone().add(n.clone().multiplyScalar(lift)), n)], tex, {
        size: [w, len],
        lean: 90,
        bend: 8,
        flow: dirAt(deg),
        mirror: true,
        bone: bone as typeof sh,
      });
    };
    // primaries: 10, rounded wing tip, longest around the fourth
    const primLen = [0.31, 0.37, 0.41, 0.42, 0.41, 0.39, 0.37, 0.35, 0.33, 0.31];
    for (let k = 0; k < 10; k++) {
      const u = k / 9; // 0 = outermost
      const root = k < 3 ? pt(W, H, 0.55 + 0.45 * (1 - k / 2)) : pt(W, H, 0.55 * (1 - (k - 3) / 6) + 0.02);
      const deg = 72 - 60 * u;
      place(PRIMARY, root, deg, primLen[k], 0.07, 0.0025 * k, k < 5 ? hd : wr);
    }
    // secondaries: 11 along the forearm
    for (let k = 0; k < 11; k++) {
      const u = k / 10; // 0 = near wrist
      const root = pt(W, E, 0.04 + 0.92 * u).add(cIn.clone().multiplyScalar(-0.03));
      const deg = 14 - 28 * u;
      place(SECONDARY, root, deg, 0.34 - 0.04 * Math.sin(u * Math.PI), 0.074, 0.03 + 0.0018 * k, el);
    }
    // tertials near the shoulder
    for (let k = 0; k < 5; k++) {
      const u = k / 4;
      const root = pt(E, S, 0.1 + 0.8 * u).add(cIn.clone().multiplyScalar(-0.03));
      place(TERTIAL, root, -4 - 26 * u, 0.28 - 0.03 * u, 0.078, 0.06 + 0.002 * k, sh);
    }
    // greater, median and lesser coverts
    const rows: [typeof COVERT, number, number, number, number][] = [
      [COVERT, 0.17, 0.085, 0.08, 6],
      [COVERT_PLAIN, 0.12, 0.07, 0.1, 11],
      [COVERT, 0.085, 0.058, 0.12, 14],
      [COVERT_PLAIN, 0.055, 0.046, 0.14, 17],
    ];
    for (const [tex, len, w, lift, count] of rows) {
      for (let k = 0; k < count; k++) {
        const u = k / (count - 1);
        // along S -> E -> W -> H
        const segT = u * 3;
        const root =
          segT < 1 ? pt(S, E, segT) : segT < 2 ? pt(E, W, segT - 1) : pt(W, H, (segT - 2) * 0.9);
        const rt = root.clone().add(cIn.clone().multiplyScalar(0.02 - len * 0.06));
        const deg = segT < 1 ? -10 + 10 * segT : segT < 2 ? 2 + 14 * (segT - 1) : 20 + 25 * (segT - 2);
        const bone = segT < 1 ? sh : segT < 2 ? el : wr;
        place(tex, rt, deg, len, w, lift + 0.0012 * k, bone);
      }
    }
    // alula
    for (let k = 0; k < 3; k++) {
      const root = pt(W, H, 0.12 + 0.05 * k).add(cIn.clone().multiplyScalar(0.03));
      place(COVERT, root, 55 + 8 * k, 0.1 - 0.015 * k, 0.04, 0.16 + 0.002 * k, hd);
    }
    // gold bracer on the forearm
    const bandPt = chain.at(0.7);
    const armSkin = b.surface(arm);
    const cuff = armSkin.loop(bandPt, { lift: 0.002 });
    b.sweep(cuff, 0.0085, { color: GOLD, bone: wr, name: `bracer${L}`, sides: 5 });
    const cuff2 = armSkin.loop(chain.at(0.64), { lift: 0.002 });
    b.sweep(cuff2, 0.005, { color: GOLD, bone: wr, name: `bracerB${L}`, sides: 5 });
    const top = armSkin.around(bandPt.at).at(0, 80) ?? armSkin.nearest(bandPt.at);
    b.stick(new THREE.OctahedronGeometry(0.014, 0), GEM_DEEP, top, { embed: 0.1, bone: wr, name: `bracerGem${L}` });
    glow(b.stick(new THREE.OctahedronGeometry(0.008, 0), GEM, top.moved([0, 0.012, 0]), { embed: 0, bone: wr, name: `bracerCore${L}` }), 1.4);
    // wing-tip alula / carpal patch is in the drawing; leading-edge fluff
    const lead = armSkin.scatter(70, { rng: rng(21 + (s > 0 ? 0 : 1)), minDist: 0.026, filter: (h) => h.n.z > 0.0 });
    b.cards(lead, [FLUFF_FINE, FLUFF_FINE, FLUFF], { size: [0.036, 0.055], lean: 60, flow: [0, -0.1, -1], color: "#ffffff", bone: el, vary: 0.2, rng: rng(31) });
  }

  // ============================================================ legs and feet
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const hipP = [s * 0.085, 0.5, -0.05];
    const ankleP = [s * 0.085, 0.455, 0.07];
    const pts = limb(hipP, ankleP, [0.1, 0.09], [0, 0, 1]);
    const leg = b.chain(`leg${L}`, pts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
      contact: [s * 0.085, 0.4, 0.1],
    });
    const legSweep = b.sweep(leg, [0.07, 0.06, 0.046], { color: WHITE, name: `leg${L}` });
    const ankleJ = leg.joints[leg.joints.length - 1];
    // feathered trousers
    const hits = b.surface(legSweep).scatter(26, { rng: rng(40 + (s > 0 ? 0 : 1)), minDist: 0.028, filter: (h) => h.n.y < 0.5 });
    b.cards(hits, FLUFF, { size: [0.045, 0.07], lean: 55, bend: 10, flow: [0, -1, 0.2], color: "#ffffff", bone: ankleJ, vary: 0.2, rng: rng(41) });
    // gold anklet with tassel
    const anklet = b.surface(legSweep).loop(leg.at(0.93), { lift: 0.002 });
    b.sweep(anklet, 0.0075, { color: GOLD, bone: ankleJ, name: `anklet${L}`, sides: 5 });
    const ahit = b.surface(legSweep).around(leg.at(0.93).at).at(s * 90, -5)!;
    b.stick(new THREE.OctahedronGeometry(0.012, 0), GEM_DEEP, ahit, { embed: 0.1, bone: ankleJ, name: `ankletGem${L}` });
    b.cards([frame(ahit.at, [0, 1, 0])], TASSEL, { size: [0.016, 0.055], lean: 180, flow: [0, 0, 1], bone: ankleJ });

    // toes: three forward, one back
    const toes: { name: string; yaw: number; back: boolean }[] = [
      { name: "toeOuter", yaw: s * 24, back: false },
      { name: "toeMid", yaw: 0, back: false },
      { name: "toeInner", yaw: -s * 24, back: false },
      { name: "toeHind", yaw: 0, back: true },
    ];
    for (const t of toes) {
      const a = (t.yaw * Math.PI) / 180;
      const A = new THREE.Vector3(...ankleP);
      const f = t.back ? -1 : 1;
      const mid = A.clone().add(new THREE.Vector3(Math.sin(a) * 0.04 * f, -0.028, Math.cos(a) * 0.04 * f));
      const tip = mid.clone().add(new THREE.Vector3(Math.sin(a) * 0.045 * f, -0.012, Math.cos(a) * 0.045 * f));
      const toe = b.chain(`${t.name}${L}`, [A, mid, tip], {
        parent: ankleJ,
        names: [`${t.name}${L}1`, `${t.name}${L}2`, `${t.name}${L}Tip`],
        role: "digit",
      });
      b.sweep(toe, [0.021, 0.017, 0.013], { color: WHITE, name: `${t.name}${L}`, sides: 6 });
      const dir = new THREE.Vector3(Math.sin(a) * f, 0, Math.cos(a) * f);
      const c1 = tip.clone().add(dir.clone().multiplyScalar(0.02)).add(new THREE.Vector3(0, 0.004, 0));
      const c2 = tip.clone().add(dir.clone().multiplyScalar(0.036)).add(new THREE.Vector3(0, -0.012, 0));
      const c3 = tip.clone().add(dir.clone().multiplyScalar(0.04)).add(new THREE.Vector3(0, -0.028, 0));
      b.sweep(bezier(tip, c1, c2, c3), [0.012, 0.002], {
        color: CLAW,
        bone: toe.joints[toe.joints.length - 1],
        caps: "point",
        sides: 6,
        name: `claw${t.name}${L}`,
      });
    }
  }

  // ============================================================ body fluff and ornaments
  const bodySkin = b.surface(body);
  const chest = bodySkin.scatter(480, { rng: rng(50), minDist: 0.022, filter: (h) => h.n.z > -0.2 && h.n.y < 0.75 && h.at.y < 0.87 });
  const inBars = (h: { at: THREE.Vector3 }) => {
    const u = h.at.dot(spineDir);
    return u > 0.3 && u < 0.7;
  };
  const chestCard = { size: [0.046, 0.066] as [number, number], lean: 62, bend: 16, flow: [0, -1, -0.35], color: "#ffffff", vary: 0.2, spin: 12 };
  b.cards(chest.filter(inBars), [FLUFF_BAR, FLUFF, FLUFF, FLUFF], { ...chestCard, rng: rng(51) });
  b.cards(
    chest.filter((h) => !inBars(h)),
    [FLUFF, FLUFF, FLUFF, FLUFF, FLUFF_BAR],
    { ...chestCard, rng: rng(52) },
  );
  const back = bodySkin.scatter(160, { rng: rng(53), minDist: 0.03, filter: (h) => h.n.y > 0.3 });
  b.cards(back, [FLUFF, FLUFF, FLUFF_BAR], {
    size: [0.048, 0.072],
    lean: 66,
    bend: 14,
    flow: [0, -0.5, -1],
    color: "#ffffff",
    vary: 0.2,
    spin: 12,
    rng: rng(54),
  });
  const neckFluff = b.surface(neckSweep).scatter(60, { rng: rng(55), minDist: 0.022, filter: (h) => h.n.y > -0.4 && h.at.y < 0.86 });
  b.cards(neckFluff, [FLUFF, FLUFF_BAR], { size: [0.045, 0.065], lean: 60, flow: [0, -1, -0.3], color: "#ffffff", vary: 0.2, rng: rng(56), bone: neck.joints[1] });

  // moon pendant on a fine chain
  const chainLoop = bodySkin.drape(
    catmull(
      [
        [0.115, 0.84, 0.09],
        [0.09, 0.78, 0.2],
        [0.045, 0.72, 0.25],
        [0, 0.7, 0.26],
        [-0.045, 0.72, 0.25],
        [-0.09, 0.78, 0.2],
        [-0.115, 0.84, 0.09],
        [0, 0.86, -0.02],
      ],
      { closed: true },
    ),
    { lift: 0.03 },
  );
  b.sweep(chainLoop, 0.0042, { color: GOLD, bone: spine.joints[2], name: "pendantChain", sides: 5 });
  const pendHit = bodySkin.nearest([0, 0.7, 0.4]);
  let front = chainLoop.at(0);
  for (let i = 1; i <= 100; i++) {
    const q = chainLoop.at(i / 100);
    if (q.distanceTo(pendHit.at) < front.distanceTo(pendHit.at)) front = q;
  }
  const crescent: [number, number][] = [];
  for (let i = 0; i <= 9; i++) {
    const a = ((60 + (240 * i) / 9) * Math.PI) / 180;
    crescent.push([0.027 * Math.cos(a), 0.027 * Math.sin(a)]);
  }
  for (let i = 0; i <= 8; i++) {
    const a = ((290 - (220 * i) / 8) * Math.PI) / 180;
    crescent.push([0.013 + 0.019 * Math.cos(a), 0.019 * Math.sin(a)]);
  }
  const pendAt = [front.x, front.y - 0.036, front.z + 0.006];
  b.extrude(crescent, { at: pendAt, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.008, bevel: 0.002, detail: 0.35, color: GOLD, bone: spine.joints[2], name: "pendantMoon" });
  glow(b.part(new THREE.OctahedronGeometry(0.0095, 0), GEM, { at: [front.x + 0.004, front.y - 0.034, front.z + 0.008], bone: spine.joints[2], name: "pendantGem" }), 1.4);
  b.sweep([[front.x, front.y, front.z], [front.x, front.y - 0.008, front.z + 0.003]], 0.0035, { color: GOLD, bone: spine.joints[2], name: "pendantBail" });

  // ============================================================ stump
  const stump = b.lathe(
    [
      [0, 0],
      [0.31, 0],
      [0.285, 0.05],
      [0.245, 0.14],
      [0.228, 0.26],
      [0.215, 0.37],
      [0.212, 0.4],
      [0, 0.4],
    ],
    { at: [0, 0, 0], segments: 14, color: stumpPaint, bone: root, smoothing: 0, name: "stump" },
  );
  const stumpSkin = b.surface(stump);
  // flared roots
  for (let i = 0; i < 6; i++) {
    const ph = (i / 6) * Math.PI * 2 + 0.3;
    const c = Math.cos(ph);
    const s = Math.sin(ph);
    b.sweep(
      catmull([
        [c * 0.2, 0.14, s * 0.2],
        [c * 0.3, 0.05, s * 0.3],
        [c * 0.46, 0.02, s * 0.46],
      ]),
      [0.06, 0.04, 0.018],
      { color: BARK, bone: root, sides: 6, name: "root" },
    );
  }
  // jagged broken rim at the back of the stump top
  for (let i = 0; i < 6; i++) {
    const ph = Math.PI * (1.12 + (i / 5) * 0.75);
    const r = 0.19;
    const h = 0.06 + 0.07 * ((i * 7) % 5) / 4;
    b.spike([Math.cos(ph) * r, 0.395, Math.sin(ph) * r], [0.1 * Math.cos(ph), 1, 0.1 * Math.sin(ph)], h, 0.028, {
      color: BARK,
      bone: root,
      sides: 5,
      name: "splinter",
    });
  }
  // cut branch stub with ringed end
  b.sweep(catmull([[0.19, 0.24, -0.09], [0.28, 0.29, -0.13], [0.36, 0.34, -0.15]]), 0.04, { color: BARK, bone: root, sides: 7, caps: "flat", name: "branch" });
  b.lathe(
    [
      [0, 0],
      [0.042, 0],
      [0.042, 0.006],
      [0, 0.006],
    ],
    { at: [0.372, 0.348, -0.157], axis: [0.9, 0.4, -0.2], segments: 10, color: TOPWOOD, bone: root, name: "branchEnd" },
  );
  // snow lumps on the stump rim and roots
  const snowGeo = (r: number) => new THREE.IcosahedronGeometry(r, 0);
  const lumps: [number[], number, number[]][] = [
    [[-0.17, 0.4, -0.1], 0.055, [1.3, 0.55, 1]],
    [[-0.2, 0.39, 0.0], 0.04, [1.2, 0.6, 1]],
    [[0.17, 0.395, -0.11], 0.04, [1.2, 0.55, 1]],
    [[0.38, 0.35, -0.15], 0.03, [1.2, 0.5, 1.2]],
    [[0.34, 0.07, 0.3], 0.07, [1.4, 0.5, 1.1]],
    [[-0.34, 0.07, 0.22], 0.07, [1.5, 0.5, 1.1]],
    [[0.05, 0.05, -0.4], 0.08, [1.5, 0.5, 1.2]],
    [[-0.3, 0.06, -0.3], 0.06, [1.3, 0.5, 1.1]],
  ];
  for (const [at, r, sc] of lumps) b.part(snowGeo(r), SNOW, { bone: root, at, scale: sc, flat: true, name: "snowLump" });
  // snow mound base
  b.lathe(
    [
      [0, 0],
      [0.64, 0],
      [0.62, 0.025],
      [0.52, 0.062],
      [0.38, 0.082],
      [0.3, 0.075],
      [0, 0.075],
    ],
    { at: [0, 0, 0], segments: 14, color: moundPaint, bone: root, smoothing: 1, name: "mound" },
  );
  for (let i = 0; i < 9; i++) {
    const ph = (i / 9) * Math.PI * 2 + 0.2;
    const r = 0.5 + 0.06 * Math.sin(i * 2.3);
    b.part(snowGeo(0.05 + 0.02 * ((i * 3) % 4)), SNOW, {
      bone: root,
      at: [Math.cos(ph) * r, 0.03, Math.sin(ph) * r],
      scale: [1.5, 0.55, 1.2],
      rotation: [0, i * 40, 0],
      flat: true,
      name: "drift",
    });
  }
  // moss cushions on the stump's left shoulder
  const mossHits = stumpSkin.scatter(40, {
    rng: rng(60),
    minDist: 0.05,
    filter: (h) => h.at.y > 0.1 && h.at.y < 0.38 && h.n.y > -0.1 && h.at.x > -0.05 && h.at.z < 0.18,
  });
  b.cards(mossHits, MOSS_TUFT, { size: [0.045, 0.04], lean: 70, flow: [0, 0.6, 0.5], vary: 0.3, rng: rng(61), bone: root });
  for (const h of mossHits.slice(0, 14)) b.stick(new THREE.IcosahedronGeometry(0.032, 0), MOSS, h, { embed: 0.55, scale: [1.3, 0.5, 1.1], flat: true, bone: root, name: "mossCushion" });
  // frosted grass tufts round the base
  const tufts = [-0.5, -0.38, 0.1, 0.42, 0.52, 0.28].map((a, i) => frame([Math.cos(a * 6) * 0.5, 0.05, Math.sin(a * 6) * 0.5 - (i % 2) * 0.05], [0, 1, 0]));
  b.cards(tufts, GRASS, { size: [0.09, 0.1], flow: [0, 0, 1], cross: true, vary: 0.25, rng: rng(70), bone: root });
  // moon-mushrooms (self-lit)
  const mush: [number[], number][] = [
    [[0.24, 0.12, 0.17], 1],
    [[0.28, 0.07, 0.24], 0.7],
    [[-0.24, 0.1, 0.19], 0.85],
    [[0.16, 0.05, 0.3], 0.6],
  ];
  for (const [at, k] of mush) {
    const p0 = new THREE.Vector3(...at);
    const nrm = new THREE.Vector3(at[0], 0.1, at[2]).normalize();
    b.sweep(catmull([p0, p0.clone().add(new THREE.Vector3(nrm.x * 0.01, 0.03 * k, nrm.z * 0.01)), p0.clone().add(new THREE.Vector3(nrm.x * 0.03, 0.055 * k, nrm.z * 0.03))]), [0.011 * k, 0.008 * k], { color: STEM, bone: root, sides: 6, name: "mushStem" });
    const top = p0.clone().add(new THREE.Vector3(nrm.x * 0.03, 0.055 * k, nrm.z * 0.03));
    glow(
      b.lathe(
        [
          [0, 0.0],
          [0.034 * k, 0.0],
          [0.036 * k, 0.008 * k],
          [0.026 * k, 0.022 * k],
          [0.01 * k, 0.03 * k],
          [0, 0.032 * k],
        ],
        { at: top, axis: [nrm.x * 0.5, 1, nrm.z * 0.5], segments: 8, color: "#7ee6ff", bone: root, name: "mushCap" },
      ),
      1.2,
    );
    glow(b.part(new THREE.SphereGeometry(0.006 * k, 5, 4), "#ffffff", { bone: root, at: top.clone().add(new THREE.Vector3(0.012 * k, 0.03 * k, 0)), name: "mushDot" }), 1.3);
  }
  // glowing carved runes on the stump front
  const runeHit = stumpSkin.around([0, 0.2, 0]).at(-22, -5);
  if (runeHit) glow(b.decal(stumpSkin, RUNES, { at: runeHit, dir: runeHit.n, size: [0.14, 0.14], lift: 0.003, bone: root, name: "runes" }), 1.2);

  // fallen feathers on the snow
  b.cards(
    [frame([0.38, 0.07, 0.42], [0, 1, 0]), frame([-0.28, 0.07, 0.46], [0, 1, 0]), frame([0.1, 0.075, -0.52], [0, 1, 0])],
    FALLEN_FEATHER,
    { size: [0.05, 0.18], lean: 90, flow: (_f, i) => [[0.6, 0, -0.8], [-0.9, 0, 0.3], [0.4, 0, 0.9]][i], mirror: true, bone: root },
  );

  // ============================================================ floating light motes
  const moteGeos: THREE.BufferGeometry[] = [];
  const goldGeos: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 16; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.35 + rand() * 0.45;
    const g = new THREE.OctahedronGeometry(0.006 + rand() * 0.006, 0).translate(Math.cos(a) * r, 0.35 + rand() * 0.8, Math.sin(a) * r);
    (i % 4 === 0 ? goldGeos : moteGeos).push(g);
  }
  glow(b.part(mergeGeometries(moteGeos), GEM, { bone: root, at: [0, 0, 0], name: "motes" }), 1.2);
  glow(b.part(mergeGeometries(goldGeos), "#ffd35a", { bone: root, at: [0, 0, 0], name: "goldMotes" }), 1.2);
  return b.root;
}
