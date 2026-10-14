import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Explorer's Brass Telescope",
  description:
    "Polished brass telescope with leather wraps, engraved rings, finder scope, rubber eyecup and focus knobs, on a mahogany tripod with brass fittings and a tray holding a rolled star chart.",
};

export default function build() {
  const b = createBuilder({ name: "telescope" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const PIV = new THREE.Vector3(0, 1.55, 0);
  const pan = b.joint("pan", { at: [0, 1.3, 0], parent: base });
  const tilt = b.joint("tilt", { at: [PIV.x, PIV.y, PIV.z], parent: pan });

  const BRASS = "#c8963c", DBRASS = "#8a6a2a", MAH = "#5a2416", MAH2 = "#7a3a1c";
  const LEATHER = "#3b2314", RUBBER = "#1a1a1a", GLASS = "#6fa0c8";
  const PARCH = "#e8d9b0", RIBBON = "#a02828", STITCH = "#d9c9a0";

  // ---------- helpers ----------
  const rodGeo = (a: THREE.Vector3, c: THREE.Vector3, r0: number, r1: number, seg = 8) => {
    const d = c.clone().sub(a);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, seg);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    g.applyMatrix4(new THREE.Matrix4().compose(a.clone().add(c).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)));
    return g;
  };
  const rod = (a: THREE.Vector3, c: THREE.Vector3, r0: number, r1: number, col: string, bone: any, seg = 8) =>
    b.part(rodGeo(a, c, r0, r1, seg), col, { bone });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const TH = 0.5236;
  const dir = V(0, Math.sin(TH), Math.cos(TH));
  const up = V(0, Math.cos(TH), -Math.sin(TH));
  const P = (s: number, u = 0, x = 0) =>
    PIV.clone().addScaledVector(dir, s).addScaledVector(up, u).add(V(x, 0, 0));
  // cylinder along scope axis; rt = radius at front end
  const cylA = (rt: number, rb: number, len: number, seg: number, s: number, u: number, x: number, col: string) => {
    const g = new THREE.CylinderGeometry(rt, rb, len, seg);
    g.rotateX(Math.PI / 2);
    g.rotateX(-TH);
    const p = P(s, u, x);
    g.translate(p.x, p.y, p.z);
    return b.part(g, col, { bone: tilt });
  };
  const cylX = (r: number, len: number, seg: number, p: THREE.Vector3, col: string, bone: any) => {
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    g.rotateZ(Math.PI / 2);
    g.translate(p.x, p.y, p.z);
    return b.part(g, col, { bone });
  };
  const ball = (r: number, p: THREE.Vector3, col: string, bone: any) => {
    const g = new THREE.IcosahedronGeometry(r, 1);
    g.translate(p.x, p.y, p.z);
    return b.part(g, col, { bone });
  };

  // ---------- main tube ----------
  cylA(0.04, 0.04, 1.0, 16, 0.05, 0, 0, BRASS);              // main body s -0.45..0.55
  cylA(0.062, 0.04, 0.12, 16, 0.49, 0, 0, BRASS);            // objective bell flare
  cylA(0.065, 0.065, 0.2, 16, 0.65, 0, 0, BRASS);            // dew shield
  cylA(0.069, 0.069, 0.02, 16, 0.75, 0, 0, DBRASS);          // shield lip
  cylA(0.058, 0.058, 0.008, 16, 0.745, 0, 0, GLASS);         // objective lens
  cylA(0.034, 0.034, 0.2, 14, -0.52, 0, 0, BRASS);           // sliding draw tube
  cylA(0.029, 0.029, 0.04, 14, -0.43, 0, 0, DBRASS);         // collar
  cylA(0.022, 0.022, 0.16, 12, -0.68, 0, 0, BRASS);          // eyepiece barrel
  cylA(0.026, 0.026, 0.02, 12, -0.6, 0, 0, DBRASS);
  cylA(0.026, 0.036, 0.07, 12, -0.78, 0, 0, RUBBER);         // rubber cup
  cylA(0.031, 0.031, 0.012, 12, -0.82, 0, 0, RUBBER);        // cup lip
  cylA(0.016, 0.016, 0.004, 12, -0.79, 0, 0, GLASS);         // eye lens

  // leather wraps with stitch strips
  for (const [s, len] of [[-0.25, 0.22], [0.22, 0.2]] as number[][]) {
    cylA(0.0435, 0.0435, len, 16, s, 0, 0, LEATHER);
    cylA(0.0445, 0.0445, 0.006, 16, s - len / 2, 0, 0, DBRASS);
    cylA(0.0445, 0.0445, 0.006, 16, s + len / 2, 0, 0, DBRASS);
    for (let i = 0; i < 5; i++) {
      const g = new THREE.BoxGeometry(0.004, 0.003, len * 0.9);
      g.rotateX(-TH);
      const a = Math.PI * 0.5 + (i - 2) * 0.12;
      const p = P(s, Math.sin(a) * 0.0445, Math.cos(a) * 0.0445);
      g.translate(p.x, p.y, p.z);
      b.part(g, STITCH, { bone: tilt });
    }
  }
  // engraved rings
  for (const s of [-0.4, -0.37, 0.0, 0.03, 0.36, 0.39, 0.46, 0.7]) {
    cylA(0.0425, 0.0425, 0.006, 16, s, 0, 0, DBRASS);
  }
  cylA(0.0415, 0.0415, 0.05, 16, 0.1, 0, 0, DBRASS);

  // focus knobs (both sides)
  for (const sx of [-1, 1]) {
    const c = P(-0.35, 0, sx * 0.058);
    cylX(0.007, 0.03, 8, c, DBRASS, tilt);
    cylX(0.024, 0.02, 10, c.clone().add(V(sx * 0.03, 0, 0)), BRASS, tilt);
    cylX(0.012, 0.008, 10, c.clone().add(V(sx * 0.043, 0, 0)), DBRASS, tilt);
  }

  // ---------- finder scope ----------
  const FU = 0.105;
  cylA(0.015, 0.015, 0.34, 12, 0.0, FU, 0, BRASS);
  cylA(0.026, 0.015, 0.06, 12, 0.19, FU, 0, BRASS);
  cylA(0.024, 0.024, 0.006, 12, 0.222, FU, 0, GLASS);
  cylA(0.011, 0.011, 0.07, 10, -0.2, FU, 0, DBRASS);
  cylA(0.017, 0.017, 0.025, 10, -0.25, FU, 0, RUBBER);
  for (const s of [-0.1, 0.1]) {
    cylA(0.023, 0.023, 0.014, 12, s, FU, 0, DBRASS);
    rod(P(s, 0.035), P(s, FU - 0.01), 0.007, 0.007, DBRASS, tilt, 6);
    cylA(0.016, 0.016, 0.03, 10, s, 0.04, 0, BRASS);
  }
  // alignment screws
  for (const sx of [-1, 1]) cylX(0.005, 0.03, 6, P(0.1, FU, sx * 0.03), BRASS, tilt);

  // ---------- head / yoke ----------
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.015, 16).translate(0, 1.225, 0), BRASS, { bone: pan });
  b.part(new THREE.CylinderGeometry(0.07, 0.085, 0.06, 12).translate(0, 1.265, 0), MAH, { bone: pan });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 12).translate(0, 1.305, 0), BRASS, { bone: pan });
  for (const sx of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.014, 0.27, 0.05).translate(sx * 0.07, 1.42, 0), BRASS, { bone: pan });
    b.part(new THREE.BoxGeometry(0.014, 0.05, 0.07).translate(sx * 0.07, 1.57, 0), BRASS, { bone: pan });
    cylX(0.024, 0.014, 10, V(sx * 0.085, 1.55, 0), DBRASS, pan);
  }
  cylX(0.01, 0.2, 8, V(0, 1.55, 0), DBRASS, tilt);
  cylX(0.026, 0.02, 8, V(0.115, 1.55, 0), BRASS, pan);
  cylX(0.026, 0.02, 8, V(-0.115, 1.55, 0), BRASS, pan);
  // tilt lock handle
  rod(V(0.12, 1.55, 0), V(0.2, 1.46, 0.07), 0.007, 0.007, DBRASS, pan, 6);
  ball(0.018, V(0.2, 1.46, 0.07), MAH, pan);
  // pan handle
  rod(V(0, 1.27, -0.08), V(0, 1.2, -0.34), 0.012, 0.01, MAH, pan, 8);
  cylX(0.0, 0, 3, V(0, 0, 0), BRASS, pan);
  rod(V(0, 1.268, -0.08), V(0, 1.255, -0.13), 0.016, 0.016, BRASS, pan, 8);
  ball(0.022, V(0, 1.195, -0.35), MAH, pan);

  // ---------- tripod ----------
  const legTop = (a: number) => V(Math.cos(a) * 0.07, 1.25, Math.sin(a) * 0.07);
  const legAt = (a: number, t: number) => {
    const R = 0.07 + 0.68 * t;
    return V(Math.cos(a) * R, 1.25 * (1 - t), Math.sin(a) * R);
  };
  const angs = [0, 1, 2].map((k) => -Math.PI / 2 + (k * Math.PI * 2) / 3);
  for (const a of angs) {
    const t0 = 0, t1 = 0.5, t2 = 1;
    rod(legAt(a, t0), legAt(a, t1), 0.036, 0.03, MAH, base, 6);
    rod(legAt(a, t1 - 0.02), legAt(a, t2 - 0.06), 0.027, 0.02, MAH2, base, 6);
    // collars, bands
    rod(legAt(a, 0.46), legAt(a, 0.54), 0.036, 0.036, BRASS, base, 8);
    rod(legAt(a, 0.05), legAt(a, 0.1), 0.039, 0.039, BRASS, base, 8);
    // hinge plate at top
    rod(legAt(a, 0.0), legAt(a, 0.03), 0.045, 0.045, DBRASS, base, 8);
    // foot
    rod(legAt(a, 0.93), legAt(a, 1.0), 0.026, 0.017, BRASS, base, 8);
    const f = legAt(a, 1.0);
    b.part(new THREE.ConeGeometry(0.012, 0.03, 6).rotateX(Math.PI).translate(f.x, 0.012, f.z), DBRASS, { bone: base });
    // link to head
    rod(legTop(a), V(0, 1.24, 0), 0.012, 0.012, BRASS, base, 6);
  }

  // ---------- tray ----------
  const TY = 0.62;
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.015, 6).translate(0, TY, 0), MAH, { bone: base });
  b.part(new THREE.CylinderGeometry(0.205, 0.205, 0.006, 6).translate(0, TY - 0.01, 0), BRASS, { bone: base });
  b.part(new THREE.TorusGeometry(0.2, 0.008, 4, 6).rotateX(Math.PI / 2).rotateY(Math.PI / 6 * 0).translate(0, TY + 0.01, 0), BRASS, { bone: base });
  for (const a of angs) {
    const t = (1.25 - TY) / 1.25;
    rod(V(Math.cos(a) * 0.19, TY - 0.005, Math.sin(a) * 0.19), legAt(a, t), 0.011, 0.011, BRASS, base, 6);
  }
  rod(V(0, 1.24, 0), V(0, TY + 0.01, 0), 0.008, 0.008, DBRASS, base, 6);

  // rolled star chart
  const CY = TY + 0.008 + 0.028;
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.3, 12).rotateZ(Math.PI / 2).rotateY(0.25).translate(0, CY, 0.01), PARCH, { bone: base });
  for (const sx of [-1, 1]) {
    const g = new THREE.CylinderGeometry(0.02, 0.02, 0.304, 10).rotateZ(Math.PI / 2).rotateY(0.25);
    g.translate(0, CY, 0.01);
    if (sx > 0) b.part(g, "#cdb985", { bone: base });
  }
  for (const x of [-0.08, 0.08]) {
    const g = new THREE.CylinderGeometry(0.031, 0.031, 0.014, 12).rotateZ(Math.PI / 2).rotateY(0.25);
    g.translate(x * Math.cos(0.25), CY, 0.01 - x * Math.sin(0.25));
    b.part(g, RIBBON, { bone: base });
  }
  // tiny star dots on chart
  const r = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  for (let i = 0; i < 8; i++) {
    const x = (r() - 0.5) * 0.24;
    const ang = r() * 1.5 + 0.2;
    const g = new THREE.OctahedronGeometry(0.004, 0);
    g.translate(x * Math.cos(0.25), CY + Math.sin(ang) * 0.028, 0.01 - x * Math.sin(0.25) + Math.cos(ang) * 0.028 * 0.0);
    b.part(g, "#3a3a6a", { bone: base });
  }

  return b.root;
}
