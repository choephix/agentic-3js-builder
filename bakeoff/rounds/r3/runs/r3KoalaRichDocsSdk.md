```ts
import * as THREE from "three";
import { createBuilder, catmull, rng, mottle, grain, paint, lerp } from "agentic-3js-builder";

export const meta = {
  name: "Sleepy Koala",
  description: "A drowsy ash-grey koala with a cream chest, hugging a eucalyptus trunk and munching a sprig of blue-green leaves.",
};

const FUR = "#9a9ba2";
const FUR2 = "#b3b4ba";
const DARK = "#62636b";
const CREAM = "#f0e7d3";
const NOSE = "#1a191b";
const BROWN = "#4b2a17";
const CLAW = "#2b292d";
const BARK = "#8c7b69";
const BARK2 = "#6f6254";
const TWIG = "#6b5a49";
const LEAFS = ["#6f9c8c", "#5a8a7e", "#86ae9c"];
const MOUTH = "#40201f";

export default function build() {
  const b = createBuilder({ name: "koala" });
  const rand = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.4, -0.05] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.4, -0.05],
      [0, 0.55, -0.02],
      [0, 0.7, 0.03],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.joint("neck", { parent: spine.joints[2], at: [0, 0.74, 0.04], aim: [0, 0.8, 0.07], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.8, 0.07], aim: [0, 0.88, 0.2], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.8, 0.1], aim: [0, 0.79, 0.2], role: "jaw" });
  const trunk = b.joint("trunk", { parent: hips, at: [0, 0.5, 0.34], aim: [0, 1.2, 0.34] });

  const fur = mottle(FUR, FUR2, { size: 0.06, contrast: 0.5, seed: 3 });
  const chestFur = paint((p, n) => (n.z > 0.2 && p.y > 0.44 ? CREAM : fur));

  // ---------- body ----------
  const body = b.sweep(spine, [0.17, 0.17, 0.125], { color: chestFur });
  b.part(new THREE.SphereGeometry(0.18, 12, 8), fur, { bone: hips, at: [0, 0.35, -0.07], scale: [1.0, 0.9, 1.0] });

  const skin = b.surface(body);
  for (const hit of skin.scatter(40, { rng: rng(5), minDist: 0.07 })) {
    const cream = hit.n.z > 0.2 && hit.at.y > 0.44;
    b.stick(new THREE.ConeGeometry(0.02, 0.05, 5), cream ? CREAM : FUR2, hit, { embed: 0.3 });
  }

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(0.15, 14, 10), fur, { bone: head, at: [0, 0.86, 0.08], scale: [1.12, 0.95, 1.0] });
  b.part(new THREE.SphereGeometry(0.075, 10, 8), FUR2, { bone: head, at: [0, 0.83, 0.19], scale: [1, 0.85, 1] });
  b.part(new THREE.SphereGeometry(0.05, 10, 8), NOSE, { bone: head, at: [0, 0.845, 0.232], scale: [1.15, 0.8, 1] });
  b.part(new THREE.SphereGeometry(0.035, 8, 6), MOUTH, { bone: head, at: [0, 0.805, 0.2], scale: [1.2, 0.4, 0.8] });
  b.part(new THREE.SphereGeometry(0.055, 10, 6), CREAM, { bone: jaw, at: [0, 0.787, 0.17], scale: [1, 0.55, 0.95] });

  for (const s of [1, -1]) {
    // drowsy eyes
    b.part(new THREE.SphereGeometry(0.022, 8, 6), BROWN, { bone: head, at: [s * 0.07, 0.885, 0.2] });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), NOSE, { bone: head, at: [s * 0.07, 0.882, 0.214] });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), fur, { bone: head, at: [s * 0.07, 0.9, 0.202], scale: [1.05, 0.62, 1] });

    // ears
    const dir = V(s * 0.55, 0.15, 0.8).normalize();
    const ear = b.part(new THREE.SphereGeometry(0.085, 12, 8), fur, {
      bone: head, at: [s * 0.15, 0.97, 0.03], dir, axis: "z", scale: [1, 1.05, 0.5],
    });
    b.part(new THREE.SphereGeometry(0.068, 10, 8), CREAM, {
      bone: head, at: V(s * 0.15, 0.97, 0.03).addScaledVector(dir, 0.016), dir, axis: "z", scale: [1, 1.05, 0.5],
    });
    b.ring(ear, { count: 12, radius: 0.08 }, (item) => b.spike(item, item, 0.045, 0.02, { color: CREAM }));

    // cheek fluff
    for (let i = 0; i < 3; i++) {
      const y = 0.84 + i * 0.02;
      b.spike([s * 0.13, y, 0.12], [s * 0.7, -0.15 + i * 0.1, -0.4], 0.05, 0.02, { bone: head, color: CREAM });
    }
  }

  // ---------- trunk, stub ----------
  const bark = grain(BARK, BARK2, { size: 0.02, axis: "y", seed: 2 });
  b.rod([0, -0.005, 0.34], [0.01, 1.25, 0.33], [0.056, 0.04], { bone: trunk, color: bark });
  b.lathe(
    [[0, 0], [0.1, 0], [0.075, 0.05], [0.05, 0.13], [0, 0.13]],
    { at: [0, -0.005, 0.34], bone: trunk, color: bark, smoothing: 1 },
  );
  b.rod([0, 0.24, 0.34], [0, 0.25, -0.2], 0.036, { bone: trunk, color: bark });

  const leaf = (base: any, dir: THREE.Vector3, len: number, roll: number, bone: any, color: string) => {
    const d = dir.clone().normalize();
    const w = new THREE.Vector3().crossVectors(d, V(0, 1, 0));
    if (w.length() < 0.1) w.set(1, 0, 0);
    w.normalize().applyAxisAngle(d, roll);
    const o: any[] = [
      [0, 0, "sharp"], [0.2, 0.09], [0.55, 0.11], [0.85, 0.06],
      [1, 0, "sharp"], [0.85, -0.06], [0.55, -0.11], [0.2, -0.09],
    ].map((q: any) => (q[2] ? [q[0] * len, q[1] * len, "sharp"] : [q[0] * len, q[1] * len]));
    b.extrude(o, { at: base, x: d, y: w, thickness: 0.004, smoothing: 1, color, bone });
  };

  const twig = (from: number[], to: number[]) => {
    b.rod(from, to, [0.014, 0.007], { bone: trunk, color: TWIG });
    const f = V(from[0], from[1], from[2]);
    const t = V(to[0], to[1], to[2]);
    for (let i = 0; i < 6; i++) {
      const s = i % 2 ? 1 : -1;
      const base = lerp(f, t, 0.3 + 0.14 * i);
      const d = V(s * 0.6 + (t.x - f.x), -0.35 + rand() * 0.2, 0.3 + rand() * 0.3);
      leaf(base, d, 0.1 + rand() * 0.03, rand() * 1.2 - 0.6, trunk, LEAFS[i % 3]);
    }
    leaf(t, V(t.x - f.x, 0.1, t.z - f.z + 0.1), 0.11, 0.3, trunk, LEAFS[0]);
  };
  twig([0, 1.0, 0.34], [-0.22, 1.18, 0.42]);
  twig([0, 0.88, 0.36], [0.22, 1.02, 0.5]);
  twig([0.01, 1.2, 0.33], [0.05, 1.28, 0.2]);

  // ---------- arms ----------
  const finger = (base: THREE.Vector3, tip: THREE.Vector3, bone: any) => {
    b.capsule(base, tip, 0.011, { bone, color: DARK });
    const d = tip.clone().sub(base).normalize();
    d.y -= 0.3;
    b.spike(tip, d, 0.025, 0.008, { bone, color: CLAW });
  };

  // right arm hugs the trunk
  {
    const arm = b.chain(
      "armR",
      catmull([[-0.14, 0.68, 0.04], [-0.19, 0.6, 0.22], [-0.07, 0.62, 0.375]]),
      { parent: spine.joints[1], names: ["shoulderR", "elbowR", "wristR"], role: "arm" },
    );
    b.sweep(arm, [0.06, 0.05, 0.04], { color: fur });
    const w = V(-0.07, 0.62, 0.375);
    b.part(new THREE.SphereGeometry(0.04, 8, 6), DARK, { bone: arm.tip!, at: w, scale: [1, 0.8, 1.1] });
    for (let i = -1; i <= 1; i++) finger(w.clone().add(V(0.01, i * 0.025, 0.01)), V(0.035, 0.62 + i * 0.025, 0.4), arm.tip!);
  }
  // left arm brings the sprig to the mouth
  {
    const arm = b.chain(
      "armL",
      catmull([[0.14, 0.68, 0.04], [0.21, 0.7, 0.2], [0.1, 0.84, 0.31]]),
      { parent: spine.joints[1], names: ["shoulderL", "elbowL", "wristL"], role: "arm" },
    );
    b.sweep(arm, [0.06, 0.05, 0.04], { color: fur });
    const w = V(0.1, 0.84, 0.31);
    const hand = arm.tip!;
    b.part(new THREE.SphereGeometry(0.04, 8, 6), DARK, { bone: hand, at: w, scale: [1, 0.8, 1.1] });
    for (let i = -1; i <= 1; i++)
      finger(w.clone().add(V(-0.01, 0.015, 0.01 + i * 0.02)), w.clone().add(V(-0.045, -0.015, 0.0 + i * 0.022)), hand);

    const start = V(0.2, 0.87, 0.36);
    const end = V(0.01, 0.805, 0.25);
    b.rod(start, end, [0.009, 0.006], { bone: hand, color: TWIG });
    const u = end.clone().sub(start).normalize();
    for (let i = 0; i < 6; i++) {
      const s = i % 2 ? 1 : -1;
      const base = lerp(start, end, 0.1 + 0.16 * i);
      const d = V(s * 0.8, 0.2, 0.1).addScaledVector(u, -0.35);
      leaf(base, d, 0.1, rand() * 1.4 - 0.7, hand, LEAFS[i % 3]);
    }
    leaf(lerp(start, end, 0.98), V(0.3, -0.5, 0.8), 0.06, 0.4, hand, LEAFS[1]);
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      catmull([[s * 0.14, 0.38, -0.02], [s * 0.22, 0.33, 0.15], [s * 0.085, 0.3, 0.33]]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" },
    );
    b.sweep(leg, [0.075, 0.06, 0.045], { color: fur });
    const a = V(s * 0.085, 0.3, 0.33);
    b.part(new THREE.SphereGeometry(0.042, 8, 6), DARK, { bone: leg.tip!, at: a, scale: [1, 0.8, 1.1] });
    for (let i = -1; i <= 1; i++)
      finger(a.clone().add(V(-s * 0.01, i * 0.022, 0.015)), V(s * 0.01, 0.3 + i * 0.022, 0.405), leg.tip!);
  }

  // mid-munch: jaw slightly open
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  return b.root;
}
```