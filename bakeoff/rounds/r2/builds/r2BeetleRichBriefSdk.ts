import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Stag Beetle on Mossy Log",
  description:
    "A proud stag beetle with a mirror-glossy chestnut wing case, branched antler jaws, elbowed feathery antennae, six spiny legs and a dewdrop, perched on a mossy log.",
};

export default function build() {
  const b = createBuilder({ name: "stagBeetle" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 0.2, 0] });
  const body = b.joint("body", { at: [0, 0.245, -0.03], parent: root });
  const thorax = b.joint("thorax", { at: [0, 0.243, 0.045], parent: body });
  const head = b.joint("head", { at: [0, 0.245, 0.075], parent: thorax, role: "head" });
  const jawL = b.joint("jawL", { at: [0.017, 0.245, 0.088], parent: head, role: "jaw" });
  const jawR = b.joint("jawR", { at: [-0.017, 0.245, 0.088], parent: head, role: "jaw" });
  const antL = b.joint("antennaL", { at: [0.02, 0.25, 0.092], parent: head, role: "digit" });
  const antR = b.joint("antennaR", { at: [-0.02, 0.25, 0.092], parent: head, role: "digit" });

  // ---------- helpers ----------
  const up = V(0, 1, 0);
  const ell = (c: number[], r: number[], color: string, bone: any, seg = 10) => {
    const g = new THREE.SphereGeometry(1, seg, Math.max(5, seg - 3));
    g.applyMatrix4(new THREE.Matrix4().compose(V(c[0], c[1], c[2]), new THREE.Quaternion(), V(r[0], r[1], r[2])));
    b.part(g, color, { at: [0, 0, 0], bone });
  };
  const segm = (a: number[], c: number[], r1: number, r2: number, color: string, bone: any, rad = 6) => {
    const A = V(a[0], a[1], a[2]);
    const B = V(c[0], c[1], c[2]);
    const d = B.clone().sub(A);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r2, r1, len, rad, 1);
    const q = new THREE.Quaternion().setFromUnitVectors(up, d.clone().normalize());
    g.applyMatrix4(new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), q, V(1, 1, 1)));
    b.part(g, color, { at: [0, 0, 0], bone });
  };

  // ---------- log ----------
  const logR = 0.1, logL = 0.52;
  {
    const g = new THREE.CylinderGeometry(logR, logR * 1.03, logL, 11, 1);
    g.rotateX(Math.PI / 2);
    g.translate(0, logR, 0);
    b.part(g, "#4a3321", { at: [0, 0, 0], bone: root });
    for (const s of [-1, 1]) {
      const e = new THREE.CylinderGeometry(logR * 0.9, logR * 0.9, 0.006, 11);
      e.rotateX(Math.PI / 2);
      e.translate(0, logR, s * (logL / 2 + 0.001));
      b.part(e, "#c9a36a", { at: [0, 0, 0], bone: root });
      const ring = new THREE.CylinderGeometry(logR * 0.55, logR * 0.55, 0.008, 11);
      ring.rotateX(Math.PI / 2);
      ring.translate(0, logR, s * (logL / 2 + 0.002));
      b.part(ring, "#a67c46", { at: [0, 0, 0], bone: root });
      const core = new THREE.CylinderGeometry(logR * 0.2, logR * 0.2, 0.01, 8);
      core.rotateX(Math.PI / 2);
      core.translate(0, logR, s * (logL / 2 + 0.003));
      b.part(core, "#7a5530", { at: [0, 0, 0], bone: root });
    }
  }
  // bark ridges and moss (deterministic)
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 26; i++) {
    const a = rnd() * Math.PI * 2;
    const z = (rnd() - 0.5) * logL * 0.95;
    const r = logR + 0.002;
    const g = new THREE.BoxGeometry(0.012 + rnd() * 0.01, 0.01, 0.05 + rnd() * 0.06);
    const m = new THREE.Matrix4().compose(
      V(Math.sin(a) * r, logR + Math.cos(a) * r, z),
      new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), -a),
      V(1, 1, 1)
    );
    g.applyMatrix4(m);
    b.part(g, i % 3 === 0 ? "#2f2015" : "#5e442d", { at: [0, 0, 0], bone: root });
  }
  const mossSpots = [
    [0.03, -0.17, 1], [-0.045, -0.1, 1], [0.05, 0.14, 1], [-0.02, 0.2, 1], [-0.07, 0.05, 1],
    [0.075, -0.05, 1], [0.0, -0.24, 1], [0.06, 0.24, 1], [-0.085, -0.2, 1],
  ];
  mossSpots.forEach(([x, z], i) => {
    const y = logR + Math.sqrt(Math.max(0.0001, logR * logR - x * x));
    const s = 0.018 + rnd() * 0.014;
    ell([x, y - 0.002, z], [s, s * 0.45, s * 1.2], i % 2 ? "#4f7a2c" : "#3d6322", root, 7);
    ell([x + 0.006, y + 0.003, z + 0.008], [s * 0.5, s * 0.3, s * 0.6], "#7aa645", root, 6);
  });
  // tiny mushrooms
  for (const [x, z] of [[-0.09, 0.12], [0.085, -0.2]]) {
    const y = logR + Math.sqrt(logR * logR - x * x);
    segm([x, y - 0.005, z], [x, y + 0.02, z], 0.004, 0.003, "#e8dcc0", root);
    ell([x, y + 0.022, z], [0.011, 0.006, 0.011], "#c0502e", root, 8);
  }

  // ---------- body ----------
  const cy = 0.245, cz = -0.03, rx = 0.03, ry = 0.022, rz = 0.055;
  ell([0, cy, cz], [rx, ry, rz], "#7a2c10", body, 14); // glossy chestnut elytra
  ell([0, cy - 0.006, cz - 0.004], [rx * 0.97, ry * 0.85, rz * 1.0], "#8f3813", body, 12);
  ell([0, cy - 0.012, cz - 0.01], [0.025, 0.013, 0.05], "#1b1410", body, 10); // underside
  const elySurf = (x: number, z: number) => {
    const t = 1 - (x / rx) ** 2 - ((z - cz) / rz) ** 2;
    return cy + ry * Math.sqrt(Math.max(0.01, t));
  };
  for (let i = 0; i < 9; i++) {
    const z = cz + 0.045 - i * 0.0105;
    ell([0, elySurf(0, z) - 0.0005, z], [0.0014, 0.0016, 0.0065], "#2a0f06", body, 5);
  }
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const z = cz + 0.02 - i * 0.015;
      const x = sx * (0.015 - i * 0.0012);
      ell([x, elySurf(x, z) + 0.0004, z], [0.004 - i * 0.0005, 0.0012, 0.009], "#ffd9a8", body, 6);
    }
    ell([sx * 0.022, elySurf(sx * 0.022, cz - 0.03) + 0.0002, cz - 0.03], [0.0025, 0.001, 0.01], "#ffc78a", body, 5);
    // dark edge trim
    ell([sx * 0.0285, cy - 0.003, cz], [0.0025, 0.009, rz * 0.93], "#3a1407", body, 8);
  }
  // abdomen tip
  ell([0, cy - 0.004, cz - 0.052], [0.02, 0.015, 0.012], "#1b1410", body, 8);

  // thorax + head (black)
  ell([0, 0.243, 0.045], [0.032, 0.018, 0.02], "#16120f", thorax, 12);
  ell([0, 0.254, 0.047], [0.02, 0.006, 0.012], "#3a342f", thorax, 8); // sheen
  ell([0, 0.243, 0.028], [0.022, 0.014, 0.006], "#16120f", thorax, 8);
  ell([0, 0.245, 0.077], [0.03, 0.015, 0.014], "#0f0c0a", head, 12);
  ell([0, 0.244, 0.09], [0.022, 0.012, 0.008], "#0f0c0a", head, 8);
  for (const sx of [-1, 1]) {
    ell([sx * 0.027, 0.249, 0.082], [0.006, 0.006, 0.007], "#d9a14a", head, 8);
    ell([sx * 0.0285, 0.2505, 0.0835], [0.002, 0.002, 0.002], "#000000", head, 5);
  }

  // ---------- mandibles ----------
  for (const sx of [1, -1]) {
    const jb = sx > 0 ? jawL : jawR;
    const P = [
      [0.017, 0.245, 0.088],
      [0.03, 0.248, 0.108],
      [0.032, 0.254, 0.13],
      [0.022, 0.26, 0.15],
      [0.008, 0.262, 0.163],
    ].map((p) => [p[0] * sx, p[1], p[2]]);
    const R = [0.0085, 0.0075, 0.0062, 0.0048, 0.0014];
    for (let i = 0; i < 4; i++) segm(P[i], P[i + 1], R[i], R[i + 1], "#7c2f17", jb, 7);
    for (let i = 1; i < 4; i++) ell(P[i], [R[i] * 1.05, R[i] * 1.05, R[i] * 1.05], "#8a3619", jb, 7);
    // branch tines
    const tines: number[][][] = [
      [P[1], [0.04 * sx, 0.268, 0.122]],
      [P[2], [0.044 * sx, 0.275, 0.14]],
      [P[3], [0.012 * sx, 0.278, 0.158]],
    ];
    tines.forEach((t, i) => {
      const mid = [
        (t[0][0] + t[1][0]) / 2 + 0.002 * sx,
        (t[0][1] + t[1][1]) / 2 + 0.002,
        (t[0][2] + t[1][2]) / 2,
      ];
      segm(t[0], mid, 0.0045 - i * 0.0004, 0.0032, "#9a4120", jb, 5);
      segm(mid, t[1], 0.0032, 0.0008, "#b4552b", jb, 5);
    });
    // inner tooth
    segm([0.014 * sx, 0.247, 0.1], [0.005 * sx, 0.25, 0.112], 0.0035, 0.0007, "#b4552b", jb, 5);
    if (sx > 0) {
      // dewdrop clinging under the upper tine
      const tip = tines[1][1];
      ell([tip[0] - 0.001, tip[1] - 0.006, tip[2] + 0.001], [0.0055, 0.0065, 0.0055], "#bfe6f7", jb, 10);
      ell([tip[0] + 0.001, tip[1] - 0.004, tip[2] + 0.004], [0.0016, 0.002, 0.0012], "#ffffff", jb, 5);
    }
  }

  // ---------- antennae ----------
  for (const sx of [1, -1]) {
    const ab = sx > 0 ? antL : antR;
    const a0 = [0.02 * sx, 0.25, 0.092];
    const a1 = [0.034 * sx, 0.253, 0.108];
    const a2 = [0.046 * sx, 0.264, 0.124];
    segm(a0, a1, 0.0022, 0.0018, "#1c1612", ab, 5);
    ell(a1, [0.0026, 0.0026, 0.0026], "#2a211b", ab, 5);
    segm(a1, a2, 0.0018, 0.0014, "#1c1612", ab, 5);
    for (let i = 0; i < 5; i++) {
      const ang = (i - 2) * 0.38;
      const d = [Math.sin(ang) * 0.6 * sx + 0.3 * sx, 0.55 * Math.cos(ang * 0.5), 0.8];
      const l = Math.hypot(d[0], d[1], d[2]);
      const e = [a2[0] + (d[0] / l) * 0.016, a2[1] + (d[1] / l) * 0.016, a2[2] + (d[2] / l) * 0.016];
      segm(a2, e, 0.0022, 0.0006, i % 2 ? "#6b3a1c" : "#8a4b24", ab, 4);
    }
  }

  // ---------- legs ----------
  const surfY = (x: number) => logR + Math.sqrt(Math.max(0.0001, logR * logR - x * x));
  const rows = [
    { z: 0.055, kz: 0.045, fz: 0.082, kx: 0.05, fx: 0.07 },
    { z: 0.0, kz: 0.0, fz: 0.0, kx: 0.062, fx: 0.082 },
    { z: -0.048, kz: -0.058, fz: -0.088, kx: 0.054, fx: 0.07 },
  ];
  rows.forEach((r, i) => {
    for (const sx of [1, -1]) {
      const sfx = sx > 0 ? "L" : "R";
      const n = i + 1;
      const hip = [0.024 * sx, 0.232, r.z];
      const knee = [r.kx * sx, 0.268, r.kz];
      const fx = r.fx * sx;
      const foot = [fx, surfY(fx) - 0.001, r.fz];
      const hipJ = b.joint(`hip${sfx}${n}`, { at: hip, parent: body, role: "leg" });
      const kneeJ = b.joint(`knee${sfx}${n}`, { at: knee, parent: hipJ, role: "leg" });
      const ankleJ = b.joint(`ankle${sfx}${n}`, { at: foot, parent: kneeJ, role: "leg" });
      ell(hip, [0.007, 0.007, 0.007], "#16120f", hipJ, 6);
      segm(hip, knee, 0.0058, 0.0048, "#17130f", hipJ, 6);
      ell(knee, [0.0058, 0.0058, 0.0058], "#251d17", kneeJ, 6);
      segm(knee, foot, 0.0046, 0.0022, "#17130f", kneeJ, 6);
      // spines along tibia
      for (let k = 1; k <= 3; k++) {
        const t = k / 4;
        const p = [
          knee[0] + (foot[0] - knee[0]) * t,
          knee[1] + (foot[1] - knee[1]) * t,
          knee[2] + (foot[2] - knee[2]) * t,
        ];
        segm(p, [p[0] + 0.006 * sx, p[1] + 0.004, p[2] + 0.004 * (k % 2 ? 1 : -1)], 0.0014, 0.0004, "#3a2a20", kneeJ, 4);
      }
      // claws gripping the bark
      const fwd = r.fz >= 0 ? 1 : -1;
      for (const c of [-1, 0, 1]) {
        segm(
          [foot[0], foot[1] + 0.001, foot[2]],
          [foot[0] + 0.004 * sx, foot[1] - 0.002, foot[2] + 0.008 * fwd + c * 0.005],
          0.0016,
          0.0005,
          "#2e231b",
          ankleJ,
          4
        );
      }
    }
  });

  return b.root;
}
