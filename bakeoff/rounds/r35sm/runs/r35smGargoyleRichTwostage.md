<!-- call: stage1 -->

```ts
import * as THREE from "three";
import { createBuilder, bezier, catmull, polyline } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A winged stone gargoyle crouched on a cathedral ledge, gothic stone carving style.",
};

export const REQUESTS = [
  {
    id: "browCarving",
    kind: "add",
    part: "head",
    what: "Heavy carved brow ridges with chiselled furrow lines and cheek-bone ridges, in STONE_LIGHT with STONE_DARK grooves.",
    at: [0, 1.12, 0.5],
    normal: [0, 0.4, 1],
    bone: "head",
    room: [0.34, 0.12, 0.12],
  },
  {
    id: "wingRibs",
    kind: "add",
    part: "wingL",
    what: "Bat-wing finger bones: four raised ribs fanning from the shoulder to the wing's scalloped edge, with claws at the tips, on both wings.",
    at: [0.22, 1.1, -0.35],
    normal: [1, 0.2, 0],
    bone: "wingL",
    room: [0.1, 0.8, 0.7],
  },
  {
    id: "chestRelief",
    kind: "add",
    part: "torso",
    what: "A carved quatrefoil emblem on the chest with a ring of studs, in STONE_LIGHT, protruding a few cm.",
    at: [0, 0.72, 0.3],
    normal: [0, 0, 1],
    bone: "chest",
    room: [0.3, 0.3, 0.1],
  },
  {
    id: "clawsFront",
    kind: "add",
    part: "armL",
    what: "Chunky knuckles and long curved claws gripping the ledge edge, on both front hands.",
    at: [0.28, 0.29, 0.45],
    normal: [0, 0, 1],
    bone: "handL",
    room: [0.2, 0.1, 0.2],
  },
  {
    id: "ledgeCornice",
    kind: "add",
    part: "ledge",
    what: "Gothic cornice moulding along the ledge front: a row of small trefoil arches and dentils beneath the lip, plus a weathered corbel at each end.",
    at: [0, 0.12, 0.6],
    normal: [0, 0, 1],
    bone: null,
    room: [1.4, 0.2, 0.1],
  },
  {
    id: "mossAndCracks",
    kind: "add",
    part: "ledge",
    what: "Moss tufts in MOSS on the ledge top and in the gargoyle's creases, plus a few chipped corners and hairline cracks.",
    at: [0.4, 0.26, 0.3],
    normal: [0, 1, 0],
    bone: null,
    room: [1.2, 0.08, 0.9],
  },
  {
    id: "tailTip",
    kind: "add",
    part: "tail",
    what: "A spade-shaped carved tail tip with a central ridge, and small spined vertebra bumps along the tail.",
    at: [0.4, 0.3, -0.85],
    normal: [0, 1, 0],
    bone: "tail3",
    room: [0.25, 0.15, 0.25],
  },
  {
    id: "eyeSockets",
    kind: "add",
    part: "head",
    what: "Deep-set eye sockets rimmed with STONE_DARK, with a rune ring around each glowing eye.",
    at: [0, 1.07, 0.52],
    normal: [0, 0, 1],
    bone: "head",
    room: [0.28, 0.1, 0.06],
  },
  {
    id: "stoneWeathering",
    kind: "texture",
    part: "torso",
    what: "Weathered limestone: mottled grey in STONE with STONE_DARK soot streaks running down, and pale chisel marks on top faces.",
  },
  {
    id: "wingTexture",
    kind: "texture",
    part: "wingL",
    what: "Carved membrane folds radiating from the shoulder in STONE_DARK grooves with STONE_LIGHT edges, on both wings.",
  },
  {
    id: "ledgeStone",
    kind: "texture",
    part: "ledge",
    what: "Ashlar block courses with mortar lines in STONE_DARK, green MOSS stains near the top, and rain-streaked grime.",
  },
];

export const STONE = "#8d8a84";
export const STONE_DARK = "#5f5c59";
export const STONE_LIGHT = "#b5b1a8";
export const LEDGE = "#77746f";
export const MOSS = "#5f7a3a";
export const HORN = "#4a4743";
export const EYE = "#ffb02e";
export const TOOTH = "#d8d3c4";

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "gargoyle" });

  // Ledge
  b.part(new THREE.BoxGeometry(1.4, 0.2, 1.5), LEDGE, { at: [0, 0.1, -0.15], name: "ledge", bone: undefined });
  b.part(new THREE.BoxGeometry(1.5, 0.06, 1.6), STONE_DARK, { at: [0, 0.22, -0.15], name: "ledgeLip" });
  b.part(new THREE.BoxGeometry(0.5, 0.01, 0.4), MOSS, { at: [-0.5, 0.255, 0.2], name: "mossPatch" });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.55, -0.2], aim: [0, 0.7, 0.0], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.68, 0.0], aim: [0, 0.85, 0.15], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.82, 0.14], aim: [0, 0.98, 0.3], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.98, 0.3], aim: [0, 1.0, 0.5], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.92, 0.42], aim: [0, 0.9, 0.6], role: "jaw" });

  // Torso, neck
  const torso = b.sweep(polyline([[0, 0.5, -0.3], [0, 0.6, -0.1], [0, 0.78, 0.12]]), [0.2, 0.25], {
    bone: [hips, chest], color: STONE, name: "torso", sides: 8,
  });
  b.along(torso, 5, (at) => b.spike(at, at, 0.08, 0.035, { color: STONE_DARK }));
  b.rod([0, 0.8, 0.1], [0, 0.98, 0.32], [0.15, 0.13], STONE, { bone: neck, name: "neckTube" });
  b.part(new THREE.BoxGeometry(0.36, 0.14, 0.3), STONE_DARK, { at: [0, 0.82, 0.05], bone: chest, name: "shoulderYoke" });

  // Head
  b.part(new THREE.BoxGeometry(0.32, 0.26, 0.3), STONE, { at: [0, 1.03, 0.4], bone: head, name: "head" });
  b.part(new THREE.BoxGeometry(0.21, 0.11, 0.2), STONE, { at: [0, 0.975, 0.57], bone: head, name: "muzzle" });
  b.part(new THREE.BoxGeometry(0.36, 0.05, 0.1), STONE_LIGHT, { at: [0, 1.14, 0.5], bone: head, name: "brow" });
  b.part(new THREE.BoxGeometry(0.17, 0.04, 0.2), STONE_DARK, { at: [0, 0.885, 0.55], bone: jaw, name: "jawLower" });
  b.part(new THREE.BoxGeometry(0.06, 0.04, 0.05), STONE, { at: [0, 0.97, 0.69], bone: head, name: "nose" });
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.ConeGeometry(0.014, 0.05, 5), TOOTH, {
      at: [-0.07 + i * 0.047, 0.915, 0.65], rotation: [180, 0, 0], bone: head,
    });
  }
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.016, 0.05, 5), TOOTH, { at: [s * 0.06, 0.92, 0.62], bone: jaw });
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), EYE, { at: [s * 0.09, 1.07, 0.55], bone: head, name: "eye" }), 1.4);
    b.part(new THREE.BoxGeometry(0.1, 0.03, 0.04), STONE_DARK, { at: [s * 0.09, 1.1, 0.56], bone: head });
    // horns
    b.sweep(bezier([s * 0.11, 1.12, 0.38], [s * 0.2, 1.3, 0.35], [s * 0.15, 1.4, 0.15]), [0.055, 0], {
      bone: head, color: HORN, caps: { start: "flat", end: "point" }, sides: 6,
    });
    // ears
    b.part(new THREE.ConeGeometry(0.05, 0.16, 4), STONE_DARK, {
      at: [s * 0.18, 1.1, 0.3], rotation: [0, 0, -s * 40], bone: head,
    });
    // cheek ridge
    b.part(new THREE.BoxGeometry(0.04, 0.05, 0.14), STONE_LIGHT, { at: [s * 0.17, 0.98, 0.5], bone: head });
  }

  // Limbs
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${n}`,
      polyline([[s * 0.27, 0.75, 0.1], [s * 0.33, 0.5, 0.28], [s * 0.28, 0.3, 0.45]]),
      { parent: chest, names: [`shoulder${n}`, `elbow${n}`, `hand${n}`], role: "arm" },
    );
    b.sweep(arm, [0.09, 0.06], { color: STONE, name: `arm${n}` });
    b.part(new THREE.SphereGeometry(0.12, 7, 5), STONE_DARK, { at: [s * 0.27, 0.75, 0.08], bone: chest, name: `shoulderBall${n}` });
    b.part(new THREE.BoxGeometry(0.16, 0.06, 0.2), STONE, { at: [s * 0.28, 0.285, 0.5], bone: arm.joints[2], name: `palm${n}` });
    for (let i = -1; i <= 1; i++) {
      b.spike([s * 0.28 + i * 0.05, 0.29, 0.6], [i * 0.15, -0.35, 1], 0.1, 0.022, { color: HORN, bone: arm.joints[2] });
    }

    const leg = b.chain(
      `leg${n}`,
      polyline([[s * 0.26, 0.5, -0.25], [s * 0.4, 0.4, 0.0], [s * 0.3, 0.28, -0.05]]),
      { parent: hips, names: [`hip${n}`, `knee${n}`, `ankle${n}`], role: "leg" },
    );
    b.sweep(leg, [0.12, 0.07], { color: STONE, name: `leg${n}` });
    b.part(new THREE.SphereGeometry(0.16, 7, 5), STONE, { at: [s * 0.3, 0.5, -0.27], bone: hips, name: `haunch${n}` });
    b.part(new THREE.BoxGeometry(0.15, 0.05, 0.28), STONE_DARK, { at: [s * 0.3, 0.285, 0.05], bone: leg.joints[2], name: `foot${n}` });
    for (let i = -1; i <= 1; i++) {
      b.spike([s * 0.3 + i * 0.045, 0.29, 0.17], [i * 0.12, -0.3, 1], 0.09, 0.02, { color: HORN, bone: leg.joints[2] });
    }

    // Wing
    const wing = b.joint(`wing${n}`, { parent: chest, at: [s * 0.2, 0.82, -0.02], aim: [s * 0.2, 1.3, -0.1], role: "wing" });
    const wp = b.extrude(
      [[0, 0], [0.55, -0.05], [0.6, 0.35], [0.42, 0.28], [0.34, 0.62], [0.2, 0.5], [0.1, 0.8], [0, 0.55]],
      { at: [s * 0.22, 0.84, -0.05], x: [0, 0, -1], y: [s * 0.35, 1, 0], thickness: 0.04, bevel: 0.008, color: STONE_DARK, bone: wing, name: `wing${n}` },
    );
    void wp;
    b.rod([s * 0.22, 0.84, -0.05], [s * 0.4, 1.5, -0.2], [0.035, 0.02], STONE, { bone: wing, name: `wingBone${n}` });
  }

  // Tail
  const tail = b.chain("tail", catmull([[0, 0.5, -0.38], [0, 0.4, -0.7], [0.2, 0.32, -0.95], [0.42, 0.3, -0.85]]), {
    parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"],
  });
  b.sweep(tail, [0.1, 0.03], { color: STONE, name: "tail", caps: { end: "point" } });

  for (const add of STAGE2) add(b);
  return b.root;
}
```

<!-- call: texture -->

stoneWeathering: the torso gets mottled limestone with soot streaks that run down and pale chisel marks on its upward faces.
wingTexture: both wings get STONE_DARK grooves radiating from the shoulder, with STONE_LIGHT ridges beside them.
ledgeStone: the ledge gets ashlar courses with mortar lines, moss stains near the top and rain-streaked grime.

## Edits

<<<<<<< SEARCH
export const STAGE2: ((b: Builder) => void)[] = [];
=======
export const STAGE2: ((b: Builder) => void)[] = [];

const hex = (c: string) => rgb(c);
const fr = (x: number) => x - Math.floor(x);

const TORSO_PAINT = paint((p, n) => {
  const base = mix(STONE, STONE_LIGHT, smoothstep(0.35, 0.75, noise(p, 0.12, 3)) * 0.6);
  let c = mix(base, STONE_DARK, 0.55 * smoothstep(0.55, 0.8, noise(p, 0.1, 7)));
  const streak = noise(new THREE.Vector3(p.x * 6, p.y * 0.6, p.z * 6), 0.1, 11);
  c = mix(c, STONE_DARK, 0.5 * smoothstep(0.58, 0.75, streak) * smoothstep(-0.2, 0.6, 1 - n.y));
  const chisel = fr((p.x * 0.7 + p.z * 1.3) / 0.035) < 0.1 ? 1 : 0;
  return mix(c, STONE_LIGHT, 0.5 * chisel * smoothstep(0.5, 0.9, n.y));
});

const WING_PAINT = paint((p, n, s) => {
  const ang = Math.atan2(s[1], s[0] + 0.0001);
  const ribs = fr(ang * 9 + noise(p, 0.2, 5) * 0.4);
  const groove = Math.abs(ribs - 0.5) < 0.07;
  const edge = Math.abs(ribs - 0.5) > 0.4 && Math.abs(ribs - 0.5) < 0.46;
  const base = mix(STONE_DARK, STONE, 0.35 * noise(p, 0.1, 2));
  if (groove) return mix(STONE_DARK, "#000000", 0.35);
  if (edge) return STONE_LIGHT;
  return mix(base, STONE_LIGHT, 0.2 * smoothstep(0.3, 1, n.y));
});

const LEDGE_PAINT = paint((p, n) => {
  const row = Math.floor(p.y / 0.1);
  const col = p.y > 0.16 ? p.x : p.x + (n.z !== 0 ? 0 : 0);
  const u = Math.abs(n.z) > 0.5 ? p.x : Math.abs(n.x) > 0.5 ? p.z : p.x;
  const off = (row % 2) * 0.3;
  const bu = fr((u + off) / 0.6);
  const bv = fr(p.y / 0.1);
  void col;
  let c = mix(LEDGE, STONE_LIGHT, 0.25 * noise(p, 0.08, 4 + Math.floor((u + off) / 0.6) + row * 3));
  if (Math.abs(n.y) < 0.9 && (bv < 0.07 || bu < 0.02)) c = hex(STONE_DARK);
  const rain = noise(new THREE.Vector3(p.x * 8, p.y * 0.5, p.z * 8), 0.1, 9);
  c = mix(c, STONE_DARK, 0.4 * smoothstep(0.6, 0.78, rain));
  c = mix(c, MOSS, 0.7 * smoothstep(0.5, 0.75, noise(p, 0.1, 13)) * smoothstep(0.1, 0.24, p.y));
  return c;
});
>>>>>>> REPLACE

<<<<<<< SEARCH
import { createBuilder, bezier, catmull, polyline } from "agentic-3js-builder";
=======
import { createBuilder, bezier, catmull, polyline, paint, noise, mix, smoothstep, rgb } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.BoxGeometry(1.4, 0.2, 1.5), LEDGE, { at: [0, 0.1, -0.15], name: "ledge", bone: undefined });
=======
  b.part(new THREE.BoxGeometry(1.4, 0.2, 1.5), LEDGE_PAINT, { at: [0, 0.1, -0.15], name: "ledge", bone: undefined });
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: [hips, chest], color: STONE, name: "torso", sides: 8,
=======
    bone: [hips, chest], color: TORSO_PAINT, name: "torso", sides: 8,
>>>>>>> REPLACE

<<<<<<< SEARCH
thickness: 0.04, bevel: 0.008, color: STONE_DARK, bone: wing, name: `wing${n}` },
=======
thickness: 0.04, bevel: 0.008, color: WING_PAINT, bone: wing, name: `wing${n}` },
>>>>>>> REPLACE

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addBrowCarving(b: Builder) {
  const head = "head";
  const ridgeBox = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  for (const s of [1, -1]) {
    // heavy brow ridge, angled down toward the outer corner
    b.part(ridgeBox(0.17, 0.045, 0.07), STONE_LIGHT, {
      at: [s * 0.09, 1.135, 0.54],
      rotation: [0, 0, -s * 14],
      bone: head,
      name: `browRidge${s}`,
    });
    // outer brow wing sweeping to the temple
    b.part(ridgeBox(0.07, 0.035, 0.06), STONE_LIGHT, {
      at: [s * 0.175, 1.115, 0.49],
      rotation: [0, s * 25, -s * 28],
      bone: head,
      name: `browWing${s}`,
    });
    // dark groove below the ridge
    b.part(ridgeBox(0.15, 0.012, 0.03), STONE_DARK, {
      at: [s * 0.09, 1.105, 0.565],
      rotation: [0, 0, -s * 10],
      bone: head,
      name: `browGroove${s}`,
    });
    // chiselled furrow lines above the ridge
    for (let i = 0; i < 3; i++) {
      b.part(ridgeBox(0.012, 0.035, 0.012), STONE_DARK, {
        at: [s * (0.05 + i * 0.04), 1.17 + (i === 1 ? 0.006 : 0), 0.53],
        rotation: [-20, 0, s * (10 - i * 8)],
        bone: head,
        name: `furrow${s}_${i}`,
      });
    }
    // cheek-bone ridge with stepped blocks
    b.part(ridgeBox(0.045, 0.04, 0.12), STONE_LIGHT, {
      at: [s * 0.175, 1.0, 0.54],
      rotation: [0, s * 10, 0],
      bone: head,
      name: `cheekBone${s}`,
    });
    b.part(ridgeBox(0.03, 0.02, 0.09), STONE_DARK, {
      at: [s * 0.185, 0.968, 0.54],
      bone: head,
      name: `cheekShade${s}`,
    });
    // nasolabial groove running from nose toward the cheek
    b.part(ridgeBox(0.012, 0.05, 0.015), STONE_DARK, {
      at: [s * 0.06, 0.995, 0.675],
      rotation: [0, 0, s * 25],
      bone: head,
      name: `noseFold${s}`,
    });
    // small eye socket rim underlining
    b.part(ridgeBox(0.09, 0.012, 0.025), STONE_DARK, {
      at: [s * 0.09, 1.035, 0.565],
      bone: head,
      name: `socketRim${s}`,
    });
  }

  // central glabella wedge between the brows
  b.part(new THREE.ConeGeometry(0.03, 0.07, 4), STONE_LIGHT, {
    at: [0, 1.12, 0.57],
    rotation: [180, 45, 0],
    bone: head,
    name: "glabella",
  });
  // vertical frown crease
  b.part(ridgeBox(0.012, 0.06, 0.012), STONE_DARK, {
    at: [0, 1.17, 0.55],
    rotation: [-15, 0, 0],
    bone: head,
    name: "frownCrease",
  });
  // bridge of the nose
  b.part(ridgeBox(0.04, 0.06, 0.05), STONE_LIGHT, {
    at: [0, 1.04, 0.62],
    rotation: [-25, 0, 0],
    bone: head,
    name: "noseBridge",
  });
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder, bezier, catmull, rng } from "agentic-3js-builder";

export function addWingRibs(b: Builder) {
  const R = rng(11);
  const GROOVE = "#4a4744";
  const BONE_TIP = "#2f2d2b";

  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const bone = n === "L" ? "wingL" : "wingR";
    // wrist point near the wing arm's end
    const root = [s * 0.22, 0.86, -0.05] as [number, number, number];
    const wrist = [s * 0.4, 1.5, -0.2] as [number, number, number];

    // thickened wrist knuckle
    b.part(new THREE.SphereGeometry(0.05, 6, 5), STONE_LIGHT, { at: wrist, bone, name: `wristKnob${n}` });

    // four finger ribs fanning from wrist toward the scalloped edge
    const tips: [number, number, number][] = [
      [s * 0.62, 1.38, -0.5],
      [s * 0.7, 1.15, -0.62],
      [s * 0.68, 0.95, -0.6],
      [s * 0.5, 0.9, -0.4],
    ];
    tips.forEach((tip, i) => {
      const mid: [number, number, number] = [
        (wrist[0] + tip[0]) / 2 + s * 0.02,
        (wrist[1] + tip[1]) / 2 + 0.06,
        (wrist[2] + tip[2]) / 2 - 0.03,
      ];
      const path = bezier(wrist, mid, tip);
      // rib bone on the outer side of the membrane
      const rib = b.sweep(path, [0.03, 0.014], {
        bone, color: STONE_LIGHT, sides: 6, caps: { start: "round", end: "flat" }, name: `wingRib${n}${i}`,
      });
      // knuckle joints along the rib
      b.along(rib, 2, (at) =>
        b.part(new THREE.SphereGeometry(0.026 - i * 0.002, 6, 4), STONE_LIGHT, {
          at: at.at, bone, name: `ribJoint${n}${i}`,
        }),
      );
      // groove strip in the membrane toward the shoulder
      b.rod(root, tip, 0.006, GROOVE, { bone, name: `membraneFold${n}${i}` });
      // claw at the tip
      const d = path.tangentAt(1);
      b.spike(tip, [d.x, d.y - 0.5, d.z], 0.1, 0.02, {
        color: BONE_TIP, bone, sides: 5, name: `wingClaw${n}${i}`,
      });
      // scallop stud at the edge
      b.part(new THREE.SphereGeometry(0.018, 5, 4), STONE_DARK, { at: tip, bone, name: `tipStud${n}${i}` });
    });

    // thumb claw at the wrist
    b.spike(wrist, [s * 0.3, 0.7, -0.1], 0.14, 0.03, { color: BONE_TIP, bone, sides: 6, name: `thumbClaw${n}` });

    // arm-bone ridge: rim bumps along the upper arm
    const arm = catmull([root, [s * 0.3, 1.15, -0.1], wrist]);
    b.along(arm, 4, (at) =>
      b.part(new THREE.BoxGeometry(0.05, 0.03, 0.05), STONE_DARK, {
        at: at.at, bone, rotation: [R() * 40, R() * 40, 0], name: `armRidge${n}`,
      }),
    );
  }
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder, svg, rng } from "agentic-3js-builder";

export function addChestRelief(b: Builder) {
  const R = rng(23);
  const RING = "#a39f95";
  const CLAW = "#3a3835";

  // ---- Chest quatrefoil relief ----
  const emblem = svg(
    `<svg viewBox="0 0 100 100">
      <g fill="#d8d8d8" stroke="#3a3a3a" stroke-width="3">
        <circle cx="50" cy="26" r="19"/><circle cx="50" cy="74" r="19"/>
        <circle cx="26" cy="50" r="19"/><circle cx="74" cy="50" r="19"/>
        <rect x="30" y="30" width="40" height="40" transform="rotate(45 50 50)"/>
      </g>
      <circle cx="50" cy="50" r="9" fill="#6a6a6a" stroke="#2a2a2a" stroke-width="3"/>
      <g fill="none" stroke="#2a2a2a" stroke-width="2">
        <circle cx="50" cy="26" r="11"/><circle cx="50" cy="74" r="11"/>
        <circle cx="26" cy="50" r="11"/><circle cx="74" cy="50" r="11"/>
      </g>
    </svg>`,
    { size: 256 },
  );
  const cx = 0, cy = 0.72, cz = 0.335;
  b.part(new THREE.CylinderGeometry(0.15, 0.16, 0.025, 12), STONE_DARK, {
    at: [cx, cy, cz - 0.005], dir: [0, 0, 1], bone: "chest", name: "s23emblemBase",
  });
  b.part(new THREE.PlaneGeometry(0.25, 0.25), STONE_LIGHT, {
    at: [cx, cy, cz + 0.016], dir: [0, 0, 1], axis: "z", bone: "chest", texture: emblem, name: "s23emblem",
  });
  // ring of studs
  const n = 12;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.0125, 5, 4), RING, {
      at: [cx + Math.cos(a) * 0.145, cy + Math.sin(a) * 0.145, cz + 0.012],
      bone: "chest", name: "s23stud",
    });
  }
  // little pointed finials at the four lobes
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    b.part(new THREE.ConeGeometry(0.02, 0.05, 4), STONE_LIGHT, {
      at: [cx + Math.cos(a) * 0.17, cy + Math.sin(a) * 0.17, cz + 0.005],
      dir: [Math.cos(a), Math.sin(a), 0.1], bone: "chest", name: "s23finial",
    });
  }

  // ---- Front hands: knuckles and claws ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const bone = `hand${side}`;
    const x0 = s * 0.28;
    // wrist cuff
    b.part(new THREE.BoxGeometry(0.15, 0.07, 0.05), STONE_DARK, {
      at: [x0, 0.33, 0.37], bone, name: `s23wrist${side}`,
    });
    for (let i = -1; i <= 1; i++) {
      const x = x0 + i * 0.05;
      // knuckle
      b.part(new THREE.SphereGeometry(0.03, 6, 5), STONE_LIGHT, {
        at: [x, 0.33, 0.52], bone, name: `s23knuckle${side}`,
      });
      // finger segment
      b.part(new THREE.BoxGeometry(0.04, 0.035, 0.1), STONE, {
        at: [x, 0.3, 0.58], rotation: [10, 0, 0], bone, name: `s23finger${side}`,
      });
      // curved claw: two segments hooking down
      const jitter = (R() - 0.5) * 0.02;
      b.spike([x, 0.3, 0.63], [i * 0.1, -0.2, 1], 0.07, 0.02, { color: CLAW, bone, name: `s23claw${side}` });
      b.spike([x + i * 0.007 + jitter, 0.285, 0.69], [i * 0.1, -1, 0.5], 0.07, 0.014, {
        color: CLAW, bone, name: `s23clawTip${side}`,
      });
    }
    // thumb
    b.part(new THREE.CapsuleGeometry(0.02, 0.07, 3, 6), STONE, {
      at: [x0 + s * 0.09, 0.31, 0.46], rotation: [90, 0, s * 25], bone, name: `s23thumb${side}`,
    });
    b.spike([x0 + s * 0.11, 0.3, 0.52], [s * 0.4, -0.4, 1], 0.06, 0.016, { color: CLAW, bone, name: `s23thumbClaw${side}` });
    // chips on the ledge under the hand
    b.part(new THREE.BoxGeometry(0.03, 0.012, 0.02), STONE_DARK, {
      at: [x0 + s * 0.05, 0.255, 0.62], rotation: [0, 30, 0], bone, name: `s23chip${side}`,
    });
  }
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder, rng } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";

export function addLedgeCornice(b: Builder) {
  const R = rng(11);
  const FRONT = 0.62; // ledge lip front face z (ledge box spans z -0.9..0.6, lip -0.95..0.65)
  const LIP_Z = 0.65;
  const CREAM = "#a39f94";
  const SHADOW = "#3f3c3a";

  // Trefoil arch texture, drawn dark recess with a light rim
  const trefoil = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 64 V28 Q6 8 32 6 Q58 8 58 28 V64 Z" fill="#2d2b2a" stroke="#cfcabd" stroke-width="4"/>
      <circle cx="32" cy="22" r="8" fill="none" stroke="#8d8a84" stroke-width="3"/>
      <circle cx="22" cy="34" r="8" fill="none" stroke="#8d8a84" stroke-width="3"/>
      <circle cx="42" cy="34" r="8" fill="none" stroke="#8d8a84" stroke-width="3"/>
    </svg>`,
    { size: 128 },
  );

  // Cornice band under the lip
  b.part(new THREE.BoxGeometry(1.46, 0.035, 0.05), STONE_LIGHT, { at: [0, 0.185, LIP_Z + 0.02], name: "cornice.top" });
  b.part(new THREE.BoxGeometry(1.42, 0.03, 0.04), STONE, { at: [0, 0.155, LIP_Z - 0.005], name: "cornice.mid" });

  // Dentils row
  const dentils: THREE.BufferGeometry[] = [];
  const nD = 24;
  for (let i = 0; i < nD; i++) {
    const x = -0.68 + (i * 1.36) / (nD - 1);
    dentils.push(new THREE.BoxGeometry(0.03, 0.03, 0.035).translate(x, 0.125, LIP_Z - 0.03 + R() * 0.004));
  }
  const merged = mergeGeos(dentils);
  if (merged) b.part(merged, STONE_LIGHT, { at: [0, 0, 0], name: "dentils" });

  // Trefoil arch panels on the ledge face
  const n = 6;
  for (let i = 0; i < n; i++) {
    const x = -0.57 + (i * 1.14) / (n - 1);
    b.part(new THREE.PlaneGeometry(0.15, 0.15), "#ffffff", {
      at: [x, 0.06, LIP_Z - 0.04], dir: [0, 0, 1], axis: "z", texture: trefoil, name: "trefoil",
    });
    // little colonettes between arches
    if (i < n - 1) {
      const cx = x + 0.114;
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.15, 6), STONE_LIGHT, { at: [cx, 0.07, LIP_Z - 0.03], name: "colonette" });
      b.part(new THREE.BoxGeometry(0.035, 0.015, 0.035), STONE_LIGHT, { at: [cx, 0.148, LIP_Z - 0.03], name: "capital" });
    }
  }

  // Base moulding at bottom
  b.part(new THREE.BoxGeometry(1.44, 0.025, 0.05), STONE_DARK, { at: [0, 0.0125, LIP_Z - 0.06], name: "base.mould" });

  // Corbels at each end
  for (const s of [1, -1]) {
    const x = s * 0.68;
    b.part(new THREE.BoxGeometry(0.12, 0.06, 0.12), STONE_LIGHT, { at: [x, 0.17, LIP_Z + 0.04], name: "corbel.top" });
    b.part(new THREE.CylinderGeometry(0.06, 0.03, 0.09, 6), STONE, { at: [x, 0.105, LIP_Z + 0.04], name: "corbel.cone" });
    b.part(new THREE.ConeGeometry(0.03, 0.06, 5), STONE_DARK, {
      at: [x, 0.03, LIP_Z + 0.04], rotation: [180, 0, 0], name: "corbel.tip",
    });
    b.part(new THREE.SphereGeometry(0.02, 5, 4), STONE_LIGHT, { at: [x, 0.115, LIP_Z + 0.105], name: "corbel.boss" });
    // weathering chip
    b.part(new THREE.BoxGeometry(0.03, 0.02, 0.03), SHADOW, { at: [x - s * 0.04, 0.2, LIP_Z + 0.07], name: "chip" });
  }

  // Moss drip under the lip
  for (let i = 0; i < 5; i++) {
    const x = -0.55 + R() * 1.1;
    b.part(new THREE.SphereGeometry(0.02 + R() * 0.012, 5, 4), MOSS, {
      at: [x, 0.2, LIP_Z + 0.01], scale: [1.4, 0.7, 0.8], name: "mossDrip",
    });
  }
}

function mergeGeos(geos: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  let count = 0;
  let icount = 0;
  for (const g of geos) {
    count += g.getAttribute("position").count;
    icount += g.getIndex()!.count;
  }
  const pos = new Float32Array(count * 3);
  const nor = new Float32Array(count * 3);
  const uv = new Float32Array(count * 2);
  const idx = new Uint32Array(icount);
  let vo = 0;
  let io = 0;
  for (const g of geos) {
    const p = g.getAttribute("position");
    pos.set(p.array as Float32Array, vo * 3);
    nor.set(g.getAttribute("normal").array as Float32Array, vo * 3);
    uv.set(g.getAttribute("uv").array as Float32Array, vo * 2);
    const ix = g.getIndex()!;
    for (let i = 0; i < ix.count; i++) idx[io + i] = ix.getX(i) + vo;
    vo += p.count;
    io += ix.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  out.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder, rng, frame } from "agentic-3js-builder";

export function addMossAndCracks(b: Builder) {
  const r = rng(25);
  const MOSS_DARK = "#44592a";
  const MOSS_LIGHT = "#86a24e";
  const CRACK = "#3a3835";

  // Moss tuft: cluster of small faceted blobs
  const tuft = (x: number, y: number, z: number, s: number, bone?: string) => {
    const n = 3 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const rad = s * (0.5 + r() * 0.6);
      const col = i % 3 === 0 ? MOSS_LIGHT : i % 3 === 1 ? MOSS : MOSS_DARK;
      const g = new THREE.IcosahedronGeometry(rad, 0);
      b.part(g, col, {
        at: [x + (r() - 0.5) * s * 1.6, y + rad * 0.3, z + (r() - 0.5) * s * 1.6],
        scale: [1, 0.55, 1],
        rotation: [r() * 90, r() * 90, r() * 90],
        ...(bone ? { bone } : {}),
      });
    }
  };

  // Ledge top moss tufts, concentrated near the request point and edges
  const spots: [number, number, number][] = [
    [0.4, 0.255, 0.3], [0.55, 0.255, 0.12], [0.25, 0.255, 0.5], [0.62, 0.255, 0.45],
    [-0.6, 0.255, 0.45], [-0.35, 0.255, 0.6], [0.0, 0.255, 0.62], [0.3, 0.255, -0.5],
    [-0.62, 0.255, -0.4], [0.65, 0.255, -0.6], [-0.1, 0.255, -0.7], [0.1, 0.255, 0.58],
  ];
  for (const [x, y, z] of spots) tuft(x, y, z, 0.04 + r() * 0.035);

  // Moss strip along the front lip
  for (let i = 0; i < 9; i++) {
    const x = -0.65 + i * 0.16 + (r() - 0.5) * 0.05;
    b.part(new THREE.BoxGeometry(0.1 + r() * 0.06, 0.03, 0.03), i % 2 ? MOSS : MOSS_DARK, {
      at: [x, 0.245, 0.655],
      rotation: [0, (r() - 0.5) * 20, 0],
    });
  }

  // Moss hanging down the ledge face
  for (let i = 0; i < 6; i++) {
    const x = -0.6 + i * 0.24 + r() * 0.08;
    const h = 0.05 + r() * 0.09;
    b.part(new THREE.ConeGeometry(0.025, h, 4), MOSS_DARK, {
      at: [x, 0.19 - h / 2, 0.67], rotation: [180, 0, 0],
    });
  }

  // Moss in creases of the gargoyle
  tuft(0, 0.84, 0.2, 0.03, "chest");
  tuft(0.22, 0.86, 0.0, 0.028, "chest");
  tuft(-0.22, 0.86, 0.0, 0.028, "chest");
  tuft(0.3, 0.52, -0.3, 0.035, "hips");
  tuft(-0.3, 0.52, -0.3, 0.035, "hips");
  tuft(0, 1.17, 0.3, 0.025, "head");
  tuft(0.3, 0.3, 0.52, 0.025, "handL");
  tuft(-0.3, 0.3, 0.52, 0.025, "handR");

  // Hairline cracks on the ledge top and face
  const crack = (pts: [number, number, number][], w: number) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [a, c] = [pts[i], pts[i + 1]];
      b.rod(a, c, w, CRACK, { bone: undefined, caps: "flat" });
    }
  };
  crack([[0.55, 0.253, 0.62], [0.5, 0.253, 0.45], [0.58, 0.253, 0.3], [0.5, 0.253, 0.15]], 0.005);
  crack([[0.5, 0.253, 0.3], [0.38, 0.253, 0.26], [0.3, 0.253, 0.12]], 0.004);
  crack([[-0.4, 0.253, 0.62], [-0.45, 0.253, 0.4], [-0.38, 0.253, 0.25]], 0.005);
  crack([[0.3, 0.12, 0.752], [0.33, 0.07, 0.752], [0.28, 0.03, 0.752]], 0.005);
  crack([[-0.5, 0.18, 0.752], [-0.46, 0.12, 0.752], [-0.52, 0.06, 0.752]], 0.005);

  // Chipped corners: dark wedges at the front corners
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.07, 0.1), STONE_DARK, {
      at: [s * 0.74, 0.215, 0.66], rotation: [0, s * 35, 15 * s],
    });
    b.part(new THREE.TetrahedronGeometry(0.04), STONE_LIGHT, {
      at: [s * 0.78, 0.04, 0.68], rotation: [r() * 90, r() * 90, 0],
    });
  }
  // Fallen chips on the ledge
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.TetrahedronGeometry(0.015 + r() * 0.012), STONE_LIGHT, {
      at: [0.15 + r() * 0.5, 0.258, 0.1 + r() * 0.5], rotation: [r() * 90, r() * 90, r() * 90],
    });
  }
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder, svg, rng } from "agentic-3js-builder";

export function addTailTip(b: Builder) {
  const R = rng(26);
  const RUNE_GLOW = "#ffd27a";
  const tail3 = b.surface(b.root);

  // ---- Tail: spade tip with central ridge ----
  const tipAt = new THREE.Vector3(0.42, 0.3, -0.85);
  const spade = b.extrude(
    [
      [0, 0],
      [0.07, 0.04],
      [0.1, 0.1],
      [0.06, 0.17],
      [0, 0.22, "sharp"],
      [-0.06, 0.17],
      [-0.1, 0.1],
      [-0.07, 0.04],
    ],
    {
      at: [0.44, 0.31, -0.86],
      x: [1, 0, 0],
      y: [0.5, 0, 0.85],
      thickness: [0.03, 0.012],
      bevel: 0.006,
      smoothing: 1,
      color: STONE_DARK,
      bone: "tail3",
      name: "s26spade",
    },
  );
  void spade;
  // central ridge
  b.rod([0.435, 0.325, -0.85], [0.5, 0.325, -0.68], [0.014, 0.005], STONE_LIGHT, { bone: "tail3", name: "s26ridge" });
  // rim studs
  for (let i = 0; i < 3; i++) {
    b.part(new THREE.SphereGeometry(0.012, 5, 4), STONE_LIGHT, {
      at: [0.4 + i * 0.015, 0.325, -0.9 + i * 0.04],
      bone: "tail3",
    });
  }

  // vertebra spines along the tail
  const pts: [number, number, number][] = [
    [0, 0.585, -0.45],
    [0, 0.5, -0.6],
    [0, 0.44, -0.72],
    [0.09, 0.4, -0.86],
    [0.2, 0.38, -0.95],
    [0.32, 0.37, -0.93],
  ];
  pts.forEach((p, i) => {
    const bone = i < 2 ? "tail1" : i < 4 ? "tail2" : "tail3";
    const s = 0.06 - i * 0.006;
    b.part(new THREE.ConeGeometry(0.03 - i * 0.002, s + 0.03, 5), i % 2 ? STONE_LIGHT : STONE_DARK, {
      at: p,
      bone,
      dir: [0, 1, 0.1],
    });
    b.part(new THREE.SphereGeometry(0.035 - i * 0.003, 6, 4), STONE_DARK, { at: [p[0], p[1] - 0.04, p[2]], bone });
  });

  // ---- Eye sockets with rune rings ----
  const rune = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="44" fill="none" stroke="#fff" stroke-width="7"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="#fff" stroke-width="4"/>
      ${Array.from({ length: 8 }, (_, k) => {
        const a = (k * Math.PI) / 4;
        const x1 = 50 + Math.cos(a) * 33, y1 = 50 + Math.sin(a) * 33;
        const x2 = 50 + Math.cos(a) * 41, y2 = 50 + Math.sin(a) * 41;
        return `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#fff" stroke-width="6"/>`;
      }).join("")}
    </svg>`,
    { size: 128 },
  );

  for (const s of [1, -1]) {
    const ex = s * 0.09;
    // socket rim: dark ring
    b.part(new THREE.TorusGeometry(0.047, 0.014, 5, 8), STONE_DARK, {
      at: [ex, 1.07, 0.545],
      dir: [0, 0, 1],
      axis: "z",
      bone: "head",
      name: "s26rim",
    });
    // dark recess behind the eye
    b.part(new THREE.CylinderGeometry(0.043, 0.04, 0.012, 8), HORN, {
      at: [ex, 1.07, 0.538],
      dir: [0, 0, 1],
      bone: "head",
    });
    // rune ring decal
    glow(
      b.part(new THREE.PlaneGeometry(0.1, 0.1), RUNE_GLOW, {
        at: [ex, 1.07, 0.5605],
        dir: [0, 0, 1],
        axis: "z",
        bone: "head",
        texture: rune,
        name: "s26rune",
      }),
      1.2,
    );
    // lower lid bag and upper lid wedge
    b.part(new THREE.BoxGeometry(0.1, 0.02, 0.035), STONE_LIGHT, {
      at: [ex, 1.025, 0.55],
      rotation: [-15, 0, s * 6],
      bone: "head",
    });
    b.part(new THREE.BoxGeometry(0.11, 0.025, 0.04), STONE_DARK, {
      at: [ex, 1.115, 0.55],
      rotation: [15, 0, -s * 10],
      bone: "head",
    });
    // crow's-foot chisel marks
    for (let k = 0; k < 2; k++) {
      b.rod([s * 0.14, 1.06 + k * 0.025, 0.5], [s * 0.18, 1.045 + k * 0.05, 0.47], 0.004, STONE_DARK, { bone: "head" });
    }
  }
  void tail3;
  void R;
}
```