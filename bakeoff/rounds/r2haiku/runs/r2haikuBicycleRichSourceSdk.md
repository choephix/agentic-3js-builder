```ts
import * as THREE from "three";
import { catmull, createBuilder, rng, svg } from "agentic-3js-builder";

export const meta = {
  name: "Mint Dutch city bicycle",
  description:
    "A vintage Dutch city bicycle in mint green: upright cream-gripped bars, a silver bell, a sprung leather saddle, chrome mudguards, a chain guard, a wicker basket of sunflowers and a baguette, and whitewall tyres.",
};

const MINT = "#9fd9bd";
const CHROME = "#c8d0d6";
const CREAM = "#f3ead2";
const LEATHER = "#7b4a2b";
const TYRE = "#1f1f22";
const WHITE = "#f4efe0";
const DARK = "#5a5f63";

export default function bicycle() {
  const b = createBuilder({ name: "bicycle", detail: 1, paintSize: 1024 });

  // Skeleton: a root at the bottom bracket, with the wheels, head, and seat joints hanging from it.
  b.joint("frame", { at: [0, 0.33, 0] });
  b.joint("front", { at: [0, 0.33, 0.62], parent: "frame" });
  b.joint("rear", { at: [0, 0.33, -0.45], parent: "frame" });
  b.joint("head", { at: [0, 0.95, 0.52], parent: "frame" });
  b.joint("seat", { at: [0, 0.84, -0.2], parent: "frame" });

  // Wicker texture for the basket: a woven tan pattern drawn as an SVG.
  let lines = "";
  for (let i = -8; i <= 16; i++) {
    lines += `<path d="M${i * 8} 0 L${i * 8 + 64} 64"/>`;
    lines += `<path d="M${i * 8 + 64} 0 L${i * 8} 64"/>`;
  }
  const wicker = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#c99a5e"/><g stroke="#7a4d22" stroke-width="3.5" fill="none" stroke-linecap="round">${lines}</g></svg>`,
    { size: 256 },
  );

  // Wheels: tyre, whitewalls, hub and crossed chrome spokes.
  const wheel = (z: number, bone: string) => {
    const at: [number, number, number] = [0, 0.33, z];
    const tyre = new THREE.TorusGeometry(0.31, 0.022, 10, 36);
    tyre.rotateY(Math.PI / 2);
    b.part(tyre, TYRE, { at, bone });
    for (const sx of [0.02, -0.02]) {
      const wall = new THREE.TorusGeometry(0.31, 0.008, 8, 36);
      wall.rotateY(Math.PI / 2);
      wall.translate(sx, 0, 0);
      b.part(wall, WHITE, { at, bone });
    }
    const hub = new THREE.CylinderGeometry(0.022, 0.022, 0.1, 10);
    hub.rotateZ(Math.PI / 2);
    b.part(hub, CHROME, { at, bone });
    const point = (r: number, ang: number, x: number) => [x, 0.33 + r * Math.cos(ang), z + r * Math.sin(ang)];
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI * 2) / 16;
      const sx = i % 2 ? 0.014 : -0.014;
      b.rod(point(0.02, a, sx), point(0.285, a + 0.5, -sx), 0.0022, { color: CHROME, bone });
    }
  };
  wheel(0.62, "front");
  wheel(-0.45, "rear");

  // Chrome mudguards: arcs over each wheel, in the wheel plane.
  const fender = (z: number, bone: string) => {
    const f = new THREE.TorusGeometry(0.36, 0.013, 6, 28, Math.PI * 0.9);
    f.rotateZ(Math.PI * 0.05);
    f.rotateY(Math.PI / 2);
    b.part(f, CHROME, { at: [0, 0.33, z], bone });
  };
  fender(0.62, "front");
  fender(-0.45, "rear");

  // Mint frame.
  b.rod([0, 0.33, 0], [0, 0.92, 0.5], 0.02, { color: MINT, bone: "frame" });
  b.rod([0, 0.92, 0.5], [0, 0.85, -0.18], 0.019, { color: MINT, bone: "frame" });
  b.rod([0, 0.33, 0], [0, 0.86, -0.2], 0.018, { color: MINT, bone: "frame" });
  b.rod([0, 0.84, 0.5], [0, 1.0, 0.52], 0.024, { color: MINT, bone: "head" });
  for (const sx of [0.035, -0.035]) {
    b.rod([sx, 0.33, 0], [sx * 0.4, 0.33, -0.45], 0.011, { color: MINT, bone: "frame" });
    b.rod([0, 0.82, -0.19], [sx * 0.5, 0.33, -0.45], 0.009, { color: MINT, bone: "frame" });
    // Fork legs, from the head down to the front hub.
    b.rod([sx, 0.9, 0.5], [sx * 0.6, 0.33, 0.62], 0.014, { color: MINT, bone: "head" });
  }

  // Handlebars: tall, upright, chrome, with cream grips and a silver bell.
  b.rod([0, 1.0, 0.52], [0, 1.15, 0.53], 0.016, { color: CHROME, bone: "head" });
  b.sweep(
    catmull([
      [0.26, 1.21, 0.36],
      [0.18, 1.2, 0.5],
      [0, 1.15, 0.53],
      [-0.18, 1.2, 0.5],
      [-0.26, 1.21, 0.36],
    ]),
    { radius: 0.011, color: CHROME, bone: "head" },
  );
  for (const sx of [0.26, -0.26]) b.rod([sx, 1.21, 0.36], [sx, 1.21, 0.2], 0.018, { color: CREAM, bone: "head" });
  const bell = new THREE.SphereGeometry(0.035, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  b.part(bell, CHROME, { at: [0.1, 1.19, 0.52], bone: "head" });

  // Brown leather saddle on a chrome post, with springs underneath.
  const saddle = new THREE.SphereGeometry(0.1, 14, 8);
  saddle.scale(0.8, 0.25, 1.3);
  b.part(saddle, LEATHER, { at: [0, 0.9, -0.2], bone: "seat" });
  b.rod([0, 0.84, -0.2], [0, 0.88, -0.2], 0.012, { color: CHROME, bone: "seat" });
  for (const sx of [0.03, -0.03]) b.rod([sx, 0.87, -0.14], [0, 0.84, -0.2], 0.004, { color: CHROME, bone: "seat" });

  // Chainring and chain guard.
  const ring = new THREE.CylinderGeometry(0.1, 0.1, 0.006, 20);
  ring.rotateZ(Math.PI / 2);
  b.part(ring, DARK, { at: [0, 0.33, 0], bone: "frame" });
  b.part(new THREE.BoxGeometry(0.012, 0.06, 0.2), MINT, { at: [0.045, 0.43, -0.1], bone: "frame" });

  // Front basket on chrome supports, with the wicker texture.
  const basket = new THREE.CylinderGeometry(0.16, 0.12, 0.2, 16, 1, true);
  b.part(basket, "#ffffff", { at: [0, 0.97, 0.8], bone: "head", texture: wicker });
  const floor = new THREE.CircleGeometry(0.12, 16);
  floor.rotateX(-Math.PI / 2);
  b.part(floor, "#ffffff", { at: [0, 0.87, 0.8], bone: "head", texture: wicker });
  const lip = new THREE.TorusGeometry(0.16, 0.008, 6, 20);
  lip.rotateX(Math.PI / 2);
  b.part(lip, LEATHER, { at: [0, 1.07, 0.8], bone: "head" });
  for (const sx of [0.1, -0.1]) b.rod([0, 0.97, 0.52], [sx, 0.87, 0.8], 0.007, { color: CHROME, bone: "head" });

  // Sunflowers poking out of the basket, with green stems.
  const rnd = rng(7);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + rnd() * 0.5;
    const rad = 0.03 + rnd() * 0.06;
    const x = Math.cos(a) * rad;
    const z = 0.8 + Math.sin(a) * rad * 0.8;
    const y = 1.11 + rnd() * 0.05;
    const dir: [number, number, number] = [x * 3, 1, (z - 0.8) * 3];
    b.rod([x * 0.5, 0.93, 0.8 + (z - 0.8) * 0.5], [x, y, z], 0.005, { color: "#4f8a3a", bone: "head" });
    const petals = new THREE.SphereGeometry(0.05, 14, 8);
    petals.scale(1, 0.2, 1);
    b.part(petals, "#f2b824", { at: [x, y, z], dir, bone: "head" });
    const len = Math.hypot(...dir);
    const centre = new THREE.SphereGeometry(0.02, 10, 6);
    centre.scale(1, 0.4, 1);
    b.part(centre, "#4a2c12", {
      at: [x + (dir[0] / len) * 0.012, y + (dir[1] / len) * 0.012, z + (dir[2] / len) * 0.012],
      dir,
      bone: "head",
    });
  }

  // A baguette resting across the top of the basket, tapered at both ends.
  b.sweep(
    catmull([
      [-0.12, 1.07, 0.72],
      [-0.04, 1.1, 0.78],
      [0.04, 1.1, 0.84],
      [0.12, 1.08, 0.92],
    ]),
    {
      radius: (t: number) => 0.012 + 0.014 * Math.sin(Math.PI * t),
      color: "#d89a4e",
      caps: "round",
      bone: "head",
    },
  );

  return b.root;
}
```