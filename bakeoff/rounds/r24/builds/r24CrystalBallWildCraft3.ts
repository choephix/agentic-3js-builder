// STYLE: "Delftware", Dutch tin-glazed blue-and-white porcelain. The whole object is one glazed piece:
// milky white glaze with fine crackle and cool pooled shadows, painted only in cobalt-blue washes and
// outlines. The stand is a scaled dragon-claw cabriole with lotus-petal and acanthus-leaf moulding and a
// bead rim. Tile medallions (hand, moon, sun, stars) ring the plinth. The ball is a lit Delft tile wrapped
// round a sphere: an all-seeing eye with rays, swirling clouds, moons and suns, in cobalt on pale sky-blue.
// Nothing leaves the blue/white palette.
import * as THREE from "three";
import { createBuilder, catmull, frame, paint, mix, noise, cells, smoothstep, svg, rng } from "../../../../src/index";
import type { Rgb } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Delft Crystal Ball",
  description:
    "A fortune teller's crystal ball gripped by three scaled dragon claws on a lotus-petal plinth, rendered entirely as blue-and-white Delftware porcelain, with the ball glowing like a lit painted tile.",
};

// ------------------------------------------------------------------------------------------------ palette
const WHITE = "#f4f6f2";
const IVORY = "#f1efe6";
const COB = "#1c3f9a";
const COB_D = "#102868";
const COB_L = "#4d78c6";
const PALE = "#b4cdec";
const WASH = "#d8e6f5";

const D = Math.PI / 180;
const CY = 0.2025; // ball centre height
const BR = 0.1; // ball radius

type V = [number, number, number];
type OP = [number, number] | [number, number, "sharp"];
const R3 = (az: number, r: number, y: number): V => [r * Math.sin(az * D), y, r * Math.cos(az * D)];
const SP = (az: number, el: number, rad: number): V => [
  rad * Math.cos(el * D) * Math.sin(az * D),
  CY + rad * Math.sin(el * D),
  rad * Math.cos(el * D) * Math.cos(az * D),
];
const outDir = (az: number) => new THREE.Vector3(Math.sin(az * D), 0, Math.cos(az * D));
const tanDir = (az: number) => new THREE.Vector3(Math.cos(az * D), 0, -Math.sin(az * D));
const UP = new THREE.Vector3(0, 1, 0);

// ------------------------------------------------------------------------------------------------ glaze paints
const lit = (c: string | Rgb, n: THREE.Vector3): Rgb => {
  const k = smoothstep(-0.75, 0.8, n.y);
  return mix(mix(c, "#8da6d6", 0.34 * (1 - k)), "#ffffff", 0.14 * k);
};

const glazeWhite = (p: THREE.Vector3): Rgb => {
  let c: Rgb = mix(WHITE, "#e4ecf1", noise(p, 0.06, 3));
  const k = cells(p, 0.035, 5);
  const e = k.d2 - k.d1;
  if (e < 0.08) c = mix(c, PALE, 0.35 * (1 - e / 0.08)); // crackle
  return c;
};

const GLAZE = paint((p, n) => lit(glazeWhite(p), n));

const LEG = paint((p, n) => {
  const c = cells(p, 0.016, 11);
  const e = c.d2 - c.d1;
  const wash = smoothstep(0.6, 0.15, c.d1) * (0.2 + 0.6 * c.id);
  let col: Rgb = mix(glazeWhite(p), COB_L, wash * 0.6);
  if (e < 0.12) col = mix(col, COB, smoothstep(0.12, 0.04, e));
  return lit(col, n);
});

const BASE = paint((p, n) => {
  const y = p.y;
  const r = Math.hypot(p.x, p.z);
  const a = Math.atan2(p.x, p.z);
  let c: string | Rgb = glazeWhite(p);
  const wall = Math.abs(n.y) < 0.6;
  if (wall && r > 0.14) {
    if (y < 0.0065 || (y > 0.0125 && y < 0.0145)) c = COB;
    else if (y > 0.0085 && y < 0.0105) c = COB_L;
    else if (y > 0.0385) c = COB;
    else if (y > 0.0345) {
      const f = (a / (Math.PI * 2)) * 36;
      const fr = f - Math.floor(f);
      if (0.0385 - y < 0.0045 * (1 - Math.abs(fr * 2 - 1))) c = COB_L;
    }
  } else if (n.y > 0.5 && y > 0.043 && y < 0.056 && r > 0.09) {
    if (Math.abs(r - 0.1385) < 0.0013) c = COB;
    else if (Math.abs(r - 0.118) < 0.001) c = COB_L;
    else if (Math.abs(r - 0.098) < 0.0012) c = COB;
    else c = mix(glazeWhite(p), PALE, 0.25 * smoothstep(0.1, 0.14, r));
  } else if (r < 0.1 && y > 0.058) {
    if (n.y > 0.5 && y > 0.1) {
      c = mix(PALE, COB_L, smoothstep(0, 0.06, r));
      if (Math.abs(r - 0.038) < 0.0015) c = COB;
    } else if (y > 0.0925 && y < 0.0945) c = COB_L;
    else if (y > 0.1 && y < 0.1035) c = COB_L;
    else if (y > 0.1055) c = COB;
  }
  return lit(c, n);
});

// moulding blades (petals, leaves): painted by their own outline coordinates, walls inked in cobalt
const bladePaint = (thick: THREE.Vector3, len: number) =>
  paint((_p, n, s) => {
    if (Math.abs(n.dot(thick)) < 0.5) return COB;
    const ax = Math.abs(s[0]);
    if (ax < 0.0013) return COB;
    if (ax > 0.0052 && ax < 0.0064 && s[1] > 0.008) return COB_L;
    return lit(mix(PALE, WHITE, smoothstep(0, len, s[1])), n);
  });

// ------------------------------------------------------------------------------------------------ SVG drawings
const fx = (v: number) => v.toFixed(2);
const starPts = (cx: number, cy: number, R: number, r: number, n: number, rot = -90) => {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 ? r : R;
    const a = (rot + (i * 180) / n) * D;
    pts.push(`${fx(cx + rad * Math.cos(a))},${fx(cy + rad * Math.sin(a))}`);
  }
  return pts.join(" ");
};
const spiralD = (cx: number, cy: number, R: number, dir: number) => {
  let d = "";
  const N = 44;
  for (let k = 0; k <= N; k++) {
    const a = dir * k * 0.34;
    const rad = R * (1 - k / (N + 6));
    d += `${k ? "L" : "M"}${fx(cx + rad * Math.cos(a))} ${fx(cy + rad * Math.sin(a))}`;
  }
  return d;
};
const wrap = (draw: (dx: number) => string) => [-400, 0, 400].map(draw).join("");

function ballSvg() {
  const swirls: [number, number, number, number][] = [
    [62, 46, 15, 1], [150, 36, 12, -1], [250, 38, 13, 1], [340, 48, 15, -1],
    [40, 152, 14, -1], [135, 160, 12, 1], [268, 158, 13, -1], [360, 148, 15, 1],
  ];
  const sparks: [number, number, number][] = [
    [120, 66, 9], [282, 70, 9], [124, 138, 8], [280, 134, 8], [20, 70, 8], [385, 120, 8], [330, 40, 7], [75, 112, 7], [214, 28, 6], [190, 174, 6],
  ];
  let rays = "";
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const long = i % 2 === 0;
    rays += `M${fx(200 + ca * 66)} ${fx(100 + sa * 42)}L${fx(200 + ca * (long ? 98 : 82))} ${fx(100 + sa * (long ? 58 : 50))}`;
  }
  let sunRays = "";
  for (let i = 0; i < 14; i++) {
    const a0 = ((i - 0.35) / 14) * Math.PI * 2;
    const a1 = ((i + 0.35) / 14) * Math.PI * 2;
    const am = (i / 14) * Math.PI * 2;
    sunRays += `M${fx(Math.cos(a0) * 24)} ${fx(Math.sin(a0) * 24)}L${fx(Math.cos(am) * 38)} ${fx(Math.sin(am) * 38)}L${fx(Math.cos(a1) * 24)} ${fx(Math.sin(a1) * 24)}Z`;
  }
  let scallops = "";
  for (let i = 0; i < 40; i++) scallops += `M${i * 10} 16a5 5 0 0 0 10 0M${i * 10} 184a5 5 0 0 1 10 0`;
  const sun = (dx: number) => `
    <g transform="translate(${360 + dx} 100)">
      <path d="${sunRays}" fill="${COB_L}" stroke="${COB}" stroke-width="1.6" stroke-linejoin="round"/>
      <circle r="22" fill="#eaf3ff" stroke="${COB_D}" stroke-width="3"/>
      <circle cx="-8" cy="-4" r="3" fill="${COB_D}"/><circle cx="8" cy="-4" r="3" fill="${COB_D}"/>
      <path d="M-8 8 Q0 15 8 8" stroke="${COB_D}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <ellipse cx="-13" cy="5" rx="4" ry="2.4" fill="${COB_L}"/><ellipse cx="13" cy="5" rx="4" ry="2.4" fill="${COB_L}"/>
    </g>`;
  return svg(
    `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#dcecff"/><stop offset="0.5" stop-color="#c3dcf6"/><stop offset="1" stop-color="#9dbfe9"/>
      </linearGradient>
      <clipPath id="alm"><path d="M148 100 Q200 52 252 100 Q200 148 148 100Z"/></clipPath>
      <mask id="mk"><rect width="400" height="200" fill="white"/><circle cx="121" cy="94" r="13" fill="black"/></mask>
      <mask id="mk2"><rect width="400" height="200" fill="white"/><circle cx="62" cy="102" r="13" fill="black"/></mask>
    </defs>
    <rect width="400" height="200" fill="url(#bg)"/>
    <rect y="0" width="400" height="7" fill="${COB}"/><rect y="193" width="400" height="7" fill="${COB}"/>
    <path d="${scallops}" stroke="${COB_L}" stroke-width="2.6" fill="none"/>
    <g stroke="${COB_L}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
      ${swirls.map(([x, y, R, d]) => wrap((dx) => `<path d="${spiralD(x + dx, y, R, d)}"/>`)).join("")}
    </g>
    ${sparks.map(([x, y, R]) => wrap((dx) => `<polygon points="${starPts(x + dx, y, R, R * 0.28, 4)}" fill="${COB}"/>`)).join("")}
    <circle cx="112" cy="100" r="15" fill="${COB}" mask="url(#mk)"/>
    <circle cx="48" cy="102" r="15" fill="${COB}" mask="url(#mk2)"/>
    <circle cx="288" cy="100" r="8" fill="#eaf3ff" stroke="${COB_D}" stroke-width="2.6"/>
    <g stroke="${COB_D}" stroke-width="2.6" stroke-linecap="round">${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => {
        const a = (i / 8) * Math.PI * 2;
        return `<path d="M${fx(288 + Math.cos(a) * 12)} ${fx(100 + Math.sin(a) * 12)}L${fx(288 + Math.cos(a) * 17)} ${fx(100 + Math.sin(a) * 17)}"/>`;
      })
      .join("")}</g>
    ${wrap(sun)}
    <ellipse cx="200" cy="100" rx="104" ry="68" fill="none" stroke="${COB_L}" stroke-width="3" stroke-dasharray="0.1 7" stroke-linecap="round"/>
    <path d="${rays}" stroke="${COB_L}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    <path d="M148 100 Q200 52 252 100 Q200 148 148 100Z" fill="#ffffff"/>
    <g clip-path="url(#alm)">
      <g stroke="${COB_L}" stroke-width="2" opacity="0.8">${[64, 70, 76, 82, 88].map((y) => `<path d="M140 ${y}L260 ${y - 6}"/>`).join("")}</g>
      <circle cx="200" cy="100" r="25" fill="${COB}"/>
      <circle cx="200" cy="100" r="25" fill="none" stroke="${COB_D}" stroke-width="3"/>
      <circle cx="200" cy="100" r="15" fill="${COB_L}"/>
      <circle cx="200" cy="100" r="9" fill="${COB_D}"/>
      <circle cx="191" cy="91" r="5.5" fill="#ffffff"/>
      <circle cx="209" cy="108" r="2.6" fill="#ffffff"/>
    </g>
    <path d="M148 100 Q200 52 252 100 Q200 148 148 100Z" fill="none" stroke="${COB_D}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M152 97 Q200 56 248 97" fill="none" stroke="${COB_D}" stroke-width="7" stroke-linecap="round"/>
    <path d="M160 116 Q200 142 240 116" fill="none" stroke="${COB_L}" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`,
    { size: 1024 },
  );
}

const medallion = (inner: string) =>
  svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#dce8f6" stroke="${COB}" stroke-width="3"/>
      <circle cx="32" cy="32" r="25" fill="none" stroke="${COB_L}" stroke-width="1.4" stroke-dasharray="1.5 3.2" stroke-linecap="round"/>
      ${inner}
    </svg>`,
    { size: 192 },
  );

const MOON = medallion(`
  <defs><mask id="mm"><rect width="64" height="64" fill="white"/><circle cx="38" cy="25" r="15" fill="black"/></mask></defs>
  <circle cx="29" cy="34" r="17" fill="${COB}" mask="url(#mm)"/>
  <polygon points="${starPts(44, 40, 8, 2.6, 4)}" fill="${COB_D}"/>
  <polygon points="${starPts(46, 17, 4.5, 1.5, 4)}" fill="${COB_L}"/>`);
const SUN = medallion(`
  <polygon points="${starPts(32, 32, 22, 13, 14)}" fill="${COB_L}" stroke="${COB}" stroke-width="1.4" stroke-linejoin="round"/>
  <circle cx="32" cy="32" r="11" fill="#ffffff" stroke="${COB_D}" stroke-width="2"/>
  <circle cx="28" cy="30" r="1.6" fill="${COB_D}"/><circle cx="36" cy="30" r="1.6" fill="${COB_D}"/>
  <path d="M27.5 35 Q32 39 36.5 35" stroke="${COB_D}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`);
const HAND = medallion(`
  <g stroke="${COB}" stroke-width="3.6" stroke-linecap="round" fill="none">
    <path d="M21 38 L13 27"/><path d="M26 34 L25 13"/><path d="M32 33 L32 9"/><path d="M38 34 L39 13"/><path d="M43 38 L51 26"/>
  </g>
  <path d="M19 37 Q19 53 32 55 Q45 53 45 37 Q32 31 19 37Z" fill="#ffffff" stroke="${COB}" stroke-width="2"/>
  <path d="M24 44 Q32 37 40 44 Q32 51 24 44Z" fill="#ffffff" stroke="${COB_D}" stroke-width="1.5"/>
  <circle cx="32" cy="44" r="3.2" fill="${COB}"/>`);
const STAR = medallion(`
  <polygon points="${starPts(32, 32, 23, 8, 8)}" fill="${COB}"/>
  <polygon points="${starPts(32, 32, 13, 4.5, 8, -67.5)}" fill="#ffffff"/>
  <circle cx="32" cy="32" r="3" fill="${COB_D}"/>`);
const GLINT = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 42 Q13 20 36 11" stroke="#ffffff" stroke-width="7.5" fill="none" stroke-linecap="round"/>
    <circle cx="14" cy="54" r="3.8" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);
const SPARK = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <polygon points="${starPts(16, 16, 14.5, 3.6, 4)}" fill="#eaf4ff" stroke="${COB}" stroke-width="1.8" stroke-linejoin="round"/>
  </svg>`,
  { size: 96 },
);

// ------------------------------------------------------------------------------------------------ build
export default function build() {
  const b = createBuilder({ name: "delft-crystal-ball" });

  // --- plinth: foot, drum, shoulder, lotus column and cup, turned in one profile
  const PROFILE: OP[] = [
    [0, 0], [0.15, 0], [0.153, 0.005], [0.15, 0.01], [0.15, 0.04], [0.145, 0.044], [0.12, 0.047],
    [0.095, 0.053], [0.075, 0.058], [0.062, 0.07], [0.056, 0.084], [0.058, 0.096], [0.066, 0.104],
    [0.07, 0.108], [0.062, 0.109], [0.045, 0.1045], [0.02, 0.1022], [0, 0.1018],
  ];
  const plinth = b.lathe(PROFILE, { at: [0, 0, 0], axis: [0, 1, 0], segments: 24, color: BASE });

  // moulding rings
  const ringAt = (r: number, y: number, tube: number, color: string) =>
    b.part(new THREE.TorusGeometry(r, tube, 5, 28), color, { at: [0, y, 0], rotation: [90, 0, 0] });
  ringAt(0.1503, 0.0415, 0.004, COB);
  ringAt(0.0755, 0.0585, 0.0042, COB_L);
  ringAt(0.0675, 0.1055, 0.0036, COB);
  ringAt(0.0585, 0.0945, 0.003, COB_D);

  // bead rim on the shoulder, skipping the leg roots
  const LEGS = [60, 180, 300];
  for (let i = 0; i < 32; i++) {
    const az = i * 11.25 + 5;
    const near = LEGS.some((l) => Math.abs((((az - l) % 360) + 540) % 360 - 180 - 0) > 0 && Math.abs((((az - l + 540) % 360) - 180)) < 11);
    if (near) continue;
    b.part(new THREE.SphereGeometry(0.0043, 6, 4), i % 2 ? WHITE : COB_L, { at: R3(az, 0.1415, 0.0478) });
  }

  // lotus petals hugging the column
  for (let i = 0; i < 10; i++) {
    const az = i * 36 + 18;
    const o = outDir(az);
    const xs = tanDir(az);
    const ys = o.clone().multiplyScalar(-0.25).add(UP).normalize();
    const thick = new THREE.Vector3().crossVectors(xs, ys).normalize();
    const petal: OP[] = [
      [-0.0125, 0], [-0.0145, 0.011], [-0.008, 0.026], [0, 0.038, "sharp"], [0.008, 0.026], [0.0145, 0.011], [0.0125, 0],
    ];
    b.extrude(petal, {
      at: R3(az, 0.0735, 0.057), x: xs, y: ys, thickness: [0.008, 0.003], bevel: 0.002, smoothing: 1,
      color: bladePaint(thick, 0.038),
    });
  }

  // tile medallions round the drum
  const medals: [number, ReturnType<typeof svg>, number][] = [
    [0, HAND, 0.025], [120, MOON, 0.025], [240, SUN, 0.025], [60, STAR, 0.019], [180, STAR, 0.019], [300, STAR, 0.019],
  ];
  for (const [az, tex, sz] of medals) {
    b.decal(plinth, tex, { at: R3(az, 0.15, 0.0255), dir: [Math.sin(az * D), 0, Math.cos(az * D)], size: [sz, sz], lift: 0.0015 });
  }

  // --- the ball: a glowing painted tile
  const ball = glow(
    b.part(new THREE.SphereGeometry(BR, 28, 18), "#ffffff", { at: [0, CY, 0], rotation: [0, -90, 0], texture: ballSvg() }),
    0.8,
  );
  const skin = b.surface(ball);
  const g1 = skin.around([0, CY, 0]).at(-34, 38);
  if (g1) glow(b.decal(ball, GLINT, { at: g1, size: [0.05, 0.05], lift: 0.0012 }), 1);

  // --- three scaled dragon claws
  const legR = [0.017, 0.026, 0.021, 0.0145];
  const legRad = (t: number) => {
    const k = t * 3;
    const i = Math.min(Math.floor(k), 2);
    return legR[i] + (legR[i + 1] - legR[i]) * (k - i);
  };
  for (const phi of LEGS) {
    const o = outDir(phi);
    const t = tanDir(phi);
    const wrist = SP(phi, -34, 0.127);
    const path = catmull([R3(phi, 0.128, 0.044), R3(phi, 0.168, 0.075), R3(phi, 0.152, 0.108), wrist]);
    b.sweep(path, legR, { color: LEG, sides: 10 });

    // clawfoot pad and knuckle
    b.part(new THREE.SphereGeometry(0.025, 10, 8), LEG, { at: R3(phi, 0.134, 0.046), scale: [1, 0.55, 1] });
    b.part(new THREE.SphereGeometry(0.02, 10, 8), LEG, { at: wrist });

    // cobalt bands round the leg
    for (const tt of [0.24, 0.58, 0.88]) {
      b.part(new THREE.TorusGeometry(legRad(tt) + 0.0015, 0.0042, 5, 12), COB, {
        at: path.at(tt), dir: path.tangentAt(tt), axis: "z",
      });
    }

    // acanthus leaves on the outer knee: one big, two small
    for (const [dl, sc] of [[0, 1], [-15, 0.7], [15, 0.7]] as [number, number][]) {
      const az = phi + dl;
      const oo = outDir(az);
      const xs = tanDir(az);
      const ys = oo.clone().multiplyScalar(0.62).addScaledVector(UP, 0.78).normalize();
      const thick = new THREE.Vector3().crossVectors(xs, ys).normalize();
      const leaf: OP[] = [
        [-0.022, 0], [-0.03, 0.014], [-0.02, 0.028], [-0.008, 0.03], [0, 0.046, "sharp"], [0.008, 0.03], [0.02, 0.028], [0.03, 0.014], [0.022, 0],
      ].map(([x, y]) => [x * sc, y * sc] as OP);
      leaf[4] = [0, 0.046 * sc, "sharp"];
      b.extrude(leaf, {
        at: R3(az, dl === 0 ? 0.162 : 0.158, 0.046), x: xs, y: ys, thickness: [0.009, 0.003], bevel: 0.0025, smoothing: 1,
        color: bladePaint(thick, 0.046 * sc),
      });
    }

    // dew claws at the wrist
    for (const sg of [-1, 1]) {
      const dir = o.clone().multiplyScalar(0.35).addScaledVector(t, sg * 0.75).addScaledVector(UP, -0.5).normalize();
      const base = new THREE.Vector3(...wrist).addScaledVector(t, sg * 0.012);
      b.spike(base, dir, 0.034, 0.0085, { color: IVORY, sides: 6 });
    }

    // three talons hugging the ball
    [-16, 0, 16].forEach((dl) => {
      const pp = (
        [[-32, 0.124], [-16, 0.1115], [0, 0.1065], [16, 0.1035]] as [number, number][]
      ).map(([el, rad], k) => SP(phi + dl * (0.5 + 0.35 * k), el, rad));
      b.sweep(catmull(pp), [0.0115, 0], {
        color: (tt: number) => (tt < 0.12 ? COB_D : tt > 0.68 ? IVORY : COB),
        sides: 6,
        caps: "point",
      });
      b.part(new THREE.SphereGeometry(0.0125, 8, 6), COB_L, { at: pp[0] });
    });
  }

  // --- vision sparkles drifting round the ball
  const spots: [number, number, number][] = [
    [-28, 36, 0.155], [24, 52, 0.15], [42, -18, 0.168], [-42, -14, 0.168], [-8, 66, 0.14], [100, 20, 0.15], [-100, 28, 0.15],
  ];
  const sparkFrames = spots.map(([az, el, rad]) => {
    const p = SP(az, el, rad);
    return frame([p[0], p[1] - 0.015, p[2]], [0, 1, 0]);
  });
  glow(b.cards(sparkFrames, SPARK, { size: 0.03, cross: true, vary: 0.25, rng: rng(5), sink: 0 }), 1);

  return b.root;
}
