import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Boba Slime",
  description:
    "A wobbly taro-milk-tea slime shaped like a bubble-tea cup with no cup: tapioca pearls in its belly, a fat striped straw antenna through a lid-like cap, a big-eyed face with an opening mouth, and two stubby pseudopod arms.",
};

// Candy palette
const TARO = "#c9a9f5";
const TARO_LIGHT = "#e3d0fb";
const TEA = "#ffdcc0";
const TEA_DEEP = "#e9c1a0";
const PEARL = "#75476a";
const GLINT = "#fff7fb";
const LID = "#dff2ff";
const LID_RIM = "#ff9ec9";
const STRAW_A = "#ff86b8";
const STRAW_B = "#ffffff";
const HOLE = "#4a2a5c";
const MOUTH = "#3d2057";
const TONGUE = "#ff7fa9";
const PAD = "#ffb3d1";

// Drawings (flat fills only)
const EYE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 80">
    <ellipse cx="30" cy="42" rx="27" ry="37" fill="#2e1a47"/>
    <ellipse cx="30" cy="58" rx="20" ry="17" fill="#6a48c4"/>
    <circle cx="20" cy="25" r="10.5" fill="#ffffff"/>
    <circle cx="41" cy="58" r="5.5" fill="#ffffff"/>
    <circle cx="44" cy="27" r="3" fill="#ffffff"/>
  </svg>`,
  { size: 192 },
);
const BLUSH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30">
    <ellipse cx="30" cy="15" rx="28" ry="12" fill="#ff93b6"/>
    <path d="M16 8 L21 22 M29 6 L34 24 M42 8 L47 22" stroke="#ff5f90" stroke-width="3" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 192 },
);
const DRIP = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40">
    <rect x="0" y="0" width="100" height="13" fill="${TARO}"/>
    <rect x="6" y="6" width="15" height="19" rx="7.5" fill="${TARO}"/>
    <rect x="36" y="6" width="16" height="30" rx="8" fill="${TARO}"/>
    <rect x="63" y="6" width="14" height="16" rx="7" fill="${TARO}"/>
    <rect x="85" y="6" width="10" height="24" rx="5" fill="${TARO}"/>
  </svg>`,
  { size: 256 },
);
const STAR = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
    <path d="M20 0 C22 14 26 18 40 20 C26 22 22 26 20 40 C18 26 14 22 0 20 C14 18 18 14 20 0 Z" fill="#ffe680"/>
    <path d="M20 10 C21 16 24 19 30 20 C24 21 21 24 20 30 C19 24 16 21 10 20 C16 19 19 16 20 10 Z" fill="#fff9d6"/>
  </svg>`,
  { size: 128 },
);
const BUBBLE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="18" fill="#a9defa"/>
    <circle cx="20" cy="20" r="13.5" fill="#d6f1ff"/>
    <circle cx="13" cy="12.5" r="4.2" fill="#ffffff"/>
    <circle cx="24" cy="29" r="1.8" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);
const HEART = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 36">
    <path d="M20 34 C4 22 0 14 4 7 C8 1 16 2 20 9 C24 2 32 1 36 7 C40 14 36 22 20 34 Z" fill="#ff7fb0"/>
    <circle cx="11" cy="11" r="3.4" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);
const SHINE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
    <path d="M6 30 C8 16 16 8 30 6" stroke="#ffffff" stroke-width="6" stroke-linecap="round" fill="none"/>
    <circle cx="44" cy="8" r="3.5" fill="#ffffff"/>
  </svg>`,
  { size: 192 },
);
const SPECK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 66">
    <circle cx="14" cy="14" r="5" fill="#b388ec"/>
    <circle cx="44" cy="8" r="3.4" fill="#eadcfd"/>
    <circle cx="76" cy="18" r="5.5" fill="#b388ec"/>
    <circle cx="28" cy="38" r="3.6" fill="#eadcfd"/>
    <circle cx="58" cy="44" r="5" fill="#b388ec"/>
    <circle cx="88" cy="50" r="3.4" fill="#eadcfd"/>
    <circle cx="10" cy="58" r="4" fill="#b388ec"/>
  </svg>`,
  { size: 192 },
);
const BADGE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="19" fill="#ffe680"/>
    <path d="M20 6 L24 15.5 L34 16 L26.5 22.5 L29 32.5 L20 27 L11 32.5 L13.5 22.5 L6 16 L16 15.5 Z" fill="#ff86b8"/>
    <circle cx="20" cy="20" r="3.2" fill="#fff4f8"/>
  </svg>`,
  { size: 128 },
);

// Shape numbers
const BASE_Y = 0.02;
const BODY_Y0 = 0.03;
const BODY_Y1 = 0.3;
const LID_Y = 0.285;
const TEA_TOP = 0.125;
const PROFILE: Array<[number, number]> = [
  [0.03, 0.15],
  [0.07, 0.158],
  [0.14, 0.163],
  [0.21, 0.158],
  [0.25, 0.14],
  [0.28, 0.115],
  [0.3, 0.09],
];
function bodyRadius(t: number) {
  const y = BODY_Y0 + t * (BODY_Y1 - BODY_Y0);
  for (let i = 1; i < PROFILE.length; i++) {
    if (y <= PROFILE[i][0]) {
      const [y0, r0] = PROFILE[i - 1];
      const [y1, r1] = PROFILE[i];
      return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
    }
  }
  return PROFILE[PROFILE.length - 1][1];
}

export default function build() {
  const b = createBuilder({ name: "bobaSlime" });
  const rand = rng(11);

  // Skeleton
  const base = b.joint("base", { at: [0, BASE_Y, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, BODY_Y0, 0],
      [0, 0.11, 0],
      [0, 0.19, 0],
      [0, 0.26, 0],
    ]),
    { parent: base, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const [spine1, spine2, spine3] = spine.joints;
  const head = b.joint("head", { parent: spine3, at: [0, 0.26, 0], dir: [0, 1, 0], role: "head" });

  // Puddle the slime sits in: a chunky faceted hemisphere plus blobs round its edge
  b.part(new THREE.SphereGeometry(1, 9, 3, 0, Math.PI * 2, 0, Math.PI / 2), TEA_DEEP, {
    bone: base,
    at: [0, 0, 0],
    scale: [0.22, 0.04, 0.22],
    flat: true,
    name: "puddle",
  });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const d = 0.22 + rand() * 0.035;
    const s = 0.035 + rand() * 0.02;
    b.part(new THREE.SphereGeometry(1, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2), TEA_DEEP, {
      bone: base,
      at: [Math.sin(a) * d, 0, Math.cos(a) * d],
      scale: [s, 0.02 + rand() * 0.01, s * 0.9],
      flat: true,
      name: "puddleBlob",
    });
  }

  // Body: a faceted tapering dome, milk tea below and taro above
  const body = b.sweep(
    polyline([
      [0, BODY_Y0, 0],
      [0, BODY_Y1, 0],
    ]),
    bodyRadius,
    {
      bone: [spine, head],
      bands: [
        [(TEA_TOP - BODY_Y0) / (BODY_Y1 - BODY_Y0), TEA],
        [1, TARO],
      ],
      sides: 10,
      smooth: false,
      caps: "flat",
      name: "body",
    },
  );
  const skin = b.surface(body);
  const at = (y: number, azimuth: number, elevation = 0) => skin.around([0, y, 0]).at(azimuth, elevation);

  // Milk-tea drips over the taro line
  for (let i = 0; i < 6; i++) {
    const az = i * 60 + 10;
    const hit = at(TEA_TOP - 0.012, az);
    if (hit) b.decal(skin, DRIP, { at: hit, size: [0.19, 0.076], segments: [8, 4] });
  }

  // Taro speckles over the back and sides, and a star badge on the back
  for (const az of [95, 140, 185, 230, 275]) {
    const hit = at(0.19, az);
    if (hit) b.decal(skin, SPECK, { at: hit, size: [0.15, 0.1], segments: [6, 4] });
    const low = at(0.145, az + 22);
    if (low) b.decal(skin, SPECK, { at: low, size: [0.15, 0.1], segments: [6, 4], mirror: true, lift: 0.0025 });
  }
  const badgeHit = at(0.17, 180);
  if (badgeHit) b.decal(skin, BADGE, { at: badgeHit, size: [0.07, 0.07] });

  // Tapioca pearls showing through the belly: two rows, staggered, plus a few stragglers
  const rows: Array<[number, number, number]> = [
    [0.04, 14, 0],
    [0.073, 13, 0.5],
  ];
  const addPearl = (y: number, az: number, r: number) => {
    const hit = at(y, az);
    if (!hit) return;
    const pearl = b.stick(new THREE.SphereGeometry(r, 7, 5), PEARL, hit, { embed: 0.6, flat: true, name: "pearl" });
    const dirH = hit.n.clone().add(new THREE.Vector3(0, 0.6, 0)).normalize();
    b.part(new THREE.SphereGeometry(r * 0.27, 4, 3), GLINT, {
      at: pearl.at.clone().addScaledVector(dirH, r * 0.92),
      bone: pearl.bone ?? spine1,
      flat: true,
      name: "pearlGlint",
    });
  };
  for (const [y, count, phase] of rows)
    for (let i = 0; i < count; i++) addPearl(y, ((i + phase) / count) * 360, 0.024 + rand() * 0.007);
  for (const [y, az] of [
    [0.105, 40],
    [0.108, -55],
    [0.1, 150],
    [0.106, -140],
    [0.11, 100],
    [0.104, -100],
  ] as const)
    addPearl(y, az, 0.02 + rand() * 0.005);

  // Face
  for (const s of [1, -1]) {
    const eyeHit = at(0.2, s * 25);
    if (eyeHit) b.decal(skin, EYE, { at: eyeHit, size: [0.064, 0.085] });
    const blushHit = at(0.17, s * 55);
    if (blushHit) b.decal(skin, BLUSH, { at: blushHit, size: [0.05, 0.025] });
  }

  // Mouth: a fixed dark upper jaw and a pink lower-jaw tongue hinged on its top edge
  const mouthHit = at(0.155, 0);
  if (!mouthHit) throw new Error("no mouth hit");
  const zs = mouthHit.at.z;
  const mouthY = 0.155;
  b.extrude(
    [
      [-0.028, 0.012],
      [0.028, 0.012],
      [0.025, -0.008],
      [0.013, -0.026],
      [0, -0.03],
      [-0.013, -0.026],
      [-0.025, -0.008],
    ],
    {
      at: [0, mouthY, zs - 0.004],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.02,
      smoothing: 1,
      color: MOUTH,
      bone: spine2,
      name: "upperJaw",
    },
  );
  const jaw = b.joint("jaw", {
    parent: spine2,
    at: [0, mouthY - 0.004, zs],
    dir: [0, -1, 0.05],
    role: "jaw",
  });
  b.extrude(
    [
      [-0.02, 0],
      [0.02, 0],
      [0.017, -0.012],
      [0.008, -0.021],
      [-0.008, -0.021],
      [-0.017, -0.012],
    ],
    {
      at: jaw.at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      smoothing: 1,
      color: TONGUE,
      bone: jaw,
      name: "lowerJaw",
    },
  );
  b.pose(jaw, { axis: [1, 0, 0], deg: -16 });

  // Arms: stubby pseudopods held out, a lighter blob for each hand
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const root = at(0.15, s * 90);
    if (!root) continue;
    const arm = b.sprout(
      `arm${side}`,
      root,
      catmull([root, [s * 0.2, 0.165, 0.03], [s * 0.255, 0.19, 0.05]]),
      [0.044, 0.032],
      {
        names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
        role: "arm",
        color: TARO,
        sides: 6,
        smooth: false,
        caps: "flat",
      },
    );
    const hand = arm.chain?.tip ?? arm.chain?.joints[arm.chain.joints.length - 1];
    if (!hand) throw new Error("arm has no hand joint");
    b.part(new THREE.SphereGeometry(0.047, 7, 5), TARO_LIGHT, {
      bone: hand,
      at: hand.local([0, 0.03, 0]),
      scale: [1, 0.9, 0.95],
      flat: true,
      name: `mitt${side}`,
    });
    for (const k of [-1, 0, 1])
      b.part(new THREE.SphereGeometry(0.017, 5, 3), TARO_LIGHT, {
        bone: hand,
        at: hand.local([k * 0.03, 0.078 - Math.abs(k) * 0.012, 0.0]),
        flat: true,
        name: `nub${side}`,
      });
    b.part(new THREE.SphereGeometry(0.016, 5, 3), PAD, {
      bone: hand,
      at: [hand.at.x, hand.at.y + 0.004, hand.at.z + 0.05],
      scale: [1.2, 0.7, 0.5],
      flat: true,
      name: `pad${side}`,
    });
  }

  // Lid-like cap: faceted dome, pale plastic with a pink rim and a heart sticker
  const lidTop = LID_Y + 0.065;
  const lid = b.part(new THREE.SphereGeometry(1, 10, 3, 0, Math.PI * 2, 0, Math.PI / 2), LID, {
    bone: head,
    at: [0, LID_Y, 0],
    scale: [0.172, 0.065, 0.172],
    flat: true,
    name: "lid",
  });
  b.part(new THREE.CircleGeometry(0.172, 10), LID, { bone: head, at: [0, LID_Y, 0], dir: [0, -1, 0], axis: "z", name: "lidUnder" });
  b.part(new THREE.CylinderGeometry(0.186, 0.184, 0.024, 10), LID_RIM, {
    bone: head,
    at: [0, LID_Y + 0.002, 0],
    flat: true,
    name: "lidRim",
  });
  b.part(new THREE.CylinderGeometry(0.032, 0.042, 0.018, 8), LID_RIM, {
    bone: head,
    at: [0, lidTop - 0.004, 0],
    flat: true,
    name: "strawCollar",
  });
  const lidSkin = b.surface(lid);
  const heartHit = lidSkin.around([0, LID_Y + 0.02, 0]).at(0, 14);
  if (heartHit) b.decal(lidSkin, HEART, { at: heartHit, size: [0.06, 0.054], bone: head });
  const shineHit = lidSkin.around([0, LID_Y + 0.02, 0]).at(-42, 24);
  if (shineHit) b.decal(lidSkin, SHINE, { at: shineHit, size: [0.07, 0.047], bone: head });

  // Straw antenna: fat, striped, bent at the top, with a dark opening
  const strawPath = catmull([
    [0, 0.26, 0],
    [0, 0.345, 0],
    [0.004, 0.39, 0.012],
    [0.05, 0.43, 0.03],
  ]);
  const straw = b.chain("straw", strawPath, {
    parent: head,
    names: ["straw1", "straw2", "straw3", "strawTip"],
    role: "tentacle",
  });
  const stripes: Array<[number, string]> = [];
  const n = 11;
  for (let i = 0; i < n; i++) stripes.push([(i + 1) / n, i % 2 ? STRAW_B : STRAW_A]);
  b.sweep(straw, 0.025, { bands: stripes, sides: 6, smooth: false, caps: "flat", name: "straw" });
  const tip = strawPath.at(1);
  b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.006, 6), HOLE, {
    bone: straw.tip ?? straw.joints[straw.joints.length - 1],
    at: [tip.x, tip.y, tip.z],
    dir: [strawPath.tangentAt(1).x, strawPath.tangentAt(1).y, strawPath.tangentAt(1).z],
    flat: true,
    name: "strawHole",
  });

  // Sprites: sparkles and bubbles drifting around
  const sparkles: Array<[number, number, number, number]> = [
    [0.25, 0.33, 0.04, 0.06],
    [-0.23, 0.36, 0.0, 0.05],
    [0.27, 0.39, 0.03, 0.04],
    [-0.28, 0.37, 0.05, 0.035],
    [0.3, 0.12, 0.12, 0.035],
  ];
  for (const [x, y, z, size] of sparkles)
    b.cards([frame([x, y - size / 2, z], [0, 1, 0], [0, 0, 1])], STAR, {
      size,
      flow: [0, 0, 1],
      cross: true,
      bone: head,
    });
  const bubbles: Array<[number, number, number, number]> = [
    [-0.3, 0.2, 0.08, 0.045],
    [0.31, 0.27, -0.02, 0.035],
    [-0.25, 0.3, 0.08, 0.03],
  ];
  for (const [x, y, z, size] of bubbles)
    b.cards([frame([x, y - size / 2, z], [0, 1, 0], [0, 0, 1])], BUBBLE, {
      size,
      flow: [0, 0, 1],
      cross: true,
      bone: head,
    });

  return b.root;
}
