import * as THREE from "three";

export const meta = {
  name: "Great Horned Owl",
  description:
    "A great horned owl perched on a gnarled branch, with barred bark-brown and buff plumage, a pale bib, ear tufts, a tawny facial disc, orange eyes and a hooked grey beak.",
};

// Seeded generator so every build is identical.
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

// Canvas-drawn mottled plumage with fine dark barring.
function plumageTexture(seed: number, base: string, bar: string) {
  const rand = rng(seed);
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 256);

  // Mottling blotches.
  for (let i = 0; i < 260; i++) {
    const x = rand() * 256;
    const y = rand() * 256;
    const r = 3 + rand() * 9;
    ctx.globalAlpha = 0.08 + rand() * 0.14;
    ctx.fillStyle = rand() > 0.5 ? "#2b1c10" : "#d8c09a";
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.6, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Fine horizontal barring with slight wobble.
  ctx.strokeStyle = bar;
  for (let y = 0; y < 256; y += 9) {
    ctx.lineWidth = 1.6 + rand() * 1.2;
    ctx.beginPath();
    for (let x = 0; x <= 256; x += 16) {
      const yy = y + Math.sin(x * 0.05 + y) * 1.5 + (rand() - 0.5) * 2;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function add(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  scl: [number, number, number] = [1, 1, 1],
) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.scale.set(scl[0], scl[1], scl[2]);
  parent.add(m);
  return m;
}

export default function createModel(): THREE.Object3D {
  const root = new THREE.Group();

  // ---------- Materials (one per colour, shared) ----------
  const plumeTex = plumageTexture(7, "#7b5a3b", "#2e1f12");
  const plumeTex2 = plumageTexture(19, "#8c6a46", "#3a2818");
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: plumeTex,
    roughness: 0.9,
  });
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: plumeTex2,
    roughness: 0.92,
  });
  const buffMat = new THREE.MeshStandardMaterial({ color: 0xd9b98a, roughness: 0.9 });
  const bibMat = new THREE.MeshStandardMaterial({ color: 0xf1e3c6, roughness: 0.85 });
  const discMat = new THREE.MeshStandardMaterial({ color: 0xc4803c, roughness: 0.9 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x141210, roughness: 0.7 });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xff9a1a,
    emissive: 0x6a2a00,
    emissiveIntensity: 0.6,
    roughness: 0.25,
  });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x050403, roughness: 0.3 });
  const beakMat = new THREE.MeshStandardMaterial({ color: 0x8f959a, roughness: 0.5 });
  const talonMat = new THREE.MeshStandardMaterial({ color: 0x0c0b0a, roughness: 0.4 });
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x5a4130, roughness: 1.0 });
  const barkDarkMat = new THREE.MeshStandardMaterial({ color: 0x33251a, roughness: 1.0 });
  const mossMat = new THREE.MeshStandardMaterial({ color: 0x6f7d3a, roughness: 1.0 });

  // ---------- Branch (top surface at y = 0.1, bottom at y = 0) ----------
  const branch = new THREE.Group();
  root.add(branch);
  add(
    branch,
    new THREE.CylinderGeometry(0.05, 0.058, 1.3, 10),
    barkMat,
    [0, 0.05, 0],
    [0, 0, Math.PI / 2],
  );
  // Gnarled bulges and knots along the limb.
  add(branch, new THREE.SphereGeometry(0.065, 10, 8), barkMat, [-0.28, 0.05, 0], [0, 0, 0], [1, 0.85, 0.9]);
  add(branch, new THREE.SphereGeometry(0.05, 10, 8), barkDarkMat, [0.2, 0.06, 0.02], [0, 0, 0], [0.9, 1.1, 1]);
  add(branch, new THREE.SphereGeometry(0.03, 8, 6), barkDarkMat, [0.2, 0.1, 0.045], [0, 0, 0], [1.2, 0.6, 0.7]);
  add(branch, new THREE.SphereGeometry(0.03, 8, 6), barkDarkMat, [-0.5, 0.04, -0.03], [0, 0, 0], [1, 1, 1]);
  // Forked twig going up and back.
  add(branch, new THREE.CylinderGeometry(0.014, 0.022, 0.3, 7), barkMat, [0.45, 0.22, -0.1], [0.5, 0, -0.45]);
  add(branch, new THREE.CylinderGeometry(0.009, 0.014, 0.16, 6), barkMat, [0.52, 0.34, -0.05], [0.2, 0, 0.9]);
  // Small leaf cluster on the twig.
  add(branch, new THREE.SphereGeometry(0.05, 8, 6), mossMat, [0.56, 0.42, -0.02], [0, 0, 0], [1.2, 0.6, 1]);
  // Hanging moss on the limb.
  add(branch, new THREE.SphereGeometry(0.035, 8, 6), mossMat, [-0.42, 0.02, 0.05], [0, 0, 0], [1.4, 0.7, 1]);

  // ---------- Owl ----------
  const owl = new THREE.Group();
  root.add(owl);

  // Body: upright, slightly plump.
  add(owl, new THREE.SphereGeometry(0.13, 22, 16), bodyMat, [0, 0.28, 0], [0.12, 0, 0], [1, 1.3, 1]);

  // Pale bib on the upper breast.
  add(owl, new THREE.SphereGeometry(0.1, 14, 10), bibMat, [0, 0.4, 0.1], [0, 0, 0], [0.75, 0.5, 0.45]);

  // Belly band with buff tone, low on the body.
  add(owl, new THREE.SphereGeometry(0.11, 14, 10), buffMat, [0, 0.2, 0.07], [0, 0, 0], [0.8, 0.7, 0.45]);

  // Head.
  add(owl, new THREE.SphereGeometry(0.12, 22, 16), bodyMat, [0, 0.52, 0]);

  // Facial disc: tawny, puffed, rimmed in black.
  add(owl, new THREE.SphereGeometry(0.115, 20, 14), discMat, [0, 0.52, 0.09], [0, 0, 0], [1, 0.95, 0.35]);
  add(owl, new THREE.TorusGeometry(0.118, 0.011, 8, 28), rimMat, [0, 0.52, 0.1], [0, 0, 0], [1, 0.95, 1]);

  // Ear tufts: tall feathered horns angled outward.
  for (const side of [-1, 1]) {
    add(
      owl,
      new THREE.ConeGeometry(0.03, 0.14, 8),
      bodyMat,
      [side * 0.072, 0.63, 0.0],
      [0, 0, -side * 0.32],
    );
    add(
      owl,
      new THREE.ConeGeometry(0.022, 0.09, 7),
      bodyMat,
      [side * 0.085, 0.6, 0.02],
      [0.1, 0, -side * 0.5],
    );
  }

  // Eyes: big orange globes with black pupils, forward facing.
  for (const side of [-1, 1]) {
    const ex = side * 0.05;
    add(owl, new THREE.SphereGeometry(0.052, 16, 12), eyeMat, [ex, 0.54, 0.125]);
    add(owl, new THREE.TorusGeometry(0.054, 0.008, 6, 20), rimMat, [ex, 0.54, 0.13]);
    add(owl, new THREE.SphereGeometry(0.024, 10, 8), pupilMat, [ex, 0.54, 0.172], [0, 0, 0], [1, 1, 0.6]);
  }

  // Hooked grey beak.
  add(owl, new THREE.ConeGeometry(0.024, 0.05, 8), beakMat, [0, 0.49, 0.19], [Math.PI / 2, 0, 0]);
  add(owl, new THREE.ConeGeometry(0.014, 0.024, 7), beakMat, [0, 0.462, 0.2], [Math.PI, 0, 0]);
  add(owl, new THREE.SphereGeometry(0.012, 8, 6), beakMat, [0, 0.47, 0.19]);

  // Wings folded along the flanks with layered feathers.
  for (const side of [-1, 1]) {
    const wx = side * 0.125;
    add(owl, new THREE.SphereGeometry(0.05, 14, 10), wingMat, [wx, 0.3, -0.01], [0, 0, side * 0.08], [0.9, 2.2, 1.1]);
    // Primary feather layers hanging down toward the tail.
    for (let i = 0; i < 5; i++) {
      add(
        owl,
        new THREE.SphereGeometry(0.03, 8, 6),
        wingMat,
        [wx + side * 0.005 * i, 0.27 - i * 0.035, -0.03 - i * 0.012],
        [0.08, 0, side * 0.04],
        [0.8, 2.6, 0.35],
      );
    }
  }

  // Tail: a flat fan angled down behind the perch.
  add(owl, new THREE.BoxGeometry(0.12, 0.2, 0.018), wingMat, [0, 0.16, -0.17], [-0.35, 0, 0]);
  add(owl, new THREE.BoxGeometry(0.1, 0.16, 0.014), wingMat, [0, 0.14, -0.2], [-0.5, 0, 0]);

  // Legs: feathered thighs, feathered tarsi, and talons gripping the branch.
  for (const side of [-1, 1]) {
    const lx = side * 0.05;
    add(owl, new THREE.SphereGeometry(0.048, 12, 10), buffMat, [lx, 0.2, 0.02], [0, 0, 0], [1, 1.1, 1]);
    add(owl, new THREE.CylinderGeometry(0.02, 0.024, 0.07, 8), buffMat, [lx, 0.135, 0.03]);
    add(owl, new THREE.SphereGeometry(0.026, 10, 8), buffMat, [lx, 0.112, 0.035], [0, 0, 0], [1.1, 0.7, 1.2]);

    // Foot: three forward toes and one hind toe.
    const foot = new THREE.Group();
    foot.position.set(lx, 0.1, 0.04);
    owl.add(foot);
    const toeAngles = [-0.55, 0, 0.55, Math.PI];
    for (const a of toeAngles) {
      const toe = new THREE.Group();
      toe.rotation.y = a;
      foot.add(toe);
      add(toe, new THREE.CylinderGeometry(0.008, 0.012, 0.03, 6), talonMat, [0, 0.0, 0.03], [Math.PI / 2, 0, 0]);
      add(toe, new THREE.ConeGeometry(0.008, 0.04, 6), talonMat, [0, -0.012, 0.05], [2.72, 0, 0]);
    }
  }

  // Position the owl so its feet rest on the branch top.
  owl.position.set(0, 0, 0);
  // Slight natural lean forward for a relaxed perch.
  owl.rotation.x = -0.06;

  return root;
}
