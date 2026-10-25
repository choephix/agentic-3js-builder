import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, mix, noise, smoothstep, polyline, rng, catmull, stripes, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled } from "../../../../kits/clockwork";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Hoverpickup X-9 Warthog",
  "description": "A militarized pickup truck converted to ride on four glowing hover thruster pods, in low-poly cyberpunk style with neon trim, armor plates and a roof-mounted gun."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#3a4150",
  hullDark: "#20242e",
  armor: "#566070",
  trim: "#e7b814",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fa8",
  glass: "#0d1a2a",
  rubber: "#15161a",
  metal: "#8a93a3",
  rust: "#7a4a2a",
  headlight: "#fff6c4",
  tail: "#ff2a3a",
  ink: "#0a0a10",
};
const M = {
  chassisTop: [0, 1, 0] as [number, number, number],
  hoodFront: [0, 0.95, 2.9] as [number, number, number],
  cabFloor: [0, 1, 0.35] as [number, number, number],
  bedFloor: [0, 1, -1.7] as [number, number, number],
  tailgate: [0, 1, -2.9] as [number, number, number],
  gunRing: [0, 1.65, -1.4] as [number, number, number],
  thrusterFL: [1, 0.55, 1.95] as [number, number, number],
  thrusterFR: [-1, 0.55, 1.95] as [number, number, number],
  thrusterRL: [1, 0.55, -1.8] as [number, number, number],
  thrusterRR: [-1, 0.55, -1.8] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: Ctx) {
  const body = J.body;
  type V = [number, number, number];

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, at: V, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, flat: true, ...o });

  const rivets = (pts: V[], axis: "x" | "y" | "z", color: string) => {
    const geos = pts.map((p) => {
      const g = new THREE.CylinderGeometry(0.015, 0.015, 0.014, 5);
      if (axis === "z") g.rotateX(Math.PI / 2);
      if (axis === "x") g.rotateZ(Math.PI / 2);
      g.translate(p[0], p[1], p[2]);
      return g;
    });
    return b.part(mergeGeometries(geos)!, color, { bone: body, at: [0, 0, 0] });
  };
  const row = (from: number, to: number, step: number) => {
    const out: number[] = [];
    for (let v = from; v <= to + 1e-6; v += step) out.push(v);
    return out;
  };

  // ---------- paints ----------
  const gun = paint((p, n) => {
    let c = mix(P.hull, P.hullDark, smoothstep(0.3, 0.8, noise(p, 0.5, 3)) * 0.6);
    c = mix(c, P.armor, smoothstep(0.3, 1, n.y) * 0.5);
    const rust = smoothstep(0.62, 0.48, p.y) * smoothstep(0.45, 0.7, noise(p, 0.15, 5));
    c = mix(c, P.rust, rust * 0.85);
    const scratch = smoothstep(0.74, 0.8, noise(p, 0.03, 9));
    return mix(c, P.metal, scratch * 0.5);
  });
  const dark = paint((p) => mix(P.hullDark, P.ink, smoothstep(0.3, 0.8, noise(p, 0.3, 11)) * 0.6));
  const HULL = panelled(gun, { size: 0.5, aspect: 0.5, rivets: 0.1 });
  const ARMOR = panelled(mix(P.armor, P.hull, 0.3) as any, { size: 0.36, aspect: 0.6, rivets: 0.08 });
  const DARK = panelled(dark, { size: 0.45, aspect: 0.6, rivets: 0 });

  // ---------- textures ----------
  let chev = "";
  for (let i = -2; i < 10; i++)
    chev += `<polygon points="${i * 8},16 ${i * 8 + 4},16 ${i * 8 + 12},0 ${i * 8 + 8},0" fill="#e7b814"/>`;
  const HAZARD = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#0a0a10"/>${chev}</svg>`,
    { size: 256 },
  );
  let vs = "";
  for (let i = 0; i < 4; i++)
    vs += `<path d="M0 ${i * 9 + 6} L32 ${i * 9 - 2} L64 ${i * 9 + 6}" stroke="#e7b814" stroke-width="4.5" fill="none"/>`;
  const CHEVRON = svg(
    `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="32" fill="#0a0a10"/>${vs}</svg>`,
    { size: 256 },
  );
  const NUMBER = svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
      <text x="32" y="30" text-anchor="middle" font-family="Impact, monospace" font-weight="bold" font-size="34" fill="#e7b814" stroke="#0a0a10" stroke-width="1.6">07</text>
      <rect x="0" y="16" width="64" height="1.6" fill="#000" opacity="0"/>
      <text x="32" y="39" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="7" fill="#2ff3ff">X-9 WARTHOG</text>
    </svg>`,
    { size: 256 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M46 28 L8 6 L16 22 L2 24 L14 34 L6 46 L26 40 L34 52 L46 42Z" fill="#ff2fa8" stroke="#0a0a10" stroke-width="2"/>
      <path d="M54 28 L92 6 L84 22 L98 24 L86 34 L94 46 L74 40 L66 52 L54 42Z" fill="#ff2fa8" stroke="#0a0a10" stroke-width="2"/>
      <path d="M44 30 L18 16 M44 36 L20 34 M56 30 L82 16 M56 36 L80 34" stroke="#2ff3ff" stroke-width="1.6"/>
      <path d="M50 8 C36 8 32 20 34 30 L38 34 L38 44 L62 44 L62 34 L66 30 C68 20 64 8 50 8Z" fill="#e8ecf2" stroke="#0a0a10" stroke-width="2.4"/>
      <ellipse cx="43" cy="27" rx="5" ry="6" fill="#0a0a10"/><ellipse cx="57" cy="27" rx="5" ry="6" fill="#0a0a10"/>
      <path d="M50 32 L47 38 L53 38Z" fill="#0a0a10"/>
      <path d="M42 44 V38 M46 44 V40 M50 44 V40 M54 44 V40 M58 44 V38" stroke="#0a0a10" stroke-width="1.6"/>
    </svg>`,
    { size: 256 },
  );
  const decal = (tex: THREE.Texture, w: number, h: number, at: V, dir: V) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: body, at, dir, axis: "z", texture: tex });

  // ---------- main slab and belly ----------
  box(2.3, 0.34, 5.2, HULL, [0, 0.88, 0]); // upper slab z -2.6..2.6, y .71..1.05
  box(2.2, 0.26, 2.6, ARMOR, [0, 0.58, 0.05]); // lower body between the arches
  box(1.4, 0.12, 5.0, DARK, [0, 0.51, 0]); // belly plate, underside at 0.45

  // belly vents and underglow
  const slats = row(-0.45, 0.45, 0.15).map((z) => new THREE.BoxGeometry(1.0, 0.03, 0.07).translate(0, 0.465, z + 0.1));
  b.part(mergeGeometries(slats)!, P.ink, { bone: body, at: [0, 0, 0] });
  glow(box(1.0, 0.015, 0.9, P.neonMagenta, [0, 0.455, -1.0]), 1.2);
  glow(box(1.0, 0.015, 0.9, P.neonCyan, [0, 0.455, 1.3]), 1.2);
  for (const s of [1, -1]) glow(box(0.04, 0.02, 4.4, P.neonCyan, [s * 0.7, 0.46, 0]), 1);
  // cross beams toward the thruster mounts
  for (const z of [1.95, -1.8]) {
    box(1.4, 0.08, 0.14, P.metal, [0, 0.5, z]);
    for (const s of [1, -1]) box(0.1, 0.1, 0.16, P.trim, [s * 0.68, 0.5, z]);
  }

  // ---------- side sills ----------
  const sillOutline: [number, number][] = [
    [-1.3, 0.45], [1.4, 0.45], [1.55, 0.62], [1.3, 0.78], [-1.2, 0.78], [-1.45, 0.62],
  ];
  for (const s of [1, -1]) {
    b.extrude(sillOutline, { at: [s * 1.17, 0, 0.05], x: [0, 0, 1], thickness: 0.12, bevel: 0.015, color: ARMOR, bone: body });
    glow(box(0.03, 0.03, 2.5, P.neonCyan, [s * 1.235, 0.7, 0.05]), 1.3);
    glow(box(0.03, 0.03, 2.5, P.neonMagenta, [s * 1.235, 0.5, 0.05]), 1.3);
    box(0.1, 0.02, 2.2, P.trim, [s * 1.18, 0.785, 0.05]);
    rivets(row(-1.1, 1.2, 0.2).map((z) => [s * 1.236, 0.6, z] as V), "x", P.metal);
    // door decals on the slab side
    const d: V = [s, 0, 0];
    decal(NUMBER, 0.55, 0.34, [s * 1.153, 0.9, 0.65], d);
    decal(EMBLEM, 0.5, 0.3, [s * 1.153, 0.9, -0.2], d);
    // side vents
    const vents = [0, 1, 2, 3].map((i) => new THREE.BoxGeometry(0.014, 0.2, 0.03).translate(s * 1.152, 0.88, -0.75 - i * 0.07));
    b.part(mergeGeometries(vents)!, P.ink, { bone: body, at: [0, 0, 0] });
    rivets([[s * 1.152, 1.02, 1.0], [s * 1.152, 1.02, 0.3], [s * 1.152, 1.02, -0.6], [s * 1.152, 0.74, 1.0], [s * 1.152, 0.74, -0.6]], "x", P.metal);
  }

  // ---------- wheel-arch flares ----------
  const flare: [number, number][] = [
    [-0.8, 0.45], [-0.8, 0.8], [-0.55, 1.0], [0.55, 1.0], [0.8, 0.8], [0.8, 0.45],
    [0.5, 0.45], [0.38, 0.7], [-0.38, 0.7], [-0.5, 0.45],
  ];
  for (const s of [1, -1])
    for (const z of [1.95, -1.8]) {
      b.extrude(flare, { at: [s * 1.2, 0, z], x: [0, 0, 1], thickness: 0.1, bevel: 0.015, color: ARMOR, bone: body });
      const edge: V[] = [
        [s * 1.248, 0.46, z - 0.5], [s * 1.248, 0.71, z - 0.38], [s * 1.248, 0.71, z + 0.38], [s * 1.248, 0.46, z + 0.5],
      ];
      glow(b.sweep(polyline(edge), 0.014, { color: P.neonCyan, bone: body, sides: 6 }), 1.4);
      box(0.12, 0.025, 1.0, P.trim, [s * 1.2, 1.0, z]);
      rivets([-0.65, -0.35, 0, 0.35, 0.65].map((dz) => [s * 1.252, 0.9, z + dz] as V), "x", P.metal);
    }

  // ---------- front bumper ----------
  box(2.5, 0.4, 0.38, ARMOR, [0, 0.7, 2.69]); // face at z 2.88
  box(2.3, 0.1, 0.3, P.hullDark, [0, 0.95, 2.62]);
  decal(HAZARD, 2.0, 0.17, [0, 0.6, 2.883], [0, 0, 1]);
  glow(box(2.3, 0.03, 0.02, P.neonCyan, [0, 0.87, 2.89]), 1.4);
  glow(box(2.3, 0.02, 0.02, P.neonMagenta, [0, 0.52, 2.89]), 1.2);
  rivets(row(-1.15, 1.15, 0.23).map((x) => [x, 0.79, 2.885] as V), "z", P.metal);
  rivets(row(-1.15, 1.15, 0.23).map((x) => [x, 0.53, 2.885] as V), "z", P.metal);
  // ram bar
  b.rod([-1.1, 0.74, 2.91], [1.1, 0.74, 2.91], 0.04, P.metal, { bone: body });
  for (const s of [1, -1]) {
    b.rod([s * 1.1, 0.74, 2.91], [s * 1.22, 0.74, 2.72], 0.04, P.metal, { bone: body });
    for (const x of [0.35, 0.8]) box(0.08, 0.2, 0.06, P.metal, [s * x, 0.7, 2.9]);
    // tow hooks
    b.part(new THREE.TorusGeometry(0.06, 0.016, 5, 8), P.metal, { bone: body, at: [s * 0.55, 0.56, 2.93], flat: true });
    box(0.06, 0.05, 0.08, P.hullDark, [s * 0.55, 0.62, 2.9]);
    // fog slits
    glow(box(0.3, 0.04, 0.02, P.headlight, [s * 0.9, 0.63, 2.89]), 1);
  }
  // skid plate
  const skid: [number, number][] = [[2.15, 0.45], [2.9, 0.54], [2.9, 0.64], [2.15, 0.64]];
  b.extrude(skid, { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.6, color: P.metal, bone: body });
  for (const x of [-0.5, -0.25, 0, 0.25, 0.5]) box(0.03, 0.03, 0.6, P.hullDark, [x, 0.5, 2.5]);

  // ---------- rear bumper ----------
  box(2.5, 0.4, 0.38, ARMOR, [0, 0.74, -2.69]); // face at z -2.88
  decal(CHEVRON, 1.4, 0.18, [0, 0.58, -2.883], [0, 0, -1]);
  rivets(row(-1.15, 1.15, 0.23).map((x) => [x, 0.9, -2.885] as V), "z", P.metal);
  glow(box(1.3, 0.025, 0.02, P.tail, [0, 0.84, -2.89]), 1.4);
  glow(box(2.3, 0.025, 0.02, P.neonMagenta, [0, 0.54, -2.89]), 1.2);
  for (const s of [1, -1]) {
    glow(box(0.4, 0.14, 0.04, P.tail, [s * 0.95, 0.8, -2.9]), 1.6);
    box(0.46, 0.04, 0.06, P.ink, [s * 0.95, 0.89, -2.9]);
    box(0.46, 0.04, 0.06, P.ink, [s * 0.95, 0.71, -2.9]);
    b.part(new THREE.TorusGeometry(0.06, 0.016, 5, 8), P.metal, { bone: body, at: [s * 0.6, 0.55, -2.93], flat: true });
  }
  // hitch
  box(0.2, 0.1, 0.18, P.metal, [0, 0.55, -2.8]);
  b.part(new THREE.SphereGeometry(0.05, 6, 4), P.metal, { bone: body, at: [0, 0.62, -2.85] });
}
    return buildChassis;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P }: Ctx) {
  const bone = J.body;
  const ID = "#ffffff";

  // ---------- paints ----------
  const INKC: [number, number, number] = [0.04, 0.04, 0.06];
  const plate = (base: string, seed: number, size = 0.42) =>
    paint((p, n) => {
      const lit = 0.82 + 0.22 * smoothstep(-0.6, 0.9, n.y);
      let c = mix(base, "#8a93a3", 0.1 * noise(p, 0.15, seed));
      const du = Math.abs(((p.z / size) % 1 + 1) % 1 - 0.5);
      const dv = Math.abs(((p.y / (size * 0.7)) % 1 + 1) % 1 - 0.5);
      if (Math.abs(n.x) > 0.5 && (du > 0.485 || dv > 0.485)) c = mix(c, INKC, 0.8);
      if (n.y > 0.5 && ((((p.x / size) % 1) + 1) % 1 > 0.985)) c = mix(c, INKC, 0.7);
      if (p.y < 1.12) c = mix(c, "#7a4a2a", 0.55 * smoothstep(0.4, 0.8, noise(p, 0.12, seed + 3)));
      if (noise(p, 0.03, seed + 8) > 0.74) c = mix(c, "#8a93a3", 0.35);
      return [c[0] * lit, c[1] * lit, c[2] * lit];
    });
  const HULL = plate(P.hull, 3);
  const HOOD = plate(P.armor, 7, 0.5);
  const DARK = plate(P.hullDark, 11, 0.3);

  // ---------- textures ----------
  const streaks = `<path d="M10 30 L30 0 L38 0 L18 30Z M52 30 L72 0 L76 0 L56 30Z M92 30 L108 0 L112 0 L96 30Z" fill="#2ff3ff" opacity="0.22"/>`;
  const WIN = svg(
    `<svg viewBox="0 0 120 30"><rect width="120" height="30" rx="3" fill="#0d1a2a"/>
    ${streaks}
    <rect x="14" y="10" width="20" height="20" rx="4" fill="#06101a" stroke="#2ff3ff" stroke-width="1"/>
    <rect x="80" y="10" width="20" height="20" rx="4" fill="#06101a" stroke="#2ff3ff" stroke-width="1"/>
    <rect x="0" y="26" width="120" height="4" fill="#2ff3ff" opacity="0.6"/>
    <rect x="1" y="1" width="118" height="28" rx="3" fill="none" stroke="#0a0a10" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  const WSHIELD = svg(
    `<svg viewBox="0 0 100 32"><rect width="100" height="32" fill="#0d1a2a"/>
    <path d="M10 32 L32 0 L40 0 L18 32Z M58 32 L80 0 L85 0 L63 32Z" fill="#2ff3ff" opacity="0.2"/>
    <rect x="0" y="27" width="100" height="5" fill="#2ff3ff" opacity="0.55"/>
    <path d="M6 22 H30 M70 22 H94" stroke="#ff2fa8" stroke-width="1.5"/>
    <rect x="1" y="1" width="98" height="30" fill="none" stroke="#0a0a10" stroke-width="2.5"/></svg>`,
    { size: 256 },
  );
  const GRILLE = svg(
    `<svg viewBox="0 0 100 28"><rect width="100" height="28" rx="2" fill="#0a0a10"/>
    ${[3, 8, 13, 18, 23].map((y) => `<rect x="6" y="${y}" width="88" height="2.4" fill="${y % 10 === 3 ? "#2ff3ff" : "#ff2fa8"}"/>`).join("")}
    <rect x="46" y="0" width="8" height="28" fill="#20242e"/></svg>`,
    { size: 256 },
  );
  const SKULL = svg(
    `<svg viewBox="0 0 100 60"><g fill="#e7b814" stroke="#0a0a10" stroke-width="2">
    <path d="M46 24 L20 8 L2 14 L14 22 L4 30 L18 32 L12 42 L30 38 L46 42Z"/>
    <path d="M54 24 L80 8 L98 14 L86 22 L96 30 L82 32 L88 42 L70 38 L54 42Z"/></g>
    <path d="M50 8 C38 8 34 18 36 28 L40 32 L40 40 L60 40 L60 32 L64 28 C66 18 62 8 50 8Z" fill="#e8e8e8" stroke="#0a0a10" stroke-width="2"/>
    <ellipse cx="43.5" cy="24" rx="4" ry="5" fill="#0a0a10"/><ellipse cx="56.5" cy="24" rx="4" ry="5" fill="#0a0a10"/>
    <path d="M50 29 L47 34 H53Z" fill="#0a0a10"/><path d="M44 40 V36 M50 40 V36 M56 40 V36" stroke="#0a0a10" stroke-width="1.5"/></svg>`,
    { size: 256 },
  );
  const STENCIL = svg(
    `<svg viewBox="0 0 100 40"><text x="50" y="32" text-anchor="middle" font-family="Impact,Arial Black,sans-serif" font-weight="bold" font-size="36" fill="#e8e0c8" opacity="0.85">X-9 07</text>
    <path d="M2 38 H98" stroke="#e8e0c8" stroke-width="2" opacity="0.7" stroke-dasharray="8 4"/></svg>`,
    { size: 256 },
  );
  const HAZARD = svg(
    `<svg viewBox="0 0 100 10"><rect width="100" height="10" fill="#e7b814"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 14 - 4} 10 L${i * 14 + 6} 0 L${i * 14 + 14} 0 L${i * 14 + 4} 10Z" fill="#0a0a10"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const CHEVRON = svg(
    `<svg viewBox="0 0 40 40"><path d="M4 8 L20 22 L36 8 V16 L20 30 L4 16Z M4 22 L20 36 L36 22 V28 L20 40 L4 28Z" fill="#e7b814" stroke="#0a0a10" stroke-width="1.5"/></svg>`,
    { size: 128 },
  );

  // ---------- helpers ----------
  const box = (sx: number, sy: number, sz: number, color: any, at: number[], rotation?: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { bone, at, rotation, ...extra });
  const rod = (a: number[], c: number[], r: number, color: any) => b.rod(a, c, r, color, { bone });
  const tex = (w: number, h: number, t: any, at: number[], dir: number[], tint = ID) =>
    b.part(new THREE.PlaneGeometry(w, h), tint, { bone, at, dir, axis: "z", texture: t });
  const SLOPE = 3.5;
  const hoodTop = (z: number) => 1.55 - (z - 2.0) * 0.0612;

  // ---------- cab lower body ----------
  box(2.4, 0.6, 1.7, HULL, [0, 1.3, 0.35]);
  // greenhouse
  box(2.2, 0.4, 1.3, DARK, [0, 1.8, 0.15]);
  // roof slab + brow
  box(2.3, 0.1, 1.45, HOOD, [0, 2.05, 0.1]);
  box(2.3, 0.08, 0.14, P.armor, [0, 2.09, 0.84], [-39, 0, 0]);
  // roof edge chamfers
  for (const s of [1, -1]) box(0.14, 0.07, 1.45, P.armor, [s * 1.12, 2.02, 0.1], [0, 0, s * 25]);

  // windshield assembly
  tex(2.0, 0.64, WSHIELD, [0, 1.85, 1.0], [0, 0.63, 0.78]);
  for (const s of [1, -1]) {
    rod([s * 1.06, 1.6, 1.2], [s * 1.06, 2.08, 0.82], 0.05, P.hullDark);
    rod([s * 1.1, 1.6, -0.45], [s * 1.1, 2.0, -0.45], 0.05, P.hullDark);
  }
  rod([-1.0, 1.61, 1.2], [1.0, 1.61, 1.2], 0.04, P.armor);
  // cyan dash glow under glass
  glow(box(1.9, 0.02, 0.05, P.neonCyan, [0, 1.63, 1.17]), 1.4);

  // rear window
  tex(1.5, 0.3, WIN, [0, 1.82, -0.505], [0, 0, -1]);

  // side windows (visor slits) + B pillar
  const windows: any[] = [];
  for (const s of [1, -1]) {
    windows.push(tex(1.25, 0.31, WIN, [s * 1.103, 1.82, 0.15], [s, 0, 0]));
    box(0.06, 0.34, 0.08, P.hullDark, [s * 1.12, 1.82, 0.15]);
    // window brow plate
    box(0.06, 0.05, 1.35, P.armor, [s * 1.12, 1.99, 0.15]);
    box(0.06, 0.05, 1.35, P.armor, [s * 1.12, 1.64, 0.15]);
  }
  glow(windows, 0.7);

  // ---------- doors ----------
  const rivetGeos: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    box(0.04, 0.56, 1.55, HULL, [s * 1.22, 1.3, 0.3]);
    box(0.05, 0.56, 0.02, P.ink, [s * 1.22, 1.3, 0.38]);
    box(0.05, 0.02, 1.55, P.ink, [s * 1.22, 1.575, 0.3]);
    // handle
    box(0.05, 0.04, 0.2, P.metal, [s * 1.26, 1.5, -0.22]);
    box(0.04, 0.09, 0.03, P.metal, [s * 1.25, 1.5, -0.3]);
    // lower armor skirt
    box(0.06, 0.1, 1.6, P.armor, [s * 1.23, 1.06, 0.3]);
    // decals
    tex(0.5, 0.31, SKULL, [s * 1.243, 1.32, 0.78], [s, 0, 0]);
    tex(0.55, 0.22, STENCIL, [s * 1.243, 1.18, 0.1], [s, 0, 0]);
    tex(0.2, 0.2, CHEVRON, [s * 1.243, 1.38, -0.2], [s, 0, 0]);
    for (let z = -0.45; z <= 1.06; z += 0.15)
      for (const y of [1.04, 1.56])
        rivetGeos.push(new THREE.SphereGeometry(0.017, 5, 3).translate(s * 1.243, y, z));
    // mirrors + antennas
    rod([s * 1.15, 1.72, 0.88], [s * 1.42, 1.86, 0.92], 0.025, P.hullDark);
    box(0.06, 0.22, 0.2, P.hull, [s * 1.46, 1.87, 0.92], [0, 0, s * 8]);
    glow(box(0.01, 0.15, 0.15, P.neonCyan, [s * 1.425, 1.87, 0.92]), 0.8);
    rod([s * 1.42, 1.97, 0.88], [s * 1.46, 2.28, 0.84], 0.008, P.metal);
  }
  b.part(mergeGeometries(rivetGeos)!, P.metal, { bone, at: [0, 0, 0] });

  // ---------- hood ----------
  box(2.3, 0.5, 1.65, HOOD, [0, 1.3, 2.0], [SLOPE, 0, 0]);
  for (const s of [1, -1]) {
    box(0.3, 0.07, 1.5, P.hull, [s * 1.02, 1.54, 2.0], [SLOPE, 0, s * 14]);
    glow(rod([s * 1.18, 1.46, 1.28], [s * 1.18, 1.38, 2.8], 0.022, P.neonCyan), 1.3);
    // vents
    for (let i = 0; i < 5; i++) {
      const z = 1.55 + i * 0.12;
      box(0.5, 0.025, 0.05, P.ink, [s * 0.58, hoodTop(z) + 0.005, z], [SLOPE, 0, 0]);
    }
    // front fender cap
    box(0.1, 0.5, 0.2, P.hullDark, [s * 1.2, 1.3, 2.8]);
  }
  box(0.16, 0.07, 1.45, P.armor, [0, hoodTop(2.0) + 0.03, 2.0], [SLOPE, 0, 0]);
  box(0.5, 0.06, 0.4, P.hullDark, [0, hoodTop(1.5) + 0.03, 1.5], [SLOPE, 0, 0]);
  // hazard strip on hood lip
  tex(2.0, 0.14, HAZARD, [0, hoodTop(2.62) + 0.015, 2.62], [0, 1, 0.065]);
  // hood rear seam
  box(2.3, 0.02, 0.02, P.ink, [0, hoodTop(1.22) + 0.002, 1.22], [SLOPE, 0, 0]);

  // front fascia
  box(2.4, 0.55, 0.16, DARK, [0, 1.27, 2.82]);
  tex(1.4, 0.39, GRILLE, [0, 1.24, 2.905], [0, 0, 1]);
  glow(box(1.1, 0.05, 0.05, P.neonMagenta, [0, 1.55, 2.9]), 1.6); // light bar
  box(1.3, 0.04, 0.06, P.armor, [0, 1.52, 2.9]);
  for (const s of [1, -1]) {
    // headlight clusters
    box(0.48, 0.3, 0.1, P.ink, [s * 0.82, 1.28, 2.88]);
    glow(box(0.36, 0.2, 0.05, P.headlight, [s * 0.82, 1.28, 2.93]), 1.8);
    glow(box(0.36, 0.04, 0.05, P.neonCyan, [s * 0.82, 1.1, 2.93]), 1.4);
    for (let i = 0; i < 3; i++) box(0.34, 0.012, 0.03, P.ink, [s * 0.82, 1.22 + i * 0.06, 2.96]);
    // corner armor
    box(0.12, 0.55, 0.12, P.armor, [s * 1.2, 1.27, 2.86]);
  }

  // ---------- roof gear ----------
  // light rack
  rod([-0.95, 2.1, 0.62], [-0.95, 2.22, 0.62], 0.02, P.metal);
  rod([0.95, 2.1, 0.62], [0.95, 2.22, 0.62], 0.02, P.metal);
  rod([-0.95, 2.22, 0.62], [0.95, 2.22, 0.62], 0.025, P.hullDark);
  for (let i = 0; i < 5; i++) {
    const x = -0.72 + i * 0.36;
    box(0.2, 0.09, 0.08, P.hullDark, [x, 2.2, 0.66]);
    glow(box(0.16, 0.06, 0.03, i % 2 ? P.neonCyan : P.headlight, [x, 2.2, 0.71]), 1.6);
  }
  // sensor dome
  b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.05, 8), P.armor, { bone, at: [0, 2.12, -0.15] });
  b.part(new THREE.SphereGeometry(0.15, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.glass, {
    bone,
    at: [0, 2.14, -0.15],
  });
  glow(box(0.2, 0.012, 0.012, P.neonCyan, [0, 2.2, -0.04]), 1.5);
  // main antenna
  b.rod([-0.85, 2.1, -0.3], [-0.9, 2.3, -0.36], 0.012, P.metal, { bone });
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.tail, { bone, at: [-0.9, 2.3, -0.36] }), 2);
  // roof vents
  for (let i = 0; i < 4; i++) box(0.5, 0.015, 0.05, P.ink, [0.55, 2.11, -0.3 + i * 0.1]);
  // roof neon edge
  glow(box(2.2, 0.02, 0.02, P.neonMagenta, [0, 2.0, 0.86], [-39, 0, 0]), 1.2);

  // cab back wall / bed meet plate with neon
  box(2.4, 0.5, 0.06, DARK, [0, 1.3, -0.47]);
  glow(box(2.1, 0.02, 0.02, P.neonMagenta, [0, 1.58, -0.5]), 1.2);
}
    return buildCab;
  })(),
  // bed
  (() => {
function buildBed({ b, J, P }: Ctx) {
  const body = J.body;
  const R = rng(91);

  // ---------- textures ----------
  const chevSvg = (bg: string, fg: string) =>
    `<svg viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="40" fill="${bg}"/>` +
    Array.from({ length: 9 }, (_, i) => `<path d="M${i * 22 - 10} 40 L${i * 22 + 4} 0 L${i * 22 + 18} 0 L${i * 22 + 4} 40Z" fill="${fg}"/>`).join("") +
    `<rect width="160" height="40" fill="none" stroke="${fg}" stroke-width="3"/></svg>`;
  const CHEV = svg(chevSvg(P.trim, P.ink), { size: 256 });
  const stencil = (text: string, sub: string) =>
    svg(
      `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="124" height="60" rx="4" fill="none" stroke="#e7b814" stroke-width="3" stroke-dasharray="12 4"/>
       <text x="64" y="38" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#e7b814">${text}</text>
       <text x="64" y="55" text-anchor="middle" font-family="monospace" font-size="11" fill="#2ff3ff">${sub}</text></svg>`,
      { size: 256 },
    );
  const NUM = svg(
    `<svg viewBox="0 0 128 48" xmlns="http://www.w3.org/2000/svg"><text x="64" y="40" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="46" fill="#e8ecf2" stroke="#0a0a10" stroke-width="1">X-9</text></svg>`,
    { size: 256 },
  );
  const SKULL = svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
     <path d="M62 14 L8 4 L24 22 L4 26 L30 36 L18 50 L52 40Z" fill="#ff2fa8" stroke="#0a0a10" stroke-width="2"/>
     <path d="M66 14 L120 4 L104 22 L124 26 L98 36 L110 50 L76 40Z" fill="#ff2fa8" stroke="#0a0a10" stroke-width="2"/>
     <ellipse cx="64" cy="26" rx="15" ry="16" fill="#e8ecf2" stroke="#0a0a10" stroke-width="2"/>
     <rect x="54" y="38" width="20" height="12" rx="2" fill="#e8ecf2" stroke="#0a0a10" stroke-width="2"/>
     <ellipse cx="58" cy="26" rx="4.5" ry="5.5" fill="#0a0a10"/><ellipse cx="70" cy="26" rx="4.5" ry="5.5" fill="#0a0a10"/>
     <path d="M64 31 L62 36 L66 36Z" fill="#0a0a10"/><path d="M58 40v8M64 40v8M70 40v8" stroke="#0a0a10" stroke-width="1.5"/></svg>`,
    { size: 256 },
  );
  const WARN = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 4 L61 56 H3Z" fill="#e7b814" stroke="#0a0a10" stroke-width="4" stroke-linejoin="round"/>
     <rect x="29" y="22" width="6" height="18" fill="#0a0a10"/><rect x="29" y="44" width="6" height="6" fill="#0a0a10"/></svg>`,
    { size: 128 },
  );
  const GLOWBAR = svg(
    `<svg viewBox="0 0 128 16" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="16" fill="#0a0a10"/>` +
      Array.from({ length: 8 }, (_, i) => `<rect x="${i * 16 + 2}" y="2" width="12" height="12" rx="2" fill="${i % 2 ? "#2ff3ff" : "#fff6c4"}"/>`).join("") +
      `</svg>`,
    { size: 256 },
  );

  // ---------- paints ----------
  const WALL = panelled(
    paint((p, n) => {
      const base = mix(P.hull, P.armor, smoothstep(0.3, 0.8, noise(p, 0.25, 4)) * 0.6);
      const rustL = smoothstep(1.35, 1.05, p.y) * smoothstep(0.5, 0.75, noise(p, 0.1, 8));
      const c = mix(base, P.rust, rustL * 0.6);
      return mix(c, [1, 1, 1], 0.08 * Math.max(0, n.y));
    }),
    { size: 0.42, aspect: 0.8, rivets: 0.07 },
  );
  const PLATE = panelled(P.armor, { size: 0.3, aspect: 0.9, rivets: 0.06 });
  const FLOOR = paint((p) => mix(P.hullDark, P.hull, noise(p, 0.12, 3) * 0.7));

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, ...opts });
  const neon = (w: number, h: number, d: number, color: string, at: number[], k = 1.4) =>
    glow(box(w, h, d, color, at), k);
  const decal = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], bone: any = body) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });
  const mergeAt = (geos: THREE.BufferGeometry[], color: any, bone: any = body) =>
    b.part(mergeGeometries(geos)!, color, { bone, at: [0, 0, 0] });

  // ---------- floor ----------
  box(2.4, 0.1, 2.4, FLOOR, [0, 1.06, -1.72]);
  const ribs: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 11; i++) ribs.push(new THREE.BoxGeometry(2.1, 0.03, 0.06).translate(0, 1.125, -2.7 + i * 0.19));
  mergeAt(ribs, P.hullDark);
  // wheel-arch hump housings inside bed
  for (const s of [1, -1]) {
    box(0.4, 0.2, 0.95, PLATE, [s * 0.95, 1.2, -1.8]);
    box(0.4, 0.04, 0.95, P.trim, [s * 0.95, 1.31, -1.8]);
  }

  // ---------- side walls ----------
  for (const s of [1, -1]) {
    box(0.1, 0.66, 2.3, WALL, [s * 1.2, 1.38, -1.72]);
    // slanted armor cap
    box(0.2, 0.07, 2.4, PLATE, [s * 1.17, 1.74, -1.72], { rotation: [0, 0, s * -10] });
    neon(0.03, 0.03, 2.4, P.neonMagenta, [s * 1.26, 1.66, -1.72]);
    neon(0.03, 0.03, 2.4, P.neonMagenta, [s * 1.26, 1.1, -1.72], 1.1);
    // outer ribs/armor plates
    for (let i = 0; i < 3; i++) {
      box(0.05, 0.42, 0.62, PLATE, [s * 1.27, 1.4, -2.55 + i * 0.85], { rotation: [0, 0, 0] });
      box(0.06, 0.05, 0.62, P.trim, [s * 1.27, 1.2, -2.55 + i * 0.85]);
    }
    decal(stencil(s > 0 ? "07" : "09", "BED-LOAD"), 0.5, 0.25, [s * 1.3, 1.42, -2.0], [s, 0, 0]);
    // tie-down rings on inside of wall
    const rings: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 4; i++)
      rings.push(new THREE.TorusGeometry(0.05, 0.012, 5, 8).rotateY(Math.PI / 2).translate(s * 1.13, 1.5, -2.5 + i * 0.6));
    mergeAt(rings, P.metal);
    // rivets
    const rv: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 12; i++)
      for (const y of [1.17, 1.6]) rv.push(new THREE.SphereGeometry(0.014, 5, 3).translate(s * 1.253, y, -2.8 + i * 0.185));
    mergeAt(rv, P.metal);
  }

  // ---------- front wall (bulkhead against cab) ----------
  box(2.3, 1.05, 0.1, WALL, [0, 1.58, -0.62]);
  box(1.0, 0.5, 0.04, P.hullDark, [0, 1.6, -0.69]);
  const vents: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) vents.push(new THREE.BoxGeometry(0.8, 0.025, 0.02).translate(0, 1.42 + i * 0.07, -0.715));
  glow(mergeAt(vents, P.neonCyan), 0.9);
  decal(SKULL, 0.55, 0.28, [0.7, 1.7, -0.69], [0, 0, -1]);
  decal(WARN, 0.22, 0.22, [-0.8, 1.7, -0.69], [0, 0, -1]);

  // ---------- tailgate ----------
  box(2.3, 0.62, 0.09, WALL, [0, 1.38, -2.89]);
  box(2.4, 0.07, 0.14, PLATE, [0, 1.72, -2.88]);
  neon(2.3, 0.035, 0.03, P.neonMagenta, [0, 1.68, -2.97], 1.6);
  neon(0.035, 0.6, 0.03, P.neonCyan, [1.1, 1.38, -2.97]);
  neon(0.035, 0.6, 0.03, P.neonCyan, [-1.1, 1.38, -2.97]);
  decal(CHEV, 1.5, 0.3, [0, 1.46, -2.945], [0, 0, -1]);
  decal(NUM, 0.5, 0.19, [0, 1.2, -2.945], [0, 0, -1]);
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 6), P.metal, { bone: body, at: [s * 1.15, 1.1, -2.9], dir: [1, 0, 0] });
    box(0.12, 0.12, 0.06, P.trim, [s * 0.5, 1.7, -2.95]); // latches
    box(0.1, 0.55, 0.14, PLATE, [s * 1.22, 1.38, -2.86]); // corner posts
    glow(box(0.04, 0.1, 0.03, P.tail, [s * 1.22, 1.5, -2.95]), 1.2);
  }

  // ---------- roll bar & light bar ----------
  const RB = -0.8;
  for (const s of [1, -1]) {
    b.rod([s * 1.0, 1.08, RB], [s * 1.0, 2.15, RB], 0.04, P.metal, { bone: body, sides: 8 });
    b.rod([s * 1.0, 2.0, RB], [s * 1.0, 1.1, RB - 0.55], 0.03, P.metal, { bone: body, sides: 6 });
    box(0.16, 0.05, 0.16, P.trim, [s * 1.0, 1.1, RB]);
  }
  b.rod([1.0, 2.15, RB], [-1.0, 2.15, RB], 0.045, P.metal, { bone: body, sides: 8 });
  b.rod([0.9, 1.7, RB], [-0.9, 1.7, RB], 0.025, P.metal, { bone: body, sides: 6 });
  box(1.5, 0.1, 0.12, P.hullDark, [0, 2.24, RB - 0.04]);
  glow(
    b.part(new THREE.PlaneGeometry(1.4, 0.09), "#ffffff", { bone: body, at: [0, 2.24, RB - 0.105], dir: [0, 0, -1], axis: "z", texture: GLOWBAR }),
    1.3,
  );
  // stripes on bar
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) box(0.085, 0.07, 0.085, P.trim, [s * 1.0, 1.35 + i * 0.25, RB]);

  // ---------- crates & ammo boxes ----------
  box(0.7, 0.46, 0.62, PLATE, [0.7, 1.34, -1.1]);
  for (const x of [0.4, 1.0]) box(0.05, 0.48, 0.64, P.trim, [x, 1.34, -1.1]);
  decal(stencil("MED", "UNIT-3"), 0.5, 0.25, [0.7, 1.34, -0.785], [0, 0, 1]);
  decal(WARN, 0.2, 0.2, [0.7, 1.58, -1.1], [0, 1, 0]);
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", { bone: body, at: [0.7, 1.575, -1.1], dir: [0, 1, 0], axis: "z", texture: WARN });
  box(0.5, 0.26, 0.36, P.hullDark, [-0.72, 1.23, -1.0]);
  box(0.5, 0.26, 0.36, P.hullDark, [-0.72, 1.49, -1.0], { rotation: [0, 8, 0] });
  decal(stencil("AMMO", "7.62 HV"), 0.34, 0.17, [-0.72, 1.23, -0.815], [0, 0, 1]);
  for (const y of [1.23, 1.49]) {
    box(0.04, 0.05, 0.38, P.metal, [-0.55, y + 0.1, -1.0]);
    box(0.04, 0.05, 0.38, P.metal, [-0.89, y + 0.1, -1.0]);
  }
  // strap across crate
  b.rod([0.55, 1.58, -1.43], [0.55, 1.58, -0.77], 0.012, P.rubber, { bone: body });
  // long case on floor
  box(0.9, 0.2, 0.3, P.armor, [0.35, 1.2, -2.4]);
  box(0.92, 0.04, 0.12, P.trim, [0.35, 1.31, -2.4]);
  decal(stencil("RPG", "CASE"), 0.4, 0.2, [0.35, 1.31, -2.4], [0, 1, 0]);

  // ---------- fuel canister rack ----------
  const RX = -0.85;
  b.rod([RX - 0.25, 1.1, -2.62], [RX - 0.25, 1.75, -2.62], 0.025, P.metal, { bone: body, sides: 6 });
  b.rod([RX + 0.25, 1.1, -2.62], [RX + 0.25, 1.75, -2.62], 0.025, P.metal, { bone: body, sides: 6 });
  b.rod([RX - 0.25, 1.62, -2.62], [RX + 0.25, 1.62, -2.62], 0.02, P.metal, { bone: body, sides: 6 });
  b.rod([RX - 0.25, 1.28, -2.62], [RX + 0.25, 1.28, -2.62], 0.02, P.metal, { bone: body, sides: 6 });
  for (let i = 0; i < 2; i++) {
    const cx = RX - 0.12 + i * 0.24;
    box(0.2, 0.5, 0.14, P.rust, [cx, 1.4, -2.62]);
    box(0.17, 0.05, 0.1, P.trim, [cx - 0.04, 1.67, -2.62]);
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), P.metal, { bone: body, at: [cx + 0.05, 1.67, -2.62] });
    box(0.2, 0.03, 0.15, P.ink, [cx, 1.46, -2.62]);
  }

  // ---------- antenna whip + flag ----------
  const A0: number[] = [1.08, 1.7, -2.8];
  const A1: number[] = [1.1, 2.28, -2.86];
  b.part(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 6), P.metal, { bone: body, at: [1.08, 1.72, -2.8] });
  b.sweep(catmull([A0, [1.085, 1.95, -2.82], A1]), [0.014, 0.004], { bone: body, color: P.metal, caps: { end: "point" } });
  glow(b.part(new THREE.SphereGeometry(0.018, 5, 4), P.neonCyan, { bone: body, at: A1 }), 1.6);
  b.extrude(
    [
      [0, 0],
      [0.32, 0.03],
      [0.26, 0.1],
      [0.32, 0.17],
      [0, 0.17],
    ],
    { at: [1.1, 2.1, -2.86], x: [0, 0, -1], thickness: 0.008, color: P.neonMagenta, bone: body },
  );

  // ---------- gun turret ----------
  const GX = 0, GZ = -1.4;
  // fixed pedestal on body
  b.part(new THREE.CylinderGeometry(0.2, 0.28, 0.5, 8), PLATE, { bone: body, at: [GX, 1.35, GZ] });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    b.rod([Math.sin(a) * 0.5, 1.08, GZ + Math.cos(a) * 0.5], [Math.sin(a) * 0.16, 1.55, GZ + Math.cos(a) * 0.16], 0.025, P.metal, { bone: body, sides: 6 });
  }
  // rotating ring base
  const gb = J.gunBase;
  b.part(new THREE.CylinderGeometry(0.4, 0.42, 0.1, 10), P.hullDark, { bone: gb, at: [GX, 1.65, GZ] });
  glow(b.part(new THREE.TorusGeometry(0.4, 0.016, 4, 20).rotateX(Math.PI / 2), P.neonCyan, { bone: gb, at: [GX, 1.71, GZ] }), 1.5);
  b.part(new THREE.CylinderGeometry(0.28, 0.32, 0.12, 8), PLATE, { bone: gb, at: [GX, 1.77, GZ] });
  // yoke cheeks
  for (const s of [1, -1]) {
    box(0.07, 0.32, 0.42, PLATE, [s * 0.24, 1.97, GZ], { bone: gb });
    box(0.075, 0.08, 0.1, P.trim, [s * 0.24, 2.1, GZ - 0.12], { bone: gb });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 6), P.metal, { bone: gb, at: [s * 0.29, 1.95, GZ], dir: [1, 0, 0] });
  }
  // barrel assembly
  const gbar = J.gunBarrel;
  box(0.34, 0.24, 0.5, P.hull, [0, 1.95, GZ - 0.05], { bone: gbar });
  box(0.36, 0.06, 0.3, P.trim, [0, 2.1, GZ - 0.05], { bone: gbar });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 8), P.armor, { bone: gbar, at: [s * 0.1, 1.95, GZ + 0.3], dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.035, 0.04, 0.8, 6), P.metal, { bone: gbar, at: [s * 0.1, 1.95, GZ + 0.45], dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 6), P.hullDark, { bone: gbar, at: [s * 0.1, 1.95, GZ + 0.78], dir: [0, 0, 1] });
    glow(b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), P.neonCyan, { bone: gbar, at: [s * 0.1, 1.95, GZ + 0.85], dir: [0, 0, 1] }), 2);
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 6), P.hullDark, { bone: gbar, at: [s * 0.1, 1.95, GZ - 0.36], dir: [0, 0, 1] });
  }
  // ammo box and belt
  box(0.22, 0.24, 0.3, P.armor, [0.36, 1.85, GZ - 0.05], { bone: gbar });
  box(0.23, 0.04, 0.31, P.trim, [0.36, 1.98, GZ - 0.05], { bone: gbar });
  b.sweep(catmull([[0.3, 1.95, GZ - 0.05], [0.24, 2.0, GZ - 0.02], [0.18, 2.0, GZ + 0.02], [0.14, 1.98, GZ + 0.05]]), 0.012, {
    bone: gbar,
    color: P.trim,
  });
  const rounds: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 5; i++) rounds.push(new THREE.SphereGeometry(0.018, 4, 3).translate(0.3 - i * 0.04, 1.97 + 0.02 * Math.sin(i), GZ - 0.05 + i * 0.02));
  b.part(mergeGeometries(rounds)!, P.metal, { bone: gbar, at: [0, 0, 0] });
  // sight
  box(0.08, 0.08, 0.14, P.glass, [-0.22, 2.1, GZ + 0.05], { bone: gbar });
  glow(box(0.06, 0.03, 0.01, P.neonCyan, [-0.22, 2.1, GZ + 0.125], { bone: gbar }), 1.5);
  R();
}
    return buildBed;
  })(),
  // thrusters
  (() => {
function buildThrusters({ b, J, P, M }: Ctx) {
  const DISC = svg(
    `<svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="#2ff3ff" opacity="0.55"/>
     <circle cx="64" cy="64" r="60" fill="none" stroke="#2ff3ff" stroke-width="5"/>
     <circle cx="64" cy="64" r="42" fill="none" stroke="#c9ffff" stroke-width="4"/>
     <circle cx="64" cy="64" r="22" fill="#ff2fa8" opacity="0.75"/>
     <path d="M64 6V30M64 98V122M6 64H30M98 64H122" stroke="#ffffff" stroke-width="4"/></svg>`,
    { size: 128 },
  );
  const SHIMMER = svg(
    `<svg viewBox="0 0 64 96"><path d="M14 96 Q4 72 14 50 Q24 28 14 4" stroke="#2ff3ff" stroke-width="5" fill="none" stroke-linecap="round"/>
     <path d="M34 96 Q26 74 34 56 Q44 36 34 12" stroke="#c9ffff" stroke-width="4" fill="none" stroke-linecap="round"/>
     <path d="M52 96 Q44 78 52 58 Q60 40 52 20" stroke="#2ff3ff" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const HAZARD = stripes(P.trim, P.ink, { size: 0.07, axis: [1, 1, 0], width: 0.5, wobble: 0.02 });
  const HOUSING = paint((p, n) => {
    const base = P.hull;
    return n.y < -0.5 ? P.hullDark : base;
  });
  const r = rng(11);

  const names = ["thrusterFL", "thrusterFR", "thrusterRL", "thrusterRR"];
  for (const name of names) {
    const bone = J[name];
    const [mx, , mz] = M[name];
    const s = mx > 0 ? 1 : -1;

    // mount strut and bracing
    b.part(new THREE.BoxGeometry(0.22, 0.36, 0.26), P.armor, { bone, at: [mx, 0.68, mz], flat: true });
    b.part(new THREE.BoxGeometry(0.5, 0.06, 0.1), P.hullDark, { bone, at: [mx - s * 0.1, 0.78, mz], flat: true });
    for (const dz of [1, -1]) {
      b.rod([mx, 0.72, mz], [mx - s * 0.12, 0.9, mz + dz * 0.3], 0.025, P.metal, { bone, sides: 4 });
      b.rod([mx + s * 0.28, 0.5, mz + dz * 0.1], [mx + s * 0.08, 0.8, mz + dz * 0.12], 0.02, P.metal, { bone, sides: 4 });
    }

    // fan housing
    b.part(new THREE.CylinderGeometry(0.31, 0.27, 0.4, 8), HOUSING, { bone, at: [mx, 0.52, mz], flat: true });
    b.part(new THREE.CylinderGeometry(0.325, 0.325, 0.07, 8), HAZARD, { bone, at: [mx, 0.6, mz], flat: true });
    b.part(new THREE.CylinderGeometry(0.28, 0.33, 0.06, 8), P.armor, { bone, at: [mx, 0.73, mz], flat: true });
    // intake dark cap with vents
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 8), P.ink, { bone, at: [mx, 0.77, mz], flat: true });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(0.2, 0.012, 0.012), P.metal, {
        bone, at: [mx + Math.cos(a) * 0.0, 0.785, mz], rotation: [0, (a * 180) / Math.PI, 0],
      });
    }
    // side exhaust vents
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.BoxGeometry(0.12, 0.025, 0.02), P.ink, { bone, at: [mx + s * 0.3, 0.42 + k * 0.05, mz + 0.1], dir: [s, 0, 0], flat: true });
      b.part(new THREE.BoxGeometry(0.12, 0.025, 0.02), P.ink, { bone, at: [mx + s * 0.3, 0.42 + k * 0.05, mz - 0.1], dir: [s, 0, 0], flat: true });
    }

    // nozzle bell
    b.lathe(
      [[0.2, 0.32], [0.27, 0.3], [0.27, 0.1], [0.25, 0.0], [0.2, 0.0], [0.2, 0.1], [0.22, 0.28]],
      { at: [mx, 0, mz], segments: 8, color: P.hullDark, bone },
    );
    // glowing cyan ring at the lip
    glow(b.part(new THREE.TorusGeometry(0.225, 0.022, 4, 12), P.neonCyan, { bone, at: [mx, 0.03, mz], dir: [0, 1, 0], axis: "z" }), 1.6);
    glow(b.part(new THREE.TorusGeometry(0.27, 0.016, 4, 12), P.neonCyan, { bone, at: [mx, 0.2, mz], dir: [0, 1, 0], axis: "z" }), 1.3);
    // turbine
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 6), P.metal, { bone, at: [mx, 0.2, mz], flat: true });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + r() * 0.02;
      const rad: [number, number, number] = [Math.cos(a), 0, Math.sin(a)];
      const tan: [number, number, number] = [-Math.sin(a), 0, Math.cos(a)];
      b.extrude([[0.03, -0.02], [0.2, -0.05], [0.2, 0.04], [0.03, 0.025]], {
        at: [mx, 0.14, mz], x: rad, y: tan, thickness: 0.012, color: P.metal, bone,
      });
    }
    // magenta core
    glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), P.neonMagenta, { bone, at: [mx, 0.12, mz] }), 1.8);

    // stabilizer fins
    for (const dz of [1, -1]) {
      b.extrude([[0, 0], [0.22, 0], [0.04, -0.18, "sharp"]], {
        at: [mx + s * 0.29, 0.4, mz + dz * 0.0], x: [0, 0, dz], y: [0, 1, 0], thickness: 0.03, color: P.armor, bone,
      });
    }
    // fin yellow tip
    b.part(new THREE.BoxGeometry(0.03, 0.04, 0.12), P.trim, { bone, at: [mx + s * 0.31, 0.38, mz + 0.12], flat: true });
    b.part(new THREE.BoxGeometry(0.03, 0.04, 0.12), P.trim, { bone, at: [mx + s * 0.31, 0.38, mz - 0.12], flat: true });

    // glow disc on floor (both faces)
    const plane = new THREE.PlaneGeometry(1.0, 1.0);
    glow(b.part(plane, "#ffffff", { bone, at: [mx, 0.004, mz], dir: [0, 1, 0], axis: "z", texture: DISC }), 1.2);
    glow(b.part(plane, "#ffffff", { bone, at: [mx, 0.003, mz], dir: [0, -1, 0], axis: "z", texture: DISC }), 1.2);

    // heat shimmer cards rising under pod
    glow(
      b.cards([frame([mx, 0.0, mz], [0, 1, 0])], SHIMMER, { size: [0.5, 0.35], cross: true, lean: 0, bone, flow: [0, 0, 1] }),
      0.8,
    );
  }
}
    return buildThrusters;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "hoverPickup" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,0.9,0], dir: [0,0,1], role: "spine" });
  J["thrusterFL"] = b.joint("thrusterFL", { parent: J["body"], at: [1,0.55,1.95], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterFR"] = b.joint("thrusterFR", { parent: J["body"], at: [-1,0.55,1.95], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterRL"] = b.joint("thrusterRL", { parent: J["body"], at: [1,0.55,-1.8], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterRR"] = b.joint("thrusterRR", { parent: J["body"], at: [-1,0.55,-1.8], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["gunBase"] = b.joint("gunBase", { parent: J["body"], at: [0,1.65,-1.4], dir: [0,1,0], role: "hinge", group: "gun" });
  J["gunBarrel"] = b.joint("gunBarrel", { parent: J["gunBase"], at: [0,1.95,-1.4], dir: [0,0,1], role: "hinge", group: "gun" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
