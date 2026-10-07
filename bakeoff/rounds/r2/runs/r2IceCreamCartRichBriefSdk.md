```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Seaside Ice Cream Cart",
  description:
    "Mint and cream push cart with a scalloped pink and white canopy, spoked wheels, chrome lid, a cone-shaped painted sign and a row of giant pastel fake cones.",
};

export default function build() {
  const b = createBuilder({ name: "icecreamcart" });
  b.joint("root", { at: [0, 0, 0] });

  const mk = (geo: THREE.BufferGeometry, color: string, pos: [number, number, number]) =>
    b.part(geo, color, { at: pos });

  const rod = (a: number[], c: number[], r: number, color: string) => {
    const va = new THREE.Vector3(...a);
    const vc = new THREE.Vector3(...c);
    const d = vc.clone().sub(va);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r, r, len, 8);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
    const m = va.clone().add(vc).multiplyScalar(0.5);
    mk(g, color, [m.x, m.y, m.z]);
  };

  const MINT = "#9fe3c8";
  const CREAM = "#fff4dc";
  const PINK = "#ff9db8";
  const WHITE = "#ffffff";
  const CHROME = "#d3dde3";
  const WAFFLE = "#e0a95c";
  const WAFFLE_D = "#b97a34";

  // ---- body ----
  mk(new THREE.BoxGeometry(1.0, 0.6, 1.4), MINT, [0, 0.85, 0]);
  mk(new THREE.BoxGeometry(1.04, 0.1, 1.44), CREAM, [0, 1.0, 0]);
  mk(new THREE.BoxGeometry(1.04, 0.07, 1.44), CREAM, [0, 0.58, 0]);
  // front panel inset
  mk(new THREE.BoxGeometry(0.7, 0.3, 0.02), CREAM, [0, 0.8, 0.71]);
  mk(new THREE.BoxGeometry(0.62, 0.22, 0.03), MINT, [0, 0.8, 0.715]);
  // chrome lid
  mk(new THREE.BoxGeometry(0.96, 0.07, 1.1), CHROME, [0, 1.19, 0.05]);
  mk(new THREE.BoxGeometry(0.5, 0.03, 0.8), "#eef3f6", [0, 1.24, 0.05]);
  mk(new THREE.BoxGeometry(0.3, 0.05, 0.05), "#8d9aa2", [0, 1.28, 0.62]);
  // axle
  rod([-0.7, 0.44, 0.05], [0.7, 0.44, 0.05], 0.03, "#7b8890");

  // ---- wheels ----
  for (const sx of [-1, 1]) {
    const x = sx * 0.66;
    const tire = new THREE.TorusGeometry(0.4, 0.045, 6, 20);
    tire.rotateY(Math.PI / 2);
    mk(tire, CREAM, [x, 0.44, 0.05]);
    const rim = new THREE.TorusGeometry(0.35, 0.02, 5, 20);
    rim.rotateY(Math.PI / 2);
    mk(rim, PINK, [x, 0.44, 0.05]);
    const hub = new THREE.CylinderGeometry(0.07, 0.07, 0.1, 10);
    hub.rotateZ(Math.PI / 2);
    mk(hub, CHROME, [x, 0.44, 0.05]);
    for (let i = 0; i < 8; i++) {
      const sp = new THREE.BoxGeometry(0.02, 0.74, 0.02);
      sp.rotateX((i * Math.PI) / 8);
      mk(sp, WHITE, [x, 0.44, 0.05]);
    }
  }

  // ---- poles ----
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      rod([sx * 0.45, 1.15, sz * 0.62], [sx * 0.45, 2.2, sz * 0.62], 0.025, CHROME);

  // ---- canopy ----
  const N = 12;
  const len = (Math.PI * 2) / N;
  for (let i = 0; i < N; i++) {
    const col = i % 2 === 0 ? PINK : WHITE;
    const th = i * len;
    mk(new THREE.CylinderGeometry(0.05, 1.0, 0.4, 1, 1, true, th, len), col, [0, 2.4, 0]);
    const tc = th + len / 2;
    const sc = new THREE.SphereGeometry(1, 8, 5);
    sc.scale(0.27, 0.15, 0.05);
    sc.rotateY(tc);
    mk(sc, col, [Math.sin(tc) * 0.99, 2.2, Math.cos(tc) * 0.99]);
    // bulbs on the rim
    const bulb = new THREE.SphereGeometry(0.035, 6, 4);
    const tb = th;
    mk(bulb, "#fff2a8", [Math.sin(tb) * 1.0, 2.1, Math.cos(tb) * 1.0]);
  }
  mk(new THREE.CylinderGeometry(1.0, 1.0, 0.02, 24), CREAM, [0, 2.2, 0]);

  // ---- row of giant fake cones ----
  const flavours = ["#ffb3c7", "#b8f0d6", "#fff0a8", "#c9b8ff", "#ffcfa3"];
  for (let i = 0; i < 5; i++) {
    const z = -0.72 + i * 0.36;
    const slope = 2.2 + 0.4 * (1 - Math.abs(z));
    const tipY = slope + 0.1;
    rod([0, slope - 0.03, z], [0, tipY, z], 0.02, CHROME);
    const cone = new THREE.ConeGeometry(0.14, 0.4, 8);
    cone.rotateX(Math.PI);
    mk(cone, WAFFLE, [0, tipY + 0.2, z]);
    const band = new THREE.CylinderGeometry(0.145, 0.145, 0.03, 8);
    mk(band, WAFFLE_D, [0, tipY + 0.3, z]);
    mk(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 10), flavours[(i + 2) % 5], [0, tipY + 0.42, z]);
    mk(new THREE.SphereGeometry(0.17, 8, 6), flavours[i], [0, tipY + 0.52, z]);
    mk(new THREE.SphereGeometry(0.035, 6, 4), "#d9304f", [0, tipY + 0.7, z]);
  }

  // ---- cone-shaped sign on each side ----
  for (const sx of [-1, 1]) {
    const x = sx * 0.52;
    const tri = new THREE.Shape();
    tri.moveTo(-0.22, 0.0);
    tri.lineTo(0.22, 0.0);
    tri.lineTo(0, -0.5);
    tri.closePath();
    const tg = new THREE.ExtrudeGeometry(tri, { depth: 0.02, bevelEnabled: false });
    tg.rotateY(sx * Math.PI / 2);
    mk(tg, WAFFLE, [x, 0.95, 0.0]);
    // waffle lines
    for (let k = -1; k <= 1; k++) {
      const l1 = new THREE.BoxGeometry(0.01, 0.01, 0.4);
      l1.rotateX(0.0);
      const ln = new THREE.BoxGeometry(0.012, 0.36, 0.012);
      ln.rotateX(sx * 0.0);
      ln.rotateZ(0);
      const d = new THREE.BoxGeometry(0.014, 0.014, 0.01);
      void l1; void d;
      mk(ln, WAFFLE_D, [x + sx * 0.012, 0.76, k * 0.07]);
    }
    const sg = new THREE.CylinderGeometry(0.2, 0.2, 0.025, 14);
    sg.rotateZ(Math.PI / 2);
    mk(sg, PINK, [x + sx * 0.005, 1.0, 0]);
    const sg2 = new THREE.SphereGeometry(0.15, 8, 6);
    sg2.scale(0.25, 1, 1);
    mk(sg2, "#fff0a8", [x + sx * 0.02, 1.1, 0.0]);
    const cherry = new THREE.SphereGeometry(0.04, 6, 4);
    mk(cherry, "#d9304f", [x + sx * 0.02, 1.0 + 0.0, 0.15 * 0]);
  }

  // ---- push handle at the back ----
  for (const sx of [-1, 1]) rod([sx * 0.35, 0.9, -0.7], [sx * 0.35, 1.45, -1.2], 0.025, CHROME);
  rod([-0.35, 1.45, -1.2], [0.35, 1.45, -1.2], 0.03, PINK);
  rod([-0.3, 1.45, -1.2], [0.3, 1.45, -1.2], 0.04, WHITE);

  // ---- front kick stand ----
  rod([-0.3, 0.55, 0.6], [-0.3, 0.05, 0.85], 0.02, "#7b8890");
  rod([0.3, 0.55, 0.6], [0.3, 0.05, 0.85], 0.02, "#7b8890");

  return b.root;
}
```