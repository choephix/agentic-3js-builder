```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Brass Refractor Telescope",
  description:
    "A stylized antique refractor telescope: navy and brass tube with dew shield, finder scope and focuser, on an alt-azimuth fork over a walnut tripod with an accessory tray.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "telescope" });
  const root = b.joint("root", { at: [0, 0, 0] });

  // palette
  const NAVY = "#1f2f5a";
  const NAVY_D = "#16213f";
  const BRASS = "#d0a646";
  const BRASS_D = "#8a6a2a";
  const WOOD = "#6e3f1f";
  const WOOD_L = "#a8703e";
  const BLACK = "#18181c";
  const RUBBER = "#33333a";
  const SILVER = "#c4c8cc";
  const GLASS = "#6cc6ea";
  const GLINT = "#eaf8ff";
  const RED = "#b8322a";
  const CREAM = "#efe4c4";

  const v = (p: V) => new THREE.Vector3(p[0], p[1], p[2]);
  const arr = (p: THREE.Vector3): V => [p.x, p.y, p.z];

  // segment between two points with a geometry built for its length (geometry +Y along a->b)
  const seg = (a: V, c: V, geo: (len: number) => THREE.BufferGeometry, color: string) => {
    const A = v(a), C = v(c);
    const d = C.clone().sub(A);
    const len = d.length();
    const m = A.clone().add(C).multiplyScalar(0.5);
    b.part(geo(len), color, { at: arr(m), dir: arr(d.normalize()), bone: root });
  };
  const put = (geo: THREE.BufferGeometry, color: string, at: V, dir: V = [0, 1, 0]) =>
    b.part(geo, color, { at, dir, bone: root });

  // ---------------- tube frame ----------------
  const P = new THREE.Vector3(0, 1.22, 0); // altitude pivot
  const tilt = THREE.MathUtils.degToRad(28);
  const d = new THREE.Vector3(0, Math.sin(tilt), Math.cos(tilt)); // tube axis
  const u = new THREE.Vector3(0, Math.cos(tilt), -Math.sin(tilt)); // tube "up"
  const X = new THREE.Vector3(1, 0, 0);
  const T = (s: number, up = 0, side = 0): V =>
    arr(P.clone().addScaledVector(d, s).addScaledVector(u, up).addScaledVector(X, side));

  // coaxial cylinder on the tube from s0 to s1
  const tcyl = (s0: number, s1: number, r0: number, r1: number, color: string, segs = 16, up = 0, side = 0) =>
    seg(T(s0, up, side), T(s1, up, side), (len) => new THREE.CylinderGeometry(r1, r0, len, segs), color);

  // main tube
  tcyl(-0.5, 0.5, 0.045, 0.045, NAVY, 18);
  // brass bands with screw heads
  for (const s of [-0.32, 0, 0.3]) {
    tcyl(s - 0.012, s + 0.012, 0.049, 0.049, BRASS, 18);
    for (const side of [-1, 1]) put(new THREE.SphereGeometry(0.006, 6, 4), BRASS_D, T(s, 0, side * 0.05));
  }
  // objective cell + dew shield
  tcyl(0.48, 0.54, 0.051, 0.051, BRASS, 18);
  tcyl(0.54, 0.7, 0.054, 0.056, NAVY_D, 18);
  tcyl(0.685, 0.705, 0.059, 0.059, BRASS, 18);
  // lens face
  tcyl(0.705, 0.708, 0.052, 0.052, BLACK, 18);
  tcyl(0.708, 0.711, 0.043, 0.043, GLASS, 18);
  tcyl(0.711, 0.713, 0.011, 0.011, GLINT, 8, 0.018, 0.014);
  tcyl(0.711, 0.713, 0.005, 0.005, GLINT, 6, 0.004, 0.026);

  // rear cell
  tcyl(-0.56, -0.5, 0.049, 0.049, BRASS, 18);
  tcyl(-0.565, -0.56, 0.032, 0.04, BRASS_D, 14);
  // focuser
  tcyl(-0.65, -0.565, 0.026, 0.026, BLACK, 12);
  tcyl(-0.6, -0.58, 0.03, 0.03, BRASS, 12);
  tcyl(-0.74, -0.65, 0.019, 0.019, SILVER, 12);
  tcyl(-0.745, -0.74, 0.023, 0.023, BRASS, 12);
  tcyl(-0.81, -0.745, 0.022, 0.022, BLACK, 12);
  tcyl(-0.775, -0.765, 0.0235, 0.0235, SILVER, 12);
  tcyl(-0.84, -0.81, 0.021, 0.026, RUBBER, 12);
  // focus knobs (along x)
  for (const side of [-1, 1]) {
    seg(T(-0.615, -0.01, side * 0.026), T(-0.615, -0.01, side * 0.05),
      (len) => new THREE.CylinderGeometry(0.005, 0.005, len, 6), SILVER);
    seg(T(-0.615, -0.01, side * 0.05), T(-0.615, -0.01, side * 0.064),
      (len) => new THREE.CylinderGeometry(0.016, 0.016, len, 10), RED);
    seg(T(-0.615, -0.01, side * 0.064), T(-0.615, -0.01, side * 0.068),
      (len) => new THREE.CylinderGeometry(0.011, 0.011, len, 10), BRASS);
  }

  // nameplate on top of tube
  b.part(new THREE.BoxGeometry(0.05, 0.003, 0.09), CREAM, { at: T(0.15, 0.046), dir: arr(u), bone: root });
  b.part(new THREE.BoxGeometry(0.056, 0.002, 0.096), BRASS, { at: T(0.15, 0.0445), dir: arr(u), bone: root });
  b.part(new THREE.BoxGeometry(0.034, 0.002, 0.006), NAVY, { at: T(0.165, 0.0475), dir: arr(u), bone: root });
  b.part(new THREE.BoxGeometry(0.024, 0.002, 0.004), NAVY, { at: T(0.145, 0.0475), dir: arr(u), bone: root });

  // finder scope
  const fUp = 0.09;
  for (const s of [-0.3, -0.08]) {
    seg(T(s, 0.044), T(s, fUp - 0.012), (len) => new THREE.BoxGeometry(0.012, len, 0.012), BRASS_D);
    tcyl(s - 0.008, s + 0.008, 0.019, 0.019, BRASS, 10, fUp);
    for (const side of [-1, 1]) put(new THREE.SphereGeometry(0.004, 5, 4), SILVER, T(s, fUp, side * 0.02));
  }
  tcyl(-0.38, 0.02, 0.014, 0.014, BRASS, 10, fUp);
  tcyl(0.02, 0.07, 0.019, 0.019, NAVY_D, 10, fUp);
  tcyl(0.07, 0.073, 0.014, 0.014, GLASS, 10, fUp);
  tcyl(-0.43, -0.38, 0.011, 0.011, BLACK, 10, fUp);

  // trunnions + altitude knobs
  for (const side of [-1, 1]) {
    seg(T(0, 0, side * 0.048), T(0, 0, side * 0.1), (len) => new THREE.CylinderGeometry(0.013, 0.013, len, 10), BRASS);
    seg(T(0, 0, side * 0.1), T(0, 0, side * 0.125), (len) => new THREE.CylinderGeometry(0.026, 0.026, len, 8), BLACK);
    seg(T(0, 0, side * 0.125), T(0, 0, side * 0.131), (len) => new THREE.CylinderGeometry(0.014, 0.014, len, 8), BRASS);
  }

  // ---------------- mount ----------------
  // fork arms
  for (const side of [-1, 1]) {
    seg([side * 0.088, 1.07, 0], [side * 0.088, 1.255, 0], (len) => new THREE.BoxGeometry(0.022, len, 0.06), NAVY);
    put(new THREE.CylinderGeometry(0.031, 0.031, 0.024, 12), NAVY, [side * 0.088, 1.22, 0], [1, 0, 0]);
    put(new THREE.CylinderGeometry(0.018, 0.018, 0.026, 10), BRASS, [side * 0.088, 1.22, 0], [1, 0, 0]);
  }
  put(new THREE.BoxGeometry(0.2, 0.03, 0.08), NAVY, [0, 1.07, 0]);
  put(new THREE.CylinderGeometry(0.075, 0.075, 0.022, 18), BRASS, [0, 1.044, 0]);
  put(new THREE.CylinderGeometry(0.06, 0.06, 0.006, 18), BRASS_D, [0, 1.057, 0]);
  // azimuth lock knob
  seg([0, 1.044, 0.07], [0, 1.044, 0.11], (len) => new THREE.CylinderGeometry(0.005, 0.005, len, 6), SILVER);
  put(new THREE.SphereGeometry(0.014, 8, 6), RED, [0, 1.044, 0.115]);
  // tripod head
  put(new THREE.CylinderGeometry(0.1, 0.09, 0.05, 6), WOOD, [0, 1.008, 0]);
  put(new THREE.CylinderGeometry(0.102, 0.102, 0.008, 6), BRASS, [0, 1.03, 0]);

  // ---------------- tripod ----------------
  const legAz = [0, 120, 240].map((a) => THREE.MathUtils.degToRad(a));
  const legPt = (a: number, t: number): V => {
    const r = 0.085 + (0.62 - 0.085) * t;
    const y = 0.99 + (0.022 - 0.99) * t;
    return [Math.sin(a) * r, y, Math.cos(a) * r];
  };
  const tTray = (0.99 - 0.42) / (0.99 - 0.022);
  for (const a of legAz) {
    const top = legPt(a, 0);
    const knee = legPt(a, 0.5);
    const foot = legPt(a, 1);
    // hinge
    put(new THREE.CylinderGeometry(0.014, 0.014, 0.06, 8), BRASS, top, [Math.cos(a), 0, -Math.sin(a)]);
    // upper twin rails
    const tang: V = [Math.cos(a) * 0.016, 0, -Math.sin(a) * 0.016];
    for (const k of [-1, 1]) {
      const o = (p: V): V => [p[0] + tang[0] * k, p[1], p[2] + tang[2] * k];
      seg(o(top), o(legPt(a, 0.56)), (len) => new THREE.BoxGeometry(0.016, len, 0.03), WOOD);
    }
    // lower leg
    seg(legPt(a, 0.42), legPt(a, 0.97), (len) => new THREE.BoxGeometry(0.02, len, 0.024), WOOD_L);
    // clamps
    seg(legPt(a, 0.5), legPt(a, 0.56), (len) => new THREE.BoxGeometry(0.056, len, 0.038), BRASS);
    put(new THREE.SphereGeometry(0.009, 6, 4), BLACK,
      [knee[0] + Math.sin(a) * 0.024, knee[1] - 0.02, knee[2] + Math.cos(a) * 0.024]);
    seg(legPt(a, 0.9), legPt(a, 0.96), (len) => new THREE.CylinderGeometry(0.016, 0.016, len, 8), BRASS);
    // foot
    put(new THREE.SphereGeometry(0.022, 8, 6), BRASS_D, foot);
    // spreader arm to tray
    const lp = legPt(a, tTray);
    seg([Math.sin(a) * 0.22, 0.42, Math.cos(a) * 0.22], [lp[0], 0.42, lp[2]],
      (len) => new THREE.BoxGeometry(0.012, len, 0.02), BRASS_D);
  }
  // accessory tray
  put(new THREE.CylinderGeometry(0.3, 0.3, 0.018, 3), WOOD, [0, 0.42, 0]);
  put(new THREE.CylinderGeometry(0.27, 0.27, 0.02, 3), WOOD_L, [0, 0.423, 0]);
  put(new THREE.CylinderGeometry(0.04, 0.04, 0.026, 10), BRASS, [0, 0.42, 0]);
  // spare eyepieces on the tray
  const spares: [number, number, string][] = [
    [0.1, 0.05, BLACK],
    [-0.09, 0.07, SILVER],
    [0.0, -0.1, BLACK],
  ];
  spares.forEach(([x, z, c], i) => {
    const h = 0.04 + i * 0.012;
    put(new THREE.CylinderGeometry(0.017, 0.017, h, 10), c, [x, 0.433 + h / 2, z]);
    put(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 10), BRASS, [x, 0.437 + h * 0.6, z]);
    put(new THREE.CylinderGeometry(0.012, 0.012, 0.003, 10), GLASS, [x, 0.434 + h, z]);
  });
  // star chart roll
  seg([-0.05, 0.448, -0.02], [0.08, 0.448, -0.05], (len) => new THREE.CylinderGeometry(0.014, 0.014, len, 8), CREAM);
  seg([-0.056, 0.448, -0.019], [-0.05, 0.448, -0.02], (len) => new THREE.CylinderGeometry(0.0145, 0.0145, len, 8), RED);

  return b.root;
}
```