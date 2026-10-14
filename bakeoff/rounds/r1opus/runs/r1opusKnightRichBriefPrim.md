```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Griffin Knight",
  description:
    "A battle-worn fantasy knight in stylised plate: great helm with a narrow eye slit and tall crimson plume, layered pauldrons etched with gold filigree, a deep-blue surcoat and kite shield bearing a silver griffin, a broadsword, and a torn crimson cape. Dents and scratches cover the steel.",
};

type V3 = [number, number, number];

export default function build() {
  const b: any = createBuilder({ name: "griffinKnight" });
  const R: any = rng(1187);
  const rand = (): number =>
    typeof R === "function" ? R() : typeof R.next === "function" ? R.next() : R.random();

  // ---------- palette ----------
  const C = {
    steel: "#a7afb8",
    steelDark: "#7a838d",
    steelLight: "#d3d9df",
    dent: "#6c7580",
    scratch: "#e8ecf0",
    gold: "#d6a838",
    goldDark: "#9c7420",
    blue: "#1d3c7a",
    blueDark: "#142a57",
    silver: "#e4e8ee",
    crimson: "#a8151f",
    crimson2: "#8c0f18",
    crimsonBright: "#c92330",
    crimsonDark: "#4a080d",
    leather: "#5a3a22",
    leatherDark: "#3b2414",
    mail: "#6c727a",
    mailDark: "#474c53",
    black: "#121317",
    glint: "#ffcf7a",
  };

  // ---------- geometry helpers (orientation baked into geometry) ----------
  const XA = new THREE.Vector3(1, 0, 0);
  const ZA = new THREE.Vector3(0, 0, 1);
  const vec = (p: any): THREE.Vector3 =>
    Array.isArray(p) ? new THREE.Vector3(p[0], p[1], p[2]) : p.clone();
  const angles = (d: any) => {
    const v = vec(d).normalize();
    const phi = Math.asin(Math.max(-1, Math.min(1, -v.x)));
    const theta = Math.abs(Math.cos(phi)) < 1e-6 ? 0 : Math.atan2(v.z, v.y);
    return { phi, theta };
  };
  const orient = (g: THREE.BufferGeometry, d: any) => {
    const { phi, theta } = angles(d);
    g.rotateZ(phi);
    g.rotateX(theta);
    return g;
  };
  const rotv = (v: THREE.Vector3, d: any) => {
    const { phi, theta } = angles(d);
    v.applyAxisAngle(ZA, phi);
    v.applyAxisAngle(XA, theta);
    return v;
  };
  const P = (g: THREE.BufferGeometry, color: string, at: any, bone: any) => {
    const p = vec(at);
    return b.part(g, color, { at: [p.x, p.y, p.z], bone });
  };
  // cylinder between two points (r0 at a, r1 at b)
  const seg = (a: any, bb: any, r0: number, r1: number, color: string, bone: any, n = 8) => {
    const A = vec(a), B = vec(bb);
    const d = B.clone().sub(A);
    const g = new THREE.CylinderGeometry(r1, r0, d.length(), n);
    orient(g, d);
    return P(g, color, A.add(B).multiplyScalar(0.5), bone);
  };
  // box between two points: width w (x-ish), thickness t
  const bar = (a: any, bb: any, w: number, t: number, color: string, bone: any) => {
    const A = vec(a), B = vec(bb);
    const d = B.clone().sub(A);
    const g = new THREE.BoxGeometry(w, d.length(), t);
    orient(g, d);
    return P(g, color, A.add(B).multiplyScalar(0.5), bone);
  };
  const ball = (r: number, color: string, at: any, bone: any, w = 8, h = 6) =>
    P(new THREE.SphereGeometry(r, w, h), color, at, bone);
  const box = (w: number, h: number, d: number, color: string, at: any, bone: any) =>
    P(new THREE.BoxGeometry(w, h, d), color, at, bone);
  // ring lying perpendicular to d
  const ring = (rad: number, tube: number, color: string, at: any, d: any, bone: any, sz = 1, seg2 = 12) => {
    const g = new THREE.TorusGeometry(rad, tube, 3, seg2);
    g.rotateX(Math.PI / 2);
    g.scale(1, 1, sz);
    orient(g, d);
    return P(g, color, at, bone);
  };
  // flattened dent patch on a surface, n = outward normal
  const dent = (p: any, n: any, size: number, bone: any, color = C.dent) => {
    const g = new THREE.SphereGeometry(size, 6, 3);
    g.scale(1, 0.28, 0.75);
    orient(g, n);
    P(g, color, p, bone);
  };
  const scratch = (p: any, tangent: any, len: number, bone: any, color = C.scratch) => {
    const g = new THREE.BoxGeometry(0.004, len, 0.004);
    orient(g, tangent);
    P(g, color, p, bone);
  };
  // battle damage on a straight limb tube from a to b of radius r
  const damageTube = (a: V3, bb: V3, r: number, bone: any, count: number) => {
    const A = vec(a), B = vec(bb);
    const ax = B.clone().sub(A).normalize();
    const ref = Math.abs(ax.y) > 0.8 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
    const u = new THREE.Vector3().crossVectors(ax, ref).normalize();
    const w = new THREE.Vector3().crossVectors(ax, u).normalize();
    for (let i = 0; i < count; i++) {
      const t = 0.2 + rand() * 0.6;
      const a2 = rand() * Math.PI * 2;
      const n = u.clone().multiplyScalar(Math.cos(a2)).add(w.clone().multiplyScalar(Math.sin(a2)));
      const p = A.clone().lerp(B, t).add(n.clone().multiplyScalar(r * 0.97));
      if (i % 2 === 0) dent(p, n, 0.014 + rand() * 0.01, bone);
      else {
        const tan = ax.clone().multiplyScalar(rand() - 0.5).add(new THREE.Vector3().crossVectors(n, ax).multiplyScalar(0.8));
        scratch(p, tan, 0.04 + rand() * 0.04, bone);
      }
    }
  };

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 1.0, 0] });
  const spine = b.joint("spine", { parent: hips, at: [0, 1.15, 0] });
  const chest = b.joint("chest", { parent: spine, at: [0, 1.32, 0] });
  const neck = b.joint("neck", { parent: chest, at: [0, 1.52, 0] });
  const head = b.joint("head", { parent: neck, at: [0, 1.62, 0] });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.67, 0.06] });
  const plume1 = b.joint("plume1", { parent: head, at: [0, 1.95, 0] });
  const plume2 = b.joint("plume2", { parent: plume1, at: [0, 2.17, -0.07] });
  const plume3 = b.joint("plume3", { parent: plume2, at: [0, 2.23, -0.27] });
  const cape1 = b.joint("cape1", { parent: chest, at: [0, 1.46, -0.17] });
  const cape2 = b.joint("cape2", { parent: cape1, at: [0, 1.08, -0.216] });
  const cape3 = b.joint("cape3", { parent: cape2, at: [0, 0.7, -0.261] });

  const arms: any = {};
  for (const [s, L] of [[1, "L"], [-1, "R"]] as [number, string][]) {
    const shoulder = b.joint("shoulder" + L, { parent: chest, at: [s * 0.2, 1.47, 0] });
    const elbow = b.joint("elbow" + L, { parent: shoulder, at: [s * 0.5, 1.47, 0] });
    const wrist = b.joint("wrist" + L, { parent: elbow, at: [s * 0.78, 1.47, 0] });
    const hand = b.joint("hand" + L, { parent: wrist, at: [s * 0.86, 1.47, 0] });
    arms[L] = { shoulder, elbow, wrist, hand };
  }
  const legs: any = {};
  for (const [s, L] of [[1, "L"], [-1, "R"]] as [number, string][]) {
    const hip = b.joint("hip" + L, { parent: hips, at: [s * 0.11, 0.95, 0] });
    const knee = b.joint("knee" + L, { parent: hip, at: [s * 0.12, 0.52, 0.02] });
    const ankle = b.joint("ankle" + L, { parent: knee, at: [s * 0.12, 0.1, 0] });
    const toe = b.joint("toe" + L, { parent: ankle, at: [s * 0.12, 0.04, 0.14] });
    legs[L] = { hip, knee, ankle, toe };
  }

  // ---------- griffin emblem (flat, facing +Z) ----------
  const griffin = (o: V3, s: number, color: string, bone: any, eyeColor: string) => {
    const t = 0.009;
    const Q = (x: number, y: number, dz = 0) => new THREE.Vector3(o[0] + x * s, o[1] + y * s, o[2] + dz);
    const dirA = (deg: number): V3 => [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180), 0];
    const ell = (x: number, y: number, rx: number, ry: number, deg: number) => {
      const g = new THREE.SphereGeometry(1, 8, 5);
      g.scale(rx * s, ry * s, t * 0.6);
      orient(g, dirA(deg));
      P(g, color, Q(x, y), bone);
    };
    const cone = (x: number, y: number, r: number, h: number, deg: number) => {
      const g = new THREE.ConeGeometry(r * s, h * s, 4);
      g.scale(1, 1, 0.25);
      orient(g, dirA(deg));
      P(g, color, Q(x, y), bone);
    };
    const limbBar = (x0: number, y0: number, x1: number, y1: number, w: number) =>
      bar(Q(x0, y0), Q(x1, y1), w * s, t, color, bone);

    ell(0, -0.08, 0.17, 0.3, 110); // body
    ell(0.1, 0.18, 0.12, 0.13, 70); // chest
    ell(0.17, 0.36, 0.09, 0.1, 90); // head
    cone(0.29, 0.33, 0.05, 0.15, -25); // beak
    cone(0.12, 0.48, 0.03, 0.11, 120); // ear tuft
    ell(-0.07, 0.24, 0.11, 0.15, 125); // wing covert
    for (let i = 0; i < 5; i++) {
      const deg = 92 + i * 15;
      const len = 0.55 - i * 0.065;
      const d = dirA(deg);
      const base = [-0.02 - i * 0.02, 0.2];
      limbBar(base[0], base[1], base[0] + d[0] * len, base[1] + d[1] * len, 0.075);
    }
    // forelegs raised (rampant)
    limbBar(0.13, 0.1, 0.36, 0.25, 0.06);
    limbBar(0.12, 0.0, 0.34, 0.0, 0.055);
    for (let k = -1; k <= 1; k++) {
      cone(0.4, 0.27 + k * 0.03, 0.015, 0.07, 30 + k * 30);
      cone(0.38, 0.0 + k * 0.03, 0.015, 0.07, k * 30);
    }
    // hind legs
    limbBar(-0.02, -0.3, 0.1, -0.55, 0.07);
    limbBar(-0.14, -0.28, -0.19, -0.56, 0.065);
    limbBar(0.08, -0.57, 0.2, -0.6, 0.05);
    limbBar(-0.21, -0.58, -0.09, -0.6, 0.05);
    // tail
    limbBar(-0.14, -0.3, -0.32, -0.25, 0.035);
    limbBar(-0.32, -0.25, -0.42, -0.06, 0.03);
    limbBar(-0.42, -0.06, -0.38, 0.08, 0.025);
    cone(-0.36, 0.14, 0.04, 0.12, 70);
    // eye
    ball(0.018 * s, eyeColor, Q(0.19, 0.38, t * 0.6), bone, 5, 4);
  };

  // ================= HELM =================
  const helmR = 0.135;
  P(new THREE.CylinderGeometry(helmR, helmR, 0.2, 10), C.steel, [0, 1.77, 0], head);
  P(new THREE.CylinderGeometry(helmR, 0.125, 0.12, 10), C.steel, [0, 1.61, 0], jaw);
  P(new THREE.CylinderGeometry(0.095, helmR, 0.05, 10), C.steelLight, [0, 1.895, 0], head);
  ring(helmR + 0.002, 0.007, C.gold, [0, 1.87, 0], [0, 1, 0], head, 1, 10);
  ring(helmR + 0.002, 0.008, C.gold, [0, 1.67, 0], [0, 1, 0], head, 1, 10);
  ring(0.127, 0.006, C.goldDark, [0, 1.555, 0], [0, 1, 0], jaw, 1, 10);
  // eye slit band (dark arc across the front)
  const arcBand = (rad: number, tube: number, arc: number, y: number, color: string, bone: any) => {
    const g = new THREE.TorusGeometry(rad, tube, 3, 8, arc);
    g.rotateX(Math.PI / 2);
    g.rotateY(-(Math.PI / 2 - arc / 2));
    P(g, color, [0, y, 0], bone);
  };
  arcBand(helmR + 0.001, 0.011, 2.1, 1.745, C.black, head);
  arcBand(helmR + 0.003, 0.007, 2.3, 1.772, C.steelLight, head); // brow ridge
  arcBand(helmR + 0.003, 0.006, 2.3, 1.72, C.steelLight, head);
  // eye glints inside the slit
  ball(0.0075, C.glint, [0.042, 1.745, 0.137], head, 5, 4);
  ball(0.0075, C.glint, [-0.042, 1.745, 0.137], head, 5, 4);
  // gold cross on the face
  box(0.026, 0.2, 0.012, C.gold, [0, 1.71, 0.138], head);
  box(0.026, 0.1, 0.012, C.gold, [0, 1.61, 0.133], jaw);
  ball(0.01, C.goldDark, [0, 1.79, 0.145], head, 5, 4);
  // breathing holes
  for (const sgn of [1, -1]) {
    for (const a of [0.45, 0.65, 0.85]) {
      for (const y of [1.585, 1.615, 1.645]) {
        ball(0.0085, C.black, [sgn * Math.sin(a) * 0.129, y, Math.cos(a) * 0.129], jaw, 5, 3);
      }
    }
    // rivets at the side
    for (const y of [1.69, 1.85]) ball(0.009, C.gold, [sgn * 0.136, y, 0], head, 5, 4);
  }
  // helm damage
  dent([0.09, 1.82, 0.1], [0.67, 0.2, 0.72], 0.022, head);
  dent([-0.12, 1.7, 0.06], [-0.9, 0, 0.45], 0.018, head);
  scratch([0.11, 1.78, 0.075], [0.3, 1, -0.2], 0.07, head);
  scratch([-0.07, 1.84, 0.115], [1, 0.4, 0.2], 0.06, head);
  scratch([0.05, 1.6, 0.115], [1, -0.5, 0], 0.05, jaw);

  // ================= PLUME =================
  P(new THREE.CylinderGeometry(0.022, 0.032, 0.06, 8), C.gold, [0, 1.94, 0], head);
  ring(0.03, 0.006, C.goldDark, [0, 1.925, 0], [0, 1, 0], head, 1, 8);
  const plumeCols = [C.crimson, C.crimsonBright, C.crimson2, C.crimsonBright, C.crimson];
  const strandX = [-0.04, -0.02, 0, 0.02, 0.04];
  strandX.forEach((x, si) => {
    const P0 = new THREE.Vector3(x * 0.4, 1.95, 0);
    const P1 = new THREE.Vector3(x * 1.6, 2.32 - Math.abs(x) * 0.8, 0.03);
    const P2 = new THREE.Vector3(x * 3.2, 2.19 - Math.abs(x) * 1.5 + (rand() - 0.5) * 0.03, -0.5 + Math.abs(x) * 1.2);
    const bez = (t: number) =>
      P0.clone().multiplyScalar((1 - t) * (1 - t)).add(P1.clone().multiplyScalar(2 * (1 - t) * t)).add(P2.clone().multiplyScalar(t * t));
    const n = 7;
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n;
      const r0 = 0.042 * (1 - t0 * 0.75) * (si === 2 ? 1.15 : 1);
      const r1 = 0.042 * (1 - t1 * 0.75) * (si === 2 ? 1.15 : 1);
      const bone = t0 < 0.35 ? plume1 : t0 < 0.7 ? plume2 : plume3;
      seg(bez(t0), bez(t1 + 0.02), r0, r1, plumeCols[(si + i) % plumeCols.length], bone, 6);
    }
    // wispy tip
    const tip = bez(1);
    const d = tip.clone().sub(bez(0.9)).normalize();
    const g = new THREE.ConeGeometry(0.014, 0.1, 4);
    orient(g, d);
    P(g, C.crimsonBright, tip.clone().add(d.clone().multiplyScalar(0.04)), plume3);
  });

  // ================= TORSO / SURCOAT =================
  {
    const g = new THREE.CylinderGeometry(0.205, 0.195, 0.26, 8, 1, false, Math.PI / 8);
    g.scale(1, 1, 0.7);
    P(g, C.blue, [0, 1.35, 0], chest);
    const g2 = new THREE.CylinderGeometry(0.195, 0.19, 0.24, 8, 1, false, Math.PI / 8);
    g2.scale(1, 1, 0.7);
    P(g2, C.blue, [0, 1.1, 0], spine);
  }
  // front tabard panel with silver trim
  box(0.2, 0.46, 0.012, C.blue, [0, 1.23, 0.131], spine);
  box(0.012, 0.46, 0.016, C.silver, [0.1, 1.23, 0.132], spine);
  box(0.012, 0.46, 0.016, C.silver, [-0.1, 1.23, 0.132], spine);
  box(0.2, 0.012, 0.016, C.silver, [0, 1.455, 0.132], chest);
  griffin([0, 1.26, 0.139], 0.24, C.silver, chest, C.blueDark);
  // back panel trim
  box(0.24, 0.012, 0.014, C.silver, [0, 1.46, -0.125], chest);
  // gorget
  {
    const g = new THREE.CylinderGeometry(0.078, 0.155, 0.08, 8);
    g.scale(1, 1, 0.8);
    P(g, C.steel, [0, 1.51, 0], chest);
    const g2 = new THREE.CylinderGeometry(0.072, 0.11, 0.04, 8);
    g2.scale(1, 1, 0.85);
    P(g2, C.steelLight, [0, 1.555, 0], neck);
    P(new THREE.CylinderGeometry(0.07, 0.075, 0.1, 8), C.steelDark, [0, 1.58, 0], neck);
    ring(0.12, 0.006, C.gold, [0, 1.49, 0], [0, 1, 0], chest, 0.8, 10);
  }
  // cape clasps on the gorget
  for (const s of [1, -1]) {
    const g = new THREE.CylinderGeometry(0.026, 0.026, 0.012, 8);
    orient(g, [s * 0.4, 0.3, 1]);
    P(g, C.gold, [s * 0.1, 1.5, 0.095], chest);
    ball(0.011, C.crimsonBright, [s * 0.103, 1.502, 0.104], chest, 6, 4);
  }
  bar([0.1, 1.5, 0.098], [-0.1, 1.5, 0.098], 0.006, 0.006, C.goldDark, chest);

  // belt
  {
    const g = new THREE.TorusGeometry(0.196, 0.022, 4, 12);
    g.rotateX(Math.PI / 2);
    g.scale(1, 1, 0.72);
    P(g, C.leather, [0, 1.0, 0], hips);
    box(0.065, 0.055, 0.016, C.gold, [0, 1.0, 0.152], hips);
    box(0.035, 0.028, 0.01, C.leatherDark, [0, 1.0, 0.159], hips);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.4;
      ball(0.008, C.gold, [Math.sin(a) * 0.215, 1.0, Math.cos(a) * 0.158], hips, 5, 3);
    }
    // pouch
    box(0.07, 0.08, 0.04, C.leather, [-0.15, 0.94, 0.1], hips);
    box(0.072, 0.03, 0.044, C.leatherDark, [-0.15, 0.97, 0.1], hips);
    ball(0.008, C.gold, [-0.15, 0.96, 0.123], hips, 5, 3);
  }
  // mail skirt
  {
    const g = new THREE.CylinderGeometry(0.19, 0.218, 0.3, 10);
    g.scale(1, 1, 0.78);
    P(g, C.mail, [0, 0.84, 0], hips);
    for (const y of [0.73, 0.79, 0.85, 0.91]) {
      const r = 0.19 + (0.99 - y) / 0.3 * 0.028;
      const gr = new THREE.TorusGeometry(Math.min(0.219, 0.215 - (y - 0.7) * 0.08), 0.005, 3, 12);
      gr.rotateX(Math.PI / 2);
      gr.scale(1, 1, 0.78);
      P(gr, C.mailDark, [0, y, 0], hips);
      void r;
    }
  }
  // tabard skirt strips, torn hem
  for (const side of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const x = -0.105 + i * 0.07;
      const yb = 0.5 + rand() * 0.09;
      const top: V3 = [x, 0.99, side * 0.138];
      const bot: V3 = [x * 1.12, yb, side * 0.185];
      bar(top, bot, 0.074, 0.012, i % 2 ? C.blue : C.blueDark, hips);
      const hb = vec(bot).add(new THREE.Vector3(0, 0.01, side * 0.002));
      bar(hb.clone().add(new THREE.Vector3(-0.036, 0, 0)), hb.clone().add(new THREE.Vector3(0.036, 0, 0)), 0.012, 0.014, C.silver, hips);
      if (rand() > 0.4) {
        const g = new THREE.ConeGeometry(0.02, 0.06, 3);
        g.scale(1, 1, 0.2);
        orient(g, [0, -1, side * 0.1]);
        P(g, i % 2 ? C.blue : C.blueDark, [x * 1.12 + (rand() - 0.5) * 0.03, yb - 0.025, side * 0.186], hips);
      }
    }
  }
  // scabbard on the left hip
  bar([0.215, 0.97, 0.03], [0.3, 0.36, -0.12], 0.055, 0.025, C.leather, hips);
  bar([0.215, 0.97, 0.03], [0.225, 0.9, 0.012], 0.064, 0.032, C.gold, hips);
  bar([0.29, 0.42, -0.105], [0.3, 0.355, -0.122], 0.06, 0.03, C.gold, hips);
  bar([0.26, 0.69, -0.055], [0.263, 0.67, -0.06], 0.062, 0.03, C.goldDark, hips);

  // ================= CAPE =================
  {
    const capeTop = 1.46;
    const cz = (y: number) => -0.17 - (capeTop - y) * 0.12;
    const spread = (y: number) => 1 + (capeTop - y) * 0.45;
    seg([-0.27, 1.47, -0.16], [0.27, 1.47, -0.16], 0.034, 0.034, C.crimsonDark, cape1, 6);
    const breaks = [capeTop, 1.08, 0.7];
    const bones = [cape1, cape2, cape3];
    for (let i = 0; i < 8; i++) {
      const x0 = -0.245 + i * 0.07;
      const yb = 0.3 + rand() * 0.33;
      const pleat = i % 2 ? 0.012 : -0.004;
      const col = i % 2 ? C.crimson : C.crimson2;
      for (let k = 0; k < 3; k++) {
        const y0 = breaks[k];
        const y1 = Math.max(k < 2 ? breaks[k + 1] : yb, yb);
        if (y1 >= y0) continue;
        const A: V3 = [x0 * spread(y0), y0, cz(y0) + pleat];
        const B: V3 = [x0 * spread(y1), y1 - 0.01, cz(y1) + pleat];
        bar(A, B, 0.078 * spread((y0 + y1) / 2), 0.014, col, bones[k]);
      }
      // ragged tatters
      const bot = new THREE.Vector3(x0 * spread(yb), yb, cz(yb) + pleat);
      const down = new THREE.Vector3(x0 * (spread(yb - 0.1) - spread(yb)), -0.1, cz(yb - 0.1) - cz(yb)).normalize();
      const nt = 1 + Math.floor(rand() * 2);
      for (let j = 0; j < nt; j++) {
        const h = 0.07 + rand() * 0.09;
        const g = new THREE.ConeGeometry(0.02 + rand() * 0.012, h, 3);
        g.scale(1, 1, 0.25);
        orient(g, down);
        const off = (j - (nt - 1) / 2) * 0.035 + (rand() - 0.5) * 0.01;
        P(g, col, bot.clone().add(new THREE.Vector3(off, 0, 0)).add(down.clone().multiplyScalar(h / 2 - 0.005)), cape3);
      }
      // burn / tear marks on the outer face
      if (rand() > 0.55) {
        const y = 0.75 + rand() * 0.5;
        const g = new THREE.BoxGeometry(0.03 + rand() * 0.02, 0.04 + rand() * 0.04, 0.004);
        P(g, C.crimsonDark, [x0 * spread(y) + (rand() - 0.5) * 0.02, y, cz(y) + pleat - 0.008], y > 1.08 ? cape1 : cape2);
      }
    }
  }

  // ================= ARMS =================
  const pauldron = (s: number, bone: any) => {
    const shells: { c: V3; r: number; d: V3; sy: number; deco: number }[] = [
      { c: [s * 0.37, 1.45, 0], r: 0.1, d: [s * 1.0, 1, 0], sy: 0.6, deco: 0 },
      { c: [s * 0.3, 1.47, 0], r: 0.125, d: [s * 0.6, 1, 0], sy: 0.58, deco: 1 },
      { c: [s * 0.21, 1.495, 0], r: 0.155, d: [s * 0.25, 1, 0], sy: 0.55, deco: 2 },
    ];
    for (const sh of shells) {
      const sz = 1.08;
      const g = new THREE.SphereGeometry(sh.r, 9, 6);
      g.scale(1, sh.sy, sz);
      orient(g, sh.d);
      P(g, sh.deco === 2 ? C.steel : sh.deco === 1 ? C.steelLight : C.steel, sh.c, bone);
      ring(sh.r * 1.0, 0.007, C.gold, sh.c, sh.d, bone, sz, 14);
      // filigree curls
      const curls = sh.deco === 2 ? 9 : sh.deco === 1 ? 7 : 5;
      const polar = sh.deco === 2 ? 0.85 : 1.0;
      for (let i = 0; i < curls; i++) {
        const a = (i / curls) * Math.PI * 2 + s * 0.3;
        const lp = new THREE.Vector3(sh.r * Math.sin(polar) * Math.cos(a), sh.r * Math.cos(polar) * sh.sy, sh.r * Math.sin(polar) * Math.sin(a) * sz);
        const n = new THREE.Vector3(lp.x, lp.y / (sh.sy * sh.sy), lp.z / (sz * sz)).normalize();
        rotv(lp, sh.d);
        rotv(n, sh.d);
        lp.add(vec(sh.c));
        const cg = new THREE.TorusGeometry(sh.deco === 0 ? 0.014 : 0.02, 0.0042, 3, 8, 4.4);
        cg.rotateX(-Math.PI / 2);
        cg.rotateY(a * 2);
        orient(cg, n);
        P(cg, C.gold, lp, bone);
        // dots between curls
        const a2 = a + Math.PI / curls;
        const p2 = polar * 0.62;
        const dp = new THREE.Vector3(sh.r * Math.sin(p2) * Math.cos(a2), sh.r * Math.cos(p2) * sh.sy, sh.r * Math.sin(p2) * Math.sin(a2) * sz);
        rotv(dp, sh.d);
        dp.add(vec(sh.c));
        if (sh.deco > 0) ball(0.0065, C.gold, dp, bone, 5, 3);
      }
      // crown boss on the top shell
      if (sh.deco === 2) {
        const top = rotv(new THREE.Vector3(0, sh.r * sh.sy, 0), sh.d).add(vec(sh.c));
        ball(0.018, C.gold, top, bone, 6, 4);
        ring(0.035, 0.004, C.gold, top, sh.d, bone, 1, 10);
        ring(0.055, 0.004, C.goldDark, rotv(new THREE.Vector3(0, sh.r * sh.sy * 0.93, 0), sh.d).add(vec(sh.c)), sh.d, bone, 1, 12);
      }
    }
    // battle damage on the top shell
    dent([s * 0.25, 1.565, 0.06], [s * 0.3, 1, 0.5], 0.02, bone);
    dent([s * 0.33, 1.5, -0.07], [s * 0.6, 0.7, -0.6], 0.016, bone);
    scratch([s * 0.2, 1.57, -0.02], [1, 0.2, 0.7], 0.08, bone);
    scratch([s * 0.4, 1.47, 0.05], [0.2, -1, 0.6], 0.05, bone);
  };

  for (const [s, L] of [[1, "L"], [-1, "R"]] as [number, string][]) {
    const { shoulder, elbow, wrist, hand } = arms[L];
    const sh: V3 = [s * 0.25, 1.47, 0];
    const el: V3 = [s * 0.5, 1.47, 0];
    const wr: V3 = [s * 0.78, 1.47, 0];
    const hd: V3 = [s * 0.86, 1.47, 0];
    pauldron(s, shoulder);
    // rerebrace
    seg(sh, el, 0.063, 0.057, C.steel, shoulder);
    ring(0.06, 0.005, C.gold, [s * 0.44, 1.47, 0], [s, 0, 0], shoulder, 1, 10);
    // couter
    ball(0.062, C.steelLight, el, elbow);
    {
      const g = new THREE.CylinderGeometry(0.066, 0.066, 0.012, 8);
      orient(g, [0, 0, -1]);
      P(g, C.steel, [el[0], el[1], -0.062], elbow);
      ring(0.066, 0.005, C.gold, [el[0], el[1], -0.062], [0, 0, -1], elbow, 1, 10);
      ball(0.012, C.gold, [el[0], el[1], -0.07], elbow, 5, 4);
    }
    // vambrace
    seg(el, wr, 0.056, 0.048, C.steel, elbow);
    bar([s * 0.52, 1.523, 0], [s * 0.76, 1.515, 0], 0.012, 0.008, C.steelLight, elbow);
    damageTube(sh, el, 0.062, shoulder, 2);
    damageTube(el, wr, 0.054, elbow, 3);
    // gauntlet cuff + fist
    seg([s * 0.76, 1.47, 0], [s * 0.83, 1.47, 0], 0.05, 0.068, C.steelDark, wrist);
    ring(0.068, 0.005, C.gold, [s * 0.83, 1.47, 0], [s, 0, 0], wrist, 1, 10);
    box(0.09, 0.085, 0.1, C.steel, [hd[0] + s * 0.02, hd[1], hd[2]], hand);
    for (let k = 0; k < 4; k++) {
      box(0.028, 0.07, 0.022, k % 2 ? C.steelDark : C.steel, [hd[0] + s * 0.068, hd[1] - 0.005, -0.036 + k * 0.024], hand);
    }
    box(0.08, 0.02, 0.1, C.gold, [hd[0] + s * 0.02, hd[1] + 0.045, 0], hand);
    box(0.04, 0.03, 0.05, C.steelDark, [hd[0] + s * 0.03, hd[1] + 0.035, 0.05], hand); // thumb
  }

  // ================= SWORD (right hand) =================
  {
    const hb = arms.R.hand;
    const x = -0.885, y = 1.47;
    seg([x, y, -0.11], [x, y, 0.095], 0.016, 0.016, C.leather, hb, 6);
    for (const z of [-0.09, -0.06, 0.07]) ring(0.017, 0.004, C.leatherDark, [x, y, z], [0, 0, 1], hb, 1, 6);
    ball(0.03, C.gold, [x, y, -0.135], hb, 8, 6);
    ball(0.012, C.crimsonBright, [x, y + 0.026, -0.135], hb, 5, 4);
    box(0.03, 0.28, 0.03, C.gold, [x, y, 0.108], hb);
    ball(0.02, C.gold, [x, y + 0.15, 0.108], hb, 6, 4);
    ball(0.02, C.gold, [x, y - 0.15, 0.108], hb, 6, 4);
    box(0.022, 0.06, 0.04, C.steel, [x, y, 0.14], hb); // ricasso block
    box(0.012, 0.056, 0.86, C.steelLight, [x, y, 0.55], hb);
    box(0.014, 0.014, 0.62, C.steelDark, [x, y, 0.47], hb); // fuller
    {
      const g = new THREE.ConeGeometry(0.028, 0.13, 4);
      g.scale(0.22, 1, 1);
      g.rotateX(Math.PI / 2);
      P(g, C.steelLight, [x, y, 0.98 + 0.065], hb);
    }
    // nicks in the edge
    box(0.014, 0.012, 0.02, C.steelDark, [x, y + 0.024, 0.62], hb);
    box(0.014, 0.01, 0.015, C.steelDark, [x, y - 0.025, 0.8], hb);
    box(0.014, 0.01, 0.018, C.steelDark, [x, y + 0.025, 0.36], hb);
  }

  // ================= KITE SHIELD (left forearm) =================
  {
    const eb = arms.L.elbow;
    const sc = new THREE.Vector3(0.72, 1.4, 0.085);
    const kite = (k: number) => {
      const sh = new THREE.Shape();
      sh.moveTo(-0.28 * k, 0.36 * k);
      sh.quadraticCurveTo(0, 0.45 * k, 0.28 * k, 0.36 * k);
      sh.lineTo(0.27 * k, 0.02 * k);
      sh.quadraticCurveTo(0.22 * k, -0.36 * k, 0, -0.6 * k);
      sh.quadraticCurveTo(-0.22 * k, -0.36 * k, -0.27 * k, 0.02 * k);
      sh.lineTo(-0.28 * k, 0.36 * k);
      return sh;
    };
    const rim = new THREE.ExtrudeGeometry(kite(1), { depth: 0.03, bevelEnabled: false, curveSegments: 4 });
    P(rim, C.silver, sc, eb);
    const field = new THREE.ExtrudeGeometry(kite(0.9), { depth: 0.032, bevelEnabled: false, curveSegments: 4 });
    P(field, C.blue, sc.clone().add(new THREE.Vector3(0, -0.02, 0.003)), eb);
    // inner gold pinstripe
    const stripe = new THREE.ExtrudeGeometry(kite(0.84), { depth: 0.002, bevelEnabled: false, curveSegments: 4 });
    const inner = new THREE.ExtrudeGeometry(kite(0.82), { depth: 0.003, bevelEnabled: false, curveSegments: 4 });
    P(stripe, C.gold, sc.clone().add(new THREE.Vector3(0, -0.028, 0.035)), eb);
    P(inner, C.blue, sc.clone().add(new THREE.Vector3(0, -0.03, 0.0355)), eb);
    griffin([sc.x, sc.y + 0.01, sc.z + 0.04], 0.4, C.silver, eb, C.blueDark);
    // rivets on rim
    const pts = kite(0.955).getSpacedPoints(22);
    for (let i = 0; i < pts.length - 1; i++) {
      ball(0.009, C.gold, [sc.x + pts[i].x, sc.y + pts[i].y - 0.008, sc.z + 0.031], eb, 5, 3);
    }
    // battle damage
    const inside = (x: number, y: number) => y < 0.3 && y > -0.42 && Math.abs(x) < (y > 0 ? 0.2 : 0.2 * (y + 0.52) / 0.52);
    let made = 0, tries = 0;
    while (made < 9 && tries < 60) {
      tries++;
      const x = (rand() - 0.5) * 0.44, y = -0.45 + rand() * 0.75;
      if (!inside(x, y)) continue;
      const p = new THREE.Vector3(sc.x + x, sc.y + y, sc.z + 0.04);
      if (made % 3 === 0) dent(p, [0, 0, 1], 0.018 + rand() * 0.012, eb, C.blueDark);
      else scratch(p, [rand() - 0.5, rand() - 0.5, 0], 0.05 + rand() * 0.07, eb, C.steel);
      made++;
    }
    // deep gash across the field
    bar([sc.x - 0.17, sc.y + 0.2, sc.z + 0.039], [sc.x + 0.05, sc.y - 0.12, sc.z + 0.039], 0.012, 0.004, C.steelLight, eb);
    bar([sc.x - 0.16, sc.y + 0.19, sc.z + 0.041], [sc.x + 0.04, sc.y - 0.11, sc.z + 0.041], 0.004, 0.003, C.black, eb);
    dent([sc.x + 0.22, sc.y + 0.3, sc.z + 0.031], [0, 0, 1], 0.02, eb, C.dent);
    // enarmes (straps to the forearm)
    for (const x of [0.6, 0.74]) {
      box(0.03, 0.12, 0.045, C.leather, [x, 1.47, 0.062], eb);
      ball(0.008, C.gold, [x, 1.53, 0.075], eb, 5, 3);
    }
  }

  // ================= LEGS =================
  for (const [s, L] of [[1, "L"], [-1, "R"]] as [number, string][]) {
    const { hip, knee, ankle, toe } = legs[L];
    const hp: V3 = [s * 0.11, 0.95, 0];
    const kn: V3 = [s * 0.12, 0.52, 0.02];
    const an: V3 = [s * 0.12, 0.1, 0];
    // cuisse
    seg(hp, kn, 0.088, 0.066, C.steel, hip);
    ring(0.07, 0.006, C.gold, [s * 0.119, 0.6, 0.016], [s * 0.02, 1, -0.05], hip, 1, 10);
    bar([s * 0.115, 0.88, 0.085], [s * 0.12, 0.62, 0.07], 0.012, 0.008, C.steelLight, hip);
    damageTube(hp, kn, 0.08, hip, 3);
    // poleyn
    ball(0.067, C.steelLight, [kn[0], kn[1], kn[2] + 0.015], knee);
    {
      const c: V3 = [kn[0] + s * 0.058, kn[1], kn[2] + 0.025];
      const g = new THREE.CylinderGeometry(0.058, 0.058, 0.013, 7);
      orient(g, [s, 0, 0.3]);
      P(g, C.steel, c, knee);
      ring(0.058, 0.005, C.gold, c, [s, 0, 0.3], knee, 1, 10);
      ball(0.011, C.gold, [c[0] + s * 0.008, c[1], c[2] + 0.002], knee, 5, 4);
    }
    // greave
    seg(kn, an, 0.066, 0.05, C.steel, knee);
    bar([s * 0.12, 0.47, 0.084], [s * 0.12, 0.16, 0.054], 0.012, 0.01, C.steelLight, knee);
    ring(0.067, 0.006, C.gold, [s * 0.12, 0.47, 0.016], [0, 1, 0.05], knee, 1, 10);
    damageTube(kn, an, 0.058, knee, 3);
    // ankle
    ball(0.056, C.steelDark, an, ankle);
    // sabaton
    const x = s * 0.12;
    box(0.11, 0.06, 0.27, C.steelDark, [x, 0.03, 0.05], ankle);
    const lames = [
      [-0.06, 0.09, 0.06], [0.0, 0.08, 0.05], [0.05, 0.07, 0.045], [0.1, 0.062, 0.04], [0.15, 0.054, 0.035],
    ];
    lames.forEach(([z, y, h], i) => {
      box(0.118 - i * 0.006, h, 0.06, i % 2 ? C.steel : C.steelLight, [x, y - h / 2 + 0.01, z], i < 2 ? ankle : toe);
      box(0.12 - i * 0.006, 0.006, 0.008, C.gold, [x, y + 0.012 - h * 0.05, z + 0.028], i < 2 ? ankle : toe);
    });
    {
      const g = new THREE.ConeGeometry(0.045, 0.09, 4);
      g.rotateY(Math.PI / 4);
      g.scale(1, 1, 0.55);
      g.rotateX(Math.PI / 2);
      P(g, C.steel, [x, 0.03, 0.225], toe);
    }
    // spur
    bar([x + s * 0.05, 0.08, -0.04], [x, 0.075, -0.12], 0.008, 0.008, C.gold, ankle);
    bar([x - s * 0.05, 0.08, -0.04], [x, 0.075, -0.12], 0.008, 0.008, C.gold, ankle);
    {
      const g = new THREE.TorusGeometry(0.018, 0.004, 3, 6);
      orient(g, [1, 0, 0]);
      P(g, C.gold, [x, 0.075, -0.13], ankle);
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        const d: V3 = [0, Math.cos(a), Math.sin(a) * -1];
        const cg = new THREE.ConeGeometry(0.005, 0.02, 3);
        orient(cg, d);
        P(cg, C.gold, [x, 0.075 + d[1] * 0.024, -0.13 + d[2] * 0.024], ankle);
      }
    }
  }

  return b.root;
}
```