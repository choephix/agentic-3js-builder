import * as THREE from "three";
import { createBuilder, paint, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Barnstormer Biplane",
  description: "Whimsical chubby red biplane with cream wings, striped struts, round engine cowl, spinning propeller and a goggled pilot.",
};

const RED = "#e0392f", CREAM = "#fff1cf", YEL = "#ffc93c", DARK = "#2a2230", TEAL = "#2fb5b0", WOOD = "#b9783f", TIRE = "#26222c", METAL = "#b8bfcc";

export default function build() {
  const b = createBuilder({ name: "biplane", paintSize: 1024 });
  const body = b.joint("body", { at: [0, 1.0, 0] });
  const prop = b.joint("prop", { parent: body, at: [0, 1.0, 1.35], dir: [0, 0, 1], role: "hinge" });
  const rudder = b.joint("rudder", { parent: body, at: [0, 1.1, -2.1], dir: [0, 1, 0], role: "hinge" });
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { bone: body, at, ...o });

  const fusePaint = paint((p) => (Math.abs(p.y - 1.0) < 0.05 && p.z < 1.0 ? YEL : p.z < -1.2 ? CREAM : RED));
  // fuselage
  b.loft(
    [
      { at: [0, 1.0, 1.3], w: 0.7, h: 0.7 },
      { at: [0, 1.0, 0.6], w: 0.8, h: 0.85 },
      { at: [0, 1.0, -0.4], w: 0.65, h: 0.7 },
      { at: [0, 1.05, -1.4], w: 0.35, h: 0.4 },
      { at: [0, 1.1, -2.1], w: 0.12, h: 0.2 },
    ],
    { bone: body, sides: 12, color: fusePaint, name: "fuselage" },
  );
  // cowl & spinner
  b.lathe([[0, 0], [0.38, 0], [0.42, 0.12], [0.36, 0.3], [0, 0.34]], { at: [0, 1.0, 1.25], axis: [0, 0, 1], bone: body, color: METAL, segments: 14 });
  P(new THREE.ConeGeometry(0.1, 0.25, 8), YEL, [0, 1.0, 1.7], { dir: [0, 0, 1] });
  // cockpit and pilot
  P(new THREE.BoxGeometry(0.5, 0.06, 0.55), DARK, [0, 1.42, 0.0]);
  P(new THREE.SphereGeometry(0.2, 8, 6), "#f2c29b", [0, 1.62, 0.0]);
  P(new THREE.SphereGeometry(0.21, 8, 5, 0, 6.28, 0, 1.6), "#7a4a2a", [0, 1.65, 0.0]);
  for (const s of [1, -1]) {
    P(new THREE.TorusGeometry(0.06, 0.02, 5, 8), YEL, [s * 0.09, 1.65, 0.18]);
    glow(P(new THREE.CircleGeometry(0.05, 8), "#9ff0ff", [s * 0.09, 1.65, 0.185]), 0.8);
  }
  const scarf = b.sweep([[0, 1.45, -0.1], [0.1, 1.5, -0.5], [-0.1, 1.55, -0.9], [0, 1.55, -1.3]], [0.05, 0.02], { bone: body, color: TEAL });
  void scarf;

  // wings
  const wingPaint = paint((p) => (Math.abs(p.x) > 2.55 ? RED : Math.abs(p.x) < 0.05 ? RED : CREAM));
  const wing = (y: number, z: number, span: number, ch: number, name: string) => {
    b.extrude([[-ch / 2, 0], [ch / 2 * 0.9, 0.0], [ch / 2, 0.06], [0, 0.12], [-ch / 2, 0.06]].map(([a, c]) => [c, a] as [number, number]), {
      at: [-span / 2, y, z], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.1, color: wingPaint, bone: body, name,
    });
    // extrude outline: x along span uses first coord; rebuild simply with slab instead
  };
  void wing;
  const wingBox = (y: number, z: number, span: number, ch: number, name: string) => {
    P(new THREE.BoxGeometry(span, 0.1, ch), wingPaint, [0, y, z], { name });
    for (const s of [1, -1]) P(new THREE.CylinderGeometry(ch / 2, ch / 2, 0.1, 12), RED, [s * span / 2, y, z], { name: name + "tip" });
  };
  wingBox(1.95, 0.35, 5.2, 0.95, "upperWing");
  wingBox(0.95, 0.45, 4.8, 0.85, "lowerWing");
  // struts
  for (const s of [1, -1]) {
    for (const z of [0.1, 0.65]) {
      b.rod([s * 1.7, 1.0, z + 0.05], [s * 1.7, 1.95, z], 0.035, { bone: body, color: z > 0.3 ? YEL : TEAL });
    }
    b.rod([s * 0.25, 1.4, 0.55], [s * 0.7, 1.92, 0.45], 0.03, { bone: body, color: WOOD });
    b.rod([s * 0.3, 1.0, 0.4], [s * 1.7, 1.95, 0.35], 0.012, { bone: body, color: DARK });
    b.rod([s * 0.3, 1.2, 0.4], [s * 1.7, 0.97, 0.4], 0.012, { bone: body, color: DARK });
  }
  // tail
  P(new THREE.BoxGeometry(1.6, 0.06, 0.5), CREAM, [0, 1.12, -1.85]);
  P(new THREE.BoxGeometry(1.6, 0.02, 0.1), RED, [0, 1.14, -2.05]);
  b.extrude([[0, 0], [0.5, 0], [0.4, 0.6], [0.05, 0.7]].map(([a, c]) => [a, c] as [number, number]), {
    at: [0, 1.1, -2.0], x: [0, 0, -1], thickness: 0.06, color: RED, bone: rudder, name: "rudderFin",
  });
  P(new THREE.BoxGeometry(0.04, 0.5, 0.4), YEL, [0, 1.4, -2.2], { name: "fin" });

  // propeller
  for (const a of [0, 180]) {
    b.part(new THREE.BoxGeometry(0.16, 1.3, 0.04), WOOD, { bone: prop, at: [0, 1.0, 1.55], rotation: [0, 0, a + 8] });
  }
  b.part(new THREE.SphereGeometry(0.1, 6, 5), YEL, { bone: prop, at: [0, 1.0, 1.58] });

  // landing gear
  for (const s of [1, -1]) {
    const wy = 0.38;
    b.part(new THREE.CylinderGeometry(0.38, 0.38, 0.2, 14), TIRE, { bone: body, at: [s * 0.8, wy, 0.7], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.22, 10), YEL, { bone: body, at: [s * 0.8, wy, 0.7], dir: [1, 0, 0] });
    b.rod([s * 0.3, 0.8, 0.7], [s * 0.8, wy, 0.7], 0.04, { bone: body, color: DARK });
    b.rod([s * 0.2, 0.75, 0.5], [s * 0.8, wy, 0.7], 0.03, { bone: body, color: DARK });
  }
  b.rod([-0.8, 0.38, 0.7], [0.8, 0.38, 0.7], 0.03, { bone: body, color: DARK });
  P(new THREE.SphereGeometry(0.08, 6, 5), TIRE, [0, 0.82, -1.9]);
  b.rod([0, 1.0, -1.7], [0, 0.82, -1.95], 0.025, { bone: body, color: DARK });
  // exhaust and lamp
  for (const s of [1, -1]) b.rod([s * 0.4, 0.85, 1.1], [s * 0.45, 0.8, 0.5], 0.04, { bone: body, color: METAL });
  glow(P(new THREE.SphereGeometry(0.06, 6, 5), "#fff3b0", [0.5, 1.9, 0.95]), 1.4);

  const num = svg(`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="${CREAM}" stroke="${DARK}" stroke-width="6"/><text x="50" y="68" font-size="52" font-weight="900" text-anchor="middle" fill="${RED}">7</text></svg>`, { size: 128 });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { bone: body, at: [s * 0.42, 1.05, -0.4], dir: [s, 0, 0], axis: "z", texture: num });
  return b.root;
}
