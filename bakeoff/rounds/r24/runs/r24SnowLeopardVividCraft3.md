```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  limb,
  paint,
  spots,
  mottle,
  mix,
  noise,
  smoothstep,
  resolve,
  svg,
} from "agentic-3js-builder";
import type { ColorInput, Rgb, Joint, Part } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Snow Leopard on the Ledge",
  description:
    "A snow leopard pressed low on a wind-scoured ledge, ice crusted in its rosetted fur, its thick tail wrapped across its paws like a scarf, pale eyes fixed on something far below. Painted-gradient, soft rim-light look.",
};

// ---------------------------------------------------------------------------------------------------------
// Scale constants
const L = 0.18; // ledge top height
const H = 1.1; // head scale
const P = (x: number, y: number, z: number) => new THREE.Vector3(x, L + y, z);
const HC = P(0, 0.355, 0.55); // skull centre
const hp = (x: number, y: number, z: number) => new THREE.Vector3(HC.x + x * H, HC.y + y * H, HC.z + z * H);
const hs = (x: number, y: number, z: number): [number, number, number] => [x * H, y * H, z * H];

// ---------------------------------------------------------------------------------------------------------
// Palette
const DARK = "#2b2e3f";
const BELLY = "#f3f0e9";
const NOSE = "#7a5a66";
const LIP = "#25202b";
const ICE = "#cfeeff";
const WHISKER = "#f6f8fb";

const rgbOf = (r: number, g: number, b: number): Rgb => [r, g, b];

// ---------------------------------------------------------------------------------------------------------
// Painted-gradient shading: warm key from above-front, cool lavender shade, soft cyan rim from behind
const KEY = new THREE.Vector3(0.45, 0.8, 0.45).normalize();
const RIM = new THREE.Vector3(-0.7, 0.3, -0.65).normalize();
const WARM = rgbOf(1, 0.96, 0.88);
const COOL = rgbOf(0.42, 0.5, 0.78);
const RIMC = rgbOf(0.8, 0.94, 1);
const FROST_C = rgbOf(0.86, 0.95, 1);

function toon(base: ColorInput, rimAmt = 0.5) {
  return paint((p, n) => {
    const c = resolve(base, p, n);
    const lit = smoothstep(-0.5, 0.5, n.dot(KEY));
    const sh = mix(c, COOL, 0.33);
    const shaded = rgbOf(sh[0] * 0.86, sh[1] * 0.86, sh[2] * 0.9);
    let out = mix(shaded, c, lit);
    out = mix(out, WARM, 0.22 * smoothstep(0.55, 1, n.y));
    out = mix(out, RIMC, rimAmt * smoothstep(0.45, 0.85, n.dot(RIM)));
    return out;
  });
}

// ice crust on upward faces
function frost(base: ColorInput) {
  return paint((p, n) => {
    const up = smoothstep(0.35, 0.85, n.y);
    const f = noise(p, 0.05, 11) * 0.6 + noise(p, 0.16, 12) * 0.4;
    const a = up * smoothstep(0.44, 0.64, f);
    return mix(resolve(base, p, n), FROST_C, a * 0.85);
  });
}

const BACK = mottle("#c6c2be", "#a9a9b1", { size: 0.14, seed: 2 });
const furBase = paint((p, n) => {
  const belly = smoothstep(0.1, -0.55, n.y);
  const bib = smoothstep(0.35, 0.7, n.z) * smoothstep(L + 0.33, L + 0.22, p.y) * smoothstep(0.05, 0.18, p.z);
  return mix(resolve(BACK, p, n), BELLY, Math.max(belly, bib));
});
const rosettes = spots(furBase, [DARK, "#3a3d52"], { size: 0.06, amount: 0.55, rosette: true, seed: 5 });
const headSpots = spots(furBase, DARK, { size: 0.028, amount: 0.45, seed: 7 });
const pawSpots = spots("#e6e2da", DARK, { size: 0.03, amount: 0.25, seed: 8 });

const COAT = toon(frost(rosettes));
const HEADFUR = toon(frost(headSpots));
const PAW = toon(frost(pawSpots));
const MUZZLE = toon("#ece8e0", 0.4);
const CHIN = toon("#f6f3ec", 0.3);
const RUFF = toon("#eeeae4", 0.6);
const EARBACK = toon(DARK, 0.6);
const EARIN = toon("#e9e1d6", 0.3);

const tailRaw = paint((_p, _n, s) => {
  const t = s[0];
  if (t > 0.9) return DARK;
  if (t > 0.6 && Math.floor((t - 0.6) * 16) % 2 === 0) return DARK;
  return rosettes;
});
const TAIL = toon(frost(tailRaw));

const stoneRaw = paint((p, n) => {
  const strata = Math.sin(p.y * 70 + noise(p, 0.2, 3) * 6) * 0.5 + 0.5;
  const c = mix("#5d6376", "#8a90a4", noise(p, 0.12, 4) * 0.7 + strata * 0.3);
  const snow = smoothstep(0.7, 0.92, n.y) * smoothstep(0.4, 0.62, noise(p, 0.2, 6));
  return mix(c, rgbOf(0.92, 0.96, 1), snow * 0.9);
});
const STONE = toon(stoneRaw, 0.35);
const STONE_DARK = toon(mix("#3e4254", "#5a6075", 0.5), 0.2);
const SNOW = toon("#eef6fb", 0.7);

// ---------------------------------------------------------------------------------------------------------
// Textures
const EYE = svg(
  `<svg viewBox="0 0 64 44" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="c"><path d="M3 25 Q14 5 34 5 Q54 5 62 21 Q50 40 32 40 Q13 40 3 25Z"/></clipPath>
    <radialGradient id="i" cx="0.5" cy="0.62" r="0.62">
      <stop offset="0" stop-color="#f4fff8"/><stop offset="0.55" stop-color="#cfece3"/><stop offset="1" stop-color="#79b4a6"/>
    </radialGradient>
  </defs>
  <path d="M3 25 Q14 5 34 5 Q54 5 62 21 Q50 40 32 40 Q13 40 3 25Z" fill="#161621"/>
  <g clip-path="url(#c)">
    <circle cx="34" cy="25" r="17" fill="url(#i)"/>
    <ellipse cx="34" cy="9" rx="24" ry="9" fill="#2a3a4c" opacity="0.55"/>
    <circle cx="34" cy="26" r="7" fill="#0d0d14"/>
    <circle cx="34" cy="25" r="17" fill="none" stroke="#3f7f78" stroke-width="2"/>
  </g>
  <circle cx="28" cy="20" r="3.6" fill="#ffffff"/>
  <circle cx="40" cy="31" r="2" fill="#ffffff"/>
  <path d="M3 25 Q14 5 34 5 Q54 5 62 21" fill="none" stroke="#10101a" stroke-width="3.6" stroke-linecap="round"/>
  <path d="M4 26 L1.5 31" stroke="#10101a" stroke-width="3" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#8c8c8c"/><stop offset="0.5" stop-color="#d8d8d8"/><stop offset="1" stop-color="#ffffff"/>
  </linearGradient></defs>
  <path d="M16 63 C5 48 6 22 17 1 C25 22 27 46 16 63Z" fill="url(#g)"/>
  <path d="M12 63 C4 52 2 38 6 24 C10 38 14 48 12 63Z" fill="url(#g)"/>
</svg>`,
  { size: 128 },
);

const FROST_TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#7fc4e8"/><stop offset="0.6" stop-color="#d6f1ff"/><stop offset="1" stop-color="#ffffff"/>
  </linearGradient></defs>
  <path d="M16 63 L6 42 L10 43 L8 22 L14 31 L16 2 L19 29 L25 16 L23 42 L27 41Z" fill="url(#g)"/>
</svg>`,
  { size: 128 },
);

const WISP = svg(
  `<svg viewBox="0 0 24 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 78 C3 60 6 20 12 2 C18 20 21 60 12 78Z" fill="#eaf6ff"/>
  <path d="M12 70 C8 55 9 30 12 14 C15 30 16 55 12 70Z" fill="#ffffff"/>
</svg>`,
  { size: 128 },
);

const STAR = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 0 Q18 14 32 16 Q18 18 16 32 Q14 18 0 16 Q14 14 16 0Z" fill="#ffffff"/>
</svg>`,
  { size: 64 },
);

// ---------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "snowLeopard" });
  const R = rng(11);

  const ell = (
    color: ColorInput,
    at: THREE.Vector3,
    r: [number, number, number],
    bone: Joint,
    segs: [number, number] = [10, 7],
  ) => b.part(new THREE.SphereGeometry(1, segs[0], segs[1]), color, { bone, at, scale: r });

  // ------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: P(0, 0.17, -0.4), dir: [0, 0, 1], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    catmull([P(0, 0.17, -0.4), P(0, 0.17, -0.2), P(0, 0.2, 0), P(0, 0.23, 0.2)]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine", group: "body" },
  );
  const neck = b.chain("neck", catmull([P(0, 0.23, 0.2), P(0, 0.29, 0.34), P(0, 0.33, 0.46)]), {
    parent: spine,
    names: ["neck1", "neck2"],
    role: "neck",
    group: "head",
  });
  const head = b.joint("head", {
    parent: neck,
    at: P(0, 0.33, 0.46),
    dir: [0, -0.2, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hp(0, -0.045, 0.035),
    aim: hp(0, -0.065, 0.15),
    role: "jaw",
    group: "head",
  });

  const tailPts = [
    P(0, 0.17, -0.6),
    P(0.12, 0.1, -0.72),
    P(0.25, 0.08, -0.58),
    P(0.28, 0.075, -0.25),
    P(0.25, 0.085, 0.1),
    P(0.17, 0.12, 0.27),
    P(0.05, 0.145, 0.33),
    P(-0.09, 0.14, 0.33),
    P(-0.2, 0.11, 0.27),
    P(-0.28, 0.08, 0.15),
  ];
  const tail = b.chain("tail", catmull(tailPts), { parent: hips, count: 9, role: "tail", group: "tail" });

  // ------------------------------------------------------------------ body
  const st = (y: number, z: number, w: number, h: number) => ({ at: P(0, y, z), w, h });
  const bodyLoft = b.loft(
    [
      st(0.17, -0.62, 0.15, 0.15),
      st(0.16, -0.48, 0.3, 0.25),
      st(0.16, -0.28, 0.29, 0.23),
      st(0.18, -0.05, 0.31, 0.26),
      st(0.21, 0.15, 0.33, 0.3),
      st(0.24, 0.28, 0.25, 0.27),
    ],
    { bone: spine, color: COAT },
  );
  const neckMesh = b.sweep(neck, [0.098, 0.088], { color: COAT });
  const tailMesh = b.sweep(tail, [0.055, 0.07, 0.08, 0.085, 0.085, 0.08, 0.075, 0.065, 0.045], {
    color: TAIL,
    caps: "round",
  });

  // ------------------------------------------------------------------ legs
  const toesFor = (parent: Joint, tag: string, c: THREE.Vector3, n: number, gap: number) => {
    for (let i = 0; i < n; i++) {
      const x = c.x + (i - (n - 1) / 2) * gap;
      const tj = b.joint(`toe${tag}${i + 1}`, {
        parent,
        at: new THREE.Vector3(x, c.y, c.z),
        dir: [0, -0.05, 1],
        role: "digit",
        group: "legs",
      });
      const edge = i === 0 || i === n - 1 ? 0.8 : 1;
      b.part(new THREE.SphereGeometry(1, 7, 5), PAW, {
        bone: tj,
        at: new THREE.Vector3(x, c.y - 0.002, c.z + 0.022 * edge),
        scale: [0.0185, 0.017, 0.03 * edge],
      });
    }
  };

  const pawParts: Part[] = [];
  const shoulderBlobs: Part[] = [];

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // front leg
    const arm = limb(P(s * 0.13, 0.21, 0.14), P(s * 0.115, 0.06, 0.32), [0.17, 0.17], [[0, -0.6, -1]]);
    const armChain = b.chain(`legF${S}`, arm, {
      parent: spine.joints[2],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "leg",
      group: "legs",
    });
    b.sweep(armChain, [0.075, 0.055, 0.046], { color: COAT });
    const wrist = armChain.joints[armChain.joints.length - 1];
    shoulderBlobs.push(ell(COAT, P(s * 0.125, 0.23, 0.1), [0.075, 0.095, 0.13], armChain.joints[0], [10, 8]));
    pawParts.push(ell(PAW, P(s * 0.115, 0.036, 0.375), [0.052, 0.037, 0.08], wrist, [10, 7]));
    toesFor(wrist, `F${S}`, P(s * 0.115, 0.036, 0.42), 4, 0.026);

    // hind leg
    const hipP = P(s * 0.17, 0.2, -0.4);
    const kneeP = P(s * 0.26, 0.12, -0.18);
    const hockP = P(s * 0.24, 0.055, -0.47);
    const pawP = P(s * 0.19, 0.035, -0.2);
    const hind = b.chain(`legH${S}`, [hipP, kneeP, hockP], {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`],
      role: "leg",
      group: "legs",
    });
    b.sweep(hind, [0.075, 0.055, 0.045], { color: COAT });
    ell(COAT, P(s * 0.2, 0.14, -0.38), [0.09, 0.12, 0.15], hind.joints[0], [10, 8]);
    const foot = b.joint(`foot${S}`, { parent: hind, at: hockP, aim: pawP, role: "leg", group: "legs" });
    b.capsule(hockP, pawP, [0.042, 0.036], { color: COAT, bone: foot });
    pawParts.push(ell(PAW, P(s * 0.185, 0.032, -0.17), [0.045, 0.032, 0.06], foot, [9, 6]));
    toesFor(foot, `H${S}`, P(s * 0.185, 0.032, -0.12), 4, 0.022);
  }

  // ------------------------------------------------------------------ head
  const skull = ell(HEADFUR, hp(0, 0, 0), hs(0.098, 0.088, 0.1), head, [14, 10]);
  const cheeks: Part[] = [];
  for (const s of [1, -1]) {
    cheeks.push(ell(HEADFUR, hp(s * 0.075, -0.035, -0.015), hs(0.06, 0.055, 0.065), head, [10, 7]));
  }
  ell(MUZZLE, hp(0, -0.015, 0.095), hs(0.048, 0.038, 0.052), head, [10, 7]);
  ell(HEADFUR, hp(0, 0.01, 0.07), hs(0.03, 0.03, 0.055), head, [8, 6]); // nose bridge
  ell(NOSE, hp(0, 0.003, 0.145), hs(0.022, 0.015, 0.012), head, [8, 5]);
  b.rod(hp(0, -0.008, 0.147), hp(0, -0.045, 0.133), 0.0025, LIP, { bone: head, sides: 4 });
  ell(LIP, hp(0, -0.05, 0.1), hs(0.046, 0.004, 0.05), head, [8, 4]);
  ell(CHIN, hp(0, -0.066, 0.09), hs(0.04, 0.02, 0.055), jaw, [9, 6]);
  ell(CHIN, hp(0, -0.075, 0.135), hs(0.016, 0.014, 0.014), jaw, [6, 4]);

  // cheek ruff blades
  for (const s of [1, -1]) {
    for (let k = 0; k < 5; k++) {
      const base = hp(s * (0.09 + 0.003 * k), -0.015 - 0.016 * k, -0.01 - 0.014 * k);
      b.spike(base, [s * 0.5, -0.4 - 0.05 * k, -0.6], 0.065 * H - 0.004 * k, 0.02, {
        color: RUFF,
        bone: head,
        sides: 6,
      });
    }
  }

  // ears
  const EAR: [number, number][] = [
    [-0.042, 0],
    [-0.046, 0.03],
    [-0.03, 0.062],
    [0, 0.07],
    [0.03, 0.062],
    [0.046, 0.03],
    [0.042, 0],
  ];
  const EAR_IN: [number, number][] = [
    [-0.026, 0.004],
    [-0.028, 0.028],
    [-0.017, 0.048],
    [0, 0.054],
    [0.017, 0.048],
    [0.028, 0.028],
    [0.026, 0.004],
  ];
  const sc = (o: [number, number][]) => o.map(([x, y]) => [x * H, y * H] as [number, number]);
  for (const s of [1, -1]) {
    const x: [number, number, number] = [1, -s * 0.3, 0];
    const y: [number, number, number] = [s * 0.3, 1, 0];
    b.extrude(sc(EAR), {
      at: hp(s * 0.075, 0.055, -0.015),
      x,
      y,
      thickness: 0.022 * H,
      bevel: 0.004,
      smoothing: 1,
      color: EARBACK,
      bone: head,
    });
    b.extrude(sc(EAR_IN), {
      at: hp(s * 0.075, 0.055, -0.015 + 0.011),
      x,
      y,
      thickness: 0.012 * H,
      bevel: 0.002,
      smoothing: 1,
      color: EARIN,
      bone: head,
    });
  }

  // eyes
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 45, 10)!;
    const eye = b.decal(skin, EYE, { at: hit, size: [0.052 * H, 0.037 * H], mirror: s > 0 });
    glow(eye, 0.45);
  }

  // whiskers
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      b.rod(
        hp(s * 0.03, -0.02 - 0.006 * i, 0.125),
        hp(s * (0.15 + 0.012 * i), -0.03 - 0.022 * i, 0.07 - 0.012 * i),
        0.0017,
        WHISKER,
        { bone: head, sides: 4 },
      );
    }
    for (let i = 0; i < 2; i++) {
      b.rod(
        hp(s * 0.05, 0.045, 0.085),
        hp(s * (0.1 + 0.02 * i), 0.07 + 0.012 * i, 0.04 - 0.02 * i),
        0.0016,
        WHISKER,
        { bone: head, sides: 4 },
      );
    }
  }

  // ------------------------------------------------------------------ fur cards & ice
  const bodySkin = b.surface([bodyLoft, neckMesh]);
  b.cards(bodySkin.scatter(170, { rng: rng(21), minDist: 0.045, filter: (h) => h.n.y > -0.1 }), TUFT, {
    size: [0.032, 0.07],
    lean: 62,
    bend: 25,
    vary: 0.3,
    rng: rng(22),
    color: COAT,
  });
  const tailSkin = b.surface(tailMesh);
  b.cards(tailSkin.scatter(120, { rng: rng(23), minDist: 0.05, filter: (h) => h.n.y > -0.2 }), TUFT, {
    size: [0.036, 0.08],
    lean: 62,
    bend: 25,
    vary: 0.3,
    rng: rng(24),
    color: TAIL,
  });
  const cheekSkin = b.surface(cheeks);
  b.cards(cheekSkin.scatter(44, { rng: rng(25), minDist: 0.02, filter: (h) => h.n.y > -0.4 }), TUFT, {
    size: [0.03, 0.06],
    lean: 70,
    bend: 20,
    vary: 0.25,
    rng: rng(26),
    color: RUFF,
    flow: (f) => [Math.sign(f.at.x || 1) * 0.4, -0.3, -1],
  });

  // frost tufts on top faces
  const topSkin = b.surface([bodyLoft, tailMesh, neckMesh, shoulderBlobs, skull, pawParts]);
  b.cards(topSkin.scatter(75, { rng: rng(31), minDist: 0.06, filter: (h) => h.n.y > 0.45 }), FROST_TUFT, {
    size: [0.032, 0.058],
    lean: 25,
    vary: 0.3,
    rng: rng(32),
  });
  // crystal shards
  for (const hit of topSkin.scatter(30, { rng: rng(33), minDist: 0.07, filter: (h) => h.n.y > 0.55 })) {
    const k = 0.7 + R() * 0.9;
    glow(b.stick(new THREE.ConeGeometry(0.014 * k, 0.055 * k, 5), ICE, hit, { embed: 0.25 }), 0.35);
  }

  // sparkles
  const starFrames = [
    P(0.05, 0.46, -0.1),
    P(-0.12, 0.42, 0.02),
    P(0.14, 0.56, 0.62),
    P(-0.14, 0.52, 0.5),
    P(0.3, 0.22, -0.2),
    P(-0.3, 0.2, 0.3),
    P(0.18, 0.3, 0.8),
  ].map((q) => frame(q, [0, 1, 0]));
  glow(b.cards(starFrames, STAR, { size: 0.035, lean: 0, flow: [0, 0, -1], color: "#e2f7ff" }), 1);

  // ------------------------------------------------------------------ ledge
  const OUT: [number, number][] = [
    [-0.55, -0.8],
    [-0.62, -0.2],
    [-0.58, 0.35],
    [-0.45, 0.72],
    [-0.18, 0.86],
    [0.15, 0.8],
    [0.42, 0.88],
    [0.62, 0.55],
    [0.6, -0.1],
    [0.66, -0.55],
    [0.35, -0.88],
    [-0.1, -0.82],
  ];
  b.extrude(
    OUT.map(([x, z]) => [x * 1.09, z * 1.07] as [number, number]),
    {
      at: [0, 0.035, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.07,
      smoothing: 1,
      color: STONE_DARK,
      bone: hips,
    },
  );
  b.extrude(OUT, {
    at: [0, (0.06 + L) / 2, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: L - 0.06,
    bevel: 0.01,
    smoothing: 1,
    color: STONE,
    bone: hips,
  });

  // crumbled lip stones
  const rocks: [number, number, number, number][] = [
    [-0.5, 0.55, 0.06, 0.04],
    [0.55, 0.4, 0.07, 0.045],
    [-0.52, -0.5, 0.08, 0.05],
    [0.5, -0.65, 0.06, 0.04],
    [0.0, -0.8, 0.07, 0.04],
  ];
  for (const [x, z, rx, ry] of rocks) {
    b.part(new THREE.IcosahedronGeometry(1, 0), STONE, {
      bone: hips,
      at: [x, L + ry * 0.2, z],
      scale: [rx, ry, rx * 0.9],
      rotation: [0, x * 200, 0],
      flat: true,
    });
  }
  // snow drifts
  const drifts: [number, number, number, number][] = [
    [-0.4, -0.55, 0.16, 0.1],
    [0.42, -0.35, 0.12, 0.09],
    [-0.45, 0.2, 0.08, 0.14],
  ];
  for (const [x, z, rx, rz] of drifts) {
    b.part(new THREE.SphereGeometry(1, 10, 6), SNOW, { bone: hips, at: [x, L, z], scale: [rx, 0.02, rz] });
  }
  // icicles on the cliff face
  const icicles: [number, number, number][] = [
    [-0.35, 0.772, 0.09],
    [-0.27, 0.813, 0.06],
    [-0.05, 0.836, 0.11],
    [0.25, 0.83, 0.07],
    [0.32, 0.85, 0.1],
  ];
  for (const [x, z, len] of icicles) {
    glow(b.spike([x, L - 0.012, z - 0.012], [0, -1, 0], len, 0.012, { color: ICE, bone: hips, sides: 5 }), 0.3);
  }
  // wind-blown snow streaks
  const wispFrames = [
    [0.4, -0.2],
    [-0.42, -0.1],
    [0.45, 0.3],
    [-0.35, 0.5],
    [0.1, -0.78],
    [-0.2, -0.7],
  ].map(([x, z]) => frame([x, L + 0.003, z], [0, 1, 0]));
  b.cards(wispFrames, WISP, { size: [0.05, 0.28], lean: 90, flow: [0, 0, -1], mirror: true, bone: hips });

  return b.root;
}
```