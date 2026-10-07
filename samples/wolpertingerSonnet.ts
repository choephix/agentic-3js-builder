import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Joint } from "../src/skeleton";
import type { Sweep } from "../src/sweep";
import { frame } from "../src/frame";
import { bezier, catmull } from "../src/path";
import { rng } from "../src/math";
import { gradient, mottle, paint, spots } from "../src/paint";
import type { Paint } from "../src/paint";
import { svg } from "../src/texture";
import { cel, furEdge, zigzag } from "../kits/toon";

export const meta = {
  name: "Wolpertinger",
  description:
    "A chubby storybook wolpertinger: a honey-coloured hare with stag's lyre antlers, teal-and-coral pheasant wings, saber fangs, a diamond-patterned scarf with a brass bell and a daisy tucked in one ear.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const TAN = "#dd9d55";
const TAN_D = "#b36c36";
const CREAM = "#fff1d6";
const PINK = "#ffa3b1";
const NOSE = "#e8506f";
const IVORY = "#f8ebc6";
const CARAMEL = "#c98a4b";
const AMBER = "#f4b942";
const TEAL = "#2db5a3";
const TEAL_D = "#16787f";
const TEAL_L = "#7ee0cc";
const CORAL = "#ff7a52";
const BLUE = "#2f6fcf";
const GOLD = "#f5c242";
const BROWN = "#4a2a1f";
const MOUTH = "#8a2440";
const RED = "#e8403a";
const WHITE = "#ffffff";
const CARROT = "#ff8a1f";

// ---------------------------------------------------------------- paints
const FUR = mottle(TAN, TAN_D, { size: 0.075, contrast: 0.45, seed: 4 });
const DAPPLED = spots(FUR, "#a65f2f", { size: 0.05, amount: 0.12, seed: 9 });
const BELLY = furEdge(DAPPLED, CREAM, { level: -0.3, teeth: 0.2, period: 0.034 });
const COAT = cel(
  paint((p, n) =>
    n.y > 0.45 && p.y > 0.27 && p.z > -0.29 && p.z < 0.24 && Math.abs(p.x) < 0.012 + 0.008 * zigzag(p.z / 0.035)
      ? TAN_D
      : BELLY,
  ),
);
const CREAMC = cel(CREAM);
const PADS = cel(spots(CREAM, CARAMEL, { size: 0.014, amount: 0.3, seed: 2 }));
const HEAD = cel(
  paint((p, n) => {
    const blaze = (p.x / 0.016) ** 2 + ((p.y - 0.535) / 0.035) ** 2 + ((p.z - 0.395) / 0.06) ** 2 < 1;
    const blush = ((Math.abs(p.x) - 0.088) / 0.02) ** 2 + ((p.y - 0.448) / 0.014) ** 2 + ((p.z - 0.43) / 0.03) ** 2 < 1;
    if (blush) return "#ff9aa0";
    const lower = p.z > 0.38 && p.y < 0.447 + 0.01 * zigzag(p.x / 0.022);
    return blaze || (lower && n.y < 0.6) ? CREAM : BELLY;
  }),
);
const SCARF = cel(
  paint((_p, _n, s) => {
    const u = s[0] * 30;
    const v = s[1] / 36;
    return (Math.floor(u + v) + Math.floor(u - v)) % 2 === 0 ? BLUE : WHITE;
  }),
);
const SCARF_TAIL = cel(
  paint((_p, _n, s) => {
    const u = s[0] / 0.022;
    const v = s[1] / 0.022;
    return (Math.floor(u + v) + Math.floor(u - v)) % 2 === 0 ? BLUE : WHITE;
  }),
);

function featherPaint(base: string, mid: string, tip: string, len: number, ocelli: boolean): Paint {
  return cel(
    paint((_p, _n, s) => {
      const x = s[0];
      const y = Math.abs(s[1]);
      if (y < 0.0022 && x > 0.008 && x < len * 0.94) return TEAL_L;
      if (ocelli) {
        const d = Math.hypot(x - len * 0.58, s[1]);
        if (d < 0.0075) return TEAL_D;
        if (d < 0.0125) return CREAM;
        if (d < 0.016) return CORAL;
      }
      if (x > len * 0.84) return tip;
      if (x > len * 0.8) return CREAM;
      return x < len * 0.3 ? base : mid;
    }),
  );
}

const interp = (keys: number[][]) => (t: number) => {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
};

export default function build() {
  const b = createBuilder({ name: "wolpertinger" });
  const R = rng(11);

  // ------------------------------------------------------------ textures
  const EYE = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#24121e"/><circle cx="50" cy="52" r="41" fill="#e8892b"/>
     <ellipse cx="50" cy="66" rx="32" ry="20" fill="#ffc552"/><ellipse cx="50" cy="50" rx="24" ry="29" fill="#1a0e17"/>
     <circle cx="33" cy="33" r="12" fill="#ffffff"/><circle cx="63" cy="68" r="6" fill="#ffffff"/><circle cx="66" cy="38" r="3.2" fill="#ffffff"/></svg>`,
    { size: 256 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 40 80"><path d="M2 80 C4 50 12 22 20 0 C28 22 36 50 38 80Z" fill="#ffffff"/>
     <path d="M20 72 C20 54 20 34 20 14" stroke="#d6d6d6" stroke-width="3" fill="none"/>
     <path d="M9 74 C11 58 14 46 17 36" stroke="#e4e4e4" stroke-width="2.5" fill="none"/>
     <path d="M31 74 C29 58 26 46 23 36" stroke="#e4e4e4" stroke-width="2.5" fill="none"/></svg>`,
    { size: 128 },
  );
  const GRASS = svg(
    `<svg viewBox="0 0 48 64"><path d="M4 64 C6 40 10 20 14 4 C20 22 22 44 22 64Z" fill="#4fae3f"/>
     <path d="M16 64 C20 36 28 16 38 0 C38 24 34 44 32 64Z" fill="#6ccc4e"/>
     <path d="M30 64 C36 44 42 32 46 22 C46 40 44 52 42 64Z" fill="#3c9a3a"/></svg>`,
    { size: 128 },
  );
  const CLOVER = svg(
    `<svg viewBox="0 0 64 64"><circle cx="20" cy="38" r="14" fill="#4fae3f"/><circle cx="44" cy="38" r="14" fill="#4fae3f"/>
     <circle cx="32" cy="18" r="14" fill="#5fbf4a"/><path d="M32 30 L32 62" stroke="#3c9a3a" stroke-width="5"/>
     <path d="M20 38 L32 30 M44 38 L32 30 M32 18 L32 30" stroke="#8ee06a" stroke-width="2.5"/></svg>`,
    { size: 128 },
  );
  const LEAF = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 64 C2 44 4 16 16 0 C28 16 30 44 16 64Z" fill="#4fae3f"/>
     <path d="M16 62 L16 8" stroke="#8ee06a" stroke-width="3"/></svg>`,
    { size: 128 },
  );

  // ------------------------------------------------------------ skeleton: spine, neck, head, jaw
  const spineKnots = [
    [0, 0.285, -0.2],
    [0, 0.3, -0.05],
    [0, 0.29, 0.09],
    [0, 0.315, 0.19],
  ];
  const hips = b.joint("hips", { at: spineKnots[0], aim: spineKnots[1], role: "spine" });
  const spine = b.chain("spine", catmull(spineKnots.slice(1)), {
    parent: hips,
    names: ["spine", "chest", "neckBase"],
    role: "spine",
  });
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.315, 0.19],
      [0, 0.37, 0.255],
      [0, 0.43, 0.31],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { at: neck.at(1), dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.408, 0.36],
    aim: [0, 0.398, 0.5],
    role: "jaw",
  });

  // ------------------------------------------------------------ body
  const bodyPath = catmull([...spineKnots, [0, 0.37, 0.255], [0, 0.43, 0.31]]);
  const tHaunch = bodyPath.closestT([0, 0.3, -0.12]);
  const tChest = bodyPath.closestT([0, 0.29, 0.09]);
  const tNeck = bodyPath.closestT([0, 0.315, 0.19]);
  const bodyR = interp([
    [0, 0.11],
    [tHaunch, 0.14],
    [tChest, 0.125],
    [tNeck, 0.105],
    [1, 0.092],
  ]);
  const body = b.sweep(bodyPath, (t) => [bodyR(t), bodyR(t) * 0.97], {
    bone: [hips, spine, neck],
    color: COAT,
    shift: [0, -0.012],
  });
  const bodySkin = b.surface(body);

  // ------------------------------------------------------------ head
  const C = head.local({ forward: 0.05, up: 0.04 });
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), HEAD, {
    bone: head,
    at: C,
    scale: [0.1, 0.09, 0.1],
  });
  const skin = b.surface(skull);
  b.sweep(
    [
      [0, 0.455, 0.4],
      [0, 0.446, 0.5],
    ],
    (t) => [0.05 - 0.012 * t, 0.04 - 0.008 * t],
    { bone: head, color: CREAMC, sides: 10 },
  );
  for (const s of [1, -1]) {
    // whisker pads
    b.part(new THREE.SphereGeometry(0.036, 8, 6), PADS, {
      bone: head,
      at: [s * 0.03, 0.438, 0.47],
      scale: [1, 0.85, 1.1],
    });
  }
  // nose, philtrum
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: [0, 0.463, 0.54],
    scale: [0.021, 0.015, 0.015],
  });
  b.rod([0, 0.452, 0.545], [0, 0.427, 0.535], 0.0025, { bone: head, color: BROWN });
  // mouth interior
  b.part(new THREE.BoxGeometry(0.075, 0.012, 0.1), MOUTH, { bone: head, at: [0, 0.418, 0.45] });
  // lower jaw, tongue
  b.sweep(
    [
      [0, 0.405, 0.37],
      [0, 0.396, 0.5],
    ],
    (t) => [0.04 - 0.014 * t, 0.024 - 0.004 * t],
    { bone: jaw, color: CREAMC, sides: 10 },
  );
  b.sweep(
    [
      [0, 0.424, 0.42],
      [0, 0.418, 0.485],
    ],
    0.013,
    { bone: jaw, color: PINK, sides: 6 },
  );
  // teeth
  for (const s of [1, -1]) {
    b.spike([s * 0.04, 0.43, 0.482], [s * 0.08, -1, 0.14], 0.082, 0.017, { bone: head, color: "#fffdf0", sides: 6 });
    b.part(new THREE.BoxGeometry(0.015, 0.028, 0.009), IVORY, {
      bone: head,
      at: [s * 0.0085, 0.416, 0.53],
    });
  }
  // whiskers
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const y0 = 0.452 + k * 0.008;
      b.sweep(
        bezier(
          [s * 0.036, y0, 0.505],
          [s * 0.1, y0 + 0.012 + k * 0.012, 0.52],
          [s * 0.17, y0 - 0.02 + (k - 1) * 0.026 + 0.006, 0.47 - k * 0.02],
        ),
        [0.0028, 0.0008],
        { bone: head, color: IVORY, sides: 4, caps: "point" },
      );
    }
  }
  // eyes
  for (const s of [1, -1]) {
    const hit = skin.around(C).at(s * 42, 9);
    if (!hit) continue;
    const eye = b.stick(new THREE.SphereGeometry(0.039, 10, 8), "#24121e", hit, { embed: 0.4 });
    const eyeDir = hit.n.clone().add(new THREE.Vector3(0, 0.1, 0.9)).normalize();
    const eyeC = hit.at.clone().addScaledVector(hit.n, 0.008);
    b.decal(eye, EYE, {
      at: eyeC.clone().addScaledVector(eyeDir, 0.04),
      dir: eyeDir.toArray(),
      size: [0.074, 0.074],
      lift: 0.001,
      mirror: s > 0,
    });
    // brows: cheeky, inner ends low
    const bp = [
      skin.around(C).at(s * 12, 42),
      skin.around(C).at(s * 32, 45),
      skin.around(C).at(s * 56, 40),
    ];
    if (bp.every((h) => h)) {
      b.sweep(catmull(bp.map((h) => h!.moved([0, 0.006, 0]))), [0.008, 0.0125, 0.003], {
        bone: head,
        color: cel(TAN_D),
        sides: 6,
      });
    }
    // upper lid line
    const lid = [skin.around(C).at(s * 20, 24), skin.around(C).at(s * 33, 35), skin.around(C).at(s * 55, 28)];
    if (lid.every((h) => h)) {
      b.sweep(catmull(lid.map((h) => h!.moved([0, 0.012, 0]))), 0.0045, { bone: head, color: BROWN, sides: 5 });
    }
  }

  // ------------------------------------------------------------ ears
  const earPaint = (base: number[], tip: number[]) => {
    const dir = new THREE.Vector3(tip[0] - base[0], tip[1] - base[1], tip[2] - base[2]);
    const len = dir.length();
    dir.normalize();
    return cel(
      paint((p, n) => {
        const k = new THREE.Vector3(p.x - base[0], p.y - base[1], p.z - base[2]).dot(dir) / len;
        if (k > 0.8 + 0.035 * zigzag(p.x / 0.02)) return BROWN;
        if (n.z > 0.5 && k > 0.06 && k < 0.93) return PINK;
        return BELLY;
      }),
    );
  };
  const earSweeps: Sweep[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const base = [s * 0.055, 0.535, 0.325];
    const tip = [s * 0.205, 0.742, 0.29];
    const ear = b.chain(`ear${S}`, catmull([base, [s * 0.122, 0.645, 0.312], tip]), {
      parent: head,
      names: [`ear${S}1`, `ear${S}2`],
      role: "hinge",
    });
    earSweeps.push(
      b.sweep(
        ear,
        (t) => [0.016 + 0.03 * Math.sin(Math.PI * (0.08 + 0.84 * t)) ** 0.6, 0.0125 + 0.004 * (1 - t)],
        { color: earPaint(base, tip), sides: 8 },
      ),
    );
  }

  // ------------------------------------------------------------ antlers (stag lyre, gold bands, glowing tips)
  for (const s of [1, -1]) {
    const beam = catmull([
      [s * 0.05, 0.542, 0.4],
      [s * 0.082, 0.6, 0.408],
      [s * 0.112, 0.662, 0.42],
      [s * 0.1, 0.726, 0.442],
    ]);
    const tipBands: [number, string][] = [
      [0.72, IVORY],
      [1, "#ffd978"],
    ];
    b.sweep(beam, (t) => 0.021 - 0.013 * t, { bone: head, bands: tipBands, sides: 6 });
    // burr at the base
    b.sweep(
      [
        [s * 0.05, 0.535, 0.4],
        [s * 0.058, 0.575, 0.402],
      ],
      [0.03, 0.019],
      { bone: head, color: CARAMEL, sides: 7, caps: "round" },
    );
    const tine = (t: number, tipP: number[], bend: number[]) => {
      const base = beam.at(t);
      b.sweep(bezier(base, bend, tipP), [0.0135, 0.0045], {
        bone: head,
        bands: [
          [0.65, IVORY],
          [1, "#ffd978"],
        ],
        sides: 6,
        caps: "round",
      });
    };
    tine(0.38, [s * 0.07, 0.655, 0.49], [s * 0.082, 0.633, 0.455]);
    tine(0.6, [s * 0.18, 0.695, 0.432], [s * 0.15, 0.665, 0.425]);
    tine(0.9, [s * 0.145, 0.79, 0.474], [s * 0.12, 0.75, 0.462]);
    for (const t of [0.2, 0.46]) {
      b.part(new THREE.TorusGeometry(0.0225 - 0.01 * t, 0.0065, 5, 9), GOLD, {
        bone: head,
        at: beam.at(t),
        dir: beam.tangentAt(t),
        axis: "z",
      });
    }
  }

  // ------------------------------------------------------------ tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.31, -0.28],
      [0, 0.335, -0.35],
      [0, 0.37, -0.405],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  const tailS = b.sweep(tail, [0.03, 0.068, 0.074, 0.05], { color: CREAMC, sides: 9 });
  b.cards(
    b.surface(tailS).scatter(26, { rng: R, minDist: 0.03 }),
    TUFT,
    { size: [0.04, 0.055], lean: 60, bend: 20, flow: [0, 0.3, -1], vary: 0.25, rng: R, color: CREAM },
  );

  // ------------------------------------------------------------ legs
  const addToes = (
    foot: Joint,
    base: number[],
    n: number,
    spread: number,
    len: number,
    r: number,
    name: string,
    color: Paint,
  ) => {
    for (let i = 0; i < n; i++) {
      const off = (i - (n - 1) / 2) * spread;
      const a = [base[0] + off, base[1], base[2]];
      const tip = [base[0] + off * 1.5, base[1] - 0.001, base[2] + len - Math.abs(off) * 0.5];
      const toe = b.chain(`${name}${i + 1}`, [a, tip], { parent: foot, names: [`${name}${i + 1}`], role: "digit" });
      b.sweep(toe, [r, r * 0.85], { color, sides: 7 });
      b.spike([tip[0], tip[1], tip[2] + r * 0.6], [off * 2, -0.35, 1], r * 1.6, r * 0.55, {
        bone: toe.joints[0],
        color: IVORY,
        sides: 5,
      });
    }
  };
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // hind leg: long hare haunch
    const hindPts = [
      [s * 0.1, 0.27, -0.19],
      [s * 0.13, 0.165, -0.03],
      [s * 0.112, 0.085, -0.265],
      [s * 0.11, 0.032, -0.1],
    ];
    const hind = b.chain(`legH${S}`, catmull(hindPts), {
      parent: hips,
      names: [`hipH${S}`, `kneeH${S}`, `hockH${S}`, `footH${S}`],
      role: "leg",
      contact: [s * 0.11, 0, -0.1],
    });
    const hr = interp([
      [0, 0.1],
      [0.3, 0.07],
      [0.5, 0.045],
      [0.66, 0.036],
      [1, 0.033],
    ]);
    const hindFur = cel(gradient(DAPPLED, CREAM, [0, 0.12, -0.26], [0, 0.04, -0.12]));
    b.sweep(hind, hr, { color: hindFur, sides: 9 });
    addToes(hind.tip!, [s * 0.11, 0.024, -0.1], 3, 0.024, 0.05, 0.0225, `toeH${S}`, CREAMC);

    // fore leg
    const forePts = [
      [s * 0.085, 0.25, 0.11],
      [s * 0.095, 0.14, 0.075],
      [s * 0.09, 0.065, 0.135],
      [s * 0.09, 0.027, 0.185],
    ];
    const fore = b.chain(`legF${S}`, catmull(forePts), {
      parent: spine.joints[1],
      names: [`shoulderF${S}`, `elbowF${S}`, `wristF${S}`, `pawF${S}`],
      role: "leg",
      contact: [s * 0.09, 0, 0.19],
    });
    const fr = interp([
      [0, 0.062],
      [0.35, 0.043],
      [0.7, 0.032],
      [1, 0.029],
    ]);
    b.sweep(fore, fr, { color: cel(gradient(DAPPLED, CREAM, [0, 0.11, 0.1], [0, 0.04, 0.16])), sides: 8 });
    addToes(fore.tip!, [s * 0.09, 0.022, 0.185], 3, 0.02, 0.04, 0.019, `toeF${S}`, CREAMC);
  }

  // ------------------------------------------------------------ wings: pheasant feathers, ocelli
  const PHI = (38 * Math.PI) / 180;
  const PSI = (20 * Math.PI) / 180;
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const e1 = new THREE.Vector3(s * Math.cos(PHI), Math.sin(PHI), 0);
    const e2 = new THREE.Vector3(0, Math.sin(PSI), -Math.cos(PSI));
    const N = s > 0 ? e1.clone().cross(e2) : e2.clone().cross(e1);
    const wp = catmull(
      (
        [
          [0, 0],
          [0.15, -0.07],
          [0.29, -0.03],
          [0.4, -0.09],
        ] as const
      ).map(([r, z]) => [s * 0.06 + e1.x * r, 0.39 + e1.y * r, z]),
    );
    const wing = b.chain(`wing${S}`, wp, {
      parent: spine.joints[0],
      names: [`wingUpper${S}`, `wingFore${S}`, `wingHand${S}`, `wingTip${S}`],
      role: "wing",
    });
    b.sweep(wing, [0.018, 0.015, 0.011, 0.007], {
      color: cel(paint((_p, _n, s) => (Math.floor(s[0] * 22) % 2 === 0 ? TEAL_D : "#1f8f94"))),
      sides: 7,
    });
    const pick = (t: number): Joint => (t < 0.2 ? wing.joints[0] : t < 0.62 ? wing.joints[1] : wing.joints[2]);
    const angle = (t: number) => -12 + 100 * t ** 1.6;
    const rowLen = (t: number) => 0.17 + 0.1 * Math.sin(Math.PI * Math.min(1, (t + 0.12) / 1.2));
    const rows: {
      n: number;
      t0: number;
      t1: number;
      k: number;
      lift: number;
      base: string;
      mid: string;
      tip: string;
      oc: boolean;
      w: number;
    }[] = [
      { n: 14, t0: 0.03, t1: 0.99, k: 1, lift: 0, base: TEAL_D, mid: TEAL, tip: CORAL, oc: true, w: 0.052 },
      { n: 10, t0: 0.05, t1: 0.96, k: 0.56, lift: 0.007, base: TEAL, mid: AMBER, tip: CORAL, oc: false, w: 0.046 },
      { n: 9, t0: 0.06, t1: 0.97, k: 0.3, lift: 0.013, base: AMBER, mid: CREAM, tip: TEAL_L, oc: false, w: 0.036 },
    ];
    rows.forEach((row, ri) => {
      for (let i = 0; i < row.n; i++) {
        const t = row.t0 + ((row.t1 - row.t0) * i) / (row.n - 1);
        const root = wp.at(t);
        const a = (angle(t) * Math.PI) / 180;
        const d = e1
          .clone()
          .multiplyScalar(Math.sin(a))
          .addScaledVector(e2, Math.cos(a))
          .addScaledVector(N, -0.1 - 0.08 * t)
          .normalize();
        const y = N.clone().cross(d).normalize();
        const L = rowLen(t) * row.k;
        const w = row.w;
        b.extrude(
          [
            [0, 0],
            [0.08 * L, -0.4 * w],
            [0.5 * L, -0.5 * w],
            [0.88 * L, -0.3 * w],
            [L, 0, "sharp"],
            [0.88 * L, 0.3 * w],
            [0.5 * L, 0.5 * w],
            [0.08 * L, 0.4 * w],
          ],
          {
            at: [
              root.x + N.x * (row.lift + ri * 0.0005 + (i % 2) * 0.0015),
              root.y + N.y * (row.lift + ri * 0.0005 + (i % 2) * 0.0015),
              root.z,
            ],
            x: d.toArray(),
            y: y.toArray(),
            thickness: 0.006,
            bevel: 0.0022,
            detail: 0.4,
            smoothing: 1,
            color: featherPaint(row.base, row.mid, row.tip, L, row.oc && i % 2 === 0),
            bone: pick(t),
          },
        );
      }
    });
    // shoulder fluff
    const wingBase = wing.joints[0];
    b.cards(
      [0.0, 0.08, 0.16].map((t) => frame(wp.at(t), [0, 1, 0], [0, 0, 1])),
      TUFT,
      { size: [0.04, 0.06], lean: 70, flow: [s * 0.3, 0.1, -1], color: CREAM, bone: wingBase, cross: true },
    );
  }

  // ------------------------------------------------------------ crest of little pheasant feathers down the back
  for (let i = 0; i < 8; i++) {
    const z = -0.22 + i * 0.044;
    const top = bodySkin.ray([0, 1, z], [0, -1, 0]);
    if (!top) continue;
    const L = 0.1 - 0.004 * i;
    const w = 0.04;
    b.extrude(
      [
        [0, 0],
        [0.08 * L, -0.4 * w],
        [0.5 * L, -0.5 * w],
        [0.88 * L, -0.3 * w],
        [L, 0, "sharp"],
        [0.88 * L, 0.3 * w],
        [0.5 * L, 0.5 * w],
        [0.08 * L, 0.4 * w],
      ],
      {
        at: top.moved([0, -0.014, 0]),
        x: [0, 0.78, -0.62],
        y: [1, 0, 0],
        thickness: 0.006,
        bevel: 0.002,
        detail: 0.4,
        smoothing: 1,
        color: featherPaint(i % 2 ? TEAL : TEAL_D, i % 2 ? AMBER : TEAL, i % 2 ? CORAL : AMBER, L, i % 3 === 0),
      },
    );
  }

  // ------------------------------------------------------------ scarf with bell
  const loop = bodySkin.loop(neck.joints[1], { lift: 0.014 });
  b.sweep(loop, () => [0.03, 0.021], { color: SCARF, sides: 8 });
  const tk = loop.closestT([0.06, 0.35, 0.3]);
  const knotAt = loop.at(tk);
  const knotF = frame(knotAt, [0.35, 0.3, 1]);
  b.stick(new THREE.SphereGeometry(0.03, 8, 6), SCARF, knotF, { embed: 0.3, bone: neck.joints[1] });
  for (const [dx, drop, ang] of [
    [-0.012, 0.115, -8],
    [0.02, 0.09, 12],
  ] as const) {
    const L = drop;
    b.extrude(
      [
        [-0.021, 0],
        [0.021, 0],
        [0.023, -L],
        [0, -L + 0.022],
        [-0.023, -L],
      ],
      {
        at: [knotAt.x + dx, knotAt.y - 0.012, knotAt.z + 0.02],
        x: [Math.cos((ang * Math.PI) / 180), 0, 0],
        y: [Math.sin((ang * Math.PI) / 180) * -1, 1, 0.5],
        thickness: 0.009,
        bevel: 0.003,
        color: SCARF_TAIL,
        bone: neck.joints[1],
      },
    );
  }
  // brass bell
  const bell = b.part(new THREE.SphereGeometry(0.019, 9, 7), GOLD, {
    bone: neck.joints[1],
    at: [knotAt.x - 0.002, knotAt.y - 0.045, knotAt.z + 0.05],
  });
  b.part(new THREE.BoxGeometry(0.02, 0.0035, 0.002), "#8a6a22", {
    bone: neck.joints[1],
    at: [bell.at.x, bell.at.y - 0.007, bell.at.z + 0.018],
  });
  b.part(new THREE.TorusGeometry(0.0075, 0.0018, 4, 8), GOLD, {
    bone: neck.joints[1],
    at: [bell.at.x, bell.at.y + 0.02, bell.at.z],
    dir: [1, 0, 0],
    axis: "z",
  });

  // ------------------------------------------------------------ fur tufts
  b.cards(
    bodySkin.scatter(14, {
      rng: R,
      minDist: 0.035,
      filter: (h) => h.at.z > 0.1 && h.at.y < 0.34 && h.n.z > 0.3 && h.n.y < 0.7,
    }),
    TUFT,
    { size: [0.04, 0.06], lean: 55, bend: 20, flow: [0, -1, -0.2], vary: 0.25, rng: R, color: CREAM },
  );
  b.cards(
    skin.scatter(18, {
      rng: R,
      minDist: 0.03,
      filter: (h) => Math.abs(h.n.x) > 0.6 && h.at.z < 0.4 && h.at.y < 0.47 && h.at.y > 0.41,
    }),
    TUFT,
    { size: [0.032, 0.05], lean: 70, bend: 15, flow: [0, -0.2, -1], vary: 0.2, rng: R, color: CREAM },
  );
  b.cards(
    skin.scatter(8, { rng: R, minDist: 0.035, filter: (h) => h.n.y > 0.7 && h.at.z > 0.34 && h.at.z < 0.43 }),
    TUFT,
    { size: [0.03, 0.045], lean: 60, bend: 15, flow: [0, 0.2, -1], vary: 0.2, rng: R, color: TAN },
  );

  // ------------------------------------------------------------ daisy tucked behind the left eye
  const flowerAt = skin.around(C).at(98, 22);
  if (flowerAt) {
    b.ring(flowerAt, { count: 9, radius: 0.024 }, (item) => {
      b.part(new THREE.SphereGeometry(1, 6, 4), WHITE, {
        at: item.moved([0, 0.004, 0]),
        dir: item.axis,
        scale: [0.0105, 0.027, 0.004],
        bone: head,
      });
    });
    b.part(new THREE.SphereGeometry(0.0105, 7, 5), AMBER, { at: flowerAt.moved([0, 0.008, 0]), bone: head });
  }
  b.cards(
    [1, -1].map((s) => frame([s * 0.07, 0.53, 0.335], [s * 0.5, 0.9, 0.2])),
    TUFT,
    { size: [0.038, 0.052], lean: 30, bend: 10, flow: [0, 0, -1], cross: true, color: CREAM, bone: head },
  );

  // ------------------------------------------------------------ ground props (ride the hips bone)
  const prop = { bone: hips };
  const mushroom = (x: number, z: number, r: number, h: number) => {
    b.lathe(
      [
        [0, h * 0.5],
        [r * 0.25, h * 0.5],
        [r * 0.95, h * 0.52],
        [r, h * 0.62],
        [r * 0.8, h * 0.9],
        [0, h],
      ],
      {
        at: [x, 0, z],
        smoothing: 1,
        segments: 8,
        color: cel(spots(RED, WHITE, { size: r * 0.55, amount: 0.35, seed: 3 })),
        ...prop,
      },
    );
    b.sweep(
      [
        [x, 0.0, z],
        [x, h * 0.55, z],
      ],
      [r * 0.32, r * 0.24],
      { color: CREAMC, sides: 7, caps: "none", ...prop },
    );
  };
  mushroom(0.24, 0.1, 0.045, 0.07);
  mushroom(0.3, 0.04, 0.03, 0.045);
  mushroom(-0.27, -0.12, 0.035, 0.05);
  // carrot
  b.sweep(
    [
      [-0.2, 0.024, 0.2],
      [-0.13, 0.024, 0.28],
    ],
    [0.026, 0.003],
    { color: CARROT, sides: 7, caps: "point", ...prop },
  );
  for (let i = 0; i < 3; i++) {
    b.cards([frame([-0.205 - i * 0.004, 0.034, 0.195], [-0.5, 0.35 + i * 0.1, -0.5 - i * 0.1])], LEAF, {
      size: [0.035, 0.09],
      lean: 10 + i * 15,
      flow: [-0.3 + i * 0.3, 0, -1],
      bend: 20,
      ...prop,
    });
  }
  // grass tufts and clover
  const tufts = [
    [-0.2, -0.3],
    [0.2, -0.26],
    [-0.3, 0.02],
    [0.0, 0.36],
    [0.16, 0.32],
    [-0.12, -0.04],
    [0.33, 0.2],
  ];
  b.cards(
    tufts.map(([x, z]) => frame([x, 0.006, z], [0, 1, 0])),
    GRASS,
    { size: [0.07, 0.085], lean: 8, flow: [0.2, 0, -1], cross: true, vary: 0.3, rng: R, ...prop },
  );
  b.cards(
    [
      [0.12, 0.24],
      [-0.3, 0.24],
      [0.3, -0.12],
      [-0.08, -0.32],
    ].map(([x, z]) => frame([x, 0.002, z], [0, 1, 0])),
    CLOVER,
    { size: 0.06, lean: 90, flow: [0, 0, 1], mirror: true, spin: 180, rng: R, ...prop },
  );

  // ------------------------------------------------------------ rest pose: jaw a little open, ears out
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });
  return b.root;
}
