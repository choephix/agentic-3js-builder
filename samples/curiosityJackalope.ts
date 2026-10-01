import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { lerp, offset, rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { limb } from "../src/ik";
import { countershade, grain, mottle } from "../src/paint";
import { svg } from "../src/texture";
import { metal } from "../kits/clockwork";
import { glow } from "../kits/glow";

export const meta = {
  name: "Cabinet of Curiosities: Jackalope",
  description:
    "A mounted jackalope — jackrabbit with branching antlers — rearing on a mossy rock atop a turned mahogany plinth with brass label plate.",
};

// Palette
const FUR = "#8a7358";
const FUR_DARK = "#5e4c38";
const FUR_PALE = "#c4ad8a";
const BELLY = "#d8c8ab";
const INNER_EAR = "#c99e8e";
const ANTLER = "#cbb994";
const ANTLER_DARK = "#8f7c5c";
const NOSE = "#3a2a24";
const MAHOG = "#4a2418";
const MAHOG_DARK = "#2e150d";
const ROCK = "#6f6f68";
const ROCK_DARK = "#4c4c46";
const MOSS = "#5a7038";
const MOSS_DARK = "#3d5226";
const PAPER = "#e8dcbd";
const EYE = "#1c1410";

const coat = countershade(mottle(FUR, FUR_DARK, { size: 0.05, contrast: 0.5, seed: 11 }), BELLY, { level: -0.25 });
const furGrain = grain(coat, FUR_PALE, { size: 0.02, axis: "y", seed: 5 });
// turned mahogany: use grain paint directly over dark base
const wood = grain(MAHOG, MAHOG_DARK, { size: 0.015, axis: "y", seed: 21 });
const rockPaint = mottle(ROCK, ROCK_DARK, { size: 0.06, contrast: 0.6, seed: 31 });
const mossPaint = mottle(MOSS, MOSS_DARK, { size: 0.03, contrast: 0.7, seed: 44 });
const brass = metal("brass", { tarnish: 0.55, polish: 0.25, size: 0.03, seed: 7 });
const antlerPaint = grain(ANTLER, ANTLER_DARK, { size: 0.008, axis: "y", seed: 13 });

const labelTexture = svg(
  `<svg viewBox="0 0 256 96" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="252" height="92" rx="4" fill="#e8dcbd" stroke="#6e5a2e" stroke-width="3"/>
    <rect x="10" y="10" width="236" height="76" fill="none" stroke="#2b2118" stroke-width="1"/>
    <text x="128" y="40" font-family="serif" font-style="italic" font-size="26" text-anchor="middle" fill="#2b2118">Lepus temperamentalus</text>
    <text x="128" y="62" font-family="serif" font-size="15" letter-spacing="4" text-anchor="middle" fill="#2b2118">JACKALOPE  ·  1897</text>
    <line x1="60" y1="70" x2="196" y2="70" stroke="#2b2118" stroke-width="1"/>
  </svg>`,
  { size: 512 },
);

const eyeTexture = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#1c1410"/>
    <circle cx="32" cy="32" r="20" fill="#7a4d22"/>
    <circle cx="32" cy="32" r="9" fill="#0a0806"/>
    <circle cx="25" cy="23" r="9" fill="#f5ead0"/>
    <circle cx="22" cy="20" r="2.5" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

const furTuft = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#c4ad8a" stroke-width="3" stroke-linecap="round">
      <path d="M16 64 C14 44 10 30 4 12"/>
      <path d="M16 64 C16 42 16 26 16 6"/>
      <path d="M16 64 C18 44 22 30 28 12"/>
    </g>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "curiosityJackalope" });

  // ---------- Scenery: plinth + rock (plain, on root joint for stability) ----------
  const root = b.joint("mount", { at: [0, 0.02, 0] });

  // Turned mahogany plinth: stacked lathe profile. Base 0.34 x 0.34 footprint, ~0.16 tall.
  b.lathe(
    [
      [0, 0],
      [0.17, 0],
      [0.17, 0.02],
      [0.13, 0.035],
      [0.115, 0.05],
      [0.13, 0.065],
      [0.145, 0.09],
      [0.15, 0.115],
      [0.165, 0.13],
      [0.165, 0.15],
      [0, 0.15],
    ],
    { at: [0, 0.0, 0], bone: root, segments: 20, smoothing: 1, color: wood },
  );
  // brass trim ring around plinth top
  b.lathe(
    [
      [0.15, 0],
      [0.166, 0],
      [0.166, 0.012],
      [0.15, 0.012],
    ],
    { at: [0, 0.125, 0], bone: root, segments: 20, color: brass },
  );
  // brass label plate: curved plate on front face
  b.part(new THREE.BoxGeometry(0.16, 0.055, 0.006), brass, {
    bone: root,
    at: [0, 0.075, 0.148],
    rotation: [0, 0, 0],
  });
  b.part(new THREE.PlaneGeometry(0.15, 0.05), "#ffffff", {
    bone: root,
    at: [0, 0.075, 0.152],
    dir: [0, 0, 1],
    axis: "z",
    texture: labelTexture,
  });
  // label screws
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.004, 8, 6), brass, {
      bone: root,
      at: [s * 0.068, 0.075, 0.152],
    });
  }

  // Mossy rock: lumpy loft of stacked blobs, ~0.22 wide, top at ~0.30
  const rockBase: [number, number, number][] = [
    [0, 0.15, 0.02],
    [0.02, 0.2, 0.03],
    [-0.01, 0.25, 0.0],
    [0.0, 0.29, 0.01],
  ];
  b.sweep(catmull(rockBase), [0.11, 0.085, 0.1, 0.055], {
    bone: root,
    color: rockPaint,
    section: { ngon: 7 },
  });
  // rock facets: extra lumps
  const rr = rng(12);
  for (let i = 0; i < 7; i++) {
    const a = rr() * Math.PI * 2;
    const px = Math.cos(a) * 0.07 * (0.5 + rr() * 0.6);
    const pz = Math.sin(a) * 0.06 * (0.5 + rr() * 0.6);
    const py = 0.17 + rr() * 0.09;
    const sz = 0.03 + rr() * 0.035;
    b.part(new THREE.DodecahedronGeometry(sz, 0), rockPaint, {
      bone: root,
      at: [px, py, pz],
      rotation: [rr() * 40, rr() * 40, rr() * 40],
      flat: true,
    });
  }
  // moss patches: flattened mossy blobs on rock
  const rockMeshes = b.surface(root);
  const mossHits = rockMeshes.scatter(26, {
    rng: rng(99),
    minDist: 0.035,
    filter: (h) => h.at.y > 0.16 && h.at.y < 0.3 && h.n.y > -0.2,
  });
  for (const h of mossHits) {
    b.stick(new THREE.SphereGeometry(0.011, 7, 5), mossPaint, h, {
      embed: 0.45,
      bone: root,
    });
  }

  // ---------- Creature skeleton ----------
  // Rearing jackrabbit: hind feet planted on rock (~0.28), body rising to head at ~0.62.
  const hips = b.joint("hips", { at: [0, 0.38, -0.02], dir: [0, 0.5, 0.35], role: "spine" });
  const spinePts = limb([0, 0.38, -0.02], [0, 0.52, 0.03], [0.08, 0.08], [[0, 0, 1]]);
  const spine = b.chain("spine", spinePts, {
    parent: hips,
    names: ["spine", "chest"],
    role: "spine",
  });
  const neckPts = limb([0, 0.52, 0.03], [0, 0.58, 0.06], [0.07], [[0, 0, 1]]);
  const neck = b.chain("neck", neckPts, { parent: spine.joints[1], names: ["neck"], role: "neck" });
  const headJ = b.joint("head", {
    parent: neck.joints[0],
    at: [0, 0.6, 0.075],
    dir: [0, 0.25, 1],
    role: "head",
  });
  const jawJ = b.joint("jaw", {
    parent: headJ,
    at: headJ.local([0, 0.045, -0.035]),
    aim: headJ.local([0, -0.05, 0.16]),
    role: "jaw",
  });

  // body tube: rump -> chest -> neck base
  const bodyPath = catmull([
    [0, 0.35, -0.08],
    [0, 0.4, -0.03],
    [0, 0.47, 0.01],
    [0, 0.53, 0.04],
    [0, 0.585, 0.065],
  ]);
  const body = b.sweep(bodyPath, [0.075, 0.085, 0.07, 0.055, 0.045], {
    bone: [hips, spine, neck],
    color: furGrain,
  });

  // head: skull sphere + tapered muzzle
  b.part(new THREE.SphereGeometry(0.052, 12, 9), furGrain, {
    bone: headJ,
    at: headJ.local([0, 0.01, 0.015]),
    scale: [1, 0.95, 1.05],
  });
  const muzzlePath = bezier(
    headJ.local([0, 0.04, -0.005]),
    headJ.local([0, 0.085, -0.012]),
    headJ.local([0, 0.125, -0.018]),
  );
  b.sweep(muzzlePath, [0.032, 0.02], { bone: headJ, color: furGrain });
  // nose + mouth
  b.part(new THREE.SphereGeometry(0.009, 8, 6), NOSE, {
    bone: headJ,
    at: headJ.local([0, 0.128, -0.012]),
    scale: [1.2, 0.8, 0.8],
  });
  // lower jaw
  const jawPath = bezier(jawJ.local([0, 0, -0.01]), jawJ.local([0, -0.012, 0.05]), jawJ.local([0, -0.014, 0.1]));
  b.sweep(jawPath, [0.02, 0.012], { bone: jawJ, color: furGrain });
  b.part(new THREE.SphereGeometry(0.008, 8, 6), PAPER, {
    bone: jawJ,
    at: jawJ.local([0, -0.012, 0.095]),
    scale: [1.4, 0.5, 1],
  });
  // teeth hint
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.006, 0.012, 0.004), PAPER, {
      bone: jawJ,
      at: jawJ.local([s * 0.006, -0.004, 0.098]),
    });
  }

  // glassy eyes (glow slightly)
  for (const s of [1, -1]) {
    const eye = b.part(new THREE.SphereGeometry(0.019, 10, 8), EYE, {
      bone: headJ,
      at: headJ.local([s * 0.038, 0.038, 0.008]),
      dir: headJ.dir([s * 0.7, 0.25, 0.7]),
      axis: "z",
      texture: eyeTexture,
    });
    glow(eye, 0.55);
    // brow tuft
    b.spike(eye, eye, 0.012, 0.009, { color: FUR_DARK });
  }

  // long ears: extruded leaf shapes
  const earOutline: [number, number][] = [
    [0, 0],
    [0.028, 0.03],
    [0.03, 0.09],
    [0.018, 0.15],
    [0, 0.165],
    [-0.018, 0.15],
    [-0.03, 0.09],
    [-0.028, 0.03],
  ];
  for (const s of [1, -1]) {
    const earBase = headJ.local([s * 0.028, -0.005, 0.05]);
    const ear = b.extrude(earOutline, {
      at: earBase,
      x: [s * 1, 0.15, 0.25],
      y: [s * -0.12, 1, -0.18],
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 1,
      color: furGrain,
      bone: headJ,
    });
    // inner ear decal-ish inset
    b.extrude(
      [
        [0, 0.02],
        [0.014, 0.05],
        [0.012, 0.11],
        [0, 0.135],
        [-0.012, 0.11],
        [-0.014, 0.05],
      ],
      {
        at: offset(earBase, [0, 1, 0.6], 0.008),
        x: [s * 1, 0.15, 0.25],
        y: [s * -0.12, 1, -0.18],
        thickness: 0.004,
        smoothing: 1,
        color: INNER_EAR,
        bone: headJ,
      },
    );
    void ear;
  }

  // ---------- Antlers (branching, pronghorn-like) ----------
  for (const s of [1, -1]) {
    const base = headJ.local([s * 0.026, 0.005, 0.055]);
    // main beam: up, outward, slightly back (world-space dirs; head local y is forward)
    const beam = catmull([
      base,
      offset(base, [s * 0.55, 1, -0.3], 0.07),
      offset(base, [s * 0.7, 1, -0.4], 0.14),
      offset(base, [s * 0.7, 1, -0.35], 0.21),
    ]);
    const antler = b.chain(`antler${s > 0 ? "R" : "L"}`, beam, {
      parent: headJ,
      count: 3,
      role: "fan",
    });
    b.sweep(antler, [0.011, 0.009, 0.006], { color: antlerPaint });
    // tines: forward-pointing prongs off the front of the beam
    const tineDefs: [number, [number, number, number], number][] = [
      [0.3, [s * 0.35, 0.3, 1], 0.065],
      [0.58, [s * 0.4, 0.4, 1], 0.075],
      [0.82, [s * 0.25, 0.55, 0.9], 0.06],
    ];
    for (let i = 0; i < tineDefs.length; i++) {
      const [t, dir, len] = tineDefs[i];
      const bp = antler.at(t);
      const tip = offset(bp.at, dir, len);
      const tinePath = bezier(bp.at, lerp(bp.at, tip, 0.55), tip);
      b.sweep(tinePath, [0.007, 0.001], { bone: bp.bone, color: antlerPaint });
    }
    // main tip spike continuing up-back
    const tipPt = antler.at(1);
    b.spike(tipPt.at, [s * 0.45, 1, -0.3], 0.035, 0.005, { color: antlerPaint });
  }

  // ---------- Legs: rearing jackrabbit ----------
  // hind legs: hip socket -> foot on rock
  for (const s of [1, -1]) {
    const side = s > 0 ? "R" : "L";
    const hipSocket: [number, number, number] = [s * 0.055, 0.37, -0.03];
    const foot: [number, number, number] = [s * 0.075, 0.3, 0.03];
    const pts = limb(
      hipSocket,
      foot,
      [0.09, 0.09, 0.05],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const leg = b.chain(`legH${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.075, 0.285, 0.05],
    });
    b.sweep(leg, [0.038, 0.028, 0.02], { color: furGrain });
    // long hind foot forward on rock
    const footPath = bezier(foot, [s * 0.078, 0.29, 0.07], [s * 0.08, 0.288, 0.12]);
    b.sweep(footPath, [0.02, 0.013], { bone: leg.joints[2], color: furGrain });
    // toes
    for (let ti = -1; ti <= 1; ti++) {
      const toeTip: [number, number, number] = [s * 0.08 + ti * 0.014, 0.286, 0.145];
      b.sweep(
        bezier([s * 0.08 + ti * 0.01, 0.292, 0.115], [s * 0.08 + ti * 0.012, 0.288, 0.13], toeTip),
        [0.007, 0.004],
        {
          bone: leg.joints[2],
          color: furGrain,
        },
      );
    }
  }
  // forelegs: small, held up against chest (begging pose)
  for (const s of [1, -1]) {
    const side = s > 0 ? "R" : "L";
    const sh: [number, number, number] = [s * 0.05, 0.5, 0.045];
    const paw: [number, number, number] = [s * 0.03, 0.44, 0.1];
    const pts = limb(sh, paw, [0.06, 0.055], [[0, 0, 1]]);
    const arm = b.chain(`legF${side}`, pts, {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.02, 0.015], { color: furGrain });
    b.part(new THREE.SphereGeometry(0.016, 8, 6), furGrain, {
      bone: arm.joints[1],
      at: paw,
      scale: [0.8, 1.1, 1],
    });
    // tiny digits
    for (let di = -1; di <= 1; di++) {
      b.spike(frame([s * 0.03 + di * 0.008, 0.432, 0.108], [0, -0.5, 1]), [0, -0.5, 1], 0.018, 0.005, {
        color: furGrain,
      });
    }
  }

  // cottontail
  const tailBase = b.joint("tail1", {
    parent: hips,
    at: [0, 0.37, -0.095],
    dir: [0, -0.4, -1],
    role: "tail",
  });
  const tailPath = bezier([0, 0.37, -0.095], [0, 0.345, -0.14], [0, 0.35, -0.17]);
  b.sweep(tailPath, [0.035, 0.028], { bone: tailBase, color: FUR_PALE });

  // fur tuft cards on cheeks, chest, rump
  const bodySurf = b.surface(body);
  const tuftHits = bodySurf.scatter(60, {
    rng: rng(4),
    minDist: 0.03,
    filter: (h) => Math.abs(h.n.x) > 0.4,
  });
  b.cards(tuftHits, furTuft, {
    size: [0.014, 0.028],
    lean: 70,
    bend: 15,
    vary: 0.4,
    rng: rng(5),
    color: FUR_PALE,
  });
  // whiskers
  for (const s of [1, -1]) {
    for (let w = 0; w < 3; w++) {
      const wbase = headJ.local([s * 0.02, 0.1, -0.015 + w * 0.006]);
      const wtip = headJ.local([s * (0.09 + w * 0.01), 0.17, -0.02 + w * 0.008]);
      b.sweep(bezier(wbase, lerp(wbase, wtip, 0.5), wtip), [0.0012, 0.0004], {
        bone: headJ,
        color: FUR_PALE,
      });
    }
  }

  return b.root;
}
