import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Hot-air balloon",
  description:
    "A striped hot-air balloon on the ground: a 14 m red and cream envelope with a yellow band, an open mouth, a wicker basket on four ropes, and a roaring burner.",
};

const RED = "#d9412b";
const CREAM = "#f4e3b5";
const YELLOW = "#f2b233";
const WICKER = "#b07a3c";
const WICKER_DARK = "#7a4e1f";
const RIM = "#5b3a1a";
const ROPE = "#e8d9a8";
const STEEL = "#9aa3a8";
const FLAME = "#ffb020";
const FLAME_CORE = "#fff2a0";
const MOUTH = "#3b2a1e";

export default function build() {
  const b = createBuilder({ name: "hot-air-balloon" });
  b.joint("root", { at: [0, 0, 0] });

  // ---- Envelope -----------------------------------------------------------
  // Teardrop-ish envelope: a sphere, stretched tall, with the bottom cut away
  // to leave an open mouth. Built from 12 gores that alternate colour.
  const R = 7.2;
  const CY = 14;
  const SY = 1.2;
  const THETA = 0.9 * Math.PI; // polar angle where the mouth is cut

  const GORES = 12;
  for (let i = 0; i < GORES; i++) {
    const g = new THREE.SphereGeometry(
      R,
      4,
      16,
      (i / GORES) * Math.PI * 2,
      (Math.PI * 2) / GORES,
      0,
      THETA,
    );
    g.scale(1, SY, 1);
    g.translate(0, CY, 0);
    b.part(g, i % 2 === 0 ? RED : CREAM, { at: [0, 0, 0] });
  }

  // Mouth ring: where the envelope ends, and its radius there.
  const mouthY = CY - R * SY * Math.cos(THETA);
  const mouthR = R * Math.sin(THETA);

  const mouthTorus = new THREE.TorusGeometry(mouthR, 0.14, 6, 20);
  mouthTorus.rotateX(Math.PI / 2);
  mouthTorus.translate(0, mouthY, 0);
  b.part(mouthTorus, RIM, { at: [0, 0, 0] });

  // Dark disc inside the mouth so the opening reads as hollow from below.
  const mouthDisc = new THREE.CylinderGeometry(mouthR - 0.1, mouthR - 0.1, 0.1, 16, 1, false);
  mouthDisc.translate(0, mouthY + 0.4, 0);
  b.part(mouthDisc, MOUTH, { at: [0, 0, 0] });

  // Yellow band around the envelope, sitting on the surface at y = 10.
  const bandY = 10;
  const ct = (bandY - CY) / (R * SY);
  const bandR = R * Math.sqrt(1 - ct * ct) + 0.05;
  const band = new THREE.TorusGeometry(bandR, 0.16, 6, 24);
  band.rotateX(Math.PI / 2);
  band.translate(0, bandY, 0);
  b.part(band, YELLOW, { at: [0, 0, 0] });

  // Vent cap on top of the envelope.
  const cap = new THREE.CylinderGeometry(0.7, 0.8, 0.5, 8);
  cap.translate(0, CY + R * SY - 0.25, 0);
  b.part(cap, RIM, { at: [0, 0, 0] });

  // ---- Basket -------------------------------------------------------------
  // Wicker box resting on the ground.
  const basket = new THREE.BoxGeometry(1.4, 1.0, 1.4);
  b.part(basket, WICKER, { at: [0, 0.5, 0] });

  // Horizontal wicker straps, slightly proud of the box.
  for (const y of [0.25, 0.5, 0.75]) {
    const strap = new THREE.BoxGeometry(1.46, 0.07, 1.46);
    b.part(strap, WICKER_DARK, { at: [0, y, 0] });
  }

  // Dark top rim.
  const rim = new THREE.BoxGeometry(1.52, 0.1, 1.52);
  b.part(rim, RIM, { at: [0, 1.02, 0] });

  // Propane tank standing beside the basket.
  const tank = new THREE.CylinderGeometry(0.18, 0.18, 0.9, 10);
  b.part(tank, STEEL, { at: [-1.1, 0.45, 0] });

  // ---- Burner -------------------------------------------------------------
  const burner = new THREE.CylinderGeometry(0.22, 0.22, 0.5, 10);
  b.part(burner, STEEL, { at: [0, 1.3, 0] });

  const flame = new THREE.ConeGeometry(0.22, 0.7, 8);
  b.part(flame, FLAME, { at: [0, 1.9, 0] });

  const core = new THREE.ConeGeometry(0.1, 0.45, 6);
  b.part(core, FLAME_CORE, { at: [0, 1.8, 0] });

  // ---- Ropes --------------------------------------------------------------
  // Four ropes from the basket corners up to the mouth ring.
  const basketHalf = 0.72;
  const ropeR = 0.03;
  const ringR = mouthR;
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    const top = new THREE.Vector3(Math.cos(a) * ringR, mouthY, Math.sin(a) * ringR);
    const bottom = new THREE.Vector3(
      Math.sign(Math.cos(a)) * basketHalf,
      1.0,
      Math.sign(Math.sin(a)) * basketHalf,
    );
    const delta = new THREE.Vector3().subVectors(top, bottom);
    const len = delta.length();
    const dir = delta.clone().normalize();
    const mid = new THREE.Vector3().addVectors(top, bottom).multiplyScalar(0.5);

    const rope = new THREE.CylinderGeometry(ropeR, ropeR, len, 4);
    b.part(rope, ROPE, {
      at: [mid.x, mid.y, mid.z],
      dir: [dir.x, dir.y, dir.z],
    });
  }

  return b.root;
}
