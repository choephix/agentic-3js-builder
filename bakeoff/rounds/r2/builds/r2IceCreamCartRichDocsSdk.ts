import * as THREE from "three";
import { createBuilder, stripes, paint, svg } from "../../../../src/index";

export const meta = {
  name: "Seaside Ice Cream Cart",
  description:
    "Mint and cream ice cream cart with a scalloped pink-and-white striped canopy, spoked wheels, push handle, chrome freezer lid, cone-shaped side signs and a row of giant pastel fake cones on the roof.",
};

const MINT = "#9fe3c8";
const CREAM = "#fff3dc";
const PINK = "#ff9fb8";
const WHITE = "#ffffff";
const CHROME = "#d5dee4";
const TIRE = "#3d3c4c";
const WAF1 = "#e3b06a";
const WAF2 = "#cf9650";
const RED = "#e8344e";
const FLAVOURS = ["#ffb7cf", "#bfeedd", "#fff0a8", "#cdb8ff", "#ffc9a3", "#b5dcff"];

export default function build() {
  const b = createBuilder({ name: "iceCreamCart" });
  const cart = b.joint("cart", { at: [0, 0.5, 0] });

  const box = (w: number, h: number, l: number, color: any, at: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, l), color, { at, bone: cart });

  // ---- body ----
  box(0.84, 0.08, 1.44, CREAM, [0, 0.52, 0]);
  box(0.8, 0.5, 1.4, MINT, [0, 0.78, 0]);
  box(0.82, 0.04, 1.42, PINK, [0, 0.62, 0]);
  box(0.88, 0.04, 1.5, CREAM, [0, 1.05, 0]);

  // front plaque with painted text
  const plaque = svg(
    `<svg viewBox="0 0 100 40"><rect x="2" y="2" width="96" height="36" rx="12" fill="#ff8fae" stroke="#ffffff" stroke-width="3"/><text x="50" y="26" font-size="17" font-weight="bold" font-family="sans-serif" text-anchor="middle" fill="#ffffff">ICE CREAM</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.56, 0.22), WHITE, {
    at: [0, 0.8, 0.703],
    dir: [0, 0, 1],
    axis: "z",
    texture: plaque,
    bone: cart,
  });

  // back door handles
  for (const s of [1, -1]) b.rod([s * 0.12, 0.75, -0.72], [s * 0.12, 0.9, -0.72], 0.012, { color: CHROME, bone: cart });

  // ---- chrome freezer lid ----
  const lidGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.7, 12, 1, false, -Math.PI / 2, Math.PI);
  lidGeo.rotateX(-Math.PI / 2);
  b.part(lidGeo, CHROME, { at: [0, 1.07, 0.25], scale: [1, 1, 0.45], bone: cart });
  // note: after rotateX, axis is z; scale z in geometry space maps to height via mesh scale
  b.capsule([-0.1, 1.2, 0.25], [0.1, 1.2, 0.25], 0.014, { color: PINK, bone: cart });

  // ---- wheels ----
  const wy = 0.42;
  const wz = 0.1;
  b.rod([-0.5, wy, wz], [0.5, wy, wz], 0.025, { color: CHROME, bone: cart });
  for (const s of [1, -1]) {
    const name = s > 0 ? "wheelL" : "wheelR";
    const wj = b.joint(name, { parent: cart, at: [s * 0.5, wy, wz], dir: [s, 0, 0], role: "hinge" });
    b.part(new THREE.TorusGeometry(0.38, 0.04, 6, 20), TIRE, { at: [s * 0.5, wy, wz], rotation: [0, 90, 0], bone: wj });
    b.part(new THREE.TorusGeometry(0.33, 0.014, 5, 20), CREAM, { at: [s * 0.5, wy, wz], rotation: [0, 90, 0], bone: wj });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 8), PINK, { at: [s * 0.5, wy, wz], rotation: [0, 0, 90], bone: wj });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.09, 6), CHROME, { at: [s * 0.5, wy, wz], rotation: [0, 0, 90], bone: wj });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      b.rod(
        [s * 0.5, wy + Math.cos(a) * 0.05, wz + Math.sin(a) * 0.05],
        [s * 0.5, wy + Math.cos(a) * 0.34, wz + Math.sin(a) * 0.34],
        0.008,
        { color: i % 2 ? WHITE : CREAM, bone: wj },
      );
    }
  }

  // ---- back stand and push handle ----
  for (const s of [1, -1]) {
    b.rod([s * 0.3, 0.55, -0.62], [s * 0.3, 0.0, -0.8], 0.025, { color: CHROME, bone: cart });
    b.rod([s * 0.33, 0.95, -0.7], [s * 0.33, 1.12, -1.15], 0.022, { color: CHROME, bone: cart });
    b.capsule([s * 0.33, 1.12, -1.15], [s * 0.33, 1.12, -1.25], 0.032, { color: PINK, bone: cart });
  }
  b.rod([-0.33, 1.12, -1.2], [0.33, 1.12, -1.2], 0.02, { color: CHROME, bone: cart });

  // ---- canopy ----
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.rod([sx * 0.46, 1.07, sz * 0.7], [sx * 0.46, 1.95, sz * 0.7], 0.018, { color: CHROME, bone: cart });

  const roofPaint = stripes(PINK, WHITE, { size: 0.14, axis: "x" });
  b.extrude(
    [
      [-0.58, 0],
      [0.58, 0],
      [0.25, 0.3],
      [-0.25, 0.3],
    ],
    { at: [0, 1.95, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 1.6, color: roofPaint, bone: cart },
  );

  const scallop = (w: number) => {
    const r = w / 2;
    const pts: any[] = [[-r, 0]];
    for (let k = 1; k <= 6; k++) {
      const a = Math.PI + (k * Math.PI) / 7;
      pts.push([r * Math.cos(a), r * Math.sin(a)]);
    }
    pts.push([r, 0]);
    return pts;
  };
  // front/back valance
  {
    const n = 8;
    const w = 1.16 / n;
    for (const sz of [1, -1])
      for (let i = 0; i < n; i++) {
        const cx = -0.58 + w * (i + 0.5);
        b.extrude(scallop(w), {
          at: [cx, 1.95, sz * 0.8],
          x: [1, 0, 0],
          thickness: 0.012,
          color: i % 2 ? WHITE : PINK,
          bone: cart,
        });
      }
  }
  // side valance
  {
    const n = 10;
    const w = 1.6 / n;
    for (const sx of [1, -1])
      for (let i = 0; i < n; i++) {
        const cz = -0.8 + w * (i + 0.5);
        b.extrude(scallop(w), {
          at: [sx * 0.58, 1.95, cz],
          x: [0, 0, 1],
          thickness: 0.012,
          color: i % 2 ? WHITE : PINK,
          bone: cart,
        });
      }
  }

  // ---- giant fake cones along the ridge ----
  const waffle = paint((p) =>
    (Math.floor((p.x + p.y) / 0.03) + Math.floor((p.z - p.y) / 0.03)) & 1 ? WAF1 : WAF2,
  );
  for (let i = 0; i < 6; i++) {
    const z = -0.65 + i * 0.26;
    const cg = new THREE.ConeGeometry(0.085, 0.24, 8);
    cg.rotateX(Math.PI);
    b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.03, 8), WHITE, { at: [0, 2.265, z], bone: cart });
    b.part(cg, waffle, { at: [0, 2.25 + 0.12 + 0.01, z], bone: cart });
    b.part(new THREE.SphereGeometry(0.1, 8, 6), FLAVOURS[i % FLAVOURS.length], {
      at: [0, 2.53, z],
      flat: true,
      bone: cart,
    });
    b.part(new THREE.TorusGeometry(0.088, 0.018, 4, 8), CREAM, {
      at: [0, 2.5, z],
      rotation: [90, 0, 0],
      bone: cart,
    });
    b.part(new THREE.SphereGeometry(0.028, 6, 4), RED, { at: [0, 2.64, z], bone: cart });
  }

  // ---- cone-shaped side signs ----
  const circle = (r: number, n: number) => {
    const pts: any[] = [];
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      pts.push([r * Math.cos(a), r * Math.sin(a)]);
    }
    return pts;
  };
  const wafflePanel = paint((_p, _n, s) =>
    (Math.abs(Math.floor((s[0] + s[1]) / 0.04)) + Math.abs(Math.floor((s[0] - s[1]) / 0.04))) % 2 ? WAF1 : WAF2,
  );
  for (const s of [1, -1]) {
    const X: [number, number, number] = [0, 0, -s];
    b.extrude(
      [
        [-0.13, 0.06],
        [0.13, 0.06],
        [0, -0.26],
      ],
      { at: [s * 0.4, 0.83, 0.0], x: X, y: [0, 1, 0], thickness: 0.02, color: wafflePanel, bone: cart },
    );
    b.extrude(circle(0.13, 12), {
      at: [s * 0.4, 0.97, 0.0],
      x: X,
      y: [0, 1, 0],
      thickness: 0.04,
      color: PINK,
      bone: cart,
    });
    b.extrude(circle(0.085, 10), {
      at: [s * 0.4, 1.0, 0.0],
      x: X,
      y: [0, 1, 0],
      thickness: 0.06,
      color: WHITE,
      bone: cart,
    });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { at: [s * 0.425, 1.07, 0], bone: cart });
  }

  return b.root;
}
