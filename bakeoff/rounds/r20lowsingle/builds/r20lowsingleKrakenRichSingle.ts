import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, gradient, paint, spots } from "../../../../src/paint";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kraken",
  description:
    "A towering armoured kraken surging out of the sea, eight tentacles splayed wide, glowing cyan studs and a golden beak. Overwatch-style polished sci-fi monster.",
  style: "Overwatch",
  commit: "88fc1f0",
};

const PURPLE = "#5a3fc0";
const VIOLET = "#8a6cf2";
const PALE = "#f1c8e8";
const ACCENT = "#27f0dc";
const METAL = "#2d3150";
const METAL_L = "#4a5080";
const GOLD = "#ffc94a";
const WATER = "#2a78c0";
const FOAM = "#dff6ff";
const EYE_W = "#f4f8ff";

export default function build() {
  const b = createBuilder({ name: "kraken" });
  const r = rng(11);

  // ---- skeleton ----
  const root = b.joint("body", { at: [0, 1.0, 0.1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.0, 0.1],
      [0, 1.7, 0.0],
      [0, 2.5, -0.35],
      [0, 3.3, -0.75],
      [0, 3.7, -1.0],
    ]),
    { parent: root, count: 4, role: "spine" },
  );
  const jaw = b.joint("jaw", { parent: root, at: [0, 0.8, 0.65], aim: [0, 0.5, 1.2], role: "jaw" });

  // ---- water base ----
  b.lathe(
    [
      [0, 0],
      [5.4, 0],
      [5.4, 0.05],
      [0, 0.05],
    ],
    { at: [0, 0, 0], bone: root, color: WATER, segments: 20 },
  );
  for (const rr of [1.4, 2.9, 4.4])
    b.lathe(
      [
        [rr, 0],
        [rr + 0.14, 0],
        [rr + 0.14, 0.08],
        [rr, 0.08],
      ],
      { at: [0, 0, 0], bone: root, color: FOAM, segments: 20 },
    );

  // ---- mantle ----
  const MANTLE = cel(
    spots(countershade(PURPLE, PALE, { level: -0.25, soft: 0.3 }), VIOLET, { size: 0.3, amount: 0.3, seed: 3 }),
  );
  const mantle = b.sweep(spine, [0.75, 1.0, 0.95, 0.7, 0.2], { color: MANTLE });
  const skin = b.surface(mantle);

  // armour hub collar
  b.lathe(
    [
      [0, 0],
      [1.1, 0],
      [1.18, 0.1],
      [1.18, 0.2],
      [1.1, 0.3],
      [0, 0.3],
    ],
    { at: [0, 0.68, 0.1], bone: root, color: METAL, segments: 16 },
  );
  glow(
    b.lathe(
      [
        [1.12, 0],
        [1.21, 0],
        [1.21, 0.05],
        [1.12, 0.05],
      ],
      { at: [0, 0.8, 0.1], bone: root, color: ACCENT, segments: 16 },
    ),
    1.2,
  );

  // panel bands round the mantle
  for (const t of [0.4, 0.58, 0.76]) {
    b.sweep(skin.loop(spine.at(t), { lift: 0.025 }), 0.035, { color: METAL });
    glow(b.sweep(skin.loop(spine.at(t), { lift: 0.04 }), 0.012, { color: ACCENT }), 1);
  }

  // dorsal spines
  b.along(
    mantle,
    6,
    (at) => {
      glow(b.spike(at, at, 0.32, 0.07, { color: ACCENT }), 1);
    },
    { from: 0.3, to: 0.88 },
  );

  // side fins
  const FIN = cel(PURPLE);
  const finEdge = paint((_p, _n, s) => (s[0] > 0.82 ? cel(ACCENT) : FIN));
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0.3],
        [0.5, 0.5],
        [1.1, 0.15, "sharp"],
        [0.6, -0.5],
        [0, -0.35],
      ],
      {
        at: [s * 0.7, 2.6, -0.35],
        x: [s, 0, 0],
        y: [0, 0, -1],
        thickness: 0.07,
        bevel: 0.02,
        smoothing: 1,
        color: finEdge,
        bone: spine.joints[2],
      },
    );
  }

  // ---- face ----
  const EYE_ROW = 1.75;
  for (const s of [1, -1]) {
    const hit = skin.nearest([s * 0.5, EYE_ROW, 1.5]);
    b.stick(new THREE.SphereGeometry(0.21, 10, 8), EYE_W, hit, { embed: 0.45 });
    glow(b.stick(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 10), ACCENT, hit.moved([0, 0.14, 0]), { embed: 0 }), 1);
    b.stick(new THREE.BoxGeometry(0.035, 0.18, 0.03), INK, hit.moved([0, 0.16, 0]), { embed: 0 });
    const brow = skin.nearest([s * 0.5, EYE_ROW + 0.3, 1.4]);
    b.stick(new THREE.SphereGeometry(0.25, 8, 6), METAL, brow, { embed: 0.5, scale: [1.6, 0.45, 1] });
  }
  // beak
  b.spike([0, 0.98, 0.55], [0, 0.5, 1.2], null, 0.2, { color: GOLD, bone: root });
  b.spike([0, 0.72, 0.62], [0, 0.4, 1.25], null, 0.16, { color: "#e0a030", bone: jaw });
  b.part(new THREE.SphereGeometry(0.17, 8, 6), INK, { bone: root, at: [0, 0.78, 0.78] });
  // feelers
  for (const s of [1, -1])
    b.sweep(
      catmull([
        [s * 0.22, 0.8, 0.7],
        [s * 0.45, 0.6, 1.1],
        [s * 0.7, 0.55, 1.5],
        [s * 0.8, 0.7, 1.8],
      ]),
      [0.07, 0.015],
      { bone: root, color: PALE },
    );

  // ---- tentacles ----
  const LIMB = cel(spots(PURPLE, VIOLET, { size: 0.22, amount: 0.3, seed: 5 }));
  const BELLY = cel(PALE);
  const radii = [0.34, 0.3, 0.24, 0.17, 0.11, 0.07, 0.04];
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) * Math.PI) / 4;
    const sg = i % 2 ? 1 : -1;
    const L = 0.9 + 0.2 * r();
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const px = Math.cos(a);
    const pz = -Math.sin(a);
    const pt = (rad: number, y: number, side: number) => [dx * rad * L + px * side * L, y, dz * rad * L + pz * side * L];
    const path = catmull([
      pt(0.5, 1.0, 0),
      pt(1.1, 1.5, 0),
      pt(1.9, 1.65, 0.15 * sg),
      pt(2.7, 1.05, 0.4 * sg),
      pt(3.4, 0.4, 0.85 * sg),
      pt(4.0, 0.1, 1.3 * sg),
      pt(4.4, 0.2, 1.8 * sg),
    ]);
    const chain = b.chain(`tent${i}`, path, { parent: root, count: 7, role: "tentacle" });
    const color = gradient(LIMB, cel(ACCENT), path.at(0.8), path.at(1));
    const sw = b.sweep(chain, radii, { color, sectors: [[120, 240, BELLY]] });

    for (const t of [0.12, 0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.68, 0.76]) {
      const sp = sw.at(t, 180);
      const rr = sp.radius;
      b.stick(new THREE.CylinderGeometry(rr * 0.55, rr * 0.5, rr * 0.35, 6), "#ffd9c8", sp, { embed: 0.3 });
      b.stick(new THREE.CylinderGeometry(rr * 0.3, rr * 0.3, rr * 0.3, 6), METAL_L, sp, { embed: 0.05 });
    }
    for (const t of [0.18, 0.32, 0.46, 0.6, 0.72])
      for (const ang of [-40, 40]) {
        const sp = sw.at(t, ang);
        glow(b.stick(new THREE.SphereGeometry(sp.radius * 0.2, 6, 4), ACCENT, sp, { embed: 0.3 }), 1.2);
      }
  }

  return b.root;
}
