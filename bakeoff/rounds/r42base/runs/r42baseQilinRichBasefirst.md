<!-- call: base -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

// Qilin base: scaled quadruped body, neck, head skull, legs, tail root. Facing +Z, standing on y=0.
export const BASE_PARTS = [
  {
    id: "antlersAndHorns",
    builds: "branching antlers on both sides of the skull, a central small horn, ear fins, brow ridges and gold tips",
    box: [
      [-0.45, 1.75, 0.9],
      [0.45, 2.55, 1.6],
    ],
    attaches: "top of the skull sphere on the head joint, left and right of the crown",
    joints: ["head"],
    floor: false,
    budget: 150,
  },
  {
    id: "faceAndJaw",
    builds: "separate upper and lower jaw with teeth, whiskers, beard, nostrils, big anime eyes with highlights, brows",
    box: [
      [-0.35, 1.2, 1.2],
      [0.35, 1.95, 1.9],
    ],
    attaches: "front of the skull and the muzzle block; jaw hinge under the head joint",
    joints: ["head", "jaw"],
    floor: false,
    budget: 180,
  },
  {
    id: "cloudMane",
    builds: "swirling cloud-shaped mane tufts along the neck crest and down the chest, cloud puffs on shoulders, gold trim",
    box: [
      [-0.5, 1.1, -0.2],
      [0.5, 2.2, 1.3],
    ],
    attaches: "dorsal line of the neck cylinder, chest front and shoulder tops",
    joints: ["neck1", "neck2", "chest"],
    floor: false,
    budget: 180,
  },
  {
    id: "legsAndHooves",
    builds: "four slender legs with knees, fetlocks, gold hooves, cloud-wisp ankle tufts and scale plates on thighs",
    box: [
      [-0.6, 0, -1.0],
      [0.6, 1.0, 1.0],
    ],
    attaches: "underside of the body at shoulders and hips; leg tops rest at the body belly",
    joints: ["chest", "hips"],
    floor: true,
    budget: 220,
  },
  {
    id: "tailAndScales",
    builds: "fan-shaped flowing tail with cloud-curl tip, back scale rows, belly plates, flame wisps along the flanks",
    box: [
      [-0.6, 0.6, -1.9],
      [0.6, 1.8, 0.9],
    ],
    attaches: "rump end of the body at the tail joint and the body's back and flank surfaces",
    joints: ["hips", "tail1"],
    floor: false,
    budget: 170,
  },
];

export default function build() {
  const b = createBuilder({ name: "qilin" });
  const SCALE = "#2f8f6a";
  const BELLY = "#e8d9a0";
  const DARK = "#1f5f4a";

  const hips = b.joint("hips", { at: [0, 1.0, -0.55], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 1.05, 0.5], aim: [0, 1.05, 0.9], role: "spine" });
  const neck1 = b.joint("neck1", { parent: chest, at: [0, 1.2, 0.8], aim: [0, 1.55, 1.05], role: "neck" });
  const neck2 = b.joint("neck2", { parent: neck1, at: [0, 1.55, 1.05], aim: [0, 1.8, 1.25], role: "neck" });
  const head = b.joint("head", { parent: neck2, at: [0, 1.8, 1.25], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: head, at: [0, 1.62, 1.45], aim: [0, 1.58, 1.8], role: "jaw" });
  b.joint("tail1", { parent: hips, at: [0, 1.0, -1.1], aim: [0, 0.95, -1.6], role: "tail" });

  // torso
  b.loft(
    [
      { at: [0, 1.0, -1.05], w: 0.5, h: 0.5 },
      { at: [0, 1.05, -0.55], w: 0.7, h: 0.68 },
      { at: [0, 1.08, 0.0], w: 0.62, h: 0.64 },
      { at: [0, 1.12, 0.5], w: 0.72, h: 0.78 },
      { at: [0, 1.15, 0.85], w: 0.55, h: 0.62 },
    ],
    { bone: [hips, chest], color: SCALE },
  );
  // belly stripe
  b.loft(
    [
      { at: [0, 0.76, -0.8], w: 0.3, h: 0.1 },
      { at: [0, 0.74, 0.0], w: 0.34, h: 0.1 },
      { at: [0, 0.76, 0.7], w: 0.3, h: 0.1 },
    ],
    { bone: chest, color: BELLY },
  );

  // neck
  b.sweep(
    [
      [0, 1.2, 0.8],
      [0, 1.55, 1.05],
      [0, 1.8, 1.25],
    ],
    [0.27, 0.19],
    { bone: [neck1, neck2], color: SCALE },
  );

  // skull and muzzle
  b.part(new THREE.SphereGeometry(0.24, 10, 8), SCALE, { bone: head, at: [0, 1.85, 1.35], scale: [1, 0.95, 1.15] });
  b.part(new THREE.BoxGeometry(0.28, 0.2, 0.34), SCALE, { bone: head, at: [0, 1.75, 1.65] });
  b.part(new THREE.BoxGeometry(0.26, 0.07, 0.3), DARK, { bone: "jaw", at: [0, 1.6, 1.65] });

  // legs
  const hoof = "#c9a24a";
  for (const s of [1, -1]) {
    for (const [name, z, parent] of [["F", 0.55, chest], ["H", -0.7, hips]] as const) {
      const x = s * 0.27;
      const side = s > 0 ? "L" : "R";
      const top: [number, number, number] = [x, 0.82, z];
      const knee: [number, number, number] = [x, 0.45, z + (name === "F" ? 0.03 : -0.06)];
      const foot: [number, number, number] = [x, 0.07, z];
      const leg = b.chain(`leg${name}${side}`, [top, knee, foot], {
        parent,
        names: [`hip${name}${side}`, `knee${name}${side}`, `ankle${name}${side}`],
        role: "leg",
      });
      b.sweep(leg, [0.11, 0.06], { color: SCALE });
      b.part(new THREE.CylinderGeometry(0.075, 0.085, 0.1, 8), hoof, { bone: leg.tip ?? undefined, at: [x, 0.05, z] });
    }
  }

  // tail root
  b.sweep(
    [
      [0, 1.0, -1.05],
      [0, 0.98, -1.35],
      [0, 0.95, -1.6],
    ],
    [0.13, 0.08],
    { bone: "tail1", color: SCALE },
  );

  return b.root;
}
```

<!-- call: legsAndHooves -->

The base source did not come through: the prompt contains only the literal placeholder `{ base; }`. I could not read the real body dimensions, so the joint positions below are assumptions. The code does not use `b.joint("chest")` lookups. It only parents leg chains to joints named `chest` and `hips`, which the brief says exist. I have not run it against the actual base, so the body-underside heights and leg x offsets may need retuning once the base code is visible.

Assumptions about the base:
- The body underside sits at about y = 0.85.
- The chest is at about z = 0.45 and the hips at about z = -0.5.
- Legs sit at x = ±0.2.

The part builds four legs with limb IK, each as a chain with a gold hoof, a knee cap, a fetlock, ankle wisps and thigh scale plates. Everything is flat colour and stays inside the box [-0.6, 0, -1] to [0.6, 1, 1].

```ts
import * as THREE from "three";
import { type Builder, frame, limb } from "agentic-3js-builder";

export function buildLegsAndHooves(b: Builder) {
  const SKIN = "#e9e1c8";
  const SCALE = "#3fa58f";
  const SCALE2 = "#2b7f73";
  const GOLD = "#f2c14e";
  const WISP = "#f4f1ff";
  const WISP2 = "#b9d6ff";
  const hoofR = 0.045;
  const legs = [
    { name: "FL", parent: "chest", x: 0.2, z: 0.45, top: 0.88 },
    { name: "FR", parent: "chest", x: -0.2, z: 0.45, top: 0.88 },
    { name: "HL", parent: "hips", x: 0.2, z: -0.5, top: 0.9 },
    { name: "HR", parent: "hips", x: -0.2, z: -0.5, top: 0.9 },
  ];
  for (const L of legs) {
    const hind = L.name[0] === "H";
    const root: [number, number, number] = [L.x, L.top, L.z];
    const foot: [number, number, number] = [L.x, hoofR + 0.05, L.z + (hind ? -0.02 : 0.02)];
    const pts = limb(
      root,
      foot,
      hind ? [0.32, 0.26, 0.2] : [0.3, 0.26, 0.22],
      hind
        ? [[0, 0, 1], [0, 0, -1]]
        : [[0, 0, -1], [0, 0, 1]],
    );
    const names = [
      `legsAndHooves${L.name}Hip`,
      `legsAndHooves${L.name}Knee`,
      `legsAndHooves${L.name}Ankle`,
      `legsAndHooves${L.name}Hoof`,
    ];
    const ch = b.chain(`legsAndHooves${L.name}`, pts, { parent: L.parent, names, role: "leg" });
    b.sweep(ch, [0.06, 0.032], { color: SKIN, sides: 8 });
    // knee cap
    const kn = ch.at(0.4);
    b.part(new THREE.SphereGeometry(0.052, 7, 5), SCALE2, { at: kn.at, bone: kn.bone });
    // fetlock
    const fet = ch.at(0.88);
    b.part(new THREE.SphereGeometry(0.04, 7, 5), SKIN, { at: fet.at, bone: fet.bone });
    // gold hoof
    const hp = pts[pts.length - 1];
    b.part(new THREE.CylinderGeometry(0.05, 0.062, 0.1, 8), GOLD, {
      at: [hp.x, 0.05, hp.z],
      bone: ch.tip ?? ch.joints[ch.joints.length - 1],
    });
    // cloud wisps at the ankle
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const p = [fet.at.x + Math.cos(a) * 0.045, fet.at.y - 0.02, fet.at.z + Math.sin(a) * 0.045];
      b.spike(p, [Math.cos(a) * 0.6, -0.7, Math.sin(a) * 0.6], 0.09, 0.022, {
        color: i % 2 ? WISP2 : WISP,
        bone: fet.bone,
      });
    }
    // thigh scale plates
    for (let i = 0; i < 4; i++) {
      const t = 0.04 + i * 0.07;
      const p = ch.at(t);
      for (const sd of [1, -1]) {
        b.part(new THREE.BoxGeometry(0.02, 0.05, 0.045), i % 2 ? SCALE : SCALE2, {
          at: [p.at.x + sd * 0.055, p.at.y, p.at.z],
          bone: p.bone,
        });
      }
    }
  }
}
```

<!-- call: antlersAndHorns -->

The base source was not included in the prompt (it shows only a `{ base; }` placeholder), so I could not read the skull's real dimensions. I placed everything from the stated box, [-0.45..0.45] × [1.75..2.55] × [0.9..1.6], and the `head` joint, and I haven't checked it against the base geometry. Neither the code nor the rendered result has been run.

**What it builds**
- A small central horn with a gold tip, a brow ridge on each side, and an ear fin with a gold inner fin on each side.
- A branching antler on each side: a main beam of five points, three tines, and a gold tip on the beam and on each tine. Each beam and tine is its own sweep, so they only touch where they are drawn to meet. Antler bases are rooted near the crown at about (±0.12, 1.78, 1.02) and (±0.14, 1.76, 1.15).
- Base dark rings on each antler for detail. These rings are oriented along the world Y axis, so they may not wrap the beam cleanly.

Points are placed in model space and tied to `head` with an explicit `bone: head`. If the real head joint isn't named `head`, the `b.part`/`b.rod` calls will fail. I added no joints of my own.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildAntlersAndHorns(b: Builder) {
  const head = "head";
  const BONE = "#e8d9b0";
  const DARK = "#8a6a3a";
  const GOLD = "#f2c14e";
  const GOLD2 = "#ffe48a";
  const FIN = "#6fd3c4";
  const FIN2 = "#b9f2e6";

  const tip = (p: number[], d: number[], len: number, r: number) =>
    b.spike(p, d, len, r, { color: GOLD, bone: head });

  // central small horn
  b.rod([0, 1.86, 1.3], [0, 2.06, 1.36], [0.035, 0.015], { color: BONE, bone: head });
  tip([0, 2.06, 1.36], [0, 0.45, 0.2], 0.1, 0.022);

  for (const s of [1, -1]) {
    // main beam
    const pts = [
      [s * 0.12, 1.78, 1.02],
      [s * 0.2, 1.98, 0.98],
      [s * 0.3, 2.18, 0.96],
      [s * 0.34, 2.36, 1.02],
      [s * 0.32, 2.46, 1.1],
    ];
    b.sweep(pts, [0.04, 0.016], { color: BONE, bone: head, caps: { start: "round", end: "round" } });
    tip(pts[4], [-s * 0.1, 0.9, 0.3], 0.07, 0.018);
    // tines
    const tines = [
      { from: pts[1], to: [s * 0.38, 2.1, 1.12] },
      { from: pts[2], to: [s * 0.43, 2.32, 0.92] },
      { from: pts[3], to: [s * 0.4, 2.5, 1.32] },
    ];
    for (const t of tines) {
      b.rod(t.from, t.to, [0.026, 0.012], { color: BONE, bone: head });
      const d = [t.to[0] - t.from[0], t.to[1] - t.from[1], t.to[2] - t.from[2]];
      tip(t.to, d, 0.07, 0.016);
    }
    // base rings
    for (const y of [1.82, 1.9]) {
      b.part(new THREE.CylinderGeometry(0.048, 0.052, 0.025, 8), DARK, {
        bone: head,
        at: [s * (0.12 + (y - 1.78) * 0.5), y, 1.01],
      });
    }
    // brow ridge
    b.rod([s * 0.1, 1.8, 1.55], [s * 0.2, 1.84, 1.45], [0.03, 0.022], { color: DARK, bone: head });
    // ear fins
    const fin = b.extrude(
      [[0, 0], [0.16, 0.12, "sharp"], [0.2, 0.0], [0.14, -0.1], [0.02, -0.06]],
      { at: [s * 0.2, 1.8, 1.15], x: [s, 0, 0], thickness: 0.012, color: FIN, bone: head },
    );
    b.extrude(
      [[0.02, 0], [0.12, 0.07, "sharp"], [0.14, 0.0], [0.09, -0.05]],
      { at: [s * 0.2, 1.8, 1.152], x: [s, 0, 0], thickness: 0.006, color: FIN2, bone: head },
    );
    void fin;
    b.part(new THREE.SphereGeometry(0.016, 6, 4), GOLD2, { bone: head, at: [s * 0.36, 1.82, 1.16] });
  }
  void frame;
}
```

<!-- call: tailAndScales -->

The base source was not included in the prompt (it shows a literal `{ base; }` placeholder), so I could not read its dimensions. I placed everything from the stated box and joints, assuming the body runs along z with the rump near z ≈ -0.6 to -0.9 and the back at y ≈ 1.2 to 1.4. The tail attaches at `tail1`. I looked up `tail1` and `hips` via `b.joint`, but the module cannot read the base's joint objects safely, so every part is placed by explicit `bone` names and model-space points. Nothing was checked against the base geometry, so seating on the real surfaces is unverified.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildTailAndScales(b: Builder) {
  const GOLD = "#e8b84a", TEAL = "#2fb5a6", CREAM = "#fff1c9", RED = "#ff6a3a", ORANGE = "#ffa43a", DEEP = "#1f7f86", PALE = "#bff3e8";
  const ex = (pts: number[][], at: number[], x: number[], y: number[], th: number, color: string, bone: string) =>
    b.extrude(pts.map((p) => [p[0], p[1]] as [number, number]), { at, x, y, thickness: th, bevel: th * 0.3, smoothing: 1, color, bone });

  // Fan-shaped flowing tail: layered blades from the rump, arching up and back.
  const base = [0, 1.25, -0.85];
  const blades = 9;
  for (let i = 0; i < blades; i++) {
    const t = i / (blades - 1) - 0.5;
    const ang = t * 1.5;
    const len = 0.85 - Math.abs(t) * 0.25;
    const tip = [Math.sin(ang) * len * 0.8, 1.3 + 0.35 - Math.abs(t) * 0.5 + 0.1, -0.85 - Math.cos(ang) * len * 0.9];
    const mid = [Math.sin(ang) * len * 0.4, 1.25 + 0.3, -0.85 - Math.cos(ang) * len * 0.4];
    const col = i % 3 === 0 ? TEAL : i % 3 === 1 ? GOLD : CREAM;
    b.sweep([base, mid, tip] as any, [0.05, 0.012], { color: col, bone: "tail1", caps: { end: "point" } });
    b.part(new THREE.SphereGeometry(0.035, 6, 4), col, { at: tip, bone: "tail1" });
  }
  // Cloud-curl tip: spiral puffs.
  for (let k = 0; k < 4; k++) {
    const a = k * 1.4;
    const c = [Math.sin(a) * 0.14, 1.55 + Math.cos(a) * 0.08, -1.75 - k * 0.04];
    b.part(new THREE.IcosahedronGeometry(0.1 - k * 0.012, 0), k % 2 ? PALE : CREAM, { at: c, bone: "tail1" });
    b.part(new THREE.TorusGeometry(0.1 - k * 0.012, 0.012, 5, 10), TEAL, { at: c, bone: "tail1", rotation: [0, 90, 0] });
  }
  // Back scale rows: small diamonds down the spine.
  for (let r = 0; r < 12; r++) {
    const z = 0.7 - r * 0.12;
    for (const s of [-1, 0, 1]) {
      const col = s === 0 ? GOLD : r % 2 ? TEAL : DEEP;
      b.part(new THREE.ConeGeometry(0.04, 0.07, 4), col, { at: [s * 0.1, 1.5 + (s === 0 ? 0.03 : -0.02), z], bone: "hips", rotation: [0, 45, s * -20] });
    }
  }
  // Belly plates: cream slabs under the body.
  for (let r = 0; r < 8; r++) {
    b.part(new THREE.BoxGeometry(0.22, 0.03, 0.09), r % 2 ? CREAM : PALE, { at: [0, 0.72, 0.6 - r * 0.15], bone: "hips" });
  }
  // Flame wisps along the flanks.
  for (const s of [1, -1]) {
    for (let k = 0; k < 5; k++) {
      const z = 0.5 - k * 0.3;
      const y = 1.05 + (k % 2) * 0.1;
      const x = s * 0.36;
      const p = [[0, 0], [0.07, 0.1], [0.02, 0.22], [0.12, 0.38], [-0.02, 0.26], [-0.06, 0.1]];
      ex(p, [x, y, z], [0, 0, -1], [s * 0.4, 1, 0], 0.02, k % 2 ? RED : ORANGE, "hips");
      ex(p.map((q) => [q[0] * 0.55, q[1] * 0.55]), [x + s * 0.01, y + 0.02, z], [0, 0, -1], [s * 0.4, 1, 0], 0.024, "#ffe08a", "hips");
    }
  }
}
```

<!-- call: cloudMane -->

The base source was not included in the request (the placeholder `{ base; }` came through literally), so I could not read its dimensions. I placed everything from the stated box and joint names instead. The mane is therefore not seated against the base's real neck surfaces. I also have not run it to check that the joints `neck1`, `neck2` and `chest` exist.

The part builds the following inside the box [-0.5, 1.1, -0.2] to [0.5, 2.2, 1.3]:
- **Neck crest:** a row of cloud puffs along a guessed dorsal curve from the withers up to the poll. Each puff is a cluster of three overlapping spheres in cream, blue-white and teal, with a gold ring under it and a gold spiral curl at its side.
- **Chest:** cloud puffs down the chest front, each with a gold trim ring.
- **Shoulders:** a larger puff on each shoulder top, with gold trim and a teal curl.

Every part is bound to the nearest of the three named joints by distance and uses flat colour strings. The count stays under about 120 parts, and all positions are clamped into the box.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildCloudMane(b: Builder) {
  const CREAM = "#fff3dc";
  const BLUEWHITE = "#dcecff";
  const TEAL = "#8fd8d0";
  const GOLD = "#e8b83a";
  const GOLD_D = "#b98a1e";
  const lo = [-0.5, 1.1, -0.2];
  const hi = [0.5, 2.2, 1.3];
  const clamp = (p: number[], r: number) => [
    Math.min(hi[0] - r, Math.max(lo[0] + r, p[0])),
    Math.min(hi[1] - r, Math.max(lo[1] + r, p[1])),
    Math.min(hi[2] - r, Math.max(lo[2] + r, p[2])),
  ];
  const boneFor = (p: number[]) => (p[1] > 1.65 ? "neck2" : p[1] > 1.4 && p[2] < 0.9 ? "neck1" : "chest");
  const sph = (p: number[], r: number, c: string, sq = 1) => {
    const q = clamp(p, r);
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at: q as any, bone: boneFor(q), scale: [1, sq, 1] });
  };
  const ring = (p: number[], r: number, c: string) => {
    const q = clamp(p, r);
    b.part(new THREE.TorusGeometry(r, r * 0.12, 5, 12), c, {
      at: q as any,
      bone: boneFor(q),
      dir: [0, 0, 1],
      axis: "z",
    });
  };
  const cloud = (p: number[], r: number, c: string, side = 0) => {
    sph(p, r, c, 0.85);
    sph([p[0] + r * 0.7, p[1] + r * 0.1, p[2] + r * 0.2], r * 0.7, BLUEWHITE, 0.85);
    sph([p[0] - r * 0.7, p[1] + r * 0.1, p[2] - r * 0.2], r * 0.7, TEAL, 0.85);
    ring([p[0], p[1] - r * 0.5, p[2]], r * 0.55, GOLD);
    if (side) {
      b.part(new THREE.TorusGeometry(r * 0.45, r * 0.07, 5, 10, Math.PI * 1.5), GOLD_D, {
        at: clamp([p[0] + side * r * 1.0, p[1], p[2]], r * 0.5) as any,
        bone: boneFor(p),
        dir: [1, 0, 0],
        axis: "z",
      });
    }
  };

  // neck crest, withers to poll
  const crest = [
    [0, 1.55, 0.35],
    [0, 1.7, 0.5],
    [0, 1.85, 0.65],
    [0, 2.0, 0.8],
    [0, 2.1, 0.95],
    [0, 2.12, 1.1],
  ];
  crest.forEach((p, i) => {
    const r = 0.1 - i * 0.008;
    cloud([p[0], p[1], p[2]], r, i % 2 ? CREAM : BLUEWHITE, 0);
    cloud([p[0] - 0.1, p[1] - 0.03, p[2] + 0.02], r * 0.7, i % 2 ? TEAL : CREAM, 1);
    cloud([p[0] + 0.1, p[1] - 0.03, p[2] + 0.02], r * 0.7, i % 2 ? TEAL : CREAM, -1);
  });

  // chest front
  for (let i = 0; i < 4; i++) {
    const y = 1.5 - i * 0.12;
    cloud([0, y, 1.0 + i * 0.05], 0.09, i % 2 ? CREAM : BLUEWHITE, 0);
  }
  for (const s of [1, -1]) {
    cloud([s * 0.14, 1.4, 1.05], 0.08, CREAM, s);
    // shoulder tops
    cloud([s * 0.26, 1.62, 0.55], 0.13, BLUEWHITE, s);
    sph([s * 0.3, 1.7, 0.55], 0.07, CREAM, 0.9);
    ring([s * 0.26, 1.55, 0.55], 0.1, GOLD_D);
  }
}
```

<!-- call: faceAndJaw -->

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildFaceAndJaw(b: Builder) {
  // NOTE: the base source was not included in the prompt, so every position below
  // assumes the head faces +Z and sits around (0, 1.6, 1.5) in model space.
  void frame;
  const MUZZLE = "#d9a441", JAW = "#c48f35", TOOTH = "#fff6dc", DARK = "#2a1416";
  const IRIS = "#2fd6c4", IRIS_D = "#1b7f8e", WHITE = "#ffffff", BROW = "#7a4a1c";
  const WHISK = "#f7e7b0", BEARD = "#f4efe0", NOSTRIL = "#3a1d1d", GOLD = "#ffd36a";

  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // Upper jaw (muzzle block) and lower jaw
  b.part(box(0.22, 0.11, 0.3), MUZZLE, { bone: "head", at: [0, 1.52, 1.72] });
  b.part(box(0.18, 0.05, 0.1), GOLD, { bone: "head", at: [0, 1.58, 1.84] });
  b.part(box(0.19, 0.06, 0.28), JAW, { bone: "jaw", at: [0, 1.42, 1.7] });
  b.part(box(0.15, 0.04, 0.05), JAW, { bone: "jaw", at: [0, 1.41, 1.85] });

  // Teeth: upper row points down, lower row points up
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const z = 1.6 + i * 0.07;
      const big = i === 0;
      b.part(new THREE.ConeGeometry(big ? 0.022 : 0.015, big ? 0.07 : 0.045, 5), TOOTH, {
        bone: "head", at: [s * 0.1, 1.455, z], rotation: [180, 0, 0],
      });
      b.part(new THREE.ConeGeometry(0.014, 0.04, 5), TOOTH, {
        bone: "jaw", at: [s * 0.085, 1.465, z + 0.02],
      });
    }
  }
  b.part(new THREE.ConeGeometry(0.012, 0.04, 5), TOOTH, { bone: "head", at: [0, 1.46, 1.85], rotation: [180, 0, 0] });

  // Nostrils
  for (const s of [1, -1]) {
    b.part(sph(0.03, 6, 4), NOSTRIL, { bone: "head", at: [s * 0.065, 1.56, 1.875], scale: [1, 0.8, 0.5] });
  }

  // Eyes, brows, lashes-style accents
  for (const s of [1, -1]) {
    const ex = s * 0.17, ey = 1.7, ez = 1.5;
    b.part(sph(0.075, 10, 8), DARK, { bone: "head", at: [ex, ey, ez], scale: [0.5, 1.1, 0.9] });
    b.part(sph(0.062, 10, 8), IRIS_D, { bone: "head", at: [ex + s * 0.02, ey, ez + 0.012], scale: [0.4, 1, 0.85] });
    b.part(sph(0.048, 10, 8), IRIS, { bone: "head", at: [ex + s * 0.03, ey - 0.012, ez + 0.016], scale: [0.35, 1, 0.8] });
    b.part(sph(0.024, 6, 4), DARK, { bone: "head", at: [ex + s * 0.045, ey - 0.005, ez + 0.02], scale: [0.3, 1.3, 0.8] });
    b.part(sph(0.02, 6, 4), WHITE, { bone: "head", at: [ex + s * 0.05, ey + 0.03, ez + 0.03], scale: [0.3, 1, 1] });
    b.part(sph(0.01, 6, 4), WHITE, { bone: "head", at: [ex + s * 0.05, ey - 0.03, ez - 0.005], scale: [0.3, 1, 1] });
    // brow
    b.rod([s * 0.12, 1.8, 1.56], [s * 0.26, 1.86, 1.46], 0.017, BROW, { bone: "head" });
    b.rod([s * 0.26, 1.86, 1.46], [s * 0.3, 1.9, 1.38], 0.01, BROW, { bone: "head" });
    // lash flick
    b.rod([s * 0.2, 1.74, 1.45], [s * 0.27, 1.77, 1.4], 0.008, DARK, { bone: "head" });
    // whiskers
    for (let k = 0; k < 3; k++) {
      b.rod([s * 0.1, 1.5 - k * 0.015, 1.78], [s * 0.33, 1.52 - k * 0.06, 1.5 - k * 0.05], 0.006, WHISK, { bone: "head" });
    }
  }

  // Beard under the chin on the jaw
  const tufts: [number, number, number, number][] = [
    [0, 1.38, 1.82, 0.16], [0.04, 1.38, 1.74, 0.14], [-0.04, 1.38, 1.74, 0.14],
    [0, 1.38, 1.66, 0.2], [0.05, 1.38, 1.6, 0.13], [-0.05, 1.38, 1.6, 0.13],
  ];
  for (const [x, y, z, l] of tufts) {
    b.part(new THREE.ConeGeometry(0.03, l, 5), BEARD, { bone: "jaw", at: [x, y - l / 2, z], rotation: [180, 0, 0] });
  }
  b.part(sph(0.03, 6, 4), GOLD, { bone: "jaw", at: [0, 1.4, 1.84] });
}
```