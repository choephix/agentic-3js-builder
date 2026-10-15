import * as THREE from "three";
import { createBuilder, frame, rng, paint, mix, noise, grain, stripes, mottle, svg, catmull } from "../../../../src/index";
import type { ColorInput } from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "A cel-shaded, Genshin-style alchemist's workbench: drawers, a hutch with shelves, a teal crest banner, glowing potions, a distilling rig over a sigil mat, a brass balance, books, herbs, an armillary sphere and crystals.",
};

type V3 = [number, number, number];
type Pt = [number, number];
type OP = [number, number] | [number, number, "sharp"];
type O = { texture?: THREE.Texture; scale?: V3; flat?: boolean };
const D = Math.PI / 180;

const qE = (e: V3) => new THREE.Quaternion().setFromEuler(new THREE.Euler(e[0] * D, e[1] * D, e[2] * D, "YXZ"));

class Loc {
  constructor(
    readonly o: THREE.Vector3,
    readonly q: THREE.Quaternion,
  ) {}
  p(l: V3) {
    return new THREE.Vector3(l[0], l[1], l[2]).applyQuaternion(this.q).add(this.o);
  }
  d(l: V3) {
    return new THREE.Vector3(l[0], l[1], l[2]).applyQuaternion(this.q);
  }
  sub(l: V3, e: V3 = [0, 0, 0]) {
    return new Loc(this.p(l), this.q.clone().multiply(qE(e)));
  }
}
const loc = (o: V3, e: V3 = [0, 0, 0]) => new Loc(new THREE.Vector3(o[0], o[1], o[2]), qE(e));

export default function build() {
  const b = createBuilder({ name: "alchemist_workbench", paintSize: 2048 });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(7);
  const WORLD = loc([0, 0, 0]);

  // ------------------------------------------------------------------ palette
  const GOLD = "#f4c64e";
  const PALE = "#d9f1f0";
  const T = 0.9; // table top
  const SA = 1.1675; // shelf A top
  const SB = 1.4675; // shelf B top
  const topBase = grain("#c58c54", "#a87240", { size: 0.03, axis: "x", seed: 3 });
  const P_TOP = cel(
    paint((p, n) => (noise(p, 0.12, 9) > 0.7 && n.y > 0.5 ? mix("#9a6a3a", "#3f6a7a", 0.45) : topBase)),
    "#7f5028",
  );
  const P_WOOD = cel(grain("#ab7642", "#8c5e31", { size: 0.03, axis: "y", seed: 5 }), "#613c1f");
  const P_DARK = cel(grain("#80512e", "#654022", { size: 0.03, axis: "x", seed: 7 }), "#4a2d18");
  const P_GOLD = cel("#f4c64e", "#c07f2a");
  const P_BRASS = cel("#dba54c", "#9a6428");
  const P_CREAM = cel("#f7edd2", "#d8c49a");
  const P_TEAL = cel("#2f93aa", "#1f607f");
  const P_IRON = cel("#5a5d70", "#3a3a55");
  const P_STONE = cel(mottle("#aeb4c6", "#8f96ab", { size: 0.03, seed: 4 }), "#6a7088");
  const P_CLAY = cel("#d0703f", "#9a4640");
  const P_WICKER = cel(stripes("#d4ab62", "#9a7238", { size: 0.016, axis: "y", width: 0.5, wobble: 0.2, seed: 2 }), "#6f5028");

  // ------------------------------------------------------------------ textures
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="none" stroke="#6b4414" stroke-width="5.5"/>
    <circle cx="32" cy="32" r="28" fill="none" stroke="#f6d36a" stroke-width="3"/>
    <path d="M32 6 L38 26 L58 32 L38 38 L32 58 L26 38 L6 32 L26 26Z" fill="#f6d36a" stroke="#6b4414" stroke-width="2.6" stroke-linejoin="round"/>
    <circle cx="32" cy="32" r="6" fill="#2f93aa" stroke="#6b4414" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  const labelTex = (glyph: string, col: string) =>
    svg(
      `<svg viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="37" height="45" rx="5" fill="#f6e9c8" stroke="#6b4422" stroke-width="2.4"/>
      <rect x="5" y="5" width="30" height="38" rx="3" fill="none" stroke="#c99a4a" stroke-width="1.2"/>
      ${glyph.replace(/COL/g, col)}
      <path d="M12 39 H28" stroke="#6b4422" stroke-width="1.8" stroke-linecap="round"/></svg>`,
      { size: 128 },
    );
  const LBL_LEAF = labelTex(
    `<path d="M20 9 C31 14 32 27 20 34 C8 27 9 14 20 9Z" fill="COL" stroke="#3a2412" stroke-width="1.6" stroke-linejoin="round"/><path d="M20 12 V34" stroke="#3a2412" stroke-width="1.2"/>`,
    "#6cc455",
  );
  const LBL_FLAME = labelTex(
    `<path d="M20 8 C23 15 30 19 29 27 C28 33 24 35 20 35 C16 35 12 33 11 27 C10 21 16 18 20 8Z" fill="COL" stroke="#3a2412" stroke-width="1.6" stroke-linejoin="round"/>`,
    "#ff8a2a",
  );
  const LBL_DROP = labelTex(
    `<path d="M20 8 C25 17 30 22 30 27 A10 10 0 0 1 10 27 C10 22 15 17 20 8Z" fill="COL" stroke="#3a2412" stroke-width="1.6" stroke-linejoin="round"/><path d="M15 27 A5 5 0 0 0 19 32" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
    "#4fc3ef",
  );
  const lavBuds = [8, 14, 20, 26, 32]
    .map(
      (y) =>
        `<ellipse cx="8.5" cy="${y + 2}" rx="3.2" ry="4" fill="#a98bf0" stroke="#5b3fa0" stroke-width="1.2" transform="rotate(-20 8.5 ${y + 2})"/><ellipse cx="15.5" cy="${y}" rx="3.2" ry="4" fill="#b79cf6" stroke="#5b3fa0" stroke-width="1.2" transform="rotate(20 15.5 ${y})"/>`,
    )
    .join("");
  const LAV = svg(
    `<svg viewBox="0 0 24 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 64 V10" stroke="#3f7a35" stroke-width="2.4" stroke-linecap="round"/>${lavBuds}
    <ellipse cx="12" cy="7" rx="2.8" ry="5" fill="#b79cf6" stroke="#5b3fa0" stroke-width="1.2"/>
    <path d="M12 54 C4 50 3 42 5 38 C10 42 12 48 12 54Z" fill="#5fae4a" stroke="#2f6b2c" stroke-width="1.2"/>
    <path d="M12 56 C20 52 21 44 19 40 C14 44 12 50 12 56Z" fill="#6cc455" stroke="#2f6b2c" stroke-width="1.2"/></svg>`,
    { size: 128 },
  );
  const LEAFY = svg(
    `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 64 V14" stroke="#3f7a35" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M20 20 C10 14 12 4 20 1 C28 4 30 14 20 20Z" fill="#6cc455" stroke="#2f6b2c" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M20 36 C8 36 2 26 3 18 C12 18 19 26 20 36Z" fill="#5fae4a" stroke="#2f6b2c" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M20 36 C32 36 38 26 37 18 C28 18 21 26 20 36Z" fill="#6cc455" stroke="#2f6b2c" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M20 54 C10 54 5 46 6 40 C14 40 19 46 20 54Z" fill="#6cc455" stroke="#2f6b2c" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M20 54 C30 54 35 46 34 40 C26 40 21 46 20 54Z" fill="#5fae4a" stroke="#2f6b2c" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M20 18 V4 M19 34 L8 22 M21 34 L32 22" stroke="#b6ec8a" stroke-width="1" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const FLAME = svg(
    `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2 C20 14 30 20 28 33 C27 42 21 46 16 46 C11 46 5 42 4 33 C2 22 12 16 16 2Z" fill="#ff8a2a"/>
    <path d="M16 16 C19 24 24 28 22 36 C21 41 18 43 16 43 C14 43 11 41 10 36 C9 28 14 24 16 16Z" fill="#ffd24a"/>
    <path d="M16 28 C18 32 20 34 19 38 C18.5 41 17 42 16 42 C15 42 13.5 41 13 38 C12 34 14 32 16 28Z" fill="#fff3b0"/></svg>`,
    { size: 128 },
  );
  const SPARK = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 1 Q18 14 31 16 Q18 18 16 31 Q14 18 1 16 Q14 14 16 1Z" fill="#fff6c4" stroke="#ffd15a" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    { size: 64 },
  );
  let ticks = "";
  for (let i = 0; i < 24; i++) {
    const a = i * 15 * D;
    ticks += `<path d="M${(50 + 41 * Math.sin(a)).toFixed(1)} ${(50 - 41 * Math.cos(a)).toFixed(1)} L${(50 + 47 * Math.sin(a)).toFixed(1)} ${(50 - 47 * Math.cos(a)).toFixed(1)}" stroke="#f4c64e" stroke-width="1.4"/>`;
  }
  const SIGIL = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="49" fill="#1d4660"/>
    <circle cx="50" cy="50" r="48" fill="none" stroke="#f4c64e" stroke-width="2.4"/>${ticks}
    <circle cx="50" cy="50" r="40" fill="none" stroke="#7fe3ef" stroke-width="1.4"/>
    <circle cx="50" cy="50" r="30" fill="none" stroke="#f4c64e" stroke-width="1.8"/>
    <path d="M50 21 L75 64.3 L25 64.3Z M50 79 L25 35.7 L75 35.7Z" fill="none" stroke="#7fe3ef" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="50" cy="50" r="8" fill="#f4c64e" stroke="#7fe3ef" stroke-width="1.4"/>
    <circle cx="50" cy="21" r="2.6" fill="#fff6c4"/><circle cx="75" cy="64.3" r="2.6" fill="#fff6c4"/><circle cx="25" cy="64.3" r="2.6" fill="#fff6c4"/>
    <circle cx="50" cy="79" r="2.6" fill="#fff6c4"/><circle cx="25" cy="35.7" r="2.6" fill="#fff6c4"/><circle cx="75" cy="35.7" r="2.6" fill="#fff6c4"/></svg>`,
    { size: 256 },
  );
  const BANNER = svg(
    `<svg viewBox="0 0 38 30" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.2 1.8 H35.8 V26 L19 19.2 L2.2 26Z" fill="none" stroke="#f4c64e" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M4.5 4 H33.5 V23.2 L19 17.4 L4.5 23.2Z" fill="none" stroke="#8fe3ee" stroke-width="0.7" stroke-linejoin="round"/>
    <circle cx="19" cy="10" r="6.6" fill="#1f607f" stroke="#f4c64e" stroke-width="1.3"/>
    <path d="M19 3.6 L20.8 8.2 L25.4 10 L20.8 11.8 L19 16.4 L17.2 11.8 L12.6 10 L17.2 8.2Z" fill="#f6d36a" stroke="#6b4414" stroke-width="0.8" stroke-linejoin="round"/>
    <circle cx="8" cy="9" r="1.1" fill="#f4c64e"/><circle cx="30" cy="9" r="1.1" fill="#f4c64e"/></svg>`,
    { size: 256 },
  );
  let pg = `<rect width="40" height="56" fill="#f5e8c6"/><rect x="2" y="2" width="36" height="52" fill="none" stroke="#d2b074" stroke-width="0.9"/>
    <circle cx="9" cy="10" r="4.6" fill="#2f93aa" stroke="#6b4422" stroke-width="0.9"/><path d="M7 10 H11 M9 8 V12" stroke="#fff6c4" stroke-width="0.9"/>`;
  for (let i = 0; i < 6; i++) pg += `<path d="M15 ${7 + i * 2.7} h${i % 3 === 0 ? 17 : 21}" stroke="#5b3a1e" stroke-width="1.1" stroke-linecap="round" opacity="0.85"/>`;
  for (let i = 0; i < 5; i++) pg += `<path d="M5 ${25 + i * 2.8} h${30 - (i % 2) * 7}" stroke="#5b3a1e" stroke-width="1.1" stroke-linecap="round" opacity="0.8"/>`;
  pg += `<path d="M20 52 V40" stroke="#3f7a35" stroke-width="1.4"/><path d="M20 46 C13 46 11 40 12 38 C17 38 20 41 20 46Z M20 44 C27 44 29 38 28 36 C23 36 20 39 20 44Z" fill="#6cc455" stroke="#2f6b2c" stroke-width="0.8"/>`;
  const PAGE = svg(`<svg viewBox="0 0 40 56" xmlns="http://www.w3.org/2000/svg">${pg}</svg>`, { size: 160 });
  let star = "";
  for (let i = 0; i < 5; i++) {
    const a = (-90 + i * 144) * D;
    star += `${i ? "L" : "M"}${(18 + 10 * Math.cos(a)).toFixed(1)} ${(20 + 10 * Math.sin(a)).toFixed(1)}`;
  }
  let pl = "";
  for (let i = 0; i < 7; i++) pl += `<path d="M36 ${7 + i * 4.4} h${i % 3 === 2 ? 12 : 18}" stroke="#5b3a1e" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>`;
  const PARCH = svg(
    `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 4 L20 2 L40 3.5 L57 2 L58 20 L56.5 37 L38 38.5 L20 37 L4 38.5 L2.5 20Z" fill="#f2e0b0" stroke="#b58a4a" stroke-width="1.2" stroke-linejoin="round"/>
    <circle cx="18" cy="20" r="13" fill="none" stroke="#2c6e84" stroke-width="1.3"/><circle cx="18" cy="20" r="9" fill="none" stroke="#b5483a" stroke-width="0.9"/>
    <path d="${star}Z" fill="none" stroke="#5b3a1e" stroke-width="1.1" stroke-linejoin="round"/>
    <circle cx="18" cy="20" r="2" fill="#f4c64e" stroke="#5b3a1e" stroke-width="0.7"/>${pl}</svg>`,
    { size: 192 },
  );

  // ------------------------------------------------------------------ helpers
  const put = (L: Loc, geo: THREE.BufferGeometry, color: ColorInput, l: V3 = [0, 0, 0], e: V3 = [0, 0, 0], o: O = {}) =>
    b.part(geo, color, { at: L.p(l), quat: L.q.clone().multiply(qE(e)), ...o });
  const box = (L: Loc, s: V3, c: ColorInput, l?: V3, e?: V3, o?: O) => put(L, new THREE.BoxGeometry(s[0], s[1], s[2]), c, l, e, o);
  const cyl = (L: Loc, rt: number, rb: number, h: number, seg: number, c: ColorInput, l?: V3, e?: V3, o?: O) =>
    put(L, new THREE.CylinderGeometry(rt, rb, h, seg), c, l, e, o);
  const ball = (L: Loc, r: number, c: ColorInput, l?: V3, o?: O, ws = 8, hs = 6) =>
    put(L, new THREE.SphereGeometry(r, ws, hs), c, l, [0, 0, 0], o);
  const turn = (L: Loc, pts: Pt[], c: ColorInput, l: V3 = [0, 0, 0], seg = 10, e: V3 = [0, 0, 0]) => {
    const Q = L.q.clone().multiply(qE(e));
    return b.lathe(pts, { at: L.p(l), axis: new THREE.Vector3(0, 1, 0).applyQuaternion(Q), segments: seg, color: c });
  };
  const ext = (L: Loc, pts: OP[], c: ColorInput, th: number, l: V3 = [0, 0, 0], e: V3 = [0, 0, 0], smoothing = 0) => {
    const Q = L.q.clone().multiply(qE(e));
    return b.extrude(pts, {
      at: L.p(l),
      x: new THREE.Vector3(1, 0, 0).applyQuaternion(Q),
      y: new THREE.Vector3(0, 1, 0).applyQuaternion(Q),
      thickness: th,
      color: c,
      smoothing,
    });
  };
  const flat = (L: Loc, w: number, h: number, tex: THREE.Texture, l: V3, e: V3 = [-90, 0, 0]) =>
    put(L, new THREE.PlaneGeometry(w, h), "#ffffff", l, e, { texture: tex });
  const flameAt = (p: THREE.Vector3, w: number, h: number) =>
    glow(b.cards([frame([p.x, p.y, p.z], [0, 1, 0])], FLAME, { size: [w, h], cross: true, sink: 0.02 }), 1.4);
  const sparkle = (p: V3, s: number) => glow(b.cards([frame(p, [0, 1, 0])], SPARK, { size: [s, s], cross: true, sink: 0 }), 1.3);

  // ------------------------------------------------------------------ potions
  type Kind = "round" | "cone" | "vial" | "hex";
  const potion = (
    at: V3,
    kind: Kind,
    r: number,
    h: number,
    liquid: string,
    o: { label?: THREE.Texture; cap?: boolean; strength?: number } = {},
  ) => {
    const L = loc(at);
    let pts: Pt[];
    let yN: number;
    let rn: number;
    let seg = 10;
    let yl: number;
    let rl = r;
    if (kind === "round") {
      yN = 1.95 * r;
      rn = 0.3 * r;
      pts = [[0, 0], [0.55 * r, 0.02 * r], [0.9 * r, 0.35 * r], [r, 0.95 * r], [0.88 * r, 1.5 * r], [0.55 * r, 1.82 * r], [rn * 1.15, yN], [0, yN]];
      yl = 0.95 * r;
    } else if (kind === "cone") {
      yN = 0.6 * h;
      rn = 0.3 * r;
      pts = [[0, 0], [0.96 * r, 0], [r, 0.05 * h], [rn * 1.1, yN], [0, yN]];
      yl = 0.2 * h;
      rl = 0.8 * r;
    } else {
      yN = 0.72 * h;
      rn = 0.5 * r;
      pts = [[0, 0], [0.85 * r, 0], [r, 0.04 * h], [r, 0.58 * h], [rn * 1.05, yN], [0, yN]];
      yl = 0.3 * h;
      seg = kind === "hex" ? 6 : 10;
    }
    const body = turn(L, pts, liquid, [0, 0, 0], seg);
    glow(body, o.strength ?? 1);
    const hn = h - yN;
    turn(L, [[0, 0], [rn, 0], [rn, hn], [rn * 1.3, hn], [rn * 1.3, hn + 0.012], [0, hn + 0.012]], PALE, [0, yN - 0.004, 0], 8);
    turn(L, [[rn * 0.96, 0], [rn * 1.45, 0], [rn * 1.45, 0.01], [rn * 0.96, 0.01]], GOLD, [0, yN + hn * 0.4, 0], 8);
    cyl(L, rn * 0.95, rn * 0.78, 0.028, 8, o.cap ? GOLD : "#c68e55", [0, h + 0.02, 0]);
    if (o.cap) ball(L, rn * 1.05, GOLD, [0, h + 0.045, 0], {}, 6, 4);
    const hit = b.surface(body).around(L.p([0, kind === "round" ? r * 0.95 : h * 0.28, 0])).at(-40, 30);
    if (hit)
      b.stick(new THREE.SphereGeometry(1, 6, 4), "#ffffff", hit, { embed: 0.3, flow: [0, 1, 0], scale: [r * 0.16, r * 0.05, r * 0.4] });
    if (o.label)
      b.decal(body, o.label, { at: L.p([0, yl, rl * 0.92]), dir: [0, 0, 1], size: [rl * 0.95, rl * 1.15], segments: 6 });
    return body;
  };

  const mushroom = (at: V3, r: number, h: number, cap: string, tilt = 0) => {
    const L = loc(at, [0, 0, tilt]);
    cyl(L, r * 0.28, r * 0.36, h * 0.62, 6, "#f3e7c8", [0, h * 0.31, 0]);
    const c = turn(L, [[0, 0], [r, 0], [r * 0.94, h * 0.14], [r * 0.68, h * 0.34], [r * 0.3, h * 0.5], [0, h * 0.55]], cap, [0, h * 0.5, 0], 8);
    glow(c, 1);
    const s = b.surface(c);
    for (const az of [20, 140, 250]) {
      const hit = s.around(L.p([0, h * 0.6, 0])).at(az, 55);
      if (hit) b.stick(new THREE.SphereGeometry(1, 5, 4), "#ffffff", hit, { embed: 0.3, scale: [r * 0.16, r * 0.07, r * 0.16] });
    }
  };

  const candle = (at: V3, h: number) => {
    const L = loc(at);
    turn(L, [[0, 0], [0.04, 0], [0.05, 0.014], [0.044, 0.017], [0.02, 0.01], [0, 0.01]], P_BRASS, [0, 0, 0], 8);
    cyl(L, 0.016, 0.017, h, 8, "#f8efd8", [0, 0.01 + h / 2, 0]);
    cyl(L, 0.0015, 0.0015, 0.012, 4, "#2a2018", [0, 0.01 + h + 0.005, 0]);
    flameAt(L.p([0, 0.01 + h + 0.008, 0]), 0.03, 0.046);
  };

  const book = (at: V3, yaw: number, w: number, t: number, d: number, cover: ColorInput) => {
    const L = loc(at, [0, yaw, 0]);
    const c = 0.006;
    box(L, [w, c, d], cover, [0, c / 2, 0]);
    box(L, [w, c, d], cover, [0, t - c / 2, 0]);
    box(L, [c * 1.4, t, d], cover, [-w / 2 + c * 0.7, t / 2, 0]);
    box(L, [w - 0.018, t - 2 * c + 0.002, d - 0.014], P_CREAM, [0.003, t / 2, 0]);
    for (const z of [-0.3, 0.3]) box(L, [0.004, t + 0.003, 0.012], GOLD, [-w / 2 - 0.0005, t / 2, z * d]);
    for (const sz of [1, -1]) box(L, [0.022, 0.004, 0.022], GOLD, [w / 2 - 0.012, t + 0.0005, sz * (d / 2 - 0.012)]);
    const s = Math.min(w, d) * 0.5;
    flat(L, s, s, EMBLEM, [0.012, t + 0.0016, 0]);
  };

  const bookUp = (at: V3, roll: number, w: number, h: number, d: number, cover: ColorInput) => {
    const L = loc(at, [0, 0, roll]);
    box(L, [w, h, 0.008], cover, [0, h / 2, d / 2 - 0.004]);
    for (const sx of [1, -1]) box(L, [0.006, h, d], cover, [sx * (w / 2 - 0.003), h / 2, 0]);
    box(L, [w, h, 0.006], cover, [0, h / 2, -d / 2 + 0.003]);
    box(L, [w - 0.012, h - 0.012, d - 0.012], P_CREAM, [0, h / 2, -0.004]);
    for (const y of [0.18, 0.82]) box(L, [w + 0.002, 0.01, 0.003], GOLD, [0, h * y, d / 2 + 0.0005]);
    box(L, [w * 0.7, h * 0.16, 0.003], GOLD, [0, h * 0.5, d / 2 + 0.0005]);
  };

  const bundle = (x: number, tex: THREE.Texture, size: [number, number], n: number) => {
    const frames = Array.from({ length: n }, () => frame([x, 1.835, -0.3], [0, 1, 0]));
    b.cards(frames, tex, {
      size,
      lean: 168,
      flow: (_f: unknown, i: number) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)] as V3,
      vary: 0.2,
      spin: 10,
      rng: R,
      sink: 0,
    });
    cyl(WORLD, 0.018, 0.013, 0.04, 8, "#c9a15a", [x, 1.82, -0.3]);
    put(WORLD, new THREE.TorusGeometry(0.02, 0.003, 4, 8), "#8a5a2c", [x, 1.86, -0.3], [0, 90, 0]);
  };

  // ================================================================== TABLE
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const L = loc([sx * 0.85, 0, sz * 0.33]);
      turn(L, [[0, 0], [0.05, 0], [0.05, 0.03], [0.034, 0.07], [0.034, 0.28], [0.052, 0.34], [0.052, 0.4], [0.034, 0.45], [0.034, 0.74], [0.05, 0.78], [0.05, 0.86], [0, 0.86]], P_WOOD, [0, 0, 0], 8);
      cyl(L, 0.056, 0.056, 0.02, 8, GOLD, [0, 0.01, 0]);
      cyl(L, 0.057, 0.057, 0.014, 8, GOLD, [0, 0.37, 0]);
    }
  box(WORLD, [1.9, 0.05, 0.84], P_TOP, [0, 0.875, 0]);
  box(WORLD, [1.82, 0.02, 0.76], P_DARK, [0, 0.84, 0]);
  box(WORLD, [1.68, 0.14, 0.68], P_DARK, [0, 0.77, 0]);
  box(WORLD, [1.8, 0.002, 0.006], GOLD, [0, 0.9012, 0.398]);
  for (const sx of [1, -1]) box(WORLD, [0.006, 0.002, 0.74], GOLD, [sx * 0.9, 0.9012, 0.03]);
  for (const sx of [1, -1]) {
    box(WORLD, [0.05, 0.012, 0.05], GOLD, [sx * 0.925, 0.906, 0.395]);
    box(WORLD, [0.05, 0.012, 0.05], GOLD, [sx * 0.925, 0.906, -0.395]);
  }
  // rails & lower shelf
  for (const sz of [1, -1]) box(WORLD, [1.64, 0.04, 0.04], P_DARK, [0, 0.45, sz * 0.33]);
  for (const sx of [1, -1]) box(WORLD, [0.04, 0.04, 0.62], P_DARK, [sx * 0.85, 0.45, 0]);
  box(WORLD, [1.72, 0.035, 0.62], P_WOOD, [0, 0.2, 0]);
  // drawers
  const drawerLabels = [LBL_LEAF, LBL_FLAME, LBL_DROP];
  [-0.5, 0, 0.5].forEach((x, i) => {
    box(WORLD, [0.48, 0.105, 0.02], P_WOOD, [x, 0.77, 0.352]);
    box(WORLD, [0.4, 0.07, 0.004], P_DARK, [x, 0.77, 0.364]);
    turn(loc([x + 0.07, 0.77, 0.366], [90, 0, 0]), [[0, 0], [0.012, 0], [0.012, 0.012], [0.02, 0.02], [0.022, 0.03], [0.012, 0.038], [0, 0.04]], P_GOLD, [0, 0, 0], 8, [0, 0, 0]);
    put(WORLD, new THREE.PlaneGeometry(0.062, 0.074), "#ffffff", [x - 0.1, 0.77, 0.3668], [0, 0, 0], { texture: drawerLabels[i] });
    box(WORLD, [0.48, 0.006, 0.024], GOLD, [x, 0.8205, 0.352]);
  });

  // ================================================================== HUTCH
  for (const sx of [1, -1]) {
    box(WORLD, [0.07, 1.0, 0.07], P_WOOD, [sx * 0.93, 1.4, -0.36]);
    box(WORLD, [0.085, 0.016, 0.085], GOLD, [sx * 0.93, 0.93, -0.36]);
    box(WORLD, [0.085, 0.016, 0.085], GOLD, [sx * 0.93, 1.87, -0.36]);
    cyl(WORLD, 0.028, 0.034, 0.03, 8, P_GOLD, [sx * 0.93, 1.995, -0.36]);
    ball(WORLD, 0.03, P_GOLD, [sx * 0.93, 2.035, -0.36], {}, 8, 6);
    cyl(WORLD, 0.0, 0.016, 0.05, 6, P_GOLD, [sx * 0.93, 2.085, -0.36]);
    box(WORLD, [0.05, 0.04, 0.06], GOLD, [sx * 0.9, 1.86, -0.325]);
  }
  box(WORLD, [1.96, 0.08, 0.09], P_DARK, [0, 1.94, -0.36]);
  box(WORLD, [1.9, 0.012, 0.094], GOLD, [0, 1.896, -0.36]);
  box(WORLD, [1.8, 1.0, 0.03], P_WOOD, [0, 1.4, -0.385]);
  ext(
    loc([0, 1.98, -0.36]),
    [[-0.26, 0], [-0.26, 0.03], [-0.16, 0.05], [-0.08, 0.09], [0, 0.17, "sharp"], [0.08, 0.09], [0.16, 0.05], [0.26, 0.03], [0.26, 0]],
    P_GOLD,
    0.025,
    [0, 0, 0],
    [0, 0, 0],
    1,
  );
  glow(ball(WORLD, 0.03, "#6fe7f2", [0, 2.04, -0.347], {}, 8, 6), 1.2);
  for (const sy of [1.15, 1.45]) {
    box(WORLD, [1.86, 0.035, 0.2], P_TOP, [0, sy, -0.29]);
    box(WORLD, [1.86, 0.02, 0.006], GOLD, [0, sy - 0.003, -0.188]);
    for (const sx of [1, -1])
      b.extrude([[0, 0], [0.1, 0], [0, -0.09]], {
        at: [sx * 0.9, sy - 0.0175, -0.37],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.02,
        color: P_GOLD,
      });
  }
  // rod, banner, herbs
  cyl(WORLD, 0.012, 0.012, 1.8, 8, P_WOOD, [0, 1.86, -0.3], [0, 0, 90]);
  cyl(WORLD, 0.02, 0.02, 0.4, 8, P_TEAL, [0, 1.855, -0.3], [0, 0, 90]);
  ext(loc([0, 1.855, -0.3]), [[-0.19, 0], [-0.19, -0.3], [0, -0.22, "sharp"], [0.19, -0.3], [0.19, 0]], P_TEAL, 0.012);
  flat(WORLD, 0.38, 0.3, BANNER, [0, 1.705, -0.2934], [0, 0, 0]);
  for (const sx of [1, -1]) {
    cyl(WORLD, 0.0, 0.012, 0.04, 6, GOLD, [sx * 0.19, 1.525, -0.3], [180, 0, 0]);
    ball(WORLD, 0.01, GOLD, [sx * 0.19, 1.552, -0.3], {}, 6, 4);
  }
  for (const x of [-0.78, -0.6, -0.42]) bundle(x, LAV, [0.07, 0.2], 6);
  for (const x of [0.42, 0.6, 0.78]) bundle(x, LEAFY, [0.1, 0.2], 5);

  // ================================================================== SHELF A
  potion([-0.78, SA, -0.27], "hex", 0.032, 0.2, "#ff7fb6", { label: LBL_LEAF, cap: true });
  potion([-0.67, SA, -0.27], "round", 0.045, 0.17, "#4fe3ef", { label: LBL_DROP });
  potion([-0.55, SA, -0.27], "cone", 0.05, 0.2, "#9be85a", { label: LBL_FLAME, cap: true });
  // flower jar
  {
    const L = loc([-0.4, SA, -0.27]);
    const jar = turn(L, [[0, 0], [0.045, 0], [0.06, 0.03], [0.062, 0.1], [0.05, 0.125], [0.04, 0.14], [0, 0.14]], P_CREAM, [0, 0, 0], 10);
    turn(L, [[0.04, 0], [0.052, 0], [0.052, 0.012], [0.04, 0.012]], "#2f93aa", [0, 0.135, 0], 10);
    turn(L, [[0.05, 0], [0.064, 0], [0.064, 0.01], [0.05, 0.01]], "#2f93aa", [0, 0.025, 0], 10);
    b.decal(jar, LBL_LEAF, { at: L.p([0, 0.07, 0.06]), dir: [0, 0, 1], size: [0.06, 0.07], segments: 6 });
    const fr = Array.from({ length: 6 }, () => frame(L.p([0, 0.14, 0]), [0, 1, 0]));
    b.cards(fr, LAV, { size: [0.05, 0.14], lean: 30, flow: (_f: unknown, i: number) => [Math.cos(i * 1.05), 0, Math.sin(i * 1.05)] as V3, vary: 0.2, rng: R, sink: 0.05 });
  }
  // hourglass
  {
    const L = loc([-0.2, SA, -0.27]);
    cyl(L, 0.05, 0.052, 0.012, 8, P_DARK, [0, 0.006, 0]);
    cyl(L, 0.05, 0.052, 0.012, 8, P_DARK, [0, 0.19, 0]);
    for (let i = 0; i < 3; i++) {
      const a = (i * 120 + 30) * D;
      cyl(L, 0.005, 0.005, 0.19, 6, GOLD, [Math.sin(a) * 0.042, 0.098, Math.cos(a) * 0.042]);
    }
    turn(L, [[0, 0.012], [0.035, 0.03], [0.04, 0.05], [0.035, 0.07], [0.008, 0.095], [0, 0.095]], "#f0c868", [0, 0, 0], 8);
    turn(L, [[0, 0.095], [0.008, 0.095], [0.035, 0.12], [0.04, 0.14], [0.035, 0.16], [0, 0.18]], "#d3ecf2", [0, 0, 0], 8);
  }
  // upright books
  bookUp([0.04, SA, -0.27], -8, 0.04, 0.2, 0.15, cel("#8d2f3a"));
  bookUp([0.1, SA, -0.27], 0, 0.04, 0.21, 0.15, cel("#2c6e84"));
  bookUp([0.155, SA, -0.27], 0, 0.05, 0.24, 0.16, cel("#6b4a9a"));
  bookUp([0.21, SA, -0.27], 0, 0.035, 0.19, 0.14, cel("#3f7a46"));
  // armillary
  {
    const c = loc([0.5, SA, -0.27]);
    turn(c, [[0, 0], [0.05, 0], [0.05, 0.01], [0.025, 0.025], [0.01, 0.05], [0, 0.05]], P_BRASS, [0, 0, 0], 8);
    const A = loc([0.5, SA + 0.11, -0.27], [0, 0, 23]);
    for (const e of [[0, 0, 0], [0, 90, 0], [90, 0, 0]] as V3[]) put(A, new THREE.TorusGeometry(0.06, 0.004, 5, 18), GOLD, [0, 0, 0], e);
    put(A, new THREE.TorusGeometry(0.045, 0.003, 5, 16), "#8fe3ee", [0, 0, 0], [60, 30, 0]);
    glow(ball(A, 0.022, "#7fe9f5", [0, 0, 0], {}, 8, 6), 1.3);
    ball(A, 0.012, "#ff9ac8", [0.06, 0, 0], {}, 6, 4);
    cyl(A, 0.003, 0.003, 0.15, 5, GOLD, [0, 0, 0]);
  }
  potion([0.7, SA, -0.27], "round", 0.04, 0.16, "#ffb53d", { label: LBL_FLAME });
  potion([0.82, SA, -0.27], "vial", 0.035, 0.19, "#a98bff", { label: LBL_DROP, cap: true });

  // ================================================================== SHELF B
  potion([-0.82, SB, -0.25], "round", 0.03, 0.1, "#9be85a");
  potion([-0.73, SB, -0.25], "round", 0.03, 0.1, "#ffb53d");
  potion([-0.64, SB, -0.25], "vial", 0.025, 0.11, "#4fe3ef", { cap: true });
  mushroom([-0.46, SB, -0.25], 0.035, 0.08, "#59e3e0");
  mushroom([-0.39, SB, -0.23], 0.025, 0.055, "#ff8fc2", 8);
  mushroom([-0.35, SB, -0.27], 0.02, 0.045, "#59e3e0", -10);
  potion([-0.12, SB, -0.25], "round", 0.04, 0.12, "#ff8fc2", { label: LBL_DROP });
  {
    const L = loc([0.3, SB, -0.25]);
    put(L, new THREE.DodecahedronGeometry(0.04, 0), "#6d7a90", [0, 0.02, 0], [0, 0, 0], { scale: [1.2, 0.5, 1.2], flat: true });
    const cs: [V3, V3, string, number][] = [
      [[0, 0.07, 0], [0, 0, 0], "#8fe9ff", 1],
      [[-0.03, 0.05, 0.01], [0, 0, 24], "#6fc6ff", 0.8],
      [[0.03, 0.05, -0.005], [0, 0, -26], "#b6f4ff", 0.75],
    ];
    for (const [p, e, c, s] of cs)
      glow(put(L, new THREE.OctahedronGeometry(0.025, 0), c, p, e, { scale: [0.8 * s, 2.4 * s, 0.8 * s], flat: true }), 1.2);
  }
  candle([0.55, SB, -0.25], 0.07);
  {
    const L = loc([0.78, SB, -0.25]);
    box(L, [0.07, 0.012, 0.07], P_BRASS, [0, 0.006, 0]);
    glow(box(L, [0.056, 0.07, 0.056], "#ffd36e", [0, 0.047, 0]), 1.2);
    for (const sx of [1, -1]) for (const sz of [1, -1]) box(L, [0.007, 0.074, 0.007], GOLD, [sx * 0.03, 0.049, sz * 0.03]);
    put(L, new THREE.ConeGeometry(0.052, 0.04, 4), P_BRASS, [0, 0.106, 0], [0, 45, 0]);
    put(L, new THREE.TorusGeometry(0.012, 0.003, 4, 10), GOLD, [0, 0.14, 0]);
  }

  // ================================================================== TABLE LEFT: books, lectern, ink
  const stack: [number, number, number, number, number, ColorInput][] = [
    [0.3, 0.05, 0.21, 8, 0, cel("#8d2f3a")],
    [0.27, 0.04, 0.19, -12, 0.05, cel("#2c6e84")],
    [0.24, 0.035, 0.17, 18, 0.09, cel("#3f7a46")],
    [0.2, 0.03, 0.15, -5, 0.125, cel("#6b4a9a")],
  ];
  for (const [w, t, d, yaw, y, c] of stack) book([-0.72, T + y, -0.08], yaw, w, t, d, c);
  candle([-0.72, T + 0.155, -0.08], 0.06);

  {
    const L0 = loc([-0.64, T, 0.2]);
    box(L0, [0.24, 0.03, 0.2], P_DARK, [0, 0.015, 0]);
    cyl(L0, 0.02, 0.026, 0.13, 8, P_WOOD, [0, 0.09, 0]);
    const L1 = L0.sub([0, 0.165, 0], [18, 0, 0]);
    box(L1, [0.36, 0.014, 0.26], P_WOOD, [0, 0, 0]);
    box(L1, [0.36, 0.026, 0.014], P_GOLD, [0, 0.012, 0.128]);
    const sp = L1.sub([0, 0.007, 0]);
    for (const side of [-1, 1]) {
      const H = sp.sub([0, 0, 0], [0, 0, side * -5]);
      box(H, [0.175, 0.006, 0.25], cel("#2c6e84"), [side * 0.0875, 0.003, 0]);
      box(H, [0.168, 0.016, 0.232], P_CREAM, [side * 0.0875, 0.014, 0]);
      flat(H, 0.15, 0.21, PAGE, [side * 0.0875, 0.0225, 0]);
    }
    box(sp, [0.01, 0.002, 0.13], "#c0392b", [0.04, 0.0245, 0.14]);
    ball(sp, 0.009, GOLD, [0.04, 0.0245, 0.215], {}, 5, 4);
  }
  {
    const L = loc([-0.38, T, 0.28]);
    turn(L, [[0, 0], [0.04, 0], [0.046, 0.01], [0.046, 0.05], [0.032, 0.066], [0.024, 0.074], [0, 0.074]], "#34508c", [0, 0, 0], 8);
    cyl(L, 0.026, 0.026, 0.004, 8, "#10162e", [0, 0.074, 0]);
    turn(L, [[0.022, 0], [0.034, 0], [0.034, 0.008], [0.022, 0.008]], GOLD, [0, 0.07, 0], 8);
    const a = L.p([0, 0.075, 0]);
    const dir = new THREE.Vector3(0.35, 1, -0.2).normalize();
    const tip = a.clone().addScaledVector(dir, 0.27);
    b.rod(a, tip, 0.004, "#f6ecd2");
    const yD = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 0, 1)).normalize();
    b.extrude([[0.08, 0.002], [0.12, 0.022], [0.2, 0.03], [0.285, 0.006], [0.29, 0], [0.27, -0.018], [0.2, -0.03], [0.12, -0.02], [0.08, -0.002]], {
      at: a,
      x: dir,
      y: yD,
      thickness: 0.004,
      color: "#7ad0e0",
    });
  }

  // ================================================================== DISTILLATION
  const BX = -0.1;
  const BZ = -0.02;
  flat(WORLD, 0.46, 0.46, SIGIL, [BX, T + 0.0035, BZ]);
  glow(
    put(WORLD, new THREE.CircleGeometry(0.23, 24), "#ffffff", [BX, T + 0.0045, BZ], [-90, 0, 0], { texture: SIGIL }),
    0.8,
  );
  {
    const L = loc([BX, T, BZ]);
    turn(L, [[0, 0], [0.1, 0], [0.1, 0.014], [0.075, 0.03], [0.05, 0.055], [0.062, 0.08], [0.062, 0.09], [0.04, 0.092], [0, 0.075]], P_BRASS, [0, 0, 0], 10);
    glow(cyl(L, 0.04, 0.04, 0.004, 8, "#ff9a3a", [0, 0.083, 0]), 1.2);
    flameAt(L.p([0, 0.085, 0]), 0.075, 0.09);
    put(L, new THREE.TorusGeometry(0.072, 0.007, 5, 14), "#4a4a58", [0, 0.182, 0], [90, 0, 0]);
    for (const a of [90, 210, 330]) {
      const t1 = new THREE.Vector3(BX + 0.074 * Math.cos(a * D), T + 0.182, BZ + 0.074 * Math.sin(a * D));
      const t0 = new THREE.Vector3(BX + 0.135 * Math.cos(a * D), T, BZ + 0.135 * Math.sin(a * D));
      b.rod(t0, t1, 0.007, "#4a4a58");
    }
    potion([BX, T + 0.17, BZ], "round", 0.1, 0.3, "#4fe3d6", { strength: 1.1, cap: true });
    const tube = [
      [BX, 1.395, BZ],
      [BX, 1.46, BZ],
      [BX + 0.04, 1.505, BZ],
      [0.0, 1.5, BZ],
      [0.07, 1.44, BZ],
      [0.1, 1.32, BZ],
      [0.1, 1.095, BZ],
    ];
    b.sweep(catmull(tube), 0.009, { color: PALE, sides: 6 });
    put(WORLD, new THREE.TorusGeometry(0.014, 0.004, 4, 8), GOLD, [BX, 1.43, BZ], [90, 0, 0]);
    potion([0.1, T, BZ], "cone", 0.055, 0.17, "#ff9ac8", { strength: 1.1 });
    sparkle([-0.22, 1.42, 0.05], 0.06);
    sparkle([-0.02, 1.58, 0.0], 0.07);
    sparkle([0.15, 1.55, 0.06], 0.05);
    sparkle([-0.2, 1.64, -0.05], 0.045);
    sparkle([0.22, 1.25, 0.05], 0.05);
  }

  // tray with potions
  {
    const L = loc([0.15, T, 0.29]);
    box(L, [0.46, 0.02, 0.17], P_WOOD, [0, 0.01, 0]);
    box(L, [0.46, 0.03, 0.014], P_DARK, [0, 0.025, 0.078]);
    box(L, [0.46, 0.03, 0.014], P_DARK, [0, 0.025, -0.078]);
    for (const sx of [1, -1]) box(L, [0.014, 0.03, 0.17], P_DARK, [sx * 0.223, 0.025, 0]);
    box(L, [0.462, 0.005, 0.016], GOLD, [0, 0.042, 0.078]);
    potion([0.0, T + 0.02, 0.29], "round", 0.05, 0.17, "#ff7fb6", { label: LBL_LEAF });
    potion([0.15, T + 0.02, 0.29], "cone", 0.055, 0.17, "#4fe3ef", { label: LBL_DROP });
    potion([0.3, T + 0.02, 0.29], "hex", 0.036, 0.2, "#a98bff", { label: LBL_FLAME, cap: true });
  }

  // ================================================================== BALANCE
  {
    const SX = 0.46;
    const SZ = 0.08;
    const S = loc([SX, T, SZ]);
    turn(S, [[0, 0], [0.1, 0], [0.1, 0.012], [0.082, 0.026], [0.045, 0.05], [0.03, 0.09], [0, 0.1]], P_BRASS, [0, 0, 0], 10);
    cyl(S, 0.013, 0.015, 0.34, 8, P_BRASS, [0, 0.27, 0]);
    ball(S, 0.02, GOLD, [0, 0.2, 0], {}, 6, 4);
    ball(S, 0.02, GOLD, [0, 0.33, 0], {}, 6, 4);
    ball(S, 0.022, P_GOLD, [0, 0.44, 0], {}, 8, 6);
    cyl(S, 0.0, 0.014, 0.05, 6, P_GOLD, [0, 0.49, 0]);
    const B = loc([SX, T + 0.44, SZ], [0, 0, -7]);
    ext(B, [[-0.21, 0], [-0.12, 0.012], [0, 0.02], [0.12, 0.012], [0.21, 0], [0.12, -0.01], [0, -0.012], [-0.12, -0.01]], P_GOLD, 0.012);
    b.rod([SX, T + 0.44, SZ + 0.02], [SX, T + 0.31, SZ + 0.02], 0.003, "#4a4a58");
    ball(B, 0.012, GOLD, [0.2, 0, 0], {}, 6, 4);
    ball(B, 0.012, GOLD, [-0.2, 0, 0], {}, 6, 4);
    const pan = (end: THREE.Vector3) => {
      const C = new THREE.Vector3(end.x, end.y - 0.17, end.z);
      const P = loc([C.x, C.y, C.z]);
      turn(P, [[0, 0], [0.055, 0], [0.085, 0.022], [0.08, 0.024], [0.052, 0.008], [0, 0.008]], P_BRASS, [0, 0, 0], 10);
      for (const a of [90, 210, 330]) {
        const rim = new THREE.Vector3(C.x + 0.082 * Math.cos(a * D), C.y + 0.024, C.z + 0.082 * Math.sin(a * D));
        b.rod(end, rim, 0.0025, GOLD);
      }
      return P;
    };
    const heavy = pan(B.p([0.19, 0, 0]));
    glow(put(heavy, new THREE.OctahedronGeometry(0.03, 0), "#8fe9ff", [0, 0.045, 0], [0, 20, 0], { scale: [1, 1.6, 1], flat: true }), 1.2);
    ball(heavy, 0.022, "#6cc455", [0.04, 0.025, 0.02], {}, 6, 4);
    const light = pan(B.p([-0.19, 0, 0]));
    const wts: [number, number, number][] = [[-0.03, 0, 0.012], [0.025, 0.012, 0.01], [0.0, -0.022, 0.008]];
    for (const [x, z, r] of wts) turn(light, [[0, 0], [r, 0], [r * 0.95, r * 0.7], [r * 0.6, r * 0.95], [r * 0.5, r * 1.5], [0, r * 1.6]], P_BRASS, [x, 0.008, z], 8);
  }

  // ================================================================== RIGHT: mortar, plant, scroll
  {
    const L = loc([0.84, T, 0.1]);
    turn(L, [[0, 0], [0.045, 0], [0.06, 0.02], [0.075, 0.07], [0.078, 0.09], [0.07, 0.09], [0.055, 0.065], [0.04, 0.04], [0, 0.035]], P_STONE, [0, 0, 0], 10);
    ball(L, 0.045, "#6aa84f", [0, 0.045, 0], { scale: [1, 0.35, 1] }, 8, 5);
    b.capsule([0.845, T + 0.05, 0.105], [0.9, T + 0.19, 0.15], [0.022, 0.012], cel("#cfd3e0"));
  }
  {
    const L = loc([0.8, T, -0.13]);
    turn(L, [[0, 0], [0.045, 0], [0.06, 0.02], [0.07, 0.11], [0.078, 0.115], [0.078, 0.135], [0.068, 0.135], [0.068, 0.12], [0, 0.12]], P_CLAY, [0, 0, 0], 10);
    turn(L, [[0.07, 0], [0.08, 0], [0.08, 0.012], [0.07, 0.012]], GOLD, [0, 0.08, 0], 10);
    cyl(L, 0.066, 0.066, 0.006, 10, "#4a3020", [0, 0.123, 0]);
    const fr = Array.from({ length: 9 }, (_, i) => frame(L.p([Math.cos(i * 0.7) * 0.02, 0.125, Math.sin(i * 0.7) * 0.02]), [0, 1, 0]));
    b.cards(fr, LEAFY, {
      size: [0.1, 0.17],
      lean: 45,
      bend: 20,
      flow: (_f: unknown, i: number) => [Math.cos(i * 0.7), 0, Math.sin(i * 0.7)] as V3,
      vary: 0.25,
      rng: R,
      sink: 0.05,
    });
    for (const [x, y, z] of [[0.03, 0.27, 0.0], [-0.03, 0.31, 0.03], [0.0, 0.34, -0.03]] as V3[]) {
      ball(L, 0.018, "#fff4f6", [x, y, z], {}, 6, 4);
      glow(ball(L, 0.009, "#ffd24a", [x, y + 0.012, z + 0.008], {}, 5, 4), 1);
    }
  }
  {
    flat(WORLD, 0.27, 0.18, PARCH, [0.64, T + 0.0025, 0.31], [-90, 14, 0]);
    const L = loc([0.56, T + 0.027, 0.33], [0, -8, 0]);
    cyl(L, 0.024, 0.024, 0.24, 10, P_CREAM, [0, 0, 0], [0, 0, 90]);
    for (const sx of [1, -1]) cyl(L, 0.03, 0.03, 0.008, 10, GOLD, [sx * 0.122, 0, 0], [0, 0, 90]);
    cyl(L, 0.027, 0.027, 0.02, 10, "#b53545", [0, 0, 0], [0, 0, 90]);
    ball(L, 0.012, "#d1384a", [0, 0, 0.025], {}, 6, 4);
  }
  for (const [x, z, a, tex] of [[0.88, 0.32, 0.4, LAV], [0.8, 0.36, 2.2, LEAFY], [0.9, 0.24, 4.0, LAV]] as [number, number, number, THREE.Texture][])
    b.cards([frame([x, T + 0.002, z], [0, 1, 0])], tex, { size: [0.07, 0.2], lean: 90, flow: [Math.cos(a), 0, Math.sin(a)], mirror: true, sink: 0 });

  // ================================================================== LOWER SHELF
  const S0 = 0.2175;
  {
    const L = loc([-0.5, S0, 0.0]);
    turn(L, [[0, 0], [0.1, 0], [0.12, 0.07], [0.13, 0.14], [0.12, 0.21], [0.1, 0.28], [0, 0.28]], P_WOOD, [0, 0, 0], 10);
    for (const y of [0.04, 0.225]) turn(L, [[0.111, 0], [0.122, 0], [0.122, 0.018], [0.111, 0.018]], P_IRON, [0, y, 0], 10);
    cyl(L, 0.02, 0.02, 0.05, 6, P_BRASS, [0, 0.12, 0.13], [90, 0, 0]);
    ball(L, 0.016, GOLD, [0, 0.12, 0.158], {}, 6, 4);
  }
  {
    const L = loc([-0.02, S0, 0.0]);
    turn(L, [[0, 0], [0.1, 0], [0.13, 0.05], [0.15, 0.14], [0.16, 0.16], [0.15, 0.16], [0.12, 0.15], [0, 0.13]], P_WICKER, [0, 0, 0], 10);
    put(L, new THREE.TorusGeometry(0.155, 0.008, 4, 14), "#e0bd72", [0, 0.16, 0], [90, 0, 0]);
    put(L, new THREE.TorusGeometry(0.15, 0.008, 4, 10, Math.PI), "#e0bd72", [0, 0.16, 0], [0, 0, 0]);
    const fr = Array.from({ length: 9 }, (_, i) => frame(L.p([Math.cos(i * 0.7) * 0.06, 0.14, Math.sin(i * 0.7) * 0.06]), [0, 1, 0]));
    b.cards(fr, i2(LEAFY, LAV), {
      size: [0.09, 0.2],
      lean: 28,
      flow: (_f: unknown, i: number) => [Math.cos(i * 0.7), 0, Math.sin(i * 0.7)] as V3,
      vary: 0.25,
      rng: R,
      sink: 0.05,
    });
  }
  potion([0.4, S0, 0.04], "round", 0.085, 0.3, "#ffb53d", { label: LBL_FLAME, cap: true });
  potion([0.62, S0, -0.06], "hex", 0.05, 0.3, "#ff6a5f", { label: LBL_DROP, cap: true });

  return b.root;

  function i2(a: THREE.Texture, c: THREE.Texture) {
    return a === c ? a : a;
  }
}
