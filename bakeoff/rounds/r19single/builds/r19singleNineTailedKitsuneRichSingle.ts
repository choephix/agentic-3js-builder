// Nine-tailed kitsune: a tall white spirit fox in high-fantasy anime style. Cel-shaded cream coat with crimson
// kumadori markings, gold filigree (crescent, anklets, tail bands, bell and tassel), a shide-paper rope, and nine
// fanned tails whose tips burn with cyan-violet spirit flames; more kitsune-bi float around it over a glowing
// nine-pointed star circle on the floor.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG, lerp, offset, rng } from "../../../../src/math";
import { limb } from "../../../../src/ik";
import { catmull, polyline } from "../../../../src/path";
import { gradient, paint } from "../../../../src/paint";
import { radiusFn } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A tall white spirit fox with nine fanned, flame-tipped tails, crimson kumadori face markings, gold ornaments and floating kitsune-bi spirit fire, cel-shaded in high-fantasy anime style.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

function need<T>(x: T | null | undefined, what: string): T {
  if (x === null || x === undefined) throw new Error(`nineTailedKitsune: no surface hit for ${what}`);
  return x;
}

export default function build() {
  const b = createBuilder({ name: "nineTailedKitsune" });
  const rand = rng(9);

  // ------------------------------------------------------------------ palette
  const CREAM = cel("#fff3e0", "#efd0c6");
  const BELLY = cel("#ffe6da", "#e6bfbf");
  const RED = cel("#e8283f", "#a3134a");
  const PLUM = cel("#3a2146", "#22112f");
  const GOLD = cel("#ffd45e", "#c98a2c");
  const PINK = cel("#ffb8c8", "#e08aa6");
  const NOSE = cel("#3c2258", INK);
  const CLAW = "#f3ead9";

  // ------------------------------------------------------------------ textures
  const FLAME = svg(
    `<svg viewBox="0 0 64 128">
      <path d="M32 127 C10 127 3 102 12 82 C18 68 14 56 24 40 C30 30 28 16 38 2 C38 22 52 36 56 66 C60 92 56 127 32 127Z" fill="#6a4bff"/>
      <path d="M32 122 C16 122 11 104 18 90 C23 79 21 68 29 56 C33 48 32 40 38 30 C40 48 49 62 50 82 C51 104 46 122 32 122Z" fill="#35c8ff"/>
      <path d="M32 116 C23 116 20 104 25 94 C28 88 28 80 33 72 C36 82 42 90 42 100 C42 110 40 116 32 116Z" fill="#c9f6ff"/>
      <path d="M32 108 C28 108 27 102 30 97 C32 93 33 90 35 86 C38 93 38 108 32 108Z" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 32 64">
      <path d="M16 64 C4 56 6 30 16 2 C26 30 28 56 16 64Z" fill="#ffffff"/>
      <path d="M16 60 C12 48 13 30 16 14 C19 30 20 48 16 60Z" fill="#e6dff0"/>
    </svg>`,
    { size: 128 },
  );
  const SHIDE = svg(
    `<svg viewBox="0 0 40 100">
      <path d="M8 0 H32 V26 L24 30 L34 42 L22 46 L32 60 L18 66 L28 82 L12 100 L6 78 L16 62 L4 52 L14 40 L6 28 Z" fill="#ffffff" stroke="#c9c2d6" stroke-width="3"/>
    </svg>`,
    { size: 128 },
  );
  const TEAR = svg(
    `<svg viewBox="0 0 40 70">
      <path d="M20 68 C16 52 4 40 4 24 C4 10 12 2 20 2 C28 2 36 10 36 24 C36 40 24 52 20 68Z" fill="#e0243c"/>
    </svg>`,
    { size: 128 },
  );
  const star = Array.from({ length: 9 }, (_, k) => {
    const a = (k * 4 * 2 * Math.PI) / 9 - Math.PI / 2;
    return `${(100 + 86 * Math.cos(a)).toFixed(1)},${(100 + 86 * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  const dots = Array.from({ length: 9 }, (_, k) => {
    const a = (k * 2 * Math.PI) / 9 - Math.PI / 2;
    return `<circle cx="${(100 + 86 * Math.cos(a)).toFixed(1)}" cy="${(100 + 86 * Math.sin(a)).toFixed(1)}" r="4" fill="#c9f6ff"/>`;
  }).join("");
  const CIRCLE = svg(
    `<svg viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="97" fill="none" stroke="#7fe8ff" stroke-width="2"/>
      <circle cx="100" cy="100" r="91" fill="none" stroke="#9a7bff" stroke-width="1.2"/>
      <circle cx="100" cy="100" r="60" fill="none" stroke="#7fe8ff" stroke-width="1.2" stroke-dasharray="6 4"/>
      <circle cx="100" cy="100" r="30" fill="none" stroke="#9a7bff" stroke-width="1.4"/>
      <polygon points="${star}" fill="none" stroke="#7fe8ff" stroke-width="1.4"/>
      ${dots}
    </svg>`,
    { size: 1024 },
  );

  // ------------------------------------------------------------------ skeleton
  const A = [0, 0.645, -0.38];
  const B = [0, 0.655, -0.06];
  const C = [0, 0.68, 0.24];
  const D = [0, 0.8, 0.42];
  const E = [0, 0.95, 0.55];
  const F = [0, 1.03, 0.64];

  const pelvis = b.joint("pelvis", { at: A, dir: [0, 0.02, 1], role: "spine" });
  const spine = b.chain("spine", catmull([A, B, C, D]), {
    parent: pelvis,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([D, E, F]), {
    parent: spine.joints[2],
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: F, aim: [0, 1.0, 1.0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.995, 0.78], aim: [0, 0.972, 0.945], role: "jaw" });

  // ------------------------------------------------------------------ torso
  const MARKS = [
    [0.128, 0.735, -0.3],
    [-0.128, 0.735, -0.3],
    [0.148, 0.75, 0.2],
    [-0.148, 0.75, 0.2],
  ].map((m) => new THREE.Vector3(m[0], m[1], m[2]));
  const COAT = furEdge(CREAM, BELLY, { level: -0.3, teeth: 0.2, period: 0.03, along: [0, 0, 1] });
  const BODY = paint((p, n) => {
    for (const m of MARKS) {
      const d = p.distanceTo(m);
      if ((d > 0.056 && d < 0.074) || d < 0.02) return RED;
    }
    if (n.y > 0.55 && p.z > -0.45 && p.z < 0.42 && Math.abs(p.x) < 0.006 + 0.01 * zigzag(p.z / 0.04)) return RED;
    return COAT;
  });
  const torso = b.loft(
    [
      { at: [0, 0.64, -0.52], w: 0.16, h: 0.18 },
      { at: A, w: 0.26, h: 0.27 },
      { at: B, w: 0.25, h: 0.28 },
      { at: C, w: 0.3, h: 0.33 },
      { at: D, w: 0.21, h: 0.25 },
      { at: E, w: 0.16, h: 0.18 },
      { at: F, w: 0.14, h: 0.15 },
    ],
    { bone: [pelvis, spine, neck], color: BODY },
  );
  const skinT = b.surface(torso);

  // chest and neck ruff
  b.cards(
    skinT.scatter(90, {
      rng: rand,
      minDist: 0.035,
      filter: (h) => h.at.z > 0.2 && h.at.z < 0.62 && h.n.y < 0.5 && h.n.z > -0.1,
    }),
    TUFT,
    { size: [0.06, 0.1], lean: 55, bend: 25, flow: [0, -1, -0.4], vary: 0.25, rng: rand, color: CREAM },
  );
  // rump fluff round the tail roots
  b.cards(
    skinT.scatter(40, { rng: rand, minDist: 0.04, filter: (h) => h.at.z < -0.3 }),
    TUFT,
    { size: [0.06, 0.11], lean: 60, bend: 20, flow: [0, 0, -1], vary: 0.25, rng: rand, color: CREAM },
  );

  // waist sash and side knots
  b.sweep(skinT.loop([0, 0.655, -0.12], { dir: [0, 0, 1], lift: 0.01 }), 0.018, { color: RED, sides: 6 });
  for (const z of [-0.19, -0.05])
    b.sweep(skinT.loop([0, 0.655, z], { dir: [0, 0, 1], lift: 0.008 }), 0.007, { color: GOLD, sides: 5 });
  for (const s of [1, -1]) {
    const knot = need(skinT.around([0, 0.655, -0.12]).at(s * 90, 0), "sash knot");
    b.stick(new THREE.SphereGeometry(0.03, 8, 6), GOLD, knot, { embed: 0.25 });
    const ribbon = [
      [0, 0],
      [0.05, 0],
      [0.058, 0.2],
      [0.028, 0.165],
      [-0.004, 0.23],
    ] as [number, number][];
    b.extrude(ribbon, {
      at: [s * 0.142, 0.63, -0.12],
      x: [0, 0, -1],
      y: [s * 0.2, -1, 0],
      thickness: 0.008,
      color: RED,
    });
    b.extrude(ribbon, {
      at: [s * 0.145, 0.63, -0.17],
      x: [0, 0, -1],
      y: [s * 0.32, -1, 0],
      thickness: 0.008,
      color: GOLD,
    });
  }

  // shimenawa rope, shide paper, bell and tassel
  const NP = lerp(D, E, 0.35);
  const ND = [0, 0.62, 0.78];
  const rope = skinT.loop(NP, { dir: ND, lift: 0.012 });
  b.sweep(rope, 0.017, { color: RED, sides: 6 });
  b.sweep(skinT.loop(lerp(D, E, 0.15), { dir: ND, lift: 0.008 }), 0.008, { color: GOLD, sides: 5 });
  const hang: ReturnType<typeof frame>[] = [];
  b.along(rope, 14, (a) => {
    if (a.at.z > NP.z + 0.03) hang.push(frame(a, [0, 1, 0]));
  });
  b.cards(hang, SHIDE, { size: [0.04, 0.11], lean: 180, flow: [0, 0, 1], color: "#fffaf0", sink: 0.05 });
  const bellHit = need(skinT.around(NP).at(0, -30), "bell");
  b.stick(new THREE.SphereGeometry(0.03, 8, 6), GOLD, bellHit, { embed: 0.2 });
  b.rod(bellHit, offset(bellHit, [0, -1, 0], 0.12), 0.007, { color: RED });
  b.spike(offset(bellHit, [0, -1, 0], 0.1), [0, -1, 0], 0.08, 0.016, { color: RED });
  b.part(new THREE.SphereGeometry(0.014, 6, 5), GOLD, { at: offset(bellHit, [0, -1, 0], 0.1) });

  // spirit-fire mane along the spine and neck
  const FLAME_GLOW = 1.2;
  const mane = Array.from({ length: 12 }, (_, k) => torso.at(0.2 + k * 0.065, 0));
  glow(
    b.cards(mane, FLAME, { size: [0.055, 0.13], lean: 35, flow: [0, 0.15, -1], cross: true, sink: 0.15 }),
    FLAME_GLOW,
  );

  // ------------------------------------------------------------------ head
  const SC = [0, 1.055, 0.735];
  const HEAD = furEdge(CREAM, BELLY, { level: -0.45, teeth: 0.2, period: 0.03, along: [1, 0, 0] });
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), HEAD, {
    bone: head,
    at: SC,
    scale: [0.098, 0.092, 0.105],
    name: "skull",
  });
  const skin = b.surface(skull);
  const onSkull = (az: number, el: number) => need(skin.around(SC).at(az, el), `skull ${az}/${el}`);

  const snout = b.sweep(
    [
      [0, 1.035, 0.79],
      [0, 1.025, 0.88],
      [0, 1.012, 0.965],
    ],
    (t: number): [number, number] => [0.052 - 0.03 * t, 0.05 - 0.03 * t],
    { color: HEAD, bone: head, caps: { start: "flat", end: "round" }, name: "snout" },
  );
  b.sweep(
    [
      [0, 0.985, 0.79],
      [0, 0.975, 0.87],
      [0, 0.965, 0.94],
    ],
    (t: number): [number, number] => [0.047 - 0.027 * t, 0.026 - 0.01 * t],
    { color: HEAD, bone: jaw, caps: "round", name: "lowerJaw" },
  );
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: [0, 1.017, 0.982],
    scale: [0.026, 0.019, 0.02],
    name: "nose",
  });
  for (const angle of [125, 235]) b.sweep(snout.line(angle, 0.001), 0.0035, { color: INK, sides: 4 });
  for (const s of [1, -1]) {
    // fangs, whiskers, cheek fur
    b.spike([s * 0.028, 0.995, 0.945], [0, -1, 0], 0.028, 0.007, { color: "#fffdf5", bone: head, sides: 5 });
    for (let k = 0; k < 3; k++)
      b.sweep(
        catmull([
          [s * 0.04, 1.0 + k * 0.008, 0.93],
          [s * 0.12, 1.0 + (k - 1) * 0.03, 0.9 - k * 0.02],
          [s * (0.2 + 0.02 * k), 0.99 + (k - 1) * 0.06, 0.82 - k * 0.04],
        ]),
        [0.003, 0.0012],
        { color: "#fffaf0", bone: head, sides: 4 },
      );
    for (let k = 0; k < 3; k++)
      b.spike(
        [s * 0.07, 1.03 - k * 0.02, 0.77 - k * 0.01],
        [s * (0.17 + 0.02 * k), 0.99 - k * 0.04, 0.66 - k * 0.03],
        null,
        0.034 - k * 0.004,
        { color: CREAM, bone: head, sides: 6 },
      );
    // ears
    const S = s > 0 ? "L" : "R";
    const ear = b.chain(
      `ear${S}`,
      polyline([
        [s * 0.078, 1.115, 0.7],
        [s * 0.098, 1.2, 0.685],
        [s * 0.118, 1.29, 0.66],
      ]),
      { parent: head, names: [`ear${S}1`, `ear${S}2`] },
    );
    const EAR = gradient(CREAM, PLUM, [0, 1.2, 0.69], [0, 1.29, 0.66]);
    b.extrude(
      [
        [-0.05, 0],
        [0.055, 0],
        [0.045, 0.09],
        [0.01, 0.2, "sharp"],
        [-0.01, 0.12],
      ],
      {
        at: [s * 0.078, 1.115, 0.7],
        x: [s, 0, 0],
        y: [s * 0.12, 1, 0],
        thickness: 0.028,
        smoothing: 1,
        color: EAR,
        bone: ear.joints[0],
        name: `ear${S}`,
      },
    );
    b.extrude(
      [
        [-0.03, 0.01],
        [0.036, 0.01],
        [0.03, 0.075],
        [0.012, 0.15],
        [-0.004, 0.095],
      ],
      {
        at: [s * 0.078, 1.118, 0.716],
        x: [s, 0, 0],
        y: [s * 0.12, 1, 0],
        thickness: 0.012,
        color: PINK,
        bone: ear.joints[0],
        name: `earInner${S}`,
      },
    );
    // gold earring
    b.part(new THREE.TorusGeometry(0.014, 0.004, 5, 10), GOLD, {
      bone: ear.joints[0],
      at: [s * 0.128, 1.13, 0.7],
    });
    b.rod([s * 0.128, 1.116, 0.7], [s * 0.128, 1.07, 0.7], 0.003, { color: GOLD, bone: ear.joints[0], sides: 4 });
    b.part(new THREE.SphereGeometry(0.01, 6, 5), RED, { bone: ear.joints[0], at: [s * 0.128, 1.062, 0.7] });

    // eyes and kumadori
    b.decal(skin, animeEye({ iris: "#ffb02a", size: 256 }), {
      at: onSkull(s * 50, 12),
      size: [0.056, 0.077],
      mirror: s > 0,
    });
    for (const line of [
      [
        [64, 10],
        [82, 14],
        [100, 12],
        [120, 4],
      ],
      [
        [62, -4],
        [82, -6],
        [104, -12],
      ],
      [
        [58, 26],
        [78, 34],
        [98, 40],
      ],
    ])
      b.sweep(catmull(line.map(([az, el]) => onSkull(s * az, el))), [0.008, 0.0015], {
        color: RED,
        bone: head,
        sides: 5,
        caps: { start: "round", end: "point" },
      });
  }
  // forehead mark and gold crescent
  b.decal(skin, TEAR, { at: onSkull(0, 30), size: [0.026, 0.045], lift: 0.003 });
  const fh = onSkull(0, 56);
  const arcLen = Math.PI * 1.5;
  const crescent = new THREE.TorusGeometry(0.022, 0.0055, 5, 14, arcLen).rotateZ(-Math.PI / 2 - arcLen / 2);
  b.part(crescent, GOLD, { bone: head, at: offset(fh, fh, 0.006), dir: fh.axis, axis: "z", name: "crescent" });
  glow(
    b.part(new THREE.SphereGeometry(0.009, 6, 5), "#ff4a63", { bone: head, at: offset(fh, fh, 0.01), name: "gem" }),
    1.2,
  );
  // cheek tufts
  b.cards(
    skin.scatter(40, {
      rng: rand,
      minDist: 0.03,
      filter: (h) => Math.abs(h.n.x) > 0.8 && h.at.z < 0.76,
    }),
    TUFT,
    { size: [0.035, 0.07], lean: 70, bend: 20, flow: [0, -0.2, -1], vary: 0.25, rng: rand, color: CREAM },
  );

  // ------------------------------------------------------------------ legs
  const LEG = paint((p) => (p.y < 0.115 + 0.05 * zigzag((p.x + p.z) / 0.04) ? PLUM : CREAM));
  const paw = (joint: typeof head, x: number, z: number) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), PLUM, {
      bone: joint,
      at: [x, 0.032, z + 0.045],
      scale: [0.042, 0.032, 0.07],
    });
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(0.014, 6, 4), PLUM, { bone: joint, at: [x + k * 0.02, 0.018, z + 0.1] });
      b.spike([x + k * 0.02, 0.014, z + 0.108], [0, -0.2, 1], 0.034, 0.006, { color: CLAW, bone: joint, sides: 5 });
    }
  };
  const anklet = (leg: ReturnType<typeof b.chain>, t: number) => {
    const cp = leg.at(t);
    b.part(new THREE.TorusGeometry(0.04, 0.0055, 5, 12), GOLD, { at: cp, dir: cp.tangent, axis: "z" });
  };
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const front = limb([s * 0.125, 0.62, 0.22], [s * 0.125, 0.034, 0.25], [0.3, 0.3], [[0, 0, -1]]);
    const fleg = b.chain(`legF${S}`, front, {
      parent: spine.joints[2],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "leg",
    });
    b.sweep(fleg, [0.062, 0.042, 0.03], { color: LEG });
    paw(fleg.joints[fleg.joints.length - 1], s * 0.125, 0.25);
    anklet(fleg, 0.78);

    const hindPts = limb(
      [s * 0.115, 0.6, -0.38],
      [s * 0.115, 0.034, -0.4],
      [0.3, 0.3, 0.22],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hleg = b.chain(`legH${S}`, hindPts, {
      parent: pelvis,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`],
      role: "leg",
    });
    b.sweep(hleg, [0.085, 0.05, 0.034, 0.03], { color: LEG });
    b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, {
      bone: hleg.joints[0],
      at: [s * 0.135, 0.56, -0.4],
      scale: [0.088, 0.13, 0.115],
      name: `haunch${S}`,
    });
    paw(hleg.joints[hleg.joints.length - 1], s * 0.115, -0.4);
    anklet(hleg, 0.85);
  }

  // ------------------------------------------------------------------ nine tails
  const R = [0, 0.68, -0.54];
  const phis: number[] = [];
  const tipFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 9; i++) {
    const phi = (i - 4) * 17.5 * DEG;
    phis.push(phi);
    const L = 0.85 + 0.18 * Math.cos(phi);
    const sz = 0.88 + 0.12 * Math.cos(phi);
    const pts = [0, 0.22, 0.5, 0.78, 1].map((u) => [
      Math.sin(phi) * L * u * 0.92,
      R[1] + Math.cos(phi) * L * u * 0.8 + 0.12 * u * u * Math.abs(Math.sin(phi)),
      R[2] - 0.5 * L * u * (0.55 + 0.45 * Math.cos(phi)) + (i % 2 ? 0.05 : -0.05) * Math.sin(Math.PI * u),
    ]);
    const path = catmull(pts);
    const tail = b.chain(`tail${i + 1}`, path, {
      parent: pelvis,
      names: ["a", "b", "c", "d", "e"].map((l) => `tail${i + 1}${l}`),
      role: "tail",
    });
    const T = path.tangentAt(0.8);
    const coat = furEdge(RED, CREAM, {
      by: "position",
      axis: T,
      level: path.at(0.7).dot(T),
      teeth: 0.09,
      period: 0.06,
      along: [0, 0, 1],
    });
    const rad = [0.055, 0.088, 0.118, 0.112, 0.07, 0.022].map((r) => r * sz);
    const sw = b.sweep(tail, rad, { color: coat, caps: { start: "round", end: "point" }, name: `tail${i + 1}` });
    // gold band
    const rr = radiusFn(rad)(0.6)[0];
    const band = b.ring(tail.at(0.6), { count: 10, radius: rr + 0.012 });
    b.sweep(catmull(band.items, { closed: true }), 0.011, { color: GOLD, sides: 5 });
    // fur tufts toward the tip
    b.cards(
      b.surface(sw).scatter(26, { rng: rand, minDist: 0.04, filter: (h) => path.closestT(h.at) > 0.45 }),
      TUFT,
      { size: [0.045, 0.11], lean: 55, bend: 25, flow: T, vary: 0.25, rng: rand, color: coat },
    );
    tipFrames.push(frame(tail.at(1), [0, 1, 0]));
  }
  glow(
    b.cards(tipFrames, FLAME, {
      size: [0.15, 0.3],
      lean: 12,
      flow: (_f, i) => [Math.sin(phis[i]) * 0.6, 0.2, -0.3],
      cross: true,
      vary: 0.1,
      rng: rand,
    }),
    1.4,
  );

  // ------------------------------------------------------------------ floating kitsune-bi and spirit circle
  const orbs = [
    [0.72, 0.42, 0.72],
    [-0.8, 0.62, 0.5],
    [0.62, 1.15, 0.4],
    [-0.55, 1.32, 0.55],
    [-0.2, 1.62, 0.2],
    [1.05, 0.35, -0.55],
    [-1.0, 0.5, -0.7],
    [0.35, 0.75, 1.05],
  ];
  for (const [x, y, z] of orbs) {
    glow(b.part(new THREE.SphereGeometry(0.04, 8, 6), "#d8fbff", { at: [x, y, z] }), 1.4);
  }
  glow(
    b.cards(
      orbs.map(([x, y, z]) => frame([x, y + 0.02, z], [0, 1, 0])),
      FLAME,
      { size: [0.11, 0.22], cross: true, vary: 0.25, rng: rand, sink: 0.15 },
    ),
    1.3,
  );
  glow(
    b.part(new THREE.PlaneGeometry(2.3, 2.3), "#ffffff", {
      at: [0, 0.004, -0.3],
      dir: [0, 1, 0],
      axis: "z",
      texture: CIRCLE,
      name: "spiritCircle",
    }),
    1,
  );

  return b.root;
}
