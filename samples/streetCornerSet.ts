import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Paint } from "../src/paint";
import { cel } from "../kits/toon";
import { glow } from "../kits/glow";
export const meta = {
  name: "Whimsy Street Corner Set",
  description: "A storybook street corner with a glowing lamp, jaunty mailbox, carved bench, and overflowing flower boxes.",
  style: "whimsical Genshin mix",
  commit: "9555ebf",
};

export default function build() {
  const b = createBuilder({ name: "streetCornerSet", detail: 1 });
  const root = b.joint("streetCorner", { at: [0, 0, 0], role: "spine" });

  const INK = "#241735";
  const STONE = cel("#7890a2", "#3d496b");
  const STONE_LIGHT = cel("#b5c5c7", "#68738e");
  const TEAL = cel("#2cb7ad", "#176f7c");
  const TEAL_DARK = cel("#176675", "#103e5c");
  const WOOD = cel("#9e5d3d", "#5b3040");
  const WOOD_LIGHT = cel("#d18b50", "#82423b");
  const GOLD = cel("#ffd45a", "#c26b3d");
  const GOLD_DARK = cel("#b96a39", "#713355");
  const RED = cel("#ed6674", "#a83e65");
  const CORAL = cel("#ff9a72", "#c84e67");
  const LILAC = cel("#b68cf2", "#684f9e");
  const CREAM = cel("#fff0b8", "#d99277");
  const LEAF = cel("#78c889", "#34725f");
  const SOIL = cel("#493545", "#28233e");
  const LAMP = "#ffe28a";

  const put = (
    geometry: THREE.BufferGeometry,
    color: string | Paint,
    at: [number, number, number],
    name: string,
    extra: Record<string, unknown> = {},
  ) => b.part(geometry, color, { bone: root, at, flat: true, name, ...extra });

  // A little two-material paving corner anchors the otherwise airy props.
  put(new THREE.BoxGeometry(3.5, 0.08, 2.15), STONE, [0, 0.04, 0], "paving");
  put(new THREE.BoxGeometry(3.5, 0.13, 0.22), STONE_LIGHT, [0, 0.145, 0.82], "curbFront");
  put(new THREE.BoxGeometry(0.18, 0.13, 1.72), STONE_LIGHT, [-1.59, 0.145, -0.02], "curbSide");
  for (let i = -3; i <= 3; i++) {
    put(new THREE.BoxGeometry(0.42, 0.012, 0.035), TEAL_DARK, [i * 0.48, 0.087, 0.28 + (i % 2) * 0.12], `pavingLine${i + 3}`);
  }

  // Lamp post: chunky teal stem, golden collars, and a warm magical lantern.
  put(new THREE.CylinderGeometry(0.16, 0.2, 0.18, 8), GOLD_DARK, [0.98, 0.17, 0.2], "lampFoot");
  put(new THREE.CylinderGeometry(0.11, 0.13, 2.48, 8), TEAL, [0.98, 1.49, 0.2], "lampPost");
  put(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 8), GOLD, [0.98, 2.7, 0.2], "lampCollarLower");
  put(new THREE.TorusGeometry(0.18, 0.025, 5, 10), GOLD_DARK, [0.98, 2.77, 0.2], "lampCollarRing", { rotation: [90, 0, 0] });
  const glowCore = put(new THREE.SphereGeometry(1, 12, 8), LAMP, [0.98, 3.01, 0.2], "lanternGlow", { scale: [0.18, 0.22, 0.18] });
  glow(glowCore, 1.7);
  for (const [dx, dz] of [[-0.195, -0.195], [0.195, -0.195], [-0.195, 0.195], [0.195, 0.195]] as const) {
    put(new THREE.BoxGeometry(0.035, 0.39, 0.035), GOLD, [0.98 + dx, 3.01, 0.2 + dz], `lanternBar${dx}${dz}`);
  }
  put(new THREE.TorusGeometry(0.235, 0.027, 5, 10), GOLD, [0.98, 2.83, 0.2], "lanternBottomRing", { rotation: [90, 0, 0] });
  put(new THREE.TorusGeometry(0.235, 0.027, 5, 10), GOLD, [0.98, 3.2, 0.2], "lanternTopRing", { rotation: [90, 0, 0] });
  b.lathe(
    [[0, 0], [0.28, 0], [0.21, 0.11], [0.08, 0.18], [0, 0.2]],
    { at: [0.98, 3.25, 0.2], axis: [0, 1, 0], segments: 8, color: GOLD_DARK, bone: root, name: "lanternRoof" },
  );
  put(new THREE.SphereGeometry(0.07, 8, 6), CORAL, [0.98, 3.48, 0.2], "lampFinial", { scale: [1, 1.25, 1] });
  put(new THREE.ConeGeometry(0.045, 0.17, 6), GOLD, [0.98, 3.61, 0.2], "lampSpark");

  // Mailbox with a soft arched lid, raised flag, and tiny brass mail slot.
  put(new THREE.CylinderGeometry(0.13, 0.16, 0.72, 8), TEAL_DARK, [-1.22, 0.53, 0.25], "mailPost");
  put(new THREE.BoxGeometry(0.58, 0.1, 0.42), GOLD_DARK, [-1.22, 0.13, 0.25], "mailPostFoot");
  put(new THREE.BoxGeometry(0.76, 0.48, 0.5), CORAL, [-1.22, 0.86, 0.25], "mailboxBody");
  put(new THREE.SphereGeometry(1, 12, 8), CORAL, [-1.22, 1.1, 0.25], "mailboxRoof", { scale: [0.38, 0.2, 0.255] });
  put(new THREE.BoxGeometry(0.78, 0.045, 0.52), GOLD_DARK, [-1.22, 0.64, 0.255], "mailboxLowerTrim");
  put(new THREE.BoxGeometry(0.57, 0.045, 0.03), INK, [-1.22, 0.91, 0.515], "mailSlot");
  put(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 6), GOLD, [-1.22, 0.85, 0.548], "mailHandle", { rotation: [90, 0, 0] });
  put(new THREE.CylinderGeometry(0.025, 0.025, 0.31, 6), GOLD_DARK, [-0.82, 1.0, 0.25], "flagPole");
  put(new THREE.BoxGeometry(0.16, 0.2, 0.035), RED, [-0.82, 1.16, 0.25], "flagPlate");
  put(new THREE.SphereGeometry(0.05, 8, 6), GOLD, [-0.82, 0.84, 0.25], "flagPivot");
  put(new THREE.BoxGeometry(0.12, 0.03, 0.03), GOLD, [-1.22, 1.31, 0.51], "mailboxCrown");

  // Bench: rounded seat, back, swept-looking legs, and a jewel-like carved crest.
  put(new THREE.BoxGeometry(1.45, 0.16, 0.46), WOOD_LIGHT, [-0.02, 0.64, -0.62], "benchSeat");
  put(new THREE.BoxGeometry(1.5, 0.08, 0.07), GOLD_DARK, [-0.02, 0.55, -0.62], "benchSeatTrim");
  put(new THREE.BoxGeometry(1.46, 0.68, 0.12), WOOD, [-0.02, 1.0, -0.83], "benchBack");
  put(new THREE.BoxGeometry(1.6, 0.07, 0.14), GOLD_DARK, [-0.02, 1.36, -0.83], "benchBackCrown");
  for (const s of [-1, 1]) {
    b.rod([s * 0.52, 0.56, -0.62], [s * 0.52, 0.12, -0.57], 0.055, { color: TEAL_DARK, bone: root, section: { ngon: 6 }, name: `benchLeg${s}` });
    b.rod([s * 0.52, 0.97, -0.8], [s * 0.52, 0.12, -0.62], 0.045, { color: TEAL_DARK, bone: root, section: { ngon: 6 }, name: `benchBackLeg${s}` });
    put(new THREE.SphereGeometry(0.08, 8, 6), GOLD, [s * 0.52, 0.59, -0.62], `benchSeatKnob${s}`);
  }
  b.extrude(
    [[0, 0], [0.16, 0.22], [0, 0.42], [-0.16, 0.22]],
    { at: [-0.02, 0.83, -0.9], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035, bevel: 0.008, color: GOLD, bone: root, name: "benchCrest" },
  );
  put(new THREE.SphereGeometry(0.055, 8, 6), LILAC, [-0.02, 1.05, -0.925], "benchCrestGem", { scale: [1, 1.2, 0.7] });

  const addFlowerBox = (x: number, z: number, suffix: string) => {
    put(new THREE.BoxGeometry(0.78, 0.3, 0.42), TEAL, [x, 0.52, z], `flowerBox${suffix}`);
    put(new THREE.BoxGeometry(0.9, 0.08, 0.5), GOLD_DARK, [x, 0.7, z], `flowerBoxRim${suffix}`);
    put(new THREE.BoxGeometry(0.66, 0.025, 0.31), SOIL, [x, 0.75, z], `flowerSoil${suffix}`);
    put(new THREE.CylinderGeometry(0.035, 0.045, 0.18, 6), GOLD_DARK, [x, 0.31, z + 0.01], `flowerBoxFoot${suffix}`);
    const flowers = [
      { dx: -0.23, col: CORAL, alt: 0 },
      { dx: 0, col: LILAC, alt: 0.04 },
      { dx: 0.23, col: CREAM, alt: -0.02 },
    ];
    flowers.forEach(({ dx, col, alt }, i) => {
      const fx = x + dx;
      const fy = 0.9 + alt;
      b.rod([fx, 0.72, z], [fx, fy - 0.09, z], 0.018, { color: LEAF, bone: root, section: { ngon: 5 }, name: `stem${suffix}${i}` });
      put(new THREE.SphereGeometry(0.085, 8, 6), col, [fx, fy, z], `flowerCenter${suffix}${i}`, { scale: [1, 0.8, 0.45] });
      for (let p = 0; p < 4; p++) {
        const a = (Math.PI * 2 * p) / 4;
        put(new THREE.SphereGeometry(0.052, 7, 5), col, [fx + Math.cos(a) * 0.072, fy + Math.sin(a) * 0.072, z + 0.012], `petal${suffix}${i}${p}`, { scale: [1, 1, 0.45] });
      }
      put(new THREE.SphereGeometry(0.026, 7, 5), GOLD, [fx, fy, z + 0.05], `flowerGem${suffix}${i}`);
      put(new THREE.SphereGeometry(0.065, 7, 5), LEAF, [fx - 0.07, 0.82 + alt * 0.4, z + 0.02], `leafL${suffix}${i}`, { scale: [1.5, 0.35, 0.6], rotation: [0, 0, -28] });
      put(new THREE.SphereGeometry(0.06, 7, 5), LEAF, [fx + 0.07, 0.86 + alt * 0.4, z - 0.01], `leafR${suffix}${i}`, { scale: [1.3, 0.32, 0.55], rotation: [0, 0, 28] });
    });
  };
  addFlowerBox(-0.68, -0.72, "L");
  addFlowerBox(1.06, -0.68, "R");

  // A few floating-looking gold motes connect the palette to Genshin's magical accents.
  for (const [x, y, z, s] of [[0.42, 1.72, -0.78, 0.045], [1.48, 2.16, -0.12, 0.035], [-1.58, 1.58, -0.55, 0.03]] as const) {
    const mote = put(new THREE.OctahedronGeometry(s, 0), "#ffd45a", [x, y, z], `mote${x}`);
    glow(mote, 1.1);
  }

  return b.root;
}
