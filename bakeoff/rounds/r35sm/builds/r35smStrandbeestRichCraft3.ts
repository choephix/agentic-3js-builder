import * as THREE from "three";
import { createBuilder, frame, polyline, catmull, paint, mix, noise, smoothstep, svg } from "../../../../src/index";

export const meta = {
  name: "Animaris Ventus",
  description:
    "A wind-walking Strandbeest-style beach creature built from yellow tubes: Jansen-linkage legs on cranked axles, a bottle-bladder backbone, sails, a bottle-beaked head with a jaw, and a pennant.",
};

type P3 = [number, number, number];
type P2 = [number, number];

// ---------- Jansen linkage (2D, units ~ cm) ----------
function circ(p0: P2, r0: number, p1: P2, r1: number, sg: number): P2 {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  let d = Math.hypot(dx, dy);
  d = Math.min(Math.max(d, Math.abs(r0 - r1) + 1e-3), r0 + r1 - 1e-3);
  const ux = dx / (Math.hypot(dx, dy) || 1);
  const uy = dy / (Math.hypot(dx, dy) || 1);
  const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(r0 * r0 - a * a, 0));
  return [p0[0] + a * ux + sg * h * -uy, p0[1] + a * uy + sg * h * ux];
}
function solveLeg(thetaDeg: number) {
  const P: P2 = [0, 0];
  const O: P2 = [38, 7.8];
  const t = (thetaDeg * Math.PI) / 180;
  const Q: P2 = [O[0] + 15 * Math.cos(t), O[1] + 15 * Math.sin(t)];
  const A = circ(P, 41.5, Q, 50, 1);
  const B = circ(P, 39.3, A, 40.1, 1);
  const C = circ(B, 55.8, Q, 61.9, -1);
  const D = circ(B, 65.7, C, 49, -1);
  return { P, O, Q, A, B, C, D };
}

export default function build() {
  const b = createBuilder({ name: "strandbeest" });

  // ---------- palette & paints ----------
  const YEL = paint((p, n) => {
    let c = mix("#e9c42b", "#f7da5c", smoothstep(0.3, 0.9, noise(p, 0.5, 3)));
    c = mix(c, "#fff0a6", 0.35 * smoothstep(0.4, 1, n.y));
    c = mix(c, "#b58a1e", 0.45 * smoothstep(0.55, 0.8, noise(p, 0.07, 8)));
    c = mix(c, "#d9c08a", 0.75 * smoothstep(0.45, 0.05, p.y) * (0.5 + 0.5 * noise(p, 0.1, 2)));
    return c;
  });
  const BOTTLE = paint((p, n, s) => {
    const h = s[0];
    let c = mix("#e8f6f4", "#bfe3ea", noise(p, 0.15, 5));
    if (h > 0.12 && h < 0.25) c = mix("#2a74b8", "#1d5a96", noise(p, 0.1, 6));
    if ((h > 0.115 && h < 0.125) || (h > 0.245 && h < 0.255)) c = "#f3f3ee";
    c = mix(c, "#c6b88a", 0.6 * smoothstep(0.7, 1, -n.y));
    return c;
  });
  const SAIL = paint((p, n, s) => {
    let c = mix("#f1e8d2", "#d8ccb0", noise(p, 0.3, 4) * 0.7);
    const f = (s[0] * 6) % 1;
    if (f < 0.02 || f > 0.98) c = "#a99c7e";
    const d = Math.hypot((s[0] - 0.45) * 1.5, (s[1] - 0.4) * 1.0);
    if (d < 0.3 && (d * 16) % 1 < 0.45) c = "#2f5f9e";
    if (d < 0.05) c = "#d8452f";
    if (s[1] < 0.03 || s[1] > 0.97) c = "#b8a67c";
    return mix(c, "#8f8a78", 0.15 * smoothstep(0, -1, n.y) * 0 + 0.0);
  });
  const BLACK = "#1f1d22";
  const STEEL = "#8b9096";
  const ROPE = "#c9b184";
  const RUBBER = "#2d2824";
  const CAP_B = "#2a6fb5";
  const CAP_O = "#e8762a";

  // ---------- textures ----------
  const EYE = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="#fbfaf2" stroke="#22202a" stroke-width="4"/>
      <circle cx="50" cy="52" r="30" fill="#2f9aa8"/>
      <circle cx="50" cy="52" r="30" fill="none" stroke="#1b5f73" stroke-width="4"/>
      <path d="M22 44 Q50 22 78 44 L78 40 Q50 18 22 40Z" fill="#1b5f73"/>
      <circle cx="50" cy="54" r="15" fill="#15141a"/>
      <circle cx="40" cy="42" r="8" fill="#ffffff"/>
      <circle cx="59" cy="63" r="4" fill="#ffffff"/>
      <path d="M6 36 Q50 -2 94 36" fill="none" stroke="#22202a" stroke-width="6" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const pennant = (flip: boolean) =>
    svg(
      `<svg viewBox="0 0 100 56"><g ${flip ? 'transform="translate(100 0) scale(-1 1)"' : ""}>
        <path d="M2 2 H98 L72 28 L98 54 H2Z" fill="#d8452f" stroke="#2a1a1a" stroke-width="3" stroke-linejoin="round"/>
        <path d="M14 30 q8 -11 16 0 t16 0 t16 0" fill="none" stroke="#fff4dc" stroke-width="4" stroke-linecap="round"/>
        <path d="M14 42 q8 -9 16 0 t16 0" fill="none" stroke="#fff4dc" stroke-width="3" stroke-linecap="round"/>
        <circle cx="26" cy="14" r="6" fill="#ffd44a" stroke="#2a1a1a" stroke-width="1.5"/>
      </g></svg>`,
      { size: 256 },
    );
  const PEN_R = pennant(false);
  const PEN_L = pennant(true);
  const PLATE = svg(
    `<svg viewBox="0 0 130 38">
      <rect x="2" y="2" width="126" height="34" rx="5" fill="#26262e" stroke="#f1e6c4" stroke-width="3"/>
      <text x="65" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="17" fill="#f1e6c4">ANIMARIS</text>
      <text x="65" y="32" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#e8b84a">VENTUS  No.07</text>
    </svg>`,
    { size: 256 },
  );

  // ---------- layout constants ----------
  const S = 0.013;
  const XB = [0.46, 0.66, 0.46];
  const ZC = [-0.8, 0, 0.8];
  const PO = 0.06;
  const zP = (i: number) => ZC[i] - 38 * S;

  type Unit = { i: number; s: number; xb: number; n: ReturnType<typeof solveLeg> };
  const units: Unit[] = [];
  for (let i = 0; i < 3; i++)
    for (const s of [1, -1]) units.push({ i, s, xb: XB[i], n: solveLeg(i * 120 + (s < 0 ? 180 : 0)) });
  let minY = Infinity;
  for (const u of units) for (const k of ["A", "B", "C", "D"] as const) minY = Math.min(minY, u.n[k][1]);
  const yP = -minY * S + 0.03;
  const yO = yP + 7.8 * S;
  const sy = yP + 0.55;
  const to3 = (u: Unit, n: P2, off: number): P3 => [u.s * u.xb + off, yP + n[1] * S, zP(u.i) + n[0] * S];
  const mid3 = (a: P3, c: P3): P3 => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, sy, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, sy, -1.7],
      [0, sy, -0.8],
      [0, sy, 0.1],
      [0, sy, 1.0],
      [0, sy, 1.8],
    ]),
    { parent: hips, role: "spine" },
  );
  const head = b.joint("head", { parent: spine.joints[3], at: [0, sy, 1.8], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, sy - 0.04, 1.8], dir: [0, 0, 1], role: "jaw" });
  const mast = b.joint("mast", { parent: spine.joints[1], at: [0, sy, -0.3], dir: [0, 1, 0] });
  const tail = b.chain(
    "tail",
    catmull([
      [0, sy, -1.7],
      [0, sy + 0.08, -2.0],
      [0, sy + 0.3, -2.3],
      [0, sy + 0.7, -2.45],
    ]),
    { parent: spine.joints[0], count: 3, role: "tail" },
  );
  const cranks = ZC.map((z, i) => b.joint(`crank${i + 1}`, { parent: hips, at: [0, yO, z], dir: [1, 0, 0], role: "hinge" }));
  const sj = (p: P3) => spine.nearestJoint(p);
  const rod = (a: P3, c: P3, r: number | [number, number], col: any = YEL, bone?: any) =>
    b.rod(a, c, r, col, { bone: bone ?? sj(mid3(a, c)) });
  const node = (at: P3, bone: any, col: string = BLACK, len = 0.04, r = 0.02) =>
    b.part(new THREE.CylinderGeometry(r, r, len, 8), col, { at, dir: [1, 0, 0], bone });

  // ---------- backbone ----------
  const spineTube = b.sweep(spine, 0.036, { color: YEL, caps: "flat" });
  const tie = new THREE.TorusGeometry(0.045, 0.011, 5, 8).rotateX(Math.PI / 2);
  b.along(spineTube, 12, (at) => b.part(tie, BLACK, { frame: at }));
  b.sweep(tail, [0.03, 0.012], { color: YEL, caps: "round" });
  b.part(new THREE.SphereGeometry(0.036, 8, 6), BLACK, { at: [0, sy, -1.7], bone: spine.joints[0] });

  // ---------- legs, axles, frame ----------
  for (let i = 0; i < 3; i++) {
    const xo = XB[i] + 0.14;
    const zpiv = zP(i);
    // crank axle & pivot axle
    rod([-xo, yO, ZC[i]], [xo, yO, ZC[i]], 0.026, STEEL, cranks[i]);
    rod([-xo, yP, zpiv], [xo, yP, zpiv], 0.02, YEL, sj([0, sy, zpiv]));
    for (const s of [1, -1]) {
      node([s * xo, yO, ZC[i]], cranks[i], BLACK, 0.03, 0.04);
      node([s * xo, yP, zpiv], sj([0, sy, zpiv]), BLACK, 0.03, 0.03);
      // A-frame struts
      rod([0, sy, zpiv], [s * xo, yP, zpiv], 0.022);
      rod([0, sy, ZC[i]], [s * xo, yO, ZC[i]], 0.022);
      // fixed link pivot -> crank centre
      rod([s * XB[i], yP, zpiv], [s * XB[i], yO, ZC[i]], 0.017);
      // diagonal bracing to next unit
      if (i < 2) rod([0, sy, ZC[i]], [s * (XB[i + 1] + 0.14), yP, zP(i + 1)], 0.014);
    }
  }

  for (const u of units) {
    const sd = u.s > 0 ? "L" : "R";
    const P3: P3 = to3(u, u.n.P, 0);
    const C3: P3 = to3(u, u.n.C, 0);
    const D3: P3 = to3(u, u.n.D, 0);
    const leg = b.chain(`leg${sd}${u.i + 1}`, polyline([P3, C3, D3]), {
      parent: sj(P3),
      names: [`hip${sd}${u.i + 1}`, `knee${sd}${u.i + 1}`, `foot${sd}${u.i + 1}`],
      role: "leg",
      contact: [D3[0], 0, D3[2]],
    });
    const hipJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const footJ = leg.joints[2];
    for (const off of [PO, -PO]) {
      const g = (k: keyof typeof u.n) => to3(u, u.n[k], off);
      const bars: [keyof typeof u.n, keyof typeof u.n, any, number][] = [
        ["P", "A", hipJ, 0.013],
        ["P", "B", hipJ, 0.013],
        ["A", "B", hipJ, 0.013],
        ["A", "Q", hipJ, 0.013],
        ["B", "C", hipJ, 0.013],
        ["Q", "C", hipJ, 0.013],
        ["B", "D", kneeJ, 0.013],
        ["C", "D", kneeJ, 0.013],
      ];
      for (const [a, c, bone, r] of bars) b.rod(g(a), g(c), r, YEL, { bone });
      rod(g("O"), g("Q"), 0.014, STEEL, cranks[u.i]);
      for (const k of ["A", "B", "C"] as const) node(g(k), k === "C" ? kneeJ : hipJ);
      node(g("Q"), cranks[u.i], "#c43a2a", 0.045, 0.019);
      const f = g("D");
      b.part(new THREE.SphereGeometry(0.032, 8, 6), RUBBER, { at: f, bone: footJ });
      node(f, kneeJ, BLACK, 0.04, 0.02);
    }
  }

  // ---------- bottle bladders ----------
  const BOT: [number, number][] = [
    [0, 0],
    [0.06, 0],
    [0.085, 0.03],
    [0.09, 0.2],
    [0.086, 0.27],
    [0.06, 0.32],
    [0.03, 0.35],
    [0.03, 0.385],
    [0, 0.385],
  ];
  function bottle(base: P3, dir: P3, k: number, cap: string, bone?: any) {
    const bn = bone ?? sj(base);
    b.lathe(
      BOT.map(([x, y]) => [x * k, y * k] as [number, number]),
      { at: base, axis: dir, segments: 10, color: BOTTLE, bone: bn },
    );
    const at: P3 = [base[0] + dir[0] * 0.395 * k, base[1] + dir[1] * 0.395 * k, base[2] + dir[2] * 0.395 * k];
    b.part(new THREE.CylinderGeometry(0.034 * k, 0.034 * k, 0.035 * k, 8), cap, { at, dir, bone: bn });
  }
  const BZ = [-1.5, -1.1, -0.65, 0.35, 0.75, 1.15];
  BZ.forEach((z, j) => {
    for (const s of [1, -1]) {
      const fwd = (j + (s > 0 ? 0 : 1)) % 2 === 0;
      const y = sy + 0.13;
      const base: P3 = [s * 0.17, y, fwd ? z - 0.195 : z + 0.195];
      bottle(base, [0, 0, fwd ? 1 : -1], 1, j % 3 === 0 ? CAP_O : CAP_B);
      rod([0, sy, z], [s * 0.17, y - 0.02, z], 0.01);
      b.part(new THREE.TorusGeometry(0.092, 0.008, 4, 10), BLACK, { at: [s * 0.17, y, z], dir: [0, 0, 1], bone: sj([0, sy, z]) });
    }
  });

  // ---------- head ----------
  const hz = 1.78;
  for (const s of [1, -1]) {
    const c: P3 = [s * 0.19, sy + 0.2, hz + 0.05];
    const eye = b.part(new THREE.SphereGeometry(0.14, 10, 8), "#f6f3e4", { at: c, bone: head });
    b.decal(eye, EYE, { at: [c[0], c[1], c[2] + 0.14], dir: [s * 0.15, 0.05, 1], size: [0.2, 0.2] });
    rod([0, sy, hz - 0.1], c, 0.014, YEL, head);
    b.part(new THREE.TorusGeometry(0.1, 0.008, 4, 8), BLACK, { at: [c[0], c[1] - 0.03, c[2] - 0.08], dir: [0, 0, 1], bone: head });
  }
  rod([-0.19, sy + 0.34, hz + 0.05], [0.19, sy + 0.34, hz + 0.05], 0.012, YEL, head);
  bottle([0, sy + 0.06, hz + 0.0], [0, 0, 1], 1.3, CAP_O, head);
  // jaw
  bottle([0, sy - 0.11, hz - 0.05], [0, 0, 1], 1.05, CAP_B, jaw);
  for (const s of [1, -1]) {
    rod([s * 0.06, sy - 0.04, hz - 0.1], [s * 0.07, sy - 0.11, hz + 0.25], 0.011, YEL, jaw);
  }
  b.part(new THREE.SphereGeometry(0.03, 6, 5), BLACK, { at: [0, sy - 0.04, hz - 0.08], bone: jaw });

  // ---------- mast, boom, sails ----------
  const mastTop: P3 = [0, sy + 1.25, -0.3];
  b.rod([0, sy, -0.3], mastTop, [0.03, 0.017], YEL, { bone: mast });
  b.part(new THREE.SphereGeometry(0.03, 6, 5), CAP_O, { at: mastTop, bone: mast });
  rod([0, sy + 0.25, -0.3], [0, sy + 0.25, -1.45], 0.014, YEL, mast);

  b.membrane(
    polyline([
      [0, sy + 0.25, -0.33],
      [0, sy + 1.2, -0.33],
    ]),
    catmull([
      [0, sy + 0.25, -1.45],
      [0.26, sy + 0.55, -1.1],
      [0.3, sy + 0.85, -0.7],
      [0, sy + 1.17, -0.37],
    ]),
    { color: SAIL, thickness: 0.006, rows: 8, bone: mast },
  );
  b.membrane(
    polyline([
      [0, sy + 0.32, -0.27],
      [0, sy + 1.12, -0.27],
    ]),
    catmull([
      [0, sy + 0.32, 1.65],
      [-0.2, sy + 0.55, 1.15],
      [-0.2, sy + 0.85, 0.45],
      [0, sy + 1.1, -0.24],
    ]),
    { color: SAIL, thickness: 0.006, rows: 8, bone: mast },
  );
  // battens
  for (const [y, z, x] of [
    [0.55, -1.1, 0.26],
    [0.85, -0.7, 0.3],
  ] as P3[])
    rod([0.012, sy + y, -0.33], [x, sy + y, z], 0.007, "#e8d9a8", mast);
  // sail plate
  b.part(new THREE.BoxGeometry(0.27, 0.09, 0.012), YEL, { at: [0, sy + 0.6, -0.3 + 0.036], bone: mast });
  b.part(new THREE.PlaneGeometry(0.25, 0.073), "#ffffff", {
    at: [0, sy + 0.6, -0.3 + 0.0425],
    dir: [0, 0, 1],
    axis: "z",
    texture: PLATE,
    bone: mast,
  });
  // pennant
  b.part(new THREE.PlaneGeometry(0.5, 0.28), "#ffffff", {
    at: [0.004, mastTop[1] - 0.12, -0.3 - 0.25],
    dir: [1, 0, 0],
    axis: "z",
    texture: PEN_R,
    bone: mast,
  });
  b.part(new THREE.PlaneGeometry(0.5, 0.28), "#ffffff", {
    at: [-0.004, mastTop[1] - 0.12, -0.3 - 0.25],
    dir: [-1, 0, 0],
    axis: "z",
    texture: PEN_L,
    bone: mast,
  });

  // ---------- rigging ----------
  const rope = (a: P3, c: P3, bone: any) => {
    const m = mid3(a, c);
    b.sweep(catmull([a, [m[0], m[1] - 0.04, m[2]], c]), 0.005, { color: ROPE, bone });
  };
  rope(mastTop, [0, sy + 0.1, hz - 0.1], mast);
  rope(mastTop, [0, sy + 0.5, -2.2], mast);
  for (const s of [1, -1]) {
    rope([0, sy + 0.9, -0.3], [s * (XB[1] + 0.14), yP, zP(1)], mast);
    rope([0, sy + 0.9, -0.3], [s * 0.19, sy + 0.34, hz + 0.05], mast);
  }

  // ---------- tail fin ----------
  const tp = tail.at(0.5).at;
  b.extrude(
    [
      [0, 0],
      [0.42, 0.02],
      [0.5, 0.18],
      [0.22, 0.5],
      [0.06, 0.42],
    ],
    { at: tp, x: [0, 0, -1], y: [0, 1, 0], thickness: 0.01, color: SAIL, bone: tail.joints[1] },
  );
  b.part(new THREE.SphereGeometry(0.02, 6, 5), CAP_O, { at: tail.at(1).at, bone: tail.joints[2] });

  return b.root;
}
