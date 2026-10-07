import * as THREE from "three";
import { createBuilder, rng, catmull } from "../../../../src/index";

export const meta = {
  name: "Nine-banded armadillo",
  description:
    "A trotting nine-banded armadillo: dusty pink-tan banded shell, pointed snout, tall leathery ears, clawed feet and a long tapering armoured tail, with coarse pale hairs between the bands.",
};

const TAN = "#b99b86";
const BAND = "#8c6e5e";
const LEG = "#a48976";
const EAR = "#c7a895";
const CLAW = "#3b302b";
const EYE = "#140f0d";
const HAIR = "#eee4d2";

export default function build() {
  const b = createBuilder({ name: "nine-banded armadillo" });
  const r = rng(9);

  // Skeleton: pelvis root, spine chain, head, jaw, tail and four legs.
  const hips = b.joint("hips", { at: [0, 0.2, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.2, -0.14],
      [0, 0.21, -0.04],
      [0, 0.22, 0.05],
      [0, 0.22, 0.13],
    ],
    { role: "spine" },
  );

  // Body shell: a tan core wrapped in nine dark bands.
  const body = b.sweep(spine, 0.112, { color: TAN });
  const bandGeo = new THREE.CylinderGeometry(0.122, 0.122, 0.018, 14, 1, true);
  b.along(spine, 9, (at) => {
    b.part(bandGeo, BAND, { frame: at });
  });

  // Head with pointed snout, beady eyes, tall ears and a separate lower jaw.
  const head = b.joint("head", { at: [0, 0.25, 0.22], parent: hips });
  b.part(new THREE.SphereGeometry(0.065, 12, 9), TAN, {
    at: [0, 0.25, 0.22],
    bone: head,
    scale: [0.95, 0.9, 1.15],
  });
  b.part(new THREE.ConeGeometry(0.045, 0.15, 8), TAN, {
    at: [0, 0.235, 0.335],
    bone: head,
    dir: [0, 0, 1],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.009, 8, 6), EYE, {
      at: [s * 0.04, 0.27, 0.27],
      bone: head,
    });
    b.sweep(
      catmull([
        [s * 0.035, 0.29, 0.19],
        [s * 0.045, 0.35, 0.18],
        [s * 0.05, 0.4, 0.165],
      ]),
      0.02,
      { color: EAR, bone: head },
    );
  }
  const jaw = b.joint("jaw", { at: [0, 0.225, 0.26], parent: head });
  b.sweep([jaw, [0, 0.215, 0.35]], 0.018, { color: TAN, bone: jaw });

  // Tail: seven joints tapering to a point, with a thin band on each joint.
  const TP = [
    [0, 0.19, -0.16],
    [0, 0.18, -0.25],
    [0, 0.165, -0.34],
    [0, 0.15, -0.43],
    [0, 0.135, -0.51],
    [0, 0.12, -0.58],
    [0, 0.11, -0.64],
  ];
  const tj: any[] = [];
  for (let i = 0; i < TP.length; i++) {
    tj.push(
      b.joint(`tail${i + 1}`, { at: TP[i], parent: i === 0 ? hips : tj[i - 1] }),
    );
  }
  const tr = [0.07, 0.062, 0.052, 0.042, 0.032, 0.022];
  for (let i = 0; i < tr.length; i++) {
    b.sweep([tj[i], TP[i + 1]], tr[i], { color: TAN, bone: tj[i] });
    b.part(
      new THREE.CylinderGeometry(tr[i] + 0.006, tr[i] + 0.006, 0.014, 12, 1, true),
      BAND,
      { at: tj[i], bone: tj[i], dir: [0, -0.2, -1] },
    );
  }
  b.spike(tj[6], [0, -0.1, -1], 0.04, 0.012);

  // Legs: shoulder/elbow/wrist/digit at the front, hip/knee/ankle/digit behind.
  // The pose is a trot: diagonal pairs are swung forward and back.
  const leg = (
    names: string[],
    pts: number[][],
    parent: any,
    radii: number[],
    tag: string,
  ) => {
    const js: any[] = [];
    for (let i = 0; i < pts.length; i++) {
      js.push(
        b.joint(names[i], { at: pts[i], parent: i === 0 ? parent : js[i - 1] }),
      );
    }
    for (let i = 0; i < 3; i++) {
      b.sweep([js[i], js[i + 1]], radii[i], { color: LEG, bone: js[i] });
    }
    b.part(new THREE.SphereGeometry(0.026, 8, 6), LEG, {
      at: pts[1],
      bone: js[1],
    });
    // Three claws on each foot, curving down and forward.
    for (const dx of [-0.008, 0, 0.008]) {
      b.part(new THREE.ConeGeometry(0.006, 0.03, 5), CLAW, {
        at: [pts[3][0] + dx, 0.012, pts[3][2] + 0.02],
        bone: js[3],
        dir: [0, -0.4, 1],
      });
    }
    return tag;
  };

  leg(
    ["shoulderL", "elbowL", "wristL", "digitL"],
    [
      [0.07, 0.17, 0.08],
      [0.075, 0.1, 0.11],
      [0.075, 0.035, 0.12],
      [0.075, 0.02, 0.15],
    ],
    hips,
    [0.024, 0.017, 0.014],
    "FL",
  );
  leg(
    ["shoulderR", "elbowR", "wristR", "digitR"],
    [
      [-0.07, 0.17, 0.08],
      [-0.075, 0.1, 0.02],
      [-0.075, 0.035, 0.0],
      [-0.075, 0.02, 0.04],
    ],
    hips,
    [0.024, 0.017, 0.014],
    "FR",
  );
  leg(
    ["hipL", "kneeL", "ankleL", "digitHL"],
    [
      [0.07, 0.17, -0.12],
      [0.08, 0.1, -0.17],
      [0.08, 0.035, -0.19],
      [0.08, 0.02, -0.15],
    ],
    hips,
    [0.026, 0.018, 0.014],
    "HL",
  );
  leg(
    ["hipR", "kneeR", "ankleR", "digitHR"],
    [
      [-0.07, 0.17, -0.12],
      [-0.08, 0.1, -0.08],
      [-0.08, 0.035, -0.06],
      [-0.08, 0.02, -0.03],
    ],
    hips,
    [0.026, 0.018, 0.014],
    "HR",
  );

  // Coarse pale hairs poking out between the bands.
  const surf = b.surface(body);
  const hairGeo = new THREE.ConeGeometry(0.0035, 0.045, 4).translate(0, 0.0225, 0);
  for (let i = 0; i < 90; i++) {
    const az = r() * Math.PI * 2;
    const el = r() * 1.3 - 0.3;
    const hit = surf.around([0, 0.21, 0]).at(az, el);
    b.stick(hairGeo, HAIR, hit);
  }

  return b.root;
}
