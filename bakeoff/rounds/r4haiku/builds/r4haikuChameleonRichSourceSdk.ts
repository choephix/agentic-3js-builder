import * as THREE from "three";
import { arc, catmull, createBuilder, interpolate, mix, paint, polyline, spiral } from "../../../../src/index";

export const meta = {
  name: "Panther chameleon on a twig",
  description:
    "A panther chameleon gripping a twig with mitten feet: turquoise head, lime body, sunset-orange tail, a ridged crest, turret eyes looking two ways, a white flank stripe, red bars and a tightly coiled tail.",
};

const TURQUOISE = "#1fc4b8";
const LIME = "#9fd23c";
const ORANGE = "#ff6f22";
const RED = "#e0342b";
const WHITE = "#f7f5ee";
const GOLD = "#e8b83a";
const PUPIL = "#121416";
const BARK = "#7a5636";

const DEG = Math.PI / 180;
const TWIG_Y = 0.1;
const TWIG_R = 0.0118;
/** Centre radius of a digit wrapped round the twig: twig radius plus digit radius. */
const GRIP = TWIG_R + 0.0031;
/** Where the red bars sit along the torso spine (0 = tail base, 1 = neck). */
const BARS = [0.19, 0.38, 0.575, 0.765];

/** Turquoise at the head, lime through the middle, sunset orange at the tail (by height along the body). */
function ramp(z: number) {
  const u = Math.min(Math.max((0.14 - z) / 0.28, 0), 1);
  return u < 0.5 ? mix(TURQUOISE, LIME, u * 2) : mix(LIME, ORANGE, (u - 0.5) * 2);
}

export default function pantherChameleon() {
  const b = createBuilder({ name: "panther-chameleon", detail: 1, paintSize: 1024 });

  const skin = paint((p) => ramp(p.z));
  // The torso: the same colour ramp, with red bars across the flanks at fixed places along the spine.
  const torsoSkin = paint((p, _n, [t, deg]) => {
    const flank = (deg > 28 && deg < 152) || (deg > 208 && deg < 332);
    const bar = flank && BARS.some((c) => Math.abs(t - c) < 0.045);
    return bar ? RED : ramp(p.z);
  });

  // Skeleton. The root sits in the hips; the spine runs rump to neck.
  const hips = b.joint("hips", { at: [0, 0.19, -0.03] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.19, -0.13],
      [0, 0.196, -0.07],
      [0, 0.2, -0.005],
      [0, 0.205, 0.065],
      [0, 0.212, 0.1],
    ]),
    { parent: hips, role: "spine", names: ["rump", "midback", "chest", "shoulders", "neck"] },
  );

  // Laterally flattened torso: deepest through the chest, tapering into the tail.
  const torsoRadius = (t: number): [number, number] => [
    interpolate([0, 0.2, 0.5, 0.8, 1], [0.011, 0.02, 0.022, 0.02, 0.016], t),
    interpolate([0, 0.2, 0.5, 0.8, 1], [0.016, 0.028, 0.031, 0.029, 0.024], t),
  ];
  const torso = b.sweep(spine, torsoRadius, {
    name: "torso",
    color: torsoSkin,
    sides: 10,
    // A white stripe down each flank, at mid-height (clock 90 and 270 are the two sides).
    sectors: [
      [75, 105, WHITE],
      [255, 285, WHITE],
    ],
  });

  // Head: a broad casque sloping to a blunt snout, carried on the neck.
  const head = b.joint("head", { parent: "neck", at: [0, 0.218, 0.11], dir: [0, 0.25, 1], role: "head" });
  const headRadius = (t: number): [number, number] => [
    interpolate([0, 0.42, 0.76, 1], [0.02, 0.024, 0.018, 0.011], t),
    interpolate([0, 0.42, 0.76, 1], [0.027, 0.032, 0.024, 0.012], t),
  ];
  b.sweep(
    catmull([
      [0, 0.21, 0.1],
      [0, 0.232, 0.148],
      [0, 0.236, 0.19],
      [0, 0.226, 0.218],
    ]),
    headRadius,
    { name: "head", bone: head, color: skin, sides: 10 },
  );

  // Ridged crest: a sawtooth plate along the top of the casque.
  b.slab(
    [
      [0, 0.242, 0.1],
      [0, 0.266, 0.116],
      [0, 0.252, 0.127],
      [0, 0.276, 0.14],
      [0, 0.258, 0.153],
      [0, 0.272, 0.166],
      [0, 0.256, 0.178],
      [0, 0.244, 0.192],
      [0, 0.226, 0.192],
      [0, 0.214, 0.1],
    ],
    { name: "crest", color: skin, thickness: 0.006, bone: head },
  );

  // Turret eyes on short stalks, each with its own joint: the left looks forward and out, the right back and out.
  const eyeL = b.joint("eyeL", { parent: head, at: [0.04, 0.248, 0.158], dir: [0.75, 0.25, 0.62] });
  const eyeR = b.joint("eyeR", { parent: head, at: [-0.04, 0.248, 0.158], dir: [-0.85, 0.18, -0.4] });
  b.rod([0.016, 0.242, 0.145], [0.04, 0.248, 0.158], [0.0095, 0.0085], { color: skin, bone: head });
  b.rod([-0.016, 0.242, 0.145], [-0.04, 0.248, 0.158], [0.0095, 0.0085], { color: skin, bone: head });
  for (const eye of [eyeL, eyeR]) {
    b.part(new THREE.SphereGeometry(0.0125, 10, 8), GOLD, { bone: eye });
    b.part(new THREE.CylinderGeometry(0.0062, 0.0062, 0.003, 8), PUPIL, {
      bone: eye,
      at: eye.local([0, 0.0118, 0]),
      dir: eye,
    });
  }

  // Lower jaw, hinged under the head so the mouth can open.
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.214, 0.152], dir: [0, 0, 1], role: "jaw" });
  b.sweep(
    catmull([
      [0, 0.212, 0.152],
      [0, 0.207, 0.2],
      [0, 0.211, 0.228],
    ]),
    (t: number) => 0.0075 - 0.003 * t,
    { name: "jaw", bone: jaw, color: skin },
  );

  // Legs: a chain per leg, a tube along it, and a mitten foot that hooks round the twig.
  const leg = (side: 1 | -1, tag: string, parent: string, pts: number[][], names: string[]) => {
    const limb = b.chain(
      `leg${tag}`,
      polyline(pts.map(([x, y, z]) => [side * x, y, z])),
      { parent, role: "leg", names },
    );
    b.sweep(limb, (t: number) => interpolate([0, 0.4, 0.75, 1], [0.0085, 0.0075, 0.0058, 0.0048], t), {
      name: `leg${tag}`,
      color: skin,
    });
    const foot = names[3];
    const zf = pts[3][2];
    // The mitten pad rests on top of the twig.
    b.part(new THREE.SphereGeometry(1, 10, 8), skin, {
      bone: foot,
      at: [side * 0.014, 0.1185, zf],
      scale: [0.0115, 0.0075, 0.0095],
    });
    // Five digits, each an arc round the twig: they hook under it from the pad's side.
    for (const dz of [-0.0062, -0.0031, 0, 0.0031, 0.0062]) {
      const z = zf + dz;
      const from: [number, number, number] = [
        side * GRIP * Math.sin(35 * DEG),
        TWIG_Y + GRIP * Math.cos(35 * DEG),
        z,
      ];
      b.sweep(arc([0, TWIG_Y, z], from, [0, 0, 1], -side * 150), 0.0031, { color: skin, bone: foot });
    }
  };
  const front = [
    [0.018, 0.197, 0.068],
    [0.042, 0.163, 0.088],
    [0.022, 0.134, 0.08],
    [0.014, 0.1215, 0.076],
  ];
  const hind = [
    [0.02, 0.192, -0.062],
    [0.046, 0.162, -0.04],
    [0.024, 0.134, -0.05],
    [0.014, 0.1215, -0.052],
  ];
  leg(1, "FL", "shoulders", front, ["shoulderFL", "elbowFL", "wristFL", "footFL"]);
  leg(-1, "FR", "shoulders", front, ["shoulderFR", "elbowFR", "wristFR", "footFR"]);
  leg(1, "HL", "midback", hind, ["hipHL", "kneeHL", "ankleHL", "footHL"]);
  leg(-1, "HR", "midback", hind, ["hipHR", "kneeHR", "ankleHR", "footHR"]);

  // Tail: drops from the rump, then coils tightly in a side-facing spiral that tightens toward the tip.
  const tailPath = catmull([
    [0, 0.19, -0.12],
    [0, 0.178, -0.158],
    [0, 0.166, -0.185],
    [0, 0.16, -0.202],
  ]).concat(spiral([0, 0.16, -0.23], [0, 0.16, -0.202], [1, 0, 0], { turns: 2.2, r1: 0.009 }));
  const tail = b.chain("tail", tailPath, { parent: "rump", role: "tail", count: 8 });
  b.sweep(tail, (t: number) => 0.0085 - 0.0064 * t, { name: "tail", color: skin });

  // Small dorsal spines along the back, seated on the torso's real surface.
  const dorsal = b.surface(torso);
  for (const z of [-0.1, -0.05, 0, 0.05]) {
    const hit = dorsal.ray([0, 1, z], [0, -1, 0]);
    if (hit) b.spike(hit, hit, 0.011, 0.0034, { color: skin });
  }

  // The twig, on two stakes that reach the floor, with a short shoot.
  b.sweep(polyline([[0, TWIG_Y, -0.46], [0, TWIG_Y, 0.44]]), [0.0125, 0.0105], {
    name: "twig",
    color: BARK,
    bone: hips,
  });
  b.rod([0, 0, 0.3], [0, TWIG_Y, 0.3], [0.02, 0.012], { color: BARK, bone: hips });
  b.rod([0, 0, -0.4], [0, TWIG_Y, -0.4], [0.02, 0.012], { color: BARK, bone: hips });
  b.rod([0, TWIG_Y, 0.32], [0.05, 0.19, 0.36], [0.0068, 0.0028], { color: BARK, bone: hips });

  return b.root;
}
