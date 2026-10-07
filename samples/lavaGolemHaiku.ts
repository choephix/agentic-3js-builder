import * as THREE from "three";
import { glow } from "../kits/glow";
import { cel } from "../kits/toon";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { catmull } from "../src/path";
import { paint, scales } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Lava Golem",
  description:
    "A 2.9 m golem of hexagonal basalt columns, its seams and chest core running with molten light, gold filigree, tassels and a crown of basalt spikes.",
  style: "Genshin Impact",
  commit: "b816db2",
};

// Palette: cel-shaded periwinkle basalt, warm gold trims, molten glow.
const STONE = cel(scales(["#8fa2d0", "#7a8fc4", "#a3b3dc", "#8596c6"], "#2e2850", { size: 0.2, width: 0.035 }));
const DEEP = cel("#6f80b0");
const GOLD = cel("#ffd66b", "#c98a2e");
const TEETH = cel("#f6efdc", "#b9b3c8");
const BODY = paint((p, _n) => (p.y < 1.1 ? DEEP : STONE));
const MOLTEN = "#ff6a18";
const MOLTEN_HOT = "#ffc53d";

// Drawings: a glowing slit eye, a gold filigree halo, a flame and a tassel.
const EYE = svg(
  `<svg viewBox="0 0 60 36">
    <path d="M1 18 Q30 -5 59 18 Q30 41 1 18 Z" fill="#2a0d08"/>
    <path d="M4 18 Q30 1 56 18 Q30 35 4 18 Z" fill="#ff7b1c"/>
    <path d="M8 18 Q30 6 52 18 Q30 30 8 18 Z" fill="#ffd45a"/>
    <ellipse cx="30" cy="18" rx="3.4" ry="10.5" fill="#2a0d08"/>
    <ellipse cx="25" cy="13" rx="3.4" ry="2.2" fill="#fff8d6"/>
  </svg>`,
  { size: 256 },
);

const FILIGREE = svg(
  `<svg viewBox="0 0 100 100" fill="none" stroke="#ffd66b" stroke-width="3" stroke-linecap="round">
    <circle cx="50" cy="50" r="46" stroke="#e0a845" stroke-width="2.4"/>
    <circle cx="50" cy="50" r="31" stroke="#e0a845" stroke-width="1.6" stroke-dasharray="1 5"/>
    <g transform="rotate(0 50 50)"><path d="M50 50 C50 38 62 34 66 42 C70 50 60 56 57 48 C55 42 61 40 63 44"/><circle cx="50" cy="6" r="2.2" fill="#ffd66b" stroke="none"/></g>
    <g transform="rotate(90 50 50)"><path d="M50 50 C50 38 62 34 66 42 C70 50 60 56 57 48 C55 42 61 40 63 44"/><circle cx="50" cy="6" r="2.2" fill="#ffd66b" stroke="none"/></g>
    <g transform="rotate(180 50 50)"><path d="M50 50 C50 38 62 34 66 42 C70 50 60 56 57 48 C55 42 61 40 63 44"/><circle cx="50" cy="6" r="2.2" fill="#ffd66b" stroke="none"/></g>
    <g transform="rotate(270 50 50)"><path d="M50 50 C50 38 62 34 66 42 C70 50 60 56 57 48 C55 42 61 40 63 44"/><circle cx="50" cy="6" r="2.2" fill="#ffd66b" stroke="none"/></g>
  </svg>`,
  { size: 512 },
);

const FLAME = svg(
  `<svg viewBox="0 0 40 80">
    <path d="M20 2 C28 20 38 34 36 54 C34 70 27 78 20 78 C13 78 6 70 4 54 C2 40 10 32 13 20 C15 30 17 34 20 36 C22 24 16 12 20 2 Z" fill="#ff6a1a"/>
    <path d="M20 30 C26 44 30 54 28 64 C26 72 23 74 20 74 C16 74 13 70 12 62 C11 52 16 46 20 30 Z" fill="#ffd45a"/>
  </svg>`,
  { size: 256 },
);

const TASSEL = svg(
  `<svg viewBox="0 0 40 100">
    <path d="M11 60 L6 4 M16 60 L14 2 M20 60 L20 2 M24 60 L26 2 M29 60 L34 4" stroke="#c8323a" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <path d="M10 80 L30 80 L28 60 L12 60 Z" fill="#b8262e"/>
    <rect x="16" y="76" width="8" height="9" fill="#e0a845"/>
    <rect x="13" y="86" width="14" height="14" rx="3" fill="#ffd66b"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "lavaGolem" });

  // Skeleton: root hips, a three-joint spine, neck, head and jaw.
  const hips = b.joint("hips", { at: [0, 1.02, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 1.02, 0], [0, 1.46, 0], [0, 1.86, 0.02], [0, 2.08, 0]]), {
    parent: hips,
    names: ["waist", "chest", "upper"],
    role: "spine",
  });
  const neck = b.joint("neck", { parent: spine.joints[2], at: [0, 2.08, 0], aim: [0, 2.3, 0.02], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.22, 0.02], aim: [0, 2.5, 0.04], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.22, 0.1], aim: [0, 2.1, 0.22], role: "jaw" });

  // Torso: a hexagonal basalt column, flared at the shoulders.
  const torso = b.loft(
    [
      { at: [0, 0.94, 0], w: 0.66, h: 0.46 },
      { at: [0, 1.2, 0], w: 0.7, h: 0.5 },
      { at: [0, 1.55, 0], w: 0.9, h: 0.62 },
      { at: [0, 1.9, 0.02], w: 1.0, h: 0.66 },
      { at: [0, 2.08, 0], w: 0.86, h: 0.56 },
    ],
    { bone: spine, sides: 6, smooth: false, color: BODY },
  );
  const tSkin = b.surface(torso);

  // Molten seams between the basalt rows, a gold belt and a gold rim at the chest top.
  for (const y of [1.3, 1.62, 1.94]) glow(b.sweep(tSkin.loop([0, y, 0], { lift: 0.018 }), 0.014, { color: MOLTEN }), 1.6);
  b.sweep(tSkin.loop([0, 2.04, 0], { lift: 0.02 }), 0.02, { color: GOLD });
  const belt = tSkin.loop([0, 1.1, 0], { lift: 0.02 });
  b.sweep(belt, 0.024, { color: GOLD });
  glow(b.stick(new THREE.OctahedronGeometry(0.05), MOLTEN_HOT, tSkin.around([0, 1.1, 0]).at(0, 0)!, { embed: 0.3 }), 1.8);

  // Two molten cracks running down the chest flanks.
  for (const s of [1, -1])
    glow(
      b.sweep(
        tSkin.drape(
          catmull([
            [s * 0.3, 1.24, 0.3],
            [s * 0.34, 1.42, 0.32],
            [s * 0.26, 1.58, 0.3],
            [s * 0.36, 1.76, 0.28],
          ]),
          { lift: 0.012 },
        ),
        0.01,
        { color: MOLTEN },
      ),
      1.6,
    );

  // Hanging tassels from the belt.
  b.cards(
    [0.86, 0.92, 0.08, 0.14].map((t) => frame(belt.at(t), [0, 1, 0])),
    TASSEL,
    { size: [0.1, 0.26], lean: 180, flow: [0, 0, 1] },
  );

  // Chest core: a molten gem in a crown of gold prongs, with gold filigree around it.
  const coreHit = tSkin.around([0, 1.62, 0]).at(0, 0)!;
  glow(b.stick(new THREE.SphereGeometry(0.1, 12, 8).scale(1, 1.25, 0.55), MOLTEN_HOT, coreHit, { embed: 0.35 }), 2);
  b.ring(coreHit, { count: 12, radius: 0.13, tilt: 55 }, (item) => {
    b.stick(new THREE.ConeGeometry(0.022, 0.07, 6), GOLD, item, { embed: 0.25 });
  });
  b.decal(tSkin, FILIGREE, { at: [0, 1.62, 0.3], dir: [0, 0, 1], size: [0.52, 0.52] });

  // Basalt plates in rows between the seams.
  for (const y of [1.2, 1.46, 1.78])
    for (const az of [-150, -120, -90, -60, 60, 90, 120, 150])
      b.stick(new THREE.CylinderGeometry(0.075, 0.08, 0.05, 6), STONE, tSkin.around([0, y, 0]).at(az, 0)!, {
        embed: 0.3,
      });

  // Dorsal basalt spikes down the back.
  b.along(
    torso,
    4,
    (at) => {
      b.spike(at, at, 0.14, 0.04, { color: STONE, sides: 6 });
    },
    { from: 0.3, to: 0.75 },
  );

  // Head: a basalt block with a scowling brow, glowing slit eyes, a molten maw and a lower jaw.
  const skull = b.part(new THREE.BoxGeometry(0.44, 0.3, 0.4), BODY, { bone: head, at: [0, 2.37, 0] });
  b.extrude([[-0.2, 0.02], [0.2, 0.02], [0.2, 0.1], [0, 0.04], [-0.2, 0.1]], {
    at: [0, 2.4, 0.19],
    x: [1, 0, 0],
    thickness: 0.1,
    bevel: 0.01,
    color: DEEP,
    bone: head,
  });
  for (const s of [1, -1])
    glow(b.decal(skull, EYE, { at: [s * 0.11, 2.36, 0.2], dir: [0, 0, 1], size: [0.14, 0.084] }), 1.8);
  glow(b.part(new THREE.BoxGeometry(0.34, 0.05, 0.05), MOLTEN, { bone: head, at: [0, 2.225, 0.2] }), 1.8);
  b.part(new THREE.BoxGeometry(0.34, 0.1, 0.3), BODY, { bone: jaw, at: [0, 2.17, 0.16] });
  for (const x of [-0.12, -0.04, 0.04, 0.12])
    b.spike([x, 2.21, 0.27], [0, 1, 0], 0.06, 0.022, { bone: jaw, color: TEETH, sides: 5 });
  b.part(new THREE.CylinderGeometry(0.15, 0.17, 0.2, 6), DEEP, { bone: neck, at: [0, 2.16, 0] });

  // Gold crown band with five basalt spikes and flame tips.
  const crown: number[][] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    crown.push([0.25 * Math.sin(a), 2.49, 0.2 * Math.cos(a)]);
  }
  b.sweep(catmull(crown, { closed: true }), 0.022, { color: GOLD, bone: head });
  b.spike([0, 2.48, 0.14], [0, 1, 0.3], 0.3, 0.05, { bone: head, color: STONE, sides: 6 });
  b.spike([0.2, 2.47, 0.02], [0.5, 1, 0], 0.24, 0.046, { bone: head, color: STONE, sides: 6 });
  b.spike([-0.2, 2.47, 0.02], [-0.5, 1, 0], 0.24, 0.046, { bone: head, color: STONE, sides: 6 });
  b.spike([0, 2.48, -0.14], [0, 1, -0.4], 0.22, 0.045, { bone: head, color: STONE, sides: 6 });
  b.spike([0.13, 2.48, 0.12], [0.4, 1, 0.4], 0.16, 0.035, { bone: head, color: STONE, sides: 6 });
  b.spike([-0.13, 2.48, 0.12], [-0.4, 1, 0.4], 0.16, 0.035, { bone: head, color: STONE, sides: 6 });
  glow(
    b.cards(
      [frame([0, 2.75, 0.23], [0, 1, 0]), frame([0.31, 2.67, 0.02], [0, 1, 0]), frame([-0.31, 2.67, 0.02], [0, 1, 0])],
      FLAME,
      { size: [0.09, 0.16], lean: 0, flow: [0, 0, 1] },
    ),
    1.6,
  );

  // Lava splashes at the feet.
  for (const [x, z] of [
    [0.6, 0.5],
    [-0.62, 0.42],
    [0.12, 0.66],
  ])
    glow(b.part(new THREE.SphereGeometry(0.06, 8, 6).scale(1, 0.35, 1), MOLTEN, { bone: hips, at: [x, 0.02, z] }), 1.5);

  // Arms and legs: hexagonal basalt limbs with molten rings at each joint, plus gold and basalt trim.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    const arm = b.chain(
      `arm${S}`,
      catmull([
        [s * 0.6, 1.88, 0],
        [s * 0.8, 1.52, 0.04],
        [s * 0.9, 1.2, 0.12],
        [s * 0.94, 1.0, 0.26],
      ]),
      { parent: spine.joints[2], names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`], role: "arm" },
    );
    const armTube = b.sweep(arm, (t) => 0.2 - 0.06 * t, { sides: 6, smooth: false, color: STONE });
    const armSkin = b.surface(armTube);
    for (const j of [arm.joints[1], arm.joints[2]])
      glow(b.sweep(armSkin.loop(j, { lift: 0.014 }), 0.011, { color: MOLTEN }), 1.6);

    const hand = arm.joints[3];
    b.part(new THREE.BoxGeometry(0.26, 0.24, 0.26), STONE, { bone: hand, at: [s * 0.94, 0.98, 0.27] });
    b.part(new THREE.BoxGeometry(0.28, 0.04, 0.28), GOLD, { bone: hand, at: [s * 0.94, 1.09, 0.27] });
    for (const dx of [-0.08, 0, 0.08])
      b.spike([s * (0.94 + dx), 0.98, 0.4], [0, 0, 1], 0.06, 0.03, { bone: hand, color: DEEP, sides: 6 });

    // Shoulder pauldron: a hex dome with a gold rim, three basalt spikes and a flame.
    const shoulder = arm.joints[0];
    b.lathe(
      [
        [0, 0],
        [0.3, 0],
        [0.31, 0.03],
        [0.27, 0.13],
        [0.16, 0.22],
        [0, 0.25],
      ],
      { at: [s * 0.6, 1.88, 0], axis: [0, 1, 0], segments: 6, color: STONE, bone: shoulder },
    );
    const rim: number[][] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      rim.push([s * 0.6 + 0.31 * Math.cos(a), 1.9, 0.31 * Math.sin(a)]);
    }
    b.sweep(catmull(rim, { closed: true }), 0.018, { color: GOLD, bone: shoulder });
    b.spike([s * 0.6, 2.1, 0], [s * 0.25, 1, 0], 0.22, 0.045, { bone: shoulder, color: STONE, sides: 6 });
    b.spike([s * 0.6, 2.0, 0.2], [0, 0.5, 1], 0.16, 0.04, { bone: shoulder, color: STONE, sides: 6 });
    b.spike([s * 0.6, 2.0, -0.2], [0, 0.5, -1], 0.16, 0.04, { bone: shoulder, color: STONE, sides: 6 });
    glow(b.cards([frame([s * 0.66, 2.31, 0], [0, 1, 0])], FLAME, { size: [0.12, 0.22], lean: 0, flow: [0, 0, 1] }), 1.6);

    const leg = b.chain(
      `leg${S}`,
      catmull([
        [s * 0.26, 1.02, 0],
        [s * 0.28, 0.56, 0.04],
        [s * 0.28, 0.2, -0.02],
        [s * 0.28, 0.12, 0.22],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`], role: "leg" },
    );
    const legTube = b.sweep(leg, (t) => 0.23 - 0.12 * t, { sides: 6, smooth: false, color: STONE });
    const legSkin = b.surface(legTube);
    for (const j of [leg.joints[1], leg.joints[2]])
      glow(b.sweep(legSkin.loop(j, { lift: 0.016 }), 0.012, { color: MOLTEN }), 1.6);
    // Basalt plates on the thigh, in two rows above the knee.
    for (const y of [0.84, 0.72])
      for (const az of [-120, -60, 0, 60, 120, 180])
        b.stick(new THREE.CylinderGeometry(0.07, 0.075, 0.05, 6), STONE, legSkin.around([s * 0.28, y, 0.04]).at(az, 0)!, {
          embed: 0.3,
        });
    b.stick(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 6), STONE, legSkin.around([s * 0.28, 0.56, 0.04]).at(0, 0)!, {
      embed: 0.3,
    });
    const foot = leg.joints[3];
    b.part(new THREE.BoxGeometry(0.3, 0.18, 0.44), STONE, { bone: foot, at: [s * 0.28, 0.09, 0.12] });
    b.part(new THREE.BoxGeometry(0.3, 0.04, 0.06), GOLD, { bone: foot, at: [s * 0.28, 0.16, 0.33] });
  }

  return b.root;
}
