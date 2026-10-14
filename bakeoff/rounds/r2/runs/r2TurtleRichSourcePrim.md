```ts
import * as THREE from "three";
import { createBuilder, paint, patches, mottle, countershade } from "agentic-3js-builder";

export const meta = {
  name: "Green Sea Turtle",
  description: "A green sea turtle with a heart-shaped plated shell, wide front flippers and a remora riding under its shell.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "seaTurtle" });
  const Y = 0.2;
  b.joint("root", { at: [0, Y, 0] });

  // ---- Shell: one smooth heart-shaped body, painted plates on top, pale belly below
  const scutes = patches("#4a3318", ["#6b6b2e", "#a8742c", "#7d7a35", "#94622a"], { size: 0.17, gap: 0.12, seed: 4 });
  const belly = mottle("#f1e08a", "#d9c46a", { size: 0.1 });
  const shellPaint = paint((p, n) => (n.y < -0.3 ? belly : n.y < 0.2 ? "#b9a763" : scutes));
  const st = (z: number, w: number, h: number) => ({ at: [0, Y + 0.02, z] as [number, number, number], w, h });
  b.loft(
    [st(0.46, 0.3, 0.16), st(0.35, 0.72, 0.22), st(0.15, 0.92, 0.25), st(-0.05, 0.88, 0.25), st(-0.25, 0.68, 0.23), st(-0.42, 0.4, 0.19), st(-0.56, 0.12, 0.12)],
    { color: shellPaint, bone: "root", name: "shell", sides: 12 },
  );

  // ---- Neck and head
  const skin = countershade(mottle("#5b5a2b", "#7a5a2a", { size: 0.07, seed: 2 }), "#eadf9f");
  const neck = b.chain("neck", [[0, Y, 0.42], [0, Y + 0.01, 0.6], [0, Y + 0.03, 0.76]], {
    parent: "root", names: ["neck1", "neck2", "head"], role: "neck", up: [0, 1, 0],
  });
  b.sweep(neck, 0.075, { color: skin, name: "neck" });
  b.joint("jaw", { parent: "head", at: [0, Y + 0.0, 0.82], dir: [0, 0, 1], role: "jaw" });

  const headPaint = paint((p, n) => (n.y < -0.3 ? "#efe6b8" : patches("#efe6b8", ["#6e6b34", "#7d6a30"], { size: 0.045, gap: 0.18 }).at(p, n)));
  b.part(new THREE.SphereGeometry(0.1, 10, 8), headPaint, { at: [0, Y + 0.04, 0.82], scale: [0.95, 0.85, 1.25], bone: "head", name: "skull" });
  b.part(new THREE.BoxGeometry(0.09, 0.03, 0.07), "#8a7a4a", { at: [0, Y + 0.03, 0.93], bone: "head", name: "upperBeak" });
  b.part(new THREE.ConeGeometry(0.018, 0.03, 5), "#6f6238", { at: [0, Y + 0.005, 0.965], bone: "head", name: "beakHook" });
  b.part(new THREE.BoxGeometry(0.08, 0.022, 0.075), "#a8996a", { at: [0, Y - 0.002, 0.9], bone: "jaw", name: "lowerBeak" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.022, 8, 6), "#2a1a10", { at: [s * 0.085, Y + 0.075, 0.86], bone: "head", name: "eye" });
    b.part(new THREE.SphereGeometry(0.007, 5, 4), "#ffffff", { at: [s * 0.098, Y + 0.085, 0.875], bone: "head", name: "glint" });
    b.part(new THREE.SphereGeometry(0.027, 8, 4), "#d9cf94", { at: [s * 0.085, Y + 0.09, 0.855], scale: [1, 0.45, 1.1], bone: "head", name: "lid" });
    b.part(new THREE.SphereGeometry(0.006, 4, 3), "#3a2a18", { at: [s * 0.02, Y + 0.05, 0.945], bone: "head", name: "nostril" });
  }

  // ---- Flippers
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const front = b.chain(`arm${side}`, [[s * 0.38, Y - 0.03, 0.28], [s * 0.7, Y - 0.07, 0.2], [s * 1.0, Y - 0.1, 0.04], [s * 1.28, Y - 0.1, -0.12]], {
      parent: "root", names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm", up: [0, 1, 0],
    });
    b.sweep(front, (t) => [0.012 + 0.1 * Math.pow(1 - t, 0.7) * (0.6 + 0.4 * Math.sin(t * 3)), 0.014 + 0.02 * (1 - t)], { color: skin, name: `flipper${side}` });
    const rear = b.chain(`leg${side}`, [[s * 0.25, Y - 0.02, -0.38], [s * 0.4, Y - 0.05, -0.52], [s * 0.55, Y - 0.07, -0.68]], {
      parent: "root", names: [`hip${side}`, `knee${side}`], role: "leg", up: [0, 1, 0],
    });
    b.sweep(rear, (t) => [0.02 + 0.055 * Math.pow(1 - t, 0.8), 0.012 + 0.014 * (1 - t)], { color: skin, name: `rearFlipper${side}` });
  }
  const tail = b.chain("tail", [[0, Y + 0.02, -0.56], [0, Y, -0.67], [0, Y - 0.02, -0.78]], {
    parent: "root", names: ["tail1", "tail2"], role: "tail", up: [0, 1, 0],
  });
  b.sweep(tail, [0.035, 0.008], { color: "#7a6a3a", name: "tail" });

  // ---- Remora under the shell
  b.joint("remora", { parent: "root", at: [0, 0.05, 0], dir: [0, 0, 1] });
  b.loft(
    [
      { at: [0, 0.05, 0.16], w: 0.03, h: 0.05 }, { at: [0, 0.05, 0.08], w: 0.06, h: 0.07 },
      { at: [0, 0.05, -0.05], w: 0.055, h: 0.07 }, { at: [0, 0.05, -0.16], w: 0.03, h: 0.045 },
      { at: [0, 0.05, -0.21], w: 0.014, h: 0.04 },
    ],
    { color: countershade("#3f4650", "#cfd3d0"), bone: "remora", name: "remoraBody", sides: 8 },
  );
  b.part(new THREE.BoxGeometry(0.07, 0.012, 0.2), paint((p) => (Math.floor(p.z / 0.014) % 2 ? "#2e343b" : "#aab2b8")), { at: [0, 0.095, 0.02], bone: "remora", name: "sucker" });
  b.extrude([[0, 0], [0.07, 0.05], [0.05, 0], [0.07, -0.05]], { at: [0, 0.05, -0.2], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.008, color: "#3f4650", bone: "remora", name: "caudal" });
  for (const s of [1, -1]) {
    b.extrude([[0, 0.02], [0.06, -0.01], [0.05, -0.03], [0, -0.01]], { at: [s * 0.03, 0.035, 0.07], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.006, color: "#5a626b", bone: "remora", name: "pectoral" });
    b.part(new THREE.SphereGeometry(0.008, 5, 4), "#101010", { at: [s * 0.025, 0.06, 0.12], bone: "remora", name: "remoraEye" });
  }

  return b.root;
}
```