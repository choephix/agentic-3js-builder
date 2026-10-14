import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Baby Dragon",
  description: "A chubby, big-headed baby dragon with stubby wings, horns, a curled tail and a cream belly.",
};

export default function build() {
  const b = createBuilder({ name: "babyDragon" });
  const R = rng(7);

  const GREEN = "#6fbf5a", DARK = "#3f8f4a", BELLY = "#f2deb0", HORN = "#f4efe0";
  const ORANGE = "#f08a3c", EYE = "#ffcc33", PUPIL = "#2a1a2a", PINK = "#f4a0a8";

  // ---- skeleton ----
  const root = b.joint("hips", { at: [0, 0.34, -0.12] });

  const spine = b.chain("spine", [[0, 0.34, -0.12], [0, 0.38, 0.05], [0, 0.42, 0.2]], { parent: root, role: "spine" });
  const neck = b.chain("neck", [[0, 0.42, 0.2], [0, 0.55, 0.27], [0, 0.66, 0.33]], { parent: spine, role: "neck" });

  const tailPts = [[0, 0.32, -0.12], [0, 0.28, -0.32], [0.04, 0.2, -0.5], [0.14, 0.12, -0.62], [0.26, 0.1, -0.64], [0.32, 0.14, -0.58]];
  const tail = b.chain("tail", tailPts, { parent: root, role: "tail" });

  // ---- body ----
  const body = b.sweep(spine, { radius: (t: number) => 0.16 + 0.05 * Math.sin(t * Math.PI), color: GREEN });
  b.sweep(tail, { radius: (t: number) => 0.11 * (1 - t) + 0.02, color: GREEN });
  b.sweep(neck, { radius: (t: number) => 0.09 - 0.015 * t, color: GREEN });

  // head
  const head = b.chain("head", [[0, 0.66, 0.33], [0, 0.7, 0.42], [0, 0.69, 0.5]], { parent: neck, role: "head" });
  const skull = b.sweep(head, { radius: (t: number) => 0.14 - 0.03 * t, color: GREEN });
  const snoutJ = b.joint("snout", { at: [0, 0.68, 0.48], parent: head });
  const jaw = b.joint("jaw", { at: [0, 0.65, 0.42], parent: head });
  b.spike([0, 0.7, 0.45], [0, 0.69, 0.64], null, 0.085, { color: GREEN });
  b.spike([0, 0.6, 0.43], [0, 0.6, 0.6], null, 0.06, { color: DARK, bone: jaw });
  b.spike([0, 0.625, 0.5], [0, 0.625, 0.58], null, 0.045, { color: PINK, bone: jaw });

  const hs = b.surface(skull);
  // eyes, nostrils, horns, cheeks
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eye = hs.nearest([s * 0.12, 0.76, 0.45]);
    b.stick(new THREE.IcosahedronGeometry(0.045, 1), EYE, eye);
    const pupil = hs.nearest([s * 0.145, 0.765, 0.5]);
    b.stick(new THREE.IcosahedronGeometry(0.022, 0), PUPIL, pupil);
    b.stick(new THREE.IcosahedronGeometry(0.02, 0), ORANGE, hs.nearest([s * 0.11, 0.8, 0.4]));
    b.stick(new THREE.IcosahedronGeometry(0.014, 0), DARK, hs.nearest([s * 0.035, 0.74, 0.64]));
    b.spike([s * 0.07, 0.8, 0.35], [s * 0.13, 0.98, 0.22], null, 0.035, { color: HORN });
    b.spike([s * 0.1, 0.7, 0.34], [s * 0.2, 0.74, 0.22], null, 0.02, { color: ORANGE });
  }

  // belly
  const belly = b.surface(body);
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const z = -0.1 + t * 0.3;
    const h = belly.nearest([0, 0.2, z]);
    b.stick(new THREE.BoxGeometry(0.17 - 0.02 * Math.abs(t - 0.5), 0.035, 0.07), BELLY, h);
  }

  // back spikes
  const cols = [ORANGE, ORANGE, ORANGE];
  for (let i = 0; i < 6; i++) {
    const z = -0.2 + i * 0.1;
    const y = 0.4 + 0.07 * Math.sin(i / 5 * Math.PI) + 0.02;
    const h = belly.nearest([0, y + 0.25, z]);
    b.stick(new THREE.ConeGeometry(0.035 - i * 0.002, 0.09, 4), cols[i % 3], h);
  }
  // tail spikes and tip
  b.along(tail, 5, (at: any) => {
    const hit = b.surface(body).nearest(at);
    void hit;
  });
  for (let i = 1; i < 5; i++) {
    const p = tailPts[i];
    b.spike([p[0], p[1] + 0.05, p[2]], [p[0], p[1] + 0.13 - i * 0.01, p[2] - 0.01], null, 0.025, { color: ORANGE });
  }
  b.spike([0.32, 0.14, -0.58], [0.4, 0.2, -0.5], null, 0.06, { color: ORANGE });

  // ---- legs ----
  const legs: [string, number, number][] = [["FrontL", 1, 0.17], ["FrontR", -1, 0.17], ["BackL", 1, -0.17], ["BackR", -1, -0.17]];
  for (const [n, s, z] of legs) {
    const back = z < 0;
    const pts = back
      ? [[s * 0.14, 0.3, z], [s * 0.17, 0.17, z - 0.04], [s * 0.17, 0.06, z + 0.02]]
      : [[s * 0.13, 0.36, z], [s * 0.16, 0.2, z + 0.02], [s * 0.17, 0.05, z + 0.05]];
    const leg = b.chain("leg" + n, pts, { parent: root, role: "leg" });
    b.sweep(leg, { radius: (t: number) => (back ? 0.065 : 0.055) - 0.015 * t, color: GREEN });
    const a = pts[2];
    // foot
    const g = new THREE.SphereGeometry(0.06, 6, 4);
    g.scale(1, 0.55, 1.4);
    const foot = b.part({ at: [a[0], 0.03, a[2] + 0.04], geometry: g, color: DARK });
    void foot;
    for (const k of [-1, 0, 1]) {
      b.spike([a[0] + k * 0.035, 0.025, a[2] + 0.1], [a[0] + k * 0.04, 0.02, a[2] + 0.15], null, 0.014, { color: HORN });
    }
  }

  // ---- wings ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain("wing" + side, [[s * 0.1, 0.5, 0.05], [s * 0.3, 0.68, -0.02], [s * 0.55, 0.78, -0.1]], { parent: spine, role: "wing" });
    b.sweep(arm, { radius: 0.02, color: DARK });
    const finger = b.chain("wingFinger" + side, [[s * 0.55, 0.78, -0.1], [s * 0.62, 0.62, -0.2], [s * 0.5, 0.5, -0.24]], { parent: arm, role: "digit" });
    b.sweep(finger, { radius: 0.012, color: DARK });
    const edge = [[s * 0.1, 0.46, -0.05], [s * 0.25, 0.48, -0.14], [s * 0.5, 0.5, -0.24]];
    b.membrane(arm, edge, { color: ORANGE });
    b.membrane(finger, [[s * 0.55, 0.78, -0.1], [s * 0.52, 0.6, -0.18], [s * 0.5, 0.5, -0.24]], { color: ORANGE });
    b.spike([s * 0.55, 0.78, -0.1], [s * 0.6, 0.88, -0.06], null, 0.015, { color: HORN });
  }

  void R;
  return b.root;
}
