import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Vintage Bicycle",
  description:
    "Classic green roadster with a diamond frame, whitewall-style cream rims, spoked wheels, fenders, leather saddle, swept-back bars, a brass lamp and bell, a rear rack and a chain drive. The wheels, steering and cranks are rigged on named joints.",
};

export default function build() {
  const b = createBuilder({ name: "vintage_bicycle" });

  // ---------- skeleton ----------
  const frameJ = b.joint("frame", { at: [0, 0.5, 0] });
  const steer = b.joint("steer", { at: [0, 0.78, 0.47], parent: frameJ });
  const wheelF = b.joint("wheelF", { at: [0, 0.34, 0.55], parent: steer });
  const wheelR = b.joint("wheelR", { at: [0, 0.34, -0.55], parent: frameJ });
  const crank = b.joint("crank", { at: [0, 0.28, 0], parent: frameJ });

  const GREEN = "#2f6b57";
  const CREAM = "#eadfbf";
  const CHROME = "#b9bec4";
  const BLACK = "#1b1b1d";
  const BROWN = "#6b3f22";
  const BRASS = "#c49a3a";
  const RED = "#b8262a";

  const ZERO: [number, number, number] = [0, 0, 0];

  // Build a cylinder between two model-space points, baked into geometry.
  const rod = (
    a: number[],
    c: number[],
    r: number,
    color: string,
    bone: any,
    seg = 6,
  ) => {
    const A = new THREE.Vector3(...(a as [number, number, number]));
    const C = new THREE.Vector3(...(c as [number, number, number]));
    const d = C.clone().sub(A);
    const len = d.length();
    const y = d.clone().normalize();
    const helper =
      Math.abs(y.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
    const x = helper.clone().cross(y).normalize();
    const z = y.clone().cross(x).normalize();
    const m = new THREE.Matrix4().makeBasis(x, y, z);
    m.setPosition(A.clone().add(C).multiplyScalar(0.5));
    const g = new THREE.CylinderGeometry(r, r, len, seg, 1);
    g.applyMatrix4(m);
    return b.part(g, color, { at: ZERO, bone });
  };

  const put = (g: THREE.BufferGeometry, color: string, bone: any, p: number[] = ZERO) => {
    g.translate(p[0], p[1], p[2]);
    return b.part(g, color, { at: ZERO, bone });
  };

  // ---------- frame (diamond) ----------
  const BB = [0, 0.28, 0];
  const R = [0, 0.34, -0.55];
  const F = [0, 0.34, 0.55];
  const seatTop = [0, 0.8, -0.12];
  const topRear = [0, 0.77, -0.11];
  const headTop = [0, 0.84, 0.45];
  const headBot = [0, 0.74, 0.47];

  rod(BB, seatTop, 0.0155, GREEN, frameJ, 7); // seat tube
  rod(topRear, [0, 0.815, 0.45], 0.0155, GREEN, frameJ, 7); // top tube
  rod(BB, [0, 0.75, 0.465], 0.0185, GREEN, frameJ, 7); // down tube
  rod(headBot, headTop, 0.0225, GREEN, frameJ, 8); // head tube
  rod([0, 0.745, 0.47], [0, 0.735, 0.475], 0.026, CHROME, frameJ, 8); // head cup
  for (const s of [-1, 1]) {
    rod([s * 0.035, 0.28, 0], [s * 0.055, 0.34, -0.55], 0.011, GREEN, frameJ); // chain stays
    rod([0, 0.76, -0.115], [s * 0.055, 0.34, -0.55], 0.009, GREEN, frameJ); // seat stays
    // dropouts
    put(new THREE.BoxGeometry(0.014, 0.04, 0.03), GREEN, frameJ, [s * 0.055, 0.34, -0.55]);
  }
  put(new THREE.SphereGeometry(0.03, 8, 6), GREEN, frameJ, BB); // BB shell
  put(new THREE.CylinderGeometry(0.022, 0.022, 0.1, 8).rotateZ(Math.PI / 2), CHROME, frameJ, BB);

  // seat post & saddle
  rod(seatTop, [0, 0.9, -0.135], 0.0125, CHROME, frameJ);
  put(new THREE.CylinderGeometry(0.019, 0.019, 0.025, 8), CHROME, frameJ, seatTop);
  const sad = new THREE.SphereGeometry(1, 8, 6);
  sad.scale(0.085, 0.032, 0.095);
  put(sad, BROWN, frameJ, [0, 0.925, -0.17]);
  const nose = new THREE.SphereGeometry(1, 7, 5);
  nose.scale(0.04, 0.026, 0.12);
  put(nose, BROWN, frameJ, [0, 0.925, -0.06]);
  for (const s of [-1, 1]) {
    rod([s * 0.03, 0.912, -0.2], [s * 0.025, 0.9, -0.14], 0.004, CHROME, frameJ, 4);
    rod([s * 0.025, 0.9, -0.14], [s * 0.012, 0.915, -0.03], 0.004, CHROME, frameJ, 4);
  }
  put(new THREE.BoxGeometry(0.1, 0.012, 0.02), BRASS, frameJ, [0, 0.9, -0.14]);

  // rear rack + reflector
  put(new THREE.BoxGeometry(0.13, 0.012, 0.2), CHROME, frameJ, [0, 0.64, -0.62]);
  for (const s of [-1, 1]) {
    rod([s * 0.055, 0.34, -0.55], [s * 0.05, 0.64, -0.68], 0.004, CHROME, frameJ, 4);
    rod([s * 0.055, 0.76, -0.12], [s * 0.05, 0.64, -0.55], 0.004, CHROME, frameJ, 4);
  }
  put(new THREE.BoxGeometry(0.05, 0.035, 0.012), RED, frameJ, [0, 0.62, -0.725]);

  // ---------- wheels ----------
  const wheel = (hub: number[], bone: any) => {
    put(new THREE.TorusGeometry(0.315, 0.026, 6, 28).rotateY(Math.PI / 2), BLACK, bone, hub);
    put(new THREE.TorusGeometry(0.285, 0.011, 4, 28).rotateY(Math.PI / 2), CREAM, bone, hub);
    put(new THREE.CylinderGeometry(0.017, 0.017, 0.11, 8).rotateZ(Math.PI / 2), CHROME, bone, hub);
    for (const s of [-1, 1])
      put(new THREE.CylinderGeometry(0.036, 0.036, 0.008, 10).rotateZ(Math.PI / 2), CHROME, bone, [
        hub[0] + s * 0.028,
        hub[1],
        hub[2],
      ]);
    const N = 18;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const side = i % 2 ? 1 : -1;
      const a2 = a + (side > 0 ? 0.45 : -0.45);
      rod(
        [hub[0] + side * 0.028, hub[1] + Math.sin(a) * 0.034, hub[2] + Math.cos(a) * 0.034],
        [hub[0], hub[1] + Math.sin(a2) * 0.28, hub[2] + Math.cos(a2) * 0.28],
        0.0017,
        CHROME,
        bone,
        3,
      );
    }
    // valve
    rod(
      [hub[0], hub[1] + 0.285, hub[2]],
      [hub[0], hub[1] + 0.262, hub[2]],
      0.003,
      CHROME,
      bone,
      4,
    );
  };
  wheel(F, wheelF);
  wheel(R, wheelR);

  // fenders
  const front = new THREE.TorusGeometry(0.37, 0.012, 4, 20, 2.3).rotateY(Math.PI / 2);
  front.rotateX(0);
  // torus starts at angle 0 on rotated axes; rotate about X to place arc front-top
  front.rotateX(-0.0);
  front.scale(3.2, 1, 1);
  // choose start angle by rotating around hub axis (X)
  front.rotateX(0);
  const placeArc = (start: number, len: number, hub: number[], bone: any) => {
    const g = new THREE.TorusGeometry(0.37, 0.012, 4, 18, len);
    g.rotateZ(start); // start angle in torus plane
    g.rotateY(Math.PI / 2);
    g.scale(3.4, 1, 1);
    put(g, GREEN, bone, hub);
  };
  placeArc(Math.PI / 2 - 0.2, 2.35, F, steer);
  placeArc(-0.7, 2.5, R, frameJ);
  // fender stays
  rod([0.0, 0.34, 0.55], [0.0, 0.7, 0.62], 0.003, CHROME, steer, 4);

  // ---------- fork & steering ----------
  for (const s of [-1, 1]) {
    rod([s * 0.05, 0.34, 0.55], [s * 0.05, 0.5, 0.52], 0.0105, GREEN, steer);
    rod([s * 0.05, 0.5, 0.52], [s * 0.04, 0.74, 0.47], 0.0105, GREEN, steer);
  }
  put(new THREE.BoxGeometry(0.115, 0.022, 0.04), GREEN, steer, [0, 0.725, 0.47]); // crown
  rod([0, 0.75, 0.46], [0, 0.93, 0.44], 0.0105, CHROME, steer); // stem
  put(new THREE.SphereGeometry(0.02, 7, 5), CHROME, steer, [0, 0.93, 0.44]);

  // handlebars (swept-back)
  for (const s of [-1, 1]) {
    const pts = [
      [s * 0.0, 0.945, 0.44],
      [s * 0.11, 0.955, 0.45],
      [s * 0.2, 0.955, 0.42],
      [s * 0.25, 0.945, 0.34],
      [s * 0.26, 0.93, 0.29],
    ];
    for (let i = 0; i < pts.length - 1; i++)
      rod(pts[i], pts[i + 1], 0.0085, CHROME, steer, 5);
    rod([s * 0.255, 0.935, 0.31], [s * 0.265, 0.925, 0.215], 0.0145, BROWN, steer, 6); // grip
    put(new THREE.SphereGeometry(0.015, 6, 4), BROWN, steer, [s * 0.265, 0.925, 0.213]);
    // brake lever
    rod([s * 0.245, 0.945, 0.37], [s * 0.235, 0.915, 0.4], 0.0035, CHROME, steer, 4);
  }

  // bell
  put(new THREE.SphereGeometry(0.03, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), BRASS, steer, [0.1, 0.965, 0.45]);

  // headlamp
  put(new THREE.CylinderGeometry(0.045, 0.05, 0.07, 10).rotateX(Math.PI / 2), BRASS, steer, [0, 0.88, 0.545]);
  put(new THREE.SphereGeometry(0.04, 8, 5), "#fff4c6", steer, [0, 0.88, 0.585]);
  put(new THREE.CylinderGeometry(0.048, 0.048, 0.012, 10).rotateX(Math.PI / 2), CHROME, steer, [0, 0.88, 0.58]);
  rod([0, 0.835, 0.51], [0, 0.78, 0.49], 0.005, CHROME, steer, 4);
  rod([0, 0.84, 0.5], [0, 0.88, 0.52], 0.005, CHROME, steer, 4);

  // ---------- drivetrain ----------
  const cx = -0.065;
  put(new THREE.TorusGeometry(0.09, 0.006, 4, 20).rotateY(Math.PI / 2), CHROME, crank, [cx, 0.28, 0]);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    rod([cx, 0.28, 0], [cx, 0.28 + Math.sin(a) * 0.085, Math.cos(a) * 0.085], 0.004, CHROME, crank, 4);
  }
  put(new THREE.CylinderGeometry(0.1, 0.1, 0.004, 14).rotateZ(Math.PI / 2), "#8b8f94", crank, [cx - 0.012, 0.28, 0]);
  // rear cog + chain
  put(new THREE.TorusGeometry(0.04, 0.006, 4, 12).rotateY(Math.PI / 2), CHROME, wheelR, [cx, 0.34, -0.55]);
  rod([cx, 0.37, 0], [cx, 0.38, -0.55], 0.004, BLACK, frameJ, 4);
  rod([cx, 0.19, 0], [cx, 0.3, -0.55], 0.004, BLACK, frameJ, 4);
  // chain guard
  put(new THREE.BoxGeometry(0.008, 0.035, 0.52), GREEN, frameJ, [cx - 0.03, 0.4, -0.27]);

  // cranks (left down, right up) and pedals
  const L = 1,
    Rr = -1;
  rod([L * 0.075, 0.28, 0], [L * 0.085, 0.11, 0.0], 0.009, CHROME, crank);
  rod([Rr * 0.085, 0.28, -0.0], [Rr * 0.09, 0.45, 0.0], 0.009, CHROME, crank);
  put(new THREE.BoxGeometry(0.09, 0.02, 0.1), BLACK, crank, [L * 0.135, 0.11, 0]);
  put(new THREE.BoxGeometry(0.09, 0.02, 0.1), BLACK, crank, [Rr * 0.14, 0.45, 0]);

  return b.root;
}
