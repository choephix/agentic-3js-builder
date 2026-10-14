```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Phoenix",
  description: "Stylized fire bird in a rest pose with outstretched wings, a fanned tail and a jawed beak.",
};

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // palette
  const RED = "#c81e0e", ORANGE = "#ff6a00", AMBER = "#ff9d0a", GOLD = "#ffd23f",
    PALE = "#fff0a0", DARK = "#7a0e0e", BEAK = "#f5b52a", LEG = "#d98a1a", BLACK = "#16100e", WHITE = "#fffaf0";

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.82, -0.05] });
  const spine = b.joint("spine", { at: [0, 0.9, 0.2], parent: hips, role: "spine" });
  const neck1 = b.joint("neck1", { at: [0, 1.02, 0.36], parent: spine, role: "neck" });
  const neck2 = b.joint("neck2", { at: [0, 1.2, 0.46], parent: neck1, role: "neck" });
  const head = b.joint("head", { at: [0, 1.38, 0.54], parent: neck2, role: "head" });
  const jaw = b.joint("jaw", { at: [0, 1.4, 0.62], parent: head, role: "jaw" });
  const tail1 = b.joint("tail1", { at: [0, 0.85, -0.4], parent: hips, role: "tail" });
  const tail2 = b.joint("tail2", { at: [0, 0.8, -0.8], parent: tail1, role: "tail" });
  const tail3 = b.joint("tail3", { at: [0, 0.74, -1.15], parent: tail2, role: "tail" });

  const ellipsoid = (c: THREE.Vector3, r: [number, number, number], color: string, bone: any) => {
    const g = new THREE.SphereGeometry(1, 8, 6);
    g.scale(r[0], r[1], r[2]);
    return b.part(g, color, { at: c, bone });
  };

  // segment cylinder from a to c (orientation baked into geometry)
  const seg = (a: THREE.Vector3, c: THREE.Vector3, r: number, color: string, bone: any, taper = 0.75) => {
    const d = c.clone().sub(a);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r * taper, r, len, 6);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize()));
    return b.part(g, color, { at: a.clone().add(c).multiplyScalar(0.5), bone });
  };

  // flat feather: diamond-ish cone, base at `base`, tip along dir
  const feather = (base: THREE.Vector3, dir: THREE.Vector3, len: number, wid: number, color: string, bone: any, thinAxis: "x" | "z") => {
    const g = new THREE.ConeGeometry(0.5, 1, 4);
    g.translate(0, 0.5, 0);
    const thin = wid * 0.12;
    if (thinAxis === "x") g.scale(thin, len, wid);
    else g.scale(wid, len, thin);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir.clone().normalize()));
    return b.part(g, color, { at: base, bone });
  };
  // two-tone feather: dark base layer + bright inner layer
  const plume = (base: THREE.Vector3, dir: THREE.Vector3, len: number, wid: number, c1: string, c2: string, bone: any, axis: "x" | "z") => {
    feather(base, dir, len, wid, c1, bone, axis);
    feather(base.clone().add(dir.clone().normalize().multiplyScalar(len * 0.12)), dir, len * 0.8, wid * 0.55, c2, bone, axis);
  };

  // body
  ellipsoid(V(0, 0.84, -0.05), [0.27, 0.28, 0.5], ORANGE, hips);
  ellipsoid(V(0, 0.9, 0.22), [0.25, 0.27, 0.3], AMBER, spine);
  ellipsoid(V(0, 0.8, 0.3), [0.17, 0.2, 0.26], GOLD, spine); // belly/chest glow
  ellipsoid(V(0, 0.9, -0.38), [0.2, 0.2, 0.25], RED, tail1);
  // breast feather scallops
  for (let i = 0; i < 5; i++) {
    const y = 0.95 - i * 0.07;
    feather(V(0, y, 0.38 - i * 0.05), V(0, -0.5, 1), 0.2, 0.12, i % 2 ? PALE : GOLD, spine, "z");
  }

  // neck
  seg(V(0, 0.98, 0.3), V(0, 1.2, 0.46), 0.1, AMBER, neck1);
  seg(V(0, 1.2, 0.46), V(0, 1.38, 0.54), 0.085, ORANGE, neck2);
  for (let i = 0; i < 3; i++) {
    feather(V(0, 1.1 + i * 0.1, 0.4 + i * 0.05), V(0, -0.6, 0.8), 0.14, 0.1, i % 2 ? GOLD : PALE, neck1, "z");
  }

  // head
  ellipsoid(V(0, 1.43, 0.57), [0.12, 0.12, 0.14], ORANGE, head);
  ellipsoid(V(0, 1.4, 0.64), [0.08, 0.07, 0.09], GOLD, head);
  // beak
  const upper = new THREE.ConeGeometry(0.055, 0.2, 4);
  upper.rotateX(Math.PI / 2); upper.translate(0, 0, 0.1); upper.scale(1, 0.85, 1);
  b.part(upper, BEAK, { at: V(0, 1.42, 0.66), bone: head });
  const lower = new THREE.ConeGeometry(0.045, 0.15, 4);
  lower.rotateX(Math.PI / 2); lower.translate(0, 0, 0.075); lower.scale(1, 0.6, 1);
  b.part(lower, "#d9961c", { at: V(0, 1.385, 0.64), bone: jaw });
  // eyes
  for (const s of [1, -1]) {
    ellipsoid(V(0.095 * s, 1.46, 0.63), [0.035, 0.04, 0.04], WHITE, head);
    ellipsoid(V(0.12 * s, 1.46, 0.645), [0.018, 0.026, 0.026], BLACK, head);
    feather(V(0.1 * s, 1.5, 0.66), V(0.5 * s, 0.4, 0.5), 0.1, 0.05, DARK, head, "z"); // brow
  }
  // crest
  for (let i = 0; i < 5; i++) {
    const k = i - 2;
    plume(V(0.02 * k, 1.53, 0.52 - i * 0.0), V(0.25 * k, 0.55 - Math.abs(k) * 0.1, -1), 0.42 - Math.abs(k) * 0.06, 0.07, i % 2 ? RED : ORANGE, GOLD, head, "z");
  }

  // legs
  for (const s of [1, -1]) {
    const S = s === 1 ? "L" : "R";
    const hip = b.joint("hip" + S, { at: [0.12 * s, 0.7, 0.0], parent: hips, role: "leg" });
    const knee = b.joint("knee" + S, { at: [0.13 * s, 0.5, 0.1], parent: hip, role: "leg" });
    const ankle = b.joint("ankle" + S, { at: [0.13 * s, 0.27, -0.03], parent: knee, role: "leg" });
    const foot = b.joint("foot" + S, { at: [0.13 * s, 0.03, 0.04], parent: ankle, role: "leg" });
    ellipsoid(V(0.14 * s, 0.6, 0.05), [0.1, 0.16, 0.14], AMBER, hip); // thigh plumage
    feather(V(0.15 * s, 0.52, 0.0), V(0, -1, -0.3), 0.16, 0.09, RED, knee, "z");
    seg(V(0.13 * s, 0.5, 0.1), V(0.13 * s, 0.27, -0.03), 0.04, LEG, knee);
    seg(V(0.13 * s, 0.27, -0.03), V(0.13 * s, 0.04, 0.04), 0.03, LEG, ankle);
    ellipsoid(V(0.13 * s, 0.27, -0.03), [0.04, 0.04, 0.04], LEG, ankle);
    const toes: [number, number][] = [[0.0, 0.2], [0.09, 0.17], [-0.09, 0.17], [0, -0.13]];
    toes.forEach(([dx, dz], i) => {
      const a = V(0.13 * s, 0.02, 0.04);
      const e = V(0.13 * s + dx * s, 0.016, 0.04 + dz);
      seg(a, e, 0.016, LEG, foot);
      const cg = new THREE.ConeGeometry(0.014, 0.05, 4);
      const d = e.clone().sub(a).normalize();
      cg.translate(0, 0.025, 0);
      cg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d));
      b.part(cg, BLACK, { at: e, bone: foot });
    });
  }

  // wings
  for (const s of [1, -1]) {
    const S = s === 1 ? "L" : "R";
    const shoulder = b.joint("shoulder" + S, { at: [0.22 * s, 1.0, 0.12], parent: spine, role: "wing" });
    const elbow = b.joint("elbow" + S, { at: [0.7 * s, 1.08, -0.02], parent: shoulder, role: "wing" });
    const wrist = b.joint("wrist" + S, { at: [1.15 * s, 1.1, -0.15], parent: elbow, role: "wing" });
    const tip = b.joint("wingTip" + S, { at: [1.4 * s, 1.1, -0.2], parent: wrist, role: "wing" });
    seg(V(0.2 * s, 1.0, 0.12), V(0.7 * s, 1.08, -0.02), 0.075, ORANGE, shoulder);
    seg(V(0.7 * s, 1.08, -0.02), V(1.15 * s, 1.1, -0.15), 0.06, AMBER, elbow);
    ellipsoid(V(0.22 * s, 1.0, 0.12), [0.12, 0.12, 0.14], ORANGE, shoulder);

    // primaries: fan from the wrist
    const nP = 7;
    for (let i = 0; i < nP; i++) {
      const t = i / (nP - 1);
      const ang = -0.05 - t * 1.0; // sweep backward
      const dir = V(Math.cos(ang) * s, -0.03 * t, Math.sin(ang));
      const len = 0.95 - t * 0.35;
      plume(V(1.12 * s, 1.1, -0.15 - t * 0.03), dir, len, 0.14, i % 2 ? RED : DARK, i % 2 ? GOLD : AMBER, wrist, "x");
    }
    // secondaries along forearm and upperarm
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const x = (0.25 + t * 0.85) * s;
      const bone = t > 0.5 ? elbow : shoulder;
      const dir = V(0.15 * s * (1 - t) - 0.1 * s, -0.02, -1);
      plume(V(x, 1.08 - t * 0.0, -0.05 - t * 0.1), dir, 0.62 - Math.abs(t - 0.5) * 0.2, 0.15, i % 2 ? ORANGE : RED, GOLD, bone, "x");
    }
    // coverts
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const bone = t > 0.5 ? elbow : shoulder;
      feather(V((0.25 + t * 0.9) * s, 1.12, 0.02 - t * 0.08), V(0.1 * s, -0.05, -1), 0.3, 0.12, i % 2 ? AMBER : PALE, bone, "x");
    }
    // leading-edge flame tip
    feather(V(1.14 * s, 1.11, -0.14), V(1, 0.05, 0.1), 0.3, 0.07, GOLD, tip, "x");
  }

  // tail: fanned long plumes
  const nT = 9;
  for (let i = 0; i < nT; i++) {
    const k = (i - (nT - 1) / 2) / ((nT - 1) / 2); // -1..1
    const center = 1 - Math.abs(k);
    const dir = V(k * 0.4, -0.12 - center * 0.18, -1);
    const len = 0.9 + center * 0.8;
    const bone = i % 3 === 0 ? tail2 : tail1;
    plume(V(0.04 * k, 0.86, -0.45), dir, len, 0.15 + center * 0.04, i % 2 ? RED : ORANGE, i % 2 ? GOLD : AMBER, bone, "z");
    // glowing tip
    const tipPos = V(0.04 * k, 0.86, -0.45).add(dir.clone().normalize().multiplyScalar(len * 0.78));
    feather(tipPos, dir, len * 0.24, 0.07, PALE, tail3, "z");
  }
  // two streamers
  for (const s of [1, -1]) {
    plume(V(0.06 * s, 0.84, -0.42), V(0.12 * s, -0.3, -1), 1.75, 0.09, DARK, GOLD, tail3, "z");
  }

  return b.root;
}
```