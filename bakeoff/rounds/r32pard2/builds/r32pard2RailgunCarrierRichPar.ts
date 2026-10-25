import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, rng, noise, mix, smoothstep, stripes, catmull, mottle } from "../../../../src/index";
import { panelled, metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Longspear Railgun Carrier",
  "description": "A six-wheeled low-poly sci-fi military carrier with a long electromagnetic railgun on its roof, braced on four deployed hydraulic stabiliser legs."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#4a5240",
  hullDark: "#2b3029",
  armor: "#5d6650",
  trim: "#e7b814",
  steel: "#8a919c",
  gunmetal: "#3a3f48",
  rubber: "#16181b",
  glass: "#1c3b4a",
  neonCyan: "#2ff3ff",
  warnRed: "#d62f2f",
  white: "#e8eaec",
  rust: "#7a4a2a",
};
const M = {
  hullTop: [0, 2, 0] as [number, number, number],
  cabRoof: [0, 2.45, 2.6] as [number, number, number],
  gunCradle: [0, 2.35, -1.6] as [number, number, number],
  gunMuzzle: [0, 2.9, 5.2] as [number, number, number],
  gunBreech: [0, 2.55, -3.4] as [number, number, number],
  axleFront: [0, 0.7, 2.9] as [number, number, number],
  axleMid: [0, 0.7, 0] as [number, number, number],
  axleRear: [0, 0.7, -2.9] as [number, number, number],
  legAnchorMidL: [1.3, 1, 0] as [number, number, number],
  legAnchorRearL: [1.3, 1, -3.6] as [number, number, number],
  mastBase: [0.8, 2.45, 2.2] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // hull
  (() => {
function buildHull({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const body = J.body;

  // ---------- helpers ----------
  const box = (s: number[], at: number[], c: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), c, { bone: body, at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, at: number[], c: any, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: body, at, ...o });
  const decal = (w: number, h: number, at: number[], dir: number[], tex: any, o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: body, at, dir, axis: "z", texture: tex, ...o });

  // ---------- paints ----------
  const camo = panelled(
    paint((p, n, s) => {
      const m = Math.sin(p.x * 2.1 + p.z * 1.3) * Math.sin(p.z * 0.9 - p.y * 2.7);
      return m > 0.25 ? P.armor : P.hull;
    }),
    { size: 0.5, aspect: 0.8, rivets: 0.12, seam: P.hullDark },
  );
  const hullPaint = paint((p, n) => {
    if (n.y < -0.4) return P.hullDark;
    if (n.y > 0.5) return countershadeTop(p);
    return camo.at(p, n);
  });
  function countershadeTop(p: THREE.Vector3): any {
    const t = 0.5 + 0.5 * Math.sin(p.z * 3.2) * Math.sin(p.x * 4.1);
    return t > 0.8 ? P.armor : P.hull;
  }
  const skirtPaint = panelled(P.armor, { size: 0.4, aspect: 0.5, rivets: 0.1, seam: P.hullDark });
  const plate = panelled(P.hullDark, { size: 0.35, aspect: 0.6, rivets: 0.1, seam: "#101210" });
  const steelP = metal("steel", { tarnish: 0.3 });

  // ---------- textures ----------
  const hazard = svg(
    `<svg viewBox="0 0 64 8" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="8" fill="#e7b814"/>
    ${Array.from({ length: 12 }, (_, i) => `<polygon points="${i * 8 - 4},8 ${i * 8},0 ${i * 8 + 4},0 ${i * 8},8" fill="#16181b"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const hatchTex = (num: string) =>
    svg(
      `<svg viewBox="0 0 100 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="96" height="60" rx="3" fill="#3a4034" stroke="#16181b" stroke-width="3"/>
      <rect x="8" y="8" width="84" height="48" fill="none" stroke="#e7b814" stroke-width="2" stroke-dasharray="8 4"/>
      <text x="50" y="40" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#e8eaec">${num}</text>
      <rect x="84" y="26" width="8" height="12" fill="#16181b"/>
      <polygon points="14,20 22,8 30,20" fill="#e7b814" stroke="#16181b" stroke-width="1"/><rect x="21" y="12" width="2" height="5" fill="#16181b"/>
      </svg>`,
      { size: 256 },
    );
  const rearTex = svg(
    `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="96" height="66" rx="4" fill="#2b3029" stroke="#16181b" stroke-width="3"/>
    <path d="M10 10 H90 M10 60 H90" stroke="#e7b814" stroke-width="4"/>
    <path d="M50 12 V58" stroke="#16181b" stroke-width="2"/>
    <circle cx="44" cy="35" r="3" fill="#8a919c"/><circle cx="56" cy="35" r="3" fill="#8a919c"/>
    <polygon points="30,48 38,32 46,48" fill="#d62f2f"/><text x="72" y="46" text-anchor="middle" font-family="monospace" font-size="14" font-weight="bold" fill="#e8eaec">CARGO</text>
    </svg>`,
    { size: 256 },
  );
  const T7 = hatchTex("07");
  const T12 = hatchTex("L-12");
  const starTex = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="29" fill="none" stroke="#e8eaec" stroke-width="4"/><polygon points="32,10 38,26 55,26 41,36 46,52 32,42 18,52 23,36 9,26 26,26" fill="#e8eaec"/></svg>`,
    { size: 128 },
  );

  // ---------- main hull loft ----------
  b.loft(
    [
      { at: [0, 1.5, -4.4], w: 2.3, h: 1.0 },
      { at: [0, 1.5, -2.0], w: 2.3, h: 1.0 },
      { at: [0, 1.5, 2.0], w: 2.3, h: 1.0 },
      { at: [0, 1.38, 3.5], w: 2.1, h: 0.76 },
      { at: [0, 1.2, 4.15], w: 1.7, h: 0.4 },
    ],
    { bone: body, color: hullPaint, name: "hullLoft" },
  );

  // underbody tub and skid
  box([1.9, 0.3, 7.4], [0, 0.9, 0], P.hullDark, { name: "tub" });
  box([1.4, 0.12, 6.4], [0, 0.78, 0], plate);
  // axle housings reaching to axle mounts
  for (const z of [M.axleFront[2], M.axleMid[2], M.axleRear[2]]) {
    box([2.4, 0.26, 0.5], [0, 0.75, z], P.gunmetal);
    for (const s of [1, -1]) {
      cyl(0.17, 0.17, 0.5, 8, [s * 1.0, 0.7, z], steelP, { rotation: [0, 0, 90] });
      cyl(0.22, 0.22, 0.18, 8, [s * 1.12, 0.7, z], P.gunmetal, { rotation: [0, 0, 90] });
    }
  }

  // ---------- skirts, glow strips ----------
  for (const s of [1, -1]) {
    for (const z of [1.45, -1.45]) {
      box([0.14, 0.4, 1.3], [s * 1.25, 1.05, z], skirtPaint);
      glow(box([0.03, 0.05, 1.0], [s * 1.33, 1.05, z], P.neonCyan), 1.4);
      b.part(new THREE.PlaneGeometry(1.2, 0.1), "#ffffff", {
        bone: body, at: [s * 1.33, 0.88, z], dir: [s, 0, 0], axis: "z", texture: hazard,
      });
    }
    // rear skirt between rear wheel and tail
    box([0.14, 0.4, 1.3], [s * 1.25, 1.05, -3.85], skirtPaint);
    // side hatches
    box([0.08, 0.8, 1.2], [s * 1.19, 1.6, -1.45], P.hullDark);
    decal(1.1, 0.7, [s * 1.236, 1.6, -1.45], [s, 0, 0], T7);
    box([0.08, 0.7, 1.0], [s * 1.19, 1.55, 1.5], P.hullDark);
    decal(0.95, 0.6, [s * 1.236, 1.55, 1.5], [s, 0, 0], T12);
    // star roundel on skirt side
    decal(0.4, 0.4, [s * 1.236, 1.65, -3.2], [s, 0, 0], starTex);
    // leg anchor pads
    for (const z of [M.legAnchorMidL[2], M.legAnchorRearL[2]]) {
      box([0.22, 0.55, 0.8], [s * 1.26, 1.08, z], P.gunmetal);
      box([0.1, 0.4, 0.6], [s * 1.38, 1.08, z], P.trim);
      for (const dz of [-0.28, 0.28]) cyl(0.04, 0.04, 0.05, 6, [s * 1.45, 1.2, z + dz], P.steel, { rotation: [0, 0, 90] });
    }
    // chamfer strips on hull top edges
    box([0.2, 0.2, 5.6], [s * 1.12, 2.0, -1.2], P.armor, { rotation: [0, 0, 45] });
    // cab chamfers and window
    box([0.2, 0.2, 1.8], [s * 1.0, 2.5, 2.5], P.hull, { rotation: [0, 0, 45] });
    box([0.04, 0.3, 1.1], [s * 1.0, 2.25, 2.5], P.glass, { name: "sideWindow" });
    box([0.05, 0.34, 0.06], [s * 1.0, 2.25, 2.0], P.hullDark);
    // headlights + bumper lights
    glow(box([0.32, 0.16, 0.08], [s * 0.65, 1.22, 4.2], P.white), 1.6);
    box([0.4, 0.24, 0.05], [s * 0.65, 1.22, 4.17], P.hullDark);
    glow(box([0.08, 0.06, 0.06], [s * 0.88, 1.5, 3.98], P.warnRed, { rotation: [-20, 0, 0] }), 1);
    // exhaust stacks
    cyl(0.1, 0.12, 0.8, 8, [s * 1.0, 2.4, -4.0], P.gunmetal);
    cyl(0.14, 0.14, 0.08, 8, [s * 1.0, 2.8, -4.0], P.rust);
    cyl(0.07, 0.07, 0.02, 8, [s * 1.0, 2.84, -4.0], P.rubber);
    for (const dy of [0.0, 0.3]) cyl(0.135, 0.135, 0.05, 8, [s * 1.0, 2.2 + dy, -4.0], P.steel);
    // fender-mount mud brackets at front corner
    box([0.2, 0.15, 0.3], [s * 1.0, 1.15, 4.0], P.armor);
  }

  // ---------- deck, steps ----------
  box([2.1, 0.12, 3.8], [0, 2.06, -2.4], P.armor, { name: "rearDeck" });
  box([1.9, 0.1, 2.0], [0, 2.05, 0.5], plate);
  // vents on deck
  for (let i = 0; i < 5; i++) {
    box([0.7, 0.04, 0.05], [0.0, 2.12, 0.0 + i * 0.1 + 0.2], P.rubber);
  }
  for (const s of [1, -1]) {
    box([0.35, 0.06, 0.45], [s * 0.7, 2.11, 0.8], P.gunmetal);
    box([0.25, 0.02, 0.05], [s * 0.7, 2.15, 0.8], P.rubber);
  }
  // gun cradle seat
  cyl(0.9, 1.0, 0.3, 8, [M.gunCradle[0], 2.2, M.gunCradle[2]], P.gunmetal, { name: "cradleSeat" });
  glow(cyl(0.93, 0.93, 0.04, 8, [0, 2.31, M.gunCradle[2]], P.neonCyan), 1.2);
  cyl(0.8, 0.85, 0.06, 8, [0, 2.34, M.gunCradle[2]], P.steel);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    cyl(0.04, 0.04, 0.06, 6, [Math.sin(a) * 0.95, 2.37, M.gunCradle[2] + Math.cos(a) * 0.95], P.steel);
  }

  // ---------- cab ----------
  box([2.0, 0.6, 1.9], [0, 2.2, 2.5], hullPaint, { name: "cab" });
  box([1.7, 0.1, 1.5], [0, 2.52, 2.4], P.armor);
  // windscreen slabs
  box([1.8, 0.44, 0.07], [0, 2.25, 3.47], P.glass, { rotation: [-32, 0, 0], name: "windscreen" });
  box([1.9, 0.08, 0.09], [0, 2.46, 3.38], P.hullDark, { rotation: [-32, 0, 0] });
  box([0.07, 0.42, 0.09], [0, 2.25, 3.47], P.hullDark, { rotation: [-32, 0, 0] });
  // rear cab window
  box([1.2, 0.3, 0.04], [0, 2.3, 1.54], P.glass);
  // roof hatch
  cyl(0.28, 0.3, 0.07, 8, [-0.45, 2.6, 2.1], P.gunmetal);
  cyl(0.08, 0.08, 0.05, 6, [-0.45, 2.65, 2.1], P.steel);
  // sensor wing on cab front
  box([0.3, 0.12, 0.2], [-0.5, 2.6, 3.0], P.gunmetal);
  glow(box([0.2, 0.04, 0.02], [-0.5, 2.6, 3.11], P.neonCyan), 1.5);

  // ---------- bumper / tow hook / nose ----------
  box([2.0, 0.3, 0.16], [0, 1.0, 4.18], P.gunmetal, { name: "bumper" });
  decal(1.9, 0.2, [0, 1.0, 4.27], [0, 0, 1], hazard);
  const hook = b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8, Math.PI * 1.5), P.steel, {
    bone: body, at: [0, 0.85, 4.3],
  });
  box([0.16, 0.16, 0.2], [0, 0.88, 4.25], P.steel);
  // nose armour wedge detail
  box([1.5, 0.06, 0.8], [0, 1.52, 3.85], P.armor, { rotation: [14, 0, 0] });
  glow(box([1.3, 0.04, 0.03], [0, 1.32, 4.33], P.neonCyan), 1.4);
  // tow eyes
  for (const s of [1, -1]) cyl(0.06, 0.06, 0.2, 6, [s * 0.9, 0.95, 4.28], P.trim, { rotation: [90, 0, 0] });

  // ---------- rear ----------
  box([1.5, 0.95, 0.06], [0, 1.5, -4.43], P.hullDark);
  decal(1.4, 0.9, [0, 1.5, -4.47], [0, 0, -1], rearTex);
  box([2.2, 0.12, 0.12], [0, 1.05, -4.45], P.gunmetal);
  for (const s of [1, -1]) {
    glow(box([0.2, 0.1, 0.05], [s * 0.9, 1.9, -4.43], P.warnRed), 1.2);
    cyl(0.07, 0.07, 0.15, 6, [s * 0.5, 0.85, -4.4], P.steel, { rotation: [90, 0, 0] });
  }

  // ---------- roof glow lines ----------
  for (const s of [1, -1]) {
    glow(box([0.04, 0.03, 2.4], [s * 0.88, 2.12, -2.4], P.neonCyan), 1.3);
    glow(box([0.03, 0.03, 1.4], [s * 0.4, 2.1, 0.5], P.neonCyan), 1.1);
  }

  // ---------- mast (joint mast at mastBase) ----------
  const mb = J.mast;
  b.part(new THREE.CylinderGeometry(0.13, 0.16, 0.12, 8), P.gunmetal, { bone: mb, at: [0.8, 2.56, 2.2] });
  b.part(new THREE.CylinderGeometry(0.035, 0.045, 0.85, 6), P.steel, { bone: mb, at: [0.8, 2.97 - 0.12, 2.2] });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 6), P.gunmetal, { bone: mb, at: [0.8, 2.78, 2.2] });
  // radar dish
  b.part(new THREE.ConeGeometry(0.26, 0.1, 8, 1, true), P.armor, {
    bone: mb, at: [0.8, 2.72, 2.2], rotation: [-100, 0, 0], flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 5), P.steel, { bone: mb, at: [0.8, 2.78, 2.33], rotation: [90, 0, 0] });
  glow(b.part(new THREE.BoxGeometry(0.06, 0.06, 0.06), P.warnRed, { bone: mb, at: [0.8, 2.95, 2.2] }), 2);
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 4), P.steel, { bone: mb, at: [0.88, 2.85, 2.1] });
  glow(b.part(new THREE.SphereGeometry(0.025, 5, 4), P.neonCyan, { bone: mb, at: [0.88, 3.0, 2.1] }), 1.5);
  void R; void hook;
}
    return buildHull;
  })(),
  // wheels
  (() => {
function buildWheels({ b, J, P, M }: any) {
  const R = 0.7, W = 0.6;
  const RUBBER_P = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const v = noise(p, 0.12, 3);
    const c = mix("#101215", "#24272c", v);
    const mud = smoothstep(0.35, 0.0, p.y) * smoothstep(0.4, 0.7, noise(p, 0.2, 9));
    return mix(c, "#4a3a2a", mud * 0.5);
  });
  const FENDER = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const v = noise(p, 0.25, 5);
    const c = mix(P.hull, P.armor, smoothstep(0.35, 0.65, v));
    return mix(c, P.hullDark, smoothstep(0.3, -0.8, n.y) * 0.5);
  });
  const STENCIL = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#1c3b4a" stroke="#2ff3ff" stroke-width="5"/><circle cx="32" cy="32" r="12" fill="#2ff3ff"/></svg>`, { size: 64 });
  const HAZ = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/><path d="M0 16L16 0H32L16 16ZM32 16L48 0H64L48 16Z" fill="#16181b"/></svg>`, { size: 128 });

  const names: Record<string, [number, number]> = {
    wheelFL: [1, 2.9], wheelFR: [-1, 2.9], wheelML: [1, 0], wheelMR: [-1, 0], wheelRL: [1, -2.9], wheelRR: [-1, -2.9],
  };

  for (const key of Object.keys(names)) {
    const [s, z] = names[key];
    const j = J[key];
    const X = s * 1.45;
    const at = (dx: number, y = 0.7, dz = 0): [number, number, number] => [X + s * dx, y, z + dz];
    const dir: [number, number, number] = [s, 0, 0];
    const part = (g: THREE.BufferGeometry, c: any, o: any) => b.part(g, c, { bone: j, ...o });

    // tyre: lathe profile (x = radius from axle, y = along axle)
    const hw = W / 2;
    b.lathe(
      [[0.3, -hw], [R - 0.12, -hw], [R - 0.02, -hw + 0.08], [R, -hw + 0.16], [R, hw - 0.16], [R - 0.02, hw - 0.08], [R - 0.12, hw], [0.3, hw]],
      { at: at(0), axis: dir, segments: 12, bone: j, color: RUBBER_P },
    );
    // tread blocks
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
      const y = 0.7 + Math.sin(a) * (R + 0.02), zz = z + Math.cos(a) * (R + 0.02);
      part(new THREE.BoxGeometry(W * 0.9, 0.08, 0.2), "#16181b", { at: [X, y, zz], rotation: [(a * 180) / Math.PI, 0, 0] });
    }
    // rim ring + steel hub
    b.lathe([[0.22, -0.05], [0.42, -0.05], [0.42, 0.05], [0.22, 0.05]], { at: at(0.28), axis: dir, segments: 12, bone: j, color: P.gunmetal });
    part(new THREE.CylinderGeometry(0.2, 0.22, 0.12, 12), P.steel, { at: at(0.3), dir });
    part(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 10), P.gunmetal, { at: at(0.35), dir });
    // lug nuts
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), P.steel, { at: [X + s * 0.33, 0.7 + Math.sin(a) * 0.15, z + Math.cos(a) * 0.15], dir });
    }
    // cyan hub light
    glow(part(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8), P.neonCyan, { at: at(0.37), dir }), 1.5);
    // axle shaft + brake disc
    part(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 8), P.steel, { at: [s * 1.2 + s * 0.0 + s * 0.0 + (X - s * 1.2) * -0.0 + s * 0.0 + s * 0.0 + s * 0.0 + 0, 0.7, z].map((v, i) => (i === 0 ? s * 1.2 : v)) as any, dir });
    part(new THREE.CylinderGeometry(0.34, 0.34, 0.04, 12), P.gunmetal, { at: [s * 1.2, 0.7, z], dir });
    // fender arch: top slab, outer lip, front/back cheeks
    const fx = X;
    part(new THREE.BoxGeometry(W + 0.2, 0.1, 1.3), FENDER, { at: [fx, 1.52, z] });
    part(new THREE.BoxGeometry(W + 0.2, 0.1, 0.5), FENDER, { at: [fx, 1.4, z + 0.55], rotation: [-35, 0, 0] });
    part(new THREE.BoxGeometry(W + 0.2, 0.1, 0.5), FENDER, { at: [fx, 1.4, z - 0.55], rotation: [35, 0, 0] });
    part(new THREE.BoxGeometry(0.08, 0.22, 1.3), P.hullDark, { at: [fx + s * (W / 2 + 0.1), 1.45, z] });
    // hazard trim on fender edge
    part(new THREE.PlaneGeometry(1.2, 0.08), "#ffffff", { at: [fx + s * (W / 2 + 0.145), 1.45, z], dir: [s, 0, 0], axis: "z", texture: HAZ });
    // mud flap
    part(new THREE.BoxGeometry(W * 0.9, 0.32, 0.04), P.rubber, { at: [fx, 0.34, z - 0.82] });
    part(new THREE.BoxGeometry(W * 0.9, 0.06, 0.05), P.trim, { at: [fx, 0.5, z - 0.82] });
    // side stencil
    part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", { at: [X + s * 0.38, 0.7, z], dir: [s, 0, 0], axis: "z", texture: STENCIL });
  }
}
    return buildWheels;
  })(),
  // stabilisers
  (() => {
function buildStabilisers({ b, J, P, M }: Ctx) {
  const CHROME = "#c9d0d8";
  const HAZ = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#e7b814"/>` +
      [-64, -32, 0, 32, 64]
        .map((o) => `<path d="M${o} 64 L${o + 16} 64 L${o + 80} 0 L${o + 64} 0Z" fill="#16181b"/>`)
        .join("") +
      `</svg>`,
    { size: 128 },
  );
  const WARN = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 4 L61 58 H3Z" fill="#e7b814" stroke="#16181b" stroke-width="5" stroke-linejoin="round"/><rect x="29" y="22" width="6" height="20" fill="#16181b"/><rect x="29" y="46" width="6" height="6" fill="#16181b"/></svg>`,
    { size: 96 },
  );
  const STENCIL = svg(
    `<svg viewBox="0 0 80 32"><text x="40" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#e8eaec">LG-</text></svg>`,
    { size: 128 },
  );
  const steelP = paint((p, n) => mix(P.steel, P.gunmetal, 0.5 * noise(p, 0.15, 3) + 0.2 * (1 - smoothstep(-0.5, 0.8, n.y))));
  const armorP = paint((p, n) => mix(P.armor, P.hullDark, 0.45 * noise(p, 0.25, 7) + 0.15 * (1 - smoothstep(-0.4, 0.8, n.y))));
  const padP = paint((p, n) => mix(P.trim, P.rust, 0.45 * noise(p, 0.12, 5) * (1 - smoothstep(0.3, 0.9, n.y))));

  const box = (sz: number[], col: any, at: number[], bone: any, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(sz[0], sz[1], sz[2]), col, { bone, at, ...extra });

  const legs: [string, number, number][] = [
    ["legML", 1, 0],
    ["legMR", -1, 0],
    ["legRL", 1, -3.6],
    ["legRR", -1, -3.6],
  ];

  for (const [name, s, z] of legs) {
    const bone = J[name];
    const ax = s * 1.3;
    // wall bracket
    box([0.3, 0.7, 0.9], armorP, [s * 1.2, 1.0, z], bone);
    box([0.1, 0.5, 0.7], P.gunmetal, [s * 1.37, 1.0, z], bone);
    for (const dz of [-0.3, 0.3])
      for (const dy of [-0.2, 0.2])
        b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 6), P.steel, { bone, at: [s * 1.43, 1.0 + dy, z + dz], dir: [1, 0, 0] });
    // outrigger beam
    const bx0 = ax + s * 0.1, bx1 = s * 2.6;
    box([Math.abs(bx1 - bx0), 0.34, 0.42], armorP, [(bx0 + bx1) / 2, 1.0, z], bone);
    box([Math.abs(bx1 - bx0) - 0.2, 0.06, 0.3], P.hullDark, [(bx0 + bx1) / 2, 1.19, z], bone);
    // stencil warning decals on the beam top/front
    b.part(new THREE.PlaneGeometry(0.4, 0.16), "#ffffff", {
      bone, at: [s * 2.0, 1.18, z + 0.0], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: STENCIL,
    });
    b.part(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", {
      bone, at: [s * 1.7, 1.0, z + 0.212], dir: [0, 0, 1], axis: "z", texture: WARN,
    });
    // knee hinge block at beam end
    const kx = s * 2.6;
    box([0.5, 0.5, 0.62], P.gunmetal, [kx, 1.0, z], bone);
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.76, 8), CHROME, { bone, at: [kx, 1.0, z], dir: [0, 0, 1] });
    for (const dz of [-0.4, 0.4])
      b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 8), P.steel, { bone, at: [kx, 1.0, z + dz], dir: [0, 0, 1] });
    // vertical post: outer sleeve + inner telescoping
    const px = s * 2.6;
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.55, 8), P.gunmetal, { bone, at: [px, 0.7, z] });
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.2, 8), HAZ, { bone, at: [px, 0.78, z], texture: HAZ });
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.5, 8), CHROME, { bone, at: [px, 0.32, z] });
    // diagonal strut from bracket to post
    const a: number[] = [s * 1.45, 0.78, z + 0.0];
    const e: number[] = [s * 2.5, 0.42, z + 0.0];
    const mid = [(a[0] + e[0]) / 2, (a[1] + e[1]) / 2, z + 0.38];
    const A: number[] = [a[0], a[1], z + 0.38], E: number[] = [e[0], e[1], z + 0.38];
    const mp = [A[0] + (E[0] - A[0]) * 0.55, A[1] + (E[1] - A[1]) * 0.55, z + 0.38];
    b.rod(A, mp, 0.1, { bone, color: "#ffffff" });
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.1, 8), P.gunmetal, { bone, at: A, dir: [0, 0, 1] });
    b.rod(mp, E, 0.055, CHROME, { bone, sides: 6 });
    // sleeve with hazard stripes (paint stripes)
    b.rod(A, mp, 0.115, stripes(P.trim, P.rubber, { size: 0.14, axis: [s, -0.4, 0], width: 0.5, wobble: 0.05 }), { bone, sides: 8 });
    b.part(new THREE.SphereGeometry(0.09, 6, 4), P.steel, { bone, at: E });
    b.part(new THREE.SphereGeometry(0.09, 6, 4), P.steel, { bone, at: A });
    void mid;
    // footpad
    b.part(new THREE.CylinderGeometry(0.45, 0.45, 0.14, 8), padP, { bone, at: [px, 0.07, z] });
    b.part(new THREE.CylinderGeometry(0.47, 0.47, 0.05, 8), P.trim, { bone, at: [px, 0.12, z] });
    b.part(new THREE.CylinderGeometry(0.28, 0.4, 0.1, 8), P.trim, { bone, at: [px, 0.19, z] });
    // ribbed underside
    for (let i = 0; i < 4; i++) {
      const ang = (i * Math.PI) / 4;
      b.part(new THREE.BoxGeometry(0.8, 0.03, 0.06), P.hullDark, {
        bone, at: [px, 0.005, z], rotation: [0, (ang * 180) / Math.PI, 0],
      });
    }
    // bolts on pad
    for (let i = 0; i < 6; i++) {
      const a2 = (i * Math.PI * 2) / 6;
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 6), P.steel, {
        bone, at: [px + Math.cos(a2) * 0.35, 0.215, z + Math.sin(a2) * 0.35],
      });
    }
    // status lights
    glow(b.part(new THREE.BoxGeometry(0.14, 0.07, 0.04), P.neonCyan, { bone, at: [s * 2.1, 1.0, z + 0.22] }), 1.5);
    glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), P.neonCyan, { bone, at: [px, 0.98, z + 0.0 + 0.0 + 0.33] }), 1.5);
  }
}
    return buildStabilisers;
  })(),
  // railgunBody
  (() => {
function buildRailgunBody({ b, J, P, M }: Ctx) {
  const V = THREE.Vector3;
  const bone = J.gunMount;
  const PIV = new V(M.gunCradle[0], M.gunCradle[1], M.gunCradle[2]);
  const gq = new THREE.Quaternion().setFromAxisAngle(new V(1, 0, 0), (-10 * Math.PI) / 180);
  const G = (x: number, y: number, z: number) => new V(x, y, z).applyQuaternion(gq).add(PIV);
  const up = new V(0, 1, 0).applyQuaternion(gq).toArray() as [number, number, number];
  const rotQ = (axis: [number, number, number], ang: number) =>
    gq.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new V(...axis), ang));

  // textures
  const HAZARD = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${Array.from(
      { length: 9 },
      (_, i) => `<path d="M${i * 8 - 4} 16 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8} 16Z" fill="#16181b"/>`,
    ).join("")}</svg>`,
    { size: 128 },
  );
  const AMMO = svg(
    `<svg viewBox="0 0 100 44"><rect width="100" height="44" fill="#2b3029"/>
    <rect x="3" y="3" width="94" height="38" fill="none" stroke="#d62f2f" stroke-width="3"/>
    <path d="M6 6 L30 6 L18 38 L6 38Z M70 6 L94 6 L94 38 L82 38Z" fill="#d62f2f"/>
    <text x="50" y="22" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#e8eaec">AMMO</text>
    <text x="50" y="37" text-anchor="middle" font-family="monospace" font-size="9" fill="#e7b814">RG-07 ▲ LIVE</text></svg>`,
    { size: 256 },
  );
  const WARN = svg(
    `<svg viewBox="0 0 40 40"><path d="M20 3 L38 36 L2 36Z" fill="#e7b814" stroke="#16181b" stroke-width="3" stroke-linejoin="round"/>
    <rect x="18" y="14" width="4" height="12" fill="#16181b"/><rect x="18" y="29" width="4" height="4" fill="#16181b"/></svg>`,
    { size: 96 },
  );

  // paints
  const ARMOR = paint((p, n, s) => {
    const base = mix(P.armor, P.hull, smoothstep(0.35, 0.65, noise(p, 0.45, 3)));
    const seam = Math.abs(((p.y * 3.1) % 1) - 0.5) > 0.485 || Math.abs(((p.x * 2.7) % 1) - 0.5) > 0.485;
    const c = seam ? mix(base, P.hullDark, 0.7) : base;
    return mix(c, P.hullDark, 0.35 * smoothstep(0.2, -0.8, n.y));
  });
  const GUNM = mottle(P.gunmetal, P.hullDark, { size: 0.3, seed: 5 });
  const STEEL = mottle(P.steel, P.gunmetal, { size: 0.12, seed: 8, contrast: 0.7 });

  const lbox = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: G(x, y, z), quat: gq, ...extra });
  const fbox = (w: number, h: number, d: number, color: any, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z] });
  const lcyl = (r: number, h: number, seg: number, color: any, x: number, y: number, z: number, axis: "x" | "z") =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, {
      bone,
      at: G(x, y, z),
      quat: rotQ(axis === "x" ? [0, 0, 1] : [1, 0, 0], Math.PI / 2),
    });

  // --- turntable & cradle (fixed to deck)
  b.part(new THREE.CylinderGeometry(1.2, 1.25, 0.14, 12), GUNM, { bone, at: [0, 2.07, PIV.z] });
  b.part(new THREE.CylinderGeometry(1.1, 1.1, 0.12, 12), P.trim, { bone, at: [0, 2.2, PIV.z] });
  b.part(new THREE.CylinderGeometry(1.0, 1.05, 0.14, 12), ARMOR, { bone, at: [0, 2.3, PIV.z] });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.26;
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6), P.steel, {
      bone,
      at: [Math.sin(a) * 0.93, 2.4, PIV.z + Math.cos(a) * 0.93],
    });
  }
  for (const s of [1, -1]) {
    // cheek plates + trunnion arms
    fbox(0.22, 0.75, 1.5, ARMOR, s * 0.88, 2.7, PIV.z);
    fbox(0.1, 0.3, 1.2, P.trim, s * 1.02, 2.5, PIV.z);
    b.part(new THREE.BoxGeometry(0.24, 0.5, 0.7), ARMOR, {
      bone,
      at: [s * 0.82, 2.9, PIV.z],
      rotation: [0, 0, s * 8],
    });
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.18, 8), STEEL, {
      bone,
      at: [s * 1.04, PIV.y, PIV.z],
      dir: [1, 0, 0],
    });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 6), P.trim, {
      bone,
      at: [s * 1.15, PIV.y, PIV.z],
      dir: [1, 0, 0],
    });
    // trunnion shaft
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.5, 8), P.steel, {
      bone,
      at: [s * 0.7, PIV.y, PIV.z],
      dir: [1, 0, 0],
    });
    // warning triangles on cheeks
    b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", {
      bone,
      at: [s * 1.0, 2.88, PIV.z - 0.45],
      dir: [s, 0, 0],
      axis: "z",
      texture: WARN,
    });
  }

  // --- breech housing: chamfered octagon extruded along gun axis
  const w = 0.56, h = 0.5, c = 0.18;
  const oct: [number, number][] = [
    [-w + c, -h], [w - c, -h], [w, -h + c], [w, h - c], [w - c, h], [-w + c, h], [-w, h - c], [-w, -h + c],
  ];
  const gx: [number, number, number] = [1, 0, 0];
  b.extrude(oct, { at: G(0, 0, -2.6), x: gx, y: up, thickness: 1.6, bevel: 0.03, color: ARMOR, bone });
  // rear cap
  b.extrude(oct.map(([x, y]) => [x * 0.85, y * 0.85] as [number, number]), {
    at: G(0, 0, -2.66), x: gx, y: up, thickness: 0.12, color: GUNM, bone,
  });
  // front collar
  b.extrude(oct.map(([x, y]) => [x * 0.72, y * 0.8] as [number, number]), {
    at: G(0, 0.02, -0.85), x: gx, y: up, thickness: 0.5, color: STEEL, bone,
  });
  lbox(0.46, 0.34, 0.5, GUNM, 0, 0.05, -0.5);
  // rear exhaust vents
  for (let i = 0; i < 4; i++) lbox(0.5, 0.04, 0.05, P.rubber, 0, -0.3 + i * 0.12, -2.72);
  // hazard trim along breech top edges
  for (const s of [1, -1]) {
    lbox(0.1, 0.06, 1.5, "#ffffff", s * 0.42, 0.51, -1.8, { texture: HAZARD });
  }
  // bolts on collar
  for (const s of [1, -1])
    for (const y of [-0.2, 0.2])
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), P.steel, {
        bone, at: G(s * 0.4, y, -0.58), quat: rotQ([1, 0, 0], Math.PI / 2),
      });

  // --- capacitor banks (sides)
  for (const s of [1, -1]) {
    lbox(0.3, 0.3, 0.5, GUNM, s * 0.66, 0.05, -1.55); // link
    for (let i = 0; i < 3; i++) {
      const z = -2.3 + i * 0.55;
      lbox(0.5, 0.78, 0.48, ARMOR, s * 0.88, 0.05, z);
      lbox(0.54, 0.1, 0.5, P.trim, s * 0.88, 0.44, z);
      for (let v = 0; v < 3; v++) lbox(0.03, 0.04, 0.34, P.rubber, s * 1.145, -0.2 + v * 0.1, z);
      glow(lbox(0.03, 0.34, 0.1, P.neonCyan, s * 1.145, 0.2, z + 0.1), 1.6);
    }
    glow(lbox(0.04, 0.05, 1.6, P.neonCyan, s * 1.0, 0.5, -1.78), 1.5);
    // capacitor core tubes on top
    lcyl(0.09, 1.5, 8, P.glass, s * 0.88, 0.5, -1.78, "z");
    glow(lcyl(0.06, 1.52, 6, P.neonCyan, s * 0.88, 0.5, -1.78, "z"), 1.8);
  }

  // --- top: central capacitor core and sensor
  lbox(0.5, 0.2, 1.2, GUNM, 0, 0.58, -1.75);
  glow(lbox(0.3, 0.05, 1.0, P.neonCyan, 0, 0.7, -1.75), 1.7);
  for (const z of [-2.2, -1.3]) lbox(0.56, 0.26, 0.08, P.trim, 0, 0.6, z);

  // --- ammo magazine box (rear top)
  lbox(0.8, 0.42, 0.85, ARMOR, 0, 0.82, -2.2, {});
  lbox(0.84, 0.05, 0.9, P.trim, 0, 1.05, -2.2);
  lbox(0.3, 0.08, 0.3, P.steel, 0, 1.1, -2.2);
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.72, 0.31), "#ffffff", {
      bone, at: G(s * 0.405, 0.82, -2.2), quat: rotQ([0, 1, 0], s * (Math.PI / 2)), texture: AMMO,
    });
  }
  b.part(new THREE.PlaneGeometry(0.5, 0.2), "#ffffff", {
    bone, at: G(0, 0.82, -2.65), quat: rotQ([0, 1, 0], Math.PI), texture: AMMO,
  });

  // --- cables to hull
  for (const s of [1, -1]) {
    b.sweep(
      catmull([G(s * 0.88, -0.2, -2.55).toArray(), G(s * 0.9, -0.5, -2.7).toArray(), [s * 0.75, 2.3, -4.0], [s * 0.6, 2.06, -3.9]]),
      0.045, { color: P.rubber, bone, sides: 6 },
    );
    b.sweep(
      catmull([G(s * 0.4, -0.4, -2.7).toArray(), [s * 0.45, 2.4, -3.6], [s * 0.35, 2.06, -3.2]]),
      0.03, { color: P.warnRed, bone, sides: 6 },
    );
  }
  b.sweep(catmull([G(0, 0.4, -2.7).toArray(), [0, 2.45, -3.8], [0, 2.05, -3.5]]), 0.05, { color: P.rubber, bone, sides: 6 });
  // cable clamps
  for (const s of [1, -1]) lbox(0.14, 0.14, 0.14, P.steel, s * 0.9, -0.5, -2.7);

  // --- start of the twin rails
  for (const s of [1, -1]) {
    lbox(0.13, 0.26, 3.5, STEEL, s * 0.17, 0.05, 0.85);
    lbox(0.04, 0.26, 3.5, P.hullDark, s * 0.255, 0.05, 0.85);
    glow(lbox(0.02, 0.05, 3.3, P.neonCyan, s * 0.098, 0.05, 0.85), 1.8);
    lbox(0.15, 0.04, 3.5, P.trim, s * 0.17, 0.2, 0.85, { texture: HAZARD, color: "#ffffff" });
  }
  for (const z of [-0.2, 0.6, 1.4]) {
    lbox(0.62, 0.1, 0.18, GUNM, 0, 0.2, z);
    lbox(0.62, 0.1, 0.18, GUNM, 0, -0.1, z);
    for (const s of [1, -1]) b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), P.steel, { bone, at: G(s * 0.25, 0.26, z), quat: gq });
  }
  // rail root end blocks
  lbox(0.6, 0.34, 0.2, ARMOR, 0, 0.05, -0.25);
  glow(lbox(0.18, 0.08, 0.03, P.neonCyan, 0, 0.05, -0.14), 1.6);
}
    return buildRailgunBody;
  })(),
  // railgunBarrel
  (() => {
function buildRailgunBarrel({ b, J, P, M }: Ctx) {
  const bone = J.gunMount;
  const pivot = new THREE.Vector3(0, 2.35, -1.6);
  const tilt = Math.atan2(0.17, 1); // gun axis elevation
  const dir = new THREE.Vector3(0, Math.sin(tilt), Math.cos(tilt));
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
  // point on gun axis at distance d from pivot, with lateral x and vertical y offsets
  const pt = (d: number, x = 0, y = 0): [number, number, number] => {
    const v = pivot.clone().addScaledVector(dir, d).addScaledVector(right, x).addScaledVector(up, y);
    return [v.x, v.y, v.z];
  };
  // axis starts at z=1.0 => d = 2.6/cos
  const D0 = 2.6 / Math.cos(tilt);
  const D1 = 6.8 / Math.cos(tilt) - 0.3;
  const L = D1 - D0;
  const mid = (D0 + D1) / 2;
  const box = (w: number, h: number, l: number, color: any, d: number, x = 0, y = 0, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, l), color, { bone, at: pt(d, x, y), quat: q, ...extra });

  const RAIL = paint((p, n) => {
    const t = smoothstep(2.5, 5.2, p.z);
    const base = mix(P.gunmetal, "#8a919c", 0.25 * noise(p, 0.2, 3));
    const heat = mix(base, mix("#5a4a8a", "#c8742a", smoothstep(0.5, 1, t)), 0.7 * t);
    const stripe = (Math.floor(p.z / 0.25) % 8 === 0) ? 0.35 : 0;
    return mix(heat, P.white, stripe * (n.y > 0.5 ? 1 : 0));
  });

  const RANGE = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e8eaec"/><rect x="2" y="2" width="3" height="12" fill="#222"/><rect x="9" y="5" width="3" height="9" fill="#222"/><rect x="16" y="2" width="3" height="12" fill="#222"/><rect x="23" y="5" width="3" height="9" fill="#222"/><rect x="30" y="2" width="3" height="12" fill="#222"/><text x="40" y="13" font-size="12" font-family="monospace" font-weight="bold" fill="#222">R-05</text></svg>`,
    { size: 128 },
  );
  const HAZ = svg(
    `<svg viewBox="0 0 32 8"><rect width="32" height="8" fill="#e7b814"/><path d="M0 8L8 0H16L8 8ZM16 8L24 0H32L24 8Z" fill="#16181b"/></svg>`,
    { size: 128 },
  );

  // twin rails
  for (const s of [1, -1]) {
    box(0.2, 0.34, L, RAIL, mid, s * 0.2, 0);
    // inner lip
    box(0.05, 0.12, L, P.steel, mid, s * 0.085, 0.1);
    // top bevel strip
    box(0.1, 0.05, L, P.steel, mid, s * 0.22, 0.19);
    // cyan energy line
    glow(box(0.03, 0.05, L - 0.1, P.neonCyan, mid, s * 0.1, -0.02), 1.6);
    // outer hazard-less panel decal
    b.part(new THREE.PlaneGeometry(1.2, 0.3), "#ffffff", {
      bone, at: pt(D0 + 0.9, s * 0.311, 0), quat: q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), s * Math.PI / 2)), axis: "z", texture: RANGE,
    });
    b.part(new THREE.PlaneGeometry(1.2, 0.3), "#ffffff", {
      bone, at: pt(D0 + 2.6, s * 0.311, 0), quat: q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), s * Math.PI / 2)), axis: "z", texture: RANGE,
    });
  }

  // cross-braces and clamps
  const R = rng(5);
  for (let i = 0; i < 6; i++) {
    const d = D0 + 0.15 + (i * (L - 0.9)) / 5;
    box(0.62, 0.1, 0.22, P.hullDark, d, 0, 0.22);
    box(0.62, 0.1, 0.22, P.hullDark, d, 0, -0.22);
    for (const s of [1, -1]) {
      box(0.1, 0.5, 0.26, P.armor, d, s * 0.3, 0);
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), P.steel, {
        bone, at: pt(d, s * 0.3, 0.27), quat: q,
      });
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), P.steel, {
        bone, at: pt(d, s * 0.3, -0.27), quat: q,
      });
      // bolts on face
      for (const dz of [-0.08, 0.08]) {
        b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), P.steel, {
          bone, at: pt(d + dz, s * 0.36, 0.1 - R() * 0.0), quat: q, rotation: [0, 0, 90],
        });
      }
    }
  }
  // hazard bands on first brace
  b.part(new THREE.PlaneGeometry(0.6, 0.1), "#ffffff", { bone, at: pt(D0 + 0.15, 0, 0.275), quat: q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)), axis: "z", texture: HAZ });

  // muzzle brake
  const mz = D1 - 0.35;
  box(0.78, 0.62, 0.7, P.gunmetal, mz, 0, 0);
  box(0.84, 0.68, 0.1, P.hullDark, mz - 0.35, 0, 0);
  box(0.84, 0.68, 0.1, P.hullDark, mz + 0.35, 0, 0);
  for (let i = 0; i < 4; i++) {
    const d = mz - 0.22 + i * 0.15;
    box(0.88, 0.1, 0.07, P.steel, d, 0, 0.36);
    box(0.88, 0.1, 0.07, P.steel, d, 0, -0.36);
    for (const s of [1, -1]) box(0.07, 0.5, 0.07, P.steel, d, s * 0.43, 0);
  }
  // chamfered wedge on top
  b.part(new THREE.ConeGeometry(0.2, 0.3, 4), P.armor, { bone, at: pt(mz, 0, 0.45), quat: q });
  // bore dark and glow
  box(0.3, 0.2, 0.04, "#000000", D1 + 0.01, 0, 0);
  glow(box(0.5, 0.04, 0.72, P.neonCyan, mz, 0, 0.001), 1.8);
  // red tip light
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), P.warnRed, { bone, at: pt(D1 + 0.03, 0, 0.33) }), 2);

  // targeting sensor box on top
  const sd = D0 + L * 0.45;
  box(0.4, 0.22, 0.55, P.hull, sd, 0, 0.42);
  box(0.3, 0.12, 0.2, P.hullDark, sd + 0.3, 0, 0.45);
  glow(b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 8), P.neonCyan, { bone, at: pt(sd + 0.29, 0, 0.45), quat: q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2)) }), 1.5);
  box(0.5, 0.05, 0.4, P.trim, sd, 0, 0.545);
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.3, 4), P.steel, { bone, at: pt(sd - 0.2, 0.15, 0.62) , quat: q });
  box(0.3, 0.1, 0.1, P.hullDark, sd, 0, 0.3);
}
    return buildRailgunBarrel;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.4,0], dir: [0,0,1], role: "spine" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.45,0.7,2.9], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.45,0.7,2.9], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.45,0.7,0], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.45,0.7,0], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.45,0.7,-2.9], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.45,0.7,-2.9], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["legML"] = b.joint("legML", { parent: J["body"], at: [1.3,1,0], dir: [1,-0.5,0], role: "leg", group: "legs" });
  J["legMR"] = b.joint("legMR", { parent: J["body"], at: [-1.3,1,0], dir: [-1,-0.5,0], role: "leg", group: "legs" });
  J["legRL"] = b.joint("legRL", { parent: J["body"], at: [1.3,1,-3.6], dir: [1,-0.5,0], role: "leg", group: "legs" });
  J["legRR"] = b.joint("legRR", { parent: J["body"], at: [-1.3,1,-3.6], dir: [-1,-0.5,0], role: "leg", group: "legs" });
  J["gunMount"] = b.joint("gunMount", { parent: J["body"], at: [0,2.35,-1.6], dir: [0,0.17,1], role: "hinge", group: "gun" });
  J["mast"] = b.joint("mast", { parent: J["body"], at: [0.8,2.45,2.2], dir: [0,1,0], role: "hinge", group: "hull" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
