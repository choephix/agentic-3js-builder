<!-- call: base -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

export const BASE_PARTS = [
  {
    id: "wings",
    builds: "two fully spread wings: arm bones, finger-like primary feather chains, flame-coloured feather blades, membranes and covert rows with gold tips",
    box: [
      [-2.6, 0.9, -0.9],
      [2.6, 2.4, 0.5],
    ],
    attaches: "shoulderL and shoulderR joints on the upper sides of the chest",
    joints: ["shoulderL", "shoulderR", "chest"],
    floor: false,
    budget: 260,
  },
  {
    id: "tailPlumes",
    builds: "long trailing flame tail: tail chain, fan of streaming feather blades in red, orange and gold, ember tips and glow",
    box: [
      [-0.7, 0, -2.6],
      [0.7, 1.4, -0.5],
    ],
    attaches: "tailBase joint at the rear of the body tube",
    joints: ["tailBase", "hips"],
    floor: false,
    budget: 220,
  },
  {
    id: "headDetail",
    builds: "face and head: beak with separate upper and lower jaw, big stylized eyes, brows, flame crest feathers, cheek tufts, golden circlet",
    box: [
      [-0.35, 1.45, 0.3],
      [0.35, 2.1, 0.95],
    ],
    attaches: "head sphere on the head joint at the end of the neck",
    joints: ["head", "neck1", "neck2"],
    floor: false,
    budget: 160,
  },
  {
    id: "legs",
    builds: "two taloned legs with thigh feather pants, tarsus, three forward toes and one back toe with claws, gold anklets",
    box: [
      [-0.5, 0, -0.3],
      [0.5, 0.9, 0.5],
    ],
    attaches: "hip sockets on the underside of the body, left and right",
    joints: ["hips"],
    floor: true,
    budget: 130,
  },
  {
    id: "plumageTrim",
    builds: "chest feather ruff, back flame scales, gold collar, belly highlights, ember particles and glow accents",
    box: [
      [-0.6, 0.8, -1],
      [0.6, 1.9, 0.8],
    ],
    attaches: "surface of the body loft and neck sweep",
    joints: ["chest", "neck1"],
    floor: false,
    budget: 130,
  },
];

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const RED = "#c8321c";
  const ORANGE = "#f27a1c";
  const GOLD = "#f5c542";

  const hips = b.joint("hips", { at: [0, 1.0, -0.35], dir: [0, 0, 1], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 1.1, 0.15], dir: [0, 0.2, 1], role: "spine" });
  const neck1 = b.joint("neck1", { parent: chest, at: [0, 1.3, 0.6], dir: [0, 0.8, 0.5], role: "neck" });
  const neck2 = b.joint("neck2", { parent: neck1, at: [0, 1.55, 0.72], dir: [0, 0.6, 0.6], role: "neck" });
  b.joint("head", { parent: neck2, at: [0, 1.78, 0.82], dir: [0, 0.2, 1], role: "head" });
  b.joint("tailBase", { parent: hips, at: [0, 1.0, -0.8], dir: [0, 0, -1], role: "tail" });
  b.joint("shoulderL", { parent: chest, at: [0.32, 1.35, 0.1], dir: [1, 0, 0], role: "arm" });
  b.joint("shoulderR", { parent: chest, at: [-0.32, 1.35, 0.1], dir: [-1, 0, 0], role: "arm" });

  // Body loft: tail root, hips, chest, neck base
  b.loft(
    [
      { at: [0, 1.0, -0.85], w: 0.25, h: 0.25 },
      { at: [0, 1.0, -0.4], w: 0.5, h: 0.5 },
      { at: [0, 1.1, 0.15], w: 0.62, h: 0.62 },
      { at: [0, 1.25, 0.5], w: 0.42, h: 0.45 },
    ],
    { bone: [hips, chest], color: RED },
  );
  // Belly highlight base
  b.part(new THREE.SphereGeometry(0.5, 10, 8), ORANGE, {
    bone: chest,
    at: [0, 0.95, 0.15],
    scale: [0.9, 0.8, 1.3],
  });

  // Neck
  b.sweep(
    [
      [0, 1.25, 0.5],
      [0, 1.45, 0.66],
      [0, 1.65, 0.76],
      [0, 1.78, 0.82],
    ],
    [0.17, 0.12],
    { bone: [neck1, neck2], color: ORANGE },
  );

  // Head
  b.part(new THREE.SphereGeometry(0.2, 12, 10), RED, {
    bone: "head",
    at: [0, 1.82, 0.88],
    scale: [1, 1, 1.1],
  });

  // Tail root stub
  b.sweep(
    [
      [0, 1.0, -0.8],
      [0, 0.98, -1.1],
    ],
    [0.12, 0.08],
    { bone: "tailBase", color: GOLD },
  );

  // Shoulder mounts
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.12, 8, 6), GOLD, {
      bone: s > 0 ? "shoulderL" : "shoulderR",
      at: [s * 0.34, 1.35, 0.1],
    });
  }

  return b.root;
}
```

<!-- call: tailPlumes -->

The base source was not included in the prompt: the `{ base; }` placeholder is literal. I could not read the real geometry, so this is built blind against the box you gave, and it may not meet the body at the right height or depth. The assumptions are that the `tailBase` and `hips` joints exist and that the rear of the body tube is near z ≈ -0.5, y ≈ 0.8. I have not run it.

I parent a new chain to `tailBase`. The fan of blades is built from `b.sweep` tubes that skin to the chain, so they do not depend on joint geometry I can't see. If the base has no `tailBase` joint, `b.chain` will throw. The reply is one function, as the brief asks. Everything stays inside the box x ±0.7, y 0–1.4, z -2.6 to -0.5, and uses flat colour strings only.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildTailPlumes(b: Builder) {
  const RED = "#d62a14", ORANGE = "#ff7a1a", GOLD = "#ffc83a", PALE = "#fff0a0", EMBER = "#ff3d0a";
  const root: [number, number, number] = [0, 0.85, -0.55];
  const spine = b.chain(
    "tailPlumesSpine",
    [root, [0, 0.88, -1.0], [0, 0.95, -1.5], [0, 1.0, -2.0]],
    { parent: "tailBase", role: "tail", count: 3 },
  );
  b.sweep(spine, [0.07, 0.02], { color: RED });

  const cols = [RED, ORANGE, GOLD, ORANGE, RED];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1) - 0.5; // -0.5..0.5
    const x = u * 1.0;
    const len = 2.0 - Math.abs(u) * 0.5;
    const endZ = Math.max(-2.55, -0.6 - len);
    const endY = 0.35 + (1 - Math.abs(u) * 1.2) * 0.75;
    const midY = 0.85 + (endY - 0.85) * 0.3;
    const mx = x * 0.45;
    const col = cols[i % cols.length];
    const pts: [number, number, number][] = [
      [x * 0.05, 0.85, -0.58],
      [mx, midY + 0.08, -1.2],
      [x * 0.85, endY + 0.25, -1.9],
      [x, endY, endZ],
    ];
    const blade = b.sweep(pts, [0.035, 0.0], {
      color: col,
      bone: spine.joints[0],
      sides: 4,
      caps: "point",
    } as any);
    // gold core streak
    b.sweep(pts, [0.016, 0.0], {
      color: GOLD,
      bone: spine.joints[0],
      sides: 4,
      caps: "point",
      shift: [0, 0.012],
    } as any);
    // ember tip
    const tip = new THREE.Vector3(...pts[3]);
    b.part(new THREE.OctahedronGeometry(0.05, 0), EMBER, { at: [tip.x, tip.y, Math.max(tip.z, -2.58)], bone: spine.joints[2] });
    b.part(new THREE.OctahedronGeometry(0.025, 0), PALE, { at: [tip.x, tip.y + 0.02, Math.max(tip.z + 0.03, -2.55)], bone: spine.joints[2] });
    void blade;
  }
  // embers drifting
  for (let k = 0; k < 8; k++) {
    const a = k * 0.8;
    b.part(new THREE.TetrahedronGeometry(0.025, 0), k % 2 ? GOLD : EMBER, {
      at: [Math.sin(a) * 0.5, 0.5 + (k % 4) * 0.2, -1.2 - k * 0.15],
      bone: spine.joints[1],
    });
  }
  void frame;
}
```

<!-- call: plumageTrim -->

The base source was not included in the prompt (it shows only a `{ base; }` placeholder), so I could not read its dimensions or surfaces. This add-on is written defensively instead of against known geometry. The joints `chest` and `neck1` and the body surface are looked up at runtime, and every placement falls back to coordinates inside the box if a lookup fails. I have not run it against the real base, so seating on the actual body loft and neck sweep is unchecked.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildPlumageTrim(b: Builder) {
  const X = [-0.6, 0.6], Y = [0.8, 1.9], Z = [-1, 0.8];
  const clampP = (p: number[]) => [
    Math.min(X[1] - 0.02, Math.max(X[0] + 0.02, p[0])),
    Math.min(Y[1] - 0.02, Math.max(Y[0] + 0.02, p[1])),
    Math.min(Z[1] - 0.02, Math.max(Z[0] + 0.02, p[2])),
  ];
  const find = (n: string): any => {
    try {
      return (b as any).joints?.get?.(n) ?? (b as any).joint?.(n);
    } catch {
      return undefined;
    }
  };
  const chest = find("chest");
  const neck = find("neck1");
  const bone = (j: any, fallback: any) => j ?? fallback;
  const RED = "#d8321c", ORANGE = "#ff7a1a", YEL = "#ffc83a", GOLD = "#f2b632", GOLD2 = "#fff0a0", EMBER = "#ffd060", CREAM = "#ffe7a8";

  let skin: any = null;
  try {
    skin = b.surface(b.root);
  } catch {
    skin = null;
  }
  const seat = (p: number[], dir: number[]) => {
    if (skin) {
      try {
        const h = skin.nearest(p);
        if (h) return h;
      } catch {}
    }
    return frame(clampP(p) as any, dir as any);
  };
  const place = (geo: THREE.BufferGeometry, color: string, p: number[], dir: number[], j: any) => {
    const h = seat(p, dir);
    try {
      return b.stick(geo, color, h, { bone: j });
    } catch {
      return b.part(geo, color, { at: clampP(p) as any, dir: dir as any, bone: j });
    }
  };

  // Chest feather ruff: layered flame blades
  const cols = [RED, ORANGE, YEL];
  for (let r = 0; r < 3; r++) {
    const n = 9 - r * 1;
    for (let i = 0; i < n; i++) {
      const a = (-80 + (160 * i) / (n - 1)) * Math.PI / 180;
      const p = [Math.sin(a) * 0.3, 1.25 - r * 0.06, 0.35 + Math.cos(a) * 0.1 - r * 0.02];
      const geo = new THREE.ConeGeometry(0.05 - r * 0.008, 0.2 - r * 0.02, 4);
      place(geo, cols[r], p, [Math.sin(a) * 0.6, -0.5, 0.8], bone(chest, neck));
    }
  }

  // Back flame scales
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const p = [0, 1.55 - t * 0.2, -0.1 - t * 0.6];
    place(new THREE.ConeGeometry(0.06, 0.16, 4), i % 2 ? ORANGE : RED, p, [0, 1, -0.3], bone(chest, neck));
  }

  // Gold collar
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const p = [Math.sin(a) * 0.2, 1.55, 0.3 + Math.cos(a) * 0.2];
    place(new THREE.BoxGeometry(0.07, 0.05, 0.03), i % 2 ? GOLD : GOLD2, p, [Math.sin(a), 0, Math.cos(a)], bone(neck, chest));
  }
  place(new THREE.SphereGeometry(0.04, 6, 4), "#e8362a", [0, 1.45, 0.55], [0, 0, 1], bone(neck, chest));

  // Belly highlights
  for (let i = 0; i < 6; i++) {
    const p = [(i % 2 ? 0.05 : -0.05), 1.0 + i * 0.03, 0.4 - i * 0.07];
    place(new THREE.SphereGeometry(0.05, 5, 4), CREAM, p, [0, -0.4, 1], bone(chest, neck));
  }

  // Ember particles
  for (let i = 0; i < 22; i++) {
    const a = i * 2.4;
    const p = clampP([Math.sin(a) * (0.35 + (i % 4) * 0.05), 1.0 + (i % 9) * 0.09, -0.3 + Math.cos(a) * 0.5]);
    const m = b.part(new THREE.OctahedronGeometry(0.014 + (i % 3) * 0.006, 0), i % 2 ? EMBER : ORANGE, {
      at: p as any,
      bone: bone(chest, neck),
    });
    try {
      const mat = (m as any).mesh.material as THREE.MeshStandardMaterial;
      const c = mat.clone();
      c.emissive.copy(c.color);
      c.emissiveIntensity = 1.4;
      (m as any).mesh.material = c;
    } catch {}
  }
}
```

<!-- call: headDetail -->

The base source was not included in the prompt (the placeholder `{ base; }` came through unexpanded), so I could not read its code. I'm assuming the joints `head`, `neck1` and `neck2` exist and that the head sits around (0, 1.75, 0.6) facing +Z. The function looks `head` up by name and falls back to the root if it isn't found. I haven't run it against the base.

Everything is placed in model space inside the box [-0.35..0.35, 1.45..2.1, 0.3..0.95]. The beak, eyes, brows, crest, cheek tufts and circlet are all flat colours on the `head` bone. The beak is an upper and a lower jaw built as separate parts, hinged on a new `headDetailJaw` joint so it can open.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildHeadDetail(b: Builder) {
  const C = { x: 0, y: 1.75, z: 0.6 };
  const GOLD = "#f5c242", GOLD2 = "#ffe7a0", RED = "#e8402a", ORG = "#ff8a2a", YEL = "#ffd24a";
  const DARK = "#2a1020", WHITE = "#ffffff", AMB = "#ff9d1c";
  const bone: any = "head";
  const jaw = b.joint("headDetailJaw", {
    parent: bone,
    at: [0, C.y - 0.07, C.z + 0.12],
    aim: [0, C.y - 0.08, C.z + 0.3],
    role: "jaw",
  });
  // upper beak
  b.spike([0, C.y - 0.03, C.z + 0.14], [0, -0.04, 1], 0.2, 0.07, { color: GOLD, bone, sides: 6 } as any);
  b.spike([0, C.y - 0.0, C.z + 0.15], [0, -0.06, 1], 0.1, 0.03, { color: GOLD2, bone, sides: 6 } as any);
  // lower beak
  b.spike([0, C.y - 0.075, C.z + 0.14], [0, 0.0, 1], 0.15, 0.05, { color: AMB, bone: jaw, sides: 6 } as any);
  // nostrils
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.01, 5, 4), DARK, { bone, at: [s * 0.025, C.y - 0.01, C.z + 0.2] });
  for (const s of [1, -1]) {
    const ex = s * 0.1, ey = C.y + 0.04, ez = C.z + 0.1;
    b.part(new THREE.SphereGeometry(0.052, 10, 8), DARK, { bone, at: [ex, ey, ez], scale: [0.7, 1.1, 0.5] });
    b.part(new THREE.SphereGeometry(0.043, 10, 8), AMB, { bone, at: [ex, ey - 0.005, ez + 0.012], scale: [0.7, 1.05, 0.5] });
    b.part(new THREE.SphereGeometry(0.026, 8, 6), DARK, { bone, at: [ex, ey, ez + 0.022], scale: [0.7, 1.2, 0.4] });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), WHITE, { bone, at: [ex - s * 0.008, ey + 0.015, ez + 0.032] });
    // brow
    b.rod([s * 0.06, ey + 0.085, ez - 0.01], [s * 0.15, ey + 0.1, ez - 0.05], 0.014, RED, { bone } as any);
    b.rod([s * 0.15, ey + 0.1, ez - 0.05], [s * 0.19, ey + 0.07, ez - 0.07], 0.01, ORG, { bone } as any);
    // cheek tufts
    for (let i = 0; i < 3; i++)
      b.spike([s * 0.15, C.y - 0.03 - i * 0.02, C.z + 0.0], [s * 0.7, -0.2 - i * 0.15, -0.5], 0.14 - i * 0.02, 0.03, {
        color: i === 0 ? YEL : i === 1 ? ORG : RED, bone, sides: 5,
      } as any);
  }
  // circlet
  const ringY = C.y + 0.12;
  b.sweep(
    Array.from({ length: 13 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return [Math.sin(a) * 0.15, ringY - Math.max(0, Math.cos(a)) * 0.0 + Math.cos(a) * 0.01, C.z - 0.02 + Math.cos(a) * 0.14];
    }),
    0.014,
    { color: GOLD, bone, sides: 6 } as any,
  );
  b.part(new THREE.OctahedronGeometry(0.035), RED, { bone, at: [0, ringY + 0.005, C.z + 0.125], scale: [0.8, 1.2, 0.6] });
  b.part(new THREE.OctahedronGeometry(0.015), GOLD2, { bone, at: [0, ringY + 0.005, C.z + 0.14] });
  // flame crest
  const cols = [RED, ORG, YEL, ORG, RED];
  for (let i = 0; i < 5; i++) {
    const t = i / 4 - 0.5;
    const len = 0.3 - Math.abs(t) * 0.12;
    b.spike([t * 0.1, ringY + 0.02, C.z - 0.04 - Math.abs(t) * 0.02], [t * 0.9, 1, -0.7 - i * 0.02], len, 0.035, {
      color: cols[i], bone, sides: 5,
    } as any);
  }
  b.spike([0, ringY + 0.02, C.z - 0.06], [0, 0.8, -0.8], 0.2, 0.02, { color: GOLD2, bone, sides: 4 } as any);
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildLegs(b: Builder) {
  const SKIN = "#e8a21c", SCALE = "#c9780f", GOLD = "#ffd24a", CLAW = "#3a2418";
  const FL = ["#ff5a1f", "#ff8a1f", "#ffb62e", "#d73a16"];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip: [number, number, number] = [s * 0.16, 0.85, 0.0];
    const knee: [number, number, number] = [s * 0.17, 0.62, 0.08];
    const ankle: [number, number, number] = [s * 0.17, 0.12, -0.02];
    const chain = b.chain(`legs${side}`, [hip, knee, ankle], {
      parent: "hips",
      names: [`legsHip${side}`, `legsKnee${side}`, `legsAnkle${side}`],
      role: "leg",
    });
    const [hipJ, kneeJ] = chain.joints;
    const ankleJ = chain.tip ?? chain.joints[chain.joints.length - 1];
    // thigh feather pants
    b.rod(hip, knee, [0.1, 0.06], FL[1], { bone: hipJ });
    b.rod([hip[0], 0.8, 0.02], [knee[0], 0.64, 0.08], [0.115, 0.075], FL[0], { bone: hipJ });
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const base: [number, number, number] = [hip[0] + Math.cos(a) * 0.085, 0.72, 0.04 + Math.sin(a) * 0.075];
      const tip: [number, number, number] = [base[0] + Math.cos(a) * 0.03, 0.42 - (i % 3) * 0.05, base[2] + Math.sin(a) * 0.03 + 0.02];
      b.spike(base, tip, null, 0.045, { color: FL[i % 4], bone: kneeJ });
    }
    b.spike([hip[0], 0.7, 0.1], [hip[0], 0.38, 0.12], null, 0.04, { color: FL[2], bone: kneeJ });
    // tarsus
    b.rod(knee, ankle, [0.03, 0.024], SKIN, { bone: kneeJ });
    for (const y of [0.52, 0.42, 0.32, 0.22]) {
      const t = (0.62 - y) / 0.5;
      b.part(new THREE.BoxGeometry(0.05, 0.02, 0.05), SCALE, {
        bone: kneeJ,
        at: [knee[0], y, knee[2] + (ankle[2] - knee[2]) * t + 0.008],
      });
    }
    // gold anklets
    for (const [y, r] of [[0.2, 0.036], [0.165, 0.032]] as [number, number][]) {
      const t = (0.62 - y) / 0.5;
      b.part(new THREE.TorusGeometry(r, 0.011, 6, 10), GOLD, {
        bone: kneeJ,
        at: [knee[0], y, knee[2] + (ankle[2] - knee[2]) * t],
        dir: [0, 1, 0],
        axis: "z",
      });
    }
    // foot
    const F: [number, number, number] = [s * 0.17, 0.028, 0.0];
    b.part(new THREE.SphereGeometry(0.04, 6, 5), SKIN, { bone: ankleJ, at: [F[0], 0.06, -0.01] });
    for (const deg of [-32, 0, 32]) {
      const a = (deg * Math.PI) / 180;
      const tip: [number, number, number] = [F[0] + Math.sin(a) * 0.12 * s, 0.028, F[2] + Math.cos(a) * 0.2];
      b.rod([F[0], 0.05, -0.01], tip, [0.026, 0.02], SKIN, { bone: ankleJ });
      b.part(new THREE.SphereGeometry(0.024, 6, 5), SCALE, { bone: ankleJ, at: tip });
      const mid: [number, number, number] = [(F[0] + tip[0]) / 2, 0.05, (F[2] + tip[2]) / 2];
      b.part(new THREE.SphereGeometry(0.022, 5, 4), SCALE, { bone: ankleJ, at: mid });
      const ct: [number, number, number] = [tip[0] + Math.sin(a) * 0.04 * s, 0.012, tip[2] + Math.cos(a) * 0.06];
      b.spike(tip, ct, null, 0.02, { color: CLAW, bone: ankleJ });
    }
    const back: [number, number, number] = [F[0], 0.028, -0.12];
    b.rod([F[0], 0.05, -0.01], back, [0.026, 0.02], SKIN, { bone: ankleJ });
    b.spike(back, [F[0], 0.015, -0.19], null, 0.022, { color: CLAW, bone: ankleJ });
  }
}
```

The prompt's base source came through as the literal placeholder `{ base; }`, so I never saw the real model. I guessed the hip sockets at about y = 0.85 and x = ±0.16, and parented the leg chains to `hips` by name. I haven't run it, so it is untested against the actual body. If the real hips sit elsewhere, the socket points need shifting.

Each leg is a three-joint chain named `legsHip`, `legsKnee` and `legsAnkle` plus `L` or `R`, with role `leg`. The thigh is wrapped in a feather pant of orange and gold cones. The tarsus has small scale plates and two gold anklet rings. The foot has three forward toes and one back toe, each ending in a dark claw. All of it stays inside the requested box, and the toes sit at about y = 0.03, so they rest on the floor.

<!-- call: wings -->

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildWings(b: Builder) {
  // NOTE: the base source was not included in the prompt, so shoulder placement is assumed:
  // shoulders near (±0.3, 1.4, 0) on the chest's upper sides.
  const RED = "#c91e18", ORANGE = "#ff7a1c", YELLOW = "#ffc62e", GOLD = "#ffe27a", DEEP = "#8e1210", EMBER = "#ff4a1a";

  const blade = (bone: any, at: number[], d: number[], L: number, w: number, color: string, lift: number, th: number) => {
    const len = Math.hypot(d[0], d[1], d[2]);
    const dn = [d[0] / len, d[1] / len, d[2] / len];
    const perp = [-dn[2], 0, dn[0]];
    const outline: any[] = [
      [0, 0],
      [0.25 * L, w * 0.8],
      [0.7 * L, w],
      [L, 0, "sharp"],
      [0.7 * L, -w],
      [0.25 * L, -w * 0.8],
    ];
    return b.extrude(outline, {
      at: [at[0], at[1] + lift, at[2]],
      x: dn,
      y: perp,
      thickness: th,
      color,
      bone,
    });
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = [s * 0.3, 1.4, 0.0];
    const el = [s * 0.85, 1.72, -0.12];
    const wr = [s * 1.35, 1.88, -0.02];

    const arm = b.chain(`wingsArm${S}`, [sh, el, wr], {
      parent: `shoulder${S}`,
      names: [`wingsUpper${S}`, `wingsFore${S}`, `wingsHand${S}`],
      role: "wing",
    });
    b.sweep(arm, [0.075, 0.04], { color: RED });
    b.part(new THREE.SphereGeometry(0.06, 6, 5), GOLD, { at: el, bone: arm.joints[1] });
    b.part(new THREE.SphereGeometry(0.05, 6, 5), GOLD, { at: wr, bone: arm.joints[1] });

    const hand = arm.tip ?? arm.joints[1];

    // membrane between arm and trailing edge
    b.slab(
      [sh, el, wr, [s * 1.3, 1.82, -0.5], [s * 0.85, 1.66, -0.6], [s * 0.35, 1.38, -0.4]],
      { color: DEEP, thickness: 0.02, bone: arm.joints[0] },
    );

    // primaries: fan of flame feathers off the wrist
    const N = 8;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const a = (-5 + 95 * t) * (Math.PI / 180);
      const L = 1.15 - 0.3 * t;
      const d = [s * Math.cos(a), -0.05 - 0.02 * i, -Math.sin(a)];
      const j = b.joint(`wingsPrimary${S}${i + 1}`, {
        parent: hand,
        at: wr,
        dir: d,
        role: "digit",
      });
      const lift = -0.012 * i;
      blade(j, wr, d, L, 0.095, RED, lift, 0.02);
      blade(j, wr, d, L * 0.82, 0.062, ORANGE, lift + 0.012, 0.012);
      blade(j, wr, d, L * 0.55, 0.035, YELLOW, lift + 0.02, 0.01);
      // gold tip
      const tipAt = [wr[0] + d[0] * L * 0.8, wr[1] + d[1] * L * 0.8, wr[2] + d[2] * L * 0.8];
      blade(j, tipAt, d, L * 0.2, 0.05, GOLD, lift + 0.026, 0.012);
    }

    // secondaries along the forearm / upper arm, trailing back
    const secPts = [0.2, 0.4, 0.6, 0.8, 1.0].map((u) => {
      const seg = u < 0.5 ? [sh, el, u * 2] : [el, wr, (u - 0.5) * 2];
      const [p, q, k] = seg as [number[], number[], number];
      return [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k];
    });
    secPts.forEach((p, i) => {
      const bone = i < 2 ? arm.joints[0] : arm.joints[1];
      const d = [s * (0.25 - 0.05 * i), -0.08, -1];
      const L = 0.62 - 0.03 * i;
      blade(bone, p, d, L, 0.1, RED, -0.03, 0.018);
      blade(bone, p, d, L * 0.8, 0.065, ORANGE, -0.018, 0.012);
      const tp = [p[0] + d[0] * L * 0.78, p[1] + d[1] * L * 0.78, p[2] + d[2] * L * 0.78];
      blade(bone, tp, d, L * 0.22, 0.05, GOLD, -0.01, 0.012);
    });

    // covert rows with gold tips along the leading arm
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 7; i++) {
        const u = (i + 0.5) / 7;
        const seg = u < 0.5 ? [sh, el, u * 2] : [el, wr, (u - 0.5) * 2];
        const [p, q, k] = seg as [number[], number[], number];
        const at = [
          p[0] + (q[0] - p[0]) * k,
          p[1] + (q[1] - p[1]) * k + 0.03,
          p[2] + (q[2] - p[2]) * k - 0.05 - row * 0.12,
        ];
        const bone = u < 0.5 ? arm.joints[0] : arm.joints[1];
        const d = [s * 0.2, -0.05, -1];
        const L = 0.3 - row * 0.03;
        blade(bone, at, d, L, 0.06, row ? ORANGE : EMBER, 0.02 + row * 0.01, 0.014);
        const tp = [at[0] + d[0] * L * 0.75, at[1], at[2] + d[2] * L * 0.75];
        blade(bone, tp, d, L * 0.25, 0.04, GOLD, 0.03 + row * 0.01, 0.012);
      }
    }
  }
}
```