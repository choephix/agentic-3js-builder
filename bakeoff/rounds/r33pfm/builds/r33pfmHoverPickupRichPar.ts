import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, noise, mix, smoothstep, rng, arc, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled, metal } from "../../../../kits/clockwork";

export const meta = {
  "name": "Hover Technical",
  "description": "A militarized pickup truck converted to ride on four ducted hover thrusters, in low-poly cyberpunk style with neon underglow, armor plating and a rear-mounted gun."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#4a5240",
  hullDark: "#2b3027",
  armor: "#5d6650",
  gunmetal: "#2a2e36",
  steel: "#8a919c",
  trim: "#e7b814",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fa8",
  glass: "#1b2a3a",
  glassGlow: "#3a8fb0",
  rubber: "#15161a",
  lightWhite: "#f4f8ff",
  lightRed: "#ff3030",
  rust: "#7a4a2a",
  warn: "#ff7a1a",
};
const M = {
  hoverLine: [0, 0.45, 0] as [number, number, number],
  hoodTop: [0, 1.3, 1.95] as [number, number, number],
  cabFloor: [0, 0.75, 0.15] as [number, number, number],
  cabRoof: [0, 1.95, 0] as [number, number, number],
  bedFloor: [0, 0.85, -1.8] as [number, number, number],
  gunPintle: [0, 1, -1.6] as [number, number, number],
  thrusterFL: [1.15, 0.38, 1.75] as [number, number, number],
  thrusterFR: [-1.15, 0.38, 1.75] as [number, number, number],
  thrusterRL: [1.15, 0.38, -1.75] as [number, number, number],
  thrusterRR: [-1.15, 0.38, -1.75] as [number, number, number],
  frontBumper: [0, 0.7, 2.7] as [number, number, number],
  rearBumper: [0, 0.7, -2.7] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // frontHull
  (() => {
function buildFrontHull({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);

  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, flat: true, ...extra });

  // ---------- textures ----------
  const SLATS = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#14161b"/>` +
      Array.from({ length: 14 }, (_, i) => `<rect x="${2 + i * 4.4}" y="3" width="2.6" height="26" fill="#2c313a"/><rect x="${2 + i * 4.4}" y="3" width="0.8" height="26" fill="#4a515e"/>`).join("") +
      `<rect x="0" y="0" width="64" height="2" fill="#0a0b0e"/><rect x="0" y="30" width="64" height="2" fill="#0a0b0e"/></svg>`,
    { size: 256 },
  );
  const NUMBER = svg(
    `<svg viewBox="0 0 64 40"><text x="32" y="32" text-anchor="middle" font-family="Impact, sans-serif" font-weight="bold" font-size="34" fill="#e8e4cf" stroke="#2b3027" stroke-width="0.8">07</text><rect x="4" y="2" width="56" height="3" fill="#e8e4cf"/></svg>`,
    { size: 192 },
  );
  const GLYPH = svg(
    `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="#e7b814" stroke-width="2.5"/><path d="M10 14H30M20 8V32M12 26L20 20L28 26" stroke="#e7b814" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const HAZ = svg(
    `<svg viewBox="0 0 32 16"><rect width="32" height="16" fill="#e7b814"/>` +
      Array.from({ length: 6 }, (_, i) => `<path d="M${i * 8 - 4} 16L${i * 8 + 4} 0L${i * 8 + 8} 0L${i * 8} 16Z" fill="#15161a"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );

  // ---------- paints ----------
  const scuff = (base: string, seed: number) =>
    paint((p, n) => {
      let c = mix(base, "#1c2018", 0.35 * (1 - smoothstep(-0.6, 0.6, n.y)));
      c = mix(c, P.steel, 0.55 * smoothstep(0.64, 0.8, noise(p, 0.05, seed)) * (n.y > 0.3 ? 0.4 : 1));
      c = mix(c, P.rust, 0.5 * smoothstep(0.66, 0.85, noise(p, 0.09, seed + 3)));
      return c;
    });
  const HULL = panelled(scuff(P.hull, 3), { size: 0.4, aspect: 0.8, rivets: 0.06, seam: P.hullDark });
  const ARMOR = panelled(scuff(P.armor, 8), { size: 0.3, aspect: 0.8, rivets: 0.05, seam: P.hullDark });
  const hazardPaint = paint((p) => (Math.floor((p.x + p.z) / 0.07) % 2 ? P.trim : P.rubber));

  // ---------- chassis tub (front half, z 0.9..2.7) ----------
  box(2.3, 0.3, 1.8, P.gunmetal, [0, 0.58, 1.8]);
  // neon underglow strips beneath tub
  glow(box(1.9, 0.03, 0.05, P.neonMagenta, [0, 0.42, 2.62]), 1.6);
  for (const s of [1, -1]) glow(box(0.04, 0.03, 1.5, P.neonCyan, [s * 1.0, 0.42, 1.75]), 1.5);

  // ---------- hood: lofted slab sloping to grille ----------
  const hood = b.loft(
    [
      { at: [0, 1.22, 1.0], w: 2.4, h: 0.5 },
      { at: [0, 1.2, 1.7], w: 2.4, h: 0.46 },
      { at: [0, 1.04, 2.4], w: 2.3, h: 0.5 },
      { at: [0, 0.94, 2.66], w: 2.2, h: 0.48 },
    ],
    { bone: body, color: HULL, section: "box", caps: "flat" } as any,
  );
  // hood top panel (slightly sloped) with chamfer plate
  b.part(new THREE.BoxGeometry(1.7, 0.05, 1.5), ARMOR, { bone: body, at: [0, 1.4, 1.8], rotation: [6, 0, 0], flat: true });
  // stencil number
  b.part(new THREE.PlaneGeometry(0.7, 0.44), "#ffffff", { bone: body, at: [-0.4, 1.428, 1.55], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: NUMBER, rotation: undefined } as any);
  // glyph emblem
  b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", { bone: body, at: [0.55, 1.431, 1.6], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: GLYPH } as any);

  // hood scoop with hazard stripes
  b.part(new THREE.BoxGeometry(0.7, 0.16, 0.7), hazardPaint, { bone: body, at: [0, 1.47, 2.15], rotation: [8, 0, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.5, 0.05, 0.08), P.rubber, { bone: body, at: [0, 1.53, 2.42], flat: true });
  for (let i = 0; i < 4; i++) box(0.5, 0.02, 0.03, P.gunmetal, [0, 1.56, 1.95 + i * 0.1]);

  // ---------- fenders / flares over thrusters ----------
  for (const s of [1, -1]) {
    const x = s * 1.15;
    // main fender slab
    box(0.34, 0.5, 1.7, ARMOR, [s * 1.14, 1.05, 1.78]);
    // flare arch over thruster: top lip and outer rim
    box(0.62, 0.1, 1.0, ARMOR, [x, 0.9, 1.75], { rotation: [0, 0, s * -4] });
    box(0.1, 0.38, 1.05, ARMOR, [s * 1.38, 0.78, 1.75]);
    box(0.1, 0.38, 1.05, P.hullDark, [s * 0.9, 0.78, 1.75]);
    box(0.7, 0.08, 0.1, ARMOR, [x, 0.8, 2.3]);
    box(0.7, 0.08, 0.1, ARMOR, [x, 0.8, 1.2]);
    // hazard trim on flare lip
    b.part(new THREE.BoxGeometry(0.12, 0.035, 0.9), hazardPaint, { bone: body, at: [s * 1.38, 0.99, 1.75], flat: true });
    // side warning light
    glow(box(0.04, 0.06, 0.14, P.warn, [s * 1.43, 1.15, 2.55]), 1.3);
    // rivet-row studs along fender
    const studs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 8; i++) studs.push(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 6).rotate(0, 0, Math.PI / 2).translate(s * 1.315, 1.22, 1.15 + i * 0.2));
    // merge manually via parts (few)
    studs.forEach((g, i) => i % 1 === 0 && b.part(g, P.steel, { bone: body, at: [0, 0, 0] }));
    // flare cutout shadow plate (dark interior)
    box(0.5, 0.03, 0.95, P.hullDark, [x, 0.84, 1.75]);
  }

  // ---------- grille ----------
  box(2.25, 0.62, 0.12, P.gunmetal, [0, 0.98, 2.68]);
  b.part(new THREE.PlaneGeometry(1.3, 0.4), "#ffffff", { bone: body, at: [0, 0.92, 2.745], dir: [0, 0, 1], axis: "z", texture: SLATS } as any);
  // cyan slit visor
  glow(box(1.6, 0.06, 0.04, P.neonCyan, [0, 1.2, 2.745]), 1.8);
  box(1.72, 0.03, 0.05, P.rubber, [0, 1.25, 2.74]);
  box(1.72, 0.03, 0.05, P.rubber, [0, 1.15, 2.74]);
  // magenta bumper strip
  box(2.5, 0.2, 0.18, P.gunmetal, [0, 0.68, 2.64]);
  glow(box(2.3, 0.045, 0.04, P.neonMagenta, [0, 0.7, 2.74]), 1.8);
  // bumper side wings
  for (const s of [1, -1]) {
    box(0.22, 0.2, 0.5, P.gunmetal, [s * 1.2, 0.7, 2.45], { rotation: [0, s * 18, 0] });
    b.part(new THREE.BoxGeometry(0.22, 0.04, 0.4), hazardPaint, { bone: body, at: [s * 1.2, 0.81, 2.45], rotation: [0, s * 18, 0], flat: true });
  }

  // ---------- headlights in brow housings ----------
  for (const s of [1, -1]) {
    const x = s * 0.88;
    box(0.5, 0.3, 0.14, P.gunmetal, [x, 1.1, 2.7]);
    glow(box(0.36, 0.17, 0.05, P.lightWhite, [x, 1.08, 2.77]), 2);
    // brow
    box(0.54, 0.07, 0.2, P.armor, [x, 1.28, 2.72], { rotation: [-14, 0, 0] });
    box(0.07, 0.3, 0.18, P.armor, [x + s * 0.27, 1.1, 2.7]);
    box(0.07, 0.3, 0.18, P.armor, [x - s * 0.27, 1.1, 2.7]);
    box(0.5, 0.05, 0.14, P.armor, [x, 0.93, 2.72]);
  }

  // ---------- bull bar tubes ----------
  const bars: [number[], number[]][] = [];
  for (const s of [1, -1]) {
    b.rod([s * 0.95, 0.62, 2.62], [s * 0.7, 1.28, 2.88], 0.045, P.steel, { bone: body, sides: 6 } as any);
    b.rod([s * 0.3, 0.62, 2.7], [s * 0.3, 1.2, 2.9], 0.04, P.steel, { bone: body, sides: 6 } as any);
  }
  b.rod([-0.74, 1.28, 2.88], [0.74, 1.28, 2.88], 0.045, P.steel, { bone: body, sides: 6 } as any);
  b.rod([-1.0, 0.85, 2.78], [1.0, 0.85, 2.78], 0.04, P.steel, { bone: body, sides: 6 } as any);
  for (const s of [1, -1]) b.rod([s * 1.0, 0.85, 2.78], [s * 0.95, 0.65, 2.65], 0.04, P.steel, { bone: body, sides: 6 } as any);

  // ---------- tow hook ----------
  b.sweep(
    [[0.45, 0.58, 2.7], [0.45, 0.58, 2.88], [0.45, 0.46, 2.94], [0.45, 0.4, 2.84]],
    0.028,
    { bone: body, color: P.trim, sides: 6 } as any,
  );
  box(0.14, 0.12, 0.06, P.gunmetal, [0.45, 0.6, 2.72]);

  // ---------- plated front skid ----------
  box(1.7, 0.05, 0.9, P.hullDark, [0, 0.5, 2.3], { rotation: [-6, 0, 0] });
  box(1.4, 0.04, 0.12, P.steel, [0, 0.49, 2.72]);
  for (let i = 0; i < 5; i++) glow(box(0.04, 0.025, 0.7, P.neonCyan, [-0.6 + i * 0.3, 0.465, 2.3]), 1.2);

  // ---------- inner tub walls and cab-meeting firewall ----------
  box(2.4, 0.9, 0.1, P.hullDark, [0, 0.95, 0.95]);
  box(2.2, 0.06, 0.1, P.trim, [0, 1.44, 0.98]);
  // hood side rails with rivets
  for (const s of [1, -1]) {
    box(0.1, 0.12, 1.7, HULL, [s * 0.88, 1.38, 1.8]);
    box(0.06, 0.4, 0.06, P.gunmetal, [s * 0.9, 1.2, 1.0]);
  }
  // hood vents
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) box(0.3, 0.02, 0.04, P.rubber, [s * 0.62, 1.425, 1.25 + i * 0.1]);
}
    return buildFrontHull;
  })(),
  // cabin
  (() => {
function buildCabin({ b, J, P }: Ctx) {
  const bone = J.body;

  // ---------- helpers ----------
  const box = (sx: number, sy: number, sz: number, x: number, y: number, z: number, color: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { bone, at: [x, y, z], ...o });
  const plane = (w: number, h: number, at: number[], dir: number[], tex: any, o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex, ...o });
  const rod = (a: number[], c: number[], r: number, color: any, o: any = {}) =>
    b.rod(a, c, r, color, { bone, sides: 6, ...o });

  const scuff = (base: string, seed: number) =>
    paint((p, n) => {
      const k = noise(p, 0.14, seed);
      const c = mix(base, P.hullDark, 0.4 * smoothstep(0.58, 0.8, k));
      const w = smoothstep(0.7, 0.86, noise(p, 0.05, seed + 3)) * (n.y > 0.3 ? 0.35 : 0.15);
      return mix(c, "#a3a884", w);
    });
  const hullPaint = panelled(scuff(P.hull, 3), { size: 0.45, aspect: 0.6, rivets: 0.07 });
  const armorPaint = panelled(scuff(P.armor, 8), { size: 0.5, aspect: 0.55, rivets: 0.07 });
  const hazard = paint((p, _n) => {
    const k = Math.floor((p.y + p.z * 0.7 + p.x * 0.2) / 0.06);
    return ((k % 2) + 2) % 2 === 0 ? P.trim : P.gunmetal;
  });

  // ---------- textures ----------
  const glassTex = svg(
    `<svg viewBox="0 0 100 56" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${P.glass}"/><stop offset="1" stop-color="${P.glassGlow}"/></linearGradient></defs>
      <rect x="2.5" y="2.5" width="95" height="51" rx="3" fill="none" stroke="url(#g)" stroke-width="5"/>
      <rect x="2" y="44" width="96" height="10" fill="${P.glass}"/>
      <path d="M14 46 L34 3 L50 3 L30 46Z" fill="url(#g)"/>
      <path d="M58 46 L72 16 L80 16 L66 46Z" fill="url(#g)"/>
    </svg>`,
    { size: 256 },
  );
  const glyphTex = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linecap="square">
        <g stroke="${P.hullDark}" stroke-width="10">
          <path d="M10 12 H54 M32 12 V54 M12 30 H52 M14 54 L32 40 L50 54"/></g>
        <g stroke="${P.trim}" stroke-width="5">
          <path d="M10 12 H54 M32 12 V54 M12 30 H52 M14 54 L32 40 L50 54"/></g>
      </g>
    </svg>`,
    { size: 128 },
  );
  const badgeTex = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="29" fill="${P.gunmetal}" stroke="${P.neonMagenta}" stroke-width="5"/>
      <path d="M16 38 L32 22 L48 38 M16 48 L32 32 L48 48" fill="none" stroke="${P.trim}" stroke-width="6" stroke-linejoin="miter"/>
      <circle cx="32" cy="16" r="4" fill="${P.neonCyan}"/>
    </svg>`,
    { size: 128 },
  );

  // ---------- chassis tub (z -0.9..0.9) ----------
  box(2.4, 0.28, 1.8, 0, 0.64, 0, P.gunmetal);
  box(2.0, 0.05, 1.7, 0, 0.485, 0, P.hullDark);
  for (const sx of [1, -1]) {
    glow(box(0.05, 0.015, 1.5, sx * 0.8, 0.455, 0, P.neonCyan), 1.4);
    // side skirts
    box(0.1, 0.26, 1.7, sx * 1.2, 0.65, 0, hullPaint);
    glow(box(0.02, 0.05, 1.5, sx * 1.255, 0.62, 0, P.neonCyan), 1.5);
    for (const sz of [1, -1]) box(0.11, 0.26, 0.06, sx * 1.2, 0.65, sz * 0.86, hazard);
    // skirt bolts
    for (let i = 0; i < 5; i++) box(0.02, 0.03, 0.03, sx * 1.255, 0.72, -0.6 + i * 0.3, P.steel);
  }

  // ---------- lower cab body ----------
  box(2.3, 0.55, 1.85, 0, 1.025, -0.025, hullPaint);
  box(2.2, 0.025, 1.78, 0, 1.31, -0.03, P.hullDark); // cabin floor

  for (const sx of [1, -1]) {
    // door
    box(0.03, 0.46, 1.05, sx * 1.165, 1.06, 0.03, armorPaint);
    box(0.035, 0.48, 0.012, sx * 1.17, 1.06, -0.5, P.rubber);
    box(0.035, 0.48, 0.012, sx * 1.17, 1.06, 0.56, P.rubber);
    box(0.035, 0.07, 1.05, sx * 1.172, 0.84, 0.03, hazard);
    // handle
    box(0.03, 0.04, 0.16, sx * 1.2, 1.17, -0.38, P.steel);
    box(0.045, 0.03, 0.03, sx * 1.19, 1.17, -0.44, P.gunmetal);
    // emblem + badge
    plane(0.36, 0.36, [sx * 1.183, 1.04, 0.0], [sx, 0, 0], glyphTex);
    plane(0.2, 0.2, [sx * 1.183, 1.1, 0.38], [sx, 0, 0], badgeTex);
    // beltline rail
    box(0.05, 0.05, 1.8, sx * 1.17, 1.3, -0.03, P.gunmetal);
    // quarter-glass fill (front)
    b.extrude(
      [[0.4, 1.3], [0.85, 1.3], [0.46, 1.9], [0.4, 1.9]],
      { at: [sx * 1.08, 0, 0], x: [0, 0, 1], thickness: 0.1, color: armorPaint, bone },
    );
    // side window glass
    plane(0.95, 0.52, [sx * 1.16, 1.6, -0.075], [sx, 0, 0], glassTex);
    // B pillar
    box(0.1, 0.6, 0.1, sx * 1.12, 1.6, -0.55, hullPaint);
    // slit armor shutter
    box(0.06, 0.6, 0.4, sx * 1.12, 1.6, -0.75, armorPaint);
    for (let i = 0; i < 4; i++) box(0.02, 0.03, 0.28, sx * 1.155, 1.45 + i * 0.1, -0.75, P.rubber);
    box(0.07, 0.04, 0.42, sx * 1.12, 1.9, -0.75, P.trim);
    // A pillar hazard
    rod([sx * 1.1, 1.3, 0.85], [sx * 1.1, 1.9, 0.43], 0.05, hazard);
    // roof edge rail
    box(0.05, 0.05, 1.5, sx * 1.22, 1.93, -0.21, P.trim);
    // camera pod mirror
    rod([sx * 1.13, 1.45, 0.72], [sx * 1.27, 1.5, 0.74], 0.015, P.steel);
    b.part(new THREE.SphereGeometry(0.06, 6, 4), P.gunmetal, { bone, at: [sx * 1.28, 1.5, 0.74], flat: true });
    glow(b.part(new THREE.SphereGeometry(0.025, 5, 4), P.neonCyan, { bone, at: [sx * 1.28, 1.5, 0.79] }), 1.5);
  }

  // ---------- windshield ----------
  const wn = [0, 0.583, 0.813];
  plane(2.1, 0.74, [0, 1.6 + wn[1] * 0.012, 0.635 + wn[2] * 0.012], wn, glassTex);
  rod([-1.0, 1.31, 0.84], [1.0, 1.31, 0.84], 0.03, P.gunmetal, { sides: 4 }); // cowl bar
  rod([-1.0, 1.9, 0.42], [1.0, 1.9, 0.42], 0.03, P.gunmetal, { sides: 4 });
  // wiper
  rod([-0.2, 1.34, 0.82], [0.5, 1.5, 0.74], 0.01, P.rubber, { sides: 4 });

  // ---------- roof ----------
  box(2.44, 0.08, 1.53, 0, 1.92, -0.215, armorPaint);
  box(2.0, 0.03, 1.3, 0, 1.975, -0.25, hullPaint);
  for (let i = 0; i < 3; i++) box(2.1, 0.025, 0.04, 0, 1.995, -0.7 + i * 0.35, P.gunmetal);
  // light bar
  box(1.6, 0.1, 0.2, 0, 2.04, 0.15, P.gunmetal);
  for (let i = 0; i < 6; i++) {
    const c = i < 3 ? P.neonMagenta : P.neonCyan;
    glow(box(0.23, 0.06, 0.02, (i - 2.5) * 0.25, 2.04, 0.255, c), 1.8);
  }
  for (const sx of [1, -1]) glow(box(0.02, 0.06, 0.12, sx * 0.805, 2.04, 0.15, sx > 0 ? P.neonCyan : P.neonMagenta), 1.8);
  // sensor dome
  b.part(new THREE.CylinderGeometry(0.14, 0.15, 0.04, 8), P.steel, { bone, at: [-0.55, 1.995, -0.45] });
  b.part(new THREE.SphereGeometry(0.12, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.gunmetal, {
    bone, at: [-0.55, 2.015, -0.45], flat: true,
  });
  glow(b.part(new THREE.SphereGeometry(0.035, 5, 4), P.neonCyan, { bone, at: [-0.55, 2.05, -0.37] }), 1.6);
  // antenna
  b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.05, 6), P.steel, { bone, at: [0.95, 1.99, -0.8] });
  rod([0.95, 1.99, -0.8], [0.95, 2.1, -0.8], 0.01, P.steel);
  glow(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.neonMagenta, { bone, at: [0.95, 2.1, -0.8] }), 1.8);

  // ---------- rear wall, window frame and cage ----------
  box(2.2, 0.55, 0.1, 0, 1.02, -0.9, P.hullDark);
  for (const sx of [1, -1]) box(0.3, 0.6, 0.08, sx * 0.95, 1.6, -0.91, hullPaint);
  box(1.6, 0.08, 0.08, 0, 1.86, -0.91, hullPaint);
  box(1.6, 0.1, 0.08, 0, 1.35, -0.91, hullPaint);
  plane(1.6, 0.42, [0, 1.61, -0.955], [0, 0, -1], glassTex);
  for (let i = 0; i < 5; i++) rod([-0.6 + i * 0.3, 1.34, -0.99], [-0.6 + i * 0.3, 1.88, -0.99], 0.02, P.steel);
  for (const y of [1.45, 1.85]) rod([-0.85, y, -0.99], [0.85, y, -0.99], 0.025, P.steel);
  for (const sx of [1, -1]) rod([sx * 0.85, 1.34, -0.99], [sx * 0.85, 1.88, -0.99], 0.03, P.trim);

  // ---------- interior hint ----------
  for (const sx of [1, -1]) {
    const x = sx * 0.45;
    box(0.48, 0.1, 0.5, x, 1.39, -0.1, P.rubber);
    box(0.48, 0.42, 0.1, x, 1.58, -0.38, P.gunmetal, { rotation: [-8, 0, 0] });
    box(0.24, 0.14, 0.08, x, 1.8, -0.4, P.rubber);
    box(0.5, 0.025, 0.06, x, 1.45, -0.1, P.rust);
  }
  box(0.2, 0.14, 0.5, 0, 1.38, 0.2, P.gunmetal); // console
  box(2.0, 0.16, 0.28, 0, 1.4, 0.7, P.gunmetal); // dash
  glow(box(0.3, 0.08, 0.05, 0.45, 1.5, 0.62, P.neonCyan, { rotation: [-35, 0, 0] }), 1.4);
  glow(box(0.3, 0.12, 0.04, -0.1, 1.5, 0.65, P.neonMagenta, { rotation: [-35, 0, 0] }), 1.2);
  rod([0.45, 1.44, 0.6], [0.45, 1.53, 0.4], 0.018, P.rubber);
  b.part(new THREE.TorusGeometry(0.1, 0.018, 5, 10), P.rubber, {
    bone, at: [0.45, 1.55, 0.38], dir: [0, 0.5, -0.87], axis: "z",
  });
  glow(box(0.1, 0.02, 0.1, 0, 1.865, -0.2, P.lightWhite), 1.2); // dome lamp
}
    return buildCabin;
  })(),
  // cargoBed
  (() => {
function buildCargoBed({ b, J, P, M }: Ctx) {
  const body = J.body;
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(g, color, { bone: body, at, flat: true, ...o });

  const armorPaint = paint((p, n) => {
    const base = mix(P.hull, P.armor, noise(p, 0.3, 3));
    const c = mix(base, P.steel, smoothstep(0.62, 0.8, noise(p, 0.06, 9)) * 0.5);
    const r = mix(c, P.hullDark, smoothstep(0.2, -0.8, n.y) * 0.5);
    return mix(r, P.rust, smoothstep(0.7, 0.85, noise(p, 0.12, 5)) * 0.5);
  });
  const floorPaint = paint((p) => {
    const c = mix(P.gunmetal, P.rust, smoothstep(0.45, 0.8, noise(p, 0.2, 2)) * 0.8);
    return mix(c, P.steel, smoothstep(0.7, 0.9, noise(p, 0.05, 7)) * 0.25);
  });
  const hazard = paint((p) => (Math.floor((p.x + p.y) / 0.09) % 2 === 0 ? P.trim : P.rubber));

  // chassis tub and floor
  put(box(2.3, 0.4, 1.75), armorPaint, [0, 0.68, -1.82]);
  put(box(2.0, 0.12, 1.7), P.gunmetal, [0, 0.46, -1.82]);
  put(box(2.1, 0.08, 1.75), floorPaint, [0, 0.89, -1.82]);
  for (let i = 0; i < 9; i++) put(box(1.9, 0.03, 0.05), P.steel, [0, 0.945, -2.55 + i * 0.19]);

  for (const s of [1, -1]) {
    put(box(0.12, 0.7, 1.75), armorPaint, [s * 1.18, 1.27, -1.82], { rotation: [0, 0, s * 6] });
    put(box(0.16, 0.08, 1.75), P.hullDark, [s * 1.14, 1.64, -1.82]);
    put(box(0.3, 0.1, 1.0), P.armor, [s * 1.16, 0.8, -1.75], { rotation: [0, 0, s * -12] });
    for (let i = 0; i < 6; i++) put(new THREE.SphereGeometry(0.025, 5, 3), P.steel, [s * 1.25, 1.5, -2.5 + i * 0.3]);
    glow(put(box(0.04, 0.05, 1.5), P.neonCyan, [s * 1.3, 0.55, -1.8]), 1.4);
    glow(put(box(0.18, 0.1, 0.05), P.lightRed, [s * 0.95, 1.2, -2.73]), 1.6);
    glow(put(box(0.06, 0.28, 0.04), P.lightRed, [s * 1.2, 1.4, -2.72]), 1.6);
  }
  glow(put(box(1.8, 0.05, 1.4), P.neonMagenta, [0, 0.4, -1.8]), 1.4);

  put(box(2.3, 0.9, 0.1), P.hullDark, [0, 1.35, -0.98]);

  // tailgate
  const gateTex = svg(
    `<svg viewBox="0 0 128 40"><rect width="128" height="40" fill="#4a5240"/>
    <g fill="#e7b814"><path d="M0 40L12 0H28L16 40Z"/><path d="M100 40L112 0H128L116 40Z"/></g>
    <text x="64" y="28" font-size="20" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#f4f8ff">AX-07</text></svg>`,
    { size: 256 },
  );
  put(box(2.3, 0.75, 0.1), armorPaint, [0, 1.3, -2.68]);
  put(new THREE.PlaneGeometry(1.5, 0.45), "#ffffff", [0, 1.3, -2.74], { dir: [0, 0, -1], axis: "z", texture: gateTex, flat: false });
  put(box(2.4, 0.06, 0.12), hazard, [0, 1.7, -2.68]);

  // bumper and tow ring
  put(box(2.5, 0.22, 0.2), P.gunmetal, [0, 0.7, -2.72]);
  put(box(2.5, 0.05, 0.22), hazard, [0, 0.82, -2.72]);
  b.sweep(arc([0, 0.62, -2.9], [0.1, 0.62, -2.9], [0, 0, 1], 360), 0.015, { bone: body, color: P.steel, closed: true });
  put(box(0.1, 0.1, 0.12), P.steel, [0, 0.62, -2.82]);

  // roll hoop
  for (const s of [1, -1]) {
    b.rod([s * 1.05, 0.95, -1.15], [s * 1.05, 1.95, -1.15], 0.05, { bone: body, color: P.gunmetal });
    glow(put(box(0.04, 0.5, 0.04), P.warn, [s * 0.98, 1.5, -1.15]), 1.3);
  }
  b.rod([-1.05, 1.95, -1.15], [1.05, 1.95, -1.15], 0.05, { bone: body, color: P.gunmetal });
  glow(put(box(1.5, 0.04, 0.04), P.warn, [0, 1.88, -1.15]), 1.3);

  // cargo
  const crateTex = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#5d6650"/><rect x="2" y="2" width="28" height="28" fill="none" stroke="#2b3027" stroke-width="2"/><path d="M2 2L30 30M30 2L2 30" stroke="#2b3027" stroke-width="1.5"/><rect x="8" y="12" width="16" height="8" fill="#e7b814"/></svg>`,
    { size: 64 },
  );
  for (let i = 0; i < 3; i++) put(box(0.4, 0.3, 0.4), "#ffffff", [0.7, 1.08 + (i > 1 ? 0.3 : 0), -1.3 - (i % 2) * 0.45], { texture: crateTex, rotation: [0, i * 12, 0], flat: false });
  put(new THREE.CylinderGeometry(0.25, 0.25, 0.7, 8), P.rust, [-0.7, 1.29, -1.4]);
  put(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 8), P.warn, [-0.7, 1.5, -1.4]);
  put(new THREE.CylinderGeometry(0.255, 0.255, 0.05, 8), P.warn, [-0.7, 1.15, -1.4]);
  b.sweep(arc([-0.6, 0.98, -2.2], [-0.6, 0.98, -2.0], [0, 1, 0], 720), 0.025, { bone: body, color: P.rubber });

  // gun
  const mount = J.gunMount;
  const barrel = J.gunBarrel;
  b.part(new THREE.CylinderGeometry(0.2, 0.28, 0.1, 8), P.gunmetal, { bone: mount, at: [0, 0.95, -1.6], flat: true });
  b.part(new THREE.CylinderGeometry(0.07, 0.09, 0.45, 6), P.steel, { bone: mount, at: [0, 1.2, -1.6], flat: true });
  b.part(box(0.5, 0.2, 0.4), P.gunmetal, { bone: mount, at: [0, 1.45, -1.6], flat: true });
  b.part(box(0.9, 0.55, 0.06), P.armor, { bone: mount, at: [0, 1.6, -1.35], rotation: [-8, 0, 0], flat: true });
  glow(b.part(box(0.4, 0.05, 0.02), P.glassGlow, { bone: mount, at: [0, 1.66, -1.31], flat: true }), 1.5);
  glow(b.part(box(0.1, 0.1, 0.03), P.neonCyan, { bone: mount, at: [0.2, 1.78, -1.33], flat: true }), 1.6);
  b.part(box(0.2, 0.28, 0.3), P.hullDark, { bone: mount, at: [0.3, 1.4, -1.6], flat: true });
  for (let i = 0; i < 5; i++) b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 5), P.trim, { bone: mount, at: [0.22, 1.28 - i * 0.02, -1.5 + i * 0.07], rotation: [0, 0, 90], flat: true });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8), P.gunmetal, { bone: barrel, at: [0, 1.45, -1.1], rotation: [90, 0, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 1.2, 6), P.steel, { bone: barrel, at: [0, 1.45, -0.7], rotation: [90, 0, 0], flat: true });
  for (let i = 0; i < 4; i++) glow(b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 5), P.warn, { bone: barrel, at: [0.1, 1.45, -1.3 + i * 0.15], rotation: [0, 0, 90], flat: true }), 0.8);
  b.part(box(0.2, 0.2, 0.18), P.gunmetal, { bone: barrel, at: [0, 1.45, -0.08], flat: true });
  b.part(box(0.26, 0.04, 0.12), P.steel, { bone: barrel, at: [0, 1.58, -0.08], flat: true });
}
    return buildCargoBed;
  })(),
  // thrusters
  (() => {
function buildThrusters({ b, J, P, M }: any) {
  const HAZ = P.trim;
  const drumPaint = paint((p: THREE.Vector3, n: THREE.Vector3, s: readonly [number, number]) => {
    const side = Math.abs(n.y) < 0.5;
    if (side && Math.abs(s[0]) < 0.07) {
      return Math.floor((p.x + p.z + p.y * 2) / 0.05) % 2 ? HAZ : P.gunmetal;
    }
    const scuff = Math.sin(p.x * 37 + p.z * 23) * Math.sin(p.y * 41) > 0.7;
    return scuff ? P.steel : P.gunmetal;
  });
  const coreTex = svg(
    `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#0a2a33"/>
    <circle cx="50" cy="50" r="48" fill="${P.neonCyan}"/>
    <circle cx="50" cy="50" r="40" fill="#0b5560"/>
    <circle cx="50" cy="50" r="32" fill="${P.neonCyan}"/>
    <circle cx="50" cy="50" r="22" fill="#12404a"/>
    <circle cx="50" cy="50" r="15" fill="none" stroke="${P.neonMagenta}" stroke-width="5"/>
    <circle cx="50" cy="50" r="7" fill="#e8ffff"/></svg>`, { size: 128 });
  const floorTex = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="${P.neonCyan}" stroke-width="5" stroke-dasharray="14 6"/>
    <circle cx="50" cy="50" r="32" fill="none" stroke="${P.neonCyan}" stroke-width="3"/>
    <circle cx="50" cy="50" r="16" fill="none" stroke="${P.neonMagenta}" stroke-width="3"/></svg>`, { size: 128 });
  const beamTex = svg(
    `<svg viewBox="0 0 40 60"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${P.neonCyan}" stop-opacity="0.9"/><stop offset="1" stop-color="${P.neonCyan}" stop-opacity="0"/></linearGradient></defs>
    <path d="M10 0 L30 0 L40 60 L0 60Z" fill="url(#g)"/></svg>`, { size: 64 });
  const numTex = (t: string) =>
    svg(`<svg viewBox="0 0 60 60"><text x="30" y="46" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="52" fill="#e7b814" stroke="#2b3027" stroke-width="1.5">${t}</text></svg>`, { size: 96 });

  const corners: [string, string][] = [["FL", "1"], ["FR", "2"], ["RL", "3"], ["RR", "4"]];

  const thruster = (key: string, num: string) => {
    const bone = J["thruster" + key];
    const m = M["thruster" + key] as number[];
    const [cx, cy, cz] = m;
    const s = cx > 0 ? 1 : -1;
    const C = new THREE.Vector3(cx, cy, cz);
    const at = (x = 0, y = 0, z = 0) => [cx + x, cy + y, cz + z] as [number, number, number];

    // drum
    b.lathe(
      [[0, -0.17], [0.38, -0.17], [0.42, -0.12], [0.42, 0.12], [0.38, 0.17], [0, 0.17]],
      { at: at(), segments: 8, bone, color: drumPaint, spin: 22.5 },
    );
    // core disc glowing, facing down
    glow(b.part(new THREE.CircleGeometry(0.3, 16), "#ffffff", {
      bone, at: at(0, -0.176, 0), dir: [0, -1, 0], axis: "z", texture: coreTex }), 1.3);
    // emissive rim ring
    glow(b.part(new THREE.TorusGeometry(0.31, 0.022, 4, 16), P.neonCyan, {
      bone, at: at(0, -0.18, 0), rotation: [90, 0, 0] }), 1.5);
    glow(b.part(new THREE.TorusGeometry(0.1, 0.015, 4, 10), P.neonMagenta, {
      bone, at: at(0, -0.184, 0), rotation: [90, 0, 0] }), 1.5);
    // exhaust vanes
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.BoxGeometry(0.56, 0.07, 0.014), P.hullDark, {
        bone, at: at(0, -0.21, 0), rotation: [0, i * 45, 0] });
    }
    b.part(new THREE.TorusGeometry(0.31, 0.014, 4, 12), P.steel, {
      bone, at: at(0, -0.245, 0), rotation: [90, 0, 0] });
    // intake ring and fan
    b.part(new THREE.TorusGeometry(0.32, 0.035, 5, 16), P.steel, {
      bone, at: at(0, 0.175, 0), rotation: [90, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.06, 0.07, 0.07, 8), P.rubber, { bone, at: at(0, 0.19, 0) });
    for (let i = 0; i < 8; i++) {
      const g = new THREE.BoxGeometry(0.22, 0.012, 0.07);
      g.rotateX(0.55);
      g.translate(0.17, 0, 0);
      g.rotateY((i * Math.PI) / 4);
      b.part(g, P.steel, { bone, at: at(0, 0.18, 0), flat: true });
    }
    // bolts on top rim
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.2;
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 6), P.steel, {
        bone, at: at(Math.cos(a) * 0.37, 0.172, Math.sin(a) * 0.37) });
    }
    // warning lights front & back
    for (const d of [1, -1]) {
      glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), P.warn, {
        bone, at: at(0, 0.02, d * 0.43) }), 1.6);
      b.part(new THREE.BoxGeometry(0.1, 0.08, 0.03), P.hullDark, { bone, at: at(0, 0.02, d * 0.425) });
    }
    // stencil number on outer side
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
      bone, at: at(s * 0.4 + s * 0.012, 0, 0), dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: numTex(num) });
    // pylon arm toward the chassis underside (y 0.62)
    const inner = at(-s * 0.4, 0.1, 0);
    const toBody = [cx * 0.55, 0.62, cz];
    b.frustumBox(inner, [toBody[0], 0.62, toBody[2]], [0.2, 0.2], [0.26, 0.1], {
      bone, color: P.hullDark });
    b.part(new THREE.BoxGeometry(0.34, 0.06, 0.3), P.armor, { bone, at: [cx * 0.55, 0.585, cz] });
    // landing skid (outer side), foot touches y = 0
    const sx = cx + s * 0.5;
    b.part(new THREE.BoxGeometry(0.12, 0.2, 0.08), P.gunmetal, { bone, at: [sx - s * 0.04, 0.3, cz], flat: true });
    b.rod([cx + s * 0.38, 0.4, cz], [sx, 0.1, cz], 0.03, P.steel, { bone, sides: 6 });
    b.part(new THREE.BoxGeometry(0.16, 0.05, 0.5), P.steel, { bone, at: [sx, 0.1, cz] });
    b.part(new THREE.BoxGeometry(0.2, 0.1, 0.56), P.rubber, { bone, at: [sx, 0.045, cz], flat: true });
    // glow cone beams + floor decal
    const fr = [0, 1, 2, 3].map((i) => frame([cx + Math.cos(i * 1.57) * 0.12, 0.22, cz + Math.sin(i * 1.57) * 0.12], [0, 1, 0]));
    const cards = b.cards(fr, beamTex, { size: [0.3, 0.2], lean: 180, flow: [0, 0, 1], cross: true, bone });
    glow(cards, 1.1);
    glow(b.part(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", {
      bone, at: [cx, 0.012, cz], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: floorTex }), 1);
  };

  for (const [k, n] of corners) thruster(k, n);

  // underbody ducts front to back
  for (const s of [1, -1]) {
    const x = s * 0.5;
    b.part(new THREE.BoxGeometry(0.24, 0.12, 4.3), P.gunmetal, { bone: J.body, at: [x, 0.56, 0], flat: true });
    b.part(new THREE.BoxGeometry(0.3, 0.03, 4.1), P.hullDark, { bone: J.body, at: [x, 0.495, 0] });
    for (const e of [-1, 1]) {
      glow(b.rod([x + e * 0.125, 0.5, -2.1], [x + e * 0.125, 0.5, 2.1], 0.014, P.neonCyan, { bone: J.body, sides: 4 }), 1.5);
    }
    // cross braces linking duct to hazard marks
    for (const z of [-1.2, 0, 1.2]) {
      b.part(new THREE.BoxGeometry(0.26, 0.14, 0.05), HAZ, { bone: J.body, at: [x, 0.56, z] });
    }
  }
}
    return buildThrusters;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,0.9,0], dir: [0,0,1], role: "spine" });
  J["thrusterFL"] = b.joint("thrusterFL", { parent: J["body"], at: [1.15,0.38,1.75], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterFR"] = b.joint("thrusterFR", { parent: J["body"], at: [-1.15,0.38,1.75], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterRL"] = b.joint("thrusterRL", { parent: J["body"], at: [1.15,0.38,-1.75], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterRR"] = b.joint("thrusterRR", { parent: J["body"], at: [-1.15,0.38,-1.75], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["gunMount"] = b.joint("gunMount", { parent: J["body"], at: [0,1,-1.6], dir: [0,1,0], role: "hinge", group: "gun" });
  J["gunBarrel"] = b.joint("gunBarrel", { parent: J["gunMount"], at: [0,1.45,-1.6], dir: [0,0,1], role: "hinge", group: "gun" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
