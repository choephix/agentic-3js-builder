```ts
import * as THREE from "three";

export const meta = {
  name: "Pirate Treasure Chest",
  description: "Open weathered wooden chest with iron straps, studs, hanging padlock, spilling gold, pearls, goblet and gems, skull carved on front.",
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
  c.width = 256; c.height = 256;
  const g = c.getContext("2d")!;
  const r = rng(7);
  g.fillStyle = "#4a2e1a"; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4; i++) {
    const y = i * 64;
    g.fillStyle = i % 2 ? "#52341e" : "#432a17";
    g.fillRect(0, y, 256, 64);
    for (let k = 0; k < 18; k++) {
      g.strokeStyle = `rgba(${20 + r() * 20},${10 + r() * 10},5,0.5)`;
      g.lineWidth = 1 + r() * 1.5;
      const yy = y + 3 + r() * 58;
      g.beginPath(); g.moveTo(0, yy); g.lineTo(256, yy + (r() - 0.5) * 6); g.stroke();
    }
    g.fillStyle = "#1c0f06"; g.fillRect(0, y, 256, 3);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const r = rng(42);
  const tex = woodTexture();
  const wood = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, flatShading: true });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x2b1a0e, roughness: 1 });
  const iron = new THREE.MeshStandardMaterial({ color: 0x4d4038, roughness: 0.7, metalness: 0.6, flatShading: true });
  const rust = new THREE.MeshStandardMaterial({ color: 0x7a3f22, roughness: 0.9, metalness: 0.3, flatShading: true });
  const gold = new THREE.MeshStandardMaterial({ color: 0xffc933, roughness: 0.3, metalness: 0.9, flatShading: true });
  const gold2 = new THREE.MeshStandardMaterial({ color: 0xd9a21b, roughness: 0.35, metalness: 0.9, flatShading: true });
  const pearl = new THREE.MeshStandardMaterial({ color: 0xf6efe6, roughness: 0.2, metalness: 0.2 });
  const ruby = new THREE.MeshStandardMaterial({ color: 0xd1122b, roughness: 0.15, metalness: 0.3, flatShading: true, emissive: 0x440008 });
  const emerald = new THREE.MeshStandardMaterial({ color: 0x14b85a, roughness: 0.15, metalness: 0.3, flatShading: true, emissive: 0x033a18 });
  const bone = new THREE.MeshStandardMaterial({ color: 0xc9b78f, roughness: 0.9 });
  const velvet = new THREE.MeshStandardMaterial({ color: 0x6b1020, roughness: 1 });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };

  // Chest dimensions
  const W = 1.0, D = 0.6, H = 0.5;
  // base box (hollow: floor + 4 walls)
  add(new THREE.BoxGeometry(W, 0.04, D), wood, 0, 0.02, 0);
  add(new THREE.BoxGeometry(W, H, 0.05), wood, 0, H / 2, D / 2 - 0.025);
  add(new THREE.BoxGeometry(W, H, 0.05), wood, 0, H / 2, -D / 2 + 0.025);
  add(new THREE.BoxGeometry(0.05, H, D), wood, W / 2 - 0.025, H / 2, 0);
  add(new THREE.BoxGeometry(0.05, H, D), wood, -W / 2 + 0.025, H / 2, 0);
  // inner lining
  add(new THREE.BoxGeometry(W - 0.1, 0.02, D - 0.1), velvet, 0, 0.05, 0);
  // treasure pile inside
  const pile = add(new THREE.CylinderGeometry(0.3, 0.42, 0.2, 8), gold2, 0, 0.4, 0);
  pile.scale.set(1.1, 1, 0.6);
  // corner feet / posts
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    add(new THREE.BoxGeometry(0.07, H + 0.02, 0.07), darkWood, sx * (W / 2 - 0.02), H / 2, sz * (D / 2 - 0.02));
  // top rim
  add(new THREE.BoxGeometry(W + 0.02, 0.03, 0.04), darkWood, 0, H, D / 2);
  add(new THREE.BoxGeometry(W + 0.02, 0.03, 0.04), darkWood, 0, H, -D / 2);

  // iron straps on base
  for (const x of [-0.33, 0.33]) {
    add(new THREE.BoxGeometry(0.09, H + 0.02, 0.02), iron, x, H / 2, D / 2 + 0.005);
    add(new THREE.BoxGeometry(0.02, H, D + 0.02).clone(), iron, x < 0 ? -W / 2 - 0.003 : W / 2 + 0.003, H / 2, 0).scale.set(1, 1, 0.95);
    for (const y of [0.08, 0.25, 0.42]) {
      const s = add(new THREE.SphereGeometry(0.022, 5, 4), rust, x, y, D / 2 + 0.02);
      s.scale.z = 0.6;
    }
  }
  // bottom band
  add(new THREE.BoxGeometry(W + 0.02, 0.05, D + 0.02), iron, 0, 0.03, 0).scale.set(1, 1, 1);

  // lock plate on front
  add(new THREE.BoxGeometry(0.12, 0.14, 0.02), iron, 0, 0.42, D / 2 + 0.01);
  add(new THREE.BoxGeometry(0.03, 0.05, 0.025), gold2, 0, 0.4, D / 2 + 0.02);
  // padlock hanging loose from hasp
  const lock = new THREE.Group();
  lock.position.set(0.0, 0.33, D / 2 + 0.04);
  lock.rotation.z = 0.15;
  root.add(lock);
  add(new THREE.BoxGeometry(0.1, 0.09, 0.04), rust, 0, -0.07, 0, lock);
  add(new THREE.BoxGeometry(0.04, 0.02, 0.045), darkWood, 0, -0.07, 0.005, lock);
  const sh = add(new THREE.TorusGeometry(0.035, 0.01, 5, 8, Math.PI), iron, 0, -0.02, 0, lock);
  sh.rotation.z = 0;
  add(new THREE.BoxGeometry(0.01, 0.03, 0.01), iron, 0.035, -0.035, 0, lock);

  // skull carving on the front, lower left-centre
  const sk = new THREE.Group();
  sk.position.set(-0.2, 0.2, D / 2 + 0.003);
  root.add(sk);
  add(new THREE.BoxGeometry(0.1, 0.08, 0.012), bone, 0, 0.02, 0, sk);
  add(new THREE.BoxGeometry(0.06, 0.04, 0.012), bone, 0, -0.035, 0, sk);
  for (const x of [-0.022, 0.022]) add(new THREE.BoxGeometry(0.025, 0.025, 0.015), darkWood, x, 0.02, 0.002, sk);
  add(new THREE.BoxGeometry(0.012, 0.015, 0.015), darkWood, 0, -0.008, 0.002, sk);
  for (const rot of [Math.PI / 4, -Math.PI / 4]) {
    const b = add(new THREE.BoxGeometry(0.2, 0.018, 0.01), bone, 0, -0.03, -0.002, sk);
    b.rotation.z = rot;
    for (const e of [-1, 1]) {
      const k = add(new THREE.SphereGeometry(0.016, 5, 4), bone, Math.cos(rot) * 0.1 * e, -0.03 + Math.sin(rot) * 0.1 * e, -0.002, sk);
      k.scale.z = 0.5;
    }
  }

  // Lid: hinged at back top edge, thrown open past vertical
  const hinge = new THREE.Group();
  hinge.position.set(0, H, -D / 2);
  hinge.rotation.x = -(Math.PI / 2 + 0.35); // opens backward
  root.add(hinge);
  // lid planks: in hinge local frame, lid extends along +Z when closed; after rotation leans back
  const lidLen = D;
  add(new THREE.BoxGeometry(W, 0.04, lidLen), wood, 0, 0.02, lidLen / 2, hinge);
  // curved top: half cylinder (axis along X)
  const arch = add(new THREE.CylinderGeometry(D / 2, D / 2, W, 8, 1, false, 0, Math.PI), wood, 0, 0.04, lidLen / 2, hinge);
  arch.rotation.z = Math.PI / 2;
  arch.rotation.y = 0;
  arch.rotation.order = "ZYX";
  // orient arch so the dome rises along +Y of hinge frame
  arch.rotation.set(0, 0, Math.PI / 2);
  arch.geometry.rotateX(0);
  // inner lid lining
  add(new THREE.BoxGeometry(W - 0.08, 0.01, lidLen - 0.08), velvet, 0, 0.003, lidLen / 2, hinge);
  // lid straps (follow arch)
  for (const x of [-0.33, 0.33]) {
    const strap = add(new THREE.CylinderGeometry(D / 2 + 0.015, D / 2 + 0.015, 0.09, 8, 1, true, 0, Math.PI), iron, x, 0.04, lidLen / 2, hinge);
    strap.rotation.z = Math.PI / 2;
    for (let i = 0; i < 4; i++) {
      const a = (i + 0.5) / 4 * Math.PI;
      add(new THREE.SphereGeometry(0.02, 5, 4), rust, x, 0.04 + Math.sin(a) * (D / 2 + 0.02), lidLen / 2 + Math.cos(a) * (D / 2 + 0.02), hinge);
    }
  }
  // end caps of lid
  for (const x of [-W / 2, W / 2]) {
    const cap = add(new THREE.CylinderGeometry(D / 2, D / 2, 0.04, 8, 1, false, 0, Math.PI), darkWood, x, 0.04, lidLen / 2, hinge);
    cap.rotation.set(0, 0, Math.PI / 2);
    cap.rotation.order = "XYZ";
    cap.rotation.set(Math.PI / 2, 0, 0);
    cap.rotation.set(0, 0, 0);
    cap.geometry.rotateZ(Math.PI / 2);
    cap.geometry.rotateY(0);
  }
  // hinges
  for (const x of [-0.25, 0.25]) add(new THREE.BoxGeometry(0.07, 0.05, 0.03), iron, x, H, -D / 2 - 0.02);

  // coins
  const coinGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.008, 8);
  const placeCoin = (x: number, y: number, z: number, tilt: number) => {
    const m = add(coinGeo, r() > 0.5 ? gold : gold2, x, y, z);
    m.rotation.set((r() - 0.5) * tilt, r() * 6, (r() - 0.5) * tilt);
  };
  for (let i = 0; i < 45; i++) {
    const a = r() * Math.PI * 2, rad = Math.sqrt(r()) * 0.3;
    placeCoin(Math.cos(a) * rad * 1.4, 0.49 + r() * 0.06 - rad * 0.1, Math.sin(a) * rad * 0.7, 0.8);
  }
  // spill over front lip and onto the ground
  for (let i = 0; i < 40; i++) {
    const t = r();
    const x = (r() - 0.5) * 0.7 - 0.05 + t * 0.2;
    const z = D / 2 + 0.03 + t * 0.45 * r() + 0.02;
    const y = Math.max(0.006, 0.1 * (1 - t) * (1 - t) + 0.006);
    placeCoin(x, y, z, 0.5);
  }
  // spill mound
  const mound = add(new THREE.SphereGeometry(0.2, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), gold2, 0.2, 0, D / 2 + 0.2);
  mound.scale.set(1.3, 0.35, 1);
  // sloped coin ramp over lip
  const ramp = add(new THREE.BoxGeometry(0.45, 0.02, 0.35), gold, 0.2, 0.3, D / 2 + 0.04);
  ramp.rotation.x = 1.0;
  ramp.position.set(0.2, 0.33, D / 2 + 0.0);
  ramp.scale.set(1, 1, 1.2);
  // standing coins
  for (const [x, z] of [[0.45, 0.5], [-0.5, 0.45], [0.7, 0.35]]) {
    const m = add(coinGeo, gold, x, 0.03, z);
    m.rotation.set(Math.PI / 2 - 0.2, 0, 0.3);
    m.scale.set(1, 1, 1);
  }

  // pearl necklace draped over front lip
  const pts: THREE.Vector3[] = [];
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = -0.38 + t * 0.4;
    // start inside chest, over lip, down to ground, curl
    let y: number, z: number;
    if (t < 0.3) { y = 0.52 - t * 0.1; z = 0.1 + t * 0.9; }
    else { const u = (t - 0.3) / 0.7; y = Math.max(0.02, 0.49 - u * 0.5); z = 0.37 + u * 0.15 + Math.sin(u * 5) * 0.03; }
    pts.push(new THREE.Vector3(x + (t > 0.3 ? Math.sin(t * 9) * 0.05 : 0), y, z));
  }
  // lip stays at D/2=0.3, adjust: ensure pearls clear wall
  pts.forEach((p, i) => {
    if (p.z > 0.28 && p.z < 0.36) p.y = Math.max(p.y, 0.53);
    const pm = add(new THREE.SphereGeometry(0.02, 6, 5), pearl, p.x, p.y, p.z + (p.z > 0.3 ? 0.02 : 0));
    pm.scale.setScalar(1);
  });
  // clasp
  add(new THREE.OctahedronGeometry(0.03), ruby, pts[n].x, 0.03, pts[n].z + 0.02).scale.set(1, 0.7, 1);

  // goblet lying/standing on pile (standing, slightly tilted) inside chest right
  const gob = new THREE.Group();
  gob.position.set(0.28, 0.5, -0.05);
  gob.rotation.set(0.15, 0, -0.25);
  root.add(gob);
  add(new THREE.CylinderGeometry(0.05, 0.06, 0.015, 8), gold, 0, 0.008, 0, gob);
  add(new THREE.CylinderGeometry(0.012, 0.018, 0.1, 6), gold, 0, 0.065, 0, gob);
  add(new THREE.SphereGeometry(0.022, 6, 5), gold2, 0, 0.07, 0, gob);
  add(new THREE.CylinderGeometry(0.06, 0.025, 0.1, 8, 1, true), gold, 0, 0.17, 0, gob).material = gold;
  const rim = add(new THREE.TorusGeometry(0.06, 0.007, 4, 8), gold2, 0, 0.22, 0, gob);
  rim.rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.052, 0.052, 0.004, 8), ruby, 0, 0.205, 0, gob);
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + 0.4;
    add(new THREE.OctahedronGeometry(0.014), i % 2 ? emerald : ruby, Math.cos(a) * 0.05, 0.17, Math.sin(a) * 0.05, gob).scale.set(1, 1, 0.6);
  }

  // gems scattered
  const gemSpots: [number, number, number, boolean][] = [
    [-0.2, 0.52, 0.05, true], [0.05, 0.54, -0.1, false], [-0.35, 0.5, -0.1, false],
    [0.55, 0.02, 0.62, true], [-0.4, 0.025, 0.7, false], [0.1, 0.03, 0.78, true], [-0.1, 0.5, 0.2, true],
  ];
  gemSpots.forEach(([x, y, z, red], i) => {
    const m = add(new THREE.OctahedronGeometry(0.035 + (i % 3) * 0.008), red ? ruby : emerald, x, y + 0.02, z);
    m.scale.y = 1.2;
    m.rotation.set(r(), r() * 6, r());
  });
  const cut = add(new THREE.IcosahedronGeometry(0.04, 0), emerald, 0.35, 0.025, 0.55);
  cut.rotation.set(r(), r(), r());

  // a few ground-side details: broken plank shadow
  add(new THREE.BoxGeometry(W + 0.02, 0.012, D + 0.02), darkWood, 0, 0.006, 0);

  return root;
}
```