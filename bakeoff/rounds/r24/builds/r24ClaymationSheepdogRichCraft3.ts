import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  polyline,
  limb,
  mix,
  noise,
  paint,
  smoothstep,
  spots,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Sheepdog (Aardman clay)",
  description:
    "A shaggy grey-and-white sheepdog in a claymation style: bulging googly eyes, big buck teeth, lolling tongue, a floppy fringe, thumbprinted clay fur and a red polka-dot bandana. The jaw is separate and the legs, tail and neck are rigged.",
};

type C3 = readonly [number, number, number];

// ---------------------------------------------------------------- palette
const GREY_A = "#7d838e";
const GREY_B = "#a6abb4";
const WHITE_A = "#e7e2d3";
const WHITE_B = "#fbf8ee";
const MUD = "#7c5f40";
const NOSE = "#241c24";
const NOSTRIL = "#07050a";
const NOSE_SHINE = "#c9d2e6";
const TOOTH = "#fff8e4";
const PINK = "#e9808d";
const MOUTH = "#7a2230";
const EYEW = "#fffdf2";
const PUPIL = "#0c0910";
const LID = "#70747e";
const BROW = "#5e636d";
const GOLD = "#f0bf45";
const RED = "#d9352c";
const DOTW = "#fff6e8";
const CLAW = "#d9d2bd";

// ---------------------------------------------------------------- paints
// Clay thumbprint ripples: faint concentric wobble from low-frequency noise.
const ripple = (p: THREE.Vector3) => 0.04 * Math.sin(noise(p, 0.04, 21) * 26);
const shade = (c: C3, n: THREE.Vector3, p: THREE.Vector3): C3 => {
  const k = 0.8 + 0.2 * smoothstep(-0.9, 0.7, n.y) + ripple(p);
  return [Math.min(c[0] * k * (1 + 0.04 * n.y), 1), Math.min(c[1] * k, 1), Math.min(c[2] * k * (1 - 0.04 * n.y), 1)];
};
const greyMix = (p: THREE.Vector3, seed: number) => mix(GREY_A, GREY_B, noise(p, 0.08, seed));
const whiteMix = (p: THREE.Vector3, seed: number) => mix(WHITE_A, WHITE_B, noise(p, 0.07, seed));

// Grey rump, white shoulders and chest.
const coat = paint((p, n) => {
  const w = smoothstep(-0.02, 0.2, p.z + 0.07 * (noise(p, 0.12, 3) - 0.5));
  return shade(mix(greyMix(p, 4), whiteMix(p, 5), w), n, p);
});
// White face with a grey cap.
const headPaint = paint((p, n) => {
  const g = smoothstep(0.86, 0.93, p.y + 0.04 * (noise(p, 0.06, 8) - 0.5)) * (1 - smoothstep(0.62, 0.7, p.z));
  return shade(mix(whiteMix(p, 6), greyMix(p, 7), g), n, p);
});
const earPaint = paint((p, n) => shade(greyMix(p, 9), n, p));
const greyFur = paint((p, n) => shade(greyMix(p, 11), n, p));
const mudAt = (p: THREE.Vector3) => smoothstep(0.16, 0.02, p.y + 0.03 * (noise(p, 0.03, 13) - 0.5)) * 0.6;
const legFront = paint((p, n) => shade(mix(whiteMix(p, 10), MUD, mudAt(p)), n, p));
const legHind = paint((p, n) =>
  shade(mix(mix(greyMix(p, 12), whiteMix(p, 10), smoothstep(0.32, 0.16, p.y)), MUD, mudAt(p)), n, p),
);
const BANDANA = spots(RED, DOTW, { size: 0.035, amount: 0.7, seed: 4 });

// ---------------------------------------------------------------- textures
const TUFT = svg(
  `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#b4b4b4"/><stop offset="0.55" stop-color="#eeeeee"/><stop offset="1" stop-color="#ffffff"/>
    </linearGradient></defs>
    <path d="M3 64 C1 40 8 20 14 1 C19 22 23 42 21 64Z" fill="url(#g)" stroke="#9a9a9a" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M14 64 C14 38 22 18 30 0 C33 24 35 44 32 64Z" fill="url(#g)" stroke="#9a9a9a" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M24 64 C26 46 32 32 38 15 C39 36 39 52 36 64Z" fill="url(#g)" stroke="#9a9a9a" stroke-width="1.6" stroke-linejoin="round"/>
  </svg>`,
  { size: 128 },
);
const FRINGE = svg(
  `<svg viewBox="0 0 48 96" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="f" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#b0b0b0"/><stop offset="0.5" stop-color="#ececec"/><stop offset="1" stop-color="#ffffff"/>
    </linearGradient></defs>
    <path d="M1 96 C-1 60 5 30 11 3 C18 30 22 62 20 96Z" fill="url(#f)" stroke="#999" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M15 96 C15 56 24 26 33 0 C37 30 36 64 31 96Z" fill="url(#f)" stroke="#999" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M29 96 C31 62 40 40 46 16 C47 46 45 72 42 96Z" fill="url(#f)" stroke="#999" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M8 96 C9 74 14 58 22 44 C24 64 24 80 22 96Z" fill="url(#f)" stroke="#999" stroke-width="1.6" stroke-linejoin="round"/>
  </svg>`,
  { size: 160 },
);
const TAG = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#f0bf45" stroke="#9a6a14" stroke-width="3"/>
    <circle cx="32" cy="32" r="24" fill="none" stroke="#b8861f" stroke-width="2"/>
    <ellipse cx="32" cy="38" rx="9" ry="7.5" fill="#8a5a10"/>
    <ellipse cx="19" cy="30" rx="3.6" ry="4.6" fill="#8a5a10" transform="rotate(-20 19 30)"/>
    <ellipse cx="26" cy="21" rx="3.6" ry="4.8" fill="#8a5a10" transform="rotate(-6 26 21)"/>
    <ellipse cx="38" cy="21" rx="3.6" ry="4.8" fill="#8a5a10" transform="rotate(6 38 21)"/>
    <ellipse cx="45" cy="30" rx="3.6" ry="4.6" fill="#8a5a10" transform="rotate(20 45 30)"/>
    <ellipse cx="25" cy="14" rx="5" ry="2.4" fill="#fff2b8" opacity="0.8" transform="rotate(-25 25 14)"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "sheepdog" });

  // ============================================================ skeleton
  const hips = b.joint("hips", { at: [0, 0.5, -0.22], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.5, -0.22],
      [0, 0.52, -0.04],
      [0, 0.55, 0.12],
      [0, 0.58, 0.24],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.58, 0.24],
      [0, 0.68, 0.32],
      [0, 0.78, 0.42],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 0.78, 0.42], dir: [0, -0.12, 1], role: "head" });

  // Head-relative helper in metres: forward, up, left (negative = right).
  const H = (f: number, u: number, l = 0) => {
    const w: { forward: number; up: number; left?: number; right?: number } = { forward: f, up: u };
    if (l >= 0) w.left = l;
    else w.right = -l;
    return head.local(w);
  };

  const jaw = b.joint("jaw", { parent: head, at: H(0.08, -0.085), aim: H(0.29, -0.09), role: "jaw" });

  // ============================================================ body
  const body = b.sweep(spine, (t) => [0.165 + 0.04 * t, 0.19 + 0.04 * t], { color: coat });
  b.sweep(neck, (t) => 0.13 - 0.012 * t, { color: coat });

  // Shaggy coat over the back and flanks.
  const bodyHits = b.surface(body).scatter(260, {
    rng: rng(11),
    minDist: 0.045,
    filter: (h) => h.n.y > -0.45 && !(h.at.y > 0.42 && h.at.z > 0.3 && Math.abs(h.at.x) < 0.13),
  });
  b.cards(bodyHits, TUFT, { size: [0.075, 0.13], lean: 62, bend: 25, vary: 0.3, rng: rng(12), color: coat });

  // Long skirt hanging off the belly and flanks.
  const hang = (points: THREE.Vector3[], tex: typeof FRINGE, size: [number, number], seed: number, extra = {}) =>
    b.cards(
      points.map((p) => frame(p, [0, 1, 0])),
      tex,
      { size, lean: 180, flow: [0, 0, 1], vary: 0.25, rng: rng(seed), ...extra },
    );
  [128, 180, 232].forEach((ang, i) => {
    const fr = b.along(body.line(ang, -0.01), 11, () => {});
    b.cards(
      fr.map((f) => frame(f, [0, 1, 0])),
      FRINGE,
      { size: [0.09, 0.12], lean: 180, flow: [0, 0, 1], vary: 0.25, rng: rng(30 + i), color: coat },
    );
  });

  // Neck ruff: one ring at the shoulders, one behind the head.
  for (const [t, r, c] of [
    [0.1, 0.13, 12],
    [0.85, 0.115, 10],
  ] as [number, number, number][]) {
    const ruff = b.ring(neck.at(t), { count: c, radius: r }).items;
    b.cards(ruff, TUFT, { size: [0.09, 0.13], lean: 72, bend: 20, vary: 0.25, rng: rng(40 + c), color: coat });
  }

  // ============================================================ tail (a fluffy bob)
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.56, -0.33],
      [0, 0.64, -0.45],
      [0, 0.7, -0.54],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, [0.055, 0.045], { color: greyFur });
  const pom = b.part(new THREE.SphereGeometry(1, 12, 9), greyFur, {
    bone: tail.tip ?? tail.joints[1],
    at: [0, 0.72, -0.57],
    scale: [0.08, 0.08, 0.08],
  });
  b.cards(b.surface(pom).scatter(34, { rng: rng(21), minDist: 0.04 }), TUFT, {
    size: [0.055, 0.08],
    lean: 60,
    bend: 20,
    vary: 0.3,
    rng: rng(22),
    color: greyFur,
  });

  // ============================================================ legs
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";

    // ---- front leg
    const fpts = limb(
      [s * 0.12, 0.47, 0.16],
      [s * 0.12, 0.06, 0.18],
      [0.21, 0.15, 0.07],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const fleg = b.chain(`legF${sd}`, fpts, {
      parent: spine.joints[2],
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`, `pawF${sd}`],
      role: "leg",
    });
    b.sweep(fleg, (t) => 0.078 - 0.022 * t, { color: legFront });
    const fEnd = fpts[3];
    const fBone = fleg.tip ?? fleg.joints[2];
    b.part(new THREE.SphereGeometry(1, 12, 8), legFront, {
      bone: fBone,
      at: [fEnd.x, 0.048, fEnd.z + 0.025],
      scale: [0.072, 0.05, 0.095],
    });
    for (const k of [-1, 0, 1]) {
      const tz = fEnd.z + 0.095 - 0.008 * Math.abs(k);
      b.part(new THREE.SphereGeometry(0.027, 8, 6), legFront, {
        bone: fBone,
        at: [fEnd.x + k * 0.036, 0.03, tz],
      });
      b.part(new THREE.ConeGeometry(0.011, 0.03, 6), CLAW, {
        bone: fBone,
        at: [fEnd.x + k * 0.037, 0.022, tz + 0.03],
        dir: [0, -0.2, 1],
      });
    }
    for (const [t, r, c] of [
      [0.42, 0.085, 9],
      [0.88, 0.068, 9],
    ] as [number, number, number][]) {
      const items = b.ring(fleg.at(t), { count: c, radius: r }).items;
      b.cards(items, TUFT, {
        size: [0.06, 0.1],
        lean: 70,
        flow: [0, -1, 0],
        bend: 20,
        vary: 0.25,
        rng: rng(50 + c + Math.floor(t * 10) + (s > 0 ? 0 : 7)),
        color: legFront,
      });
    }

    // ---- hind leg with big haunch
    const hpts = limb(
      [s * 0.14, 0.45, -0.2],
      [s * 0.14, 0.06, -0.25],
      [0.19, 0.17, 0.1],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hleg = b.chain(`legH${sd}`, hpts, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `hock${sd}`, `pawH${sd}`],
      role: "leg",
    });
    b.sweep(hleg, (t) => 0.078 - 0.026 * t, { color: legHind });
    const hEnd = hpts[3];
    const hBone = hleg.tip ?? hleg.joints[2];
    const haunch = b.part(new THREE.SphereGeometry(1, 14, 10), coat, {
      bone: hleg.joints[0],
      at: [s * 0.155, 0.44, -0.2],
      scale: [0.095, 0.16, 0.15],
    });
    b.cards(b.surface(haunch).scatter(30, { rng: rng(60 + (s > 0 ? 1 : 2)), minDist: 0.045, filter: (h) => h.n.y > -0.4 }), TUFT, {
      size: [0.07, 0.12],
      lean: 65,
      bend: 22,
      vary: 0.3,
      rng: rng(62),
      color: coat,
    });
    b.part(new THREE.SphereGeometry(1, 12, 8), legHind, {
      bone: hBone,
      at: [hEnd.x, 0.048, hEnd.z + 0.025],
      scale: [0.072, 0.05, 0.095],
    });
    for (const k of [-1, 0, 1]) {
      const tz = hEnd.z + 0.095 - 0.008 * Math.abs(k);
      b.part(new THREE.SphereGeometry(0.027, 8, 6), legHind, { bone: hBone, at: [hEnd.x + k * 0.036, 0.03, tz] });
      b.part(new THREE.ConeGeometry(0.011, 0.03, 6), CLAW, {
        bone: hBone,
        at: [hEnd.x + k * 0.037, 0.022, tz + 0.03],
        dir: [0, -0.2, 1],
      });
    }
    for (const [t, r] of [
      [0.5, 0.075],
      [0.9, 0.066],
    ] as [number, number][]) {
      const items = b.ring(hleg.at(t), { count: 9, radius: r }).items;
      b.cards(items, TUFT, {
        size: [0.06, 0.1],
        lean: 70,
        flow: [0, -1, 0],
        bend: 20,
        vary: 0.25,
        rng: rng(70 + Math.floor(t * 10) + (s > 0 ? 0 : 5)),
        color: legHind,
      });
    }
  }

  // ============================================================ head
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), headPaint, {
    bone: head,
    at: H(0.07, 0.07),
    scale: [0.165, 0.155, 0.165],
  });

  // Upper muzzle: a fat clay snout.
  const muzzle = b.sweep(polyline([H(0.1, 0.01), H(0.3, -0.005)]), (t) => [0.095 - 0.03 * t, 0.072 - 0.017 * t], {
    bone: head,
    color: headPaint,
  });
  // Puffy lip jowls
  for (const s of [1, -1])
    b.capsule(H(0.13, -0.025, s * 0.088), H(0.28, -0.04, s * 0.058), 0.032, { bone: head, color: headPaint });

  // Big black nose with shine and nostrils.
  b.part(new THREE.SphereGeometry(1, 12, 9), NOSE, { bone: head, at: H(0.375, 0.012), scale: [0.055, 0.043, 0.045] });
  b.part(new THREE.SphereGeometry(0.009, 6, 5), NOSE_SHINE, { bone: head, at: H(0.4, 0.047, 0.02) });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 6, 5), NOSTRIL, {
      bone: head,
      at: H(0.417, 0.0, s * 0.02),
      scale: [0.01, 0.014, 0.006],
      dir: [0, 0, 1],
      axis: "z",
    });

  // Lower jaw (own joint), interior, tongue, teeth.
  b.sweep(polyline([H(0.08, -0.085), H(0.29, -0.09)]), (t) => [0.075 - 0.03 * t, 0.03 - 0.004 * t], {
    bone: jaw,
    color: headPaint,
  });
  b.sweep(polyline([H(0.1, -0.062), H(0.29, -0.066)]), () => [0.065, 0.01], { bone: jaw, color: MOUTH });
  const tongue = catmull([H(0.12, -0.066), H(0.27, -0.07), H(0.335, -0.115)]);
  b.sweep(tongue, (t) => [0.026 - 0.004 * t, 0.017], { bone: jaw, color: PINK });
  b.sweep(polyline([H(0.14, -0.049), H(0.3, -0.099)]), 0.0045, { bone: jaw, color: "#c4546a" });
  // Big buck teeth
  for (const [l, h] of [
    [-0.042, 0.03],
    [-0.014, 0.038],
    [0.014, 0.038],
    [0.042, 0.03],
  ] as [number, number][]) {
    b.part(new THREE.BoxGeometry(0.026, h, 0.013), TOOTH, { bone: head, at: H(0.315, -0.05 - h / 2 + 0.004, l) });
  }
  for (const l of [-0.025, 0.025])
    b.part(new THREE.BoxGeometry(0.018, 0.022, 0.01), TOOTH, { bone: jaw, at: H(0.295, -0.062, l) });

  // Wide grin lines draped on the muzzle.
  const muzzleSurf = b.surface(muzzle);
  for (const s of [1, -1]) {
    const path = catmull([H(0.3, -0.052, s * 0.045), H(0.2, -0.055, s * 0.085), H(0.115, -0.04, s * 0.1)]);
    b.sweep(muzzleSurf.drape(path, { lift: 0.002 }), 0.0055, { color: MOUTH });
  }

  // Googly eyes: bulging white balls, near-crossed pupils, heavy lids and brows.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.05, 14, 10), EYEW, { bone: head, at: H(0.2, 0.1, s * 0.065) });
    b.part(new THREE.SphereGeometry(0.026, 10, 8), PUPIL, { bone: head, at: H(0.234, 0.097, s * 0.059) });
    b.part(new THREE.SphereGeometry(0.008, 6, 5), "#ffffff", { bone: head, at: H(0.254, 0.109, s * 0.053) });
    b.part(new THREE.SphereGeometry(0.056, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), LID, {
      bone: head,
      at: H(0.2, 0.1, s * 0.065),
      dir: [0, 1, -0.7],
    });
    b.capsule(H(0.195, 0.162, s * 0.095), H(0.21, 0.168, s * 0.035), 0.017, { bone: head, color: BROW });
  }

  // Floppy ears with fringe.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 12, 9), earPaint, {
      bone: head,
      at: H(0.03, 0.01, s * 0.165),
      scale: [0.03, 0.12, 0.075],
      rotation: [0, 0, s * 10],
    });
    b.part(new THREE.SphereGeometry(1, 10, 8), earPaint, {
      bone: head,
      at: H(0.02, 0.07, s * 0.15),
      scale: [0.034, 0.06, 0.06],
    });
    hang(
      [-0.03, 0.0, 0.03, 0.06, 0.09].map((f) => H(f, -0.095, s * 0.19)),
      TUFT,
      [0.05, 0.08],
      80 + (s > 0 ? 0 : 1),
      { color: "#8c919b", bone: head },
    );
  }

  // Fringe: bangs drooping forward over the brow, two rows.
  const fringeRow = (f: number, size: [number, number], lean: number, seed: number) => {
    const roots = [-0.13, -0.09, -0.045, 0, 0.045, 0.09, 0.13].map((l) => {
      const u = 0.07 + 0.155 * Math.sqrt(Math.max(0.04, 1 - ((f - 0.07) / 0.165) ** 2 - (l / 0.165) ** 2));
      return frame(H(f, u - 0.01, l), [0, 1, 0]);
    });
    b.cards(roots, FRINGE, {
      size,
      lean,
      bend: 55,
      flow: [0, 0, 1],
      vary: 0.2,
      rng: rng(seed),
      color: headPaint,
      bone: head,
    });
  };
  fringeRow(0.12, [0.085, 0.13], 95, 90);
  fringeRow(0.04, [0.09, 0.14], 80, 91);

  // Fur on the crown, back and cheeks of the skull.
  b.cards(
    b.surface(skull).scatter(60, {
      rng: rng(92),
      minDist: 0.035,
      filter: (h) => h.at.z - 0.42 < 0.08 && h.n.y > -0.3,
    }),
    TUFT,
    { size: [0.06, 0.1], lean: 70, bend: 20, vary: 0.3, rng: rng(93), color: headPaint, bone: head },
  );

  // Beard under the chin (rides the jaw) and moustache at the lips.
  const beard: THREE.Vector3[] = [];
  for (const f of [0.1, 0.17, 0.24]) for (const l of [-0.055, 0, 0.055]) beard.push(H(f, -0.115, l));
  hang(beard, FRINGE, [0.06, 0.12], 94, { color: headPaint, bone: jaw });
  for (const s of [1, -1])
    hang(
      [H(0.17, -0.04, s * 0.105), H(0.23, -0.04, s * 0.095), H(0.28, -0.04, s * 0.08)],
      TUFT,
      [0.045, 0.075],
      95 + (s > 0 ? 0 : 1),
      { color: headPaint, bone: head },
    );

  // ============================================================ bandana, collar, tag
  const band = b.ring(neck.at(0.75), { count: 14, radius: 0.138 });
  b.sweep(catmull(band.items, { closed: true }), 0.017, { color: BANDANA });
  b.extrude(
    [
      [-0.1, 0],
      [0.1, 0],
      [0.06, -0.08],
      [0, -0.17, "sharp"],
      [-0.06, -0.08],
    ],
    {
      at: [0, 0.655, 0.485],
      x: [1, 0, 0],
      y: [0, 1, 0.3],
      thickness: 0.014,
      bevel: 0.004,
      color: BANDANA,
      bone: neck,
    },
  );
  const tagN = new THREE.Vector3(0, -0.3, 1).normalize();
  const tagAt = new THREE.Vector3(0, 0.575, 0.482);
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 16), GOLD, { bone: neck, at: tagAt, dir: [0, -0.3, 1] });
  b.part(new THREE.PlaneGeometry(0.058, 0.058), "#ffffff", {
    bone: neck,
    at: tagAt.clone().addScaledVector(tagN, 0.0055),
    dir: [tagN.x, tagN.y, tagN.z],
    axis: "z",
    texture: TAG,
  });

  // ============================================================ rest pose
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });

  return b.root;
}
