import * as THREE from "three";
import {
  createBuilder,
  rng,
  limb,
  catmull,
  paint,
  mottle,
  countershade,
  mix,
  noise,
  smoothstep,
  svg,
} from "../../../../src/index";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Chibi Axolotl",
  description:
    "A big-headed, pink leucistic axolotl with three frilly feathered gills on each side, a wide smile, glossy black eyes, stubby four-fingered hands and a finned paddle tail.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const PINK = "#f8b6c8";
const PINK_B = "#f3a2bb";
const CREAM = "#ffe9ec";
const SPOT = "#ee8aab";
const TIP = "#ffc6d6";
const NOSE = "#a8456c";
const GILL_STALK = "#ff6a9a";
const GILL_ROOT = "#ff4f86";
const GILL_MID = "#ff7aa8";
const GILL_TIP = "#ffb3cd";

const D2R = Math.PI / 180;
const UP = new THREE.Vector3(0, 1, 0);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------------------------------------------------------
// Textures
const EYE = svg(
  `<svg viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="25" cy="30" rx="23" ry="28" fill="#170c22"/>
    <ellipse cx="25" cy="34" rx="19" ry="22" fill="#33204a"/>
    <ellipse cx="25" cy="43" rx="14" ry="11" fill="#5a3580"/>
    <ellipse cx="25" cy="30" rx="22" ry="27" fill="none" stroke="#0c0614" stroke-width="2.5"/>
    <circle cx="16" cy="18" r="8.5" fill="#ffffff"/>
    <circle cx="33" cy="42" r="4" fill="#ffffff"/>
    <circle cx="36" cy="16" r="2.2" fill="#ffffff"/>
  </svg>`,
  { size: 192 },
);

const SMILE = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 12 Q50 46 90 12" fill="none" stroke="#7a2848" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M10 12 Q5 10 3 4" fill="none" stroke="#7a2848" stroke-width="4" stroke-linecap="round"/>
    <path d="M90 12 Q95 10 97 4" fill="none" stroke="#7a2848" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const BLUSH = svg(
  `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="20" rx="28" ry="17" fill="#ff86ab"/>
    <path d="M14 24 L20 14 M26 26 L32 14 M38 24 L44 14" stroke="#e8507f" stroke-width="3.2" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Paints
const BODY = cel(
  countershade(mottle(PINK, PINK_B, { size: 0.05, contrast: 0.7, seed: 3 }), CREAM, { level: -0.3, soft: 0.25 }),
);
const FIN = paint((p, _n, s) => {
  const edge = smoothstep(0.5, 1, s[1]);
  const base = mix(PINK, "#ff8fb2", edge);
  const fleck = smoothstep(0.62, 0.75, noise(p, 0.02, 9));
  return mix(base, "#ff6f9c", fleck * 0.5);
});

export default function build() {
  const b = createBuilder({ name: "axolotl" });
  const rand = rng(21);

  // ----------------------------------------------------------------------------------------------------------
  // Skeleton: hips -> spine -> head -> jaw, tail, four limbs
  const spinePts: number[][] = [
    [0, 0.041, -0.04],
    [0, 0.043, 0.015],
    [0, 0.046, 0.07],
  ];
  const hips = b.joint("hips", { at: spinePts[0], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", catmull(spinePts), { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" });

  const head = b.joint("head", { parent: spine.tip!, at: [0, 0.05, 0.06], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.03, 0.045], aim: [0, 0.03, 0.15], role: "jaw" });

  const tailPts: number[][] = [
    [0, 0.04, -0.04],
    [0, 0.031, -0.1],
    [0, 0.027, -0.16],
    [0, 0.034, -0.215],
    [0, 0.05, -0.255],
  ];
  const tailPath = catmull(tailPts);
  const tail = b.chain("tail", tailPath, { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" });

  // ----------------------------------------------------------------------------------------------------------
  // Body and tail
  const bodyTube = b.sweep(spine, (t: number) => [0.042 + 0.014 * Math.sin((t * Math.PI) / 2), 0.04 + 0.006 * t], {
    color: BODY,
  });
  const tailR = (t: number): [number, number] => [0.03 * (1 - t) + 0.006, 0.033 * Math.pow(1 - t, 1.1) + 0.007];
  const tailTube = b.sweep(tail, tailR, { color: BODY });

  // Tail fin: a membrane that bends with the tail joints
  const finTop: number[][] = [];
  const finBot: number[][] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const c = tailPath.at(t);
    const ry = tailR(t)[1];
    const f = 0.036 * Math.pow(Math.max(Math.sin(Math.PI * (0.1 + 0.82 * t)), 0), 0.7);
    finTop.push([c.x, c.y + ry * 0.9 + f, c.z]);
    finBot.push([c.x, c.y - ry * 0.3, c.z]);
  }
  b.membrane(catmull(finBot), catmull(finTop), { bone: tail, color: FIN, thickness: 0.004 });

  // ----------------------------------------------------------------------------------------------------------
  // Head
  const C = V(0, 0.056, 0.1);
  const skull = b.part(new THREE.SphereGeometry(1, 18, 12), BODY, {
    bone: head,
    at: C,
    scale: [0.095, 0.047, 0.085],
  });
  const jawPart = b.part(new THREE.SphereGeometry(1, 16, 10), BODY, {
    bone: jaw,
    at: [0, 0.027, 0.108],
    scale: [0.084, 0.029, 0.08],
  });
  const skullSurf = b.surface(skull);
  const onSkull = (az: number, el: number) => {
    const h = skullSurf.around(C).at(az, el);
    if (!h) throw new Error(`no skull hit at ${az}, ${el}`);
    return h;
  };

  // Face
  for (const s of [1, -1]) {
    b.decal(skull, EYE, { at: onSkull(s * 36, 30), size: [0.046, 0.056], mirror: s > 0, segments: 10, lift: 0.0015 });
    b.decal(skull, BLUSH, { at: onSkull(s * 68, -6), size: [0.042, 0.026], mirror: s > 0, segments: 8, lift: 0.0012 });
    b.stick(new THREE.SphereGeometry(0.0045, 5, 4), NOSE, onSkull(s * 9, 22), { embed: 0.3 });
  }
  b.decal([skull, jawPart], SMILE, { at: [0, 0.037, 0.19], dir: [0, 0, 1], size: [0.12, 0.048], segments: 16, lift: 0.0015 });

  // ----------------------------------------------------------------------------------------------------------
  // Gills: three feathered stalks per side
  const GILLS = [
    { az: 128, el: 42, dir: [0.45, 0.85, -0.25], len: 0.105 },
    { az: 118, el: 16, dir: [0.85, 0.5, -0.2], len: 0.115 },
    { az: 108, el: -10, dir: [0.95, 0.12, -0.2], len: 0.1 },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    GILLS.forEach((g, gi) => {
      const hit = onSkull(s * g.az, g.el);
      const d = V(s * g.dir[0], g.dir[1], g.dir[2]).normalize();
      const p0 = hit.at.clone();
      const p1 = p0.clone().addScaledVector(d, g.len * 0.33);
      const p2 = p0.clone().addScaledVector(d, g.len * 0.68).add(V(0, 0.012, 0));
      const p3 = p0.clone().addScaledVector(d, g.len).add(V(0, 0.03, 0));
      const nm = `gill${side}${gi + 1}`;
      const { sweep: stalk } = b.sprout(nm, hit, catmull([p0, p1, p2, p3]), [0.013, 0.005], {
        count: 3,
        names: [`${nm}_1`, `${nm}_2`, `${nm}_3`],
        role: "fan",
        color: GILL_STALK,
      });
      // base bump where the stalk leaves the head
      b.stick(new THREE.SphereGeometry(0.017, 8, 6), GILL_ROOT, hit, { embed: 0.45 });

      // frilly filaments along the stalk
      const N = 7;
      let i = 0;
      b.along(stalk, N, (at) => {
        const prog = i / (N - 1);
        i++;
        for (const deg of [-85, -30, 30, 85]) {
          const f = stalk.at(at.t, deg);
          const dir = V(f.n.x, f.n.y, f.n.z).addScaledVector(f.tangent, 0.8).normalize();
          const len = 0.055 * (1 - 0.55 * prog) * (0.9 + 0.2 * rand());
          b.spike(f, dir, len, 0.0058, {
            sides: 5,
            bands: [
              [0.4, GILL_ROOT],
              [0.75, GILL_MID],
              [1, GILL_TIP],
            ],
          });
        }
      });
      // tuft at the tip
      const tipF = stalk.at(0.97, 0);
      for (const k of [-1, 0, 1]) {
        const dir = V(tipF.tangent.x, tipF.tangent.y, tipF.tangent.z).addScaledVector(V(s * k * 0.7, 0.1, 0.25 * k), 1).normalize();
        b.spike(tipF, dir, 0.04, 0.0055, {
          sides: 5,
          bands: [
            [0.5, GILL_MID],
            [1, GILL_TIP],
          ],
        });
      }
    });
  }

  // ----------------------------------------------------------------------------------------------------------
  // Limbs
  const makeHand = (
    chain: ReturnType<typeof b.chain>,
    W: THREE.Vector3,
    D: THREE.Vector3,
    angles: number[],
    L: number,
    tag: string,
  ) => {
    b.part(new THREE.SphereGeometry(0.0135, 8, 6), BODY, { bone: chain.tip!, at: W, scale: [1, 0.9, 1.1] });
    const maxA = Math.max(...angles.map((a) => Math.abs(a)));
    angles.forEach((a, j) => {
      const dir = D.clone().applyAxisAngle(UP, a * D2R).normalize();
      const base = V(W.x, 0.0075, W.z).addScaledVector(dir, 0.006);
      const tip = base.clone().addScaledVector(dir, L * (1 - 0.18 * (Math.abs(a) / maxA)));
      const jt = b.joint(`digit${tag}${j + 1}`, { parent: chain.tip!, at: base, aim: tip, role: "digit" });
      b.capsule(base, tip, 0.0048, { bone: jt, color: BODY });
      b.part(new THREE.SphereGeometry(0.0064, 6, 4), TIP, { bone: jt, at: tip });
    });
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front limb
    const armPts = limb(V(s * 0.048, 0.036, 0.035), V(s * 0.115, 0.013, 0.07), [0.045, 0.045], [s * 0.6, 0.5, -1]);
    const arm = b.chain(`arm${side}`, armPts, {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.021, 0.0125], { color: BODY });
    makeHand(arm, armPts[2], V(s * 0.55, 0, 0.85).normalize(), [-33, -11, 11, 33], 0.032, `F${side}`);

    // hind limb
    const legPts = limb(V(s * 0.045, 0.036, -0.035), V(s * 0.11, 0.013, -0.085), [0.05, 0.05], [s * 0.6, 0.5, 1]);
    const leg = b.chain(`leg${side}`, legPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.023, 0.0135], { color: BODY });
    makeHand(leg, legPts[2], V(s * 0.75, 0, 0.55).normalize(), [-42, -21, 0, 21, 42], 0.032, `H${side}`);
  }

  // ----------------------------------------------------------------------------------------------------------
  // Freckles
  const spotGeo = () => new THREE.CylinderGeometry(0.007, 0.007, 0.004, 6);
  for (const h of b.surface(bodyTube).scatter(30, { rng: rng(5), minDist: 0.035, filter: (x) => x.n.y > 0.3 }))
    b.stick(spotGeo(), SPOT, h, { embed: 0.4 });
  for (const h of b.surface(tailTube).scatter(14, { rng: rng(6), minDist: 0.03, filter: (x) => x.n.y > 0.25 }))
    b.stick(spotGeo(), SPOT, h, { embed: 0.4 });
  for (const h of skullSurf.scatter(16, {
    rng: rng(7),
    minDist: 0.03,
    filter: (x) => x.n.y > 0.5 && x.at.z < 0.13,
  }))
    b.stick(spotGeo(), SPOT, h, { embed: 0.4 });

  return b.root;
}
