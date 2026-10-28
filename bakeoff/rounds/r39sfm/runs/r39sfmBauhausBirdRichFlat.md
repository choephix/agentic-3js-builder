```ts
import * as THREE from "three";
import { createBuilder, polyline } from "agentic-3js-builder";

export const meta = {
  name: "Bauhaus Songbird",
  description: "A songbird perched on a square-cut branch, built from primary-colour circles, cones and slabs in Bauhaus style.",
};

const RED = "#d62a1f";
const YEL = "#f6c10f";
const BLUE = "#1b4fb4";
const BLACK = "#16161a";
const WHITE = "#f4f0e6";

export default function build() {
  const b = createBuilder({ name: "songbird" });

  // ---- skeleton ----
  const root = b.joint("root", { at: [0, 0.03, 0] });
  const body = b.joint("body", { parent: root, at: [0, 0.075, 0], dir: [0, 0, 1], role: "spine" });
  const neck = b.joint("neck", { parent: body, at: [0, 0.095, 0.04], dir: [0, 0.4, 1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.118, 0.05], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.113, 0.076], dir: [0, 0, 1], role: "jaw" });

  const tail = b.chain(
    "tail",
    polyline([
      [0, 0.07, -0.04],
      [0, 0.066, -0.09],
      [0, 0.06, -0.15],
    ]),
    { parent: body, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  void tail;

  const sides = [
    { s: 1, S: "L" },
    { s: -1, S: "R" },
  ];
  for (const { s, S } of sides) {
    b.chain(
      `wing${S}`,
      polyline([
        [s * 0.04, 0.088, 0.02],
        [s * 0.05, 0.082, -0.03],
        [s * 0.054, 0.072, -0.09],
      ]),
      { parent: body, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "wing" },
    );
    b.chain(
      `leg${S}`,
      polyline([
        [s * 0.02, 0.05, 0.005],
        [s * 0.02, 0.038, 0.012],
        [s * 0.02, 0.026, 0.008],
      ]),
      { parent: body, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
    );
  }

  const P = (
    geo: THREE.BufferGeometry,
    color: string,
    bone: string | THREE.Object3D | any,
    at: number[],
    o: Record<string, any> = {},
  ) => b.part(geo, color, { bone, at, flat: true, ...o });
  const sph = (w = 12, h = 8) => new THREE.SphereGeometry(1, w, h);

  // ---- body ----
  P(sph(), BLUE, body, [0, 0.075, -0.005], { scale: [0.045, 0.046, 0.062] });
  P(sph(), RED, body, [0, 0.07, 0.027], { scale: [0.04, 0.042, 0.04] }); // breast disc
  P(sph(10, 6), YEL, body, [0, 0.05, 0.03], { scale: [0.028, 0.012, 0.03] }); // belly patch
  // white collar ring
  P(new THREE.TorusGeometry(0.03, 0.005, 5, 14), WHITE, neck, [0, 0.1, 0.045], { dir: [0, 0.3, 1], axis: "z" });

  // ---- head ----
  const HC = new THREE.Vector3(0, 0.122, 0.05);
  P(sph(), YEL, head, [HC.x, HC.y, HC.z], { scale: [0.032, 0.032, 0.032] });
  P(sph(8, 5), BLACK, head, [0, 0.135, 0.044], { scale: [0.031, 0.02, 0.031] }); // cap
  // crest cone + red triangle
  P(new THREE.ConeGeometry(0.01, 0.04, 4), BLACK, head, [0, 0.158, 0.034], { dir: [0, 1, -0.7] });
  P(new THREE.ConeGeometry(0.007, 0.03, 3), RED, head, [0, 0.156, 0.024], { dir: [0, 0.8, -1] });

  // beak
  P(new THREE.ConeGeometry(0.013, 0.04, 4), BLACK, head, [0, 0.12, 0.093], { dir: [0, -0.05, 1] });
  P(new THREE.ConeGeometry(0.009, 0.028, 4), RED, jaw, [0, 0.112, 0.088], { dir: [0, 0.05, 1] });

  // eyes
  for (const { s } of sides) {
    const d = new THREE.Vector3(s * 0.8, 0.15, 0.5).normalize();
    const p1 = HC.clone().addScaledVector(d, 0.031);
    const p2 = HC.clone().addScaledVector(d, 0.0318);
    const p3 = HC.clone().addScaledVector(d, 0.0325);
    P(new THREE.CircleGeometry(0.0105, 14), WHITE, head, [p1.x, p1.y, p1.z], { dir: d.toArray(), axis: "z" });
    P(new THREE.CircleGeometry(0.0065, 12), BLACK, head, [p2.x, p2.y, p2.z], { dir: d.toArray(), axis: "z" });
    P(new THREE.CircleGeometry(0.0022, 8), WHITE, head, [p3.x + s * 0.001, p3.y + 0.002, p3.z], {
      dir: d.toArray(),
      axis: "z",
    });
    // cheek dot
    const c = HC.clone().addScaledVector(new THREE.Vector3(s * 0.75, -0.35, 0.55).normalize(), 0.0315);
    P(new THREE.CircleGeometry(0.007, 10), RED, head, [c.x, c.y, c.z], { dir: [s * 0.75, -0.35, 0.55], axis: "z" });
  }

  // ---- tail ----
  P(new THREE.BoxGeometry(0.034, 0.005, 0.1), BLUE, "tail1", [0, 0.066, -0.115], { rotation: [-8, 0, 0] });
  P(new THREE.BoxGeometry(0.01, 0.006, 0.1), YEL, "tail1", [0, 0.0695, -0.115], { rotation: [-8, 0, 0] });
  for (const { s } of sides) {
    P(new THREE.BoxGeometry(0.02, 0.004, 0.085), RED, "tail1", [s * 0.03, 0.064, -0.105], { rotation: [-8, s * 14, 0] });
    P(new THREE.BoxGeometry(0.034, 0.006, 0.01), BLACK, "tail3", [0, 0.059, -0.162], { rotation: [-8, 0, 0] });
  }

  // ---- wings ----
  const wingOutline: [number, number][] = [
    [0, 0.028],
    [0.045, 0.03],
    [0.125, -0.004],
    [0.05, -0.034],
    [0, -0.02],
  ];
  const stripe: [number, number][] = [
    [0.02, 0.02],
    [0.06, 0.018],
    [0.1, -0.002],
    [0.06, -0.012],
    [0.02, -0.006],
  ];
  for (const { s, S } of sides) {
    const bone = `shoulder${S}`;
    b.extrude(wingOutline, { at: [s * 0.0475, 0.085, 0.025], x: [0, 0, -1], thickness: 0.008, color: RED, bone });
    b.extrude(stripe, { at: [s * 0.0515, 0.085, 0.025], x: [0, 0, -1], thickness: 0.003, color: YEL, bone });
    P(new THREE.CircleGeometry(0.01, 14), BLACK, bone, [s * 0.0535, 0.088, 0.012], { dir: [s, 0, 0], axis: "z" });
    P(new THREE.CircleGeometry(0.005, 10), WHITE, bone, [s * 0.0538, 0.088, 0.012], { dir: [s, 0, 0], axis: "z" });
    P(new THREE.BoxGeometry(0.004, 0.01, 0.03), BLACK, `wrist${S}`, [s * 0.052, 0.07, -0.1], { rotation: [0, 0, 0] });
  }

  // ---- legs & feet ----
  for (const { s, S } of sides) {
    b.rod([s * 0.02, 0.052, 0.005], [s * 0.02, 0.038, 0.012], 0.004, { color: BLACK, bone: `hip${S}` });
    b.rod([s * 0.02, 0.038, 0.012], [s * 0.02, 0.026, 0.008], 0.0035, { color: BLACK, bone: `knee${S}` });
    P(new THREE.BoxGeometry(0.008, 0.005, 0.03), BLACK, `ankle${S}`, [s * 0.02, 0.0265, 0.022]);
    P(new THREE.BoxGeometry(0.006, 0.005, 0.02), BLACK, `ankle${S}`, [s * 0.02, 0.0265, -0.008]);
    P(new THREE.BoxGeometry(0.014, 0.004, 0.006), RED, `ankle${S}`, [s * 0.02, 0.0265, 0.038]);
  }

  // ---- branch ----
  b.sweep(
    polyline([
      [-0.2, 0.012, 0],
      [0.2, 0.012, 0],
    ]),
    0.012,
    { section: "box", color: BLACK, caps: "flat", bone: root },
  );
  // end-grain discs
  P(new THREE.CircleGeometry(0.012, 4), YEL, root, [0.2005, 0.012, 0], { dir: [1, 0, 0], axis: "z", rotation: [0, 90, 45] });
  P(new THREE.CylinderGeometry(0.011, 0.011, 0.002, 16), RED, root, [-0.2, 0.012, 0], { dir: [1, 0, 0] });
  // colour blocks on branch
  const blocks: [number, string][] = [
    [-0.14, YEL],
    [-0.1, RED],
    [0.09, BLUE],
    [0.13, WHITE],
  ];
  for (const [x, c] of blocks) P(new THREE.BoxGeometry(0.03, 0.026, 0.026), c, root, [x, 0.012, 0]);
  // twig with circle & triangle leaves
  b.sweep(
    polyline([
      [0.15, 0.02, 0],
      [0.19, 0.08, 0.005],
    ]),
    0.006,
    { section: "box", color: BLACK, caps: "flat", bone: root },
  );
  P(new THREE.CylinderGeometry(0.02, 0.02, 0.004, 16), BLUE, root, [0.19, 0.095, 0.005], { dir: [0, 0, 1] });
  P(new THREE.ConeGeometry(0.018, 0.004, 3), YEL, root, [0.15, 0.09, 0.005], { dir: [0, 0, 1], rotation: [90, 0, 0] });
  b.extrude(
    [
      [0, 0],
      [0.03, 0.02],
      [0, 0.04],
    ],
    { at: [-0.18, 0.024, 0], x: [-1, 0, 0], thickness: 0.004, color: RED, bone: root },
  );

  return b.root;
}
```