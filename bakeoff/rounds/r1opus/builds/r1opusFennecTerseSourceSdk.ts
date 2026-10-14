import * as THREE from "three";
import {
  createBuilder,
  polyline,
  catmull,
  paint,
  countershade,
  mottle,
  gradient,
  svg,
  frame,
  aim,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "Fennec Fox",
  description:
    "A stylized low-poly fennec fox in a rigging rest pose: huge flattened ears with pink inners and white tufts, big dark eyes, a cream face with tear streaks, separate jaws and a bushy black-tipped tail.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "fennecFox", paintSize: 1024 });

  // ---------- palette ----------
  const SAND_A = "#e9c18a";
  const SAND_B = "#d9a96f";
  const BELLY = "#f8eedb";
  const WHITE = "#fbf6ec";
  const STREAK = "#8f5f37";
  const DARK = "#2b1e17";
  const PINK = "#eaa79a";
  const NOSE = "#1c1412";

  const COAT = countershade(mottle(SAND_A, SAND_B, { size: 0.04, seed: 3, contrast: 0.8 }), BELLY, {
    level: -0.25,
    soft: 0.3,
  });

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0.19, -0.1] });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.19, -0.1],
      [0, 0.195, -0.02],
      [0, 0.2, 0.06],
      [0, 0.21, 0.11],
    ]),
    { parent: "root", names: ["hips", "spine1", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    polyline([
      [0, 0.21, 0.11],
      [0, 0.25, 0.15],
      [0, 0.28, 0.17],
    ]),
    { parent: "chest", names: ["neck1", "neck2"], role: "neck" },
  );
  b.joint("head", { parent: "neck2", at: [0, 0.28, 0.17], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.275, 0.195], dir: [0, -0.15, 1], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.185, -0.12],
      [0, 0.165, -0.2],
      [0, 0.14, -0.28],
      [0, 0.12, -0.36],
      [0, 0.108, -0.42],
    ]),
    { parent: "hips", names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---------- body ----------
  b.loft(
    [
      { at: [0, 0.19, -0.135], w: 0.07, h: 0.07 },
      { at: [0, 0.195, -0.09], w: 0.1, h: 0.1 },
      { at: [0, 0.19, -0.01], w: 0.092, h: 0.092 },
      { at: [0, 0.2, 0.07], w: 0.1, h: 0.11 },
      { at: [0, 0.215, 0.12], w: 0.075, h: 0.085 },
    ],
    { color: COAT, bone: spine, name: "body" },
  );
  b.sweep(neck, [0.037, 0.031, 0.027], { color: COAT, name: "neckFur" });

  // haunches
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.034, 10, 8), COAT, {
      at: [s * 0.038, 0.17, -0.085],
      bone: "hips",
      scale: [0.75, 1.1, 1.15],
      name: s > 0 ? "haunchL" : "haunchR",
    });
  }

  // ---------- legs ----------
  const leg = (side: number, front: boolean) => {
    const S = side > 0 ? "L" : "R";
    const x = side * (front ? 0.045 : 0.05);
    const pts: number[][] = front
      ? [
          [x, 0.17, 0.085],
          [x + side * 0.002, 0.1, 0.07],
          [x + side * 0.003, 0.035, 0.085],
          [x + side * 0.003, 0.012, 0.1],
        ]
      : [
          [x, 0.17, -0.09],
          [x + side * 0.002, 0.11, -0.055],
          [x + side * 0.002, 0.05, -0.11],
          [x + side * 0.002, 0.012, -0.092],
        ];
    const names = front
      ? [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `forePaw${S}`]
      : [`hip${S}`, `knee${S}`, `hock${S}`, `hindPaw${S}`];
    const chain = b.chain(`leg${front ? "F" : "H"}${S}`, polyline(pts), {
      parent: front ? "chest" : "hips",
      names,
      role: "leg",
    });
    b.sweep(chain, front ? [0.02, 0.014, 0.011, 0.01] : [0.026, 0.017, 0.012, 0.01], { color: COAT });
    const end = pts[3];
    const pawZ = end[2] + 0.008;
    b.part(new THREE.SphereGeometry(0.014, 8, 6), "#e2b67d", {
      at: [end[0], 0.0075, pawZ],
      bone: names[3],
      scale: [1, 0.55, 1.35],
      name: `paw${front ? "F" : "H"}${S}`,
    });
    for (let k = -1; k <= 1; k++) {
      b.part(new THREE.SphereGeometry(0.0045, 6, 4), "#d4a46c", {
        at: [end[0] + k * 0.0075, 0.005, pawZ + 0.016 - Math.abs(k) * 0.003],
        bone: names[3],
        scale: [1, 0.8, 1.2],
      });
    }
  };
  for (const s of [1, -1]) {
    leg(s, true);
    leg(s, false);
  }

  // ---------- tail ----------
  b.sweep(tail, [0.016, 0.027, 0.033, 0.03, 0.017], {
    bands: [
      [0.8, COAT],
      [1, DARK],
    ],
    sectors: [[-35, 35, "#7a5236", 0.18, 0.3]],
    name: "tail",
  });

  // ---------- head ----------
  const segDist = (p: THREE.Vector3, a: THREE.Vector3, c: THREE.Vector3) => {
    const ab = c.clone().sub(a);
    const t = Math.min(Math.max(p.clone().sub(a).dot(ab) / ab.lengthSq(), 0), 1);
    return a.clone().addScaledVector(ab, t).distanceTo(p);
  };
  const SA = new THREE.Vector3(0.021, 0.3, 0.214);
  const SB = new THREE.Vector3(0.015, 0.284, 0.232);
  const HEAD = paint((p, n) => {
    const q = new THREE.Vector3(Math.abs(p.x), p.y, p.z);
    if (n.z > 0 && segDist(q, SA, SB) < 0.0028) return STREAK;
    if (p.y < 0.289 && p.z > 0.185) return WHITE;
    if (p.z > 0.205 && Math.abs(p.x) < 0.006 && p.y > 0.29) return "#d8a56c";
    return COAT;
  });

  const skullC = new THREE.Vector3(0, 0.3, 0.175);
  const skull = b.part(new THREE.SphereGeometry(0.045, 12, 9), HEAD, {
    at: skullC,
    bone: "head",
    scale: [1.05, 0.9, 1],
    name: "skull",
  });
  // upper muzzle
  b.sweep(
    [
      [0, 0.291, 0.195],
      [0, 0.287, 0.252],
    ],
    (t) => [0.021 - 0.012 * t, 0.014 - 0.007 * t],
    { color: HEAD, bone: "head", name: "muzzle" },
  );
  // lower jaw
  b.sweep(
    [
      [0, 0.276, 0.198],
      [0, 0.274, 0.243],
    ],
    (t) => [0.014 - 0.007 * t, 0.007 - 0.003 * t],
    { color: WHITE, bone: "jaw", name: "lowerJaw" },
  );
  b.part(new THREE.SphereGeometry(0.0072, 8, 6), NOSE, {
    at: [0, 0.29, 0.254],
    bone: "head",
    scale: [1.2, 0.85, 0.9],
    name: "nose",
  });
  b.part(new THREE.BoxGeometry(0.012, 0.0025, 0.03), "#3a2420", {
    at: [0, 0.2805, 0.225],
    bone: "head",
    name: "mouthLine",
  });

  // eyes
  const skin = b.surface(skull);
  const hitAt = (az: number, el: number, side: number) => {
    const A = (az * Math.PI) / 180;
    const E = (el * Math.PI) / 180;
    const d = new THREE.Vector3(side * Math.sin(A) * Math.cos(E), Math.sin(E), Math.cos(A) * Math.cos(E));
    return skin.ray(skullC.clone().addScaledVector(d, 0.3), d.clone().negate()) ?? skin.nearest(skullC.clone().addScaledVector(d, 0.05));
  };
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const h = hitAt(36, 10, s);
    b.stick(new THREE.SphereGeometry(0.0115, 10, 8), "#5a3a26", h, { embed: 0.55, bone: "head", name: `eyeRim${S}` });
    b.stick(new THREE.SphereGeometry(0.0095, 10, 8), "#16100d", h, { embed: 0.35, bone: "head", name: `eye${S}` });
    b.part(new THREE.SphereGeometry(0.0024, 6, 4), "#ffffff", {
      at: h.at.clone().addScaledVector(h.n, 0.0112).add(new THREE.Vector3(0, 0.003, 0)),
      bone: "head",
      name: `eyeGlint${S}`,
    });
    // whiskers
    for (let k = 0; k < 3; k++) {
      b.rod(
        [s * 0.011, 0.285 + k * 0.003, 0.236],
        [s * 0.075, 0.282 + k * 0.009, 0.225 - k * 0.006],
        0.0007,
        { bone: "head", sides: 3, color: "#3a2a22" },
      );
    }
  }

  // ---------- ears ----------
  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 64 C 5 44 3 22 9 0 C 13 18 15 20 16 6 C 17 20 19 18 23 0 C 29 22 27 44 16 64 Z" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const base = new THREE.Vector3(s * 0.024, 0.326, 0.165);
    const dir = new THREE.Vector3(s * 0.45, 1, -0.12).normalize();
    b.joint(`ear${S}`, { parent: "head", at: base, dir });
    const q = aim(dir, [0, 0, 1]);
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    const side = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
    const H = 0.125;
    const tip = base.clone().addScaledVector(dir, H);
    b.part(new THREE.ConeGeometry(0.035, H, 6), gradient(SAND_A, "#c89160", base, tip), {
      at: base.clone().addScaledVector(dir, H / 2),
      quat: q,
      scale: [1, 1, 0.33],
      bone: `ear${S}`,
      flat: true,
      name: `ear${S}`,
    });
    b.part(new THREE.ConeGeometry(0.027, H * 0.82, 6), PINK, {
      at: base.clone().addScaledVector(dir, H * 0.41 + 0.004).addScaledVector(fwd, 0.0045),
      quat: q,
      scale: [1, 1, 0.2],
      bone: `ear${S}`,
      flat: true,
      name: `earInner${S}`,
    });
    const frames = [];
    for (let k = 0; k < 4; k++) {
      for (const e of [1, -1]) {
        const at = base
          .clone()
          .addScaledVector(dir, 0.008 + k * 0.012)
          .addScaledVector(side, e * (0.017 - k * 0.003))
          .addScaledVector(fwd, 0.007);
        frames.push(frame(at, fwd.clone().addScaledVector(side, e * 0.5)));
      }
    }
    b.cards(frames, tuft, {
      size: [0.011, 0.028],
      lean: 55,
      flow: dir,
      bone: `ear${S}`,
      color: WHITE,
      vary: 0.2,
      spin: 10,
      rng: rng(11 + s),
      mirror: s < 0,
    });

    // cheek ruff
    const cheek = [hitAt(78, -18, s), hitAt(95, -5, s), hitAt(65, -35, s), hitAt(100, -28, s)];
    b.cards(cheek, tuft, {
      size: [0.02, 0.032],
      lean: 50,
      flow: [s * 0.3, -0.4, -1],
      bone: "head",
      color: WHITE,
      vary: 0.2,
      rng: rng(21 + s),
      mirror: s < 0,
    });
  }

  // chest bib tufts
  const bibSkin = b.surface(neck.joints[0]);
  const bib = [];
  for (let k = 0; k < 5; k++) {
    const x = (k - 2) * 0.012;
    const from = new THREE.Vector3(x, 0.22 + Math.abs(k - 2) * 0.006, 0.4);
    const h = bibSkin.ray(from, [0, -0.25, -1]);
    if (h) bib.push(h);
  }
  if (bib.length)
    b.cards(bib, tuft, {
      size: [0.02, 0.03],
      lean: 60,
      flow: [0, -1, 0.1],
      color: BELLY,
      vary: 0.2,
      rng: rng(31),
    });

  return b.root;
}
