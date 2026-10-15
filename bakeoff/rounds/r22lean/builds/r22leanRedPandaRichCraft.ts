import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { rng } from "../../../../src/math";
import { mottle, noise, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded red panda balancing on a mossy boulder, one paw waving, ringed tail up as a counterweight, gold bell charm, glowing spirit flower.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const RUST = cel("#e2561f");
const RUST_LIGHT = cel("#f08a3c");
const CREAM = cel("#fff3dc", "#f3cfa8");
const DARK = cel("#3b2024", "#2a1626");
const TAIL_DARK = cel("#4a2a26", "#2d1a2a");
const STONE = cel(mottle("#a3a8ba", "#8187a0", { size: 0.08, seed: 4 }));
const MOSS = cel(mottle("#86d04a", "#4fa23a", { size: 0.05, seed: 7 }));
const GOLD = "#f2c04a";
const RED_TASSEL = "#d8323c";

const HEAD: [number, number, number] = [0, 0.52, 0.27];

const stoneY = (x: number, z: number) => 0.16 + 0.16 * Math.sqrt(Math.max(0, 1 - (x / 0.36) ** 2 - (z / 0.3) ** 2));

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "redPanda" });

  // ---------- stone ----------
  const mossy = paint((p, n) => {
    const m = n.y * 0.75 + noise(p, 0.1, 3) * 0.55;
    return m > 0.78 ? MOSS : STONE;
  });
  const stone = b.part(new THREE.SphereGeometry(1, 12, 8), mossy, { at: [0, 0.16, 0], scale: [0.36, 0.16, 0.3] });
  const smalls: Array<[number, number, number, number, number, number]> = [
    [-0.3, 0.05, 0.2, 0.1, 0.05, 0.09],
    [0.28, 0.04, -0.2, 0.09, 0.04, 0.08],
    [-0.2, 0.04, -0.28, 0.08, 0.04, 0.07],
    [0.3, 0.035, 0.2, 0.07, 0.035, 0.06],
  ];
  for (const [x, y, z, sx, sy, sz] of smalls)
    b.part(new THREE.SphereGeometry(1, 8, 6), mossy, { at: [x, y, z], scale: [sx, sy, sz] });

  // moss clumps and grass
  const stoneSkin = b.surface(stone);
  const clumps = stoneSkin.scatter(34, { rng: rng(3), minDist: 0.05, filter: (h) => h.n.y > 0.25 });
  for (const h of clumps) b.stick(new THREE.SphereGeometry(0.028, 6, 4).scale(1, 0.55, 1), MOSS, h);
  const blade = svg(
    `<svg viewBox="0 0 32 64"><path d="M4 64 Q6 30 2 6 Q14 28 12 64Z M12 64 Q16 28 16 0 Q24 30 20 64Z M20 64 Q26 34 30 12 Q32 40 28 64Z" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  const grassHits = stoneSkin.scatter(26, { rng: rng(5), minDist: 0.06, filter: (h) => h.n.y > 0.35 });
  b.cards(grassHits, blade, { size: [0.05, 0.06], lean: 15, flow: [0, -0.2, 1], vary: 0.3, spin: 180, rng: rng(6), cross: true, color: "#6cc03c" });

  // glowing spirit flower on the stone
  const fx = 0.2;
  const fz = 0.08;
  const fy = stoneY(fx, fz) - 0.01;
  b.rod([fx, fy, fz], [fx + 0.005, fy + 0.07, fz], 0.004, "#4fa23a");
  glow(b.part(new THREE.SphereGeometry(0.012, 6, 4), "#fff3b0", { at: [fx + 0.005, fy + 0.078, fz] }), 1.3);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    glow(
      b.part(new THREE.SphereGeometry(0.02, 6, 4), "#a8f4ff", {
        at: [fx + 0.005 + Math.cos(a) * 0.024, fy + 0.074, fz + Math.sin(a) * 0.024],
        scale: [1.3, 0.45, 0.8],
        rotation: [0, (-a * 180) / Math.PI, 0],
      }),
      1.1,
    );
  }
  const motes: Array<[number, number, number]> = [
    [0.3, 0.45, 0.18],
    [-0.3, 0.6, 0.12],
    [0.22, 0.7, -0.15],
    [-0.22, 0.38, 0.28],
    [0.35, 0.58, -0.05],
    [-0.35, 0.34, -0.1],
  ];
  for (const m of motes) glow(b.part(new THREE.SphereGeometry(0.01, 6, 4), "#b6f7ff", { at: m }), 1.4);

  // ---------- body ----------
  const bodyPaint = furEdge(RUST, DARK, { level: -0.15, teeth: 0.22, period: 0.03, ink: INK });
  b.sweep(
    catmull([
      [0, 0.44, -0.2],
      [0, 0.46, -0.08],
      [0, 0.47, 0.05],
      [0, 0.47, 0.15],
    ]),
    [0.085, 0.1, 0.098, 0.08],
    { color: bodyPaint },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), RUST, { at: [s * 0.085, 0.44, -0.16], scale: [0.06, 0.07, 0.08] });
  }

  // tail
  const tailPaint = paint((_p, _n, s) =>
    s[0] > 0.93 ? TAIL_DARK : Math.floor(s[0] * 13) % 2 ? RUST_LIGHT : RUST,
  );
  b.sweep(
    catmull([
      [0, 0.46, -0.2],
      [0, 0.5, -0.36],
      [0.02, 0.6, -0.5],
      [0.08, 0.75, -0.52],
      [0.12, 0.88, -0.44],
    ]),
    [0.04, 0.06, 0.075, 0.07, 0.04],
    { color: tailPaint },
  );

  // legs
  const pawSpec = (c: [number, number, number], flat: number) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), DARK, { at: c, scale: [0.04, flat, 0.055] });
    for (const dx of [-0.018, 0, 0.018]) b.spike([c[0] + dx, c[1], c[2] + 0.045], [0, -0.2, 1], 0.02, 0.005, CREAM_FLAT);
  };
  for (const s of [1, -1]) {
    // hind legs
    b.sweep(
      catmull([
        [s * 0.09, 0.42, -0.17],
        [s * 0.1, 0.36, -0.15],
        [s * 0.09, 0.325, -0.11],
      ]),
      [0.045, 0.035, 0.03],
      { color: DARK },
    );
    pawSpec([s * 0.09, 0.315, -0.09], 0.024);
  }
  // front right (weight bearing)
  b.rod([-0.075, 0.46, 0.11], [-0.08, 0.33, 0.17], [0.04, 0.032], { color: DARK });
  pawSpec([-0.08, 0.318, 0.19], 0.024);
  // front left raised, waving
  b.sweep(
    catmull([
      [0.075, 0.46, 0.11],
      [0.11, 0.4, 0.2],
      [0.15, 0.46, 0.27],
    ]),
    [0.04, 0.034, 0.03],
    { color: DARK },
  );
  b.part(new THREE.SphereGeometry(1, 8, 6), DARK, { at: [0.155, 0.5, 0.29], scale: [0.04, 0.045, 0.035] });
  for (const dx of [-0.016, 0, 0.016])
    b.spike([0.155 + dx, 0.535, 0.3], [0, 1, 0.3], 0.02, 0.005, CREAM_FLAT);

  // ---------- head ----------
  const face = furEdge(RUST, CREAM, { by: "position", axis: [0, 1, 0], level: HEAD[1] - 0.005, teeth: 0.02, period: 0.022, along: [1, 0, 0], ink: INK });
  const headPaint = paint((p) => (p.z < HEAD[2] - 0.03 ? RUST : face));
  const head = b.part(new THREE.SphereGeometry(1, 14, 10), headPaint, { at: HEAD, scale: [0.1, 0.085, 0.087] });
  const skin = b.surface(head);
  // muzzle & nose
  b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { at: [0, 0.505, 0.34], scale: [0.04, 0.03, 0.04] });
  b.part(new THREE.SphereGeometry(1, 6, 4), INK, { at: [0, 0.515, 0.377], scale: [0.016, 0.012, 0.012] });
  // ears
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), RUST, { at: [s * 0.068, 0.585, 0.255], scale: [0.036, 0.042, 0.022], rotation: [0, 0, -s * 22] });
    b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { at: [s * 0.066, 0.583, 0.269], scale: [0.026, 0.032, 0.012], rotation: [0, 0, -s * 22] });
  }
  // eyes, brow dots, tear marks, whiskers
  const EYE = animeEye({ iris: "#a8562a", irisLight: "#f0a050", blush: false });
  for (const s of [1, -1]) {
    const eh = skin.around(HEAD).at(s * 33, 6)!;
    b.decal(skin, EYE, { at: eh, size: [0.034, 0.046], mirror: s > 0 });
    const brow = skin.around(HEAD).at(s * 34, 30)!;
    b.stick(new THREE.SphereGeometry(0.009, 6, 4).scale(1, 0.7, 0.7), CREAM_FLAT, brow);
    const tear = skin.drape(
      [
        [s * 0.035, 0.5, 0.34],
        [s * 0.045, 0.485, 0.325],
        [s * 0.055, 0.465, 0.31],
      ],
      { lift: 0.002 },
    );
    b.sweep(tear, 0.005, { color: "#7a3a22" });
    for (let k = 0; k < 3; k++)
      b.rod([s * 0.04, 0.5 - k * 0.004, 0.345], [s * 0.12, 0.5 + (k - 1) * 0.02, 0.37], 0.0018, "#fff6e6");
  }
  // cheek and body fur tufts
  const tuft = svg(`<svg viewBox="0 0 32 64"><path d="M16 0 C28 24 30 50 28 64 L4 64 C2 50 4 24 16 0Z" fill="#ffffff"/></svg>`, { size: 96 });
  const cheeks = skin.scatter(18, { rng: rng(11), minDist: 0.02, filter: (h) => Math.abs(h.n.x) > 0.5 && h.p.z > HEAD[2] - 0.02 && h.p.y < HEAD[1] });
  b.cards(cheeks, tuft, { size: [0.02, 0.035], lean: 65, flow: [0, -0.3, -1], bend: 20, vary: 0.3, rng: rng(12), color: "#fff1d6" });
  const bodySkin = b.surface(b.part(new THREE.SphereGeometry(0.0001, 3, 2), RUST, { at: [0, 0, 0] }));
  void bodySkin;

  // gold bell charm collar
  b.part(new THREE.TorusGeometry(0.092, 0.007, 6, 16), GOLD, { at: [0, 0.495, 0.19], rotation: [-12, 0, 0] });
  b.part(new THREE.SphereGeometry(0.018, 8, 6), GOLD, { at: [0, 0.44, 0.275] });
  b.part(new THREE.TorusGeometry(0.01, 0.003, 4, 8), "#c9962a", { at: [0, 0.42, 0.285] });
  b.spike([0, 0.43, 0.285], [0, -1, 0.2], 0.05, 0.007, RED_TASSEL);
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.008, 6, 4), RED_TASSEL, { at: [s * 0.03, 0.46, 0.27] });

  return b.root;
}

const CREAM_FLAT = "#fff3dc";
