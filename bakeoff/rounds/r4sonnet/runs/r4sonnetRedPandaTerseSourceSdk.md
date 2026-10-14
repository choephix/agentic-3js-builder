```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  paint,
  mix,
  rgb,
  smoothstep,
  noise,
  rng,
  interpolate,
  DEG,
} from "agentic-3js-builder";

export const meta = {
  name: "Red Panda",
  description:
    "A stocky, rust-furred red panda in a neutral standing rest pose: white-masked face with tear marks, upright fringed ears, dark legs and belly, and a bushy ringed tail. Rigged with spine, neck, head, jaw, ears, tail, four legs and toe digits.",
};

type P3 = [number, number, number];
type RGB = readonly [number, number, number];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const shade = (c: RGB, k: number): RGB => [clamp01(c[0] * k), clamp01(c[1] * k), clamp01(c[2] * k)];

/** Distance from (px,py) to a 2D segment, and the position along it (0..1). */
function segment(px: number, py: number, ax: number, ay: number, bx: number, by: number): [number, number] {
  const dx = bx - ax;
  const dy = by - ay;
  const t = clamp01(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy));
  return [Math.hypot(px - ax - dx * t, py - ay - dy * t), t];
}

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "redPanda", detail: 1, paintSize: 1024 });
  const random = rng(7);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // Head centre; everything on the face is placed relative to it.
  const H: P3 = [0, 0.272, 0.237];
  const h = (x: number, y: number, z: number): P3 => [x, H[1] + y, H[2] + z];

  // ------------------------------------------------------------------ palette
  const RUST_LO = rgb("#97380f");
  const RUST = rgb("#c2501a");
  const RUST_HI = rgb("#e07a2c");
  const DARK = rgb("#2a1a15");
  const DARK_WARM = rgb("#46281c");
  const CREAM = rgb("#f7f0e1");
  const TEAR = rgb("#7a3220");
  const EYE_PATCH = rgb("#3b1d15");
  const TAIL_LIGHT = rgb("#e08a3f");
  const TAIL_DARK = rgb("#a4431a");
  const TAIL_TIP = rgb("#3a2018");
  const EAR_DARK = rgb("#4a251a");
  const EAR_BACK_LO = rgb("#8a3314");
  const EAR_BACK_HI = rgb("#2e1912");

  const FLAT = {
    cream: "#f6efe0",
    eye: "#100b0a",
    eyeHi: "#ffffff",
    nose: "#15100f",
    toe: "#2a1a15",
    claw: "#d3c2a0",
    whisker: "#f4ecdc",
    tongue: "#d9707c",
    mouth: "#7f2f3b",
    tooth: "#f8f4e8",
    tailTip: "#3a2018",
  };

  const TONES = [
    "#8f3513",
    "#a4431a",
    "#b4481a",
    "#cf5f20",
    "#e08a3f",
    "#e8913f",
    "#2a1a15",
    "#46281c",
    "#6b3a2a",
    "#f7f0e1",
  ];
  const TONE_RGB = TONES.map((t) => rgb(t));
  const toneFor = (c: RGB) => {
    const k = 0.92 + 0.16 * random();
    let best = 0;
    let bestD = Infinity;
    TONE_RGB.forEach((t, i) => {
      const d = (t[0] - c[0] * k) ** 2 + (t[1] - c[1] * k) ** 2 + (t[2] - c[2] * k) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return TONES[best];
  };

  // ------------------------------------------------------------------ paints
  const rustFur = (p: THREE.Vector3, n: THREE.Vector3): RGB => {
    const top = smoothstep(-0.15, 0.85, n.y);
    const g = noise(p, 0.09, 8);
    const f = noise(p, 0.022, 3);
    const t = clamp01(0.18 + 0.5 * top + 0.7 * (g - 0.5) + 0.5 * (f - 0.5));
    return t < 0.5 ? mix(RUST_LO, RUST, t * 2) : mix(RUST, RUST_HI, (t - 0.5) * 2);
  };

  // Rust back and flanks, dark belly and legs.
  const bodyPaint = paint((p, n) => {
    const rust = rustFur(p, n);
    const wob = (noise(p, 0.04, 21) - 0.5) * 0.03;
    const leg = smoothstep(0.195 + wob, 0.15 + wob, p.y);
    const belly = smoothstep(-0.05, -0.45, n.y + wob * 3) * smoothstep(0.21, 0.17, p.z);
    const d = Math.max(leg, belly);
    const dark = mix(DARK, DARK_WARM, noise(p, 0.03, 5));
    return mix(rust, dark, d);
  });

  // White cheeks and muzzle, rust crown, dark eye patches, tear marks.
  const facePaint = paint((p, n) => {
    const ax = Math.abs(p.x);
    const dy = p.y - H[1];
    const dz = p.z - H[2];
    const front = smoothstep(-0.01, 0.02, dz);
    const w = (noise(p, 0.018, 11) - 0.5) * 0.012;
    const rust = rustFur(p, n);

    const cheek =
      smoothstep(0.018 + w, 0.034 + w, ax) * smoothstep(0.014 + w, -0.002 + w, dy) * smoothstep(-0.05, -0.02, dz);
    const muzzle = smoothstep(0.02, 0.04, dz) * smoothstep(0.013 + w, 0.002 + w, dy);
    const chin = smoothstep(-0.026, -0.04, dy) * smoothstep(-0.02, 0.03, dz);
    const brow = front * smoothstep(0.0095, 0.0055, Math.hypot(ax - 0.027, dy - 0.028));
    const white = Math.max(cheek, muzzle, chin, brow);

    const patch = front * smoothstep(0.0125, 0.0085, Math.hypot(ax - 0.0285, dy - 0.009));
    const [td, tt] = segment(ax, dy, 0.0285, 0.003, 0.0315, -0.036);
    const tear = front * smoothstep(0.0058 - 0.002 * tt, 0.0033 - 0.0015 * tt, td);

    const cream = shade(CREAM, 0.95 + 0.08 * noise(p, 0.015, 17));
    let c: RGB = mix(rust, cream, white);
    c = mix(c, EYE_PATCH, patch);
    c = mix(c, TEAR, tear);
    return c;
  });

  // Ringed bushy tail: s[0] runs 0 (root) .. 1 (tip).
  const tailPaint = paint((p, n, s) => {
    const t = s[0];
    const base = rustFur(p, n);
    const wave = Math.sin(2 * Math.PI * (t * 6 + 0.1));
    const wob = (noise(p, 0.05, 31) - 0.5) * 0.35;
    const band = smoothstep(-0.16, 0.16, wave + wob);
    let c: RGB = mix(TAIL_DARK, TAIL_LIGHT, band);
    c = shade(c, 0.92 + 0.16 * noise(p, 0.02, 9));
    c = shade(c, 0.84 + 0.16 * smoothstep(-0.8, 0.3, n.y));
    c = mix(c, base, smoothstep(0.12, 0.02, t));
    c = mix(c, TAIL_TIP, smoothstep(0.86, 0.94, t));
    return c;
  });

  // ------------------------------------------------------------------ skeleton: root, spine, neck, head
  b.joint("root", { at: [0, 0.185, -0.17] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.185, -0.17],
      [0, 0.2, -0.085],
      [0, 0.207, -0.005],
      [0, 0.203, 0.075],
      [0, 0.195, 0.145],
    ]),
    { parent: "root", names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.195, 0.145],
      [0, 0.222, 0.178],
      [0, 0.25, 0.21],
    ]),
    { parent: "spine4", names: ["neck1", "neck2", "head"], role: "neck" },
  );

  b.joint("jaw", { parent: "head", at: h(0, -0.031, 0.017), dir: [0, 0, 1], role: "jaw" });

  // ------------------------------------------------------------------ torso and neck
  const torso = b.sweep(
    spine,
    (t) => [
      interpolate(spine.ts, [0.074, 0.086, 0.09, 0.088, 0.08], t),
      interpolate(spine.ts, [0.076, 0.088, 0.092, 0.09, 0.082], t),
    ],
    { color: bodyPaint, sides: 14, caps: { start: "round", end: "round" }, name: "torso" },
  );

  b.sweep(
    neck,
    (t) => [
      interpolate(neck.ts, [0.07, 0.063, 0.058], t),
      interpolate(neck.ts, [0.07, 0.064, 0.058], t),
    ],
    { color: bodyPaint, sides: 12, caps: { start: "round", end: "round" }, name: "neck" },
  );

  // ------------------------------------------------------------------ head
  const cranium = b.part(new THREE.SphereGeometry(1, 14, 10), facePaint, {
    at: H,
    scale: [0.068, 0.056, 0.058],
    bone: "head",
    name: "cranium",
  });

  // Upper jaw (muzzle) on the head, lower jaw on the jaw bone.
  const muzzle = b.sweep(
    [h(0, -0.01, 0.027), h(0, -0.012, 0.087)],
    (t) => [0.036 - 0.013 * t, 0.0235 - 0.0045 * t],
    { color: facePaint, bone: "head", sides: 10, caps: { start: "round", end: "round" }, name: "upperJaw" },
  );
  b.sweep(
    [h(0, -0.0365, 0.02), h(0, -0.0345, 0.077)],
    (t) => [0.0295 - 0.011 * t, 0.0145 - 0.003 * t],
    { color: facePaint, bone: "jaw", sides: 10, caps: { start: "round", end: "round" }, name: "lowerJaw" },
  );

  // Mouth interior: only seen when the jaw opens.
  b.part(new THREE.SphereGeometry(1, 8, 6), FLAT.tongue, {
    at: h(0, -0.0235, 0.05),
    scale: [0.011, 0.004, 0.026],
    bone: "jaw",
    name: "tongue",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), FLAT.mouth, {
    at: h(0, -0.031, 0.055),
    scale: [0.018, 0.004, 0.028],
    bone: "head",
    name: "palate",
  });

  // Canines
  for (const s of [1, -1]) {
    b.spike(h(s * 0.012, -0.02, 0.08), [0, -1, 0.1], 0.019, 0.0028, {
      color: FLAT.tooth,
      bone: "head",
      sides: 5,
    });
    b.spike(h(s * 0.011, -0.034, 0.07), [0, 1, 0.1], 0.02, 0.0028, {
      color: FLAT.tooth,
      bone: "jaw",
      sides: 5,
    });
  }

  // Nose pad and eyes seated on the real surfaces.
  const muzzleSkin = b.surface(muzzle);
  const noseOrigin = h(0, -0.0115, 0.4);
  const noseHit = muzzleSkin.ray(noseOrigin, [0, 0, -1]) ?? muzzleSkin.nearest(noseOrigin);
  b.stick(new THREE.SphereGeometry(1, 8, 6), FLAT.nose, noseHit, {
    embed: 0.4,
    scale: [0.0135, 0.0075, 0.0095],
    name: "nose",
  });

  const craniumSkin = b.surface(cranium);
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const origin = h(s * 0.0285, 0.01, 0.4);
    const hit = craniumSkin.ray(origin, [0, 0, -1]) ?? craniumSkin.nearest(origin);
    const eye = b.stick(new THREE.SphereGeometry(0.0072, 10, 8), FLAT.eye, hit, {
      embed: 0.42,
      name: `eye${S}`,
    });
    b.part(new THREE.SphereGeometry(0.0016, 6, 4), FLAT.eyeHi, {
      at: eye.local([0.0018, 0.0066, 0.0022]),
      bone: "head",
      name: `eyeGlint${S}`,
    });
  }

  // Cheek ruffs: white fur tufts sweeping out and back.
  const RUFF: Array<{ at: P3; dir: P3; len: number; r: number }> = [
    { at: [0.05, -0.002, 0.012], dir: [0.8, 0.05, -0.55], len: 0.04, r: 0.0115 },
    { at: [0.048, -0.016, 0.014], dir: [0.65, -0.35, -0.5], len: 0.042, r: 0.0115 },
    { at: [0.044, -0.03, 0.02], dir: [0.45, -0.7, -0.3], len: 0.036, r: 0.0105 },
    { at: [0.052, 0.01, 0.002], dir: [0.95, 0.25, -0.45], len: 0.034, r: 0.01 },
    { at: [0.04, -0.04, 0.03], dir: [0.25, -0.9, -0.1], len: 0.03, r: 0.0095 },
  ];
  for (const s of [1, -1]) {
    for (const r of RUFF) {
      const d = V(s * r.dir[0], r.dir[1], r.dir[2]).normalize();
      b.spike(h(s * r.at[0], r.at[1], r.at[2]), d, r.len, r.r, { color: FLAT.cream, bone: "head", sides: 5 });
    }
  }

  // Whiskers
  for (const s of [1, -1]) {
    for (let j = 0; j < 4; j++) {
      const base: P3 = h(s * 0.026, -0.016 + (j - 1.5) * 0.0055, 0.062);
      const dir = V(s * 0.95, (1.5 - j) * 0.12 - 0.12, 0.28 - 0.17 * j).normalize();
      const len = 0.07 - 0.005 * j;
      const tip = V(base[0], base[1], base[2]).addScaledVector(dir, len);
      b.rod(base, tip, 0.0007, { color: FLAT.whisker, bone: "head", sides: 3, caps: "flat" });
    }
  }

  // ------------------------------------------------------------------ ears
  const earBasis = (s: number) => {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, s * 28 * DEG, 0));
    q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -s * 24 * DEG)));
    q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(10 * DEG, 0, 0)));
    return {
      x: new THREE.Vector3(1, 0, 0).applyQuaternion(q),
      y: new THREE.Vector3(0, 1, 0).applyQuaternion(q),
      z: new THREE.Vector3(0, 0, 1).applyQuaternion(q),
    };
  };

  const earPaint = (origin: THREE.Vector3, ex: THREE.Vector3, ey: THREE.Vector3, ez: THREE.Vector3) =>
    paint((p, n) => {
      const d = n.dot(ez);
      const dx = p.x - origin.x;
      const dyy = p.y - origin.y;
      const dzz = p.z - origin.z;
      const v = dx * ey.x + dyy * ey.y + dzz * ey.z;
      const u = dx * ex.x + dyy * ex.y + dzz * ex.z;
      const fur = noise(p, 0.012, 4);
      if (d > 0.5) {
        const baseDark = smoothstep(0.028, 0.006, v) * smoothstep(0.03, 0.012, Math.abs(u) + 0.2 * v);
        return mix(shade(CREAM, 0.94 + 0.08 * fur), EAR_DARK, baseDark * 0.85);
      }
      if (d < -0.5) {
        return mix(EAR_BACK_LO, EAR_BACK_HI, smoothstep(0.005, 0.035, v) * (0.85 + 0.15 * fur));
      }
      return shade(CREAM, 0.95 + 0.08 * fur);
    });

  const EAR_OUTLINE: Array<[number, number]> = [
    [-0.027, 0],
    [-0.028, 0.012],
    [-0.022, 0.03],
    [-0.01, 0.046],
    [0, 0.0505],
    [0.01, 0.046],
    [0.022, 0.03],
    [0.028, 0.012],
    [0.027, 0],
  ];

  const earBases: THREE.Vector3[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const base = h(s * 0.046, 0.032, -0.013);
    earBases.push(V(base[0], base[1], base[2]));
    const { x: ex, y: ey, z: ez } = earBasis(s);
    const origin = V(base[0], base[1], base[2]).addScaledVector(ey, -0.006);
    const earJoint = b.joint(`ear${S}`, { parent: "head", at: origin, dir: ey, up: ez, role: "hinge" });
    const ear = b.extrude(EAR_OUTLINE, {
      color: earPaint(origin, ex, ey, ez),
      at: origin,
      x: ex,
      y: ey,
      thickness: [0.016, 0.0075],
      bevel: 0.004,
      bone: earJoint,
      name: `ear${S}`,
    });
    // white fringe tufts inside the ear and at its tip
    for (const [u, v, lean] of [
      [-0.011, 0.01, -0.3],
      [0, 0.008, 0],
      [0.011, 0.01, 0.3],
    ]) {
      b.spike(ear.local([u, v, 0.005]), ear.dir([lean * 0.5, 1, 1]), 0.022, 0.0065, {
        color: FLAT.cream,
        bone: earJoint,
        sides: 5,
      });
    }
    b.spike(ear.local([0, 0.046, 0]), ear.dir([0, 1, 0.1]), 0.014, 0.006, {
      color: FLAT.cream,
      bone: earJoint,
      sides: 5,
    });
  }

  // ------------------------------------------------------------------ legs and toes
  type Kind = "F" | "H";
  const buildLeg = (kind: Kind, s: number) => {
    const S = s > 0 ? "L" : "R";
    const pts: P3[] =
      kind === "F"
        ? [
            [s * 0.066, 0.168, 0.085],
            [s * 0.074, 0.098, 0.072],
            [s * 0.072, 0.032, 0.1],
            [s * 0.072, 0.0185, 0.15],
          ]
        : [
            [s * 0.062, 0.168, -0.135],
            [s * 0.074, 0.1, -0.088],
            [s * 0.066, 0.036, -0.15],
            [s * 0.066, 0.0185, -0.088],
          ];
    const names =
      kind === "F"
        ? [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `pawF${S}`]
        : [`hip${S}`, `knee${S}`, `ankle${S}`, `pawH${S}`];
    const leg = b.chain(`leg${kind}${S}`, polyline(pts), {
      parent: kind === "F" ? "spine4" : "root",
      names,
      role: "leg",
    });
    const rx = kind === "F" ? [0.036, 0.029, 0.023, 0.026] : [0.04, 0.031, 0.024, 0.027];
    const ry = kind === "F" ? [0.036, 0.029, 0.023, 0.019] : [0.042, 0.032, 0.026, 0.019];
    b.sweep(leg, (t) => [interpolate(leg.ts, rx, t), interpolate(leg.ts, ry, t)], {
      color: bodyPaint,
      sides: 10,
      caps: { start: "round", end: "round" },
      name: `leg${kind}${S}`,
    });

    // muscle mass at shoulder / haunch
    if (kind === "H") {
      b.part(new THREE.SphereGeometry(1, 10, 8), bodyPaint, {
        at: [s * 0.062, 0.158, -0.122],
        scale: [0.034, 0.05, 0.056],
        bone: names[0],
        name: `haunch${S}`,
      });
    } else {
      b.part(new THREE.SphereGeometry(1, 10, 8), bodyPaint, {
        at: [s * 0.064, 0.16, 0.08],
        scale: [0.032, 0.045, 0.04],
        bone: names[0],
        name: `shoulder${S}`,
      });
    }

    // five toes fanned from the ball of the foot
    const ball = pts[3];
    const paw = leg.tip!;
    for (let i = 0; i < 5; i++) {
      const k = i - 2;
      const off = s * k * 0.0105;
      const ang = s * k * 9 * DEG;
      const len = [0.017, 0.021, 0.024, 0.022, 0.018][i];
      const base: P3 = [ball[0] + off, 0.0075, ball[2] + 0.002 - Math.abs(k) * 0.0012];
      const tip: P3 = [base[0] + Math.sin(ang) * len, 0.006, base[2] + Math.cos(ang) * len];
      const toeName = `toe${kind}${i + 1}${S}`;
      const toe = b.chain(toeName, polyline([base, tip]), {
        parent: paw,
        names: [toeName],
        role: "digit",
      });
      b.sweep(toe, [0.0056, 0.0046], {
        color: FLAT.toe,
        sides: 6,
        caps: { start: "round", end: "round" },
        name: toeName,
      });
      const clawDir = V(Math.sin(ang), -0.25, Math.cos(ang)).normalize();
      b.spike(V(tip[0], tip[1], tip[2]).addScaledVector(clawDir, 0.001), clawDir, 0.011, 0.0026, {
        color: FLAT.claw,
        bone: toe.joints[0],
        sides: 4,
        name: `claw${toeName}`,
      });
    }
  };
  for (const s of [1, -1]) {
    buildLeg("F", s);
    buildLeg("H", s);
  }

  // ------------------------------------------------------------------ tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.195, -0.205],
      [0, 0.212, -0.285],
      [0, 0.216, -0.372],
      [0, 0.208, -0.46],
      [0, 0.188, -0.545],
      [0, 0.158, -0.62],
      [0, 0.122, -0.68],
    ]),
    { parent: "root", names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6"], role: "tail" },
  );
  const tailMesh = b.sweep(
    tail,
    (t) => {
      const r = 0.042 + 0.022 * Math.sin(Math.PI * Math.pow(t, 0.8)) - 0.012 * t * t;
      return [r, r * 0.95];
    },
    { color: tailPaint, sides: 12, caps: { start: "round", end: "round" }, name: "tail" },
  );

  // dark fur tuft at the tail tip
  {
    const tip = tail.at(0.97);
    const T = tip.axis;
    const sideV = tip.dir([1, 0, 0]);
    const upV = tip.dir([0, 0, 1]);
    const fan: Array<[number, number]> = [
      [0, 0],
      [0.45, 0],
      [-0.45, 0],
      [0, 0.45],
      [0, -0.45],
    ];
    fan.forEach(([a, c], i) => {
      const d = T.clone().addScaledVector(sideV, a).addScaledVector(upV, c).normalize();
      b.spike(tip.at, d, i === 0 ? 0.065 : 0.05, 0.016, { color: FLAT.tailTip, bone: "tail6", sides: 5 });
    });
  }

  // ------------------------------------------------------------------ fur tufts: roughen the silhouette
  const flow = V(0, -0.2, -0.8);
  b.surface(torso)
    .scatter(70, {
      rng: random,
      minDist: 0.03,
      filter: (hit) => hit.n.y > -0.35 && hit.at.z > -0.23 && hit.at.z < 0.17,
    })
    .forEach((hit) => {
      const d = hit.n.clone().multiplyScalar(0.55).add(flow).normalize();
      b.spike(hit.moved([0, -0.005, 0]), d, 0.022 + 0.01 * random(), 0.007 + 0.003 * random(), {
        color: toneFor(bodyPaint.at(hit.at, hit.n)),
        bone: hit.bone ?? "spine2",
        sides: 5,
      });
    });

  b.surface(tailMesh)
    .scatter(36, {
      rng: random,
      minDist: 0.04,
      filter: (hit) => hit.at.z < -0.27 && hit.n.y > -0.4,
    })
    .forEach((hit) => {
      const t = tail.path.closestT(hit.at);
      const T = tail.at(t).axis;
      const d = hit.n.clone().multiplyScalar(0.5).addScaledVector(T, 0.9).normalize();
      b.spike(hit.moved([0, -0.006, 0]), d, 0.026 + 0.012 * random(), 0.009 + 0.003 * random(), {
        color: toneFor(tailPaint.at(hit.at, hit.n, [t, 0])),
        bone: hit.bone ?? "tail3",
        sides: 5,
      });
    });

  b.surface(cranium)
    .scatter(16, {
      rng: random,
      minDist: 0.028,
      filter: (hit) => hit.at.z < H[2] + 0.02 && hit.at.y > H[1] - 0.01,
      keepOut: (p) => earBases.some((e) => e.distanceTo(p) < 0.032),
    })
    .forEach((hit) => {
      const d = hit.n.clone().multiplyScalar(0.55).add(V(0, 0, -0.8)).normalize();
      b.spike(hit.moved([0, -0.004, 0]), d, 0.016 + 0.006 * random(), 0.006, {
        color: toneFor(facePaint.at(hit.at, hit.n)),
        bone: "head",
        sides: 5,
      });
    });

  return b.root;
}
```