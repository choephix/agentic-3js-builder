import * as THREE from "three";

export const meta = {
  name: "Old Lion at Rest",
  description:
    "A proud old lion lying sphinx-like with his head held high: a huge layered mane fading from golden blond to dark chocolate, tawny body, cream belly and muzzle, amber eyes, a broad black nose, a scarred brow, big padded paws and a long tufted tail.",
};

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function createLion(): THREE.Object3D {
  const rng = mulberry32(1337);
  const root = new THREE.Group();

  // ---------- textures ----------
  function furTexture(base: string, dark: string, light: string) {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = base;
    g.fillRect(0, 0, 256, 256);
    const r = mulberry32(99);
    for (let i = 0; i < 900; i++) {
      g.strokeStyle = r() < 0.55 ? dark : light;
      g.globalAlpha = 0.18 + r() * 0.2;
      g.lineWidth = 1 + r() * 1.5;
      const x = r() * 256, y = r() * 256, l = 4 + r() * 8;
      const a = Math.PI / 2 + (r() - 0.5) * 0.6;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    return t;
  }

  // ---------- materials ----------
  const std = (color: string, rough = 0.85, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, flatShading: true, ...extra });

  const tawny = std("#ffffff", 0.9, { map: furTexture("#c8914a", "#a0692c", "#e0b06a") });
  const tawnyDark = std("#9a6430");
  const cream = std("#f1dfba", 0.9, { map: furTexture("#f1dfba", "#d8bf92", "#fff3dc") });
  const black = std("#151010", 0.6);
  const noseMat = std("#1e1616", 0.45);
  const amber = std("#e89a1c", 0.25, { emissive: new THREE.Color("#5a2a00"), emissiveIntensity: 0.25 });
  const white = std("#fffaf0", 0.2);
  const scar = std("#d9a3a0", 0.7);
  const grey = std("#cfc6b4", 0.9);
  const padMat = std("#3b2a26", 0.7);
  const earInner = std("#e6c9a0", 0.9);
  const maneCols = ["#f4cf72", "#dcaa45", "#bb7e2f", "#8c5427", "#5f341a", "#3a1f12"].map((c) => std(c, 0.95));

  // ---------- helpers ----------
  const sphereGeo = new THREE.SphereGeometry(1, 10, 7);
  const sphereLo = new THREE.SphereGeometry(1, 7, 5);
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const coneGeo = new THREE.ConeGeometry(1, 1, 5, 1);
  coneGeo.translate(0, 0.5, 0);
  const UP = new THREE.Vector3(0, 1, 0);

  function blob(parent: THREE.Object3D, mat: THREE.Material, p: number[], s: number[], rot: number[] = [0, 0, 0], lo = false) {
    const m = new THREE.Mesh(lo ? sphereLo : sphereGeo, mat);
    m.position.set(p[0], p[1], p[2]);
    m.scale.set(s[0], s[1], s[2]);
    m.rotation.set(rot[0], rot[1], rot[2]);
    parent.add(m);
    return m;
  }
  function box(parent: THREE.Object3D, mat: THREE.Material, p: number[], s: number[], rot: number[] = [0, 0, 0]) {
    const m = new THREE.Mesh(boxGeo, mat);
    m.position.set(p[0], p[1], p[2]);
    m.scale.set(s[0], s[1], s[2]);
    m.rotation.set(rot[0], rot[1], rot[2]);
    parent.add(m);
    return m;
  }
  function segment(parent: THREE.Object3D, mat: THREE.Material, a: THREE.Vector3, b: THREE.Vector3, ra: number, rb: number, seg = 7) {
    const d = new THREE.Vector3().subVectors(b, a);
    const len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, seg), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(UP, d.normalize());
    parent.add(m);
    // rounded joints
    blob(parent, mat, [a.x, a.y, a.z], [ra, ra, ra], [0, 0, 0], true);
    blob(parent, mat, [b.x, b.y, b.z], [rb, rb, rb], [0, 0, 0], true);
    return m;
  }
  function tuft(parent: THREE.Object3D, mat: THREE.Material, p: THREE.Vector3, dir: THREE.Vector3, r: number, h: number) {
    const m = new THREE.Mesh(coneGeo, mat);
    m.position.copy(p);
    m.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
    m.rotateY(rng() * Math.PI);
    m.scale.set(r, h, r * (0.7 + rng() * 0.3));
    parent.add(m);
    return m;
  }
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- body ----------
  blob(root, tawny, [0, 0.45, -0.15], [0.42, 0.37, 0.88]);
  blob(root, cream, [0, 0.2, -0.1], [0.34, 0.18, 0.75]);
  blob(root, tawny, [0, 0.55, 0.5], [0.38, 0.43, 0.38]);
  blob(root, cream, [0, 0.4, 0.62], [0.26, 0.26, 0.24]);
  // spine ridge & rump
  blob(root, tawnyDark, [0, 0.8, -0.3], [0.12, 0.05, 0.55]);
  blob(root, tawny, [0, 0.5, -0.82], [0.36, 0.34, 0.3]);

  // ---------- paws ----------
  function paw(x: number, y: number, z: number, scale: number) {
    const s = scale;
    blob(root, tawny, [x, y, z], [0.12 * s, 0.075 * s, 0.14 * s]);
    const toeR = 0.045 * s;
    for (let i = 0; i < 4; i++) {
      const ox = (-0.075 + i * 0.05) * s;
      const oz = (i === 0 || i === 3 ? 0.1 : 0.12) * s;
      blob(root, cream, [x + ox, y - 0.012 * s, z + oz], [toeR, toeR * 0.95, toeR * 1.1], [0, 0, 0], true);
      if (i < 3) box(root, padMat, [x + ox + 0.025 * s, y + 0.02 * s, z + oz - 0.01 * s], [0.006, 0.035 * s, 0.05 * s]);
    }
    // visible pad bulge at back of paw
    blob(root, padMat, [x, y - 0.035 * s, z - 0.1 * s], [0.06 * s, 0.035 * s, 0.04 * s], [0, 0, 0], true);
  }

  // ---------- front legs ----------
  for (const sx of [-1, 1]) {
    blob(root, tawny, [sx * 0.24, 0.52, 0.38], [0.15, 0.28, 0.22]);
    segment(root, tawny, V(sx * 0.25, 0.42, 0.48), V(sx * 0.26, 0.14, 0.5), 0.11, 0.085);
    segment(root, tawny, V(sx * 0.26, 0.11, 0.52), V(sx * 0.25, 0.09, 0.98), 0.085, 0.075);
    paw(sx * 0.25, 0.075, 1.07, 1.05);
    // elbow tuft
    tuft(root, maneCols[4], V(sx * 0.28, 0.13, 0.46), V(sx * 0.3, 0.1, -1), 0.04, 0.12);
  }

  // ---------- hind legs ----------
  for (const sx of [-1, 1]) {
    blob(root, tawny, [sx * 0.3, 0.34, -0.6], [0.2, 0.3, 0.36], [0.2, 0, 0]);
    segment(root, tawny, V(sx * 0.37, 0.13, -0.88), V(sx * 0.4, 0.08, -0.42), 0.075, 0.065);
    paw(sx * 0.4, 0.065, -0.3, 0.9);
  }

  // ---------- tail ----------
  const tailCurve = new THREE.CatmullRomCurve3([
    V(0, 0.48, -1.0),
    V(0.06, 0.28, -1.25),
    V(0.25, 0.07, -1.45),
    V(0.58, 0.05, -1.52),
    V(0.85, 0.05, -1.38),
    V(0.98, 0.07, -1.12),
  ]);
  root.add(new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 28, 0.04, 6, false), tawny));
  const tEnd = tailCurve.getPoint(1);
  const tTan = tailCurve.getTangent(1);
  blob(root, maneCols[5], [tEnd.x, tEnd.y + 0.01, tEnd.z], [0.065, 0.06, 0.07]);
  for (let i = 0; i < 9; i++) {
    const d = tTan.clone().add(V((rng() - 0.5) * 1.2, rng() * 0.6, (rng() - 0.5) * 1.2));
    tuft(root, i % 3 === 0 ? maneCols[4] : maneCols[5], tEnd.clone().add(V(0, 0.01, 0)), d, 0.035, 0.13 + rng() * 0.05);
  }

  // ---------- neck ----------
  segment(root, tawny, V(0, 0.6, 0.45), V(0, 1.0, 0.72), 0.2, 0.17);

  // ---------- body mane (around neck and shoulders) ----------
  const mc = V(0, 0.85, 0.42);
  const N = 210;
  for (let i = 0; i < N; i++) {
    const y = 1 - (2 * (i + 0.5)) / N;
    const rr = Math.sqrt(1 - y * y);
    const th = i * 2.39996;
    const d = V(Math.cos(th) * rr, y, Math.sin(th) * rr);
    if (d.z > 0.5 && d.y > -0.25) continue; // face region handled by head ruff
    const p = mc.clone().add(V(d.x * 0.42, d.y * 0.44, d.z * 0.44));
    p.add(V((rng() - 0.5) * 0.04, (rng() - 0.5) * 0.04, (rng() - 0.5) * 0.04));
    if (p.y < 0.36) continue;
    const dir = d.clone().add(V(0, -0.35, -0.3));
    let idx = Math.round(2 + (0.4 - d.z) * 1.9 + rng() * 0.8);
    idx = Math.min(5, Math.max(1, idx));
    tuft(root, maneCols[idx], p, dir, 0.08 + rng() * 0.035, 0.26 + rng() * 0.14);
  }

  // ---------- head ----------
  const head = new THREE.Group();
  head.position.set(0, 1.05, 0.8);
  head.rotation.x = -0.08;
  root.add(head);

  blob(head, tawny, [0, 0.02, 0], [0.2, 0.19, 0.21]);
  blob(head, tawny, [0, 0.1, 0.06], [0.16, 0.09, 0.15]); // broad forehead
  for (const sx of [-1, 1]) blob(head, tawny, [sx * 0.12, -0.05, 0.1], [0.09, 0.09, 0.09]); // cheeks
  box(head, tawny, [0, 0.02, 0.18], [0.12, 0.08, 0.24], [0.28, 0, 0]); // nose bridge
  blob(head, cream, [0, -0.06, 0.2], [0.13, 0.09, 0.12]); // muzzle
  for (const sx of [-1, 1]) blob(head, cream, [sx * 0.05, -0.065, 0.27], [0.065, 0.06, 0.06]); // whisker pads
  blob(head, cream, [0, -0.15, 0.18], [0.075, 0.055, 0.08]); // chin
  box(head, black, [0, -0.115, 0.27], [0.12, 0.008, 0.02]); // mouth line
  box(head, black, [0, -0.09, 0.315], [0.008, 0.04, 0.01]); // philtrum

  // broad black nose
  box(head, noseMat, [0, -0.012, 0.315], [0.105, 0.045, 0.05]);
  const noseTip = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.012, 0.045, 3), noseMat);
  noseTip.rotation.set(Math.PI / 2, 0, Math.PI);
  noseTip.position.set(0, -0.04, 0.322);
  noseTip.scale.set(1, 1, 0.6);
  head.add(noseTip);
  for (const sx of [-1, 1]) blob(head, black, [sx * 0.032, -0.02, 0.338], [0.016, 0.01, 0.01], [0, 0, 0], true);

  // grizzled muzzle & whisker spots
  for (const sx of [-1, 1]) {
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        blob(head, black, [sx * (0.035 + c * 0.02), -0.05 - r * 0.018, 0.318 - c * 0.012], [0.005, 0.005, 0.005], [0, 0, 0], true);
    for (let k = 0; k < 6; k++)
      blob(head, grey, [sx * (0.03 + rng() * 0.08), -0.1 + rng() * 0.06, 0.25 + rng() * 0.04], [0.008, 0.008, 0.008], [0, 0, 0], true);
    for (let w = 0; w < 4; w++) {
      const a = V(sx * 0.08, -0.06 - w * 0.012, 0.29);
      const b = V(sx * (0.25 + w * 0.01), -0.04 - w * 0.04, 0.3 + (1 - w) * 0.02);
      const d = new THREE.Vector3().subVectors(b, a);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.0015, 0.003, d.length(), 3), white);
      m.position.copy(a).addScaledVector(d, 0.5);
      m.quaternion.setFromUnitVectors(UP, d.normalize());
      head.add(m);
    }
  }

  // eyes
  for (const sx of [-1, 1]) {
    const e = new THREE.Group();
    e.position.set(sx * 0.085, 0.05, 0.178);
    e.rotation.y = sx * 0.35;
    head.add(e);
    blob(e, black, [0, 0, -0.004], [0.042, 0.03, 0.02]);
    blob(e, amber, [0, 0, 0.004], [0.03, 0.024, 0.02]);
    blob(e, black, [0, 0, 0.019], [0.011, 0.015, 0.006], [0, 0, 0], true);
    blob(e, white, [sx * -0.008, 0.009, 0.022], [0.005, 0.005, 0.004], [0, 0, 0], true);
    // heavy brow
    box(head, tawnyDark, [sx * 0.09, 0.098, 0.17], [0.1, 0.028, 0.05], [0.2, 0, sx * -0.22]);
    // tear line
    box(head, black, [sx * 0.068, 0.0, 0.2], [0.008, 0.05, 0.008], [0, 0, sx * 0.3]);
  }

  // scar across left (+X) eyebrow
  box(head, scar, [0.1, 0.085, 0.2], [0.012, 0.15, 0.012], [0.25, 0, -0.55]);
  box(head, scar, [0.125, 0.08, 0.19], [0.009, 0.1, 0.01], [0.25, 0, -0.55]);
  box(head, tawny, [0.095, 0.1, 0.178], [0.022, 0.03, 0.055], [0.2, 0, -0.22]); // nick through brow
  box(head, scar, [0.095, 0.1, 0.205], [0.016, 0.026, 0.008], [0.2, 0, -0.55]);

  // ears (left one notched by an old fight)
  for (const sx of [-1, 1]) {
    const ear = new THREE.Group();
    ear.position.set(sx * 0.14, 0.19, 0.02);
    ear.rotation.z = sx * -0.35;
    head.add(ear);
    blob(ear, tawnyDark, [0, 0, 0], [0.06, 0.065, 0.026]);
    blob(ear, earInner, [0, -0.008, 0.016], [0.04, 0.045, 0.012]);
    if (sx === 1) box(ear, maneCols[0], [0.025, 0.045, 0], [0.025, 0.025, 0.06], [0, 0, 0.6]);
  }

  // face ruff: rings of tufts, golden at the face to chocolate outward
  const rings = [
    { r: 0.21, z: -0.03, n: 18 },
    { r: 0.27, z: -0.08, n: 22 },
    { r: 0.33, z: -0.15, n: 26 },
    { r: 0.38, z: -0.24, n: 28 },
    { r: 0.4, z: -0.34, n: 26 },
  ];
  const earAngles = [Math.atan2(0.19, 0.14), Math.atan2(0.19, -0.14)];
  rings.forEach((ring, i) => {
    for (let k = 0; k < ring.n; k++) {
      const th = (k / ring.n) * Math.PI * 2 + i * 0.37 + (rng() - 0.5) * 0.12;
      if (i === 0) {
        let near = false;
        for (const ea of earAngles) {
          let dd = Math.abs(((th - ea + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
          if (dd < 0.3) near = true;
        }
        if (near) continue;
      }
      const c = Math.cos(th), s = Math.sin(th);
      const p = V(c * ring.r, s * ring.r * 1.05 - 0.02, ring.z);
      const dir = V(c, s - 0.2, -0.3 - 0.12 * i);
      const idx = Math.min(5, i + (rng() < 0.35 ? 1 : 0));
      const big = s < -0.3 ? 1.15 : 1;
      tuft(head, maneCols[idx], p, dir, (0.055 + 0.012 * i) * big, (0.15 + 0.05 * i + rng() * 0.05) * big);
    }
  });
  // forelock between ears
  for (let k = 0; k < 3; k++)
    tuft(head, maneCols[1], V((k - 1) * 0.05, 0.2, 0.0), V((k - 1) * 0.3, 1, 0.4), 0.04, 0.1);

  return root;
}
