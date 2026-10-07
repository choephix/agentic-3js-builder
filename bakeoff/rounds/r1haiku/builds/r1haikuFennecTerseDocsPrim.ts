import * as THREE from "three";
import { createBuilder, catmull, limb, countershade, mottle } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

const SAND = "#c9834a";
const APRICOT = "#e3a86e";
const CREAM = "#f5e8d0";
const INNER = "#f1dcb8";
const DARK = "#2a1d17";
const TIP = "#1e1714";
const PAD = "#f0dcc0";

export const meta = {
  name: "Fennec fox",
  description: "A stylised desert fennec fox: huge ears, sandy coat, cream muzzle and belly, bushy tail with a dark tip.",
};

export default function build() {
  const b = createBuilder({ name: "fennec" });

  const coat = countershade(mottle(SAND, APRICOT, { size: 0.07, contrast: 0.6, seed: 4 }), CREAM, { level: -0.25 });

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.25, -0.14], role: "spine" });

  const spine = b.chain("spine", catmull([[0, 0.25, -0.14], [0, 0.26, 0.0], [0, 0.27, 0.11]]), {
    parent: hips,
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const spineEnd = spine.joints[spine.joints.length - 1];

  const neck = b.chain("neck", catmull([[0, 0.27, 0.11], [0, 0.31, 0.19], [0, 0.36, 0.26]]), {
    parent: spineEnd,
    names: ["neck1", "neck2"],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 0.37, 0.27],
    aim: [0, 0.4, 0.37],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.03, up: -0.035 }),
    aim: head.local({ forward: 0.1, up: -0.045 }),
    role: "jaw",
  });

  const tail = b.chain("tail", catmull([[0, 0.25, -0.14], [0, 0.23, -0.25], [0, 0.24, -0.34], [0, 0.29, -0.4]]), {
    parent: hips,
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
  });

  // ---- Body and neck ------------------------------------------------------
  b.sweep(spine, [0.07, 0.088, 0.082, 0.07], { color: coat });
  b.sweep(neck, [0.062, 0.05, 0.042], { color: coat });

  // ---- Head ---------------------------------------------------------------
  const skull = catmull([
    head.local({ back: 0.05, up: -0.01 }),
    head.local({ back: 0.0, up: 0.02 }),
    head.local({ forward: 0.06, up: 0.0 }),
    head.local({ forward: 0.12, up: -0.012 }),
  ]);
  const headTube = b.sweep(skull, [0.05, 0.062, 0.05, 0.024], {
    bone: head,
    color: coat,
    bands: [
      [0.55, coat],
      [1, CREAM],
    ],
  });
  const headSurf = b.surface(headTube);

  // Lower jaw, separate so it can open.
  b.sweep(
    catmull([jaw.local({ back: 0.01 }), jaw.local({ forward: 0.05, up: 0.0 }), jaw.local({ forward: 0.09, up: 0.008 })]),
    [0.014, 0.011, 0.008],
    { bone: jaw, color: CREAM },
  );

  // Nose and eyes, seated on the skull surface.
  const nose = headSurf.around(head.local({ forward: 0.07 })).at(0, 0);
  if (nose) b.stick(new THREE.SphereGeometry(0.018, 8, 6), DARK, nose, { embed: 0.35 });

  for (const s of [1, -1]) {
    const eye = headSurf.around(head.at).at(s * 50, 10);
    if (eye) b.stick(new THREE.SphereGeometry(0.014, 8, 6), DARK, eye, { embed: 0.3 });
  }

  // ---- Ears: huge, thin, outer coat with a cream inner face ---------------
  const earOut: OutlinePoint[] = [
    [-0.05, 0],
    [0.05, 0],
    [0.045, 0.085],
    [0.0, 0.14],
    [-0.045, 0.085],
  ];
  const earIn: OutlinePoint[] = [
    [-0.032, 0.01],
    [0.032, 0.01],
    [0.028, 0.075],
    [0.0, 0.115],
    [-0.028, 0.075],
  ];
  for (const s of [1, -1]) {
    const hit = headSurf.around(head.local({ up: 0.03 })).at(s * 38, 62);
    if (!hit) continue;
    const ear = b.extrude(earOut, {
      at: hit.moved([0, -0.012, 0]),
      x: [s, 0, 0],
      y: [s * 0.3, 1, -0.45],
      thickness: [0.012, 0.006],
      bevel: 0.003,
      smoothing: 1,
      color: coat,
      bone: head,
    });
    b.extrude(earIn, {
      at: ear.local([0, 0, 0.003]),
      x: [s, 0, 0],
      y: [s * 0.3, 1, -0.45],
      thickness: 0.004,
      bevel: 0.0015,
      smoothing: 1,
      color: INNER,
      bone: head,
    });
  }

  // ---- Tail: bushy, dark tip ----------------------------------------------
  b.sweep(tail, [0.035, 0.06, 0.068, 0.05], {
    color: coat,
    bands: [
      [0.8, coat],
      [1, TIP],
    ],
  });

  // ---- Legs: IK-planted, thin and long, cream lower legs -------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.05;

    // Front leg: shoulder to paw, elbow bends back.
    const fShoulder: [number, number, number] = [x, 0.25, 0.08];
    const fFoot: [number, number, number] = [x, 0.022, 0.1];
    const fPts = limb(fShoulder, fFoot, [0.12, 0.12], [0, 0, -1]);
    const front = b.chain(`leg${S}F`, fPts, {
      parent: spineEnd,
      names: [`shoulder${S}`, `elbow${S}`, `paw${S}F`],
      role: "leg",
    });
    b.sweep(front, [0.03, 0.025, 0.02], {
      color: coat,
      bands: [
        [0.5, coat],
        [1, CREAM],
      ],
    });
    const fTip = front.tip ?? front.joints[front.joints.length - 1];
    b.part(new THREE.BoxGeometry(0.035, 0.02, 0.05), PAD, { bone: fTip, at: [x, 0.01, 0.115] });

    // Hind leg: hip, knee forward, hock back, paw.
    const hHip: [number, number, number] = [x, 0.25, -0.14];
    const hFoot: [number, number, number] = [x, 0.022, -0.1];
    const hPts = limb(hHip, hFoot, [0.13, 0.12, 0.08], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hind = b.chain(`leg${S}H`, hPts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `paw${S}H`],
      role: "leg",
    });
    b.sweep(hind, [0.034, 0.026, 0.02, 0.018], {
      color: coat,
      bands: [
        [0.5, coat],
        [1, CREAM],
      ],
    });
    const hTip = hind.tip ?? hind.joints[hind.joints.length - 1];
    b.part(new THREE.BoxGeometry(0.035, 0.02, 0.05), PAD, { bone: hTip, at: [x, 0.01, -0.095] });
  }

  return b.root;
}
