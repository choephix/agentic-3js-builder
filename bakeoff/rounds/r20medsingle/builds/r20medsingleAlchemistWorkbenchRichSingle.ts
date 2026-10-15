import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { grain, mottle, spots } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "A Liyue-style alchemist's workbench: turned-leg table with drawers, a shelf hutch with glowing elemental potions, balance scale, alembic, open grimoires, drying herbs, a lantern and a bubbling cauldron on a rune rug.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type Col = string | Paint;
type P3 = [number, number, number];

const star = (cx: number, cy: number, R: number, r: number, n: number) => {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n - Math.PI / 2;
    const rr = i % 2 ? r : R;
    d += `${i ? "L" : "M"}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)} `;
  }
  return d + "Z";
};
const diamond = (cx: number, cy: number, s: number) =>
  `M${cx.toFixed(1)} ${(cy - s).toFixed(1)} L${(cx + s).toFixed(1)} ${cy.toFixed(1)} L${cx.toFixed(1)} ${(cy + s).toFixed(1)} L${(cx - s).toFixed(1)} ${cy.toFixed(1)} Z`;

type Kind = "round" | "tall" | "cone" | "gourd";
const PROF: Record<Kind, { pts: Array<[number, number]>; top: number; nr: number; hy: number; hr: number }> = {
  round: {
    pts: [[0, 0], [0.035, 0], [0.062, 0.018], [0.074, 0.055], [0.062, 0.095], [0.03, 0.122], [0.021, 0.14], [0, 0.14]],
    top: 0.14, nr: 0.021, hy: 0.06, hr: 0.072,
  },
  tall: {
    pts: [[0, 0], [0.032, 0], [0.036, 0.01], [0.036, 0.15], [0.022, 0.18], [0.018, 0.2], [0, 0.2]],
    top: 0.2, nr: 0.018, hy: 0.09, hr: 0.036,
  },
  cone: {
    pts: [[0, 0], [0.066, 0], [0.068, 0.01], [0.034, 0.1], [0.022, 0.125], [0, 0.125]],
    top: 0.125, nr: 0.022, hy: 0.05, hr: 0.05,
  },
  gourd: {
    pts: [[0, 0], [0.04, 0], [0.055, 0.02], [0.05, 0.05], [0.03, 0.075], [0.045, 0.11], [0.04, 0.14], [0.022, 0.155], [0, 0.155]],
    top: 0.155, nr: 0.022, hy: 0.04, hr: 0.052,
  },
};

const ELEM = {
  anemo: "#5ff2d2",
  pyro: "#ff7a3a",
  electro: "#b36cff",
  dendro: "#9be34a",
  hydro: "#4aa8ff",
  cryo: "#c4f4ff",
  geo: "#ffd24a",
};

export default function build() {
  const b = createBuilder({ name: "alchemistWorkbench", paintSize: 2048 });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);

  // ---------- palette (cel paints)
  const WOODTOP = cel(grain("#b97a45", "#a2662f", { size: 0.02, axis: [1, 0, 0] }));
  const WOOD = cel(grain("#a96b3a", "#8f5628", { size: 0.016, axis: [0, 1, 0] }));
  const DARK = cel(grain("#6b3b22", "#5a301b", { size: 0.014, axis: [1, 0, 0] }));
  const DARKY = cel(grain("#6b3b22", "#5a301b", { size: 0.014, axis: [0, 1, 0] }));
  const GOLDC = cel("#f3c34f", "#c0842a");
  const BRASS = cel("#d9a441", "#a8702a");
  const COPPER = cel("#e0804e", "#a4472f");
  const IRON = cel("#4a4658", "#2e2b3d");
  const PAGE = cel("#fbf0d4", "#dcc29a");
  const WINE = cel("#a6323c");
  const DEEP = cel("#2a4f86");
  const TEALC = cel("#2f8a8f");
  const PURPLE = cel("#6b4a9e");
  const GREENC = cel("#3f7d4a");
  const LEAFC = cel("#5fbf5b");
  const TERRA = cel("#d98a5a");
  const SOIL = cel("#5b3a28");
  const SACK = cel("#d8c08a");
  const CORK = cel("#c89a62");
  const STONE = cel(mottle("#cfc8ba", "#aea696", { size: 0.05 }));
  const INKP = cel("#2b2f5a");
  const JUG = cel("#4f8ec2");
  const GLASS = "#dff6f3";
  const WHITE = "#ffffff";
  const STRINGC = "#e9d9b0";
  const FLAME = "#ffb347";
  const FLAME2 = "#fff0b0";

  // ---------- textures
  const labelSvg = (sym: string) =>
    svg(
      `<svg viewBox="0 0 40 48"><rect x="2" y="2" width="36" height="44" rx="6" fill="#f8ecc8" stroke="#b8862b" stroke-width="2.4"/>${sym}</svg>`,
      { size: 96 },
    );
  const LBL = [
    labelSvg(`<path d="M20 9 Q31 25 27 33 Q24 40 20 40 Q16 40 13 33 Q9 25 20 9Z" fill="#3c8ee0"/><circle cx="17" cy="30" r="2.4" fill="#d8f0ff"/>`),
    labelSvg(`<path d="M20 8 Q34 20 20 40 Q6 20 20 8Z" fill="#4fae4a"/><path d="M20 14 L20 38" stroke="#2b6e2e" stroke-width="2"/>`),
    labelSvg(`<path d="${star(20, 24, 15, 6.5, 4)}" fill="#e9a62a"/><circle cx="20" cy="24" r="3" fill="#fff2b8"/>`),
  ];
  const EMB = svg(
    `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="27" fill="none" stroke="#f0c050" stroke-width="3"/><circle cx="30" cy="30" r="21" fill="none" stroke="#f0c050" stroke-width="1.6"/><path d="${star(30, 30, 18, 7, 8)}" fill="#f0c050"/><circle cx="30" cy="30" r="5" fill="#a6323c"/></svg>`,
    { size: 192 },
  );
  let lines = "";
  for (let i = 0; i < 12; i++)
    lines += `<path d="M12 ${28 + i * 8.2} L${i % 4 === 3 ? 62 : 88} ${28 + i * 8.2}" stroke="#7a5a3a" stroke-width="1.6" stroke-linecap="round"/>`;
  const PAGETEX = svg(
    `<svg viewBox="0 0 100 140"><rect width="100" height="140" fill="#fbf0d4"/><rect x="10" y="12" width="14" height="14" fill="#a6323c"/><path d="M13 23 L17 14 L21 23" stroke="#f0c050" stroke-width="2" fill="none"/><path d="M30 18 L88 18 M30 24 L80 24" stroke="#7a5a3a" stroke-width="1.6"/>${lines}<circle cx="75" cy="118" r="9" fill="#5fbf5b"/><path d="M75 110 L75 126" stroke="#2b6e2e" stroke-width="1.6"/></svg>`,
    { size: 256 },
  );
  let latt = "";
  for (let i = -6; i < 28; i++) {
    latt += `<path d="M${i * 16} 0 L${i * 16 + 88} 88 M${i * 16 + 88} 0 L${i * 16} 88" stroke="#d9a441" stroke-opacity="0.55" stroke-width="0.9"/>`;
  }
  let dotsP = "";
  for (let i = 0; i < 14; i++) for (let j = 0; j < 6; j++) dotsP += `<circle cx="${i * 16 + 8}" cy="${j * 16 + 8}" r="1.5" fill="#f0c050" fill-opacity="0.7"/>`;
  const PANEL = svg(`<svg viewBox="0 0 208 88"><rect width="208" height="88" fill="#1f4560"/>${latt}${dotsP}</svg>`, { size: 512 });
  const RUNNER = svg(
    `<svg viewBox="0 0 140 90"><rect width="140" height="90" fill="#2f6f86"/><rect x="3" y="3" width="134" height="84" fill="none" stroke="#f0c050" stroke-width="2"/><rect x="8" y="8" width="124" height="74" fill="none" stroke="#f0c050" stroke-width="1" stroke-dasharray="3 2"/><path d="${diamond(70, 45, 30)}" fill="#1b3f56" stroke="#f0c050" stroke-width="1.5"/><path d="${star(70, 45, 20, 8, 8)}" fill="#f0c050"/><circle cx="70" cy="45" r="4" fill="#a6323c"/><path d="${diamond(20, 45, 8)}" fill="#f0c050"/><path d="${diamond(120, 45, 8)}" fill="#f0c050"/></svg>`,
    { size: 384 },
  );
  let strands = "";
  for (let i = 0; i < 7; i++) strands += `<path d="M${12 + (i - 3) * 0.8} 84 L${12 + (i - 3) * 1.55} 3" stroke="${i % 2 ? "#f0c050" : "#d9902a"}" stroke-width="1.7" stroke-linecap="round"/>`;
  const TASSEL = svg(
    `<svg viewBox="0 0 24 100"><circle cx="12" cy="93" r="6" fill="#d9902a"/><rect x="7" y="82" width="10" height="5" fill="#a6323c"/>${strands}</svg>`,
    { size: 192 },
  );
  const sprigSvg = (stem: string, leaf: string, flower: string | null) => {
    let s = `<path d="M20 100 L20 12" stroke="${stem}" stroke-width="3"/>`;
    for (let i = 0; i < 5; i++) {
      const y = 90 - i * 15;
      s += `<ellipse cx="${12}" cy="${y}" rx="9" ry="4" fill="${leaf}" transform="rotate(-30 12 ${y})"/><ellipse cx="${28}" cy="${y - 6}" rx="9" ry="4" fill="${leaf}" transform="rotate(30 28 ${y - 6})"/>`;
    }
    if (flower) for (let i = 0; i < 6; i++) s += `<ellipse cx="${20 + (i % 2 ? 2.5 : -2.5)}" cy="${6 + i * 4.5}" rx="3.4" ry="3" fill="${flower}"/>`;
    return svg(`<svg viewBox="0 0 40 100">${s}</svg>`, { size: 192 });
  };
  const HERB1 = sprigSvg("#3f7d4a", "#5fbf5b", null);
  const HERB2 = sprigSvg("#4a8a52", "#79c06a", "#a66cf0");
  const HERB3 = sprigSvg("#9a7a3a", "#e0b84a", "#f4d46a");
  const LEAF = svg(
    `<svg viewBox="0 0 48 64"><path d="M24 62 L24 52" stroke="#3a7a3a" stroke-width="4"/><path d="M24 54 Q4 40 8 14 Q14 4 24 2 Q34 4 40 14 Q44 40 24 54Z" fill="#5fbf5b"/><path d="M24 54 Q24 30 24 6" stroke="#2f8a3a" stroke-width="2.6" fill="none"/><path d="M24 40 L12 28 M24 30 L36 18 M24 22 L14 12" stroke="#3aa04a" stroke-width="2" fill="none"/></svg>`,
    { size: 160 },
  );
  let rugDots = "";
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2;
    rugDots += `<path d="${diamond(140 + 127 * Math.cos(a), 98 + 85 * Math.sin(a), 3.4)}" fill="#f0c050"/>`;
  }
  let rugStars = "";
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    rugStars += `<circle cx="${(140 + 100 * Math.cos(a)).toFixed(1)}" cy="${(98 + 62 * Math.sin(a)).toFixed(1)}" r="2.4" fill="#e7b94d"/>`;
  }
  const RUG = svg(
    `<svg viewBox="0 0 280 196"><ellipse cx="140" cy="98" rx="139" ry="97" fill="#7a2f45"/><ellipse cx="140" cy="98" rx="132" ry="90" fill="none" stroke="#f0c050" stroke-width="2.5"/>${rugDots}<ellipse cx="140" cy="98" rx="121" ry="79" fill="#245c6e"/><ellipse cx="140" cy="98" rx="111" ry="70" fill="none" stroke="#e7b94d" stroke-width="1.4" stroke-dasharray="4 3"/>${rugStars}<circle cx="140" cy="98" r="54" fill="#1b3f56"/><circle cx="140" cy="98" r="54" fill="none" stroke="#f0c050" stroke-width="1.6"/><path d="${star(140, 98, 50, 22, 8)}" fill="#f0c050"/><path d="${star(140, 98, 36, 16, 8)}" fill="#7a2f45"/><circle cx="140" cy="98" r="13" fill="#f6dc7a"/><circle cx="140" cy="98" r="5" fill="#a6323c"/><path d="${star(52, 98, 18, 8, 6)}" fill="#f0c050"/><path d="${star(228, 98, 18, 8, 6)}" fill="#f0c050"/></svg>`,
    { size: 768 },
  );

  // ---------- helpers
  const box = (w: number, h: number, d: number, c: Col, at: P3, o: PartOptions = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: Col, at: P3, o: PartOptions = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at, ...o });
  const ball = (r: number, c: Col, at: P3, scale: number | P3 = 1, seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(4, Math.round(seg / 2))), c, { at, scale });
  const tor = (Rr: number, t: number, c: Col, at: P3, o: PartOptions = {}, seg = 14) =>
    b.part(new THREE.TorusGeometry(Rr, t, 5, seg), c, { at, rotation: [90, 0, 0], ...o });
  const cone = (r: number, h: number, seg: number, c: Col, at: P3, o: PartOptions = {}) =>
    b.part(new THREE.ConeGeometry(r, h, seg), c, { at, ...o });
  const yawV = (yaw: number, v: P3): P3 => {
    const c = Math.cos((yaw * Math.PI) / 180);
    const s = Math.sin((yaw * Math.PI) / 180);
    return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
  };
  const lathe = (pts: Array<[number, number]>, c: Col, at: P3, seg = 10, s = 1) =>
    b.lathe(
      pts.map(([x, y]) => [x * s, y * s] as OutlinePoint),
      { at, color: c, segments: seg },
    );

  const potion = (at: P3, kind: Kind, liquid: string, s = 1, tag?: THREE.Texture) => {
    const [x, y, z] = at;
    const pr = PROF[kind];
    glow(lathe(pr.pts, liquid, at, 10, s));
    const nr = pr.nr * s;
    const top = pr.top * s;
    const nh = 0.07 * s;
    cyl(nr, nr * 1.1, nh, 8, GLASS, [x, y + top + nh / 2 - 0.004 * s, z]);
    tor(nr * 1.18, 0.0045 * s, GOLDC, [x, y + top + nh * 0.35, z]);
    cyl(nr * 1.3, nr * 1.3, 0.008 * s, 8, GOLDC, [x, y + top + nh, z]);
    cyl(nr * 0.85, nr * 0.7, 0.03 * s, 8, CORK, [x, y + top + nh + 0.014 * s, z]);
    ball(0.008 * s, WHITE, [x - pr.hr * 0.45 * s, y + pr.hy * s, z + pr.hr * 0.87 * s], [0.5, 2.4, 0.4], 5);
    if (tag)
      b.part(new THREE.PlaneGeometry(0.032 * s, 0.04 * s), WHITE, {
        at: [x, y + top + nh * 0.2, z + nr * 1.3 + 0.002 * s],
        dir: [0, 0, 1],
        axis: "z",
        texture: tag,
      });
  };

  const sprigs = (c: P3, n: number, tex: THREE.Texture, size: [number, number], lean: number, bend: number, spread = 0.8) => {
    const angs = Array.from({ length: n }, (_, i) => (i / n) * Math.PI * 2 + R() * 0.4);
    b.cards(
      angs.map((a) => frame(c, [Math.cos(a) * spread, 1, Math.sin(a) * spread])),
      tex,
      {
        size,
        lean,
        bend,
        vary: 0.25,
        spin: 15,
        rng: R,
        cross: true,
        flow: (_f, i) => [Math.cos(angs[i]), 0, Math.sin(angs[i])],
        sink: 0.15,
      },
    );
  };

  const lyingBook = (c: P3, yaw: number, W: number, T: number, L: number, cover: Col) => {
    const at = (v: P3): P3 => {
      const r = yawV(yaw, v);
      return [c[0] + r[0], c[1] + r[1], c[2] + r[2]];
    };
    const o: PartOptions = { rotation: [0, yaw, 0] };
    box(W, 0.008, L, cover, at([0, -T / 2 + 0.004, 0]), o);
    box(W, 0.008, L, cover, at([0, T / 2 - 0.004, 0]), o);
    box(0.012, T, L, cover, at([-W / 2 + 0.006, 0, 0]), o);
    box(W - 0.02, T - 0.016, L - 0.012, PAGE, at([0.004, 0, 0]), o);
    for (const z of [-L * 0.3, 0, L * 0.3]) box(0.016, T + 0.004, 0.008, GOLDC, at([-W / 2 + 0.006, 0, z]), o);
    for (const sz of [-1, 1]) box(0.024, T + 0.004, 0.024, GOLDC, at([W / 2 - 0.012, 0, sz * (L / 2 - 0.012)]), o);
    b.part(new THREE.PlaneGeometry(0.075, 0.075), WHITE, {
      at: at([0.01, T / 2 + 0.0008, 0]),
      dir: yawV(yaw, [0, 1, 0]),
      axis: "z",
      up: yawV(yaw, [0, 0, -1]),
      texture: EMB,
    });
  };

  const standBook = (x: number, y: number, z: number, tw: number, h: number, d: number, cover: Col) => {
    box(tw, h, d, cover, [x, y + h / 2, z]);
    for (const f of [0.16, 0.84]) box(tw + 0.002, 0.008, 0.004, GOLDC, [x, y + h * f, z + d / 2]);
    box(tw * 0.7, 0.03, 0.004, PAGE, [x, y + h * 0.5, z + d / 2]);
    box(tw * 0.5, 0.004, 0.004, WINE, [x, y + h * 0.5, z + d / 2 + 0.002]);
  };

  const barrel = (x: number, z: number, s: number) => {
    lathe([[0, 0], [0.1, 0], [0.12, 0.03], [0.14, 0.14], [0.12, 0.27], [0.1, 0.3], [0, 0.3]], DARKY, [x, 0.315, z], 10, s);
    cyl(0.092 * s, 0.092 * s, 0.006, 10, WOOD, [x, 0.315 + 0.301 * s, z], { scale: [1, 1, 1] });
    for (const [hy, hr] of [[0.05, 0.128], [0.15, 0.145], [0.25, 0.128]]) tor(hr * s, 0.008 * s, BRASS, [x, 0.315 + hy * s, z], {}, 12);
  };

  const sack = (x: number, z: number, s: number) => {
    ball(0.13 * s, SACK, [x, 0.315 + 0.13 * s * 1.0, z], [1, 1.05, 0.92], 8);
    cyl(0.04 * s, 0.07 * s, 0.07 * s, 8, SACK, [x, 0.315 + 0.27 * s, z]);
    tor(0.05 * s, 0.01 * s, STRINGC, [x, 0.315 + 0.235 * s, z], {}, 8);
    ball(0.045 * s, SACK, [x, 0.315 + 0.32 * s, z], [1.3, 0.8, 1.3], 6);
  };

  // =============== floor: rune rug and floor trims
  b.part(new THREE.CylinderGeometry(1, 1, 0.012, 40), cel("#7a2f45"), { at: [0, 0.006, 0.15], scale: [1.4, 1, 0.98] });
  b.part(new THREE.PlaneGeometry(2.8, 1.96), WHITE, {
    at: [0, 0.0135, 0.15],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: RUG,
  });

  // =============== table
  const TOP = 0.94;
  box(2.2, 0.07, 0.9, WOODTOP, [0, 0.905, 0.1]);
  box(2.24, 0.02, 0.03, DARK, [0, 0.872, 0.555]);
  box(2.24, 0.02, 0.03, DARK, [0, 0.872, -0.355]);
  box(0.03, 0.02, 0.94, DARK, [1.115, 0.872, 0.1]);
  box(0.03, 0.02, 0.94, DARK, [-1.115, 0.872, 0.1]);
  for (const z of [0.5, -0.31]) box(2.12, 0.006, 0.014, GOLDC, [0, TOP, z]);
  for (const x of [1.06, -1.06]) box(0.014, 0.006, 0.8, GOLDC, [x, TOP, 0.1]);
  box(2.1, 0.15, 0.04, DARK, [0, 0.79, 0.5]);
  box(2.1, 0.15, 0.04, DARK, [0, 0.79, -0.3]);
  for (const x of [1.0, -1.0]) box(0.04, 0.15, 0.76, DARK, [x, 0.79, 0.1]);
  for (const x of [-0.68, 0, 0.68]) {
    box(0.6, 0.11, 0.012, WOOD, [x, 0.79, 0.524]);
    box(0.56, 0.006, 0.004, GOLDC, [x, 0.839, 0.531]);
    box(0.56, 0.006, 0.004, GOLDC, [x, 0.741, 0.531]);
    for (const sx of [-1, 1]) box(0.006, 0.098, 0.004, GOLDC, [x + sx * 0.28, 0.79, 0.531]);
    cyl(0.026, 0.026, 0.004, 8, BRASS, [x, 0.79, 0.532], { rotation: [90, 0, 0] });
    ball(0.016, GOLDC, [x, 0.79, 0.543], [1, 1, 0.8], 7);
    box(0.006, 0.014, 0.003, INK, [x + 0.07, 0.79, 0.531]);
    for (const sx of [-1, 1]) ball(0.007, BRASS, [x + sx * 0.28, 0.835, 0.532], 1, 5);
  }
  const legProfile: Array<[number, number]> = [
    [0, 0], [0.05, 0], [0.05, 0.06], [0.035, 0.09], [0.035, 0.4], [0.055, 0.45], [0.055, 0.5], [0.04, 0.52],
    [0.04, 0.8], [0.06, 0.82], [0.06, 0.87], [0, 0.87],
  ];
  for (const x of [1.0, -1.0])
    for (const z of [0.48, -0.28]) {
      lathe(legProfile, DARKY, [x, 0, z], 8);
      tor(0.057, 0.006, GOLDC, [x, 0.47, z], {}, 8);
    }
  box(1.9, 0.045, 0.045, DARK, [0, 0.25, 0.48]);
  box(1.9, 0.045, 0.045, DARK, [0, 0.25, -0.28]);
  for (const x of [1.0, -1.0]) box(0.045, 0.045, 0.72, DARK, [x, 0.25, 0.1]);
  box(1.92, 0.03, 0.74, WOODTOP, [0, 0.3, 0.1]);

  // lower shelf dressing
  barrel(-0.66, 0.0, 1);
  barrel(-0.32, 0.22, 0.75);
  sack(0.0, 0.05, 1);
  sack(0.27, 0.3, 0.7);
  box(0.36, 0.2, 0.28, WOOD, [0.72, 0.415, 0.05]);
  for (const sx of [-1, 1]) {
    box(0.03, 0.21, 0.29, DARK, [0.72 + sx * 0.165, 0.415, 0.05]);
    box(0.33, 0.015, 0.012, DARK, [0.72, 0.43, 0.195]);
  }
  box(0.33, 0.04, 0.012, GOLDC, [0.72, 0.4, 0.192]);
  potion([0.62, 0.43, 0.04], "round", ELEM.hydro, 0.8, LBL[0]);
  potion([0.74, 0.43, 0.05], "cone", ELEM.dendro, 0.9, LBL[1]);
  potion([0.84, 0.43, 0.02], "tall", ELEM.pyro, 0.8, LBL[2]);
  potion([0.6, 0.315, 0.36], "gourd", ELEM.geo, 0.9, LBL[2]);
  potion([0.8, 0.315, 0.34], "round", ELEM.cryo, 0.8, LBL[0]);

  // =============== hutch (posts, panel, shelves, beam, crest)
  for (const sx of [-1, 1]) {
    box(0.1, 0.96, 0.1, DARKY, [sx * 1.05, TOP + 0.48, -0.38]);
    box(0.13, 0.04, 0.13, GOLDC, [sx * 1.05, TOP + 0.02, -0.38]);
    tor(0.07, 0.01, GOLDC, [sx * 1.05, 1.3, -0.38], {}, 8);
    tor(0.07, 0.01, GOLDC, [sx * 1.05, 1.82, -0.38], {}, 8);
    ball(0.045, GOLDC, [sx * 1.05, 1.95, -0.38], 1, 8);
    cone(0.02, 0.07, 6, GOLDC, [sx * 1.05, 2.02, -0.38]);
    b.rod([sx * 1.05, 1.84, -0.33], [sx * 1.05, 1.84, 0.0], 0.014, BRASS);
    b.rod([sx * 1.05, 1.62, -0.33], [sx * 1.05, 1.82, -0.02], 0.01, BRASS);
    ball(0.02, GOLDC, [sx * 1.05, 1.84, 0.0], 1, 6);
  }
  box(2.1, 0.88, 0.04, DARK, [0, 1.42, -0.4]);
  b.part(new THREE.PlaneGeometry(2.08, 0.86), WHITE, { at: [0, 1.42, -0.377], dir: [0, 0, 1], axis: "z", texture: PANEL });
  box(2.3, 0.08, 0.14, DARK, [0, 1.9, -0.38]);
  box(2.32, 0.012, 0.02, GOLDC, [0, 1.866, -0.31]);
  box(2.32, 0.012, 0.02, GOLDC, [0, 1.934, -0.31]);
  for (let i = 0; i < 13; i++) ball(0.014, GOLDC, [-1.05 + i * 0.175, 1.9, -0.31], [1, 1, 0.6], 6);
  for (const y of [1.42, 1.65]) {
    box(2.1, 0.035, 0.26, WOODTOP, [0, y, -0.26]);
    box(2.1, 0.012, 0.012, GOLDC, [0, y, -0.13]);
    for (const sx of [-1, 1]) box(0.03, 0.06, 0.2, DARK, [sx * 0.98, y - 0.045, -0.26]);
    for (let i = 0; i < 6; i++) box(0.012, 0.05, 0.012, GOLDC, [-0.9 + i * 0.36, y - 0.03, -0.14]);
  }
  const crest: Array<[number, number]> = [
    [-0.5, 0], [0.5, 0], [0.44, 0.06], [0.26, 0.1], [0.12, 0.15], [0.06, 0.24], [0, 0.28], [-0.06, 0.24],
    [-0.12, 0.15], [-0.26, 0.1], [-0.44, 0.06],
  ];
  const bigCrest = crest.map(([x, y]) => [x * 1.1, (y - 0.12) * 1.1 + 0.12] as OutlinePoint);
  b.extrude(bigCrest, { at: [0, 1.935, -0.385], x: [1, 0, 0], thickness: 0.05, bevel: 0.008, smoothing: 1, color: GOLDC });
  b.extrude(crest, { at: [0, 1.94, -0.372], x: [1, 0, 0], thickness: 0.05, bevel: 0.008, smoothing: 1, color: TEALC });
  cyl(0.06, 0.06, 0.02, 12, GOLDC, [0, 2.05, -0.34], { rotation: [90, 0, 0] });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    cone(0.011, 0.055, 4, GOLDC, [Math.cos(a) * 0.095, 2.05 + Math.sin(a) * 0.095, -0.34], { dir: [Math.cos(a), Math.sin(a), 0] });
  }
  glow(ball(0.032, "#ff5a4a", [0, 2.05, -0.328], [1, 1, 0.6], 8), 1.2);
  for (const sx of [-1, 1]) {
    ball(0.02, GOLDC, [sx * 0.34, 1.99, -0.36], 1, 6);
    ball(0.013, GOLDC, [sx * 0.2, 2.03, -0.36], 1, 6);
  }

  // =============== hutch dressing: shelf 1 (surface 1.4375)
  const SH1 = 1.4375;
  const bookCols: Col[] = [WINE, DEEP, TEALC, PURPLE, GREENC, WINE];
  {
    let x = -0.96;
    const spec: Array<[number, number]> = [[0.045, 0.17], [0.05, 0.19], [0.04, 0.15], [0.055, 0.18], [0.04, 0.16], [0.05, 0.14]];
    spec.forEach(([tw, h], i) => {
      standBook(x + tw / 2, SH1, -0.26, tw, h, 0.16, bookCols[i]);
      x += tw + 0.004;
    });
  }
  for (const [x, c, lbl] of [[-0.58, ELEM.dendro, LBL[1]], [-0.42, ELEM.hydro, LBL[0]]] as Array<[number, string, THREE.Texture]>) {
    glow(cyl(0.045, 0.045, 0.11, 8, c, [x, SH1 + 0.055, -0.26]));
    cyl(0.05, 0.05, 0.02, 8, BRASS, [x, SH1 + 0.12, -0.26]);
    ball(0.014, GOLDC, [x, SH1 + 0.14, -0.26], 1, 6);
    tor(0.047, 0.005, GOLDC, [x, SH1 + 0.02, -0.26], {}, 8);
    b.part(new THREE.PlaneGeometry(0.04, 0.05), WHITE, { at: [x, SH1 + 0.06, -0.26 + 0.049], dir: [0, 0, 1], axis: "z", texture: lbl });
  }
  // hourglass
  {
    const x = -0.2;
    const z = -0.26;
    for (const y of [SH1 + 0.005, SH1 + 0.165]) cyl(0.045, 0.045, 0.01, 8, BRASS, [x, y, z]);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      cyl(0.004, 0.004, 0.16, 5, GOLDC, [x + Math.cos(a) * 0.038, SH1 + 0.085, z + Math.sin(a) * 0.038]);
    }
    glow(cone(0.035, 0.07, 8, "#f2d98a", [x, SH1 + 0.045, z]));
    glow(cone(0.035, 0.07, 8, "#f2d98a", [x, SH1 + 0.125, z], { rotation: [180, 0, 0] }));
  }
  // crystal cluster
  {
    const x = 0.2;
    const z = -0.26;
    cyl(0.06, 0.07, 0.025, 7, STONE, [x, SH1 + 0.0125, z]);
    const spec: Array<[number, number, number, number, number]> = [[0, 0, 0.02, 12, 0], [0.035, 0.01, 0.016, -16, 30], [-0.03, 0.015, 0.014, 20, -40], [0.01, -0.03, 0.012, -22, 160], [-0.01, 0.035, 0.011, 28, 100]];
    for (const [dx, dz, r, tilt, yaw] of spec)
      glow(
        b.part(new THREE.OctahedronGeometry(r, 0), ELEM.electro, {
          at: [x + dx, SH1 + 0.025 + r * 2.4, z + dz],
          scale: [1, 2.6, 1],
          rotation: [tilt, yaw, tilt * 0.5],
          flat: true,
        }),
        1.1,
      );
  }
  // carboy and potions on right
  glow(ball(0.075, ELEM.electro, [0.62, SH1 + 0.07, -0.26], 1, 10));
  cyl(0.02, 0.026, 0.06, 8, GLASS, [0.62, SH1 + 0.15, -0.26]);
  cyl(0.026, 0.026, 0.008, 8, GOLDC, [0.62, SH1 + 0.18, -0.26]);
  cyl(0.017, 0.013, 0.03, 8, CORK, [0.62, SH1 + 0.2, -0.26]);
  tor(0.078, 0.005, GOLDC, [0.62, SH1 + 0.07, -0.26], {}, 12);
  ball(0.012, WHITE, [0.595, SH1 + 0.09, -0.19], [0.5, 2, 0.4], 5);
  potion([0.78, SH1, -0.24], "round", ELEM.pyro, 0.75, LBL[2]);
  potion([0.88, SH1, -0.28], "cone", ELEM.anemo, 0.8, LBL[0]);
  potion([0.96, SH1, -0.24], "tall", ELEM.geo, 0.6, LBL[1]);

  // shelf 2 (surface 1.6675)
  const SH2 = 1.6675;
  {
    // armillary sphere
    const x = 0.0;
    const z = -0.26;
    lathe([[0, 0], [0.07, 0], [0.07, 0.012], [0.03, 0.025], [0.02, 0.05], [0, 0.05]], GOLDC, [x, SH2, z], 8);
    const cy = SH2 + 0.14;
    for (const rot of [[0, 0, 0], [0, 90, 0], [90, 0, 0], [0, 45, 0], [0, -45, 0]] as P3[]) tor(0.085, 0.004, GOLDC, [x, cy, z], { rotation: rot }, 16);
    tor(0.1, 0.003, BRASS, [x, cy, z], { rotation: [0, 0, 60] }, 16);
    glow(ball(0.024, FLAME, [x, cy, z], 1, 8), 1.3);
    ball(0.012, GOLDC, [x + 0.1, cy, z], 1, 6);
    cyl(0.006, 0.006, 0.06, 5, GOLDC, [x, SH2 + 0.06, z]);
  }
  {
    const x0 = -0.95;
    const ks: Kind[] = ["round", "cone", "tall", "gourd", "round", "cone"];
    const es = [ELEM.hydro, ELEM.pyro, ELEM.dendro, ELEM.cryo, ELEM.geo, ELEM.electro];
    ks.forEach((k, i) => potion([x0 + i * 0.11, SH2, -0.26 + (i % 2) * 0.03], k, es[i], 0.55, LBL[i % 3]));
  }
  lyingBook([0.65, SH2 + 0.02, -0.26], 8, 0.26, 0.04, 0.19, WINE);
  lyingBook([0.66, SH2 + 0.06, -0.25], -10, 0.22, 0.035, 0.16, DEEP);
  {
    // small glow pot on the book stack
    const x = 0.68;
    const y = SH2 + 0.095;
    lathe([[0, 0], [0.03, 0], [0.04, 0.05], [0.044, 0.05], [0.044, 0.06], [0.036, 0.06], [0, 0.056]], TERRA, [x, y, -0.25], 8);
    glow(ball(0.02, ELEM.anemo, [x, y + 0.08, -0.25], 1, 6), 1.2);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      b.rod([x, y + 0.06, -0.25], [x + Math.cos(a) * 0.035, y + 0.1, -0.25 + Math.sin(a) * 0.035], 0.004, "#3f9a4a");
    }
  }
  box(0.1, 0.002, 0.1, PAGE, [0.92, SH2 + 0.001, -0.26]);
  ball(0.05, cel("#c76a4a"), [0.92, SH2 + 0.045, -0.26], [1, 0.9, 1], 7);
  tor(0.028, 0.008, STRINGC, [0.92, SH2 + 0.085, -0.26], {}, 7);

  // hanging rod: herb bunches and lantern
  b.rod([-1.05, 1.84, 0], [1.05, 1.84, 0], 0.012, BRASS);
  const bunch = (x: number, len: number, tex: THREE.Texture) => {
    tor(0.018, 0.003, STRINGC, [x, 1.84, 0], { rotation: [0, 90, 0] }, 8);
    cyl(0.02, 0.014, 0.03, 8, cel("#c8a46a"), [x, 1.81, 0]);
    b.cards(
      [-1, 0, 1].map((k) => frame([x + k * 0.012, 1.82, k * 0.01], [0, 1, 0])),
      tex,
      { size: [0.1, len], lean: 180, flow: [0, 0, 1], cross: true, vary: 0.2, spin: 40, rng: R, sink: 0 },
    );
  };
  bunch(-0.95, 0.26, HERB2);
  bunch(-0.78, 0.22, HERB1);
  bunch(-0.6, 0.27, HERB3);
  bunch(-0.42, 0.22, HERB2);
  bunch(-0.05, 0.24, HERB1);
  bunch(0.3, 0.26, HERB3);
  bunch(0.95, 0.22, HERB2);
  {
    const x = 0.7;
    b.rod([x, 1.84, 0], [x, 1.79, 0], 0.004, GOLDC);
    tor(0.012, 0.003, GOLDC, [x, 1.8, 0], { rotation: [0, 90, 0] }, 8);
    cone(0.085, 0.05, 4, GOLDC, [x, 1.765, 0], { rotation: [0, 45, 0] });
    ball(0.012, GOLDC, [x, 1.795, 0], 1, 6);
    glow(box(0.09, 0.12, 0.09, "#ffcf5a", [x, 1.68, 0]), 1.3);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) b.rod([x + sx * 0.048, 1.62, sz * 0.048], [x + sx * 0.048, 1.74, sz * 0.048], 0.006, GOLDC);
    box(0.11, 0.015, 0.11, GOLDC, [x, 1.612, 0]);
    box(0.11, 0.012, 0.11, GOLDC, [x, 1.74, 0]);
    cone(0.04, 0.05, 4, GOLDC, [x, 1.58, 0], { rotation: [180, 45, 0] });
    b.cards([frame([x, 1.56, 0], [0, 1, 0])], TASSEL, { size: [0.06, 0.15], lean: 180, flow: [0, 0, 1], sink: 0 });
  }

  // =============== table items
  // potion rack (3 tiers)
  {
    const rx = -0.78;
    const kinds: Kind[][] = [["cone", "round", "gourd"], ["round", "tall", "cone"], ["tall", "gourd", "round"]];
    const cols = [
      [ELEM.hydro, ELEM.pyro, ELEM.geo],
      [ELEM.dendro, ELEM.electro, ELEM.anemo],
      [ELEM.cryo, ELEM.pyro, ELEM.hydro],
    ];
    for (let i = 0; i < 3; i++) {
      const h = 0.05 * (i + 1);
      const z = 0.05 - 0.11 * i;
      box(0.44, h, 0.12, WOOD, [rx, TOP + h / 2, z]);
      box(0.44, 0.008, 0.01, GOLDC, [rx, TOP + h - 0.01, z + 0.06]);
      box(0.446, 0.01, 0.126, DARK, [rx, TOP + h, z]);
      for (let k = 0; k < 3; k++)
        potion([rx - 0.13 + k * 0.13, TOP + h + 0.005, z], kinds[i][k], cols[i][k], 0.85, LBL[(i + k) % 3]);
    }
    for (const sx of [-1, 1]) box(0.02, 0.17, 0.4, DARK, [rx + sx * 0.23, TOP + 0.085, -0.06]);
  }
  // jug with lavender
  lathe(
    [[0, 0], [0.045, 0], [0.065, 0.04], [0.065, 0.09], [0.05, 0.13], [0.04, 0.16], [0.048, 0.172], [0.04, 0.172], [0.03, 0.16], [0, 0.15]],
    JUG,
    [-0.95, TOP, 0.4],
    9,
  );
  tor(0.066, 0.005, GOLDC, [-0.95, TOP + 0.06, 0.4], {}, 9);
  tor(0.05, 0.004, GOLDC, [-0.95, TOP + 0.13, 0.4], {}, 9);
  sprigs([-0.95, TOP + 0.165, 0.4], 9, HERB2, [0.05, 0.24], 12, 15, 0.45);
  // mortar and pestle
  lathe([[0, 0], [0.05, 0], [0.07, 0.02], [0.075, 0.07], [0.06, 0.075], [0.05, 0.06], [0.03, 0.035], [0, 0.03]], STONE, [-0.62, TOP, 0.33], 9);
  cyl(0.045, 0.045, 0.004, 9, cel("#5aa84a"), [-0.62, TOP + 0.042, 0.33]);
  b.capsule([-0.62, TOP + 0.04, 0.33], [-0.57, TOP + 0.17, 0.31], [0.012, 0.02], { color: STONE });
  tor(0.071, 0.004, GOLDC, [-0.62, TOP + 0.07, 0.33], {}, 9);
  // mushrooms
  for (const [dx, dz, r, h] of [[0, 0, 0.04, 0.06], [0.07, 0.03, 0.03, 0.045], [-0.05, 0.05, 0.024, 0.035]]) {
    cyl(r * 0.35, r * 0.45, h, 6, cel("#fff2d0"), [-0.4 + dx, TOP + h / 2, 0.42 + dz]);
    b.part(new THREE.SphereGeometry(r, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), cel(spots("#d8453c", "#ffe9c0", { size: 0.025, amount: 0.55, seed: 3 })), {
      at: [-0.4 + dx, TOP + h - 0.004, 0.42 + dz],
      scale: [1, 0.8, 1],
    });
  }
  // balance scale
  {
    const cx = -0.2;
    const z = 0.05;
    lathe([[0, 0], [0.08, 0], [0.085, 0.015], [0.05, 0.03], [0.03, 0.06], [0.02, 0.1], [0, 0.1]], GOLDC, [cx, TOP, z], 10);
    cyl(0.012, 0.016, 0.32, 8, BRASS, [cx, TOP + 0.26, z]);
    tor(0.022, 0.005, GOLDC, [cx, TOP + 0.2, z], {}, 8);
    ball(0.022, GOLDC, [cx, TOP + 0.42, z], 1, 8);
    const by = TOP + 0.42;
    const th = 0.09;
    const L = 0.25;
    const eP: P3 = [cx + L * Math.cos(th), by + L * Math.sin(th), z];
    const eQ: P3 = [cx - L * Math.cos(th), by - L * Math.sin(th), z];
    b.rod(eQ, eP, 0.008, BRASS);
    box(0.06, 0.02, 0.02, GOLDC, [cx, by, z], { rotation: [0, 0, 0] });
    ball(0.014, GOLDC, eP, 1, 6);
    ball(0.014, GOLDC, eQ, 1, 6);
    ball(0.012, GOLDC, [cx, by + 0.03, z], 1, 6);
    const panPts: Array<[number, number]> = [[0, 0], [0.05, 0.005], [0.095, 0.035], [0.09, 0.037], [0.045, 0.014], [0, 0.012]];
    for (const e of [eP, eQ]) {
      const py = e[1] - 0.2;
      lathe(panPts, GOLDC, [e[0], py, e[2]], 10);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        b.rod(e, [e[0] + 0.09 * Math.cos(a), py + 0.036, e[2] + 0.09 * Math.sin(a)], 0.0025, BRASS);
      }
      tor(0.09, 0.003, BRASS, [e[0], py + 0.036, e[2]], {}, 10);
    }
    // gems in the low pan, brass weights in the high pan
    glow(b.part(new THREE.OctahedronGeometry(0.022, 0), ELEM.hydro, { at: [eQ[0], eQ[1] - 0.2 + 0.03, z], scale: [1, 1.3, 1], flat: true }));
    glow(b.part(new THREE.OctahedronGeometry(0.016, 0), ELEM.pyro, { at: [eQ[0] + 0.04, eQ[1] - 0.2 + 0.025, z + 0.02], flat: true }));
    cyl(0.014, 0.016, 0.02, 8, BRASS, [eP[0], eP[1] - 0.2 + 0.02, z]);
    ball(0.006, GOLDC, [eP[0], eP[1] - 0.2 + 0.034, z], 1, 5);
    for (let i = 0; i < 3; i++) {
      cyl(0.012 - i * 0.002, 0.014 - i * 0.002, 0.018, 8, BRASS, [cx + 0.2 + i * 0.035, TOP + 0.009, z + 0.16]);
      ball(0.005, GOLDC, [cx + 0.2 + i * 0.035, TOP + 0.02, z + 0.16], 1, 5);
    }
  }
  // runner cloth + tassels
  box(0.7, 0.008, 0.45, TEALC, [0.27, TOP + 0.004, 0.03]);
  b.part(new THREE.PlaneGeometry(0.7, 0.45), WHITE, { at: [0.27, TOP + 0.0085, 0.03], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: RUNNER });
  b.cards(
    Array.from({ length: 7 }, (_, i) => frame([0.0 + i * 0.1, TOP + 0.006, 0.255], [0, 1, 0])),
    TASSEL,
    { size: [0.045, 0.1], lean: 180, flow: [0, 0, 1], sink: 0 },
  );
  // alembic
  {
    const ax = 0.15;
    const az = 0.05;
    lathe([[0, 0], [0.05, 0], [0.055, 0.03], [0.04, 0.06], [0.02, 0.07], [0, 0.07]], COPPER, [ax, TOP + 0.008, az], 9);
    glow(cone(0.016, 0.045, 6, FLAME, [ax, TOP + 0.098, az]), 1.2);
    glow(cone(0.008, 0.028, 6, FLAME2, [ax, TOP + 0.094, az]), 1.2);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      b.rod([ax + Math.cos(a) * 0.075, TOP + 0.125, az + Math.sin(a) * 0.075], [ax + Math.cos(a) * 0.12, TOP + 0.005, az + Math.sin(a) * 0.12], 0.007, IRON);
    }
    tor(0.078, 0.007, GOLDC, [ax, TOP + 0.125, az], {}, 10);
    const yb = TOP + 0.2;
    glow(ball(0.09, ELEM.anemo, [ax, yb, az], 1, 10));
    ball(0.012, WHITE, [ax - 0.04, yb + 0.03, az + 0.072], [0.5, 2.2, 0.4], 5);
    tor(0.092, 0.004, GOLDC, [ax, yb, az], {}, 12);
    cyl(0.028, 0.04, 0.09, 8, GLASS, [ax, yb + 0.12, az]);
    tor(0.034, 0.005, GOLDC, [ax, yb + 0.1, az], {}, 8);
    lathe([[0, 0], [0.05, 0], [0.06, 0.03], [0.05, 0.07], [0.025, 0.1], [0.012, 0.115], [0, 0.115]], COPPER, [ax, yb + 0.165, az], 9);
    tor(0.05, 0.005, GOLDC, [ax, yb + 0.168, az], {}, 9);
    const pipe = b.sweep(
      catmull([[ax, yb + 0.27, az], [ax + 0.05, yb + 0.305, az], [ax + 0.15, yb + 0.3, az], [ax + 0.23, yb + 0.22, az], [ax + 0.28, yb + 0.1, az], [ax + 0.3, TOP + 0.19, az]]),
      0.014,
      COPPER,
      { sides: 6 },
    );
    b.along(pipe, 4, (at) => {
      b.part(new THREE.TorusGeometry(0.017, 0.004, 5, 8), GOLDC, { at, dir: at, axis: "z" });
    });
    // receiver
    const rx = ax + 0.3;
    tor(0.04, 0.008, BRASS, [rx, TOP + 0.005, az], {}, 8);
    glow(ball(0.06, ELEM.cryo, [rx, TOP + 0.06, az], 1, 9));
    cyl(0.02, 0.028, 0.06, 8, GLASS, [rx, TOP + 0.15, az]);
    cyl(0.026, 0.026, 0.008, 8, GOLDC, [rx, TOP + 0.185, az]);
    ball(0.01, WHITE, [rx - 0.025, TOP + 0.075, az + 0.05], [0.5, 2.2, 0.4], 5);
    glow(ball(0.01, ELEM.anemo, [rx, TOP + 0.17, az], 1, 5));
  }
  // books: stack with candle
  lyingBook([0.83, TOP + 0.03, -0.05], 0, 0.3, 0.06, 0.22, WINE);
  lyingBook([0.84, TOP + 0.0825, -0.05], 12, 0.27, 0.045, 0.2, DEEP);
  lyingBook([0.83, TOP + 0.125, -0.05], -8, 0.24, 0.04, 0.18, GREENC);
  {
    const cx = 0.83;
    const cz = -0.05;
    const y = TOP + 0.145;
    lathe([[0, 0], [0.05, 0], [0.05, 0.012], [0.02, 0.02], [0.016, 0.05], [0.03, 0.06], [0.03, 0.065], [0, 0.065]], BRASS, [cx, y, cz], 9);
    cyl(0.018, 0.018, 0.1, 8, PAGE, [cx, y + 0.115, cz]);
    ball(0.012, PAGE, [cx + 0.018, y + 0.12, cz + 0.008], [0.6, 1.4, 0.6], 5);
    glow(cone(0.011, 0.04, 6, FLAME, [cx, y + 0.185, cz]), 1.2);
    glow(cone(0.006, 0.024, 6, FLAME2, [cx, y + 0.182, cz]), 1.2);
  }
  // open grimoire
  {
    const bx = 0.78;
    const bz = 0.34;
    for (const s of [-1, 1]) {
      const th = s * 6;
      const cxp = bx + s * 0.086;
      const rad = (th * Math.PI) / 180;
      box(0.18, 0.012, 0.25, WINE, [cxp, TOP + 0.008 + (s * 0.086 * Math.sin(rad)) * -0.0, bz], { rotation: [0, 0, th] });
      box(0.17, 0.02, 0.24, PAGE, [cxp, TOP + 0.022, bz], { rotation: [0, 0, th] });
      b.part(new THREE.PlaneGeometry(0.15, 0.21), WHITE, {
        at: [cxp - Math.sin(rad) * 0.0, TOP + 0.0328 + 0.0, bz],
        dir: [-Math.sin(rad), Math.cos(rad), 0],
        axis: "z",
        up: [0, 0, -1],
        texture: PAGETEX,
        mirror: undefined,
      });
      box(0.012, 0.004, 0.24, GOLDC, [bx + s * 0.172, TOP + 0.03, bz], { rotation: [0, 0, th] });
    }
    box(0.01, 0.026, 0.25, WINE, [bx, TOP + 0.014, bz]);
    b.rod([bx + 0.01, TOP + 0.03, bz + 0.1], [bx + 0.02, TOP + 0.003, bz + 0.18], 0.004, "#c23a4a");
    b.rod([bx + 0.02, TOP + 0.003, bz + 0.18], [bx + 0.03, TOP + 0.0015, bz + 0.21], 0.004, "#c23a4a");
    for (const s of [-1, 1]) for (const sz of [-1, 1]) box(0.022, 0.014, 0.022, GOLDC, [bx + s * 0.18, TOP + 0.01, bz + sz * 0.12]);
  }
  // scroll
  {
    const sx = 0.38;
    const sz = 0.4;
    cyl(0.025, 0.025, 0.22, 9, PAGE, [sx, TOP + 0.025, sz], { rotation: [0, 0, 90] });
    for (const e of [-1, 1]) {
      cyl(0.013, 0.013, 0.004, 8, cel("#c9a56c"), [sx + e * 0.111, TOP + 0.025, sz], { rotation: [0, 0, 90] });
      ball(0.012, GOLDC, [sx + e * 0.12, TOP + 0.025, sz], 1, 6);
    }
    tor(0.027, 0.004, cel("#c23a4a"), [sx + 0.03, TOP + 0.025, sz], { rotation: [0, 90, 0] }, 9);
    box(0.2, 0.003, 0.15, PAGE, [sx - 0.02, TOP + 0.0015, sz + 0.11]);
    b.part(new THREE.PlaneGeometry(0.2, 0.15), WHITE, { at: [sx - 0.02, TOP + 0.0035, sz + 0.11], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: PAGETEX });
  }
  // inkwell and quill
  {
    const ix = 1.01;
    const iz = 0.2;
    lathe([[0, 0], [0.035, 0], [0.04, 0.02], [0.035, 0.04], [0.022, 0.05], [0, 0.05]], INKP, [ix, TOP, iz], 8);
    tor(0.025, 0.005, GOLDC, [ix, TOP + 0.05, iz], {}, 8);
    cyl(0.02, 0.02, 0.006, 8, INK, [ix, TOP + 0.052, iz]);
    const d: P3 = [0.5, 0.75, 0.3];
    const dl = Math.hypot(...d);
    const base: P3 = [ix, TOP + 0.045, iz];
    const tip: P3 = [base[0] + (d[0] / dl) * 0.26, base[1] + (d[1] / dl) * 0.26, base[2] + (d[2] / dl) * 0.26];
    b.rod(base, tip, [0.003, 0.0015], { color: PAGE });
    b.extrude(
      [[0.05, 0], [0.12, 0.014], [0.2, 0.012], [0.26, 0], [0.2, -0.01], [0.12, -0.016]],
      { at: base, x: d, y: [0, 0, 1], thickness: 0.003, color: cel("#f3a24a") },
    );
  }
  // fern pot + glow flower pot
  lathe([[0, 0], [0.04, 0], [0.058, 0.075], [0.065, 0.075], [0.065, 0.09], [0.055, 0.09], [0, 0.084]], TERRA, [-0.02, TOP, 0.42], 8);
  tor(0.064, 0.005, GOLDC, [-0.02, TOP + 0.08, 0.42], {}, 8);
  sprigs([-0.02, TOP + 0.09, 0.42], 12, LEAF, [0.07, 0.15], 30, 30, 0.8);
  {
    const px = 1.03;
    const pz = -0.2;
    lathe([[0, 0], [0.04, 0], [0.058, 0.075], [0.065, 0.075], [0.065, 0.09], [0.055, 0.09], [0, 0.084]], TERRA, [px, TOP, pz], 8);
    tor(0.064, 0.005, GOLDC, [px, TOP + 0.08, pz], {}, 8);
    cyl(0.055, 0.055, 0.006, 8, SOIL, [px, TOP + 0.088, pz]);
    const stems: P3[][] = [
      [[px, TOP + 0.09, pz], [px - 0.02, TOP + 0.18, pz], [px - 0.05, TOP + 0.27, pz + 0.02]],
      [[px, TOP + 0.09, pz], [px + 0.02, TOP + 0.16, pz], [px + 0.04, TOP + 0.22, pz - 0.02]],
    ];
    for (const s of stems) {
      b.sweep(catmull(s), [0.006, 0.004], "#3f9a4a", { sides: 5 });
      const e = s[2];
      glow(ball(0.014, ELEM.anemo, [e[0], e[1] + 0.012, e[2]], 1, 6), 1.3);
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        glow(cone(0.014, 0.04, 4, "#9ff5e6", [e[0] + Math.cos(a) * 0.02, e[1] + 0.025, e[2] + Math.sin(a) * 0.02], { dir: [Math.cos(a) * 0.8, 1, Math.sin(a) * 0.8] }), 1.1);
      }
    }
    sprigs([px, TOP + 0.09, pz], 6, LEAF, [0.05, 0.1], 40, 20, 0.9);
  }
  // loose potions at back
  potion([-0.2, TOP, -0.22], "tall", ELEM.geo, 0.8, LBL[2]);
  potion([-0.08, TOP, -0.2], "cone", ELEM.electro, 0.85, LBL[0]);
  potion([0.5, TOP, -0.22], "round", ELEM.dendro, 0.85, LBL[1]);
  potion([0.62, TOP, -0.2], "gourd", ELEM.hydro, 0.85, LBL[2]);

  // =============== floor cauldron
  {
    const cx = 0.95;
    const cz = 0.88;
    lathe(
      [[0, 0.08], [0.17, 0.08], [0.25, 0.15], [0.29, 0.26], [0.3, 0.34], [0.275, 0.345], [0.27, 0.26], [0.23, 0.17], [0.15, 0.12], [0, 0.12]],
      IRON,
      [cx, 0.012, cz],
      12,
    );
    tor(0.288, 0.012, GOLDC, [cx, 0.012 + 0.3, cz], {}, 12);
    tor(0.272, 0.008, BRASS, [cx, 0.012 + 0.2, cz], {}, 12);
    glow(cyl(0.255, 0.255, 0.008, 12, ELEM.dendro, [cx, 0.012 + 0.31, cz]), 1.1);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      const rr = 0.04 + (i % 3) * 0.06;
      glow(ball(0.02 + (i % 2) * 0.01, "#d6ff9a", [cx + Math.cos(a) * rr, 0.012 + 0.325, cz + Math.sin(a) * rr], 1, 6));
    }
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      b.rod([cx + Math.cos(a) * 0.2, 0.012 + 0.13, cz + Math.sin(a) * 0.2], [cx + Math.cos(a) * 0.27, 0.012, cz + Math.sin(a) * 0.27], 0.022, IRON);
      glow(cone(0.025, 0.07, 5, FLAME, [cx + Math.cos(a + 0.9) * 0.1, 0.012 + 0.07, cz + Math.sin(a + 0.9) * 0.1]), 1.2);
    }
    for (const sx of [-1, 1]) {
      tor(0.04, 0.008, IRON, [cx + sx * 0.3, 0.012 + 0.28, cz], { rotation: [0, 90, 0] }, 8);
    }
    b.rod([cx - 0.1, 0.012 + 0.31, cz + 0.05], [cx + 0.2, 0.012 + 0.62, cz + 0.2], 0.01, WOOD);
    ball(0.04, BRASS, [cx - 0.1, 0.012 + 0.31, cz + 0.05], [1, 0.5, 1], 7);
    ball(0.02, GOLDC, [cx + 0.2, 0.012 + 0.62, cz + 0.2], 1, 6);
  }
  // floor pile: a couple of stray books and a dropped herb bundle
  lyingBook([-1.25, 0.012 + 0.025, 0.7], 25, 0.24, 0.05, 0.17, PURPLE);
  lyingBook([-1.23, 0.012 + 0.07, 0.69], -15, 0.2, 0.04, 0.15, TEALC);
  potion([-1.0, 0.012, 0.95], "round", ELEM.pyro, 1.0, LBL[2]);
  potion([-0.85, 0.012, 0.9], "gourd", ELEM.cryo, 0.9, LBL[0]);

  return b.root;
}
