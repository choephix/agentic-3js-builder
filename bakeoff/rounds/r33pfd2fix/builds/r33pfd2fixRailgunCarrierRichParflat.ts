import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Longspear Railgun Carrier",
  "description": "A six-wheeled low-poly sci-fi military carrier with a long electromagnetic railgun on a turret, braced on four deployed hydraulic stabiliser legs."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#5b6350",
  hullDark: "#3a4034",
  hullLight: "#7d8769",
  panelSeam: "#262a22",
  trim: "#e7b814",
  metal: "#8a9097",
  gunmetal: "#2d3138",
  tire: "#1a1b1e",
  rim: "#6c727a",
  glass: "#1d3a4a",
  neonCyan: "#2ff3ff",
  warnRed: "#d6362b",
  lightWhite: "#fff6d8",
  hydraulic: "#b8bcc2",
  emblem: "#d9d9cf",
};
const M = {
  chassisTop: [0, 1.5, 0] as [number, number, number],
  axleFront: [0, 0.75, 3.2] as [number, number, number],
  axleMid: [0, 0.75, 0.2] as [number, number, number],
  axleRear: [0, 0.75, -2.8] as [number, number, number],
  cabRoof: [0, 2.7, 3.2] as [number, number, number],
  turretRing: [0, 1.9, -1.8] as [number, number, number],
  gunPivot: [0, 2.7, -1.8] as [number, number, number],
  legRootL: [1.6, 1, -0.8] as [number, number, number],
  legRootFrontL: [1.6, 1, 2] as [number, number, number],
  legRootR: [-1.6, 1, -0.8] as [number, number, number],
  legRootFrontR: [-1.6, 1, 2] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z] });
  const cyl = (r: number, len: number, seg: number, color: string, at: number[], dir: number[]) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { bone, at: at as any, dir: dir as any });
  const sph = (r: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), color, { bone, at: [x, y, z] });

  // main hull and underbody
  box(3.4, 0.7, 9.4, P.hull, 0, 1.45, -0.2);
  box(3.0, 0.5, 9.2, P.hullDark, 0, 0.9, -0.2);
  box(2.2, 0.3, 9.0, P.gunmetal, 0, 0.65, -0.2);
  // deck plate rear
  box(3.6, 0.15, 4.0, P.hullLight, 0, 1.87, -2.9);
  // ring seat collar
  b.part(new THREE.CylinderGeometry(1.35, 1.5, 0.2, 12), P.hullDark, { bone, at: [M.turretRing[0], 1.9 - 0.02, M.turretRing[2]] });
  b.part(new THREE.TorusGeometry(1.3, 0.06, 4, 16), P.trim, { bone, at: [0, 1.99, M.turretRing[2]], rotation: [90, 0, 0] });

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    sph(0.045, P.metal, Math.cos(a) * 1.4, 2.0, M.turretRing[2] + Math.sin(a) * 1.4);
  }

  const axles = [3.2, 0.2, -2.8];
  for (const s of [1, -1]) {
    // side skirts, seams and trim
    box(0.12, 0.6, 9.2, P.hullDark, s * 1.9, 1.05, -0.2);
    box(0.06, 0.1, 9.2, P.trim, s * 1.97, 1.4, -0.2);
    box(0.06, 0.1, 9.2, P.trim, s * 1.97, 1.2, -0.2);
    box(0.07, 0.03, 9.0, P.panelSeam, s * 1.97, 0.85, -0.2);
    for (const z of axles) {
      // fender arches
      box(0.5, 0.12, 1.9, P.hullLight, s * 1.8, 1.62, z);
      box(0.5, 0.45, 0.12, P.hull, s * 1.8, 1.4, z + 0.98);
      box(0.5, 0.45, 0.12, P.hull, s * 1.8, 1.4, z - 0.98);
      // axle beam and differential
      cyl(0.09, 3.6, 8, P.gunmetal, [0, 0.75, z], [1, 0, 0]);
      sph(0.3, P.metal, 0, 0.75, z);
    }
    // vertical seams and bolts
    for (let k = 0; k < 9; k++) {
      const z = -4.4 + k * 1.05;
      box(0.07, 0.5, 0.03, P.panelSeam, s * 1.97, 1.05, z);
      sph(0.035, P.metal, s * 1.99, 1.25, z + 0.12);
      sph(0.035, P.metal, s * 1.99, 0.9, z + 0.12);
    }
    // fuel tank and toolboxes between stations
    cyl(0.28, 1.2, 8, P.metal, [s * 2.0, 1.15, 1.7], [0, 0, 1]);
    box(0.1, 0.05, 1.2, P.trim, s * 2.27, 1.15, 1.7);
    box(0.3, 0.4, 1.1, P.hullDark, s * 2.0, 1.1, -1.3);
    box(0.04, 0.34, 1.0, P.gunmetal, s * 2.16, 1.1, -1.3);
    box(0.06, 0.05, 0.2, P.metal, s * 2.19, 1.2, -1.3);
    // front tow hooks
    box(0.25, 0.15, 0.4, P.metal, s * 1.3, 1.0, 4.85);
    // tail lights
    box(0.45, 0.2, 0.06, P.warnRed, s * 1.45, 1.5, -5.02);
    box(0.5, 0.05, 0.05, P.panelSeam, s * 1.45, 1.65, -5.03);
    // vents
    for (let v = 0; v < 4; v++) box(0.05, 0.04, 0.5, P.panelSeam, s * 1.97, 1.62, 3.9 - v * 0.0 + 0 - v * 0.0);
  }

  // front bumper
  box(3.9, 0.45, 0.5, P.gunmetal, 0, 1.0, 4.75);
  box(3.9, 0.1, 0.52, P.trim, 0, 1.25, 4.76);
  // rear bumper and ramp
  box(3.8, 0.4, 0.4, P.gunmetal, 0, 1.0, -4.9);
  b.part(new THREE.BoxGeometry(2.6, 0.08, 1.0), P.hullDark, { bone, at: [0, 1.15, -5.3], rotation: [-20, 0, 0] });
  for (let i = 0; i < 5; i++) box(2.4, 0.03, 0.06, P.metal, 0, 1.2 - i * 0.0, -4.95 - 0.0 - i * 0.0 - 0.0 - 0.0);
  // hazard stripes on rear bumper
  for (let i = 0; i < 8; i++) box(0.22, 0.12, 0.05, i % 2 ? P.trim : P.panelSeam, -1.5 + i * 0.43, 1.0, -5.12);
  // hood-side chassis top front panel seams
  for (let i = 0; i < 5; i++) box(3.0, 0.03, 0.04, P.panelSeam, 0, 1.81, 2.2 + i * 0.5 + R() * 0.0);
}
    return buildChassis;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P, M }: any) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot, flat: true });
  const cyl = (r: number, h: number, c: string, at: number[], rot?: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { bone, at, rotation: rot, flat: true });
  const G = (p: any, s = 1) => glow(p, s);

  // main cab block
  box(3.6, 1.0, 2.6, P.hull, [0, 2.0, 3.2]);
  box(3.7, 0.2, 2.7, P.hullDark, [0, 1.58, 3.2]);
  // upper greenhouse
  box(3.2, 0.7, 1.9, P.hullLight, [0, 2.75, 3.0]);
  // sloped glacis wedge nose
  box(3.6, 0.9, 1.6, P.hull, [0, 1.95, 4.45], [-28, 0, 0]);
  box(3.2, 0.1, 1.2, P.hullDark, [0, 1.65, 4.75], [-28, 0, 0]);
  // roof
  box(3.3, 0.12, 2.0, P.hullDark, [0, 3.12, 3.0]);
  box(3.0, 0.06, 1.6, P.hullLight, [0, 3.18, 3.0]);
  // windscreen (slanted)
  box(2.8, 0.45, 0.1, P.glass, [0, 2.78, 4.0], [-30, 0, 0]);
  G(box(2.6, 0.05, 0.06, P.neonCyan, [0, 2.97, 3.95], [-30, 0, 0]), 1.2);
  box(2.95, 0.07, 0.1, P.panelSeam, [0, 2.54, 4.0], [-30, 0, 0]);
  // nose hood panel and seams
  box(2.4, 0.06, 0.9, P.hullLight, [0, 2.4, 4.2], [-28, 0, 0]);
  for (const s of [1, -1]) {
    box(0.06, 0.08, 1.0, P.panelSeam, [s * 1.0, 2.42, 4.2], [-28, 0, 0]);
    // headlights
    G(box(0.4, 0.22, 0.1, P.lightWhite, [s * 1.35, 2.05, 4.95]), 1.5);
    box(0.5, 0.3, 0.06, P.gunmetal, [s * 1.35, 2.05, 4.88]);
    G(box(0.25, 0.1, 0.1, P.neonCyan, [s * 0.85, 1.75, 4.95]), 1.3);
    // side doors and windows
    const x = s * 1.82;
    box(0.06, 0.62, 1.4, P.glass, [x, 2.78, 3.0]);
    box(0.1, 0.1, 1.5, P.gunmetal, [x, 3.1, 3.0]);
    box(0.1, 0.1, 1.5, P.gunmetal, [x, 2.45, 3.0]);
    for (let i = 0; i < 4; i++) box(0.1, 0.5, 0.06, P.hullDark, [x + s * 0.02, 2.78, 2.45 + i * 0.37]);
    box(0.05, 0.9, 1.3, P.panelSeam, [s * 1.81, 1.95, 3.0]);
    box(0.08, 0.84, 1.24, P.hull, [s * 1.83, 1.95, 3.0]);
    box(0.1, 0.1, 0.3, P.metal, [s * 1.9, 2.0, 2.55]);
    // emblem + number
    cyl(0.2, 0.03, P.emblem, [s * 1.89, 2.2, 3.4], [0, 0, 90], 10);
    box(0.03, 0.22, 0.05, P.hullDark, [s * 1.9, 2.2, 3.4]);
    box(0.03, 0.05, 0.3, P.emblem, [s * 1.89, 1.8, 3.4]);
    box(0.03, 0.05, 0.2, P.emblem, [s * 1.89, 1.7, 3.4]);
    // fender trim
    box(0.08, 0.1, 2.4, P.trim, [s * 1.84, 1.65, 3.2]);
    // mirrors
    box(0.1, 0.4, 0.2, P.gunmetal, [s * 2.0, 2.7, 4.0]);
    // chevrons on the nose
    for (let i = 0; i < 3; i++)
      box(0.55, 0.1, 0.05, P.trim, [s * (0.3 + i * 0.0) + s * 0.3, 1.75 + i * 0.2, 4.97 - 0.0], [0, 0, s * 25]);
    // bolts on nose
    for (let i = 0; i < 3; i++) cyl(0.04, 0.04, P.metal, [s * (0.5 + i * 0.5), 2.5, 4.3], [62, 0, 0], 6);
  }
  // grille vents
  box(1.2, 0.5, 0.06, P.gunmetal, [0, 1.85, 4.97]);
  for (let i = 0; i < 5; i++) box(1.1, 0.04, 0.08, P.hullLight, [0, 1.68 + i * 0.09, 4.98]);
  // bumper tow hooks
  box(3.6, 0.2, 0.2, P.trim, [0, 1.52, 4.85]);
  // roof light bar
  box(1.8, 0.12, 0.25, P.gunmetal, [0, 3.3, 3.8]);
  for (let i = 0; i < 6; i++) G(box(0.24, 0.1, 0.2, i % 2 ? P.warnRed : P.neonCyan, [-0.7 + i * 0.28, 3.34, 3.8]), 1.3);
  // roof hatch
  cyl(0.38, 0.1, P.hullDark, [0.7, 3.25, 2.6], undefined, 8);
  cyl(0.3, 0.06, P.metal, [0.7, 3.32, 2.6], undefined, 8);
  box(0.12, 0.08, 0.12, P.gunmetal, [0.7, 3.38, 2.6]);
  // sensor dome
  b.part(new THREE.SphereGeometry(0.28, 8, 5, 0, 6.3, 0, 1.6), P.metal, { bone, at: [-0.8, 3.22, 2.7], flat: true });
  G(cyl(0.05, 0.05, P.neonCyan, [-0.8, 3.5, 2.7], undefined, 6));
  // antenna mast
  cyl(0.03, 1.2, P.gunmetal, [-1.4, 3.75, 2.3], undefined, 6);
  G(b.part(new THREE.SphereGeometry(0.06, 6, 4), P.warnRed, { bone, at: [-1.4, 4.38, 2.3] }));
  box(0.3, 0.04, 0.04, P.metal, [-1.4, 4.0, 2.3]);
  // rear wall + back panel
  box(3.4, 0.9, 0.1, P.hullDark, [0, 2.2, 1.95]);
  box(3.0, 0.1, 0.12, P.trim, [0, 1.75, 1.92]);
}
    return buildCab;
  })(),
  // wheels
  (() => {
function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.75, W = 0.6;
  const rand = rng(11);
  const wheels: [string, number, number][] = [
    ["wheelFL", 1, M.axleFront[2]], ["wheelML", 1, M.axleMid[2]], ["wheelRL", 1, M.axleRear[2]],
    ["wheelFR", -1, M.axleFront[2]], ["wheelMR", -1, M.axleMid[2]], ["wheelRR", -1, M.axleRear[2]],
  ];
  const HUB = "#4a5058";
  for (const [name, s, z] of wheels) {
    const j = J[name];
    const cx = s * 1.85;
    const cy = 0.75;
    // axle direction along x; cylinder axis Y -> aim to x
    const dir: [number, number, number] = [s, 0, 0];
    const at = (o: number, y = 0, zz = 0): [number, number, number] => [cx + s * o, cy + y, z + zz];
    // tire: 12-sided faceted
    b.part(new THREE.CylinderGeometry(R, R, W, 12), P.tire, { bone: j, at: at(0), dir, flat: true });
    // sidewall bulge rings
    for (const o of [-W / 2 + 0.03, W / 2 - 0.03])
      b.part(new THREE.CylinderGeometry(R * 0.93, R * 0.93, 0.08, 12), P.gunmetal, { bone: j, at: at(o), dir, flat: true });
    // tread blocks
    const n = 12;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.PI / n;
      const y = Math.cos(a) * (R + 0.03);
      const zz = Math.sin(a) * (R + 0.03);
      b.part(new THREE.BoxGeometry(W * 0.8, 0.09, 0.2), P.tire, {
        bone: j, at: at(0, y, zz), rotation: [(a * 180) / Math.PI - 90 + 90 * 0, 0, 0] as any, flat: true,
      });
    }
    // rim
    const out = s * (W / 2);
    b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 12), P.rim, { bone: j, at: at(W / 2 - 0.02 + 0.0), dir, flat: true });
    b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 12), P.rim, { bone: j, at: at(-W / 2 + 0.02), dir, flat: true });
    // yellow ring stripe
    b.part(new THREE.TorusGeometry(0.4, 0.025, 4, 16), P.trim, { bone: j, at: at(W / 2 + 0.04), dir, axis: "z" });
    // hub cap
    b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.12, 8), P.metal, { bone: j, at: at(W / 2 + 0.07), dir, flat: true });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 6), P.neonCyan, { bone: j, at: at(W / 2 + 0.14), dir, flat: true });
    // 8 bolts
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6), P.gunmetal, {
        bone: j, at: at(W / 2 + 0.06, Math.cos(a) * 0.3, Math.sin(a) * 0.3), dir, flat: true,
      });
    }
    // axle stub inward
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 8), P.metal, { bone: j, at: at(-W / 2 - 0.2), dir, flat: true });
    // suspension: arm to chassis, shock absorber
    const inX = s * 1.25;
    b.rod([cx - s * (W / 2 + 0.3), cy, z], [inX, cy + 0.35, z], 0.07, P.hullDark, { bone: j });

    b.rod([cx - s * (W / 2 + 0.25), cy + 0.1, z + 0.18], [s * 1.35, 1.35, z + 0.18], 0.08, P.gunmetal, { bone: j });
    b.rod([cx - s * (W / 2 + 0.25), cy + 0.1, z + 0.18], [s * 1.6, 0.9, z + 0.18], 0.045, P.hydraulic, { bone: j });
    b.part(new THREE.BoxGeometry(0.2, 0.15, 0.2), P.hullDark, { bone: j, at: [s * 1.35, 1.38, z + 0.18], flat: true });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.5 + rand() * 0.0, 8), P.trim, { bone: j, at: [s * 1.25, cy + 0.35, z], dir, flat: true });
  }
}
    return buildWheels;
  })(),
  // stabilisers
  (() => {
function buildStabilisers({ b, J, P, M }: any) {
  const R = rng(5);
  const legs: [string, number, number][] = [
    ["legRL", 1, M.legRootL[2]],
    ["legFL", 1, M.legRootFrontL[2]],
    ["legRR", -1, M.legRootR[2]],
    ["legFR", -1, M.legRootFrontR[2]],
  ];
  const PAD_R = 0.42;
  const PAD_H = 0.12;
  const BALL = 0.13;
  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any, dir?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, dir ? { bone, at, dir } : { bone, at });
  const along = (a: THREE.Vector3, d: THREE.Vector3, t: number) => a.clone().addScaledVector(d, t);

  for (const [name, s, z] of legs) {
    const bone = J[name];
    const root = new THREE.Vector3(s * 1.6, 1.0, z);
    const padC = new THREE.Vector3(s * 2.2, PAD_H / 2, z);
    const ballC = new THREE.Vector3(s * 2.2, PAD_H + BALL * 0.8, z);
    const dirV = ballC.clone().sub(root).normalize();
    const len = ballC.distanceTo(root);

    // mount bracket
    box(0.5, 0.55, 0.6, P.hullDark, [s * 1.5, 1.0, z], bone);
    box(0.3, 0.62, 0.66, P.gunmetal, [s * 1.72, 1.0, z], bone);
    for (const dz of [-0.2, 0.2])
      for (const dy of [-0.18, 0.18])
        b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 6), P.metal, {
          bone,
          at: [s * 1.88, 1.0 + dy, z + dz],
          dir: [s, 0, 0],
        });
    // pivot pin
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.7, 8), P.metal, { bone, at: root.toArray(), dir: [0, 0, 1] });

    // outer cylinder (dark)
    const cylEnd = along(root, dirV, len * 0.55);
    b.rod(root, cylEnd, 0.17, P.gunmetal, { bone, sides: 8 });
    // yellow bands
    for (const t of [0.08, 0.5]) {
      const p = along(root, dirV, len * t);
      b.part(new THREE.CylinderGeometry(0.195, 0.195, 0.09, 8), P.trim, {
        bone,
        at: p.toArray(),
        dir: dirV.toArray(),
      });
    }
    // inner rod
    b.rod(along(root, dirV, len * 0.5), ballC, 0.1, P.hydraulic, { bone, sides: 8 });
    // collar at rod exit
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8), P.metal, {
      bone,
      at: cylEnd.toArray(),
      dir: dirV.toArray(),
    });

    // diagonal strut brace
    const sa = new THREE.Vector3(s * 1.55, 0.7, z + 0.3);
    const sb = along(root, dirV, len * 0.62).add(new THREE.Vector3(0, 0, 0.3));
    b.rod(sa, sb, 0.05, P.metal, { bone, sides: 6 });
    const sa2 = sa.clone().setZ(z - 0.3);
    const sb2 = sb.clone().setZ(z - 0.3);
    b.rod(sa2, sb2, 0.05, P.metal, { bone, sides: 6 });
    for (const p of [sa, sb, sa2, sb2])
      b.part(new THREE.SphereGeometry(0.07, 6, 4), P.hullDark, { bone, at: p.toArray() });

    // swivel ball
    b.part(new THREE.SphereGeometry(BALL, 8, 6), P.metal, { bone, at: ballC.toArray() });
    // hex foot pad
    b.part(new THREE.CylinderGeometry(PAD_R, PAD_R * 1.1, PAD_H, 6), P.gunmetal, {
      bone,
      at: padC.toArray(),
    });
    b.part(new THREE.CylinderGeometry(PAD_R * 0.85, PAD_R * 0.9, 0.03, 6), P.hullDark, {
      bone,
      at: [padC.x, PAD_H + 0.01, padC.z],
    });
    // yellow rim stripes on pad
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      const r = PAD_R * 0.98;
      b.part(new THREE.BoxGeometry(0.2, 0.05, 0.06), i % 2 ? P.trim : P.hullDark, {
        bone,
        at: [padC.x + Math.cos(a) * r * 0.9, PAD_H * 0.55, padC.z + Math.sin(a) * r * 0.9],
        rotation: [0, (-a * 180) / Math.PI + 90, 0],
      });
    }
    // bolts on pad
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), P.metal, {
        bone,
        at: [padC.x + Math.cos(a) * 0.3, PAD_H + 0.04, padC.z + Math.sin(a) * 0.3],
      });
    }
    // warning light
    b.part(new THREE.SphereGeometry(0.045, 6, 4), P.warnRed, {
      bone,
      at: [padC.x, PAD_H + 0.04, padC.z + (z > 0.5 ? 0.38 : -0.38) * (R() > 2 ? 1 : 1)],
    });
  }
}
    return buildStabilisers;
  })(),
  // turretGun
  (() => {
function buildTurretGun({ b, J, P, M }: Ctx) {
  const T = J.turret;
  const G = J.gun;
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: T, at, ...o });
  const cyl = (r1: number, r2: number, h: number, seg: number, c: string, at: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r1, r2, h, seg), c, { bone: T, at, ...o });

  // Turret ring and housing
  cyl(1.3, 1.4, 0.2, 12, P.gunmetal, [0, 2.0, -1.8]);
  cyl(1.2, 1.2, 0.06, 12, P.trim, [0, 2.13, -1.8]);
  box(2.4, 0.6, 2.6, P.hull, [0, 2.45, -1.8]);
  box(2.0, 0.4, 2.2, P.hullLight, [0, 2.9, -1.9]);
  // sloped front plate
  box(2.2, 0.3, 0.9, P.hull, [0, 2.65, -0.35], { rotation: [-30, 0, 0] });
  box(1.8, 0.1, 0.6, P.hullDark, [0, 2.8, -0.45], { rotation: [-30, 0, 0] });
  // sloped sides
  for (const s of [1, -1]) {
    box(0.3, 0.7, 2.4, P.hull, [s * 1.2, 2.55, -1.8], { rotation: [0, 0, s * -18] });
    box(0.06, 0.12, 2.5, P.trim, [s * 1.38, 2.35, -1.8]);
    box(0.06, 0.4, 0.8, P.hullDark, [s * 1.4, 2.6, -1.8]);
    box(0.08, 0.34, 0.7, P.hull, [s * 1.43, 2.6, -1.8]);
    box(0.1, 0.06, 0.3, P.metal, [s * 1.48, 2.6, -1.55]);
    for (const z of [-2.5, -1.1]) box(0.07, 0.07, 0.07, P.metal, [s * 1.4, 2.8, z]);
  }
  // seams and bolts on top
  for (const z of [-2.6, -1.2]) box(2.1, 0.03, 0.04, P.panelSeam, [0, 3.12, z]);
  for (let i = 0; i < 6; i++) box(0.08, 0.05, 0.08, P.metal, [-0.8 + i * 0.32, 3.14, -2.9 + (i % 2) * 0.1]);
  box(2.4, 0.07, 0.07, P.trim, [0, 2.76, -0.55]);
  // sensor pod
  cyl(0.18, 0.22, 0.25, 8, P.gunmetal, [0.8, 3.2, -2.3]);
  b.part(new THREE.SphereGeometry(0.14, 8, 6), P.neonCyan, { bone: T, at: [0.8, 3.38, -2.3] });
  // beacon
  cyl(0.1, 0.12, 0.1, 8, P.gunmetal, [-0.8, 3.14, -2.3]);
  b.part(new THREE.SphereGeometry(0.1, 8, 6), P.warnRed, { bone: T, at: [-0.8, 3.24, -2.3] });

  // Rear capacitor bank
  box(2.2, 0.15, 1.2, P.gunmetal, [0, 2.1, -3.9]);
  for (let i = 0; i < 4; i++) {
    const x = -0.8 + i * 0.53;
    cyl(0.22, 0.22, 0.9, 8, P.metal, [x, 2.6, -3.9]);
    cyl(0.23, 0.23, 0.08, 8, P.trim, [x, 2.3, -3.9]);
    cyl(0.16, 0.16, 0.12, 6, P.neonCyan, [x, 3.1, -3.9]);
    box(0.06, 0.7, 0.04, P.neonCyan, [x, 2.6, -3.68]);
  }
  box(2.2, 0.08, 0.1, P.gunmetal, [0, 3.0, -3.4]);
  for (const x of [-0.5, 0.5]) b.rod([x, 3.15, -3.9], [x * 0.5, 3.1, -3.1], 0.04, P.panelSeam, { bone: T });

  // Railgun on gun joint, along direction d (12 deg)
  const el = 12 * Math.PI / 180;
  const d = new THREE.Vector3(0, Math.sin(el), Math.cos(el));
  const O = new THREE.Vector3(0, 2.95, -1.2);
  const pt = (z: number, y = 0, x = 0) => [x, O.y + d.y * z + Math.cos(el) * y, O.z + d.z * z - Math.sin(el) * y];
  const part = (g: THREE.BufferGeometry, c: string, z: number, y = 0, x = 0) =>
    b.part(g, c, { bone: G, at: pt(z, y, x), rotation: [-12, 0, 0] });
  const L = 6.2;
  // rails
  for (const s of [1, -1]) {
    part(new THREE.BoxGeometry(0.22, 0.32, L), P.gunmetal, L / 2 - 0.5, 0, s * 0.3);
    part(new THREE.BoxGeometry(0.05, 0.08, L - 0.2), P.metal, L / 2 - 0.5, 0.2, s * 0.3);
  }
  part(new THREE.BoxGeometry(0.34, 0.1, L - 0.3), P.neonCyan, L / 2 - 0.5, 0, 0);
  // breech
  part(new THREE.BoxGeometry(0.95, 0.75, 1.0), P.gunmetal, -0.2);
  part(new THREE.BoxGeometry(0.8, 0.1, 0.8), P.trim, -0.2, 0.42);
  part(new THREE.BoxGeometry(0.5, 0.5, 0.2), P.hullDark, -0.8);
  // coil rings
  for (let i = 0; i < 6; i++) {
    const z = 0.7 + i * 0.85;
    part(new THREE.BoxGeometry(0.9, 0.12, 0.14), P.neonCyan, z, 0.26);
    part(new THREE.BoxGeometry(0.9, 0.12, 0.14), P.neonCyan, z, -0.26);
    for (const s of [1, -1]) part(new THREE.BoxGeometry(0.12, 0.64, 0.14), P.neonCyan, z, 0, s * 0.45);
    part(new THREE.BoxGeometry(0.98, 0.04, 0.05), P.metal, z + 0.1, 0.33);
  }
  // muzzle brake
  const mz = L - 0.2;
  part(new THREE.BoxGeometry(0.9, 0.7, 0.6), P.gunmetal, mz);
  part(new THREE.BoxGeometry(0.96, 0.76, 0.1), P.trim, mz + 0.35);
  part(new THREE.BoxGeometry(0.96, 0.76, 0.1), P.trim, mz - 0.35);
  for (const s of [1, -1]) part(new THREE.BoxGeometry(0.05, 0.4, 0.3), P.hullDark, mz, 0, s * 0.46);
  // cradle struts
  for (const s of [1, -1]) {
    b.rod([s * 0.6, 2.75, -1.6], pt(0.2, -0.2, s * 0.4), 0.07, P.metal, { bone: T });
    b.rod([s * 0.6, 2.75, -0.5], pt(1.6, -0.2, s * 0.4), 0.06, P.metal, { bone: T });
    box(0.3, 0.5, 0.5, P.hullDark, [s * 0.7, 2.9, -1.0]);
  }
}
    return buildTurretGun;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.4,0], dir: [0,0,1], role: "spine" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.85,0.75,3.2], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.85,0.75,0.2], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.85,0.75,-2.8], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.85,0.75,3.2], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.85,0.75,0.2], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.85,0.75,-2.8], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["legRL"] = b.joint("legRL", { parent: J["body"], at: [1.6,1,-0.8], dir: [0.7,-0.7,0], role: "leg", group: "legs" });
  J["legFL"] = b.joint("legFL", { parent: J["body"], at: [1.6,1,2], dir: [0.7,-0.7,0], role: "leg", group: "legs" });
  J["legRR"] = b.joint("legRR", { parent: J["body"], at: [-1.6,1,-0.8], dir: [-0.7,-0.7,0], role: "leg", group: "legs" });
  J["legFR"] = b.joint("legFR", { parent: J["body"], at: [-1.6,1,2], dir: [-0.7,-0.7,0], role: "leg", group: "legs" });
  J["turret"] = b.joint("turret", { parent: J["body"], at: [0,1.9,-1.8], dir: [0,1,0], role: "hinge", group: "turret" });
  J["gun"] = b.joint("gun", { parent: J["turret"], at: [0,2.7,-1.8], dir: [0,0.2,1], role: "hinge", group: "turret" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
