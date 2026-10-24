```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  createBuilder,
  frame,
  rng,
  aim,
  DEG,
  mix,
  paint,
  smoothstep,
  bezier,
  catmull,
  polyline,
  svg,
} from "agentic-3js-builder";
import { metal, gearTrain, TINT, coil } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Fabergé Automaton Egg",
  description:
    "A raspberry guilloché-enamel and gold jewelled egg on a gilt stand, lid hinged open to reveal a tiny clockwork ballerina on a sprung stage above a gear train.",
};

// ---------------------------------------------------------------------------------------------------------------
// Dimensions (meters)
const TAU = Math.PI * 2;
const H = 0.15; // egg height
const RM = 0.056; // egg max radius
const TC = 0.52; // t (0..1 along the height) where the egg divides
const TH = 0.0026; // shell thickness
const EGG_Y = 0.0505; // egg bottom, sits in the stand's dish

const eggR = (t: number) => {
  const u = 2 * t - 1;
  return RM * Math.sqrt(Math.max(1 - u * u, 0)) * (1 - 0.12 * u);
};
/** Outward normal of the profile as [radial, vertical]. */
const eggN = (t: number): [number, number] => {
  const e = 1e-4;
  const t0 = Math.max(t - e, 0);
  const t1 = Math.min(t + e, 1);
  const dr = eggR(t1) - eggR(t0);
  const dy = (t1 - t0) * H;
  const l = Math.hypot(dr, dy);
  return [dy / l, -dr / l];
};
/** Profile point at t, pushed `inset` meters inward along the normal (negative = outward). */
const eggAt = (t: number, inset = 0): [number, number] => {
  const [nr, ny] = eggN(t);
  return [Math.max(eggR(t) - inset * nr, 0), t * H - inset * ny];
};
const ts = (a: number, c: number, n: number) => Array.from({ length: n + 1 }, (_, i) => a + ((c - a) * i) / n);
const eggWorld = (t: number, phi: number, out = 0) => {
  const [r, y] = eggAt(t, -out);
  return new THREE.Vector3(r * Math.sin(phi), EGG_Y + y, r * Math.cos(phi));
};
const eggNormal = (t: number, phi: number) => {
  const [nr, ny] = eggN(t);
  return new THREE.Vector3(nr * Math.sin(phi), ny, nr * Math.cos(phi)).normalize();
};
const RC = eggR(TC);
const YC = TC * H;

// ---------------------------------------------------------------------------------------------------------------
// Colours and paints
const GOLD = metal("gilt", { polish: 0.55, tarnish: 0.06, seed: 4 });
const GOLD_F = "#e8b94d";
const GOLD_DK = "#9a6d1f";
const PEARL = "#f4ede2";
const DIAMOND = "#e6f4ff";
const RUBY = "#d3122f";
const SAPPHIRE = "#2457d6";
const IVORY = "#f4ead4";
const PORC = "#f8e6d6";
const HAIR = "#3a2216";
const BODICE = "#c2234f";
const PINK = "#f2b4c4";
const STEEL = metal("blued");

/** Engine-turned enamel: wavy bands whose phase swings with angle, over fine sunburst rays. */
const guilloche = (dark: string, midc: string, light: string, freq = 8, rays = 36) =>
  paint((_p, n, s) => {
    const a = s[1] * DEG;
    const wave = 0.5 + 0.5 * Math.sin((s[0] / 0.0032) * TAU + 2.4 * Math.sin(a * freq));
    const spoke = 0.5 + 0.5 * Math.sin(a * rays);
    let c = mix(dark, midc, 0.15 + 0.7 * wave);
    c = mix(c, light, 0.28 * smoothstep(0.6, 1, wave * 0.6 + spoke * 0.5));
    return mix(c, "#ffffff", 0.2 * smoothstep(0.35, 1, n.y));
  });
const ROSE = guilloche("#8e1236", "#cf2a58", "#ff8fae");
const BLUE = guilloche("#12296b", "#2a54b3", "#7fa3ee", 6, 30);
const SILK = paint((_p, _n, s) => mix("#e2cf9f", "#fbf2d8", 0.5 + 0.5 * Math.sin(s[1] * DEG * 12)));
const GOLD_ENGR = paint((p, n) => (n.y > 0.8 && Math.sin(Math.atan2(p.x, p.z) * 48) > 0.7 ? GOLD_DK : GOLD));

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const beadRing = () => {
  let s = "";
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * TAU;
    s += `<circle cx="${(35 + 30.2 * Math.cos(a)).toFixed(1)}" cy="${(43 + 38.2 * Math.sin(a)).toFixed(1)}" r="2.1" fill="#fbf6ee" stroke="#8a6a2a" stroke-width="0.7"/>`;
  }
  return s;
};
const medallion = (inner: string, ground: string) =>
  svg(
    `<svg viewBox="0 0 70 86" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="35" cy="43" rx="34" ry="42" fill="#d9a63c" stroke="#6e4710" stroke-width="2"/>
      <ellipse cx="35" cy="43" rx="33" ry="41" fill="none" stroke="#fff0b0" stroke-width="1.2"/>
      ${beadRing()}
      <ellipse cx="35" cy="43" rx="25.5" ry="33.5" fill="${ground}" stroke="#6e4710" stroke-width="1.8"/>
      ${inner}
    </svg>`,
    { size: 256 },
  );
const flower = (x: number, y: number, r: number, c: string) =>
  `<g>${[0, 72, 144, 216, 288]
    .map(
      (a) =>
        `<circle cx="${(x + r * 0.9 * Math.cos(a * DEG)).toFixed(1)}" cy="${(y + r * 0.9 * Math.sin(a * DEG)).toFixed(1)}" r="${(r * 0.75).toFixed(1)}" fill="${c}" stroke="#2c3f8a" stroke-width="0.7"/>`,
    )
    .join("")}<circle cx="${x}" cy="${y}" r="${(r * 0.5).toFixed(1)}" fill="#ffd34d"/></g>`;
const FLORAL = medallion(
  `<path d="M35 64 C33 52 30 44 24 36 M35 64 C37 52 42 46 47 40 M35 64 C35 50 35 42 36 30" stroke="#2f7a48" stroke-width="1.8" fill="none"/>
   <ellipse cx="22" cy="56" rx="7" ry="3" fill="#3e9b5e" transform="rotate(-35 22 56)"/>
   <ellipse cx="49" cy="55" rx="7" ry="3" fill="#3e9b5e" transform="rotate(35 49 55)"/>
   ${flower(36, 30, 6.5, "#6fa0f0")}${flower(24, 38, 5.2, "#f08fb0")}${flower(47, 40, 5.4, "#6fa0f0")}${flower(30, 50, 4.2, "#fbfbff")}${flower(42, 52, 4.2, "#f08fb0")}`,
  "#f7efdc",
);
const CROWN = medallion(
  `<ellipse cx="35" cy="43" rx="22.5" ry="30.5" fill="#1f3f94"/>
   <path d="M14 60 C11 46 15 31 24 21 M56 60 C59 46 55 31 46 21" stroke="#3ea866" stroke-width="2.4" fill="none"/>
   <ellipse cx="14" cy="50" rx="4.5" ry="2.2" fill="#3ea866" transform="rotate(-70 14 50)"/>
   <ellipse cx="56" cy="50" rx="4.5" ry="2.2" fill="#3ea866" transform="rotate(70 56 50)"/>
   <ellipse cx="16" cy="38" rx="4.5" ry="2.2" fill="#3ea866" transform="rotate(-60 16 38)"/>
   <ellipse cx="54" cy="38" rx="4.5" ry="2.2" fill="#3ea866" transform="rotate(60 54 38)"/>
   <path d="M21 54 L22 36 L29 44 L35 30 L41 44 L48 36 L49 54Z" fill="#e8b94d" stroke="#6e4710" stroke-width="1.5" stroke-linejoin="round"/>
   <rect x="20" y="54" width="30" height="7" rx="1.5" fill="#d9a63c" stroke="#6e4710" stroke-width="1.5"/>
   <circle cx="22" cy="35" r="2.4" fill="#fbf6ee"/><circle cx="35" cy="29" r="2.8" fill="#fbf6ee"/><circle cx="48" cy="35" r="2.4" fill="#fbf6ee"/>
   <circle cx="27" cy="57.5" r="2" fill="#d3122f"/><circle cx="35" cy="57.5" r="2.2" fill="#2457d6"/><circle cx="43" cy="57.5" r="2" fill="#d3122f"/>`,
  "#f7efdc",
);
const BUTTERFLY = medallion(
  `<path d="M35 42 C26 22 12 26 15 40 C17 47 28 47 35 42Z" fill="#cf2a58" stroke="#5c0f26" stroke-width="1.3"/>
   <path d="M35 42 C44 22 58 26 55 40 C53 47 42 47 35 42Z" fill="#cf2a58" stroke="#5c0f26" stroke-width="1.3"/>
   <path d="M35 44 C27 48 17 56 24 63 C30 67 34 55 35 44Z" fill="#2a54b3" stroke="#10215a" stroke-width="1.3"/>
   <path d="M35 44 C43 48 53 56 46 63 C40 67 36 55 35 44Z" fill="#2a54b3" stroke="#10215a" stroke-width="1.3"/>
   <circle cx="22" cy="36" r="3" fill="#ffe9a0"/><circle cx="48" cy="36" r="3" fill="#ffe9a0"/>
   <circle cx="26" cy="57" r="2.2" fill="#ffe9a0"/><circle cx="44" cy="57" r="2.2" fill="#ffe9a0"/>
   <path d="M35 28 L35 62" stroke="#2a1720" stroke-width="2.6" stroke-linecap="round"/>
   <path d="M35 28 C32 20 28 18 25 19 M35 28 C38 20 42 18 45 19" stroke="#2a1720" stroke-width="1.4" fill="none"/>`,
  "#f7efdc",
);
const LEAF = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 63 C4 48 3 24 16 1 C29 24 28 48 16 63Z" fill="#2d9462" stroke="#0f4d33" stroke-width="2"/>
    <path d="M16 60 L16 8" stroke="#e8b94d" stroke-width="2.2"/>
    <path d="M16 46 L8 36 M16 46 L24 36 M16 32 L9 23 M16 32 L23 23 M16 20 L12 14 M16 20 L20 14" stroke="#e8b94d" stroke-width="1.5"/>
  </svg>`,
  { size: 192 },
);
const FACE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="63" rx="10" ry="7" fill="#f4a2a6"/><ellipse cx="80" cy="63" rx="10" ry="7" fill="#f4a2a6"/>
    <ellipse cx="31" cy="47" rx="9.5" ry="12.5" fill="#2a1720"/><ellipse cx="69" cy="47" rx="9.5" ry="12.5" fill="#2a1720"/>
    <ellipse cx="31" cy="50" rx="6.8" ry="9" fill="#5a3a9a"/><ellipse cx="69" cy="50" rx="6.8" ry="9" fill="#5a3a9a"/>
    <ellipse cx="31" cy="51" rx="3.4" ry="5.2" fill="#1a0e18"/><ellipse cx="69" cy="51" rx="3.4" ry="5.2" fill="#1a0e18"/>
    <circle cx="27.5" cy="43" r="3.4" fill="#ffffff"/><circle cx="65.5" cy="43" r="3.4" fill="#ffffff"/>
    <circle cx="35" cy="55" r="1.8" fill="#ffffff"/><circle cx="73" cy="55" r="1.8" fill="#ffffff"/>
    <path d="M20 40 Q22 33 28 32 M80 40 Q78 33 72 32" stroke="#2a1720" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    <path d="M18 27 Q30 19 43 25 M82 27 Q70 19 57 25" stroke="#4a2a1a" stroke-width="2.8" stroke-linecap="round" fill="none"/>
    <path d="M50 60 q-2.4 3.5 0.5 4.5" stroke="#d9867f" stroke-width="1.7" stroke-linecap="round" fill="none"/>
    <path d="M42 73 Q50 80 58 73 Q50 75.5 42 73Z" fill="#d6405a" stroke="#8c1f35" stroke-width="1.4" stroke-linejoin="round"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "faberge_automaton_egg" });
  type J = ReturnType<typeof b.joint>;

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // --- geometry helpers --------------------------------------------------------------------------------------
  const DIA = new THREE.IcosahedronGeometry(1, 0);
  const OCT = new THREE.OctahedronGeometry(1, 0);
  const CAB = new THREE.SphereGeometry(1, 8, 5);
  const PRL = new THREE.SphereGeometry(1, 7, 5);

  const xf = (
    geo: THREE.BufferGeometry,
    pos: THREE.Vector3,
    dir?: THREE.Vector3,
    scale: number | [number, number, number] = 1,
  ) => {
    const q = dir ? aim(dir) : new THREE.Quaternion();
    const sc = typeof scale === "number" ? new THREE.Vector3(scale, scale, scale) : new THREE.Vector3(...scale);
    return geo.clone().applyMatrix4(new THREE.Matrix4().compose(pos, q, sc));
  };
  const merged = (geos: THREE.BufferGeometry[], color: string, bone: J, name: string, flat = false) =>
    b.part(mergeGeometries(geos.map((g) => (g.index ? g.toNonIndexed() : g)))!, color, {
      bone,
      at: [0, 0, 0],
      name,
      flat,
    });
  const circlePts = (r: number, y: number, count: number, phase = 0) =>
    Array.from({ length: count }, (_, i) => {
      const a = phase + (i / count) * TAU;
      return V(r * Math.sin(a), y, r * Math.cos(a));
    });
  const pearlsAround = (r: number, y: number, count: number, rad: number, bone: J, name: string, phase = 0) =>
    merged(
      circlePts(r, y, count, phase).map((p) => xf(PRL, p, undefined, rad)),
      PEARL,
      bone,
      name,
    );
  const pearlsOnEgg = (t: number, count: number, rad: number, out: number, bone: J, name: string, phase = 0) =>
    merged(
      Array.from({ length: count }, (_, i) => xf(PRL, eggWorld(t, phase + (i / count) * TAU, out), undefined, rad)),
      PEARL,
      bone,
      name,
    );
  const bandProfile = (t0: number, t1: number, out: number, inn: number): [number, number][] => [
    eggAt(t0, -out),
    eggAt(t1, -out),
    eggAt(t1, inn),
    eggAt(t0, inn),
  ];

  // --- skeleton ----------------------------------------------------------------------------------------------
  const base = b.joint("base", { at: [0, 0, 0] });
  const HY = EGG_Y + YC;
  const HZ = -(RC + 0.0029);
  const lid = b.joint("lid", { parent: base, at: V(0, HY, HZ), dir: [0, 0, 1], role: "hinge" });
  const DRUM_TOP = EGG_Y + 0.0402;
  const mech = b.joint("mech", { parent: base, at: [0, DRUM_TOP, 0] });
  const Y_ST = EGG_Y + 0.0675;
  const stage = b.joint("stage", { parent: mech, at: [0, Y_ST, 0], dir: [0, 1, 0] });

  // =============================================================================================================
  // STAND
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.0555, 0.0014],
      [0.0555, 0.004],
      [0.0505, 0.0072],
      [0.0425, 0.0092],
      [0.029, 0.0108],
      [0, 0.0108],
    ],
    { at: [0, 0, 0], segments: 24, color: GOLD, bone: base, name: "standBase" },
  );
  b.lathe(
    [
      [0.0528, 0.0016],
      [0.057, 0.0016],
      [0.057, 0.004],
      [0.0528, 0.004],
    ],
    { at: [0, 0, 0], segments: 24, color: BLUE, bone: base, name: "standEnamel" },
  );
  for (const [y, nm] of [
    [0.0011, "standFilletLo"],
    [0.004, "standFilletHi"],
  ] as [number, string][])
    b.lathe(
      [
        [0.0535, y],
        [0.0577, y],
        [0.0577, y + 0.0007],
        [0.0535, y + 0.0007],
      ],
      { at: [0, 0, 0], segments: 24, color: GOLD, bone: base, name: nm },
    );
  pearlsAround(0.0368, 0.0104, 20, 0.0016, base, "standPearls");
  b.lathe(
    [
      [0, 0.0105],
      [0.02, 0.0105],
      [0.0165, 0.0135],
      [0.0115, 0.0165],
      [0.0115, 0.021],
      [0.0165, 0.0245],
      [0.0165, 0.0275],
      [0.0105, 0.031],
      [0.0095, 0.036],
      [0.0145, 0.0405],
      [0.0235, 0.0445],
      [0.0315, 0.0495],
      [0.0345, 0.0525],
      [0.031, 0.0535],
      [0.026, 0.0516],
      [0.012, 0.0507],
      [0, 0.0505],
    ],
    { at: [0, 0, 0], segments: 24, color: GOLD, bone: base, name: "standStem" },
  );
  // enamel inlay on the stem knop
  b.lathe(
    [
      [0.0163, 0.0248],
      [0.0182, 0.0258],
      [0.0182, 0.0268],
      [0.0163, 0.0272],
    ],
    { at: [0, 0, 0], segments: 12, color: "#2a54b3", bone: base, name: "stemInlay" },
  );
  // acanthus leaves cradling the egg
  for (let k = 0; k < 8; k++) {
    const phi = ((k + 0.5) * TAU) / 8;
    const sn = Math.sin(phi);
    const cs = Math.cos(phi);
    const P = (r: number, y: number) => V(r * sn, y, r * cs);
    b.sweep(
      bezier(P(0.017, 0.0455), P(0.046, 0.049), P(0.052, 0.063), P(0.0462, 0.0765)),
      (t: number): [number, number] => [0.0006 + 0.0072 * Math.sin(Math.PI * Math.pow(t, 0.7)), 0.0013],
      { color: GOLD, bone: base, up: V(sn, 0, cs), sides: 6, caps: { start: "flat", end: "point" }, name: `leaf${k}` },
    );
  }
  merged(
    Array.from({ length: 8 }, (_, k) => {
      const phi = (k * TAU) / 8;
      return xf(CAB, V(0.0338 * Math.sin(phi), 0.0527, 0.0338 * Math.cos(phi)), V(0, 1, 0), [0.0018, 0.0013, 0.0018]);
    }),
    RUBY,
    base,
    "dishRubies",
  );
  glow(b.part(new THREE.BoxGeometry(0.0001, 0.0001, 0.0001), RUBY, { bone: base, at: [0, 0.0505, 0], name: "dummy" }), 0);

  // =============================================================================================================
  // EGG SHELLS
  const lowerOutline: [number, number][] = [
    ...ts(0, TC, 9).map((t) => eggAt(t, 0)),
    ...ts(TC, 0.03, 8).map((t) => eggAt(t, TH)),
    [0, TH],
  ];
  const shellLow = b.lathe(lowerOutline, {
    at: [0, EGG_Y, 0],
    segments: 24,
    color: ROSE,
    bone: base,
    name: "eggLower",
  });
  const lidOutline: [number, number][] = [
    ...ts(TC, 1, 10).map((t) => eggAt(t, 0)),
    ...ts(1, TC, 10).map((t) => eggAt(t, TH)),
  ];
  const shellLid = b.lathe(lidOutline, { at: [0, EGG_Y, 0], segments: 24, color: ROSE, bone: lid, name: "eggLid" });

  // silk linings
  b.lathe(
    [
      ...ts(TC, 0.27, 6).map((t) => eggAt(t, TH + 0.0004)),
      ...ts(0.27, TC, 6).map((t) => eggAt(t, TH + 0.0016)),
    ] as [number, number][],
    { at: [0, EGG_Y, 0], segments: 24, color: SILK, bone: base, name: "liningLower" },
  );
  b.lathe(
    [
      ...ts(TC, 1, 8).map((t) => eggAt(t, TH + 0.0004)),
      ...ts(1, TC, 8).map((t) => eggAt(t, TH + 0.0016)),
    ] as [number, number][],
    { at: [0, EGG_Y, 0], segments: 24, color: SILK, bone: lid, name: "liningLid" },
  );

  // gold rim bands, bead rows and diamond studs
  b.lathe(bandProfile(TC - 0.05, TC, 0.0012, TH * 0.5), {
    at: [0, EGG_Y, 0],
    segments: 24,
    color: GOLD,
    bone: base,
    name: "bandLower",
  });
  b.lathe(bandProfile(TC, TC + 0.05, 0.0012, TH * 0.5), {
    at: [0, EGG_Y, 0],
    segments: 24,
    color: GOLD,
    bone: lid,
    name: "bandLid",
  });
  pearlsOnEgg(TC - 0.053, 48, 0.0016, 0.0012, base, "beadsLower");
  pearlsOnEgg(TC + 0.053, 48, 0.0016, 0.0012, lid, "beadsLid");
  for (const [bone, tt, nm] of [
    [base, TC - 0.026, "studsLower"],
    [lid, TC + 0.026, "studsLid"],
  ] as [J, number, string][])
    merged(
      Array.from({ length: 8 }, (_, i) => {
        const phi = ((i + 0.5) * TAU) / 8;
        return xf(DIA, eggWorld(tt, phi, 0.0016), eggNormal(tt, phi), 0.0022);
      }),
      DIAMOND,
      bone,
      nm,
      true,
    );

  // meridian ribs, wire rings, gems
  const rubies: Record<string, THREE.BufferGeometry[]> = { base: [], lid: [] };
  const diams: Record<string, THREE.BufferGeometry[]> = { base: [], lid: [] };
  const ribPath = (t0: number, t1: number, phi: number) =>
    catmull(ts(t0, t1, 8).map((t) => eggWorld(t, phi, 0.0007)));
  const leafFrames: ReturnType<typeof frame>[] = [];
  const leafFramesLid: ReturnType<typeof frame>[] = [];
  for (let k = 0; k < 4; k++) {
    const phi = (45 + 90 * k) * DEG;
    const out = V(Math.sin(phi), 0, Math.cos(phi));
    b.sweep(ribPath(0.075, TC, phi), (): [number, number] => [0.0026, 0.0011], {
      bone: base,
      color: GOLD,
      up: out,
      sides: 6,
      name: `ribLow${k}`,
    });
    b.sweep(ribPath(TC, 0.972, phi), (t: number): [number, number] => [0.0026 - 0.0009 * t, 0.0011], {
      bone: lid,
      color: GOLD,
      up: out,
      sides: 6,
      name: `ribLid${k}`,
    });
    for (const [tt, kind, which] of [
      [0.2, "ruby", "base"],
      [0.34, "dia", "base"],
      [0.68, "dia", "lid"],
      [0.82, "ruby", "lid"],
    ] as [number, string, string][]) {
      const g =
        kind === "ruby"
          ? xf(CAB, eggWorld(tt, phi, 0.0014), eggNormal(tt, phi), [0.0026, 0.0017, 0.0026])
          : xf(DIA, eggWorld(tt, phi, 0.0016), eggNormal(tt, phi), 0.0027);
      (kind === "ruby" ? rubies : diams)[which].push(g);
    }
    for (const tt of ts(0.12, 0.46, 5)) {
      const f = frame(eggWorld(tt, phi, 0.0008), eggNormal(tt, phi));
      leafFrames.push(f, f);
    }
    for (const tt of ts(0.58, 0.94, 5)) {
      const f = frame(eggWorld(tt, phi, 0.0008), eggNormal(tt, phi));
      leafFramesLid.push(f, f);
    }
  }
  // wire rings with stones at the medallion meridians
  for (const [tt, bone, which, nm] of [
    [0.12, base, "base", "ringLow"],
    [0.92, lid, "lid", "ringLid"],
  ] as [number, J, string, string][]) {
    b.sweep(
      catmull(
        ts(0, 24, 24)
          .slice(0, 24)
          .map((i) => eggWorld(tt, (i / 24) * TAU, 0.0008)),
        { closed: true },
      ),
      0.001,
      { bone, color: GOLD, sides: 6, name: nm },
    );
    for (let i = 0; i < 4; i++) {
      const phi = (i * TAU) / 4;
      diams[which].push(xf(DIA, eggWorld(tt, phi, 0.0016), eggNormal(tt, phi), 0.0028));
      const phi2 = phi + TAU / 8;
      rubies[which].push(
        xf(CAB, eggWorld(tt, phi2, 0.0012), eggNormal(tt, phi2), [0.0021, 0.0014, 0.0021]),
      );
    }
  }
  merged(diams.base, DIAMOND, base, "gemsDiamondLow", true);
  merged(diams.lid, DIAMOND, lid, "gemsDiamondLid", true);
  glow(merged(rubies.base, RUBY, base, "gemsRubyLow"), 0.35);
  glow(merged(rubies.lid, RUBY, lid, "gemsRubyLid"), 0.35);
  // enamelled laurel sprigs along the ribs
  const flowAlong = (f: { at: THREE.Vector3 }, i: number): [number, number, number] => {
    const phi = Math.atan2(f.at.x, f.at.z);
    const side = i % 2 === 0 ? 1 : -1;
    return [side * Math.cos(phi), 0.8, -side * Math.sin(phi)];
  };
  b.cards(leafFrames, LEAF, {
    size: [0.0058, 0.0115],
    lean: 78,
    bend: 20,
    flow: flowAlong,
    vary: 0.15,
    rng: rng(11),
    bone: base,
    sink: 0.05,
  });
  b.cards(leafFramesLid, LEAF, {
    size: [0.0058, 0.0115],
    lean: 78,
    bend: 20,
    flow: flowAlong,
    vary: 0.15,
    rng: rng(12),
    bone: lid,
    sink: 0.05,
  });

  // medallions
  const lowTex = [FLORAL, BUTTERFLY, FLORAL, BUTTERFLY];
  const lidTex = [CROWN, FLORAL, CROWN, FLORAL];
  for (let i = 0; i < 4; i++) {
    const phi = (i * TAU) / 4;
    b.decal(shellLow, lowTex[i], {
      at: eggWorld(0.3, phi),
      dir: eggNormal(0.3, phi),
      size: [0.026, 0.0318],
      lift: 0.0006,
      segments: 12,
    });
    b.decal(shellLid, lidTex[i], {
      at: eggWorld(0.74, phi),
      dir: eggNormal(0.74, phi),
      size: [0.026, 0.0318],
      lift: 0.0006,
      segments: 12,
    });
  }

  // =============================================================================================================
  // HINGE AND CLASP
  const cylX = (len: number, r: number, x: number, bone: J, color: string, name: string) =>
    b.part(new THREE.CylinderGeometry(r, r, len, 10), color, { bone, at: [x, HY, HZ], dir: [1, 0, 0], name });
  for (const s of [1, -1]) {
    cylX(0.0075, 0.0028, s * 0.0105, base, GOLD_F, `knuckle${s > 0 ? "L" : "R"}`);
    b.part(new THREE.BoxGeometry(0.0075, 0.0016, 0.0085), GOLD_F, {
      bone: base,
      at: [s * 0.0105, HY - 0.0052, -(RC + 0.0012 + 0.0006)],
      name: `hingePlateLow${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.0019, 8, 6), DIAMOND, {
      bone: base,
      at: [s * 0.0178, HY, HZ],
      name: `pinEnd${s > 0 ? "L" : "R"}`,
      flat: true,
    });
  }
  cylX(0.0116, 0.0028, 0, lid, GOLD_F, "knuckleLid");
  b.part(new THREE.BoxGeometry(0.0115, 0.0016, 0.0085), GOLD_F, {
    bone: lid,
    at: [0, HY + 0.0052, -(RC + 0.0012 + 0.0006)],
    name: "hingePlateLid",
  });
  cylX(0.034, 0.001, 0, base, GOLD_DK, "hingePin");
  // front clasp
  const nF = eggNormal(TC - 0.03, 0);
  b.part(new THREE.BoxGeometry(0.0095, 0.0018, 0.0085), GOLD_F, {
    bone: base,
    at: eggWorld(TC - 0.03, 0, 0.0021),
    dir: nF,
    name: "claspPlate",
  });
  glow(
    b.part(CAB.clone(), RUBY, {
      bone: base,
      at: eggWorld(TC - 0.03, 0, 0.0036),
      dir: nF,
      scale: [0.0029, 0.0019, 0.0029],
      name: "claspRuby",
    }),
    0.4,
  );
  b.part(new THREE.BoxGeometry(0.0065, 0.0018, 0.0075), GOLD_F, {
    bone: lid,
    at: eggWorld(TC + 0.032, 0, 0.0021),
    dir: eggNormal(TC + 0.032, 0),
    name: "claspHook",
  });
  b.spike(eggWorld(TC + 0.012, 0, 0.0028), eggWorld(TC - 0.018, 0, 0.0032), null, 0.0012, {
    color: GOLD_F,
    bone: lid,
    name: "claspClaw",
  });

  // =============================================================================================================
  // FINIAL (lid apex)
  const apexY = EGG_Y + H;
  b.lathe(
    [
      [0, 0],
      [0.0158, 0],
      [0.0128, 0.0018],
      [0.009, 0.003],
      [0.0068, 0.0042],
      [0.009, 0.0058],
      [0.007, 0.0075],
      [0, 0.0075],
    ],
    { at: [0, apexY - 0.0036, 0], segments: 12, color: GOLD, bone: lid, name: "finialCollar" },
  );
  glow(
    b.part(OCT.clone(), SAPPHIRE, {
      bone: lid,
      at: [0, apexY + 0.0066, 0],
      scale: [0.0056, 0.0085, 0.0056],
      name: "finialSapphire",
      flat: true,
    }),
    0.45,
  );
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + TAU / 8;
    const sx = Math.sin(a);
    const cz = Math.cos(a);
    b.spike(V(0.0075 * sx, apexY + 0.003, 0.0075 * cz), V(0.0048 * sx, apexY + 0.0105, 0.0048 * cz), null, 0.0011, {
      color: GOLD_F,
      bone: lid,
      name: `prong${i}`,
    });
  }
  merged(
    Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * TAU;
      return xf(DIA, V(0.0128 * Math.sin(a), apexY - 0.0016, 0.0128 * Math.cos(a)), undefined, 0.0021);
    }),
    DIAMOND,
    lid,
    "finialDiamonds",
    true,
  );
  b.part(PRL.clone(), PEARL, { bone: lid, at: [0, apexY + 0.0148, 0], scale: 0.0021, name: "finialPearl" });

  // =============================================================================================================
  // MECHANISM DRUM, GEARS, SPRING, STAGE
  const dp = ts(0.07, 0.268, 5).map((t) => eggAt(t, TH + 0.0008));
  const drumOutline: [number, number][] = [
    [0, dp[0][1]],
    ...dp.slice(0, -1),
    [dp[dp.length - 1][0], 0.0402],
    [0, 0.0402],
  ];
  b.lathe(drumOutline, { at: [0, EGG_Y, 0], segments: 24, color: GOLD_ENGR, bone: mech, name: "drum" });

  const drive = gearTrain(b, {
    at: V(-0.026, DRUM_TOP + 0.0018, 0),
    axis: [0, 1, 0],
    module: 0.0016,
    style: "flat",
    spin: "cog",
    bone: mech,
    color: [TINT.gilt, TINT.copper, TINT.brass],
    gears: [
      { teeth: 20, spokes: 4 },
      { teeth: 16, from: 0, angle: 135, holes: 4 },
      { teeth: 12, from: 1, angle: 100 },
    ],
  });
  drive.spin(22);

  // spring base plate, spring, stage
  b.lathe(
    [
      [0, 0.005],
      [0.0118, 0.005],
      [0.0128, 0.0058],
      [0.0118, 0.0066],
      [0, 0.0066],
    ],
    { at: [0, DRUM_TOP, 0], segments: 16, color: GOLD, bone: mech, name: "springPlate" },
  );
  b.sweep(coil(V(0, DRUM_TOP + 0.0066, 0), V(0, Y_ST - 0.0045, 0), 0.0085, 6), 0.0007, {
    color: STEEL,
    bone: mech,
    sides: 5,
    name: "spring",
  });
  const A = (x: number, y: number, z: number) => V(x, Y_ST + y, z);
  b.lathe(
    [
      [0, -0.0045],
      [0.0225, -0.0045],
      [0.0262, -0.0028],
      [0.0262, -0.0006],
      [0.0245, 0],
      [0, 0],
    ],
    { at: A(0, 0, 0), segments: 20, color: GOLD, bone: stage, name: "stageDisc" },
  );
  b.lathe(
    [
      [0.0058, -0.0003],
      [0.0225, -0.0003],
      [0.0225, 0.0007],
      [0.0058, 0.0007],
    ],
    { at: A(0, 0, 0), segments: 20, color: BLUE, bone: stage, name: "stageInlay" },
  );
  pearlsAround(0.0237, Y_ST + 0.0009, 18, 0.0009, stage, "stagePearls");

  // =============================================================================================================
  // AUTOMATON: tiny clockwork ballerina
  const spine = b.chain(
    "spineC",
    catmull([A(0, 0.0125, 0), A(0, 0.0215, 0.0003), A(0, 0.031, 0)]),
    { parent: stage, names: ["hips", "spine", "chest"], role: "spine" },
  );
  const hips = spine.joints[0];
  const chest = spine.tip!;
  const neckC = b.chain("neckC", polyline([A(0, 0.031, 0), A(0, 0.0365, 0.0005)]), {
    parent: chest,
    names: ["neck", "head"],
    role: "neck",
  });
  const neck = neckC.joints[0];
  const head = neckC.tip!;

  b.sweep(spine, [0.0078, 0.006, 0.0072], { color: BODICE, sides: 8, name: "torso" });
  b.sweep(neckC, [0.0033, 0.003], { color: PORC, sides: 6, name: "neckTube" });
  b.part(new THREE.TorusGeometry(0.0064, 0.0009, 5, 14), GOLD_F, {
    bone: spine.joints[1],
    at: A(0, 0.0182, 0),
    dir: [0, 1, 0],
    axis: "z",
    name: "waistBelt",
  });
  // clockwork window on the chest
  gearTrain(b, {
    at: A(0.0025, 0.0258, 0.0068),
    axis: [0, 0, 1],
    module: 0.0007,
    style: "flat",
    bone: chest,
    color: [TINT.gilt, TINT.steel],
    gears: [{ teeth: 10 }, { teeth: 8, angle: 60 }],
  });
  // tutu
  const tutu = (rs: number, dy: number, color: string, name: string) => {
    const o = (
      [
        [0, 0.0125],
        [0.009, 0.0128],
        [0.02, 0.0114],
        [0.0232, 0.0104],
        [0.0232, 0.0112],
        [0.02, 0.0125],
        [0.009, 0.0142],
        [0, 0.0142],
      ] as [number, number][]
    ).map(([r, y]) => [r * rs, y + dy] as [number, number]);
    b.lathe(o, { at: A(0, 0, 0), segments: 14, color, bone: hips, name });
  };
  tutu(1, 0, IVORY, "tutuOuter");
  tutu(0.84, 0.0016, "#e8527a", "tutuMid");
  tutu(0.66, 0.003, IVORY, "tutuInner");
  pearlsAround(0.0234, Y_ST + 0.0108, 20, 0.0007, hips, "tutuPearls");

  // legs and slippers
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      catmull([A(s * 0.0042, 0.0135, 0), A(s * 0.0048, 0.0078, 0.0004), A(s * 0.0052, 0.0022, 0)]),
      {
        parent: hips,
        names: [`hip${S}`, `knee${S}`, `ankle${S}`],
        role: "leg",
        contact: A(s * 0.0052, 0, 0.002),
      },
    );
    b.sweep(leg, [0.0017, 0.0012], { color: GOLD_F, sides: 6, name: `legTube${S}` });
    b.part(new THREE.SphereGeometry(1, 8, 6), PINK, {
      bone: leg.tip!,
      at: A(s * 0.0052, 0.0009, 0.0025),
      scale: [0.0028, 0.0017, 0.0052],
      name: `slipper${S}`,
    });
    // arms
    const arm = b.chain(
      `arm${S}`,
      catmull([A(s * 0.0072, 0.0295, 0), A(s * 0.0175, 0.0345, 0.0006), A(s * 0.0265, 0.0425, 0.0016)]),
      {
        parent: chest,
        names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
        role: "arm",
      },
    );
    b.sweep(arm, [0.0022, 0.0014], { color: GOLD_F, sides: 6, name: `armTube${S}` });
    const wrist = arm.tip!;
    b.part(new THREE.SphereGeometry(1, 8, 6), BODICE, {
      bone: arm.joints[0],
      at: A(s * 0.0076, 0.0298, 0),
      scale: 0.0038,
      name: `sleeve${S}`,
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), PORC, {
      bone: wrist,
      at: wrist.at,
      scale: [0.0026, 0.0026, 0.0018],
      name: `hand${S}`,
    });
    const dir = wrist.at.clone().sub(arm.joints[1].at).normalize();
    for (let k = -1; k <= 1; k++) {
      const tip = wrist.at
        .clone()
        .addScaledVector(dir, 0.0062)
        .add(V(0, 0.0007 * k, 0.0017 * k));
      b.spike(wrist.at.clone().addScaledVector(dir, 0.0016), tip, null, 0.0007, {
        color: PORC,
        bone: wrist,
        name: `finger${S}${k + 1}`,
      });
    }
  }

  // head, face, hair, tiara
  const headC = A(0, 0.0462, 0.0006);
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), PORC, {
    bone: head,
    at: headC,
    scale: [0.0105, 0.0112, 0.0102],
    name: "skull",
  });
  b.decal(skull, FACE, {
    at: A(0, 0.045, 0.0105),
    dir: [0, 0, 1],
    size: [0.0158, 0.0158],
    lift: 0.0004,
    segments: 12,
  });
  b.part(new THREE.SphereGeometry(1, 16, 10, 0, TAU, 0, 1.75), HAIR, {
    bone: head,
    at: headC.clone().add(V(0, 0.0008, -0.0012)),
    dir: [0, 0.85, -0.53],
    scale: [0.0113, 0.012, 0.011],
    name: "hairCap",
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), HAIR, {
    bone: head,
    at: A(0, 0.06, -0.0048),
    scale: 0.0048,
    name: "hairBun",
  });
  b.part(new THREE.TorusGeometry(0.0046, 0.0008, 5, 12), GOLD_F, {
    bone: head,
    at: A(0, 0.0592, -0.0046),
    dir: [0, 1, 0.3],
    axis: "z",
    name: "bunBand",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), HAIR, {
      bone: head,
      at: A(s * 0.0098, 0.0432, -0.0035),
      scale: [0.0026, 0.0045, 0.0026],
      name: `ringlet${s > 0 ? "L" : "R"}`,
    });
  }
  const tiaraPts = ts(-75, 75, 6).map((d) => {
    const a = d * DEG;
    const e = 28 * DEG;
    return headC.clone().add(V(0.0124 * Math.cos(e) * Math.sin(a), 0.0124 * Math.sin(e) + 0.0008, 0.0124 * Math.cos(e) * Math.cos(a)));
  });
  b.sweep(catmull(tiaraPts), 0.0006, { color: GOLD_F, bone: head, sides: 5, name: "tiara" });
  merged(
    tiaraPts
      .filter((_, i) => i % 1 === 0)
      .map((p, i) => xf(DIA, p.clone().add(V(0, 0.0007, 0)), undefined, i === 3 ? 0.0016 : 0.0010)),
    DIAMOND,
    head,
    "tiaraGems",
    true,
  );
  merged(
    [1, -1].map((s) => xf(PRL, A(s * 0.0108, 0.0425, 0.0006), undefined, 0.0011)),
    PEARL,
    head,
    "earrings",
  );
  pearlsAround(0.0042, Y_ST + 0.0346, 12, 0.0009, neck, "necklace");

  // wind-up key on the back
  const key = b.joint("key", { parent: chest, at: A(0, 0.0235, -0.0072), dir: [0, 0, -1], role: "hinge" });
  b.rod(A(0, 0.0235, -0.0065), A(0, 0.0235, -0.0125), 0.0007, { color: GOLD_F, bone: key, name: "keyShaft" });
  b.extrude(
    [
      [0, -0.002],
      [0.004, -0.0005],
      [0.0055, 0.002],
      [0.0045, 0.0045],
      [0.002, 0.0052],
      [0, 0.0035],
      [-0.002, 0.0052],
      [-0.0045, 0.0045],
      [-0.0055, 0.002],
      [-0.004, -0.0005],
    ],
    { at: A(0, 0.0215, -0.0125), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.0011, color: GOLD_F, bone: key, name: "keyBow" },
  );

  // =============================================================================================================
  // OPEN THE EGG
  b.pose(lid, { axis: [1, 0, 0], deg: -104 });

  return b.root;
}
```