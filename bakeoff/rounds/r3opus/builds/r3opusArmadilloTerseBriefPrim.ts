import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Nine-Banded Armadillo",
  description:
    "A stylized low-poly nine-banded armadillo: faceted pelvic and scapular shields tiled with hex scutes, nine ridged bands with bristles, ringed armoured tail, long snout with a separate lower jaw, leaf ears and digging claws. Rigged in a neutral rest pose.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "armadillo" });

  const R: any = rng(1909);
  const rand = (): number =>
    typeof R === "function" ? R() : typeof R.next === "function" ? R.next() : R.random();

  // ---------- small vector helpers ----------
  const n3 = (v: V): V => {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  };
  const addS = (p: V, d: V, s: number): V => [p[0] + d[0] * s, p[1] + d[1] * s, p[2] + d[2] * s];
  const sub = (p: V, q: V): V => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
  const lerpV = (p: V, q: V, t: number): V => [
    p[0] + (q[0] - p[0]) * t,
    p[1] + (q[1] - p[1]) * t,
    p[2] + (q[2] - p[2]) * t,
  ];
  const dist = (p: V, q: V) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);

  // ---------- palette ----------
  const C = {
    shield: "#a98a62",
    bandA: "#9f7e57",
    bandB: "#bf9f74",
    seam: "#4a3526",
    tileA: "#d6bb8c",
    tileB: "#bc9c70",
    tileBand: "#e2caa0",
    belly: "#e2b3a0",
    skin: "#c99282",
    legs: "#8f7a63",
    legScaleA: "#a68e73",
    legScaleB: "#7a6652",
    claw: "#3a2e27",
    nose: "#7a4a44",
    eye: "#17110f",
    shine: "#ffffff",
    earIn: "#e09c90",
    hair: "#efe3c9",
  };

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.15, -0.1] });
  const spine = b.joint("spine", { at: [0, 0.155, 0.0], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.15, 0.1], parent: spine });
  const neck = b.joint("neck", { at: [0, 0.14, 0.2], parent: chest });
  const head = b.joint("head", { at: [0, 0.14, 0.255], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.122, 0.3], parent: head });

  const tailPts: V[] = [
    [0, 0.13, -0.26],
    [0, 0.118, -0.32],
    [0, 0.104, -0.38],
    [0, 0.09, -0.44],
    [0, 0.078, -0.5],
    [0, 0.068, -0.555],
  ];
  const tailJ: any[] = [];
  tailPts.forEach((p, i) => {
    tailJ.push(b.joint(`tail${i + 1}`, { at: p, parent: i === 0 ? hips : tailJ[i - 1] }));
  });

  // ---------- part helpers ----------
  const put = (geo: THREE.BufferGeometry, color: string, at: V, bone: any, dir?: V) =>
    dir ? b.part(geo, color, { at, bone, dir: n3(dir) }) : b.part(geo, color, { at, bone });

  // a tapered rod from p (radius rp) to q (radius rq)
  const rod = (p: V, q: V, rp: number, rq: number, color: string, bone: any, seg = 7) => {
    const g = new THREE.CylinderGeometry(rp, rq, dist(p, q), seg);
    put(g, color, lerpV(p, q, 0.5), bone, sub(p, q));
  };
  const ball = (r: number, sx: number, sy: number, sz: number, ws = 8, hs = 6) =>
    new THREE.SphereGeometry(r, ws, hs).scale(sx, sy, sz);

  // ---------- carapace ----------
  const CY = 0.15;
  const SK = 0.625 * Math.PI; // shell reaches this far round from the top on each side
  const TILE_SP = 0.024;

  const shellCyl = (z0: number, z1: number, r: number, color: string, bone: any) => {
    const g = new THREE.CylinderGeometry(r, r, z1 - z0, 14, 1, true, 0.375 * Math.PI, 1.25 * Math.PI);
    g.rotateX(Math.PI / 2);
    put(g, color, [0, CY, (z0 + z1) / 2], bone);
  };
  const shellCap = (zc: number, r: number, front: boolean, color: string, bone: any) => {
    const g = new THREE.SphereGeometry(r, 14, 6, front ? -1.125 * Math.PI : -0.125 * Math.PI, 1.25 * Math.PI, 0, Math.PI / 2);
    g.rotateX(front ? Math.PI / 2 : -Math.PI / 2);
    put(g, color, [0, CY, zc], bone);
  };
  const tile = (p: V, n: V, size: number, color: string, bone: any) => {
    const g = new THREE.CylinderGeometry(size, size * 1.15, 0.005, 6);
    put(g, color, addS(p, n, 0.0012), bone, n);
  };
  const cylTiles = (z0: number, z1: number, r: number, bone: any) => {
    const rows = Math.max(1, Math.floor((z1 - z0) / TILE_SP));
    for (let j = 0; j < rows; j++) {
      const z = z0 + ((j + 0.5) * (z1 - z0)) / rows;
      const span = 2 * 0.6 * Math.PI;
      const n = Math.round((span * r) / TILE_SP);
      for (let k = 0; k < n; k++) {
        const a = -0.6 * Math.PI + ((k + (j % 2 ? 0.25 : 0.75)) / n) * span;
        const nrm: V = [Math.sin(a), Math.cos(a), 0];
        const p: V = [r * nrm[0], CY + r * nrm[1], z];
        tile(p, nrm, 0.0098 + rand() * 0.0012, j % 2 ? C.tileA : C.tileB, bone);
      }
    }
  };
  const capTiles = (zc: number, r: number, sign: number, bone: any) => {
    for (let i = 0; i < 8; i++) {
      const beta = 0.1 + i * (TILE_SP / r);
      if (beta > 1.38) break;
      const span = 2 * 0.6 * Math.PI;
      const n = Math.max(3, Math.round((span * r * Math.cos(beta)) / TILE_SP));
      for (let k = 0; k < n; k++) {
        const a = -0.6 * Math.PI + ((k + (i % 2 ? 0.25 : 0.75)) / n) * span;
        const nrm: V = [Math.sin(a) * Math.cos(beta), Math.cos(a) * Math.cos(beta), sign * Math.sin(beta)];
        const p: V = [r * nrm[0], CY + r * nrm[1], zc + r * nrm[2]];
        const size = (0.0098 + rand() * 0.0012) * (0.75 + 0.25 * Math.cos(beta));
        tile(p, nrm, size, i % 2 ? C.tileA : C.tileB, bone);
      }
    }
  };

  // pelvic shield
  const PR = 0.13;
  const pelZ0 = -0.16;
  const bandZ0 = -0.075;
  const bandZ1 = 0.085;
  shellCyl(pelZ0, bandZ0, PR, C.shield, hips);
  shellCap(pelZ0, PR, false, C.shield, hips);
  cylTiles(pelZ0, bandZ0, PR, hips);
  capTiles(pelZ0, PR, -1, hips);

  // scapular shield
  const SR = 0.128;
  const scaZ1 = 0.125;
  shellCyl(bandZ1, scaZ1, SR, C.shield, chest);
  shellCap(scaZ1, SR, true, C.shield, chest);
  cylTiles(bandZ1, scaZ1, SR, chest);
  capTiles(scaZ1, SR, 1, chest);

  // nine bands
  const NB = 9;
  const bw = (bandZ1 - bandZ0) / NB;
  for (let i = 0; i < NB; i++) {
    const z0 = bandZ0 + i * bw;
    const z1 = z0 + bw;
    const zc = (z0 + z1) / 2;
    const r = i % 2 ? 0.134 : 0.137;
    const bone = zc < -0.04 ? hips : zc > 0.05 ? chest : spine;
    shellCyl(z0, z1, r, i % 2 ? C.bandB : C.bandA, bone);
    // a row of small pale scutes on each band
    const n = 13;
    for (let k = 0; k < n; k++) {
      const a = -0.58 * Math.PI + ((k + 0.5) / n) * 1.16 * Math.PI;
      const nrm: V = [Math.sin(a), Math.cos(a), 0];
      const g = new THREE.CylinderGeometry(0.0058, 0.0066, 0.004, 5);
      put(g, C.tileBand, [r * nrm[0] + nrm[0] * 0.001, CY + r * nrm[1] + nrm[1] * 0.001, zc], bone, nrm);
    }
  }
  // dark seams between bands + bristles poking out at the skirt
  for (let i = 0; i <= NB; i++) {
    const z = bandZ0 + i * bw;
    const bone = z < -0.04 ? hips : z > 0.05 ? chest : spine;
    const g = new THREE.TorusGeometry(0.1375, 0.0032, 4, 22, 1.25 * Math.PI);
    g.rotateZ(-0.125 * Math.PI);
    put(g, C.seam, [0, CY, z], bone);
    for (const s of [1, -1]) {
      const a = s * 0.61 * Math.PI;
      const p: V = [0.137 * Math.sin(a), CY + 0.137 * Math.cos(a), z];
      const d = n3([s * 0.45, -1, (rand() - 0.5) * 0.3]);
      const h = new THREE.CylinderGeometry(0.0006, 0.0013, 0.03, 3);
      put(h, C.hair, addS(p, d, 0.014), bone, d);
    }
  }

  // soft body underneath
  put(ball(1, 0.108, 0.08, 0.26, 12, 8), C.belly, [0, 0.135, -0.02], spine);
  // sparse belly hair
  for (let i = 0; i < 30; i++) {
    const t = -0.75 + rand() * 1.5;
    const ph = (rand() - 0.5) * 2.0;
    const s = Math.sqrt(1 - t * t);
    const p: V = [0.108 * Math.sin(ph) * s, 0.135 - 0.08 * Math.cos(ph) * s, -0.02 + 0.26 * t];
    const d = n3([Math.sin(ph), -Math.cos(ph) - 0.4, (rand() - 0.5) * 0.4]);
    const bone = p[2] < -0.05 ? hips : p[2] > 0.07 ? chest : spine;
    put(new THREE.CylinderGeometry(0.0005, 0.0011, 0.022, 3), C.hair, addS(p, d, 0.01), bone, d);
  }

  // ---------- tail: overlapping armour rings ----------
  for (let i = 0; i < tailPts.length - 1; i++) {
    const p = tailPts[i];
    const q = tailPts[i + 1];
    const r0 = 0.034 - i * 0.0052;
    const r1 = r0 - 0.0052;
    const L = dist(p, q);
    const fwd = sub(p, q);
    rod(p, q, r0 * 0.9, r1 * 0.9, C.legs, tailJ[i], 8);
    for (let k = 0; k < 3; k++) {
      const t = (k + 0.5) / 3;
      const rr = r0 + (r1 - r0) * t;
      const g = new THREE.CylinderGeometry(rr * 1.04, rr * 1.2, (L / 3) * 0.85, 9);
      put(g, (i * 3 + k) % 2 ? C.bandB : C.bandA, lerpV(p, q, t), tailJ[i], fwd);
    }
    // a dark seam ring at each joint
    const tg = new THREE.TorusGeometry(r0 * 0.95, 0.0022, 3, 10);
    tg.rotateX(Math.PI / 2);
    put(tg, C.seam, p, tailJ[i], fwd);
  }
  {
    const p = tailPts[5];
    const d = n3(sub(tailPts[5], tailPts[4]));
    put(new THREE.ConeGeometry(0.0085, 0.03, 6), C.bandA, addS(p, d, 0.014), tailJ[5], d);
  }

  // ---------- neck & head ----------
  put(new THREE.CylinderGeometry(0.034, 0.04, 0.07, 8), C.skin, [0, 0.136, 0.235], neck, [0, 0, 1]);
  put(ball(1, 0.04, 0.036, 0.055, 10, 8), C.skin, [0, 0.14, 0.29], head);

  // head shield dome
  {
    const g = new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, 0.42 * Math.PI).scale(0.046, 0.04, 0.06);
    put(g, C.shield, [0, 0.143, 0.29], head);
    // scutes on the dome
    for (let i = 0; i < 2; i++) {
      const th = 0.18 + i * 0.32;
      const cnt = i === 0 ? 4 : 7;
      for (let k = 0; k < cnt; k++) {
        const ph = (k / cnt) * Math.PI * 2 + i * 0.4;
        const u: V = [Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)];
        const p: V = [0.046 * u[0], 0.143 + 0.04 * u[1], 0.29 + 0.06 * u[2]];
        const nrm = n3([u[0] / 0.046, u[1] / 0.04, u[2] / 0.06]);
        const g2 = new THREE.CylinderGeometry(0.0062, 0.007, 0.004, 6);
        put(g2, i ? C.tileB : C.tileA, addS(p, nrm, 0.001), head, nrm);
      }
    }
  }
  // snout: upper jaw, snout shield, nose
  put(new THREE.CylinderGeometry(0.011, 0.024, 0.095, 8), C.skin, [0, 0.136, 0.36], head, [0, -0.1, 1]);
  {
    const g = new THREE.CylinderGeometry(0.0135, 0.025, 0.072, 8, 1, true, 0.5 * Math.PI, Math.PI);
    g.rotateX(Math.PI / 2);
    g.rotateX(0.12);
    put(g, C.shield, [0, 0.142, 0.352], head);
    for (let k = 0; k < 3; k++) {
      const z = 0.33 + k * 0.022;
      const y = 0.142 + 0.022 - k * 0.0055 - (z - 0.352) * 0.12;
      put(new THREE.CylinderGeometry(0.0055 - k * 0.0008, 0.0062 - k * 0.0008, 0.0035, 6), C.tileA, [0, y, z], head, [0, 1, 0.12]);
    }
  }
  put(ball(0.012, 1, 0.8, 0.7, 8, 6), C.nose, [0, 0.131, 0.408], head);
  for (const s of [1, -1]) {
    put(ball(0.0026, 1, 1, 1, 5, 4), C.eye, [0.0048 * s, 0.1315, 0.4155], head);
  }
  // lower jaw (separate, hinged)
  put(new THREE.CylinderGeometry(0.0075, 0.017, 0.085, 6), C.belly, [0, 0.118, 0.348], jaw, [0, -0.12, 1]);
  put(ball(0.004, 1, 0.6, 1, 6, 4), C.earIn, [0, 0.124, 0.39], jaw); // tongue tip peeking

  // eyes, ears, whiskers
  for (const s of [1, -1]) {
    const N = s > 0 ? "L" : "R";
    const eyeP: V = [0.034 * s, 0.15, 0.315];
    put(ball(0.0072, 1, 1, 1, 8, 6), C.eye, eyeP, head);
    put(ball(0.0024, 1, 1, 1, 5, 4), C.shine, [0.037 * s, 0.1545, 0.3205], head);
    put(new THREE.TorusGeometry(0.0078, 0.0016, 3, 10), C.skin, eyeP, head, [s, 0.15, 0.55]);

    const earAt: V = [0.026 * s, 0.172, 0.265];
    const ear = b.joint(`ear${N}`, { at: earAt, parent: head });
    const d = n3([0.5 * s, 1, -0.3]);
    put(new THREE.ConeGeometry(0.016, 0.05, 6).scale(1, 1, 0.42), C.skin, addS(earAt, d, 0.025), ear, d);
    put(new THREE.ConeGeometry(0.011, 0.038, 6).scale(1, 1, 0.3), C.earIn, addS(addS(earAt, d, 0.022), [0, 0, 1], 0.004), ear, d);

    for (let k = 0; k < 3; k++) {
      const p: V = [0.022 * s, 0.13 + k * 0.004, 0.37 - k * 0.01];
      const wd = n3([s, -0.15 + k * 0.15, 0.4]);
      put(new THREE.CylinderGeometry(0.0004, 0.0009, 0.03, 3), C.hair, addS(p, wd, 0.014), head, wd);
    }
  }

  // ---------- legs ----------
  const leg = (s: number, front: boolean) => {
    const N = s > 0 ? "L" : "R";
    const A: V = front ? [0.07 * s, 0.13, 0.13] : [0.075 * s, 0.13, -0.15];
    const B: V = front ? [0.088 * s, 0.075, 0.142] : [0.09 * s, 0.075, -0.125];
    const Cp: V = front ? [0.094 * s, 0.024, 0.138] : [0.096 * s, 0.026, -0.152];
    const names = front ? ["shoulder", "elbow", "wrist"] : ["hip", "knee", "ankle"];
    const j1 = b.joint(`${names[0]}${N}`, { at: A, parent: front ? chest : hips });
    const j2 = b.joint(`${names[1]}${N}`, { at: B, parent: j1 });
    const j3 = b.joint(`${names[2]}${N}`, { at: Cp, parent: j2 });

    rod(A, B, 0.03, 0.022, C.legs, j1);
    put(ball(0.022, 1, 1, 1, 7, 5), C.legs, B, j2);
    rod(B, Cp, 0.021, 0.016, C.legs, j2);
    // scaly rings down the lower leg
    for (let k = 0; k < 3; k++) {
      const t = 0.22 + k * 0.26;
      const rr = 0.021 + (0.016 - 0.021) * t;
      put(new THREE.CylinderGeometry(rr * 1.08, rr * 1.2, 0.011, 7), k % 2 ? C.legScaleB : C.legScaleA, lerpV(B, Cp, t), j2, sub(B, Cp));
    }
    // foot
    put(new THREE.BoxGeometry(0.042, 0.016, 0.05), C.legs, [Cp[0], 0.008, Cp[2] + 0.012], j3);
    put(new THREE.BoxGeometry(0.036, 0.006, 0.032), C.legScaleA, [Cp[0], 0.0175, Cp[2] + 0.014], j3);

    // digits with claws
    const dx = front ? [-0.015, -0.005, 0.005, 0.015] : [-0.02, -0.01, 0, 0.01, 0.02];
    const lens = front ? [0.018, 0.034, 0.03, 0.016] : [0.012, 0.018, 0.022, 0.018, 0.012];
    dx.forEach((x, k) => {
      const tp: V = [Cp[0] + x * s, 0.009, Cp[2] + 0.034];
      const tj = b.joint(`${front ? "finger" : "toe"}${N}${k + 1}`, { at: tp, parent: j3 });
      put(ball(0.0065, 1, 0.9, 1.1, 6, 4), C.skin, tp, tj);
      const d = n3([x * s * 1.5, -0.1, 1]);
      put(new THREE.ConeGeometry(0.0045, lens[k], 5), C.claw, addS(tp, d, lens[k] / 2 + 0.003), tj, d);
    });
  };
  for (const s of [1, -1]) {
    leg(s, true);
    leg(s, false);
  }

  return b.root;
}
