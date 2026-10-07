import * as THREE from "three";
import { createBuilder, paint, catmull, bezier, polyline } from "../../../../src/index";

export const meta = {
  name: "Emperor Penguin",
  description: "A stylized upright emperor penguin with a skeleton rig, paddle flippers, webbed feet and a hinged lower beak.",
};

const BLACK = "#1f232c";
const SLATE = "#2a3140";
const WHITE = "#f4f1e8";
const YELLOW = "#f1d27a";
const ORANGE = "#f2a23a";
const BEAK = "#3b3238";
const BEAK_LOW = "#ee8a5c";
const FOOT = "#2c272c";
const EYE = "#f7f4ea";

function interp(keys: number[][], t: number) {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
}

export default function build() {
  const b = createBuilder({ name: "penguin" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.5, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.5, 0],
      [0, 0.7, 0.01],
      [0, 0.86, 0.03],
      [0, 0.94, 0.04],
    ]),
    { parent: hips, names: ["spine1", "spine2", "neck"], role: "spine" },
  );
  const head = b.joint("head", {
    parent: spine.joints[2],
    at: [0, 0.94, 0.04],
    dir: [0, 1, 0.25],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.975, 0.12],
    aim: [0, 0.96, 0.25],
    role: "jaw",
  });

  // ---------- body ----------
  const bodyPath = catmull([
    [0, 0.22, -0.02],
    [0, 0.45, -0.03],
    [0, 0.7, 0],
    [0, 0.88, 0.035],
    [0, 0.93, 0.04],
  ]);
  const prof = [
    [0, 0.1],
    [0.15, 0.17],
    [0.4, 0.215],
    [0.65, 0.2],
    [0.85, 0.13],
    [1, 0.075],
  ];
  const coat = paint((p, n) => {
    if (p.y > 0.9) return BLACK;
    if (n.z > 0.12 + Math.abs(n.x) * 0.0) {
      if (p.y > 0.8) return p.y > 0.86 ? ORANGE : YELLOW;
      return WHITE;
    }
    return BLACK;
  });
  b.sweep(bodyPath, (t) => {
    const r = interp(prof, t);
    return [r, r * 0.88];
  }, { bone: [hips, spine], color: coat, sides: 12 });

  // tail wedge
  const tail = b.chain(
    "tail",
    polyline([
      [0, 0.2, -0.15],
      [0, 0.08, -0.31],
    ]),
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );
  b.frustumBox([0, 0.2, -0.14], [0, 0.085, -0.31], [0.12, 0.025], [0.07, 0.015], {
    bone: tail.joints[0],
    color: SLATE,
  });

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(0.087, 12, 9), BLACK, {
    bone: head,
    at: [0, 1.0, 0.06],
    scale: [1, 1, 1.1],
  });

  // upper & lower beak
  b.sweep(bezier([0, 0.997, 0.12], [0, 0.99, 0.21], [0, 0.962, 0.285]), [0.028, 0.004], {
    bone: head,
    color: BEAK,
    sides: 6,
  });
  b.sweep(bezier([0, 0.972, 0.115], [0, 0.965, 0.2], [0, 0.953, 0.258]), [0.021, 0.004], {
    bone: jaw,
    color: BEAK_LOW,
    sides: 6,
  });

  const hs = b.surface(skull);
  for (const s of [1, -1]) {
    // ear patches
    const ear = hs.around(skull.at).at(s * 100, -2);
    if (ear)
      b.stick(new THREE.SphereGeometry(0.04, 8, 6), ORANGE, ear, { embed: 0.3, scale: [1, 0.25, 1.5], bone: head });
    // eyes
    const eh = hs.around(skull.at).at(s * 42, 10);
    if (eh) {
      b.stick(new THREE.SphereGeometry(0.021, 8, 6), EYE, eh, { embed: 0.3, scale: [1, 0.45, 1], bone: head });
      b.stick(new THREE.SphereGeometry(0.012, 6, 5), "#08090c", eh.moved([0, 0.004, 0]), {
        embed: 0.2,
        scale: [1, 0.5, 1],
        bone: head,
      });
    }
  }

  // ---------- flippers & legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    const yd = new THREE.Vector3(0.4 * s, -0.9, 0).normalize();
    const p0 = new THREE.Vector3(s * 0.17, 0.8, 0.0);
    const p1 = p0.clone().addScaledVector(yd, 0.21);
    const p2 = p0.clone().addScaledVector(yd, 0.43);
    const arm = b.chain("arm" + S, polyline([p0, p1, p2]), {
      parent: spine.joints[1],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.extrude(
      [
        [-0.03, 0],
        [0.03, 0],
        [0.045, 0.1],
        [0.047, 0.22],
        [0.033, 0.34],
        [0.0, 0.43, "sharp"],
        [-0.025, 0.34],
        [-0.04, 0.22],
        [-0.04, 0.1],
      ],
      {
        at: p0,
        x: [0, 0, 1],
        y: [yd.x, yd.y, yd.z],
        thickness: [0.03, 0.01],
        bevel: 0.004,
        color: SLATE,
        bone: arm.joints[0],
      },
    );

    const leg = b.chain(
      "leg" + S,
      polyline([
        [s * 0.09, 0.2, 0],
        [s * 0.09, 0.11, 0.01],
        [s * 0.09, 0.045, 0.02],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg", contact: [s * 0.09, 0, 0.05] },
    );
    b.sweep(leg, 0.032, { color: FOOT, sides: 6 });
    b.extrude(
      [
        [-0.035, -0.025],
        [0.0, -0.045],
        [0.05, -0.065, "sharp"],
        [0.1, -0.04],
        [0.12, 0, "sharp"],
        [0.1, 0.04],
        [0.05, 0.065, "sharp"],
        [0.0, 0.045],
        [-0.035, 0.025],
      ],
      {
        at: [s * 0.09, 0.008, 0.0],
        x: [0, 0, 1],
        y: [1, 0, 0],
        thickness: 0.02,
        bevel: 0.004,
        color: FOOT,
        bone: leg.tip ?? leg.joints[leg.joints.length - 1],
      },
    );
    // claws
    for (const [fx, fz] of [
      [0.0, 0.123],
      [-0.065, 0.055],
      [0.065, 0.055],
    ]) {
      b.spike([s * (0.09 + fx), 0.012, fz - 0.005], [0, 0.3, 1], 0.03, 0.01, {
        color: "#15130f",
        sides: 5,
        bone: leg.tip ?? leg.joints[leg.joints.length - 1],
      });
    }
  }

  return b.root;
}
