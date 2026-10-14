import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Nine-banded Armadillo",
  description:
    "A stylized nine-banded armadillo in a neutral rest pose. It has a dusty pinkish-tan shell with tiled shields and nine overlapping bands, a pointy snout on a split jaw, tall leathery ears, beady eyes, clawed feet, a ringed tapering tail and coarse pale hairs between the bands.",
};

export default function build() {
  const b = createBuilder({ name: "nineBandedArmadillo" });

  // ---------- deterministic randomness ----------
  const mulberry = (seed: number) => () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  let rand: () => number = mulberry(11);
  try {
    const R: any = rng(11);
    if (typeof R === "function") {
      const test = R();
      if (typeof test === "number" && test >= 0 && test < 1) rand = R;
    } else if (R && typeof R.next === "function") {
      const test = R.next();
      if (typeof test === "number" && test >= 0 && test < 1) rand = () => R.next();
    }
  } catch (e) {
    /* keep fallback */
  }
  const rr = (a: number, c: number) => a + (c - a) * rand();

  // ---------- palette ----------
  const SHELL = "#cfa48c";
  const SHELL_SCUTE = "#b88a72";
  const BAND_A = "#c99c84";
  const BAND_B = "#bd8f78";
  const RIDGE = "#dcb89f";
  const SKIN = "#c4958a";
  const BELLY = "#e2b9ab";
  const EAR = "#a97a70";
  const EAR_IN = "#8c5f59";
  const NOSE = "#9b665f";
  const CLAW = "#3f3129";
  const EYE = "#120d0b";
  const GLINT = "#ffffff";
  const HAIR = "#f1e6cf";
  const LEGSCALE = "#a87e6c";

  // ---------- helpers ----------
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const arr = (p: THREE.Vector3): [number, number, number] => [p.x, p.y, p.z];
  const tag = (j: any, role: string) => {
    try {
      const o = j?.bone ?? j?.object ?? j;
      if (o && o.userData) o.userData.role = role;
    } catch (e) {
      /* ignore */
    }
  };
  // rotate geometry so its +Y points along n
  const orientY = (g: THREE.BufferGeometry, n: THREE.Vector3) => {
    const d = n.clone().normalize();
    const a = Math.acos(Math.max(-1, Math.min(1, d.y)));
    const be = Math.atan2(d.x, d.z);
    g.rotateX(a);
    g.rotateY(be);
    return g;
  };
  // tapered cylinder from a to b
  const seg = (
    a: THREE.Vector3,
    c: THREE.Vector3,
    rA: number,
    rB: number,
    color: string,
    bone: any,
    segs = 7
  ) => {
    const d = c.clone().sub(a);
    const L = d.length();
    const g = new THREE.CylinderGeometry(rB, rA, L, segs);
    orientY(g, d);
    b.part(g, color, { at: arr(a.clone().add(c).multiplyScalar(0.5)), bone });
  };
  const hex = (p: THREE.Vector3, n: THREE.Vector3, r: number, h: number, color: string, bone: any) => {
    const g = new THREE.CylinderGeometry(r * 0.8, r, h, 6);
    orientY(g, n);
    const nn = n.clone().normalize();
    b.part(g, color, { at: arr(p.clone().add(nn.multiplyScalar(h * 0.25))), bone });
  };
  const hair = (base: THREE.Vector3, dir: THREE.Vector3, len: number, bone: any) => {
    const d = dir.clone().normalize();
    const g = new THREE.CylinderGeometry(0.0007, 0.0014, len, 3);
    orientY(g, d);
    const c = base.clone().add(d.clone().multiplyScalar(len * 0.5 - 0.003));
    b.part(g, HAIR, { at: arr(c), bone });
  };
  const ellipsoid = (sx: number, sy: number, sz: number, w = 12, h = 8) => {
    const g = new THREE.SphereGeometry(1, w, h);
    g.scale(sx, sy, sz);
    return g;
  };

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.16, -0.1] });
  const spine = b.joint("spine", { at: [0, 0.17, 0.02], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.17, 0.13], parent: spine });
  const neck = b.joint("neck", { at: [0, 0.165, 0.22], parent: chest });
  const head = b.joint("head", { at: [0, 0.16, 0.28], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.14, 0.325], parent: head });
  b.joint("jawTip", { at: [0, 0.132, 0.43], parent: jaw });
  b.joint("noseTip", { at: [0, 0.155, 0.45], parent: head });
  [hips, spine, chest].forEach((j) => tag(j, "spine"));
  tag(neck, "neck");
  tag(head, "head");
  tag(jaw, "jaw");

  const ears: Record<string, any> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const e = b.joint("ear" + side, { at: [0.03 * s, 0.2, 0.285], parent: head });
    b.joint("ear" + side + "Tip", { at: [0.05 * s, 0.255, 0.27], parent: e });
    tag(e, "hinge");
    ears[side] = e;
  }

  type Leg = { top: any; mid: any; low: any; pts: THREE.Vector3[]; front: boolean; s: number };
  const legs: Leg[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front
    const fp = [V(0.085 * s, 0.13, 0.15), V(0.09 * s, 0.075, 0.155), V(0.09 * s, 0.025, 0.16), V(0.09 * s, 0.012, 0.2)];
    const sh = b.joint("shoulder" + side, { at: arr(fp[0]), parent: chest });
    const el = b.joint("elbow" + side, { at: arr(fp[1]), parent: sh });
    const wr = b.joint("wrist" + side, { at: arr(fp[2]), parent: el });
    b.joint("fingers" + side, { at: arr(fp[3]), parent: wr });
    [sh, el, wr].forEach((j) => tag(j, "arm"));
    legs.push({ top: sh, mid: el, low: wr, pts: fp, front: true, s });
    // hind
    const hp = [V(0.09 * s, 0.13, -0.15), V(0.095 * s, 0.075, -0.14), V(0.095 * s, 0.025, -0.15), V(0.095 * s, 0.012, -0.1)];
    const hi = b.joint("hip" + side, { at: arr(hp[0]), parent: hips });
    const kn = b.joint("knee" + side, { at: arr(hp[1]), parent: hi });
    const an = b.joint("ankle" + side, { at: arr(hp[2]), parent: kn });
    b.joint("toes" + side, { at: arr(hp[3]), parent: an });
    [hi, kn, an].forEach((j) => tag(j, "leg"));
    legs.push({ top: hi, mid: kn, low: an, pts: hp, front: false, s });
  }

  const TP = [V(0, 0.14, -0.25), V(0, 0.125, -0.32), V(0, 0.11, -0.39), V(0, 0.095, -0.46), V(0, 0.08, -0.53), V(0, 0.068, -0.6)];
  const tailJ: any[] = [];
  let prev: any = hips;
  TP.forEach((p, i) => {
    const j = b.joint("tail" + (i + 1), { at: arr(p), parent: prev });
    tag(j, "tail");
    tailJ.push(j);
    prev = j;
  });

  // ---------- body core (skin) ----------
  b.part(ellipsoid(0.13, 0.115, 0.25, 14, 10), SKIN, { at: [0, 0.15, -0.005], bone: spine });
  b.part(ellipsoid(0.115, 0.07, 0.21, 12, 8), BELLY, { at: [0, 0.1, 0.0], bone: spine });
  b.part(ellipsoid(0.05, 0.05, 0.06, 10, 8), SKIN, { at: [0, 0.155, 0.245], bone: neck });

  // ---------- shell ----------
  const A = 0.145, B = 0.135, C = 0.26, CY = 0.17, SS = 1.04;
  const cap = (t0: number, t1: number) => {
    const g = new THREE.SphereGeometry(1, 18, 7, Math.PI - 0.3, Math.PI + 0.6, t0, t1 - t0);
    g.rotateX(Math.PI / 2);
    g.scale(A * SS, B * SS, C * SS);
    return g;
  };
  const frontEnd = Math.acos(0.09 / C);
  const rearStart = Math.acos(-0.12 / C);
  b.part(cap(0, frontEnd), SHELL, { at: [0, CY, 0], bone: chest });
  b.part(cap(rearStart, Math.PI), SHELL, { at: [0, CY, 0], bone: hips });

  // tiled scutes on the shields
  const shieldRows = (t0: number, t1: number, bone: any) => {
    let row = 0;
    for (let t = t0; t <= t1 + 1e-6; t += 0.12, row++) {
      const s = Math.sin(t);
      const z = C * SS * Math.cos(t);
      const circ = (Math.PI + 0.4) * ((A + B) / 2) * SS * s;
      const n = Math.max(3, Math.round(circ / 0.022));
      const span = Math.PI / 2 + 0.2;
      for (let k = 0; k < n; k++) {
        const f = (k + (row % 2 ? 0.5 : 0.25)) / n;
        const phi = -span + 2 * span * f;
        const x = A * SS * s * Math.sin(phi);
        const y = CY + B * SS * s * Math.cos(phi);
        const p = V(x, y, z);
        const nrm = V(x / (A * A), (y - CY) / (B * B), z / (C * C));
        hex(p, nrm, 0.0105, 0.006, SHELL_SCUTE, bone);
      }
    }
  };
  shieldRows(0.35, frontEnd - 0.06, chest);
  shieldRows(rearStart + 0.06, Math.PI - 0.3, hips);

  // the nine bands
  const NB = 9, zFront = 0.09, zBack = -0.12, w = 0.03;
  const step = (zFront - zBack) / NB;
  const half = Math.PI / 2 + 0.3;
  for (let i = 0; i < NB; i++) {
    const zc = zFront - step * (i + 0.5);
    const f = Math.sqrt(1 - (zc / C) ** 2);
    const rx = A * f * 1.03, ry = B * f * 1.03;
    const bone = i < 4 ? spine : hips;
    const g = new THREE.CylinderGeometry(1.0, 1.06, w, 18, 1, true, Math.PI - half, 2 * half);
    g.rotateX(Math.PI / 2);
    g.scale(rx, ry, 1);
    b.part(g, i % 2 ? BAND_B : BAND_A, { at: [0, CY, zc], bone });

    // ridge of little scutes along the band's trailing lip
    const zr = zc - w / 2 + 0.005;
    const nR = 13;
    for (let k = 0; k < nR; k++) {
      const phi = -(half - 0.12) + (2 * (half - 0.12) * (k + 0.5)) / nR;
      const p = V(rx * 1.05 * Math.sin(phi), CY + ry * 1.05 * Math.cos(phi), zr);
      const nrm = V(Math.sin(phi) / rx, Math.cos(phi) / ry, -0.3 / C);
      hex(p, nrm, 0.0075, 0.005, RIDGE, bone);
    }

    // coarse pale hairs poking out between bands
    const nh = 5;
    for (let k = 0; k < nh; k++) {
      const phi = rr(-1.65, 1.65);
      const base = V(rx * 1.03 * Math.sin(phi), CY + ry * 1.03 * Math.cos(phi), zc - w / 2);
      const nrm = V(Math.sin(phi) / rx, Math.cos(phi) / ry, 0).normalize();
      const dir = nrm.add(V(rr(-0.25, 0.25), rr(-0.15, 0.15), -0.45));
      hair(base, dir, rr(0.02, 0.036), bone);
    }
  }

  // hairs along the shell skirt and belly
  for (let k = 0; k < 26; k++) {
    const s = k % 2 ? 1 : -1;
    const z = rr(-0.2, 0.2);
    const ang = rr(0.25, 1.0); // below horizontal
    const bx = 0.115 * Math.sqrt(Math.max(0, 1 - (z / 0.21) ** 2));
    const by = 0.07 * Math.sqrt(Math.max(0, 1 - (z / 0.21) ** 2));
    const base = V(s * bx * Math.cos(ang), 0.1 - by * Math.sin(ang), z);
    const nrm = V(s * Math.cos(ang) / 0.115, -Math.sin(ang) / 0.07, 0).normalize();
    hair(base, nrm.add(V(0, -0.3, rr(-0.2, 0.2))), rr(0.015, 0.03), spine);
  }

  // ---------- head ----------
  b.part(ellipsoid(0.05, 0.05, 0.065, 12, 8), SKIN, { at: [0, 0.16, 0.305], bone: head });
  // upper snout
  {
    const g = new THREE.CylinderGeometry(0.012, 0.03, 0.11, 8);
    g.rotateX(Math.PI / 2);
    g.scale(1, 0.85, 1);
    b.part(g, SKIN, { at: [0, 0.155, 0.39], bone: head });
    b.part(ellipsoid(0.014, 0.012, 0.01, 8, 6), NOSE, { at: [0, 0.155, 0.446], bone: head });
    for (const s of [1, -1]) {
      b.part(ellipsoid(0.003, 0.004, 0.003, 6, 4), EYE, { at: [0.005 * s, 0.155, 0.455], bone: head });
    }
    // snout scutes
    for (let z = 0.345; z <= 0.43; z += 0.017) {
      const t = (z - 0.335) / 0.11;
      const r = 0.03 + (0.012 - 0.03) * t;
      for (const a of [-0.55, 0, 0.55]) {
        const p = V(r * Math.sin(a), 0.155 + 0.85 * r * Math.cos(a), z);
        hex(p, V(Math.sin(a), Math.cos(a), 0.15), Math.max(0.004, r * 0.38), 0.004, SHELL_SCUTE, head);
      }
    }
    // whisker-ish bristles on snout
    for (const s of [1, -1]) {
      for (let k = 0; k < 3; k++) {
        const base = V(0.02 * s, 0.148, 0.37 + k * 0.02);
        hair(base, V(s, rr(-0.2, 0.2), 0.3), 0.022, head);
      }
    }
  }
  // lower jaw
  {
    const g = new THREE.CylinderGeometry(0.008, 0.02, 0.1, 7);
    g.rotateX(Math.PI / 2);
    g.scale(1, 0.6, 1);
    b.part(g, BELLY, { at: [0, 0.133, 0.38], bone: jaw });
  }
  // head shield scutes
  for (const x of [-0.026, 0, 0.026]) {
    for (const z of [0.275, 0.3, 0.325]) {
      const q = 1 - (x / 0.05) ** 2 - ((z - 0.305) / 0.065) ** 2;
      if (q <= 0) continue;
      const y = 0.16 + 0.05 * Math.sqrt(q);
      const n = V(x / 0.0025, (y - 0.16) / 0.0025, (z - 0.305) / 0.004225);
      hex(V(x, y, z), n, 0.011, 0.006, SHELL_SCUTE, head);
    }
  }
  // eyes
  for (const s of [1, -1]) {
    b.part(ellipsoid(0.011, 0.007, 0.011, 8, 6), SKIN, { at: [0.041 * s, 0.18, 0.328], bone: head });
    b.part(ellipsoid(0.008, 0.008, 0.008, 8, 6), EYE, { at: [0.044 * s, 0.175, 0.332], bone: head });
    b.part(ellipsoid(0.0025, 0.0025, 0.0025, 5, 4), GLINT, { at: [0.0505 * s, 0.179, 0.336], bone: head });
  }
  // tall leathery ears
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const mk = (rb: number, rt: number, h: number, thick: number, zoff: number) => {
      const g = new THREE.CylinderGeometry(rt, rb, h, 6);
      g.scale(1, 1, thick);
      g.translate(0, h / 2, zoff);
      g.rotateX(-0.3);
      g.rotateZ(-0.38 * s);
      return g;
    };
    b.part(mk(0.02, 0.008, 0.065, 0.35, 0), EAR, { at: [0.03 * s, 0.2, 0.285], bone: ears[side] });
    b.part(mk(0.013, 0.005, 0.05, 0.2, 0.005), EAR_IN, { at: [0.03 * s, 0.203, 0.285], bone: ears[side] });
  }

  // ---------- legs ----------
  for (const L of legs) {
    const [p0, p1, p2] = L.pts;
    seg(p0, p1, 0.027, 0.02, SKIN, L.top);
    seg(p1, p2, 0.02, 0.016, SKIN, L.mid);
    b.part(ellipsoid(0.021, 0.02, 0.021, 8, 6), SKIN, { at: arr(p1), bone: L.mid });
    // knobbly scales on lower leg
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + (L.front ? 0 : 0.5);
      const n = V(Math.sin(a), 0, Math.cos(a));
      const mid = p1.clone().lerp(p2, 0.45);
      hex(mid.clone().add(n.clone().multiplyScalar(0.018)), n, 0.006, 0.004, LEGSCALE, L.mid);
      const up = p0.clone().lerp(p1, 0.55);
      hex(up.clone().add(n.clone().multiplyScalar(0.023)), n, 0.007, 0.004, LEGSCALE, L.top);
    }
    // foot pad
    const padLen = L.front ? 0.03 : 0.038;
    const padZ = p2.z + (L.front ? 0.01 : 0.015);
    b.part(ellipsoid(0.022, 0.012, padLen, 8, 6), SKIN, { at: [p2.x, 0.012, padZ], bone: L.low });
    // claws
    const offs = L.front ? [-0.013, -0.0045, 0.0045, 0.013] : [-0.016, -0.008, 0, 0.008, 0.016];
    offs.forEach((o, idx) => {
      const len = L.front ? (idx === 1 || idx === 2 ? 0.034 : 0.024) : 0.02 + (idx === 2 ? 0.004 : 0);
      const g = new THREE.ConeGeometry(0.0045, len, 5);
      g.translate(0, len / 2, 0);
      g.rotateX(Math.PI / 2 + 0.35);
      g.rotateY(o * 8);
      b.part(g, CLAW, { at: [p2.x + o, 0.012, padZ + padLen * 0.8], bone: L.low });
    });
    // a couple of hairs on the leg
    hair(p0.clone().lerp(p1, 0.6).add(V(0.02 * L.s, 0, 0)), V(L.s, -0.4, rr(-0.3, 0.3)), 0.02, L.top);
  }

  // ---------- tail ----------
  const cum: number[] = [0];
  for (let i = 1; i < TP.length; i++) cum.push(cum[i - 1] + TP[i].distanceTo(TP[i - 1]));
  const total = cum[cum.length - 1];
  const at = (s: number) => {
    s = Math.max(0, Math.min(total, s));
    let i = 0;
    while (i < TP.length - 2 && cum[i + 1] < s) i++;
    const t = (s - cum[i]) / (cum[i + 1] - cum[i]);
    return { p: TP[i].clone().lerp(TP[i + 1], t), seg: i, dir: TP[i + 1].clone().sub(TP[i]).normalize() };
  };
  const rad = (s: number) => 0.042 + (0.007 - 0.042) * (s / total);
  const ringStep = 0.0235;
  const ringLen = 0.027;
  let ri = 0;
  for (let s = 0; s + ringLen < total - 0.015; s += ringStep, ri++) {
    const a = at(s), c = at(s + ringLen);
    const bone = tailJ[a.seg];
    const r0 = rad(s);
    seg(a.p, c.p, r0, r0 * 1.09, ri % 2 ? BAND_B : BAND_A, bone, 9);
    // studs on the ring's trailing edge
    const nS = 6;
    const d = a.dir;
    const side = V(1, 0, 0);
    const upv = d.clone().cross(side).normalize().multiplyScalar(-1);
    for (let k = 0; k < nS; k++) {
      const ang = -1.4 + (2.8 * k) / (nS - 1);
      const n = upv.clone().multiplyScalar(Math.cos(ang)).add(side.clone().multiplyScalar(Math.sin(ang)));
      const p = c.p.clone().add(n.clone().multiplyScalar(r0 * 1.09));
      hex(p, n, Math.max(0.0035, r0 * 0.22), 0.004, RIDGE, bone);
    }
    if (ri % 3 === 1) {
      const ang = rr(-1.2, 1.2);
      const n = upv.clone().multiplyScalar(Math.cos(ang)).add(side.clone().multiplyScalar(Math.sin(ang)));
      hair(c.p.clone().add(n.clone().multiplyScalar(r0)), n.add(d.clone().multiplyScalar(0.6)), rr(0.015, 0.025), bone);
    }
  }
  // pointed tip
  {
    const sTip = Math.max(0, total - 0.035);
    const a = at(sTip);
    const tipEnd = TP[TP.length - 1].clone().add(a.dir.clone().multiplyScalar(0.015));
    const L = a.p.distanceTo(tipEnd);
    const g = new THREE.ConeGeometry(rad(sTip) * 1.05, L, 7);
    orientY(g, tipEnd.clone().sub(a.p));
    b.part(g, SHELL_SCUTE, { at: arr(a.p.clone().add(tipEnd).multiplyScalar(0.5)), bone: tailJ[TP.length - 2] });
  }
  // tail base filler under the rear shield
  seg(V(0, 0.145, -0.17), TP[0], 0.05, 0.043, SKIN, hips, 9);

  return b.root;
}
