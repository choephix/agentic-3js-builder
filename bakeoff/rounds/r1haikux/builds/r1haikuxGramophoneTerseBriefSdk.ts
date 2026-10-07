import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Gramophone",
  description:
    "Wind-up gramophone: a mahogany case with brass trim and a cream inlay, a brass turntable with a green felt mat and a record, a nickel tone arm, and a red flared horn.",
};

type V3 = [number, number, number];
const UP: V3 = [0, 1, 0];
const FRONT: V3 = [0, 0, 1];

// palette: one shared material per colour
const MAHOGANY = "#5c3120";
const MAHOGANY_DARK = "#361d10";
const INLAY = "#e8cd96";
const BRASS = "#d9a93f";
const BRASS_DARK = "#8c6522";
const NICKEL = "#bfc4cc";
const FELT = "#1d4d3b";
const RECORD = "#131316";
const GROOVE = "#2e2e34";
const LABEL = "#f2e4bd";
const HORN = "#b0301f";
const IVORY = "#f3ecd9";
const BAKELITE = "#27221f";

// horn shape
const THROAT_R = 0.024;
const MOUTH_R = 0.2;
const WALL = 0.008;
const BELL_L = 0.27;
const flare = (t: number) => THROAT_R + (MOUTH_R - THROAT_R) * Math.pow(t, 1.7);

// vector helpers
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scl = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const mid = (a: V3, b: V3): V3 => scl(add(a, b), 0.5);
const unit = (a: V3): V3 => scl(a, 1 / Math.hypot(a[0], a[1], a[2]));
const along = (a: V3, dir: V3, s: number): V3 => add(a, scl(unit(dir), s));
const lerp = (a: V3, b: V3, t: number): V3 => add(a, scl(sub(b, a), t));

// Orientation: builds a basis whose +Y is dir (no lookAt / setFromUnitVectors).
function basisFor(dir: V3): THREE.Matrix4 {
  const d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
  const ref = Math.abs(d.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const z = new THREE.Vector3().crossVectors(ref, d).normalize();
  const x = new THREE.Vector3().crossVectors(d, z).normalize();
  return new THREE.Matrix4().makeBasis(x, d, z);
}

// Geometry built along +Y (axis Y) is turned so +Y runs along dir and its origin sits at `at`.
function place(g: THREE.BufferGeometry, at: V3, dir: V3): THREE.BufferGeometry {
  const m = basisFor(dir);
  m.setPosition(at[0], at[1], at[2]);
  return g.applyMatrix4(m);
}

const box = (w: number, h: number, d: number, c: V3) =>
  new THREE.BoxGeometry(w, h, d).translate(c[0], c[1], c[2]);

const disc = (r: number, h: number, seg: number, at: V3, dir: V3 = UP) =>
  place(new THREE.CylinderGeometry(r, r, h, seg), at, dir);

// tapered rod from a to b (rA at a, rB at b)
const rod = (a: V3, b: V3, rA: number, rB: number, seg = 12) =>
  place(
    new THREE.CylinderGeometry(rB, rA, Math.hypot(...sub(b, a)), seg, 1, false),
    mid(a, b),
    sub(b, a),
  );

const ball = (p: V3, r: number, seg = 10) =>
  new THREE.SphereGeometry(r, seg, Math.max(4, Math.round(seg * 0.75))).translate(p[0], p[1], p[2]);

// flat ring with its normal along dir
const ring = (R: number, tube: number, at: V3, dir: V3 = UP, seg = 40) =>
  place(new THREE.TorusGeometry(R, tube, 6, seg).rotateX(Math.PI / 2), at, dir);

// double-skinned flared horn: outer wall up, across the rim, inner wall back down
function bell(throat: V3, dir: V3): THREE.BufferGeometry {
  const N = 12;
  const outer: THREE.Vector2[] = [];
  const inner: THREE.Vector2[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const r = flare(t);
    outer.push(new THREE.Vector2(r + WALL / 2, t * BELL_L));
    inner.push(new THREE.Vector2(r - WALL / 2, t * BELL_L));
  }
  const profile = [...outer, ...inner.reverse()];
  return place(new THREE.LatheGeometry(profile, 18), throat, dir);
}

export default function build() {
  const b = createBuilder({ name: "gramophone" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const put = (g: THREE.BufferGeometry, color: string) => {
    b.stick(g, color, base);
  };

  // ── case: feet, plinth, mahogany body, brass edge band ──
  for (const x of [-0.17, 0.17]) {
    for (const z of [-0.17, 0.17]) {
      put(disc(0.024, 0.03, 10, [x, 0.015, z]), BRASS_DARK);
    }
  }
  put(box(0.44, 0.02, 0.42, [0, 0.04, 0]), MAHOGANY_DARK);
  put(box(0.42, 0.13, 0.4, [0, 0.095, 0]), MAHOGANY);
  put(box(0.436, 0.012, 0.008, [0, 0.156, 0.204]), BRASS);
  put(box(0.436, 0.012, 0.008, [0, 0.156, -0.204]), BRASS);
  put(box(0.008, 0.012, 0.408, [0.214, 0.156, 0]), BRASS);
  put(box(0.008, 0.012, 0.408, [-0.214, 0.156, 0]), BRASS);

  // front inlay: panel, pinstripes, medallion, studs
  put(box(0.3, 0.07, 0.004, [0, 0.105, 0.202]), INLAY);
  put(box(0.31, 0.003, 0.006, [0, 0.142, 0.203]), BRASS);
  put(box(0.31, 0.003, 0.006, [0, 0.068, 0.203]), BRASS);
  put(ring(0.02, 0.0045, [0, 0.105, 0.205], FRONT, 28), BRASS);
  put(disc(0.0125, 0.002, 20, [0, 0.105, 0.2045], FRONT), HORN);
  for (const x of [-0.13, 0.13]) put(ball([x, 0.105, 0.204], 0.0065, 8), BRASS);

  // winding crank on the model's right side
  put(rod([-0.21, 0.1, 0.04], [-0.226, 0.1, 0.04], 0.026, 0.026, 14), BRASS);
  put(rod([-0.226, 0.1, 0.04], [-0.246, 0.1, 0.04], 0.006, 0.006, 8), NICKEL);
  put(ball([-0.25, 0.1, 0.04], 0.015, 10), IVORY);

  // ── turntable: brass platter, green felt, black record with a cream label ──
  put(disc(0.15, 0.008, 36, [0, 0.164, 0]), BRASS);
  put(ring(0.151, 0.0045, [0, 0.164, 0], UP, 40), BRASS);
  put(disc(0.141, 0.002, 36, [0, 0.169, 0]), FELT);
  put(disc(0.136, 0.004, 40, [0, 0.172, 0]), RECORD);
  for (const R of [0.07, 0.095, 0.118]) {
    put(ring(R, 0.0012, [0, 0.1748, 0], UP, 56), GROOVE);
  }
  put(disc(0.05, 0.0016, 28, [0, 0.1748, 0]), LABEL);
  put(disc(0.016, 0.0016, 20, [0, 0.1764, 0]), HORN);
  put(rod([0, 0.1756, 0], [0, 0.2, 0], 0.005, 0.005, 10), BRASS);
  put(ball([0, 0.2, 0], 0.008, 8), BRASS);

  // ── tone arm: brass pivot post, nickel arm, black head shell and needle ──
  const pivot: V3 = [0.14, 0.2, -0.12];
  const A1: V3 = [0.152, 0.216, -0.066];
  const A2: V3 = [0.128, 0.208, -0.008];
  const head: V3 = [0.1, 0.19, 0.046];
  put(rod([0.14, 0.16, -0.12], pivot, 0.014, 0.012, 12), BRASS);
  put(ball(pivot, 0.012, 8), BRASS);
  put(rod(pivot, A1, 0.0085, 0.0082, 10), NICKEL);
  put(ball(A1, 0.0085, 8), NICKEL);
  put(rod(A1, A2, 0.0082, 0.0082, 10), NICKEL);
  put(ball(A2, 0.0085, 8), NICKEL);
  put(rod(A2, head, 0.0082, 0.0072, 10), NICKEL);
  put(box(0.022, 0.012, 0.034, [head[0], head[1] - 0.004, head[2]]), BAKELITE);
  put(rod([head[0], 0.18, head[2]], [head[0], 0.1752, head[2]], 0.0026, 0.0006, 8), NICKEL);

  // arm rest on the back-left of the case
  put(rod([-0.15, 0.16, -0.12], [-0.15, 0.182, -0.12], 0.009, 0.009, 10), BRASS);
  put(disc(0.018, 0.006, 14, [-0.15, 0.185, -0.12]), FELT);

  // ── horn: brass collar, red neck, flared bell with brass bands ──
  const HZ = -0.176;
  const N0: V3 = [0, 0.178, HZ];
  const N1: V3 = [0, 0.31, -0.125];
  const dirB: V3 = [0, 0.5, 0.866];

  put(rod([0, 0.16, HZ], N0, 0.026, 0.024, 16), BRASS);
  put(rod(N0, N1, 0.021, 0.028, 16), HORN);
  put(ring(0.0235, 0.0042, lerp(N0, N1, 0.2), sub(N1, N0), 24), BRASS);
  put(ball(N1, 0.028, 12), HORN);
  put(bell(N1, dirB), HORN);
  for (const t of [0.12, 0.45]) {
    put(ring(flare(t) + WALL / 2 + 0.002, 0.0055, along(N1, dirB, BELL_L * t), dirB, 40), BRASS);
  }
  put(ring(MOUTH_R + WALL / 2 + 0.003, 0.0085, along(N1, dirB, BELL_L), dirB, 48), BRASS);

  return b.root;
}
