```ts
import * as THREE from "three";

export const meta = {
  name: "Hot-Air Balloon",
  description: "Striped low-poly hot-air balloon with patterned band, glowing burner, ropes, wicker basket, sandbags and flag, ready for take-off.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => {
    const k = c + JSON.stringify(o);
    if (!mats[k]) mats[k] = new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: true, ...o });
    return mats[k];
  };
  const add = (g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, p: THREE.Object3D = root) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(x, y, z);
    p.add(me);
    return me;
  };

  // Envelope profile (lathe), radius by height
  const baseY = 3.2; // mouth height
  const prof: [number, number][] = [
    [0.55, 0], [0.9, 0.7], [1.7, 1.7], [2.5, 3.0], [3.0, 4.5], [3.1, 5.8], [2.7, 7.2], [1.9, 8.4], [0.9, 9.1], [0.01, 9.4],
  ];
  const segs = 18;
  const cols = [0xffc928, 0xe8412c, 0x3aa0e0];
  const pts = prof.map(([r, y]) => new THREE.Vector2(r, y));
  const env = new THREE.Group();
  env.position.y = baseY;
  root.add(env);
  // vertical stripe gores
  for (let i = 0; i < segs; i++) {
    const g = new THREE.LatheGeometry(pts, 1, (i / segs) * Math.PI * 2, (Math.PI * 2) / segs);
    add(g, M(cols[i % 3], { side: THREE.DoubleSide }), 0, 0, 0, env);
  }
  // patterned band: canvas texture
  const cv = document.createElement("canvas");
  cv.width = 256; cv.height = 32;
  const cx = cv.getContext("2d")!;
  cx.fillStyle = "#fff4dc"; cx.fillRect(0, 0, 256, 32);
  for (let i = 0; i < 16; i++) {
    cx.fillStyle = i % 2 ? "#e8412c" : "#2a5fa8";
    cx.beginPath();
    cx.moveTo(i * 16, 2); cx.lineTo(i * 16 + 16, 2); cx.lineTo(i * 16 + 8, 16); cx.fill();
    cx.fillStyle = "#ffc928";
    cx.beginPath();
    cx.moveTo(i * 16, 30); cx.lineTo(i * 16 + 16, 30); cx.lineTo(i * 16 + 8, 17); cx.fill();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  const bandPts = [[2.62, 3.5], [3.0, 4.5], [3.1, 5.8], [2.95, 6.5]].map(([r, y]) => new THREE.Vector2(r + 0.04, y));
  const band = add(new THREE.LatheGeometry(bandPts, segs), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, flatShading: true, side: THREE.DoubleSide }), 0, 0, 0, env);
  band.scale.set(1, 1, 1);
  // trim rings
  const gold = M(0xf3e3b0);
  for (const [r, y] of [[2.66, 3.5], [3.0, 6.5]] as [number, number][])
    add(new THREE.TorusGeometry(r + 0.06, 0.05, 5, segs).rotateX(Math.PI / 2), gold, 0, y, 0, env);
  // top cap
  add(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 8), M(0x8a2a1c), 0, 9.4, 0, env);
  // skirt at mouth
  add(new THREE.CylinderGeometry(0.75, 0.55, 0.4, segs, 1, true), M(0x2a3a6a, { side: THREE.DoubleSide }), 0, -0.05, 0, env);

  // Burner
  const metal = M(0x777b82, { metalness: 0.6, roughness: 0.4 });
  const by = 2.9;
  add(new THREE.TorusGeometry(0.42, 0.04, 5, 12).rotateX(Math.PI / 2), metal, 0, by, 0);
  add(new THREE.CylinderGeometry(0.12, 0.16, 0.3, 8), metal, 0, by - 0.25, 0);
  add(new THREE.CylinderGeometry(0.2, 0.1, 0.18, 8), M(0x333333), 0, by - 0.05, 0);
  const flameM = new THREE.MeshStandardMaterial({ color: 0xff8a1a, emissive: 0xff6a00, emissiveIntensity: 2, flatShading: true, transparent: true, opacity: 0.92 });
  add(new THREE.ConeGeometry(0.2, 0.7, 7), flameM, 0, by + 0.4, 0);
  add(new THREE.ConeGeometry(0.1, 0.5, 6), new THREE.MeshStandardMaterial({ color: 0xffe27a, emissive: 0xffd040, emissiveIntensity: 2 }), 0, by + 0.3, 0);
  const light = new THREE.PointLight(0xff8a30, 3, 6);
  light.position.set(0, by + 0.3, 0);
  root.add(light);

  // Basket
  const bw = 1.3, bh = 0.95, by0 = 0.25;
  const wick = M(0xc08a4a), wickD = M(0x9a6a32), wickL = M(0xd9a766);
  add(new THREE.BoxGeometry(bw * 2, 0.12, bw * 2 - 0.0), wickD, 0, by0 + 0.06, 0);
  for (let i = 0; i < 4; i++) { // legs/skids
    add(new THREE.BoxGeometry(0.16, 0.25, bw * 2 + 0.1), wickD, (i < 2 ? -1 : 1) * 0, 0, 0).visible = false;
  }
  add(new THREE.BoxGeometry(0.18, 0.25, bw * 2), wickD, -0.9, 0.125, 0);
  add(new THREE.BoxGeometry(0.18, 0.25, bw * 2), wickD, 0.9, 0.125, 0);
  const sideW = (w: number, x: number, z: number, ry: number) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    root.add(g);
    // woven: horizontal slats and vertical staves
    for (let r = 0; r < 8; r++)
      add(new THREE.BoxGeometry(w, 0.1, 0.1), r % 2 ? wick : wickL, 0, by0 + 0.18 + r * 0.115, 0, g);
    for (let s = 0; s < 11; s++)
      add(new THREE.BoxGeometry(0.07, bh - 0.1, 0.13), wickD, -w / 2 + 0.1 + (s * (w - 0.2)) / 10, by0 + bh / 2 + 0.05, 0, g);
  };
  const half = bw;
  sideW(bw * 2, 0, half, 0);
  sideW(bw * 2, 0, -half, 0);
  sideW(bw * 2, half, 0, Math.PI / 2);
  sideW(bw * 2, -half, 0, Math.PI / 2);
  const topY = by0 + bh + 0.1;
  const rim = M(0x7a4f24);
  for (const [w, d, x, z] of [[bw * 2 + 0.24, 0.14, 0, half], [bw * 2 + 0.24, 0.14, 0, -half], [0.14, bw * 2 + 0.24, half, 0], [0.14, bw * 2 + 0.24, -half, 0]] as number[][])
    add(new THREE.BoxGeometry(w, 0.1, d), rim, x, topY, z);
  // leather corner posts
  const leather = M(0x5a3418);
  const corners: [number, number][] = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
  for (const [sx, sz] of corners)
    add(new THREE.BoxGeometry(0.14, bh + 0.35, 0.14), leather, sx * half, by0 + (bh + 0.1) / 2 + 0.05, sz * half);

  // Struts and ropes to envelope
  const rope = M(0xe8dcc0);
  const strut = (a: THREE.Vector3, b: THREE.Vector3, r: number, m: THREE.Material) => {
    const d = b.clone().sub(a);
    const me = add(new THREE.CylinderGeometry(r, r, d.length(), 5), m);
    me.position.copy(a.clone().add(b).multiplyScalar(0.5));
    me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  };
  for (const [sx, sz] of corners) {
    const a = new THREE.Vector3(sx * half, topY + 0.1, sz * half);
    const b = new THREE.Vector3(sx * 0.62, baseY + 0.1, sz * 0.62);
    strut(a, b, 0.03, rope);
    add(new THREE.SphereGeometry(0.07, 6, 5), leather, a.x, a.y, a.z);
  }
  // burner frame poles
  for (const [sx, sz] of corners)
    strut(new THREE.Vector3(sx * 0.4, by, sz * 0.4), new THREE.Vector3(sx * 0.62, baseY + 0.1, sz * 0.62), 0.025, metal);
  // propane tank
  add(new THREE.CylinderGeometry(0.22, 0.22, 0.6, 10), M(0xb8c2c8, { metalness: 0.5, roughness: 0.4 }), -0.6, by0 + 0.4, 0.2);
  add(new THREE.SphereGeometry(0.22, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(0xb8c2c8, { metalness: 0.5, roughness: 0.4 }), -0.6, by0 + 0.7, 0.2);

  // Sandbags hanging on sides
  const sack = M(0xd8c08a), sackBand = M(0xb04030);
  const bagPos: [number, number, number][] = [[-0.6, 1, 0], [0.6, 1, 0], [-0.6, -1, Math.PI], [0.6, -1, Math.PI], [1, 0.0, 0], [-1, 0.0, 0]];
  bagPos.forEach(([a, b], i) => {
    let x: number, z: number;
    if (i < 4) { x = a * half; z = b * (half + 0.18); } else { x = a * (half + 0.18); z = 0; }
    const y = by0 + 0.45;
    const g = new THREE.Group();
    g.position.set(x, y, z);
    root.add(g);
    add(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4), rope, 0, 0.25, 0, g);
    add(new THREE.SphereGeometry(0.2, 8, 6).scale(1, 1.15, 0.8), sack, 0, -0.05, 0, g);
    add(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 8), sackBand, 0, 0.14, 0, g);
    add(new THREE.ConeGeometry(0.09, 0.1, 6), sack, 0, 0.21, 0, g);
    if (i >= 4) g.rotation.y = Math.PI / 2;
  });

  // Flag on a corner
  const fx = half, fz = half;
  add(new THREE.CylinderGeometry(0.025, 0.025, 1.3, 5), M(0xf0f0f0), fx, topY + 0.6, fz);
  add(new THREE.SphereGeometry(0.05, 6, 5), M(0xffc928), fx, topY + 1.27, fz);
  const flagShape = new THREE.Shape();
  flagShape.moveTo(0, 0); flagShape.lineTo(0.6, -0.1); flagShape.lineTo(0.5, -0.22); flagShape.lineTo(0.6, -0.34); flagShape.lineTo(0, -0.4); flagShape.closePath();
  const flag = add(new THREE.ShapeGeometry(flagShape), M(0xe8412c, { side: THREE.DoubleSide }), fx, topY + 1.2, fz);
  flag.rotation.y = -0.3;
  add(new THREE.CircleGeometry(0.07, 6), M(0xffc928, { side: THREE.DoubleSide }), fx + 0.12, topY + 1.03, fz + 0.04).rotation.y = -0.3;

  // Tether ground stakes
  root.position.y = 0;
  return root;
}
```