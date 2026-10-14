import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Phoenix",
  description:
    "A stylized fire-bird in a rest pose: wings spread, a fan of long tail feathers, a feathered crest, and a two-part beak with a jaw joint, all built from primitives.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const FIRE = ["#ffd83c", "#ffb81c", "#ff8c1a", "#f45a1a", "#d93417", "#b01e14"];
  const GOLD = "#ffc21a";
  const TIP = "#fff3a8";
  const DARK = "#3a1410";
  const pal = (t: number) => FIRE[Math.min(FIRE.length - 1, Math.max(0, Math.floor(t * FIRE.length)))];

  const sphere = new THREE.SphereGeometry(1, 8, 6);
  const add = (a: V, d: V, k: number): V => [a[0] + d[0] * k, a[1] + d[1] * k, a[2] + d[2] * k];
  const norm = (d: V): V => {
    const l = Math.hypot(...d);
    return [d[0] / l, d[1] / l, d[2] / l];
  };
  const lerp = (a: V, c: V, t: number): V => [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];

  // Skeleton
  b.joint("hips", { at: [0, 0.8, -0.1] });
  b.joint("spine", { parent: "hips", at: [0, 0.9, 0.1], dir: [0, 0.3, 1] });
  b.joint("chest", { parent: "spine", at: [0, 1.0, 0.3], dir: [0, 0.5, 1] });
  b.joint("neck1", { parent: "chest", at: [0, 1.15, 0.45], dir: [0, 1, 0.4] });
  b.joint("neck2", { parent: "neck1", at: [0, 1.35, 0.55], dir: [0, 1, 0.3] });
  b.joint("head", { parent: "neck2", at: [0, 1.45, 0.6], dir: [0, 0.1, 1] });
  b.joint("jaw", { parent: "head", at: [0, 1.425, 0.7], dir: [0, 0, 1], role: "jaw" });
  b.joint("tail1", { parent: "hips", at: [0, 0.85, -0.4], dir: [0, -0.1, -1] });
  b.joint("tail2", { parent: "tail1", at: [0, 0.78, -0.95], dir: [0, -0.2, -1] });

  const ell = (at: V, scale: V, color: string, bone: string, dir?: V) =>
    b.part({ geometry: sphere, color, at, scale, bone, ...(dir ? { dir, up: [0, 1, 0] as V } : {}) });

  const seg = (a: V, c: V, r0: number, r1: number, color: string, bone: string, sides = 7) => {
    const len = Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    b.part({
      geometry: new THREE.CylinderGeometry(r1, r0, len, sides, 1),
      color,
      at: lerp(a, c, 0.5),
      dir: [c[0] - a[0], c[1] - a[1], c[2] - a[2]],
      bone,
    });
  };

  const feather = (from: V, dir: V, len: number, w: number, color: string, tip: string, bone: string) => {
    const d = norm(dir);
    ell(add(from, d, len / 2), [w, len / 2, 0.011], color, bone, d);
    ell(add(from, d, len * 0.9), [w * 0.8, len * 0.11, 0.014], tip, bone, d);
  };

  // Body
  ell([0, 0.92, 0.0], [0.3, 0.32, 0.55], "#e0361a", "spine");
  ell([0, 1.0, 0.27], [0.25, 0.28, 0.3], "#f26a1a", "chest");
  ell([0, 0.85, 0.2], [0.2, 0.2, 0.4], GOLD, "spine");
  ell([0, 0.95, -0.4], [0.2, 0.2, 0.25], "#c42a16", "tail1");
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.07;
    feather([x, 0.95, 0.45], [x * 1.5, -0.7, 0.45], 0.2, 0.05, i % 2 ? "#ffd83c" : GOLD, TIP, "chest");
  }

  // Neck and head
  seg([0, 1.0, 0.3], [0, 1.15, 0.45], 0.15, 0.12, "#f0521a", "chest");
  seg([0, 1.15, 0.45], [0, 1.35, 0.55], 0.12, 0.095, "#f26a1a", "neck1");
  seg([0, 1.35, 0.55], [0, 1.45, 0.6], 0.095, 0.085, "#ff8c1a", "neck2");
  ell([0, 1.47, 0.62], [0.09, 0.095, 0.12], "#ff7a1a", "head");
  ell([0, 1.5, 0.55], [0.07, 0.06, 0.09], GOLD, "head");
  const beakU = new THREE.ConeGeometry(0.048, 0.2, 6);
  b.part({ geometry: beakU, color: "#ffcf2a", at: [0, 1.45, 0.82], dir: [0, -0.15, 1], bone: "head" });
  const beakL = new THREE.ConeGeometry(0.036, 0.15, 6);
  b.part({ geometry: beakL, color: "#e8a010", at: [0, 1.415, 0.775], dir: [0, 0.05, 1], bone: "jaw" });
  for (const s of [1, -1]) {
    ell([s * 0.078, 1.495, 0.665], [0.03, 0.03, 0.025], GOLD, "head");
    ell([s * 0.085, 1.495, 0.675], [0.018, 0.02, 0.018], "#1a0a08", "head");
  }
  // Crest
  for (let i = 0; i < 7; i++) {
    const f = i - 3;
    const h = 0.34 - Math.abs(f) * 0.04;
    feather([f * 0.015, 1.54, 0.58 - Math.abs(f) * 0.01], [f * 0.12, 0.55 - Math.abs(f) * 0.05, -0.75], h, 0.035, pal(0.1 + Math.abs(f) * 0.18), TIP, "head");
  }

  // Wings
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const sh: V = [s * 0.25, 1.05, 0.2];
    const el: V = [s * 0.8, 1.12, 0.05];
    const wr: V = [s * 1.3, 1.1, -0.05];
    b.joint("shoulder" + n, { parent: "chest", at: sh, dir: [s, 0.05, 0] });
    b.joint("elbow" + n, { parent: "shoulder" + n, at: el, dir: [s, 0, -0.1] });
    b.joint("wrist" + n, { parent: "elbow" + n, at: wr, dir: [s, 0, -0.1] });
    seg(sh, el, 0.09, 0.07, "#d93417", "shoulder" + n);
    seg(el, wr, 0.07, 0.05, "#d93417", "elbow" + n);
    ell(add(wr, [s, 0, 0], 0.05), [0.06, 0.05, 0.06], GOLD, "wrist" + n);
    const dirA = (a: number): V => [s * Math.cos((a * Math.PI) / 180), -0.06, -Math.sin((a * Math.PI) / 180)];
    // inner feathers
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      feather(lerp(sh, el, t), dirA(82), 0.5 + 0.1 * t, 0.075, pal(0.55 + 0.1 * (i % 2)), "#ffb81c", "shoulder" + n);
    }
    // secondaries
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      feather(lerp(el, wr, t), dirA(78 - t * 8), 0.58 + 0.1 * t, 0.07, pal(0.4 + 0.1 * (i % 2)), TIP, "elbow" + n);
    }
    // primaries
    for (let i = 0; i < 8; i++) {
      const a = 6 + i * 8;
      const len = 0.7 + 0.28 * Math.sin((Math.PI * (i + 1)) / 9);
      feather(wr, dirA(a), len, 0.065, pal(0.05 + i * 0.1), TIP, "wrist" + n);
    }
    // coverts
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const p = lerp(sh, wr, t);
      feather([p[0], p[1] + 0.025, p[2]], dirA(80), 0.3, 0.06, i % 2 ? "#ffb81c" : GOLD, "#fff3a8", t < 0.5 ? "shoulder" + n : "elbow" + n);
    }

    // Legs
    const hp: V = [s * 0.15, 0.7, 0];
    const kn: V = [s * 0.17, 0.46, 0.1];
    const an: V = [s * 0.17, 0.2, -0.02];
    b.joint("hip" + n, { parent: "hips", at: hp, dir: [0, -1, 0.1] });
    b.joint("knee" + n, { parent: "hip" + n, at: kn, dir: [0, -1, -0.1] });
    b.joint("ankle" + n, { parent: "knee" + n, at: an, dir: [0, -1, 0.2] });
    ell([s * 0.17, 0.66, 0.03], [0.1, 0.16, 0.15], "#f2561a", "hip" + n);
    seg(hp, kn, 0.06, 0.045, "#e8a010", "hip" + n);
    seg(kn, an, 0.045, 0.035, "#e8a010", "knee" + n);
    const toeY = 0.02;
    for (const k of [-1, 0, 1, 2]) {
      const base: V = [s * 0.17, 0.06, -0.02];
      const end: V = k === 2 ? [s * 0.17, toeY, -0.15] : [s * 0.17 + k * 0.09, toeY, 0.2 - Math.abs(k) * 0.03];
      seg(an, base, 0.035, 0.03, "#e8a010", "ankle" + n, 6);
      seg(base, end, 0.026, 0.02, "#e8a010", "ankle" + n, 6);
      const d: V = [end[0] - base[0], end[1] - base[1], end[2] - base[2]];
      b.part({
        geometry: new THREE.ConeGeometry(0.02, 0.07, 5),
        color: DARK,
        at: add(end, norm(d), 0.03),
        dir: d,
        bone: "ankle" + n,
      });
    }
  }

  // Tail fan
  const base: V = [0, 0.86, -0.42];
  for (let f = -3; f <= 3; f++) {
    const a = (f * 11 * Math.PI) / 180;
    const len = 0.7 + 0.12 * (3 - Math.abs(f));
    const w = 0.085 - Math.abs(f) * 0.008;
    const d1: V = [Math.sin(a), -0.1 - 0.02 * (3 - Math.abs(f)), -Math.cos(a)];
    const mid = add(base, norm(d1), len);
    const col = pal(0.05 + Math.abs(f) * 0.16);
    ell(add(base, norm(d1), len / 2), [w, len / 2, 0.012], col, "tail1", norm(d1));
    const d2: V = [Math.sin(a * 1.5), -0.28, -Math.cos(a)];
    ell(add(mid, norm(d2), len / 2), [w * 0.95, len / 2, 0.012], pal(0.25 + Math.abs(f) * 0.15 + 0.1), "tail2", norm(d2));
    ell(add(mid, norm(d2), len * 0.95), [w * 1.3, len * 0.1, 0.015], f % 2 ? TIP : GOLD, "tail2", norm(d2));
  }

  return b.root;
}
