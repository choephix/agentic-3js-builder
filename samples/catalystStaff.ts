import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { paint } from "../src/paint";
import { bezier, spiral } from "../src/path";
import { svg } from "../src/texture";
import { cel, inkLines } from "../kits/toon";
import { glow } from "../kits/glow";

const VIOLET = cel("#5a3a93", "#2b1c5f");
const VIOLET_DARK = cel("#34205e", "#191331");
const GOLD = cel("#ffd56b", "#aa552d");
const GOLD_BRIGHT = cel("#fff2a6", "#d47b37");
const CYAN = cel("#70f4ed", "#278ea8");
const CYAN_DARK = cel("#35b9d5", "#174f89");
const MAGENTA = cel("#f47acb", "#7d287a");
const WOOD = cel("#3b234f", "#1d1634");
const ORB = "#7df7ff";
const ORB_CORE = "#dca7ff";

const SHAFT = inkLines(VIOLET, { levels: [0.35], axis: [0, 1, 0], width: 0.08 });
const WOOD_GRAIN = paint((_p, _n, s) => (Math.sin(s[1] * 17 + s[0] * 4) > 0.35 ? WOOD : VIOLET_DARK));

const RUNE = svg(
  `<svg viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="51" fill="none" stroke="#fff7cf" stroke-width="4"/>
    <circle cx="64" cy="64" r="39" fill="none" stroke="#79ffff" stroke-width="2" stroke-dasharray="9 7"/>
    <path d="M64 19 L72 53 L104 64 L72 75 L64 109 L56 75 L24 64 L56 53 Z" fill="none" stroke="#fff7cf" stroke-width="4"/>
    <path d="M40 39 L53 51 M88 39 L75 51 M40 89 L53 77 M88 89 L75 77" stroke="#f47acb" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

export const meta = {
  name: "Astral Bloom Catalyst Staff",
  description: "An ornate Genshin Impact-inspired catalyst staff with a floating rune orb, gold filigree, and luminous petals.",
  style: "Genshin Impact",
  commit: "34f986c",
};

export default function build() {
  const b = createBuilder({ name: "catalystStaff", detail: 1.15, paintSize: 1024 });
  const root = b.joint("staffRoot", { at: [0, 0, 0], role: "hinge" });

  // Weighted foot and faceted butt cap keep the 1.95 m staff planted at y=0.
  b.lathe(
    [
      [0, 0], [0.13, 0], [0.16, 0.025], [0.16, 0.055], [0.11, 0.1],
      [0.085, 0.14], [0.07, 0.17], [0, 0.17],
    ],
    { at: [0, 0, 0], segments: 10, smoothing: 1, color: VIOLET_DARK, bone: root, name: "buttCap" },
  );
  b.lathe(
    [[0, 0.16], [0.095, 0.16], [0.11, 0.19], [0.1, 0.23], [0.072, 0.26], [0, 0.26]],
    { at: [0, 0, 0], segments: 10, smoothing: 1, color: GOLD, bone: root, name: "baseGoldCollar" },
  );
  b.sweep([[0, 0.21, 0], [0, 1.5, 0]], [0.061, 0.036], {
    color: SHAFT, section: { ngon: 8 }, caps: "flat", bone: root, name: "facetedShaft",
  });
  b.sweep([[0, 0.235, 0], [0, 1.46, 0]], [0.044, 0.028], {
    color: WOOD_GRAIN, section: { ngon: 6 }, caps: "flat", bone: root, name: "innerShaft",
  });

  // Delicate violet-gold spiral wraps the shaft like an inlaid constellation.
  const wrap = spiral([0, 0.38, 0], [0.071, 0.38, 0], [0, 1, 0], { turns: 2.2, pitch: 0.53 });
  b.sweep(wrap, 0.009, { color: GOLD_BRIGHT, section: { ngon: 6 }, caps: "round", bone: root, name: "goldSpiral" });
  const wrapInset = spiral([0, 0.39, 0], [-0.073, 0.39, 0], [0, 1, 0], { turns: -2.2, pitch: 0.53 });
  b.sweep(wrapInset, 0.005, { color: CYAN_DARK, section: { ngon: 5 }, caps: "round", bone: root, name: "cyanSpiral" });

  // Eight small waist studs and three broad collars make the silhouette readable.
  for (const y of [0.3, 0.72, 1.13, 1.47]) {
    b.sweep(spiral([0, y, 0], [0.073, y, 0], [0, 1, 0], { turns: 1, pitch: 0 }), 0.012, {
      color: GOLD, section: { ngon: 6 }, caps: "round", bone: root, name: `collarFiligree${y}`,
    });
  }
  for (const y of [0.28, 0.73, 1.16, 1.49]) {
    b.part(new THREE.TorusGeometry(0.067, 0.012, 6, 12), GOLD_BRIGHT, {
      bone: root, at: [0, y, 0], rotation: [0, 0, 0], name: `goldRing${y}`,
    });
  }

  // A faceted guard spreads from the shaft into a floral, gold-lined cradle.
  b.lathe(
    [[0, 1.45], [0.09, 1.45], [0.11, 1.49], [0.09, 1.55], [0, 1.58]],
    { at: [0, 0, 0], segments: 8, smoothing: 0, color: GOLD, bone: root, name: "shoulderGuard" },
  );
  b.lathe(
    [[0, 1.48], [0.075, 1.48], [0.081, 1.53], [0, 1.57]],
    { at: [0, 0, 0], segments: 8, color: VIOLET_DARK, bone: root, name: "guardInset" },
  );

  const petalOutline = [
    [0, 0], [0.055, 0.035], [0.13, 0.11], [0.18, 0.22, "sharp"], [0.13, 0.31], [0.04, 0.27], [-0.01, 0.13],
  ] as const;
  for (const s of [1, -1]) {
    const petal = b.extrude(petalOutline, {
      at: [s * 0.035, 1.52, 0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.018, bevel: 0.008,
      smoothing: 1, color: VIOLET, bone: root, name: `sidePetal${s > 0 ? "L" : "R"}`,
    });
    b.sweep(bezier(petal.local([0.02, 0.02, 0.012]), petal.local([0.06, 0.08, 0.012]), petal.local([0.12, 0.18, 0.012]), petal.local([0.14, 0.27, 0.012])), 0.008, {
      color: GOLD_BRIGHT, section: { ngon: 5 }, caps: "round", bone: root, name: `petalRib${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.018, 8, 6), CYAN, { bone: root, at: petal.local([0.12, 0.2, 0.02]), name: `petalGem${s > 0 ? "L" : "R"}` });
  }

  // Four curved golden arms cradle the orb without touching it.
  const cradlePaths = [
    [[-0.13, 1.56, 0], [-0.18, 1.7, 0], [-0.13, 1.83, 0.02], [-0.065, 1.88, 0.03]],
    [[0.13, 1.56, 0], [0.18, 1.7, 0], [0.13, 1.83, 0.02], [0.065, 1.88, 0.03]],
    [[0, 1.56, -0.11], [0, 1.7, -0.17], [0, 1.83, -0.12], [0, 1.88, -0.055]],
    [[0, 1.56, 0.11], [0, 1.7, 0.17], [0, 1.83, 0.12], [0, 1.88, 0.055]],
  ] as number[][][];
  cradlePaths.forEach((points, i) => {
    b.sweep(points, [0.018, 0.006], { color: GOLD_BRIGHT, section: { ngon: 6 }, caps: "round", bone: root, name: `orbCradle${i}` });
    b.part(new THREE.SphereGeometry(0.022, 8, 6), MAGENTA, { bone: root, at: points[1], name: `cradleJewel${i}` });
  });

  // The orb floats above the cradle; its inner core and front rune are self-lit.
  const orb = b.part(new THREE.SphereGeometry(0.125, 18, 14), ORB, {
    bone: root, at: [0, 1.98, 0], name: "floatingOrb",
  });
  glow(orb, 1.4);
  const orbInner = b.part(new THREE.SphereGeometry(0.082, 14, 10), ORB_CORE, {
    bone: root, at: [0, 1.98, 0.012], name: "orbInnerLight",
  });
  glow(orbInner, 2);
  b.part(new THREE.CircleGeometry(0.086, 18), "#ffffff", {
    bone: root, at: [0, 1.98, 0.132], dir: [0, 0, 1], axis: "z", texture: RUNE, name: "orbRune",
  });
  b.part(new THREE.CircleGeometry(0.086, 18), "#ffffff", {
    bone: root, at: [0, 1.98, -0.132], dir: [0, 0, -1], axis: "z", texture: RUNE, name: "orbRuneBack",
  });

  // Two tilted halo rings and four orbiting gems sell the magical levitation.
  const haloA = b.part(new THREE.TorusGeometry(0.17, 0.008, 6, 24), ORB, {
    bone: root, at: [0, 1.98, 0], rotation: [0.42, 0.28, 0.12], name: "orbHaloA",
  });
  glow(haloA, 2.2);
  const haloB = b.part(new THREE.TorusGeometry(0.145, 0.006, 6, 24), "#f47acb", {
    bone: root, at: [0, 1.98, 0], rotation: [-0.58, -0.18, 0.25], name: "orbHaloB",
  });
  glow(haloB, 1.8);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const p: [number, number, number] = [Math.cos(a) * 0.16, 1.98 + Math.sin(a) * 0.16, 0.02 + Math.sin(a * 2) * 0.035];
    const mote = b.part(new THREE.OctahedronGeometry(i % 2 ? 0.016 : 0.012, 0), i % 2 ? "#fff2a6" : ORB, {
      bone: root, at: p, name: `orbitMote${i}`,
    });
    glow(mote, 1.6);
  }

  // Short rune pennants and a tassel hang from the collar as readable surface detail.
  const tassel = svg(
    `<svg viewBox="0 0 32 96"><path d="M16 2 L30 18 L24 86 L16 94 L8 86 L2 18 Z" fill="#70f4ed"/><path d="M16 8 L16 88 M8 20 L24 20 M7 34 L25 34" stroke="#fff2a6" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    b.cards([frame([s * 0.082, 1.42, 0.02], [0, 1, 0])], tassel, {
      size: [0.075, 0.2], lean: 180, flow: [0, 0, 1], mirror: s < 0, sink: 0.05, color: "#ffffff",
    });
  }

  // Tiny facets at the base echo the orb's eight-point star motif.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = Math.cos(a) * 0.115;
    const z = Math.sin(a) * 0.115;
    b.part(new THREE.ConeGeometry(0.018, 0.06, 5), i % 2 ? GOLD_BRIGHT : MAGENTA, {
      bone: root, at: [x, 0.17, z], name: `baseStar${i}`,
    });
  }

  return b.root;
}
