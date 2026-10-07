import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Scorpion",
  description: "Stylized emperor scorpion: armored carapace, segmented abdomen, curled tail with stinger, pincers and eight legs, rigged with jointed limbs and tail.",
};

export default function build() {
  const b = createBuilder({ name: "scorpion" });
  const U = 0.01; // model authored in cm
  const P = (x: number, y: number, z: number): [number, number, number] => [x * U, y * U, z * U];

  const SHELL = "#5b3a1e";
  const SHELL_L = "#8a5a2b";
  const AMBER = "#c08a3a";
  const DARK = "#2a1a0e";
  const EYE = "#0b0b0b";
  const CLAW = "#a5692e";

  const root = b.joint("root", { at: P(0, 2.4, 0) });
  const head = b.joint("head", { at: P(0, 2.6, 4), parent: root });
  const abdomen = b.joint("abdomen", { at: P(0, 2.4, -1), parent: root });

  function ell(rx: number, ry: number, rz: number, pos: number[], color: string, bone: any, seg = 8) {
    const g = new THREE.SphereGeometry(1, seg, Math.max(4, seg - 2));
    g.scale(rx * U, ry * U, rz * U);
    return b.part(g, color, { at: P(pos[0], pos[1], pos[2]), bone });
  }
  function box(w: number, h: number, d: number, pos: number[], color: string, bone: any) {
    const g = new THREE.BoxGeometry(w * U, h * U, d * U);
    return b.part(g, color, { at: P(pos[0], pos[1], pos[2]), bone });
  }
  function rod(a: number[], c: number[], r0: number, r1: number, color: string, bone: any, seg = 6) {
    const A = new THREE.Vector3(...a), C = new THREE.Vector3(...c);
    const d = C.clone().sub(A);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r1 * U, r0 * U, len * U, seg, 1);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
    const m = A.clone().add(C).multiplyScalar(0.5);
    return b.part(g, color, { at: P(m.x, m.y, m.z), bone });
  }

  // ---- carapace
  ell(2.4, 1.1, 2.9, [0, 3.1, 3.6], SHELL_L, head, 8);
  ell(1.7, 0.8, 1.6, [0, 3.7, 3.2], SHELL, head, 6);
  // ridge
  box(0.3, 0.4, 3.4, [0, 4.3, 3.4], DARK, head);
  // central eyes
  ell(0.35, 0.3, 0.35, [0.5, 4.5, 4.2], EYE, head, 5);
  ell(0.35, 0.3, 0.35, [-0.5, 4.5, 4.2], EYE, head, 5);
  // side eyes
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) ell(0.22, 0.2, 0.22, [s * 1.7, 3.6, 5.2 - i * 0.5], EYE, head, 4);
  }
  // chelicerae (mouth parts)
  for (const s of [1, -1]) {
    box(0.8, 0.7, 1.2, [s * 0.6, 2.4, 6.8], AMBER, head);
  }

  // ---- abdomen (mesosoma, 7 plates)
  for (let i = 0; i < 7; i++) {
    const z = 0.6 - i * 1.15;
    const w = 2.4 - i * 0.12;
    ell(w, 1.2 - i * 0.04, 0.85, [0, 2.6, z], i % 2 ? SHELL : SHELL_L, abdomen, 8);
    box(0.25, 0.3, 0.7, [0, 3.8 - i * 0.04, z], DARK, abdomen);
  }
  // underbelly
  ell(1.9, 0.8, 4.6, [0, 1.6, -1.5], AMBER, abdomen, 7);

  // ---- tail (metasoma)
  const tp: number[][] = [
    [0, 2.5, -6.5], [0, 3.6, -8.8], [0, 5.8, -10.2], [0, 8.3, -10.2],
    [0, 10.4, -8.9], [0, 11.6, -6.8], [0, 11.8, -4.6],
  ];
  let prev: any = abdomen;
  const tj: any[] = [];
  for (let i = 0; i < 6; i++) {
    const j = b.joint("tail" + (i + 1), { at: P(tp[i][0], tp[i][1], tp[i][2]), parent: prev });
    tj.push(j);
    prev = j;
  }
  const stingerJ = b.joint("stinger", { at: P(tp[6][0], tp[6][1], tp[6][2]), parent: prev });
  for (let i = 0; i < 6; i++) {
    const r = 1.15 - i * 0.07;
    rod(tp[i], tp[i + 1], r, r - 0.07, i % 2 ? SHELL : SHELL_L, tj[i], 6);
    // joint knuckle
    ell(r + 0.12, r + 0.12, r + 0.12, tp[i], SHELL, tj[i], 6);
    // dorsal keel spikes
    const mid = [(tp[i][0] + tp[i + 1][0]) / 2, (tp[i][1] + tp[i + 1][1]) / 2, (tp[i][2] + tp[i + 1][2]) / 2];
    const out = new THREE.Vector3(0, tp[i + 1][1] - tp[i][1], tp[i + 1][2] - tp[i][2]);
    // outward normal (away from curl centre ~ (y8, z-6))
    const n = new THREE.Vector3(0, mid[1] - 6.5, mid[2] + 6.2).normalize();
    void out;
    const base = [mid[0], mid[1] + n.y * r, mid[2] + n.z * r];
    const tip = [base[0], base[1] + n.y * 0.6, base[2] + n.z * 0.6];
    rod(base, tip, 0.3, 0.05, DARK, tj[i], 4);
  }
  // stinger bulb + barb
  ell(1.15, 1.15, 1.25, [0, 11.8, -4.2], AMBER, stingerJ, 7);
  rod([0, 11.7, -3.5], [0, 10.9, -2.2], 0.6, 0.05, DARK, stingerJ, 5);
  rod([0, 10.9, -2.2], [0, 10.1, -1.9], 0.15, 0.04, DARK, stingerJ, 4);

  // ---- pedipalps & legs per side
  for (const s of [1, -1]) {
    const S = s === 1 ? "L" : "R";
    const sh = b.joint("shoulder" + S, { at: P(s * 1.8, 2.5, 6.2), parent: head });
    const el = b.joint("elbow" + S, { at: P(s * 4.3, 2.5, 9), parent: sh });
    const wr = b.joint("wrist" + S, { at: P(s * 3.5, 2.5, 11.6), parent: el });
    const fing = b.joint("pincerFinger" + S, { at: P(s * 3.6, 2.5, 14.4), parent: wr });

    rod([s * 1.8, 2.5, 6.2], [s * 4.3, 2.5, 9], 0.8, 0.75, SHELL_L, sh, 6);
    ell(0.95, 0.95, 0.95, [s * 4.3, 2.5, 9], SHELL, sh, 6);
    rod([s * 4.3, 2.5, 9], [s * 3.5, 2.5, 11.6], 0.75, 0.8, SHELL_L, el, 6);
    // palm
    ell(1.6, 1.1, 2.1, [s * 2.9, 2.5, 13.2], CLAW, wr, 8);
    box(0.3, 0.3, 2.4, [s * 2.9, 3.5, 13.2], DARK, wr);
    // fixed finger (inner), movable finger (outer)
    rod([s * 2.2, 2.4, 14.5], [s * 0.9, 2.4, 17.6], 0.75, 0.12, CLAW, wr, 5);
    rod([s * 3.7, 2.5, 14.4], [s * 1.8, 2.5, 17.3], 0.65, 0.1, AMBER, fing, 5);

    // legs
    const zs = [4.4, 2.6, 0.6, -1.4];
    const fx = [5.6, 6.4, 6.4, 5.8];
    const fz = [7.0, 4.6, 0.2, -3.8];
    for (let i = 0; i < 4; i++) {
      const hip = b.joint("hip" + (i + 1) + S, { at: P(s * 1.7, 2.1, zs[i]), parent: root });
      const kp = [s * (3.9 + i * 0.1), 4.2, zs[i] + (i < 2 ? 1.6 : -0.4 - i * 0.2)];
      const knee = b.joint("knee" + (i + 1) + S, { at: P(kp[0], kp[1], kp[2]), parent: hip });
      const ft = [s * fx[i], 0.25, fz[i]];
      const ank = b.joint("foot" + (i + 1) + S, { at: P(ft[0], ft[1], ft[2]), parent: knee });
      void ank;
      rod([s * 1.7, 2.1, zs[i]], kp, 0.6, 0.5, SHELL, hip, 5);
      ell(0.6, 0.6, 0.6, kp, SHELL_L, knee, 5);
      rod(kp, [ft[0], 0.8, ft[2]], 0.5, 0.35, SHELL_L, knee, 5);
      rod([ft[0], 0.8, ft[2]], ft, 0.35, 0.22, DARK, knee, 4);
    }
  }

  return b.root;
}
