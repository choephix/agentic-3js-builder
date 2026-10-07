import * as THREE from "three";

export const meta = {
  name: "Antique Gramophone",
  description: "Walnut cabinet gramophone with a morning-glory brass horn, record, tonearm, crank and claw feet.",
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
  const rand = rng(7);

  // textures
  const wc = document.createElement("canvas");
  wc.width = wc.height = 256;
  const g = wc.getContext("2d")!;
  g.fillStyle = "#5a3520";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 70; i++) {
    g.strokeStyle = rand() > 0.5 ? "#4a2a18" : "#6b4128";
    g.lineWidth = 1 + rand() * 2;
    const x = rand() * 256;
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x + (rand() - 0.5) * 20, 256);
    g.stroke();
  }
  // inlay floral
  const flower = (cx: number, cy: number, r: number) => {
    g.fillStyle = "#e8d5a8";
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      g.beginPath();
      g.ellipse(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.6, r * 0.3, a, 0, 7);
      g.fill();
    }
    g.fillStyle = "#c9923a";
    g.beginPath();
    g.arc(cx, cy, r * 0.35, 0, 7);
    g.fill();
  };
  flower(128, 128, 22);
  flower(40, 40, 10);
  flower(216, 40, 10);
  flower(40, 216, 10);
  flower(216, 216, 10);
  g.strokeStyle = "#e8d5a8";
  g.lineWidth = 3;
  g.strokeRect(10, 10, 236, 236);
  const tex = new THREE.CanvasTexture(wc);
  tex.colorSpace = THREE.SRGBColorSpace;

  const wood = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex, roughness: 0.55 });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x3e2314, roughness: 0.6 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc79b3b, metalness: 0.8, roughness: 0.35, flatShading: true });
  const patina = new THREE.MeshStandardMaterial({ color: 0x6f9a7a, metalness: 0.5, roughness: 0.6, flatShading: true });
  const silver = new THREE.MeshStandardMaterial({ color: 0xd8dde0, metalness: 0.9, roughness: 0.25 });
  const black = new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.3 });
  const red = new THREE.MeshStandardMaterial({ color: 0xb01c1c, roughness: 0.5 });
  const felt = new THREE.MeshStandardMaterial({ color: 0x2f5a3a, roughness: 0.95 });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, p: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    p.add(m);
    return m;
  };

  // cabinet
  const W = 0.5, D = 0.5, H = 0.5, y0 = 0.1;
  add(new THREE.BoxGeometry(W, H, D), wood, 0, y0 + H / 2, 0);
  add(new THREE.BoxGeometry(W + 0.04, 0.04, D + 0.04), darkWood, 0, y0 + 0.02, 0);
  add(new THREE.BoxGeometry(W + 0.05, 0.04, D + 0.05), darkWood, 0, y0 + H + 0.02, 0);
  add(new THREE.BoxGeometry(W + 0.07, 0.015, D + 0.07), darkWood, 0, y0 + H + 0.047, 0);
  // corner columns
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      add(new THREE.CylinderGeometry(0.02, 0.02, H, 6), darkWood, sx * (W / 2), y0 + H / 2, sz * (D / 2));
  // front panel details: grille
  add(new THREE.BoxGeometry(0.2, 0.2, 0.01), darkWood, 0, y0 + 0.25, D / 2 + 0.003);
  for (let i = 0; i < 6; i++)
    add(new THREE.BoxGeometry(0.17, 0.012, 0.012), brass, 0, y0 + 0.17 + i * 0.03, D / 2 + 0.01);

  // claw feet
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const f = new THREE.Group();
      f.position.set(sx * 0.22, 0, sz * 0.22);
      add(new THREE.BoxGeometry(0.06, 0.06, 0.06), darkWood, 0, 0.07, 0, f);
      add(new THREE.SphereGeometry(0.04, 6, 5), brass, 0, 0.035, 0, f);
      for (let t = -1; t <= 1; t++) {
        const toe = add(new THREE.ConeGeometry(0.01, 0.045, 5), brass, 0, 0.012, 0, f);
        toe.rotation.set(Math.PI / 2 * 0.9, 0, 0);
        toe.position.set(t * 0.022, 0.015, sz * 0.04);
        toe.rotation.z = t * 0.3;
        toe.rotation.x = sz * Math.PI / 2;
      }
    }

  // turntable
  const topY = y0 + H + 0.055;
  add(new THREE.CylinderGeometry(0.15, 0.15, 0.015, 20), felt, -0.04, topY + 0.008, 0.02);
  add(new THREE.CylinderGeometry(0.14, 0.14, 0.008, 24), black, -0.04, topY + 0.02, 0.02);
  for (const r of [0.06, 0.09, 0.115]) {
    const ring = add(new THREE.TorusGeometry(r, 0.0015, 3, 24), silver, -0.04, topY + 0.025, 0.02);
    ring.rotation.x = Math.PI / 2;
  }
  add(new THREE.CylinderGeometry(0.04, 0.04, 0.003, 16), red, -0.04, topY + 0.026, 0.02);
  add(new THREE.CylinderGeometry(0.004, 0.004, 0.03, 6), silver, -0.04, topY + 0.04, 0.02);

  // tonearm
  const arm = new THREE.Group();
  arm.position.set(0.17, topY + 0.03, 0.14);
  root.add(arm);
  add(new THREE.CylinderGeometry(0.025, 0.03, 0.04, 8), silver, 0, -0.01, 0, arm);
  const bar = add(new THREE.CylinderGeometry(0.005, 0.005, 0.28, 6), silver, 0, 0.012, 0, arm);
  bar.rotation.z = Math.PI / 2;
  bar.rotation.y = 0;
  arm.rotation.y = -0.55;
  bar.position.x = -0.14;
  add(new THREE.BoxGeometry(0.04, 0.018, 0.025), silver, -0.29, 0.005, 0, arm);
  add(new THREE.ConeGeometry(0.003, 0.02, 4), black, -0.3, -0.012, 0, arm).rotation.x = Math.PI;

  // crank on side
  const crank = new THREE.Group();
  crank.position.set(W / 2 + 0.05, y0 + 0.3, 0);
  root.add(crank);
  const sh = add(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 6), brass, 0.0, 0, 0, crank);
  sh.rotation.z = Math.PI / 2;
  sh.position.x = -0.01;
  add(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 8), patina, -0.045, 0, 0, crank).rotation.z = Math.PI / 2;
  add(new THREE.BoxGeometry(0.012, 0.1, 0.012), brass, 0.03, -0.04, 0, crank);
  const knob = add(new THREE.CylinderGeometry(0.012, 0.012, 0.05, 6), darkWood, 0.055, -0.09, 0, crank);
  knob.rotation.z = Math.PI / 2;

  // horn: lathe profile
  const hornPts: THREE.Vector2[] = [];
  const N = 14;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const r = 0.025 + 0.4 * Math.pow(t, 3.2) + 0.03 * t;
    hornPts.push(new THREE.Vector2(r, t * 0.55));
  }
  const hornGeo = new THREE.LatheGeometry(hornPts, 16);
  const hornMat = brass.clone();
  hornMat.side = THREE.DoubleSide;
  const horn = new THREE.Group();
  horn.position.set(-0.02, topY + 0.2, -0.05);
  root.add(horn);
  // bell axis along +Z-ish, tilted upward
  const hornBody = add(hornGeo, hornMat, 0, 0, 0, horn);
  hornBody.rotation.x = Math.PI / 2;
  hornBody.position.z = 0.0;
  horn.rotation.x = -0.0;
  horn.rotation.y = 0;
  // flipped so bell faces +Z; neck at back
  hornBody.rotation.x = Math.PI / 2;
  // rim ring and patina bands
  const rim = add(new THREE.TorusGeometry(0.43, 0.012, 4, 16), brass, 0, 0, 0.55, horn);
  const rimBand = add(new THREE.TorusGeometry(0.3, 0.008, 4, 16), patina, 0, 0, 0.5, horn);
  // petal ridges (morning-glory)
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const ridge = add(new THREE.BoxGeometry(0.012, 0.012, 0.3), patina, Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0.42, horn);
    ridge.rotation.set(-Math.sin(a) * 0.5, Math.cos(a) * 0.5, 0);
    ridge.rotation.order = "YXZ";
    ridge.rotation.set(-Math.sin(a) * 0.45, Math.cos(a) * 0.45, 0);
  }
  // swan neck elbow: curved tube from cabinet to horn
  const neckCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.0, 0, 0),
    new THREE.Vector3(0.0, 0, 0),
  ]);
  void neckCurve;
  const elbowCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.04, topY + 0.02, 0.0),
    new THREE.Vector3(-0.04, topY + 0.12, -0.08),
    new THREE.Vector3(-0.03, topY + 0.2, -0.07),
    new THREE.Vector3(-0.02, topY + 0.2, -0.05),
  ]);
  add(new THREE.TubeGeometry(elbowCurve, 8, 0.03, 6), patina);
  add(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), brass, -0.04, topY + 0.015, 0);
  // support collar at horn neck
  add(new THREE.CylinderGeometry(0.04, 0.03, 0.04, 8), brass, -0.02, topY + 0.2, -0.04);

  // shift whole model so horn doesn't overhang weirdly; ensure centred
  root.position.x = 0;
  return root;
}
