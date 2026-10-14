```ts
import * as THREE from "three";

export const meta = {
  name: "Pirate Treasure Chest",
  description:
    "A weathered wooden chest with iron straps and studs, lid thrown open, spilling gold coins, a pearl necklace, a jewelled goblet and gems. A skull-and-crossbones is carved on the front.",
};

// Small seeded PRNG (mulberry32) so every build is identical.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function woodTexture(rand: () => number) {
  return canvasTexture(512, 512, (g, w, h) => {
    const boards = 5;
    const bw = w / boards;
    for (let i = 0; i < boards; i++) {
      const shade = 0.82 + rand() * 0.3;
      g.fillStyle = `rgb(${Math.round(80 * shade)},${Math.round(52 * shade)},${Math.round(31 * shade)})`;
      g.fillRect(i * bw, 0, bw, h);
      for (let k = 0; k < 60; k++) {
        g.strokeStyle = `rgba(28,16,8,${0.15 + rand() * 0.25})`;
        g.lineWidth = 0.6 + rand() * 1.4;
        const x = i * bw + rand() * bw;
        g.beginPath();
        g.moveTo(x, 0);
        g.bezierCurveTo(x + rand() * 8 - 4, h * 0.3, x + rand() * 8 - 4, h * 0.6, x + rand() * 6 - 3, h);
        g.stroke();
      }
      g.fillStyle = "#1a100a";
      g.fillRect(i * bw, 0, 5, h);
      for (let k = 0; k < 4; k++) {
        g.fillStyle = "rgba(20,14,8,0.5)";
        g.beginPath();
        g.ellipse(i * bw + rand() * bw, rand() * h, 4 + rand() * 5, 8 + rand() * 10, 0, 0, Math.PI * 2);
        g.fill();
      }
    }
    // weathering grime
    for (let k = 0; k < 350; k++) {
      g.fillStyle = `rgba(15,22,12,${rand() * 0.22})`;
      g.fillRect(rand() * w, rand() * h, 2 + rand() * 6, 2 + rand() * 6);
    }
  });
}

function skullTexture() {
  return canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = "#2a1c12";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#6b4a2a";
    g.lineWidth = 10;
    g.strokeRect(12, 12, w - 24, h - 24);

    // crossbones behind the skull
    const bone = "#d9cba8";
    const lines: [number, number, number, number][] = [
      [50, 200, 206, 120],
      [50, 120, 206, 200],
    ];
    g.strokeStyle = bone;
    g.lineCap = "round";
    g.lineWidth = 18;
    for (const [x1, y1, x2, y2] of lines) {
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke();
      g.fillStyle = bone;
      for (const [cx, cy] of [[x1, y1], [x2, y2]]) {
        g.beginPath();
        g.arc(cx - 6, cy - 2, 13, 0, Math.PI * 2);
        g.arc(cx + 6, cy + 2, 13, 0, Math.PI * 2);
        g.fill();
      }
    }

    // skull
    g.fillStyle = bone;
    g.beginPath();
    g.ellipse(128, 98, 52, 50, 0, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.roundRect(100, 124, 56, 26, 8);
    g.fill();

    // eye sockets, nose
    g.fillStyle = "#1a120c";
    g.beginPath();
    g.arc(104, 100, 15, 0, Math.PI * 2);
    g.arc(152, 100, 15, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.moveTo(128, 116);
    g.lineTo(119, 130);
    g.lineTo(137, 130);
    g.closePath();
    g.fill();

    // teeth
    g.strokeStyle = "#1a120c";
    g.lineWidth = 3;
    for (let x = 110; x <= 146; x += 9) {
      g.beginPath();
      g.moveTo(x, 130);
      g.lineTo(x, 148);
      g.stroke();
    }
  });
}

function mk(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
  rx = 0,
  ry = 0,
  rz = 0
) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  parent.add(m);
  return m;
}

export default function build(): THREE.Object3D {
  const rand = rng(20240611);
  const root = new THREE.Group();

  // ---- materials (shared) ----
  const woodTex = woodTexture(rand);
  const wood = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.88, metalness: 0 });
  const woodDouble = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.88, metalness: 0, side: THREE.DoubleSide });
  const iron = new THREE.MeshStandardMaterial({ color: 0x4a3a30, roughness: 0.6, metalness: 0.6 });
  const rust = new THREE.MeshStandardMaterial({ color: 0x8a4a22, roughness: 0.55, metalness: 0.5 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xf2b233, roughness: 0.28, metalness: 1 });
  const goldDouble = new THREE.MeshStandardMaterial({ color: 0xf2b233, roughness: 0.28, metalness: 1, side: THREE.DoubleSide });
  const pearl = new THREE.MeshStandardMaterial({ color: 0xf6f1e6, roughness: 0.18, metalness: 0 });
  const ruby = new THREE.MeshStandardMaterial({ color: 0xc0132f, emissive: 0x3a0309, roughness: 0.12, metalness: 0.2 });
  const emerald = new THREE.MeshStandardMaterial({ color: 0x1aa052, emissive: 0x03301a, roughness: 0.12, metalness: 0.2 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x140d08, roughness: 1 });
  const plaqueMat = new THREE.MeshStandardMaterial({ map: skullTexture(), roughness: 0.7 });

  // ---- chest body ----
  const bodyW = 0.9, bodyH = 0.5, bodyD = 0.6;
  mk(root, new THREE.BoxGeometry(bodyW, bodyH, bodyD), wood, 0, bodyH / 2, 0);

  // inner rim and dark interior well
  const rimGeoF = new THREE.BoxGeometry(0.9, 0.03, 0.04);
  const rimGeoS = new THREE.BoxGeometry(0.04, 0.03, 0.52);
  mk(root, rimGeoF, wood, 0, 0.515, 0.28);
  mk(root, rimGeoF, wood, 0, 0.515, -0.28);
  mk(root, rimGeoS, wood, -0.43, 0.515, 0);
  mk(root, rimGeoS, wood, 0.43, 0.515, 0);
  const well = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.52), dark);
  well.rotation.x = -Math.PI / 2;
  well.position.set(0, 0.501, 0);
  root.add(well);

  // iron bands (front, back, sides) at two heights
  const bandY = [0.1, 0.4];
  const bandFrontGeo = new THREE.BoxGeometry(0.92, 0.035, 0.012);
  const bandSideGeo = new THREE.BoxGeometry(0.012, 0.035, 0.612);
  for (const y of bandY) {
    mk(root, bandFrontGeo, iron, 0, y, 0.306);
    mk(root, bandFrontGeo, iron, 0, y, -0.306);
    mk(root, bandSideGeo, iron, -0.456, y, 0);
    mk(root, bandSideGeo, iron, 0.456, y, 0);
  }
  // vertical front straps
  const vStrapGeo = new THREE.BoxGeometry(0.035, 0.5, 0.012);
  mk(root, vStrapGeo, iron, -0.3, 0.25, 0.306);
  mk(root, vStrapGeo, iron, 0.3, 0.25, 0.306);

  // corner brackets
  const cornerGeo = new THREE.BoxGeometry(0.05, 0.52, 0.05);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    mk(root, cornerGeo, iron, sx * 0.452, 0.25, sz * 0.302);
  }
  // rust streaks on the iron
  const rustGeo = new THREE.BoxGeometry(0.02, 0.1, 0.002);
  for (let i = 0; i < 6; i++) {
    mk(root, rustGeo, rust, -0.4 + rand() * 0.8, 0.25 + rand() * 0.1, 0.314);
  }

  // studs
  const studGeo = new THREE.SphereGeometry(0.013, 8, 6);
  for (const y of bandY) {
    for (let x = -0.4; x <= 0.401; x += 0.1) {
      if (Math.abs(x - 0.2) < 0.05 && y < 0.2) continue; // padlock area
      mk(root, studGeo, iron, x, y, 0.316);
      mk(root, studGeo, iron, x, y, -0.316);
    }
    for (const z of [-0.2, 0, 0.2]) {
      mk(root, studGeo, iron, 0.463, y, z);
      mk(root, studGeo, iron, -0.463, y, z);
    }
  }

  // carved skull-and-crossbones plaque on the front
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.18), plaqueMat);
  plaque.position.set(0, 0.25, 0.311);
  root.add(plaque);
  const plaqueFrame = new THREE.BoxGeometry(0.21, 0.19, 0.004);
  mk(root, plaqueFrame, iron, 0, 0.25, 0.309);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    mk(root, new THREE.SphereGeometry(0.007, 6, 5), iron, sx * 0.09, 0.25 + sy * 0.08, 0.318);
  }

  // hasp and hanging padlock
  mk(root, new THREE.BoxGeometry(0.05, 0.09, 0.008), iron, 0.2, 0.245, 0.31);
  mk(root, new THREE.TorusGeometry(0.018, 0.004, 6, 14), iron, 0.2, 0.2, 0.325);
  const padlock = new THREE.Group();
  padlock.position.set(0.2, 0.19, 0.33);
  padlock.rotation.z = 0.15;
  root.add(padlock);
  mk(padlock, new THREE.TorusGeometry(0.016, 0.004, 6, 14, Math.PI), iron, 0, 0, 0);
  mk(padlock, new THREE.BoxGeometry(0.055, 0.07, 0.028), iron, 0, -0.045, 0.0);
  mk(padlock, new THREE.BoxGeometry(0.02, 0.018, 0.004), gold, 0, -0.035, 0.016);
  mk(padlock, new THREE.BoxGeometry(0.008, 0.014, 0.002), dark, 0, -0.058, 0.0165);

  // back hinge knuckles
  const knuckleGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.11, 8);
  for (const x of [-0.3, 0, 0.3]) {
    mk(root, knuckleGeo, iron, x, 0.505, -0.314, 0, 0, Math.PI / 2);
  }

  // ---- lid (open, hinged on the back top edge) ----
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.5, -0.3);
  lidPivot.rotation.x = -1.92;
  root.add(lidPivot);

  const shellGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.9, 16, 1, true, 0, Math.PI);
  shellGeo.rotateZ(Math.PI / 2);
  shellGeo.translate(0, 0, 0.3);
  mk(lidPivot, shellGeo, woodDouble, 0, 0, 0);

  const capShape = new THREE.Shape();
  capShape.moveTo(0.3, 0);
  capShape.absarc(0, 0, 0.3, 0, Math.PI, false);
  for (const s of [-1, 1]) {
    const capGeo = new THREE.ShapeGeometry(capShape, 10);
    capGeo.rotateY(Math.PI / 2);
    capGeo.translate(s * 0.45, 0, 0.3);
    mk(lidPivot, capGeo, woodDouble, 0, 0, 0);
  }

  // lid iron straps (arcs over the curved top) and studs
  for (const xp of [-0.3, 0, 0.3]) {
    const strap = new THREE.TorusGeometry(0.304, 0.011, 6, 24, Math.PI);
    mk(lidPivot, strap, iron, xp, 0, 0.3, 0, Math.PI / 2, 0);
    for (let k = 1; k <= 3; k++) {
      const a = (Math.PI * k) / 4;
      mk(lidPivot, studGeo, iron, xp, 0.304 * Math.sin(a), 0.3 - 0.304 * Math.cos(a));
    }
  }
  // lid rim plate across the front edge
  mk(lidPivot, new THREE.BoxGeometry(0.92, 0.03, 0.02), iron, 0, 0.015, 0.6);

  // ---- coin pile inside the chest ----
  const pileTop = (x: number, z: number) => {
    const d = (x / 0.38) ** 2 + (z / 0.24) ** 2;
    return d < 1 ? 0.5 + 0.1 * (1 - d) : 0.5;
  };
  const dummy = new THREE.Object3D();
  const coinGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.008, 12);
  const pileCoins = 200;
  const floorCoins = 30;
  const coins = new THREE.InstancedMesh(coinGeo, gold, pileCoins + floorCoins);
  let ci = 0;
  for (let i = 0; i < pileCoins; i++) {
    const r = Math.sqrt(rand());
    const a = rand() * Math.PI * 2;
    const x = r * 0.36 * Math.cos(a);
    const z = r * 0.22 * Math.sin(a);
    const top = pileTop(x, z);
    const y = 0.504 + (top - 0.504) * Math.pow(rand(), 0.7);
    dummy.position.set(x, y, z);
    dummy.rotation.set((rand() - 0.5) * 0.4, rand() * Math.PI * 2, (rand() - 0.5) * 0.4);
    dummy.updateMatrix();
    coins.setMatrixAt(ci++, dummy.matrix);
  }
  // coins spilling onto the floor in front
  for (let i = 0; i < floorCoins; i++) {
    dummy.position.set(-0.5 + rand() * 1.0, 0.004, 0.34 + rand() * 0.26);
    dummy.rotation.set((rand() - 0.5) * 0.15, rand() * Math.PI * 2, (rand() - 0.5) * 0.15);
    dummy.updateMatrix();
    coins.setMatrixAt(ci++, dummy.matrix);
  }
  coins.instanceMatrix.needsUpdate = true;
  root.add(coins);

  // ---- pearl necklace draped over the pile ----
  const necklacePts = [
    new THREE.Vector3(-0.2, 0.56, 0.05),
    new THREE.Vector3(-0.1, 0.6, 0.12),
    new THREE.Vector3(0.05, 0.605, 0.1),
    new THREE.Vector3(0.18, 0.58, 0.0),
    new THREE.Vector3(0.1, 0.575, -0.1),
    new THREE.Vector3(-0.05, 0.61, -0.12),
    new THREE.Vector3(-0.2, 0.56, -0.05),
  ];
  const necklace = new THREE.CatmullRomCurve3(necklacePts, true);
  const pearlCount = 48;
  const pearls = new THREE.InstancedMesh(new THREE.SphereGeometry(0.011, 8, 6), pearl, pearlCount);
  for (let i = 0; i < pearlCount; i++) {
    const p = necklace.getPointAt(i / pearlCount);
    dummy.position.copy(p);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    pearls.setMatrixAt(i, dummy.matrix);
  }
  pearls.instanceMatrix.needsUpdate = true;
  root.add(pearls);

  // ---- jewelled goblet ----
  const goblet = new THREE.Group();
  goblet.position.set(-0.17, 0.56, 0.0);
  root.add(goblet);
  const gobletProfile: [number, number][] = [
    [0, 0], [0.05, 0], [0.052, 0.008], [0.02, 0.025], [0.01, 0.04],
    [0.009, 0.1], [0.04, 0.14], [0.066, 0.19], [0.068, 0.2],
    [0.062, 0.2], [0.058, 0.19], [0.035, 0.14], [0.0, 0.11],
  ];
  const gobletGeo = new THREE.LatheGeometry(gobletProfile.map(([r, y]) => new THREE.Vector2(r, y)), 16);
  mk(goblet, gobletGeo, goldDouble, 0, 0, 0);
  mk(goblet, new THREE.TorusGeometry(0.067, 0.004, 6, 20), gold, 0, 0.2, 0, Math.PI / 2, 0, 0);
  const gemOct = new THREE.OctahedronGeometry(1, 0);
  mk(goblet, gemOct, ruby, 0, 0.07, 0.0, 0, 0, 0).scale.set(0.014, 0.02, 0.014);
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI / 2) * i + Math.PI / 4;
    const g = mk(goblet, gemOct, i % 2 === 0 ? emerald : ruby, Math.cos(a) * 0.066, 0.2, Math.sin(a) * 0.066);
    g.scale.set(0.012, 0.016, 0.012);
  }

  // ---- loose gems on the pile and spilled onto the floor ----
  const gemMeshes: THREE.Mesh[] = [];
  for (let i = 0; i < 8; i++) {
    const r = Math.sqrt(rand()) * 0.8;
    const a = rand() * Math.PI * 2;
    const x = r * 0.36 * Math.cos(a) + (rand() - 0.5) * 0.05;
    const z = r * 0.22 * Math.sin(a);
    const y = pileTop(x, z) + 0.012;
    gemMeshes.push(mk(root, gemOct, i % 2 ? ruby : emerald, x, y, z, rand() * 3, rand() * 3, rand() * 3));
  }
  for (let i = 0; i < 4; i++) {
    gemMeshes.push(
      mk(root, gemOct, i % 2 ? emerald : ruby, -0.3 + rand() * 0.6, 0.02, 0.4 + rand() * 0.18, rand() * 3, rand() * 3, rand() * 3)
    );
  }
  for (const g of gemMeshes) {
    const s = 0.016 + rand() * 0.008;
    g.scale.set(s, s * 1.3, s);
  }

  // ---- pirate gold tooth-like highlight: a small dropped pendant ----
  const pendant = mk(root, gemOct, gold, 0.36, 0.012, 0.42, 0, 0.6, 0);
  pendant.scale.set(0.03, 0.012, 0.03);

  return root;
}
```