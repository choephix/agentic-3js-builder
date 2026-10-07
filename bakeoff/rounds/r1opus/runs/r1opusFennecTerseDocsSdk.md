```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  offset,
  catmull,
  bezier,
  limb,
  countershade,
  mottle,
  gradient,
  paint,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Fennec Fox",
  description:
    "A stylized low-poly fennec fox in a rigging rest pose: giant fur-lined ears, sandy mottled coat, cream belly, dark tear-streak eyes and a bushy black-tipped tail.",
};

const SAND = "#e6c08e";
const SAND_DK = "#d2a46c";
const CREAM = "#f7ecd6";
const WHITE = "#fdf8ef";
const RIM = "#b98a58";
const EAR_BACK = "#d7ab74";
const PINK = "#efbfae";
const BLACK = "#1c1412";
const TAILTIP = "#2a1e1a";

function keyed(keys: number[][], t: number): [number, number] {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const c = keys[i];
    if (t <= c[0]) {
      const u = (t - a[0]) / (c[0] - a[0]);
      const s = u * u * (3 - 2 * u);
      return [a[1] + (c[1] - a[1]) * s, a[2] + (c[2] - a[2]) * s];
    }
  }
  const l = keys[keys.length - 1];
  return [l[1], l[2]];
}

export default function build() {
  const b = createBuilder({ name: "fennec" });
  const R = rng(42);

  const coat = countershade(mottle(SAND, SAND_DK, { size: 0.05, contrast: 0.45, seed: 3 }), CREAM, {
    level: -0.15,
  });

  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
      <path d="M5 64 C 4 42, 9 20, 11 3 C 13 20, 15 28, 16 34 C 17 22, 19 10, 22 0 C 25 22, 29 44, 27 64 Z" fill="#ffffff"/>
      <path d="M11 60 L12 18" stroke="#d6d6d6" stroke-width="2"/>
      <path d="M21 60 L21 14" stroke="#d6d6d6" stroke-width="2"/>
    </svg>`,
    { size: 128 },
  );

  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M48 34 Q 55 48 60 63 L 52 63 Q 47 49 43 37 Z" fill="#3a2418"/>
      <path d="M4 22 Q 30 4 54 35 Q 26 46 4 22 Z" fill="#160e0c"/>
      <circle cx="29" cy="26" r="9.5" fill="#5e3517"/>
      <circle cx="29" cy="26" r="6" fill="#2a170b"/>
      <circle cx="30" cy="26" r="4" fill="#070404"/>
      <circle cx="33" cy="22" r="2.8" fill="#ffffff"/>
      <circle cx="25" cy="30" r="1.3" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.19, -0.1], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.195, -0.06],
      [0, 0.2, 0.02],
      [0, 0.208, 0.085],
    ]),
    { parent: hips, count: 2, names: ["spine1", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.215, 0.095],
      [0, 0.245, 0.125],
      [0, 0.275, 0.15],
    ]),
    { parent: spine.joints[1], count: 2, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.285, 0.16], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.03, down: 0.017 }),
    aim: head.local({ forward: 0.09, down: 0.024 }),
    role: "jaw",
  });

  const tailPath = catmull([
    [0, 0.195, -0.125],
    [0, 0.18, -0.2],
    [0, 0.155, -0.28],
    [0, 0.135, -0.37],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    count: 4,
    names: ["tail1", "tail2", "tail3", "tail4"],
    role: "tail",
  });

  // ---------- body ----------
  const bodyPath = catmull([
    [0, 0.195, -0.145],
    [0, 0.19, -0.06],
    [0, 0.2, 0.03],
    [0, 0.215, 0.1],
    [0, 0.268, 0.15],
  ]);
  const bodyKeys = [
    [0, 0.042, 0.046],
    [0.15, 0.054, 0.058],
    [0.45, 0.049, 0.056],
    [0.68, 0.055, 0.062],
    [0.85, 0.04, 0.043],
    [1, 0.031, 0.033],
  ];
  const body = b.sweep(bodyPath, (t) => keyed(bodyKeys, t), {
    bone: [tail, hips, spine, neck],
    color: coat,
    name: "body",
  });

  // ---------- head ----------
  const skullC = head.local({ forward: 0.015, up: 0.01 });
  const skull = b.part(new THREE.SphereGeometry(0.046, 12, 9).scale(1.15, 0.92, 1.0), coat, {
    bone: head,
    at: skullC,
    name: "skull",
  });
  const snout = b.sweep(
    [head.local({ forward: 0.025, up: 0.002 }), head.local({ forward: 0.094, down: 0.008 })],
    (t) => [0.03 * (1 - t) + 0.011 * t, 0.022 * (1 - t) + 0.009 * t],
    { bone: head, color: countershade(SAND, WHITE, { level: 0.35 }), name: "snout" },
  );
  b.part(new THREE.SphereGeometry(0.011, 8, 6).scale(1.25, 0.85, 0.9), BLACK, {
    bone: head,
    at: head.local({ forward: 0.104, down: 0.006 }),
    name: "nose",
  });
  b.sweep(
    [jaw.at, head.local({ forward: 0.088, down: 0.022 })],
    (t) => [0.02 - 0.012 * t, 0.01 - 0.004 * t],
    { bone: jaw, color: WHITE, name: "jawLower" },
  );
  // mouth line
  b.sweep(
    [head.local({ forward: 0.05, down: 0.017 }), head.local({ forward: 0.094, down: 0.016 })],
    0.0018,
    { bone: head, color: BLACK, sides: 4, name: "mouthLine" },
  );

  // eyes with tear streaks
  for (const s of [1, -1]) {
    b.decal([skull, snout], eyeTex, {
      at: head.local({ left: s * 0.027, up: 0.014, forward: 0.045 }),
      dir: [s * 0.55, 0.15, 1],
      size: [0.034, 0.034],
      mirror: s > 0,
      bone: head,
      name: s > 0 ? "eyeL" : "eyeR",
    });
  }

  // whiskers
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const base = head.local({ left: s * 0.013, forward: 0.08, down: 0.006 + i * 0.004 });
      const tip = new THREE.Vector3(base.x + s * 0.065, base.y + 0.012 - i * 0.014, base.z - 0.01 + i * 0.006);
      const midP = new THREE.Vector3(base.x + s * 0.035, base.y + 0.006 - i * 0.004, base.z + 0.006);
      b.sweep(bezier(base, midP, tip), [0.0012, 0.0004], {
        bone: head,
        color: "#3b2c24",
        sides: 4,
        caps: "none",
        name: `whisker${s > 0 ? "L" : "R"}${i}`,
      });
    }
  }

  // cheek ruffs
  const skullSurf = b.surface(skull);
  const cheekHits = [];
  for (const s of [1, -1])
    for (const az of [60, 80, 100])
      for (const el of [-35, -15, 5]) {
        const h = skullSurf.around(skullC).at(s * az, el);
        if (h) cheekHits.push(h);
      }
  b.cards(cheekHits, tuft, {
    size: [0.022, 0.034],
    lean: 55,
    bend: 25,
    flow: (f) => [Math.sign(f.at.x) * 0.6, -0.5, -0.6],
    vary: 0.25,
    spin: 15,
    rng: rng(5),
    color: WHITE,
    bone: head,
    cross: true,
  });

  // ---------- ears ----------
  const earOutline: [number, number, "sharp"?][] = [
    [-0.034, 0],
    [0.034, 0],
    [0.029, 0.055],
    [0.012, 0.112],
    [0, 0.135, "sharp"],
    [-0.012, 0.112],
    [-0.029, 0.055],
  ];
  const innerOutline = earOutline.map((p) =>
    p.length === 3 ? ([p[0] * 0.74, p[1] * 0.84 + 0.008, "sharp"] as [number, number, "sharp"]) : ([p[0] * 0.74, p[1] * 0.84 + 0.008] as [number, number]),
  );
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const earBase = head.local({ left: s * 0.03, up: 0.035, back: 0.002 });
    const yDir: [number, number, number] = [s * 0.5, 1, 0];
    const xDir: [number, number, number] = [1, -s * 0.5, 0];
    const earJ = b.joint(`ear${S}`, { parent: head, at: earBase, dir: yDir, role: "hinge" });
    const thick = new THREE.Vector3(...xDir).cross(new THREE.Vector3(...yDir)).normalize();
    const earPaint = paint((_p, n, _s) =>
      Math.abs(n.dot(thick)) < 0.5 ? RIM : n.dot(thick) < 0 ? EAR_BACK : SAND,
    );
    b.extrude(earOutline, {
      at: earBase,
      x: xDir,
      y: yDir,
      thickness: 0.008,
      bevel: 0.002,
      smoothing: 1,
      color: earPaint,
      bone: earJ,
      name: `ear${S}`,
    });
    const innerAt = offset(earBase, thick, 0.0045);
    const tipPt = offset(earBase, yDir, 0.12);
    const inner = b.extrude(innerOutline, {
      at: innerAt,
      x: xDir,
      y: yDir,
      thickness: 0.003,
      smoothing: 1,
      color: gradient(PINK, "#f6dccf", innerAt, tipPt),
      bone: earJ,
      name: `earInner${S}`,
    });
    // white fur fringe inside the ear
    const er = rng(s > 0 ? 21 : 22);
    const furFrames = [];
    for (let i = 0; i < 14; i++) {
      const v = 0.012 + er() * 0.07;
      const u = (er() - 0.5) * 0.045 * (1 - v / 0.12);
      furFrames.push(frame(inner.local([u, v, 0.0015]), thick));
    }
    b.cards(furFrames, tuft, {
      size: [0.018, 0.04],
      lean: 45,
      bend: 20,
      flow: yDir,
      vary: 0.3,
      spin: 20,
      rng: er,
      color: WHITE,
      bone: earJ,
    });
  }

  // ---------- tail ----------
  const tailPaint = gradient(coat, TAILTIP, tailPath.at(0.7), tailPath.at(0.86));
  const tailTube = b.sweep(tail, [0.022, 0.036, 0.044, 0.04, 0.02], { color: tailPaint, name: "tail" });
  b.stick(new THREE.SphereGeometry(0.012, 6, 4).scale(1, 0.4, 1.5), "#4a3128", tailTube.at(0.22, 0), {
    embed: 0.5,
    name: "tailGland",
  });
  b.cards(b.surface(tailTube).scatter(90, { rng: rng(8), minDist: 0.014 }), tuft, {
    size: [0.024, 0.055],
    lean: 62,
    bend: 25,
    flow: [0, -0.1, -1],
    vary: 0.3,
    spin: 20,
    rng: rng(9),
    color: tailPaint,
  });

  // ---------- body fur ----------
  const bodySurf = b.surface(body);
  b.cards(
    bodySurf.scatter(140, { rng: rng(11), minDist: 0.02, filter: (h) => h.n.y > -0.25 && h.at.z < 0.13 }),
    tuft,
    { size: [0.02, 0.034], lean: 72, bend: 20, vary: 0.3, spin: 15, rng: rng(12), color: coat },
  );
  // chest ruff
  b.cards(
    bodySurf.scatter(40, {
      rng: rng(13),
      minDist: 0.012,
      filter: (h) => h.n.z > 0.35 && h.at.y < 0.25 && h.at.y > 0.15,
    }),
    tuft,
    { size: [0.024, 0.04], lean: 50, bend: 30, flow: [0, -1, 0.2], vary: 0.3, rng: rng(14), color: WHITE, cross: true },
  );

  // ---------- legs ----------
  const legPaint = gradient(coat, CREAM, [0, 0.16, 0], [0, 0.06, 0]);
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // front leg
    const fTarget: [number, number, number] = [s * 0.04, 0.014, 0.085];
    const fPts = limb([s * 0.035, 0.17, 0.075], fTarget, [0.085, 0.085], [[0, 0, -1]]);
    const front = b.chain(`armF${S}`, fPts, {
      parent: spine.joints[1],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "leg",
      contact: [fTarget[0], 0, fTarget[2] + 0.012],
    });
    b.sweep(front, [0.02, 0.014, 0.011], { color: legPaint, name: `legF${S}` });
    const fEnd = fPts[fPts.length - 1];
    b.capsule(fEnd, offset(fEnd, [0, 0, 1], 0.022), 0.014, { bone: front.tip!, color: CREAM, name: `pawF${S}` });

    // hind leg
    const hTarget: [number, number, number] = [s * 0.038, 0.014, -0.085];
    const hPts = limb([s * 0.035, 0.17, -0.095], hTarget, [0.075, 0.075, 0.05], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hind = b.chain(`legH${S}`, hPts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`],
      role: "leg",
      contact: [hTarget[0], 0, hTarget[2] + 0.014],
    });
    b.sweep(hind, [0.032, 0.02, 0.012, 0.011], { color: legPaint, name: `legH${S}` });
    const hEnd = hPts[hPts.length - 1];
    b.capsule(hEnd, offset(hEnd, [0, 0, 1], 0.026), 0.014, { bone: hind.tip!, color: CREAM, name: `pawH${S}` });

    // toe bumps
    const paws: [THREE.Vector3, number, typeof front.tip][] = [
      [new THREE.Vector3().copy(fEnd as THREE.Vector3), 0.022, front.tip],
      [new THREE.Vector3().copy(hEnd as THREE.Vector3), 0.026, hind.tip],
    ];
    for (const [end, len, bone] of paws) {
      for (const dx of [-0.009, 0, 0.009]) {
        b.part(new THREE.SphereGeometry(0.0075, 6, 4), WHITE, {
          bone: bone!,
          at: [end.x + dx, 0.0075, end.z + len + 0.008 - Math.abs(dx) * 0.4],
          name: `toe${S}`,
        });
      }
    }
  }

  return b.root;
}
```