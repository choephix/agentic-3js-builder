import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, mottle, rng } from "../../../../src/index";

export const meta = {
  name: "Emperor Penguin and Chick",
  description:
    "A proud emperor penguin with glossy blue-black back and head, white belly fading to golden neck and ear patches, a slender beak with an orange-pink stripe, stubby flippers and big black feet, with a fluffy grey chick peeking out between its feet.",
};

export default function build() {
  const b = createBuilder({ name: "emperorPenguin" });
  const rand = rng(11);
  const sph = (w = 12, h = 8) => new THREE.SphereGeometry(1, w, h);
  const P = (
    g: THREE.BufferGeometry,
    color: any,
    bone: string,
    at: number[],
    o: Record<string, any> = {},
  ) => b.part(g, color, { bone, at, ...o });

  const DARK = "#0f1522";
  const WHITE = "#f5f4ee";

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0.45, 0], dir: [0, 1, 0], role: "spine" });
  b.chain("spine", [[0, 0.45, 0], [0, 0.65, 0], [0, 0.86, 0.01]], {
    parent: "root", names: ["spine1", "spine2", "chest"], role: "spine",
  });
  b.chain("neckChain", [[0, 0.86, 0.01], [0, 0.98, 0.035]], {
    parent: "chest", names: ["neck", "head"], role: "neck",
  });
  b.joint("jaw", { parent: "head", at: [0, 0.968, 0.085], dir: [0, -0.1, 1], role: "jaw" });
  b.chain("tail", [[0, 0.22, -0.17], [0, 0.12, -0.3], [0, 0.04, -0.4]], {
    parent: "root", names: ["tail1", "tail2"], role: "tail",
  });

  // ---------- paints ----------
  const bodyPaint = paint((p, n) => {
    const belly = smoothstep(-0.05, 0.35, n.z - 0.3 * Math.abs(n.x));
    const back = mix(DARK, "#233553", smoothstep(-0.2, 1, n.y) * 0.8);
    let c = mix(back, WHITE, belly);
    const yw = smoothstep(0.7, 0.9, p.y) * smoothstep(-0.45, 0.1, n.z);
    const gold = mix("#f0aa2a", "#fadf86", smoothstep(0.95, 0.76, p.y));
    c = mix(c, gold, yw);
    return c;
  });
  const headPaint = paint((p, n) => {
    const base = mix("#0c111b", "#25375a", smoothstep(0, 1, n.y) * 0.7);
    const s = p.x > 0 ? 1 : -1;
    const dx = p.x - s * 0.062, dy = p.y - 0.985, dz = p.z + 0.005;
    const d = Math.hypot(dx, dy, dz) / 0.056;
    const gold = mix("#f2b02c", "#fbe28f", smoothstep(0.3, 1.1, d));
    return mix(base, gold, smoothstep(1.15, 0.55, d));
  });
  const flipperPaint = (s: number) =>
    paint((_p, n) => mix(WHITE, "#10161f", smoothstep(-0.25, 0.35, s * n.x)));
  const lowerBeak = paint((p, n) => {
    const stripe = smoothstep(0.25, 0.6, Math.abs(n.x)) * smoothstep(0.27, 0.2, p.z);
    return mix("#1c1a20", "#f58f6c", stripe);
  });

  // ---------- torso ----------
  P(sph(14, 10), bodyPaint, "spine1", [0, 0.5, 0], { scale: [0.19, 0.38, 0.2] });
  P(sph(12, 8), bodyPaint, "spine2", [0, 0.72, 0.01], { scale: [0.175, 0.2, 0.185] });
  P(sph(10, 8), bodyPaint, "neck", [0, 0.91, 0.015], { scale: [0.075, 0.1, 0.08] });
  P(sph(12, 8), headPaint, "head", [0, 1.0, 0.035], { scale: [0.082, 0.085, 0.09] });

  // ---------- beak ----------
  const bdir = new THREE.Vector3(0, -0.18, 1).normalize();
  P(new THREE.ConeGeometry(0.031, 0.2, 6), "#1d1a20", "head", [0, 0.99 + bdir.y * 0.1, 0.085 + bdir.z * 0.1], {
    dir: bdir.toArray(), scale: [1, 1, 0.72],
  });
  // pink-orange stripes along the upper beak's sides
  for (const s of [1, -1])
    P(new THREE.CylinderGeometry(0.006, 0.004, 0.13, 4), "#f58f6c", "head", [s * 0.019, 0.972, 0.16], {
      dir: [0, -0.15, 1], scale: [1, 1, 0.8],
    });
  P(new THREE.ConeGeometry(0.026, 0.16, 6), lowerBeak, "jaw", [0, 0.96, 0.17], {
    dir: [0, -0.1, 1], scale: [1, 1, 0.7],
  });

  // ---------- eyes ----------
  for (const s of [1, -1]) {
    P(sph(8, 6), "#0a0a0c", "head", [s * 0.07, 1.015, 0.07], { scale: 0.014 });
    P(sph(4, 3), "#ffffff", "head", [s * 0.078, 1.02, 0.078], { scale: 0.004 });
  }

  // ---------- flippers ----------
  const seg = (a: number[], c: number[], w: number, t: number, bone: string, pt: any) => {
    const mid = a.map((v, i) => (v + c[i]) / 2);
    const d = c.map((v, i) => v - a[i]);
    const len = Math.hypot(d[0], d[1], d[2]);
    P(sph(10, 6), pt, bone, mid, { dir: d, scale: [t, len * 0.58, w] });
  };
  // ---------- legs, feet ----------
  for (const [S, s] of [["L", 1], ["R", -1]] as const) {
    const arm = b.chain(`arm${S}`, [[s * 0.18, 0.74, 0], [s * 0.27, 0.6, -0.03], [s * 0.34, 0.47, -0.05]], {
      parent: "spine2", names: [`shoulder${S}`, `elbow${S}`, `hand${S}`], role: "wing",
    });
    void arm;
    const fp = flipperPaint(s);
    seg([s * 0.18, 0.74, 0], [s * 0.27, 0.6, -0.03], 0.058, 0.015, `shoulder${S}`, fp);
    seg([s * 0.27, 0.6, -0.03], [s * 0.34, 0.47, -0.05], 0.05, 0.013, `elbow${S}`, fp);

    const leg = b.chain(`leg${S}`, [[s * 0.11, 0.2, 0], [s * 0.13, 0.06, 0.04]], {
      parent: "root", names: [`hip${S}`, `ankle${S}`], role: "leg",
    });
    b.capsule([s * 0.11, 0.2, 0], [s * 0.13, 0.06, 0.04], 0.05, {
      color: "#17161b", bone: leg, sides: 6, name: `legMesh${S}`,
    });
    const ank = `ankle${S}`;
    P(sph(10, 6), "#16151a", ank, [s * 0.13, 0.022, 0.09], { scale: [0.06, 0.022, 0.1] });
    for (const deg of [-24, 0, 24]) {
      const a = (deg * Math.PI) / 180;
      const dx = Math.sin(a), dz = Math.cos(a);
      const bx = s * 0.13 + dx * 0.0, bz = 0.12;
      P(sph(8, 5), "#222027", ank, [bx + dx * 0.06, 0.017, bz + dz * 0.06], {
        scale: [0.023, 0.016, 0.06], rotation: [0, deg, 0],
      });
      P(new THREE.ConeGeometry(0.009, 0.035, 4), "#0b0b0d", ank, [bx + dx * 0.125, 0.015, bz + dz * 0.125], {
        dir: [dx, -0.05, dz],
      });
    }
  }

  // ---------- tail ----------
  P(sph(8, 6), DARK, "tail1", [0, 0.15, -0.23], { scale: [0.07, 0.016, 0.12], rotation: [-20, 0, 0] });
  P(sph(8, 6), "#0b0f18", "tail2", [0, 0.07, -0.33], { scale: [0.055, 0.013, 0.1], rotation: [-28, 0, 0] });

  // ---------- chick ----------
  b.joint("chickBody", { parent: "root", at: [0, 0.14, 0.2], dir: [0, 1, 0] });
  b.joint("chickHead", { parent: "chickBody", at: [0, 0.27, 0.235], dir: [0, 1, 0.3] });
  const fluff = mottle("#9ea0a6", "#c8c9cd", { size: 0.05, seed: 3 });
  const bc = [0, 0.14, 0.2];
  const br = [0.088, 0.13, 0.095];
  P(sph(12, 8), fluff, "chickBody", bc, { scale: br });
  for (let i = 0; i < 18; i++) {
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(rand() * 1.6 - 0.6);
    const d = [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)];
    if (d[2] < -0.2 && i % 2) continue;
    const pos = [bc[0] + d[0] * br[0] * 0.98, bc[1] + d[1] * br[1] * 0.98, bc[2] + d[2] * br[2] * 0.98];
    P(sph(6, 4), i % 2 ? "#bcbdc2" : "#a4a6ab", "chickBody", pos, { scale: [0.024, 0.02, 0.024] });
  }
  const chickHead = paint((p, n) => {
    const base = mix("#2a2c32", "#3c3f47", smoothstep(0, 1, n.y) * 0.5);
    const s = p.x > 0 ? 1 : -1;
    const d = Math.hypot(p.x - s * 0.034, p.y - 0.29, p.z - 0.285) / 0.04;
    return mix(base, "#f1f1ec", smoothstep(1.2, 0.7, d));
  });
  P(sph(10, 8), chickHead, "chickHead", [0, 0.29, 0.24], { scale: 0.066 });
  for (const s of [1, -1]) {
    P(sph(6, 5), "#050506", "chickHead", [s * 0.031, 0.3, 0.292], { scale: 0.011 });
    P(sph(8, 5), "#aeb0b5", "chickBody", [s * 0.095, 0.17, 0.2], {
      scale: [0.014, 0.05, 0.03], rotation: [0, 0, -s * 25],
    });
    P(sph(8, 5), "#16151a", "chickBody", [s * 0.04, 0.012, 0.28], { scale: [0.03, 0.012, 0.045] });
  }
  P(new THREE.ConeGeometry(0.014, 0.045, 5), "#1d1b20", "chickHead", [0, 0.275, 0.325], {
    dir: [0, -0.1, 1],
  });
  for (let i = 0; i < 4; i++)
    P(sph(6, 4), "#8a8c92", "chickHead", [(i - 1.5) * 0.02, 0.345, 0.225 + (i % 2) * 0.01], {
      scale: 0.018,
    });

  return b.root;
}
