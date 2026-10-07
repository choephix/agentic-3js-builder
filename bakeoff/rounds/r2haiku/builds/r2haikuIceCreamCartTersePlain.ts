import * as THREE from "three";

export const meta = {
  name: "Ice Cream Cart",
  description:
    "A mint-and-cream street cart with a striped awning, a glass scoop case of five flavours, a giant cone-and-scoop topper, and a chrome push handle.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeCanvas(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  draw(g);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function build(): THREE.Object3D {
  const rand = rng(2024);
  const cache: Record<string, THREE.Material> = {};

  const std = (key: string, color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => {
    if (!cache[key]) {
      cache[key] = new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.0, ...extra });
    }
    return cache[key] as THREE.MeshStandardMaterial;
  };

  const root = new THREE.Group();

  const add = (
    geo: THREE.BufferGeometry,
    m: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = root
  ) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };

  // Palette
  const mint = std("mint", "#7fd6c2");
  const cream = std("cream", "#fff4e0");
  const red = std("red", "#e8494b");
  const chrome = std("chrome", "#c9ced6", { roughness: 0.25, metalness: 0.8 });
  const chassis = std("chassis", "#3b3340");
  const tyre = std("tyre", "#2b2a2e", { roughness: 0.8 });
  const waffle = std("waffle", "#d9a25f");
  const glass = new THREE.MeshStandardMaterial({
    color: "#bfe9ff",
    roughness: 0.1,
    metalness: 0.0,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });
  const trayMat = std("tray", "#f6e6c8");

  // Striped canopy texture
  const stripeTex = makeCanvas(256, 64, (g) => {
    g.fillStyle = "#fff8ee";
    g.fillRect(0, 0, 256, 64);
    g.fillStyle = "#e8494b";
    for (let i = 0; i < 4; i++) g.fillRect(i * 64, 0, 32, 64);
  });
  stripeTex.wrapS = THREE.RepeatWrapping;
  stripeTex.repeat.set(4, 1);
  const canopyMat = new THREE.MeshStandardMaterial({ map: stripeTex, roughness: 0.7 });

  // Sign texture
  const signTex = makeCanvas(512, 160, (g) => {
    g.fillStyle = "#ff8fb1";
    g.fillRect(0, 0, 512, 160);
    g.strokeStyle = "#fff4e0";
    g.lineWidth = 10;
    g.strokeRect(12, 12, 488, 136);
    g.fillStyle = "#fff4e0";
    g.font = "bold 70px Arial, Helvetica, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("ICE CREAM", 256, 84);
  });
  const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.6 });

  // Chassis
  add(new THREE.BoxGeometry(1.3, 0.12, 1.0), chassis, 0, 0.42, 0);

  // Main body
  add(new THREE.BoxGeometry(1.2, 0.72, 0.8), mint, 0, 0.84, 0);

  // Trim: bottom red band and cream top band
  add(new THREE.BoxGeometry(1.23, 0.06, 0.83), red, 0, 0.52, 0);
  add(new THREE.BoxGeometry(1.23, 0.04, 0.83), cream, 0, 1.18, 0);

  // Front pilasters
  for (const sx of [-0.6, 0.6]) {
    add(new THREE.BoxGeometry(0.06, 0.66, 0.04), cream, sx, 0.84, 0.42);
  }

  // Counter top
  add(new THREE.BoxGeometry(1.3, 0.06, 0.9), cream, 0, 1.23, 0.02);

  // Scoop tray
  add(new THREE.BoxGeometry(1.0, 0.03, 0.66), trayMat, 0, 1.275, 0.05);

  // Glass case
  add(new THREE.BoxGeometry(1.0, 0.5, 0.7), glass, 0, 1.52, 0.05);

  // Sign on the front
  const sign = add(new THREE.PlaneGeometry(0.9, 0.28), signMat, 0, 0.84, 0.41);
  sign.name = "sign";

  // Front bumper
  const bumper = add(new THREE.CylinderGeometry(0.025, 0.025, 1.3, 10), chrome, 0, 0.36, 0.5);
  bumper.rotation.z = Math.PI / 2;

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 14);
  const rimGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 12);
  const hubGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.14, 8);
  for (const sx of [-0.68, 0.68]) {
    for (const sz of [-0.32, 0.32]) {
      const w = new THREE.Group();
      w.position.set(sx, 0.3, sz);
      root.add(w);
      const t = add(wheelGeo, tyre, 0, 0, 0, w);
      t.rotation.z = Math.PI / 2;
      const r = add(rimGeo, chrome, 0, 0, 0, w);
      r.rotation.z = Math.PI / 2;
      const h = add(hubGeo, cream, 0, 0, 0, w);
      h.rotation.z = Math.PI / 2;
    }
  }

  // Rear push handle
  for (const sx of [-0.55, 0.55]) {
    add(new THREE.CylinderGeometry(0.022, 0.022, 0.78, 8), chrome, sx, 0.9, -0.6);
  }
  const bar = add(new THREE.CylinderGeometry(0.026, 0.026, 1.25, 10), chrome, 0, 1.28, -0.6);
  bar.rotation.z = Math.PI / 2;
  for (const sx of [-0.6, 0.6]) {
    const grip = add(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 10), red, sx, 1.28, -0.6);
    grip.rotation.z = Math.PI / 2;
  }

  // Awning poles
  for (const sx of [-0.72, 0.72]) {
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8), chrome, sx, 1.6, 0.55);
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8), chrome, sx, 1.6, -0.45);
  }

  // Striped canopy, tilted slightly so the front dips
  const canopy = add(new THREE.BoxGeometry(1.7, 0.03, 1.2), canopyMat, 0, 2.02, 0.05);
  canopy.rotation.x = 0.1;

  // Scalloped valance along the front edge
  const scallops = 12;
  for (let i = 0; i < scallops; i++) {
    const x = -0.85 + (i + 0.5) * (1.7 / scallops);
    const m = i % 2 === 0 ? red : cream;
    const s = add(new THREE.SphereGeometry(0.075, 8, 6), m, x, 1.94, 0.64);
    s.scale.set(1, 0.6, 1);
  }

  // Giant cone-and-scoop topper
  const topCone = add(new THREE.ConeGeometry(0.13, 0.3, 12), waffle, 0, 2.19, 0.05);
  topCone.rotation.x = Math.PI;
  const topScoop = add(new THREE.SphereGeometry(0.15, 14, 10), std("pinkTop", "#ff8fb1"), 0, 2.46, 0.05);
  topScoop.scale.y = 0.85;
  add(new THREE.SphereGeometry(0.035, 8, 6), red, 0, 2.6, 0.05);

  // Scoops in the case
  const flavours = [
    std("strawberry", "#ff8fb1"),
    std("choc", "#6b3a24"),
    std("vanilla", "#fff1c9"),
    std("mintice", "#9fe8c8"),
    std("lavender", "#c9b6ff"),
  ];
  const sprinkleColors = [
    std("spkA", "#ff4d6d"),
    std("spkB", "#ffd23f"),
    std("spkC", "#3a86ff"),
    std("spkD", "#ffffff"),
  ];
  const sprinkleGeo = new THREE.BoxGeometry(0.012, 0.012, 0.03);
  const scoopGeo = new THREE.SphereGeometry(0.09, 14, 10);
  const coneGeo = new THREE.ConeGeometry(0.075, 0.14, 10);

  const scoopCount = flavours.length;
  for (let i = 0; i < scoopCount; i++) {
    const x = -0.36 + i * (0.72 / (scoopCount - 1));
    const z = 0.05;

    const cone = add(coneGeo, waffle, x, 1.345, z);
    cone.rotation.x = Math.PI;

    const scoop = add(scoopGeo, flavours[i], x, 1.48, z);
    scoop.scale.y = 0.8;

    // Sprinkles scattered over the upper half of the scoop
    const n = 9;
    for (let k = 0; k < n; k++) {
      const theta = rand() * Math.PI * 0.42;
      const phi = rand() * Math.PI * 2;
      const r = 0.095;
      const px = x + r * Math.sin(theta) * Math.cos(phi);
      const py = 1.48 + r * 0.8 * Math.cos(theta);
      const pz = z + r * Math.sin(theta) * Math.sin(phi);
      const sp = add(sprinkleGeo, sprinkleColors[k % sprinkleColors.length], px, py, pz);
      sp.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
    }
  }

  // Hanging cones on the awning edge sides
  for (const sx of [-0.85, 0.85]) {
    const c = add(new THREE.ConeGeometry(0.05, 0.14, 8), waffle, sx, 1.7, 0.6);
    c.rotation.x = Math.PI;
  }

  return root;
}
