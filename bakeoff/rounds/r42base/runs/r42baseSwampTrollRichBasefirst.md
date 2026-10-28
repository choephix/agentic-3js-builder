<!-- call: base -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

export const BASE_PARTS = [
  {
    id: "head",
    builds: "Troll head details: lower jaw with big upward tusks, eyes with brows, nose, ears, ragged mohawk crest running back along the skull, and a bone fetish earring",
    box: [
      [-0.4, 1.95, -0.1],
      [0.4, 2.55, 0.6],
    ],
    attaches: "The head joint and the skull sphere; the jaw rides the jaw joint at the front-bottom of the skull",
    joints: ["head", "jaw"],
    floor: false,
    budget: 220,
  },
  {
    id: "arms",
    builds: "Both long arms from the shoulders: upper arm, forearm, huge knuckled fists with fingers and claws, bone bracers, and bone fetish bangles",
    box: [
      [-1.1, 0.35, -0.4],
      [1.1, 1.85, 0.6],
    ],
    attaches: "The shoulder joints (shoulderL / shoulderR) at the sides of the upper torso",
    joints: ["shoulderL", "shoulderR"],
    floor: false,
    budget: 200,
  },
  {
    id: "legs",
    builds: "Both short thick legs with knees, big splayed feet with toes and claws, and mossy mud at the ankles",
    box: [
      [-0.65, 0, -0.45],
      [0.65, 0.95, 0.65],
    ],
    attaches: "The hip joints (hipL / hipR) on the underside of the pelvis block",
    joints: ["hipL", "hipR"],
    floor: true,
    budget: 150,
  },
  {
    id: "fetishes",
    builds: "Bone fetishes and tribal gear: bone and skull necklace, rope belt with hanging bones and feather talismans, loincloth, shoulder pauldron of skull and tusks, moss patches on the back",
    box: [
      [-0.9, 0.7, -0.6],
      [0.9, 1.9, 0.75],
    ],
    attaches: "The chest and belly surfaces, the waist band of the pelvis, and the shoulder tops",
    joints: ["chest", "hips"],
    floor: false,
    budget: 200,
  },
  {
    id: "back",
    builds: "Hunched back details: spine ridge with bony spikes, moss and fungus growths, swamp vines, and a short stub tail with tuft",
    box: [
      [-0.6, 0.6, -0.9],
      [0.6, 2.0, -0.2],
    ],
    attaches: "The back of the hunched torso and the rear of the pelvis",
    joints: ["chest", "hips"],
    floor: false,
    budget: 120,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });
  const SKIN = "#5f8a4a";
  const BELLY = "#8aa860";
  const DARK = "#3f5e36";

  const hips = b.joint("hips", { at: [0, 0.95, 0], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 1.35, 0.1], dir: [0, 1, 0.2], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 1.85, 0.3], dir: [0, 0.6, 1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.1, 0.4], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: head, at: [0, 2.05, 0.42], dir: [0, -0.1, 1], role: "jaw" });
  for (const [s, n] of [[1, "L"], [-1, "R"]] as const) {
    b.joint("shoulder" + n, { parent: chest, at: [s * 0.78, 1.7, 0.2], dir: [s, -1, 0], role: "arm" });
    b.joint("hip" + n, { parent: hips, at: [s * 0.35, 0.9, 0], dir: [0, -1, 0], role: "leg" });
  }

  // pelvis
  b.part(new THREE.BoxGeometry(1.0, 0.45, 0.7), DARK, { bone: hips, at: [0, 0.98, 0] });
  // belly
  b.part(new THREE.SphereGeometry(0.5, 12, 8), BELLY, { bone: hips, at: [0, 1.25, 0.2], scale: [1.0, 0.9, 0.85] });
  // torso (hunched, big chest)
  b.part(new THREE.SphereGeometry(0.62, 12, 9), SKIN, { bone: chest, at: [0, 1.65, 0.05], scale: [1.35, 0.95, 1.0] });
  // hump on the back
  b.part(new THREE.SphereGeometry(0.45, 10, 8), SKIN, { bone: chest, at: [0, 1.85, -0.3], scale: [1.2, 0.8, 0.9] });
  // shoulders
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.3, 10, 8), SKIN, { bone: chest, at: [s * 0.8, 1.75, 0.15] });
  }
  // neck
  b.part(new THREE.CylinderGeometry(0.22, 0.28, 0.3, 8), SKIN, { bone: neck, at: [0, 1.98, 0.35], rotation: [30, 0, 0] });
  // skull
  b.part(new THREE.SphereGeometry(0.34, 12, 9), SKIN, { bone: head, at: [0, 2.2, 0.42], scale: [1.1, 0.9, 1.05] });
  // brow ridge block
  b.part(new THREE.BoxGeometry(0.55, 0.1, 0.2), DARK, { bone: head, at: [0, 2.3, 0.7] });
  // upper muzzle
  b.part(new THREE.BoxGeometry(0.4, 0.14, 0.26), SKIN, { bone: head, at: [0, 2.1, 0.68] });
  // lower jaw
  b.part(new THREE.BoxGeometry(0.44, 0.12, 0.3), DARK, { bone: "jaw", at: [0, 1.98, 0.6] });

  return b.root;
}
```

<!-- call: legs -->

The base source was not included in the prompt (only a `{ base; }` placeholder), so I could not read its real dimensions. I assumed hip joints `hipL` and `hipR` at about x = ±0.3, y = 0.95, and built the legs to fit the box. I looked the joints up by name through the builder, with a fallback if the lookup fails.

```ts
import * as THREE from "three";
import { type Builder, frame, limb } from "agentic-3js-builder";

export function buildLegs(b: Builder) {
  const SKIN = "#5b7a3a";
  const DARK = "#3f5a2a";
  const CLAW = "#e8dcb8";
  const MOSS = "#4f8a2e";
  const MUD = "#4a3a24";
  const PAD = "#6f8a48";

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip: any = (b as any).joints?.get?.("hip" + side) ?? "hip" + side;
    const hx = s * 0.3;
    const hy = 0.93;
    const footY = 0.1;
    const fz = 0.12;
    const fx = s * 0.4;

    const pts = limb([hx, hy, 0], [fx, footY, fz], [0.42, 0.4], [[0, 0, 1]]);
    const leg = b.chain("legs" + side, pts, {
      parent: hip,
      names: ["legsHip" + side, "legsKnee" + side, "legsAnkle" + side],
      role: "leg",
    });
    b.sweep(leg, (t: number) => 0.2 - 0.07 * t, { color: SKIN, sides: 8 });

    // knee cap
    const knee = pts[1];
    b.part(new THREE.SphereGeometry(0.13, 8, 6), DARK, {
      at: [knee.x, knee.y, knee.z + 0.1],
      bone: "legsKnee" + side,
    });

    // foot
    b.part(new THREE.BoxGeometry(0.4, 0.1, 0.5), SKIN, {
      at: [fx, 0.05, fz + 0.1],
      bone: "legsAnkle" + side,
    });
    b.part(new THREE.BoxGeometry(0.36, 0.03, 0.44), PAD, {
      at: [fx, 0.1, fz + 0.1],
      bone: "legsAnkle" + side,
    });

    // toes and claws
    for (let i = 0; i < 3; i++) {
      const a = (i - 1) * 0.5;
      const tx = fx + s * 0.0 + Math.sin(a) * 0.3 + (i - 1) * 0.1;
      const tz = fz + 0.35 + Math.cos(a) * 0.1;
      b.part(new THREE.BoxGeometry(0.11, 0.08, 0.2), SKIN, {
        at: [tx, 0.04, tz],
        bone: "legsAnkle" + side,
        rotation: [0, a * 57, 0],
      });
      b.part(new THREE.ConeGeometry(0.04, 0.12, 6), CLAW, {
        at: [tx + Math.sin(a) * 0.1, 0.05, tz + 0.12],
        bone: "legsAnkle" + side,
        dir: [Math.sin(a), 0, 1],
      });
    }

    // mossy mud at ankle
    b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.1, 8), MUD, {
      at: [fx, 0.18, fz],
      bone: "legsAnkle" + side,
    });
    for (let i = 0; i < 4; i++) {
      const a = i * 1.57 + 0.4;
      b.part(new THREE.SphereGeometry(0.06, 6, 4), MOSS, {
        at: [fx + Math.cos(a) * 0.15, 0.24, fz + Math.sin(a) * 0.15],
        bone: "legsAnkle" + side,
      });
    }
  }
}
```

<!-- call: back -->

The prompt did not include the base source: it shows only a `{ base; }` placeholder. I could not read the base's real dimensions, so this part is placed from the attachment box and the named joints. It has not been checked against the actual torso surface.

I assume the base has `chest` and `hips` joints. Every piece is a flat-colour part. Every position is clamped to the box x ±0.6, y 0.6 to 2, z -0.9 to -0.2. I assume the hunched back surface runs from the pelvis (about y 1.0, z -0.4) up to the shoulders (about y 1.6, z -0.45). I also assume the spine ridge sits near z of about -0.5 to -0.6.

The part adds three groups of detail:
- **Spine ridge:** a row of bone-coloured spikes along the back, growing larger toward the shoulders, each with a small dark base plate.
- **Growths:** moss patches, fungus caps on stalks and hanging vine strands. These sit on both sides of the spine.
- **Stub tail:** a short tail built from a tapered sweep with a fur tuft, rooted on the hips joint through a joint named `backTail`.

Each piece is bound to `chest` or `hips` by its `bone` option and clamped into the box.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildBack(b: Builder) {
  const BONE = "#e8dcb8";
  const BONE_D = "#b8a77e";
  const DARK = "#3a2a1c";
  const MOSS = "#5d8a2e";
  const MOSS_D = "#3f6420";
  const VINE = "#2f5a26";
  const CAP = "#c9572f";
  const CAP_P = "#f0d9a8";
  const SKIN = "#4f6b3a";
  const TUFT = "#2a3f1c";
  const clampP = (p: number[]): [number, number, number] => [
    Math.max(-0.58, Math.min(0.58, p[0])),
    Math.max(0.62, Math.min(1.98, p[1])),
    Math.max(-0.88, Math.min(-0.22, p[2])),
  ];

  // Spine ridge: spikes from pelvis up to shoulders
  const N = 8;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const y = 1.05 + t * 0.7;
    const z = -0.5 - 0.1 * Math.sin(t * Math.PI) - 0.02 * t;
    const bone = t > 0.45 ? "chest" : "hips";
    const len = 0.1 + 0.12 * t;
    const base = clampP([0, y, z]);
    b.part(new THREE.CylinderGeometry(0.06 + 0.03 * t, 0.07 + 0.03 * t, 0.03, 6), DARK, {
      bone, at: base, dir: [0, 0.3, -1],
    });
    b.part(new THREE.ConeGeometry(0.035 + 0.03 * t, len, 6), i % 2 ? BONE : BONE_D, {
      bone, at: clampP([0, y + 0.01, z - 0.03]), dir: [0, 0.6, -1],
    });
  }

  // Moss patches and fungus on both sides
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const y = 1.1 + i * 0.17;
      const x = s * (0.2 + 0.05 * (i % 2));
      const z = -0.5 - 0.06 * Math.sin(((y - 1.0) / 0.8) * Math.PI);
      const bone = y > 1.4 ? "chest" : "hips";
      b.part(new THREE.SphereGeometry(0.1 - 0.01 * (i % 2), 6, 4), i % 2 ? MOSS : MOSS_D, {
        bone, at: clampP([x, y, z - 0.03]), scale: [1, 0.45, 1], dir: [s * 0.3, 0.2, -1],
      });
    }
    // fungus: stalk + cap
    for (let k = 0; k < 2; k++) {
      const y = 1.25 + k * 0.28;
      const x = s * (0.3 + 0.04 * k);
      const z = -0.5;
      const bone = y > 1.4 ? "chest" : "hips";
      b.part(new THREE.CylinderGeometry(0.015, 0.02, 0.07, 6), CAP_P, {
        bone, at: clampP([x, y, z - 0.07]), dir: [s * 0.4, 0.3, -1],
      });
      b.part(new THREE.SphereGeometry(0.05 - 0.01 * k, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), CAP, {
        bone, at: clampP([x + s * 0.01, y + 0.02, z - 0.11]), dir: [s * 0.4, 0.3, -1],
      });
    }
    // hanging vines
    for (let k = 0; k < 2; k++) {
      const x0 = s * (0.12 + 0.15 * k);
      const top = clampP([x0, 1.7 - k * 0.1, -0.57]);
      const bot = clampP([x0 + s * 0.05, 1.15 - k * 0.1, -0.62]);
      b.rod(top, bot, [0.015, 0.008], VINE, { bone: "chest" });
      b.part(new THREE.SphereGeometry(0.022, 5, 4), MOSS, { bone: "chest", at: bot });
    }
  }

  // Stub tail on the hips
  const t0: [number, number, number] = [0, 1.0, -0.4];
  const t1: [number, number, number] = [0, 0.9, -0.62];
  const t2: [number, number, number] = [0, 0.82, -0.8];
  b.joint("backTail", { parent: "hips", at: t0, aim: t2, role: "tail" });
  b.sweep([t0, t1, t2], [0.1, 0.05], { color: SKIN, bone: "backTail", caps: "round" });
  b.part(new THREE.SphereGeometry(0.07, 6, 4), TUFT, { bone: "backTail", at: clampP([0, 0.82, -0.84]), scale: [1, 1, 1.2] });
  for (const s of [-1, 0, 1]) {
    b.spike(clampP([s * 0.03, 0.82, -0.84]), [s * 0.4, 0.2, -1], 0.07, 0.022, { color: TUFT, bone: "backTail" });
  }
  void frame;
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildHead(b: Builder) {
  // The base source was not included in the prompt, so these positions assume a skull
  // centred near (0, 2.25, 0.2). Parts attach to the "head" and "jaw" joints by name.
  const SKIN = "#4f7a3a", DARK = "#2f4d2a", BONE = "#e8dcb8", BONE_D = "#b9a97c";
  const EYE = "#f2d22e", PUP = "#1a1208", MOH = "#8a2fa0", MOH2 = "#c04ad0", MOUTH = "#5a1f2a";
  const P = (g: THREE.BufferGeometry, c: string, at: number[], bone: string, rot?: number[], scale?: number[]) =>
    b.part(g, c, { at, bone, rotation: rot, scale, flat: true } as any);

  const cone = (r: number, h: number, s = 6) => new THREE.ConeGeometry(r, h, s);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const sph = (r: number) => new THREE.SphereGeometry(r, 8, 6);

  // Brow ridge and nose (head bone)
  P(box(0.34, 0.05, 0.12), DARK, [0, 2.38, 0.42], "head", [-10, 0, 0]);
  P(box(0.1, 0.12, 0.1), SKIN, [0, 2.25, 0.5], "head", [20, 0, 0]);
  P(cone(0.07, 0.12, 5), SKIN, [0, 2.2, 0.55], "head", [90, 0, 0]);
  for (const s of [1, -1]) P(sph(0.025), PUP, [s * 0.035, 2.19, 0.6], "head");

  for (const s of [1, -1]) {
    // Eyes
    P(sph(0.045), EYE, [s * 0.11, 2.32, 0.44], "head");
    P(sph(0.02), PUP, [s * 0.11, 2.32, 0.485], "head");
    // Angry brows
    P(box(0.12, 0.03, 0.05), DARK, [s * 0.11, 2.385, 0.47], "head", [0, 0, -s * 22]);
    // Ears
    P(cone(0.06, 0.24, 5), SKIN, [s * 0.3, 2.34, 0.15], "head", [-25, 0, -s * 100]);
    P(cone(0.035, 0.14, 5), DARK, [s * 0.3, 2.34, 0.16], "head", [-25, 0, -s * 100]);
  }

  // Lower jaw
  P(box(0.34, 0.1, 0.26), SKIN, [0, 2.06, 0.4], "jaw");
  P(box(0.3, 0.03, 0.2), MOUTH, [0, 2.115, 0.4], "jaw");
  P(box(0.22, 0.08, 0.06), DARK, [0, 2.03, 0.54], "jaw");
  for (const s of [1, -1]) {
    // Big tusks
    P(cone(0.035, 0.22, 6), BONE, [s * 0.12, 2.22, 0.5], "jaw", [-8, 0, -s * 12]);
    P(cone(0.038, 0.04, 6), BONE_D, [s * 0.12, 2.12, 0.5], "jaw");
    // Small lower teeth
    P(cone(0.015, 0.05, 4), BONE, [s * 0.05, 2.14, 0.53], "jaw");
  }

  // Mohawk crest running back along the skull
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const z = 0.35 - t * 0.4;
    const y = 2.4 + 0.05 * Math.sin(t * Math.PI) - t * 0.03;
    const h = 0.12 + 0.02 * Math.sin(t * 6);
    P(cone(0.035, h, 4), i % 2 ? MOH2 : MOH, [0, y + h / 2 - 0.02, z], "head", [-20 - t * 30, 0, 0], [2.2, 1, 0.7]);
  }

  // Bone fetish earring on the left ear
  const ex = 0.34, ey = 2.22, ez = 0.15;
  P(new THREE.TorusGeometry(0.025, 0.006, 4, 8), BONE_D, [ex, ey + 0.05, ez], "head", [0, 90, 0]);
  P(box(0.012, 0.09, 0.012), BONE, [ex, ey, ez], "head");
  P(sph(0.04), BONE, [ex, ey - 0.07, ez], "head");
  for (const s of [1, -1]) P(sph(0.01), PUP, [ex + 0.03, ey - 0.065, ez + s * 0.015], "head");
  P(cone(0.015, 0.05, 4), BONE, [ex, ey - 0.12, ez], "head", [180, 0, 0]);
}
```

<!-- call: arms -->

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildArms(b: Builder) {
  const SKIN = "#5f7a3c", SKIN_D = "#4b6330", BONE = "#e8dcb8", BONE_D = "#b9a97c", CLAW = "#2e2a22", CORD = "#6b4a2a", RED = "#a8321e";
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = new THREE.Vector3(s * 0.55, 1.5, 0);
    const el = new THREE.Vector3(s * 0.8, 1.05, 0.05);
    const wr = new THREE.Vector3(s * 0.86, 0.66, 0.18);
    const arm = b.chain(
      `armsArm${side}`,
      [sh.toArray(), el.toArray(), wr.toArray()],
      { parent: `shoulder${side}`, names: [`armsUpper${side}`, `armsFore${side}`, `armsHand${side}`], role: "arm" },
    );
    b.sweep(arm, (t) => (t < 0.5 ? 0.17 - t * 0.04 : 0.15 + (t - 0.5) * 0.06), { color: SKIN, sides: 8 });
    // muscle bulge on upper arm and forearm
    b.part(new THREE.SphereGeometry(0.16, 8, 6), SKIN_D, { bone: arm.joints[0], at: [s * 0.63, 1.3, 0.04], scale: [1, 1.3, 1] });
    b.part(new THREE.SphereGeometry(0.15, 8, 6), SKIN, { bone: arm.joints[1], at: [s * 0.83, 0.88, 0.1], scale: [1, 1.4, 1] });
    // elbow spur
    b.spike([s * 0.84, 1.05, -0.05], [s * 0.3, 0.1, -1], 0.16, 0.05, { color: BONE, bone: arm.joints[0] });
    const hand = arm.tip ?? arm.joints[1];
    // bone bracer on forearm
    const fdir = wr.clone().sub(el).normalize().toArray();
    const bc = el.clone().lerp(wr, 0.6);
    b.part(new THREE.CylinderGeometry(0.19, 0.17, 0.2, 8), BONE, { bone: arm.joints[1], at: bc.toArray(), dir: fdir });
    for (const o of [-0.08, 0.08]) {
      const p = bc.clone().addScaledVector(new THREE.Vector3(...fdir), o);
      b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.025, 8), CORD, { bone: arm.joints[1], at: p.toArray(), dir: fdir });
    }
    b.part(new THREE.BoxGeometry(0.06, 0.1, 0.03), BONE_D, { bone: arm.joints[1], at: [s * 0.9, bc.y, bc.z + 0.19] });
    // fetish bangles: cord ring with hanging bone teeth
    const bg = el.clone().lerp(wr, 0.15);
    b.part(new THREE.TorusGeometry(0.18, 0.025, 5, 10), CORD, { bone: arm.joints[1], at: bg.toArray(), dir: fdir });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const p: [number, number, number] = [bg.x + Math.cos(a) * 0.18, bg.y - 0.05, bg.z + Math.sin(a) * 0.18];
      b.spike(p, [0, -1, 0], 0.09, 0.022, { color: i % 2 ? BONE : BONE_D, bone: arm.joints[1] });
    }
    b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { bone: arm.joints[1], at: [bg.x, bg.y, bg.z + 0.19] });
    // fist
    const fc = new THREE.Vector3(s * 0.88, 0.52, 0.24);
    b.part(new THREE.BoxGeometry(0.26, 0.24, 0.24), SKIN, { bone: hand, at: fc.toArray() });
    b.part(new THREE.BoxGeometry(0.28, 0.07, 0.26), SKIN_D, { bone: hand, at: [fc.x, fc.y + 0.1, fc.z] });
    // knuckles, fingers, claws
    for (let i = 0; i < 4; i++) {
      const x = s * (0.88 - 0.095 + i * 0.063 * 1) + 0;
      const fx = fc.x + (i - 1.5) * 0.065;
      b.part(new THREE.SphereGeometry(0.04, 6, 4), SKIN_D, { bone: hand, at: [fx, fc.y + 0.08, fc.z + 0.12] });
      b.capsule([fx, fc.y + 0.05, fc.z + 0.13], [fx, fc.y - 0.12, fc.z + 0.17], 0.032, SKIN, { bone: hand });
      b.spike([fx, fc.y - 0.14, fc.z + 0.17], [0, -0.5, 1], 0.09, 0.025, { color: CLAW, bone: hand });
      void x;
    }
    // thumb toward center
    const tx = fc.x - s * 0.15;
    b.capsule([tx + s * 0.04, fc.y + 0.02, fc.z + 0.06], [tx - s * 0.02, fc.y - 0.1, fc.z + 0.16], 0.04, SKIN, { bone: hand });
    b.spike([tx - s * 0.02, fc.y - 0.11, fc.z + 0.16], [-s * 0.3, -0.5, 1], 0.09, 0.028, { color: CLAW, bone: hand });
    // fist wrist wrap
    b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 8), CORD, { bone: hand, at: [wr.x, wr.y - 0.02, wr.z + 0.02], dir: fdir });
  }
}
```

The base source arrived as the placeholder `{ base; }`, so I placed everything from guessed coordinates, not from the real base geometry. I assumed the shoulders sit at about x = ±0.55, y = 1.5, z = 0. The arms hang from there to fists at about y = 0.5, inside the given box. I haven't run this against the base. If its shoulders sit elsewhere, the arm roots will need shifting to match.

Each side has:
- **Arm:** a three-joint chain parented to `shoulderL` / `shoulderR`, swept as one tube with muscle bulges on the upper arm and forearm and a bone spur at the elbow.
- **Bracer:** a bone cylinder on the forearm with two cord bands and a small plate.
- **Fetish bangle:** a cord ring below the elbow with five hanging bone teeth and a red bead.
- **Fist:** a box with a darker top slab, four knuckled fingers with black claws, and a clawed thumb, plus a cord wrap at the wrist.

Joints are named `armsUpper`, `armsFore` and `armsHand` with an `L` or `R` suffix, and everything uses flat colour strings.

<!-- call: fetishes -->

The base source came through as the literal placeholder `{ base; }`, so I couldn't read its real dimensions or joint names. I wrote this module blind: every placement is found by ray-casting the built model (`b.surface(b.root)`), and nothing refers to a joint by name. Nothing here has been run or rendered, so the placement is unchecked against the real troll.

Where a ray misses, a default position takes over: the torso is assumed to be roughly 0.4 m wide and the shoulders about ±0.55 m out at y ≈ 1.8. If the base's torso is a different size, the necklace, belt and pauldrons may float or sink a little. All parts are clamped inside the given box.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildFetishes(b: Builder) {
  const BONE = "#e8dcc0", BONE_D = "#b9a77f", ROPE = "#7a5a34", ROPE_D = "#4f3820";
  const LEATHER = "#5a3a22", LEATHER_D = "#3b2415", FEATHER_R = "#b5392b", FEATHER_T = "#2f8f86";
  const MOSS = "#5e8a2c", MOSS_D = "#3f6420", HOLE = "#2a2018", TUSK = "#f1e6c8";
  const MIN = [-0.9, 0.7, -0.6], MAX = [0.9, 1.9, 0.75];
  const clampP = (p: THREE.Vector3, m = 0.06) => {
    p.x = Math.min(Math.max(p.x, MIN[0] + m), MAX[0] - m);
    p.y = Math.min(Math.max(p.y, MIN[1] + m), MAX[1] - m);
    p.z = Math.min(Math.max(p.z, MIN[2] + m), MAX[2] - m);
    return p;
  };
  const skin = b.surface(b.root);
  const rayHit = (o: number[], d: number[], fb: number[]) => {
    let h: any = null;
    try { h = skin.ray(o, d); } catch { h = null; }
    const p = h ? new THREE.Vector3(h.at.x, h.at.y, h.at.z) : new THREE.Vector3(fb[0], fb[1], fb[2]);
    const n = h ? new THREE.Vector3(h.n.x, h.n.y, h.n.z) : new THREE.Vector3(-d[0], -d[1], -d[2]);
    return { p, n };
  };
  const bead = (p: THREE.Vector3, r: number, c: string) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), c, { at: clampP(p.clone(), r) });
  const boneAt = (p: THREE.Vector3, dir: number[], len: number, r: number, c = BONE) => {
    const d = new THREE.Vector3(...dir).normalize();
    b.part(new THREE.CylinderGeometry(r, r, len, 6), c, { at: clampP(p.clone()), dir: [d.x, d.y, d.z] });
    for (const s of [-1, 1])
      b.part(new THREE.SphereGeometry(r * 1.5, 6, 4), c, { at: clampP(p.clone().addScaledVector(d, s * len / 2)), });
  };
  const skull = (p: THREE.Vector3, s: number) => {
    b.part(new THREE.SphereGeometry(s, 8, 6), BONE, { at: clampP(p.clone(), s) });
    b.part(new THREE.BoxGeometry(s * 1.0, s * 0.5, s * 0.9), BONE_D, { at: clampP(p.clone().add(new THREE.Vector3(0, -s * 0.8, s * 0.15)), s) });
    for (const x of [-1, 1])
      b.part(new THREE.SphereGeometry(s * 0.28, 6, 4), HOLE, { at: clampP(p.clone().add(new THREE.Vector3(x * s * 0.4, 0, s * 0.8)), s * 0.3) });
  };
  const feather = (p: THREE.Vector3, c: string, len = 0.2) => {
    b.part(new THREE.CylinderGeometry(0.004, 0.004, len, 4), ROPE_D, { at: clampP(p.clone().add(new THREE.Vector3(0, -len / 2, 0))) });
    const f = new THREE.SphereGeometry(0.03, 6, 4); f.scale(0.5, len * 5, 0.2);
    b.part(f, c, { at: clampP(p.clone().add(new THREE.Vector3(0, -len * 0.8, 0))) });
  };

  // Necklace of bones and a skull pendant across the chest
  const N = 13;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1), x = (t - 0.5) * 0.7;
    const y = 1.62 - 0.12 * (1 - Math.pow(2 * t - 1, 2)) * 1.4 + 0.14 * Math.pow(2 * t - 1, 2) * 0 - 0.1 * (1 - Math.pow(2 * t - 1, 2)) + 0.12 * Math.pow(2 * t - 1, 2);
    const h = rayHit([x, y, 1.3], [0, 0, -1], [x, y, 0.3]);
    const p = h.p.clone().addScaledVector(h.n, 0.03);
    if (i % 3 === 1) boneAt(p, [0, -1, 0.2], 0.07, 0.014);
    else bead(p, 0.022, i % 2 ? ROPE : BONE_D);
    if (i === 6) skull(p.clone().add(new THREE.Vector3(0, -0.1, 0.03)), 0.05);
  }

  // Rope belt with hanging bones and feathers
  const BY = 0.98;
  const R = 1.3;
  const M = 20;
  let front: THREE.Vector3 | null = null;
  for (let i = 0; i < M; i++) {
    const a = (i / M) * Math.PI * 2;
    const dx = Math.sin(a), dz = Math.cos(a);
    const h = rayHit([dx * R, BY, dz * R], [-dx, 0, -dz], [dx * 0.35, BY, dz * 0.28]);
    const p = h.p.clone().addScaledVector(h.n, 0.02);
    clampP(p);
    b.part(new THREE.SphereGeometry(0.035, 6, 4), i % 2 ? ROPE : ROPE_D, { at: p });
    if (i === 0) front = p.clone();
    if (i % 4 === 2 && dz > -0.3) {
      const q = p.clone().add(new THREE.Vector3(0, -0.02, 0.02));
      b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.1, 4), ROPE_D, { at: clampP(q.clone().add(new THREE.Vector3(0, -0.05, 0))) });
      boneAt(q.clone().add(new THREE.Vector3(0, -0.14, 0)), [0, 1, 0], 0.09, 0.012);
    } else if (i % 4 === 0 && dz > 0.2) {
      feather(p.clone().add(new THREE.Vector3(0, -0.02, 0.03)), i % 8 === 0 ? FEATHER_R : FEATHER_T);
    }
  }

  // Loincloth with trim and bone stud
  const fp = front ?? new THREE.Vector3(0, BY, 0.3);
  const cloth = new THREE.BoxGeometry(0.34, 0.4, 0.03);
  b.part(cloth, LEATHER, { at: clampP(fp.clone().add(new THREE.Vector3(0, -0.22, 0.04))) });
  b.part(new THREE.BoxGeometry(0.34, 0.04, 0.035), LEATHER_D, { at: clampP(fp.clone().add(new THREE.Vector3(0, -0.4, 0.045))) });
  b.part(new THREE.BoxGeometry(0.34, 0.04, 0.035), ROPE, { at: clampP(fp.clone().add(new THREE.Vector3(0, -0.06, 0.05))) });
  skull(fp.clone().add(new THREE.Vector3(0, -0.24, 0.07)), 0.045);

  // Shoulder pauldrons of leather, skull and tusks
  for (const s of [1, -1]) {
    const h = rayHit([s * 0.55, 1.95, 0], [0, -1, 0], [s * 0.55, 1.75, 0]);
    const p = h.p.clone().add(new THREE.Vector3(s * 0.04, 0.02, 0));
    const pad = new THREE.SphereGeometry(0.17, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2);
    pad.scale(1, 0.7, 1.1);
    b.part(pad, LEATHER, { at: clampP(p.clone(), 0.17) });
    b.part(new THREE.TorusGeometry(0.17, 0.02, 4, 10), ROPE, { at: clampP(p.clone(), 0.2), rotation: [90, 0, 0] });
    skull(p.clone().add(new THREE.Vector3(s * 0.04, 0.1, 0.06)), 0.06);
    for (const z of [-1, 1]) {
      const tp = p.clone().add(new THREE.Vector3(s * 0.12, 0.08, z * 0.1));
      b.part(new THREE.ConeGeometry(0.03, 0.2, 6), TUSK, { at: clampP(tp), dir: [s * 0.8, 0.9, z * 0.7] });
    }
  }

  // Moss patches on the back
  const spots: number[][] = [[-0.25, 1.65], [0.2, 1.7], [0, 1.45], [-0.3, 1.35], [0.3, 1.4], [0.05, 1.8], [-0.15, 1.55]];
  spots.forEach(([x, y], i) => {
    const h = rayHit([x, y, -1.3], [0, 0, 1], [x, y, -0.4]);
    if (h.p.z < MIN[2] + 0.04) return;
    const g = new THREE.SphereGeometry(0.09 + (i % 3) * 0.02, 6, 4);
    g.scale(1.2, 0.9, 0.35);
    b.part(g, i % 2 ? MOSS : MOSS_D, { at: clampP(h.p.clone().addScaledVector(h.n, 0.01)) });
    b.part(new THREE.SphereGeometry(0.035, 5, 4), MOSS, { at: clampP(h.p.clone().add(new THREE.Vector3(0.05, 0.05, -0.02))) });
  });
}
```