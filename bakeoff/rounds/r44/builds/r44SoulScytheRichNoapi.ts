import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, catmull, mix, noise, paint, smoothstep, svg } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A tall scythe with a dragon-skull collar, a bone blade edged in glowing spectral teal, gold fittings, rune plates, a caged soul flame and a trailing silk ribbon. Painted fantasy look.",
};

const GOLD = "#e0a83a";
const GOLD_D = "#8a5a1c";
const TEAL = "#3ff2e0";
const TEAL_L = "#c9fff6";
const NAVY = "#17284a";
const CLOTH_A = "#1f6f86";

const BONE = paint((p, n) => {
  const m = noise(p, 0.06, 3);
  let c = mix("#d9c9a2", "#f6ecd2", m);
  c = mix(c, "#8a7650", smoothstep(0.2, -0.9, n.y) * 0.5);
  if (noise(p, 0.02, 8) > 0.75) c = mix(c, "#a58f62", 0.4);
  return c;
});
const BONE_D = paint((p, n) => mix("#a8946a", "#d8c89c", noise(p, 0.05, 5) * (0.6 + 0.4 * n.y)));
const WRAP = paint((_p, _n, s) => {
  const f = (s[0] / 0.018) % 1;
  return f < 0.18 ? GOLD_D : f < 0.6 ? "#12494f" : "#1c6a70";
});
const SHAFT = paint((p, n) => mix("#2a3550", "#4b5f8a", noise(p, 0.1, 2) * 0.7 + 0.3 * smoothstep(-0.5, 1, n.y)));
const RIBBON = paint((_p, _n, s) => (s[0] < 0.05 ? GOLD : s[0] < 0.75 ? CLOTH_A : "#0f3d52"));

function rune(d: string) {
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="${d}" stroke="#12b8c8" stroke-width="4.4"/><path d="${d}" stroke="#d8fffa" stroke-width="1.8"/></g></svg>`,
    { size: 192 },
  );
}
const RUNES = [
  rune("M12 3 L12 21 M12 7 L18 12 M12 12 L6 17"),
  rune("M5 4 L19 12 L5 20 M19 4 L19 20"),
  rune("M12 3 L5 12 L12 21 L19 12 Z M12 8 L12 16"),
];

export default function build() {
  const b = createBuilder({ name: "dragonboneScythe", paintSize: 1024 });
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });
  type O = NonNullable<Parameters<typeof b.part>[2]>;
  const P = (g: THREE.BufferGeometry, color: Parameters<typeof b.part>[1], at: [number, number, number], o: O = {}) =>
    b.part(g, color, { bone: root, at, ...o });
  const lathe = (outline: OutlinePoint[], at: [number, number, number], color: Parameters<typeof b.part>[1], seg = 10) =>
    b.lathe(outline, { at, segments: seg, color, bone: root });

  // ---------------- shaft
  const TOP = 1.78;
  b.spike([0, 0.22, 0], [0, -1, 0], 0.22, 0.032, { color: GOLD, bone: root, sides: 6 });
  lathe([[0, 0], [0.04, 0.0], [0.045, 0.03], [0.034, 0.06], [0, 0.06]], [0, 0.2, 0], GOLD_D, 8);
  b.sweep(catmull([[0, 0.22, 0], [0, 1.0, 0], [0, TOP, 0]]), [0.026, 0.024, 0.024, 0.026], {
    bone: root, sides: 8, color: SHAFT, caps: "flat", name: "shaft",
  });
  // vertebra rings of bone
  for (let i = 0; i < 9; i++) {
    const y = 0.38 + i * 0.075;
    if (y > 0.62 && y < 1.12) continue;
    lathe([[0.024, -0.02], [0.04, -0.012], [0.042, 0.012], [0.024, 0.02]], [0, y, 0], BONE_D, 8);
  }
  // grip wrap and gold ends
  lathe([[0.024, 0], [0.034, 0], [0.034, 0.44], [0.024, 0.44]], [0, 0.66, 0], WRAP, 10);
  for (const y of [0.62, 1.1, 1.14]) {
    lathe([[0.03, 0], [0.048, 0.004], [0.048, 0.03], [0.03, 0.034]], [0, y, 0], GOLD, 8);
  }
  // rib-claws gripping the shaft below the head
  for (const s of [1, -1]) {
    b.sweep(catmull([[s * 0.03, 1.12, 0], [s * 0.1, 1.2, 0.02], [s * 0.085, 1.34, 0.01], [s * 0.03, 1.4, 0]]), [0.012, 0.006], {
      bone: root, sides: 5, color: BONE, caps: "point", name: "rib",
    });
  }

  // ---------------- dragon skull collar (faces +Z)
  const SY = 1.56;
  P(new THREE.BoxGeometry(0.17, 0.13, 0.2), BONE, [0, SY, 0.05], { name: "cranium" });
  P(new THREE.BoxGeometry(0.19, 0.03, 0.12), BONE_D, [0, SY + 0.075, 0.07], { name: "browRidge" });
  P(new THREE.BoxGeometry(0.1, 0.07, 0.22), BONE, [0, SY - 0.025, 0.26], { rotation: [6, 0, 0], name: "upperJaw" });
  P(new THREE.BoxGeometry(0.085, 0.03, 0.2), BONE_D, [0, SY - 0.1, 0.22], { rotation: [-14, 0, 0], name: "lowerJaw" });
  const teeth: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 5; i++)
    for (const s of [1, -1]) {
      teeth.push(new THREE.ConeGeometry(0.008, 0.035, 4).rotateX(Math.PI).translate(s * 0.042, SY - 0.07, 0.17 + i * 0.045));
      teeth.push(new THREE.ConeGeometry(0.007, 0.03, 4).translate(s * 0.036, SY - 0.085, 0.16 + i * 0.04));
    }
  b.part(mergeGeometries(teeth)!, "#fff6df", { bone: root, at: [0, 0, 0], name: "teeth" });
  for (const s of [1, -1]) {
    glow(P(new THREE.SphereGeometry(0.02, 6, 4), TEAL, [s * 0.052, SY + 0.02, 0.15], { name: "eye" }), 1.6);
    P(new THREE.BoxGeometry(0.03, 0.012, 0.03), "#2a2418", [s * 0.025, SY + 0.02, 0.37], { name: "nostril" });
    b.sweep(catmull([[s * 0.075, SY + 0.05, 0.0], [s * 0.14, SY + 0.09, -0.1], [s * 0.19, SY + 0.2, -0.2]]), [0.026, 0.004], {
      bone: root, sides: 5, color: BONE, caps: "point", name: "horn",
    });
    b.sweep(catmull([[s * 0.085, SY - 0.02, 0.0], [s * 0.17, SY - 0.03, -0.08], [s * 0.2, SY - 0.1, -0.15]]), [0.014, 0.003], {
      bone: root, sides: 5, color: BONE_D, caps: "point", name: "hornLow",
    });
  }
  glow(P(new THREE.OctahedronGeometry(0.022, 0), TEAL, [0, SY + 0.095, 0.1], { scale: [0.8, 1.4, 0.6], name: "foreheadGem" }), 1.6);
  // neck spikes behind skull
  for (let i = 0; i < 3; i++)
    P(new THREE.ConeGeometry(0.018 - i * 0.003, 0.09, 4), BONE_D, [0, SY + 0.1 - i * 0.07, -0.075 - i * 0.012], { rotation: [-120, 0, 0], name: "spine" });

  // ---------------- blade socket
  lathe([[0.03, 0], [0.05, 0.004], [0.055, 0.04], [0.04, 0.07], [0.028, 0.07]], [0, TOP - 0.05, 0], GOLD, 8);
  lathe([[0.03, 0], [0.058, 0.0], [0.058, 0.012], [0.03, 0.012]], [0, TOP + 0.015, 0], GOLD_D, 8);

  // ---------------- blade (outline: x = world Z, y = world up)
  const blade: OutlinePoint[] = [
    [-0.12, 0.05], [0.1, 0.13], [0.4, 0.24], [0.75, 0.2], [1.0, 0.05],
    [1.12, -0.2, "sharp"], [0.92, -0.06], [0.7, 0.06], [0.4, 0.1], [0.1, 0.05], [-0.12, -0.04],
  ];
  b.extrude(blade, { at: [0, TOP, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.03, bevel: 0.008, smoothing: 1, color: BONE, bone: root, name: "blade" });
  const edge: OutlinePoint[] = [
    [0.1, 0.05], [0.4, 0.1], [0.7, 0.06], [0.92, -0.06], [1.1, -0.19, "sharp"],
    [0.9, -0.03], [0.7, 0.09], [0.4, 0.13], [0.1, 0.08],
  ];
  glow(b.extrude(edge, { at: [0, TOP, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.038, color: TEAL, bone: root, name: "bladeEdge" }), 1.5);
  // back-edge spikes
  const sp: [number, number, number, number][] = [[0.3, 0.215, 0.3, 0.09], [0.55, 0.235, 0.15, 0.1], [0.8, 0.17, 0.6, 0.085], [0.98, 0.07, 0.9, 0.07]];
  for (const [z, y, dz, len] of sp)
    P(new THREE.ConeGeometry(0.016, len, 4), BONE_D, [0, TOP + y + len * 0.4, z + dz * len * 0.5], { dir: [0, 1, dz], name: "bladeSpike" });
  // rune plates, both faces
  const runeAt: [number, number, number][] = [[0.2, 0.125, 0.085], [0.45, 0.175, 0.095], [0.72, 0.13, 0.085]];
  runeAt.forEach(([z, y, sz], i) => {
    for (const s of [1, -1])
      glow(
        b.part(new THREE.PlaneGeometry(sz, sz), "#ffffff", {
          bone: root, at: [s * 0.0225, TOP + y, z], dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: RUNES[i], name: "runePlate",
        }),
        1.3,
      );
  });
  // blade-base gold plate with gem
  b.extrude([[-0.14, -0.06], [0.12, -0.03], [0.18, 0.06], [0.08, 0.13], [-0.14, 0.09]], {
    at: [0, TOP, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.05, bevel: 0.01, color: GOLD, bone: root, name: "basePlate",
  });
  for (const s of [1, -1]) glow(P(new THREE.OctahedronGeometry(0.02, 0), TEAL, [s * 0.027, TOP + 0.02, 0.02], { scale: [0.5, 1.4, 1], name: "baseGem" }), 1.6);

  // ---------------- soul flame in bone-claw cage
  const OZ = 0.62;
  const OY = TOP - 0.3;
  glow(P(new THREE.IcosahedronGeometry(0.06, 1), TEAL_L, [0, OY, OZ], { name: "soul" }), 1.8);
  glow(P(new THREE.IcosahedronGeometry(0.085, 0), TEAL, [0, OY, OZ], { scale: [0.85, 1, 0.85], name: "soulHalo" }), 0.8);
  for (const r of [0, 90]) P(new THREE.TorusGeometry(0.1, 0.006, 5, 14), GOLD, [0, OY, OZ], { rotation: [0, r, 0], name: "cageRing" });
  for (const dz of [-1, 0, 1]) {
    b.sweep(catmull([[0, TOP + 0.04, 0.4 + dz * 0.3 + 0.1], [0.0, TOP - 0.1, OZ + dz * 0.12 + 0.02], [0, OY + 0.08, OZ + dz * 0.07]]), [0.01, 0.005], {
      bone: root, sides: 5, color: BONE, caps: "point", name: "cageClaw",
    });
  }
  // wisps
  for (let k = 0; k < 4; k++) {
    const a = k * 1.6 + 0.4;
    const sx = Math.cos(a) * 0.04;
    const sz = Math.sin(a) * 0.04;
    glow(
      b.sweep(catmull([[sx, OY + 0.08, OZ + sz], [sx * 2.4, OY + 0.2, OZ + sz * 2.4], [sx * 0.6, OY + 0.3 + k * 0.02, OZ + sz * 0.6]]), [0.02, 0.0], {
        bone: root, sides: 5, color: k % 2 ? TEAL : TEAL_L, caps: "point", name: "wisp",
      }),
      1.3,
    );
  }

  // ---------------- ribbon with tassel
  b.sweep(catmull([[0.03, 1.12, 0.01], [0.09, 1.0, 0.04], [0.06, 0.86, 0.09], [0.11, 0.72, 0.1], [0.08, 0.56, 0.14]]), (t: number) => [0.026 - 0.008 * t, 0.003], {
    bone: root, section: "box", color: RIBBON, caps: "point", name: "ribbon",
  });
  P(new THREE.SphereGeometry(0.014, 6, 5), GOLD, [0.08, 1.12, 0.01], { name: "ribbonKnot" });
  glow(P(new THREE.OctahedronGeometry(0.014, 0), TEAL, [0.08, 0.55, 0.14], { scale: [1, 1.6, 1], name: "ribbonCharm" }), 1.4);

  // pommel studs
  const studs: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    studs.push(new THREE.SphereGeometry(0.007, 5, 4).translate(Math.cos(a) * 0.046, 0.215, Math.sin(a) * 0.046));
  }
  b.part(mergeGeometries(studs)!, GOLD, { bone: root, at: [0, 0, 0], name: "studs" });
  void NAVY;
  return b.root;
}
