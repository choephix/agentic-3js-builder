```ts
import * as THREE from "three";

export const meta = {
  name: "Treasure Chest",
  description:
    "An open wooden treasure chest with iron bands, a gold lock, a heaped pile of gold coins, gems and a few coins spilled onto the floor.",
};

// Seeded generator so every build is identical.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Canvas-drawn wood planks with grain.
function woodTexture(rnd: () => number): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#8a5a2b";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 140; i++) {
    const y = rnd() * 256;
    const light = rnd() > 0.5;
    g.strokeStyle = light
      ? `rgba(220,160,90,${0.12 + rnd() * 0.2})`
      : `rgba(50,28,12,${0.15 + rnd() * 0.3})`;
    g.lineWidth = 1 + rnd() * 2.5;
    g.beginPath();
    g.moveTo(0, y);
    g.bezierCurveTo(80, y + (rnd() - 0.5) * 10, 170, y + (rnd() - 0.5) * 10, 256, y + (rnd() - 0.5) * 6);
    g.stroke();
  }
  // Plank seams.
  g.fillStyle = "#3b2412";
  g.fillRect(0, 0, 4, 256);
  g.fillRect(128, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  return tex;
}

export default function build(): THREE.Object3D {
  const rnd = mulberry32(1337);
  const root = new THREE.Group();

  // Materials: one per colour, shared.
  const woodTex = woodTexture(rnd);
  const wood = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.8, metalness: 0.0 });
  const woodDark = new THREE.MeshStandardMaterial({ color: "#4a2c14", roughness: 0.9 });
  const iron = new THREE.MeshStandardMaterial({ color: "#3a3a42", metalness: 0.6, roughness: 0.45 });
  const gold = new THREE.MeshStandardMaterial({ color: "#f2b630", metalness: 0.9, roughness: 0.28 });
  const interior = new THREE.MeshStandardMaterial({ color: "#1d0f08", roughness: 1.0 });
  const ruby = new THREE.MeshStandardMaterial({
    color: "#d1203a", metalness: 0.1, roughness: 0.15, emissive: "#3a0410", emissiveIntensity: 0.5,
  });
  const emerald = new THREE.MeshStandardMaterial({
    color: "#1fbf6a", metalness: 0.1, roughness: 0.15, emissive: "#053a1c", emissiveIntensity: 0.5,
  });
  const sapphire = new THREE.MeshStandardMaterial({
    color: "#2a6fe0", metalness: 0.1, roughness: 0.15, emissive: "#0a1f4a", emissiveIntensity: 0.5,
  });

  // Base body (0.8 wide, 0.5 deep, 0.35 tall) lifted on feet.
  const bodyH = 0.35;
  const bodyBottom = 0.04;
  const bodyTop = bodyBottom + bodyH; // 0.39
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, bodyH, 0.5), wood);
  body.position.set(0, bodyBottom + bodyH / 2, 0);
  root.add(body);

  // Feet.
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.09), woodDark);
      foot.position.set(sx * 0.33, 0.025, sz * 0.18);
      root.add(foot);
    }
  }

  // Dark interior plate sitting on the top rim.
  const inner = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.01, 0.42), interior);
  inner.position.set(0, bodyTop + 0.002, 0);
  root.add(inner);

  // Iron corner bands on front and back.
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.06, bodyH + 0.01, 0.03), iron);
      band.position.set(sx * 0.35, bodyBottom + bodyH / 2, sz * 0.255);
      root.add(band);
    }
  }
  // Iron side straps on the ends.
  for (const sx of [-1, 1]) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.03, bodyH + 0.01, 0.52), iron);
    strap.position.set(sx * 0.405, bodyBottom + bodyH / 2, 0);
    root.add(strap);
  }

  // Front lock plate and keyhole.
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.13, 0.02), gold);
  plate.position.set(0, 0.22, 0.262);
  root.add(plate);
  const keyhole = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 0.01), interior);
  keyhole.position.set(0, 0.21, 0.275);
  root.add(keyhole);
  const keyTop = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 4), interior);
  keyTop.position.set(0, 0.235, 0.275);
  root.add(keyTop);

  // Lid pivot on the back top edge.
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, bodyTop, -0.25);
  lidPivot.rotation.x = -1.9; // open
  root.add(lidPivot);

  // Lid: half cylinder whose axis runs along X, centred on its own origin.
  const lidR = 0.25;
  const lidGeo = new THREE.CylinderGeometry(lidR, lidR, 0.8, 14, 1, false, 0, Math.PI);
  lidGeo.rotateZ(Math.PI / 2);
  const lid = new THREE.Mesh(lidGeo, wood);
  lid.position.set(0, 0, 0.25);
  lidPivot.add(lid);

  // Iron arched bands over the lid.
  for (const x of [-0.3, 0, 0.3]) {
    const tg = new THREE.TorusGeometry(lidR + 0.006, 0.016, 6, 18, Math.PI);
    tg.rotateY(Math.PI / 2);
    const t = new THREE.Mesh(tg, iron);
    t.position.set(x, 0, 0);
    lid.add(t);
  }
  // Lid lock boss at the front of the lid.
  const boss = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.03), gold);
  boss.position.set(0, -0.005, lidR + 0.005);
  lid.add(boss);

  // Heaped gold coins, plus a few spilled onto the floor.
  const coinGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.008, 12);
  const coinCount = 110;
  const coins = new THREE.InstancedMesh(coinGeo, gold, coinCount);
  const dummy = new THREE.Object3D();
  let idx = 0;

  // Mound on the chest interior.
  for (let i = 0; i < 100; i++) {
    const u = rnd();
    const ang = rnd() * Math.PI * 2;
    const r = Math.sqrt(u);
    const x = Math.cos(ang) * r * 0.29;
    const z = Math.sin(ang) * r * 0.17;
    const dome = Math.max(0, 1 - r * r);
    const y = bodyTop + 0.006 + dome * (0.07 + rnd() * 0.03) + rnd() * 0.006;
    dummy.position.set(x, y, z);
    dummy.rotation.set((rnd() - 0.5) * 0.7, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.7);
    dummy.updateMatrix();
    coins.setMatrixAt(idx++, dummy.matrix);
  }
  // Spilled coins on the floor in front of the chest.
  for (let i = 0; i < coinCount - idx; i++) {
    const x = (rnd() - 0.5) * 0.7;
    const z = 0.34 + rnd() * 0.22;
    dummy.position.set(x, 0.004, z);
    dummy.rotation.set((rnd() - 0.5) * 0.25, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.25);
    dummy.updateMatrix();
    coins.setMatrixAt(idx++, dummy.matrix);
  }
  coins.instanceMatrix.needsUpdate = true;
  root.add(coins);

  // Gems tucked into the top of the pile.
  const gemGeo = new THREE.IcosahedronGeometry(0.03, 0);
  const gemSpots: [number, number, THREE.Material][] = [
    [-0.12, 0.05, ruby],
    [0.1, -0.03, sapphire],
    [0.02, 0.09, emerald],
    [-0.04, -0.09, ruby],
    [0.18, 0.06, emerald],
  ];
  for (const [x, z, mat] of gemSpots) {
    const gem = new THREE.Mesh(gemGeo, mat);
    gem.position.set(x, bodyTop + 0.1 + rnd() * 0.02, z);
    gem.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
    gem.scale.set(1, 0.8, 1);
    root.add(gem);
  }

  return root;
}
```