import * as THREE from "three";

export const meta = {
  name: "Treasure Chest",
  description: "Stylized wooden treasure chest with iron bands, gold trim, open lid and spilling coins and gems.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function woodTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#8a5428";
  g.fillRect(0, 0, 128, 128);
  const r = rng(7);
  for (let i = 0; i < 8; i++) {
    g.fillStyle = i % 2 ? "#7a481f" : "#955c2e";
    g.fillRect(0, i * 16, 128, 15);
    g.strokeStyle = "rgba(40,20,5,0.5)";
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, i * 16); g.lineTo(128, i * 16); g.stroke();
    for (let k = 0; k < 6; k++) {
      g.strokeStyle = "rgba(50,25,8,0.35)";
      g.lineWidth = 1;
      const y = i * 16 + 2 + r() * 12, x = r() * 100;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + 10 + r() * 20, y + (r() - 0.5) * 2); g.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const tex = woodTexture();
  const wood = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x3b2210, roughness: 1 });
  const iron = new THREE.MeshStandardMaterial({ color: 0x3a3f48, roughness: 0.5, metalness: 0.7 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xf2b92a, roughness: 0.3, metalness: 0.9 });
  const red = new THREE.MeshStandardMaterial({ color: 0xd8203a, roughness: 0.2, metalness: 0.2, flatShading: true });
  const green = new THREE.MeshStandardMaterial({ color: 0x20c070, roughness: 0.2, flatShading: true });
  const blue = new THREE.MeshStandardMaterial({ color: 0x3a8cff, roughness: 0.2, flatShading: true });
  const pearl = new THREE.MeshStandardMaterial({ color: 0xf4eee0, roughness: 0.3 });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, p: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    p.add(m);
    return m;
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  const W = 0.9, D = 0.55, H = 0.4;
  // base
  add(box(W, H, D), wood, 0, H / 2 + 0.04, 0);
  // feet
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    add(box(0.1, 0.06, 0.1), iron, sx * (W / 2 - 0.04), 0.03, sz * (D / 2 - 0.04));
  // inner dark & gold fill
  add(box(W - 0.08, 0.02, D - 0.08), darkWood, 0, H + 0.04 - 0.02, 0);
  // base bands
  for (const sx of [-1, 1]) {
    add(box(0.08, H + 0.02, D + 0.03), iron, sx * (W / 2 - 0.1), H / 2 + 0.04, 0);
    add(box(0.1, 0.05, D + 0.05), gold, sx * (W / 2 - 0.1), H + 0.04, 0);
  }
  // corner studs and rim
  add(box(W + 0.03, 0.05, D + 0.03), iron, 0, 0.07, 0);
  add(box(W + 0.03, 0.04, D + 0.03), iron, 0, H + 0.03, 0);
  // treasure pile
  const pile = add(new THREE.CylinderGeometry(0.3, 0.38, 0.1, 8), gold, 0, H + 0.08, 0);
  pile.scale.set(1.1, 1, 0.7);
  const r = rng(42);
  const coinGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.012, 8);
  for (let i = 0; i < 45; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r());
    const c = add(coinGeo, gold, Math.cos(a) * d * 0.36, H + 0.14 + (1 - d) * 0.06 + r() * 0.02, Math.sin(a) * d * 0.2);
    c.rotation.set((r() - 0.5) * 0.8, r() * 3, (r() - 0.5) * 0.8);
  }
  const gemGeo = new THREE.OctahedronGeometry(0.045);
  const gems = [red, green, blue, red, blue, green];
  gems.forEach((m, i) => {
    const g = add(gemGeo, m, -0.25 + i * 0.1, H + 0.2 + (i % 2) * 0.02, (i % 3 - 1) * 0.08);
    g.rotation.set(r(), r(), r());
  });
  add(new THREE.SphereGeometry(0.04, 8, 6), pearl, 0.1, H + 0.2, 0.12);
  // coins spilling out front
  for (let i = 0; i < 10; i++) {
    const c = add(coinGeo, gold, (r() - 0.5) * 0.5, 0.02 + 0.004 * i, D / 2 + 0.08 + r() * 0.2);
    c.rotation.set((r() - 0.5) * 0.2, r() * 3, (r() - 0.5) * 0.2);
    c.position.y = 0.008 + (i % 3) * 0.013;
  }
  add(gemGeo, red, 0.3, 0.04, D / 2 + 0.2).rotation.set(0.5, 1, 0);

  // lid, hinged at back top, opened ~ 110deg
  const hinge = new THREE.Group();
  hinge.position.set(0, H + 0.04, -D / 2);
  hinge.rotation.x = -Math.PI * 0.6;
  root.add(hinge);
  const R = D / 2;
  const arch = new THREE.CylinderGeometry(R, R, W, 8, 1, false, 0, Math.PI);
  arch.rotateZ(Math.PI / 2); // axis along X
  // half cylinder: after rotation, orient arch to bulge along +Y (lid closed local)
  arch.rotateX(-Math.PI / 2);
  const lid = add(arch, wood, 0, 0, R, hinge);
  lid.material = wood;
  (lid.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  // end caps
  for (const sx of [-1, 1]) {
    const cap = new THREE.CircleGeometry(R, 8, 0, Math.PI);
    cap.rotateY(sx * Math.PI / 2);
    cap.rotateX(-Math.PI / 2);
    add(cap, darkWood, sx * (W / 2), 0, R, hinge).material.side = THREE.DoubleSide;
  }
  // lid bands
  const bandGeo = new THREE.CylinderGeometry(R + 0.015, R + 0.015, 0.08, 8, 1, true, 0, Math.PI);
  bandGeo.rotateZ(Math.PI / 2);
  bandGeo.rotateX(-Math.PI / 2);
  for (const sx of [-1, 1]) {
    const b = add(bandGeo, iron, sx * (W / 2 - 0.1), 0, R, hinge);
    (b.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  }
  // lid rim
  add(box(W + 0.03, 0.04, 0.05), iron, 0, 0.0, 0.01, hinge);
  add(box(W + 0.03, 0.04, 0.05), iron, 0, 0.0, D - 0.01, hinge);
  // lid gold stud
  add(new THREE.SphereGeometry(0.03, 6, 4), gold, 0, R + 0.02, R, hinge);

  // front lock plate and keyhole
  add(box(0.12, 0.14, 0.03), gold, 0, H - 0.04, D / 2 + 0.02);
  add(box(0.02, 0.05, 0.01), darkWood, 0, H - 0.04, D / 2 + 0.04);
  // rivets on bands
  const rv = new THREE.SphereGeometry(0.016, 5, 4);
  for (const sx of [-1, 1]) for (const y of [0.12, 0.3])
    add(rv, gold, sx * (W / 2 - 0.1), y, D / 2 + 0.02);

  return root;
}
