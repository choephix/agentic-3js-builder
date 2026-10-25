import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, mix, noise, smoothstep, rng, countershade, stripes, mottle, catmull, polyline, spiral } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled, metal } from "../../../../kits/clockwork";

export const meta = {
  "name": "Hover Technical",
  "description": "A militarized pickup truck converted to ride on four glowing hover thrusters, low-poly cyberpunk with neon trim, armor plates and a bed-mounted weapon."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#3a4150",
  hullDark: "#1f242e",
  armor: "#566070",
  trim: "#e7b814",
  rust: "#7a4a2c",
  glass: "#14384a",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fb4",
  thrusterCore: "#9ff8ff",
  metalDark: "#14161c",
  rubber: "#101114",
  lampWarm: "#ffe9a8",
  tailRed: "#ff3030",
  crate: "#4d5a3a",
};
const M = {
  chassisTop: [0, 0.95, 0] as [number, number, number],
  frontAxle: [0, 0.55, 1.6] as [number, number, number],
  rearAxle: [0, 0.55, -1.5] as [number, number, number],
  thrusterFL: [1.05, 0.5, 1.6] as [number, number, number],
  thrusterFR: [-1.05, 0.5, 1.6] as [number, number, number],
  thrusterRL: [1.05, 0.5, -1.5] as [number, number, number],
  thrusterRR: [-1.05, 0.5, -1.5] as [number, number, number],
  cabFloor: [0, 0.95, 0.3] as [number, number, number],
  cabRoof: [0, 1.85, 0] as [number, number, number],
  bedFloor: [0, 0.95, -1.7] as [number, number, number],
  gunPivot: [0, 1.35, -1.6] as [number, number, number],
  bumperFront: [0, 0.75, 2.65] as [number, number, number],
  bumperRear: [0, 0.75, -2.65] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);

  // ---------- paints ----------
  const hullPaint = panelled(
    paint((p, n) => {
      const w = noise(p, 0.25, 4);
      const base = mix(P.hull, P.hullDark, 0.35 * w + 0.25 * smoothstep(0.2, -0.8, n.y));
      return mix(base, P.rust, 0.45 * smoothstep(0.62, 0.8, noise(p, 0.12, 9)) * smoothstep(0.9, 1.0, 1 - n.y * 0.1));
    }),
    { size: 0.3, aspect: 0.6, rivets: 0.06 },
  );
  const armorPaint = panelled(mix(P.armor, P.hullDark, 0.2), { size: 0.22, rivets: 0.05 });
  const wornDark = paint((p) => mix(P.metalDark, P.hullDark, noise(p, 0.1, 3)));

  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 8 - 4} 16 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8} 16Z" fill="#14161c"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const serial = svg(
    `<svg viewBox="0 0 64 24"><text x="2" y="17" font-family="monospace" font-weight="bold" font-size="16" fill="#e7b814">HT-07</text><rect x="1" y="21" width="62" height="2" fill="#2ff3ff"/></svg>`,
    { size: 256 },
  );
  const glyph = svg(
    `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" fill="none" stroke="#ff2fb4" stroke-width="3"/><path d="M14 16H34M24 10V38M14 30Q24 40 34 30" stroke="#ff2fb4" stroke-width="3.5" fill="none"/></svg>`,
    { size: 192 },
  );

  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, ...opts });

  // ---------- main slab chassis ----------
  box(2.0, 0.28, 5.1, hullPaint, [0, 0.72, 0]);
  box(1.5, 0.12, 4.9, P.metalDark, [0, 0.55, 0]);
  // underglow strips
  for (const s of [1, -1]) {
    glow(box(0.06, 0.05, 4.2, P.neonCyan, [s * 0.9, 0.57, 0]), 1.6);
    glow(box(0.06, 0.05, 4.2, P.neonCyan, [s * 0.9, 0.57, 0]), 1.6);
  }
  glow(box(1.6, 0.04, 0.06, P.neonCyan, [0, 0.55, 2.3]), 1.6);
  glow(box(1.6, 0.04, 0.06, P.neonMagenta, [0, 0.55, -2.4]), 1.6);

  // ---------- skirt armor along sides ----------
  for (const s of [1, -1]) {
    const skirt = b.extrude(
      [[-1.3, 0], [1.3, 0], [1.4, 0.38], [-1.3, 0.38]].map(([x, y]) => [x, y] as [number, number]),
      { at: [s * 1.12, 0.66, -0.1], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.1, bevel: 0.02, color: armorPaint, bone: body },
    );
    b.part(new THREE.PlaneGeometry(1.4, 0.26), "#ffffff", {
      bone: body, at: [s * 1.175, 0.83, -0.1], dir: [s, 0, 0], axis: "z", texture: hazard,
    });
    b.part(new THREE.PlaneGeometry(0.5, 0.19), "#ffffff", {
      bone: body, at: [s * 1.176, 0.83, -1.0], dir: [s, 0, 0], axis: "z", texture: serial,
    });
    // rivet ribs
    for (let i = 0; i < 4; i++) box(0.04, 0.36, 0.05, P.hullDark, [s * 1.18, 0.85, -0.8 + i * 0.7]);
    void skirt;
  }

  // ---------- fender arches over thrusters ----------
  const arch = [] as number[][];
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * Math.PI;
    arch.push([Math.cos(a) * 0.56, Math.sin(a) * 0.4]);
  }
  for (const [mx, , mz] of [M.thrusterFL, M.thrusterFR, M.thrusterRL, M.thrusterRR]) {
    const s = mx > 0 ? 1 : -1;
    b.extrude(
      [...arch.map(([x, y]) => [x, y + 0.02] as [number, number]), ...arch.slice().reverse().map(([x, y]) => [x * 0.88, y * 0.82 - 0.04 + 0.02] as [number, number])].slice(0, 14),
      { at: [mx + s * 0.02, 0.84, mz], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.22, color: armorPaint, bone: body, smoothing: 0 },
    );
    // wheel-well flare slab
    box(0.34, 0.07, 1.25, P.trim, [mx + s * 0.16, 1.23, mz]);
  }

  // ---------- hood wedge ----------
  const hood = b.extrude(
    [[0, 0], [1.75, 0], [1.75, 0.2], [1.45, 0.4], [0, 0.42]].map(([x, y]) => [x, y] as [number, number]),
    { at: [-0, 0.95, 1.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, color: hullPaint, bone: body },
  );
  void hood;
  // hood slope top panel
  b.slab(
    [[-1.08, 1.37, 1.0], [1.08, 1.37, 1.0], [1.0, 1.35, 2.45], [-1.0, 1.35, 2.45]],
    { thickness: 0.05, color: armorPaint, bone: body },
  );
  // hood vents
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      box(0.5, 0.03, 0.06, P.metalDark, [s * 0.5, 1.385, 1.3 + i * 0.22]);
      glow(box(0.44, 0.012, 0.02, P.neonCyan, [s * 0.5, 1.4, 1.3 + i * 0.22]), 1.1);
    }
  // hood center stripe
  b.part(new THREE.PlaneGeometry(0.36, 1.1), "#ffffff", {
    bone: body, at: [0, 1.395, 1.75], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: hazard,
  });

  // front fascia
  box(2.25, 0.42, 0.15, armorPaint, [0, 1.15, 2.6]);
  // headlight slits
  for (const s of [1, -1]) {
    glow(box(0.62, 0.07, 0.04, P.lampWarm, [s * 0.65, 1.27, 2.69]), 2);
    box(0.7, 0.03, 0.05, P.metalDark, [s * 0.65, 1.33, 2.68]);
  }
  glow(box(1.0, 0.04, 0.04, P.neonCyan, [0, 1.29, 2.69]), 1.8);

  // ---------- bull-bar bumper ----------
  box(2.35, 0.3, 0.3, wornDark, [0, 0.8, 2.6]);
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.3;
    if (i % 2 === 0) glow(box(0.16, 0.06, 0.04, P.neonMagenta, [x, 0.82, 2.76]), 1.8);
    else box(0.16, 0.06, 0.04, P.trim, [x, 0.82, 2.76]);
  }
  for (const s of [1, -1]) {
    b.rod([s * 0.75, 0.7, 2.65], [s * 0.75, 1.35, 2.75], 0.05, P.metalDark, { bone: body });
    b.rod([s * 0.75, 1.35, 2.75], [s * 0.2, 1.35, 2.78], 0.045, P.armor, { bone: body });
  }
  b.rod([-0.75, 1.1, 2.78], [0.75, 1.1, 2.78], 0.05, P.armor, { bone: body });
  // tow hook
  b.part(new THREE.TorusGeometry(0.07, 0.02, 5, 8), P.trim, { bone: body, at: [0, 0.65, 2.78] });

  // ---------- bed walls ----------
  for (const s of [1, -1]) {
    box(0.1, 0.5, 1.8, hullPaint, [s * 1.05, 1.34, -1.8]);
    box(0.16, 0.06, 1.85, P.trim, [s * 1.05, 1.62, -1.8]);
    for (let i = 0; i < 5; i++) box(0.04, 0.46, 0.06, P.hullDark, [s * 1.12, 1.34, -2.5 + i * 0.4]);
    glow(box(0.04, 0.03, 1.6, P.neonCyan, [s * 1.0, 1.56, -1.8]), 1.4);
    b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
      bone: body, at: [s * 1.111, 1.36, -1.3], dir: [s, 0, 0], axis: "z", texture: glyph,
    });
  }
  // front bed bulkhead low
  box(2.0, 0.3, 0.1, armorPaint, [0, 1.25, -0.95]);

  // ---------- tailgate ----------
  box(2.1, 0.55, 0.1, hullPaint, [0, 1.3, -2.65]);
  for (let i = 0; i < 5; i++) box(2.0, 0.04, 0.04, P.hullDark, [0, 1.12 + i * 0.1, -2.72]);
  box(2.15, 0.06, 0.14, P.trim, [0, 1.6, -2.65]);
  b.part(new THREE.PlaneGeometry(0.8, 0.3), "#ffffff", {
    bone: body, at: [0, 1.3, -2.71], dir: [0, 0, -1], axis: "z", texture: serial,
  });

  // ---------- rear bumper ----------
  box(2.2, 0.28, 0.25, wornDark, [0, 0.82, -2.62]);
  b.part(new THREE.PlaneGeometry(2.0, 0.12), "#ffffff", {
    bone: body, at: [0, 0.82, -2.755], dir: [0, 0, -1], axis: "z", texture: hazard,
  });
  // tail lights
  for (const s of [1, -1]) {
    glow(box(0.3, 0.2, 0.06, P.tailRed, [s * 0.95, 1.2, -2.72]), 2);
    box(0.36, 0.26, 0.04, P.metalDark, [s * 0.95, 1.2, -2.69]);
    glow(box(0.2, 0.04, 0.05, P.neonMagenta, [s * 0.95, 0.9, -2.76]), 1.5);
  }

  // ---------- side details: door seam steps, fuel cap ----------
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 6), P.trim, {
    bone: body, at: [1.12, 1.2, -0.95], dir: [1, 0, 0],
  });
  // exposed frame rails under
  for (const s of [1, -1]) box(0.12, 0.14, 4.9, P.metalDark, [s * 0.7, 0.5, 0]);
  // axle housings
  box(1.6, 0.12, 0.2, P.metalDark, [0, 0.58, M.frontAxle[2]]);
  box(1.6, 0.12, 0.2, P.metalDark, [0, 0.58, M.rearAxle[2]]);
}
    return buildChassis;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P, M }: Ctx) {
  const body = J.body;
  const G = 0.95; // cab floor y
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (geo: THREE.BufferGeometry, color: any, at: [number, number, number], extra: any = {}) =>
    b.part(geo, color, { bone: body, at, flat: true, ...extra });

  // Paints
  const HULL = paint((p, n) => {
    const base = mix(P.hull, P.armor, noise(p, 0.35, 3) * 0.7);
    const wear = smoothstep(0.62, 0.8, noise(p, 0.09, 8));
    const c = mix(base, P.rust, wear * 0.45);
    const seam = Math.abs(((p.y * 8) % 1) - 0.5) > 0.47 ? 0.6 : 1;
    const top = 0.85 + 0.15 * Math.max(n.y, 0);
    return mix(c, "#000000", 1 - seam * top);
  });
  const ARMOR = countershade(P.armor, P.hullDark, { level: 0.1 });
  const HAZ = stripes(P.trim, P.metalDark, { size: 0.12, axis: [1, 1, 0], width: 0.5, wobble: 0 });
  const RUSTY = mottle(P.hullDark, P.rust, { size: 0.2, seed: 4, contrast: 0.8 });

  // Textures
  const HUD = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#14384a"/>
    <g stroke="#2ff3ff" stroke-width="1" fill="none" opacity="0.55">
    <path d="M4 8h18l4 4h14"/><path d="M6 30h12M10 34h20"/><circle cx="48" cy="26" r="8"/><path d="M48 18v16M40 26h16"/>
    <path d="M30 20l4-4 4 4-4 4z"/></g>
    <path d="M0 0L64 40" stroke="#ffffff" stroke-opacity="0.08" stroke-width="6"/></svg>`,
    { size: 128 },
  );
  const SIGN = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" rx="3" fill="#1a0a1a" stroke="#ff2fb4" stroke-width="2"/>
    <text x="32" y="22" text-anchor="middle" font-size="18" font-family="sans-serif" fill="#ff2fb4">電脳 R9</text></svg>`,
    { size: 128 },
  );
  const NUM = svg(
    `<svg viewBox="0 0 48 24"><text x="24" y="19" text-anchor="middle" font-size="18" font-weight="bold" font-family="monospace" fill="#e7b814">HT-07</text></svg>`,
    { size: 96 },
  );

  // Lower cab body (belt line) y 0.95..1.45
  put(box(2.1, 0.5, 1.9), HULL, [0, 1.2, 0.05]);
  // Door armor plates and hazard stripes
  for (const s of [1, -1]) {
    put(box(0.05, 0.42, 1.5), ARMOR, [s * 1.07, 1.2, 0.0]);
    put(box(0.03, 0.08, 1.5), HAZ, [s * 1.1, 1.08, 0.0]);
    put(box(0.03, 0.03, 0.02), P.metalDark, [s * 1.1, 1.3, 0.35]);
    // door seam
    put(box(0.03, 0.46, 0.025), P.metalDark, [s * 1.09, 1.2, -0.35]);
    put(box(0.04, 0.05, 0.16), P.metalDark, [s * 1.12, 1.33, 0.2]); // handle
    put(box(0.04, 0.05, 0.16), P.metalDark, [s * 1.12, 1.33, -0.55]);
    // serial number decal
    const d = b.part(new THREE.PlaneGeometry(0.4, 0.2), "#ffffff", {
      bone: body, at: [s * 1.115, 1.16, 0.55], dir: [s, 0, 0], axis: "z", texture: NUM,
    });
    glow(d, 0.6);
  }

  // Pillars (sloped A pillars, C pillars)
  const WTOP = 1.85;
  for (const s of [1, -1]) {
    b.rod([s * 1.0, 1.45, 0.62], [s * 0.95, WTOP, 0.28], 0.05, ARMOR, { bone: body, sides: 4 } as any);
    b.rod([s * 1.0, 1.45, -0.75], [s * 0.95, WTOP, -0.7], 0.06, ARMOR, { bone: body, sides: 4 } as any);
    b.rod([s * 1.0, 1.45, -0.1], [s * 0.97, WTOP, -0.1], 0.04, ARMOR, { bone: body, sides: 4 } as any);
    // side glass
    put(box(0.04, 0.34, 0.7), P.glass, [s * 0.97, 1.65, 0.3]);
    put(box(0.04, 0.34, 0.5), P.glass, [s * 0.97, 1.65, -0.42]);
    // armor slats over windows
    for (let i = 0; i < 3; i++) put(box(0.05, 0.035, 1.5), ARMOR, [s * 1.0, 1.52 + i * 0.12, -0.05]);
    // mirrors
    b.rod([s * 1.05, 1.5, 0.55], [s * 1.28, 1.55, 0.62], 0.02, P.metalDark, { bone: body } as any);
    put(box(0.06, 0.16, 0.2), HULL, [s * 1.3, 1.56, 0.64]);
    put(box(0.01, 0.12, 0.16), P.neonCyan, [s * 1.335, 1.56, 0.64], {});
  }

  // Windshield (sloped) and rear window
  const ws = put(new THREE.PlaneGeometry(1.9, 0.5), "#ffffff", [0, 1.65, 0.45], {
    texture: HUD, dir: [0, 0.55, 0.83], axis: "z", flat: false,
  });
  glow(ws, 0.35);
  put(new THREE.PlaneGeometry(1.9, 0.5), "#ffffff", [0, 1.65, 0.43], { dir: [0, -0.55, -0.83], axis: "z", color: P.glass, flat: false });
  const rw = put(new THREE.PlaneGeometry(1.7, 0.36), "#ffffff", [0, 1.65, -0.78], {
    texture: HUD, dir: [0, 0.2, -1], axis: "z", flat: false,
  });
  glow(rw, 0.25);
  // windshield frame
  b.rod([-1.0, 1.42, 0.62], [1.0, 1.42, 0.62], 0.045, ARMOR, { bone: body } as any);
  b.rod([-0.95, WTOP, 0.28], [0.95, WTOP, 0.28], 0.05, ARMOR, { bone: body } as any);
  b.rod([-1.0, 1.45, -0.78], [1.0, 1.45, -0.78], 0.05, ARMOR, { bone: body } as any);
  // Cowl / dash top
  put(box(2.0, 0.1, 0.4), HULL, [0, 1.45, 0.78]);

  // Roof plate
  put(box(2.0, 0.07, 1.1), RUSTY, [0, 1.9, -0.2]);
  put(box(1.9, 0.05, 0.1), ARMOR, [0, 1.93, 0.33]);
  // roll cage
  for (const s of [1, -1]) {
    b.rod([s * 0.9, 1.93, 0.3], [s * 0.9, 2.05, 0.0], 0.03, P.trim, { bone: body } as any);
    b.rod([s * 0.9, 2.05, 0.0], [s * 0.9, 1.93, -0.7], 0.03, P.trim, { bone: body } as any);
  }
  b.rod([-0.9, 2.05, 0.0], [0.9, 2.05, 0.0], 0.03, P.trim, { bone: body } as any);
  b.rod([-0.9, 1.97, -0.5], [0.9, 1.97, -0.5], 0.03, P.trim, { bone: body } as any);
  b.rod([-0.9, 2.05, 0.0], [0.9, 1.97, -0.5], 0.02, P.metalDark, { bone: body } as any);
  b.rod([0.9, 2.05, 0.0], [-0.9, 1.97, -0.5], 0.02, P.metalDark, { bone: body } as any);

  // Light bar
  put(box(1.7, 0.1, 0.12), P.metalDark, [0, 2.0, 0.33]);
  const segs = 8;
  for (let i = 0; i < segs; i++) {
    const x = -0.78 + (i * 1.56) / (segs - 1);
    glow(put(box(0.17, 0.07, 0.04), i % 3 === 1 ? P.neonCyan : P.lampWarm, [x, 2.0, 0.4]), 1.5);
  }

  // Antenna
  b.rod([-0.8, 1.93, -0.6], [-0.85, 2.05, -0.62], 0.02, P.metalDark, { bone: body } as any);
  b.spike([-0.8, 1.95, -0.6], [-0.86, 1.0, 0.02] as any, 0, 0.012, { bone: body } as any);
  b.rod([-0.8, 1.95, -0.6], [-0.84, 2.0, -0.6], 0.015, P.metalDark, { bone: body } as any);
  put(new THREE.SphereGeometry(0.03, 6, 4), P.neonMagenta, [-0.86, 2.03, -0.62]);

  // Sign decal on roof front-ish
  const sign = b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
    bone: body, at: [0.55, 2.12, -0.05], dir: [0, 0.3, 1], axis: "z", texture: SIGN,
  });
  glow(sign, 1);
  put(box(0.52, 0.27, 0.03), P.metalDark, [0.55, 2.11, -0.07], { dir: [0, 0.3, 1], axis: "z" });
  b.rod([0.4, 1.95, -0.05], [0.4, 2.05, -0.07], 0.015, P.metalDark, { bone: body } as any);
  b.rod([0.7, 1.95, -0.05], [0.7, 2.05, -0.07], 0.015, P.metalDark, { bone: body } as any);

  // Interior: floor, dash, seats
  put(box(1.9, 0.05, 1.7), P.metalDark, [0, 1.0, 0.05]);
  put(box(1.8, 0.2, 0.3), P.hullDark, [0, 1.35, 0.6]);
  glow(put(box(0.4, 0.12, 0.02), P.neonCyan, [0.35, 1.4, 0.45]), 0.8);
  glow(put(box(0.2, 0.08, 0.02), P.neonMagenta, [-0.4, 1.4, 0.45]), 0.8);
  // steering wheel
  put(new THREE.TorusGeometry(0.1, 0.015, 4, 8), P.rubber, [0.45, 1.4, 0.25], { dir: [0, 0.6, 1], axis: "z" });
  for (const s of [0.45, -0.45]) {
    put(box(0.5, 0.12, 0.5), P.rubber, [s, 1.1, -0.25]);
    put(box(0.5, 0.5, 0.1), P.rubber, [s, 1.4, -0.52], { rotation: [-10, 0, 0] });
    put(box(0.3, 0.14, 0.08), P.hullDark, [s, 1.7, -0.56]);
  }
  put(box(0.15, 0.2, 0.4), P.metalDark, [0, 1.1, -0.1]);

  // rear cab wall back plate (bed side) and lower trim
  put(box(2.1, 0.12, 0.06), HAZ, [0, 1.12, -0.93]);
  put(box(2.0, 0.15, 0.05), P.metalDark, [0, 1.52, 0.7]);
  // cyan accent strip along belt
  for (const s of [1, -1]) glow(put(box(0.02, 0.02, 1.7), P.neonCyan, [s * 1.095, 1.42, 0.0]), 1.2);
  // roof corner armor
  for (const s of [1, -1]) put(box(0.12, 0.08, 0.2), P.trim, [s * 1.0, 1.93, -0.72]);
}
    return buildCab;
  })(),
  // thrusters
  (() => {
function buildThrusters({ b, J, P, M }: Ctx) {
  const shellPaint = paint((p, n) => {
    const k = 0.75 + 0.25 * Math.max(n.y, 0);
    const wear = ((Math.sin(p.y * 40 + p.x * 7) + 1) * 0.5) * 0.08;
    return [0.08 * k + wear, 0.09 * k + wear, 0.11 * k + wear];
  });
  const R = rng(11);
  const glowTex = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#2ff3ff" stroke-width="5"/>
     <circle cx="50" cy="50" r="34" fill="none" stroke="#9ff8ff" stroke-width="4"/>
     <circle cx="50" cy="50" r="22" fill="none" stroke="#ff2fb4" stroke-width="4"/>
     <circle cx="50" cy="50" r="10" fill="#9ff8ff"/></svg>`,
    { size: 128 },
  );
  const R_OUT = 0.46;

  const pod = (joint: any, cx: number, cz: number, tag: string) => {
    const base = new THREE.Vector3(cx, 0.0, cz);
    const at = (y: number, dx = 0, dz = 0): [number, number, number] => [cx + dx, y, cz + dz];
    const o = { bone: joint, group: "thrusters" };
    // duct shell
    b.lathe(
      [[0.33, 0], [R_OUT, 0.03], [R_OUT, 0.72], [0.4, 0.76], [0.34, 0.7]],
      { at: at(0), segments: 8, color: shellPaint, name: `duct${tag}`, ...o },
    );
    // hazard ring
    b.lathe(
      [[0.455, 0.46], [0.49, 0.47], [0.49, 0.58], [0.455, 0.59]],
      { at: at(0), segments: 8, color: P.trim, name: `haz${tag}`, ...o },
    );
    b.lathe(
      [[0.4, 0.74], [0.44, 0.74], [0.44, 0.1], [0.4, 0.1]].slice(0, 2).concat([[0.44, 0.78], [0.4, 0.78]] as any),
      { at: at(0), segments: 8, color: P.trim, name: `lip${tag}`, ...o },
    ).mesh.visible = true;
    // magenta rim ring at bottom
    glow(
      b.lathe([[0.3, 0.1], [0.35, 0.1], [0.35, 0.14], [0.3, 0.14]], {
        at: at(0), segments: 8, color: P.neonMagenta, name: `rim${tag}`, ...o,
      }),
      1.4,
    );
    // core disc
    glow(
      b.part(new THREE.CylinderGeometry(0.29, 0.29, 0.04, 8), P.thrusterCore, {
        at: at(0.1), name: `core${tag}`, ...o,
      }),
      1.8,
    );
    // inner cone glow
    glow(
      b.part(new THREE.ConeGeometry(0.2, 0.22, 8), P.neonCyan, { at: at(0.23), name: `cone${tag}`, ...o }),
      1.3,
    );
    // fan hub and blades
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 8), P.metalDark, { at: at(0.4), name: `hub${tag}`, ...o });
    const phase = R() * 0.5;
    for (let i = 0; i < 6; i++) {
      const a = phase + (i * Math.PI) / 3;
      const c = Math.cos(a), s = Math.sin(a);
      b.extrude(
        [[0.05, -0.035], [0.3, -0.07], [0.33, 0.04], [0.05, 0.035]],
        {
          at: at(0.4, 0, 0),
          x: [c, 0, s],
          y: [-s, 0, c],
          thickness: 0.015,
          color: P.armor,
          name: `blade${tag}${i}`,
          ...o,
        },
      );
    }
    // exhaust fins on shell
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      const c = Math.cos(a), s = Math.sin(a);
      b.extrude(
        [[0, 0], [0.12, 0], [0.02, 0.3]],
        {
          at: at(0.1, c * (R_OUT - 0.01), s * (R_OUT - 0.01)),
          x: [c, 0, s],
          y: [0, 1, 0],
          thickness: 0.025,
          color: P.hullDark,
          name: `fin${tag}${i}`,
          ...o,
        },
      );
    }
    // struts up to chassis arch (y=0.85), inward
    const sx = Math.sign(cx);
    for (const dz of [-0.3, 0.3]) {
      b.rod(at(0.62, -sx * 0.36, dz), at(0.88, -sx * 0.72, dz * 0.6), 0.03, P.armor, { name: `strut${tag}`, ...o });
    }
    b.part(new THREE.BoxGeometry(0.14, 0.05, 0.7), P.metalDark, {
      at: at(0.86, -sx * 0.72, 0), name: `plate${tag}`, ...o,
    });
    b.part(new THREE.BoxGeometry(0.1, 0.12, 0.16), P.trim, {
      at: at(0.7, -sx * 0.45, 0), name: `clamp${tag}`, ...o,
    });
    // glow card on floor
    glow(
      b.part(new THREE.PlaneGeometry(1.0, 1.0), "#ffffff", {
        at: at(0.004), dir: [0, 1, 0], axis: "z", texture: glowTex, name: `floorglow${tag}`, ...o,
      }),
      1.2,
    );
    void base;
  };

  pod(J.thrusterFL, M.thrusterFL[0], M.thrusterFL[2], "FL");
  pod(J.thrusterFR, M.thrusterFR[0], M.thrusterFR[2], "FR");
  pod(J.thrusterRL, M.thrusterRL[0], M.thrusterRL[2], "RL");
  pod(J.thrusterRR, M.thrusterRR[0], M.thrusterRR[2], "RR");

  // tail thruster, axis pointing back (-Z)
  const [tx, ty, tz] = M.bumperRear;
  const back: [number, number, number] = [0, 0, -1];
  const o = { bone: J.body, group: "thrusters" };
  const tAt = (d: number): [number, number, number] => [tx, ty - 0.02, tz + 0.12 - d];
  b.lathe(
    [[0.17, 0], [0.26, 0.02], [0.26, 0.4], [0.2, 0.44], [0.17, 0.38]],
    { at: tAt(0), axis: back, segments: 8, color: shellPaint, name: "tailDuct", ...o },
  );
  b.lathe(
    [[0.255, 0.25], [0.285, 0.26], [0.285, 0.33], [0.255, 0.34]],
    { at: tAt(0), axis: back, segments: 8, color: P.trim, name: "tailHaz", ...o },
  );
  glow(
    b.lathe([[0.15, 0.36], [0.19, 0.36], [0.19, 0.39], [0.15, 0.39]], {
      at: tAt(0), axis: back, segments: 8, color: P.neonMagenta, name: "tailRim", ...o,
    }),
    1.4,
  );
  glow(
    b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 8), P.thrusterCore, {
      at: tAt(0.34), dir: back, name: "tailCore", ...o,
    }),
    1.8,
  );
  glow(
    b.part(new THREE.ConeGeometry(0.12, 0.3, 8), P.neonCyan, {
      at: tAt(0.2), dir: [0, 0, 1], name: "tailCone", ...o,
    }),
    1.3,
  );
  for (const s of [1, -1])
    b.rod([tx + s * 0.2, ty + 0.08, tz + 0.2], [tx + s * 0.45, ty + 0.2, tz + 0.5], 0.025, P.armor, {
      name: "tailStrut", ...o,
    });
}
    return buildThrusters;
  })(),
  // bedGun
  (() => {
function buildBedGun({ b, J, P }: Ctx) {
  const FLOOR = 0.95;

  // ---------- paints & textures ----------
  const floorPaint = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.22, rivets: 0.04 });
  const hazard = stripes(P.trim, P.hullDark, { size: 0.07, axis: [1, 0, 1], width: 0.5, wobble: 0.05 });
  const crateCoat = paint((p, n) => {
    const base = mottle(P.crate, "#323c26", { size: 0.12, seed: 4 }).at(p, n);
    const worn = n.y > 0.5 ? 0.25 : 0;
    return mix(base as any, "#8a8f6a", worn) as any;
  });
  const drumPaint = paint((p, n) => {
    const m = mottle(P.rust, "#4a2a18", { size: 0.08, seed: 9 }).at(p, n);
    return mix(m as any, "#222", Math.max(0, 0.3 - n.y) * 0.4) as any;
  });
  const gunPaint = panelled(metal("blued", { tarnish: 0.4 }), { size: 0.16, rivets: 0.035 });
  const armorPaint = panelled(P.armor, { size: 0.15, rivets: 0.03 });

  const STENCIL = svg(
    `<svg viewBox="0 0 80 50"><rect x="2" y="2" width="76" height="46" rx="3" fill="none" stroke="#e8e2b8" stroke-width="3" stroke-dasharray="10 3"/>
    <text x="40" y="24" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#e8e2b8">AMMO</text>
    <text x="40" y="41" text-anchor="middle" font-family="monospace" font-size="10" fill="#e7b814">弾薬 7-C</text></svg>`,
    { size: 160 },
  );
  const SERIAL = svg(
    `<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#14161c"/><rect x="3" y="3" width="54" height="34" fill="none" stroke="#e7b814" stroke-width="2"/>
    <text x="30" y="19" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11" fill="#e7b814">FUEL</text>
    <text x="30" y="32" text-anchor="middle" font-family="monospace" font-size="9" fill="#2ff3ff">燃料</text></svg>`,
    { size: 128 },
  );
  const HOLO = svg(
    `<svg viewBox="0 0 90 60"><rect width="90" height="60" fill="#06222c"/><rect x="2" y="2" width="86" height="56" fill="none" stroke="#2ff3ff" stroke-width="2"/>
    <circle cx="30" cy="32" r="16" fill="none" stroke="#2ff3ff" stroke-width="2"/><circle cx="30" cy="32" r="8" fill="none" stroke="#ff2fb4" stroke-width="2"/>
    <path d="M30 14V50M12 32H48" stroke="#2ff3ff" stroke-width="1.5"/><circle cx="36" cy="26" r="2.5" fill="#ff2fb4"/>
    <path d="M58 14H84M58 22H78M58 30H84M58 38H72" stroke="#2ff3ff" stroke-width="2.5"/>
    <text x="58" y="53" font-family="monospace" font-size="9" fill="#9ff8ff">ARM 98%</text></svg>`,
    { size: 192 },
  );

  // ---------- helpers ----------
  const box = (at: number[], s: number[], col: any, bone: any = J.body, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), col, { bone, at, ...extra });
  const cyl = (at: number[], r0: number, r1: number, h: number, sides: number, col: any, bone: any = J.body, dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(r1, r0, h, sides), col, { bone, at, ...(dir ? { dir } : {}) });
  const rod = (a: number[], c: number[], r: number, col: any, bone: any = J.body) =>
    b.rod(a, c, r, col, { bone, sides: 6 });
  const decal = (tex: THREE.Texture, at: number[], dir: number[], w: number, h: number, bone: any = J.body) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });

  // ---------- bed floor ----------
  box([0, FLOOR + 0.03, -1.75], [1.8, 0.06, 1.7], floorPaint);
  for (let i = 0; i < 9; i++) {
    const z = -2.5 + i * 0.19;
    box([0, FLOOR + 0.07, z], [1.7, 0.025, 0.05], P.hullDark);
  }
  // hazard edge strips
  box([0, FLOOR + 0.065, -2.56], [1.7, 0.02, 0.07], hazard);
  box([0, FLOOR + 0.065, -0.95], [1.7, 0.02, 0.06], hazard);
  // floor hatch
  box([0.45, FLOOR + 0.07, -1.0 - 0.0], [0.01, 0.01, 0.01], P.metalDark);
  // neon strip lights along rails & tailgate
  for (const s of [1, -1]) {
    glow(box([s * 0.87, FLOOR + 0.1, -1.75], [0.025, 0.025, 1.6], P.neonCyan), 1.4);
    box([s * 0.89, FLOOR + 0.1, -1.75], [0.03, 0.05, 1.64], P.metalDark);
  }
  glow(box([0, FLOOR + 0.1, -2.53], [1.7, 0.025, 0.025], P.neonCyan), 1.4);

  // ---------- roll bar ----------
  const RZ = -0.97;
  for (const s of [1, -1]) {
    rod([s * 0.86, FLOOR + 0.05, RZ], [s * 0.86, 2.2, RZ], 0.04, P.hullDark);
    rod([s * 0.86, 2.2, RZ], [s * 0.86, 2.2, -0.9], 0.035, P.hullDark);
    rod([s * 0.86, 1.1, RZ - 0.45], [s * 0.86, 2.1, RZ], 0.03, P.armor);
    box([s * 0.86, FLOOR + 0.1, RZ], [0.16, 0.06, 0.16], P.trim);
    box([s * 0.86, 1.05, RZ - 0.23], [0.12, 0.04, 0.12], P.metalDark);
  }
  rod([0.86, 2.2, RZ], [-0.86, 2.2, RZ], 0.04, P.hullDark);
  rod([0.86, 1.6, RZ], [-0.86, 1.6, RZ], 0.03, P.hullDark);
  rod([0.86, 1.6, RZ], [-0.86, 2.2, RZ], 0.022, P.armor);
  rod([-0.86, 1.6, RZ], [0.86, 2.2, RZ], 0.022, P.armor);
  // hazard wrap on top bar
  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.4, 6), hazard, { bone: J.body, at: [0.4, 2.2, RZ], dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.4, 6), hazard, { bone: J.body, at: [-0.4, 2.2, RZ], dir: [1, 0, 0] });

  // ---------- ammo crates ----------
  const crate = (x: number, y: number, z: number, sx: number, sy: number, sz: number, s: number) => {
    box([x, y, z], [sx, sy, sz], crateCoat);
    box([x, y + sy / 2 + 0.01, z], [sx + 0.02, 0.02, sz * 0.4], P.metalDark);
    for (const dz of [-0.28, 0.28]) {
      box([x, y, z + dz * sz * 1.4], [sx + 0.025, sy + 0.025, 0.06], P.trim);
      box([x, y + sy / 2 + 0.015, z + dz * sz * 1.4], [0.04, 0.012, 0.075], P.metalDark);
    }
    // handles
    box([x + s * (sx / 2 + 0.02), y + 0.05, z], [0.03, 0.04, 0.16], P.metalDark);
    decal(STENCIL, [x + s * (sx / 2 + 0.012), y - 0.02, z], [s, 0, 0], sz * 0.7, sy * 0.5);
    decal(STENCIL, [x, y - 0.02, z + sz / 2 + 0.012], [0, 0, 1], sx * 0.8, sy * 0.5);
  };
  crate(0.62, FLOOR + 0.28, -1.2, 0.5, 0.45, 0.5, 1);
  crate(-0.62, FLOOR + 0.28, -1.2, 0.5, 0.45, 0.5, -1);
  crate(0.64, FLOOR + 0.64, -1.18, 0.36, 0.27, 0.36, 1);
  crate(-0.62, FLOOR + 0.2, -1.72, 0.3, 0.3, 0.4, -1);

  // ---------- fuel drums ----------
  const drum = (x: number, z: number, s: number) => {
    const y = FLOOR + 0.31;
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8), drumPaint, { bone: J.body, at: [x, y, z] });
    for (const dy of [-0.15, 0.15]) cyl([x, y + dy, z], 0.212, 0.212, 0.04, 8, P.metalDark);
    cyl([x, y + 0.26, z], 0.19, 0.19, 0.03, 8, P.hullDark);
    cyl([x + 0.07, y + 0.285, z + 0.05], 0.04, 0.04, 0.03, 6, P.trim);
    cyl([x - 0.07, y + 0.285, z - 0.05], 0.03, 0.03, 0.025, 6, P.neonMagenta);
    b.part(new THREE.CylinderGeometry(0.202, 0.202, 0.1, 8), hazard, { bone: J.body, at: [x, y - 0.02, z] });
    decal(SERIAL, [x, y + 0.02, z - 0.0 + (s > 0 ? 0 : 0) - 0.0 + 0.0], [0, 0, 1], 0.001, 0.001); // placeholder removed below
  };
  // drums (label decals placed facing the gun side)
  for (const s of [1, -1]) {
    const x = s * 0.64, z = -2.3, y = FLOOR + 0.31;
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8), drumPaint, { bone: J.body, at: [x, y, z] });
    for (const dy of [-0.16, 0.16]) cyl([x, y + dy, z], 0.212, 0.212, 0.04, 8, P.metalDark);
    cyl([x, y + 0.26, z], 0.19, 0.19, 0.03, 8, P.hullDark);
    cyl([x + 0.07, y + 0.285, z + 0.05], 0.04, 0.04, 0.03, 6, P.trim);
    cyl([x - 0.07, y + 0.285, z - 0.05], 0.03, 0.03, 0.025, 6, P.neonMagenta);
    b.part(new THREE.CylinderGeometry(0.204, 0.204, 0.08, 8), hazard, { bone: J.body, at: [x, y - 0.02, z] });
    decal(SERIAL, [x - s * 0.21, y + 0.06, z + 0.0], [-s, 0, 0], 0.22, 0.15);
    // spout hose
    rod([x, y + 0.29, z], [x, y + 0.36, z - 0.05], 0.015, P.rubber);
  }

  // ---------- cable coil ----------
  const coil = spiral([0, FLOOR + 0.08, -2.3], [0.15, FLOOR + 0.08, -2.3], [0, 1, 0], { turns: 3, r1: 0.1, pitch: 0.035 });
  b.sweep(coil, 0.018, { bone: J.body, color: P.rubber, sides: 6 } as any);
  b.sweep(
    catmull([[0.12, FLOOR + 0.1, -2.3], [0.2, FLOOR + 0.07, -2.0], [0.12, FLOOR + 0.07, -1.8], [0.05, FLOOR + 0.08, -1.7]]),
    0.016,
    { bone: J.body, color: P.rubber, sides: 6 } as any,
  );
  b.sweep(
    catmull([[-0.12, FLOOR + 0.12, -2.3], [-0.25, FLOOR + 0.07, -2.0], [-0.3, FLOOR + 0.08, -1.7], [-0.1, FLOOR + 0.1, -1.62]]),
    0.014,
    { bone: J.body, color: P.neonMagenta, sides: 6 } as any,
  );

  // ---------- gun mount (yaw) ----------
  const GX = 0, GZ = -1.6;
  box([GX, FLOOR + 0.08, GZ], [0.56, 0.05, 0.56], armorPaint);
  for (const sx of [1, -1]) for (const sz of [1, -1]) cyl([sx * 0.23, FLOOR + 0.12, GZ + sz * 0.23], 0.03, 0.03, 0.04, 6, P.trim);
  cyl([GX, 1.2, GZ], 0.13, 0.1, 0.4, 8, gunPaint);
  cyl([GX, 1.01, GZ], 0.18, 0.13, 0.08, 8, P.hullDark);
  // ring base on yaw
  cyl([GX, 1.4, GZ], 0.3, 0.3, 0.06, 12, P.armor, J.gunYaw);
  cyl([GX, 1.44, GZ], 0.26, 0.26, 0.03, 12, P.hullDark, J.gunYaw);
  glow(cyl([GX, 1.375, GZ], 0.305, 0.305, 0.012, 12, P.neonCyan, J.gunYaw), 1.4);
  cyl([GX, 1.5, GZ], 0.16, 0.2, 0.12, 8, gunPaint, J.gunYaw);
  // yoke
  for (const s of [1, -1]) {
    box([s * 0.19, 1.58, GZ], [0.05, 0.3, 0.3], gunPaint, J.gunYaw);
    box([s * 0.19, 1.74, GZ], [0.06, 0.04, 0.2], P.trim, J.gunYaw);
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 8), P.metalDark, { bone: J.gunYaw, at: [s * 0.22, 1.6, GZ], dir: [1, 0, 0] });
  }
  // shield plate (rear, magenta slit)
  const shield = b.extrude(
    [[-0.34, 0], [0.34, 0], [0.3, 0.38], [0.14, 0.46], [-0.14, 0.46], [-0.3, 0.38]],
    { at: [GX, 1.42, GZ - 0.3], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.05, bevel: 0.01, color: armorPaint, bone: J.gunYaw },
  );
  void shield;
  glow(box([GX, 1.78, GZ - 0.33], [0.22, 0.03, 0.012], P.neonMagenta, J.gunYaw), 1.8);
  box([GX, 1.78, GZ - 0.3], [0.3, 0.07, 0.07], P.metalDark, J.gunYaw);
  box([GX, 1.5, GZ - 0.335], [0.5, 0.05, 0.01], hazard, J.gunYaw);

  // ---------- gun (pitch) ----------
  const GP = J.gunPitch;
  box([GX, 1.6, GZ + 0.0], [0.24, 0.26, 0.52], gunPaint, GP);
  box([GX, 1.6, GZ + 0.28], [0.18, 0.2, 0.06], P.metalDark, GP);
  box([GX, 1.74, GZ - 0.05], [0.16, 0.03, 0.34], P.armor, GP);
  // cyan energy cell
  glow(b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 8), P.neonCyan, { bone: GP, at: [GX, 1.77, GZ + 0.08], dir: [0, 0, 1] }), 1.8);
  for (const dz of [-0.04, 0.2]) box([GX, 1.77, GZ + dz], [0.15, 0.1, 0.03], P.metalDark, GP);
  // barrel + shroud + brake
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), P.metalDark, { bone: GP, at: [GX, 1.6, GZ - 0.62], dir: [0, 0, -1] });
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.42, 8), gunPaint, { bone: GP, at: [GX, 1.6, GZ - 0.5], dir: [0, 0, -1] });
  for (let i = 0; i < 5; i++)
    glow(b.part(new THREE.CylinderGeometry(0.078, 0.078, 0.012, 8), P.neonCyan, { bone: GP, at: [GX, 1.6, GZ - 0.35 - i * 0.07], dir: [0, 0, -1] }), 1.3);
  box([GX, 1.6, GZ - 0.99], [0.12, 0.1, 0.12], P.hullDark, GP);
  for (const s of [1, -1]) box([GX + s * 0.065, 1.6, GZ - 0.99], [0.015, 0.09, 0.1], P.metalDark, GP);
  b.part(new THREE.CylinderGeometry(0.02, 0.025, 0.1, 6), P.trim, { bone: GP, at: [GX, 1.67, GZ - 0.8], dir: [0, 0, -1] });
  // magazine + ammo belt
  box([0.24, 1.55, GZ + 0.05], [0.16, 0.22, 0.26], P.trim, GP);
  box([0.24, 1.55, GZ + 0.05], [0.17, 0.12, 0.2], P.hullDark, GP);
  box([0.24, 1.46, GZ + 0.05], [0.12, 0.02, 0.22], P.metalDark, GP);
  const belt = catmull([[0.24, 1.66, GZ + 0.05], [0.26, 1.78, GZ + 0.0], [0.16, 1.76, GZ - 0.04], [0.1, 1.62, GZ - 0.03]]);
  b.along(belt, 9, (at: any) => {
    b.part(new THREE.BoxGeometry(0.035, 0.035, 0.05), P.trim, { bone: GP, at: at.at });
    b.part(new THREE.SphereGeometry(0.018, 5, 4), "#c9a24a", { bone: GP, at: at.at });
  });
  // sight + holo screen on arm
  rod([-0.12, 1.74, GZ + 0.1], [-0.24, 1.92, GZ + 0.2], 0.012, P.metalDark, GP);
  box([-0.28, 1.95, GZ + 0.23], [0.3, 0.22, 0.02], P.metalDark, GP);
  glow(decal(HOLO, [-0.28, 1.95, GZ + 0.242], [0, 0, 1], 0.27, 0.18, GP), 1.3);
  // grips
  for (const s of [1, -1]) rod([s * 0.1, 1.56, GZ + 0.25], [s * 0.12, 1.66, GZ + 0.4], 0.016, P.rubber, GP);
  rod([-0.12, 1.66, GZ + 0.4], [0.12, 1.66, GZ + 0.4], 0.016, P.rubber, GP);
  glow(box([0, 1.5, GZ + 0.27], [0.1, 0.03, 0.01], P.neonMagenta, GP), 1.5);
  box([0, 1.45, GZ - 0.1], [0.2, 0.05, 0.34], P.hullDark, GP);
}
    return buildBedGun;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,0.95,0], dir: [0,0,1], role: "spine" });
  J["thrusterFL"] = b.joint("thrusterFL", { parent: J["body"], at: [1.05,0.5,1.6], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterFR"] = b.joint("thrusterFR", { parent: J["body"], at: [-1.05,0.5,1.6], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterRL"] = b.joint("thrusterRL", { parent: J["body"], at: [1.05,0.5,-1.5], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterRR"] = b.joint("thrusterRR", { parent: J["body"], at: [-1.05,0.5,-1.5], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["gunYaw"] = b.joint("gunYaw", { parent: J["body"], at: [0,1.35,-1.6], dir: [0,1,0], role: "hinge", group: "gun" });
  J["gunPitch"] = b.joint("gunPitch", { parent: J["gunYaw"], at: [0,1.6,-1.6], dir: [0,0,1], role: "hinge", group: "gun" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
