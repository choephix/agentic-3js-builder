```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "autumn_hedgehog",
  description: "A plump hedgehog on an evening stroll, with a maple leaf stuck on its spines.",
};

export default function build() {
  const b = createBuilder({ name: "hedgehog" });
  const R = rng(7);

  // skeleton
  const root = b.joint("root", { at: [0, 0.12, 0] });
  const spine = b.joint("spine1", { at: [0, 0.14, 0], parent: root });
  const neck = b.joint("neck", { at: [0, 0.15, 0.13], parent: spine });
  const head = b.joint("head", { at: [0, 0.14, 0.2], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.11, 0.27], parent: head });
  const legs: Record<string, THREE.Object3D | any> = {};
  const mk = (n: string, x: number, z: number) => {
    const hip = b.joint("hip" + n, { at: [x, 0.1, z], parent: root });
    const foot = b.joint("foot" + n, { at: [x * 1.15, 0.025, z + 0.02], parent: hip });
    legs[n] = foot;
    return foot;
  };
  mk("FL", 0.1, 0.14); mk("FR", -0.1, 0.14);
  mk("BL", 0.1, -0.12); mk("BR", -0.1, -0.12);

  // body: spiny dome
  const body = new THREE.SphereGeometry(0.2, 12, 9);
  b.part(body, "#7a4a28", { at: [0, 0.17, -0.02], bone: spine, scale: [0.95, 0.85, 1.25] } as any);
  // belly fawn
  b.part(new THREE.SphereGeometry(0.17, 10, 8), "#e0c39a", { at: [0, 0.11, 0.04], bone: root, scale: [0.95, 0.75, 1.3] } as any);

  // spines with cream tips
  const dark = ["#6b3b1c", "#7a4a28", "#8a5530", "#5e3318"];
  const spk = new THREE.ConeGeometry(0.014, 0.1, 4);
  const tipG = new THREE.ConeGeometry(0.008, 0.04, 4);
  for (let i = 0; i < 230; i++) {
    const u = R(), v = R();
    const th = u * Math.PI * 2;
    const ph = Math.acos(1 - v * 0.95); // upper hemisphere bias
    const dir = new THREE.Vector3(Math.sin(ph) * Math.cos(th) * 0.95, Math.cos(ph) * 0.85, Math.sin(ph) * Math.sin(th) * 1.25);
    if (dir.y < -0.1) continue;
    const n = dir.clone().normalize();
    // keep spines off the face
    if (n.z > 0.75 && n.y < 0.75) continue;
    const base = new THREE.Vector3(0, 0.17, -0.02).add(new THREE.Vector3(dir.x * 0.2, dir.y * 0.2, dir.z * 0.2));
    const tipPos = base.clone().addScaledVector(n, 0.075);
    const col = dark[i % 4];
    b.part(spk, col, { at: base.clone().addScaledVector(n, 0.04).toArray(), dir: n.toArray(), bone: spine } as any);
    b.part(tipG, "#f2e2b8", { at: tipPos.toArray(), dir: n.toArray(), bone: spine } as any);
  }

  // head
  b.part(new THREE.SphereGeometry(0.095, 10, 8), "#d9b585", { at: [0, 0.14, 0.2], bone: head, scale: [1, 0.9, 1.05] } as any);
  // snout
  b.part(new THREE.ConeGeometry(0.075, 0.17, 8), "#e3c498", { at: [0, 0.125, 0.3], dir: [0, 0, 1], bone: head } as any);
  // lower jaw
  b.part(new THREE.BoxGeometry(0.06, 0.02, 0.12), "#cfa877", { at: [0, 0.09, 0.27], bone: jaw } as any);
  // nose
  b.part(new THREE.SphereGeometry(0.026, 8, 6), "#0a0a0c", { at: [0, 0.122, 0.388], bone: head } as any);
  b.part(new THREE.SphereGeometry(0.008, 5, 4), "#ffffff", { at: [0.009, 0.133, 0.408], bone: head } as any);
  // eyes and ears
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.022, 8, 6), "#050505", { at: [0.055 * s, 0.17, 0.27], bone: head } as any);
    b.part(new THREE.SphereGeometry(0.007, 5, 4), "#ffffff", { at: [0.06 * s, 0.178, 0.287], bone: head } as any);
    b.part(new THREE.SphereGeometry(0.035, 8, 6), "#c99f77", { at: [0.075 * s, 0.215, 0.17], bone: head, scale: [0.6, 1, 1] } as any);
    b.part(new THREE.SphereGeometry(0.02, 6, 5), "#e9a7a0", { at: [0.081 * s, 0.213, 0.178], bone: head, scale: [0.5, 1, 1] } as any);
  }
  // cheek tufts
  b.part(new THREE.SphereGeometry(0.05, 8, 6), "#e6cba3", { at: [0, 0.1, 0.19], bone: head } as any);

  // legs with pink paws
  for (const n of Object.keys(legs)) {
    const x = n.endsWith("L") ? 1 : -1;
    const z = n.startsWith("F") ? 0.16 : -0.1;
    b.part(new THREE.CylinderGeometry(0.03, 0.026, 0.07, 6), "#d9b585", { at: [0.11 * x, 0.06, z], bone: legs[n] } as any);
    b.part(new THREE.BoxGeometry(0.06, 0.03, 0.08), "#f0a6b0", { at: [0.115 * x, 0.015, z + 0.02], bone: legs[n] } as any);
    for (const t of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(0.014, 5, 4), "#e88c9c", { at: [0.115 * x + t * 0.02, 0.015, z + 0.065], bone: legs[n] } as any);
    }
  }
  // tiny tail
  b.part(new THREE.ConeGeometry(0.025, 0.05, 5), "#d9b585", { at: [0, 0.1, -0.3], dir: [0, 0, -1], bone: root } as any);

  // maple leaf stuck on spines
  const leafBone = spine;
  const lp: [number, number][] = [];
  const pts = 5;
  for (let i = 0; i < pts * 2; i++) {
    const a = (i / (pts * 2)) * Math.PI * 2 + Math.PI / 2;
    const r = i % 2 === 0 ? 0.075 : 0.034;
    lp.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  const shape = new THREE.Shape();
  lp.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
  shape.closePath();
  const leafGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.006, bevelEnabled: false });
  const leafPos = new THREE.Vector3(-0.07, 0.34, -0.08);
  const leafN = new THREE.Vector3(-0.3, 0.8, -0.3).normalize();
  b.part(leafGeo, "#c8261b", { at: leafPos.toArray(), dir: leafN.toArray(), bone: leafBone } as any);
  b.part(new THREE.BoxGeometry(0.008, 0.008, 0.06), "#8f1a12", { at: [-0.07, 0.34, -0.08], dir: [0.4, 0.9, 0.2], bone: leafBone } as any);
  b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.05, 4), "#6b3b1c", { at: [-0.085, 0.31, -0.095], dir: [-0.3, 0.8, -0.3], bone: leafBone } as any);

  return b.root;
}
```