import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Emperor Penguin & Chick",
  description:
    "A proud emperor penguin parent with a glossy blue-black back, crisp white belly, golden ear patches and neck bib, a slender beak with an orange-pink stripe and big black feet. A fluffy grey chick peeks out from under the brood fold between its feet.",
};

export default function build() {
  const b: any = createBuilder({ name: "emperorPenguin" });

  // ---------- palette ----------
  const C = {
    head: "#12151c",
    back: "#262e3e",
    sheen: "#3b4a66",
    sheen2: "#52668c",
    white: "#f4f2ec",
    cream: "#fff3d6",
    paleYellow: "#fbe39a",
    gold: "#f7b733",
    ear: "#f39a1e",
    beak: "#17171b",
    stripe: "#f0866a",
    feet: "#1e1f26",
    claw: "#3a3b44",
    eye: "#0a0a0d",
    glint: "#ffffff",
    eyeRing: "#3a4152",
    chick: "#a7adb4",
    chickL: "#c3c8ce",
    chickD: "#8c929a",
    chickHead: "#1a1c22",
  };

  // ---------- random ----------
  const R: any = rng(7);
  const rand = (): number =>
    typeof R === "function" ? R() : typeof R.next === "function" ? R.next() : R.float();

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.3, 0] });
  const spine = b.joint("spine", { at: [0, 0.55, 0], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.78, 0], parent: spine });
  const neck = b.joint("neck", { at: [0, 0.95, 0.02], parent: chest });
  const head = b.joint("head", { at: [0, 1.04, 0.04], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 1.012, 0.12], parent: head });
  const flipperL = b.joint("flipperL", { at: [0.175, 0.8, 0], parent: chest });
  const flipperTipL = b.joint("flipperTipL", { at: [0.245, 0.6, 0], parent: flipperL });
  const flipperR = b.joint("flipperR", { at: [-0.175, 0.8, 0], parent: chest });
  const flipperTipR = b.joint("flipperTipR", { at: [-0.245, 0.6, 0], parent: flipperR });
  const hipL = b.joint("hipL", { at: [0.1, 0.16, 0.02], parent: hips });
  const ankleL = b.joint("ankleL", { at: [0.1, 0.04, 0.04], parent: hipL });
  const toeL = b.joint("toeL", { at: [0.1, 0.02, 0.15], parent: ankleL });
  const hipR = b.joint("hipR", { at: [-0.1, 0.16, 0.02], parent: hips });
  const ankleR = b.joint("ankleR", { at: [-0.1, 0.04, 0.04], parent: hipR });
  const toeR = b.joint("toeR", { at: [-0.1, 0.02, 0.15], parent: ankleR });
  const tail1 = b.joint("tail1", { at: [0, 0.14, -0.16], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.04, -0.26], parent: tail1 });
  const chickBody = b.joint("chickBody", { at: [0, 0.1, 0.24], parent: hips });
  const chickHeadJ = b.joint("chickHead", { at: [0, 0.23, 0.265], parent: chickBody });
  const chickJaw = b.joint("chickJaw", { at: [0, 0.22, 0.32], parent: chickHeadJ });
  const chickWingL = b.joint("chickWingL", { at: [0.085, 0.12, 0.24], parent: chickBody });
  const chickWingR = b.joint("chickWingR", { at: [-0.085, 0.12, 0.24], parent: chickBody });
  void flipperTipL; void flipperTipR; void toeL; void toeR; void tail2;

  const P = (geo: THREE.BufferGeometry, color: string, at: number[], bone: any) =>
    b.part(geo, color, { at, bone });

  const ell = (rx: number, ry: number, rz: number, w = 10, h = 7) => {
    const g = new THREE.SphereGeometry(1, w, h);
    g.scale(rx, ry, rz);
    return g;
  };

  // ---------- parent body (lathe profile) ----------
  const prof: number[][] = [
    [0.03, 0.0], [0.045, 0.07], [0.08, 0.13], [0.18, 0.18], [0.32, 0.21],
    [0.48, 0.212], [0.64, 0.19], [0.78, 0.15], [0.9, 0.112], [0.98, 0.085], [1.02, 0.0],
  ];
  const rAt = (y: number): number => {
    if (y <= prof[0][0]) return prof[0][1];
    for (let i = 0; i < prof.length - 1; i++) {
      const [y0, r0] = prof[i];
      const [y1, r1] = prof[i + 1];
      if (y >= y0 && y <= y1) return r0 + ((y - y0) / (y1 - y0)) * (r1 - r0);
    }
    return 0;
  };
  const DEPTH = 1.08;
  const band = (y0: number, y1: number, s: number, half: number, seg: number, steps: number) => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= steps; i++) {
      const y = y0 + ((y1 - y0) * i) / steps;
      pts.push(new THREE.Vector2(Math.max(rAt(y) * s, 0.001), y));
    }
    const g = new THREE.LatheGeometry(pts, seg, -half, half * 2);
    g.scale(1, 1, DEPTH);
    return g;
  };

  // main dark body
  {
    const pts = prof.map(([y, r]) => new THREE.Vector2(Math.max(r, 0.0005), y));
    const g = new THREE.LatheGeometry(pts, 14);
    g.scale(1, 1, DEPTH);
    P(g, C.back, [0, 0, 0], spine);
  }
  // crisp white belly
  P(band(0.05, 0.8, 1.025, 1.12, 10, 12), C.white, [0, 0, 0], spine);
  // soft cream wash at the lower belly
  P(band(0.06, 0.3, 1.035, 0.7, 6, 5), C.cream, [0, 0, 0], hips);
  // pale-yellow bib blending to gold at the throat
  P(band(0.72, 0.86, 1.04, 1.0, 8, 4), C.paleYellow, [0, 0, 0], chest);
  P(band(0.84, 0.955, 1.05, 0.82, 8, 4), C.gold, [0, 0, 0], neck);

  // glossy blue sheen chips on the back
  for (let i = 0; i < 70; i++) {
    const y = 0.2 + rand() * 0.66;
    const phi = Math.PI + (rand() * 2 - 1) * 1.35;
    const r = rAt(y) * 0.995;
    const g = ell(0.022 + rand() * 0.012, 0.03 + rand() * 0.012, 0.006, 6, 4);
    g.rotateY(phi);
    const at = [r * Math.sin(phi), y, r * Math.cos(phi) * DEPTH];
    P(g, rand() < 0.65 ? C.sheen : C.sheen2, at, y > 0.65 ? chest : spine);
  }
  // shoulder highlight streaks (gloss)
  for (const s of [1, -1]) {
    const g = ell(0.012, 0.12, 0.03, 6, 5);
    g.rotateZ(-0.25 * s);
    g.rotateY(Math.PI + 0.55 * s);
    P(g, C.sheen2, [0.13 * s, 0.7, -0.13], chest);
  }

  // brood-pouch fold drooping over the chick
  P(ell(0.15, 0.05, 0.09, 12, 6), C.white, [0, 0.335, 0.155], hips);
  P(ell(0.13, 0.03, 0.07, 10, 5), C.cream, [0, 0.305, 0.17], hips);

  // ---------- head ----------
  const hc = [0, 1.04, 0.03];
  const HR = 0.095;
  {
    const g = ell(HR, HR * 0.98, HR * 1.15, 12, 9);
    P(g, C.head, hc, head);
  }
  const onHead = (nx: number, ny: number, nz: number, k = 1) => {
    const l = Math.hypot(nx, ny, nz);
    return [hc[0] + (nx / l) * HR * k, hc[1] + (ny / l) * HR * 0.98 * k, hc[2] + (nz / l) * HR * 1.15 * k];
  };

  // eyes
  for (const s of [1, -1]) {
    const p = onHead(0.62 * s, 0.28, 0.72, 0.96);
    const ring = new THREE.TorusGeometry(0.016, 0.004, 4, 10);
    ring.rotateY(0.7 * s);
    P(ring, C.eyeRing, p, head);
    P(new THREE.SphereGeometry(0.014, 8, 6), C.eye, p, head);
    P(new THREE.SphereGeometry(0.0045, 5, 4), C.glint, [p[0] + 0.009 * s, p[1] + 0.006, p[2] + 0.009], head);
  }

  // golden ear patches sweeping down the neck
  for (const s of [1, -1]) {
    const g1 = ell(0.022, 0.055, 0.04, 8, 6);
    g1.rotateZ(0.25 * s);
    P(g1, C.ear, [0.083 * s, 1.0, -0.005], head);
    const g2 = ell(0.026, 0.05, 0.042, 8, 6);
    g2.rotateZ(0.2 * s);
    P(g2, C.gold, [0.095 * s, 0.94, 0.03], neck);
    const g3 = ell(0.02, 0.035, 0.035, 8, 6);
    P(g3, C.paleYellow, [0.1 * s, 0.885, 0.07], neck);
  }

  // beak: long slender, gently down-curved
  {
    const len = 0.15;
    const g = new THREE.ConeGeometry(0.022, len, 8);
    g.translate(0, len / 2, 0);
    g.rotateX(Math.PI / 2);
    g.rotateX(0.14);
    g.scale(0.72, 1, 1);
    P(g, C.beak, [0, 1.036, 0.12], head);
  }
  {
    const len = 0.13;
    const g = new THREE.ConeGeometry(0.016, len, 8);
    g.translate(0, len / 2, 0);
    g.rotateX(Math.PI / 2);
    g.rotateX(0.22);
    g.scale(0.75, 0.8, 1);
    P(g, C.beak, [0, 1.014, 0.12], jaw);
    // orange-pink mandible stripe
    const sl = 0.085;
    const st = new THREE.ConeGeometry(0.017, sl, 8);
    st.translate(0, sl / 2, 0);
    st.rotateX(Math.PI / 2);
    st.rotateX(0.22);
    st.scale(0.95, 0.55, 1);
    P(st, C.stripe, [0, 1.011, 0.122], jaw);
  }

  // ---------- flippers ----------
  for (const s of [1, -1]) {
    const bone = s > 0 ? flipperL : flipperR;
    const at = [0.175 * s, 0.8, 0.0];
    const g = ell(0.022, 0.2, 0.065, 8, 8);
    g.translate(0, -0.17, 0);
    g.rotateZ(0.35 * s);
    P(g, C.head, at, bone);
    const w = ell(0.016, 0.18, 0.056, 8, 8);
    w.translate(-0.011 * s, -0.17, 0.004);
    w.rotateZ(0.35 * s);
    P(w, C.white, at, bone);
    const edge = ell(0.008, 0.16, 0.012, 5, 6);
    edge.translate(0.012 * s, -0.16, 0.05);
    edge.rotateZ(0.35 * s);
    P(edge, C.sheen2, at, bone);
  }

  // ---------- tail ----------
  {
    const len = 0.13;
    const g = new THREE.ConeGeometry(0.05, len, 6);
    g.translate(0, len / 2, 0);
    g.rotateX(-Math.PI / 2);
    g.rotateX(-0.6);
    g.scale(1.3, 0.6, 1);
    P(g, C.head, [0, 0.11, -0.17], tail1);
  }

  // ---------- legs & big black feet ----------
  for (const s of [1, -1]) {
    const hipB = s > 0 ? hipL : hipR;
    const ankB = s > 0 ? ankleL : ankleR;
    const leg = new THREE.CylinderGeometry(0.03, 0.035, 0.12, 7);
    P(leg, C.feet, [0.1 * s, 0.1, 0.03], hipB);
    P(ell(0.058, 0.022, 0.07, 9, 6), C.feet, [0.1 * s, 0.022, 0.06], ankB);
    const heel = [0.1 * s, 0.022, 0.05];
    for (const a of [-0.42, 0, 0.42]) {
      const th = a + 0.18 * s;
      const tl = 0.1;
      const toe = new THREE.CapsuleGeometry(0.016, tl, 3, 7);
      toe.rotateX(Math.PI / 2);
      toe.scale(1, 0.75, 1);
      toe.rotateY(th);
      const mid = [heel[0] + Math.sin(th) * tl * 0.5, 0.017, heel[2] + Math.cos(th) * tl * 0.5];
      P(toe, C.feet, mid, ankB);
      const cl = 0.03;
      const claw = new THREE.ConeGeometry(0.008, cl, 5);
      claw.translate(0, cl / 2, 0);
      claw.rotateX(Math.PI / 2 + 0.3);
      claw.rotateY(th);
      const tip = [heel[0] + Math.sin(th) * (tl + 0.005), 0.016, heel[2] + Math.cos(th) * (tl + 0.005)];
      P(claw, C.claw, tip, ankB);
      // scaly toe bands
      for (let k = 0; k < 2; k++) {
        const f = 0.45 + k * 0.25;
        const band2 = new THREE.TorusGeometry(0.0155, 0.003, 3, 8);
        band2.rotateY(th);
        P(band2, C.claw, [heel[0] + Math.sin(th) * tl * f, 0.018, heel[2] + Math.cos(th) * tl * f], ankB);
      }
    }
  }

  // ---------- the chick ----------
  const cb = [0, 0.1, 0.24];
  P(ell(0.09, 0.1, 0.085, 12, 9), C.chick, cb, chickBody);
  // fluffy down tufts
  for (let i = 0; i < 70; i++) {
    const u = rand() * 2 - 1;
    const t = rand() * Math.PI * 2;
    let ny = u;
    if (ny < -0.45) ny = -0.45 + rand() * 0.2;
    const rr = Math.sqrt(Math.max(0, 1 - ny * ny));
    const nx = rr * Math.cos(t);
    const nz = rr * Math.sin(t);
    const g = new THREE.IcosahedronGeometry(0.02 + rand() * 0.012, 0);
    g.rotateX(rand() * 3);
    g.rotateY(rand() * 3);
    const at = [cb[0] + nx * 0.088, cb[1] + ny * 0.098, cb[2] + nz * 0.083];
    const pick = rand();
    P(g, pick < 0.4 ? C.chickL : pick < 0.75 ? C.chick : C.chickD, at, chickBody);
  }
  // little flipper nubs
  for (const s of [1, -1]) {
    const g = ell(0.016, 0.045, 0.03, 7, 6);
    g.rotateZ(0.5 * s);
    P(g, C.chickD, [0.092 * s, 0.11, 0.25], s > 0 ? chickWingL : chickWingR);
  }
  // chick head: black cap with white face mask
  const ch = [0, 0.235, 0.27];
  P(ell(0.062, 0.058, 0.06, 10, 8), C.chickHead, ch, chickHeadJ);
  for (const s of [1, -1]) {
    P(ell(0.032, 0.036, 0.026, 8, 6), C.white, [ch[0] + 0.03 * s, ch[1] + 0.002, ch[2] + 0.04], chickHeadJ);
    const ep = [ch[0] + 0.031 * s, ch[1] + 0.01, ch[2] + 0.064];
    P(new THREE.SphereGeometry(0.0095, 7, 5), C.eye, ep, chickHeadJ);
    P(new THREE.SphereGeometry(0.0033, 4, 3), C.glint, [ep[0] + 0.004 * s, ep[1] + 0.005, ep[2] + 0.007], chickHeadJ);
  }
  // fuzzy crown tufts
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const g = new THREE.ConeGeometry(0.008, 0.03, 4);
    g.rotateZ(Math.cos(a) * 0.5);
    g.rotateX(Math.sin(a) * 0.5);
    P(g, C.chickD, [ch[0] + Math.cos(a) * 0.015, ch[1] + 0.06, ch[2] - 0.005 + Math.sin(a) * 0.015], chickHeadJ);
  }
  // chick beak (upper + jaw)
  {
    const l = 0.028;
    const g = new THREE.ConeGeometry(0.008, l, 6);
    g.translate(0, l / 2, 0);
    g.rotateX(Math.PI / 2 + 0.15);
    P(g, C.chickHead, [0, 0.226, 0.322], chickHeadJ);
    const lj = new THREE.ConeGeometry(0.006, 0.022, 6);
    lj.translate(0, 0.011, 0);
    lj.rotateX(Math.PI / 2 + 0.25);
    P(lj, C.claw, [0, 0.219, 0.32], chickJaw);
  }

  return b.root;
}
