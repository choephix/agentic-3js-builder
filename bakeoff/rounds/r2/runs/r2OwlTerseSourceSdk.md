```ts
import * as THREE from "three";
import { createBuilder, polyline, catmull, paint, mix, resolve, smoothstep, mottle, spots, stripes } from "agentic-3js-builder";

export const meta = {
  name: "Great Horned Owl",
  description: "A perched owl with ear tufts, facial discs, spread wings, barred tail and taloned feet, rigged with a jaw.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "owl" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const seg = (n: number) => b.segments(n);

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0.12, -0.02] });
  const spine = b.chain("spine", catmull([[0, 0.12, -0.04], [0, 0.22, -0.01], [0, 0.32, 0.03]]), {
    parent: "root", names: ["spine1", "spine2", "spine3"], role: "spine",
  });
  b.joint("neck", { parent: "spine3", at: [0, 0.33, 0.03], aim: [0, 0.4, 0.04], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 0.37, 0.04], dir: [0, 1, 0], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.378, 0.09], dir: [0, 0, 1], role: "jaw" });

  // ---------- paints ----------
  const BROWN = "#8a6240";
  const backP = stripes(mottle(BROWN, "#5e4129", { size: 0.03, contrast: 1.5 }), "#3a2a1b", {
    size: 0.04, axis: "y", width: 0.22, wobble: 0.8,
  });
  const bellyP = spots("#ecdcb4", "#5a3d26", { size: 0.028, amount: 0.45 });
  const bodyP = paint((p, n) => mix(resolve(backP, p, n), resolve(bellyP, p, n), smoothstep(0.0, 0.45, n.z)));

  // ---------- body ----------
  b.sweep(spine, (t) => {
    const s = Math.sin(Math.PI * (0.1 + 0.8 * t));
    return [0.04 + 0.07 * s, 0.035 + 0.06 * s] as [number, number];
  }, { color: bodyP, name: "body" });

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(0.085, seg(12), seg(9)), bodyP, { at: [0, 0.4, 0.04], bone: "head", scale: [1.2, 0.92, 1.0], name: "skull" });
  for (const s of [1, -1]) {
    const A = s > 0 ? "L" : "R";
    // facial disc and rim
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.012, seg(14)), "#8a6038", { at: [s * 0.04, 0.397, 0.098], bone: "head", rotation: [90, 0, 0], name: "rim" + A });
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.012, seg(14)), "#efe2c4", { at: [s * 0.04, 0.397, 0.105], bone: "head", rotation: [90, 0, 0], name: "disc" + A });
    // eyes
    b.part(new THREE.SphereGeometry(0.024, seg(10), seg(8)), "#2a1c12", { at: [s * 0.038, 0.403, 0.112], bone: "head", scale: [1, 1, 0.5], name: "eyeRing" + A });
    b.part(new THREE.SphereGeometry(0.018, seg(10), seg(8)), "#f0a81c", { at: [s * 0.038, 0.403, 0.118], bone: "head", scale: [1, 1, 0.7], name: "iris" + A });
    b.part(new THREE.SphereGeometry(0.011, seg(8), seg(6)), "#0a0806", { at: [s * 0.038, 0.403, 0.127], bone: "head", name: "pupil" + A });
    // brow
    b.part(new THREE.BoxGeometry(0.04, 0.008, 0.012), "#3a2a1b", { at: [s * 0.04, 0.428, 0.112], bone: "head", rotation: [0, 0, s * -18], name: "brow" + A });
    // ear tufts
    b.part(new THREE.ConeGeometry(0.018, 0.075, 5), "#4a3322", { at: [s * 0.058, 0.468, 0.03], bone: "head", rotation: [-8, 0, s * -22], name: "tuft" + A });
    b.part(new THREE.ConeGeometry(0.01, 0.05, 5), "#9a7048", { at: [s * 0.062, 0.462, 0.04], bone: "head", rotation: [-8, 0, s * -22], name: "tuftIn" + A });
  }
  // beak
  b.part(new THREE.ConeGeometry(0.014, 0.04, 5), "#2f2a26", { at: [0, 0.388, 0.128], bone: "head", rotation: [100, 0, 0], name: "beakUpper" });
  b.part(new THREE.ConeGeometry(0.01, 0.026, 5), "#3a342f", { at: [0, 0.374, 0.118], bone: "jaw", rotation: [96, 0, 0], name: "beakLower" });

  // ---------- tail ----------
  b.chain("tail", polyline([[0, 0.12, -0.05], [0, 0.07, -0.13], [0, 0.03, -0.22]]), {
    parent: "spine1", names: ["tail1", "tail2", "tail3"], role: "tail",
  });
  const tailDir = V(0, -0.4, -0.92).normalize();
  b.extrude(
    [[-0.04, 0], [0.04, 0], [0.055, 0.12], [0.045, 0.19], [0, 0.205], [-0.045, 0.19], [-0.055, 0.12]],
    {
      at: [0, 0.11, -0.07], x: [1, 0, 0], y: tailDir, thickness: 0.012, bevel: 0.003, smoothing: 1,
      color: stripes(BROWN, "#3a2a1b", { size: 0.035, axis: tailDir.toArray(), width: 0.4, wobble: 0.2 }),
      bone: "tail1", name: "tailFan",
    },
  );

  // ---------- wings ----------
  const wingOutline: Array<[number, number]> = [
    [0, 0.01], [0.05, -0.02], [0.15, -0.025], [0.26, -0.01], [0.33, 0.04],
    [0.31, 0.09], [0.25, 0.12], [0.17, 0.14], [0.08, 0.13], [0.01, 0.08],
  ];
  const featherOutline: Array<[number, number]> = [[0, -0.014], [0.09, -0.016], [0.115, 0], [0.09, 0.016], [0, 0.014]];
  const anchors: Array<[number, number, number]> = [
    [0.09, 0.125, 80], [0.15, 0.135, 70], [0.21, 0.11, 60], [0.27, 0.1, 50], [0.31, 0.075, 40],
  ];
  for (const s of [1, -1]) {
    const A = s > 0 ? "L" : "R";
    const S = V(s * 0.085, 0.3, -0.01);
    const d = V(s * 0.85, -0.45, -0.12).normalize();
    const E = S.clone().addScaledVector(d, 0.17).add(V(0, 0.015, 0.02));
    const W = S.clone().addScaledVector(d, 0.35);
    const arm = b.chain("wing" + A, polyline([S, E, W]), {
      parent: "spine2", names: ["shoulder" + A, "elbow" + A, "wrist" + A], role: "wing",
    });
    b.sweep(arm, 0.014, { color: "#5a3d26", name: "arm" + A });
    const wing = b.extrude(wingOutline, {
      at: S, x: d, y: [0, 0, -1], thickness: 0.012, bevel: 0.004, smoothing: 1,
      color: stripes(mottle(BROWN, "#6b4a2e", { size: 0.04 }), "#3a2a1b", { size: 0.05, axis: d.toArray(), width: 0.3, wobble: 0.3 }),
      bone: "elbow" + A, name: "wing" + A,
    });
    anchors.forEach(([u, v, deg], k) => {
      const th = (deg * Math.PI) / 180;
      const f = wing.dir([Math.cos(th), Math.sin(th), 0]);
      const perp = wing.dir([-Math.sin(th), Math.cos(th), 0]);
      b.extrude(featherOutline, {
        at: wing.local([u, v, 0]), x: f, y: perp, thickness: 0.006, bevel: 0.002, smoothing: 1,
        color: k % 2 ? "#4a3322" : "#6d4c30", bone: "elbow" + A, name: `primary${A}${k + 1}`,
      });
    });
  }

  // ---------- legs and feet ----------
  for (const s of [1, -1]) {
    const A = s > 0 ? "L" : "R";
    const a: [number, number, number] = [s * 0.05, 0.03, 0.04];
    const leg = b.chain("leg" + A, polyline([[s * 0.045, 0.15, 0], [s * 0.05, 0.08, 0.02], a]), {
      parent: "root", names: ["hip" + A, "knee" + A, "ankle" + A], role: "leg",
    });
    b.sweep(leg, [0.03, 0.021], { color: paint((p, n) => mix(resolve(bellyP, p, n), "#e8d7ad", 0.3)), name: "leg" + A });
    const toes: Array<[string, number, number]> = [["in", -32, 0.04], ["mid", 0, 0.045], ["out", 32, 0.04], ["back", 180, 0.03]];
    for (const [nm, deg, len] of toes) {
      const r = (deg * Math.PI) / 180;
      const dx = Math.sin(r), dz = Math.cos(r);
      const tip = V(a[0] + dx * len + (s * (nm === "out" ? 1 : nm === "in" ? -1 : 0)) * 0.002, 0.009, a[2] + dz * len);
      const name = `toe${nm}${A}`;
      b.sprout(name, leg.tip!, tip, [0.01, 0.008], { color: "#cdb582", role: "digit", count: 1 });
      b.spike(tip, V(dx, -0.5, dz).normalize(), 0.016, 0.006, { color: "#2b2420", bone: name, name: "claw" + nm + A });
    }
  }

  return b.root;
}
```