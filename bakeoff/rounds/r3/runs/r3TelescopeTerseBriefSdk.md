```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Refractor Telescope",
  description: "Brass-and-white refractor telescope on a wooden tripod with finder scope, focuser, diagonal and eyepiece.",
};

export default function build() {
  const b = createBuilder({ name: "telescope" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const pan = b.joint("pan", { at: [0, 1.15, 0], parent: base });
  const tilt = b.joint("tilt", { at: [0, 1.4, 0], parent: pan });
  const focus = b.joint("focuser", { at: [0, 1.4, 0], parent: tilt });

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const Y = V(0, 1, 0);

  // cylinder (frustum) between two points
  function cyl(a: THREE.Vector3, c: THREE.Vector3, r1: number, r2: number, color: string, bone: any, seg = 12) {
    const dir = c.clone().sub(a);
    const len = dir.length();
    const g = new THREE.CylinderGeometry(r2, r1, len, seg);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(Y, dir.clone().normalize()));
    const m = a.clone().add(c).multiplyScalar(0.5);
    return b.part(g, color, { at: [m.x, m.y, m.z], bone });
  }
  function box(w: number, h: number, d: number, p: THREE.Vector3, color: string, bone: any, q?: THREE.Quaternion) {
    const g = new THREE.BoxGeometry(w, h, d);
    if (q) g.applyQuaternion(q);
    return b.part(g, color, { at: [p.x, p.y, p.z], bone });
  }
  function ball(r: number, p: THREE.Vector3, color: string, bone: any) {
    return b.part(new THREE.IcosahedronGeometry(r, 1), color, { at: [p.x, p.y, p.z], bone });
  }

  // ---- tripod ----
  const top = V(0, 1.15, 0);
  for (let i = 0; i < 3; i++) {
    const ang = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const foot = V(Math.sin(ang) * 0.7, 0.0, Math.cos(ang) * 0.7);
    const hip = V(Math.sin(ang) * 0.06, 1.12, Math.cos(ang) * 0.06);
    cyl(foot.clone().setY(0.0), hip, 0.028, 0.04, "#8a5a32", base, 8);
    // lower leg extension (lighter wood) and rubber foot
    const lower = foot.clone().lerp(hip, 0.35);
    cyl(foot.clone().setY(0.03), lower, 0.03, 0.034, "#b98552", base, 8);
    cyl(foot.clone().setY(0), foot.clone().setY(0.05), 0.032, 0.026, "#222222", base, 8);
    // metal clamp
    cyl(lower.clone().add(V(0, -0.03, 0)), lower.clone().add(V(0, 0.03, 0)), 0.04, 0.04, "#555a60", base, 8);
    // spreader strut
    const sp = foot.clone().lerp(hip, 0.45);
    sp.x *= 1; 
    const next = ((i + 1) / 3) * Math.PI * 2 + Math.PI / 6;
    const foot2 = V(Math.sin(next) * 0.7, 0, Math.cos(next) * 0.7).lerp(V(0, 1.12, 0), 0.45);
    cyl(sp, foot2, 0.01, 0.01, "#444a50", base, 6);
  }
  // accessory tray
  b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 3), "#3a3d42", { at: [0, 0.52, 0], bone: base });

  // ---- mount head ----
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.06, 6), "#2b2d31", { at: [0, 1.15, 0], bone: pan });
  cyl(V(0, 1.17, 0), V(0, 1.32, 0), 0.04, 0.05, "#c9ccd1", pan, 10);
  box(0.22, 0.05, 0.1, V(0, 1.33, 0), "#2b2d31", pan);
  // fork arms
  for (const s of [-1, 1]) {
    box(0.035, 0.16, 0.1, V(0.12 * s, 1.4, 0), "#3a3d42", pan);
  }
  // tilt axle & knobs
  cyl(V(-0.2, 1.4, 0), V(0.2, 1.4, 0), 0.02, 0.02, "#b08d3c", tilt, 8);
  for (const s of [-1, 1]) {
    cyl(V(0.14 * s, 1.4, 0), V(0.22 * s, 1.4, 0), 0.03, 0.045, "#1b1c1f", tilt, 8);
  }
  cyl(V(0, 1.33, -0.06), V(0, 1.33, -0.12), 0.015, 0.015, "#b08d3c", pan, 6);
  ball(0.035, V(0, 1.33, -0.14), "#1b1c1f", pan);

  // ---- optical tube (axis d, pitched 25 deg up) ----
  const el = (25 * Math.PI) / 180;
  const d = V(0, Math.sin(el), Math.cos(el));
  const u = V(0, Math.cos(el), -Math.sin(el));
  const piv = V(0, 1.4, 0);
  const P = (t: number, h = 0) => piv.clone().addScaledVector(d, t).addScaledVector(u, h);

  cyl(P(-0.35), P(0.55), 0.065, 0.065, "#f1f0ea", tilt, 16); // main tube
  cyl(P(0.5), P(0.82), 0.09, 0.095, "#f1f0ea", tilt, 16); // dew shield
  cyl(P(0.8), P(0.84), 0.1, 0.1, "#1e2a52", tilt, 16);
  cyl(P(0.5), P(0.54), 0.098, 0.098, "#b08d3c", tilt, 16);
  cyl(P(0.54), P(0.56), 0.075, 0.075, "#b08d3c", tilt, 16);
  cyl(P(0.5), P(0.5), 0.0, 0.0, "#000", tilt, 3);
  cyl(P(0.55), P(0.5501), 0.001, 0.001, "#000", tilt, 3);
  // objective glass (inside dew shield)
  cyl(P(0.55), P(0.575), 0.078, 0.078, "#3a6e9c", tilt, 16);
  // dark inside of shield
  cyl(P(0.6), P(0.62), 0.082, 0.082, "#15181d", tilt, 16);
  // brass decorative bands
  for (const t of [-0.3, 0.1, 0.45]) cyl(P(t), P(t + 0.02), 0.069, 0.069, "#b08d3c", tilt, 16);
  // rear cell
  cyl(P(-0.38), P(-0.35), 0.075, 0.07, "#1b1c1f", tilt, 14);

  // mounting rings and dovetail
  for (const t of [-0.02, 0.28]) {
    cyl(P(t), P(t + 0.04), 0.082, 0.082, "#2b2d31", tilt, 14);
    cyl(P(t + 0.02, -0.07), P(t + 0.02, -0.1), 0.02, 0.02, "#2b2d31", tilt, 8);
  }
  const qd = new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), d);
  box(0.07, 0.025, 0.55, P(0.13, -0.1), "#1b1c1f", tilt, qd);

  // focuser & drawtube
  cyl(P(-0.36), P(-0.46), 0.045, 0.04, "#1b1c1f", focus, 12);
  cyl(P(-0.44), P(-0.54), 0.03, 0.03, "#c9ccd1", focus, 12);
  for (const s of [-1, 1]) {
    const k = P(-0.42).add(V(0.045 * s, 0, 0));
    cyl(k, k.clone().add(V(0.05 * s, 0, 0)), 0.012, 0.012, "#b08d3c", focus, 8);
    cyl(k.clone().add(V(0.05 * s, 0, 0)), k.clone().add(V(0.07 * s, 0, 0)), 0.03, 0.03, "#1b1c1f", focus, 8);
  }
  // star diagonal + eyepiece (perpendicular to tube)
  box(0.07, 0.07, 0.07, P(-0.57), "#2b2d31", focus, qd);
  cyl(P(-0.57), P(-0.57, 0.12), 0.026, 0.026, "#c9ccd1", focus, 10);
  cyl(P(-0.57, 0.1), P(-0.57, 0.2), 0.03, 0.036, "#1b1c1f", focus, 10);
  cyl(P(-0.57, 0.2), P(-0.57, 0.205), 0.02, 0.02, "#4a8ac0", focus, 10);
  cyl(P(-0.57, 0.14), P(-0.57, 0.15), 0.037, 0.037, "#b08d3c", focus, 10);

  // finder scope on top
  const fr = 0.1;
  for (const t of [-0.1, 0.2]) {
    cyl(P(t, 0.06), P(t, fr), 0.012, 0.012, "#2b2d31", tilt, 6);
    cyl(P(t - 0.015, fr), P(t + 0.015, fr), 0.03, 0.03, "#2b2d31", tilt, 10);
  }
  cyl(P(-0.2, fr + 0.0), P(0.3, fr + 0.0), 0.022, 0.026, "#1b1c1f", tilt, 12);
  cyl(P(0.3, fr), P(0.38, fr), 0.026, 0.032, "#1b1c1f", tilt, 12);
  cyl(P(0.38, fr), P(0.385, fr), 0.026, 0.026, "#4a8ac0", tilt, 12);
  cyl(P(-0.2, fr), P(-0.27, fr), 0.018, 0.018, "#b08d3c", tilt, 10);
  cyl(P(-0.27, fr), P(-0.29, fr), 0.02, 0.02, "#1b1c1f", tilt, 10);

  b.root.userData.meta = meta;
  return b.root;
}
```