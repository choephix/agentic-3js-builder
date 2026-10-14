```ts
import * as THREE from "three";

export const meta = {
  name: "Green Sea Turtle",
  description: "Gliding green sea turtle with a heart-shaped scuted shell, spread flippers, cream-edged head scales and a remora riding underneath.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const R = rng(7);
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, rough = 0.7) => {
    const k = c + "_" + rough;
    if (!mats[k]) mats[k] = new THREE.MeshStandardMaterial({ color: c, roughness: rough, flatShading: true });
    return mats[k];
  };

  // shell texture
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#7a7a32";
  g.fillRect(0, 0, 256, 256);
  const cols = ["#8a8236", "#b0802f", "#6e7430", "#a06c2a"];
  const cells: [number, number][] = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) cells.push([c * 64 + (r % 2) * 32 - 16, r * 52 - 4]);
  cells.forEach(([x, y], i) => {
    g.fillStyle = cols[(i * 7 + (i >> 2)) % 4];
    g.fillRect(x + 3, y + 3, 58, 46);
    g.strokeStyle = "#3d2a12";
    g.lineWidth = 5;
    g.strokeRect(x + 2, y + 2, 60, 48);
  });
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const shellMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, flatShading: true });

  const body = new THREE.Group();
  root.add(body);

  // heart-shaped shell outline (top view: x, z)
  const sh = new THREE.Shape();
  sh.moveTo(0, -0.55);
  sh.bezierCurveTo(0.2, -0.55, 0.42, -0.45, 0.46, -0.1);
  sh.bezierCurveTo(0.5, 0.25, 0.3, 0.45, 0, 0.5);
  sh.bezierCurveTo(-0.3, 0.45, -0.5, 0.25, -0.46, -0.1);
  sh.bezierCurveTo(-0.42, -0.45, -0.2, -0.55, 0, -0.55);
  // heart: notch at rear (negative z), point at front
  const pts = sh.getPoints(10);
  const shape2 = new THREE.Shape(pts.map(p => new THREE.Vector2(p.x, p.y)));
  const geo = new THREE.ExtrudeGeometry(shape2, { depth: 0.1, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.12, bevelSegments: 2, steps: 1 });
  geo.rotateX(Math.PI / 2); // shape y -> z... extrude along -y
  geo.translate(0, 0.1, 0);
  // fix UVs to top-view planar
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) * 1.1 + 0.5, pos.getZ(i) * 1.1 + 0.5);
  const shell = new THREE.Mesh(geo, shellMat);
  shell.scale.set(1, 1.5, 1.1);
  shell.position.y = 0.3;
  body.add(shell);

  // dome ridge on top
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), shellMat);
  dome.scale.set(1, 0.55, 1.4);
  dome.position.set(0, 0.45, 0);
  body.add(dome);

  // plastron
  const belly = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.36, 0.1, 8), M(0xf0dc8a));
  belly.scale.set(1, 1, 1.5);
  belly.position.y = 0.2;
  body.add(belly);

  // rim scutes
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const x = Math.sin(a) * 0.5, z = Math.cos(a) * 0.72;
    if (z < -0.5 && Math.abs(x) < 0.08) continue;
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.1), M(0x4a3218));
    m.position.set(x, 0.32, z);
    m.rotation.y = a;
    body.add(m);
  }

  // head
  const head = new THREE.Group();
  head.position.set(0, 0.33, 0.8);
  body.add(head);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.25, 7), M(0x7c6a3a));
  neck.rotation.x = Math.PI / 2;
  neck.position.z = 0.0;
  head.add(neck);
  const skull = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.2, 0.3), M(0x7c6a3a));
  skull.position.set(0, 0.0, 0.2);
  head.add(skull);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.14), M(0x8a7640));
  snout.position.set(0, -0.03, 0.4);
  head.add(snout);
  const beak = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.08), M(0x4a3a20));
  beak.position.set(0, -0.1, 0.42);
  head.add(beak);
  // cream scales
  for (let i = 0; i < 6; i++) {
    const s = i % 3, side = i < 3 ? 1 : -1;
    const sc = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.07), M(0xf1e3a8));
    sc.position.set(side * 0.135, 0.04 - s * 0.02 + (R() - 0.5) * 0.01, 0.12 + s * 0.08);
    head.add(sc);
  }
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.22), M(0xb89a50));
  cap.position.set(0, 0.11, 0.22);
  head.add(cap);
  for (const sx of [1, -1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), M(0x120c08, 0.2));
    eye.position.set(sx * 0.125, 0.03, 0.3);
    head.add(eye);
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.01, 4, 3), M(0xffffff, 0.2));
    hl.position.set(sx * 0.15, 0.045, 0.31);
    head.add(hl);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.09), M(0x5a4a28));
    brow.position.set(sx * 0.13, 0.08, 0.3);
    brow.rotation.z = -sx * 0.3;
    head.add(brow);
  }

  // flippers: segments in a chain
  const flipper = (sx: number, z: number, len: number, wid: number, yaw: number, droop: number) => {
    const grp = new THREE.Group();
    grp.position.set(sx * 0.42, 0.25, z);
    grp.rotation.y = sx * yaw;
    grp.rotation.z = -sx * droop;
    const n = 4;
    let w = wid;
    for (let i = 0; i < n; i++) {
      const l = len / n;
      const seg = new THREE.Mesh(new THREE.BoxGeometry(l * 1.05, 0.045 - i * 0.006, w), M(i % 2 ? 0x6b5c32 : 0x7c6a3a));
      seg.position.set(sx * (l * (i + 0.5)), -i * 0.01, -i * 0.03);
      seg.rotation.z = -sx * 0.04 * i;
      grp.add(seg);
      w *= 0.72;
    }
    const tip = new THREE.Mesh(new THREE.ConeGeometry(wid * 0.2, 0.12, 4), M(0x5a4a28));
    tip.rotation.z = -sx * Math.PI / 2;
    tip.position.set(sx * (len + 0.03), -0.04, -0.1);
    grp.add(tip);
    // cream leading edge
    const edge = new THREE.Mesh(new THREE.BoxGeometry(len * 0.9, 0.015, 0.02), M(0xf1e3a8));
    edge.position.set(sx * len * 0.47, 0.025, wid * 0.5);
    grp.add(edge);
    body.add(grp);
  };
  for (const sx of [1, -1]) {
    flipper(sx, 0.38, 0.95, 0.24, -0.9, 0.18);
    flipper(sx, -0.62, 0.35, 0.17, 0.55, 0.1);
  }
  // tail
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 5), M(0x6b5c32));
  tail.rotation.x = -Math.PI / 2;
  tail.position.set(0, 0.25, -0.95);
  body.add(tail);

  // remora
  const rem = new THREE.Group();
  rem.position.set(0.05, 0.1, 0.0);
  rem.rotation.y = 0.1;
  const rb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), M(0x6f7f8a));
  rb.scale.set(0.8, 0.7, 3.2);
  rem.add(rb);
  const disc = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.015, 0.2), M(0x2f3a42));
  disc.position.set(0, 0.05, 0.02);
  rem.add(disc);
  const rt = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.1, 4), M(0x56666f));
  rt.rotation.set(Math.PI / 2, Math.PI / 4, 0);
  rt.scale.set(0.3, 1, 1);
  rt.position.z = -0.24;
  rem.add(rt);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.012, 0.3), M(0xe8eef0));
  stripe.position.set(0, 0.0, 0.0);
  stripe.scale.set(1, 1, 1);
  rem.add(stripe);
  const re = new THREE.Mesh(new THREE.SphereGeometry(0.012, 4, 3), M(0x111111));
  re.position.set(0.04, 0.01, 0.17);
  rem.add(re);
  const re2 = re.clone();
  re2.position.x = -0.04;
  rem.add(re2);
  body.add(rem);

  // lift so lowest point (remora/belly) is on floor; slight glide pitch
  body.rotation.x = -0.05;
  const box = new THREE.Box3().setFromObject(root);
  body.position.y -= box.min.y;
  return root;
}
```