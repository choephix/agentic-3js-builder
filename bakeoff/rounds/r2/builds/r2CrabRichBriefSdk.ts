import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Red Rock Crab",
  description:
    "Feisty brick-red rock crab with one oversized raised claw, eyestalks, eight pointed walking legs, a barnacle and a strand of seaweed on its shell.",
};

const BRICK = "#a63a28";
const DARK_BRICK = "#7e2a1f";
const ORANGE = "#e4793a";
const CREAM = "#f1dfb8";
const BLACK = "#241615";
const BELLY = "#e0b48a";
const GREEN = "#3f7a3a";
const OLIVE = "#6b8f2e";

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = new THREE.Vector3(0, 1, 0);

export default function build() {
  const b = createBuilder({ name: "rockCrab" });
  const rand = mulberry(7);

  const body = b.joint("body", { at: [0, 0.05, 0] });

  // ---------- geometry helpers (model space) ----------
  const ellip = (c: THREE.Vector3, r: [number, number, number], dir: THREE.Vector3, color: string, bone: any, seg = 10) => {
    const g = new THREE.SphereGeometry(1, seg, Math.max(5, seg - 3));
    g.scale(r[0], r[1], r[2]);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()));
    g.translate(c.x, c.y, c.z);
    b.part(g, color, { bone });
  };
  const seg = (a: THREE.Vector3, e: THREE.Vector3, ra: number, re: number, color: string, bone: any, sides = 6) => {
    const d = e.clone().sub(a);
    const len = d.length();
    const g = new THREE.CylinderGeometry(re, ra, len, sides);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, d.clone().normalize()));
    const m = a.clone().add(e).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    b.part(g, color, { bone });
  };
  const ball = (c: THREE.Vector3, r: number, color: string, bone: any) => ellip(c, [r, r, r], UP, color, bone, 7);

  // ---------- shell ----------
  const C = V(0, 0.05, 0);
  const A = 0.12, H = 0.055, D = 0.088;
  ellip(C, [A, H, D], UP, BRICK, body, 14);
  ellip(V(0, 0.043, 0), [0.108, 0.02, 0.078], UP, BELLY, body, 10);
  // front brow ridge and rim
  ellip(V(0, 0.062, 0.062), [0.075, 0.012, 0.025], V(0, 0.2, 1), DARK_BRICK, body, 8);
  ellip(V(0, 0.05, 0), [0.124, 0.012, 0.092], UP, DARK_BRICK, body, 14);

  const surf = (ux: number, uz: number, lift = 0) => {
    const uy = Math.sqrt(Math.max(0, 1 - ux * ux - uz * uz));
    const n = V(ux / A, uy / H, uz / D).normalize();
    const p = V(C.x + ux * A, C.y + uy * H, C.z + uz * D).addScaledVector(n, lift);
    return { p, n };
  };

  // knobbly bumps
  const cols = [BRICK, ORANGE, "#c4502f", CREAM, DARK_BRICK];
  for (let i = 0; i < 34; i++) {
    const ang = rand() * Math.PI * 2;
    const rad = Math.sqrt(rand()) * 0.88;
    const ux = Math.cos(ang) * rad, uz = Math.sin(ang) * rad;
    if (uz > 0.55 && Math.abs(ux) < 0.45) continue;
    const { p, n } = surf(ux, uz, -0.002);
    const r = 0.007 + rand() * 0.008;
    ellip(p, [r, r * 0.7, r], n, cols[Math.floor(rand() * 3)], body, 6);
  }
  // speckles
  for (let i = 0; i < 80; i++) {
    const ang = rand() * Math.PI * 2;
    const rad = Math.sqrt(rand()) * 0.95;
    const ux = Math.cos(ang) * rad, uz = Math.sin(ang) * rad;
    const { p, n } = surf(ux, uz, 0.0005);
    const r = 0.0028 + rand() * 0.002;
    ellip(p, [r, r * 0.5, r], n, rand() > 0.5 ? ORANGE : CREAM, body, 5);
  }
  // spiky side teeth on the front-lateral edge
  for (let i = 0; i < 5; i++) {
    for (const s of [-1, 1]) {
      const a = 0.35 + i * 0.28; // angle from front toward side
      const p = V(s * Math.sin(a) * 0.118, 0.05, Math.cos(a) * 0.088 * 0.95);
      const n = V(s * Math.sin(a) / A, 0, Math.cos(a) / D).normalize();
      seg(p.clone().addScaledVector(n, -0.004), p.clone().addScaledVector(n, 0.012).add(V(0, 0.004, 0)), 0.006, 0.0008, ORANGE, body, 5);
    }
  }

  // ---------- jaw ----------
  const jaw = b.joint("jaw", { at: [0, 0.04, 0.082], parent: body });
  ellip(V(0, 0.038, 0.092), [0.03, 0.007, 0.012], UP, DARK_BRICK, jaw, 6);
  ellip(V(0, 0.049, 0.088), [0.028, 0.006, 0.012], UP, BRICK, body, 6);
  for (const s of [-1, 1]) ball(V(s * 0.012, 0.036, 0.1), 0.005, CREAM, jaw);

  // ---------- eyes ----------
  for (const [s, nm] of [[1, "L"], [-1, "R"]] as const) {
    const base = V(s * 0.036, 0.074, 0.074);
    const top = V(s * 0.046, 0.118, 0.088);
    const stalk = b.joint(`eyeStalk${nm}`, { at: [base.x, base.y, base.z], parent: body });
    const eye = b.joint(`eye${nm}`, { at: [top.x, top.y, top.z], parent: stalk });
    ellip(base.clone().add(V(0, 0.002, 0)), [0.011, 0.007, 0.011], UP, DARK_BRICK, stalk, 6);
    seg(base, top, 0.006, 0.0045, CREAM, stalk, 6);
    ball(top.clone().add(V(0, 0.004, 0.002)), 0.0115, "#f6eac4", eye);
    ball(top.clone().add(V(s * 0.002, 0.005, 0.011)), 0.0065, BLACK, eye);
    ball(top.clone().add(V(s * 0.004, 0.008, 0.0165)), 0.0016, "#ffffff", eye);
  }

  // ---------- walking legs ----------
  for (const [s, nm] of [[1, "L"], [-1, "R"]] as const) {
    for (let i = 0; i < 4; i++) {
      const z0 = 0.045 - i * 0.03;
      const f = (1.5 - i) * 0.014;
      const hipP = V(s * 0.103, 0.04, z0);
      const kneeP = V(s * 0.168, 0.082, z0 + f * 0.8);
      const ankP = V(s * 0.205, 0.05, z0 + f * 1.6);
      const tipP = V(s * 0.238, 0.0, z0 + f * 2.4);
      const hip = b.joint(`hip${nm}${i + 1}`, { at: [hipP.x, hipP.y, hipP.z], parent: body });
      const knee = b.joint(`knee${nm}${i + 1}`, { at: [kneeP.x, kneeP.y, kneeP.z], parent: hip });
      const ank = b.joint(`ankle${nm}${i + 1}`, { at: [ankP.x, ankP.y, ankP.z], parent: knee });
      ball(hipP, 0.011, DARK_BRICK, hip);
      seg(hipP, kneeP, 0.0095, 0.008, BRICK, hip);
      ball(kneeP, 0.0095, ORANGE, knee);
      seg(kneeP, ankP, 0.0082, 0.0062, BRICK, knee);
      ball(ankP, 0.0066, DARK_BRICK, ank);
      seg(ankP, tipP, 0.0058, 0.0007, CREAM, ank, 5);
      // little spikes on thigh
      const mid = hipP.clone().lerp(kneeP, 0.55);
      seg(mid.clone().add(V(0, 0.006, 0)), mid.clone().add(V(0, 0.016, 0)), 0.003, 0.0005, ORANGE, hip, 4);
    }
  }

  // ---------- claws ----------
  const claw = (
    nm: string, sh: THREE.Vector3, el: THREE.Vector3, wr: THREE.Vector3,
    d: THREE.Vector3, s: number, open: number,
  ) => {
    d = d.clone().normalize();
    const side = d.clone().cross(V(0, 0, 1)).normalize();
    const shJ = b.joint(`shoulder${nm}`, { at: [sh.x, sh.y, sh.z], parent: body });
    const elJ = b.joint(`elbow${nm}`, { at: [el.x, el.y, el.z], parent: shJ });
    const wrJ = b.joint(`wrist${nm}`, { at: [wr.x, wr.y, wr.z], parent: elJ });
    const pivot = wr.clone().addScaledVector(d, 0.085 * s).addScaledVector(side, 0.014 * s);
    const jawJ = b.joint(`clawJaw${nm}`, { at: [pivot.x, pivot.y, pivot.z], parent: wrJ });

    ball(sh, 0.017, DARK_BRICK, shJ);
    seg(sh, el, 0.017, 0.015, BRICK, shJ);
    ball(el, 0.0165, ORANGE, elJ);
    seg(el, wr, 0.015, 0.013 * s, BRICK, elJ);
    ball(wr, 0.015 * s, DARK_BRICK, wrJ);
    // palm
    ellip(wr.clone().addScaledVector(d, 0.045 * s), [0.036 * s, 0.056 * s, 0.027 * s], d, BRICK, wrJ, 10);
    for (let i = 0; i < 9; i++) {
      const a = rand() * Math.PI * 2, t = 0.2 + rand() * 0.7;
      const q = wr.clone().addScaledVector(d, (0.02 + t * 0.07) * s)
        .addScaledVector(side, Math.cos(a) * 0.03 * s).add(V(0, 0, Math.sin(a) * 0.022 * s));
      ball(q, 0.005 * s, i % 2 ? ORANGE : CREAM, wrJ);
    }
    // fixed finger (inner side) and moving finger
    const bF = wr.clone().addScaledVector(d, 0.088 * s).addScaledVector(side, -0.014 * s);
    const mF = wr.clone().addScaledVector(d, 0.125 * s).addScaledVector(side, -0.014 * s);
    const tF = wr.clone().addScaledVector(d, 0.165 * s).addScaledVector(side, -0.004 * s);
    seg(bF, mF, 0.016 * s, 0.012 * s, BRICK, wrJ);
    seg(mF, tF, 0.012 * s, 0.0008, BLACK, wrJ);
    const bM = pivot.clone();
    const mM = wr.clone().addScaledVector(d, 0.122 * s).addScaledVector(side, (0.017 + open) * s);
    const tM = wr.clone().addScaledVector(d, 0.16 * s).addScaledVector(side, (0.012 + open * 1.4) * s - 0.0 * s);
    ball(pivot, 0.0105 * s, DARK_BRICK, jawJ);
    seg(bM, mM, 0.0135 * s, 0.01 * s, BRICK, jawJ);
    seg(mM, tM, 0.01 * s, 0.0008, BLACK, jawJ);
    // teeth
    for (let i = 0; i < 4; i++) {
      const t = 0.15 + i * 0.22;
      const pf = bF.clone().lerp(mF, t).addScaledVector(side, 0.009 * s);
      seg(pf, pf.clone().addScaledVector(side, 0.007 * s).addScaledVector(d, 0.004 * s), 0.0032 * s, 0.0004, CREAM, wrJ, 4);
      const pm = bM.clone().lerp(mM, t).addScaledVector(side, -0.008 * s);
      seg(pm, pm.clone().addScaledVector(side, -0.007 * s).addScaledVector(d, 0.004 * s), 0.0032 * s, 0.0004, CREAM, jawJ, 4);
    }
  };
  claw("L", V(0.1, 0.055, 0.07), V(0.17, 0.095, 0.115), V(0.2, 0.15, 0.15), V(-0.1, 0.8, 0.45), 1.45, 0.012);
  claw("R", V(-0.1, 0.055, 0.07), V(-0.15, 0.065, 0.125), V(-0.14, 0.075, 0.175), V(0.2, 0.2, 1), 0.75, 0.004);

  // ---------- barnacle ----------
  {
    const { p, n } = surf(-0.4, -0.35, -0.003);
    const top = p.clone().addScaledVector(n, 0.022);
    seg(p, top, 0.017, 0.011, CREAM, body, 8);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const q = p.clone().add(V(Math.cos(a) * 0.014, 0, Math.sin(a) * 0.014));
      seg(q, q.clone().addScaledVector(n, 0.019), 0.0035, 0.0025, "#d9c79d", body, 4);
    }
    seg(top.clone().addScaledVector(n, -0.002), top.clone().addScaledVector(n, 0.002), 0.0095, 0.0085, BLACK, body, 8);
    const small = surf(-0.25, -0.5, -0.002);
    seg(small.p, small.p.clone().addScaledVector(small.n, 0.012), 0.009, 0.006, CREAM, body, 7);
  }

  // ---------- seaweed ----------
  {
    const start = surf(0.3, -0.45, -0.003).p;
    for (let k = 0; k < 3; k++) {
      let cur = start.clone().add(V((k - 1) * 0.006, 0, k * 0.004));
      const len = 7 + k;
      for (let i = 0; i < len; i++) {
        const t = i / len;
        const nxt = cur.clone().add(V(Math.sin(i * 0.9 + k) * 0.012 + 0.008 * (k - 1), 0.016 - t * 0.006, -0.012 - 0.003 * k));
        const w = 0.0045 * (1 - t * 0.6);
        seg(cur, nxt, w, w * 0.8, k === 1 ? OLIVE : GREEN, body, 4);
        if (i % 2 === 1) {
          const m = cur.clone().lerp(nxt, 0.5);
          ellip(m.clone().add(V(0.008 * (i % 4 === 1 ? 1 : -1), 0.003, 0)), [0.009, 0.0025, 0.005], V(i % 4 === 1 ? 1 : -1, 0.3, 0), k === 1 ? GREEN : OLIVE, body, 5);
        }
        cur = nxt;
      }
    }
  }

  return b.root;
}
