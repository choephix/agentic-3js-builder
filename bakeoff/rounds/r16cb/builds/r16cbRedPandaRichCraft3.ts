import * as THREE from "three";
import {
  createBuilder,
  rng,
  offset,
  catmull,
  limb,
  paint,
  mottle,
  gradient,
  mix,
  cells,
  svg,
} from "../../../../src/index";
import { cel, furEdge, animeEye, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded, Genshin-style red panda standing in a wide balancing stance on a mossy, rune-carved boulder, tail raised high, with big anime eyes, cream cheek ruffs, tear marks and a ringed bushy tail.",
};

// ------------------------------------------------------------------------------------------------
// Constants
const ST = 0.3; // stone top height
const BY = ST + 0.21; // body centre height
const H = 1.1; // head scale
const HJ = new THREE.Vector3(0, BY + 0.06, 0.34); // head joint

// Palette
const ORANGE = "#e8672b";
const RUST = "#b8431f";
const CREAM = "#fff1d8";
const DARK = "#3b221e";
const TEAR = "#8c3016";
const MOSS_A = "#80c03e";
const MOSS_B = "#5b9a2c";

const C_ORANGE = cel(ORANGE);
const C_CREAM = cel(CREAM, "#f1cba4");
const C_DARK = cel(DARK, "#231214");
const C_NOSE = cel("#2b1a24", INK);
const C_PINK = cel("#ee6f86");

// ------------------------------------------------------------------------------------------------
// Paints
const COAT = cel(furEdge(ORANGE, DARK, { level: -0.28, teeth: 0.28, period: 0.04 }));
const LEGC = cel(gradient(RUST, DARK, [0, BY - 0.02, 0], [0, ST + 0.09, 0]));
const TAILP = cel(
  paint((_p, _n, s) => {
    if (s[0] > 0.92) return "#5a2a1e";
    return Math.floor(s[0] * 8.5) % 2 ? "#a83c1d" : "#ee7a33";
  }),
);

function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const vx = bx - ax;
  const vy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(px - ax - t * vx, py - ay - t * vy);
}

const HEADP = cel(
  paint((p) => {
    const dx = Math.abs(p.x) / H;
    const dy = (p.y - HJ.y) / H;
    const dz = (p.z - HJ.z) / H;
    if (dz > 0.03) {
      if (segDist(dx, dy, 0.07, -0.012, 0.052, -0.062) < 0.0085) return TEAR;
      const brow = ((dx - 0.068) / 0.034) ** 2 + ((dy - 0.084) / 0.015) ** 2;
      if (brow < 1) return CREAM;
    }
    if (dy < -0.04 + 0.022 * zigzag(p.x / (0.034 * H))) return CREAM;
    return ORANGE;
  }),
);

const MOSS = mottle(MOSS_A, MOSS_B, { size: 0.07, seed: 2 });
const STONE_BASE = paint((p) => {
  const c = cells(p, 0.22, 4);
  return c.d2 - c.d1 < 0.07 ? "#59617a" : mix("#8e97ae", "#a4acc0", c.id);
});
const STONEC = cel(
  furEdge(MOSS, STONE_BASE, {
    level: 0.42,
    teeth: 0.4,
    period: 0.07,
    along: [0.7, 0, 0.7],
    ink: "#274a1c",
    inkWidth: 0.05,
  }),
);
const C_MOSS = cel(MOSS);

// ------------------------------------------------------------------------------------------------
// Textures
const MOSS_TUFT = svg(
  `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 64 C22 44 10 30 4 8 C16 20 22 32 25 44 Z" fill="#5b9a2c" stroke="#27491b" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M24 64 C26 40 30 18 36 2 C40 24 34 46 28 64 Z" fill="#7fc03e" stroke="#27491b" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M24 64 C26 50 38 40 46 26 C44 44 36 56 30 64 Z" fill="#96d44c" stroke="#27491b" stroke-width="2.4" stroke-linejoin="round"/>
  </svg>`,
  { size: 128 },
);
const DAISY = svg(
  `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 80 L32 34" stroke="#3f7a26" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M32 66 Q44 60 50 66 Q42 72 32 70Z" fill="#6fb53a" stroke="#27491b" stroke-width="1.8"/>
    <g fill="#fffaf0" stroke="#6b5a50" stroke-width="1.6">
      <ellipse cx="32" cy="14" rx="6" ry="11"/>
      <ellipse cx="32" cy="14" rx="6" ry="11" transform="rotate(72 32 28)"/>
      <ellipse cx="32" cy="14" rx="6" ry="11" transform="rotate(144 32 28)"/>
      <ellipse cx="32" cy="14" rx="6" ry="11" transform="rotate(216 32 28)"/>
      <ellipse cx="32" cy="14" rx="6" ry="11" transform="rotate(288 32 28)"/>
    </g>
    <circle cx="32" cy="28" r="6.5" fill="#ffc83a" stroke="#a8641a" stroke-width="1.8"/>
  </svg>`,
  { size: 128 },
);
const RUNE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#9cf04e" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="50" cy="50" r="44"/>
      <circle cx="50" cy="50" r="36" stroke-dasharray="4 6"/>
      <path d="M50 18 C66 34 66 56 50 78 C34 56 34 34 50 18Z"/>
      <path d="M50 30 L50 70 M50 52 L62 42 M50 60 L38 50"/>
      <path d="M16 50 L26 50 M74 50 L84 50 M50 8 L50 12"/>
    </g>
    <circle cx="50" cy="86" r="3" fill="#cfff8a"/>
    <circle cx="14" cy="50" r="2.5" fill="#cfff8a"/>
    <circle cx="86" cy="50" r="2.5" fill="#cfff8a"/>
  </svg>`,
  { size: 256 },
);
const EYE = animeEye({ iris: "#2fb8a0" });

// ------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "redPanda", paintSize: 2048 });

  // ---------------- Skeleton ----------------
  const hips = b.joint("hips", { at: [0, BY, -0.2], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, BY, -0.2],
      [0, BY + 0.005, -0.06],
      [0, BY + 0.012, 0.07],
      [0, BY + 0.02, 0.2],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, BY + 0.02, 0.2],
      [0, BY + 0.045, 0.28],
      [HJ.x, HJ.y, HJ.z],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: HJ, dir: [0, 0, 1], role: "head" });
  const hp = (l: number, u: number, f: number) => head.local({ left: l * H, up: u * H, forward: f * H });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.075, 0.13), aim: hp(0, -0.075, 0.25), role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, BY, -0.2],
      [0, BY + 0.03, -0.42],
      [0, BY + 0.12, -0.58],
      [0, BY + 0.27, -0.6],
      [0, BY + 0.4, -0.5],
    ]),
    { parent: hips, count: 6, role: "tail" },
  );

  // ---------------- Stone (built first so the panda stands on it) ----------------
  const stone = b.lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.45, 0.07],
      [0.47, 0.17],
      [0.42, 0.26],
      [0.33, 0.3],
      [0, 0.3],
    ],
    { at: [0, 0, 0.02], segments: 10, spin: 18, color: STONEC, bone: hips },
  );
  const rocks: [number[], number, number[]][] = [
    [[0.54, 0.07, 0.14], 0.1, [10, 30, 0]],
    [[-0.5, 0.06, -0.2], 0.09, [0, 80, 10]],
    [[0.12, 0.05, -0.56], 0.08, [20, 10, 0]],
  ];
  for (const [at, r, rot] of rocks)
    b.part(new THREE.IcosahedronGeometry(r, 0), STONEC, {
      bone: hips,
      at,
      scale: [1.2, 0.8, 1],
      rotation: rot,
      flat: true,
    });

  const stoneSkin = b.surface(stone);
  const rim = (h: { n: THREE.Vector3; at: THREE.Vector3 }) =>
    (h.n.y > 0.15 && h.n.y < 0.95) || (h.n.y >= 0.95 && Math.hypot(h.at.x, h.at.z - 0.02) > 0.3);
  const puffHits = stoneSkin.scatter(14, { rng: rng(3), minDist: 0.12, filter: rim });
  for (const h of puffHits)
    b.stick(new THREE.IcosahedronGeometry(0.055, 0), C_MOSS, h, { embed: 0.45, scale: [1.2, 0.55, 1.2], flat: true });
  const mossHits = stoneSkin.scatter(30, { rng: rng(4), minDist: 0.07, filter: rim });
  b.cards(mossHits, MOSS_TUFT, { size: [0.065, 0.075], lean: 15, bend: 20, vary: 0.3, cross: true, rng: rng(5), sink: 0.15 });
  const daisyHits = stoneSkin.scatter(5, {
    rng: rng(21),
    minDist: 0.14,
    filter: (h) => h.n.y > 0.2 && h.n.y < 0.97,
  });
  glow(b.cards(daisyHits, DAISY, { size: [0.045, 0.06], lean: 8, cross: true, rng: rng(6) }), 0.4);
  glow(
    b.decal(stone, RUNE, { at: [0, 0.15, 0.5], dir: [0, 0, 1], size: [0.2, 0.2], bone: hips, segments: 14 }),
    1,
  );

  // ---------------- Body ----------------
  const bodyR = (t: number): [number, number] => {
    const k = Math.sin(Math.PI * (0.15 + 0.7 * t));
    return [0.1 + 0.05 * k, 0.095 + 0.045 * k];
  };
  const body = b.sweep(spine, bodyR, { color: COAT });
  b.sweep(neck, 0.085, { color: COAT });

  // haunches
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      bone: hips,
      at: [s * 0.115, BY - 0.03, -0.2],
      scale: [0.075, 0.09, 0.1],
    });

  // fur tufts over the back and flanks
  const bodySkin = b.surface(body);
  for (const h of bodySkin.scatter(46, { rng: rng(11), minDist: 0.05, filter: (q) => q.n.y > -0.25 })) {
    const d = new THREE.Vector3(0, 0.15, -1).normalize().multiplyScalar(0.9).addScaledVector(h.n, 0.5).normalize();
    b.spike(h, d, 0.075, 0.022, { color: COAT });
  }

  // ---------------- Tail ----------------
  b.sweep(tail, (t) => 0.04 + 0.065 * Math.sin(Math.PI * (0.05 + 0.85 * t)), { color: TAILP });
  b.ring(tail.at(0.97), { count: 6, radius: 0.035, tilt: 55 }, (it) =>
    b.spike(it, it, 0.075, 0.026, { color: "#5a2a1e" }),
  );

  // ---------------- Legs ----------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    // hind
    const hipP = new THREE.Vector3(s * 0.115, BY - 0.045, -0.2);
    const ankleP = new THREE.Vector3(s * 0.135, ST + 0.035, -0.18);
    const hpts = limb(hipP, ankleP, [0.075, 0.075, 0.05], [[0, 0, 1], [0, 0, -1]]);
    const hind = b.chain(`legH${L}`, hpts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`, `foot${L}`],
      role: "leg",
    });
    b.sweep(hind, [0.07, 0.056, 0.044, 0.042], { color: LEGC });
    // front
    const shP = new THREE.Vector3(s * 0.115, BY - 0.045, 0.15);
    const handP = new THREE.Vector3(s * 0.15, ST + 0.035, 0.2);
    const fpts = limb(shP, handP, [0.08, 0.08], [[0, 0, -1]]);
    const fore = b.chain(`legF${L}`, fpts, {
      parent: chest,
      names: [`shoulder${L}`, `elbow${L}`, `hand${L}`],
      role: "arm",
    });
    b.sweep(fore, [0.065, 0.045, 0.042], { color: LEGC });

    // paws, toes and claws
    const paws: [typeof hind, number, number][] = [
      [hind, s * 0.135, -0.16],
      [fore, s * 0.15, 0.22],
    ];
    for (const [leg, px, pz] of paws) {
      const bone = leg.tip!;
      b.part(new THREE.SphereGeometry(1, 10, 8), C_DARK, {
        bone,
        at: [px, ST + 0.027, pz],
        scale: [0.045, 0.03, 0.062],
      });
      for (let i = -1; i <= 1; i++) {
        const tp = [px + i * 0.023, ST + 0.02, pz + 0.05 - Math.abs(i) * 0.008];
        b.part(new THREE.SphereGeometry(0.017, 6, 5), C_DARK, { bone, at: tp });
        b.spike(tp, [i * 0.1, -0.25, 1], 0.026, 0.0065, { color: CREAM, bone });
      }
    }
  }

  // ---------------- Head ----------------
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), HEADP, {
    bone: head,
    at: hp(0, 0.012, 0.07),
    scale: [0.14 * H, 0.115 * H, 0.125 * H],
  });
  const muzzle = b.part(new THREE.SphereGeometry(1, 12, 8), C_CREAM, {
    bone: head,
    at: hp(0, -0.047, 0.2),
    scale: [0.062 * H, 0.048 * H, 0.062 * H],
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), C_NOSE, {
    bone: head,
    at: hp(0, -0.022, 0.258),
    scale: [0.024 * H, 0.017 * H, 0.02 * H],
  });
  // mouth lines on the muzzle
  const muzzleSkin = b.surface(muzzle);
  const mouth = (pts: THREE.Vector3[]) =>
    b.sweep(muzzleSkin.drape(catmull(pts), { lift: 0.001 }), 0.0035 * H, { color: INK, bone: head, sides: 4 } as never);
  mouth([hp(0, -0.042, 0.262), hp(0, -0.068, 0.258)]);
  for (const s of [1, -1])
    mouth([hp(0, -0.068, 0.258), hp(s * 0.02, -0.08, 0.246), hp(s * 0.042, -0.072, 0.226)]);
  // lower jaw
  b.part(new THREE.SphereGeometry(1, 10, 6), C_CREAM, {
    bone: jaw,
    at: hp(0, -0.097, 0.2),
    scale: [0.046 * H, 0.02 * H, 0.055 * H],
  });
  b.part(new THREE.SphereGeometry(1, 8, 5), C_PINK, {
    bone: jaw,
    at: hp(0, -0.088, 0.205),
    scale: [0.025 * H, 0.008 * H, 0.035 * H],
  });

  // eyes
  for (const s of [1, -1])
    b.decal(skull, EYE, {
      at: hp(s * 0.065, 0.025, 0.18),
      dir: [s * 0.3, 0.02, 1],
      size: [0.052 * H, 0.071 * H],
      mirror: s > 0,
      segments: 12,
    });

  // ears
  const EAR: [number, number][] = [
    [-0.05, -0.02],
    [-0.04, 0.05],
    [0.0, 0.095],
    [0.045, 0.07],
    [0.06, 0.005],
    [0.02, -0.04],
  ];
  const cx = 0.005;
  const cy = 0.02;
  for (const s of [1, -1]) {
    const x: [number, number, number] = [s, 0, 0];
    const y: [number, number, number] = [s * 0.35, 1, 0];
    b.extrude(
      EAR.map(([ex, ey]) => [ex * H, ey * H] as [number, number]),
      { at: hp(s * 0.085, 0.09, 0.015), x, y, thickness: 0.03 * H, bevel: 0.004, smoothing: 1, color: C_ORANGE, bone: head },
    );
    b.extrude(
      EAR.map(([ex, ey]) => [(cx + (ex - cx) * 0.62) * H, (cy + (ey - cy) * 0.62) * H] as [number, number]),
      { at: hp(s * 0.085, 0.09, 0.032), x, y, thickness: 0.012 * H, smoothing: 1, color: C_CREAM, bone: head },
    );
  }

  // cheek ruffs and crest
  const skin = b.surface(skull);
  const centre = hp(0, 0.012, 0.07);
  const cheekSpots: [number, number, number][] = [
    [70, -6, -0.3],
    [88, -20, -0.4],
    [104, -34, -0.5],
    [52, -24, -0.1],
  ];
  for (const s of [1, -1])
    for (const [az, el, bz] of cheekSpots) {
      const hit = skin.around(centre).at(s * az, el);
      if (!hit) continue;
      b.spike(offset(hit, hit.n, -0.015), [s * 0.85, -0.2, bz], 0.1 * H, 0.03 * H, { color: C_CREAM, bone: head });
    }
  for (const az of [-28, 0, 28]) {
    const hit = skin.around(centre).at(az, 76);
    if (!hit) continue;
    b.spike(offset(hit, hit.n, -0.012), [az * 0.006, 1, -0.35], 0.07 * H, 0.022 * H, { color: C_ORANGE, bone: head });
  }
  // whiskers
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++)
      b.rod(hp(s * 0.05, -0.045 - i * 0.008, 0.235), hp(s * 0.15, -0.035 - i * 0.03, 0.2), [0.0028, 0.001], {
        color: CREAM,
        bone: head,
      });

  return b.root;
}
