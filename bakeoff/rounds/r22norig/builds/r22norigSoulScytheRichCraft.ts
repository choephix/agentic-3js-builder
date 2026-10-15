import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { cells, paint, mottle, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A 2.1 m dragonbone scythe: vertebra shaft, caged soul orb, dragon-skull mount and a cracked bone blade edged in cyan soul-fire, standing on a runed bone plinth.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const BONE = "#eee3c8";
const BONE_D = "#cdbd98";
const DARK = "#2b2142";
const CRACK = "#5a4a6e";
const SOUL = "#4ff0e0";
const VIOLET = "#b36bff";
const GOLD = "#f2b83a";
const CLOTH = "#6a2fb0";

const glyphSvg = (d: string) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><g fill="none" stroke="#7ffcf0" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${d}</g></svg>`,
    { size: 128 },
  );

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "soulScythe" });

  const RUNES = [
    glyphSvg("M20 5 L20 35 M8 14 L20 22 L32 14 M10 30 L30 30"),
    glyphSvg("M10 6 L10 34 M10 20 L30 8 M10 20 L30 34"),
    glyphSvg("M20 5 L33 20 L20 35 L7 20 Z M20 14 L20 26"),
    glyphSvg("M8 8 L32 8 L8 32 L32 32 M20 8 L20 32"),
  ];

  const BONE_P = cel(mottle(BONE, BONE_D, { size: 0.05, seed: 3 }));
  const TIP_P = cel("#c3b3f0");
  const BLADE_P = paint((p, n, s) => {
    const c = cells(p, 0.12, 5);
    if (c.d2 - c.d1 < 0.012 && Math.abs(n.z) > 0.5) return CRACK;
    return s[0] > 1.0 ? TIP_P : BONE_P;
  });
  const WRAP_P = cel(stripes(CLOTH, "#2d2a6b", { size: 0.035, axis: "y" }));
  const GOLD_P = cel(GOLD);
  const DARK_P = cel(DARK, "#171027");

  const Y0 = 1.78; // blade origin height

  // ---------- plinth ----------
  b.lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.34, 0.04],
      [0.28, 0.07],
      [0.26, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0, 0], segments: 10, color: BONE_P },
  );
  b.part(new THREE.TorusGeometry(0.265, 0.01, 5, 20), GOLD_P, { at: [0, 0.1, 0], rotation: [90, 0, 0] });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * 360 + 18;
    const r = (a * Math.PI) / 180;
    glow(
      b.part(new THREE.PlaneGeometry(0.07, 0.035), "#ffffff", {
        at: [0.343 * Math.sin(r), 0.02, 0.343 * Math.cos(r)],
        rotation: [0, a, 0],
        texture: RUNES[i % 4],
      }),
    );
    b.part(new THREE.SphereGeometry(0.012, 5, 4), GOLD_P, {
      at: [0.34 * Math.sin(r + 0.31), 0.025, 0.34 * Math.cos(r + 0.31)],
    });
  }

  // ---------- base claws and socket ----------
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    const c = Math.cos(a);
    const s = Math.sin(a);
    b.sweep(
      catmull([
        [0.13 * c, 0.1, 0.13 * s],
        [0.1 * c, 0.16, 0.1 * s],
        [0.04 * c, 0.3, 0.04 * s],
      ]),
      [0.024, 0.004],
      BONE_P,
    );
    b.spike([0.13 * c, 0.1, 0.13 * s], [0.18 * c, 0.09, 0.18 * s], null, 0.014, DARK_P);
  }
  b.part(new THREE.CylinderGeometry(0.05, 0.06, 0.07, 8), GOLD_P, { at: [0, 0.135, 0] });

  // ---------- shaft ----------
  b.rod([0, 0.1, 0], [0, 1.7, 0], 0.02, DARK_P);

  const vertebra = (y: number, i: number) => {
    b.part(new THREE.CylinderGeometry(0.028, 0.037, 0.05, 7), BONE_P, { at: [0, y, 0] });
    const dir = i % 2 ? [0, 0.4, 1] : [1, 0.4, 0];
    for (const sg of [1, -1]) {
      b.spike([sg * dir[0] * 0.03, y, sg * dir[2] * 0.03], [sg * dir[0], dir[1], sg * dir[2]], 0.05, 0.011, BONE_P);
    }
  };
  let vi = 0;
  for (let y = 0.34; y < 0.52; y += 0.06) vertebra(y, vi++);
  for (let y = 1.06; y < 1.28; y += 0.06) vertebra(y, vi++);
  for (let y = 1.6; y < 1.67; y += 0.05) vertebra(y, vi++);

  // gold rings
  for (const y of [0.53, 1.02, 1.29, 1.57, 1.67]) {
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.025, 8), GOLD_P, { at: [0, y, 0] });
  }

  // wrapped grip
  b.rod([0, 0.55, 0], [0, 1.0, 0], 0.031, WRAP_P);
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.SphereGeometry(0.012, 5, 4), GOLD_P, { at: [0.033, 0.62 + i * 0.08, 0.0] });
  }
  // tassels
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const base: [number, number, number] = [0.045 * Math.cos(a), 1.0, 0.045 * Math.sin(a)];
    b.spike(base, [0, -1, 0], 0.22 - i * 0.03, 0.012, CLOTH);
    b.part(new THREE.SphereGeometry(0.014, 5, 4), GOLD_P, { at: [base[0], 0.99, base[2]] });
  }

  // ---------- soul orb and cage ----------
  glow(b.part(new THREE.SphereGeometry(0.075, 10, 8), SOUL, { at: [0, 1.42, 0] }), 1.3);
  glow(b.part(new THREE.SphereGeometry(0.04, 8, 6), "#e6fffb", { at: [0, 1.42, 0.03] }), 1.5);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    b.sweep(
      catmull([
        [0.015 * c, 1.53, 0.015 * s],
        [0.1 * c, 1.42, 0.1 * s],
        [0.015 * c, 1.31, 0.015 * s],
      ]),
      0.008,
      BONE_P,
      { sides: 5 },
    );
  }
  b.part(new THREE.CylinderGeometry(0.03, 0.045, 0.03, 8), GOLD_P, { at: [0, 1.535, 0] });
  b.part(new THREE.CylinderGeometry(0.045, 0.03, 0.03, 8), GOLD_P, { at: [0, 1.305, 0] });

  // ---------- dragon skull ----------
  const cranium = b.part(new THREE.SphereGeometry(1, 10, 8), BONE_P, { at: [0, 1.77, -0.02], scale: [0.075, 0.07, 0.085] });
  b.frustumBox([0, 1.75, 0.04], [0, 1.72, 0.2], [0.085, 0.07], [0.05, 0.045], { color: BONE_P });
  b.frustumBox([0, 1.69, 0.03], [0, 1.675, 0.17], [0.07, 0.03], [0.04, 0.022], { color: BONE_P });
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.02), GOLD_P, { at: [0, 1.7, 0.18] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.026, 7, 5), DARK_P, { at: [s * 0.045, 1.79, 0.07] });
    glow(b.part(new THREE.SphereGeometry(0.015, 6, 4), SOUL, { at: [s * 0.045, 1.79, 0.085] }), 1.6);
    b.part(new THREE.SphereGeometry(0.008, 5, 4), DARK_P, { at: [s * 0.014, 1.725, 0.205] });
    b.sweep(
      catmull([
        [s * 0.06, 1.82, -0.03],
        [s * 0.13, 1.86, -0.12],
        [s * 0.17, 1.95, -0.22],
        [s * 0.15, 2.04, -0.27],
      ]),
      [0.027, 0.004],
      BONE_P,
    );
    b.spike([s * 0.05, 1.82, 0.06], [s * 0.5, 0.6, 0.2], 0.07, 0.014, BONE_P);
    b.spike([s * 0.07, 1.75, 0.0], [s, -0.1, -0.3], 0.08, 0.014, BONE_P);
    b.part(new THREE.SphereGeometry(0.01, 5, 4), GOLD_P, { at: [s * 0.03, 1.84, 0.0] });
    for (let i = 0; i < 5; i++) {
      const z = 0.07 + i * 0.03;
      const yUp = 1.75 - ((z - 0.04) / 0.16) * 0.03 - 0.0325 + 0.005;
      const x = 0.034 - i * 0.004;
      b.spike([s * x, yUp, z], [0, -1, 0], 0.03, 0.007, "#fff8e6");
      b.spike([s * (x - 0.004), 1.7, z + 0.008], [0, 1, 0], 0.024, 0.006, "#fff8e6");
    }
  }
  b.spike([0, 1.83, 0.0], [0, 1, -0.4], 0.08, 0.018, BONE_P);
  void cranium;

  // ---------- blade ----------
  const X: [number, number, number] = [1, 0, 0];
  const Y: [number, number, number] = [0, 1, 0];
  b.extrude(
    [
      [-0.05, 0.04],
      [0.3, 0.28],
      [0.7, 0.3],
      [1.05, 0.12],
      [1.25, -0.15, "sharp"],
      [1.0, -0.02],
      [0.7, 0.08],
      [0.35, 0.1],
      [-0.05, -0.06],
    ],
    { at: [0, Y0, 0], x: X, y: Y, thickness: 0.03, bevel: 0.006, smoothing: 1, color: BLADE_P },
  );
  glow(
    b.extrude(
      [
        [0.3, 0.08],
        [0.35, 0.1],
        [0.7, 0.08],
        [1.0, -0.02],
        [1.25, -0.15, "sharp"],
        [1.02, -0.07],
        [0.7, 0.025],
        [0.36, 0.045],
        [0.3, 0.03],
      ],
      { at: [0, Y0, 0], x: X, y: Y, thickness: 0.014, color: SOUL },
    ),
    1.4,
  );

  // spine ridge and barbs
  b.sweep(
    catmull([
      [0.04, Y0 + 0.04, 0],
      [0.3, Y0 + 0.255, 0],
      [0.7, Y0 + 0.275, 0],
      [1.03, Y0 + 0.1, 0],
      [1.2, Y0 - 0.13, 0],
    ]),
    [0.02, 0.006],
    BONE_P,
  );
  const barbs: Array<[number, number, number]> = [
    [0.2, 0.2, 0.1],
    [0.42, 0.275, 0.12],
    [0.66, 0.285, 0.11],
    [0.88, 0.2, 0.1],
  ];
  for (const [x, y, l] of barbs) {
    b.spike([x, Y0 + y, 0], [-0.25, 1, 0], l, 0.016, BONE_P);
  }
  // gold edge studs on the ridge
  for (const [x, y] of [
    [0.3, 0.255],
    [0.55, 0.28],
    [0.8, 0.245],
  ]) {
    b.part(new THREE.SphereGeometry(0.014, 5, 4), GOLD_P, { at: [x, Y0 + y, 0] });
  }

  // runes both faces
  const runeSpots: Array<[number, number, number, number]> = [
    [0.28, 0.18, 12, 0.08],
    [0.48, 0.195, 0, 0.08],
    [0.68, 0.185, -12, 0.08],
    [0.86, 0.125, -24, 0.075],
    [1.0, 0.06, -25, 0.06],
  ];
  runeSpots.forEach(([x, y, rot, sz], i) => {
    glow(
      b.part(new THREE.PlaneGeometry(sz, sz), "#ffffff", {
        at: [x, Y0 + y, 0.0185],
        rotation: [0, 0, rot],
        texture: RUNES[i % 4],
      }),
    );
    glow(
      b.part(new THREE.PlaneGeometry(sz, sz), "#ffffff", {
        at: [x, Y0 + y, -0.0185],
        rotation: [0, 180, -rot],
        texture: RUNES[(i + 1) % 4],
      }),
    );
  });

  // soul-fire wisps hanging off the cutting edge
  const wisps: Array<[number, number, number, string]> = [
    [0.3, 0.034, 0.16, SOUL],
    [0.55, 0.04, 0.2, VIOLET],
    [0.8, 0.0, 0.14, SOUL],
    [1.0, -0.07, 0.18, VIOLET],
    [1.15, -0.15, 0.12, SOUL],
  ];
  for (const [x, y, l, c] of wisps) {
    const yb = Y0 + y;
    glow(
      b.sweep(
        catmull([
          [x, yb, 0],
          [x + 0.02, yb - l * 0.3, 0.02],
          [x - 0.012, yb - l * 0.65, 0],
          [x + 0.02, yb - l, -0.02],
        ]),
        [0.014, 0],
        c,
        { sides: 5 },
      ),
      1.4,
    );
  }

  return b.root;
}
