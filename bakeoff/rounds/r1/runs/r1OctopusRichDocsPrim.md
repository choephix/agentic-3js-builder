```ts
import * as THREE from "three";
import { createBuilder, catmull, countershade, spots, mottle, rng } from "agentic-3js-builder";

export const meta = {
  name: "Reef Octopus with Brass Key",
  description:
    "A curious coral-and-rust octopus with a bulbous bumpy mantle, golden bar-pupil eyes and a grumpy brow. Eight curling arms lined with cream suckers; one arm holds up an old brass key.",
};

const CORAL = "#e8705a";
const RUST = "#b8482c";
const DEEP = "#8c3220";
const PALE = "#f6cfae";
const BELLY = "#f2a98c";
const CREAM = "#fbe9cf";
const PINK = "#e58f7c";
const GOLD = "#f2b632";
const ORANGE = "#d9741a";
const BRASS = "#c9a227";
const BRASS_D = "#8f6f1a";

export default function build() {
  const b = createBuilder({ name: "octopus" });
  const rand = rng(11);

  const root = b.joint("root", { at: [0, 0.15, 0.05], role: "spine" });
  const coat = countershade(
    spots(mottle(CORAL, RUST, { size: 0.12, contrast: 0.6 }), PALE, { size: 0.07, amount: 0.28, seed: 3 }),
    BELLY,
    { level: -0.35, soft: 0.3 },
  );

  // ---- mantle / head
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.14, 0.06],
      [0, 0.3, 0.04],
      [0, 0.48, -0.06],
      [0, 0.62, -0.18],
      [0, 0.68, -0.26],
    ]),
    { parent: root, role: "spine" },
  );
  const mantle = b.sweep(spine, [0.17, 0.24, 0.26, 0.21, 0.09], { color: coat });
  const head = b.joint("head", {
    parent: spine.joints[1],
    at: [0, 0.34, 0.05],
    dir: [0, 0, 1],
    role: "head",
  });

  // web skirt hiding the arm roots
  b.lathe(
    [
      [0, 0.03],
      [0.2, 0.05],
      [0.26, 0.1],
      [0.2, 0.18],
      [0, 0.2],
    ],
    { at: [0, 0, 0.05], bone: root, color: coat },
  );

  // ---- beak
  const jaw = b.joint("jaw", {
    parent: spine.joints[0],
    at: [0, 0.1, 0.22],
    aim: [0, 0.09, 0.32],
    role: "jaw",
  });
  b.part(new THREE.ConeGeometry(0.032, 0.075, 6), "#3a2418", {
    bone: spine.joints[0],
    at: [0, 0.125, 0.27],
    dir: [0, -0.25, 1],
  });
  b.part(new THREE.ConeGeometry(0.026, 0.06, 6), "#5a3a26", {
    bone: jaw,
    at: [0, 0.095, 0.265],
    dir: [0, 0.3, 1],
  });

  // ---- eyes
  for (const s of [1, -1]) {
    const C = new THREE.Vector3(s * 0.15, 0.36, 0.17);
    const D = new THREE.Vector3(s * 0.6, 0.15, 0.78).normalize();
    const at = (k: number) => C.clone().addScaledVector(D, k);
    b.part(new THREE.SphereGeometry(0.072, 8, 6), RUST, { bone: head, at: at(-0.012) });
    b.part(new THREE.SphereGeometry(0.056, 10, 8), GOLD, { bone: head, at: at(0.02) });
    b.part(new THREE.TorusGeometry(0.035, 0.007, 5, 12), ORANGE, {
      bone: head,
      at: at(0.02 + 0.042),
      dir: D,
      axis: "z",
    });
    b.part(new THREE.BoxGeometry(0.06, 0.016, 0.01), "#150c08", {
      bone: head,
      at: at(0.02 + 0.051),
      dir: D,
      axis: "z",
    });
    // grumpy brow: inner end lower
    b.part(new THREE.BoxGeometry(0.135, 0.028, 0.06), DEEP, {
      bone: head,
      at: at(0.04).add(new THREE.Vector3(0, 0.05, 0)),
      dir: D,
      up: [-s * 0.5, 1, 0],
      axis: "z",
    });
  }

  // ---- arms
  const O = new THREE.Vector3(0, 0, 0.05);
  const suckerRows = (sw: ReturnType<typeof b.sweep>, tmax: number) => {
    for (const ang of [62, -62]) {
      for (let k = 0; k < 9; k++) {
        const t = 0.1 + (k / 8) * (tmax - 0.1);
        const hit = sw.at(t, ang);
        const r = 0.02 * (1 - t) + 0.008;
        b.stick(new THREE.CylinderGeometry(r, r * 1.1, 0.014, 8), CREAM, hit, { embed: 0.3 });
        b.stick(new THREE.CylinderGeometry(r * 0.5, r * 0.5, 0.02, 6), PINK, hit, { embed: 0.3 });
      }
    }
  };

  const armSweeps: ReturnType<typeof b.sweep>[] = [];
  let keyBone: any = null;
  let keyPos = new THREE.Vector3();

  for (let i = 0; i < 8; i++) {
    const az = ((30 + 45 * i) * Math.PI) / 180;
    const d = new THREE.Vector3(Math.sin(az), 0, Math.cos(az));
    const p = new THREE.Vector3(Math.cos(az), 0, -Math.sin(az));
    const P = (r: number, y: number, side = 0) =>
      O.clone().addScaledVector(d, r).addScaledVector(p, side).add(new THREE.Vector3(0, y, 0));

    if (i === 0) {
      const R = 0.6;
      const W = 0.036;
      const pts = [P(0.12, 0.13), P(0.32, 0.09), P(0.5, 0.22), P(0.58, 0.45), P(R - W, 0.62)];
      for (let k = 0; k < 5; k++) {
        const a = (k * 110 * Math.PI) / 180;
        pts.push(P(R - Math.cos(a) * W, 0.78 + 0.04 * k, Math.sin(a) * W));
      }
      const ch = b.chain("arm0", catmull(pts), {
        parent: root,
        count: 8,
        role: "tentacle",
        names: (k: number) => `arm0_${k + 1}`,
      });
      const sw = b.sweep(ch, (t: number) => 0.07 * Math.pow(1 - t, 1.3) + 0.012, { color: coat });
      armSweeps.push(sw);
      suckerRows(sw, 0.7);
      keyBone = ch.joints[ch.joints.length - 1];
      keyPos = P(R, 0.88);
    } else {
      const c = (i % 2 ? 1 : -1) * (0.6 + 0.15 * (i % 3));
      const pts = [
        P(0.12, 0.13),
        P(0.3, 0.09, c * 0.03),
        P(0.5, 0.045, c * 0.12),
        P(0.68, 0.04, c * 0.3),
        P(0.78, 0.07, c * 0.5),
        P(0.8, 0.1 + 0.03 * (i % 3), c * 0.64),
      ];
      const ch = b.chain(`arm${i}`, catmull(pts), {
        parent: root,
        count: 5,
        role: "tentacle",
        names: (k: number) => `arm${i}_${k + 1}`,
      });
      const sw = b.sweep(ch, (t: number) => 0.075 * (1 - t) + 0.008, { color: coat });
      armSweeps.push(sw);
      suckerRows(sw, 0.88);
    }
  }

  // ---- key
  const K = keyPos;
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.3, 8), BRASS, { bone: keyBone, at: [K.x, K.y, K.z] });
  b.part(new THREE.TorusGeometry(0.045, 0.011, 6, 12), BRASS, { bone: keyBone, at: [K.x, K.y + 0.2, K.z] });
  b.part(new THREE.TorusGeometry(0.02, 0.008, 5, 8), BRASS_D, { bone: keyBone, at: [K.x, K.y + 0.2, K.z] });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.016, 8), BRASS_D, { bone: keyBone, at: [K.x, K.y + 0.12, K.z] });
  b.part(new THREE.BoxGeometry(0.07, 0.035, 0.016), BRASS, { bone: keyBone, at: [K.x + 0.04, K.y - 0.115, K.z] });
  b.part(new THREE.BoxGeometry(0.02, 0.03, 0.016), BRASS_D, { bone: keyBone, at: [K.x + 0.065, K.y - 0.14, K.z] });

  // ---- bumps
  const bumpGeo = new THREE.SphereGeometry(0.017, 5, 4);
  const mSurf = b.surface(mantle);
  for (const h of mSurf.scatter(75, { rng: rand, minDist: 0.055, filter: (h) => h.n.y > -0.2 && h.at.z < 0.2 + 0.1 })) {
    const pale = rand() > 0.5;
    b.stick(bumpGeo, pale ? PALE : RUST, h, { embed: 0.4, scale: [1, 0.7 + rand() * 0.4, 1] });
  }
  for (const sw of armSweeps) {
    for (const h of b.surface(sw).scatter(12, { rng: rand, minDist: 0.06, filter: (h) => h.n.y > 0.35 })) {
      b.stick(new THREE.SphereGeometry(0.011, 5, 4), rand() > 0.5 ? PALE : DEEP, h, { embed: 0.4 });
    }
  }

  return b.root;
}
```