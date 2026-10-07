import * as THREE from "three";
import { createBuilder, polyline, catmull, mottle } from "../../../../src/index";

export const meta = {
  name: "Scorpion",
  description:
    "A stylized desert scorpion in a rest pose: pincer-tipped pedipalps, eight splayed legs, segmented body and a tail curled over the back ending in a stinger. Rigged with spine, tail, arm, leg and jaw joints.",
};

export default function build() {
  const b = createBuilder({ name: "scorpion" });
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);

  const AMBER = "#c98f35";
  const TAN = "#dcae55";
  const BROWN = "#7a4a1e";
  const DARK = "#4a2a14";
  const BELLY = "#a8742e";
  const BLACK = "#1c110c";
  const SHINE = "#e8c26a";

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0.024, 0], dir: [0, 0, 1] });
  b.joint("head", { parent: "root", at: [0, 0.026, 0.03], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.019, 0.058], dir: [0, 0, 1], role: "jaw" });
  const spine = b.chain("spine", polyline([[0, 0.024, 0], [0, 0.024, -0.035], [0, 0.026, -0.07]]), {
    parent: "root",
    names: ["spine1", "spine2"],
    role: "spine",
  });

  // helpers
  const link = (a: number[], c: number[], r0: number, r1: number, color: string, bone: any, seg = 6) => {
    const A = V(a), B = V(c);
    const len = A.distanceTo(B);
    return b.part(new THREE.CylinderGeometry(r1, r0, len, seg, 1), color, {
      at: A.clone().add(B).multiplyScalar(0.5),
      dir: B.clone().sub(A),
      bone,
    });
  };
  const cone = (a: number[], c: number[], r: number, color: string, bone: any, flat = 1) => {
    const A = V(a), B = V(c);
    const len = A.distanceTo(B);
    return b.part(new THREE.ConeGeometry(r, len, 6, 1), color, {
      at: A.clone().add(B).multiplyScalar(0.5),
      dir: B.clone().sub(A),
      bone,
      scale: [1, 1, flat],
    });
  };
  const ball = (p: number[] | THREE.Vector3, r: number, color: string, bone: any, scale: number[] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: p as any, bone, scale });

  // ---------- carapace ----------
  ball([0, 0.03, 0.025], 1, mottle(AMBER, "#a8702a", { size: 0.012, seed: 3 }), "head", [0.03, 0.013, 0.036]);
  b.part(new THREE.BoxGeometry(0.005, 0.003, 0.05), BROWN, { at: [0, 0.0425, 0.025], bone: "head" });
  b.part(new THREE.BoxGeometry(0.03, 0.01, 0.01), AMBER, { at: [0, 0.027, 0.055], bone: "head" });
  // eyes
  for (const s of [1, -1]) {
    ball([s * 0.006, 0.043, 0.032], 0.0035, BLACK, "head");
    ball([s * 0.0055, 0.0455, 0.0335], 0.0012, SHINE, "head");
    for (let k = 0; k < 3; k++) ball([s * 0.0215, 0.032, 0.04 + k * 0.007], 0.0025, BLACK, "head");
  }
  // chelicerae (upper on head, lower on jaw)
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.008, 0.006, 0.014), "#8a5a26", { at: [s * 0.006, 0.022, 0.06], bone: "head" });
    b.part(new THREE.BoxGeometry(0.007, 0.004, 0.011), DARK, { at: [s * 0.006, 0.0155, 0.064], bone: "jaw" });
    cone([s * 0.006, 0.02, 0.069], [s * 0.004, 0.0165, 0.078], 0.0025, BLACK, "jaw");
  }

  // ---------- mesosoma ----------
  for (let i = 0; i < 7; i++) {
    const z = -0.004 - i * 0.0105;
    const w = 0.03 - i * 0.0018;
    const bone = i < 3 ? "spine1" : "spine2";
    ball([0, 0.026, z], 1, i % 2 ? AMBER : TAN, bone, [w, 0.0125, 0.0068]);
    b.part(new THREE.BoxGeometry(0.004, 0.002, 0.006), BROWN, { at: [0, 0.0385, z], bone });
  }
  b.part(new THREE.BoxGeometry(0.034, 0.007, 0.075), BELLY, { at: [0, 0.0165, -0.035], bone: "spine1" });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.004, 0.0015, 0.014), TAN, { at: [s * 0.006, 0.012, 0.001], bone: "root" });
    for (let k = 0; k < 4; k++)
      b.part(new THREE.BoxGeometry(0.0015, 0.001, 0.003), BROWN, { at: [s * 0.006, 0.0105, -0.004 + k * 0.0035], bone: "root" });
  }

  // ---------- tail ----------
  const tailPts: number[][] = [
    [0, 0.028, -0.07], [0, 0.03, -0.11], [0, 0.048, -0.14], [0, 0.085, -0.15], [0, 0.115, -0.125], [0, 0.123, -0.09], [0, 0.118, -0.058],
  ];
  const tail = b.chain("tail", catmull(tailPts), { parent: "spine2", count: 6, role: "tail" });
  const curl = new THREE.Vector3(0, 0.075, -0.095);
  for (let i = 0; i < 6; i++) {
    const p0 = tail.at(i / 6), p1 = tail.at((i + 1) / 6), pm = tail.at((i + 0.5) / 6);
    const r = 0.0108 - i * 0.0012;
    const len = p0.at.distanceTo(p1.at);
    b.part(new THREE.SphereGeometry(1, 8, 6), i % 2 ? AMBER : TAN, {
      at: pm,
      dir: p1.at.clone().sub(p0.at),
      scale: [r, len * 0.56, r * 0.95],
    });
    // ring at the joint
    b.part(new THREE.TorusGeometry(r * 0.9, 0.0014, 4, 8), BROWN, {
      at: p1,
      dir: p1.at.clone().sub(p0.at),
      axis: "z",
    });
    // dorsal granules on the outside of the curl
    const out = pm.at.clone().sub(curl).normalize();
    cone(pm.at.clone().addScaledVector(out, r * 0.8).toArray(), pm.at.clone().addScaledVector(out, r + 0.005).toArray(), 0.0022, BROWN, tail.jointAt((i + 0.5) / 6));
  }
  const end = tail.at(1);
  const lastJ = tail.jointAt(0.99);
  ball(end.at.clone().add(new THREE.Vector3(0, 0, 0.004)), 0.0118, "#d49a3c", lastJ, [1, 1, 1.25]);
  cone([0, 0.116, -0.04], [0, 0.098, -0.012], 0.0058, BLACK, lastJ);
  cone([0, 0.099, -0.014], [0, 0.088, -0.003], 0.0025, "#2a1810", lastJ);

  // ---------- pedipalps with pincers ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = [
      [s * 0.02, 0.022, 0.05], [s * 0.048, 0.024, 0.07], [s * 0.056, 0.022, 0.095], [s * 0.052, 0.022, 0.112],
    ];
    const arm = b.chain(`palp${S}`, polyline(pts), {
      parent: "head",
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`],
      role: "arm",
    });
    const rr = [0.0065, 0.006, 0.0055, 0.005];
    for (let k = 0; k < 3; k++) {
      link(pts[k], pts[k + 1], rr[k], rr[k + 1], k === 1 ? TAN : AMBER, arm.joints[k]);
      ball(pts[k + 1], rr[k + 1] * 1.25, BROWN, arm.joints[k]);
    }
    ball([s * 0.052, 0.022, 0.126], 1, AMBER, arm.tip, [0.0125, 0.0105, 0.019]);
    b.part(new THREE.BoxGeometry(0.003, 0.002, 0.02), BROWN, { at: [s * 0.052, 0.0325, 0.126], bone: arm.tip! });
    // fixed finger
    cone([s * 0.058, 0.022, 0.138], [s * 0.05, 0.022, 0.185], 0.0058, TAN, arm.tip!, 0.8);
    cone([s * 0.0505, 0.022, 0.18], [s * 0.0485, 0.022, 0.192], 0.0022, BLACK, arm.tip!);
    // movable finger on its own joint
    const fj = b.joint(`finger${S}`, {
      parent: arm.tip!,
      at: [s * 0.045, 0.022, 0.134],
      aim: [s * 0.043, 0.022, 0.185],
      role: "digit",
    });
    cone([s * 0.045, 0.022, 0.134], [s * 0.042, 0.022, 0.184], 0.0055, AMBER, fj, 0.8);
    cone([s * 0.0425, 0.022, 0.18], [s * 0.043, 0.022, 0.192], 0.0022, BLACK, fj);
  }

  // ---------- legs ----------
  const z0 = [0.05, 0.03, 0.01, -0.012];
  const dz = [0.035, 0.012, -0.015, -0.04];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const n = i + 1;
      const pts = [
        [s * 0.02, 0.022, z0[i]],
        [s * 0.055, 0.042, z0[i] + dz[i] * 0.5],
        [s * 0.088, 0.024, z0[i] + dz[i] * 0.95],
        [s * 0.106, 0.002, z0[i] + dz[i] * 1.2],
      ];
      const leg = b.chain(`leg${S}${n}`, polyline(pts), {
        parent: i < 2 ? "head" : "root",
        names: [`hip${S}${n}`, `knee${S}${n}`, `ankle${S}${n}`, `foot${S}${n}`],
        role: "leg",
      });
      const r = [0.0055, 0.0045, 0.0032, 0.002];
      for (let k = 0; k < 3; k++) {
        link(pts[k], pts[k + 1], r[k], r[k + 1], k === 2 ? AMBER : TAN, leg.joints[k]);
        if (k > 0) ball(pts[k], r[k] * 1.3, BROWN, leg.joints[k]);
      }
      ball(pts[0], 0.0065, AMBER, leg.joints[0]);
      cone([pts[3][0], 0.004, pts[3][2]], [pts[3][0], 0.0, pts[3][2]], 0.0018, BLACK, leg.tip!);
    }
  }

  return b.root;
}
