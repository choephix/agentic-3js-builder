import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import type { Hit } from "../src/surface";
import { svg } from "../src/texture";

export const meta = {
  name: "Strawberry Bunny",
  description:
    "A 0.5 m bunny in a strawberry hooded onesie: seed-dotted red hood with a leafy calyx, long ears poking out, round face with a separate jaw, cream bib, stubby arms carrying a basket of berries, and a fluffy tail. Cute flat low-poly.",
};

// Flat candy palette.
const BERRY = "#ff5f78";
const BERRY_DEEP = "#ee4668";
const HOOD = "#ff4d6b";
const CREAM = "#fff4e4";
const FUR = "#fff8ee";
const PINK = "#ffb4c8";
const TRIM = "#ffd6dd";
const LEAF_DEEP = "#4fb96a";
const WICKER_DEEP = "#b97f44";
const TOOTH = "#ffffff";

// ---- drawings (flat fills, no gradients) ----
const EYE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 80">
    <ellipse cx="30" cy="40" rx="27" ry="37" fill="#33173d"/>
    <ellipse cx="31" cy="58" rx="18" ry="13" fill="#7b4a9a"/>
    <ellipse cx="31" cy="62" rx="10" ry="6" fill="#b47ad0"/>
    <circle cx="20" cy="22" r="11" fill="#ffffff"/>
    <circle cx="40" cy="50" r="5" fill="#ffffff"/>
    <circle cx="14" cy="42" r="2.6" fill="#ffffff"/>
  </svg>`,
  { size: 192 },
);

const BLUSH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 40">
    <ellipse cx="36" cy="20" rx="34" ry="17" fill="#ff93b3"/>
    <rect x="16" y="9" width="5" height="18" rx="2.5" fill="#ff6c95" transform="rotate(20 18 18)"/>
    <rect x="30" y="8" width="5" height="20" rx="2.5" fill="#ff6c95" transform="rotate(20 32 18)"/>
    <rect x="44" y="9" width="5" height="18" rx="2.5" fill="#ff6c95" transform="rotate(20 46 18)"/>
  </svg>`,
  { size: 192 },
);

const MUZZLE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 52">
    <circle cx="26" cy="33" r="19" fill="#ffffff"/>
    <circle cx="54" cy="33" r="19" fill="#ffffff"/>
    <path d="M32 6 L48 6 Q50 6 49 9 L43 19 Q40 22 37 19 L31 9 Q30 6 32 6Z" fill="#ff8fae"/>
    <rect x="38.6" y="19" width="2.8" height="9" rx="1.4" fill="#5a2d4f"/>
    <path d="M40 28 Q35 38 26 32 M40 28 Q45 38 54 32" stroke="#5a2d4f" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 384 },
);

const EAR_INNER = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 100">
    <path d="M20 4 C34 22 38 52 32 84 Q20 98 8 84 C2 52 6 22 20 4Z" fill="#ffb4c8"/>
    <path d="M20 26 C26 42 28 60 25 76 Q20 82 15 76 C12 60 14 42 20 26Z" fill="#ff93b3"/>
  </svg>`,
  { size: 192 },
);

const BIB = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110">
    <g fill="#fff4e4">
      <ellipse cx="50" cy="56" rx="40" ry="45"/>
      <circle cx="20" cy="30" r="9"/><circle cx="34" cy="16" r="9"/><circle cx="50" cy="11" r="9"/>
      <circle cx="66" cy="16" r="9"/><circle cx="80" cy="30" r="9"/>
      <circle cx="12" cy="56" r="9"/><circle cx="88" cy="56" r="9"/>
      <circle cx="18" cy="80" r="9"/><circle cx="82" cy="80" r="9"/>
      <circle cx="32" cy="95" r="9"/><circle cx="68" cy="95" r="9"/><circle cx="50" cy="100" r="9"/>
    </g>
    <ellipse cx="50" cy="56" rx="32" ry="37" fill="none" stroke="#ffb4c8" stroke-width="2.4" stroke-dasharray="6 5" stroke-linecap="round"/>
    <path d="M50 76 C30 62 32 42 42 40 C46 39 49 42 50 45 C51 42 54 39 58 40 C68 42 70 62 50 76Z" fill="#ff7892"/>
    <circle cx="44" cy="49" r="2.6" fill="#ffe9ef"/>
  </svg>`,
  { size: 384 },
);

const SEED = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 24">
    <path d="M8 1 C14 9 14 17 8 23 C2 17 2 9 8 1Z" fill="#ffe26b"/>
    <path d="M8 5 C11 10 11 15 8 19 C7 14 7 10 8 5Z" fill="#ffc94a"/>
  </svg>`,
  { size: 64 },
);

const LEAF_A = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 72">
    <path d="M24 70 L7 52 L10 42 L3 32 L10 24 L8 12 L24 2 L40 12 L38 24 L45 32 L38 42 L41 52Z" fill="#7bdc78"/>
    <path d="M24 66 L24 14" stroke="#4fb96a" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M24 44 L13 34 M24 44 L35 34 M24 30 L17 22 M24 30 L31 22" stroke="#4fb96a" stroke-width="2.6" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

const LEAF_B = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 72">
    <path d="M24 70 L7 52 L10 42 L3 32 L10 24 L8 12 L24 2 L40 12 L38 24 L45 32 L38 42 L41 52Z" fill="#5fc872"/>
    <path d="M24 66 L24 14" stroke="#3fa35e" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M24 44 L13 34 M24 44 L35 34 M24 30 L17 22 M24 30 L31 22" stroke="#3fa35e" stroke-width="2.6" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

const BERRY_LEAF = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path d="M24 26 L4 16 L14 24 L2 32 L16 30 L14 44 L24 34 L34 44 L32 30 L46 32 L34 24 L44 16Z" fill="#5fc872"/>
  </svg>`,
  { size: 96 },
);

const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 56">
    <path d="M24 54 L6 40 L2 22 L12 28 L10 8 L22 22 L24 2 L30 22 L40 6 L38 28 L46 22 L44 40Z" fill="#fffdf8"/>
    <path d="M24 54 L14 42 L16 30 L24 38 L32 30 L34 42Z" fill="#ffe9d6"/>
  </svg>`,
  { size: 128 },
);

const WEAVE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 40">
    <rect width="96" height="40" fill="#e8b067"/>
    <g fill="#b97f44">
      <rect x="0" y="0" width="96" height="3"/><rect x="0" y="13" width="96" height="3"/>
      <rect x="0" y="26" width="96" height="3"/><rect x="0" y="37" width="96" height="3"/>
    </g>
    <g fill="#c88f52">
      <rect x="6" y="3" width="4" height="10"/><rect x="22" y="3" width="4" height="10"/>
      <rect x="38" y="3" width="4" height="10"/><rect x="54" y="3" width="4" height="10"/>
      <rect x="70" y="3" width="4" height="10"/><rect x="86" y="3" width="4" height="10"/>
      <rect x="14" y="16" width="4" height="10"/><rect x="30" y="16" width="4" height="10"/>
      <rect x="46" y="16" width="4" height="10"/><rect x="62" y="16" width="4" height="10"/>
      <rect x="78" y="16" width="4" height="10"/><rect x="94" y="16" width="4" height="10"/>
      <rect x="6" y="29" width="4" height="8"/><rect x="22" y="29" width="4" height="8"/>
      <rect x="38" y="29" width="4" height="8"/><rect x="54" y="29" width="4" height="8"/>
      <rect x="70" y="29" width="4" height="8"/><rect x="86" y="29" width="4" height="8"/>
    </g>
  </svg>`,
  { size: 256 },
);

const SPARKLE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
    <path d="M20 1 L25 15 L39 20 L25 25 L20 39 L15 25 L1 20 L15 15Z" fill="#fff6a8"/>
  </svg>`,
  { size: 96 },
);

type V = [number, number, number];
const sph = (w: number, h: number) => new THREE.SphereGeometry(1, w, h);

export default function build() {
  const b = createBuilder({ name: "strawberryBunny" });

  // ---------------- skeleton ----------------
  const hips = b.joint("hips", { at: [0, 0.095, -0.005], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.095, -0.005],
      [0, 0.15, 0.003],
      [0, 0.212, 0.0],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.joint("neck", { parent: spine.joints[1], at: [0, 0.212, 0.0], dir: [0, 1, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.232, 0.004], dir: [0, 0.4, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.222, 0.056], dir: [0, 0.05, 1], role: "jaw", group: "head" });

  // ---------------- body: the onesie ----------------
  const body = b.sweep(
    catmull([
      [0, 0.092, -0.005],
      [0, 0.15, 0.003],
      [0, 0.218, 0.0],
    ]),
    [0.072, 0.097, 0.097, 0.078],
    { bone: [hips, spine], color: BERRY, sides: 8, smooth: false },
  );
  const bodySkin = b.surface(body);
  b.decal(body, BIB, { at: [0, 0.145, 0.1], dir: [0, 0, -1], size: [0.115, 0.127], segments: 8, lift: 0.002, bone: spine.joints[0] });

  // seeds on the onesie (not on the bib)
  b.cards(
    bodySkin.scatter(90, { rng: rng(11), minDist: 0.027, filter: (h) => !(h.n.z > 0.25) && h.at.y < 0.2 && h.at.y > 0.04 }),
    SEED,
    { size: [0.016, 0.024], lean: 88, bend: 16, flow: [0, -1, 0], mirror: true, sink: 0.05 },
  );

  // ---------------- legs ----------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      catmull([
        [s * 0.055, 0.09, -0.005],
        [s * 0.056, 0.062, 0.008],
        [s * 0.057, 0.04, 0.012],
      ]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg", contact: [s * 0.057, 0, 0.03] },
    );
    const ankle = leg.tip ?? leg.joints[leg.joints.length - 1];
    b.sweep(leg, [0.045, 0.04], { color: BERRY, sides: 6, smooth: false });
    // cuff at the ankle
    b.part(new THREE.CylinderGeometry(0.044, 0.046, 0.014, 8), CREAM, {
      bone: ankle,
      at: [s * 0.057, 0.046, 0.012],
      flat: true,
    });
    // big bunny foot with toe beans
    b.part(new THREE.CylinderGeometry(1, 1, 1, 9), FUR, {
      bone: ankle,
      at: [s * 0.057, 0.02, 0.03],
      scale: [0.05, 0.04, 0.084],
      flat: true,
    });
    for (const dx of [-1, 0, 1]) {
      b.part(sph(5, 4), PINK, {
        bone: ankle,
        at: [s * 0.057 + dx * 0.02, 0.022, 0.108 - Math.abs(dx) * 0.008],
        scale: [0.012, 0.009, 0.011],
        flat: true,
      });
    }
  }

  // ---------------- tail ----------------
  const tail = b.chain(
    "tail",
    [
      [0, 0.1, -0.078],
      [0, 0.108, -0.122],
    ],
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );
  const pom = b.part(new THREE.IcosahedronGeometry(0.052, 1), FUR, { bone: tail.joints[1], at: [0, 0.108, -0.122], flat: true });
  b.cards(
    b.surface(pom).scatter(16, { rng: rng(5), minDist: 0.034 }),
    TUFT,
    { size: [0.036, 0.042], lean: 35, flow: [0, -0.2, -1], vary: 0.2, rng: rng(6), cross: true, sink: 0.25 },
  );

  // ---------------- head ----------------
  const HOOD_C: V = [0, 0.303, -0.026];
  const HOOD_R: V = [0.12, 0.11, 0.115];
  const FACE_C: V = [0, 0.272, 0.034];
  const FACE_R: V = [0.1, 0.09, 0.095];

  const hood = b.part(sph(10, 7), HOOD, { bone: head, at: HOOD_C, scale: HOOD_R, flat: true });
  // hood drape over the nape
  b.part(sph(8, 6), HOOD, { bone: head, at: [0, 0.215, -0.062], scale: [0.092, 0.07, 0.07], flat: true });
  const face = b.part(sph(10, 8), FUR, { bone: head, at: FACE_C, scale: FACE_R, flat: true });
  const faceSkin = b.surface(face);
  const hoodSkin = b.surface(hood);

  // fluffy trim where the face opens out of the hood (the plane where hood and face ellipsoids meet)
  {
    const hc = new THREE.Vector3(...HOOD_C);
    const fc = new THREE.Vector3(...FACE_C);
    const n = fc.clone().sub(hc);
    const d = n.length();
    n.normalize();
    const R = 0.116;
    const r = 0.093;
    const a = (d * d + R * R - r * r) / (2 * d);
    const p = hc.clone().addScaledVector(n, a);
    const rim = hoodSkin.loop(p, { dir: n, lift: 0.003 });
    b.sweep(rim, 0.0095, { bone: head, color: TRIM, sides: 6, smooth: false });
  }

  // calyx: a crown of leaf cards lying over the forehead-top, plus a curled stem
  const crown = hoodSkin.around(HOOD_C).at(0, 74);
  if (!crown) throw new Error("no crown hit");
  const crownHits: Hit[] = [];
  for (const [ring, radius, offsetDeg] of [
    [8, 0.03, 0],
    [8, 0.052, 22.5],
  ] as const) {
    for (let k = 0; k < ring; k++) {
      const ang = ((k * 360) / ring + offsetDeg) * (Math.PI / 180);
      const tangentU = new THREE.Vector3(1, 0, 0);
      const tangentV = new THREE.Vector3(0, 0, 1).cross(tangentU).cross(tangentU).multiplyScalar(-1);
      const pt = new THREE.Vector3(...crown.at).addScaledVector(tangentU, Math.cos(ang) * radius).addScaledVector(tangentV, Math.sin(ang) * radius);
      crownHits.push(hoodSkin.nearest(pt));
    }
  }
  const crownAt = new THREE.Vector3(...crown.at);
  for (const [hits, tex, size] of [
    [crownHits.slice(0, 8), LEAF_A, [0.05, 0.078]],
    [crownHits.slice(8), LEAF_B, [0.054, 0.08]],
  ] as const) {
    b.cards(hits, tex, {
      size,
      lean: 70,
      bend: 40,
      flow: (f) => f.at.clone().sub(crownAt).setY(-0.03),
      sink: 0.06,
    });
  }
  b.part(new THREE.CylinderGeometry(0.022, 0.03, 0.016, 8), LEAF_DEEP, { bone: head, at: [crownAt.x, crownAt.y + 0.005, crownAt.z], dir: crown.axis, flat: true });
  b.sweep(
    catmull([
      crownAt,
      [crownAt.x, crownAt.y + 0.025, crownAt.z + 0.004],
      [crownAt.x + 0.012, crownAt.y + 0.045, crownAt.z + 0.012],
    ]),
    [0.011, 0.007],
    { bone: head, color: LEAF_DEEP, sides: 5, smooth: false },
  );

  // seeds on the hood
  b.cards(
    hoodSkin.scatter(80, {
      rng: rng(21),
      minDist: 0.03,
      filter: (h) => {
        const { x, y, z } = h.at;
        if (z > 0.015 && y < 0.325) return false; // face opening
        if (y < 0.245) return false;
        if (Math.hypot(x - crownAt.x, y - crownAt.y, z - crownAt.z) < 0.085) return false; // calyx
        if (Math.abs(x) > 0.02 && Math.abs(x) < 0.065 && y > 0.345 && z < 0.03) return false; // ears
        return true;
      },
    }),
    SEED,
    { size: [0.016, 0.024], lean: 88, bend: 14, flow: [0, -1, -0.1], mirror: true, sink: 0.05 },
  );

  // jaw, nose-muzzle, teeth
  b.part(sph(7, 5), FUR, { bone: jaw, at: [0, 0.212, 0.074], scale: [0.046, 0.024, 0.036], flat: true });
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.011, 0.016, 0.006), TOOTH, { bone: head, at: [s * 0.0065, 0.22, 0.119], flat: true });
  b.decal(faceSkin, MUZZLE, { at: faceSkin.around(FACE_C).at(0, -22)!, size: [0.066, 0.043], segments: [9, 6], bone: head });

  // eyes and blush
  for (const s of [1, -1]) {
    const eyeHit = faceSkin.around(FACE_C).at(s * 33, 5)!;
    b.decal(faceSkin, EYE, { at: eyeHit, size: [0.04, 0.053], segments: [6, 8], bone: head, roll: 0 });
    const blushHit = faceSkin.around(FACE_C).at(s * 50, -17)!;
    b.decal(faceSkin, BLUSH, { at: blushHit, size: [0.04, 0.022], segments: [6, 3], bone: head, roll: -s * 12 });
  }

  // ears poking through the hood
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const path = catmull([
      [s * 0.04, 0.368, -0.018],
      [s * 0.05, 0.44, -0.026],
      [s * 0.072, 0.518, -0.014],
    ]);
    const chain = b.chain(`ear${side}`, path, { parent: head, names: [`ear${side}1`, `ear${side}2`], role: "hinge" });
    const ear = b.sweep(chain, (t) => {
      const k = Math.sin(Math.PI * Math.min(1, 0.25 + 0.75 * t));
      const tip = t > 0.75 ? 1 - ((t - 0.75) / 0.25) * 0.55 : 1;
      return [0.032 * k * tip + 0.004, 0.014 * k * tip + 0.003];
    }, { color: FUR, sides: 6, smooth: false, caps: "round" });
    b.decal(ear, EAR_INNER, {
      at: [s * 0.055, 0.45, 0.0],
      dir: [0, 0, -1],
      size: [0.04, 0.125],
      segments: [4, 10],
      roll: -s * 12,
      bone: chain.joints[1],
    });
    b.part(new THREE.CylinderGeometry(0.036, 0.042, 0.016, 7), BERRY_DEEP, { bone: head, at: [s * 0.041, 0.372, -0.018], dir: [s * 0.15, 1, -0.1], flat: true });
  }

  // ---------------- arms, paws, basket ----------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder: V = [s * 0.084, 0.178, 0.0];
    const elbow: V = [s * 0.14, 0.168, 0.018];
    const wrist: V = [s * 0.192, 0.15, 0.038];
    const arm = b.chain(`arm${side}`, catmull([shoulder, elbow, wrist]), {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const hand = arm.tip ?? arm.joints[arm.joints.length - 1];
    const sleeve = b.sweep(arm, [0.038, 0.033, 0.029], { color: BERRY, sides: 6, smooth: false, caps: "round" });
    b.cards(
      b.surface(sleeve).scatter(6, { rng: rng(31 + s), minDist: 0.034, filter: (h) => h.n.y > -0.3 && h.at.x * s > 0.1 }),
      SEED,
      { size: [0.014, 0.021], lean: 88, bend: 36, flow: [0, -1, 0.2], mirror: true, sink: 0.05 },
    );
    const dir = new THREE.Vector3(...wrist).sub(new THREE.Vector3(...elbow)).normalize();
    // cream mitten cuff and paw
    b.part(new THREE.CylinderGeometry(0.033, 0.036, 0.018, 8), CREAM, { bone: hand, at: wrist, dir: dir.toArray() as V, flat: true });
    const pawAt = new THREE.Vector3(...wrist).addScaledVector(dir, 0.026);
    b.part(sph(6, 5), FUR, { bone: hand, at: pawAt.toArray() as V, scale: [0.031, 0.027, 0.03], flat: true });
    // three stub fingers as digit joints, fanned sideways
    const across = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
    [-0.55, 0, 0.55].forEach((spread, i) => {
      const fdir = dir.clone().addScaledVector(across, spread).normalize();
      const base = pawAt.clone().addScaledVector(dir, 0.02).addScaledVector(across, spread * 0.03);
      const tip = base.clone().addScaledVector(fdir, 0.022);
      const finger = b.joint(`finger${i + 1}${side}`, { parent: hand, at: base.toArray() as V, aim: tip.toArray() as V, role: "digit" });
      b.capsule(base.toArray() as V, tip.toArray() as V, 0.0105, { bone: finger, color: FUR, sides: 5, smooth: false });
    });

    if (s < 0) {
      // basket hanging from the right paw
      const top = pawAt.clone();
      const basketJoint = b.joint("basket", { parent: hand, at: top.toArray() as V, dir: [0, -1, 0] });
      const rimY = top.y - 0.058;
      const bc: V = [top.x, rimY, top.z];
      b.part(new THREE.CylinderGeometry(0.05, 0.04, 0.05, 8, 1, true), "#ffffff", {
        bone: basketJoint,
        at: [bc[0], bc[1] - 0.025, bc[2]],
        texture: WEAVE,
        flat: true,
      });
      b.part(new THREE.CylinderGeometry(0.046, 0.037, 0.046, 8), WICKER_DEEP, {
        bone: basketJoint,
        at: [bc[0], bc[1] - 0.029, bc[2]],
        flat: true,
      });
      // rim
      b.sweep(
        catmull(
          Array.from({ length: 8 }, (_, k) => {
            const a = (k / 8) * Math.PI * 2;
            return [bc[0] + Math.cos(a) * 0.05, bc[1], bc[2] + Math.sin(a) * 0.05] as V;
          }),
          { closed: true },
        ),
        0.006,
        { bone: basketJoint, color: WICKER_DEEP, sides: 5, smooth: false },
      );
      // handle
      b.sweep(
        catmull([
          [bc[0] - 0.048, bc[1], bc[2]],
          [bc[0] - 0.04, bc[1] + 0.04, bc[2]],
          [bc[0], top.y + 0.004, bc[2]],
          [bc[0] + 0.04, bc[1] + 0.04, bc[2]],
          [bc[0] + 0.048, bc[1], bc[2]],
        ]),
        0.0045,
        { bone: basketJoint, color: WICKER_DEEP, sides: 5, smooth: false },
      );
      // berries heaped in the basket
      const berryPlaces: Array<[V, number]> = [
        [[-0.018, 0.012, 0.006], 0.022],
        [[0.02, 0.011, -0.006], 0.021],
        [[0.0, 0.01, -0.026], 0.02],
        [[0.002, 0.016, 0.026], 0.02],
        [[0.0, 0.032, 0.0], 0.021],
      ];
      let berryCount = 0;
      for (const [[dx, dy, dz], r] of berryPlaces) {
        const fruit = b.part(sph(7, 5), BERRY, {
          bone: basketJoint,
          at: [bc[0] + dx, bc[1] + dy, bc[2] + dz],
          scale: [r, r * 1.08, r],
          flat: true,
        });
        berryCount++;
        b.cards(
          b.surface(fruit).scatter(5, { rng: rng(41 + berryCount), minDist: 0.014, filter: (h) => h.n.y > -0.2 }),
          SEED,
          { size: [0.008, 0.012], lean: 88, flow: [0, -1, 0], mirror: true, sink: 0.05 },
        );
        b.cards([frame([bc[0] + dx, bc[1] + dy + r * 1.05, bc[2] + dz], [0, 1, 0])], BERRY_LEAF, {
          size: [0.028, 0.028],
          lean: 82,
          flow: [0, 0, 1],
          mirror: true,
          bone: basketJoint,
        });
      }
    }
  }

  // a few sparkles, sticker-style, on the hood cheek
  for (const s of [1, -1]) {
    b.cards(
      [hoodSkin.around(HOOD_C).at(s * 105, 28)!],
      SPARKLE,
      { size: 0.028, lean: 80, flow: [0, -1, 0], mirror: true, sink: 0.05 },
    );
  }

  return b.root;
}
