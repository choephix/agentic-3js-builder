import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, rng, mottle, countershade, stripes, smoothstep, noise, mix, polyline, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  "name": "Convoy Hauler MK-IV 'Lockjaw'",
  "description": "A low-poly cyberpunk six-wheeled armoured convoy hauler with a slab-sided cab, roof turret and rear flatbed carrying a sealed, glowing cargo pod."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#3b4250",
  hullDark: "#232833",
  hullLight: "#5a6475",
  trim: "#e7b814",
  hazardBlack: "#15171c",
  tyre: "#14151a",
  hub: "#7b8394",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fb4",
  glass: "#0c2a3a",
  pod: "#d9dde3",
  podDark: "#8a93a3",
  rust: "#7a4a2c",
  steel: "#9aa3b2",
  strap: "#2a2d36",
  warnRed: "#d8321f",
};
const M = {
  chassisTop: [0, 1.3, 0] as [number, number, number],
  cabFloor: [0, 1.3, 2.6] as [number, number, number],
  cabRoof: [0, 2.55, 2.6] as [number, number, number],
  turretRing: [0, 2.55, 1.9] as [number, number, number],
  flatbedDeck: [0, 1.45, -1.4] as [number, number, number],
  podCenter: [0, 2.35, -1.4] as [number, number, number],
  axleFront: [0, 0.62, 2.9] as [number, number, number],
  axleMid: [0, 0.62, -0.9] as [number, number, number],
  axleRear: [0, 0.62, -2.5] as [number, number, number],
  bumperFront: [0, 0.8, 4.2] as [number, number, number],
  podRearFace: [0, 2.35, -4.2] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, [number, number, number]> };

function buildChassis({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);
  const BOLT = "#b9c0cc";
  const SOOT = "#0e0f12";
  const DECK = "#2c313d";

  const box = (w: number, h: number, d: number, color: any, at: [number, number, number], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: [number, number, number], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: body, at, ...extra });

  const dirty = (base: string) =>
    paint((p, n) => {
      const low = smoothstep(1.3, 0.5, p.y);
      const dn = noise(p, 0.25, 3);
      const c = new THREE.Color(base);
      const mud = new THREE.Color(P.rust);
      const t = Math.min(1, low * (0.35 + dn * 0.7));
      c.lerp(mud, t * 0.7);
      if (n.y > 0.5) c.multiplyScalar(1.1);
      return [c.r, c.g, c.b];
    });
  const HULLP = dirty(P.hull);
  const PANEL = panelled(HULLP, { size: 0.5, aspect: 0.6, rivets: 0.12 });
  const DARKP = dirty(P.hullDark);

  // ---- side rails
  for (const s of [1, -1]) {
    box(0.2, 0.34, 7.2, PANEL, [s * 0.75, 0.95, -0.6]);
    box(0.32, 0.07, 7.2, DARKP, [s * 0.75, 1.14, -0.6]);
    box(0.32, 0.07, 7.2, DARKP, [s * 0.75, 0.77, -0.6]);
  }
  // cross members
  for (let i = 0; i < 9; i++) {
    const z = 2.7 - i * 0.85;
    box(1.5, 0.16, 0.14, DARKP, [0, 0.98, z]);
  }
  // belly plate
  box(1.7, 0.08, 5.6, panelled(DARKP, { size: 0.4 }), [0, 0.68, -0.3]);
  b.part(new THREE.BoxGeometry(1.7, 0.08, 0.5), P.hullDark, { bone: body, at: [0, 0.72, 2.75], rotation: [18, 0, 0] });

  // ---- flatbed deck
  box(2.9, 0.12, 5.6, panelled(P.hullDark, { size: 0.6, rivets: 0.15 }), [0, 1.39, -1.4]);
  box(2.9, 0.06, 5.6, DECK, [0, 1.46, -1.4]);
  // hazard trim: edges
  const HAZ = paint((p) => {
    const k = Math.floor((p.z + p.x * 0.6) / 0.22) % 2 === 0;
    return k ? "#e7b814" : "#15171c";
  });
  for (const s of [1, -1]) box(0.1, 0.05, 5.6, HAZ, [s * 1.4, 1.5, -1.4]);
  box(2.9, 0.05, 0.1, HAZ, [0, 1.5, 1.35]);
  // tie-down rings
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      const z = 0.6 - i * 1.4;
      b.part(new THREE.TorusGeometry(0.07, 0.016, 5, 8), P.steel, { bone: body, at: [s * 1.3, 1.5, z], rotation: [90, 0, 0] });
      box(0.1, 0.03, 0.08, P.steel, [s * 1.3, 1.49, z]);
    }
  // rivet row on deck
  const riv: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (let i = 0; i < 22; i++)
      riv.push(new THREE.SphereGeometry(0.017, 5, 3).translate(s * 1.2, 1.5, 1.2 - i * 0.25));
  b.part(mergeGeo(riv), BOLT, { bone: body, at: [0, 0, 0] });

  // ---- side lockers, tanks, batteries
  const LOCK = panelled(dirty(P.hullLight), { size: 0.35, rivets: 0.07 });
  for (const s of [1, -1]) {
    box(0.4, 0.45, 1.5, LOCK, [s * 1.3, 1.1, -1.9]);
    b.part(new THREE.BoxGeometry(0.03, 0.3, 0.5), P.trim, { bone: body, at: [s * 1.51, 1.12, -1.9] });
    b.part(new THREE.BoxGeometry(0.04, 0.06, 0.12), P.steel, { bone: body, at: [s * 1.53, 1.12, -1.6] });
    // fuel tank
    cyl(0.28, 0.28, 1.5, 8, metal("steel", { tarnish: 0.5 }), [s * 1.25, 0.95, 0.4], { rotation: [90, 0, 0] });
    for (const z of [-0.25, 1.05])
      box(0.1, 0.1, 0.06, P.strap, [s * 1.25, 0.95, z], { scale: [1, 5.2, 1] });
    cyl(0.07, 0.07, 0.08, 6, P.warnRed, [s * 1.25, 1.2, 0.4]);
    // battery boxes
    box(0.36, 0.3, 0.7, DARKP, [s * 1.28, 1.0, -0.7]);
    box(0.08, 0.05, 0.08, P.steel, [s * 1.2, 1.18, -0.9]);
    box(0.08, 0.05, 0.08, P.warnRed, [s * 1.35, 1.18, -0.9]);
    box(0.08, 0.05, 0.08, P.steel, [s * 1.2, 1.18, -0.5]);
    box(0.08, 0.05, 0.08, P.warnRed, [s * 1.35, 1.18, -0.5]);
  }

  // ---- fenders over six wheels
  const fenderAt = (x: number, z: number) => {
    const s = Math.sign(x);
    b.extrude(
      [[-0.78, 0], [-0.7, 0.3], [-0.3, 0.52], [0.3, 0.52], [0.7, 0.3], [0.78, 0], [0.62, 0], [0.55, 0.24], [0.28, 0.4], [-0.28, 0.4], [-0.55, 0.24], [-0.62, 0]],
      { at: [x, 1.18, z], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.5, bevel: 0.02, color: HULLP, bone: body },
    );
    box(0.54, 0.04, 0.2, HAZ, [x, 1.72, z]);
  };
  for (const s of [1, -1]) for (const z of [2.9, -0.9, -2.5]) fenderAt(s * 1.35, z);
  // fix y of stray hazard: fenders are decorative lips

  // ---- axles and leaf springs
  for (const z of [2.9, -0.9, -2.5]) {
    cyl(0.1, 0.1, 2.7, 8, metal("iron"), [0, 0.62, z], { rotation: [0, 0, 90] });
    cyl(0.2, 0.2, 0.3, 8, DARKP, [0, 0.62, z], { rotation: [0, 0, 90] });
    for (const s of [1, -1]) {
      for (let k = 0; k < 3; k++)
        box(0.12, 0.035, 1.1 - k * 0.22, metal("iron", { tarnish: 0.6 }), [s * 0.9, 0.78 + k * 0.04, z]);
      box(0.2, 0.1, 0.2, P.steel, [s * 0.9, 0.72, z]);
      // shock
      b.rod([s * 0.62, 0.7, z + 0.15], [s * 0.62, 1.0, z + 0.2], 0.03, P.warnRed, { bone: body, sides: 6 });
    }
  }
  // driveshaft
  cyl(0.06, 0.06, 5.0, 6, P.steel, [0, 0.82, -0.9], { rotation: [90, 0, 0] });
  box(0.4, 0.3, 0.5, DARKP, [0, 0.8, 1.6]);

  // ---- exhaust stacks behind cab
  const SOOTP = paint((p) => {
    const t = smoothstep(2.0, 2.9, p.y);
    const c = new THREE.Color(P.steel).lerp(new THREE.Color(SOOT), 0.3 + t * 0.7);
    return [c.r, c.g, c.b];
  });
  for (const s of [1, -1]) {
    const x = s * 1.38;
    cyl(0.09, 0.09, 1.6, 8, SOOTP, [x, 2.3, 1.45]);
    cyl(0.12, 0.09, 0.14, 8, SOOT, [x, 3.15, 1.45]);
    cyl(0.04, 0.04, 0.9, 6, P.steel, [x, 2.35, 1.3]);
    for (const y of [1.7, 2.3, 2.8]) cyl(0.115, 0.115, 0.06, 8, P.strap, [x, y, 1.45]);
    box(0.1, 0.1, 0.25, P.hullDark, [x, 1.65, 1.5]);
  }

  // ---- rear bumper
  box(2.9, 0.4, 0.3, panelled(P.hullDark, { size: 0.3 }), [0, 0.95, -4.15]);
  box(2.9, 0.08, 0.32, HAZ, [0, 1.17, -4.15]);
  b.part(new THREE.BoxGeometry(0.5, 0.2, 0.2), P.steel, { bone: body, at: [0, 0.75, -4.2] });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6), P.steel, { bone: body, at: [0, 0.8, -4.0], rotation: [90, 0, 0] });
  // tail lights
  for (const s of [1, -1]) {
    glow(box(0.3, 0.14, 0.06, P.warnRed, [s * 1.2, 0.98, -4.32]), 1.6);
    box(0.36, 0.2, 0.04, P.hullDark, [s * 1.2, 0.98, -4.3]);
    glow(box(0.12, 0.08, 0.05, "#ff6a3a", [s * 0.8, 0.98, -4.32]), 1.2);
  }
  // plate
  const plate = svg(
    `<svg viewBox="0 0 120 50"><rect width="120" height="50" rx="4" fill="#e9e4cf" stroke="#15171c" stroke-width="3"/>
    <text x="10" y="22" font-family="monospace" font-weight="bold" font-size="18" fill="#15171c">MK-IV</text>
    <text x="10" y="44" font-family="monospace" font-weight="bold" font-size="20" fill="#d8321f">UNIT-07</text>
    <g fill="#15171c"><rect x="86" y="8" width="3" height="16"/><rect x="92" y="8" width="1.5" height="16"/><rect x="96" y="8" width="4" height="16"/><rect x="103" y="8" width="2" height="16"/><rect x="108" y="8" width="3" height="16"/></g>
    <text x="84" y="44" font-size="14" fill="#15171c">鎖顎</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.62, 0.26), "#ffffff", {
    bone: body, at: [0, 1.0, -4.315], dir: [0, 0, -1], axis: "z", texture: plate,
  });

  // ---- front chassis end + hitch
  box(1.7, 0.3, 0.25, DARKP, [0, 0.95, 3.0]);
  for (const s of [1, -1]) box(0.14, 0.14, 0.4, P.trim, [s * 0.5, 0.92, 3.1]);
  // tow hook
  b.part(new THREE.TorusGeometry(0.09, 0.025, 5, 8, Math.PI * 1.5), P.steel, { bone: body, at: [0, 0.9, 3.2] });

  // step rungs
  for (const s of [1, -1]) {
    box(0.3, 0.05, 0.7, HAZ, [s * 1.5, 0.9, 1.9]);
    box(0.06, 0.2, 0.06, P.strap, [s * 1.4, 1.0, 1.65]);
  }
  // mud flaps
  for (const s of [1, -1]) box(0.04, 0.4, 0.5, P.strap, [s * 1.6, 0.75, -3.15]);

  function mergeGeo(list: THREE.BufferGeometry[]) {
    let pos: number[] = [];
    let idx: number[] = [];
    let off = 0;
    for (const g of list) {
      const p = g.getAttribute("position");
      for (let i = 0; i < p.count; i++) pos.push(p.getX(i), p.getY(i), p.getZ(i));
      const ix = g.index!;
      for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + off);
      off += p.count;
    }
    const m = new THREE.BufferGeometry();
    m.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    m.setIndex(idx);
    m.computeVertexNormals();
    return m;
  }
  void R; void countershade; void stripes; void mottle;
}
    return buildChassis;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P, M }: any) {
  const bone = J.cab;
  const R = rng(11);

  // wear paint: dirt rising from the bottom
  const dirt = (base: string, seed = 3) =>
    paint((p, n) => {
      const d = smoothstep(1.7, 0.7, p.y + (noise(p, 0.25, seed) - 0.5) * 0.4);
      const c = mix(base, P.rust, d * 0.55);
      const top = smoothstep(0.3, 1, n.y) * 0.12;
      return mix(c, P.hullLight, top);
    });
  const HULL = dirt(P.hull);
  const HULLD = dirt(P.hullDark, 5);
  const hazard = paint((p) => ((Math.floor((p.x + p.y * 1.2) / 0.12) % 2 + 2) % 2 ? P.trim : P.hazardBlack));

  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, flat: true, ...extra });

  // textures
  const glass = svg(
    `<svg viewBox="0 0 128 40"><rect width="128" height="40" fill="#0c2a3a"/>
    <path d="M0 8H128M0 20H128" stroke="#2ff3ff" stroke-opacity=".35" stroke-width="2"/>
    <path d="M10 34L40 6H52L22 34Z M70 34L100 6H108L78 34Z" fill="#2ff3ff" fill-opacity=".25"/>
    <rect x="96" y="26" width="24" height="6" fill="#2ff3ff" fill-opacity=".6"/>
    <path d="M8 12h14M8 16h8" stroke="#2ff3ff" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  const unit = svg(
    `<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="6" fill="#15171c" stroke="#e7b814" stroke-width="4"/>
    <text x="32" y="30" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#e7b814">MK</text>
    <text x="32" y="54" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#2ff3ff">04</text></svg>`,
    { size: 128 },
  );
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 4L58 18V46L32 60L6 46V18Z" fill="#232833" stroke="#ff2fb4" stroke-width="4"/>
    <path d="M32 16L46 24V40L32 48L18 40V24Z" fill="none" stroke="#2ff3ff" stroke-width="4"/>
    <path d="M24 28h16M24 36h16M32 20v24" stroke="#e7b814" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const vent = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#15171c"/>
    ${[4, 11, 18, 25].map((y) => `<rect x="4" y="${y}" width="56" height="4" fill="#3b4250"/>`).join("")}</svg>`,
    { size: 128 },
  );
  const tex = (g: THREE.BufferGeometry, t: any, at: number[], dir: number[], col = "#ffffff") =>
    b.part(g, col, { bone, at, dir, axis: "z", texture: t });

  // main cab body (z 1.6..3.0), stepped hull
  box(2.8, 0.7, 1.6, panelled(HULL, { size: 0.5 }), [0, 1.65, 2.4]);
  box(2.7, 1.0, 1.4, HULL, [0, 2.1, 2.3]);
  // roof slab tapering forward
  b.frustumBox([0, 2.58, 1.62], [0, 2.58, 3.2], [2.5, 0.1], [2.3, 0.1], { bone, color: HULLD });
  // bonnet wedge: loft from cab front to bumper
  b.loft(
    [
      { at: [0, 1.75, 3.0], w: 2.7, h: 0.9 },
      { at: [0, 1.65, 3.6], w: 2.6, h: 0.7 },
      { at: [0, 1.35, 4.05], w: 2.4, h: 0.5 },
    ],
    { bone, color: panelled(HULL, { size: 0.4 }), sides: 4 },
  );
  // ram plate (angled)
  b.part(new THREE.BoxGeometry(2.7, 0.8, 0.14), hazard, {
    bone, at: [0, 0.95, 4.18], rotation: [-14, 0, 0], flat: true,
  });
  box(2.9, 0.12, 0.2, P.hazardBlack, [0, 1.4, 4.2]);
  for (const s of [1, -1]) {
    b.rod([s * 1.25, 0.6, 4.15], [s * 1.3, 1.5, 3.9], 0.07, P.steel, { bone, sides: 6 });
    b.rod([s * 0.5, 0.6, 4.2], [s * 0.5, 1.4, 4.0], 0.06, P.steel, { bone, sides: 6 });
  }
  // bull bar rail
  b.rod([-1.4, 1.05, 4.22], [1.4, 1.05, 4.22], 0.07, P.steel, { bone, sides: 6 });
  // headlight slits
  for (const s of [1, -1]) {
    glow(box(0.7, 0.08, 0.06, P.neonCyan, [s * 0.85, 1.55, 4.1], { flat: true }), 1.8);
    box(0.78, 0.16, 0.04, P.hazardBlack, [s * 0.85, 1.55, 4.07]);
  }
  // grille
  tex(new THREE.PlaneGeometry(1.0, 0.5), vent, [0, 1.58, 4.06], [0, 0.25, 1]);
  glow(box(1.0, 0.05, 0.05, P.neonCyan, [0, 1.3, 4.08]), 1.5);

  // windscreen visor
  b.part(new THREE.BoxGeometry(2.45, 0.1, 0.5), P.hazardBlack, { bone, at: [0, 2.43, 3.05], rotation: [-35, 0, 0], flat: true });
  const ws = b.part(new THREE.PlaneGeometry(2.3, 0.62), "#ffffff", {
    bone, at: [0, 2.14, 3.08], dir: [0, 0.7, 0.7], axis: "z", texture: glass,
  });
  glow(ws, 0.8);
  // roof sensors etc
  box(1.9, 0.08, 0.1, P.hazardBlack, [0, 2.66, 3.0]);
  for (let i = 0; i < 5; i++) glow(box(0.3, 0.1, 0.1, P.neonMagenta, [-0.8 + i * 0.4, 2.68, 3.0]), 2);
  b.part(new THREE.SphereGeometry(0.16, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.steel, { bone, at: [0.7, 2.58, 2.4], flat: true });
  b.rod([-0.9, 2.58, 1.8], [-0.95, 3.4, 1.75], 0.015, P.steel, { bone, sides: 5 });
  b.rod([0.95, 2.58, 1.75], [1.0, 3.1, 1.7], 0.015, P.steel, { bone, sides: 5 });

  for (const s of [1, -1]) {
    // side windows + slats
    box(0.05, 0.38, 0.9, P.glass, [s * 1.37, 2.2, 2.4]);
    glow(box(0.02, 0.03, 0.8, P.neonCyan, [s * 1.4, 2.0, 2.4]), 1.2);
    for (let i = 0; i < 4; i++) box(0.06, 0.4, 0.04, P.hazardBlack, [s * 1.39, 2.2, 2.0 + i * 0.28]);
    // armour skirt
    box(0.1, 0.55, 1.9, panelled(HULLD, { size: 0.35 }), [s * 1.42, 1.25, 2.55]);
    box(0.12, 0.08, 1.9, hazard, [s * 1.42, 0.95, 2.55]);
    // door seams
    box(0.02, 0.9, 0.02, P.hazardBlack, [s * 1.405, 1.95, 2.8]);
    box(0.02, 0.9, 0.02, P.hazardBlack, [s * 1.405, 1.95, 1.9]);
    box(0.03, 0.05, 0.2, P.steel, [s * 1.41, 1.9, 2.7]);
    // decals
    tex(new THREE.PlaneGeometry(0.4, 0.4), unit, [s * 1.415, 1.75, 2.15], [s, 0, 0]);
    tex(new THREE.PlaneGeometry(0.4, 0.4), emblem, [s * 1.415, 1.75, 2.55], [s, 0, 0]);
    // mirrors
    b.rod([s * 1.35, 2.2, 3.0], [s * 1.7, 2.3, 3.05], 0.025, P.steel, { bone, sides: 5 });
    box(0.1, 0.35, 0.22, P.hullDark, [s * 1.75, 2.28, 3.05]);
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, { bone, at: [s * 1.75, 2.45, 3.18] }), 2);
    // fender flare / rivets
    for (let i = 0; i < 5; i++)
      b.part(new THREE.SphereGeometry(0.03, 5, 3), P.steel, { bone, at: [s * 1.48, 1.45, 1.75 + i * 0.38] });
  }
  // rear wall
  box(2.9, 1.2, 0.1, panelled(HULLD, { size: 0.4 }), [0, 2.0, 1.65]);
  box(2.9, 0.14, 0.12, hazard, [0, 1.42, 1.62]);
  // skirt rivets on front
  for (let i = 0; i < 8; i++)
    b.part(new THREE.SphereGeometry(0.025, 5, 3), P.steel, { bone, at: [-1.05 + i * 0.3, 1.9, 3.45 + R() * 0.0] });
}
    return buildCab;
  })(),
  // turret
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildTurret({ b, J, P, M }: Ctx) {
  const base = J.turretBase;
  const gun = J.gunPitch;
  const R = rng(11);
  const [rx, ry, rz] = M.turretRing;

  const hazard = stripes(P.trim, P.hazardBlack, { size: 0.09, axis: "x", width: 0.5, wobble: 0.05 });
  const hullPaint = paint((p, n) => {
    const t = Math.min(1, Math.max(0, (p.y - 2.55) / 0.6));
    const c = new THREE.Color(P.hullDark).lerp(new THREE.Color(P.hullLight), t * 0.7 + (n.y > 0.5 ? 0.25 : 0));
    return [c.r, c.g, c.b];
  });

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 6) => new THREE.CylinderGeometry(rt, rb, h, s);

  // ---- base ring (turretBase) ----
  b.part(cyl(0.62, 0.66, 0.1, 6), hullPaint, { bone: base, at: [rx, ry + 0.05, rz] });
  b.part(cyl(0.64, 0.64, 0.05, 6), hazard, { bone: base, at: [rx, ry + 0.12, rz] });
  b.part(cyl(0.5, 0.58, 0.14, 6), hullPaint, { bone: base, at: [rx, ry + 0.2, rz] });
  // rivets
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.017, 5, 3), P.steel, {
      bone: base,
      at: [rx + Math.sin(a) * 0.6, ry + 0.12, rz + Math.cos(a) * 0.6],
    });
  }
  // pedestal
  b.part(cyl(0.26, 0.34, 0.2, 6), P.hullDark, { bone: base, at: [rx, ry + 0.37, rz] });

  // side cheeks holding the cradle
  for (const s of [1, -1]) {
    b.part(box(0.1, 0.34, 0.5), hullPaint, { bone: base, at: [s * 0.32, 2.97, 2.0] });
    b.part(cyl(0.06, 0.06, 0.08, 6), P.steel, { bone: base, at: [s * 0.38, 2.95, 2.0], dir: [1, 0, 0] });
  }

  // camera pod on the left, sensor eye on the right (on base)
  b.part(box(0.16, 0.14, 0.2), P.hullDark, { bone: base, at: [0.5, 2.88, 1.7] });
  glow(b.part(new THREE.CircleGeometry(0.05, 8), P.neonCyan, { bone: base, at: [0.5, 2.88, 1.805], dir: [0, 0, 1], axis: "z" }), 1.6);
  b.part(box(0.07, 0.14, 0.07), P.hullDark, { bone: base, at: [-0.5, 2.9, 1.6] });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), P.hullLight, { bone: base, at: [-0.5, 3.0, 1.62] });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), P.warnRed, { bone: base, at: [-0.5, 3.0, 1.71] }), 2);

  // cable runs
  b.sweep([[0.2, 2.65, 1.75], [0.3, 2.78, 1.85], [0.28, 2.9, 1.95]], 0.016, { bone: base, color: P.hazardBlack });
  b.sweep([[-0.2, 2.65, 1.75], [-0.3, 2.76, 1.9], [-0.27, 2.92, 2.0]], 0.016, { bone: base, color: P.hazardBlack });

  // ---- gun (gunPitch) ----
  b.part(box(0.46, 0.3, 0.6), hullPaint, { bone: gun, at: [0, 2.98, 2.1] });
  // armoured shield wedge front
  b.extrude(
    [[-0.34, -0.2], [0.34, -0.2], [0.28, 0.2], [-0.28, 0.2]],
    { at: [0, 2.98, 2.42], x: [1, 0, 0], thickness: [0.08, 0.04], bevel: 0.01, color: hullPaint, bone: gun },
  );
  b.part(box(0.5, 0.04, 0.5), hazard, { bone: gun, at: [0, 3.14, 2.1] });
  const decal = svg(
    `<svg viewBox="0 0 40 40"><path d="M20 4 L37 34 L3 34Z" fill="#e7b814" stroke="#15171c" stroke-width="3"/><rect x="18" y="14" width="4" height="12" fill="#15171c"/><rect x="18" y="28" width="4" height="4" fill="#15171c"/></svg>`,
    { size: 64 },
  );
  b.part(new THREE.PlaneGeometry(0.16, 0.16), "#ffffff", { bone: gun, at: [0, 2.98, 2.468], dir: [0, 0, 1], axis: "z", texture: decal });

  // barrels
  for (const s of [1, -1]) {
    const x = s * 0.13;
    b.rod([x, 2.98, 2.4], [x, 2.98, 3.2], 0.04, { bone: gun, color: P.steel, sides: 8 });
    b.part(cyl(0.065, 0.065, 0.1, 6), P.hullDark, { bone: gun, at: [x, 2.98, 3.22], dir: [0, 0, 1] });
    b.part(cyl(0.055, 0.055, 0.14, 6), P.hullDark, { bone: gun, at: [x, 2.98, 3.0], dir: [0, 0, 1] });
    for (let k = 0; k < 2; k++)
      b.part(box(0.1, 0.018, 0.04), P.hazardBlack, { bone: gun, at: [x, 2.98, 3.2 + k * 0.05] });
  }
  b.part(box(0.1, 0.1, 0.5), P.hullDark, { bone: gun, at: [0, 2.98, 2.55] });

  // ammo box on the side with belt
  b.part(box(0.2, 0.22, 0.34), hullPaint, { bone: gun, at: [0.4, 2.95, 2.05] });
  b.part(box(0.21, 0.04, 0.1), P.trim, { bone: gun, at: [0.4, 3.04, 2.05] });
  b.sweep([[0.32, 2.98, 2.25], [0.22, 3.0, 2.3], [0.16, 2.98, 2.35]], 0.02, { bone: gun, color: P.trim });
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    b.part(cyl(0.012, 0.012, 0.04, 5), P.rust, {
      bone: gun,
      at: [0.32 - t * 0.16 + (R() - 0.5) * 0.005, 2.99, 2.25 + t * 0.1],
    });
  }
  // top rivets
  for (const [x, z] of [[-0.18, 1.88], [0.18, 1.88], [-0.18, 2.32], [0.18, 2.32]])
    b.part(new THREE.SphereGeometry(0.014, 5, 3), P.steel, { bone: gun, at: [x, 3.16, z] });
}
    return buildTurret;
  })(),
  // wheels
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.62;
  const W = 0.5;
  const rand = rng(11);

  // Tyre paint: dark rubber with dust toward the bottom
  const rubber = paint((p, n) => {
    const dust = smoothstep(0.55, 0.0, p.y) * 0.55;
    const nz = noise(p, 0.12, 3);
    const base: [number, number, number] = [0.08 + nz * 0.05, 0.08 + nz * 0.05, 0.1 + nz * 0.05];
    return mix(base, "#7a6a55", dust * (0.6 + 0.4 * nz));
  });
  const hubPaint = paint((p, n) => {
    const t = noise(p, 0.05, 7);
    return mix("#6a7284", "#b5bdcb", t * 0.8 + Math.max(0, n.y) * 0.2);
  });

  const logo = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#15171c" stroke="#e7b814" stroke-width="5"/>
    <path d="M32 12 L50 44 L14 44 Z" fill="none" stroke="#2ff3ff" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="32" cy="36" r="4" fill="#ff2fb4"/></svg>`,
    { size: 96 },
  );
  const rimTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="none" stroke="#fff" stroke-width="6"/></svg>`,
    { size: 96 },
  );

  const tyreGeo = new THREE.CylinderGeometry(R, R, W, 10, 1);
  const shoulderGeo = new THREE.CylinderGeometry(R * 0.92, R * 0.92, W + 0.04, 10, 1);
  const treadGeo = new THREE.BoxGeometry(0.17, 0.09, 0.13);
  const hubGeo = new THREE.CylinderGeometry(0.33, 0.36, 0.1, 6);
  const rimGeo = new THREE.TorusGeometry(0.38, 0.03, 4, 10);
  const lugGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6);
  const capGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.06, 8);
  const discGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.03, 12);
  const caliperGeo = new THREE.BoxGeometry(0.08, 0.16, 0.12);
  const logoGeo = new THREE.CircleGeometry(0.08, 10);
  const rimDiscGeo = new THREE.CircleGeometry(0.43, 10);

  const wheels: [string, number, number][] = [
    ["wheelFL", 1, 2.9],
    ["wheelFR", -1, 2.9],
    ["wheelML", 1, -0.9],
    ["wheelMR", -1, -0.9],
    ["wheelRL", 1, -2.5],
    ["wheelRR", -1, -2.5],
  ];

  for (const [name, s, z] of wheels) {
    const j = J[name];
    const cx = s * 1.35;
    const cy = R;
    const c = [cx, cy, z];
    const dirX: [number, number, number] = [s, 0, 0];
    const at = (o: number): [number, number, number] => [cx + s * o, cy, z];

    // tyre body (axis along x)
    b.part(tyreGeo, rubber, { bone: j, at: c, dir: dirX, flat: true });
    b.part(shoulderGeo, P.tyre, { bone: j, at: c, dir: dirX, flat: true });

    // tread blocks around circumference
    const N = 14;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const py = cy + Math.sin(a) * (R + 0.03);
      const pz = z + Math.cos(a) * (R + 0.03);
      const side = i % 2 ? 0.1 : -0.1;
      b.part(treadGeo, P.tyre, {
        bone: j,
        at: [cx + side * s, py, pz],
        rotation: [(-a * 180) / Math.PI, 0, 0],
        flat: true,
      });
    }

    // outer face: dark rim plate + hub
    const out = s * (W / 2 + 0.005);
    b.part(rimDiscGeo, P.hullDark, { bone: j, at: at(W / 2 + 0.005), dir: dirX, axis: "z" });
    b.part(hubGeo, hubPaint, { bone: j, at: at(W / 2 + 0.03), dir: dirX, flat: true });
    glow(
      b.part(rimGeo, P.neonCyan, { bone: j, at: at(W / 2 + 0.02), dir: dirX, axis: "z", flat: true }),
      1.6,
    );
    b.part(capGeo, P.steel, { bone: j, at: at(W / 2 + 0.09), dir: dirX, flat: true });
    b.part(logoGeo, "#ffffff", { bone: j, at: at(W / 2 + 0.125), dir: dirX, axis: "z", texture: logo });

    // lug nuts
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.26;
      b.part(lugGeo, P.hub, {
        bone: j,
        at: [cx + s * (W / 2 + 0.09), cy + Math.sin(a) * 0.23, z + Math.cos(a) * 0.23],
        dir: dirX,
        flat: true,
      });
    }

    // inner side: brake disc and caliper behind
    b.part(discGeo, P.steel, { bone: j, at: at(-W / 2 + 0.04), dir: dirX, flat: true });
    b.part(hubGeo, P.hullDark, { bone: j, at: at(-W / 2 - 0.02), dir: dirX, flat: true });
    b.part(caliperGeo, P.warnRed, { bone: j, at: [cx - s * (W / 2 - 0.06), cy + 0.28, z - 0.06], flat: true });
    // axle stub toward chassis
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.25, 8), P.hullDark, {
      bone: j,
      at: at(-W / 2 - 0.12),
      dir: dirX,
    });
    // hazard tick on tyre outer wall
    b.part(new THREE.BoxGeometry(0.02, 0.12, 0.2), P.trim, {
      bone: j,
      at: [out + cx, cy + R * 0.78, z + (rand() - 0.5) * 0.1],
    });
  }
}
    return buildWheels;
  })(),
  // cargoPod
  (() => {
function buildCargoPod({ b, J, P, M }: any) {
  const BODY = J.body;
  const HATCH = J.podHatch;
  const CY = M.podCenter[1]; // 2.35
  const CZ = -1.5;
  const fr = (x: number) => x - Math.floor(x);

  // ---------- textures ----------
  const bioSvg = svg(
    `<svg viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="8" fill="#e7b814" stroke="#15171c" stroke-width="5"/>
    <circle cx="50" cy="52" r="8" fill="none" stroke="#15171c" stroke-width="5"/>
    <g fill="none" stroke="#15171c" stroke-width="6" stroke-linecap="round">
    <path d="M50 44 A18 18 0 0 1 72 30"/><path d="M42 56 A18 18 0 0 1 24 34"/><path d="M58 58 A18 18 0 0 1 50 80"/></g>
    <g fill="#15171c"><circle cx="72" cy="28" r="9"/><circle cx="24" cy="32" r="9"/><circle cx="50" cy="82" r="9"/></g></svg>`,
    { size: 192 },
  );
  const warnSvg = svg(
    `<svg viewBox="0 0 100 100"><path d="M50 6 L96 90 H4Z" fill="#d8321f" stroke="#15171c" stroke-width="5" stroke-linejoin="round"/>
    <rect x="45" y="34" width="10" height="30" fill="#fff"/><rect x="45" y="70" width="10" height="10" fill="#fff"/></svg>`,
    { size: 192 },
  );
  let bars = "";
  const r = (i: number) => 1 + ((i * 7) % 4);
  let x = 6;
  for (let i = 0; x < 92; i++) {
    const w = r(i);
    bars += `<rect x="${x}" y="8" width="${w}" height="38" fill="#15171c"/>`;
    x += w + 1 + (i % 3);
  }
  const barSvg = svg(
    `<svg viewBox="0 0 100 64"><rect width="100" height="64" rx="4" fill="#f2f4f7" stroke="#15171c" stroke-width="2"/>${bars}
    <text x="50" y="58" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11" fill="#15171c">0457-LKJ-7741</text></svg>`,
    { size: 192 },
  );
  const serialSvg = svg(
    `<svg viewBox="0 0 100 64"><rect width="100" height="64" rx="4" fill="#15171c"/>
    <rect x="3" y="3" width="94" height="58" rx="3" fill="none" stroke="#e7b814" stroke-width="2" stroke-dasharray="6 3"/>
    <text x="50" y="28" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#e7b814">PX-7741</text>
    <text x="50" y="50" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="12" fill="#d8321f">SEALED</text></svg>`,
    { size: 192 },
  );
  const glyphSvg = svg(
    `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="6" fill="#232833"/>
    <g fill="none" stroke="#2ff3ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 24 H80 M50 12 V88 M26 46 H74"/><path d="M26 66 L50 88 L76 66"/><rect x="30" y="52" width="40" height="14" stroke-width="4"/></g></svg>`,
    { size: 192 },
  );
  const sealSvg = svg(
    `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#ff2fb4"/>
    <g fill="none" stroke="#fff" stroke-width="3"><circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="30" stroke="#5a0a45"/>
    <path d="M50 8 V92 M8 50 H92" stroke="#5a0a45" stroke-width="2"/></g>
    <rect x="38" y="42" width="24" height="26" fill="#5a0a45"/><path d="M42 42 V34 A8 8 0 0 1 58 34 V42" fill="none" stroke="#5a0a45" stroke-width="4"/></svg>`,
    { size: 192 },
  );

  // ---------- paints ----------
  const podPaint = paint((p, n) => {
    const side = Math.abs(n.z) < 0.7;
    let c: any = P.pod;
    // dirt toward bottom
    const dirt = smoothstep(2.35, 1.5, p.y) * (0.4 + 0.6 * noise(p, 0.5, 3));
    c = mix(c, P.podDark, dirt * 0.8);
    if (dirt > 0.55) c = mix(c, P.rust, (dirt - 0.55) * 0.9);
    if (side && (p.z > 0.55 || p.z < -3.55)) {
      const k = Math.floor((p.z + p.y * 0.9 + p.x * 0.9) / 0.16) & 1;
      return k ? P.trim : P.hazardBlack;
    }
    const dz = fr(p.z / 0.9) * 0.9;
    if (side) {
      if (dz < 0.012) return mix(c, P.hullDark, 0.85);
      if (dz > 0.035 && dz < 0.05 && fr(p.y / 0.22) < 0.22) return mix(c, "#ffffff", 0.7);
    } else {
      const du = fr(p.x / 0.8) * 0.8;
      const dv = fr(p.y / 0.8) * 0.8;
      if (du < 0.012 || dv < 0.012) return mix(c, P.hullDark, 0.85);
    }
    return c;
  });

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: BODY, at, ...opts });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], dir: number[], bone = BODY) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, dir });

  // ---------- main hull: chamfered hex capsule ----------
  const hex = (sx: number, sy: number): number[][] => [
    [-0.75 * sx, -0.9 * sy],
    [0.75 * sx, -0.9 * sy],
    [1.2 * sx, -0.45 * sy],
    [1.2 * sx, 0.45 * sy],
    [0.75 * sx, 0.9 * sy],
    [-0.75 * sx, 0.9 * sy],
    [-1.2 * sx, 0.45 * sy],
    [-1.2 * sx, -0.45 * sy],
  ];
  b.extrude(hex(1, 1), {
    at: [0, CY, CZ],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 5.4,
    bevel: 0.07,
    color: podPaint,
    bone: BODY,
  });
  // end caps: slightly smaller faceted domes
  for (const z of [1.2, -4.2]) {
    const s = z > 0 ? 1 : -1;
    b.extrude(hex(0.8, 0.8), {
      at: [0, CY, z + s * 0.04],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.1,
      color: P.hullDark,
      bone: BODY,
    });
  }

  // reinforcement rings
  for (const z of [-0.1, -1.5, -2.9]) {
    b.extrude(hex(1.035, 1.045), {
      at: [0, CY, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.14,
      bevel: 0.03,
      color: P.hullDark,
      bone: BODY,
    });
    for (const sx of [1, -1])
      for (const yy of [-0.2, 0.2])
        cyl(0.025, 0.025, 0.03, 6, P.steel, [sx * 1.25, CY + yy, z], [sx, 0, 0]);
  }

  // ---------- straps + clamps ----------
  const strapZ = [0.5, -0.7, -2.3, -3.5];
  for (const z of strapZ) {
    const pts = [
      [-1.265, CY - 0.5, z],
      [-1.265, CY + 0.47, z],
      [-0.78, CY + 0.955, z],
      [0.78, CY + 0.955, z],
      [1.265, CY + 0.47, z],
      [1.265, CY - 0.5, z],
    ];
    b.sweep(polyline(pts), () => [0.09, 0.03], { section: "box", color: P.strap, bone: BODY, skin: "rigid" });
    for (const sx of [1, -1]) {
      box(0.12, 0.3, 0.2, P.steel, [sx * 1.34, CY + 0.1, z]);
      box(0.05, 0.05, 0.16, P.warnRed, [sx * 1.4, CY + 0.2, z]);
      box(0.1, 0.06, 0.2, P.hullDark, [sx * 1.33, CY - 0.1, z]);
    }
    // top buckle
    box(0.3, 0.05, 0.14, P.steel, [0, CY + 0.96, z]);
  }

  // ---------- cyan status strips + decals ----------
  for (const sx of [1, -1])
    for (const z of [-0.4, -1.1, -1.9, -2.6, -3.2]) {
      glow(box(0.035, 0.07, 0.3, P.neonCyan, [sx * 1.215, CY - 0.4, z]), 1.6);
    }
  const decal = (tex: any, sx: number, z: number, y: number, w: number, h: number) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      bone: BODY,
      at: [sx * 1.208, y, z],
      dir: [sx, 0, 0],
      axis: "z",
      texture: tex,
    });
  decal(bioSvg, 1, -1.1, CY + 0.05, 0.6, 0.6);
  decal(barSvg, 1, -1.9, CY + 0.05, 0.55, 0.36);
  decal(glyphSvg, 1, -2.6, CY + 0.05, 0.4, 0.4);
  decal(warnSvg, -1, -1.1, CY + 0.05, 0.55, 0.55);
  decal(serialSvg, -1, -1.9, CY + 0.05, 0.55, 0.36);
  decal(glyphSvg, -1, -2.6, CY + 0.05, 0.4, 0.4);
  // end-band warnings
  decal(warnSvg, 1, 0.9, CY + 0.05, 0.4, 0.4);
  decal(warnSvg, -1, 0.9, CY + 0.05, 0.4, 0.4);

  // ---------- top: vent hatch, antenna, lifting eyes ----------
  const topY = CY + 0.9;
  box(0.6, 0.08, 0.6, P.hullDark, [0, topY + 0.03, -1.5]);
  for (let i = -2; i <= 2; i++) box(0.5, 0.03, 0.04, P.steel, [0, topY + 0.09, -1.5 + i * 0.1]);
  cyl(0.02, 0.02, 0.8, 6, P.steel, [0.7, topY + 0.4, -2.9], [0, 1, 0]);
  glow(b.part(new THREE.SphereGeometry(0.045, 6, 4), P.warnRed, { bone: BODY, at: [0.7, topY + 0.82, -2.9] }), 2);
  box(0.14, 0.1, 0.14, P.hullDark, [0.7, topY + 0.03, -2.9]);
  for (const sx of [1, -1]) {
    box(0.18, 0.06, 0.18, P.hullDark, [sx * 0.55, topY + 0.02, -1.1]);
    b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), P.steel, { bone: BODY, at: [sx * 0.55, topY + 0.12, -1.1] });
  }

  // ---------- deck brackets ----------
  for (const sx of [1, -1])
    for (const z of [0.85, -3.85, -1.5]) {
      box(0.5, 0.1, 0.45, P.hullDark, [sx * 1.15, 1.5, z]);
      box(0.12, 0.3, 0.4, P.steel, [sx * 1.0, 1.65, z], { rotation: [0, 0, sx * 40] });
      for (const dz of [-0.14, 0.14]) cyl(0.03, 0.03, 0.04, 6, P.steel, [sx * 1.3, 1.56, z + dz], [0, 1, 0]);
    }

  // ---------- front-face pipes and cables ----------
  for (const sx of [1, -1]) {
    const x0 = sx * 0.5;
    b.sweep(
      polyline([
        [x0, 2.0, 1.17],
        [x0, 2.0, 1.34],
        [x0, 2.7, 1.34],
        [x0, 2.7, 1.17],
      ]),
      0.05,
      { color: P.steel, bone: BODY, skin: "rigid" },
    );
    box(0.14, 0.14, 0.1, P.warnRed, [x0, 2.35, 1.36]);
    cyl(0.06, 0.06, 0.04, 8, P.hullDark, [x0, 2.0, 1.2], [0, 0, 1]);
    cyl(0.06, 0.06, 0.04, 8, P.hullDark, [x0, 2.7, 1.2], [0, 0, 1]);
    b.sweep(
      catmull([
        [sx * 0.2, 2.0, 1.2],
        [sx * 0.3, 1.8, 1.32],
        [sx * 0.8, 1.75, 1.3],
        [sx * 1.0, 2.0, 1.2],
      ]),
      0.025,
      { color: P.strap, bone: BODY, skin: "rigid" },
    );
  }
  glow(box(0.5, 0.05, 0.03, P.neonCyan, [0, 2.65, 1.255]), 1.4);

  // ---------- rear: seal-lock hatch on podHatch ----------
  const RZ = -4.2;
  cyl(0.78, 0.78, 0.06, 8, P.hullDark, [0, CY, RZ - 0.02], [0, 0, -1], HATCH);
  const hatchFace = b.part(new THREE.CircleGeometry(0.62, 8), "#ffffff", {
    bone: HATCH,
    at: [0, CY, RZ - 0.06],
    dir: [0, 0, -1],
    axis: "z",
    texture: sealSvg,
  });
  glow(hatchFace, 1.8);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    cyl(0.04, 0.04, 0.06, 6, P.steel, [Math.cos(a) * 0.7, CY + Math.sin(a) * 0.7, RZ - 0.07], [0, 0, -1], HATCH);
  }
  b.part(new THREE.TorusGeometry(0.28, 0.04, 5, 8), P.steel, { bone: HATCH, at: [0, CY, RZ - 0.14] });
  box(0.56, 0.05, 0.05, P.steel, [0, CY, RZ - 0.14], { bone: HATCH });
  box(0.05, 0.56, 0.05, P.steel, [0, CY, RZ - 0.14], { bone: HATCH });
  cyl(0.07, 0.07, 0.1, 6, P.trim, [0, CY, RZ - 0.15], [0, 0, -1], HATCH);
  // warning plates beside hatch
  for (const sx of [1, -1])
    b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", {
      bone: BODY,
      at: [sx * 0.95, CY - 0.3, RZ - 0.04],
      dir: [0, 0, -1],
      axis: "z",
      texture: sx > 0 ? warnSvg : bioSvg,
    });
  glow(box(1.0, 0.04, 0.03, P.neonMagenta, [0, CY - 0.8, RZ - 0.03]), 1.5);
}
    return buildCargoPod;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "convoyHauler" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["cab"] = b.joint("cab", { parent: J["body"], at: [0,1.3,2.6], dir: [0,0,1], role: "hinge", group: "cab" });
  J["turretBase"] = b.joint("turretBase", { parent: J["cab"], at: [0,2.55,1.9], dir: [0,1,0], role: "hinge", group: "turret" });
  J["gunPitch"] = b.joint("gunPitch", { parent: J["turretBase"], at: [0,2.95,2], dir: [0,0,1], role: "hinge", group: "turret" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.35,0.62,2.9], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.35,0.62,2.9], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.35,0.62,-0.9], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.35,0.62,-0.9], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.35,0.62,-2.5], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.35,0.62,-2.5], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["podHatch"] = b.joint("podHatch", { parent: J["body"], at: [0,2.35,-4.2], dir: [0,0,-1], role: "hinge", group: "cargo" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
