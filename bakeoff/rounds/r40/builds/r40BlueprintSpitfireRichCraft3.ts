import * as THREE from "three";
import { createBuilder, catmull, paint, noise, mix, smoothstep, svg } from "../../../../src/index";
import type { Rgb } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Supermarine Spitfire Mk I (cyanotype blueprint)",
  description:
    "Real-size (9.1 m, 11.2 m span) Spitfire in cyanotype blueprint style: Prussian-blue panelled skin with white seam lines and rivets, drawn roundels, hatched canopy glass, dimension arrows on the wings, glowing exhausts. Rigged with body, propeller, rudder and elevator hinges.",
};

// ---------------------------------------------------------------------------------------------------------------
// Frame helpers. The airframe is designed level (thrust line y = 0, nose +z) and tilted 9 degrees nose-up
// into its three-point stance; T maps design points, D maps design directions.
type V = THREE.Vector3;
const DEG = Math.PI / 180;
const TH = 9 * DEG;
const CS = Math.cos(TH);
const SN = Math.sin(TH);
const H0 = 1.437;
const T = (x: number, y: number, z: number): V => new THREE.Vector3(x, H0 + y * CS + z * SN, z * CS - y * SN);
const D = (x: number, y: number, z: number): V => new THREE.Vector3(x, y * CS + z * SN, z * CS - y * SN);
const Tl = (p: V): V => {
  const yy = p.y - H0;
  return new THREE.Vector3(p.x, yy * CS - p.z * SN, p.z * CS + yy * SN);
};
const Dl = (n: V): V => new THREE.Vector3(n.x, n.y * CS - n.z * SN, n.z * CS + n.y * SN);
const tv = (v: V): V => T(v.x, v.y, v.z);
const designY = (worldY: number, zl: number) => (worldY - H0 - zl * SN) / CS;
const wrap = (x: number, m: number) => ((x % m) + m) % m;

// ---------------------------------------------------------------------------------------------------------------
// Palette: cyanotype, Prussian blue to white.
const DEEP = "#061b45";
const NAVY = "#0a2a63";
const BLUE = "#1450a8";
const MID = "#2266c4";
const LIGHT = "#3b88e0";
const PALE = "#9fd0ff";
const ICE = "#d6ecff";
const WHITE = "#f4faff";
const LINE = "#e8f4ff";
const GLOW_C = "#bfe6ff";

// ---------------------------------------------------------------------------------------------------------------
// Wing planform
const WB = 5.6; // half span
const WC = 2.55; // root chord
const WZQ = 0.45; // quarter-chord line (design z)
const WY0 = -0.5; // wing centre height at root
const DIH = Math.tan(6 * DEG);
const chord = (x: number) => WC * Math.sqrt(Math.max(1 - (x / WB) ** 2, 0.0005));
const wingY = (x: number) => WY0 + Math.abs(x) * DIH;
const wingZ = (x: number, f: number) => WZQ + 0.25 * chord(x) - f * chord(x);

type Extra = (q: V, nl: V, s: readonly [number, number]) => string | Rgb | null;
type HullOpts = { lo: string; hi: string; cu?: number; cv?: number; seed?: number; rivets?: boolean; extra?: Extra };

/** Cyanotype skin: exposure-uneven Prussian blue, white panel seams, rivet rows, a faint drafting grid. */
function hull(o: HullOpts) {
  const cu = o.cu ?? 0.8;
  const cv = o.cv ?? 0.55;
  const seed = o.seed ?? 3;
  const pitch = 0.06;
  const rr = 0.007;
  const inset = 0.02;
  return paint((p, n, s) => {
    const q = Tl(p);
    const nl = Dl(n);
    let c: Rgb = mix(o.lo, o.hi, smoothstep(-0.6, 0.9, n.y));
    c = mix(c, DEEP, 0.4 * smoothstep(0.52, 0.78, noise(p, 0.8, seed)));
    c = mix(c, o.hi, 0.16 * smoothstep(0.5, 0.85, noise(p, 0.07, seed + 5)));
    const ex = o.extra ? o.extra(q, nl, s) : null;
    if (ex) return ex;
    const ax = Math.abs(nl.x);
    const ay = Math.abs(nl.y);
    const az = Math.abs(nl.z);
    const [u, v] = ax >= ay && ax >= az ? [q.z, q.y] : ay >= az ? [q.x, q.z] : [q.x, q.y];
    const du = wrap(u, cu);
    const dv = wrap(v, cv);
    if (du < 0.009 || dv < 0.009) return mix(c, LINE, 0.8);
    if (o.rivets !== false) {
      const al = (x: number) => wrap(x, pitch) - pitch / 2;
      const d = Math.min(Math.hypot(du - inset, al(v)), Math.hypot(dv - inset, al(u)));
      if (d < rr) return mix(c, LINE, 0.65);
    }
    if (wrap(u, 0.2) < 0.004 || wrap(v, 0.2) < 0.004) return mix(c, PALE, 0.16);
    return c;
  });
}

const wingExtra: Extra = (q, nl) => {
  const x = Math.abs(q.x);
  if (x > 5.5 || Math.abs(nl.y) < 0.5) return null;
  const c = chord(x);
  const f = (WZQ + 0.25 * c - q.z) / c;
  const e = 0.01;
  const nearF = (f0: number) => Math.abs(f - f0) * c < e;
  const nearX = (x0: number) => Math.abs(x - x0) < e;
  if (x > 0.85 && x < 5.2 && nearF(0.7)) return LINE; // flap + aileron hinge line
  if (f > 0.7 && f < 1 && (nearX(3.2) || nearX(5.2) || nearX(0.85))) return LINE; // control surface ends
  if (x > 1.3 && x < 5.0 && nearF(0.28)) return PALE; // spar access seam
  if (f > 0.0 && f < 0.28 && (nearX(2.2) || nearX(3.9))) return PALE; // gun bay panels
  return null;
};
const fuseExtra: Extra = (q, nl) => {
  if (Math.abs(nl.x) > 0.55) {
    const e = 0.008;
    const inZ = q.z > -0.35 && q.z < 0.5;
    const inY = q.y > -0.02 && q.y < 0.46;
    if (inZ && inY && (Math.abs(q.z + 0.35) < e || Math.abs(q.z - 0.5) < e || Math.abs(q.y - 0.46) < e || Math.abs(q.y + 0.02) < e))
      return LINE; // cockpit door
  }
  return null;
};
const rudderExtra: Extra = (_q, nl, s) => (Math.abs(nl.x) > 0.6 && s[1] > 0.18 && wrap(s[1], 0.17) < 0.008 ? LINE : null);
const elevExtra: Extra = (_q, nl, s) => (Math.abs(nl.y) > 0.6 && wrap(s[0], 0.2) < 0.008 ? LINE : null);

const WING = hull({ lo: "#0f3d8a", hi: "#3487e0", extra: wingExtra, seed: 3 });
const FUSE = hull({ lo: "#0b3278", hi: "#2a74d0", extra: fuseExtra, seed: 8 });
const TAIL = hull({ lo: "#0f3d8a", hi: "#3487e0", cu: 0.5, cv: 0.4, seed: 5 });
const FINP = hull({ lo: "#0f3d8a", hi: "#3487e0", cu: 0.5, cv: 0.4, seed: 6, extra: rudderExtra });
const ELEVP = hull({ lo: "#0f3d8a", hi: "#3487e0", cu: 0.5, cv: 0.4, seed: 7, extra: elevExtra });
const DOORP = hull({ lo: "#0d3680", hi: "#2d7bd6", cu: 0.3, cv: 0.3, seed: 12 });

const GLASS = paint((p, n) => {
  const q = Tl(p);
  let c: Rgb = mix("#4a9be6", "#a6d6ff", smoothstep(-0.2, 0.9, n.y));
  if (wrap(q.z * 9 + q.y * 9, 1) < 0.07) c = mix(c, LINE, 0.25);
  for (const f of [0.98, 0.42, -0.3, -0.95]) if (Math.abs(q.z - f) < 0.022) return LINE;
  if (Math.abs(q.x) < 0.014 && q.z > 0.4 && q.z < 1.0) return LINE;
  return c;
});
const SPIN = paint((_p, _n, s) =>
  wrap(s[1] + s[0] * 220, 60) < 9 ? WHITE : mix(NAVY, LIGHT, 0.15 + 0.5 * smoothstep(0, 0.6, s[0])),
);
const BLADE = paint((_p, n, s) =>
  s[0] > 1.4 ? WHITE : s[0] > 1.33 ? PALE : mix("#0a2a63", "#2a6cc4", 0.3 + 0.5 * smoothstep(-0.5, 1, n.y)),
);
const TIRE = paint((_p, _n, s) => (wrap(s[1] + s[0] * 300, 20) < 10 ? "#0c3070" : "#1550a8"));

// ---------------------------------------------------------------------------------------------------------------
// Textures
const roundelWing = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#9fd0ff" stroke="#f4faff" stroke-width="2.4"/>
  <circle cx="50" cy="50" r="33" fill="#f4faff" stroke="#0a2a63" stroke-width="1.2"/>
  <circle cx="50" cy="50" r="17" fill="#0f3f8f" stroke="#f4faff" stroke-width="2"/>
  <circle cx="50" cy="50" r="41" fill="none" stroke="#0a2a63" stroke-width="1" stroke-dasharray="3 3"/>
  <path d="M3 50H97M50 3V97" stroke="#0a2a63" stroke-width="1"/>
</svg>`,
  { size: 256 },
);
const roundelFuse = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#bfe0ff" stroke="#f4faff" stroke-width="2.4"/>
  <circle cx="50" cy="50" r="38" fill="#f4faff" stroke="#0a2a63" stroke-width="1.2"/>
  <circle cx="50" cy="50" r="27" fill="#1450a8" stroke="#f4faff" stroke-width="1.6"/>
  <circle cx="50" cy="50" r="14" fill="#7cc4ff" stroke="#0a2a63" stroke-width="1.2"/>
  <path d="M3 50H97M50 3V97" stroke="#0a2a63" stroke-width="0.9"/>
</svg>`,
  { size: 256 },
);
const textTex = (txt: string, w: number, h: number, fs: number, size = 256) =>
  svg(
    `<svg viewBox="0 0 ${w} ${h}"><text x="${w / 2}" y="${h * 0.8}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${fs}" fill="#f4faff" stroke="#0a2a63" stroke-width="0.8" letter-spacing="2">${txt}</text></svg>`,
    { size },
  );
const CODE = textTex("QV", 100, 50, 48);
const SERIAL = textTex("K9942", 200, 40, 34, 384);
const walkway = svg(
  `<svg viewBox="0 0 100 60">
  <rect x="3" y="3" width="94" height="54" fill="none" stroke="#f4faff" stroke-width="3"/>
  <path d="M3 18H97M3 42H97" stroke="#9fd0ff" stroke-width="1.6"/>
  <text x="50" y="35" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="13" fill="#f4faff">NO STEP</text>
</svg>`,
  { size: 256 },
);
const dimArrow = (label: string) =>
  svg(
    `<svg viewBox="0 0 400 24">
  <path d="M6 12H160M240 12H394" stroke="#f4faff" stroke-width="1.7"/>
  <path d="M3 12L20 6V18Z M397 12L380 6V18Z" fill="#f4faff"/>
  <path d="M3 1V23M397 1V23" stroke="#f4faff" stroke-width="1.7"/>
  <text x="200" y="17" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" fill="#f4faff">${label}</text>
</svg>`,
    { size: 1024 },
  );
const DIM_WING = dimArrow("5.61 m");
const DIM_BELLY = dimArrow("SUPERMARINE SPITFIRE Mk.I");
const HONEY = (() => {
  let d = "";
  const r = 6;
  const w = Math.sqrt(3) * r;
  for (let row = 0; row < 8; row++)
    for (let col = 0; col < 7; col++) {
      const cx = col * w + (row % 2 ? w / 2 : 0);
      const cy = row * 1.5 * r;
      const pts = [0, 1, 2, 3, 4, 5].map((k) => {
        const a = (60 * k - 30) * DEG;
        return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
      });
      d += `M${pts.join("L")}Z`;
    }
  return svg(
    `<svg viewBox="0 0 40 40"><rect width="40" height="40" fill="#06184a"/><path d="${d}" fill="none" stroke="#8fc8ff" stroke-width="0.8"/></svg>`,
    { size: 256 },
  );
})();
const HUB = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#1450a8" stroke="#f4faff" stroke-width="3"/>
  <circle cx="50" cy="50" r="31" fill="none" stroke="#9fd0ff" stroke-width="2"/>
  <path d="M50 50L50 19M50 50L79.5 40.4M50 50L68.2 75.1M50 50L31.8 75.1M50 50L20.5 40.4" stroke="#f4faff" stroke-width="2.4"/>
  <circle cx="50" cy="50" r="9" fill="#f4faff"/><circle cx="50" cy="50" r="3.5" fill="#0a2a63"/>
  <g fill="#f4faff"><circle cx="50" cy="9" r="2.2"/><circle cx="89" cy="37" r="2.2"/><circle cx="74" cy="83" r="2.2"/><circle cx="26" cy="83" r="2.2"/><circle cx="11" cy="37" r="2.2"/></g>
</svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------
type Pt = [number, number] | [number, number, "sharp"];

/** Elliptical planform between chord fractions f0..f1 (0 = leading edge): outline (span, z) for a tailplane. */
function ellOutline(span: number, c0: number, zq: number, f0: number, f1: number, x0: number): [number, number][] {
  const N = 10;
  const a0 = Math.asin(x0 / span);
  const lo: [number, number][] = [];
  const hi: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const a = a0 + ((Math.PI / 2) * 0.98 - a0) * (i / N);
    const x = span * Math.sin(a);
    const c = c0 * Math.cos(a);
    lo.push([x, zq + 0.25 * c - f0 * c]);
    hi.push([x, zq + 0.25 * c - f1 * c]);
  }
  return [...lo, ...hi.reverse()];
}

export default function build() {
  const b = createBuilder({ name: "spitfire", paintSize: 2048 });

  // ------------------------------------------------------------------------------------------ skeleton
  const body = b.joint("body", { at: T(0, 0, 0.3) });
  const prop = b.joint("propeller", { parent: body, at: T(0, 0, 3.1), dir: D(0, 0, 1), role: "fan" });
  const rudder = b.joint("rudder", { parent: body, at: T(0, 0.12, -4.85), aim: T(0, 1.1, -4.85), role: "hinge" });
  const elev = [1, -1].map((s) =>
    b.joint(s > 0 ? "elevatorL" : "elevatorR", {
      parent: body,
      at: T(s * 0.12, 0.06, -4.55),
      aim: T(s * 1.5, 0.06, -4.55),
      role: "hinge",
    }),
  );

  // ------------------------------------------------------------------------------------------ fuselage
  const FUS: [number, number, number, number][] = [
    [-5.45, 0.08, 0.05, 0.1],
    [-4.9, 0.06, 0.2, 0.32],
    [-3.9, 0.0, 0.38, 0.55],
    [-2.8, -0.04, 0.56, 0.78],
    [-1.6, -0.04, 0.76, 0.98],
    [-0.5, -0.02, 0.84, 1.1],
    [0.7, -0.02, 0.84, 1.08],
    [1.5, 0.0, 0.86, 1.05],
    [2.3, 0.0, 0.8, 0.96],
    [3.05, 0.0, 0.62, 0.8],
  ];
  const fus = b.loft(
    FUS.map(([z, y, w, h]) => ({ at: T(0, y, z), w, h })),
    { bone: body, color: FUSE, sides: 12, smooth: false, caps: { start: "point", end: "flat" } },
  );
  const fusY = (z: number) => {
    for (let i = 0; i < FUS.length - 1; i++)
      if (z >= FUS[i][0] && z <= FUS[i + 1][0]) {
        const t = (z - FUS[i][0]) / (FUS[i + 1][0] - FUS[i][0]);
        return FUS[i][1] + (FUS[i + 1][1] - FUS[i][1]) * t;
      }
    return 0;
  };
  const skin = b.surface(fus);

  // seam bands round the fuselage (drawn lines) and fastener rows on the cowl
  for (const [z, r] of [
    [2.95, 0.024],
    [1.45, 0.013],
    [-0.9, 0.009],
    [-3.2, 0.011],
    [-4.35, 0.009],
  ] as const) {
    const loop = skin.loop(T(0, fusY(z), z), { dir: D(0, 0, 1), lift: 0.006 });
    b.sweep(loop, r, { bone: body, color: LINE, sides: 5 });
  }
  const studGeo = new THREE.SphereGeometry(0.016, 5, 4);
  for (const z of [2.55, 1.95]) {
    const loop = skin.loop(T(0, fusY(z), z), { dir: D(0, 0, 1), lift: 0.004 });
    b.along(loop, 26, (at) => {
      const hit = skin.nearest(at);
      b.stick(studGeo, LINE, hit, { embed: 0.5 });
    });
  }

  // chin carburettor intake
  b.frustumBox(T(0, -0.36, 2.65), T(0, -0.42, 1.7), [0.18, 0.1], [0.32, 0.2], { bone: body, color: MID });
  b.part(new THREE.PlaneGeometry(0.15, 0.08), "#ffffff", { bone: body, at: T(0, -0.36, 2.655), dir: D(0, 0, 1), axis: "z", texture: HONEY });

  // ------------------------------------------------------------------------------------------ canopy
  const CAN: [number, number, number, number][] = [
    [-1.6, 0.42, 0.26, 0.2],
    [-1.0, 0.55, 0.42, 0.42],
    [-0.3, 0.62, 0.52, 0.52],
    [0.45, 0.6, 0.56, 0.5],
    [0.95, 0.55, 0.58, 0.4],
    [1.32, 0.48, 0.58, 0.12],
  ];
  b.loft(
    CAN.map(([z, y, w, h]) => ({ at: T(0, y, z), w, h })),
    { bone: body, color: GLASS, sides: 10, smooth: false, caps: { start: "point", end: "point" } },
  );
  // ring-and-bead gunsight post and headrest bar
  b.part(new THREE.BoxGeometry(0.06, 0.05, 0.08), NAVY, { bone: body, at: T(0, 0.58, 1.12), dir: D(0, 1, 0) });
  glow(b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.006, 8), GLOW_C, { bone: body, at: T(0, 0.61, 1.12), dir: D(0, 1, 0) }), 1.4);

  // ------------------------------------------------------------------------------------------ wings
  const wings = [1, -1].map((s) => {
    const xs = [0, 0.9, 1.8, 2.7, 3.6, 4.4, 5.0, 5.35, 5.55];
    const path = catmull(xs.map((x) => T(s * x, wingY(x), wingZ(x, 0.5))));
    return b.sweep(
      path,
      (t) => {
        const x = Math.abs(path.at(t).x);
        const c = chord(x);
        return [c / 2, Math.max((c * (0.13 - 0.07 * (x / WB))) / 2, 0.012)] as [number, number];
      },
      { up: D(0, 1, 0), bone: body, color: WING, sides: 10, smooth: false },
    );
  });

  [1, -1].forEach((s, i) => {
    const wing = wings[i];
    const topY = (x: number) => wingY(x) + 0.22;
    // roundels, top and underside
    b.decal(wing, roundelWing, { at: T(s * 3.7, topY(3.7), wingZ(3.7, 0.5)), dir: D(0, 1, 0), up: D(0, 0, 1), size: [1.05, 1.05], segments: 14 });
    b.decal(wing, roundelWing, { at: T(s * 3.7, wingY(3.7) - 0.2, wingZ(3.7, 0.5)), dir: D(0, -1, 0), up: D(0, 0, 1), size: [1.05, 1.05], segments: 14 });
    // walkway and span dimension arrow
    b.decal(wing, walkway, { at: T(s * 0.95, topY(0.95), wingZ(0.95, 0.58)), dir: D(0, 1, 0), up: D(0, 0, 1), size: [0.72, 0.43], segments: 8 });
    b.decal(wing, DIM_WING, { at: T(s * 2.8, topY(2.8), wingZ(2.8, 0.1)), dir: D(0, 1, 0), up: D(0, 0, 1), size: [5.0, 0.3], segments: 40 });
    if (s > 0)
      b.decal(wing, DIM_BELLY, { at: T(s * 2.3, wingY(2.3) - 0.25, wingZ(2.3, 0.15)), dir: D(0, -1, 0), up: D(0, 0, -1), size: [3.4, 0.2], segments: 30 });
    // eight .303 Brownings (four a side), muzzle stubs through the leading edge
    for (const x of [2.45, 2.8, 3.15, 3.5]) {
      const zle = wingZ(x, 0);
      b.rod(T(s * x, wingY(x), zle - 0.4), T(s * x, wingY(x) - 0.01, zle + 0.16), 0.017, { bone: body, color: PALE, sides: 6 });
      b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 6), DEEP, { bone: body, at: T(s * x, wingY(x) - 0.01, zle + 0.165), dir: D(0, 0, 1) });
    }
    // wingtip navigation light
    glow(b.part(new THREE.SphereGeometry(0.055, 8, 6), s > 0 ? "#8fd6ff" : WHITE, { bone: body, at: T(s * 5.56, wingY(5.56), wingZ(5.56, 0.5)) }), 1.6);
    // radiator / oil cooler scoop under the wing
    const rx = s * 2.75;
    const big = s < 0;
    b.frustumBox(T(rx, -0.43, 0.25), T(rx, -0.46, -0.85), [big ? 0.54 : 0.44, big ? 0.28 : 0.22], [big ? 0.42 : 0.34, 0.14], { bone: body, color: MID });
    b.part(new THREE.PlaneGeometry(big ? 0.46 : 0.36, big ? 0.22 : 0.17), "#ffffff", { bone: body, at: T(rx, -0.43, 0.256), dir: D(0, 0, 1), axis: "z", texture: HONEY });
    b.rod(T(rx, -0.5, -0.8), T(rx, -0.55, -1.0), 0.05, { bone: body, color: NAVY, sides: 4 }); // exit flap
  });
  // pitot on the left wing
  b.rod(T(3.9, wingY(3.9) - 0.12, 0.7), T(3.9, wingY(3.9) - 0.12, 1.4), 0.012, { bone: body, color: ICE, sides: 6 });
  b.part(new THREE.SphereGeometry(0.022, 6, 4), WHITE, { bone: body, at: T(3.9, wingY(3.9) - 0.12, 1.4) });

  // ------------------------------------------------------------------------------------------ tail
  const X = D(0, 0, 1);
  const Y = D(0, 1, 0);
  const finOutline: Pt[] = [
    [-3.3, 0.2, "sharp"],
    [-3.9, 0.55],
    [-4.4, 0.95],
    [-4.7, 1.12],
    [-4.85, 1.12, "sharp"],
    [-4.85, 0.2, "sharp"],
  ];
  b.extrude(finOutline, { at: T(0, 0, 0), x: X, y: Y, thickness: 0.07, bevel: 0.015, smoothing: 1, color: FINP, bone: body });
  const rudderOutline: Pt[] = [
    [-4.85, 0.15, "sharp"],
    [-4.85, 1.12, "sharp"],
    [-5.05, 1.12],
    [-5.3, 0.98],
    [-5.45, 0.75],
    [-5.5, 0.45],
    [-5.42, 0.22],
    [-5.2, 0.1],
  ];
  b.extrude(rudderOutline, { at: T(0, 0, 0), x: X, y: Y, thickness: 0.05, bevel: 0.012, smoothing: 1, color: FINP, bone: rudder });
  [1, -1].forEach((s, i) => {
    b.extrude(ellOutline(1.55, 1.0, -4.3, 0, 0.5, 0.12), { at: T(0, 0.06, 0), x: D(s, 0, 0), y: D(0, 0, 1), thickness: 0.055, bevel: 0.012, color: TAIL, bone: body });
    b.extrude(ellOutline(1.55, 1.0, -4.3, 0.5, 1, 0.12), { at: T(0, 0.06, 0), x: D(s, 0, 0), y: D(0, 0, 1), thickness: 0.045, bevel: 0.01, color: ELEVP, bone: elev[i] });
  });
  // aerial mast and wire to the fin
  b.rod(T(0, 0.4, -1.9), T(0, 0.86, -2.02), 0.018, { bone: body, color: ICE, sides: 6 });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), WHITE, { bone: body, at: T(0, 0.87, -2.03) });
  b.sweep(catmull([T(0, 0.87, -2.03), T(0, 0.9, -3.5), T(0, 1.1, -4.75)]), 0.005, { bone: body, color: LINE, sides: 4, caps: "flat" });

  // fuselage markings
  for (const s of [1, -1]) {
    b.decal(fus, roundelFuse, { at: T(s * 0.3, 0.0, -3.1), dir: D(s, 0, 0), up: D(0, 1, 0), size: [0.62, 0.62], segments: 10 });
    b.decal(fus, CODE, { at: T(s * 0.42, 0.02, -1.75), dir: D(s, 0, 0), up: D(0, 1, 0), size: [0.6, 0.3], segments: 10 });
    b.decal(fus, SERIAL, { at: T(s * 0.25, 0.0, -4.1), dir: D(s, 0, 0), up: D(0, 1, 0), size: [0.7, 0.14], segments: 10 });
  }

  // ------------------------------------------------------------------------------------------ engine & prop
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) {
      const z = 1.5 + i * 0.2;
      const hw = 0.43 - (0.04 * (z - 1.5)) / 0.8;
      glow(b.rod(T(s * (hw - 0.03), 0.02, z), T(s * (hw + 0.07), 0.02, z - 0.14), 0.03, { bone: body, color: GLOW_C, sides: 6 }), 1.3);
    }

  b.lathe(
    [
      [0, 0, "sharp"],
      [0.25, 0],
      [0.27, 0.06],
      [0.22, 0.28],
      [0.12, 0.48],
      [0, 0.62, "sharp"],
    ],
    { at: T(0, 0, 3.08), axis: D(0, 0, 1), bone: prop, color: SPIN, smoothing: 1, segments: 12 },
  );
  const bladeOutline: Pt[] = [
    [0.18, -0.08],
    [0.5, -0.13],
    [0.95, -0.15],
    [1.35, -0.12],
    [1.55, -0.07],
    [1.62, 0],
    [1.55, 0.06],
    [1.3, 0.1],
    [0.9, 0.12],
    [0.5, 0.1],
    [0.18, 0.07],
  ];
  for (let i = 0; i < 3; i++) {
    const phi = (i * 120 + 90) * DEG;
    const rad = D(Math.cos(phi), Math.sin(phi), 0);
    const tang = D(-Math.sin(phi), Math.cos(phi), 0);
    const fwd = D(0, 0, 1);
    const pitch = 24 * DEG;
    const yDir = tang.clone().multiplyScalar(Math.cos(pitch)).addScaledVector(fwd, Math.sin(pitch));
    b.extrude(bladeOutline, { at: T(0, 0, 3.2), x: rad, y: yDir, thickness: 0.03, bevel: 0.008, smoothing: 1, color: BLADE, bone: prop });
    b.part(new THREE.CylinderGeometry(0.055, 0.065, 0.14, 8), PALE, { bone: prop, at: T(0, 0, 3.2).addScaledVector(rad, 0.3), dir: rad });
  }

  // ------------------------------------------------------------------------------------------ undercarriage
  const hubGeo = new THREE.CircleGeometry(0.17, 12);
  const tireOutline: Pt[] = [
    [0.16, -0.075],
    [0.3, -0.075],
    [0.34, -0.04],
    [0.34, 0.04],
    [0.3, 0.075],
    [0.16, 0.075],
  ];
  const doorOutline: Pt[] = [
    [-0.2, 0],
    [0.2, 0],
    [0.2, -0.4],
    [0.14, -0.7],
    [0, -0.78],
    [-0.14, -0.7],
    [-0.2, -0.4],
  ];
  for (const s of [1, -1]) {
    const Ad = new THREE.Vector3(s * 1.45, -0.3, 0.34);
    const Wd = new THREE.Vector3(s * 1.95, designY(0.34, 0.34), 0.34);
    const Md = Ad.clone().lerp(Wd, 0.5);
    const Ed = Ad.clone().lerp(Wd, 0.82);
    b.rod(tv(Ad), tv(Md), 0.055, { bone: body, color: NAVY, sides: 8 });
    b.part(new THREE.SphereGeometry(0.068, 8, 6), PALE, { bone: body, at: tv(Md) });
    b.rod(tv(Md), tv(Ed), 0.036, { bone: body, color: ICE, sides: 8 });
    for (const k of [-1, 1]) b.rod(tv(Ed), T(Wd.x + k * 0.1, Wd.y, Wd.z), 0.022, { bone: body, color: PALE, sides: 6 });
    b.rod(T(Wd.x - 0.13, Wd.y, Wd.z), T(Wd.x + 0.13, Wd.y, Wd.z), 0.02, { bone: body, color: ICE, sides: 6 });
    b.lathe(tireOutline, { at: tv(Wd), axis: [1, 0, 0], segments: 14, bone: body, color: TIRE });
    for (const k of [-1, 1])
      b.part(hubGeo, "#ffffff", { bone: body, at: T(Wd.x + k * 0.078, Wd.y, Wd.z), dir: [k, 0, 0], axis: "z", texture: HUB });
    const legUp = Ad.clone().sub(Wd).normalize();
    b.extrude(doorOutline, {
      at: T(Ad.x + s * 0.19, Ad.y, Ad.z),
      x: D(0, 0, 1),
      y: D(legUp.x, legUp.y, legUp.z),
      thickness: 0.02,
      bevel: 0.005,
      smoothing: 1,
      color: DOORP,
      bone: body,
    });
  }
  // tail wheel
  const twz = -4.95;
  const twy = designY(0.11, twz);
  b.rod(T(0, -0.12, -4.45), T(0, twy + 0.12, twz), 0.035, { bone: body, color: NAVY, sides: 6 });
  for (const k of [-1, 1]) b.rod(T(0, twy + 0.14, twz), T(k * 0.05, twy, twz), 0.016, { bone: body, color: PALE, sides: 5 });
  b.lathe(
    [
      [0.04, -0.035],
      [0.1, -0.035],
      [0.11, -0.015],
      [0.11, 0.015],
      [0.1, 0.035],
      [0.04, 0.035],
    ],
    { at: T(0, twy, twz), axis: [1, 0, 0], segments: 10, bone: body, color: TIRE },
  );
  b.part(new THREE.SphereGeometry(0.075, 6, 5), BLUE, { bone: body, at: T(0, -0.1, -4.5), scale: [0.8, 0.9, 1.6] });

  return b.root;
}
