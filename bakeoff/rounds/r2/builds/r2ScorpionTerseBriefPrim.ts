import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Scorpion",
  description: "Desert scorpion with pedipalp claws, eight legs, segmented curled tail and stinger, rigged for animation.",
};

export default function build() {
  const b = createBuilder({ name: "scorpion" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const body = b.joint("body", { at: [0, 0.02, 0] });
  const abdomen = b.joint("abdomen", { at: [0, 0.02, -0.01], parent: body });
  const jaw = b.joint("jaw", { at: [0, 0.02, 0.05], parent: body });

  const C = {
    shell: "#8a5a2b", dark: "#4a2f18", tail: "#b57c3a", claw: "#a8662a",
    sting: "#2a1a10", eye: "#111111", light: "#c99a54",
  };

  const sph = (r: number, color: string, at: number[], bone: any, scale: number[]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at, bone, scale } as any);

  // cylinder-ish segment from a to b
  const seg = (a: number[], c: number[], r0: number, r1: number, color: string, bone: any, sides = 6) => {
    const A = V(a[0], a[1], a[2]), B = V(c[0], c[1], c[2]);
    const len = A.distanceTo(B);
    const m = A.clone().add(B).multiplyScalar(0.5);
    const d = B.clone().sub(A).normalize();
    return b.part(new THREE.CylinderGeometry(r1, r0, len, sides), color, {
      at: [m.x, m.y, m.z], dir: [d.x, d.y, d.z], bone,
    } as any);
  };

  // Carapace and head
  sph(1, C.shell, [0, 0.026, 0.025], body, [0.03, 0.012, 0.034] as any);
  sph(1, C.dark, [0, 0.032, 0.022], body, [0.012, 0.005, 0.016] as any);
  sph(0.003, C.eye, [0.004, 0.0375, 0.026], body, [1, 1, 1]);
  sph(0.003, C.eye, [-0.004, 0.0375, 0.026], body, [1, 1, 1]);
  for (const s of [1, -1]) {
    sph(0.0022, C.eye, [s * 0.015, 0.03, 0.05], body, [1, 1, 1]);
    sph(0.0022, C.eye, [s * 0.017, 0.029, 0.044], body, [1, 1, 1]);
  }

  // Chelicerae (jaw)
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.01, 0.007, 0.016), C.light, { at: [s * 0.007, 0.02, 0.058], bone: jaw } as any);
    seg([s * 0.007, 0.018, 0.064], [s * 0.004, 0.016, 0.075], 0.003, 0.0008, C.dark, jaw, 5);
  }
  b.part(new THREE.BoxGeometry(0.03, 0.01, 0.02), C.shell, { at: [0, 0.022, 0.045], bone: body } as any);

  // Mesosoma plates
  for (let i = 0; i < 7; i++) {
    const z = -0.008 - i * 0.0085;
    const w = 0.027 - i * 0.0022;
    sph(1, i % 2 ? C.shell : C.tail, [0, 0.023, z], abdomen, [w, 0.0115 - i * 0.0004, 0.0066] as any);
    sph(1, C.dark, [0, 0.0325 - i * 0.0004, z], abdomen, [0.004, 0.0015, 0.004] as any);
  }

  // Tail (metasoma)
  const pts: number[][] = [
    [0, 0.024, -0.062], [0, 0.028, -0.082], [0, 0.043, -0.098],
    [0, 0.065, -0.098], [0, 0.082, -0.082], [0, 0.088, -0.062],
  ];
  const tailJ: any[] = [];
  let parent: any = abdomen;
  pts.forEach((p, i) => {
    const j = b.joint("tail" + (i + 1), { at: p, parent });
    tailJ.push(j);
    parent = j;
  });
  for (let i = 0; i < pts.length - 1; i++) {
    const r = 0.0085 - i * 0.0009;
    seg(pts[i], pts[i + 1], r, r - 0.0009, C.tail, tailJ[i], 8);
    sph(r + 0.0004, C.shell, pts[i + 1], tailJ[i], [1, 1, 1]);
    // keel ridge
    const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2, (pts[i][2] + pts[i + 1][2]) / 2];
    sph(0.0025, C.dark, [0, m[1] + 0.0, m[2] - 0.006 + (i > 1 ? 0.011 : 0)], tailJ[i], [1, 1, 1]);
  }
  const stingJ = b.joint("stinger", { at: [0, 0.088, -0.062], parent: tailJ[5] });
  sph(0.0095, C.claw, [0, 0.0885, -0.056], stingJ, [1, 1, 1.15] as any);
  b.part(new THREE.ConeGeometry(0.0038, 0.02, 6), C.sting, {
    at: [0, 0.0835, -0.0425], dir: [0, -0.5, 1], bone: stingJ,
  } as any);
  // fix cone direction: tip points forward-down

  // Legs
  const zs = [0.028, 0.01, -0.008, -0.026];
  const spread = [0.012, 0.004, -0.006, -0.014];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    zs.forEach((z, i) => {
      const hip = b.joint(`legHip${i + 1}${side}`, { at: [s * 0.014, 0.02, z], parent: body });
      const kneeP = [s * 0.04, 0.034, z + spread[i] * 0.8];
      const knee = b.joint(`legKnee${i + 1}${side}`, { at: kneeP, parent: hip });
      const footP = [s * 0.058, 0.002, z + spread[i] * 1.9];
      const foot = b.joint(`legFoot${i + 1}${side}`, { at: footP, parent: knee });
      seg([s * 0.014, 0.02, z], kneeP, 0.0036, 0.003, C.shell, hip, 5);
      sph(0.0042, C.dark, kneeP, knee, [1, 1, 1]);
      seg(kneeP, footP, 0.003, 0.0016, C.tail, knee, 5);
      sph(0.0025, C.dark, footP, foot, [1, 1, 1]);
    });

    // Pedipalps
    const sh = b.joint(`palpShoulder${side}`, { at: [s * 0.016, 0.022, 0.044], parent: body });
    const elP = [s * 0.04, 0.024, 0.07];
    const el = b.joint(`palpElbow${side}`, { at: elP, parent: sh });
    const wrP = [s * 0.036, 0.022, 0.095];
    const wr = b.joint(`palpWrist${side}`, { at: wrP, parent: el });
    seg([s * 0.016, 0.022, 0.044], elP, 0.0055, 0.005, C.shell, sh, 6);
    sph(0.0058, C.dark, elP, el, [1, 1, 1]);
    seg(elP, wrP, 0.005, 0.006, C.claw, el, 6);
    sph(0.0065, C.dark, wrP, wr, [1, 1, 1]);
    // palm
    sph(1, C.claw, [s * 0.034, 0.022, 0.113], wr, [0.011, 0.008, 0.016] as any);
    // fixed finger (inner)
    b.part(new THREE.ConeGeometry(0.0055, 0.034, 6), C.claw, {
      at: [s * 0.026, 0.022, 0.14], dir: [-s * 0.3, 0, 1], bone: wr,
    } as any);
    // movable finger
    const pinch = b.joint(`claw${side}`, { at: [s * 0.042, 0.022, 0.123], parent: wr });
    b.part(new THREE.ConeGeometry(0.0045, 0.034, 6), C.shell, {
      at: [s * 0.04, 0.022, 0.14], dir: [-s * 0.2, 0, 1], bone: pinch,
    } as any);
    sph(0.0035, C.dark, [s * 0.042, 0.022, 0.123], pinch, [1, 1, 1]);
  }

  return b.root;
}
