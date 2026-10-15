```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, spiral, svg, grain, mottle, scales, stripes } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "High-fantasy anime arcane bookcase: plum-wood case with gilt trim and a moon-crowned gable, starry back panel, shelves of runed tomes, potions, hourglass, crystal orbs, scrolls, skull candle and an armillary, on a rune-ringed stone dais with a candelabra, scroll basket and a levitating spellbook.",
};

type P3 = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "wizard_bookshelf" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);
  const TR = rng(5);
  const DEG = Math.PI / 180;

  // ------------------------------------------------------------------ helpers
  const V3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const mat = (p: number[], r: number[] = [0, 0, 0]) =>
    new THREE.Matrix4().compose(
      V3(p[0], p[1], p[2]),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * DEG, r[1] * DEG, r[2] * DEG, "YXZ")),
      V3(1, 1, 1),
    );
  const put = (
    geo: THREE.BufferGeometry,
    color: any,
    p: number[],
    r: number[] = [0, 0, 0],
    parent?: THREE.Matrix4,
    opt: { texture?: THREE.Texture; flat?: boolean } = {},
  ) => {
    const m = parent ? parent.clone().multiply(mat(p, r)) : mat(p, r);
    geo.applyMatrix4(m);
    return b.part(geo, color, { bone: root, at: [0, 0, 0], ...opt });
  };
  const lathe = (pts: number[][], at: number[], color: any, seg = 10, k = 1) =>
    b.lathe(
      pts.map((q) => [q[0] * k, q[1] * k] as [number, number]),
      { at: [at[0], at[1], at[2]] as P3, segments: seg, color, bone: root },
    );

  const Z0 = -0.25; // case centre depth
  const CASE = mat([0, 0, Z0]);
  const CZ = (dz: number) => Z0 + dz;
  const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, par: THREE.Matrix4 | undefined = CASE) =>
    put(new THREE.BoxGeometry(w, h, d), color, [x, y, z], [0, 0, 0], par);

  // ------------------------------------------------------------------ svg helpers
  const star5 = (cx: number, cy: number, r: number) => {
    let d = "";
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.42 : r;
      d += `${i ? "L" : "M"}${(cx + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`;
    }
    return d + "Z";
  };

  // ------------------------------------------------------------------ textures
  const GT = "#f4cf5a";
  const T = {
    gold: svg(
      `<svg viewBox="0 0 20 100"><rect x="0" y="4" width="20" height="4" fill="${GT}"/><rect x="0" y="10" width="20" height="1.4" fill="${GT}"/>
      <path d="M10 24 L16.5 38 L10 52 L3.5 38Z" fill="none" stroke="${GT}" stroke-width="1.5"/><circle cx="10" cy="38" r="2.4" fill="${GT}"/>
      <rect x="0" y="62" width="20" height="1.4" fill="${GT}"/><rect x="0" y="66" width="20" height="1.4" fill="${GT}"/><rect x="0" y="90" width="20" height="4" fill="${GT}"/></svg>`,
      { size: 256 },
    ),
    silver: svg(
      `<svg viewBox="0 0 20 100"><rect x="0" y="5" width="20" height="3" fill="#dfe6f2"/><rect x="0" y="92" width="20" height="3" fill="#dfe6f2"/>
      <rect x="3" y="18" width="14" height="40" rx="1.5" fill="#f1efe4" stroke="#b9c2d6" stroke-width="1.2"/>
      <rect x="5.5" y="24" width="9" height="2" fill="#3a3550"/><rect x="5.5" y="30" width="9" height="2" fill="#3a3550"/><rect x="5.5" y="36" width="6" height="2" fill="#3a3550"/>
      <path d="${star5(10, 49, 4)}" fill="#7a3fb0"/><rect x="0" y="66" width="20" height="2" fill="#dfe6f2"/><path d="M10 76 L14 82 L10 88 L6 82Z" fill="#dfe6f2"/></svg>`,
      { size: 256 },
    ),
    rune: svg(
      `<svg viewBox="0 0 20 100"><g stroke="#7ff0e0" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 22 L10 12 L14 22 M10 12 V32 M6 28 L14 28"/><path d="M6 44 H14 M10 40 V60 M6 52 L10 48 L14 52"/>
      <circle cx="10" cy="78" r="5"/><path d="M10 70 V86 M5 78 H15"/></g><rect x="0" y="4" width="20" height="2" fill="#7ff0e0"/><rect x="0" y="94" width="20" height="2" fill="#7ff0e0"/></svg>`,
      { size: 256 },
    ),
    eye: svg(
      `<svg viewBox="0 0 20 100"><rect x="0" y="6" width="20" height="2" fill="${GT}"/><rect x="0" y="92" width="20" height="2" fill="${GT}"/>
      <path d="M2 50 Q10 36 18 50 Q10 64 2 50Z" fill="#fff3c8" stroke="${GT}" stroke-width="1.3"/>
      <circle cx="10" cy="50" r="4.4" fill="#e0407a"/><circle cx="10" cy="50" r="1.9" fill="#2a0f3a"/>
      <path d="M10 22 V30 M4 28 L6.5 33 M16 28 L13.5 33 M10 70 V78 M4 72 L6.5 67 M16 72 L13.5 67" stroke="${GT}" stroke-width="1.6" stroke-linecap="round"/></svg>`,
      { size: 256 },
    ),
    emblem: (() => {
      let dots = "";
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        dots += `<circle cx="${(50 + 43 * Math.cos(a)).toFixed(1)}" cy="${(50 + 43 * Math.sin(a)).toFixed(1)}" r="1.4" fill="#ffd76a"/>`;
      }
      return svg(
        `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#ffd76a" stroke-width="3"/>
        <circle cx="50" cy="50" r="39" fill="none" stroke="#ffd76a" stroke-width="1.3"/>${dots}
        <path d="M62 22 A30 30 0 1 0 62 78 A60 60 0 0 1 62 22Z" fill="#ffd76a"/><path d="${star5(71, 50, 11)}" fill="#ffd76a"/></svg>`,
        { size: 256 },
      );
    })(),
    starry: (() => {
      let s = "";
      for (let i = 0; i < 90; i++) {
        const c = TR() < 0.2 ? "#9ff3ff" : TR() < 0.3 ? "#ffe9a0" : "#ffffff";
        s += `<circle cx="${(TR() * 140).toFixed(1)}" cy="${(TR() * 130).toFixed(1)}" r="${(0.4 + TR() * 0.9).toFixed(2)}" fill="${c}" opacity="${(0.5 + TR() * 0.5).toFixed(2)}"/>`;
      }
      let big = "";
      for (let i = 0; i < 9; i++) {
        const x = 8 + TR() * 124;
        const y = 8 + TR() * 114;
        const r = 2.5 + TR() * 3;
        big += `<path d="M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z" fill="#ffffff"/>`;
      }
      return svg(
        `<svg viewBox="0 0 140 130"><defs><linearGradient id="sg" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#150f45"/><stop offset="1" stop-color="#3b1d72"/></linearGradient></defs>
        <rect width="140" height="130" fill="url(#sg)"/>
        <circle cx="40" cy="90" r="34" fill="#4a2f9a" opacity="0.35"/><circle cx="105" cy="40" r="30" fill="#1f7f9a" opacity="0.3"/><circle cx="85" cy="105" r="24" fill="#a03a9a" opacity="0.25"/>
        ${s}${big}
        <path d="M96 16 A9 9 0 1 0 96 34 A15 15 0 0 1 96 16Z" fill="#fff1c0"/>
        <path d="M20 100 L34 86 L52 94 L66 76 L84 84" stroke="#ffe9a0" stroke-width="0.6" fill="none" opacity="0.8"/>
        <circle cx="20" cy="100" r="1.8" fill="#ffe9a0"/><circle cx="34" cy="86" r="1.8" fill="#ffe9a0"/><circle cx="52" cy="94" r="1.8" fill="#ffe9a0"/><circle cx="66" cy="76" r="1.8" fill="#ffe9a0"/><circle cx="84" cy="84" r="1.8" fill="#ffe9a0"/></svg>`,
        { size: 512 },
      );
    })(),
    floorRune: (() => {
      const c = "#7ee8ff";
      const P = (r: number, a: number) => `${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`;
      let g = "";
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        g += `<path d="M${P(38, a)} L${P(42, a)} M${P(40, a)} L${P(42.2, a + 0.08)}" stroke="${c}" stroke-width="0.9" fill="none" stroke-linecap="round"/>`;
      }
      const tri = (off: number) =>
        [0, 1, 2].map((k) => P(34, off + (k * Math.PI * 2) / 3)).join(" ");
      let dots = "";
      for (let k = 0; k < 6; k++) dots += `<circle cx="${P(34, -Math.PI / 2 + (k * Math.PI) / 3).split(" ")[0]}" cy="${P(34, -Math.PI / 2 + (k * Math.PI) / 3).split(" ")[1]}" r="1.6" fill="${c}"/>`;
      return svg(
        `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="none" stroke="${c}" stroke-width="1.5"/><circle cx="50" cy="50" r="44" fill="none" stroke="${c}" stroke-width="0.7"/>
        <circle cx="50" cy="50" r="36" fill="none" stroke="${c}" stroke-width="0.8"/>${g}
        <polygon points="${tri(-Math.PI / 2)}" fill="none" stroke="${c}" stroke-width="1.1"/><polygon points="${tri(Math.PI / 2)}" fill="none" stroke="${c}" stroke-width="1.1"/>${dots}
        <circle cx="50" cy="50" r="13" fill="none" stroke="${c}" stroke-width="1"/><path d="${star5(50, 50, 8)}" fill="none" stroke="${c}" stroke-width="0.9"/></svg>`,
        { size: 768 },
      );
    })(),
    orbA: svg(
      `<svg viewBox="0 0 200 100"><defs><linearGradient id="oa" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b8aa8"/><stop offset="0.5" stop-color="#3a4fd0"/><stop offset="1" stop-color="#8a3fd6"/></linearGradient>
      <radialGradient id="oh"><stop offset="0" stop-color="#c9fbff" stop-opacity="0.9"/><stop offset="1" stop-color="#c9fbff" stop-opacity="0"/></radialGradient></defs>
      <rect width="200" height="100" fill="url(#oa)"/><circle cx="60" cy="55" r="30" fill="url(#oh)"/><circle cx="140" cy="40" r="26" fill="url(#oh)"/><circle cx="175" cy="75" r="20" fill="url(#oh)"/>
      <path d="M0 70 Q40 40 80 62 T160 50 T200 60" stroke="#d8ffff" stroke-width="3" fill="none" opacity="0.5"/><path d="M0 30 Q50 10 100 30 T200 22" stroke="#e8d0ff" stroke-width="2.5" fill="none" opacity="0.5"/>
      <circle cx="30" cy="20" r="1.6" fill="#fff"/><circle cx="75" cy="78" r="1.4" fill="#fff"/><circle cx="125" cy="15" r="1.8" fill="#fff"/><circle cx="150" cy="82" r="1.4" fill="#fff"/><circle cx="185" cy="35" r="1.6" fill="#fff"/>
      <ellipse cx="90" cy="28" rx="11" ry="6" fill="#ffffff" opacity="0.8"/></svg>`,
      { size: 256 },
    ),
    orbB: svg(
      `<svg viewBox="0 0 200 100"><defs><linearGradient id="ob" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9f5a"/><stop offset="0.5" stop-color="#e0407a"/><stop offset="1" stop-color="#6a2fb0"/></linearGradient>
      <radialGradient id="oi"><stop offset="0" stop-color="#fff2c9" stop-opacity="0.9"/><stop offset="1" stop-color="#fff2c9" stop-opacity="0"/></radialGradient></defs>
      <rect width="200" height="100" fill="url(#ob)"/><circle cx="55" cy="50" r="28" fill="url(#oi)"/><circle cx="135" cy="60" r="30" fill="url(#oi)"/><circle cx="180" cy="25" r="18" fill="url(#oi)"/>
      <path d="M0 45 Q40 70 80 45 T160 40 T200 50" stroke="#ffe9ff" stroke-width="3" fill="none" opacity="0.5"/>
      <circle cx="25" cy="25" r="1.6" fill="#fff"/><circle cx="110" cy="85" r="1.6" fill="#fff"/><circle cx="160" cy="12" r="1.6" fill="#fff"/><circle cx="70" cy="90" r="1.4" fill="#fff"/>
      <ellipse cx="90" cy="28" rx="11" ry="6" fill="#ffffff" opacity="0.8"/></svg>`,
      { size: 256 },
    ),
    label: svg(
      `<svg viewBox="0 0 40 40"><rect x="3" y="3" width="34" height="34" rx="5" fill="#f3e8c9" stroke="#6b4a2a" stroke-width="2"/><path d="${star5(20, 21, 11)}" fill="#6a2f8f"/><circle cx="20" cy="21" r="2.4" fill="#f3e8c9"/></svg>`,
      { size: 128 },
    ),
    pageRunes: (() => {
      let rows = "";
      for (let i = 0; i < 8; i++) {
        const y = 62 + i * 7;
        let d = "";
        let x = 10;
        while (x < 72) {
          const w = 2 + TR() * 6;
          d += `M${x.toFixed(1)} ${y} h${w.toFixed(1)}`;
          x += w + 2 + TR() * 2.5;
        }
        rows += `<path d="${d}" stroke="#8ff5ff" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
      }
      return svg(
        `<svg viewBox="0 0 85 120"><g stroke="#8ff5ff" stroke-width="1.5" fill="none" stroke-linejoin="round"><circle cx="42.5" cy="30" r="22"/><circle cx="42.5" cy="30" r="7"/>
        <polygon points="42.5,10 61.5,41 23.5,41"/></g>${rows}</svg>`,
        { size: 256 },
      );
    })(),
  };

  // ------------------------------------------------------------------ palette
  const WOOD_V = grain("#45245a", "#6c3d84", { size: 0.03, axis: "y", seed: 2 });
  const WOOD_H = grain("#45245a", "#6c3d84", { size: 0.03, axis: "x", seed: 2 });
  const WOOD_LT = grain("#703f88", "#8d57a6", { size: 0.025, axis: "y", seed: 6 });
  const NAVY = mottle("#26225f", "#3a3585", { size: 0.1, seed: 4 });
  const GILT = metal("gilt");
  const BRASS = metal("brass", { tarnish: 0.35 });
  const STONE1 = scales(["#7a7896", "#6f6d8d", "#8582a2"], "#3c3a55", { size: 0.2, seed: 2 });
  const STONE2 = scales(["#9390b0", "#8a87a8"], "#4a4766", { size: 0.16, seed: 3 });
  const PARCH = mottle("#ecdcae", "#d9c38a", { size: 0.05, seed: 8 });
  const PAGES = stripes("#f3e8c9", "#d6c79b", { size: 0.008, axis: "y", width: 0.5, wobble: 0.2 });
  const WICKER = stripes("#b0803f", "#7a5128", { size: 0.032, axis: "y", width: 0.5 });
  const CREAM = "#f3e8c9";
  const BONE = "#eee4cc";
  const CYAN = "#7ee8ff";
  const BOOKC = ["#b3263f", "#1f8f93", "#3552b8", "#2e8650", "#8a35a3", "#d08a22", "#3da4dc", "#e0587f", "#252a6e", "#c85a2a", "#6b2a3e"];
  const WAX = ["#f6ecd2", "#d9c3ee", "#f0d9b5"];
  const SPINES = [T.gold, T.silver, T.rune, T.eye];

  // ------------------------------------------------------------------ dais
  put(new THREE.CylinderGeometry(1.5, 1.55, 0.06, 10), STONE1, [0, 0.03, 0], [0, 0, 0], undefined, { flat: true });
  put(new THREE.CylinderGeometry(1.3, 1.34, 0.06, 10), STONE2, [0, 0.09, 0], [0, 0, 0], undefined, { flat: true });
  glow(put(new THREE.TorusGeometry(1.26, 0.012, 4, 40), CYAN, [0, 0.121, 0], [90, 0, 0]), 1);
  for (let i = 0; i < 10; i++) {
    const a = ((i + 0.5) / 10) * Math.PI * 2;
    glow(
      put(new THREE.OctahedronGeometry(0.035, 0), i % 2 ? "#ff8fd0" : CYAN, [Math.cos(a) * 1.43, 0.085, Math.sin(a) * 1.43], [0, 0, 0], undefined, { flat: true }),
      1,
    );
  }
  glow(
    put(new THREE.PlaneGeometry(1.0, 1.0), "#ffffff", [0, 0.124, 0.62], [-90, 0, 0], undefined, { texture: T.floorRune }),
    0.9,
  );

  // ------------------------------------------------------------------ case
  const TOP = 2.19;
  box(1.6, 0.18, 0.46, WOOD_H, 0, 0.21, 0);
  box(1.62, 0.025, 0.48, GILT, 0, 0.3125, 0);
  box(1.62, 0.02, 0.48, GILT, 0, 0.13, 0);
  for (const s of [1, -1]) box(0.06, 1.83, 0.44, WOOD_V, s * 0.72, 1.215, 0);
  box(1.62, 0.06, 0.48, WOOD_H, 0, 2.13, 0);
  box(1.66, 0.03, 0.5, GILT, 0, 2.175, 0);
  for (let i = 0; i < 21; i++) box(0.032, 0.03, 0.02, GILT, -0.7 + i * 0.07, 2.085, 0.225);
  box(1.44, 1.8, 0.03, "#1d1948", 0, 1.2, -0.205);
  put(new THREE.PlaneGeometry(1.38, 1.28), "#ffffff", [0, 1.47, -0.186], [0, 0, 0], CASE, { texture: T.starry });
  for (const y of [0.82, 1.26, 1.7]) {
    box(1.44, 0.04, 0.42, WOOD_H, 0, y, 0);
    box(1.44, 0.022, 0.012, GILT, 0, y, 0.213);
  }

  // cabinet doors
  for (const s of [1, -1]) {
    box(0.7, 0.46, 0.03, WOOD_V, s * 0.355, 0.55, 0.2);
    box(0.54, 0.34, 0.01, GILT, s * 0.355, 0.55, 0.2175);
    box(0.5, 0.3, 0.015, WOOD_LT, s * 0.355, 0.55, 0.2225);
    put(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", [s * 0.355, 0.55, 0.2312], [0, 0, 0], CASE, { texture: T.emblem });
    put(new THREE.TorusGeometry(0.022, 0.006, 5, 10), GILT, [s * 0.05, 0.55, 0.238], [0, 0, 0], CASE);
    for (const y of [0.4, 0.7]) box(0.035, 0.07, 0.012, GILT, s * 0.685, y, 0.222);
  }

  // turned posts with golden vines
  for (const s of [1, -1]) {
    const px = s * 0.76;
    const pz = CZ(0.2);
    lathe([[0, 0], [0.04, 0], [0.04, 1.83], [0, 1.83]], [px, 0.3, pz], WOOD_V, 8);
    lathe([[0, 0], [0.058, 0], [0.058, 0.05], [0.042, 0.085], [0, 0.085]], [px, 0.3, pz], GILT, 8);
    lathe([[0, 0], [0.042, 0], [0.058, 0.03], [0.058, 0.08], [0, 0.08]], [px, 2.05, pz], GILT, 8);
    b.sweep(
      spiral([px, 0.4, pz], [px + 0.044, 0.4, pz], [0, 1, 0], { turns: 7, pitch: 0.235 }),
      0.007,
      { color: GILT, bone: root, sides: 5 },
    );
    lathe([[0, 0], [0.04, 0], [0.04, 0.02], [0.022, 0.045], [0.03, 0.075], [0.018, 0.1], [0, 0.17]], [px + s * 0.01, TOP, pz], GILT, 8);
    glow(put(new THREE.SphereGeometry(0.014, 6, 4), CYAN, [px + s * 0.01, TOP + 0.18, pz]), 1.2);
  }

  // gable crown
  const gable = (k: number): any[] => {
    const half = [[0.42, 0], [0.42, 0.08], [0.33, 0.17], [0.25, 0.26], [0.15, 0.36], [0.06, 0.45]];
    const f = (y: number) => 0.22 + (y - 0.22) * k;
    return [
      ...half.map(([x, y]) => [x * k, f(y)]),
      [0, f(0.52), "sharp"],
      ...[...half].reverse().map(([x, y]) => [-x * k, f(y)]),
    ];
  };
  b.extrude(gable(1.13), { at: [0, TOP, CZ(0.02)], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.3, bevel: 0.006, color: GILT, bone: root });
  b.extrude(gable(1), { at: [0, TOP, CZ(0.02)], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.34, bevel: 0.006, color: NAVY, bone: root });
  glow(put(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", [0, TOP + 0.27, CZ(0.192)], [0, 0, 0], undefined, { texture: T.emblem }), 1);
  // crescent finial
  const cres: number[][] = [];
  const Ro = 0.09;
  const Ri = 0.075;
  const cc = 0.04;
  const a0 = 55.3 * DEG;
  for (let i = 0; i <= 8; i++) {
    const a = a0 + (i / 8) * (2 * Math.PI - 2 * a0);
    cres.push([Ro * Math.cos(a), Ro * Math.sin(a)]);
  }
  for (let i = 1; i < 8; i++) {
    const a = (278.6 - (i / 8) * (278.6 - 81.4)) * DEG;
    cres.push([cc + Ri * Math.cos(a), Ri * Math.sin(a)]);
  }
  const fy = TOP + 0.22 + 0.3 * 1.13;
  b.cylinderPlaceholder?.();
  put(new THREE.CylinderGeometry(0.008, 0.012, 0.1, 6), GILT, [0, fy + 0.03, CZ(0.02)]);
  glow(
    b.extrude(cres as [number, number][], { at: [0, fy + 0.15, CZ(0.02)], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014, color: "#ffd966", bone: root }),
    1.2,
  );
  glow(put(new THREE.SphereGeometry(0.02, 6, 4), "#ffd966", [0.05, fy + 0.15, CZ(0.02)]), 1.4);

  // ------------------------------------------------------------------ prop builders
  const upBook = (
    x: number, y0: number, w: number, h: number, d: number, col: string,
    tex: THREE.Texture | null, lean = 0, dz: number = 0.17 - d / 2, par: THREE.Matrix4 | undefined = CASE,
  ) => {
    const lift = lean ? (w / 2) * Math.sin(Math.abs(lean) * DEG) : 0;
    put(new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), col, [x, y0 + lift, dz], [0, 0, lean], par);
    if (tex)
      put(new THREE.PlaneGeometry(w * 0.96, h * 0.94).translate(0, h / 2, d / 2 + 0.0015), "#ffffff", [x, y0 + lift, dz], [0, 0, lean], par, { texture: tex });
  };
  const row = (x0: number, x1: number, y0: number, hMax: number) => {
    let x = x0;
    for (;;) {
      const w = 0.032 + R() * 0.034;
      if (x + w > x1) break;
      const h = 0.25 + R() * (hMax - 0.25);
      const d = 0.23 + R() * 0.07;
      const col = BOOKC[Math.floor(R() * BOOKC.length)];
      const tex = R() < 0.82 ? SPINES[Math.floor(R() * SPINES.length)] : null;
      upBook(x + w / 2, y0, w, h, d, col, tex);
      x += w + 0.002;
    }
    return x;
  };
  const leanEnd = (e: number, y0: number, col: string, tex: THREE.Texture) => {
    const w = 0.04;
    const h = 0.3;
    upBook(e + h * Math.sin(15 * DEG) + w / 2 + 0.012, y0, w, h, 0.26, col, tex, 15);
  };
  const lying = (
    cx: number, y0: number, dz: number, L: number, Th: number, D: number, col: string,
    tex: THREE.Texture | null, yaw: number, par?: THREE.Matrix4,
  ) => {
    const M = (par ? par.clone() : new THREE.Matrix4()).multiply(mat([cx, y0, dz], [0, yaw, 0]));
    const bt = 0.012;
    const s = (g: THREE.BufferGeometry, c: any, p: number[], opt: { texture?: THREE.Texture } = {}) =>
      put(g.translate(p[0], p[1], p[2]), c, [0, 0, 0], [0, 0, 0], M, opt);
    s(new THREE.BoxGeometry(L, Th, 0.016), col, [0, Th / 2, D / 2 - 0.008]);
    s(new THREE.BoxGeometry(L, bt, D), col, [0, bt / 2, 0]);
    s(new THREE.BoxGeometry(L, bt, D), col, [0, Th - bt / 2, 0]);
    s(new THREE.BoxGeometry(L - 0.02, Th - 2 * bt + 0.002, D - 0.026), PAGES, [0, Th / 2, -0.005]);
    if (tex) s(new THREE.PlaneGeometry(Th * 0.9, L * 0.9).rotateZ(-Math.PI / 2), "#ffffff", [0, Th / 2, D / 2 + 0.0015], { texture: tex });
    s(new THREE.BoxGeometry(0.02, Th + 0.004, 0.02), GILT, [L / 2 - 0.01, Th / 2, D / 2 - 0.01]);
    s(new THREE.BoxGeometry(0.02, Th + 0.004, 0.02), GILT, [-L / 2 + 0.01, Th / 2, D / 2 - 0.01]);
  };
  const FL_LO = [[0, 0], [0.011, 0.006], [0.015, 0.018], [0.012, 0.03], [0, 0.03]];
  const FL_HI = [[0, 0.028], [0.0125, 0.028], [0.009, 0.042], [0, 0.064]];
  const DISH = [[0, 0], [0.05, 0], [0.052, 0.008], [0.03, 0.016], [0, 0.016]];
  const candle = (x: number, y: number, z: number, r: number, h: number, wax: string, fk = 1, drips = 2) => {
    put(new THREE.CylinderGeometry(r, r * 1.05, h, 8), wax, [x, y + h / 2, z], [0, 0, 0], undefined, { flat: true });
    put(new THREE.CylinderGeometry(r * 0.8, r * 0.8, 0.006, 8), CREAM, [x, y + h, z]);
    put(new THREE.BoxGeometry(0.004, 0.016, 0.004), "#2a1a1a", [x, y + h + 0.01, z]);
    for (let i = 0; i < drips; i++) {
      const a = R() * Math.PI * 2;
      const len = 0.025 + R() * 0.05;
      put(new THREE.CapsuleGeometry(0.0065, len, 2, 5), wax, [x + Math.cos(a) * r, y + h - len / 2 - 0.004, z + Math.sin(a) * r]);
    }
    glow(lathe(FL_LO, [x, y + h + 0.014, z], "#ff9a30", 6, fk), 1.3);
    glow(lathe(FL_HI, [x, y + h + 0.014, z], "#ffe27a", 6, fk), 1.6);
  };
  const candleDish = (x: number, y: number, z: number, r: number, h: number, wax: string, fk = 1, drips = 2) => {
    const k = r / 0.025;
    lathe(DISH, [x, y, z], GILT, 8, k);
    candle(x, y + 0.014 * k, z, r, h, wax, fk, drips);
  };
  const STAND = [[0, 0], [0.065, 0], [0.067, 0.012], [0.032, 0.03], [0.022, 0.058], [0.045, 0.08], [0.05, 0.09], [0, 0.09]];
  const orb = (x: number, y: number, z: number, r: number, tex: THREE.Texture, str = 1.1) => {
    lathe(STAND, [x, y, z], GILT, 8);
    put(new THREE.TorusGeometry(r * 0.62, 0.008, 4, 10), GILT, [x, y + 0.09, z], [90, 0, 0]);
    glow(
      b.part(new THREE.SphereGeometry(r, 10, 8), "#ffffff", { bone: root, at: [x, y + 0.085 + r * 0.78, z], texture: tex, rotation: [0, -90, 0] }),
      str,
    );
  };
  const POTION = [[0, 0], [0.03, 0], [0.038, 0.018], [0.038, 0.04], [0.018, 0.066], [0.012, 0.082], [0.012, 0.1], [0.017, 0.104], [0, 0.104]];
  const potion = (x: number, y: number, z: number, col: string) => {
    glow(lathe(POTION, [x, y, z], col, 8), 0.45);
    put(new THREE.CylinderGeometry(0.012, 0.014, 0.024, 6), "#b88a56", [x, y + 0.114, z]);
    put(new THREE.PlaneGeometry(0.042, 0.042), "#ffffff", [x, y + 0.03, z + 0.0405], [0, 0, 0], undefined, { texture: T.label });
  };
  const hourglass = (x: number, y: number, z: number) => {
    glow(lathe([[0, 0], [0.04, 0], [0.046, 0.025], [0.012, 0.075], [0, 0.075]], [x, y + 0.018, z], "#f2b84b", 8), 0.5);
    lathe([[0, 0.075], [0.012, 0.075], [0.012, 0.095], [0.046, 0.145], [0.04, 0.17], [0, 0.17]], [x, y + 0.018, z], "#bfe7ff", 8);
    put(new THREE.CylinderGeometry(0.06, 0.06, 0.014, 8), GILT, [x, y + 0.011, z]);
    put(new THREE.CylinderGeometry(0.06, 0.06, 0.014, 8), GILT, [x, y + 0.196, z]);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      put(new THREE.CylinderGeometry(0.0035, 0.0035, 0.19, 4), GILT, [x + Math.cos(a) * 0.052, y + 0.104, z + Math.sin(a) * 0.052]);
    }
  };
  const SCROLL_C = "#cfae6a";
  const scroll = (x: number, y: number, z: number, len: number, r: number, rot: number[], ribbon: string, par?: THREE.Matrix4) => {
    const M = (par ? par.clone() : new THREE.Matrix4()).multiply(mat([x, y, z], rot));
    const s = (g: THREE.BufferGeometry, c: any) => put(g, c, [0, 0, 0], [0, 0, 0], M);
    s(new THREE.CylinderGeometry(r, r, len, 10).rotateZ(Math.PI / 2), PARCH);
    for (const sg of [1, -1]) {
      s(new THREE.CylinderGeometry(r * 0.7, r * 0.7, 0.01, 8).rotateZ(Math.PI / 2).translate(sg * (len / 2 + 0.003), 0, 0), SCROLL_C);
      s(new THREE.SphereGeometry(r * 0.6, 6, 4).translate(sg * (len / 2 + 0.022), 0, 0), GILT);
    }
    s(new THREE.TorusGeometry(r + 0.004, 0.0055, 4, 10).rotateY(Math.PI / 2).translate(len * 0.18, 0, 0), ribbon);
    s(new THREE.BoxGeometry(0.008, 0.045, 0.003).translate(len * 0.18, -0.02, r + 0.006), ribbon);
    s(new THREE.SphereGeometry(0.011, 6, 4).scale(1, 1, 0.5).translate(len * 0.18, r * 0.4, r + 0.006), "#a31d2f");
  };
  const skull = (x: number, y: number, z: number) => {
    put(new THREE.SphereGeometry(0.05, 8, 6).scale(1, 0.95, 1.08), BONE, [x, y + 0.07, z]);
    put(new THREE.BoxGeometry(0.058, 0.03, 0.06), BONE, [x, y + 0.02, z + 0.012]);
    put(new THREE.BoxGeometry(0.05, 0.004, 0.004), "#2b1a30", [x, y + 0.027, z + 0.043]);
    put(new THREE.BoxGeometry(0.01, 0.014, 0.006), "#2b1a30", [x, y + 0.05, z + 0.054]);
    for (const s of [1, -1]) glow(put(new THREE.SphereGeometry(0.013, 5, 4).scale(1, 1.1, 0.6), CYAN, [x + s * 0.02, y + 0.07, z + 0.047]), 0.9);
  };

  // ------------------------------------------------------------------ bay contents
  const y1 = 0.84;
  const y2 = 1.28;
  const y3 = 1.72;

  // bay 1
  let e = row(-0.68, -0.28, y1, 0.36);
  leanEnd(e, y1, "#c85a2a", T.silver);
  lying(0.1, y1, 0.0, 0.34, 0.07, 0.26, "#8a35a3", T.gold, 3);
  lying(0.12, y1 + 0.07, 0.01, 0.3, 0.06, 0.24, "#1f8f93", T.silver, -5);
  lying(0.09, y1 + 0.13, 0.0, 0.26, 0.055, 0.22, "#b3263f", T.rune, 7);
  orb(0.09, y1 + 0.185, CZ(0.0), 0.065, T.orbB);
  row(0.3, 0.6, y1, 0.37);
  candleDish(0.645, y1, CZ(0.03), 0.022, 0.1, WAX[1], 0.9);

  // bay 2
  potion(-0.63, y2, CZ(0.1), "#e84a8a");
  potion(-0.54, y2, CZ(0.1), "#3ad6a0");
  potion(-0.45, y2, CZ(0.1), "#8a6bf0");
  hourglass(-0.3, y2, CZ(0.06));
  e = row(-0.2, 0.1, y2, 0.35);
  leanEnd(e, y2, "#3552b8", T.gold);
  orb(0.34, y2, CZ(0.0), 0.07, T.orbA);
  scroll(0.56, y2 + 0.03, CZ(-0.035), 0.18, 0.03, [0, 6, 0], "#c8344a", undefined);
  scroll(0.57, y2 + 0.03, CZ(0.045), 0.18, 0.03, [0, -8, 0], "#3a62d0", undefined);
  scroll(0.565, y2 + 0.082, CZ(0.005), 0.18, 0.03, [0, 3, 0], "#c8344a", undefined);

  // bay 3: candelabra, tall tomes, skull
  {
    const cx = -0.55;
    const cz = CZ(0.05);
    lathe([[0, 0], [0.07, 0], [0.07, 0.01], [0.025, 0.03], [0.012, 0.05], [0.012, 0.16], [0.02, 0.17], [0, 0.17]], [cx, y3, cz], GILT, 8);
    for (const s of [1, -1]) {
      b.sweep(
        catmull([[cx, y3 + 0.14, cz], [cx + s * 0.04, y3 + 0.125, cz], [cx + s * 0.085, y3 + 0.15, cz], [cx + s * 0.095, y3 + 0.19, cz]]),
        0.006,
        { color: GILT, bone: root, sides: 5 },
      );
      candleDish(cx + s * 0.095, y3 + 0.19, cz, 0.016, 0.07, WAX[0], 0.8, 1);
    }
    candleDish(cx, y3 + 0.17, cz, 0.018, 0.1, WAX[2], 0.9, 2);
  }
  e = row(-0.36, 0.2, y3, 0.37);
  leanEnd(e, y3, "#2e8650", T.rune);
  lying(0.5, y3, 0.0, 0.26, 0.055, 0.22, "#6b2a3e", T.eye, -4);
  lying(0.52, y3 + 0.055, 0.0, 0.2, 0.045, 0.18, "#d08a22", T.gold, 9);
  skull(0.5, y3 + 0.1, CZ(0.0));
  candle(0.5, y3 + 0.1 + 0.115, CZ(0.0), 0.017, 0.07, WAX[0], 0.8, 3);

  // ------------------------------------------------------------------ top of the case
  {
    const ax = -0.6;
    const az = CZ(0.0);
    const yc = TOP + 0.22;
    lathe([[0, 0], [0.07, 0], [0.07, 0.01], [0.025, 0.03], [0.02, 0.07], [0, 0.07]], [ax, TOP, az], BRASS, 8);
    put(new THREE.CylinderGeometry(0.008, 0.008, 0.09, 5), BRASS, [ax, TOP + 0.09, az]);
    put(new THREE.TorusGeometry(0.11, 0.005, 4, 20), GILT, [ax, yc, az], [90, 0, 0]);
    put(new THREE.TorusGeometry(0.11, 0.005, 4, 20), GILT, [ax, yc, az], [0, 0, 0]);
    put(new THREE.TorusGeometry(0.11, 0.005, 4, 20), GILT, [ax, yc, az], [0, 90, 0]);
    put(new THREE.TorusGeometry(0.125, 0.004, 4, 20), GILT, [ax, yc, az], [70, 0, 20]);
    put(new THREE.CylinderGeometry(0.004, 0.004, 0.3, 5), BRASS, [ax, yc, az], [0, 0, 23]);
    glow(put(new THREE.SphereGeometry(0.03, 8, 6), CYAN, [ax, yc, az]), 1.3);
    glow(put(new THREE.SphereGeometry(0.014, 6, 4), "#ff8fd0", [ax + 0.11, yc, az]), 1.2);
  }
  lying(0.6, TOP, CZ(0.0), 0.24, 0.055, 0.2, "#2e8650", T.gold, -6);
  lying(0.59, TOP + 0.055, CZ(0.0), 0.2, 0.05, 0.18, "#3552b8", T.silver, 8);
  candleDish(0.62, TOP + 0.105, CZ(0.0), 0.028, 0.15, WAX[0], 1.1, 3);
  candleDish(0.51, TOP + 0.105, CZ(0.03), 0.02, 0.08, WAX[1], 0.9, 2);

  // ------------------------------------------------------------------ dais props
  // tall candelabra
  {
    const cx = 1.0;
    const cy = 0.12;
    const cz = 0.25;
    lathe(
      [[0, 0], [0.14, 0], [0.14, 0.025], [0.07, 0.07], [0.02, 0.12], [0.02, 0.28], [0.035, 0.31], [0.02, 0.34], [0.02, 0.6], [0.035, 0.63], [0.02, 0.66], [0.02, 0.98], [0.05, 1.0], [0.05, 1.02], [0, 1.02]],
      [cx, cy, cz], GILT, 8,
    );
    for (const s of [1, -1]) {
      b.sweep(
        catmull([[cx, cy + 0.93, cz], [cx + s * 0.06, cy + 0.9, cz], [cx + s * 0.14, cy + 0.95, cz], [cx + s * 0.17, cy + 1.03, cz]]),
        0.011,
        { color: GILT, bone: root, sides: 6 },
      );
      candleDish(cx + s * 0.17, cy + 1.03, cz, 0.026, 0.15, WAX[s > 0 ? 1 : 2], 1.2, 3);
    }
    candleDish(cx, cy + 1.02, cz, 0.03, 0.22, WAX[0], 1.3, 3);
  }

  // book stack with a great candle
  lying(-0.95, 0.12, 0.3, 0.4, 0.07, 0.28, "#3552b8", T.gold, 12);
  lying(-0.93, 0.19, 0.3, 0.36, 0.06, 0.26, "#b3263f", T.rune, -18);
  lying(-0.96, 0.25, 0.3, 0.34, 0.07, 0.25, "#1f8f93", T.silver, 25);
  lying(-0.94, 0.32, 0.3, 0.28, 0.05, 0.22, "#8a35a3", T.eye, -8);
  candleDish(-0.94, 0.37, 0.3, 0.05, 0.24, WAX[0], 1.8, 4);

  // scroll basket
  {
    const bx = 0.8;
    const bz = 0.6;
    lathe([[0, 0], [0.13, 0], [0.17, 0.04], [0.19, 0.28], [0.2, 0.3], [0.17, 0.3], [0.16, 0.26], [0.125, 0.05], [0, 0.05]], [bx, 0.12, bz], WICKER, 10);
    put(new THREE.TorusGeometry(0.188, 0.01, 4, 12), GILT, [bx, 0.42, bz], [90, 0, 0]);
    const specs = [
      [72, 20, "#c8344a"], [80, 90, "#3a62d0"], [76, 160, "#c8344a"], [84, 230, "#3a62d0"], [70, 300, "#c8344a"],
    ];
    for (const [rz, yaw, rib] of specs as [number, number, string][]) {
      const len = 0.5;
      const cr = Math.cos(rz * DEG);
      const u = [cr * Math.cos(yaw * DEG), Math.sin(rz * DEG), -cr * Math.sin(yaw * DEG)];
      const bot = [bx + Math.cos(yaw * DEG) * 0.03, 0.2, bz - Math.sin(yaw * DEG) * 0.03];
      scroll(bot[0] + u[0] * len / 2, bot[1] + u[1] * len / 2, bot[2] + u[2] * len / 2, len, 0.028, [0, yaw, rz], rib);
    }
  }
  scroll(-0.45, 0.15, 0.95, 0.3, 0.03, [0, 20, 0], "#c8344a");
  scroll(0.25, 0.15, 1.02, 0.28, 0.03, [0, -25, 0], "#3a62d0");

  // levitating spellbook
  {
    const BM = mat([-0.95, 1.25, 0.35], [58, 28, 0]);
    for (const s of [1, -1]) {
      const ang = s * 12;
      put(new THREE.BoxGeometry(0.2, 0.01, 0.28).translate(s * 0.1, 0, 0), "#b3263f", [0, 0, 0], [0, 0, ang], BM);
      put(new THREE.BoxGeometry(0.19, 0.03, 0.26).translate(s * 0.1, 0.02, 0), PAGES, [0, 0, 0], [0, 0, ang], BM);
      glow(
        put(new THREE.PlaneGeometry(0.17, 0.24).rotateX(-Math.PI / 2).translate(s * 0.1, 0.0355, 0), "#ffffff", [0, 0, 0], [0, 0, ang], BM, { texture: T.pageRunes }),
        1,
      );
    }
    put(new THREE.CylinderGeometry(0.014, 0.014, 0.28, 6).rotateX(Math.PI / 2), GILT, [0, 0, 0], [0, 0, 0], BM);
    glow(put(new THREE.TorusGeometry(0.26, 0.004, 4, 28), CYAN, [0, -0.07, 0], [90, 0, 0], BM), 1);
    glow(put(new THREE.TorusGeometry(0.32, 0.003, 4, 28), "#ff8fd0", [0, -0.1, 0], [90, 0, 0], BM), 0.9);
    [20, 140, 260].forEach((a, i) => {
      glow(
        put(new THREE.SphereGeometry(0.022, 6, 4), i % 2 ? "#ff8fd0" : CYAN, [0.32 * Math.cos(a * DEG), -0.09, 0.32 * Math.sin(a * DEG)], [0, 0, 0], BM),
        1.3,
      );
    });
  }

  // floating star motes
  const starOutline = (s: number): [number, number][] => [
    [0, s], [s * 0.2, s * 0.2], [s, 0], [s * 0.2, -s * 0.2], [0, -s], [-s * 0.2, -s * 0.2], [-s, 0], [-s * 0.2, s * 0.2],
  ];
  const motes: number[][] = [
    [-1.25, 1.9, 0.5, 0.045], [-0.7, 2.5, 0.5, 0.035], [0.9, 2.3, 0.4, 0.05], [1.1, 1.65, -0.1, 0.035],
    [1.2, 0.95, 0.8, 0.04], [-1.1, 0.75, 0.85, 0.035], [0.3, 2.95, 0.2, 0.04], [-0.3, 2.75, 0.35, 0.03],
    [0.6, 0.9, 0.95, 0.03], [1.35, 2.1, 0.2, 0.045], [-1.32, 1.45, 0.05, 0.03], [0.1, 1.05, 1.1, 0.035],
  ];
  for (const [mx, my, mz, ms] of motes) {
    glow(
      b.extrude(starOutline(ms), { at: [mx, my, mz], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.005, color: "#ffe9a0", bone: root }),
      1.4,
    );
  }

  return b.root;
}
```