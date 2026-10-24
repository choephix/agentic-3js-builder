import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, catmull, polyline, spiral, offset, rng, mix, noise, paint, smoothstep, svg, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, gaugeTexture, gearTrain } from "../../../../kits/clockwork";

export const meta = {
  name: "Nautilus",
  description:
    "Captain Nemo's Nautilus: a 60 m riveted iron spindle hull with brass hoops, a glowing salon window, porthole rows, an octagonal pilot house with a flag, a searchlight lantern on geared yokes, a ram spur, a skiff on deck, a skylight, dive planes, a rudder and a four-bladed screw.",
};

// ---------------------------------------------------------------------------------------------------------------
// Dimensions (meters). The hull runs along z, bow at +z.
const R = 4;
const HL = 29.5;
const Y0 = 4.3;
const D2R = Math.PI / 180;
const hullR = (z: number) => {
  const u = Math.min(Math.abs(z) / HL, 1);
  return R * Math.pow(1 - Math.pow(u, 2.4), 0.55);
};

// Palette
const BRASS_F = "#c99a3e";
const BRASS_D = "#8c6a26";
const GILT_F = "#e2b650";
const IRON_F = "#2b3339";
const DARK = "#141b1f";
const AMBER = "#ffb347";
const WOOD = "#5e3a20";
const WOOD_D = "#3b2314";
const LAMPY = "#ffe7a0";
const GLASS = "#ffc766";
const RED = "#ff4a3a";
const GREEN = "#43e07a";
const SEAMC = "#10171b";

const BRASS = metal("brass", { size: 1.1, tarnish: 0.35, polish: 0.4, verdigris: 0.15 });
const COPPER = metal("copper", { size: 1.2, verdigris: 0.55 });
const IRON = metal("iron", { size: 1.5 });
const BLUED = metal("blued", { size: 1.4, tarnish: 0.25 });

// Hull paint: riveted plates in staggered rows, oxblood belly under a brass waterline, patina and sun-bleaching.
const PH = (2 * Math.PI * 4) / 16;
const PW = 3.0;
const hash2 = (a: number, b: number) => {
  const k = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return k - Math.floor(k);
};
const hullPaint = paint((p, n) => {
  const dy = p.y - Y0;
  const rr = Math.max(hullR(p.z), 0.5);
  const v = dy / rr;
  const arc = Math.atan2(p.x, dy) * 4;
  const row = Math.floor(arc / PH);
  const along = p.z + (row & 1 ? PW / 2 : 0);
  const col = Math.floor(along / PW);
  const rnd = hash2(col, row);
  const du = along - col * PW;
  const dv = arc - row * PH;
  const sdu = Math.min(du, PW - du);
  const sdv = Math.min(dv, PH - dv);
  const wob = (noise(p, 2.5, 3) - 0.5) * 0.3;
  const belly = smoothstep(-0.26, -0.38, v + wob);
  let c = mix(mix("#3d5862", "#2f4a54", rnd), mix("#6d3228", "#552620", rnd), belly);
  c = mix(c, "#4f8f7c", 0.4 * smoothstep(0.55, 0.78, noise(p, 1.6, 9)) * (1 - belly));
  c = mix(c, "#7f9a9a", 0.18 * smoothstep(0.4, 1, n.y) * (1 - belly));
  if (Math.abs(v + wob + 0.32) < 0.028) return mix(c, "#c99a3e", 0.9);
  const sd = Math.min(sdu, sdv);
  if (sd < 0.045) return mix(c, SEAMC, 0.85);
  if (sd < 0.085) return mix(c, "#9fb8bc", 0.16);
  const q1 = (dv % 0.3927) - 0.196;
  const q2 = (du % 0.5) - 0.25;
  const d = Math.min(Math.hypot(sdu - 0.17, q1), Math.hypot(sdv - 0.17, q2));
  if (d < 0.07) return mix(c, "#b8c8c8", 0.5);
  if (d < 0.095) return mix(c, SEAMC, 0.5);
  return c;
});

// ---------------------------------------------------------------------------------------------------------------
// Textures
const PORT = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="g" cx="0.4" cy="0.38" r="0.75"><stop offset="0" stop-color="#fff6c8"/><stop offset="0.55" stop-color="#ffc44f"/><stop offset="1" stop-color="#e0761f"/></radialGradient></defs>
  <circle cx="32" cy="32" r="31" fill="url(#g)"/>
  <path d="M10 22 Q16 9 30 6" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8"/>
  <path d="M40 54 Q50 50 56 40" stroke="#fff0b0" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6"/>
</svg>`,
  { size: 96 },
);

const shelves = (() => {
  let s = "";
  const cols = ["#a85a1c", "#c47a2c", "#8a4a18", "#d89440"];
  for (let pane = 0; pane < 4; pane++)
    for (let row = 0; row < 2; row++) {
      const y = 56 + row * 16;
      s += `<rect x="${pane * 67.5 + 4}" y="${y + 13}" width="59" height="2" fill="#6a3a12"/>`;
      for (let k = 0; k < 9; k++)
        s += `<rect x="${pane * 67.5 + 6 + k * 6.3}" y="${y + 3 + ((k * 3 + pane + row) % 4)}" width="4.6" height="${10 - ((k * 3 + pane + row) % 4)}" fill="${cols[(k + pane + row) % 4]}" opacity="0.75"/>`;
    }
  return s;
})();
const SALON = svg(
  `<svg viewBox="0 0 270 90" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a0"/><stop offset="1" stop-color="#ff9a3a"/></linearGradient>
  <radialGradient id="c"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></radialGradient></defs>
  <rect width="270" height="90" fill="url(#s)"/>
  ${shelves}
  <circle cx="135" cy="36" r="22" fill="url(#c)"/>
  <circle cx="135" cy="36" r="6" fill="#fffbe0"/>
  <path d="M135 14 V30 M118 40 Q135 52 152 40 M120 33 L150 33" stroke="#6a3a12" stroke-width="1.6" fill="none"/>
  <path d="M0 0 H270 V12 Q258 24 247 12 Q236 24 225 12 Q214 24 202 12 Q191 24 180 12 Q168 24 157 12 Q146 24 135 12 Q124 24 112 12 Q101 24 90 12 Q78 24 67 12 Q56 24 45 12 Q34 24 22 12 Q11 24 0 12Z" fill="#7a1f1f"/>
  <path d="M0 12 Q11 24 22 12 M45 12 Q56 24 67 12 M90 12 Q101 24 112 12 M135 12 Q146 24 157 12 M180 12 Q191 24 202 12 M225 12 Q236 24 247 12" stroke="#d6a23a" stroke-width="1.6" fill="none"/>
  <path d="M30 80 L70 20 M80 86 L110 40" stroke="#ffffff" stroke-width="5" opacity="0.28"/>
  <rect x="65.5" y="0" width="3.6" height="90" fill="#3a2410"/><rect x="133.2" y="0" width="3.6" height="90" fill="#3a2410"/><rect x="200.9" y="0" width="3.6" height="90" fill="#3a2410"/>
</svg>`,
  { size: 1024 },
);

const PANE = svg(
  `<svg viewBox="0 0 40 36" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff8d0"/><stop offset="1" stop-color="#ffc25a"/></linearGradient></defs>
  <rect width="40" height="36" rx="4" fill="url(#p)"/>
  <path d="M20 0 V36 M0 18 H40" stroke="#5a3a14" stroke-width="2.2"/>
  <path d="M5 28 L16 6" stroke="#ffffff" stroke-width="3" opacity="0.6" stroke-linecap="round"/>
</svg>`,
  { size: 96 },
);

const LENS = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="l"><stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="#fff2a0"/><stop offset="1" stop-color="#ffc040"/></radialGradient></defs>
  <circle cx="50" cy="50" r="49" fill="url(#l)"/>
  <circle cx="50" cy="50" r="16" fill="none" stroke="#ffd860" stroke-width="2.6"/>
  <circle cx="50" cy="50" r="28" fill="none" stroke="#ffd860" stroke-width="2.6"/>
  <circle cx="50" cy="50" r="40" fill="none" stroke="#ffd860" stroke-width="2.6"/>
  <circle cx="50" cy="50" r="48" fill="none" stroke="#9a6c1a" stroke-width="3"/>
</svg>`,
  { size: 192 },
);

const rays = (() => {
  let s = "";
  for (let i = 0; i < 16; i++) {
    const a = (i * 22.5 * Math.PI) / 180;
    const a2 = a + 0.14;
    s += `<path d="M${50 + 38 * Math.sin(a)} ${50 - 38 * Math.cos(a)} L${50 + 46 * Math.sin(a + 0.07)} ${50 - 46 * Math.cos(a + 0.07)} L${50 + 38 * Math.sin(a2)} ${50 - 38 * Math.cos(a2)}Z" fill="#f4cf6a"/>`;
  }
  return s;
})();
const MEDAL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#8c6a26"/>
  <circle cx="50" cy="50" r="45" fill="#e2b650"/>
  ${rays}
  <circle cx="50" cy="50" r="35" fill="#0f1c24" stroke="#8c6a26" stroke-width="2"/>
  <text x="50" y="68" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="56" fill="#f2c85a" stroke="#6a4a14" stroke-width="1.2">N</text>
</svg>`,
  { size: 256 },
);

const NAME = svg(
  `<svg viewBox="0 0 270 46" xmlns="http://www.w3.org/2000/svg">
  <text x="135" y="35" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="38" letter-spacing="7" fill="#e8b94a" stroke="#2a1a08" stroke-width="2.4" paint-order="stroke">NAUTILUS</text>
  <path d="M4 40 H262" stroke="#e8b94a" stroke-width="2.4"/>
</svg>`,
  { size: 1024 },
);

const MOTTO = svg(
  `<svg viewBox="0 0 360 30" xmlns="http://www.w3.org/2000/svg">
  <text x="180" y="22" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-weight="bold" font-size="21" letter-spacing="3" fill="#e8b94a" stroke="#2a1a08" stroke-width="2" paint-order="stroke">MOBILIS IN MOBILI</text>
</svg>`,
  { size: 1024 },
);

const KELP = svg(
  `<svg viewBox="0 0 24 96" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="k" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2f5e2a"/><stop offset="1" stop-color="#8fbf4a"/></linearGradient></defs>
  <path d="M9 96 C3 70 16 55 8 30 C6 20 11 8 13 0 C16 10 19 22 17 34 C22 56 10 72 15 96 Z" fill="url(#k)" stroke="#1f4220" stroke-width="1.2"/>
  <path d="M12 94 C10 70 16 50 12 4" stroke="#2c5a26" stroke-width="1.4" fill="none"/>
</svg>`,
  { size: 128 },
);

const GAUGE_A = gaugeTexture({ label: "DEPTH", needle: 40 });
const GAUGE_B = gaugeTexture({ label: "PSI", needle: 105 });

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "nautilus", paintSize: 2048 });
  const hullJ = b.joint("hull", { at: [0, Y0, 0] });
  const propJ = b.joint("propeller", { parent: hullJ, at: [0, Y0, -31.2], dir: [0, 0, -1] });
  const rudderJ = b.joint("rudder", { parent: hullJ, at: [0, Y0, -25.5], dir: [0, 1, 0], role: "hinge" });
  const planeJ = {
    1: b.joint("planeL", { parent: hullJ, at: [3.0, Y0 - 1.5, 12], dir: [1, 0, 0], role: "hinge" }),
    [-1]: b.joint("planeR", { parent: hullJ, at: [-3.0, Y0 - 1.5, 12], dir: [-1, 0, 0], role: "hinge" }),
  } as Record<number, ReturnType<typeof b.joint>>;

  const P = (geo: THREE.BufferGeometry, color: any, at: any, o: any = {}) => b.part(geo, color, { bone: hullJ, at, ...o });
  const LA = (outline: [number, number][], at: any, axis: any, color: any, o: any = {}) =>
    b.lathe(outline, { at, axis, color, bone: hullJ, ...o });
  const frust = (rb: number, rt: number, h: number, seg = 8) => {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg, 1);
    g.rotateY(Math.PI / seg);
    return g;
  };
  const stack = (layers: [number, number, number][], y0: number, x: number, z: number, color: any, o: any = {}) => {
    let yy = y0;
    for (const [rb, rt, h] of layers) {
      P(frust(rb, rt, h), color, [x, yy + h / 2, z], { flat: true, ...o });
      yy += h;
    }
    return yy;
  };
  const boltGeos: THREE.BufferGeometry[] = [];
  const bolt = (p: any, r = 0.1) => {
    const [x, y, z] = Array.isArray(p) ? p : [p.x, p.y, p.z];
    boltGeos.push(new THREE.SphereGeometry(r, 6, 4).translate(x, y, z));
  };
  const pt = (q: any) => (q.at ?? q) as THREE.Vector3;

  // ---- Hull ---------------------------------------------------------------------------------------------------
  const prof: [number, number][] = [];
  const N = 36;
  for (let i = 0; i <= N; i++) {
    const z = -HL * Math.cos((Math.PI * i) / N);
    prof.push([i === 0 || i === N ? 0 : Math.max(hullR(z), 0.02), z]);
  }
  const hull = b.lathe(prof, { at: [0, Y0, 0], axis: [0, 0, 1], segments: 20, color: hullPaint, bone: hullJ, name: "hull" });
  const skin = b.surface(hull);
  const topAt = (x: number, z: number) => skin.ray([x, 40, z], [0, -1, 0])!.at.y;

  // Keel skid
  b.extrude(
    [
      [-22, 1.8],
      [-17, 0],
      [17, 0],
      [22, 1.8],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.8, bevel: 0.1, color: IRON, bone: hullJ, name: "keel" },
  );

  // Brass hoops round the lower hull
  for (const z of [-24, -18, -12, -6, 6, 12, 18, 24]) {
    const loop = skin.loop([0, Y0, z], { dir: [0, 0, 1], lift: 0.07 });
    b.sweep(loop.slice(0.15, 0.85), 0.13, { color: BRASS_F, sides: 6, bone: hullJ });
  }

  // Brass rub rails
  const rail = (s: number, za: number, zb: number) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 12; i++) {
      const z = za + ((zb - za) * i) / 12;
      const h = skin.around([0, Y0, z]).at(s * 90, -12)!;
      pts.push(offset(h.at, h.n, 0.06));
    }
    b.sweep(catmull(pts), 0.11, { color: BRASS_F, sides: 6, bone: hullJ });
  };
  for (const s of [1, -1]) {
    rail(s, -25, -6.5);
    rail(s, 6.5, 25);
  }

  // ---- Portholes ----------------------------------------------------------------------------------------------
  const portZ: number[] = [];
  for (let m = -5; m <= 4; m++)
    for (const k of [1.5, 3, 4.5]) {
      const z = 6 * m + k;
      if (Math.abs(z) <= 25.5 && Math.abs(z) > 5.4) portZ.push(z);
    }
  for (const s of [1, -1])
    for (const z of portZ) {
      const h = skin.around([0, Y0, z]).at(s * 90, 6)!;
      P(new THREE.TorusGeometry(0.46, 0.11, 5, 10), BRASS_F, offset(h.at, h.n, 0.04), { dir: h.n, axis: "z", flat: true });
      glow(
        P(new THREE.CircleGeometry(0.42, 10), "#ffffff", offset(h.at, h.n, 0.07), {
          dir: h.n,
          axis: "z",
          up: [0, 1, 0],
          texture: PORT,
        }),
        1.1,
      );
    }

  // ---- Salon windows ------------------------------------------------------------------------------------------
  const densify = (pts: number[][], closed: boolean, maxSeg = 0.6) => {
    const out: number[][] = [];
    const cnt = closed ? pts.length : pts.length - 1;
    for (let i = 0; i < cnt; i++) {
      const a = pts[i];
      const c = pts[(i + 1) % pts.length];
      const d = Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
      const k = Math.max(1, Math.ceil(d / maxSeg));
      for (let j = 0; j < k; j++) out.push([a[0] + ((c[0] - a[0]) * j) / k, a[1] + ((c[1] - a[1]) * j) / k, a[2] + ((c[2] - a[2]) * j) / k]);
    }
    if (!closed) out.push(pts[pts.length - 1]);
    return out;
  };
  const roundRect = (s: number, hw: number, hh: number, rad: number) => {
    const pts: number[][] = [];
    const corners: [number, number, number][] = [
      [hw - rad, hh - rad, 0],
      [-(hw - rad), hh - rad, 90],
      [-(hw - rad), -(hh - rad), 180],
      [hw - rad, -(hh - rad), 270],
    ];
    for (const [cz, cy, a0] of corners)
      for (let i = 0; i <= 4; i++) {
        const a = (a0 + (90 * i) / 4) * D2R;
        pts.push([s * 5, Y0 + cy + rad * Math.sin(a), cz + rad * Math.cos(a)]);
      }
    return pts;
  };
  for (const s of [1, -1]) {
    glow(
      b.decal(hull, SALON, { at: [s * 3.99, Y0, 0], dir: [s, 0, 0], size: [9.0, 3.0], segments: 26, lift: 0.03, bone: hullJ }),
      1.0,
    );
    const frameLoop = skin.drape(polyline(densify(roundRect(s, 4.55, 1.5, 0.45), true), { closed: true }), { lift: 0.05 });
    b.sweep(frameLoop, 0.15, { color: GILT_F, sides: 6, bone: hullJ });
    for (let i = 0; i < 44; i++) bolt(pt(frameLoop.at(i / 44)), 0.12);
    for (const z of [-2.25, 0, 2.25]) {
      const bar = skin.drape(
        polyline(
          densify(
            [
              [s * 5, Y0 - 1.4, z],
              [s * 5, Y0 + 1.4, z],
            ],
            false,
            0.4,
          ),
        ),
        { lift: 0.06 },
      );
      b.sweep(bar, 0.08, { color: BRASS_D, sides: 6, bone: hullJ });
    }
    // lettering and medallions
    const nameHit = skin.around([0, Y0, 15]).at(s * 90, -28)!;
    glow(b.decal(hull, NAME, { at: nameHit, size: [5.4, 0.92], segments: 14, lift: 0.03, bone: hullJ }), 0.35);
    const mottoHit = skin.around([0, Y0, -15]).at(s * 90, -28)!;
    glow(b.decal(hull, MOTTO, { at: mottoHit, size: [5.4, 0.45], segments: 14, lift: 0.03, bone: hullJ }), 0.35);
    const medHit = skin.around([0, Y0, 21]).at(s * 90, -28)!;
    b.decal(hull, MEDAL, { at: medHit, size: [1.7, 1.7], segments: 8, lift: 0.04, bone: hullJ });
    // running lamps: red to port (left), green to starboard
    const lh = skin.around([0, Y0, 20]).at(s * 90, 42)!;
    P(new THREE.CylinderGeometry(0.34, 0.4, 0.3, 8), BRASS_F, offset(lh.at, lh.n, 0.02), { dir: lh.n, flat: true });
    glow(P(new THREE.SphereGeometry(0.3, 8, 6), s > 0 ? RED : GREEN, offset(lh.at, lh.n, 0.3), { flat: true }), 1.6);
  }

  // ---- Pilot house --------------------------------------------------------------------------------------------
  const PZ = 12;
  const pbase = topAt(0, PZ) - 0.7;
  let y = stack([[2.75, 2.5, 0.7]], pbase, 0, PZ, BRASS);
  const wallBase = y;
  y = stack([[2.2, 2.05, 2.6]], y, 0, PZ, BLUED);
  const wy = wallBase + 1.35;
  y = stack(
    [
      [2.45, 2.55, 0.3],
      [2.5, 2.1, 0.2],
    ],
    y,
    0,
    PZ,
    BRASS,
  );
  const domeTop = stack(
    [
      [2.25, 1.9, 0.35],
      [1.9, 1.35, 0.6],
      [1.35, 0.7, 0.6],
      [0.7, 0.3, 0.5],
    ],
    y,
    0,
    PZ,
    COPPER,
  );
  P(new THREE.SphereGeometry(0.3, 8, 6), GILT_F, [0, domeTop + 0.1, PZ]);
  glow(P(new THREE.SphereGeometry(0.22, 8, 6), AMBER, [0, domeTop + 0.52, PZ]), 1.6);
  // dome ribs
  for (let k = 0; k < 8; k++) {
    const a = k * 45 * D2R;
    const r0 = 2.15;
    const r1 = 0.35;
    b.rod(
      [Math.sin(a) * r0, y + 0.05, PZ + Math.cos(a) * r0],
      [Math.sin(a) * r1, domeTop - 0.05, PZ + Math.cos(a) * r1],
      0.06,
      BRASS_D,
      { bone: hullJ, sides: 5 },
    );
  }
  // bolts on flange
  for (let k = 0; k < 16; k++) {
    const a = (k * 22.5 + 11) * D2R;
    bolt([Math.sin(a) * 2.6, pbase + 0.72, PZ + Math.cos(a) * 2.6], 0.11);
  }
  b.ring(frame([0, wy, PZ], [0, 1, 0]), { count: 8, radius: 2.0 }, (it) => {
    const i = it.i;
    if (i === 4) {
      P(new THREE.BoxGeometry(1.3, 0.2, 1.9), BRASS_D, offset(it.at, it.axis, 0), { dir: it.axis });
      const wc = offset(it.at, it.axis, 0.14);
      P(new THREE.TorusGeometry(0.32, 0.05, 5, 10), GILT_F, wc, { dir: it.axis, axis: "z" });
      for (const rot of [0, 60, 120])
        P(new THREE.BoxGeometry(0.64, 0.05, 0.05), GILT_F, wc, { dir: it.axis, axis: "z", rotation: [0, 0, rot] });
      return;
    }
    if (i === 1 || i === 7) {
      P(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 12), BRASS_F, offset(it.at, it.axis, 0.04), { dir: it.axis, flat: true });
      P(new THREE.CircleGeometry(0.41, 16), "#ffffff", offset(it.at, it.axis, 0.15), {
        dir: it.axis,
        axis: "z",
        up: [0, 1, 0],
        texture: i === 1 ? GAUGE_A : GAUGE_B,
      });
      return;
    }
    P(new THREE.BoxGeometry(1.15, 0.2, 1.0), BRASS_F, offset(it.at, it.axis, 0.0), { dir: it.axis });
    glow(
      P(new THREE.PlaneGeometry(0.88, 0.78), "#ffffff", offset(it.at, it.axis, 0.12), {
        dir: it.axis,
        axis: "z",
        up: [0, 1, 0],
        texture: PANE,
      }),
      1.1,
    );
  });
  // flag
  const poleTop = domeTop + 3.9;
  b.rod([0, domeTop + 0.3, PZ], [0, poleTop, PZ], 0.06, BRASS_F, { bone: hullJ, sides: 6 });
  P(new THREE.SphereGeometry(0.14, 6, 4), GILT_F, [0, poleTop + 0.1, PZ]);
  const fy = poleTop - 1.4;
  b.extrude(
    [
      [0, 0],
      [0.9, -0.07],
      [1.9, 0.05],
      [2.0, 1.05],
      [0.9, 1.15],
      [0, 1.0],
    ],
    { at: [0, fy, PZ], x: [0, 0, -1], thickness: 0.04, color: "#0d1317", bone: hullJ, name: "flag" },
  );
  for (const s of [1, -1])
    P(new THREE.PlaneGeometry(0.85, 0.85), "#ffffff", [s * 0.03, fy + 0.55, PZ - 1.0], {
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: MEDAL,
    });

  // ---- Searchlight lantern ------------------------------------------------------------------------------------
  const LZ = 23;
  const ltop = topAt(0, LZ);
  const LY = ltop + 1.9;
  const lampJ = b.joint("searchlight", { parent: hullJ, at: [0, LY, LZ], dir: [0, 0, 1] });
  stack([[1.45, 1.05, 1.0]], ltop - 0.4, 0, LZ, BRASS);
  for (const s of [1, -1]) {
    P(new THREE.BoxGeometry(0.24, 1.6, 0.7), BRASS_F, [s * 1.2, LY - 0.75, LZ], {});
    P(new THREE.CylinderGeometry(0.26, 0.26, 0.4, 8), GILT_F, [s * 1.2, LY, LZ], { dir: [1, 0, 0], flat: true });
  }
  LA(
    [
      [0, -1.25],
      [0.85, -1.25],
      [1.0, -1.05],
      [1.0, 0.6],
      [1.35, 1.15],
      [1.35, 1.3],
      [1.2, 1.3],
      [0, 1.15],
    ],
    [0, LY, LZ],
    [0, 0, 1],
    BRASS,
    { segments: 10, bone: lampJ },
  );
  glow(
    P(new THREE.CircleGeometry(1.17, 20), "#ffffff", [0, LY, LZ + 1.22], { dir: [0, 0, 1], axis: "z", up: [0, 1, 0], texture: LENS, bone: lampJ }),
    1.5,
  );
  for (const rot of [0, 90])
    P(new THREE.BoxGeometry(2.4, 0.07, 0.07), BRASS_D, [0, LY, LZ + 1.27], { rotation: [0, 0, rot], bone: lampJ });
  P(new THREE.CylinderGeometry(0.3, 0.38, 0.6, 8), BRASS_F, [0, LY + 1.1, LZ - 0.3], { bone: lampJ, flat: true });
  P(new THREE.SphereGeometry(0.34, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), GILT_F, [0, LY + 1.4, LZ - 0.3], { bone: lampJ });
  for (const s of [1, -1]) {
    b.rod([s * 0.95, LY, LZ - 0.2], [s * 1.5, LY, LZ - 0.2], 0.11, BRASS_D, { bone: lampJ, sides: 6 });
    gearTrain(b, {
      at: [s * 1.62, LY, LZ - 0.2],
      axis: [s, 0, 0],
      module: 0.07,
      gears: [
        { teeth: 22, spokes: 5, bore: 0.04 },
        { teeth: 12, angle: 80 },
      ],
      spin: s > 0 ? "lampGearL" : "lampGearR",
      bone: lampJ,
    });
  }

  // ---- Skylight -----------------------------------------------------------------------------------------------
  const SKZ = -6;
  const skTopY = topAt(0, SKZ);
  P(new THREE.BoxGeometry(3.5, 1.2, 3.2), IRON, [0, skTopY + 0.1, SKZ]);
  const syb = skTopY + 0.7;
  glow(
    b.extrude(
      [
        [-1.45, 0],
        [1.45, 0],
        [1.45, 0.45],
        [0, 1.25],
        [-1.45, 0.45],
      ],
      { at: [0, syb, SKZ], x: [1, 0, 0], thickness: 3.0, color: GLASS, bone: hullJ, name: "skylight" },
    ),
    1.1,
  );
  for (const dz of [-1.5, -0.5, 0.5, 1.5]) {
    const z = SKZ + dz;
    for (const s of [1, -1]) {
      b.rod([s * 1.48, syb + 0.45, z], [0, syb + 1.28, z], 0.07, BRASS_F, { bone: hullJ, sides: 5 });
    }
    b.rod([-1.48, syb + 0.02, z], [1.48, syb + 0.02, z], 0.07, BRASS_F, { bone: hullJ, sides: 5 });
  }
  b.rod([0, syb + 1.3, SKZ - 1.55], [0, syb + 1.3, SKZ + 1.55], 0.09, GILT_F, { bone: hullJ, sides: 6 });
  for (const s of [1, -1]) {
    b.rod([s * 1.48, syb + 0.45, SKZ - 1.55], [s * 1.48, syb + 0.45, SKZ + 1.55], 0.08, BRASS_F, { bone: hullJ, sides: 5 });
  }

  // ---- Skiff --------------------------------------------------------------------------------------------------
  const SZ = -15;
  const skC = topAt(0, SZ) + 0.2;
  P(new THREE.SphereGeometry(1, 14, 7, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), COPPER, [0, skC, SZ], { scale: [1.2, 0.8, 5.2], flat: true });
  P(new THREE.CircleGeometry(1, 14), WOOD_D, [0, skC - 0.03, SZ], { rotation: [-90, 0, 0], scale: [1.17, 5.1, 1] });
  for (const dz of [-1.5, 0.2, 1.9]) P(new THREE.BoxGeometry(2.1, 0.12, 0.5), WOOD, [0, skC - 0.25, SZ + dz]);
  const rim: number[][] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    rim.push([1.2 * Math.cos(a), skC, SZ + 5.2 * Math.sin(a)]);
  }
  b.sweep(catmull(rim, { closed: true }), 0.08, { color: BRASS_F, sides: 6, bone: hullJ });
  for (const dz of [-3.2, -1.1, 1.1, 3.2]) {
    const f = Math.sqrt(1 - (dz / 5.2) ** 2);
    const arch: number[][] = [];
    for (let i = 0; i <= 6; i++) {
      const a = (i / 6) * Math.PI;
      arch.push([1.2 * f * Math.cos(a), skC + 0.85 * f * Math.sin(a), SZ + dz]);
    }
    b.sweep(catmull(arch), 0.07, { color: BRASS_D, sides: 6, bone: hullJ });
  }

  // ---- Vents and periscope ------------------------------------------------------------------------------------
  for (const x of [1.1, -1.1]) {
    const vz = -23;
    const vy = topAt(x, vz) - 0.2;
    LA(
      [
        [0, 0],
        [0.42, 0],
        [0.42, 0.8],
        [0.78, 0.95],
        [0.78, 1.08],
        [0.3, 1.4],
        [0, 1.45],
      ],
      [x, vy, vz],
      [0, 1, 0],
      BRASS,
      { segments: 10 },
    );
  }
  const pxx = 1.9;
  const pz0 = 3;
  const pty = topAt(pxx, pz0);
  P(new THREE.CylinderGeometry(0.4, 0.5, 0.5, 8), BRASS_F, [pxx, pty + 0.05, pz0], { flat: true });
  b.sweep(
    polyline([
      [pxx, pty, pz0],
      [pxx, pty + 4.0, pz0],
      [pxx, pty + 4.3, pz0 + 0.3],
      [pxx, pty + 4.3, pz0 + 1.1],
    ]),
    0.17,
    { color: BRASS_D, sides: 8, bone: hullJ },
  );
  P(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 8), GILT_F, [pxx, pty + 4.3, pz0 + 1.15], { dir: [0, 0, 1], flat: true });
  glow(
    P(new THREE.CircleGeometry(0.22, 10), "#ffffff", [pxx, pty + 4.3, pz0 + 1.27], { dir: [0, 0, 1], axis: "z", texture: LENS }),
    1.3,
  );
  P(new THREE.TorusGeometry(0.2, 0.05, 5, 8), GILT_F, [pxx, pty + 2.2, pz0], { rotation: [90, 0, 0], flat: true });

  // ---- Bow: ram spur ------------------------------------------------------------------------------------------
  LA(
    [
      [0, 28.2],
      [1.1, 28.2],
      [1.1, 28.9],
      [0.7, 29.6],
      [0.5, 31],
      [0.42, 33],
      [0, 35.8],
    ],
    [0, Y0, 0],
    [0, 0, 1],
    IRON,
    { segments: 10 },
  );
  LA(
    [
      [1.0, 27.9],
      [1.4, 27.9],
      [1.4, 28.45],
      [1.0, 28.45],
    ],
    [0, Y0, 0],
    [0, 0, 1],
    BRASS,
    { segments: 14 },
  );
  b.sweep(spiral([0, Y0, 29.6], [0.78, Y0, 29.6], [0, 0, 1], { turns: 2.2, r1: 0.48, pitch: 1.5 }), 0.06, {
    color: BRASS_F,
    sides: 5,
    bone: hullJ,
  });
  for (const s of [1, -1])
    b.extrude(
      [
        [0, 0],
        [1.0, 0.1],
        [0.3, 1.0],
      ],
      { at: [s * 0.9, Y0 - 0.1, 28.6], x: [0, 0, 1], y: [s * 0.6, 0.4, 0], thickness: 0.1, color: BRASS_D, bone: hullJ },
    );

  // ---- Stern: cap, screw, rudder, planes ----------------------------------------------------------------------
  LA(
    [
      [0, -28.2],
      [1.15, -28.2],
      [1.15, -28.9],
      [0.75, -30.2],
      [0.6, -31.0],
      [0, -31.2],
    ],
    [0, Y0, 0],
    [0, 0, 1],
    BRASS,
    { segments: 12 },
  );
  LA(
    [
      [0, 0],
      [0.65, 0],
      [0.65, 0.5],
      [0.35, 1.15],
      [0, 1.35],
    ],
    [0, Y0, -31.2],
    [0, 0, -1],
    GILT_F,
    { segments: 10, bone: propJ },
  );
  const blade: [number, number][] = [
    [0.5, -0.28],
    [1.3, -0.62],
    [2.4, -0.72],
    [3.0, -0.3],
    [3.0, 0.3],
    [2.4, 0.85],
    [1.3, 0.66],
    [0.5, 0.28],
  ];
  for (let k = 0; k < 4; k++) {
    const th = (k * 90 + 25) * D2R;
    const ph = 28 * D2R;
    b.extrude(blade, {
      at: [0, Y0, -31.5],
      x: [Math.cos(th), Math.sin(th), 0],
      y: [-Math.sin(th) * Math.cos(ph), Math.cos(th) * Math.cos(ph), Math.sin(ph)],
      thickness: 0.14,
      bevel: 0.03,
      smoothing: 1,
      color: BRASS,
      bone: propJ,
    });
  }
  b.extrude(
    [
      [0, -3.3],
      [3.5, -3.0],
      [4.6, -1.5],
      [4.8, 0],
      [4.6, 1.5],
      [3.5, 3.0],
      [0, 3.3],
    ],
    { at: [0, Y0, -25.5], x: [0, 0, -1], thickness: 0.28, bevel: 0.05, color: IRON, bone: rudderJ, name: "rudder" },
  );
  b.rod([0, Y0 - 3.2, -25.6], [0, Y0 + 3.2, -25.6], 0.16, BRASS_D, { bone: rudderJ, sides: 6 });
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, -1.2],
        [2.4, -0.4],
        [2.6, 0.5],
        [0, 1.4],
      ],
      { at: [s * 1.4, Y0, -23], x: [s, 0, 0], y: [0, 0, -1], thickness: 0.15, bevel: 0.03, color: IRON, bone: hullJ },
    );
    // dive planes
    const pj = planeJ[s];
    b.extrude(
      [
        [0, -2.4],
        [3.6, -0.8],
        [3.9, 0.8],
        [0, 2.0],
      ],
      { at: [s * 3.0, Y0 - 1.5, 12], x: [s, 0, 0], y: [0, 0, -1], thickness: 0.2, bevel: 0.04, color: BLUED, bone: pj, name: `dive${s > 0 ? "L" : "R"}` },
    );
    P(new THREE.CylinderGeometry(0.28, 0.28, 0.5, 8), BRASS_F, [s * 3.1, Y0 - 1.5, 12], { dir: [0, 0, 1], flat: true, bone: pj });
    P(new THREE.CylinderGeometry(0.2, 0.2, 4.0, 8), BRASS_D, [s * 3.4, Y0 - 1.5, 11], { dir: [s, 0, 0.22], flat: true, bone: pj });
    glow(P(new THREE.SphereGeometry(0.16, 6, 4), AMBER, [s * 5.5, Y0 - 1.38, 12.4], { bone: pj }), 1.2);
  }

  // ---- Weathering kelp ----------------------------------------------------------------------------------------
  const kelpHits = skin.scatter(26, {
    rng: rng(11),
    minDist: 2.2,
    filter: (h) => h.n.y < 0.2 && h.at.y > 1.2 && Math.abs(h.at.z) < 27 && h.at.y < Y0 - 0.5,
  });
  b.cards(kelpHits, KELP, { size: [0.7, 1.8], lean: 75, bend: 25, flow: [0, 0, -1], vary: 0.35, rng: rng(12), cross: true });

  // ---- Merged bolts -------------------------------------------------------------------------------------------
  const merged = mergeGeometries(boltGeos);
  if (merged) b.part(merged, BRASS_F, { bone: hullJ, at: [0, 0, 0], name: "bolts" });

  return b.root;
}
