import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  bezier,
  limb,
  lerp,
  paint,
  scales,
  spots,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Baby Dragon",
  description:
    "A chubby teal baby dragon in a rest pose: big amber eyes, banded horns, coral wings spread wide, belly plates and a spade-tipped tail.",
};

export default function build() {
  const b = createBuilder({ name: "babyDragon" });

  // ---------- palette ----------
  const BODY = "#3fb6a8";
  const BODY_DK = "#257a78";
  const SPOT = "#7fe0c8";
  const BELLY = "#f8dc9e";
  const BELLY_LN = "#e2b56c";
  const WING = "#ff8a6b";
  const WING_MID = "#ff6f5e";
  const WING_TIP = "#e8506a";
  const SPINE = "#ff9a3c";
  const SPINE_TIP = "#ffd25a";
  const HORN = "#fff2cf";
  const HORN_DK = "#e9c98a";
  const EYE_W = "#fffbea";
  const IRIS = "#ffb000";
  const PUPIL = "#1a1030";
  const SHINE = "#ffffff";
  const BLUSH = "#ff8fa3";
  const DARK = "#183c3e";

  const skin = spots(scales(BODY, BODY_DK, { size: 0.028 }), SPOT, { size: 0.14, amount: 0.22, seed: 3 });
  const belly = paint((_p, _n, s) => ((s[0] * 36) % 1 < 0.14 ? BELLY_LN : BELLY));
  const hornPaint = paint((_p, _n, s) => (Math.floor(s[0] * 4) % 2 ? HORN_DK : HORN));
  const wingPaint = paint((_p, _n, s) => (s[0] > 0.8 ? WING_TIP : s[0] > 0.52 ? WING_MID : WING));

  // ---------- body curve: tail tip -> hips -> chest -> neck top ----------
  const HIPS: [number, number, number] = [0, 0.33, -0.12];
  const CHEST: [number, number, number] = [0, 0.39, 0.16];
  const body = catmull([
    [0, 0.42, -1.08],
    [0, 0.28, -0.95],
    [0, 0.2, -0.75],
    [0, 0.24, -0.5],
    [0, 0.3, -0.28],
    HIPS,
    [0, 0.35, 0.06],
    CHEST,
    [0, 0.48, 0.27],
    [0, 0.62, 0.33],
  ]);

  const hips = b.joint("hips", { at: HIPS, role: "spine" });
  const tHips = body.closestT(hips.at);
  const tChest = body.closestT(CHEST);

  const spine = b.chain("spine", body.slice(tHips, tChest), { parent: hips, count: 2, role: "spine" });
  const neck = b.chain("neck", body.slice(tChest, 1), { parent: spine.joints[1], count: 2, role: "neck" });
  const tail = b.chain("tail", body.slice(tHips, 0), { parent: hips, count: 6, role: "tail" });

  const radius = (t: number): [number, number] => {
    let r: number;
    if (t <= tHips) {
      const u = t / tHips;
      r = 0.014 + 0.105 * Math.pow(u, 1.6);
    } else if (t <= tChest) {
      const u = (t - tHips) / (tChest - tHips);
      r = 0.119 + 0.02 * Math.sin(Math.PI * u) - 0.01 * u;
    } else {
      const u = (t - tChest) / (1 - tChest);
      r = 0.109 - 0.05 * Math.pow(u, 0.7);
    }
    return [r * 0.95, r * 1.05];
  };

  const bodySweep = b.sweep(body, radius, {
    bone: [tail, hips, spine, neck],
    color: skin,
    sectors: [[120, 240, belly, 0.1, 1]],
    sides: 10,
    name: "body",
  });

  // dorsal plates
  b.along(
    bodySweep,
    17,
    (at) => {
      const k = 0.4 + 0.6 * Math.sin(Math.PI * at.t);
      const h = 0.055 * k;
      const plate: OutlinePoint[] = [
        [-0.03 * k, 0],
        [0.022 * k, 0],
        [-0.03 * k, h, "sharp"],
      ];
      b.extrude(plate, {
        at: at.moved(at.at.clone().addScaledVector(at.n, -0.006)),
        x: at.tangent,
        y: at.n,
        thickness: [0.012 * k + 0.004, 0.003],
        color: paint((_p, _n, s) => (s[1] > h * 0.55 ? SPINE_TIP : SPINE)),
        group: "plates",
      });
    },
    { from: 0.05, to: 0.93 },
  );

  // spade tail tip
  const tailTip = tail.joints[tail.joints.length - 1];
  const tx = body.tangentAt(0).clone().negate().normalize();
  const ty = new THREE.Vector3(0, 1, 0).addScaledVector(tx, -tx.y).normalize();
  const spade: OutlinePoint[] = [
    [-0.03, 0],
    [0.05, 0.06, "sharp"],
    [0.035, 0.015],
    [0.13, 0, "sharp"],
    [0.035, -0.015],
    [0.05, -0.06, "sharp"],
  ];
  b.extrude(spade, {
    at: body.at(0),
    x: tx,
    y: ty,
    thickness: 0.014,
    bevel: 0.003,
    color: SPINE,
    bone: tailTip,
    name: "tailSpade",
  });

  // ---------- head ----------
  const head = b.joint("head", { parent: neck.joints[1], at: body.at(1), dir: [0, -0.15, 1], role: "head" });

  const cranium = b.part(new THREE.SphereGeometry(0.11, 10, 8).scale(1, 0.92, 1), skin, {
    bone: head,
    at: head.local({ forward: 0.03, up: 0.05 }),
    flat: true,
    name: "cranium",
  });

  b.frustumBox(head.local({ forward: 0.08, up: 0.02 }), head.local({ forward: 0.2, down: 0.005 }), [0.15, 0.09], [0.11, 0.06], {
    bone: head,
    color: skin,
    name: "snout",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.05, down: 0.03 }),
    aim: head.local({ forward: 0.2, down: 0.05 }),
    role: "jaw",
  });
  b.frustumBox(head.local({ forward: 0.04, down: 0.04 }), head.local({ forward: 0.19, down: 0.05 }), [0.12, 0.04], [0.09, 0.03], {
    bone: jaw,
    color: BELLY,
    name: "lowerJaw",
  });

  // nose horn
  b.spike(head.local({ forward: 0.13, up: 0.035 }), [0, 1, 0.4], 0.035, 0.013, { bone: head, color: HORN, sides: 6 });

  const skull = b.surface(cranium);

  for (const s of [1, -1]) {
    // nostrils
    b.part(new THREE.SphereGeometry(0.009, 6, 4), DARK, {
      bone: head,
      at: head.local({ forward: 0.195, up: 0.024, left: s * 0.026 }),
    });
    // little fangs
    b.spike(head.local({ forward: 0.175, down: 0.02, left: s * 0.047 }), [0, -1, 0.1], 0.022, 0.007, {
      bone: head,
      color: HORN,
      sides: 6,
    });

    // big eyes
    const eDir: [number, number, number] = [s * 0.55, 0.12, 0.83];
    const eye = b.part(new THREE.SphereGeometry(0.04, 10, 8), EYE_W, {
      bone: head,
      at: head.local({ forward: 0.105, up: 0.07, left: s * 0.065 }),
      dir: eDir,
      name: `eye${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.027, 10, 8), IRIS, { bone: head, at: eye.local([0, 0.019, 0]), dir: eDir });
    b.part(new THREE.SphereGeometry(0.012, 8, 6).scale(0.45, 0.4, 1.5), PUPIL, {
      bone: head,
      at: eye.local([0, 0.044, 0]),
      dir: eDir,
    });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), SHINE, { bone: head, at: eye.local([0.008, 0.044, 0.013]), dir: eDir });

    // cheek blush
    const cheek = skull.around(cranium.at).at(s * 58, -18);
    if (cheek) b.stick(new THREE.CylinderGeometry(0.024, 0.024, 0.004, 10), BLUSH, cheek, { embed: 0.5 });

    // banded horns sweeping back
    b.sweep(
      bezier(
        head.local({ left: s * 0.055, up: 0.13 }),
        head.local({ left: s * 0.07, up: 0.19, back: 0.06 }),
        head.local({ left: s * 0.085, up: 0.2, back: 0.15 }),
      ),
      [0.022, 0],
      { bone: head, color: hornPaint, caps: { start: "flat", end: "point" }, sides: 7 },
    );

    // ear frills
    const frill: OutlinePoint[] = [
      [0, 0.02],
      [0.1, 0.07, "sharp"],
      [0.07, 0.02],
      [0.12, 0, "sharp"],
      [0.07, -0.02],
      [0.09, -0.05, "sharp"],
      [0.02, -0.025],
    ];
    b.extrude(frill, {
      at: head.local({ left: s * 0.09, up: 0.06, back: 0.02 }),
      x: [s * 0.7, 0, -0.7],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.003,
      color: WING,
      bone: head,
    });
  }

  // ---------- legs ----------
  const paw = (tip: THREE.Object3D | any, x: number, z: number) => {
    b.part(new THREE.SphereGeometry(0.045, 8, 6).scale(1.1, 0.65, 1.25), skin, {
      bone: tip,
      at: [x, 0.029, z + 0.02],
      flat: true,
    });
    for (const k of [-1, 0, 1]) {
      b.spike([x + k * 0.026, 0.022, z + 0.065], [k * 0.25, -0.25, 1], 0.028, 0.009, {
        bone: tip,
        color: HORN,
        sides: 6,
      });
    }
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // front legs (elbow back)
    const fFoot: [number, number, number] = [s * 0.13, 0.06, 0.2];
    const fp = limb([s * 0.085, 0.33, 0.14], fFoot, [0.15, 0.15], [0, 0, -1]);
    const front = b.chain(`front${S}`, fp, {
      parent: spine.joints[1],
      names: [`shoulder${S}`, `elbow${S}`, `frontFoot${S}`],
      role: "leg",
      contact: [fFoot[0], 0, fFoot[2] + 0.02],
    });
    b.sweep(front, [0.05, 0.033], { color: skin, sides: 8 });
    paw(front.tip, fFoot[0], fFoot[2]);

    // hind legs (knee forward)
    const hFoot: [number, number, number] = [s * 0.13, 0.06, -0.08];
    const hp = limb([s * 0.085, 0.3, -0.12], hFoot, [0.14, 0.13], [0, 0, 1]);
    const hind = b.chain(`hind${S}`, hp, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hindFoot${S}`],
      role: "leg",
      contact: [hFoot[0], 0, hFoot[2] + 0.02],
    });
    b.sweep(hind, [0.058, 0.035], { color: skin, sides: 8 });
    b.part(new THREE.SphereGeometry(0.075, 8, 6), skin, {
      bone: hind.joints[0],
      at: [s * 0.1, 0.27, -0.12],
      flat: true,
      name: `haunch${S}`,
    });
    paw(hind.tip, hFoot[0], hFoot[2]);
  }

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const P0 = new THREE.Vector3(s * 0.07, 0.45, 0.08);
    const P1 = new THREE.Vector3(s * 0.24, 0.54, 0.03);
    const P2 = new THREE.Vector3(s * 0.4, 0.6, 0.06);

    const arm = b.chain(`wing${S}`, polyline([P0, P1, P2]), {
      parent: spine.joints[1],
      names: [`wingShoulder${S}`, `wingElbow${S}`, `wingWrist${S}`],
      role: "wing",
    });
    b.sweep(arm, [0.028, 0.016], { color: BODY_DK, sides: 7 });
    const wrist = arm.tip!;

    // thumb claw
    b.spike(P2, [s * 0.2, 1, 0.5], 0.04, 0.011, { bone: wrist, color: HORN, sides: 6 });

    const tips = [
      new THREE.Vector3(s * 0.66, 0.7, 0.0),
      new THREE.Vector3(s * 0.62, 0.5, -0.16),
      new THREE.Vector3(s * 0.46, 0.38, -0.26),
    ];
    const fingers = tips.map((tip, i) => {
      const m = lerp(P2, tip, 0.5);
      m.y += 0.02;
      const f = b.chain(`wing${i + 1}${S}`, polyline([P2, m, tip]), {
        parent: wrist,
        names: [`wingFinger${i + 1}a${S}`, `wingFinger${i + 1}b${S}`],
        role: "digit",
      });
      b.sweep(f, [0.013, 0.005], { color: BODY_DK, caps: { start: "round", end: "point" }, sides: 6 });
      return f;
    });

    b.membrane(fingers[0], fingers[1], { color: wingPaint, thickness: 0.006, scallop: 0.12 });
    b.membrane(fingers[1], fingers[2], { color: wingPaint, thickness: 0.006, scallop: 0.12 });
    b.membrane(fingers[2], polyline([P0, new THREE.Vector3(s * 0.09, 0.4, -0.16)]), {
      color: wingPaint,
      thickness: 0.006,
      scallop: 0.1,
      bone: arm.joints[0],
    });
  }

  return b.root;
}
