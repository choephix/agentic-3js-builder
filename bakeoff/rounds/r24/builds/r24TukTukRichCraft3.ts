import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { arc, catmull, createBuilder, frame, mix, noise, paint, rng, smoothstep, svg } from "../../../../src/index";
import type { Fill, Joint, Part } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Truck-Art Auto Rickshaw",
  description:
    "A three-wheeled auto rickshaw dressed in Indian truck art: peacock side panels, a scalloped crown on the roof, tassel fringes, marigold garlands, glowing fairy lights, a brass horn, a lemon-and-chilli charm and a HORN OK PLEASE tail board.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const INK = "#1b1020";
const C = {
  yellow: "#ffc928",
  green: "#0fa35a",
  deepGreen: "#0b6b42",
  red: "#d8202b",
  crimson: "#a50f2c",
  orange: "#ff7a12",
  marigold: "#ffb01a",
  pink: "#ec3f93",
  blue: "#1565c9",
  turq: "#14b5b0",
  black: "#16121a",
  chrome: "#d5dbe3",
  steel: "#8d95a3",
  gold: "#f0b823",
  brass: "#c98f1e",
  white: "#fff6e0",
  rubber: "#25222b",
  tread: "#121016",
  mirror: "#b9dff0",
  lamp: "#fff2a8",
  amber: "#ffa21a",
  tail: "#ff2a2a",
  leaf: "#2d8a3a",
  lemon: "#f5e63a",
  chilli: "#1e9a2e",
  dark: "#2a2030",
  khaki: "#c9a96a",
};

// ---------------------------------------------------------------------------------------------------------------
// SVG drawing pieces

const flower = (cx: number, cy: number, r: number, n: number, c1: string, c2: string, c3: string) => {
  const sw = Math.max(0.7, r * 0.05).toFixed(2);
  let s = "";
  for (let i = 0; i < n; i++)
    s += `<ellipse cx="${cx}" cy="${(cy - r * 0.62).toFixed(2)}" rx="${(r * 0.26).toFixed(2)}" ry="${(r * 0.42).toFixed(2)}" fill="${i % 2 ? c1 : c2}" stroke="${INK}" stroke-width="${sw}" transform="rotate(${((360 / n) * i).toFixed(1)} ${cx} ${cy})"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.36).toFixed(2)}" fill="${c3}" stroke="${INK}" stroke-width="${sw}"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.16).toFixed(2)}" fill="${c1}" stroke="${INK}" stroke-width="${(r * 0.03 + 0.4).toFixed(2)}"/>`;
  return s;
};

const peacock = (cx: number, cy: number, sc: number) => {
  let f = "";
  for (let i = 0; i < 9; i++) {
    const a = -86 + i * 11;
    f += `<g transform="rotate(${a} -6 -6)">
      <ellipse cx="-6" cy="-40" rx="8" ry="25" fill="${i % 2 ? "#0a9f6e" : "#1f6fd0"}" stroke="${INK}" stroke-width="1.5"/>
      <ellipse cx="-6" cy="-52" rx="5.4" ry="6.6" fill="#f2c200" stroke="${INK}" stroke-width="1"/>
      <ellipse cx="-6" cy="-52" rx="3.5" ry="4.5" fill="#1155c8"/>
      <ellipse cx="-6" cy="-52" rx="1.6" ry="2.4" fill="#0a1f4a"/></g>`;
  }
  return `<g transform="translate(${cx} ${cy}) scale(${sc})">${f}
    <path d="M10 -8 Q30 -12 27 -34 L35 -34 Q41 -8 24 2 Z" fill="#1156c9" stroke="${INK}" stroke-width="1.5"/>
    <ellipse cx="6" cy="-5" rx="23" ry="12" fill="#0aa3a3" stroke="${INK}" stroke-width="1.6"/>
    <path d="M-10 -4 Q4 4 18 -4" fill="none" stroke="#7ff0d0" stroke-width="1.6"/>
    <circle cx="31" cy="-38" r="6" fill="#1156c9" stroke="${INK}" stroke-width="1.5"/>
    <path d="M36 -40 L46 -36 L36 -34Z" fill="#ffc928" stroke="${INK}" stroke-width="1"/>
    <circle cx="32.5" cy="-39" r="1.6" fill="#fff"/><circle cx="33" cy="-39" r="0.8" fill="${INK}"/>
    <path d="M28 -43 L25 -52 M31 -44 L31 -54 M34 -43 L37 -51" stroke="${INK}" stroke-width="1.3" fill="none"/>
    <circle cx="25" cy="-53" r="1.8" fill="#ec3f93"/><circle cx="31" cy="-55" r="1.8" fill="#ec3f93"/><circle cx="37" cy="-52" r="1.8" fill="#ec3f93"/>
    <path d="M2 6 L0 20 M12 6 L14 20" stroke="#ff7a12" stroke-width="2.2" fill="none"/></g>`;
};

function mandalaSvg() {
  let s = `<circle cx="50" cy="50" r="49" fill="#d8202b" stroke="${INK}" stroke-width="2"/>`;
  for (let i = 0; i < 24; i++) {
    const a = (i * 15 * Math.PI) / 180;
    s += `<circle cx="${(50 + 43 * Math.sin(a)).toFixed(2)}" cy="${(50 - 43 * Math.cos(a)).toFixed(2)}" r="2.7" fill="${i % 2 ? "#fff6e0" : "#ffd23a"}" stroke="${INK}" stroke-width="0.6"/>`;
  }
  s += `<circle cx="50" cy="50" r="38" fill="#ffd23a" stroke="${INK}" stroke-width="1.2"/>`;
  s += flower(50, 50, 37, 12, "#14b5b0", "#ec3f93", "#0fa35a");
  s += flower(50, 50, 20, 8, "#ff7a12", "#fff6e0", "#d8202b");
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}

function sideSvg() {
  let scal = "";
  for (let i = 0; i < 17; i++) {
    const x = (12 + i * 9.6).toFixed(1);
    const c = i % 2 ? "#fff6e0" : "#ff7a12";
    scal += `<circle cx="${x}" cy="8" r="4.2" fill="${c}" stroke="${INK}" stroke-width="0.8"/><circle cx="${x}" cy="92" r="4.2" fill="${c}" stroke="${INK}" stroke-width="0.8"/>`;
  }
  const leaves = [20, 160]
    .map(
      (x) =>
        `<ellipse cx="${x - 14}" cy="72" rx="16" ry="5" fill="#0a7a3a" stroke="${INK}" stroke-width="1" transform="rotate(-25 ${x - 14} 72)"/><ellipse cx="${x + 14}" cy="72" rx="16" ry="5" fill="#0a7a3a" stroke="${INK}" stroke-width="1" transform="rotate(25 ${x + 14} 72)"/>`,
    )
    .join("");
  return `<svg viewBox="0 0 180 100" xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id="lat" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill="#17a974"/>
      <path d="M0 5L5 0L10 5L5 10Z" fill="#0f8a5c" stroke="#ffd23a" stroke-width="0.7"/>
      <circle cx="5" cy="5" r="1.2" fill="#ffd23a"/></pattern></defs>
    <rect width="180" height="100" rx="6" fill="#d8202b"/>
    <rect x="4" y="4" width="172" height="92" rx="4" fill="#ffd23a" stroke="${INK}" stroke-width="1.2"/>
    <rect x="8" y="8" width="164" height="84" rx="3" fill="url(#lat)" stroke="${INK}" stroke-width="1.2"/>
    ${scal}${leaves}
    ${flower(22, 52, 17, 10, "#ec3f93", "#ff7a12", "#ffd23a")}
    ${flower(158, 52, 17, 10, "#ec3f93", "#ff7a12", "#ffd23a")}
    ${flower(24, 22, 8, 8, "#14b5b0", "#fff6e0", "#d8202b")}${flower(156, 22, 8, 8, "#14b5b0", "#fff6e0", "#d8202b")}
    ${flower(24, 82, 8, 8, "#14b5b0", "#fff6e0", "#d8202b")}${flower(156, 82, 8, 8, "#14b5b0", "#fff6e0", "#d8202b")}
    ${flower(52, 28, 7, 6, "#fff6e0", "#d8202b", "#ffd23a")}${flower(128, 28, 7, 6, "#fff6e0", "#d8202b", "#ffd23a")}
    ${peacock(90, 88, 0.88)}
  </svg>`;
}

function backSvg() {
  return `<svg viewBox="0 0 240 75" xmlns="http://www.w3.org/2000/svg">
    <rect width="240" height="75" rx="5" fill="#d8202b"/>
    <rect x="3" y="3" width="234" height="69" rx="4" fill="#ffd23a" stroke="${INK}" stroke-width="1.4"/>
    <rect x="7" y="7" width="226" height="61" rx="3" fill="#0f8f58" stroke="${INK}" stroke-width="1.2"/>
    <text x="120" y="39" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-weight="900" font-size="26" textLength="168" lengthAdjust="spacingAndGlyphs" fill="#ffd23a" stroke="${INK}" stroke-width="3.4" paint-order="stroke">HORN OK PLEASE</text>
    <text x="120" y="60" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="8.6" textLength="150" lengthAdjust="spacingAndGlyphs" fill="#fff6e0" stroke="${INK}" stroke-width="1.6" paint-order="stroke">BURI NAZAR WALE TERA MUNH KALA</text>
    ${flower(22, 38, 13, 10, "#ec3f93", "#ff7a12", "#ffd23a")}${flower(218, 38, 13, 10, "#ec3f93", "#ff7a12", "#ffd23a")}
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `<circle cx="${50 + i * 12.8}" cy="13" r="2.4" fill="${i % 2 ? "#fff6e0" : "#ff7a12"}"/>`).join("")}
  </svg>`;
}

function bannerSvg() {
  return `<svg viewBox="0 0 260 28" xmlns="http://www.w3.org/2000/svg">
    <rect width="260" height="28" rx="3" fill="#a50f2c"/>
    <rect x="2" y="2" width="256" height="24" rx="2" fill="#d8202b" stroke="#ffd23a" stroke-width="2"/>
    <text x="130" y="19" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-weight="900" font-size="15" textLength="176" lengthAdjust="spacingAndGlyphs" fill="#ffd23a" stroke="${INK}" stroke-width="2.4" paint-order="stroke">JAI MATA DI * MERA BHARAT MAHAN</text>
    ${flower(22, 14, 9, 8, "#fff6e0", "#14b5b0", "#ffd23a")}${flower(238, 14, 9, 8, "#fff6e0", "#14b5b0", "#ffd23a")}
  </svg>`;
}

function canvasSvg() {
  let dots = "";
  for (let i = 0; i < 14; i++)
    dots += `<circle cx="${8 + i * 8.5}" cy="7" r="1.8" fill="${i % 2 ? "#ffd23a" : "#ff7a12"}"/><circle cx="${8 + i * 8.5}" cy="63" r="1.8" fill="${i % 2 ? "#ffd23a" : "#ff7a12"}"/>`;
  return `<svg viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" d="M0 0H120V70H0Z M24 17H96Q103 17 103 24V46Q103 53 96 53H24Q17 53 17 46V24Q17 17 24 17Z" fill="#0d6b44"/>
    <rect x="3" y="3" width="114" height="64" rx="3" fill="none" stroke="#d8202b" stroke-width="3"/>
    <rect x="14.5" y="14.5" width="91" height="41" rx="9" fill="none" stroke="#ffd23a" stroke-width="2.4"/>
    ${dots}
    ${flower(9, 35, 5.5, 8, "#ec3f93", "#ffd23a", "#d8202b")}${flower(111, 35, 5.5, 8, "#ec3f93", "#ffd23a", "#d8202b")}
  </svg>`;
}

function tasselSvg() {
  // drawn root-at-bottom: a hanging card shows its drawing's bottom edge at the attachment point
  let strands = "";
  for (let i = 0; i < 6; i++) strands += `<path d="M${12 + i * 3.2} 62 L${6 + i * 5.6} 12" stroke="#ff6a4a" stroke-width="1.1" fill="none"/>`;
  return `<svg viewBox="0 0 40 110" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 110 L20 94" stroke="${INK}" stroke-width="2.4"/>
    <circle cx="20" cy="90" r="4.2" fill="#f0b823" stroke="${INK}" stroke-width="1.4"/>
    <circle cx="20" cy="79" r="8" fill="#d8202b" stroke="${INK}" stroke-width="1.6"/>
    <rect x="13" y="68" width="14" height="5" rx="1" fill="#f0b823" stroke="${INK}" stroke-width="1.2"/>
    <path d="M12 73 L4 12 Q20 3 36 12 L28 73Z" fill="#a50f2c" stroke="${INK}" stroke-width="1.6"/>
    ${strands}
    <rect x="6" y="50" width="28" height="5" fill="#ffd23a" stroke="${INK}" stroke-width="1"/>
    <rect x="4.5" y="18" width="31" height="5" fill="#14b5b0" stroke="${INK}" stroke-width="1"/>
    <rect x="3" y="6" width="34" height="5" fill="#ffd23a" stroke="${INK}" stroke-width="1"/>
  </svg>`;
}

function strandSvg() {
  let s = `<path d="M10 120 L10 14" stroke="${INK}" stroke-width="1.6"/>`;
  for (let i = 0; i < 9; i++) {
    const y = 110 - i * 10.5;
    s += `<circle cx="10" cy="${y}" r="5.6" fill="${i % 2 ? "#ffb01a" : "#ff7a12"}" stroke="${INK}" stroke-width="0.9"/><circle cx="10" cy="${y}" r="2.4" fill="${i % 2 ? "#ffe27a" : "#ffc04a"}"/>`;
  }
  s += `<path d="M5 14 L15 14 L13 2 L7 2Z" fill="#d8202b" stroke="${INK}" stroke-width="1"/>`;
  return `<svg viewBox="0 0 20 120" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}

function trimSvg() {
  let s = `<rect width="200" height="10" fill="#ffd23a"/>`;
  for (let k = 0; k < 25; k++) {
    const x = k * 8;
    s += `<path d="M${x} 10 L${x + 4} 1 L${x + 8} 10Z" fill="${["#d8202b", "#0fa35a", "#fff6e0", "#ec3f93"][k % 4]}" stroke="${INK}" stroke-width="0.5"/>`;
  }
  return `<svg viewBox="0 0 200 10" xmlns="http://www.w3.org/2000/svg">${s}<rect width="200" height="10" fill="none" stroke="${INK}" stroke-width="1"/></svg>`;
}

function tapeSvg() {
  let s = `<rect width="120" height="12" fill="#d8202b"/>`;
  for (let k = 0; k < 6; k++) s += `<path d="M${k * 20} 12 L${k * 20 + 6} 0 L${k * 20 + 16} 0 L${k * 20 + 10} 12Z" fill="#fff6e0"/>`;
  return `<svg viewBox="0 0 120 12" xmlns="http://www.w3.org/2000/svg">${s}<rect width="120" height="12" fill="none" stroke="${INK}" stroke-width="1.6"/></svg>`;
}

function glassSvg() {
  return `<svg viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="7" fill="#2f8fc9"/>
    <path d="M18 7 L36 7 L16 50 L0 50Z" fill="#d9f4fb"/><path d="M44 7 L52 7 L32 50 L24 50Z" fill="#d9f4fb"/>
    <path d="M84 7 L102 7 L82 50 L66 50Z" fill="#d9f4fb"/><path d="M110 7 L116 7 L98 50 L92 50Z" fill="#d9f4fb"/>
    <ellipse cx="104" cy="41" rx="11" ry="5.5" fill="#ff7a12" stroke="${INK}" stroke-width="1"/>
    <text x="104" y="43.4" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="6.4" fill="#fff6e0">OK TATA</text>
  </svg>`;
}

function plateSvg() {
  return `<svg viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="30" rx="3" fill="#ffd23a" stroke="${INK}" stroke-width="2.4"/>
    <rect x="5" y="5" width="9" height="20" fill="#1a3a9a"/><circle cx="9.5" cy="12" r="2.6" fill="#fff6e0"/>
    <text x="57" y="22.5" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="17" textLength="76" lengthAdjust="spacingAndGlyphs" fill="${INK}">MH 01 TA 4242</text>
  </svg>`;
}

function flagSvg() {
  let sp = "";
  for (let i = 0; i < 12; i++) sp += `<line x1="45" y1="30" x2="45" y2="21.6" stroke="#1a2a8a" stroke-width="0.7" transform="rotate(${i * 30} 45 30)"/>`;
  return `<svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg">
    <rect width="90" height="20" fill="#ff9933"/><rect y="20" width="90" height="20" fill="#fffdf4"/><rect y="40" width="90" height="20" fill="#138808"/>
    <circle cx="45" cy="30" r="8.4" fill="none" stroke="#1a2a8a" stroke-width="1.2"/>${sp}
  </svg>`;
}

// ---------------------------------------------------------------------------------------------------------------
// Paints

const shade = (base: string, n: THREE.Vector3) =>
  mix(mix(base, "#26103a", 0.3), mix(base, "#fffbe8", 0.14), smoothstep(-0.7, 0.8, n.y));

const lit = (hex: string) =>
  paint((p, n) => {
    const c = shade(hex, n);
    return mix(c, "#6b4a2a", 0.55 * smoothstep(0.36, 0.0, p.y) * (0.5 + 0.5 * noise(p, 0.12, 3)));
  });

const cowlPaint = paint((p, n) => {
  let base = C.green;
  if (Math.abs(p.y - 0.48) < 0.022) base = C.red;
  else if (Math.abs(p.y - 0.515) < 0.009) base = C.yellow;
  else if (Math.abs(p.y - 0.425) < 0.009) base = C.yellow;
  const c = shade(base, n);
  return mix(c, "#6b4a2a", 0.5 * smoothstep(0.42, 0.28, p.y) * (0.5 + 0.5 * noise(p, 0.1, 5)));
});

const roofPaint = paint((p, n) => {
  if (n.y < -0.35) return shade(C.marigold, n);
  const ax = Math.abs(p.x);
  let base = C.deepGreen;
  if (ax < 0.05) base = C.gold;
  else if (ax > 0.25 && ax < 0.31) base = C.red;
  else if (ax > 0.52 && ax < 0.57) base = C.yellow;
  else if (ax > 0.64) base = C.red;
  return mix(shade(base, n), "#fff4c8", 0.12 * smoothstep(0.5, 1, n.y) * noise(p, 0.08, 2));
});

const quilt = (hex: string, line: string) =>
  paint((p, n) => {
    const [u, v] = Math.abs(n.y) > 0.6 ? [p.x, p.z] : Math.abs(n.z) > 0.6 ? [p.x, p.y] : [p.z, p.y];
    const a = (u + v) / 0.09;
    const c = (u - v) / 0.09;
    const fa = Math.abs(a - Math.round(a));
    const fc = Math.abs(c - Math.round(c));
    if (fa < 0.06 || fc < 0.06) return line;
    if (fa > 0.44 && fc > 0.44) return line;
    return mix(mix(hex, "#14060a", 0.25), mix(hex, "#ffd6c0", 0.14), fa + fc);
  });

const banded = (a: string, c: string, k: number) =>
  paint((_p, n, s) => shade(Math.floor(s[0] * k) % 2 ? a : c, n));

const curtainPaint = paint((p, n) => shade(Math.floor((p.z + 5) / 0.09) % 2 ? C.khaki : C.orange, n));

const P = {
  yellow: lit(C.yellow),
  green: lit(C.green),
  red: lit(C.red),
  dark: lit(C.dark),
  seat: quilt("#a8142a", "#ffd23a"),
  driverSeat: quilt("#1d1722", "#ff7a12"),
  fenderF: banded(C.green, C.yellow, 16),
  fenderR: banded(C.red, C.yellow, 16),
};

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "truckArtRickshaw", paintSize: 2048 });
  const rnd = rng(11);

  const T = {
    side: svg(sideSvg(), { size: 1024 }),
    back: svg(backSvg(), { size: 1024 }),
    banner: svg(bannerSvg(), { size: 1024 }),
    canvas: svg(canvasSvg(), { size: 768 }),
    mandala: svg(mandalaSvg(), { size: 512 }),
    tassel: svg(tasselSvg(), { size: 256 }),
    strand: svg(strandSvg(), { size: 384 }),
    trim: svg(trimSvg(), { size: 1024 }),
    tape: svg(tapeSvg(), { size: 512 }),
    glass: svg(glassSvg(), { size: 768 }),
    plate: svg(plateSvg(), { size: 384 }),
    flag: svg(flagSvg(), { size: 256 }),
  };

  // ---- skeleton
  const chassis = b.joint("chassis", { at: [0, 0.3, 0] });
  const steer = b.joint("steer", { parent: chassis, at: [0, 0.62, 1.0], aim: [0, 0.275, 1.28] });
  const wheelF = b.joint("wheelF", { parent: steer, at: [0, 0.275, 1.28], dir: [1, 0, 0] });
  const wheelL = b.joint("wheelL", { parent: chassis, at: [0.69, 0.275, -0.72], dir: [1, 0, 0] });
  const wheelR = b.joint("wheelR", { parent: chassis, at: [-0.69, 0.275, -0.72], dir: [1, 0, 0] });

  // ---- helpers
  const put = (
    geo: THREE.BufferGeometry,
    color: Fill,
    at: number[],
    o: { bone?: Joint; dir?: number[]; axis?: "x" | "y" | "z"; up?: number[]; texture?: THREE.Texture; flat?: boolean } = {},
  ) => b.part(geo, color, { ...o, flat: o.flat ?? true, bone: o.bone ?? chassis, at });

  const rod = (a: number[], c: number[], r: number, color: Fill, bone: Joint = chassis, sides = 8) =>
    b.rod(a, c, r, color, { bone, sides });

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r1: number, r2: number, h: number, seg = 10) => new THREE.CylinderGeometry(r1, r2, h, seg);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  const makeBag = (bone: Joint) => {
    const m = new Map<string, THREE.BufferGeometry[]>();
    return {
      add(color: string, g: THREE.BufferGeometry) {
        const l = m.get(color);
        if (l) l.push(g);
        else m.set(color, [g]);
      },
      flush(): Part[] {
        const out: Part[] = [];
        for (const [color, list] of m)
          out.push(b.part(mergeGeometries(list, false)!, color, { bone, at: [0, 0, 0], flat: true }));
        m.clear();
        return out;
      },
    };
  };

  const ball = (r: number, x: number, y: number, z: number, sy = 1, w = 6, h = 4) => {
    const g = new THREE.SphereGeometry(r, w, h);
    g.scale(1, sy, 1);
    g.translate(x, y, z);
    return g;
  };

  const swag = (a: number[], c: number[], sag: number, n: number) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      pts.push(
        new THREE.Vector3(
          a[0] + (c[0] - a[0]) * t,
          a[1] + (c[1] - a[1]) * t - sag * 4 * t * (1 - t),
          a[2] + (c[2] - a[2]) * t,
        ),
      );
    }
    return pts;
  };

  const hang = (pts: number[][], tex: THREE.Texture[], size: [number, number], seed: number, bone: Joint = chassis) =>
    b.cards(
      pts.map((p) => frame(p, [0, 1, 0])),
      tex,
      { size, lean: 180, flow: [0, 0, 1], cross: true, vary: 0.2, spin: 6, rng: rng(seed), sink: 0, bone },
    );

  // =============================================================================================================
  // Chassis, floor, axle, exhaust
  put(box(0.4, 0.1, 1.9), C.dark, [0, 0.26, 0.0]);
  put(box(1.24, 0.06, 1.7), P.dark, [0, 0.33, -0.25]);
  rod([-0.69, 0.272, -0.72], [0.69, 0.272, -0.72], 0.035, C.steel);
  put(cyl(0.05, 0.05, 0.38, 10), C.chrome, [-0.42, 0.2, -1.02], { dir: [0, 0, 1] });
  put(sph(0.05, 8, 5), C.chrome, [-0.42, 0.2, -1.22]);
  b.sweep(catmull([[-0.42, 0.24, -0.7], [-0.42, 0.2, -0.85], [-0.42, 0.2, -0.95]]), 0.02, {
    color: C.steel, bone: chassis, sides: 6,
  });

  // =============================================================================================================
  // Wheels
  function wheel(bone: Joint, cx: number, cz: number, faces: number[]) {
    const cy = 0.272;
    put(new THREE.TorusGeometry(0.2, 0.075, 8, 20), C.rubber, [cx, cy, cz], { bone, dir: [1, 0, 0], axis: "z" });
    const treads: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 22; i++) {
      const g = new THREE.BoxGeometry(0.09, 0.03, 0.05);
      g.translate(0, 0.268, 0);
      g.rotateX((i / 22) * Math.PI * 2);
      g.translate(cx, cy, cz);
      treads.push(g);
    }
    put(mergeGeometries(treads, false)!, C.tread, [0, 0, 0], { bone });
    put(cyl(0.2, 0.2, 0.11, 12), P.red, [cx, cy, cz], { bone, dir: [1, 0, 0] });
    for (const s of faces) {
      put(new THREE.CircleGeometry(0.14, 16), "#ffffff", [cx + s * 0.0585, cy, cz], {
        bone, dir: [s, 0, 0], axis: "z", texture: T.mandala,
      });
      put(new THREE.SphereGeometry(0.035, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), C.gold, [cx + s * 0.0575, cy, cz], {
        bone, dir: [s, 0, 0],
      });
    }
  }
  wheel(wheelF, 0, 1.28, [1, -1]);
  wheel(wheelL, 0.69, -0.72, [1]);
  wheel(wheelR, -0.69, -0.72, [-1]);

  // Fenders (arc sweeps over each wheel) with gold rails and studs
  function fender(bone: Joint, cx: number, cz: number, hw: number, fill: Fill) {
    const cy = 0.275;
    const start = [cx, cy - 0.1, cz + 0.33];
    b.sweep(arc([cx, cy, cz], start, [1, 0, 0], -200), () => [hw, 0.016], {
      section: "box", color: fill, caps: "flat", bone,
    });
    for (const s of [1, -1])
      b.sweep(arc([cx + s * hw, cy, cz], [cx + s * hw, cy - 0.1, cz + 0.33], [1, 0, 0], -200), 0.013, {
        color: C.gold, bone, sides: 6,
      });
    const bag = makeBag(bone);
    const phi0 = Math.atan2(-0.1, 0.33);
    for (let i = 0; i < 12; i++) {
      const phi = phi0 + ((i + 0.5) / 12) * (200 * Math.PI) / 180;
      const rr = 0.345 + 0.026;
      bag.add(C.gold, ball(0.018, cx, cy + rr * Math.sin(phi), cz + rr * Math.cos(phi), 1, 6, 4));
    }
    bag.flush();
  }
  fender(steer, 0, 1.28, 0.11, P.fenderF);
  fender(chassis, 0.69, -0.72, 0.1, P.fenderR);
  fender(chassis, -0.69, -0.72, 0.1, P.fenderR);

  // Front fork, steering column, handlebar
  for (const s of [1, -1]) rod([s * 0.12, 0.62, 1.02], [s * 0.12, 0.275, 1.28], 0.024, C.chrome, steer);
  rod([-0.12, 0.62, 1.02], [0.12, 0.62, 1.02], 0.026, C.steel, steer);
  rod([0, 0.62, 1.0], [0, 1.02, 0.22], 0.03, C.steel, steer);
  b.sweep(
    catmull([[-0.44, 1.01, 0.08], [-0.26, 1.04, 0.19], [0, 1.05, 0.22], [0.26, 1.04, 0.19], [0.44, 1.01, 0.08]]),
    0.016,
    { color: C.chrome, bone: steer, sides: 8 },
  );
  for (const s of [1, -1]) {
    rod([s * 0.44, 1.01, 0.08], [s * 0.5, 1.0, -0.02], 0.026, C.black, steer);
    rod([s * 0.36, 1.03, 0.14], [s * 0.3, 1.1, 0.2], 0.008, C.chrome, steer, 5);
  }
  put(cyl(0.05, 0.05, 0.03, 12), C.chrome, [0, 1.06, 0.2], { bone: steer, dir: [0, 0.4, -1] });
  put(new THREE.CircleGeometry(0.044, 14), C.white, [0, 1.06, 0.2], { bone: steer, dir: [0, 0.4, -1], axis: "z" });

  // Front fender tassels
  hang([[-0.09, 0.19, 1.6], [0, 0.18, 1.62], [0.09, 0.19, 1.6]], [T.tassel], [0.05, 0.14], 5, steer);

  // =============================================================================================================
  // Cowl and nose
  const cowl = b.frustumBox([0, 0.62, 0.3], [0, 0.62, 0.9], [1.22, 0.62], [0.5, 0.58], {
    color: cowlPaint, bone: chassis,
  });
  for (const s of [1, -1]) {
    b.decal(cowl, T.mandala, { at: [s * 0.43, 0.64, 0.6], dir: [s, 0, 0], size: [0.34, 0.34] });
    rod([s * 0.61, 0.9, 0.3], [s * 0.25, 0.89, 0.9], 0.013, C.gold);
    rod([s * 0.61, 0.38, 0.3], [s * 0.25, 0.38, 0.9], 0.013, C.chrome);
  }
  put(new THREE.PlaneGeometry(0.46, 0.04), "#ffffff", [0, 0.4, 0.903], { dir: [0, 0, 1], axis: "z", texture: T.trim });

  // Headlamp
  b.lathe([[0, 0], [0.1, 0], [0.115, 0.04], [0.095, 0.09], [0, 0.09]], {
    at: [0, 0.74, 0.9], axis: [0, 0, 1], segments: 12, color: C.chrome, bone: chassis,
  });
  glow(
    put(new THREE.SphereGeometry(0.085, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), C.lamp, [0, 0.74, 0.97], { dir: [0, 0, 1] }),
    1.5,
  );
  put(new THREE.TorusGeometry(0.098, 0.012, 6, 16), C.gold, [0, 0.74, 0.975], { axis: "z", dir: [0, 0, 1] });
  // red eyebrow over the lamp
  b.extrude(
    [[-0.13, 0], [-0.13, 0.05], [-0.08, 0.1], [0, 0.125], [0.08, 0.1], [0.13, 0.05], [0.13, 0], [0.1, 0.03], [0, 0.07], [-0.1, 0.03]],
    { at: [0, 0.83, 0.935], x: [1, 0, 0], thickness: 0.03, color: C.red, bone: chassis },
  );
  // indicators
  for (const s of [1, -1])
    glow(put(new THREE.SphereGeometry(0.035, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), C.amber, [s * 0.27, 0.52, 0.86], { dir: [s, 0, 0.5] }), 1.2);

  // Brass kalash finial on the nose
  b.lathe(
    [[0, 0], [0.055, 0], [0.055, 0.012], [0.035, 0.03], [0.065, 0.085], [0.05, 0.13], [0.03, 0.15], [0.045, 0.165], [0.045, 0.18], [0, 0.18]],
    { at: [0, 0.9, 0.82], axis: [0, 1, 0], segments: 10, color: C.gold, bone: chassis },
  );
  put(sph(0.04, 8, 6), C.brass, [0, 1.12, 0.82]);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    put(new THREE.ConeGeometry(0.016, 0.1, 5), C.leaf, [Math.sin(a) * 0.04, 1.1, 0.82 + Math.cos(a) * 0.04], {
      dir: [Math.sin(a) * 0.8, 1, Math.cos(a) * 0.8],
    });
  }

  // Brass horn with red bulb
  b.lathe([[0, 0], [0.018, 0], [0.03, 0.1], [0.062, 0.22], [0.092, 0.3], [0.084, 0.3], [0.054, 0.22], [0.022, 0.1], [0, 0.04]], {
    at: [0.16, 0.93, 0.7], axis: [0.15, 0.2, 1], segments: 10, color: C.brass, bone: chassis,
  });
  put(sph(0.045, 8, 6), C.red, [0.155, 0.93, 0.66]);

  // Lemon and chilli charm
  rod([0.2, 0.34, 0.9], [0.2, 0.24, 0.92], 0.004, C.black, chassis, 4);
  put(ball(0.04, 0, 0, 0, 0.85, 8, 6), C.lemon, [0.2, 0.2, 0.92]);
  for (const dx of [-0.025, 0, 0.025])
    put(new THREE.ConeGeometry(0.011, 0.08, 5), C.chilli, [0.2 + dx, 0.12, 0.92], { dir: [0, -1, 0] });

  // =============================================================================================================
  // Passenger body
  const panelH = 0.76;
  for (const s of [1, -1]) {
    put(box(0.045, panelH, 0.95), P.yellow, [s * 0.6, 0.7, -0.625]);
    put(new THREE.PlaneGeometry(0.83, 0.46), "#ffffff", [s * 0.6275, 0.8, -0.62], {
      dir: [s, 0, 0], axis: "z", texture: T.side,
    });
    put(new THREE.PlaneGeometry(0.95, 0.04), "#ffffff", [s * 0.6265, 1.055, -0.625], {
      dir: [s, 0, 0], axis: "z", texture: T.trim,
    });
    rod([s * 0.61, 1.09, -1.1], [s * 0.61, 1.09, -0.15], 0.016, C.chrome);
    // low doors by the driver
    put(box(0.04, 0.35, 0.5), P.green, [s * 0.6, 0.575, 0.07]);
    put(new THREE.CircleGeometry(0.13, 16), "#ffffff", [s * 0.6225, 0.57, 0.07], {
      dir: [s, 0, 0], axis: "z", texture: T.mandala,
    });
    rod([s * 0.61, 0.76, -0.18], [s * 0.61, 0.76, 0.32], 0.016, C.chrome);
    // pillars
    rod([s * 0.635, 0.94, 0.385], [s * 0.635, 1.61, 0.322], 0.022, C.chrome);
    rod([s * 0.61, 1.08, -0.2], [s * 0.61, 1.64, -0.2], 0.02, C.chrome);
    rod([s * 0.6, 1.08, -1.08], [s * 0.6, 1.6, -1.08], 0.02, C.chrome);
    // rolled canvas curtains
    put(cyl(0.045, 0.045, 0.95, 8), curtainPaint, [s * 0.64, 1.56, -0.62], { dir: [0, 0, 1] });
    for (const z of [-0.95, -0.3]) put(box(0.035, 0.12, 0.03), C.red, [s * 0.64, 1.56, z]);
  }
  // rear body: panel, board, plate, lights, bumper
  put(box(1.24, 0.55, 0.045), P.green, [0, 0.605, -1.1]);
  put(new THREE.PlaneGeometry(1.12, 0.35), "#ffffff", [0, 0.68, -1.1245], { dir: [0, 0, -1], axis: "z", texture: T.back });
  put(box(0.34, 0.1, 0.01), C.dark, [0, 0.43, -1.128]);
  put(new THREE.PlaneGeometry(0.32, 0.095), "#ffffff", [0, 0.43, -1.1345], { dir: [0, 0, -1], axis: "z", texture: T.plate });
  for (const s of [1, -1]) {
    glow(put(box(0.06, 0.14, 0.04), C.tail, [s * 0.59, 0.68, -1.13]), 0.8);
    put(box(0.06, 0.04, 0.04), C.amber, [s * 0.59, 0.57, -1.13]);
  }
  put(box(1.26, 0.08, 0.05), C.red, [0, 0.32, -1.13]);
  put(new THREE.PlaneGeometry(1.26, 0.075), "#ffffff", [0, 0.32, -1.1585], { dir: [0, 0, -1], axis: "z", texture: T.tape });
  for (const s of [1, -1]) put(sph(0.04, 8, 5), C.chrome, [s * 0.64, 0.32, -1.13]);
  // rear canvas with a window
  put(new THREE.PlaneGeometry(1.2, 0.7), "#ffffff", [0, 1.27, -1.1245], { dir: [0, 0, -1], axis: "z", texture: T.canvas });
  put(new THREE.PlaneGeometry(1.2, 0.7), "#ffffff", [0, 1.27, -1.0755], { dir: [0, 0, 1], axis: "z", texture: T.canvas });
  rod([-0.6, 0.9, -1.1], [0.6, 0.9, -1.1], 0.014, C.chrome);

  // seats
  put(box(1.12, 0.2, 0.82), P.yellow, [0, 0.44, -0.66]);
  put(box(1.08, 0.1, 0.78), P.seat, [0, 0.59, -0.66]);
  put(box(1.08, 0.44, 0.12), P.seat, [0, 0.86, -1.0]);
  put(box(0.5, 0.18, 0.4), P.dark, [0, 0.43, 0.02]);
  put(box(0.5, 0.1, 0.42), P.driverSeat, [0, 0.55, 0.02]);
  put(box(0.5, 0.4, 0.09), P.driverSeat, [0, 0.82, -0.17]);
  // grab rail with its own garland of tassel
  b.sweep(catmull([[-0.6, 1.14, -0.22], [0, 1.14, -0.22], [0.6, 1.14, -0.22]]), 0.014, {
    color: C.chrome, bone: chassis, sides: 6,
  });

  // =============================================================================================================
  // Windshield, banner, mirrors, wiper
  put(new THREE.PlaneGeometry(1.26, 0.53), "#ffffff", [0, 1.205, 0.357], { dir: [0, 0.1, 1], axis: "z", texture: T.glass });
  rod([-0.635, 0.942, 0.383], [0.635, 0.942, 0.383], 0.02, C.chrome);
  rod([-0.635, 1.47, 0.331], [0.635, 1.47, 0.331], 0.02, C.chrome);
  put(box(1.3, 0.18, 0.05), C.red, [0, 1.55, 0.335]);
  put(new THREE.PlaneGeometry(1.3, 0.14), "#ffffff", [0, 1.55, 0.363], { dir: [0, 0, 1], axis: "z", texture: T.banner });
  rod([0.35, 0.96, 0.4], [-0.2, 1.2, 0.372], 0.008, C.black, chassis, 5);
  put(sph(0.016, 6, 4), C.chrome, [0.35, 0.96, 0.4]);

  for (const s of [1, -1]) {
    rod([s * 0.635, 1.0, 0.4], [s * 0.8, 1.2, 0.54], 0.012, C.chrome, chassis, 6);
    const M = new THREE.Vector3(s * 0.8, 1.22, 0.56);
    const d = new THREE.Vector3(-s * 0.3, 0, -1).normalize();
    const dd = d.toArray();
    const at = (k: number) => M.clone().addScaledVector(d, k).toArray();
    put(cyl(0.08, 0.08, 0.016, 12), C.mirror, at(0), { dir: dd });
    put(cyl(0.085, 0.085, 0.03, 12), C.red, at(-0.024), { dir: dd });
    put(new THREE.TorusGeometry(0.085, 0.012, 6, 14), C.gold, at(0.005), { dir: dd, axis: "z" });
    put(sph(0.026, 6, 4), C.pink, [M.x, M.y + 0.105, M.z]);
  }

  // =============================================================================================================
  // Roof
  const roofY = (z: number) => 1.745 - 0.12 * ((z + 0.25) / 1.0) ** 2;
  const edgeY = (z: number, x: number) => roofY(z) - 0.055 * Math.sqrt(Math.max(0, 1 - (x / 0.7) ** 2)) - 0.012;
  const roofZs = [-1.18, -0.6, 0, 0.4, 0.72];
  b.sweep(catmull(roofZs.map((z) => [0, roofY(z), z])), () => [0.7, 0.055], {
    color: roofPaint, bone: chassis, sides: 14, caps: "flat",
  });
  // gold edge rails
  for (const s of [1, -1])
    b.sweep(catmull(roofZs.map((z) => [s * 0.7, roofY(z) - 0.012, z])), 0.017, { color: C.gold, bone: chassis, sides: 6 });
  const xsEdge = Array.from({ length: 15 }, (_, i) => -0.7 + i * 0.1);
  for (const z of [0.72, -1.18])
    b.sweep(catmull(xsEdge.map((x) => [x, edgeY(z, x) - 0.004, z])), 0.017, { color: C.gold, bone: chassis, sides: 6 });

  // fringe: tassels + marigold strands
  const frontXs = Array.from({ length: 14 }, (_, i) => -0.65 + i * 0.1);
  const sideZs = Array.from({ length: 15 }, (_, i) => -1.1 + i * 0.12);
  const rowPts: number[][] = [
    ...frontXs.map((x) => [x, edgeY(0.72, x), 0.725]),
    ...frontXs.map((x) => [x, edgeY(-1.18, x), -1.185]),
    ...sideZs.map((z) => [0.695, edgeY(z, 0.7), z]),
    ...sideZs.map((z) => [-0.695, edgeY(z, 0.7), z]),
  ];
  hang(rowPts.filter((_, i) => i % 2 === 0), [T.tassel], [0.055, 0.16], 21);
  hang(rowPts.filter((_, i) => i % 2 === 1), [T.strand], [0.045, 0.3], 22);

  // fairy lights along front and back edges
  const lights = makeBag(chassis);
  const lc = [C.red, C.green, C.blue, C.lamp, C.pink];
  for (const z of [0.725, -1.185])
    for (let i = 0; i < 13; i++) {
      const x = -0.6 + i * 0.1;
      lights.add(lc[i % 5], ball(0.02, x, edgeY(z, x) - 0.02, z, 1, 6, 4));
    }
  lights.flush().forEach((p) => glow(p, 1.6));

  // Crown on the roof front
  function crown(zc: number, w: number, h: number, n: number) {
    const base = roofY(zc) + 0.055;
    const make = (sc: number) => {
      const pts: Array<[number, number] | [number, number, "sharp"]> = [];
      for (let k = 0; k <= n; k++) {
        const tv = Math.PI - (Math.PI * k) / n;
        pts.push([0.8 * w * sc * Math.cos(tv), k === 0 || k === n ? 0 : 0.8 * h * sc * Math.sin(tv)]);
        if (k < n) {
          const tt = Math.PI - (Math.PI * (k + 0.5)) / n;
          pts.push([w * sc * Math.cos(tt), h * sc * Math.sin(tt), "sharp"]);
        }
      }
      return pts;
    };
    b.extrude(make(1), { at: [0, base, zc], x: [1, 0, 0], thickness: 0.04, color: C.red, bone: chassis });
    b.extrude(make(0.78), { at: [0, base + 0.01, zc + 0.02], x: [1, 0, 0], thickness: 0.03, color: C.gold, bone: chassis });
    b.extrude(make(0.5), { at: [0, base + 0.02, zc + 0.04], x: [1, 0, 0], thickness: 0.026, color: C.turq, bone: chassis });
    const gem = [C.pink, C.blue, C.lamp, C.green];
    for (let k = 0; k < n; k++) {
      const tt = Math.PI - (Math.PI * (k + 0.5)) / n;
      put(sph(0.026, 6, 4), gem[k % 4], [w * Math.cos(tt), base + h * Math.sin(tt) + 0.02, zc + 0.045]);
    }
    put(new THREE.CircleGeometry(0.075, 14), "#ffffff", [0, base + h * 0.28, zc + 0.058], {
      dir: [0, 0, 1], axis: "z", texture: T.mandala,
    });
  }
  crown(0.5, 0.46, 0.3, 7);
  put(box(1.0, 0.03, 0.06), C.gold, [0, roofY(0.5) + 0.045, 0.5]);

  // Flag mast
  rod([0.55, 1.74, 0.1], [0.55, 2.05, 0.1], 0.01, C.gold, chassis, 6);
  put(sph(0.022, 6, 4), C.gold, [0.55, 2.07, 0.1]);
  for (const s of [1, -1])
    put(new THREE.PlaneGeometry(0.26, 0.17), "#ffffff", [0.55 + s * 0.004, 1.955, -0.03], {
      dir: [s, 0, 0], axis: "z", texture: T.flag,
    });

  // =============================================================================================================
  // Garlands and bells
  const gar = makeBag(chassis);
  const beads = (pts: THREE.Vector3[], r: number) =>
    pts.forEach((p, i) => {
      const col = i % 6 === 5 ? C.leaf : i % 7 === 3 ? C.red : i % 2 ? C.marigold : C.orange;
      gar.add(col, ball(r, p.x, p.y, p.z, 0.85, 6, 4));
    });
  beads(swag([-0.63, 1.44, 0.395], [0, 1.44, 0.395], 0.12, 12), 0.027);
  beads(swag([0, 1.44, 0.395], [0.63, 1.44, 0.395], 0.12, 12), 0.027);
  beads(swag([-0.6, 1.6, -1.14], [0.6, 1.6, -1.14], 0.1, 20), 0.026);
  for (const s of [1, -1]) beads(swag([s * 0.63, 0.9, 0.32], [s * 0.27, 0.9, 0.9], 0.09, 14), 0.024);
  const ring: THREE.Vector3[] = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    ring.push(new THREE.Vector3(Math.sin(a) * 0.15, 0.74 + Math.cos(a) * 0.15, 0.93));
  }
  beads(ring, 0.022);
  gar.flush();

  const bells = makeBag(chassis);
  for (let i = 0; i < 13; i++) {
    const x = -0.6 + i * 0.1;
    bells.add(C.gold, ball(0.022, x, edgeY(0.72, x) - 0.065, 0.74, 1, 6, 4));
  }
  bells.flush();

  return b.root;
}
