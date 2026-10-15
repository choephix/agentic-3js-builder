```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  limb,
  countershade,
  mottle,
  grain,
  gradient,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Capybara with a Small Bird",
  description:
    "A chubby, sleepy-eyed capybara with a cheek-blushed grin and buck teeth, calmly carrying a tiny teal-and-sun-yellow crested bird on its head.",
};

type B = ReturnType<typeof createBuilder>;
type J = ReturnType<B["joint"]>;

// ---------------------------------------------------------------- palette
const BROWN_D = "#7a4626";
const BROWN = "#a5683a";
const BROWN_L = "#cf9358";
const BELLY = "#e2b57c";
const MUZZLE = "#c98c56";
const CHIN = "#d9a470";
const NOSE_C = "#4a2c22";
const EAR_IN = "#e0907c";
const TOE = "#5d3a28";
const NAIL = "#ecd8ac";
const CREAM = "#fff3cf";
const TOOTH = "#fff0c0";
const WHISKER = "#f6e6c4";

const TEAL = "#27bdb3";
const TEAL_D = "#13837f";
const SUN = "#ffd33f";
const ORANGE = "#ff8f2e";
const CHEEK = "#ff6f5e";
const PUPIL = "#1b1030";

// ---------------------------------------------------------------- paints
const FUR = mottle(
  grain(BROWN, BROWN_L, { size: 0.03, axis: "z" }),
  grain(BROWN_D, BROWN, { size: 0.03, axis: "z", seed: 3 }),
  { size: 0.2, seed: 4 },
);
const COAT = countershade(FUR, grain(BELLY, MUZZLE, { size: 0.03, axis: "z", seed: 5 }), { level: -0.3, soft: 0.4 });
const FACE = gradient(COAT, MUZZLE, [0, 0.5, 0.6], [0, 0.49, 0.78]);
const LEGS = gradient(COAT, "#5a3a26", [0, 0.2, 0], [0, 0.03, 0]);
const BIRD_BODY = countershade(TEAL, SUN, { level: -0.15, soft: 0.25 });
const BIRD_HEAD = countershade(TEAL, SUN, { level: -0.45, soft: 0.2 });

// ---------------------------------------------------------------- textures
const EYE_TEX = svg(
  `<svg viewBox="0 0 64 64">
    <ellipse cx="32" cy="35" rx="22" ry="21" fill="#2b1a10"/>
    <ellipse cx="32" cy="36" rx="16" ry="16" fill="#5a3418"/>
    <ellipse cx="32" cy="37" rx="9" ry="10" fill="#1a0e08"/>
    <circle cx="26" cy="38" r="6" fill="#ffffff"/>
    <circle cx="40" cy="44" r="2.8" fill="#ffffff"/>
    <path d="M8 36 Q32 16 56 36 Q58 8 32 6 Q6 8 8 36Z" fill="#9a6034" stroke="#3a2010" stroke-width="3" stroke-linejoin="round"/>
    <path d="M9 35 Q32 18 55 35" stroke="#3a2010" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M9 34 L2 28 M12 38 L4 38" stroke="#2b1a10" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);
const BLUSH_TEX = svg(
  `<svg viewBox="0 0 40 24">
    <ellipse cx="20" cy="12" rx="18" ry="10" fill="#ee8f86"/>
    <path d="M10 16 L13 7 M18 17 L21 8 M26 16 L29 7" stroke="#d6665e" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`,
  { size: 200 },
);
const NOSE_TEX = svg(
  `<svg viewBox="0 0 80 50">
    <path d="M18 14 Q6 22 20 32 Q30 24 18 14Z" fill="#1a0e0a"/>
    <path d="M62 14 Q74 22 60 32 Q50 24 62 14Z" fill="#1a0e0a"/>
    <path d="M40 22 L40 40" stroke="#1a0e0a" stroke-width="3" stroke-linecap="round"/>
    <path d="M22 7 Q40 1 58 7" stroke="#9a6a58" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);
const SMILE_TEX = svg(
  `<svg viewBox="0 0 40 20">
    <path d="M4 5 Q20 22 36 5" stroke="#2e1a10" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M2 3 L6 8" stroke="#2e1a10" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`,
  { size: 200 },
);
function tuftSvg(a: string, b: string, c: string, line: string) {
  return svg(
    `<svg viewBox="0 0 32 64">
      <path d="M16 2 C22 18 25 40 17 62 C8 42 10 20 16 2Z" fill="${a}" stroke="${line}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M8 16 C10 30 8 48 4 60 C0 46 3 28 8 16Z" fill="${b}" stroke="${line}" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M25 20 C29 34 29 48 27 58 C21 46 21 32 25 20Z" fill="${c}" stroke="${line}" stroke-width="1.4" stroke-linejoin="round"/>
    </svg>`,
    { size: 128 },
  );
}
const TUFT_A = tuftSvg("#8a5330", "#a8693a", "#6a3c20", "#4a2a14");
const TUFT_B = tuftSvg("#cf9358", "#e2b57c", "#b87d46", "#6a4020");
const TUFT_Y = tuftSvg("#ffd33f", "#ffe58a", "#f5b52a", "#b87a10");

// ---------------------------------------------------------------- helpers
const flatBasis = (y: number[]) => {
  const Y = new THREE.Vector3(y[0], y[1], y[2]).normalize();
  const X = new THREE.Vector3(-Y.z, 0, Y.x).normalize();
  return { x: [X.x, X.y, X.z], y: [Y.x, Y.y, Y.z] };
};

export default function build() {
  const b = createBuilder({ name: "capybara" });
  const R = rng(11);

  const blob = (
    color: any,
    at: number[],
    size: number[],
    bone: J,
    opts: Record<string, unknown> = {},
    seg: [number, number] = [10, 8],
  ) =>
    b.part(new THREE.SphereGeometry(1, seg[0], seg[1]), color, {
      at,
      bone,
      scale: size,
      flat: true,
      ...opts,
    } as any);

  // ------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.36, -0.25], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.36, -0.25], [0, 0.37, 0], [0, 0.385, 0.25]]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 0.385, 0.25], [0, 0.44, 0.34], [0, 0.49, 0.42]]), {
    parent: spine,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck, at: [0, 0.49, 0.42], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.425, 0.55], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.34, -0.44], [0, 0.33, -0.52], [0, 0.31, -0.58]]), {
    parent: hips,
    names: ["tail1", "tail2"],
    role: "tail",
  });

  // ------------------------------------------------------------ body
  const body = b.loft(
    [
      { at: [0, 0.34, -0.4], w: 0.24, h: 0.28 },
      { at: [0, 0.35, -0.28], w: 0.38, h: 0.4 },
      { at: [0, 0.36, -0.05], w: 0.42, h: 0.44 },
      { at: [0, 0.37, 0.15], w: 0.41, h: 0.44 },
      { at: [0, 0.385, 0.28], w: 0.34, h: 0.38 },
      { at: [0, 0.41, 0.36], w: 0.24, h: 0.28 },
    ],
    { bone: [hips, spine, neck], color: COAT, detail: 1.5 } as any,
  );

  b.sweep(tail, [0.045, 0.028], { color: BROWN_D });

  // ------------------------------------------------------------ head
  const headLoft = b.loft(
    [
      { at: [0, 0.49, 0.42], w: 0.2, h: 0.22 },
      { at: [0, 0.5, 0.52], w: 0.22, h: 0.24 },
      { at: [0, 0.5, 0.62], w: 0.21, h: 0.23 },
      { at: [0, 0.495, 0.7], w: 0.2, h: 0.21 },
      { at: [0, 0.49, 0.77], w: 0.18, h: 0.19 },
    ],
    { bone: head, color: FACE, detail: 1.5, caps: { start: "round", end: "flat" } } as any,
  );
  const headSurf = b.surface(headLoft);
  const HC: [number, number, number] = [0, 0.5, 0.62];

  // lower jaw (separate bone)
  b.frustumBox([0, 0.392, 0.52], [0, 0.392, 0.745], [0.13, 0.05], [0.14, 0.05], { color: CHIN, bone: jaw });
  blob(CHIN, [0, 0.395, 0.745], [0.072, 0.026, 0.03], jaw);

  // nose pad + nostril drawing
  const nosePad = blob(NOSE_C, [0, 0.5, 0.775], [0.082, 0.06, 0.034], head, {}, [12, 8]);
  b.decal(nosePad, NOSE_TEX, { at: [0, 0.502, 0.807], dir: [0, 0, 1], size: [0.115, 0.07], bone: head });
  // morrillo (scent gland bump)
  const mseat = headSurf.ray([0, 1, 0.71], [0, -1, 0]);
  blob("#6b4228", [0, (mseat ? mseat.at.y : 0.6) - 0.002, 0.71], [0.036, 0.014, 0.055], head);
  // buck teeth
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.019, 0.036, 0.012), TOOTH, { at: [s * 0.0105, 0.43, 0.77], bone: head });

  // whiskers
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) {
      const y0 = 0.49 - i * 0.012;
      b.rod([s * 0.085, y0, 0.74], [s * 0.19, y0 + (1 - i) * 0.035, 0.8 - i * 0.02], 0.0022, {
        color: WHISKER,
        bone: head,
      });
    }

  // eyes, blush, smile as decals
  for (const s of [1, -1]) {
    const eh = headSurf.around(HC).at(s * 52, 18);
    if (eh) b.decal(headLoft, EYE_TEX, { at: eh, size: [0.062, 0.062], mirror: s > 0 });
    const bh = headSurf.around(HC).at(s * 56, -4);
    if (bh) b.decal(headLoft, BLUSH_TEX, { at: bh, size: [0.06, 0.036], lift: 0.002 } as any);
    const sh = headSurf.around(HC).at(s * 43, -24);
    if (sh) b.decal(headLoft, SMILE_TEX, { at: sh, size: [0.05, 0.025], mirror: s > 0 });
  }

  // ears
  for (const s of [1, -1]) {
    const eseat = headSurf.ray([s * 0.088, 1, 0.46], [0, -1, 0]);
    const ey = (eseat ? eseat.at.y : 0.56) + 0.014;
    const d = [s * 0.6, 0.35, 0.5];
    blob(BROWN_D, [s * 0.092, ey, 0.455], [0.034, 0.038, 0.014], head, { dir: d, axis: "z" }, [8, 6]);
    blob(EAR_IN, [s * 0.094 + s * 0.004, ey + 0.002, 0.466], [0.02, 0.024, 0.008], head, { dir: d, axis: "z" }, [8, 6]);
  }

  // ------------------------------------------------------------ legs
  function paw(foot: J, x: number, z: number, n: number, len: number, r: number) {
    const spread = 0.42;
    for (let i = 0; i < n; i++) {
      const a = (i - (n - 1) / 2) * spread;
      const sa = Math.sin(a);
      const ca = Math.cos(a);
      const e = [x + sa * (0.012 + len), 0.018, z + 0.012 + ca * len];
      b.capsule([x + sa * 0.012, 0.02, z + 0.012], e, r, { color: TOE, bone: foot });
      b.spike(e, [sa, -0.05, ca], 0.016, r * 0.7, { color: NAIL, bone: foot });
    }
    const wx = Math.sin((spread * (n - 1)) / 2) * len * 0.9;
    b.extrude(
      [
        [-0.014, 0],
        [-wx, len * 0.7],
        [0, len * 0.8],
        [wx, len * 0.7],
        [0.014, 0],
      ],
      { at: [x, 0.012, z + 0.02], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.008, color: TOE, bone: foot },
    );
  }

  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    // front
    const fp = limb([s * 0.15, 0.3, 0.18], [s * 0.15, 0.04, 0.2], [0.15, 0.12], [[0, 0, -1]]);
    const front = b.chain(`legF${sd}`, fp, {
      parent: spine,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "leg",
      contact: [s * 0.15, 0, 0.22],
    });
    b.sweep(front, [0.072, 0.046], { color: LEGS, detail: 1.3 } as any);
    blob(COAT, [s * 0.158, 0.32, 0.18], [0.062, 0.09, 0.1], front.joints[0]);
    paw(front.tip!, s * 0.15, 0.2, 4, 0.05, 0.014);

    // hind
    const hp = limb([s * 0.16, 0.3, -0.3], [s * 0.16, 0.04, -0.32], [0.11, 0.11, 0.1], [[0, 0, 1], [0, 0, -1]]);
    const hind = b.chain(`legH${sd}`, hp, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `hock${sd}`, `foot${sd}`],
      role: "leg",
      contact: [s * 0.16, 0, -0.3],
    });
    b.sweep(hind, [0.085, 0.046], { color: LEGS, detail: 1.3 } as any);
    blob(COAT, [s * 0.17, 0.3, -0.3], [0.078, 0.11, 0.12], hind.joints[0]);
    paw(hind.tip!, s * 0.16, -0.32, 3, 0.06, 0.017);
  }

  // ------------------------------------------------------------ fur tufts
  const bodySurf = b.surface(body);
  const dorsal = bodySurf.scatter(130, { rng: R, minDist: 0.045, filter: (h: any) => h.n.y > 0.25 });
  b.cards(dorsal, [TUFT_A, TUFT_A, TUFT_B], { size: [0.05, 0.07], lean: 70, bend: 25, vary: 0.3, rng: R } as any);
  const cheeks = headSurf.scatter(24, {
    rng: R,
    minDist: 0.035,
    filter: (h: any) => h.n.y < 0.3 && Math.abs(h.n.x) > 0.5 && h.at.z < 0.62,
  });
  b.cards(cheeks, TUFT_B, { size: [0.038, 0.05], lean: 75, bend: 20, vary: 0.25, rng: R, flow: [0, -0.2, -1] } as any);

  // ------------------------------------------------------------ the little bird
  const BZ = 0.56;
  const seat = headSurf.ray([0, 1, BZ], [0, -1, 0]);
  const BY = seat ? seat.at.y : 0.62;

  const bBody = b.joint("birdBody", { parent: head, at: [0, BY + 0.075, BZ - 0.005], dir: [0, 0.2, 1], role: "spine" });
  const bHead = b.joint("birdHead", { parent: bBody, at: [0, BY + 0.125, BZ + 0.03], dir: [0, 0.3, 1], role: "head" });
  const bJaw = b.joint("birdJaw", { parent: bHead, at: [0, BY + 0.118, BZ + 0.062], dir: [0, 0, 1], role: "jaw" });

  const birdBody = blob(BIRD_BODY, [0, BY + 0.075, BZ - 0.005], [0.056, 0.05, 0.068], bBody, { dir: [0, 0.2, 1], axis: "z" });
  const hc = new THREE.Vector3(0, BY + 0.128, BZ + 0.035);
  const HS = [0.045, 0.042, 0.042];
  blob(BIRD_HEAD, [hc.x, hc.y, hc.z], HS, bHead, {}, [10, 8]);
  const onHead = (dx: number, dy: number, dz: number, k = 1) => {
    const l = Math.hypot(dx, dy, dz);
    return [hc.x + (HS[0] * dx * k) / l, hc.y + (HS[1] * dy * k) / l, hc.z + (HS[2] * dz * k) / l];
  };

  // beak (upper on head, lower on its own jaw bone)
  b.spike([0, BY + 0.13, BZ + 0.07], [0, BY + 0.124, BZ + 0.114], null, 0.014, { color: ORANGE, bone: bHead });
  b.spike([0, BY + 0.118, BZ + 0.066], [0, BY + 0.12, BZ + 0.102], null, 0.0095, { color: "#e8761a", bone: bJaw });

  for (const s of [1, -1]) {
    const e = onHead(s * 0.72, 0.24, 0.65, 0.97);
    blob(PUPIL, e, [0.014, 0.014, 0.014], bHead, { flat: false }, [8, 6]);
    blob("#ffffff", [e[0] + s * 0.006, e[1] + 0.006, e[2] + 0.009], [0.0048, 0.0048, 0.0048], bHead, { flat: false }, [6, 4]);
    const c = onHead(s * 0.75, -0.2, 0.62, 1.0);
    blob(CHEEK, c, [0.012, 0.009, 0.004], bHead, { dir: [s * 0.75, -0.2, 0.62], axis: "z", flat: false }, [8, 6]);
  }

  // crest of three blades
  const blade = [
    [0, 0],
    [0.012, 0.012],
    [0.013, 0.038],
    [0, 0.068, "sharp"],
    [-0.013, 0.038],
    [-0.012, 0.012],
  ] as any;
  const crestPaint = (_p: any, _n: any, s: readonly [number, number]) => (s[1] > 0.045 ? ORANGE : TEAL_D);
  for (const yd of [[0, 1, -0.5], [0.45, 1, -0.3], [-0.45, 1, -0.3]]) {
    const bs = flatBasis(yd);
    b.extrude(blade, {
      at: [0, BY + 0.162, BZ + 0.03],
      x: bs.x,
      y: bs.y,
      thickness: 0.006,
      smoothing: 1,
      color: paintFn(crestPaint),
      bone: bHead,
    });
  }

  // wings
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const wing = b.chain(
      `birdWing${sd}`,
      [
        [s * 0.05, BY + 0.09, BZ - 0.005],
        [s * 0.058, BY + 0.07, BZ - 0.05],
        [s * 0.052, BY + 0.055, BZ - 0.1],
      ],
      { parent: bBody, names: [`birdWing${sd}1`, `birdWing${sd}2`, `birdWing${sd}3`], role: "wing" },
    );
    b.extrude(
      [
        [0, 0.012],
        [0.025, 0.032],
        [0.065, 0.03],
        [0.1, 0.005],
        [0.125, -0.03],
        [0.095, -0.032],
        [0.075, -0.05],
        [0.045, -0.042],
        [0.02, -0.05],
        [0, -0.03],
      ],
      {
        at: [s * 0.05, BY + 0.09, BZ - 0.005],
        x: [0, 0, -1],
        y: [s * 0.35, 1, 0],
        thickness: 0.008,
        color: paintFn((_p, _n, c) => (c[0] > 0.088 ? CREAM : c[0] > 0.04 ? TEAL_D : TEAL)),
        bone: wing.joints[0],
      },
    );
  }

  // tail fan
  const bTail = b.chain("birdTail", [[0, BY + 0.07, BZ - 0.06], [0, BY + 0.07, BZ - 0.14]], {
    parent: bBody,
    names: ["birdTail1", "birdTail2"],
    role: "tail",
  });
  const feather = [
    [0, 0],
    [0.013, 0.02],
    [0.015, 0.08],
    [0, 0.115, "sharp"],
    [-0.015, 0.08],
    [-0.013, 0.02],
  ] as any;
  for (const yd of [[0, 0.12, -1], [0.3, 0.1, -1], [-0.3, 0.1, -1]]) {
    const bs = flatBasis(yd);
    b.extrude(feather, {
      at: [0, BY + 0.07, BZ - 0.06],
      x: bs.x,
      y: bs.y,
      thickness: 0.005,
      smoothing: 1,
      color: paintFn((_p, _n, c) => (c[1] > 0.085 ? CREAM : c[1] > 0.06 ? TEAL : TEAL_D)),
      bone: bTail.joints[0],
    });
  }

  // legs and toes gripping the capybara's head
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const ls = headSurf.ray([s * 0.022, 1, BZ], [0, -1, 0]);
    const fy = (ls ? ls.at.y : BY) + 0.001;
    const leg = b.chain(`birdLeg${sd}`, [[s * 0.022, BY + 0.045, BZ], [s * 0.022, fy + 0.003, BZ]], {
      parent: bBody,
      names: [`birdHip${sd}`, `birdFoot${sd}`],
      role: "leg",
    });
    b.sweep(leg, 0.0055, { color: ORANGE, sides: 6 } as any);
    const foot = leg.tip!;
    for (let i = -1; i <= 1; i++)
      b.rod([s * 0.022, fy + 0.003, BZ], [s * 0.022 + i * 0.011, fy + 0.002, BZ + 0.025], 0.0042, { color: ORANGE, bone: foot });
    b.rod([s * 0.022, fy + 0.003, BZ], [s * 0.022, fy + 0.002, BZ - 0.016], 0.0042, { color: ORANGE, bone: foot });
  }

  // belly fluff
  const fluff = b.surface(birdBody).scatter(26, {
    rng: R,
    minDist: 0.018,
    filter: (h: any) => h.n.y < 0.1 && h.n.z > -0.2,
  });
  b.cards(fluff, TUFT_Y, { size: [0.02, 0.03], lean: 70, bend: 20, vary: 0.2, rng: R } as any);

  return b.root;
}

// custom per-surface paint wrapper kept local so the module needs only SDK exports
import { paint } from "agentic-3js-builder";
function paintFn(fn: (p: THREE.Vector3, n: THREE.Vector3, s: readonly [number, number]) => string) {
  return paint((p, n, s) => fn(p, n, s));
}
```