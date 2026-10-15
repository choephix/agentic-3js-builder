// Treasure hoard: an open arcane chest on a runed dais, spilling coins, gems, a spiked crown and goblets.
// League of Legends look: exaggerated chunky shapes, painted value gradients, saturated gold against deep blue-violet,
// glowing cyan/magenta magic (crystals, runes, rays, sparkles) readable from a high top-down camera.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, grain, mix, mottle, noise, paint, patches, scales } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Treasure Hoard",
  description:
    "An open arcane chest on a rune-lit dais, heaped with coins and glowing gems, with a jewelled spiked crown, goblets, a coin sack, ingots and magic crystals.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const hash = (k: number) => {
  const s = Math.sin(k * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// Palette: gold against deep blue-violet, with cyan and magenta magic.
const RUBY = "#ff2e63";
const SAPPH = "#2f8bff";
const EMER = "#1fe08f";
const AMETH = "#b05cff";
const TOPAZ = "#ffa11f";
const AQUA = "#3ff0ff";
const PINK = "#ff5fd2";
const PEARL = "#fff4f9";
const STUD = "#ffe27a";
const G1 = "#ffd54a";
const G2 = "#ffbf2e";
const G3 = "#fff08a";
const G4 = "#f09a1e";
const SILV = "#dfe8ff";
const COPPER = "#f08a4b";
const DARK = "#1c1540";
const HASP = "#ffcf45";

// Hand-painted surfaces: value gradients instead of flat tone, lit from above.
const GOLD = countershade(
  mottle("#ffe680", "#ffc83c", { size: 0.07, seed: 1 }),
  mottle("#e0902a", "#b0601a", { size: 0.07, seed: 2 }),
  { level: 0.05, soft: 0.55 },
);
const SILVER = countershade(
  mottle("#f4f8ff", "#c6d4f6", { size: 0.07, seed: 3 }),
  mottle("#7a8ccf", "#5a6aad", { size: 0.07, seed: 4 }),
  { level: 0.05, soft: 0.55 },
);
const ROSE = countershade(
  mottle("#ffc0a0", "#ff9a7a", { size: 0.07, seed: 5 }),
  mottle("#c9605e", "#a04458", { size: 0.07, seed: 6 }),
  { level: 0.05, soft: 0.55 },
);
const COINHEAP = countershade(
  scales([G1, G2, G3, "#ffcc3a"], "#a8601a", { size: 0.05, width: 0.24, seed: 9 }),
  scales(["#d98a20", "#c97a1a"], "#7a420f", { size: 0.05, width: 0.24, seed: 9 }),
  { level: -0.05, soft: 0.5 },
);
const STONE = countershade(
  scales(["#4a3f8e", "#52469a", "#41377f"], "#231c4a", { size: 0.2, width: 0.12, seed: 5 }),
  scales(["#2d2662", "#352d70"], "#171236", { size: 0.2, width: 0.12, seed: 5 }),
  { level: -0.2, soft: 0.4 },
);
const ROCK = countershade(
  scales(["#5a4fa8", "#4f4596"], "#2a2358", { size: 0.1, width: 0.16, seed: 7 }),
  scales(["#2f2868", "#382f74"], "#1a1438", { size: 0.1, width: 0.16, seed: 7 }),
  { level: -0.1, soft: 0.45 },
);
const VELVET = mottle("#a8185a", "#7d1040", { size: 0.04, seed: 8 });
const VELVET2 = mottle("#c21a68", "#8d1248", { size: 0.03, seed: 9 });
const GEMPILE = patches("#2b2766", [RUBY, SAPPH, EMER, AMETH, TOPAZ, AQUA], { size: 0.045, gap: 0.12, seed: 2 });
const BURLAP = countershade(
  grain("#e2b070", "#c4905a", { size: 0.012, axis: "y", seed: 5 }),
  grain("#a46a3a", "#8c5a30", { size: 0.012, axis: "y", seed: 6 }),
  { level: 0, soft: 0.6 },
);

// Chest wood: painted boards, seams, highlights on top faces.
const woodBoards = (hi: string, mid: string, lo: string, seam: string) =>
  paint((p, n) => {
    const f = (p.y - 0.12) / 0.085;
    const k = Math.floor(f);
    const fr = f - k;
    const g = noise(V((p.x + p.z) * 0.15, p.y, k * 0.3), 0.05, 4);
    let c = mix(mid, hi, 0.3 * hash(k + 3.7) + 0.5 * g);
    if (n.y > 0.6) c = mix(c, hi, 0.55);
    else if (n.y < -0.4) c = mix(c, lo, 0.6);
    if (fr < 0.06 || fr > 0.96) c = mix(c, seam, 0.85);
    else if (fr < 0.12) c = mix(c, hi, 0.25);
    return c;
  });
const WOOD = woodBoards("#4d8fd0", "#3a72b4", "#1f3d78", "#16285a");
// Lid boards run across the arch, measured by the angle round the arch centre on the extrude's [u, v] outline.
const LIDWOOD = paint((p, n, s) => {
  const f = Math.atan2(s[1] + 0.019, s[0] - 0.26) / 0.3;
  const k = Math.floor(f);
  const fr = f - k;
  const g = noise(V(p.x * 0.8, p.y, p.z * 0.4), 0.05, 4);
  let c = mix("#3a72b4", "#4d8fd0", 0.3 * hash(k + 9.1) + 0.5 * g);
  if (n.y > 0.5) c = mix(c, "#6aaae8", 0.5);
  else if (n.y < -0.3) c = mix(c, "#1f3d78", 0.6);
  if (fr < 0.06 || fr > 0.96) c = mix(c, "#16285a", 0.85);
  else if (fr < 0.12) c = mix(c, "#6aaae8", 0.25);
  return c;
});

function runeRing() {
  const C = "#3ff0ff";
  const C2 = "#b8fcff";
  let s = `<svg viewBox="0 0 512 512">`;
  s += `<circle cx="256" cy="256" r="244" fill="none" stroke="${C}" stroke-width="7"/>`;
  s += `<circle cx="256" cy="256" r="228" fill="none" stroke="${C}" stroke-width="3.2"/>`;
  s += `<circle cx="256" cy="256" r="178" fill="none" stroke="${C}" stroke-width="5"/>`;
  s += `<circle cx="256" cy="256" r="166" fill="none" stroke="${C2}" stroke-width="3.2" stroke-dasharray="6 9"/>`;
  s += `<circle cx="256" cy="256" r="112" fill="none" stroke="${C}" stroke-width="4"/>`;
  const glyphs = [
    "M256 38 v28 M246 48 l10 -9 l10 9",
    "M256 38 v28 M245 44 h22 M245 60 h22",
    "M247 38 l20 14 l-20 14 M256 38 v28",
    "M250 38 v28 M262 38 v28 M246 52 h20",
  ];
  for (let i = 0; i < 24; i++)
    s += `<g transform="rotate(${i * 15} 256 256)"><path d="${glyphs[i % 4]}" fill="none" stroke="${C2}" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  for (let i = 0; i < 48; i++)
    s += `<g transform="rotate(${i * 7.5} 256 256)"><path d="M256 12 v10" stroke="${C}" stroke-width="4" stroke-linecap="round"/></g>`;
  for (let i = 0; i < 8; i++)
    s += `<g transform="rotate(${i * 45} 256 256)"><path d="M256 70 l22 62 h-44 Z" fill="none" stroke="${C}" stroke-width="4.6" stroke-linejoin="round"/></g>`;
  s += `<path d="M256 140 l22 64 l62 -20 l-30 56 l40 44 l-62 -2 l-32 58 l-32 -58 l-62 2 l40 -44 l-30 -56 l62 20 Z" fill="none" stroke="${C}" stroke-width="4.4" stroke-linejoin="round"/>`;
  return svg(s + `</svg>`, { size: 768 });
}

const COIN_GOLD = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#c9841c"/><circle cx="32" cy="32" r="26" fill="#ffd24a"/>
  <circle cx="32" cy="32" r="21" fill="none" stroke="#e29a22" stroke-width="3"/>
  <path d="M32 13 L36.5 27.5 L51 32 L36.5 36.5 L32 51 L27.5 36.5 L13 32 L27.5 27.5Z" fill="#fff0a0"/>
  <path d="M12 23 A24 24 0 0 1 27 9" stroke="#fff8d0" stroke-width="3.4" fill="none" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const COIN_SILVER = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#7d8fcf"/><circle cx="32" cy="32" r="26" fill="#e4ecff"/>
  <circle cx="32" cy="32" r="21" fill="none" stroke="#9fb0e6" stroke-width="3"/>
  <path d="M32 13 L36.5 27.5 L51 32 L36.5 36.5 L32 51 L27.5 36.5 L13 32 L27.5 27.5Z" fill="#ffffff"/>
  <path d="M12 23 A24 24 0 0 1 27 9" stroke="#ffffff" stroke-width="3.4" fill="none" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const SPARK = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 0 C34 22 42 30 64 32 C42 34 34 42 32 64 C30 42 22 34 0 32 C22 30 30 22 32 0Z" fill="#ffe27a"/>
  <path d="M32 14 C33 25 39 30 50 32 C39 34 33 39 32 50 C31 39 25 34 14 32 C25 30 31 25 32 14Z" fill="#ffffff"/></svg>`,
  { size: 128 },
);
const RAY = svg(
  `<svg viewBox="0 0 32 128"><path d="M2 128 L16 0 L30 128Z" fill="#ffd54a"/><path d="M10 128 L16 26 L22 128Z" fill="#fff4b8"/></svg>`,
  { size: 192 },
);
const CREST = svg(
  `<svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="58" fill="none" stroke="#ffcf45" stroke-width="5"/>
  <circle cx="64" cy="64" r="48" fill="none" stroke="#ffcf45" stroke-width="2.6" stroke-dasharray="5 5"/>
  <path d="M64 16 L74 48 L108 48 L80 68 L91 102 L64 82 L37 102 L48 68 L20 48 L54 48Z" fill="#ffcf45"/>
  <path d="M64 36 L69 54 L88 54 L73 65 L78 83 L64 72 L50 83 L55 65 L40 54 L59 54Z" fill="#ff2e63"/>
  <path d="M8 64 Q22 50 36 56 M120 64 Q106 50 92 56" fill="none" stroke="#ffcf45" stroke-width="4.5" stroke-linecap="round"/></svg>`,
  { size: 256 },
);
const STAMP = svg(
  `<svg viewBox="0 0 64 32"><rect x="3" y="3" width="58" height="26" rx="4" fill="none" stroke="#a8620f" stroke-width="3"/>
  <path d="M32 6 L39 16 L32 26 L25 16Z" fill="#a8620f"/><path d="M12 16 h9 M43 16 h9" stroke="#a8620f" stroke-width="3" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const PATCH = svg(
  `<svg viewBox="0 0 64 64"><rect x="4" y="4" width="56" height="56" rx="9" fill="#7a4628" stroke="#f0cf8a" stroke-width="3" stroke-dasharray="6 5"/>
  <circle cx="32" cy="32" r="17" fill="#ffd24a" stroke="#c9841c" stroke-width="3"/>
  <path d="M32 19 L35 29 L45 32 L35 35 L32 45 L29 35 L19 32 L29 29Z" fill="#fff0a0"/></svg>`,
  { size: 128 },
);
function filigreeSvg() {
  let s = `<svg viewBox="0 0 32 160">`;
  for (let i = 0; i < 5; i++) {
    const y = i * 32;
    s += `<path d="M16 ${y + 2} C28 ${y + 8} 4 ${y + 14} 16 ${y + 20} C24 ${y + 24} 24 ${y + 30} 16 ${y + 32}" fill="none" stroke="#8a4a10" stroke-width="3" stroke-linecap="round"/>`;
    s += `<circle cx="16" cy="${y + 18}" r="3.2" fill="#8a4a10"/>`;
  }
  return svg(s + `</svg>`, { size: 320 });
}
const FILIGREE = filigreeSvg();

export default function build() {
  const b = createBuilder({ name: "treasureHoard" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const lid = b.joint("lid", { parent: base, at: [0, 0.46, -0.58], dir: [0, 0, 1], role: "hinge" });
  const DT = 0.1; // dais top

  const P = (g: THREE.BufferGeometry, c: string | Paint, o: Parameters<typeof b.part>[2] = {}) =>
    b.part(g, c, { bone: base, ...o });
  const LP = (g: THREE.BufferGeometry, c: string | Paint, o: Parameters<typeof b.part>[2] = {}) =>
    b.part(g, c, { bone: lid, ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // A local frame for objects built upright then tilted (crown, tipped goblet, sack).
  class Loc {
    constructor(
      readonly o: THREE.Vector3,
      readonly q: THREE.Quaternion,
    ) {}
    p(v: number[]) {
      return V(v[0], v[1], v[2]).applyQuaternion(this.q).add(this.o);
    }
    d(v: number[]) {
      return V(v[0], v[1], v[2]).applyQuaternion(this.q);
    }
    turned(x: number, y: number, z: number) {
      return this.q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z)));
    }
  }
  const eul = (x: number, y: number, z: number) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));

  // Many small same-colour pieces become one part per colour.
  function makeBag(bone: Joint) {
    const m = new Map<string, THREE.BufferGeometry[]>();
    return {
      add(color: string, g: THREE.BufferGeometry, p: THREE.Vector3, q = new THREE.Quaternion(), s: number | THREE.Vector3 = 1) {
        const geo = g.index ? g.toNonIndexed() : g.clone();
        geo.applyMatrix4(
          new THREE.Matrix4().compose(p, q, typeof s === "number" ? V(s, s, s) : s),
        );
        (m.get(color) ?? m.set(color, []).get(color)!).push(geo);
      },
      flush(strength = 0) {
        for (const [c, list] of m) {
          const part = b.part(mergeGeometries(list)!, c, { bone, at: [0, 0, 0], flat: true });
          if (strength) glow(part, strength);
        }
      },
    };
  }
  const bag = makeBag(base);
  const lidBag = makeBag(lid);
  const goldBag = makeBag(base);
  const glowBag = makeBag(base);

  // Lumpy faceted heap; vertices are displaced by a position function so shared corners stay closed.
  function lump(rx: number, ry: number, rz: number, seed: number, amt: number, detail = 2, minY = -Infinity) {
    const g = new THREE.IcosahedronGeometry(1, detail);
    const pos = g.getAttribute("position");
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      v.multiplyScalar(1 + amt * (noise(v.clone().multiplyScalar(1.7), 1, seed) - 0.5) * 2);
      pos.setXYZ(i, v.x * rx, Math.max(v.y * ry, minY), v.z * rz);
    }
    g.computeVertexNormals();
    return g;
  }

  // A cut gem as a low-segment lathe so every facet is flat; kind picks the cut.
  function gem(color: string, at: THREE.Vector3, dir: THREE.Vector3, size: number, kind = 0, segs = 6, spin = 0, bone: Joint = base, strength = 0.5) {
    const s = size;
    const prof =
      kind === 0
        ? [[0, 0], [0.5 * s, 0.4 * s], [0.5 * s, 0.48 * s], [0.3 * s, 0.76 * s], [0, 0.76 * s]]
        : kind === 1
          ? [[0, 0], [0.38 * s, 0.1 * s], [0.5 * s, 0.7 * s], [0.28 * s, 1.05 * s], [0, 1.15 * s]]
          : [[0, 0], [0.5 * s, 0.22 * s], [0.5 * s, 0.34 * s], [0.34 * s, 0.5 * s], [0, 0.5 * s]];
    return glow(b.lathe(prof, { at, axis: dir, segments: segs, spin, color, bone }), strength);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Dais
  const dais = b.lathe(
    [[0, 0], [1.08, 0], [1.08, 0.05], [1.02, 0.065], [1.02, 0.09], [0.97, 0.1], [0, 0.1]],
    { at: [0, 0, 0], color: STONE, segments: 16, bone: base, name: "dais" },
  );
  void dais;
  // Glowing rune ring inlaid in the top.
  glow(
    P(new THREE.PlaneGeometry(1.86, 1.86), "#ffffff", { at: [0, DT + 0.004, 0], dir: [0, 1, 0], axis: "z", texture: runeRing(), name: "runeRing" }),
    1,
  );
  // Glowing notches round the rim and gold studs.
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r = 1.05;
    glowBag.add(AQUA, box(0.07, 0.012, 0.022), V(Math.sin(a) * r, 0.062, Math.cos(a) * r), eul(0, a, 0));
    goldBag.add(STUD, new THREE.SphereGeometry(0.014, 5, 4), V(Math.sin(a + 0.13) * 0.99, 0.095, Math.cos(a + 0.13) * 0.99));
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Chest body, x half 0.45, z -0.58..-0.06, y 0.12..0.46
  const cy = 0.29;
  P(box(0.9, 0.04, 0.52), WOOD, { at: [0, 0.14, -0.32], name: "chestFloor" });
  P(box(0.82, 0.34, 0.04), WOOD, { at: [0, cy, -0.08], name: "chestFront" });
  P(box(0.82, 0.34, 0.04), WOOD, { at: [0, cy, -0.56], name: "chestBack" });
  for (const s of [1, -1]) {
    P(box(0.04, 0.34, 0.52), WOOD, { at: [s * 0.43, cy, -0.32], name: "chestSide" });
    // velvet liner on the inner face
    P(box(0.012, 0.3, 0.44), VELVET, { at: [s * 0.404, 0.31, -0.32], name: "linerSide" });
  }
  P(box(0.8, 0.3, 0.012), VELVET, { at: [0, 0.31, -0.534], name: "linerBack" });
  P(box(0.8, 0.3, 0.012), VELVET, { at: [0, 0.31, -0.106], name: "linerFront" });
  // gold skirt and rim bands, proud of the planks
  P(box(0.924, 0.06, 0.544), GOLD, { at: [0, 0.15, -0.32], name: "skirt" });
  P(box(0.93, 0.05, 0.03), GOLD, { at: [0, 0.455, -0.075], name: "rimFront" });
  P(box(0.93, 0.05, 0.03), GOLD, { at: [0, 0.455, -0.565], name: "rimBack" });
  for (const s of [1, -1]) P(box(0.03, 0.05, 0.52), GOLD, { at: [s * 0.45, 0.455, -0.32], name: "rimSide" });
  // stubby feet
  for (const sx of [1, -1])
    for (const sz of [-0.12, -0.52]) P(box(0.1, 0.04, 0.1), GOLD, { at: [sx * 0.4, 0.11, sz], name: "foot" });
  // straps: front and sides
  for (const sx of [0.3, -0.3]) {
    P(box(0.075, 0.28, 0.014), GOLD, { at: [sx, 0.3, -0.054], name: "strapFront" });
    P(new THREE.PlaneGeometry(0.052, 0.26), "#ffffff", { at: [sx, 0.3, -0.0465], dir: [0, 0, 1], axis: "z", texture: FILIGREE, name: "filigreeFront" });
    for (const y of [0.2, 0.4]) goldBag.add(STUD, new THREE.SphereGeometry(0.014, 6, 4), V(sx, y, -0.045));
  }
  for (const s of [1, -1])
    for (const z of [-0.16, -0.48]) {
      P(box(0.014, 0.28, 0.075), GOLD, { at: [s * 0.456, 0.3, z], name: "strapSide" });
      for (const y of [0.2, 0.4]) goldBag.add(STUD, new THREE.SphereGeometry(0.014, 6, 4), V(s * 0.464, y, z));
    }
  // corner brackets
  for (const sx of [1, -1])
    for (const sz of [-0.06, -0.58]) {
      P(box(0.075, 0.37, 0.075), GOLD, { at: [sx * 0.43, 0.3, sz + (sz < -0.3 ? -0.0 : 0)], name: "corner" });
      goldBag.add(STUD, new THREE.SphereGeometry(0.024, 6, 5), V(sx * 0.446, 0.46, sz + (sz > -0.3 ? 0.012 : -0.012)));
    }
  // hinge barrels at the back
  for (const sx of [0.26, -0.26]) {
    P(new THREE.CylinderGeometry(0.024, 0.024, 0.13, 8), GOLD, { at: [sx, 0.47, -0.59], rotation: [0, 0, 90], name: "hingeBarrel" });
    P(box(0.12, 0.012, 0.09), GOLD, { at: [sx, 0.38, -0.6], name: "hingeLeaf" });
  }
  // Lock plate with a glowing rune socket.

  b.extrude(
    [[-0.085, 0.06], [0.085, 0.06], [0.085, -0.045], [0, -0.135, "sharp"], [-0.085, -0.045]],
    { at: [0, 0.42, -0.044], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, bevel: 0.007, color: GOLD, bone: base, name: "lockPlate" },
  );
  b.lathe([[0, 0], [0.046, 0], [0.046, 0.012], [0, 0.012]], { at: [0, 0.425, -0.029], axis: [0, 0, 1], segments: 6, color: DARK, bone: base, name: "lockSocket" });
  glow(
    b.lathe([[0, 0], [0.034, 0], [0.026, 0.02], [0, 0.026]], { at: [0, 0.425, -0.019], axis: [0, 0, 1], segments: 6, color: AQUA, bone: base, name: "lockGem" }),
    0.9,
  );
  for (const [x, y] of [[-0.06, 0.04], [0.06, 0.04], [-0.06, -0.02], [0.06, -0.02]]) goldBag.add(STUD, new THREE.SphereGeometry(0.01, 6, 4), V(x, 0.42 + y, -0.026));
  // keyhole under the socket
  b.extrude([[-0.008, 0.016], [0.008, 0.016], [0.006, -0.02], [-0.006, -0.02]], {
    at: [0, 0.385, -0.0285], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.006, color: DARK, bone: base, name: "keyhole",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Lid (closed coordinates, then hinged open at the end). Profile [u along z from the hinge, v up].
  const AR = 0.269;
  const AC = [0.26, -0.019];
  const a0 = Math.atan2(0.05 - AC[1], 0 - AC[0]);
  const a1 = Math.PI - a0;
  const archUV = (off: number, n: number) => {
    const pts: number[][] = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      pts.push([AC[0] + (AR + off) * Math.cos(a), AC[1] + (AR + off) * Math.sin(a)]);
    }
    return pts;
  };
  const lidW = (u: number, v: number, x = 0) => [x, 0.46 + v, -0.58 + u];
  const arcLid = archUV(0, 8);
  const outline: number[][] = [[0, 0], [0.52, 0], ...[...arcLid].reverse()];
  const lidBody = b.extrude(outline, {
    at: [0, 0.46, -0.58], thickness: 0.88, bevel: 0.01, color: LIDWOOD, bone: lid, name: "lidBody",
  });
  void lidBody;
  const plateOutline: number[][] = [[-0.013, -0.01], [0.533, -0.01], ...[...archUV(0.013, 8)].reverse()];
  for (const s of [1, -1]) {
    b.extrude(plateOutline, {
      at: [s * 0.4505, 0.46, -0.58], thickness: 0.026, bevel: 0.006, color: GOLD, bone: lid, name: "lidEnd",
    });
    lidBag.add(STUD, new THREE.SphereGeometry(0.022, 6, 5), V(s * 0.466, 0.46 + 0.1, -0.58 + 0.26));
    lidBag.add(STUD, new THREE.SphereGeometry(0.014, 6, 4), V(s * 0.466, 0.46 + 0.03, -0.58 + 0.08));
    lidBag.add(STUD, new THREE.SphereGeometry(0.014, 6, 4), V(s * 0.466, 0.46 + 0.03, -0.58 + 0.44));
  }
  // arch straps over the dome
  for (const sx of [0.3, -0.3]) {
    const pts = [[-0.0125, 0.0], ...archUV(0.0125, 8), [0.5325, 0.0]];
    b.sweep(
      pts.map(([u, v]) => lidW(u, v, sx)),
      () => [0.04, 0.008],
      { section: "box", caps: "flat", color: GOLD, bone: lid, name: "lidStrap" },
    );
    for (let i = 1; i < 8; i += 2) {
      const [u, v] = archUV(0.022, 8)[i];
      const w = lidW(u, v, sx);
      lidBag.add(STUD, new THREE.SphereGeometry(0.014, 6, 4), V(w[0], w[1], w[2]));
    }
  }
  // crest plate on top of the dome
  b.extrude([[-0.07, 0], [0, -0.1, "sharp"], [0.07, 0], [0, 0.1, "sharp"]], {
    at: [0, 0.46 + AC[1] + AR + 0.005, -0.32], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.022, bevel: 0.005, color: GOLD, bone: lid, name: "lidCrest",
  });
  gem(RUBY, V(0, 0.46 + AC[1] + AR + 0.012, -0.32), V(0, 1, 0), 0.07, 0, 6, 0, lid, 0.55);
  // underside: velvet panel, gold frame, crest drawing
  LP(box(0.76, 0.012, 0.4), VELVET, { at: [0, 0.46 - 0.006, -0.58 + 0.26], name: "lidVelvet" });
  LP(box(0.82, 0.018, 0.034), GOLD, { at: [0, 0.46 - 0.008, -0.58 + 0.04], name: "lidFrame" });
  LP(box(0.82, 0.018, 0.034), GOLD, { at: [0, 0.46 - 0.008, -0.58 + 0.48], name: "lidFrame" });
  for (const s of [1, -1]) LP(box(0.034, 0.018, 0.44), GOLD, { at: [s * 0.405, 0.46 - 0.008, -0.58 + 0.26], name: "lidFrame" });
  glow(
    LP(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { at: [0, 0.46 - 0.0135, -0.58 + 0.27], dir: [0, -1, 0], up: [0, 0, 1], axis: "z", texture: CREST, name: "lidCrestDrawing" }),
    0.45,
  );
  for (const s of [1, -1])
    for (const u of [0.12, 0.26, 0.4]) lidBag.add(STUD, new THREE.SphereGeometry(0.012, 6, 4), V(s * 0.405, 0.46 - 0.018, -0.58 + u));

  // ---------------------------------------------------------------------------------------------------------------
  // Coin heaps (painted coin plates) and the gem mound
  const heapA = P(lump(0.39, 0.16, 0.215, 11, 0.09, 3), COINHEAP, { at: [0, 0.46, -0.32], name: "heapChest" });
  const heapB = P(lump(0.62, 0.2, 0.34, 21, 0.1, 3, -0.005), COINHEAP, { at: [0.02, DT, 0.2], name: "heapFront" });
  const heapC1 = P(lump(0.26, 0.12, 0.2, 31, 0.1, 2, -0.005), COINHEAP, { at: [0.52, DT, 0.44], name: "heapR" });
  const heapC2 = P(lump(0.24, 0.11, 0.18, 41, 0.1, 2, -0.005), COINHEAP, { at: [-0.42, DT, 0.44], name: "heapL" });
  const heapC3 = P(lump(0.16, 0.09, 0.15, 51, 0.1, 2, -0.005), COINHEAP, { at: [0.6, DT, -0.2], name: "heapSide" });
  const gemPile = P(lump(0.2, 0.1, 0.17, 61, 0.1, 2, -0.005), GEMPILE, { at: [-0.68, DT, 0.2], name: "gemPile" });
  const heaps = [heapA, heapB, heapC1, heapC2, heapC3];

  const rnd = rng(7);
  const skin = b.surface(heaps);
  // flat coin drawings lying on the heaps
  const coinHits = skin.scatter(260, { rng: rng(3), minDist: 0.052, filter: (h) => h.n.y > 0.2 });
  const flowOf = (_f: unknown, i: number) => [Math.cos(i * 2.39996), 0, Math.sin(i * 2.39996)];
  const goldHits = coinHits.filter((_, i) => i % 5 !== 0);
  const silverHits = coinHits.filter((_, i) => i % 5 === 0);
  b.cards(goldHits, COIN_GOLD, { size: 0.074, lean: 90, flow: flowOf, rng: rng(4), vary: 0.12, name: "coinCardsGold" });
  b.cards(silverHits, COIN_SILVER, { size: 0.074, lean: 90, flow: flowOf, rng: rng(5), vary: 0.12, name: "coinCardsSilver" });
  // 3D coins catching the light on the silhouette: tilted, half buried
  const coinColors = [G1, G2, G3, G4, G1, SILV, COPPER];
  const rimHits = skin.scatter(190, { rng: rng(12), minDist: 0.05, filter: (h) => h.n.y > -0.1 });
  rimHits.forEach((h, i) => {
    const t = V((rnd() - 0.5) * 1.8, (rnd() - 0.3) * 0.9, (rnd() - 0.5) * 1.8);
    const dir = h.n.clone().multiplyScalar(0.4).add(t).normalize();
    const r = 0.045 + rnd() * 0.012;
    bag.add(coinColors[i % coinColors.length], new THREE.CylinderGeometry(r, r, 0.012, 8), h.at.clone().addScaledVector(h.n, 0.008), aim(dir));
  });

  // Gems pushed into the heaps
  const GEMC = [RUBY, SAPPH, EMER, AMETH, TOPAZ, AQUA, PINK, RUBY, SAPPH];
  const gemHits = skin.scatter(34, { rng: rng(21), minDist: 0.1, filter: (h) => h.n.y > 0.25 && h.at.y > 0.14 });
  gemHits.forEach((h, i) => {
    const size = 0.05 + rnd() * 0.045;
    const dir = h.n.clone().add(V((rnd() - 0.5) * 1.1, (rnd() - 0.2) * 0.5, (rnd() - 0.5) * 1.1)).normalize();
    gem(GEMC[i % GEMC.length], h.at.clone().addScaledVector(h.n, size * 0.12), dir, size, i % 3, i % 2 ? 6 : 8, rnd() * 60);
  });
  const pileSkin = b.surface([gemPile]);
  pileSkin.scatter(16, { rng: rng(23), minDist: 0.07, filter: (h) => h.n.y > 0.2 }).forEach((h, i) => {
    const size = 0.045 + rnd() * 0.04;
    const dir = h.n.clone().add(V((rnd() - 0.5) * 1, (rnd() - 0.2) * 0.4, (rnd() - 0.5) * 1)).normalize();
    gem(GEMC[(i + 2) % GEMC.length], h.at.clone().addScaledVector(h.n, size * 0.12), dir, size, (i + 1) % 3, i % 2 ? 6 : 8, rnd() * 60);
  });

  // Coin stacks on the dais
  const stackCols = [G1, G2, G3, G1, SILV, G4];
  const stack = (x: number, z: number, n: number, lean: number) => {
    for (let i = 0; i < n; i++)
      bag.add(
        stackCols[(i + Math.floor(x * 10)) % stackCols.length],
        new THREE.CylinderGeometry(0.05, 0.05, 0.0135, 9),
        V(x + (rnd() - 0.5) * 0.008 + lean * i * 0.004, DT + 0.007 + i * 0.0138, z + (rnd() - 0.5) * 0.008),
        eul((rnd() - 0.5) * 0.06, 0, (rnd() - 0.5) * 0.06),
      );
  };
  stack(0.3, 0.66, 9, 0.5);
  stack(0.2, 0.74, 5, -0.3);
  stack(-0.3, 0.68, 7, 0.4);
  stack(-0.2, 0.75, 3, 0);
  stack(0.82, -0.02, 6, 0.2);
  // loose coins on the floor
  const occupied = (x: number, z: number) =>
    (Math.abs(x) < 0.55 && z < 0.02 && z > -0.66) ||
    (x / 0.72) ** 2 + ((z - 0.2) / 0.46) ** 2 < 1 ||
    (x - 0.52) ** 2 + (z - 0.44) ** 2 < 0.1 ||
    (x + 0.42) ** 2 + (z - 0.44) ** 2 < 0.09 ||
    (x - 0.78) ** 2 + (z - 0.18) ** 2 < 0.04 ||
    (x - 0.5) ** 2 + (z - 0.68) ** 2 < 0.04 ||
    (x + 0.62) ** 2 + (z - 0.62) ** 2 < 0.07 ||
    (x + 0.8) ** 2 + (z + 0.12) ** 2 < 0.07 ||
    (x + 0.68) ** 2 + (z - 0.2) ** 2 < 0.07 ||
    (x - 0.3) ** 2 + (z - 0.66) ** 2 < 0.012 ||
    (x - 0.2) ** 2 + (z - 0.74) ** 2 < 0.01 ||
    (x + 0.3) ** 2 + (z - 0.68) ** 2 < 0.01 ||
    (x - 0.72) ** 2 + (z + 0.3) ** 2 < 0.05 ||
    (x - 0.82) ** 2 + (z + 0.02) ** 2 < 0.01 ||
    Math.abs(x) > 0.5 && z < -0.35 && Math.hypot(x, z) > 0.82;
  for (let i = 0, k = 0; i < 400 && k < 60; i++) {
    const ang = rnd() * Math.PI * 2;
    const rad = 0.3 + Math.sqrt(rnd()) * 0.62;
    const x = Math.sin(ang) * rad;
    const z = Math.cos(ang) * rad;
    if (occupied(x, z) || Math.hypot(x, z) > 0.93) continue;
    k++;
    bag.add(
      coinColors[k % coinColors.length],
      new THREE.CylinderGeometry(0.048, 0.048, 0.012, 8),
      V(x, DT + 0.0065, z),
      eul((rnd() - 0.5) * 0.12, rnd() * 3, (rnd() - 0.5) * 0.12),
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Crown (tilted, on the front heap)
  const CL = new Loc(V(-0.06, 0.255, 0.17), eul(0.3, 0.55, -0.22));
  const CR = 0.125;
  b.lathe([[CR - 0.02, 0], [CR, 0], [CR + 0.013, 0.075], [CR - 0.007, 0.075]], {
    at: CL.p([0, 0, 0]), axis: CL.d([0, 1, 0]), segments: 16, color: GOLD, bone: base, name: "crownBand",
  });
  b.lathe([[0, 0.03], [0.112, 0.03], [0.114, 0.06], [0.098, 0.1], [0.06, 0.128], [0, 0.136]], {
    at: CL.p([0, 0, 0]), axis: CL.d([0, 1, 0]), segments: 16, color: VELVET2, bone: base, name: "crownCap",
  });
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    goldBag.add(STUD, new THREE.SphereGeometry(0.0085, 6, 4), CL.p([Math.sin(a) * (CR + 0.001), 0.001, Math.cos(a) * (CR + 0.001)]));
    goldBag.add(STUD, new THREE.SphereGeometry(0.0085, 6, 4), CL.p([Math.sin(a) * (CR + 0.016), 0.077, Math.cos(a) * (CR + 0.016)]));
  }
  const tall: number[][] = [[-0.036, 0], [0.036, 0], [0.03, 0.05], [0.054, 0.115], [0.032, 0.155], [0, 0.225, "sharp"] as unknown as number[], [-0.032, 0.155], [-0.054, 0.115], [-0.03, 0.05]];
  const short: number[][] = [[-0.03, 0], [0.03, 0], [0.024, 0.04], [0, 0.1, "sharp"] as unknown as number[], [-0.024, 0.04]];
  const gemRing = [AQUA, RUBY, SAPPH, SAPPH, RUBY];
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 * Math.PI) / 180;
    const s = Math.sin(a);
    const c = Math.cos(a);
    const rr = CR + 0.005;
    b.extrude(tall as never, {
      at: CL.p([s * rr, 0.035, c * rr]), x: CL.d([c, 0, -s]), y: CL.d([0, 1, 0]), thickness: 0.02, bevel: 0.005, color: GOLD, bone: base, name: "crownProng",
    });
    // tip gem on every tall prong, big cyan one at the front
    gem(i === 0 ? AQUA : gemRing[i], CL.p([s * rr, 0.035 + 0.225, c * rr]), CL.d([0, 1, 0]), i === 0 ? 0.055 : 0.04, 0, 6, 0, base, 0.6);
    // band gem
    gem(gemRing[i], CL.p([s * (CR + 0.012), 0.038, c * (CR + 0.012)]), CL.d([s, 0, c]), i === 0 ? 0.06 : 0.045, 0, 6, 15, base, 0.6);
    // short prong between with a pearl on top
    const a2 = a + (36 * Math.PI) / 180;
    const s2 = Math.sin(a2);
    const c2 = Math.cos(a2);
    b.extrude(short as never, {
      at: CL.p([s2 * rr, 0.035, c2 * rr]), x: CL.d([c2, 0, -s2]), y: CL.d([0, 1, 0]), thickness: 0.018, bevel: 0.004, color: GOLD, bone: base, name: "crownShort",
    });
    bag.add(PEARL, new THREE.SphereGeometry(0.014, 6, 5), CL.p([s2 * rr, 0.035 + 0.108, c2 * rr]));
    // pearls between the band gems
    bag.add(PEARL, new THREE.SphereGeometry(0.011, 6, 4), CL.p([s2 * (CR + 0.012), 0.038, c2 * (CR + 0.012)]));
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Goblets
  function goblet(L: Loc, sx: number, sy: number, metal: Paint, trim: string, gemColor: string, coins: boolean) {
    const pf: number[][] = [
      [0, 0], [0.075, 0], [0.082, 0.012], [0.07, 0.026], [0.034, 0.042], [0.021, 0.062], [0.021, 0.115], [0.038, 0.13], [0.038, 0.148],
      [0.021, 0.163], [0.021, 0.178], [0.066, 0.208], [0.088, 0.262], [0.088, 0.325], [0.097, 0.348], [0.097, 0.358], [0.09, 0.358],
      [0.082, 0.33], [0.08, 0.265], [0.05, 0.228], [0, 0.228],
    ];
    b.lathe(pf.map(([x, y]) => [x * sx, y * sy]), { at: L.o, axis: L.d([0, 1, 0]), segments: 10, color: metal, bone: base, name: "gobletBody" });
    // trim band round the bowl and stem knot
    b.lathe([[0.084 * sx, 0.296 * sy], [0.097 * sx, 0.296 * sy], [0.097 * sx, 0.318 * sy], [0.084 * sx, 0.318 * sy]], {
      at: L.o, axis: L.d([0, 1, 0]), segments: 10, color: trim, bone: base, name: "gobletBand",
    });
    b.lathe([[0.034 * sx, 0.118 * sy], [0.044 * sx, 0.128 * sy], [0.044 * sx, 0.15 * sy], [0.034 * sx, 0.16 * sy]], {
      at: L.o, axis: L.d([0, 1, 0]), segments: 8, color: trim, bone: base, name: "gobletKnot",
    });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const s = Math.sin(a);
      const c = Math.cos(a);
      gem(gemColor, L.p([s * 0.097 * sx, 0.307 * sy, c * 0.097 * sx]), L.d([s, 0, c]), 0.032 * sx, 0, 6, 0, base, 0.6);
      goldBag.add(STUD, new THREE.SphereGeometry(0.008, 5, 4), L.p([s * 0.07 * sx, 0.005, c * 0.07 * sx]));
    }
    if (coins) {
      P(lump(0.082 * sx, 0.05 * sy, 0.082 * sx, 5, 0.1, 2), COINHEAP, { at: L.p([0, 0.325 * sy, 0]), quat: L.q, name: "gobletCoins" });
      for (let i = 0; i < 5; i++) {
        const a = i * 1.3 + 0.4;
        const d = L.d([Math.sin(a) * 0.5, 1, Math.cos(a) * 0.5]);
        bag.add(coinColors[i % 4], new THREE.CylinderGeometry(0.036, 0.036, 0.01, 8), L.p([Math.sin(a) * 0.04 * sx, 0.368 * sy, Math.cos(a) * 0.04 * sx]), aim(d));
      }
    }
  }
  goblet(new Loc(V(0.8, DT - 0.003, 0.18), eul(0, 0, 0)), 1, 1, GOLD, "#a8601a", RUBY, true);
  goblet(new Loc(V(0.5, DT - 0.003, 0.68), eul(0, 0, 0)), 1.2, 0.8, SILVER, "#5a6aad", AQUA, true);
  // a tipped goblet spilling coins towards the viewer
  const tipDir = V(-0.55, 0.03, 0.83).normalize();
  const tipL = new Loc(V(-0.78, DT + 0.077, 0.38), aim(tipDir));
  goblet(tipL, 0.92, 0.92, ROSE, "#8a3a4a", AMETH, false);
  const mouth = tipL.p([0, 0.34, 0]);
  for (let i = 0; i < 14; i++) {
    const t = i / 13;
    const px = mouth.x + tipDir.x * (0.04 + t * 0.2) + Math.sin(i * 2.3) * 0.05 * t;
    const pz = mouth.z + tipDir.z * (0.04 + t * 0.2) + Math.cos(i * 1.7) * 0.04 * t;
    bag.add(coinColors[i % coinColors.length], new THREE.CylinderGeometry(0.046, 0.046, 0.012, 8), V(px, DT + 0.0065 + (i % 3 === 0 ? 0.013 : 0), pz), eul((rnd() - 0.5) * 0.2, rnd() * 3, (rnd() - 0.5) * 0.2));
  }
  P(lump(0.07, 0.04, 0.07, 8, 0.1, 2), COINHEAP, { at: mouth.clone().addScaledVector(tipDir, -0.04).setY(DT + 0.04), name: "tipCoins" });

  // ---------------------------------------------------------------------------------------------------------------
  // Coin sack beside the chest
  const SL = new Loc(V(-0.82, DT - 0.004, -0.14), eul(0.07, 0.4, 0.1));
  const sack = b.lathe(
    [[0, 0], [0.14, 0], [0.205, 0.08], [0.225, 0.17], [0.19, 0.26], [0.12, 0.31], [0.07, 0.34], [0.074, 0.36], [0.12, 0.42], [0.112, 0.44], [0.065, 0.4], [0.05, 0.36], [0, 0.35]],
    { at: SL.o, axis: SL.d([0, 1, 0]), segments: 9, color: BURLAP, bone: base, name: "sack" },
  );
  b.lathe([[0.058, 0.33], [0.086, 0.33], [0.086, 0.362], [0.058, 0.362]], { at: SL.o, axis: SL.d([0, 1, 0]), segments: 9, color: "#d33a52", bone: base, name: "sackRope" });
  P(new THREE.TorusGeometry(0.03, 0.007, 5, 8), "#d33a52", { at: SL.p([0.08, 0.34, 0.06]), quat: SL.turned(0.5, 0.3, 0), name: "ropeLoop" });
  b.decal(sack, PATCH, { at: SL.p([0, 0.17, 0.23]), dir: SL.d([0, 0.1, 1]), size: [0.17, 0.17], name: "sackPatch" });
  P(lump(0.1, 0.07, 0.1, 15, 0.12, 2), COINHEAP, { at: SL.p([0, 0.43, 0]), quat: SL.q, name: "sackCoins" });
  for (let i = 0; i < 6; i++) {
    const a = i * 1.1;
    bag.add(coinColors[i % 4], new THREE.CylinderGeometry(0.042, 0.042, 0.011, 8), SL.p([Math.sin(a) * 0.05, 0.475 + (i % 2) * 0.01, Math.cos(a) * 0.05]), aim(V(Math.sin(a) * 0.7, 1, Math.cos(a) * 0.7)));
  }
  // coins spilled from the sack
  for (let i = 0; i < 9; i++)
    bag.add(coinColors[i % coinColors.length], new THREE.CylinderGeometry(0.047, 0.047, 0.012, 8), V(-0.78 + 0.18 + i * 0.045 + Math.sin(i) * 0.02, DT + 0.0065, -0.04 + i * 0.05 + Math.cos(i * 2) * 0.03), eul((rnd() - 0.5) * 0.1, rnd() * 3, 0));

  // ---------------------------------------------------------------------------------------------------------------
  // Gold ingots, stacked
  const ingotOutline: number[][] = [[0, 0], [0.17, 0], [0.152, 0.048], [0.018, 0.048]];
  const ingot = (x: number, y: number, z: number, rot: number) => {
    const xd = V(Math.cos(rot), 0, -Math.sin(rot));
    const base0 = V(x, y, z).addScaledVector(xd, -0.085);
    b.extrude(ingotOutline, { at: base0, x: xd, y: [0, 1, 0], thickness: 0.078, bevel: 0.008, color: GOLD, bone: base, name: "ingot" });
    glow(
      P(new THREE.PlaneGeometry(0.1, 0.05), "#ffffff", { at: V(x, y + 0.0485, z), dir: [0, 1, 0], axis: "z", up: [Math.cos(rot), 0, -Math.sin(rot)], texture: STAMP, name: "ingotStamp" }),
      0.25,
    );
  };
  const IX = 0.72;
  const IZ = -0.3;
  ingot(IX - 0.1, DT, IZ + 0.1, 0.15);
  ingot(IX + 0.1, DT, IZ + 0.1, 0.1);
  ingot(IX, DT, IZ - 0.02, 0.12);
  ingot(IX - 0.1, DT, IZ - 0.14, -0.1);
  ingot(IX + 0.1, DT, IZ - 0.15, 0.2);
  ingot(IX - 0.05, DT + 0.048, IZ + 0.05, 1.4);
  ingot(IX + 0.06, DT + 0.048, IZ - 0.08, 0.2);
  ingot(IX + 0.01, DT + 0.096, IZ - 0.01, 0.5);

  // ---------------------------------------------------------------------------------------------------------------
  // Necklace draped from the chest rim over the heap
  const neck = catmull([[0.14, 0.5, -0.07], [0.2, 0.45, 0.0], [0.24, 0.35, 0.07], [0.3, 0.3, 0.14], [0.4, 0.3, 0.1], [0.46, 0.28, 0.18]]);
  b.sweep(neck, 0.005, { color: "#c98a1e", bone: base, name: "necklaceChain", caps: "round" });
  for (let i = 1; i < 18; i++) {
    const t = i / 18;
    const p = neck.at(t);
    bag.add(i % 4 === 0 ? PINK : PEARL, new THREE.SphereGeometry(i % 4 === 0 ? 0.015 : 0.012, 6, 5), p);
  }
  gem(RUBY, neck.at(0.52).add(V(0, 0.02, 0.02)), V(0.2, 1, 0.4).normalize(), 0.07, 0, 6, 0, base, 0.6);

  // ---------------------------------------------------------------------------------------------------------------
  // Magic crystals on rock bases behind the chest
  function cluster(cx: number, cz: number, s: number) {
    P(lump(0.2, 0.11, 0.17, 71 + cx * 5, 0.14, 2, -0.005), ROCK, { at: [cx, DT, cz], name: "rock" });
    P(lump(0.12, 0.08, 0.1, 81 + cx * 5, 0.14, 1, -0.005), ROCK, { at: [cx + s * 0.18, DT, cz + 0.12], name: "rock" });
    const list: [number, number, number, number, number, number, string][] = [
      // dx, dz, tiltX, tiltZ, h, w, color
      [0, 0, 0.05, -s * 0.2, 0.72, 0.12, AQUA],
      [-s * 0.1, 0.07, 0.35, s * 0.28, 0.5, 0.1, PINK],
      [s * 0.1, -0.06, -0.3, -s * 0.5, 0.46, 0.09, AQUA],
      [s * 0.04, 0.14, 0.7, -s * 0.1, 0.3, 0.08, PINK],
      [-s * 0.14, -0.08, -0.35, s * 0.55, 0.34, 0.08, AQUA],
      [s * 0.2, 0.12, 0.5, -s * 0.7, 0.2, 0.06, PINK],
    ];
    list.forEach(([dx, dz, tx, tz, h, w, col], i) => {
      const dir = V(Math.sin(tz), Math.cos(tx), Math.sin(tx)).normalize();
      const at = V(cx + dx, DT + 0.06, cz + dz);
      glow(
        b.lathe([[0, 0], [0.5 * w, 0.05 * h], [0.5 * w, 0.72 * h], [0, h]], { at, axis: dir, segments: 6, spin: i * 17, color: col, bone: base, name: "crystal" }),
        0.55,
      );
    });
  }
  cluster(0.66, -0.66, 1);
  cluster(-0.66, -0.66, -1);

  // ---------------------------------------------------------------------------------------------------------------
  // Magic: rays out of the chest, sparkles, a floating gem with a halo
  const rayC = V(0, 0.64, -0.3);
  const rayAng = [-62, -42, -22, 22, 42, 62];
  const rayLen = [0.55, 0.75, 0.9, 0.9, 0.75, 0.55];
  rayAng.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    glow(
      b.cards([frame(rayC, [Math.sin(a), Math.cos(a), 0.1])], RAY, { size: [0.11, rayLen[i]], flow: [0, 0, 1], cross: true, sink: 0, name: "ray" }),
      1,
    );
  });
  const sparkFrames: ReturnType<typeof frame>[] = [];
  const sr = rng(99);
  for (let i = 0; i < 34; i++)
    sparkFrames.push(frame(V((sr() - 0.5) * 1.7, 0.3 + sr() * 0.9, -0.55 + sr() * 1.25), [0, 1, 0]));
  glow(
    b.cards(sparkFrames, SPARK, {
      size: 0.075, vary: 0.5, spin: 180, rng: rng(5), cross: true, sink: 0.5, flow: (_f, i) => [Math.cos(i * 1.7), 0, Math.sin(i * 1.7)], name: "sparkles",
    }),
    1,
  );
  gem("#8ff5ff", V(0, 0.9, -0.28), V(0, 1, 0), 0.22, 0, 8, 0, base, 0.7);
  glow(P(new THREE.TorusGeometry(0.19, 0.01, 5, 24), HASP, { at: [0, 1.0, -0.28], rotation: [70, 0, 15], name: "halo" }), 1);
  glow(P(new THREE.TorusGeometry(0.15, 0.007, 5, 20), AQUA, { at: [0, 1.0, -0.28], rotation: [-60, 0, 30], name: "halo2" }), 1);

  // ---------------------------------------------------------------------------------------------------------------
  bag.flush();
  goldBag.flush();
  lidBag.flush();
  glowBag.flush(1);

  b.pose(lid, { axis: [1, 0, 0], deg: -108 });
  return b.root;
}
