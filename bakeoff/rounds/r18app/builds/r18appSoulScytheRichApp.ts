import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG, rng } from "../../../../src/math";
import { mottle, paint, patches } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
type ColorInput = string | Paint;
import { bezier, catmull, polyline, spiral } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A towering dragonbone scythe on a runed stone dais: vertebra snath, a dragon skull holding a spectral soul-blade in its jaws, spurred bone spine, flames and orbiting souls, with a dragon-skull trophy and rib nest beside it.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: cel-shaded ivory bone, deep violet iron, gold, and one hot teal soul glow.
const BONE = cel(
  mottle("#f7ecca", "#ecdcb0", { size: 0.05, contrast: 1.6, seed: 2 }),
  mottle("#b7a0b0", "#a58ba0", { size: 0.05, contrast: 1.6, seed: 2 }),
);
const BONE_AGED = cel("#dcc698", "#9d8498");
const TOOTH = cel("#fffae6", "#cbb9bd");
const VIOLET = cel("#37246f", "#1d1247");
const CLOTH = cel("#8f3fe0", "#5a2aa4");
const CLOTH_DARK = cel("#4b2a9a", "#2e1a68");
const GOLD = cel("#ffd75e", "#c47f1c");
const HORN_TIP = cel("#7b45e6", "#432797");
const STONE_TOP = cel(
  patches("#2b2957", ["#4b4983", "#454378", "#514f8c", "#3f3d72"], { size: 0.34, gap: 0.045, seed: 6 }),
  "#232049",
);
const STONE_SIDE = cel(mottle("#3c3a72", "#4a4882", { size: 0.14, contrast: 1.2, seed: 4 }), "#25234f");
const SOCKET = "#1b0e2c";
const TEAL = "#2ff7d8";
const TEAL_HOT = "#c9fff6";

// Soul flame tongue, glyphs and rune circle: glowing drawings.
const FLAME = svg(
  `<svg viewBox="0 0 64 128">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#0fa3c8"/><stop offset="0.5" stop-color="#27ecd2"/><stop offset="1" stop-color="#b6fff2"/></linearGradient></defs>
  <path d="M8 128 C-2 98 16 76 25 54 C31 40 28 22 38 2 C42 26 56 38 53 62 C62 78 64 106 56 128 Z" fill="url(#g)"/>
  <path d="M24 128 C17 108 27 92 33 78 C36 64 35 52 40 38 C46 58 54 76 47 102 C45 114 43 122 41 128 Z" fill="#e6fffb"/>
</svg>`,
  { size: 128 },
);

const glyph = (body: string) =>
  svg(
    `<svg viewBox="0 0 64 64"><g fill="none" stroke="#3dffe0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`,
    { size: 128 },
  );
const GLYPHS = [
  glyph(`<path d="M32 6 L32 58 M14 20 L50 20 M18 46 L32 32 L46 46"/>`),
  glyph(`<circle cx="32" cy="32" r="20"/><path d="M32 4 L32 60 M4 32 L60 32"/>`),
  glyph(`<path d="M10 14 L32 30 L10 46 M54 14 L32 30 L54 46 M32 8 L32 56"/>`),
  glyph(`<path d="M32 6 L56 52 L8 52 Z"/><circle cx="32" cy="38" r="4"/>`),
];

const runeCircle = (() => {
  const c = 100;
  const pt = (r: number, deg: number) => `${(c + r * Math.cos(deg * DEG)).toFixed(2)} ${(c + r * Math.sin(deg * DEG)).toFixed(2)}`;
  let ticks = "";
  for (let i = 0; i < 36; i++) ticks += `M${pt(84, i * 10)} L${pt(i % 3 === 0 ? 97 : 91, i * 10)} `;
  let marks = "";
  for (let i = 0; i < 12; i++) {
    const a = i * 30 + 15;
    marks += `M${pt(60, a - 6)} L${pt(72, a)} L${pt(60, a + 6)} M${pt(63, a)} L${pt(75, a)} `;
  }
  let star = "";
  for (let i = 0; i < 8; i++) star += `${i ? "L" : "M"}${pt(50, i * 135)} `;
  return svg(
    `<svg viewBox="0 0 200 200"><g fill="none" stroke="#3dffe0" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="100" r="98" stroke-width="2.6"/><circle cx="100" cy="100" r="84" stroke-width="2"/>
    <circle cx="100" cy="100" r="54" stroke-width="2.2"/><circle cx="100" cy="100" r="20" stroke-width="2"/>
    <path d="${ticks}" stroke-width="1.8"/><path d="${marks}" stroke-width="1.8"/><path d="${star}Z" stroke-width="1.8"/>
    </g></svg>`,
    { size: 1024 },
  );
})();

export default function build() {
  const b = createBuilder({ name: "soulScythe" });
  b.joint("root", { at: [0, 0.4, 0] });
  const rand = rng(11);

  const D = 0.15; // dais top
  const PX = -0.4; // snath axis x
  const Yup = new THREE.Vector3(0, 1, 0);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const gem = (at: THREE.Vector3, r: number, color = TEAL, strength = 1.4) =>
    glow(b.part(new THREE.OctahedronGeometry(r, 0), color, { at, flat: true }), strength);
  const ring = (at: THREE.Vector3, rOut: number, h: number, color: ColorInput, seg = 10) =>
    b.lathe(
      [
        [0, 0],
        [rOut, 0],
        [rOut, h],
        [0, h],
      ],
      { at, segments: seg, color },
    );

  // ------------------------------------------------------------------------------------------------------------
  // Dais: two chamfered tiers, gold trim, glowing inlay, claw feet, gems.
  const chamfer = (hw: number, hd: number, c: number): OutlinePoint[] => [
    [-hw + c, -hd],
    [hw - c, -hd],
    [hw, -hd + c],
    [hw, hd - c],
    [hw - c, hd],
    [-hw + c, hd],
    [-hw, hd - c],
    [-hw, -hd + c],
  ];
  const slabRing = (hw: number, hd: number, c: number, y: number) =>
    polyline(
      chamfer(hw, hd, c).map(([x, z]) => V(x, y, z)),
      { closed: true },
    );
  b.extrude(chamfer(1.05, 0.5, 0.16), { at: [0, 0.04, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.08, bevel: 0.012, color: STONE_SIDE });
  b.extrude(chamfer(0.97, 0.42, 0.14), { at: [0, 0.115, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.01, color: STONE_TOP });
  b.sweep(slabRing(1.05, 0.5, 0.16, 0.082), 0.013, GOLD, { section: { ngon: 4 } });
  b.sweep(slabRing(0.97, 0.42, 0.14, 0.15), 0.011, GOLD, { section: { ngon: 4 } });
  glow(b.sweep(slabRing(0.9, 0.35, 0.12, 0.152), 0.007, TEAL, { section: { ngon: 4 } }), 1.2);
  // claw feet at the four corners
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.07, 6, 5), GOLD, { at: [sx * 0.97, 0.07, sz * 0.42], flat: true });
      b.spike(V(sx * 0.97, 0.075, sz * 0.42), V(sx * 1.13, 0.0, sz * 0.58), null, 0.055, BONE, { sides: 6 });
      b.spike(V(sx * 0.97, 0.075, sz * 0.42), V(sx * 1.2, 0.0, sz * 0.4), null, 0.04, BONE, { sides: 6 });
    }
  // front gems with gold bezels
  for (const x of [-0.6, 0, 0.6]) {
    b.part(new THREE.CylinderGeometry(0.05, 0.058, 0.025, 6), GOLD, { at: [x, 0.04, 0.503], dir: [0, 0, 1], flat: true });
    glow(b.part(new THREE.OctahedronGeometry(0.036, 0), TEAL, { at: [x, 0.04, 0.52], flat: true }), 1.4);
  }
  // rune circle under the snath
  glow(
    b.part(new THREE.PlaneGeometry(0.66, 0.66), "#ffffff", {
      at: [PX, D + 0.004, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: runeCircle,
    }),
    1.1,
  );

  // ------------------------------------------------------------------------------------------------------------
  // Snath: dark core, dragon vertebrae with neural spines and flanges, wrapped grip, talons, ferrule.
  b.rod(V(PX, D - 0.03, 0), V(PX, 1.97, 0), 0.026, VIOLET, { sides: 6 });
  ring(V(PX, D, 0), 0.1, 0.05, GOLD, 8);
  ring(V(PX, D + 0.05, 0), 0.065, 0.05, VIOLET, 8);
  ring(V(PX, D + 0.1, 0), 0.075, 0.025, GOLD, 8);
  for (let k = 0; k < 4; k++) {
    const a = (45 + k * 90) * DEG;
    const at = (r: number, y: number) => V(PX + Math.cos(a) * r, y, Math.sin(a) * r);
    b.sweep(bezier(at(0.05, D + 0.13), at(0.14, D + 0.12), at(0.16, D + 0.0)), [0.032, 0], BONE, { sides: 6, caps: "point" });
  }
  const vert = (y: number, i: number, big: number) => {
    b.part(new THREE.CylinderGeometry(0.036 + big * 0.004, 0.047 + big * 0.004, 0.046, 7), BONE, { at: [PX, y, 0], flat: true });
    b.spike(V(PX - 0.025, y, 0), V(-1, 0.3 + 0.2 * (i % 2), 0), 0.08 + big * 0.012, 0.016 + big * 0.0012, BONE_AGED, { sides: 5 });
    for (const s of [1, -1]) b.spike(V(PX, y, s * 0.03), V(0, -0.15, s), 0.07, 0.014, BONE, { sides: 5 });
  };
  for (let i = 0; i < 8; i++) vert(0.36 + 0.055 * i, i, i * 0.3);
  for (let i = 0; i < 11; i++) vert(1.3 + 0.055 * i, i, 2.4 + i * 0.3);
  // grip wrap: spiral cord with gold thread
  const WRAP = paint((_p, _n, s) => {
    const k = (((s[1] + 360 * 9 * s[0]) % 360) + 360) % 360;
    return k < 100 ? CLOTH_DARK : k < 122 ? GOLD : VIOLET;
  });
  b.rod(V(PX, 0.78, 0), V(PX, 1.22, 0), 0.033, WRAP, { sides: 8, caps: "flat" });
  for (const y of [0.77, 1.225]) ring(V(PX, y - 0.01, 0), 0.047, 0.022, GOLD, 8);
  ring(V(PX, 0.995, 0), 0.04, 0.012, GOLD, 8);
  // talon collar
  ring(V(PX, 1.235, 0), 0.058, 0.028, GOLD, 8);
  for (let k = 0; k < 5; k++) {
    const a = (18 + k * 72) * DEG;
    const at = (r: number, y: number) => V(PX + Math.cos(a) * r, y, Math.sin(a) * r);
    b.sweep(bezier(at(0.05, 1.255), at(0.15, 1.3), at(0.11, 1.34), at(0.07, 1.52)), [0.026, 0], BONE, { sides: 6, caps: "point" });
  }
  // hanging ribbons with a charm
  for (const s of [1, -1]) {
    const rib = catmull([
      V(PX - 0.02, 1.2, s * 0.045),
      V(PX - 0.09 - 0.02 * s, 1.07, s * 0.115),
      V(PX - 0.03, 0.94, s * 0.1),
      V(PX - 0.11 + 0.03 * s, 0.82, s * 0.15),
    ]);
    b.sweep(rib, (t: number) => [0.03 - 0.012 * t, 0.004], s > 0 ? CLOTH : CLOTH_DARK, { section: "box", caps: "flat" });
    const end = rib.at(1);
    b.spike(end.clone().add(V(0, 0.01, 0)), V(0, -1, 0), 0.07, 0.018, TOOTH, { sides: 5 });
    b.part(new THREE.SphereGeometry(0.022, 6, 4), GOLD, { at: end.clone().add(V(0, 0.01, 0)), flat: true });
  }

  // ------------------------------------------------------------------------------------------------------------
  // Dragon skull builder: local u forward, v up, w sideways. Used for the scythe head and the trophy.
  const skull = (o: { at: THREE.Vector3; s: number; yaw: number; jaw: number; flames: boolean }) => {
    const { s, yaw, jaw } = o;
    const pt = (u: number, v: number, w: number) => V(u * s, v * s, w * s).applyAxisAngle(Yup, yaw * DEG).add(o.at);
    const ja = jaw * DEG;
    const jp = (du: number, dv: number, w: number) =>
      pt(-0.01 + du * Math.cos(ja) + dv * Math.sin(ja), -0.075 - du * Math.sin(ja) + dv * Math.cos(ja), w);
    const ell = (u: number, v: number, w: number, ru: number, rv: number, rw: number, color: ColorInput, seg = 9) =>
      b.part(new THREE.SphereGeometry(1, seg, Math.max(4, seg - 3)), color, {
        at: pt(u, v, w),
        scale: [ru * s, rv * s, rw * s],
        rotation: [0, yaw, 0],
        flat: true,
      });

    ell(0, 0, 0, 0.13, 0.1, 0.095, BONE);
    ell(-0.08, -0.012, 0, 0.07, 0.08, 0.085, BONE);
    // snout and muzzle
    b.loft(
      [
        { at: pt(0.05, 0.0, 0), w: 0.18 * s, h: 0.15 * s },
        { at: pt(0.2, -0.01, 0), w: 0.13 * s, h: 0.11 * s },
        { at: pt(0.33, -0.015, 0), w: 0.105 * s, h: 0.085 * s },
        { at: pt(0.44, -0.022, 0), w: 0.1 * s, h: 0.07 * s },
      ],
      { color: BONE, section: { ngon: 6 }, caps: { start: "round", end: "flat" } },
    );
    ell(0.44, 0.012, 0, 0.03, 0.022, 0.05, BONE_AGED, 7);
    for (const w of [-1, 1]) ell(0.46, 0.012, w * 0.025, 0.012, 0.01, 0.012, SOCKET, 5);
    // upper teeth
    for (const sd of [1, -1])
      for (let i = 0; i < 7; i++) {
        const u = 0.12 + 0.05 * i;
        const hw = (0.09 - (u - 0.06) * 0.095) * 0.82 * sd;
        const len = i === 2 ? 0.095 : 0.034 + (i % 2) * 0.01;
        b.spike(pt(u, -0.036, hw), pt(u + 0.006, -0.036 - len, hw), null, (i === 2 ? 0.017 : 0.011) * s, TOOTH, { sides: 5 });
      }
    // lower jaw
    b.loft(
      [
        { at: jp(0.03, -0.015, 0), w: 0.15 * s, h: 0.042 * s },
        { at: jp(0.2, -0.012, 0), w: 0.1 * s, h: 0.036 * s },
        { at: jp(0.36, -0.006, 0), w: 0.075 * s, h: 0.032 * s },
      ],
      { color: BONE, section: { ngon: 6 }, caps: { start: "round", end: "flat" } },
    );
    for (const sd of [1, -1]) {
      b.rod(jp(-0.01, 0.0, sd * 0.07), jp(-0.03, 0.06, sd * 0.09), [0.03 * s, 0.02 * s], BONE, { sides: 6 });
      for (let i = 0; i < 6; i++) {
        const du = 0.1 + 0.05 * i;
        const hw = (0.068 - 0.0075 * i) * sd;
        const len = i === 1 ? 0.07 : 0.03 + (i % 2) * 0.008;
        b.spike(jp(du, 0.01, hw), jp(du + 0.004, 0.01 + len, hw), null, (i === 1 ? 0.014 : 0.009) * s, TOOTH, { sides: 5 });
      }
    }
    // eyes, brows
    for (const sd of [1, -1]) {
      ell(0.1, 0.035, sd * 0.078, 0.047, 0.036, 0.024, SOCKET, 8);
      glow(
        b.part(new THREE.SphereGeometry(1, 6, 4), TEAL, {
          at: pt(0.108, 0.037, sd * 0.088),
          scale: [0.026 * s, 0.026 * s, 0.014 * s],
          rotation: [0, yaw, 0],
          flat: true,
        }),
        1.6,
      );
      b.rod(pt(0.18, 0.062, sd * 0.066), pt(-0.05, 0.1, sd * 0.112), [0.016 * s, 0.026 * s], BONE_AGED, { sides: 6 });
      b.spike(pt(0.0, 0.09, sd * 0.105), pt(-0.07, 0.19, sd * 0.13), null, 0.022 * s, BONE_AGED, { sides: 6 });
      // main horns sweep back, ridged with gold, violet tips
      const horn = bezier(pt(-0.03, 0.075, sd * 0.07), pt(-0.2, 0.17, sd * 0.13), pt(-0.4, 0.15, sd * 0.19), pt(-0.54, 0.02, sd * 0.17));
      b.sweep(
        horn,
        [0.042 * s, 0],
        paint((_p, _n, st) => (st[0] > 0.74 ? HORN_TIP : Math.abs(st[0] - 0.3) < 0.025 || Math.abs(st[0] - 0.5) < 0.02 ? GOLD : BONE)),
        { sides: 6, caps: "point" },
      );
      b.sweep(
        bezier(pt(-0.05, -0.01, sd * 0.09), pt(-0.2, 0.0, sd * 0.2), pt(-0.33, -0.1, sd * 0.26)),
        [0.03 * s, 0],
        paint((_p, _n, st) => (st[0] > 0.7 ? HORN_TIP : BONE_AGED)),
        { sides: 6, caps: "point" },
      );
      for (let k = 0; k < 3; k++)
        b.spike(jp(0.0, 0.0 + 0.0 * k, sd * 0.085), pt(-0.12 - 0.01 * k, 0.015 - 0.055 * k, sd * 0.17), null, 0.02 * s, BONE_AGED, { sides: 5 });
    }
    // crest, circlet and forehead gem
    for (let i = 0; i < 5; i++) {
      const u = 0.12 - 0.05 * i;
      b.spike(pt(u, 0.085, 0), pt(u - 0.035, 0.085 + 0.075 - 0.008 * i, 0), null, (0.016 - 0.001 * i) * s, BONE_AGED, { sides: 5 });
    }
    b.sweep(
      catmull(
        Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return pt(0.05, 0.106 * Math.cos(a), 0.1 * Math.sin(a));
        }),
        { closed: true },
      ),
      0.011 * s,
      GOLD,
      { sides: 5 },
    );
    gem(pt(0.06, 0.108, 0), 0.026 * s);
    if (o.flames) {
      const hits = [0.08, 0.16, 0.24, 0.32].map((u, i) => frame(pt(u, -0.06, (i % 2 ? 1 : -1) * 0.02), [0, 1, 0]));
      glow(b.cards(hits, FLAME, { size: [0.06 * s, 0.14 * s], lean: 10, flow: [0.3, 0, 0.2], cross: true, vary: 0.25, rng: rand }), 1.2);
    }
  };

  // Scythe head
  const HEAD = V(PX + 0.04, 2.02, 0);
  skull({ at: HEAD, s: 1, yaw: 0, jaw: 28, flames: false });
  ring(V(PX, 1.87, 0), 0.062, 0.04, GOLD, 8);
  b.part(new THREE.CylinderGeometry(0.08, 0.045, 0.07, 8), GOLD, { at: [PX, 1.935, 0], flat: true });
  b.part(new THREE.SphereGeometry(0.06, 7, 5), VIOLET, { at: [PX, 1.96, 0], flat: true });

  // ------------------------------------------------------------------------------------------------------------
  // Blade: bone spine arc with spurs and ribs, a cel-banded obsidian plate, a glowing edge, soul flames and runes.
  const spine = catmull(
    [
      [0.24, 2.03],
      [0.45, 2.22],
      [0.74, 2.31],
      [1.02, 2.22],
      [1.2, 2.0],
      [1.23, 1.76],
      [1.14, 1.58],
    ].map(([x, y]) => V(PX + x, y, 0)),
  );
  const W = (t: number) => 0.26 * Math.pow(1 - t, 0.9) * Math.min(1, 0.45 + 2.2 * t);
  const tanAt = (t: number) => spine.tangentAt(t);
  const inward = (t: number) => {
    const T = tanAt(t);
    return V(T.y, -T.x, 0).normalize();
  };
  const spineAt = (t: number) => spine.at(t);
  const edgeAt = (t: number, k = 1) => spineAt(t).add(inward(t).multiplyScalar(W(t) * k));

  const T0 = 0.04;
  const outline: OutlinePoint[] = [];
  for (let i = 0; i <= 22; i++) {
    const t = T0 + ((1 - T0) * i) / 22;
    const p = spineAt(t).addScaledVector(inward(t), 0.012);
    outline.push([p.x, p.y]);
  }
  for (let i = 21; i >= 0; i--) {
    const t = T0 + ((1 - T0) * i) / 22;
    const p = edgeAt(t);
    outline.push([p.x, p.y]);
  }
  const PLATE = paint((p, _n, _s) => {
    const tt = spine.closestT(p);
    const c = spineAt(tt);
    const w = Math.max(W(tt), 1e-3);
    const f = Math.hypot(p.x - c.x, p.y - c.y) / w + 0.05 * Math.sin(tt * 34);
    if (f > 0.84) return cel("#3bf0d8", "#1fb2c2");
    if (f > 0.58) return cel("#1b9fb6", "#157390");
    if (f > 0.3) return cel("#4b3fc0", "#33289a");
    return cel("#2b1b69", "#1b1048");
  });
  b.extrude(outline, { at: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.026, bevel: 0.009, color: PLATE });
  // glowing cutting edge
  const edgePts = Array.from({ length: 26 }, (_, i) => edgeAt(0.1 + (0.9 * i) / 25, 1.0));
  glow(b.sweep(catmull(edgePts), (t: number) => 0.016 * (1 - t) + 0.004, TEAL, { sides: 6, caps: "point" }), 1.5);
  // bone spine
  b.sweep(spine, (t: number) => 0.05 * (1 - t) + 0.014, BONE, { sides: 8, caps: { start: "round", end: "point" } });
  b.along(spine, 7, (at) => b.part(new THREE.SphereGeometry(0.062 * (1 - at.t) + 0.028, 7, 5), BONE_AGED, { at: at.at, flat: true }));
  for (const t of [0.12, 0.33, 0.58]) {
    b.part(new THREE.CylinderGeometry(0.062 * (1 - t) + 0.026, 0.062 * (1 - t) + 0.026, 0.024, 8), GOLD, {
      at: spineAt(t),
      dir: tanAt(t),
      flat: true,
    });
  }
  // outward spurs sweeping back toward the head
  for (let i = 0; i < 7; i++) {
    const t = 0.18 + i * 0.115;
    const T = tanAt(t);
    const out = V(-T.y, T.x, 0).normalize();
    const dir = out.clone().multiplyScalar(0.85).addScaledVector(T, -0.4);
    b.spike(spineAt(t), dir, 0.17 * (1 - t * 0.6), 0.026 * (1 - t * 0.5), i % 2 ? BONE_AGED : BONE, { sides: 6 });
  }
  // wing-finger ribs on both faces of the plate
  for (const s of [1, -1])
    for (let k = 0; k < 4; k++) {
      const ta = 0.2 + 0.16 * k;
      b.spike(spineAt(ta).setZ(s * 0.02), edgeAt(ta + 0.1, 0.82).setZ(s * 0.02), null, 0.017, BONE, { sides: 6 });
    }
  // runes inlaid in the plate
  for (let k = 0; k < 5; k++) {
    const t = 0.2 + 0.11 * k;
    const size = Math.min(0.085, W(t) * 0.62);
    const p = edgeAt(t, 0.46);
    for (const s of [1, -1])
      glow(
        b.part(new THREE.PlaneGeometry(size, size), "#ffffff", {
          at: V(p.x, p.y, s * 0.0135),
          dir: [0, 0, s],
          axis: "z",
          up: tanAt(t),
          texture: GLYPHS[k % 4],
        }),
        1.3,
      );
  }
  // soul flames licking off the spine
  const flameFrames: ReturnType<typeof frame>[] = [];
  const flameFlow: THREE.Vector3[] = [];
  for (let i = 0; i < 9; i++) {
    const t = 0.1 + i * 0.1;
    const T = tanAt(t);
    const out = V(-T.y, T.x, 0).normalize();
    flameFrames.push(frame(spineAt(t).addScaledVector(out, 0.035), out));
    flameFlow.push(T.clone().multiplyScalar(-1));
  }
  glow(
    b.cards(flameFrames, FLAME, { size: [0.09, 0.24], lean: 55, flow: (_f, i) => flameFlow[i], cross: true, vary: 0.2, rng: rand, bend: 25 }),
    1.2,
  );

  // ------------------------------------------------------------------------------------------------------------
  // Soul ribbon spiralling up the snath with orbiting wisps.
  const sp = spiral(V(PX, 0.5, 0), V(PX + 0.17, 0.5, 0), [0, 1, 0], { turns: 3.4, r1: 0.17, pitch: 0.36 });
  glow(b.sweep(sp, [0.008, 0.004], TEAL, { sides: 4 }), 1.2);
  for (const t of [0.1, 0.3, 0.5, 0.7, 0.9]) {
    const p = sp.at(t);
    const T = sp.tangentAt(t);
    const out = V(p.x - PX, 0, p.z).normalize();
    const side = out.clone().cross(Yup).normalize();
    glow(b.part(new THREE.SphereGeometry(0.034, 7, 5), TEAL_HOT, { at: p, flat: true }), 1.4);
    glow(b.spike(p, T.clone().multiplyScalar(-1), 0.13, 0.026, TEAL, { sides: 6 }), 1.3);
    for (const sd of [1, -1])
      b.part(new THREE.SphereGeometry(0.0065, 4, 3), SOCKET, {
        at: p.clone().addScaledVector(out, 0.029).addScaledVector(side, sd * 0.012).add(V(0, 0.005, 0)),
        flat: true,
      });
  }

  // ------------------------------------------------------------------------------------------------------------
  // Trophy: a dragon skull, rib nest, crystals and bone litter on the dais.
  skull({ at: V(0.42, D + 0.2, -0.02), s: 1.15, yaw: -35, jaw: 10, flames: true });
  for (let k = 0; k < 3; k++) {
    const x0 = 0.8 + 0.1 * k;
    const h = 0.62 - 0.08 * k;
    b.sweep(
      catmull([V(x0, D - 0.01, -0.3 + 0.05 * k), V(x0 - 0.04, D + h * 0.5, -0.3 + 0.05 * k), V(x0 - 0.2, D + h * 0.95, -0.28 + 0.05 * k), V(x0 - 0.4, D + h, -0.25 + 0.05 * k)]),
      [0.034, 0.008],
      BONE,
      { sides: 6, caps: "point" },
    );
  }
  for (const [x, z, h] of [
    [-0.05, 0.28, 0.2],
    [0.1, 0.36, 0.14],
    [-0.15, -0.3, 0.16],
  ] as const) {
    const a = rand() * 3;
    gem(V(x, D + h * 0.5, z), 0.05).scale.set(0.6, 1.5 * (h / 0.2), 0.6);
    gem(V(x + 0.07 * Math.cos(a), D + h * 0.3, z + 0.07 * Math.sin(a)), 0.035).scale.set(0.7, 1.2, 0.7);
  }
  // loose vertebrae and a rib bone in front
  for (const [x, z, r] of [
    [0.1, 0.4, 20],
    [-0.8, 0.33, 70],
    [0.9, 0.3, 120],
  ] as const) {
    b.part(new THREE.CylinderGeometry(0.035, 0.044, 0.05, 7), BONE, { at: [x, D + 0.032, z], rotation: [88, r, 0], flat: true });
    b.spike(V(x, D + 0.04, z), V(x - 0.07 * Math.cos(r * DEG), D + 0.08, z + 0.07 * Math.sin(r * DEG)), null, 0.012, BONE_AGED, { sides: 5 });
  }
  b.sweep(catmull([V(-0.9, D, 0.12), V(-0.95, D + 0.12, 0.14), V(-0.85, D + 0.2, 0.2), V(-0.7, D + 0.18, 0.28)]), [0.022, 0.006], BONE_AGED, { sides: 6, caps: "point" });

  return b.root;
}
