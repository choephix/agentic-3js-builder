import * as THREE from "three";
import { createBuilder, rng, catmull, countershade, mottle, svg } from "../../../../src/index";

export const meta = {
  name: "Capybara with Bird",
  description: "A chubby, whimsical capybara with a tiny bluebird perched on its head and a daisy behind one ear.",
};

export default function build() {
  const b = createBuilder({ name: "capybara" });
  const FUR = countershade(mottle("#8f5f35", "#a77446", { size: 0.12, seed: 3 }), "#c89a62", { level: -0.25 });
  const DARK = "#3a2416", NOSE = "#2a1a14", PINK = "#f29a9a", FOOT = "#5a3a22";

  const sph = (s = 8, t = 6) => new THREE.SphereGeometry(1, s, t);
  const P = (g: THREE.BufferGeometry, col: any, bone: any, at: number[], scale?: number[], rot?: number[]) =>
    b.part(g, col, { bone, at, scale, rotation: rot, flat: true } as any);

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.34, -0.42] });
  const spine = b.chain(
    "spine",
    catmull([[0, 0.34, -0.42], [0, 0.36, -0.06], [0, 0.38, 0.3]]),
    { parent: hips, count: 2, role: "spine" },
  );
  const sp0 = spine.joints[0], sp1 = spine.joints[1];
  b.sweep(spine, (t: number) => [0.17 + 0.03 * Math.sin(Math.PI * t), 0.19 + 0.02 * Math.sin(Math.PI * t)], { color: FUR });

  const neck = b.joint("neck", { parent: sp1, at: [0, 0.4, 0.28], aim: [0, 0.43, 0.38], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.43, 0.38], dir: [0, -0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.345, 0.46], aim: [0, 0.345, 0.62], role: "jaw" });

  // head
  P(sph(10, 8), FUR, head, [0, 0.43, 0.42], [0.115, 0.11, 0.14]);
  P(new THREE.BoxGeometry(1, 1, 1), FUR, head, [0, 0.4, 0.54], [0.17, 0.15, 0.16]);
  P(new THREE.BoxGeometry(1, 1, 1), "#b98756", head, [0, 0.36, 0.6], [0.15, 0.06, 0.1]);
  P(new THREE.BoxGeometry(1, 1, 1), NOSE, head, [0, 0.43, 0.625], [0.14, 0.07, 0.02]);
  P(new THREE.BoxGeometry(1, 1, 1), "#e8d0a4", jaw, [0, 0.335, 0.55], [0.12, 0.035, 0.15]);
  P(new THREE.BoxGeometry(1, 1, 1), "#fff4dc", head, [0, 0.352, 0.625], [0.03, 0.02, 0.012]);
  const EYE = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#1a0f0a"/><circle cx="32" cy="32" r="22" fill="#4a2a18"/><circle cx="24" cy="22" r="9" fill="#fff"/><circle cx="40" cy="42" r="4" fill="#fff"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    const c = [s * 0.082, 0.465, 0.5];
    const d = new THREE.Vector3(s * 0.8, 0.1, 0.6).normalize();
    P(sph(6, 4), DARK, head, c, [0.03, 0.03, 0.03]);
    b.part(new THREE.PlaneGeometry(0.055, 0.055), "#ffffff", {
      bone: head, at: [c[0] + d.x * 0.027, c[1] + d.y * 0.027, c[2] + d.z * 0.027], dir: d.toArray(), axis: "z", texture: EYE,
    } as any);
    P(sph(6, 4), PINK, head, [s * 0.1, 0.4, 0.5], [0.022, 0.016, 0.01]);
    P(sph(6, 4), NOSE, head, [s * 0.03, 0.43, 0.64], [0.012, 0.014, 0.008]);
    P(sph(6, 4), "#7a4c2a", head, [s * 0.075, 0.515, 0.37], [0.03, 0.035, 0.015]);
    P(sph(6, 4), "#e8a08a", head, [s * 0.075, 0.515, 0.385], [0.017, 0.022, 0.008]);
  }

  // daisy behind left ear
  const fc = [0.1, 0.515, 0.42];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    P(sph(5, 3), "#ffffff", head, [fc[0] + Math.cos(a) * 0.024, fc[1], fc[2] + Math.sin(a) * 0.024], [0.016, 0.006, 0.01], [0, (-a * 180) / Math.PI, 0]);
  }
  P(sph(6, 4), "#ffcc33", head, [fc[0], fc[1] + 0.004, fc[2]], [0.013, 0.01, 0.013]);

  // legs
  const legs: [string, number, number, any, number][] = [
    ["FL", 1, 0.2, sp1, 0.052], ["FR", -1, 0.2, sp1, 0.052], ["HL", 1, -0.4, sp0, 0.062], ["HR", -1, -0.4, sp0, 0.062],
  ];
  for (const [n, s, z, par, r] of legs) {
    const x = s * 0.15;
    const leg = b.chain(`leg${n}`, [[x, 0.27, z], [x, 0.15, z + 0.01], [x, 0.045, z + 0.02]], {
      parent: par, names: [`hip${n}`, `knee${n}`, `ankle${n}`], role: "leg",
    } as any);
    b.sweep(leg, [r, r * 0.8], { color: FUR });
    const ankle = leg.tip ?? leg.joints[leg.joints.length - 1];
    P(new THREE.BoxGeometry(1, 1, 1), FOOT, ankle, [x, 0.02, z + 0.045], [0.07, 0.04, 0.11]);
    for (const k of [-1, 0, 1]) P(new THREE.BoxGeometry(1, 1, 1), "#2a1a10", ankle, [x + k * 0.022, 0.018, z + 0.1], [0.018, 0.03, 0.02]);
  }

  // tail nub and rump
  const tail = b.joint("tail1", { parent: hips, at: [0, 0.34, -0.55], dir: [0, 0, -1], role: "tail" });
  P(sph(6, 4), "#7a4e2c", tail, [0, 0.33, -0.6], [0.035, 0.03, 0.03]);
  // whiskers
  for (const s of [1, -1])
    for (const k of [0, 1]) b.rod([s * 0.07, 0.41 - k * 0.02, 0.62], [s * 0.2, 0.42 - k * 0.05, 0.64], 0.0025, "#f2e4c8", { bone: head });

  // bird
  const bb = b.joint("birdBody", { parent: head, at: [0, 0.58, 0.4], dir: [0, 0, 1] });
  const bh = b.joint("birdHead", { parent: bb, at: [0, 0.62, 0.43], dir: [0, 0, 1], role: "head" });
  const bjaw = b.joint("birdJaw", { parent: bh, at: [0, 0.615, 0.465], aim: [0, 0.615, 0.5], role: "jaw" });
  const BLUE = "#4aa8e8", LB = "#bfe6ff", BEAK = "#ffb02e";
  P(sph(8, 6), BLUE, bb, [0, 0.58, 0.4], [0.05, 0.045, 0.06]);
  P(sph(8, 6), LB, bb, [0, 0.565, 0.415], [0.04, 0.032, 0.045]);
  P(sph(8, 6), BLUE, bh, [0, 0.625, 0.43], [0.038, 0.036, 0.038]);
  P(new THREE.ConeGeometry(0.012, 0.03, 4), BEAK, bh, [0, 0.623, 0.475], [1, 1, 1], [90, 0, 0]);
  P(new THREE.ConeGeometry(0.01, 0.024, 4), "#e88a1a", bjaw, [0, 0.61, 0.47], [1, 1, 1], [90, 0, 0]);
  P(sph(6, 4), BLUE, bh, [0, 0.66, 0.42], [0.012, 0.02, 0.014], [-30, 0, 0]);
  for (const s of [1, -1]) {
    P(sph(5, 4), "#101010", bh, [s * 0.026, 0.633, 0.456], [0.007, 0.008, 0.007]);
    P(sph(5, 4), "#ffffff", bh, [s * 0.028, 0.636, 0.461], [0.0025, 0.0025, 0.0025]);
    P(sph(5, 4), PINK, bh, [s * 0.032, 0.617, 0.447], [0.008, 0.006, 0.004]);
    const w = b.joint(`birdWing${s > 0 ? "L" : "R"}`, { parent: bb, at: [s * 0.045, 0.59, 0.4], dir: [s, 0.2, -0.3], role: "wing" });
    P(sph(6, 4), "#2f86c8", w, [s * 0.085, 0.585, 0.385], [0.05, 0.012, 0.03], [0, s * -20, s * -15]);
    P(sph(5, 4), "#f2a030", bb, [s * 0.015, 0.535, 0.405], [0.006, 0.006, 0.006]);
    b.rod([s * 0.015, 0.538, 0.405], [s * 0.015, 0.538, 0.425], 0.004, "#f2a030", { bone: bb });
  }
  const bt = b.joint("birdTail", { parent: bb, at: [0, 0.585, 0.35], dir: [0, 0.15, -1], role: "tail" });
  P(new THREE.BoxGeometry(1, 1, 1), "#2f86c8", bt, [0, 0.6, 0.31], [0.04, 0.008, 0.07], [-12, 0, 0]);
  // little music note puffs of whimsy: tiny tuft feather on bird head already; add small heart
  P(sph(5, 4), "#ff7aa6", head, [-0.1, 0.52, 0.42], [0.012, 0.012, 0.012]);

  void rng;
  return b.root;
}
