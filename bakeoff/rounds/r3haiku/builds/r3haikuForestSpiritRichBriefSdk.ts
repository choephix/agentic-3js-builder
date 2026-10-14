import * as THREE from "three";
import { createBuilder, polyline, rng } from "../../../../src/index";

export const meta = {
  name: "Forest Spirit",
  description:
    "A small deer-like spirit of grey river stone under soft moss, with a pale wooden mask, glowing green eyes, flowering antlers and circling fireflies.",
};

const STONE = "#7d8178";
const STONE_DARK = "#5b6058";
const MOSS = "#5f9a4a";
const MOSS_LIGHT = "#86bd5f";
const WOOD_PALE = "#e4d5b2";
const WOOD_DARK = "#7a5a3a";
const HOOF = "#3b2a1c";
const FLOWER = "#f7f5ea";
const LEAF = "#6fb35a";
const GLOW = "#9dff7a";
const FIREFLY = "#e8ff8a";

export default function build() {
  const b = createBuilder({ name: "forest-spirit" });
  const r = rng(7);

  // ---- Skeleton and body -------------------------------------------------
  const spine = b.chain("spine", [
    [0, 0.66, -0.3],
    [0, 0.68, -0.08],
    [0, 0.74, 0.1],
    [0, 0.8, 0.26],
    [0, 0.9, 0.33],
  ]);
  const body = b.sweep(spine, 0.2, { color: STONE });

  // Tail tuft of moss
  b.part(new THREE.IcosahedronGeometry(0.06, 0).scale(1, 0.8, 1.2), MOSS, {
    at: [0, 0.68, -0.33],
  });

  // Neck and head
  const neck = b.chain("neck", [
    [0, 0.9, 0.33],
    [0, 1.1, 0.44],
    [0, 1.2, 0.5],
  ]);
  b.sweep(neck, 0.11, { color: STONE });

  const head = b.chain("head", [
    [0, 1.2, 0.5],
    [0, 1.26, 0.6],
  ]);
  const headBody = b.sweep(head, 0.13, { color: STONE });

  // ---- Legs (slender wood, little hooves) --------------------------------
  const legs = [
    { name: "legBL", x: -0.13, z: -0.22 },
    { name: "legBR", x: 0.13, z: -0.22 },
    { name: "legFL", x: -0.1, z: 0.2 },
    { name: "legFR", x: 0.1, z: 0.2 },
  ];
  for (const leg of legs) {
    const top = leg.z < 0 ? 0.66 : 0.78;
    b.chain(leg.name, [
      [leg.x, top, leg.z],
      [leg.x * 1.05, 0.36, leg.z - 0.01],
      [leg.x, 0.06, leg.z],
    ]);
    b.sweep(
      b.chain(leg.name + "_",
        [
          [leg.x, top, leg.z],
          [leg.x * 1.05, 0.36, leg.z - 0.01],
          [leg.x, 0.06, leg.z],
        ]),
      0.032,
      { color: WOOD_DARK },
    );
    b.part(new THREE.CylinderGeometry(0.045, 0.058, 0.05, 6), HOOF, {
      at: [leg.x, 0.025, leg.z],
    });
  }

  // ---- Stone body: river stones and moss on the surface ------------------
  const bodySurface = b.surface(body);
  for (let i = 0; i < 26; i++) {
    const y = 0.56 + r() * 0.4;
    const t = r() * Math.PI * 2;
    const zc = (y - 0.66) * 0.5 - 0.02;
    const p = [Math.cos(t) * 0.3, y, zc + Math.sin(t) * 0.3];
    const hit = bodySurface.nearest(p);
    const big = r() > 0.5;
    const geo = big
      ? new THREE.DodecahedronGeometry(0.1 + r() * 0.04, 0)
      : new THREE.DodecahedronGeometry(0.06 + r() * 0.03, 0);
    b.stick(geo, r() > 0.4 ? STONE : STONE_DARK, hit);
  }
  for (let i = 0; i < 40; i++) {
    const y = 0.6 + r() * 0.36;
    const t = r() * Math.PI * 2;
    const zc = (y - 0.66) * 0.5 - 0.02;
    const p = [Math.cos(t) * 0.28, y, zc + Math.sin(t) * 0.28];
    const hit = bodySurface.nearest(p);
    const mossGeo = new THREE.IcosahedronGeometry(0.05 + r() * 0.04, 0).scale(
      1,
      0.4,
      1,
    );
    b.stick(mossGeo, r() > 0.5 ? MOSS : MOSS_LIGHT, hit);
  }

  // Moss patches on the head and neck
  const headSurface = b.surface(headBody);
  for (let i = 0; i < 8; i++) {
    const hit = headSurface.nearest([
      (r() - 0.5) * 0.2,
      1.22 + r() * 0.14,
      0.5 + r() * 0.12,
    ]);
    b.stick(
      new THREE.IcosahedronGeometry(0.04 + r() * 0.02, 0).scale(1, 0.45, 1),
      MOSS,
      hit,
    );
  }

  // ---- Pale wooden mask and glowing eyes ---------------------------------
  b.part(new THREE.SphereGeometry(0.16, 10, 8), WOOD_PALE, {
    at: [0, 1.28, 0.66],
    scale: [0.9, 1.05, 0.55],
  });
  // Brow ridge and nose ridge for character
  b.part(new THREE.BoxGeometry(0.2, 0.025, 0.04), WOOD_DARK, {
    at: [0, 1.33, 0.74],
  });
  b.part(new THREE.BoxGeometry(0.02, 0.1, 0.03), WOOD_DARK, {
    at: [0, 1.25, 0.75],
  });
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.028, 8, 6), GLOW, {
      at: [s * 0.058, 1.29, 0.74],
    });
  }

  // ---- Antlers: branching wood with flowers and leaves -------------------
  const antlerTips: number[][] = [];
  for (const s of [1, -1]) {
    // main beam
    b.sweep(
      polyline([
        [s * 0.06, 1.36, 0.5],
        [s * 0.14, 1.5, 0.5],
        [s * 0.26, 1.66, 0.46],
      ]),
      0.022,
      { color: WOOD_DARK },
    );
    // forward tine
    b.sweep(
      polyline([
        [s * 0.14, 1.5, 0.5],
        [s * 0.2, 1.52, 0.62],
        [s * 0.3, 1.58, 0.68],
      ]),
      0.015,
      { color: WOOD_DARK },
    );
    // upper tine
    b.sweep(
      polyline([
        [s * 0.22, 1.6, 0.47],
        [s * 0.24, 1.7, 0.4],
        [s * 0.2, 1.76, 0.34],
      ]),
      0.013,
      { color: WOOD_DARK },
    );
    antlerTips.push([s * 0.26, 1.66, 0.46], [s * 0.3, 1.58, 0.68], [s * 0.2, 1.76, 0.34]);

    // leaves along the beam
    for (const p of [
      [s * 0.1, 1.44, 0.5],
      [s * 0.2, 1.58, 0.48],
      [s * 0.22, 1.65, 0.6],
    ]) {
      const leaf = new THREE.IcosahedronGeometry(0.035, 0).scale(0.4, 1, 0.9);
      leaf.rotateZ(s * 0.6);
      b.part(leaf, LEAF, { at: p });
    }
  }
  // Flowers at the tips
  for (const p of antlerTips) {
    b.part(new THREE.SphereGeometry(0.026, 6, 5), FLOWER, { at: p });
    b.part(new THREE.SphereGeometry(0.012, 5, 4), "#f2c94c", {
      at: [p[0], p[1] + 0.02, p[2]],
    });
  }

  // ---- Fireflies circling the head ---------------------------------------
  const center = [0, 1.32, 0.55];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + r() * 0.4;
    const rad = 0.35 + r() * 0.12;
    const y = center[1] + (r() - 0.5) * 0.45;
    b.part(new THREE.SphereGeometry(0.018, 6, 4), FIREFLY, {
      at: [
        center[0] + Math.cos(a) * rad,
        y,
        center[2] + Math.sin(a) * rad,
      ],
    });
  }

  return b.root;
}
