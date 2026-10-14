```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  grain,
  interpolate,
  mix,
  mottle,
  paint,
  rng,
  smoothstep,
  svg,
} from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";

export const meta = {
  name: "Sleepy koala",
  description:
    "A drowsy koala in soft ash-grey fur with a cream chest and cream-lined fluffy ears, hugging a eucalyptus branch while it munches a sprig of blue-green leaves.",
};

const CREAM = "#efe7d4";
const CREAM_SHADE = "#d9ccb1";
const ASH = "#8d9197";
const ASH_LIGHT = "#b8bbbf";
const PAW = "#5f646a";
const CLAW = "#24211f";
const NOSE = "#1c1a19";
const MOUTH = "#2a1e1a";
const IRIS = "#5a3a24";
const STEM = "#7d8a77";
const LEAF = ["#4f9b93", "#66ada3", "#3c867f"];

const fur = mottle(ASH, ASH_LIGHT, { size: 0.03, seed: 4, contrast: 0.9 });
const cream = mottle(CREAM, CREAM_SHADE, { size: 0.024, seed: 8 });
const bark = grain("#a7aea0", "#7c8677", { size: 0.018, axis: "y", seed: 3 });

// Body: soft ash fur, with cream down the front of the chest and belly.
const body = paint((p, n) => {
  const chest = smoothstep(0.3, 0.75, n.z) * smoothstep(0.14, 0.2, p.y) * smoothstep(0.5, 0.42, p.y);
  return mix(fur.at(p, n), cream.at(p, n), chest);
});

// Ears: cream on the face turned toward the viewer, fur on the back.
const earPaint = (face: THREE.Vector3) =>
  paint((p, n) => mix(fur.at(p, n), cream.at(p, n), smoothstep(0.2, 0.7, n.dot(face))));

export default function koala() {
  const b = createBuilder({ name: "koala", detail: 1, paintSize: 1024 });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const ball = (w: number, h: number) => new THREE.SphereGeometry(1, b.segments(w), b.segments(h));

  // One sickle-shaped eucalyptus leaf: a flat blade from `base` along `dir`, turned about it by `roll`.
  const leaf = (
    bone: Joint,
    base: THREE.Vector3,
    dir: THREE.Vector3,
    roll: number,
    len: number,
    wid: number,
    color: string,
  ) => {
    const d = dir.clone().normalize();
    const ref = Math.abs(d.y) > 0.9 ? V(1, 0, 0) : V(0, 1, 0);
    const a = new THREE.Vector3().crossVectors(d, ref).normalize();
    const c = new THREE.Vector3().crossVectors(d, a).normalize();
    const across = a.multiplyScalar(Math.cos(roll)).addScaledVector(c, Math.sin(roll));
    const steps = 6;
    const edgeA: THREE.Vector3[] = [];
    const edgeB: THREE.Vector3[] = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const half = wid * Math.sin(Math.PI * u ** 0.75);
      const mid = base.clone().addScaledVector(d, len * u).addScaledVector(across, 0.2 * len * u * u);
      edgeA.push(mid.clone().addScaledVector(across, half));
      edgeB.push(mid.addScaledVector(across, -half));
    }
    b.slab([...edgeA, ...edgeB.slice(1, steps).reverse()], { color, thickness: 0.0014, bone });
  };

  // ---- Skeleton -------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0] });

  // Spine: from the seat on the floor up to the neck. Joints: hips, belly, chest, neck (tip).
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.15, -0.02],
      [0, 0.28, 0],
      [0, 0.4, 0.02],
      [0, 0.5, 0.04],
    ]),
    { parent: root, names: ["hips", "belly", "chest", "neck"], role: "spine", up: [0, 0, 1] },
  );
  const [, , chestBone, neckBone] = spine.joints;

  // Head tipped a little forward, drowsy. The jaw hinges at the back of the mouth.
  const head = b.joint("head", { parent: neckBone, at: [0, 0.62, 0.07], dir: [0, 1, 0.2], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.54, 0.12], dir: [0, -0.3, 0.95], role: "jaw" });

  // The eucalyptus branch: a prop rigidly on its own bone.
  const branchJoint = b.joint("branch", { parent: root, at: [0.3, 0.04, 0.22], dir: [-0.3, 1, 0.1] });

  // ---- Body -----------------------------------------------------------------
  const TT = [0, 0.3, 0.62, 1];
  b.sweep(
    spine,
    (t: number): [number, number] => [
      interpolate(TT, [0.15, 0.185, 0.165, 0.11], t),
      interpolate(TT, [0.14, 0.165, 0.15, 0.105], t),
    ],
    { color: body, sides: 12, name: "torso" },
  );

  // ---- Legs: thighs out front, feet flat on the floor ------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const at = (x: number, y: number, z: number) => V(x * s, y, z);
    const leg = b.chain(`leg${side}`, catmull([at(0.12, 0.13, 0), at(0.15, 0.06, 0.2), at(0.12, 0.035, 0.34)]), {
      parent: root,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    const ankle = leg.joints[2];
    b.sweep(leg, (t: number): number => interpolate([0, 0.5, 1], [0.085, 0.06, 0.04], t), {
      color: fur,
      sides: 8,
      name: `leg${side}`,
    });
    b.part(ball(12, 8), PAW, {
      at: at(0.12, 0.034, 0.39),
      bone: ankle,
      scale: [0.05, 0.032, 0.07],
      name: `foot${side}`,
    });
    for (const dx of [-0.02, 0, 0.02])
      b.spike(at(0.12 + dx, 0.03, 0.452), V(0, -0.25, 1), 0.02, 0.0045, { color: CLAW, bone: ankle });
  }

  // ---- Arms -----------------------------------------------------------------
  // The left arm hugs the branch; the right arm lifts a sprig to the mouth.
  const armL = b.chain("armL", catmull([V(0.12, 0.43, 0.04), V(0.26, 0.33, 0.12), V(0.17, 0.42, 0.3)]), {
    parent: chestBone,
    names: ["shoulderL", "elbowL", "wristL"],
    role: "arm",
  });
  const armR = b.chain("armR", catmull([V(-0.12, 0.43, 0.04), V(-0.21, 0.37, 0.12), V(-0.1, 0.52, 0.25)]), {
    parent: chestBone,
    names: ["shoulderR", "elbowR", "wristR"],
    role: "arm",
  });
  const armRadius = (t: number): number => interpolate([0, 0.5, 1], [0.042, 0.036, 0.03], t);
  b.sweep(armL, armRadius, { color: fur, sides: 8, name: "armL" });
  b.sweep(armR, armRadius