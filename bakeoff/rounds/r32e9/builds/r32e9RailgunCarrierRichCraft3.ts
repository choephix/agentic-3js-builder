import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, paint, mix, noise, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Six-Wheeled Railgun Carrier",
  description:
    "Low-poly sci-fi military 6x6 transporter with a long elevated railgun on a slewing turret, deployed on four hydraulic stabiliser legs.",
};

// ---------------------------------------------------------------- palette
const OLIVE = "#5d6b45";
const OLIVE_D = "#3f4a30";
const TAN = "#a99b6e";
const STEEL = "#8e98a6";
const STEEL_B = "#c3ccd8";
const GUNM = "#454b57";
const GUN = "#2a2e36";
const RUBBER = "#18181a";
const YEL = "#e8b81f";
const CYAN = "#5ff3ff";
const RED = "#d12d2d";
const AMBER = "#ffae2b";
const LAMP = "#fff3b0";

// hull camo: olive base, tan patches, dusty lower body, cooler underside
const HULL = paint((p, n) => {
  let c = mix(OLIVE_D, OLIVE, smoothstep(0.3, 0.7, noise(p, 0.9, 3)));
  c = mix(c, TAN, 0.4 * smoothstep(0.62, 0.8, noise(p, 0.55, 8)));
  c = mix(c, "#2e3624", 0.35 * smoothstep(0.66, 0.8, noise(p, 0.3, 21)));
  c = mix(c, "#7a6a46", 0.6 * smoothstep(1.5, 0.8, p.y));
  c = mix(c, "#f0f4d8", 0.12 * smoothstep(0.4, 1, n.y));
  const ao = 0.78 + 0.22 * smoothstep(-0.9, 0.3, n.y);
  return [c[0] * ao, c[1] * ao, c[2] * ao];
});

// ---------------------------------------------------------------- textures
const HAZ = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="p" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="16" fill="#141414"/></pattern></defs><rect width="64" height="64" fill="#e8b81f"/><rect width="64" height="64" fill="url(#p)"/><rect x="1" y="1" width="62" height="62" fill="none" stroke="#141414" stroke-width="2"/></svg>`,
  { size: 128 },
);
const PAD = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="p" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="20" fill="#141414"/></pattern><clipPath id="c"><circle cx="50" cy="50" r="48"/></clipPath></defs><circle cx="50" cy="50" r="48" fill="#e8b81f"/><rect width="100" height="100" fill="url(#p)" clip-path="url(#c)"/><circle cx="50" cy="50" r="48" fill="none" stroke="#141414" stroke-width="4"/><circle cx="50" cy="50" r="22" fill="#2a2e36" stroke="#141414" stroke-width="3"/><circle cx="50" cy="50" r="9" fill="#8e98a6"/></svg>`,
  { size: 192 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="46" fill="#1d2218" stroke="#e8e2c0" stroke-width="5"/><polygon points="50,12 59,38 87,38 64,54 73,81 50,65 27,81 36,54 13,38 41,38" fill="#e8e2c0"/><rect x="18" y="72" width="64" height="20" rx="3" fill="#1d2218"/><text x="50" y="88" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="17" fill="#e8b81f">RG-6</text></svg>`,
  { size: 192 },
);
const GLASS = svg(
  `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4e8aa3"/><stop offset="1" stop-color="#14262f"/></linearGradient></defs><rect width="128" height="64" rx="5" fill="#101418"/><rect x="3" y="3" width="122" height="58" rx="4" fill="url(#g)"/><polygon points="20,3 40,3 22,61 4,61" fill="#ffffff" opacity="0.25"/><polygon points="50,3 58,3 40,61 32,61" fill="#ffffff" opacity="0.15"/><line x1="64" y1="3" x2="64" y2="61" stroke="#101418" stroke-width="3"/></svg>`,
  { size: 256 },
);
const VENT = svg(
  `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="32" fill="#1c2026"/><g stroke="#5b6270" stroke-width="2.4">${[5, 10, 15, 20, 25, 30].map((y) => `<line x1="3" y1="${y}" x2="61" y2="${y}"/>`).join("")}</g><rect x="1" y="1" width="62" height="30" fill="none" stroke="#6b7384" stroke-width="2"/></svg>`,
  { size: 192 },
);
const WARN = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" rx="6" fill="#e8b81f" stroke="#141414" stroke-width="3"/><polygon points="32,9 57,53 7,53" fill="none" stroke="#141414" stroke-width="4" stroke-linejoin="round"/><polygon points="36,20 24,36 31,36 28,48 41,31 33,31" fill="#141414"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });
  const hull = b.joint("hull", { at: [0, 1.2, 0], role: "spine" });

  // ------------------------------------------------------------ helpers
  type Opt = Record<string, unknown>;
  const bx = (size: number[], color: any, at: number[], o: Opt = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, bone: hull, ...o } as any);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: any, dir: number[], o: Opt = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, dir, bone: hull, flat: true, ...o } as any);
  const plane = (w: number, h: number, tex: THREE.Texture, at: any, dir: any, up: any = [0, 1, 0], o: Opt = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", up, texture: tex, bone: hull, ...o } as any);

  // ------------------------------------------------------------ chassis
  bx([2.4, 0.8, 6.8], HULL, [0, 1.2, -1.0]); // main frame
  bx([2.9, 0.3, 6.8], HULL, [0, 1.75, -1.1]); // deck
  bx([2.0, 0.25, 6.0], GUN, [0, 0.72, -1.0]); // underbody skid
  bx([2.6, 0.08, 6.9], OLIVE_D, [0, 1.92, -1.1]); // deck trim
  // deck edge guard rail posts and rails
  for (const s of [1, -1]) {
    bx([0.06, 0.06, 6.6], STEEL, [s * 1.42, 2.1, -1.2]);
    for (const z of [2.0, 0.4, -1.2, -2.8, -4.3]) bx([0.06, 0.3, 0.06], STEEL, [s * 1.42, 1.98, z]);
  }

  // ------------------------------------------------------------ cab
  const cabOutline: any = [
    [2.4, 1.0], [4.5, 1.0], [4.5, 1.7], [4.0, 2.4], [2.6, 2.4], [2.4, 2.2],
  ];
  b.extrude(cabOutline, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.4, bevel: 0.04, color: HULL, bone: hull });
  // windscreen on the sloped face
  const wn = new THREE.Vector3(0, 0.5, 0.7).normalize();
  plane(2.1, 0.8, GLASS, [0, 2.05 + wn.y * 0.015, 4.25 + wn.z * 0.015], [wn.x, wn.y, wn.z]);
  // wiper
  b.rod([-0.5, 1.8, 4.43], [0.5, 2.0, 4.31], 0.015, GUN, { bone: hull });
  // roof armour hood over the glass
  bx([2.5, 0.08, 0.5], OLIVE_D, [0, 2.44, 4.0], { rotation: [-8, 0, 0] });
  // roof gear
  cyl(0.28, 0.32, 0.25, 8, GUNM, [0.5, 2.52, 3.2], [0, 1, 0]);
  cyl(0.22, 0.05, 0.2, 8, STEEL, [0.5, 2.74, 3.2], [0, 1, 0]);
  b.rod([-0.7, 2.4, 2.9], [-0.7, 3.9, 2.8], 0.018, STEEL_B, { bone: hull });
  b.rod([-0.95, 2.4, 3.0], [-0.95, 3.3, 3.0], 0.014, STEEL_B, { bone: hull });
  glow(bx([1.2, 0.1, 0.12], AMBER, [0, 2.5, 3.85]), 1.3);
  // side windows and emblem doors
  for (const s of [1, -1]) {
    plane(1.35, 0.5, GLASS, [s * 1.215, 1.95, 3.35], [s, 0, 0]);
    bx([0.05, 0.9, 1.6], OLIVE_D, [s * 1.21, 1.55, 3.3]); // door panel
    bx([0.06, 0.06, 0.28], STEEL, [s * 1.25, 1.55, 2.75]); // handle
    // mirror
    b.rod([s * 1.2, 2.1, 4.1], [s * 1.55, 2.2, 4.15], 0.02, GUN, { bone: hull });
    bx([0.08, 0.35, 0.22], GUN, [s * 1.58, 2.2, 4.15]);
    plane(0.7, 0.7, EMBLEM, [s * 1.215, 1.2, 1.9], [s, 0, 0]);
    plane(0.5, 0.5, WARN, [s * 1.215, 1.2, -1.0], [s, 0, 0]);
  }
  // front fascia
  bx([2.7, 0.35, 0.32], GUN, [0, 0.98, 4.5]); // bumper
  plane(1.05, 0.52, VENT, [0, 1.38, 4.515], [0, 0, 1]);
  cyl(0.12, 0.12, 0.7, 8, GUNM, [0, 0.98, 4.7], [1, 0, 0]); // winch drum
  for (const s of [1, -1]) {
    glow(bx([0.4, 0.22, 0.07], LAMP, [s * 0.95, 1.4, 4.52]), 1.5);
    bx([0.46, 0.28, 0.04], GUN, [s * 0.95, 1.4, 4.5]);
    bx([0.2, 0.2, 0.2], STEEL, [s * 1.1, 0.95, 4.7]); // tow hook
    glow(bx([0.16, 0.1, 0.05], AMBER, [s * 1.25, 1.25, 4.5]), 1.0);
    // exhaust stacks behind cab
    cyl(0.1, 0.1, 1.4, 8, GUNM, [s * 1.05, 2.65, 2.25], [0, 1, 0]);
    cyl(0.14, 0.1, 0.12, 8, STEEL, [s * 1.05, 3.4, 2.25], [0, 1, 0]);
    cyl(0.16, 0.16, 0.06, 8, GUN, [s * 1.05, 2.1, 2.25], [0, 1, 0]);
  }

  // ------------------------------------------------------------ wheels
  const R = 0.62;
  const axleZ = [3.2, 0.4, -2.4];
  const wheelNames = ["F", "M", "R"];
  axleZ.forEach((z, i) => {
    // axle beam and differential
    cyl(0.12, 0.12, 3.0, 8, GUN, [0, R, z], [1, 0, 0]);
    b.part(new THREE.SphereGeometry(0.3, 8, 6), GUNM, { at: [0, R, z], bone: hull, flat: true });
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const cx = s * 1.5;
      const wj = b.joint(`wheel${side}${wheelNames[i]}`, { parent: hull, at: [cx, R, z], dir: [s, 0, 0], role: "hinge" });
      cyl(R, R, 0.5, 16, RUBBER, [cx, R, z], [1, 0, 0], { bone: wj });
      cyl(0.38, 0.38, 0.54, 12, STEEL, [cx, R, z], [1, 0, 0], { bone: wj });
      cyl(0.3, 0.3, 0.06, 12, GUNM, [cx + s * 0.28, R, z], [1, 0, 0], { bone: wj });
      cyl(0.05, 0.16, 0.12, 8, STEEL_B, [cx + s * 0.34, R, z], [1, 0, 0], { bone: wj });
      // tread lugs, merged
      const lugs: THREE.BufferGeometry[] = [];
      const N = 18;
      for (let k = 0; k < N; k++) {
        const t = (k / N) * Math.PI * 2;
        const g = new THREE.BoxGeometry(0.48, 0.09, 0.2);
        g.rotateX(t);
        g.translate(cx, R + (R + 0.02) * Math.cos(t) - R, z + (R + 0.02) * Math.sin(t));
        g.translate(0, 0, 0);
        lugs.push(g);
      }
      // lug y positions were offset relative to wheel centre; shift to world
      const merged = mergeGeometries(lugs)!;
      merged.translate(0, R, 0);
      b.part(merged, RUBBER, { bone: wj, at: [0, 0, 0], flat: true } as any);
      // lug nuts, merged
      const nuts: THREE.BufferGeometry[] = [];
      for (let k = 0; k < 6; k++) {
        const t = (k / 6) * Math.PI * 2;
        const g = new THREE.CylinderGeometry(0.035, 0.035, 0.07, 6);
        g.rotateZ(Math.PI / 2);
        g.translate(cx + s * 0.3, R + 0.24 * Math.cos(t), z + 0.24 * Math.sin(t));
        nuts.push(g);
      }
      b.part(mergeGeometries(nuts)!, STEEL_B, { bone: wj, at: [0, 0, 0], flat: true } as any);
      // fender, side wall and mud flap
      bx([0.85, 0.1, 1.8], HULL, [cx, 1.4, z]);
      bx([0.1, 0.35, 1.8], HULL, [cx + s * 0.4, 1.22, z]);
      bx([0.5, 0.45, 0.06], RUBBER, [cx, 0.95, z - 0.95]);
      bx([0.85, 0.1, 0.3], HULL, [cx, 1.3, z + 0.9], { rotation: [25, 0, 0] });
    }
  });
  // fuel tanks and tool boxes between axles
  for (const s of [1, -1]) {
    cyl(0.28, 0.28, 1.3, 10, GUNM, [s * 1.42, 1.0, -1.0], [0, 0, 1]);
    for (const dz of [-0.4, 0.4]) bx([0.06, 0.12, 0.08], STEEL, [s * 1.42, 1.3, -1.0 + dz]);
    bx([0.35, 0.4, 0.9], OLIVE_D, [s * 1.35, 1.0, 1.8]);
    bx([0.04, 0.12, 0.3], STEEL, [s * 1.54, 1.05, 1.8]);
  }

  // ------------------------------------------------------------ rear equipment
  bx([2.2, 0.7, 1.4], HULL, [0, 2.3, -3.6]);
  bx([2.1, 0.08, 1.3], GUNM, [0, 2.69, -3.6]);
  for (let k = 0; k < 6; k++) bx([1.9, 0.14, 0.05], STEEL, [0, 2.77, -3.2 - k * 0.2]);
  for (const s of [1, -1]) plane(1.1, 0.5, VENT, [s * 1.105, 2.3, -3.6], [s, 0, 0]);
  // glow power cores on the rear face
  for (const x of [-0.6, 0, 0.6]) {
    cyl(0.18, 0.18, 0.12, 10, GUN, [x, 2.3, -4.32], [0, 0, -1]);
    glow(cyl(0.12, 0.12, 0.14, 10, CYAN, [x, 2.3, -4.33], [0, 0, -1]), 1.6);
  }
  plane(0.5, 0.5, WARN, [-0.8, 2.55, -4.305], [0, 0, -1]);
  b.rod([0.9, 2.65, -4.1], [0.9, 4.0, -4.2], 0.016, STEEL_B, { bone: hull });
  // rear bumper, lights, hazard plate, hitch
  bx([2.7, 0.3, 0.25], GUN, [0, 1.0, -4.5]);
  plane(1.5, 0.3, HAZ, [0, 1.0, -4.635], [0, 0, -1]);
  for (const s of [1, -1]) {
    glow(bx([0.3, 0.2, 0.06], RED, [s * 1.0, 1.55, -4.47]), 1.4);
    bx([0.34, 0.24, 0.04], GUN, [s * 1.0, 1.55, -4.45]);
  }
  cyl(0.08, 0.08, 0.4, 8, STEEL, [0, 1.0, -4.8], [0, 0, 1]);
  // capacitor racks on deck
  for (const s of [1, -1]) {
    bx([0.45, 0.5, 1.5], HULL, [s * 1.2, 2.2, 1.35]);
    bx([0.5, 0.06, 1.55], GUN, [s * 1.2, 2.47, 1.35]);
    for (let k = 0; k < 4; k++) glow(bx([0.08, 0.3, 0.18], CYAN, [s * 1.43, 2.2, 0.85 + k * 0.33]), 1.2);
  }

  // ------------------------------------------------------------ turret and railgun
  const TZ = -1.2;
  const turret = b.joint("turret", { parent: hull, at: [0, 1.95, TZ], dir: [0, 1, 0], role: "hinge" });
  cyl(1.12, 1.12, 0.1, 18, GUN, [0, 1.95, TZ], [0, 1, 0], { bone: turret });
  cyl(1.0, 1.05, 0.3, 16, HULL, [0, 2.15, TZ], [0, 1, 0], { bone: turret });
  for (const s of [1, -1]) {
    bx([0.3, 1.1, 1.5], HULL, [s * 0.72, 2.85, TZ], { bone: turret });
    bx([0.34, 0.2, 1.1], GUNM, [s * 0.72, 3.5, TZ], { bone: turret });
    cyl(0.1, 0.1, 0.06, 8, STEEL_B, [s * 0.9, 3.2, TZ], [1, 0, 0], { bone: turret });
  }
  bx([1.9, 0.1, 1.6], GUN, [0, 2.35, TZ], { bone: turret });

  const ang = (22 * Math.PI) / 180;
  const D = new THREE.Vector3(0, Math.sin(ang), Math.cos(ang));
  const U = new THREE.Vector3(0, Math.cos(ang), -Math.sin(ang));
  const P = new THREE.Vector3(0, 3.2, TZ);
  const g = (z: number, x = 0, y = 0) => P.clone().addScaledVector(D, z).add(new THREE.Vector3(x, 0, 0)).addScaledVector(U, y);
  const gun = b.joint("gun", { parent: turret, at: P, dir: D, role: "hinge" });
  const gz = (size: number[], color: any, z: number, x = 0, y = 0, o: Opt = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at: g(z, x, y), dir: D, axis: "z", up: [0, 1, 0], bone: gun, ...o } as any);
  const gc = (r: number, len: number, color: any, z: number, x = 0, y = 0, seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: g(z, x, y), dir: [D.x, D.y, D.z], bone: gun, flat: true } as any);

  // trunnion
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 1.7, 10), STEEL, { at: P, dir: [1, 0, 0], bone: gun, flat: true });
  // breech
  gz([1.3, 0.95, 2.2], GUNM, -0.4);
  gz([1.1, 0.2, 1.8], HULL, -0.3, 0, 0.55);
  gz([1.35, 0.3, 0.3], GUN, -1.5, 0, 0);
  gz([1.0, 0.6, 0.3], GUN, 0.8, 0, 0);
  for (const s of [1, -1]) {
    plane(0.9, 0.45, WARN, g(-0.4, s * 0.655, 0), [s, 0, 0], [U.x, U.y, U.z]);
    gz([0.12, 0.5, 1.4], STEEL, -0.4, s * 0.68, 0);
  }
  // rails
  for (const s of [1, -1]) {
    gz([0.2, 0.34, 7.4], STEEL_B, 4.7, s * 0.34, 0);
    glow(gz([0.04, 0.2, 7.2], CYAN, 4.6, s * 0.2, 0), 1.6);
    // capacitor barrels
    gc(0.2, 3.2, GUNM, 1.9, s * 0.85, -0.15);
    for (let k = 0; k < 4; k++) glow(gc(0.215, 0.1, CYAN, 0.7 + k * 0.75, s * 0.85, -0.15), 1.6);
    gz([0.5, 0.08, 0.3], GUN, 0.4, s * 0.6, -0.1);
    gz([0.5, 0.08, 0.3], GUN, 3.2, s * 0.6, -0.1);
    // side armour plate and scope
    gz([0.08, 0.5, 2.0], OLIVE_D, 2.4, s * 0.55, 0.0);
  }
  glow(gz([0.06, 0.06, 7.2], CYAN, 4.6, 0, 0), 1.2);
  for (let k = 0; k < 9; k++) {
    const z = 1.4 + k * 0.85;
    gz([0.92, 0.09, 0.2], GUN, z, 0, 0.24);
    gz([0.92, 0.09, 0.2], GUN, z, 0, -0.24);
    if (k % 3 === 0) gz([1.05, 0.12, 0.3], GUNM, z, 0, 0.32);
  }
  // muzzle
  gz([1.15, 0.8, 0.6], GUNM, 8.6, 0, 0);
  gz([0.8, 0.1, 0.4], STEEL, 8.6, 0, 0.45);
  glow(gz([0.5, 0.1, 0.06], CYAN, 8.92, 0, 0), 1.6);
  // optics
  gz([0.18, 0.2, 0.7], GUN, 0.2, 0.75, 0.55);
  gc(0.07, 0.4, STEEL_B, 0.7, 0.75, 0.55, 8);
  // elevation rams
  for (const s of [1, -1]) {
    const lo = new THREE.Vector3(s * 0.55, 1.95, TZ - 1.0);
    const hi = g(-0.9, s * 0.55, -0.55);
    const mid = lo.clone().lerp(hi, 0.55);
    b.rod(lo, mid, 0.1, GUNM, { bone: turret });
    b.rod(mid, hi, 0.06, STEEL_B, { bone: gun });
    b.part(new THREE.SphereGeometry(0.12, 6, 4), STEEL, { at: hi, bone: gun, flat: true });
  }

  // ------------------------------------------------------------ stabiliser legs
  const legSpots: [string, number][] = [["F", 1.8], ["R", -3.7]];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const [tag, z] of legSpots) {
      const shoulder = [s * 1.3, 1.55, z];
      const elbow = [s * 2.5, 1.45, z];
      const arm = b.joint(`stabArm${side}${tag}`, { parent: hull, at: shoulder, aim: elbow, role: "hinge" });
      const pis = b.joint(`stabPiston${side}${tag}`, { parent: arm, at: elbow, dir: [0, -1, 0], role: "hinge" });
      b.frustumBox(shoulder, elbow, [0.34, 0.3], [0.28, 0.28], { color: HULL, bone: arm });
      b.rod([s * 1.25, 1.1, z], [s * 2.45, 1.7, z], 0.07, GUNM, { bone: arm }); // diagonal brace
      b.part(new THREE.SphereGeometry(0.2, 8, 6), STEEL, { at: shoulder, bone: arm, flat: true });
      cyl(0.19, 0.19, 0.85, 8, GUNM, [elbow[0], 1.3, z], [0, 1, 0], { bone: pis });
      cyl(0.11, 0.11, 1.0, 8, STEEL_B, [elbow[0], 0.65, z], [0, 1, 0], { bone: pis });
      cyl(0.2, 0.2, 0.08, 8, GUN, [elbow[0], 1.76, z], [0, 1, 0], { bone: pis });
      cyl(0.5, 0.58, 0.14, 8, GUN, [elbow[0], 0.07, z], [0, 1, 0], { bone: pis });
      plane(0.92, 0.92, PAD, [elbow[0], 0.145, z], [0, 1, 0], [0, 0, 1], { bone: pis });
      // little hazard band on piston sleeve
      cyl(0.2, 0.2, 0.14, 8, YEL, [elbow[0], 1.0, z], [0, 1, 0], { bone: pis });
    }
  }

  return b.root;
}
