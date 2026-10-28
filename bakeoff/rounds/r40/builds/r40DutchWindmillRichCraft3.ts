import * as THREE from "three";
import { createBuilder, rng, aim, polyline, bezier, paint, noise, mix, smoothstep, scales, grain } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Dutch Windmill",
  description:
    "A cosy Animal Crossing style Dutch tower windmill: peach brick octagon tower with cream quoins, terracotta shingle cap with a turning fantail and four lattice sails, gallery with stairs and bunting, lit windows with teal shutters and tulip boxes, arched door, sacks and a tulip barrel.",
};

const DEG = Math.PI / 180;
type V = THREE.Vector3;
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- palette
const CREAM = "#fff1d6";
const CREAM2 = "#f1dcb2";
const WOOD = "#9a6a46";
const WOOD_D = "#6b4330";
const WOOD_L = "#c48d5e";
const TEAL = "#4fb3a6";
const TEAL_D = "#2f8a80";
const GOLD = "#f3c34f";
const BRASS = "#d9a441";
const GREEN = "#6fb36a";
const IRON = "#4a4350";
const SACK = "#efe0bf";
const SACK_TIE = "#c9a56b";
const SOIL = "#6b4a36";
const LAMP = "#ffd27a";
const TULIPS = ["#ff8fb1", "#ffd25a", "#ef5a5a", "#b48be0", "#fff7f0"];
const FLAGS = ["#ff8fb1", "#ffd25a", "#7fd0c0", "#ef6a5a", "#b48be0", "#fff1d6"];

const hash = (a: number, c: number) => {
  let h = Math.imul(a, 374761393) ^ Math.imul(c, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// ---------------------------------------------------------------- paints
const BRICKS = ["#e7a07f", "#dd8f6d", "#efae8c", "#d78565", "#e99b78"];
const brickPaint = paint((p, n) => {
  const hl = Math.hypot(n.x, n.z);
  let base: string = "#dd9470";
  if (hl > 0.5) {
    const u = (p.x * n.z - p.z * n.x) / hl;
    const row = Math.floor(p.y / 0.2);
    const uu = u / 0.44 + (row & 1) * 0.5;
    const col = Math.floor(uu);
    const fy = p.y / 0.2 - row;
    const fx = uu - col;
    if (fy < 0.1 || fx < 0.04) base = "#f4e6cc";
    else base = BRICKS[Math.floor(hash(row, col) * BRICKS.length)];
    if (p.y > 7.3 && p.y < 7.6) base = CREAM;
  }
  const dirt = smoothstep(2.4, 0.5, p.y) * (0.45 + 0.55 * noise(p, 0.5, 3));
  return mix(base, "#7d7a52", dirt * 0.5);
});

const STONE_P = scales(["#d9ceb7", "#cdc2a9", "#e1d7c3"], "#968a72", { size: 0.42, width: 0.1, seed: 4 });
const SHINGLE = scales(["#e2674f", "#ea7a60", "#d95c46"], "#a8463a", { size: 0.34, width: 0.1, seed: 9 });
const DECK = grain("#b98859", "#a47647", { size: 0.07, axis: "x", seed: 2 });
const BARREL = grain("#b98859", "#8f6244", { size: 0.05, axis: "y", seed: 5 });
const DOORP = paint((_p, _n, s) => {
  const k = (s[0] + 0.7) / 0.2;
  const f = k - Math.floor(k);
  if (f < 0.07) return "#4a2e20";
  return hash(Math.floor(k), 7) > 0.5 ? "#a8744c" : "#b98458";
});

// ---------------------------------------------------------------- textures
const slats = (() => {
  let s = "";
  for (let y = 30; y < 74; y += 8) s += `<rect x="6" y="${y}" width="18" height="3.5" rx="1" fill="#2f8a80" opacity="0.75"/>`;
  return s;
})();

export default function build() {
  const b = createBuilder({ name: "dutchWindmill", paintSize: 2048 });
  const R = rng(11);

  const WINDOW = svg(
    `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset="1" stop-color="#ffb55c"/></linearGradient></defs>
    <rect width="60" height="80" rx="3" fill="#6b4330"/>
    <rect x="5" y="5" width="23" height="32" fill="url(#g)"/><rect x="32" y="5" width="23" height="32" fill="url(#g)"/>
    <rect x="5" y="41" width="23" height="34" fill="url(#g)"/><rect x="32" y="41" width="23" height="34" fill="url(#g)"/>
    <path d="M5 5 L5 22 Q14 20 12 5Z" fill="#ff9db8"/><path d="M55 5 L55 22 Q46 20 48 5Z" fill="#ff9db8"/>
    <path d="M33 75 q4 -14 9 -3 q4 -12 10 3z" fill="#8c5a3c" opacity="0.35"/>
  </svg>`,
    { size: 128 },
  );
  const SHUTTER = svg(
    `<svg viewBox="0 0 30 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="30" height="80" rx="3" fill="#2f8a80"/><rect x="3" y="3" width="24" height="74" rx="2" fill="#4fb3a6"/>
    <path d="M15 24 C5 16 9 7 15 13 C21 7 25 16 15 24Z" fill="#fff1d6"/>${slats}
  </svg>`,
    { size: 128 },
  );
  const ROUNDWIN = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="r" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stop-color="#fff3b8"/><stop offset="1" stop-color="#ffaf55"/></radialGradient></defs>
    <circle cx="32" cy="32" r="31" fill="#6b4330"/><circle cx="32" cy="32" r="26" fill="url(#r)"/>
    <rect x="30" y="6" width="4" height="52" fill="#6b4330"/><rect x="6" y="30" width="52" height="4" fill="#6b4330"/>
  </svg>`,
    { size: 128 },
  );
  const PLAQUE = svg(
    `<svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="90" rx="12" fill="#6b4330"/><rect x="6" y="6" width="148" height="78" rx="8" fill="#fff1d6"/>
    <text x="80" y="43" text-anchor="middle" font-family="serif" font-weight="bold" font-size="24" fill="#6b4330">DE ZWAAN</text>
    <text x="80" y="68" text-anchor="middle" font-family="serif" font-weight="bold" font-size="15" fill="#2f8a80">ANNO 1742</text>
    <g><circle cx="22" cy="40" r="6" fill="#ff8fb1"/><path d="M22 46 V66" stroke="#4c9150" stroke-width="3"/>
    <circle cx="138" cy="40" r="6" fill="#ffd25a"/><path d="M138 46 V66" stroke="#4c9150" stroke-width="3"/></g>
  </svg>`,
    { size: 256 },
  );

  // ------------------------------------------------------------ skeleton
  const base = b.joint("base", { at: [0, 0, 0] });
  const cap = b.joint("cap", { parent: base, at: [0, 9.05, 0] });
  const SZ = 4.3;
  const HUBY = 9.9;
  const rotor = b.joint("rotor", { parent: cap, at: [0, HUBY, SZ], dir: [0, 0, 1] });
  const FAN_C = v(0, HUBY, -3.4);
  const fan = b.joint("fan", { parent: cap, at: FAN_C, dir: [1, 0, 0], role: "fan" });

  // ------------------------------------------------------------ helpers
  const oct = (rt: number, rb: number, h: number) => new THREE.CylinderGeometry(rt, rb, h, 8, 1, false, Math.PI / 8);
  const bar = (a: V, c: V, thick: number, depth: number, color: any, bone: any, opts: Record<string, unknown> = {}) => {
    const d = c.clone().sub(a);
    return b.part(new THREE.BoxGeometry(thick, d.length(), depth), color, {
      at: a.clone().add(c).multiplyScalar(0.5),
      dir: d,
      up: [0, 0, 1],
      bone,
      ...opts,
    } as any);
  };
  const arch = (hw: number, h: number, seg = 8): [number, number][] => {
    const o: [number, number][] = [
      [-hw, 0],
      [hw, 0],
    ];
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI;
      o.push([hw * Math.cos(a), h + hw * Math.sin(a)]);
    }
    return o;
  };
  const tulip = (at: V, h: number, color: string, bone: any) => {
    const top = at.clone().add(v(0, h, 0));
    b.rod(at, top, 0.012, GREEN, { bone } as any);
    b.part(new THREE.SphereGeometry(0.07, 6, 5), color, { at: top.clone().add(v(0, 0.03, 0)), scale: [1, 1.35, 1], bone } as any);
    b.spike(at.clone().add(v(0, 0.02, 0)), v(0.5, 1, 0.2).normalize(), 0.2, 0.025, { color: GREEN, bone } as any);
  };

  // ------------------------------------------------------------ plinth, tower
  b.part(oct(3.3, 3.45, 0.5), STONE_P, { bone: base, at: [0, 0.25, 0], flat: true } as any);
  const tower = b.part(oct(2.0, 3.05, 8.5), brickPaint, { bone: base, at: [0, 4.75, 0], flat: true } as any);
  b.part(oct(2.35, 2.4, 0.3), WOOD_D, { bone: base, at: [0, 8.95, 0], flat: true } as any);
  const skin = b.surface(tower);

  // cream quoins on the eight corners
  const rv = (y: number) => 3.05 - (1.05 * (y - 0.5)) / 8.5 + 0.03;
  for (let k = 0; k < 8; k++) {
    const th = (22.5 + 45 * k) * DEG;
    const p0 = v(Math.sin(th) * rv(0.55), 0.55, Math.cos(th) * rv(0.55));
    const p1 = v(Math.sin(th) * rv(8.9), 8.9, Math.cos(th) * rv(8.9));
    b.sweep(polyline([p0, p1]), 0.1, { color: CREAM, section: { ngon: 4 }, caps: "flat", bone: base } as any);
  }

  // wall frames: point, outward normal, tangent (viewer's right), up along the wall
  type Wall = { at: V; n: V; t: V; u: V };
  const wall = (az: number, y: number): Wall => {
    const a = az * DEG;
    const s = Math.sin(a);
    const c = Math.cos(a);
    const hit = skin.ray([s * 9, y, c * 9], [-s, 0, -c]);
    if (!hit) throw new Error("wall ray missed");
    const n = hit.n.clone();
    const t = v(n.z, 0, -n.x).normalize();
    const u = n.clone().cross(t).normalize();
    return { at: hit.at.clone(), n, t, u };
  };
  const at3 = (w: Wall, r: number, up: number, out: number) =>
    w.at.clone().addScaledVector(w.t, r).addScaledVector(w.u, up).addScaledVector(w.n, out);
  const put = (w: Wall, geo: THREE.BufferGeometry, color: any, r: number, up: number, out: number, extra: Record<string, unknown> = {}) =>
    b.part(geo, color, { at: at3(w, r, up, out), dir: w.n, axis: "z", up: w.u, bone: base, ...extra } as any);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // ------------------------------------------------------------ cap
  const CAP_PROFILE: [number, number][] = [
    [0, 0],
    [2.2, 0],
    [2.28, 0.12],
    [2.2, 0.3],
    [2.05, 0.6],
    [1.8, 0.95],
    [1.45, 1.3],
    [1.0, 1.58],
    [0.5, 1.78],
    [0, 1.86],
  ];
  const capPart = b.lathe(CAP_PROFILE, { at: [0, 9.05, 0], bone: cap, segments: 16, color: SHINGLE } as any);
  b.part(new THREE.CylinderGeometry(2.34, 2.34, 0.18, 16), TEAL, { bone: cap, at: [0, 9.13, 0] } as any);
  const capSkin = b.surface(capPart);
  for (const s of [1, -1]) {
    const h = capSkin.around(v(0, 9.5, 0)).at(s * 58, 18);
    if (!h) continue;
    b.stick(new THREE.CylinderGeometry(0.46, 0.5, 0.14, 10), CREAM, h, { embed: 0.45 });
    glow(
      b.part(new THREE.PlaneGeometry(0.72, 0.72), "#ffffff", {
        at: h.at.clone().addScaledVector(h.n, 0.09),
        dir: h.n,
        axis: "z",
        up: [0, 1, 0],
        texture: ROUNDWIN,
        bone: cap,
      } as any),
      0.9,
    );
  }
  const collar = capSkin.ray([0, HUBY, 8], [0, 0, -1]);
  if (collar) b.stick(new THREE.CylinderGeometry(0.5, 0.62, 0.22, 10), BRASS, collar, { embed: 0.4 });

  // finial and weathervane
  b.part(new THREE.SphereGeometry(0.14, 8, 6), GOLD, { bone: cap, at: [0, 10.95, 0] } as any);
  b.rod(v(0, 10.95, 0), v(0, 11.5, 0), 0.03, GOLD, { bone: cap } as any);
  b.extrude(
    [
      [-0.5, -0.2],
      [-0.35, 0],
      [-0.5, 0.2],
      [-0.3, 0.2],
      [-0.1, 0.05],
      [0.3, 0.05],
      [0.3, 0.16],
      [0.62, 0],
      [0.3, -0.16],
      [0.3, -0.05],
      [-0.1, -0.05],
      [-0.3, -0.2],
    ],
    { at: [0, 11.3, 0], x: [0, 0, 1], thickness: 0.03, color: GOLD, bone: cap } as any,
  );

  // ------------------------------------------------------------ rotor: shaft, hub, sails
  b.part(new THREE.CylinderGeometry(0.22, 0.26, SZ - 1.0, 8), WOOD_D, { bone: rotor, at: [0, HUBY, (SZ + 1.0) / 2], dir: [0, 0, 1] } as any);
  b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 8), WOOD_D, { bone: rotor, at: [0, HUBY, SZ], dir: [0, 0, 1] } as any);
  b.part(new THREE.CylinderGeometry(0.6, 0.6, 0.08, 8), BRASS, { bone: rotor, at: [0, HUBY, SZ + 0.22], dir: [0, 0, 1] } as any);
  b.part(new THREE.ConeGeometry(0.34, 0.6, 8), GOLD, { bone: rotor, at: [0, HUBY, SZ + 0.55], dir: [0, 0, 1] } as any);

  for (let k = 0; k < 4; k++) {
    const a = (20 + 90 * k) * DEG;
    const d = v(Math.sin(a), Math.cos(a), 0);
    const nn = v(Math.cos(a), -Math.sin(a), 0);
    const P = (r: number, w: number, z = 0) => v(0, HUBY, SZ + z).addScaledVector(d, r).addScaledVector(nn, w);
    bar(P(0.3, 0), P(6.5, 0), 0.2, 0.2, WOOD, rotor);
    bar(P(1.4, 1.55), P(6.3, 1.55), 0.1, 0.1, CREAM, rotor);
    bar(P(1.4, 0.1), P(1.4, 1.55), 0.1, 0.1, CREAM, rotor);
    bar(P(6.3, 0.1), P(6.3, 1.55), 0.1, 0.1, CREAM, rotor);
    bar(P(1.4, 0.85, 0.03), P(6.3, 0.85, 0.03), 0.07, 0.06, TEAL, rotor);
    for (let i = 1; i <= 9; i++) {
      const r = 1.4 + i * 0.49;
      bar(P(r, 0.1, 0.04), P(r, 1.55, 0.04), 0.06, 0.06, CREAM, rotor);
    }
    b.part(new THREE.BoxGeometry(0.26, 0.3, 0.26), WOOD_D, { at: P(6.6, 0), dir: d, up: [0, 0, 1], bone: rotor } as any);
  }

  // ------------------------------------------------------------ fantail
  b.rod(v(0.55, 9.6, -1.95), v(0.25, 9.85, -3.3), 0.08, WOOD_D, { bone: cap } as any);
  b.rod(v(-0.55, 9.6, -1.95), v(-0.25, 9.85, -3.3), 0.08, WOOD_D, { bone: cap } as any);
  b.rod(v(0, 9.7, -2.0), FAN_C, 0.07, WOOD_D, { bone: cap } as any);
  b.part(new THREE.SphereGeometry(0.17, 8, 6), GOLD, { bone: fan, at: FAN_C } as any);
  b.part(new THREE.TorusGeometry(1.12, 0.035, 4, 20), CREAM, { bone: fan, at: FAN_C, dir: [1, 0, 0], axis: "z" } as any);
  for (let k = 0; k < 8; k++) {
    const a = k * 45 * DEG;
    const dir = v(0, Math.cos(a), Math.sin(a));
    const q = aim(dir, [1, 0, 0]);
    q.multiply(new THREE.Quaternion().setFromAxisAngle(v(0, 1, 0), 0.5));
    b.part(new THREE.BoxGeometry(0.3, 0.8, 0.04), k % 2 ? CREAM : TEAL, {
      at: FAN_C.clone().addScaledVector(dir, 0.75),
      quat: q,
      bone: fan,
    } as any);
  }

  // ------------------------------------------------------------ door
  const F0 = wall(0, 1.5);
  const door = b.joint("door", { parent: base, at: at3(F0, 0.62, -1.0, 0.09), dir: [0, 1, 0], role: "hinge" });
  b.extrude(arch(0.8, 1.18), { at: at3(F0, 0, -1.0, 0.03), x: F0.t, y: F0.u, thickness: 0.2, bevel: 0.02, color: CREAM, bone: base } as any);
  b.extrude(arch(0.62, 1.1), { at: at3(F0, 0, -1.0, 0.09), x: F0.t, y: F0.u, thickness: 0.16, bevel: 0.015, color: DOORP, bone: door } as any);
  put(F0, box(0.95, 0.09, 0.03), IRON, 0.05, -0.65, 0.19, { bone: door });
  put(F0, box(0.95, 0.09, 0.03), IRON, 0.05, -0.15, 0.19, { bone: door });
  put(F0, new THREE.TorusGeometry(0.2, 0.035, 5, 12), WOOD_D, 0, 0.3, 0.19, { bone: door });
  glow(put(F0, new THREE.CircleGeometry(0.2, 12), LAMP, 0, 0.3, 0.185, { bone: door }), 1);
  put(F0, new THREE.SphereGeometry(0.05, 6, 5), GOLD, -0.42, -0.15, 0.24, { bone: door });
  b.part(box(2.4, 0.26, 0.9), STONE_P, { bone: base, at: [0, 0.13, 3.55] } as any);

  // lantern under the gallery
  b.rod(v(1.35, 2.56, 3.25), v(1.35, 2.42, 3.25), 0.01, IRON, { bone: base } as any);
  b.spike(v(1.35, 2.34, 3.25), [0, 1, 0], 0.11, 0.15, { color: GOLD, bone: base } as any);
  glow(b.part(box(0.2, 0.28, 0.2), LAMP, { bone: base, at: [1.35, 2.2, 3.25] } as any), 1.3);
  b.part(box(0.24, 0.04, 0.24), GOLD, { bone: base, at: [1.35, 2.05, 3.25] } as any);

  // sign plaque
  const FS = wall(0, 5.4);
  put(FS, box(1.7, 1.0, 0.12), "#ffffff", 0, 0, 0.04, { texture: PLAQUE });

  // ------------------------------------------------------------ windows
  const windowAt = (az: number, y: number, tulips: boolean) => {
    const f = wall(az, y);
    const w = 0.62;
    const h = 0.9;
    put(f, box(w + 0.3, h + 0.3, 0.16), CREAM, 0, 0, 0.02);
    glow(put(f, new THREE.PlaneGeometry(w, h), "#ffffff", 0, 0, 0.105, { texture: WINDOW }), 0.9);
    for (const s of [-1, 1]) {
      put(f, box(w * 0.5, h + 0.1, 0.07), "#ffffff", s * (w / 2 + 0.15 + w * 0.25), 0, 0.045, { texture: SHUTTER });
    }
    put(f, box(w + 0.5, 0.1, 0.34), CREAM, 0, -h / 2 - 0.2, 0.12);
    put(f, box(w + 0.3, 0.2, 0.26), TEAL, 0, -h / 2 + 0.0, 0.26);
    put(f, box(w + 0.2, 0.04, 0.2), SOIL, 0, -h / 2 + 0.11, 0.26);
    if (tulips) {
      for (let i = 0; i < 5; i++) {
        const r = -w / 2 + 0.05 + (i * (w - 0.1)) / 4;
        tulip(at3(f, r, -h / 2 + 0.12, 0.26), 0.2 + R() * 0.12, TULIPS[i % TULIPS.length], base);
      }
    }
  };
  windowAt(45, 5.2, true);
  windowAt(-45, 5.2, true);
  windowAt(90, 6.4, false);
  windowAt(-90, 6.4, false);
  windowAt(180, 6.2, false);

  // ------------------------------------------------------------ gallery
  b.part(oct(3.95, 3.95, 0.18), DECK, { bone: base, at: [0, 2.65, 0], flat: true } as any);
  b.part(oct(3.8, 3.7, 0.2), WOOD_D, { bone: base, at: [0, 2.5, 0], flat: true } as any);
  for (let k = 0; k < 8; k++) {
    const th = (22.5 + 45 * k) * DEG;
    b.rod(v(Math.sin(th) * 2.95, 1.7, Math.cos(th) * 2.95), v(Math.sin(th) * 3.6, 2.45, Math.cos(th) * 3.6), 0.07, WOOD_D, { bone: base } as any);
    const x = Math.sin(th) * 3.82;
    const z = Math.cos(th) * 3.82;
    b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.85, 6), CREAM, { bone: base, at: [x, 3.165, z] } as any);
    b.part(new THREE.SphereGeometry(0.09, 6, 5), GOLD, { bone: base, at: [x, 3.62, z] } as any);
  }
  const railPts = (y: number) => {
    const pts: V[] = [];
    for (let k = 0; k < 8; k++) {
      const th = (292.5 + 45 * k) * DEG;
      pts.push(v(Math.sin(th) * 3.82, y, Math.cos(th) * 3.82));
    }
    return pts;
  };
  b.sweep(polyline(railPts(3.55)), 0.05, { color: CREAM, sides: 6, bone: base } as any);
  b.sweep(polyline(railPts(3.12)), 0.035, { color: CREAM, sides: 6, bone: base } as any);

  // stair on the model's right side
  const STEPS = 12;
  const RISE = 0.228;
  const RUN = 0.27;
  for (let i = 0; i < STEPS; i++) {
    const top = 2.74 - RISE * (i + 1);
    b.part(box(RUN + 0.02, 0.07, 1.2), DECK, { bone: base, at: [-(3.65 + RUN * (i + 0.5)), top - 0.035, 0] } as any);
  }
  const yt = (x: number) => 2.74 - (Math.abs(x) - 3.65) * 0.844;
  for (const z of [-0.64, 0.64]) {
    bar(v(-3.9, 2.55, z), v(-6.9, 0.02, z), 0.12, 0.08, WOOD_D, base);
    bar(v(-3.65, 3.59, z), v(-6.8, 3.59 - 3.15 * 0.844, z), 0.07, 0.07, CREAM, base);
    for (const x of [-3.8, -5.2, -6.7]) {
      b.rod(v(x, yt(x) - 0.02, z), v(x, yt(x) + 0.85, z), 0.04, CREAM, { bone: base, sides: 6 } as any);
    }
  }

  // bunting across the front rail
  const rope = bezier(v(-1.47, 3.5, 3.63), v(-0.6, 2.9, 3.66), v(0.6, 2.9, 3.66), v(1.47, 3.5, 3.63));
  b.sweep(rope, 0.015, { color: "#7a5a40", sides: 4, bone: base } as any);
  let fi = 0;
  b.along(rope, 7, (at) => {
    b.extrude(
      [
        [-0.13, 0],
        [0.13, 0],
        [0, -0.3],
      ],
      { at: at.at, x: [1, 0, 0], thickness: 0.015, color: FLAGS[fi++ % FLAGS.length], bone: base } as any,
    );
  });

  // ------------------------------------------------------------ sacks and tulip barrel
  for (const [x, z, s] of [
    [-1.95, 3.85, 1],
    [-2.45, 3.65, 0.85],
  ]) {
    b.part(new THREE.SphereGeometry(0.36 * s, 8, 6), SACK, { bone: base, at: [x, 0.34 * s, z], scale: [1, 1, 0.85] } as any);
    b.part(new THREE.ConeGeometry(0.12 * s, 0.22 * s, 6), SACK, { bone: base, at: [x, 0.78 * s, z] } as any);
    b.part(new THREE.CylinderGeometry(0.1 * s, 0.1 * s, 0.05, 6), SACK_TIE, { bone: base, at: [x, 0.68 * s, z] } as any);
  }
  const BX = 1.95;
  const BZ = 3.85;
  b.part(new THREE.CylinderGeometry(0.42, 0.36, 0.66, 10), BARREL, { bone: base, at: [BX, 0.33, BZ] } as any);
  b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 10), IRON, { bone: base, at: [BX, 0.15, BZ] } as any);
  b.part(new THREE.CylinderGeometry(0.43, 0.43, 0.05, 10), IRON, { bone: base, at: [BX, 0.5, BZ] } as any);
  b.part(new THREE.CylinderGeometry(0.38, 0.38, 0.04, 10), SOIL, { bone: base, at: [BX, 0.66, BZ] } as any);
  for (let i = 0; i < 7; i++) {
    const a = (i / 6) * Math.PI * 2;
    const rr = i === 6 ? 0 : 0.22;
    tulip(v(BX + Math.sin(a) * rr, 0.68, BZ + Math.cos(a) * rr), 0.25 + R() * 0.2, TULIPS[i % TULIPS.length], base);
  }

  return b.root;
}
