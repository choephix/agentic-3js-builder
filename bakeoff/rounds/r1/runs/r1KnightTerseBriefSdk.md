```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Armored Knight",
  description:
    "A stylized plate-armored knight with plumed helmet, kite shield and longsword, rigged in a neutral A-pose.",
};

export default function build() {
  const b = createBuilder({ name: "knight" });

  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const mat = (c: string) =>
    (mats[c] ??= new THREE.MeshStandardMaterial({
      color: c,
      roughness: 0.45,
      metalness: c === "#d4a63a" || c.startsWith("#9") || c.startsWith("#5b") ? 0.6 : 0.1,
      flatShading: true,
    }));

  const STEEL = "#9aa5b1", DARK = "#5b6572", GOLD = "#d4a63a", RED = "#a3262a",
    BLACK = "#1b1d22", LEATHER = "#5a3a22", CLOTH = "#e8e2d0";

  type V = [number, number, number];
  const jpos = new Map<THREE.Object3D, V>();
  const J = (name: string, at: V, parent?: THREE.Object3D) => {
    const j: THREE.Object3D = parent ? (b.joint(name, { at, parent }) as any) : (b.joint(name, { at }) as any);
    jpos.set(j, at);
    return j;
  };

  const put = (j: THREE.Object3D, geo: THREE.BufferGeometry, color: string, at: V, rot?: V, scale?: V) => {
    const m = new THREE.Mesh(geo, mat(color));
    const jp = jpos.get(j)!;
    m.position.set(at[0] - jp[0], at[1] - jp[1], at[2] - jp[2]);
    if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
    if (scale) m.scale.set(scale[0], scale[1], scale[2]);
    j.add(m);
    return m;
  };
  const box = (j: THREE.Object3D, w: number, h: number, d: number, color: string, at: V, rot?: V) =>
    put(j, new THREE.BoxGeometry(w, h, d), color, at, rot);
  const ball = (j: THREE.Object3D, r: number, color: string, at: V, scale?: V) =>
    put(j, new THREE.SphereGeometry(r, 10, 8), color, at, undefined, scale);
  const seg = (j: THREE.Object3D, a: V, c: V, r1: number, r2: number, color: string, sides = 8) => {
    const va = new THREE.Vector3(...a), vc = new THREE.Vector3(...c);
    const d = vc.clone().sub(va);
    const len = d.length();
    const m = put(j, new THREE.CylinderGeometry(r2, r1, len, sides), color,
      [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2]);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    return m;
  };

  // ---- skeleton
  const hips = J("hips", [0, 0.98, 0]);
  const spine = J("spine", [0, 1.15, 0], hips);
  const chest = J("chest", [0, 1.35, 0], spine);
  const neck = J("neck", [0, 1.57, 0.01], chest);
  const head = J("head", [0, 1.66, 0.01], neck);
  const jaw = J("jaw", [0, 1.69, 0.08], head);

  // ---- pelvis & skirt
  put(hips, new THREE.CylinderGeometry(0.2, 0.25, 0.2, 8), STEEL, [0, 0.98, 0], undefined, [1, 1, 0.75]);
  put(hips, new THREE.CylinderGeometry(0.22, 0.2, 0.06, 8), LEATHER, [0, 1.1, 0], undefined, [1, 1, 0.78]);
  box(hips, 0.08, 0.07, 0.03, GOLD, [0, 1.1, 0.19]);
  // tasset plates
  for (let i = 0; i < 5; i++) {
    const a = (i - 2) * 0.42;
    box(hips, 0.12, 0.16, 0.025, DARK, [Math.sin(a) * 0.24, 0.9, Math.cos(a) * 0.19], [0.15, -a, 0]);
  }
  // tabard
  box(hips, 0.2, 0.42, 0.02, RED, [0, 0.82, 0.22], [0.05, 0, 0]);
  box(hips, 0.06, 0.06, 0.025, GOLD, [0, 0.69, 0.235]);

  // ---- torso
  put(spine, new THREE.CylinderGeometry(0.2, 0.18, 0.22, 8), DARK, [0, 1.2, 0], undefined, [1, 1, 0.75]);
  put(chest, new THREE.CylinderGeometry(0.3, 0.2, 0.34, 8), STEEL, [0, 1.38, 0], undefined, [1, 1, 0.72]);
  box(chest, 0.04, 0.3, 0.05, DARK, [0, 1.38, 0.15]); // breastplate ridge
  box(chest, 0.34, 0.04, 0.04, GOLD, [0, 1.3, 0.14]);
  // tabard cross on chest
  box(chest, 0.05, 0.22, 0.012, GOLD, [0, 1.4, 0.172]);
  box(chest, 0.17, 0.05, 0.012, GOLD, [0, 1.43, 0.172]);
  put(chest, new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8), STEEL, [0, 1.55, 0], undefined, [1, 1, 0.75]); // gorget
  put(neck, new THREE.CylinderGeometry(0.1, 0.11, 0.1, 8), DARK, [0, 1.6, 0.01]);
  // back cape
  box(chest, 0.34, 0.6, 0.02, RED, [0, 1.15, -0.19], [-0.08, 0, 0]);

  // ---- head / helmet
  ball(head, 0.14, STEEL, [0, 1.74, 0.01], [1, 1.1, 1.1]);
  put(head, new THREE.CylinderGeometry(0.14, 0.145, 0.1, 10), STEEL, [0, 1.66, 0.01]);
  box(head, 0.2, 0.025, 0.03, BLACK, [0, 1.72, 0.145]); // visor slit
  box(head, 0.2, 0.025, 0.03, BLACK, [0, 1.68, 0.145]);
  box(head, 0.02, 0.1, 0.03, DARK, [0, 1.7, 0.15]); // nasal bar
  box(head, 0.04, 0.05, 0.3, DARK, [0, 1.87, 0.0]); // crest base
  box(head, 0.05, 0.1, 0.26, RED, [0, 1.93, -0.03], [-0.15, 0, 0]); // plume
  box(head, 0.05, 0.09, 0.14, RED, [0, 1.9, -0.2], [-0.7, 0, 0]);
  put(head, new THREE.CylinderGeometry(0.1, 0.01, 0.1, 6), GOLD, [0, 1.99, 0.02]);
  // chin guard (jaw)
  box(jaw, 0.19, 0.07, 0.1, DARK, [0, 1.62, 0.1]);
  box(jaw, 0.1, 0.02, 0.04, BLACK, [0, 1.65, 0.15]);

  // ---- arms & legs
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const sh = J("shoulder" + n, [s * 0.31, 1.5, 0], chest);
    const el = J("elbow" + n, [s * 0.45, 1.23, 0.02], sh);
    const wr = J("wrist" + n, [s * 0.56, 0.97, 0.08], el);
    const A: V = [s * 0.31, 1.5, 0], E: V = [s * 0.45, 1.23, 0.02], W: V = [s * 0.56, 0.97, 0.08];

    // pauldron: layered spheres
    ball(sh, 0.15, STEEL, [s * 0.33, 1.53, 0], [1, 0.7, 1.1]);
    ball(sh, 0.13, DARK, [s * 0.36, 1.46, 0], [1, 0.55, 1.05]);
    put(sh, new THREE.TorusGeometry(0.13, 0.015, 5, 10), GOLD, [s * 0.33, 1.53, 0], [Math.PI / 2, 0, 0]);
    seg(sh, A, E, 0.07, 0.065, STEEL);
    ball(el, 0.075, DARK, E);
    box(el, 0.03, 0.03, 0.1, GOLD, [s * 0.45 + s * 0.05, 1.23, 0.02]);
    seg(el, E, W, 0.066, 0.05, STEEL);
    seg(el, [E[0] * 0.5 + W[0] * 0.5, 1.1, 0.02], [W[0], W[1] + 0.02, W[2]], 0.07, 0.056, DARK, 6);
    // gauntlet
    box(wr, 0.09, 0.1, 0.1, DARK, [s * 0.57, 0.91, 0.09]);
    box(wr, 0.08, 0.03, 0.06, STEEL, [s * 0.57, 0.84, 0.1]);

    // legs
    const hp = J("hip" + n, [s * 0.11, 0.95, 0], hips);
    const kn = J("knee" + n, [s * 0.13, 0.5, 0.02], hp);
    const an = J("ankle" + n, [s * 0.14, 0.09, 0], kn);
    seg(hp, [s * 0.11, 0.95, 0], [s * 0.13, 0.5, 0.02], 0.1, 0.075, STEEL);
    ball(kn, 0.09, DARK, [s * 0.13, 0.5, 0.06], [1, 1, 0.9]);
    box(kn, 0.04, 0.04, 0.08, GOLD, [s * 0.13, 0.5, 0.12]);
    seg(kn, [s * 0.13, 0.5, 0.02], [s * 0.14, 0.1, 0], 0.075, 0.06, STEEL);
    box(kn, 0.1, 0.18, 0.04, DARK, [s * 0.14, 0.3, 0.06]); // shin plate
    // sabaton
    box(an, 0.12, 0.08, 0.26, DARK, [s * 0.14, 0.05, 0.07]);
    put(an, new THREE.ConeGeometry(0.06, 0.1, 5), STEEL, [s * 0.14, 0.05, 0.22], [Math.PI / 2, 0, 0]);
    box(an, 0.11, 0.05, 0.1, STEEL, [s * 0.14, 0.1, 0.0]);
  }

  // ---- shield (left forearm)
  const wrL = [...jpos.keys()].find((k) => k.name === "elbowL") ?? chest;
  const shape = new THREE.Shape();
  shape.moveTo(-0.17, 0.2);
  shape.lineTo(0.17, 0.2);
  shape.lineTo(0.17, 0.0);
  shape.lineTo(0, -0.28);
  shape.lineTo(-0.17, 0.0);
  shape.closePath();
  const shGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.01, bevelSegments: 1 });
  put(wrL, shGeo, RED, [0.62, 1.12, 0.14], [0, 0.1, 0]);
  const rim = new THREE.ExtrudeGeometry(shape, { depth: 0.01, bevelEnabled: false });
  put(wrL, rim, GOLD, [0.62, 1.12, 0.135], [0, 0.1, 0], [1.1, 1.1, 1]);
  box(wrL, 0.045, 0.34, 0.02, GOLD, [0.62, 1.1, 0.205], [0, 0.1, 0]);
  box(wrL, 0.22, 0.045, 0.02, GOLD, [0.62, 1.16, 0.205], [0, 0.1, 0]);
  ball(wrL, 0.05, STEEL, [0.62, 1.14, 0.21], [1, 1, 0.5]);

  // ---- sword (right hand)
  const wrR = [...jpos.keys()].find((k) => k.name === "wristR") ?? chest;
  const sx = -0.57, sz = 0.2;
  box(wrR, 0.035, 0.12, 0.035, LEATHER, [sx, 0.91, sz]);
  ball(wrR, 0.03, GOLD, [sx, 0.83, sz]);
  box(wrR, 0.22, 0.03, 0.05, GOLD, [sx, 0.98, sz]);
  box(wrR, 0.06, 0.8, 0.012, "#c9d2da", [sx, 1.4, sz]);
  box(wrR, 0.012, 0.8, 0.035, "#aab4be", [sx, 1.4, sz]);
  put(wrR, new THREE.ConeGeometry(0.03, 0.1, 4), "#c9d2da", [sx, 1.85, sz], [0, Math.PI / 4, 0], [1, 1, 0.4]);

  return b.root;
}
```