import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { grain, mix, mottle } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "An indigo-stained wizard's bookshelf with a crescent-moon crown, gilded star trims, leather tomes, wax-sealed scrolls, glowing scrying orbs, armillary spheres, a potion and lit candles, with a lantern, a moon charm and a few books on the floor.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

type Col = string | Paint;
type Vec3 = [number, number, number];
type Fr = { p: THREE.Vector3; q: THREE.Quaternion };
type PO = { texture?: THREE.Texture; scale?: Vec3; flat?: boolean };

const D = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });

  // ---------------------------------------------------------------- palette
  const GOLD = "#e2b13c";
  const GOLD_D = "#a97a22";
  const GOLD_L = "#ffd966";
  const PAGE = "#f0e2b6";
  const INDIGO_D = "#1f1a3f";
  const RED = "#b3283f";
  const BLUE = "#2c52b8";
  const GREEN = "#2c7d55";
  const PURPLE = "#7a36a8";
  const TASSEL = "#6a2fa0";
  const G = "#f2c14e";
  const GS = "#8a5a14";

  const WOOD_V = cel(grain("#4d4590", "#3f3878", { size: 0.02, axis: "y", seed: 2 }));
  const WOOD_H = cel(grain("#4d4590", "#3f3878", { size: 0.02, axis: "x", seed: 3 }));
  const WOOD_D = cel(grain("#38326c", "#2d2859", { size: 0.02, axis: "y", seed: 4 }));
  const WOOD_P = cel(grain("#433b80", "#393270", { size: 0.015, axis: "y", seed: 6 }));
  const PARCH = cel(grain("#efdcab", "#d9c18a", { size: 0.012, axis: "x", seed: 8 }));
  const CANDLE = cel("#f8f0d8", "#e4d0b0");

  const leatherCache = new Map<string, Paint>();
  const leather = (c: string): Paint => {
    let p = leatherCache.get(c);
    if (!p) {
      p = cel(mottle(c, mix(c, "#000000", 0.22), { size: 0.035, contrast: 0.7, seed: 5 }));
      leatherCache.set(c, p);
    }
    return p;
  };

  // ---------------------------------------------------------------- textures
  const STARP = `<path d="M16 1 L19.6 12.4 L31 16 L19.6 19.6 L16 31 L12.4 19.6 L1 16 L12.4 12.4 Z" fill="${G}" stroke="${GS}" stroke-width="1.2" stroke-linejoin="round"/>`;
  const MOONP = `<path d="M22 4 A14 14 0 1 0 22 28 A16 16 0 0 1 22 4 Z" fill="${G}" stroke="${GS}" stroke-width="1.2" stroke-linejoin="round"/>`;
  const TEX_STAR = svg(`<svg viewBox="0 0 32 32">${STARP}</svg>`, { size: 96 });
  const TEX_STAR8 = svg(
    `<svg viewBox="0 0 32 32"><g transform="translate(16 16) rotate(45) scale(0.72) translate(-16 -16)">${STARP}</g>${STARP}</svg>`,
    { size: 96 },
  );
  const TEX_MOON = svg(`<svg viewBox="0 0 32 32">${MOONP}</svg>`, { size: 96 });
  const TEX_DIAMOND = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 1 L25 16 L16 31 L7 16 Z" fill="${G}" stroke="${GS}" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 7 L21 16 L16 25 L11 16 Z" fill="#c98f2b"/></svg>`,
    { size: 96 },
  );
  const TEX_CLASP = svg(
    `<svg viewBox="0 0 32 32"><rect x="11" y="1" width="10" height="30" rx="2" fill="${G}" stroke="${GS}" stroke-width="1.2"/><rect x="3" y="12" width="26" height="8" rx="2" fill="${G}" stroke="${GS}" stroke-width="1.2"/><circle cx="16" cy="16" r="6" fill="#c98f2b" stroke="${GS}" stroke-width="1.2"/><circle cx="16" cy="16" r="2.5" fill="${G}"/></svg>`,
    { size: 96 },
  );
  let sp = "";
  for (let a = 0; a <= 12.5; a += 0.4) {
    const r = 1 + a * 1.15;
    sp += `${a === 0 ? "M" : "L"}${(16 + r * Math.cos(a)).toFixed(1)} ${(16 + r * Math.sin(a)).toFixed(1)} `;
  }
  const TEX_SPIRAL = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#e6cf95"/><path d="${sp}" stroke="#9a7a3c" stroke-width="1.3" fill="none"/></svg>`,
    { size: 96 },
  );
  const orbTex = (base: string, a: string, c: string) => {
    let paths = "";
    for (let i = 0; i < 6; i++) {
      const k = 2 + (i % 3);
      const y0 = 20 + i * 20;
      const amp = 7 + (i % 2) * 4;
      let d = "";
      for (let x = 0; x <= 256; x += 8) {
        const y = y0 + amp * Math.sin((x / 256) * Math.PI * 2 * k + i);
        d += `${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)} `;
      }
      paths += `<path d="${d}" stroke="${i % 2 ? a : c}" stroke-width="${5 + (i % 3) * 2}" fill="none" opacity="0.8"/>`;
    }
    let dots = "";
    for (let j = 0; j < 14; j++)
      dots += `<circle cx="${(j * 53) % 256}" cy="${((j * 37) % 110) + 10}" r="2" fill="#ffffff"/>`;
    return svg(`<svg viewBox="0 0 256 128"><rect width="256" height="128" fill="${base}"/>${paths}${dots}</svg>`, {
      size: 256,
    });
  };
  const TEX_ORB_P = orbTex("#5a1fa0", "#8f4fe0", "#3a1070");
  const TEX_ORB_T = orbTex("#12807f", "#3fd0c8", "#0a5058");
  const TEX_FLAME = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 2 C22 18 30 30 28 46 C27 58 20 62 16 62 C12 62 5 58 4 46 C2 30 10 18 16 2Z" fill="#ff9a1f"/><path d="M16 24 C20 34 24 42 22 52 C21 58 18 60 16 60 C14 60 11 58 10 52 C8 42 12 34 16 24Z" fill="#ffe27a"/><path d="M16 40 C18 46 19 51 18 55 C17 58 15 58 14 55 C13 51 14 46 16 40Z" fill="#fffbe0"/></svg>`,
    { size: 96 },
  );
  const TEX_HANG = svg(
    `<svg viewBox="0 0 64 160"><line x1="32" y1="0" x2="32" y2="14" stroke="${G}" stroke-width="4"/><path transform="translate(14 8) scale(1.6)" d="M22 4 A14 14 0 1 0 22 28 A16 16 0 0 1 22 4 Z" fill="${G}" stroke="${GS}" stroke-width="1.6"/><line x1="32" y1="52" x2="32" y2="66" stroke="${G}" stroke-width="4"/><g transform="translate(14 62) scale(1.1)">${STARP}</g><line x1="32" y1="96" x2="32" y2="112" stroke="${G}" stroke-width="4"/><path d="M32 108 L42 120 L38 142 L32 150 L26 142 L22 120 Z" fill="#62c8ff" stroke="#2a78c8" stroke-width="2.5"/><path d="M32 108 L32 150 M22 120 L42 120" stroke="#b8ecff" stroke-width="3" fill="none"/></svg>`,
    { size: 160 },
  );
  const TEX_ARCH = svg(
    `<svg viewBox="0 0 160 50"><path d="M10 44 Q80 -6 150 44" stroke="${G}" stroke-width="4" fill="none" stroke-linecap="round"/><g transform="translate(66 4) scale(0.8)">${STARP}</g></svg>`,
    { size: 320 },
  );
  const TEX_CROWN = svg(
    `<svg viewBox="0 0 544 120"><g transform="translate(32 0)"><path d="M20 108 C90 100 120 60 170 40 C200 28 220 22 240 22 C260 22 280 28 310 40 C360 60 390 100 460 108" stroke="${G}" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="240" cy="62" r="50" stroke="${G}" stroke-width="7" fill="#2c2660"/><circle cx="240" cy="62" r="40" stroke="${GS}" stroke-width="3" fill="none"/><g transform="translate(212 38) scale(1.55)">${MOONP}</g><g transform="translate(256 36) scale(0.8)">${STARP}</g><g transform="translate(92 62) scale(0.8)">${STARP}</g><g transform="translate(368 62) scale(0.8)">${STARP}</g><g transform="translate(160 84) scale(0.5)">${STARP}</g><g transform="translate(336 84) scale(0.5)">${STARP}</g></g></svg>`,
    { size: 1088 },
  );

  // ---------------------------------------------------------------- placement helpers
  const fr = (x: number, y: number, z: number, yaw = 0, roll = 0, pitch = 0): Fr => ({
    p: new THREE.Vector3(x, y, z),
    q: new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch * D, yaw * D, roll * D, "YXZ")),
  });
  const loc = (f: Fr, l: Vec3) => new THREE.Vector3(l[0], l[1], l[2]).applyQuaternion(f.q).add(f.p);
  const put = (f: Fr, geo: THREE.BufferGeometry, color: Col, l: Vec3 = [0, 0, 0], rot?: Vec3, opts: PO = {}) => {
    const q = f.q.clone();
    if (rot) q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D)));
    return b.part(geo, color, { at: loc(f, l), quat: q, bone: root, ...opts });
  };
  const bx = (f: Fr, w: number, h: number, d: number, c: Col, l: Vec3, rot?: Vec3) =>
    put(f, new THREE.BoxGeometry(w, h, d), c, l, rot);
  const cyl = (f: Fr, rt: number, rb: number, h: number, seg: number, c: Col, l: Vec3, rot?: Vec3) =>
    put(f, new THREE.CylinderGeometry(rt, rb, h, seg), c, l, rot);
  const sph = (f: Fr, r: number, c: Col, l: Vec3) => put(f, new THREE.SphereGeometry(r, 8, 6), c, l);
  const tor = (f: Fr, r: number, t: number, c: Col, l: Vec3, rot?: Vec3, arc = Math.PI * 2) =>
    put(f, new THREE.TorusGeometry(r, t, 5, 16, arc), c, l, rot);
  const tp = (f: Fr, tex: THREE.Texture, w: number, h: number, l: Vec3, rot?: Vec3) =>
    put(f, new THREE.PlaneGeometry(w, h), "#ffffff", l, rot, { texture: tex });
  const rodw = (a: THREE.Vector3, c: THREE.Vector3, r: number, col: string) =>
    b.rod(a, c, r, col, { bone: root, sides: 5 });

  // ---------------------------------------------------------------- props
  const book = (f: Fr, w: number, h: number, d: number, c: string, deco: THREE.Texture, corners = false) => {
    const lc = leather(c);
    const t = 0.007;
    bx(f, t, h, d, lc, [-(w / 2) + t / 2, h / 2, 0]);
    bx(f, t, h, d, lc, [w / 2 - t / 2, h / 2, 0]);
    bx(f, w, h, 0.008, lc, [0, h / 2, d / 2 - 0.004]);
    bx(f, w - 2 * t, h - 0.016, d - 0.012, PAGE, [0, h / 2, -0.002]);
    const zf = d / 2;
    for (const y of [0.1, 0.9]) bx(f, w + 0.004, 0.012, 0.01, GOLD, [0, h * y, zf - 0.001]);
    for (const y of [0.17, 0.83]) bx(f, w + 0.002, 0.005, 0.008, GOLD, [0, h * y, zf - 0.0005]);
    const s = Math.min(w * 0.68, 0.05);
    tp(f, deco, s, s, [0, h * 0.5, zf + 0.0052]);
    tp(f, TEX_DIAMOND, s * 0.45, s * 0.7, [0, h * 0.72, zf + 0.0052]);
    tp(f, TEX_STAR, s * 0.45, s * 0.45, [0, h * 0.28, zf + 0.0052]);
    if (corners) {
      bx(f, w + 0.004, 0.05, 0.03, GOLD, [0, h - 0.025, zf - 0.015]);
      bx(f, w + 0.004, 0.04, 0.03, GOLD, [0, 0.02, zf - 0.015]);
    }
  };

  const flatBook = (f: Fr, L: number, T: number, dp: number, c: string, deco: THREE.Texture) => {
    const lc = leather(c);
    const t = 0.008;
    bx(f, L, t, dp, lc, [0, T - t / 2, 0]);
    bx(f, L, t, dp, lc, [0, t / 2, 0]);
    bx(f, L, T, 0.008, lc, [0, T / 2, dp / 2 - 0.004]);
    bx(f, L - 0.012, T - 2 * t, dp - 0.014, PAGE, [0, T / 2, -0.001]);
    for (const k of [-0.38, -0.3, 0.3, 0.38]) bx(f, 0.01, T + 0.006, 0.01, GOLD, [k * L, T / 2, dp / 2 - 0.001]);
    const s = Math.min(T * 0.8, 0.05);
    tp(f, deco, s, s, [0, T / 2, dp / 2 + 0.0052]);
    for (const k of [-0.17, 0.17]) tp(f, TEX_STAR, s * 0.6, s * 0.6, [k * L, T / 2, dp / 2 + 0.0052]);
  };

  const scroll = (f: Fr, len: number, r: number, ribbon: string, seal: boolean) => {
    cyl(f, r, r, len, 10, PARCH, [0, 0, 0], [0, 0, 90]);
    for (const sx of [-1, 1]) {
      cyl(f, r * 1.05, r * 1.05, 0.008, 10, "#d2b978", [sx * (len / 2 - 0.004), 0, 0], [0, 0, 90]);
      put(f, new THREE.CircleGeometry(r * 0.98, 10), "#ffffff", [sx * (len / 2 + 0.0035), 0, 0], [0, sx * 90, 0], {
        texture: TEX_SPIRAL,
      });
    }
    tor(f, r + 0.003, 0.004, ribbon, [len * 0.18, 0, 0], [0, 90, 0]);
    tor(f, r + 0.003, 0.003, ribbon, [-len * 0.3, 0, 0], [0, 90, 0]);
    if (seal) {
      cyl(f, 0.014, 0.014, 0.008, 8, GOLD, [len * 0.18, 0, r + 0.004], [90, 0, 0]);
      tp(f, TEX_STAR, 0.02, 0.02, [len * 0.18, 0, r + 0.0085]);
      bx(f, 0.006, 0.05, 0.002, ribbon, [len * 0.18 + 0.012, -0.03, r + 0.003], [0, 0, 12]);
      bx(f, 0.006, 0.045, 0.002, ribbon, [len * 0.18 - 0.008, -0.028, r + 0.003], [0, 0, -10]);
    }
  };

  const orb = (f: Fr, r: number, tex: THREE.Texture, strength: number) => {
    glow(put(f, new THREE.SphereGeometry(r, 14, 10), "#ffffff", [0, 0, 0], undefined, { texture: tex }), strength);
    glow(sph(f, r * 0.16, "#ffffff", [-r * 0.4, r * 0.5, r * 0.68]), 1);
    glow(sph(f, r * 0.08, "#ffffff", [r * 0.15, r * 0.7, r * 0.66]), 1);
  };

  const cradleOrb = (x: number, y0: number, z: number, r: number) => {
    const f = fr(x, y0, z);
    cyl(f, 0.05, 0.062, 0.012, 10, GOLD, [0, 0.006, 0]);
    cyl(f, 0.03, 0.045, 0.03, 10, GOLD, [0, 0.027, 0]);
    cyl(f, 0.02, 0.02, 0.02, 8, GOLD_D, [0, 0.052, 0]);
    const oy = 0.062 + 1.06 * r + 0.005;
    tor(f, r * 1.06, 0.008, GOLD, [0, oy, 0], [0, 0, 180], Math.PI);
    for (const s of [-1, 1]) put(f, new THREE.ConeGeometry(0.012, 0.045, 6), GOLD, [s * r * 1.06, oy + 0.02, 0]);
    for (let k = 0; k < 3; k++) {
      const a = k * 2.094;
      sph(f, 0.012, GOLD_L, [0.055 * Math.cos(a), 0.01, 0.055 * Math.sin(a)]);
    }
    orb(fr(x, y0 + oy, z), r, TEX_ORB_P, 0.7);
  };

  const tripodOrb = (x: number, y0: number, z: number, r: number) => {
    const f = fr(x, y0, z);
    tor(f, 0.06, 0.006, GOLD, [0, 0.085, 0], [90, 0, 0]);
    for (let k = 0; k < 3; k++) {
      const a = k * 2.094 + 0.5;
      rodw(loc(f, [0.06 * Math.cos(a), 0.085, 0.06 * Math.sin(a)]), loc(f, [0.085 * Math.cos(a), 0.008, 0.085 * Math.sin(a)]), 0.006, GOLD);
      sph(f, 0.011, GOLD_L, [0.085 * Math.cos(a), 0.008, 0.085 * Math.sin(a)]);
    }
    orb(fr(x, y0 + 0.085 + Math.sqrt(r * r - 0.06 * 0.06), z), r, TEX_ORB_T, 0.7);
  };

  const candle = (x: number, y0: number, z: number, hgt: number, s: number) => {
    const f = fr(x, y0, z);
    b.lathe(
      [
        [0, 0],
        [0.055 * s, 0],
        [0.055 * s, 0.012 * s],
        [0.036 * s, 0.03 * s],
        [0.028 * s, 0.06 * s],
        [0.044 * s, 0.082 * s],
        [0.044 * s, 0.09 * s],
        [0, 0.09 * s],
      ],
      { at: f.p, color: GOLD, bone: root, segments: 10 },
    );
    tor(f, 0.03 * s, 0.005, GOLD_L, [0, 0.06 * s, 0], [90, 0, 0]);
    tp(f, TEX_STAR, 0.03 * s, 0.03 * s, [0, 0.035 * s, 0.0345 * s + 0.001]);
    const rad = 0.028 * s;
    const base = 0.09 * s;
    const top = base + hgt;
    cyl(f, rad, rad, hgt, 10, CANDLE, [0, base + hgt / 2, 0]);
    cyl(f, rad * 1.1, rad * 1.1, 0.008, 10, "#fff6e0", [0, top, 0]);
    for (const a of [0.6, 2.4, 4.2]) {
      cyl(f, 0.005 * s, 0.0035 * s, 0.03 * s, 5, "#fff6e0", [rad * 0.98 * Math.cos(a), top - 0.014 * s, rad * 0.98 * Math.sin(a)]);
      sph(f, 0.005 * s, "#fff6e0", [rad * 0.98 * Math.cos(a), top - 0.03 * s, rad * 0.98 * Math.sin(a)]);
    }
    cyl(f, 0.002, 0.002, 0.016, 4, "#2a2018", [0, top + 0.012, 0]);
    glow(
      b.cards([frame(loc(f, [0, top + 0.016, 0]), [0, 1, 0])], TEX_FLAME, {
        size: [0.034 * s, 0.06 * s],
        cross: true,
        flow: [0, 0, 1],
        sink: 0,
      }),
      1.4,
    );
  };

  const armillary = (x: number, y0: number, z: number, r: number, inner: string) => {
    const f = fr(x, y0, z);
    cyl(f, 0.055, 0.068, 0.012, 10, GOLD, [0, 0.006, 0]);
    cyl(f, 0.03, 0.045, 0.025, 10, GOLD, [0, 0.024, 0]);
    const cy = 0.07 + r;
    rodw(loc(f, [0, 0.03, 0]), loc(f, [0, cy - r * 0.9, 0]), 0.008, GOLD);
    const g = fr(x, y0 + cy, z, 0, 23);
    tor(g, r, 0.0045, GOLD, [0, 0, 0]);
    tor(g, r, 0.0045, GOLD, [0, 0, 0], [90, 0, 0]);
    tor(g, r * 0.96, 0.0045, GOLD_L, [0, 0, 0], [0, 90, 0]);
    sph(g, r * 0.4, inner, [0, 0, 0]);
    cyl(g, 0.004, 0.004, r * 2.5, 6, GOLD_D, [0, 0, 0]);
    sph(g, 0.008, GOLD_L, [0, r * 1.25, 0]);
    sph(g, 0.008, GOLD_L, [0, -r * 1.25, 0]);
    sph(g, r * 0.13, "#7fa8ff", [r, 0, 0]);
  };

  const potion = (x: number, y0: number, z: number) => {
    const f = fr(x, y0, z);
    glow(
      b.lathe(
        [
          [0, 0],
          [0.04, 0],
          [0.062, 0.025],
          [0.065, 0.055],
          [0.045, 0.095],
          [0.022, 0.125],
          [0.022, 0.15],
          [0, 0.15],
        ],
        { at: f.p, color: "#2b3fd8", bone: root, segments: 10 },
      ),
      0.6,
    );
    cyl(f, 0.046, 0.05, 0.01, 10, GOLD, [0, 0.004, 0]);
    cyl(f, 0.026, 0.026, 0.016, 8, GOLD, [0, 0.15, 0]);
    cyl(f, 0.02, 0.024, 0.03, 8, GOLD_D, [0, 0.172, 0]);
    sph(f, 0.022, GOLD, [0, 0.19, 0]);
    cyl(f, 0.02, 0.02, 0.006, 8, GOLD, [0, 0.07, 0.062], [90, 0, 0]);
    tp(f, TEX_STAR, 0.026, 0.026, [0, 0.07, 0.0655]);
    glow(sph(f, 0.008, "#ffffff", [-0.035, 0.085, 0.05]), 1);
  };

  const tasselDrop = (f: Fr, l: Vec3) => {
    sph(f, 0.009, GOLD, [l[0], l[1], l[2]]);
    cyl(f, 0.008, 0.02, 0.07, 8, TASSEL, [l[0], l[1] - 0.045, l[2]]);
    for (const k of [-0.012, -0.004, 0.004, 0.012]) bx(f, 0.003, 0.025, 0.003, TASSEL, [l[0] + k, l[1] - 0.09, l[2]]);
  };

  // ---------------------------------------------------------------- frame of the shelf
  const W = fr(0, 0, 0);
  const SH = [0.2, 0.62, 1.04];
  const L0 = SH[0];
  const M0 = SH[1];
  const T0 = SH[2];

  // plinth, apron, back
  bx(W, 1.24, 0.18, 0.34, INDIGO_D, [0, 0.09, 0]);
  const apron: OutlinePoint[] = [
    [-0.62, 0.18],
    [-0.62, 0.1],
    [-0.5, 0.04],
    [-0.3, 0.025],
    [-0.14, 0.05],
    [0, 0.1],
    [0.14, 0.05],
    [0.3, 0.025],
    [0.5, 0.04],
    [0.62, 0.1],
    [0.62, 0.18],
  ];
  b.extrude(apron, { at: [0, 0, 0.16], x: [1, 0, 0], thickness: 0.04, bevel: 0.004, color: WOOD_D, bone: root });
  tp(W, TEX_ARCH, 0.34, 0.106, [0, 0.13, 0.1815]);
  bx(W, 1.24, 1.3, 0.02, WOOD_D, [0, 0.82, -0.18]);
  for (let i = -3; i <= 3; i++) bx(W, 0.004, 1.26, 0.004, INDIGO_D, [i * 0.155, 0.82, -0.168]);

  // shelves
  for (const y of SH) {
    bx(W, 1.28, 0.04, 0.4, WOOD_H, [0, y - 0.02, 0]);
    bx(W, 1.28, 0.008, 0.012, "#6a62b4", [0, y - 0.004, 0.206]);
  }
  // top board and crown
  bx(W, 1.28, 0.06, 0.42, WOOD_H, [0, 1.47, 0]);
  bx(W, 1.24, 0.02, 0.02, GOLD, [0, 1.435, 0.205]);
  const crown: OutlinePoint[] = [
    [-0.68, 0, "sharp"],
    [0.68, 0, "sharp"],
    [0.68, 0.06, "sharp"],
    [0.42, 0.1],
    [0.3, 0.2],
    [0.18, 0.27],
    [0, 0.3],
    [-0.18, 0.27],
    [-0.3, 0.2],
    [-0.42, 0.1],
    [-0.68, 0.06, "sharp"],
  ];
  b.extrude(crown, {
    at: [0, 1.5, -0.1],
    x: [1, 0, 0],
    thickness: 0.06,
    bevel: 0.006,
    smoothing: 1,
    color: WOOD_D,
    bone: root,
  });
  tp(W, TEX_CROWN, 1.36, 0.3, [0, 1.65, -0.068]);
  for (const s of [-1, 1]) {
    bx(W, 0.07, 0.05, 0.07, WOOD_D, [s * 0.5, 1.525, -0.1]);
    put(fr(s * 0.5, 1.55, -0.1), new THREE.ConeGeometry(0.03, 0.09, 4), GOLD, [0, 0.045, 0], [0, 45, 0]);
  }

  // posts
  for (const s of [-1, 1]) {
    const px = s * 0.7;
    bx(W, 0.16, 1.4, 0.4, WOOD_V, [px, 0.7, 0]);
    bx(W, 0.1, 1.0, 0.012, WOOD_P, [px, 0.72, 0.2056]);
    bx(W, 0.2, 0.28, 0.44, WOOD_D, [px, 0.14, 0]);
    bx(W, 0.215, 0.03, 0.455, GOLD, [px, 0.015, 0]);
    bx(W, 0.215, 0.025, 0.455, GOLD, [px, 0.285, 0]);
    tp(W, TEX_DIAMOND, 0.07, 0.11, [px, 0.15, 0.2215]);
    tp(W, TEX_DIAMOND, 0.07, 0.11, [s * 0.8015, 0.15, 0], [0, s * 90, 0]);
    tp(W, TEX_DIAMOND, 0.06, 0.1, [px, 0.45, 0.2125]);
    tp(W, TEX_STAR, 0.06, 0.06, [px, 1.18, 0.2125]);
    bx(W, 0.17, 0.02, 0.415, GOLD, [px, 1.3, 0]);
    bx(W, 0.2, 0.14, 0.44, WOOD_D, [px, 1.47, 0]);
    bx(W, 0.215, 0.022, 0.455, GOLD, [px, 1.41, 0]);
    bx(W, 0.215, 0.022, 0.455, GOLD, [px, 1.535, 0]);
    tp(W, TEX_STAR8, 0.085, 0.085, [px, 1.472, 0.2215]);
    tp(W, TEX_STAR8, 0.085, 0.085, [s * 0.8015, 1.472, 0], [0, s * 90, 0]);
    bx(W, 0.12, 0.04, 0.12, WOOD_D, [px, 1.565, 0]);
    bx(W, 0.14, 0.015, 0.14, GOLD, [px, 1.5875, 0]);
    put(fr(px, 1.595, 0), new THREE.ConeGeometry(0.06, 0.17, 4), GOLD, [0, 0.085, 0], [0, 45, 0], { flat: true });
    put(fr(px, 1.595, 0), new THREE.ConeGeometry(0.06, 0.04, 4), GOLD_D, [0, -0.01, 0], [180, 45, 0], { flat: true });
  }

  // hanging moon charm (left post)
  rodw(new THREE.Vector3(-0.78, 1.37, 0.1), new THREE.Vector3(-0.815, 1.37, 0.1), 0.004, GOLD);
  const hf = fr(-0.815, 1.37, 0.1);
  tp(hf, TEX_HANG, 0.08, 0.2, [0, -0.1, 0.001]);
  tp(hf, TEX_HANG, 0.08, 0.2, [0, -0.1, -0.001], [0, 180, 0]);
  sph(hf, 0.008, GOLD_L, [0.0, 0.002, 0]);

  // lantern (right post)
  rodw(new THREE.Vector3(0.78, 1.38, 0.1), new THREE.Vector3(0.83, 1.38, 0.1), 0.004, GOLD);
  const lf = fr(0.83, 1.226, 0.1);
  bx(lf, 0.05, 0.012, 0.05, GOLD, [0, 0.006, 0]);
  glow(bx(lf, 0.04, 0.07, 0.04, "#ffb347", [0, 0.047, 0]), 1.2);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) bx(lf, 0.006, 0.075, 0.006, GOLD, [sx * 0.022, 0.05, sz * 0.022]);
  bx(lf, 0.055, 0.01, 0.055, GOLD, [0, 0.092, 0]);
  put(lf, new THREE.ConeGeometry(0.04, 0.035, 4), GOLD, [0, 0.1175, 0], [0, 45, 0]);
  tor(lf, 0.012, 0.003, GOLD, [0, 0.145, 0]);
  tp(lf, TEX_STAR, 0.028, 0.028, [0, 0.047, 0.0225]);
  tasselDrop(lf, [0, -0.008, 0]);

  // ---------------------------------------------------------------- top bay
  const zb = 0.06;
  const sb = (x: number, y0: number, w: number, h: number, c: string, deco: THREE.Texture, corners = false) =>
    book(fr(x, y0, zb), w, h, 0.24, c, deco, corners);

  const bookendFrame = fr(-0.605, T0, 0.08);
  bx(bookendFrame, 0.008, 0.15, 0.16, GOLD, [0, 0.075, 0]);
  cyl(bookendFrame, 0.05, 0.05, 0.012, 10, GOLD_L, [0.01, 0.085, 0], [0, 0, 90]);
  cyl(bookendFrame, 0.02, 0.02, 0.016, 8, GOLD_D, [0.012, 0.085, 0], [0, 0, 90]);
  sb(-0.565, T0, 0.06, 0.3, RED, TEX_STAR8, true);
  sb(-0.5, T0, 0.055, 0.32, BLUE, TEX_DIAMOND);
  sb(-0.43, T0, 0.07, 0.3, GREEN, TEX_DIAMOND);
  const moonEnd = fr(-0.385, T0, 0.1);
  bx(moonEnd, 0.008, 0.15, 0.15, GOLD, [0, 0.075, 0]);
  tp(moonEnd, TEX_MOON, 0.07, 0.07, [0.0045, 0.085, 0], [0, 90, 0]);
  cradleOrb(-0.22, T0, 0.04, 0.075);

  scroll(fr(0.12, T0 + 0.03, -0.01, 3), 0.26, 0.03, RED, false);
  scroll(fr(0.13, T0 + 0.03, 0.05, -2), 0.26, 0.03, PURPLE, true);
  scroll(fr(0.115, T0 + 0.082, 0.02, 1), 0.26, 0.03, RED, true);

  // inkwell and quill
  const ink = fr(0.33, T0, 0.05);
  cyl(ink, 0.03, 0.034, 0.05, 8, "#1c1840", [0, 0.025, 0]);
  cyl(ink, 0.016, 0.02, 0.014, 8, GOLD, [0, 0.057, 0]);
  tp(ink, TEX_STAR, 0.022, 0.022, [0, 0.025, 0.0345]);
  const qa = new THREE.Vector3(0.33, T0 + 0.06, 0.05);
  const qd = new THREE.Vector3(0.05, 0.97, 0.25).normalize();
  rodw(qa, qa.clone().addScaledVector(qd, 0.2), 0.0025, "#f4ecd8");
  const feather: OutlinePoint[] = [
    [0, 0.04],
    [0.02, 0.08],
    [0.016, 0.14],
    [0, 0.19],
    [-0.016, 0.14],
    [-0.02, 0.08],
  ];
  b.extrude(feather, {
    at: qa.clone().addScaledVector(qd, 0.0),
    x: [1, 0, 0],
    y: [0, 0.97, 0.25],
    thickness: 0.004,
    color: "#dfe9ff",
    bone: root,
  });

  candle(0.46, T0, 0.04, 0.13, 1);

  // ---------------------------------------------------------------- middle bay
  armillary(-0.54, M0, 0.05, 0.07, "#3a2a7a");
  sb(-0.4, M0, 0.055, 0.3, BLUE, TEX_DIAMOND);
  sb(-0.335, M0, 0.06, 0.32, PURPLE, TEX_STAR8);
  sb(-0.265, M0, 0.065, 0.3, RED, TEX_MOON, true);
  flatBook(fr(0, M0, 0.02, 2), 0.3, 0.065, 0.21, BLUE, TEX_STAR);
  const gf = fr(0.005, M0 + 0.065, 0.02, -3);
  flatBook(gf, 0.28, 0.055, 0.21, GREEN, TEX_CLASP);
  bx(gf, 0.009, 0.05, 0.003, TASSEL, [0.06, -0.005, 0.1075]);
  sph(gf, 0.008, GOLD, [0.06, -0.034, 0.1075]);
  tripodOrb(0.31, M0, 0.05, 0.07);
  candle(0.455, M0, 0.04, 0.12, 1);
  candle(0.565, M0, 0.04, 0.07, 0.75);

  // ---------------------------------------------------------------- low bay
  scroll(fr(-0.545, 0.325, 0.03, 0, 78), 0.24, 0.028, RED, true);
  scroll(fr(-0.495, 0.323, 0.05, 0, 100), 0.24, 0.028, PURPLE, true);
  scroll(fr(-0.45, 0.314, 0.03, 0, 72), 0.22, 0.028, BLUE, true);
  sb(-0.33, L0, 0.065, 0.32, GREEN, TEX_MOON);
  sb(-0.265, L0, 0.06, 0.31, BLUE, TEX_STAR);
  sb(-0.2, L0, 0.065, 0.3, RED, TEX_DIAMOND, true);
  potion(-0.06, L0, 0.05);
  flatBook(fr(0.22, L0, 0.02, 3), 0.33, 0.06, 0.22, RED, TEX_CLASP);
  flatBook(fr(0.225, L0 + 0.06, 0.03, -4), 0.31, 0.055, 0.21, GREEN, TEX_CLASP);
  flatBook(fr(0.21, L0 + 0.115, 0.02, 2), 0.3, 0.06, 0.21, PURPLE, TEX_STAR8);
  armillary(0.52, L0, 0.05, 0.075, "#e8dcc4");

  // ---------------------------------------------------------------- floor clutter
  flatBook(fr(-0.5, 0, 0.42, 8), 0.3, 0.05, 0.21, RED, TEX_STAR);
  flatBook(fr(-0.49, 0.05, 0.42, -6), 0.28, 0.055, 0.2, BLUE, TEX_MOON);
  scroll(fr(-0.4, 0.03, 0.6, -15), 0.3, 0.03, RED, true);

  return b.root;
}
