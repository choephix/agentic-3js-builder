import * as THREE from "three";

export const meta = {
  name: "Koala",
  description: "A stylized sitting koala with a big black nose, round fluffy ears, cream chest and clawed paws, built from primitives."
};

// Seeded random so every run builds the same model
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Subtle speckled fur texture drawn on a canvas
function makeFurTexture(base: string, speck: string): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const rng = makeRng(7);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 900; i++) {
    const x = rng() * 128;
    const y = rng() * 128;
    const len = 3 + rng() * 5;
    const a = rng() * Math.PI;
    ctx.strokeStyle = speck;
    ctx.globalAlpha = 0.18 + rng() * 0.2;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function createKoala(): THREE.Object3D {
  const root = new THREE.Group();

  const furTex = makeFurTexture("#8f9399", "#c4c8cc");

  // One material per colour, shared across meshes
  const furMat = new THREE.MeshStandardMaterial({
    color: 0x8f9399,
    map: furTex ?? undefined,
    roughness: 0.95,
    metalness: 0.0
  });
  const creamMat = new THREE.MeshStandardMaterial({ color: 0xd9d3c4, roughness: 0.9 });
  const innerEarMat = new THREE.MeshStandardMaterial({ color: 0xc2ad98, roughness: 0.9 });
  const noseMat = new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.4 });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.3 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  const clawMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d0, roughness: 0.5 });
  const padMat = new THREE.MeshStandardMaterial({ color: 0x3a3634, roughness: 0.8 });

  const sphere = new THREE.SphereGeometry(1, 18, 14);
  const cyl = new THREE.CylinderGeometry(1, 1, 1, 14, 1);
  const cone = new THREE.ConeGeometry(1, 1, 6, 1);

  function add(
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    pos: [number, number, number],
    scale: [number, number, number],
    rot: [number, number, number] = [0, 0, 0]
  ): THREE.Mesh {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(pos[0], pos[1], pos[2]);
    m.scale.set(scale[0], scale[1], scale[2]);
    m.rotation.set(rot[0], rot[1], rot[2]);
    root.add(m);
    return m;
  }

  // Body: big rounded torso sitting on the ground
  add(sphere, furMat, [0, 0.25, 0], [0.22, 0.25, 0.21]);

  // Cream chest patch
  add(sphere, creamMat, [0, 0.27, 0.13], [0.13, 0.17, 0.07]);

  // Head
  add(sphere, furMat, [0, 0.58, 0.02], [0.165, 0.14, 0.15]);

  // Big round ears with lighter inner disc
  for (const side of [-1, 1]) {
    const ex = side * 0.13;
    add(cyl, furMat, [ex, 0.7, 0.0], [0.07, 0.025, 0.07], [Math.PI / 2, 0, 0]);
    add(cyl, innerEarMat, [ex, 0.7, 0.012], [0.05, 0.03, 0.05], [Math.PI / 2, 0, 0]);
  }

  // Big black nose with a rounded snout
  add(sphere, furMat, [0, 0.52, 0.12], [0.085, 0.065, 0.075]);
  add(sphere, noseMat, [0, 0.545, 0.175], [0.05, 0.036, 0.032]);

  // Eyes with tiny highlights
  for (const side of [-1, 1]) {
    const ex = side * 0.068;
    add(sphere, blackMat, [ex, 0.6, 0.135], [0.022, 0.026, 0.014]);
    add(sphere, whiteMat, [ex + 0.006, 0.61, 0.147], [0.006, 0.006, 0.004]);
  }

  // Arms hugging forward, paws with claws
  for (const side of [-1, 1]) {
    const sx = side * 0.2;
    add(sphere, furMat, [sx, 0.37, 0.06], [0.07, 0.13, 0.065], [0.25, 0, side * -0.2]);
    add(sphere, furMat, [sx + side * 0.01, 0.2, 0.13], [0.06, 0.055, 0.07]);
    // Claws on paw tops
    for (let c = -1; c <= 1; c++) {
      add(cone, clawMat, [sx + side * 0.01 + c * 0.024, 0.16, 0.185], [0.012, 0.035, 0.012], [Math.PI / 2 - 0.3, 0, 0]);
    }
  }

  // Thighs and feet
  for (const side of [-1, 1]) {
    const lx = side * 0.12;
    add(sphere, furMat, [lx, 0.1, 0.1], [0.095, 0.1, 0.12]);
    add(sphere, furMat, [lx, 0.032, 0.2], [0.075, 0.034, 0.1]);
    // Paw pad
    add(sphere, padMat, [lx, 0.034, 0.27], [0.03, 0.02, 0.02]);
  }

  // Tiny tail tuft at the back
  add(sphere, furMat, [0, 0.1, -0.2], [0.03, 0.03, 0.03]);

  return root;
}
