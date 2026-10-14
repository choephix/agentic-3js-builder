import * as THREE from "three";

export const meta = { name: "Great Horned Owl", description: "Great horned owl perched on a gnarled branch, built from low-poly primitives with canvas-textured plumage." };

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function featherTex(base: string, dark: string, light: string, seed: number, bars: boolean) {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const g = c.getContext("2d")!;
  const r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 160; i++) {
    g.fillStyle = r() > 0.5 ? dark : light;
    g.globalAlpha = 0.35;
    g.fillRect(r() * 128, r() * 128, 2 + r() * 6, 2 + r() * 5);
  }
  g.globalAlpha = 0.6;
  if (bars) {
    g.strokeStyle = dark; g.lineWidth = 2;
    for (let y = 4; y < 128; y += 9) {
      g.beginPath();
      for (let x = 0; x <= 128; x += 16) g.lineTo(x, y + (r() - 0.5) * 4);
      g.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const r = rng(7);
  const M = (color: number | string, rough = 0.9, map?: THREE.Texture) =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, flatShading: true, map });

  const brownTex = featherTex("#6b4a30", "#2c1c10", "#b89466", 1, true);
  const buffTex = featherTex("#c9a672", "#5a3d22", "#e8d5a8", 2, true);
  const wingTex = featherTex("#5a3d27", "#1e130b", "#a88458", 3, true);
  const bark = featherTex("#4a3828", "#241a10", "#6e5640", 4, false);
  const brown = M("#fff", 0.9, brownTex);
  const buff = M("#fff", 0.9, buffTex);
  const wing = M("#fff", 0.9, wingTex);
  const barkM = M("#fff", 1, bark);
  const pale = M("#efe3c8");
  const tawny = M("#c98e4e");
  const black = M("#141010", 0.6);
  const orange = new THREE.MeshStandardMaterial({ color: "#ff9a10", roughness: 0.3, emissive: "#a04800", emissiveIntensity: 0.4, flatShading: true });
  const grey = M("#6c7075", 0.5);
  const darkBrown = M("#2e2016");

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, p: number[], rot: number[] = [0, 0, 0], s: number[] = [1, 1, 1], parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(p[0], p[1], p[2]);
    m.rotation.set(rot[0], rot[1], rot[2]);
    m.scale.set(s[0], s[1], s[2]);
    parent.add(m);
    return m;
  };

  // Branch
  const branch = new THREE.Group();
  root.add(branch);
  const seg = (a: number[], b: number[], r0: number, r1: number) => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const len = va.distanceTo(vb);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 7), barkM);
    m.position.copy(va).add(vb).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
    branch.add(m);
    const k = new THREE.Mesh(new THREE.IcosahedronGeometry(r0 * 1.05, 0), barkM);
    k.position.copy(va); branch.add(k);
  };
  const by = 0.14;
  seg([-0.75, by - 0.06, 0.02], [-0.35, by, 0], 0.075, 0.06);
  seg([-0.35, by, 0], [0.1, by + 0.01, 0], 0.06, 0.055);
  seg([0.1, by + 0.01, 0], [0.5, by - 0.02, 0.03], 0.055, 0.05);
  seg([0.5, by - 0.02, 0.03], [0.85, by + 0.05, -0.02], 0.05, 0.03);
  seg([0.45, by - 0.02, 0.02], [0.7, by + 0.25, -0.1], 0.03, 0.015);
  seg([-0.5, by - 0.02, 0], [-0.7, by + 0.22, 0.1], 0.03, 0.012);
  seg([-0.1, by, 0], [-0.2, by + 0.2, -0.12], 0.025, 0.01);
  for (let i = 0; i < 6; i++) {
    const kn = new THREE.Mesh(new THREE.IcosahedronGeometry(0.04 + r() * 0.02, 0), barkM);
    kn.position.set(-0.7 + i * 0.28, by + 0.04, (r() - 0.5) * 0.06);
    branch.add(kn);
  }
  // base so lowest point at floor: branch bottom ~0.14-0.075 =0.065; add stub
  seg([-0.3, by - 0.02, 0], [-0.3, 0.0, 0.0], 0.03, 0.04);
  seg([0.4, by - 0.03, 0], [0.4, 0.0, 0.0], 0.03, 0.04);

  // Owl
  const owl = new THREE.Group();
  owl.position.set(0, by + 0.05, 0);
  root.add(owl);
  const ico = (d: number) => new THREE.IcosahedronGeometry(d, 1);

  // body
  add(ico(0.16), brown, [0, 0.27, -0.01], [-0.25, 0, 0], [1, 1.5, 0.95], owl);
  // breast
  add(ico(0.13), buff, [0, 0.24, 0.07], [-0.2, 0, 0], [1.05, 1.4, 0.7], owl);
  // bib
  add(ico(0.06), pale, [0, 0.41, 0.1], [0, 0, 0], [1.2, 0.9, 0.6], owl);
  // breast barring stripes
  for (let i = 0; i < 6; i++) {
    add(new THREE.BoxGeometry(0.16 - i * 0.008, 0.008, 0.02), darkBrown, [0, 0.35 - i * 0.04, 0.155 - i * 0.004], [-0.2, 0, 0], [1, 1, 1], owl);
  }
  // tail
  add(new THREE.BoxGeometry(0.15, 0.3, 0.03), brown, [0, 0.07, -0.19], [-0.55, 0, 0], [1, 1, 1], owl);
  for (let i = 0; i < 3; i++) add(new THREE.BoxGeometry(0.15, 0.012, 0.035), darkBrown, [0, 0.12 - i * 0.07 + 0.03, -0.15 - i * 0.06 - 0.01], [-0.55, 0, 0], [1, 1, 1], owl);

  // wings
  for (const s of [-1, 1]) {
    const w = new THREE.Group();
    w.position.set(s * 0.15, 0.37, -0.02);
    w.rotation.set(0, 0, s * -0.08);
    owl.add(w);
    add(ico(0.1), wing, [s * 0.02, -0.14, -0.05], [-0.25, 0, 0], [0.55, 2.2, 1.1], w);
    add(new THREE.BoxGeometry(0.08, 0.2, 0.025), wing, [s * 0.01, -0.3, -0.1], [-0.4, 0, 0], [1, 1, 1], w);
    for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(0.075, 0.01, 0.026), darkBrown, [s * 0.01, -0.22 - i * 0.04, -0.1 - i * 0.015], [-0.4, 0, 0], [1, 1, 1], w);
    add(ico(0.055), buff, [s * 0.04, -0.05, 0.0], [0, 0, 0], [1, 0.9, 1], w);
  }

  // head
  const head = new THREE.Group();
  head.position.set(0, 0.5, 0.03);
  owl.add(head);
  add(ico(0.14), brown, [0, 0, 0], [0, 0, 0], [1.25, 0.9, 0.9], head);
  // facial discs
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 10), black, [s * 0.075, -0.005, 0.1], [Math.PI / 2, 0, 0], [1, 1, 1.08], head);
    add(new THREE.CylinderGeometry(0.068, 0.068, 0.025, 10), tawny, [s * 0.075, -0.005, 0.105], [Math.PI / 2, 0, 0], [1, 1, 1.08], head);
    // eyes
    add(new THREE.SphereGeometry(0.04, 10, 8), orange, [s * 0.07, 0.01, 0.12], [0, 0, 0], [1, 1, 0.7], head);
    add(new THREE.SphereGeometry(0.02, 8, 6), black, [s * 0.07, 0.01, 0.145], [0, 0, 0], [1, 1, 0.6], head);
    // brow
    add(new THREE.BoxGeometry(0.1, 0.025, 0.04), darkBrown, [s * 0.075, 0.055, 0.125], [0.2, 0, s * -0.35], [1, 1, 1], head);
    // ear tufts
    const tuft = add(new THREE.ConeGeometry(0.035, 0.2, 5), brown, [s * 0.09, 0.2, -0.0], [-0.1, 0, s * -0.3], [1, 1, 0.7], head);
    add(new THREE.ConeGeometry(0.02, 0.12, 4), darkBrown, [s * 0.098, 0.18, 0.025], [-0.1, 0, s * -0.3], [1, 1, 0.6], head);
    void tuft;
    // facial disc rim extra
    add(new THREE.BoxGeometry(0.02, 0.1, 0.02), black, [s * 0.14, -0.05, 0.07], [0, 0.4 * s, 0], [1, 1, 1], head);
  }
  // central ridge between discs
  add(new THREE.BoxGeometry(0.03, 0.09, 0.03), buff, [0, 0.03, 0.115], [0, 0, 0], [1, 1, 1], head);
  // beak
  add(new THREE.ConeGeometry(0.03, 0.07, 4), grey, [0, -0.035, 0.145], [Math.PI * 0.6, Math.PI / 4, 0], [1, 1, 1], head);
  add(new THREE.ConeGeometry(0.014, 0.03, 4), black, [0, -0.06, 0.16], [Math.PI * 0.85, Math.PI / 4, 0], [1, 1, 1], head);

  // legs and talons
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.04, 0.045, 0.14, 6), buff, [s * 0.075, 0.07, 0.05], [0, 0, 0], [1, 1, 1], owl);
    add(ico(0.05), buff, [s * 0.075, 0.03, 0.06], [0, 0, 0], [1, 0.8, 1.2], owl);
    for (let t = -1; t <= 1; t++) {
      const toe = new THREE.Group();
      toe.position.set(s * 0.075 + t * 0.026, 0.0, 0.09);
      toe.rotation.y = t * 0.2;
      owl.add(toe);
      add(new THREE.BoxGeometry(0.02, 0.02, 0.07), grey, [0, 0, 0.02], [0, 0, 0], [1, 1, 1], toe);
      add(new THREE.ConeGeometry(0.014, 0.065, 5), black, [0, -0.04, 0.065], [-0.2, 0, 0], [1, 1, 1], toe);
    }
    // back toe
    add(new THREE.ConeGeometry(0.014, 0.06, 5), black, [s * 0.075, -0.0, -0.04], [-1.8, 0, 0], [1, 1, 1], owl);
  }

  // owl small tweak: face slightly toward +Z, already. Lift whole owl so talons rest on branch
  owl.position.y = by + 0.045;

  return root;
}
