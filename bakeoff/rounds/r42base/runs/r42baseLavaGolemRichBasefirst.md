<!-- call: base -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

export const BASE_PARTS = [
  {
    id: "head",
    builds: "Basalt helm-head with brow plates, glowing eyes, jagged jaw (separate upper and lower jaw), molten mouth glow, horn crystals and ember crest",
    box: [
      [-0.45, 2.35, -0.3],
      [0.45, 3.1, 0.6],
    ],
    attaches: "Neck stub on top of the chest block at joint head",
    joints: ["neck", "head", "jaw"],
    floor: false,
    budget: 200,
  },
  {
    id: "armL",
    builds: "Left arm: massive basalt pauldron, upper arm, elbow plate, giant fist with separated molten-seamed fingers",
    box: [
      [0.75, 0.2, -0.5],
      [1.75, 2.5, 0.6],
    ],
    attaches: "Left shoulder socket on the chest side at joint shoulderL",
    joints: ["shoulderL"],
    floor: false,
    budget: 180,
  },
  {
    id: "armR",
    builds: "Right arm mirrored: pauldron, forearm slabs, molten elbow, fist with fingers",
    box: [
      [-1.75, 0.2, -0.5],
      [-0.75, 2.5, 0.6],
    ],
    attaches: "Right shoulder socket on the chest side at joint shoulderR",
    joints: ["shoulderR"],
    floor: false,
    budget: 180,
  },
  {
    id: "legs",
    builds: "Both legs below the pelvis: stacked basalt thigh, knee plates, shin, wide stone feet with lava toes",
    box: [
      [-0.85, 0, -0.5],
      [0.85, 0.9, 0.7],
    ],
    attaches: "Underside of pelvis block at hipL and hipR",
    joints: ["hipL", "hipR"],
    floor: true,
    budget: 150,
  },
  {
    id: "chestDetail",
    builds: "Molten seam network, core crystal glowing in chest, back spines, shoulder-rock studs, belt runes and ember cracks over the torso",
    box: [
      [-1, 0.8, -0.8],
      [1, 2.4, 0.8],
    ],
    attaches: "Surface of the chest and belly blocks, front and back",
    joints: ["chest", "spine"],
    floor: false,
    budget: 190,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });
  const BASALT = "#3a3a48";
  const BASALT_D = "#26262f";
  const BASALT_L = "#55566a";
  const LAVA = "#ff6a1a";

  const pelvis = b.joint("pelvis", { at: [0, 0.95, 0] });
  const spine = b.joint("spine", { parent: pelvis, at: [0, 1.1, 0], aim: [0, 1.6, 0] });
  const chest = b.joint("chest", { parent: spine, at: [0, 1.6, 0], aim: [0, 2.2, 0] });
  b.joint("neck", { parent: chest, at: [0, 2.3, 0.02], aim: [0, 2.5, 0.05] });
  for (const [s, n] of [[1, "L"], [-1, "R"]] as const) {
    b.joint(`shoulder${n}`, { parent: chest, at: [s * 0.8, 2.0, 0], aim: [s * 1.2, 1.6, 0] });
    b.joint(`hip${n}`, { parent: pelvis, at: [s * 0.4, 0.9, 0], aim: [s * 0.4, 0.5, 0] });
  }

  const box = (w: number, h: number, d: number, c: string, at: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, bone: pelvis, flat: true } as any);

  // pelvis
  box(1.1, 0.35, 0.75, BASALT_D, [0, 0.95, 0]);
  // belly
  box(1.0, 0.5, 0.7, BASALT, [0, 1.35, 0]);
  box(0.8, 0.08, 0.72, LAVA, [0, 1.12, 0.0]);
  // chest
  b.part(new THREE.BoxGeometry(1.5, 0.9, 0.95), BASALT, { at: [0, 1.95, 0], bone: chest, flat: true } as any);
  b.part(new THREE.BoxGeometry(1.3, 0.25, 0.85), BASALT_L, { at: [0, 2.5, 0], bone: chest, flat: true } as any);
  // neck stub
  b.part(new THREE.CylinderGeometry(0.22, 0.28, 0.2, 6), BASALT_D, { at: [0, 2.68, 0.02], bone: chest, flat: true } as any);
  // hip stubs
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.45, 0.2, 0.5), BASALT_D, { at: [s * 0.4, 0.75, 0], bone: pelvis, flat: true } as any);
    b.part(new THREE.SphereGeometry(0.28, 6, 5), BASALT_L, { at: [s * 0.82, 2.0, 0], bone: chest, flat: true } as any);
  }
  return b.root;
}
```

<!-- call: legs -->

The base source was not included in the prompt (it came through as the literal placeholder `{ base; }`), so I could not read its pelvis dimensions or its `hipL` and `hipR` positions. I built the legs without reading them. I assumed the hips sit near x = ±0.35, y ≈ 0.9, and I used `b.joint` only to add leg joints parented to `hipL` and `hipR`. I have not run this against the real base, so the pelvis fit is unchecked.

Each leg is a stack of basalt blocks with glowing seams, built in flat colours:
- **Thigh:** a tapered thigh block with a glowing seam on the front.
- **Knee:** a knee plate with a lava core on the front.
- **Shin:** a tapered shin block with a lava seam.
- **Foot:** a wide stone foot with three lava toes.

Nothing goes below y = 0 or outside the box [[-0.85,0,-0.5],[0.85,0.9,0.7]].

The lava parts use colour strings, with no `glow` call.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildLegs(b: Builder) {
  const BAS = "#2b2a33", BAS2 = "#3a3944", BAS3 = "#1d1c24";
  const LAVA = "#ff6a1a", HOT = "#ffc94a";
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.35;
    const hip = b.joint("legsHip" + side, { parent: "hip" + side, at: [x, 0.88, 0] });
    const knee = b.joint("legsKnee" + side, { parent: hip, at: [x, 0.5, 0.02] });
    const ankle = b.joint("legsAnkle" + side, { parent: knee, at: [x, 0.16, 0] });
    const box = (w: number, h: number, d: number, c: string, p: number[], bone: any) =>
      b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: p as any });
    // thigh stack
    box(0.4, 0.2, 0.4, BAS2, [x, 0.78, 0], hip);
    box(0.36, 0.2, 0.36, BAS, [x, 0.6, 0.01], hip);
    box(0.44, 0.04, 0.44, BAS3, [x, 0.87, 0], hip);
    box(0.06, 0.34, 0.03, LAVA, [x, 0.7, 0.19], hip);
    box(0.02, 0.2, 0.03, HOT, [x, 0.7, 0.2], hip);
    // knee plate
    box(0.42, 0.2, 0.34, BAS3, [x, 0.46, 0.06], knee);
    box(0.3, 0.12, 0.06, BAS2, [x, 0.48, 0.26], knee);
    box(0.14, 0.06, 0.04, LAVA, [x, 0.46, 0.3], knee);
    // shin
    b.frustumBox([x, 0.4, 0], [x, 0.14, 0], [0.32, 0.32], [0.38, 0.34], { bone: knee, color: BAS });
    box(0.08, 0.2, 0.03, LAVA, [x, 0.28, 0.18], knee);
    box(0.4, 0.05, 0.36, BAS2, [x, 0.3, 0], knee);
    // foot
    box(0.6, 0.12, 0.8, BAS2, [x, 0.06, 0.15], ankle);
    box(0.5, 0.06, 0.4, BAS3, [x, 0.15, 0.05], ankle);
    for (const k of [-1, 0, 1])
      box(0.14, 0.09, 0.14, LAVA, [x + k * 0.18, 0.05, 0.58], ankle);
    box(0.56, 0.03, 0.2, BAS3, [x, 0.13, 0.35], ankle);
  }
}
```

<!-- call: armR -->

The base source arrived as the literal placeholder `{ base; }`, so I never saw its real geometry. I assumed a `shoulderR` joint exists near (-0.85, 2.2, 0) and attached the arm to it by name. If the base's joint sits elsewhere, the arm will be offset and the box fit will be off. I haven't run this against the base.

The arm hangs down from the shoulder inside the box x -1.75 to -0.75, y 0.2 to 2.5, z -0.5 to 0.6. It has a pauldron of stacked basalt plates, an upper arm, a molten elbow and forearm slabs, then a fist with four fingers and a thumb. It uses flat colours only and keeps the lowest knuckle above y = 0.2.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildArmR(b: Builder) {
  const BASALT = "#2b2a33";
  const BASALT2 = "#3d3b48";
  const LAVA = "#ff6a1a";
  const LAVA2 = "#ffc23a";
  const sh = b.joint("armRshoulder", { parent: "shoulderR", at: [-1.2, 2.05, 0], dir: [0, -1, 0], role: "arm" });
  const elbow = b.joint("armRelbow", { parent: sh, at: [-1.28, 1.4, 0.05], dir: [0, -1, 0.1], role: "arm" });
  const wrist = b.joint("armRwrist", { parent: elbow, at: [-1.3, 0.8, 0.15], dir: [0, -1, 0.1], role: "arm" });

  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });

  // pauldron plates
  box(0.8, 0.28, 0.85, BASALT, [-1.2, 2.3, 0], sh, [0, 0, -8]);
  box(0.7, 0.24, 0.75, BASALT2, [-1.28, 2.1, 0], sh, [0, 0, -14]);
  box(0.55, 0.2, 0.62, BASALT, [-1.34, 1.93, 0], sh, [0, 0, -18]);
  box(0.5, 0.05, 0.5, LAVA, [-1.2, 2.45, 0], sh);
  for (const z of [-0.25, 0.25]) b.part(new THREE.ConeGeometry(0.07, 0.2, 5), BASALT2, { bone: sh, at: [-1.35, 2.5, z] });

  // upper arm
  b.rod([-1.22, 2.0, 0], [-1.28, 1.45, 0.05], 0.22, BASALT2, { bone: sh });
  box(0.1, 0.4, 0.3, LAVA, [-1.45, 1.75, 0.05], sh);

  // elbow
  b.part(new THREE.IcosahedronGeometry(0.27, 0), LAVA, { bone: elbow, at: [-1.28, 1.4, 0.05] });
  b.part(new THREE.IcosahedronGeometry(0.16, 0), LAVA2, { bone: elbow, at: [-1.28, 1.4, 0.2] });

  // forearm
  b.rod([-1.28, 1.25, 0.07], [-1.3, 0.85, 0.15], [0.24, 0.2], BASALT, { bone: elbow });
  box(0.5, 0.3, 0.5, BASALT2, [-1.3, 1.1, 0.1], elbow, [0, 0, 4]);
  box(0.54, 0.22, 0.54, BASALT, [-1.3, 0.9, 0.14], elbow, [0, 0, -4]);
  box(0.06, 0.5, 0.06, LAVA, [-1.04, 1.05, 0.12], elbow);
  box(0.06, 0.5, 0.06, LAVA, [-1.56, 1.05, 0.12], elbow);

  // fist
  box(0.46, 0.3, 0.42, BASALT2, [-1.3, 0.68, 0.18], wrist);
  box(0.4, 0.04, 0.36, LAVA, [-1.3, 0.84, 0.18], wrist);
  for (let i = 0; i < 4; i++) {
    const x = -1.12 - i * 0.12;
    box(0.1, 0.22, 0.12, BASALT, [x, 0.46, 0.38], wrist);
    box(0.09, 0.05, 0.1, LAVA, [x, 0.34, 0.4], wrist);
  }
  b.part(new THREE.BoxGeometry(0.12, 0.2, 0.12), BASALT, { bone: wrist, at: [-0.93, 0.62, 0.3], rotation: [0, 0, -25] });
  b.part(new THREE.BoxGeometry(0.09, 0.04, 0.1), LAVA, { bone: wrist, at: [-0.9, 0.5, 0.3] });
}
```

<!-- call: head -->

The base source was not included in the prompt (it shows only a `{ base; }` placeholder), so I could not read its real dimensions or joints. I placed the head inside the stated box, centred on x = 0, with the neck stub at its base (y ≈ 2.35). The joint names `neck`, `head` and `jaw` follow the brief, but they may not match the base's actual joints. To avoid colliding with them, I created my own joints prefixed `head` and parented the first one to the nearest existing joint by passing `at` only. None of this has been run against the base.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildHead(b: Builder) {
  const BAS = "#2b2a33", BAS2 = "#3d3b48", BAS3 = "#1b1a21";
  const LAVA = "#ff6a1a", GLOW = "#ffd24a", EMB = "#ff4a10", CRY = "#ff8a2a";

  const neck = b.joint("headNeck", { at: [0, 2.35, 0.05], dir: [0, 1, 0.1], role: "neck" });
  const head = b.joint("headSkull", { parent: neck, at: [0, 2.6, 0.1], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("headJaw", { parent: head, at: [0, 2.6, 0.38], dir: [0, 0, 1], role: "jaw" });

  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, bone, rotation: rot });

  // neck stub
  box(0.5, 0.2, 0.4, BAS3, [0, 2.42, 0.05], neck);
  box(0.36, 0.06, 0.3, LAVA, [0, 2.5, 0.05], neck);

  // skull helm
  box(0.7, 0.5, 0.6, BAS, [0, 2.75, 0.1], head);
  box(0.62, 0.14, 0.5, BAS2, [0, 3.02, 0.08], head);
  for (const s of [1, -1]) {
    box(0.1, 0.4, 0.5, BAS2, [s * 0.38, 2.72, 0.1], head);
    // brow plates
    box(0.3, 0.1, 0.2, BAS3, [s * 0.18, 2.93, 0.42], head, [-20, 0, s * 12]);
    // eyes
    box(0.16, 0.08, 0.05, GLOW, [s * 0.18, 2.82, 0.4], head);
    box(0.2, 0.12, 0.04, LAVA, [s * 0.18, 2.82, 0.385], head);
    // cheek seams
    box(0.04, 0.3, 0.04, LAVA, [s * 0.3, 2.7, 0.41], head);
    // horn crystals
    b.part(new THREE.ConeGeometry(0.09, 0.4, 5), CRY, { at: [s * 0.36, 3.05, 0.05], bone: head, rotation: [0, 0, -s * 30] });
    b.part(new THREE.ConeGeometry(0.06, 0.25, 5), GLOW, { at: [s * 0.48 * 0.85, 3.0, 0.0], bone: head, rotation: [0, 0, -s * 55] });
    // jaw side plates and fangs
    box(0.08, 0.14, 0.36, BAS2, [s * 0.3, 2.5, 0.3], jaw);
  }
  // nose ridge
  box(0.14, 0.2, 0.2, BAS2, [0, 2.7, 0.45], head);

  // upper jaw teeth
  for (let i = -2; i <= 2; i++)
    b.part(new THREE.ConeGeometry(0.04, 0.12 + (i % 2 ? 0.03 : 0), 4), BAS2, { at: [i * 0.1, 2.5, 0.52], bone: head, rotation: [180, 0, 0] });
  // lower jaw
  box(0.56, 0.12, 0.42, BAS, [0, 2.44, 0.35], jaw);
  box(0.4, 0.05, 0.3, LAVA, [0, 2.5, 0.38], jaw);
  for (let i = -2; i <= 2; i++)
    b.part(new THREE.ConeGeometry(0.04, 0.14, 4), BAS2, { at: [i * 0.1, 2.54, 0.56], bone: jaw });
  // mouth glow
  box(0.4, 0.04, 0.04, GLOW, [0, 2.53, 0.54], head);

  // ember crest
  for (let i = 0; i < 6; i++) {
    const h = 0.28 - i * 0.025;
    b.part(new THREE.ConeGeometry(0.07 - i * 0.006, h, 5), i % 2 ? EMB : LAVA, {
      at: [0, 3.08 - i * 0.005, 0.32 - i * 0.1], bone: head, rotation: [-15 - i * 4, 0, 0],
    });
  }
  b.part(new THREE.SphereGeometry(0.05, 6, 4), GLOW, { at: [0, 3.1, 0.35], bone: head });
}
```

<!-- call: armL -->

The base source was not included in the prompt (it shows only a `{ base; }` placeholder), so I could not read its dimensions. I placed the arm from the task alone. It assumes `shoulderL` is a joint near x≈0.8, y≈2.2 and builds everything inside the given box [[0.75,0.2,-0.5],[1.75,2.5,0.6]]. If the base's real joint position differs, the arm will not line up with its shoulder socket.

The arm uses these joints and parts:
- **Joints:** `armLUpper` (role arm), `armLElbow` and `armLWrist` hang under `shoulderL`. Each finger has its own digit chain of two joints, plus a thumb.
- **Pauldron:** stacked basalt plates with a glowing seam and spikes.
- **Upper arm and forearm:** tubes with molten bands.
- **Elbow:** a plate with a spike.
- **Fist:** a block with four separated fingers and a thumb, each carrying a molten seam.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildArmL(b: Builder) {
  const BAS = "#2b2730", BAS2 = "#3d3742", BAS3 = "#1c1a20";
  const LAVA = "#ff6a1a", HOT = "#ffc247";
  const sh = b.joint("armLUpper", { parent: "shoulderL", at: [0.95, 2.1, 0.0], dir: [0.3, -1, 0.05], role: "arm" });
  const elbow = b.joint("armLElbow", { parent: sh, at: [1.2, 1.4, 0.05], dir: [0.1, -1, 0.3], role: "arm" });
  const wrist = b.joint("armLWrist", { parent: elbow, at: [1.3, 0.85, 0.2], dir: [0, -1, 0.1], role: "arm" });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // pauldron
  b.part(new THREE.DodecahedronGeometry(0.4, 0), BAS, { bone: sh, at: [1.05, 2.25, 0], scale: [1.1, 0.8, 1.1], flat: true });
  b.part(box(0.7, 0.12, 0.7), BAS2, { bone: sh, at: [1.1, 2.4, 0], rotation: [0, 0, -12] });
  b.part(box(0.74, 0.04, 0.74), LAVA, { bone: sh, at: [1.08, 2.33, 0], rotation: [0, 0, -12] });
  for (const z of [-0.25, 0, 0.25])
    b.spike([1.2, 2.45, z], [0.5, 1, 0], 0.22, 0.07, { color: BAS3, bone: sh });

  // upper arm
  b.rod([1.0, 2.05, 0], [1.2, 1.4, 0.05], [0.24, 0.2], { color: BAS2, bone: sh, sides: 8 });
  for (const t of [0.3, 0.6]) {
    const y = 2.05 - 0.65 * t, x = 1.0 + 0.2 * t;
    b.part(new THREE.TorusGeometry(0.23, 0.03, 5, 10), LAVA, { bone: sh, at: [x, y, 0.02], rotation: [90, 0, 0] });
  }
  // elbow plate
  b.part(new THREE.DodecahedronGeometry(0.25, 0), BAS, { bone: elbow, at: [1.25, 1.4, -0.12], flat: true });
  b.spike([1.3, 1.42, -0.2], [0.6, 0.2, -1], 0.25, 0.08, { color: BAS3, bone: elbow });
  b.part(new THREE.SphereGeometry(0.07, 6, 4), HOT, { bone: elbow, at: [1.2, 1.4, 0.2] });

  // forearm
  b.rod([1.2, 1.4, 0.05], [1.3, 0.85, 0.2], [0.22, 0.26], { color: BAS2, bone: elbow, sides: 8 });
  b.part(box(0.1, 0.4, 0.04), LAVA, { bone: elbow, at: [1.25, 1.12, 0.38], rotation: [15, 0, 0] });
  b.part(box(0.56, 0.1, 0.5), BAS, { bone: wrist, at: [1.3, 0.88, 0.2] });

  // fist
  b.part(box(0.5, 0.3, 0.46), BAS, { bone: wrist, at: [1.3, 0.7, 0.22] });
  b.part(box(0.52, 0.04, 0.48), LAVA, { bone: wrist, at: [1.3, 0.6, 0.22] });
  [-0.18, -0.06, 0.06, 0.18].forEach((dz, i) => {
    const x = 1.3 + (i === 1 || i === 2 ? 0.02 : 0);
    const z = 0.22 + dz * 1.0;
    const f1 = b.joint(`armLFinger${i + 1}a`, { parent: wrist, at: [x, 0.55, z], dir: [0, -1, 0], role: "digit" });
    const f2 = b.joint(`armLFinger${i + 1}b`, { parent: f1, at: [x, 0.38, z], dir: [0, -1, 0.1], role: "digit" });
    b.rod([x, 0.57, z], [x, 0.38, z], 0.065, { color: BAS2, bone: f1 });
    b.rod([x, 0.38, z], [x, 0.22, z + 0.02], [0.06, 0.045], { color: BAS2, bone: f2 });
    b.part(box(0.03, 0.14, 0.03), LAVA, { bone: f1, at: [x + 0.06, 0.46, z] });
    b.spike([x, 0.22, z + 0.02], [0, -1, 0.1], 0.07, 0.04, { color: BAS3, bone: f2 });
  });
  const th1 = b.joint("armLThumb1", { parent: wrist, at: [1.08, 0.7, 0.3], dir: [-1, -0.5, 0.5], role: "digit" });
  b.rod([1.08, 0.7, 0.3], [0.9, 0.55, 0.4], [0.08, 0.06], { color: BAS2, bone: th1 });
  b.spike([0.9, 0.55, 0.4], [-1, -0.6, 0.5], 0.1, 0.05, { color: BAS3, bone: th1 });
  b.part(new THREE.SphereGeometry(0.05, 6, 4), HOT, { bone: wrist, at: [1.3, 0.72, 0.46] });
}
```

<!-- call: chestDetail -->

The base source arrived as the literal text `{ base; }`, so I couldn't read its dimensions. I didn't write against a guessed layout. Instead, every detail is seated by casting rays at the base's real surface (`b.surface(b.root)`). Anything that misses the surface or would leave the box is skipped. I haven't run this against the base.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildChestDetail(b: Builder) {
  const LAVA = "#ff7a1a";
  const HOT = "#ffd24a";
  const DARK = "#2b1b1f";
  const RUNE = "#ffb347";
  const CORE = "#ff4d2e";
  const skin = b.surface(b.root);

  const inBox = (p: THREE.Vector3) =>
    Math.abs(p.x) < 0.95 && p.y > 0.82 && p.y < 2.38 && Math.abs(p.z) < 0.75;

  const hitAt = (x: number, y: number, side: 1 | -1) => {
    const h = skin.ray([x, y, side * 2], [0, 0, -side]);
    if (!h || !inBox(h.at)) return null;
    return h;
  };

  // Molten seam network on chest and belly, front and back
  const seam = (x: number, y: number, side: 1 | -1, ang: number, len: number, hot = false) => {
    const h = hitAt(x, y, side);
    if (!h) return;
    b.stick(new THREE.BoxGeometry(0.035, 0.02, len), hot ? HOT : LAVA, h, { embed: 0.3, spin: ang });
  };
  const zig: [number, number, number, number][] = [
    [0, 2.05, 0, 0.2], [0.1, 1.9, 35, 0.2], [-0.05, 1.75, -30, 0.2], [0.08, 1.6, 40, 0.18],
    [-0.1, 1.45, -35, 0.18], [0.05, 1.3, 30, 0.18], [0, 1.15, -20, 0.16],
    [0.35, 1.75, 70, 0.22], [-0.35, 1.7, -70, 0.22], [0.5, 1.5, 55, 0.2], [-0.5, 1.45, -55, 0.2],
    [0.3, 1.25, 80, 0.2], [-0.3, 1.2, -80, 0.2],
  ];
  for (const side of [1, -1] as const)
    for (const [x, y, a, l] of zig) {
      seam(x, y, side, a, l);
      seam(x, y, side, a, l * 0.4, true);
    }

  // Core crystal glowing in the chest
  const ch = hitAt(0, 1.8, 1);
  if (ch) {
    const mount = b.stick(new THREE.CylinderGeometry(0.2, 0.24, 0.06, 8), DARK, ch, { embed: 0.4 });
    void mount;
    glow(b.stick(new THREE.OctahedronGeometry(0.15, 0), CORE, ch.moved([0, 0.1, 0]), { embed: 0.2, scale: [1, 1.5, 1] }), 1.6);
    glow(b.stick(new THREE.OctahedronGeometry(0.07, 0), HOT, ch.moved([0, 0.2, 0]), { embed: 0.2, scale: [1, 1.5, 1] }), 2);
    for (const s of [1, -1]) {
      const sh = hitAt(s * 0.22, 1.8, 1);
      if (sh) glow(b.stick(new THREE.ConeGeometry(0.04, 0.16, 5), LAVA, sh, { embed: 0.2, spin: 0 }), 1.3);
    }
  }

  // Back spines
  const spineRows: [number, number, number][] = [
    [0, 2.15, 0.2], [0, 1.95, 0.24], [0, 1.75, 0.26], [0, 1.55, 0.24], [0, 1.35, 0.2],
    [0.28, 2.05, 0.16], [-0.28, 2.05, 0.16], [0.3, 1.8, 0.18], [-0.3, 1.8, 0.18],
    [0.3, 1.55, 0.15], [-0.3, 1.55, 0.15],
  ];
  for (const [x, y, l] of spineRows) {
    const h = hitAt(x, y, -1);
    if (!h) continue;
    b.stick(new THREE.ConeGeometry(0.07, l, 5), DARK, h, { embed: 0.15 });
    b.stick(new THREE.ConeGeometry(0.03, l * 0.6, 5), LAVA, h.moved([0, 0.02, 0]), { embed: 0.1 });
  }

  // Shoulder-rock studs
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const h = hitAt(s * (0.55 + i * 0.12), 2.2 - i * 0.04, 1);
      if (h) b.stick(new THREE.DodecahedronGeometry(0.05, 0), i % 2 ? DARK : "#4a3a3c", h, { embed: 0.35 });
    }
  }

  // Belt runes
  for (let i = -4; i <= 4; i++) {
    for (const side of [1, -1] as const) {
      const h = hitAt(i * 0.17, 1.0, side);
      if (!h) continue;
      b.stick(new THREE.BoxGeometry(0.1, 0.012, 0.1), DARK, h, { embed: 0.3 });
      glow(b.stick(new THREE.BoxGeometry(0.02, 0.014, 0.075), RUNE, h.moved([0, 0.004, 0]), { embed: 0.3, spin: i % 2 ? 0 : 90 }), 1.2);
      glow(b.stick(new THREE.BoxGeometry(0.06, 0.014, 0.02), RUNE, h.moved([0, 0.004, 0]), { embed: 0.3, spin: i % 2 ? 0 : 90 }), 1.2);
    }
  }

  // Ember cracks scattered over the torso
  const rg = [0.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.1];
  let k = 0;
  for (const y of rg)
    for (const side of [1, -1] as const)
      for (const x of [-0.6, -0.15, 0.4, 0.7]) {
        k++;
        const h = hitAt(x + ((k * 37) % 10) * 0.012, y + ((k * 17) % 7) * 0.01, side);
        if (!h) continue;
        glow(b.stick(new THREE.BoxGeometry(0.02, 0.012, 0.07 + (k % 3) * 0.03), k % 2 ? HOT : LAVA, h, { embed: 0.3, spin: (k * 47) % 180 }), 1.2);
      }
}
```