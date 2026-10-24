```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { catmull, cells, createBuilder, frame, mix, noise, paint, rng, smoothstep, svg } from "agentic-3js-builder";
import type { Paint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Cake Castle",
  description:
    "A patisserie diorama: a layered-sponge castle with piped cream, waffle-cone roofs, macarons, strawberries, a jelly moat, a wafer bridge, gummy-bear guards and a lace-doily cake board.",
};

type G = THREE.BufferGeometry;
type V = [number, number, number];
const DEG = Math.PI / 180;
const TAU = Math.PI * 2;

// ---------------------------------------------------------------------------------------------------------------
// Palette
const CHOC = "#5c321f";
const GOLD = "#f0c25a";
const PEARL = "#fffdf5";
const CREAM = "#fff6ea";
const SILVER = "#cfd6e2";
const ROSETTE = "#fffdf7";
const SPRINKLES = ["#ff6f91", "#ffd166", "#6ec6ff", "#7ddf9a", "#ffffff"];

// ---------------------------------------------------------------------------------------------------------------
// Textures

const doilySvg = (() => {
  let scallops = "";
  let holes = "";
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * TAU;
    scallops += `<circle cx="${(50 + 41 * Math.cos(a)).toFixed(2)}" cy="${(50 + 41 * Math.sin(a)).toFixed(2)}" r="7.8"/>`;
    holes += `<circle cx="${(50 + 33.5 * Math.cos(a + 0.1)).toFixed(2)}" cy="${(50 + 33.5 * Math.sin(a + 0.1)).toFixed(2)}" r="3.1" fill="#000"/>`;
  }
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * TAU;
    holes += `<ellipse cx="${(50 + 24 * Math.cos(a)).toFixed(2)}" cy="${(50 + 24 * Math.sin(a)).toFixed(2)}" rx="4.4" ry="2.4" fill="#000" transform="rotate(${((a / DEG) + 90).toFixed(1)} ${(50 + 24 * Math.cos(a)).toFixed(2)} ${(50 + 24 * Math.sin(a)).toFixed(2)})"/>`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs><mask id="m"><rect width="100" height="100" fill="#fff"/>${holes}<circle cx="50" cy="50" r="12" fill="none" stroke="#000" stroke-width="2"/></mask></defs>
    <g mask="url(#m)" fill="#fffafc" stroke="#e6d6dc" stroke-width="0.8">${scallops}<circle cx="50" cy="50" r="41"/></g>
  </svg>`;
})();
const DOILY = svg(doilySvg, { size: 768 });

const DOOR = svg(
  `<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="c"><path d="M6 140 V58 Q6 6 50 6 Q94 6 94 58 V140 Z"/></clipPath>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a4630"/><stop offset="1" stop-color="#4a2514"/></linearGradient></defs>
    <path d="M6 140 V58 Q6 6 50 6 Q94 6 94 58 V140 Z" fill="url(#g)" stroke="#2e150b" stroke-width="3"/>
    <g clip-path="url(#c)" stroke="#2e150b" stroke-width="2.4" fill="none" opacity="0.8">
      <path d="M50 0 V140 M0 36 H100 M0 72 H100 M0 108 H100 M28 0 V140 M72 0 V140"/>
    </g>
    <g clip-path="url(#c)" fill="#9a6040" opacity="0.55"><rect x="9" y="39" width="16" height="4"/><rect x="53" y="75" width="16" height="4"/><rect x="31" y="111" width="16" height="4"/></g>
    <path d="M12 140 V58 Q12 13 50 13 Q88 13 88 58 V140" fill="none" stroke="#fff6ea" stroke-width="3.6" stroke-linecap="round" stroke-dasharray="0.1 7"/>
    <rect x="6" y="30" width="88" height="5" fill="#f0c25a" stroke="#a87a1e" stroke-width="1"/><rect x="6" y="96" width="88" height="5" fill="#f0c25a" stroke="#a87a1e" stroke-width="1"/>
    <circle cx="38" cy="78" r="4.5" fill="#f0c25a" stroke="#a87a1e" stroke-width="1.2"/><circle cx="62" cy="78" r="4.5" fill="#f0c25a" stroke="#a87a1e" stroke-width="1.2"/>
    <path d="M50 26 c-6 -9 -16 -1 -9 6 l9 8 l9 -8 c7 -7 -3 -15 -9 -6z" fill="#ff7aa6" stroke="#b42a58" stroke-width="1.4"/>
  </svg>`,
  { size: 384 },
);

const WINDOW = svg(
  `<svg viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset="1" stop-color="#ffb43c"/></linearGradient></defs>
    <path d="M3 90 V36 Q3 3 30 3 Q57 3 57 36 V90Z" fill="#fff4e2" stroke="#e59ab4" stroke-width="3"/>
    <path d="M12 84 V38 Q12 14 30 14 Q48 14 48 38 V84Z" fill="url(#w)" stroke="#5c321f" stroke-width="3"/>
    <path d="M30 14 V84 M12 52 H48" stroke="#5c321f" stroke-width="3"/>
    <circle cx="30" cy="8" r="2.4" fill="#ff7aa6"/>
    <rect x="1" y="84" width="58" height="6" rx="2" fill="#ffd1df" stroke="#e59ab4" stroke-width="1.5"/>
  </svg>`,
  { size: 192 },
);

const PLAQUE = svg(
  `<svg viewBox="0 0 140 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 8 H12 V2 H128 V8 H140 L131 20 L140 32 H128 V38 H12 V32 H0 L9 20 Z" fill="#fff3df" stroke="#d6405a" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M17 6 H123 M17 34 H123" stroke="#f7a8c4" stroke-width="1.6" stroke-dasharray="0.1 4" stroke-linecap="round"/>
    <text x="70" y="26" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-weight="bold" font-size="17" fill="#d6405a">Bon Appétit</text>
  </svg>`,
  { size: 512 },
);

const WAFER = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" fill="#e8bd78"/>
    <path d="M0 8H64M0 16H64M0 24H64M0 32H64M0 40H64M0 48H64M0 56H64M8 0V64M16 0V64M24 0V64M32 0V64M40 0V64M48 0V64M56 0V64" stroke="#b9843c" stroke-width="2.4"/>
    <rect width="64" height="64" fill="none" stroke="#a8742c" stroke-width="4"/>
  </svg>`,
  { size: 128 },
);

function swirlTexture(main: string, edge: string) {
  let d = "";
  for (let i = 0; i <= 120; i++) {
    const f = i / 120;
    const a = f * TAU * 3;
    const r = 4 + f * 38;
    d += `${i ? "L" : "M"}${(50 + Math.cos(a) * r).toFixed(2)} ${(50 + Math.sin(a) * r).toFixed(2)}`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#fffaf2" stroke="${edge}" stroke-width="3"/>
      <path d="${d}" fill="none" stroke="${main}" stroke-width="8" stroke-linecap="round"/>
      <ellipse cx="34" cy="30" rx="8" ry="4" fill="#ffffff" opacity="0.7" transform="rotate(-35 34 30)"/>
    </svg>`,
    { size: 192 },
  );
}
const SWIRL_A = swirlTexture("#ff7aa6", "#d6405a");
const SWIRL_B = swirlTexture("#5fc4a8", "#2d8a72");

function pennantTexture(base: string, trim: string) {
  return svg(
    `<svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 49 L39 49 L20 3Z" fill="${base}" stroke="${trim}" stroke-width="2.4" stroke-linejoin="round"/>
      <circle cx="20" cy="38" r="3.4" fill="#fffaf2"/><circle cx="12" cy="42" r="2.2" fill="#fffaf2"/><circle cx="28" cy="42" r="2.2" fill="#fffaf2"/><circle cx="20" cy="25" r="2.2" fill="#fffaf2"/>
    </svg>`,
    { size: 96 },
  );
}
const PENNANTS = [
  pennantTexture("#ff9ec4", "#d6405a"),
  pennantTexture("#9fd0ff", "#4f78d6"),
  pennantTexture("#ffe08a", "#d19a1e"),
  pennantTexture("#a8f0c8", "#2d8a72"),
];

// ---------------------------------------------------------------------------------------------------------------
// Builder and helpers

export default function build() {
  const b = createBuilder({ name: "cake_castle", paintSize: 2048 });
  const R = rng(21);
  const Y0 = 0.075; // top of the shortbread plinth: where the castle stands

  const at = (geo: G, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0, s = 1, sy = s, sz = s): G => {
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(x, y, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")),
      new THREE.Vector3(s, sy, sz),
    );
    return geo.clone().applyMatrix4(m);
  };
  const az = (deg: number, r: number, cx = 0, cz = 0) => {
    const a = deg * DEG;
    return { x: cx + Math.sin(a) * r, z: cz + Math.cos(a) * r, dir: [Math.sin(a), 0, Math.cos(a)] as V };
  };

  // Flat-colour details are collected per colour and merged into one part each.
  const bag = new Map<string, { color: string; glow: number; geos: G[] }>();
  const put = (color: string, geo: G, glowK = 0) => {
    const k = `${color}|${glowK}`;
    let e = bag.get(k);
    if (!e) bag.set(k, (e = { color, glow: glowK, geos: [] }));
    e.geos.push(geo);
  };
  const flush = () => {
    for (const e of bag.values()) {
      const part = b.part(mergeGeometries(e.geos)!, e.color, { at: [0, 0, 0] });
      if (e.glow > 0) glow(part, e.glow);
    }
  };

  const zig = (x: number) => Math.abs((x - Math.floor(x)) * 2 - 1);

  // Layered sponge: sponge / cream / jam / cream bands, frosting on top faces and a dripping coat at the rim.
  type CakeSpec = {
    cx: number; cz: number; y0: number; h: number;
    sponge: string; jam: string; cream: string; frost: string;
    period?: number; wall?: boolean; dripLen?: number;
  };
  function cakePaint(s: CakeSpec): Paint {
    const period = s.period ?? 0.07;
    return paint((p, n) => {
      const top = mix(s.frost, "#ffffff", 0.2 + 0.2 * smoothstep(0.3, 1, n.y));
      if (n.y > 0.55) return top;
      const y = p.y - s.y0;
      const wave = s.wall
        ? Math.abs(Math.sin((p.x + p.z) * 48))
        : Math.abs(Math.sin(Math.atan2(p.x - s.cx, p.z - s.cz) * 5));
      const drip = (s.dripLen ?? 0.03) * (0.3 + 0.7 * wave) + 0.012 * noise(p, 0.05, 2);
      if (y > s.h - drip) return mix(s.frost, "#ffffff", 0.12);
      if (y > s.h - drip - 0.004) return mix(s.frost, s.jam, 0.35);
      const f = (((y / period) % 1) + 1) % 1;
      if (f < 0.52) {
        const c = cells(p, 0.016, 4);
        const crumb = c.d1 < 0.16 ? 0.28 : 0;
        return mix(mix(s.sponge, "#ffffff", 0.08 * n.y), "#a8672e", crumb + 0.1 * noise(p, 0.03, 8));
      }
      if (f < 0.64) return s.cream;
      if (f < 0.76) return s.jam;
      if (f < 0.88) return s.cream;
      return s.sponge;
    });
  }

  // Waffle-cone cone with a scalloped frosting dip.
  function conePaint(cx: number, cz: number, y0: number, hr: number, frost: string, dip: number): Paint {
    return paint((p, n) => {
      const y = p.y - y0;
      const ang = Math.atan2(p.x - cx, p.z - cz);
      const edge = hr * dip + 0.012 * zig((ang * 4) / Math.PI);
      if (y > edge) return mix(frost, "#ffffff", 0.12 + 0.18 * smoothstep(0, 1, n.y) + 0.1 * noise(p, 0.03, 3));
      if (y > edge - 0.004) return mix(frost, "#b58a52", 0.4);
      const u = (ang * 0.06) / 0.014;
      const v = y / 0.014;
      const d1 = u + v - Math.floor(u + v);
      const d2 = u - v - Math.floor(u - v);
      if (d1 < 0.14 || d2 < 0.14) return "#a8702e";
      return mix("#e9b866", "#f6d28c", noise(p, 0.03, 5));
    });
  }

  const LAWN = paint((p) => (cells(p, 0.02, 3).d1 < 0.14 ? "#d6f0b4" : mix("#a6d684", "#8cc86a", noise(p, 0.06, 2))));
  const SHORTBREAD = paint((p, n) =>
    cells(p, 0.014, 9).d1 < 0.09 ? "#c89a52" : mix("#e9c27e", "#f6deac", noise(p, 0.04, 1) * (0.6 + 0.4 * n.y)),
  );
  const JELLY = paint((p, n) => {
    const sparkle = cells(p, 0.03, 6).d1 < 0.1 && n.y > 0.4;
    if (sparkle) return "#ffffff";
    const base = mix("#5aa6ee", "#9dd2ff", noise(p, 0.07, 4));
    return mix(base, "#e8f6ff", 0.55 * smoothstep(0.82, 1, n.y) * noise(p, 0.02, 8));
  });
  const BERRY = paint((p, n) =>
    cells(p, 0.0105, 3).d1 < 0.2 ? "#ffe9a0" : mix("#e0283f", "#ff6a6a", smoothstep(-0.3, 1, n.y) * 0.6),
  );

  // --- small recurring pieces -------------------------------------------------------------------------------
  const beadGeo = new THREE.SphereGeometry(1, 5, 4);
  const beads = (cx: number, y: number, cz: number, r: number, n: number, br: number, color = PEARL, start = 0) => {
    for (let i = 0; i < n; i++) {
      const a = start + (i / n) * TAU;
      put(color, at(beadGeo, cx + Math.sin(a) * r, y, cz + Math.cos(a) * r, 0, 0, 0, br));
    }
  };

  const rosetteGeo = new THREE.LatheGeometry(
    [[0, 0], [0.014, 0], [0.015, 0.005], [0.011, 0.011], [0.012, 0.015], [0.006, 0.02], [0, 0.026]].map(
      ([x, y]) => new THREE.Vector2(x, y),
    ),
    8,
  );
  const rosette = (x: number, y: number, z: number, s = 1) => put(ROSETTE, at(rosetteGeo, x, y, z, 0, 0, 0, s));

  const kissGeo = new THREE.LatheGeometry(
    [[0, 0], [0.016, 0], [0.0165, 0.004], [0.012, 0.012], [0.0135, 0.017], [0.008, 0.024], [0.004, 0.032], [0, 0.038]].map(
      ([x, y]) => new THREE.Vector2(x, y),
    ),
    7,
  );

  const sprinkleGeo = new THREE.CylinderGeometry(0.0013, 0.0013, 0.009, 4, 1);
  const sprinkle = (x: number, y: number, z: number) =>
    put(SPRINKLES[Math.floor(R() * SPRINKLES.length)], at(sprinkleGeo, x, y, z, R() * TAU, R() * 1.2, R() * TAU));
  const sprinklesFlat = (cx: number, cz: number, y: number, r0: number, r1: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const a = R() * TAU;
      const r = r0 + (r1 - r0) * Math.sqrt(R());
      sprinkle(cx + Math.sin(a) * r, y + 0.002, cz + Math.cos(a) * r);
    }
  };
  const sprinklesCone = (cx: number, y0: number, cz: number, rad: number, hr: number, t0: number, t1: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const t = t0 + (t1 - t0) * R();
      const a = R() * TAU;
      const r = rad * (1 - t) + 0.001;
      sprinkle(cx + Math.sin(a) * r, y0 + t * hr, cz + Math.cos(a) * r);
    }
  };

  const drizzle = (cx: number, y0: number, cz: number, rad: number, hr: number, t0: number, t1: number, turns: number) => {
    const pts: number[][] = [];
    const n = Math.round(turns * 10);
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      const t = t0 + (t1 - t0) * f;
      const a = f * turns * TAU;
      const r = rad * (1 - t) + 0.0028;
      pts.push([cx + Math.sin(a) * r, y0 + t * hr, cz + Math.cos(a) * r]);
    }
    b.sweep(catmull(pts), 0.0026, { color: CHOC, detail: 0.6 });
  };

  // Strawberries share one painted part.
  const berryGeos: G[] = [];
  const berryBody = new THREE.LatheGeometry(
    [[0, 0], [0.006, 0.001], [0.015, 0.01], [0.02, 0.022], [0.019, 0.032], [0.012, 0.038], [0, 0.039]].map(
      ([x, y]) => new THREE.Vector2(x, y),
    ),
    8,
  );
  const leafGeo = new THREE.ConeGeometry(0.005, 0.014, 4);
  const strawberry = (x: number, y: number, z: number, s = 1, ry = 0) => {
    berryGeos.push(at(berryBody, x, y, z, ry, 0, 0, s));
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU + ry;
      put("#5aa84a", at(leafGeo, x + Math.sin(a) * 0.007 * s, y + 0.039 * s, z + Math.cos(a) * 0.007 * s, a, 1.1, 0, s));
    }
    put("#4f8a3a", at(new THREE.CylinderGeometry(0.0013, 0.0016, 0.01, 4), x, y + 0.043 * s, z, 0, 0, 0, s));
  };

  const macShell = mergeGeometries([
    at(new THREE.CylinderGeometry(0.017, 0.016, 0.005, 12), 0, 0.0045, 0),
    at(new THREE.CylinderGeometry(0.017, 0.016, 0.005, 12), 0, -0.0045, 0),
  ])!;
  const macCream = new THREE.CylinderGeometry(0.0155, 0.0155, 0.004, 12);

  // --- crenellations ---------------------------------------------------------------------------------------
  function crenelRect(cx: number, cz: number, w: number, d: number, yTop: number, skip?: (x: number, z: number) => boolean) {
    const nx = Math.max(2, Math.round(w / 0.042));
    const nz = Math.max(2, Math.round(d / 0.042));
    let k = 0;
    const mx = new THREE.BoxGeometry(0.028, 0.03, 0.016);
    const mz = new THREE.BoxGeometry(0.016, 0.03, 0.028);
    for (let i = 0; i <= nx; i++) {
      const x = cx - w / 2 + 0.014 + ((w - 0.028) * i) / nx;
      for (const sz of [-1, 1]) {
        const z = cz + sz * (d / 2 - 0.008);
        if (skip?.(x, z)) continue;
        put(k++ % 2 ? "#f9d3dc" : "#fff1dd", at(mx, x, yTop + 0.015, z));
      }
    }
    for (let j = 1; j < nz; j++) {
      const z = cz - d / 2 + 0.014 + ((d - 0.028) * j) / nz;
      for (const sx of [-1, 1]) {
        const x = cx + sx * (w / 2 - 0.008);
        if (skip?.(x, z)) continue;
        put(k++ % 2 ? "#f9d3dc" : "#fff1dd", at(mz, x, yTop + 0.015, z));
      }
    }
  }

  // --- windows and flags -----------------------------------------------------------------------------------
  const windowOn = (target: Parameters<typeof b.decal>[0], pos: V, dir: V, w: number, h: number) =>
    glow(b.decal(target, WINDOW, { at: pos, dir, size: [w, h], segments: 6 }), 0.9);
  const radialWindow = (target: Parameters<typeof b.decal>[0], cx: number, cz: number, r: number, deg: number, yc: number, w: number, h: number) => {
    const q = az(deg, r, cx, cz);
    windowOn(target, [q.x, yc, q.z], q.dir, w, h);
  };

  const PENNANT: [number, number][] = [[0, 0], [0.05, 0.003], [0.042, 0.011], [0.05, 0.019], [0, 0.022]];
  function flagPole(x: number, y: number, z: number, len: number, color: string, side = 1) {
    put(GOLD, at(new THREE.CylinderGeometry(0.0022, 0.0022, len, 5), x, y + len / 2, z));
    put(GOLD, at(new THREE.SphereGeometry(0.005, 6, 4), x, y + len + 0.002, z));
    b.extrude(PENNANT, { at: [x, y + len - 0.024, z], x: [side, 0, 0], thickness: 0.003, color });
  }

  // ===========================================================================================================
  // Board, lawn, plinth, moat, bridge
  put(SILVER, at(new THREE.CylinderGeometry(0.78, 0.78, 0.02, 40), 0, 0.01, 0));
  b.part(new THREE.CircleGeometry(0.77, 40), "#ffffff", { at: [0, 0.0215, 0], dir: [0, 1, 0], axis: "z", texture: DOILY });

  b.lathe([[0, 0.02], [0.655, 0.02], [0.665, 0.035], [0.65, 0.05], [0, 0.05]], { at: [0, 0, 0], color: LAWN, segments: 36 });
  b.lathe([[0, 0.04], [0.43, 0.04], [0.438, 0.058], [0.425, Y0], [0, Y0]], { at: [0, 0, 0], color: SHORTBREAD, segments: 32 });
  b.lathe([[0.43, 0.045], [0.56, 0.045], [0.552, 0.062], [0.52, 0.074], [0.47, 0.074], [0.44, 0.062]], {
    at: [0, 0, 0], color: JELLY, segments: 32,
  });

  // Wafer bridge with candy-cane lamp posts
  b.part(new THREE.BoxGeometry(0.09, 0.014, 0.36), "#ffffff", { at: [0, 0.083, 0.48], texture: WAFER });
  for (const z of [0.36, 0.46, 0.56, 0.64]) for (const s of [1, -1]) {
    put(CHOC, at(new THREE.CylinderGeometry(0.0035, 0.0035, 0.03, 5), s * 0.045, 0.105, z));
  }
  for (const s of [1, -1]) {
    put(CHOC, at(new THREE.BoxGeometry(0.005, 0.005, 0.3), s * 0.045, 0.12, 0.5));
    const cx = s * 0.075;
    const cz = 0.62;
    const cane = catmull([
      [cx, 0.05, cz], [cx, 0.13, cz], [cx, 0.17, cz],
      [cx - s * 0.02, 0.196, cz], [cx - s * 0.04, 0.186, cz], [cx - s * 0.05, 0.166, cz],
    ]);
    b.sweep(cane, 0.0075, {
      color: paint((_p, _n, st) => (Math.floor(st[0] * 16) % 2 ? "#e2334f" : "#ffffff")),
      detail: 0.8,
    });
    put("#ffd35a", at(new THREE.SphereGeometry(0.012, 7, 5), cx - s * 0.05, 0.148, cz), 1.8);
    put(GOLD, at(new THREE.CylinderGeometry(0.0013, 0.0013, 0.008, 4), cx - s * 0.05, 0.162, cz));
  }

  // Lawn decorations
  for (const a of [35, -35, 110, -110, 180]) {
    const q = az(a, 0.6);
    const tex = a > 0 ? SWIRL_A : SWIRL_B;
    put("#fff6ea", at(new THREE.CylinderGeometry(0.003, 0.003, 0.1, 5), q.x, 0.1, q.z));
    const cy = 0.2;
    b.part(new THREE.CircleGeometry(0.048, 16), "#ffffff", { at: [q.x, cy, q.z], dir: q.dir, axis: "z", texture: tex });
    b.part(new THREE.CircleGeometry(0.048, 16), "#ffffff", {
      at: [q.x - q.dir[0] * 0.002, cy, q.z - q.dir[2] * 0.002],
      dir: [-q.dir[0], 0, -q.dir[2]], axis: "z", texture: tex,
    });
    put("#ffffff", at(new THREE.TorusGeometry(0.048, 0.003, 4, 16), q.x - q.dir[0] * 0.001, cy, q.z - q.dir[2] * 0.001, Math.atan2(q.dir[0], q.dir[2])));
  }
  for (const a of [70, -70, 145, -145]) {
    const q = az(a, 0.6);
    strawberry(q.x, 0.05, q.z, 1.6, a * DEG);
  }
  const crystalColors = ["#ff9ec4", "#8fd0ff", "#9ff0c0"];
  for (const [i, a] of [90, -90, 160, -160, 18, -18].entries()) {
    const q = az(a, 0.625);
    const col = crystalColors[i % 3];
    for (let k = 0; k < 3; k++) {
      const h = 0.03 + 0.02 * R();
      put(col, at(new THREE.OctahedronGeometry(0.012, 0), q.x + (R() - 0.5) * 0.035, 0.05 + h * 0.5, q.z + (R() - 0.5) * 0.035, R() * TAU, (R() - 0.5) * 0.5, (R() - 0.5) * 0.5, 1, h / 0.012 * 0.55, 1), 0.35);
    }
  }
  for (const a of [55, -55, 125, -125, 165, -165]) {
    const q = az(a, 0.575);
    put("#fff7ea", at(kissGeo, q.x, 0.05, q.z, 0, 0, 0, 1.3));
  }

  // ===========================================================================================================
  // Curtain walls
  const wallSpec = { y0: Y0, h: 0.2, sponge: "#f3d58e", jam: "#d6405a", cream: "#fff6e6", frost: "#fff0f4", wall: true, period: 0.06, dripLen: 0.035 };
  const mkWall = (w: number, d: number, x: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, 0.2, d), cakePaint({ ...wallSpec, cx: x, cz: z }), { at: [x, Y0 + 0.1, z] });
  const wallF = mkWall(0.5, 0.05, 0, 0.22);
  const wallB = mkWall(0.5, 0.05, 0, -0.22);
  const wallL = mkWall(0.05, 0.44, 0.22, 0);
  const wallR = mkWall(0.05, 0.44, -0.22, 0);
  // Chocolate skirting
  put(CHOC, at(new THREE.BoxGeometry(0.52, 0.02, 0.066), 0, Y0 + 0.01, 0.22));
  put(CHOC, at(new THREE.BoxGeometry(0.52, 0.02, 0.066), 0, Y0 + 0.01, -0.22));
  put(CHOC, at(new THREE.BoxGeometry(0.066, 0.02, 0.44), 0.22, Y0 + 0.01, 0));
  put(CHOC, at(new THREE.BoxGeometry(0.066, 0.02, 0.44), -0.22, Y0 + 0.01, 0));

  const nearTower = (x: number, z: number) =>
    [[0.22, 0.22], [-0.22, 0.22], [0.22, -0.22], [-0.22, -0.22]].some(([tx, tz]) => Math.hypot(x - tx, z - tz) < 0.08);
  const wallSkip = (x: number, z: number) => nearTower(x, z) || (Math.abs(x) < 0.1 && z > 0.15);
  crenelRect(0, 0, 0.49, 0.49, Y0 + 0.2, wallSkip);
  crenelRect(0, 0, 0.4, 0.4, Y0 + 0.2, wallSkip);

  for (const s of [1, -1]) {
    windowOn(wallF, [s * 0.118, Y0 + 0.12, 0.245], [0, 0, 1], 0.032, 0.05);
    windowOn(wallB, [s * 0.1, Y0 + 0.12, -0.245], [0, 0, -1], 0.032, 0.05);
    windowOn(wallL, [0.245, Y0 + 0.12, s * 0.1], [1, 0, 0], 0.032, 0.05);
    windowOn(wallR, [-0.245, Y0 + 0.12, s * 0.1], [-1, 0, 0], 0.032, 0.05);
  }
  windowOn(wallB, [0, Y0 + 0.12, -0.245], [0, 0, -1], 0.032, 0.05);
  windowOn(wallL, [0.245, Y0 + 0.12, 0], [1, 0, 0], 0.032, 0.05);
  windowOn(wallR, [-0.245, Y0 + 0.12, 0], [-1, 0, 0], 0.032, 0.05);

  // ===========================================================================================================
  // Corner towers
  type Pal = { sponge: string; jam: string; cream: string; frost: string };
  function tower(x: number, z: number, h: number, r: number, pal: Pal, roofFrost: string, dip: number, flag: string) {
    const body = b.part(
      new THREE.CylinderGeometry(r, r, h, 14, 1),
      cakePaint({ cx: x, cz: z, y0: Y0, h, ...pal, period: 0.065, dripLen: 0.04 }),
      { at: [x, Y0 + h / 2, z] },
    );
    const top = Y0 + h;
    put("#fffaf0", at(new THREE.CylinderGeometry(r + 0.014, r + 0.014, 0.022, 14), x, top + 0.011, z));
    beads(x, top - 0.002, z, r + 0.004, 16, 0.0065);
    beads(x, top + 0.0225, z, r + 0.012, 16, 0.005, GOLD, 0.2);
    const hr = h > 0.33 ? 0.21 : 0.18;
    const rad = r + 0.018;
    const roofBase = top + 0.022;
    b.part(new THREE.ConeGeometry(rad, hr, 12, 1), conePaint(x, z, roofBase, hr, roofFrost, dip), { at: [x, roofBase + hr / 2, z] });
    beads(x, roofBase + hr * (dip + 0.1), z, rad * (1 - dip - 0.1) + 0.002, 10, 0.0055, GOLD, 0.1);
    sprinklesCone(x, roofBase, z, rad, hr, dip + 0.14, 0.82, 22);
    drizzle(x, roofBase, z, rad, hr, dip + 0.12, 0.84, 2.2);
    flagPole(x, roofBase + hr, z, 0.05, flag, x > 0 ? 1 : -1);
    const a0 = Math.atan2(Math.sign(x), Math.sign(z)) / DEG;
    for (const d of [-32, 32]) radialWindow(body, x, z, r, a0 + d, Y0 + h * 0.55, 0.03, 0.047);
    // piped ring of rosettes at the base
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU;
      rosette(x + Math.sin(a) * (r + 0.012), Y0, z + Math.cos(a) * (r + 0.012), 0.7);
    }
  }
  tower(0.22, 0.22, 0.3, 0.065, { sponge: "#ffc8d6", jam: "#e95b82", cream: CREAM, frost: "#ffe3ec" }, "#f7a8c4", 0.42, "#d6405a");
  tower(-0.22, 0.22, 0.3, 0.065, { sponge: "#bfd3ff", jam: "#5f7de0", cream: CREAM, frost: "#e3ebff" }, "#8fb0f0", 0.42, "#3f66d6");
  tower(0.22, -0.22, 0.36, 0.07, { sponge: "#fbe08a", jam: "#f0a030", cream: CREAM, frost: "#fff3c4" }, "#ffe08a", 0.4, "#e0961e");
  tower(-0.22, -0.22, 0.36, 0.07, { sponge: "#c9e4a6", jam: "#6fae52", cream: CREAM, frost: "#e4f5cf" }, "#a9e2c4", 0.4, "#2d8a72");

  // ===========================================================================================================
  // Gatehouse
  const GZ = 0.25;
  const gate = b.part(
    new THREE.BoxGeometry(0.16, 0.3, 0.12),
    cakePaint({ ...wallSpec, h: 0.3, cx: 0, cz: GZ, sponge: "#f6dca0", jam: "#e95b82", frost: "#ffe9ef", period: 0.06 }),
    { at: [0, Y0 + 0.15, GZ] },
  );
  const gateTop = Y0 + 0.3;
  crenelRect(0, GZ, 0.16, 0.12, gateTop);
  b.part(new THREE.PlaneGeometry(0.1, 0.14), "#ffffff", { at: [0, Y0 + 0.07, GZ + 0.061], dir: [0, 0, 1], axis: "z", texture: DOOR });
  b.part(new THREE.PlaneGeometry(0.14, 0.04), "#ffffff", { at: [0, Y0 + 0.17, GZ + 0.0615], dir: [0, 0, 1], axis: "z", texture: PLAQUE });
  for (const s of [1, -1]) {
    windowOn(gate, [s * 0.0805, Y0 + 0.22, GZ], [s, 0, 0], 0.03, 0.045);
    flagPole(s * 0.062, gateTop + 0.03, GZ - 0.032, 0.09, s > 0 ? "#ff7aa6" : "#6ea0ff", s);
    rosette(s * 0.035, gateTop, GZ + 0.0, 1);
  }
  strawberry(0, gateTop, GZ, 1.5, 0.3);
  // piped bead border round the gate
  for (let i = 0; i <= 14; i++) {
    const a = Math.PI * (i / 14);
    put(PEARL, at(beadGeo, -Math.cos(a) * 0.056, Y0 + 0.09 + Math.sin(a) * 0.054, GZ + 0.0625, 0, 0, 0, 0.0045));
  }
  for (let i = 0; i < 4; i++) {
    put(PEARL, at(beadGeo, -0.056, Y0 + 0.09 - i * 0.02, GZ + 0.0625, 0, 0, 0, 0.0045));
    put(PEARL, at(beadGeo, 0.056, Y0 + 0.09 - i * 0.02, GZ + 0.0625, 0, 0, 0, 0.0045));
  }

  // Bunting across the front
  const buntPath = catmull([
    [-0.2, 0.345, 0.285], [-0.1, 0.31, 0.335], [0, 0.295, 0.34], [0.1, 0.31, 0.335], [0.2, 0.345, 0.285],
  ]);
  b.sweep(buntPath, 0.0015, { color: "#fffaf2", detail: 0.5 });
  const buntFrames = Array.from({ length: 13 }, (_, i) => frame(buntPath.at((i + 0.5) / 13), [0, 1, 0]));
  b.cards(buntFrames, PENNANTS, { size: [0.03, 0.04], lean: 180, flow: [0, 0, 1], rng: rng(5), sink: 0 });

  // Gummy-bear guards on the bridge
  function gummy(x: number, y: number, z: number, ry: number, color: string) {
    const light = "#" + new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.45).getHexString();
    const S = (r: number) => new THREE.SphereGeometry(r, 7, 5);
    const body: G[] = [
      at(S(0.02), 0, 0.042, 0, 0, 0, 0, 1, 1.1, 0.9),
      at(S(0.0175), 0, 0.074, 0.002),
      at(S(0.0065), 0.012, 0.088, 0),
      at(S(0.0065), -0.012, 0.088, 0),
      at(S(0.0085), 0.022, 0.048, 0.004, 0, 0, 0, 1, 1.3, 1),
      at(S(0.0085), -0.022, 0.048, 0.004, 0, 0, 0, 1, 1.3, 1),
      at(S(0.0095), 0.012, 0.012, 0.006, 0, 0, 0, 1, 1, 1.2),
      at(S(0.0095), -0.012, 0.012, 0.006, 0, 0, 0, 1, 1, 1.2),
    ];
    const T = (g: G) => at(g, x, y, z, ry);
    put(color, T(mergeGeometries(body)!), 0.35);
    put(light, T(at(S(0.0075), 0, 0.071, 0.015)), 0.35);
    put("#2a1a22", T(mergeGeometries([at(S(0.003), 0, 0.0735, 0.0215), at(S(0.0028), 0.0065, 0.0785, 0.0135), at(S(0.0028), -0.0065, 0.0785, 0.0135)])!));
    put("#9b5a2a", T(at(new THREE.CylinderGeometry(0.0016, 0.0016, 0.13, 5), 0.03, 0.065, 0.012)));
    put("#e8c27a", T(at(new THREE.ConeGeometry(0.004, 0.014, 5), 0.03, 0.137, 0.012)));
  }
  gummy(-0.034, 0.09, 0.4, 0.25, "#e8334a");
  gummy(0.034, 0.09, 0.4, -0.25, "#3fbf6a");

  // ===========================================================================================================
  // Central keep
  const KC = -0.03;
  const t1 = b.part(
    new THREE.CylinderGeometry(0.14, 0.14, 0.25, 16),
    cakePaint({ cx: 0, cz: KC, y0: Y0, h: 0.25, sponge: "#7a4a2e", jam: "#d6405a", cream: "#fff3e0", frost: "#5a3020", period: 0.0625, dripLen: 0.05 }),
    { at: [0, Y0 + 0.125, KC] },
  );
  const L1 = Y0 + 0.25;
  const t2 = b.part(
    new THREE.CylinderGeometry(0.105, 0.105, 0.17, 14),
    cakePaint({ cx: 0, cz: KC, y0: L1, h: 0.17, sponge: "#fdeab4", jam: "#f48fb1", cream: "#fff6ea", frost: "#ffd1df", period: 0.0567, dripLen: 0.04 }),
    { at: [0, L1 + 0.085, KC] },
  );
  const L2 = L1 + 0.17;
  const t3 = b.part(
    new THREE.CylinderGeometry(0.07, 0.07, 0.13, 12),
    cakePaint({ cx: 0, cz: KC, y0: L2, h: 0.13, sponge: "#c9e4a6", jam: "#8bbf6a", cream: "#fff6ea", frost: "#e4f5cf", period: 0.065, dripLen: 0.035 }),
    { at: [0, L2 + 0.065, KC] },
  );
  const L3 = L2 + 0.13;

  // Tier 1 ledge: macarons standing on edge and a pearl border
  const macColors = ["#f7a8c4", "#a9e2c4", "#ffe08a", "#c7b0f0"];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU + 0.1;
    const x = Math.sin(a) * 0.1235;
    const z = KC + Math.cos(a) * 0.1235;
    put(macColors[i % 4], at(macShell, x, L1 + 0.017, z, a, Math.PI / 2 - 0.12));
    put("#fff5e1", at(macCream, x, L1 + 0.017, z, a, Math.PI / 2 - 0.12));
  }
  beads(0, L1 + 0.003, KC, 0.1385, 44, 0.0042);
  sprinklesFlat(0, KC, L1, 0.108, 0.136, 30);
  // Tier 2 ledge: strawberries, candles, beads
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    strawberry(Math.sin(a) * 0.088, L2, KC + Math.cos(a) * 0.088, 0.9, a);
  }
  const candleCols = ["#ffb3cf", "#a6c8ff", "#b4f0d2", "#ffe9a0"];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + Math.PI / 8;
    const x = Math.sin(a) * 0.088;
    const z = KC + Math.cos(a) * 0.088;
    put(candleCols[i], at(new THREE.CylinderGeometry(0.0045, 0.0045, 0.05, 6), x, L2 + 0.025, z));
    put("#2a1a22", at(new THREE.CylinderGeometry(0.0007, 0.0007, 0.006, 3), x, L2 + 0.053, z));
    put("#ffcf4a", at(new THREE.SphereGeometry(0.0065, 6, 4), x, L2 + 0.062, z, 0, 0, 0, 0.8, 1.7, 0.8), 2.4);
  }
  beads(0, L2 + 0.003, KC, 0.1035, 34, 0.004);
  sprinklesFlat(0, KC, L2, 0.073, 0.1, 22);

  // Keep roof
  put("#fffaf0", at(new THREE.CylinderGeometry(0.088, 0.088, 0.02, 14), 0, L3 + 0.01, KC));
  beads(0, L3 - 0.002, KC, 0.074, 24, 0.0055);
  beads(0, L3 + 0.0205, KC, 0.09, 22, 0.0048, GOLD, 0.1);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    rosette(Math.sin(a) * 0.092, L3 + 0.02, KC + Math.cos(a) * 0.092, 0.45);
  }
  const KR = 0.088;
  const KH = 0.21;
  const KB = L3 + 0.02;
  b.part(new THREE.ConeGeometry(KR, KH, 14, 1), conePaint(0, KC, KB, KH, "#f7a8c4", 0.3), { at: [0, KB + KH / 2, KC] });
  for (const t of [0.4, 0.6]) beads(0, KB + KH * t, KC, KR * (1 - t) + 0.002, Math.round(14 * (1 - t)) + 4, 0.0048, GOLD, 0.3);
  sprinklesCone(0, KB, KC, KR, KH, 0.26, 0.9, 36);
  drizzle(0, KB, KC, KR, KH, 0.3, 0.9, 3.2);
  // cherry on top
  const topY = KB + KH;
  b.part(new THREE.SphereGeometry(0.019, 9, 7), "#c2102f", { at: [0, topY + 0.013, KC] });
  put("#ff6a7a", at(new THREE.SphereGeometry(0.005, 5, 4), 0.007, topY + 0.022, KC + 0.011));
  b.sweep(catmull([[0, topY + 0.028, KC], [0.003, topY + 0.045, KC], [0.014, topY + 0.058, KC]]), 0.0013, { color: "#4f8a3a", detail: 0.6 });

  // Keep windows
  for (const a of [0, 72, -72, 144, -144]) radialWindow(t2, 0, KC, 0.105, a, L1 + 0.09, 0.034, 0.054);
  for (const a of [36, -36, 108, -108, 180]) radialWindow(t3, 0, KC, 0.07, a, L2 + 0.07, 0.03, 0.048);
  radialWindow(t1, 0, KC, 0.14, 150, Y0 + 0.2, 0.03, 0.048);
  radialWindow(t1, 0, KC, 0.14, -150, Y0 + 0.2, 0.03, 0.048);
  radialWindow(t1, 0, KC, 0.14, 180, Y0 + 0.2, 0.03, 0.048);
  void t1;

  // ===========================================================================================================
  // Courtyard and wall-top treats
  for (const [x, z] of [[0.15, 0.16], [-0.15, 0.16], [0.15, -0.15], [-0.15, -0.15]] as [number, number][]) {
    put("#fff1dd", at(new THREE.CylinderGeometry(0.01, 0.01, 0.002, 8), x, Y0 + 0.001, z));
    rosette(x, Y0 + 0.002, z, 0.8);
  }
  for (const x of [-0.12, 0, 0.12]) {
    rosette(x, Y0 + 0.2, 0.22, 0.7);
    rosette(x, Y0 + 0.2, -0.22, 0.7);
  }
  for (const z of [-0.1, 0.1]) {
    rosette(0.22, Y0 + 0.2, z, 0.7);
    rosette(-0.22, Y0 + 0.2, z, 0.7);
  }
  sprinklesFlat(0, 0.22, Y0 + 0.2, 0, 0.04, 6);

  // Painted strawberries (one merged part)
  b.part(mergeGeometries(berryGeos)!, BERRY, { at: [0, 0, 0] });

  flush();
  return b.root;
}
```