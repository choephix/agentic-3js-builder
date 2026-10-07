import * as THREE from "three";
import { createBuilder, catmull, spiral, limb, countershade, rng } from "../../../../src/index";

export const meta = {
  name: "Clockwork Dog",
  description: "A tin wind-up toy dog with brass gears, a back key, a spring tail and floppy tin ears.",
};

const BLUE = "#3f78c4";
const BLUE2 = "#34649f";
const RED = "#c8372d";
const BRASS = "#c9964a";
const DARK = "#1f1f24";
const WHITE = "#f1ead8";
const STEEL = "#8d98a3";

function gearOutline(n: number, ro: number, ri: number): [number, number][] {
  const pts: [number, number][] = [];
  const step = (Math.PI * 2) / n;
  for (let i = 0; i < n; i++) {
    const a = i * step;
    for (const [f, r] of [[0, ri], [0.12, ro], [0.45, ro], [0.57, ri]] as [number, number][]) {
      pts.push([Math.cos(a + f * step) * r, Math.sin(a + f * step) * r]);
    }
  }
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "clockworkDog" });

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 0.32, -0.2] });
  const spine = b.chain(
    "spine",
    catmull([[0, 0.32, -0.2], [0, 0.33, 0.0], [0, 0.34, 0.2]]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] },
  );
  const neck = b.chain(
    "neck",
    catmull([[0, 0.34, 0.2], [0, 0.42, 0.28], [0, 0.48, 0.33]]),
    { parent: spine.tip!, role: "neck", names: ["neck1", "neck2", "neck3"] },
  );
  const head = b.joint("head", { parent: neck.tip!, at: [0, 0.48, 0.33], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head, at: [0, 0.44, 0.42], aim: [0, 0.44, 0.56], role: "jaw",
  });

  // ---- body
  const coat = countershade(BLUE, RED, { level: -0.35, soft: 0.2 });
  const body = b.loft(
    [
      { at: [0, 0.33, -0.3], w: 0.22, h: 0.2 },
      { at: [0, 0.33, -0.1], w: 0.26, h: 0.24 },
      { at: [0, 0.34, 0.15], w: 0.26, h: 0.24 },
      { at: [0, 0.35, 0.28], w: 0.2, h: 0.2 },
    ],
    { bone: [hips, spine], color: coat },
  );
  b.sweep(neck, [0.075, 0.06], { color: BLUE, sides: 8 });

  // rivets
  const skin = b.surface(body);
  for (const hit of skin.scatter(30, { rng: rng(5), minDist: 0.07, filter: (h) => h.n.y > -0.2 })) {
    b.stick(new THREE.SphereGeometry(0.01, 6, 4), BRASS, hit, { embed: 0.4 });
  }
  // belt band
  const belt = skin.loop([0, 0.33, 0.02], { dir: [0, 0, 1], lift: 0.004 });
  b.sweep(belt, 0.011, { color: BRASS, sides: 6 });

  // ---- side gears and key
  for (const s of [1, -1]) {
    b.extrude(gearOutline(10, 0.075, 0.06), {
      at: [s * 0.134, 0.34, -0.1], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, color: BRASS,
    });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8), STEEL, { at: [s * 0.14, 0.34, -0.1], dir: [s, 0, 0] });
  }
  b.rod([0, 0.44, -0.08], [0, 0.5, -0.08], 0.008, { color: STEEL, sides: 6 });
  b.extrude(
    [[-0.01, 0], [0.01, 0], [0.012, 0.03], [0.05, 0.045], [0.065, 0.07], [0.05, 0.095], [0.02, 0.085],
      [0, 0.06], [-0.02, 0.085], [-0.05, 0.095], [-0.065, 0.07], [-0.05, 0.045], [-0.012, 0.03]],
    { at: [0, 0.495, -0.08], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, color: BRASS, bone: spine.joints[1] },
  );

  // ---- legs
  const legs: { s: number; z: number; front: boolean }[] = [];
  for (const s of [1, -1]) {
    legs.push({ s, z: 0.18, front: true });
    legs.push({ s, z: -0.22, front: false });
  }
  for (const { s, z, front } of legs) {
    const tag = (s > 0 ? "L" : "R") + (front ? "F" : "H");
    const hipP: [number, number, number] = [s * 0.1, 0.3, z];
    const pts = limb(hipP, [s * 0.1, 0.035, z + 0.02], [0.145, 0.145], [[0, 0, front ? -1 : 1]]);
    const leg = b.chain("leg" + tag, pts, {
      parent: front ? spine.tip! : hips,
      role: "leg",
      names: ["hip" + tag, "knee" + tag, "paw" + tag],
      contact: [s * 0.1, 0, z + 0.04],
    });
    b.sweep(leg, [0.045, 0.032], { color: BLUE2, sides: 6 });
    b.part(new THREE.SphereGeometry(0.046, 8, 6), BRASS, { bone: leg.joints[1], at: pts[1] });
    b.part(new THREE.BoxGeometry(0.08, 0.04, 0.12), RED, { bone: leg.tip!, at: [s * 0.1, 0.02, z + 0.05] });
    b.part(new THREE.BoxGeometry(0.084, 0.012, 0.03), DARK, { bone: leg.tip!, at: [s * 0.1, 0.006, z + 0.1] });
  }

  // ---- head
  b.part(new THREE.BoxGeometry(0.17, 0.16, 0.17), BLUE, { bone: head, at: [0, 0.5, 0.37] });
  b.part(new THREE.BoxGeometry(0.11, 0.07, 0.15), BLUE, { bone: head, at: [0, 0.47, 0.5] });
  b.part(new THREE.BoxGeometry(0.1, 0.03, 0.14), RED, { bone: jaw, at: [0, 0.425, 0.49] });
  b.part(new THREE.BoxGeometry(0.07, 0.012, 0.1), "#e58a8a", { bone: jaw, at: [0, 0.445, 0.49] });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), DARK, { bone: head, at: [0, 0.5, 0.58] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.032, 8, 6), WHITE, { bone: head, at: [s * 0.062, 0.54, 0.445] });
    b.part(new THREE.SphereGeometry(0.017, 6, 4), DARK, { bone: head, at: [s * 0.062, 0.54, 0.472] });
    b.part(new THREE.BoxGeometry(0.05, 0.01, 0.015), DARK, { bone: head, at: [s * 0.062, 0.583, 0.44], rotation: [0, 0, -s * 12] });
    // ears
    const ear = b.joint(s > 0 ? "earL" : "earR", {
      parent: head, at: [s * 0.09, 0.575, 0.34], aim: [s * 0.15, 0.4, 0.33], role: "hinge",
    });
    b.extrude(
      [[-0.045, 0], [0.045, 0], [0.055, -0.09], [0, -0.17], [-0.055, -0.08]],
      { at: [s * 0.09, 0.575, 0.34], x: [0, 0, 1], y: [s * 0.45, 1, 0], thickness: 0.012, bevel: 0.003, color: RED, bone: ear },
    );
  }
  // collar and tag
  b.part(new THREE.TorusGeometry(0.083, 0.014, 6, 12), RED, {
    bone: neck.joints[1], at: [0, 0.43, 0.285], dir: [0, 0.6, 0.5], axis: "z",
  });
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.008, 10), BRASS, {
    bone: neck.joints[1], at: [0, 0.385, 0.35], dir: [0, 0.3, 1],
  });

  // ---- tail with spring
  const tail = b.chain(
    "tail",
    catmull([[0, 0.35, -0.3], [0, 0.42, -0.38], [0, 0.5, -0.42]]),
    { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"] },
  );
  const c0: [number, number, number] = [0, 0.36, -0.3];
  const coil = spiral(c0, [0.03, 0.36, -0.3], [0, 0.6, -0.8], { turns: 6, pitch: 0.025 });
  b.sweep(coil, 0.0075, { color: BRASS, bone: tail.joints[1], sides: 5 });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), RED, { bone: tail.tip!, at: coil.at(1) });

  return b.root;
}
