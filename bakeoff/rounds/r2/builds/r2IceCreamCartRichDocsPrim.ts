import * as THREE from "three";
import { createBuilder, paint, spots, rng } from "../../../../src/index";

export const meta = {
  name: "Seaside Ice Cream Cart",
  description:
    "A mint and cream push cart with a scalloped pink and white canopy, spoked wheels, a chrome freezer lid, a cone-shaped sign and a crown of giant pastel fake cones.",
};

const MINT = "#9fe3c8";
const MINT_DOT = "#c9f5e4";
const CREAM = "#fff3d6";
const PINK = "#ff8fb1";
const WHITE = "#fffaf2";
const CORAL = "#ff6f8e";
const TIRE = "#40405a";
const CHROME = "#dfe7ec";
const CHROME_DK = "#9fb0ba";
const GOLD = "#ffc94d";
const WAFFLE_A = "#e8b469";
const WAFFLE_B = "#c98d45";
const CHERRY = "#e5304f";
const CHOC = "#8a5a44";
const FLAVOURS = ["#ffb3c7", "#a8e6cf", "#fff1c9", "#b7c4ff", "#ffc99a", "#d9b8ff", "#ffd1e8", "#bff0ff", "#ffe0a3"];

export default function build() {
  const b = createBuilder({ name: "iceCreamCart" });
  const root = b.joint("cart", { at: [0, 0.5, 0] });
  const axleY = 0.455;
  const wheelJ: Record<string, any> = {};
  for (const s of [1, -1]) {
    wheelJ[s] = b.joint(s > 0 ? "wheelL" : "wheelR", { parent: root, at: [s * 0.77, axleY, 0], role: "hinge" });
  }
  const lid = b.joint("lid", { parent: root, at: [0, 1.17, -0.43], aim: [0, 1.17, 0.4], role: "hinge" });

  const P = (geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(geo, color, { at, bone: root, ...o });
  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, at, o);
  const ball = (r: number, color: any, at: number[], o: any = {}) =>
    P(new THREE.SphereGeometry(r, 8, 6), color, at, { flat: true, ...o });

  // ---------- body ----------
  const bodyPaint = spots(MINT, MINT_DOT, { size: 0.1, amount: 0.3, seed: 3 });
  box(1.3, 0.65, 0.8, bodyPaint, [0, 0.825, 0]);
  box(1.34, 0.08, 0.84, CREAM, [0, 0.54, 0]);
  box(1.34, 0.06, 0.84, PINK, [0, 1.1, 0]);
  // front and back cream panels
  for (const s of [1, -1]) {
    box(0.5, 0.42, 0.02, CREAM, [s * 0.36, 0.825, 0.41]);
    box(0.5, 0.01, 0.022, PINK, [s * 0.36, 1.035, 0.41]);
    box(0.5, 0.01, 0.022, PINK, [s * 0.36, 0.615, 0.41]);
  }
  box(1.0, 0.42, 0.02, CREAM, [0, 0.825, -0.41]);
  // side panels
  for (const s of [1, -1]) box(0.02, 0.4, 0.55, CREAM, [s * 0.66, 0.825, 0]);

  const tex1 = svg1("SCOOPS", "#ff5f8a");
  const tex2 = svg1("YUM!", "#3fb58f");
  P(new THREE.PlaneGeometry(0.46, 0.46), "#ffffff", [0.36, 0.825, 0.424], { dir: [0, 0, 1], axis: "z", texture: tex1 });
  P(new THREE.PlaneGeometry(0.46, 0.46), "#ffffff", [-0.36, 0.825, 0.424], { dir: [0, 0, 1], axis: "z", texture: tex2 });

  // ---------- cone sign ----------
  const waffle = paint((_p, _n, s) =>
    (Math.floor((s[0] + s[1]) / 0.04) + Math.floor((s[0] - s[1]) / 0.04)) & 1 ? WAFFLE_A : WAFFLE_B,
  );
  const scoopOutline = (r: number, n: number) => {
    const pts: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const drip = Math.sin(a) < -0.2 && i % 2 === 1 ? 1.2 : 1;
      pts.push([Math.cos(a) * r * drip, Math.sin(a) * r * drip]);
    }
    return pts;
  };
  const X: [number, number, number] = [1, 0, 0];
  const Y: [number, number, number] = [0, 1, 0];
  b.extrude([[0, -0.05, "sharp"], [0.17, 0.33, "sharp"], [-0.17, 0.33, "sharp"]], {
    at: [0, 0.54, 0.405], x: X, y: Y, thickness: 0.02, color: PINK, bone: root,
  });
  b.extrude(scoopOutline(0.175, 12), { at: [0, 0.92, 0.405], x: X, y: Y, thickness: 0.02, color: PINK, bone: root });
  b.extrude([[0, 0, "sharp"], [0.14, 0.3, "sharp"], [-0.14, 0.3, "sharp"]], {
    at: [0, 0.54, 0.41], x: X, y: Y, thickness: 0.03, color: waffle, bone: root,
  });
  b.extrude(scoopOutline(0.14, 16), {
    at: [0, 0.92, 0.415], x: X, y: Y, thickness: 0.03, color: FLAVOURS[0], smoothing: 1, bone: root,
  });
  const r0 = rng(11);
  const sprinkleCols = [WHITE, GOLD, "#6fc7ff", MINT];
  for (let i = 0; i < 9; i++) {
    const a = r0() * Math.PI * 2;
    const d = 0.03 + r0() * 0.08;
    box(0.025, 0.008, 0.008, sprinkleCols[i % 4], [Math.cos(a) * d, 0.95 + Math.sin(a) * d, 0.434], {
      rotation: [0, 0, r0() * 180],
    });
  }

  // ---------- chrome lid ----------
  const lidP = (g: THREE.BufferGeometry, c: any, at: number[]) => b.part(g, c, { at, bone: lid });
  lidP(new THREE.BoxGeometry(1.36, 0.05, 0.86), CHROME, [0, 1.17, 0]);
  lidP(new THREE.BoxGeometry(1.2, 0.04, 0.7), CHROME_DK, [0, 1.205, 0]);
  lidP(new THREE.BoxGeometry(1.1, 0.02, 0.6), CHROME, [0, 1.235, 0]);
  for (const s of [1, -1]) {
    lidP(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6), CHROME_DK, [s * 0.15, 1.24, 0.38]);
    lidP(new THREE.CylinderGeometry(0.035, 0.035, 0.1, 8).rotateZ(Math.PI / 2), CHROME_DK, [s * 0.5, 1.17, -0.43]);
  }
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.4, 6).rotateZ(Math.PI / 2), CHROME_DK, { at: [0, 1.29, 0.38], bone: lid });
  ball(0.025, CORAL, [0.2, 1.29, 0.38], { bone: lid });
  ball(0.025, CORAL, [-0.2, 1.29, 0.38], { bone: lid });

  // ---------- axle, legs, wheels ----------
  b.rod([-0.82, axleY, 0], [0.82, axleY, 0], 0.02, { color: CHROME_DK, bone: root, sides: 6 });
  for (const s of [1, -1]) {
    box(0.1, 0.05, 0.14, CHROME_DK, [s * 0.45, 0.49, 0]);
    // front legs
    b.rod([s * 0.5, 0.52, 0.3], [s * 0.5, 0.05, 0.3], 0.028, { color: CHROME, bone: root, sides: 6, caps: "flat" });
    P(new THREE.CylinderGeometry(0.06, 0.07, 0.05, 8), TIRE, [s * 0.5, 0.025, 0.3]);
    // wheels
    const j = wheelJ[s];
    const x = s * 0.77;
    const W = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { at, bone: j, ...o });
    W(new THREE.TorusGeometry(0.42, 0.04, 6, 24), TIRE, [x, axleY, 0], { rotation: [0, 90, 0] });
    W(new THREE.TorusGeometry(0.385, 0.018, 5, 24), CORAL, [x, axleY, 0], { rotation: [0, 90, 0] });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      b.rod([x, axleY, 0], [x, axleY + Math.cos(a) * 0.385, Math.sin(a) * 0.385], 0.009, {
        color: CREAM, bone: j, sides: 5, caps: "flat",
      });
    }
    W(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8), PINK, [x, axleY, 0], { dir: [1, 0, 0] });
    W(new THREE.SphereGeometry(0.04, 6, 4), GOLD, [x + s * 0.05, axleY, 0], { flat: true });
  }

  // ---------- push handle ----------
  for (const s of [1, -1]) {
    b.rod([s * 0.5, 0.92, -0.4], [s * 0.42, 1.25, -1.0], 0.022, { color: CHROME, bone: root, sides: 6 });
    b.rod([s * 0.5, 0.6, -0.4], [s * 0.43, 1.2, -0.96], 0.014, { color: CHROME_DK, bone: root, sides: 5 });
    ball(0.04, CORAL, [s * 0.44, 1.25, -1.0]);
  }
  b.rod([-0.4, 1.25, -1.0], [0.4, 1.25, -1.0], 0.03, { color: PINK, bone: root, sides: 8 });
  b.rod([-0.14, 1.25, -1.0], [0.14, 1.25, -1.0], 0.034, { color: WHITE, bone: root, sides: 8, caps: "flat" });

  // ---------- canopy ----------
  const Rr = 1.05, rimY = 2.0, peakY = 2.42, N = 16;
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.rod([sx * 0.6, 1.2, sz * 0.35], [sx * 0.6, 2.12, sz * 0.35], 0.022, { color: WHITE, bone: root, sides: 6 });
      P(new THREE.CylinderGeometry(0.05, 0.06, 0.03, 8), CHROME_DK, [sx * 0.6, 1.215, sz * 0.35]);
      ball(0.03, GOLD, [sx * 0.6, 2.1, sz * 0.35]);
    }
  const sw = 2 * Rr * Math.sin(Math.PI / N);
  const scallop: any[] = [[-sw / 2, 0, "sharp"]];
  for (let k = 1; k <= 5; k++) {
    const th = Math.PI + (k * Math.PI) / 6;
    scallop.push([(sw / 2) * Math.cos(th), 0.8 * (sw / 2) * Math.sin(th)]);
  }
  scallop.push([sw / 2, 0, "sharp"]);
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2, am = (a0 + a1) / 2;
    const col = i % 2 ? WHITE : PINK;
    b.slab(
      [[0, peakY, 0], [Rr * Math.sin(a0), rimY, Rr * Math.cos(a0)], [Rr * Math.sin(a1), rimY, Rr * Math.cos(a1)]],
      { color: col, thickness: 0.02, bone: root },
    );
    const rm = Rr * Math.cos(Math.PI / N) + 0.008;
    b.extrude(scallop, {
      at: [rm * Math.sin(am), rimY, rm * Math.cos(am)],
      x: [Math.cos(am), 0, -Math.sin(am)],
      y: [-Math.sin(am) * 0.38, 1, -Math.cos(am) * 0.38],
      thickness: 0.014, color: col, bone: root,
    });
    const tipY = rimY - 0.8 * (sw / 2) * 0.93;
    const tipR = rm + 0.38 * (rimY - tipY) * 0.93 * 0 + 0.07;
    ball(0.028, i % 2 ? PINK : WHITE, [tipR * Math.sin(am), tipY, tipR * Math.cos(am)]);
  }
  ball(0.05, PINK, [0, peakY + 0.02, 0]);
  P(new THREE.ConeGeometry(0.025, 0.1, 6), GOLD, [0, peakY + 0.1, 0]);

  // ---------- crown of giant fake cones ----------
  const wafflePaint = paint((p) =>
    (Math.floor((p.x + p.y) / 0.03) + Math.floor((p.z - p.y) / 0.03)) & 1 ? WAFFLE_A : WAFFLE_B,
  );
  for (let i = 0; i < 9; i++) {
    const ang = ((-80 + 20 * i) * Math.PI) / 180;
    const cx = 0.93 * Math.sin(ang), cz = 0.93 * Math.cos(ang);
    const baseY = 2.03;
    const fl = FLAVOURS[i % FLAVOURS.length];
    P(new THREE.CylinderGeometry(0.03, 0.04, 0.08, 6), CHROME_DK, [cx, baseY + 0.04, cz]);
    P(new THREE.ConeGeometry(0.095, 0.26, 8), wafflePaint, [cx, baseY + 0.08 + 0.13, cz], { rotation: [180, 0, 0] });
    const sy = baseY + 0.08 + 0.26 + 0.04;
    ball(0.115, fl, [cx, sy, cz]);
    P(new THREE.TorusGeometry(0.105, 0.03, 5, 8), fl, [cx, sy - 0.07, cz], { rotation: [90, 0, 0], flat: true });
    if (i % 3 === 0) ball(0.03, CHERRY, [cx, sy + 0.13, cz]);
    else if (i % 3 === 1) P(new THREE.ConeGeometry(0.04, 0.09, 6), CHOC, [cx, sy + 0.14, cz], { flat: true });
    else box(0.03, 0.12, 0.012, WAFFLE_A, [cx + 0.03, sy + 0.14, cz], { rotation: [0, 0, -25] });
  }

  return b.root;
}

function svg1(word: string, col: string) {
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect x="10" y="10" width="180" height="180" rx="28" fill="none" stroke="${col}" stroke-width="6" stroke-dasharray="14 10"/>
      <circle cx="100" cy="58" r="26" fill="${col}"/>
      <polygon points="76,72 124,72 100,118" fill="#e8b469"/>
      <text x="100" y="160" font-size="38" font-weight="bold" text-anchor="middle" fill="${col}" font-family="sans-serif">${word}</text>
    </svg>`,
    { size: 256 },
  );
}
import { svg } from "../../../../src/index";
