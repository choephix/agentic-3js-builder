```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  bezier,
  offset,
  mottle,
  paint,
  noise,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Koala",
  description:
    "A stylized, rigged koala standing upright in a rest pose: chunky grey body with a cream bib, fluffy white-fringed ears, big leathery nose, two-thumbed hands, and a eucalyptus sprig.",
};

export default function build() {
  const b = createBuilder({ name: "koala" });

  // Palette
  const GREY = "#9a9da5";
  const GREY_D = "#6f727b";
  const CREAM = "#efe6d6";
  const WHITE = "#f8f5ef";
  const NOSE = "#2c2b31";
  const NOSE_HI = "#5a5963";
  const BLACK = "#121214";
  const EYE = "#1b1a1d";
  const SOCKET = "#55565e";
  const EAR_IN = "#dccbc6";
  const CLAW = "#2a2622";
  const STEM = "#7b4b3a";
  const LEAF = "#7fa89f";
  const RIB = "#bcd3c8";

  const fur = mottle(GREY, GREY_D, { size: 0.06, contrast: 0.5, seed: 3 });
  const bodyFur = paint((p, n) => {
    const edge = 0.085 + 0.035 * noise(p, 0.04, 5);
    return n.z > 0.25 && Math.abs(p.x) < edge && p.y > 0.12 && p.y < 0.5 ? CREAM : fur;
  });
  const headFur = paint((p, n) => (p.y < 0.585 && n.z > 0.1 ? CREAM : fur));
  const cheekFur = paint((p, n) => (Math.abs(n.x) > 0.55 && p.y < 0.67 ? WHITE : fur));

  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 64 C6 50 3 30 9 4 C12 22 14 33 16 40 C17 27 20 13 24 0 C29 22 27 46 16 64 Z" fill="#ffffff"/><path d="M16 60 C10 48 9 34 12 20 C14 34 15 44 16 52 Z" fill="#c8c8c8"/></svg>`,
    { size: 128 },
  );

  // ---------------- Skeleton ----------------
  const hips = b.joint("hips", { at: [0, 0.2, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.2, 0],
      [0, 0.34, 0.01],
      [0, 0.49, 0.01],
    ],
    { parent: hips, names: ["spine1", "chest"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.49, 0.01], aim: [0, 0.59, 0.02], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.59, 0.02], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.06, up: -0.05 }),
    dir: [0, -0.3, 1],
    role: "jaw",
  });

  // ---------------- Body ----------------
  const body = b.loft(
    [
      { at: [0, 0.1, -0.01], w: 0.2, h: 0.17 },
      { at: [0, 0.2, 0], w: 0.31, h: 0.27 },
      { at: [0, 0.32, 0.01], w: 0.31, h: 0.26 },
      { at: [0, 0.44, 0.01], w: 0.25, h: 0.21 },
      { at: [0, 0.54, 0.02], w: 0.15, h: 0.14 },
    ],
    { bone: [spine, neck], color: bodyFur, name: "body" },
  );
  // tail stub
  b.part(new THREE.SphereGeometry(0.03, 8, 6), GREY_D, { bone: hips, at: [0, 0.14, -0.1] });

  // ---------------- Head ----------------
  const skull = b.part(new THREE.SphereGeometry(0.13, 14, 10), headFur, {
    bone: head,
    at: head.local({ up: 0.04 }),
    scale: [1.15, 0.95, 0.9],
    name: "skull",
  });
  const headSurf = b.surface(skull);

  // nose
  b.part(new THREE.SphereGeometry(0.04, 12, 10), NOSE, {
    bone: head,
    at: [0, 0.598, 0.148],
    scale: [0.85, 1.25, 0.8],
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(0.012, 8, 6), NOSE_HI, {
    bone: head,
    at: [0.008, 0.627, 0.172],
    scale: [1, 1.6, 0.5],
  });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.007, 6, 4), BLACK, { bone: head, at: [s * 0.014, 0.56, 0.163] });

  // muzzle + jaw
  b.part(new THREE.SphereGeometry(0.04, 10, 8), CREAM, {
    bone: head,
    at: [0, 0.555, 0.115],
    scale: [1.35, 0.65, 0.85],
  });
  b.part(new THREE.SphereGeometry(0.035, 10, 8), CREAM, {
    bone: jaw,
    at: jaw.local({ forward: 0.045 }),
    scale: [1.25, 0.55, 1],
    name: "lowerJaw",
  });

  // eyes
  for (const s of [1, -1]) {
    const hit = headSurf.ray([s * 0.062, 0.645, 0.5], [0, 0, -1]);
    if (!hit) continue;
    b.stick(new THREE.SphereGeometry(0.024, 8, 6), SOCKET, hit, { embed: 0.7, bone: head, scale: [1.15, 0.4, 0.95] });
    b.stick(new THREE.SphereGeometry(0.017, 8, 6), EYE, hit, { embed: 0.45, bone: head });
    const g = offset(hit, hit.n, 0.016).add(new THREE.Vector3(s * 0.005, 0.006, 0));
    b.part(new THREE.SphereGeometry(0.005, 6, 4), WHITE, { bone: head, at: g });
  }

  // ears
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${L}`, {
      parent: head,
      at: [s * 0.1, 0.7, 0],
      aim: [s * 0.16, 0.72, 0],
      role: "hinge",
    });
    const c: [number, number, number] = [s * 0.155, 0.715, 0];
    b.part(new THREE.SphereGeometry(0.075, 12, 8), fur, { bone: ear, at: c, scale: [1, 1, 0.45] });
    b.part(new THREE.SphereGeometry(0.055, 10, 8), EAR_IN, {
      bone: ear,
      at: [c[0], c[1], 0.022],
      scale: [1, 1, 0.3],
    });
    const rim = b.ring(frame([c[0], c[1], 0.005], [0, 0, 1]), { count: 18, radius: 0.066 });
    b.cards(rim.items, tuft, {
      size: [0.045, 0.05],
      lean: 15,
      flow: [0, 0, 1],
      bend: 20,
      vary: 0.25,
      spin: 15,
      rng: rng(20 + s),
      color: WHITE,
      bone: ear,
    });
    // inner ear fluff
    const inner = b.ring(frame([c[0], c[1], 0.03], [0, 0, 1]), { count: 7, radius: 0.025 });
    b.cards(inner.items, tuft, {
      size: [0.03, 0.035],
      lean: 40,
      flow: [0, 0, 1],
      vary: 0.3,
      rng: rng(30 + s),
      color: WHITE,
      bone: ear,
    });
  }

  // ---------------- Arms & hands ----------------
  const limbSweeps: unknown[] = [];
  let rightHand: ReturnType<typeof b.chain> | null = null;
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const shoulder = new THREE.Vector3(s * 0.1, 0.45, 0.02);
    const elbow = new THREE.Vector3(s * 0.22, 0.39, 0.06);
    const wrist = new THREE.Vector3(s * 0.31, 0.33, 0.1);
    const handEnd = new THREE.Vector3(s * 0.36, 0.3, 0.12);
    const arm = b.chain(`arm${L}`, [shoulder, elbow, wrist, handEnd], {
      parent: chest,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hand${L}`],
      role: "arm",
    });
    limbSweeps.push(b.sweep(arm, [0.055, 0.045, 0.036, 0.03], { color: fur, name: `arm${L}` }));
    if (s < 0) rightHand = arm;

    const d = handEnd.clone().sub(wrist).normalize();
    // two thumbs (front) and three fingers
    const spread = [
      [0.03, -0.018],
      [0.017, -0.012],
      [0.0, -0.004],
      [-0.015, 0],
      [-0.03, 0.002],
    ];
    spread.forEach(([z, y], i) => {
      const base = handEnd.clone().addScaledVector(d, -0.01);
      const tip = base.clone().addScaledVector(d, 0.045).add(new THREE.Vector3(0, y, z));
      const name = `${i < 2 ? "thumb" : "finger"}${i}${L}`;
      const dg = b.chain(name, [base, tip], { parent: arm.tip!, names: [name, `${name}Tip`], role: "digit" });
      b.sweep(dg, [0.012, 0.009], { color: GREY_D });
      const dir = tip.clone().sub(base).normalize().add(new THREE.Vector3(0, -0.5, 0));
      b.spike(tip, dir, 0.022, 0.006, { color: CLAW, bone: dg.tip! });
    });
  }

  // ---------------- Legs & feet ----------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pad: [number, number, number] = [s * 0.145, 0.022, 0.09];
    const leg = b.chain(
      `leg${L}`,
      [
        [s * 0.08, 0.2, 0],
        [s * 0.14, 0.12, 0.08],
        [s * 0.14, 0.055, 0.04],
        [s * 0.15, 0.035, 0.13],
      ],
      { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`, `foot${L}`], role: "leg", contact: [pad[0], 0, pad[2]] },
    );
    limbSweeps.push(b.sweep(leg, [0.075, 0.06, 0.042, 0.034], { color: fur, name: `leg${L}` }));
    b.part(new THREE.SphereGeometry(0.045, 10, 8), GREY_D, { bone: leg.tip!, at: pad, scale: [0.85, 0.5, 1.4] });
    for (let k = 0; k < 3; k++)
      b.spike([s * (0.125 + 0.016 * k), 0.026, 0.148], [0, -0.4, 1], 0.024, 0.006, { color: CLAW, bone: leg.tip! });
    b.spike([s * 0.11, 0.03, 0.11], [-s, -0.2, 0.5], 0.02, 0.006, { color: CLAW, bone: leg.tip! });
  }

  // ---------------- Eucalyptus sprig in the right hand ----------------
  if (rightHand) {
    const hand = rightHand.tip!;
    const stem = bezier([-0.37, 0.26, 0.115], [-0.39, 0.37, 0.17], [-0.34, 0.52, 0.18]);
    b.sweep(stem, [0.006, 0.003], { color: STEM, bone: hand, name: "sprigStem" });
    const leafPaint = paint((_p, _n, s) => (Math.abs(s[1]) < 0.002 && s[0] > 0.005 ? RIB : LEAF));
    const leafOutline: [number, number, "sharp"?][] = [
      [0, 0, "sharp"],
      [0.03, 0.017],
      [0.08, 0.012],
      [0.125, 0, "sharp"],
      [0.08, -0.012],
      [0.03, -0.017],
    ];
    const ts = [0.3, 0.45, 0.6, 0.75, 0.9, 1];
    ts.forEach((t, i) => {
      const at = stem.at(t);
      const tan = stem.tangentAt(t).clone();
      const alt = i % 2 === 0 ? 1 : -1;
      const dir =
        i === ts.length - 1
          ? tan.clone().normalize()
          : tan.clone().multiplyScalar(0.6).add(new THREE.Vector3(alt * 0.9, -0.25, 0.25)).normalize();
      const y = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 0, 1)).normalize();
      b.extrude(leafOutline as any, {
        at,
        x: [dir.x, dir.y, dir.z],
        y: [y.x, y.y, y.z],
        thickness: 0.004,
        smoothing: 2,
        color: leafPaint,
        bone: hand,
        name: `leaf${i}`,
      });
    });
    // gumnuts
    for (const [x, y, z] of [
      [-0.345, 0.43, 0.2],
      [-0.33, 0.45, 0.19],
    ])
      b.part(new THREE.CylinderGeometry(0.009, 0.006, 0.016, 6), "#6d6a4a", { bone: hand, at: [x, y, z] });
  }

  // ---------------- Fur cards ----------------
  const bodyHits = b.surface(body).scatter(220, {
    rng: rng(7),
    minDist: 0.025,
    filter: (h) => h.n.y > -0.6 && h.at.y < 0.55,
  });
  b.cards(bodyHits, tuft, {
    size: [0.035, 0.045],
    lean: 65,
    bend: 25,
    vary: 0.3,
    spin: 20,
    rng: rng(8),
    color: bodyFur,
  });

  const limbHits = b.surface(limbSweeps as any).scatter(160, {
    rng: rng(9),
    minDist: 0.022,
    filter: (h) => h.at.y > 0.03,
  });
  b.cards(limbHits, tuft, { size: [0.03, 0.038], lean: 65, bend: 25, vary: 0.3, rng: rng(10), color: fur });

  const headHits = headSurf.scatter(90, {
    rng: rng(11),
    minDist: 0.02,
    filter: (h) => h.n.z < 0.35,
  });
  b.cards(headHits, tuft, {
    size: [0.03, 0.04],
    lean: 55,
    bend: 20,
    vary: 0.3,
    spin: 15,
    rng: rng(12),
    color: cheekFur,
  });

  return b.root;
}
```