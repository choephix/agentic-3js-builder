```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Racing Green Typewriter",
  description:
    "A 1930s portable typewriter in glossy racing green: four staggered rows of round black keys with cream letters on chrome rims, a fanned semicircle of type bars on a felt rest, two-tone ribbon spools, a black platen with a half-typed letter, a chrome carriage return lever and a brass maker's badge.",
};

const C = {
  green: "#0e4a2b",
  greenDark: "#0a3520",
  chrome: "#dfe4ea",
  steel: "#4a4f55",
  black: "#151515",
  rubber: "#222222",
  cream: "#f2e6c4",
  paper: "#f8f4e9",
  ink: "#26293b",
  brass: "#c9a23a",
  gold: "#d8b24a",
  felt: "#6e1f2b",
  red: "#b3212b",
  well: "#1c1f1e",
};

// Stroke font, glyph cell x,y in [-1, 1]
const FONT: Record<string, number[][][]> = {
  A: [[[-1, -1], [0, 1], [1, -1]], [[-0.5, 0], [0.5, 0]]],
  B: [[[-1, -1], [-1, 1], [0.6, 1], [1, 0.6], [0.6, 0], [-1, 0]], [[0.6, 0], [1, -0.5], [0.6, -1], [-1, -1]]],
  C: [[[1, 0.7], [0.5, 1], [-0.5, 1], [-1, 0.5], [-1, -0.5], [-0.5, -1], [0.5, -1], [1, -0.7]]],
  D: [[[-1, -1], [-1, 1], [0.4, 1], [1, 0.4], [1, -0.4], [0.4, -1], [-1, -1]]],
  E: [[[1, 1], [-1, 1], [-1, -1], [1, -1]], [[-1, 0], [0.5, 0]]],
  F: [[[1, 1], [-1, 1], [-1, -1]], [[-1, 0], [0.5, 0]]],
  G: [[[1, 0.6], [0.6, 1], [-0.6, 1], [-1, 0.6], [-1, -0.6], [-0.6, -1], [0.6, -1], [1, -0.6], [1, 0], [0.2, 0]]],
  H: [[[-1, -1], [-1, 1]], [[1, -1], [1, 1]], [[-1, 0], [1, 0]]],
  I: [[[0, -1], [0, 1]], [[-0.6, 1], [0.6, 1]], [[-0.6, -1], [0.6, -1]]],
  J: [[[1, 1], [1, -0.5], [0.5, -1], [-0.5, -1], [-1, -0.5]]],
  K: [[[-1, -1], [-1, 1]], [[1, 1], [-1, 0], [1, -1]]],
  L: [[[-1, 1], [-1, -1], [1, -1]]],
  M: [[[-1, -1], [-1, 1], [0, 0], [1, 1], [1, -1]]],
  N: [[[-1, -1], [-1, 1], [1, -1], [1, 1]]],
  O: [[[-0.5, 1], [0.5, 1], [1, 0.5], [1, -0.5], [0.5, -1], [-0.5, -1], [-1, -0.5], [-1, 0.5], [-0.5, 1]]],
  P: [[[-1, -1], [-1, 1], [0.6, 1], [1, 0.6], [1, 0.2], [0.6, -0.2], [-1, -0.2]]],
  Q: [[[-0.5, 1], [0.5, 1], [1, 0.5], [1, -0.5], [0.5, -1], [-0.5, -1], [-1, -0.5], [-1, 0.5], [-0.5, 1]], [[0.3, -0.4], [1.1, -1.2]]],
  R: [[[-1, -1], [-1, 1], [0.6, 1], [1, 0.6], [1, 0.2], [0.6, -0.2], [-1, -0.2]], [[0.1, -0.2], [1, -1]]],
  S: [[[1, 0.6], [0.6, 1], [-0.6, 1], [-1, 0.6], [-0.6, 0], [0.6, 0], [1, -0.6], [0.6, -1], [-0.6, -1], [-1, -0.6]]],
  T: [[[-1, 1], [1, 1]], [[0, 1], [0, -1]]],
  U: [[[-1, 1], [-1, -0.5], [-0.5, -1], [0.5, -1], [1, -0.5], [1, 1]]],
  V: [[[-1, 1], [0, -1], [1, 1]]],
  W: [[[-1, 1], [-0.5, -1], [0, 0.3], [0.5, -1], [1, 1]]],
  X: [[[-1, 1], [1, -1]], [[1, 1], [-1, -1]]],
  Y: [[[-1, 1], [0, 0], [1, 1]], [[0, 0], [0, -1]]],
  Z: [[[-1, 1], [1, 1], [-1, -1], [1, -1]]],
  "1": [[[-0.5, 0.5], [0, 1], [0, -1]], [[-0.6, -1], [0.6, -1]]],
  "2": [[[-1, 0.6], [-0.6, 1], [0.6, 1], [1, 0.6], [1, 0.2], [-1, -1], [1, -1]]],
  "3": [[[-1, 1], [1, 1], [0, 0.1], [0.6, 0.1], [1, -0.4], [0.6, -1], [-1, -1]]],
  "4": [[[0.5, -1], [0.5, 1], [-1, -0.3], [1, -0.3]]],
  "5": [[[1, 1], [-1, 1], [-1, 0.1], [0.6, 0.1], [1, -0.4], [0.6, -1], [-1, -1]]],
  "6": [[[0.8, 1], [-0.4, 1], [-1, 0.4], [-1, -0.6], [-0.6, -1], [0.6, -1], [1, -0.6], [1, -0.2], [0.6, 0.1], [-1, 0.1]]],
  "7": [[[-1, 1], [1, 1], [-0.2, -1]]],
  "8": [[[-0.6, 0], [-1, 0.5], [-0.6, 1], [0.6, 1], [1, 0.5], [0.6, 0], [-0.6, 0], [-1, -0.5], [-0.6, -1], [0.6, -1], [1, -0.5], [0.6, 0]]],
  "9": [[[1, 0.1], [-0.6, 0.1], [-1, 0.5], [-0.6, 1], [0.6, 1], [1, 0.6], [1, -0.6], [0.6, -1], [-0.8, -1]]],
  "0": [[[-0.4, 1], [0.4, 1], [0.8, 0.5], [0.8, -0.5], [0.4, -1], [-0.4, -1], [-0.8, -0.5], [-0.8, 0.5], [-0.4, 1]]],
  "-": [[[-0.6, 0], [0.6, 0]]],
  ";": [[[0, 0.5], [0, 0.25]], [[0, -0.3], [-0.25, -1]]],
  ",": [[[0.1, -0.4], [-0.2, -1]]],
  ".": [[[0, -0.75], [0, -1]]],
  "/": [[[1, 1], [-1, -1]]],
  "^": [[[0, -1], [0, 1]], [[-0.7, 0.3], [0, 1], [0.7, 0.3]]],
};

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  const body = b.joint("body", { at: [0, 0, 0] });

  const put = (geo: THREE.BufferGeometry, color: string, at: number[], bone: any = body) =>
    b.part(geo, color, { at: [at[0], at[1], at[2]], bone });

  const cyl = (r: number, h: number, seg: number) => new THREE.CylinderGeometry(r, r, h, seg, 1);

  const rod = (a: number[], c: number[], r: number, color: string, seg = 6, ext = r) => {
    const A = new THREE.Vector3(a[0], a[1], a[2]);
    const B = new THREE.Vector3(c[0], c[1], c[2]);
    const d = B.clone().sub(A);
    const len = d.length();
    if (len < 1e-7) return;
    d.normalize();
    const geo = cyl(r, len + 2 * ext, seg);
    const axis = new THREE.Vector3(0, 1, 0).cross(d);
    if (axis.length() > 1e-6) {
      geo.applyQuaternion(
        new THREE.Quaternion().setFromAxisAngle(axis.normalize(), Math.acos(THREE.MathUtils.clamp(d.y, -1, 1)))
      );
    } else if (d.y < 0) geo.rotateX(Math.PI);
    const m = A.add(B).multiplyScalar(0.5);
    put(geo, color, [m.x, m.y, m.z]);
  };

  const glyph = (ch: string, map: (x: number, y: number) => number[], r: number, color: string) => {
    const g = FONT[ch];
    if (!g) return;
    for (const pl of g)
      for (let i = 0; i < pl.length - 1; i++) rod(map(pl[i][0], pl[i][1]), map(pl[i + 1][0], pl[i + 1][1]), r, color, 4);
  };

  const r0: any = rng(1930);
  const rand = (): number => {
    let v: any;
    if (typeof r0 === "function") v = r0();
    else for (const k of ["next", "float", "random", "value"]) if (typeof r0?.[k] === "function") { v = r0[k](); break; }
    return typeof v === "number" ? v : 0.5;
  };

  // ---------------- Body shell ----------------
  const prof = [[0.155, 0.012], [0.155, 0.046], [0.036, 0.1], [-0.146, 0.1], [-0.146, 0.012]];
  const shape = new THREE.Shape(prof.map(([z, y]) => new THREE.Vector2(-z, y)));
  const bodyGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.28, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1, curveSegments: 1,
  });
  bodyGeo.rotateY(Math.PI / 2);
  bodyGeo.translate(-0.14, 0, 0);
  put(bodyGeo, C.green, [0, 0, 0]);

  const deckTop = (z: number) => 0.046 + ((0.155 - z) / 0.119) * 0.054 + 0.0044;
  const topY = 0.104;

  // rubber feet
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(cyl(0.014, 0.011, 10), C.rubber, [sx * 0.122, 0.0055, sz * 0.12]);

  // gold pinstripes on both flanks
  const stripe = [[0.149, 0.017], [0.149, 0.044], [0.038, 0.095], [-0.141, 0.095], [-0.141, 0.017], [0.149, 0.017]];
  for (const sx of [-1, 1]) {
    const x = sx * 0.1447;
    for (let i = 0; i < stripe.length - 1; i++)
      rod([x, stripe[i][1], stripe[i][0]], [x, stripe[i + 1][1], stripe[i + 1][0]], 0.0009, C.gold, 4);
  }
  // chrome trim along front edge
  rod([-0.142, 0.0505, 0.1595], [0.142, 0.0505, 0.1595], 0.0018, C.chrome, 6);

  // ---------------- Brass maker's badge ----------------
  const bz = 0.1595;
  const bo = cyl(0.011, 0.002, 18); bo.rotateX(Math.PI / 2); bo.scale(2.7, 1, 1);
  put(bo, C.brass, [0, 0.029, bz + 0.0008]);
  const bi = cyl(0.0088, 0.002, 18); bi.rotateX(Math.PI / 2); bi.scale(2.95, 1, 1);
  put(bi, C.greenDark, [0, 0.029, bz + 0.0016]);
  const word = "REGAL";
  word.split("").forEach((ch, i) => {
    const cx = (i - (word.length - 1) / 2) * 0.0068;
    glyph(ch, (gx, gy) => [cx + gx * 0.0022, 0.029 + gy * 0.0034, bz + 0.0028], 0.00045, C.brass);
  });
  for (const sx of [-1, 1]) {
    const rv = new THREE.SphereGeometry(0.0013, 6, 4);
    put(rv, C.brass, [sx * 0.0255, 0.029, bz + 0.0022]);
  }

  // ---------------- Keyboard ----------------
  const alpha = Math.atan2(0.054, 0.119);
  const wellGeo = new THREE.BoxGeometry(0.262, 0.002, 0.122);
  wellGeo.rotateX(alpha);
  put(wellGeo, C.well, [0, deckTop(0.095) + 0.0008, 0.095]);

  const key = (x: number, z: number, ch: string, R: number) => {
    const ky = deckTop(z) + 0.025;
    put(cyl(R, 0.003, 14), C.black, [x, ky, z]);
    put(cyl(R + 0.0006, 0.0018, 14), C.chrome, [x, ky - 0.0022, z]);
    const rim = new THREE.TorusGeometry(R + 0.0004, 0.0012, 5, 14);
    rim.rotateX(Math.PI / 2);
    put(rim, C.chrome, [x, ky + 0.0009, z]);
    rod([x, ky - 0.003, z], [x, deckTop(z - 0.01) - 0.003, z - 0.01], 0.0011, C.chrome, 5);
    glyph(ch, (gx, gy) => [x + gx * 0.0026, ky + 0.0017, z - gy * 0.0036], 0.00055, C.cream);
  };

  const rows = ["1234567890-", "QWERTYUIOP", "ASDFGHJKL;", "ZXCVBNM,./"];
  const rowZ = [0.055, 0.08, 0.105, 0.13];
  const rowOff = [-0.004, 0.0, 0.004, 0.009];
  rows.forEach((row, ri) => {
    const n = row.length;
    for (let i = 0; i < n; i++) key((i - (n - 1) / 2) * 0.019 + rowOff[ri], rowZ[ri], row[i], 0.0076);
  });
  // shift keys
  key(0.009 + 4.5 * 0.019 + 0.026, 0.13, "^", 0.0085);
  key(0.009 - 4.5 * 0.019 - 0.026, 0.13, "^", 0.0085);

  // space bar
  const sbz = 0.15, sby = deckTop(0.15) + 0.013;
  put(new THREE.BoxGeometry(0.17, 0.006, 0.011), C.chrome, [0, sby, sbz]);
  put(new THREE.BoxGeometry(0.162, 0.0016, 0.0075), C.black, [0, sby + 0.0034, sbz]);
  for (const sx of [-1, 1]) rod([sx * 0.07, sby - 0.003, sbz - 0.002], [sx * 0.07, deckTop(0.135) - 0.002, 0.135], 0.0013, C.chrome, 5);

  // ---------------- Type bar basket ----------------
  const bcz = -0.075, BR = 0.105;
  put(new THREE.CylinderGeometry(BR, BR, 0.003, 24, 1, false, -Math.PI / 2, Math.PI), C.well, [0, topY + 0.0005, bcz]);
  const halfTorus = (R: number, t: number) => {
    const g = new THREE.TorusGeometry(R, t, 5, 24, Math.PI);
    g.rotateX(Math.PI / 2);
    return g;
  };
  put(halfTorus(BR, 0.0025), C.chrome, [0, topY + 0.002, bcz]);
  put(halfTorus(0.092, 0.0028), C.felt, [0, topY + 0.004, bcz]);
  put(halfTorus(0.03, 0.004), C.chrome, [0, topY + 0.006, bcz]);
  const NB = 34;
  for (let k = 0; k < NB; k++) {
    const phi = (Math.PI * (k + 0.5)) / NB;
    const dx = Math.cos(phi), dz = Math.sin(phi);
    rod([dx * 0.03, topY + 0.007, bcz + dz * 0.03], [dx * 0.093, topY + 0.0075, bcz + dz * 0.093], 0.0009, C.chrome, 4);
    rod([dx * 0.093, topY + 0.0078, bcz + dz * 0.093], [dx * 0.1, topY + 0.0078, bcz + dz * 0.1], 0.0021, C.steel, 4);
  }

  // ribbon spools + two-tone ribbon
  for (const sx of [-1, 1]) {
    const x = sx * 0.122, z = -0.125;
    put(cyl(0.021, 0.007, 16), C.chrome, [x, topY + 0.0035, z]);
    put(cyl(0.017, 0.005, 14), C.black, [x, topY + 0.0095, z]);
    put(cyl(0.017, 0.005, 14), C.red, [x, topY + 0.0145, z]);
    put(cyl(0.004, 0.016, 8), C.chrome, [x, topY + 0.01, z]);
  }
  put(new THREE.BoxGeometry(0.244, 0.006, 0.0008), C.black, [0, 0.1165, -0.108]);
  put(new THREE.BoxGeometry(0.244, 0.006, 0.0008), C.red, [0, 0.1225, -0.108]);
  // ribbon vibrator / type guide
  put(new THREE.BoxGeometry(0.014, 0.018, 0.002), C.chrome, [0, 0.124, -0.1065]);
  put(new THREE.BoxGeometry(0.006, 0.006, 0.0025), C.steel, [0, 0.128, -0.1058]);

  // ---------------- Carriage ----------------
  for (const z of [-0.112, -0.148]) rod([-0.22, 0.109, z], [0.22, 0.109, z], 0.005, C.chrome, 8);
  for (const sx of [-1, 1]) put(new THREE.BoxGeometry(0.01, 0.06, 0.06), C.green, [sx * 0.205, 0.145, -0.13]);

  const platen = cyl(0.022, 0.4, 16); platen.rotateZ(Math.PI / 2);
  put(platen, C.black, [0, 0.148, -0.13]);
  rod([-0.25, 0.148, -0.13], [0.25, 0.148, -0.13], 0.004, C.chrome, 8);
  for (const sx of [-1, 1]) {
    const kn = cyl(0.019, 0.026, 14); kn.rotateZ(Math.PI / 2);
    put(kn, C.black, [sx * 0.224, 0.148, -0.13]);
    for (const off of [0.216, 0.232]) {
      const ring = new THREE.TorusGeometry(0.019, 0.0015, 4, 14);
      ring.rotateY(Math.PI / 2);
      put(ring, C.chrome, [sx * off, 0.148, -0.13]);
    }
    const cap = cyl(0.011, 0.006, 12); cap.rotateZ(Math.PI / 2);
    put(cap, C.chrome, [sx * 0.24, 0.148, -0.13]);
  }

  // margin scale with tick marks
  put(new THREE.BoxGeometry(0.34, 0.007, 0.0015), C.cream, [0, 0.1165, -0.1058]);
  for (let i = -16; i <= 16; i++) {
    const x = i * 0.01;
    if (Math.abs(x) < 0.008) continue;
    rod([x, 0.1135, -0.1049], [x, 0.1135 + (i % 5 === 0 ? 0.0045 : 0.0024), -0.1049], 0.00035, C.ink, 3, 0);
  }

  // paper sheet, half typed
  const t = (10 * Math.PI) / 180;
  const B0y = 0.166, B0z = -0.116;
  const upY = Math.cos(t), upZ = -Math.sin(t), nY = Math.sin(t), nZ = Math.cos(t);
  const P = (u: number, v: number, w: number) => [u, B0y + upY * v + nY * w, B0z + upZ * v + nZ * w];
  const paper = new THREE.BoxGeometry(0.216, 0.15, 0.0006); paper.rotateX(-t);
  put(paper, C.paper, P(0, 0.075, 0));

  const ink = (u0: number, w: number, v: number) => {
    const g = new THREE.BoxGeometry(w, 0.0026, 0.0004); g.rotateX(-t);
    put(g, C.ink, P(u0 + w / 2, v, 0.0005));
  };
  const fill = (u0: number, u1: number, v: number) => {
    let u = u0;
    while (u < u1) {
      let w = 0.005 + rand() * 0.016;
      if (u + w > u1) { if (u1 - u > 0.006) w = u1 - u; else break; }
      ink(u, w, v);
      u += w + 0.0035;
    }
  };
  const L = -0.085, Rm = 0.085;
  const lineV = (i: number) => 0.142 - i * 0.0085;
  fill(0.035, 0.08, lineV(0));
  fill(L, -0.045, lineV(2));
  for (let i = 4; i <= 8; i++) fill(i === 4 ? L + 0.015 : L, i === 8 ? 0.02 : Rm - rand() * 0.012, lineV(i));
  for (let i = 10; i <= 14; i++) fill(i === 10 ? L + 0.015 : L, Rm - rand() * 0.012, lineV(i));
  fill(L, 0, lineV(15));

  // paper bail with rollers
  const bail = P(0, 0.024, 0.006);
  rod([-0.19, bail[1], bail[2]], [0.19, bail[1], bail[2]], 0.0022, C.chrome, 8);
  for (const sx of [-1, 1]) {
    rod([sx * 0.19, bail[1], bail[2]], [sx * 0.203, 0.172, -0.115], 0.002, C.chrome, 6);
    const rl = cyl(0.0048, 0.012, 10); rl.rotateZ(Math.PI / 2);
    put(rl, C.black, [sx * 0.06, bail[1], bail[2]]);
  }

  // paper table behind the sheet
  const ta = 0.6;
  const table = new THREE.BoxGeometry(0.3, 0.1, 0.003); table.rotateX(-ta);
  const tb = [0, 0.15, -0.155];
  put(table, C.green, [0, tb[1] + Math.cos(ta) * 0.05, tb[2] - Math.sin(ta) * 0.05]);
  const tt = [tb[1] + Math.cos(ta) * 0.1, tb[2] - Math.sin(ta) * 0.1];
  rod([-0.15, tt[0], tt[1]], [0.15, tt[0], tt[1]], 0.0022, C.chrome, 6);
  for (const sx of [-1, 1]) rod([sx * 0.15, tb[1], tb[2]], [sx * 0.15, tt[0], tt[1]], 0.0014, C.gold, 4);

  // carriage return lever (typist's left, -X)
  const p0 = [-0.207, 0.177, -0.112], p1 = [-0.213, 0.216, -0.1], p2 = [-0.25, 0.223, -0.026];
  put(new THREE.BoxGeometry(0.012, 0.008, 0.016), C.chrome, [-0.205, 0.178, -0.114]);
  rod(p0, p1, 0.0034, C.chrome, 8);
  put(new THREE.SphereGeometry(0.0045, 10, 6), C.chrome, p1);
  rod(p1, p2, 0.0032, C.chrome, 8);
  put(new THREE.SphereGeometry(0.004, 10, 6), C.chrome, p2);
  const paddle = new THREE.BoxGeometry(0.034, 0.004, 0.016);
  paddle.rotateY(-0.35);
  put(paddle, C.chrome, [p2[0] - 0.013, p2[1], p2[2] + 0.004]);

  // ---------------- Finishes: glossy enamel, polished chrome and brass ----------------
  const finish: Record<string, [number, number]> = {
    [C.green]: [0.22, 0.12],
    [C.greenDark]: [0.3, 0.1],
    [C.chrome]: [0.22, 0.55],
    [C.brass]: [0.3, 0.6],
    [C.gold]: [0.32, 0.55],
    [C.black]: [0.35, 0.05],
    [C.steel]: [0.4, 0.4],
  };
  b.root.traverse((o: any) => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (m && m.isMeshStandardMaterial && !m.map && m.color) {
        const f = finish["#" + m.color.getHexString()];
        if (f) { m.roughness = f[0]; m.metalness = f[1]; }
      }
    }
  });

  return b.root;
}
```