```ts
import * as THREE from "three";
import { createBuilder, limb, catmull, rng, mottle, countershade, grain } from "agentic-3js-builder";

export const meta = {
  name: "Moss Stone Fawn Spirit",
  description: "A small forest spirit, part deer and part mossy river stone, with wooden legs, a pale mask face, flowering antlers and fireflies.",
};

export default function build() {
  const b = createBuilder({ name: "mossFawn" });
  const R = rng(11);

  const MOSS1 = "#5c9a3c", MOSS2 = "#7cbc4e";
  const GREY1 = "#7d8587", GREY2 = "#9aa09f";
  const HOOF = "#2f2a26", MASK = "#eadfc2", MASKD = "#3d3a2c";
  const ANTLER = "#8a6a45", WHITE = "#f6f2e6", YELLOW = "#f2c94c", LEAF = "#5fa84a";
  const GLOW = "#6dff7a", FLY = "#e4ff6a";

  const stone = mottle(GREY1, GREY2, { size: 0.08, seed: 2 });
  const coat = countershade(mottle(MOSS1, MOSS2, { size: 0.1, seed: 3 }), stone, { level: 0.2, soft: 0.2 });
  const wood = grain("#8c6a43", "#a98558", { size: 0.02, axis: "y" });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.62, -0.3], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.62, -0.3], [0, 0.65, 0], [0, 0.67, 0.3]]), {
    parent: hips, names: ["spine1", "spine2"], role: "spine",
  });
  const chest = spine.joints[1];

  // Body
  const body = b.sweep(spine, (t) => [0.19 + 0.03 * Math.sin(t * 3.1), 0.2 + 0.02 * Math.sin(t * 3.1)], {
    color: coat, sides: 10,
  });

  // Neck
  const neck = b.chain("neck", catmull([[0, 0.72, 0.3], [0, 0.86, 0.4], [0, 1.0, 0.5]]), {
    parent: chest, names: ["neck1", "neck2"], role: "neck",
  });
  b.sweep(neck, [0.095, 0.06], { color: wood, sides: 8 });
  // moss collar on neck
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.05, 6, 4), i % 2 ? MOSS1 : MOSS2, {
      at: [Math.cos(a) * 0.09, 0.76 + Math.sin(a) * 0.03, 0.34 + Math.sin(a) * 0.05], bone: neck.joints[0], flat: true,
      scale: [1, 0.7, 1],
    });
  }

  // Head
  const head = b.joint("head", { parent: neck.joints[1], at: neck.at(1).at, dir: [0, -0.25, 1], role: "head" });
  b.frustumBox(head.local({ forward: -0.05 }), head.local({ forward: 0.12 }), [0.15, 0.15], [0.15, 0.14], { bone: head, color: MASK });
  b.frustumBox(head.local({ forward: 0.1, down: 0.005 }), head.local({ forward: 0.29, down: 0.03 }), [0.13, 0.11], [0.08, 0.07], { bone: head, color: MASK });
  b.part(new THREE.BoxGeometry(0.06, 0.035, 0.04), MASKD, { bone: head, at: head.local({ forward: 0.3, down: 0.01 }), flat: true });
  const jaw = b.joint("jaw", {
    parent: head, at: head.local({ forward: 0.05, down: 0.055 }), aim: head.local({ forward: 0.28, down: 0.075 }), role: "jaw",
  });
  b.frustumBox(head.local({ forward: 0.06, down: 0.06 }), head.local({ forward: 0.27, down: 0.07 }), [0.1, 0.035], [0.06, 0.03], { bone: jaw, color: "#cdbf9c" });
  // mask markings
  b.part(new THREE.BoxGeometry(0.02, 0.1, 0.012), MASKD, { bone: head, at: head.local({ forward: 0.0, up: 0.075 }), flat: true });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 6, 5), "#1f2a1c", { bone: head, at: head.local({ left: s * 0.066, up: 0.035, forward: 0.07 }) });
    b.part(new THREE.SphereGeometry(0.022, 6, 5), GLOW, { bone: head, at: head.local({ left: s * 0.07, up: 0.037, forward: 0.075 }) });
    b.part(new THREE.BoxGeometry(0.1, 0.012, 0.012), MASKD, {
      bone: head, at: head.local({ left: s * 0.05, up: 0.075, forward: 0.07 }), rotation: [0, 0, s * 12], flat: true,
    });
    b.part(new THREE.BoxGeometry(0.01, 0.01, 0.1), MASKD, { bone: head, at: head.local({ left: s * 0.062, down: 0.03, forward: 0.14 }), flat: true });
    // ears
    b.part(new THREE.SphereGeometry(0.05, 6, 5), MASK, {
      bone: head, at: head.local({ left: s * 0.11, up: 0.05, back: 0.03 }), scale: [0.3, 1.5, 0.7], rotation: [0, 0, s * -50], flat: true,
    });
  }
  // moss tuft on the head
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.SphereGeometry(0.04, 6, 4), i % 2 ? MOSS2 : MOSS1, {
      bone: head, at: head.local({ left: (i - 2) * 0.025, up: 0.08, back: 0.02 + (i % 2) * 0.02 }), flat: true,
    });
  }

  // Legs
  const legSpecs: [string, number, number, any[], any][] = [
    ["F", 0.24, 0.0, [[0, 0, -1], [0, 0, 1]], chest],
    ["H", -0.25, -0.02, [[0, 0, 1], [0, 0, -1]], hips],
  ];
  for (const [fh, z, dz, bends, parent] of legSpecs) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const hip: [number, number, number] = [s * 0.14, 0.56, z];
      const foot: [number, number, number] = [s * 0.14, 0.07, z + dz + 0.03];
      const pts = limb(hip, foot, [0.2, 0.2, 0.15], bends);
      const leg = b.chain(`leg${fh}${side}`, pts, {
        parent, names: [`hip${fh}${side}`, `knee${fh}${side}`, `hock${fh}${side}`, `foot${fh}${side}`], role: "leg",
      });
      b.sweep(leg, [0.05, 0.026], { color: wood, sides: 7 });
      b.part(new THREE.CylinderGeometry(0.03, 0.042, 0.07, 6), HOOF, { bone: leg.tip!, at: [foot[0], 0.035, foot[2]], flat: true });
      // stone haunch
      b.part(new THREE.SphereGeometry(0.115, 8, 6), stone, { bone: leg.joints[0], at: [s * 0.15, 0.55, z], flat: true });
      // moss knee tuft
      b.part(new THREE.SphereGeometry(0.035, 6, 4), MOSS1, { bone: leg.joints[1], at: [pts[1].x, pts[1].y, pts[1].z], flat: true });
    }
  }

  // Tail
  const tail = b.chain("tail", catmull([[0, 0.68, -0.48], [0, 0.72, -0.6], [0, 0.68, -0.72]]), {
    parent: hips, names: ["tail1", "tail2"], role: "tail",
  });
  b.sweep(tail, [0.05, 0.015], { color: MOSS2, sides: 6 });

  // Moss lumps and stones on the back
  const skin = b.surface(body);
  const hits = skin.scatter(28, { rng: rng(5), minDist: 0.09, filter: (h) => h.n.y > 0.25 });
  hits.forEach((h, i) => {
    const k = 0.6 + R() * 0.7;
    b.stick(new THREE.SphereGeometry(0.06, 6, 4), i % 3 === 0 ? MOSS2 : MOSS1, h, { embed: 0.4, scale: [k, 0.6 * k, k], flat: true });
  });
  const sh = skin.scatter(6, { rng: rng(9), minDist: 0.2, filter: (h) => Math.abs(h.n.x) > 0.6 });
  for (const h of sh) b.stick(new THREE.DodecahedronGeometry(0.05, 0), GREY2, h, { embed: 0.4, flat: true });
  for (const h of skin.scatter(5, { rng: rng(21), minDist: 0.2, filter: (h) => h.n.y > 0.5 })) {
    b.stick(new THREE.SphereGeometry(0.014, 5, 4), WHITE, h, { embed: -0.2 });
  }

  // Antlers with flowers and leaves
  const h0 = head.at;
  const flower = (p: number[], size: number) => {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(size * 0.55, 5, 4), WHITE, {
        bone: head, at: [p[0] + Math.cos(a) * size, p[1] + size * 0.3, p[2] + Math.sin(a) * size], flat: true,
      });
    }
    b.part(new THREE.SphereGeometry(size * 0.5, 5, 4), YELLOW, { bone: head, at: [p[0], p[1] + size * 0.5, p[2]], flat: true });
  };
  const leaf = (p: number[], rot: number) => {
    b.part(new THREE.SphereGeometry(0.03, 6, 4), LEAF, {
      bone: head, at: p, scale: [0.6, 0.15, 1.2], rotation: [R() * 40 - 20, rot, R() * 50 - 25], flat: true,
    });
  };
  for (const s of [1, -1]) {
    const P = (x: number, y: number, z: number) => [h0.x + s * x, h0.y + y, h0.z + z];
    const main = [P(0.05, 0.08, -0.02), P(0.1, 0.25, -0.08), P(0.14, 0.42, -0.04), P(0.2, 0.58, 0.04)];
    b.sweep(catmull(main), [0.024, 0.01], { bone: head, color: ANTLER, sides: 6, caps: { start: "flat", end: "point" } });
    const branches = [
      [main[1], P(0.17, 0.33, 0.04), P(0.24, 0.4, 0.12)],
      [main[2], P(0.07, 0.5, 0.04), P(0.04, 0.6, 0.1)],
      [main[2], P(0.24, 0.5, -0.08), P(0.32, 0.56, -0.06)],
      [main[0], P(0.12, 0.14, -0.14), P(0.18, 0.2, -0.24)],
    ];
    for (const br of branches) {
      b.sweep(catmull(br), [0.013, 0.005], { bone: head, color: ANTLER, sides: 5, caps: { start: "flat", end: "point" } });
      flower(br[2], 0.016);
      leaf([br[1][0], br[1][1] + 0.01, br[1][2]], R() * 180);
    }
    flower(main[3], 0.02);
    flower(main[2], 0.014);
    leaf(P(0.17, 0.5, 0.02), 40);
    leaf(P(0.12, 0.34, -0.07), 120);
  }

  // Fireflies circling the head
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    const r = 0.38 + (i % 2) * 0.1;
    b.part(new THREE.OctahedronGeometry(0.016, 0), FLY, {
      bone: head, at: [h0.x + Math.cos(a) * r, h0.y + 0.15 + (i % 3) * 0.12, h0.z + 0.1 + Math.sin(a) * r], flat: true,
    });
  }

  return b.root;
}
```