import * as THREE from "three";
import { createBuilder, catmull, limb, mottle } from "../../../../src/index";

const BRASS = "#d4a540";
const BRASS_DK = "#8c6424";
const COPPER = "#b86a3a";
const RED = "#a3161f";
const LEATHER = "#4a2817";
const GLASS = "#63e6a6";
const DARK = "#1c1917";

export const meta = {
  name: "Clockwork terrier",
  description: "Wind-up brass and copper terrier with riveted plates, a visible chest gear train, a winding key, springy legs, a coil-spring tail, floppy leather ears and green lens eyes.",
};

export default function build() {
  const b = createBuilder({ name: "clockwork-terrier" });
  const BODY = mottle(BRASS, BRASS_DK, { size: 0.14, contrast: 0.35, seed: 3 });

  // Skeleton: spine, neck, head, jaw
  const hips = b.joint("hips", { at: [0, 0.21, -0.2], role: "spine" });
  const spine = b.chain("spine", catmull([
    [0, 0.21, -0.2],
    [0, 0.23, -0.04],
    [0, 0.25, 0.08],
    [0, 0.26, 0.18],
  ]), { parent: hips, names: ["spineA", "spineB", "spineC"], role: "spine" });

  const neck = b.chain("neck", catmull([
    [0, 0.26, 0.18],
    [0, 0.31, 0.23],
    [0, 0.35, 0.27],
  ]), { parent: spine.joints[2], names: ["neckA", "neckB"], role: "neck" });

  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.35, 0.27], dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.04, up: -0.035 }),
    aim: head.local({ forward: 0.2, up: -0.04 }),
    role: "jaw",
  });

  // Tail: a thin core with a coil spring wound along it
  const tail = b.chain("tail", catmull([
    [0, 0.23, -0.2],
    [0, 0.3, -0.27],
    [0, 0.38, -0.3],
    [0, 0.44, -0.26],
  ]), { parent: hips, names: ["tailA", "tailB", "tailC"], role: "tail" });

  // Body: a lofted brass barrel that bends with the spine
  const body = b.loft(
    [
      { at: [0, 0.21, -0.2], w: 0.12, h: 0.11 },
      { at: [0, 0.23, -0.04], w: 0.16, h: 0.15 },
      { at: [0, 0.25, 0.08], w: 0.16, h: 0.15 },
      { at: [0, 0.26, 0.18], w: 0.11, h: 0.11 },
    ],
    { bone: spine, color: BODY },
  );

  // Riveted copper bands round the body, each with a row of brass rivets
  const skin = b.surface(body);
  for (const t of [0.22, 0.5, 0.78]) {
    const band = skin.loop(spine.at(t), { lift: 0.003 });
    b.sweep(band, 0.0045, { color: COPPER });
    b.along(band, 10, (at) => b.part(new THREE.SphereGeometry(0.0055, 6, 4), BRASS, { at }));
  }

  // Visible gear train on each flank of the chest
  const gearOutline = (n: number, ro: number, ri: number) => {
    const pts: [number, number][] = [];
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2;
      const r = i % 2 ? ri : ro;
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return pts;
  };
  for (const s of [1, -1]) {
    b.extrude(gearOutline(10, 0.034, 0.026), {
      at: [s * 0.082, 0.25, 0.06],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.002,
      color: BRASS,
      bone: spine.joints[1],
    });
    b.extrude(gearOutline(7, 0.02, 0.014), {
      at: [s * 0.09, 0.24, 0.1],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.01,
      bevel: 0.002,
      color: COPPER,
      bone: spine.joints[1],
    });
  }

  // Winding key on the back: a post with a loop on top
  b.lathe(
    [
      [0, 0],
      [0.024, 0],
      [0.024, 0.012],
      [0.008, 0.024],
      [0.008, 0.09],
      [0, 0.09],
    ],
    { at: [0, 0.29, -0.05], bone: spine.joints[0], color: BRASS },
  );
  b.part(new THREE.TorusGeometry(0.03, 0.007, 6, 14), BRASS, {
    bone: spine.joints[0],
    at: [0, 0.4, -0.05],
    dir: [1, 0, 0],
    axis: "z",
  });

  // Tail: coil spring rings along the core
  const tailCoil = new THREE.TorusGeometry(0.02, 0.0045, 5, 8).rotateX(Math.PI / 2);
  b.sweep(tail, [0.009, 0.006], { color: COPPER });
  b.along(tail, 16, (at) => b.part(tailCoil, COPPER, { frame: at }), { from: 0.04, to: 0.98 });

  // Head: skull, snout, lower jaw, nose
  b.part(new THREE.SphereGeometry(0.06, 10, 8), BODY, {
    bone: head,
    at: head.local({ forward: -0.01, up: 0.01 }),
    scale: [1, 0.95, 1.15],
  });
  b.frustumBox(
    head.local({ forward: 0.03, up: -0.01 }),
    head.local({ forward: 0.2, up: -0.02 }),
    [0.085, 0.07],
    [0.06, 0.05],
    { bone: head, color: BRASS },
  );
  b.frustumBox(
    jaw.local({ forward: 0, up: 0 }),
    jaw.local({ forward: 0.15, up: -0.005 }),
    [0.07, 0.03],
    [0.05, 0.02],
    { bone: jaw, color: BRASS_DK },
  );
  b.part(new THREE.SphereGeometry(0.016, 6, 5), DARK, {
    bone: head,
    at: head.local({ forward: 0.2, up: -0.01 }),
  });

  // Eyes and ears, mirrored
  for (const s of [1, -1]) {
    const eye = head.local({ left: s * 0.05, up: 0.035, forward: 0.03 });
    b.part(new THREE.SphereGeometry(0.02, 10, 7), GLASS, { bone: head, at: eye });
    b.part(new THREE.TorusGeometry(0.024, 0.005, 5, 12), BRASS, {
      bone: head,
      at: eye,
      dir: [s, 0, 0],
      axis: "z",
    });

    b.extrude(
      [
        [-0.03, 0.0],
        [0.03, 0.01],
        [0.045, -0.05],
        [0.025, -0.11],
        [-0.005, -0.125],
        [-0.03, -0.08],
        [-0.045, -0.02],
      ],
      {
        at: head.local({ left: s * 0.04, up: 0.035, forward: -0.02 }),
        bone: head,
        x: [0, 0, 1],
        y: [s * 0.25, 1, 0],
        thickness: 0.008,
        bevel: 0.003,
        smoothing: 1,
        color: LEATHER,
      },
    );
  }

  // Legs: springy jointed limbs with copper coils
  const legCoil = new THREE.TorusGeometry(0.026, 0.004, 5, 10).rotateX(Math.PI / 2);
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // hind leg: knee forward, hock back
    const hindPts = limb(
      [s * 0.06, 0.21, -0.12],
      [s * 0.065, 0.02, -0.12],
      [0.11, 0.11, 0.07],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hind = b.chain(`hind${S}`, hindPts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `paw${S}`],
      role: "leg",
    });
    b.sweep(hind, [0.02, 0.014], { color: BRASS });
    b.along(hind, 4, (at) => b.part(legCoil, COPPER, { frame: at }), { from: 0.12, to: 0.62 });
    b.part(new THREE.SphereGeometry(0.022, 6, 4), COPPER, { bone: hind.tip!, at: [s * 0.065, 0.02, -0.12] });

    // front leg: elbow back
    const frontPts = limb(
      [s * 0.06, 0.24, 0.12],
      [s * 0.06, 0.02, 0.14],
      [0.11, 0.11, 0.07],
      [
        [0, 0, -1],
        [0, 0, -1],
      ],
    );
    const front = b.chain(`front${S}`, frontPts, {
      parent: spine.joints[2],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `pawF${S}`],
      role: "leg",
    });
    b.sweep(front, [0.02, 0.014], { color: BRASS });
    b.along(front, 4, (at) => b.part(legCoil, COPPER, { frame: at }), { from: 0.12, to: 0.62 });
    b.part(new THREE.SphereGeometry(0.022, 6, 4), COPPER, { bone: front.tip!, at: [s * 0.06, 0.02, 0.14] });
  }

  // Neck tube and red collar with a brass tag
  const neckSkin = b.sweep(neck, [0.042, 0.034], { color: BRASS_DK });
  const collar = b.surface(neckSkin).loop(neck.at(0.4), { lift: 0.004 });
  b.sweep(collar, 0.007, { color: RED });

  const tagOutline: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    tagOutline.push([Math.cos(a) * 0.014, Math.sin(a) * 0.014]);
  }
  const cf = neck.at(0.4);
  b.extrude(tagOutline, {
    at: cf.moved({ forward: 0.044, up: -0.03 }),
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.002,
    bevel: 0.0008,
    smoothing: 1,
    color: BRASS,
  });

  return b.root;
}
