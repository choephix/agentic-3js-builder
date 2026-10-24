```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  DEG,
  catmull,
  limb,
  paint,
  mix,
  noise,
  cells,
  smoothstep,
  gradient,
  countershade,
  mottle,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Platypus",
  description:
    "A Ghibli-style platypus at rest: warm hand-painted fur with cream belly, a pored slate duck bill with separate jaw, bead eyes in cream patches, webbed splayed feet with claws, a fluffy paddle tail and fur tufts.",
};

// ---------------------------------------------------------------------------------------------
// Palette
const FUR_DARK = "#5b3e2b";
const FUR_MID = "#7b5337";
const FUR_LIGHT = "#b0794a";
const BELLY = "#d9bb8e";
const BELLY_LIGHT = "#f0dfba";
const SKIN_LEG = "#7d5f54";
const TOE = "#7c5e52";
const CLAW = "#3a2c26";
const SPUR = "#e2d6bd";
const NOSTRIL = "#1d1718";

type Pt = [number, number];
const scaleOutline = (o: Pt[], k: number): Pt[] => o.map(([x, y]) => [x * k, y * k] as Pt);

const interp = (t: number, k: number[]) => {
  const x = Math.min(Math.max(t, 0), 1) * (k.length - 1);
  const i = Math.min(Math.floor(x), k.length - 2);
  return k[i] + (k[i + 1] - k[i]) * (x - i);
};

// ---------------------------------------------------------------------------------------------
// Paints
const coat = paint((p, n) => {
  const m = noise(p, 0.06, 3);
  const f = noise(p, 0.012, 11);
  const back = mix(FUR_DARK, FUR_MID, Math.min(1, m * 0.8 + f * 0.4));
  const belly = mix(BELLY, BELLY_LIGHT, f);
  let c = mix(belly, back, smoothstep(-0.5, 0.15, n.y));
  // sun-warmed top, painterly
  c = mix(c, FUR_LIGHT, 0.45 * smoothstep(0.5, 1, n.y) * smoothstep(0.45, 0.7, m));
  // dark guard-hair flecks
  c = mix(c, "#2e1f16", 0.35 * smoothstep(0.66, 0.72, noise(p, 0.01, 21)) * smoothstep(-0.2, 0.5, n.y));
  return c;
});

const furTint = paint((p, n) => mix(coat.at(p, n), "#f1d2a2", 0.25));

const tailPaint = countershade(mottle("#553924", "#74492e", { size: 0.04, seed: 5 }), "#a07a52", { level: -0.1 });
const tailTint = paint((p, n) => mix(tailPaint.at(p, n), "#e0b883", 0.22));
const legPaint = gradient(coat, SKIN_LEG, [0, 0.05, 0], [0, 0.012, 0]);

// bill: slate top, pinkish underside, tiny sensor pores, soft sheen
const billPaint = paint((p, n) => {
  const top = smoothstep(-0.2, 0.6, n.y);
  const base = mix("#a8918f", "#4a5263", top);
  const m = noise(p, 0.03, 2);
  let col = mix(base, "#6d768a", m * 0.35 * top);
  const c = cells(p, 0.0072, 4);
  if (c.d1 < 0.17) col = mix(col, "#1d2028", 0.5 + 0.3 * top);
  col = mix(col, "#a4adc4", 0.35 * smoothstep(0.88, 1, n.y) * smoothstep(0.4, 0.7, m));
  return col;
});

// ---------------------------------------------------------------------------------------------
// Textures
const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#777777"/><stop offset="1" stop-color="#ffffff"/>
    </linearGradient></defs>
    <path d="M4 64 Q6 30 10 4 Q16 28 18 64Z" fill="url(#g)"/>
    <path d="M12 64 Q15 24 19 0 Q26 26 28 64Z" fill="url(#g)"/>
    <path d="M0 64 Q1 40 3 20 Q9 40 9 64Z" fill="url(#g)"/>
    <path d="M20 64 Q24 44 30 26 Q32 46 31 64Z" fill="url(#g)"/>
  </svg>`,
  { size: 128 },
);

const EYE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#1b1311"/>
    <ellipse cx="32" cy="44" rx="19" ry="12" fill="#5b3a26"/>
    <ellipse cx="32" cy="48" rx="13" ry="6" fill="#8a5e3a" opacity="0.9"/>
    <path d="M8 25 Q32 -2 56 25" fill="none" stroke="#0e0908" stroke-width="6" stroke-linecap="round"/>
    <circle cx="23" cy="22" r="9" fill="#ffffff"/>
    <circle cx="42" cy="42" r="4" fill="#fff6e4"/>
    <circle cx="37" cy="14" r="2.4" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

const PATCH = svg(
  `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="24" rx="30" ry="22" fill="#b98d62"/>
    <ellipse cx="32" cy="24" rx="25" ry="17" fill="#e8cfa4"/>
  </svg>`,
  { size: 128 },
);

const EAR = svg(
  `<svg viewBox="0 0 32 24" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="12" rx="14" ry="9" fill="#3a2619"/>
    <ellipse cx="16" cy="12" rx="9" ry="5" fill="#1c120c"/>
  </svg>`,
  { size: 64 },
);

// ---------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "platypus", paintSize: 2048 });
  type JointT = ReturnType<typeof b.joint>;

  // ---- skeleton -------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.082, -0.09], dir: [0, 0, 1] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.082, -0.09],
      [0, 0.086, 0],
      [0, 0.087, 0.07],
      [0, 0.086, 0.135],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const spineEnd = spine.joints[2];

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.082, -0.09],
      [0, 0.068, -0.145],
      [0, 0.048, -0.21],
      [0, 0.03, -0.265],
      [0, 0.02, -0.31],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  const neck = b.joint("neck", { parent: spineEnd, at: [0, 0.086, 0.135], dir: [0, 0, 1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.087, 0.15], dir: [0, -0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.0605, 0.2], dir: [0, 0, 1], role: "jaw" });

  // ---- body & tail ----------------------------------------------------------------------
  const body = b.sweep(
    catmull([
      [0, 0.075, -0.17],
      [0, 0.082, -0.09],
      [0, 0.086, 0],
      [0, 0.087, 0.09],
      [0, 0.085, 0.145],
    ]),
    (t) => {
      const base = Math.sin(Math.PI * (0.1 + 0.8 * t));
      return [0.038 + 0.05 * base, 0.032 + 0.04 * base];
    },
    { bone: [tail, hips, spine], color: coat, sides: 10 },
  );

  const RX = [0.036, 0.04, 0.05, 0.062, 0.064, 0.045, 0.02];
  const RY = [0.034, 0.026, 0.02, 0.016, 0.0135, 0.0118, 0.0108];
  const tailTube = b.sweep(tail, (t) => [interp(t, RX), interp(t, RY)], { color: tailPaint, sides: 10 });

  // ---- head -----------------------------------------------------------------------------
  const HC: [number, number, number] = [0, 0.088, 0.155];
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), coat, {
    bone: head,
    at: HC,
    scale: [0.068, 0.052, 0.066],
  });

  const BILL: Pt[] = [
    [-0.036, 0],
    [0.036, 0],
    [0.042, 0.026],
    [0.047, 0.06],
    [0.049, 0.082],
    [0.042, 0.102],
    [0.018, 0.112],
    [-0.018, 0.112],
    [-0.042, 0.102],
    [-0.049, 0.082],
    [-0.047, 0.06],
    [-0.042, 0.026],
  ];
  b.extrude(BILL, {
    at: [0, 0.075, 0.205],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.015,
    bevel: 0.006,
    smoothing: 1,
    color: billPaint,
    bone: head,
  });
  b.extrude(scaleOutline(BILL, 0.78), {
    at: [0, 0.0825, 0.212],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.008,
    bevel: 0.003,
    smoothing: 1,
    color: billPaint,
    bone: head,
  });
  b.extrude(scaleOutline(BILL, 0.92), {
    at: [0, 0.0605, 0.2],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.012,
    bevel: 0.005,
    smoothing: 1,
    color: billPaint,
    bone: jaw,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 6, 4), NOSTRIL, {
      bone: head,
      at: [s * 0.011, 0.0868, 0.282],
      scale: [0.0045, 0.0025, 0.0075],
      rotation: [0, -s * 20, 0],
    });
  }

  // eyes, cream patches, ear grooves
  const skullSurf = b.surface(skull);
  const eyeSpots: THREE.Vector3[] = [];
  for (const s of [1, -1]) {
    const patchHit = skullSurf.around(HC).at(s * 58, 24)!;
    b.decal(skull, PATCH, { at: patchHit, size: [0.064, 0.048], lift: 0.0008, roll: s * 12, mirror: s > 0 });
    const eyeHit = skullSurf.around(HC).at(s * 60, 25)!;
    eyeSpots.push(eyeHit.at.clone());
    b.decal(skull, EYE, { at: eyeHit, size: [0.034, 0.034], lift: 0.0028, mirror: s > 0 });
    const earHit = skullSurf.around(HC).at(s * 112, 16)!;
    b.decal(skull, EAR, { at: earHit, size: [0.02, 0.014], lift: 0.0012, mirror: s > 0 });
  }

  // ---- legs & webbed feet ---------------------------------------------------------------
  const buildFoot = (o: {
    s: number;
    tag: string;
    wrist: JointT;
    W: THREE.Vector3;
    phi: number;
    spread: number;
    len: number;
    reach: number;
  }) => {
    const { s, tag, wrist, W, phi, spread, len, reach } = o;
    const dirAt = (deg: number) => new THREE.Vector3(s * Math.sin(deg * DEG), 0, Math.cos(deg * DEG));
    const at = (d: THREE.Vector3, r: number, y: number) => new THREE.Vector3(W.x + d.x * r, y, W.z + d.z * r);
    const angs = [-2, -1, 0, 1, 2].map((k) => phi + k * spread);
    const lens = angs.map((_, i) => len * (1 - 0.08 * Math.abs(i - 2)));

    // web (a flat fan with scalloped edge)
    const WY = 0.0055;
    const pts: THREE.Vector3[] = [at(dirAt(angs[0] - 45), 0.012, WY)];
    angs.forEach((a, i) => {
      pts.push(at(dirAt(a), lens[i] * reach + 0.004, WY));
      if (i < 4) pts.push(at(dirAt((a + angs[i + 1]) / 2), lens[i] * 0.72 * reach, WY));
    });
    pts.push(at(dirAt(angs[4] + 45), 0.012, WY));
    const webPaint = paint((p) => {
      const dx = p.x - W.x;
      const dz = p.z - W.z;
      const r = Math.hypot(dx, dz);
      const ang = Math.atan2(s * dx, dz);
      const vein = Math.abs(Math.sin(ang * 16));
      let c = mix("#8b695b", "#d2a58f", smoothstep(0.01, 0.06, r));
      c = mix(c, "#6d4f45", 0.45 * smoothstep(0.88, 0.98, vein) * smoothstep(0.01, 0.03, r));
      return c;
    });
    b.slab(pts, { thickness: 0.005, bone: wrist, color: webPaint });

    // palm pad
    b.part(new THREE.SphereGeometry(1, 8, 6), TOE, {
      bone: wrist,
      at: [W.x, 0.0075, W.z],
      scale: [0.017, 0.0068, 0.017],
    });

    // toes + claws, one digit joint each
    angs.forEach((a, i) => {
      const d = dirAt(a);
      const base = at(d, 0.004, 0.006);
      const tip = at(d, lens[i], 0.006);
      const tj = b.joint(`toe${i + 1}${tag}`, { parent: wrist, at: base, aim: tip, role: "digit" });
      b.capsule(base, tip, [0.0062, 0.0048], TOE, { bone: tj });
      const clawBase = tip.clone().addScaledVector(d, 0.003);
      b.spike(clawBase, d, 0.012, 0.0035, { color: CLAW, bone: tj });
    });
  };

  const tuftRng = rng(30);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // front limb
    const fPts = limb([s * 0.06, 0.07, 0.085], [s * 0.135, 0.008, 0.12], [0.06, 0.058], [s, 0.7, -0.3]);
    const arm = b.chain(`arm${side}`, fPts, {
      parent: spineEnd,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const armSw = b.sweep(arm, [0.022, 0.0085], { color: legPaint, sides: 8 });
    const wristF = arm.joints[arm.joints.length - 1];
    buildFoot({
      s,
      tag: `F${side}`,
      wrist: wristF,
      W: fPts[2].clone(),
      phi: 35,
      spread: 24,
      len: 0.05,
      reach: 1.0,
    });
    b.cards(b.surface(armSw).scatter(7, { rng: tuftRng, minDist: 0.02, filter: (h) => h.n.y > -0.2 }), TUFT, {
      size: [0.018, 0.026],
      lean: 70,
      bend: 20,
      color: furTint,
    });

    // hind limb
    const hPts = limb([s * 0.062, 0.07, -0.1], [s * 0.14, 0.008, -0.115], [0.06, 0.058], [s, 0.7, 0.3]);
    const leg = b.chain(`leg${side}`, hPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    const legSw = b.sweep(leg, [0.023, 0.0085], { color: legPaint, sides: 8 });
    const ankle = leg.joints[leg.joints.length - 1];
    buildFoot({
      s,
      tag: `H${side}`,
      wrist: ankle,
      W: hPts[2].clone(),
      phi: 85,
      spread: 20,
      len: 0.045,
      reach: 0.9,
    });
    // venom spur on the ankle
    b.spike(
      [hPts[2].x - s * 0.008, 0.012, hPts[2].z - 0.004],
      [-s * 0.5, 0.35, -0.8],
      0.022,
      0.004,
      { color: SPUR, bone: ankle },
    );
    b.cards(b.surface(legSw).scatter(7, { rng: tuftRng, minDist: 0.02, filter: (h) => h.n.y > -0.2 }), TUFT, {
      size: [0.018, 0.026],
      lean: 70,
      bend: 20,
      color: furTint,
    });
  }

  // ---- fur tufts ------------------------------------------------------------------------
  const bodySurf = b.surface(body);
  b.cards(bodySurf.scatter(230, { rng: rng(11), minDist: 0.02, filter: (h) => h.n.y > -0.1 }), TUFT, {
    size: [0.03, 0.042],
    lean: 72,
    bend: 25,
    vary: 0.3,
    rng: rng(12),
    color: furTint,
  });
  // cream belly fringe
  b.cards(
    bodySurf.scatter(70, { rng: rng(13), minDist: 0.02, filter: (h) => h.n.y <= -0.1 && h.n.y > -0.75 }),
    TUFT,
    { size: [0.022, 0.034], lean: 80, bend: 20, vary: 0.25, rng: rng(14), color: BELLY_LIGHT },
  );
  // tail fluff
  b.cards(
    b.surface(tailTube).scatter(70, {
      rng: rng(15),
      minDist: 0.02,
      filter: (h) => h.n.y > -0.3 && h.at.z < -0.15,
    }),
    TUFT,
    { size: [0.024, 0.036], lean: 75, bend: 20, vary: 0.3, rng: rng(16), color: tailTint },
  );
  // head fluff, kept off the eyes and bill
  b.cards(
    skullSurf.scatter(60, {
      rng: rng(17),
      minDist: 0.016,
      filter: (h) =>
        h.n.y > -0.2 &&
        eyeSpots.every((e) => e.distanceTo(h.at) > 0.03) &&
        (h.at.z < 0.2 || Math.abs(h.at.x) > 0.05) &&
        h.at.z < 0.215,
    }),
    TUFT,
    { size: [0.022, 0.03], lean: 72, bend: 20, vary: 0.3, rng: rng(18), color: furTint },
  );

  return b.root;
}
```