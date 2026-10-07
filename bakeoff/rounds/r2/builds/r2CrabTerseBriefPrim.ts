import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Crab",
  description: "Stylized shore crab with a wide carapace, two pincers, eight walking legs and eye stalks, rigged for animation.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "crab" });
  const SHELL = "#d9482b", DARK = "#a8321e", LIGHT = "#f3cfa4", TIP = "#fff1dc", BLACK = "#15110f", SPOT = "#ef7a4a";

  const root = b.joint("body", { at: [0, 0.085, 0] });

  const sub = (p: V, q: V): V => [q[0] - p[0], q[1] - p[1], q[2] - p[2]];
  const len = (v: V) => Math.hypot(v[0], v[1], v[2]);
  const norm = (v: V): V => { const l = len(v); return [v[0] / l, v[1] / l, v[2] / l]; };
  const midp = (p: V, q: V): V => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];

  // tapered segment from p to q on a bone
  function seg(p: V, q: V, r0: number, r1: number, color: string, bone: any) {
    const d = sub(p, q);
    const l = len(d);
    const g = new THREE.CylinderGeometry(r1, r0, l, 6);
    b.part(g, color, { at: midp(p, q), dir: norm(sub(q, p)), bone });
  }
  function ball(p: V, r: number, color: string, bone: any, sc: V = [1, 1, 1]) {
    const g = new THREE.SphereGeometry(r, 8, 6);
    g.scale(sc[0], sc[1], sc[2]);
    b.part(g, color, { at: p, bone });
  }
  function cone(base: V, dir: V, l: number, r: number, color: string, bone: any) {
    const d = norm(dir);
    const g = new THREE.ConeGeometry(r, l, 6);
    b.part(g, color, { at: [base[0] + d[0] * l / 2, base[1] + d[1] * l / 2, base[2] + d[2] * l / 2], dir: d, bone });
  }

  // ---- carapace ----
  ball([0, 0.015, 0], 0.15, SHELL, root, [1.2, 0.42, 0.85]);
  ball([0, 0.0, 0.0], 0.14, LIGHT, root, [1.15, 0.3, 0.8]);
  ball([0, 0.035, -0.01], 0.13, SHELL, root, [1.15, 0.38, 0.8]);
  // front ridge and side spikes
  b.part(new THREE.BoxGeometry(0.24, 0.016, 0.02), DARK, { at: [0, 0.052, 0.085], bone: root });
  for (const s of [1, -1]) {
    cone([s * 0.17, 0.02, 0.0], [s, 0.1, 0.15], 0.05, 0.016, DARK, root);
    cone([s * 0.15, 0.02, 0.06], [s, 0.1, 0.5], 0.04, 0.014, DARK, root);
    cone([s * 0.15, 0.02, -0.05], [s, 0.1, -0.3], 0.04, 0.014, DARK, root);
  }
  // carapace bumps
  const bumps: V[] = [[0.06, 0.07, 0.02], [-0.06, 0.07, 0.02], [0, 0.075, -0.04], [0.1, 0.055, -0.03], [-0.1, 0.055, -0.03], [0, 0.07, 0.05]];
  bumps.forEach((p, i) => ball(p, 0.017 - (i % 2) * 0.003, SPOT, root, [1, 0.6, 1]));
  // abdomen flap underneath rear
  b.part(new THREE.BoxGeometry(0.07, 0.01, 0.09), DARK, { at: [0, -0.03, -0.07], bone: root });

  // ---- mouth with jaw ----
  const jaw = b.joint("jaw", { at: [0, -0.005, 0.115], parent: root });
  b.part(new THREE.BoxGeometry(0.06, 0.014, 0.025), LIGHT, { at: [0, 0.012, 0.115], bone: root });
  b.part(new THREE.BoxGeometry(0.055, 0.014, 0.025), DARK, { at: [0, -0.01, 0.125], bone: jaw });

  // ---- eyes ----
  for (const [n, s] of [["L", 1], ["R", -1]] as [string, number][]) {
    const eye = b.joint("eye" + n, { at: [s * 0.045, 0.06, 0.1], parent: root });
    const tip: V = [s * 0.055, 0.115, 0.115];
    seg([s * 0.045, 0.05, 0.1], tip, 0.008, 0.007, LIGHT, eye);
    ball(tip, 0.017, TIP, eye);
    ball([tip[0], tip[1] + 0.002, tip[2] + 0.011], 0.009, BLACK, eye);
  }

  // ---- walking legs ----
  for (const [n, s] of [["L", 1], ["R", -1]] as [string, number][]) {
    for (let i = 0; i < 4; i++) {
      const z = 0.045 - i * 0.045;
      const spread = 0.05 + (i === 1 || i === 2 ? 0.02 : 0) ;
      const hipP: V = [s * 0.12, 0.07 - 0.085 + 0.085, z];
      const kneeP: V = [s * (0.25 + spread * 0.3), 0.115, z + 0.0 - i * 0.004 + 0.015];
      const ankP: V = [s * (0.33 + spread * 0.4), 0.03, z - 0.015 - i * 0.012];
      const toeP: V = [s * (0.355 + spread * 0.4), -0.001, z - 0.025 - i * 0.015];
      const hip = b.joint(`hip${n}${i + 1}`, { at: hipP, parent: root });
      const knee = b.joint(`knee${n}${i + 1}`, { at: kneeP, parent: hip });
      const ankle = b.joint(`ankle${n}${i + 1}`, { at: ankP, parent: knee });
      seg(hipP, kneeP, 0.016, 0.013, SHELL, hip);
      ball(kneeP, 0.016, DARK, knee);
      seg(kneeP, ankP, 0.013, 0.01, SHELL, knee);
      ball(ankP, 0.011, DARK, ankle);
      seg(ankP, toeP, 0.01, 0.004, LIGHT, ankle);
    }
  }

  // ---- claws ----
  for (const [n, s] of [["L", 1], ["R", -1]] as [string, number][]) {
    const shP: V = [s * 0.14, 0.04, 0.09];
    const elP: V = [s * 0.22, 0.07, 0.15];
    const wrP: V = [s * 0.2, 0.065, 0.24];
    const shoulder = b.joint(`shoulder${n}`, { at: shP, parent: root });
    const elbow = b.joint(`elbow${n}`, { at: elP, parent: shoulder });
    const wrist = b.joint(`wrist${n}`, { at: wrP, parent: elbow });
    seg(shP, elP, 0.022, 0.019, SHELL, shoulder);
    ball(elP, 0.024, DARK, elbow);
    seg(elP, wrP, 0.019, 0.022, SHELL, elbow);
    ball(wrP, 0.024, DARK, wrist);
    // palm
    const palm: V = [s * 0.19, 0.065, 0.295];
    const pg = new THREE.SphereGeometry(0.05, 8, 6);
    pg.scale(0.95, 0.65, 1.0);
    b.part(pg, SHELL, { at: palm, bone: wrist });
    ball([s * 0.19, 0.095, 0.29], 0.015, SPOT, wrist, [1, 0.6, 1]);
    // fixed finger (lower)
    const fb: V = [s * 0.185, 0.05, 0.325];
    cone(fb, [-s * 0.15, 0, 1], 0.07, 0.022, SHELL, wrist);
    cone([fb[0] - s * 0.011, 0.05, 0.385], [-s * 0.15, 0, 1], 0.025, 0.012, TIP, wrist);
    // movable finger
    const pin = b.joint(`pincer${n}`, { at: [s * 0.19, 0.082, 0.325], parent: wrist });
    cone([s * 0.19, 0.082, 0.325], [-s * 0.25, 0.0, 1], 0.07, 0.02, DARK, pin);
    cone([s * 0.19 - s * 0.017, 0.082, 0.385], [-s * 0.25, 0, 1], 0.025, 0.011, TIP, pin);
    // inner teeth
    for (let k = 0; k < 3; k++) {
      cone([s * (0.178 - k * 0.002), 0.066, 0.34 + k * 0.016], [-s, 0, 0.1], 0.008, 0.004, TIP, wrist);
    }
  }

  return b.root;
}
