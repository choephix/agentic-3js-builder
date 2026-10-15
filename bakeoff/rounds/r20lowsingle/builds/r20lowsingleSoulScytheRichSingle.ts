import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { bezier, catmull } from "../../../../src/path";
import { paint, patches } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A towering dragonbone war scythe on a rune plinth: ivory blade with a glowing soul edge and spine spikes, a snarling dragon skull hub with swept horns, gold collar, bone-knuckle haft, a swaying soul charm and drifting teal soul flames.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const BONE = "#f4e8c6";
const BONE_DK = "#c7ae82";
const BONE_LT = "#fffbea";
const PURPLE = "#4a2c86";
const PURPLE_DK = "#26153f";
const GOLD = "#f6b92c";
const GOLD_DK = "#b9741a";
const TEAL = "#38f4e2";
const TEAL_DK = "#1a8f9c";
const LEATHER = "#7a2f4a";
const LEATHER_DK = "#4a1c34";

const SPINE: number[][] = [
  [0, 0.06],
  [0.2, 0.2],
  [0.5, 0.3],
  [0.85, 0.28],
  [1.15, 0.12],
  [1.38, -0.18],
];
const EDGE: number[][] = [
  [1.38, -0.18],
  [1.1, 0],
  [0.8, 0.08],
  [0.5, 0.08],
  [0.2, -0.04],
  [0.02, -0.06],
];

function spineY(x: number) {
  for (let i = 0; i < SPINE.length - 1; i++) {
    const a = SPINE[i];
    const c = SPINE[i + 1];
    if (x <= c[0]) return a[1] + ((c[1] - a[1]) * (x - a[0])) / (c[0] - a[0] || 1);
  }
  return SPINE[SPINE.length - 1][1];
}

export default function build() {
  const b = createBuilder({ name: "soulScythe" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const bone = { bone: base };

  // ---------- textures ----------
  let runeTicks = "";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    runeTicks += `<path d="M${50 + 34 * Math.cos(a)} ${50 + 34 * Math.sin(a)} L${50 + 44 * Math.cos(a)} ${50 + 44 * Math.sin(a)}" stroke="${TEAL}" stroke-width="3" stroke-linecap="round"/>`;
  }
  let star = "";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const c = ((i + 2) / 5) * Math.PI * 2 - Math.PI / 2;
    star += `<path d="M${50 + 26 * Math.cos(a)} ${50 + 26 * Math.sin(a)} L${50 + 26 * Math.cos(c)} ${50 + 26 * Math.sin(c)}" stroke="${TEAL}" stroke-width="2.6" stroke-linecap="round"/>`;
  }
  const CIRCLE = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="none" stroke="${TEAL}" stroke-width="3"/><circle cx="50" cy="50" r="31" fill="none" stroke="${TEAL}" stroke-width="2.6"/>${runeTicks}${star}<circle cx="50" cy="50" r="5" fill="${TEAL}"/></svg>`,
    { size: 512 },
  );
  const RUNES = svg(
    `<svg viewBox="0 0 100 30"><path d="M5 17 C20 8 40 8 65 12 S90 18 98 27" fill="none" stroke="${TEAL}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M18 11 l0 -6 M32 9 l0 -6 M46 9.5 l0 -6 M60 11.5 l0 -6 M74 14 l1 -5" stroke="${TEAL}" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="40" cy="17" r="2.6" fill="${TEAL}"/><circle cx="62" cy="19" r="2.2" fill="${TEAL}"/><circle cx="82" cy="23" r="2" fill="${TEAL}"/>
    <path d="M22 19 l5 3 l5 -3 M50 20 l4 3 l4 -3" fill="none" stroke="${TEAL}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    { size: 512 },
  );

  // ---------- plinth ----------
  b.lathe(
    [
      [0, 0],
      [0.5, 0],
      [0.5, 0.05],
      [0.44, 0.08],
      [0.44, 0.12],
      [0.36, 0.15],
      [0.3, 0.18],
      [0, 0.18],
    ],
    {
      at: [0, 0, 0],
      segments: 8,
      color: cel(patches(PURPLE_DK, [PURPLE, "#3a2266", "#5a3a9a"], { size: 0.12, gap: 0.08 })),
      name: "plinth",
      ...bone,
    },
  );
  b.lathe(
    [
      [0.47, 0.05],
      [0.5, 0.05],
      [0.5, 0.0],
      [0.47, 0.0],
    ],
    { at: [0, 0.0, 0], segments: 8, color: GOLD_DK, name: "plinthTrim", ...bone },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.56, 0.56), "#ffffff", {
      at: [0, 0.186, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: CIRCLE,
      name: "plinthRunes",
      ...bone,
    }),
  );
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    b.part(new THREE.SphereGeometry(0.022, 6, 4), GOLD, {
      at: [0.47 * Math.cos(a), 0.1, 0.47 * Math.sin(a)],
      scale: [1, 1.4, 1],
      ...bone,
    });
  }

  // ---------- haft ----------
  const shaftPaint = cel(
    paint((p) => {
      if (p.y > 0.7 && p.y < 1.15) {
        const k = Math.floor((p.y + Math.atan2(p.z, p.x) * 0.03) * 70);
        return k % 2 ? LEATHER : LEATHER_DK;
      }
      return (p.y / 0.09) % 1 < 0.14 ? BONE_DK : BONE;
    }),
  );
  b.sweep(
    [
      [0, 0.18, 0],
      [0, 1.76, 0],
    ],
    0.026,
    { color: shaftPaint, caps: "flat", name: "shaft", ...bone },
  );
  for (const y of [0.34, 0.5, 0.64, 1.24, 1.38, 1.52, 1.66]) {
    b.part(new THREE.SphereGeometry(0.042, 8, 5), BONE, { at: [0, y, 0], scale: [1, 0.5, 1], name: "knuckle", ...bone });
  }
  for (const y of [0.7, 0.93, 1.15]) {
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.03, 8), GOLD, { at: [0, y, 0], name: "goldBand", ...bone });
    b.part(new THREE.CylinderGeometry(0.039, 0.039, 0.008, 8), GOLD_DK, { at: [0, y + 0.018, 0], ...bone });
    b.part(new THREE.CylinderGeometry(0.039, 0.039, 0.008, 8), GOLD_DK, { at: [0, y - 0.018, 0], ...bone });
  }
  // ferrule and gripping claws
  b.lathe(
    [
      [0, 0],
      [0.055, 0],
      [0.05, 0.1],
      [0.035, 0.14],
      [0, 0.14],
    ],
    { at: [0, 0.18, 0], segments: 8, color: cel(GOLD), name: "ferrule", ...bone },
  );
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const c = Math.cos(a);
    const s = Math.sin(a);
    b.sweep(
      bezier(
        [0.15 * c, 0.18, 0.15 * s],
        [0.17 * c, 0.34, 0.17 * s],
        [0.08 * c, 0.46, 0.08 * s],
        [0.04 * c, 0.54, 0.04 * s],
      ),
      [0.026, 0],
      { color: BONE, caps: { start: "flat", end: "point" }, sides: 6, name: "baseClaw", ...bone },
    );
  }

  // ---------- hub: collar, gem, skull ----------
  b.lathe(
    [
      [0, 0],
      [0.065, 0],
      [0.052, 0.08],
      [0.04, 0.1],
      [0, 0.1],
    ],
    { at: [0, 1.74, 0], segments: 8, color: cel(GOLD), name: "collar", ...bone },
  );
  b.part(new THREE.TorusGeometry(0.05, 0.01, 4, 8), GOLD_DK, { at: [0, 1.745, 0], rotation: [90, 0, 0], ...bone });
  glow(b.part(new THREE.SphereGeometry(0.03, 8, 6), TEAL, { at: [0, 1.79, 0.055], name: "gem", ...bone }), 1.4);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    b.spike([0.045 * Math.cos(a), 1.72, 0.045 * Math.sin(a)], [0.2 * Math.cos(a), 1, 0.2 * Math.sin(a)], 0.14, 0.014, {
      color: GOLD_DK,
      sides: 5,
      ...bone,
    });
  }

  b.part(new THREE.SphereGeometry(1, 10, 8), cel(BONE), { at: [0, 1.9, 0], scale: [0.085, 0.075, 0.12], name: "cranium", ...bone });
  b.frustumBox([0, 1.89, 0.1], [0, 1.86, 0.29], [0.1, 0.09], [0.06, 0.05], { color: cel(BONE), name: "snout", ...bone });
  b.frustumBox([0, 1.83, 0.08], [0, 1.805, 0.27], [0.08, 0.03], [0.05, 0.025], { color: cel(BONE_DK), name: "jaw", ...bone });
  b.part(new THREE.SphereGeometry(0.012, 5, 4), PURPLE_DK, { at: [0.012, 1.885, 0.285], ...bone });
  b.part(new THREE.SphereGeometry(0.012, 5, 4), PURPLE_DK, { at: [-0.012, 1.885, 0.285], ...bone });
  for (const s of [1, -1]) {
    for (let k = 0; k < 5; k++) {
      const z = 0.11 + k * 0.035;
      b.spike([s * 0.026, 1.84, z], [0, -1, 0], 0.036 - k * 0.002, 0.008, { color: BONE_LT, sides: 5, ...bone });
      b.spike([s * 0.02, 1.818, z + 0.01], [0, 1, 0], 0.03 - k * 0.002, 0.007, { color: BONE_LT, sides: 5, ...bone });
    }
    b.part(new THREE.SphereGeometry(0.03, 6, 5), PURPLE_DK, { at: [s * 0.06, 1.925, 0.088], name: "socket", ...bone });
    glow(b.part(new THREE.SphereGeometry(0.018, 6, 4), TEAL, { at: [s * 0.068, 1.927, 0.105], name: "eye", ...bone }), 1.5);
    b.spike([s * 0.05, 1.955, 0.07], [s * 0.3, 0.5, 0.8], 0.08, 0.016, { color: BONE_DK, sides: 5, ...bone });
    b.spike([s * 0.085, 1.9, 0.0], [s, 0.1, -0.6], 0.11, 0.02, { color: BONE, sides: 5, ...bone });
    b.sweep(bezier([s * 0.06, 1.96, 0], [s * 0.16, 2.02, -0.08], [s * 0.2, 2.14, -0.2], [s * 0.14, 2.32, -0.3]), [0.032, 0.004], {
      color: BONE,
      bands: [
        [0.72, BONE],
        [1, TEAL_DK],
      ],
      caps: { start: "flat", end: "point" },
      sides: 6,
      name: "horn",
      ...bone,
    });
    b.part(new THREE.TorusGeometry(0.03, 0.007, 4, 8), GOLD, { at: [s * 0.1, 2.03, -0.1], rotation: [60, 40 * s, 0], ...bone });
  }

  // ---------- blade ----------
  const O = [0.05, 1.88, -0.02];
  const spineWorld = SPINE.map((p) => [O[0] + p[0], O[1] + p[1], O[2]]);
  const bladePaint = cel(
    paint((_p, _n, s) => {
      const x = s[0];
      const y = s[1];
      const d = spineY(x) - y;
      if (d < 0.04) return PURPLE;
      if (d < 0.052) return GOLD;
      if (d > 0.2) return BONE_LT;
      if (d < 0.16 && (x / 0.085) % 1 < 0.1) return BONE_DK;
      return BONE;
    }),
  );
  b.extrude(
    [
      [0, 0.06],
      [0.2, 0.2],
      [0.5, 0.3],
      [0.85, 0.28],
      [1.15, 0.12],
      [1.38, -0.18, "sharp"],
      [1.1, 0],
      [0.8, 0.08],
      [0.5, 0.08],
      [0.2, -0.04],
      [0, -0.06],
    ],
    { at: O, x: [1, 0, 0], thickness: 0.022, bevel: 0.006, smoothing: 1, color: bladePaint, name: "blade", ...bone },
  );
  b.extrude(
    [
      [0, 0.04],
      [0.15, 0.12],
      [0.3, 0.05],
      [0.38, -0.1, "sharp"],
      [0.2, -0.02],
      [0, -0.04],
    ],
    { at: [-0.05, 1.86, -0.02], x: [-1, 0, 0], thickness: 0.026, bevel: 0.006, color: cel(BONE_DK), name: "spur", ...bone },
  );
  glow(
    b.sweep(
      catmull(EDGE.map((p) => [O[0] + p[0], O[1] + p[1], O[2]])),
      [0.006, 0.013],
      { color: TEAL, sides: 5, caps: "flat", name: "soulEdge", ...bone },
    ),
    1.6,
  );
  for (const side of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(1.0, 0.3), "#ffffff", {
        at: [O[0] + 0.7, O[1] + 0.12, O[2] + side * 0.0125],
        dir: [0, 0, side],
        axis: "z",
        texture: RUNES,
        name: "bladeRunes",
        ...bone,
      }),
    );
  }
  const spinePath = catmull(spineWorld);
  for (let i = 0; i < 7; i++) {
    const t = 0.12 + i * 0.11;
    const P = spinePath.at(t);
    const T = spinePath.tangentAt(t);
    const n = new THREE.Vector3(-T.y, T.x, 0).normalize();
    const dir = n.clone().multiplyScalar(0.8).addScaledVector(T, -0.5);
    b.spike(P.clone().addScaledVector(n, -0.012), dir, 0.17 - 0.1 * t, 0.024 - 0.008 * t, {
      color: BONE,
      sides: 5,
      name: "spineSpike",
      ...bone,
    });
  }
  for (const [x, y] of [
    [0.45, 0.19],
    [0.8, 0.17],
  ]) {
    glow(b.part(new THREE.SphereGeometry(0.018, 6, 4), TEAL, { at: [O[0] + x, O[1] + y, O[2] + 0.012], ...bone }), 1.3);
    glow(b.part(new THREE.SphereGeometry(0.018, 6, 4), TEAL, { at: [O[0] + x, O[1] + y, O[2] - 0.012], ...bone }), 1.3);
  }

  // ---------- swaying soul charm ----------
  b.part(new THREE.TorusGeometry(0.04, 0.007, 4, 8), GOLD, { at: [0, 1.15, 0], rotation: [90, 0, 0], ...bone });
  const charm = b.chain(
    "charm",
    catmull([
      [0.045, 1.15, 0],
      [0.06, 1.0, 0],
      [0.05, 0.84, 0],
    ]),
    { parent: base, names: ["charm1", "charm2", "charm3"], role: "hinge" },
  );
  b.sweep(charm, 0.007, { color: LEATHER, sides: 5, name: "cord" });
  const tip = charm.tip ?? charm.joints[charm.joints.length - 1];
  b.part(new THREE.CylinderGeometry(0.014, 0.018, 0.03, 6), GOLD, { bone: tip, at: [0.05, 0.84, 0] });
  glow(
    b.lathe(
      [
        [0, -0.1],
        [0.025, -0.04],
        [0.035, 0.02],
        [0.02, 0.06],
        [0, 0.07],
      ],
      { at: [0.05, 0.8, 0], segments: 6, color: TEAL, bone: tip, name: "wisp" },
    ),
    1.4,
  );

  // ---------- drifting soul flames ----------
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4;
    const r = 0.58 + 0.1 * Math.sin(i * 1.7);
    const y = 0.4 + i * 0.22;
    const pos = [r * Math.cos(a), y, r * Math.sin(a)];
    glow(b.part(new THREE.SphereGeometry(0.026, 6, 4), TEAL, { at: pos, name: "mote", ...bone }), 1.5);
    glow(b.spike(pos, [0, -1, 0], 0.13, 0.022, { color: TEAL, sides: 5, name: "moteTail", ...bone }), 1.5);
  }

  return b.root;
}
