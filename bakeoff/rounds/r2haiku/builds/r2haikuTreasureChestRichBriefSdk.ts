import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Pirate treasure chest",
  description:
    "Weathered dark plank chest with its lid thrown open, iron straps and studs, a hanging padlock, a skull-and-crossbones, and spilled gold, pearls, a goblet and gems.",
};

const WOOD = ["#4d3019", "#573720", "#432a16"];
const DARK = "#24160b";
const IRON = "#3a3a40";
const STEEL = "#6d7178";
const RUST = "#6b3b1c";
const GOLD = "#d9a52b";
const SILVER = "#c8c8cc";
const PEARL = "#f2ede0";
const BONE = "#e8dfc4";
const BLACK = "#111111";
const RED = "#b3122e";
const GREEN = "#1f8a4c";

// Small deterministic generator so every run builds the same chest.
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function build() {
  const b = createBuilder({ name: "pirate-treasure-chest" });
  const r = lcg(1717);

  const chest = b.joint("chest", { at: [0, 0, 0] });
  const H: [number, number, number] = [0, 0.6, -0.25]; // lid hinge, back top edge
  const lid = b.joint("lid", { at: H, parent: chest });
  const TH = (-110 * Math.PI) / 180; // lid opened up and back

  const P = (geo: THREE.BufferGeometry, color: string, at: [number, number, number], bone = chest) =>
    b.part(geo, color, { at, bone });

  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, bone = chest) =>
    P(new THREE.BoxGeometry(w, h, d), c, [x, y, z], bone);

  const ball = (rad: number, c: string, x: number, y: number, z: number, bone = chest, seg = 8) =>
    P(new THREE.SphereGeometry(rad, seg, 6), c, [x, y, z], bone);

  // Lid offset given in closed-lid local coordinates, rotated open about the hinge.
  const lidWorld = (ox: number, oy: number, oz: number): [number, number, number] => {
    const c = Math.cos(TH);
    const s = Math.sin(TH);
    return [ox, H[1] + (oy * c - oz * s), H[2] + (oy * s + oz * c)];
  };
  const lidBox = (w: number, h: number, d: number, c: string, ox: number, oy: number, oz: number) => {
    const g = new THREE.BoxGeometry(w, h, d);
    g.rotateX(TH);
    P(g, c, lidWorld(ox, oy, oz), lid);
  };
  const lidBall = (rad: number, c: string, ox: number, oy: number, oz: number) =>
    P(new THREE.SphereGeometry(rad, 8, 6), c, lidWorld(ox, oy, oz), lid);

  // ---- Body: five planks per wall, dark interior ----
  box(1.0, 0.04, 0.5, WOOD[1], 0, 0.02, 0); // bottom board
  for (let i = 0; i < 5; i++) {
    const x = -0.4 + i * 0.2;
    box(0.19, 0.6, 0.04, WOOD[i % 3], x, 0.3, 0.23); // front
    box(0.19, 0.6, 0.04, WOOD[(i + 1) % 3], x, 0.3, -0.23); // back
  }
  for (const sx of [-0.48, 0.48]) {
    box(0.04, 0.6, 0.245, WOOD[sx < 0 ? 0 : 2], sx, 0.3, 0.125);
    box(0.04, 0.6, 0.245, WOOD[sx < 0 ? 1 : 0], sx, 0.3, -0.125);
  }
  box(0.92, 0.02, 0.44, DARK, 0, 0.5, 0); // inner floor

  // Iron corner brackets
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      box(0.06, 0.62, 0.06, IRON, sx * 0.47, 0.3, sz * 0.25);
    }
  }

  // Iron straps: two horizontal bands and two vertical straps on the front and back
  for (const sz of [1, -1]) {
    for (const y of [0.12, 0.48]) {
      box(1.0, 0.05, 0.012, IRON, 0, y, sz * 0.256);
      for (const x of [-0.46, -0.23, 0, 0.23, 0.46]) {
        ball(0.014, STEEL, x, y, sz * 0.266, chest, 6);
      }
    }
    for (const x of [-0.3, 0.3]) {
      box(0.05, 0.6, 0.012, IRON, x, 0.3, sz * 0.256);
    }
  }
  // Side straps
  for (const sx of [-1, 1]) {
    for (const y of [0.12, 0.48]) {
      box(0.012, 0.05, 0.5, IRON, sx * 0.506, y, 0);
    }
  }

  // ---- Padlock hanging loose from a rusty hasp on the front ----
  box(0.09, 0.1, 0.01, RUST, 0.3, 0.39, 0.264); // hasp plate
  ball(0.012, STEEL, 0.3, 0.4, 0.272, chest, 6); // hasp rivet
  const shackleG = new THREE.TorusGeometry(0.03, 0.008, 6, 12);
  shackleG.rotateZ(0.25);
  P(shackleG, STEEL, [0.3, 0.31, 0.29]);
  box(0.09, 0.11, 0.05, IRON, 0.3, 0.24, 0.29); // padlock body
  box(0.02, 0.02, 0.01, BLACK, 0.3, 0.25, 0.318); // keyhole

  // ---- Carved skull and crossbones ----
  const skullG = new THREE.SphereGeometry(0.065, 10, 8);
  skullG.scale(1, 1.05, 0.9);
  P(skullG, BONE, [0, 0.3, 0.27]);
  box(0.07, 0.03, 0.05, BONE, 0, 0.237, 0.283); // jaw
  ball(0.02, BLACK, -0.025, 0.31, 0.322, chest, 6); // eyes
  ball(0.02, BLACK, 0.025, 0.31, 0.322, chest, 6);
  box(0.012, 0.02, 0.01, BLACK, 0, 0.285, 0.33); // nose
  for (const a of [0.7, -0.7]) {
    const bg = new THREE.BoxGeometry(0.2, 0.025, 0.025);
    bg.rotateZ(a);
    P(bg, BONE, [0, 0.19, 0.272]);
    for (const e of [1, -1]) {
      ball(0.016, BONE, e * 0.1 * Math.cos(a), 0.19 + e * 0.1 * Math.sin(a), 0.272, chest, 6);
    }
  }

  // ---- Lid: five planks, straps and studs, thrown open ----
  for (let i = 0; i < 5; i++) {
    const x = -0.4 + i * 0.2;
    lidBox(0.19, 0.05, 0.5, WOOD[(i + 2) % 3], x, 0.025, 0.25);
  }
  for (const x of [-0.3, 0.3]) {
    lidBox(0.03, 0.012, 0.5, IRON, x, 0.056, 0.25);
    for (const z of [0.05, 0.25, 0.45]) {
      lidBall(0.014, STEEL, x, 0.064, z);
    }
  }
  lidBox(1.0, 0.012, 0.03, IRON, 0, 0.056, 0.02); // cross strap on lid
  lidBox(1.0, 0.012, 0.03, IRON, 0, 0.056, 0.47);

  // ---- Gold coin hoard piled inside ----
  for (let i = 0; i < 70; i++) {
    const x = (r() - 0.5) * 0.84;
    const z = (r() - 0.5) * 0.36;
    const hMax = 0.09 * (1 - Math.abs(x) / 0.55);
    const y = 0.51 + r() * hMax + 0.005;
    const g = new THREE.CylinderGeometry(0.042, 0.042, 0.01, 10);
    g.rotateX((r() - 0.5) * 0.5);
    g.rotateZ((r() - 0.5) * 0.5);
    P(g, r() < 0.8 ? GOLD : SILVER, [x, y, z]);
  }

  // Coins spilling onto the floor in front
  for (let i = 0; i < 16; i++) {
    const x = (r() - 0.5) * 1.0;
    const z = 0.3 + r() * 0.22;
    const g = new THREE.CylinderGeometry(0.042, 0.042, 0.01, 10);
    g.rotateY(r() * Math.PI);
    P(g, r() < 0.8 ? GOLD : SILVER, [x, 0.005, z]);
  }

  // ---- Pearl necklace draped over the front rim onto the floor ----
  for (let i = 0; i < 24; i++) {
    const t = i / 23;
    const x = -0.3 - 0.2 * t;
    const y = 0.6 * Math.pow(1 - t, 1.5) + 0.012;
    const z = 0.26 + 0.16 * t;
    ball(0.012, PEARL, x, y, z, chest, 6);
  }

  // ---- Jewelled goblet standing in the hoard ----
  const goblet = new THREE.LatheGeometry([
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.045, 0.0),
    new THREE.Vector2(0.045, 0.01),
    new THREE.Vector2(0.01, 0.03),
    new THREE.Vector2(0.01, 0.09),
    new THREE.Vector2(0.055, 0.13),
    new THREE.Vector2(0.06, 0.16),
    new THREE.Vector2(0.05, 0.17),
  ], 10);
  P(goblet, GOLD, [0.22, 0.52, 0.02]);
  ball(0.02, GREEN, 0.22, 0.7, 0.02, chest, 6);
  ball(0.012, RED, 0.22, 0.6, 0.02, chest, 6);

  // ---- Loose gems ----
  const gemG = new THREE.IcosahedronGeometry(0.025, 0);
  for (let i = 0; i < 8; i++) {
    const x = (r() - 0.5) * 0.7;
    const z = (r() - 0.5) * 0.3;
    const y = 0.56 + r() * 0.03;
    P(gemG, i % 2 === 0 ? RED : GREEN, [x, y, z]);
  }
  for (let i = 0; i < 3; i++) {
    const x = 0.2 + (r() - 0.5) * 0.3;
    const z = 0.32 + r() * 0.12;
    P(gemG, i % 2 === 0 ? GREEN : RED, [x, 0.025, z]);
  }

  return b.root;
}
