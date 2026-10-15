import * as THREE from "three";
import { createBuilder, frame, rng, svg, paint, grain, mottle, scales } from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "High-fantasy anime wizard's bookshelf: carved gilt-trimmed cabinet with moon and sun doors, starry back panel, tomes, scrolls, crystal balls, candles, an hourglass, potions and a glowing open grimoire, standing on a runic rug and stone dais.",
};

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

type BS = { t: number; h: number; d: number; c: string; tx: THREE.Texture };

export default function build() {
  const b = createBuilder({ name: "wizard_bookshelf" });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(7);

  // ------------------------------------------------------------------ constants
  const Y0 = 0.074; // top of the rug: the shelf stands here
  const FL = 0.076; // floor level for props on the rug
  const LV = [0.66, 1.18, 1.7, 2.22]; // board centres above Y0
  const T = [Y0 + LV[0] + 0.02, Y0 + LV[1] + 0.02, Y0 + LV[2] + 0.02];
  const CEIL = Y0 + LV[3] - 0.022;
  const CTOP = Y0 + LV[3] + 0.0225;
  const ZF = 0.17; // front of books

  const GOLD = "#f4c542";
  const GOLD_D = "#b9801f";
  const PAGE = "#f6e8c2";
  const INKC = "#2a1a12";
  const BC = ["#9b2442", "#2d4fb0", "#1f8c8c", "#6b40b8", "#2f8f55", "#6a2147", "#cf6d2c", "#27325f"];
  const PARCH = ["#efe0b4", "#e8d3a0", "#f4e9c8"];
  const BANDS = ["#b3263e", "#2d5fc0", "#1f9a8a", GOLD];

  // ------------------------------------------------------------------ paints
  const woodV = cel(grain("#5a3322", "#7d4b2d", { size: 0.035, axis: "y" }), "#3b2118");
  const woodH = cel(grain("#5a3322", "#7d4b2d", { size: 0.035, axis: "x" }), "#3b2118");
  const woodD = cel(grain("#3a2218", "#55321f", { size: 0.03, axis: "x" }), "#25140e");
  const goldP = cel("#ffd75e", "#c98a24");
  const stoneP = cel(scales(["#8b88a8", "#9a97b6", "#7c7998"], "#55526f", { size: 0.18, width: 0.08 }), "#5e5b7c");
  const tealP = cel(mottle("#2c7380", "#3b8a96", { size: 0.05 }), "#1d4f5c");
  const pillarP = paint((p) => {
    const y = p.y - (Y0 + 0.14);
    const gold = y < 0.07 || y > 1.98 || [0.55, 1.05, 1.55].some((c) => Math.abs(y - c) < 0.025);
    return gold ? goldP : woodV;
  });

  // ------------------------------------------------------------------ textures
  let stars = "";
  for (let i = 0; i < 46; i++) {
    const x = R() * 134;
    const y = R() * 156;
    const r = 0.5 + R() * 1.1;
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${i % 3 ? "#fff3b8" : "#bfe6ff"}"/>`;
  }
  const conA = [[18, 40], [38, 56], [62, 46], [84, 70], [110, 58]];
  const conB = [[30, 110], [52, 98], [70, 118], [96, 104]];
  const dots = [...conA, ...conB].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#ffe9a0"/>`).join("");
  const SKY = svg(
    `<svg viewBox="0 0 134 156" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1858"/><stop offset="1" stop-color="#3a1f6b"/></linearGradient></defs>
    <rect width="134" height="156" fill="url(#g)"/><ellipse cx="40" cy="50" rx="50" ry="22" fill="#4a2c86" opacity="0.5"/><ellipse cx="100" cy="120" rx="46" ry="24" fill="#23508f" opacity="0.4"/>
    <path d="M100 14 A16 16 0 1 0 100 46 A12 12 0 1 1 100 14Z" fill="#5b3fa8"/>${stars}
    <path d="${conA.map(([x, y], i) => (i ? "L" : "M") + x + " " + y).join(" ")}" stroke="#ffd86a" stroke-width="0.9" fill="none"/>
    <path d="${conB.map(([x, y], i) => (i ? "L" : "M") + x + " " + y).join(" ")}" stroke="#9fd8ff" stroke-width="0.9" fill="none"/>${dots}</svg>`,
    { size: 512 },
  );

  const bandRects = (ys: number[]) =>
    ys.map((y) => `<rect x="0" y="${y}" width="20" height="5" fill="${GOLD}"/><rect x="0" y="${y}" width="20" height="1.3" fill="#fff0a0"/><rect x="0" y="${y + 4}" width="20" height="1" fill="${GOLD_D}"/>`).join("");
  const SP = [
    svg(
      `<svg viewBox="0 0 20 150" xmlns="http://www.w3.org/2000/svg">${bandRects([9, 135])}
      <rect x="3" y="40" width="14" height="52" rx="2" fill="#f3e4b6" stroke="#6a4a1c" stroke-width="1.3"/>
      <path d="M6 51 H14 M6 59 H14 M6 67 H12 M6 75 H14" stroke="#5a3a18" stroke-width="1.7"/>
      <circle cx="10" cy="114" r="5" fill="#4ad8ff" stroke="${GOLD}" stroke-width="1.8"/></svg>`,
      { size: 320 },
    ),
    svg(
      `<svg viewBox="0 0 20 150" xmlns="http://www.w3.org/2000/svg">${bandRects([8, 20, 125, 137])}
      <path d="M10 34 L16 46 L10 58 L4 46Z M10 66 L16 78 L10 90 L4 78Z M10 98 L16 110 L10 122 L4 110Z" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="1"/>
      <circle cx="10" cy="46" r="2" fill="#b3263e"/><circle cx="10" cy="78" r="2" fill="#b3263e"/><circle cx="10" cy="110" r="2" fill="#b3263e"/></svg>`,
      { size: 320 },
    ),
    svg(
      `<svg viewBox="0 0 20 150" xmlns="http://www.w3.org/2000/svg">${bandRects([12, 130])}
      <circle cx="10" cy="75" r="8" fill="#1a1440" stroke="${GOLD}" stroke-width="2.4"/>
      <path d="M10 68 L11.8 73.4 L17 73.6 L12.8 76.8 L14.4 82 L10 78.8 L5.6 82 L7.2 76.8 L3 73.6 L8.2 73.4Z" fill="${GOLD}" transform="scale(0.5) translate(10 75)"/>
      <path d="M10 34 V54 M6 40 H14 M6 48 H14 M10 96 V116 M6 102 H14 M6 110 H14" stroke="${GOLD}" stroke-width="1.8"/></svg>`,
      { size: 320 },
    ),
  ];

  const doorTex = (sun: boolean) => {
    let deco = "";
    if (sun) {
      for (let i = 0; i < 12; i++) {
        const a = (i * TAU) / 12;
        const r1 = 17;
        const r2 = i % 2 ? 26 : 31;
        deco += `<path d="M${60 + Math.cos(a - 0.14) * r1} ${42 + Math.sin(a - 0.14) * r1} L${60 + Math.cos(a) * r2} ${42 + Math.sin(a) * r2} L${60 + Math.cos(a + 0.14) * r1} ${42 + Math.sin(a + 0.14) * r1}Z" fill="#ffcf4a"/>`;
      }
      deco += `<circle cx="60" cy="42" r="15" fill="#ffb92e" stroke="#fff0a0" stroke-width="1.6"/><circle cx="55" cy="38" r="3" fill="#fff0a0"/>`;
    } else {
      deco += `<path d="M66 12 A30 30 0 1 0 66 72 A23 23 0 1 1 66 12Z" fill="#e8d98a" stroke="#fff6c0" stroke-width="1.2"/>`;
      deco += `<path d="M92 22 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z M80 54 l1.8 4 4 1.8 -4 1.8 -1.8 4 -1.8 -4 -4 -1.8 4 -1.8z" fill="${GOLD}"/>`;
    }
    return svg(
      `<svg viewBox="0 0 120 84" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="1.5" width="117" height="81" rx="6" fill="#2b1d4a" stroke="${GOLD}" stroke-width="3"/>
      <rect x="7" y="7" width="106" height="70" rx="3" fill="none" stroke="${GOLD_D}" stroke-width="1.6"/>
      <circle cx="14" cy="14" r="4" fill="${GOLD}"/><circle cx="106" cy="14" r="4" fill="${GOLD}"/><circle cx="14" cy="70" r="4" fill="${GOLD}"/><circle cx="106" cy="70" r="4" fill="${GOLD}"/>${deco}</svg>`,
      { size: 384 },
    );
  };
  const DOOR_M = doorTex(false);
  const DOOR_S = doorTex(true);

  const star5 = (cx: number, cy: number, r: number, rot = -90) => {
    let d = "";
    for (let i = 0; i < 5; i++) {
      const a = (rot + i * 144) * DEG;
      d += (i ? "L" : "M") + (cx + Math.cos(a) * r).toFixed(1) + " " + (cy + Math.sin(a) * r).toFixed(1);
    }
    return d + "Z";
  };
  let diamonds = "";
  for (let x = 20; x < 190; x += 12) diamonds += `<path d="M${x} 1.5 l3.5 5.5 l-3.5 5.5 l-3.5 -5.5z M${x} 87.5 l3.5 5.5 l-3.5 5.5 l-3.5 -5.5z" fill="${GOLD}"/>`;
  for (let y = 20; y < 90; y += 12) diamonds += `<path d="M1.5 ${y} l5.5 3.5 l-5.5 3.5 l-0 -7z M198.5 ${y} l-5.5 3.5 l5.5 3.5z" fill="${GOLD}"/>`;
  let ticks = "";
  for (let i = 0; i < 24; i++) {
    const a = (i * TAU) / 24;
    ticks += `<path d="M${100 + Math.cos(a) * 20} ${62 + Math.sin(a) * 20} L${100 + Math.cos(a) * 23} ${62 + Math.sin(a) * 23}" stroke="#9fe8ff" stroke-width="1"/>`;
  }
  const RUG = svg(
    `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="100" fill="#6a1a35"/>${diamonds}
    <rect x="14" y="14" width="172" height="72" fill="#1d2a6e" stroke="${GOLD}" stroke-width="2"/>
    <rect x="18" y="18" width="164" height="64" fill="none" stroke="#5f78d6" stroke-width="0.8"/>
    <circle cx="100" cy="62" r="22" fill="#141c52" stroke="${GOLD}" stroke-width="1.6"/><circle cx="100" cy="62" r="18" fill="none" stroke="#9fe8ff" stroke-width="1"/>
    <path d="${star5(100, 62, 18)}" fill="none" stroke="${GOLD}" stroke-width="1.2"/>${ticks}
    <path d="${star5(36, 40, 6)} ${star5(164, 40, 6)}" fill="${GOLD}"/><path d="${star5(36, 64, 4)} ${star5(164, 64, 4)}" fill="#9fe8ff"/>
    <path d="M44 28 Q100 20 156 28" stroke="${GOLD}" stroke-width="1" fill="none"/></svg>`,
    { size: 768 },
  );

  let eticks = "";
  for (let i = 0; i < 28; i++) {
    const a = (i * TAU) / 28;
    const r2 = i % 2 ? 40 : 42;
    eticks += `<path d="M${50 + Math.cos(a) * 36} ${50 + Math.sin(a) * 36} L${50 + Math.cos(a) * r2} ${50 + Math.sin(a) * r2}" stroke="#7cf0ff" stroke-width="2"/>`;
  }
  const EMBL = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="49" fill="#0e1236"/>
    <circle cx="50" cy="50" r="44" fill="none" stroke="#7cf0ff" stroke-width="2.4"/><circle cx="50" cy="50" r="33" fill="none" stroke="#ffd86a" stroke-width="2"/>${eticks}
    <path d="${star5(50, 50, 32)}" fill="none" stroke="#b58bff" stroke-width="2"/>
    <ellipse cx="50" cy="50" rx="17" ry="10" fill="#0e1236" stroke="#ffe9a0" stroke-width="2.4"/><circle cx="50" cy="50" r="6" fill="#7cf0ff"/><circle cx="50" cy="50" r="2.6" fill="#ffffff"/></svg>`,
    { size: 384 },
  );

  const glyphs = ["M0 0 V6 M0 3 H4", "M0 0 L4 3 L0 6", "M0 0 H4 V6", "M2 0 V6 M0 2 L4 4", "M0 6 L2 0 L4 6 M1 4 H3"];
  let runes = "";
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 4; c++)
      runes += `<path d="${glyphs[Math.floor(R() * glyphs.length)]}" transform="translate(${7 + c * 12} ${8 + r * 9})" stroke="#7cf0ff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const RUNES = svg(`<svg viewBox="0 0 60 76" xmlns="http://www.w3.org/2000/svg">${runes}</svg>`, { size: 256 });

  const orbTex = (c1: string, c2: string, c3: string) =>
    svg(
      `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c3}"/></linearGradient></defs>
      <rect width="200" height="100" fill="url(#o)"/>
      <path d="M0 30 Q50 0 100 30 T200 30" stroke="${c2}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M0 60 Q50 35 100 60 T200 60" stroke="${c2}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M0 82 Q50 66 100 82 T200 82" stroke="${c2}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="30" cy="48" r="3" fill="#fff"/><circle cx="64" cy="70" r="2" fill="#fff"/><circle cx="90" cy="40" r="2.4" fill="#fff"/>
      <ellipse cx="44" cy="26" rx="9" ry="5" fill="#ffffff"/></svg>`,
      { size: 256 },
    );
  const ORBP = orbTex("#8a4cff", "#d9a8ff", "#3a1c8a");
  const ORBC = orbTex("#3fd2ff", "#b8f6ff", "#1c5cc0");
  const SPARK = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 2 Q35 29 62 32 Q35 35 32 62 Q29 35 2 32 Q29 29 32 2Z" fill="#ffffff"/><circle cx="32" cy="32" r="5" fill="#ffffff"/></svg>`,
    { size: 128 },
  );

  // ------------------------------------------------------------------ helpers
  type Opt = NonNullable<Parameters<typeof b.part>[2]>;
  const P = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const qz = (deg: number) => new THREE.Quaternion().setFromAxisAngle(P(0, 0, 1), deg * DEG);
  const qy = (deg: number) => new THREE.Quaternion().setFromAxisAngle(P(0, 1, 0), deg * DEG);
  const qx = (deg: number) => new THREE.Quaternion().setFromAxisAngle(P(1, 0, 0), deg * DEG);
  const q0 = new THREE.Quaternion();
  const bx = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, o: Opt = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, x: number, y: number, z: number, o: Opt = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: [x, y, z], ...o });
  const ball = (r: number, color: any, x: number, y: number, z: number, o: Opt = {}) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: [x, y, z], ...o });
  const turn = (prof: [number, number][], x: number, y: number, z: number, color: any, seg = 10) => {
    const pts: [number, number][] = [[0, prof[0][1]], ...prof, [0, prof[prof.length - 1][1]]];
    return b.lathe(pts, { at: [x, y, z], color, segments: seg });
  };

  const sparks = new Map<string, { color: string; size: number; at: THREE.Vector3[] }>();
  const spark = (x: number, y: number, z: number, size: number, color: string) => {
    const key = `${color}|${size}`;
    if (!sparks.has(key)) sparks.set(key, { color, size, at: [] });
    sparks.get(key)!.at.push(P(x, y - size / 2, z));
  };

  // ---- books
  function book(c: THREE.Vector3, q: THREE.Quaternion, s: BS) {
    const pl = (x: number, y: number, z: number) => P(x, y, z).applyQuaternion(q).add(c);
    const { t, h, d } = s;
    b.part(new THREE.BoxGeometry(t, h, 0.014), s.c, { at: pl(0, 0, d / 2 - 0.007), quat: q });
    for (const k of [1, -1]) b.part(new THREE.BoxGeometry(0.008, h, d), s.c, { at: pl(k * (t / 2 - 0.004), 0, 0), quat: q });
    b.part(new THREE.BoxGeometry(t - 0.016, h - 0.016, d - 0.012), PAGE, { at: pl(0, 0, -0.004), quat: q });
    b.part(new THREE.PlaneGeometry(t * 0.99, h * 0.97), "#ffffff", { at: pl(0, 0, d / 2 + 0.0012), quat: q, texture: s.tx });
  }
  let bi = 0;
  const rb = (n: number): BS[] =>
    Array.from({ length: n }, () => {
      const i = bi++;
      return { t: 0.04 + R() * 0.026, h: 0.3 + R() * 0.11, d: 0.2 + R() * 0.08, c: BC[i % BC.length], tx: SP[(i * 5 + 1) % 3] };
    });
  const lying = (t: number, h: number, d: number, ci: number): BS => ({ t, h, d, c: BC[ci % BC.length], tx: SP[ci % 3] });
  function row(x: number, top: number, list: BS[]) {
    for (const s of list) {
      book(P(x + s.t / 2, top + s.h / 2, ZF - s.d / 2), q0, s);
      x += s.t + 0.004;
    }
    return x;
  }
  function lean(xc: number, top: number, s: BS, aDeg: number) {
    const ab = Math.abs(aDeg) * DEG;
    const sg = Math.sign(aDeg);
    const cx = xc - sg * ((s.t / 2) * Math.cos(ab)) + sg * ((s.h / 2) * Math.sin(ab));
    const cy = top + (s.t / 2) * Math.sin(ab) + (s.h / 2) * Math.cos(ab);
    book(P(cx, cy, ZF - s.d / 2), qz(-aDeg), s);
  }
  function stack(x: number, top: number, z: number, list: BS[], yaws: number[]) {
    let y = top;
    list.forEach((s, i) => {
      book(P(x, y + s.t / 2, z), qy(yaws[i]).multiply(qz(90)), s);
      y += s.t;
    });
    return y;
  }

  // ---- candles
  function candle(x: number, y: number, z: number, h: number, r: number, wax: string) {
    cyl(r, r, h, 8, wax, x, y + h / 2, z);
    cyl(r * 0.92, r * 0.92, 0.004, 8, "#e0cfa8", x, y + h - 0.001, z);
    for (let k = 0; k < 3; k++) {
      const a = R() * TAU;
      const dl = 0.03 + R() * 0.05;
      cyl(0.0045, 0.006, dl, 5, wax, x + Math.cos(a) * r, y + h - dl / 2, z + Math.sin(a) * r);
      ball(0.0065, wax, x + Math.cos(a) * r, y + h - dl, z + Math.sin(a) * r);
    }
    cyl(0.0025, 0.0025, 0.016, 4, INKC, x, y + h + 0.007, z);
    glow(turn([[0.001, 0], [0.01, 0.008], [0.012, 0.02], [0.007, 0.036], [0.001, 0.056]], x, y + h + 0.012, z, "#ff9d2e", 6), 1.8);
    glow(turn([[0.001, 0], [0.006, 0.006], [0.0065, 0.014], [0.001, 0.03]], x, y + h + 0.014, z, "#fff4b0", 6), 2);
    spark(x + 0.035, y + h + 0.075, z, 0.05, "#ffd27a");
  }
  function holder(x: number, y: number, z: number) {
    turn([[0.05, 0], [0.05, 0.008], [0.014, 0.02], [0.012, 0.06], [0.03, 0.07], [0.034, 0.08]], x, y, z, goldP, 8);
    return y + 0.08;
  }

  // ---- orbs
  function orbStand(x: number, y: number, z: number, r: number, tex: THREE.Texture, strength: number) {
    const k = r / 0.12;
    turn(
      ([[0.07, 0], [0.07, 0.012], [0.04, 0.025], [0.025, 0.04], [0.03, 0.055], [0.07, 0.085], [0.078, 0.09]] as [number, number][]).map(
        ([a, c]) => [a * k, c * k] as [number, number],
      ),
      x, y, z, goldP, 8,
    );
    const cy = y + 0.09 * k + r * 0.7;
    glow(b.part(new THREE.SphereGeometry(r, 14, 10), "#ffffff", { at: [x, cy, z], texture: tex }), strength);
    for (let i = 0; i < 3; i++) {
      const a = i * (TAU / 3) + 0.4;
      ball(0.012 * k, GOLD, x + Math.cos(a) * 0.075 * k, y + 0.01 * k, z + Math.sin(a) * 0.075 * k, { scale: [1, 0.7, 1] });
    }
    return cy;
  }
  function floatOrb(x: number, y: number, z: number, r: number) {
    glow(b.part(new THREE.SphereGeometry(r, 12, 8), "#ffffff", { at: [x, y, z], texture: ORBC }), 1.4);
    [[60, 0, 20], [-30, 0, -50], [10, 0, 80]].forEach((rot, i) =>
      b.part(new THREE.TorusGeometry(r * (1.7 + i * 0.25), 0.003, 4, 24), GOLD, { at: [x, y, z], rotation: rot }),
    );
    for (let i = 0; i < 4; i++) {
      const a = i * (TAU / 4) + 0.5;
      glow(ball(0.007, "#b8f6ff", x + Math.cos(a) * r * 2.2, y + Math.sin(a * 1.5) * r * 1.5, z + Math.sin(a) * r * 2.2), 1.5);
    }
    spark(x + r * 2.4, y + r * 1.8, z + 0.02, 0.06, "#c6f6ff");
    spark(x - r * 2.2, y - r * 1.2, z + 0.02, 0.04, "#ffe9a0");
  }

  // ---- scrolls
  function scroll(x: number, y: number, z: number, len: number, r: number, dir: number[], col: string, band: string | null) {
    const d = P(dir[0], dir[1], dir[2]).normalize();
    b.part(new THREE.CylinderGeometry(r, r, len, 8), col, { at: [x, y, z], dir: [d.x, d.y, d.z] });
    b.part(new THREE.CylinderGeometry(r * 0.32, r * 0.32, len + 0.04, 6), GOLD, { at: [x, y, z], dir: [d.x, d.y, d.z] });
    if (band) {
      const p = P(x, y, z).addScaledVector(d, len * 0.28);
      b.part(new THREE.CylinderGeometry(r * 1.1, r * 1.1, 0.02, 8), band, { at: p, dir: [d.x, d.y, d.z] });
    }
  }

  // ---- stars / moon outlines
  const starOutline = (Rr: number, r: number) => {
    const o: [number, number, "sharp"][] = [];
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r : Rr;
      o.push([Math.cos(a) * rr, Math.sin(a) * rr, "sharp"]);
    }
    return o;
  };
  const star = (x: number, y: number, z: number, Rr: number, color: string, th: number, strength: number) =>
    glow(b.extrude(starOutline(Rr, Rr * 0.45), { at: [x, y, z], x: [1, 0, 0], y: [0, 1, 0], thickness: th, bevel: th * 0.2, color }), strength);

  // ================================================================== STRUCTURE
  // dais + rug
  b.part(new THREE.BoxGeometry(2.4, 0.035, 1.3), stoneP, { at: [0, 0.0175, 0.2] });
  b.part(new THREE.BoxGeometry(2.28, 0.025, 1.18), stoneP, { at: [0, 0.0475, 0.2] });
  b.part(new THREE.BoxGeometry(2.0, 0.014, 1.0), "#6a1a35", { at: [0, 0.067, 0.25] });
  b.part(new THREE.PlaneGeometry(2.0, 1.0), "#ffffff", { at: [0, 0.0755, 0.25], rotation: [-90, 0, 0], texture: RUG });

  // carcass
  for (const s of [1, -1]) bx(0.08, 2.24, 0.42, woodV, s * 0.71, Y0 + 1.12, 0);
  bx(1.56, 0.14, 0.46, woodD, 0, Y0 + 0.07, 0);
  bx(1.58, 0.012, 0.48, GOLD, 0, Y0 + 0.146, 0);
  bx(1.34, 2.1, 0.03, woodD, 0, Y0 + 1.19, -0.195);
  b.part(new THREE.PlaneGeometry(1.34, 1.56), "#ffffff", { at: [0, Y0 + 1.42, -0.1788], texture: SKY });
  LV.slice(0, 3).forEach((l) => {
    bx(1.34, 0.04, 0.4, woodH, 0, Y0 + l, 0);
    bx(1.34, 0.014, 0.012, GOLD, 0, Y0 + l, 0.206);
  });
  bx(1.56, 0.045, 0.44, woodH, 0, Y0 + LV[3], 0);
  bx(1.56, 0.014, 0.012, GOLD, 0, Y0 + LV[3], 0.226);
  for (let i = 0; i < 5; i++) glow(ball(0.014, "#4ad8ff", -0.6 + i * 0.3, Y0 + LV[3], 0.232), 0.9);

  // cabinet doors
  [[1, DOOR_M], [-1, DOOR_S]].forEach(([s, tex]) => {
    const sx = s as number;
    bx(0.66, 0.5, 0.03, woodV, sx * 0.335, Y0 + 0.39, 0.2);
    b.part(new THREE.PlaneGeometry(0.6, 0.42), "#ffffff", { at: [sx * 0.335, Y0 + 0.39, 0.2155], texture: tex as THREE.Texture });
    ball(0.019, GOLD, sx * 0.05, Y0 + 0.39, 0.235);
    for (const hy of [0.2, 0.58]) bx(0.07, 0.03, 0.006, GOLD, sx * 0.62, Y0 + hy, 0.218);
  });

  // pillars with finials
  for (const s of [1, -1]) {
    turn(
      [[0.058, 0], [0.058, 0.03], [0.04, 0.05], [0.032, 0.09], [0.032, 0.5], [0.042, 0.53], [0.042, 0.57], [0.032, 0.6], [0.032, 1.0], [0.042, 1.03], [0.042, 1.07], [0.032, 1.1], [0.032, 1.5], [0.042, 1.53], [0.042, 1.57], [0.032, 1.6], [0.032, 2.0], [0.05, 2.03], [0.058, 2.08], [0.058, 2.1]],
      s * 0.76, Y0 + 0.14, 0.2, pillarP, 8,
    );
    turn([[0.04, 0], [0.04, 0.02], [0.015, 0.05], [0.01, 0.12], [0.003, 0.17]], s * 0.76, CTOP, 0.2, goldP, 8);
    glow(ball(0.024, "#7cf0ff", s * 0.76, CTOP + 0.2, 0.2), 1.6);
    spark(s * 0.76 + 0.05, CTOP + 0.25, 0.22, 0.07, "#c6f6ff");
    // side runes
    bx(0.008, 0.5, 0.3, "#14183f", s * 0.754, Y0 + 1.25, 0);
    bx(0.01, 0.014, 0.32, GOLD, s * 0.7565, Y0 + 1.25 + 0.257, 0);
    bx(0.01, 0.014, 0.32, GOLD, s * 0.7565, Y0 + 1.25 - 0.257, 0);
    for (const k of [1, -1]) bx(0.01, 0.52, 0.014, GOLD, s * 0.7565, Y0 + 1.25, k * 0.157);
    glow(
      b.part(new THREE.PlaneGeometry(0.26, 0.4), "#ffffff", { at: [s * 0.7595, Y0 + 1.25, 0], dir: [s, 0, 0], axis: "z", texture: RUNES }),
      1.1,
    );
  }

  // back panel dressing
  {
    const zb = -0.2115;
    glow(
      b.part(new THREE.PlaneGeometry(1.3, 1.9), "#ffffff", { at: [0, Y0 + 1.19, zb], dir: [0, 0, -1], axis: "z", texture: SKY }),
      0.55,
    );
    for (const yy of [Y0 + 0.235, Y0 + 2.145]) bx(1.34, 0.024, 0.01, GOLD, 0, yy, -0.213);
    for (const k of [1, -1]) bx(0.024, 1.93, 0.01, GOLD, k * 0.66, Y0 + 1.19, -0.213);
    glow(b.part(new THREE.CircleGeometry(0.3, 24), "#ffffff", { at: [0, Y0 + 1.4, zb - 0.003], dir: [0, 0, -1], axis: "z", texture: EMBL }), 1.2);
    b.part(new THREE.TorusGeometry(0.31, 0.01, 4, 24), GOLD, { at: [0, Y0 + 1.4, -0.214] });
    for (const k of [1, -1]) {
      glow(
        b.part(new THREE.PlaneGeometry(0.3, 0.4), "#ffffff", { at: [k * 0.42, Y0 + 0.75, zb - 0.002], dir: [0, 0, -1], axis: "z", texture: RUNES }),
        1.1,
      );
      star(k * 0.42, Y0 + 1.95, -0.222, 0.07, "#ffe27a", 0.012, 1.3);
    }
  }

  // crown
  bx(1.64, 0.022, 0.43, woodD, 0, CTOP + 0.011, 0);
  bx(1.66, 0.01, 0.45, GOLD, 0, CTOP + 0.003, 0);
  const crown: [number, number, "sharp"?][] = [[-0.78, 0]];
  const trim: number[][] = [];
  for (let i = 0; i <= 14; i++) {
    const x = -0.78 + (1.56 * i) / 14;
    const y = 0.05 + 0.3 * Math.pow(1 - Math.abs(x) / 0.78, 1.5);
    crown.push(i === 7 ? [x, y, "sharp"] : [x, y]);
    trim.push([x, CTOP + 0.022 + y - 0.03, 0.194]);
  }
  crown.push([0.78, 0]);
  const shingles = cel(scales(["#2c7f8c", "#348f9a", "#276f7c"], "#143c48", { size: 0.07, width: 0.14 }), "#1a4a58");
  const roofP = paint((_p, n) => (Math.abs(n.z) > 0.5 ? woodH : shingles));
  b.extrude(crown as any, { at: [0, CTOP + 0.022, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.38, bevel: 0.01, color: roofP });
  b.sweep(trim, 0.01, { color: GOLD, sides: 6 });
  glow(b.part(new THREE.CircleGeometry(0.13, 20), "#ffffff", { at: [0, CTOP + 0.2, 0.1925], texture: EMBL }), 1.1);
  b.part(new THREE.TorusGeometry(0.138, 0.009, 4, 20), GOLD, { at: [0, CTOP + 0.2, 0.195] });
  [[-0.38, 0.12], [0.38, 0.12], [-0.6, 0.085], [0.6, 0.085]].forEach(([x, y]) => star(x, CTOP + 0.022 + y - 0.02, 0.196, 0.03, "#ffe27a", 0.012, 1.2));

  // wizard hat perched on the left roof slope
  {
    const hx = -0.5;
    const rf = 0.3 * Math.pow(1 - Math.abs(hx) / 0.78, 1.5);
    const slope = (0.3 * 1.5 * Math.sqrt(1 - Math.abs(hx) / 0.78)) / 0.78;
    const A = P(-slope, 1, 0).normalize();
    const base = P(hx, CTOP + 0.022 + 0.05 + rf - 0.01, 0);
    const ad = [A.x, A.y, A.z];
    const hatP = cel("#6a3fc8", "#3d2390");
    b.lathe(
      [[0, 0], [0.14, 0], [0.14, 0.01], [0.075, 0.024], [0.062, 0.07], [0.045, 0.14], [0, 0.14]],
      { at: [base.x, base.y, base.z], axis: ad, segments: 14, color: hatP },
    );
    const b2 = base.clone().addScaledVector(A, 0.14);
    const A2 = A.clone().multiplyScalar(Math.cos(0.55)).addScaledVector(P(0, 0, 1), Math.sin(0.55));
    ball(0.047, hatP, b2.x, b2.y, b2.z);
    b.lathe(
      [[0, 0], [0.047, 0], [0.036, 0.06], [0.02, 0.11], [0.008, 0.15], [0, 0.17]],
      { at: [b2.x, b2.y, b2.z], axis: [A2.x, A2.y, A2.z], segments: 12, color: hatP },
    );
    const b3 = b2.clone().addScaledVector(A2, 0.17);
    glow(ball(0.014, "#ffe27a", b3.x, b3.y, b3.z), 1.5);
    spark(b3.x + 0.03, b3.y + 0.05, b3.z, 0.06, "#ffe9a0");
    const bp = base.clone().addScaledVector(A, 0.05);
    b.part(new THREE.CylinderGeometry(0.071, 0.075, 0.024, 12), goldP, { at: [bp.x, bp.y, bp.z], dir: ad });
    star(bp.x, bp.y, bp.z + 0.08, 0.022, "#ffe27a", 0.01, 1.4);
  }

  // crescent finial
  {
    const Rr = 0.12;
    const d = 0.055;
    const phi = 48 * DEG;
    const ex = Rr * Math.cos(phi);
    const ey = Rr * Math.sin(phi);
    const ri = Math.hypot(ex - d, ey);
    const al = Math.atan2(ey, ex - d);
    const pts: [number, number][] = [];
    const N = 14;
    for (let i = 0; i <= N; i++) {
      const a = phi + ((TAU - 2 * phi) * i) / N;
      pts.push([Math.cos(a) * Rr, Math.sin(a) * Rr]);
    }
    for (let i = 1; i < N; i++) {
      const a = TAU - al - ((TAU - 2 * al) * i) / N;
      pts.push([d + Math.cos(a) * ri, Math.sin(a) * ri]);
    }
    const rot = pts.map(([x, y]) => [-y, x] as [number, number]);
    const peak = CTOP + 0.022 + 0.35;
    cyl(0.012, 0.022, 0.1, 6, goldP, 0, peak + 0.04, 0);
    const cy = peak + 0.1 + Rr * 0.85;
    b.extrude(rot, { at: [0, cy, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, bevel: 0.01, color: goldP });
    glow(b.part(new THREE.SphereGeometry(0.045, 12, 8), "#ffffff", { at: [0, cy + d + 0.0, 0], texture: ORBC }), 1.5);
    spark(0.1, cy + 0.12, 0.05, 0.08, "#c6f6ff");
    spark(-0.12, cy + 0.02, 0.05, 0.05, "#ffe9a0");
  }

  // ================================================================== SHELF 1 (above cabinet)
  {
    const t = T[0];
    const left = rb(8);
    const e = row(-0.655, t, left);
    const l1: BS = { t: 0.05, h: 0.36, d: 0.24, c: BC[3], tx: SP[1] };
    const l2: BS = { t: 0.046, h: 0.33, d: 0.22, c: BC[6], tx: SP[0] };
    lean(e + l1.h * Math.sin(14 * DEG), t, l1, -14);
    lean(e + l1.h * Math.sin(14 * DEG) + l1.t / Math.cos(14 * DEG), t, l2, -14);
    // crystal ball
    orbStand(0.11, t, 0.0, 0.12, ORBP, 1.2);
    spark(0.27, t + 0.25, 0.1, 0.07, "#e9b8ff");
    spark(-0.04, t + 0.12, 0.12, 0.045, "#ffffff");
    // scroll pyramid (along z)
    const r = 0.026;
    const pz = 0.04;
    const rowsDef: [number, number, number][] = [
      [0.31, t + r, 0], [0.364, t + r, 1], [0.418, t + r, 2],
      [0.337, t + r + 0.047, 3], [0.391, t + r + 0.047, 4], [0.364, t + r + 0.094, 5],
    ];
    rowsDef.forEach(([x, y, i]) => scroll(x, y, pz, 0.26, r, [0, 0, 1], PARCH[i % 3], BANDS[i % 4]));
    // candle on lying books
    const topY = stack(0.56, t, 0.02, [lying(0.05, 0.2, 0.15, 6), lying(0.045, 0.17, 0.14, 1)], [8, -14]);
    candle(0.56, topY, 0.02, 0.16, 0.022, "#f4e9d0");
  }

  // ================================================================== SHELF 2
  {
    const t = T[1];
    const topY = stack(-0.5, t, 0.02, [lying(0.055, 0.25, 0.17, 4), lying(0.05, 0.2, 0.16, 0), lying(0.05, 0.22, 0.16, 7)], [-6, 12, -10]);
    const hy = holder(-0.5, topY, 0.02);
    candle(-0.5, hy, 0.02, 0.13, 0.02, "#e9d9f0");
    row(-0.36, t, rb(6));
    // hourglass
    {
      const x = 0.1;
      cyl(0.04, 0.04, 0.008, 8, GOLD, x, t + 0.004, 0.02);
      cyl(0.04, 0.04, 0.008, 8, GOLD, x, t + 0.164, 0.02);
      for (let k = 0; k < 3; k++) {
        const a = (k * TAU) / 3 + 0.5;
        cyl(0.004, 0.004, 0.16, 5, GOLD_D, x + Math.cos(a) * 0.034, t + 0.084, 0.02 + Math.sin(a) * 0.034);
      }
      glow(turn([[0.001, 0.008], [0.028, 0.008], [0.03, 0.02], [0.026, 0.04], [0.004, 0.08]], x, t, 0.02, "#ffb347", 8), 0.8);
      turn([[0.004, 0.08], [0.026, 0.105], [0.03, 0.135], [0.028, 0.16]], x, t, 0.02, "#c4ecff", 8);
    }
    // potions
    [[0.22, "#5cff9a", 0.0], [0.31, "#ff6fb5", 0.02]].forEach(([x, col, dz], i) => {
      const xx = x as number;
      const zz = 0.03 + (dz as number);
      glow(turn([[0.035, 0], [0.045, 0.03], [0.045, 0.06], [0.015, 0.09], [0.014, 0.12], [0.02, 0.125], [0.02, 0.135]], xx, t, zz, col as string, 8), 0.9);
      cyl(0.013, 0.016, 0.03, 6, "#8a5a32", xx, t + 0.15, zz);
      cyl(0.043, 0.047, 0.012, 8, i ? "#7b3fd8" : GOLD, xx, t + 0.04, zz);
      spark(xx + 0.05, t + 0.17, zz + 0.05, 0.04, col as string);
    });
    const e = row(0.39, t, rb(3));
    const ls: BS = { t: 0.05, h: 0.3, d: 0.22, c: BC[2], tx: SP[2] };
    lean(0.67 - ls.h * Math.sin(14 * DEG), t, ls, 14);
    void e;
  }

  // ================================================================== SHELF 3
  {
    const t = T[2];
    // skull + candle
    {
      const x = -0.55;
      ball(0.055, "#efe6cf", x, t + 0.066, 0.02, { scale: [1, 0.95, 1.05] });
      bx(0.07, 0.03, 0.06, "#e2d7bb", x, t + 0.016, 0.026);
      for (const s of [1, -1]) glow(ball(0.016, "#b46bff", x + s * 0.02, t + 0.068, 0.068), 1.5);
      b.part(new THREE.ConeGeometry(0.008, 0.018, 3), INKC, { at: [x, t + 0.044, 0.073], rotation: [180, 0, 0] });
      candle(x, t + 0.11, 0.02, 0.11, 0.018, "#f1c8cf");
    }
    row(-0.4, t, rb(4));
    // open grimoire
    {
      const x = -0.02;
      const z = 0.03;
      bx(0.34, 0.016, 0.22, "#27325f", x, t + 0.008, z);
      bx(0.34, 0.005, 0.22, GOLD, x, t + 0.0185, z - 0.0, {});
      for (const s of [1, -1]) {
        const tilt = s * 7;
        const px = x - s * 0.073;
        bx(0.14, 0.022, 0.19, PAGE, px, t + 0.03, z, { quat: qz(tilt) });
        glow(
          b.part(new THREE.PlaneGeometry(0.115, 0.15), "#ffffff", {
            at: [px, t + 0.0425, z],
            quat: qz(tilt).multiply(qx(-90)),
            texture: RUNES,
          }),
          1.2,
        );
      }
      floatOrb(x, t + 0.3, z, 0.04);
      for (let i = 0; i < 3; i++) spark(x - 0.1 + i * 0.1, t + 0.1 + i * 0.03, z + 0.06, 0.04, "#7cf0ff");
    }
    // scroll urn
    {
      const x = 0.3;
      turn([[0.04, 0], [0.06, 0.03], [0.065, 0.08], [0.05, 0.13], [0.055, 0.16], [0.06, 0.17]], x, t, 0.02, tealP, 9);
      cyl(0.063, 0.063, 0.012, 9, GOLD, x, t + 0.17, 0.02);
      cyl(0.067, 0.067, 0.01, 9, GOLD, x, t + 0.08, 0.02);
      const specs: [number, number, number, number][] = [
        [-0.025, -0.01, 0.34, -6], [0.02, 0.01, 0.3, 8], [0.0, -0.025, 0.37, 2], [0.03, -0.02, 0.28, 12], [-0.015, 0.025, 0.31, -10],
      ];
      specs.forEach(([ox, oz, len, tilt], i) => {
        const d = P(Math.sin(tilt * DEG), Math.cos(tilt * DEG), 0);
        const base = P(x + ox, t + 0.08, 0.02 + oz);
        const c = base.clone().addScaledVector(d, len / 2);
        scroll(c.x, c.y, c.z, len, 0.016, [d.x, d.y, d.z], PARCH[i % 3], i % 2 ? BANDS[i % 4] : null);
      });
    }
    orbStand(0.47, t, 0.03, 0.055, ORBC, 1.2);
    spark(0.52, t + 0.15, 0.08, 0.05, "#c6f6ff");
    const ls: BS = { t: 0.048, h: 0.33, d: 0.23, c: BC[5], tx: SP[0] };
    lean(0.67 - ls.h * Math.sin(12 * DEG), t, ls, 12);
    // hanging stars
    [[-0.22, 0.1], [0.18, 0.15], [0.42, 0.08]].forEach(([x, len]) => {
      cyl(0.0022, 0.0022, len, 4, GOLD, x, CEIL - len / 2, 0.15);
      star(x, CEIL - len - 0.03, 0.15, 0.032, "#ffe27a", 0.014, 1.3);
    });
  }

  // ================================================================== FLOOR PROPS
  // left: book pile with a tall melted candle
  {
    const top = stack(
      -0.98, FL, 0.12,
      [lying(0.06, 0.28, 0.2, 0), lying(0.055, 0.25, 0.19, 5), lying(0.05, 0.23, 0.17, 3), lying(0.045, 0.2, 0.15, 1)],
      [12, -9, 20, -14],
    );
    candle(-0.98, top, 0.12, 0.24, 0.03, "#f7efd8");
    scroll(-0.9, FL + 0.026, 0.42, 0.34, 0.026, [0.2, 0, 1], PARCH[1], BANDS[0]);
    scroll(-0.84, FL + 0.026, 0.5, 0.3, 0.024, [-0.3, 0, 1], PARCH[2], BANDS[3]);
  }
  // right: candle cluster on a saucer
  {
    const cx = 0.98;
    const cz = 0.12;
    turn([[0.13, 0], [0.13, 0.014], [0.1, 0.026], [0.08, 0.03]], cx, FL, cz, goldP, 10);
    cyl(0.09, 0.1, 0.012, 9, "#f4ead0", cx, FL + 0.028, cz);
    candle(cx - 0.02, FL + 0.03, cz, 0.3, 0.03, "#f4e9d0");
    candle(cx + 0.055, FL + 0.03, cz + 0.035, 0.2, 0.025, "#bde4f2");
    candle(cx + 0.005, FL + 0.03, cz + 0.075, 0.13, 0.022, "#f1c8cf");
  }
  // mana crystals, front right
  {
    const cx = 0.78;
    const cz = 0.62;
    ball(0.12, stoneP, cx, FL + 0.01, cz, { scale: [1, 0.4, 1] });
    const dirs: [number[], number, string][] = [
      [[0, 1, 0], 0.26, "#5fe6ff"], [[0.35, 0.9, 0.1], 0.18, "#b58bff"], [[-0.4, 0.85, -0.1], 0.2, "#5fe6ff"],
      [[0.1, 0.8, 0.45], 0.14, "#b58bff"], [[-0.15, 0.75, -0.45], 0.12, "#7cf0ff"],
    ];
    dirs.forEach(([d, len, col], i) => {
      const a = i * 1.3;
      glow(b.spike(P(cx + Math.cos(a) * 0.035, FL + 0.02, cz + Math.sin(a) * 0.035), d, len, 0.035 - i * 0.003, { color: col, sides: 5, caps: "point" }), 1.3);
    });
    spark(cx + 0.12, FL + 0.3, cz + 0.05, 0.08, "#c6f6ff");
    spark(cx - 0.14, FL + 0.18, cz + 0.08, 0.05, "#e9b8ff");
  }
  // lamp posts on dais corners
  for (const s of [1, -1]) {
    turn([[0.04, 0], [0.04, 0.02], [0.022, 0.04], [0.022, 0.2], [0.04, 0.23], [0.04, 0.25]], s * 1.08, 0.06, 0.72, goldP, 8);
    glow(b.part(new THREE.SphereGeometry(0.05, 10, 8), "#ffffff", { at: [s * 1.08, 0.34, 0.72], texture: s > 0 ? ORBC : ORBP }), 1.3);
    spark(s * 1.08 + 0.07, 0.42, 0.74, 0.06, "#ffe9a0");
  }
  // floating glints
  spark(0.0, 0.9, 0.55, 0.05, "#ffe9a0");
  spark(-0.5, 1.4, 0.4, 0.04, "#c6f6ff");

  // ------------------------------------------------------------------ sparkles flush
  for (const s of sparks.values()) {
    glow(
      b.cards(
        s.at.map((p) => frame(p, [0, 1, 0])),
        SPARK,
        { size: [s.size, s.size], flow: [0, 0, 1], sink: 0, color: s.color },
      ),
    );
  }

  return b.root;
}
