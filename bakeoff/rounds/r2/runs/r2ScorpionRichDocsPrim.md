```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, offset } from "agentic-3js-builder";

export const meta = {
  name: "Desert Scorpion",
  description:
    "Threatening amber scorpion with tail arched over its back, forward pincers, eight jointed legs, banded segments, a bulbous dark stinger and a cluster of tiny black eyes.",
};

const AMBER = "#d98a1f";
const AMBER2 = "#ecab36";
const DARK = "#5c2b0d";
const STING = "#2a1208";
const BLACK = "#050403";

export default function build() {
  const b = createBuilder({ name: "scorpion" });

  // ---------- skeleton ----------
  const root = b.joint("body", { at: [0, 0.04, 0], dir: [0, 0, 1] });
  const head = b.joint("head", { parent: root, at: [0, 0.04, 0.03], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.032, 0.068], dir: [0, 0, 1], role: "jaw" });

  // ---------- carapace (head shield) ----------
  b.part(new THREE.SphereGeometry(1, 8, 6), AMBER, {
    at: [0, 0.04, 0.035], scale: [0.033, 0.017, 0.042], bone: head, flat: true,
  });
  // raised eye mound
  b.part(new THREE.SphereGeometry(1, 6, 4), DARK, {
    at: [0, 0.056, 0.038], scale: [0.016, 0.008, 0.012], bone: head, flat: true,
  });
  // eyes: two median + three lateral per side
  const eyeGeo = new THREE.SphereGeometry(0.0042, 6, 4);
  for (const s of [1, -1]) {
    b.part(eyeGeo, BLACK, { at: [s * 0.0065, 0.0615, 0.039], bone: head });
    const lat = [[0.025, 0.045, 0.062], [0.028, 0.045, 0.052], [0.029, 0.044, 0.042]];
    for (const p of lat) b.part(eyeGeo, BLACK, { at: [s * p[0], p[1], p[2]], bone: head });
  }
  // carapace ridges
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.004, 0.003, 0.05), DARK, {
      at: [s * 0.016, 0.0555, 0.03], bone: head, rotation: [0, s * 8, 0],
    });
  }

  // ---------- mouth ----------
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.011, 0.008, 0.02), DARK, { at: [s * 0.008, 0.037, 0.08], bone: head });
    b.part(new THREE.BoxGeometry(0.009, 0.006, 0.018), "#7a3b12", { at: [s * 0.008, 0.031, 0.021], bone: jaw });
  }

  // ---------- abdomen (mesosoma) ----------
  const spine = b.chain("spine", catmull([[0, 0.04, 0.012], [0, 0.04, -0.045], [0, 0.041, -0.118]]), {
    parent: root, role: "spine",
  });
  b.sweep(spine, (t) => [0.034 - 0.014 * t, 0.02 - 0.006 * t], {
    sides: 8,
    color: (t) => ((t * 7) % 1 < 0.16 ? DARK : AMBER),
    caps: "round",
  });
  // dorsal keel
  b.rod([0, 0.0605, 0.0], [0, 0.0555, -0.11], 0.0025, { color: DARK, bone: spine.joints[1], sides: 5 });

  // ---------- tail (metasoma) ----------
  const tailPts: number[][] = [
    [0, 0.044, -0.115], [0, 0.05, -0.165], [0, 0.085, -0.205], [0, 0.14, -0.205],
    [0, 0.185, -0.165], [0, 0.2, -0.11], [0, 0.185, -0.06],
  ];
  const tailPath = catmull(tailPts);
  const tail = b.chain("tail", tailPath, { parent: spine.joints[spine.joints.length - 1], role: "tail" });
  b.sweep(tail, [0.0175, 0.0115], {
    sides: 8,
    color: (t) => ((t * 6) % 1 < 0.14 ? DARK : AMBER2),
    caps: "round",
  });
  for (let i = 1; i < 6; i++) {
    const tp = tail.at(i / 6);
    b.part(new THREE.SphereGeometry(0.011 - i * 0.0004, 6, 4), DARK, { at: tp.at, bone: tail.joints[i] });
  }
  const tailEnd = tailPath.at(1);
  const tailTan = tailPath.tangentAt(1);
  const lastTail = tail.joints[tail.joints.length - 1];
  const bulbC = offset(tailEnd, tailTan, 0.014);
  b.part(new THREE.SphereGeometry(0.0165, 8, 6), STING, {
    at: bulbC, scale: [0.9, 1, 1.25], bone: lastTail, flat: true,
  });
  b.spike(bulbC, [0, -0.75, 0.66], 0.042, 0.008, { color: "#150a05", bone: lastTail, sides: 6 });

  // ---------- pedipalps (pincers) ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${S}`,
      catmull([[s * 0.024, 0.036, 0.06], [s * 0.05, 0.036, 0.09], [s * 0.045, 0.036, 0.13]]),
      { parent: root, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" },
    );
    b.sweep(arm, [0.0085, 0.0075], { sides: 6, color: AMBER, caps: "round" });
    b.part(new THREE.SphereGeometry(0.0098, 6, 5), DARK, { at: arm.joints[0].at, bone: arm.joints[0] });
    b.part(new THREE.SphereGeometry(0.0098, 6, 5), DARK, { at: arm.joints[1].at, bone: arm.joints[1] });
    const wrist = arm.tip ?? arm.joints[arm.joints.length - 1];
    // palm
    b.part(new THREE.SphereGeometry(1, 8, 6), AMBER2, {
      at: [s * 0.043, 0.036, 0.155], scale: [0.017, 0.011, 0.03], bone: wrist, flat: true,
    });
    b.part(new THREE.SphereGeometry(0.0105, 6, 5), DARK, { at: [s * 0.045, 0.036, 0.132], bone: wrist });
    // fixed finger (outer)
    b.spike([s * 0.052, 0.036, 0.162], [-s * 0.3, 0, 1], 0.042, 0.0085, { color: AMBER, bone: wrist, sides: 6 });
    // movable finger (inner) on its own joint
    const pj = b.joint(`pincer${S}`, {
      parent: wrist, at: [s * 0.036, 0.034, 0.152], dir: [s * 0.05, 0, 1], role: "jaw",
    });
    b.spike([s * 0.036, 0.034, 0.152], [s * 0.05, 0, 1], 0.042, 0.0075, { color: DARK, bone: pj, sides: 6 });
    b.part(new THREE.SphereGeometry(0.006, 5, 4), DARK, { at: [s * 0.036, 0.034, 0.152], bone: pj });
  }

  // ---------- legs: 4 pairs ----------
  const hipZ = [0.045, 0.02, -0.003, -0.025];
  const footZ = [0.115, 0.065, -0.012, -0.075];
  const footX = [0.085, 0.095, 0.095, 0.085];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const pts = limb(
        [s * 0.02, 0.034, hipZ[i]],
        [s * footX[i], 0.001, footZ[i]],
        [0.034, 0.04, 0.03],
        [s * 0.15, 1, 0],
      );
      const leg = b.chain(`leg${S}${i + 1}`, pts, {
        parent: root,
        names: [`hip${S}${i + 1}`, `knee${S}${i + 1}`, `ankle${S}${i + 1}`, `foot${S}${i + 1}`],
        role: "leg",
      });
      b.sweep(leg, [0.0046, 0.0028], {
        sides: 6,
        color: (t) => (t > 0.84 ? DARK : AMBER2),
        caps: "round",
      });
      for (let k = 1; k <= 2; k++) {
        b.part(new THREE.SphereGeometry(0.0058, 6, 4), DARK, { at: pts[k], bone: leg.joints[k] });
      }
    }
  }

  return b.root;
}
```