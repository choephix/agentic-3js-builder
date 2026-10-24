import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  offset,
  catmull,
  spiral,
  limb,
  countershade,
  paint,
  mix,
  noise,
  smoothstep,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cloud Sheep",
  description:
    "A Kirby-style sheep made of cumulus cloud, floating on stubby coral feet: pastel puff wool, big shiny tall eyes, round cheek blush, ram horns, a golden star mark and drifting sparkles.",
};

// ---------------------------------------------------------------------------------------------------------
// Palette
const WHITE = "#ffffff";
const MID = "#e8f0ff";
const SHADE = "#a9bdf0";
const LAV = "#c9b8f0";
const PINKGLOW = "#ffdff0";
const FACE_TOP = "#ffc3d6";
const FACE_BOT = "#f29ab9";
const MOUTH = "#7a2240";
const TONGUE = "#ff7f9f";
const EAR_OUT = "#f48fb1";
const EAR_IN = "#ffd6e2";
const HORN_A = "#ffe9a0";
const HORN_B = "#f2b94a";
const GOLD = "#ffd84a";
const TOE = "#ffb3c4";

// Surface paints ------------------------------------------------------------------------------------------
const CLOUD = paint((p, n) => {
  const lit = n.y + 0.18 * (noise(p, 0.2, 4) - 0.5);
  let c = mix(SHADE, MID, smoothstep(-0.34, -0.2, lit));
  c = mix(c, WHITE, smoothstep(0.2, 0.34, lit));
  c = mix(c, PINKGLOW, 0.55 * smoothstep(0.62, 0.7, noise(p, 0.13, 9)) * smoothstep(-0.3, 0.2, lit));
  c = mix(c, LAV, 0.45 * smoothstep(0.46, 0.2, p.y));
  return c;
});
const FACE = countershade(FACE_TOP, FACE_BOT, { level: -0.15, soft: 0.5 });
const FOOT = countershade("#ff7a96", "#df4a72", { level: 0, soft: 0.4 });

// Textures --------------------------------------------------------------------------------------------------
const EYE = svg(
  `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.35" stop-color="#1b1646"/><stop offset="0.75" stop-color="#2f5bd8"/><stop offset="1" stop-color="#6fb4ff"/>
    </linearGradient></defs>
    <ellipse cx="30" cy="50" rx="27" ry="47" fill="#150f33"/>
    <ellipse cx="30" cy="52" rx="23" ry="43" fill="url(#g)"/>
    <ellipse cx="30" cy="29" rx="14" ry="18" fill="#ffffff"/>
    <ellipse cx="33" cy="78" rx="9" ry="7" fill="#a9ddff"/>
    <circle cx="20" cy="66" r="3.2" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);
const BLUSH = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="30" rx="48" ry="27" fill="#ff7b9c"/>
    <ellipse cx="50" cy="32" rx="36" ry="19" fill="#ff5c86"/>
    <ellipse cx="34" cy="22" rx="9" ry="4" fill="#ff9db6"/>
  </svg>`,
  { size: 128 },
);
const STARMARK = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 4 L40 24 L61 25 L45 39 L50 60 L32 48 L14 60 L19 39 L3 25 L24 24Z" fill="#ffd84a" stroke="#e09a1c" stroke-width="4" stroke-linejoin="round"/>
    <path d="M32 14 L36 26 L26 26Z" fill="#fff4b0"/>
  </svg>`,
  { size: 128 },
);
const SWIRL = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 34 C28 34 28 28 33 28 C41 28 41 40 31 40 C20 40 20 22 35 22 C50 22 50 46 30 46" fill="none" stroke="#a3b9ee" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);
const SPARKLE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 2 L38 26 L62 32 L38 38 L32 62 L26 38 L2 32 L26 26Z" fill="#fff7c2" stroke="#ffd84a" stroke-width="3" stroke-linejoin="round"/>
  </svg>`,
  { size: 128 },
);

const starOutline = (R: number, r: number, rot = 0): [number, number][] =>
  Array.from({ length: 10 }, (_, i) => {
    const a = rot + Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r : R;
    return [Math.cos(a) * rr, Math.sin(a) * rr] as [number, number];
  });

export default function build() {
  const b = createBuilder({ name: "cloudSheep", paintSize: 2048 });
  const rand = rng(21);

  // -------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.6, -0.32], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.6, -0.3],
      [0, 0.62, -0.05],
      [0, 0.64, 0.2],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.64, 0.2],
      [0, 0.75, 0.3],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const HC: [number, number, number] = [0, 0.76, 0.37]; // head centre
  const HR: [number, number, number] = [0.26, 0.235, 0.235]; // head radii
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.75, 0.3], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.66, 0.46], dir: [0, -0.15, 1], role: "jaw" });

  // -------------------------------------------------------------------------------------------------------
  // Body core
  const body = b.loft(
    [
      { at: [0, 0.62, -0.42], w: 0.3, h: 0.32 },
      { at: [0, 0.62, -0.28], w: 0.68, h: 0.64 },
      { at: [0, 0.62, -0.05], w: 0.78, h: 0.72 },
      { at: [0, 0.63, 0.18], w: 0.74, h: 0.68 },
      { at: [0, 0.64, 0.32], w: 0.46, h: 0.5 },
    ],
    { bone: [hips, spine], color: CLOUD },
  );
  b.sweep(neck, [0.17, 0.15], { color: CLOUD });

  // Puff helper: every cloud lump is a low-poly sphere seated on a frame
  type On = Parameters<typeof b.stick>[2];
  const puffs: ReturnType<typeof b.stick>[] = [];
  const puff = (on: On, r: number, embed = 0.5) => {
    const p = b.stick(new THREE.SphereGeometry(r, 8, 6), CLOUD, on, { embed });
    puffs.push(p);
    return p;
  };

  // -------------------------------------------------------------------------------------------------------
  // Head
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), FACE, { bone: head, at: HC, scale: HR });
  const skin = b.surface(skull);
  const headC = new THREE.Vector3(...HC);

  // Mouth: dark cavity on the upper head, separate chin + tongue on the jaw joint
  b.part(new THREE.SphereGeometry(1, 10, 8), MOUTH, { bone: head, at: [0, 0.668, 0.578], scale: [0.058, 0.034, 0.03] });
  b.part(new THREE.SphereGeometry(1, 10, 8), FACE, { bone: jaw, at: [0, 0.612, 0.545], scale: [0.075, 0.032, 0.06] });
  b.part(new THREE.SphereGeometry(1, 8, 6), TONGUE, { bone: jaw, at: [0, 0.63, 0.55], scale: [0.04, 0.014, 0.038] });

  // Eyes, cheeks and the star mark are drawings conformed onto the skull
  for (const s of [1, -1]) {
    const eyeHit = skin.nearest([s * 0.088, 0.8, 0.7]);
    b.decal(skull, EYE, { at: eyeHit.at, dir: eyeHit.n, size: [0.072, 0.112], mirror: s > 0 });
    const cheekHit = skin.nearest([s * 0.17, 0.69, 0.66]);
    b.decal(skull, BLUSH, { at: cheekHit.at, dir: cheekHit.n, size: [0.1, 0.06], roll: s * 12 });
  }
  const markHit = skin.nearest([0, 0.935, 0.7]);
  glow(b.decal(skull, STARMARK, { at: markHit.at, dir: markHit.n, size: [0.05, 0.05] }), 0.9);

  // Ears: floppy leaves, pink with a pale inner
  const earOut: [number, number][] = [
    [-0.02, 0], [0.03, 0.05], [0.1, 0.062], [0.175, 0.02], [0.185, -0.01], [0.12, -0.05], [0.04, -0.045],
  ];
  const earIn: [number, number][] = [
    [0.02, 0], [0.05, 0.03], [0.1, 0.04], [0.15, 0.012], [0.15, -0.008], [0.1, -0.032], [0.05, -0.028],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, { parent: head, at: [s * 0.2, 0.79, 0.33], dir: [s, -0.3, 0], role: "hinge" });
    b.extrude(earOut, { at: ear.at, x: [s, -0.3, 0], y: [0, 0, 1], thickness: 0.02, bevel: 0.005, smoothing: 1, color: EAR_OUT, bone: ear });
    b.extrude(earIn, { at: ear.at, x: [s, -0.3, 0], y: [0, 0, 1], thickness: 0.026, bevel: 0.004, smoothing: 1, color: EAR_IN, bone: ear });
  }

  // Ram horns in banded gold
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = skin.around(skull.at).at(s * 52, 56)!;
    const coil = spiral(offset(hit, [0, -1, -0.3], 0.085), hit, [s, 0, 0], {
      turns: -s * 1.15,
      r1: 0.04,
      pitch: 0.1,
    });
    b.sprout(`horn${side}`, hit, coil, [0.045, 0.012], {
      count: 0,
      caps: { end: "point" },
      color: HORN_A,
      bands: [
        [0.2, HORN_A], [0.4, HORN_B], [0.6, HORN_A], [0.8, HORN_B], [1, HORN_A],
      ],
    });
    puff(hit, 0.055, 0.35);
  }

  // Wool hood on the head: back, top and sides; the face stays clear
  for (const h of skin.scatter(34, { rng: rng(9), minDist: 0.07, filter: (h) => h.n.z < 0.25 && h.n.y > -0.35 }))
    puff(h, 0.06 + 0.03 * rand());
  // Forelock puffs above the eyes
  const lockR = [0.07, 0.09, 0.07];
  [-20, 0, 20].forEach((az, i) => {
    const h = skin.around(skull.at).at(az, 64);
    if (h) puff(h, lockR[i], 0.4);
  });
  // Forelock curl
  const curlHit = skin.around(skull.at).at(0, 68)!;
  const curl = spiral(offset(curlHit, [0, 1, 0], 0.05), curlHit, [1, 0, 0], { turns: -0.9, r1: 0.026, pitch: 0 });
  b.sprout("forelock", curlHit, curl, [0.032, 0.012], { count: 0, color: CLOUD, caps: { end: "round" } });

  // -------------------------------------------------------------------------------------------------------
  // Cloud wool on the body: big cumulus bumps first, then a fill of smaller puffs
  const bodySkin = b.surface(body);
  const BC: [number, number, number] = [0, 0.62, 0.0];
  const awayFromHead = (p: THREE.Vector3) => p.distanceTo(headC) > 0.34;
  for (const [el, count, off] of [[-28, 10, 0], [10, 10, 0.5], [42, 9, 0.2], [72, 5, 0]] as const) {
    for (let i = 0; i < count; i++) {
      const az = ((i + off) * 360) / count + (rand() - 0.5) * 10;
      const hit = bodySkin.around(BC).at(az, el);
      if (!hit || !awayFromHead(hit.at)) continue;
      puff(hit, 0.115 + 0.045 * rand(), 0.55);
    }
  }
  for (const h of bodySkin.scatter(70, { rng: rng(7), minDist: 0.12, filter: (h) => awayFromHead(h.at) }))
    puff(h, 0.065 + 0.035 * rand(), 0.5);
  // Heavy underside puffs: the floating mass of the cloud
  for (const h of bodySkin.scatter(10, { rng: rng(13), minDist: 0.14, filter: (h) => h.n.y < -0.55 }))
    puff(h, 0.1 + 0.03 * rand(), 0.3);

  // -------------------------------------------------------------------------------------------------------
  // Legs with Kirby feet
  const legSpec = [
    { name: "F", z: 0.14, parent: spine.joints[1], bend: [0, 0, 1] },
    { name: "H", z: -0.26, parent: hips, bend: [0, 0, -1] },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const L of legSpec) {
      const pts = limb([s * 0.2, 0.45, L.z], [s * 0.21, 0.1, L.z], [0.18, 0.18], [L.bend]);
      const leg = b.chain(`leg${L.name}${side}`, pts, {
        parent: L.parent,
        names: [`hip${L.name}${side}`, `knee${L.name}${side}`, `ankle${L.name}${side}`],
        role: "leg",
        contact: [s * 0.215, 0, L.z + 0.03],
      });
      b.sweep(leg, [0.075, 0.062], { color: CLOUD });
      const ankle = leg.tip!;
      const foot = b.part(new THREE.SphereGeometry(1, 12, 8), FOOT, {
        bone: ankle,
        at: [s * 0.215, 0.06, L.z + 0.03],
        scale: [0.085, 0.06, 0.12],
      });
      const fs = b.surface(foot);
      for (const az of [-26, 0, 26]) {
        const th = fs.around(foot.at).at(az, 8);
        if (th) b.stick(new THREE.SphereGeometry(0.02, 6, 4), TOE, th, { embed: 0.5 });
      }
      b.ring(ankle, { count: 7, radius: 0.06 }, (item) => {
        puff(item, 0.05, 0.5);
      });
    }
  }

  // -------------------------------------------------------------------------------------------------------
  // Tail: a curling cloud wisp ending in a star
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.62, -0.42],
      [0, 0.64, -0.55],
      [0, 0.7, -0.68],
      [0, 0.82, -0.74],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );
  b.sweep(tail, [0.06, 0.03], { color: CLOUD });
  b.along(tail, 4, (at) => {
    const r = 0.1 - 0.045 * at.t;
    b.part(new THREE.SphereGeometry(r, 8, 6), CLOUD, { at });
  });
  const tailTip = tail.at(1).at;
  glow(
    b.extrude(starOutline(0.055, 0.024, 0.2), {
      at: offset(tailTip, [0, 1, -0.2], 0.1),
      x: [1, 0, 0],
      thickness: 0.024,
      bevel: 0.005,
      color: GOLD,
      bone: tail.tip!,
    }),
    1.3,
  );

  // -------------------------------------------------------------------------------------------------------
  // Swirl patterns drawn on the cloud lumps
  const swirlHits = b.surface(puffs).scatter(34, { rng: rng(17), minDist: 0.13, filter: (h) => h.n.y > 0.15 });
  b.cards(swirlHits, SWIRL, { size: 0.075, lean: 90, rng: rng(11), vary: 0.25, spin: 180 });

  // Floating stars and sparkles
  const stars: [[number, number, number], number, number][] = [
    [[0.5, 1.08, 0.3], 0.05, 0.3],
    [[-0.55, 0.95, 0.15], 0.04, -0.2],
    [[0.6, 0.5, 0.4], 0.035, 0.5],
  ];
  for (const [at, R, rot] of stars)
    glow(
      b.extrude(starOutline(R, R * 0.45, rot), {
        at,
        x: [1, 0, 0],
        thickness: 0.022,
        bevel: 0.005,
        color: GOLD,
        bone: hips,
      }),
      1.3,
    );
  const sparkleFrames = [
    [0.4, 0.28, 0.5], [-0.45, 0.35, 0.35], [-0.35, 1.05, -0.3], [0.3, 1.1, -0.2], [0.0, 1.2, 0.2], [-0.5, 0.6, -0.5],
  ].map((p) => frame(p as [number, number, number], [0, 1, 0]));
  glow(b.cards(sparkleFrames, SPARKLE, { size: 0.08, cross: true, flow: [0, 0, 1], bone: hips, vary: 0.3, rng: rng(5) }), 1.2);

  // Rest pose: little open mouth
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });

  return b.root;
}
