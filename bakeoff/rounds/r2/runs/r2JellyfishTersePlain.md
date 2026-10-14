```ts
import * as THREE from "three";

export const meta = {
  name: "Jellyfish",
  description: "Stylized low-poly moon jellyfish with a faceted bell, ruffled rim, frilly oral arms and trailing tentacles, floating above the ground.",
};

export default function build(): THREE.Object3D {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const root = new THREE.Group();

  // canvas texture for bell: radial bands + spots
  const c = document.createElement("canvas");
  c.width = 256; c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#e9a6ee";
  g.fillRect(0, 0, 256, 128);
  for (let i = 0; i < 16; i++) {
    g.fillStyle = i % 2 ? "rgba(255,255,255,0.18)" : "rgba(160,80,200,0.18)";
    g.fillRect(i * 16, 0, 16, 128);
  }
  for (let i = 0; i < 70; i++) {
    g.fillStyle = "rgba(255,240,255,0.55)";
    g.beginPath();
    g.arc(rnd() * 256, rnd() * 100, 1 + rnd() * 3, 0, 7);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;

  const bellMat = new THREE.MeshStandardMaterial({
    map: tex, transparent: true, opacity: 0.82, roughness: 0.25, metalness: 0.0,
    emissive: 0x6a2a8a, emissiveIntensity: 0.35, flatShading: true, side: THREE.DoubleSide,
  });
  const gonadMat = new THREE.MeshStandardMaterial({ color: 0xff6fb0, emissive: 0xaa2266, emissiveIntensity: 0.5, roughness: 0.5, flatShading: true });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xc66ee0, roughness: 0.4, flatShading: true });
  const armMat = new THREE.MeshStandardMaterial({ color: 0xf6b8e8, transparent: true, opacity: 0.85, roughness: 0.5, flatShading: true, side: THREE.DoubleSide });
  const tentMat = new THREE.MeshStandardMaterial({ color: 0x9a6be0, emissive: 0x4422aa, emissiveIntensity: 0.4, roughness: 0.5, flatShading: true });
  const tipMat = new THREE.MeshStandardMaterial({ color: 0xbff6ff, emissive: 0x55ccee, emissiveIntensity: 0.8, roughness: 0.3, flatShading: true });

  const baseY = 0.05;
  const top = new THREE.Group();
  top.position.y = 0.75;
  root.add(top);

  // bell: dome
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), bellMat);
  bell.scale.set(1, 0.75, 1);
  bell.position.y = 0;
  top.add(bell);

  // inner bell
  const inner = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshStandardMaterial({ color: 0xd080e8, transparent: true, opacity: 0.5, flatShading: true, side: THREE.DoubleSide }));
  inner.scale.set(1, 0.7, 1);
  inner.position.y = 0.0;
  top.add(inner);

  // gonad horseshoe rings (4 clover)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const m = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.025, 5, 8), gonadMat);
    m.rotation.x = Math.PI / 2;
    m.position.set(Math.cos(a) * 0.14, 0.14, Math.sin(a) * 0.14);
    top.add(m);
  }

  // rim ruffle: ring of lobes
  const N = 24;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.065, 5, 4), rimMat);
    lobe.scale.set(1, 0.7, 1.3);
    lobe.position.set(Math.cos(a) * 0.5, -0.01 + (i % 2) * -0.03, Math.sin(a) * 0.5);
    lobe.rotation.y = -a;
    top.add(lobe);
  }

  // oral arms: 4 frilly ribbons
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const arm = new THREE.Group();
    arm.position.set(Math.cos(a) * 0.09, -0.03, Math.sin(a) * 0.09);
    arm.rotation.y = -a;
    for (let s = 0; s < 7; s++) {
      const seg = new THREE.Mesh(new THREE.BoxGeometry(0.16 - s * 0.008, 0.1, 0.012), armMat);
      seg.position.set(0.03 + Math.sin(s * 0.9) * 0.04, -s * 0.095, 0);
      seg.rotation.y = s * 0.35;
      seg.rotation.z = Math.sin(s) * 0.12;
      arm.add(seg);
    }
    top.add(arm);
  }

  // tentacles
  const T = 20;
  for (let i = 0; i < T; i++) {
    const a = (i / T) * Math.PI * 2 + rnd() * 0.1;
    const len = 0.35 + rnd() * 0.3;
    const segs = 6;
    let x = Math.cos(a) * 0.46, z = Math.sin(a) * 0.46, y = -0.04;
    const ph = rnd() * 6;
    for (let s = 0; s < segs; s++) {
      const h = len / segs;
      const r = 0.012 - s * 0.001;
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.001, h, 4), s === segs - 1 ? tipMat : tentMat);
      x += Math.sin(ph + s * 0.9) * 0.012 - Math.cos(a) * 0.004;
      z += Math.cos(ph + s * 0.9) * 0.012 - Math.sin(a) * 0.004;
      cyl.position.set(x, y - h / 2, z);
      top.add(cyl);
      y -= h;
    }
  }

  // shift so lowest point at floating height: lowest ~ arms
  const box = new THREE.Box3().setFromObject(root);
  root.position.y = baseY - box.min.y;
  const wrap = new THREE.Group();
  wrap.add(root);
  return wrap;
}
```