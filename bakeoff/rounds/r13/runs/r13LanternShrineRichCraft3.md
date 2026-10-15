```ts
import * as THREE from "three";
import { createBuilder, frame, rng, catmull, mix, noise, paint, smoothstep, grain, svg } from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Inazuma Roadside Shrine",
  description:
    "Cel-shaded roadside shrine in an anime-adventure style: vermilion torii with shimenawa and shide, glowing stone and paper lanterns, kitsune guardians, a small hokora with glowing shoji doors, offerings (fruit, mochi, sake, dango, sakaki), an ema rack, an omikuji line and purple Electro crystals.",
};

type V = [number, number, number];
type Out = [number, number][];
type Col = ColorInput;

const D2R = Math.PI / 180;
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const fract = (x: number) => x - Math.floor(x);

/** yaw about world Y applied after a local XYZ euler (degrees) */
const Q = (yaw = 0, rx = 0, ry = 0, rz = 0) => {
  const q = new THREE.Quaternion().setFromAxisAngle(Y_AXIS, yaw * D2R);
  return q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rx * D2R, ry * D2R, rz * D2R)));
};

/** a local frame on the ground: origin, yaw, uniform scale of local positions */
class Pose {
  constructor(
    public o: V,
    public yaw = 0,
    public k = 1,
  ) {}
  p(x: number, y: number, z: number): V {
    const v = new THREE.Vector3(x * this.k, y * this.k, z * this.k).applyAxisAngle(Y_AXIS, this.yaw * D2R);
    return [this.o[0] + v.x, this.o[1] + v.y, this.o[2] + v.z];
  }
  q(rx = 0, ry = 0, rz = 0) {
    return Q(this.yaw, rx, ry, rz);
  }
  get fwd(): V {
    const a = this.yaw * D2R;
    return [Math.sin(a), 0, Math.cos(a)];
  }
  get lat(): V {
    const a = this.yaw * D2R;
    return [Math.cos(a), 0, -Math.sin(a)];
  }
}

// ------------------------------------------------------------------------------------------------
// Paints (cel shaded, hue shifted shadows)

const celCache = new Map<string, Col>();
const C = (lit: string, shadow?: string): Col => {
  const key = lit + "|" + (shadow ?? "");
  let c = celCache.get(key);
  if (!c) {
    c = cel(lit, shadow);
    celCache.set(key, c);
  }
  return c;
};

const stonePaint = cel(
  paint((p, n) => {
    let c = mix("#8884a4", "#bcb9cf", smoothstep(0.25, 0.75, noise(p, 0.28, 11)));
    c = mix(c, "#6a6686", 0.35 * smoothstep(0.6, 0.85, noise(p, 0.09, 12)));
    const m =
      smoothstep(0.46, 0.62, noise(p, 0.16, 13)) * (0.25 + 0.75 * smoothstep(0.1, 0.9, n.y)) * smoothstep(1.4, 0.0, p.y);
    return mix(c, mix("#4f7d3c", "#82b052", noise(p, 0.05, 14)), Math.min(1, m * 1.2));
  }),
);
const redLac = cel(
  paint((p) => {
    const base = mix("#c8352c", "#ea5a3c", smoothstep(0.3, 0.8, noise(p, 0.6, 31)));
    return mix(base, "#7e1f2e", smoothstep(0.9, 0.0, p.y) * 0.5);
  }),
  "#8a2030",
);
const blackLac = cel(
  paint((p) => mix("#2b2944", "#4a4570", smoothstep(0.4, 0.85, noise(p, 0.3, 21)) * 0.55)),
  "#16142a",
);
const plaster = C("#f2e9d5", "#cbc0d8");
const woodDark = cel(grain("#6e4838", "#4e3029", { size: 0.04, axis: "x" }));
const woodPost = cel(grain("#6e4838", "#4e3029", { size: 0.04, axis: "y" }));
const woodLight = cel(grain("#d2a46c", "#b4864f", { size: 0.03, axis: "x" }));
const gold = metal("gilt", { polish: 0.5 });
const ceramic = C("#f7f3ea", "#c6c3e2");
const strawRope = (turns: number): Col =>
  cel(
    paint((_p, _n, s) => {
      const f = (((s[1] - 360 * turns * s[0]) % 360) + 360) % 360;
      return f < 170 ? "#e3d18e" : "#a68e55";
    }),
    "#7f6a40",
  );
const bellRope: Col = paint((_p, _n, s) => {
  const f = (((s[1] - 3240 * s[0]) % 360) + 360) % 360;
  return f < 180 ? "#d63a36" : "#f8f0e0";
});
const roofPaint = (lat: V): Col =>
  cel(
    paint((p, n) => {
      if (Math.abs(n.x * lat[0] + n.z * lat[2]) > 0.6) return "#f0e6d0";
      if (n.y < -0.4) return "#4b2f35";
      const across = p.x * lat[0] + p.z * lat[2];
      const k = Math.abs(fract(across / 0.11) - 0.5) * 2;
      return mix("#6470b8", "#363e7a", smoothstep(0.55, 0.95, k));
    }),
  );

// ------------------------------------------------------------------------------------------------
// Outlines

const beamOutline = (half: number, hc: number, he: number, lift: number, n = 16): Out => {
  const top: Out = [];
  const bot: Out = [];
  for (let i = 0; i <= n; i++) {
    const t = -1 + (2 * i) / n;
    const a = Math.abs(t);
    const l = lift * Math.pow(a, 2.6);
    top.push([half * t, l + hc - (hc - he) * a * a]);
    bot.push([half * t, l]);
  }
  return [...top, ...bot.reverse()];
};

const roofOutline = (back: number, front: number, hr: number, tip: number): Out => {
  const prof = (x: number) => {
    const u = x < 0 ? -x / back : x / front;
    return hr * Math.pow(1 - u, 1.45) + tip * Math.pow(u, 5);
  };
  const pts: Out = [];
  const nb = 8;
  const nf = 10;
  for (let i = 0; i <= nb; i++) {
    const x = -back + (back * i) / nb;
    pts.push([x, prof(x)]);
  }
  for (let i = 1; i <= nf; i++) {
    const x = (front * i) / nf;
    pts.push([x, prof(x)]);
  }
  pts.push([front, 0], [-back, 0]);
  return pts;
};

// ------------------------------------------------------------------------------------------------
// SVG drawings

const NS = 'xmlns="http://www.w3.org/2000/svg"';

const plaqueSvg = () =>
  svg(
    `<svg viewBox="0 0 124 84" ${NS}>
 <rect x="2" y="2" width="120" height="80" rx="7" fill="#241c42" stroke="#eab84a" stroke-width="4"/>
 <rect x="9" y="9" width="106" height="66" rx="4" fill="none" stroke="#9a66f5" stroke-width="1.8"/>
 <circle cx="62" cy="42" r="25" fill="#33286a" stroke="#eab84a" stroke-width="3"/>
 <path d="M69 19 L49 46 H61 L54 67 L78 37 H65 Z" fill="#b98cff" stroke="#f3e8ff" stroke-width="1.8" stroke-linejoin="round"/>
 <g fill="#eab84a">
  <path d="M16 42 C16 30 31 28 33 37 C29 35 25 39 28 45 C22 48 16 47 16 42Z"/>
  <path d="M108 42 C108 30 93 28 91 37 C95 35 99 39 96 45 C102 48 108 47 108 42Z"/>
  <circle cx="14" cy="14" r="2.6"/><circle cx="110" cy="14" r="2.6"/><circle cx="14" cy="70" r="2.6"/><circle cx="110" cy="70" r="2.6"/>
 </g></svg>`,
    { size: 384 },
  );

const latticeSvg = () => {
  let bars = "";
  for (const x of [14.7, 25, 35.3]) bars += `<rect x="${x - 0.9}" y="3" width="1.8" height="48" fill="#6a3a2c"/>`;
  for (const y of [15, 27, 39]) bars += `<rect x="3" y="${y - 0.9}" width="44" height="1.8" fill="#6a3a2c"/>`;
  return svg(
    `<svg viewBox="0 0 50 72" ${NS}>
 <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffeaa8"/><stop offset="1" stop-color="#ffb35a"/></linearGradient></defs>
 <rect width="50" height="72" fill="#4a2230"/>
 <rect x="3" y="3" width="44" height="48" fill="url(#g)"/>
 ${bars}
 <rect x="3" y="3" width="44" height="48" fill="none" stroke="#2a1420" stroke-width="2"/>
 <rect x="3" y="54" width="44" height="15" fill="#6b2a35" stroke="#eab84a" stroke-width="1.2"/>
 <path d="M8 61.5 q4.5 -6 9 0 q4.5 6 9 0 q4.5 -6 9 0 q4.5 6 9 0" stroke="#eab84a" fill="none" stroke-width="1.5"/>
 </svg>`,
    { size: 256 },
  );
};

const chochinSvg = () => {
  let ribs = "";
  for (let i = 1; i < 11; i++) ribs += `<path d="M0 ${i * 6.36} H128" stroke="#b8352c" stroke-width="1.2"/>`;
  let marks = "";
  for (const cx of [0, 64, 128])
    marks += `<circle cx="${cx}" cy="35" r="16" fill="#fff0cf" stroke="#9a2a2a" stroke-width="2.2"/>
    <path d="M${cx + 4} 22 L${cx - 8} 37 H${cx} L${cx - 4} 49 L${cx + 9} 33 H${cx + 1}Z" fill="#7a47d6" stroke="#4a2a8a" stroke-width="1"/>`;
  return svg(
    `<svg viewBox="0 0 128 70" ${NS}>
 <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e7502d"/><stop offset=".5" stop-color="#ffb55c"/><stop offset="1" stop-color="#e7502d"/></linearGradient></defs>
 <rect width="128" height="70" fill="url(#g)"/>${ribs}${marks}</svg>`,
    { size: 512 },
  );
};

const shideSvg = () => {
  const rows: [number, number][] = [];
  for (let y = 100, i = 0; y >= 4; y -= 12, i++) rows.push([y, i === 0 ? 20 : 20 + (i % 2 ? 8 : -8)]);
  let polys = "";
  for (let i = 1; i < rows.length; i++) {
    const [y0, x0] = rows[i - 1];
    const [y1, x1] = rows[i];
    polys += `<polygon points="${x0 - 7},${y0} ${x0 + 7},${y0} ${x1 + 7},${y1} ${x1 - 7},${y1}" fill="${i % 2 ? "#fbf7ee" : "#e5ddf2"}" stroke="#a59bc2" stroke-width="1.4" stroke-linejoin="round"/>`;
  }
  return svg(
    `<svg viewBox="0 0 40 100" ${NS}>${polys}<rect x="14" y="93" width="12" height="7" rx="2" fill="#d9c98a" stroke="#8d7a42" stroke-width="1"/></svg>`,
    { size: 256 },
  );
};

const HOUSE = "1,33 39,33 39,13 20,1 1,13";
const emaFoxSvg = () =>
  svg(
    `<svg viewBox="0 0 40 34" ${NS}>
 <polygon points="${HOUSE}" fill="#dcae72" stroke="#7a4a2a" stroke-width="1.6" stroke-linejoin="round"/>
 <path d="M9 21 L9 9 L16 15 Z M31 21 L31 9 L24 15 Z" fill="#fff" stroke="#c33a2c" stroke-width="1.2" stroke-linejoin="round"/>
 <path d="M8 19 Q20 12 32 19 Q31 31 20 32 Q9 31 8 19Z" fill="#fffaf0" stroke="#c33a2c" stroke-width="1.4"/>
 <path d="M12 21 Q14 19 17 22 M28 21 Q26 19 23 22" stroke="#2a2236" stroke-width="1.5" fill="none" stroke-linecap="round"/>
 <path d="M10 25 L14 25 M30 25 L26 25 M20 17 V21" stroke="#c33a2c" stroke-width="1.4" stroke-linecap="round"/>
 <ellipse cx="20" cy="26" rx="2" ry="1.4" fill="#2a2236"/></svg>`,
    { size: 256 },
  );
const emaSakuraSvg = () => {
  let petals = "";
  for (let i = 0; i < 5; i++)
    petals += `<ellipse cx="20" cy="14.5" rx="4.6" ry="7" fill="#ffbdd2" stroke="#d9668c" stroke-width="1" transform="rotate(${i * 72} 20 21)"/>`;
  return svg(
    `<svg viewBox="0 0 40 34" ${NS}><polygon points="${HOUSE}" fill="#dcae72" stroke="#7a4a2a" stroke-width="1.6" stroke-linejoin="round"/>${petals}<circle cx="20" cy="21" r="2.4" fill="#f2c94c"/></svg>`,
    { size: 256 },
  );
};
const emaBoltSvg = () =>
  svg(
    `<svg viewBox="0 0 40 34" ${NS}>
 <polygon points="${HOUSE}" fill="#dcae72" stroke="#7a4a2a" stroke-width="1.6" stroke-linejoin="round"/>
 <circle cx="20" cy="21" r="10.5" fill="#3a2b78" stroke="#eab84a" stroke-width="1.6"/>
 <path d="M23 12 L15 22 H20 L17 30 L26 19 H21Z" fill="#c29cff" stroke="#fff" stroke-width="0.9" stroke-linejoin="round"/></svg>`,
    { size: 256 },
  );
const omikujiSvg = () =>
  svg(
    `<svg viewBox="0 0 20 64" ${NS}>
 <path d="M4 0 L10 6 L16 0 V50 H4Z" fill="#fbf7ee" stroke="#a59bc2" stroke-width="1"/>
 <path d="M7 14 H13 M7 20 H13 M7 26 H12 M7 32 H13 M7 38 H11" stroke="#c0353a" stroke-width="1.3" stroke-linecap="round"/>
 <path d="M10 50 L3 46 L3 56Z M10 50 L17 46 L17 56Z" fill="#fbf7ee" stroke="#a59bc2" stroke-width="1" stroke-linejoin="round"/>
 <rect x="8.5" y="48" width="3" height="16" fill="#e7dfcf" stroke="#a59bc2" stroke-width="0.8"/></svg>`,
    { size: 128 },
  );
const sakakiSvg = () => {
  let leaves = "";
  const ys = [66, 54, 42, 30, 18];
  ys.forEach((y, i) => {
    const s = i % 2 ? 1 : -1;
    leaves += `<g transform="rotate(${s * 55} ${20} ${y})"><ellipse cx="20" cy="${y - 9}" rx="4.6" ry="9" fill="#2f7a3e" stroke="#1d4a2a" stroke-width="1"/><path d="M20 ${y} V${y - 17}" stroke="#7ec47c" stroke-width="1"/></g>`;
  });
  return svg(
    `<svg viewBox="0 0 40 80" ${NS}><path d="M20 80 Q22 40 20 6" stroke="#5a3d2a" stroke-width="2.4" fill="none" stroke-linecap="round"/>${leaves}<ellipse cx="20" cy="10" rx="4" ry="8" fill="#3b8f4a" stroke="#1d4a2a" stroke-width="1"/></svg>`,
    { size: 256 },
  );
};
const labelSvg = () =>
  svg(
    `<svg viewBox="0 0 40 50" ${NS}>
 <rect x="1.5" y="1.5" width="37" height="47" rx="3" fill="#f6ecd2" stroke="#7a2a2a" stroke-width="2"/>
 <rect x="4" y="4" width="32" height="5" fill="#eab84a"/>
 <circle cx="20" cy="23" r="9.5" fill="#c9362b" stroke="#7a2a2a" stroke-width="1.2"/>
 <path d="M21 15 L15 24 H20 L18 31 L25 22 H21Z" fill="#fbe9b0"/>
 <path d="M8 38 H32 M8 42 H28 M8 46 H30" stroke="#2a2236" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    { size: 192 },
  );
const sealSvg = () => {
  let ticks = "";
  for (let i = 0; i < 24; i++) {
    const a = (i * 15 * Math.PI) / 180;
    ticks += `<path d="M${50 + Math.sin(a) * 40} ${50 - Math.cos(a) * 40} L${50 + Math.sin(a) * 45} ${50 - Math.cos(a) * 45}" stroke="#c7a0ff" stroke-width="2.4" stroke-linecap="round"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" ${NS}>
 <circle cx="50" cy="50" r="47.5" fill="none" stroke="#b680ff" stroke-width="3"/>
 <circle cx="50" cy="50" r="37" fill="none" stroke="#9a66f5" stroke-width="2" stroke-dasharray="6 4"/>
 <circle cx="50" cy="50" r="30" fill="none" stroke="#b680ff" stroke-width="2.6"/>
 ${ticks}
 <path d="M50 22 L74.2 64 H25.8Z M50 78 L25.8 36 H74.2Z" fill="none" stroke="#d3b3ff" stroke-width="2.6" stroke-linejoin="round"/>
 <circle cx="50" cy="50" r="9" fill="#9a66f5" stroke="#efe0ff" stroke-width="2"/>
 <path d="M52 43 L46 51 H50 L48 58 L55 49 H51Z" fill="#fff"/></svg>`,
    { size: 512 },
  );
};

// ------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "roadside_shrine", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);

  const T = {
    plaque: plaqueSvg(),
    lattice: latticeSvg(),
    chochin: chochinSvg(),
    shide: shideSvg(),
    emaFox: emaFoxSvg(),
    emaSakura: emaSakuraSvg(),
    emaBolt: emaBoltSvg(),
    omikuji: omikujiSvg(),
    sakaki: sakakiSvg(),
    label: labelSvg(),
    seal: sealSvg(),
  };

  // ---- primitive helpers
  const P = (geo: THREE.BufferGeometry, color: Col, at: V, o: Record<string, unknown> = {}) =>
    b.part(geo, color as never, { bone: root, at, flat: true, ...o } as never);
  const box = (w: number, h: number, d: number, color: Col, at: V, o: Record<string, unknown> = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: Col, at: V, o: Record<string, unknown> = {}) =>
    P(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, o);
  const ball = (r: number, color: Col, at: V, o: Record<string, unknown> = {}) =>
    P(new THREE.SphereGeometry(r, 8, 6), color, at, o);
  const lathe = (outline: Out, at: V, color: Col, o: Record<string, unknown> = {}) =>
    b.lathe(outline, { at, color, bone: root, ...o } as never);
  const spike = (base: V, tip: V, r: number, color: Col, sides = 6) =>
    b.spike(base, tip, null, r, { color, bone: root, sides } as never);
  const rod = (a: V, c: V, r: number, color: Col) => b.rod(a, c, r, color as never, { bone: root } as never);

  const makeRoof = (at: V, yaw: number, halfW: number, back: number, front: number, hr: number, tip: number) => {
    const a = yaw * D2R;
    const fwd: V = [Math.sin(a), 0, Math.cos(a)];
    const lat: V = [Math.cos(a), 0, -Math.sin(a)];
    return b.extrude(roofOutline(back, front, hr, tip), {
      at,
      x: fwd,
      y: [0, 1, 0],
      thickness: halfW * 2,
      bevel: 0.012,
      color: roofPaint(lat),
      bone: root,
    } as never);
  };

  // ---- reusable ornaments
  const chochin = (x: number, y: number, z: number, rope = 0.22, k = 1, glowK = 1.15) => {
    const capY = y - rope - 0.03 * k;
    const h = 0.24 * k;
    const cy = capY - 0.03 * k + 0.02 * k - h;
    rod([x, y, z], [x, y - rope, z], 0.012, "#3b2a2a");
    cyl(0.085 * k, 0.1 * k, 0.06 * k, 10, blackLac, [x, capY, z]);
    cyl(0.104 * k, 0.104 * k, 0.012 * k, 10, gold, [x, capY - 0.02 * k, z]);
    glow(
      P(new THREE.SphereGeometry(1, 14, 10), "#ffffff", [x, cy, z], {
        scale: [0.22 * k, h, 0.22 * k],
        texture: T.chochin,
        quat: Q(-90),
        flat: false,
      }),
      glowK,
    );
    const by = cy - h + 0.012 * k;
    cyl(0.1 * k, 0.085 * k, 0.05 * k, 10, blackLac, [x, by, z]);
    cyl(0.104 * k, 0.104 * k, 0.012 * k, 10, gold, [x, by + 0.02 * k, z]);
    ball(0.022 * k, gold, [x, by - 0.05 * k, z]);
    for (const [ox, oz] of [
      [0, 0],
      [0.014, 0.008],
      [-0.014, 0.008],
      [0, -0.014],
    ] as const)
      spike([x + ox * k, by - 0.055 * k, z + oz * k], [x + ox * 1.6 * k, by - 0.2 * k, z + oz * 1.6 * k], 0.016 * k, C("#c92f3a"), 4);
  };

  const crystal = (base: V, h: number, r: number, rx: number, rz: number) => {
    const q = Q(0, rx, 0, rz);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    const at = (d: number): V => [base[0] + up.x * d, base[1] + up.y * d, base[2] + up.z * d];
    glow(P(new THREE.CylinderGeometry(r * 0.85, r, h * 0.62, 6), "#a56cff", at(h * 0.31), { quat: q }), 1.3);
    glow(P(new THREE.CylinderGeometry(0.001, r * 0.85, h * 0.38, 6), "#dcc0ff", at(h * 0.62 + h * 0.19), { quat: q }), 1.5);
  };

  const shimenawa = (pts: V[], shideN: number, size: [number, number], thick = 0.042) => {
    const path = catmull(pts);
    const turns = Math.max(4, Math.round(path.length / 0.09));
    b.sweep(path, (t: number) => thick * (1 + 0.55 * Math.pow(Math.abs(2 * t - 1), 6)), {
      color: strawRope(turns),
      bone: root,
      sides: 8,
    } as never);
    const fr = [];
    for (let i = 0; i < shideN; i++) fr.push(frame(path.at(0.12 + (0.76 * (i + 0.5)) / shideN), [0, 1, 0]));
    b.cards(fr, T.shide, { size, lean: 180, flow: [0, 0, 1], bone: root, vary: 0.12, rng: R, sink: 0 } as never);
    for (const t of [0.015, 0.985]) {
      const e = path.at(t);
      for (const ox of [-0.02, 0.02]) {
        const sgn = t < 0.5 ? 1 : -1;
        spike([e.x + ox * sgn, e.y, e.z], [e.x + ox * 2 * sgn, e.y - 0.15, e.z], 0.022, C("#d9c88a"), 5);
      }
    }
  };

  // ==============================================================================================
  // Layout
  const TZ = 3.4; // torii depth

  // ---- ground path and Electro seal ----------------------------------------------------------
  for (let i = 0; i < 4; i++)
    box(0.7 + R() * 0.25, 0.06, 0.34, stonePaint, [(R() - 0.5) * 0.18, 0.03, 0.7 + i * 0.38], { quat: Q((R() - 0.5) * 8) });
  glow(
    P(new THREE.PlaneGeometry(1.5, 1.5), "#ffffff", [0, 0.014, 2.75], { texture: T.seal, quat: Q(0, -90, 0, 0) }),
    1.25,
  );

  // ============================================================================================
  // TORII
  const pillarX = (s: number, y: number) => s * (1.28 - (y - 0.28) * 0.0209);
  for (const s of [1, -1]) {
    cyl(0.14, 0.175, 2.94, 12, redLac, [s * 1.25, 0.28 + 1.47, TZ], { quat: Q(0, 0, 0, s * 1.2) });
    cyl(0.25, 0.27, 0.28, 12, blackLac, [s * 1.28, 0.14, TZ]);
    cyl(0.255, 0.255, 0.03, 12, gold, [s * 1.28, 0.285, TZ]);
    // gold collars at the tie beam and under the upper beam
    cyl(0.17, 0.17, 0.08, 12, gold, [pillarX(s, 2.5), 2.5, TZ]);
    cyl(0.16, 0.16, 0.06, 12, gold, [pillarX(s, 3.0), 3.0, TZ]);
    // wedge keys through the tie beam
    box(0.07, 0.27, 0.12, blackLac, [pillarX(s, 2.5) + s * 0.2, 2.5, TZ]);
    // nuki end caps
    box(0.05, 0.2, 0.18, gold, [s * 1.87, 2.5, TZ]);
    // gate-post braces
    box(0.05, 0.44, 0.12, redLac, [s * 0.33, 2.8, TZ]);
    // straw wraps where the rope ties on
    P(new THREE.TorusGeometry(0.185, 0.034, 5, 14), strawRope(3), [pillarX(s, 2.36), 2.36, TZ], { quat: Q(0, 90, 0, 0) });
    // kasagi end plates
    box(0.05, 0.24, 0.42, gold, [s * 2.46, 3.54, TZ], { quat: Q(0, 0, 0, s * 12) });
    // hanging paper lanterns off the tie-beam ends
    chochin(s * 1.6, 2.415, TZ, 0.22, 1);
  }
  box(3.7, 0.17, 0.15, redLac, [0, 2.5, TZ]);
  b.extrude(beamOutline(2.15, 0.2, 0.14, 0.12), {
    at: [0, 3.02, TZ],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.3,
    bevel: 0.012,
    color: redLac,
    bone: root,
  } as never);
  b.extrude(beamOutline(2.45, 0.34, 0.2, 0.22), {
    at: [0, 3.22, TZ],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.38,
    bevel: 0.02,
    color: blackLac,
    bone: root,
  } as never);
  // gold studs along the kasagi front
  for (let i = -4; i <= 4; i++) {
    const a = Math.abs(i / 4);
    ball(0.022, gold, [i * 0.5, 3.22 + 0.22 * Math.pow(a, 2.6) + 0.1, TZ + 0.2]);
  }
  // name plaque with an Electro emblem, front and back
  box(0.6, 0.4, 0.06, blackLac, [0, 2.8, TZ]);
  for (const f of [1, -1])
    P(new THREE.PlaneGeometry(0.62, 0.42), "#ffffff", [0, 2.8, TZ + f * 0.033], { texture: T.plaque, quat: Q(f > 0 ? 0 : 180) });

  shimenawa(
    [
      [-1.1, 2.36, TZ],
      [-0.7, 2.27, TZ],
      [0, 2.22, TZ],
      [0.7, 2.27, TZ],
      [1.1, 2.36, TZ],
    ],
    5,
    [0.17, 0.44],
  );

  // ============================================================================================
  // STONE LANTERNS (toro)
  const stoneLantern = (cx: number, cz: number, k = 1) => {
    const HY = 30;
    const hex = (rt: number, rb: number, h: number, yc: number) =>
      P(new THREE.CylinderGeometry(rt * k, rb * k, h * k, 6), stonePaint, [cx, yc * k, cz], { quat: Q(HY) });
    hex(0.34, 0.38, 0.14, 0.07);
    hex(0.115, 0.135, 0.62, 0.45);
    hex(0.175, 0.175, 0.07, 0.5);
    hex(0.3, 0.2, 0.1, 0.81);
    hex(0.27, 0.27, 0.05, 0.885);
    glow(P(new THREE.CylinderGeometry(0.15 * k, 0.15 * k, 0.34 * k, 6), "#ffb84f", [cx, 1.08 * k, cz], { quat: Q(HY) }), 1.25);
    glow(ball(0.075 * k, "#fff0a8", [cx, 1.08 * k, cz]), 1.6);
    for (let i = 0; i < 6; i++) {
      const a = (HY + 60 * i) * D2R;
      box(0.065 * k, 0.36 * k, 0.065 * k, stonePaint, [cx + Math.sin(a) * 0.225 * k, 1.08 * k, cz + Math.cos(a) * 0.225 * k], {
        quat: Q(HY + 60 * i),
      });
      const ar = (HY + 60 * i) * D2R;
      const bx = cx + Math.sin(ar) * 0.56 * k;
      const bz = cz + Math.cos(ar) * 0.56 * k;
      b.spike([bx, 1.335 * k, bz], [Math.sin(ar) * 0.55, 0.85, Math.cos(ar) * 0.55], 0.17 * k, 0.055 * k, {
        color: stonePaint,
        bone: root,
        sides: 5,
      } as never);
    }
    hex(0.27, 0.27, 0.05, 1.275);
    hex(0.5, 0.58, 0.07, 1.335);
    hex(0.05, 0.5, 0.26, 1.5);
    lathe(
      [
        [0, 0],
        [0.075 * k, 0],
        [0.075 * k, 0.03 * k],
        [0.095 * k, 0.08 * k],
        [0.05 * k, 0.17 * k],
        [0.025 * k, 0.21 * k],
        [0, 0.24 * k],
      ],
      [cx, 1.63 * k, cz],
      gold,
      { segments: 8 },
    );
  };
  stoneLantern(-1.35, 1.1, 0.95);
  stoneLantern(1.35, 1.1, 0.95);

  // ============================================================================================
  // SHRINE PLATFORM
  box(3.8, 0.2, 2.7, stonePaint, [0, 0.1, -1.35]);
  box(1.1, 0.1, 0.32, stonePaint, [0, 0.05, 0.16]);
  box(1.1, 0.09, 0.3, stonePaint, [0, 0.245, -0.35]);
  box(2.2, 0.2, 2.05, stonePaint, [0, 0.3, -1.525]);
  // lighter coping stones along the tier fronts
  box(3.84, 0.03, 0.06, C("#cfcce0", "#8d89ab"), [0, 0.205, -0.03]);
  box(2.24, 0.03, 0.06, C("#cfcce0", "#8d89ab"), [0, 0.405, -0.5]);

  // ============================================================================================
  // HOKORA (small shrine)
  const SY = 0.4;
  for (const s of [1, -1]) {
    for (const z of [-2.35, -1.55, -1.1]) {
      cyl(0.055, 0.055, 0.9, 8, redLac, [s * 0.6, SY + 0.45, z]);
      cyl(0.085, 0.095, 0.05, 8, stonePaint, [s * 0.6, SY + 0.025, z]);
    }
    box(0.05, 0.9, 0.8, plaster, [s * 0.6, SY + 0.45, -1.95]);
    box(0.09, 0.08, 1.3, redLac, [s * 0.6, 1.22, -1.7]);
    // bracket blocks at the porch post tops
    box(0.2, 0.06, 0.2, blackLac, [s * 0.6, 1.25, -1.1]);
    box(0.13, 0.05, 0.13, gold, [s * 0.6, 1.205, -1.1]);
    // glowing doors
    glow(P(new THREE.PlaneGeometry(0.5, 0.7), "#ffffff", [s * 0.255, 0.86, -1.545], { texture: T.lattice }), 0.9);
    ball(0.016, gold, [s * 0.04, 0.82, -1.53]);
  }
  box(1.2, 0.9, 0.05, plaster, [0, SY + 0.45, -2.35]);
  box(1.1, 0.75, 0.04, blackLac, [0, 0.87, -1.58]);
  box(1.1, 0.06, 0.07, redLac, [0, 1.24, -1.55]);
  box(1.1, 0.05, 0.09, redLac, [0, 0.48, -1.55]);
  box(0.03, 0.7, 0.05, redLac, [0, 0.86, -1.55]);
  box(1.3, 0.08, 0.09, redLac, [0, 1.22, -1.1]);
  box(1.3, 0.06, 0.5, woodLight, [0, 0.43, -1.325]);
  // roof
  makeRoof([0, 1.3, -1.7], 0, 0.95, 0.8, 1.1, 0.62, 0.1);
  for (let i = 0; i < 15; i++) {
    const x = -0.87 + i * 0.124;
    box(0.05, 0.05, 0.12, C("#f1e6c9", "#c7bad2"), [x, 1.275, -0.72]);
    ball(0.016, gold, [x, 1.275, -0.655]);
  }
  box(1.96, 0.045, 0.04, gold, [0, 1.35, -0.585]);
  cyl(0.05, 0.05, 1.98, 8, blackLac, [0, 1.95, -1.7], { quat: Q(0, 0, 90) });
  for (const x of [-0.45, 0, 0.45]) {
    cyl(0.04, 0.04, 0.34, 8, woodLight, [x, 2.02, -1.7], { quat: Q(0, 90, 0) });
    ball(0.03, gold, [x, 2.02, -1.52]);
    ball(0.03, gold, [x, 2.02, -1.88]);
  }
  for (const s of [1, -1]) {
    // gable emblems and crossed chigi
    cyl(0.1, 0.1, 0.02, 10, gold, [s * 0.96, 1.62, -1.7], { quat: Q(0, 0, 90) });
    rod([s * 0.95, 1.9, -1.7], [s * 0.95, 2.28, -1.5], 0.024, woodLight);
    rod([s * 0.95, 1.9, -1.7], [s * 0.95, 2.28, -1.9], 0.024, woodLight);
    spike([s * 0.95, 2.26, -1.52], [s * 0.95, 2.34, -1.46], 0.03, gold, 5);
    spike([s * 0.95, 2.26, -1.88], [s * 0.95, 2.34, -1.94], 0.03, gold, 5);
    // roof chochin
    chochin(s * 0.8, 1.3, -0.72, 0.1, 0.8, 1.1);
  }
  // sacred rope on the porch with shide
  shimenawa(
    [
      [-0.57, 1.16, -1.04],
      [-0.3, 1.09, -1.04],
      [0, 1.06, -1.04],
      [0.3, 1.09, -1.04],
      [0.57, 1.16, -1.04],
    ],
    4,
    [0.11, 0.27],
    0.03,
  );
  // bell and bell rope
  rod([0, 1.3, -0.95], [0, 1.1, -0.95], 0.01, "#3b2a2a");
  ball(0.075, gold, [0, 1.03, -0.95], { scale: [1, 1, 1] });
  box(0.1, 0.012, 0.01, blackLac, [0, 1.0, -0.88]);
  cyl(0.082, 0.082, 0.012, 10, blackLac, [0, 1.035, -0.95]);
  b.sweep(
    catmull([
      [0, 0.97, -0.95],
      [0.02, 0.8, -0.93],
      [0, 0.6, -0.9],
    ]),
    0.022,
    { color: bellRope, bone: root, sides: 8 } as never,
  );
  ball(0.035, gold, [0, 0.58, -0.9]);
  for (const ox of [-0.02, 0, 0.02]) spike([ox, 0.57, -0.9], [ox * 1.5, 0.4, -0.9], 0.014, C("#d63a36"), 4);

  // offering box
  box(0.9, 0.34, 0.42, woodDark, [0, SY + 0.17, -0.76]);
  for (let i = 0; i < 7; i++) box(0.9, 0.02, 0.04, woodLight, [0, SY + 0.345, -0.92 + i * 0.054]);
  for (const s of [1, -1]) {
    box(0.04, 0.36, 0.44, gold, [s * 0.45, SY + 0.17, -0.76]);
  }
  P(new THREE.PlaneGeometry(0.3, 0.2), "#ffffff", [0, SY + 0.18, -0.548], { texture: T.plaque });

  // Electro crystals on cushions on the porch floor
  for (const s of [1, -1]) {
    box(0.26, 0.04, 0.26, C("#5a3b8c", "#3a2766"), [s * 0.36, 0.48, -1.32]);
    box(0.28, 0.012, 0.28, gold, [s * 0.36, 0.463, -1.32]);
    const bx = s * 0.36;
    crystal([bx, 0.5, -1.32], 0.24, 0.04, 0, -s * 4);
    crystal([bx + 0.06, 0.5, -1.28], 0.15, 0.03, 12, -s * 24);
    crystal([bx - 0.06, 0.5, -1.36], 0.13, 0.028, -14, s * 20);
  }

  // sake barrel (komodaru)
  {
    const bx = -0.82;
    const bz = -0.98;
    lathe(
      [
        [0, 0],
        [0.17, 0],
        [0.2, 0.08],
        [0.21, 0.17],
        [0.2, 0.26],
        [0.17, 0.34],
        [0, 0.34],
      ],
      [bx, SY, bz],
      woodLight,
      { segments: 10 },
    );
    for (const y of [0.09, 0.26])
      P(new THREE.TorusGeometry(y < 0.15 ? 0.196 : 0.197, 0.012, 4, 14), strawRope(2), [bx, SY + y, bz], { quat: Q(0, 90, 0, 0) });
    P(new THREE.PlaneGeometry(0.14, 0.17), "#ffffff", [bx, SY + 0.17, bz + 0.214], { texture: T.label });
    cyl(0.14, 0.14, 0.01, 10, strawRope(2), [bx, SY + 0.345, bz]);
  }

  // sakaki vases
  for (const [vx, vz] of [
    [0.82, -0.92],
    [0.8, -1.22],
  ] as const) {
    lathe(
      [
        [0, 0],
        [0.07, 0],
        [0.095, 0.09],
        [0.07, 0.2],
        [0.04, 0.26],
        [0.05, 0.3],
        [0, 0.3],
      ],
      [vx, SY, vz],
      ceramic,
      { segments: 8 },
    );
    cyl(0.097, 0.097, 0.02, 8, C("#4a6ac8", "#2f449a"), [vx, SY + 0.1, vz]);
    const items = b.ring(frame([vx, SY + 0.29, vz], [0, 1, 0]), { count: 6, radius: 0.012, tilt: 62 }).items;
    b.cards(items, T.sakaki, {
      size: [0.19, 0.32],
      lean: 14,
      bend: 24,
      cross: true,
      flow: () => [0, -1, 0],
      bone: root,
      sink: 0.02,
    } as never);
  }

  // ============================================================================================
  // KITSUNE GUARDIANS
  const fox = (cx: number, cz: number, yaw: number, item: "jewel" | "scroll") => {
    const F = new Pose([cx, 0.2, cz], yaw);
    box(0.7, 0.14, 0.64, stonePaint, F.p(0, 0.07, 0), { quat: F.q() });
    box(0.54, 0.2, 0.48, stonePaint, F.p(0, 0.24, 0), { quat: F.q() });
    box(0.58, 0.03, 0.52, C("#cfcce0", "#8d89ab"), F.p(0, 0.355, 0), { quat: F.q() });
    const G = new Pose(F.p(0, 0.37, 0), yaw, 0.85);
    const s = (v: number) => v * 0.85;
    const body: Col = stonePaint;
    P(new THREE.SphereGeometry(1, 10, 8), body, G.p(0, 0.2, -0.1), { scale: [s(0.19), s(0.2), s(0.22)], quat: G.q() });
    b.sweep(catmull([G.p(0, 0.22, -0.1), G.p(0, 0.42, 0.0), G.p(0, 0.62, 0.07)]), [s(0.19), s(0.12)], {
      color: body,
      bone: root,
      sides: 8,
    } as never);
    ball(s(0.14), body, G.p(0, 0.5, 0.1));
    for (const sx of [1, -1]) {
      cyl(s(0.05), s(0.06), s(0.46), 6, body, G.p(sx * 0.085, 0.23, 0.17), { quat: G.q() });
      box(s(0.1), s(0.05), s(0.15), body, G.p(sx * 0.085, 0.025, 0.21), { quat: G.q() });
      box(s(0.12), s(0.06), s(0.26), body, G.p(sx * 0.19, 0.03, 0.0), { quat: G.q() });
      // cheek ruff and ears
      spike(G.p(sx * 0.09, 0.74, 0.12), G.p(sx * 0.2, 0.67, 0.1), s(0.06), body, 5);
      spike(G.p(sx * 0.075, 0.82, 0.08), G.p(sx * 0.115, 1.06, 0.03), s(0.07), body, 5);
      spike(G.p(sx * 0.075, 0.82, 0.1), G.p(sx * 0.11, 1.0, 0.055), s(0.042), C("#c9442f", "#8a2030"), 5);
      // slanted carved eyes
      box(s(0.06), s(0.014), s(0.014), "#2b2238", G.p(sx * 0.058, 0.78, 0.225), { quat: G.q(0, 0, sx * 20) });
    }
    P(new THREE.SphereGeometry(1, 10, 8), body, G.p(0, 0.76, 0.12), { scale: [s(0.13), s(0.115), s(0.125)], quat: G.q() });
    spike(G.p(0, 0.74, 0.17), G.p(0, 0.7, 0.36), s(0.075), body, 6);
    ball(s(0.027), "#2b2238", G.p(0, 0.7, 0.375));
    // red bib with a golden bell
    P(new THREE.TorusGeometry(s(0.115), s(0.032), 5, 12), redLac, G.p(0, 0.6, 0.09), { quat: G.q(80) });
    b.extrude(
      [
        [-s(0.11), 0],
        [s(0.11), 0],
        [0, -s(0.23)],
      ] as Out,
      { at: G.p(0, 0.6, 0.24), x: G.lat, y: [0, 1, 0], thickness: s(0.02), color: redLac, bone: root } as never,
    );
    ball(s(0.035), gold, G.p(0, 0.36, 0.265));
    // tail
    b.sweep(catmull([G.p(0, 0.12, -0.28), G.p(0, 0.12, -0.55), G.p(0, 0.4, -0.72), G.p(0, 0.75, -0.6)]), [s(0.06), s(0.11), s(0.13), s(0.09), s(0.02)], {
      color: body,
      bone: root,
      caps: "point",
      sides: 8,
    } as never);
    if (item === "jewel") {
      ball(s(0.06), gold, G.p(0.0, 0.07, 0.36));
      spike(G.p(0, 0.12, 0.36), G.p(0, 0.2, 0.36), s(0.03), gold, 6);
    } else {
      cyl(s(0.032), s(0.032), s(0.26), 8, C("#f6ecd2", "#cfc3d8"), G.p(0, 0.05, 0.38), { quat: G.q(0, 0, 90) });
      for (const sx of [1, -1]) cyl(s(0.036), s(0.036), s(0.02), 8, redLac, G.p(sx * 0.12, 0.05, 0.38), { quat: G.q(0, 0, 90) });
    }
  };
  fox(1.5, -0.35, -28, "jewel");
  fox(-1.5, -0.35, 28, "scroll");

  // ============================================================================================
  // OFFERING TABLES
  const orange = (p: V, r = 0.055) => {
    ball(r, C("#ff9a2e", "#d85a28"), p);
    cyl(0.001, r * 0.4, r * 0.55, 5, C("#5fae4a", "#34803a"), [p[0], p[1] + r * 0.95, p[2]]);
  };
  const table = (cx: number, cz: number, variant: 0 | 1, yaw: number) => {
    const t = new Pose([cx, 0.2, cz], yaw);
    box(0.62, 0.04, 0.4, woodLight, t.p(0, 0.34, 0), { quat: t.q() });
    for (const [lx, lz] of [
      [0.26, 0.15],
      [-0.26, 0.15],
      [0.26, -0.15],
      [-0.26, -0.15],
    ] as const)
      box(0.05, 0.32, 0.05, woodDark, t.p(lx, 0.16, lz), { quat: t.q() });
    box(0.5, 0.008, 0.3, C("#f2ece4", "#cdc4e0"), t.p(0, 0.364, 0), { quat: t.q() });
    box(0.5, 0.009, 0.03, C("#7a4fd0", "#52329a"), t.p(0, 0.366, 0.14), { quat: t.q() });
    // sanbo tray
    const tx = variant === 0 ? -0.1 : -0.12;
    cyl(0.08, 0.095, 0.05, 8, woodLight, t.p(tx, 0.39, 0), { quat: t.q() });
    box(0.26, 0.02, 0.26, C("#ead7ae", "#bba8b8"), t.p(tx, 0.425, 0), { quat: t.q() });
    if (variant === 0) {
      for (const [ox, oz] of [
        [0.05, 0.05],
        [-0.05, 0.05],
        [0.05, -0.05],
        [-0.05, -0.05],
      ] as const)
        orange(t.p(tx + ox, 0.435 + 0.055, oz));
      orange(t.p(tx, 0.435 + 0.055 + 0.085, 0));
      // sake set
      lathe(
        [
          [0, 0],
          [0.045, 0],
          [0.06, 0.05],
          [0.045, 0.12],
          [0.02, 0.155],
          [0.028, 0.195],
          [0.036, 0.215],
          [0, 0.215],
        ],
        t.p(0.14, 0.368, -0.02),
        ceramic,
        { segments: 8 },
      );
      cyl(0.062, 0.062, 0.016, 8, C("#4a6ac8", "#2f449a"), t.p(0.14, 0.395, -0.02));
      for (const [cx2, cz2] of [
        [0.2, 0.1],
        [0.09, 0.12],
      ] as const)
        cyl(0.03, 0.022, 0.035, 8, ceramic, t.p(cx2, 0.384, cz2));
    } else {
      cyl(0.1, 0.11, 0.05, 10, C("#fbf7ef", "#cfc6e4"), t.p(tx, 0.455, 0));
      cyl(0.07, 0.075, 0.045, 10, C("#fbf7ef", "#cfc6e4"), t.p(tx, 0.5, 0));
      ball(0.045, C("#f59a2b", "#d3601f"), t.p(tx, 0.55, 0), { scale: [1, 0.85, 1] });
      cyl(0.001, 0.02, 0.03, 5, C("#5fae4a", "#34803a"), t.p(tx + 0.02, 0.585, 0));
      // dango in a cup
      cyl(0.045, 0.034, 0.07, 8, ceramic, t.p(0.17, 0.4, 0.03));
      const cols = ["#f6a9c0", "#fbf3e6", "#9fd47a"];
      for (const [i, ox] of [-0.025, 0.025].entries()) {
        const dx = ox * 3;
        rod(t.p(0.17 + ox * 0.2, 0.43, 0.03), t.p(0.17 + dx, 0.64, 0.03), 0.006, "#c8a46e");
        for (let k = 0; k < 3; k++) {
          const f = 0.42 + k * 0.24;
          ball(0.028, C(cols[(k + i) % 3]), t.p(0.17 + ox * 0.2 + (dx - ox * 0.2) * f, 0.43 + 0.21 * f + 0.02, 0.03));
        }
      }
      // tokkuri
      lathe(
        [
          [0, 0],
          [0.04, 0],
          [0.052, 0.045],
          [0.04, 0.1],
          [0.018, 0.13],
          [0.024, 0.165],
          [0.03, 0.18],
          [0, 0.18],
        ],
        t.p(0.17, 0.368, -0.12),
        ceramic,
        { segments: 8 },
      );
    }
  };
  table(0.82, -0.3, 0, -8);
  table(-0.82, -0.3, 1, 8);

  // ============================================================================================
  // EMA RACK (left)
  {
    const K = new Pose([-2.75, 0, 1.45], 40);
    for (const sx of [1, -1]) {
      cyl(0.05, 0.06, 1.65, 8, redLac, K.p(sx * 0.75, 0.825, 0));
      cyl(0.1, 0.12, 0.12, 8, stonePaint, K.p(sx * 0.75, 0.06, 0));
    }
    box(1.8, 0.08, 0.1, blackLac, K.p(0, 1.55, 0), { quat: K.q() });
    rod(K.p(-0.75, 1.32, 0), K.p(0.75, 1.32, 0), 0.022, woodDark);
    makeRoof(K.p(0, 1.63, 0), K.yaw, 1.0, 0.34, 0.34, 0.3, 0.05);
    const texes = [T.emaFox, T.emaSakura, T.emaBolt];
    const house: Out = [
      [-0.1, 0],
      [0.1, 0],
      [0.1, 0.12],
      [0, 0.17],
      [-0.1, 0.12],
    ];
    for (let i = 0; i < 6; i++) {
      const x = -0.6 + i * 0.24;
      const drop = 0.12 + R() * 0.1;
      const e = new Pose(K.p(x, 1.32 - drop - 0.17, 0), K.yaw + (R() - 0.5) * 22);
      b.extrude(house, { at: e.o, x: e.lat, y: [0, 1, 0], thickness: 0.014, color: woodLight, bone: root } as never);
      P(new THREE.PlaneGeometry(0.2, 0.17), "#ffffff", e.p(0, 0.085, 0.0085), { texture: texes[i % 3], quat: e.q() });
      for (const sx of [-1, 1]) rod(K.p(x + sx * 0.06, 1.32, 0), e.p(0, 0.17, 0), 0.006, "#c0353a");
    }
  }

  // ============================================================================================
  // OMIKUJI LINE (right)
  {
    const K = new Pose([2.75, 0, 1.55], -38);
    for (const sx of [1, -1]) {
      cyl(0.04, 0.05, 1.25, 8, woodPost, K.p(sx * 0.9, 0.625, 0));
      cyl(0.06, 0.07, 0.05, 8, redLac, K.p(sx * 0.9, 1.27, 0));
      ball(0.04, gold, K.p(sx * 0.9, 1.33, 0));
    }
    const rpts: V[] = [K.p(-0.9, 1.15, 0), K.p(-0.45, 1.07, 0), K.p(0, 1.04, 0), K.p(0.45, 1.07, 0), K.p(0.9, 1.15, 0)];
    const path = catmull(rpts);
    b.sweep(path, 0.016, { color: strawRope(18), bone: root, sides: 6 } as never);
    const fr = [];
    for (let i = 0; i < 13; i++) fr.push(frame(path.at(0.06 + (0.88 * i) / 12), [0, 1, 0]));
    b.cards(fr, T.omikuji, { size: [0.065, 0.22], lean: 180, flow: K.fwd, bone: root, vary: 0.15, rng: R, sink: 0, spin: 6 } as never);
  }

  // finished
  return b.root;
}
```