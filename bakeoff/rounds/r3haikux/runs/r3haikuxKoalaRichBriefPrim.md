```ts
import * as THREE from "three";
import { createBuilder, catmull } from "agentic-3js-builder";

type V = [number, number, number];

// ash-grey koala
const FUR = "#9ca1a5";
const FUR_LIGHT = "#b2b7ba";
const FUR_DARK = "#7b8187";
const CREAM = "#efe4cc";
const NOSE = "#1d1a1b";
const NOSE_SHEEN = "#4b4548";
const IRIS = "#5b3b26";
const LASH = "#2f211a";
const MOUTH = "#3a2e29";
const CLAW = "#2a2622";
// eucalyptus
const LEAF_A = "#6f9d92";
const LEAF_B = "#5a8b80";
const LEAF_C = "#90bbae";
const STEM = "#7d8a74";
const BARK = "#8f8273";
const BARK_DARK = "#6b6056";

// the head droops forward: that's the sleepiness
const NOD = 0.2;
const PIVOT: V = [0, 0.44, 0];

const add = (p: V, q: V): V => [p[0] + q[0], p[1] + q[1], p[2] + q[2]];
const sub = (p: V, q: V): V => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
const scale = (p: V, s: number): V => [p[0] * s, p[1] * s, p[2] * s];
const len = (p: V) => Math.hypot(p[0], p[1], p[2]);
const unit = (p: V): V => scale(p, 1 / len(p));
const mid = (p: V, q: V): V => scale(add(p, q), 0.5);

// head-space point -> model space (tilt about the neck pivot)
function nod(p: V): V {
  const y = p[1] - PIVOT[1];
  const z = p[2] - PIVOT[2];
  const c = Math.cos(NOD);
  const s = Math.sin(NOD);
  return [p[0], PIVOT[1] + y * c - z * s, PIVOT[2] + y * s + z * c];
}

// a unit sphere stretched into an ellipsoid with radii r
function ellipsoid(r: V, seg = 12): THREE.SphereGeometry {
  const g = new THREE.SphereGeometry(1, seg, Math.max(6, Math.round(seg * 0.75)));
  g.scale(r[0], r[1], r[2]);
  return g;
}

export const meta = {
  name: "Sleepy koala",
  description:
    "A drowsy koala in ash-grey fur with a cream chest and lined ears, hugging a eucalyptus branch and mid-munch on a sprig of leaves.",
};

export default function build() {
  const b = createBuilder({ name: "sleepy-koala" });
  type J = ReturnType<typeof b.joint>;

  // every piece goes through b.part, riding the bone it moves with
  const put = (g: THREE.BufferGeometry, color: string, at: V, bone: J, dir?: V) => {
    if (dir) b.part(g, color, { at, bone, dir: unit(dir) });
    else b.part(g, color, { at, bone });
  };
  const blob = (r: V, color: string, at: V, bone: J, seg = 12) =>
    put(ellipsoid(r, seg), color, at, bone);
  // a piece on the head, tilted with it
  const headBlob = (r: V, color: string, p: V, bone: J, seg = 12) => {
    const g = ellipsoid(r, seg);
    g.rotateX(NOD);
    put(g, color, nod(p), bone);
  };
  const tube = (p: V, q: V, r: number, color: string, bone: J) => {
    const d = sub(q, p);
    const g = new THREE.CapsuleGeometry(r, Math.max(0.01, len(d) - 2 * r), 4, 10);
    put(g, color, mid(p, q), bone, d);
  };
  const claw = (at: V, dir: V, bone: J) =>
    put(new THREE.ConeGeometry(0.008, 0.04, 5), CLAW, at, bone, dir);
  const leaf = (base: V, dir: V, L: number, color: string, bone: J) => {
    const d = unit(dir);
    put(ellipsoid([0.008, L / 2, 0.0045], 6), color, add(base, scale(d, L / 2)), bone, d);
  };

  // ---- skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.2, 0] });
  const spine = b.joint("spine", { at: [0, 0.36, 0], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.4, 0], parent: spine });
  const head = b.joint("head", { at: PIVOT, parent: neck });
  const jaw = b.joint("jaw", { at: nod([0, 0.46, 0.12]), parent: head });
  const earL = b.joint("earL", { at: nod([0.115, 0.645, -0.01]), parent: head });
  const earR = b.joint("earR", { at: nod([-0.115, 0.645, -0.01]), parent: head });

  const shoulderL = b.joint("shoulderL", { at: [0.17, 0.44, 0.03], parent: spine });
  const elbowL = b.joint("elbowL", { at: [0.27, 0.3, 0.12], parent: shoulderL });
  const wristL = b.joint("wristL", { at: [0.13, 0.27, 0.27], parent: elbowL });
  const shoulderR = b.joint("shoulderR", { at: [-0.17, 0.44, 0.03], parent: spine });
  const elbowR = b.joint("elbowR", { at: [-0.26, 0.36, 0.11], parent: shoulderR });
  const wristR = b.joint("wristR", { at: [-0.1, 0.4, 0.28], parent: elbowR });

  const hipL = b.joint("hipL", { at: [0.14, 0.12, 0.03], parent: hips });
  const kneeL = b.joint("kneeL", { at: [0.14, 0.08, 0.22], parent: hipL });
  const ankleL = b.joint("ankleL", { at: [0.14, 0.04, 0.27], parent: kneeL });
  const hipR = b.joint("hipR", { at: [-0.14, 0.12, 0.03], parent: hips });
  const kneeR = b.joint("kneeR", { at: [-0.14, 0.08, 0.22], parent: hipR });
  const ankleR = b.joint("ankleR", { at: [-0.14, 0.04, 0.27], parent: kneeR });

  const tail = b.joint("tail", { at: [0, 0.14, -0.2], parent: hips });
  const branch = b.joint("branch", { at: [0, 0.25, 0.15], parent: hips });

  // ---- body: a chunky pear with a cream chest and soft fluff ---------------
  blob([0.19, 0.22, 0.18], FUR, [0, 0.36, 0], spine, 14);
  blob([0.21, 0.14, 0.2], FUR, [0, 0.14, -0.01], hips, 14);
  blob([0.13, 0.12, 0.065], CREAM, [0, 0.3, 0.165], spine);
  for (const side of [1, -1]) {
    blob([0.075, 0.07, 0.065], FUR, [side * 0.17, 0.5, -0.03], spine, 10);
    blob([0.07, 0.06, 0.07], FUR, [side * 0.2, 0.2, -0.05], hips, 10);
  }
  blob([0.04, 0.04, 0.04], FUR, [0, 0.13, -0.21], tail, 8);

  // ---- head: big, round, drooping ----------------------------------------
  headBlob([0.158, 0.15, 0.15], FUR_LIGHT, [0, 0.53, 0.06], head, 16);
  headBlob([0.06, 0.03, 0.035], CREAM, [0, 0.5, 0.2], head);        // muzzle
  headBlob([0.068, 0.05, 0.046], NOSE, [0, 0.555, 0.2], head, 14);  // big leathery nose
  headBlob([0.02, 0.011, 0.01], NOSE_SHEEN, [0.016, 0.572, 0.236], head, 8);
  headBlob([0.034, 0.007, 0.02], MOUTH, [0, 0.466, 0.205], head, 8);

  // lower jaw, dropped a little: mid-munch
  const chin = ellipsoid([0.05, 0.028, 0.04], 12);
  chin.rotateX(0.3);
  chin.rotateX(NOD);
  put(chin, FUR_LIGHT, nod([0, 0.446, 0.19]), jaw);

  // half-closed, drowsy eyes: brown eye under a heavy fur lid
  for (const side of [1, -1]) {
    const eye: V = [side * 0.072, 0.578, 0.172];
    headBlob([0.026, 0.026, 0.026], IRIS, eye, head, 12);
    const lid = new THREE.SphereGeometry(0.034, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    lid.rotateX(NOD);
    put(lid, FUR_LIGHT, nod(add(eye, [0, -0.004, 0])), head);
    headBlob([0.022, 0.004, 0.008], LASH, add(eye, [0, -0.006, 0.031]), head, 6);
  }

  // fluffy ears with a cream lining, turned a little forward
  for (const side of [1, -1]) {
    const ear = side === 1 ? earL : earR;
    const c: V = [side * 0.115, 0.645, -0.01];
    const turn = -side * 0.35;
    const outer = ellipsoid([0.028, 0.07, 0.07], 12);
    outer.rotateY(turn);
    outer.rotateX(NOD);
    put(outer, FUR_LIGHT, nod(c), ear);
    const lining = ellipsoid([0.012, 0.05, 0.05], 10);
    lining.rotateY(turn);
    lining.rotateX(NOD);
    put(lining, CREAM, nod(add(c, [side * 0.028, 0, 0.01])), ear);
  }

  // ---- arms: the left wraps the branch, the right holds a sprig -----------
  tube([0.17, 0.44, 0.03], [0.27, 0.3, 0.12], 0.055, FUR, shoulderL);
  tube([0.27, 0.3, 0.12], [0.13, 0.27, 0.27], 0.05, FUR, elbowL);
  blob([0.058, 0.048, 0.052], FUR_DARK, [0.13, 0.27, 0.27], wristL);
  for (const dx of [-0.03, 0, 0.03]) claw([0.13 + dx, 0.25, 0.34], [0, -0.15, 1], wristL);

  tube([-0.17, 0.44, 0.03], [-0.26, 0.36, 0.11], 0.055, FUR, shoulderR);
  tube([-0.26, 0.36, 0.11], [-0.1, 0.4, 0.28], 0.05, FUR, elbowR);
  blob([0.058, 0.048, 0.052], FUR_DARK, [-0.1, 0.4, 0.28], wristR);
  for (const dx of [-0.03, 0, 0.03]) claw([-0.1 + dx, 0.38, 0.35], [0, -0.1, 1], wristR);

  // ---- sprig of eucalyptus, held at the mouth ------------------------------
  const STEM_A: V = [-0.1, 0.41, 0.29];
  const TIP: V = [-0.01, 0.445, 0.25];
  put(
    new THREE.CylinderGeometry(0.007, 0.006, len(sub(TIP, STEM_A)), 5),
    STEM,
    mid(STEM_A, TIP),
    wristR,
    sub(TIP, STEM_A),
  );
  leaf(TIP, [0.5, 0.6, 0.6], 0.1, LEAF_A, wristR);
  leaf(TIP, [-0.6, 0.6, 0.3], 0.095, LEAF_B, wristR);
  leaf(TIP, [0.1, 0.4, 0.9], 0.085, LEAF_C, wristR);
  leaf(TIP, [0.7, 0.2, 0.5], 0.08, LEAF_B, wristR);
  leaf(mid(STEM_A, TIP), [-0.6, 0.4, 0.6], 0.08, LEAF_C, wristR);
  leaf(TIP, [-0.05, -0.3, 0.95], 0.07, LEAF_A, wristR); // one leaf dipping into the mouth

  // ---- legs: sitting, feet forward, claws out ------------------------------
  for (const side of [1, -1]) {
    const x = side * 0.14;
    const hip = side === 1 ? hipL : hipR;
    const knee = side === 1 ? kneeL : kneeR;
    const ankle = side === 1 ? ankleL : ankleR;
    blob([0.1, 0.085, 0.13], FUR_DARK, [x, 0.11, 0.1], hip);
    tube([x, 0.08, 0.22], [x, 0.04, 0.27], 0.05, FUR_DARK, knee);
    blob([0.075, 0.036, 0.11], FUR_DARK, [x, 0.034, 0.27], ankle);
    for (const dx of [-0.04, 0, 0.04]) {
      blob([0.02, 0.02, 0.02], FUR_DARK, [x + dx, 0.03, 0.36], ankle, 8);
      claw([x + dx, 0.028, 0.4], [0, -0.2, 1], ankle);
    }
  }

  // ---- the eucalyptus branch: one bending sweep, floor to a leafy tip ------
  const twig: V[] = [
    [0.48, 0.03, -0.02],
    [0.36, 0.09, 0.1],
    [0.16, 0.22, 0.23],
    [0.0, 0.33, 0.25],
    [-0.18, 0.45, 0.2],
    [-0.36, 0.6, 0.1],
    [-0.44, 0.66, 0.0],
  ];
  b.sweep(catmull(twig), 0.027, { color: BARK });
  blob([0.033, 0.03, 0.03], BARK_DARK, [0.26, 0.16, 0.165], branch, 8);
  blob([0.03, 0.028, 0.028], BARK_DARK, [-0.27, 0.53, 0.15], branch, 8);

  // leaves along the branch
  leaf([0.44, 0.05, -0.01], [0.7, 0.35, -0.4], 0.09, LEAF_A, branch);
  leaf([0.44, 0.05, 0.06], [0.45, 0.2, 0.8], 0.09, LEAF_B, branch);
  leaf([0.26, 0.16, 0.165], [0.2, 0.9, -0.2], 0.1, LEAF_C, branch);
  leaf([0.26, 0.16, 0.165], [-0.3, 0.8, 0.5], 0.09, LEAF_B, branch);
  leaf([0.0, 0.33, 0.25], [0.3, 0.7, 0.6], 0.09, LEAF_A, branch);
  leaf([-0.18, 0.45, 0.2], [-0.3, 0.5, 0.8], 0.1, LEAF_B, branch);
  leaf([-0.18, 0.45, 0.2], [0.2, 0.9, -0.1], 0.1, LEAF_A, branch);
  leaf([-0.27, 0.53, 0.15], [0.0, 0.95, -0.3], 0.09, LEAF_C, branch);

  // leafy tip cluster
  const tipBranch: V = [-0.44, 0.66, 0.0];
  leaf(tipBranch, [-0.7, 0.5, 0.2], 0.11, LEAF_A, branch);
  leaf(tipBranch, [-0.3, 0.9, -0.2], 0.1, LEAF_C, branch);
  leaf(tipBranch, [-0.6, 0.2, -0.6], 0.09, LEAF_B, branch);
  leaf(tipBranch, [-0.2, 0.5, 0.8], 0.1, LEAF_B, branch);
  leaf(tipBranch, [-0.5, 0.8, -0.3], 0.1, LEAF_C, branch);

  return b.root;
}
```