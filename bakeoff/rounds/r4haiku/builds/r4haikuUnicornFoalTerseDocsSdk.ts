import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  gradient,
  limb,
  mottle,
  paint,
  rng,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Unicorn foal",
  description:
    "A stylised unicorn foal in a rest pose: pearl-lilac coat, pastel rainbow mane and tail, spiral gold horn, gold hooves.",
};

const COAT = "#fdf8ff";
const COAT_LILAC = "#eee0ff";
const SHADE = "#cdb6f0";
const SOCK = "#bfa3f0";
const MUZZLE = "#ffc4de";
const EAR = "#ffb0d2";
const HOOF = "#ffd66e";
const HORN = "#ffe27a";
const PEARL = "#fff9ee";
const LASH = "#3a2a6e";

type Key = [number, number];

/** Piecewise-linear profile over t in [0, 1]. */
function ramp(keys: Key[]): (t: number) => number {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      if (t <= t1) return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
    return keys[keys.length - 1][1];
  };
}

export default function build() {
  const b = createBuilder({ name: "unicorn-foal" });

  // ---- paints and textures ------------------------------------------------
  const coat = countershade(mottle(COAT, COAT_LILAC, { size: 0.3, seed: 3 }), SHADE, { level: 0 });
  const headCoat = gradient(COAT, MUZZLE, [0, 1.17, 0.74], [0, 1.09, 0.9]);
  const hornPaint = paint((_p, _n, s) => {
    // spiral pearl stripes winding three times along the horn
    const phase = (((s[1] - 1080 * s[0]) % 90) + 90) % 90;
    return phase < 22 ? PEARL : HORN;
  });

  const eye = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
<circle cx="32" cy="32" r="31" fill="#2b2160"/>
<circle cx="32" cy="32" r="26" fill="#6ff0e2"/>
<circle cx="32" cy="40" r="18" fill="#b99cff"/>
<circle cx="32" cy="35" r="11" fill="#2b2160"/>
<circle cx="23" cy="24" r="7" fill="#ffffff"/>
<circle cx="41" cy="44" r="3.5" fill="#ffffff"/>
</svg>`,
    { size: 128 },
  );
  const blush = svg(
    `<svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg"><ellipse cx="20" cy="12" rx="18" ry="10" fill="#ff8fc6"/></svg>`,
    { size: 64 },
  );
  const star = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
<polygon points="32,4 38.5,23.1 58.6,23.4 42.5,35.4 48.5,54.7 32,43 15.5,54.7 21.5,35.4 5.4,23.4 25.5,23.1" fill="#ff8fd0"/>
<polygon transform="translate(32 32) scale(0.5) translate(-32 -32)" points="32,4 38.5,23.1 58.6,23.4 42.5,35.4 48.5,54.7 32,43 15.5,54.7 21.5,35.4 5.4,23.4 25.5,23.1" fill="#ffe27a"/>
</svg>`,
    { size: 128 },
  );
  const maneA = svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round">
<path d="M9 76 C4 58 15 48 12 32 C10 20 17 12 14 4" stroke="#ff8fd0" stroke-width="7"/>
<path d="M21 76 C18 60 27 50 25 34 C23 22 29 14 26 4" stroke="#ffd36b" stroke-width="7"/>
<path d="M31 76 C30 62 37 52 35 38 C34 28 36 18 34 8" stroke="#8ff0e0" stroke-width="7"/>
</svg>`,
    { size: 160 },
  );
  const maneB = svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round">
<path d="M10 76 C6 58 16 46 14 30 C12 18 19 10 17 4" stroke="#b99cff" stroke-width="7"/>
<path d="M22 76 C20 58 29 46 27 30 C25 18 31 12 29 4" stroke="#7fd4ff" stroke-width="7"/>
<path d="M32 76 C31 62 36 52 36 40 C36 30 37 20 35 8" stroke="#ffb0d6" stroke-width="7"/>
</svg>`,
    { size: 160 },
  );

  // ---- torso: one curve from tail base to withers, cut at the hips root ---
  const bodyPath = catmull([
    [0, 0.8, -0.44],
    [0, 0.78, -0.24],
    [0, 0.75, -0.04],
    [0, 0.76, 0.12],
    [0, 0.8, 0.25],
  ]);
  const hips = b.joint("hips", { at: [0, 0.75, -0.04], role: "spine" });
  const rootT = bodyPath.closestT(hips.at);
  const rump = b.chain("rump", bodyPath.slice(rootT, 0), {
    parent: hips,
    count: 3,
    names: ["rump1", "rump2", "rump3"],
    role: "spine",
  });
  const spine = b.chain("spine", bodyPath.slice(rootT, 1), {
    parent: hips,
    count: 3,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const bodyRx = ramp([[0, 0.06], [0.2, 0.12], [0.45, 0.15], [0.7, 0.155], [1, 0.12]]);
  const bodyRy = ramp([[0, 0.07], [0.2, 0.12], [0.45, 0.14], [0.7, 0.145], [1, 0.12]]);
  const body = b.sweep(bodyPath, (t): [number, number] => [bodyRx(t), bodyRy(t)], {
    bone: [rump, hips, spine],
    color: coat,
  });

  // ---- neck and head ------------------------------------------------------
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.8, 0.25],
      [0, 0.98, 0.36],
      [0, 1.1, 0.48],
      [0, 1.2, 0.56],
    ]),
    {
      parent: spine,
      names: ["neck1", "neck2", "neck3", "neckTip"],
      role: "neck",
    },
  );
  const neckR = ramp([[0, 0.1], [0.5, 0.08], [1, 0.064]]);
  const neckTube = b.sweep(neck, (t) => neckR(t), { color: coat });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.2, 0.56],
    dir: [0, -0.4, 1],
    role: "head",
  });
  const skullRx = ramp([[0, 0.08], [0.26, 0.1], [0.54, 0.085], [0.8, 0.065], [1, 0.05]]);
  const skullRy = ramp([[0, 0.1], [0.26, 0.11], [0.54, 0.09], [0.8, 0.07], [1, 0.05]]);
  const skull = b.sweep(
    catmull([
      [0, 1.23, 0.57],
      [0, 1.22, 0.66],
      [0, 1.17, 0.76],
      [0, 1.12, 0.84],
      [0, 1.09, 0.9],
    ]),
    (t): [number, number] => [skullRx(t), skullRy(t)],
    { bone: head, color: headCoat },
  );

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.1, 0.67],
    aim: [0, 1.03, 0.87],
    role: "jaw",
  });
  b.sweep(
    catmull([
      [0, 1.1, 0.67],
      [0, 1.066, 0.77],
      [0, 1.03, 0.87],
    ]),
    (t): [number, number] => [0.046 - 0.012 * t, 0.036 - 0.008 * t],
    { bone: jaw, color: MUZZLE },
  );

  // ears: flat leaf-shaped plates hinged on the head
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.04, 1.3, 0.55],
      aim: [s * 0.09, 1.43, 0.48],
      role: "hinge",
    });
    b.extrude(
      [
        [-0.022, 0],
        [0.022, 0],
        [0.02, 0.09],
        [0, 0.15],
        [-0.02, 0.09],
      ],
      {
        at: [s * 0.04, 1.3, 0.55],
        bone: ear,
        x: [0, 0, 1],
        y: [s * 0.2, 1, 0],
        thickness: 0.012,
        bevel: 0.004,
        color: EAR,
      },
    );
  }

  // spiral horn: a six-sided cone twisted three quarters of a turn, pearl stripes
  const hornHit = b.surface(skull).nearest([0, 1.3, 0.69]);
  b.sprout("horn", hornHit, [0, 1.52, 0.83], [0.036, 0], {
    count: 0,
    section: { ngon: 6 },
    twist: 540,
    color: hornPaint,
    caps: { end: "point" },
  });

  // eyes, cheek blush and lashes on the head
  for (const s of [1, -1]) {
    b.decal(skull, eye, {
      at: [s * 0.088, 1.2, 0.72],
      dir: [s, 0.15, 0.4],
      size: [0.07, 0.07],
      mirror: s < 0,
    });
    b.decal(skull, blush, {
      at: [s * 0.082, 1.15, 0.8],
      dir: [s, 0, 0.3],
      size: [0.04, 0.024],
    });
    for (const z of [0.7, 0.72, 0.74]) {
      b.sweep(
        catmull([
          [s * 0.086, 1.234, z],
          [s * 0.098, 1.25, z + 0.002],
          [s * 0.107, 1.253, z + 0.004],
        ]),
        [0.0045, 0.0015],
        { bone: head, color: LASH },
      );
    }
  }

  // ---- legs: each one a limb that lands its hoof exactly on the floor -----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // front leg: shoulder, elbow, knee, fetlock, hoof
    const fore = limb(
      [s * 0.1, 0.7, 0.19],
      [s * 0.12, 0.035, 0.22],
      [0.24, 0.25, 0.18, 0.08],
      [
        [0, 0, -1],
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const foreLeg = b.chain(`foreLeg${side}`, fore, {
      parent: spine,
      names: [`shoulder${side}`, `elbow${side}`, `knee${side}`, `fetlockF${side}`, `hoofF${side}`],
      role: "leg",
    });
    const foreR = ramp([[0, 0.058], [0.3, 0.046], [0.62, 0.036], [0.8, 0.03], [1, 0.024]]);
    b.sweep(foreLeg, (t) => foreR(t), {
      color: coat,
      bands: [
        [0.7, coat],
        [1, SOCK],
      ],
    });
    b.part(new THREE.SphereGeometry(0.04, 8, 6), coat, {
      at: fore[2],
      bone: foreLeg.joints[2],
    });
    b.lathe(
      [
        [0, 0],
        [0.042, 0],
        [0.046, 0.014],
        [0.044, 0.05],
        [0.038, 0.066],
        [0, 0.066],
      ],
      {
        at: [s * 0.12, 0, 0.22],
        bone: foreLeg.joints[4],
        segments: 8,
        color: HOOF,
      },
    );

    // hind leg: hip, stifle, hock, fetlock, hoof (hock bends back)
    const hind = limb(
      [s * 0.1, 0.74, -0.3],
      [s * 0.12, 0.035, -0.36],
      [0.26, 0.24, 0.17, 0.08],
      [
        [0, 0, 1],
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const hindLeg = b.chain(`hindLeg${side}`, hind, {
      parent: rump,
      names: [`hip${side}`, `stifle${side}`, `hock${side}`, `fetlockH${side}`, `hoofH${side}`],
      role: "leg",
    });
    const hindR = ramp([[0, 0.07], [0.3, 0.056], [0.6, 0.036], [0.8, 0.03], [1, 0.024]]);
    b.sweep(hindLeg, (t) => hindR(t), {
      color: coat,
      bands: [
        [0.72, coat],
        [1, SOCK],
      ],
    });
    b.part(new THREE.SphereGeometry(0.04, 8, 6), coat, {
      at: hind[2],
      bone: hindLeg.joints[2],
    });
    b.lathe(
      [
        [0, 0],
        [0.042, 0],
        [0.046, 0.014],
        [0.044, 0.05],
        [0.038, 0.066],
        [0, 0.066],
      ],
      {
        at: [s * 0.12, 0, -0.36],
        bone: hindLeg.joints[4],
        segments: 8,
        color: HOOF,
      },
    );
  }

  // ---- mane: rainbow locks along the crest of the neck ---------------------
  const crest = b.surface(neckTube).scatter(90, {
    rng: rng(21),
    minDist: 0.03,
    filter: (h) => h.n.y * 0.61 - h.n.z * 0.79 > 0.45,
  });
  b.cards(crest, [maneA, maneB], {
    size: [0.065, 0.13],
    lean: 45,
    bend: 25,
    vary: 0.25,
    rng: rng(22),
    sink: 0.15,
  });

  // ---- tail: a tapering core with a flowing rainbow fall of hair ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.8, -0.44],
      [0, 0.84, -0.55],
      [0, 0.8, -0.65],
      [0, 0.66, -0.72],
      [0, 0.5, -0.74],
      [0, 0.36, -0.72],
    ]),
    {
      parent: rump,
      names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
      role: "tail",
    },
  );
  const tailR = ramp([[0, 0.045], [0.5, 0.034], [1, 0.02]]);
  const tailCore = b.sweep(tail, (t) => tailR(t), { color: coat });
  const tailHits = [0.15, 0.3, 0.45, 0.6, 0.75, 0.9].flatMap((t) =>
    [0, 60, 120, 240, 300].map((deg) => tailCore.at(t, deg)),
  );
  b.cards(tailHits, [maneA, maneB], {
    size: [0.08, 0.16],
    lean: 60,
    bend: 30,
    vary: 0.2,
    rng: rng(33),
    sink: 0.2,
  });

  // ---- cutie marks on both flanks -----------------------------------------
  for (const s of [1, -1]) {
    const flank = b.surface(body).around([0, 0.8, -0.1]).at(s * 90, 8);
    if (flank) b.decal(body, star, { at: flank, size: [0.11, 0.11] });
  }

  return b.root;
}
