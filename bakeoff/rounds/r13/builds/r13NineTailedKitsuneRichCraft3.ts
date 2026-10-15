import * as THREE from "three";
import { createBuilder, frame, rng, catmull, bezier, limb, paint, mix, smoothstep, noise, svg, DEG } from "../../../../src/index";
import type { ColorInput, JointRef, V3 } from "../../../../src/index";
import { cel, zigzag, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kyubi no Kitsune",
  description:
    "A nine-tailed white kitsune in high-fantasy anime style: crimson kumadori face paint, gold-ringed tails tipped with blue spirit flames, a shimenawa rope with paper shide and a bell, a sacred sash, and floating hitodama wisps.",
};

type Pt = [number, number] | [number, number, "sharp"];

export default function build() {
  const b = createBuilder({ name: "kitsune" });
  type Target = Parameters<typeof b.surface>[0];

  // ------------------------------------------------------------------ palette
  const GOLD = "#f6c548";
  const WHITE = "#ffffff";
  const NOSEC = "#2b1a38";
  const COAT = cel(
    paint((p, n) => mix(mix("#fff1d6", "#ffffff", smoothstep(-0.2, 0.7, n.y)), "#f3dff6", 0.3 * noise(p, 0.15, 3))),
    "#d6c8ea",
  );
  const CRIM = cel("#e3213f", "#8c1243");
  const GOLDC = cel("#ffd35a", "#d28a2b");
  const SOCK = cel("#3b2d66", "#1c1340");
  const EARTIP = cel("#2b2250", "#150f30");
  const PINK = cel("#ff93b4", "#c4507f");
  const STRAW_A = cel("#f0dda0", "#b9a070");
  const STRAW_B = cel("#d9c07c", "#a08a58");

  const TAILP = paint((_p, _n, s) => {
    const e = 0.72 + 0.05 * zigzag(s[1] / 36);
    return s[0] > e ? CRIM : s[0] > e - 0.03 ? GOLDC : COAT;
  });
  const LEGP = paint((p) => (p.y < 0.27 + 0.035 * zigzag((p.x + p.z) / 0.04) ? SOCK : COAT));
  const EARP = paint((_p, _n, s) => (s[1] > 0.15 + 0.012 * zigzag(s[0] / 0.025) ? EARTIP : COAT));
  const ROPEP = paint((_p, _n, s) => ((((s[1] - 1440 * s[0]) % 90) + 90) % 90 < 45 ? STRAW_A : STRAW_B));

  // ------------------------------------------------------------------ drawings
  const EYE = svg(
    `<svg viewBox="0 0 96 64" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="almond"><path d="M10 28 Q38 6 70 16 Q86 22 90 40 Q50 60 10 28Z"/></clipPath>
      <linearGradient id="iris" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#a8340f"/><stop offset="0.45" stop-color="#ff9a1f"/><stop offset="1" stop-color="#fff29a"/>
      </linearGradient>
    </defs>
    <path d="M12 26 Q4 20 1 7" stroke="#e3213f" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M10 30 Q36 -2 74 10" stroke="#e3213f" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M10 28 Q38 6 70 16 Q86 22 90 40 Q50 60 10 28Z" fill="#fffaf0"/>
    <g clip-path="url(#almond)">
      <ellipse cx="54" cy="33" rx="21" ry="26" fill="url(#iris)"/>
      <ellipse cx="54" cy="33" rx="21" ry="26" fill="none" stroke="#3a1230" stroke-width="3"/>
      <ellipse cx="54" cy="12" rx="26" ry="9" fill="#5a1530" opacity="0.8"/>
      <ellipse cx="54" cy="34" rx="6" ry="16" fill="#2a1030"/>
      <ellipse cx="46" cy="24" rx="5.5" ry="7" fill="#ffffff"/>
      <circle cx="64" cy="44" r="2.8" fill="#ffffff"/>
    </g>
    <path d="M7 30 Q38 2 72 14 Q88 20 94 43" stroke="#2a1030" stroke-width="6" stroke-linecap="round" fill="none"/>
  </svg>`,
    { size: 384 },
  );
  const CHEEK = svg(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M76 6 C52 6 24 14 2 30 C28 22 54 20 78 16Z" fill="#e3213f"/>
    <path d="M70 22 C50 24 32 28 14 38 C36 34 54 32 72 30Z" fill="#e3213f"/>
  </svg>`,
    { size: 256 },
  );
  const MARK = svg(
    `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 4 C40 22 56 30 52 52 C50 66 40 76 32 76 C24 76 14 66 12 52 C8 30 24 22 32 4Z" fill="#e3213f" stroke="#ffd35a" stroke-width="4"/>
    <path d="M32 28 C38 40 44 46 40 58 C38 64 34 66 32 66 C30 66 26 64 24 58 C20 46 28 40 32 28Z" fill="#ffd35a"/>
  </svg>`,
    { size: 192 },
  );
  const SWIRL = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 12 C75 14 90 36 82 58 C76 74 58 82 46 74 C36 68 36 54 46 50 C54 47 60 54 55 59" stroke="#e3213f" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M50 12 C42 4 36 6 30 14 C38 14 44 16 50 12Z" fill="#e3213f"/>
    <path d="M82 58 C92 56 96 62 96 70 C90 66 86 64 82 58Z" fill="#e3213f"/>
    <circle cx="55" cy="59" r="4" fill="#ffd35a"/>
  </svg>`,
    { size: 256 },
  );
  const SHIDE = svg(
    `<svg viewBox="0 0 32 80" xmlns="http://www.w3.org/2000/svg">
    <polygon points="10,0 24,0 24,16 30,28 18,34 30,48 18,54 24,66 24,80 10,80 10,64 4,52 16,46 4,32 16,26 10,14" fill="#ffffff" stroke="#c9b8e8" stroke-width="2"/>
  </svg>`,
    { size: 128 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="t" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d8cbea"/><stop offset="0.6" stop-color="#fff3e0"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
    <path d="M3 64 C6 40 10 20 16 1 C22 20 26 40 29 64Z" fill="url(#t)" stroke="#cdbfe3" stroke-width="1.5"/>
  </svg>`,
    { size: 128 },
  );
  const FLAME = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#ffffff"/><stop offset="0.35" stop-color="#9ff4ff"/><stop offset="0.75" stop-color="#4aa8ff"/><stop offset="1" stop-color="#7a4dff"/>
      </linearGradient>
      <linearGradient id="h" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c8f6ff"/></linearGradient>
    </defs>
    <path d="M32 126 C8 122 2 96 14 74 C22 58 16 44 28 26 C32 18 34 10 40 2 C44 22 62 46 58 80 C56 108 48 124 32 126Z" fill="url(#g)"/>
    <path d="M32 122 C18 118 16 100 24 86 C30 76 28 66 34 56 C40 70 48 84 44 102 C42 114 38 120 32 122Z" fill="url(#h)"/>
  </svg>`,
    { size: 192 },
  );

  // ------------------------------------------------------------------ helpers
  const band = (line: Parameters<typeof b.ring>[0], radius: number, r: number, color: ColorInput, count = 10) => {
    const ring = b.ring(line, { count, radius });
    const sw = b.sweep(catmull(ring.items, { closed: true }), r, { color });
    return { ring, sw };
  };

  const tufts = (
    src: Target,
    count: number,
    o: {
      size: [number, number];
      seed: number;
      lean?: number;
      minDist?: number;
      bend?: number;
      flow?: V3;
      filter?: (h: { at: THREE.Vector3; n: THREE.Vector3 }) => boolean;
    },
  ) => {
    const hits = b.surface(src).scatter(count, { rng: rng(o.seed), minDist: o.minDist ?? 0.04, filter: o.filter });
    return b.cards(hits, TUFT, {
      size: o.size,
      lean: o.lean ?? 55,
      bend: o.bend ?? 15,
      vary: 0.3,
      spin: 25,
      rng: rng(o.seed + 1),
      flow: o.flow,
    });
  };

  const flame = (p: V3, bone: JointRef, k = 1) => {
    const up = [frame(p, [0, 1, 0])];
    glow(b.cards(up, FLAME, { size: [0.17 * k, 0.36 * k], cross: true, bone, sink: 0.15, bend: 12, flow: [0, 0, 1] }), 1.4);
    glow(b.cards(up, FLAME, { size: [0.1 * k, 0.2 * k], cross: true, lean: 38, flow: [1, 0, 0.3], bone, spin: 40 }), 1.4);
    glow(b.cards(up, FLAME, { size: [0.1 * k, 0.2 * k], cross: true, lean: 38, flow: [-1, 0, -0.3], bone }), 1.4);
  };

  // ------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.62, -0.36], aim: [0, 0.64, -0.26], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.64, -0.26],
      [0, 0.67, 0.04],
      [0, 0.71, 0.34],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.71, 0.34],
      [0, 0.84, 0.45],
      [0, 0.955, 0.54],
    ]),
    { parent: spine.joints[2], count: 2, role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: neck.at(1), dir: [0, 0.02, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.925, 0.61], aim: [0, 0.912, 0.8], role: "jaw" });

  // ------------------------------------------------------------------ body
  const bump = (t: number, c: number, w: number) => Math.exp(-(((t - c) / w) ** 2));
  const body = b.sweep(
    spine,
    (t) => [
      0.115 + 0.03 * bump(t, 0.1, 0.25) + 0.04 * bump(t, 0.9, 0.25),
      0.13 + 0.03 * bump(t, 0.1, 0.25) + 0.065 * bump(t, 0.9, 0.25),
    ],
    { color: COAT, sides: 10 },
  );
  const rump = b.part(new THREE.SphereGeometry(1, 12, 9), COAT, {
    bone: hips,
    at: [0, 0.64, -0.3],
    scale: [0.145, 0.155, 0.17],
  });
  const neckSweep = b.sweep(neck, (t) => 0.1 - 0.02 * t, { color: COAT, sides: 10 });
  const bodySkin = b.surface(body);

  // flank swirls
  for (const s of [1, -1]) {
    b.decal([body, rump], SWIRL, { at: [s * 0.16, 0.74, 0.17], dir: [s, 0, 0], size: [0.2, 0.2], mirror: s < 0 });
    b.decal([body, rump], SWIRL, { at: [s * 0.17, 0.7, -0.22], dir: [s, 0, 0], size: [0.22, 0.22], mirror: s < 0 });
  }

  // chest and neck fur
  tufts(body, 46, { size: [0.06, 0.12], seed: 11, minDist: 0.035, filter: (h) => h.at.z > 0.14 && h.n.y < 0.45 });
  tufts(neckSweep, 30, { size: [0.05, 0.1], seed: 21, minDist: 0.03, filter: (h) => h.n.y < 0.6 });
  tufts(rump, 14, { size: [0.06, 0.12], seed: 31, minDist: 0.05, filter: (h) => h.n.z < 0.1 });

  // sacred sash
  const sashZ = spine.joints[1].at.z;
  b.sweep(bodySkin.loop(spine.joints[1], { lift: 0.012 }), 0.022, { color: CRIM });
  for (const d of [-0.04, 0.04]) {
    const cord = bodySkin.loop(frame([0, 0.68, sashZ + d], spine.joints[1].axis), { lift: 0.016 });
    b.sweep(cord, 0.007, { color: GOLD });
  }
  const knot = bodySkin.ray([0.6, 0.72, sashZ], [-1, 0, 0]);
  if (knot) {
    b.stick(new THREE.SphereGeometry(0.036, 8, 6), GOLD, knot, { embed: 0.3 });
    const RIBBON: Pt[] = [
      [0, -0.022],
      [0.2, -0.03],
      [0.27, -0.055, "sharp"],
      [0.235, 0],
      [0.27, 0.055, "sharp"],
      [0.2, 0.03],
      [0, 0.022],
    ];
    const rp: V3 = [knot.at.x + 0.014, knot.at.y - 0.02, knot.at.z];
    b.extrude(RIBBON, { at: rp, x: [0.25, -1, -0.3], y: [0, 0, 1], thickness: 0.01, color: CRIM, bone: spine.joints[1] });
    b.extrude(RIBBON, { at: rp, x: [0.3, -1, 0.25], y: [0, 0, 1], thickness: 0.01, color: GOLDC, bone: spine.joints[1] });
  }

  // ------------------------------------------------------------------ head
  const HC: V3 = [0, 0.99, 0.6];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), COAT, { bone: head, at: HC, scale: [0.118, 0.1, 0.108] });
  const skin = b.surface(skull);
  b.sweep(
    catmull([
      [0, 0.968, 0.69],
      [0, 0.962, 0.77],
      [0, 0.957, 0.845],
    ]),
    (t) => [0.054 - 0.032 * t, 0.049 - 0.028 * t],
    { color: COAT, bone: head, sides: 10 },
  );
  b.sweep(
    catmull([
      [0, 0.912, 0.62],
      [0, 0.912, 0.72],
      [0, 0.914, 0.8],
    ]),
    (t) => [0.046 - 0.026 * t, 0.022 - 0.01 * t],
    { color: COAT, bone: jaw, sides: 8 },
  );
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSEC, { bone: head, at: [0, 0.964, 0.857], scale: [0.027, 0.02, 0.022] });
  b.part(new THREE.SphereGeometry(1, 5, 4), WHITE, { bone: head, at: [0.006, 0.972, 0.866], scale: [0.007, 0.004, 0.005] });

  for (const s of [1, -1]) {
    // eyes, brow dots, cheek marks
    const eyeHit = skin.around(HC).at(s * 42, 4)!;
    glow(
      b.decal(skin, EYE, { at: eyeHit, dir: [s * 0.4, 0.05, 1], size: [0.078, 0.052], mirror: s > 0 }),
      0.5,
    );
    b.stick(new THREE.SphereGeometry(0.013, 6, 4), CRIM, skin.around(HC).at(s * 40, 32)!, { embed: 0.4 });
    const cheekHit = skin.around(HC).at(s * 70, -14)!;
    b.decal(skin, CHEEK, { at: cheekHit, dir: [s, 0, 0.2], size: [0.1, 0.05], mirror: s > 0 });

    // cheek ruff
    const ruff: [number, number, number, number][] = [
      [0.085, 0.975, 0.54, 0.05],
      [0.095, 0.95, 0.56, 0.055],
      [0.09, 0.925, 0.56, 0.05],
      [0.078, 0.9, 0.56, 0.04],
    ];
    ruff.forEach(([x, y, z, len], k) => {
      b.spike([s * x, y, z], [s * 0.8, -0.2 - 0.12 * k, -0.45], len + 0.04, 0.026, { color: COAT, bone: head });
    });
    // fangs, lip line, whiskers
    b.spike([s * 0.02, 0.935, 0.8], [0, -1, 0], 0.022, 0.006, { color: WHITE, bone: head });
    b.sweep(
      catmull([
        [s * 0.03, 0.931, 0.7],
        [s * 0.024, 0.933, 0.77],
        [s * 0.008, 0.936, 0.842],
      ]),
      0.0035,
      { color: INK, bone: head },
    );
    for (let k = 0; k < 3; k++) {
      b.sweep(
        bezier(
          [s * 0.04, 0.945, 0.77],
          [s * (0.12 + 0.02 * k), 0.95 + 0.015 * (k - 1), 0.78],
          [s * 0.22, 0.93 + 0.03 * (k - 1), 0.7],
        ),
        [0.004, 0.001],
        { color: "#f1e6ff", bone: head },
      );
    }

    // ears
    const ear = b.joint(`ear${s > 0 ? "L" : "R"}`, {
      parent: head,
      at: [s * 0.07, 1.05, 0.56],
      dir: [s * 0.3, 1, -0.12],
      role: "hinge",
    });
    const EAR_OUT: Pt[] = [
      [-0.06, 0],
      [-0.055, 0.07],
      [-0.02, 0.15],
      [0, 0.215, "sharp"],
      [0.02, 0.15],
      [0.055, 0.07],
      [0.06, 0],
    ];
    const EAR_IN: Pt[] = [
      [-0.035, 0.012],
      [-0.03, 0.07],
      [0, 0.17, "sharp"],
      [0.03, 0.07],
      [0.035, 0.012],
    ];
    b.extrude(EAR_OUT, {
      at: [s * 0.07, 1.045, 0.56],
      x: [s, 0, 0],
      y: [s * 0.3, 1, -0.12],
      thickness: 0.028,
      bevel: 0.006,
      smoothing: 1,
      color: EARP,
      bone: ear,
    });
    b.extrude(EAR_IN, {
      at: [s * 0.07, 1.05, 0.575],
      x: [s, 0, 0],
      y: [s * 0.3, 1, -0.12],
      thickness: 0.012,
      color: PINK,
      bone: ear,
    });
    // earring with a tassel
    b.part(new THREE.TorusGeometry(0.018, 0.0045, 5, 10), GOLD, { bone: ear, at: [s * 0.136, 1.078, 0.56], rotation: [0, 90, 0] });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, { bone: ear, at: [s * 0.136, 1.05, 0.56] });
    b.spike([s * 0.136, 1.048, 0.56], [0, -1, 0], 0.09, 0.015, { color: CRIM, bone: ear });
  }

  // forehead mark and crown tuft
  glow(b.decal(skin, MARK, { at: skin.around(HC).at(0, 46)!, dir: [0, 0.6, 1], size: [0.046, 0.058] }), 1);
  b.spike([0, 1.075, 0.6], [0, 0.8, -0.4], 0.08, 0.022, { color: COAT, bone: head });
  b.spike([0.025, 1.07, 0.6], [0.3, 0.8, -0.3], 0.065, 0.018, { color: COAT, bone: head });
  b.spike([-0.025, 1.07, 0.6], [-0.3, 0.8, -0.3], 0.065, 0.018, { color: COAT, bone: head });

  // ------------------------------------------------------------------ neck rope, shide, bell
  const rope = band(neck.at(0.35), 0.105, 0.021, ROPEP, 12);
  const items = rope.ring.items;
  const shideFrames = [4, 5, 7, 8].map((i) => frame(items[i].at, [0, 1, 0]));
  b.cards(shideFrames, SHIDE, { size: [0.05, 0.14], lean: 180, flow: [0, 0, 1], bone: neck.joints[1], vary: 0.15 });
  const bellPos = items[6].at.clone().addScaledVector(items[6].axis, 0.032);
  b.part(new THREE.SphereGeometry(0.034, 8, 6), GOLD, { bone: neck.joints[1], at: bellPos });
  b.part(new THREE.TorusGeometry(0.036, 0.004, 4, 10), "#b8862a", {
    bone: neck.joints[1],
    at: bellPos,
    dir: items[6].axis,
    axis: "z",
  });
  b.spike(items[6].at, items[6].axis, 0.03, 0.012, { color: CRIM, bone: neck.joints[1] });

  // ------------------------------------------------------------------ legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // forelegs
    const fp = limb([s * 0.115, 0.6, 0.26], [s * 0.115, 0.055, 0.28], [0.2, 0.2, 0.16], [[0, 0, -1], [0, 0, 1]]);
    const fLeg = b.chain(`legF${side}`, fp, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`],
      role: "leg",
    });
    const fSweep = b.sweep(fLeg, [0.065, 0.05, 0.036, 0.03, 0.03], { color: LEGP, sides: 8 });
    const fPaw = fLeg.joints[fLeg.joints.length - 1];
    b.part(new THREE.SphereGeometry(1, 8, 6), LEGP, { bone: fPaw, at: [fp[3].x, 0.032, fp[3].z + 0.035], scale: [0.04, 0.032, 0.07] });
    for (const k of [-1, 0, 1])
      b.part(new THREE.SphereGeometry(1, 6, 4), LEGP, {
        bone: fPaw,
        at: [fp[3].x + k * 0.02, 0.022, fp[3].z + 0.1],
        scale: [0.014, 0.014, 0.02],
      });
    band(fLeg.at(0.8), 0.04, 0.008, GOLD, 8);
    tufts(fSweep, 8, { size: [0.04, 0.08], seed: 40 + s, minDist: 0.04, lean: 70, filter: (h) => h.at.y > 0.3 });

    // hind legs
    const hp = limb([s * 0.115, 0.58, -0.32], [s * 0.115, 0.055, -0.4], [0.24, 0.24, 0.17], [[0, 0, 1], [0, 0, -1]]);
    const hLeg = b.chain(`legH${side}`, hp, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
      role: "leg",
    });
    const hSweep = b.sweep(hLeg, [0.085, 0.06, 0.04, 0.03, 0.03], { color: LEGP, sides: 8 });
    const hPaw = hLeg.joints[hLeg.joints.length - 1];
    b.part(new THREE.SphereGeometry(1, 12, 9), COAT, {
      bone: hips,
      at: [s * 0.1, 0.58, -0.32],
      scale: [0.085, 0.14, 0.14],
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), LEGP, { bone: hPaw, at: [hp[3].x, 0.032, hp[3].z + 0.035], scale: [0.04, 0.032, 0.07] });
    for (const k of [-1, 0, 1])
      b.part(new THREE.SphereGeometry(1, 6, 4), LEGP, {
        bone: hPaw,
        at: [hp[3].x + k * 0.02, 0.022, hp[3].z + 0.1],
        scale: [0.014, 0.014, 0.02],
      });
    band(hLeg.at(0.82), 0.04, 0.008, GOLD, 8);
    tufts(hSweep, 8, { size: [0.045, 0.09], seed: 50 + s, minDist: 0.04, lean: 70, filter: (h) => h.at.y > 0.3 && h.n.z < 0.3 });
  }

  // ------------------------------------------------------------------ nine tails
  const tailR = (t: number) =>
    t < 0.55 ? 0.042 + 0.055 * smoothstep(0, 0.55, t) : 0.097 - 0.085 * Math.pow(smoothstep(0.55, 1, t), 0.9);

  for (let i = 0; i < 9; i++) {
    const u = (i - 4) / 4;
    const al = u * 76 * DEG;
    const sa = Math.sin(al);
    const ca = Math.cos(al);
    const R = 0.7 + 0.25 * Math.abs(u);
    const st = i % 2 ? -0.06 : 0;
    const rs = [0, 0.33, 0.68, 1.0, 1.12].map((k) => k * R);
    const zs = [-0.4, -0.58, -0.82, -1.02, -1.07];
    const pts = rs.map((r, k) => [
      r * sa + (k === 0 ? u * 0.03 : 0),
      0.7 + r * ca * 0.8 - (k > 1 ? 0.05 * Math.abs(u) : 0) + (k === 3 ? 0.04 : 0) + (k === 4 ? 0.12 : 0),
      zs[k] + (k > 0 ? st : 0),
    ]);
    const tail = b.chain(`tail${i + 1}`, catmull(pts), {
      parent: hips,
      count: 4,
      names: (k: number) => `tail${i + 1}_${k + 1}`,
      role: "tail",
    });
    const tsweep = b.sweep(tail, tailR, { color: TAILP, sides: 10 });
    const last = tail.joints[tail.joints.length - 1];

    // gold ring
    const cp = tail.at(0.66);
    b.part(new THREE.TorusGeometry(tailR(0.66) + 0.008, 0.012, 5, 12), GOLD, { at: cp.at, dir: cp.axis, axis: "z" });

    // fur along the tail
    const tg = tail.at(0.8).tangent;
    tufts(tsweep, 10, { size: [0.05, 0.1], seed: 100 + i * 3, minDist: 0.07, lean: 60, flow: [tg.x, tg.y, tg.z] });

    // spirit flame
    const tip = tail.at(1).at;
    const heart: V3 = [tip.x, tip.y + 0.03, tip.z];
    glow(b.part(new THREE.IcosahedronGeometry(0.04, 0), "#e9ffff", { bone: last, at: heart }), 2);
    flame(heart, last, 1);
  }

  // ------------------------------------------------------------------ floating spirit wisps (hitodama)
  const wisp = (p: V3, k: number) => {
    glow(b.part(new THREE.IcosahedronGeometry(0.045 * k, 0), "#e9ffff", { bone: hips, at: p }), 2);
    flame(p, hips, 0.9 * k);
  };
  wisp([0.78, 0.3, 0.62], 1);
  wisp([-0.82, 0.62, 0.48], 0.9);
  wisp([0.66, 1.3, 0.55], 0.9);
  wisp([-0.58, 1.42, 0.3], 1);
  wisp([0.98, 0.9, 0.1], 0.8);
  wisp([-1.0, 1.05, -0.1], 0.8);
  wisp([0, 1.42, 0.55], 0.8);

  return b.root;
}
