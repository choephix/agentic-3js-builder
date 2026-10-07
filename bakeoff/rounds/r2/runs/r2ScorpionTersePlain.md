```ts
import * as THREE from "three";

export const meta = {
  name: "Desert Scorpion",
  description: "Stylized low-poly scorpion built from primitives: segmented body, curled tail with stinger, pincers, and eight jointed legs.",
};

export default function build(): THREE.Object3D {
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);

  const mk = (c: number, r = 0.6) =>
    new THREE.MeshStandardMaterial({ color: c, roughness: r, flatShading: true });
  const shell = mk(0xb5742b), dark = mk(0x6e3f17), light = mk(0xd9a24f);
  const eye = mk(0x111111, 0.2), sting = mk(0x2a1a12, 0.3), glow = mk(0xe04a1a, 0.4);

  // canvas texture for the carapace
  const cv = document.createElement("canvas");
  cv.width = cv.height = 64;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#b5742b"; g.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 60; i++) {
    g.fillStyle = rnd() > 0.5 ? "#9a5d20" : "#cf9040";
    g.fillRect(rnd() * 64, rnd() * 64, 3, 3);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.magFilter = THREE.NearestFilter;
  const plated = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, flatShading: true });

  const root = new THREE.Group();
  const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, m: THREE.Material,
    p: number[], sc: number[] = [1, 1, 1], r: number[] = [0, 0, 0]) => {
    const me = new THREE.Mesh(geo, m);
    me.position.set(p[0], p[1], p[2]);
    me.scale.set(sc[0], sc[1], sc[2]);
    me.rotation.set(r[0], r[1], r[2]);
    parent.add(me);
    return me;
  };
  const box = new THREE.BoxGeometry(1, 1, 1);
  const sph = new THREE.SphereGeometry(0.5, 8, 6);
  const cone = new THREE.ConeGeometry(0.5, 1, 6);

  const H = 0.07; // body center height
  // Carapace
  add(root, box, plated, [0, H + 0.03, 0.2], [0.2, 0.07, 0.24]);
  add(root, box, shell, [0, H + 0.075, 0.1], [0.15, 0.03, 0.12]);
  add(root, box, plated, [0, H + 0.02, 0.34], [0.14, 0.06, 0.1]);
  // eyes
  for (const x of [-0.03, 0.03]) add(root, sph, eye, [x, H + 0.1, 0.22], [0.035, 0.035, 0.035]);
  for (const x of [-0.075, 0.075]) for (let i = 0; i < 2; i++)
    add(root, sph, eye, [x, H + 0.06, 0.37 - i * 0.03], [0.02, 0.02, 0.02]);
  // Abdomen: 7 tapering segments
  for (let i = 0; i < 7; i++) {
    const w = 0.19 - i * 0.015;
    const z = 0.04 - i * 0.07;
    add(root, box, i % 2 ? shell : plated, [0, H + 0.01, z], [w, 0.09 - i * 0.004, 0.07]);
    add(root, box, dark, [0, H + 0.06 - i * 0.002, z], [w * 0.7, 0.012, 0.055]);
    add(root, box, light, [0, H - 0.04, z], [w * 0.8, 0.02, 0.06]);
  }

  // Tail: curling up and forward over the body
  const tail = new THREE.Group();
  root.add(tail);
  let y = H + 0.02, z = -0.5;
  const segs = 6;
  for (let i = 0; i < segs; i++) {
    const a = 0.25 + i * 0.5; // angle: 0 backward, grows to curl forward
    const len = 0.09;
    const dz = -Math.cos(a) * len, dy = Math.sin(a) * len;
    const sz = 0.055 - i * 0.003;
    z += dz / 2; y += dy / 2;
    const m = add(tail, sph, i % 2 ? shell : light, [0, y, z], [sz, sz, len * 1.4]);
    m.rotation.x = a;
    z += dz / 2; y += dy / 2;
  }
  // stinger bulb + barb
  add(tail, sph, glow, [0, y + 0.01, z + 0.02], [0.08, 0.08, 0.08]);
  add(tail, cone, sting, [0, y + 0.01, z + 0.09], [0.04, 0.12, 0.04], [Math.PI / 2 + 0.7, 0, 0]);

  // Pincers
  for (const sd of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(sd * 0.07, H, 0.44);
    arm.rotation.y = sd * -0.5;
    root.add(arm);
    add(arm, box, shell, [0, 0, 0.07], [0.04, 0.04, 0.16]);
    const elbow = new THREE.Group();
    elbow.position.set(0, 0, 0.15);
    elbow.rotation.y = sd * 0.9;
    arm.add(elbow);
    add(elbow, box, light, [0, 0, 0.05], [0.045, 0.045, 0.1]);
    // claw palm
    add(elbow, sph, shell, [0, 0, 0.17], [0.11, 0.06, 0.14]);
    // fixed finger
    add(elbow, cone, dark, [-0.02, 0, 0.29], [0.04, 0.14, 0.035], [Math.PI / 2, 0, 0]);
    // movable finger
    add(elbow, cone, dark, [0.04, 0, 0.28], [0.035, 0.13, 0.03], [Math.PI / 2, 0, -0.25]);
  }

  // Legs: 4 per side
  for (const sd of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const z0 = 0.3 - i * 0.07;
      const sw = (i - 1.5) * 0.35; // splay fore/aft
      const leg = new THREE.Group();
      leg.position.set(sd * 0.09, H - 0.01, z0);
      leg.rotation.y = sd * (Math.PI / 2) - sw * sd * 0.6 * 0 + sw * -1 * 0.0;
      root.add(leg);
      const yaw = new THREE.Group();
      yaw.rotation.y = -sw * 0.5 * 1;
      leg.add(yaw);
      // leg local z points outward
      add(yaw, box, dark, [0, 0.03, 0.06], [0.022, 0.022, 0.13], [-0.5, 0, 0]);
      const knee = new THREE.Group();
      knee.position.set(0, 0.065, 0.12);
      yaw.add(knee);
      add(knee, sph, light, [0, 0, 0], [0.032, 0.032, 0.032]);
      add(knee, box, shell, [0, -0.04, 0.05], [0.02, 0.02, 0.14], [0.65, 0, 0]);
      add(knee, cone, dark, [0, -0.1, 0.1], [0.02, 0.04, 0.02], [Math.PI, 0, 0]);
    }
  }

  // Sink slightly: lift so lowest point touches floor
  const bb = new THREE.Box3().setFromObject(root);
  root.position.y -= bb.min.y - 0.002;
  const wrap = new THREE.Group();
  wrap.add(root);
  return wrap;
}
```