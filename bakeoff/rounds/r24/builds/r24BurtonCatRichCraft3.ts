import * as THREE from "three";
import {
  createBuilder,
  rng,
  offset,
  catmull,
  bezier,
  limb,
  paint,
  mix,
  noise,
  smoothstep,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gaunt Black Cat",
  description:
    "A skinny, hollow-eyed Tim Burton black cat: visible ribs, spindly striped stockings, torn ears, stitched flank scar and a tall striped spiral tail, with spiral-pupil glowing eyes.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const BLACK = "#14111a";
const WISPC = "#1a1722";
const RIDGE = "#2b2639";
const RIB = "#2d2839";
const STRIPE = "#a9a1c2";
const STRIPE_T = "#cfc8e2";
const NOSE = "#85647f";
const EARIN = "#5d3f5f";
const WHISK = "#aaa3bd";
const CLAW = "#d9d2e6";
const COLLAR = "#4a2a6e";
const BRASS = "#c9a24a";
const FANG = "#ece6f4";

// ---------------------------------------------------------------------------------------------------------------
// Paints
const COAT = paint((p, n) => {
  const up = smoothstep(-0.5, 0.9, n.y);
  const front = smoothstep(0.2, 1, n.z) * 0.25;
  const nz = noise(p, 0.06, 4);
  const base = mix([0.035, 0.03, 0.05], [0.15, 0.13, 0.23], up * 0.55 + front * 0.3);
  return mix(base, [0.21, 0.18, 0.31], 0.35 * smoothstep(0.6, 0.85, nz) * up);
});
const LEG = paint((p) => (p.y < 0.18 && p.y > 0.035 && (p.y / 0.03) % 1 < 0.38 ? STRIPE : COAT));
const TAILP = paint((_p, _n, s) => (s[0] > 0.26 && (s[0] * 22) % 1 < 0.42 ? STRIPE_T : COAT));

// ---------------------------------------------------------------------------------------------------------------
// Textures
const spiralD = (cx: number, cy: number, r0: number, r1: number, turns: number) => {
  let d = "";
  const n = Math.round(turns * 14);
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const a = u * turns * Math.PI * 2;
    const r = r0 + (r1 - r0) * u;
    d += `${i ? "L" : "M"}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  }
  return d;
};

const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="e" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stop-color="#f8ffb4"/><stop offset="0.7" stop-color="#d0e84a"/><stop offset="1" stop-color="#8aaa22"/></radialGradient>
    <clipPath id="c"><circle cx="50" cy="50" r="49"/></clipPath>
  </defs>
  <circle cx="50" cy="50" r="49" fill="#31264a"/>
  <circle cx="50" cy="50" r="42" fill="#0d0a14"/>
  <circle cx="50" cy="50" r="38" fill="url(#e)"/>
  <path d="${spiralD(50, 54, 3, 29, 2.3)}" fill="none" stroke="#130d1b" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="35" cy="40" r="6.5" fill="#ffffff"/>
  <circle cx="63" cy="66" r="3" fill="#ffffff" opacity="0.85"/>
  <g clip-path="url(#c)">
    <path d="M0 0 H100 V20 Q55 30 0 46Z" fill="#0d0a14"/>
    <path d="M100 20 Q55 30 0 46" stroke="#31264a" stroke-width="2" fill="none"/>
  </g>
</svg>`,
  { size: 256 },
);

const MOUTH = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#cfc6e0" stroke-width="3.2" stroke-linecap="round" fill="none">
    <path d="M50 4 V18"/>
    <path d="M50 18 Q42 34 20 26"/>
    <path d="M50 18 Q58 34 80 26"/>
  </g>
  <g stroke="#cfc6e0" stroke-width="2.4" stroke-linecap="round">
    <path d="M30 21 L33 33"/><path d="M38 28 L40 40"/><path d="M62 28 L60 40"/><path d="M70 21 L67 33"/>
    <path d="M50 22 L50 32"/>
  </g>
</svg>`,
  { size: 256 },
);

const stitchTicks = (() => {
  let d = "";
  for (let i = 0; i < 9; i++) {
    const x = 14 + i * 11;
    d += `<path d="M${x} 12 L${x + 6} 48" /><path d="M${x + 6} 12 L${x} 48" />`;
  }
  return d;
})();
const SCAR = svg(
  `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 31 Q20 25 34 32 T62 30 T90 32 T114 28" stroke="#07050a" stroke-width="9" stroke-linecap="round" fill="none"/>
  <path d="M6 31 Q20 25 34 32 T62 30 T90 32 T114 28" stroke="#3a3350" stroke-width="3" stroke-linecap="round" fill="none"/>
  <g stroke="#d9d2ea" stroke-width="3" stroke-linecap="round">${stitchTicks}</g>
</svg>`,
  { size: 256 },
);

const PATCH = svg(
  `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="p"><path d="M6 8 L40 4 L74 9 L77 42 L72 74 L38 77 L5 72 L3 40Z"/></clipPath></defs>
  <path d="M6 8 L40 4 L74 9 L77 42 L72 74 L38 77 L5 72 L3 40Z" fill="#cfc7e0"/>
  <g clip-path="url(#p)" stroke="#1a1522" stroke-width="7">
    <path d="M-10 20 L60 -10"/><path d="M-10 46 L90 -14"/><path d="M-10 72 L90 12"/><path d="M-10 98 L90 38"/><path d="M10 100 L90 64"/>
  </g>
  <path d="M10 13 L40 9 L69 14 L72 42 L67 69 L38 72 L10 67 L8 40Z" fill="none" stroke="#1a1522" stroke-width="2.2" stroke-dasharray="5 4"/>
  <circle cx="40" cy="40" r="15" fill="#cfc7e0"/>
  <path d="${spiralD(40, 40, 1.5, 12, 1.8)}" fill="none" stroke="#1a1522" stroke-width="3" stroke-linecap="round"/>
</svg>`,
  { size: 192 },
);

const PENDANT = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#efe6c8" stroke="#6a4a8a" stroke-width="4"/>
  <path d="${spiralD(50, 50, 3, 33, 2.4)}" fill="none" stroke="#3a2450" stroke-width="6" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);

const WISP_A = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg"><path d="M6 64 Q8 30 25 2 Q17 34 26 64Z" fill="#ffffff"/></svg>`,
  { size: 96 },
);
const WISP_B = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg"><path d="M7 64 Q4 36 10 18 Q14 8 8 2 Q24 14 22 38 Q22 52 26 64Z" fill="#ffffff"/></svg>`,
  { size: 96 },
);

// ---------------------------------------------------------------------------------------------------------------
// Helpers
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const keys = (k: number[]) => (t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (k.length - 1);
  const i = Math.min(Math.floor(x), k.length - 2);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return k[i] + (k[i + 1] - k[i]) * u;
};

const EAR: ([number, number] | [number, number, "sharp"])[] = [
  [-0.036, 0],
  [0.038, 0],
  [0.03, 0.032],
  [0.021, 0.048, "sharp"],
  [0.031, 0.06, "sharp"],
  [0.002, 0.13, "sharp"],
  [-0.016, 0.082],
  [-0.034, 0.034],
];
const EAR_IN: [number, number][] = [
  [-0.022, 0.006],
  [0.024, 0.006],
  [0.017, 0.04],
  [0.002, 0.098],
  [-0.012, 0.06],
];

export default function build() {
  const b = createBuilder({ name: "burton_cat" });

  // ------------------------------------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.372, -0.2], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.372, -0.2],
      [0, 0.392, -0.07],
      [0, 0.4, 0.07],
      [0, 0.41, 0.2],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const chest = spine.tip!;

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.41, 0.2],
      [0, 0.5, 0.255],
      [0, 0.6, 0.3],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.6, 0.3], dir: [0, -0.08, 1], role: "head" });
  const HP = head.at.clone();
  const H = (x: number, y: number, z: number): number[] => [HP.x + x, HP.y + y, HP.z + z];
  const jaw = b.joint("jaw", { parent: head, at: H(0, -0.04, 0.06), aim: H(0, -0.05, 0.13), role: "jaw" });

  // ------------------------------------------------------------------------------------------------ torso
  const rxF = keys([0.056, 0.05, 0.042, 0.046, 0.052, 0.05]);
  const ryF = keys([0.068, 0.06, 0.05, 0.062, 0.07, 0.062]);
  const torso = b.sweep(spine, (t): [number, number] => [rxF(t), ryF(t)], { color: COAT });
  const neckTube = b.sweep(neck, keys([0.05, 0.04, 0.036]), { color: COAT, sides: 8 });

  // vertebrae ridge
  b.along(torso, 10, (at) => b.stick(new THREE.ConeGeometry(0.011, 0.028, 5), RIDGE, at, { embed: 0.4 }));

  // ribs
  for (let i = 0; i < 6; i++) {
    const t = 0.5 + i * 0.085;
    for (const s of [1, -1]) {
      const pts = [];
      for (let a = 28; a <= 152; a += 31) pts.push(torso.at(t, s * a, 0.004));
      b.sweep(catmull(pts), 0.0042, { color: RIB, sides: 5 });
    }
  }

  // hip bones and shoulder blades
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.019, 7, 5), COAT, { bone: hips, at: [s * 0.054, 0.398, -0.2] });
    b.spike([s * 0.032, 0.452, 0.115], [s * 0.4, 1, -0.55], 0.04, 0.014, { bone: spine.joints[2], color: RIDGE });
  }

  // flank decals
  const tSkin = b.surface(torso);
  const scarHit = tSkin.around(V(0, 0.385, -0.1)).at(90, 22)!;
  b.decal(torso, SCAR, { at: scarHit, dir: [1, 0, 0], size: [0.11, 0.055] });
  const patchHit = tSkin.around(V(0, 0.385, -0.08)).at(-90, 22)!;
  b.decal(torso, PATCH, { at: patchHit, dir: [-1, 0, 0], size: [0.07, 0.07], roll: 8 });

  // wisps over the torso
  b.cards(
    tSkin.scatter(70, { rng: rng(5), minDist: 0.03, filter: (h) => h.n.y > -0.2 }),
    [WISP_A, WISP_B],
    { size: [0.025, 0.07], lean: 70, bend: 30, vary: 0.35, rng: rng(6), color: WISPC },
  );

  // ------------------------------------------------------------------------------------------------ tail
  const C = V(0, 0.62, -0.5);
  const R0 = 0.115;
  const R1 = 0.032;
  const TURNS = 1.8;
  const tailPts: number[][] = [
    [0, 0.385, -0.22],
    [0, 0.395, -0.31],
    [0, 0.43, -0.4],
    [0, 0.49, -0.46],
  ];
  const total = TURNS * 360;
  for (let ang = 0; ang <= total + 0.1; ang += 30) {
    const r = R0 * Math.pow(R1 / R0, ang / total);
    const rad = (ang * Math.PI) / 180;
    tailPts.push([0.012 * (ang / 360), C.y - r * Math.cos(rad), C.z - r * Math.sin(rad)]);
  }
  const tail = b.chain("tail", catmull(tailPts), { parent: hips, count: 12, role: "tail" });
  const tailTube = b.sweep(tail, keys([0.032, 0.025, 0.02, 0.017, 0.014, 0.011]), { color: TAILP, sides: 8 });
  b.cards(
    b.surface(tailTube).scatter(60, { rng: rng(11), minDist: 0.028 }),
    [WISP_A, WISP_B],
    { size: [0.022, 0.05], lean: 60, bend: 25, vary: 0.3, rng: rng(12), color: WISPC },
  );

  // ------------------------------------------------------------------------------------------------ legs
  const addPaw = (chain: ReturnType<typeof b.chain>, px: number, pz: number) => {
    const bone = chain.tip!;
    b.part(new THREE.SphereGeometry(1, 8, 6), BLACK, { bone, at: [px, 0.02, pz + 0.03], scale: [0.02, 0.02, 0.036] });
    for (const dx of [-1, 0, 1]) {
      const a = V(px + dx * 0.009, 0.0095, pz + 0.05);
      const e = V(px + dx * 0.0135, 0.0085, pz + 0.088);
      b.capsule(a, e, 0.0075, { bone, color: BLACK });
      b.spike(e, [dx * 0.15, -0.1, 1], 0.017, 0.0045, { bone, color: CLAW });
    }
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // front leg
    const fp = limb(
      [s * 0.046, 0.375, 0.185],
      [s * 0.062, 0.028, 0.225],
      [0.15, 0.15, 0.1],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const front = b.chain(`legF${S}`, fp, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `paw${S}`],
      role: "leg",
    });
    b.sweep(front, keys([0.03, 0.022, 0.016, 0.015, 0.016]), { color: LEG, sides: 6 });
    b.part(new THREE.SphereGeometry(0.021, 7, 5), COAT, { bone: front.joints[1], at: fp[1] });
    b.part(new THREE.SphereGeometry(0.016, 7, 5), COAT, { bone: front.joints[2], at: fp[2] });
    addPaw(front, s * 0.062, 0.225);

    // hind leg
    const hp = limb(
      [s * 0.05, 0.365, -0.2],
      [s * 0.062, 0.028, -0.255],
      [0.17, 0.17, 0.13],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hind = b.chain(`legH${S}`, hp, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`],
      role: "leg",
    });
    b.sweep(hind, keys([0.042, 0.027, 0.016, 0.014, 0.015]), { color: LEG, sides: 6 });
    b.part(new THREE.SphereGeometry(0.022, 7, 5), COAT, { bone: hind.joints[1], at: hp[1] });
    b.part(new THREE.SphereGeometry(0.016, 7, 5), COAT, { bone: hind.joints[2], at: hp[2] });
    addPaw(hind, s * 0.062, -0.255);
  }

  // ------------------------------------------------------------------------------------------------ head
  const skullC = V(...(H(0, 0.03, 0.05) as [number, number, number]));
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), COAT, {
    bone: head,
    at: H(0, 0.03, 0.05),
    scale: [0.092, 0.072, 0.082],
  });
  const muzzle = b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
    bone: head,
    at: H(0, -0.018, 0.105),
    scale: [0.034, 0.027, 0.04],
  });
  b.frustumBox(H(0, -0.045, 0.065), H(0, -0.052, 0.13), [0.045, 0.016], [0.022, 0.012], { bone: jaw, color: BLACK });

  b.extrude(
    [
      [-0.014, 0.008],
      [0.014, 0.008],
      [0, -0.009],
    ],
    { at: H(0, -0.006, 0.142), x: [1, 0, 0], thickness: 0.008, smoothing: 1, color: NOSE, bone: head },
  );
  for (const s of [1, -1])
    b.spike(H(s * 0.018, -0.04, 0.12), [0, -1, 0.1], 0.013, 0.0035, { bone: head, color: FANG });

  const mouthHit = b.surface(muzzle).around(muzzle.at).at(0, -22)!;
  b.decal(muzzle, MOUTH, { at: mouthHit, dir: [0, 0, 1], size: [0.05, 0.03] });

  // eyes
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(skullC).at(s * 33, 4)!;
    const eye = b.decal(skull, EYE, {
      at: hit,
      dir: [s * 0.22, 0, 1],
      size: [0.066, 0.07],
      mirror: s > 0,
    });
    glow(eye, 0.75);
  }

  // ears
  for (const s of [1, -1]) {
    const y = V(0.3 * s, 1, -0.18).normalize();
    const x = V(s, -0.3, 0);
    x.addScaledVector(y, -x.dot(y)).normalize();
    const n = x.clone().cross(y);
    if (n.z < 0) n.negate();
    const base = V(...(H(s * 0.048, 0.062, 0.03) as [number, number, number]));
    b.extrude(EAR, { at: base, x, y, thickness: 0.011, color: COAT, bone: head });
    b.extrude(EAR_IN, {
      at: base.clone().addScaledVector(n, 0.0035),
      x,
      y,
      thickness: 0.008,
      color: EARIN,
      bone: head,
    });
  }

  // cheek tufts, crown tufts
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++)
      b.spike(H(s * 0.074, -0.02 + k * 0.016, 0.07 - k * 0.012), [s, -0.2 + k * 0.15, -0.7], 0.055 + 0.01 * k, 0.014, {
        bone: head,
        color: BLACK,
      });
  }
  [
    [0, 0.097, 0.03, 0],
    [0.022, 0.093, 0.05, 0.6],
    [-0.022, 0.093, 0.05, -0.6],
  ].forEach(([x, y, z, lean]) =>
    b.spike(H(x, y, z), [lean * 0.5, 1, -0.35], 0.06, 0.013, { bone: head, color: BLACK }),
  );

  // whiskers
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const p0 = V(...(H(s * 0.028, -0.014 + k * 0.007, 0.12) as [number, number, number]));
      const add = (x: number, y: number, z: number) => p0.clone().add(V(s * x, y, z));
      b.sweep(bezier(p0, add(0.07, 0.015, 0.03 - k * 0.01), add(0.14, 0.0, 0.035), add(0.2, -0.06 - k * 0.015, 0.02 + k * 0.02)), [0.0022, 0.0006], {
        bone: head,
        color: WHISK,
        sides: 4,
      });
    }
  }

  // ------------------------------------------------------------------------------------------------ neck dressing
  b.ring(neck.at(0.2), { count: 10, radius: 0.04, tilt: -40 }, (it) =>
    b.spike(it, it, 0.065, 0.016, { color: BLACK }),
  );
  const nSkin = b.surface(neckTube);
  b.sweep(nSkin.loop(neck.at(0.45), { lift: 0.004 }), 0.0075, { color: COLLAR, sides: 5 });
  const pHit = nSkin.nearest(neck.at(0.45).at.clone().add(V(0, -0.06, 0.04)));
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.006, 10), BRASS, {
    at: offset(pHit, pHit.n, 0.009),
    dir: pHit.n,
    bone: neck.joints[0],
  });
  b.part(new THREE.CircleGeometry(0.021, 12), "#ffffff", {
    at: offset(pHit, pHit.n, 0.0125),
    dir: pHit.n,
    axis: "z",
    texture: PENDANT,
    bone: neck.joints[0],
  });

  return b.root;
}
