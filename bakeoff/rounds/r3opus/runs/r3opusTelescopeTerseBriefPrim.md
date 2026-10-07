```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Brass Star-Gazer Telescope",
  description:
    "A stylized classic refractor: navy tube with gold constellation studs, brass bands, dew shield and glass objective, finder scope, rack-and-pinion focuser, on a fork mount with setting circles atop a wooden tripod with brass clamps and an accessory tray of spare eyepieces.",
};

export default function build() {
  const b = createBuilder({ name: "telescope" });

  // ---------- palette ----------
  const NAVY = "#1f2d5c";
  const NAVY_DK = "#16204a";
  const BRASS = "#c9962e";
  const BRASS_LT = "#e6c25a";
  const GOLD = "#ffd75e";
  const WOOD = "#8a5a32";
  const WOOD_DK = "#5e3a1e";
  const BLACK = "#1c1c22";
  const RUBBER = "#2c2a2a";
  const GLASS = "#6fc6dc";
  const GLINT = "#e8fbff";
  const STEEL = "#8f96a0";

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 0, 0] });
  const az = b.joint("azimuth", { at: [0, 1.06, 0], parent: root });
  const P = new THREE.Vector3(0, 1.25, 0);
  const alt = b.joint("altitude", { at: [P.x, P.y, P.z], parent: az });

  // ---------- helpers ----------
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  const arr = (v: THREE.Vector3) => [v.x, v.y, v.z];

  // cylinder from point a (radius r0) to point c (radius r1)
  function cyl(a: number[], c: number[], r0: number, r1: number, color: string, seg: number, bone: any) {
    const A = V(a), C = V(c);
    const dir = C.clone().sub(A);
    const len = dir.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, seg);
    return b.part(g, color, { at: arr(A.clone().add(C).multiplyScalar(0.5)), dir: arr(dir.normalize()), bone });
  }
  function box(at: number[], sx: number, sy: number, sz: number, color: string, bone: any, dir?: number[]) {
    const g = new THREE.BoxGeometry(sx, sy, sz);
    return dir ? b.part(g, color, { at, dir, bone }) : b.part(g, color, { at, bone });
  }
  function ball(at: number[], r: number, color: string, bone: any, detail = 0) {
    return b.part(new THREE.IcosahedronGeometry(r, detail), color, { at, bone });
  }

  // telescope axis frame
  const tilt = (25 * Math.PI) / 180;
  const d = new THREE.Vector3(0, Math.sin(tilt), Math.cos(tilt));
  const u = new THREE.Vector3(0, Math.cos(tilt), -Math.sin(tilt));
  const xAx = new THREE.Vector3(1, 0, 0);
  const D = arr(d);
  const at = (s: number, uo = 0, xo = 0) =>
    arr(P.clone().addScaledVector(d, s).addScaledVector(u, uo).addScaledVector(xAx, xo));
  const tubeCyl = (s0: number, s1: number, r0: number, r1: number, color: string, seg = 14, uo = 0, xo = 0) =>
    cyl(at(s0, uo, xo), at(s1, uo, xo), r0, r1, color, seg, alt);
  const ringOnAxis = (s: number, R: number, t: number, color: string, uo = 0, seg = 16) => {
    const g = new THREE.TorusGeometry(R, t, 6, seg);
    g.rotateX(Math.PI / 2);
    return b.part(g, color, { at: at(s, uo), dir: D, bone: alt });
  };

  // ================= TRIPOD =================
  const legAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
  const legPt = (th: number, t: number) => {
    const r = 0.09 + (0.62 - 0.09) * t;
    const y = 1.0 * (1 - t);
    return [Math.sin(th) * r, y, Math.cos(th) * r];
  };
  for (const th of legAngles) {
    // hinge
    const tang = [Math.cos(th), 0, -Math.sin(th)];
    const hp = legPt(th, 0.0);
    cyl(
      [hp[0] - tang[0] * 0.04, hp[1], hp[2] - tang[2] * 0.04],
      [hp[0] + tang[0] * 0.04, hp[1], hp[2] + tang[2] * 0.04],
      0.022, 0.022, BRASS, 8, root
    );
    // upper wooden section (hexagonal)
    cyl(legPt(th, 0.0), legPt(th, 0.56), 0.032, 0.028, WOOD, 6, root);
    // grain stripe inlay
    cyl(legPt(th, 0.08), legPt(th, 0.48), 0.0335, 0.0295, WOOD_DK, 6, root).scale?.set?.(0.35, 1, 1.0);
    // brass clamp
    cyl(legPt(th, 0.52), legPt(th, 0.6), 0.038, 0.036, BRASS, 8, root);
    const cp = legPt(th, 0.56);
    cyl(cp, [cp[0] + tang[0] * 0.06, cp[1], cp[2] + tang[2] * 0.06], 0.007, 0.007, STEEL, 6, root);
    ball([cp[0] + tang[0] * 0.065, cp[1], cp[2] + tang[2] * 0.065], 0.016, BLACK, root);
    // lower wooden section
    cyl(legPt(th, 0.58), legPt(th, 0.92), 0.023, 0.021, WOOD, 6, root);
    // ferrule + spike
    cyl(legPt(th, 0.9), legPt(th, 0.945), 0.027, 0.027, BRASS, 8, root);
    cyl(legPt(th, 0.945), legPt(th, 1.0), 0.02, 0.003, BRASS_LT, 8, root);
  }

  // accessory tray + spreader arms
  const trayY = 0.42;
  {
    const g = new THREE.CylinderGeometry(0.3, 0.3, 0.025, 3);
    b.part(g, WOOD, { at: [0, trayY, 0], bone: root });
    const g2 = new THREE.CylinderGeometry(0.27, 0.27, 0.006, 3);
    b.part(g2, WOOD_DK, { at: [0, trayY + 0.0145, 0], bone: root });
    for (const th of legAngles) {
      const c = [Math.sin(th) * 0.29, trayY, Math.cos(th) * 0.29];
      cyl(c, legPt(th, 0.575), 0.008, 0.008, BRASS, 6, root);
      ball(c, 0.014, BRASS_LT, root);
    }
    // spare eyepieces on the tray
    const eps = [Math.PI / 3, Math.PI, (5 * Math.PI) / 3];
    eps.forEach((th, i) => {
      const x = Math.sin(th) * 0.12, z = Math.cos(th) * 0.12;
      const h = 0.04 + i * 0.012;
      const y0 = trayY + 0.0175;
      cyl([x, y0, z], [x, y0 + h, z], 0.017, 0.017, i === 1 ? BLACK : BRASS, 10, root);
      cyl([x, y0 + h, z], [x, y0 + h + 0.006, z], 0.02, 0.02, BRASS_LT, 10, root);
      cyl([x, y0 + h + 0.006, z], [x, y0 + h + 0.02, z], 0.018, 0.014, RUBBER, 10, root);
    });
    // a little brass compass on the tray
    cyl([0, trayY + 0.0175, 0], [0, trayY + 0.03, 0], 0.035, 0.035, BRASS, 12, root);
    cyl([0, trayY + 0.03, 0], [0, trayY + 0.032, 0], 0.03, 0.03, "#f4ead2", 12, root);
    box([0, trayY + 0.034, 0.01], 0.006, 0.003, 0.024, "#c0392b", root);
    box([0, trayY + 0.034, -0.01], 0.006, 0.003, 0.024, STEEL, root);
  }

  // tripod head
  cyl([0, 0.97, 0], [0, 1.0, 0], 0.12, 0.12, WOOD_DK, 12, root);
  cyl([0, 1.0, 0], [0, 1.03, 0], 0.125, 0.12, BRASS, 12, root);

  // ================= MOUNT (azimuth) =================
  cyl([0, 1.03, 0], [0, 1.1, 0], 0.075, 0.07, BRASS_LT, 16, az);
  // setting-circle ticks
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const h = i % 6 === 0 ? 0.03 : i % 2 === 0 ? 0.02 : 0.012;
    box([Math.sin(a) * 0.0735, 1.095 - h / 2, Math.cos(a) * 0.0735], 0.004, h, 0.004, BLACK, az);
  }
  // fork base and arms
  box([0, 1.115, 0], 0.24, 0.03, 0.11, NAVY_DK, az);
  for (const sx of [-1, 1]) {
    box([sx * 0.09, 1.215, 0], 0.024, 0.17, 0.1, NAVY_DK, az);
    box([sx * 0.09, 1.215, 0.051], 0.026, 0.17, 0.004, BRASS, az);
    box([sx * 0.09, 1.215, -0.051], 0.026, 0.17, 0.004, BRASS, az);
    // altitude bolt and knob
    cyl([sx * 0.102, 1.25, 0], [sx * 0.125, 1.25, 0], 0.028, 0.028, BRASS, 12, az);
    cyl([sx * 0.125, 1.25, 0], [sx * 0.145, 1.25, 0], 0.02, 0.016, BRASS_LT, 10, az);
    // dial ticks on the arm face
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      box([sx * 0.103, 1.25 + Math.cos(a) * 0.042, Math.sin(a) * 0.042], 0.003, 0.008, 0.003, GOLD, az);
    }
  }
  // slow-motion control rod with wooden handle
  cyl([0.06, 1.12, -0.05], [0.1, 0.92, -0.38], 0.005, 0.005, BRASS, 6, az);
  cyl([0.1, 0.92, -0.38], [0.104, 0.9, -0.41], 0.012, 0.016, WOOD, 8, az);
  ball([0.105, 0.897, -0.415], 0.017, WOOD_DK, az);

  // ================= OPTICAL TUBE (altitude) =================
  const rAt = (s: number) => 0.05 + 0.008 * ((s + 0.45) / 0.95);
  // trunnion axle
  cyl([-0.1, 1.25, 0], [0.1, 1.25, 0], 0.012, 0.012, STEEL, 8, alt);
  // main tube
  tubeCyl(-0.45, 0.5, 0.05, 0.058, NAVY, 16);
  // brass bands with gold pinstripes
  for (const s of [-0.45, 0.02, 0.48]) {
    tubeCyl(s - 0.018, s + 0.018, rAt(s) + 0.005, rAt(s) + 0.005, BRASS, 16);
    ringOnAxis(s - 0.035, rAt(s) + 0.0005, 0.0018, GOLD);
    ringOnAxis(s + 0.035, rAt(s) + 0.0005, 0.0018, GOLD);
  }
  // tube rings around the trunnion
  for (const s of [-0.13, 0.13]) ringOnAxis(s, rAt(s) + 0.004, 0.006, BRASS_LT);

  // dew shield, rim and objective
  tubeCyl(0.5, 0.72, 0.068, 0.072, NAVY_DK, 16);
  tubeCyl(0.5, 0.52, 0.074, 0.074, BRASS, 16);
  ringOnAxis(0.72, 0.071, 0.006, BRASS_LT);
  tubeCyl(0.716, 0.723, 0.063, 0.063, GLASS, 16);
  tubeCyl(0.723, 0.726, 0.02, 0.02, GLINT, 10, 0.022, -0.015);
  tubeCyl(0.723, 0.726, 0.008, 0.008, GLINT, 8, -0.02, 0.02);

  // back cap and focuser
  tubeCyl(-0.48, -0.45, 0.053, 0.053, BRASS, 16);
  tubeCyl(-0.62, -0.48, 0.032, 0.032, BRASS, 12);
  ringOnAxis(-0.6, 0.033, 0.003, BRASS_LT, 0, 12);
  tubeCyl(-0.72, -0.62, 0.024, 0.024, BRASS_LT, 12);
  tubeCyl(-0.735, -0.72, 0.027, 0.027, BRASS, 12);
  // eyepiece
  tubeCyl(-0.8, -0.735, 0.02, 0.021, BLACK, 12);
  ringOnAxis(-0.77, 0.0215, 0.0025, BRASS_LT, 0, 12);
  tubeCyl(-0.83, -0.8, 0.025, 0.021, RUBBER, 12);
  // rack housing + focus knobs
  box(at(-0.54, -0.038), 0.04, 0.09, 0.025, BRASS, alt, D);
  {
    const c = V(at(-0.54, -0.048));
    cyl([c.x - 0.075, c.y, c.z], [c.x + 0.075, c.y, c.z], 0.005, 0.005, STEEL, 6, alt);
    for (const sx of [-1, 1]) {
      const x0 = c.x + sx * 0.055, x1 = c.x + sx * 0.08;
      cyl([x0, c.y, c.z], [x1, c.y, c.z], 0.017, 0.017, BRASS_LT, 10, alt);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        box([(x0 + x1) / 2, c.y + Math.cos(a) * 0.017, c.z + Math.sin(a) * 0.017], 0.022, 0.004, 0.004, BRASS, alt);
      }
      ball([x1 + sx * 0.002, c.y, c.z], 0.008, BRASS, alt);
    }
  }

  // finder scope
  const FU = 0.1;
  tubeCyl(-0.26, 0.05, 0.017, 0.019, NAVY, 10, FU);
  tubeCyl(0.05, 0.11, 0.024, 0.024, BRASS, 10, FU);
  tubeCyl(0.11, 0.113, 0.02, 0.02, GLASS, 10, FU);
  tubeCyl(-0.27, -0.26, 0.019, 0.019, BRASS, 10, FU);
  tubeCyl(-0.31, -0.27, 0.011, 0.011, BLACK, 8, FU);
  for (const s of [-0.18, -0.01]) {
    box(at(s, (rAt(s) + FU - 0.02) / 2), 0.012, FU - 0.02 - rAt(s) + 0.006, 0.014, BRASS, alt, arr(u));
    ringOnAxis(s, 0.0205, 0.004, BRASS_LT, FU, 12);
    box(at(s, rAt(s) + 0.002), 0.03, 0.006, 0.03, BRASS, alt, arr(u));
  }

  // brass name plate on the left (+X) side with rivets
  box(at(0.25, 0, rAt(0.25) + 0.002), 0.004, 0.14, 0.034, BRASS_LT, alt, D);
  box(at(0.25, 0, rAt(0.25) + 0.0045), 0.002, 0.11, 0.004, NAVY_DK, alt, D);
  for (const s of [0.188, 0.312]) ball(at(s, 0, rAt(s) + 0.004), 0.0035, BRASS, alt);

  // gold constellation studs on the tube
  const stars: [number, number, number][] = [
    [-0.35, 0.6, 0.006], [-0.28, 1.1, 0.004], [-0.2, 0.75, 0.005], [-0.08, -0.5, 0.0045],
    [0.1, 0.9, 0.007], [0.17, 1.35, 0.004], [0.24, 0.4, 0.005], [0.33, -0.9, 0.0055],
    [0.38, 1.0, 0.0045], [0.42, -0.3, 0.004], [-0.3, -0.8, 0.005], [0.08, -1.2, 0.0045],
    [-0.15, 1.6, 0.0035], [0.3, 1.9, 0.004],
  ];
  for (const [s, a, sz] of stars) {
    const R = rAt(s) + 0.001;
    ball(at(s, Math.cos(a) * R, Math.sin(a) * R), sz, GOLD, alt);
  }

  return b.root;
}
```