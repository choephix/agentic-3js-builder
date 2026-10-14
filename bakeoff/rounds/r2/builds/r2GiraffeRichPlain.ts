import * as THREE from "three";

export const meta = {
  name: "Young Reticulated Giraffe",
  description: "Blocky stylized young giraffe with canvas-drawn chestnut reticulated patches outlined in cream, mane, ossicones, lashes, tongue and cream socks.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeCoatTexture(): THREE.CanvasTexture {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f3e2b8";
  g.fillRect(0, 0, size, size);
  const r = rng(7);
  const pts: [number, number][] = [];
  const n = 70;
  for (let i = 0; i < n; i++) pts.push([r() * size, r() * size]);
  // Voronoi-like patches via per-pixel nearest seed
  const img = g.getImageData(0, 0, size, size);
  const step = 1;
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      let d1 = 1e9, d2 = 1e9, k = 0;
      for (let i = 0; i < n; i++) {
        let dx = Math.abs(pts[i][0] - x); if (dx > size / 2) dx = size - dx;
        let dy = Math.abs(pts[i][1] - y); if (dy > size / 2) dy = size - dy;
        const d = dx * dx + dy * dy;
        if (d < d1) { d2 = d1; d1 = d; k = i; } else if (d < d2) d2 = d;
      }
      const edge = Math.sqrt(d2) - Math.sqrt(d1);
      const o = (y * size + x) * 4;
      let col: number[];
      if (edge < 5) col = [246, 232, 190];
      else {
        const v = (k * 37) % 5;
        col = [150 - v * 6, 70 - v * 3, 32 - v * 2];
      }
      img.data[o] = col[0]; img.data[o + 1] = col[1]; img.data[o + 2] = col[2]; img.data[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const tex = makeCoatTexture();
  const coat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, flatShading: true });
  const mk = (c: number, rough = 0.9) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, flatShading: true });
  const cream = mk(0xf3e2b8);
  const brown = mk(0x4a2a14);
  const dark = mk(0x1a100a);
  const tongueM = mk(0x3a2a38, 0.5);
  const pink = mk(0xc98a78);
  const hoof = mk(0x2a1d16);
  const eye = mk(0x050505, 0.2);
  const snout = mk(0xd9b88c);

  const box = (w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Object3D = root) => {
    const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    me.position.set(x, y, z);
    parent.add(me);
    return me;
  };
  const cyl = (rt: number, rb: number, h: number, seg: number, m: THREE.Material, parent: THREE.Object3D = root) => {
    const me = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
    parent.add(me);
    return me;
  };

  // Body
  const body = box(0.5, 0.62, 1.0, coat, 0, 1.15, -0.1);
  box(0.46, 0.5, 0.3, coat, 0, 1.2, 0.45); // chest
  box(0.42, 0.5, 0.3, coat, 0, 1.1, -0.65); // rump
  body.rotation.x = -0.06;

  // Legs
  const legs: [number, number, number][] = [[0.17, 0.4, 1], [-0.17, 0.4, 1], [0.15, -0.6, 0.9], [-0.15, -0.6, 0.9]];
  for (const [x, z, s] of legs) {
    const leg = new THREE.Group();
    leg.position.set(x, 0, z);
    root.add(leg);
    box(0.17, 0.5, 0.17, coat, 0, 0.98, 0, leg).scale.y = 1;
    box(0.13, 0.45, 0.13, coat, 0, 0.6, 0, leg);
    box(0.135, 0.3, 0.135, cream, 0, 0.23, 0, leg);
    box(0.15, 0.1, 0.15, brown, 0, 0.42, 0, leg); // knee
    box(0.15, 0.08, 0.17, cream, 0, 0.11, 0.0, leg);
    box(0.15, 0.07, 0.19, hoof, 0, 0.035, 0.01, leg);
  }

  // Neck (leaning forward)
  const neck = new THREE.Group();
  neck.position.set(0, 1.3, 0.5);
  neck.rotation.x = 0.32;
  root.add(neck);
  const nk = box(0.24, 1.35, 0.26, coat, 0, 0.62, 0, neck);
  nk.scale.set(1, 1, 1);
  box(0.3, 0.3, 0.32, coat, 0, 0.05, 0, neck);
  // mane
  const r = rng(3);
  for (let i = 0; i < 16; i++) {
    const h = 0.07 + r() * 0.03;
    const m = box(0.04, h, 0.07, brown, 0, 0.0 + i * 0.085 + 0.1, -0.15, neck);
    m.rotation.x = -0.3;
    m.position.y += 0.02;
  }

  // Head
  const head = new THREE.Group();
  head.position.set(0, 1.32, 0.0);
  head.rotation.x = 0.55;
  neck.add(head);
  box(0.22, 0.22, 0.3, coat, 0, 0, 0, head);
  box(0.16, 0.15, 0.26, snout, 0, -0.06, 0.24, head);
  box(0.17, 0.05, 0.1, dark, 0, -0.04, 0.37, head); // muzzle tip
  box(0.1, 0.02, 0.04, dark, 0, -0.08, 0.36, head);
  // nostrils
  for (const sx of [1, -1]) box(0.025, 0.025, 0.02, eye, sx * 0.045, -0.015, 0.425, head);
  // tongue
  const tg = box(0.045, 0.02, 0.2, tongueM, 0.03, -0.125, 0.4, head);
  tg.rotation.x = 0.35;
  tg.rotation.y = 0.15;
  // eyes, lashes
  for (const sx of [1, -1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), eye);
    e.position.set(sx * 0.115, 0.05, 0.07);
    head.add(e);
    for (let i = 0; i < 4; i++) {
      const l = box(0.006, 0.006, 0.05, dark, sx * 0.125, 0.09 + i * 0.001, 0.1 - i * 0.03, head);
      l.rotation.x = -0.6 + i * 0.1;
      l.rotation.y = sx * 0.4;
      l.rotation.z = sx * -0.5;
      l.position.y += 0.02;
    }
    // ears
    const ear = new THREE.Group();
    ear.position.set(sx * 0.13, 0.08, -0.1);
    ear.rotation.z = -sx * 1.0;
    ear.rotation.y = sx * -0.2;
    head.add(ear);
    box(0.2, 0.025, 0.1, coat, sx * 0.1, 0, 0, ear);
    box(0.14, 0.03, 0.06, pink, sx * 0.1, 0.002, 0.0, ear);
    box(0.05, 0.026, 0.07, brown, sx * 0.21, 0, 0, ear);
    // ossicones
    const oss = new THREE.Group();
    oss.position.set(sx * 0.06, 0.11, -0.06);
    oss.rotation.x = -0.15;
    oss.rotation.z = -sx * 0.12;
    head.add(oss);
    cyl(0.025, 0.035, 0.2, 6, coat, oss).position.y = 0.1;
    const fuzz = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.03, 0.04, 6), cream);
    fuzz.position.y = 0.06; oss.add(fuzz);
    const tuft = new THREE.Mesh(new THREE.IcosahedronGeometry(0.052, 0), dark);
    tuft.position.y = 0.22; tuft.scale.y = 1.2; oss.add(tuft);
  }

  // Tail
  const tail = new THREE.Group();
  tail.position.set(0, 1.3, -0.62);
  tail.rotation.x = 0.35;
  root.add(tail);
  box(0.05, 0.6, 0.05, coat, 0, -0.28, 0, tail);
  const tuftT = box(0.1, 0.16, 0.1, dark, 0, -0.65, 0, tail);
  tuftT.rotation.z = 0.1;

  // Belly shadow / cream underside
  box(0.4, 0.06, 0.8, cream, 0, 0.86, -0.05);

  return root;
}
