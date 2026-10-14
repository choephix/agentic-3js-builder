```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "treasure chest",
  description: "A wooden treasure chest with iron straps, a gold lock, side handles and an open lid spilling coins and gems.",
};

const WOOD = "#8a5a2b";
const WOOD_DARK = "#5e3a1a";
const IRON = "#3b3f46";
const GOLD = "#e8b43c";
const GOLD_DARK = "#b98a22";
const INSIDE = "#2a1a10";
const RUBY = "#c4253a";
const EMERALD = "#2fb36b";
const SAPPHIRE = "#2f7fd6";

// Lid geometry is built in model space around its hinge, so it reads correctly
// at rest and rotates open as one piece.
const HINGE_Y = 0.36;
const HINGE_Z = -0.275;
const LID_R = 0.275;
const OPEN_ANGLE = -0.6;

function lidGeometry(g: THREE.BufferGeometry, x = 0): THREE.BufferGeometry {
  g.rotateZ(Math.PI / 2); // axis along X, arc rises over the top
  g.translate(x, 0, LID_R); // hinge becomes the local origin
  g.rotateX(OPEN_ANGLE); // raise the front edge
  g.translate(0, HINGE_Y, HINGE_Z); // place on the chest
  return g;
}

export default function build() {
  const b = createBuilder({ name: "treasure-chest" });
  const rand = rng(11);

  const base = b.joint("base", { at: [0, 0, 0] });
  const lid = b.joint("lid", { at: [0, HINGE_Y, HINGE_Z], parent: base });

  // Feet
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const foot = new THREE.BoxGeometry(0.08, 0.05, 0.08);
      foot.translate(sx * 0.38, 0.025, sz * 0.2);
      b.part(foot, IRON, { at: [0, 0, 0], bone: base });
    }
  }

  // Body
  const body = new THREE.BoxGeometry(0.9, 0.32, 0.55);
  body.translate(0, 0.2, 0);
  b.part(body, WOOD, { at: [0, 0, 0], bone: base });

  // Dark interior, a thin plane just above the rim
  const inside = new THREE.BoxGeometry(0.82, 0.004, 0.47);
  inside.translate(0, 0.361, 0);
  b.part(inside, INSIDE, { at: [0, 0, 0], bone: base });

  // Gold corner caps
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const cap = new THREE.BoxGeometry(0.1, 0.34, 0.1);
      cap.translate(sx * 0.45, 0.2, sz * 0.275);
      b.part(cap, GOLD_DARK, { at: [0, 0, 0], bone: base });
    }
  }

  // Iron straps on front and back
  for (const sx of [-0.25, 0.25]) {
    for (const sz of [-1, 1]) {
      const strap = new THREE.BoxGeometry(0.07, 0.32, 0.02);
      strap.translate(sx, 0.2, sz * 0.2775);
      b.part(strap, IRON, { at: [0, 0, 0], bone: base });
    }
  }

  // Gold lock plate and keyhole
  const plate = new THREE.BoxGeometry(0.13, 0.15, 0.025);
  plate.translate(0, 0.22, 0.2875);
  b.part(plate, GOLD, { at: [0, 0, 0], bone: base });
  const keyhole = new THREE.BoxGeometry(0.02, 0.05, 0.03);
  keyhole.translate(0, 0.2, 0.3);
  b.part(keyhole, INSIDE, { at: [0, 0, 0], bone: base });
  const keyTop = new THREE.SphereGeometry(0.014, 6, 4);
  keyTop.translate(0, 0.235, 0.3);
  b.part(keyTop, INSIDE, { at: [0, 0, 0], bone: base });

  // Side handles, one per side, with mounting plates
  for (const sx of [-1, 1]) {
    const handle = new THREE.TorusGeometry(0.07, 0.014, 6, 12, Math.PI);
    handle.rotateZ(-Math.PI / 2);
    if (sx < 0) handle.rotateZ(Math.PI);
    handle.translate(sx * 0.45, 0.2, 0);
    b.part(handle, IRON, { at: [0, 0, 0], bone: base });

    for (const dy of [-0.07, 0.07]) {
      const plateSide = new THREE.BoxGeometry(0.03, 0.04, 0.05);
      plateSide.translate(sx * 0.46, 0.2 + dy, 0);
      b.part(plateSide, IRON, { at: [0, 0, 0], bone: base });
    }
  }

  // Coin pile, mounded in the middle of the interior
  const coinCount = 26;
  for (let i = 0; i < coinCount; i++) {
    const x = (rand() - 0.5) * 0.7;
    const z = (rand() - 0.5) * 0.4;
    const mound = Math.max(0, 1 - Math.hypot(x / 0.4, z / 0.22));
    const y = 0.366 + mound * 0.07 + rand() * 0.012;
    const coin = new THREE.CylinderGeometry(0.035, 0.035, 0.008, 10);
    coin.rotateX((rand() - 0.5) * 0.35);
    coin.rotateZ((rand() - 0.5) * 0.35);
    coin.translate(x, y, z);
    b.part(coin, i % 3 === 0 ? GOLD_DARK : GOLD, { at: [0, 0, 0], bone: base });
  }

  // Gems glinting on top of the pile
  const gems: [string, number, number, number][] = [
    [RUBY, 0.05, 0.43, 0.02],
    [EMERALD, -0.12, 0.41, -0.04],
    [SAPPHIRE, 0.18, 0.4, -0.06],
    [RUBY, -0.22, 0.39, 0.06],
    [EMERALD, 0.1, 0.42, 0.1],
  ];
  for (const [color, x, y, z] of gems) {
    const gem = new THREE.OctahedronGeometry(0.035, 0);
    gem.scale(1, 1.3, 1);
    gem.rotateY(rand() * Math.PI);
    gem.translate(x, y, z);
    b.part(gem, color, { at: [0, 0, 0], bone: base });
  }

  // Lid shell, built as a half cylinder over the hinge
  const lidShell = new THREE.CylinderGeometry(LID_R, LID_R, 0.9, 14, 1, false, 0, Math.PI);
  b.part(lidGeometry(lidShell), WOOD, { at: [0, 0, 0], bone: lid });

  // Iron bands wrapping the lid
  for (const x of [-0.3, 0, 0.3]) {
    const band = new THREE.CylinderGeometry(LID_R + 0.008, LID_R + 0.008, 0.05, 14, 1, true, 0, Math.PI);
    b.part(lidGeometry(band, x), IRON, { at: [0, 0, 0], bone: lid });
  }

  // Gold rivet studs along the lid's front edge
  for (const x of [-0.38, -0.19, 0, 0.19, 0.38]) {
    const stud = new THREE.SphereGeometry(0.018, 6, 4);
    stud.translate(x, 0, 0);
    b.part(stud, GOLD, { at: [0, 0, 0], bone: lid });
  }

  return b.root;
}
```