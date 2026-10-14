```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Clockwork Dog",
  description:
    "A brass wind-up dog with a back key, gear discs, a coiled spring tail, riveted plates and a jointed jaw.",
};

export default function build() {
  const b = createBuilder({ name: "clockwork_dog" });

  const BRASS = "#c8923a", DARK = "#8a5e22", COPPER = "#b5562b";
  const STEEL = "#8e99a3", BLACK = "#2a2320", RED = "#b3302a", CREAM = "#f2e6c4";

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.4, -0.15] });
  const spine = b.joint("spine", { at: [0, 0.42, 0.1], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.48, 0.22], parent: spine });
  const head = b.joint("head", { at: [0, 0.6, 0.32], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.55, 0.42], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 0.45, -0.3], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.54, -0.37], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 0.63, -0.43], parent: tail2 });
  const earL = b.joint("earL", { at: [0.08, 0.69, 0.32], parent: head });
  const earR = b.joint("earR", { at: [-0.08, 0.69, 0.32], parent: head });

  const legs: Record<string, any> = {};
  for (const [side, s] of [["L", 1], ["R", -1]] as const) {
    for (const [end, z, par] of [["F", 0.18, spine], ["B", -0.2, hips]] as const) {
      const hip = b.joint(`hip${end}${side}`, { at: [0.1 * s, 0.34, z], parent: par });
      const knee = b.joint(`knee${end}${side}`, { at: [0.1 * s, 0.2, z + (end === "F" ? 0.01 : -0.02)], parent: hip });
      const ankle = b.joint(`ankle${end}${side}`, { at: [0.1 * s, 0.08, z], parent: knee });
      legs[end + side] = { hip, knee, ankle, s, z, end };
    }
  }

  // ---------- helpers ----------
  const add = (g: THREE.BufferGeometry, color: string, at: number[], bone: any) =>
    b.part(g, color, { at: at as any, bone });

  const box = (w: number, h: number, d: number, at: number[], color: string, bone: any, rot?: [number, number, number]) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (rot) { g.rotateX(rot[0]); g.rotateY(rot[1]); g.rotateZ(rot[2]); }
    return add(g, color, at, bone);
  };
  const ball = (r: number, at: number[], color: string, bone: any, seg = 8) =>
    add(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), color, at, bone);

  const seg = (a: number[], c: number[], r: number, color: string, bone: any, sides = 8) => {
    const va = new THREE.Vector3(...a), vc = new THREE.Vector3(...c);
    const d = vc.clone().sub(va);
    const g = new THREE.CylinderGeometry(r, r, d.length(), sides);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()));
    const m = va.clone().add(vc).multiplyScalar(0.5);
    return add(g, color, [m.x, m.y, m.z], bone);
  };

  const gear = (r: number, teeth: number, thick: number, color: string, at: number[], bone: any, sx: number) => {
    // axis along X
    add(new THREE.CylinderGeometry(r * 0.85, r * 0.85, thick, 14).rotateZ(Math.PI / 2), color, at, bone);
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const g = new THREE.BoxGeometry(thick, r * 0.28, r * 0.26);
      g.rotateX(a);
      add(g, color, [at[0], at[1] + Math.cos(a) * r * 0.92, at[2] + Math.sin(a) * r * 0.92], bone);
    }
    // hub bolt
    add(new THREE.CylinderGeometry(r * 0.25, r * 0.25, thick * 1.8, 6).rotateZ(Math.PI / 2), DARK, at, bone);
    // spokes
    for (let i = 0; i < 3; i++) {
      const g = new THREE.BoxGeometry(thick * 1.3, r * 1.4, r * 0.12);
      g.rotateX((i / 3) * Math.PI);
      add(g, STEEL, [at[0] + sx * thick * 0.1, at[1], at[2]], bone);
    }
  };

  // ---------- torso ----------
  box(0.25, 0.25, 0.3, [0, 0.43, 0.08], BRASS, spine);          // chest
  box(0.22, 0.22, 0.28, [0, 0.41, -0.16], BRASS, hips);         // rump
  box(0.2, 0.05, 0.5, [0, 0.29, -0.03], DARK, hips);            // belly plate
  box(0.27, 0.04, 0.12, [0, 0.31, 0.12], COPPER, spine);        // chest band
  box(0.24, 0.04, 0.12, [0, 0.29, -0.2], COPPER, hips);
  box(0.12, 0.03, 0.4, [0, 0.56, -0.02], COPPER, hips);         // spine plate
  // rivets
  for (let i = 0; i < 6; i++) {
    const z = -0.2 + i * 0.09;
    for (const s of [1, -1]) {
      ball(0.012, [0.126 * s, 0.53, z], STEEL, z > -0.03 ? spine : hips, 5);
      ball(0.012, [0.126 * s, 0.33, z], STEEL, z > -0.03 ? spine : hips, 5);
    }
    ball(0.012, [0.04, 0.58, z], STEEL, z > -0.03 ? spine : hips, 5);
    ball(0.012, [-0.04, 0.58, z], STEEL, z > -0.03 ? spine : hips, 5);
  }
  // side gears
  gear(0.075, 10, 0.025, STEEL, [0.14, 0.43, 0.06], spine, 1);
  gear(0.075, 10, 0.025, STEEL, [-0.14, 0.43, 0.06], spine, -1);
  gear(0.05, 8, 0.025, COPPER, [0.125, 0.4, -0.1], hips, 1);
  gear(0.05, 8, 0.025, COPPER, [-0.125, 0.4, -0.1], hips, -1);

  // wind-up key
  seg([0, 0.56, -0.02], [0, 0.66, -0.02], 0.012, STEEL, hips, 6);
  for (const s of [1, -1]) {
    seg([0, 0.67, -0.02], [0.07 * s, 0.7, -0.02], 0.008, STEEL, hips, 6);
    box(0.002 + 0.001, 0.08, 0.05, [0.075 * s, 0.715, -0.02], RED, hips);
    ball(0.02, [0.075 * s, 0.675, -0.02], RED, hips, 6);
  }
  ball(0.02, [0, 0.67, -0.02], STEEL, hips, 6);

  // ---------- neck & collar ----------
  seg([0, 0.45, 0.17], [0, 0.6, 0.32], 0.07, DARK, neck);
  add(new THREE.TorusGeometry(0.075, 0.016, 5, 10).rotateX(Math.PI / 2 - 0.5).rotateY(0), RED, [0, 0.5, 0.23], neck);
  ball(0.026, [0, 0.46, 0.3], BRASS, neck, 8);
  gear(0.03, 6, 0.01, BRASS, [0, 0.455, 0.31], neck, 1);

  // ---------- head ----------
  box(0.17, 0.15, 0.16, [0, 0.63, 0.36], BRASS, head);
  box(0.11, 0.07, 0.14, [0, 0.59, 0.47], BRASS, head);           // upper snout
  box(0.115, 0.012, 0.15, [0, 0.553, 0.47], DARK, head);         // lip
  box(0.12, 0.02, 0.1, [0, 0.69, 0.4], COPPER, head);            // brow plate
  box(0.085, 0.032, 0.12, [0, 0.532, 0.46], BRASS, jaw);         // lower jaw
  box(0.07, 0.01, 0.07, [0, 0.55, 0.47], RED, jaw);              // tongue
  box(0.045, 0.045, 0.04, [0, 0.605, 0.55], BLACK, head);        // nose
  for (const s of [1, -1]) {
    // eyes: white disc with pupil and cog rim
    add(new THREE.CylinderGeometry(0.032, 0.032, 0.02, 10).rotateX(Math.PI / 2), STEEL, [0.07 * s, 0.65, 0.44], head);
    add(new THREE.CylinderGeometry(0.024, 0.024, 0.024, 10).rotateX(Math.PI / 2), CREAM, [0.07 * s, 0.65, 0.445], head);
    ball(0.012, [0.07 * s, 0.65, 0.458], BLACK, head, 6);
    // teeth
    for (let i = 0; i < 3; i++) {
      box(0.012, 0.016, 0.012, [(0.032 * s) , 0.55, 0.43 + i * 0.04], CREAM, head);
    }
    // ears (flat boxes, flopped)
    box(0.025, 0.11, 0.08, [0.1 * s, 0.68, 0.32], COPPER, s > 0 ? earL : earR, [0, 0, -0.5 * s]);
    ball(0.014, [0.112 * s, 0.7, 0.32], STEEL, s > 0 ? earL : earR, 5);
  }
  // head screw / antenna spring
  seg([0, 0.705, 0.34], [0, 0.76, 0.34], 0.006, STEEL, head, 5);
  ball(0.016, [0, 0.77, 0.34], RED, head, 6);

  // ---------- tail spring ----------
  const tailBones = [tail1, tail1, tail2, tail2, tail3, tail3];
  const ta = new THREE.Vector3(0, 0.45, -0.3), tb = new THREE.Vector3(0, 0.7, -0.46);
  const td = tb.clone().sub(ta);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), td.clone().normalize());
  for (let i = 0; i < 6; i++) {
    const p = ta.clone().lerp(tb, i / 5);
    const g = new THREE.TorusGeometry(0.035 - i * 0.002, 0.009, 5, 9);
    g.applyQuaternion(q);
    add(g, STEEL, [p.x, p.y, p.z], tailBones[i]);
  }
  seg([0, 0.45, -0.3], [0, 0.7, -0.46], 0.01, DARK, tail2, 5);
  ball(0.03, [0, 0.72, -0.47], COPPER, tail3, 7);

  // ---------- legs ----------
  for (const k of Object.keys(legs)) {
    const { hip, knee, ankle, s, z, end } = legs[k];
    const x = 0.1 * s;
    ball(0.045, [x, 0.34, z], DARK, hip, 8);                       // hip joint
    seg([x, 0.34, z], [x, 0.2, z + (end === "F" ? 0.01 : -0.02)], 0.032, BRASS, hip, 6);
    ball(0.034, [x + 0.012 * s, 0.2, z + (end === "F" ? 0.01 : -0.02)], STEEL, knee, 8); // knee bolt
    seg([x, 0.2, z + (end === "F" ? 0.01 : -0.02)], [x, 0.08, z], 0.024, BRASS, knee, 6);
    ball(0.02, [x, 0.08, z], STEEL, ankle, 6);
    box(0.07, 0.04, 0.12, [x, 0.02, z + 0.025], COPPER, ankle);   // paw
    box(0.075, 0.012, 0.04, [x, 0.006, z + 0.075], DARK, ankle);  // toe pad
  }

  return b.root;
}
```