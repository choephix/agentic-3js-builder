```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Clockwork Terrier",
  description:
    "Wind-up brass and copper terrier with riveted plates, chest gears, a winding key, spring legs, leather ears, green glass eyes, a coil-spring tail and a red collar with a brass tag.",
};

export default function build() {
  const b = createBuilder({ name: "clockwork_terrier" });

  const BRASS = "#d1a13a", COPPER = "#b8602f", DARK = "#5a3f16", STEEL = "#8d9399",
    RED = "#b3202a", LEATHER = "#6b3f22", GLASS = "#4fd08a", BLACK = "#1f1a17", SHINE = "#f0cf72";

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.32, -0.12] });
  const chest = b.joint("chest", { at: [0, 0.33, 0.12], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.4, 0.24], parent: chest });
  const head = b.joint("head", { at: [0, 0.47, 0.3], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.42, 0.37], parent: head });
  const earL = b.joint("earL", { at: [0.06, 0.55, 0.28], parent: head });
  const earR = b.joint("earR", { at: [-0.06, 0.55, 0.28], parent: head });
  const key = b.joint("key", { at: [0, 0.43, 0.0], parent: chest });
  const tail1 = b.joint("tail1", { at: [0, 0.38, -0.31], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.47, -0.37], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 0.56, -0.43], parent: tail2 });
  const tails = [tail1, tail2, tail3];

  const legs: Record<string, any> = {};
  for (const [sn, s] of [["L", 1], ["R", -1]] as [string, number][]) {
    const sh = b.joint("shoulder" + sn, { at: [s * 0.1, 0.3, 0.17], parent: chest });
    const el = b.joint("elbow" + sn, { at: [s * 0.1, 0.17, 0.2], parent: sh });
    const wr = b.joint("wrist" + sn, { at: [s * 0.1, 0.07, 0.18], parent: el });
    const hp = b.joint("hip" + sn, { at: [s * 0.1, 0.3, -0.17], parent: hips });
    const kn = b.joint("knee" + sn, { at: [s * 0.1, 0.18, -0.11], parent: hp });
    const an = b.joint("ankle" + sn, { at: [s * 0.1, 0.07, -0.2], parent: kn });
    legs[sn] = { sh, el, wr, hp, kn, an };
  }

  // ---- helpers ----
  const P = (geo: THREE.BufferGeometry, color: string, at: number[], bone: any) =>
    b.part(geo, color, { at: at as any, bone });
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const seg = (a: number[], c: number[], r: number, color: string, bone: any, sides = 8) => {
    const va = new THREE.Vector3(...a), vc = new THREE.Vector3(...c);
    const len = va.distanceTo(vc);
    const g = new THREE.CylinderGeometry(r, r, len, sides);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vc.clone().sub(va).normalize());
    g.applyQuaternion(q);
    const m = va.clone().add(vc).multiplyScalar(0.5);
    P(g, color, [m.x, m.y, m.z], bone);
  };
  const rivet = (at: number[], bone: any, r = 0.007) => P(new THREE.SphereGeometry(r, 5, 4), SHINE, at, bone);
  const gear = (x: number, cy: number, cz: number, R: number, teeth: number, color: string, bone: any) => {
    const dir = x > 0 ? 1 : -1;
    P(new THREE.CylinderGeometry(R, R, 0.016, teeth * 2).rotateZ(Math.PI / 2), color, [x, cy, cz], bone);
    P(new THREE.CylinderGeometry(R * 0.28, R * 0.28, 0.026, 6).rotateZ(Math.PI / 2), STEEL, [x + dir * 0.004, cy, cz], bone);
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const g = box(0.016, R * 0.32, R * 0.3).rotateX(-a);
      P(g, color, [x, cy + Math.cos(a) * (R + R * 0.1), cz + Math.sin(a) * (R + R * 0.1)], bone);
    }
  };

  // ---- torso ----
  P(box(0.2, 0.2, 0.4), BRASS, [0, 0.32, 0.0], chest);
  P(box(0.21, 0.04, 0.3), COPPER, [0, 0.43, 0.0], chest); // back plate
  P(box(0.17, 0.05, 0.2), COPPER, [0, 0.23, -0.02], hips); // belly plate
  P(box(0.22, 0.03, 0.06), COPPER, [0, 0.4, 0.17], chest); // shoulder band
  P(box(0.22, 0.03, 0.06), COPPER, [0, 0.4, -0.17], hips); // rump band
  for (const z of [-0.12, 0, 0.12]) for (const x of [-0.09, 0.09]) rivet([x, 0.452, z], chest);
  for (const s of [1, -1]) for (const z of [0.17, -0.17]) for (const y of [0.37, 0.43])
    rivet([s * 0.112, y, z], z > 0 ? chest : hips, 0.008);
  // chest gear windows
  for (const s of [1, -1]) {
    P(box(0.012, 0.15, 0.2), DARK, [s * 0.103, 0.31, 0.02], chest);
    gear(s * 0.115, 0.34, 0.06, 0.04, 8, COPPER, chest);
    gear(s * 0.115, 0.28, 0.0, 0.028, 7, BRASS, chest);
    gear(s * 0.115, 0.3, -0.07, 0.036, 8, STEEL, chest);
    P(box(0.012, 0.015, 0.2), COPPER, [s * 0.108, 0.38, 0.02], chest);
    P(box(0.012, 0.015, 0.2), COPPER, [s * 0.108, 0.235, 0.02], chest);
  }
  // front chest gear
  P(new THREE.CylinderGeometry(0.045, 0.045, 0.014, 14).rotateX(Math.PI / 2), COPPER, [0, 0.31, 0.206], chest);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    P(box(0.025, 0.025, 0.014).rotateZ(a), COPPER, [Math.cos(a) * 0.05, 0.31 + Math.sin(a) * 0.05, 0.206], chest);
  }
  P(new THREE.SphereGeometry(0.014, 6, 5), SHINE, [0, 0.31, 0.215], chest);

  // ---- winding key ----
  P(new THREE.CylinderGeometry(0.014, 0.014, 0.1, 8), STEEL, [0, 0.5, 0.0], key);
  P(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 8), BRASS, [0, 0.455, 0.0], key);
  for (const s of [1, -1]) {
    P(new THREE.SphereGeometry(0.045, 8, 6).scale(1, 1, 0.35), BRASS, [s * 0.05, 0.56, 0], key);
    P(new THREE.SphereGeometry(0.02, 6, 5).scale(1, 1, 0.4), DARK, [s * 0.05, 0.56, 0.012], key);
  }
  P(box(0.1, 0.03, 0.02), BRASS, [0, 0.55, 0], key);
  P(new THREE.SphereGeometry(0.02, 6, 5), SHINE, [0, 0.555, 0], key);

  // ---- neck, collar, tag ----
  P(new THREE.CylinderGeometry(0.06, 0.07, 0.12, 8), COPPER, [0, 0.42, 0.24], neck);
  P(new THREE.TorusGeometry(0.075, 0.016, 5, 12).rotateX(Math.PI / 2 - 0.15), RED, [0, 0.4, 0.245], neck);
  P(new THREE.TorusGeometry(0.012, 0.004, 4, 8), STEEL, [0, 0.368, 0.3], neck);
  P(new THREE.CylinderGeometry(0.028, 0.028, 0.006, 12).rotateX(Math.PI / 2), BRASS, [0, 0.34, 0.305], neck);
  P(new THREE.SphereGeometry(0.008, 5, 4), SHINE, [0, 0.34, 0.31], neck);

  // ---- head ----
  P(box(0.15, 0.14, 0.15), BRASS, [0, 0.49, 0.3], head);
  P(box(0.155, 0.03, 0.1), COPPER, [0, 0.572, 0.28], head);
  P(box(0.1, 0.075, 0.13), COPPER, [0, 0.45, 0.415], head); // snout upper
  P(box(0.09, 0.03, 0.12), BRASS, [0, 0.4, 0.4], jaw); // lower jaw
  P(box(0.06, 0.04, 0.05), BRASS, [0, 0.375, 0.41], jaw); // beard block
  P(box(0.04, 0.03, 0.02), STEEL, [0, 0.355, 0.42], jaw);
  P(box(0.075, 0.015, 0.11), BLACK, [0, 0.425, 0.4], jaw);
  P(box(0.05, 0.04, 0.03), BLACK, [0, 0.47, 0.485], head); // nose
  P(new THREE.SphereGeometry(0.016, 6, 5), BLACK, [0, 0.485, 0.5], head);
  for (const s of [1, -1]) {
    P(new THREE.TorusGeometry(0.036, 0.009, 5, 10), SHINE, [s * 0.05, 0.52, 0.375], head);
    P(new THREE.SphereGeometry(0.032, 8, 6), GLASS, [s * 0.05, 0.52, 0.372], head);
    P(new THREE.SphereGeometry(0.012, 5, 4), BLACK, [s * 0.05, 0.52, 0.398], head);
    P(new THREE.SphereGeometry(0.006, 4, 4), "#ffffff", [s * 0.058, 0.53, 0.402], head);
    rivet([s * 0.078, 0.55, 0.32], head);
    rivet([s * 0.078, 0.45, 0.32], head);
    // whisker rods
    seg([s * 0.04, 0.43, 0.47], [s * 0.1, 0.42, 0.5], 0.003, STEEL, head, 4);
  }
  // brow ridge
  P(box(0.14, 0.015, 0.03), DARK, [0, 0.565, 0.375], head);

  // ---- leather ears ----
  for (const [j, s] of [[earL, 1], [earR, -1]] as [any, number][]) {
    P(box(0.025, 0.1, 0.07).rotateZ(-s * 0.35).rotateX(0.15), LEATHER, [s * 0.09, 0.52, 0.27], j);
    P(box(0.022, 0.06, 0.06).rotateZ(-s * 0.55).rotateX(0.25), LEATHER, [s * 0.125, 0.45, 0.285], j);
    P(box(0.03, 0.025, 0.075).rotateZ(-s * 0.3), BRASS, [s * 0.08, 0.57, 0.265], j);
    rivet([s * 0.095, 0.565, 0.3], j, 0.006);
  }

  // ---- legs ----
  for (const sn of ["L", "R"]) {
    const s = sn === "L" ? 1 : -1;
    const lg = legs[sn];
    const x = s * 0.1;
    // front
    P(new THREE.SphereGeometry(0.045, 7, 6), COPPER, [x, 0.3, 0.17], lg.sh);
    seg([x, 0.3, 0.17], [x, 0.17, 0.2], 0.026, BRASS, lg.sh);
    P(new THREE.SphereGeometry(0.03, 6, 5), COPPER, [x, 0.17, 0.2], lg.el);
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      P(new THREE.TorusGeometry(0.02, 0.006, 4, 8).rotateX(Math.PI / 2), STEEL, [x, 0.17 - 0.1 * t, 0.2 - 0.02 * t], lg.el);
    }
    seg([x, 0.17, 0.2], [x, 0.07, 0.18], 0.007, STEEL, lg.el, 4);
    P(box(0.07, 0.04, 0.11), BRASS, [x, 0.02, 0.21], lg.wr);
    P(box(0.072, 0.012, 0.03), COPPER, [x, 0.012, 0.255], lg.wr);
    rivet([x + s * 0.034, 0.03, 0.18], lg.wr, 0.006);
    // rear
    P(new THREE.SphereGeometry(0.06, 7, 6), COPPER, [x, 0.29, -0.17], lg.hp);
    seg([x, 0.29, -0.17], [x, 0.18, -0.11], 0.03, BRASS, lg.hp);
    P(new THREE.SphereGeometry(0.03, 6, 5), COPPER, [x, 0.18, -0.11], lg.kn);
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      P(new THREE.TorusGeometry(0.02, 0.006, 4, 8).rotateX(Math.PI / 2 + 0.6), STEEL, [x, 0.17 - 0.09 * t, -0.115 - 0.085 * t], lg.kn);
    }
    seg([x, 0.18, -0.11], [x, 0.07, -0.2], 0.007, STEEL, lg.kn, 4);
    P(box(0.07, 0.04, 0.12), BRASS, [x, 0.02, -0.15], lg.an);
    P(box(0.072, 0.012, 0.03), COPPER, [x, 0.012, -0.1], lg.an);
    rivet([x + s * 0.034, 0.03, -0.17], lg.an, 0.006);
  }

  // ---- coiled spring tail ----
  const dir = new THREE.Vector3(0, 0.75, -0.55).normalize();
  const base = new THREE.Vector3(0, 0.37, -0.3);
  const N = 14;
  for (let i = 0; i < N; i++) {
    const p = base.clone().addScaledVector(dir, i * 0.019);
    const g = new THREE.TorusGeometry(0.03 - i * 0.0006, 0.007, 4, 9).rotateX(Math.PI / 2);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir));
    g.rotateY(0);
    P(g, i % 2 ? COPPER : BRASS, [p.x, p.y, p.z], tails[Math.min(2, Math.floor((i / N) * 3))]);
  }
  const tip = base.clone().addScaledVector(dir, N * 0.019 + 0.01);
  P(new THREE.SphereGeometry(0.022, 7, 6), SHINE, [tip.x, tip.y, tip.z], tail3);
  seg([base.x, base.y, base.z], [tip.x, tip.y, tip.z], 0.005, STEEL, tail2, 4);

  return b.root;
}
```