import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { countershade, gradient, mottle } from "../src/paint";
import type { Chain, Joint } from "../src/skeleton";
import type { SweepPoint } from "../src/sweep";
import { svg } from "../src/texture";

export const meta = {
  name: "Warthog · Kimi",
  description:
    "A common warthog in a standing rest pose: long flat head with facial warts and two pairs of curved tusks, a separate lower jaw, bristly mane down the neck and spine, and a thin tail with a tuft carried upright.",
};

const HIDE = "#7d6b55";
const HIDE_DARK = "#5f5140";
const BELLY = "#a08b70";
const SNOUT = "#55493c";
const MANE = "#372d22";
const TUSK = "#eae0c8";
const HOOF = "#2e2821";
const EYE = "#161310";
const NOSE = "#211c17";

export default function build() {
  const b = createBuilder({ name: "warthog" });
  const R = rng(41);

  // Hide: grey-brown, mottled, countershaded to a lighter belly.
  const coat = countershade(mottle(HIDE, HIDE_DARK, { size: 0.16, seed: 11, contrast: 0.55 }), BELLY, {
    level: -0.15,
    soft: 0.5,
  });
  const legCoat = gradient(coat, "#4a4034", [0, 0.5, 0], [0, 0.02, 0]);

  // ---- Skeleton ----
  const hips = b.joint("hips", { at: [0, 0.55, -0.4], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.55, -0.4],
      [0, 0.575, -0.12],
      [0, 0.6, 0.18],
      [0, 0.6, 0.32],
    ],
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.6, 0.32],
      [0, 0.615, 0.45],
      [0, 0.63, 0.55],
    ],
    { names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { at: neck.at(1), dir: [0, -0.12, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.03, -0.08]),
    aim: head.local([0, 0.3, -0.13]),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    [
      [0, 0.6, -0.55],
      [0, 0.72, -0.68],
      [0, 0.86, -0.71],
      [0, 0.93, -0.64],
    ],
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // Legs: hip, knee (elbow/stifle), cannon (carpus/hock), hoof tip.
  const legs: { chain: Chain; tip: Joint; s: number; front: boolean }[] = [];
  for (const s of [1, -1]) {
    const frontPts = limb([s * 0.13, 0.52, 0.26], [s * 0.1, 0.035, 0.3], [0.22, 0.19, 0.12], [
      [0, 0, -1],
      [0, 0, 1],
    ]);
    const front = b.chain(`legF${s > 0 ? "L" : "R"}`, frontPts, {
      parent: spine.joints[2],
      names: [`hipF${s > 0 ? "L" : "R"}`, `kneeF${s > 0 ? "L" : "R"}`, `cannonF${s > 0 ? "L" : "R"}`, `hoofF${s > 0 ? "L" : "R"}`],
      role: "leg",
    });
    const hindPts = limb([s * 0.15, 0.53, -0.38], [s * 0.13, 0.035, -0.42], [0.24, 0.21, 0.13], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hind = b.chain(`legH${s > 0 ? "L" : "R"}`, hindPts, {
      parent: hips,
      names: [`hipH${s > 0 ? "L" : "R"}`, `stifleH${s > 0 ? "L" : "R"}`, `hockH${s > 0 ? "L" : "R"}`, `hoofH${s > 0 ? "L" : "R"}`],
      role: "leg",
    });
    legs.push({ chain: front, tip: front.tip!, s, front: true });
    legs.push({ chain: hind, tip: hind.tip!, s, front: false });
  }

  // ---- Body ----
  const bodyPath = catmull([
    [0, 0.5, -0.5],
    [0, 0.51, -0.34],
    [0, 0.525, -0.08],
    [0, 0.535, 0.12],
    [0, 0.545, 0.28],
    [0, 0.555, 0.44],
  ]);
  const keyT = [0, 0.2, 0.45, 0.7, 0.9, 1];
  const keyRx = [0.1, 0.145, 0.165, 0.16, 0.13, 0.095];
  const keyRy = [0.12, 0.165, 0.19, 0.215, 0.18, 0.13];
  const keyed = (keys: number[]) => (t: number) => {
    let i = 0;
    while (i < keyT.length - 2 && t > keyT[i + 1]) i++;
    const u = Math.min(1, Math.max(0, (t - keyT[i]) / (keyT[i + 1] - keyT[i])));
    const sm = u * u * (3 - 2 * u);
    return keys[i] + (keys[i + 1] - keys[i]) * sm;
  };
  const rx = keyed(keyRx);
  const ry = keyed(keyRy);
  const body = b.sweep(bodyPath, (t) => [rx(t), ry(t)], {
    bone: [spine, neck],
    shift: [0, -0.02],
    color: coat,
    name: "body",
  });

  const neckTube = b.sweep(neck, [0.115, 0.095], { color: coat, name: "neck" });

  // ---- Head: long and flat, skinned to the head bone ----
  const headLoft = b.loft(
    [
      { at: head.local([0, -0.02, 0.01]), w: 0.21, h: 0.2 },
      { at: head.local([0, 0.08, 0]), w: 0.2, h: 0.175 },
      { at: head.local([0, 0.18, -0.02]), w: 0.155, h: 0.135 },
      { at: head.local([0, 0.28, -0.035]), w: 0.12, h: 0.105 },
      { at: head.local([0, 0.32, -0.04]), w: 0.105, h: 0.09 },
    ],
    { bone: head, color: coat, name: "head" },
  );

  // Snout disc with nostrils.
  b.part(new THREE.CylinderGeometry(0.048, 0.044, 0.028, 10), SNOUT, {
    bone: head,
    at: head.local([0, 0.325, -0.042]),
    dir: head.dir([0, 1, -0.12]),
    flat: true,
    name: "snoutDisc",
  });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.016, 5, 4), NOSE, {
      bone: head,
      at: head.local([s * 0.022, 0.338, -0.037]),
      scale: [1, 0.5, 1.2],
      name: "nostril",
    });

  // Lower jaw: its own tube on the jaw bone so the mouth can open.
  b.sweep(
    bezier(jaw.at, head.local([0, 0.14, -0.115]), head.local([0, 0.27, -0.105])),
    [0.045, 0.026],
    { bone: jaw, color: gradient(coat, SNOUT, head.local([0, 0.1, -0.1]), head.local([0, 0.3, -0.1])), name: "jaw" },
  );

  // Tusks: upper pair long, curving up out of the snout sides; lower pair short and sharp on the jaw.
  for (const s of [1, -1]) {
    b.sweep(
      bezier(
        head.local([s * 0.055, 0.19, -0.03]),
        head.local([s * 0.115, 0.23, -0.005]),
        head.local([s * 0.135, 0.31, 0.16]),
      ),
      [0.024, 0.004],
      { bone: head, color: TUSK, caps: { start: "flat", end: "point" }, name: "tuskUpper" },
    );
    b.sweep(
      bezier(
        head.local([s * 0.04, 0.12, -0.08]),
        head.local([s * 0.06, 0.15, -0.05]),
        head.local([s * 0.055, 0.21, 0.06]),
      ),
      [0.015, 0.002],
      { bone: jaw, color: TUSK, caps: { start: "flat", end: "point" }, name: "tuskLower" },
    );
  }

  // Facial warts: a big pair below the eyes, a smaller pair on the snout.
  const face = b.surface(headLoft);
  for (const s of [1, -1]) {
    b.stick(new THREE.SphereGeometry(0.034, 6, 4), HIDE_DARK, face.nearest(head.local([s * 0.1, 0.09, -0.02])), {
      embed: 0.45,
      scale: [1, 0.75, 0.9],
      name: "wart",
    });
    b.stick(new THREE.SphereGeometry(0.016, 5, 4), HIDE_DARK, face.nearest(head.local([s * 0.065, 0.25, -0.005])), {
      embed: 0.45,
      scale: [1, 0.7, 0.9],
      name: "wart",
    });
  }

  // Pale bristle whiskers fanning from the cheeks and jaw.
  const whiskerTex = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#ffffff" stroke-width="2.4" stroke-linecap="round">
        <path d="M8 64 L5 4"/><path d="M14 64 L13 2"/><path d="M19 64 L21 5"/>
        <path d="M24 64 L27 8"/><path d="M16 64 L16 14"/><path d="M11 64 L9 18"/>
      </g>
    </svg>`,
    { size: 128 },
  );
  const whiskerFrames = [];
  for (const s of [1, -1])
    for (const p of [
      [s * 0.07, 0.08, -0.07],
      [s * 0.08, 0.13, -0.08],
      [s * 0.075, 0.18, -0.07],
    ])
      whiskerFrames.push(face.nearest(head.local(p as [number, number, number])).moved([0, 0.004, 0]));
  b.cards(whiskerFrames, whiskerTex, {
    size: [0.04, 0.11],
    lean: 62,
    bend: 20,
    vary: 0.3,
    spin: 12,
    rng: R,
    color: "#e5dcc2",
    name: "whiskers",
  });

  // Eyes: small, set high on the head.
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.015, 6, 4), EYE, {
      bone: head,
      at: head.local([s * 0.08, 0.045, 0.055]),
      name: "eye",
    });

  // Ears on hinge joints: broad pointed blades facing out to the sides.
  for (const s of [1, -1]) {
    const ear = b.joint(`ear${s > 0 ? "L" : "R"}`, {
      parent: head,
      at: head.local([s * 0.085, -0.01, 0.05]),
      dir: [s * 0.85, 0.55, -0.1],
      role: "hinge",
    });
    b.extrude(
      [
        [-0.032, 0],
        [0.045, 0],
        [0.068, 0.062],
        [0.018, 0.12, "sharp"],
        [-0.04, 0.062],
      ],
      {
        at: ear.at,
        bone: ear,
        x: [0, 0.3, 0.95],
        y: [s * 0.3, 1, 0],
        thickness: [0.014, 0.004],
        bevel: 0.003,
        smoothing: 1,
        color: HIDE_DARK,
        name: "ear",
      },
    );
  }

  // Legs and cloven hooves.
  for (const leg of legs) {
    b.sweep(leg.chain, leg.front ? [0.07, 0.052, 0.038, 0.028] : [0.085, 0.055, 0.04, 0.028], {
      color: legCoat,
      name: "leg",
    });
    for (const t of [1, -1]) {
      const hoofAt = leg.tip.local([t * 0.021, -0.01, 0.005]);
      b.part(new THREE.BoxGeometry(0.036, 0.07, 0.055), HOOF, {
        bone: leg.tip,
        at: [hoofAt.x, 0.032, hoofAt.z],
        rotation: [0, t * 6, 0],
        flat: true,
        name: "hoof",
      });
    }
  }

  // Tail: thin, carried upright, dark tuft at the tip.
  b.sweep(tail, [0.026, 0.011], { color: coat, name: "tail" });
  const tuftTex = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#2c241b" stroke-width="3" stroke-linecap="round">
        <path d="M16 64 L10 6"/><path d="M16 64 L22 8"/><path d="M16 64 L16 2"/>
        <path d="M16 64 L4 16"/><path d="M16 64 L28 18"/><path d="M16 64 L12 20"/><path d="M16 64 L20 24"/>
      </g>
    </svg>`,
    { size: 128 },
  );
  const tailTip = tail.tip ?? tail.joints[tail.joints.length - 1];
  const tuft = b.ring(tailTip, { count: 6, radius: 0.012, tilt: -15 });
  b.cards(tuft.items, tuftTex, {
    size: [0.04, 0.12],
    lean: 25,
    bend: 25,
    vary: 0.25,
    rng: R,
    cross: true,
    color: MANE,
    name: "tailTuft",
  });

  // Mane: dark bristles standing along the neck and spine.
  const bristleTex = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#372d22" stroke-width="2.6" stroke-linecap="round">
        <path d="M6 64 L4 4"/><path d="M12 64 L11 2"/><path d="M17 64 L18 6"/>
        <path d="M23 64 L25 3"/><path d="M28 64 L30 10"/><path d="M15 64 L14 14"/><path d="M26 64 L27 16"/>
      </g>
    </svg>`,
    { size: 128 },
  );
  const maneFrames: SweepPoint[] = [];
  maneFrames.push(...b.along(neckTube, 8, () => {}, { from: 0.05, to: 0.95 }));
  maneFrames.push(...b.along(body, 16, () => {}, { from: 0.12, to: 0.97 }));
  b.cards(maneFrames, bristleTex, {
    size: [0.045, 0.11],
    lean: 35,
    bend: 20,
    vary: 0.35,
    spin: 8,
    rng: R,
    color: MANE,
    name: "mane",
  });

  return b.root;
}
