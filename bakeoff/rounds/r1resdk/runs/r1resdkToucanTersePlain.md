```ts
import * as THREE from "three";

export const meta = {
  name: "Toucan",
  description: "Stylized low-poly toco toucan perched on a branch, built from primitives with a big striped bill.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, r = 0.8) => {
    const k = c + "_" + r;
    if (!mats[k]) mats[k] = new THREE.MeshStandardMaterial({ color: c, roughness: r, flatShading: true });
    return mats[k];
  };
  const add = (g: THREE.BufferGeometry, m: THREE.Material, p: number[], s: number[] = [1, 1, 1], r: number[] = [0, 0, 0], parent: THREE.Object3D = root) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(p[0], p[1], p[2]);
    me.scale.set(s[0], s[1], s[2]);
    me.rotation.set(r[0], r[1], r[2]);
    parent.add(me);
    return me;
  };
  const sph = (w = 6, h = 5) => new THREE.SphereGeometry(1, w, h);

  const black = M(0x15151a), white = M(0xf8f6ee), orange = M(0xff8a1c, 0.5), yellow = M(0xffc20e, 0.5),
    red = M(0xd8281c, 0.5), blue = M(0x39a8e8, 0.4), brown = M(0x5a3b22, 1), green = M(0x3f7a33, 1), tipBlack = M(0x111111, 0.4);

  // Branch
  const branchY = 0.0;
  add(new THREE.CylinderGeometry(0.025, 0.03, 0.8, 6), brown, [0, 0.03, 0], [1, 1, 1], [0, 0, Math.PI / 2]);
  add(new THREE.CylinderGeometry(0.012, 0.018, 0.25, 5), brown, [0.3, 0.12, 0], [1, 1, 1], [0, 0, -0.6]);
  for (let i = 0; i < 3; i++) add(sph(5, 3), green, [0.33 + i * 0.05, 0.22 + i * 0.03, (i - 1) * 0.04], [0.06, 0.012, 0.03], [0, i, 0.3]);

  // Body tilted group (perched, mostly upright lean)
  const body = new THREE.Group();
  body.position.set(0, 0.08, 0);
  body.rotation.x = 0.35;
  root.add(body);

  add(sph(8, 6), black, [0, 0.23, 0], [0.085, 0.16, 0.095], [0, 0, 0], body);
  // belly
  add(sph(7, 5), black, [0, 0.2, 0.03], [0.08, 0.14, 0.085], [0, 0, 0], body);
  // white throat/chest
  add(sph(7, 5), white, [0, 0.36, 0.055], [0.075, 0.075, 0.05], [0, 0, 0], body);
  add(sph(6, 4), yellow, [0, 0.36, 0.075], [0.055, 0.055, 0.03], [0, 0, 0], body);
  // red undertail
  add(sph(6, 4), red, [0, 0.07, -0.04], [0.06, 0.04, 0.06], [0, 0, 0], body);
  // white rump
  add(sph(6, 4), white, [0, 0.09, -0.08], [0.06, 0.03, 0.04], [0, 0, 0], body);

  // Wings
  for (const s of [-1, 1]) {
    add(sph(6, 4), black, [s * 0.085, 0.24, -0.02], [0.03, 0.15, 0.08], [0.1, 0, s * -0.08], body);
  }

  // Tail
  add(new THREE.BoxGeometry(0.1, 0.02, 0.28), black, [0, 0.05, -0.2], [1, 1, 1], [-0.25, 0, 0], body);
  add(new THREE.BoxGeometry(0.1, 0.021, 0.04), white, [0, 0.062, -0.07], [1, 1, 1], [-0.25, 0, 0], body);

  // Head (counter-rotate to be level)
  const head = new THREE.Group();
  head.position.set(0, 0.42, 0.04);
  head.rotation.x = -0.35;
  body.add(head);
  add(sph(8, 6), black, [0, 0, 0], [0.065, 0.065, 0.075], [0, 0, 0], head);
  // eye ring
  for (const s of [-1, 1]) {
    add(sph(6, 4), blue, [s * 0.052, 0.015, 0.035], [0.022, 0.03, 0.03], [0, 0, 0], head);
    add(sph(5, 4), black, [s * 0.066, 0.017, 0.037], [0.008, 0.015, 0.015], [0, 0, 0], head);
    add(sph(5, 4), orange, [s * 0.05, 0.015, 0.037], [0.018, 0.025, 0.02], [0, 0, 0], head).scale.x = 0.5;
  }
  // fix eye layering: pupil on top
  for (const s of [-1, 1]) add(sph(5, 4), black, [s * 0.063, 0.017, 0.04], [0.007, 0.012, 0.012], [0, 0, 0], head);

  // Bill: stacked tapered segments
  const bill = new THREE.Group();
  bill.position.set(0, -0.005, 0.06);
  bill.rotation.x = 0.08;
  head.add(bill);
  const segs = 7, L = 0.26;
  for (let i = 0; i < segs; i++) {
    const t = i / segs, t2 = (i + 1) / segs;
    const w1 = 0.05 * (1 - t * 0.6), w2 = 0.05 * (1 - t2 * 0.6);
    const h1 = 0.06 * (1 - t * 0.7), h2 = 0.06 * (1 - t2 * 0.7);
    const g = new THREE.CylinderGeometry(1, 1, L / segs + 0.002, 6, 1);
    g.rotateX(Math.PI / 2);
    const m = i === segs - 1 ? tipBlack : i === 0 ? black : orange;
    const me = add(g, m, [0, -t * 0.03 - 0.005, (t + 0.5 / segs) * L], [(w1 + w2) / 2, (h1 + h2) / 2, 1], [0, 0, 0], bill);
    // upper ridge
    if (i > 0 && i < segs - 1) add(new THREE.BoxGeometry(0.02 * (1 - t * 0.5), 0.012, L / segs), yellow, [0, (h1 + h2) / 2 * 0.85 - t * 0.03, (t + 0.5 / segs) * L], [1, 1, 1], [0, 0, 0], bill);
  }
  // bill base stripe
  add(new THREE.CylinderGeometry(1, 1, 0.012, 6).rotateX(Math.PI / 2), black, [0, 0, 0.065], [0.052, 0.062, 1], [0, 0, 0], bill);
  // nostril dots
  for (const s of [-1, 1]) add(sph(4, 3), black, [s * 0.04, 0.012, 0.085], [0.006, 0.006, 0.006], [0, 0, 0], bill);

  // Legs and feet
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.012, 0.01, 0.1, 5), blue, [s * 0.04, 0.1, 0.02], [1, 1, 1], [0, 0, 0]);
    for (const a of [-0.25, 0.25, 0]) add(new THREE.BoxGeometry(0.014, 0.014, 0.065), blue, [s * 0.04 + a * 0.06, 0.07, 0.05], [1, 1, 1], [0.1, a, 0]);
    add(new THREE.BoxGeometry(0.014, 0.014, 0.04), blue, [s * 0.04, 0.07, -0.025]);
  }
  // legs rest on branch top (y≈0.055); lift feet slightly
  root.children.forEach(c => { if (c instanceof THREE.Mesh && c.material === blue && c.position.y < 0.11 && c.position.y > 0.06 && c.geometry.type === "BoxGeometry") c.position.y = 0.065; });

  // Sink branch to floor: shift whole model so branch bottom ~ y=0
  root.position.y = 0.0;
  root.children.forEach(c => { c.position.y += 0; });
  const wrap = new THREE.Group();
  wrap.add(root);
  root.position.y = 0.0;
  return wrap;
}
```