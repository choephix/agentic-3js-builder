```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  rng,
  paint,
  noise,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A crouching gothic stone gargoyle perched on a carved cathedral ledge, with folded wings, horns, talons, and a snarling face.",
};

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  const STONE = paint((p, n) => {
    const grain = noise(p, 0.16, 17);
    const pits = noise(p, 0.045, 41);
    const base = 0.27 + grain * 0.12 - pits * 0.055;
    const light = 0.045 * Math.max(0, n.y) + 0.025 * Math.max(0, n.z);
    return [
      Math.min(0.62, base + light + 0.035),
      Math.min(0.62, base + light + 0.038),
      Math.min(0.66, base + light + 0.045),
    ];
  });
  const DARK_STONE = "#24262d";
  const EDGE_STONE = "#73747a";
  const EYE = svg(
    `<svg viewBox="0 0 100 70">
      <path d="M5 38 Q28 4 50 12 Q74 4 95 38 Q72 65 50 58 Q25 65 5 38Z" fill="#17131d" stroke="#08070c" stroke-width="5"/>
      <ellipse cx="52" cy="36" rx="17" ry="23" fill="#a33c36"/>
      <ellipse cx="52" cy="37" rx="7" ry="18" fill="#120e16"/>
      <circle cx="57" cy="25" r="5" fill="#f8d9b1"/>
      <path d="M14 18 Q34 1 54 9" stroke="#0b0a10" stroke-width="7" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  // Root skeleton: heavy spine, crouched haunches, neck, head, jaw.
  const pelvis = b.joint("pelvis", { at: [0, 1.03, -0.08], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.03, -0.08],
      [0, 1.18, 0.02],
      [0, 1.38, 0.08],
      [0, 1.56, 0.16],
    ]),
    { parent: pelvis, names: ["spine1", "spine2", "shoulder"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.56, 0.16],
      [0, 1.69, 0.23],
      [0, 1.82, 0.31],
    ]),
    { parent: spine.tip, names: ["neck1", "neck2", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip, at: [0, 1.82, 0.31], dir: [0, -0.08, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.70, 0.43], dir: [0, -0.22, 0.98], role: "jaw" });

  const body = b.sweep(
    spine,
    (t) => 0.27 - t * 0.075,
    { color: STONE, sides: 8, section: "box", caps: "round", name: "carved torso" },
  );
  b.sweep(neck, [0.19, 0.14], { color: STONE, sides: 8, name: "thick neck" });

  // Rib plates and shoulder bosses.
  for (let i = 0; i < 5; i++) {
    const p = spine.at(0.18 + i * 0.15);
    b.part(new THREE.SphereGeometry(0.22 - i * 0.018, 8, 5), STONE, {
      at: p.at,
      bone: p.bone,
      scale: [1.1, 0.42, 0.8],
      name: `ribBoss${i}`,
    });
  }
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.19, 8, 5), EDGE_STONE, {
      at: [s * 0.23, 1.51, 0.19],
      bone: spine.tip,
      scale: [1, 0.72, 0.82],
      name: `shoulder${s}`,
    });
  }

  // Crouched hind legs with massive haunches, shins, and planted feet.
  for (const s of [-1, 1]) {
    const hip = [s * 0.22, 1.16, -0.08] as [number, number, number];
    const knee = [s * 0.40, 0.72, 0.22] as [number, number, number];
    const ankle = [s * 0.27, 0.28, -0.02] as [number, number, number];
    const foot = [s * 0.30, 0.115, 0.20] as [number, number, number];
    const leg = b.chain(`leg${s > 0 ? "L" : "R"}`, [hip, knee, ankle, foot], {
      parent: pelvis,
      names: [`hip${s > 0 ? "L" : "R"}`, `knee${s > 0 ? "L" : "R"}`, `ankle${s > 0 ? "L" : "R"}`],
      role: "leg",
      contact: foot,
    });
    b.sweep(leg, (t) => (t < 0.34 ? 0.16 : t < 0.7 ? 0.105 : 0.075), {
      color: STONE,
      section: "box",
      sides: 7,
      name: `hind leg ${s}`,
    });
    b.part(new THREE.SphereGeometry(0.19, 8, 5), STONE, {
      at: hip,
      bone: leg.joints[0],
      scale: [1.0, 1.1, 0.9],
      name: `haunch ${s}`,
    });
    b.part(new THREE.BoxGeometry(0.22, 0.12, 0.30), DARK_STONE, {
      at: foot,
      bone: leg.tip,
      name: `stone foot ${s}`,
    });
    for (let i = -1; i <= 1; i++) {
      const toeBase = [s * (0.30 + i * 0.075), 0.13, 0.30] as [number, number, number];
      b.spike(toeBase, [0, -0.02, 1], 0.18, 0.025, { color: EDGE_STONE, bone: leg.tip, name: `talon ${s} ${i}` });
    }
  }

  // Forearms reaching forward, with clawed hands gripping the ledge.
  for (const s of [-1, 1]) {
    const arm = b.chain(
      `arm${s > 0 ? "L" : "R"}`,
      [
        [s * 0.23, 1.49, 0.22],
        [s * 0.38, 1.13, 0.48],
        [s * 0.34, 0.70, 0.62],
      ],
      {
        parent: spine.tip,
        names: [`shoulderArm${s}`, `elbow${s > 0 ? "L" : "R"}`, `wrist${s > 0 ? "L" : "R"}`],
        role: "arm",
      },
    );
    b.sweep(arm, [0.105, 0.055], { color: STONE, sides: 7, name: `forearm ${s}` });
    b.part(new THREE.SphereGeometry(0.105, 7, 5), EDGE_STONE, {
      at: arm.tip.at,
      bone: arm.tip,
      scale: [1.15, 0.7, 1.25],
      name: `knuckle ${s}`,
    });
    for (let i = -1; i <= 1; i++) {
      const p = [s * (0.34 + i * 0.06), 0.66, 0.72] as [number, number, number];
      b.spike(p, [0, -0.15, 1], 0.16, 0.018, { color: EDGE_STONE, bone: arm.tip, name: `finger ${s} ${i}` });
    }
  }

  // Face: brow mass, muzzle, separate upper/lower jaws, nose and fangs.
  b.part(new THREE.SphereGeometry(0.29, 12, 8), STONE, {
    bone: head,
    at: [0, 1.83, 0.34],
    scale: [1.05, 1.0, 0.92],
    name: "gargoyle skull",
  });
  b.part(new THREE.BoxGeometry(0.34, 0.20, 0.22), STONE, {
    bone: head,
    at: [0, 1.73, 0.56],
    name: "muzzle",
  });
  b.part(new THREE.BoxGeometry(0.30, 0.07, 0.18), DARK_STONE, {
    bone: jaw,
    at: [0, 1.65, 0.59],
    name: "open lower jaw",
  });
  b.part(new THREE.SphereGeometry(0.075, 7, 5), DARK_STONE, {
    bone: head,
    at: [0, 1.84, 0.64],
    scale: [1.6, 0.8, 0.7],
    name: "nose",
  });
  for (const s of [-1, 1]) {
    b.decal(head, EYE, {
      at: [s * 0.135, 1.87, 0.555],
      dir: [0, 0.1, 1],
      size: [0.105, 0.11],
      mirror: s > 0,
      name: `glowing eye ${s}`,
    });
    b.spike([s * 0.105, 1.70, 0.62], [0, -1, 0.08], 0.13, 0.018, { color: EDGE_STONE, bone: jaw, name: `fang ${s}` });
    b.spike([s * 0.18, 1.77, 0.54], [s * 0.15, 0.18, 0.96], 0.18, 0.035, { color: STONE, bone: head, name: `brow horn ${s}` });
  }

  // Crown horns.
  for (const s of [-1, 1]) {
    const hornPath = catmull([
      [s * 0.13, 2.00, 0.30],
      [s * 0.22, 2.19, 0.20],
      [s * 0.30, 2.32, 0.03],
      [s * 0.27, 2.39, -0.10],
    ]);
    b.sweep(hornPath, [0.075, 0.008], {
      bone: head,
      color: EDGE_STONE,
      caps: { start: "round", end: "point" },
      sides: 7,
      name: `curved horn ${s}`,
    });
  }

  // Great wing skeletons and membranes, raised in a readable resting display.
  for (const s of [-1, 1]) {
    const wing = b.chain(
      `wing${s > 0 ? "L" : "R"}`,
      [
        [s * 0.18, 1.48, 0.02],
        [s * 0.58, 1.78, -0.03],
        [s * 0.98, 2.06, -0.08],
        [s * 1.23, 2.28, -0.02],
      ],
      {
        parent: spine.tip,
        names: [`wingRoot${s}`, `wingMid${s}`, `wingTip${s}`],
        role: "wing",
      },
    );
    b.sweep(wing, [0.10, 0.035], { color: STONE, sides: 7, name: `wing finger ${s}` });
    const lower = [
      [s * 0.18, 1.48, 0.02],
      [s * 0.45, 1.34, -0.18],
      [s * 0.76, 1.42, -0.30],
      [s * 1.02, 1.60, -0.24],
    ];
    b.membrane(wing, lower, {
      color: paint((p, n) => (n.y > 0.25 ? [0.39, 0.40, 0.44] : [0.20, 0.21, 0.25])),
      thickness: 0.018,
      rows: 5,
      cols: 8,
      scallop: 0.12,
      name: `leathery wing membrane ${s}`,
    });
    for (let i = 0; i < 4; i++) {
      const p = wing.at(i / 3).at;
      b.spike(p, [s * 0.34, 0.22, -0.12], 0.18, 0.025, { color: EDGE_STONE, bone: wing.joints[Math.min(i, 2)], name: `wing spur ${s} ${i}` });
    }
  }

  // Segmented tail curling behind and down.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.05, -0.26],
      [0, 0.82, -0.48],
      [sway(0.22), 0.56, -0.72],
      [sway(0.40), 0.38, -0.91],
      [sway(0.28), 0.25, -1.10],
    ]),
    { parent: pelvis, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );
  b.sweep(tail, (t) => 0.13 * (1 - t) + 0.018, {
    color: STONE,
    sides: 7,
    caps: { start: "round", end: "point" },
    name: "curling tail",
  });
  for (let i = 0; i < 5; i++) {
    const p = tail.at(i / 5);
    b.spike(p, [0, 0.7, -0.25], 0.10, 0.022, { color: EDGE_STONE, bone: p.bone, name: `tail ridge ${i}` });
  }

  // Gothic ledge: chunky stone shelf with bevel-like lower corbels.
  b.part(new THREE.BoxGeometry(2.25, 0.22, 1.05), DARK_STONE, {
    at: [0, 0.06, 0.13],
    name: "cathedral ledge",
  });
  b.part(new THREE.BoxGeometry(1.95, 0.32, 0.22), STONE, {
    at: [0, 0.28, 0.52],
    name: "ledge lip",
  });
  for (const s of [-1, 1]) {
    b.part(new THREE.ConeGeometry(0.22, 0.48, 4), DARK_STONE, {
      at: [s * 0.72, 0.10, -0.30],
      rotation: [0, s * 45, 0],
      name: `gothic corbel ${s}`,
    });
    b.part(new THREE.BoxGeometry(0.16, 0.36, 0.32), EDGE_STONE, {
      at: [s * 0.42, 0.22, -0.32],
      name: `ledge carving ${s}`,
    });
  }

  // Small stone chips and shoulder studs reinforce carved detail.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.ConeGeometry(0.025, 0.07, 5), EDGE_STONE, {
        at: [s * (0.25 + i * 0.055), 1.58 + i * 0.018, 0.32],
        dir: [s * 0.25, 0.4, 0.9],
        name: `neck scale ${s} ${i}`,
      });
    }
  }

  return b.root;
}

function sway(t: number) {
  return Math.sin(t * Math.PI * 2.2) * 0.11;
}
```