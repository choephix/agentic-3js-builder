import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  mottle,
  noise,
  patches,
  bezier,
  catmull,
  limb,
  svg,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Sleepy Koala",
  description:
    "A drowsy ash-grey koala hugging a ghost-gum eucalyptus branch on a grassy mound, munching a sprig of blue-green leaves.",
};

export default function build() {
  const b = createBuilder({ name: "koala" });
  const R = rng(17);

  // ---------- palette ----------
  const FUR = "#9a9ca4";
  const FUR_LT = "#b7b9c0";
  const FUR_DK = "#7c7f88";
  const PAW = "#80838c";
  const CREAM = "#efe6d2";
  const EAR_FLUFF = "#f6f2e8";
  const NOSE = "#1d1a1d";
  const NOSE_HI = "#5d5763";
  const NOSTRIL = "#070606";
  const CLAW = "#2a2420";
  const IRIS = "#6e4120";
  const PUPIL = "#140c08";
  const LASH = "#2a2326";
  const MOUTH = "#3b2428";
  const CHIN = "#ddd5c6";
  const TWIG = "#8a5438";
  const LEAF = "#6f9c92";
  const LEAF_LT = "#8fb8ab";
  const LEAF_YOUNG = "#a8786a";
  const MIDRIB = "#c9dccf";
  const NUT = "#7a6646";
  const EARTH = "#6b5240";
  const ROCK = "#9b968c";

  const G = 0.042; // top of the grassy mound

  // ---------- paints ----------
  const furMottle = mottle(FUR, FUR_LT, { size: 0.05, seed: 2 });
  const koalaFur = paint((p, n) => {
    const edge = 0.095 + (noise(p, 0.04, 5) - 0.5) * 0.05;
    if (n.z > 0.2 && Math.abs(p.x) < edge && p.y > G + 0.1 && p.y < 0.585) return CREAM;
    return furMottle;
  });
  const limbFur = mottle(FUR, FUR_DK, { size: 0.045, seed: 4 });
  const bark = patches("#9c8468", ["#d6c8ac", "#c4b294", "#b9a07e"], { size: 0.06, seed: 3 });
  const grassMottle = mottle("#8a9c56", "#66793f", { size: 0.07, seed: 9 });
  const groundPaint = paint((_p, n) => (n.y < 0.6 ? EARTH : grassMottle));
  const BOW = 1.1;
  const leafPaint = (base: string, light: string) =>
    paint((_p, _n, s) =>
      Math.abs(s[1] - BOW * s[0] * s[0]) < 0.0018 ? MIDRIB : s[0] > 0.085 ? light : base,
    );
  const leafA = leafPaint(LEAF, LEAF_LT);
  const leafB = leafPaint(LEAF_YOUNG, "#b98d78");

  // ---------- textures ----------
  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48">
      <path d="M16 48 C10 34 6 20 9 2 C13 16 15 26 16 30 C17 22 20 12 24 4 C25 22 22 36 16 48Z" fill="#ffffff"/>
      <path d="M14 48 C8 38 2 30 1 18 C7 28 12 36 16 44Z" fill="#d8d8d8"/>
      <path d="M18 48 C24 38 30 30 31 20 C25 28 20 36 16 44Z" fill="#d8d8d8"/>
    </svg>`,
    { size: 128 },
  );
  const grass = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48">
      <path d="M15 48 C14 30 12 14 8 0 C15 14 18 30 18 48Z" fill="#ffffff"/>
      <path d="M10 48 C8 36 4 26 0 18 C7 26 11 36 13 48Z" fill="#cfcfcf"/>
      <path d="M19 48 C21 34 25 22 31 10 C27 24 23 36 22 48Z" fill="#e4e4e4"/>
    </svg>`,
    { size: 128 },
  );

  // ---------- skeleton ----------
  const HC = new THREE.Vector3(0, 0.655, 0.05);
  const hips = b.joint("hips", { at: [0, G + 0.13, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, G + 0.13, 0],
      [0, G + 0.3, 0.012],
      [0, G + 0.47, 0.022],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.joint("neck", { parent: chest, at: [0, G + 0.5, 0.025], aim: HC, role: "neck" });
  const head = b.joint("head", { parent: neck, at: HC, dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.05, down: 0.06 }),
    aim: head.local({ forward: 0.11, down: 0.09 }),
    role: "jaw",
  });

  // ---------- ground mound ----------
  const ground = b.lathe(
    [
      [0, 0],
      [0.47, 0],
      [0.48, 0.012],
      [0.46, 0.03],
      [0.4, 0.038],
      [0.2, 0.042],
      [0, 0.043],
    ],
    { at: [0, 0, 0], segments: 18, color: groundPaint, bone: hips },
  );
  for (const [x, z, r] of [
    [-0.38, 0.12, 0.05],
    [0.36, -0.22, 0.06],
    [-0.2, -0.36, 0.04],
  ]) {
    b.part(new THREE.DodecahedronGeometry(r, 0), ROCK, {
      bone: hips,
      at: [x, 0.03, z],
      rotation: [R() * 60, R() * 90, 0],
      flat: true,
    });
  }
  const groundHits = b
    .surface(ground)
    .scatter(34, {
      rng: rng(21),
      minDist: 0.05,
      filter: (h) => h.n.y > 0.7 && Math.hypot(h.at.x, h.at.z) > 0.3,
    });
  b.cards(groundHits, grass, {
    size: [0.06, 0.07],
    cross: true,
    vary: 0.35,
    spin: 40,
    rng: rng(22),
    color: "#8fa85a",
    bone: hips,
  });

  // ---------- leaves ----------
  function leafOutline(L: number, w: number): OutlinePoint[] {
    const top: OutlinePoint[] = [];
    const bot: OutlinePoint[] = [];
    const us = [0.15, 0.35, 0.6, 0.82];
    const ws = [0.75, 1, 0.75, 0.35];
    for (let i = 0; i < us.length; i++) {
      const x = us[i] * L;
      const c = BOW * x * x;
      top.push([x, c + ws[i] * w]);
      bot.push([x, c - ws[i] * w]);
    }
    return [[0, 0, "sharp"], ...top, [L, BOW * L * L, "sharp"], ...bot.reverse()];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function leaf(at: THREE.Vector3, dir: THREE.Vector3, roll: number, L: number, bone: any, col: any) {
    const x = dir.clone().normalize();
    const ref = Math.abs(x.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const z = new THREE.Vector3().crossVectors(x, ref).normalize();
    const y = new THREE.Vector3().crossVectors(z, x).normalize();
    const yy = y.multiplyScalar(Math.cos(roll)).add(z.multiplyScalar(Math.sin(roll)));
    return b.extrude(leafOutline(L, L * 0.1), {
      at: [at.x, at.y, at.z],
      x: [x.x, x.y, x.z],
      y: [yy.x, yy.y, yy.z],
      thickness: 0.0025,
      smoothing: 1,
      color: col,
      bone,
    });
  }

  // leaf litter on the mound
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    const r = 0.32 + R() * 0.08;
    const p = new THREE.Vector3(Math.sin(a) * r, 0.0405, Math.cos(a) * r);
    const d = new THREE.Vector3(Math.cos(a + R()), 0, -Math.sin(a + R()));
    leaf(p, d, Math.PI / 2, 0.09 + R() * 0.03, hips, i % 3 === 0 ? leafB : leafA);
  }

  // ---------- eucalyptus branch ----------
  const P = catmull([
    [0.27, G - 0.03, 0.1],
    [0.262, 0.35, 0.13],
    [0.235, 0.75, 0.09],
    [0.27, 1.0, 0.03],
    [0.33, 1.12, -0.02],
  ]);
  b.sweep(P, [0.056, 0.05, 0.043, 0.032, 0.02], {
    bone: hips,
    color: bark,
    caps: { start: "flat", end: "round" },
  });
  const twigs: { from: number; to: number[]; n: number }[] = [
    { from: 0.42, to: [0.46, 0.63, 0.24], n: 5 },
    { from: 0.72, to: [0.52, 0.98, 0.13], n: 6 },
    { from: 0.86, to: [0.04, 1.12, 0.12], n: 6 },
    { from: 1.0, to: [0.52, 1.24, -0.06], n: 6 },
  ];
  const UP = new THREE.Vector3(0, 1, 0);
  for (const tw of twigs) {
    const start = P.at(tw.from);
    const end = new THREE.Vector3(tw.to[0], tw.to[1], tw.to[2]);
    const midP = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 0.05, 0));
    const path = bezier(start, midP, end);
    b.sweep(path, [0.013, 0.005], { bone: hips, color: TWIG });
    for (let i = 0; i < tw.n; i++) {
      const t = 0.3 + (0.7 * i) / (tw.n - 1);
      const base = path.at(t);
      const tan = path.tangentAt(t).normalize();
      const side = new THREE.Vector3().crossVectors(tan, UP).normalize().multiplyScalar(i % 2 ? 1 : -1);
      const d = tan
        .clone()
        .multiplyScalar(0.5)
        .add(side.multiplyScalar(0.8))
        .add(new THREE.Vector3((R() - 0.5) * 0.3, -0.75, (R() - 0.5) * 0.3));
      leaf(base, d, R() * Math.PI, 0.11 + R() * 0.04, hips, R() < 0.18 ? leafB : leafA);
    }
    // gumnut cluster at twig tip
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      const p = end.clone().add(new THREE.Vector3(Math.cos(a) * 0.012, -0.014, Math.sin(a) * 0.012));
      b.part(new THREE.CylinderGeometry(0.008, 0.005, 0.016, 6), NUT, { bone: hips, at: p, flat: true });
    }
  }

  // ---------- body ----------
  const body = b.loft(
    [
      { at: [0, G + 0.12, -0.01], w: 0.3, h: 0.26 },
      { at: [0, G + 0.2, 0.0], w: 0.36, h: 0.31 },
      { at: [0, G + 0.32, 0.01], w: 0.32, h: 0.27 },
      { at: [0, G + 0.43, 0.015], w: 0.26, h: 0.21 },
      { at: [0, G + 0.5, 0.02], w: 0.17, h: 0.15 },
    ],
    { bone: spine, color: koalaFur },
  );
  const bodyHits = b
    .surface(body)
    .scatter(200, { rng: rng(11), minDist: 0.028, filter: (h) => h.at.y > G + 0.03 });
  b.cards(bodyHits, tuft, {
    size: [0.04, 0.045],
    lean: 50,
    bend: 30,
    vary: 0.3,
    rng: rng(12),
    color: koalaFur,
  });

  // ---------- head ----------
  const headGeo = new THREE.SphereGeometry(0.12, 14, 10).scale(1.2, 1, 0.95);
  const skull = b.part(headGeo, koalaFur, { bone: head, at: HC });
  const headHits = b
    .surface(skull)
    .scatter(70, { rng: rng(13), minDist: 0.025, filter: (h) => h.n.z < 0.35 });
  b.cards(headHits, tuft, {
    size: [0.035, 0.04],
    lean: 55,
    bend: 25,
    vary: 0.3,
    rng: rng(14),
    color: koalaFur,
  });

  // big leathery nose
  const nose = b.part(new THREE.SphereGeometry(0.055, 10, 8).scale(0.85, 1.2, 0.75), NOSE, {
    bone: head,
    at: head.local({ forward: 0.112, down: 0.012 }),
  });
  b.part(new THREE.SphereGeometry(0.035, 8, 6).scale(0.9, 1.3, 0.7), NOSE, {
    bone: head,
    at: head.local({ forward: 0.1, up: 0.03 }),
  });
  const noseSurf = b.surface(nose);
  const noseC = head.local({ forward: 0.112, down: 0.012 });
  const hiHit = noseSurf.ray([noseC.x + 0.016, noseC.y + 0.022, 0.5], [0, 0, -1]);
  if (hiHit)
    b.stick(new THREE.SphereGeometry(0.01, 6, 4).scale(0.7, 0.35, 1.6), NOSE_HI, hiHit, { bone: head, embed: 0.4 });
  for (const s of [1, -1]) {
    const nh = noseSurf.ray([noseC.x + s * 0.018, noseC.y - 0.042, 0.5], [0, 0, -1]);
    if (nh)
      b.stick(new THREE.SphereGeometry(0.011, 6, 4).scale(1.2, 0.5, 0.8), NOSTRIL, nh, { bone: head, embed: 0.5 });
  }

  // mouth and jaw
  b.part(new THREE.SphereGeometry(0.028, 8, 6), MOUTH, {
    bone: head,
    at: head.local({ forward: 0.08, down: 0.072 }),
  });
  b.part(new THREE.SphereGeometry(0.034, 10, 6).scale(1.3, 0.55, 1), CHIN, {
    bone: jaw,
    at: head.local({ forward: 0.085, down: 0.088 }),
  });
  // a leaf mid-munch, sticking out of the mouth
  leaf(
    new THREE.Vector3(-0.075, 0.56, 0.205),
    new THREE.Vector3(0.075, 0.018, -0.065),
    0.3,
    0.12,
    head,
    leafA,
  );

  // drowsy eyes
  for (const s of [1, -1]) {
    const ep = head.local({ left: s * 0.06, up: 0.035, forward: 0.095 });
    b.part(new THREE.SphereGeometry(0.02, 10, 8), IRIS, { bone: head, at: ep });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), PUPIL, {
      bone: head,
      at: [ep.x, ep.y - 0.002, ep.z + 0.015],
    });
    b.part(new THREE.SphereGeometry(0.0035, 5, 3), "#ffffff", {
      bone: head,
      at: [ep.x + s * 0.006, ep.y - 0.008, ep.z + 0.017],
    });
    b.part(new THREE.SphereGeometry(0.0232, 10, 5, 0, Math.PI * 2, 0, Math.PI * 0.5), FUR_DK, {
      bone: head,
      at: ep,
      rotation: [14, 0, 0],
    });
    b.part(new THREE.TorusGeometry(0.0232, 0.0028, 4, 10, Math.PI), LASH, {
      bone: head,
      at: ep,
      rotation: [104, 0, 0],
    });
  }

  // fluffy ears
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const earPos = head.local({ left: s * 0.125, up: 0.085, back: 0.005 });
    const earDir = new THREE.Vector3(s * 0.55, 0.25, 1).normalize();
    const ear = b.joint(`ear${side}`, { parent: head, at: earPos, dir: [earDir.x, earDir.y, earDir.z], role: "hinge" });
    const disc = b.part(new THREE.CylinderGeometry(0.075, 0.072, 0.035, 14), FUR, {
      bone: ear,
      at: earPos,
      dir: [earDir.x, earDir.y, earDir.z],
    });
    const inner = earPos.clone().add(earDir.clone().multiplyScalar(0.016));
    b.part(new THREE.CylinderGeometry(0.056, 0.056, 0.008, 12), CREAM, {
      bone: ear,
      at: inner,
      dir: [earDir.x, earDir.y, earDir.z],
    });
    const rim = b.ring(disc, { count: 13, radius: 0.068 });
    b.cards(rim.items, tuft, {
      size: [0.05, 0.045],
      lean: 10,
      flow: [earDir.x, earDir.y, earDir.z],
      vary: 0.25,
      rng: rng(30 + s),
      color: EAR_FLUFF,
    });
    const innerRing = b.ring(disc, { count: 8, radius: 0.03, tilt: 50 });
    b.cards(innerRing.items, tuft, {
      size: [0.035, 0.04],
      vary: 0.25,
      rng: rng(40 + s),
      color: EAR_FLUFF,
    });
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = new THREE.Vector3(s * 0.115, G + 0.41, 0.035);
    const hold = s > 0 ? new THREE.Vector3(0.215, 0.41, 0.19) : new THREE.Vector3(-0.075, 0.5, 0.185);
    const pts = limb(sh, hold, [0.12, 0.11], s > 0 ? [0.2, -1, -0.4] : [-0.6, -1, 0]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.052, 0.04], { color: limbFur });
    const wrist = arm.joints[arm.joints.length - 1];
    const armDir = pts[2].clone().sub(pts[1]).normalize();
    const pawC = pts[2].clone().add(armDir.clone().multiplyScalar(0.012));
    b.part(new THREE.SphereGeometry(0.037, 10, 7).scale(1, 0.85, 1.1), PAW, { bone: wrist, at: pawC });
    const clawDir =
      s > 0 ? new THREE.Vector3(1, 0, -0.6).normalize() : armDir.clone().add(new THREE.Vector3(0.3, -0.5, 0)).normalize();
    for (const off of [-0.021, -0.007, 0.007, 0.021]) {
      const base = pawC.clone().add(clawDir.clone().multiplyScalar(0.028)).add(new THREE.Vector3(0, off, 0));
      b.spike(base, [clawDir.x, clawDir.y - 0.15, clawDir.z], 0.032, 0.0065, { color: CLAW, bone: wrist });
    }

    if (s < 0) {
      // the munching sprig held in the right paw
      const stem = catmull([
        [-0.1, 0.43, 0.21],
        [-0.075, 0.5, 0.19],
        [-0.1, 0.6, 0.22],
        [-0.17, 0.67, 0.23],
      ]);
      b.sweep(stem, [0.008, 0.004], { bone: wrist, color: TWIG });
      for (let i = 0; i < 6; i++) {
        const t = 0.45 + (0.55 * i) / 5;
        const base = stem.at(t);
        const tan = stem.tangentAt(t).normalize();
        const d = tan
          .clone()
          .multiplyScalar(0.4)
          .add(new THREE.Vector3(-0.6, -0.45 + (i % 2) * 0.3, 0.35 * (i % 2 ? 1 : -0.4)));
        leaf(base, d, R() * Math.PI, 0.1 + R() * 0.03, wrist, i === 2 ? leafB : leafA);
      }
    }
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.1, G + 0.1, 0.03],
        [s * 0.165, G + 0.19, 0.15],
        [s * 0.17, G + 0.045, 0.24],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.172, G, 0.27],
      },
    );
    b.sweep(leg, [0.07, 0.045], { color: limbFur });
    const ankle = leg.joints[leg.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.045, 10, 7).scale(0.95, 0.62, 1.35), PAW, {
      bone: ankle,
      at: [s * 0.172, G + 0.028, 0.27],
    });
    for (const off of [-0.024, -0.008, 0.008, 0.024]) {
      b.spike([s * 0.172 + off, G + 0.02, 0.322], [0, -0.35, 1], 0.026, 0.006, { color: CLAW, bone: ankle });
    }
  }

  // mid-munch: jaw dropped a little
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });

  return b.root;
}
