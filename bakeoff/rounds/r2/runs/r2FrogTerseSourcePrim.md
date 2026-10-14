```ts
import * as THREE from "three";
import { createBuilder, countershade, spots } from "agentic-3js-builder";

export const meta = {
  name: "Frog",
  description:
    "A green tree-pond frog in a rest pose: spotted back, cream belly, bulging gold eyes, separate jaws, four-fingered hands, webbed five-toed hind feet, all rigged.",
};

export default function build() {
  const b = createBuilder({ name: "frog" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const sph = (r: number, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);

  const GREEN = "#5d9c3a";
  const DARK = "#2f5c26";
  const CREAM = "#eee6b4";
  const skin = countershade(
    spots(GREEN, [DARK, "#4a8a32", "#7ab24a"], { size: 0.018, amount: 0.38, seed: 3 }),
    CREAM,
    { level: -0.15, soft: 0.3 },
  );

  // ---- skeleton: spine and head
  b.joint("hips", { at: [0, 0.04, -0.05], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", [[0, 0.04, -0.05], [0, 0.044, 0.0], [0, 0.05, 0.045]], {
    parent: "hips",
    role: "spine",
    names: ["spine1", "spine2", "spine3"],
  });
  b.joint("head", { parent: "spine3", at: [0, 0.05, 0.045], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.046, 0.05], dir: [0, 0, 1], role: "jaw" });

  // ---- body
  b.part(sph(1, 14, 10), skin, { at: [0, 0.036, -0.01], scale: [0.036, 0.03, 0.06], bone: "spine2" });
  b.part(sph(1, 12, 9), skin, { at: [0, 0.047, -0.045], scale: [0.038, 0.031, 0.03], bone: "hips" });
  b.part(sph(1, 12, 9), skin, { at: [0, 0.04, 0.03], scale: [0.032, 0.027, 0.03], bone: "spine3" });

  // ---- head
  b.part(sph(1, 14, 10), skin, { at: [0, 0.056, 0.068], scale: [0.036, 0.02, 0.04], bone: "head" });
  b.part(sph(1, 12, 8), skin, { at: [0, 0.042, 0.072], scale: [0.031, 0.0085, 0.036], bone: "jaw" });
  b.part(sph(1, 10, 8), CREAM, { at: [0, 0.036, 0.062], scale: [0.02, 0.012, 0.024], bone: "jaw" });
  b.part(sph(1, 8, 4), "#26361a", { at: [0, 0.0475, 0.072], scale: [0.031, 0.0013, 0.036], bone: "head" });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eyeC = V(s * 0.021, 0.077, 0.064);
    const eye = b.joint(`eye${side}`, { parent: "head", at: eyeC, dir: [0, 0, 1] });
    b.part(sph(0.0145, 10, 8), "#e3b61f", { at: eyeC, bone: eye });
    b.part(sph(1, 8, 6), "#0c0c08", {
      at: eyeC.clone().add(V(s * 0.0045, 0.002, 0.0118)),
      scale: [0.0072, 0.0028, 0.0026],
      bone: eye,
    });
    // brow ridge
    b.part(sph(1, 8, 5), GREEN, {
      at: eyeC.clone().add(V(0, 0.009, -0.004)),
      scale: [0.0155, 0.006, 0.0155],
      bone: eye,
    });
    // nostril and ear drum
    b.part(sph(0.0026, 5, 4), "#24301a", { at: [s * 0.008, 0.0625, 0.1], bone: "head" });
    b.part(sph(1, 8, 6), "#8cc255", { at: [s * 0.0335, 0.057, 0.046], scale: [0.0035, 0.009, 0.009], bone: "head" });
  }

  // ---- digits
  const digit = (name: string, parent: any, base: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, tipY: number) => {
    const d = dir.clone().normalize();
    const tip = base.clone().addScaledVector(d, len);
    tip.y = tipY;
    const mid = base.clone().lerp(tip, 0.55);
    const ch = b.chain(name, [base, mid, tip], {
      parent,
      role: "digit",
      names: [name + "1", name + "2", name + "3"],
    });
    b.sweep(ch, { radius: [r, r * 0.85, r * 0.7], color: GREEN, sides: 6 });
    b.part(sph(r * 1.3, 6, 5), "#b9d56c", { at: tip, bone: ch.joints[2] });
    return tip;
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const P = (x: number, y: number, z: number) => V(s * x, y, z);

    // hind leg
    const leg = b.chain(
      `leg${side}`,
      [P(0.042, 0.036, -0.05), P(0.095, 0.03, -0.02), P(0.105, 0.013, -0.092), P(0.125, 0.0065, -0.058)],
      { parent: "hips", role: "leg", names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`] },
    );
    b.sweep(leg, { radius: [0.018, 0.016, 0.0125, 0.0095, 0.008, 0.0065], color: skin });
    b.part(sph(1, 10, 8), skin, {
      at: P(0.06, 0.04, -0.04),
      scale: [0.022, 0.02, 0.032],
      bone: leg.joints[0],
    });
    const foot = leg.tip!;
    const fb = P(0.125, 0.0065, -0.058);
    const dirs = [-0.25, 0.05, 0.4, 0.75, 1.1];
    const lens = [0.022, 0.034, 0.042, 0.036, 0.026];
    const tips = dirs.map((dx, i) =>
      digit(`toe${i + 1}${side}`, foot, fb, V(s * dx, 0, 1), lens[i], 0.0036, 0.0042),
    );
    b.slab([fb.clone().setY(0.0035), ...tips.map((t) => t.clone().setY(0.0035))], {
      color: "#a3c76c",
      thickness: 0.0012,
      bone: foot,
      name: `web${side}`,
    });

    // arm
    const arm = b.chain(
      `arm${side}`,
      [P(0.036, 0.034, 0.03), P(0.054, 0.02, 0.014), P(0.052, 0.0075, 0.05)],
      { parent: "spine3", role: "arm", names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`] },
    );
    b.sweep(arm, { radius: [0.013, 0.0105, 0.0085, 0.0072], color: skin });
    const wb = P(0.052, 0.0075, 0.05);
    [-0.35, -0.1, 0.15, 0.4].forEach((dx, i) => {
      digit(`finger${i + 1}${side}`, arm.tip!, wb, V(s * dx, 0, 1), [0.016, 0.021, 0.021, 0.016][i], 0.0028, 0.0036);
    });
  }

  return b.root;
}
```