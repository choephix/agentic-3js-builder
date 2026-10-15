import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import type { FrameInput } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { gradient, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A white spirit fox with crimson kumadori markings, gold bells and tassels, and nine fanned tails that burn with spirit flames, ringed by drifting foxfire wisps.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const WHITE = "#fff7ec";
const ICE = "#bfefff";
const RED = "#d92b3e";
const GOLD = "#f4b834";
const SOCK = "#2b2150";
const PINK = "#ff9ab0";
const MOUTH = "#6a1a36";
const CORE = "#e6fbff";

export default function build() {
  const b = createBuilder({ name: "nineTailedKitsune" });

  // ---------- paints ----------
  const markCoat = paint((p, n) => {
    if (p.y < 0.3 + 0.04 * zigzag(p.z / 0.03 + p.x / 0.05)) return SOCK;
    if (n.y > 0.6 && p.z < 0.45 && Math.abs(p.x) < 0.012 + 0.014 * zigzag(p.z / 0.07)) return RED;
    return WHITE;
  });
  const COAT = cel(markCoat);
  const SOCKC = cel(SOCK);
  const EAR = cel(paint((_p, _n, s) => (s[1] > 0.12 ? SOCK : WHITE)));

  // ---------- textures ----------
  const flameSvg = (outer: string, mid: string) =>
    svg(
      `<svg viewBox="0 0 64 128">
      <path d="M32 126 C6 100 6 70 26 48 C24 66 34 72 36 56 C38 38 30 22 40 2 C52 28 64 54 58 84 C56 108 46 120 32 126Z" fill="${outer}"/>
      <path d="M32 122 C16 104 16 82 30 66 C30 80 38 82 40 70 C46 84 48 100 32 122Z" fill="${mid}"/>
      <path d="M32 118 C24 106 26 92 34 84 C40 96 40 108 32 118Z" fill="#ffffff"/>
    </svg>`,
      { size: 128 },
    );
  const FLAME_C = flameSvg("#35c8ff", "#9feeff");
  const FLAME_V = flameSvg("#a35cff", "#ff9bf0");
  const TUFT = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 64 C3 42 9 20 16 0 C23 20 29 42 16 64Z" fill="#fffaf2" stroke="#e8d3c0" stroke-width="1.4"/><path d="M16 60 C12 40 14 24 16 10" stroke="#f1e2d3" stroke-width="1.2" fill="none"/></svg>`,
    { size: 128 },
  );
  const MARK = svg(
    `<svg viewBox="0 0 40 60"><path d="M20 2 C31 20 37 36 20 58 C3 36 9 20 20 2Z" fill="${RED}"/><circle cx="20" cy="36" r="6" fill="${GOLD}"/><path d="M20 10 C24 20 24 28 20 30" stroke="#ffd2da" stroke-width="2" fill="none"/></svg>`,
    { size: 128 },
  );
  const EYE = animeEye({ iris: "#ffc21a" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.72, -0.3], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.72, -0.3],
      [0, 0.76, 0.0],
      [0, 0.8, 0.3],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.8, 0.3],
      [0, 0.95, 0.45],
      [0, 1.05, 0.55],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.05, 0.55], dir: [0, -0.05, 1], role: "head" });
  const H = head.at.clone();
  const hp = (x: number, y: number, z: number): [number, number, number] => [H.x + x, H.y + y, H.z + z];
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.04, 0.02), aim: hp(0, -0.06, 0.3), role: "jaw" });
  const tailBase = b.joint("tailBase", { parent: hips, at: [0, 0.8, -0.5], dir: [0, 0.3, -1] });

  // ---------- body ----------
  const bodyTube = b.loft(
    [
      { at: [0, 0.7, -0.5], w: 0.3, h: 0.34 },
      { at: [0, 0.72, -0.25], w: 0.36, h: 0.4 },
      { at: [0, 0.76, 0.05], w: 0.34, h: 0.4 },
      { at: [0, 0.8, 0.35], w: 0.34, h: 0.42 },
    ],
    { bone: spine, color: COAT, name: "body" },
  );
  const neckTube = b.sweep(neck, [0.14, 0.1, 0.082], { color: COAT, name: "neck" });

  // ---------- head ----------
  const skullC = hp(0, 0.02, 0.07);
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
    bone: head,
    at: skullC,
    scale: [0.105, 0.09, 0.12],
    name: "skull",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), COAT, {
    bone: head,
    at: hp(0, -0.015, 0.2),
    scale: [0.05, 0.045, 0.12],
    name: "snout",
  });
  b.part(new THREE.SphereGeometry(0.022, 6, 5), INK, { bone: head, at: hp(0, -0.005, 0.315), scale: [1.1, 0.8, 0.9], name: "nose" });
  b.part(new THREE.SphereGeometry(1, 8, 6), MOUTH, {
    bone: head,
    at: hp(0, -0.045, 0.19),
    scale: [0.035, 0.012, 0.09],
    name: "mouth",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), COAT, {
    bone: jaw,
    at: hp(0, -0.068, 0.17),
    scale: [0.04, 0.022, 0.1],
    name: "lowerJaw",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.009, 0.035, 5), "#fffdf5", {
      bone: head,
      at: hp(s * 0.025, -0.06, 0.26),
      dir: [0, -1, 0],
      name: "fang",
    });
  }

  // ears, earrings, tassels
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.055, 0],
        [0.055, 0],
        [0.012, 0.2, "sharp"],
      ],
      {
        at: hp(s * 0.06, 0.08, 0.0),
        x: [s, 0, 0],
        y: [0, 1, -0.2],
        thickness: 0.02,
        bevel: 0.004,
        smoothing: 1,
        color: EAR,
        bone: head,
        name: "ear",
      },
    );
    b.extrude(
      [
        [-0.034, 0.012],
        [0.034, 0.012],
        [0.008, 0.15, "sharp"],
      ],
      {
        at: hp(s * 0.06, 0.082, 0.012),
        x: [s, 0, 0],
        y: [0, 1, -0.2],
        thickness: 0.012,
        smoothing: 1,
        color: PINK,
        bone: head,
        name: "earInner",
      },
    );
    b.part(new THREE.TorusGeometry(0.02, 0.004, 5, 10), GOLD, {
      bone: head,
      at: hp(s * 0.1, 0.045, -0.01),
      rotation: [0, 90, 0],
      name: "earring",
    });
    b.rod(hp(s * 0.1, 0.025, -0.01), hp(s * 0.1, -0.03, -0.01), 0.004, RED, { bone: head, sides: 5 });
    b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, { bone: head, at: hp(s * 0.1, -0.035, -0.01), name: "bead" });
  }

  // eyes, brow marks, forehead mark
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(skullC).at(s * 42, 6)!;
    b.decal(skin, EYE, { at: hit, size: [0.058, 0.08], mirror: s > 0, name: "eye" });
    b.sweep(
      skin.drape(
        catmull([hp(s * 0.075, 0.045, 0.12), hp(s * 0.1, 0.03, 0.07), hp(s * 0.11, 0.015, 0.01)]),
        { lift: 0.004 },
      ),
      [0.008, 0.002],
      RED,
      { caps: { start: "flat", end: "point" }, sides: 5, bone: head },
    );
  }
  b.decal(skin, MARK, { at: hp(0, 0.1, 0.09), dir: [0, 0.75, 0.65], size: [0.045, 0.07], name: "foreheadMark" });

  // whiskers
  for (const s of [1, -1])
    for (let j = 0; j < 3; j++)
      b.rod(hp(s * 0.05, -0.025, 0.24), hp(s * (0.2 + j * 0.02), -0.03 + (j - 1) * 0.045, 0.22 - 0.02 * j), [0.003, 0.001], "#ffffff", {
        bone: head,
        sides: 4,
      });

  // ---------- legs ----------
  const paw = (joint: ReturnType<typeof b.joint>, x: number, z: number) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), SOCKC, { bone: joint, at: [x, 0.035, z + 0.035], scale: [0.045, 0.035, 0.075], name: "paw" });
    for (const dx of [-0.022, 0, 0.022]) {
      b.part(new THREE.SphereGeometry(1, 6, 4), SOCKC, {
        bone: joint,
        at: [x + dx, 0.03, z + 0.095],
        scale: [0.02, 0.02, 0.028],
        name: "toe",
      });
      b.part(new THREE.ConeGeometry(0.007, 0.03, 4), INK, {
        bone: joint,
        at: [x + dx, 0.022, z + 0.13],
        dir: [0, -0.3, 1],
        name: "claw",
      });
    }
  };
  const flameFrames: FrameInput[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front
    const fpts = limb([s * 0.13, 0.68, 0.3], [s * 0.13, 0.04, 0.34], [0.33, 0.33], [[0, 0, -1]]);
    const front = b.chain(`legF${side}`, fpts, {
      parent: spine,
      names: [`shoulder${side}`, `elbow${side}`, `pawF${side}`],
      role: "leg",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), COAT, { bone: front.joints[0], at: [s * 0.14, 0.68, 0.3], scale: [0.1, 0.13, 0.12], name: "shoulder" });
    b.sweep(front, [0.07, 0.055, 0.04, 0.036], { color: COAT, name: "legF" });
    paw(front.joints[front.joints.length - 1], s * 0.13, 0.34);
    b.part(new THREE.TorusGeometry(0.052, 0.007, 5, 10), GOLD, {
      bone: front.joints[1],
      at: [s * 0.13, 0.3, 0.335],
      rotation: [90, 0, 0],
      name: "bracelet",
    });
    flameFrames.push(frame([s * 0.13, 0.1, 0.36], [0, 1, 0]));
    // hind
    const hpts = limb(
      [s * 0.14, 0.66, -0.42],
      [s * 0.14, 0.05, -0.5],
      [0.34, 0.34, 0.24],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hind = b.chain(`legH${side}`, hpts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), COAT, { bone: hind.joints[0], at: [s * 0.15, 0.62, -0.42], scale: [0.1, 0.17, 0.15], name: "thigh" });
    b.sweep(hind, [0.075, 0.06, 0.042, 0.036], { color: COAT, name: "legH" });
    paw(hind.joints[hind.joints.length - 1], s * 0.14, -0.5);
    flameFrames.push(frame([s * 0.14, 0.1, -0.47], [0, 1, 0]));
  }

  // ---------- coat details on body ----------
  const bodySkin = b.surface(bodyTube);
  for (const s of [1, -1]) {
    b.sweep(
      bodySkin.drape(
        catmull([
          [s * 0.2, 0.92, 0.28],
          [s * 0.2, 0.78, 0.27],
          [s * 0.2, 0.64, 0.3],
        ]),
        { lift: 0.004 },
      ),
      [0.014, 0.004],
      RED,
      { caps: { start: "flat", end: "point" }, sides: 5, bone: spine },
    );
    b.sweep(
      bodySkin.drape(
        catmull([
          [s * 0.16, 0.88, -0.34],
          [s * 0.19, 0.74, -0.3],
          [s * 0.17, 0.6, -0.34],
        ]),
        { lift: 0.004 },
      ),
      [0.014, 0.004],
      RED,
      { caps: { start: "flat", end: "point" }, sides: 5, bone: hips },
    );
  }

  // sash and neck rope
  b.sweep(bodySkin.loop(spine.joints[1], { lift: 0.015 }), 0.028, RED, { name: "sash" });
  b.sweep(bodySkin.loop(spine.joints[0], { lift: 0.02 }), 0.01, GOLD, { name: "sashCord" });
  const neckSkin = b.surface(neckTube);
  const rope = neckSkin.loop(neck.joints[1], { lift: 0.012 });
  b.sweep(rope, 0.014, RED, { name: "collar" });
  b.along(rope, 14, (at) => {
    b.part(new THREE.SphereGeometry(0.011, 5, 4), GOLD, { at, name: "collarBead" });
  });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), GOLD, { bone: neck.joints[1], at: rope.at(0.5), name: "bell" });
  b.part(new THREE.SphereGeometry(0.008, 5, 4), INK, { bone: neck.joints[1], at: rope.at(0.5), name: "bellSlot" });

  // fur ruff cards
  b.cards(
    neckSkin.scatter(50, { rng: rng(3), minDist: 0.035 }),
    TUFT,
    { size: [0.07, 0.11], lean: 60, bend: 25, vary: 0.25, spin: 20, rng: rng(4), name: "neckRuff" },
  );
  b.cards(
    bodySkin.scatter(40, { rng: rng(5), minDist: 0.04, filter: (h) => h.at.z > 0.2 && h.n.y < 0.5 && h.n.z > 0.2 }),
    TUFT,
    { size: [0.07, 0.12], lean: 60, bend: 25, vary: 0.25, rng: rng(6), name: "chestRuff" },
  );
  b.cards(
    skin.scatter(18, { rng: rng(7), minDist: 0.03, filter: (h) => Math.abs(h.n.x) > 0.6 && h.at.y < H.y + 0.03 && h.at.z < H.z + 0.1 }),
    TUFT,
    { size: [0.05, 0.08], lean: 75, bend: 20, vary: 0.2, rng: rng(8), name: "cheekTufts" },
  );

  // ---------- nine tails ----------
  const tipFrames: FrameInput[] = [];
  for (let i = 0; i < 9; i++) {
    const k = i - 4;
    const th = (k * 16 * Math.PI) / 180;
    const e0 = ((14 + (4 - Math.abs(k)) * 5) * Math.PI) / 180;
    let p = new THREE.Vector3(k * 0.014, 0.8, -0.5);
    const pts = [p.clone()];
    [0.32, 0.32, 0.3].forEach((len, j) => {
      const e = e0 + j * 0.25;
      const d = new THREE.Vector3(Math.sin(th) * Math.cos(e), Math.sin(e), -Math.cos(th) * Math.cos(e));
      p = p.clone().addScaledVector(d, len);
      pts.push(p);
    });
    const path = catmull(pts);
    const tail = b.chain(`tail${i + 1}`, path, {
      parent: tailBase,
      names: [`tail${i + 1}_1`, `tail${i + 1}_2`, `tail${i + 1}_3`],
      role: "tail",
    });
    b.sweep(tail, [0.06, 0.1, 0.115, 0.085, 0.03], {
      color: cel(gradient(WHITE, ICE, path.at(0.55), path.at(1))),
      caps: "point",
      name: "tail",
    });
    const mid = tail.at(0.5);
    b.part(new THREE.TorusGeometry(0.123, 0.009, 5, 12), GOLD, {
      bone: tail.joints[1],
      at: mid.at,
      dir: mid.tangent,
      axis: "z",
      name: "tailRing",
    });
    const low = tail.at(0.75);
    b.part(new THREE.TorusGeometry(0.092, 0.007, 5, 12), RED, {
      bone: tail.joints[2],
      at: low.at,
      dir: low.tangent,
      axis: "z",
      name: "tailBand",
    });
    const tip = tail.at(0.97);
    for (let c = 0; c < 3; c++) tipFrames.push(tip);
  }
  glow(
    b.cards(tipFrames, [FLAME_V, FLAME_C], {
      size: [0.22, 0.34],
      cross: true,
      bend: 20,
      flow: [0, 1, 0],
      vary: 0.25,
      spin: 90,
      rng: rng(5),
      name: "tailFlames",
    }),
    1.3,
  );

  // ---------- spirit flames ----------
  const backHits = bodySkin.scatter(7, {
    rng: rng(11),
    minDist: 0.12,
    filter: (h) => h.n.y > 0.85 && Math.abs(h.at.x) < 0.08 && h.at.z < 0.35,
  });
  glow(
    b.cards(backHits, FLAME_C, { size: [0.07, 0.14], cross: true, flow: [0, 0, -1], vary: 0.3, rng: rng(12), name: "backFlames" }),
    1.2,
  );
  glow(b.cards(flameFrames, FLAME_C, { size: [0.07, 0.13], cross: true, flow: [0, 0, -1], bone: hips, name: "pawFlames" }), 1.2);

  const wisps = [
    [-0.75, 0.5, 0.55],
    [0.8, 0.75, 0.45],
    [0.55, 1.35, 0.15],
    [-0.6, 1.25, 0.3],
    [0.35, 0.25, 0.95],
    [-0.4, 0.3, 0.9],
    [0.0, 1.55, 0.7],
  ];
  const wispFrames: FrameInput[] = [];
  for (const w of wisps) {
    glow(
      b.part(new THREE.SphereGeometry(0.035, 6, 5), CORE, { bone: hips, at: w, name: "wispCore" }),
      1.5,
    );
    wispFrames.push(frame([w[0], w[1] + 0.02, w[2]], [0, 1, 0]));
  }
  glow(
    b.cards(wispFrames, [FLAME_C, FLAME_V], {
      size: [0.12, 0.2],
      cross: true,
      bend: 15,
      flow: [0, 1, 0],
      bone: hips,
      rng: rng(21),
      name: "wispFlames",
    }),
    1.3,
  );

  return b.root;
}
