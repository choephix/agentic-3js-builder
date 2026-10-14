import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  limb,
  mottle,
  stripes,
  countershade,
  gradient,
  paint,
} from "../../../../src/index";

export const meta = {
  name: "Elephant Calf",
  description:
    "A gentle African elephant calf with dusty slate-grey wrinkled skin, big pink-flushed ears, a curling trunk, baby tusks, long lashes and padded feet.",
};

export default function build() {
  const b = createBuilder({ name: "elephantCalf" });

  const DARK = "#3b322f";
  const IVORY = "#efe6d0";
  const NAIL = "#e9dccb";
  const BROWN = "#4b2c1a";
  const HAIR = "#4a413d";
  const PINK = mottle("#cf928e", "#b87b7a", { size: 0.08 });

  // Skin: wrinkled, dusty and reddish on top, lighter belly
  const base = mottle("#8b8581", "#a77a66", { size: 0.14, contrast: 0.8 });
  const wrinkled = stripes(base, "#6d6662", { size: 0.05, axis: "z", wobble: 0.5 });
  const coat = countershade(wrinkled, "#a18f84", { level: -0.1 });
  const legCoat = gradient(coat, "#a8795f", [0, 0.35, 0], [0, 0.04, 0]);

  // ---------- Skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.66, -0.35], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.66, -0.35],
      [0, 0.69, -0.05],
      [0, 0.7, 0.25],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.7, 0.25],
      [0, 0.74, 0.4],
      [0, 0.76, 0.5],
    ]),
    { parent: spine.joints[1], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.76, 0.5],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.08, down: 0.1 }),
    aim: head.local({ forward: 0.22, down: 0.14 }),
    role: "jaw",
  });

  // ---------- Body ----------
  const bodyPath = catmull([
    [0, 0.68, -0.55],
    [0, 0.68, -0.2],
    [0, 0.7, 0.2],
    [0, 0.74, 0.45],
  ]);
  const prof = (t: number) => Math.sin(Math.PI * (0.1 + 0.8 * t));
  b.sweep(bodyPath, (t) => [0.15 + 0.12 * prof(t), 0.15 + 0.17 * prof(t)], {
    bone: [spine, neck],
    color: coat,
    sides: 10,
  });

  // ---------- Head ----------
  const skull = b.part(new THREE.SphereGeometry(0.2, 12, 9), coat, {
    bone: head,
    at: head.local({ forward: 0.06, up: 0.04 }),
    scale: [0.92, 1, 1.05],
  });
  b.part(new THREE.SphereGeometry(0.13, 10, 8), coat, {
    bone: head,
    at: head.local({ forward: 0.03, up: 0.14 }),
  });
  b.part(new THREE.SphereGeometry(0.12, 10, 7), coat, {
    bone: head,
    at: head.local({ forward: 0.2, down: 0.02 }),
    scale: [1.1, 0.9, 1],
  });
  // lower jaw
  b.part(new THREE.BoxGeometry(0.14, 0.05, 0.14), coat, {
    bone: jaw,
    at: head.local({ forward: 0.12, down: 0.16 }),
  });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.1), "#b86e6a", {
    bone: jaw,
    at: head.local({ forward: 0.12, down: 0.135 }),
  });

  // tuft of bristly hair on the crown
  const crown = b.surface(skull).scatter(18, {
    rng: rng(2),
    minDist: 0.05,
    filter: (h) => h.n.y > 0.5,
  });
  for (const h of crown) b.stick(new THREE.ConeGeometry(0.009, 0.055, 4), HAIR, h, { embed: 0.3 });

  // ---------- Trunk ----------
  const trunkPts: number[][] = [
    [0, 0.72, 0.7],
    [0, 0.54, 0.8],
    [0, 0.38, 0.86],
    [0, 0.27, 0.98],
    [0, 0.25, 1.12],
    [0, 0.31, 1.2],
  ];
  const trunk = b.chain("trunk", catmull(trunkPts), { parent: head, count: 6, role: "tentacle" });
  const trunkR = (t: number) => 0.09 - 0.055 * t;
  b.sweep(trunk, trunkR, { color: coat, sides: 8 });
  for (let i = 1; i <= 8; i++) {
    const t = i / 9;
    const p = trunk.at(t);
    b.part(new THREE.TorusGeometry(trunkR(t) * 0.98, 0.007, 4, 10), "#716964", {
      at: p.at,
      bone: p.bone ?? undefined,
      dir: p.tangent,
      axis: "z",
    });
  }
  const tp = trunk.at(1);
  b.part(new THREE.SphereGeometry(0.022, 6, 5), "#7d7570", {
    at: [0, 0.335, 1.2],
    bone: trunk.joints[trunk.joints.length - 1],
  });
  void tp;

  // ---------- Tusks ----------
  for (const s of [1, -1]) {
    const base = head.local({ left: s * 0.075, forward: 0.17, down: 0.09 });
    b.spike(base, [s * 0.12, -0.35, 0.9], 0.11, 0.022, { color: IVORY, bone: head, sides: 6 });
  }

  // ---------- Eyes ----------
  for (const s of [1, -1]) {
    const eyeAt = head.local({ left: s * 0.165, forward: 0.12, up: 0.1 });
    const d = new THREE.Vector3(s * 0.9, 0.15, 0.4).normalize();
    const eye = b.part(new THREE.SphereGeometry(0.03, 8, 6), BROWN, {
      bone: head,
      at: eyeAt,
      dir: d.toArray() as number[],
    });
    const sp = eyeAt.clone().addScaledVector(d, 0.026).add(new THREE.Vector3(0, 0.01, 0));
    b.part(new THREE.SphereGeometry(0.009, 5, 4), "#ffffff", { bone: head, at: sp });
    b.ring(eye, { count: 6, radius: 0.03, fromDeg: -80, toDeg: 80, tilt: 35 }, (lash) =>
      b.spike(lash, lash, 0.05, 0.004, { color: DARK, sides: 4 }),
    );
    // brow ridge
    b.part(new THREE.SphereGeometry(0.035, 6, 4), coat, {
      bone: head,
      at: head.local({ left: s * 0.16, forward: 0.12, up: 0.14 }),
      scale: [1.1, 0.6, 1.2],
    });
  }

  // ---------- Ears ----------
  const earOutline: [number, number][] = [
    [0, 0.14],
    [0.09, 0.2],
    [0.24, 0.18],
    [0.34, 0.06],
    [0.35, -0.1],
    [0.27, -0.26],
    [0.12, -0.34],
    [0.03, -0.22],
    [0, 0],
  ];
  const earPaint = paint((_p, n, _s) => (n.z > 0.35 ? PINK : coat));
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const root = head.local({ left: s * 0.14, up: 0.08 });
    const earJ = b.joint(`ear${side}`, {
      parent: head,
      at: root,
      dir: [s, 0.05, -0.3],
      role: "hinge",
    });
    b.extrude(earOutline, {
      at: root,
      x: [s, 0, -0.35],
      y: [0, 1, 0],
      thickness: 0.016,
      bevel: 0.004,
      smoothing: 2,
      color: earPaint,
      bone: earJ,
    });
  }

  // ---------- Legs ----------
  const spineFront = spine.joints[1];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (const front of [false, true]) {
      const pre = front ? "f" : "h";
      const x = s * 0.2;
      const hz = front ? 0.12 : -0.3;
      const fz = hz;
      const pts = limb([x, 0.55, hz], [x, 0.075, fz], [0.25, 0.25], [0, 0, 1]);
      const leg = b.chain(`${pre}Leg${S}`, pts, {
        parent: front ? spineFront : hips,
        names: [`${pre}Hip${S}`, `${pre}Knee${S}`, `${pre}Ankle${S}`],
        role: "leg",
        contact: [x, 0, fz],
      });
      b.sweep(leg, [0.125, 0.09], { color: legCoat, sides: 8 });
      const foot = leg.tip ?? leg.joints[leg.joints.length - 1];
      b.part(new THREE.CylinderGeometry(0.105, 0.115, 0.07, 10), "#8f7a6c", {
        bone: foot,
        at: [x, 0.035, fz],
      });
      for (let i = 0; i < 4; i++) {
        const a = -0.7 + (1.4 * i) / 3;
        b.part(new THREE.BoxGeometry(0.036, 0.032, 0.03), NAIL, {
          bone: foot,
          at: [x + Math.sin(a) * 0.108, 0.034, fz + Math.cos(a) * 0.108],
          rotation: [0, (a * 180) / Math.PI, 0],
        });
      }
    }
  }

  // ---------- Tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.7, -0.55],
      [0, 0.62, -0.65],
      [0, 0.47, -0.68],
      [0, 0.34, -0.69],
    ]),
    { parent: hips, count: 3, role: "tail" },
  );
  b.sweep(tail, [0.036, 0.016], { color: coat, sides: 6 });
  const tailTip = tail.at(1);
  b.ring(tailTip, { count: 6, radius: 0.01, tilt: 55 }, (f) =>
    b.spike(f, f, 0.1, 0.014, { color: DARK, sides: 4 }),
  );
  b.spike(tailTip.at, [0, -1, 0], 0.11, 0.014, {
    color: DARK,
    sides: 4,
    bone: tail.joints[tail.joints.length - 1],
  });

  return b.root;
}
