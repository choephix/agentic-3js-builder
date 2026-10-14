import * as THREE from "three";
import {
  createBuilder,
  limb,
  catmull,
  bezier,
  mottle,
  scales,
  countershade,
  paint,
} from "../../../../src/index";

export const meta = {
  name: "African elephant calf",
  description:
    "A gentle, dusty slate-grey African elephant calf with huge pink-lined ears, a curling trunk, stubby tusks, long lashes and a tufted tail.",
};

const SLATE = ["#6d6a6c", "#77696a", "#66636a"];
const DUST = "#9a6d58";
const EDGE = "#4a4649";
const BELLY = "#8d8387";
const PINK = "#e7a2a0";
const MOUTH = "#a85f5c";
const IVORY = "#f2ebd8";
const NAIL = "#ece5d2";
const EYE = "#4a2a16";
const LASH = "#2a2224";
const TUFT = "#4d362a";
const WHITE = "#ffffff";

export default function build() {
  const b = createBuilder({ name: "elephant-calf" });

  // Wrinkled slate skin, dusted with reddish earth, lighter underneath.
  const coat = countershade(
    mottle(scales(SLATE, EDGE, { size: 0.12, width: 0.2, seed: 2 }), DUST, {
      size: 0.35,
      contrast: 0.5,
      seed: 7,
    }),
    BELLY,
    { level: -0.3 },
  );

  // Body skeleton: hips at the rear, spine forward to the shoulders.
  const hips = b.joint("hips", { at: [0, 0.9, -0.4], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.9, -0.4],
      [0, 0.92, -0.14],
      [0, 0.94, 0.14],
      [0, 0.96, 0.36],
    ]),
    { parent: hips, names: ["back1", "back2", "back3"], role: "spine" },
  );
  b.sweep(spine, (t) => {
    const k = Math.sin(Math.PI * t);
    return [0.17 + 0.06 * k, 0.19 + 0.05 * k];
  }, { color: coat });

  // Neck rising into the head; its tip joint is the head.
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.98, 0.34],
      [0, 1.07, 0.5],
      [0, 1.12, 0.6],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2", "head"], role: "neck" },
  );
  const head = neck.tip!;
  b.sweep(neck, (t) => 0.15 - 0.02 * t, { color: coat });

  // Big rounded head, slightly longer than tall.
  b.part(new THREE.SphereGeometry(0.19, 14, 10), coat, {
    bone: head,
    at: [0, 1.12, 0.6],
    scale: [1, 1.05, 1.12],
  });

  // Lower jaw and a small pink mouth.
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.0, 0.7] });
  b.part(new THREE.BoxGeometry(0.15, 0.05, 0.16), coat, { bone: jaw, at: [0, 0.99, 0.74] });
  b.part(new THREE.BoxGeometry(0.08, 0.012, 0.03), MOUTH, { bone: jaw, at: [0, 1.01, 0.8] });

  // Stubby baby tusks curving down and forward.
  for (const s of [1, -1]) {
    b.sweep(
      bezier(
        [s * 0.07, 1.0, 0.8],
        [s * 0.09, 0.96, 0.9],
        [s * 0.1, 0.9, 0.93],
      ),
      [0.022, 0.004],
      { bone: head, color: IVORY, caps: { start: "flat", end: "point" } },
    );
  }

  // Kind brown eyes with a highlight and a fringe of lashes.
  for (const s of [1, -1]) {
    const eye = b.part(new THREE.SphereGeometry(0.03, 8, 6), EYE, {
      bone: head,
      at: [s * 0.15, 1.16, 0.76],
      dir: [s * 0.3, 0, 1],
    });
    b.part(new THREE.SphereGeometry(0.009, 6, 4), WHITE, {
      bone: head,
      at: [s * 0.155, 1.17, 0.785],
    });
    b.ring(eye, { count: 8, radius: 0.03, fromDeg: -80, toDeg: 80, tilt: 30 }, (lash) => {
      b.spike(lash, lash, 0.035, 0.0045, { color: LASH });
    });
  }

  // Huge fan-shaped ears, flaring outward, pink on the inner face.
  const fan: [number, number][] = [
    [-0.04, 0.16],
    [0.08, 0.27],
    [0.22, 0.31],
    [0.34, 0.24],
    [0.36, 0.06],
    [0.3, -0.1],
    [0.18, -0.24],
    [0.04, -0.22],
    [-0.03, -0.08],
  ];
  for (const s of [1, -1]) {
    const earSkin = paint((_p, n) => (n.x * s < -0.5 ? PINK : coat));
    b.extrude(fan, {
      at: [s * 0.18, 1.22, 0.56],
      x: [0, 0, -1],
      y: [s * 0.35, 1, 0],
      thickness: [0.022, 0.008],
      bevel: 0.004,
      smoothing: 1,
      color: earSkin,
      bone: head,
    });
  }

  // Curious trunk hanging down and curling up at the tip.
  const trunkPath = catmull([
    [0, 1.0, 0.78],
    [0, 0.9, 0.92],
    [0, 0.74, 1.0],
    [0, 0.55, 1.0],
    [0, 0.5, 1.06],
    [0, 0.56, 1.12],
  ]);
  const trunk = b.chain("trunk", trunkPath, { parent: head });
  b.sweep(trunk, (t) => 0.07 - 0.03 * t, { color: coat });
  b.part(new THREE.SphereGeometry(0.03, 6, 5), coat, {
    bone: trunk.joints[trunk.joints.length - 1],
    at: trunkPath.at(1),
  });

  // Little tufted tail.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.94, -0.5],
      [0, 0.9, -0.62],
      [0, 0.8, -0.67],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  const tailTip = tail.tip!;
  b.sweep(tail, (t) => 0.028 - 0.014 * t, { color: coat });
  b.part(new THREE.SphereGeometry(0.035, 6, 5), TUFT, { bone: tailTip, at: tailTip.at });
  b.ring(tailTip, { count: 7, radius: 0.02 }, (h) => {
    b.spike(h, h, 0.05, 0.005, { color: TUFT });
  });

  // Four pillar legs with round, padded feet and pale toenails.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.15;

    // Front leg: elbow points back.
    const frontPts = limb([x, 0.86, 0.3], [x, 0.06, 0.4], [0.42, 0.42], [0, 0, -1]);
    const fore = b.chain(`fore${S}`, frontPts, {
      parent: spine.joints[2],
      names: [`shoulderF${S}`, `elbowF${S}`, `footF${S}`],
      role: "leg",
    });
    b.sweep(fore, { color: coat, caps: { start: "round", end: "flat" } } && ((t: number) => 0.13 - 0.03 * t), {
      color: coat,
      caps: { start: "round", end: "flat" },
    });
    addFoot(b, fore.tip!, x, 0.4, coat);

    // Hind leg: knee points forward.
    const hindPts = limb([x, 0.86, -0.32], [x, 0.06, -0.4], [0.42, 0.42], [0, 0, 1]);
    const hind = b.chain(`hind${S}`, hindPts, {
      parent: hips,
      names: [`hipH${S}`, `kneeH${S}`, `footH${S}`],
      role: "leg",
    });
    b.sweep(hind, (t: number) => 0.14 - 0.03 * t, {
      color: coat,
      caps: { start: "round", end: "flat" },
    });
    addFoot(b, hind.tip!, x, -0.4, coat);
  }

  return b.root;
}

// A round, padded foot with four pale nails on its front.
function addFoot(
  b: ReturnType<typeof createBuilder>,
  foot: Parameters<ReturnType<typeof createBuilder>["part"]>[2] extends infer O ? any : any,
  x: number,
  z: number,
  coat: any,
) {
  b.part(new THREE.CylinderGeometry(0.115, 0.125, 0.12, 12), coat, {
    bone: foot,
    at: [x, 0.06, z],
  });
  for (const o of [-0.075, -0.025, 0.025, 0.075]) {
    const nz = z + Math.sqrt(0.12 * 0.12 - o * o) - 0.008;
    b.part(new THREE.CylinderGeometry(0.02, 0.022, 0.012, 8), NAIL, {
      bone: foot,
      at: [x + o, 0.05, nz],
      dir: [0, 0, 1],
    });
  }
}
