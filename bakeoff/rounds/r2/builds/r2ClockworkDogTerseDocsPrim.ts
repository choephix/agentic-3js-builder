import * as THREE from "three";
import { createBuilder, limb, spiral, mottle, countershade } from "../../../../src/index";

export const meta = {
  name: "Clockwork Dog",
  description:
    "A wind-up tin dog with a verdigris body, brass limbs, flank gears, a back key, a spring tail, floppy ears and a hinged jaw.",
};

const TEAL = "#4f8f8a";
const TEAL_D = "#3a6e6b";
const CREAM = "#eadfc2";
const BRASS = "#c8913a";
const COPPER = "#b4602f";
const STEEL = "#8f9aa3";
const DARK = "#2a2320";
const RED = "#b02a2a";
const GOLD = "#e6c15a";

function gearOutline(n: number, r0: number, r1: number): [number, number][] {
  const pts: [number, number][] = [];
  const da = (Math.PI * 2) / n;
  for (let i = 0; i < n; i++) {
    const a = i * da;
    for (const [f, r] of [[0, r0], [0.15, r1], [0.45, r1], [0.6, r0]] as [number, number][]) {
      pts.push([Math.cos(a + f * da) * r, Math.sin(a + f * da) * r]);
    }
  }
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "clockworkDog" });
  const coat = countershade(mottle(TEAL, TEAL_D, { size: 0.08, seed: 3 }), CREAM, { level: -0.45 });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.34, -0.2] });
  const spine = b.chain(
    "spine",
    [[0, 0.34, -0.2], [0, 0.35, 0.0], [0, 0.36, 0.2]],
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const [spine1, spine2, spine3] = spine.joints;
  const neck = b.chain(
    "neck",
    [[0, 0.36, 0.2], [0, 0.44, 0.26], [0, 0.5, 0.3]],
    { parent: spine3, names: ["neck1", "neck2", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 0.5, 0.3], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.15, down: 0.07 }),
    aim: head.local({ forward: 0.3, down: 0.07 }),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    [[0, 0.4, -0.2], [0, 0.42, -0.32], [0, 0.44, -0.44]],
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  const key = b.joint("key", { parent: spine2, at: [0, 0.49, 0.0], dir: [0, 1, 0], role: "hinge" });

  // ---------- body ----------
  const rBody = (t: number) => 0.11 + 0.025 * Math.sin(Math.PI * t);
  b.sweep(spine, rBody, { color: coat, sides: 8 });
  for (const t of [0.25, 0.75]) {
    const f = spine.at(t);
    b.part(new THREE.TorusGeometry(rBody(t) + 0.004, 0.009, 4, 12), BRASS, {
      bone: spine2, at: f.at, dir: f.tangent, axis: "z",
    });
    b.ring(f, { count: 12, radius: rBody(t) + 0.008 }, (it) =>
      b.part(new THREE.SphereGeometry(0.011, 5, 4), STEEL, { at: it, bone: spine2 }),
    );
  }

  // back plate, key
  b.part(new THREE.CylinderGeometry(0.04, 0.045, 0.014, 10), BRASS, { bone: spine2, at: [0, 0.488, 0.0] });
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.06, 6), STEEL, { bone: key, at: [0, 0.52, 0.0] });
  b.extrude(
    [[-0.03, 0], [-0.07, 0.02], [-0.085, 0.06], [-0.05, 0.1], [-0.02, 0.075], [-0.012, 0.04],
     [0.012, 0.04], [0.02, 0.075], [0.05, 0.1], [0.085, 0.06], [0.07, 0.02], [0.03, 0]],
    { at: [0, 0.54, 0.0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014, bevel: 0.003, smoothing: 1, color: GOLD, bone: key },
  );

  // flank gears
  for (const s of [1, -1]) {
    b.extrude(gearOutline(10, 0.05, 0.062), {
      at: [s * 0.143, 0.37, -0.03], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.02, color: BRASS, bone: spine2,
    });
    b.extrude(gearOutline(7, 0.028, 0.038), {
      at: [s * 0.143, 0.36, 0.065], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.02, color: COPPER, bone: spine2,
    });
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.03, 6), STEEL, { bone: spine2, at: [s * 0.152, 0.37, -0.03], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.03, 6), STEEL, { bone: spine2, at: [s * 0.152, 0.36, 0.065], dir: [1, 0, 0] });
  }

  // ---------- neck, collar ----------
  b.sweep(neck, [0.065, 0.07], { color: BRASS, sides: 8 });
  const n2 = neck.joints[1];
  b.part(new THREE.TorusGeometry(0.083, 0.014, 5, 12), RED, { bone: n2, at: n2.at, dir: n2.axis, axis: "z" });
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.008, 10), GOLD, {
    bone: n2, at: n2.local({ forward: 0.07, down: 0.07 }), dir: [0, 0.3, 1],
  });

  // ---------- head ----------
  b.part(new THREE.BoxGeometry(0.18, 0.15, 0.18), coat, { bone: head, at: head.local({ forward: 0.08, up: 0.02 }) });
  b.part(new THREE.BoxGeometry(0.1, 0.08, 0.13), coat, { bone: head, at: head.local({ forward: 0.215, down: 0.03 }) });
  b.part(new THREE.BoxGeometry(0.105, 0.012, 0.135), BRASS, { bone: head, at: head.local({ forward: 0.215, up: 0.012 }) });
  b.part(new THREE.SphereGeometry(0.03, 6, 5), DARK, { bone: head, at: head.local({ forward: 0.28, up: 0.0 }), flat: true });
  b.part(new THREE.BoxGeometry(0.085, 0.03, 0.15), coat, { bone: jaw, at: jaw.local({ forward: 0.07 }) });
  b.part(new THREE.BoxGeometry(0.04, 0.01, 0.09), RED, { bone: jaw, at: jaw.local({ forward: 0.06, up: 0.017 }) });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.01, 0.032, 4), CREAM, {
      bone: head, at: head.local({ left: s * 0.035, down: 0.085, forward: 0.26 }), dir: [0, -1, 0],
    });
    // eyes
    const eyeAt = head.local({ left: s * 0.058, up: 0.055, forward: 0.15 });
    b.part(new THREE.TorusGeometry(0.037, 0.008, 4, 10), COPPER, { bone: head, at: eyeAt.clone().add(new THREE.Vector3(0, 0, 0.012)), dir: [0, 0, 1], axis: "z" });
    b.part(new THREE.SphereGeometry(0.036, 8, 6), CREAM, { bone: head, at: eyeAt, flat: true });
    b.part(new THREE.SphereGeometry(0.018, 6, 4), DARK, {
      bone: head, at: head.local({ left: s * 0.054, up: 0.055, forward: 0.18 }), flat: true,
    });
    // ears
    const ear = b.joint(s > 0 ? "earL" : "earR", {
      parent: head, at: head.local({ left: s * 0.08, up: 0.085, forward: 0.03 }), role: "hinge",
    });
    b.extrude([[0, 0], [0.07, -0.02], [0.085, -0.1], [0.025, -0.16], [-0.035, -0.11], [-0.035, -0.02]], {
      at: ear.at, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: coat, bone: ear,
    });
    b.pose(ear, { axis: [0, 0, 1], deg: s * 22 });
  }

  // ---------- legs ----------
  const legs: [string, number, number, number, THREE.Object3D | any, number][] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const hipP: [number, number, number] = [s * 0.1, 0.3, front ? 0.17 : -0.17];
      const foot: [number, number, number] = [s * 0.1, 0.02, front ? 0.2 : -0.2];
      const pts = limb(hipP, foot, front ? [0.15, 0.15] : [0.16, 0.16], front ? [0, 0, -1] : [0, 0, 1]);
      const nm = front ? ["shoulder" + S, "elbow" + S, "paw" + S] : ["hip" + S, "knee" + S, "foot" + S];
      const leg = b.chain(front ? "legF" + S : "legH" + S, pts, {
        parent: front ? spine3 : hips, names: nm, role: "leg",
      });
      b.sweep(leg, [0.032, 0.02], { color: BRASS, sides: 6 });
      b.part(new THREE.SphereGeometry(front ? 0.06 : 0.075, 7, 5), coat, { bone: front ? spine3 : hips, at: hipP, flat: true });
      const j = leg.joints[1];
      b.part(new THREE.SphereGeometry(0.034, 6, 5), STEEL, { bone: j, at: j.at, flat: true });
      const tip = leg.tip!;
      b.part(new THREE.TorusGeometry(0.026, 0.009, 4, 8), STEEL, { bone: leg.joints[1], at: tip.at, dir: tip.axis, axis: "z" });
      b.part(new THREE.BoxGeometry(0.075, 0.04, 0.11), COPPER, { bone: tip, at: [s * 0.1, 0.02, foot[2] + 0.02] });
      b.part(new THREE.BoxGeometry(0.079, 0.012, 0.115), DARK, { bone: tip, at: [s * 0.1, 0.006, foot[2] + 0.02] });
    }
  }

  // ---------- spring tail ----------
  const coil = spiral([0, 0.42, -0.3], [0, 0.46, -0.3], [0, 0, -1], { turns: 5, r1: 0.04, pitch: 0.05 });
  b.rod([0, 0.38, -0.22], [0, 0.46, -0.3], 0.013, { color: STEEL, bone: tail.joints[0] });
  b.sweep(coil, 0.008, { color: STEEL, bone: tail.joints[1], sides: 5, caps: "round" });
  b.part(new THREE.SphereGeometry(0.025, 6, 5), RED, { bone: tail.joints[2], at: coil.at(1), flat: true });

  return b.root;
}
