import * as THREE from "three";
import { createBuilder, rng, offset, limb, paint, noise, mix, smoothstep, svg, catmull } from "../../../../src/index";

export const meta = {
  name: "Capybara with a Bird on its Head",
  description:
    "A chunky, whimsical capybara with sleepy sparkly eyes, buck teeth and blushing cheeks, daisies on its back, and a round little bluebird perched between its ears. Fully rigged with jaw, legs, bird wings, tail and beak.",
};

type B = ReturnType<typeof createBuilder>;

// A low-poly ellipsoid, used for most soft shapes.
function blob(b: B, color: any, at: any, radii: number[], opts: any = {}) {
  return b.part(new THREE.SphereGeometry(1, 10, 7), color, { at, scale: radii, ...opts });
}

export default function build() {
  const b = createBuilder({ name: "capybara" });
  const rand = rng(21);

  // ---------------------------------------------------------------- palette
  const INK = "#24140c";
  const EAR = "#7a4a28";
  const EARIN = "#e4a090";
  const NOSE = "#4a2e20";
  const NOSTRIL = "#140b07";
  const SKINF = "#5b3a24";
  const NAIL = "#2a1a10";
  const TOOTH = "#f6e8c2";
  const BEAK = "#ff9a2e";
  const BEAK2 = "#f07c1a";
  const BLUE = "#4a86e0";
  const NAVY = "#274f9c";

  // ---------------------------------------------------------------- paints
  const fur = paint((p, n) => {
    const big = noise(p, 0.22, 3);
    const fine = noise(p, 0.025, 9);
    let c = mix("#80512c", "#a9703c", big);
    c = mix(c, "#5c3820", 0.45 * smoothstep(0.55, 0.9, fine));
    c = mix(c, "#d2a374", smoothstep(0.05, -0.75, n.y)); // pale belly
    c = mix(c, "#e0a05a", 0.22 * smoothstep(0.5, 1, n.y)); // sun-warmed back
    c = mix(c, "#6a3f24", 0.6 * smoothstep(0.68, 0.88, p.z)); // reddish muzzle
    c = mix(c, "#4a2c18", 0.65 * smoothstep(0.12, 0.03, p.y)); // dark feet
    return c;
  });

  const birdCoat = paint((_p, n) => {
    let c = mix("#4a86e0", "#79b3ff", smoothstep(0.2, 1, n.y));
    c = mix(c, "#ffe6a0", smoothstep(0.1, -0.4, n.y));
    c = mix(c, "#ff9d52", 0.85 * smoothstep(0.35, 0.8, n.z) * smoothstep(0.35, -0.1, n.y));
    return c;
  });
  const birdHeadPaint = paint((_p, n) => mix("#ffe9a8", "#4a86e0", smoothstep(0.1, 0.6, n.y)));
  const wingInPaint = paint((_p, _n, s) => (s[1] > 0.05 ? "#3a70cc" : "#5b9bf0"));
  const wingOutPaint = paint((_p, _n, s) => (s[0] > 0.15 ? NAVY : s[1] > 0.045 ? "#2f5eb8" : "#4a86e0"));
  const tailPaint = paint((_p, _n, s) => (s[1] > 0.065 ? "#1f3f80" : "#3a70cc"));

  // ---------------------------------------------------------------- textures
  const EYE = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="c"><ellipse cx="32" cy="35" rx="23" ry="24"/></clipPath></defs>
      <ellipse cx="32" cy="35" rx="21" ry="22" fill="${INK}" stroke="#120a05" stroke-width="3"/>
      <g clip-path="url(#c)"><path d="M4 42 Q32 20 60 42 L60 6 L4 6 Z" fill="#8f5a32"/></g>
      <path d="M7 41 Q32 21 57 41" stroke="#120a05" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M55 39 L62 32 M52 34 L58 27" stroke="#120a05" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <circle cx="25" cy="42" r="7" fill="#ffffff"/>
      <circle cx="41" cy="49" r="3.4" fill="#ffffff"/>
      <circle cx="39" cy="38" r="2" fill="#ffffff"/>
    </svg>`,
    { size: 192 },
  );
  const BLUSH = svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="20" rx="28" ry="15" fill="#ef8f86"/>
      <path d="M16 24 l5 -9 M28 26 l5 -10 M40 24 l5 -9" stroke="#d46a68" stroke-width="3" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 128 },
  );
  let petals = "";
  for (let i = 0; i < 12; i++)
    petals += `<ellipse cx="0" cy="-18" rx="6" ry="12" fill="#ffffff" stroke="#e6bccb" stroke-width="1.6" transform="rotate(${i * 30})"/>`;
  const DAISY = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g transform="translate(32 32)">${petals}<circle r="8" fill="#ffc21a" stroke="#d98a00" stroke-width="2"/><circle cx="-2" cy="-2" r="2.5" fill="#ffe680"/></g></svg>`,
    { size: 128 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8a8a8a"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
      <path d="M3 64 Q9 30 17 1 Q25 30 29 64 Z" fill="url(#g)"/>
    </svg>`,
    { size: 96 },
  );
  const FEATHER = svg(
    `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9a9a9a"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
      <path d="M16 48 Q2 28 8 10 Q16 -2 24 10 Q30 28 16 48 Z" fill="url(#f)"/>
    </svg>`,
    { size: 64 },
  );

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.38, -0.25], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.38, -0.25],
      [0, 0.395, -0.02],
      [0, 0.41, 0.22],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.41, 0.22],
      [0, 0.44, 0.37],
      [0, 0.47, 0.5],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.47, 0.5], dir: [0, -0.06, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.395, 0.58], aim: [0, 0.385, 0.84], role: "jaw" });

  // ---------------------------------------------------------------- body
  const body = b.loft(
    [
      { at: [0, 0.37, -0.53], w: 0.22, h: 0.24 },
      { at: [0, 0.38, -0.42], w: 0.42, h: 0.4 },
      { at: [0, 0.39, -0.2], w: 0.5, h: 0.46 },
      { at: [0, 0.4, 0.05], w: 0.5, h: 0.46 },
      { at: [0, 0.41, 0.25], w: 0.44, h: 0.42 },
      { at: [0, 0.425, 0.36], w: 0.34, h: 0.34 },
    ],
    { bone: [hips, spine, neck], color: fur },
  );
  b.sweep(neck, [0.2, 0.15], { color: fur });
  blob(b, fur, [0, 0.335, -0.56], [0.04, 0.035, 0.035], { bone: hips }); // tail nub

  // ---------------------------------------------------------------- head
  const skull = b.loft(
    [
      { at: [0, 0.49, 0.46], w: 0.27, h: 0.27 },
      { at: [0, 0.49, 0.58], w: 0.27, h: 0.26 },
      { at: [0, 0.485, 0.7], w: 0.235, h: 0.21 },
      { at: [0, 0.48, 0.8], w: 0.21, h: 0.18 },
      { at: [0, 0.475, 0.87], w: 0.19, h: 0.16 },
    ],
    { bone: head, color: fur },
  );
  const skin = b.surface(skull);

  // lower jaw
  b.frustumBox([0, 0.37, 0.6], [0, 0.375, 0.83], [0.17, 0.06], [0.13, 0.045], { bone: jaw, color: fur });
  blob(b, fur, [0, 0.372, 0.84], [0.065, 0.026, 0.03], { bone: jaw }); // chin

  // nose pad, nostrils, shine
  blob(b, NOSE, [0, 0.48, 0.885], [0.078, 0.05, 0.042], { bone: head });
  for (const s of [1, -1]) {
    blob(b, NOSTRIL, [s * 0.03, 0.478, 0.921], [0.013, 0.01, 0.007], { bone: head });
  }
  blob(b, "#9a7a6a", [0, 0.506, 0.9], [0.014, 0.006, 0.01], { bone: head });

  // whimsical buck teeth
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.019, 0.03, 0.01), TOOTH, { bone: head, at: [s * 0.011, 0.388, 0.878] });

  // scent gland bump on the snout
  const gland = skin.ray([0, 1, 0.76], [0, -1, 0]);
  if (gland)
    b.stick(new THREE.SphereGeometry(1, 8, 6).scale(0.03, 0.012, 0.045), "#4a2e20", gland, { embed: 0.4, flow: [0, 0, 1] });

  // smile (draped on the skin)
  const smile = catmull([
    [0.12, 0.438, 0.655],
    [0.108, 0.418, 0.72],
    [0.09, 0.412, 0.8],
    [0.05, 0.422, 0.865],
    [0, 0.428, 0.885],
    [-0.05, 0.422, 0.865],
    [-0.09, 0.412, 0.8],
    [-0.108, 0.418, 0.72],
    [-0.12, 0.438, 0.655],
  ]);
  b.sweep(skin.drape(smile, { lift: 0.003 }), 0.0045, { color: INK, bone: head });

  // eyes and blush
  for (const s of [1, -1]) {
    const eyeHit = skin.around([0, 0.49, 0.62]).at(s * 62, 18);
    if (eyeHit) b.decal(skull, EYE, { at: eyeHit, size: [0.085, 0.085], segments: 8, mirror: s < 0 });
    const blushHit = skin.around([0, 0.49, 0.62]).at(s * 72, -8);
    if (blushHit) b.decal(skull, BLUSH, { at: blushHit, size: [0.06, 0.036], segments: 6 });
  }

  // ears
  for (const s of [1, -1]) {
    const nd = new THREE.Vector3(s * 0.75, 0.55, -0.1).normalize();
    const earAt = [s * 0.09, 0.612, 0.455];
    blob(b, EAR, earAt, [0.032, 0.042, 0.018], { bone: head, dir: nd, axis: "z" });
    blob(b, EARIN, offset(earAt, nd, 0.007), [0.02, 0.03, 0.012], { bone: head, dir: nd, axis: "z" });
  }

  // whiskers
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) {
      b.rod([s * 0.085, 0.462 - i * 0.012, 0.87], [s * (0.19 + i * 0.01), 0.5 - i * 0.045, 0.94], 0.0025, INK, {
        bone: head,
      });
    }

  // ---------------------------------------------------------------- legs
  const foot = (bone: any, x: number, z: number, toes: number) => {
    b.capsule([x, 0.036, z - 0.02], [x, 0.036, z + 0.05], 0.036, SKINF, { bone });
    for (let i = 0; i < toes; i++) {
      const k = i - (toes - 1) / 2;
      const a = [x + k * 0.028, 0.02, z + 0.05];
      const e = [x + k * 0.036, 0.02, z + 0.1];
      b.capsule(a, e, 0.017, SKINF, { bone });
      b.spike(e, [k * 0.15, 0, 1], 0.02, 0.011, { color: NAIL, bone });
    }
  };

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const fx = s * 0.15;
    const hx = s * 0.17;

    const armPts = limb([fx, 0.3, 0.17], [fx, 0.045, 0.215], [0.15, 0.13], [[0, 0, -1]]);
    const arm = b.chain(`arm${L}`, armPts, {
      parent: chest,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
    });
    b.sweep(arm, [0.072, 0.045], { color: fur });
    blob(b, fur, [fx, 0.32, 0.17], [0.065, 0.12, 0.13], { bone: arm.joints[0] });
    foot(arm.tip!, fx, 0.215, 4);

    const legPts = limb([hx, 0.3, -0.36], [hx, 0.045, -0.3], [0.15, 0.13], [[0, 0, 1]]);
    const leg = b.chain(`leg${L}`, legPts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
      contact: [hx, 0, -0.26],
    });
    b.sweep(leg, [0.09, 0.047], { color: fur });
    blob(b, fur, [s * 0.17, 0.3, -0.34], [0.07, 0.14, 0.16], { bone: leg.joints[0] });
    foot(leg.tip!, hx, -0.3, 3);
  }

  // ---------------------------------------------------------------- fur tufts & daisies
  const bodySkin = b.surface(body);
  const bodyHits = bodySkin.scatter(240, { rng: rand, minDist: 0.045, filter: (h: any) => h.n.y > -0.25 });
  b.cards(bodyHits, TUFT, { size: [0.045, 0.07], lean: 72, bend: 20, vary: 0.3, spin: 20, rng: rand, color: fur });

  const headHits = skin.scatter(70, {
    rng: rand,
    minDist: 0.035,
    filter: (h: any) => h.at.z < 0.57 && h.n.y > -0.4 && !(Math.abs(h.at.x) < 0.085 && h.n.y > 0.7),
  });
  b.cards(headHits, TUFT, { size: [0.032, 0.05], lean: 70, bend: 15, vary: 0.3, spin: 20, rng: rand, color: fur });

  const daisyHits = bodySkin.scatter(40, {
    rng: rng(9),
    minDist: 0.2,
    filter: (h: any) => h.n.y > 0.8 && h.at.z > -0.4 && h.at.z < 0.25,
  });
  daisyHits.slice(0, 5).forEach((h: any, i: number) => {
    const r = 0.03 + 0.006 * (i % 3);
    b.stick(new THREE.CircleGeometry(r, 12).rotateX(-Math.PI / 2).translate(0, 0.004, 0), "#ffffff", h, {
      texture: DAISY,
      embed: 0,
      spin: i * 37,
    });
  });
  const earDaisy = skin.ray([0.112, 0.9, 0.5], [0, -1, 0]);
  if (earDaisy)
    b.stick(new THREE.CircleGeometry(0.034, 12).rotateX(-Math.PI / 2).translate(0, 0.004, 0), "#ffffff", earDaisy, {
      texture: DAISY,
      embed: 0,
    });

  // ---------------------------------------------------------------- the little bird
  const birdBody = b.joint("birdBody", { parent: head, at: [0, 0.665, 0.52], dir: [0, 0, 1], role: "spine" });
  const birdHead = b.joint("birdHead", { parent: birdBody, at: [0, 0.69, 0.545], aim: [0, 0.725, 0.56], role: "head" });
  const birdJaw = b.joint("birdJaw", { parent: birdHead, at: [0, 0.714, 0.59], aim: [0, 0.712, 0.62], role: "jaw" });

  const birdTorso = blob(b, birdCoat, [0, 0.665, 0.52], [0.056, 0.05, 0.07], { bone: birdBody });
  blob(b, birdHeadPaint, [0, 0.725, 0.555], [0.042, 0.04, 0.04], { bone: birdHead });

  // fluffy feather cards on the bird's body
  const fluff = b.surface(birdTorso).scatter(40, { rng: rand, minDist: 0.02, filter: (h: any) => h.n.y < 0.6 });
  b.cards(fluff, FEATHER, { size: [0.022, 0.028], lean: 75, vary: 0.25, spin: 15, rng: rand, color: birdCoat });

  // beak
  b.spike([0, 0.722, 0.588], [0, -0.04, 1], 0.036, 0.014, { color: BEAK, bone: birdHead });
  b.spike([0, 0.712, 0.588], [0, 0, 1], 0.027, 0.0095, { color: BEAK2, bone: birdJaw });

  // big happy eyes, blush
  for (const s of [1, -1]) {
    blob(b, INK, [s * 0.029, 0.735, 0.578], [0.0105, 0.0115, 0.009], { bone: birdHead });
    blob(b, "#ffffff", [s * 0.034, 0.741, 0.585], [0.004, 0.004, 0.004], { bone: birdHead });
    blob(b, "#ff9aa0", [s * 0.033, 0.71, 0.57], [0.009, 0.006, 0.005], { bone: birdHead });
  }

  // crest
  const crest: [number[], number[]][] = [
    [[0, 0.756, 0.548], [0, 1, -0.35]],
    [[0.012, 0.754, 0.55], [0.35, 1, -0.3]],
    [[-0.012, 0.754, 0.55], [-0.35, 1, -0.3]],
  ];
  crest.forEach(([base, dir], i) =>
    b.spike(base, dir, i === 0 ? 0.045 : 0.035, 0.0085, { color: i === 0 ? NAVY : BLUE, bone: birdHead }),
  );

  // wings
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const sh = [s * 0.048, 0.69, 0.535];
    const wing = b.chain(
      `birdWing${L}`,
      [sh, [s * 0.105, 0.688, 0.53], [s * 0.19, 0.685, 0.52]],
      {
        parent: birdBody,
        names: [`birdWingShoulder${L}`, `birdWingElbow${L}`, `birdWingTip${L}`],
        role: "wing",
      },
    );
    b.extrude(
      [
        [0, -0.012],
        [0.04, -0.018],
        [0.075, -0.01],
        [0.085, 0.04],
        [0.08, 0.07],
        [0.04, 0.075],
        [0, 0.055],
      ],
      {
        at: sh,
        x: [s, 0, 0],
        y: [0, 0, -1],
        thickness: 0.008,
        bevel: 0.002,
        smoothing: 1,
        color: wingInPaint,
        bone: wing.joints[0],
      },
    );
    b.extrude(
      [
        [0.07, 0],
        [0.12, 0],
        [0.17, 0.03, "sharp"],
        [0.14, 0.045],
        [0.185, 0.07, "sharp"],
        [0.13, 0.07],
        [0.165, 0.1, "sharp"],
        [0.1, 0.085],
        [0.07, 0.08],
      ],
      {
        at: sh,
        x: [s, 0, 0],
        y: [0, 0, -1],
        thickness: 0.006,
        color: wingOutPaint,
        bone: wing.joints[1],
      },
    );

    // legs and toes
    const fx = s * 0.02;
    const bl = b.chain(
      `birdLeg${L}`,
      [
        [fx, 0.635, 0.52],
        [fx, 0.623, 0.532],
      ],
      { parent: birdBody, names: [`birdHip${L}`, `birdFoot${L}`], role: "leg", contact: [fx, 0.62, 0.535] },
    );
    b.sweep(bl, 0.0045, { color: BEAK2 });
    const toe = bl.tip!;
    for (let i = 0; i < 3; i++)
      b.spike([fx, 0.624, 0.535], [(i - 1) * 0.5, -0.06, 1], 0.022, 0.005, { color: BEAK2, bone: toe });
    b.spike([fx, 0.624, 0.535], [0, -0.05, -1], 0.014, 0.005, { color: BEAK2, bone: toe });

    // droop the wings a little
    b.pose(wing.joints[0], { axis: [0, 0, 1], deg: -s * 22 });
  }

  // tail
  const birdTail = b.chain(
    "birdTail",
    [
      [0, 0.665, 0.468],
      [0, 0.668, 0.43],
    ],
    { parent: birdBody, names: ["birdTail1", "birdTail2"], role: "tail" },
  );
  b.extrude(
    [
      [-0.014, 0],
      [0.014, 0],
      [0.045, 0.085, "sharp"],
      [0.016, 0.072],
      [0, 0.105, "sharp"],
      [-0.016, 0.072],
      [-0.045, 0.085, "sharp"],
    ],
    {
      at: [0, 0.662, 0.465],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.006,
      color: tailPaint,
      bone: birdTail.joints[0],
    },
  );
  b.pose(birdTail.joints[0], { axis: [1, 0, 0], deg: 10 });

  return b.root;
}
