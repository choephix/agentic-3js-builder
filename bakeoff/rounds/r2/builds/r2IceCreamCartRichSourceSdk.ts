import * as THREE from "three";
import { createBuilder, paint } from "../../../../src/index";

export const meta = {
  name: "Seaside Ice Cream Cart",
  description:
    "A mint and cream push cart with a scalloped pink and white striped canopy, spoked wheels, a chrome freezer lid on a hinge, a cone-shaped hanging sign and a row of giant pastel fake ice cream cones on top.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "iceCreamCart" });

  const MINT = "#9fe3c8";
  const MINT_D = "#6cc4a4";
  const CREAM = "#fff3d6";
  const PINK = "#ff9fbd";
  const WHITE = "#fffaf2";
  const CHROME = "#dfe6ea";
  const CHROME_D = "#9aa6ae";
  const NAVY = "#3c4a5c";

  b.joint("cart", { at: [0, 0, 0] });
  b.joint("wheelL", { parent: "cart", at: [0.62, 0.43, 0], dir: [1, 0, 0] });
  b.joint("wheelR", { parent: "cart", at: [-0.62, 0.43, 0], dir: [-1, 0, 0] });
  b.joint("lid", { parent: "cart", at: [-0.2, 1.03, -0.32], dir: [1, 0, 0], role: "hinge" });

  const P = (
    g: THREE.BufferGeometry,
    color: any,
    at: number[],
    o: Record<string, any> = {},
  ) => b.part(g, color, { at, bone: "cart", ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // ---------- Body ----------
  P(box(1.1, 0.55, 0.8), MINT, [0, 0.775, 0]);
  P(box(1.14, 0.1, 0.84), CREAM, [0, 0.55, 0]); // skirt
  P(box(1.14, 0.06, 0.84), CREAM, [0, 1.0, 0]); // top trim
  P(box(1.12, 0.04, 0.82), PINK, [0, 0.64, 0]); // pink band
  // front + back + side panels
  for (const x of [-0.33, 0.33]) {
    P(box(0.5, 0.3, 0.02), CREAM, [x, 0.82, 0.405]);
    P(box(0.42, 0.22, 0.02), MINT_D, [x, 0.82, 0.415]);
    P(new THREE.SphereGeometry(0.03, 6, 4), PINK, [x, 0.82, 0.43]);
  }
  for (const s of [-1, 1]) {
    P(box(0.02, 0.3, 0.6), CREAM, [s * 0.555, 0.82, 0]);
    P(box(0.02, 0.22, 0.5), MINT_D, [s * 0.565, 0.82, 0]);
  }
  P(box(1.0, 0.3, 0.02), CREAM, [0, 0.82, -0.405]);

  // ---------- Axle and wheels ----------
  b.rod([-0.66, 0.43, 0], [0.66, 0.43, 0], 0.025, { color: CHROME_D, bone: "cart" });
  for (const s of [1, -1]) {
    const bone = s > 0 ? "wheelL" : "wheelR";
    const cx = s * 0.62;
    const at = [cx, 0.43, 0];
    P(new THREE.TorusGeometry(0.4, 0.035, 6, 20), NAVY, at, { rotation: [0, 90, 0], bone });
    P(new THREE.TorusGeometry(0.36, 0.014, 5, 20), CREAM, at, { rotation: [0, 90, 0], bone });
    for (let k = 0; k < 4; k++)
      P(box(0.03, 0.74, 0.03), CREAM, at, { rotation: [k * 45, 0, 0], bone });
    P(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 8), PINK, at, { rotation: [0, 0, 90], bone });
    P(new THREE.SphereGeometry(0.05, 6, 4), CHROME, [cx + s * 0.05, 0.43, 0], { bone });
  }

  // ---------- Chrome lid ----------
  const lid = (g: THREE.BufferGeometry, c: string, at: number[], o: Record<string, any> = {}) =>
    P(g, c, at, { bone: "lid", ...o });
  lid(box(0.58, 0.05, 0.66), CHROME, [-0.2, 1.055, 0]);
  lid(box(0.6, 0.025, 0.68), CHROME_D, [-0.2, 1.04, 0]);
  lid(box(0.5, 0.012, 0.58), "#f4f8fa", [-0.2, 1.085, 0]);
  b.rod([-0.34, 1.1, 0.26], [-0.06, 1.1, 0.26], 0.015, { color: CHROME_D, bone: "lid" });
  for (const x of [-0.34, -0.06]) lid(box(0.03, 0.04, 0.03), CHROME_D, [x, 1.09, 0.26]);
  for (const x of [-0.4, 0]) lid(box(0.07, 0.04, 0.03), CHROME_D, [x, 1.03, -0.33]);

  // ---------- Canopy ----------
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const x = sx * 0.52;
      const z = sz * 0.36;
      b.rod([x, 1.03, z], [x, 2.06, z], 0.022, { color: CREAM, bone: "cart" });
      P(new THREE.SphereGeometry(0.04, 6, 4), PINK, [x, 1.05, z]);
    }
  const stripes = paint((_p, _n, s) => (Math.floor(s[1] / 30) % 2 === 0 ? PINK : WHITE));
  b.lathe(
    [
      [0, 0.3],
      [0.85, 0.05],
      [0.85, -0.03],
      [0, 0.2],
    ],
    { color: stripes, at: [0, 2.0, 0], segments: 12, bone: "cart" },
  );
  for (let i = 0; i < 12; i++) {
    const a = ((i + 0.5) * 30 * Math.PI) / 180;
    P(
      new THREE.SphereGeometry(0.225, 8, 5),
      i % 2 === 0 ? PINK : WHITE,
      [0.85 * Math.sin(a), 2.0, 0.85 * Math.cos(a)],
      { scale: [1, 0.5, 1] },
    );
  }

  // ---------- Row of giant fake cones on top ----------
  const waffle = paint((p, n) => {
    const k = Math.floor(p.y * 28 + p.x * 14 + p.z * 14) + Math.floor(p.x * 28 - p.y * 14 + p.z * 14);
    return k % 2 === 0 ? "#e6b36d" : "#c98f47";
  });
  const flavours = ["#ffb3c7", "#a8ecd2", "#fff1a8", "#cdb8f5", "#ffcba4"];
  const darker = ["#f58aa6", "#7fd6b5", "#f0d96e", "#b098ea", "#f5a97a"];
  flavours.forEach((f, i) => {
    const x = -0.6 + i * 0.3;
    const base = 2.3 - 0.294 * Math.abs(x) - 0.02;
    P(new THREE.ConeGeometry(0.1, 0.3, 8), waffle, [x, base + 0.15, 0], { rotation: [180, 0, 0] });
    P(new THREE.CylinderGeometry(0.125, 0.11, 0.05, 8), darker[i], [x, base + 0.3, 0]);
    P(new THREE.SphereGeometry(0.12, 8, 6), f, [x, base + 0.35, 0]);
    P(new THREE.SphereGeometry(0.028, 6, 4), "#e63950", [x, base + 0.48, 0]);
  });

  // ---------- Cone sign ----------
  const signAt = [0, 1.15, 0.46];
  const outline: Array<[number, number]> = [[0, 0]];
  for (let a = -35; a <= 215; a += 20) {
    const r = (a * Math.PI) / 180;
    outline.push([0.25 * Math.cos(r), 0.5 + 0.25 * Math.sin(r)]);
  }
  b.extrude(outline, {
    color: "#e6b36d",
    at: signAt,
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.04,
    bevel: 0.01,
    bone: "cart",
  });
  const scoop: Array<[number, number]> = Array.from({ length: 14 }, (_, i) => {
    const r = (i / 14) * Math.PI * 2;
    return [0.2 * Math.cos(r), 0.5 + 0.2 * Math.sin(r)];
  });
  b.extrude(scoop, {
    color: PINK,
    at: signAt,
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.06,
    bevel: 0.015,
    bone: "cart",
  });
  const sprinkle = ["#ffffff", "#7fd6b5", "#fff1a8", "#8fb8ff"];
  for (let i = 0; i < 9; i++) {
    const r = (i / 9) * Math.PI * 2 + 0.3;
    const d = 0.05 + (i % 3) * 0.045;
    P(box(0.04, 0.012, 0.01), sprinkle[i % 4], [0.0 + d * Math.cos(r), 1.65 + d * Math.sin(r), 0.495], {
      rotation: [0, 0, i * 40],
    });
  }
  [
    [0, 0.14, 40],
    [-0.06, 0.24, -40],
    [0.06, 0.24, 40],
    [0, 0.31, -40],
  ].forEach(([x, y, a]) =>
    P(box(0.11, 0.012, 0.01), "#9a6a2e", [x, 1.15 + y, 0.484], { rotation: [0, 0, a] }),
  );
  for (const s of [-1, 1])
    b.rod([s * 0.17, 1.81, 0.46], [s * 0.17, 2.09, 0.46], 0.008, { color: CREAM, bone: "cart" });

  // ---------- Push handle ----------
  for (const s of [-1, 1]) {
    b.rod([s * 0.38, 0.8, -0.4], [s * 0.38, 1.12, -1.0], 0.025, { color: CREAM, bone: "cart" });
    b.rod([s * 0.38, 1.12, -1.0], [s * 0.2, 1.12, -1.0], 0.036, { color: PINK, bone: "cart" });
  }
  b.rod([-0.2, 1.12, -1.0], [0.2, 1.12, -1.0], 0.03, { color: CREAM, bone: "cart" });
  b.rod([-0.38, 0.9, -0.55], [-0.38, 0.7, -0.4], 0.015, { color: CREAM, bone: "cart" });
  b.rod([0.38, 0.9, -0.55], [0.38, 0.7, -0.4], 0.015, { color: CREAM, bone: "cart" });

  // ---------- Little front stand ----------
  for (const s of [-1, 1]) {
    b.rod([s * 0.4, 0.55, 0.36], [s * 0.4, 0.04, 0.5], 0.02, { color: CHROME_D, bone: "cart" });
    P(box(0.08, 0.03, 0.1), NAVY, [s * 0.4, 0.015, 0.5]);
  }

  return b.root;
}
