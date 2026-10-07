```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Nine-banded Armadillo",
  description:
    "A stylized low-poly nine-banded armadillo in a neutral rest stance. It has a dusty pinkish-tan carapace: studded shoulder and hip shields with nine overlapping banded plates between them. It also has a pointy snout with a separate jaw, tall leathery ears, beady eyes, clawed feet, a ringed tapering tail and coarse pale hairs between the bands.",
};

type P = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "armadillo" });

  const R0: any = rng(9);
  const rand = (): number =>
    typeof R0 === "function" ? R0() : typeof R0.next === "function" ? R0.next() : R0.float();

  // ---------- palette ----------
  const C = {
    shield: "#a97f6c",
    shieldIn: "#6e4f45",
    studA: "#d8b29b",
    studB: "#cba28b",
    band: "#c39a85",
    bandAlt: "#b98e7a",
    tileA: "#dcb7a1",
    tileB: "#e3c2ad",
    rim: "#86625a",
    skin: "#dcaea2",
    skinDark: "#b98a80",
    belly: "#ecccc1",
    ear: "#b8877d",
    earIn: "#94625f",
    nose: "#7a4848",
    eye: "#140d0d",
    white: "#fbf6ef",
    claw: "#3f322c",
    hair: "#f3ead8",
  };

  // ---------- vector helpers ----------
  const sub = (a: P, c: P): P => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
  const add = (a: P, c: P): P => [a[0] + c[0], a[1] + c[1], a[2] + c[2]];
  const mul = (a: P, s: number): P => [a[0] * s, a[1] * s, a[2] * s];
  const len = (a: P) => Math.hypot(a[0], a[1], a[2]);
  const nrm = (a: P): P => mul(a, 1 / (len(a) || 1));
  const mid = (a: P, c: P): P => mul(add(a, c), 0.5);
  const lerpP = (a: P, c: P, t: number): P => add(a, mul(sub(c, a), t));

  const UP = new THREE.Vector3(0, 1, 0);
  function orient(g: THREE.BufferGeometry, d: P) {
    const v = new THREE.Vector3(d[0], d[1], d[2]).normalize();
    const ax = new THREE.Vector3().crossVectors(UP, v);
    const s = ax.length();
    const c = UP.dot(v);
    if (s < 1e-6) {
      if (c < 0) g.rotateX(Math.PI);
      return g;
    }
    ax.divideScalar(s);
    g.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(ax, Math.atan2(s, c)));
    return g;
  }
  const put = (g: THREE.BufferGeometry, color: string, at: P, bone: any) =>
    b.part(g, color, { at, bone });

  function seg(rA: number, rB: number, a: P, c: P, color: string, bone: any, n = 7) {
    const d = sub(c, a);
    const g = new THREE.CylinderGeometry(rB, rA, len(d), n);
    orient(g, d);
    put(g, color, mid(a, c), bone);
  }
  function ball(scale: P, at: P, color: string, bone: any, ws = 8, hs = 6) {
    const g = new THREE.SphereGeometry(1, ws, hs);
    g.scale(scale[0], scale[1], scale[2]);
    put(g, color, at, bone);
  }
  function ringT(R: number, tube: number, at: P, dir: P, color: string, bone: any, n = 12) {
    const g = new THREE.TorusGeometry(R, tube, 4, n);
    g.rotateX(-Math.PI / 2);
    orient(g, dir);
    put(g, color, at, bone);
  }
  function flipInside(g: THREE.BufferGeometry) {
    const idx = g.index;
    if (idx) {
      const arr = idx.array as any;
      for (let i = 0; i < arr.length; i += 3) {
        const t = arr[i + 1];
        arr[i + 1] = arr[i + 2];
        arr[i + 2] = t;
      }
      idx.needsUpdate = true;
    }
    const n = g.getAttribute("normal");
    if (n) {
      for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i));
      n.needsUpdate = true;
    }
    return g;
  }

  // ---------- skeleton ----------
  const J = (name: string, at: P, parent?: any) =>
    parent ? b.joint(name, { at, parent }) : b.joint(name, { at });

  const hips = J("hips", [0, 0.15, -0.08]);
  const spine = J("spine", [0, 0.155, 0.03], hips);
  const chest = J("chest", [0, 0.15, 0.12], spine);
  const neck = J("neck", [0, 0.148, 0.185], chest);
  const head = J("head", [0, 0.152, 0.222], neck);
  const jaw = J("jaw", [0, 0.135, 0.245], head);
  const snoutTip = J("snoutTip", [0, 0.137, 0.338], head);
  void snoutTip;

  const tailP = (t: number): P => [0, 0.132 - 0.06 * t - 0.02 * t * t, -0.2 - 0.34 * t];
  const tailJ: any[] = [];
  for (let k = 0; k <= 5; k++) tailJ.push(J("tail" + (k + 1), tailP(k / 5), k === 0 ? hips : tailJ[k - 1]));

  // ---------- shell ----------
  const SPAN = 4.1;
  const CY = 0.155;
  const Rz = (z: number) => {
    if (z > 0.06) {
      const t = (z - 0.06) / 0.13;
      return 0.105 - 0.035 * t * t;
    }
    if (z < -0.06) {
      const t = (-0.06 - z) / 0.15;
      return 0.105 - 0.027 * t * t;
    }
    return 0.105;
  };
  const cyz = (z: number) => {
    if (z > 0.06) {
      const t = (z - 0.06) / 0.13;
      return CY - 0.012 * t * t;
    }
    if (z < -0.06) {
      const t = (-0.06 - z) / 0.15;
      return CY - 0.006 * t * t;
    }
    return CY;
  };

  function shellSeg(zf: number, zb: number, rf: number, rb: number, cy: number, color: string, bone: any) {
    const h = zf - zb;
    const g = new THREE.CylinderGeometry(rf, rb, h, 18, 1, true, Math.PI - SPAN / 2, SPAN);
    g.rotateX(Math.PI / 2);
    put(g, color, [0, cy, (zf + zb) / 2], bone);
    const gi = new THREE.CylinderGeometry(rf * 0.955, rb * 0.955, h, 18, 1, true, Math.PI - SPAN / 2, SPAN);
    gi.rotateX(Math.PI / 2);
    flipInside(gi);
    put(gi, C.shieldIn, [0, cy, (zf + zb) / 2], bone);
  }
  function arcRim(R: number, tube: number, z: number, cy: number, color: string, bone: any) {
    const g = new THREE.TorusGeometry(R, tube, 4, 18, SPAN);
    g.rotateZ(Math.PI / 2 - SPAN / 2);
    put(g, color, [0, cy, z], bone);
  }
  function shellStud(geo: THREE.BufferGeometry, z: number, phi: number, r: number, cy: number, color: string, bone: any) {
    geo.rotateZ(-phi);
    put(geo, color, [r * Math.sin(phi), cy + r * Math.cos(phi), z], bone);
  }

  // shoulder (scapular) shield
  for (let k = 0; k < 5; k++) {
    const zb = 0.06 + k * 0.026;
    const zf = zb + 0.028;
    shellSeg(zf, zb, Rz(zf) + 0.004, Rz(zb) + 0.004, cyz((zf + zb) / 2), C.shield, chest);
  }
  arcRim(Rz(0.188) + 0.004, 0.003, 0.188, cyz(0.188), C.rim, chest);

  // hip (pelvic) shield
  for (let k = 0; k < 5; k++) {
    const zb = -0.21 + k * 0.03;
    const zf = zb + 0.032;
    shellSeg(zf, zb, Rz(zf) + 0.004, Rz(zb) + 0.004, cyz((zf + zb) / 2), C.shield, hips);
  }

  // shield studs (hex mosaic)
  const studRows = (z0: number, z1: number, step: number, bone: any) => {
    let row = 0;
    for (let z = z0; z <= z1 + 1e-6; z += step, row++) {
      const r = Rz(z) + 0.0062;
      const cy = cyz(z);
      const n = Math.floor((r * 3.8) / 0.019);
      for (let i = 0; i < n; i++) {
        const u = (i + (row % 2 ? 0.5 : 0)) / (n - (row % 2 ? 0 : 1));
        if (u > 1.001) continue;
        const phi = -1.9 + 3.8 * u;
        const g = new THREE.CylinderGeometry(0.0066, 0.0078, 0.004, 6);
        shellStud(g, z, phi, r, cy, rand() < 0.5 ? C.studA : C.studB, bone);
      }
    }
  };
  studRows(0.07, 0.18, 0.0155, chest);
  studRows(-0.2, -0.07, 0.0155, hips);

  // rear cap of the hip shield
  {
    const R = Rz(-0.21) + 0.004;
    const cy = cyz(-0.21);
    const g = new THREE.SphereGeometry(R, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    g.rotateX(-Math.PI / 2);
    g.scale(1, 1, 0.45);
    put(g, C.shield, [0, cy, -0.21], hips);
    arcRim(R, 0.003, -0.21, cy, C.rim, hips);
    for (const [rho, n] of [[0.04, 7], [0.064, 11]] as [number, number][]) {
      for (let i = 0; i < n; i++) {
        const phi = -1.85 + (3.7 * i) / (n - 1);
        const x = rho * Math.sin(phi);
        const y = rho * Math.cos(phi);
        const q = Math.sqrt(Math.max(0, 1 - (rho / R) ** 2));
        const zc = -0.21 - 0.45 * R * q - 0.0015;
        const dir = nrm([x / R, y / R, -Math.max(0.35, q)]);
        const sg = new THREE.CylinderGeometry(0.0062, 0.0074, 0.004, 6);
        orient(sg, dir);
        put(sg, rand() < 0.5 ? C.studA : C.studB, [x, cy + y, zc], hips);
      }
    }
  }

  // the nine movable bands, shingled front over back
  const BW = 0.12 / 9;
  const bandEdges: number[] = [];
  for (let i = 0; i < 9; i++) {
    const zf = 0.06 - i * BW;
    const zb = zf - BW - 0.003;
    const bone = i < 4 ? spine : spine;
    shellSeg(zf, zb, 0.105, 0.111, CY, i % 2 ? C.bandAlt : C.band, bone);
    arcRim(0.111, 0.0028, zb, CY, C.rim, bone);
    bandEdges.push(zb);
    // triangular-ish plate tiles along the band
    const n = 13;
    for (let k = 0; k < n; k++) {
      const phi = -1.85 + (3.7 * k) / (n - 1);
      const g = new THREE.BoxGeometry(0.011, 0.0035, BW * 0.72);
      g.rotateX(-0.06);
      shellStud(g, (zf + zb) / 2 + 0.001, phi, 0.1095, CY, (k + i) % 2 ? C.tileA : C.tileB, bone);
    }
  }

  // ---------- body ----------
  ball([0.09, 0.068, 0.205], [0, 0.14, -0.01], C.belly, spine, 14, 10);
  ball([0.042, 0.04, 0.036], [0, 0.148, 0.19], C.skin, neck);

  // ---------- head ----------
  ball([0.04, 0.036, 0.045], [0, 0.155, 0.228], C.skin, head, 10, 8);
  {
    const g = new THREE.SphereGeometry(1, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2);
    g.scale(0.033, 0.015, 0.044);
    put(g, C.shield, [0, 0.176, 0.232], head);
    for (const a of [-0.5, 0, 0.5]) {
      for (const c of [-0.6, -0.2, 0.2, 0.6]) {
        if (a * a + c * c > 0.8) continue;
        const y = 0.176 + 0.015 * Math.sqrt(1 - a * a - c * c) + 0.0012;
        const sg = new THREE.CylinderGeometry(0.0052, 0.006, 0.003, 6);
        orient(sg, nrm([a * 0.6, 1, c * 0.4]));
        put(sg, C.studA, [a * 0.033, y, 0.232 + c * 0.044], head);
      }
    }
  }
  // snout
  const sA: P = [0, 0.153, 0.25];
  const sB: P = [0, 0.137, 0.338];
  seg(0.026, 0.008, sA, sB, C.skin, head, 8);
  for (const t of [0.3, 0.5, 0.68, 0.84]) {
    const r = 0.026 + (0.008 - 0.026) * t;
    ringT(r + 0.0005, 0.0013, lerpP(sA, sB, t), sub(sB, sA), C.skinDark, head, 9);
  }
  ball([0.0095, 0.0085, 0.006], [0, 0.137, 0.339], C.nose, head, 7, 5);
  for (const s of [1, -1]) ball([0.0022, 0.0022, 0.002], [s * 0.0035, 0.1375, 0.3445], C.eye, head, 5, 4);
  // lower jaw (separate, opens on `jaw`)
  seg(0.016, 0.005, [0, 0.131, 0.25], [0, 0.124, 0.326], C.belly, jaw, 7);

  // eyes and ears
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eyeAt: P = [s * 0.029, 0.164, 0.258];
    ringT(0.0068, 0.0018, eyeAt, [s * 1, 0.15, 0.45], C.skinDark, head, 8);
    ball([0.0062, 0.0062, 0.0062], eyeAt, C.eye, head, 7, 5);
    ball([0.0019, 0.0019, 0.0019], add(eyeAt, [s * 0.0035, 0.003, 0.0035]), C.white, head, 5, 4);

    const earAt: P = [s * 0.027, 0.183, 0.214];
    const earJ = J("ear" + side, earAt, head);
    const dir = nrm([s * 0.42, 0.86, -0.28]);
    const g = new THREE.ConeGeometry(0.016, 0.052, 7);
    g.translate(0, 0.026, 0);
    g.scale(1, 1, 0.38);
    orient(g, dir);
    put(g, C.ear, earAt, earJ);
    const gi = new THREE.ConeGeometry(0.011, 0.04, 6);
    gi.translate(0, 0.022, 0);
    gi.scale(1, 1, 0.3);
    orient(gi, dir);
    put(gi, C.earIn, add(earAt, [0, 0.001, 0.0042]), earJ);
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front
    const sh: P = [s * 0.06, 0.115, 0.13];
    const el: P = [s * 0.068, 0.068, 0.125];
    const wr: P = [s * 0.07, 0.022, 0.14];
    const ha: P = [s * 0.072, 0.008, 0.168];
    const shJ = J("shoulder" + side, sh, chest);
    const elJ = J("elbow" + side, el, shJ);
    const wrJ = J("wrist" + side, wr, elJ);
    J("hand" + side, ha, wrJ);
    seg(0.023, 0.018, sh, el, C.skin, shJ, 8);
    ball([0.018, 0.018, 0.018], el, C.skin, elJ, 7, 5);
    seg(0.017, 0.013, el, wr, C.skinDark, elJ, 7);
    for (let k = 0; k < 3; k++) {
      const p = lerpP(el, wr, 0.22 + 0.26 * k);
      const r = 0.017 - 0.004 * (0.22 + 0.26 * k);
      put(new THREE.BoxGeometry(0.013, 0.008, 0.004), C.tileA, add(p, [0, 0, r]), elJ);
      const g2 = new THREE.BoxGeometry(0.004, 0.008, 0.012);
      put(g2, C.tileB, add(p, [s * r, 0, 0]), elJ);
    }
    ball([0.017, 0.01, 0.022], [s * 0.07, 0.01, 0.15], C.skinDark, wrJ, 7, 5);
    for (let i = 0; i < 4; i++) {
      const ox = s * (i - 1.5) * 0.0085;
      const L = i === 1 || i === 2 ? 0.03 : 0.022;
      const base: P = [s * 0.07 + ox, 0.011, 0.164];
      const tip: P = add(base, [ox * 0.3, -0.0095, L]);
      seg(0.0036, 0.0005, base, tip, C.claw, wrJ, 5);
    }

    // hind
    const hp: P = [s * 0.062, 0.115, -0.13];
    const kn: P = [s * 0.07, 0.07, -0.105];
    const an: P = [s * 0.07, 0.022, -0.135];
    const ft: P = [s * 0.072, 0.008, -0.09];
    const hpJ = J("hip" + side, hp, hips);
    const knJ = J("knee" + side, kn, hpJ);
    const anJ = J("ankle" + side, an, knJ);
    J("foot" + side, ft, anJ);
    seg(0.028, 0.02, hp, kn, C.skin, hpJ, 8);
    ball([0.02, 0.02, 0.02], kn, C.skin, knJ, 7, 5);
    seg(0.019, 0.014, kn, an, C.skinDark, knJ, 7);
    for (let k = 0; k < 3; k++) {
      const t = 0.22 + 0.26 * k;
      const p = lerpP(kn, an, t);
      const r = 0.019 - 0.005 * t;
      put(new THREE.BoxGeometry(0.004, 0.008, 0.013), C.tileA, add(p, [s * r, 0, 0]), knJ);
    }
    ball([0.019, 0.011, 0.033], [s * 0.071, 0.011, -0.118], C.skinDark, anJ, 7, 5);
    for (let i = 0; i < 5; i++) {
      const ox = s * (i - 2) * 0.0072;
      const base: P = [s * 0.071 + ox, 0.01, -0.09];
      const tip: P = add(base, [ox * 0.25, -0.0085, 0.016 + (i === 2 ? 0.004 : 0)]);
      seg(0.003, 0.0005, base, tip, C.claw, anJ, 5);
    }
  }

  // ---------- tail ----------
  const rr = (t: number) => 0.043 * (1 - t) + 0.005;
  const N = 12;
  const TEND = 0.93;
  for (let i = 0; i < N; i++) {
    const t0 = (i * TEND) / N;
    const t1 = t0 + TEND / N + 0.012;
    const a = tailP(t0);
    const c = tailP(t1);
    const bone = tailJ[Math.min(4, Math.floor(((t0 + t1) / 2) * 5))];
    const r = rr(t0);
    seg(r * 0.86, r, a, c, i % 2 ? C.bandAlt : C.band, bone, 10);
    ringT(r, 0.0022, c, sub(c, a), C.rim, bone, 10);
    const m = mid(a, c);
    for (const psi of [-1.6, -0.8, 0, 0.8, 1.6]) {
      const g = new THREE.BoxGeometry(0.0065, 0.003, len(sub(c, a)) * 0.55);
      g.rotateZ(-psi);
      put(g, (i + Math.round(psi * 2)) % 2 ? C.tileA : C.tileB, add(m, [r * 0.94 * Math.sin(psi), r * 0.94 * Math.cos(psi), 0]), bone);
    }
  }
  seg(rr(TEND) * 0.95, 0.0007, tailP(TEND), tailP(1.04), C.band, tailJ[4], 7);

  // ---------- coarse pale hairs ----------
  function hair(base: P, dir: P, L: number, bone: any) {
    const g = new THREE.CylinderGeometry(0.0003, 0.001, L, 3);
    g.translate(0, L / 2, 0);
    orient(g, nrm(dir));
    put(g, C.hair, base, bone);
  }
  // between the bands
  for (let k = 0; k < 64; k++) {
    const i = Math.floor(rand() * 9);
    const z = bandEdges[i] + 0.002;
    const phi = -1.9 + 3.8 * rand();
    const r = 0.108;
    hair(
      [r * Math.sin(phi), CY + r * Math.cos(phi), z],
      [Math.sin(phi) + (rand() - 0.5) * 0.4, Math.cos(phi), -0.45 + (rand() - 0.5) * 0.3],
      0.012 + rand() * 0.012,
      spine,
    );
  }
  // fringe along the lower shell edge
  for (let k = 0; k < 34; k++) {
    const z = -0.2 + 0.38 * rand();
    const s = rand() < 0.5 ? 1 : -1;
    const phi = s * (SPAN / 2 - 0.05);
    const r = Rz(z) + 0.002;
    hair(
      [r * Math.sin(phi), cyz(z) + r * Math.cos(phi), z],
      [s * 0.55, -1, (rand() - 0.5) * 0.4],
      0.014 + rand() * 0.012,
      z > 0.06 ? chest : z < -0.06 ? hips : spine,
    );
  }
  // belly
  for (let k = 0; k < 18; k++) {
    const z = -0.15 + 0.27 * rand();
    const s = rand() < 0.5 ? 1 : -1;
    const ang = 0.35 + 0.6 * rand();
    const zt = (z + 0.01) / 0.205;
    const q = Math.sqrt(Math.max(0, 1 - zt * zt));
    const base: P = [s * 0.09 * q * Math.sin(ang), 0.14 - 0.068 * q * Math.cos(ang), z];
    hair(base, [s * Math.sin(ang), -Math.cos(ang), (rand() - 0.5) * 0.3], 0.01 + rand() * 0.01, spine);
  }
  // tail sprinkle
  for (let k = 0; k < 10; k++) {
    const t = 0.05 + 0.75 * rand();
    const psi = (rand() - 0.5) * 3.4;
    const r = rr(t);
    const p = tailP(t);
    hair(
      add(p, [r * Math.sin(psi), r * Math.cos(psi), 0]),
      [Math.sin(psi), Math.cos(psi), -0.5],
      0.008 + rand() * 0.008,
      tailJ[Math.min(4, Math.floor(t * 5))],
    );
  }

  return b.root;
}
```