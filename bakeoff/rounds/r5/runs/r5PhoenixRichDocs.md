```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  limb,
  catmull,
  bezier,
  gradient,
  countershade,
  mottle,
  scales,
  paint,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Vermilion Phoenix",
  description:
    "A Genshin-style fire phoenix standing with wings spread: layered flame-feather wings, long trailing ribbon tail, gold jewellery with ruby gems, anime-eyed head with a flaming crest, and a jointed beak and talons.",
};

// ---------- palette ----------
const PALE = "#fff3b0";
const GOLD = "#ffc233";
const ORANGE = "#ff7a1a";
const RED = "#e0301e";
const CRIM = "#9c1020";
const DEEP = "#5a0c1c";
const GOLDM = "#f2b32a";
const RUBY = "#e5173a";
const BEAK = "#ffd35a";
const BEAK2 = "#f0a830";
const TALON = "#5b1a12";
const SHAFT = "#b3280f";

type Pt = [number, number] | [number, number, "sharp"];

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  type J = ReturnType<typeof b.joint>;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const rnd = rng(11);

  // ---------- textures ----------
  const flameA = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
      <path d="M16 63 C4 48 2 32 12 18 C14 12 15 6 16 1 C17 6 20 10 22 16 C30 30 28 48 16 63Z" fill="#e0301e"/>
      <path d="M16 60 C8 48 7 36 14 24 C15 18 16 14 16 10 C19 18 22 22 23 30 C26 42 22 52 16 60Z" fill="#ff7a1a"/>
      <path d="M16 57 C12 48 12 40 16 30 C20 40 20 48 16 57Z" fill="#ffd24a"/>
    </svg>`,
    { size: 128 },
  );
  const flameB = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
      <path d="M16 63 C3 50 4 34 10 22 C13 16 12 8 15 1 C17 8 21 12 22 18 C30 32 29 50 16 63Z" fill="#b3162a"/>
      <path d="M16 60 C8 50 8 38 13 27 C15 20 15 14 16 9 C20 18 22 24 23 32 C25 44 22 52 16 60Z" fill="#ff5a1f"/>
      <path d="M16 56 C12 48 13 40 16 32 C19 40 20 48 16 56Z" fill="#ffb32b"/>
    </svg>`,
    { size: 128 },
  );
  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
      <path d="M3 34 Q24 6 52 12 Q60 14 63 6 Q62 28 40 40 Q18 46 3 34Z" fill="#2a0a12"/>
      <path d="M8 33 Q26 15 50 19 Q56 28 38 37 Q20 41 8 33Z" fill="#fff4d6"/>
      <circle cx="31" cy="29" r="9" fill="#ff8f1f"/>
      <circle cx="31" cy="29" r="5" fill="#3a0612"/>
      <circle cx="35" cy="24" r="3" fill="#ffffff"/>
      <circle cx="27" cy="33" r="1.5" fill="#ffe27a"/>
    </svg>`,
    { size: 192 },
  );

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.86, -0.2], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.86, -0.2],
      [0, 0.93, 0.05],
      [0, 1.03, 0.25],
      [0, 1.14, 0.38],
    ]),
    { parent: hips, role: "spine" },
  );
  const spineLast = spine.joints[spine.joints.length - 1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.14, 0.38],
      [0, 1.28, 0.52],
      [0, 1.45, 0.56],
      [0, 1.6, 0.62],
    ]),
    { parent: spineLast, role: "neck" },
  );
  const neckLast = neck.joints[neck.joints.length - 1];
  const headJ = b.joint("head", {
    parent: neckLast,
    at: neck.at(1),
    dir: [0, -0.12, 1],
    role: "head",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.88, -0.25],
      [0, 0.86, -0.55],
      [0, 0.82, -0.85],
    ]),
    { parent: hips, role: "tail" },
  );
  const tailLast = tail.joints[tail.joints.length - 1];

  // ---------- body ----------
  const bodyPaint = countershade(mottle(RED, ORANGE, { size: 0.15, seed: 3 }), PALE, { level: -0.25, soft: 0.4 });
  const prof = (t: number) => 0.12 + 0.12 * Math.sin(Math.PI * (0.1 + 0.75 * t));
  const body = b.sweep(spine, (t: number): [number, number] => [prof(t) * 0.92, prof(t) * 1.05], {
    color: bodyPaint,
    sides: 10,
  });
  const neckSw = b.sweep(neck, [0.115, 0.085, 0.07, 0.066], {
    color: countershade(ORANGE, PALE, { level: -0.1 }),
    sides: 8,
  });
  const tailStalk = b.sweep(tail, [0.1, 0.07, 0.04], { color: RED, sides: 8 });

  // flame plumage cards over body and neck
  const skin = b.surface([body, neckSw]);
  const bodyHits = skin.scatter(300, { rng: rng(3), minDist: 0.048, filter: (h) => h.n.y > -0.4 });
  b.cards(bodyHits, [flameA, flameB], {
    size: [0.07, 0.15],
    lean: 60,
    bend: 30,
    vary: 0.3,
    spin: 20,
    rng: rng(5),
  });

  // gold collar and chest jewel
  const collar = b.surface(neckSw).loop(neck.joints[1], { lift: 0.012 });
  b.sweep(collar, 0.015, { color: GOLDM });
  const tailBand = b.surface(tailStalk).loop(tail.joints[0], { lift: 0.01 });
  b.sweep(tailBand, 0.014, { color: GOLDM });
  const chest = b.surface(body).around().at(0, 12);
  if (chest) {
    b.stick(new THREE.CylinderGeometry(0.045, 0.05, 0.02, 8), GOLDM, chest, { embed: 0.4 });
    b.stick(new THREE.OctahedronGeometry(0.034, 0), RUBY, chest.moved([0, 0.012, 0]), { embed: 0.2 });
  }

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(0.1, 10, 8), "#ffb23a", {
    bone: headJ,
    at: headJ.local({ forward: 0.06, up: 0.01 }),
    scale: [0.92, 0.95, 1.15],
  });
  // upper beak
  b.sweep(
    bezier(
      headJ.local({ forward: 0.12, up: 0.012 }),
      headJ.local({ forward: 0.26, up: 0.03 }),
      headJ.local({ forward: 0.34, down: 0.05 }),
    ),
    [0.05, 0],
    { bone: headJ, color: BEAK, sides: 6, caps: { start: "flat", end: "point" } },
  );
  // lower beak on the jaw
  const jaw = b.joint("jaw", {
    parent: headJ,
    at: headJ.local({ forward: 0.07, down: 0.05 }),
    aim: headJ.local({ forward: 0.2, down: 0.055 }),
    role: "jaw",
  });
  b.sweep(
    bezier(
      headJ.local({ forward: 0.07, down: 0.045 }),
      headJ.local({ forward: 0.2, down: 0.058 }),
      headJ.local({ forward: 0.28, down: 0.035 }),
    ),
    [0.038, 0],
    { bone: jaw, color: BEAK2, sides: 6, caps: { start: "flat", end: "point" } },
  );
  b.pose(jaw, { axis: [1, 0, 0], deg: 8 });

  // eyes
  for (const s of [1, -1]) {
    b.decal(skull, eyeTex, {
      at: headJ.local({ left: s * 0.075, up: 0.025, forward: 0.1 }),
      dir: [s * 0.9, 0.1, 0.35],
      size: [0.075, 0.056],
      mirror: s < 0,
      lift: 0.002,
    });
  }
  // forehead jewel
  const brow = b.surface(skull).around(skull.at).at(0, 55);
  if (brow) {
    b.stick(new THREE.ConeGeometry(0.03, 0.04, 6), GOLDM, brow, { embed: 0.3 });
    b.stick(new THREE.OctahedronGeometry(0.022, 0), RUBY, brow.moved([0, 0.02, 0]), { embed: 0.2 });
  }
  // head fluff
  const headHits = b
    .surface(skull)
    .scatter(34, { rng: rng(9), minDist: 0.028, filter: (h) => h.n.z < 0.3 && h.n.y > -0.2 });
  b.cards(headHits, [flameA, flameB], { size: [0.03, 0.07], lean: 70, flow: [0, 0, -1], vary: 0.3, rng: rng(10) });

  // ribbon helper (flame streamer)
  const ribbon = (
    pts: number[][],
    w: number,
    bone: J,
    cols: [string, string, string],
    wave: number,
    ph: number,
  ) => {
    const path = catmull(pts);
    const col = gradient(
      gradient(cols[0], cols[1], path.at(0), path.at(0.5)),
      cols[2],
      path.at(0.5),
      path.at(1),
    );
    return b.sweep(
      path,
      (t: number): [number, number] => [
        w * Math.pow(1 - t, 0.7) * (0.3 + 0.7 * Math.min(1, t * 5)) * (1 + wave * Math.sin(t * 12 + ph)),
        0.008,
      ],
      { color: col, bone, sides: 6, caps: { start: "round", end: "point" } },
    );
  };

  // flaming crest
  const H = headJ.at.clone();
  for (let i = -2; i <= 2; i++) {
    const a = Math.abs(i);
    const x = i * 0.025;
    ribbon(
      [
        [H.x + x * 0.8, H.y + 0.09, H.z + 0.04],
        [H.x + x * 1.6, H.y + 0.17 - a * 0.01, H.z - 0.08],
        [H.x + x * 2.8, H.y + 0.21 - a * 0.035, H.z - 0.3],
        [H.x + x * 3.8, H.y + 0.13 - a * 0.06, H.z - 0.56 - (2 - a) * 0.14],
      ],
      0.035,
      headJ,
      [RED, ORANGE, GOLD],
      0.2,
      i,
    );
  }

  // ---------- wings ----------
  const flameOutline = (L: number, W: number, notch: boolean): Pt[] =>
    notch
      ? [
          [0, -0.22 * W],
          [0.18 * L, -0.36 * W],
          [0.55 * L, -0.4 * W],
          [0.86 * L, -0.28 * W],
          [L, -0.04 * W, "sharp"],
          [0.84 * L, 0.1 * W, "sharp"],
          [0.91 * L, 0.42 * W, "sharp"],
          [0.6 * L, 0.6 * W],
          [0.25 * L, 0.58 * W],
          [0, 0.3 * W],
        ]
      : [
          [0, -0.22 * W],
          [0.18 * L, -0.36 * W],
          [0.55 * L, -0.4 * W],
          [0.86 * L, -0.2 * W],
          [L, 0.0, "sharp"],
          [0.8 * L, 0.4 * W],
          [0.5 * L, 0.58 * W],
          [0.2 * L, 0.56 * W],
          [0, 0.28 * W],
        ];

  const feather = (
    base: THREE.Vector3,
    d: THREE.Vector3,
    s: number,
    L: number,
    W: number,
    bone: J,
    cols: [string, string, string],
    notch: boolean,
    shaft: boolean,
  ) => {
    const dn = d.clone().normalize();
    const w = new THREE.Vector3(0, 1, 0).cross(dn).multiplyScalar(s).normalize();
    const mid = base.clone().addScaledVector(dn, L * 0.5);
    const tip = base.clone().addScaledVector(dn, L);
    const col = gradient(gradient(cols[0], cols[1], base, mid), cols[2], mid, tip);
    b.extrude(flameOutline(L, W, notch), {
      at: base,
      x: dn.toArray(),
      y: w.toArray(),
      thickness: 0.011,
      smoothing: 1,
      color: col,
      bone,
    });
    if (shaft) {
      b.rod(
        base.clone().add(V(0, 0.008, 0)),
        base.clone().addScaledVector(dn, L * 0.9).add(V(0, 0.008, 0)),
        [0.006, 0.002],
        { color: SHAFT, bone },
      );
    }
  };

  const wing = (s: number) => {
    const S = s > 0 ? "L" : "R";
    const sh = V(s * 0.2, 1.17, 0.28);
    const el = V(s * 0.62, 1.3, 0.08);
    const wr = V(s * 1.12, 1.43, 0.2);
    const ht = V(s * 1.5, 1.5, 0.1);
    const arm = b.chain(`arm${S}`, catmull([sh, el, wr, ht]), {
      parent: spine.joints[2],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`],
      role: "wing",
    });
    const j0 = arm.joints[0];
    const j1 = arm.joints[1];
    const j2 = arm.joints[2];
    const armSw = b.sweep(arm, [0.075, 0.06, 0.042, 0.022], { color: RED, sides: 8 });
    const rad = Math.PI / 180;

    // layered feather group: flight feather + two covert rows
    const group = (
      base: THREE.Vector3,
      d: THREE.Vector3,
      L: number,
      W: number,
      bone: J,
      cols: [string, string, string],
      notch: boolean,
      idx: number,
    ) => {
      const b0 = base.clone().add(V(0, idx * 0.003, 0));
      feather(b0, d, s, L, W, bone, cols, notch, true);
      feather(b0.clone().add(V(0, 0.02, 0)), d, s, L * 0.5, W * 0.95, bone, [PALE, GOLD, ORANGE], false, false);
      feather(b0.clone().add(V(0, 0.038, 0)), d, s, L * 0.27, W * 0.85, bone, [PALE, PALE, GOLD], false, false);
    };

    // tertials (shoulder -> elbow)
    for (let k = 0; k < 5; k++) {
      const base = sh.clone().lerp(el, 0.15 + 0.85 * (k / 4));
      const a = (92 - 10 * (k / 4)) * rad;
      group(base, V(s * Math.cos(a), 0.04, -Math.sin(a)), 0.38 + 0.04 * k, 0.13, j0, [GOLD, ORANGE, ORANGE], false, k);
    }
    // secondaries (elbow -> wrist)
    for (let j = 0; j < 9; j++) {
      const f = j / 8;
      const base = el.clone().lerp(wr, 0.04 + 0.96 * f);
      const a = (82 - 20 * f) * rad;
      group(
        base,
        V(s * Math.cos(a), 0.06 + 0.03 * f, -Math.sin(a)),
        0.42 + 0.2 * f,
        0.14,
        j1,
        [GOLD, ORANGE, RED],
        false,
        j + 5,
      );
    }
    // primaries (wrist -> hand), flame-tipped
    for (let i = 0; i < 9; i++) {
      const f = i / 8;
      const base = wr.clone().lerp(ht, 0.12 + 0.88 * f);
      const a = (55 - 60 * f) * rad;
      const L = 0.85 * (0.7 + 0.3 * (1 - Math.abs(i - 6) / 6));
      group(
        base,
        V(s * Math.cos(a), 0.1 + 0.06 * f, -Math.sin(a)),
        L,
        0.14,
        j2,
        [GOLD, ORANGE, CRIM],
        true,
        i + 14,
      );
    }
    // alula
    const alula: [number, number, number, number][] = [
      [0.5, 0.25, 0.8, 0.3],
      [0.8, 0.2, 0.6, 0.34],
      [0.95, 0.15, 0.3, 0.3],
    ];
    alula.forEach((u, n) => {
      feather(wr.clone().add(V(0, 0.03 + n * 0.004, 0)), V(s * u[0], u[1], u[2]), s, u[3], 0.07, j2, [PALE, GOLD, ORANGE], false, false);
    });
    b.spike(wr, [s * 0.3, 0.1, 0.9], 0.1, 0.018, { color: GOLDM, bone: j2 });

    // gold bands + gems
    const armSurf = b.surface(armSw);
    b.sweep(armSurf.loop(j2, { lift: 0.008 }), 0.013, { color: GOLDM });
    b.sweep(armSurf.loop(j1, { lift: 0.008 }), 0.013, { color: GOLDM });
    const gemHit = armSurf.nearest(V(wr.x, wr.y + 0.1, wr.z));
    b.stick(new THREE.CylinderGeometry(0.03, 0.034, 0.014, 8), GOLDM, gemHit, { embed: 0.4 });
    b.stick(new THREE.OctahedronGeometry(0.026, 0), RUBY, gemHit.moved([0, 0.008, 0]), { embed: 0.2 });

    // fluff on the arm
    const armHits = armSurf.scatter(22, { rng: rng(20 + (s > 0 ? 0 : 1)), minDist: 0.05, filter: (h) => h.n.y > -0.3 });
    b.cards(armHits, [flameA, flameB], {
      size: [0.06, 0.12],
      lean: 70,
      flow: [0, 0, -1],
      vary: 0.3,
      rng: rng(30),
    });
  };
  wing(1);
  wing(-1);

  // ---------- tail ----------
  const tailPath = (u: number, E: number, lift: number, kink: number) => {
    const xs = [0.06, 0.2, 0.5, 0.8, 1.0];
    const zs = [0, 0.18, 0.5, 0.82, 1.0];
    const ys = [0.9, 0.78, 0.44, 0.13, 0.11];
    const sway = [0, 0, 0.05, 0.1, 0.14];
    return xs.map((x, k) => [
      u * x + kink * sway[k],
      ys[k] + (k < 4 ? lift : 0),
      -0.7 - E * zs[k],
    ]);
  };
  for (let k = 0; k < 9; k++) {
    const u = (k - 4) / 4;
    const c = 1 - Math.abs(u);
    const E = 3.0 * (0.5 + 0.5 * c);
    ribbon(
      tailPath(u, E, 0, k % 2 ? 1 : -1),
      0.085,
      tailLast,
      k % 2 ? [GOLD, ORANGE, RED] : [ORANGE, RED, CRIM],
      0.25,
      rnd() * 6,
    );
  }
  for (let k = 0; k < 7; k++) {
    const u = ((k - 3) / 3) * 0.85;
    const c = 1 - Math.abs(u);
    const E = 1.7 * (0.5 + 0.5 * c);
    ribbon(tailPath(u, E, 0.03, k % 2 ? -1 : 1), 0.12, tailLast, [PALE, GOLD, ORANGE], 0.2, rnd() * 6);
  }

  // ---------- legs ----------
  const scalePaint = scales([GOLD, "#ffb02e"], "#a8610e", { size: 0.03, seed: 4 });
  const thighPaint = mottle(RED, ORANGE, { size: 0.1, seed: 8 });
  const legPaint = paint((p) => (p.y > 0.42 ? thighPaint : scalePaint));
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hip: [number, number, number] = [s * 0.15, 0.8, 0.02];
    const foot: [number, number, number] = [s * 0.17, 0.05, 0.2];
    const pts = limb(hip, foot, [0.3, 0.36, 0.3], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
      contact: [foot[0], 0, foot[2]],
    });
    const legSw = b.sweep(leg, [0.095, 0.07, 0.04, 0.03, 0.026], { color: legPaint, sides: 8 });
    const legSurf = b.surface(legSw);
    const thighHits = legSurf.scatter(26, { rng: rng(40 + (s > 0 ? 0 : 1)), minDist: 0.04, filter: (h) => h.at.y > 0.42 });
    b.cards(thighHits, [flameA, flameB], { size: [0.06, 0.12], lean: 60, bend: 25, vary: 0.3, rng: rng(41) });
    b.sweep(legSurf.loop(leg.joints[2], { lift: 0.01 }), 0.012, { color: GOLDM });

    // toes
    const footJ = leg.joints[leg.joints.length - 1];
    const angs = [-30, 0, 30, 180];
    const lens = [0.17, 0.22, 0.17, 0.12];
    angs.forEach((deg, i) => {
      const a = (deg * Math.PI) / 180;
      const start = V(foot[0], foot[1], foot[2]);
      const end = V(foot[0] + Math.sin(a) * lens[i], 0.02, foot[2] + Math.cos(a) * lens[i]);
      const mid = start.clone().lerp(end, 0.5);
      mid.y = 0.034;
      const toe = b.chain(`toe${i}${S}`, [start, mid, end], {
        parent: footJ,
        names: [`toe${i}${S}a`, `toe${i}${S}b`],
        role: "digit",
      });
      b.sweep(toe, [0.027, 0.014], { color: scalePaint, sides: 6 });
      const td = V(Math.sin(a), -0.4, Math.cos(a)).normalize();
      b.spike(end, td.toArray(), 0.075, 0.015, { color: TALON, bone: toe.joints[1] });
    });
  }

  return b.root;
}
```