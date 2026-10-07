import * as THREE from "three";
import { createBuilder, rng, bezier, catmull, limb, mottle, countershade, svg } from "../../../../src/index";

export const meta = {
  name: "Phoenix",
  description: "A stylized fire bird at rest: spread flame wings, a long fanned tail, crest, hooked beak with a separate jaw, and taloned legs.",
};

const RED = "#d62a1c";
const ORANGE = "#ff7a1a";
const GOLD = "#ffc93a";
const YEL = "#fff07a";
const BEAK = "#e0a030";
const DARK = "#2a1208";
const LEG = "#e8a53a";

const add = (p: number[], d: number[], k = 1): number[] => [p[0] + d[0] * k, p[1] + d[1] * k, p[2] + d[2] * k];

export default function build() {
  const b = createBuilder({ name: "phoenix" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.5, -0.1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.5, -0.1], [0, 0.56, 0.08], [0, 0.72, 0.22]]), {
    parent: hips, names: ["spine1", "spine2"], role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 0.72, 0.22], [0, 0.9, 0.3], [0, 1.03, 0.36]]), {
    parent: spine.joints[1], names: ["neck1", "neck2"], role: "neck",
  });
  const head = b.joint("head", { parent: neck, at: [0, 1.03, 0.36], dir: [0, 0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.03, 0.42], aim: [0, 1.0, 0.56], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.5, -0.1], [0, 0.5, -0.4], [0, 0.46, -0.7]]), {
    parent: hips, names: ["tail1", "tail2"], role: "tail",
  });

  // ---------- body ----------
  const coat = countershade(mottle(RED, ORANGE, { size: 0.12 }), GOLD, { level: -0.1 });
  const body = b.sweep(spine, (t: number) => {
    const k = Math.sin(Math.PI * (0.15 + 0.7 * t));
    const r = 0.06 + 0.12 * k;
    return [r, r * 1.05] as [number, number];
  }, { color: coat });
  b.sweep(neck, (t: number) => 0.075 - 0.025 * t, { color: coat });
  b.sweep(tail, (t: number) => 0.08 * (1 - t) + 0.03, { color: RED });

  // head
  b.part(new THREE.SphereGeometry(0.085, 8, 6), coat, { bone: head, at: [0, 1.045, 0.39] });
  b.part(new THREE.ConeGeometry(0.045, 0.15, 6), BEAK, {
    bone: head, at: [0, 1.05, 0.5], dir: [0, -0.2, 1], scale: [1, 1, 0.75], flat: true,
  });
  b.part(new THREE.ConeGeometry(0.014, 0.05, 5), BEAK, {
    bone: head, at: [0, 1.03, 0.575], dir: [0, -1, 0.3], flat: true,
  });
  b.part(new THREE.ConeGeometry(0.032, 0.12, 6), "#c98a24", {
    bone: jaw, at: [0, 1.0, 0.5], dir: [0, -0.08, 1], scale: [1, 1, 0.6], flat: true,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 6, 4), GOLD, { bone: head, at: [s * 0.065, 1.07, 0.42] });
    b.part(new THREE.SphereGeometry(0.021, 6, 4), DARK, { bone: head, at: [s * 0.083, 1.072, 0.435] });
  }

  // crest
  const H = [0, 1.1, 0.37];
  for (let i = 0; i < 5; i++) {
    const lat = (i - 2) * 0.025;
    const len = 1 - Math.abs(i - 2) * 0.18;
    const base = add(H, [lat * 0.6, 0, 0]);
    const mid = add(base, [lat * 2, 0.1 * len, -0.06]);
    const tip = add(base, [lat * 4, 0.16 * len, -0.26 * len]);
    b.sweep(bezier(base, mid, tip), (t: number) => [0.02 * (1 - t) + 0.004, 0.005] as [number, number], {
      bone: head, bands: [[0.5, RED], [0.8, ORANGE], [1, GOLD]], caps: "point",
    });
  }

  // ---------- feathers on body (cards) ----------
  const tex = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 62 C2 40 4 14 16 2 C28 14 30 40 16 62Z" fill="#ff8a1a"/><path d="M16 56 C9 40 10 20 16 8 C22 20 23 40 16 56Z" fill="#ffd34a"/></svg>`,
    { size: 128 },
  );
  const hits = b.surface(body).scatter(70, { rng: rng(3), minDist: 0.045, filter: (h: any) => h.n.y > -0.4 });
  b.cards(hits, tex, { size: [0.055, 0.11], lean: 60, bend: 25, vary: 0.3, rng: rng(4) });

  // ---------- wings ----------
  const featherW = (w0: number) => (t: number) => {
    const s = Math.max(0.05, Math.sin(Math.PI * (0.12 + 0.8 * t)));
    return [w0 * Math.pow(s, 0.6), 0.006] as [number, number];
  };
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const pts = [[s * 0.14, 0.66, 0.1], [s * 0.5, 0.8, 0.0], [s * 0.85, 0.84, -0.08], [s * 1.0, 0.8, -0.14]];
    const arm = b.chain(`wing${sd}`, catmull(pts), {
      parent: spine.joints[1],
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`, `hand${sd}`],
      role: "wing",
    });
    b.sweep(arm, [0.055, 0.03], { color: RED });

    // flight feathers
    const N = 11;
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      const p = arm.at(0.4 + 0.6 * u);
      const base = [p.at.x, p.at.y + (i % 2) * 0.008, p.at.z];
      const L = 0.42 + 0.3 * Math.sin(Math.PI * (0.25 + 0.6 * u));
      const dv = new THREE.Vector3(s * (0.15 + 0.75 * u), -0.04, -1).normalize();
      const d = [dv.x, dv.y, dv.z];
      const mid = add(add(base, d, L * 0.5), [0, 0.04, 0]);
      const tip = add(add(base, d, L), [0, -0.05, 0]);
      b.sweep(bezier(base, mid, tip), featherW(0.052), {
        bone: p.bone, bands: [[0.45, RED], [0.8, ORANGE], [1, GOLD]], caps: "point",
      });
    }
    // coverts
    for (let i = 0; i < 9; i++) {
      const u = i / 8;
      const p = arm.at(0.12 + 0.83 * u);
      const base = [p.at.x, p.at.y + 0.022 + (i % 2) * 0.006, p.at.z];
      const L = 0.2 + 0.1 * Math.sin(Math.PI * (0.3 + 0.5 * u));
      const dv = new THREE.Vector3(s * (0.1 + 0.6 * u), -0.05, -1).normalize();
      const d = [dv.x, dv.y, dv.z];
      const mid = add(add(base, d, L * 0.5), [0, 0.03, 0]);
      const tip = add(add(base, d, L), [0, -0.04, 0]);
      b.sweep(bezier(base, mid, tip), featherW(0.04), {
        bone: p.bone, bands: [[0.5, GOLD], [1, ORANGE]], caps: "point",
      });
    }

    // ---------- legs ----------
    const hipP: number[] = [s * 0.1, 0.46, -0.02];
    const F: number[] = [s * 0.1, 0.03, 0.04];
    const lp = limb(hipP, F, [0.16, 0.2, 0.16], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${sd}`, lp, {
      parent: hips, names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`, `foot${sd}`], role: "leg",
    });
    b.part(new THREE.SphereGeometry(0.075, 7, 5), RED, { bone: hips, at: add(hipP, [0, -0.02, 0]) });
    b.sweep(leg, [0.032, 0.02], { color: LEG });
    const Fy = [F[0], 0.022, F[2]];
    for (const dx of [-0.05, 0, 0.05]) {
      const T = [F[0] + dx, 0.02, F[2] + 0.14];
      b.rod(Fy, T, 0.014, { color: LEG, bone: leg });
      b.spike(T, [dx * 2, -0.3, 1], 0.045, 0.012, { color: DARK, bone: leg });
    }
    const Tb = [F[0], 0.02, F[2] - 0.09];
    b.rod(Fy, Tb, 0.013, { color: LEG, bone: leg });
    b.spike(Tb, [0, -0.3, -1], 0.04, 0.011, { color: DARK, bone: leg });
  }

  // ---------- tail feathers ----------
  const B = [0, 0.46, -0.7];
  for (let i = 0; i < 11; i++) {
    const k = Math.abs(i - 5);
    const a = ((i - 5) / 5) * 0.7;
    const odd = i % 2 === 1;
    const L = 1.25 - 0.5 * (k / 5);
    const base = [0, B[1] + (odd ? 0.01 : 0), B[2]];
    const mid = [Math.sin(a) * L * 0.5, odd ? 0.52 : 0.42, B[2] - Math.cos(a) * L * 0.5];
    const tip = [Math.sin(a) * L, odd ? 0.55 : 0.12 + 0.03 * k, B[2] - Math.cos(a) * L];
    b.sweep(bezier(base, mid, tip), featherW(0.07), {
      bone: tail, bands: [[0.4, RED], [0.7, ORANGE], [0.9, GOLD], [1, YEL]], caps: "point",
    });
  }

  return b.root;
}
