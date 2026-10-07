import * as THREE from "three";
import { createBuilder, aim, rng, paint, mottle, spots, bezier, catmull, polyline } from "../../../../src/index";

export const meta = {
  name: "Feisty Red Rock Crab",
  description: "Brick-red speckled rock crab raising one oversized claw in challenge, with a barnacle and seaweed on its shell.",
};

const RED = "#a8321f", DEEP = "#7a2217", ORANGE = "#e0742a", CREAM = "#f1dfbd";
const DARK = "#241616", GREEN = "#2f6b3a", GREEN2 = "#4b8a3f", BELLY = "#e9c9a0";

export default function build() {
  const b = createBuilder({ name: "rockCrab" });
  const body = b.joint("body", { at: [0, 0.085, 0], role: "spine" });

  const coat = spots(
    spots(mottle(RED, DEEP, { size: 0.05, seed: 2 }), ORANGE, { size: 0.03, amount: 0.35, seed: 4 }),
    CREAM,
    { size: 0.02, amount: 0.2, seed: 5 },
  );

  // shell
  const shell = b.part(new THREE.SphereGeometry(1, 14, 10), coat, {
    bone: body, at: [0, 0.088, 0], scale: [0.18, 0.07, 0.135], flat: true, name: "shell",
  });
  b.part(new THREE.SphereGeometry(1, 12, 6), BELLY, { bone: body, at: [0, 0.05, 0], scale: [0.15, 0.03, 0.11], name: "belly" });

  const skin = b.surface(shell);
  // knobs
  const knobRng = rng(3);
  skin.scatter(38, { rng: knobRng, minDist: 0.04, filter: (h) => h.n.y > 0.25 }).forEach((h, i) => {
    const r = 0.011 + knobRng() * 0.008;
    b.stick(new THREE.SphereGeometry(r, 6, 4), i % 3 === 0 ? CREAM : i % 3 === 1 ? ORANGE : DEEP, h, { embed: 0.4, bone: body });
  });
  // front edge teeth
  for (const az of [-65, -45, -25, -8, 8, 25, 45, 65]) {
    const h = skin.around(shell.at).at(az, 12);
    if (h) b.stick(new THREE.ConeGeometry(0.012, 0.03, 6), az % 2 ? CREAM : ORANGE, h, { embed: 0.3, bone: body });
  }

  // eyes on stalks
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const base: [number, number, number] = [s * 0.05, 0.12, 0.11];
    const tip: [number, number, number] = [s * 0.065, 0.175, 0.135];
    const st = b.joint(`eyeStalk${side}`, { parent: body, at: base, aim: tip, role: "hinge" });
    b.rod(base, tip, 0.007, { color: ORANGE, bone: st, sides: 6 });
    b.part(new THREE.SphereGeometry(0.02, 8, 6), DARK, { bone: st, at: [s * 0.068, 0.182, 0.14], name: "eye" });
    b.part(new THREE.SphereGeometry(0.006, 5, 4), CREAM, { bone: st, at: [s * 0.062, 0.19, 0.157], name: "glint" });
  }

  // mouth
  b.part(new THREE.BoxGeometry(0.07, 0.014, 0.03), DEEP, { bone: body, at: [0, 0.062, 0.12], name: "upperJaw" });
  const jaw = b.joint("jaw", { parent: body, at: [0, 0.052, 0.115], aim: [0, 0.05, 0.16], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.06, 0.012, 0.03), ORANGE, { bone: jaw, at: [0, 0.048, 0.13], name: "lowerJaw" });

  // walking legs
  const zs = [0.075, 0.025, -0.025, -0.07];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    zs.forEach((z, i) => {
      const n = i + 1;
      const pts = [
        [s * 0.12, 0.075, z * 0.9],
        [s * 0.215, 0.14, z * 1.5 + 0.01],
        [s * 0.29, 0.075, z * 2.0 + 0.015],
        [s * 0.325, 0.0, z * 2.3 + 0.02],
      ];
      const leg = b.chain(`leg${side}${n}`, polyline(pts), {
        parent: body, role: "leg",
        names: [`hip${side}${n}`, `knee${side}${n}`, `ankle${side}${n}`, `foot${side}${n}`],
      });
      b.sweep(leg, [0.017, 0.015, 0.011, 0.002], {
        color: coat, sides: 6, caps: { start: "round", end: "point" },
      });
      // knee knob
      b.part(new THREE.SphereGeometry(0.017, 6, 4), ORANGE, { bone: leg.joints[1], at: pts[1] });
    });
  }

  // claws
  function claw(s: number, F: number[], O: number[], wrist: number[], sh: number[], el: number[], sz: number, big: boolean) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(`arm${side}`, polyline([sh, el, wrist]), {
      parent: body, role: "arm", names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
    });
    b.sweep(arm, big ? [0.034, 0.03, 0.026] : [0.02, 0.016, 0.014], { color: coat, sides: 7 });
    b.part(new THREE.SphereGeometry(big ? 0.032 : 0.02, 6, 4), ORANGE, { bone: arm.joints[1], at: el });
    const Fv = new THREE.Vector3(...F).normalize();
    const Ov = new THREE.Vector3(...O).normalize();
    const H = new THREE.Vector3(...wrist).addScaledVector(Fv, sz * 0.5);
    const P = (f: number, o: number) => H.clone().addScaledVector(Fv, f * sz).addScaledVector(Ov, o * sz).toArray();
    const wb = arm.tip!;
    b.part(new THREE.SphereGeometry(1, 9, 7), coat, {
      bone: wb, at: H, quat: aim(Fv), scale: [sz * 0.62, sz * 0.8, sz * 0.5], name: `palm${side}`,
    });
    // fixed finger
    const fa = P(0.2, -0.38), fc = P(1.1, -0.5), ft = P(1.9, -0.06);
    const fpath = bezier(fa, fc, ft);
    b.sweep(fpath, [0.36 * sz, 0.04 * sz], {
      bone: wb, bands: [[0.7, coat], [1, DARK]], caps: { start: "round", end: "point" }, sides: 6,
    });
    // dactyl
    const da = P(0.25, 0.4), dc = P(1.1, 0.55), dt = P(1.9, 0.12);
    const dj = b.joint(`dactyl${side}`, { parent: wb, at: da, aim: dc, role: "jaw" });
    b.sweep(bezier(da, dc, dt), [0.32 * sz, 0.04 * sz], {
      bone: dj, bands: [[0.7, coat], [1, DARK]], caps: { start: "round", end: "point" }, sides: 6,
    });
    // teeth
    const dpath = bezier(da, dc, dt);
    for (const t of [0.3, 0.45, 0.6, 0.75]) {
      b.spike(fpath.at(t), Ov.toArray(), 0.28 * sz, 0.1 * sz, { color: CREAM, bone: wb, sides: 5 });
      b.spike(dpath.at(t + 0.07), Ov.clone().negate().toArray(), 0.28 * sz, 0.1 * sz, { color: CREAM, bone: dj, sides: 5 });
    }
    // palm knobs
    for (const k of [[0, 0.55, 0.3], [0.3, 0.7, -0.2], [-0.35, 0.5, -0.3]]) {
      b.part(new THREE.SphereGeometry(sz * 0.14, 6, 4), CREAM, {
        bone: wb, at: H.clone().addScaledVector(Fv, k[0] * sz).addScaledVector(Ov, k[2] * sz).add(new THREE.Vector3(0, 0, 0)).addScaledVector(new THREE.Vector3(0, 0, 1), k[1] * sz * 0.4),
      });
    }
  }
  // big raised claw (left)
  claw(1, [0.05, 0.85, 0.5], [1, 0, 0], [0.26, 0.2, 0.25], [0.15, 0.09, 0.1], [0.25, 0.12, 0.17], 0.07, true);
  // small lowered claw (right)
  claw(-1, [-0.2, 0.25, 1], [1, 0, 0], [-0.1, 0.1, 0.3], [-0.14, 0.08, 0.1], [-0.2, 0.11, 0.2], 0.03, false);

  // barnacles + seaweed on back
  const bh = skin.ray([-0.06, 0.3, -0.05], [0, -1, 0]);
  if (bh) {
    b.stick(new THREE.CylinderGeometry(0.01, 0.018, 0.022, 7), CREAM, bh, { embed: 0.3, bone: body });
    b.stick(new THREE.CylinderGeometry(0.004, 0.009, 0.006, 7), DARK, bh.moved([0, 0.018, 0]), { embed: 0, bone: body });
  }
  const bh2 = skin.ray([-0.09, 0.3, -0.02], [0, -1, 0]);
  if (bh2) b.stick(new THREE.CylinderGeometry(0.006, 0.011, 0.014, 6), BELLY, bh2, { embed: 0.3, bone: body });

  const sw = skin.ray([0.05, 0.3, -0.07], [0, -1, 0]);
  if (sw) {
    const o = sw.at;
    const A = (x: number, y: number, z: number) => [o.x + x, o.y + y, o.z + z];
    const strands = [
      [A(0, -0.005, 0), A(0.01, 0.06, -0.02), A(0.05, 0.09, -0.06), A(0.09, 0.05, -0.1), A(0.1, 0.0, -0.1)],
      [A(0.005, -0.005, 0), A(-0.02, 0.05, 0.0), A(-0.05, 0.08, -0.04), A(-0.08, 0.05, -0.08)],
      [A(0, -0.005, 0.005), A(0.03, 0.04, 0.03), A(0.07, 0.06, 0.02), A(0.1, 0.03, 0.0)],
    ];
    strands.forEach((p, i) =>
      b.sweep(catmull(p), (t) => [0.011 * (1 - t * 0.6), 0.003], {
        color: i === 1 ? GREEN2 : GREEN, section: "box", bone: body, caps: { start: "flat", end: "point" },
      }),
    );
  }

  return b.root;
}
