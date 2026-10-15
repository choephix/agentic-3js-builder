import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { bezier, catmull } from "../../../../src/path";
import { mottle, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A dragonbone scythe on a rune plinth: vertebra shaft, gold collar, snarling dragon-skull socket, serrated bone blade with a glowing soul-edge and caged soul wisps.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const BONE = "#efe6cc";
const BONE_D = "#bfae8a";
const BONE_L = "#fff8e4";
const GOLD = "#f0b92e";
const GOLD_D = "#a9741a";
const TEAL = "#27f0d4";
const TEAL_L = "#b4fff2";
const TEAL_D = "#0e8a9a";
const PURPLE = "#46207a";
const STONE = "#2b2545";
const WINE = "#7a2a4a";
const WINE_D = "#4d1a33";

const RUNE = svg(
  `<svg viewBox="0 0 96 24">
    <g stroke="#27f0d4" stroke-width="2.6" stroke-linecap="round" fill="none">
      <path d="M6 3 L6 21 M6 6 L16 12 L6 18"/>
      <path d="M30 3 L22 12 L30 21 M22 12 L36 12"/>
      <path d="M48 3 L56 3 L48 21 L58 21 M50 12 L58 12"/>
      <path d="M70 21 L70 3 L80 3 M70 12 L78 12 M84 3 L84 21"/>
    </g>
  </svg>`,
  { size: 384 },
);

export default function build() {
  const b = createBuilder({ name: "soulScythe" });
  const root = b.joint("root", { at: [0, 0, 0] });

  // ---- plinth
  b.lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.34, 0.04],
      [0.3, 0.07],
      [0.3, 0.1],
      [0.2, 0.14],
      [0, 0.14],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: cel(mottle(STONE, "#3d3560", { size: 0.1 })), bone: root },
  );
  b.lathe(
    [
      [0.335, 0],
      [0.345, 0],
      [0.345, 0.035],
      [0.335, 0.035],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: GOLD, bone: root },
  );
  glow(
    b.part(new THREE.TorusGeometry(0.25, 0.008, 4, 24), TEAL, {
      at: [0, 0.123, 0],
      rotation: [90, 0, 0],
      bone: root,
    }),
  );
  for (let i = 0; i < 8; i++) {
    const a = ((i * 45 + 22.5) * Math.PI) / 180;
    b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLD, {
      at: [Math.sin(a) * 0.305, 0.095, Math.cos(a) * 0.305],
      bone: root,
    });
    glow(
      b.part(new THREE.BoxGeometry(0.03, 0.05, 0.01), TEAL_D, {
        at: [Math.sin(a + 0.39) * 0.32, 0.03, Math.cos(a + 0.39) * 0.32],
        rotation: [0, (a + 0.39) * (180 / Math.PI), 0],
        bone: root,
      }),
    );
  }

  // ---- shaft
  b.sweep(
    [
      [0, 0.1, 0],
      [0, 1.9, 0],
    ],
    [0.034, 0.027, 0.027, 0.03],
    { color: cel(mottle(BONE, BONE_D, { size: 0.12 })), caps: { start: "flat", end: "flat" }, bone: root },
  );
  // gold base sleeve
  b.part(new THREE.CylinderGeometry(0.052, 0.07, 0.07, 10), GOLD, { at: [0, 0.17, 0], bone: root });
  b.part(new THREE.CylinderGeometry(0.044, 0.046, 0.14, 10), GOLD_D, { at: [0, 0.26, 0], bone: root });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 10), GOLD, { at: [0, 0.33, 0], bone: root });
  // vertebra knuckles and spines
  for (let i = 0; i < 14; i++) {
    const y = 0.42 + i * 0.09;
    if (y > 0.84 && y < 1.28) continue;
    if (y > 1.7) continue;
    b.part(new THREE.SphereGeometry(0.05, 8, 5), BONE_D, { at: [0, y, 0], scale: [1, 0.42, 1], bone: root });
    for (const s of [1, -1]) {
      b.spike([0, y, s * 0.04], [0, 0.4, s], 0.07, 0.013, { color: BONE, bone: root });
    }
    b.spike([-0.04, y, 0], [-1, 0.4, 0], 0.05, 0.011, { color: BONE_D, bone: root });
  }
  // leather grip
  b.sweep(
    [
      [0, 0.86, 0],
      [0, 1.26, 0],
    ],
    0.04,
    { color: cel(stripes(WINE, WINE_D, { size: 0.035, axis: "y", width: 0.5, wobble: 0.1 })), caps: "flat", bone: root },
  );
  for (const y of [0.85, 0.96, 1.07, 1.18, 1.27]) {
    b.part(new THREE.CylinderGeometry(0.046, 0.046, y === 0.85 || y === 1.27 ? 0.028 : 0.01, 10), GOLD, {
      at: [0, y, 0],
      bone: root,
    });
  }
  for (const y of [1.5, 1.62]) b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 10), GOLD, { at: [0, y, 0], bone: root });

  // ---- collar and skull
  b.lathe(
    [
      [0, 1.78],
      [0.06, 1.78],
      [0.085, 1.83],
      [0.075, 1.9],
      [0.05, 1.935],
      [0, 1.935],
    ],
    { at: [0, 0, 0], segments: 10, color: GOLD, bone: root },
  );
  b.part(new THREE.TorusGeometry(0.08, 0.008, 4, 12), GOLD_D, { at: [0, 1.84, 0], rotation: [90, 0, 0], bone: root });
  glow(b.part(new THREE.SphereGeometry(0.02, 6, 4), TEAL, { at: [0, 1.86, 0.075], bone: root }));

  b.part(new THREE.SphereGeometry(0.07, 9, 6), BONE, { at: [0, 1.995, 0.02], scale: [0.95, 0.8, 1.1], bone: root });
  b.frustumBox([0, 1.985, 0.06], [0, 1.96, 0.2], [0.095, 0.07], [0.055, 0.04], { color: BONE, bone: root });
  b.frustumBox([0, 1.925, 0.06], [0, 1.915, 0.19], [0.075, 0.025], [0.045, 0.02], { color: BONE_D, bone: root });
  for (const s of [1, -1]) {
    for (let k = 0; k < 4; k++) {
      const z = 0.1 + k * 0.032;
      b.spike([s * 0.03, 1.955, z], [0, -1, 0], 0.03, 0.007, { color: BONE_L, bone: root });
      b.spike([s * 0.024, 1.93, z + 0.012], [0, 1, 0], 0.024, 0.006, { color: BONE_L, bone: root });
    }
    b.part(new THREE.SphereGeometry(0.022, 6, 4), INK, { at: [s * 0.046, 2.0, 0.085], scale: [0.8, 1, 1], bone: root });
    glow(b.part(new THREE.SphereGeometry(0.012, 6, 4), TEAL_L, { at: [s * 0.05, 2.0, 0.098], bone: root }));
    b.part(new THREE.SphereGeometry(0.03, 6, 4), BONE_D, {
      at: [s * 0.05, 2.03, 0.09],
      scale: [1.1, 0.4, 1],
      rotation: [0, 0, s * -20],
      bone: root,
    });
    b.sweep(bezier([s * 0.05, 2.03, -0.02], [s * 0.13, 2.09, -0.1], [s * 0.17, 2.0, -0.22], [s * 0.1, 1.94, -0.3]), [0.022, 0.002], {
      color: BONE,
      caps: { start: "flat", end: "point" },
      bone: root,
    });
    b.part(new THREE.TorusGeometry(0.02, 0.005, 4, 8), GOLD, {
      at: [s * 0.075, 2.045, -0.04],
      rotation: [70, 0, s * 30],
      bone: root,
    });
  }
  b.part(new THREE.SphereGeometry(0.012, 5, 4), INK, { at: [0.012, 1.99, 0.19], bone: root });
  b.part(new THREE.SphereGeometry(0.012, 5, 4), INK, { at: [-0.012, 1.99, 0.19], bone: root });

  // ---- blade
  const outer: Array<[number, number, number]> = [
    [0.05, 1.96, 0],
    [0.35, 2.12, 0],
    [0.8, 2.08, 0],
    [1.2, 1.82, 0],
  ];
  b.extrude(
    [
      [0, 1.8],
      [0, 1.96],
      [0.35, 2.12],
      [0.8, 2.08],
      [1.2, 1.82, "sharp"],
      [0.8, 1.93],
      [0.4, 1.97],
    ],
    {
      at: [0, 0, 0],
      x: [1, 0, 0],
      thickness: 0.022,
      bevel: 0.005,
      smoothing: 1,
      color: cel(mottle(BONE, BONE_D, { size: 0.14 })),
      bone: root,
    },
  );
  glow(
    b.extrude(
      [
        [0.02, 1.79],
        [0.4, 1.96],
        [0.8, 1.92],
        [1.22, 1.815, "sharp"],
        [0.8, 1.965],
        [0.4, 2.005],
        [0.02, 1.84],
      ],
      { at: [0, 0, 0], x: [1, 0, 0], thickness: 0.026, color: TEAL, bone: root },
    ),
  );
  // ridge ribs both faces
  for (const z of [0.014, -0.014]) {
    b.sweep(
      catmull([
        [0.1, 1.9, z],
        [0.4, 2.04, z],
        [0.8, 2.0, z],
        [1.1, 1.86, z],
      ]),
      [0.014, 0.003],
      { color: BONE_D, caps: { start: "flat", end: "point" }, bone: root },
    );
  }
  // runes
  glow(
    b.part(new THREE.PlaneGeometry(0.34, 0.085), "#ffffff", {
      at: [0.5, 2.0, 0.0125],
      dir: [0, 0, 1],
      axis: "z",
      texture: RUNE,
      rotation: undefined,
      bone: root,
    }),
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.34, 0.085), "#ffffff", {
      at: [0.5, 2.0, -0.0125],
      dir: [0, 0, -1],
      axis: "z",
      texture: RUNE,
      bone: root,
    }),
  );
  // serrated spine
  const spine = catmull(outer);
  for (let i = 0; i < 7; i++) {
    const t = 0.12 + i * 0.12;
    const p = spine.at(t);
    const tg = spine.tangentAt(t);
    const nrm = new THREE.Vector3(-tg.y, tg.x, 0).normalize();
    const dir = nrm.clone().addScaledVector(tg, 0.7);
    b.spike(p.clone().addScaledVector(nrm, -0.018), dir.toArray(), 0.075 - i * 0.004, 0.02, {
      color: BONE,
      bone: root,
    });
  }
  // blade clamp
  b.part(new THREE.BoxGeometry(0.035, 0.22, 0.05), GOLD, { at: [0.12, 1.93, 0], bone: root });
  b.part(new THREE.BoxGeometry(0.03, 0.2, 0.052), GOLD_D, { at: [0.22, 1.98, 0], bone: root });
  for (const z of [0.027, -0.027]) for (const y of [1.87, 1.99]) {
    b.part(new THREE.SphereGeometry(0.011, 5, 4), GOLD_D, { at: [0.12, y, z], bone: root });
  }

  // ---- soul wisps
  const wisps: Array<[number, number, number, number]> = [
    [0.35, 1.68, 0.02, 0.04],
    [0.62, 1.6, -0.03, 0.045],
    [0.9, 1.62, 0.03, 0.035],
  ];
  for (const [x, y, z, r] of wisps) {
    glow(b.part(new THREE.SphereGeometry(r, 7, 5), TEAL_L, { at: [x, y, z], bone: root }));
    glow(b.part(new THREE.SphereGeometry(r * 1.35, 7, 5), TEAL_D, { at: [x, y, z], scale: [1, 1, 0.6], bone: root }));
    glow(b.spike([x, y, z], [-0.3, -1, 0], 0.16, r * 0.8, { color: TEAL, bone: root }));
    b.part(new THREE.SphereGeometry(r * 0.28, 5, 4), INK, { at: [x - r * 0.3, y + r * 0.1, z + r * 1.0], bone: root });
    b.part(new THREE.SphereGeometry(r * 0.28, 5, 4), INK, { at: [x + r * 0.3, y + r * 0.1, z + r * 1.0], bone: root });
    glow(
      b.rod([x, y + r, z], [x * 0.9 + 0.05, 1.94 - (x - 0.35) * 0.1, 0], 0.004, { color: TEAL_D, bone: root }),
    );
  }

  // ---- ribbons and charms
  for (const [dz, sx] of [
    [0.03, -0.07],
    [-0.04, -0.09],
  ]) {
    b.sweep(
      catmull([
        [sx, 1.85, dz],
        [sx - 0.06, 1.7, dz + 0.03],
        [sx - 0.04, 1.5, dz - 0.02],
        [sx - 0.1, 1.3, dz + 0.03],
      ]),
      (t) => [0.02 + 0.025 * t, 0.004],
      { color: cel(PURPLE), caps: { start: "flat", end: "point" }, bone: root },
    );
  }
  b.part(new THREE.TorusGeometry(0.022, 0.005, 4, 8), GOLD, { at: [-0.17, 1.28, 0.03], bone: root });
  glow(b.part(new THREE.OctahedronGeometry(0.022), TEAL, { at: [-0.17, 1.24, 0.03], bone: root }));

  return b.root;
}
