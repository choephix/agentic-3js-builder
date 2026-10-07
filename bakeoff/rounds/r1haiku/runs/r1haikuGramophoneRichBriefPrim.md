```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "gramophone",
  description:
    "Antique gramophone on a carved walnut cabinet: a flared morning-glory brass horn with a green patina, a black record with a red label, a silver tonearm, a side crank and claw feet, with a pale floral inlay on the front panel.",
};

type P = [number, number, number];
type Basis = { x: THREE.Vector3; y: THREE.Vector3; z: THREE.Vector3 };

const V = (p: P) => new THREE.Vector3(p[0], p[1], p[2]);
const toP = (v: THREE.Vector3): P => [v.x, v.y, v.z];
const REF_Y = new THREE.Vector3(0, 1, 0);
const REF_X = new THREE.Vector3(1, 0, 0);
const IDENT: Basis = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
};

// Right-handed basis with y along the given direction.
function basisY(dir: THREE.Vector3): Basis {
  const y = dir.clone().normalize();
  const ref = Math.abs(y.y) < 0.9 ? REF_Y : REF_X;
  const z = new THREE.Vector3().crossVectors(ref, y).normalize();
  const x = new THREE.Vector3().crossVectors(y, z);
  return { x, y, z };
}

// Right-handed basis with z along the given direction.
function basisZ(dir: THREE.Vector3): Basis {
  const z = dir.clone().normalize();
  const ref = Math.abs(z.y) < 0.9 ? REF_Y : REF_X;
  const x = new THREE.Vector3().crossVectors(ref, z).normalize();
  const y = new THREE.Vector3().crossVectors(z, x);
  return { x, y, z };
}

// Flat basis (in the XY plane) rotated by an angle around Z.
function flatBasis(ang: number): Basis {
  return {
    x: new THREE.Vector3(Math.cos(ang), Math.sin(ang), 0),
    y: new THREE.Vector3(-Math.sin(ang), Math.cos(ang), 0),
    z: new THREE.Vector3(0, 0, 1),
  };
}

export default function build() {
  const b = createBuilder({ name: "gramophone" });
  b.joint("base", { at: [0, 0, 0] });

  // Bakes a local-space geometry into place and adds it as a part.
  const place = (
    geo: THREE.BufferGeometry,
    color: string,
    origin: THREE.Vector3,
    basis: Basis,
  ) => {
    const m = new THREE.Matrix4().makeBasis(basis.x, basis.y, basis.z);
    m.setPosition(origin);
    geo.applyMatrix4(m);
    b.part(geo, color, { at: [0, 0, 0] });
  };

  // Cylinder-like segment from a (radius r0) to c (radius r1).
  const rod = (a: P, c: P, r0: number, color: string, r1 = r0, seg = 10) => {
    const A = V(a);
    const C = V(c);
    const d = C.clone().sub(A);
    const g = new THREE.CylinderGeometry(r1, r0, d.length(), seg, 1);
    place(g, color, A.clone().add(C).multiplyScalar(0.5), basisY(d));
  };

  const ball = (c: P, r: number, color: string, s: P = [1, 1, 1], seg = 12) => {
    const g = new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7));
    g.scale(s[0], s[1], s[2]);
    place(g, color, V(c), IDENT);
  };

  const box = (c: P, size: P, color: string) => {
    place(new THREE.BoxGeometry(size[0], size[1], size[2]), color, V(c), IDENT);
  };

  // ---------- Cabinet ----------
  box([0, 0.06, 0], [0.58, 0.06, 0.48], "walnutDark"); // plinth
  box([0, 0.435, 0], [0.56, 0.69, 0.46], "walnut"); // body
  box([0, 0.79, 0], [0.58, 0.02, 0.48], "walnutDark"); // top board
  box([0, 0.765, 0.235], [0.56, 0.03, 0.02], "walnutDark"); // carved front lip

  // Pale border inlay around the front panel.
  const bx0 = 0.22, by0 = 0.12, by1 = 0.72, fz = 0.233;
  rod([-bx0, by0, fz], [bx0, by0, fz], 0.003, "ivory");
  rod([-bx0, by1, fz], [bx0, by1, fz], 0.003, "ivory");
  rod([-bx0, by0, fz], [-bx0, by1, fz], 0.003, "ivory");
  rod([bx0, by0, fz], [bx0, by1, fz], 0.003, "ivory");

  // Floral inlay: flowers, vines and leaves on the front panel.
  const flower = (cx: number, cy: number) => {
    for (let k = 0; k < 5; k++) {
      const ang = (k * Math.PI * 2) / 5 + Math.PI / 2;
      const bas = flatBasis(ang);
      const g = new THREE.SphereGeometry(1, 8, 6);
      g.scale(0.03, 0.013, 0.004);
      const o = new THREE.Vector3(cx, cy, fz + 0.003).add(
        bas.x.clone().multiplyScalar(0.026),
      );
      place(g, "ivory", o, bas);
    }
    const c = new THREE.SphereGeometry(0.009, 8, 6);
    c.scale(1, 1, 0.5);
    place(c, "gold", new THREE.Vector3(cx, cy, fz + 0.004), IDENT);
  };
  flower(-0.17, 0.62);
  flower(0.17, 0.62);
  flower(0, 0.36);

  const vinePts: [number, number][] = [
    [-0.17, 0.56], [-0.11, 0.47], [-0.04, 0.42], [0.0, 0.40],
  ];
  for (let i = 0; i < vinePts.length - 1; i++) {
    const [ax, ay] = vinePts[i];
    const [cx, cy] = vinePts[i + 1];
    rod([ax, ay, fz], [cx, cy, fz], 0.004, "vine");
    rod([-ax, ay, fz], [-cx, cy, fz], 0.004, "vine");
  }
  for (const [lx, ly, ang] of [
    [-0.12, 0.50, 0.6],
    [0.12, 0.50, Math.PI - 0.6],
    [-0.07, 0.44, 0.2],
    [0.07, 0.44, Math.PI - 0.2],
  ] as [number, number, number][]) {
    const bas = flatBasis(ang);
    const g = new THREE.SphereGeometry(1, 8, 6);
    g.scale(0.028, 0.011, 0.003);
    place(g, "vine", new THREE.Vector3(lx, ly, fz + 0.002).add(bas.x.clone().multiplyScalar(0.024)), bas);
  }

  // Claw feet: brass ball with three curled claws.
  for (const fx of [-0.25, 0.25]) {
    for (const fz2 of [-0.19, 0.19]) {
      rod([fx, 0.03, fz2], [fx, 0.07, fz2], 0.014, "brass");
      ball([fx, 0.03, fz2], 0.028, "brass");
      for (let k = 0; k < 3; k++) {
        const a = (k * Math.PI * 2) / 3 + 0.5;
        const cx = Math.cos(a), cz = Math.sin(a);
        rod(
          [fx + cx * 0.018, 0.024, fz2 + cz * 0.018],
          [fx + cx * 0.05, 0.002, fz2 + cz * 0.05],
          0.007,
          "brass",
          0.003,
        );
      }
    }
  }

  // Side crank.
  rod([0.28, 0.45, 0], [0.31, 0.45, 0], 0.03, "brass");
  rod([0.31, 0.45, 0], [0.36, 0.52, 0], 0.008, "brass");
  ball([0.37, 0.53, 0], 0.022, "ebonite");

  // ---------- Turntable, record, spindle ----------
  rod([-0.04, 0.80, 0.02], [-0.04, 0.815, 0.02], 0.15, "brass", 0.15, 36);
  rod([-0.04, 0.815, 0.02], [-0.04, 0.823, 0.02], 0.13, "black", 0.13, 36);
  const groove = new THREE.TorusGeometry(0.09, 0.0025, 4, 48);
  place(groove, "groove", new THREE.Vector3(-0.04, 0.8235, 0.02), basisZ(new THREE.Vector3(0, 1, 0)));
  rod([-0.04, 0.823, 0.02], [-0.04, 0.8238, 0.02], 0.054, "gold", 0.054, 24);
  rod([-0.04, 0.8238, 0.02], [-0.04, 0.8256, 0.02], 0.05, "red", 0.05, 24);
  rod([-0.04, 0.8256, 0.02], [-0.04, 0.845, 0.02], 0.006, "silver");

  // ---------- Tonearm ----------
  ball([0.17, 0.80, -0.12], 0.025, "brass");
  rod([0.17, 0.80, -0.12], [0.17, 0.84, -0.12], 0.018, "brass");
  rod([0.17, 0.84, -0.12], [0.19, 0.90, -0.07], 0.008, "silver");
  ball([0.19, 0.90, -0.07], 0.012, "brass");
  rod([0.19, 0.90, -0.07], [0.09, 0.845, 0.03], 0.007, "silver", 0.005);
  box([0.09, 0.84, 0.03], [0.03, 0.012, 0.04], "silver");

  // ---------- Horn ----------
  const T = V([0, 0.92, -0.02]);
  const L = 0.62;
  const D = new THREE.Vector3(0, 0.55, 0.85).normalize();
  const M = T.clone().addScaledVector(D, L);
  const R0 = 0.018;
  const RM = 0.42;
  const radiusAt = (s: number) => R0 + (RM - R0) * Math.pow(s, 2.8);
  const hb = basisY(D);

  const profile = (s0: number, s1: number, n: number, grow: number) => {
    const out: THREE.Vector2[] = [];
    for (let i = 0; i <= n; i++) {
      const s = s0 + ((s1 - s0) * i) / n;
      out.push(new THREE.Vector2(radiusAt(s) * grow, s * L));
    }
    return out;
  };

  // Brass throat and body, then a green-patinated flare.
  place(new THREE.LatheGeometry(profile(0, 0.58, 12, 1), 36), "brass", T, hb);
  place(new THREE.LatheGeometry(profile(0.58, 1, 14, 1.012), 36), "patina", T, hb);

  // Rim band.
  place(new THREE.TorusGeometry(RM, 0.012, 8, 40), "brass", M, basisZ(D));

  // Morning-glory lobes around the mouth.
  for (let k = 0; k < 5; k++) {
    const ang = (k * Math.PI * 2) / 5;
    const n = hb.x.clone().multiplyScalar(Math.cos(ang)).addScaledVector(hb.z, Math.sin(ang));
    const t = hb.x.clone().multiplyScalar(-Math.sin(ang)).addScaledVector(hb.z, Math.cos(ang));
    const basis: Basis = { x: t, y: D.clone(), z: new THREE.Vector3().crossVectors(t, D) };
    const g = new THREE.SphereGeometry(1, 10, 8);
    g.scale(0.12, 0.08, 0.02);
    const P = M.clone().addScaledVector(n, RM + 0.03).addScaledVector(D, 0.04);
    place(g, "patina", P, basis);
  }
  for (let k = 0; k < 5; k++) {
    const ang = (k * Math.PI * 2) / 5 + Math.PI / 5;
    const n = hb.x.clone().multiplyScalar(Math.cos(ang)).addScaledVector(hb.z, Math.sin(ang));
    const t = hb.x.clone().multiplyScalar(-Math.sin(ang)).addScaledVector(hb.z, Math.cos(ang));
    const basis: Basis = { x: t, y: D.clone(), z: new THREE.Vector3().crossVectors(t, D) };
    const g = new THREE.SphereGeometry(1, 10, 8);
    g.scale(0.07, 0.05, 0.015);
    const P = M.clone().addScaledVector(n, RM * 0.97).addScaledVector(D, 0.03);
    place(g, "brass", P, basis);
  }

  // Throat stub, sound box and support arm.
  rod([0, 0.80, -0.10], toP(T), 0.035, "brass", 0.02);
  ball(toP(T), 0.05, "brass", [1.1, 0.8, 1.2]);
  const supportAt = T.clone().addScaledVector(D, 0.38 * L);
  rod([0, 0.80, -0.12], toP(supportAt), 0.012, "brass");

  return b.root;
}
```