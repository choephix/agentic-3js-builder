```ts
import * as THREE from "three";
import { catmull, createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Elephant",
  description:
    "A stylised African elephant in a red-and-gold festival blanket: barrel body, pillar legs, curled trunk, fan ears and ivory tusks, on a rigged skeleton.",
};

// Flat colours
const SKIN = "#9097a0";
const LIMB = "#7a8089";
const PINK = "#e6a1a0";
const INK = "#17130f";
const WHITE = "#ffffff";
const IVORY = "#f4ecd6";
const RED = "#c3262f";
const GOLD = "#e9b43f";
const TUFT = "#4a3a2e";

// Model-space paths (metres, +Y up, faces +Z)
const TRUNK: number[][] = [
  [0, 2.75, 3.0],
  [0, 2.35, 3.36],
  [0, 1.85, 3.6],
  [0, 1.3, 3.68],
  [0, 0.82, 3.56],
  [0.02, 0.45, 3.36],
  [0.22, 0.3, 3.18],
  [0.36, 0.48, 3.02],
];
const TAIL: number[][] = [
  [0, 2.45, -2.0],
  [0, 2.05, -2.42],
  [0, 1.5, -2.62],
  [0, 1.0, -2.68],
  [0, 0.62, -2.7],
];
const TUSK: number[][] = [
  [0.28, 2.5, 2.9],
  [0.37, 2.26, 3.2],
  [0.52, 2.0, 3.42],
  [0.7, 1.92, 3.5],
];

// Rounded rectangle written into any Path (Shape or hole)
function rrect(p: THREE.Path, w: number, h: number, r: number): THREE.Path {
  const x = w / 2;
  const y = h / 2;
  p.moveTo(-x + r, -y);
  p.lineTo(x - r, -y);
  p.quadraticCurveTo(x, -y, x, -y + r);
  p.lineTo(x, y - r);
  p.quadraticCurveTo(x, y, x - r, y);
  p.lineTo(-x + r, y);
  p.quadraticCurveTo(-x, y, -x, y - r);
  p.lineTo(-x, -y + r);
  p.quadraticCurveTo(-x, -y, -x + r, -y);
  return p;
}

// Flat plate standing in the YZ plane (thickness along X), tilted about Z
function plate(shape: THREE.Shape, depth: number, bevel: number, tilt: number): THREE.BufferGeometry {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 14,
  });
  g.center();
  g.rotateY(Math.PI / 2);
  g.rotateZ(tilt);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "elephant" });
  type J = ReturnType<typeof b.joint>;

  const put = (geo: THREE.BufferGeometry, color: string, at: number[], bone?: J) =>
    b.part(geo, color, bone ? { at, bone } : { at });

  const blob = (at: number[], scale: [number, number, number], color: string, bone?: J) =>
    b.part(new THREE.SphereGeometry(1, 18, 12), color, bone ? { at, scale, bone } : { at, scale });

  const nail = (at: number[], bone: J) => {
    const g = new THREE.CylinderGeometry(0.065, 0.07, 0.05, 8);
    g.rotateX(Math.PI / 2); // axis along +Z, pointing out of the foot
    put(g, IVORY, at, bone);
  };

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 2.35, 0] });
  const chest = b.joint("chest", { at: [0, 2.45, 1.15], parent: hips });
  const neck = b.joint("neck", { at: [0, 2.9, 1.95], parent: chest });
  const head = b.joint("head", { at: [0, 2.92, 2.3], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 2.5, 2.2], parent: head });

  const shoulderL = b.joint("shoulderL", { at: [0.5, 2.5, 1.25], parent: chest });
  const elbowL = b.joint("elbowL", { at: [0.5, 1.45, 1.25], parent: shoulderL });
  const wristL = b.joint("wristL", { at: [0.5, 0.32, 1.25], parent: elbowL });
  const shoulderR = b.joint("shoulderR", { at: [-0.5, 2.5, 1.25], parent: chest });
  const elbowR = b.joint("elbowR", { at: [-0.5, 1.45, 1.25], parent: shoulderR });
  const wristR = b.joint("wristR", { at: [-0.5, 0.32, 1.25], parent: elbowR });

  const hipL = b.joint("hipL", { at: [0.5, 2.35, -1.2], parent: hips });
  const kneeL = b.joint("kneeL", { at: [0.5, 1.3, -1.2], parent: hipL });
  const ankleL = b.joint("ankleL", { at: [0.5, 0.32, -1.2], parent: kneeL });
  const hipR = b.joint("hipR", { at: [-0.5, 2.35, -1.2], parent: hips });
  const kneeR = b.joint("kneeR", { at: [-0.5, 1.3, -1.2], parent: hipR });
  const ankleR = b.joint("ankleR", { at: [-0.5, 0.32, -1.2], parent: kneeR });

  const trunk = b.chain("trunk", catmull(TRUNK), { parent: head, role: "tentacle" });
  const tail = b.chain("tail", catmull(TAIL), { parent: hips, role: "tail" });

  // ---------- body and head ----------
  blob([0, 2.35, 0], [0.9, 0.98, 1.45], SKIN, hips); // barrel
  blob([0, 2.4, -1.15], [0.92, 1.02, 0.95], SKIN, hips); // rump
  blob([0, 2.3, 1.15], [0.95, 1.0, 0.95], SKIN, chest); // chest
  blob([0, 2.85, 1.9], [0.72, 0.78, 0.7], SKIN, neck);
  blob([0, 2.92, 2.3], [0.72, 0.78, 0.75], SKIN, head); // skull
  blob([0, 3.4, 2.3], [0.5, 0.36, 0.46], SKIN, head); // brow dome
  blob([0, 2.46, 2.72], [0.42, 0.2, 0.45], SKIN, jaw); // lower jaw
  blob([0, 2.8, 2.95], [0.36, 0.36, 0.36], SKIN, head); // trunk root

  // Forehead tuft
  put(new THREE.ConeGeometry(0.06, 0.24, 6), TUFT, [0, 3.84, 2.3], head);

  // Forehead tilak: gold ring with red centre
  put(new THREE.TorusGeometry(0.17, 0.035, 8, 18), GOLD, [0, 3.36, 2.76], head);
  put(new THREE.CircleGeometry(0.13, 18), RED, [0, 3.36, 2.77], head);

  // Eyes with highlights
  for (const s of [1, -1]) {
    put(new THREE.SphereGeometry(0.055, 10, 8), INK, [s * 0.6, 3.12, 2.64], head);
    put(new THREE.SphereGeometry(0.016, 6, 6), WHITE, [s * 0.63, 3.15, 2.68], head);
  }

  // Ears: fan plates with pink inner faces
  for (const s of [1, -1]) {
    const outer = new THREE.Shape();
    outer.absellipse(0, 0, 0.6, 0.72, 0, Math.PI * 2, false, 0);
    put(plate(outer, 0.04, 0.03, s * 0.2), SKIN, [s * 0.78, 2.75, 2.05], head);

    const inner = new THREE.Shape();
    inner.absellipse(0, -0.03, 0.44, 0.58, 0, Math.PI * 2, false, 0);
    const innerGeo = plate(inner, 0.01, 0, s * 0.2);
    innerGeo.translate(-s * 0.056, 0, 0); // sit just proud of the inner face
    put(innerGeo, PINK, [s * 0.78, 2.75, 2.05], head);
  }

  // Tusks
  b.sweep(catmull(TUSK), 0.08, { color: IVORY });
  b.sweep(catmull(TUSK.map(([x, y, z]) => [-x, y, z])), 0.08, { color: IVORY });

  // Trunk
  b.sweep(trunk, 0.2, { color: SKIN });
  blob([0.36, 0.48, 3.02], [0.2, 0.2, 0.2], SKIN); // trunk tip

  // ---------- tail ----------
  b.sweep(tail, 0.075, { color: SKIN });
  blob([0, 0.52, -2.72], [0.13, 0.18, 0.13], TUFT); // tail tuft

  // ---------- legs and feet ----------
  const frontLeg = (s: 1 | -1, sh: J, el: J, wr: J) => {
    const x = s * 0.5;
    const z = 1.25;
    put(new THREE.CylinderGeometry(0.4, 0.34, 1.05, 14), LIMB, [x, 1.975, z], sh);
    put(new THREE.SphereGeometry(0.36, 12, 8), LIMB, [x, 1.45, z], el);
    put(new THREE.CylinderGeometry(0.34, 0.27, 1.13, 14), LIMB, [x, 0.885, z], el);
    put(new THREE.CylinderGeometry(0.37, 0.39, 0.32, 16), LIMB, [x, 0.16, z], wr);
    for (const o of [-0.22, -0.075, 0.075, 0.22]) {
      nail([x + o, 0.1, z + Math.sqrt(0.37 * 0.37 - o * o)], wr);
    }
  };

  const hindLeg = (s: 1 | -1, hp: J, kn: J, an: J) => {
    const x = s * 0.5;
    const z = -1.2;
    put(new THREE.CylinderGeometry(0.46, 0.36, 1.05, 14), LIMB, [x, 1.825, z], hp);
    put(new THREE.SphereGeometry(0.38, 12, 8), LIMB, [x, 1.3, z], kn);
    put(new THREE.CylinderGeometry(0.37, 0.27, 0.98, 14), LIMB, [x, 0.81, z], kn);
    put(new THREE.CylinderGeometry(0.36, 0.39, 0.32, 16), LIMB, [x, 0.16, z], an);
    for (const o of [-0.2, 0, 0.2]) {
      nail([x + o, 0.1, z + Math.sqrt(0.37 * 0.37 - o * o)], an);
    }
  };

  frontLeg(1, shoulderL, elbowL, wristL);
  frontLeg(-1, shoulderR, elbowR, wristR);
  hindLeg(1, hipL, kneeL, ankleL);
  hindLeg(-1, hipR, kneeR, ankleR);

  // ---------- festival blanket on the back ----------
  const cloth = new THREE.Shape();
  rrect(cloth, 1.9, 2.5, 0.42);
  const clothGeo = new THREE.ExtrudeGeometry(cloth, {
    depth: 0.12,
    bevelEnabled: false,
    curveSegments: 6,
  });
  clothGeo.center();
  clothGeo.rotateX(-Math.PI / 2); // thickness along Y, length along Z
  put(clothGeo, RED, [0, 3.36, 0], hips);

  // Gold border: outer rim overhangs the cloth, inner hole shows red
  const trimShape = new THREE.Shape();
  rrect(trimShape, 1.98, 2.58, 0.46);
  trimShape.holes.push(rrect(new THREE.Path(), 1.72, 2.32, 0.3) as THREE.Path);
  const trimGeo = new THREE.ExtrudeGeometry(trimShape, {
    depth: 0.03,
    bevelEnabled: false,
    curveSegments: 6,
  });
  trimGeo.center();
  trimGeo.rotateX(-Math.PI / 2);
  put(trimGeo, GOLD, [0, 3.44, 0], hips);

  // Gold medallion
  blob([0, 3.45, 0], [0.22, 0.06, 0.22], GOLD, hips);

  return b.root;
}
```