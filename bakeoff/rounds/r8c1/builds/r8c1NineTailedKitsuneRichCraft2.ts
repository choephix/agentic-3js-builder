import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  offset,
  catmull,
  limb,
  paint,
  mix,
  noise,
  smoothstep,
  gradient,
  svg,
} from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kitsune of the Nine Spirit Flames",
  description:
    "A white nine-tailed fox in high-fantasy anime style: gold anime eyes, vermilion kumadori markings, a shimenawa collar with paper shide and a bell. Nine fanned tails end in glowing spirit flames. She stands on a mossy shrine plinth with a glowing nine-point seal, stone lanterns and floating foxfire.",
};

type V3 = [number, number, number];
type Pt = [number, number] | [number, number, "sharp"];

const F = 0.08; // top of the shrine plinth
const H = 1.28; // head scale

// ---------------------------------------------------------------- textures
const FLAME_D =
  "M32 127 C10 118 4 92 14 70 C18 80 22 82 24 76 C20 50 34 30 40 2 C44 26 62 44 58 80 C56 104 48 122 32 127 Z";
const flameSvg = (o: string, m: string, i: string) =>
  `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
    <path d="${FLAME_D}" fill="${o}"/>
    <path d="${FLAME_D}" fill="${m}" transform="translate(32 127) scale(0.64 0.74) translate(-32 -127)"/>
    <path d="${FLAME_D}" fill="${i}" transform="translate(32 127) scale(0.32 0.46) translate(-32 -127)"/>
  </svg>`;

const polar = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(128 + r * Math.cos(a)).toFixed(1)} ${(128 + r * Math.sin(a)).toFixed(1)}`;
};
const nineStar = (r: number, step: number) =>
  "M" +
  Array.from({ length: 9 }, (_, i) => polar(r, -90 + i * step * 40)).join(" L") +
  " Z";
const magicSvg = () => {
  let dots = "";
  for (let i = 0; i < 9; i++) {
    const [x, y] = polar(112, -90 + i * 40).split(" ");
    dots += `<circle cx="${x}" cy="${y}" r="5.5" fill="#bff7ff"/>`;
    const [x2, y2] = polar(78, -90 + i * 40 + 20).split(" ");
    dots += `<circle cx="${x2}" cy="${y2}" r="3.2" fill="#b9a2ff"/>`;
  }
  let ticks = "";
  for (let i = 0; i < 36; i++) ticks += `<path d="M${polar(121, i * 10)} L${polar(i % 3 ? 117 : 112, i * 10)}" stroke="#8feaff" stroke-width="2.4"/>`;
  return `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <circle cx="128" cy="128" r="124" fill="none" stroke="#8feaff" stroke-width="3"/>
    <circle cx="128" cy="128" r="104" fill="none" stroke="#8feaff" stroke-width="2.4"/>
    ${ticks}
    <path d="${nineStar(100, 2)}" fill="none" stroke="#bff7ff" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="${nineStar(70, 4)}" fill="none" stroke="#b9a2ff" stroke-width="2.4" stroke-linejoin="round"/>
    <circle cx="128" cy="128" r="46" fill="none" stroke="#8feaff" stroke-width="2.6"/>
    <circle cx="128" cy="128" r="14" fill="#bff7ff"/>
    <circle cx="128" cy="128" r="24" fill="none" stroke="#b9a2ff" stroke-width="2.2"/>
    ${dots}
  </svg>`;
};

const MARK_FORE = `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 2 L35 28 L20 62 L5 28 Z" fill="#e2363f" stroke="#3a1230" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M20 14 L28 28 L20 46 L12 28 Z" fill="#ff7a5a"/>
  <circle cx="20" cy="28" r="4.2" fill="#ffd35a" stroke="#3a1230" stroke-width="1.4"/>
</svg>`;
const MARK_CHEEK = `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
  <path d="M74 6 C52 8 30 16 4 34 C32 30 54 24 76 16 Z" fill="#e2363f" stroke="#3a1230" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M70 26 C52 30 36 38 20 48 C42 44 56 40 72 34 Z" fill="#e2363f" stroke="#3a1230" stroke-width="1.8" stroke-linejoin="round"/>
</svg>`;
const MARK_FLANK = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 72 C6 30 38 8 72 12 C50 20 36 34 36 50 C36 62 28 68 8 72 Z" fill="#e2363f" stroke="#3a1230" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M20 62 C20 40 38 26 58 22 C44 32 38 42 38 52 C36 58 30 60 20 62 Z" fill="#ff8a62"/>
  <circle cx="52" cy="52" r="7" fill="#ffd35a" stroke="#3a1230" stroke-width="2"/>
  <circle cx="52" cy="52" r="2.6" fill="#e2363f"/>
</svg>`;
const WINDOW = `<svg viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="38" height="46" rx="5" fill="#ff9a3c"/>
  <rect x="5" y="5" width="30" height="38" rx="4" fill="#ffd27a"/>
  <ellipse cx="20" cy="24" rx="10" ry="14" fill="#fff3c0"/>
  <path d="M20 5 V43 M5 24 H35" stroke="#7a3d12" stroke-width="3"/>
</svg>`;
const PETAL = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 31 C4 24 0 12 7 3 C11 6 14 8 16 12 C18 8 21 6 25 3 C32 12 28 24 16 31 Z" fill="#ffc2d6" stroke="#f08aaa" stroke-width="1.2"/>
  <path d="M16 28 V14" stroke="#f6a2bd" stroke-width="1.2"/>
</svg>`;
const GRASS = `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 64 C6 40 10 20 4 4 C16 20 20 42 20 64 Z" fill="#5da24e"/>
  <path d="M18 64 C20 36 26 14 24 0 C34 16 34 42 32 64 Z" fill="#7cc35e"/>
  <path d="M30 64 C32 44 40 28 44 14 C46 34 44 50 42 64 Z" fill="#4a8d46"/>
</svg>`;
const TASSEL = `<svg viewBox="0 0 24 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 60 L3 2 M12 60 L8 0 M12 60 L12 0 M12 60 L16 0 M12 60 L21 2" stroke="#d62f45" stroke-width="3.4" stroke-linecap="round"/>
  <rect x="7" y="48" width="10" height="9" rx="2" fill="#ffd35a" stroke="#8a5a1a" stroke-width="1.2"/>
  <circle cx="12" cy="60" r="4" fill="#ffd35a"/>
</svg>`;
const TUFT = `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 64 C3 34 13 16 16 0 C19 16 29 34 29 64 Z" fill="#ffffff"/>
  <path d="M16 62 C14 40 15 22 16 8" stroke="#d6d6dc" stroke-width="2.4" fill="none"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "kitsune" });
  const R = rng(11);

  // ---------------------------------------------------------------- palette
  const WHITE = cel("#fffaf1", "#c9c3ef");
  const LAV = cel("#ddd5ff", "#a79de2");
  const RED = cel("#e2363f", "#9c1f45");
  const GOLD = cel("#ffd35a", "#c78a2a");
  const INDIGO = cel("#34346f", "#1c1c48");
  const PINK = cel("#ffb7cb", "#e68aab");
  const BODY = furEdge(LAV, WHITE, { level: 0.55, teeth: 0.22, period: 0.04, along: [0, 0, 1] });
  const SOCKS = furEdge(WHITE, INDIGO, { by: "position", level: 0.25, teeth: 0.03, period: 0.034, along: [1, 0, 1] });
  const STONE = paint((p, n) => {
    const m = noise(p, 0.22, 3);
    let c = mix("#7d839c", "#a3a8bd", m);
    c = mix(c, "#5b6078", smoothstep(0.62, 0.8, noise(p, 0.07, 8)) * 0.6);
    const moss = smoothstep(0.52, 0.7, noise(p, 0.28, 5)) * smoothstep(0.55, 0.9, n.y);
    c = mix(c, "#6fae5a", moss * 0.85);
    return mix(c, "#4c5170", (1 - smoothstep(-0.2, 0.6, n.y)) * 0.35);
  });

  // ---------------------------------------------------------------- textures
  const EYE = animeEye({ iris: "#ffb12e", irisLight: "#fff08a", blush: "#ff7a9a" });
  const FLAME_A = svg(flameSvg("#2f9bff", "#6ff0ff", "#f4ffff"), { size: 256 });
  const FLAME_B = svg(flameSvg("#8a5cff", "#c9a2ff", "#fff4ff"), { size: 256 });
  const MAGIC = svg(magicSvg(), { size: 512 });
  const FOREMARK = svg(MARK_FORE, { size: 128 });
  const CHEEKMARK = svg(MARK_CHEEK, { size: 160 });
  const FLANKMARK = svg(MARK_FLANK, { size: 192 });
  const WINDOWTEX = svg(WINDOW, { size: 96 });
  const PETALTEX = svg(PETAL, { size: 64 });
  const GRASSTEX = svg(GRASS, { size: 96 });
  const TASSELTEX = svg(TASSEL, { size: 96 });
  const TUFTTEX = svg(TUFT, { size: 96 });

  // ---------------------------------------------------------------- helpers
  const norm = (a: number[]): V3 => {
    const v = new THREE.Vector3(a[0], a[1], a[2]).normalize();
    return [v.x, v.y, v.z];
  };
  const orth = (a: number[], hint: number[]): V3 => {
    const av = new THREE.Vector3(a[0], a[1], a[2]).normalize();
    const h = new THREE.Vector3(hint[0], hint[1], hint[2]);
    h.addScaledVector(av, -h.dot(av));
    if (h.lengthSq() < 1e-8) {
      h.set(0, 0, 1);
      h.addScaledVector(av, -av.z);
    }
    h.normalize();
    return [h.x, h.y, h.z];
  };
  const planeX = (x: number[], hint: number[]) => ({ x: norm(x), y: orth(x, hint) });
  const planeY = (y: number[], hint: number[]) => ({ y: norm(y), x: orth(y, hint) });

  /** A leaf-shaped fur blade pointing along dir. */
  const blade = (len: number, wid: number, at: any, dir: number[], hint: number[], color: any, bone: any, thick = 0.014) => {
    const o: Pt[] = [
      [0, -wid / 2],
      [len * 0.5, -wid * 0.46],
      [len, 0, "sharp"],
      [len * 0.5, wid * 0.46],
      [0, wid / 2],
    ];
    const pl = planeX(dir, hint);
    return b.extrude(o, { at, x: pl.x, y: pl.y, thickness: thick, bevel: thick * 0.3, color, bone });
  };

  const ellipsoid = (at: any, sc: V3, color: any, bone: any, seg: [number, number] = [10, 8]) =>
    b.part(new THREE.SphereGeometry(1, seg[0], seg[1]), color, { at, bone, scale: sc });

  const flame = (at: V3, size: [number, number], tex: any, bone: any, strength = 1.4) => {
    const cards = b.cards([frame(at, [0, 1, 0])], tex, { size, cross: true, bone, sink: 0.02, rng: R, vary: 0.15 });
    glow(cards, strength);
    return cards;
  };

  // ---------------------------------------------------------------- skeleton: root, hips, spine, neck, head
  const root = b.joint("root", { at: [0, F, 0] });
  const SP: V3[] = [
    [0, 0.52, -0.26],
    [0, 0.535, -0.06],
    [0, 0.555, 0.14],
    [0, 0.57, 0.3],
  ];
  const hips = b.joint("hips", { parent: root, at: SP[0], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain("spine", catmull(SP), {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "chest"],
    role: "spine",
  });
  const chest = spine.joints[3];
  const NECK_TOP: V3 = [0, 0.8, 0.46];
  const neck = b.chain("neck", catmull([SP[3], [0, 0.69, 0.4], NECK_TOP]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: NECK_TOP, dir: [0, 0, 1], role: "head" });
  const hp = (f: number, u: number, l = 0) => head.local({ forward: f * H, up: u * H, left: l * H });

  const jaw = b.joint("jaw", { parent: head, at: hp(0.06, -0.095, 0), aim: hp(0.23, -0.105, 0), role: "jaw" });
  const earJ: Record<string, any> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    earJ[side] = b.joint(`ear${side}`, {
      parent: head,
      at: hp(0.0, 0.11, s * 0.075),
      dir: [s * 0.4, 1, -0.2],
      role: "hinge",
    });
  }

  // ---------------------------------------------------------------- the shrine plinth and scenery
  b.lathe(
    [
      [0, 0],
      [1.15, 0],
      [1.15, 0.045],
      [1.05, 0.062],
      [1.05, F],
      [0, F],
    ],
    { at: [0, 0, 0], bone: root, segments: 20, color: STONE },
  );
  const ringPath = (r: number, y: number, n = 20) =>
    catmull(
      Array.from({ length: n }, (_, i) => [Math.cos((i / n) * Math.PI * 2) * r, y, Math.sin((i / n) * Math.PI * 2) * r]),
      { closed: true },
    );
  b.sweep(ringPath(0.99, F + 0.006), 0.011, { color: GOLD, bone: root, sides: 5 });
  b.sweep(ringPath(1.1, 0.046, 20), 0.008, { color: GOLD, bone: root, sides: 5 });

  // glowing nine-point seal
  glow(
    b.part(new THREE.CircleGeometry(0.9, 36), "#ffffff", {
      bone: root,
      at: [0, F + 0.004, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: MAGIC,
    }),
    1.1,
  );

  // stone lanterns
  const lantern = (x: number, z: number) => {
    b.lathe(
      [
        [0, 0],
        [0.1, 0],
        [0.1, 0.025],
        [0.045, 0.04],
        [0.045, 0.19],
        [0.085, 0.205],
        [0.088, 0.23],
        [0, 0.23],
      ],
      { at: [x, F, z], bone: root, segments: 6, color: STONE },
    );
    b.part(new THREE.BoxGeometry(0.12, 0.12, 0.12), STONE, { bone: root, at: [x, F + 0.29, z] });
    for (const [dx, dz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      glow(
        b.part(new THREE.PlaneGeometry(0.075, 0.09), "#ffffff", {
          bone: root,
          at: [x + dx * 0.0615, F + 0.29, z + dz * 0.0615],
          dir: [dx, 0, dz],
          axis: "z",
          texture: WINDOWTEX,
        }),
        1.3,
      );
    }
    b.lathe(
      [
        [0, 0],
        [0.165, 0],
        [0.15, 0.022],
        [0.07, 0.085],
        [0.035, 0.12],
        [0, 0.13],
      ],
      { at: [x, F + 0.35, z], bone: root, segments: 6, color: STONE },
    );
    b.part(new THREE.SphereGeometry(0.022, 8, 6), GOLD, { bone: root, at: [x, F + 0.5, z] });
  };
  lantern(0.74, 0.36);
  lantern(-0.74, 0.36);

  // rocks
  for (const [x, z, r] of [
    [-0.78, -0.45, 0.09],
    [0.85, -0.55, 0.07],
    [-0.4, 0.9, 0.06],
    [0.55, 0.82, 0.05],
    [-0.93, 0.0, 0.05],
  ]) {
    b.part(new THREE.IcosahedronGeometry(1, 0), STONE, {
      bone: root,
      at: [x, F + r * 0.35, z],
      scale: [r, r * 0.7, r * 0.9],
      flat: true,
      rotation: [R() * 40, R() * 360, R() * 40],
    });
  }

  // grass tufts on the rim
  const grassFrames = Array.from({ length: 44 }, (_, i) => {
    const a = (i / 44) * Math.PI * 2 + R() * 0.12;
    const rr = 0.82 + R() * 0.2;
    return frame([Math.cos(a) * rr, F, Math.sin(a) * rr], [0, 1, 0]);
  });
  b.cards(grassFrames, GRASSTEX, { size: [0.08, 0.14], cross: true, vary: 0.35, spin: 180, rng: R, bone: root });

  // fallen sakura petals
  const petalFrames = Array.from({ length: 34 }, () => {
    const a = R() * Math.PI * 2;
    const rr = 0.2 + R() * 0.75;
    return frame([Math.cos(a) * rr, F + 0.009, Math.sin(a) * rr], [0, 1, 0]);
  });
  b.cards(petalFrames, PETALTEX, {
    size: 0.05,
    lean: 90,
    flow: [1, 0, 0],
    mirror: true,
    spin: 180,
    vary: 0.3,
    rng: R,
    bone: root,
  });

  // ---------------------------------------------------------------- body
  const body = b.sweep(
    spine,
    (t) => [0.135 + 0.035 * Math.sin(Math.PI * t), 0.15 + 0.045 * t + 0.025 * Math.sin(Math.PI * t)],
    { color: BODY, extend: [0.04, 0.0] },
  );
  const chestFluff = ellipsoid([0, 0.5, 0.29], [0.125, 0.16, 0.13], WHITE, spine.joints[2]);
  void chestFluff;
  ellipsoid([0, 0.55, -0.4], [0.105, 0.105, 0.1], WHITE, hips);

  const neckTube = b.sweep(neck, [0.088, 0.066], { color: WHITE });

  // flank markings
  for (const s of [1, -1]) {
    b.decal(body, FLANKMARK, {
      at: [s * 0.13, 0.56, -0.02],
      dir: [s, 0, 0],
      size: [0.17, 0.17],
      mirror: s < 0,
      segments: 12,
    });
  }
  // body fur tufts
  b.cards(
    b.surface(body).scatter(34, { rng: rng(21), minDist: 0.07, filter: (h) => h.n.y > -0.25 }),
    TUFTTEX,
    { size: [0.07, 0.12], lean: 62, bend: 22, vary: 0.3, rng: R, color: BODY },
  );

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // fore leg
    const fp = limb([s * 0.105, 0.5, 0.25], [s * 0.105, F + 0.03, 0.33], [0.23, 0.2], [[0, 0, -1]]);
    const fl = b.chain(`foreLeg${side}`, fp, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
    });
    b.sweep(fl, [0.066, 0.05, 0.038], { color: SOCKS });
    ellipsoid([s * 0.115, 0.5, 0.23], [0.075, 0.12, 0.11], WHITE, spine.joints[2]);
    const fpaw = fl.joints[2];
    ellipsoid([s * 0.105, F + 0.029, 0.345], [0.042, 0.03, 0.062], INDIGO, fpaw);
    for (const dx of [-1, 0, 1])
      ellipsoid([s * 0.105 + dx * 0.021, F + 0.02, 0.395 - Math.abs(dx) * 0.008], [0.014, 0.012, 0.016], INDIGO, fpaw, [6, 4]);
    // elbow fur
    blade(0.1, 0.05, [s * 0.1, 0.4, 0.2], [0, -0.35, -1], [1, 0, 0], WHITE, fl.joints[1], 0.016);

    // hind leg (digitigrade)
    const hpts = limb([s * 0.11, 0.5, -0.26], [s * 0.11, F + 0.03, -0.3], [0.2, 0.2, 0.16], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hl = b.chain(`hindLeg${side}`, hpts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(hl, [0.07, 0.05, 0.033, 0.03], { color: SOCKS });
    ellipsoid([s * 0.115, 0.5, -0.26], [0.085, 0.12, 0.13], WHITE, hl.joints[0]);
    const hpaw = hl.joints[3];
    ellipsoid([s * 0.11, F + 0.029, -0.285], [0.04, 0.03, 0.06], INDIGO, hpaw);
    for (const dx of [-1, 0, 1])
      ellipsoid([s * 0.11 + dx * 0.02, F + 0.02, -0.232 - Math.abs(dx) * 0.006], [0.013, 0.011, 0.015], INDIGO, hpaw, [6, 4]);
  }

  // ---------------------------------------------------------------- head
  const SKC = hp(0.06, 0.05, 0);
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), WHITE, {
    bone: head,
    at: SKC,
    scale: [0.115 * H, 0.1 * H, 0.105 * H],
  });
  const jowls: any[] = [];
  for (const s of [1, -1])
    jowls.push(ellipsoid(hp(0.035, -0.035, s * 0.075), [0.05 * H, 0.055 * H, 0.07 * H], WHITE, head));

  // muzzle and nose
  b.sweep([hp(0.1, -0.045), hp(0.26, -0.065)], (t) => [(0.07 - 0.036 * t) * H, (0.056 - 0.028 * t) * H], {
    bone: head,
    color: WHITE,
    sides: 10,
  });
  ellipsoid(hp(0.277, -0.056), [0.024 * H, 0.018 * H, 0.02 * H], INK, head, [8, 6]);
  // lower jaw
  b.sweep([jaw.at, hp(0.23, -0.105)], (t) => [(0.045 - 0.02 * t) * H, (0.026 - 0.01 * t) * H], {
    bone: jaw,
    color: LAV,
    sides: 8,
  });
  // whiskers
  for (const s of [1, -1])
    for (const k of [0, 1]) {
      b.rod(hp(0.2, -0.07 - 0.01 * k, s * 0.04), hp(0.15 - 0.02 * k, -0.06 - 0.04 * k, s * 0.17), 0.003, "#eae6f7", {
        bone: head,
        sides: 4,
      });
    }

  // eyes and markings
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(SKC).at(s * 36, 8);
    if (hit)
      b.decal(skin, EYE, {
        at: hit,
        dir: [s * 0.3, 0, 1],
        size: [0.058 * H, 0.08 * H],
        mirror: s > 0,
        roll: s * 10,
        bone: head,
      });
  }
  const cheekSkin = b.surface([skull, ...jowls]);
  for (const s of [1, -1]) {
    const hit = cheekSkin.around(SKC).at(s * 62, -14);
    if (hit)
      b.decal(cheekSkin, CHEEKMARK, {
        at: hit,
        size: [0.085 * H, 0.054 * H],
        mirror: s > 0,
        bone: head,
      });
  }
  const foreHit = skin.around(SKC).at(0, 32);
  if (foreHit) b.decal(skin, FOREMARK, { at: foreHit, dir: [0, 0.35, 1], size: [0.04 * H, 0.064 * H], bone: head });

  // gold crescent crown
  const crownHit = skin.around(SKC).at(0, 60);
  if (crownHit) {
    const pl = planeY([0, 1, -0.55], [1, 0, 0]);
    const outline: Pt[] = [];
    const n = 6;
    const r1 = 0.05 * H;
    const r2 = 0.042 * H;
    const off = 0.012 * H;
    for (let i = 0; i <= n; i++) {
      const a = ((-80 + (160 * i) / n) * Math.PI) / 180;
      outline.push([r1 * Math.sin(a), -r1 * Math.cos(a)]);
    }
    for (let i = n; i >= 0; i--) {
      const a = ((-80 + (160 * i) / n) * Math.PI) / 180;
      outline.push([r2 * Math.sin(a), off - r2 * Math.cos(a)]);
    }
    b.extrude(outline, {
      at: offset(crownHit, pl.y, 0.034 * H),
      x: pl.x,
      y: pl.y,
      thickness: 0.014 * H,
      bevel: 0.003,
      color: GOLD,
      bone: head,
    });
    b.part(new THREE.OctahedronGeometry(0.014 * H), RED, {
      bone: head,
      at: offset(crownHit, [0, 0.5, 1], 0.012 * H),
    });
  }

  // ears with inner, tip, earrings
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ej = earJ[side];
    const pl = planeY([s * 0.3, 1, -0.1], [s, 0, 0]);
    const base = hp(0.0, 0.1, s * 0.075);
    const outer: Pt[] = [
      [-0.05 * H, 0],
      [0.05 * H, 0],
      [0.042 * H, 0.07 * H],
      [0.012 * H, 0.2 * H, "sharp"],
      [-0.026 * H, 0.1 * H],
    ];
    const earPaint = paint((_p, _n, c) => (c[1] > 0.14 * H ? INDIGO : WHITE));
    b.extrude(outer, { at: base, x: pl.x, y: pl.y, thickness: 0.02 * H, bevel: 0.003, color: earPaint, bone: ej });
    const inner: Pt[] = [
      [-0.03 * H, 0.012 * H],
      [0.03 * H, 0.012 * H],
      [0.024 * H, 0.07 * H],
      [0.008 * H, 0.15 * H, "sharp"],
      [-0.016 * H, 0.08 * H],
    ];
    b.extrude(inner, {
      at: offset(base, [0, 0, 1], 0.006 * H),
      x: pl.x,
      y: pl.y,
      thickness: 0.016 * H,
      color: PINK,
      bone: ej,
    });
    // earring
    const ear = hp(0.02, 0.06, s * 0.125);
    b.part(new THREE.SphereGeometry(0.016 * H, 8, 6), GOLD, { bone: head, at: ear });
    b.cards([frame(offset(ear, [0, -1, 0], 0.01), [0, 1, 0])], TASSELTEX, {
      size: [0.03, 0.09],
      lean: 180,
      flow: [0, 0, 1],
      bone: head,
    });
  }

  // forelock blades
  for (const k of [-1, 0, 1]) {
    blade(0.12 * H, 0.05 * H, hp(0.07, 0.14, k * 0.022), [k * 0.25, 0.8, -0.55], [1, 0, 0], k === 0 ? LAV : WHITE, head, 0.016);
  }
  // cheek ruff
  for (const s of [1, -1])
    for (const k of [0, 1, 2]) {
      blade(0.17 * H, 0.06 * H, hp(0.0 - 0.01 * k, -0.01 - 0.035 * k, s * (0.1 + 0.005 * k)), [s * 0.8, -0.18 - 0.14 * k, -0.6], [0, 1, 0], k === 1 ? LAV : WHITE, head, 0.02);
    }

  // ---------------------------------------------------------------- neck: ruff, shimenawa, shide, bell
  b.ring(neck.at(0.12), { count: 12, radius: 0.1, tilt: -65 }, (it) => b.spike(it, it, 0.13, 0.036, { color: LAV, sides: 5 }));
  b.ring(neck.at(0.34), { count: 10, radius: 0.08, tilt: -55 }, (it) => b.spike(it, it, 0.11, 0.034, { color: WHITE, sides: 5 }));

  const neckSurf = b.surface(neckTube);
  const ropePath = neckSurf.loop(neck.at(0.62), { lift: 0.012 });
  const rope = b.sweep(ropePath, 0.019, { color: "#e8d28e", sides: 6 });
  const ropeSurf = b.surface(rope);
  const nj = neck.joints[1];
  const bellHit = ropeSurf.around(neck.at(0.62).at).at(0, -25);
  if (bellHit) {
    b.part(new THREE.SphereGeometry(0.03, 9, 7), GOLD, { bone: nj, at: offset(bellHit, bellHit, 0.014) });
    b.part(new THREE.BoxGeometry(0.03, 0.004, 0.004), INK, {
      bone: nj,
      at: offset(bellHit, [0, -0.25, 1], 0.04),
    });
    b.cards([frame(offset(bellHit, [0, -1, 0.3], 0.05), [0, 1, 0])], TASSELTEX, {
      size: [0.04, 0.12],
      lean: 180,
      flow: [0, 0, 1],
      bone: nj,
    });
  }
  const shide: Pt[] = [
    [-0.02, 0],
    [0.02, 0],
    [0.02, -0.04],
    [0.04, -0.08],
    [0.04, -0.12],
    [0.0, -0.12],
    [0.0, -0.08],
    [-0.02, -0.04],
  ];
  for (const az of [-38, 38]) {
    const h = ropeSurf.around(neck.at(0.62).at).at(az, -8);
    if (h)
      b.extrude(shide, {
        at: offset(h, [0, 0, 1], 0.008),
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.004,
        color: "#ffffff",
        bone: nj,
      });
  }

  // ---------------------------------------------------------------- nine tails
  const TR: V3 = [0, 0.56, -0.4];
  for (let i = 0; i < 9; i++) {
    const d = (i - 4) / 4;
    const a = d * 1.38;
    const L = 0.66 + 0.1 * (1 - Math.abs(d));
    const u = [Math.sin(a), Math.cos(a)];
    const w = [Math.cos(a), -Math.sin(a)];
    const odd = i % 2;
    const P = (k: number, bend: number, z: number): V3 => [
      TR[0] + u[0] * k * L + w[0] * bend * L * d,
      TR[1] + u[1] * k * L + w[1] * bend * L * d,
      TR[2] + z,
    ];
    const path = catmull([
      P(0, 0, 0),
      P(0.3, 0.04, -0.1 - 0.04 * odd),
      P(0.66, 0.14, -0.2 - 0.07 * odd),
      P(1, 0.3, -0.26 - 0.08 * odd),
    ]);
    const chain = b.chain(`tailChain${i + 1}`, path, {
      parent: hips,
      names: (j: number) => `tail${i + 1}_${j + 1}`,
      role: "tail",
    });
    const tipPaint = cel(
      gradient(gradient("#fffaf1", "#d3c4ff", path.at(0.35), path.at(0.7)), "#9fe8ff", path.at(0.74), path.at(1)),
    );
    const scale = 0.92 + 0.12 * (1 - Math.abs(d));
    const ts = b.sweep(chain, [0.036, 0.075, 0.098, 0.098, 0.062, 0.0].map((r) => r * scale), { color: tipPaint, sides: 9 });
    void ts;
    // gold ring seated on the tail
    const bandRing = b.ring(chain.at(0.3), { count: 10, radius: 0.092 * scale });
    b.sweep(catmull(bandRing.items, { closed: true }), 0.008, { color: GOLD, sides: 5, bone: chain.joints[1] });
    // spirit flames
    const tip = path.at(0.97);
    const lastJoint = chain.joints[chain.joints.length - 1];
    flame([tip.x, tip.y - 0.02, tip.z], [0.2, 0.4], [FLAME_A, FLAME_B], lastJoint, 1.6);
    flame([tip.x, tip.y - 0.02, tip.z], [0.12, 0.24], [FLAME_B, FLAME_A], lastJoint, 1.4);
  }

  // ---------------------------------------------------------------- floating foxfire
  const orbs: V3[] = [
    [-0.62, 0.7, 0.62],
    [0.58, 0.95, 0.7],
    [-0.86, 0.55, -0.1],
    [0.88, 0.45, -0.3],
    [-0.55, 1.18, -0.55],
    [0.5, 1.28, -0.75],
    [-0.95, 0.4, 0.5],
  ];
  for (const p of orbs) {
    glow(b.part(new THREE.IcosahedronGeometry(0.028, 1), "#d9fbff", { bone: root, at: p, flat: true }), 1.7);
    flame([p[0], p[1] + 0.01, p[2]], [0.19, 0.34], [FLAME_A, FLAME_B], root, 1.5);
  }
  // motes
  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.5 + R() * 0.5;
    const col = i % 2 ? "#aef4ff" : "#d6c4ff";
    glow(
      b.part(new THREE.OctahedronGeometry(0.012 + R() * 0.008), col, {
        bone: root,
        at: [Math.cos(a) * rr, 0.35 + R() * 1.0, Math.sin(a) * rr],
        rotation: [R() * 90, R() * 90, 0],
      }),
      1.5,
    );
  }

  return b.root;
}
