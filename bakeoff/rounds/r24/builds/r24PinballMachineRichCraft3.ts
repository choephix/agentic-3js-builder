import * as THREE from "three";
import { createBuilder, rng, paint, mottle, mix, smoothstep, svg, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, coil } from "../../../../kits/clockwork";

export const meta = {
  name: "Orbitron Pinball Machine",
  description:
    "A 1970s space-age pinball machine: atomic-age backbox with a glowing translite and atom beacon, rocket-fin cabinet with chrome legs, and a playfield with a ringed planet, pop bumpers, flippers, slingshots, drop targets and glowing inserts.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (70s space-age: atomic orange, mustard, turquoise, cream, midnight blue)
const ORANGE = "#ff7a1a";
const YELLOW = "#ffc933";
const TEAL = "#17b9c4";
const CREAM = "#f3ead2";
const MAG = "#d93a74";
const RED = "#e0332b";
const WHITE = "#f7f4ea";
const BLACK = "#15151d";
const NAVYC = "#13204a";
const BALLC = "#e3e8ef";
const STEELD = "#59606e";

const D2R = Math.PI / 180;
type Outline = Array<[number, number] | [number, number, "sharp"]>;

// ---------------------------------------------------------------------------------------------------------------
// SVG helpers
const f1 = (n: number) => n.toFixed(1);

function sparkle(x: number, y: number, s: number, fill: string): string {
  return `<path d="M${f1(x)} ${f1(y - s)}L${f1(x + s * 0.26)} ${f1(y - s * 0.26)}L${f1(x + s)} ${f1(y)}L${f1(x + s * 0.26)} ${f1(y + s * 0.26)}L${f1(x)} ${f1(y + s)}L${f1(x - s * 0.26)} ${f1(y + s * 0.26)}L${f1(x - s)} ${f1(y)}L${f1(x - s * 0.26)} ${f1(y - s * 0.26)}Z" fill="${fill}"/>`;
}

function starfield(count: number, w: number, h: number, seed: number): string {
  const r = rng(seed);
  const cols = ["#ffffff", "#ffe9a8", "#bfeaff", "#ffc9e0"];
  let s = "";
  for (let i = 0; i < count; i++) {
    const x = r() * w;
    const y = r() * h;
    const k = r();
    const c = cols[Math.floor(r() * cols.length)];
    s +=
      k < 0.14
        ? sparkle(x, y, 5 + r() * 5, c)
        : `<circle cx="${f1(x)}" cy="${f1(y)}" r="${(0.9 + r() * 1.6).toFixed(1)}" fill="${c}" opacity="${(0.55 + r() * 0.45).toFixed(2)}"/>`;
  }
  return s;
}

function starPath(cx: number, cy: number, R: number, r: number, n: number): string {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    const rad = i % 2 === 0 ? R : r;
    d += `${i ? "L" : "M"}${f1(cx + rad * Math.cos(a))} ${f1(cy + rad * Math.sin(a))}`;
  }
  return d + "Z";
}

function burst(cx: number, cy: number, n: number, a0: number, a1: number, r: number, fill: string, op: number): string {
  let s = "";
  const step = (a1 - a0) / n;
  for (let i = 0; i < n; i += 2) {
    const A = (a0 + i * step) * D2R;
    const B = (a0 + (i + 1) * step) * D2R;
    s += `<path d="M${cx} ${cy}L${f1(cx + r * Math.cos(A))} ${f1(cy + r * Math.sin(A))}L${f1(cx + r * Math.cos(B))} ${f1(cy + r * Math.sin(B))}Z" fill="${fill}" opacity="${op}"/>`;
  }
  return s;
}

function arcs(cx: number, cy: number, radii: number[], cols: string[], w: number): string {
  return radii
    .map((r, i) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${cols[i % cols.length]}" stroke-width="${w}"/>`)
    .join("");
}

// A retro rocket pointing +x, drawn around the origin.
const ROCKET = `<g>
  <path d="M-92 -9L-190 0L-92 9Z" fill="${ORANGE}"/>
  <path d="M-92 -5L-150 0L-92 5Z" fill="${YELLOW}"/>
  <path d="M-62 -20L-98 -52L-30 -22Z" fill="${ORANGE}" stroke="${NAVYC}" stroke-width="3"/>
  <path d="M-62 20L-98 52L-30 22Z" fill="${ORANGE}" stroke="${NAVYC}" stroke-width="3"/>
  <path d="M-86 0C-66 -32 44 -32 86 0C44 32 -66 32 -86 0Z" fill="${WHITE}" stroke="${NAVYC}" stroke-width="3"/>
  <path d="M34 -21C54 -15 72 -8 86 0C72 8 54 15 34 21Z" fill="${ORANGE}" stroke="${NAVYC}" stroke-width="3"/>
  <rect x="-70" y="-6" width="12" height="12" fill="${TEAL}"/>
  <circle cx="-6" cy="0" r="10" fill="${TEAL}" stroke="${NAVYC}" stroke-width="3"/>
  <circle cx="-34" cy="0" r="6" fill="${TEAL}" stroke="${NAVYC}" stroke-width="2.5"/>
  <circle cx="-8" cy="-3" r="3" fill="#ffffff" opacity="0.8"/>
</g>`;

function sideSvg(flip: boolean): string {
  const inner = `
  <rect width="1060" height="245" fill="url(#sg)"/>
  ${burst(870, 110, 28, 0, 360, 700, "#ffb347", 0.06)}
  ${starfield(46, 1060, 245, 31)}
  <ellipse cx="170" cy="72" rx="62" ry="13" transform="rotate(-16 170 72)" fill="none" stroke="${TEAL}" stroke-width="7"/>
  <circle cx="170" cy="72" r="34" fill="url(#spl)"/>
  <path d="M110 80A62 13 -16 0 0 230 64" fill="none" stroke="${TEAL}" stroke-width="7" transform="rotate(0)"/>
  <path d="M0 205C260 205 440 150 720 122S980 76 1060 64" fill="none" stroke="${ORANGE}" stroke-width="18"/>
  <path d="M0 229C260 229 440 174 720 146S980 100 1060 88" fill="none" stroke="${YELLOW}" stroke-width="18"/>
  <path d="M0 253C260 253 440 198 720 170S980 124 1060 112" fill="none" stroke="${TEAL}" stroke-width="18"/>
  <path d="M600 92h150M560 110h120M640 74h110" stroke="#ffffff" stroke-width="3" opacity="0.5" stroke-linecap="round"/>
  <g transform="translate(850 92) rotate(-8) scale(1.25)">${ROCKET}</g>
  <circle cx="420" cy="48" r="13" fill="${MAG}"/><circle cx="416" cy="44" r="4" fill="#ffffff" opacity="0.5"/>`;
  return `<svg viewBox="0 0 1060 245" xmlns="http://www.w3.org/2000/svg"><defs>
    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f1844"/><stop offset="1" stop-color="#25307a"/></linearGradient>
    <radialGradient id="spl" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#ffe9a0"/><stop offset="0.6" stop-color="#ff9b2f"/><stop offset="1" stop-color="#b8321b"/></radialGradient>
  </defs><g ${flip ? 'transform="translate(1060 0) scale(-1 1)"' : ""}>${inner}</g></svg>`;
}

function playfieldSvg(): string {
  let chev = "";
  for (let i = 0; i < 9; i++) {
    const y = 300 + i * 70;
    chev += `<path d="M461 ${y}l14 -15l14 15" fill="none" stroke="${YELLOW}" stroke-width="4" stroke-linecap="round" opacity="${(0.35 + i * 0.07).toFixed(2)}"/>`;
  }
  let lanes = "";
  [175, 225, 275].forEach((x, i) => {
    lanes += `<rect x="${x - 19}" y="38" width="38" height="104" rx="16" fill="#252f86" stroke="${CREAM}" stroke-width="3"/>
    <text x="${x}" y="130" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="24" fill="${CREAM}">${i + 1}</text>`;
  });
  return `<svg viewBox="0 0 500 1000" xmlns="http://www.w3.org/2000/svg"><defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1033"/><stop offset="0.5" stop-color="#1a1c5a"/><stop offset="1" stop-color="#40184d"/></linearGradient>
    <radialGradient id="pl" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#ffe9a0"/><stop offset="0.5" stop-color="#ff9b2f"/><stop offset="1" stop-color="#b8321b"/></radialGradient>
    <clipPath id="pc"><circle cx="225" cy="290" r="120"/></clipPath>
  </defs>
  <rect width="500" height="1000" fill="url(#bg)"/>
  ${burst(225, 1010, 22, -180, 0, 1100, "#ffffff", 0.05)}
  ${starfield(80, 450, 900, 5)}
  ${arcs(0, 800, [100, 122, 144, 166], [ORANGE, YELLOW, TEAL, MAG], 14)}
  ${arcs(450, 800, [100, 122, 144, 166], [ORANGE, YELLOW, TEAL, MAG], 14)}
  <rect x="450" y="0" width="50" height="1000" fill="#0b0e2b"/>
  <rect x="446" y="140" width="4" height="860" fill="${CREAM}" opacity="0.5"/>
  ${chev}
  <text transform="translate(480 860) rotate(-90)" font-family="Arial Black, Impact, sans-serif" font-size="20" fill="${ORANGE}" letter-spacing="4">SHOOT</text>
  ${lanes}
  <g transform="rotate(-18 225 290)"><path d="M35 290A190 42 0 0 1 415 290" fill="none" stroke="${TEAL}" stroke-width="16"/></g>
  <circle cx="225" cy="290" r="120" fill="url(#pl)"/>
  <g clip-path="url(#pc)"><rect x="90" y="215" width="270" height="18" fill="#c8421d" opacity="0.5"/><rect x="90" y="262" width="270" height="26" fill="#ffd36a" opacity="0.35"/><rect x="90" y="330" width="270" height="22" fill="#c8421d" opacity="0.45"/></g>
  <g transform="rotate(-18 225 290)"><path d="M35 290A190 42 0 0 0 415 290" fill="none" stroke="${TEAL}" stroke-width="16"/><path d="M35 290A190 42 0 0 0 415 290" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.5" transform="translate(0 -5)"/></g>
  <ellipse cx="225" cy="290" rx="205" ry="165" fill="none" stroke="${CREAM}" stroke-width="2" stroke-dasharray="3 9" opacity="0.7"/>
  <circle cx="183" cy="265" r="46" fill="#000" fill-opacity="0.25" stroke="${YELLOW}" stroke-width="3"/>
  <circle cx="267" cy="265" r="46" fill="#000" fill-opacity="0.25" stroke="${YELLOW}" stroke-width="3"/>
  <circle cx="225" cy="340" r="46" fill="#000" fill-opacity="0.25" stroke="${YELLOW}" stroke-width="3"/>
  <circle cx="350" cy="95" r="14" fill="${MAG}"/><circle cx="60" cy="400" r="10" fill="${TEAL}"/>
  <g transform="translate(225 650) rotate(-90) scale(0.72)">${ROCKET}</g>
  <text x="225" y="805" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="34" fill="${CREAM}" stroke="${ORANGE}" stroke-width="3" paint-order="stroke" letter-spacing="5">ORBITRON</text>
  <path d="M60 835h330" stroke="${TEAL}" stroke-width="4"/>
  <text transform="translate(18 760) rotate(-90)" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="${YELLOW}" letter-spacing="3">SPECIAL</text>
  <text transform="translate(438 760) rotate(-90)" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="${YELLOW}" letter-spacing="3">SPECIAL</text>
  <text x="85" y="520" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="${TEAL}" letter-spacing="3" transform="rotate(-90 85 520)">ROLL FOR BONUS</text>
  </svg>`;
}

function win(x: number, y: number, label: string, digits: string): string {
  return `<rect x="${x}" y="${y}" width="188" height="62" rx="8" fill="#050610" stroke="#cfd6dd" stroke-width="3"/>
  <text x="${x + 10}" y="${y + 17}" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="${TEAL}" letter-spacing="2">${label}</text>
  <text x="${x + 178}" y="${y + 54}" text-anchor="end" font-family="Courier New, monospace" font-weight="bold" font-size="38" fill="#ff8a2a" letter-spacing="3">${digits}</text>`;
}

function translite(): string {
  return `<svg viewBox="0 0 440 660" xmlns="http://www.w3.org/2000/svg"><defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0f4a"/><stop offset="0.55" stop-color="#2b1a6a"/><stop offset="1" stop-color="#5a1d5e"/></linearGradient>
    <radialGradient id="pl" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#ffe9a0"/><stop offset="0.5" stop-color="#ff9b2f"/><stop offset="1" stop-color="#b8321b"/></radialGradient>
  </defs>
  <rect width="440" height="660" fill="url(#g)"/>
  ${burst(220, 270, 40, 0, 360, 520, "#ffb347", 0.09)}
  ${starfield(60, 440, 410, 77)}
  ${arcs(0, 420, [60, 78, 96, 114], [ORANGE, YELLOW, TEAL, MAG], 11)}
  ${arcs(440, 420, [60, 78, 96, 114], [ORANGE, YELLOW, TEAL, MAG], 11)}
  <text x="220" y="84" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-size="70" fill="${CREAM}" stroke="${ORANGE}" stroke-width="6" paint-order="stroke" letter-spacing="3">ORBITRON</text>
  <text x="220" y="116" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="${TEAL}" letter-spacing="7">SPACE-AGE PINBALL</text>
  <g transform="rotate(-20 190 265)"><ellipse cx="190" cy="265" rx="140" ry="30" fill="none" stroke="${TEAL}" stroke-width="12"/></g>
  <circle cx="190" cy="265" r="82" fill="url(#pl)"/>
  <rect x="108" y="238" width="164" height="12" fill="#c8421d" opacity="0.45"/><rect x="108" y="282" width="164" height="16" fill="#ffd36a" opacity="0.3"/>
  <g transform="rotate(-20 190 265)"><path d="M50 265A140 30 0 0 0 330 265" fill="none" stroke="${TEAL}" stroke-width="12"/></g>
  <circle cx="350" cy="168" r="16" fill="${MAG}"/><circle cx="345" cy="163" r="5" fill="#ffffff" opacity="0.5"/>
  <g transform="translate(305 330) rotate(-38) scale(0.95)">${ROCKET}</g>
  <path d="M90 360h70M60 378h60" stroke="#ffffff" stroke-width="3" opacity="0.4" stroke-linecap="round"/>
  <rect x="0" y="414" width="440" height="8" fill="${ORANGE}"/><rect x="0" y="422" width="440" height="8" fill="${YELLOW}"/><rect x="0" y="430" width="440" height="8" fill="${TEAL}"/>
  <rect x="8" y="446" width="424" height="208" rx="14" fill="#0a0c24" stroke="${CREAM}" stroke-width="3"/>
  ${win(18, 456, "PLAYER 1", "128450")}
  ${win(234, 456, "PLAYER 2", "096300")}
  ${win(18, 526, "PLAYER 3", "000000")}
  ${win(234, 526, "PLAYER 4", "000000")}
  <rect x="18" y="604" width="130" height="38" rx="19" fill="#1c1f55" stroke="${YELLOW}" stroke-width="3"/>
  <text x="83" y="629" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="15" fill="${YELLOW}" letter-spacing="1">BALL 3</text>
  <rect x="156" y="604" width="130" height="38" rx="19" fill="#1c1f55" stroke="${TEAL}" stroke-width="3"/>
  <text x="221" y="629" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="15" fill="${TEAL}" letter-spacing="1">CREDITS 02</text>
  <rect x="294" y="604" width="128" height="38" rx="19" fill="#5a1220" stroke="${RED}" stroke-width="3"/>
  <text x="358" y="629" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="17" fill="#ff6a5a" letter-spacing="3">TILT</text>
  </svg>`;
}

function frontSvg(): string {
  return `<svg viewBox="0 0 560 260" xmlns="http://www.w3.org/2000/svg">
  <rect width="560" height="260" fill="#101a46"/>
  ${arcs(0, 260, [60, 80, 100, 120], [ORANGE, YELLOW, TEAL, MAG], 10)}
  ${arcs(560, 260, [60, 80, 100, 120], [ORANGE, YELLOW, TEAL, MAG], 10)}
  <rect x="0" y="0" width="560" height="90" fill="${CREAM}"/>
  <text x="280" y="58" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-size="54" fill="${ORANGE}" stroke="${NAVYC}" stroke-width="4" paint-order="stroke" letter-spacing="6">ORBITRON</text>
  ${sparkle(90, 44, 14, TEAL)}${sparkle(470, 44, 14, TEAL)}${sparkle(60, 66, 7, MAG)}${sparkle(500, 66, 7, MAG)}
  <text x="280" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="11" fill="${NAVYC}" letter-spacing="4">SPECIAL WHEN LIT</text>
  <rect x="0" y="90" width="560" height="10" fill="${ORANGE}"/><rect x="0" y="100" width="560" height="10" fill="${YELLOW}"/><rect x="0" y="110" width="560" height="10" fill="${TEAL}"/>
  <text x="280" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="${CREAM}" letter-spacing="3" opacity="0.8">ASTRO-MATIC MFG. CO. CHICAGO ILL.  1975</text>
  </svg>`;
}

function cardSvg(lines: string[], accent: string): string {
  const text = lines
    .map(
      (l, i) =>
        `<text x="100" y="${46 + i * 24}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="${i === 0 ? 20 : 14}" fill="${i === 0 ? ORANGE : NAVYC}" letter-spacing="1.5">${l}</text>`,
    )
    .join("");
  return `<svg viewBox="0 0 200 125" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="196" height="121" rx="10" fill="${CREAM}" stroke="${accent}" stroke-width="5"/>${text}<path d="${starPath(100, 108, 8, 3.5, 5)}" fill="${accent}"/></svg>`;
}

function emblemSvg(): string {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="${CREAM}"/><circle cx="50" cy="50" r="40" fill="none" stroke="${ORANGE}" stroke-width="6"/><path d="${starPath(50, 52, 30, 13, 5)}" fill="${NAVYC}"/><circle cx="50" cy="52" r="7" fill="${YELLOW}"/></svg>`;
}

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "orbitron_pinball" });

  // ---- Playfield frame: the playfield plane is tilted 6.5 degrees, rising toward the backbox.
  const TH = 6.5 * D2R;
  const S = Math.sin(TH);
  const C = Math.cos(TH);
  const Y0 = 0.9;
  const CX = -0.025; // centre of the main field (the shooter lane sits to the right of it)
  const mir = (x: number) => 2 * CX - x;
  const P = (x: number, z: number, h = 0) => new THREE.Vector3(x, Y0 - z * S + h * C, z * C + h * S);
  const AX = new THREE.Vector3(1, 0, 0);
  const AY = new THREE.Vector3(0, 1, 0);
  const AZ = new THREE.Vector3(0, 0, 1);
  const NRM = new THREE.Vector3(0, C, S);
  const BACKV = new THREE.Vector3(0, S, -C);
  const Q = new THREE.Quaternion().setFromAxisAngle(AX, TH);
  const rq = (axis: THREE.Vector3, deg: number) => new THREE.Quaternion().setFromAxisAngle(axis, deg * D2R);
  const rx = (d: number) => rq(AX, d);
  const ry = (d: number) => rq(AY, d);
  const rz = (d: number) => rq(AZ, d);

  type Col = string | ReturnType<typeof paint>;
  type PfOpts = {
    lq?: THREE.Quaternion;
    scale?: number | [number, number, number];
    texture?: THREE.Texture;
    flat?: boolean;
  };
  const pf = (geo: THREE.BufferGeometry, color: Col, x: number, z: number, h: number, o: PfOpts = {}) => {
    const { lq, ...rest } = o;
    const q = lq ? Q.clone().multiply(lq) : Q.clone();
    return b.part(geo, color, { at: P(x, z, h), quat: q, ...rest });
  };
  type ExtOpts = { rot?: number; bevel?: number; smoothing?: number };
  const ext = (outline: Outline, x: number, z: number, h: number, thick: number, color: Col, o: ExtOpts = {}) => {
    const p = (o.rot ?? 0) * D2R;
    const dx = AX.clone().multiplyScalar(Math.cos(p)).addScaledVector(BACKV, Math.sin(p));
    const dy = AX.clone().multiplyScalar(-Math.sin(p)).addScaledVector(BACKV, Math.cos(p));
    return b.extrude(outline, {
      at: P(x, z, h + thick / 2),
      x: dx,
      y: dy,
      thickness: thick,
      color,
      ...(o.bevel ? { bevel: o.bevel } : {}),
      ...(o.smoothing ? { smoothing: o.smoothing } : {}),
    });
  };
  const lat = (outline: Outline, x: number, z: number, h: number, color: Col, segments = 12) =>
    b.lathe(outline, { at: P(x, z, h), axis: NRM, color, segments });

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r0: number, r1: number, h: number, seg = 10) => new THREE.CylinderGeometry(r0, r1, h, seg);
  const sph = (r: number, ws = 10, hs = 7) => new THREE.SphereGeometry(r, ws, hs);
  const toOutline = (pts: [number, number][]): Outline => pts.map(([x, z]) => [x, -z] as [number, number]);
  const arcPts = (cx: number, cz: number, rx0: number, rz0: number, a0: number, a1: number, n: number) => {
    const out: [number, number][] = [];
    for (let i = 0; i <= n; i++) {
      const a = (a0 + ((a1 - a0) * i) / n) * D2R;
      out.push([cx + rx0 * Math.cos(a), cz - rz0 * Math.sin(a)]);
    }
    return out;
  };
  const starOutline = (R: number, r: number, n = 5): Outline => {
    const o: Outline = [];
    for (let i = 0; i < n * 2; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / n;
      const rad = i % 2 ? r : R;
      o.push([rad * Math.cos(a), rad * Math.sin(a)]);
    }
    return o;
  };

  // ---- Paints
  const CHROME = metal("steel", { polish: 0.85, tarnish: 0.03 });
  const NAVY = mottle("#13204a", "#1c2c66", { size: 0.14, contrast: 0.9 });
  const CREAMP = paint((_p, n) => mix("#e2d5ae", "#fbf3dc", smoothstep(-0.3, 0.9, n.y)));
  const GILT = metal("gilt", { tarnish: 0.05 });

  // ---- Textures
  const T_PF = svg(playfieldSvg(), { size: 1400 });
  const T_BG = svg(translite(), { size: 960 });
  const T_SIDE_A = svg(sideSvg(false), { size: 1024 });
  const T_SIDE_B = svg(sideSvg(true), { size: 1024 });
  const T_FRONT = svg(frontSvg(), { size: 768 });
  const T_EMB = svg(emblemSvg(), { size: 128 });
  const T_CARD1 = svg(cardSvg(["ORBITRON", "1 PLAYER 5 BALLS", "1 COIN PER GAME"], TEAL), { size: 256 });
  const T_CARD2 = svg(cardSvg(["BONUS", "SPECIAL WHEN LIT", "EXTRA BALL 300K"], ORANGE), { size: 256 });

  // =============================================================================================================
  // CABINET
  pf(box(0.56, 0.17, 1.06), NAVY, 0, 0, -0.085); // solid core
  pf(new THREE.PlaneGeometry(0.5, 1.0).rotateX(-Math.PI / 2), "#ffffff", 0, 0, 0.0008, { texture: T_PF });
  for (const s of [1, -1]) {
    pf(box(0.03, 0.075, 1.06), CREAMP, s * 0.265, 0, 0.0375); // side walls
    pf(box(0.037, 0.008, 1.07), CHROME, s * 0.265, 0, 0.079); // chrome side rails
    pf(box(0.002, 0.008, 1.0), ORANGE, s * 0.249, 0, 0.055);
    pf(box(0.002, 0.008, 1.0), TEAL, s * 0.249, 0, 0.03);
    // side art
    pf(new THREE.PlaneGeometry(1.06, 0.245), "#ffffff", s * 0.2805, 0, -0.0475, {
      lq: ry(s * 90),
      texture: s > 0 ? T_SIDE_A : T_SIDE_B,
    });
    // flipper buttons on the cabinet flanks
    pf(cyl(0.017, 0.017, 0.012, 10), CHROME, s * 0.285, 0.42, -0.02, { lq: rz(s > 0 ? -90 : 90) });
    glow(pf(cyl(0.012, 0.012, 0.018, 10), ORANGE, s * 0.292, 0.42, -0.02, { lq: rz(s > 0 ? -90 : 90) }), 0.8);
  }
  pf(box(0.5, 0.075, 0.03), CREAMP, 0, -0.515, 0.0375); // back wall
  pf(box(0.56, 0.008, 0.037), CHROME, 0, -0.515, 0.079);
  pf(box(0.56, 0.09, 0.025), NAVY, 0, 0.5175, 0.045); // front lip
  pf(box(0.56, 0.008, 0.037), CHROME, 0, 0.512, 0.094);
  pf(new THREE.PlaneGeometry(0.56, 0.26), "#ffffff", 0, 0.5305, -0.04, { texture: T_FRONT });

  // lockdown bar
  for (const s of [1, -1]) pf(box(0.03, 0.04, 0.03), CHROME, s * 0.265, 0.49, 0.1);
  b.rod(P(-0.25, 0.49, 0.1), P(0.25, 0.49, 0.1), 0.0065, CHROME, { sides: 8 });

  // coin door
  pf(box(0.2, 0.12, 0.006), CHROME, 0, 0.5335, -0.095);
  pf(box(0.18, 0.1, 0.003), BLACK, 0, 0.5375, -0.095);
  for (const s of [1, -1]) {
    pf(box(0.026, 0.05, 0.004), CHROME, s * 0.045, 0.54, -0.095);
    pf(box(0.005, 0.034, 0.004), BLACK, s * 0.045, 0.543, -0.095);
    glow(pf(box(0.034, 0.014, 0.004), s > 0 ? RED : ORANGE, s * 0.045, 0.54, -0.058), 1);
    pf(cyl(0.009, 0.009, 0.006, 8), CHROME, s * 0.045, 0.54, -0.138, { lq: rx(90) });
  }
  pf(cyl(0.008, 0.008, 0.006, 8), GILT, 0, 0.54, -0.12, { lq: rx(90) });
  pf(box(0.002, 0.008, 0.004), BLACK, 0, 0.544, -0.12);
  // start button
  pf(cyl(0.021, 0.021, 0.006, 12), CHROME, 0.19, 0.534, -0.12, { lq: rx(90) });
  glow(pf(cyl(0.016, 0.016, 0.014, 12), RED, 0.19, 0.538, -0.12, { lq: rx(90) }), 1);

  // legs
  for (const sx of [1, -1]) {
    for (const lz of [0.46, -0.48]) {
      const top = P(sx * 0.235, lz, -0.17);
      const foot = new THREE.Vector3(top.x, 0.02, top.z);
      const high = top.clone().add(new THREE.Vector3(0, 0.012, 0));
      b.rod(foot, high, [0.02, 0.031], CHROME, { sides: 10 });
      const at = (t: number) => foot.clone().lerp(high, t);
      b.rod(at(0.62), at(0.68), 0.0245, ORANGE, { sides: 10 });
      b.rod(at(0.7), at(0.73), 0.0255, TEAL, { sides: 10 });
      b.part(cyl(0.033, 0.036, 0.02, 12), BLACK, { at: [top.x, 0.01, top.z] });
      pf(box(0.085, 0.012, 0.085), STEELD, sx * 0.235, lz, -0.176);
      pf(cyl(0.007, 0.007, 0.008, 6), GILT, sx * 0.235, lz, -0.184);
    }
  }

  // =============================================================================================================
  // PLAYFIELD FURNITURE
  const rubberPost = (x: number, z: number, cap: string = ORANGE) => {
    pf(cyl(0.0035, 0.0035, 0.044, 6), CHROME, x, z, 0.022);
    pf(cyl(0.0088, 0.0088, 0.026, 10), WHITE, x, z, 0.015);
    pf(cyl(0.0062, 0.0062, 0.004, 8), cap, x, z, 0.044);
  };
  const dot = (x: number, z: number, r: number, color: string, str = 1) =>
    glow(pf(cyl(r, r, 0.0025, 10), color, x, z, 0.0021), str);
  const starIns = (x: number, z: number, R: number, color: string, str = 1) =>
    glow(ext(starOutline(R, R * 0.45), x, z, 0.0006, 0.003, color), str);

  // top-right arch (shooter lane exit)
  const archOuter = arcPts(0.01, -0.26, 0.24, 0.24, 0, 90, 12);
  ext(toOutline([[0.25, -0.5], [0.25, -0.26], ...archOuter]), 0, 0, 0, 0.05, TEAL);
  b.sweep(catmull(archOuter.map(([x, z]) => P(x, z, 0.052))), 0.0035, { color: CHROME, sides: 6 });
  b.sweep(catmull(arcPts(0.01, -0.26, 0.218, 0.218, 4, 88, 10).map(([x, z]) => P(x, z, 0.053))), 0.004, {
    color: ORANGE,
    sides: 6,
  });
  const archInner = arcPts(0.01, -0.26, 0.1925, 0.1925, 0, 72, 10);
  b.sweep(catmull(archInner.map(([x, z]) => P(x, z, 0.022))), 0.0035, { color: CHROME, sides: 6 });
  [2, 5, 8].forEach((i) => {
    const [x, z] = archInner[i];
    pf(cyl(0.004, 0.004, 0.026, 6), CHROME, x, z, 0.012);
  });
  // separator wall of the shooter lane
  pf(box(0.008, 0.045, 0.75), CHROME, 0.2025, 0.115, 0.0225);
  pf(box(0.0085, 0.006, 0.75), ORANGE, 0.2025, 0.115, 0.048);

  // top-left corner plastic
  ext(
    toOutline([[-0.25, -0.5], [-0.25, -0.33], [-0.236, -0.4], [-0.2, -0.455], [-0.14, -0.5]]),
    0, 0, 0, 0.045, ORANGE,
  );
  b.sweep(
    catmull([P(-0.25, -0.33, 0.048), P(-0.236, -0.4, 0.048), P(-0.2, -0.455, 0.048), P(-0.14, -0.5, 0.048)]),
    0.0035, { color: CHROME, sides: 6 },
  );
  starIns(-0.222, -0.455, 0.016, YELLOW, 0.8);

  // top rollover lanes
  [-0.1, -0.05, 0, 0.05].forEach((x) => {
    pf(box(0.007, 0.034, 0.11), CHROME, x, -0.425, 0.017);
    pf(cyl(0.006, 0.006, 0.04, 8), WHITE, x, -0.365, 0.02);
  });
  [-0.075, -0.025, 0.025].forEach((x, i) => {
    dot(x, -0.43, 0.012, [YELLOW, ORANGE, TEAL][i], 1);
    pf(cyl(0.007, 0.007, 0.003, 8), CHROME, x, -0.395, 0.002);
  });

  // pop bumpers
  const BUMP_SKIRT: Outline = [[0, 0], [0.037, 0], [0.037, 0.006], [0.031, 0.012], [0.031, 0.02], [0, 0.02]];
  const BUMP_RING: Outline = [[0.03, 0.018], [0.038, 0.018], [0.038, 0.025], [0.03, 0.025]];
  const BUMP_CAP: Outline = [[0, 0.024], [0.033, 0.024], [0.034, 0.03], [0.031, 0.038], [0.02, 0.043], [0, 0.044]];
  const bumpers: [number, number, string][] = [
    [CX - 0.042, -0.235, ORANGE],
    [CX + 0.042, -0.235, YELLOW],
    [CX, -0.16, MAG],
  ];
  bumpers.forEach(([x, z, c]) => {
    lat(BUMP_SKIRT, x, z, 0.0008, CREAMP);
    lat(BUMP_RING, x, z, 0.0008, CHROME);
    glow(lat(BUMP_CAP, x, z, 0.0008, c), 0.75);
    pf(new THREE.CircleGeometry(0.018, 14).rotateX(-Math.PI / 2), "#ffffff", x, z, 0.0452, { texture: T_EMB });
  });

  // orbit lights around the planet
  for (let i = 0; i < 8; i++) {
    const a = (20 + i * 20) * D2R;
    dot(CX + 0.145 * Math.cos(a), -0.21 - 0.145 * Math.sin(a), 0.0075, [YELLOW, ORANGE, TEAL][i % 3], 0.9);
  }

  // saucer
  const SAUCER: Outline = [[0, 0], [0.032, 0], [0.032, 0.014], [0.026, 0.014], [0.026, 0.003], [0, 0.003]];
  lat(SAUCER, -0.15, -0.1, 0.0008, CHROME);
  pf(cyl(0.0255, 0.0255, 0.002, 12), BLACK, -0.15, -0.1, 0.0045);
  glow(lat([[0.036, 0], [0.046, 0], [0.046, 0.002], [0.036, 0.002]], -0.15, -0.1, 0.0008, TEAL), 1);

  // stand-up targets on the left wall
  [-0.02, 0.03, 0.08].forEach((z, i) => {
    pf(box(0.006, 0.026, 0.05), CHROME, -0.2475, z, 0.014);
    pf(box(0.01, 0.03, 0.044), [MAG, ORANGE, YELLOW][i], -0.2425, z, 0.016);
    dot(-0.205, z, 0.007, YELLOW, 0.9);
  });

  // drop-target bank
  pf(box(0.14, 0.012, 0.018), CHROME, 0.115, -0.012, 0.006);
  [0.075, 0.115, 0.155].forEach((x, i) => {
    pf(box(0.036, 0.032, 0.008), [TEAL, ORANGE, MAG][i], x, -0.02, 0.022);
    pf(cyl(0.008, 0.008, 0.002, 8), CREAM, x, -0.0155, 0.022, { lq: rx(90) });
    glow(ext([[-0.007, -0.006], [0.007, -0.006], [0, 0.008]], x, -0.065, 0.0006, 0.003, YELLOW), 0.9);
  });

  // spinner
  [-1, 1].forEach((s) => pf(box(0.006, 0.036, 0.006), CHROME, -0.075 + s * 0.028, 0.03, 0.018));
  pf(cyl(0.0025, 0.0025, 0.056, 6), CHROME, -0.075, 0.03, 0.03, { lq: rz(90) });
  pf(box(0.046, 0.003, 0.026), ORANGE, -0.075, 0.03, 0.03, { lq: rx(-35) });
  pf(box(0.046, 0.0035, 0.005), TEAL, -0.075, 0.03, 0.03, { lq: rx(-35) });

  // slingshots, guides and posts
  const slingL: [number, number][] = [[-0.195, 0.12], [-0.195, 0.272], [-0.125, 0.293]];
  for (const s of [1, -1] as const) {
    const mx = (x: number) => (s > 0 ? x : mir(x));
    const tri = slingL.map(([x, z]) => [mx(x), z] as [number, number]);
    ext(toOutline(tri), 0, 0, 0, 0.034, ORANGE);
    const cx0 = (tri[0][0] + tri[1][0] + tri[2][0]) / 3;
    const cz0 = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
    const inner = tri.map(([x, z]) => [cx0 + (x - cx0) * 0.5, cz0 + (z - cz0) * 0.5] as [number, number]);
    ext(toOutline(inner), 0, 0, 0.034, 0.003, CREAM);
    glow(ext(starOutline(0.011, 0.005), cx0, cz0, 0.037, 0.003, YELLOW), 1);
    b.rod(P(tri[0][0], tri[0][1], 0.022), P(tri[2][0], tri[2][1], 0.022), 0.0042, WHITE, { sides: 6 });
    tri.forEach(([x, z]) => rubberPost(x, z));
    // outlane guide wire and inlane guide
    b.rod(P(mx(-0.215), 0.15, 0.02), P(mx(-0.215), 0.32, 0.02), 0.0035, CHROME, { sides: 6 });
    rubberPost(mx(-0.215), 0.15, TEAL);
    rubberPost(mx(-0.215), 0.32, TEAL);
    b.rod(P(mx(-0.197), 0.312, 0.02), P(mx(-0.13), 0.348, 0.02), 0.0035, CHROME, { sides: 6 });
    dot(mx(-0.2275), 0.22, 0.01, ORANGE, 1);
    dot(mx(-0.165), 0.335, 0.007, YELLOW, 0.9);
  }

  // flippers
  const FL: Outline = [[0, -0.018], [0.07, -0.008], [0.078, 0], [0.07, 0.008], [0, 0.018], [-0.016, 0]];
  const FLCAP: Outline = [[0.012, -0.0045], [0.068, -0.003], [0.073, 0], [0.068, 0.003], [0.012, 0.0045]];
  const flippers: [number, number, number][] = [
    [CX - 0.095, 0.375, -28],
    [CX + 0.095, 0.375, 208],
  ];
  flippers.forEach(([x, z, rot]) => {
    ext(FL, x, z, 0.004, 0.016, CREAM, { rot, smoothing: 1 });
    ext(FLCAP, x, z, 0.02, 0.002, ORANGE, { rot });
    pf(cyl(0.0125, 0.0125, 0.004, 12), CHROME, x, z, 0.0225);
    pf(cyl(0.006, 0.006, 0.003, 8), RED, x, z, 0.0262);
  });
  // balls: one on the left flipper, one at the plunger
  pf(sph(0.0135, 12, 8), BALLC, -0.0759, 0.3985, 0.0335);
  pf(sph(0.0135, 12, 8), BALLC, 0.2265, 0.4285, 0.0135);

  // posts near the top
  rubberPost(-0.205, -0.3);
  rubberPost(CX + 0.12, -0.3, TEAL);
  rubberPost(-0.13, -0.24, YELLOW);

  // inserts: stars and circles
  starIns(CX, 0.215, 0.026, YELLOW, 1);
  starIns(CX - 0.07, 0.17, 0.013, ORANGE, 0.9);
  starIns(CX + 0.07, 0.17, 0.013, TEAL, 0.9);
  dot(CX, 0.115, 0.012, MAG, 0.9);
  dot(CX - 0.04, 0.13, 0.008, YELLOW, 0.9);
  dot(CX + 0.04, 0.13, 0.008, YELLOW, 0.9);

  // plunger with spring
  const PX = 0.2265;
  b.rod(P(PX, 0.4435, 0.0135), P(PX, 0.62, 0.0135), 0.004, CHROME, { sides: 8 });
  pf(cyl(0.0085, 0.0085, 0.012, 10), CHROME, PX, 0.4495, 0.0135, { lq: rx(90) });
  b.sweep(coil(P(PX, 0.465, 0.0135), P(PX, 0.5, 0.0135), 0.0065, 7), 0.0011, { color: CHROME, sides: 5 });
  pf(cyl(0.014, 0.014, 0.004, 10), CHROME, PX, 0.532, 0.0135, { lq: rx(90) });
  pf(cyl(0.01, 0.01, 0.02, 10), ORANGE, PX, 0.598, 0.0135, { lq: rx(90) });
  pf(sph(0.0185, 12, 8), RED, PX, 0.64, 0.0135);

  // instruction cards
  pf(new THREE.PlaneGeometry(0.075, 0.047), "#ffffff", -0.13, 0.487, 0.026, { lq: rx(-12), texture: T_CARD1 });
  pf(new THREE.PlaneGeometry(0.075, 0.047), "#ffffff", 0.082, 0.487, 0.026, { lq: rx(-12), texture: T_CARD2 });

  // =============================================================================================================
  // BACKBOX (upright, behind the cabinet)
  const BBY = 0.99;
  const BBF = -0.52; // front face z
  const BBC = -0.635; // centre z

  b.extrude(
    [[-0.29, 0], [0.29, 0], [0.29, 0.62], [0.2, 0.74], [-0.2, 0.74], [-0.29, 0.62]],
    { at: [0, BBY, BBC], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.23, color: NAVY },
  );
  // neck and hinge
  b.part(box(0.4, 0.2, 0.16), NAVY, { at: [0, 0.9, -0.62] });
  for (const s of [1, -1]) b.part(cyl(0.012, 0.012, 0.03, 8), CHROME, { at: [s * 0.15, 0.9, -0.535], rotation: [90, 0, 0] });

  // translite
  glow(b.part(new THREE.PlaneGeometry(0.44, 0.66), "#ffffff", { at: [0, BBY + 0.37, BBF + 0.004], texture: T_BG }), 0.9);
  // side columns, trims
  for (const s of [1, -1]) {
    b.part(box(0.07, 0.66, 0.012), ORANGE, { at: [s * 0.255, BBY + 0.37, BBF] });
    b.part(box(0.012, 0.66, 0.013), TEAL, { at: [s * 0.226, BBY + 0.37, BBF] });
    b.rod([s * 0.222, BBY + 0.04, BBF + 0.005], [s * 0.222, BBY + 0.7, BBF + 0.005], 0.004, CHROME, { sides: 6 });
  }
  b.rod([-0.222, BBY + 0.04, BBF + 0.005], [0.222, BBY + 0.04, BBF + 0.005], 0.004, CHROME, { sides: 6 });
  b.rod([-0.222, BBY + 0.7, BBF + 0.005], [0.222, BBY + 0.7, BBF + 0.005], 0.004, CHROME, { sides: 6 });
  b.part(box(0.58, 0.04, 0.014), CHROME, { at: [0, BBY + 0.02, BBF] });
  b.part(box(0.42, 0.01, 0.014), TEAL, { at: [0, BBY + 0.045, BBF] });

  // chaser bulbs
  const bulbs: [number, number][] = [];
  for (let i = 0; i < 9; i++) bulbs.push([-0.18 + 0.045 * i, 0.72]);
  for (let i = 0; i < 6; i++) for (const sx of [1, -1]) bulbs.push([sx * 0.255, 0.1 + 0.1 * i]);
  bulbs.forEach(([x, y], i) =>
    glow(b.part(sph(0.0085, 6, 4), [YELLOW, WHITE, ORANGE][i % 3], { at: [x, BBY + y, BBF - 0.001] }), 1.2),
  );

  // dome crown
  const dome: Outline = [];
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI - (i * Math.PI) / 10;
    dome.push([0.2 * Math.cos(a), 0.09 * Math.sin(a)]);
  }
  b.extrude(dome, { at: [0, BBY + 0.739, BBC], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.2, color: ORANGE });
  glow(b.part(box(0.2, 0.026, 0.01), TEAL, { at: [0, BBY + 0.76, BBF + 0.0 - 0.0] }), 0.9);

  // atom beacon
  const AC = new THREE.Vector3(0, BBY + 0.9, BBC);
  b.rod([0, BBY + 0.82, BBC], [0, BBY + 0.87, BBC], 0.008, CHROME, { sides: 8 });
  glow(b.part(sph(0.03, 10, 7), YELLOW, { at: AC }), 1.6);
  [0, 60, 120].forEach((deg) => {
    b.part(new THREE.TorusGeometry(0.068, 0.0045, 6, 22), CHROME, { at: AC, rotation: [0, deg, 0] });
    const e = new THREE.Vector3(0.068 * Math.cos(deg * 0.05 + 0.6), 0.068 * Math.sin(deg * 0.05 + 0.6), 0);
    e.applyAxisAngle(AY, deg * D2R).add(AC);
    glow(b.part(sph(0.011, 6, 4), ORANGE, { at: e }), 1.4);
  });

  // rocket fins
  for (const s of [1, -1]) {
    b.extrude(
      [[0, -0.02], [0.13, 0.02], [0.12, 0.07], [0.05, 0.28], [0, 0.42]],
      { at: [s * 0.29, BBY, -0.6], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.04, color: ORANGE },
    );
    b.extrude(
      [[0.01, 0.0], [0.1, 0.03], [0.095, 0.06], [0.04, 0.22], [0.01, 0.3]],
      { at: [s * 0.29, BBY, -0.6], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.046, color: TEAL },
    );
    b.part(sph(0.008, 6, 4), YELLOW, { at: [s * 0.4, BBY + 0.025, -0.6] });
  }

  // speaker grille / rear detail on the top of the neck
  for (let i = 0; i < 5; i++) b.part(box(0.2, 0.006, 0.004), STEELD, { at: [0, 0.84 + i * 0.022, -0.699] });

  return b.root;
}
