```ts
import * as THREE from "three";
import { createBuilder, catmull, mix, paint, smoothstep, svg, DEG } from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { gearTrain, metal, TINT } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Jewelled Egg with Automaton",
  description:
    "A Faberge-style guilloche enamel egg on a gilt stand, ribbed in gold and set with rubies, emeralds and pearls. Its hinged lid is thrown open to reveal a tiny clockwork ballerina on a geared clock-dial turntable, with a winding key at its side.",
};

// ---------------------------------------------------------------------------------------------------------------
// Egg geometry (meters). The egg is a lathe profile that is slightly narrower toward the top.
const A = 0.047; // half width
const B = 0.066; // half height
const E = 0.1; // egg-ness (pointier top)
const BOT = 0.047; // lowest point of the egg
const Y0 = BOT + B; // egg centre height
const WALL = 0.0025;
const C_CUT = 0.1;
const TC = Math.acos(C_CUT); // polar angle of the seam (0 = top, PI = bottom)
const TOPY = Y0 + B;

const eggR = (t: number, off = 0) => {
  const r = (A - off) * Math.sin(t) * (1 - E * Math.cos(t));
  return r < 1e-7 ? 0 : r;
};
const eggY = (t: number, off = 0) => Y0 + (B - off) * Math.cos(t);
const CUT_Y = eggY(TC);
const RC = eggR(TC);

/** Point on the egg at polar angle t, azimuth az (0 = front, +PI/2 = the model's left), inward offset off. */
const eggP = (t: number, az: number, off = 0) =>
  new THREE.Vector3(eggR(t, off) * Math.sin(az), eggY(t, off), eggR(t, off) * Math.cos(az));

/** Outward surface normal of the egg. */
function eggN(t: number, az: number) {
  const e = 1e-4;
  const dr = eggR(t + e) - eggR(t - e);
  const dy = eggY(t + e) - eggY(t - e);
  let nr = -dy;
  let ny = dr;
  const l = Math.hypot(nr, ny) || 1;
  nr /= l;
  ny /= l;
  return new THREE.Vector3(nr * Math.sin(az), ny, nr * Math.cos(az));
}

/** Lathe loop of a shell: first curve from tS to tE at offset offFirst, then back along offSecond. */
function outline(tS: number, tE: number, offFirst: number, offSecond: number, steps = 10): [number, number][] {
  const out: [number, number][] = [];
  for (let k = 0; k <= steps; k++) {
    const t = tS + ((tE - tS) * k) / steps;
    out.push([eggR(t, offFirst), eggY(t, offFirst)]);
  }
  for (let k = steps; k >= 0; k--) {
    const t = tS + ((tE - tS) * k) / steps;
    out.push([eggR(t, offSecond), eggY(t, offSecond)]);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// Palette
const GOLD = metal("gilt", { polish: 0.55, tarnish: 0.05, size: 0.03 });
const PEARL = "#f4ece0";
const RUBY = "#c4122f";
const EMERALD = "#12924f";
const DIAMOND = "#e6f4ff";
const SAPPHIRE = "#2a58d0";
const PORCELAIN = "#f7dcc9";
const HAIR = "#5a2e1c";
const SATIN = "#f2b6c4";
const NAVY = "#0f1c4a";
const BLUE_RING = "#1f45b0";

/** Guilloche enamel: woven engine-turned waves round a lathe, lit and shaded by normal. */
function guilloche(deep: string, midc: string, light: string, freq = 18, amp = 2.2) {
  return paint((_p, n, s) => {
    const a = s[1] * DEG;
    const w = Math.sin(s[0] * 170) * amp;
    const v = Math.max(Math.sin(a * freq + w), Math.sin(a * freq - w + 2.2)) * 0.5 + 0.5;
    let c = mix(deep, midc, smoothstep(0.15, 0.85, v));
    c = mix(c, light, 0.55 * smoothstep(0.82, 1, v) * (0.4 + 0.6 * smoothstep(-0.3, 0.9, n.y)));
    c = mix(c, deep, 0.35 * smoothstep(0.1, -0.8, n.y));
    return c;
  });
}
const BLUE_ENAMEL = guilloche("#0a2272", "#1c4cb4", "#7ea8ee");
const ROSE_ENAMEL = guilloche("#a02048", "#e0507a", "#ffb6c8", 12, 1.6);

const SILK = paint((_p, _n, s) => {
  const pleat = 0.5 + 0.5 * Math.sin(s[1] * DEG * 14);
  let c = mix("#e6c993", "#fff3d6", pleat);
  c = mix(c, "#d4aa62", 0.2 * (1 - pleat));
  if (pleat > 0.96 && Math.sin(s[0] * 190) > 0.9) c = mix(c, "#d9a63a", 0.9);
  return c;
});

const TUTU = paint((p, n, _s) => {
  const r = Math.hypot(p.x, p.z);
  const a = Math.atan2(p.x, p.z);
  const pl = 0.5 + 0.5 * Math.sin(a * 16);
  let c = mix("#fffaf6", "#f6d9e0", pl * 0.6);
  c = mix(c, "#ee86a3", 0.85 * smoothstep(0.0165, 0.0225, r));
  c = mix(c, "#d4b8c0", 0.3 * smoothstep(0.2, -0.8, n.y));
  return c;
});

// ---------------------------------------------------------------------------------------------------------------
// Textures
const roseSvg = (cx: number, cy: number, r: number, c1: string, c2: string) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c1}" stroke="${c2}" stroke-width="0.8"/>` +
  `<circle cx="${cx}" cy="${cy}" r="${r * 0.62}" fill="none" stroke="${c2}" stroke-width="0.8"/>` +
  `<path d="M${cx - r * 0.3} ${cy} Q${cx} ${cy - r * 0.45} ${cx + r * 0.3} ${cy} Q${cx} ${cy + r * 0.25} ${cx - r * 0.15} ${cy + r * 0.1}" fill="none" stroke="${c2}" stroke-width="0.7"/>`;

function miniatureSvg() {
  let beads = "";
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2;
    beads += `<circle cx="${(30 + 28 * Math.cos(a)).toFixed(2)}" cy="${(36 + 34 * Math.sin(a)).toFixed(2)}" r="1.2" fill="#fffaf0" stroke="#b88a22" stroke-width="0.5"/>`;
  }
  let leaves = "";
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3;
    const cx = 30 + 15 * Math.cos(a);
    const cy = 38 + 16 * Math.sin(a);
    leaves += `<ellipse cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" rx="9" ry="3.4" transform="rotate(${((a * 180) / Math.PI).toFixed(1)} ${cx.toFixed(2)} ${cy.toFixed(2)})" fill="#3f7f4b" stroke="#24502c" stroke-width="0.6"/>`;
  }
  return svg(
    `<svg viewBox="0 0 60 72" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="36" rx="29.5" ry="35.5" fill="#d9a63a"/>
      <ellipse cx="30" cy="36" rx="26.5" ry="32.5" fill="#fbf0d4"/>
      <ellipse cx="30" cy="36" rx="25" ry="31" fill="none" stroke="#b88a22" stroke-width="0.9"/>
      ${beads}${leaves}
      ${roseSvg(24, 31, 9, "#e8607f", "#9c2040")}
      ${roseSvg(38, 38, 7.5, "#d9455f", "#8a1a38")}
      ${roseSvg(28, 47, 6.5, "#f3a6b8", "#b8506a")}
      <circle cx="40" cy="26" r="2" fill="#6a8fe0"/><circle cx="15" cy="44" r="2" fill="#6a8fe0"/><circle cx="44" cy="48" r="1.7" fill="#6a8fe0"/>
      <path d="M30 58 Q22 54 18 60 Q24 62 30 60 Q36 62 42 60 Q38 54 30 58Z" fill="#3b63c4" stroke="#1f3a80" stroke-width="0.7"/>
    </svg>`,
    { size: 384 },
  );
}

function crownSvg() {
  let pearls = "";
  for (let i = 0; i < 5; i++) pearls += `<circle cx="${17 + i * 6.5}" cy="${i === 2 ? 15 : i % 2 ? 19 : 23}" r="1.8" fill="#fff6e0"/>`;
  return svg(
    `<svg viewBox="0 0 60 72" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="36" rx="29.5" ry="35.5" fill="#d9a63a"/>
      <ellipse cx="30" cy="36" rx="26" ry="32" fill="#7d1226"/>
      <ellipse cx="30" cy="36" rx="24" ry="30" fill="none" stroke="#e8c060" stroke-width="0.8"/>
      <path d="M16 38 L16 30 Q30 8 44 30 L44 38Z" fill="#e8b84a" stroke="#fff0b0" stroke-width="0.8"/>
      <path d="M16 30 Q30 18 44 30" fill="none" stroke="#9a6a16" stroke-width="1"/>
      <rect x="14" y="37" width="32" height="6" rx="1.5" fill="#f0c455" stroke="#9a6a16" stroke-width="0.8"/>
      <circle cx="22" cy="40" r="1.7" fill="#2a58d0"/><circle cx="30" cy="40" r="1.9" fill="#12924f"/><circle cx="38" cy="40" r="1.7" fill="#2a58d0"/>
      ${pearls}
      <rect x="28.8" y="5" width="2.4" height="9" fill="#f0c455"/><rect x="26" y="8" width="8" height="2.2" fill="#f0c455"/>
      <text x="30" y="58" text-anchor="middle" font-family="serif" font-weight="bold" font-size="9" fill="#f0c455">1912</text>
    </svg>`,
    { size: 320 },
  );
}

function wreathSvg() {
  let leaves = "";
  for (const side of [-1, 1]) {
    for (let i = 0; i < 12; i++) {
      const phi = ((12 + i * 12) * Math.PI) / 180;
      const x = 50 + side * 37 * Math.sin(phi);
      const y = 50 + 37 * Math.cos(phi);
      const rot = (Math.atan2(-Math.sin(phi), side * Math.cos(phi)) * 180) / Math.PI;
      for (const splay of [-28, 28])
        leaves += `<ellipse cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="7.5" ry="2.7" transform="rotate(${(rot + splay).toFixed(1)} ${x.toFixed(2)} ${y.toFixed(2)})" fill="${splay < 0 ? "#e3b04b" : "#c8902a"}" stroke="#8a5e12" stroke-width="0.5"/>`;
    }
  }
  let rays = "";
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    rays += `<path d="M50 50 L${(50 + 25 * Math.cos(a)).toFixed(2)} ${(50 + 25 * Math.sin(a)).toFixed(2)}" stroke="#e3b04b" stroke-width="${i % 2 ? 1 : 1.8}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      ${leaves}${rays}
      <circle cx="50" cy="50" r="12" fill="#a01a34" stroke="#e3b04b" stroke-width="2"/>
      <path d="M50 40 L52.6 47.2 L60 47.6 L54 52.2 L56.2 59.6 L50 55.4 L43.8 59.6 L46 52.2 L40 47.6 L47.4 47.2Z" fill="#fff0b0" stroke="#b88a22" stroke-width="0.6"/>
      <path d="M50 88 Q40 80 34 90 Q42 94 50 90 Q58 94 66 90 Q60 80 50 88Z" fill="#e3b04b" stroke="#8a5e12" stroke-width="0.7"/>
    </svg>`,
    { size: 512 },
  );
}

function faceSvg() {
  const eye = (cx: number) =>
    `<ellipse cx="${cx}" cy="18" rx="3.6" ry="4.3" fill="#ffffff" stroke="#3a2220" stroke-width="1"/>` +
    `<circle cx="${cx}" cy="18.6" r="2.7" fill="#4a78c8"/><circle cx="${cx}" cy="18.8" r="1.4" fill="#1a1a2a"/>` +
    `<circle cx="${cx - 1}" cy="17.4" r="0.9" fill="#ffffff"/>`;
  return svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 11 Q12 7 17 10" fill="none" stroke="#5a2e1c" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M23 10 Q28 7 33 11" fill="none" stroke="#5a2e1c" stroke-width="1.5" stroke-linecap="round"/>
      ${eye(12)}${eye(28)}
      <path d="M8 15 Q6 13 5 12 M32 15 Q34 13 35 12" fill="none" stroke="#3a2220" stroke-width="1.2" stroke-linecap="round"/>
      <ellipse cx="7" cy="27" rx="4.2" ry="2.6" fill="#f3a0ae"/><ellipse cx="33" cy="27" rx="4.2" ry="2.6" fill="#f3a0ae"/>
      <path d="M19 24 Q20 26 21 24" fill="none" stroke="#c98a78" stroke-width="1"/>
      <path d="M15.5 31 Q20 35 24.5 31 Q20 32.6 15.5 31Z" fill="#c4344e" stroke="#9a2038" stroke-width="0.8"/>
    </svg>`,
    { size: 256 },
  );
}

function dialSvg() {
  const nums = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  let rays = "";
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    rays += `<path d="M${(100 + 22 * Math.cos(a)).toFixed(2)} ${(100 + 22 * Math.sin(a)).toFixed(2)} L${(100 + 66 * Math.cos(a)).toFixed(2)} ${(100 + 66 * Math.sin(a)).toFixed(2)}" stroke="#d9a63a" stroke-width="${i % 4 ? 0.7 : 1.4}"/>`;
  }
  let ticks = "";
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    ticks += `<path d="M${(100 + 91 * Math.cos(a)).toFixed(2)} ${(100 + 91 * Math.sin(a)).toFixed(2)} L${(100 + 95 * Math.cos(a)).toFixed(2)} ${(100 + 95 * Math.sin(a)).toFixed(2)}" stroke="#f0c455" stroke-width="${i % 5 ? 0.7 : 1.6}"/>`;
  }
  let text = "";
  nums.forEach((nm, i) => {
    const ang = i * 30;
    const a = (ang * Math.PI) / 180;
    const x = 100 + 80 * Math.sin(a);
    const y = 100 - 80 * Math.cos(a);
    text += `<text x="${x.toFixed(2)}" y="${(y + 4).toFixed(2)}" text-anchor="middle" font-family="serif" font-weight="bold" font-size="12" fill="#f0c455" transform="rotate(${ang} ${x.toFixed(2)} ${y.toFixed(2)})">${nm}</text>`;
  });
  return svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="99" fill="#101d4a"/>
      <circle cx="100" cy="100" r="97" fill="none" stroke="#e3b04b" stroke-width="2.5"/>
      <circle cx="100" cy="100" r="68" fill="none" stroke="#e3b04b" stroke-width="1.5"/>
      <circle cx="100" cy="100" r="89" fill="none" stroke="#e3b04b" stroke-width="1"/>
      ${rays}${ticks}${text}
    </svg>`,
    { size: 512 },
  );
}

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "faberge-egg-automaton", paintSize: 2048 });

  const MINIATURE = miniatureSvg();
  const CROWN = crownSvg();
  const WREATH = wreathSvg();
  const FACE = faceSvg();
  const DIAL = dialSvg();

  const base = b.joint("base", { at: [0, 0.02, 0], dir: [0, 1, 0] });
  const lid = b.joint("lid", { parent: base, at: [0, CUT_Y, -RC], dir: [0, 0, 1], role: "hinge" });

  // --- helpers -----------------------------------------------------------------------------------------------
  const gem = (bone: Joint, p: THREE.Vector3, n: THREE.Vector3, size: number, stone: string, cab: boolean, glowK = 0) => {
    b.part(new THREE.CylinderGeometry(size * 1.25, size * 1.4, size * 0.5, 8), GOLD, {
      bone,
      at: p.clone().addScaledVector(n, size * 0.05),
      dir: n,
    });
    const g = cab ? new THREE.SphereGeometry(size, 8, 5) : new THREE.OctahedronGeometry(size * 1.05, 0);
    const part = b.part(g, stone, {
      bone,
      at: p.clone().addScaledVector(n, size * 0.4),
      dir: n,
      scale: [1, cab ? 0.65 : 0.85, 1],
    });
    if (glowK > 0) glow(part, glowK);
    return part;
  };
  const pearl = (bone: Joint, p: THREE.Vector3, r = 0.0016) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), PEARL, { bone, at: p });

  const band = (bone: Joint, t: number, tube: number) => {
    const n = eggN(t, 0);
    const r = eggR(t) + n.z * tube * 0.4;
    const y = eggY(t) + n.y * tube * 0.4;
    b.part(new THREE.TorusGeometry(r, tube, 5, 36), GOLD, { bone, at: [0, y, 0], dir: [0, 1, 0], axis: "z" });
  };

  const rib = (bone: Joint, az: number, t0: number, t1: number) => {
    const pts: THREE.Vector3[] = [];
    const n = 9;
    for (let k = 0; k <= n; k++) pts.push(eggP(t0 + ((t1 - t0) * k) / n, az, -0.0004));
    b.sweep(catmull(pts), () => [0.0021, 0.0008], {
      color: GOLD,
      bone,
      up: [Math.sin(az), 0, Math.cos(az)],
      sides: 6,
    });
  };

  // --- stand -------------------------------------------------------------------------------------------------
  let rr = 0;
  for (let t = Math.PI; t > 2; t -= 0.002) if (eggY(t) >= BOT + 0.0065) { rr = eggR(t); break; }
  rr -= 0.0004;
  b.lathe(
    [
      [0, 0],
      [0.0505, 0],
      [0.0555, 0.0028],
      [0.0545, 0.0058],
      [0.047, 0.0085],
      [0.03, 0.0115],
      [0.015, 0.016],
      [0.01, 0.0215],
      [0.014, 0.0262],
      [0.0105, 0.031],
      [0.0125, 0.0355],
      [0.01, 0.0405],
      [0, 0.0405],
    ],
    { at: [0, 0, 0], bone: base, segments: 20, color: GOLD, name: "standBase" },
  );
  b.lathe(
    [
      [0, 0.04],
      [0.01, 0.04],
      [0.018, 0.0425],
      [0.027, 0.049],
      [rr + 0.0062, 0.0535],
      [rr, 0.0535],
      [rr - 0.0025, 0.049],
      [0.012, 0.0455],
      [0, 0.045],
    ],
    { at: [0, 0, 0], bone: base, segments: 20, color: GOLD, name: "standBowl" },
  );
  b.part(new THREE.TorusGeometry(0.0415, 0.0017, 5, 32), BLUE_RING, { bone: base, at: [0, 0.0098, 0], dir: [0, 1, 0], axis: "z" });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    pearl(base, new THREE.Vector3(0.0345 * Math.sin(a), 0.0113, 0.0345 * Math.cos(a)));
  }
  for (let i = 0; i < 4; i++) {
    const az = (45 + 90 * i) * DEG;
    const prof: [number, number][] = [
      [0.047, 0.011],
      [0.0545, 0.022],
      [0.0455, 0.034],
      [0.031, 0.0425],
      [0.0275, 0.0488],
    ];
    const pts = prof.map(([r, y]) => new THREE.Vector3(r * Math.sin(az), y, r * Math.cos(az)));
    b.sweep(catmull(pts), [0.0036, 0.0022, 0.0018, 0.0024], { color: GOLD, bone: base, sides: 8 });
    b.part(new THREE.SphereGeometry(0.0046, 8, 6), GOLD, { bone: base, at: pts[0] });
    b.part(new THREE.SphereGeometry(0.0034, 8, 6), GOLD, { bone: base, at: pts[4] });
    const lf = pts[2].clone();
    gem(base, lf, new THREE.Vector3(Math.sin(az), 0.3, Math.cos(az)).normalize(), 0.0022, i % 2 ? EMERALD : RUBY, true);
  }

  // --- lower shell -------------------------------------------------------------------------------------------
  const lowerShell = b.lathe(outline(Math.PI, TC, 0, WALL), {
    at: [0, 0, 0],
    bone: base,
    segments: 28,
    color: BLUE_ENAMEL,
    name: "eggLower",
  });
  b.lathe(outline(Math.PI, TC + 0.07, WALL + 0.0004, WALL + 0.0012), {
    at: [0, 0, 0],
    bone: base,
    segments: 28,
    color: SILK,
    name: "liningLower",
  });
  b.part(new THREE.TorusGeometry(RC - 0.0012, 0.0017, 5, 36), GOLD, { bone: base, at: [0, CUT_Y, 0], dir: [0, 1, 0], axis: "z" });

  for (let i = 0; i < 8; i++) rib(base, (22.5 + 45 * i) * DEG, 2.64, TC);
  band(base, 2.58, 0.0016);
  for (let i = 0; i < 8; i++) {
    const az = (22.5 + 45 * i) * DEG;
    gem(base, eggP(2.0, az, -0.0004), eggN(2.0, az), 0.0027, i % 2 ? EMERALD : RUBY, true, i % 2 ? 0.2 : 0.35);
    const dz = (45 * i) * DEG;
    gem(base, eggP(2.58, dz, -0.0016), eggN(2.58, dz), 0.0015, DIAMOND, false);
  }
  for (let i = 0; i < 24; i++) pearl(base, eggP(1.51, i * 15 * DEG, -0.0008));
  b.decal(lowerShell, MINIATURE, {
    at: eggP(2.0, 0, -0.0005),
    dir: [0, 0, 1],
    size: [0.026, 0.031],
    segments: 12,
    lift: 0.0012,
  });
  // clasp
  b.part(new THREE.BoxGeometry(0.009, 0.011, 0.0016), GOLD, { bone: base, at: [0, CUT_Y - 0.0058, eggR(1.54) + 0.0007] });
  gem(base, new THREE.Vector3(0, CUT_Y - 0.0062, eggR(1.54) + 0.0014), new THREE.Vector3(0, 0, 1), 0.0022, RUBY, true, 0.4);

  // --- deck, dial and gear train --------------------------------------------------------------------------------
  const DECK_TOP = 0.093;
  b.part(new THREE.CylinderGeometry(0.0445, 0.0445, 0.007, 28), GOLD, { bone: base, at: [0, DECK_TOP - 0.0035, 0] });
  b.part(new THREE.CircleGeometry(0.0445, 36), "#ffffff", {
    bone: base,
    at: [0, DECK_TOP + 0.0004, 0],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: DIAL,
  });
  b.part(new THREE.TorusGeometry(0.0445, 0.0015, 5, 36), GOLD, { bone: base, at: [0, DECK_TOP, 0], dir: [0, 1, 0], axis: "z" });

  const drive = gearTrain(b, {
    at: [0, DECK_TOP + 0.0019, 0],
    axis: [0, 1, 0],
    module: 0.0014,
    spin: "gear",
    bone: base,
    group: "clockwork",
    gears: [
      { teeth: 20, spokes: 4, bore: 0.0012, name: "turntable" },
      { teeth: 12, angle: 70, bore: 0.001, color: metal("copper") },
      { teeth: 14, from: 0, angle: -105, bore: 0.001 },
      { teeth: 16, on: 1, shift: 0.0042, texture: true, color: TINT.gilt },
    ],
  });
  const T = drive.gears[0].joint!;

  // --- the automaton: a tiny clockwork ballerina ----------------------------------------------------------------
  const gearTop = DECK_TOP + 0.0033;
  const D = gearTop + 0.0024;
  b.part(new THREE.CylinderGeometry(0.0092, 0.0102, 0.0024, 12), GOLD, { bone: T, at: [0, gearTop + 0.0012, 0] });

  for (const s of [1, -1]) {
    b.rod([s * 0.0028, D + 0.0045, 0], [s * 0.003, D + 0.0235, 0], [0.0011, 0.0017], { color: "#fbe7e0", bone: T });
    b.spike([s * 0.0028, D + 0.0054, 0.0002], [0, -1, 0.15], 0.0056, 0.0017, { color: SATIN, bone: T });
  }
  // tutu
  b.lathe(
    [
      [0, D + 0.0215],
      [0.006, D + 0.0215],
      [0.0165, D + 0.019],
      [0.023, D + 0.016],
      [0.023, D + 0.0167],
      [0.0175, D + 0.02],
      [0.006, D + 0.0225],
      [0, D + 0.0225],
    ],
    { at: [0, 0, 0], bone: T, segments: 18, color: TUTU, name: "tutuLow" },
  );
  b.lathe(
    [
      [0, D + 0.0243],
      [0.0048, D + 0.0243],
      [0.0145, D + 0.0224],
      [0.0195, D + 0.0208],
      [0.0195, D + 0.0215],
      [0.015, D + 0.024],
      [0.0048, D + 0.0262],
      [0, D + 0.0262],
    ],
    { at: [0, 0, 0], bone: T, segments: 18, color: TUTU, name: "tutuHigh" },
  );
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.0007, 5, 4), GOLD, { bone: T, at: [0.0197 * Math.sin(a), D + 0.0213, 0.0197 * Math.cos(a)] });
  }
  // bodice
  b.lathe(
    [
      [0, D + 0.0262],
      [0.0046, D + 0.0262],
      [0.0043, D + 0.0285],
      [0.0058, D + 0.0338],
      [0.005, D + 0.0385],
      [0.0028, D + 0.0392],
      [0, D + 0.0392],
    ],
    { at: [0, 0, 0], bone: T, segments: 10, color: ROSE_ENAMEL, name: "bodice" },
  );
  b.part(new THREE.TorusGeometry(0.0045, 0.0006, 4, 12), GOLD, { bone: T, at: [0, D + 0.0272, 0], dir: [0, 1, 0], axis: "z" });
  glow(
    b.part(new THREE.OctahedronGeometry(0.0013, 0), RUBY, { bone: T, at: [0, D + 0.0345, 0.0058], scale: [1, 1.2, 0.7] }),
    0.5,
  );
  // neck and head
  b.rod([0, D + 0.0375, 0], [0, D + 0.0445, 0], 0.0018, { color: PORCELAIN, bone: T });
  const HC = new THREE.Vector3(0, D + 0.051, 0.0004);
  const head = b.part(new THREE.SphereGeometry(0.0072, 10, 8), PORCELAIN, { bone: T, at: HC, scale: [0.95, 1.08, 1] });
  b.decal(head, FACE, { at: [0, D + 0.0505, 0.0078], dir: [0, 0, 1], size: [0.0108, 0.0108], segments: 8, lift: 0.0003 });
  b.part(new THREE.SphereGeometry(0.0079, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), HAIR, {
    bone: T,
    at: HC,
    dir: [0, 0.88, -0.48],
  });
  b.part(new THREE.SphereGeometry(0.0036, 7, 5), HAIR, { bone: T, at: [0, D + 0.0588, -0.0056] });
  const tiaraPts: THREE.Vector3[] = [];
  for (const phi of [-52, -26, 0, 26, 52]) {
    const R = 0.0083;
    const a = phi * DEG;
    tiaraPts.push(new THREE.Vector3(R * Math.cos(30 * DEG) * Math.sin(a), HC.y + R * Math.sin(30 * DEG), HC.z + R * Math.cos(30 * DEG) * Math.cos(a)));
  }
  b.sweep(catmull(tiaraPts), 0.0006, { color: GOLD, bone: T, sides: 5 });
  b.spike(tiaraPts[2], [0, 1, 0.25], 0.0028, 0.001, { color: GOLD, bone: T });
  glow(b.part(new THREE.SphereGeometry(0.0009, 6, 4), RUBY, { bone: T, at: tiaraPts[2].clone().add(new THREE.Vector3(0, 0.0004, 0.0004)) }), 0.5);
  // winding key on its back
  b.rod([0, D + 0.0325, -0.005], [0, D + 0.0325, -0.0097], 0.0006, { color: GOLD, bone: T });
  b.part(new THREE.TorusGeometry(0.0022, 0.0007, 5, 10), GOLD, { bone: T, at: [0, D + 0.0325, -0.0107] });
  // arms in fifth position
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = [
      new THREE.Vector3(s * 0.0058, D + 0.0385, 0),
      new THREE.Vector3(s * 0.0115, D + 0.0455, 0.0008),
      new THREE.Vector3(s * 0.0075, D + 0.056, 0.0012),
      new THREE.Vector3(s * 0.002, D + 0.0625, 0.001),
    ];
    const arm = b.chain(`arm${side}`, catmull(pts), {
      parent: T,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.0018, 0.0014, 0.0012, 0.0011], { color: PORCELAIN, sides: 6 });
    b.part(new THREE.SphereGeometry(0.0014, 6, 4), PORCELAIN, { bone: arm.tip!, at: pts[3] });
    b.part(new THREE.SphereGeometry(0.0029, 7, 5), ROSE_ENAMEL, { bone: arm.joints[0], at: pts[0] });
    const cuff = arm.at(0.9);
    b.part(new THREE.TorusGeometry(0.0013, 0.0004, 4, 8), GOLD, { bone: cuff.bone, at: cuff.at, dir: cuff.tangent, axis: "z" });
  }

  // --- lid -----------------------------------------------------------------------------------------------------
  const lidShell = b.lathe(outline(0, TC, WALL, 0), {
    at: [0, 0, 0],
    bone: lid,
    segments: 28,
    color: BLUE_ENAMEL,
    name: "eggLid",
  });
  const lidLining = b.lathe(outline(0, TC - 0.07, WALL + 0.0012, WALL + 0.0004), {
    at: [0, 0, 0],
    bone: lid,
    segments: 28,
    color: SILK,
    name: "liningLid",
  });
  b.part(new THREE.TorusGeometry(RC - 0.0012, 0.0017, 5, 36), GOLD, { bone: lid, at: [0, CUT_Y, 0], dir: [0, 1, 0], axis: "z" });
  for (let i = 0; i < 8; i++) rib(lid, (22.5 + 45 * i) * DEG, TC, 0.22);
  band(lid, 0.5, 0.0016);
  band(lid, 1.3, 0.0014);
  for (let i = 0; i < 8; i++) {
    const az = (22.5 + 45 * i) * DEG;
    gem(lid, eggP(0.98, az, -0.0004), eggN(0.98, az), 0.0027, i % 2 ? RUBY : EMERALD, true, i % 2 ? 0.35 : 0.2);
    const dz = 45 * i * DEG;
    gem(lid, eggP(0.5, dz, -0.0016), eggN(0.5, dz), 0.0014, DIAMOND, false);
    pearl(lid, eggP(0.26, dz, -0.0006));
  }
  for (let i = 0; i < 24; i++) pearl(lid, eggP(1.43, i * 15 * DEG, -0.0008));
  b.decal(lidShell, CROWN, {
    at: eggP(0.98, 0, -0.0005),
    dir: [0, 0, 1],
    size: [0.022, 0.027],
    segments: 12,
    lift: 0.0012,
  });
  b.part(new THREE.BoxGeometry(0.008, 0.0065, 0.0016), GOLD, { bone: lid, at: [0, CUT_Y + 0.0036, eggR(1.43) + 0.0007] });
  gem(lid, new THREE.Vector3(0, CUT_Y + 0.0038, eggR(1.43) + 0.0014), new THREE.Vector3(0, 0, 1), 0.0017, DIAMOND, false);
  // interior emblem on the silk lining (faces down while closed)
  b.decal(lidLining, WREATH, {
    at: [0, eggY(0, WALL + 0.0012) - 0.0008, 0],
    dir: [0, -1, 0],
    up: [0, 0, 1],
    size: [0.04, 0.04],
    segments: 12,
    lift: 0.0006,
  });
  // finial
  b.lathe(
    [
      [0, TOPY - 0.001],
      [0.0042, TOPY - 0.001],
      [0.0044, TOPY + 0.0006],
      [0.0025, TOPY + 0.0022],
      [0.0022, TOPY + 0.0045],
      [0.0042, TOPY + 0.0062],
      [0.003, TOPY + 0.0085],
      [0, TOPY + 0.0085],
    ],
    { at: [0, 0, 0], bone: lid, segments: 12, color: GOLD, name: "finial" },
  );
  glow(b.part(new THREE.SphereGeometry(0.0028, 8, 6), RUBY, { bone: lid, at: [0, TOPY + 0.0105, 0] }), 0.4);

  // --- hinge ---------------------------------------------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(0.0027, 0.0027, 0.013, 8), GOLD, { bone: lid, at: [0, CUT_Y, -RC - 0.0012], dir: [1, 0, 0] });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.0027, 0.0027, 0.0085, 8), GOLD, { bone: base, at: [s * 0.0108, CUT_Y, -RC - 0.0012], dir: [1, 0, 0] });
    b.part(new THREE.SphereGeometry(0.0031, 6, 4), GOLD, { bone: base, at: [s * 0.0153, CUT_Y, -RC - 0.0012] });
  }

  // --- winding key on the right side -------------------------------------------------------------------------------
  {
    const tk = 2.1;
    const az = -Math.PI / 2;
    const p = eggP(tk, az, -0.0003);
    const n = eggN(tk, az);
    const KEYM = metal("blued", { size: 0.02 });
    b.part(new THREE.CylinderGeometry(0.0045, 0.0048, 0.0012, 10), GOLD, { bone: base, at: p, dir: n });
    const e = p.clone().addScaledVector(n, 0.0165);
    b.rod(p.clone().addScaledVector(n, -0.003), e, 0.0011, { color: KEYM, bone: base });
    b.part(new THREE.SphereGeometry(0.0021, 6, 4), GOLD, { bone: base, at: p.clone().addScaledVector(n, 0.0075) });
    for (const sy of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.0036, 7, 5), KEYM, { bone: base, at: e.clone().add(new THREE.Vector3(0, sy * 0.0042, 0)), dir: n, scale: [1, 0.4, 1] });
    }
    b.rod(e.clone().add(new THREE.Vector3(0, -0.004, 0)), e.clone().add(new THREE.Vector3(0, 0.004, 0)), 0.0009, { color: GOLD, bone: base });
  }

  // --- final rest pose ------------------------------------------------------------------------------------------
  b.pose(lid, { axis: [1, 0, 0], deg: -112 });
  drive.spin(14);

  return b.root;
}
```