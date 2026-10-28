<!-- call: base -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";
import { catmull } from "agentic-3js-builder";

export const BASE_PARTS = [
  {
    id: "head",
    builds: "wolf head details: upper and lower jaw with teeth, tongue, ears with inner fur, eyes with brows, nose, cheek ruff fur blades, whiskers",
    box: [
      [-0.2, 0.65, 0.5],
      [0.2, 1.15, 1.0],
    ],
    attaches: "the neck tip joint 'head' at the front top of the neck sweep; jaw hinges on joint jaw",
    joints: ["head", "jaw"],
    floor: false,
    budget: 220,
  },
  {
    id: "legs",
    builds: "four legs: upper leg, knee/hock, digitigrade lower leg, paws with toes and claws, fur tufts on legs, dew claws",
    box: [
      [-0.3, 0, -0.75],
      [0.3, 0.55, 0.6],
    ],
    attaches: "the underside of the torso at shoulders (z~0.35) and hips (z~-0.35) joints shoulderL/R and hipL/R",
    joints: ["hips", "spine1", "spine2"],
    floor: true,
    budget: 260,
  },
  {
    id: "tail",
    builds: "bushy tail with chained joints, fur layers, dark tip, fur blades",
    box: [
      [-0.2, 0.2, -1.4],
      [0.2, 0.8, -0.6],
    ],
    attaches: "the rump at the rear end of the torso, joint tailBase near hips",
    joints: ["hips"],
    floor: false,
    budget: 150,
  },
  {
    id: "coat",
    builds: "fur details on torso and neck: dorsal dark saddle patch, mane ruff blades on neck and shoulders, pale belly and chest fur, rump tufts",
    box: [
      [-0.3, 0.3, -0.7],
      [0.3, 0.95, 0.75],
    ],
    attaches: "the surface of the torso and neck sweeps (top and chest)",
    joints: ["spine1", "spine2", "neck1"],
    floor: false,
    budget: 230,
  },
];

export default function build() {
  const b = createBuilder({ name: "wolf" });
  const FUR = "#7d7a74";
  const DARK = "#4a4743";
  const PALE = "#c9c2b2";

  const hips = b.joint("hips", { at: [0, 0.62, -0.35], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.62, -0.35],
      [0, 0.66, 0.0],
      [0, 0.7, 0.35],
    ]),
    { parent: hips, role: "spine", names: ["spine1", "spine2"] },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.7, 0.35],
      [0, 0.8, 0.58],
      [0, 0.88, 0.76],
    ]),
    { parent: spine.joints[spine.joints.length - 1], role: "neck", names: ["neck1", "neck2"] },
  );
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: [0, 0.88, 0.76], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: head, at: [0, 0.84, 0.82], dir: [0, -0.1, 1], role: "jaw" });

  // torso: deep chest tapering to waist
  b.loft(
    [
      { at: [0, 0.6, -0.5], w: 0.26, h: 0.28 },
      { at: [0, 0.62, -0.2], w: 0.28, h: 0.3 },
      { at: [0, 0.64, 0.15], w: 0.32, h: 0.38 },
      { at: [0, 0.66, 0.45], w: 0.34, h: 0.42 },
    ],
    { bone: [hips, spine], color: FUR },
  );
  // pale belly strip
  b.loft(
    [
      { at: [0, 0.47, -0.3], w: 0.14, h: 0.06 },
      { at: [0, 0.45, 0.1], w: 0.18, h: 0.06 },
      { at: [0, 0.46, 0.45], w: 0.2, h: 0.06 },
    ],
    { bone: [hips, spine], color: PALE },
  );
  // dark saddle
  b.loft(
    [
      { at: [0, 0.8, -0.2], w: 0.2, h: 0.06 },
      { at: [0, 0.85, 0.2], w: 0.26, h: 0.06 },
      { at: [0, 0.88, 0.45], w: 0.28, h: 0.06 },
    ],
    { bone: spine, color: DARK },
  );
  // neck
  b.sweep(neck, [0.14, 0.1], { color: FUR });
  // skull and snout bases
  b.part(new THREE.SphereGeometry(0.11, 10, 8), FUR, { bone: head, at: [0, 0.9, 0.84], scale: [1, 0.9, 1.1] });
  b.part(new THREE.BoxGeometry(0.1, 0.08, 0.2), PALE, { bone: head, at: [0, 0.86, 0.97] });

  return b.root;
}
```

<!-- call: tail -->

The base source was not included in the prompt (it shows only a `{ base; }` placeholder), so this tail is built against the brief alone. It assumes a joint named `hips` exists, a rump near z ≈ -0.6, and a tail box of x ±0.2, y 0.2–0.8, z -1.4 to -0.6. I have not checked it against the base's real geometry.

The tail is a chain of joints, `tailBase` and `tail1` through `tail4`, parented to `hips`. A sweep follows the chain, with a thick grey base, a pale underside, and a dark tip band. Fur blades are placed along the tail on rings, in grey, light grey and dark tones. Everything is kept inside the box. The tail hangs down and back, as a relaxed alert wolf's tail would.

```ts
import * as THREE from "three";
import { type Builder, frame, catmull } from "agentic-3js-builder";

export function buildTail(b: Builder) {
  const GREY = "#6f747a";
  const LIGHT = "#a9adb0";
  const DARK = "#2b2d33";
  const MID = "#4f545b";
  const CREAM = "#c9c4b4";

  const pts: [number, number, number][] = [
    [0, 0.72, -0.62],
    [0, 0.66, -0.8],
    [0, 0.55, -0.98],
    [0, 0.42, -1.14],
    [0, 0.3, -1.28],
  ];
  const path = catmull(pts);
  const tail = b.chain("tail", path, {
    parent: "hips",
    names: ["tailBase", "tail1", "tail2", "tail3", "tail4"],
    role: "tail",
    count: 5,
  });

  const radius = (t: number) => {
    const r = 0.06 + 0.07 * Math.sin(Math.min(1, t * 1.3) * Math.PI * 0.75) * (1 - t * 0.5);
    return [Math.min(r, 0.125), Math.min(r * 1.05, 0.125)] as [number, number];
  };

  const body = b.sweep(tail, radius, {
    sides: 8,
    caps: "round",
    bands: [
      [0.7, GREY],
      [1, DARK],
    ],
    sectors: [
      [125, 235, CREAM, 0, 0.7],
      [-50, 50, MID, 0.05, 0.7],
    ],
  });

  // fur blades along the tail
  const blade = new THREE.ConeGeometry(0.03, 0.12, 5);
  const cols = [GREY, LIGHT, MID, GREY, LIGHT];
  const rows = 8;
  for (let i = 0; i < rows; i++) {
    const t = 0.08 + (i / (rows - 1)) * 0.86;
    const col = t > 0.7 ? DARK : cols[i % cols.length];
    for (const ang of [-70, -20, 25, 70, 150, 210]) {
      const hit = body.at(t, ang);
      const size = 0.8 + 0.5 * Math.sin(t * Math.PI);
      b.stick(blade, col, hit, { embed: 0.3, scale: [size, size, size] });
    }
  }

  // tip tuft
  const end = tail.at(1);
  b.spike(end, [0, -0.5, -1], 0.1, 0.06, { color: DARK });
  b.spike(end.at.clone().add(new THREE.Vector3(0.03, 0, 0)), [0.3, -0.5, -1], 0.07, 0.035, { color: "#17181c", bone: tail.joints[tail.joints.length - 1] });
  b.spike(end.at.clone().add(new THREE.Vector3(-0.03, 0, 0)), [-0.3, -0.5, -1], 0.07, 0.035, { color: "#17181c", bone: tail.joints[tail.joints.length - 1] });
}
```

<!-- call: coat -->

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildCoat(b: Builder) {
  // The base source was not included in the prompt, so this part finds the body
  // surface by ray casting instead of using base-specific handles.
  const skin = b.surface(b.root);
  const LO = [-0.3, 0.3, -0.7], HI = [0.3, 0.95, 0.75];
  const inside = (p: THREE.Vector3, m: number) =>
    p.x > LO[0] + m && p.x < HI[0] - m && p.y > LO[1] + m && p.y < HI[1] - m && p.z > LO[2] + m && p.z < HI[2] - m;

  const DARK = "#3b3d42", MID = "#6b6e72", LIGHT = "#9a9c9e", PALE = "#d9d6cc", CREAM = "#eae4d2", TIP = "#c8c6c0";

  const down = (x: number, z: number) => skin.ray([x, 1.2, z], [0, -1, 0]);
  const up = (x: number, z: number) => skin.ray([x, 0.0, z], [0, 1, 0]);
  const front = (x: number, y: number) => skin.ray([x, y, 1.4], [0, 0, -1]);

  // Blade pointing along the surface normal, swept backward.
  const blade = (h: any, len: number, r: number, color: string, back = 0.7) => {
    if (!h || !inside(h.at, 0.03)) return;
    const d = [h.n.x, h.n.y - 0.15, h.n.z - back];
    b.spike(h, d, len, r, { color, sides: 4 });
  };

  // Dorsal dark saddle patch: flat discs along the back
  for (let i = 0; i < 9; i++) {
    const z = -0.35 + i * 0.075;
    const w = 0.06 + 0.04 * Math.sin((i / 8) * Math.PI);
    for (const x of [0, 0.05, -0.05]) {
      const h = down(x * (1 + w * 4), z);
      if (h && h.n.y > 0.3 && inside(h.at, 0.03)) {
        b.stick(new THREE.CylinderGeometry(w * 0.7, w * 0.7, 0.012, 6), DARK, h, { embed: 0.4 });
      }
    }
  }

  // Mane ruff on neck and shoulders, layered blades
  for (let row = 0; row < 3; row++) {
    const color = [DARK, MID, LIGHT][row];
    for (let i = 0; i < 8; i++) {
      const z = 0.62 - row * 0.1 - (i % 2) * 0.03;
      for (const s of [-1, 0, 1]) {
        const x = s * (0.06 + 0.02 * row) + (i % 2 ? 0.015 : 0);
        const h = down(x, z - (i * 0.0));
        blade(h, 0.1 - row * 0.015, 0.025, color);
      }
    }
  }
  for (let i = 0; i < 6; i++) {
    const z = 0.55 - i * 0.07;
    for (const s of [-1, 1]) blade(down(s * 0.13, z), 0.08, 0.022, MID, 0.5);
  }

  // Pale belly fur
  for (let i = 0; i < 8; i++) {
    const z = -0.3 + i * 0.07;
    for (const x of [-0.07, 0, 0.07]) {
      const h = up(x, z);
      if (h && h.n.y < -0.2 && inside(h.at, 0.02))
        b.stick(new THREE.ConeGeometry(0.03, 0.07, 4), i % 2 ? PALE : CREAM, h, { embed: 0.3 });
    }
  }

  // Chest fur
  for (let j = 0; j < 4; j++) {
    for (const x of [-0.08, 0, 0.08]) {
      const h = front(x, 0.5 + j * 0.07);
      if (h && inside(h.at, 0.02)) b.spike(h, [h.n.x, h.n.y - 0.5, h.n.z], 0.07, 0.025, { color: j % 2 ? CREAM : PALE, sides: 4 });
    }
  }

  // Rump tufts
  for (let i = 0; i < 5; i++) {
    for (const x of [-0.12, -0.06, 0, 0.06, 0.12]) {
      const h = down(x, -0.68 + (i % 2) * 0.03);
      blade(h, 0.08, 0.022, i % 2 ? MID : TIP, 0.8);
    }
  }
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildHead(b: Builder) {
  // The base source was not included in the prompt, so these positions are placed
  // in model space from the stated box and joint names, not from the base's real surfaces.
  const FUR = "#7d8086", DARK = "#4a4d54", LIGHT = "#b9bcc0", CREAM = "#d8d4c8";
  const NOSE = "#16161a", EYE = "#e8b020", PUP = "#111111", TOOTH = "#f3efe0";
  const TONGUE = "#c85a6a", INNER = "#c9a79c", MOUTH = "#5a2330";

  const P = (g: THREE.BufferGeometry, c: string, at: number[], bone: string, o: any = {}) =>
    b.part(g, c, { at, bone, flat: true, ...o });

  // skull and snout
  P(new THREE.SphereGeometry(1, 8, 6), FUR, [0, 0.95, 0.66], "head", { scale: [0.1, 0.095, 0.115] });
  b.frustumBox([0, 0.935, 0.74], [0, 0.925, 0.95], [0.13, 0.1], [0.07, 0.06], { color: FUR, bone: "head" });
  P(new THREE.BoxGeometry(0.06, 0.012, 0.18), LIGHT, [0, 0.9, 0.85], "head");
  P(new THREE.BoxGeometry(0.03, 0.012, 0.14), DARK, [0, 0.99, 0.84], "head");
  // nose
  P(new THREE.SphereGeometry(1, 6, 5), NOSE, [0, 0.945, 0.975], "head", { scale: [0.034, 0.026, 0.022] });
  // mouth interior and lower jaw
  P(new THREE.BoxGeometry(0.07, 0.01, 0.2), MOUTH, [0, 0.888, 0.84], "jaw");
  b.frustumBox([0, 0.86, 0.74], [0, 0.865, 0.93], [0.11, 0.045], [0.06, 0.035], { color: LIGHT, bone: "jaw" });
  P(new THREE.BoxGeometry(0.05, 0.012, 0.13), TONGUE, [0, 0.885, 0.84], "jaw");
  P(new THREE.BoxGeometry(0.04, 0.03, 0.03), CREAM, [0, 0.855, 0.95], "jaw");

  for (const s of [1, -1]) {
    // teeth
    for (let i = 0; i < 4; i++) {
      const z = 0.82 + i * 0.04, big = i === 0 ? 1.5 : 1;
      P(new THREE.ConeGeometry(0.006 * big, 0.026 * big, 5), TOOTH, [s * (0.032 - i * 0.003), 0.887, z], "head", { rotation: [180, 0, 0] });
      P(new THREE.ConeGeometry(0.005, 0.02, 5), TOOTH, [s * (0.032 - i * 0.003), 0.89, z + 0.02], "jaw");
    }
    // ears
    P(new THREE.ConeGeometry(0.05, 0.13, 4), DARK, [s * 0.075, 1.08, 0.63], "head", { rotation: [-10, 45, s * -12] });
    P(new THREE.ConeGeometry(0.032, 0.1, 4), INNER, [s * 0.075, 1.07, 0.645], "head", { rotation: [-10, 45, s * -12] });
    P(new THREE.ConeGeometry(0.02, 0.05, 4), CREAM, [s * 0.072, 1.045, 0.652], "head", { rotation: [-10, 45, s * -12] });
    // eyes and brows
    P(new THREE.SphereGeometry(1, 6, 5), EYE, [s * 0.062, 0.975, 0.775], "head", { scale: [0.016, 0.014, 0.014] });
    P(new THREE.SphereGeometry(1, 5, 4), PUP, [s * 0.067, 0.975, 0.787], "head", { scale: [0.007, 0.009, 0.006] });
    P(new THREE.BoxGeometry(0.045, 0.012, 0.03), DARK, [s * 0.062, 0.998, 0.77], "head", { rotation: [0, s * 15, s * -20] });
    // cheek ruff blades
    for (let i = 0; i < 4; i++) {
      P(new THREE.ConeGeometry(0.022, 0.1 - i * 0.012, 4), i % 2 ? LIGHT : CREAM,
        [s * (0.1 + i * 0.012), 0.9 - i * 0.015, 0.66 - i * 0.03], "head", { rotation: [-100 + i * 10, 0, s * 70] });
    }
    // whiskers
    for (let i = 0; i < 3; i++) {
      b.rod([s * 0.04, 0.93 - i * 0.012, 0.92], [s * 0.15, 0.94 - i * 0.03, 0.9 - i * 0.02], 0.002, { color: CREAM, bone: "head" });
    }
  }
  // brow ridge / forehead tuft
  P(new THREE.ConeGeometry(0.03, 0.06, 4), LIGHT, [0, 1.03, 0.65], "head", { rotation: [-30, 45, 0] });
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { type Builder, frame, limb, polyline } from "agentic-3js-builder";

export function buildLegs(b: Builder) {
  const FUR = "#7d8085", FUR_D = "#4f5257", FUR_L = "#b4b6b8", PAW = "#3b3d41", CLAW = "#1d1c1e", PAD = "#26201f";
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const legs: { key: string; root: number[]; foot: number[]; lens: number[]; bends: number[][]; parent: string; r: number[] }[] = [
      { key: "F", root: [s * 0.11, 0.54, 0.35], foot: [s * 0.11, 0.1, 0.4], lens: [0.27, 0.25, 0.1], bends: [[0, 0, -1], [0, 0, 1]], parent: "spine2", r: [0.075, 0.05, 0.034, 0.03] },
      { key: "H", root: [s * 0.11, 0.54, -0.35], foot: [s * 0.11, 0.1, -0.42], lens: [0.25, 0.25, 0.2], bends: [[0, 0, 1], [0, 0, -1]], parent: "hips", r: [0.09, 0.055, 0.03, 0.028] },
    ];
    for (const L of legs) {
      const pts = limb(L.root as any, L.foot as any, L.lens, L.bends as any);
      const names = L.key === "F"
        ? [`legsShoulder${side}`, `legsElbow${side}`, `legsWrist${side}`, `legsPaw${side}F`]
        : [`legsHip${side}`, `legsKnee${side}`, `legsHock${side}`, `legsPaw${side}H`];
      const chain = b.chain(`legs${L.key}${side}`, polyline(pts), { parent: L.parent, names, role: "leg" });
      b.sweep(chain, (t: number) => {
        const r = L.r;
        const k = t * (r.length - 1), i = Math.min(Math.floor(k), r.length - 2);
        return r[i] + (r[i + 1] - r[i]) * (k - i);
      }, { color: FUR, sides: 8 });
      const end = pts[pts.length - 1];
      const tip = chain.tip ?? chain.joints[chain.joints.length - 1];
      // paw
      b.part(new THREE.BoxGeometry(0.075, 0.08, 0.14), PAW, { bone: tip, at: [end.x, 0.04, end.z + 0.03] });
      b.part(new THREE.BoxGeometry(0.07, 0.03, 0.04), FUR_L, { bone: tip, at: [end.x, 0.09, end.z - 0.03] });
      for (const dx of [-0.026, 0, 0.026]) {
        const tx = end.x + dx;
        b.part(new THREE.CapsuleGeometry(0.014, 0.04, 3, 6), PAW, { bone: tip, at: [tx, 0.02, end.z + 0.11], rotation: [90, 0, 0] });
        b.spike([tx, 0.016, end.z + 0.14], [0, -0.3, 1], 0.035, 0.009, { color: CLAW, bone: tip });
      }
      b.part(new THREE.BoxGeometry(0.05, 0.008, 0.05), PAD, { bone: tip, at: [end.x, 0.004, end.z + 0.04] });
      // dew claw
      b.spike([end.x - s * 0.03, 0.14, end.z - 0.02], [-s * 0.3, -1, -0.2], 0.04, 0.01, { color: CLAW, bone: tip });
      // fur tufts at joint 2 (elbow / hock) and thigh
      const j = pts[1], j2 = pts[2];
      const back = L.key === "F" ? [0, -0.5, -1] : [0, 0.2, -1];
      b.spike([j.x + s * 0.03, j.y, j.z - 0.02], back, 0.09, 0.03, { color: FUR_D, bone: chain.joints[1] });
      b.spike([j.x - s * 0.01, j.y - 0.03, j.z - 0.03], back, 0.07, 0.025, { color: FUR_L, bone: chain.joints[1] });
      b.spike([j2.x + s * 0.02, j2.y + 0.02, j2.z - 0.02], [0, -0.7, -0.5], 0.07, 0.022, { color: FUR_D, bone: chain.joints[2] });
      b.spike([end.x, 0.1, end.z - 0.02], [0, -0.6, -1], 0.06, 0.02, { color: FUR_L, bone: tip });
    }
  }
}
```