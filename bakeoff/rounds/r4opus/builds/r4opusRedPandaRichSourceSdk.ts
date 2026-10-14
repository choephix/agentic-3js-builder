import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  mix,
  smoothstep,
  noise,
  grain,
  mottle,
  spots,
  catmull,
  polyline,
  limb,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Red Panda on a Mossy Branch",
  description:
    "A delighted red panda balancing on a mossy branch: rusty back, black belly and legs, round white face with red tear marks, white-rimmed ears, a big ringed cream-and-ginger tail, and a bamboo shoot held up in its right paw.",
};

export default function build() {
  const b = createBuilder({ name: "redPanda", paintSize: 1024 });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------------------------------------------------------- palette
  const RUST = "#c4521f";
  const RUST_D = "#8f351a";
  const RUST_L = "#e07b3c";
  const BLACK = "#231815";
  const WHITE = "#f7f1e5";
  const CREAM = "#f0d9a8";
  const GINGER = "#cf6a2c";
  const TIP = "#4f1f12";
  const TEAR = "#a1401b";
  const CLAW = "#d9ccb4";
  const BAM = "#7fae3a";
  const BAM2 = "#93bf45";
  const BAM3 = "#a9cf55";
  const BAMN = "#4f7a22";

  b.joint("root", { at: [0, 0, 0] });

  // ---------------------------------------------------------------- textures
  const furTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 64 C4 50 2 30 10 14 C12 24 14 28 15 31 C15 18 17 8 22 0 C22 14 30 30 28 46 C27 56 22 62 16 64Z" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  const mossTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M6 64 L13 22 L20 64Z M17 64 L27 6 L33 64Z M29 64 L40 14 L45 64Z M41 64 L53 26 L57 64Z" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  const smileTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40"><path d="M32 2 L32 16 M11 11 Q20 27 32 16 Q44 27 53 11" fill="none" stroke="#2b1611" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------- branch
  const bark = grain("#70503a", "#47301f", { size: 0.006, axis: "z", seed: 2 });
  const moss = mottle("#58882a", "#a3c94a", { size: 0.03, seed: 3 });
  const endA = V(0, 0.058, -0.62);
  const endB = V(0, 0.055, 0.62);
  const branchPaint = paint((p, n) => {
    if (Math.abs(n.z) > 0.85 && Math.abs(p.z) > 0.5) {
      const c = p.z < 0 ? endA : endB;
      const r = Math.hypot(p.x - c.x, p.y - c.y);
      const ringv = 0.5 + 0.5 * Math.sin(r * 420 + noise(p, 0.02, 8) * 4);
      return r > 0.05 ? "#5a3d28" : mix("#dcb88a", "#b98d5c", ringv);
    }
    const m = smoothstep(0.1, 0.4, n.y + 0.45 * (noise(p, 0.07, 11) - 0.5));
    return mix(bark.at(p, n), moss.at(p, n), m);
  });
  const branchPath = catmull([
    [0, 0.058, -0.62],
    [0, 0.1, -0.3],
    [0, 0.118, 0],
    [0, 0.108, 0.3],
    [0, 0.055, 0.62],
  ]);
  const branch = b.sweep(branchPath, {
    radius: [0.064, 0.06, 0.057, 0.052],
    color: branchPaint,
    caps: "flat",
    sides: 11,
    bone: "root",
    name: "branch",
  });
  const branchSurf = b.surface(branch);
  const onBranch = (x: number, z: number, lift: number) => {
    const hit = branchSurf.ray([x, 1, z], [0, -1, 0]);
    const at = hit ? hit.at : V(x, 0.17, z);
    return at.add(V(0, lift, 0));
  };
  const tangentAt = (z: number) => branchPath.tangentAt(branchPath.closestT([0, 0.1, z]));

  // side twig with leaves, and a broken stub
  b.sweep(catmull([[0.02, 0.1, 0.36], [0.1, 0.16, 0.42], [0.19, 0.21, 0.44]]), {
    radius: [0.016, 0.007],
    color: bark,
    sides: 7,
    bone: "root",
    name: "twig",
  });
  b.sweep(
    [
      [-0.02, 0.1, -0.38],
      [-0.085, 0.155, -0.43],
    ],
    { radius: [0.02, 0.016], color: branchPaint, caps: { start: "round", end: "flat" }, sides: 8, bone: "root", name: "stub" },
  );

  const LEAF = paint((p, n, s) =>
    Math.abs(s[0]) < 0.0012 ? "#c2e07a" : mix("#4e9128", "#8cc54b", smoothstep(0, 0.08, s[1])),
  );
  const leafShape = (len: number): (number | string)[][] => [
    [0, 0],
    [0.3 * len, 0.18 * len],
    [0.36 * len, 0.45 * len],
    [0.2 * len, 0.78 * len],
    [0, len, "sharp"],
    [-0.2 * len, 0.78 * len],
    [-0.36 * len, 0.45 * len],
    [-0.3 * len, 0.18 * len],
  ];
  const leaf = (at: THREE.Vector3, dir: number[], len: number, bone: string) => {
    const d = V(dir[0], dir[1], dir[2]).normalize();
    let h = d.clone().cross(V(0, 1, 0));
    if (h.lengthSq() < 1e-6) h = V(1, 0, 0);
    h.normalize();
    b.extrude(leafShape(len), { at, x: h, y: d, thickness: 0.0025, smoothing: 1, color: LEAF, bone });
  };
  const twigTip = V(0.185, 0.208, 0.438);
  leaf(twigTip, [0.7, 0.55, 0.2], 0.085, "root");
  leaf(twigTip, [0.55, 0.2, -0.7], 0.075, "root");
  leaf(twigTip, [0.35, 0.45, 0.8], 0.07, "root");

  // ---------------------------------------------------------------- skeleton
  const spine = b.chain("spineChain", polyline([[0, 0.31, -0.17], [0, 0.316, -0.02], [0, 0.322, 0.12]]), {
    names: ["hips", "spine", "chest"],
    parent: "root",
    role: "spine",
  });
  const neck = b.chain("neckChain", polyline([[0, 0.33, 0.15], [0, 0.39, 0.215]]), {
    names: ["neck"],
    parent: "chest",
    role: "neck",
  });
  b.joint("head", { at: [0, 0.43, 0.24], parent: "neck", dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { at: [0, 0.37, 0.28], parent: "head", dir: [0, -0.25, 1], role: "jaw" });

  // ---------------------------------------------------------------- body
  const bodyPaint = paint((p, n) => {
    const fur = mix(RUST, RUST_D, smoothstep(0.35, 0.75, noise(p, 0.05, 2)));
    const top = smoothstep(0.7, 0.95, n.y);
    const back = mix(fur, RUST_L, top * 0.35);
    const k = smoothstep(-0.5, -0.1, n.y + 0.25 * (noise(p, 0.05, 5) - 0.5));
    return mix(BLACK, back, k);
  });
  const body = b.loft(
    [
      { at: [0, 0.312, -0.25], w: 0.12, h: 0.12 },
      { at: [0, 0.315, -0.16], w: 0.2, h: 0.185 },
      { at: [0, 0.318, -0.03], w: 0.215, h: 0.19 },
      { at: [0, 0.325, 0.09], w: 0.19, h: 0.175 },
      { at: [0, 0.36, 0.18], w: 0.13, h: 0.13 },
    ],
    { color: bodyPaint, bone: [spine, "chest", neck], sides: 12, name: "body" },
  );

  // ---------------------------------------------------------------- tail
  const tailChain = b.chain(
    "tail",
    catmull([
      [0, 0.315, -0.22],
      [0.015, 0.3, -0.34],
      [0.06, 0.25, -0.45],
      [0.12, 0.2, -0.52],
      [0.19, 0.19, -0.56],
    ]),
    { count: 5, parent: "hips", role: "tail" },
  );
  const tailPath = tailChain.path;
  const tailPaint = paint((p) => {
    const t = tailPath.closestT(p);
    const s = t * 6 + 0.18 * (noise(p, 0.04, 4) - 0.5);
    const f = s - Math.floor(s);
    const ringv = smoothstep(0.45, 0.55, f) * smoothstep(0.97, 0.88, f) * smoothstep(0.1, 0.18, t);
    const base = mix(GINGER, RUST, smoothstep(0.15, 0.0, t));
    const ginger = mix(base, "#b04e20", smoothstep(0.3, 0.8, noise(p, 0.025, 6)));
    const c = mix(ginger, CREAM, ringv);
    return mix(c, TIP, smoothstep(0.86, 0.95, t));
  });
  const tail = b.sweep(tailChain, {
    radius: [0.045, 0.058, 0.066, 0.066, 0.06, 0.045, 0.03],
    color: tailPaint,
    sides: 12,
    name: "tail",
  });

  // ---------------------------------------------------------------- legs
  const feet: THREE.Vector3[] = [];
  const pawDetails = (tip: THREE.Vector3, dir: THREE.Vector3, bone: string) => {
    const d = dir.clone().normalize();
    for (const k of [-1, 0, 1]) {
      const base = tip
        .clone()
        .add(V(k * 0.0095, -0.002, 0))
        .addScaledVector(d, -0.004);
      b.part(new THREE.SphereGeometry(0.0085, 8, 6), BLACK, { at: base, bone });
      b.spike(base.clone().addScaledVector(d, 0.006), d.clone().add(V(0, -0.6, 0)), 0.011, 0.0028, {
        color: CLAW,
        bone,
        sides: 5,
      });
    }
  };

  for (const sx of [1, -1]) {
    const s = sx > 0 ? "L" : "R";
    const toe = onBranch(sx * 0.026, -0.1, 0.013);
    const sole = tangentAt(-0.12);
    const pts = limb(V(sx * 0.064, 0.3, -0.15), toe, [0.08, 0.075, 0.052], [[0, 0, 1]], { sole });
    feet.push(pts[3], pts[2]);
    const ch = b.chain(`hindLeg${s}`, polyline(pts), {
      names: [`hip${s}`, `knee${s}`, `ankle${s}`, `foot${s}`],
      parent: "hips",
      role: "leg",
    });
    b.sweep(ch, { radius: [0.044, 0.031, 0.022, 0.019], color: BLACK, sides: 10 });
    pawDetails(pts[3], sole, `foot${s}`);
  }

  {
    const toe = onBranch(0.024, 0.175, 0.013);
    const sole = tangentAt(0.15);
    const pts = limb(V(0.055, 0.285, 0.105), toe, [0.068, 0.064, 0.042], [[0, 0, -1]], { sole });
    feet.push(pts[3], pts[2]);
    const ch = b.chain("frontLegL", polyline(pts), {
      names: ["shoulderL", "elbowL", "wristL", "handL"],
      parent: "chest",
      role: "leg",
    });
    b.sweep(ch, { radius: [0.033, 0.025, 0.02, 0.018], color: BLACK, sides: 10 });
    pawDetails(pts[3], sole, "handL");
  }

  // raised right arm holding the bamboo
  const armPts = [V(-0.055, 0.285, 0.105), V(-0.085, 0.262, 0.165), V(-0.118, 0.275, 0.228), V(-0.136, 0.292, 0.266)];
  const arm = b.chain("frontLegR", polyline(armPts), {
    names: ["shoulderR", "elbowR", "wristR", "handR"],
    parent: "chest",
    role: "arm",
  });
  b.sweep(arm, { radius: [0.033, 0.025, 0.02, 0.019], color: BLACK, sides: 10 });

  // ---------------------------------------------------------------- bamboo shoot
  const bA = V(-0.113, 0.2, 0.262);
  const bC = V(-0.208, 0.48, 0.314);
  const at = (t: number) => bA.clone().lerp(bC, t);
  b.sweep([bA, bC], {
    radius: [0.0115, 0.0095],
    sides: 8,
    caps: "flat",
    bone: "handR",
    name: "bamboo",
    bands: [
      [0.28, BAM],
      [0.3, BAMN],
      [0.56, BAM],
      [0.58, BAMN],
      [0.8, BAM2],
      [0.82, BAMN],
      [1, BAM3],
    ],
  });
  for (const t of [0.29, 0.57, 0.81]) b.rod(at(t - 0.012), at(t + 0.012), 0.0135, { color: BAMN, bone: "handR", sides: 8 });
  b.spike(bC, bC.clone().sub(bA), 0.045, 0.0095, { color: BAM3, bone: "handR", sides: 8 });
  leaf(at(0.81), [-0.85, 0.35, 0.35], 0.075, "handR");
  leaf(at(0.81), [-0.5, 0.4, -0.75], 0.07, "handR");
  leaf(at(0.97), [-0.3, 0.8, 0.5], 0.06, "handR");
  // paw curled round the stalk
  const grip = at(0.33);
  for (const dy of [-0.012, 0, 0.012])
    b.part(new THREE.SphereGeometry(0.0085, 8, 6), BLACK, { at: grip.clone().add(V(0.006, dy, 0.011)), bone: "handR" });
  b.part(new THREE.SphereGeometry(0.008, 8, 6), BLACK, { at: grip.clone().add(V(0.01, 0.004, -0.008)), bone: "handR" });

  // ---------------------------------------------------------------- head
  const H = V(0, 0.43, 0.24);
  const segDist = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
    const dx = bx - ax;
    const dy = by - ay;
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(px - ax - dx * t, py - ay - dy * t);
  };
  const facePaint = paint((p) => {
    const u = (p.x - H.x) / 0.105;
    const v = (p.y - H.y) / 0.09;
    const w = (p.z - H.z) / 0.09;
    const au = Math.abs(u);
    const fur = mix(RUST, RUST_L, smoothstep(0.3, 0.8, noise(p, 0.03, 7)));
    const face = smoothstep(0.05, 0.25, w);
    const browD = Math.hypot((au - 0.42) / 1.2, v - 0.5);
    const brow = smoothstep(0.18, 0.13, browD);
    const crown = smoothstep(0.3, 0.42, v) * (1 - brow);
    const stripe = smoothstep(0.22, 0.15, au) * smoothstep(0.05, 0.2, v) * (1 - brow);
    const white = face * (1 - crown) * (1 - stripe);
    const front = smoothstep(-0.05, 0.15, w);
    const td = segDist(au, v, 0.4, 0.12, 0.5, -0.55);
    const tear = smoothstep(0.11, 0.075, td) * front;
    return mix(mix(fur, WHITE, white), TEAR, tear);
  });
  const head = b.part(new THREE.SphereGeometry(1, 18, 13), facePaint, {
    at: H,
    bone: "head",
    scale: [0.105, 0.09, 0.09],
    name: "headBall",
  });
  const headSurf = b.surface(head);

  const muzzle = b.part(new THREE.SphereGeometry(1, 14, 10), WHITE, {
    at: [0, 0.393, 0.31],
    bone: "head",
    scale: [0.046, 0.034, 0.043],
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), "#1b1210", { at: [0, 0.414, 0.348], bone: "head", scale: [0.02, 0.012, 0.014], name: "nose" });
  b.part(new THREE.SphereGeometry(0.004, 6, 4), "#ffffff", { at: [0.007, 0.42, 0.358], bone: "head" });
  b.decal(muzzle, smileTex, { at: [0, 0.386, 0.37], dir: [0, 0, 1], size: [0.052, 0.032], bone: "head" });

  // open, happy mouth
  b.part(new THREE.SphereGeometry(1, 10, 8), "#4a1418", { at: [0, 0.357, 0.322], bone: "head", scale: [0.026, 0.016, 0.026] });
  b.part(new THREE.SphereGeometry(1, 12, 8), WHITE, {
    at: [0, 0.343, 0.305],
    bone: "jaw",
    rotation: [14, 0, 0],
    scale: [0.032, 0.016, 0.034],
    name: "lowerJaw",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), "#e8838a", { at: [0, 0.352, 0.33], bone: "jaw", scale: [0.016, 0.006, 0.016], name: "tongue" });

  for (const sx of [1, -1]) {
    // cheeks
    b.part(new THREE.SphereGeometry(1, 10, 8), WHITE, { at: [sx * 0.085, 0.392, 0.262], bone: "head", scale: [0.04, 0.034, 0.036] });
    b.spike([sx * 0.1, 0.395, 0.25], [sx, -0.35, 0.2], 0.045, 0.02, { color: WHITE, bone: "head", sides: 6 });
    b.spike([sx * 0.095, 0.375, 0.24], [sx * 0.6, -0.8, 0.15], 0.035, 0.016, { color: WHITE, bone: "head", sides: 6 });

    // eyes
    const eyeHit = headSurf.ray([sx * 0.045, 0.445, 1], [0, 0, -1]);
    if (eyeHit) {
      const eye = b.stick(new THREE.SphereGeometry(0.016, 12, 10), "#140c09", eyeHit, { embed: 0.45, bone: "head" });
      const c = eye.at;
      b.part(new THREE.SphereGeometry(0.0048, 6, 4), "#ffffff", {
        at: c.clone().addScaledVector(eyeHit.n, 0.012).add(V(0.004, 0.006, 0)),
        bone: "head",
      });
      b.part(new THREE.SphereGeometry(0.0022, 5, 4), "#ffffff", {
        at: c.clone().addScaledVector(eyeHit.n, 0.014).add(V(-0.004, -0.004, 0)),
        bone: "head",
      });
    }
    // brows
    const browHit = headSurf.ray([sx * 0.05, 0.484, 1], [0, 0, -1]);
    if (browHit)
      b.stick(new THREE.SphereGeometry(0.011, 8, 6), WHITE, browHit, { embed: 0.4, scale: [1.5, 0.55, 1], bone: "head" });

    // whiskers
    for (let k = 0; k < 3; k++)
      b.rod([sx * 0.03, 0.392 - k * 0.007, 0.338], [sx * 0.105, 0.405 - k * 0.02, 0.345 - k * 0.012], 0.0011, {
        color: "#fbf7ee",
        bone: "head",
        sides: 4,
      });

    // ears: white rim, dark inner, rust back
    const ox = V(0.9, -0.42 * sx, 0).normalize();
    const oy = V(0.42 * sx, 0.9, -0.12).normalize();
    const nrm = ox.clone().cross(oy).normalize();
    const base = V(sx * 0.06, 0.478, 0.212);
    const outer: (number | string)[][] = [[-0.036, 0], [0.036, 0], [0.012, 0.06], [0, 0.078, "sharp"], [-0.012, 0.06]];
    const inner: (number | string)[][] = [[-0.025, 0.008], [0.025, 0.008], [0.0084, 0.05], [0, 0.0626, "sharp"], [-0.0084, 0.05]];
    b.extrude(outer, { at: base, x: ox, y: oy, thickness: 0.014, bevel: 0.004, smoothing: 1, color: WHITE, bone: "head", name: `ear${sx > 0 ? "L" : "R"}` });
    b.extrude(inner, { at: base.clone().addScaledVector(nrm, 0.007), x: ox, y: oy, thickness: 0.004, smoothing: 1, color: "#6e2712", bone: "head" });
    b.extrude(inner, { at: base.clone().addScaledVector(nrm, -0.007), x: ox, y: oy, thickness: 0.004, smoothing: 1, color: RUST, bone: "head" });
  }

  // ---------------------------------------------------------------- fur cards
  const bodySurf = b.surface(body);
  b.cards(
    bodySurf.scatter(60, { rng: rng(21), minDist: 0.02, filter: (h) => h.n.y > 0.3, keepOut: (p) => p.z > 0.17 || p.z < -0.24 }),
    furTex,
    { size: [0.022, 0.032], lean: 70, bend: 20, flow: [0, 0, -1], vary: 0.3, spin: 15, color: bodyPaint, rng: rng(22) },
  );
  const tailSurf = b.surface(tail);
  b.cards(
    tailSurf.scatter(110, { rng: rng(31), minDist: 0.012, keepOut: (p) => p.z > -0.25 }),
    furTex,
    {
      size: [0.032, 0.046],
      lean: 55,
      bend: 30,
      vary: 0.3,
      spin: 20,
      color: tailPaint,
      rng: rng(32),
      flow: (f) => tailPath.tangentAt(tailPath.closestT(f.at)),
    },
  );
  b.cards(
    headSurf.scatter(32, { rng: rng(41), minDist: 0.014, filter: (h) => h.n.z < 0.1 && h.n.y > -0.3 }),
    furTex,
    { size: [0.02, 0.028], lean: 65, bend: 15, flow: [0, -0.3, -1], vary: 0.25, color: facePaint, rng: rng(42) },
  );

  // ---------------------------------------------------------------- moss & mushrooms
  const nearFeet = (p: THREE.Vector3) => feet.some((f) => f.distanceTo(p) < 0.045);
  for (const hit of branchSurf.scatter(9, { rng: rng(12), minDist: 0.08, filter: (h) => h.n.y > 0.7, keepOut: nearFeet }))
    b.stick(new THREE.SphereGeometry(0.022, 8, 6), moss, hit, { embed: 0.45, scale: [1.5, 0.5, 1.8], bone: "root" });
  b.cards(
    branchSurf.scatter(160, { rng: rng(5), minDist: 0.016, filter: (h) => h.n.y > 0.45, keepOut: nearFeet }),
    mossTex,
    { size: [0.03, 0.024], cross: true, vary: 0.35, spin: 180, lean: 10, color: moss, rng: rng(9), bone: "root" },
  );

  const capSpots = spots("#d64a26", "#fff4e2", { size: 0.009, amount: 0.35, seed: 4 });
  const mushroom = (sx: number, z: number, s: number) => {
    const hit = branchSurf.ray([sx * 0.5, 0.1, z], [-sx, 0, 0]);
    if (!hit) return;
    const d = hit.n.clone().add(V(0, 1.2, 0)).normalize();
    const stem = new THREE.CylinderGeometry(0.0045 * s, 0.006 * s, 0.03 * s, 7);
    stem.translate(0, 0.015 * s, 0);
    b.part(stem, "#f1e6cf", { at: hit.at.clone().addScaledVector(d, -0.004), dir: d, bone: "root" });
    const capPaint = paint((p, n) => (n.dot(d) < -0.3 ? "#efe0c4" : capSpots.at(p, n)));
    b.lathe(
      [
        [0, 0],
        [0.017 * s, 0.002 * s],
        [0.0175 * s, 0.006 * s],
        [0.012 * s, 0.014 * s],
        [0, 0.017 * s],
      ],
      { at: hit.at.clone().addScaledVector(d, 0.024 * s), axis: d, color: capPaint, segments: 12, smoothing: 1, bone: "root" },
    );
  };
  mushroom(1, -0.42, 1);
  mushroom(1, -0.35, 0.7);
  mushroom(-1, 0.44, 0.85);
  mushroom(-1, -0.2, 0.6);

  // ---------------------------------------------------------------- a delighted look toward the bamboo
  b.pose("head", { axis: [0, 1, 0], deg: -14 });
  b.pose("head", { axis: [0, 0, 1], deg: 7 });

  return b.root;
}
