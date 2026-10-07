import * as THREE from "three";
import { createBuilder, catmull, limb, rng, countershade, mottle, gradient, svg } from "../../../../src/index";

export const meta = {
  name: "Red Panda",
  description:
    "A chunky, stylized red panda standing in a neutral rest pose. It has a rust-and-chestnut coat, a white face with dark tear marks, " +
    "fluffy cheek ruffs, rounded white-lined ears, dark legs with splayed toes, and a big ringed bushy tail. " +
    "The rig has a spine, neck, head, a separate jaw, ear hinges, four legs with toe joints and a tail chain.",
};

// ---------- palette ----------
const RUST = "#c8501f";
const RUST_LIGHT = "#df7a30";
const RUST_FUR = "#d4622a";
const RUST_DEEP = "#8f3416";
const EAR_OUT = "#9a3a18";
const BELLY = "#3a1b12";
const LEG = "#2e1610";
const PAW = "#22100c";
const PAW_TOE = "#2a140f";
const CREAM = "#efe3cc";
const WHITE = "#fbf5ea";
const NOSE = "#120b0a";
const EYE = "#0c0706";
const TEAR = "#4a2013";
const CLAW = "#e6d8bb";
const T_LIGHT = "#d9682b";
const T_DEEP = "#a4401a";
const T_TIP = "#3b1a11";

// ---------- small helpers ----------
// smooth interpolation through evenly spaced keys (Catmull-Rom)
const keyed = (k: number[]) => (t: number): number => {
  const n = k.length - 1;
  const x = Math.min(Math.max(t, 0), 1) * n;
  const i = Math.min(Math.floor(x), n - 1);
  const f = x - i;
  const p0 = k[Math.max(i - 1, 0)];
  const p1 = k[i];
  const p2 = k[i + 1];
  const p3 = k[Math.min(i + 2, n)];
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * f +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f +
      (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f)
  );
};

// ellipsoid geometry
const ell = (rx: number, ry: number, rz: number, w = 10, h = 7): THREE.BufferGeometry => {
  const g = new THREE.SphereGeometry(1, w, h);
  g.scale(rx, ry, rz);
  return g;
};

const EAR_OUTLINE: [number, number][] = [
  [-0.032, 0],
  [0.032, 0],
  [0.036, 0.028],
  [0.016, 0.062],
  [0, 0.072],
  [-0.016, 0.062],
  [-0.036, 0.028],
];
const EAR_INNER: [number, number][] = [
  [-0.021, 0.006],
  [0.021, 0.006],
  [0.024, 0.026],
  [0.01, 0.05],
  [0, 0.057],
  [-0.01, 0.05],
  [-0.024, 0.026],
];

// a clump of fur with three tips, drawn white so it can be tinted
const TUFT_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">` +
  `<path fill="#ffffff" d="M4 64 C3 46 5 30 8 14 C9.5 22 11 28 12 32 C13 20 15 8 17 0 C19 10 21 22 22 30 C23 22 25 16 27 11 C29.5 30 30 46 28 64 Z"/>` +
  `</svg>`;

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "red_panda" });
  type Surf = ReturnType<typeof b.surface>;
  type JointT = ReturnType<typeof b.joint>;
  type RingItem = ReturnType<typeof b.ring>["items"][number];

  const pick = (surf: Surf, c: THREE.Vector3, az: number, el: number) =>
    surf.around(c).at(az, el) ?? surf.nearest(c);

  // ================= SKELETON =================
  const hips = b.joint("hips", { at: [0, 0.275, -0.17], dir: [0, 0, 1] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.275, -0.17],
      [0, 0.29, -0.04],
      [0, 0.295, 0.07],
      [0, 0.285, 0.17],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.285, 0.17],
      [0, 0.305, 0.21],
      [0, 0.33, 0.25],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", { parent: neck, at: [0, 0.33, 0.25], dir: [0, -0.05, 1], role: "head" });
  // model-axis offsets from the head joint
  const hl = (forward: number, up: number, left = 0) => head.local({ forward, up, left });
  const jaw = b.joint("jaw", { parent: head, at: hl(0.075, -0.03), dir: [0, 0, 1], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.28, -0.17],
      [0, 0.3, -0.28],
      [0, 0.31, -0.41],
      [0, 0.3, -0.54],
      [0, 0.285, -0.655],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ================= BODY =================
  const BODY = countershade(mottle(RUST, RUST_LIGHT, { size: 0.06, contrast: 0.5, seed: 2 }), BELLY, {
    level: -0.25,
  });
  const bodyRx = keyed([0.082, 0.098, 0.104, 0.1, 0.088]);
  const bodyRy = keyed([0.078, 0.09, 0.094, 0.09, 0.082]);
  const body = b.sweep(spine, (t: number): [number, number] => [bodyRx(t), bodyRy(t)], {
    color: BODY,
    shift: [0, -0.01],
    sides: 12,
  });
  b.sweep(neck, (t: number) => 0.08 - 0.008 * t, { color: BODY, sides: 10 });

  // ================= TAIL (ringed, bushy) =================
  const RINGS = 12;
  const tailR = keyed([0.05, 0.07, 0.086, 0.09, 0.083, 0.064, 0.042]);
  const tailColor = (t: number): string => {
    const k = Math.min(RINGS - 1, Math.floor(t * RINGS));
    return k === RINGS - 1 ? T_TIP : k % 2 ? T_DEEP : T_LIGHT;
  };
  b.sweep(tail, (t: number) => tailR(t), { color: tailColor, sides: 10 });

  const tuft = svg(TUFT_SVG, { size: 96 });
  const fur: Record<string, RingItem[]> = {};
  for (let k = 1; k < RINGS; k++) {
    for (const [off, count] of [
      [0.3, 7],
      [0.75, 8],
    ] as [number, number][]) {
      const t = (k + off) / RINGS;
      const col = tailColor(t);
      const items = b.ring(tail.at(t), { count, radius: tailR(t) * 0.9 }).items;
      (fur[col] ??= []).push(...items);
    }
  }
  let furSeed = 100;
  for (const col of Object.keys(fur)) {
    b.cards(fur[col], tuft, {
      size: [0.036, 0.06],
      lean: 62,
      bend: 20,
      vary: 0.25,
      rng: rng(furSeed++),
      color: col,
    });
  }

  // fur clumps over back and flanks
  const bodyHits = b.surface(body).scatter(220, {
    rng: rng(31),
    minDist: 0.026,
    filter: (h) => h.n.y > 0.05 && h.at.z < 0.13 && h.at.z > -0.23,
  });
  b.cards(bodyHits, tuft, {
    size: [0.034, 0.055],
    lean: 68,
    bend: 20,
    vary: 0.3,
    rng: rng(32),
    color: RUST_FUR,
  });

  // ================= HEAD =================
  const skullC = hl(0.06, 0.01);
  const SKULL = countershade(mottle(RUST, RUST_LIGHT, { size: 0.04, contrast: 0.5, seed: 4 }), CREAM, {
    level: -0.15,
  });
  const skull = b.part(ell(0.076, 0.063, 0.07, 14, 10), SKULL, { bone: head, at: skullC });
  const skullS = b.surface(skull);

  const muzzleC = hl(0.125, -0.012);
  const muzzle = b.part(ell(0.034, 0.028, 0.045, 12, 8), WHITE, { bone: head, at: muzzleC });
  const muzzleS = b.surface(muzzle);
  const faceS = b.surface([skull, muzzle]);

  // lower jaw: its own part on the jaw joint
  b.part(ell(0.025, 0.013, 0.037, 10, 6), WHITE, { bone: jaw, at: hl(0.115, -0.044) });

  // nose
  const noseHit = pick(muzzleS, muzzleC, 0, 12);
  b.part(ell(0.0175, 0.011, 0.0125, 10, 7), NOSE, {
    bone: head,
    at: noseHit.at.clone().addScaledVector(noseHit.n, 0.001),
    dir: noseHit.n,
  });

  // mouth: philtrum and lip lines, draped on the muzzle
  b.sweep(
    muzzleS.drape(catmull([hl(0.178, -0.019), hl(0.17, -0.031)]), { lift: 0.001 }),
    [0.0036, 0.003],
    { color: NOSE, bone: head, sides: 5 },
  );

  const cheeks: ReturnType<typeof b.part>[] = [];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // mouth line to the corner
    b.sweep(
      muzzleS.drape(catmull([hl(0.17, -0.031), hl(0.162, -0.035, s * 0.014), hl(0.145, -0.034, s * 0.028)]), {
        lift: 0.001,
      }),
      [0.0032, 0.0028],
      { color: NOSE, bone: head, sides: 5 },
    );

    // eye: dark mask patch, bead, highlight
    const eh = pick(skullS, skullC, s * 31, 14);
    const n = eh.n.clone();
    b.part(ell(0.021, 0.005, 0.03, 10, 6), TEAR, {
      bone: head,
      at: eh.at.clone().addScaledVector(n, -0.001),
      dir: n,
    });
    const eyeC = eh.at.clone().addScaledVector(n, 0.002);
    b.part(ell(0.0125, 0.0125, 0.0125, 10, 7), EYE, { bone: head, at: eyeC, dir: n });
    const upT = new THREE.Vector3(0, 1, 0).addScaledVector(n, -n.y).normalize();
    const hi = eyeC.clone().addScaledVector(n, 0.0103).addScaledVector(upT, 0.0055);
    b.part(new THREE.SphereGeometry(0.0042, 6, 4), WHITE, { bone: head, at: hi });

    // white eyebrow spot
    const bh = pick(skullS, skullC, s * 36, 36);
    b.part(ell(0.012, 0.004, 0.0075, 8, 5), WHITE, {
      bone: head,
      at: bh.at.clone().addScaledVector(bh.n, -0.0005),
      dir: bh.n,
    });

    // tear mark from the eye to the mouth corner
    const eyeLow = eh.at.clone().add(new THREE.Vector3(s * 0.002, -0.012, 0.002));
    const tearPath = faceS.drape(
      catmull([eyeLow, hl(0.122, -0.003, s * 0.042), hl(0.138, -0.019, s * 0.036), hl(0.147, -0.031, s * 0.028)]),
      { lift: 0.0015 },
    );
    b.sweep(tearPath, [0.0065, 0.0035], { color: TEAR, bone: head, sides: 6 });

    // cheek ruff
    const cc = hl(0.045, -0.014, s * 0.063);
    const cheek = b.part(ell(0.03, 0.044, 0.05, 9, 6), WHITE, { bone: head, at: cc, flat: true });
    cheeks.push(cheek);
    const TUFTS: [number, number, number, number, number, number, number][] = [
      [0.02, 0.025, 0.0, 1.0, 0.05, -0.55, 0.045],
      [0.027, 0.005, -0.015, 1.0, -0.25, -0.6, 0.052],
      [0.026, -0.018, -0.02, 0.9, -0.55, -0.6, 0.052],
      [0.018, -0.035, -0.01, 0.55, -0.9, -0.45, 0.046],
      [0.008, -0.043, 0.015, 0.2, -1.0, -0.2, 0.038],
    ];
    for (const [px, py, pz, dx, dy, dz, len] of TUFTS) {
      const base = cc.clone().add(new THREE.Vector3(s * px, py, pz));
      b.spike(base, [s * dx, dy, dz], len, 0.015, { color: WHITE, bone: head, sides: 5, smooth: false });
    }

    // whiskers
    for (let k = 0; k < 3; k++) {
      const wh = pick(muzzleS, muzzleC, s * (78 + k * 4), -4 + k * 7);
      b.spike(wh.at, [s, -0.15 + k * 0.15, -0.3], 0.07, 0.0028, {
        color: CREAM,
        bone: head,
        sides: 4,
      });
    }

    // ear: rounded slab with a white inner face and fluffy tufts, on a hinge joint
    const eb = pick(skullS, skullC, s * 66, 42);
    const yD = new THREE.Vector3(s * 0.3, 1, 0.08).normalize();
    const n0 = new THREE.Vector3(s * 0.55, 0.15, 0.82);
    const N = n0.clone().addScaledVector(yD, -n0.dot(yD)).normalize();
    const xD = new THREE.Vector3().crossVectors(yD, N).normalize();
    const earAt = eb.at.clone().addScaledVector(yD, -0.016);
    const ear = b.joint(`ear${side}`, { parent: head, at: earAt, dir: yD, role: "hinge" });
    b.extrude(EAR_OUTLINE, {
      at: earAt,
      x: xD,
      y: yD,
      thickness: 0.02,
      bevel: 0.005,
      smoothing: 1,
      color: EAR_OUT,
      bone: ear,
    });
    b.extrude(EAR_INNER, {
      at: earAt.clone().addScaledVector(N, 0.0105),
      x: xD,
      y: yD,
      thickness: 0.01,
      bevel: 0.002,
      smoothing: 1,
      color: WHITE,
      bone: ear,
    });
    for (const u of [-0.014, 0, 0.014]) {
      const base = earAt
        .clone()
        .addScaledVector(xD, u)
        .addScaledVector(yD, 0.022)
        .addScaledVector(N, 0.014);
      const d = yD.clone().multiplyScalar(0.35).addScaledVector(N, 0.8).addScaledVector(xD, u * 18);
      b.spike(base, d, 0.03, 0.007, { color: WHITE, bone: ear, sides: 5, smooth: false });
    }
  }

  // white fluff on the cheeks, a little rust fluff on the crown
  const cheekHits = b.surface(cheeks).scatter(40, {
    rng: rng(41),
    minDist: 0.022,
    filter: (h) => h.n.y > -0.3,
  });
  b.cards(cheekHits, tuft, {
    size: [0.03, 0.05],
    lean: 72,
    bend: 25,
    vary: 0.25,
    rng: rng(42),
    color: WHITE,
  });
  const crownHits = skullS.scatter(22, {
    rng: rng(43),
    minDist: 0.018,
    filter: (h) => h.n.y > 0.55 && Math.abs(h.at.x) < 0.04,
  });
  b.cards(crownHits, tuft, {
    size: [0.022, 0.034],
    lean: 70,
    bend: 20,
    vary: 0.25,
    rng: rng(44),
    color: RUST_LIGHT,
  });

  // ================= LEGS & PAWS =================
  const makePaw = (tipJ: JointT, tag: string, s: number, cx: number, cz: number, rx: number, rz: number) => {
    b.part(ell(rx, 0.03, rz, 10, 7), PAW, { bone: tipJ, at: [cx, 0.029, cz] });
    for (let i = 0; i < 4; i++) {
      const f = (i - 1.5) / 1.5; // -1 inner .. 1 outer
      const baseV = new THREE.Vector3(cx + s * f * rx * 0.66, 0.0085, cz + rz * (0.72 - 0.1 * f * f));
      const dirV = new THREE.Vector3(s * f * 0.32, 0, 1).normalize();
      const tipV = baseV.clone().addScaledVector(dirV, 0.03);
      const toe = b.joint(`toe${tag}${i + 1}`, { parent: tipJ, at: baseV, aim: tipV, role: "digit" });
      b.capsule(baseV, tipV, 0.0085, { color: PAW_TOE, bone: toe, sides: 6 });
      const clawBase = tipV.clone().addScaledVector(dirV, 0.008);
      const clawDir = dirV.clone().add(new THREE.Vector3(0, -0.45, 0)).normalize();
      b.spike(clawBase, clawDir, 0.014, 0.0042, { color: CLAW, bone: toe, sides: 5, smooth: false });
    }
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // front leg: shoulder, elbow, wrist
    const fPts = limb([s * 0.072, 0.228, 0.115], [s * 0.082, 0.05, 0.128], [0.1, 0.1], [[0, 0, -1]]);
    const front = b.chain(`legF${side}`, fPts, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
      contact: [s * 0.082, 0, 0.14],
    });
    b.sweep(front, [0.056, 0.044, 0.036, 0.031], {
      color: gradient(RUST_DEEP, LEG, [s * 0.072, 0.24, 0.12], [s * 0.08, 0.14, 0.12]),
      sides: 8,
    });
    makePaw(front.joints[front.joints.length - 1], `F${side}`, s, s * 0.084, 0.142, 0.033, 0.046);

    // hind leg: hip, knee (forward), ankle
    const hPts = limb([s * 0.075, 0.235, -0.11], [s * 0.082, 0.05, -0.135], [0.105, 0.105], [[0, 0, 1]]);
    const hind = b.chain(`legH${side}`, hPts, {
      parent: spine.joints[0],
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.082, 0, -0.11],
    });
    b.sweep(hind, [0.066, 0.05, 0.04, 0.032], {
      color: gradient(RUST_DEEP, LEG, [s * 0.075, 0.24, -0.11], [s * 0.08, 0.12, -0.12]),
      sides: 8,
    });
    makePaw(hind.joints[hind.joints.length - 1], `H${side}`, s, s * 0.084, -0.108, 0.035, 0.065);
  }

  return b.root;
}
