import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  limb,
  frame,
  countershade,
  mottle,
  gradient,
  scales,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gray Wolf (Alert)",
  description:
    "A hulking, Warcraft-styled gray wolf standing alert on a snowy ledge: spiked mane, shoulder fur shards, notched ear, claw scars, glowing amber eyes, beside a rune-stone with frost crystals, a pine sapling and a paw-print trail.",
};

// ---------------------------------------------------------------- constants
const B = 0.14; // height of the snowy base under the paws
const P = (x: number, y: number, z: number): [number, number, number] => [x, y + B, z];

const SNOW_PROFILE: [number, number][] = [
  [0, 0.152],
  [0.8, 0.146],
  [1.2, 0.135],
  [1.37, 0.118],
];
const snowY = (rad: number) => {
  for (let i = 0; i < SNOW_PROFILE.length - 1; i++) {
    const [r0, y0] = SNOW_PROFILE[i];
    const [r1, y1] = SNOW_PROFILE[i + 1];
    if (rad <= r1) return y0 + (y1 - y0) * Math.max(0, (rad - r0) / (r1 - r0));
  }
  return 0.118;
};

// ---------------------------------------------------------------- colours and paints
const CREAM = mottle("#e2dbc7", "#bdb59f", { size: 0.06, seed: 8 });
const GREY = mottle(mottle("#7b8189", "#a7acb2", { size: 0.045, seed: 5 }), "#50545d", {
  size: 0.2,
  seed: 2,
  contrast: 0.7,
});
const COAT = countershade(GREY, CREAM, { level: -0.3, soft: 0.3 });
const LEG = countershade(mottle("#72767d", "#979a9f", { size: 0.05, seed: 21 }), "#cbc4b0", { level: -0.5, soft: 0.3 });
const MUZ = countershade(mottle("#62666c", "#8a8e93", { size: 0.04, seed: 12 }), "#e6e0cf", { level: -0.1, soft: 0.25 });
const FACE = countershade(mottle("#575b62", "#7b8087", { size: 0.04, seed: 14 }), CREAM, { level: -0.35, soft: 0.3 });
const RUFF = mottle("#a9adb2", "#e0d9c6", { size: 0.07, seed: 31 });
const DARKFUR = "#30333a";
const CREAMSOLID = "#d6cfba";
const NOSE = "#16171a";
const CLAW = "#262320";
const FANG = "#f1ead6";
const GUM = "#7a2f3a";
const EARIN = "#8f6f6c";
const STONE = scales(["#5d6068", "#6b6e76", "#54575f"], "#2a2c33", { size: 0.17, width: 0.14, seed: 3 });
const MOSSY = mottle(STONE, "#4f6b4a", { size: 0.18, seed: 6, contrast: 0.8 });
const ROCK = mottle("#80848e", "#5d616c", { size: 0.1, seed: 17 });
const SNOWP = mottle("#f4f8fc", "#cfdcec", { size: 0.2, seed: 4 });
const PINE = mottle("#1d4d3b", "#2f6d4f", { size: 0.1, seed: 9 });
const BARK = "#4a3526";
const BONE = "#e6dcc2";
const CRYSTAL = "#6fd2ff";

export default function build() {
  const b = createBuilder({ name: "gray_wolf" });

  // ---------------------------------------------------------------- textures
  const EYE = svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="c"><path d="M7 15 Q28 5 57 25 Q30 33 7 15Z"/></clipPath>
        <radialGradient id="g" cx="0.55" cy="0.5" r="0.6">
          <stop offset="0" stop-color="#fff2a0"/><stop offset="0.6" stop-color="#ffb91f"/><stop offset="1" stop-color="#d9660c"/>
        </radialGradient>
      </defs>
      <path d="M2 14 Q28 -2 62 26 Q30 40 2 14Z" fill="#101114"/>
      <g clip-path="url(#c)">
        <rect width="64" height="40" fill="url(#g)"/>
        <rect width="64" height="16" fill="#8a3d08" opacity="0.55"/>
        <circle cx="38" cy="22" r="7" fill="#0b0b0d"/>
        <circle cx="35" cy="19" r="2.2" fill="#ffffff"/>
      </g>
      <path d="M2 14 Q28 -2 62 26" fill="none" stroke="#0a0a0c" stroke-width="3.5"/>
    </svg>`,
    { size: 256 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="t" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#8e8e8e"/><stop offset="1" stop-color="#ffffff"/>
      </linearGradient></defs>
      <path d="M0 64 Q4 30 10 6 Q16 34 16 64Z M10 64 Q16 22 24 0 Q28 34 32 64Z" fill="url(#t)"/>
      <path d="M22 62 Q22 36 24 10" stroke="#d2d2d2" stroke-width="1.6" fill="none"/>
    </svg>`,
    { size: 128 },
  );
  const SCAR = svg(
    `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
      <g stroke-linecap="round" fill="none">
        <path d="M10 6 L30 42" stroke="#4a2a2a" stroke-width="5"/>
        <path d="M24 4 L44 40" stroke="#4a2a2a" stroke-width="5"/>
        <path d="M38 6 L56 38" stroke="#4a2a2a" stroke-width="5"/>
        <path d="M10 6 L30 42" stroke="#dbb7aa" stroke-width="2.4"/>
        <path d="M24 4 L44 40" stroke="#dbb7aa" stroke-width="2.4"/>
        <path d="M38 6 L56 38" stroke="#dbb7aa" stroke-width="2.4"/>
      </g>
    </svg>`,
    { size: 192 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#9be9ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="4" width="56" height="88" rx="4"/>
        <circle cx="32" cy="23" r="9"/><path d="M32 8 V38"/>
        <path d="M24 46 V66 M24 50 L40 56 L24 62"/>
        <path d="M32 70 L44 79 L32 88 L20 79Z M32 70 V88"/>
      </g>
    </svg>`,
    { size: 256 },
  );
  const PAW = svg(
    `<svg viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
      <g fill="#9fb2c8">
        <path d="M20 22 C10 22 8 34 12 40 C16 46 24 46 28 40 C32 34 30 22 20 22Z"/>
        <ellipse cx="7" cy="21" rx="4.5" ry="6"/><ellipse cx="15" cy="9" rx="4.5" ry="6.5"/>
        <ellipse cx="25" cy="9" rx="4.5" ry="6.5"/><ellipse cx="33" cy="21" rx="4.5" ry="6"/>
      </g>
    </svg>`,
    { size: 96 },
  );
  const GRASS = svg(
    `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 64 Q8 30 2 4 Q16 28 14 64Z" fill="#ffffff"/>
      <path d="M16 64 Q20 24 24 0 Q30 28 30 64Z" fill="#e4e4e4"/>
      <path d="M28 64 Q34 34 44 8 Q42 40 38 64Z" fill="#cfcfcf"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: P(0, 0.74, -0.42), dir: [0, 0.05, 1], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([P(0, 0.74, -0.42), P(0, 0.76, -0.1), P(0, 0.78, 0.22), P(0, 0.82, 0.5)]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chestBone = spine.joints[2];

  const neck = b.chain("neck", catmull([P(0, 0.84, 0.5), P(0, 1.02, 0.62), P(0, 1.26, 0.8)]), {
    parent: spine,
    names: ["neck1", "neck2"],
    role: "neck",
  });

  const HEAD = P(0, 1.26, 0.8);
  const hd = (x: number, y: number, z: number): [number, number, number] => [x, HEAD[1] + y, HEAD[2] + z];
  const head = b.joint("head", { parent: neck, at: HEAD, dir: [0, -0.04, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hd(0, -0.085, 0.09), aim: hd(0, -0.09, 0.35), role: "jaw" });

  const tailPath = catmull([P(0, 0.74, -0.55), P(0, 0.7, -0.78), P(0, 0.58, -0.97), P(0, 0.4, -1.08)]);
  const tail = b.chain("tail", tailPath, { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" });

  // ---------------------------------------------------------------- torso
  const body = b.sweep(spine, (t: number) => [0.14 + 0.045 * t, 0.2 + 0.05 * t], {
    color: COAT,
    shift: [0, -0.02],
    name: "torso",
  });
  const blob = (at: [number, number, number], scale: [number, number, number], color: any, bone: any) =>
    b.part(new THREE.SphereGeometry(1, 10, 8), color, { at, scale, bone });

  const chest = blob(P(0, 0.66, 0.48), [0.17, 0.24, 0.2], COAT, chestBone);
  const bib = blob(P(0, 0.62, 0.56), [0.115, 0.2, 0.14], CREAM, chestBone);
  const rump = blob(P(0, 0.76, -0.48), [0.17, 0.19, 0.2], COAT, hips);
  const neckTube = b.sweep(neck, [0.15, 0.11], { color: COAT, name: "neckTube" });

  const shoulders: any[] = [];
  const thighs: any[] = [];
  for (const s of [1, -1]) {
    shoulders.push(blob(P(s * 0.17, 0.8, 0.4), [0.1, 0.2, 0.17], COAT, chestBone));
    thighs.push(blob(P(s * 0.17, 0.68, -0.46), [0.11, 0.2, 0.2], COAT, hips));
  }

  // ---------------------------------------------------------------- tail
  const TAILPAINT = gradient(COAT, "#26282d", tailPath.at(0.72), tailPath.at(1));
  const tailTube = b.sweep(tail, [0.075, 0.11, 0.105, 0.07, 0.03], { color: TAILPAINT, name: "tailTube" });

  // ---------------------------------------------------------------- legs
  const paw = (bone: typeof head, cx: number, cz: number, sc: number) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), LEG, {
      bone,
      at: P(cx, 0.035, cz + 0.045 * sc),
      scale: [0.058 * sc, 0.04 * sc, 0.095 * sc],
    });
    for (let i = 0; i < 4; i++) {
      const k = i - 1.5;
      const tx = cx + k * 0.034 * sc;
      const tz = cz + (0.115 - Math.abs(k) * 0.016) * sc;
      b.part(new THREE.SphereGeometry(1, 6, 4), LEG, {
        bone,
        at: P(tx, 0.028, tz),
        scale: [0.019 * sc, 0.02 * sc, 0.03 * sc],
      });
      b.part(new THREE.ConeGeometry(0.009 * sc, 0.045 * sc, 5), CLAW, {
        bone,
        at: P(tx, 0.02, tz + 0.04 * sc),
        dir: [k * 0.1, -0.35, 1],
      });
    }
  };

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    const fpts = limb(P(s * 0.17, 0.72, 0.42), P(s * 0.17, 0.075, 0.5), [0.3, 0.3, 0.15], [
      [0, 0, -1],
      [0, 0, 1],
    ]);
    const fl = b.chain(`legF${L}`, fpts, {
      parent: chestBone,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `paw${L}`],
      role: "leg",
    });
    b.sweep(fl, [0.085, 0.07, 0.052, 0.046, 0.045], { color: LEG, name: `foreleg${L}` });
    b.spike(fl.joints[1], [0, -0.25, -1], 0.13, 0.04, { color: DARKFUR, bone: fl.joints[1] });
    paw(fl.tip!, s * 0.17, 0.5, 1);

    const hpts = limb(P(s * 0.16, 0.72, -0.44), P(s * 0.16, 0.075, -0.5), [0.34, 0.32, 0.28], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hl = b.chain(`legH${L}`, hpts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `hock${L}`, `foot${L}`],
      role: "leg",
    });
    b.sweep(hl, [0.1, 0.075, 0.055, 0.045, 0.043], { color: LEG, name: `hindleg${L}` });
    b.spike(hl.joints[2], [0, 0.35, -1], 0.12, 0.04, { color: DARKFUR, bone: hl.joints[2] });
    paw(hl.tip!, s * 0.16, -0.5, 1.05);
  }

  // ---------------------------------------------------------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), FACE, {
    bone: head,
    at: hd(0, 0.02, 0.08),
    scale: [0.125, 0.11, 0.13],
    name: "skull",
  });
  // upper muzzle and lower jaw (separate so the mouth opens)
  b.frustumBox(hd(0, 0.0, 0.17), hd(0, -0.03, 0.38), [0.15, 0.11], [0.09, 0.075], { bone: head, color: MUZ });
  b.frustumBox(hd(0, -0.1, 0.12), hd(0, -0.1, 0.37), [0.11, 0.04], [0.065, 0.035], { bone: jaw, color: CREAM });
  b.part(new THREE.BoxGeometry(0.07, 0.01, 0.22), GUM, { bone: jaw, at: hd(0, -0.08, 0.24) });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, { bone: head, at: hd(0, -0.012, 0.385), scale: [0.05, 0.032, 0.03] });
  b.part(new THREE.SphereGeometry(1, 6, 4), "#5d626c", { bone: head, at: hd(0.012, -0.002, 0.405), scale: [0.012, 0.007, 0.007] });
  b.spike(jaw, [0, -0.5, -1], 0.1, 0.03, { color: CREAMSOLID, bone: jaw });

  for (const s of [1, -1]) {
    // jowls and mouth line
    b.part(new THREE.SphereGeometry(1, 8, 6), MUZ, { bone: head, at: hd(s * 0.062, -0.05, 0.2), scale: [0.04, 0.045, 0.09] });
    b.rod(hd(s * 0.05, -0.067, 0.11), hd(s * 0.043, -0.066, 0.37), 0.004, { color: "#15161a", bone: head });
    // brow
    b.part(new THREE.BoxGeometry(0.075, 0.022, 0.07), FACE, {
      bone: head,
      at: hd(s * 0.068, 0.105, 0.15),
      rotation: [10, 0, s * 20],
    });
    // fangs, upper and lower
    b.part(new THREE.ConeGeometry(0.012, 0.045, 5), FANG, { bone: head, at: hd(s * 0.04, -0.08, 0.31), dir: [0, -1, 0] });
    b.part(new THREE.ConeGeometry(0.01, 0.038, 5), FANG, { bone: jaw, at: hd(s * 0.034, -0.068, 0.34), dir: [0, 1, 0] });
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.ConeGeometry(0.008, 0.026, 4), FANG, {
        bone: head,
        at: hd(s * 0.05, -0.068, 0.21 + i * 0.03),
        dir: [0, -1, 0],
      });
    }
    // cheek ruff
    for (let i = 0; i < 4; i++) {
      b.spike(hd(s * 0.1, -0.02 - i * 0.012, 0.15 - i * 0.05), [s * 0.5, -0.3, -0.8], 0.13 - i * 0.01, 0.036, {
        color: CREAMSOLID,
        bone: head,
      });
    }
    // whiskers
    for (let i = 0; i < 3; i++) {
      b.spike(hd(s * 0.055, -0.03 - i * 0.012, 0.3 - i * 0.02), [s * 0.9, -0.2 - i * 0.12, -0.1], 0.12, 0.004, {
        color: CREAMSOLID,
        bone: head,
      });
    }
    // ears: the left one is notched from an old fight
    const outline: any =
      s > 0
        ? [[-0.065, 0], [0.065, 0], [0.05, 0.1], [0.03, 0.15], [0.0, 0.115], [-0.01, 0.19], [-0.05, 0.09]]
        : [[-0.065, 0], [0.065, 0], [0.05, 0.08], [0.0, 0.19], [-0.05, 0.08]];
    const ex: [number, number, number] = [1, -0.3 * s, 0];
    const ey: [number, number, number] = [0.3 * s, 1, 0];
    b.extrude(outline, { at: hd(s * 0.07, 0.085, 0.02), x: ex, y: ey, thickness: 0.025, bevel: 0.006, color: FACE, bone: head });
    b.extrude(
      [[-0.04, 0.01], [0.04, 0.01], [0.0, 0.135]],
      { at: hd(s * 0.07, 0.09, 0.032), x: ex, y: ey, thickness: 0.012, color: EARIN, bone: head },
    );
    // glowing amber eye
    const eye = b.decal(skull, EYE, {
      at: hd(s * 0.088, 0.055, 0.16),
      dir: [s * 0.75, 0.1, 0.65],
      size: [0.09, 0.056],
      mirror: s > 0,
    });
    glow(eye, 0.9);
  }
  // crown spikes linking the mane to the head
  for (let i = -1; i <= 1; i++) {
    b.spike(hd(i * 0.045, 0.115 - Math.abs(i) * 0.015, 0.0), [0, 0.35, -1], 0.11 - Math.abs(i) * 0.02, 0.03, {
      color: DARKFUR,
      bone: head,
    });
  }
  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });

  // ---------------------------------------------------------------- mane, shards, scar
  b.along(body, 7, (at) =>
    b.spike(at, at.n.clone().addScaledVector(at.tangent, -1.1), 0.06 + 0.04 * at.t, 0.028, { color: "#454951" }),
  );
  b.along(neckTube, 6, (at) =>
    b.spike(at, at.n.clone().addScaledVector(at.tangent, -1.3), 0.11 + 0.03 * (1 - at.t), 0.034, { color: DARKFUR }),
  );
  for (const ang of [55, -55]) {
    for (let i = 0; i < 4; i++) {
      const at = neckTube.at(0.12 + i * 0.22, ang);
      b.spike(at, at.n.clone().addScaledVector(at.tangent, -1.2), 0.09, 0.03, { color: "#454951" });
    }
  }
  b.along(tailTube, 3, (at) =>
    b.spike(at, at.n.clone().addScaledVector(at.tangent, -1.2), 0.08, 0.03, { color: DARKFUR }),
  );

  const shardOutline = (k: number): any =>
    [[0, 0], [0.12, 0.03], [0.2, -0.03], [0.15, -0.07], [0.23, -0.14], [0.1, -0.13], [0, -0.1]].map(([x, y]) => [x * k, y * k]);
  for (const s of [1, -1]) {
    b.extrude(shardOutline(1), {
      at: P(s * 0.17, 0.99, 0.46), x: [0, 0, -1], y: [0, 1, 0], thickness: [0.05, 0.02], bevel: 0.005, color: DARKFUR, bone: chestBone,
    });
    b.extrude(shardOutline(0.8), {
      at: P(s * 0.2, 0.9, 0.22), x: [0, 0, -1], y: [0, 1, 0], thickness: [0.045, 0.018], bevel: 0.004, color: "#3b3e46", bone: spine.joints[1],
    });
    b.extrude(shardOutline(0.7), {
      at: P(s * 0.19, 0.84, -0.05), x: [0, 0, -1], y: [0, 1, 0], thickness: [0.04, 0.015], bevel: 0.004, color: "#3b3e46", bone: spine.joints[1],
    });
  }
  b.decal(body, SCAR, { at: P(0.19, 0.74, 0.14), dir: [1, 0, 0], size: [0.2, 0.15], roll: -20 });

  // ---------------------------------------------------------------- fur cards
  const bodySkin = b.surface(body);
  b.cards(
    bodySkin.scatter(150, { rng: rng(11), minDist: 0.055, filter: (h) => h.n.y > -0.5 }),
    TUFT,
    { size: [0.07, 0.13], lean: 60, bend: 25, vary: 0.3, rng: rng(5), color: COAT },
  );
  b.cards(
    b.surface(neckTube).scatter(90, { rng: rng(12), minDist: 0.05 }),
    TUFT,
    { size: [0.09, 0.17], lean: 50, bend: 25, vary: 0.3, rng: rng(6), color: RUFF, flow: [0, -0.5, -1] },
  );
  b.cards(
    b.surface(tailTube).scatter(80, { rng: rng(13), minDist: 0.05 }),
    TUFT,
    { size: [0.07, 0.16], lean: 55, bend: 25, vary: 0.3, rng: rng(7), color: TAILPAINT },
  );
  b.cards(
    b.surface(bib).scatter(40, { rng: rng(14), minDist: 0.05, filter: (h) => h.n.z > 0 }),
    TUFT,
    { size: [0.07, 0.14], lean: 60, bend: 20, vary: 0.3, rng: rng(8), color: CREAM, flow: [0, -1, -0.2] },
  );
  for (const mass of [...shoulders, ...thighs]) {
    b.cards(
      b.surface(mass).scatter(24, { rng: rng(15), minDist: 0.05, filter: (h) => h.n.y > -0.3 }),
      TUFT,
      { size: [0.07, 0.13], lean: 60, bend: 20, vary: 0.3, rng: rng(9), color: COAT },
    );
  }
  void chest;
  void rump;

  // ---------------------------------------------------------------- base and scenery
  const SCENE = { bone: hips };
  b.lathe([[0, 0], [1.4, 0], [1.46, 0.05], [1.38, 0.104], [0, 0.106]], {
    at: [0, 0, 0], segments: 14, color: STONE, ...SCENE, name: "plinth",
  });
  b.lathe([[0, 0.1], [1.33, 0.1], ...SNOW_PROFILE.slice().reverse()], {
    at: [0, 0, 0], segments: 14, color: SNOWP, ...SCENE, name: "snow",
  });

  // snow drifts
  ([[0.9, -0.3, 30], [-0.8, 0.7, 70], [0.3, 0.95, 10], [-0.3, -0.95, 50]] as number[][]).forEach(([x, z, a]) => {
    const rad = Math.hypot(x, z);
    b.part(new THREE.SphereGeometry(1, 8, 5), SNOWP, {
      at: [x, snowY(rad), z], scale: [0.3, 0.07, 0.22], rotation: [0, a, 0], flat: true, ...SCENE,
    });
  });

  // rocks with snow caps
  ([
    [-0.7, -1.0, 0.3, 0.22, 0.26, 20],
    [1.05, 0.3, 0.26, 0.18, 0.22, 70],
    [0.55, 1.0, 0.2, 0.15, 0.18, 10],
    [-0.45, 1.05, 0.22, 0.16, 0.2, 45],
    [-1.15, -0.75, 0.2, 0.2, 0.18, 5],
    [0.15, -1.15, 0.24, 0.14, 0.2, 60],
  ] as number[][]).forEach(([x, z, sx, sy, sz, ang]) => {
    const y = snowY(Math.hypot(x, z));
    b.part(new THREE.IcosahedronGeometry(1, 0), ROCK, {
      at: [x, y + sy * 0.35, z], scale: [sx, sy, sz], rotation: [0, ang, 0], flat: true, ...SCENE,
    });
    b.part(new THREE.IcosahedronGeometry(1, 0), SNOWP, {
      at: [x, y + sy * 1.05, z], scale: [sx * 0.75, sy * 0.38, sz * 0.75], rotation: [0, ang, 0], flat: true, ...SCENE,
    });
  });

  // rune stone with glowing carving
  const sx0 = -0.95;
  const sz0 = -0.2;
  const stone = b.extrude(
    [[-0.28, 0], [0.28, 0], [0.26, 0.55], [0.15, 0.88], [-0.02, 1.0], [-0.2, 0.82], [-0.3, 0.5]],
    {
      at: [sx0, snowY(Math.hypot(sx0, sz0)) - 0.03, sz0],
      x: [0.94, 0, -0.34], y: [0, 1, 0], thickness: 0.16, bevel: 0.02, color: MOSSY, ...SCENE, name: "runestone",
    },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.34, 0.5), "#ffffff", {
      at: stone.local([0, 0.5, 0.086]), dir: stone.axis, axis: "z", up: [0, 1, 0], texture: RUNE, ...SCENE,
    }),
    1.4,
  );
  // frost crystals
  ([
    [-0.85, 0.5, 0.4, 0.25, 0.1],
    [-1.15, 0.52, 0.3, -0.2, 0.15],
    [-0.8, -0.2, 0.26, 0.3, -0.1],
    [-1.22, -0.12, 0.22, -0.3, 0.0],
    [-0.98, 0.58, 0.18, 0.1, 0.3],
  ] as number[][]).forEach(([x, z, h, dx, dz]) => {
    const y = snowY(Math.hypot(x, z));
    glow(
      b.part(new THREE.ConeGeometry(0.06, h, 5), CRYSTAL, {
        at: [x, y + h * 0.4, z], dir: [dx, 1, dz], flat: true, ...SCENE,
      }),
      1.3,
    );
  });

  // pine sapling
  const px = 0.8;
  const pz = -0.7;
  const py = snowY(Math.hypot(px, pz));
  b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.3, 6), BARK, { at: [px, py + 0.12, pz], ...SCENE });
  ([[0.3, 0.45, 0.26], [0.24, 0.4, 0.5], [0.16, 0.35, 0.72]] as number[][]).forEach(([rad, h, yy]) => {
    b.part(new THREE.ConeGeometry(rad, h, 7), PINE, { at: [px, py + yy, pz], flat: true, ...SCENE });
    b.part(new THREE.ConeGeometry(rad * 0.43, h * 0.43, 7), SNOWP, {
      at: [px, py + yy + h * 0.285 - 0.01, pz], flat: true, ...SCENE,
    });
  });

  // a gnawed femur
  const fx = 0.75;
  const fz = 0.8;
  const fy = snowY(Math.hypot(fx, fz)) + 0.025;
  b.rod([fx - 0.12, fy, fz - 0.05], [fx + 0.12, fy, fz + 0.05], 0.018, { color: BONE, ...SCENE });
  for (const e of [-1, 1]) {
    for (const o of [-0.012, 0.012]) {
      b.part(new THREE.SphereGeometry(0.024, 6, 5), BONE, {
        at: [fx + e * 0.125, fy, fz + e * 0.05 + o * 1.5], ...SCENE,
      });
    }
  }

  // paw-print trail
  for (let i = 0; i < 5; i++) {
    const side = i % 2 ? 1 : -1;
    const x = 0.8 - 0.0875 * i + side * 0.05 * 0.819;
    const z = -0.75 + 0.125 * i + side * 0.05 * 0.573;
    b.part(new THREE.PlaneGeometry(0.1, 0.12), "#ffffff", {
      at: [x, snowY(Math.hypot(x, z)) + 0.012, z],
      dir: [0, 1, 0], axis: "z", up: [-0.573, 0, 0.819], texture: PAW, ...SCENE,
    });
  }

  // dry grass tufts around the rim
  const gr = rng(21);
  const tufts = [];
  for (let i = 0; i < 32; i++) {
    const a = gr() * Math.PI * 2;
    const rad = 0.95 + gr() * 0.4;
    tufts.push(frame([Math.cos(a) * rad, snowY(rad), Math.sin(a) * rad], [0, 1, 0]));
  }
  b.cards(tufts, GRASS, {
    size: [0.14, 0.22], lean: 10, bend: 25, flow: [0.3, 0, 1], cross: true, vary: 0.4, spin: 180, rng: rng(22), color: "#d8c07a", ...SCENE,
  });

  return b.root;
}
