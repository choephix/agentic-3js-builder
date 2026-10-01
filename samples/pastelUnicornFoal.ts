// Pastel Unicorn Foal: a wobbly-legged baby unicorn, cute flat low-poly. Faceted parts, flat colours, SVG faces,
// cutie marks and fluff cards. Skeleton first: hips, spine, neck, head, jaw, tail and four legs.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { bezier, catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Pastel Unicorn Foal",
  description:
    "A wobbly-legged baby unicorn, about 0.8 m at the head: oversized head with starry anime eyes, a twisted gold horn, a rainbow mane and tail of chunky locks, a separate jaw, star cutie marks and four long legs on tiny hooves.",
};

const BODY = "#fff1f8";
const BELLY = "#f3dcf6";
const MUZZLE = "#ffe2ee";
const SOCK = "#e3c9f8";
const HOOF = "#f7a9cf";
const HORN_A = "#ffd96e";
const HORN_B = "#ffefb3";
const EAR_IN = "#ffb4d2";
const INK = "#3a2266";
const RAINBOW = ["#ff7fae", "#ffa66b", "#ffd96b", "#8fe3a2", "#7cc8ff", "#b38cff"];

const f = (n: number) => n.toFixed(2);

/** Polygon points of a star, for SVG. */
function starPoints(cx: number, cy: number, outer: number, inner: number, points: number, rot = -90) {
  const out: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = ((rot + (i * 180) / points) * Math.PI) / 180;
    const r = i % 2 === 0 ? outer : inner;
    out.push(`${f(cx + Math.cos(a) * r)},${f(cy + Math.sin(a) * r)}`);
  }
  return out.join(" ");
}

// Big starry eye, drawn as the creature's right eye seen from the front (lashes at the outer corner, on the left).
const EYE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">
    <ellipse cx="50" cy="62" rx="46" ry="56" fill="${INK}"/>
    <ellipse cx="50" cy="64" rx="39" ry="49" fill="#8355e6"/>
    <ellipse cx="50" cy="88" rx="31" ry="19" fill="#c4a0ff"/>
    <ellipse cx="50" cy="60" rx="17" ry="25" fill="#2a1452"/>
    <polygon points="${starPoints(50, 92, 11, 4.5, 5)}" fill="#ffe680"/>
    <circle cx="32" cy="36" r="12" fill="#ffffff"/>
    <circle cx="68" cy="76" r="6" fill="#ffffff"/>
    <polygon points="${starPoints(68, 40, 9, 2.6, 4)}" fill="#ffffff"/>
    <path d="M8 40 Q50 -8 92 40" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
    <path d="M10 44 L-2 34 M8 58 L-4 54" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
  </svg>`,
  { size: 384 },
);

const BLUSH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 50">
    <ellipse cx="40" cy="25" rx="36" ry="21" fill="#ff8fb8"/>
    <path d="M22 16 L16 34 M40 12 L34 38 M58 16 L52 34" fill="none" stroke="#ff6f9f" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const NOSE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 60">
    <ellipse cx="24" cy="18" rx="7" ry="9" fill="${INK}"/>
    <ellipse cx="56" cy="18" rx="7" ry="9" fill="${INK}"/>
    <path d="M14 40 Q27 56 40 44 Q53 56 66 40" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  { size: 256 },
);

// Cutie mark: a big candy star with two small friends.
const CUTIE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <polygon points="${starPoints(46, 52, 38, 17, 5)}" fill="#ffffff" stroke="#ffffff" stroke-width="10" stroke-linejoin="round"/>
    <polygon points="${starPoints(46, 52, 38, 17, 5)}" fill="#ff6fa8" stroke="#d94a86" stroke-width="5" stroke-linejoin="round"/>
    <polygon points="${starPoints(46, 55, 16, 8, 5)}" fill="#ffe27a"/>
    <polygon points="${starPoints(84, 20, 13, 5, 4)}" fill="#7cc8ff" stroke="#4a9be0" stroke-width="3" stroke-linejoin="round"/>
    <polygon points="${starPoints(84, 82, 9, 3.6, 4)}" fill="#b38cff" stroke="#8a5fe0" stroke-width="3" stroke-linejoin="round"/>
  </svg>`,
  { size: 256 },
);

const SPARKLE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
    <polygon points="${starPoints(20, 20, 18, 5, 4, -90)}" fill="#ffffff" stroke="#ffd96b" stroke-width="3" stroke-linejoin="round"/>
  </svg>`,
  { size: 96 },
);

const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 64">
    <path d="M20 0 L33 20 L40 46 L34 64 L26 56 L20 64 L14 56 L6 64 L0 46 L7 20 Z" fill="#fff6fb"/>
    <path d="M20 16 L28 34 L30 52 L20 58 L10 52 L12 34 Z" fill="#f4d9f6"/>
  </svg>`,
  { size: 128 },
);

const HEART = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
    <path d="M20 35 L5 19 Q0 10 8 6 Q16 3 20 11 Q24 3 32 6 Q40 10 35 19 Z" fill="#ffb4d2" stroke="#ff7fae" stroke-width="3" stroke-linejoin="round"/>
  </svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "pastelUnicornFoal" });

  // --- skeleton -----------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.47, -0.05], dir: [0, 0, 1], group: "body" });
  const spineLine = catmull(
    [
      [0, 0.47, -0.05],
      [0, 0.48, 0.065],
      [0, 0.5, 0.18],
    ],
    { tension: 0.5 },
  );
  const spine = b.chain("spine", spineLine, { parent: hips, count: 2, role: "spine", group: "body" });
  const chest = spine.joints[spine.joints.length - 1];

  const neckLine = catmull([
    [0, 0.52, 0.2],
    [0, 0.58, 0.27],
    [0, 0.645, 0.345],
  ]);
  const neck = b.chain("neck", neckLine, { parent: chest, count: 2, role: "neck", group: "head" });
  const SKULL_C: [number, number, number] = [0, 0.695, 0.415];
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 0.645, 0.345],
    aim: [0, 0.66, 0.5],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.6, 0.45], aim: [0, 0.59, 0.55], role: "jaw", group: "head" });

  const tailLine = catmull([
    [0, 0.52, -0.15],
    [0, 0.5, -0.27],
    [0, 0.4, -0.38],
    [0, 0.27, -0.41],
    [0, 0.16, -0.36],
  ]);
  const tail = b.chain("tail", tailLine, { parent: hips, count: 4, role: "tail", group: "tail" });

  // --- body, neck ---------------------------------------------------------------------------------------------
  const bodyPath = catmull([
    [0, 0.47, -0.05],
    [0, 0.475, 0.065],
    [0, 0.49, 0.18],
  ]);
  const body = b.sweep(bodyPath, (t) => [0.14 + 0.012 * t, 0.15 + 0.005 * t], {
    bone: [hips, spine],
    color: BODY,
    sectors: [[125, 235, BELLY]],
    sides: 8,
    smooth: false,
  });
  const neckTube = b.sweep(neck, [0.095, 0.075], { color: BODY, sides: 7, smooth: false, caps: "round" });

  // --- head ---------------------------------------------------------------------------------------------------
  const skull = b.part(new THREE.SphereGeometry(1, 10, 7), BODY, {
    bone: head,
    at: SKULL_C,
    scale: [0.178, 0.152, 0.165],
    flat: true,
    name: "skull",
  });
  const muzzle = b.part(new THREE.SphereGeometry(1, 8, 6), MUZZLE, {
    bone: head,
    at: [0, 0.625, 0.55],
    scale: [0.092, 0.067, 0.085],
    flat: true,
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(1, 8, 5), MUZZLE, {
    bone: jaw,
    at: [0, 0.572, 0.52],
    scale: [0.068, 0.032, 0.072],
    flat: true,
    name: "lowerJaw",
  });
  // nostrils and a little smile
  b.decal(muzzle, NOSE, { at: [0, 0.625, 0.64], dir: [0, 0, -1], size: [0.095, 0.07], segments: 8, lift: 0.002 });

  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = skin.around(SKULL_C).at(s * 42, -2);
    if (eyeHit) b.decal(skull, EYE, { at: eyeHit, size: [0.108, 0.13], mirror: s > 0, segments: 10 });
    const cheekHit = skin.around(SKULL_C).at(s * 58, -20);
    if (cheekHit) b.decal(skull, BLUSH, { at: cheekHit, size: [0.055, 0.035], segments: 6, lift: 0.002 });
  }

  // ears: a cream leaf with a pink inside
  const earOutline: [number, number][] = [
    [-0.045, 0],
    [-0.05, 0.07],
    [0, 0.16],
    [0.05, 0.07],
    [0.045, 0],
  ];
  for (const s of [1, -1]) {
    const x: [number, number, number] = [s, 0, 0];
    const y: [number, number, number] = [s * 0.7, 1, -0.25];
    const at = [s * 0.11, 0.785, 0.37] as [number, number, number];
    b.extrude(earOutline, { at, x, y, thickness: 0.026, bevel: 0.006, smoothing: 1, color: BODY, bone: head, name: "ear" });
    b.extrude(
      earOutline.map(([u, v]) => [u * 0.62, v * 0.68 + 0.01] as [number, number]),
      { at: [at[0], at[1], at[2] + 0.007], x, y, thickness: 0.026, bevel: 0.004, smoothing: 1, color: EAR_IN, bone: head, name: "earInner" },
    );
  }

  // horn: a gold swirl, a twisted faceted cone
  const hornHit = skin.around(SKULL_C).at(0, 60);
  if (!hornHit) throw new Error("no horn seat");
  const hornBase = hornHit.at.clone().add(new THREE.Vector3(0, -0.02, -0.02));
  const hornTip = hornHit.at.clone().add(new THREE.Vector3(0, 0.15, 0.085));
  const hornPath = bezier(hornBase, hornBase.clone().lerp(hornTip, 0.5).add(new THREE.Vector3(0, 0.01, -0.005)), hornTip);
  b.sweep(hornPath, [0.042, 0.0], {
    bone: head,
    twist: 400,
    section: { ngon: 4 },
    caps: "point",
    bands: [
      [0.34, HORN_A],
      [0.52, HORN_B],
      [0.72, HORN_A],
      [1, HORN_B],
    ],
    name: "horn",
  });
  b.sweep(catmull([hornBase.clone().add(new THREE.Vector3(0, 0.0, 0)), hornBase.clone().add(new THREE.Vector3(0, 0.008, 0.004))]), 0.05, {
    bone: head,
    color: "#ff9cc5",
    sides: 6,
    smooth: false,
    caps: "round",
    name: "hornCollar",
  });

  // --- rainbow mane -------------------------------------------------------------------------------------------
  const tipFrames: { at: THREE.Vector3; dir: THREE.Vector3; bone: typeof head }[] = [];
  const lock = (p0: THREE.Vector3, off: [number, number, number][], radius: number, ci: number, bone: typeof head) => {
    const pts = off.map(([x, y, z]) => new THREE.Vector3(p0.x + x, p0.y + y, p0.z + z));
    const path = pts.length === 3 ? bezier(pts[0], pts[1], pts[2]) : bezier(pts[0], pts[1], pts[2], pts[3]);
    b.sweep(path, [radius, radius * 0.35], {
      bone,
      sides: 5,
      smooth: false,
      caps: "round",
      bands: [
        [0.68, RAINBOW[ci % 6]],
        [1, RAINBOW[(ci + 1) % 6]],
      ],
      name: "mane",
    });
    const end = pts[pts.length - 1];
    tipFrames.push({ at: end, dir: end.clone().sub(pts[pts.length - 2]).normalize(), bone });
  };
  // locks down the neck, tumbling off the left side
  const manePoints = [0.92, 0.75, 0.58, 0.42, 0.26, 0.1];
  manePoints.forEach((t, i) => {
    const top = neckTube.at(t, 0).at;
    const joint = t > 0.5 ? neck.joints[1] : neck.joints[0];
    const sway = i % 2 === 0 ? 0 : 0.012;
    lock(top, [[0, 0, 0], [0.045 + sway, 0.055, -0.03], [0.1 + sway, 0.03, -0.065], [0.125 + sway, -0.07, -0.085]], 0.042, i, joint);
  });
  // a crest behind the horn, between the ears
  lock(new THREE.Vector3(0, 0.805, 0.335), [[0, 0, 0], [0.01, 0.06, -0.03], [0.07, 0.065, -0.07], [0.1, 0.0, -0.095]], 0.04, 0, head);
  // forelock curling either side of the horn
  for (const s of [1, -1]) {
    const seat = skin.around(SKULL_C).at(s * 28, 58);
    if (!seat) continue;
    lock(seat.at, [[0, -0.01, 0], [s * 0.035, 0.03, 0.04], [s * 0.075, 0.025, 0.065], [s * 0.095, -0.03, 0.05]], 0.03, s > 0 ? 2 : 4, head);
  }

  // --- tail: a fan of chunky rainbow locks riding the tail chain ---------------------------------------------
  b.sweep(tail, [0.03, 0.022], { color: BODY, sides: 6, smooth: false });
  const lockCount = 7;
  for (let k = 0; k < lockCount; k++) {
    const phi = (k / lockCount) * Math.PI * 2 + 0.4;
    const spread = 0.05 + (k % 3) * 0.018;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      const c = tail.at(t);
      const r = spread * Math.sin(t * Math.PI * 0.55) + 0.012;
      pts.push(
        c.at
          .clone()
          .addScaledVector(c.binormal, Math.cos(phi) * r)
          .addScaledVector(c.normal, Math.sin(phi) * r),
      );
    }
    // the locks run past the chain's end so the tail ends in a fluffy tassel
    const lastDir = pts[6].clone().sub(pts[5]).normalize();
    pts.push(pts[6].clone().addScaledVector(lastDir, 0.06).add(new THREE.Vector3(0, -0.03, 0)));
    const ci = k % 6;
    b.sweep(catmull(pts), [0.036, 0.04, 0.03, 0.012], {
      bone: tail,
      sides: 5,
      smooth: false,
      caps: "round",
      bands: [
        [0.66, RAINBOW[ci]],
        [1, RAINBOW[(ci + 1) % 6]],
      ],
      name: "tailLock",
    });
  }

  // --- legs ---------------------------------------------------------------------------------------------------
  const hooves: { joint: (typeof head) | null; at: THREE.Vector3 }[] = [];
  const legRadius = [0.046, 0.036, 0.03, 0.028, 0.027];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front legs: knees point forward a touch, like a nervous foal
    const fPts = limb(
      [s * 0.085, 0.4, 0.165],
      [s * 0.115, 0.05, 0.2],
      [0.16, 0.15, 0.07],
      [
        [0, 0, 1],
        [0, 0, 1],
      ],
    );
    const front = b.chain(`legF${side}`, fPts, {
      parent: chest,
      names: [`shoulderF${side}`, `kneeF${side}`, `fetlockF${side}`, `hoofF${side}`],
      role: "leg",
      group: "legs",
    });
    b.sweep(front, legRadius, {
      sides: 6,
      smooth: false,
      bands: [
        [0.62, BODY],
        [1, SOCK],
      ],
    });
    hooves.push({ joint: front.tip ?? null, at: new THREE.Vector3(...[s * 0.115, 0, 0.2]) });

    // hind legs: stifle forward, hock back
    const hPts = limb(
      [s * 0.09, 0.4, -0.07],
      [s * 0.12, 0.05, -0.09],
      [0.17, 0.16, 0.07],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hind = b.chain(`legH${side}`, hPts, {
      parent: hips,
      names: [`hipH${side}`, `stifleH${side}`, `hockH${side}`, `hoofH${side}`],
      role: "leg",
      group: "legs",
    });
    b.sweep(hind, legRadius, {
      sides: 6,
      smooth: false,
      bands: [
        [0.62, BODY],
        [1, SOCK],
      ],
    });
    hooves.push({ joint: hind.tip ?? null, at: new THREE.Vector3(...[s * 0.12, 0, -0.09]) });

    // fetlock fluff
    for (const leg of [front, hind]) {
      const fet = leg.joints[2];
      const ring = b.ring(frame(fet.at, [0, 1, 0]), { count: 4, radius: 0.03 });
      b.cards(ring.items, TUFT, { size: [0.06, 0.06], lean: 110, flow: [0, -1, 0], bone: fet });
    }
  }
  for (const h of hooves) {
    if (!h.joint) continue;
    b.part(new THREE.CylinderGeometry(0.034, 0.042, 0.055, 6), HOOF, {
      bone: h.joint,
      at: [h.at.x, 0.0265, h.at.z],
      flat: true,
      name: "hoof",
    });
  }

  // --- details on the body ------------------------------------------------------------------------------------
  const bodySkin = b.surface(body);
  // cutie marks on both hips
  for (const s of [1, -1]) {
    const hit = bodySkin.around([0, 0.47, -0.05]).at(s * 90, 0);
    if (hit) b.decal(body, CUTIE, { at: hit, dir: [-s, 0, 0], size: [0.14, 0.14], segments: 10, lift: 0.002, mirror: s < 0 });
  }
  // a few sticker hearts scattered on the barrel and shoulders
  for (const [az, el, sz] of [
    [90, 36, 0.05],
    [-90, 34, 0.05],
    [80, -8, 0.04],
    [-80, -6, 0.04],
  ] as const) {
    const hit = bodySkin.around([0, 0.49, 0.1]).at(az, el);
    if (hit) b.decal(body, HEART, { at: hit, dir: [-Math.sign(az), 0, 0], size: [sz, sz], segments: 5, lift: 0.002 });
  }
  // sparkles above the mane tips, facing up so they light like the top of the mane
  for (const t of tipFrames) {
    b.cards([frame(t.at, [0, 1, 0])], SPARKLE, { size: 0.05, cross: true, flow: [0, 0, 1], bone: t.bone });
  }

  return b.root;
}
