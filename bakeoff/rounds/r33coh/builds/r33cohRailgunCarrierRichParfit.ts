import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, rng, mix, noise, smoothstep } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Six-Wheeled Railgun Carrier",
  "description": "A low-poly sci-fi military six-wheeled heavy carrier with a long electromagnetic railgun on a turret, braced on four deployed hydraulic stabiliser legs."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#4b5a43",
  hullDark: "#2f3a2c",
  armorLight: "#6f7f62",
  steel: "#6a7078",
  gunmetal: "#2b2f36",
  rubber: "#17181b",
  hazard: "#e7b814",
  neonCyan: "#2ff3ff",
  glass: "#1c3a4a",
  lampWhite: "#fff4c8",
  red: "#c23a2b",
  decalWhite: "#e8e8e0",
  hydraulic: "#b8bcc4",
};
const M = {
  deckTop: [0, 1.9, -0.5] as [number, number, number],
  cabRoof: [0, 2.7, 3.6] as [number, number, number],
  turretRing: [0, 1.9, -1.8] as [number, number, number],
  gunPivot: [0, 2.9, -1.8] as [number, number, number],
  frontAxle: [0, 0.75, 3.7] as [number, number, number],
  midAxle: [0, 0.75, -0.6] as [number, number, number],
  rearAxle: [0, 0.75, -3] as [number, number, number],
  stabFL: [1.55, 1.1, 0.4] as [number, number, number],
  stabRL: [1.55, 1.1, -3.6] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const hullPaint = panelled(P.hull, { size: 0.5, aspect: 0.6, rivets: 0.12 });
  const darkPaint = panelled(P.hullDark, { size: 0.4, rivets: 0.1 });
  const lightPaint = panelled(P.armorLight, { size: 0.45, rivets: 0.1 });
  const grime = paint((p, n) => {
    const c = mix(P.hullDark, P.hull, smoothstep(0.1, 0.9, n.y * 0.5 + 0.5));
    return mix(c, "#1a1a14", 0.5 * smoothstep(0.5, 0.8, noise(p, 0.5, 3)) * (1 - smoothstep(0, 1, p.y / 1.2)));
  });

  const box = (w: number, h: number, d: number, col: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at: [x, y, z], flat: true, ...o });

  for (const s of [1, -1]) {
    box(0.22, 0.3, 7.4, P.gunmetal, s * 0.9, 0.85, -1.7);
    box(0.5, 0.06, 7.4, P.steel, s * 0.9, 0.72, -1.7);
  }
  for (let i = 0; i < 7; i++) box(1.9, 0.14, 0.18, P.gunmetal, 0, 0.88, -5 + i * 1.1);
  box(1.6, 0.12, 7.2, P.gunmetal, 0, 0.76, -1.7);
  box(3.5, 0.7, 7.3, hullPaint, 0, 1.4, -1.75);
  box(3.7, 0.12, 7.5, lightPaint, 0, 1.94, -1.65);
  const haz = svg(
    `<svg viewBox="0 0 64 8"><rect width="64" height="8" fill="#e7b814"/>${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 8} 8 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8 + 4} 8Z" fill="#17181b"/>`).join("")}</svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.1, 7.4), "#ffffff", { bone, at: [s * 1.8, 1.941, -1.65], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: haz });
  }
  b.part(new THREE.PlaneGeometry(0.1, 3.6), "#ffffff", { bone, at: [0, 1.941, -5.3], dir: [0, 1, 0], axis: "z", up: [1, 0, 0], texture: haz });
  for (const s of [1, -1]) {
    for (const z of [-2.1, 1.0]) {
      b.part(new THREE.BoxGeometry(0.1, 0.8, 2.4), darkPaint, { bone, at: [s * 1.82, 1.25, z], rotation: [0, 0, s * -6], flat: true });
      box(0.04, 0.3, 2.0, P.hazard, s * 1.88, 1.6, z);
    }
    for (const z of [-3, -0.6]) {
      box(0.5, 0.12, 1.9, P.hullDark, s * 1.62, 1.62, z);
      box(0.1, 0.5, 1.9, P.hullDark, s * 1.85, 1.38, z);
      box(0.5, 0.08, 0.2, P.hazard, s * 1.62, 1.69, z);
    }
    box(0.2, 0.55, 1.4, darkPaint, s * 1.8, 1.3, -1.8);
    box(0.04, 0.4, 1.2, P.hullDark, s * 1.92, 1.3, -1.8);
    b.rod([s * 1.95, 1.35, -2.3], [s * 1.95, 1.35, -2.0], 0.02, P.steel, { bone });
    for (const z of [0.4, -3.6]) {
      box(0.4, 0.5, 0.6, P.gunmetal, s * 1.7, 1.1, z);
      b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 8), P.steel, { bone, at: [s * 1.85, 1.1, z], dir: [s, 0, 0] });
    }
  }
  box(3.0, 0.5, 0.16, P.hullDark, 0, 1.5, 2.1);
  b.part(new THREE.BoxGeometry(3.4, 0.1, 0.6), lightPaint, { bone, at: [0, 1.3, -5.15], rotation: [-35, 0, 0], flat: true });
  box(3.6, 0.9, 0.2, darkPaint, 0, 1.4, -5.3);
  for (const s of [1, -1]) box(0.5, 0.2, 0.06, P.red, s * 1.2, 1.1, -5.37);
  b.part(new THREE.CylinderGeometry(1.35, 1.45, 0.12, 16), P.gunmetal, { bone, at: [0, 2.04, -1.8], flat: true });
  b.part(new THREE.CylinderGeometry(1.2, 1.2, 0.05, 16), P.steel, { bone, at: [0, 2.0, -1.8], flat: true });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    box(0.1, 0.06, 0.1, P.steel, Math.sin(a) * 1.38, 1.99, -1.8 + Math.cos(a) * 1.38);
  }
  for (const [x, z] of [[-1.2, 0.6], [1.2, 0.6], [-1.2, -4.4], [1.2, -4.4]]) {
    box(0.7, 0.05, 0.7, P.hullDark, x, 1.99, z);
    box(0.5, 0.03, 0.5, P.armorLight, x, 1.995, z);
    b.part(new THREE.TorusGeometry(0.07, 0.01, 5, 8), P.steel, { bone, at: [x, 1.99, z], rotation: [90, 0, 0] });
  }
  for (let i = 0; i < 8; i++) {
    const s = i % 2 ? 1 : -1;
    b.part(new THREE.TorusGeometry(0.08, 0.01, 5, 8), P.steel, { bone, at: [s * 1.7, 1.99, -4.6 + Math.floor(i / 2) * 1.8 + 0.4], rotation: [90, 0, 0] });
  }
  const stencil = svg(
    `<svg viewBox="0 0 128 48"><text x="64" y="34" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="30" fill="#e8e8e0">RG-06</text></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(1.1, 0.4), "#ffffff", { bone, at: [s * 1.9, 1.2, 1.0], dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: stencil });
  b.part(new THREE.PlaneGeometry(1.2, 0.4), "#ffffff", { bone, at: [0, 1.6, -5.405], dir: [0, 0, -1], axis: "z", texture: stencil });
  for (const s of [1, -1])
    for (const z of [-4.8, 1.8]) b.part(new THREE.BoxGeometry(0.06, 0.1, 0.25), P.neonCyan, { bone, at: [s * 1.82, 1.85, z], flat: true });
  box(3.2, 0.05, 7, grime, 0, 1.04, -1.7);
}
    return buildChassis;
  })(),
  // cabShell
  (() => {
function buildCabShell({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const armor = panelled(
    paint((p, n) => mix(P.hull, P.armorLight, 0.55 * n.y + 0.2 * noise(p, 0.5, 3))),
    { size: 0.5, aspect: 0.8, rivets: 0.12 },
  );
  const dark = panelled(P.hullDark, { size: 0.4, rivets: 0.1 });
  const box = (w: number, h: number, d: number, col: any, at: number[], rot?: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, rotation: rot, flat: true, ...opt });

  // main faceted body: lower box + sloped upper via loft
  b.loft(
    [
      { at: [0, 2.15, 2.5], w: 1.7, h: 0.45 },
      { at: [0, 2.35, 3.5], w: 1.7, h: 0.55 },
      { at: [0, 2.45, 4.6], w: 1.5, h: 0.45 },
    ],
    { bone, color: armor, section: "box", caps: "flat" },
  );
  // sloped windscreen frame
  box(2.9, 0.12, 1.1, dark, [0, 2.95, 4.2], [-28, 0, 0]);
  // roof
  box(3.0, 0.14, 2.0, armor, [0, 3.0, 3.4]);
  // glazing
  const GL = svg(
    `<svg viewBox="0 0 100 24"><rect width="100" height="24" rx="3" fill="#1c3a4a"/><path d="M6 20 L30 4 M20 20 L44 4 M60 20 L84 4" stroke="#2ff3ff" stroke-width="3" opacity="0.7"/></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(2.6, 0.5), "#ffffff", { bone, at: [0, 2.78, 4.52], dir: [0, 0.45, 1], axis: "z", texture: GL });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(1.1, 0.38), "#ffffff", { bone, at: [s * 1.76, 2.7, 3.5], dir: [s, 0, 0], axis: "z", texture: GL });
    // side armour plates
    box(0.14, 0.7, 1.9, armor, [s * 1.73, 2.2, 3.5]);
    box(0.1, 0.5, 0.9, dark, [s * 1.84, 2.2, 3.5]);
    // door handle
    box(0.08, 0.06, 0.22, P.steel, [s * 1.87, 2.35, 3.1]);
    // mirror arm + mirror
    b.rod([s * 1.7, 2.75, 4.2], [s * 1.76, 2.85, 4.3], 0.02, P.gunmetal, { bone, caps: "flat" });
    box(0.05, 0.28, 0.2, P.gunmetal, [s * 1.77, 2.9, 4.3]);
    // mud flaps
    box(0.06, 0.45, 0.5, P.rubber, [s * 1.75, 1.95, 2.5]);
    // hazard stripe
    for (let i = 0; i < 6; i++)
      box(0.05, 0.1, 0.12, i % 2 ? P.gunmetal : P.hazard, [s * 1.88, 1.9, 2.5 + i * 0.12 * 2], [0, 0, 0]);
  }
  // front hazard band
  for (let i = 0; i < 9; i++)
    box(0.3, 0.1, 0.05, i % 2 ? P.gunmetal : P.hazard, [-1.2 + i * 0.3, 2.0, 4.66]);
  // roof hatch
  b.part(new THREE.CylinderGeometry(0.4, 0.45, 0.12, 8), P.steel, { bone, at: [0.7, 3.14, 3.2], flat: true });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 6), P.hazard, { bone, at: [0.7, 3.22, 3.2], flat: true });
  // antenna mast
  b.rod([-1.3, 3.05, 2.5], [-1.3, 3.15, 2.5], 0.025, P.gunmetal, { bone, caps: "flat" });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.red, { bone, at: [-1.3, 3.16, 2.5] }), 1.5);
  // sensor pod
  b.part(new THREE.SphereGeometry(0.2, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.gunmetal, { bone, at: [-0.7, 3.0, 4.0], flat: true });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), P.neonCyan, { bone, at: [-0.7, 3.1, 4.15] }), 1.5);
  // emblem
  const EM = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#e8e8e0" stroke="#17181b" stroke-width="4"/><path d="M32 10 L50 46 L32 38 L14 46Z" fill="#c23a2b" stroke="#17181b" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { bone, at: [1.945, 2.2, 3.5], dir: [1, 0, 0], axis: "z", texture: EM });
  b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { bone, at: [-1.945, 2.2, 3.5], dir: [-1, 0, 0], axis: "z", texture: EM });
  // cab base skirt
  box(3.5, 0.35, 2.6, dark, [0, 1.9, 3.5]);
}
    return buildCabShell;
  })(),
  // cabFront
  (() => {
function buildCabFront({ b, J, P }: any) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, col: any, x: number, y: number, z: number, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at: [x, y, z], rotation: rot, flat: true });
  const cyl = (rt: number, rb: number, len: number, seg: number, col: any, at: number[], rot: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, len, seg), col, { bone, at, rotation: rot, flat: true });

  const plate = paint((p: any, n: any) => {
    let c: any = mix(P.hull, P.armorLight, smoothstep(0.3, 0.9, n.y) * 0.6 + noise(p, 0.3, 4) * 0.2);
    const u = Math.abs(((p.x + 5) / 0.45) % 1 - 0.5);
    if (u < 0.012) c = mix(c, P.hullDark, 0.8);
    return c;
  });

  // sloped hood
  box(3.0, 0.45, 0.7, plate, 0, 1.8, 5.1, [-10, 0, 0]);
  box(3.4, 0.7, 0.4, plate, 0, 1.15, 5.2);
  box(3.0, 0.15, 0.5, P.hullDark, 0, 1.5, 5.2, [8, 0, 0]);

  // grille
  box(1.7, 0.6, 0.04, P.gunmetal, 0, 1.4, 5.42);
  for (let i = 0; i < 6; i++) box(1.6, 0.05, 0.05, P.steel, 0, 1.18 + i * 0.1, 5.45);

  for (const s of [1, -1]) {
    box(0.5, 0.3, 0.1, P.hullDark, s * 1.2, 1.55, 5.4);
    glow(b.part(new THREE.CylinderGeometry(0.11, 0.13, 0.05, 8), P.lampWhite, { bone, at: [s * 1.2, 1.55, 5.48], rotation: [90, 0, 0], flat: true }), 1.6);
    box(0.3, 0.22, 0.08, P.gunmetal, s * 1.5, 1.0, 5.4);
    glow(b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 6), P.lampWhite, { bone, at: [s * 1.5, 1.0, 5.47], rotation: [90, 0, 0], flat: true }), 1.2);
    glow(box(0.35, 0.04, 0.04, P.neonCyan, s * 0.9, 1.75, 5.4), 1.3);
    // fenders
    box(0.6, 0.1, 0.8, P.hullDark, s * 1.55, 1.9, 5.2);
    box(0.1, 0.4, 0.8, P.hull, s * 1.85, 1.65, 5.2);
    box(0.1, 0.4, 0.8, P.hull, s * 1.25, 1.65, 5.2);
    // tow hooks
    cyl(0.05, 0.05, 0.2, 6, P.red, [s * 0.9, 0.7, 5.45], [90, 0, 0]);
    box(0.2, 0.06, 0.06, P.red, s * 0.9, 0.7, 5.56);
    // bull-bar uprights
    box(0.12, 1.0, 0.08, P.steel, s * 1.0, 1.2, 5.54);
  }

  // bumper
  box(3.7, 0.3, 0.25, P.gunmetal, 0, 0.7, 5.35);
  for (let i = 0; i < 9; i++) box(0.2, 0.31, 0.27, i % 2 ? P.gunmetal : P.hazard, -1.6 + i * 0.4, 0.7, 5.35);

  // bull bar
  box(2.4, 0.1, 0.08, P.steel, 0, 1.7, 5.54);
  box(2.4, 0.1, 0.08, P.steel, 0, 0.9, 5.54);
  for (let i = 0; i < 6; i++) box(0.2, 0.11, 0.09, i % 2 ? P.steel : P.hazard, -1.0 + i * 0.4 + 0.2, 1.7, 5.54);

  // winch
  cyl(0.12, 0.12, 1.0, 8, P.gunmetal, [0, 0.95, 5.4], [0, 0, 90]);
  for (const s of [1, -1]) cyl(0.17, 0.17, 0.06, 8, P.steel, [s * 0.52, 0.95, 5.4], [0, 0, 90]);
  b.sweep([[-0.4, 0.95, 5.53], [0, 0.86, 5.54], [0.4, 0.95, 5.53]], 0.015, { bone, color: P.hydraulic });
  box(0.16, 0.14, 0.08, P.red, 0.45, 0.95, 5.55);

  // plate decal
  const tex = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" rx="3" fill="#e8e8e0" stroke="#2b2f36" stroke-width="2"/><text x="32" y="23" font-size="18" text-anchor="middle" font-family="monospace" font-weight="bold" fill="#2b2f36">RG-06</text></svg>`, { size: 128 });
  b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", { bone, at: [0, 0.7, 5.49], dir: [0, 0, 1], axis: "z", texture: tex });
}
    return buildCabFront;
  })(),
  // wheels
  (() => {
function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.75; // tyre radius, axle at y=0.75
  const W = 0.62; // tyre width
  const treadPaint = paint((p, n) => {
    const k = noise(p, 0.12, 4);
    const c = mix("#101114", "#222428", smoothstep(0.3, 0.8, k));
    return c;
  });
  const hubPaint = metal("steel", { tarnish: 0.3 });
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#c23a2b" stroke="#111" stroke-width="4"/><path d="M32 10 L50 46 L32 38 L14 46Z" fill="#e8e8e0" stroke="#111" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  const sides: [string, number, number][] = [
    ["FL", 1, 3.7], ["FR", -1, 3.7], ["ML", 1, -0.6], ["MR", -1, -0.6], ["RL", 1, -3], ["RR", -1, -3],
  ];
  const ax = (s: number): [number, number, number] => [s, 0, 0];
  const rot = (s: number) => new THREE.Euler(0, 0, -s * Math.PI / 2);

  for (const [id, s, z] of sides) {
    const bone = J["wheel" + id];
    const cx = 1.95;
    const at = (o: number, y = 0, zz = 0): [number, number, number] => [s * (cx + o), 0.75 + y, z + zz];
    // tyre
    b.lathe(
      [[0.36, -W / 2], [0.68, -W / 2], [R - 0.02, -W / 2 + 0.08], [R, -W / 2 + 0.2], [R, W / 2 - 0.2], [R - 0.02, W / 2 - 0.08], [0.68, W / 2], [0.36, W / 2]],
      { at: at(0), axis: ax(s), segments: 16, bone, color: treadPaint, name: "tyre" + id },
    );
    // tread blocks
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(W * 0.8, 0.06, 0.12), P.rubber, {
        bone,
        at: at(0, Math.sin(a) * (R + 0.01), Math.cos(a) * (R + 0.01)),
        rotation: [(-a * 180) / Math.PI, 0, 0],
        name: "tread" + id + i,
      });
    }
    // rim disc & hub
    const out = s * 1; // outward
    b.part(new THREE.CylinderGeometry(0.46, 0.46, 0.1, 12), hubPaint, {
      bone, at: at(s * 0.3 - s * 0 + 0 , 0), dir: ax(s),
    });
    b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.16, 8), P.steel, {
      bone, at: at(0.34), dir: ax(s), name: "hub" + id,
    });
    // spokes
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const p0 = at(0.33, Math.sin(a) * 0.2, Math.cos(a) * 0.2);
      const p1 = at(0.33, Math.sin(a) * 0.5, Math.cos(a) * 0.5);
      b.rod(p0, p1, 0.04, P.gunmetal, { bone, sides: 4 });
      // bolts
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), P.hazard, {
        bone, at: at(0.4, Math.sin(a + 0.5) * 0.15, Math.cos(a + 0.5) * 0.15), dir: ax(s),
      });
    }
    // cap with decal
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
      bone, at: at(0.43), dir: ax(s), axis: "z", up: [0, 1, 0], texture: emblem,
    });
    // brake disc & caliper (inner)
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 12), P.hydraulic, { bone, at: at(-0.2), dir: ax(s) });
    b.part(new THREE.BoxGeometry(0.1, 0.18, 0.12), P.red, { bone, at: at(-0.2, 0.3, 0.05) });
    // axle stub
    b.rod(at(-0.3), at(-0.05), 0.1, P.gunmetal, { bone, sides: 8 });
  }
  // axle housings & differentials
  for (const z of [3.7, -0.6, -3]) {
    b.rod([-1.6, 0.75, z], [1.6, 0.75, z], 0.14, P.gunmetal, { bone: J.body, sides: 8 });
    b.part(new THREE.SphereGeometry(0.34, 8, 6), P.steel, { bone: J.body, at: [0, 0.75, z], scale: [1, 0.9, 1.1], flat: true });
    glow(b.part(new THREE.BoxGeometry(0.08, 0.04, 0.08), P.neonCyan, { bone: J.body, at: [0, 0.75, z + 0.38] }), 1.2);
    for (const s of [1, -1])
      b.part(new THREE.CylinderGeometry(0.2, 0.17, 0.5, 8), P.gunmetal, { bone: J.body, at: [s * 1.45, 0.75, z], dir: [s, 0, 0] });
  }
}
    return buildWheels;
  })(),
  // stabilisers
  (() => {
function buildStabilisers({ b, J, P }: any) {
  const stripeTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 16 - 4} 16 L${i * 16 + 4} 0 L${i * 16 + 12} 0 L${i * 16 + 4} 16Z" fill="#17181b"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const armor = paint((p, n) =>
    mix(mix(P.hullDark, P.hull, smoothstep(0.2, 0.8, noise(p, 0.3, 4))), P.armorLight, Math.max(0, n.y) * 0.4),
  );
  const steelP = paint((p, n) => mix(P.steel, P.hydraulic, noise(p, 0.1, 2) * 0.6 + Math.max(0, n.y) * 0.3));

  const legs: [string, number, number][] = [
    ["stabFL", 1, 0.4],
    ["stabFR", -1, 0.4],
    ["stabRL", 1, -3.6],
    ["stabRR", -1, -3.6],
  ];
  for (const [name, s, z] of legs) {
    const bone = J[name];
    const sx = s * 1.55;
    // mounting box on flank
    b.part(new THREE.BoxGeometry(0.5, 0.55, 0.7), armor, { bone, at: [sx + s * 0.1, 1.1, z], flat: true });
    b.part(new THREE.BoxGeometry(0.1, 0.62, 0.78), P.gunmetal, { bone, at: [sx + s * 0.38, 1.1, z], flat: true });
    // hydraulic piston: sleeve and chrome rod, angled outward and down
    const top: [number, number, number] = [sx + s * 0.4, 1.05, z];
    const knee: [number, number, number] = [s * 2.2, 0.75, z];
    const foot: [number, number, number] = [s * 2.75, 0.3, z];
    b.rod(top, knee, 0.13, steelP, { bone, sides: 8 });
    b.rod(top, [top[0] + s * 0.5, 0.93, z], 0.19, P.gunmetal, { bone, sides: 8 });
    b.rod([top[0] + s * 0.4, 0.95, z], knee, 0.075, P.hydraulic, { bone, sides: 6 });
    // diagonal brace strut
    b.rod([sx + s * 0.3, 1.35, z + 0.2], [s * 2.5, 0.5, z + 0.2], 0.06, P.steel, { bone, sides: 6 });
    b.rod([sx + s * 0.3, 0.8, z - 0.25], [s * 2.5, 0.5, z - 0.25], 0.06, P.steel, { bone, sides: 6 });
    // outer leg
    b.rod(knee, [foot[0], 0.2, z], 0.15, armor, { bone, sides: 8 });
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.2, 8), P.gunmetal, { bone, at: knee, rotation: [90, 0, 0], flat: true });
    // footpad
    b.part(new THREE.CylinderGeometry(0.55, 0.62, 0.16, 8), P.gunmetal, { bone, at: [foot[0], 0.08, z], flat: true });
    b.part(new THREE.CylinderGeometry(0.57, 0.57, 0.03, 8), "#ffffff", {
      bone, at: [foot[0], 0.175, z], texture: stripeTex, flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.22, 0.4, 0.12, 8), P.steel, { bone, at: [foot[0], 0.24, z], flat: true });
    // ribs
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 4;
      b.part(new THREE.BoxGeometry(0.06, 0.1, 0.95), P.hullDark, {
        bone, at: [foot[0], 0.23, z], rotation: [0, (a * 180) / Math.PI, 0], flat: true,
      });
    }
    // warning lamp
    glow(
      b.part(new THREE.SphereGeometry(0.07, 6, 4), P.red, { bone, at: [s * 2.4, 0.62, z + 0.18] }),
      1.5,
    );
    b.part(new THREE.CylinderGeometry(0.06, 0.08, 0.05, 6), P.gunmetal, { bone, at: [s * 2.4, 0.52, z + 0.18] });
    // cable bundles
    b.sweep(
      [[sx + s * 0.3, 0.85, z + 0.3], [s * 2.0, 0.55, z + 0.32], [s * 2.6, 0.7, z + 0.3], [s * 2.75, 0.35, z + 0.25]],
      0.03,
      { bone, color: P.rubber, sides: 5 },
    );
    b.sweep(
      [[sx + s * 0.3, 0.8, z + 0.38], [s * 2.1, 0.45, z + 0.4], [s * 2.6, 0.6, z + 0.36], [s * 2.75, 0.3, z + 0.3]],
      0.022,
      { bone, color: P.hazard, sides: 5 },
    );
  }
}
    return buildStabilisers;
  })(),
  // turret
  (() => {
function buildTurret({ b, J, P, M }: any) {
  const bone = J.turret;
  const cx = M.turretRing[0], cz = M.turretRing[2];
  const Y0 = 1.9;

  const armor = paint((p, n) => {
    const base = mix(P.hull, P.armorLight, smoothstep(0.2, 0.9, n.y) * 0.7);
    const dirt = noise(p, 0.5, 3);
    let c = mix(base, P.hullDark, 0.35 * smoothstep(0.5, 0.8, dirt));
    const u = Math.abs(((p.x + p.z) / 0.5) % 1);
    if (u < 0.012) c = mix(c, P.hullDark, 0.8);
    return c;
  });

  const put = (geo: THREE.BufferGeometry, color: any, at: number[], opts: any = {}) =>
    b.part(geo, color, { bone, at, ...opts });

  // ring bearing
  put(new THREE.CylinderGeometry(1.55, 1.65, 0.2, 24), P.gunmetal, [cx, Y0 + 0.1, cz]);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    put(new THREE.BoxGeometry(0.14, 0.14, 0.14), P.steel, [cx + Math.sin(a) * 1.66, Y0 + 0.1, cz + Math.cos(a) * 1.66], { rotation: [0, (a * 180) / Math.PI, 0] });
  }
  put(new THREE.CylinderGeometry(1.5, 1.5, 0.08, 24), P.hazard, [cx, Y0 + 0.22, cz]);

  // main faceted housing
  put(new THREE.CylinderGeometry(1.35, 1.6, 0.8, 8), armor, [cx, Y0 + 0.65, cz], { rotation: [0, 22.5, 0] });
  put(new THREE.BoxGeometry(2.4, 0.5, 2.6), armor, [cx, Y0 + 1.3, cz + 0.1]);
  put(new THREE.CylinderGeometry(0.9, 1.3, 0.35, 8), armor, [cx, Y0 + 1.55, cz], { rotation: [0, 22.5, 0] });

  // cradle & trunnions
  for (const s of [1, -1]) {
    put(new THREE.BoxGeometry(0.3, 0.9, 1.4), P.armorLight, [s * 0.85, 2.85, cz + 0.2]);
    put(new THREE.CylinderGeometry(0.17, 0.17, 0.4, 10), P.steel, [s * 1.05, 2.9, cz], { dir: [1, 0, 0] });
    // hydraulics
    put(new THREE.CylinderGeometry(0.09, 0.09, 0.8, 8), P.hydraulic, [s * 0.75, 2.6, cz + 0.75], { dir: [0, 0.7, 0.7] });
    put(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 8), P.gunmetal, [s * 0.75, 2.45, cz + 0.55], { dir: [0, 0.7, 0.7] });
    // side hatches
    put(new THREE.BoxGeometry(0.06, 0.55, 0.9), P.hullDark, [s * 1.25, 2.55, cz - 0.4]);
    put(new THREE.BoxGeometry(0.08, 0.1, 0.9), P.hazard, [s * 1.27, 2.85, cz - 0.4]);
    put(new THREE.BoxGeometry(0.08, 0.1, 0.9), P.hazard, [s * 1.27, 2.25, cz - 0.4]);
    // status panels
    glow(put(new THREE.BoxGeometry(0.05, 0.25, 0.4), P.neonCyan, [s * 1.3, 2.6, cz + 0.6]), 1.5);
    // vents
    for (let i = 0; i < 4; i++)
      put(new THREE.BoxGeometry(0.05, 0.06, 0.5), P.gunmetal, [s * 1.28, 2.15 + i * 0.1, cz + 0.45]);
  }
  put(new THREE.BoxGeometry(1.9, 0.5, 0.5), P.armorLight, [0, 2.55, cz + 0.85]);

  // rear generator + capacitor bank
  put(new THREE.BoxGeometry(2.2, 1.0, 1.2), armor, [0, 2.6, cz - 1.7]);
  put(new THREE.BoxGeometry(2.3, 0.1, 1.1), P.hazard, [0, 3.15, cz - 1.6]);
  for (let i = -2; i <= 2; i++) {
    put(new THREE.CylinderGeometry(0.17, 0.17, 0.6, 8), P.steel, [i * 0.42, 3.4, cz - 1.7]);
    glow(put(new THREE.CylinderGeometry(0.19, 0.19, 0.06, 8), P.neonCyan, [i * 0.42, 3.55, cz - 1.7]), 1.4);
  }
  for (let i = 0; i < 5; i++)
    put(new THREE.BoxGeometry(1.6, 0.05, 0.05), P.gunmetal, [0, 2.3 + i * 0.12, cz - 2.32]);
  // exhaust
  put(new THREE.CylinderGeometry(0.1, 0.12, 0.5, 8), P.gunmetal, [0.8, 3.35, cz - 2.1]);

  // ammo feed box
  put(new THREE.BoxGeometry(0.7, 0.55, 0.9), P.hullDark, [-1.0, 3.0, cz - 0.7]);
  put(new THREE.BoxGeometry(0.72, 0.08, 0.92), P.hazard, [-1.0, 3.3, cz - 0.7]);

  // sensor dome
  put(new THREE.SphereGeometry(0.28, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), P.glass, [0.9, 3.05, cz - 0.1]);
  put(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8), P.gunmetal, [0.9, 3.0, cz - 0.1]);
  glow(put(new THREE.SphereGeometry(0.07, 6, 4), P.neonCyan, [0.9, 3.15, cz - 0.1 + 0.1]), 1.5);

  // stencil numbers
  const num = svg(`<svg viewBox="0 0 64 32"><text x="32" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="28" fill="#e8e8e0">R-07</text></svg>`, { size: 128 });
  for (const s of [1, -1])
    put(new THREE.PlaneGeometry(0.7, 0.35), "#ffffff", [s * 1.325, 2.2, cz - 0.4], { texture: num, dir: [s, 0, 0], axis: "z" });
}
    return buildTurret;
  })(),
  // railgun
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildRailgun({ b, J, P, M }: Ctx) {
  const gun = J.gun;
  const [px, py, pz] = M.gunPivot;
  const RY = py; // rail centre height
  const z0 = -3.5, z1 = 5.5;

  const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: gun, at: [px + x, y, z], name, flat: true });
  const cyl = (r0: number, r1: number, len: number, seg: number, color: any, x: number, y: number, z: number, name?: string) =>
    b.part(new THREE.CylinderGeometry(r0, r1, len, seg), color, { bone: gun, at: [px + x, y, z], dir: [0, 0, 1], flat: true, name });

  const metalPaint = paint((p, n) => {
    const t = noise(p, 0.3, 4);
    const c = mix("#2b2f36", "#444a54", smoothstep(0.3, 0.8, t));
    return mix(c, "#5a616c", 0.35 * smoothstep(0.5, 1, n.y));
  });
  const hazardTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.hazard}"/>` +
      [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#17181b"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const stencil = svg(
    `<svg viewBox="0 0 64 24"><text x="32" y="18" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="18" fill="${P.decalWhite}">RG-01</text></svg>`,
    { size: 128 },
  );

  // rails
  for (const s of [1, -1]) {
    box(0.22, 0.3, z1 - z0 - 1.2, metalPaint, s * 0.34, RY, (z0 + z1) / 2 + 0.3, "rail");
    glow(box(0.04, 0.2, z1 - z0 - 1.6, P.neonCyan, s * 0.2, RY, (z0 + z1) / 2 + 0.5, "railGlow"), 1.6);
    box(0.1, 0.1, z1 - z0 - 1.4, P.steel, s * 0.34, RY + 0.2, (z0 + z1) / 2 + 0.4);
    box(0.1, 0.1, z1 - z0 - 1.4, P.steel, s * 0.34, RY - 0.2, (z0 + z1) / 2 + 0.4);
  }

  // breech block
  box(0.9, 0.6, 1.0, metalPaint, 0, RY, -3.1, "breech");
  box(0.7, 0.5, 0.3, P.hullDark, 0, RY, -3.6 + 0.16);
  box(0.5, 0.12, 0.8, P.hazard, 0, RY + 0.36, -3.1);
  b.part(new THREE.PlaneGeometry(0.45, 0.17), "#ffffff", { bone: gun, at: [px + 0.451, RY + 0.05, -3.1], dir: [1, 0, 0], axis: "z", texture: stencil });
  // recoil sleeve
  cyl(0.28, 0.28, 1.2, 8, P.hydraulic, 0, RY, -2.0, "recoilSleeve");
  cyl(0.18, 0.18, 1.0, 8, P.steel, 0, RY, -1.1);
  // blast shield at rail end of breech
  box(1.1, 0.8, 0.12, P.hull, 0, RY, -2.45, "shield");
  box(1.1, 0.1, 0.14, P.hazard, 0, RY + 0.45, -2.45);

  // coil rings, capacitors, spacers
  for (let i = 0; i < 9; i++) {
    const z = -1.6 + i * 0.78;
    const r = 0.5 - i * 0.012;
    glow(b.part(new THREE.TorusGeometry(r, 0.05, 4, 8), P.neonCyan, { bone: gun, at: [px, RY, z], flat: true, name: "coil" }), 1.8);
    box(0.9, 0.08, 0.2, P.gunmetal, 0, RY, z + 0.3, "spacer");
    box(1.0, 0.1, 0.14, P.steel, 0, RY + 0.0, z + 0.55);
    if (i % 2 === 0) {
      for (const s of [1, -1]) {
        cyl(0.16, 0.16, 0.5, 6, P.hullDark, s * 0.5, RY + 0.2, z, "capacitor");
        cyl(0.17, 0.17, 0.06, 6, P.hazard, s * 0.5, RY + 0.2, z + 0.28);
      }
      box(0.4, 0.14, 0.3, P.hull, 0, RY + 0.52, z);
    }
  }

  // muzzle brake
  const mz = 4.5;
  b.part(new THREE.CylinderGeometry(0.6, 0.42, 0.9, 8), P.gunmetal, { bone: gun, at: [px, RY, mz + 0.2], dir: [0, 0, 1], flat: true, name: "muzzleFlare" });
  b.part(new THREE.CylinderGeometry(0.46, 0.46, 0.5, 8, 1, true), "#ffffff", { bone: gun, at: [px, RY, mz - 0.3], dir: [0, 0, 1], flat: true, texture: hazardTex, name: "muzzleBand" });
  cyl(0.5, 0.5, 0.18, 8, P.hazard, 0, RY, mz - 0.62);
  cyl(0.62, 0.62, 0.1, 8, P.steel, 0, RY, mz + 0.68);
  glow(cyl(0.3, 0.3, 0.05, 8, P.neonCyan, 0, RY, mz + 0.72), 1.5);
  for (const s of [1, -1]) box(0.08, 0.5, 0.5, P.steel, s * 0.62, RY, mz + 0.1);

  // cables to breech
  for (const s of [1, -1]) {
    b.sweep([[px + s * 0.4, RY + 0.4, -3], [px + s * 0.55, RY + 0.55, -2], [px + s * 0.55, RY + 0.55, -0.5], [px + s * 0.5, RY + 0.35, 0.5]], 0.04, { bone: gun, color: P.gunmetal, sides: 5 });
  }
  b.sweep([[px, RY + 0.3, -3.3], [px, RY + 0.7, -3.0], [px, RY + 0.55, -1.6]], 0.05, { bone: gun, color: P.red, sides: 5 });
}
    return buildRailgun;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.3,0], dir: [0,0,1], role: "spine" });
  J["turret"] = b.joint("turret", { parent: J["body"], at: [0,1.9,-1.8], dir: [0,1,0], role: "hinge", group: "turret" });
  J["gun"] = b.joint("gun", { parent: J["turret"], at: [0,2.9,-1.8], dir: [0,0,1], role: "hinge", group: "turret" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.95,0.75,3.7], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.95,0.75,3.7], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.95,0.75,-0.6], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.95,0.75,-0.6], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.95,0.75,-3], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.95,0.75,-3], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["stabFL"] = b.joint("stabFL", { parent: J["body"], at: [1.55,1.1,0.4], dir: [1,-0.6,0], role: "leg", group: "stabilisers" });
  J["stabFR"] = b.joint("stabFR", { parent: J["body"], at: [-1.55,1.1,0.4], dir: [-1,-0.6,0], role: "leg", group: "stabilisers" });
  J["stabRL"] = b.joint("stabRL", { parent: J["body"], at: [1.55,1.1,-3.6], dir: [1,-0.6,0], role: "leg", group: "stabilisers" });
  J["stabRR"] = b.joint("stabRR", { parent: J["body"], at: [-1.55,1.1,-3.6], dir: [-1,-0.6,0], role: "leg", group: "stabilisers" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
