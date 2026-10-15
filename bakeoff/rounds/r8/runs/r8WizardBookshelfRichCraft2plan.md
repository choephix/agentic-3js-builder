```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, frame, rng, catmull, polyline, grain, mottle, patches, mix, noise, paint, smoothstep, svg } from "agentic-3js-builder";
import type { ColorInput, Paint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A crooked-gabled oak bookshelf crammed with jewel-toned tomes, scrolls in a brass urn, glowing orbs, melted candles, a skull, crystals, a hanging lantern and a floating rune-ringed spellbook, standing on a mossy stone plinth and arcane rug.",
};

type V3t = [number, number, number];

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "wizard_bookshelf" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const rand = rng(5);
  const Z = new THREE.Vector3(0, 0, 1);

  // ---------------------------------------------------------------- constants
  const Y0 = 0.0705; // shelf standing height (on the rug)
  const ZC = 0.04; // visual centre of shelf depth
  const ZF = 0.185; // book spine front
  const T = Y0 + 1.85; // carcass top
  const CT = T + 0.08; // cornice top
  const B0 = Y0 + 0.16;
  const B1 = Y0 + 0.64;
  const B2 = Y0 + 1.06;
  const B3 = Y0 + 1.46;

  // flat colours
  const CREAM = "#f1e3c0";
  const WAX = "#f6ecd4";
  const WOODK = "#5b3a22";
  const RIBBON = "#b3262e";
  const SEAL = "#8c1620";
  const BONE = "#eadfc8";
  const SOCKET = "#1b1020";
  const WICK = "#2a2020";
  const CORK = "#c49a62";
  const SLATE = "#4b4a63";

  // ---------------------------------------------------------------- paints
  const oakA = grain("#8a5530", "#63381c", { size: 0.025, axis: "y", seed: 3 });
  const oakX = grain("#8a5530", "#63381c", { size: 0.025, axis: "x", seed: 4 });
  const oakD = grain("#5a3520", "#3a2012", { size: 0.025, axis: "y", seed: 6 });
  const wood = (base: Paint): Paint =>
    paint((p, n) => {
      const c = base.at(p, n);
      const warm = mix(c, "#ffd9a0", 0.16 * smoothstep(0.4, 1, n.y));
      return mix(warm, "#24120a", 0.38 * smoothstep(0.35, 0.05, p.y));
    });
  const OAK = wood(oakA);
  const OAK_X = wood(oakX);
  const OAK_D = wood(oakD);

  const stoneBase = patches("#454256", ["#6b6880", "#7a7790", "#625f76"], { size: 0.14, gap: 0.05, seed: 2 });
  const STONE = paint((p, n) => {
    const c = stoneBase.at(p, n);
    const moss = 0.6 * smoothstep(0.6, 0.95, n.y) * smoothstep(0.45, 0.7, noise(p, 0.08, 5));
    return mix(c, "#4f7a3a", moss);
  });
  const RUGBASE = mottle("#5e1c34", "#7a2a44", { size: 0.1, seed: 4 });
  const BRASS = metal("brass", { tarnish: 0.45, verdigris: 0.15, seed: 2 });
  const GILT = metal("gilt");
  const IRON = metal("iron");

  const leather = (hex: string, seed: number): Paint => {
    const base = mix(hex, hex, 0);
    const dark = mix(hex, "#150c18", 0.5);
    const light = mix(hex, "#ffffff", 0.2);
    return paint((p, n) => {
      const t = smoothstep(-0.6, 0.8, n.y);
      const wear = noise(p, 0.03, seed);
      const c = mix(dark, base, 0.15 + 0.85 * t);
      return mix(c, light, 0.35 * smoothstep(0.55, 0.9, wear) * t);
    });
  };
  const COVERS = [
    leather("#8a1f3a", 1), leather("#1f5a3c", 2), leather("#26307a", 3), leather("#5a2a7a", 4),
    leather("#1c6a74", 5), leather("#b0762a", 6), leather("#a2402a", 7), leather("#3b3f55", 8),
  ];
  const PARCH = mottle("#e9d9ac", "#cdb47a", { size: 0.05, seed: 3 });

  // ---------------------------------------------------------------- textures
  const starPts = (cx: number, cy: number, ro: number, ri: number, n = 5): [number, number][] =>
    Array.from({ length: n * 2 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / n;
      const rr = i % 2 ? ri : ro;
      return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr] as [number, number];
    });
  const poly = (pts: [number, number][]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const tri = (cx: number, cy: number, rr: number, rot: number) =>
    poly([0, 1, 2].map((i) => [cx + Math.cos(rot + (i * Math.PI * 2) / 3) * rr, cy + Math.sin(rot + (i * Math.PI * 2) / 3) * rr] as [number, number]));

  const bands = (c: string) =>
    `<rect x="0" y="6" width="30" height="4" fill="${c}"/><rect x="0" y="12" width="30" height="2" fill="${c}"/><rect x="0" y="90" width="30" height="4" fill="${c}"/><rect x="0" y="85" width="30" height="2" fill="${c}"/>`;
  const SPINE_A = svg(
    `<svg viewBox="0 0 30 100" xmlns="http://www.w3.org/2000/svg">${bands("#e8b84a")}<g fill="none" stroke="#f6d77a" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 32 L15 25 L22 32 L22 46 L15 53 L8 46 Z"/><path d="M15 25 V53 M8 39 H22"/><path d="M9 68 Q15 60 21 68 Q15 78 9 68 Z"/></g></svg>`,
    { size: 128 },
  );
  const SPINE_B = svg(
    `<svg viewBox="0 0 30 100" xmlns="http://www.w3.org/2000/svg">${bands("#dfe6ff")}<path d="M21 26 A10 10 0 1 0 21 48 A7.5 7.5 0 1 1 21 26 Z" fill="#f6e7a0"/><path d="M15 58 l2.4 5 5 2.4 -5 2.4 -2.4 5 -2.4 -5 -5 -2.4 5 -2.4z" fill="#f6e7a0"/><circle cx="8" cy="76" r="2.4" fill="#f6e7a0"/><circle cx="23" cy="56" r="2.2" fill="#f6e7a0"/></svg>`,
    { size: 128 },
  );
  const SPINE_C = svg(
    `<svg viewBox="0 0 30 100" xmlns="http://www.w3.org/2000/svg">${bands("#cfd6e8")}<path d="M15 24 L24 44 L15 64 L6 44 Z" fill="none" stroke="#cfd6e8" stroke-width="3"/><circle cx="15" cy="44" r="4" fill="#cfd6e8"/><rect x="6" y="72" width="18" height="3" fill="#cfd6e8"/></svg>`,
    { size: 128 },
  );
  const SPINE_D = svg(
    `<svg viewBox="0 0 30 100" xmlns="http://www.w3.org/2000/svg">${bands("#ffb070")}<g fill="none" stroke="#ff9a5a" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 24 V50 M10 30 L21 24 M10 40 L21 34"/><path d="M20 62 L10 72 L20 82 M10 72 H22"/></g></svg>`,
    { size: 128 },
  );
  const SPINES = [SPINE_A, SPINE_B, SPINE_C, SPINE_D];

  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const pp = (rr: number, da: number) => `${(50 + Math.cos(a + da) * rr).toFixed(1)},${(50 + Math.sin(a + da) * rr).toFixed(1)}`;
    return `<polygon points="${pp(28, -0.17)} ${pp(47, 0)} ${pp(28, 0.17)}" fill="#f2b43a" stroke="#3a1208" stroke-width="3" stroke-linejoin="round"/>`;
  }).join("");
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${rays}<circle cx="50" cy="50" r="27" fill="#f6d77a" stroke="#3a1208" stroke-width="3"/><polygon points="${poly(starPts(50, 50, 21, 8.5))}" fill="#b3262e" stroke="#3a1208" stroke-width="2.6" stroke-linejoin="round"/><circle cx="50" cy="50" r="4" fill="#f6d77a"/></svg>`,
    { size: 256 },
  );
  const EYE = svg(
    `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="50" r="46" fill="none" stroke="#f6c84a" stroke-width="4"/><polygon points="${tri(60, 50, 44, -Math.PI / 2)}" fill="none" stroke="#f6c84a" stroke-width="3.4" stroke-linejoin="round"/><polygon points="${tri(60, 50, 44, Math.PI / 2)}" fill="none" stroke="#f6c84a" stroke-width="3.4" stroke-linejoin="round"/><path d="M22 50 Q60 16 98 50 Q60 84 22 50 Z" fill="#0b2a3a" stroke="#ffe08a" stroke-width="3.4" stroke-linejoin="round"/><circle cx="60" cy="50" r="15" fill="#4ff0ff"/><circle cx="60" cy="50" r="7" fill="#062030"/><circle cx="55" cy="45" r="3.4" fill="#ffffff"/></svg>`,
    { size: 256 },
  );
  const sr = rng(99);
  const stars = Array.from({ length: 46 }, () => `<circle cx="${(4 + sr() * 108).toFixed(1)}" cy="${(4 + sr() * 170).toFixed(1)}" r="${(0.6 + sr() * 1.3).toFixed(1)}" fill="#f6e7a0"/>`).join("");
  const MURAL = svg(
    `<svg viewBox="0 0 116 178" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1642"/><stop offset="1" stop-color="#2d1a4a"/></linearGradient></defs><rect width="116" height="178" fill="url(#m)"/>${stars}<path d="M78 24 A20 20 0 1 0 78 64 A15 15 0 1 1 78 24 Z" fill="#f6e7a0" opacity="0.9"/><polyline points="20,110 38,96 56,116 76,100 96,124" fill="none" stroke="#e8b84a" stroke-width="1.2"/><g fill="#ffe08a"><circle cx="20" cy="110" r="2.6"/><circle cx="38" cy="96" r="2.6"/><circle cx="56" cy="116" r="2.6"/><circle cx="76" cy="100" r="2.6"/><circle cx="96" cy="124" r="2.6"/></g></svg>`,
    { size: 512 },
  );
  const dashes = [10, 18, 26, 34, 42, 50, 58]
    .map((x, i) => `<path d="M${x} 10 V118" stroke="#5b3d22" stroke-width="2.6" stroke-dasharray="${["7 3 3 3 10 3", "4 3 9 3 5 3", "11 3 4 3 4 3"][i % 3]}" fill="none"/>`)
    .join("");
  const SCRIPT = svg(
    `<svg viewBox="0 0 68 128" xmlns="http://www.w3.org/2000/svg"><rect width="68" height="128" fill="#eadbb0"/><rect width="68" height="6" fill="#c9ab6c"/><rect y="122" width="68" height="6" fill="#c9ab6c"/>${dashes}</svg>`,
    { size: 256 },
  );
  const FLAME = svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg"><path d="M20 2 C28 22 36 38 34 54 C33 70 26 78 20 78 C14 78 7 70 6 54 C4 38 14 24 20 2 Z" fill="#ff8a1f"/><path d="M20 20 C26 34 30 44 28 56 C27 66 23 72 20 72 C17 72 13 66 12 56 C10 44 15 34 20 20 Z" fill="#ffd23c"/><path d="M20 46 C24 54 25 60 23 66 C22 69 21 70 20 70 C19 70 18 69 17 66 C15 60 16 54 20 46 Z" fill="#fff6c8"/></svg>`,
    { size: 128 },
  );
  const wave = (y: number, amp: number, ph: number) => {
    let d = `M0 ${y}`;
    for (let x = 0; x <= 120; x += 4) d += ` L${x} ${(y + amp * Math.sin((x / 120) * Math.PI * 6 + ph)).toFixed(1)}`;
    return d;
  };
  const ORBTEX = svg(
    `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#8c8c8c"/></linearGradient></defs><rect width="120" height="60" fill="url(#g)"/><path d="${wave(20, 4, 0)}" fill="none" stroke="#ffffff" stroke-width="3"/><path d="${wave(34, 5, 2)}" fill="none" stroke="#bdbdbd" stroke-width="3"/><path d="${wave(46, 3, 4)}" fill="none" stroke="#ffffff" stroke-width="2.4"/><circle cx="15" cy="12" r="1.6" fill="#fff"/><circle cx="52" cy="28" r="1.8" fill="#fff"/><circle cx="88" cy="16" r="1.6" fill="#fff"/><circle cx="104" cy="40" r="1.8" fill="#fff"/><circle cx="30" cy="42" r="1.4" fill="#fff"/></svg>`,
    { size: 256 },
  );
  const HIGHLIGHT = svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg"><ellipse cx="30" cy="16" rx="22" ry="10" fill="#ffffff" transform="rotate(-20 30 16)"/><circle cx="54" cy="31" r="4.5" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  const GLYPH = svg(
    `<svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#7ff3ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8 V44 M12 16 L28 6 M12 30 L28 20"/><circle cx="29" cy="38" r="3.2"/></g></svg>`,
    { size: 128 },
  );
  const COBWEB = svg(
    `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#d9dcea" stroke-width="1.6" stroke-linecap="round"><path d="M1 1 L78 4 M1 1 L72 30 M1 1 L52 56 M1 1 L26 76 M1 1 L4 78"/><path d="M20 2 Q18 18 2 20 M38 3 Q34 34 3 38 M56 4 Q50 50 3 56 M70 4 Q64 62 3 70"/></g></svg>`,
    { size: 192 },
  );
  const RUG = svg(
    `<svg viewBox="0 0 300 110" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="110" fill="#5e1c34"/><rect x="5" y="5" width="290" height="100" fill="none" stroke="#e8b84a" stroke-width="2.6"/><rect x="11" y="11" width="278" height="88" fill="none" stroke="#e8b84a" stroke-width="2.6" stroke-dasharray="8 5"/><circle cx="150" cy="55" r="38" fill="none" stroke="#f6d77a" stroke-width="2.6"/><circle cx="150" cy="55" r="29" fill="none" stroke="#f6d77a" stroke-width="2.6"/><polygon points="${tri(150, 55, 29, -Math.PI / 2)}" fill="none" stroke="#f6d77a" stroke-width="2.6"/><polygon points="${tri(150, 55, 29, Math.PI / 2)}" fill="none" stroke="#f6d77a" stroke-width="2.6"/><g fill="#e8b84a">${[30, 62, 238, 270].map((x) => `<polygon points="${x},55 ${x + 11},40 ${x + 22},55 ${x + 11},70"/>`).join("")}</g></svg>`,
    { size: 512 },
  );

  // ---------------------------------------------------------------- helpers
  const part = (geo: THREE.BufferGeometry, color: ColorInput, o: any = {}) => b.part(geo, color, { bone: root, ...o });
  const box = (w: number, h: number, d: number, color: ColorInput, x: number, y: number, z: number, o: any = {}) =>
    part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], ...o });
  const decal = (tex: any, w: number, h: number, pos: V3t, dir: V3t, o: any = {}) =>
    part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: pos, dir, axis: "z", texture: tex, ...o });
  const lathe = (pts: [number, number][], at: V3t, color: ColorInput, segments = 10, o: any = {}) =>
    b.lathe(pts, { at, color, segments, bone: root, ...o });
  const ext = (pts: any[], at: V3t, thickness: number, color: ColorInput, o: any = {}) =>
    b.extrude(pts, { at, x: [1, 0, 0], y: [0, 1, 0], thickness, color, bone: root, ...o });
  const mergeAt = (items: { g: THREE.BufferGeometry; p: V3t; r?: V3t }[]) =>
    mergeGeometries(
      items.map(({ g, p, r }) => {
        const c = g.clone();
        if (r) c.rotateX(r[0]).rotateY(r[1]).rotateZ(r[2]);
        return c.translate(p[0], p[1], p[2]);
      }),
    )!;
  const plank = (x1: number, y1: number, x2: number, y2: number, w: number, th: number, z: number, color: ColorInput) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const L = Math.hypot(dx, dy);
    const nx = ((-dy / L) * w) / 2;
    const ny = ((dx / L) * w) / 2;
    return ext([[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]], [0, 0, z], th, color);
  };

  // ---------------------------------------------------------------- base
  box(1.74, 0.035, 0.68, STONE, 0, 0.0175, 0.07);
  box(1.7, 0.025, 0.64, STONE, 0, 0.0475, 0.07);
  box(1.5, 0.008, 0.55, RUGBASE, 0, 0.064, 0.1);
  decal(RUG, 1.5, 0.55, [0, 0.0705 - 0.0, 0.1], [0, 1, 0], { up: [0, 0, -1] });

  // ---------------------------------------------------------------- carcass
  for (const s of [1, -1]) {
    box(0.07, 1.85, 0.42, OAK, s * 0.615, Y0 + 0.925, 0);
    box(0.09, 0.12, 0.46, OAK_D, s * 0.615, Y0 + 0.06 - 0.004, 0);
    box(0.012, 1.7, 0.006, GILT, s * 0.615, Y0 + 0.95, 0.211);
    decal(EMBLEM, 0.2, 0.2, [s * 0.6535, Y0 + 1.0, 0], [s, 0, 0]);
  }
  part(new THREE.BoxGeometry(1.16, 1.8, 0.03), "#ffffff", { at: [0, Y0 + 0.925, -0.195], texture: MURAL });
  for (const y of [0.14, 0.62, 1.04, 1.44, 1.82]) {
    box(1.16, 0.04, 0.395, OAK_X, 0, Y0 + y, 0.0175);
    box(1.16, 0.01, 0.01, GILT, 0, Y0 + y + 0.018, 0.21);
  }
  box(1.16, 0.12, 0.03, OAK_D, 0, Y0 + 0.075, 0.2);

  // cupboard doors on hinge joints
  for (const s of [1, -1]) {
    const hinge = b.joint(s > 0 ? "doorL" : "doorR", { parent: root, at: [s * 0.58, Y0 + 0.38, 0.2], dir: [0, 1, 0], role: "hinge" });
    const cx = s * 0.2925;
    const dz = 0.205;
    const dy = Y0 + 0.38;
    box(0.575, 0.42, 0.03, OAK, cx, dy, dz, { bone: hinge });
    box(0.43, 0.3, 0.012, OAK_D, cx, dy, dz + 0.02, { bone: hinge });
    decal(EMBLEM, 0.2, 0.2, [cx, dy, dz + 0.0285], [0, 0, 1], { bone: hinge });
    part(new THREE.SphereGeometry(0.02, 8, 6), BRASS, { bone: hinge, at: [s * 0.035, dy, dz + 0.03] });
    for (const o of [0.14, -0.14]) box(0.12, 0.026, 0.008, BRASS, s * 0.52, dy + o, dz + 0.019, { bone: hinge });
  }

  // cornice
  box(1.4, 0.035, 0.48, OAK_D, 0, T + 0.0175, 0);
  box(1.46, 0.025, 0.52, OAK, 0, T + 0.0475, 0);
  box(1.38, 0.02, 0.46, OAK_D, 0, T + 0.07, 0);
  box(1.4, 0.006, 0.006, GILT, 0, T + 0.037, 0.243);
  const dentils: { g: THREE.BufferGeometry; p: V3t }[] = [];
  for (let x = -0.66; x <= 0.671; x += 0.06) dentils.push({ g: new THREE.BoxGeometry(0.03, 0.02, 0.016), p: [x, T + 0.012, 0.248] });
  part(mergeAt(dentils), BRASS, { at: [0, 0, 0] });

  // gable
  ext([[-0.7, 0], [0.7, 0], [0, 0.25]], [0, CT, 0.12], 0.1, OAK_D, { bevel: 0.006 });
  plank(-0.74, CT + 0.007, 0, CT + 0.271, 0.055, 0.05, 0.18, OAK);
  plank(0.74, CT + 0.007, 0, CT + 0.271, 0.055, 0.05, 0.181, OAK);
  const studs: { g: THREE.BufferGeometry; p: V3t }[] = [];
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      const u = 0.18 + i * 0.2;
      studs.push({ g: new THREE.SphereGeometry(0.011, 6, 4), p: [s * (0.74 - 0.74 * u), CT + 0.007 + 0.264 * u + 0.01, 0.208] });
    }
  part(mergeAt(studs), BRASS, { at: [0, 0, 0] });
  glow(decal(EYE, 0.22, 0.183, [0, CT + 0.1, 0.1725], [0, 0, 1]), 0.9);

  // moon finial
  const R = 0.075;
  const crescent = (): [number, number][] => {
    const pts: [number, number][] = [];
    const a0 = (49.5 * Math.PI) / 180;
    for (let i = 0; i <= 9; i++) {
      const a = a0 + ((2 * Math.PI - 2 * a0) * i) / 9;
      pts.push([Math.cos(a) * R, Math.sin(a) * R]);
    }
    const rI = 0.8 * R;
    const cI = 0.4 * R;
    const from = (288.2 * Math.PI) / 180;
    const to = (71.8 * Math.PI) / 180;
    for (let i = 1; i < 7; i++) {
      const a = from - ((from - to) * i) / 7;
      pts.push([cI + Math.cos(a) * rI, Math.sin(a) * rI]);
    }
    return pts.map(([x, y]) => [-y, x] as [number, number]);
  };
  const moonY = CT + 0.268 + R * 0.85;
  ext(crescent(), [0, moonY, 0.18], 0.035, GILT, { bevel: 0.004 });
  glow(ext(starPts(0, 0, 0.026, 0.011), [0, moonY + R * 0.4, 0.18], 0.02, "#fff1a8"), 1.4);
  box(0.03, 0.03, 0.03, OAK_D, 0, CT + 0.268, 0.18);

  // corbels in the top corners
  for (const s of [1, -1])
    ext([[0, 0], [0.11, 0], [0.09, -0.02], [0.055, -0.045], [0.03, -0.08], [0, -0.12]], [s * 0.58, Y0 + 1.8, 0.2], 0.02, GILT, { x: [-s, 0, 0] });

  // ---------------------------------------------------------------- book logic
  function book(cx: number, base: number, o: { t: number; h: number; d: number; zf: number; a?: number }) {
    const a = ((o.a ?? 0) * Math.PI) / 180;
    const hy = Math.abs((o.t / 2) * Math.sin(a)) + Math.abs((o.h / 2) * Math.cos(a));
    const c = new THREE.Vector3(cx, base + hy, o.zf - o.d / 2);
    const q = new THREE.Quaternion().setFromAxisAngle(Z, a);
    const loc = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(q).add(c);
    part(new THREE.BoxGeometry(o.t, o.h, o.d), COVERS[Math.floor(rand() * COVERS.length)], { at: c, quat: q });
    if (rand() < 0.8)
      part(new THREE.BoxGeometry(o.t - 0.014, o.h + 0.008, o.d - 0.03), CREAM, { at: loc(0, 0.003, -0.012), quat: q });
    part(new THREE.PlaneGeometry(o.t * 0.94, o.h * 0.9), "#ffffff", {
      at: loc(0, 0, o.d / 2 + 0.0025),
      quat: q,
      texture: SPINES[Math.floor(rand() * SPINES.length)],
    });
    if (rand() < 0.3)
      part(new THREE.BoxGeometry(o.t + 0.006, 0.016, 0.006), BRASS, { at: loc(0, -o.h * 0.25, o.d / 2 + 0.005), quat: q });
  }

  function bookRow(x0: number, x1: number, base: number, bayH: number, leanEnd = true) {
    let x = x0;
    for (;;) {
      const t = 0.04 + rand() * 0.05;
      if (x + t > x1 - (leanEnd ? 0.13 : 0)) break;
      const h = Math.min(bayH - 0.025, 0.2 + rand() * 0.14);
      book(x + t / 2, base, { t, h, d: 0.25 + rand() * 0.05, zf: ZF - rand() * 0.015 });
      x += t + 0.002;
    }
    const R2 = x1 - x;
    if (leanEnd && R2 >= 0.075) {
      const t = 0.055;
      const h = Math.min(bayH - 0.04, 0.27);
      const sa = Math.min(0.35, Math.max(0.06, (R2 - t - 0.006) / h));
      const a = Math.asin(sa);
      const cx = x + 0.002 + (t / 2) * Math.cos(a) + (h / 2) * Math.sin(a);
      book(cx, base, { t, h, d: 0.26, zf: ZF, a: (a * 180) / Math.PI });
    }
  }

  function flatStack(cx: number, base: number, zc: number, n: number, lenMax: number) {
    let y = base;
    for (let i = 0; i < n; i++) {
      const len = lenMax - 0.05 * rand();
      const t = 0.035 + rand() * 0.03;
      const d = 0.16 + rand() * 0.03;
      book(cx + (rand() - 0.5) * 0.03, y, { t, h: len, d, zf: zc + d / 2, a: 90 + (rand() - 0.5) * 4 });
      y += t + 0.004;
    }
    return y;
  }

  // ---------------------------------------------------------------- props
  const flames: THREE.Vector3[] = [];
  function candle(x: number, base: number, z: number, h: number, rad: number) {
    part(new THREE.CylinderGeometry(rad * 0.9, rad, h, 8), WAX, { at: [x, base + h / 2, z] });
    for (let k = 0; k < 2; k++) {
      const a = rand() * 6.28;
      const dl = h * (0.25 + rand() * 0.25);
      part(new THREE.CapsuleGeometry(rad * 0.22, dl, 3, 5), WAX, {
        at: [x + Math.cos(a) * rad * 0.98, base + h - dl / 2 - rad * 0.3, z + Math.sin(a) * rad * 0.98],
      });
    }
    part(new THREE.SphereGeometry(rad * 1.5, 7, 4), WAX, { at: [x, base + 0.003, z], scale: [1, 0.35, 1] });
    part(new THREE.CylinderGeometry(0.0016, 0.0016, 0.016, 4), WICK, { at: [x, base + h + 0.006, z] });
    flames.push(new THREE.Vector3(x, base + h + 0.012, z));
  }
  const dish = (x: number, y: number, z: number, s = 1) =>
    lathe([[0, 0], [0.035 * s, 0], [0.047 * s, 0.009 * s], [0.043 * s, 0.014 * s], [0, 0.012 * s]], [x, y, z], BRASS, 10);

  function scroll(x: number, y: number, z: number, dir: V3t, len: number, rad: number, seal = false) {
    const d = new THREE.Vector3(...dir).normalize();
    const at = new THREE.Vector3(x, y, z);
    part(new THREE.CylinderGeometry(rad, rad, len, 8), "#ffffff", { at, dir: d, texture: SCRIPT });
    part(new THREE.CylinderGeometry(rad * 0.4, rad * 0.4, len + 0.035, 6), WOODK, { at, dir: d });
    const bp = at.clone().addScaledVector(d, len * 0.22);
    part(new THREE.CylinderGeometry(rad * 1.1, rad * 1.1, 0.02, 8), RIBBON, { at: bp, dir: d });
    if (seal) part(new THREE.SphereGeometry(rad * 0.55, 6, 4), SEAL, { at: [bp.x, bp.y + rad * 0.2, bp.z + rad * 1.05], scale: [1, 1, 0.5] });
  }

  function urn(x: number, base: number, z: number) {
    lathe([[0, 0], [0.04, 0], [0.055, 0.02], [0.058, 0.07], [0.048, 0.11], [0.062, 0.14], [0, 0.14]], [x, base, z], BRASS, 10);
    box(0.012, 0.012, 0.012, GILT, x + 0.056, base + 0.07, z);
    const tilts: [number, number][] = [[0.1, 0.05], [-0.12, 0], [0, -0.14], [0.05, 0.12]];
    tilts.forEach(([tx, tz], i) => {
      const len = 0.2 + 0.025 * i;
      const d = new THREE.Vector3(tx, 1, tz).normalize();
      const st = new THREE.Vector3(x + tx * 0.2, base + 0.12, z + tz * 0.2).addScaledVector(d, len / 2);
      scroll(st.x, st.y, st.z, [d.x, d.y, d.z], len, 0.016, i === 1);
    });
  }

  function orb(x: number, base: number, z: number, rad: number, tint: string, ringTint: string) {
    const s = rad / 0.11;
    lathe([[0, 0], [0.06 * s, 0], [0.066 * s, 0.012 * s], [0.04 * s, 0.024 * s], [0.03 * s, 0.04 * s], [0.05 * s, 0.056 * s], [0, 0.056 * s]], [x, base, z], BRASS, 10);
    const cy = base + 0.056 * s + rad * 0.82;
    glow(part(new THREE.SphereGeometry(rad, 12, 9), tint, { at: [x, cy, z], texture: ORBTEX, rotation: [0, rand() * 360, 0] }), 0.8);
    for (let k = 0; k < 3; k++) {
      const a = Math.PI / 2 + k * 2.094;
      const pt = (rr: number, yy: number): V3t => [x + Math.cos(a) * rr, yy, z + Math.sin(a) * rr];
      b.sweep(
        catmull([pt(0.05 * s, base + 0.05 * s), pt(rad * 1.08, cy - rad * 0.45), pt(rad * 1.07, cy + rad * 0.2), pt(rad * 0.82, cy + rad * 0.62)]),
        0.0055 * s,
        { color: BRASS, bone: root, sides: 5 },
      );
    }
    const hd = new THREE.Vector3(0.35, 0.45, 0.82).normalize();
    glow(
      part(new THREE.PlaneGeometry(rad * 0.55, rad * 0.35), "#ffffff", {
        at: [x + hd.x * rad * 1.015, cy + hd.y * rad * 1.015, z + hd.z * rad * 1.015],
        dir: hd,
        axis: "z",
        texture: HIGHLIGHT,
      }),
      1,
    );
    glow(part(new THREE.TorusGeometry(rad * 1.5, 0.0035, 4, 28), ringTint, { at: [x, cy, z], rotation: [72, 0, 12] }), 1);
    return cy;
  }

  function crystals(x: number, base: number, z: number, color: string, sc: number) {
    part(new THREE.DodecahedronGeometry(0.055 * sc, 0), SLATE, { at: [x, base + 0.012, z], scale: [1.3, 0.5, 1.1], flat: true });
    const specs: [number, number, number, number, number, number][] = [
      [0, 0, 0.2, 0.02, 0, 0],
      [0.035, 0.01, 0.14, 0.015, 8, -22],
      [-0.035, -0.005, 0.15, 0.016, -6, 24],
      [0.01, -0.03, 0.1, 0.013, -26, 6],
      [-0.01, 0.032, 0.11, 0.013, 24, -8],
    ];
    for (const [dx, dz, h0, r0, tx, tz] of specs) {
      const h = h0 * sc;
      const r0s = r0 * sc;
      const g = mergeGeometries([
        new THREE.CylinderGeometry(r0s, r0s, h * 0.65, 6, 1).translate(0, h * 0.325, 0),
        new THREE.ConeGeometry(r0s, h * 0.35, 6, 1).translate(0, h * 0.65 + h * 0.175, 0),
      ])!;
      glow(part(g, color, { at: [x + dx * sc, base + 0.012, z + dz * sc], rotation: [tx, 0, tz], flat: true }), 0.9);
    }
  }

  function skull(x: number, base: number, z: number) {
    part(new THREE.SphereGeometry(0.05, 9, 7), BONE, { at: [x, base + 0.055, z], scale: [0.95, 0.85, 1.05], flat: true });
    box(0.05, 0.02, 0.04, BONE, x, base + 0.016, z + 0.012);
    for (const s of [1, -1]) part(new THREE.SphereGeometry(0.012, 6, 4), SOCKET, { at: [x + s * 0.019, base + 0.058, z + 0.042] });
    part(new THREE.ConeGeometry(0.008, 0.016, 3), SOCKET, { at: [x, base + 0.04, z + 0.05], rotation: [180, 0, 0] });
    box(0.042, 0.006, 0.004, SOCKET, x, base + 0.019, z + 0.033);
  }

  // ---------------------------------------------------------------- bay contents
  // bay 1
  bookRow(-0.57, -0.1, B1, 0.38);
  orb(0.12, B1, ZC, 0.095, "#9b6bff", "#d8c0ff");
  urn(0.35, B1, ZC);
  bookRow(0.47, 0.575, B1, 0.38, false);

  // bay 2
  const stackTop = flatStack(-0.42, B2, ZC, 3, 0.26);
  dish(-0.42, stackTop, ZC);
  candle(-0.46, stackTop + 0.012, ZC + 0.01, 0.13, 0.016);
  candle(-0.385, stackTop + 0.012, ZC - 0.012, 0.09, 0.014);
  candle(-0.425, stackTop + 0.012, ZC - 0.035, 0.065, 0.013);
  bookRow(-0.25, 0.17, B2, 0.36);
  const skTop = flatStack(0.33, B2, ZC, 2, 0.22);
  skull(0.33, skTop, ZC + 0.01);
  candle(0.33, skTop + 0.092, ZC + 0.01, 0.07, 0.013);
  orb(0.535, B2, ZC, 0.075, "#ffb040", "#ffe0a0");

  // bay 3
  crystals(-0.46, B3, ZC, "#3ff0d8", 1);
  bookRow(-0.33, 0.0, B3, 0.34);
  scroll(0.1, B3 + 0.02, ZC - 0.022, [1, 0, 0], 0.14, 0.02);
  scroll(0.1, B3 + 0.02, ZC + 0.022, [1, 0, 0], 0.13, 0.02, true);
  scroll(0.1, B3 + 0.058, ZC, [1, 0, 0], 0.14, 0.02);
  const bigCy = orb(0.32, B3, ZC, 0.12, "#6fa8ff", "#c8e0ff");
  crystals(0.53, B3, ZC, "#a56bff", 0.9);
  decal(COBWEB, 0.16, 0.16, [-0.5, Y0 + 1.72, 0.17], [0, 0, 1]);

  // motes around the big orb and the tome
  const motes = mergeAt(
    ([[0.18, bigCy + 0.18, 0.08], [0.46, bigCy + 0.15, 0.0], [0.4, bigCy - 0.02, 0.15], [-0.3, 2.02, 0.2], [-0.72, 2.28, 0.06], [-0.3, 2.45, 0.1]] as V3t[]).map((p) => ({
      g: new THREE.OctahedronGeometry(0.011, 0),
      p,
    })),
  );
  glow(part(motes, "#ffe58a", { at: [0, 0, 0], flat: true }), 1.5);

  // ---------------------------------------------------------------- floating tome + rune ring
  const tomeC = new THREE.Vector3(-0.5, 2.32, 0.12);
  const tomeQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, 0.35, 0.08));
  const tp = (lx: number, ly: number, lz: number) => new THREE.Vector3(lx, ly, lz).applyQuaternion(tomeQ).add(tomeC);
  const tq = (rz: number) => tomeQ.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, rz)));
  const laid = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
  for (const s of [1, -1]) {
    part(new THREE.BoxGeometry(0.16, 0.012, 0.23), COVERS[0], { at: tp(s * 0.085, -0.02, 0), quat: tq(s * 0.1) });
    part(new THREE.BoxGeometry(0.15, 0.026, 0.21), CREAM, { at: tp(s * 0.08, -0.005, 0), quat: tq(s * 0.1) });
    glow(
      part(new THREE.PlaneGeometry(0.12, 0.17), "#ffffff", { at: tp(s * 0.08, 0.0095, 0), quat: tq(s * 0.1).multiply(laid), texture: SCRIPT }),
      0.9,
    );
  }
  part(new THREE.BoxGeometry(0.03, 0.04, 0.23), COVERS[0], { at: tp(0, -0.025, 0), quat: tomeQ });
  part(new THREE.BoxGeometry(0.012, 0.006, 0.1), GILT, { at: tp(0, 0.0, 0.16), quat: tomeQ });
  const ringC: V3t = [tomeC.x, 2.19, tomeC.z];
  glow(part(new THREE.TorusGeometry(0.17, 0.004, 4, 32), "#7ff3ff", { at: ringC, rotation: [90, 0, 0] }), 1.2);
  const runeFrames = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI * 2) / 8;
    return frame([ringC[0] + Math.cos(a) * 0.17, ringC[1], ringC[2] + Math.sin(a) * 0.17], [0, 1, 0]);
  });
  glow(
    b.cards(runeFrames, GLYPH, {
      size: [0.04, 0.05],
      lean: 0,
      sink: 0,
      bone: root,
      flow: (_f: unknown, i: number) => [Math.cos((i * Math.PI * 2) / 8), 0, Math.sin((i * Math.PI * 2) / 8)] as V3t,
    }),
    1.3,
  );

  // ---------------------------------------------------------------- hanging lantern (model-left side)
  const LX = 0.79;
  b.sweep(polyline([[0.65, 1.8, 0], [LX, 1.8, 0], [LX, 1.78, 0]]), 0.01, { color: IRON, bone: root, sides: 6 });
  b.rod([0.655, 1.6, 0], [LX - 0.01, 1.78, 0], 0.008, IRON, { bone: root });
  const links: { g: THREE.BufferGeometry; p: V3t; r?: V3t }[] = [];
  for (let i = 0; i < 6; i++) links.push({ g: new THREE.TorusGeometry(0.011, 0.0028, 4, 8), p: [LX, 1.77 - i * 0.02, 0], r: [0, i % 2 ? Math.PI / 2 : 0, 0] });
  part(mergeAt(links), IRON, { at: [0, 0, 0] });
  lathe([[0, 0], [0.05, 0], [0.045, 0.01], [0.012, 0.04], [0.012, 0.05], [0.02, 0.056], [0, 0.056]], [LX, 1.655, 0], IRON, 6);
  glow(lathe([[0, 0], [0.032, 0], [0.04, 0.01], [0.04, 0.08], [0.032, 0.09], [0, 0.09]], [LX, 1.565, 0], "#ffb23c", 6), 1.4);
  lathe([[0, 0], [0.046, 0], [0.04, 0.012], [0, 0.012]], [LX, 1.553, 0], IRON, 6);

  // ---------------------------------------------------------------- floor props
  box(0.3, 0.01, 0.12, OAK_D, 0.62, Y0 + 0.005, 0.3);
  const bottles: { prof: [number, number][]; x: number; col: string }[] = [
    { prof: [[0, 0], [0.03, 0], [0.045, 0.02], [0.05, 0.045], [0.04, 0.07], [0.015, 0.085], [0.014, 0.115], [0.018, 0.12], [0, 0.12]], x: 0.54, col: "#3ad07a" },
    { prof: [[0, 0], [0.022, 0], [0.025, 0.01], [0.025, 0.1], [0.013, 0.115], [0.012, 0.14], [0.016, 0.145], [0, 0.145]], x: 0.62, col: "#e0457b" },
    { prof: [[0, 0], [0.03, 0], [0.04, 0.015], [0.04, 0.05], [0.015, 0.07], [0.013, 0.09], [0.017, 0.095], [0, 0.095]], x: 0.69, col: "#4a8cff" },
  ];
  for (const bt of bottles) {
    const top = bt.prof[bt.prof.length - 2][1];
    glow(lathe(bt.prof, [bt.x, Y0 + 0.01, 0.3], bt.col, 8), 0.6);
    part(new THREE.CylinderGeometry(0.011, 0.009, 0.018, 6), CORK, { at: [bt.x, Y0 + 0.01 + top + 0.006, 0.3] });
  }
  const fsTop = flatStack(-0.58, Y0, 0.3, 3, 0.24);
  dish(-0.58, fsTop, 0.3);
  candle(-0.58, fsTop + 0.012, 0.3, 0.11, 0.017);

  // flames for every candle at once
  glow(
    b.cards(
      flames.map((p) => frame([p.x, p.y, p.z], [0, 1, 0])),
      FLAME,
      { size: [0.034, 0.062], cross: true, lean: 0, bone: root, vary: 0.1, rng: rng(21) },
    ),
    1.4,
  );

  return b.root;
}
```