import * as THREE from "three";
import { createBuilder, catmull, polyline, mottle } from "../../../../src/index";

export const meta = {
  name: "Flamingo",
  description:
    "A stylized greater flamingo standing on two long legs, with an S-curved neck, a bent two-part beak, folded wings with black flight feathers, and a full rigged skeleton.",
};

export default function build() {
  const b = createBuilder({ name: "flamingo" });

  const PINK = "#f58aa0";
  const PINK_LIGHT = "#f9a9b9";
  const PINK_DEEP = "#e8607e";
  const LEG = "#e9708a";
  const KNEE = "#d65778";
  const BEAK = "#f6dcd2";
  const BLACK = "#241f24";
  const EYE = "#f2d54a";

  const coat = mottle(PINK, PINK_LIGHT, { size: 0.12, seed: 3, contrast: 0.8 });
  const neckPaint = mottle(PINK_LIGHT, "#fbbfca", { size: 0.1, seed: 5, contrast: 0.7 });

  // ---------- skeleton: root + spine ----------
  b.joint("root", { at: [0, 0.75, 0] });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.78, -0.15],
      [0, 0.8, 0.0],
      [0, 0.84, 0.18],
    ]),
    { role: "spine", parent: "root", names: ["spine1", "spine2"] },
  );
  const tail = b.chain(
    "tail",
    polyline([
      [0, 0.8, -0.25],
      [0, 0.77, -0.4],
      [0, 0.72, -0.52],
    ]),
    { role: "tail", parent: "spine1", names: ["tail1", "tail2"] },
  );

  // ---------- body ----------
  b.part(new THREE.SphereGeometry(1, 12, 9), coat, {
    at: [0, 0.8, -0.02], scale: [0.2, 0.19, 0.31], bone: "spine1", name: "body",
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
    at: [0, 0.84, 0.17], scale: [0.15, 0.15, 0.15], bone: "spine2", name: "breast",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), PINK_DEEP, {
    at: [0, 0.78, -0.27], scale: [0.11, 0.1, 0.12], bone: "tail1", name: "rump",
  });

  // tail feather fan
  const featherGeo = new THREE.BoxGeometry(0.05, 0.012, 0.22);
  [-24, -12, 0, 12, 24].forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const d = new THREE.Vector3(Math.sin(a), -0.1, -Math.cos(a)).normalize();
    const root = new THREE.Vector3(0, 0.78, -0.3);
    const c = root.clone().addScaledVector(d, 0.1);
    b.part(featherGeo, i % 2 ? PINK_LIGHT : PINK, {
      at: c, dir: d, axis: "z", bone: "tail1", name: "tailFeather",
    });
  });

  // ---------- neck & head ----------
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.93, 0.2],
      [0, 1.02, 0.34],
      [0, 1.16, 0.37],
      [0, 1.3, 0.3],
      [0, 1.4, 0.33],
      [0, 1.45, 0.41],
    ]),
    { role: "neck", parent: "spine2", count: 5 },
  );
  b.sweep(neck, [0.05, 0.032, 0.026, 0.023, 0.022, 0.025], { color: neckPaint, name: "neck" });

  const head = b.joint("head", { parent: neck, at: [0, 1.45, 0.41], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.44, 0.45], dir: [0, 0, 1], role: "jaw" });

  b.part(new THREE.SphereGeometry(1, 10, 8), PINK_LIGHT, {
    at: [0, 1.455, 0.43], scale: [0.04, 0.04, 0.05], bone: head, name: "skull",
  });
  // beak: upper (black tip, bent down) and lower jaw
  b.sweep(
    catmull([
      [0, 1.46, 0.46],
      [0, 1.452, 0.53],
      [0, 1.425, 0.59],
      [0, 1.385, 0.625],
    ]),
    [0.027, 0.024, 0.016, 0.006],
    { bands: [[0.5, BEAK], [1, BLACK]], bone: head, name: "upperBeak", sides: 6, caps: "round" },
  );
  b.sweep(
    catmull([
      [0, 1.438, 0.46],
      [0, 1.434, 0.53],
      [0, 1.412, 0.585],
      [0, 1.378, 0.615],
    ]),
    [0.02, 0.018, 0.012, 0.004],
    { bands: [[0.5, BEAK], [1, BLACK]], bone: jaw, name: "lowerBeak", sides: 6, caps: "round" },
  );
  // eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.013, 8, 6), EYE, {
      at: [0.035 * s, 1.465, 0.44], bone: head, name: "eye",
    });
    b.part(new THREE.SphereGeometry(0.007, 6, 5), BLACK, {
      at: [0.045 * s, 1.466, 0.442], bone: head, name: "pupil",
    });
  }

  // ---------- wings ----------
  const wingOutline: [number, number][] = [
    [-0.02, 0.06], [0.12, 0.1], [0.3, 0.07], [0.46, 0.0], [0.32, -0.07], [0.12, -0.12], [-0.02, -0.07],
  ];
  const wingBlack: [number, number][] = [
    [0.28, 0.072], [0.46, 0.0], [0.32, -0.07], [0.22, -0.095],
  ];
  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    const wing = b.chain(
      `wing${S}`,
      polyline([
        [0.2 * s, 0.88, 0.13],
        [0.18 * s, 0.86, -0.12],
        [0.14 * s, 0.82, -0.38],
      ]),
      { role: "wing", parent: "spine2", names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`] },
    );
    const wdir = new THREE.Vector3(-0.15 * s, -0.1, -1).normalize();
    b.extrude(wingOutline, {
      color: PINK_LIGHT, at: [0.2 * s, 0.88, 0.13], x: wdir, y: [0, 1, 0], thickness: 0.014,
      bevel: 0.004, smoothing: 1, bone: wing.joints[0], name: `wing${S}`,
    });
    b.extrude(wingBlack, {
      color: BLACK, at: [0.2 * s, 0.88, 0.13], x: wdir, y: [0, 1, 0], thickness: 0.02,
      bone: wing.joints[1], name: `wingTip${S}`,
    });

    const leg = b.chain(
      `leg${S}`,
      polyline([
        [0.07 * s, 0.7, -0.02],
        [0.075 * s, 0.5, 0.05],
        [0.07 * s, 0.3, 0.0],
        [0.07 * s, 0.02, 0.05],
      ]),
      {
        role: "leg", parent: "root",
        names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      },
    );
    b.sweep(leg, 0.012, { color: LEG, name: `leg${S}`, sides: 6 });
    b.part(new THREE.SphereGeometry(0.021, 8, 6), KNEE, { at: [0.075 * s, 0.5, 0.05], bone: leg.joints[1], name: "kneeBall" });
    b.part(new THREE.SphereGeometry(0.02, 8, 6), KNEE, { at: [0.07 * s, 0.3, 0.0], bone: leg.joints[2], name: "ankleBall" });
    b.part(new THREE.SphereGeometry(0.06, 8, 6), PINK, {
      at: [0.07 * s, 0.68, 0.0], scale: [0.9, 1.4, 1], bone: leg.joints[0], name: "thigh",
    });

    const foot = leg.tip!;
    const fp = new THREE.Vector3(0.07 * s, 0.009, 0.05);
    const tips = [
      { n: "Mid", p: new THREE.Vector3(0.07 * s, 0.009, 0.17) },
      { n: "In", p: new THREE.Vector3(0.07 * s - s * 0.055, 0.009, 0.145) },
      { n: "Out", p: new THREE.Vector3(0.07 * s + s * 0.055, 0.009, 0.145) },
    ];
    const toeJoints = tips.map((t) =>
      b.joint(`toe${t.n}${S}`, { parent: foot, at: fp, aim: t.p, role: "digit" }),
    );
    tips.forEach((t, i) => {
      b.capsule(fp, t.p, 0.009, { color: LEG, bone: toeJoints[i], sides: 5, name: `toe${t.n}${S}` });
    });
    b.slab(
      [
        [0.07 * s, 0.004, 0.05],
        [tips[1].p.x, 0.004, tips[1].p.z],
        [tips[0].p.x, 0.004, tips[0].p.z],
        [tips[2].p.x, 0.004, tips[2].p.z],
      ],
      { color: PINK_DEEP, thickness: 0.006, bone: toeJoints[0], name: `web${S}` },
    );
  }

  // keep references used
  void spine;
  void tail;

  return b.root;
}
