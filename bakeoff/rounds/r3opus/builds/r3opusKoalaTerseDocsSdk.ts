import * as THREE from "three";
import {
  createBuilder,
  rng,
  vec,
  offset,
  polyline,
  catmull,
  mottle,
  paint,
  noise,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Koala",
  description:
    "A chunky stylised koala standing in a T-like rest pose. It has big fluffy rimmed ears, a glossy spoon nose, cream chest fluff and dark claws, and holds a eucalyptus sprig in its right paw.",
};

const FUR_A = "#9a9ea7";
const FUR_B = "#80848e";
const CREAM = "#ece6da";
const PAW = "#6c6f78";
const NOSE = "#2b2b33";
const NOSE_HI = "#5f6272";
const EYE = "#24180f";
const CLAW = "#2a2622";
const CHIN = "#d4cfc4";
const STEM = "#7b5a45";
const LEAF = "#5f8f7a";
const LEAF_TIP = "#8cb7a0";
const MIDRIB = "#c9dccf";
const NUT = "#8d7656";

export default function build() {
  const b = createBuilder({ name: "koala" });

  // ---------- paints & textures ----------
  const fur = mottle(FUR_A, FUR_B, { size: 0.05, seed: 3 });
  const bodyCoat = paint((p, n) => {
    const w = (noise(p, 0.05, 9) - 0.5) * 0.4;
    return n.z + w > 0.42 && p.y > 0.15 && p.y < 0.58 ? CREAM : fur;
  });
  const headFluff = paint((p, n) => (Math.abs(n.x) > 0.55 && p.y < 0.71 ? CREAM : fur));
  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
      <path d="M4 0 C2 24 6 44 9 64 C12 40 13 20 14 0 Z" fill="#e6e6e6"/>
      <path d="M11 0 C11 26 15 46 17 62 C20 40 21 22 21 0 Z" fill="#ffffff"/>
      <path d="M18 0 C20 22 25 40 28 58 C27 36 28 18 28 0 Z" fill="#d2d2d2"/>
    </svg>`,
    { size: 128 },
  );

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.3, 0] });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.33, 0],
      [0, 0.44, 0.01],
      [0, 0.55, 0],
    ]),
    { parent: hips, role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.57, 0.005], aim: [0, 0.64, 0.02], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.64, 0.02], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.64, 0.1], aim: [0, 0.625, 0.16], role: "jaw" });

  // ---------- body ----------
  const body = b.loft(
    [
      { at: [0, 0.17, -0.01], w: 0.2, h: 0.17 },
      { at: [0, 0.27, 0], w: 0.33, h: 0.27 },
      { at: [0, 0.4, 0.01], w: 0.32, h: 0.26 },
      { at: [0, 0.5, 0.005], w: 0.26, h: 0.21 },
      { at: [0, 0.59, 0], w: 0.16, h: 0.14 },
    ],
    { bone: [hips, spine], color: bodyCoat, name: "body" },
  );
  const bodyHits = b.surface(body).scatter(160, { rng: rng(11), minDist: 0.03 });
  b.cards(bodyHits, tuft, { size: [0.04, 0.055], lean: 60, bend: 25, vary: 0.25, rng: rng(12), color: bodyCoat });

  // ---------- head ----------
  const headPart = b.part(new THREE.SphereGeometry(0.13, 12, 9).scale(1.18, 0.95, 0.92), fur, {
    bone: head,
    at: [0, 0.7, 0.04],
    flat: true,
    name: "skull",
  });
  const headSurf = b.surface(headPart);
  const headHits = headSurf.scatter(70, {
    rng: rng(21),
    minDist: 0.025,
    filter: (h) => h.n.z < 0.5 || h.at.y > 0.79,
  });
  b.cards(headHits, tuft, { size: [0.035, 0.045], lean: 55, bend: 20, vary: 0.25, rng: rng(22), color: headFluff });

  // nose
  b.sweep(
    [
      [0, 0.715, 0.168],
      [0, 0.675, 0.174],
    ],
    () => [0.037, 0.03],
    { color: NOSE, bone: head, sides: 8, name: "nose" },
  );
  b.part(new THREE.SphereGeometry(0.009, 6, 4).scale(1.6, 1, 0.6), NOSE_HI, {
    bone: head,
    at: [0.008, 0.712, 0.198],
    name: "noseShine",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.008, 6, 4), "#141418", { bone: head, at: [s * 0.014, 0.652, 0.19] });
  }

  // eyes
  for (const s of [1, -1]) {
    const hit = headSurf.nearest([s * 0.064, 0.735, 0.22]);
    b.stick(new THREE.SphereGeometry(0.017, 8, 6), EYE, hit, { embed: 0.45, bone: head });
    b.part(new THREE.SphereGeometry(0.005, 6, 4), "#ffffff", { bone: head, at: hit.local([-0.005, 0.016, 0.006]) });
  }

  // chin / lower jaw
  b.part(new THREE.SphereGeometry(0.046, 8, 6).scale(1.3, 0.6, 1), CHIN, {
    bone: jaw,
    at: [0, 0.628, 0.13],
    flat: true,
    name: "chin",
  });

  // ears
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const E: [number, number, number] = [s * 0.155, 0.8, 0.0];
    const ear = b.joint(`ear${side}`, { parent: head, at: [s * 0.11, 0.77, 0.02], aim: E, role: "hinge" });
    const dir = new THREE.Vector3(s * 0.25, 0.15, 1).normalize();
    const disc = b.part(new THREE.CylinderGeometry(0.078, 0.078, 0.03, 12), fur, {
      bone: ear,
      at: E,
      dir,
      flat: true,
      name: `earDisc${side}`,
    });
    b.part(new THREE.CylinderGeometry(0.05, 0.056, 0.012, 10), CREAM, {
      bone: ear,
      at: offset(E, dir, 0.014),
      dir,
      flat: true,
      name: `earInner${side}`,
    });
    const rim = b.ring(disc, { count: 11, radius: 0.072, fromDeg: -125, toDeg: 125 });
    b.cards(rim.items, tuft, { size: [0.045, 0.06], cross: true, vary: 0.2, rng: rng(30 + s), color: CREAM, bone: ear });
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      polyline([
        [s * 0.12, 0.53, 0.01],
        [s * 0.24, 0.48, 0.04],
        [s * 0.36, 0.44, 0.06],
        [s * 0.42, 0.43, 0.07],
      ]),
      { parent: chest, role: "arm", names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`] },
    );
    const armTube = b.sweep(arm, [0.058, 0.05, 0.043, 0.04], { color: fur, name: `arm${side}` });
    b.cards(b.surface(armTube).scatter(22, { rng: rng(40 + s), minDist: 0.03 }), tuft, {
      size: [0.035, 0.045],
      lean: 60,
      bend: 20,
      vary: 0.2,
      rng: rng(42 + s),
      color: fur,
    });
    const hand = arm.tip!;
    const h = vec(hand.at);
    b.part(new THREE.SphereGeometry(0.048, 8, 6).scale(1.1, 0.8, 1.15), PAW, {
      bone: hand,
      at: h,
      flat: true,
      name: `paw${side}`,
    });
    for (let k = -2; k <= 2; k++) {
      b.spike([h.x + s * 0.035, h.y - 0.012, h.z + k * 0.018], [s * 0.7, -0.7, k * 0.15], 0.04, 0.007, {
        color: CLAW,
        bone: hand,
        sides: 5,
      });
    }

    // eucalyptus sprig in the right paw
    if (s < 0) {
      const stemPath = catmull([
        [h.x - 0.005, h.y - 0.02, h.z + 0.03],
        [h.x - 0.03, h.y + 0.12, h.z + 0.05],
        [h.x + 0.005, h.y + 0.25, h.z + 0.03],
      ]);
      b.sweep(stemPath, [0.007, 0.004], { color: STEM, bone: hand, sides: 6, name: "stem" });
      const leafPaint = paint((_p, _n, st) =>
        Math.abs(st[1]) < 0.0018 && st[0] > 0.01 ? MIDRIB : st[0] > 0.065 ? LEAF_TIP : LEAF,
      );
      const leafOutline: [number, number, "sharp"?][] = [
        [0, 0, "sharp"],
        [0.025, 0.013],
        [0.07, 0.009],
        [0.1, 0, "sharp"],
        [0.07, -0.009],
        [0.025, -0.013],
      ];
      let i = 0;
      b.along(
        stemPath,
        7,
        (at) => {
          const sg = i % 2 === 0 ? 1 : -1;
          const x = new THREE.Vector3(sg * 0.85, -0.3 + i * 0.08, 0).normalize();
          b.extrude(leafOutline as any, {
            at: at.at,
            x,
            y: [0, 0, 1],
            thickness: 0.004,
            bevel: 0.0015,
            smoothing: 1,
            color: leafPaint,
            bone: hand,
            name: `leaf${i}`,
          });
          i++;
        },
        { from: 0.12, to: 0.92 },
      );
      const top = stemPath.at(1);
      for (const [dx, dy, dz] of [
        [0.012, 0.01, 0.005],
        [-0.01, 0.015, -0.004],
        [0.0, 0.025, 0.01],
      ]) {
        b.part(new THREE.SphereGeometry(0.011, 6, 5), NUT, {
          bone: hand,
          at: [top.x + dx, top.y + dy, top.z + dz],
          flat: true,
        });
      }
    }
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.1;
    const leg = b.chain(
      `leg${side}`,
      polyline([
        [s * 0.09, 0.28, 0],
        [s * 0.11, 0.16, 0.04],
        [x, 0.045, 0],
        [x, 0.04, 0.09],
      ]),
      {
        parent: hips,
        role: "leg",
        names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
        contact: [x, 0, 0.06],
      },
    );
    const legTube = b.sweep(leg, [0.085, 0.068, 0.05, 0.043, 0.04], { color: fur, name: `leg${side}` });
    b.cards(
      b.surface(legTube).scatter(26, { rng: rng(50 + s), minDist: 0.03, filter: (hh) => hh.at.y > 0.1 }),
      tuft,
      { size: [0.035, 0.045], lean: 60, bend: 20, vary: 0.2, rng: rng(52 + s), color: fur },
    );
    const foot = leg.tip!;
    for (let k = -1.5; k <= 1.5; k += 1) {
      b.spike([x + k * 0.017, 0.032, 0.112], [0, -0.35, 1], 0.03, 0.006, { color: CLAW, bone: foot, sides: 5 });
    }
  }

  return b.root;
}
