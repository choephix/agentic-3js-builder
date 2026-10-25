```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  paint,
  resolve,
  mix,
  smoothstep,
  grain,
  mottle,
  patches,
  svg,
  catmull,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Night Ramen Stall",
  description:
    "A Ghibli-style yatai ramen cart at night: glowing paper lanterns, indigo noren, a steaming copper pot, red lacquered stools, a menu board and a black cat waiting for scraps.",
};

type P = [number, number, number];
const DEG = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "ramen-stall" });
  const R = rng(11);

  // ---------------------------------------------------------------- layout constants
  const G = 0.04; // top of the cobble base
  const CT = G + 0.96; // counter top surface
  const RIDGE = 2.36; // roof ridge height
  const PITCH = Math.tan(25 * DEG);
  const roofY = (z: number) => RIDGE - Math.abs(z) * PITCH;
  const POST_X = 0.95;
  const POST_Z = 0.3;
  const BEAM_Y = roofY(POST_Z) - 0.05;

  // lantern positions, for warm light pools in the paints
  const LAMPS: P[] = [
    [0.95, 1.76, 0.62],
    [-0.95, 1.76, 0.62],
    [1.32, 1.66, 0.3],
    [0, 1.9, -0.05],
  ];
  const lampLight = (p: THREE.Vector3) => {
    let k = 0;
    for (const l of LAMPS) {
      const d = Math.hypot(p.x - l[0], p.y - l[1], p.z - l[2]);
      k += smoothstep(1.5, 0.25, d);
    }
    return Math.min(k, 1);
  };

  // ---------------------------------------------------------------- palette
  const INK = "#1a1411";
  const CREAM = "#f1e3c0";
  const RED = "#b7302a";
  const LACQUER = "#c2352c";
  const PORCELAIN = "#f1ecdf";
  const BLUE = "#274b86";
  const BROTH = "#c58b3a";
  const NOODLE = "#f3dc8c";
  const FUR = "#1c1a21";
  const BULB = "#ffd27a";
  const COPPER = metal("copper", { verdigris: 0.25, tarnish: 0.4 });
  const BRASS = metal("brass", { tarnish: 0.3 });
  const IRON = metal("iron");

  const woodPaint = (axis: "x" | "y" | "z", lo = "#5c3b21", hi = "#8f6539") => {
    const g = grain(lo, hi, { size: 0.012, axis, seed: 3 });
    return paint((p, n) => {
      const c = resolve(g, p, n);
      const k = 0.68 + 0.3 * smoothstep(-0.7, 0.9, n.y) + 0.18 * lampLight(p);
      const warm = mix(c, "#ffb46a", 0.22 * lampLight(p));
      return [Math.min(warm[0] * k, 1), Math.min(warm[1] * k, 1), Math.min(warm[2] * k, 1)];
    });
  };
  const WOODX = woodPaint("x");
  const WOODY = woodPaint("y");
  const WOODZ = woodPaint("z");
  const DARKWOOD = woodPaint("x", "#3a2414", "#5a3a22");

  // cart body: planks with dark seams and a rail
  const BODY = paint((p, n) => {
    const front = Math.abs(n.z) > 0.6;
    const side = Math.abs(n.x) > 0.6;
    const u = side ? p.z + 0.4 : p.x + 1.0;
    const f = ((u / 0.19) % 1 + 1) % 1;
    if ((front || side) && f < 0.035) return INK;
    if ((front || side) && Math.abs(p.y - (G + 0.58)) < 0.012) return INK;
    return WOODX;
  });

  // roof canvas: indigo mottle, red line and cream eave band
  const canvas = mottle("#27325c", "#3b4c80", { size: 0.18, seed: 5 });
  const ROOF = paint((p, n) => {
    const z = Math.abs(p.z);
    if (z > 0.6) return CREAM;
    if (z > 0.55) return RED;
    const c = resolve(canvas, p, n);
    const k = n.y > 0 ? 1 : 0.7;
    return [c[0] * k, c[1] * k, c[2] * k];
  });

  // cobble base, warmed by lantern light
  const cobbles = patches("#262420", ["#4d4a46", "#5a554c", "#45423c", "#3f3d3a", "#514d47"], {
    size: 0.14,
    gap: 0.1,
    seed: 2,
  });
  const GROUND = paint((p, n) => {
    if (n.y < 0.5) return "#232120";
    const c = resolve(cobbles, p, n);
    const blue = mix(c, "#3a4a72", 0.3);
    return mix(blue, "#e6a460", 0.45 * lampLight(p));
  });

  const bowlPaint = (broth: boolean) =>
    paint((_p, n, s) => {
      if (s[0] > 0.064) return BLUE;
      if (broth && n.y > 0.8 && s[0] < 0.052) return BROTH;
      const deg = ((s[1] % 36) + 36) % 36;
      if (s[0] > 0.028 && s[0] < 0.058 && Math.abs(deg - 18) < 2.5 && n.y < 0.3) return "#3c66ab";
      return PORCELAIN;
    });
  const BOWL_FULL = bowlPaint(true);
  const BOWL_EMPTY = bowlPaint(false);

  // ---------------------------------------------------------------- textures
  const noren = (inner: string) =>
    svg(
      `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="160" height="100" fill="#22305e"/>
        <rect y="94" width="160" height="6" fill="#182244"/>
        <rect x="0" y="0" width="160" height="4" fill="#2c3d74"/>
        ${inner}
      </svg>`,
      { size: 256 },
    );
  const glyph = (ch: string, y: number, size = 44, fill = "#f4ecd6") =>
    `<text x="80" y="${y}" font-size="${size}" text-anchor="middle" font-family="serif" font-weight="bold" fill="${fill}">${ch}</text>`;
  const NOREN_A = noren(glyph("ら", 46) + `<rect x="76" y="58" width="8" height="32" rx="3" fill="#f4ecd6"/>`);
  const NOREN_B = noren(glyph("め", 46) + glyph("ん", 90));
  const NOREN_C = noren(`<circle cx="80" cy="50" r="36" fill="#f4ecd6"/>` + glyph("麺", 66, 46, "#22305e"));

  const lanternTex = (ch: string) => {
    let ribs = "";
    for (let y = 8; y < 100; y += 8)
      ribs += `<line x1="0" y1="${y}" x2="200" y2="${y}" stroke="#b8341a" stroke-width="1.6"/>`;
    return svg(
      `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="g" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="#ffb24e"/><stop offset="1" stop-color="#ee4a22"/></radialGradient></defs>
        <rect width="200" height="100" fill="url(#g)"/>
        ${ribs}
        <text x="100" y="67" font-size="48" text-anchor="middle" font-family="serif" font-weight="bold" fill="#2a1208">${ch}</text>
      </svg>`,
      { size: 512 },
    );
  };
  const LANTERN_MEN = lanternTex("麺");
  const LANTERN_SAKE = lanternTex("酒");

  const MENU = svg(
    `<svg viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="90" rx="3" fill="#efe0b8" stroke="#5a3a1e" stroke-width="2"/>
      <text x="30" y="16" font-size="9" text-anchor="middle" font-weight="bold" font-family="serif" fill="#3a2210">お品書き</text>
      <line x1="8" y1="21" x2="52" y2="21" stroke="#5a3a1e" stroke-width="1.2"/>
      <text x="6" y="34" font-size="6.5" font-family="serif" fill="#3a2210">ラーメン</text><text x="54" y="34" font-size="6.5" text-anchor="end" font-family="serif" fill="#8a2a1a">¥600</text>
      <text x="6" y="48" font-size="6.5" font-family="serif" fill="#3a2210">味噌ラーメン</text><text x="54" y="48" font-size="6.5" text-anchor="end" font-family="serif" fill="#8a2a1a">¥700</text>
      <text x="6" y="62" font-size="6.5" font-family="serif" fill="#3a2210">ぎょうざ</text><text x="54" y="62" font-size="6.5" text-anchor="end" font-family="serif" fill="#8a2a1a">¥350</text>
      <text x="6" y="76" font-size="6.5" font-family="serif" fill="#3a2210">ビール</text><text x="54" y="76" font-size="6.5" text-anchor="end" font-family="serif" fill="#8a2a1a">¥500</text>
      <line x1="8" y1="82" x2="52" y2="82" stroke="#5a3a1e" stroke-width="1"/>
    </svg>`,
    { size: 256 },
  );

  const SIGN = svg(
    `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="100" rx="4" fill="#c7352b"/>
      <rect x="2.5" y="2.5" width="35" height="95" rx="3" fill="none" stroke="#f4ecd6" stroke-width="1.5"/>
      <text x="20" y="32" font-size="22" text-anchor="middle" font-family="serif" font-weight="bold" fill="#f4ecd6">営</text>
      <text x="20" y="60" font-size="22" text-anchor="middle" font-family="serif" font-weight="bold" fill="#f4ecd6">業</text>
      <text x="20" y="88" font-size="22" text-anchor="middle" font-family="serif" font-weight="bold" fill="#f4ecd6">中</text>
    </svg>`,
    { size: 256 },
  );

  const PLAQUE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#3b2514"/>
      <rect x="4" y="4" width="92" height="92" fill="none" stroke="#d9a94a" stroke-width="2"/>
      <rect x="9" y="9" width="82" height="82" fill="none" stroke="#d9a94a" stroke-width="0.8"/>
      <text x="50" y="74" font-size="68" text-anchor="middle" font-family="serif" font-weight="bold" fill="#f1e3c0">麺</text>
    </svg>`,
    { size: 256 },
  );

  const STEAM = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
      <g fill="#ffffff" opacity="0.78">
        <ellipse cx="32" cy="112" rx="13" ry="14"/>
        <ellipse cx="24" cy="84" rx="15" ry="17"/>
        <ellipse cx="38" cy="54" rx="17" ry="19"/>
        <ellipse cx="28" cy="24" rx="13" ry="15"/>
        <ellipse cx="40" cy="8" rx="8" ry="8"/>
      </g>
    </svg>`,
    { size: 128 },
  );

  const NARUTO = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="31" fill="#fff3ee"/>
      <circle cx="32" cy="32" r="30" fill="none" stroke="#f08aa0" stroke-width="2"/>
      <path d="M32 32 a3 3 0 0 1 3 3 a6 6 0 0 1 -6 6 a9 9 0 0 1 -9 -9 a12 12 0 0 1 12 -12 a15 15 0 0 1 15 15 a18 18 0 0 1 -18 18" fill="none" stroke="#f08aa0" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------- small helpers
  const box = (size: P, color: any, at: P, extra: Record<string, unknown> = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: P, extra: Record<string, unknown> = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, ...extra });
  const sph = (r: number, color: any, at: P, extra: Record<string, unknown> = {}) =>
    b.part(new THREE.SphereGeometry(r, 10, 7), color, { at, ...extra });
  const circleXZ = (c: P, r: number, n = 12): P[] => {
    const pts: P[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([c[0] + r * Math.cos(a), c[1], c[2] + r * Math.sin(a)]);
    }
    return pts;
  };
  const circleYZ = (c: P, r: number, n = 14): P[] => {
    const pts: P[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([c[0], c[1] + r * Math.cos(a), c[2] + r * Math.sin(a)]);
    }
    return pts;
  };
  const hoop = (c: P, r: number, tube: number, color: any) =>
    b.sweep(catmull(circleXZ(c, r), { closed: true }), tube, { color, sides: 6 });

  // ---------------------------------------------------------------- cobble base
  b.part(new THREE.CylinderGeometry(1.9, 1.92, G, 28), GROUND, {
    at: [0, G / 2, 0],
    scale: [1.06, 1, 0.8],
    flat: true,
  });

  // ---------------------------------------------------------------- the cart
  const BODY_Y0 = G + 0.19;
  const BODY_H = 0.72;
  box([1.9, BODY_H, 0.66], BODY, [0, BODY_Y0 + BODY_H / 2, 0]);
  // trim rails on the front
  box([1.94, 0.045, 0.025], DARKWOOD, [0, BODY_Y0 + 0.03, 0.335]);
  box([1.94, 0.045, 0.025], DARKWOOD, [0, BODY_Y0 + BODY_H - 0.03, 0.335]);
  for (const s of [1, -1]) box([0.045, BODY_H, 0.025], DARKWOOD, [s * 0.95, BODY_Y0 + BODY_H / 2, 0.335]);
  // front plaque
  b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
    at: [0, BODY_Y0 + 0.36, 0.352],
    dir: [0, 0, 1],
    axis: "z",
    texture: PLAQUE,
  });
  // counter top
  box([2.16, 0.05, 0.84], WOODX, [0, CT - 0.025, 0]);
  box([2.2, 0.03, 0.04], DARKWOOD, [0, CT - 0.03, 0.42]);
  // front legs
  for (const s of [1, -1]) b.rod([s * 0.82, BODY_Y0 + 0.02, 0.24], [s * 0.82, G, 0.24], 0.03, WOODY, { sides: 6 });
  // wheels
  for (const s of [1, -1]) {
    const wc: P = [s * 1.0, G + 0.31, -0.08];
    b.sweep(catmull(circleYZ(wc, 0.28), { closed: true }), 0.03, { color: DARKWOOD, sides: 6 });
    cyl(0.06, 0.06, 0.09, 10, IRON, wc, { rotation: [0, 0, 90] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.rod(wc, [wc[0], wc[1] + 0.27 * Math.cos(a), wc[2] + 0.27 * Math.sin(a)], 0.014, WOODY, { sides: 5 });
    }
  }
  // axle beam
  b.rod([-1.05, G + 0.31, -0.08], [1.05, G + 0.31, -0.08], 0.028, IRON, { sides: 6 });

  // ---------------------------------------------------------------- frame and roof
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * POST_X;
      const z = sz * POST_Z;
      b.rod([x, CT, z], [x, roofY(z) - 0.03, z], 0.03, WOODY, { sides: 6 });
    }
  for (const sz of [1, -1])
    b.rod([-POST_X - 0.03, BEAM_Y, sz * POST_Z], [POST_X + 0.03, BEAM_Y, sz * POST_Z], 0.026, WOODX, { sides: 6 });
  for (const sx of [1, -1])
    b.rod([sx * POST_X, BEAM_Y, -POST_Z - 0.03], [sx * POST_X, BEAM_Y, POST_Z + 0.03], 0.026, WOODZ, { sides: 6 });

  // roof panels
  const HALF = 0.37;
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(2.5, 0.03, HALF * 2), ROOF, {
      at: [0, RIDGE - HALF * Math.sin(25 * DEG), s * HALF * Math.cos(25 * DEG)],
      rotation: [s * 25, 0, 0],
    });
  // ridge beam and rafters
  b.rod([-1.3, RIDGE + 0.015, 0], [1.3, RIDGE + 0.015, 0], 0.03, WOODX, { sides: 6 });
  const EAVE_Z = HALF * 2 * Math.cos(25 * DEG);
  const EAVE_Y = RIDGE - HALF * 2 * Math.sin(25 * DEG);
  for (const x of [-1.12, -0.56, 0, 0.56, 1.12])
    for (const s of [1, -1])
      b.rod([x, RIDGE - 0.035, 0], [x, EAVE_Y - 0.035, s * EAVE_Z], 0.018, WOODZ, { sides: 5 });

  // scalloped eave trim on the front
  const SW = 2.5 / 12;
  const scallop: OutlinePoint[] = [
    [-1.25, 0.09, "sharp"],
    [1.25, 0.09, "sharp"],
  ];
  for (let i = 0; i < 12; i++) {
    const cx = 1.25 - (i + 0.5) * SW;
    for (let k = 0; k <= 4; k++) {
      const a = (k / 4) * Math.PI;
      scallop.push([cx + 0.5 * SW * Math.cos(a), 0.05 - 0.05 * Math.sin(a)]);
    }
  }
  const TRIM = paint((_p, _n, s) => (Math.floor((1.25 - s[0]) / SW) % 2 === 0 ? RED : CREAM));
  b.extrude(scallop, { at: [0, EAVE_Y - 0.085, EAVE_Z + 0.012], x: [1, 0, 0], thickness: 0.012, color: TRIM });
  // back eave: plain cream fascia
  box([2.5, 0.07, 0.012], CREAM, [0, EAVE_Y - 0.035, -EAVE_Z - 0.012]);

  // ---------------------------------------------------------------- noren curtains
  const NOREN_Y = BEAM_Y - 0.02;
  b.rod([-0.92, NOREN_Y, 0.37], [0.92, NOREN_Y, 0.37], 0.012, "#c9b47a", { sides: 6 });
  const panels: [number, THREE.Texture][] = [
    [0.6, NOREN_A],
    [0, NOREN_B],
    [-0.6, NOREN_C],
  ];
  for (const [x, tex] of panels) {
    const at: P = [x, NOREN_Y - 0.19, 0.375];
    b.part(new THREE.PlaneGeometry(0.56, 0.35), "#ffffff", { at, dir: [0, 0, 1], axis: "z", texture: tex });
    b.part(new THREE.PlaneGeometry(0.56, 0.35), "#ffffff", {
      at: [x, at[1], 0.368],
      dir: [0, 0, -1],
      axis: "z",
      texture: tex,
    });
    // cord loops over the rod
    for (const dx of [-0.24, 0.24]) b.rod([x + dx, NOREN_Y + 0.02, 0.372], [x + dx, NOREN_Y - 0.02, 0.372], 0.006, "#ede3c8");
  }

  // ---------------------------------------------------------------- lanterns
  const lantern = (at: P, r: number, tex: THREE.Texture, facing: "z" | "x", hangFrom: number) => {
    const body = b.part(new THREE.SphereGeometry(r, 14, 10), "#ffffff", {
      at,
      scale: [1, 1.2, 1],
      rotation: facing === "z" ? [0, -90, 0] : [0, 0, 0],
      texture: tex,
    });
    glow(body, 1.5);
    const h = r * 1.2;
    cyl(r * 0.42, r * 0.5, 0.035, 10, INK, [at[0], at[1] + h, at[2]]);
    cyl(r * 0.5, r * 0.42, 0.035, 10, INK, [at[0], at[1] - h - 0.005, at[2]]);
    // handle wire and cord
    b.sweep(
      catmull([
        [at[0] - r * 0.3, at[1] + h + 0.015, at[2]],
        [at[0], at[1] + h + 0.05, at[2]],
        [at[0] + r * 0.3, at[1] + h + 0.015, at[2]],
      ]),
      0.004,
      { color: INK, sides: 5 },
    );
    b.rod([at[0], at[1] + h + 0.05, at[2]], [at[0], hangFrom, at[2]], 0.005, "#3a2a1a", { sides: 5 });
    // little red tassel below
    b.rod([at[0], at[1] - h - 0.02, at[2]], [at[0], at[1] - h - 0.09, at[2]], 0.012, RED, { sides: 6, caps: "flat" });
  };
  lantern([0.95, 1.76, 0.62], 0.15, LANTERN_MEN, "z", EAVE_Y - 0.03);
  lantern([-0.95, 1.76, 0.62], 0.15, LANTERN_MEN, "z", EAVE_Y - 0.03);
  // side lantern on a bracket off the left front post
  b.rod([POST_X, 2.0, POST_Z], [1.32, 2.0, POST_Z], 0.02, WOODX, { sides: 6 });
  b.rod([POST_X, 1.86, POST_Z], [1.3, 1.99, POST_Z], 0.014, WOODX, { sides: 5 });
  lantern([1.32, 1.64, 0.3], 0.17, LANTERN_SAKE, "x", 2.0);

  // hanging bulb under the roof
  b.rod([0, RIDGE - 0.02, -0.05], [0, 2.05, -0.05], 0.005, INK, { sides: 5 });
  cyl(0.025, 0.11, 0.07, 12, "#2e5a4a", [0, 2.02, -0.05], { flat: true });
  glow(sph(0.035, BULB, [0, 1.95, -0.05]), 2.2);
  cyl(0.012, 0.012, 0.03, 6, "#8a8a80", [0, 1.985, -0.05]);

  // hanging "open" sign at the right eave
  b.rod([-1.2, EAVE_Y - 0.03, 0.5], [-1.2, 1.98, 0.5], 0.005, "#3a2a1a", { sides: 5 });
  b.part(new THREE.PlaneGeometry(0.16, 0.4), "#ffffff", { at: [-1.2, 1.78, 0.5], dir: [0, 0, 1], axis: "z", texture: SIGN });
  b.part(new THREE.PlaneGeometry(0.16, 0.4), "#ffffff", { at: [-1.2, 1.78, 0.494], dir: [0, 0, -1], axis: "z", texture: SIGN });

  // menu board on the left front post
  b.rod([0.72, BEAM_Y - 0.01, 0.33], [0.72, 1.74, 0.33], 0.004, "#3a2a1a", { sides: 5 });
  b.rod([0.92, BEAM_Y - 0.01, 0.33], [0.92, 1.74, 0.33], 0.004, "#3a2a1a", { sides: 5 });
  b.part(new THREE.PlaneGeometry(0.3, 0.45), "#ffffff", { at: [0.82, 1.52, 0.34], dir: [0, 0, 1], axis: "z", texture: MENU });
  box([0.32, 0.47, 0.012], DARKWOOD, [0.82, 1.52, 0.332]);

  // ---------------------------------------------------------------- back shelf and bottles
  box([1.7, 0.03, 0.18], WOODX, [0, 1.42, -0.3]);
  for (const s of [1, -1]) b.rod([s * 0.8, 1.405, -0.21], [s * 0.8, 1.28, -0.3], 0.012, WOODY, { sides: 5 });
  const bottleColors = ["#2d5a3a", "#5a3a22", "#2c4a7a", "#2d5a3a", "#7a2a2a", "#2c4a7a"];
  bottleColors.forEach((c, i) => {
    const x = 0.62 - i * 0.25;
    const at: P = [x, 1.435, -0.3];
    cyl(0.035, 0.035, 0.2, 9, c, [at[0], at[1] + 0.1, at[2]]);
    cyl(0.014, 0.03, 0.06, 8, c, [at[0], at[1] + 0.225, at[2]]);
    cyl(0.015, 0.015, 0.03, 8, i % 2 ? "#d9a94a" : "#eeeeee", [at[0], at[1] + 0.26, at[2]]);
    box([0.05, 0.07, 0.002], i % 3 ? CREAM : "#e8c88a", [at[0], at[1] + 0.1, at[2] + 0.036]);
  });

  // ---------------------------------------------------------------- stove, pot and steam
  const PX = 0.55;
  const PZ = -0.12;
  box([0.52, 0.11, 0.5], IRON, [PX, CT + 0.055, PZ]);
  glow(
    b.part(new THREE.PlaneGeometry(0.22, 0.05), "#ff8a2a", { at: [PX, CT + 0.05, PZ + 0.252], dir: [0, 0, 1], axis: "z" }),
    2.5,
  );
  box([0.26, 0.07, 0.01], IRON, [PX, CT + 0.05, PZ + 0.25]); // grate frame behind the glow... slightly behind
  const POT_R = 0.21;
  const POT_Y = CT + 0.11;
  cyl(POT_R, POT_R - 0.02, 0.3, 14, COPPER, [PX, POT_Y + 0.15, PZ]);
  hoop([PX, POT_Y + 0.3, PZ], POT_R, 0.014, BRASS);
  for (const s of [1, -1])
    b.sweep(
      catmull([
        [PX + s * (POT_R - 0.01), POT_Y + 0.2, PZ],
        [PX + s * (POT_R + 0.05), POT_Y + 0.26, PZ],
        [PX + s * (POT_R - 0.01), POT_Y + 0.3, PZ],
      ]),
      0.012,
      { color: BRASS, sides: 6 },
    );
  // lid, tilted ajar on the back rim
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.21, 0.014],
      [0.15, 0.045],
      [0.05, 0.07],
      [0, 0.072],
    ],
    { at: [PX, POT_Y + 0.33, PZ - 0.04], axis: [0, 0.94, -0.34], segments: 14, color: BRASS },
  );
  sph(0.022, INK, [PX, POT_Y + 0.4, PZ - 0.07]);
  // ladle resting in the pot
  b.rod([PX - 0.12, POT_Y + 0.22, PZ + 0.05], [PX + 0.1, POT_Y + 0.55, PZ - 0.12], 0.008, WOODY, { sides: 5 });
  b.part(new THREE.SphereGeometry(0.04, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), BRASS, {
    at: [PX - 0.13, POT_Y + 0.25, PZ + 0.06],
  });
  // broth surface glint
  cyl(POT_R - 0.03, POT_R - 0.03, 0.01, 14, "#d9a34a", [PX, POT_Y + 0.26, PZ]);
  // steam
  const steamFrames = [
    frame([PX - 0.05, POT_Y + 0.3, PZ + 0.06], [0, 1, 0]),
    frame([PX + 0.07, POT_Y + 0.3, PZ + 0.02], [0, 1, 0]),
    frame([PX - 0.02, POT_Y + 0.3, PZ - 0.06], [0, 1, 0]),
    frame([PX + 0.03, POT_Y + 0.3, PZ + 0.1], [0, 1, 0]),
  ];
  glow(
    b.cards(steamFrames, STEAM, {
      size: [0.24, 0.55],
      lean: 10,
      bend: 18,
      cross: true,
      vary: 0.3,
      spin: 60,
      rng: rng(5),
      flow: [0.3, 0, -1],
    }),
    0.6,
  );

  // kettle at the right end
  const KX = -0.68;
  const KZ = -0.22;
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.09, 0.05],
      [0.085, 0.1],
      [0.045, 0.12],
      [0.02, 0.125],
      [0, 0.126],
    ],
    { at: [KX, CT, KZ], segments: 12, color: IRON, smoothing: 1 },
  );
  cyl(0.02, 0.022, 0.02, 8, IRON, [KX, CT + 0.135, KZ]);
  b.sweep(
    catmull([
      [KX + 0.07, CT + 0.05, KZ],
      [KX + 0.12, CT + 0.1, KZ],
      [KX + 0.14, CT + 0.15, KZ],
    ]),
    [0.016, 0.01],
    { color: IRON, sides: 6 },
  );
  b.sweep(
    catmull([
      [KX - 0.05, CT + 0.11, KZ],
      [KX - 0.02, CT + 0.2, KZ],
      [KX + 0.03, CT + 0.21, KZ],
      [KX + 0.06, CT + 0.11, KZ],
    ]),
    0.008,
    { color: INK, sides: 6 },
  );

  // ---------------------------------------------------------------- bowls and counter dressing
  const BOWL_FULL_OUT: OutlinePoint[] = [
    [0, 0],
    [0.038, 0],
    [0.042, 0.012],
    [0.078, 0.064],
    [0.082, 0.072],
    [0.07, 0.072],
    [0.06, 0.052],
    [0, 0.05],
  ];
  const BOWL_EMPTY_OUT: OutlinePoint[] = [
    [0, 0],
    [0.038, 0],
    [0.042, 0.012],
    [0.078, 0.064],
    [0.082, 0.072],
    [0.07, 0.072],
    [0.036, 0.02],
    [0, 0.016],
  ];
  // the served bowl in front of the middle stool
  const BX = 0;
  const BZ = 0.2;
  b.lathe(BOWL_FULL_OUT, { at: [BX, CT, BZ], segments: 14, color: BOWL_FULL });
  for (let i = 0; i < 6; i++) {
    const pts: P[] = [];
    let ang = R() * 6.28;
    for (let k = 0; k < 5; k++) {
      ang += 0.8 + 0.3 * R();
      const rr = 0.01 + 0.038 * R();
      pts.push([BX + rr * Math.cos(ang), CT + 0.051 + 0.004 * R(), BZ + rr * Math.sin(ang)]);
    }
    b.sweep(catmull(pts), 0.0035, { color: NOODLE, sides: 5 });
  }
  b.part(new THREE.SphereGeometry(0.02, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#fbf6ea", { at: [BX + 0.028, CT + 0.05, BZ - 0.02] });
  sph(0.011, "#f0a030", [BX + 0.028, CT + 0.065, BZ - 0.02]);
  cyl(0.018, 0.018, 0.005, 12, "#f6c9d2", [BX - 0.03, CT + 0.053, BZ + 0.01]);
  b.part(new THREE.CircleGeometry(0.018, 14), "#ffffff", {
    at: [BX - 0.03, CT + 0.0565, BZ + 0.01],
    dir: [0, 1, 0],
    axis: "z",
    texture: NARUTO,
  });
  box([0.04, 0.045, 0.003], "#162018", [BX - 0.01, CT + 0.07, BZ - 0.05], { rotation: [-12, 0, 0] });
  for (let i = 0; i < 4; i++)
    cyl(0.004, 0.004, 0.004, 6, "#6fbf4a", [BX + 0.02 - i * 0.012, CT + 0.052, BZ + 0.03 + (i % 2) * 0.012]);
  // chopsticks resting across the bowl
  for (const dz of [-0.008, 0.008])
    b.rod([BX - 0.09, CT + 0.078, BZ + 0.04 + dz], [BX + 0.13, CT + 0.074, BZ + 0.02 + dz], 0.004, "#8a3a2a", { sides: 5 });
  // a spoon
  b.rod([BX + 0.11, CT + 0.005, BZ + 0.11], [BX + 0.22, CT + 0.005, BZ + 0.07], 0.008, PORCELAIN, { sides: 6 });
  sph(0.022, PORCELAIN, [BX + 0.1, CT + 0.008, BZ + 0.115], { scale: [1, 0.5, 1.3] });

  // stack of empty bowls at the left end
  for (let i = 0; i < 4; i++) b.lathe(BOWL_EMPTY_OUT, { at: [0.84, CT + i * 0.025, 0.12], segments: 14, color: BOWL_EMPTY });
  // a second full bowl waiting by the pot
  b.lathe(BOWL_FULL_OUT, { at: [0.25, CT, -0.22], segments: 14, color: BOWL_FULL });
  sph(0.012, "#f6c9d2", [0.25, CT + 0.052, -0.2], { scale: [1, 0.4, 1] });

  // chopstick cup
  cyl(0.03, 0.026, 0.09, 10, "#8a3a2a", [-0.42, CT + 0.045, 0.3]);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const x = -0.42 + 0.014 * Math.cos(a);
    const z = 0.3 + 0.014 * Math.sin(a);
    b.rod([x, CT + 0.05, z], [x + 0.02 * Math.cos(a), CT + 0.2, z + 0.02 * Math.sin(a)], 0.003, "#d9b27a", { sides: 4 });
  }
  // condiment jars
  const jars: [number, string][] = [
    [-0.6, "#7a2a2a"],
    [-0.66, "#3a3a3a"],
    [-0.72, "#d9a94a"],
  ];
  for (const [x, c] of jars) {
    cyl(0.022, 0.024, 0.07, 9, c, [x, CT + 0.035, 0.3]);
    cyl(0.018, 0.022, 0.015, 9, "#bfb8a8", [x, CT + 0.078, 0.3]);
  }
  // folded towel
  box([0.12, 0.02, 0.09], "#5b7ea8", [0.6, CT + 0.01, 0.3]);
  box([0.12, 0.005, 0.03], "#e8e0cc", [0.6, CT + 0.023, 0.3]);

  // ---------------------------------------------------------------- stools
  const SEAT_Y = G + 0.43;
  const stool = (cx: number, cz: number) => {
    cyl(0.17, 0.15, 0.05, 14, LACQUER, [cx, SEAT_Y + 0.025, cz], { flat: true });
    cyl(0.1, 0.1, 0.006, 12, "#e0523f", [cx, SEAT_Y + 0.053, cz]);
    for (const dx of [1, -1])
      for (const dz of [1, -1]) {
        const top: P = [cx + dx * 0.085, SEAT_Y - 0.01, cz + dz * 0.085];
        const bottom: P = [cx + dx * 0.125, G, cz + dz * 0.125];
        b.rod(top, bottom, 0.013, DARKWOOD, { sides: 6, caps: "flat" });
      }
    hoop([cx, G + 0.16, cz], 0.125, 0.008, DARKWOOD);
  };
  stool(0.6, 0.76);
  stool(0, 0.76);
  stool(-0.6, 0.76);

  // ---------------------------------------------------------------- crate (left) and barrel (right)
  const CRATE: P = [1.3, G + 0.17, 0.08];
  box([0.34, 0.34, 0.34], paint((p, n) => {
    const f = ((p.y - G) / 0.085) % 1;
    if (Math.abs(n.y) < 0.5 && f < 0.1) return INK;
    return WOODX;
  }), CRATE);
  for (const s of [1, -1]) box([0.36, 0.03, 0.03], DARKWOOD, [CRATE[0], CRATE[1] + s * 0.155, CRATE[2] + 0.17]);
  // a sake jug on the crate
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.08, 0.06],
      [0.07, 0.13],
      [0.03, 0.16],
      [0.035, 0.19],
      [0, 0.19],
    ],
    { at: [CRATE[0], CRATE[1] + 0.17, CRATE[2]], segments: 12, color: "#dcd2bc", smoothing: 1 },
  );
  const BARREL: P = [-1.3, G, 0.12];
  b.lathe(
    [
      [0, 0],
      [0.17, 0],
      [0.2, 0.2],
      [0.17, 0.42],
      [0, 0.42],
    ],
    { at: BARREL, segments: 12, color: WOODY, smoothing: 1 },
  );
  for (const h of [0.06, 0.2, 0.36]) hoop([BARREL[0], BARREL[1] + h, BARREL[2]], 0.17 + 0.03 * (1 - Math.abs(h - 0.2) / 0.16), 0.012, IRON);
  // a bucket beside the barrel
  cyl(0.09, 0.075, 0.16, 10, DARKWOOD, [-1.3, G + 0.08, -0.25]);
  hoop([-1.3, G + 0.15, -0.25], 0.09, 0.007, IRON);
  cyl(0.07, 0.07, 0.006, 10, "#3a5a78", [-1.3, G + 0.145, -0.25]);

  // ---------------------------------------------------------------- the cat on the right stool
  const SEAT_TOP = SEAT_Y + 0.056;
  const cx = -0.6;
  const cz = 0.78;
  b.capsule([cx, SEAT_TOP + 0.03, cz - 0.03], [cx, SEAT_TOP + 0.21, cz + 0.01], [0.085, 0.068], FUR, { sides: 10 });
  // chest patch
  sph(0.04, CREAM, [cx, SEAT_TOP + 0.17, cz + 0.055], { scale: [1, 1.3, 0.5] });
  const HY = SEAT_TOP + 0.3;
  const HZ = cz + 0.02;
  sph(0.078, FUR, [cx, HY, HZ]);
  // ears
  for (const s of [1, -1]) {
    b.spike([cx + s * 0.045, HY + 0.05, HZ - 0.01], [s * 0.4, 1, -0.1], 0.07, 0.028, { color: FUR, sides: 6 });
    b.spike([cx + s * 0.045, HY + 0.052, HZ], [s * 0.4, 1, -0.05], 0.045, 0.014, { color: "#e39aa0", sides: 5 });
  }
  // muzzle, nose, eyes
  sph(0.03, "#2c2830", [cx, HY - 0.028, HZ + 0.065], { scale: [1.4, 0.8, 1] });
  sph(0.009, "#e39aa0", [cx, HY - 0.012, HZ + 0.088]);
  for (const s of [1, -1]) {
    glow(sph(0.016, "#ffd94a", [cx + s * 0.032, HY + 0.012, HZ + 0.066]), 1.6);
    box([0.006, 0.022, 0.004], INK, [cx + s * 0.032, HY + 0.012, HZ + 0.081]);
  }
  // whiskers
  for (const s of [1, -1])
    for (const dy of [-0.004, 0.006])
      b.rod([cx + s * 0.02, HY - 0.025 + dy, HZ + 0.07], [cx + s * 0.11, HY - 0.01 + dy * 3, HZ + 0.03], 0.0015, "#e8e0cc", { sides: 3 });
  // front legs
  for (const s of [1, -1])
    b.capsule([cx + s * 0.04, SEAT_TOP + 0.12, cz + 0.05], [cx + s * 0.045, SEAT_TOP + 0.015, cz + 0.07], 0.022, FUR, { sides: 7 });
  // tail curling off the seat
  b.sweep(
    catmull([
      [cx, SEAT_TOP + 0.05, cz - 0.08],
      [cx - 0.1, SEAT_TOP + 0.04, cz - 0.08],
      [cx - 0.17, SEAT_TOP + 0.02, cz - 0.02],
      [cx - 0.17, SEAT_TOP - 0.1, cz + 0.06],
      [cx - 0.13, SEAT_TOP - 0.16, cz + 0.1],
    ]),
    [0.022, 0.012],
    { color: FUR, sides: 7 },
  );
  // a saucer on the ground for the cat
  cyl(0.07, 0.06, 0.012, 12, PORCELAIN, [-0.95, G + 0.006, 0.7]);
  cyl(0.05, 0.05, 0.008, 12, "#d9b27a", [-0.95, G + 0.012, 0.7]);

  // ---------------------------------------------------------------- a string of small paper lights along the back eave
  for (let i = 0; i < 5; i++) {
    const x = -1.0 + i * 0.5;
    b.rod([x, EAVE_Y - 0.07, -EAVE_Z - 0.01], [x, EAVE_Y - 0.16, -EAVE_Z - 0.01], 0.004, "#3a2a1a", { sides: 4 });
    glow(sph(0.045, i % 2 ? "#ffb04a" : "#ff7a3a", [x, EAVE_Y - 0.2, -EAVE_Z - 0.01], { scale: [1, 1.15, 1] }), 1.4);
    cyl(0.02, 0.02, 0.012, 8, INK, [x, EAVE_Y - 0.15, -EAVE_Z - 0.01]);
  }

  return b.root;
}
```