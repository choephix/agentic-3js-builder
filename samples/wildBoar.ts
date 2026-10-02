import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { countershade, mottle, paint } from "../src/paint";
import { bezier, catmull } from "../src/path";
import type { Chain } from "../src/skeleton";
import { rng } from "../src/math";
import { svg } from "../src/texture";

const COAT_DARK = "#3a2118";
const COAT_MID = "#704332";
const COAT_LIGHT = "#a66a48";
const BELLY = "#b8875f";
const MANE = "#211512";
const MANE_HIGHLIGHT = "#4b2a20";
const TUSK = "#ead4a2";
const TUSK_SHADE = "#9e7c52";
const NOSE = "#201716";
const EYE = "#d89a32";
const PUPIL = "#120e0c";
const HOOF = "#28201d";
const SCAR = "#b54f32";
const MUD = "#5a3026";
const GOLD = "#d49a38";

const coat = countershade(
  mottle(COAT_DARK, mottle(COAT_MID, COAT_LIGHT, { size: 0.1, seed: 9 }), { size: 0.22, seed: 17 }),
  BELLY,
  { level: 0.12, soft: 0.3 },
);
const manePaint = mottle(MANE, MANE_HIGHLIGHT, { size: 0.11, seed: 23 });
const tuskPaint = countershade(TUSK, TUSK_SHADE, { level: 0.35, soft: 0.25 });
const scarPaint = paint((_p, n) => (n.y > 0.2 ? SCAR : MUD));

export const meta = {
  name: "Warcrest Wild Boar",
  description: "A broad-shouldered Warcraft-style wild boar with a bristling mane, curling tusks, muddy hide, and a battle-scarred snout.",
  style: "Blizzard/Warcraft",
  commit: "e503085",
};

export default function build() {
  const b = createBuilder({ name: "wildBoar", detail: 0.82, paintSize: 1024 });
  const seg = (n: number, d = 1) => b.segments(n, d);

  // The skeleton is deliberately neutral and readable: heavy hips, a level spine, four planted legs,
  // a flexible neck and a separate jaw, with an articulated tail and ear hinges.
  const hips = b.joint("hips", { at: [0, 0.68, -0.28], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      hips.at,
      [0, 0.75, -0.02],
      [0, 0.8, 0.28],
      [0, 0.79, 0.58],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      spine.tip!.at,
      [0, 0.84, 0.76],
      [0, 0.83, 0.91],
      [0, 0.85, 1.04],
    ]),
    { parent: spine.tip!, names: ["neck1", "neck2", "neck3", "neck4"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip!, at: neck.tip!.at, dir: [0, -0.03, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.08, down: 0.14 }),
    aim: head.local({ forward: 0.5, down: 0.15 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      hips.at,
      [0, 0.66, -0.62],
      [0, 0.72, -0.88],
      [0, 0.83, -1.08],
      [0, 0.98, -1.18],
    ]),
    { parent: hips, names: ["tailBase", "tail2", "tail3", "tail4", "tailTip"], role: "tail" },
  );

  const legData = [
    { s: 1, z: 0.45, front: true },
    { s: -1, z: 0.45, front: true },
    { s: 1, z: -0.42, front: false },
    { s: -1, z: -0.42, front: false },
  ];
  const legs: Array<{ s: number; front: boolean; chain: Chain }> = [];
  for (const { s, z, front } of legData) {
    const side = s > 0 ? "L" : "R";
    const root = [s * (front ? 0.23 : 0.25), front ? 0.73 : 0.66, z] as [number, number, number];
    const knee = [s * (front ? 0.29 : 0.31), front ? 0.45 : 0.42, z + (front ? 0.06 : -0.1)] as [number, number, number];
    const ankle = [s * (front ? 0.28 : 0.3), 0.16, z + (front ? 0.1 : -0.12)] as [number, number, number];
    const hoof = [s * (front ? 0.28 : 0.3), 0.09, z + (front ? 0.13 : -0.14)] as [number, number, number];
    const chain = b.chain(
      `${front ? "fore" : "hind"}${side}`,
      catmull([root, knee, ankle, hoof]),
      {
        parent: front ? spine.joints[2] : hips,
        names: [front ? `shoulder${side}` : `thigh${side}`, `${front ? "elbow" : "knee"}${side}`, `${front ? "wrist" : "hock"}${side}`, `${front ? "foreHoof" : "hindHoof"}${side}`],
        role: "leg",
        contact: [hoof[0], 0, hoof[2]],
      },
    );
    legs.push({ s, front, chain });
  }

  const earChains = [-1, 1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const base = head.local([s * 0.2, 0.03, 0.14]);
    const tip = head.local([s * 0.31, 0.1, 0.1]);
    return b.chain(`ear${side}`, catmull([base, [tip.x, tip.y + 0.05, tip.z + 0.03], tip]), {
      parent: head,
      names: [`ear${side}`, `earMid${side}`, `earTip${side}`],
      role: "hinge",
    });
  });

  // Main silhouette: a deep, faceted barrel and a sloping neck, with countershading under the belly.
  const body = b.sweep(spine, [0.31, 0.36, 0.38, 0.3], {
    color: coat,
    shift: [0, -0.05],
    sides: 9,
    smooth: false,
    section: "circle",
  });
  const neckTube = b.sweep(neck, [0.25, 0.3], {
    color: coat,
    shift: [0, -0.02],
    sides: 8,
    smooth: false,
    section: "circle",
  });
  const muzzlePath = bezier(head.local({ forward: 0.03, down: 0.02 }), head.local({ forward: 0.2, down: 0.05 }), head.local({ forward: 0.38, down: 0.09 }), head.local({ forward: 0.48, down: 0.07 }));
  b.sweep(muzzlePath, [0.2, 0.14], { bone: head, color: coat, sides: 8, smooth: false });
  b.sweep(
    bezier(jaw.at, jaw.local({ forward: 0.18, up: -0.01 }), jaw.local({ forward: 0.42, up: -0.02 }), jaw.local({ forward: 0.5, up: -0.02 })),
    [0.16, 0.08],
    { bone: jaw, color: coat, sides: 8, smooth: false },
  );

  // Ears, feet and tail retain the chunky, hand-painted puppet language.
  for (const ear of earChains) {
    b.sweep(ear, [0.105, 0.025], { color: coat, sides: 6, smooth: false, caps: "point" });
    const side = ear.joints[0].at.x > 0 ? 1 : -1;
    b.part(new THREE.ConeGeometry(0.07, 0.018, seg(5)), MANE, {
      bone: ear.tip!,
      at: ear.tip!.local({ down: 0.005 }),
      dir: [0, 1, 0],
      flat: true,
      scale: [1, 1, 1.7],
      name: `earInner${side > 0 ? "L" : "R"}`,
    });
  }
  const tailTube = b.sweep(tail, (t) => 0.065 * (1 - t) + 0.015, {
    color: coat,
    bands: [[0.72, MANE]],
    sides: 7,
    smooth: false,
    caps: { end: "point" },
  });

  for (const { s, front, chain } of legs) {
    const side = s > 0 ? "L" : "R";
    b.sweep(chain, [front ? 0.145 : 0.16, 0.105, 0.07, 0.063], {
      color: coat,
      sides: 7,
      smooth: false,
      section: "circle",
    });
    const hoof = chain.tip!;
    for (const toe of [-1, 1]) {
      b.part(new THREE.BoxGeometry(0.075, 0.15, 0.21), HOOF, {
        bone: hoof,
        at: hoof.local({ left: toe * 0.043, down: 0.015, forward: 0.025 }),
        flat: true,
        name: `clovenHoof${side}${front ? "F" : "B"}${toe}`,
      });
      b.part(new THREE.BoxGeometry(0.065, 0.02, 0.18), TUSK_SHADE, {
        bone: hoof,
        at: hoof.local({ left: toe * 0.043, up: 0.05, forward: 0.025 }),
        name: `hoofRim${side}${front ? "F" : "B"}${toe}`,
      });
    }
  }

  // Brow, cheeks, and a broad nose turn the otherwise simple primitives into a readable hero head.
  b.part(new THREE.SphereGeometry(0.29, seg(10), seg(7)), coat, {
    bone: head,
    at: head.at,
    scale: [1.0, 0.9, 1.18],
    flat: true,
    name: "skull",
  });
  b.part(new THREE.SphereGeometry(0.16, seg(8), seg(5)), NOSE, {
    bone: head,
    at: head.local({ forward: 0.49, down: 0.08 }),
    scale: [1.2, 0.72, 0.82],
    flat: true,
    name: "muddyNose",
  });
  for (const s of [-1, 1]) {
    const eyeAt = head.local([s * 0.235, 0.15, 0.155]);
    b.part(new THREE.SphereGeometry(0.055, seg(8), seg(6)), EYE, { bone: head, at: eyeAt, flat: true, name: `eyeGold${s > 0 ? "L" : "R"}` });
    b.part(new THREE.SphereGeometry(0.025, seg(7), seg(5)), PUPIL, {
      bone: head,
      at: head.local([s * 0.26, 0.18, 0.16]),
      flat: true,
      name: `eyePupil${s > 0 ? "L" : "R"}`,
    });
    b.spike(head.local([s * 0.23, 0.09, 0.22]), head.local([s * 0.265, 0.24, 0.17]), null, 0.045, {
      bone: head,
      color: MANE,
      caps: "point",
      name: `browRidge${s > 0 ? "L" : "R"}`,
    });
    for (let i = 0; i < 3; i++) {
      b.spike(
        head.local([s * (0.29 + i * 0.018), 0.09 - i * 0.02, 0.02 - i * 0.04]),
        [s * 0.25, 0.1, 0.05],
        0.1 + i * 0.018,
        0.012,
        { bone: head, color: MANE_HIGHLIGHT, caps: "point", name: `cheekWhisker${s > 0 ? "L" : "R"}${i}` },
      );
    }
    b.part(new THREE.SphereGeometry(0.027, seg(6), seg(4)), NOSE, {
      bone: head,
      at: head.local({ forward: 0.615, right: -s * 0.075, down: 0.065 }),
      flat: true,
      name: `nostril${s > 0 ? "L" : "R"}`,
    });
  }

  // Hero tusks curl forward and upward from the cheeks; a dark root collar makes the ivory read at distance.
  for (const s of [-1, 1]) {
    const side = s > 0 ? "L" : "R";
    const tuskBase = head.local([s * 0.16, 0.33, -0.15]);
    const tusk = bezier(
      tuskBase,
      head.local([s * 0.34, 0.42, -0.2]),
      head.local([s * 0.4, 0.5, 0.02]),
      head.local([s * 0.32, 0.47, 0.27]),
    );
    b.sweep(tusk, [0.072, 0], { bone: jaw, color: tuskPaint, caps: { start: "round", end: "point" }, sides: 7, smooth: false, name: `tusk${side}` });
    b.sweep(
      bezier(tuskBase, head.local([s * 0.18, 0.35, -0.16]), head.local([s * 0.2, 0.37, -0.15])),
      [0.07, 0.035],
      { bone: jaw, color: MANE, caps: "round", sides: 7, name: `tuskRoot${side}` },
    );
  }

  // A painted scar and cheek plate are restrained Warcraft-style storytelling details.
  b.sweep(
    bezier(head.local({ forward: 0.24, up: 0.08, right: 0.18 }), head.local({ forward: 0.28, up: 0.02, right: 0.21 }), head.local({ forward: 0.31, down: 0.05, right: 0.22 })),
    [0.012, 0.002],
    { bone: head, color: scarPaint, caps: "point", name: "cheekScar" },
  );
  for (const s of [-1, 1]) {
    b.part(new THREE.TorusGeometry(0.105, 0.012, seg(4), seg(8), Math.PI * 1.35), GOLD, {
      bone: head,
      at: head.local([s * 0.24, 0.03, 0.17]),
      rotation: [0, s * 18, 90],
      flat: true,
      name: `cheekRing${s > 0 ? "L" : "R"}`,
    });
  }

  // The defining bristly mane: three staggered rows of conical bristles catch the top light.
  const maneCount = 19;
  for (let i = 0; i < maneCount; i++) {
    const t = i / (maneCount - 1);
    const at = body.at(0.08 + t * 0.86, 0);
    const length = 0.12 + 0.09 * Math.sin(Math.PI * t);
    b.spike(at, at, length, 0.032, { color: i % 3 === 0 ? MANE_HIGHLIGHT : manePaint, caps: "point", name: `maneBristle${i}` });
    if (i > 2 && i < maneCount - 2) {
      const left = body.at(0.08 + t * 0.86, -24);
      const right = body.at(0.08 + t * 0.86, 24);
      b.spike(left, left, length * 0.55, 0.02, { color: MANE, caps: "point", name: `maneFlankL${i}` });
      b.spike(right, right, length * 0.55, 0.02, { color: MANE, caps: "point", name: `maneFlankR${i}` });
    }
  }
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const at = neckTube.at(t, 0);
    b.spike(at, at, 0.13 + 0.06 * Math.sin(Math.PI * t), 0.03, { color: MANE, caps: "point", name: `neckMane${i}` });
  }
  for (let i = 0; i < 5; i++) {
    const at = tailTube.at(0.7 + i * 0.065, 0);
    b.spike(at, at, 0.1 - i * 0.01, 0.025, { color: MANE, caps: "point", name: `tailTuft${i}` });
  }

  // Tiny raised hide plates break up the large barrel without losing the primitive silhouette.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const t = 0.18 + i * 0.11;
      const hit = body.at(t, s * 72, 0.01);
      b.part(new THREE.SphereGeometry(0.042, seg(6), seg(4)), COAT_LIGHT, {
        bone: hit.bone,
        at: hit.at,
        scale: [1.7, 0.45, 0.8],
        flat: true,
        name: `hidePlate${s > 0 ? "L" : "R"}${i}`,
      });
    }
  }
  const fur = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128"><path fill="#382016" d="M4 128L8 35 20 78 21 0 34 57 46 10 44 72 60 39 57 128Z"/><path fill="#794631" d="M14 125L22 45 27 119 41 38 37 126Z"/><path fill="#ad7550" d="M23 105L26 66 29 116 46 72 39 117Z"/></svg>`, { size: 256 });
  const hide = b.surface([body, neckTube]);
  b.cards(hide.scatter(105, { rng: rng(18), minDist: 0.06, filter: (h) => h.n.y > 0.15 }), fur, {
    size: [0.05, 0.1], lean: 68, bend: 16, flow: [0, -0.2, -1], vary: 0.22, rng: rng(33),
  });

  return b.root;
}
