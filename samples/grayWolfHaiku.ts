import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { Paint, countershade, gradient, grain, mix, mottle, paint, rgb, smoothstep } from "../src/paint";
import type { ColorInput } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Gray Wolf, Alert",
  description:
    "A grey wolf standing alert: head raised, ears pricked, tail level. Chunky hand-painted build with heavy shoulders, oversized paws and a painted slate coat over a cream underside, amber eyes, a scar across the flank, and a worn leather collar with brass rivets and a bone fang charm.",
  style: "Blizzard/Warcraft",
  commit: "b816db2",
};

// Palette: a saturated slate-blue coat, warm cream underside, black points, worn leather and brass.
const COAT_DK = "#38506a";
const COAT_MD = "#8aa2b8";
const COAT_LT = "#d2e4f4";
const CREAM = "#eee3c8";
const SOCK = "#1e2633";
const SHADOW = "#1c2636";
const GLINT = "#e4f1ff";
const BLACK = "#121419";
const PAD = "#2a2225";
const BONE = "#eadfc6";
const LEATHER = "#6d4528";
const LEATHER_DK = "#3b2414";
const BRASS = "#d4a84f";
const EAR_IN = "#d9c7a4";

// One key light, upper front left: every painted surface reads its shading from the same direction.
const LIGHT = new THREE.Vector3(0.35, 0.85, 0.45).normalize();

/** A painted gradient: shadow on the side away from the light, a soft glint where it faces the light. */
function shaded(base: ColorInput, glint = 0.5): Paint {
  return paint((p, n, s) => {
    const c = base instanceof Paint ? base.at(p, n, s) : rgb(base);
    const d = n.dot(LIGHT);
    const lit = smoothstep(-0.4, 0.8, d);
    const body = mix(SHADOW, c, 0.45 + 0.55 * lit);
    return mix(body, GLINT, glint * 0.5 * smoothstep(0.6, 0.98, d));
  });
}

const EYE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40">
<path d="M2 20 Q32 -4 62 20 Q32 44 2 20Z" fill="#14100c"/>
<path d="M7 20 Q32 4 57 20 Q32 36 7 20Z" fill="#f5b424"/>
<path d="M7 20 Q32 10 57 20 Q32 26 7 20Z" fill="#ffd66a"/>
<path d="M8 22 Q32 31 56 22" stroke="#8a4a14" stroke-width="2" fill="none"/>
<ellipse cx="32" cy="20" rx="3" ry="9" fill="#0c0906"/>
<circle cx="26" cy="15" r="2.2" fill="#fff8e6"/>
</svg>`;

// A tuft of guard hair: tapered strands, tinted by the card colour.
const TUFT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 80">
<path d="M20 80 C13 60 14 30 20 8 C26 30 27 60 20 80Z" fill="#ffffff"/>
<path d="M8 76 C5 56 9 36 14 22 C15 44 13 60 8 76Z" fill="#d0d0d0"/>
<path d="M32 76 C29 58 31 42 37 30 C37 48 35 62 32 76Z" fill="#bdbdbd"/>
</svg>`;

// An old scar: two pale cuts with a dark edge.
const SCAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32">
<path d="M4 24 L30 8" stroke="#3a2a22" stroke-width="5" stroke-linecap="round"/>
<path d="M4 24 L30 8" stroke="#dcaca0" stroke-width="2.4" stroke-linecap="round"/>
<path d="M14 30 L40 16" stroke="#3a2a22" stroke-width="4" stroke-linecap="round"/>
<path d="M14 30 L40 16" stroke="#dcaca0" stroke-width="1.8" stroke-linecap="round"/>
</svg>`;

const EAR: OutlinePoint[] = [
  [-0.042, 0],
  [0.042, 0],
  [0.032, 0.08],
  [0, 0.115, "sharp"],
  [-0.032, 0.08],
];
const EAR_INNER: OutlinePoint[] = [
  [-0.025, 0.006],
  [0.025, 0.006],
  [0.017, 0.08],
  [0, 0.1, "sharp"],
  [-0.017, 0.08],
];
const FANG: OutlinePoint[] = [
  [-0.022, 0.022],
  [0.022, 0.022],
  [0.012, -0.022],
  [0, -0.055, "sharp"],
  [-0.012, -0.022],
];

export default function build() {
  const b = createBuilder({ name: "grayWolf" });

  // ---- paints -------------------------------------------------------------------------------------------
  const mottled = mottle(COAT_DK, COAT_MD, { size: 0.09, contrast: 0.5, seed: 11 });
  const streaks = grain(COAT_MD, COAT_LT, { size: 0.02, axis: "z", seed: 3 });
  const pelt = paint((p, n, s) => {
    const dorsal = smoothstep(0.09, 0.02, Math.abs(p.x)) * smoothstep(0.3, 0.9, n.y);
    const bib = smoothstep(0.22, 0.32, p.z) * smoothstep(0.8, 0.7, p.y) * smoothstep(0.1, 0.5, n.z);
    const base = mix(mix(mottled.at(p, n, s), streaks.at(p, n, s), 0.3), COAT_DK, dorsal * 0.5);
    return mix(base, CREAM, 0.9 * bib);
  });
  const coat = shaded(countershade(pelt, CREAM, { level: -0.3, soft: 0.5 }), 0.5);
  // Dark saddle over the top of the muzzle, and a warpaint eyeline swept back from each eye.
  const headPaint = paint((p, n, s) => {
    const saddle = smoothstep(0.35, 0.75, n.y) * smoothstep(0.66, 0.76, p.z);
    const eyeline =
      smoothstep(0.035, 0, Math.abs(p.y - 0.99)) * smoothstep(0.5, 0.56, p.z) * smoothstep(0.66, 0.6, p.z) * smoothstep(0.04, 0.08, Math.abs(p.x));
    return mix(mix(coat.at(p, n, s), COAT_DK, 0.85 * saddle), BLACK, 0.7 * eyeline);
  });
  const jawPaint = shaded(CREAM, 0.3);
  const earPaint = shaded(COAT_DK, 0.4);
  const browPaint = shaded(COAT_DK, 0.3);
  const sock = (x: number, z: number) => gradient(coat, SOCK, [x, 0.52, z], [x, 0.14, z]);
  const pawPaint = shaded(SOCK, 0.15);
  const leatherPaint = mottle(LEATHER, LEATHER_DK, { size: 0.02, contrast: 0.6, seed: 5 });

  const tuft = svg(TUFT_SVG, { size: 128 });
  const eyeTex = svg(EYE_SVG, { size: 256 });
  const scarTex = svg(SCAR_SVG, { size: 128 });

  // ---- skeleton: hips, spine, neck, head ----------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.77, -0.14], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.76, -0.36], [0, 0.77, -0.14], [0, 0.76, 0.06], [0, 0.73, 0.23], [0, 0.7, 0.34]]), {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "spine4", "chest"],
    role: "spine",
  });
  const chest = spine.tip ?? spine.joints[spine.joints.length - 1];

  const neck = b.chain("neck", catmull([[0, 0.86, 0.26], [0, 0.93, 0.38], [0, 0.97, 0.47]]), {
    parent: chest,
    names: ["neckA", "neckB", "neckTip"],
    role: "neck",
  });
  const neckTip = neck.tip ?? neck.joints[neck.joints.length - 1];

  const head = b.joint("head", { parent: neckTip, at: [0, 0.96, 0.52], aim: [0, 0.92, 0.9], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.88, 0.64], aim: [0, 0.86, 0.86], role: "jaw" });

  // ---- torso, neck, head --------------------------------------------------------------------------------
  const torso = b.loft(
    [
      { at: [0, 0.76, -0.36], w: 0.3, h: 0.34 },
      { at: [0, 0.77, -0.14], w: 0.34, h: 0.37 },
      { at: [0, 0.76, 0.06], w: 0.36, h: 0.39 },
      { at: [0, 0.73, 0.23], w: 0.4, h: 0.43 },
      { at: [0, 0.7, 0.34], w: 0.42, h: 0.46 },
    ],
    { bone: spine, color: coat },
  );

  const neckTube = b.sweep(neck, (t: number): [number, number] => [0.1 - 0.02 * t, 0.095 - 0.02 * t], { color: coat });

  // A broad skull that narrows over a short, deep wolf muzzle (about two-thirds of the skull's length).
  const headSweep = b.sweep(
    catmull([
      [0, 0.97, 0.42],
      [0, 0.99, 0.52],
      [0, 0.98, 0.6],
      [0, 0.955, 0.67],
      [0, 0.935, 0.74],
      [0, 0.92, 0.8],
      [0, 0.905, 0.84],
    ]),
    (t: number): [number, number] => {
      const k = smoothstep(0.45, 0.95, t);
      return [0.108 - 0.05 * k, 0.1 - 0.05 * k];
    },
    { bone: head, color: headPaint },
  );

  // Cheek ruff volumes, nose, teeth.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.055, 10, 8).scale(0.85, 0.8, 1.4).translate(s * 0.075, 0.94, 0.63), coat, {
      bone: head,
      at: [0, 0, 0],
    });
  }
  b.part(new THREE.SphereGeometry(0.03, 10, 8).scale(1.2, 0.85, 1.0).translate(0, 0.9, 0.85), BLACK, {
    bone: head,
    at: [0, 0, 0],
  });
  for (const s of [1, -1]) {
    b.spike([s * 0.012, 0.87, 0.76], [0, -1, 0], 0.03, 0.006, { color: BONE, bone: head });
  }

  b.sweep(catmull([[0, 0.88, 0.64], [0, 0.87, 0.74], [0, 0.86, 0.8]]), [0.04, 0.02], { bone: jaw, color: jawPaint });
  for (const s of [1, -1]) {
    b.spike([s * 0.01, 0.855, 0.78], [0, 1, 0], 0.026, 0.006, { color: BONE, bone: jaw });
  }

  // Eyes on the skull sides, with a heavy brow ridge over each.
  for (const s of [1, -1]) {
    b.decal(headSweep, eyeTex, { at: [s * 0.09, 0.99, 0.58], dir: [s, 0.1, 0.4], size: [0.085, 0.036], bone: head });
    b.sweep(catmull([[s * 0.05, 1.0, 0.5], [s * 0.08, 1.01, 0.57], [s * 0.088, 1.0, 0.64]]), [0.02, 0.012], {
      bone: head,
      color: browPaint,
    });
  }

  // Ears: a pricked pair on their own joints, dark outside and cream inside.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.042, 0.99, 0.45],
      aim: [s * 0.042, 1.08, 0.49],
      role: "hinge",
    });
    b.extrude(EAR, { at: [s * 0.042, 0.99, 0.45], x: [1, 0, 0], thickness: 0.03, bevel: 0.007, color: earPaint, bone: ear });
    b.extrude(EAR_INNER, { at: [s * 0.042, 0.995, 0.462], x: [1, 0, 0], thickness: 0.008, bevel: 0.003, color: EAR_IN, bone: ear });
  }

  // A cut across the left flank.
  b.decal(torso, scarTex, { at: [0.2, 0.8, 0.14], dir: [1, 0.12, 0.2], size: [0.1, 0.05] });

  // ---- legs and paws ------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = 0.14 * s;

    const fore = b.chain(
      `foreleg${side}`,
      catmull([[x, 0.8, 0.27], [x, 0.42, 0.25], [x, 0.13, 0.27], [x, 0.045, 0.36]]),
      { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`], role: "leg" },
    );
    b.sweep(fore, [0.09, 0.08, 0.056, 0.046], { color: sock(x, 0.27) });
    const foreTip = fore.tip ?? fore.joints[fore.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.065, 10, 8).scale(1.0, 0.62, 1.25).translate(x, 0.04, 0.37), pawPaint, {
      bone: foreTip,
      at: [0, 0, 0],
    });
    b.part(new THREE.SphereGeometry(0.022, 8, 6).scale(1.4, 0.35, 1.1).translate(x, 0.006, 0.34), PAD, {
      bone: foreTip,
      at: [0, 0, 0],
    });
    for (const dx of [-0.028, 0, 0.028]) {
      b.part(new THREE.SphereGeometry(0.024, 8, 6).translate(x + dx, 0.026, 0.41), pawPaint, { bone: foreTip, at: [0, 0, 0] });
      b.spike([x + dx, 0.03, 0.43], [0, -0.3, 1], 0.03, 0.007, { color: BONE, bone: foreTip });
    }

    const hind = b.chain(
      `hindleg${side}`,
      catmull([[x, 0.78, -0.22], [x * 1.07, 0.43, -0.12], [x * 0.93, 0.14, -0.34], [x * 0.9, 0.045, -0.3]]),
      { parent: hips, names: [`hip${side}`, `stifle${side}`, `hock${side}`, `pawH${side}`], role: "leg" },
    );
    b.sweep(hind, [0.112, 0.096, 0.06, 0.047], { color: sock(x, -0.2) });
    const hindTip = hind.tip ?? hind.joints[hind.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.062, 10, 8).scale(1.0, 0.62, 1.25).translate(x * 0.9, 0.04, -0.27), pawPaint, {
      bone: hindTip,
      at: [0, 0, 0],
    });
    b.part(new THREE.SphereGeometry(0.022, 8, 6).scale(1.4, 0.35, 1.1).translate(x * 0.9, 0.006, -0.3), PAD, {
      bone: hindTip,
      at: [0, 0, 0],
    });
    for (const dx of [-0.028, 0, 0.028]) {
      b.part(new THREE.SphereGeometry(0.024, 8, 6).translate(x * 0.9 + dx, 0.026, -0.23), pawPaint, { bone: hindTip, at: [0, 0, 0] });
      b.spike([x * 0.9 + dx, 0.03, -0.21], [0, -0.3, 1], 0.03, 0.007, { color: BONE, bone: hindTip });
    }
  }

  // ---- tail: carried level, a black brush at the tip -----------------------------------------------------
  const tail = b.chain("tail", catmull([[0, 0.77, -0.36], [0, 0.76, -0.52], [0, 0.72, -0.66], [0, 0.68, -0.8]]), {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tailTip"],
    role: "tail",
  });
  const tailTube = b.sweep(tail, [0.065, 0.078, 0.062, 0.032], {
    bands: [
      [0.86, coat],
      [1, BLACK],
    ],
  });

  // ---- leather collar, brass rivets, bone fang charm ----------------------------------------------------
  const nk = neck.at(0.55);
  const ring: THREE.Vector3[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    ring.push(
      new THREE.Vector3()
        .copy(nk.at)
        .addScaledVector(nk.normal, Math.cos(a) * 0.096)
        .addScaledVector(nk.binormal, Math.sin(a) * 0.101),
    );
  }
  const collar = catmull(ring, { closed: true });
  b.sweep(collar, 0.014, { color: leatherPaint });
  b.along(collar, 14, (at) => b.stick(new THREE.SphereGeometry(0.012, 6, 4), BRASS, at, { embed: 0.3 }));

  let front = ring[0];
  for (const r of ring) if (r.z > front.z) front = r;
  b.extrude(FANG, {
    at: [front.x, front.y - 0.04, front.z + 0.012],
    x: [1, 0, 0],
    thickness: 0.012,
    bevel: 0.003,
    color: BONE,
    bone: neck.joints[1],
  });

  // ---- fur cards: mane behind the head, cheek ruff, body coat, tail brush --------------------------------
  const neckHits = b.surface(neckTube).scatter(160, {
    rng: rng(5),
    minDist: 0.03,
    filter: (h) => h.n.y > -0.35 && h.at.z < 0.4 && h.at.y < 0.98,
  });
  b.cards(neckHits, tuft, { size: [0.055, 0.1], lean: 20, bend: 15, vary: 0.25, rng: rng(6), color: coat });

  const headSurf = b.surface(headSweep);
  const cheekHits = headSurf.scatter(50, {
    rng: rng(13),
    minDist: 0.022,
    filter: (h) => h.at.z > 0.55 && h.at.z < 0.74 && Math.abs(h.at.x) > 0.06 && h.at.y < 0.96 && h.n.y < 0.3,
  });
  b.cards(cheekHits, tuft, { size: [0.035, 0.06], lean: 70, vary: 0.2, rng: rng(14), color: coat });

  const torsoSurf = b.surface(torso);
  const bodyHits = torsoSurf.scatter(420, { rng: rng(10), minDist: 0.032, filter: (h) => h.n.y > -0.2 });
  b.cards(bodyHits, tuft, { size: [0.05, 0.085], lean: 25, bend: 15, vary: 0.3, rng: rng(11), color: coat });

  const tailHits = b.surface(tailTube).scatter(160, { rng: rng(12), minDist: 0.035 });
  b.cards(tailHits, tuft, { size: [0.05, 0.1], lean: 50, bend: 20, vary: 0.25, rng: rng(15), color: coat });

  return b.root;
}
