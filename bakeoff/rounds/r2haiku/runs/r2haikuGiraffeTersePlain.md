```ts
import * as THREE from "three";

export const meta = {
  name: "Giraffe",
  description:
    "A stylized giraffe in a neutral standing pose: blocky spotted body, long tapered neck with a dark mane, ossicone horns, and four hoofed legs.",
};

// Small seeded PRNG so every build is identical.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Canvas-drawn coat: tan base with irregular brown patches.
function makeCoatTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext("2d")!;
  g.fillStyle = "#e6bb74";
  g.fillRect(0, 0, size, size);

  const rnd = mulberry32(7);
  for (let i = 0; i < 70; i++) {
    const cx = rnd() * size;
    const cy = rnd() * size;
    const baseR = 9 + rnd() * 12;
    const lobes = 4 + Math.floor(rnd() * 3);
    // Dark outline first, then the brown fill over it for a soft edge.
    g.fillStyle = "#6e4420";
    for (let k = 0; k < lobes; k++) {
      const a = rnd() * Math.PI * 2;
      const d = rnd() * baseR * 0.7;
      g.beginPath();
      g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, baseR * (0.6 + rnd() * 0.5) + 2, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = "#8b5a2b";
    for (let k = 0; k < lobes; k++) {
      const a = rnd() * Math.PI * 2;
      const d = rnd() * baseR * 0.7;
      g.beginPath();
      g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, baseR * (0.6 + rnd() * 0.5), 0, Math.PI * 2);
      g.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export default function createGiraffe(): THREE.Object3D {
  const root = new THREE.Group();

  // Shared materials: one per colour.
  const coatMat = new THREE.MeshStandardMaterial({
    map: makeCoatTexture(),
    roughness: 0.85,
    metalness: 0.0,
  });
  const muzzleMat = new THREE.MeshStandardMaterial({ color: "#d9a25e", roughness: 0.8 });
  const darkMat = new THREE.MeshStandardMaterial({ color: "#4a2e17", roughness: 0.9 });
  const hoofMat = new THREE.MeshStandardMaterial({ color: "#2e2118", roughness: 0.7 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: "#f4efe4", roughness: 0.4 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: "#141010", roughness: 0.3 });

  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    parent: THREE.Object3D,
    pos: [number, number, number] = [0, 0, 0],
    rot: [number, number, number] = [0, 0, 0]
  ) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    parent.add(mesh);
    return mesh;
  };

  // ---- Body: a squat barrel, the high-withers shape is implied by the neck root.
  const body = add(new THREE.SphereGeometry(1, 14, 10), coatMat, root, [0, 2.85, 0]);
  body.scale.set(0.5, 0.52, 0.95);

  // Chest block to give the front a blocky, puppet-like read.
  add(new THREE.BoxGeometry(0.7, 0.9, 0.5), coatMat, root, [0, 2.95, 0.55]);

  // ---- Neck: pivot at the shoulder, tilted forward.
  const neck = new THREE.Group();
  neck.position.set(0, 3.2, 0.6);
  neck.rotation.x = 0.39;
  root.add(neck);

  add(new THREE.CylinderGeometry(0.2, 0.3, 1.84, 8), coatMat, neck, [0, 0.92, 0]);
  // Dark mane running down the back of the neck (local -Z side).
  add(new THREE.BoxGeometry(0.1, 1.7, 0.14), darkMat, neck, [0, 0.9, -0.24]);

  // ---- Head: at the top of the neck, angled slightly nose-down.
  const head = new THREE.Group();
  head.position.set(0, 1.84, 0.05);
  head.rotation.x = -0.3;
  neck.add(head);

  add(new THREE.BoxGeometry(0.36, 0.3, 0.5), coatMat, head, [0, 0.05, 0.1]);
  add(new THREE.BoxGeometry(0.26, 0.22, 0.36), muzzleMat, head, [0, -0.02, 0.5]);
  add(new THREE.BoxGeometry(0.2, 0.12, 0.06), darkMat, head, [0, -0.02, 0.69]); // nostril pad

  // Eyes with a pupil set slightly forward.
  for (const sx of [-1, 1]) {
    add(new THREE.SphereGeometry(0.055, 8, 6), eyeMat, head, [sx * 0.19, 0.11, 0.1]);
    add(new THREE.SphereGeometry(0.03, 6, 5), pupilMat, head, [sx * 0.2, 0.11, 0.14]);
  }

  // Ears: flat blocks sticking out sideways.
  for (const sx of [-1, 1]) {
    add(new THREE.BoxGeometry(0.2, 0.08, 0.11), coatMat, head, [sx * 0.23, 0.14, -0.06], [0, 0, sx * -0.35]);
  }

  // Ossicones: short horns with dark knobs.
  for (const sx of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.03, 0.035, 0.22, 6), darkMat, head, [sx * 0.1, 0.27, -0.02]);
    add(new THREE.SphereGeometry(0.048, 8, 6), darkMat, head, [sx * 0.1, 0.39, -0.02]);
  }

  // ---- Legs: long, slightly tapered, with dark hooves.
  const legX = 0.26;
  const legs: [number, number][] = [
    [-legX, 0.55],  // front left (+X is model-left, so this is right side)
    [legX, 0.55],   // front
    [-legX, -0.5],  // back
    [legX, -0.5],   // back
  ];
  for (const [x, z] of legs) {
    const leg = new THREE.Group();
    leg.position.set(x, 2.4, z);
    root.add(leg);
    add(new THREE.CylinderGeometry(0.12, 0.085, 2.2, 7), coatMat, leg, [0, -1.1, 0]);
    add(new THREE.CylinderGeometry(0.095, 0.1, 0.2, 7), hoofMat, leg, [0, -2.3, 0]);
  }

  // ---- Tail: thin, hanging down and back from the rump, with a dark tuft.
  const tail = new THREE.Group();
  tail.position.set(0, 2.9, -0.9);
  tail.rotation.x = Math.PI + 0.4;
  root.add(tail);
  add(new THREE.CylinderGeometry(0.025, 0.02, 0.9, 5), darkMat, tail, [0, -0.45, 0]);
  add(new THREE.SphereGeometry(0.075, 7, 5), darkMat, tail, [0, -0.95, 0]);

  return root;
}
```