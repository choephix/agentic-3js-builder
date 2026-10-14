import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Phoenix Rising",
  description:
    "A phoenix with wings flung open, feathers blazing from crimson to gold, a flame crest, ribbon tail feathers, amber eyes, a golden hooked beak and drifting embers.",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---- fire colour ramp -------------------------------------------------------
const STOPS = ["#6e0614", "#b80f1a", "#e8321a", "#ff6a10", "#ff9d0a", "#ffc928", "#fff07a"].map(
  (c) => new THREE.Color(c)
);
function heat(g: number): string {
  g = Math.max(0, Math.min(1, g));
  g = Math.round(g * 12) / 12;
  const f = g * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(f));
  const c = STOPS[i].clone().lerp(STOPS[i + 1], f - i);
  return "#" + c.getHexString();
}

function cubic(p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, t: number) {
  const u = 1 - t;
  return p0
    .clone()
    .multiplyScalar(u * u * u)
    .addScaledVector(p1, 3 * u * u * t)
    .addScaledVector(p2, 3 * u * t * t)
    .addScaledVector(p3, t * t * t);
}

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const R = rng(11);

  // ---- skeleton -------------------------------------------------------------
  const body = b.joint("body", { at: [0, 2.3, 0] });
  const chest = b.joint("chest", { at: [0, 2.55, 0.5], parent: body });
  const neck1 = b.joint("neck1", { at: [0, 2.8, 0.85], parent: chest });
  const neck2 = b.joint("neck2", { at: [0, 3.1, 1.05], parent: neck1 });
  const head = b.joint("head", { at: [0, 3.4, 1.22], parent: neck2 });
  const jaw = b.joint("jaw", { at: [0, 3.35, 1.4], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 2.05, -0.75], parent: body });
  const tail2 = b.joint("tail2", { at: [0, 1.6, -1.6], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 1.0, -2.4], parent: tail2 });

  const wingJ: Record<number, any> = {};
  const legJ: Record<number, any> = {};
  const SH: Record<number, THREE.Vector3> = {};
  const EL: Record<number, THREE.Vector3> = {};
  const WR: Record<number, THREE.Vector3> = {};
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    SH[s] = V(s * 0.38, 2.7, 0.15);
    EL[s] = V(s * 1.5, 3.0, -0.1);
    WR[s] = V(s * 2.6, 3.4, 0.0);
    const sh = b.joint("shoulder" + n, { at: SH[s].toArray() as any, parent: chest });
    const el = b.joint("elbow" + n, { at: EL[s].toArray() as any, parent: sh });
    const wr = b.joint("wrist" + n, { at: WR[s].toArray() as any, parent: el });
    const tp = b.joint("wingtip" + n, { at: [s * 4.4, 3.9, -0.3], parent: wr });
    wingJ[s] = { sh, el, wr, tp };
    const hip = b.joint("hip" + n, { at: [s * 0.22, 2.0, -0.1], parent: body });
    const knee = b.joint("knee" + n, { at: [s * 0.28, 1.7, -0.3], parent: hip });
    const ankle = b.joint("ankle" + n, { at: [s * 0.3, 1.35, -0.12], parent: knee });
    const foot = b.joint("foot" + n, { at: [s * 0.3, 1.2, 0.05], parent: ankle });
    legJ[s] = { hip, knee, ankle, foot };
  }

  // ---- helpers --------------------------------------------------------------
  const add = (geo: THREE.BufferGeometry, color: string, bone: any) => b.part(geo, color, { bone });

  function rod(a: THREE.Vector3, c: THREE.Vector3, r0: number, r1: number, color: string, bone: any, seg = 6) {
    const d = c.clone().sub(a);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, seg);
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.normalize());
    g.applyMatrix4(new THREE.Matrix4().compose(a.clone().add(c).multiplyScalar(0.5), q, V(1, 1, 1)));
    return add(g, color, bone);
  }
  function ball(p: THREE.Vector3, sc: [number, number, number], color: string, bone: any, seg = 8) {
    const g = new THREE.SphereGeometry(1, seg, Math.max(4, seg - 2));
    g.applyMatrix4(new THREE.Matrix4().compose(p, new THREE.Quaternion(), V(sc[0], sc[1], sc[2])));
    return add(g, color, bone);
  }
  function coneDir(base: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, color: string, bone: any, seg = 6) {
    const g = new THREE.ConeGeometry(r, len, seg);
    const d = dir.clone().normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d);
    g.applyMatrix4(new THREE.Matrix4().compose(base.clone().addScaledVector(d, len / 2), q, V(1, 1, 1)));
    return add(g, color, bone);
  }

  // flat double-sided ribbon feather, split into colour groups
  function ribbon(
    bone: any,
    pts: THREE.Vector3[],
    W: number,
    hint: THREE.Vector3,
    colorFn: (t: number) => string,
    K: number,
    profile: (t: number) => number = (t) => Math.pow(Math.sin(Math.PI * Math.pow(t, 0.7)), 0.75)
  ) {
    const N = pts.length - 1;
    const L: THREE.Vector3[] = [];
    const Rr: THREE.Vector3[] = [];
    for (let i = 0; i <= N; i++) {
      const T = pts[Math.min(N, i + 1)].clone().sub(pts[Math.max(0, i - 1)]).normalize();
      let side = T.clone().cross(hint);
      if (side.lengthSq() < 1e-6) side = T.clone().cross(V(1, 0, 0));
      side.normalize();
      const w = Math.max(0.003, W * profile(i / N));
      L.push(pts[i].clone().addScaledVector(side, w));
      Rr.push(pts[i].clone().addScaledVector(side, -w));
    }
    const per = Math.max(1, Math.floor(N / K));
    for (let k = 0; k < K; k++) {
      const i0 = k * per;
      const i1 = k === K - 1 ? N : (k + 1) * per;
      const arr: number[] = [];
      const tri = (a: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3) => {
        arr.push(a.x, a.y, a.z, c.x, c.y, c.z, d.x, d.y, d.z);
        arr.push(a.x, a.y, a.z, d.x, d.y, d.z, c.x, c.y, c.z);
      };
      for (let i = i0; i < i1; i++) {
        tri(L[i], Rr[i], L[i + 1]);
        tri(Rr[i], Rr[i + 1], L[i + 1]);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
      g.computeVertexNormals();
      add(g, colorFn((k + 0.5) / K), bone);
    }
  }

  function straight(base: THREE.Vector3, dir: THREE.Vector3, len: number, curl: THREE.Vector3, bend: number, N: number) {
    const d = dir.clone().normalize();
    const out: THREE.Vector3[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      out.push(base.clone().addScaledVector(d, len * t).addScaledVector(curl, bend * t * t));
    }
    return out;
  }

  // ---- body -----------------------------------------------------------------
  const tilt = new THREE.Matrix4().makeRotationX(-0.35).setPosition(0, 2.3, 0);
  {
    const g = new THREE.SphereGeometry(1, 10, 8);
    g.applyMatrix4(new THREE.Matrix4().makeScale(0.5, 0.56, 0.98));
    g.applyMatrix4(tilt);
    add(g, "#a01018", body);
  }
  // belly glow
  {
    const g = new THREE.SphereGeometry(1, 8, 6);
    g.applyMatrix4(new THREE.Matrix4().makeScale(0.36, 0.38, 0.75));
    g.applyMatrix4(new THREE.Matrix4().makeTranslation(0, -0.12, 0.1));
    g.applyMatrix4(tilt);
    add(g, "#ff7a14", chest);
  }
  // breast feathers
  for (let r = 0; r < 4; r++) {
    const zr = 0.65 - r * 0.38;
    const k = Math.sqrt(Math.max(0.05, 1 - (zr / 0.98) ** 2)) * 1.03;
    for (let i = 0; i < 10; i++) {
      const phi = (i / 10) * Math.PI * 2 + r * 0.3;
      const pl = V(0.5 * Math.cos(phi) * k, 0.56 * Math.sin(phi) * k, zr).applyMatrix4(tilt);
      const nl = V(Math.cos(phi), Math.sin(phi), 0).transformDirection(tilt);
      const dl = V(Math.cos(phi) * 0.35, Math.sin(phi) * 0.35, -1).transformDirection(tilt);
      const pts = straight(pl, dl, 0.55, nl, 0.12, 4);
      ribbon(chest, pts, 0.12, nl, (t) => heat(0.05 + r * 0.08 + t * 0.35), 2);
    }
  }

  // neck
  rod(V(0, 2.6, 0.75), V(0, 3.1, 1.05), 0.3, 0.2, "#c8161d", neck1, 7);
  rod(V(0, 3.05, 1.02), V(0, 3.4, 1.22), 0.22, 0.2, "#e8421a", neck2, 7);
  // neck ruff
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const base = V(Math.cos(a) * 0.2, 3.2 + Math.sin(a) * 0.2, 1.1);
    const out = V(Math.cos(a), Math.sin(a), 0);
    const pts = straight(base, V(out.x * 0.3, out.y * 0.3, -0.2), 0.4, V(0, -0.3, 0), 0.2, 4);
    ribbon(neck2, pts, 0.07, out, (t) => heat(0.45 + t * 0.4), 2);
  }

  // head
  ball(V(0, 3.42, 1.25), [0.26, 0.25, 0.3], "#ff7a14", head, 9);
  ball(V(0, 3.5, 1.2), [0.22, 0.16, 0.24], "#e8321a", head, 7);
  // beak
  coneDir(V(0, 3.4, 1.42), V(0, -0.05, 1), 0.3, 0.1, "#f5bd1f", head, 6);
  coneDir(V(0, 3.4, 1.68), V(0, -1, 0.5), 0.14, 0.05, "#d98a0a", head, 5);
  ball(V(0, 3.41, 1.5), [0.07, 0.04, 0.12], "#d98a0a", head, 5);
  // lower jaw
  coneDir(V(0, 3.35, 1.38), V(0, -0.02, 1), 0.26, 0.075, "#e0a014", jaw, 6);
  // eyes
  for (const s of [1, -1]) {
    ball(V(s * 0.19, 3.47, 1.34), [0.065, 0.065, 0.055], "#ffb000", head, 8);
    ball(V(s * 0.225, 3.47, 1.37), [0.03, 0.04, 0.03], "#3a0800", head, 5);
    coneDir(V(s * 0.17, 3.54, 1.36), V(s * 0.6, 0.5, 0.2), 0.14, 0.025, "#7a0a12", head, 4);
  }

  // crest of flame plumes
  for (let j = 0; j < 7; j++) {
    const sx = (j - 3) / 3;
    const p0 = V(sx * 0.07, 3.6, 1.15 - Math.abs(sx) * 0.05);
    const h = 1.2 - Math.abs(sx) * 0.4;
    const p1 = p0.clone().add(V(sx * 0.25, 0.4, -0.1));
    const p2 = p0.clone().add(V(sx * 0.5, h * 0.7, -0.5));
    const p3 = p0.clone().add(V(sx * 0.6, h, -1.0 - 0.2 * (1 - Math.abs(sx))));
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 8; i++) pts.push(cubic(p0, p1, p2, p3, i / 8));
    ribbon(head, pts, 0.1, V(1, 0, sx * 0.5), (t) => heat(0.45 + t * 0.55), 4, (t) =>
      Math.pow(Math.sin(Math.PI * Math.pow(t, 0.6)), 0.7)
    );
  }

  // ---- wings ----------------------------------------------------------------
  for (const s of [1, -1]) {
    const w = wingJ[s];
    const armPt = (u: number) =>
      u < 0.5 ? SH[s].clone().lerp(EL[s], u * 2) : EL[s].clone().lerp(WR[s], (u - 0.5) * 2);
    rod(SH[s], EL[s], 0.16, 0.12, "#a01018", w.sh, 6);
    rod(EL[s], WR[s], 0.12, 0.09, "#b80f1a", w.el, 6);
    rod(WR[s], V(s * 3.3, 3.6, -0.05), 0.09, 0.04, "#c8161d", w.wr, 5);
    ball(EL[s], [0.15, 0.15, 0.15], "#d8221c", w.el, 6);
    ball(WR[s], [0.12, 0.12, 0.12], "#e8421a", w.wr, 6);
    const up = V(0, 1, 0);

    // secondaries (trailing)
    for (let i = 0; i < 11; i++) {
      const u = i / 10;
      const ang = 0.1 + u * 1.0;
      const dir = V(s * Math.sin(ang), 0.04, -Math.cos(ang));
      const base = armPt(u * 0.95).add(V(0, -0.03 + (i % 2) * 0.012, -0.05));
      const pts = straight(base, dir, 1.9 - 0.6 * u, up, 0.25, 6);
      ribbon(wingJ[s].el, pts, 0.21, up, (t) => heat(0.18 + u * 0.15 + t * 0.62), 3);
    }
    // primaries (fan at the hand)
    for (let i = 0; i < 11; i++) {
      const f = i / 10;
      const ang = 0.9 + f * 1.1; // from outward-back to outward-forward
      const dir = V(s * Math.sin(ang), 0.1, -Math.cos(ang));
      const len = 1.5 + 1.0 * Math.sin(Math.PI * (f * 0.8 + 0.1));
      const base = armPt(0.82 + f * 0.18).add(V(0, (i % 2) * 0.012, 0));
      const pts = straight(base, dir, len, up, 0.5 + f * 0.2, 7);
      ribbon(wingJ[s].wr, pts, 0.2, up, (t) => heat(0.42 + t * 0.58), 4);
    }
    // coverts
    for (let i = 0; i < 10; i++) {
      const u = i / 9;
      const ang = 0.2 + u * 0.9;
      const dir = V(s * Math.sin(ang), 0.05, -Math.cos(ang));
      const base = armPt(u * 0.95).add(V(0, 0.05 + (i % 2) * 0.01, 0.08));
      const pts = straight(base, dir, 0.8 - 0.2 * u, up, 0.1, 4);
      ribbon(wingJ[s].el, pts, 0.17, up, (t) => heat(0.0 + u * 0.15 + t * 0.45), 3);
    }
    // wing-claw thumb
    coneDir(WR[s].clone().add(V(0, 0, 0.05)), V(s * 0.3, 0.3, 1), 0.3, 0.05, "#f5bd1f", w.wr, 5);
  }

  // ---- tail ribbons ---------------------------------------------------------
  for (let j = 0; j < 7; j++) {
    const sx = (j - 3) / 3;
    const a = Math.abs(sx);
    const p0 = V(sx * 0.1, 2.05, -0.75);
    const p1 = V(sx * 0.8, 1.6, -1.6);
    const p2 = V(sx * 0.2, 1.0, -2.5 - (1 - a) * 0.5);
    const p3 = V(sx * 1.7, a * 0.35, -3.2 - (1 - a) * 1.0);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 16; i++) pts.push(cubic(p0, p1, p2, p3, i / 16));
    const tailBone = a > 0.6 ? tail2 : tail3;
    ribbon(tail1, pts.slice(0, 7), 0.0, V(0, 0, 1), () => "#a01018", 1); // degenerate guard (invisible)
    ribbon(tailBone, pts, 0.2 - a * 0.04, V(sx * 0.6, 0.4, 1), (t) => heat(0.2 + t * 0.8), 8, (t) =>
      Math.max(0.12, Math.sin(Math.PI * Math.pow(t, 0.5)) * (1 - 0.3 * t))
    );
  }
  ball(V(0, 2.05, -0.8), [0.25, 0.22, 0.3], "#a01018", tail1, 6);

  // ---- legs -----------------------------------------------------------------
  for (const s of [1, -1]) {
    const l = legJ[s];
    const hip = V(s * 0.22, 2.0, -0.1);
    const knee = V(s * 0.28, 1.7, -0.3);
    const ank = V(s * 0.3, 1.35, -0.12);
    const ft = V(s * 0.3, 1.2, 0.05);
    ball(hip.clone().add(V(0, 0.05, 0)), [0.2, 0.25, 0.25], "#c8161d", l.hip, 6);
    rod(hip, knee, 0.1, 0.07, "#e8421a", l.hip, 6);
    rod(knee, ank, 0.07, 0.045, "#f5bd1f", l.knee, 6);
    rod(ank, ft, 0.045, 0.04, "#f5bd1f", l.ankle, 5);
    for (let t = -1; t <= 1; t++) {
      const d = V(t * 0.35 * s, -0.25, 1);
      rod(ft, ft.clone().addScaledVector(d, 0.3), 0.035, 0.025, "#f5bd1f", l.foot, 4);
      coneDir(ft.clone().addScaledVector(d, 0.3), V(t * 0.2 * s, -0.7, 0.8), 0.14, 0.03, "#7a4a08", l.foot, 4);
    }
    coneDir(ft, V(0, -0.3, -1), 0.2, 0.03, "#7a4a08", l.foot, 4);
  }

  // ---- embers & sparks ------------------------------------------------------
  const emberCols = ["#ffd36b", "#ffb02e", "#ff7a14", "#fff0a0", "#ff5a1a"];
  for (let i = 0; i < 80; i++) {
    const s = R() < 0.5 ? 1 : -1;
    const x = s * (0.6 + R() * 4.8);
    const y = 1.0 + R() * 3.9 - Math.abs(x) * 0.0;
    const z = -2.5 + R() * 3.5;
    const r = 0.02 + R() * 0.045;
    const g = new THREE.OctahedronGeometry(r, 0);
    g.applyMatrix4(new THREE.Matrix4().makeTranslation(x, Math.max(0.3, y), z));
    add(g, emberCols[Math.floor(R() * emberCols.length)], body);
  }

  return b.root;
}
