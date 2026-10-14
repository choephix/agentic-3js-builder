import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "hot-air balloon",
  description:
    "A striped hot-air balloon on the ground: a bold envelope with a checkered band, a glowing burner, a load ring, ropes, a wicker basket, sandbags and a little flag.",
};

type V = [number, number, number];

const SUN = "#f7c41f";
const RED = "#e8412c";
const SKY = "#6ec6f0";
const NAVY = "#1d3b6e";
const CREAM = "#f6ecd0";
const FLAME = "#ff7a1a";
const GLOW = "#ffd23a";
const IRON = "#4a4a4f";
const WICKER = "#c99a5b";
const WICKER_DK = "#9a6b3a";
const ROPE = "#8a6a45";
const SAND = "#b89a6a";
const WOOD = "#6b4a2b";

export default function build() {
  const b = createBuilder({ name: "hot-air-balloon" });
  b.joint("root", { at: [0, 0, 0] });

  const mid = (a: V, z: V): V => [(a[0] + z[0]) / 2, (a[1] + z[1]) / 2, (a[2] + z[2]) / 2];

  // A thin cylinder stretched from a to z (rope, strut, pole tie).
  const link = (a: V, z: V, r: number, color: string) => {
    const len = Math.hypot(z[0] - a[0], z[1] - a[1], z[2] - a[2]);
    const g = new THREE.CylinderGeometry(r, r, len, 5);
    b.part(g, color, { at: mid(a, z), aim: z });
  };

  const box = (w: number, h: number, d: number, p: V, color: string) => {
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: p });
  };

  // ---------- Envelope ----------
  // Six sectors of a sphere, alternating colours, form bold vertical stripes.
  // The sphere is cut at the bottom to leave an open mouth.
  const R = 7;
  const CY = 12;
  const SY = 1.25;
  const SECTORS = [SUN, RED, SKY, SUN, RED, SKY];
  SECTORS.forEach((c, i) => {
    const g = new THREE.SphereGeometry(R, 4, 18, (i * Math.PI) / 3, Math.PI / 3, 0, 0.78 * Math.PI);
    b.part(g, c, { at: [0, CY, 0], scale: [1, SY, 1] });
  });

  // Patterned band: two rows of alternating navy and cream tiles around the middle.
  const SEG = 36;
  const TILE_W = 1.1;
  const rows: Array<{ y: number }> = [{ y: 12.45 }, { y: 11.5 }];
  rows.forEach((row, j) => {
    for (let i = 0; i < SEG; i++) {
      const a = (i / SEG) * Math.PI * 2;
      const g = new THREE.BoxGeometry(TILE_W, 0.85, 0.2);
      g.translate(0, row.y, R + 0.1);
      g.rotateY(a);
      const color = (i + j) % 2 === 0 ? NAVY : CREAM;
      b.part(g, color, { at: [0, 0, 0] });
    }
  });

  // Small cap at the crown.
  b.part(new THREE.CylinderGeometry(0.35, 0.45, 0.4, 8), IRON, { at: [0, 20.9, 0] });

  // ---------- Burner ----------
  // Load ring under the mouth.
  const RING_R = 4.6;
  const RING_Y = 4.95;
  const ringGeo = new THREE.TorusGeometry(RING_R, 0.09, 6, 28);
  ringGeo.rotateX(Math.PI / 2);
  ringGeo.translate(0, RING_Y, 0);
  b.part(ringGeo, IRON, { at: [0, 0, 0] });

  // Burner housing and glowing flame.
  b.part(new THREE.CylinderGeometry(0.7, 0.6, 0.9, 10), IRON, { at: [0, 4.6, 0] });
  const flameGeo = new THREE.CylinderGeometry(0.1, 0.55, 1.5, 8);
  flameGeo.translate(0, 5.9, 0);
  b.part(flameGeo, FLAME, { at: [0, 0, 0] });
  const coreGeo = new THREE.CylinderGeometry(0.04, 0.3, 1.0, 8);
  coreGeo.translate(0, 5.6, 0);
  b.part(coreGeo, GLOW, { at: [0, 0, 0] });

  // Three struts from the ring up to the burner.
  for (let k = 0; k < 3; k++) {
    const t = (k / 3) * Math.PI * 2 + Math.PI / 6;
    const outer: V = [RING_R * Math.cos(t), RING_Y, RING_R * Math.sin(t)];
    const inner: V = [0.5 * Math.cos(t), 4.2, 0.5 * Math.sin(t)];
    link(outer, inner, 0.05, IRON);
  }

  // ---------- Basket ----------
  // Wooden base plank.
  box(1.95, 0.12, 1.35, [0, 0.06, 0], WOOD);
  // Wicker body.
  box(1.8, 1.2, 1.2, [0, 0.72, 0], WICKER);
  // Rim.
  box(1.94, 0.1, 0.1, [0, 1.34, 0.63], WICKER_DK);
  box(1.94, 0.1, 0.1, [0, 1.34, -0.63], WICKER_DK);
  box(0.1, 0.1, 1.3, [0.93, 1.34, 0], WICKER_DK);
  box(0.1, 0.1, 1.3, [-0.93, 1.34, 0], WICKER_DK);

  // Weave: horizontal bands alternating tones, and vertical stakes.
  const bandYs = [0.25, 0.45, 0.65, 0.85, 1.05, 1.25];
  bandYs.forEach((y, i) => {
    const tone = i % 2 === 0 ? WICKER_DK : WICKER;
    box(1.8, 0.1, 0.04, [0, y, 0.62], tone);
    box(1.8, 0.1, 0.04, [0, y, -0.62], tone);
    box(0.04, 0.1, 1.2, [0.92, y, 0], tone);
    box(0.04, 0.1, 1.2, [-0.92, y, 0], tone);
  });
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.2;
    box(0.07, 1.2, 0.05, [x, 0.72, 0.63], WICKER_DK);
    box(0.07, 1.2, 0.05, [x, 0.72, -0.63], WICKER_DK);
  }
  for (let i = -2; i <= 2; i++) {
    const z = i * 0.25;
    box(0.05, 1.2, 0.07, [0.93, 0.72, z], WICKER_DK);
    box(0.05, 1.2, 0.07, [-0.93, 0.72, z], WICKER_DK);
  }

  // ---------- Ropes ----------
  // Eight ropes from the basket rim corners up to the load ring.
  for (let k = 0; k < 8; k++) {
    const t = (k / 8) * Math.PI * 2 + Math.PI / 8;
    const bx = Math.max(-0.9, Math.min(0.9, Math.cos(t) * 1.6));
    const bz = Math.max(-0.6, Math.min(0.6, Math.sin(t) * 1.6));
    const basketPt: V = [bx, 1.34, bz];
    const ringPt: V = [RING_R * Math.cos(t), RING_Y, RING_R * Math.sin(t)];
    link(basketPt, ringPt, 0.03, ROPE);
  }

  // ---------- Sandbags ----------
  const bagGeo = () => new THREE.SphereGeometry(0.32, 8, 6);
  const bags: Array<{ p: V; tie: V }> = [
    { p: [-1.1, 0.8, 0.25], tie: [-0.92, 1.3, 0.25] },
    { p: [1.15, 0.7, -0.3], tie: [0.92, 1.3, -0.3] },
    { p: [0.25, 0.55, 0.85], tie: [0.25, 1.3, 0.63] },
  ];
  bags.forEach((bag) => {
    b.part(bagGeo(), SAND, { at: bag.p, scale: [1.2, 0.8, 0.7] });
    link(bag.tie, [bag.p[0], bag.p[1] + 0.25, bag.p[2]], 0.025, ROPE);
  });

  // ---------- Flag ----------
  // Pole on the basket's front-right corner, with a flag at the top.
  const poleBase: V = [0.92, 1.34, 0.62];
  const poleTop: V = [0.92, 3.6, 0.62];
  link(poleBase, poleTop, 0.03, IRON);
  box(0.8, 0.5, 0.03, [0.92 + 0.4, 3.25, 0.62], RED);
  box(0.8, 0.12, 0.04, [0.92 + 0.4, 3.25, 0.62], SUN);

  return b.root;
}
