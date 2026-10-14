import * as THREE from "three";

export const meta = {
  name: "Typewriter",
  description:
    "A stylized red portable typewriter with cream keys, a chrome carriage, a platen with paper, and a front badge.",
};

function labelTexture(text: string, bg: string, fg: string, size = 128, fontScale = 0.62): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, size, size);
  g.fillStyle = fg;
  g.font = `bold ${Math.floor(size * fontScale)}px Arial, Helvetica, sans-serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, size / 2, size / 2 + size * 0.04);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function badgeTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 96;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = "#d9b45a";
  g.fillRect(0, 0, w, h);
  g.strokeStyle = "#7a5a1c";
  g.lineWidth = 8;
  g.strokeRect(10, 10, w - 20, h - 20);
  g.fillStyle = "#3b2a10";
  g.font = "bold 56px Georgia, serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("PORTABLE  No.7", w / 2, h / 2 + 4);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();

  const std = (color: number, roughness = 0.5, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });

  const red = std(0xb83a2e, 0.55);
  const cream = std(0xf1e7cc, 0.6);
  const black = std(0x1b1b1d, 0.8);
  const chrome = std(0xc8ccd2, 0.3, 0.85);
  const paper = std(0xfbf9f1, 0.9);
  const ink = std(0x6b6b6b, 0.9);

  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material | THREE.Material[],
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = root
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };

  const boxGeo = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  // Cylinder with its axis along X
  const cylXGeo = (r: number, len: number, seg = 14) => {
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    g.rotateZ(Math.PI / 2);
    return g;
  };
  // Cylinder with its axis along Y
  const cylYGeo = (r: number, h: number, seg = 12) => new THREE.CylinderGeometry(r, r, h, seg);

  // ---- Base and rear housing ----
  add(boxGeo(0.44, 0.10, 0.32), red, 0, 0.08, 0);
  add(boxGeo(0.44, 0.10, 0.18), red, 0, 0.18, -0.07);
  add(boxGeo(0.40, 0.006, 0.16), cream, 0, 0.233, -0.07);

  // Sloped keyboard deck
  add(boxGeo(0.44, 0.03, 0.14), red, 0, 0.14, 0.05);

  // Feet
  for (const fx of [-0.19, 0.19]) {
    for (const fz of [-0.12, 0.12]) {
      add(cylYGeo(0.022, 0.03, 12), black, fx, 0.015, fz);
    }
  }

  // Front badge
  add(boxGeo(0.24, 0.05, 0.004), chrome, 0, 0.085, 0.163);
  const badgeMat = new THREE.MeshStandardMaterial({ map: badgeTexture(), roughness: 0.4, metalness: 0.2 });
  add(new THREE.PlaneGeometry(0.22, 0.04), badgeMat, 0, 0.085, 0.1655);

  // ---- Keys ----
  const keyCache = new Map<string, THREE.MeshStandardMaterial>();
  const keyMat = (label: string) => {
    let mat = keyCache.get(label);
    if (!mat) {
      mat = new THREE.MeshStandardMaterial({
        map: labelTexture(label, "#f4ecd8", "#1a1a1a", 64, 0.6),
        roughness: 0.45,
      });
      keyCache.set(label, mat);
    }
    return mat;
  };

  const capGeo = boxGeo(0.019, 0.012, 0.019);
  const rows: { keys: string; z: number }[] = [
    { keys: "1234567890", z: 0.10 },
    { keys: "QWERTYUIOP", z: 0.078 },
    { keys: "ASDFGHJKL", z: 0.056 },
    { keys: "ZXCVBNM", z: 0.034 },
  ];
  const spacing = 0.0225;
  for (const row of rows) {
    const n = row.keys.length;
    for (let i = 0; i < n; i++) {
      const label = row.keys[i];
      const x = (i - (n - 1) / 2) * spacing;
      const mats = [cream, cream, keyMat(label), cream, cream, cream];
      add(capGeo, mats, x, 0.166, row.z);
    }
  }

  // Space bar
  add(boxGeo(0.14, 0.012, 0.028), cream, 0, 0.162, 0.0);
  add(boxGeo(0.14, 0.004, 0.004), black, 0, 0.158, 0.0144);

  // ---- Carriage, platen, paper ----
  const platenZ = -0.07;
  const platenY = 0.30;
  add(cylXGeo(0.028, 0.40, 16), black, 0, platenY, platenZ);
  for (const sx of [-0.205, 0.205]) {
    add(cylXGeo(0.03, 0.01, 14), chrome, sx, platenY, platenZ);
  }
  for (const sx of [-0.235, 0.235]) {
    add(cylXGeo(0.016, 0.02, 12), black, sx, platenY, platenZ);
  }

  for (const sx of [-0.215, 0.215]) {
    add(boxGeo(0.02, 0.11, 0.035), chrome, sx, 0.285, platenZ);
  }
  add(boxGeo(0.47, 0.014, 0.04), chrome, 0, 0.343, platenZ);

  // Paper sheet leaning back behind the platen
  const paperGroup = new THREE.Group();
  paperGroup.position.set(0, 0.38, -0.108);
  paperGroup.rotation.x = -0.2;
  root.add(paperGroup);
  add(boxGeo(0.23, 0.30, 0.002), paper, 0, 0, 0, paperGroup);
  for (let i = 0; i < 6; i++) {
    const ly = -0.10 + i * 0.035;
    add(boxGeo(0.16, 0.005, 0.001), ink, 0, ly, 0.0015, paperGroup);
  }

  // ---- Carriage return lever on the right side ----
  add(boxGeo(0.012, 0.012, 0.14), chrome, 0.23, 0.20, 0.03);
  add(boxGeo(0.012, 0.05, 0.012), chrome, 0.23, 0.18, 0.10);
  add(cylXGeo(0.02, 0.03, 12), black, 0.23, 0.20, 0.10);

  // Ribbon-style spool cap on the left deck corner
  add(cylYGeo(0.018, 0.008, 12), chrome, -0.16, 0.16, -0.02);

  return root;
}
