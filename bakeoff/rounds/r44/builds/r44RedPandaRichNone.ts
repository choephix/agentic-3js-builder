import * as THREE from "three";
import { createBuilder, rng, limb, noise, paint, stripes } from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "Red panda on mossy stone",
  description: "Genshin-style cel-shaded red panda standing on a mossy boulder, rigged with spine, legs, ringed tail and jaw.",
};

const STONE_TOP = 0.25;

export default function build() {
  const b = createBuilder({ name: "redpanda" });
  const R = rng(5);

  // palette
  const RUST = "#e0622a";
  const DARK = "#3a1e1c";
  const CREAM = "#fff1d6";
  const MOSS = "#7cc04a";
  const MOSS2 = "#4f9a3c";
  const STONE = "#8a8f9c";

  const coat = cel(furEdge(RUST, DARK, { level: -0.15, teeth: 0.22, period: 0.03, ink: INK }));
  const limbPaint = cel(DARK);
  const tailPaint = cel(stripes(RUST, "#8c3418", { size: 0.075, axis: "z", width: 0.5, wobble: 0.1 }));
  const creamPaint = cel(CREAM);

  // skeleton
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.46, -0.2], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", [[0, 0.46, -0.2], [0, 0.48, 0], [0, 0.49, 0.2]], {
    parent: hips, count: 3, role: "spine",
  });
  const neck = b.chain("neck", [[0, 0.49, 0.2], [0, 0.58, 0.3]], { parent: spine.joints[2], names: ["neck"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 0.58, 0.3], dir: [0, 0, 1], role: "head" });
  const C: [number, number, number] = [0, 0.6, 0.38];
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.55, 0.37], aim: [0, 0.54, 0.46], role: "jaw" });

  // stone
  b.lathe(
    [[0, 0], [0.4, 0], [0.43, 0.08], [0.37, 0.2], [0.32, STONE_TOP], [0, STONE_TOP]],
    {
      at: [0, 0, 0], bone: root, segments: 9,
      color: paint((p, n) => {
        const up = n.y > 0.4 + 0.5 * (noise(p, 0.12, 3) - 0.5);
        if (up) return noise(p, 0.07, 9) > 0.5 ? MOSS : MOSS2;
        return noise(p, 0.1, 4) > 0.6 ? "#6f7684" : STONE;
      }),
    },
  );
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + R() * 0.4;
    const r = 0.3 + R() * 0.06;
    b.part(new THREE.SphereGeometry(0.05 + R() * 0.03, 6, 4), i % 2 ? MOSS : MOSS2, {
      bone: root, at: [Math.sin(a) * r, STONE_TOP + 0.005, Math.cos(a) * r], scale: [1, 0.5, 1],
    });
  }

  // body
  b.sweep(spine, () => [0.125, 0.11], { color: coat });
  b.part(new THREE.SphereGeometry(1, 10, 8), coat, { bone: hips, at: [0, 0.46, -0.22], scale: [0.14, 0.12, 0.13] });
  b.sweep(neck, 0.08, { color: coat });
  // cream chest bib
  b.part(new THREE.SphereGeometry(1, 8, 6), creamPaint, { bone: spine.joints[2], at: [0, 0.46, 0.27], scale: [0.07, 0.07, 0.04] });

  // head
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), cel(
    paint((p) => {
      const dx = Math.abs(p.x), dz = p.z - C[2], dy = p.y - C[1];
      if (dz > 0.05 && dy < 0.03) return CREAM;
      if (dx > 0.055 && dy < 0.0 && dz > -0.03) return CREAM;
      if (dz > 0.03 && dy > 0.045 && dx < 0.03) return "#f4c9a0";
      return RUST;
    }),
  ), { bone: head, at: C, scale: [0.1, 0.085, 0.09] });
  const skin = b.surface(skull);
  const EYE = animeEye({ iris: "#3fbf8a", blush: false, brow: false, size: 256 });
  for (const s of [1, -1]) {
    const hit = skin.around(C).at(s * 36, 6);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.042, 0.058], mirror: s > 0, bone: head });
    // brow dots
    b.part(new THREE.SphereGeometry(0.012, 6, 4), CREAM, { bone: head, at: [s * 0.04, C[1] + 0.05, C[2] + 0.062], scale: [1.2, 0.8, 0.8] });
    // ears
    b.part(new THREE.SphereGeometry(1, 8, 6), cel(RUST), {
      bone: head, at: [s * 0.068, C[1] + 0.078, C[2] - 0.015], scale: [0.04, 0.045, 0.02], rotation: [-15, s * 20, -s * 25],
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), cel(CREAM), {
      bone: head, at: [s * 0.07, C[1] + 0.077, C[2] - 0.003], scale: [0.03, 0.034, 0.012], rotation: [-15, s * 20, -s * 25],
    });
    // cheek ruffs
    for (let i = 0; i < 4; i++) {
      b.spike([s * 0.075, C[1] - 0.01 - i * 0.012, C[2] + 0.005 - i * 0.006], [s * 1, -0.25 - i * 0.2, 0.25], 0.05 - i * 0.004, 0.016, {
        color: CREAM, bone: head, sides: 5,
      } as never);
    }
  }
  // muzzle, nose, lower jaw
  b.part(new THREE.SphereGeometry(1, 10, 8), creamPaint, { bone: head, at: [0, C[1] - 0.025, C[2] + 0.075], scale: [0.04, 0.03, 0.04] });
  b.part(new THREE.SphereGeometry(0.013, 6, 5), INK, { bone: head, at: [0, C[1] - 0.012, C[2] + 0.112], scale: [1.2, 0.9, 1] });
  b.part(new THREE.SphereGeometry(1, 8, 6), creamPaint, { bone: jaw, at: [0, C[1] - 0.052, C[2] + 0.07], scale: [0.03, 0.014, 0.035] });

  // legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fr = limb([s * 0.09, 0.45, 0.16], [s * 0.1, STONE_TOP + 0.03, 0.2], [0.11, 0.12], [[0, 0, -1]]);
    const front = b.chain(`armF${side}`, fr, {
      parent: spine.joints[2], names: [`shoulder${side}`, `elbow${side}`, `hand${side}`], role: "arm",
    });
    b.sweep(front, [0.05, 0.036], { color: limbPaint });
    const hd = limb([s * 0.09, 0.45, -0.22], [s * 0.1, STONE_TOP + 0.03, -0.27], [0.11, 0.12], [[0, 0, 1]]);
    const hind = b.chain(`legH${side}`, hd, {
      parent: hips, names: [`hip${side}`, `knee${side}`, `foot${side}`], role: "leg",
    });
    b.sweep(hind, [0.058, 0.036], { color: limbPaint });
    for (const [chain, z] of [[front, 0.2], [hind, -0.27]] as const) {
      const bone = chain.tip!;
      b.part(new THREE.SphereGeometry(1, 8, 6), limbPaint, {
        bone, at: [s * 0.1, STONE_TOP + 0.03, z + 0.015], scale: [0.04, 0.03, 0.05],
      });
      for (const k of [-1, 0, 1]) {
        b.part(new THREE.SphereGeometry(0.011, 5, 4), "#1c0f10", {
          bone, at: [s * 0.1 + k * 0.02, STONE_TOP + 0.022, z + 0.06 - Math.abs(k) * 0.01],
        });
      }
    }
  }

  // tail
  const tail = b.chain("tail", [[0, 0.46, -0.2], [0, 0.5, -0.5], [0, 0.5, -0.75], [0, 0.42, -1.0]], {
    parent: hips, count: 4, role: "tail",
  });
  b.sweep(tail, (t) => 0.055 + 0.04 * Math.sin(Math.PI * Math.min(t * 1.1, 1)) , {
    color: tailPaint,
  });

  return b.root;
}
