```ts
import * as THREE from "three";
import { createBuilder, frame, rng, paint, noise, mix, smoothstep, svg, scales, DEG } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dutch Windmill",
  description:
    "A cosy Animal Crossing style Dutch windmill: terracotta brick base, cream octagonal tower, wooden gallery with bunting and stairs, tiled cap, lattice sails on a rotatable hub, glowing windows, flower boxes and a tail pole.",
};

// ---------- palette ----------
const TRIM = "#fffaf0";
const WOOD = "#b5814f";
const WOODL = "#d2a46a";
const DWOOD = "#7a5232";
const TEAL = "#5fb9a8";
const GOLD = "#f2c04a";
const STONE = "#bdb5a6";
const DARK = "#5b4636";
const SACK = "#efe2c0";

const hsh = (a: number, c: number) => {
  const s = Math.sin(a * 127.1 + c * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// ---------- paints ----------
const BRICK = paint((p) => {
  const row = Math.floor(p.y / 0.17);
  const u = (Math.atan2(p.x, p.z) / (Math.PI * 2) + 0.5) * 40 + (row % 2) * 0.5;
  const col = Math.floor(u);
  const fu = u - col;
  const fy = p.y / 0.17 - row;
  if (fy < 0.12 || fu < 0.07) return "#f1dcc0";
  const c = mix("#dc866c", "#c4684f", hsh(row, col));
  return mix(c, "#8fa874", smoothstep(0.8, 0, p.y) * 0.5 * noise(p, 0.3, 4));
});
const PLASTER = paint((p) => {
  let c = mix("#faf0d6", "#f1e2bc", noise(p, 0.9, 2));
  c = mix(c, "#e2c99c", smoothstep(4.2, 2.6, p.y) * 0.7);
  const band = Math.abs(((p.y / 1.5) % 1) - 0.5);
  if (band > 0.47) c = mix(c, "#e8d3a6", 0.7);
  return c;
});
const CAPP = scales(["#e0705a", "#d4604c", "#e98066"], "#9c3f33", { size: 0.26, width: 0.14, seed: 3 });
const DOORP = paint((p, _n, s) => {
  const f = (((s[0] + 0.5) / 0.17) % 1 + 1) % 1;
  if (f < 0.07) return "#4a2f1a";
  return mix("#a8683a", "#c08650", noise(p, 0.25, 6));
});
const SHUT = paint((_p, _n, s) => {
  const f = ((s[1] / 0.09) % 1 + 1) % 1;
  return f < 0.18 ? "#3d9585" : "#68c4b2";
});
const CLOTH = paint((p, _n, s) => {
  const gx = ((s[0] / 0.56) % 1 + 1) % 1;
  const gy = ((s[1] / 0.3) % 1 + 1) % 1;
  if (gx < 0.1 || gy < 0.12) return "#b98d5a";
  if (s[0] > 5.15) return "#7cc8b8";
  return mix("#fbf3df", "#efe0bd", noise(p, 0.4, 3));
});

// ---------- textures ----------
const tulip = (c: string, d: string) =>
  svg(
    `<svg viewBox="0 0 24 48" xmlns="http://www.w3.org/2000/svg"><path d="M12 47 V20" stroke="#4f9a4e" stroke-width="3"/><path d="M12 44 Q3 36 4 26 Q10 32 12 40Z" fill="#6cc06a" stroke="#2f6a35" stroke-width="1"/><path d="M12 42 Q21 34 20 26 Q14 31 12 38Z" fill="#6cc06a" stroke="#2f6a35" stroke-width="1"/><path d="M5 6 Q4 20 12 22 Q20 20 19 6 L15 12 L12 3 L9 12Z" fill="${c}" stroke="${d}" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
    { size: 96 },
  );
const pennant = (c: string, d: string) =>
  svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M2 38 H38 L20 3 Z" fill="${c}" stroke="${d}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="20" cy="30" r="3" fill="#ffffff" opacity="0.8"/></svg>`,
    { size: 96 },
  );
const WINDOW_TEX = svg(
  `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#ffc062"/></linearGradient></defs><path d="M2 58 V22 Q2 2 20 2 Q38 2 38 22 V58 Z" fill="url(#g)"/><path d="M2 58 V22 Q2 2 20 2 Q38 2 38 22 V58 Z" fill="none" stroke="#fff4dc" stroke-width="2.6"/><path d="M20 2 V58 M2 32 H38" stroke="#fff4dc" stroke-width="2.8"/><path d="M4 6 Q8 30 4 40 Z" fill="#f59a8a" opacity="0.55"/></svg>`,
  { size: 160 },
);
const PLAQUE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="46" fill="#fdf1cf" stroke="#8a5a34" stroke-width="6"/><path d="M50 82 Q18 60 30 28 Q42 16 70 20 Q78 54 50 82Z" fill="#79b86a" stroke="#2f6a35" stroke-width="4" stroke-linejoin="round"/><path d="M50 84 Q50 56 66 30" stroke="#2f6a35" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M50 62 Q42 52 38 46 M54 50 Q48 42 46 34" stroke="#2f6a35" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const FLAGS = [
  pennant("#ef7d6a", "#a9402f"),
  pennant("#ffd36a", "#b98a1c"),
  pennant("#6fcdbb", "#2f8a78"),
];
const TULIPS = [tulip("#ef6a7c", "#a62f47"), tulip("#ffd04a", "#b0821a"), tulip("#f7a6c8", "#b9507f")];

export default function build() {
  const b = createBuilder({ name: "dutchWindmill" });
  const R = rng(11);

  // ---------- skeleton ----------
  const base = b.joint("base", { at: [0, 0, 0], dir: [0, 1, 0] });
  const cap = b.joint("cap", { parent: base, at: [0, 9, 0], dir: [0, 1, 0], role: "hinge" });
  const HUB: [number, number, number] = [0, 9.7, 1.95];
  const hub = b.joint("hub", { parent: cap, at: HUB, dir: [0, 0, 1], role: "hinge" });
  const A0 = 0.4;
  const sails = [0, 1, 2, 3].map((k) => {
    const a = A0 + (k * Math.PI) / 2;
    return b.joint(`sail${k + 1}`, { parent: hub, at: HUB, dir: [Math.cos(a), Math.sin(a), 0] });
  });

  // ---------- main body ----------
  const lower = b.lathe(
    [[0, 0], [3.25, 0], [3.05, 2.5], [0, 2.5]],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: BRICK, bone: base },
  );
  const upper = b.lathe(
    [[0, 2.5], [2.35, 2.5], [1.5, 9.0], [0, 9.0]],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: PLASTER, bone: base },
  );
  // gallery slab
  b.lathe([[0, 2.5], [3.75, 2.5], [3.75, 2.66], [0, 2.66]], {
    at: [0, 0, 0], segments: 8, spin: 22.5, color: WOODL, bone: base,
  });
  b.lathe([[0, 2.3], [3.0, 2.3], [3.0, 2.5], [0, 2.5]], {
    at: [0, 0, 0], segments: 8, spin: 22.5, color: DWOOD, bone: base,
  });
  const skin = b.surface([lower, upper]);

  type W = { p: THREE.Vector3; n: THREE.Vector3; x: THREE.Vector3 };
  const wall = (az: number, y: number): W => {
    const a = az * DEG;
    const h = skin.ray([Math.sin(a) * 9, y, Math.cos(a) * 9], [-Math.sin(a), 0, -Math.cos(a)]);
    if (!h) throw new Error("no wall hit");
    const n = new THREE.Vector3(h.n.x, 0, h.n.z).normalize();
    return { p: new THREE.Vector3(h.at.x, h.at.y, h.at.z), n, x: new THREE.Vector3(n.z, 0, -n.x) };
  };
  const wpt = (w: W, dx: number, dy: number, c: number) =>
    w.p.clone().addScaledVector(w.x, dx).addScaledVector(w.n, c).add(new THREE.Vector3(0, dy, 0));
  const ext = (w: W, o: number[][], dx: number, dy: number, c: number, t: number, color: any) =>
    b.extrude(o as any, {
      at: wpt(w, dx, dy, c), x: [w.x.x, 0, w.x.z], thickness: t, color, bone: base,
    });
  const bx = (w: W, size: [number, number, number], dx: number, dy: number, c: number, color: any) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at: wpt(w, dx, dy, c), dir: [w.n.x, 0, w.n.z], axis: "z", bone: base,
    });
  const arch = (hw: number, h: number, ah: number) => [
    [-hw, 0], [hw, 0], [hw, h - ah], [hw * 0.75, h - ah * 0.3], [0, h], [-hw * 0.75, h - ah * 0.3], [-hw, h - ah],
  ];

  // ---------- door ----------
  const w0 = wall(0, 0.9);
  const g0 = -w0.p.y;
  ext(w0, arch(0.62, 2.05, 0.6), 0, g0, -0.04, 0.32, TRIM);
  ext(w0, arch(0.5, 1.9, 0.5), 0, g0, 0, 0.28, DOORP);
  for (const dy of [-0.4, 0.5]) bx(w0, [0.96, 0.08, 0.05], 0, dy, 0.15, "#4b4048");
  b.part(new THREE.SphereGeometry(0.06, 6, 4), GOLD, { at: wpt(w0, 0.32, 0, 0.18), bone: base });
  bx(w0, [1.7, 0.12, 0.7], 0, -0.84, 0.35, STONE);
  bx(w0, [1.3, 0.1, 0.3], 0, -0.89 + 0.1, 0.62, "#a9a293");
  // plaque
  const wp = wall(0, 2.15);
  b.part(new THREE.CylinderGeometry(0.29, 0.29, 0.12, 12), TRIM, {
    at: wpt(wp, 0, 0, 0.02), dir: [wp.n.x, 0, wp.n.z], bone: base,
  });
  b.part(new THREE.CircleGeometry(0.24, 16), "#ffffff", {
    at: wpt(wp, 0, 0, 0.095), dir: [wp.n.x, 0, wp.n.z], axis: "z", texture: PLAQUE, bone: base,
  });
  // lanterns
  for (const s of [1, -1]) {
    const wl = wall(0, 1.9);
    const a = wpt(wl, s * 0.95, 0, 0.05);
    const e = wpt(wl, s * 0.95, 0, 0.4);
    b.rod(a, e, 0.025, DARK, { bone: base });
    glow(b.part(new THREE.CylinderGeometry(0.1, 0.075, 0.22, 6), "#ffd27a", { at: e.clone().add(new THREE.Vector3(0, -0.14, 0)), bone: base }), 1.3);
    b.part(new THREE.ConeGeometry(0.13, 0.1, 6), DARK, { at: e.clone().add(new THREE.Vector3(0, 0.02, 0)), bone: base });
  }

  // ---------- windows ----------
  const windowAt = (az: number, y: number, s: number, shut: boolean, box: boolean) => {
    const w = wall(az, y);
    ext(w, arch(0.5 * s, 1.3 * s, 0.45 * s), 0, -0.65 * s, -0.06, 0.3, TRIM);
    const pane = b.part(new THREE.PlaneGeometry(0.78 * s, 1.17 * s), "#ffffff", {
      at: wpt(w, 0, 0, 0.11), dir: [w.n.x, 0, w.n.z], axis: "z", texture: WINDOW_TEX, bone: base,
    });
    glow(pane, 1.1);
    bx(w, [1.2 * s, 0.08, 0.22], 0, -0.7 * s, 0.14, TRIM);
    if (shut)
      for (const d of [1, -1]) {
        ext(w, arch(0.25 * s, 1.2 * s, 0.2 * s), d * 0.78 * s, -0.6 * s, -0.06, 0.26, SHUT);
        b.part(new THREE.SphereGeometry(0.035, 5, 4), "#ffffff", { at: wpt(w, d * 0.78 * s, 0.2 * s, 0.09), bone: base });
      }
    if (box) {
      bx(w, [1.0 * s, 0.16, 0.26], 0, -0.8 * s, 0.2, DWOOD);
      bx(w, [1.0 * s, 0.03, 0.22], 0, -0.71 * s, 0.2, "#5e8a45");
      const fr = [-2, -1, 0, 1, 2].map((i) => frame(wpt(w, i * 0.18 * s, -0.72 * s, 0.2).toArray() as any, [0, 1, 0]));
      b.cards(fr, TULIPS, { size: [0.16, 0.28], cross: true, rng: R, vary: 0.2, bone: base });
    }
  };
  windowAt(0, 5.3, 0.68, true, true);
  windowAt(90, 4.7, 0.68, true, true);
  windowAt(-90, 4.7, 0.68, true, true);
  windowAt(180, 5.3, 0.68, true, true);
  windowAt(45, 7.4, 0.5, false, false);
  windowAt(-45, 7.4, 0.5, false, false);
  windowAt(135, 7.4, 0.5, false, false);
  windowAt(-135, 7.4, 0.5, false, false);

  // ---------- gallery: posts, rails, bunting, stairs ----------
  const GR = 3.4;
  const gp = (k: number): [number, number] => {
    const a = k * 22.5 * DEG;
    return [Math.sin(a) * GR, Math.cos(a) * GR];
  };
  for (let k = 0; k < 16; k++) {
    if (k === 4) continue;
    const [x, z] = gp(k);
    const newel = k === 3 || k === 5;
    const top = newel ? 3.8 : 3.6;
    b.rod([x, 2.66, z], [x, top, z], newel ? 0.08 : 0.05, TRIM, { bone: base });
    b.part(new THREE.SphereGeometry(newel ? 0.12 : 0.075, 6, 4), newel ? GOLD : TRIM, { at: [x, top + 0.03, z], bone: base });
  }
  const bunt: any[] = [];
  for (let k = 0; k < 16; k++) {
    if (k === 3 || k === 4) continue;
    const [x1, z1] = gp(k);
    const [x2, z2] = gp(k + 1);
    b.rod([x1, 3.58, z1], [x2, 3.58, z2], 0.045, WOODL, { bone: base });
    b.rod([x1, 3.1, z1], [x2, 3.1, z2], 0.03, TRIM, { bone: base });
    for (const t of [0.2, 0.5, 0.8]) bunt.push(frame([x1 + (x2 - x1) * t, 3.55, z1 + (z2 - z1) * t], [0, 1, 0]));
  }
  b.cards(bunt, FLAGS, {
    size: [0.3, 0.34], lean: 180, flow: (f: any) => [f.at.x, 0, f.at.z], rng: rng(3), bone: base,
  });
  // stairs on +X
  for (let i = 0; i < 6; i++) {
    const top = 2.2 - 0.4 * i;
    b.part(new THREE.BoxGeometry(0.42, top, 2.2), i % 2 ? "#c9a56e" : WOODL, { at: [3.6 + 0.4 * i, top / 2, 0], bone: base });
  }
  b.part(new THREE.BoxGeometry(0.6, 0.18, 2.2), WOODL, { at: [3.55, 2.4, 0], bone: base });
  for (const s of [1, -1]) {
    const z = s * 1.18;
    b.rod([3.35, 3.55, z], [5.8, 1.1, z], 0.045, WOODL, { bone: base });
    const [nx, nz] = gp(s > 0 ? 3 : 5);
    b.rod([nx, 3.6, nz], [3.35, 3.55, z], 0.045, WOODL, { bone: base });
    for (const x of [3.35, 4.15, 5.0, 5.8]) {
      const ry = 3.55 - (x - 3.35);
      const bottom = x < 3.4 ? 2.66 : Math.max(0.15, 2.2 - 0.4 * Math.floor((x - 3.4) / 0.4));
      b.rod([x, bottom, z], [x, ry, z], 0.04, TRIM, { bone: base });
    }
  }

  // ---------- cap ----------
  const capBody = b.lathe(
    [[0, 9.0], [1.8, 9.0], [1.85, 9.15], [1.7, 9.6], [1.25, 10.3], [0.55, 10.75], [0, 10.85]],
    { at: [0, 0, 0], segments: 12, color: CAPP, bone: cap, smoothing: 0 },
  );
  b.lathe([[1.78, 9.0], [1.93, 9.0], [1.93, 9.2], [1.78, 9.2]], { at: [0, 0, 0], segments: 12, color: DWOOD, bone: cap });
  b.part(new THREE.SphereGeometry(0.17, 6, 5), GOLD, { at: [0, 10.9, 0], bone: cap });
  b.spike([0, 10.95, 0], [0, 1, 0], 0.5, 0.06, { color: GOLD, bone: cap });
  const capSkin = b.surface(capBody);
  for (const az of [70, -70, 180]) {
    const a = az * DEG;
    const h = capSkin.ray([Math.sin(a) * 6, 9.65, Math.cos(a) * 6], [-Math.sin(a), 0, -Math.cos(a)]);
    if (h) glow(b.decal(capSkin, WINDOW_TEX, { at: h, size: [0.5, 0.75], bone: cap }), 1.1);
  }
  // shaft + collar
  b.rod([0, 9.7, 0.7], [0, 9.7, 2.0], 0.2, DWOOD, { bone: cap });
  b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.22, 8), TEAL, { at: [0, 9.7, 1.62], dir: [0, 0, 1], bone: cap });

  // ---------- hub + sails ----------
  b.part(new THREE.CylinderGeometry(0.42, 0.46, 0.55, 8), TEAL, { at: [HUB[0], HUB[1], HUB[2] + 0.1], dir: [0, 0, 1], bone: hub });
  b.spike([0, 9.7, 2.3], [0, 0, 1], 0.6, 0.3, { color: GOLD, bone: hub });
  sails.forEach((joint, k) => {
    const a = A0 + (k * Math.PI) / 2;
    const d = [Math.cos(a), Math.sin(a), 0];
    const w = [-Math.sin(a), Math.cos(a), 0];
    const sp = (x: number, y: number, z = 0.3): [number, number, number] => [
      HUB[0] + d[0] * x + w[0] * y, HUB[1] + d[1] * x + w[1] * y, HUB[2] + z,
    ];
    b.rod(sp(0.3, 0, 0.25), sp(5.95, 0, 0.25), [0.11, 0.08], WOOD, { bone: joint });
    b.extrude(
      [[1.2, 0.1], [5.7, 0.1], [5.7, 1.15], [1.2, 0.8]] as any,
      { at: sp(0, 0, 0.3), x: d as any, y: w as any, thickness: 0.05, color: CLOTH, bone: joint },
    );
    b.rod(sp(1.2, 0.8), sp(5.7, 1.15), 0.035, DWOOD, { bone: joint });
    b.rod(sp(5.7, 0), sp(5.7, 1.15), 0.05, DWOOD, { bone: joint });
    b.rod(sp(1.2, 0), sp(1.2, 0.8), 0.05, DWOOD, { bone: joint });
    for (let i = 1; i < 8; i++) {
      const x = 1.2 + (i * 4.5) / 8;
      const fy = 0.8 + ((x - 1.2) / 4.5) * 0.35;
      b.rod(sp(x, 0), sp(x, fy), 0.028, WOOD, { bone: joint });
    }
    b.part(new THREE.SphereGeometry(0.13, 6, 5), TEAL, { at: sp(5.98, 0, 0.25), bone: joint });
    b.part(new THREE.BoxGeometry(0.3, 0.3, 0.14), GOLD, { at: sp(0.55, 0, 0.3), quat: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), a), bone: joint });
  });

  // ---------- tail pole ----------
  const top: [number, number, number] = [0, 9.3, -1.5];
  const bot: [number, number, number] = [0, 0.2, -7.0];
  b.rod(top, bot, 0.14, DWOOD, { bone: cap });
  for (let i = 1; i < 12; i++) {
    const t = i / 12;
    const q = [0, top[1] + (bot[1] - top[1]) * t, top[2] + (bot[2] - top[2]) * t];
    b.rod([-0.42, q[1], q[2]], [0.42, q[1], q[2]], 0.04, WOODL, { bone: cap });
  }
  b.part(new THREE.BoxGeometry(0.8, 0.3, 1.0), STONE, { at: [0, 0.15, -7.0], bone: base });

  // ---------- ground props ----------
  [[-1.7, 3.35], [-1.3, 3.65], [-2.0, 3.75]].forEach(([x, z], i) => {
    b.part(new THREE.SphereGeometry(0.28, 8, 6), SACK, { at: [x, 0.33, z], scale: [1, 1.2, 0.85], rotation: [0, i * 40, 0], bone: base });
    b.part(new THREE.ConeGeometry(0.09, 0.16, 6), "#c9a45e", { at: [x, 0.7, z], bone: base });
  });
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.62, 8), WOOD, { at: [1.9, 0.31, 3.4], bone: base });
  for (const y of [0.14, 0.48]) b.part(new THREE.CylinderGeometry(0.325, 0.325, 0.06, 8), DWOOD, { at: [1.9, y, 3.4], bone: base });
  b.part(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 8), WOODL, { at: [1.9, 0.63, 3.4], bone: base });
  const tf: any[] = [];
  for (let i = 0; i < 9; i++) {
    const s = i < 5 ? 1 : -1;
    tf.push(frame([s * (1.3 + R() * 1.0), 0, 3.0 + R() * 0.2], [0, 1, 0]));
  }
  b.cards(tf, TULIPS, { size: [0.2, 0.34], cross: true, rng: R, vary: 0.25, bone: base });

  return b.root;
}
```