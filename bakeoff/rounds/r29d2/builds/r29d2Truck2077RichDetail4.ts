import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, svg, paint, mix, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";
import { mottle } from "../../../../src/index";

export const meta = {
  name: "Nightwall AX-77",
  description:
    "A 2077 six-wheeled militarized cyberpunk truck: armoured wedge hull, neon underglow, roof sensors, twin-cannon bed turret, missile pods and rear thrusters.",
};

type V = [number, number, number];
const NEON = "#19e6ff";
const PINK = "#ff2a9d";
const AMBER = "#ffb21a";
const TRIM = "#2b2f3a";
const DARK = "#14161c";
const STEEL = "#6c7480";
const TYRE = "#1a1a1e";
const GLASS = "#16566e";

// ---------------------------------------------------------------- textures
const hazardSvg = (() => {
  let s = `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#ffc400"/>`;
  for (let i = -2; i < 10; i++) s += `<polygon points="${i * 8},16 ${i * 8 + 4},16 ${i * 8 + 12},0 ${i * 8 + 8},0" fill="#16161a"/>`;
  return s + `<rect width="64" height="16" fill="none" stroke="#16161a" stroke-width="1.5"/></svg>`;
})();
const HAZARD = svg(hazardSvg, { size: 256 });
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <polygon points="32,3 58,16 58,44 32,61 6,44 6,16" fill="#101218" stroke="#19e6ff" stroke-width="3"/>
  <polygon points="32,12 50,21 50,41 32,52 14,41 14,21" fill="none" stroke="#ff2a9d" stroke-width="2"/>
  <path d="M18 24 L32 34 L46 24 M18 32 L32 42 L46 32" stroke="#ffc400" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <circle cx="32" cy="22" r="3" fill="#19e6ff"/></svg>`,
  { size: 256 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="40" fill="#031820"/>
  <circle cx="20" cy="20" r="15" fill="none" stroke="#19e6ff" stroke-width="1.2"/><circle cx="20" cy="20" r="8" fill="none" stroke="#19e6ff" stroke-width="1"/>
  <path d="M20 20 L32 10" stroke="#7dffb0" stroke-width="1.5"/><circle cx="27" cy="14" r="1.8" fill="#ff2a9d"/>
  <rect x="40" y="6" width="20" height="3" fill="#19e6ff"/><rect x="40" y="13" width="14" height="3" fill="#ffc400"/><rect x="40" y="20" width="18" height="3" fill="#19e6ff"/>
  <rect x="40" y="27" width="9" height="3" fill="#ff2a9d"/><rect x="2" y="2" width="60" height="36" fill="none" stroke="#19e6ff" stroke-width="1"/></svg>`,
  { size: 256 },
);
const PLATE = svg(
  `<svg viewBox="0 0 64 24" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="24" rx="3" fill="#e8e8e0" stroke="#111" stroke-width="2"/>
  <rect x="2" y="2" width="60" height="5" fill="#ff2a9d"/><text x="32" y="20" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#111">AX-2077</text></svg>`,
  { size: 256 },
);
const GLYPH = svg(
  `<svg viewBox="0 0 128 32" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="32" fill="#0a0c10"/>
  <text x="6" y="14" font-family="monospace" font-weight="bold" font-size="12" fill="#19e6ff">MIL-SEC // UNIT 07</text>
  <text x="6" y="27" font-family="monospace" font-size="10" fill="#ff2a9d">NIGHTWALL ARMS CO.</text>
  <rect x="104" y="4" width="20" height="24" fill="none" stroke="#ffc400" stroke-width="2"/><path d="M108 8 L120 24 M120 8 L108 24" stroke="#ffc400" stroke-width="2"/></svg>`,
  { size: 512 },
);

// ---------------------------------------------------------------- paints
const PANEL = panelled(metal("iron", { size: 0.12, tarnish: 0.3 }), { size: 0.4, aspect: 0.6, rivets: 0.07 });
const DIRT = mottle("#3a3228", "#1f1b19", { size: 0.2 });
const BODY = paint((p) => (p.y < 0.88 ? DIRT : PANEL));
const ARMOR = panelled(mix("#39414d", "#222831", 0.5), { size: 0.3, rivets: 0 });
const BRASSY = metal("bronze", { tarnish: 0.5 });

export default function build() {
  const b = createBuilder({ name: "nightwall" });
  const ch = b.joint("chassis", { at: [0, 0.6, 0], role: "spine" });

  const bx = (w: number, h: number, d: number, x: number, y: number, z: number, col: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: ch, at: [x, y, z], ...o });
  const cz = (r: number, len: number, seg = 8, r2 = r) =>
    new THREE.CylinderGeometry(r, r2, len, seg).rotateX(Math.PI / 2);
  const cx = (r: number, len: number, seg = 8) => new THREE.CylinderGeometry(r, r, len, seg).rotateZ(Math.PI / 2);
  const spheres = (pts: V[], r: number) =>
    mergeGeometries(pts.map((p) => new THREE.SphereGeometry(r, 5, 4).translate(p[0], p[1], p[2])))!;

  // ---------------- hull
  b.extrude(
    [[2.65, 0.75], [2.72, 1.1], [1.9, 1.4], [-2.5, 1.4], [-2.65, 1.2], [-2.65, 0.75]],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.0, bevel: 0.04, bone: ch, color: BODY },
  );
  bx(1.5, 0.12, 5.0, 0, 0.7, 0, DARK); // belly pan
  // cab
  b.extrude([[1.3, 1.4], [0.7, 2.15], [-0.5, 2.2], [-0.9, 1.4]], {
    at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.7, bevel: 0.03, bone: ch, color: BODY,
  });
  b.extrude([[1.05, 1.6], [0.68, 2.08], [-0.3, 2.1], [-0.3, 1.6]], {
    at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.76, bone: ch, color: GLASS,
  });
  for (const z of [-0.3, 0.68]) bx(1.76, 0.1, 0.08, 0, 1.6 + (z > 0 ? 0.24 : 0.25), z, TRIM); // pillars across
  glow(bx(1.5, 0.82 * 0 + 0.96, 0.03, 0, 1.78, 1.0, GLASS, { rotation: [51, 0, 0] }), 0.4); // windscreen
  bx(1.62, 0.06, 0.1, 0, 2.03, 0.8, TRIM, { rotation: [51, 0, 0] }); // visor frame top
  bx(1.8, 0.08, 1.6, 0, 2.22, 0.1, ARMOR, { rotation: [-3, 0, 0] }); // roof plate
  for (const s of [1, -1]) {
    bx(0.05, 0.5, 0.04, s * 0.88, 1.8, 0.2, TRIM); // door seam
    bx(0.04, 0.04, 0.2, s * 0.9, 1.7, -0.1, STEEL); // handle
    bx(0.06, 0.06, 1.6, s * 0.86, 1.43, 0.1, TRIM); // cab sill
    // mirror with camera pod
    bx(0.3, 0.04, 0.04, s * 1.0, 1.95, 1.05, STEEL);
    bx(0.12, 0.18, 0.1, s * 1.15, 1.95, 1.05, DARK);
    glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), NEON, { bone: ch, at: [s * 1.15, 1.97, 1.12] }));
  }
  // dash screen visible through glass
  glow(b.part(new THREE.PlaneGeometry(0.5, 0.31), "#ffffff", { bone: ch, at: [0, 1.65, 0.78], dir: [0, 0, -1], axis: "z", texture: SCREEN }), 0.9);

  // ---------------- front end
  bx(1.1, 0.34, 0.08, 0, 1.0, 2.72, DARK); // grille
  for (let i = 0; i < 7; i++) glow(bx(0.05, 0.28, 0.03, -0.45 + i * 0.15, 1.0, 2.76, PINK), 0.8);
  for (const s of [1, -1]) {
    glow(bx(0.5, 0.07, 0.05, s * 0.78, 1.18, 2.72, "#e8fbff", { rotation: [-8, 0, 0] }), 1.4);
    bx(0.56, 0.03, 0.1, s * 0.78, 1.25, 2.7, TRIM);
    bx(0.56, 0.03, 0.1, s * 0.78, 1.1, 2.7, TRIM);
    glow(bx(0.1, 0.05, 0.05, s * 0.93, 0.88, 2.72, AMBER), 1);
  }
  // bumper ram
  bx(2.3, 0.3, 0.25, 0, 0.62, 2.82, ARMOR);
  bx(2.36, 0.06, 0.3, 0, 0.8, 2.82, TRIM);
  b.part(new THREE.PlaneGeometry(1.5, 0.2), "#ffffff", { bone: ch, at: [0, 0.62, 2.953], dir: [0, 0, 1], axis: "z", texture: HAZARD });
  for (let i = 0; i < 6; i++) b.spike([-0.9 + i * 0.36, 0.52, 2.94], [0, -0.2, 1], 0.2, 0.05, STEEL, { bone: ch, sides: 5 });
  for (const s of [1, -1]) {
    bx(0.2, 0.34, 0.3, s * 1.2, 0.64, 2.75, TRIM);
    b.part(new THREE.TorusGeometry(0.06, 0.02, 5, 8, Math.PI), STEEL, { bone: ch, at: [s * 0.5, 0.45, 2.9], rotation: [0, 0, 180] });
  }
  // hood: ERA bricks and vents
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 2; j++) {
      bx(0.3, 0.07, 0.2, -0.64 + i * 0.32, 1.46 - j * 0.0, 1.5 + j * 0.28, TRIM);
      b.part(cyl(0.025, 0.02), STEEL, { bone: ch, at: [-0.64 + i * 0.32, 1.51, 1.5 + j * 0.28] });
    }
  function cyl(r: number, h: number, seg = 6) {
    return new THREE.CylinderGeometry(r, r, h, seg);
  }

  // ---------------- side armour plates, decals
  const bolts: V[] = [];
  for (const s of [1, -1]) {
    for (const z of [1.75, 0.6, -0.6, -1.75]) {
      const w = z === 1.75 ? 0.9 : 0.8;
      b.part(new THREE.BoxGeometry(0.06, 0.36, w), ARMOR, { bone: ch, at: [s * 1.03, 1.17, z] });
      for (const dz of [-1, 1]) for (const dy of [-1, 1]) bolts.push([s * 1.07, 1.17 + dy * 0.14, z + (dz * (w - 0.1)) / 2]);
    }
    b.part(new THREE.PlaneGeometry(0.32, 0.32), "#ffffff", { bone: ch, at: [s * 1.065, 1.17, 0.6], dir: [s, 0, 0], axis: "z", texture: EMBLEM });
    b.part(new THREE.PlaneGeometry(0.76, 0.19), "#ffffff", { bone: ch, at: [s * 1.065, 1.17, -0.6], dir: [s, 0, 0], axis: "z", texture: GLYPH });
    // rocker skirts with slats + underglow
    for (const z of [0.88, -0.88]) {
      bx(0.05, 0.3, 0.8, s * 1.04, 0.92, z, TRIM);
      for (let i = 0; i < 4; i++) bx(0.03, 0.03, 0.7, s * 1.08, 0.82 + i * 0.07, z, STEEL);
      glow(bx(0.04, 0.03, 0.8, s * 1.0, 0.74, z, NEON), 1.3);
    }
    // fuel/coolant hose along flank
    b.sweep(catmull([[s * 1.1, 1.33, 1.2], [s * 1.12, 1.28, 0.6], [s * 1.1, 1.33, 0.0], [s * 1.12, 1.28, -0.6], [s * 1.1, 1.33, -1.2]]), 0.025, DARK, { bone: ch, sides: 6 });
    // wheel fenders
    for (const z of [1.75, 0, -1.75]) {
      bx(0.5, 0.06, 1.1, s * 1.12, 0.96, z, ARMOR);
      bx(0.5, 0.18, 0.06, s * 1.12, 0.85, z + 0.55, TRIM, {});
      bx(0.4, 0.3, 0.04, s * 1.12, 0.55, z - 0.58, TYRE); // mud flap
    }
  }
  b.part(spheres(bolts, 0.018), STEEL, { bone: ch, at: [0, 0, 0] });

  // ---------------- wheels & running gear
  const wheelPos: [string, number, number][] = [
    ["FL", 1, 1.75], ["FR", -1, 1.75], ["ML", 1, 0], ["MR", -1, 0], ["RL", 1, -1.75], ["RR", -1, -1.75],
  ];
  for (const [k, s, z] of wheelPos) {
    const hub: V = [s * 1.12, 0.42, z];
    const front = z > 1;
    const steer = front ? b.joint(`steer${k}`, { parent: ch, at: hub, role: "hinge" }) : ch;
    const spin = b.joint(`wheel${k}`, { parent: steer, at: hub, dir: [s, 0, 0], role: "hinge" });
    const treads: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3((i % 2 ? 0.06 : -0.06), 0.4 * Math.cos(a), 0.4 * Math.sin(a)),
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), a),
        new THREE.Vector3(1, 1, 1),
      );
      treads.push(new THREE.BoxGeometry(0.15, 0.09, 0.14).applyMatrix4(m));
    }
    treads.push(cx(0.38, 0.34, 14));
    b.part(mergeGeometries(treads)!, TYRE, { bone: spin, at: hub, flat: true });
    b.part(cx(0.25, 0.36, 12), STEEL, { bone: spin, at: hub, flat: true });
    const hubBits: THREE.BufferGeometry[] = [cx(0.11, 0.42, 8).translate(s * 0.02, 0, 0)];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      hubBits.push(cx(0.022, 0.06, 6).translate(s * 0.19, 0.15 * Math.cos(a), 0.15 * Math.sin(a)));
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      hubBits.push(
        new THREE.BoxGeometry(0.05, 0.05, 0.22)
          .translate(0, 0, 0.14)
          .rotateX(a)
          .translate(s * 0.18, 0, 0),
      );
    }
    b.part(mergeGeometries(hubBits)!, DARK, { bone: spin, at: hub, flat: true });
    glow(b.part(new THREE.TorusGeometry(0.28, 0.015, 5, 18).rotateY(Math.PI / 2).translate(s * 0.185, 0, 0), NEON, { bone: spin, at: hub }), 1.2);
    // axle, shock, spring
    b.rod([s * 0.45, 0.45, z], [s * 0.95, 0.42, z], 0.06, DARK, { bone: ch, sides: 8 });
    b.rod([s * 0.7, 0.45, z + 0.12], [s * 0.82, 0.8, z + 0.12], 0.03, STEEL, { bone: ch, sides: 6 });
    for (let i = 0; i < 5; i++) b.part(new THREE.TorusGeometry(0.06, 0.012, 4, 8).rotateX(Math.PI / 2), STEEL, { bone: ch, at: [s * 0.76, 0.52 + i * 0.06, z - 0.12] });
  }
  b.rod([0, 0.52, 1.75], [0, 0.52, -1.75], 0.045, STEEL, { bone: ch, sides: 8 }); // driveshaft
  for (const z of [1.2, 0.3, -0.5, -1.2]) bx(1.3, 0.1, 0.1, 0, 0.58, z, DARK);

  // ---------------- bed
  const wallL: V[] = [];
  for (const s of [1, -1]) {
    bx(0.1, 0.45, 1.65, s * 0.95, 1.62, -1.8, ARMOR);
    bx(0.14, 0.05, 1.7, s * 0.95, 1.87, -1.8, TRIM);
    for (const z of [-1.2, -1.6, -2.0, -2.4]) bx(0.05, 0.4, 0.07, s * 1.01, 1.62, z, TRIM);
    for (let i = 0; i < 8; i++) wallL.push([s * 1.0, 1.76, -1.05 - i * 0.2]);
    // missile pod
    bx(0.4, 0.38, 0.9, s * 0.78, 1.98, -2.0, TRIM);
    bx(0.5, 0.04, 0.2, s * 0.78, 1.8, -2.0, STEEL);
    for (const dx of [-0.1, 0.1])
      for (const dy of [-0.09, 0.09]) {
        b.part(cz(0.07, 0.06, 10), DARK, { bone: ch, at: [s * 0.78 + dx, 1.98 + dy, -1.52] });
        b.spike([s * 0.78 + dx, 1.98 + dy, -1.55], [0, 0, 1], 0.1, 0.05, PINK, { bone: ch, sides: 6 });
      }
    // power cells
    b.part(cyl(0.14, 0.5, 8), TRIM, { bone: ch, at: [s * 0.55, 1.65, -2.3], flat: true });
    glow(b.part(cyl(0.145, 0.06, 8), NEON, { bone: ch, at: [s * 0.55, 1.7, -2.3] }), 1.1);
    b.part(cyl(0.1, 0.06, 6), STEEL, { bone: ch, at: [s * 0.55, 1.92, -2.3] });
  }
  b.part(spheres(wallL, 0.016), STEEL, { bone: ch, at: [0, 0, 0] });
  bx(1.9, 0.45, 0.08, 0, 1.62, -2.58, ARMOR);
  bx(1.94, 0.05, 0.12, 0, 1.87, -2.58, TRIM);
  b.part(new THREE.PlaneGeometry(1.5, 0.19), "#ffffff", { bone: ch, at: [0, 1.52, -2.625], dir: [0, 0, -1], axis: "z", texture: HAZARD });
  b.part(new THREE.PlaneGeometry(0.4, 0.15), "#ffffff", { bone: ch, at: [0, 1.74, -2.625], dir: [0, 0, -1], axis: "z", texture: PLATE });
  for (const s of [1, -1]) glow(bx(0.18, 0.06, 0.04, s * 0.8, 1.74, -2.63, "#ff2020"), 1.4); // tail lamps
  // rear thrusters
  for (const s of [1, -1]) {
    b.lathe([[0, 0], [0.18, 0], [0.14, 0.1], [0.3, 0.5], [0.26, 0.5], [0.11, 0.12], [0, 0.14]], { at: [s * 0.62, 1.0, -2.65], axis: [0, 0, -1], segments: 10, bone: ch, color: STEEL });
    glow(b.part(cyl(0.11, 0.03, 10), PINK, { bone: ch, at: [s * 0.62, 1.0, -2.78], rotation: [90, 0, 0] }), 1.6);
    b.part(new THREE.TorusGeometry(0.22, 0.02, 5, 10), DARK, { bone: ch, at: [s * 0.62, 1.0, -2.95] });
  }

  // ---------------- turret
  const base: V = [0, 1.45, -1.9];
  b.part(cyl(0.45, 0.06, 14), STEEL, { bone: ch, at: [0, 1.46, -1.9], flat: true });
  const yaw = b.joint("yaw", { parent: ch, at: base, role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.5, -1.9], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.34, 0.12, 12), ARMOR, { bone: yaw, at: [0, 1.55, -1.9], flat: true });
  b.part(cyl(0.12, 0.7, 8), TRIM, { bone: yaw, at: [0, 1.95, -1.9] });
  b.part(new THREE.BoxGeometry(0.9, 0.12, 0.7), ARMOR, { bone: yaw, at: [0, 2.3, -1.9] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.06, 0.4, 0.5), ARMOR, { bone: pitch, at: [s * 0.4, 2.5, -1.9] });
    b.rod([s * 0.4, 2.5, -1.9], [s * 0.5, 2.5, -1.9], 0.05, STEEL, { bone: pitch, sides: 8 });
    b.part(new THREE.BoxGeometry(0.2, 0.2, 0.34), DARK, { bone: pitch, at: [s * 0.55, 2.42, -1.95] }); // ammo box
    b.part(cz(0.075, 0.55, 8), STEEL, { bone: pitch, at: [s * 0.17, 2.5, -1.35], flat: true }); // shroud
    b.rod([s * 0.17, 2.5, -1.1], [s * 0.17, 2.5, -0.62], 0.04, DARK, { bone: pitch, sides: 8 });
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.14), TRIM, { bone: pitch, at: [s * 0.17, 2.5, -0.58] }); // muzzle brake
    glow(b.part(new THREE.BoxGeometry(0.03, 0.03, 0.02), AMBER, { bone: pitch, at: [s * 0.17, 2.5, -0.505] }), 1.4);
    b.sweep(catmull([[s * 0.55, 2.4, -1.85], [s * 0.4, 2.3, -1.75], [s * 0.2, 2.42, -1.8]]), 0.012, BRASSY, { bone: pitch, sides: 5 }); // ammo belt
  }
  b.part(new THREE.BoxGeometry(0.46, 0.34, 0.5), ARMOR, { bone: pitch, at: [0, 2.5, -1.95] }); // receiver
  b.part(new THREE.BoxGeometry(0.8, 0.44, 0.06), ARMOR, { bone: pitch, at: [0, 2.52, -1.62], rotation: [-8, 0, 0] }); // shield
  glow(b.part(new THREE.SphereGeometry(0.06, 8, 5), "#ff2020", { bone: pitch, at: [0.3, 2.62, -1.58] }), 1.6);
  b.part(new THREE.BoxGeometry(0.2, 0.1, 0.16), DARK, { bone: pitch, at: [-0.3, 2.66, -1.6] });
  glow(b.part(new THREE.CircleGeometry(0.035, 8), NEON, { bone: pitch, at: [-0.3, 2.66, -1.51], axis: "z", dir: [0, 0, 1] }), 1.4);

  // ---------------- roof furniture
  bx(1.2, 0.08, 0.14, 0, 2.3, 0.45, DARK);
  glow(bx(1.1, 0.04, 0.03, 0, 2.32, 0.53, PINK), 1.4);
  glow(bx(0.5, 0.04, 0.03, -0.3, 2.28, 0.53, NEON), 1.4);
  glow(bx(0.5, 0.04, 0.03, 0.3, 2.28, 0.53, "#ff2020"), 1.4);
  b.part(new THREE.SphereGeometry(0.2, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, { bone: ch, at: [0.5, 2.26, -0.2], flat: true });
  b.part(cyl(0.22, 0.05, 10), STEEL, { bone: ch, at: [0.5, 2.25, -0.2], flat: true });
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), NEON, { bone: ch, at: [0.5, 2.3, -0.2] }), 1.4);
  // dish
  b.part(cyl(0.04, 0.3, 6), STEEL, { bone: ch, at: [-0.6, 2.4, 0.0] });
  b.lathe([[0, 0], [0.26, 0.1], [0.26, 0.12], [0, 0.03]], { at: [-0.6, 2.57, 0.0], axis: [0.3, 0.8, 0.5], segments: 12, bone: ch, color: TRIM });
  b.rod([-0.6, 2.62, 0.02], [-0.55, 2.82, 0.2], 0.012, STEEL, { bone: ch, sides: 4 });
  // whip antennas
  for (const [x, z, h] of [[-0.8, -0.6, 1.3], [0.8, -0.6, 0.9]] as V[]) {
    b.part(cyl(0.05, 0.05, 8), DARK, { bone: ch, at: [x, 2.26, z] });
    b.spike([x, 2.28, z], [0, 1, 0], h, 0.014, STEEL, { bone: ch, sides: 5 });
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), PINK, { bone: ch, at: [x, 2.28 + h, z] }), 1.5);
  }
  // radar panel + rear cab cable
  bx(0.7, 0.4, 0.05, 0, 1.95, -0.95, TRIM);
  for (let i = 0; i < 4; i++) glow(bx(0.6, 0.02, 0.02, 0, 1.82 + i * 0.1, -0.985, NEON), 1);
  b.sweep(catmull([[0.4, 2.1, -0.95], [0.6, 1.95, -1.1], [0.85, 1.9, -1.5]]), 0.02, DARK, { bone: ch, sides: 6 });

  // underglow bars
  for (const z of [1.6, -1.6]) glow(bx(1.6, 0.03, 0.04, 0, 0.69, z, PINK), 1.2);

  return b.root;
}
