```ts
import * as THREE from "three";
import { createBuilder, paint } from "agentic-3js-builder";

export const meta = {
  name: "Seaside Ice Cream Cart",
  description:
    "Mint and cream push cart with a scalloped pink-and-white striped canopy, spoked wheels, chrome hinged lid, cone-shaped sign and a row of giant pastel cones on top.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "iceCreamCart" });
  b.joint("root", { at: [0, 0.4, 0] });
  b.joint("lid", { parent: "root", at: [0, 1.06, -0.5], dir: [1, 0, 0], role: "hinge" });

  const MINT = "#9fe3cf", CREAM = "#fff4dc", PINK = "#f58fb1", WHITE = "#ffffff";
  const CHROME = "#d3dde3", CHROME_D = "#9db0bb", TAN = "#e5b36a";

  type Opt = { rot?: [number, number, number]; bone?: string; scale?: number | [number, number, number] };
  const put = (g: THREE.BufferGeometry, color: any, at: [number, number, number], o: Opt = {}) =>
    b.part(g, color, { at, bone: o.bone ?? "root", rotation: o.rot, scale: o.scale as any });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s);
  const sph = (r: number, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);

  // ---- body ----
  put(box(0.8, 0.6, 1.2), MINT, [0, 0.75, 0]);
  put(box(0.83, 0.1, 1.23), CREAM, [0, 0.5, 0]);
  put(box(0.83, 0.06, 1.23), CREAM, [0, 1.02, 0]);
  for (const s of [-1, 1]) {
    put(box(0.014, 0.4, 0.95), CREAM, [s * 0.402, 0.76, 0]);
    put(box(0.01, 0.35, 0.88), MINT, [s * 0.406, 0.76, 0]);
    put(cyl(0.09, 0.09, 0.012, 14), PINK, [s * 0.414, 0.76, 0], { rot: [0, 0, 90] });
    put(cyl(0.05, 0.05, 0.014, 12), WHITE, [s * 0.418, 0.76, 0], { rot: [0, 0, 90] });
  }
  // front plate for the sign
  put(box(0.56, 0.5, 0.02), CREAM, [0, 0.76, 0.605]);
  put(box(0.5, 0.44, 0.012), PINK, [0, 0.76, 0.612]);

  // ---- cone sign (extruded outline on front) ----
  const waffle = (cx: number) =>
    paint((p) => {
      const k = (Math.floor((p.x - cx + p.y) / 0.05) + Math.floor((p.x - cx - p.y) / 0.05)) & 1;
      return k ? "#d9a050" : "#f0c887";
    });
  b.extrude([[-0.13, 0.27], [0.13, 0.27], [0, 0.0]], {
    color: waffle(0), at: [0, 0.55, 0.625], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, bone: "root",
  });
  const scoopPts: [number, number][] = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const r = 0.17 + (a > Math.PI && i % 2 ? -0.0 : 0);
    scoopPts.push([Math.cos(a) * r, 0.36 + Math.sin(a) * r * 0.9]);
  }
  // drip scallops along the lower edge
  b.extrude(scoopPts.map(([x, y]) => [x, y + 0.0] as [number, number]), {
    color: "#fff0a8", at: [0, 0.6, 0.64], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035, bone: "root", bevel: 0.008,
  });
  put(sph(0.035, 8, 6), "#e8304f", [0, 0.99, 0.66]);
  [[-0.07, 0.93], [0.05, 0.95], [0.09, 0.88], [-0.02, 0.88]].forEach(([x, y], i) =>
    put(box(0.025, 0.008, 0.008), ["#5bb8f5", "#ff7a59", "#7ad87a", "#b58cf2"][i], [x, y, 0.662], { rot: [0, 0, 30 * i] }),
  );

  // ---- wheels ----
  put(cyl(0.025, 0.025, 1.1, 8), CHROME_D, [0, 0.4, 0.1], { rot: [0, 0, 90] });
  for (const s of [-1, 1]) {
    const x = s * 0.49;
    put(new THREE.TorusGeometry(0.37, 0.03, 6, 20), PINK, [x, 0.4, 0.1], { rot: [0, 90, 0] });
    put(new THREE.TorusGeometry(0.33, 0.012, 5, 20), CREAM, [x, 0.4, 0.1], { rot: [0, 90, 0] });
    put(cyl(0.065, 0.065, 0.09, 10), CHROME, [x + s * 0.02, 0.4, 0.1], { rot: [0, 0, 90] });
    put(cyl(0.03, 0.03, 0.11, 8), PINK, [x + s * 0.025, 0.4, 0.1], { rot: [0, 0, 90] });
    for (let i = 0; i < 6; i++) put(box(0.02, 0.7, 0.02), CREAM, [x, 0.4, 0.1], { rot: [i * 30, 0, 0] });
  }

  // ---- kickstand legs & handle ----
  for (const s of [-1, 1]) {
    b.rod([s * 0.3, 0.45, 0.5], [s * 0.3, 0.0, 0.58], 0.02, { color: CHROME_D, bone: "root" });
    b.rod([s * 0.3, 0.9, -0.6], [s * 0.3, 1.05, -1.1], 0.022, { color: CHROME, bone: "root", caps: "round" });
    put(cyl(0.028, 0.028, 0.05, 8), PINK, [s * 0.3, 1.05, -1.1], { rot: [90, 0, 0] });
  }
  put(cyl(0.03, 0.03, 0.66, 10), PINK, [0, 1.05, -1.12], { rot: [0, 0, 90] });
  for (const s of [-1, 1]) put(sph(0.035, 8, 6), CREAM, [s * 0.34, 1.05, -1.12]);

  // ---- chrome lid (hinged) ----
  const lid = (g: THREE.BufferGeometry, c: string, at: [number, number, number], o: Opt = {}) =>
    put(g, c, at, { ...o, bone: "lid" });
  lid(box(0.62, 0.05, 1.0), CHROME, [0, 1.085, 0]);
  lid(box(0.64, 0.02, 1.02), CHROME_D, [0, 1.065, 0]);
  lid(box(0.5, 0.015, 0.85), "#eef4f7", [0, 1.115, 0]);
  lid(box(0.06, 0.02, 0.08), CHROME_D, [0, 1.11, 0.48]);
  for (const s of [-1, 1]) lid(box(0.02, 0.05, 0.02), CHROME_D, [s * 0.1, 1.14, 0.44]);
  lid(cyl(0.015, 0.015, 0.22, 8), CHROME_D, [0, 1.17, 0.44], { rot: [0, 0, 90] });

  // ---- canopy poles ----
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      put(cyl(0.02, 0.02, 0.96, 8), CHROME, [sx * 0.37, 1.53, sz * 0.52]);
      put(sph(0.035, 8, 6), PINK, [sx * 0.37, 2.0, sz * 0.52]);
    }

  // ---- striped canopy ----
  const stripes = paint((p) => {
    const ang = Math.atan2(p.x / 0.7, p.z / 1.0);
    const k = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 16) % 2;
    return k ? WHITE : PINK;
  });
  put(cyl(0.5, 1, 0.3, 16), stripes, [0, 2.15, 0], { scale: [0.7, 1, 1.0] });
  put(cyl(0.9, 0.9, 0.02, 16), CREAM, [0, 1.995, 0], { scale: [0.7, 1, 1.0] });
  for (let i = 0; i < 16; i++) {
    const th = ((i + 0.5) / 16) * Math.PI * 2 - Math.PI;
    put(sph(1, 8, 6), i % 2 ? WHITE : PINK, [0.7 * Math.sin(th), 1.97, 1.0 * Math.cos(th)], {
      rot: [0, (th * 180) / Math.PI, 0],
      scale: [0.15, 0.12, 0.07],
    });
  }

  // ---- row of giant cones on top ----
  put(box(0.34, 0.03, 1.0), CREAM, [0, 2.315, 0]);
  put(box(0.38, 0.015, 1.04), PINK, [0, 2.298, 0]);
  const flavors = ["#ffb3d1", "#b9f0d6", "#fff1a8", "#c7b5f5", "#ffc9a3"];
  const drips = ["#f58fb1", "#7fd1ae", "#f2d45c", "#a48be0", "#f4a672"];
  flavors.forEach((f, i) => {
    const z = -0.4 + i * 0.2;
    const y0 = 2.33;
    put(new THREE.ConeGeometry(0.075, 0.22, 8), waffle(0), [0, y0 + 0.11, z], { rot: [180, 0, 0] });
    put(cyl(0.095, 0.085, 0.03, 10), drips[i], [0, y0 + 0.235, z]);
    put(sph(0.095, 10, 7), f, [0, y0 + 0.27, z]);
    put(sph(0.028, 6, 5), "#e8304f", [0, y0 + 0.37, z]);
  });
  put(cyl(0.012, 0.012, 0.06, 6), CHROME, [0, 2.31, 0.0]);

  return b.root;
}
```