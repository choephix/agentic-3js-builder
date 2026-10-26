import * as THREE from "three";
import { createBuilder, limb, catmull, bezier, type Builder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Five-Headed Hydra",
  description: "God of War style five-headed hydra: scarred dark-green hide, bone horns, ember eyes, blood-red mouths.",
};

export const REQUESTS = [
  {
    id: "brokenBlade",
    kind: "add",
    part: "body",
    what: "A broken Spartan blade lodged in the back behind the shoulders: a chipped bronze blade stump, a bronze guard, a splintered grip, and dried BLOOD streaks around the wound.",
    at: [0.35, 2.15, 0.1],
    normal: [0.3, 1, 0],
    bone: "spine2",
    room: [0.5, 0.8, 0.3],
  },
  {
    id: "shackleChain",
    kind: "add",
    part: "neck0",
    what: "Heavy IRON shackle clamped round the lower part of the far-right neck, with 4 broken chain links hanging from it and a BRONZE rivet ring.",
    at: [-0.6, 2.4, 0.85],
    normal: [-1, 0, 0],
    bone: "neck0a",
    room: [0.6, 0.5, 0.6],
  },
  {
    id: "warScarsChest",
    kind: "add",
    part: "body",
    what: "Three raised parallel claw-scar ridges in BLOOD across the left flank, plus a few stitched BONE staples along them.",
    at: [0.8, 1.45, -0.1],
    normal: [1, 0, 0],
    bone: "spine2",
    room: [0.25, 0.6, 0.9],
  },
  {
    id: "centerHeadFire",
    kind: "add",
    part: "skull2",
    what: "Ember fire licking out of the central head's open mouth: layered flame blades in EMBER and EYE yellow, with sparks, glowing.",
    at: [0, 4.25, 3.0],
    normal: [0, 0, 1],
    bone: "jaw2",
    room: [0.5, 0.5, 0.7],
  },
  {
    id: "spearsInNeck",
    kind: "add",
    part: "neck1",
    what: "Two broken Greek spear shafts and a rusted spearhead stuck in the second neck, with a tattered RED cloth strip tied to one.",
    at: [-0.65, 3.3, 1.0],
    normal: [-1, 0, 0],
    bone: "neck1b",
    room: [0.8, 0.9, 0.4],
  },
  {
    id: "hornRings",
    kind: "add",
    part: "skull2",
    what: "Bronze rings and carved Greek-key bands around the bases of the central head's two horns.",
    at: [0.16, 4.5, 1.9],
    normal: [0.5, 1, 0],
    bone: "head2",
    room: [0.5, 0.3, 0.4],
  },
  {
    id: "legArmorBones",
    kind: "add",
    part: "legFL",
    what: "Bone-plate bracers and spurs on the front legs' knees, studded, edged in BRONZE.",
    at: [0.82, 0.75, 0.55],
    normal: [1, 0, 0],
    bone: "kneeFL",
    room: [0.4, 0.4, 0.4],
  },
  {
    id: "tailBlades",
    kind: "add",
    part: "tail",
    what: "Row of jagged bone blades along the upper tail ridge, each with a darker root and a pale tip, growing smaller to the tip.",
    at: [0, 1.0, -2.4],
    normal: [0, 1, 0],
    bone: "tail2",
    room: [0.4, 0.5, 2.0],
  },
  {
    id: "bodyHide",
    kind: "texture",
    part: "body",
    what: "Layered dark scale plates in SCALE and SCALE_DARK with cracks and scars on the back, pale BELLY ribbed bands underneath, ash grime on the flanks.",
  },
  {
    id: "neckHide",
    kind: "texture",
    part: "neck2",
    what: "Scale pattern on the necks darkening toward the head, belly ribs in BELLY on the underside, a few BLOOD-red scratches.",
  },
  {
    id: "headWarpaint",
    kind: "texture",
    part: "skull2",
    what: "Cracked scale plates and ritual BLOOD streaks running from the eyes down the snout.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const SCALE = "#3d4d3b";
export const SCALE_DARK = "#222c25";
export const BELLY = "#a89a6a";
export const BELLY_D = "#6c6240";
export const BONE = "#d9cfae";
export const RED = "#a3201a";
export const BLOOD = "#5e0d0f";
export const EMBER = "#ff6a1a";
export const EYE = "#ffb020";
export const BRONZE = "#8a5a2a";
export const IRON = "#3a3a40";

export default function build() {
  const b = createBuilder({ name: "hydra" });

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 1.3, -0.8], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.3, -0.8],
      [0, 1.4, 0],
      [0, 1.5, 0.9],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.tip!;

  const tailPath = catmull([
    [0, 1.3, -0.8],
    [0, 1.0, -2],
    [0, 0.5, -3.2],
    [0, 0.2, -4.3],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" });

  // ---- body
  const body = b.sweep(spine, (t) => [0.75 + 0.1 * Math.sin(t * 3), 0.68 + 0.1 * t], {
    color: SCALE,
    sectors: [[125, 235, BELLY]],
    name: "body",
  });
  b.sweep(tail, [0.52, 0.05], {
    color: SCALE,
    sectors: [[125, 235, BELLY_D]],
    name: "tail",
  });
  const tailSw = b.sweep(tail, [0.52, 0.05], { color: SCALE, name: "tailCore" });
  b.along(body, 7, (at) => b.spike(at, at, 0.22, 0.07, { color: BONE }));
  b.along(tailSw, 6, (at) => b.spike(at, at, 0.28 - at.t * 0.2, 0.06, { color: BONE }));
  // shoulder hump + armour ridge
  b.part(new THREE.SphereGeometry(0.5, 8, 6), SCALE_DARK, { bone: chest, at: [0, 1.95, 0.55], scale: [1.2, 0.6, 1.1] });
  b.part(new THREE.SphereGeometry(0.4, 8, 6), SCALE_DARK, { bone: hips, at: [0, 1.85, -0.9], scale: [1.2, 0.5, 1.1] });

  // ---- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const z = front ? 0.55 : -0.9;
      const tag = (front ? "F" : "H") + side;
      const pts = limb([s * 0.6, 1.25, z], [s * 0.88, 0.14, z + 0.1], [0.68, 0.68], [[0, 0, front ? 1 : -1]]);
      const leg = b.chain(`leg${tag}`, pts, {
        parent: front ? spine.joints[1] : hips,
        names: [`hip${tag}`, `knee${tag}`, `foot${tag}`],
        role: "leg",
      });
      b.sweep(leg, [0.3, 0.15], { color: SCALE, name: `leg${tag}` });
      const foot = pts[2];
      const ft = leg.tip!;
      b.part(new THREE.SphereGeometry(0.2, 8, 6), SCALE_DARK, {
        bone: ft,
        at: [foot.x, 0.12, foot.z + 0.08],
        scale: [1.1, 0.6, 1.4],
      });
      for (const k of [-1, 0, 1])
        b.spike([foot.x + k * 0.1, 0.1, foot.z + 0.3], [k * 0.25, -0.25, 1], 0.28, 0.045, { color: BONE, bone: ft });
      // knee spur
      b.spike(pts[1], [s, 0.3, front ? 0.4 : -0.4], 0.3, 0.07, { color: BONE, bone: leg.joints[1] });
    }
  }

  // ---- heads
  const hs = [0.95, 1.05, 1.3, 1.05, 0.95];
  const heightH = [3.9, 4.5, 4.9, 4.5, 3.9];
  const zF = [1.9, 2.1, 2.3, 2.1, 1.9];
  for (let i = 0; i < 5; i++) {
    const a = i - 2;
    const h = hs[i];
    const pts: number[][] = [
      [-a * 0.3, 1.6, 0.6],
      [-a * 0.75, 2.5, 0.9],
      [-a * 1.15, heightH[i] - 0.8, 1.0],
      [-a * 1.4, heightH[i], zF[i]],
    ];
    // i=0 is far right (x negative)
    const L = 0;
    void L;
    const letters = ["a", "b", "c"];
    const neck = b.chain(`neck${i}`, catmull(pts), {
      parent: chest,
      names: letters.map((l) => `neck${i}${l}`),
      role: "neck",
    });
    const sw = b.sweep(neck, (t) => 0.36 * (1 - t) + 0.17 * h, {
      color: SCALE,
      sectors: [[125, 235, BELLY]],
      name: `neck${i}`,
    });
    b.along(sw, 4, (at) => b.spike(at, at, 0.17, 0.05, { color: BONE }));

    const end = pts[3];
    const head = b.joint(`head${i}`, { at: end, dir: [-a * 0.15, -0.3, 1], role: "head" });
    const jaw = b.joint(`jaw${i}`, {
      parent: head,
      at: head.local({ forward: 0.0, up: -0.08 * h }),
      aim: head.local({ forward: 0.4 * h, up: -0.1 * h }),
      role: "jaw",
    });
    const P = (f: number, u: number, r: number) => head.local({ forward: f * h, up: u * h, left: r * h });
    const Jp = (f: number, u: number, r: number) => jaw.local({ forward: f * h, up: u * h, left: r * h });

    b.frustumBox(P(-0.12, 0, 0), P(0.3, 0, 0), [0.38 * h, 0.3 * h], [0.24 * h, 0.2 * h], {
      bone: head, color: SCALE, name: `skull${i}`,
    });
    b.frustumBox(P(0.3, -0.01, 0), P(0.64, -0.02, 0), [0.24 * h, 0.17 * h], [0.17 * h, 0.12 * h], {
      bone: head, color: SCALE_DARK, name: `snout${i}`,
    });
    b.frustumBox(Jp(-0.05, 0, 0), Jp(0.6, -0.01, 0), [0.3 * h, 0.08 * h], [0.15 * h, 0.06 * h], {
      bone: jaw, color: BELLY_D, name: `lowerJaw${i}`,
    });
    b.part(new THREE.BoxGeometry(0.17 * h, 0.02 * h, 0.4 * h), BLOOD, { bone: jaw, at: Jp(0.3, 0.045, 0) });
    b.part(new THREE.BoxGeometry(0.2 * h, 0.03 * h, 0.5 * h), BLOOD, { bone: head, at: P(0.3, -0.1, 0) });
    for (const s of [1, -1]) {
      for (let k = 0; k < 4; k++) {
        b.spike(P(0.22 + k * 0.12, -0.1, s * 0.09), [0, -1, 0], 0.1 * h, 0.018 * h, { bone: head, color: BONE });
        b.spike(Jp(0.16 + k * 0.12, 0.04, s * 0.08), [0, 1, 0], 0.09 * h, 0.017 * h, { bone: jaw, color: BONE });
      }
      glow(
        b.part(new THREE.SphereGeometry(0.05 * h, 6, 4), EYE, { bone: head, at: P(0.14, 0.1, s * 0.15) }),
        1.6,
      );
      b.part(new THREE.BoxGeometry(0.1 * h, 0.035 * h, 0.17 * h), SCALE_DARK, {
        bone: head, at: P(0.13, 0.16, s * 0.14), rotation: [0, 0, -s * 22],
      });
      b.part(new THREE.SphereGeometry(0.02 * h, 5, 4), "#0a0d0b", { bone: head, at: P(0.63, 0.05, s * 0.05) });
      // horns
      b.sweep(bezier(P(-0.05, 0.14, s * 0.12), P(-0.3, 0.4, s * 0.28), P(-0.7, 0.3, s * 0.34)), [0.06 * h, 0.0], {
        bone: head, color: BONE, caps: { start: "flat", end: "point" }, name: `horn${i}`,
      });
      // cheek spikes
      b.spike(P(-0.08, -0.02, s * 0.2), [s, 0.15, -0.6], 0.24 * h, 0.045 * h, { bone: head, color: BONE });
      b.spike(P(0.05, -0.04, s * 0.18), [s, 0.0, -0.5], 0.16 * h, 0.035 * h, { bone: head, color: BONE });
    }
    // brow crest and snout ridge
    b.spike(P(0.0, 0.15, 0), [0, 1, -0.5], 0.2 * h, 0.05 * h, { bone: head, color: BONE });
    b.spike(P(0.4, 0.09, 0), [0, 1, 0.1], 0.07 * h, 0.03 * h, { bone: head, color: BONE });
    // scar across one eye
    if (i % 2 === 1) {
      const s = i === 1 ? 1 : -1;
      b.part(new THREE.BoxGeometry(0.02 * h, 0.012 * h, 0.3 * h), RED, {
        bone: head, at: P(0.2, 0.115, s * 0.14), rotation: [0, 0, s * 30],
      });
    }
    if (i === 2) {
      glow(b.part(new THREE.SphereGeometry(0.1, 6, 5), EMBER, { bone: head, at: P(0.35, -0.08, 0) }), 1.4);
    }
    b.pose(jaw, { axis: [1, 0, 0], deg: 8 + (i === 2 ? 22 : i * 3) });
  }

  for (const add of STAGE2) add(b);
  return b.root;
}
