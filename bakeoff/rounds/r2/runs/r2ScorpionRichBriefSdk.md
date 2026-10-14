```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Desert Scorpion",
  description:
    "Glossy amber scorpion in a threat pose: tail arched over the back, forward pincers, eight legs, banded joints and a dark bulbous stinger.",
};

export default function build() {
  const bd = createBuilder({ name: "scorpion" });
  const AMBER = "#d98a1c";
  const LIGHT = "#f0b84a";
  const DARK = "#5e3208";
  const BLACK = "#0d0a08";
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---- helpers (geometry baked in model space) ----
  const seg = (a: THREE.Vector3, c: THREE.Vector3, r0: number, r1: number, color: string, bone: any, sides = 6) => {
    const d = c.clone().sub(a);
    const g = new THREE.CylinderGeometry(r1, r0, d.length(), sides);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize()));
    const m = a.clone().add(c).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    return bd.part(g, color, { bone });
  };
  const blob = (p: THREE.Vector3, sx: number, sy: number, sz: number, color: string, bone: any, detail = 1) => {
    const g = new THREE.IcosahedronGeometry(1, detail);
    g.scale(sx, sy, sz);
    g.translate(p.x, p.y, p.z);
    return bd.part(g, color, { bone });
  };

  // ---- skeleton ----
  const body = bd.joint("body", { at: [0, 0.032, 0] });
  const abdomen = bd.joint("abdomen", { at: [0, 0.032, -0.01], parent: body });
  const jaw = bd.joint("jaw", { at: [0, 0.03, 0.066], parent: body });

  // body shell
  blob(V(0, 0.036, 0.032), 0.031, 0.014, 0.037, AMBER, body);
  blob(V(0, 0.03, 0.03), 0.034, 0.008, 0.04, DARK, body);
  blob(V(0, 0.047, 0.04), 0.011, 0.006, 0.012, DARK, body);
  blob(V(0, 0.045, 0.012), 0.02, 0.006, 0.012, LIGHT, body);
  // eyes: median pair + lateral clusters
  for (const s of [-1, 1]) {
    blob(V(s * 0.0065, 0.053, 0.042), 0.0042, 0.0042, 0.0042, BLACK, body, 0);
    for (let k = 0; k < 3; k++) {
      blob(V(s * (0.026 - k * 0.002), 0.04 + k * 0.001, 0.058 - k * 0.008), 0.0028, 0.0028, 0.0028, BLACK, body, 0);
    }
  }
  // chelicerae
  blob(V(0.007, 0.03, 0.068), 0.006, 0.005, 0.01, LIGHT, body);
  blob(V(-0.007, 0.03, 0.068), 0.006, 0.005, 0.01, LIGHT, body);
  blob(V(0, 0.026, 0.074), 0.01, 0.003, 0.007, DARK, jaw);

  // abdomen plates
  for (let i = 0; i < 7; i++) {
    const z = -0.008 - i * 0.0115;
    const w = 0.03 - i * 0.0016;
    blob(V(0, 0.034 - i * 0.0004, z), w, 0.0155, 0.0072, i % 2 ? AMBER : LIGHT, abdomen);
    blob(V(0, 0.033, z - 0.0055), w * 0.93, 0.014, 0.0022, DARK, abdomen);
  }
  blob(V(0, 0.027, -0.04), 0.026, 0.008, 0.045, DARK, abdomen);

  // ---- tail ----
  const tp = [
    V(0, 0.036, -0.088), V(0, 0.05, -0.115), V(0, 0.078, -0.13), V(0, 0.112, -0.127),
    V(0, 0.142, -0.108), V(0, 0.158, -0.078), V(0, 0.16, -0.048),
  ];
  let prev: any = abdomen;
  const tj: any[] = [];
  tp.forEach((p, i) => {
    const j = bd.joint("tail" + (i + 1), { at: [p.x, p.y, p.z], parent: prev });
    tj.push(j);
    prev = j;
  });
  for (let i = 0; i < tp.length - 1; i++) {
    const r0 = 0.0105 - i * 0.0007;
    const r1 = r0 - 0.0007;
    seg(tp[i], tp[i + 1], r0, r1, i % 2 ? AMBER : LIGHT, tj[i], 7);
    blob(tp[i], r0 * 1.12, r0 * 1.12, r0 * 1.12, DARK, tj[i], 1);
    // keel bumps on the top
    const mp = tp[i].clone().add(tp[i + 1]).multiplyScalar(0.5);
    blob(mp.clone().add(V(0, 0.003, 0.0)), 0.0035, 0.0035, 0.0035, DARK, tj[i], 0);
  }
  // stinger
  const bulbC = tp[6].clone().add(V(0, 0.002, 0.012));
  blob(bulbC, 0.0115, 0.0125, 0.0145, DARK, tj[6]);
  blob(bulbC.clone().add(V(0, 0.003, 0.002)), 0.006, 0.006, 0.008, "#2a160a", tj[6], 0);
  seg(bulbC.clone().add(V(0, 0, 0.01)), V(0, 0.135, 0.002), 0.0065, 0.0004, BLACK, tj[6], 6);

  // ---- legs ----
  const dz = [0.032, 0.012, -0.01, -0.032];
  const lz = [0.04, 0.02, 0.0, -0.02];
  for (const [sn, s] of [["L", 1], ["R", -1]] as [string, number][]) {
    for (let i = 0; i < 4; i++) {
      const z = lz[i];
      const hip = V(s * 0.024, 0.032, z);
      const knee = V(s * 0.062, 0.058, z + dz[i] * 0.5);
      const ank = V(s * 0.09, 0.024, z + dz[i] * 0.9);
      const foot = V(s * 0.1, -0.0008, z + dz[i] * 1.05);
      const hj = bd.joint("hip" + sn + (i + 1), { at: [hip.x, hip.y, hip.z], parent: body });
      const kj = bd.joint("knee" + sn + (i + 1), { at: [knee.x, knee.y, knee.z], parent: hj });
      const aj = bd.joint("ankle" + sn + (i + 1), { at: [ank.x, ank.y, ank.z], parent: kj });
      blob(hip, 0.008, 0.007, 0.008, DARK, hj, 0);
      seg(hip, knee, 0.0048, 0.0038, AMBER, hj, 5);
      blob(knee, 0.0055, 0.0055, 0.0055, DARK, kj, 0);
      seg(knee, ank, 0.0038, 0.0028, LIGHT, kj, 5);
      blob(ank, 0.0038, 0.0038, 0.0038, DARK, aj, 0);
      seg(ank, foot, 0.0028, 0.0012, AMBER, aj, 5);
    }

    // ---- pincer arm ----
    const sh = V(s * 0.026, 0.032, 0.062);
    const el = V(s * 0.05, 0.032, 0.095);
    const wr = V(s * 0.04, 0.032, 0.125);
    const hand = V(s * 0.033, 0.032, 0.148);
    const shJ = bd.joint("shoulder" + sn, { at: [sh.x, sh.y, sh.z], parent: body });
    const elJ = bd.joint("elbow" + sn, { at: [el.x, el.y, el.z], parent: shJ });
    const wrJ = bd.joint("wrist" + sn, { at: [wr.x, wr.y, wr.z], parent: elJ });
    const clawJaw = bd.joint("clawJaw" + sn, { at: [s * 0.03, 0.032, 0.158], parent: wrJ });
    blob(sh, 0.0075, 0.0075, 0.0075, DARK, shJ, 0);
    seg(sh, el, 0.0072, 0.0062, AMBER, shJ, 6);
    blob(el, 0.0085, 0.0085, 0.0085, DARK, elJ, 1);
    seg(el, wr, 0.0066, 0.0075, LIGHT, elJ, 6);
    blob(wr, 0.0078, 0.0078, 0.0078, DARK, wrJ, 0);
    // palm
    blob(hand, 0.0125, 0.0105, 0.017, AMBER, wrJ);
    blob(hand.clone().add(V(0, 0.007, -0.002)), 0.007, 0.004, 0.011, LIGHT, wrJ, 0);
    // fixed finger (curves inward)
    const f0 = V(s * 0.036, 0.032, 0.16);
    const f1 = V(s * 0.026, 0.032, 0.185);
    const f2 = V(s * 0.0155, 0.032, 0.2);
    seg(f0, f1, 0.0072, 0.0046, AMBER, wrJ, 5);
    seg(f1, f2, 0.0046, 0.0009, DARK, wrJ, 5);
    // movable finger
    const m0 = V(s * 0.025, 0.032, 0.16);
    const m1 = V(s * 0.0185, 0.032, 0.182);
    const m2 = V(s * 0.0125, 0.032, 0.198);
    seg(m0, m1, 0.0055, 0.0036, LIGHT, clawJaw, 5);
    seg(m1, m2, 0.0036, 0.0007, DARK, clawJaw, 5);
    blob(V(s * 0.03, 0.032, 0.158), 0.004, 0.004, 0.004, DARK, clawJaw, 0);
  }

  return bd.root;
}
```