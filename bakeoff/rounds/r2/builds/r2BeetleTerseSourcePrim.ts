import * as THREE from "three";
import { createBuilder, polyline, catmull, countershade } from "../../../../src/index";

export const meta = {
  name: "Stag Beetle",
  description:
    "A male stag beetle with chestnut wing cases, a broad dark pronotum, antlered mandibles, clubbed antennae and six spiny legs, rigged with hinged elytra, jaws and leg chains.",
};

export default function build() {
  const k = 0.0008; // model units (mm) to meters: ~9 cm long with mandibles
  const P = (x: number, y: number, z: number) => [x * k, y * k, z * k] as [number, number, number];
  const b = createBuilder({ name: "stagBeetle" });

  // Skeleton
  b.joint("body", { at: P(0, 16, 0), dir: [0, 0, 1], role: "spine" });
  b.joint("abdomen", { parent: "body", at: P(0, 16, -10), dir: [0, 0, -1], role: "spine" });
  b.joint("thorax", { parent: "body", at: P(0, 17, 15), dir: [0, 0, 1], role: "spine" });
  b.joint("head", { parent: "thorax", at: P(0, 16, 32), dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: P(0, 14.5, 40), dir: [0, 0, 1], role: "jaw" });
  b.joint("elytraL", { parent: "body", at: P(2, 23.5, -1), dir: [0, 0, -1], role: "hinge" });
  b.joint("elytraR", { parent: "body", at: P(-2, 23.5, -1), dir: [0, 0, -1], role: "hinge" });

  const sph = new THREE.SphereGeometry(1, 10, 7);
  const ball = (color: any, at: number[], sc: number[], bone: any, extra: any = {}) =>
    b.part(sph, color, {
      at: P(at[0], at[1], at[2]),
      scale: [sc[0] * k, sc[1] * k, sc[2] * k],
      bone,
      ...extra,
    });

  const DARK = "#2a140c";
  const SHELL = "#35160c";
  const HORN = "#4d1d0d";
  const BLACK = "#120a08";

  // Abdomen + underside
  ball("#2a1a12", [0, 16, -25], [11, 8, 24], "abdomen");
  ball("#3b2a20", [0, 12.5, 8], [9, 4, 15], "body");

  // Elytra (wing cases)
  const elyPaint = countershade("#7d3716", "#4a1c0c", { level: 0.2, soft: 0.7 });
  for (const s of [1, -1]) {
    const bone = s > 0 ? "elytraL" : "elytraR";
    ball(elyPaint, [s * 11.8, 21.5, -26], [12.5, 8.5, 28], bone);
    // rim ridge along the outer edge
    ball("#2d1209", [s * 22, 19.5, -25], [2, 2.2, 25], bone);
  }
  b.part(new THREE.BoxGeometry(1.4 * k, 1.2 * k, 50 * k), "#1c0b06", { at: P(0, 24.2, -26), bone: "elytraL" });
  // scutellum
  b.part(new THREE.ConeGeometry(2.5 * k, 4 * k, 3), "#2a1008", {
    at: P(0, 24, 1.5),
    rotation: [90, 0, 0],
    bone: "body",
  });

  // Pronotum
  ball(SHELL, [0, 18.5, 16], [14, 7, 12.5], "thorax");
  for (const s of [1, -1]) ball("#4a2a18", [s * 12.5, 17.5, 15], [3, 4, 9], "thorax");

  // Head
  ball(DARK, [0, 16.5, 33], [13.5, 6, 9], "head");
  for (const s of [1, -1]) {
    ball(DARK, [s * 11, 16.5, 30.5], [5, 5.5, 5], "head");
    ball(BLACK, [s * 12.5, 18, 36], [2, 2.2, 2.4], "head");
    ball("#5a3b20", [s * 13, 18.6, 36.6], [0.7, 0.7, 0.7], "head");
    ball(HORN, [s * 8, 16.5, 40], [3.8, 3.4, 3.8], "head");
    // palps
    ball("#3a2418", [s * 3, 13.5, 42], [1.2, 1.2, 1.8], "jaw");
  }
  // lower lip + labrum
  b.part(new THREE.BoxGeometry(8 * k, 1.8 * k, 6 * k), "#241008", { at: P(0, 13.6, 41), bone: "jaw" });
  b.part(new THREE.BoxGeometry(7 * k, 1.6 * k, 4 * k), "#3a1a0e", { at: P(0, 17, 41.5), bone: "head" });

  // Mandibles
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const path = catmull([P(s * 8, 16.5, 40), P(s * 12, 17, 50), P(s * 10, 18, 60), P(s * 4, 18, 67)]);
    const ch = b.chain(`mand${side}`, path, {
      parent: "head",
      role: "jaw",
      names: [`mand${side}1`, `mand${side}2`, `mand${side}3`],
    });
    b.sweep(ch, { radius: [3.2 * k, 2.6 * k, 1.8 * k, 0.5 * k], color: HORN });
    b.spike(ch.at(0.5), [-s * 0.9, 0.1, 0.5], 4 * k, 1.1 * k, { color: "#5a2410" });
    b.spike(ch.at(0.72), [-s * 0.9, 0.1, 0.3], 3 * k, 0.9 * k, { color: "#5a2410" });
    b.spike(ch.at(0.38), [-s * 0.3, 1, 0.3], 4.5 * k, 1.1 * k, { color: "#5a2410" });
  }

  // Antennae
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ch = b.chain(`ant${side}`, polyline([P(s * 7, 19, 40), P(s * 12, 24, 47), P(s * 15, 25, 54)]), {
      parent: "head",
      role: "tentacle",
      names: [`ant${side}1`, `ant${side}2`, `ant${side}3`],
    });
    b.sweep(ch, { radius: [0.8 * k, 0.65 * k, 0.5 * k], color: "#1d0e08" });
    const tip = P(s * 15, 25, 54);
    const tipJoint = ch.joints[ch.joints.length - 1];
    for (const d of [
      [s * 0.5, 0.6, 0.8],
      [s * 0.5, 0, 1],
      [s * 0.5, -0.6, 0.8],
    ]) {
      const n = Math.hypot(d[0], d[1], d[2]);
      b.part(sph, "#6b3a1a", {
        at: [tip[0] + (d[0] / n) * 2.2 * k, tip[1] + (d[1] / n) * 2.2 * k, tip[2] + (d[2] / n) * 2.2 * k],
        dir: d,
        scale: [0.9 * k, 3 * k, 0.5 * k],
        bone: tipJoint,
      });
    }
  }

  // Legs
  const legs = [
    { n: "F", z: 22, kn: 8, an: 14, tp: 17, parent: "thorax" },
    { n: "M", z: 5, kn: 2, an: 5, tp: 6, parent: "body" },
    { n: "B", z: -12, kn: -8, an: -16, tp: -20, parent: "body" },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const l of legs) {
      const id = `${l.n}${side}`;
      const path = polyline([
        P(s * 9, 13, l.z),
        P(s * 24, 17, l.z + l.kn),
        P(s * 32, 4, l.z + l.an),
        P(s * 36, 0.6, l.z + l.tp),
      ]);
      const ch = b.chain(`leg${id}`, path, {
        parent: l.parent,
        role: "leg",
        names: [`hip${id}`, `knee${id}`, `ankle${id}`, `toe${id}`],
      });
      b.sweep(ch, { radius: [2.2 * k, 1.9 * k, 1.4 * k, 1 * k, 0.6 * k], color: "#2e160c" });
      ball("#3a1c10", [s * 9, 13, l.z], [3.2, 3.2, 3.2], ch.joints[0]);
      ball("#3a1c10", [s * 24, 17, l.z + l.kn], [2.4, 2.4, 2.4], ch.joints[1]);
      const spikes = l.n === "F" ? [0.5, 0.65, 0.8] : [0.62, 0.8];
      for (const t of spikes) b.spike(ch.at(t), [s, 0.2, 0.3], 3 * k, 0.7 * k, { color: "#1d0e08" });
      b.spike(ch.at(1), [s * 0.5, -0.3, 0.4], 2.5 * k, 0.5 * k, { color: "#120a08" });
    }
  }

  return b.root;
}
