```ts
import * as THREE from "three";
import { createBuilder, rng, mottle, paint, catmull, grain } from "agentic-3js-builder";

export const meta = {
  name: "Sleepy Koala",
  description: "A drowsy ash-grey koala sitting on a log, hugging a eucalyptus branch and munching a sprig of leaves.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "koala" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const rand = rng(11);

  const FUR = mottle("#a6a7a7", "#8e8f91", { size: 0.06, contrast: 0.8, seed: 3 });
  const CREAM = mottle("#f1e8d1", "#e0d5ba", { size: 0.05, seed: 5 });
  const LIGHT = "#bdbdba";
  const CLAW = "#2b2623";
  const BLACK = "#16161a";
  const BARK = "#7b5d48";

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0.27, -0.02], dir: [0, 1, 0] });
  b.chain("spine", [[0, 0.27, -0.02], [0, 0.38, 0], [0, 0.5, 0.03]], {
    parent: "root", names: ["hips", "spine", "chest"], role: "spine",
  });
  b.chain("neck", [[0, 0.5, 0.03], [0, 0.6, 0.06]], { parent: "chest", names: ["neck", "head"], role: "neck" });
  b.joint("jaw", { parent: "head", at: [0, 0.6, 0.1], dir: [0, 0, 1], role: "jaw" });
  b.joint("branch", { parent: "chest", at: [0, 0.4, 0.28], dir: [1, 0.2, 0] });

  const S = () => new THREE.SphereGeometry(1, 12, 8);
  const ball = (at: number[], sc: number[], color: any, bone: string, extra: any = {}) =>
    b.part(S(), color, { at, scale: sc, bone, ...extra });

  // ---------- log perch ----------
  b.sweep([[-0.55, 0.07, 0], [0.55, 0.07, 0]], 0.07, {
    color: grain("#8a6a50", "#6b4d3a", { size: 0.02, axis: "x" }), caps: "flat", bone: "root", sides: 10,
  });
  for (const sx of [-1, 1])
    b.part(new THREE.CylinderGeometry(0.066, 0.066, 0.012, 10), "#d2b48a", {
      at: [sx * 0.555, 0.07, 0], rotation: [0, 0, 90], bone: "root",
    });
  ball([-0.3, 0.12, -0.04], [0.04, 0.03, 0.04], "#6b4d3a", "root");

  // ---------- body ----------
  ball([0, 0.31, -0.02], [0.2, 0.2, 0.17], FUR, "hips");
  ball([0, 0.43, 0.0], [0.18, 0.18, 0.15], FUR, "spine");
  ball([0, 0.3, 0.1], [0.12, 0.12, 0.07], CREAM, "hips");
  ball([0, 0.43, 0.09], [0.11, 0.14, 0.07], CREAM, "spine");
  ball([0, 0.2, -0.17], [0.1, 0.07, 0.06], FUR, "hips"); // rump tuft

  // ---------- head ----------
  ball([0, 0.665, 0.07], [0.17, 0.14, 0.15], FUR, "head");
  ball([0, 0.64, 0.165], [0.075, 0.06, 0.075], LIGHT, "head");
  ball([0, 0.678, 0.225], [0.052, 0.06, 0.04], BLACK, "head", { flat: true });
  ball([0.012, 0.7, 0.256], [0.014, 0.012, 0.008], "#4b4b55", "head");
  b.part(new THREE.BoxGeometry(0.006, 0.03, 0.006), BLACK, { at: [0, 0.622, 0.236], bone: "head" });
  b.part(new THREE.BoxGeometry(0.07, 0.004, 0.006), BLACK, { at: [0.035, 0.603, 0.228], rotation: [0, 0, 10], bone: "head" });
  b.part(new THREE.BoxGeometry(0.07, 0.004, 0.006), BLACK, { at: [-0.035, 0.603, 0.228], rotation: [0, 0, -10], bone: "head" });
  b.part(new THREE.BoxGeometry(0.11, 0.04, 0.1), "#d8d4c6", { at: [0, 0.585, 0.17], bone: "jaw" });
  for (const sx of [-1, 1]) {
    ball([sx * 0.12, 0.63, 0.1], [0.05, 0.05, 0.05], LIGHT, "head"); // cheek fluff
    ball([sx * 0.095, 0.61, 0.13], [0.04, 0.04, 0.04], LIGHT, "head");
    // drowsy eyes
    const ex = sx * 0.07;
    b.part(new THREE.SphereGeometry(0.018, 8, 6), "#4a2f22", { at: [ex, 0.705, 0.192], bone: "head" });
    b.part(new THREE.SphereGeometry(0.0055, 5, 4), "#f4efe6", { at: [ex + sx * 0.005, 0.699, 0.208], bone: "head" });
    b.part(new THREE.SphereGeometry(0.022, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#8f9091", {
      at: [ex, 0.7, 0.19], scale: [1.05, 1.0, 1.05], bone: "head",
    });
    b.part(new THREE.BoxGeometry(0.046, 0.004, 0.01), "#2a211d", {
      at: [ex, 0.7, 0.205], rotation: [0, 0, sx * -8], bone: "head",
    });
    // ears
    const a = sx * 25;
    const eu = new THREE.Euler(0, (a * Math.PI) / 180, 0);
    const E = V(sx * 0.15, 0.77, 0.03);
    b.part(S(), FUR, { at: E, scale: [0.075, 0.08, 0.03], rotation: [0, a, 0], bone: "head" });
    b.part(S(), CREAM, {
      at: E.clone().add(V(0, -0.004, 0.017).applyEuler(eu)), scale: [0.052, 0.057, 0.02], rotation: [0, a, 0], bone: "head",
    });
    for (let i = 0; i < 12; i++) {
      const th = (i / 12) * Math.PI * 2;
      if (Math.sin(th) < -0.75) continue;
      const p = E.clone().add(V(Math.cos(th) * 0.074, Math.sin(th) * 0.08, 0.008).applyEuler(eu));
      b.part(new THREE.SphereGeometry(0.019, 6, 5), "#f4ecd8", { at: p, bone: "head" });
    }
    // head tufts
    ball([sx * 0.06, 0.8, 0.06], [0.04, 0.025, 0.04], FUR, "head");
  }

  // ---------- legs ----------
  for (const sx of [1, -1]) {
    const L = sx > 0 ? "L" : "R";
    const leg = b.chain(`leg${L}`, [[sx * 0.13, 0.28, -0.02], [sx * 0.21, 0.25, 0.15], [sx * 0.13, 0.17, 0.0]], {
      parent: "root", names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg",
    });
    b.sweep(leg, [0.07, 0.055, 0.04], { color: FUR });
    const A = V(sx * 0.13, 0.17, 0.0);
    ball([A.x, A.y - 0.01, A.z + 0.03], [0.045, 0.035, 0.055], "#8a8b8c", `ankle${L}`);
    for (const off of [-0.026, 0, 0.026]) {
      const p0 = A.clone().add(V(off, -0.02, 0.04));
      const p1 = A.clone().add(V(off, -0.045, 0.085));
      const p2 = A.clone().add(V(off, -0.085, 0.1));
      b.sweep([p0, p1, p2], 0.012, { color: "#8a8b8c", bone: `ankle${L}`, sides: 6 });
      b.part(new THREE.ConeGeometry(0.008, 0.028, 5), CLAW, {
        at: p2.clone().add(V(0, -0.012, 0.004)), dir: [0, -1, 0.3], bone: `ankle${L}`,
      });
    }
  }

  // ---------- branch ----------
  const bpts = [V(-0.34, 0.12, 0.3), V(-0.12, 0.345, 0.285), V(0.04, 0.51, 0.274), V(0.02, 0.6, 0.275)];
  const bpath = catmull(bpts);
  b.sweep(bpath, [0.032, 0.03, 0.026, 0.02], { color: BARK, bone: "branch", sides: 7 });
  b.part(new THREE.CylinderGeometry(0.03, 0.034, 0.012, 7), "#d2b48a", {
    at: bpts[0], dir: [0.5, 0.7, 0], bone: "branch",
  });

  // ---------- arms & hands ----------
  const ba = V(0.7, 0.71, -0.05).normalize();
  const e1 = V(-ba.y, ba.x, 0).normalize();
  const e2 = V(0, 0, 1);
  const R = 0.044;
  const around = (c: THREE.Vector3, deg: number, off = 0) => {
    const r = (deg * Math.PI) / 180;
    return c.clone().addScaledVector(ba, off).addScaledVector(e1, R * Math.cos(r)).addScaledVector(e2, R * Math.sin(r));
  };
  const cs: Record<number, THREE.Vector3> = { 1: V(0.041, 0.51, 0.274), [-1]: V(-0.12, 0.345, 0.285) };
  for (const sx of [1, -1]) {
    const L = sx > 0 ? "L" : "R";
    const c = cs[sx];
    const wrist = around(c, -65);
    const arm = b.chain(`arm${L}`, [[sx * 0.17, 0.47, 0.03], [sx * 0.24, 0.35, 0.16], wrist], {
      parent: "chest", names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "arm",
    });
    b.sweep(arm, [0.058, 0.046, 0.038], { color: FUR });
    ball([wrist.x, wrist.y, wrist.z], [0.042, 0.04, 0.04], "#8a8b8c", `wrist${L}`);
    for (const off of [-0.03, 0, 0.03]) {
      const pts = [-60, 0, 60, 120, 165].map((d) => around(c, d, off));
      b.sweep(pts, [0.013, 0.011, 0.009], { color: "#8a8b8c", bone: `wrist${L}`, sides: 6 });
      const tan = pts[4].clone().sub(pts[3]).normalize();
      b.part(new THREE.ConeGeometry(0.008, 0.03, 5), CLAW, {
        at: pts[4].clone().addScaledVector(tan, 0.012), dir: tan, bone: `wrist${L}`,
      });
    }
  }

  // ---------- leaves ----------
  const OUT: [number, number][] = [[0, 0], [0.02, 0.03], [0.028, 0.08], [0.018, 0.13], [0, 0.17], [-0.015, 0.12], [-0.022, 0.07], [-0.018, 0.03]];
  const greens = ["#6f9a8c", "#5f8d85", "#7aa597", "#86ad9b", "#557f7a"];
  const leaf = (p: THREE.Vector3, dir: THREE.Vector3, len: number, bone: string) => {
    const d = dir.clone().normalize();
    let side = V(0, 0, 1).cross(d);
    if (side.lengthSq() < 0.05) side = V(1, 0, 0).cross(d);
    side.normalize().applyAxisAngle(d, rand() * 2);
    const k = len / 0.17;
    b.extrude(OUT.map(([x, y]) => [x * k, y * k] as [number, number]), {
      color: greens[Math.floor(rand() * greens.length)], at: p, x: side, y: d,
      thickness: 0.004, smoothing: 1, bone,
    });
    b.part(new THREE.CylinderGeometry(0.0025, 0.003, 0.03 * k + 0.01, 4), "#6e5a3c", {
      at: p.clone().addScaledVector(d, -0.004), dir: d, bone,
    });
  };
  // along the hugged branch
  for (const t of [0.42, 0.55, 0.68, 0.8, 0.9]) {
    const p = bpath.at(t);
    const tg = bpath.tangentAt(t);
    const out = V(rand() - 0.5, 0.4 + rand() * 0.5, 0.6 + rand() * 0.5).normalize();
    leaf(p, out.multiplyScalar(0.7).addScaledVector(tg, 0.5), 0.12 + rand() * 0.05, "branch");
  }
  // the sprig by the mouth
  const tip = bpath.at(1);
  for (let i = 0; i < 9; i++) {
    const ang = (i / 9) * Math.PI * 2;
    const dir = V(Math.cos(ang) * 0.7, Math.sin(ang) * 0.5 + 0.3, 0.5 + rand() * 0.4);
    leaf(tip.clone().addScaledVector(dir.clone().normalize(), 0.01), dir, 0.11 + rand() * 0.05, "branch");
  }
  // a stub on the log with leaves
  const stubA = V(0.38, 0.12, -0.03);
  const stubB = V(0.47, 0.3, -0.1);
  b.sweep([stubA, stubB], [0.022, 0.014], { color: BARK, bone: "root", sides: 6 });
  for (let i = 0; i < 4; i++)
    leaf(stubB.clone(), V((i - 1.5) * 0.4, 1, 0.3 + (i % 2) * 0.4), 0.11 + rand() * 0.04, "root");

  return b.root;
}
```