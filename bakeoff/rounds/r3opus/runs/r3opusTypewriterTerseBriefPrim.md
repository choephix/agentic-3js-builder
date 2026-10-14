```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Vintage Typewriter",
  description:
    "A stylized 1950s portable typewriter in deep teal with chrome trim, round chrome-ringed keys, a red and black ribbon, a black platen carriage with a half-typed letter, and a brass badge.",
};

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  const root = b.joint("root", { at: [0, 0, 0] });

  const R: any = rng(1951);
  const rand: () => number = typeof R === "function" ? R : () => R.next();

  const C = {
    body: "#1d5c57",
    bodyDark: "#143f3b",
    chrome: "#c9cdd3",
    steel: "#8d939b",
    black: "#1b1b1b",
    cream: "#efe4c8",
    red: "#c23b2e",
    brass: "#c9a04a",
    rubber: "#262626",
    paper: "#fbf8ef",
    ink: "#34302c",
  };

  const put = (geo: THREE.BufferGeometry, color: string, at: number[]) =>
    b.part(geo, color, { at, bone: root });

  const box = (w: number, h: number, d: number, color: string, at: number[], rx = 0) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (rx) g.rotateX(rx);
    return put(g, color, at);
  };

  // cylinder between two points, oriented by plain geometry rotations
  const rod = (a: number[], c: number[], r: number, color: string, seg = 8) => {
    const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const len = d.length();
    d.normalize();
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    g.rotateX(Math.PI / 2); // along +Z
    g.rotateX(-Math.asin(THREE.MathUtils.clamp(d.y, -1, 1)));
    g.rotateY(Math.atan2(d.x, d.z));
    return put(g, color, [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2]);
  };

  // cylinder lying along X
  const xcyl = (r: number, len: number, color: string, at: number[], seg = 14) => {
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    g.rotateZ(Math.PI / 2);
    return put(g, color, at);
  };

  // ---------- base and feet ----------
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      put(new THREE.CylinderGeometry(0.014, 0.016, 0.012, 10), C.rubber, [sx * 0.18, 0.006, sz * 0.15]);
    }
  box(0.42, 0.03, 0.34, C.bodyDark, [0, 0.025, 0]);
  box(0.424, 0.004, 0.344, C.chrome, [0, 0.04, 0]);

  // ---------- lower body (keyboard housing) ----------
  box(0.4, 0.06, 0.3, C.body, [0, 0.07, 0]);
  // rounded front nose
  xcyl(0.022, 0.4, C.body, [0, 0.062, 0.148], 12);
  box(0.404, 0.005, 0.006, C.chrome, [0, 0.098, 0.151]); // front trim
  box(0.38, 0.004, 0.17, C.bodyDark, [0, 0.101, 0.065]); // keyboard deck
  // side vents
  for (const sx of [-1, 1])
    for (let i = 0; i < 4; i++) box(0.003, 0.004, 0.08, C.bodyDark, [sx * 0.2005, 0.055 + i * 0.011, 0.06]);

  // ---------- rear tower ----------
  box(0.4, 0.09, 0.17, C.body, [0, 0.145, -0.065]);
  box(0.404, 0.004, 0.174, C.chrome, [0, 0.19, -0.065]); // top trim
  box(0.404, 0.004, 0.006, C.chrome, [0, 0.102, 0.021]); // seam trim
  // brass badge on the tower face
  {
    const g = new THREE.CylinderGeometry(0.03, 0.03, 0.004, 20);
    g.rotateX(Math.PI / 2);
    g.scale(1.9, 0.55, 1);
    put(g, C.brass, [0, 0.16, 0.021]);
    box(0.07, 0.006, 0.002, C.red, [0, 0.16, 0.0235]);
    box(0.05, 0.002, 0.002, C.cream, [0, 0.16, 0.025]);
  }
  // decorative chrome strips on tower face
  for (const sx of [-1, 1]) {
    box(0.09, 0.004, 0.003, C.chrome, [sx * 0.13, 0.168, 0.021]);
    box(0.07, 0.004, 0.003, C.chrome, [sx * 0.12, 0.154, 0.021]);
  }

  // ---------- typebar basket ----------
  put(new THREE.CylinderGeometry(0.11, 0.11, 0.004, 20, 1, false, Math.PI / 2, Math.PI), C.black, [0, 0.193, 0.0]);
  const bars = 28;
  for (let i = 0; i < bars; i++) {
    const phi = -1.45 + (2.9 * i) / (bars - 1);
    const g = new THREE.BoxGeometry(0.003, 0.003, 0.085);
    g.translate(0, 0, -0.05);
    g.rotateY(phi);
    put(g, C.steel, [0, 0.197, 0.0]);
    // slug at outer end
    const s = new THREE.BoxGeometry(0.005, 0.004, 0.008);
    s.translate(0, 0, -0.095);
    s.rotateY(phi);
    put(s, C.chrome, [0, 0.197, 0.0]);
  }
  box(0.022, 0.012, 0.01, C.chrome, [0, 0.2, -0.005]); // type guide

  // ---------- ribbon spools ----------
  for (const sx of [-1, 1]) {
    const x = sx * 0.155;
    put(new THREE.CylinderGeometry(0.038, 0.034, 0.008, 18), C.chrome, [x, 0.196, -0.03]);
    put(new THREE.CylinderGeometry(0.031, 0.031, 0.007, 18), C.black, [x, 0.2035, -0.03]);
    put(new THREE.CylinderGeometry(0.031, 0.031, 0.006, 18), C.red, [x, 0.21, -0.03]);
    put(new THREE.CylinderGeometry(0.034, 0.034, 0.002, 18), C.chrome, [x, 0.214, -0.03]);
    put(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 10), C.cream, [x, 0.217, -0.03]);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + 0.4;
      put(new THREE.CylinderGeometry(0.005, 0.005, 0.0025, 8), C.black, [
        x + Math.cos(a) * 0.02, 0.2152, -0.03 + Math.sin(a) * 0.02,
      ]);
    }
  }
  // two-tone ribbon band
  box(0.31, 0.006, 0.0015, C.black, [0, 0.209, -0.062]);
  box(0.31, 0.006, 0.0015, C.red, [0, 0.203, -0.062]);

  // ---------- carriage ----------
  box(0.52, 0.012, 0.03, C.chrome, [0, 0.198, -0.12]); // rail
  // index scale on rail
  box(0.46, 0.008, 0.002, C.cream, [0, 0.199, -0.1045]);
  for (let i = 0; i <= 30; i++) {
    const tall = i % 5 === 0;
    box(0.0012, tall ? 0.006 : 0.0035, 0.001, C.ink, [-0.225 + i * 0.015, tall ? 0.199 : 0.2002, -0.103]);
  }
  // margin stops
  for (const x of [-0.17, 0.15]) box(0.008, 0.01, 0.012, C.red, [x, 0.209, -0.126]);

  for (const sx of [-1, 1]) {
    box(0.014, 0.065, 0.075, C.body, [sx * 0.245, 0.235, -0.105]);
    box(0.016, 0.004, 0.077, C.chrome, [sx * 0.245, 0.268, -0.105]);
    // platen knobs
    xcyl(0.023, 0.03, C.black, [sx * 0.272, 0.245, -0.1], 16);
    for (let k = 0; k < 3; k++) {
      const t = new THREE.TorusGeometry(0.0235, 0.0025, 6, 16);
      t.rotateY(Math.PI / 2);
      put(t, C.black, [sx * (0.262 + k * 0.01), 0.245, -0.1]);
    }
    xcyl(0.012, 0.006, C.chrome, [sx * 0.29, 0.245, -0.1], 12);
  }
  // platen roller
  xcyl(0.03, 0.47, C.rubber, [0, 0.245, -0.1], 18);
  xcyl(0.006, 0.52, C.chrome, [0, 0.245, -0.1], 8); // axle

  // paper table behind
  {
    const g = new THREE.BoxGeometry(0.32, 0.17, 0.006);
    g.translate(0, 0.085, 0);
    g.rotateX(-0.45);
    put(g, C.body, [0, 0.235, -0.128]);
    const t = new THREE.BoxGeometry(0.32, 0.006, 0.008);
    t.translate(0, 0.17, 0);
    t.rotateX(-0.45);
    put(t, C.chrome, [0, 0.235, -0.128]);
  }

  // paper with typed text
  const paperAt = [0, 0.25, -0.072];
  const tilt = -0.25;
  {
    const g = new THREE.BoxGeometry(0.21, 0.28, 0.0015);
    g.translate(0, 0.14, 0);
    g.rotateX(tilt);
    put(g, C.paper, paperAt);
    const line = (x0: number, len: number, h: number, color: string, th = 0.0035) => {
      const l = new THREE.BoxGeometry(len, th, 0.0008);
      l.translate(x0 + len / 2, h, 0.0012);
      l.rotateX(tilt);
      put(l, color, paperAt);
    };
    line(-0.085, 0.07, 0.25, C.red, 0.005); // heading
    line(0.035, 0.05, 0.25, C.ink, 0.003); // date
    for (let i = 0; i < 12; i++) {
      const h = 0.225 - i * 0.0135;
      let x = i === 0 || i === 5 ? -0.07 : -0.085;
      const end = i === 11 ? -0.01 : i === 4 ? 0.03 : 0.085 - rand() * 0.02;
      while (x < end - 0.01) {
        const w = Math.min(0.008 + rand() * 0.028, end - x);
        line(x, w, h, C.ink);
        x += w + 0.005;
      }
    }
  }

  // paper bail with rollers
  rod([-0.238, 0.272, -0.068], [0.238, 0.272, -0.068], 0.0028, C.chrome);
  for (const sx of [-1, 1]) rod([sx * 0.238, 0.272, -0.068], [sx * 0.238, 0.255, -0.09], 0.003, C.chrome);
  for (const x of [-0.13, 0, 0.13]) xcyl(0.0065, 0.016, C.cream, [x, 0.272, -0.068], 10);
  // card holder in front of print point
  box(0.05, 0.012, 0.002, C.chrome, [0, 0.222, -0.069]);

  // carriage return lever (+X side)
  rod([0.25, 0.262, -0.085], [0.28, 0.29, -0.03], 0.0045, C.chrome);
  rod([0.28, 0.29, -0.03], [0.3, 0.295, 0.03], 0.0045, C.chrome);
  {
    const g = new THREE.CapsuleGeometry(0.008, 0.025, 4, 10);
    g.rotateX(Math.PI / 2);
    put(g, C.black, [0.3, 0.295, 0.045]);
  }
  // line-space lever on the other side
  rod([-0.25, 0.262, -0.09], [-0.27, 0.285, -0.06], 0.003, C.chrome);
  put(new THREE.SphereGeometry(0.006, 10, 8), C.red, [-0.27, 0.285, -0.06]);

  // ---------- keyboard ----------
  const rows = [10, 11, 11, 10];
  const stagger = [0.014, 0.007, 0.0, -0.005];
  const sp = 0.031;
  const keyTop = (i: number) => 0.122 + i * 0.017;
  const keyZ = (i: number) => 0.135 - i * 0.026;

  const key = (x: number, z: number, top: number, r: number, capColor: string, glyph: string) => {
    rod([x, top - 0.004, z], [x, 0.099, z - 0.03], 0.0018, C.steel, 6);
    put(new THREE.CylinderGeometry(r, r, 0.005, 14), C.chrome, [x, top - 0.0025, z]);
    put(new THREE.CylinderGeometry(r - 0.0018, r - 0.0018, 0.0055, 14), capColor, [x, top - 0.0015, z]);
    const n = 1 + Math.floor(rand() * 2);
    for (let k = 0; k < n; k++) {
      const g = new THREE.BoxGeometry(0.0055 - k * 0.0015, 0.0006, 0.0016);
      g.rotateY(rand() * Math.PI);
      put(g, glyph, [x + (rand() - 0.5) * 0.003, top + 0.0013, z + (rand() - 0.5) * 0.003]);
    }
  };

  rows.forEach((count, i) => {
    const z = keyZ(i);
    const top = keyTop(i);
    const x0 = -((count - 1) * sp) / 2 + stagger[i];
    for (let k = 0; k < count; k++) {
      const numberRow = i === 3;
      key(x0 + k * sp, z, top, 0.0115, numberRow ? C.cream : C.black, numberRow ? C.black : C.cream);
    }
  });
  // shift and lock keys
  for (const sx of [-1, 1]) key(sx * 0.183, keyZ(0) + 0.002, keyTop(0), 0.0125, C.red, C.cream);
  key(0.183, keyZ(1), keyTop(1), 0.011, C.black, C.red);
  key(-0.183, keyZ(2), keyTop(2), 0.011, C.black, C.cream);

  // space bar
  box(0.2, 0.008, 0.014, C.chrome, [0, 0.112, 0.162]);
  box(0.19, 0.003, 0.01, C.black, [0, 0.1165, 0.162]);
  for (const sx of [-1, 1]) rod([sx * 0.09, 0.108, 0.158], [sx * 0.11, 0.085, 0.13], 0.0025, C.chrome);

  // tabulator and backspace keys on the tower face
  box(0.03, 0.01, 0.012, C.red, [0.17, 0.115, 0.03]);
  box(0.03, 0.01, 0.012, C.black, [-0.17, 0.115, 0.03]);

  return b.root;
}
```