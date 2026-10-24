import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { aim, catmull, createBuilder, DEG, frame, mix, paint, smoothstep, svg } from "../../../../src/index";
import { gearTrain, metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Jewelled Surprise Egg",
  description:
    "A Fabergé-style guilloché enamel egg on a gilt pedestal with a clock drum. The lid is hinged open to show a tiny clockwork ballerina on a gear-driven turntable. Gold meridians, pearls, cabochon rubies, green-gold leaves and a miniature painting.",
};

// ---------------------------------------------------------------------------------------------------------------
// Dimensions (meters). The egg is an upright ovoid, narrower toward the top.
const H = 0.12; // egg height
const HH = H / 2;
const R = 0.043; // equator radius
const CY = 0.104; // egg centre height
const TC = 0.25; // where the lid is cut (t = -1 bottom .. 1 top)
const K = 0.94; // inner / outer shell scale
const yOf = (t: number) => t * HH; // height relative to the egg centre
const rOf = (t: number) => {
  const c = Math.max(-1, Math.min(1, t));
  return R * Math.sqrt(Math.max(0, 1 - c * c)) * (1 - 0.1 * c);
};
const CUT_Y = CY + yOf(TC);
const R_CUT = rOf(TC);

// Colours
const PEARL = "#f4efe4";
const RUBY = "#c8102e";
const EMER = "#12915a";
const SAPH = "#1c4fc2";
const DIAM = "#e6f4ff";
const LEAFG = "#86a64a";
const GOLD_FLAT = "#e8bd55";
const SKIN = "#f4d9c4";
const HAIR = "#4b2a1e";
const PINK_B = "#e98aa7";
const SATIN = "#f6bfcc";
const TIGHTS = "#fbe6e8";

const GILT = metal("gilt", { seed: 3 });
const YELLOW = metal("brass", { polish: 0.5, tarnish: 0.08, seed: 5 });

const fract = (x: number) => x - Math.floor(x);
const lit = (c: readonly [number, number, number], k: number): [number, number, number] => [
  Math.min(1, c[0] * k),
  Math.min(1, c[1] * k),
  Math.min(1, c[2] * k),
];

// Guilloché: engine-turned waves and ridges, the heart of the enamel look.
const guil = (a: number, y: number, dark: string, light: string, nf = 16) => {
  const w = Math.sin(a * nf + Math.sin(y * 300) * 1.7);
  const ridge = Math.sin(y * 1100 + Math.cos(a * nf * 1.5) * 0.9);
  let c = mix(dark, light, 0.5 + 0.5 * w);
  c = mix(c, dark, 0.35 * smoothstep(0.75, 1, ridge));
  return c;
};

// Egg enamel: royal-blue guilloché outside, pleated ivory silk with gilt thread inside.
const eggEnamel = paint((p, n, s) => {
  const inside = n.x * p.x + n.y * (p.y - CY) + n.z * p.z < 0;
  const a = s[1] * DEG;
  if (inside) {
    const f = fract(a / (Math.PI / 14));
    if (f < 0.06 || f > 0.94) return GILT;
    return mix("#e6d3ab", "#fbf1da", Math.sin(f * Math.PI));
  }
  return lit(guil(a, s[0], "#10308c", "#4d7fe8"), 0.8 + 0.2 * n.y);
});

const pedestalPaint = paint((p, n, s) => {
  const y = s[0];
  const rad = Math.hypot(p.x, p.z);
  const a = Math.atan2(p.x, p.z);
  if (y > 0.0022 && y < 0.0068 && rad > 0.0565) return lit(guil(a, y, "#0d6f78", "#4fcac4", 20), 0.85 + 0.15 * n.y);
  if (y > 0.0188 && y < 0.0342 && rad > 0.0285) return lit(guil(a, y, "#10308c", "#4d7fe8", 18), 0.85 + 0.15 * n.y);
  return YELLOW;
});

const platformPaint = paint((p, n) => {
  const r = Math.hypot(p.x, p.z);
  const a = Math.atan2(p.x, p.z);
  const w = Math.sin(a * 18 + Math.sin(r * 900) * 1.4);
  return lit(mix("#a8782a", "#f0cd72", 0.5 + 0.5 * w), 0.85 + 0.15 * n.y);
});

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const romans = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
function clockSvg() {
  let nums = "";
  romans.forEach((t, i) => {
    const a = i * 30 * DEG;
    nums += `<text x="${(50 + Math.sin(a) * 30).toFixed(1)}" y="${(50 - Math.cos(a) * 30 + 3).toFixed(1)}" text-anchor="middle" font-family="serif" font-weight="bold" font-size="${i % 3 === 0 ? 10 : 7.5}" fill="#2a1a0c">${t}</text>`;
  });
  let ticks = "";
  for (let i = 0; i < 60; i++) {
    const a = i * 6 * DEG;
    const r1 = i % 5 === 0 ? 41 : 43;
    ticks += `<path d="M${(50 + Math.sin(a) * r1).toFixed(1)} ${(50 - Math.cos(a) * r1).toFixed(1)} L${(50 + Math.sin(a) * 45).toFixed(1)} ${(50 - Math.cos(a) * 45).toFixed(1)}" stroke="#2a1a0c" stroke-width="${i % 5 === 0 ? 1.8 : 0.9}"/>`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="49" fill="#e6b84e" stroke="#6b4512" stroke-width="1.6"/>
    <circle cx="50" cy="50" r="46" fill="#fbf4e2" stroke="#6b4512" stroke-width="1.2"/>
    ${ticks}${nums}
    <path d="M50 50 L36 28" stroke="#1d3a9a" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M50 50 L72 27" stroke="#1d3a9a" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="3.4" fill="#e6b84e" stroke="#6b4512" stroke-width="1"/>
  </svg>`;
}

function miniatureSvg() {
  let leaves = "";
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const x = 35 + 27 * Math.sin(a);
    const y = 45 - 36 * Math.cos(a);
    const rot = (Math.atan2(36 * Math.sin(a), 27 * Math.cos(a)) / DEG).toFixed(1);
    leaves += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="4.6" ry="2.4" fill="${i % 2 ? "#4f8a4a" : "#6aa75a"}" stroke="#2f5a30" stroke-width=".8" transform="rotate(${rot} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  const rose = (x: number, y: number, r: number) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#d85a7a" stroke="#8c2543" stroke-width=".9"/>
     <circle cx="${x}" cy="${y}" r="${r * 0.68}" fill="#ec7f9a"/>
     <circle cx="${x}" cy="${y}" r="${r * 0.38}" fill="#f8a8bc"/>
     <path d="M${x - r * 0.5} ${y} Q${x} ${y - r * 0.6} ${x + r * 0.5} ${y} Q${x} ${y + r * 0.5} ${x - r * 0.2} ${y + r * 0.1}" fill="none" stroke="#b0385a" stroke-width="1"/>`;
  let dots = "";
  [[20, 34], [51, 31], [46, 66], [22, 64], [35, 25], [29, 72]].forEach(([x, y]) => {
    dots += `<circle cx="${x}" cy="${y}" r="2.6" fill="#6c8be0" stroke="#2b3f90" stroke-width=".6"/><circle cx="${x}" cy="${y}" r=".9" fill="#ffe27a"/>`;
  });
  return `<svg viewBox="0 0 70 90" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="bg" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#fbf0dc"/><stop offset="1" stop-color="#cfe0ee"/></radialGradient></defs>
    <ellipse cx="35" cy="45" rx="34" ry="44" fill="url(#bg)"/>
    ${leaves}
    ${dots}
    ${rose(35, 42, 10)}${rose(24, 53, 6.4)}${rose(46, 54, 6.4)}
    <path d="M35 72 Q26 66 22 74 Q28 80 35 74 Q42 80 48 74 Q44 66 35 72Z" fill="#e6b84e" stroke="#7a4c0e" stroke-width="1"/>
    <ellipse cx="35" cy="45" rx="34" ry="44" fill="none" stroke="#c99a3a" stroke-width="2.4"/>
  </svg>`;
}

function filigreeSvg() {
  const curls = [
    "M20 58 C20 46 20 30 20 12",
    "M20 52 C8 52 3 42 10 37 C16 33 22 39 17 43",
    "M20 52 C32 52 37 42 30 37 C24 33 18 39 23 43",
    "M20 36 C11 36 8 28 13 24 C18 21 22 26 18 29",
    "M20 36 C29 36 32 28 27 24 C22 21 18 26 22 29",
    "M20 20 C15 18 14 12 18 9",
    "M20 20 C25 18 26 12 22 9",
    "M20 58 C14 62 10 66 8 69",
    "M20 58 C26 62 30 66 32 69",
  ];
  const draw = (w: number, c: string) => curls.map((d) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`).join("");
  const dots = [[20, 8], [17, 43], [23, 43], [18, 29], [22, 29], [8, 69], [32, 69]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#f7d572" stroke="#7a4c0e" stroke-width="1"/>`)
    .join("");
  return `<svg viewBox="0 0 40 72" xmlns="http://www.w3.org/2000/svg">${draw(4.6, "#7a4c0e")}${draw(2.4, "#f7d572")}${dots}</svg>`;
}

function faceSvg() {
  return `<svg viewBox="0 0 48 38" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="8" cy="26" rx="5.4" ry="3.2" fill="#f4a0ae"/><ellipse cx="40" cy="26" rx="5.4" ry="3.2" fill="#f4a0ae"/>
    <ellipse cx="15" cy="18" rx="4.2" ry="5.6" fill="#2b1a24"/><ellipse cx="33" cy="18" rx="4.2" ry="5.6" fill="#2b1a24"/>
    <circle cx="16.4" cy="15.6" r="1.7" fill="#ffffff"/><circle cx="34.4" cy="15.6" r="1.7" fill="#ffffff"/>
    <circle cx="13.6" cy="20.6" r=".8" fill="#ffffff"/><circle cx="31.6" cy="20.6" r=".8" fill="#ffffff"/>
    <path d="M9 10 Q15 6 21 9" stroke="#5a3320" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M27 9 Q33 6 39 10" stroke="#5a3320" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M19 29 Q24 34 29 29" stroke="#c4384e" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  </svg>`;
}

const petalSvg = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 31 C4 26 1 12 7 3 C11 8 14 6 16 2 C18 6 21 8 25 3 C31 12 28 26 16 31Z" fill="#ffffff" stroke="#c4c4c4" stroke-width="1.6"/>
  <path d="M16 29 L16 8 M16 24 L9 13 M16 24 L23 13" stroke="#d6d6d6" stroke-width="1.2" fill="none"/>
</svg>`;

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "faberge_surprise_egg" });
  type J = ReturnType<typeof b.joint>;
  const V = THREE.Vector3;

  // ---- skeleton ------------------------------------------------------------------------------------------------
  const base = b.joint("base", { at: [0, 0, 0] });
  const lidHinge = b.joint("lidHinge", { parent: base, at: [0, CUT_Y, -(R_CUT + 0.0016)], dir: [0, 1, 0], role: "hinge" });
  const platform = b.joint("platform", { parent: base, at: [0, 0.0835, 0], dir: [0, 1, 0] });
  const turntable = b.joint("turntable", { parent: platform, at: [0, 0.0905, 0], dir: [0, 1, 0] });
  const key = b.joint("windingKey", { parent: base, at: [0.0295, 0.026, 0], dir: [1, 0, 0], role: "hinge" });

  // ---- egg surface helpers -------------------------------------------------------------------------------------
  function eggAt(t: number, deg: number, lift = 0) {
    const e = 1e-3;
    const t1 = Math.max(-0.999, t - e);
    const t2 = Math.min(0.999, t + e);
    const dr = rOf(t2) - rOf(t1);
    const dy = yOf(t2) - yOf(t1);
    const l = Math.hypot(dr, dy);
    const nr = dy / l;
    const ny = -dr / l;
    const r = rOf(t) + nr * lift;
    const y = CY + yOf(t) + ny * lift;
    const s = Math.sin(deg * DEG);
    const c = Math.cos(deg * DEG);
    return {
      p: new V(r * s, y, r * c),
      n: new V(nr * s, ny, nr * c),
      az: new V(c, 0, -s),
      up: new V((dr / l) * s, dy / l, (dr / l) * c),
    };
  }
  const onEgg = (t: number, deg: number, rad: number, a: number, lift: number) => {
    const t2 = t + (rad * Math.sin(a)) / HH;
    const deg2 = deg + rad * Math.cos(a) / Math.max(0.004, rOf(t2)) / DEG;
    return eggAt(t2, deg2, lift);
  };

  // ---- merged small things (pearls, collets) -------------------------------------------------------------------
  const bins = new Map<string, { bone: J; color: string; geos: THREE.BufferGeometry[] }>();
  const addGeo = (bone: J, color: string, geo: THREE.BufferGeometry) => {
    const k = bone.name + color;
    let e = bins.get(k);
    if (!e) bins.set(k, (e = { bone, color, geos: [] }));
    e.geos.push(geo);
  };
  const pearl = (bone: J, pos: THREE.Vector3, r: number, color = PEARL) =>
    addGeo(bone, color, new THREE.SphereGeometry(r, 8, 5).translate(pos.x, pos.y, pos.z));
  const collet = (bone: J, pos: THREE.Vector3, n: THREE.Vector3, r: number) => {
    const q = aim(n);
    const at = pos.clone().addScaledVector(n, -0.05 * r);
    addGeo(bone, GOLD_FLAT, new THREE.CylinderGeometry(r * 1.15, r * 1.35, r * 0.5, 8).applyQuaternion(q).translate(at.x, at.y, at.z));
    addGeo(bone, GOLD_FLAT, new THREE.TorusGeometry(r * 1.05, r * 0.3, 5, 10).rotateX(Math.PI / 2).applyQuaternion(q).translate(at.x, at.y, at.z));
  };
  const flush = () => {
    for (const e of bins.values()) {
      const m = mergeGeometries(e.geos);
      if (m) b.part(m, e.color, { bone: e.bone, at: [0, 0, 0], name: `beads.${e.bone.name}` });
    }
    bins.clear();
  };

  // ---- gems ------------------------------------------------------------------------------------------------------
  function gem(bone: J, color: string, pos: THREE.Vector3, n: THREE.Vector3, r: number, kind: "cut" | "cab" = "cut", strength = 0) {
    let part;
    if (kind === "cut") {
      const pts = [[0, 0], [1, 0.55], [1, 0.68], [0.62, 1], [0, 1.03]].map(([x, y]) => new THREE.Vector2(x * r, y * r));
      part = b.part(new THREE.LatheGeometry(pts, 8), color, {
        bone,
        at: pos.clone().addScaledVector(n, -0.25 * r),
        dir: n,
        flat: true,
      });
    } else {
      part = b.part(new THREE.SphereGeometry(r, 8, 5), color, { bone, at: pos, dir: n, scale: [1, 0.62, 1], flat: true });
    }
    if (strength) glow(part, strength);
    return part;
  }
  const setGem = (bone: J, color: string, e: { p: THREE.Vector3; n: THREE.Vector3 }, r: number, kind: "cut" | "cab" = "cut", strength = 0) => {
    collet(bone, e.p, e.n, r);
    return gem(bone, color, e.p, e.n, r, kind, strength);
  };

  // ---- gold helpers ------------------------------------------------------------------------------------------------
  function meridian(bone: J, ta: number, tb: number, deg: number) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 8; i++) pts.push(eggAt(ta + ((tb - ta) * i) / 8, deg, 0.0005).p);
    b.sweep(catmull(pts), 0.0013, { bone, color: GILT, sides: 6, caps: "round" });
  }
  function bandRing(bone: J, t: number, lift: number, rad: number) {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < 18; k++) pts.push(eggAt(t, k * 20, lift).p);
    b.sweep(catmull(pts, { closed: true }), rad, { bone, color: GILT, sides: 6 });
  }
  function pearlRing(bone: J, t: number, count: number, lift: number, r: number, off = 0) {
    for (let k = 0; k < count; k++) pearl(bone, eggAt(t, off + (k * 360) / count, lift).p, r);
  }
  function leaf(bone: J, t: number, deg: number, a: number, len: number, wid: number, color = LEAFG) {
    const e = eggAt(t, deg, 0.0003);
    const d = e.az.clone().multiplyScalar(Math.cos(a)).addScaledVector(e.up, Math.sin(a)).normalize();
    const side = e.n.clone().cross(d);
    b.extrude(
      [
        [0, 0],
        [len * 0.3, wid * 0.9],
        [len * 0.62, wid],
        [len, 0, "sharp"],
        [len * 0.62, -wid],
        [len * 0.3, -wid * 0.9],
      ],
      { at: e.p, x: d, y: side, thickness: 0.0007, smoothing: 1, color, bone },
    );
  }

  // ===============================================================================================================
  // PEDESTAL
  const polar = (r: number, y: number, deg: number) => new V(r * Math.sin(deg * DEG), y, r * Math.cos(deg * DEG));
  const pedestal = b.lathe(
    [
      [0, 0], [0.058, 0], [0.06, 0.0025], [0.0585, 0.0065], [0.051, 0.0095], [0.04, 0.0115], [0.024, 0.0135],
      [0.0245, 0.0165], [0.03, 0.0185], [0.03, 0.0345], [0.0255, 0.0365], [0.0215, 0.0385], [0.0225, 0.0425],
      [0.0275, 0.0495], [0.0315, 0.0545], [0.0335, 0.0575], [0.0295, 0.0575], [0.0287, 0.0545], [0.022, 0.0485],
      [0.0125, 0.0445], [0, 0.0432],
    ],
    { at: [0, 0, 0], bone: base, segments: 20, color: pedestalPaint, name: "pedestal" },
  );
  // clock on the enamel drum
  b.decal(pedestal, svg(clockSvg(), { size: 256 }), { at: [0, 0.026, 0.03], dir: [0, 0, 1], size: [0.0235, 0.0235] });
  // gilt drum rims
  for (const y of [0.0188, 0.0343]) {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < 16; k++) pts.push(polar(0.0302, y, k * 22.5));
    b.sweep(catmull(pts, { closed: true }), 0.0012, { bone: base, color: GILT, sides: 6 });
  }
  // scroll brackets rising to the cup
  for (const deg of [60, 180, 300]) {
    const arch = ([[0.055, 0.006], [0.0505, 0.019], [0.0415, 0.032], [0.0345, 0.0445], [0.0328, 0.056]] as number[][]).map(([r, y]) => polar(r, y, deg));
    b.sweep(catmull(arch), [0.0017, 0.001], { bone: base, color: GILT, sides: 6 });
    const curl = ([[0.055, 0.006], [0.0605, 0.0075], [0.0635, 0.0112], [0.0612, 0.0145], [0.0585, 0.0135]] as number[][]).map(([r, y]) => polar(r, y, deg));
    b.sweep(catmull(curl), [0.0017, 0.0009], { bone: base, color: GILT, sides: 6 });
    pearl(base, polar(0.0585, 0.0135, deg), 0.0012);
    pearl(base, polar(0.0328, 0.0562, deg), 0.0014);
  }
  for (let k = 0; k < 24; k++) pearl(base, polar(0.0535, 0.0094, k * 15), 0.0017);

  // winding key
  b.rod([0.0285, 0.026, 0], [0.0425, 0.026, 0], 0.0012, { bone: key, color: GILT, sides: 8 });
  b.rod([0.036, 0.026, 0], [0.0372, 0.026, 0], 0.0019, { bone: key, color: GILT, sides: 8 });
  const bowOutline: [number, number][] = [];
  for (let k = 0; k < 24; k++) {
    const th = (k / 24) * Math.PI * 2;
    const r = 0.0046 * (1 + 0.28 * Math.cos(4 * th));
    bowOutline.push([r * Math.cos(th), r * Math.sin(th)]);
  }
  b.extrude(bowOutline, { at: [0.0475, 0.026, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.0017, bevel: 0.0004, color: GILT, bone: key });
  gem(key, RUBY, new V(0.0486, 0.026, 0), new V(1, 0, 0), 0.0018, "cab", 0.4);

  // ===============================================================================================================
  // EGG, LOWER SHELL
  const NS = 9;
  const t0 = TC / K;
  const lowerOutline: [number, number][] = [];
  for (let i = 0; i <= NS; i++) {
    const t = -1 + ((TC + 1) * i) / NS;
    lowerOutline.push([rOf(t), yOf(t)]);
  }
  for (let i = 0; i <= NS; i++) {
    const t = t0 + ((-1 - t0) * i) / NS;
    lowerOutline.push([K * rOf(t), K * yOf(t)]);
  }
  const lowerShell = b.lathe(lowerOutline, { at: [0, CY, 0], bone: base, segments: 20, color: eggEnamel, name: "eggLower" });

  const lidOutline: [number, number][] = [];
  for (let i = 0; i <= NS; i++) {
    const t = TC + ((1 - TC) * i) / NS;
    lidOutline.push([rOf(t), yOf(t)]);
  }
  for (let i = 0; i <= NS; i++) {
    const t = 1 + ((t0 - 1) * i) / NS;
    lidOutline.push([K * rOf(t), K * yOf(t)]);
  }
  const lid = b.lathe(lidOutline, { at: [0, CY, 0], bone: lidHinge, segments: 20, color: eggEnamel, name: "eggLid" });
  void lid;

  const bandDegs = [35, -35, 90, -90, 145, -145];
  const gapDegs = [0, 62.5, -62.5, 117.5, -117.5, 180];

  // gold meridians, rim bands and pearls
  for (const d of bandDegs) {
    meridian(base, -0.8, TC, d);
    meridian(lidHinge, TC, 0.92, d);
  }
  bandRing(base, TC, 0.0006, 0.0017);
  bandRing(lidHinge, TC, 0.0006, 0.0017);
  bandRing(base, TC - 0.075, 0.0005, 0.0009);
  bandRing(lidHinge, TC + 0.075, 0.0005, 0.0009);
  pearlRing(base, TC - 0.04, 28, 0.0011, 0.0016);
  pearlRing(lidHinge, TC + 0.04, 28, 0.0011, 0.0016, 6);
  bandRing(base, -0.7, 0.0005, 0.001);
  bandRing(lidHinge, 0.74, 0.0005, 0.001);

  // lower shell: gems on the meridians, calyx leaves, miniature, filigree sprigs
  bandDegs.forEach((d, i) => setGem(base, i % 2 ? SAPH : EMER, eggAt(-0.62, d, 0.0004), 0.0032));
  for (let k = 0; k < 8; k++) leaf(base, -0.755, k * 45 + 22.5, Math.PI / 2, 0.013, 0.0045);
  const TM = -0.32;
  const framePts: THREE.Vector3[] = [];
  for (let k = 0; k < 20; k++) {
    const th = (k / 20) * Math.PI * 2;
    const t2 = TM + (0.0145 * Math.sin(th)) / HH;
    const deg2 = (0.0115 * Math.cos(th)) / rOf(t2) / DEG;
    framePts.push(eggAt(t2, deg2, 0.0005).p);
    if (k % 5 === 0) {
      const e = eggAt(t2, deg2, 0.0008);
      setGem(base, DIAM, e, 0.0017);
    } else if (k % 2 === 0) {
      pearl(base, eggAt(t2, deg2, 0.0012).p, 0.0012);
    }
  }
  b.sweep(catmull(framePts, { closed: true }), 0.0009, { bone: base, color: GILT, sides: 6 });
  const mc = eggAt(TM, 0, 0);
  b.decal(lowerShell, svg(miniatureSvg(), { size: 384 }), { at: mc.p, dir: mc.n, size: [0.0225, 0.0287] });
  const sprig = svg(filigreeSvg(), { size: 256 });
  for (const d of [62.5, -62.5, 117.5, -117.5, 180]) {
    const e = eggAt(-0.3, d, 0);
    b.decal(lowerShell, sprig, { at: e.p, dir: e.n, size: [0.0155, 0.0275] });
  }
  // thumb clasp
  {
    const e = eggAt(TC - 0.015, 0, 0.0004);
    b.part(new THREE.BoxGeometry(0.008, 0.007, 0.0016), GILT, { bone: base, at: e.p, dir: e.n });
    gem(base, RUBY, e.p.clone().addScaledVector(e.n, 0.0007), e.n, 0.0021, "cab", 0.4);
  }

  // hinge: knuckles on shell and lid, plates
  const hy = CUT_Y;
  const hz = -(R_CUT + 0.0016);
  for (const s of [1, -1]) {
    b.rod([s * 0.0036, hy, hz], [s * 0.0088, hy, hz], 0.0022, { bone: base, color: GILT, sides: 8 });
    b.part(new THREE.BoxGeometry(0.005, 0.007, 0.0016), GILT, { bone: base, at: [s * 0.0062, hy - 0.0032, hz + 0.0012] });
  }
  b.rod([-0.0034, hy, hz], [0.0034, hy, hz], 0.0023, { bone: lidHinge, color: GILT, sides: 8 });
  b.part(new THREE.BoxGeometry(0.006, 0.007, 0.0016), GILT, { bone: lidHinge, at: [0, hy + 0.0032, hz + 0.0012] });

  // ---- lid decoration (built closed; the hinge is posed open at the end) -----------------------------------------
  const TR = 0.5;
  gapDegs.forEach((d) => {
    const c = eggAt(TR, d, 0.0004);
    setGem(lidHinge, RUBY, c, 0.0036, "cab", 0.45);
    for (let k = 0; k < 6; k++) {
      const e = onEgg(TR, d, 0.0068, (k * Math.PI) / 3, 0.0009);
      pearl(lidHinge, e.p, 0.0019);
    }
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3 + Math.PI / 6;
      const e = onEgg(TR, d, 0.0052, a, 0);
      // recover t/deg of the base from the rosette offset
      const t2 = TR + (0.0052 * Math.sin(a)) / HH;
      const deg2 = d + (0.0052 * Math.cos(a)) / Math.max(0.004, rOf(t2)) / DEG;
      void e;
      leaf(lidHinge, t2, deg2, a, 0.0074, 0.0026);
    }
  });
  bandDegs.forEach((d, i) => setGem(lidHinge, i % 2 ? EMER : SAPH, eggAt(0.74, d, 0.0004), 0.0028));
  gapDegs.forEach((d) => setGem(lidHinge, DIAM, eggAt(0.74, d, 0.0004), 0.0021));
  // finial: gilt collar, ruby, crown pearls
  const apex = eggAt(0.925, 0, 0);
  const collarY = apex.p.y - 0.001;
  b.lathe(
    [[0, 0], [0.015, 0], [0.0152, 0.0012], [0.0112, 0.003], [0.0078, 0.0058], [0.0098, 0.0082], [0.0072, 0.011], [0.004, 0.0118], [0, 0.0118]],
    { at: [0, collarY, 0], bone: lidHinge, segments: 12, color: GILT, name: "finialCollar" },
  );
  gem(lidHinge, RUBY, new V(0, collarY + 0.0128, 0), new V(0, 1, 0), 0.0058, "cab", 0.6);
  for (let k = 0; k < 8; k++) pearl(lidHinge, polar(0.0088, collarY + 0.0058, k * 45 + 22.5), 0.0014);
  for (let k = 0; k < 4; k++) {
    const e = eggAt(0.84, k * 90 + 45, 0.0004);
    setGem(lidHinge, DIAM, e, 0.0017);
  }
  // lid front catch
  {
    const e = eggAt(TC + 0.012, 0, 0.0004);
    gem(lidHinge, RUBY, e.p.clone().addScaledVector(e.n, 0.0004), e.n, 0.0018, "cab", 0.4);
  }

  flush();
  b.pose(lidHinge, { axis: [1, 0, 0], deg: -100 });

  // ===============================================================================================================
  // PLATFORM + GEARS + TURNTABLE
  b.lathe(
    [[0, 0.0835], [0.0372, 0.0835], [0.0378, 0.085], [0.0372, 0.0872], [0.0335, 0.0885], [0.0335, 0.0905], [0, 0.0905]],
    { at: [0, 0, 0], bone: platform, segments: 24, color: platformPaint, name: "platform" },
  );
  b.lathe([[0, 0.0905], [0.0148, 0.0905], [0.015, 0.0915], [0.0145, 0.0925], [0, 0.0925]], {
    at: [0, 0, 0],
    bone: turntable,
    segments: 20,
    color: GILT,
    name: "turntable",
  });
  const gearCols = [metal("gilt", { seed: 21 }), metal("copper", { seed: 22 }), metal("blued", { seed: 23 })];
  gearTrain(b, {
    at: [0.015, 0.0912, -0.0175],
    axis: [0, 1, 0],
    module: 0.0007,
    spin: "gearA",
    bone: platform,
    color: gearCols,
    arbor: metal("steel"),
    gears: [{ teeth: 18, spokes: 4, bore: 0.0004 }, { teeth: 10, angle: 20, bore: 0.0003 }, { teeth: 14, angle: 60, bore: 0.0003 }],
  });
  gearTrain(b, {
    at: [-0.015, 0.0912, 0.0175],
    axis: [0, 1, 0],
    module: 0.0007,
    spin: "gearB",
    bone: platform,
    color: gearCols,
    arbor: metal("steel"),
    gears: [{ teeth: 18, spokes: 4, bore: 0.0004 }, { teeth: 10, angle: 200, bore: 0.0003 }, { teeth: 14, angle: 240, bore: 0.0003 }],
  });

  // ===============================================================================================================
  // THE BALLERINA AUTOMATON
  const FY = 0.0925;
  const hipY = 0.1068;
  const sp = b.chain(
    "dancerSpine",
    catmull([[0, hipY, 0], [0, hipY + 0.0042, 0], [0, hipY + 0.0084, 0], [0, hipY + 0.0125, 0]]),
    { parent: turntable, role: "spine" },
  );
  const hips = sp.joints[0];
  const chest = sp.joints[sp.joints.length - 1];
  b.sweep(sp, [0.004, 0.0032, 0.004, 0.0038], { color: PINK_B, sides: 8 });
  const neck = b.joint("dancerNeck", { parent: chest, at: [0, hipY + 0.0125, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("dancerHead", { parent: neck, at: [0, hipY + 0.0155, 0], dir: [0, 1, 0], role: "head" });
  b.rod([0, hipY + 0.0118, 0], [0, hipY + 0.0162, 0], 0.0016, { bone: neck, color: SKIN, sides: 8 });
  const headC = new V(0, hipY + 0.0155 + 0.0046, 0);
  const headPart = b.part(new THREE.SphereGeometry(0.0055, 12, 9), SKIN, { bone: head, at: headC, scale: [1, 1.06, 1] });
  b.decal(headPart, svg(faceSvg(), { size: 192 }), {
    at: [0, headC.y - 0.0004, headC.z + 0.0054],
    dir: [0, 0, 1],
    size: [0.0092, 0.0073],
  });
  // hair: cap, back mass, bun, tiara
  b.part(new THREE.SphereGeometry(0.0059, 12, 7, 0, Math.PI * 2, 0, 1.2), HAIR, { bone: head, at: [0, headC.y + 0.0003, headC.z - 0.0006] });
  b.part(new THREE.SphereGeometry(0.005, 10, 8), HAIR, { bone: head, at: [0, headC.y - 0.0004, headC.z - 0.002], scale: [1.12, 1, 1] });
  b.part(new THREE.SphereGeometry(0.0028, 8, 6), HAIR, { bone: head, at: [0, headC.y + 0.0062, headC.z - 0.0018] });
  b.part(new THREE.TorusGeometry(0.0056, 0.00035, 4, 14, Math.PI), GILT, { bone: head, at: [0, headC.y, headC.z + 0.0018] });
  gem(head, RUBY, new V(0, headC.y + 0.0058, headC.z + 0.0018), new V(0, 1, 0), 0.0009, "cab", 0.4);
  for (const s of [1, -1]) pearl(head, new V(s * 0.0035, headC.y - 0.0008, headC.z + 0.0042), 0.0007);

  // tutu: two lathe layers + tulle petal cards + gilt belt
  const tutu: [number, number][] = [
    [0.003, 0.003], [0.007, 0.0004], [0.0125, -0.0018], [0.0152, -0.0036], [0.015, -0.0042], [0.01, -0.0034], [0.005, -0.0025], [0.0028, -0.0022],
  ];
  b.lathe(tutu, { at: [0, hipY + 0.0011, 0], bone: hips, segments: 16, color: "#f3a9be", name: "tutu" });
  b.lathe(tutu.map(([r, y]) => [r * 1.12, y - 0.0007] as [number, number]), {
    at: [0, hipY + 0.0011, 0], bone: hips, segments: 16, color: "#fbd7e0", name: "underskirt",
  });
  const petal = svg(petalSvg, { size: 128 });
  const ringHigh = b.ring(frame([0, hipY + 0.0011 - 0.0022, 0], [0, 1, 0]), { count: 14, radius: 0.0106 }).items;
  b.cards(ringHigh, petal, { size: [0.0055, 0.0048], lean: 38, flow: [0, -1, 0], color: "#fbd2dd", bone: hips });
  const ringLow = b.ring(frame([0, hipY + 0.0011 - 0.0034, 0], [0, 1, 0]), { count: 18, radius: 0.0138, fromDeg: 10, toDeg: 370 }).items;
  b.cards(ringLow, petal, { size: [0.0062, 0.0055], lean: 55, flow: [0, -1, 0], color: "#f7c2d0", bone: hips });
  const beltPts: THREE.Vector3[] = [];
  for (let k = 0; k < 14; k++) beltPts.push(polar(0.0036, hipY + 0.0045, k * (360 / 14)));
  b.sweep(catmull(beltPts, { closed: true }), 0.0006, { bone: hips, color: GILT, sides: 6 });
  const neckPts: THREE.Vector3[] = [];
  for (let k = 0; k < 14; k++) neckPts.push(polar(0.0041, hipY + 0.0116, k * (360 / 14)));
  b.sweep(catmull(neckPts, { closed: true }), 0.0005, { bone: chest, color: GILT, sides: 6 });
  for (let k = 0; k < 6; k++) pearl(chest, polar(0.0043, hipY + 0.0112, -50 + k * 20), 0.00055);
  gem(chest, RUBY, new V(0, hipY + 0.0078, 0.0036), new V(0, 0, 1), 0.0009, "cab", 0.4);

  // arms and legs (left = +X)
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${S}`,
      catmull([[s * 0.0044, hipY + 0.0118, 0], [s * 0.009, hipY + 0.0094, 0.0008], [s * 0.0128, hipY + 0.0064, 0.0022]]),
      { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" },
    );
    b.sweep(arm, [0.0014, 0.0011, 0.0009], { color: SKIN, sides: 6 });
    b.part(new THREE.SphereGeometry(0.0022, 8, 6), PINK_B, { bone: arm.joints[0], at: [s * 0.0049, hipY + 0.0116, 0] });
    b.part(new THREE.SphereGeometry(0.0012, 8, 6), SKIN, { bone: arm.tip!, at: [s * 0.0131, hipY + 0.006, 0.0024] });
    pearl(arm.joints[1], new V(s * 0.009, hipY + 0.0094, 0.0008), 0.0006);

    const leg = b.chain(
      `leg${S}`,
      catmull([[s * 0.0022, hipY, 0], [s * 0.0024, hipY - 0.0052, 0], [s * 0.0025, FY + 0.0042, 0], [s * 0.0025, FY, 0]]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`, `toe${S}`], role: "leg" },
    );
    b.sweep(leg, [0.0017, 0.0012, 0.001, 0.0009], { color: TIGHTS, sides: 6 });
    b.rod([s * 0.0025, FY + 0.0042, 0], [s * 0.0025, FY, 0], [0.0018, 0.0014], { bone: leg.tip!, color: SATIN, sides: 8 });
    b.part(new THREE.TorusGeometry(0.0016, 0.0004, 4, 8), SATIN, { bone: leg.tip!, at: [s * 0.0025, FY + 0.0044, 0], dir: [0, 1, 0], axis: "z" });
  }

  // magic motes: little glowing four-point stars drifting around her
  const starOutline: [number, number, "sharp"][] = [];
  for (let k = 0; k < 8; k++) {
    const r = k % 2 ? 0.0007 : 0.0024;
    starOutline.push([r * Math.cos((k * Math.PI) / 4), r * Math.sin((k * Math.PI) / 4), "sharp"]);
  }
  ([[0.017, 0.1295, 0.012], [-0.018, 0.124, 0.01], [0.009, 0.1385, -0.006], [-0.011, 0.1345, -0.008]] as number[][]).forEach(([x, y, z], i) => {
    const star = b.extrude(starOutline, { at: [x, y, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.0004, color: i % 2 ? "#fff1b8" : "#ffe08a", bone: turntable });
    glow(star, 1.2);
  });

  flush();
  return b.root;
}
