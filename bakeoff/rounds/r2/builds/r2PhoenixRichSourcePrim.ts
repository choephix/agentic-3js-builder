import * as THREE from "three";
import { createBuilder, catmull, paint, mix, noise, rng } from "../../../../src/index";

export const meta = {
  name: "Rising Phoenix",
  description:
    "A phoenix with wings flung open: fire-gradient feathers from crimson at the body to gold at the tips, a flame crest, long ribbon tail feathers, amber eyes, a golden hooked beak and drifting embers.",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const DEG = Math.PI / 180;

const STOPS = ["#6e0716", "#c4121c", "#ff5a12", "#ffa51c", "#ffe55a"];
const fireCache = new Map<number, ReturnType<typeof paint>>();
function fire(shift: number) {
  let f = fireCache.get(shift);
  if (!f) {
    f = paint((p) => {
      const d = Math.hypot(p.x, p.z * 1.3, (p.y - 1.3) * 0.6);
      let t = (d - 0.35) / 2.7 + shift + (noise(p, 0.2, 3) - 0.5) * 0.22;
      t = Math.min(Math.max(t, 0), 0.999) * 4;
      const k = Math.floor(t);
      return mix(STOPS[k], STOPS[k + 1], t - k);
    });
    fireCache.set(shift, f);
  }
  return f;
}

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const r = rng(11);

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 1.3, 0] });
  const spine = b.chain("spine", [[0, 1.25, -0.45], [0, 1.28, -0.1], [0, 1.38, 0.3]], {
    parent: "root",
    role: "spine",
    names: ["spine1", "spine2"],
  });
  b.sweep(spine, (t) => {
    const k = Math.sin(Math.PI * (0.15 + 0.7 * t));
    return [0.07 + 0.16 * k, 0.08 + 0.18 * k];
  }, { color: fire(-0.1) });
  b.part(new THREE.SphereGeometry(0.19, 10, 8), fire(0.35), { at: [0, 1.33, 0.2], scale: [1, 1.05, 1.2], bone: "spine2" });

  // neck + head
  const neck = b.chain("neck", [[0, 1.42, 0.3], [0, 1.6, 0.45], [0, 1.78, 0.55]], {
    parent: "spine2",
    role: "neck",
    names: ["neck1", "neck2", "head"],
  });
  b.sweep(neck, [0.1, 0.075], { color: fire(0.05) });
  b.part(new THREE.SphereGeometry(0.125, 10, 8), fire(0.12), { at: [0, 1.88, 0.62], bone: "head" });
  b.joint("jaw", { parent: "head", at: [0, 1.83, 0.69], dir: [0, -0.05, 1], role: "jaw" });

  const cone = (base: number[], dir: number[], len: number, rad: number, col: string, bone: string, seg = 6) => {
    const d = V(dir[0], dir[1], dir[2]).normalize();
    const at = V(base[0], base[1], base[2]).addScaledVector(d, len / 2);
    return b.part(new THREE.ConeGeometry(rad, len, seg), col, { at, dir: d, bone });
  };
  cone([0, 1.875, 0.69], [0, -0.2, 1], 0.3, 0.07, "#f2b81c", "head");
  cone([0, 1.84, 0.95], [0, -1, 0.35], 0.11, 0.04, "#ffd23a", "head");
  cone([0, 1.83, 0.69], [0, -0.05, 1], 0.2, 0.052, "#d99a12", "jaw");

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.042, 8, 6), "#ff7a00", { at: [s * 0.085, 1.9, 0.67], bone: "head" });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), "#ffbf10", { at: [s * 0.098, 1.9, 0.685], bone: "head" });
    b.part(new THREE.SphereGeometry(0.013, 6, 5), "#2a0800", { at: [s * 0.122, 1.9, 0.7], bone: "head" });
  }

  // ---------- feather helper ----------
  const outline = (L: number, w: number): any[] => [
    [-w / 2, 0], [-w * 0.6, L * 0.35], [-w * 0.45, L * 0.7], [-w * 0.05, L, "sharp"],
    [w * 0.2, L * 0.62], [w * 0.62, L * 0.3], [w / 2, 0],
  ];
  const feather = (
    at: THREE.Vector3, dir: THREE.Vector3, len: number, wid: number, bone: string,
    shift: number, lift: number, inner: boolean, xdir?: THREE.Vector3,
  ) => {
    const x = xdir ?? V(0, 1, 0).cross(dir).normalize();
    const base = at.clone().add(V(0, lift, 0));
    b.extrude(outline(len, wid), { color: fire(shift), at: base, x, y: dir, thickness: [0.014, 0.004], smoothing: 1, bone });
    if (inner)
      b.extrude(outline(len * 0.72, wid * 0.5), {
        color: fire(shift + 0.28),
        at: base.clone().addScaledVector(dir, 0.05).add(V(0, 0.008, 0)),
        x, y: dir, thickness: [0.01, 0.003], smoothing: 1, bone,
      });
  };

  // crest of flame plumes
  for (let k = -2; k <= 2; k++) {
    const dir = V(0.3 * k, 0.75, -0.5 - 0.05 * Math.abs(k)).normalize();
    feather(V(0.02 * k, 1.97, 0.58), dir, k === 0 ? 0.72 : 0.5 - 0.06 * Math.abs(k), 0.11, "head", 0.3, 0, true, V(1, 0, 0));
  }

  // ---------- wings ----------
  const wing = (s: number) => {
    const sx = s > 0 ? "L" : "R";
    const P = [[0.2, 1.45, 0.08], [0.85, 1.75, 0.0], [1.6, 1.95, -0.18], [2.35, 2.1, -0.32]].map(([x, y, z]) => V(s * x, y, z));
    const arm = b.chain("wing" + sx, P, {
      parent: "spine2",
      role: "wing",
      names: [`shoulder${sx}`, `elbow${sx}`, `wrist${sx}`, `hand${sx}`],
    });
    b.sweep(arm, [0.075, 0.03], { color: fire(0.0) });
    const lerp = (i: number, j: number, t: number) => P[i].clone().lerp(P[j], t);
    const fan = (
      n: number, from: number, to: number, a0: number, a1: number, dy: number,
      lenF: (t: number) => number, wid: number, bone: string, shift: number, lift: number, inner: boolean,
    ) => {
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0 : i / (n - 1);
        const a = (a0 + (a1 - a0) * t) * DEG;
        const dir = V(s * Math.sin(a), dy, -Math.cos(a)).normalize();
        feather(lerp(from, to, t), dir, lenF(t), wid, bone, shift, lift + i * 0.003, inner);
      }
    };
    fan(5, 0, 1, -22, -8, -0.1, (t) => 0.55 + 0.05 * t, 0.24, `shoulder${sx}`, 0, 0, false);
    fan(7, 1, 2, -6, 14, -0.08, (t) => 0.8 - 0.1 * t, 0.22, `elbow${sx}`, 0.02, 0.0, true);
    fan(9, 2, 3, 22, 86, 0.1, (t) => 0.85 * (0.9 + 0.5 * Math.sin(Math.PI * (0.1 + 0.8 * t))), 0.19, `wrist${sx}`, 0.04, 0.0, true);
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      const base = t < 0.5 ? lerp(0, 1, t * 2) : lerp(1, 2, (t - 0.5) * 2);
      const a = (-10 + 20 * t) * DEG;
      feather(base, V(s * Math.sin(a), -0.1, -Math.cos(a)).normalize(), 0.42, 0.18, t < 0.5 ? `shoulder${sx}` : `elbow${sx}`, -0.02, 0.025 + i * 0.002, false);
    }
    fan(7, 2, 3, 30, 82, 0.08, () => 0.5, 0.15, `wrist${sx}`, 0.0, 0.03, false);
  };
  wing(1);
  wing(-1);

  // ---------- tail ribbons ----------
  for (let j = 0; j < 7; j++) {
    const i = j - 3;
    const k = Math.abs(i);
    const lf = 1 - 0.1 * k;
    const zs = [0.5, 1.0, 1.6, 2.2].map((v) => -(0.5 + (v - 0.5) * 0.0 + v * lf - (v === 0.5 ? 0.5 * lf : 0)));
    const ys = [0.12, 0.5, 0.95, 1.22].map((v) => 1.22 - v * lf);
    const xs = [0.04, 0.1, 0.18, 0.26].map((v, m) => i * v + 0.06 * Math.sin(m * 1.7 + j));
    const pts = [V(0, 1.22, -0.5), ...[0, 1, 2, 3].map((m) => V(xs[m], ys[m], zs[m]))];
    const ch = b.chain(`tail${j}`, catmull(pts), { parent: "spine1", role: "tail", up: [0, 1, 0] });
    const hw = (t: number) => {
      const s = Math.sin(Math.PI * (0.12 + 0.88 * t));
      return (0.012 + 0.085 * Math.pow(Math.max(s, 0), 0.8)) * (1 + 0.25 * Math.sin(t * 14 + j));
    };
    b.sweep(ch, (t) => [hw(t), 0.005], { color: fire(0.0), section: "box", caps: { start: "flat", end: "point" } });
    b.sweep(ch, (t) => [hw(t) * 0.45, 0.004], {
      color: fire(0.3), section: "box", caps: { start: "flat", end: "point" }, shift: [0, 0.006], from: 0.1,
    });
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const sx = s > 0 ? "L" : "R";
    const leg = b.chain(`leg${sx}`, [[s * 0.1, 1.15, -0.05], [s * 0.13, 1.0, 0.1], [s * 0.13, 0.85, -0.15], [s * 0.13, 0.78, -0.05]].map(([x, y, z]) => V(x, y, z)), {
      parent: "spine1",
      role: "leg",
      names: [`hip${sx}`, `knee${sx}`, `ankle${sx}`, `foot${sx}`],
    });
    b.sweep(leg, [0.04, 0.022], { color: "#e0a018" });
    for (const tk of [-1, 0, 1]) cone([s * 0.13, 0.78, -0.05], [s * tk * 0.3, -0.25, 1], 0.14, 0.018, "#ffd23a", `foot${sx}`, 5);
    cone([s * 0.13, 0.78, -0.05], [0, -0.25, -1], 0.1, 0.018, "#ffd23a", `foot${sx}`, 5);
  }

  // ---------- embers ----------
  const cols = ["#ff7a10", "#ffb020", "#ffe45c", "#fff3b0", "#ff4a10"];
  for (let i = 0; i < 46; i++) {
    const s = r() < 0.5 ? 1 : -1;
    const geo = i % 3 === 0 ? new THREE.TetrahedronGeometry(0.015 + 0.025 * r(), 0) : new THREE.OctahedronGeometry(0.012 + 0.022 * r(), 0);
    b.part(geo, cols[Math.floor(r() * cols.length)], {
      at: [s * (0.5 + r() * 2.9), 0.7 + r() * 2.1, -1.3 + r() * 1.8],
      rotation: [r() * 180, r() * 180, 0],
      bone: "root",
    });
  }

  return b.root;
}
